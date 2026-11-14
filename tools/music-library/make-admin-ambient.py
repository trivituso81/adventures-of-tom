#!/usr/bin/env python3
"""Synthesizes music/admin.mp3, the calm track that plays on every admin screen.

Tom 2026-11-14: music for any admin screen that is "soft, gentle, relaxing, sort of just giving the feeling of
expansiveness and just calming". This is a loop built by hand (no ElevenLabs key in the sandbox): slow sustained
chords, a deep warm drone, a few soft high bells and a little breath of air, all inside a long hall reverb.
Every oscillator frequency is a whole number of cycles per loop and the reverb is circular, so the loop is
seamless by construction. Tom can still re-make it in the Music Library (prompt in tools/music-library/tracks.json);
his take then plays instead.

  python3 -I tools/music-library/make-admin-ambient.py            (from the repo root; needs numpy and ffmpeg)
Writes music/admin.mp3 (96 kbps stereo, about -20 LUFS like the other tracks). Then run make-manifest.py and make-index.js.
"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np

SR = 44100
T = 96.0                                   # loop length in seconds
N = int(SR * T)
rng = np.random.default_rng(1114)
t = np.arange(N) / SR

def q(f):                                  # snap a frequency to a whole number of cycles per loop
    return round(f * T) / T

def hz(n):                                 # MIDI note to Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def win(center, width):
    """Periodic raised-cosine envelope centred at `center` seconds, `width` seconds wide at the base."""
    d = (t - center + T / 2) % T - T / 2
    x = np.clip(d / (width / 2), -1, 1)
    return 0.5 * (1 + np.cos(np.pi * x))

def lfo(period, phase=0.0):
    return np.sin(2 * np.pi * (t / period) + phase)

def voice(freq, pan, amp, harm=(1.0, 0.35, 0.12, 0.05)):
    """A soft sustained note: a few detuned, softly rolled-off partials, a slow swell, panned."""
    out = np.zeros(N)
    for dt in (-0.9, 0.0, 0.8):            # cents-ish detune
        f0 = freq * 2 ** (dt / 1200)
        for k, a in enumerate(harm, start=1):
            out += a * np.sin(2 * np.pi * q(f0 * k) * t + rng.uniform(0, 6.28))
    out *= amp * (0.8 + 0.2 * lfo(rng.choice([12.0, 16.0, 24.0, 32.0]), rng.uniform(0, 6.28)))
    l = out * np.sqrt(0.5 * (1 - pan))
    r = out * np.sqrt(0.5 * (1 + pan))
    return l, r

L = np.zeros(N); R = np.zeros(N)

# ---- chords: D add9 -> G maj7 -> B min9 -> A add9, 24 s each, each note swells in and out over about 40 s ----
chords = [
    [38, 50, 57, 62, 64, 69],              # D: D2 D3 A3 D4 E4 A4
    [31, 43, 50, 59, 62, 66],              # G maj7(#11): G1 G2 D3 B3 D4 F#4
    [35, 47, 54, 61, 62, 66],              # B min9: B1 B2 F#3 C#4 D4 F#4
    [33, 45, 52, 59, 61, 64],              # A add9: A1 A2 E3 B3 C#4 E4
]
slot = T / len(chords)
for i, ch in enumerate(chords):
    center = slot * (i + 0.5)
    for j, n in enumerate(ch):
        pan = np.clip(rng.uniform(-0.75, 0.75), -0.8, 0.8)
        l, r = voice(hz(n), pan, amp=0.10 if n < 45 else 0.075)
        e = win(center + rng.uniform(-1.5, 1.5), slot * 1.9)
        L += l * e; R += r * e

# ---- a very low, constant drone on D so the harmony always rests on something ----
for f, a in ((hz(26), 0.10), (hz(38), 0.06)):
    d = np.sin(2 * np.pi * q(f) * t) * a * (0.85 + 0.15 * lfo(48.0))
    L += d; R += d

# ---- air: noise shaped in the frequency domain (so it is periodic), a slow swell ----
spec = np.fft.rfft(rng.standard_normal(N))
fr = np.fft.rfftfreq(N, 1 / SR)
shape = np.exp(-((np.log(np.maximum(fr, 1) / 900.0)) ** 2) / (2 * 0.9 ** 2))
for ch_i, buf in enumerate((L, R)):
    air = np.fft.irfft(spec * shape * (1 if ch_i == 0 else np.exp(1j * rng.uniform(0, 6.28, len(fr)))), N)
    air /= np.max(np.abs(air)) + 1e-9
    buf += air * 0.035 * (0.6 + 0.4 * lfo(32.0, 1.0 + ch_i))

# ---- a few soft bells, high and far apart (D major pentatonic), decaying over about five seconds ----
bell_notes = [81, 83, 85, 88, 90, 93]      # A5 B5 C#6 E6 F#6 A6
times = np.sort(rng.uniform(2, T - 2, 11))
for k, tm in enumerate(times):
    n = bell_notes[rng.integers(0, len(bell_notes))]
    d = (t - tm) % T                       # wraps, so a bell near the end rings into the start
    env = np.where(d < 7.0, np.exp(-d / 1.7) * np.minimum(1, d / 0.04), 0.0)
    tone = np.sin(2 * np.pi * q(hz(n)) * t) + 0.25 * np.sin(2 * np.pi * q(hz(n) * 2.01) * t)
    pan = rng.uniform(-0.9, 0.9)
    b = tone * env * 0.028
    L += b * np.sqrt(0.5 * (1 - pan)); R += b * np.sqrt(0.5 * (1 + pan))

# ---- hall reverb: stereo decorrelated noise tail, circular convolution (keeps the loop seamless) ----
def ir(seed, secs=7.0):
    g = np.random.default_rng(seed)
    n = int(SR * secs)
    x = g.standard_normal(n) * np.exp(-np.arange(n) / SR / 1.9)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X *= 1 / (1 + (f / 4200.0) ** 2)       # darker tail, soft
    x = np.fft.irfft(X, n)
    x[: int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))
    return x / np.sqrt(np.sum(x ** 2))

def circ(sig, h):
    H = np.zeros(N); H[: len(h)] = h
    return np.fft.irfft(np.fft.rfft(sig) * np.fft.rfft(H), N)

wetL = circ(L, ir(11)); wetR = circ(R, ir(12))
wL = 0.35 * L + 1.55 * wetL
wR = 0.35 * R + 1.55 * wetR

# ---- master: soft top end, gentle slow breathing, no clipping ----
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** 4), len(x))
wL = lowpass(wL, 6500); wR = lowpass(wR, 6500)
peak = max(np.max(np.abs(wL)), np.max(np.abs(wR)))
wL, wR = wL / peak * 0.8, wR / peak * 0.8

pcm = (np.stack([wL, wR], axis=1) * 32767).astype('<i2')
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
out_mp3 = os.path.join(root, 'music', 'admin.mp3')
with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, 'a.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    target = 'I=-20:TP=-1.5:LRA=7'
    p = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', 'loudnorm=' + target + ':print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = json.loads(re.search(r'\{[^{}]*"input_i".*?\}', p.stderr, re.S).group(0))
    af = ('loudnorm=%s:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true'
          % (target, m['input_i'], m['input_tp'], m['input_lra'], m['input_thresh'], m['target_offset']))
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', wav, '-af', af, '-ar', '44100', '-ac', '2',
                    '-c:a', 'libmp3lame', '-b:a', '96k', out_mp3], check=True)
print('wrote', out_mp3, os.path.getsize(out_mp3), 'bytes; input', m['input_i'], 'LUFS')
