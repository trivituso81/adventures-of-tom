"""Shared by bake_townsfolk.py (the bake) and head_adjust.py (the HEAD SIZES page): which townsfolk come from approved Library sheets,
their chin lines, real heights, and the head factor from head_tweak.json (head size adjuster, Tom 2026-11-10; absent or 1.0 = no change)."""
import json, os, re
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try: HEAD_TWEAK = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'head_tweak.json')))
except OSError: HEAD_TWEAK = {}

def purge_bg(img):
    """A crimson-pink sheet leaves a few background specks between fingers and legs that the border key keeps: red dominant with blue above green
    (the background's hue). Coral shirts, skin, hair and brown shoes have green above blue, blue hats and jeans have blue above red, so they stay."""
    from scipy import ndimage as ndi
    a = np.array(img); r, g, b = [a[:, :, i].astype(int) for i in range(3)]
    bgl = (a[:, :, 3] > 0) & (r >= b) & (b > g + 12) & (r - g > 80)
    rim = ndi.binary_dilation(bgl, iterations=1) & ~bgl & (a[:, :, 3] > 0) & (b > g + 4) & (r - g > 60)
    a[bgl | rim, 3] = 0
    return Image.fromarray(a, 'RGBA')

SIDE_FACES_RIGHT = set()   # ids whose generated sheet draws the side row facing RIGHT. Check each new sheet by eye: the generator is not consistent (Gus v3 faced right, v5 and the other 20 face left). A wrong entry makes the NPC walk backwards.
LIBRARY_WALK = {'pip': 'art/raw/npcs/npc-walk-pip-v2.png', 'moss': 'art/raw/npcs/npc-walk-moss-v1.png', 'dot': 'art/raw/npcs/npc-walk-dot-v1.png', 'gus': 'art/raw/npcs/npc-walk-gus-v5.png', 'bean': 'art/raw/npcs/npc-walk-bean-v2.png', 'reel': 'art/raw/npcs/npc-walk-reel-v1.png', 'pruitt': 'art/raw/npcs/npc-walk-pruitt-v2.png', 'delgado': 'art/raw/npcs/npc-walk-delgado-v2.png', 'kowalski': 'art/raw/npcs/npc-walk-kowalski-v2.png', 'ike': 'art/raw/npcs/npc-walk-ike-v2.png', 'halverson': 'art/raw/npcs/npc-walk-halverson-v1.png', 'bun': 'art/raw/npcs/npc-walk-bun-v1.png', 'page': 'art/raw/npcs/npc-walk-page-v1.png', 'fern': 'art/raw/npcs/npc-walk-fern-v1.png', 'kit': 'art/raw/npcs/npc-walk-kit-v1.png', 'oolong': 'art/raw/npcs/npc-walk-oolong-v1.png', 'luna': 'art/raw/npcs/npc-walk-luna-v1.png', 'penny': 'art/raw/npcs/npc-walk-penny-v1.png', 'nickel': 'art/raw/npcs/npc-walk-nickel-v1.png', 'sal': 'art/raw/npcs/npc-walk-sal-v1.png', 'sol': 'art/raw/npcs/npc-walk-sol-v1.png', 'alvarez': 'art/raw/npcs/npc-walk-alvarez-v1.png', 'bernadette': 'art/raw/npcs/npc-walk-bernadette-v1.png', 'beto': 'art/raw/npcs/npc-walk-beto-v1.png', 'bev': 'art/raw/npcs/npc-walk-bev-v1.png', 'carmen': 'art/raw/npcs/npc-walk-carmen-v1.png', 'chet': 'art/raw/npcs/npc-walk-chet-v1.png', 'claudia': 'art/raw/npcs/npc-walk-claudia-v1.png', 'daisy': 'art/raw/npcs/npc-walk-daisy-v1.png', 'dakota': 'art/raw/npcs/npc-walk-dakota-v1.png', 'dana': 'art/raw/npcs/npc-walk-dana-v1.png', 'dash': 'art/raw/npcs/npc-walk-dash-v1.png', 'dolores': 'art/raw/npcs/npc-walk-dolores-v1.png', 'jordan': 'art/raw/npcs/npc-walk-jordan-v1.png', 'juniper': 'art/raw/npcs/npc-walk-juniper-v1.png', 'kenji': 'art/raw/npcs/npc-walk-kenji-v1.png', 'kevin': 'art/raw/npcs/npc-walk-kevin-v1.png', 'kiki': 'art/raw/npcs/npc-walk-kiki-v2.png', 'larry': 'art/raw/npcs/npc-walk-larry-v1.png', 'marguerite': 'art/raw/npcs/npc-walk-marguerite-v1.png', 'marisol': 'art/raw/npcs/npc-walk-marisol-v1.png', 'mateo': 'art/raw/npcs/npc-walk-mateo-v1.png', 'odette': 'art/raw/npcs/npc-walk-odette-v1.png', 'priya': 'art/raw/npcs/npc-walk-priya-v1.png', 'ray': 'art/raw/npcs/npc-walk-ray-v1.png', 'ryan': 'art/raw/npcs/npc-walk-ryan-v1.png', 'sage': 'art/raw/npcs/npc-walk-sage-v1.png', 'sam': 'art/raw/npcs/npc-walk-sam-v1.png', 'skye': 'art/raw/npcs/npc-walk-skye-v2.png', 'sofi': 'art/raw/npcs/npc-walk-sofi-v1.png', 'toni': 'art/raw/npcs/npc-walk-toni-v1.png', 'tony': 'art/raw/npcs/npc-walk-tony-v1.png', 'washington': 'art/raw/npcs/npc-walk-washington-v1.png', 'wes': 'art/raw/npcs/npc-walk-wes-v1.png', 'yesenia': 'art/raw/npcs/npc-walk-yesenia-v1.png'}   # id -> approved Art Library walk sheet (the newest version of the entry)
# Head and body sizing for the Library walk sheets: the SAME mechanism as the main cast (tools/sprite-bake/walk_sheet_frames.py WALK_MATCH and PLAIN).
# Adults: the head (top of hair, hat or cap to chin) is made as tall as Tom's on screen (walk_sheet_frames.tom_head_rows(), kidhead.grow_head about the chin) and the body is
# scaled so the whole figure keeps its real height next to Tom (42 rows = 5'11, so rows = 42 x inches / 71). Kids (Pip, Moss, Dot): head as tall as Grace's
# (KID_HEAD_ROWS = her grown head, 11.47 rows) and the whole figure scaled from Grace (4'2 = 40.6 rows, Rose 3'4 = 36.6, so 0.4 rows per inch).
# CHIN = chin line of the painted front stand frame as a share of that frame's height (the true bottom of the chin, read by eye with a ruler on the zoomed head of each approved sheet, redone 11-13 after the first values sat at mouth or eye level and distorted the heads).
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import walk_sheet_frames as _W   # Tom's head and Tom's 42 rows: one definition for the family and the townsfolk (heights1)
KID_HEAD_ROWS = 9.2
CHIN = {'pip': 0.285, 'moss': 0.285, 'dot': 0.275, 'gus': 0.28, 'bean': 0.26, 'reel': 0.295, 'pruitt': 0.267, 'delgado': 0.285, 'kowalski': 0.26, 'ike': 0.275, 'halverson': 0.278, 'bun': 0.283, 'page': 0.25, 'fern': 0.277, 'kit': 0.267, 'oolong': 0.297, 'luna': 0.263, 'penny': 0.267, 'nickel': 0.263, 'sal': 0.275, 'sol': 0.27, 'alvarez': 0.26, 'bernadette': 0.263, 'beto': 0.285, 'bev': 0.24, 'carmen': 0.273, 'chet': 0.247, 'claudia': 0.267, 'daisy': 0.263, 'dakota': 0.257, 'dana': 0.25, 'dash': 0.28, 'dolores': 0.26, 'jordan': 0.26, 'juniper': 0.253, 'kenji': 0.315, 'kevin': 0.283, 'kiki': 0.247, 'larry': 0.285, 'marguerite': 0.263, 'marisol': 0.245, 'mateo': 0.33, 'odette': 0.31, 'priya': 0.247, 'ray': 0.29, 'ryan': 0.26, 'sage': 0.243, 'sam': 0.243, 'skye': 0.22, 'sofi': 0.333, 'toni': 0.267, 'tony': 0.27, 'washington': 0.303, 'wes': 0.253, 'yesenia': 0.27}
KIDS = {'pip', 'moss', 'dot'}
def real_inches(cid):
    m = re.search(r"\n\s+%s: \{[^\n]*?ft: `(\d+)'(\d+)\"`" % cid, open(os.path.join(ROOT, 'tools/art-library/npc-prompts.js')).read())
    return int(m.group(1)) * 12 + int(m.group(2))
def target_rows(cid):
    inch = real_inches(cid)
    return 32.6 * inch / 50.0 if cid in KIDS else _W.TOM_ROWS * inch / _W.INCHES[_W.BASE]


def stand(cid):
    """The painted front stand frame (background removed, as the bake cuts it), before any head change."""
    import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from sheet import slice_sheet
    rn3 = [[f'{d}_{n}' for n in ('stand', 'step1', 'step2')] for d in ('down', 'up', 'left')]
    return purge_bg(slice_sheet(os.path.join(ROOT, LIBRARY_WALK[cid]), rn3, robust=True)['down_stand'])
