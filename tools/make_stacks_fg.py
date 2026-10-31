# Builds art/stacks-fg.webp: the Stacks hall props (globe, book stacks, both lamp pedestals, both plants, the returns cart) cut out of
# art/stacks.webp with transparency everywhere else. engine/plate.js (PLATE_BEHIND.stacks, fg:true zones) draws it over anyone standing
# behind them, so Tom can walk along the row behind the globe and the cart (row 8) and read as behind them.
# Polygons were measured on 3x crops of the painting: crop px / 3 + origin = art px (64 art px per tile).
# Usage: python3 tools/make_stacks_fg.py   (re-run after art/stacks.webp changes; prints the zone list for engine/plate.js)
import os
from PIL import Image, ImageDraw, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plate = Image.open(os.path.join(ROOT, 'art/stacks.webp')).convert('RGB')
W, H = 1920, 1408
plate = plate.resize((W, H), Image.LANCZOS) if plate.size != (W, H) else plate
L = (620, 450)    # origin of the left-island crop
R = (1000, 450)   # origin of the right-island crop
def P(origin, pts): return [(origin[0] + x / 3.0, origin[1] + y / 3.0) for x, y in pts]
# name: (polygon in art px, base y where the thing stands on the ground)
PROPS = {
 'globe': (P(L, [(380,250),(405,160),(450,100),(520,72),(600,68),(670,90),(715,150),(738,240),(735,290),(705,330),(712,430),(722,520),(710,566),(668,566),(660,480),(640,510),(520,512),(490,500),(480,430),(430,395),(395,330),(375,280)]), 636),
 'books_l': (P(L, [(375,365),(480,365),(485,590),(375,600)]), 650),
 'books_r': (P(L, [(715,300),(740,290),(830,290),(850,420),(860,520),(740,540),(715,500)]), 632),
 'ped_l': (P(L, [(240,130),(300,130),(305,95),(335,60),(360,95),(385,165),(380,235),(370,255),(370,640),(345,650),(235,650),(240,260)]), 666),
 'plant_l': (P(L, [(105,290),(130,225),(185,205),(215,215),(240,260),(240,590),(120,590),(125,420),(130,380),(110,330)]), 648),
 'cart': (P(R, [(45,455),(60,330),(70,260),(100,235),(145,240),(250,250),(300,255),(350,265),(415,270),(430,275),(430,400),(440,480),(440,540),(420,555),(385,555),(345,580),(335,625),(300,620),(290,560),(80,548),(48,545)]), 658),
 'ped_r': (P(R, [(520,160),(540,90),(560,70),(590,100),(600,125),(660,130),(668,255),(680,265),(680,640),(660,655),(535,655),(530,580),(545,540),(545,230),(530,215)]), 666),
 'plant_r': (P(R, [(665,390),(680,300),(700,230),(740,205),(790,225),(830,270),(855,310),(850,380),(830,420),(830,500),(810,540),(770,555),(715,550),(680,500),(668,430)]), 640),
}
alpha = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(alpha)
for name, (pts, base) in PROPS.items(): d.polygon(pts, fill=255)
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # pull the edge in a hair, soften it
out = plate.convert('RGBA'); out.putalpha(alpha)
out.save(os.path.join(ROOT, 'art/stacks-fg.webp'), lossless=True, quality=100, method=6)
prev = Image.new('RGB', (W, H), (255, 0, 255)); prev.paste(out.convert('RGB'), mask=alpha)
os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
prev.crop((580, 440, 1340, 700)).save(os.path.join(ROOT, 'tools/shots/stacks-fg-preview.png'))
print('zones for PLATE_BEHIND.stacks:')
for name, (pts, base) in PROPS.items():
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    x0, y0, x1, y1 = int(min(xs)) - 2, int(min(ys)) - 2, int(max(xs)) + 3, int(max(ys)) + 3
    if name == 'globe':   # two zones: the upper half covers row 7 only (base 520), the stand and lower half cover row 8 (base 636), so Tom is not hidden on row 8
        print('  {x:%d,y:%d,w:%d,h:72,base:520,fg:true},{x:%d,y:540,w:%d,h:%d,base:%d,fg:true},  // globe (two zones)' % (x0, y0, x1 - x0, x0, x1 - x0, y1 - 540, base)); continue
    print('  {x:%d,y:%d,w:%d,h:%d,base:%d,fg:true},  // %s' % (x0, y0, x1 - x0, y1 - y0, base, name))
