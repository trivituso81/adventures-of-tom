#!/usr/bin/env python3
"""Sandbox proof of concept: Justin 'Stud-Finder Beep & Knock' (pf-justin-bb-basic). Standalone. Touches nothing outside this folder.
One attempt, hard cap $1.00 (ledger.json in this folder counts every call; a rerun reuses files already made and never pays twice).
Steps: 1 start keyframe (end.png is a copy of it) (fal nano-banana edit, hero PNG as reference, flat #00FF00), 2 one Veo 3.1 Lite first-last-frame video,
3 ffmpeg chromakey + despill, transparent WebM trimmed to the action window (no slowdown). Attempt 1 is kept in attempt1/.
Needs env FAL_KEY. Uses tools/art-library/falq.py read only (imported, not changed)."""
import os, sys, json, subprocess, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools', 'art-library'))
import falq
CAP = 3.50   # raised by Tom 2026-11-25: 1.00, 1.25 (14:44), 2.00 (14:46), 2.50 (15:06), 3.25 (15:29), 3.50 (15:39)
IMG, VID = 'fal-ai/nano-banana/edit', 'fal-ai/kling-video/v3/pro/image-to-video'
EST_IMG, EST_VID = 0.0398, 0.45          # EST_VID is a guard figure only; the live fal price is read first and booked if higher
LEDGER = os.path.join(HERE, 'ledger.json')
P = lambda n: os.path.join(HERE, n)

START = ("Keep this exact character from the reference image: same face, hair, beard, build, clothes, tool belt and hand-painted realistic caricature style; he is a tall man, 6 foot 4, slim build. Justin in a neutral idle battle stance: standing relaxed with feet planted flat, body turned three-quarters toward screen-left, facing three-quarters left. Expression: calm, deadpan contractor focus, mouth closed, relaxed eyebrows, no smile, no scowl, no open mouth. In his right hand he holds ONE flat, palm-sized yellow electronic stud finder: a flat rectangular yellow tool with a small screen, no antenna, not a walkie-talkie, held at waist height. ONE steel claw hammer is tucked into his tool belt at his hip. His left hand is empty and relaxed at his side. There is exactly one hammer in the picture and it is in the belt, not in either hand. 16:9 landscape frame, fixed camera: his full body from boots to hair fills about 55 percent of the frame height, centered horizontally, boots 12 percent above the bottom edge, wide margin of empty green on all four sides, nothing cropped. Background is one solid flat pure #00FF00 green, no floor, no ground shadow, no gradient. No glowing, no beams, no rings, no sparks, no effects.")
MOTION = ("2D hand-painted storybook gouache and ink RPG battle sprite animation, single character full-body framing, facing three-quarters left for the entire clip, strictly locked static tripod camera, isolated on a completely flat solid chroma-key green (#00FF00) background with zero ground shadows and zero scenery, crisp consistent linework, earnest straight-faced dramatic commitment, clean return to idle battle stance on final frames. Justin starts in his neutral idle battle stance with calm, deadpan contractor focus. He stays facing three-quarters left for the entire clip and never turns toward the right. He holds the flat yellow stud finder up in his right hand briefly, then draws the single claw hammer from his tool belt and gives one clean tap forward and to the left, away from his body, into empty air, then tucks the hammer back into his belt and returns to his exact starting idle stance and holds still. The stud finder stays in his right hand and is never struck. Strictly locked static camera, zero scale drift, Justin stays the same size, pure solid flat #00FF00 green background, no floor shadow. No glowing bursts, no rings, no sparks, no comic stars, no visual effects of any kind.")
NEG = ("camera pan, camera zoom, camera shake, rotating camera, multiple characters, enemy monster in frame, background scenery, grass, trees, shadows on backdrop, speech bubbles, text overlays, UI bars, giant vehicles, explosions, magic beams, rubber-hose stretch, squash-and-stretch cartoon physics, winking at camera, 3D CGI render, photorealistic photography, blurry limbs, extra fingers, morphed props, bipedal standing dog, anime speedlines, turning right, facing right, turning around, hitting the stud finder, smashing the stud finder, prop morphing, floating white rings, target circles, reticles, glowing bursts, glowing beams, sparks, comic stars, floating objects, glow effects, ground shadow, floor shadow, duplicate hammers, hand-swapping props, shouting, angry face, face changes, character shrinking, character growing, camera movement")

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
    if os.environ.get('STAGE') == 'end': say('stage end only: stopping before the video, spent $%.4f' % spent()); return
    if not os.path.exists(P('raw.mp4')):
        guard(EST_VID); say('making video (Kling v3 Pro image-to-video, 3 s, start image only)')
        live = fal.price(VID); est = falq.apply_live(EST_VID if not live else 0, live, 'video', 3) or EST_VID
        say('fal live price:', live, '-> booking', est)
        if spent() + est > CAP: sys.exit('STOP: live price too high for the cap')
        body = {'prompt': MOTION, 'negative_prompt': NEG, 'start_image_url': falq.data_uri(open(P('start.png'), 'rb').read()),
                'duration': '3', 'generate_audio': False}
        res = fal.wait(fal.send(VID, body))
        open(P('raw.mp4'), 'wb').write(fal.download(res['video']['url'])); book('raw.mp4', est)
    if os.environ.get('STAGE') == 'raw': say('stage raw: stopping after the raw video, spent $%.4f' % spent()); return
    import numpy as np
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', P('raw.mp4'), '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True)
    fr = np.frombuffer(r.stdout, np.uint8).reshape(-1, 90, 160).astype(float)
    fps = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', P('raw.mp4')],
                               capture_output=True, text=True).stdout.split('/')[0].split()[0] or 24)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)); mv = np.where(d > max(0.15, d.max() * 0.12))[0]
    t0 = max(0.0, (mv[0] - 3) / fps) if len(mv) else 0.0
    t1 = min(len(fr) / fps, t0 + 2.7)   # Tom: trim to about 2.7 s (the manifest duration)
    say('action window %.2f s to %.2f s of %.2f s (no slowdown)' % (t0, t1, len(fr) / fps))
    open(P('window.json'), 'w').write(json.dumps({'start': round(t0, 3), 'end': round(t1, 3), 'fps': fps}))
    vf = 'chromakey=0x00FF00:0.30:0.12,despill=type=green:mix=0.6:expand=0.2,format=yuva420p'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t0), '-to', str(t1), '-i', P('raw.mp4'), '-an', '-vf', vf, '-c:v', 'libvpx-vp9',
                    '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', P('justin-bb-basic-alpha.webm')], check=True)
    say('done, spent $%.4f' % spent())

if __name__ == '__main__':
    main()
