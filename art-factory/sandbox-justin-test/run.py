#!/usr/bin/env python3
"""Sandbox proof of concept: Justin 'Stud-Finder Beep & Knock' (pf-justin-bb-basic). Standalone. Touches nothing outside this folder.
One attempt, hard cap $1.00 (ledger.json in this folder counts every call; a rerun reuses files already made and never pays twice).
Steps: 1 two keyframes (fal nano-banana edit, hero PNG as reference, flat #00FF00), 2 one Veo 3.1 Lite first-last-frame video,
3 ffmpeg chromakey + despill, transparent WebM trimmed to the action window (no slowdown). Attempt 1 is kept in attempt1/.
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

LOOK = ("Keep this exact character from the reference image: same face, hair, beard, build, clothes, tool belt and hand-painted realistic caricature style. "
        "16:9 landscape frame. Fixed camera: Justin's full body from boots to hair fills only about 55 percent of the frame height, centered horizontally, "
        "with his boots resting at the same spot 12 percent above the bottom edge, so there is a wide margin of empty green on all four sides and nothing is cropped. "
        "Background is one solid flat pure #00FF00 green, no floor, no shadow, no gradient, no other objects. Facing screen-left in side view, feet planted flat and still. "
        "In his off-hand (the hand nearest the camera) he holds an oversized bright yellow electronic stud finder with a small flashing red LED, clearly visible. "
        "In his striking hand he grips a heavy steel claw hammer.")
START = ("Windup pose: Justin leans back in one bold anticipation, the claw hammer raised high overhead in his striking hand, the bright yellow stud finder "
         "held out in front of him in his off-hand. " + LOOK)
END = ("Peak pose, same camera, same size, same boots position as the reference: Justin leans forward toward screen-left having just driven one huge hammer slam, "
       "the steel claw hammer swung down to horizontal pointing straight screen-left at chest height, the bright yellow stud finder with its red LED thrust forward "
       "in his off-hand and clearly visible. " + LOOK)
MOTION = ("Locked static camera, flat solid green background throughout, no cuts, no zoom, no pan. Justin stays on the same spot with his feet planted, facing screen-left, "
          "and keeps the same size in frame. He holds the bright yellow stud finder in his off-hand and the steel claw hammer in his striking hand, both gripped the whole time, "
          "and the stud finder stays visible. He leans back with the hammer raised overhead, then drives the hammer in one single overhead-to-horizontal slam toward screen-left "
          "while thrusting the stud finder forward, then holds the final pose. One hammer slam only, no punching, no extra swings. Face, clothes and painted style stay identical. Silent.")
NEG = "camera movement, zoom, punching, boxing, extra swings, repeated strikes, dropping the stud finder, walking, character shrinking, cropping, text, other characters"

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
        res = fal.wait(fal.send(IMG, {'prompt': prompt, 'image_urls': refs, 'num_images': 1, 'output_format': 'png', 'aspect_ratio': '16:9'}))
        open(P(name), 'wb').write(fal.download(falq.image_url(res))); book(name, EST_IMG)
    keyframe('start.png', START, [hero])
    keyframe('end.png', END, [hero, falq.data_uri(open(P('start.png'), 'rb').read())])
    if not os.path.exists(P('raw.mp4')):
        guard(EST_VID); say('making video (Veo 3.1 Lite first-last-frame, 4 s)')
        body = {'prompt': MOTION, 'first_frame_url': falq.data_uri(open(P('start.png'), 'rb').read()),
                'last_frame_url': falq.data_uri(open(P('end.png'), 'rb').read()),
                'negative_prompt': NEG, 'duration': '4s', 'aspect_ratio': '16:9', 'resolution': '720p', 'generate_audio': False}
        res = fal.wait(fal.send(VID, body))
        open(P('raw.mp4'), 'wb').write(fal.download(res['video']['url'])); book('raw.mp4', EST_VID)
    import numpy as np
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', P('raw.mp4'), '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True)
    fr = np.frombuffer(r.stdout, np.uint8).reshape(-1, 90, 160).astype(float)
    fps = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', P('raw.mp4')],
                               capture_output=True, text=True).stdout.split('/')[0].split()[0] or 24)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)); mv = np.where(d > max(0.15, d.max() * 0.12))[0]
    t0 = max(0.0, (mv[0] - 3) / fps) if len(mv) else 0.0
    t1 = min(len(fr) / fps, (mv[-1] + 1) / fps + 0.4) if len(mv) else len(fr) / fps
    say('action window %.2f s to %.2f s of %.2f s (no slowdown)' % (t0, t1, len(fr) / fps))
    open(P('window.json'), 'w').write(json.dumps({'start': round(t0, 3), 'end': round(t1, 3), 'fps': fps}))
    vf = 'chromakey=0x00FF00:0.30:0.12,despill=type=green:mix=0.6:expand=0.2,format=yuva420p'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t0), '-to', str(t1), '-i', P('raw.mp4'), '-an', '-vf', vf, '-c:v', 'libvpx-vp9',
                    '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', P('justin-bb-basic-alpha.webm')], check=True)
    say('done, spent $%.4f' % spent())

if __name__ == '__main__':
    main()
