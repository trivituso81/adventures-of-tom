#!/usr/bin/env python3
"""fix-gracevoice-distort test (python3 tools/grace_voice_test.py [outdir]). Prints FAILS: [].
1. No merge tool carries the old Grace filter (asetrate on a fixed rate slowed 44.1 kHz takes 38 percent and lowered them 5 semitones).
2. merge-local.js on a made-up 44.1 kHz Grace dialogue take: the merged clip keeps the take's length and pitch.
3. The five chapter 1 Grace lines Tom reported are no longer the slowed copies (their old fingerprints are gone).
4. voices.html: with data/takes-wanted.json naming d|grace|, Send my takes counts a Grace line tried once, not a Rose line tried once.
Portrait and landscape shots of the Voice Library go to outdir."""
import base64, glob, hashlib, json, os, re, subprocess, sys, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/gracevoice'; os.makedirs(out, exist_ok=True)
fails = []

# 1
for f in ['tools/voice-library/merge-local.js', 'tools/clip-audit/merge.py', 'tools/voice-library/speedup-voice.py', 'tools/voice-recast/merge-voice.js']:
    if 'asetrate' in open(os.path.join(ROOT, f), encoding='utf8').read(): fails.append('asetrate still in ' + f)


def probe(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    import numpy as np
    x = np.frombuffer(pcm, np.int16).astype(float)
    sp = np.abs(np.fft.rfft(x * np.hanning(len(x))))
    return len(x) / 16000, float(np.argmax(sp[80:]) + 80) * 16000 / len(x)

# 2: a 3 s 300 Hz tone at 44.1 kHz, 128 kbps, like an ElevenLabs take
d = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=300:duration=3:sample_rate=44100', '-af', 'volume=0.5',
                '-c:a', 'libmp3lame', '-b:a', '128k', d + '/in.mp3'], check=True)
mp3 = base64.b64encode(open(d + '/in.mp3', 'rb').read()).decode()
key_text = "Number three. Rose licked a muffin."
json.dump({'made': 'test', 'clips': [{'kind': 'dialog', 'voice': 'grace', 'text': key_text, 'mp3': mp3, 'script': '(recording)', 't': 1}]}, open(d + '/exp.json', 'w'))
r = subprocess.run(['node', os.path.join(ROOT, 'tools/voice-library/merge-local.js'), d + '/exp.json', os.path.join(ROOT, 'data'), d + '/out'], capture_output=True, text=True)
if r.returncode: fails.append('merge-local failed: ' + r.stderr[-300:])
else:
    s = open(d + '/out/data/voice/dialog-ch1.js', encoding='utf8').read()
    m = re.search(r'"grace\|' + re.escape(key_text) + r'":"([^"]+)"', s)
    if not m: fails.append('merged clip not found')
    else:
        open(d + '/o.mp3', 'wb').write(base64.b64decode(m.group(1)))
        dur, hz = probe(d + '/o.mp3'); dur0, hz0 = probe(d + '/in.mp3')
        if abs(dur - dur0) > 0.15: fails.append('merged length %.2f s, take %.2f s' % (dur, dur0))
        if abs(hz - hz0) > 6: fails.append('merged pitch %.0f Hz, take %.0f Hz' % (hz, hz0))
        print('merge-local: take %.2f s %.0f Hz -> clip %.2f s %.0f Hz' % (dur0, hz0, dur, hz))

# 3: sha1 prefixes of the slowed copies that were in the game before this fix
OLD = {"Tata, don't walk yet.": 'f1a4a6', 'It did not eat a boat.': '95dd80', 'Number two. Deedee made': 'a7a510',
       'Number three. Rose licked': '14b44e', 'You are slow.': '3bc9f6'}
s = open(os.path.join(ROOT, 'data/voice/dialog-ch1.js'), encoding='utf8').read()
for start, old in OLD.items():
    m = re.search(r'"grace\|' + re.escape(start) + r'[^"]*":"([^"]+)"', s)
    if not m: fails.append('no clip for ' + start)
    elif hashlib.sha1(m.group(1).encode()).hexdigest().startswith(old): fails.append('still the slowed copy: ' + start)

# 4
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8097'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for name, vp in [('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 844, 'height': 390})]:
            pg = br.new_context(viewport=vp).new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('http://127.0.0.1:8097/voices.html'); pg.wait_for_timeout(1500)
            pg.evaluate("""() => new Promise(res => { const r = indexedDB.open('aot-voice-library', 1);
              r.onupgradeneeded = () => { try { r.result.createObjectStore('takes', {keyPath: 'id'}); } catch (e) {} };
              r.onsuccess = () => { const tx = r.result.transaction('takes', 'readwrite'), s = tx.objectStore('takes');
                s.put({id: 'tg1', line: "d|grace|Number three. Rose licked a muffin.", mp3: 'AAAA', label: 'new take', script: 'x', t: 1});
                s.put({id: 'tr1', line: "d|rose|A hundred MILLION years!", mp3: 'AAAA', label: 'new take', script: 'x', t: 2});
                tx.oncomplete = () => { r.result.close(); res(); }; }; })""")
            pg.reload(); pg.wait_for_timeout(3500)
            ids = pg.evaluate("() => takesToSend().map(t => t.id)")
            label = pg.evaluate("() => document.getElementById('sendtakes').textContent")
            if ids != ['tg1']: fails.append('%s: takesToSend %s' % (name, ids))
            if '(1 waiting)' not in label: fails.append('%s: button says %r' % (name, label))
            pg.evaluate("() => document.getElementById('sendtakes').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(out, 'voices-send-%s.png' % name))
            if errs: fails.append('%s page errors %s' % (name, errs[:2]))
        br.close()
finally:
    srv.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
