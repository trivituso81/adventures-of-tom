#!/usr/bin/env python3
"""Dialogue faces for the three LINE_POSES frames (c-reports, 2026-11-19; data/line-poses.js): Deedee with her glasses on her head, Deedee holding the burnt
flashbulb, Rose holding it up. Each frame is one figure of a strip in art/story/ (report_singles.py) drawn at that person's mood scale, so its face is cut with
the SAME method and zoom as the mood faces (bake_emotion_faces.py), which makes it the same size as that person's other faces.
Output portraits/talk/pose/<id>-<face>.webp (256 x 256), the file engine/emotions.js reads for a line in data/line-poses.js.
    python3 tools/sprite-bake/bake_report_faces.py        CHECK=/tmp/rf.png  writes a contact sheet (the person's happy face first, then the new faces)
"""
import os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bake_emotion_faces as BE

ROOT = BE.ROOT
STRIPS = {'deedee': ('deedeech1', ['glasses', 'bulb']), 'rose': ('rosech3', ['bulb'])}
BE.OUT = os.path.join(ROOT, 'portraits', 'talk', 'pose')
ALL = sorted({m for _, (_, ms) in STRIPS.items() for m in ms})
BE.MOODS = ALL
BE.MOOD_DY = dict(BE.MOOD_DY, **{m: float(os.environ.get('DY', '0')) for m in ALL})
_cur = {}

def frames(pid):
    name, ms = STRIPS[pid]
    sh = Image.open(os.path.join(ROOT, 'art', 'story', name + '.webp')).convert('RGBA'); fw = sh.width // len(ms)
    return [sh.crop((i * fw, 0, (i + 1) * fw, sh.height)) for i in range(len(ms))]
BE.frames = frames

# Rose holds the bulb ABOVE her head, so the frame's top row is the bulb, not her hair. Her head is read by eye on the baked frame (art/story/rosech3.webp, 242 x 645):
# hair top row 172, chin row 272, head centre column 107. Every other frame uses the mood faces' own reading.
_fs = BE.frame_square
def frame_square(f, x0, y0, s):
    if f.size == (242, 645): return 172, 272, 107
    return _fs(f, x0, y0, s)
BE.frame_square = frame_square

def main():
    rows = []
    for pid, (name, ms) in STRIPS.items():
        BE.MOODS = ms
        outs = BE.bake(pid)
        happy = Image.open(os.path.join(ROOT, 'portraits', 'emo', pid + '-happy.webp')).convert('RGB')
        rows.append([happy] + outs); print('baked', pid, ms)
    chk = os.environ.get('CHECK')
    if chk:
        w = 200; sheet = Image.new('RGB', (w * 3, w * len(rows)), 'white')
        for r, row in enumerate(rows):
            for i, c in enumerate(row): sheet.paste(c.resize((w, w), Image.LANCZOS), (i * w, r * w))
        sheet.save(chk); print('wrote', chk)

if __name__ == '__main__':
    main()
