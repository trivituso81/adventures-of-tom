#!/usr/bin/env python3
"""Cut Tom's 14 approved objects-and-effects sheets (art/raw/characters/tom-fx-<move>-vN.png, Art Library, 2026-11-06) into single transparent props.

Each sheet is a 4 x 3 grid of equal cells on flat magenta #FF00FF, one item per cell in the prompt's order. Output: art/props/tom/<move>_<slug>.webp
(trimmed, longest side at most MAXSIDE). The magenta is keyed out with a soft edge and its fringe is pulled out of the edge pixels.
Usage: python3 tools/sprite-bake/bake_tom_fx.py [--check]   (--check writes contact sheets to tools/shots/propcheck-tom-fx-<move>.png)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/tom')
MAXSIDE = 224
SHEETS = {   # move: (source file, slugs in list order)
    'mash': ('tom-fx-button-mash-v1', ['controller', 'controller_spin', 'no_signal', 'swoosh', 'impact_burst', 'dizzy_stars', 'dust_puff']),
    'defend': ('tom-fx-defend-v1', ['stop_hand', 'placard', 'shield_arc', 'speed_lines', 'bounce_flash', 'twinkle']),
    'splash': ('tom-fx-starter-splash-v1', ['jar', 'jar_open', 'jar_lid', 'wave', 'splash', 'puddle', 'bubbles', 'bubble', 'drops']),
    'snob': ('tom-fx-sourdough-snob-v1', ['loaf', 'loaf_torn', 'slice', 'pointer', 'chart', 'steam', 'hearts', 'sparkles', 'crumbs']),
    'gadget': ('tom-fx-overpriced-gadget-v1', ['box', 'box_lid', 'box_open', 'gadget', 'price_tag', 'receipt', 'receipt_pile', 'light_rays', 'hearts']),
    'anc': ('tom-fx-noise-canceling-v1', ['headphones', 'headphones_side', 'wave', 'wave_cut', 'quiet_rings', 'shout_bubble', 'shards', 'button_light']),
    'seat': ('tom-fx-seat-1a-v1', ['boarding_pass', 'remote', 'group5_sign', 'cabin_door', 'window_shade', 'duvet', 'pillow', 'sleep_mask', 'dnd_light']),
    'delta': ('tom-fx-delta-ult-v2', ['phone', 'scanner', 'carpet', 'gate0_door', 'pod', 'sleep_mask', 'jet', 'towel', 'tongs', 'contrail', 'glow']),
    'cards': ('tom-fx-flashcard-flurry-v1', ['deck', 'card', 'card_spin', 'card_sun', 'card_moon', 'card_fire', 'card_water', 'card_tree', 'card_mountain', 'star_sticker', 'question_tile', 'impact_pop']),
    'konami': ('tom-fx-konami-code-v1', ['floor_controller', 'arrow_up', 'red_button', 'dpad', 'starburst', 'oneup', 'stomp_dust', 'sparkles']),
    'skin': ('tom-fx-skincare-10-v2', ['tray', 'pump', 'jar', 'dropper', 'mask', 'mask_lit', 'red_glow', 'sparkles', 'pause', 'timer']),
    'kanji': ('tom-fx-kanji-strike-v1', ['brush', 'fire_kanji', 'stroke1', 'stroke2', 'stroke3', 'stroke4', 'ink_drops', 'flames', 'flame', 'embers']),
    'know': ('tom-fx-know-it-all-v2', ['stamp', 'false_mark', 'red_x', 'bubble', 'blush', 'burst', 'ding']),
    'cart': ('tom-fx-cart-ult-v1', ['cartridge', 'cartridge_bottom', 'console', 'dust_cone', 'glitch_bars', 'impact_burst', 'sparkle_ring', 'dust_specks']),
}

def key(cell):
    """RGBA from a magenta cell: alpha from the distance to #FF00FF, magenta spill removed from edge pixels."""
    a = np.asarray(cell.convert('RGB')).astype(float)
    mag = np.array([255., 0., 255.])
    dist = np.sqrt(((a - mag) ** 2).sum(2))
    alpha = np.clip((dist - 70) / 90, 0, 1)            # 0 at the flat background, 1 once clearly not magenta
    out = a.copy()
    edge = (alpha > 0) & (alpha < 1)
    # un-premultiply: c = (obs - (1-alpha) * mag) / alpha on the soft edge
    sp = alpha[edge][:, None]
    out[edge] = np.clip((a[edge] - (1 - sp) * mag) / np.maximum(sp, .05), 0, 255)
    # any remaining pinkish spill on opaque pixels near the edge: pull R and B toward G when both are far above it
    near = ndimage.binary_dilation(alpha < .5, iterations=2) & (alpha > .5)
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    spill = near & (r > g + 40) & (b > g + 40)
    m = np.minimum(r, b)[spill]; out[..., 0][spill] = np.minimum(r[spill], g[spill] + (r[spill] - g[spill]) * .3); out[..., 2][spill] = np.minimum(b[spill], g[spill] + (b[spill] - g[spill]) * .3)
    # the generator tints its soft ground shadow and glows with the magenta: a magenta hue (red and blue both well above green) is background
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    hue = (r - g > 40) & (b - g > 40) & (np.abs(r - b) < 90) & (r < 215) & (g < 150)
    alpha = np.where(hue, 0, alpha)
    rgba = np.dstack([out, alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

def split_sheet(rgba, cw, ch, ncells):
    """Items drift across cell lines, so assign pieces to cells by connectivity: every big piece goes to the cell of its centre, every small
    piece (a spike, a drop, a sparkle) to the nearest big piece. Returns {cell: RGBA image the size of the sheet, only that item's pixels}."""
    arr = np.asarray(rgba); opaque = arr[:, :, 3] > 100
    opaque = ndimage.binary_opening(opaque, structure=np.ones((7, 7)))   # drops the thin white grid lines some sheets carry
    opaque |= ndimage.binary_dilation(opaque, iterations=6) & (arr[:, :, 3] > 100)
    lab, n = ndimage.label(ndimage.binary_dilation(opaque, iterations=4))
    lab = np.where(opaque, lab, 0)
    objs = ndimage.find_objects(lab)
    info = {}
    for i, sl in enumerate(objs, 1):
        if sl is None: continue
        area = int((lab[sl] == i).sum())
        if area < 30: continue
        ys, xs = np.nonzero(lab[sl] == i)
        info[i] = (area, xs.mean() + sl[1].start, ys.mean() + sl[0].start, sl)
    big = {i: v for i, v in info.items() if v[0] >= 2500}
    cell_of = {}
    for i, (area, cx, cy, sl) in big.items():
        cell_of[i] = min(11, int(cy // ch)) * 4 + min(3, int(cx // cw))
    for i, (area, cx, cy, sl) in info.items():
        if i in big: continue
        best = None
        for j, (a2, cx2, cy2, sl2) in big.items():
            dx = max(sl2[1].start - sl[1].stop, sl[1].start - sl2[1].stop, 0); dy = max(sl2[0].start - sl[0].stop, sl[0].start - sl2[0].stop, 0)
            d = (dx * dx + dy * dy) ** .5
            if best is None or d < best[0]: best = (d, j)
        if best and best[0] < 70: cell_of[i] = cell_of[best[1]]
        else:
            c0 = min(11, int(cy // ch)) * 4 + min(3, int(cx // cw))
            if c0 not in cell_of.values() and area >= 30: cell_of[i] = c0   # a cell holding only small specks
    out = {}
    for c in range(ncells):
        ids = [i for i, k in cell_of.items() if k == c]
        if not ids: continue
        m = np.isin(lab, ids); layer = arr.copy(); layer[~m, 3] = 0
        out[c] = Image.fromarray(layer, 'RGBA')
    return out

def trim(im):
    bb = im.getbbox()
    return im.crop(bb) if bb else None

def main():
    check = '--check' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    for mv, (src, slugs) in SHEETS.items():
        sheet = Image.open(os.path.join(RAW, src + '.png')).convert('RGB')
        cw, ch = sheet.width // 4, sheet.height // 3
        tiles = []
        cells = split_sheet(key(sheet), cw, ch, len(slugs))
        for i, slug in enumerate(slugs):
            im = trim(cells[i]) if i in cells else None
            if im is None: print('EMPTY', mv, slug); continue
            k = MAXSIDE / max(im.size)
            if k < 1: im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
            im.save(os.path.join(OUT, f'{mv}_{slug}.webp'), 'WEBP', lossless=True, quality=100, method=6)
            tiles.append((slug, im))
        if check:
            W = 260; rows = (len(tiles) + 3) // 4
            cs = Image.new('RGB', (W * 4, (W + 14) * rows), (70, 74, 82))
            from PIL import ImageDraw
            d = ImageDraw.Draw(cs)
            for i, (slug, im) in enumerate(tiles):
                t = im.copy(); t.thumbnail((W - 10, W - 10)); x, y = (i % 4) * W, (i // 4) * (W + 14)
                cs.paste(t, (x + (W - t.width) // 2, y + 14 + (W - t.height) // 2), t); d.text((x + 3, y + 1), f'{i + 1} {slug}', fill=(255, 255, 0))
            os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
            cs.save(os.path.join(ROOT, f'tools/shots/propcheck-tom-fx-{mv}.png'))
        print(mv, len(tiles), 'props')

if __name__ == '__main__': main()
