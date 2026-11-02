#!/usr/bin/env python3
"""Height chart reference image for the art restyle (Phase C step 1).
Neutral grey silhouettes at REAL heights on one baseline, with a ruler.
Attached to every character, NPC and monster sheet prompt next to the style key.
Output: docs/reference/height_chart_v1.png (1536 x 1024).
Head shares follow docs/CHARACTER_PIPELINE.md section 7 (approved key): adults .215, Grace .25.
ASSUMPTIONS (change here, rerun): Rose .27 (no approved Rose pose yet), Mudling 16 in and
head share .45 (knee high, from the key's intent). Olivia is left off (real height not on record).
Run: python3 tools/make_height_chart.py
"""
from PIL import Image, ImageDraw, ImageFont
import os
W, H, S = 1536, 1024, 3            # S = supersample
BASE = 900                         # baseline y
PPI = 9.2                          # px per inch
CAST = [  # name, inches, head share, kind
 ("Justin 6'4\"", 76, .215, 'adult'), ("Tom 5'11\"", 71, .215, 'adult'),
 ("TNB 5'10\"", 70, .215, 'adult'), ("Boppy 5'7\"", 67, .215, 'adult'),
 ("Amy 5'5\"", 65, .215, 'adult'), ("Deedee 5'5\"", 65, .215, 'adult'),
 ("Grace 4'2\"", 50, .25, 'kid'), ("Rose 3'4\"", 40, .27, 'kid'),
 ("Mudling 16\"", 16, .45, 'blob'),
]
GREY = (92, 98, 110); LINE = (200, 204, 212)
img = Image.new('RGB', (W*S, H*S), (244, 242, 236)); d = ImageDraw.Draw(img)
def P(v): return int(v*S)
def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',):
        if os.path.exists(f): return ImageFont.truetype(f, P(sz))
    return ImageFont.load_default()
# ruler lines every foot
for ft in range(0, 8):
    y = BASE - ft*12*PPI
    d.line([P(60), P(y), P(W-40), P(y)], fill=LINE, width=P(1.5))
    d.text((P(14), P(y-9)), f"{ft} ft", fill=(120,124,132), font=font(16))
d.line([P(60), P(BASE), P(W-40), P(BASE)], fill=(60,60,66), width=P(3))
x = 160; gap = 150
def figure(cx, inches, hs, kind):
    h = inches*PPI; top = BASE - h
    if kind == 'blob':
        w = h*1.15
        d.ellipse([P(cx-w/2), P(top), P(cx+w/2), P(BASE)], fill=GREY); return
    hh = h*hs; hw = hh*.40            # head half width
    sh = h*(.115 if kind=='adult' else .13)   # shoulder half width
    # legs
    legtop = BASE - h*.47
    lw = sh*.42
    for dx in (-sh*.36, sh*.36):
        d.rounded_rectangle([P(cx+dx-lw/2), P(legtop), P(cx+dx+lw/2), P(BASE)], radius=P(lw*.3), fill=GREY)
    # torso
    ntop = top + hh*.98
    d.rounded_rectangle([P(cx-sh*.72), P(ntop), P(cx+sh*.72), P(legtop+h*.06)], radius=P(sh*.3), fill=GREY)
    # arms
    for sgn in (-1, 1):
        d.rounded_rectangle([P(cx+sgn*sh*.86-lw*.26), P(ntop+hh*.1), P(cx+sgn*sh*.86+lw*.26), P(legtop+h*.02)], radius=P(lw*.3), fill=GREY)
    # neck + head
    d.rectangle([P(cx-hw*.2), P(top+hh*.85), P(cx+hw*.2), P(ntop+hh*.1)], fill=GREY)
    d.ellipse([P(cx-hw), P(top), P(cx+hw), P(top+hh)], fill=GREY)
fl = font(15)
for i, (name, inch, hs, kind) in enumerate(CAST):
    cx = x + i*gap + (30 if i >= 8 else 0)
    figure(cx, inch, hs, kind)
    tw = d.textlength(name, font=fl)/S
    d.text((P(cx-tw/2), P(BASE+14)), name, fill=(40,40,46), font=fl)
d.text((P(60), P(40)), "HEIGHT CHART: figures stand on one baseline at real height (1 ft grid). Match these proportions.", fill=(40,40,46), font=font(22))
d.text((P(60), P(74)), "Adult head about 21% of height, Grace about 25%. Grey shapes show size only, not style or likeness.", fill=(90,94,102), font=font(17))
img = img.resize((W, H), Image.LANCZOS)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'reference', 'height_chart_v1.png')
img.save(out); print('wrote', os.path.normpath(out))
