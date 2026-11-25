#!/usr/bin/env python3
"""Sandbox proof of concept: Justin 'Stud-Finder Beep & Knock' (pf-justin-bb-basic). Standalone. Touches nothing outside this folder.
One attempt, hard cap $1.00 (ledger.json in this folder counts every call; a rerun reuses files already made and never pays twice).
Steps: 1 two keyframes (fal nano-banana edit, hero PNG as reference, flat #00FF00), 2 one Veo 3.1 Lite first-last-frame video,
3 ffmpeg chromakey + despill, transparent WebM at 1.5x duration (slowed), preview.html.
Needs env FAL_KEY. Uses tools/art-library/falq.py read only (imported, not changed)."""
import os, sys, json, subprocess, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools', 'art-library'))
import falq
CAP = 1.00
IMG, VID = 'fal-ai/nano-banana/edit', 'fal-ai/veo3.1/lite/first-last-frame-to-video'
EST_IMG, EST_VID = 0.0398, 0.05 * 4          # 4 s is Veo Lite's shortest length (allowed: 4s, 6s, 8s); audio off
LEDGER = os.path.join(HERE, 'ledger.json')
P = lambda n: os.path.join(HERE, n)

LOOK = ("Keep this exact character from the reference image: same face, hair, glasses or beard if any, build, clothes and hand-painted realistic "
        "caricature style, same proportions. Full body in frame, head to feet, centered. Background is one solid flat pure #00FF00 green, no floor, "
        "no shadow, no gradient, no other objects. Facing left in side view, feet planted flat on the ground.")
START = ("Justin facing left, feet planted. He holds a bright yellow stud-finder (small handheld electronic device) in his front hand at chest height "
         "and draws his other arm back, fist cocked, ready to strike. " + LOOK)
END = ("Justin facing left, feet planted. He lunges forward at full extension, striking and knocking to the left with his punching arm fully "
       "extended with clear follow-through, the bright yellow stud-finder still visible in his other hand. " + LOOK)
MOTION = ("Locked camera, flat solid green background throughout, no cuts. Justin stays on the same spot, feet planted, facing left. He holds the "
          "bright yellow stud-finder, draws his other arm back, then lunges forward once, striking left with a full follow-through, and holds the "
          "final pose. The character's face, clothes and painted style stay identical. Silent.")

def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def spent():
    try: return sum(r['usd'] for r in json.load(open(LEDGER)))
    except Exception: return 0.0
def book(what, usd):
    L = json.load(open(LEDGER)) if os.path.exists(LEDGER) else []
    L.append({'what': what, 'usd': round(usd, 4), 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})
    json.dump(L, open(LEDGER, 'w'), indent=1)
def guard(est):
    if spent() + est > CAP: sys.exit('STOP: %.4f spent + %.4f would pass the $%.2f cap' % (spent(), est, CAP))

def main():
    key = os.environ.get('FAL_KEY') or sys.exit('FAL_KEY missing')
    fal = falq.Fal(key, 'https://queue.fal.run', 'https://api.fal.ai')
    hero = falq.data_uri(open(P('hero.png'), 'rb').read())
    def keyframe(name, prompt, refs):
        if os.path.exists(P(name)): say(name, 'already made, reused'); return
        guard(EST_IMG); say('making', name)
        res = fal.wait(fal.send(IMG, {'prompt': prompt, 'image_urls': refs, 'num_images': 1, 'output_format': 'png'}))
        open(P(name), 'wb').write(fal.download(falq.image_url(res))); book(name, EST_IMG)
    keyframe('start.png', START, [hero])
    keyframe('end.png', END, [hero, falq.data_uri(open(P('start.png'), 'rb').read())])
    if not os.path.exists(P('raw.mp4')):
        guard(EST_VID); say('making video (Veo 3.1 Lite first-last-frame, 4 s)')
        body = {'prompt': MOTION, 'first_frame_url': falq.data_uri(open(P('start.png'), 'rb').read()),
                'last_frame_url': falq.data_uri(open(P('end.png'), 'rb').read()),
                'duration': '4s', 'aspect_ratio': '9:16', 'resolution': '720p', 'generate_audio': False}
        res = fal.wait(fal.send(VID, body))
        open(P('raw.mp4'), 'wb').write(fal.download(res['video']['url'])); book('raw.mp4', EST_VID)
    say('chromakey, despill, 1.5x length')
    vf = ('chromakey=0x00FF00:0.24:0.10,despill=type=green:mix=0.6:expand=0.2,format=yuva420p,setpts=1.5*PTS')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', P('raw.mp4'), '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
                    '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', P('justin-bb-basic-alpha.webm')], check=True)
    say('done, spent $%.4f' % spent())

if __name__ == '__main__':
    main()
