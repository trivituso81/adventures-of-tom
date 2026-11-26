#!/usr/bin/env python3
"""Sandbox 2: Justin 'Stud-Finder Beep & Knock' from his CANONICAL battle sprite (art/chars/justin-battle.webp, frame 0, composed onto flat #00FF00 in canvas.png,
no AI touching his body). Stage start: fal nano-banana edit adds ONLY a flat palm-sized yellow stud finder -> start.png. Stage raw: Kling v3 Pro image-to-video,
start image only, manifest prompt -> raw.mp4. Keying and trim are done after inspection with key.py. Own ledger, cap below. Needs env FAL_KEY."""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools', 'art-library'))
import falq
CAP = 2.00
IMG, VID = 'fal-ai/nano-banana/edit', 'fal-ai/kling-video/v3/pro/image-to-video'
DUR = 5
LEDGER = os.path.join(HERE, 'ledger.json'); P = lambda n: os.path.join(HERE, n)
START = ("Edit this image with the smallest possible change. Keep Justin EXACTLY as he is: same face, same expression, same head size and proportions, same hair, shirt, jeans, boots, tool belt, "
         "same pose, same painting style, same position and size in the frame, same flat pure #00FF00 green background. Only add ONE flat, palm-sized yellow electronic stud finder "
         "(a flat rectangular yellow tool with a small screen, no antenna, not a walkie-talkie) held in his right hand, which is the hand on the left side of the image, at waist height. "
         "Change nothing else. No glow, no effects, no shadow.")
MOTION = ("2D hand-painted storybook gouache and ink RPG battle sprite animation, single character full-body framing, facing three-quarters left, strictly locked static tripod camera, isolated on a completely flat solid chroma-key green (#00FF00) background with zero ground shadows and zero scenery, crisp consistent linework, earnest straight-faced dramatic commitment, clean return to idle battle stance on final frames. [Clip: justin-bb-basic | 2.7s | 65 frames @ 24fps] Justin steps forward in-place gliding a yellow electronic stud finder smoothly left-to-right until pausing at a spot, swiftly draws a framing hammer from his belt for one crisp deadpan knock left, tucks the hammer back, and steps to idle. Justin stays facing three-quarters left for the whole clip and never turns right. Strictly locked camera, same size throughout, flat pure green background, no visual effects.")
NEG = ("camera pan, camera zoom, camera shake, rotating camera, multiple characters, enemy monster in frame, background scenery, grass, trees, shadows on backdrop, speech bubbles, text overlays, UI bars, giant vehicles, explosions, magic beams, rubber-hose stretch, squash-and-stretch cartoon physics, winking at camera, 3D CGI render, photorealistic photography, blurry limbs, extra fingers, morphed props, bipedal standing dog, anime speedlines, turning right, hitting the stud finder, prop morphing, rings, sparks, comic stars, glowing effects, floor shadow")
def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def spent():
    try: return sum(r['usd'] for r in json.load(open(LEDGER)))
    except Exception: return 0.0
def book(what, usd):
    L = json.load(open(LEDGER)) if os.path.exists(LEDGER) else []
    L.append({'what': what, 'usd': round(usd, 4), 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}); json.dump(L, open(LEDGER, 'w'), indent=1)
def main():
    key = os.environ.get('FAL_KEY') or sys.exit('FAL_KEY missing'); stage = os.environ.get('STAGE', 'start')
    fal = falq.Fal(key, 'https://queue.fal.run', 'https://api.fal.ai')
    if not os.path.exists(P('start.png')):
        if spent() + 0.04 > CAP: sys.exit('STOP: cap')
        say('making start.png from the canonical canvas')
        res = fal.wait(fal.send(IMG, {'prompt': START, 'image_urls': [falq.data_uri(open(P('canvas.png'), 'rb').read())], 'num_images': 1, 'output_format': 'png', 'aspect_ratio': '16:9'}))
        open(P('start.png'), 'wb').write(fal.download(falq.image_url(res))); book('start.png', 0.0398)
    if stage == 'start': say('stage start done, spent $%.4f' % spent()); return
    if not os.path.exists(P('raw.mp4')):
        live = fal.price(VID); est = falq.apply_live(0, live, 'video', DUR) or 0.7; say('fal live price', live, 'booking', est)
        if spent() + est > CAP: sys.exit('STOP: cap')
        body = {'prompt': MOTION, 'negative_prompt': NEG, 'start_image_url': falq.data_uri(open(P('start.png'), 'rb').read()), 'duration': str(DUR), 'generate_audio': False}
        res = fal.wait(fal.send(VID, body)); open(P('raw.mp4'), 'wb').write(fal.download(res['video']['url'])); book('raw.mp4', est)
    say('done, spent $%.4f' % spent())
if __name__ == '__main__': main()
