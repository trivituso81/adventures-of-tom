#!/usr/bin/env python3
"""Cut Deedee's approved objects-and-effects sheets (art/raw/characters/deedee-fx-<move>-v1.png, 4 x 3 grid on magenta)
into art/props/deedee/<slug>.webp. Each cell is keyed against its own magenta (median of the cell border), soft alpha so glows keep
their falloff and edges carry no pink. Usage: python3 tools/sprite-bake/bake_deedee_fx.py [--check]  (--check writes tools/shots/deedee-fx.png)"""
import os, sys
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/props/deedee')
MAXSIDE = 220
# sheet -> slugs in cell order (reading order, 4 columns). None = not used by the game.
SHEETS = {
 'dish-towel-flick': [None, None, 'towel_snap', 'dirt_smudge', 'crack_burst', 'shock_lines'],
 'moon-back': ['moon_crescent', 'moonbeam_soft', 'heart_big', 'gold_motes', 'sparkle_cluster', 'warm_glow'],
 'registered-nut': ['nurse_cap', None, 'bandage', None, 'heartbeat_line', None, None],
 'corner-piece': [None, 'crisp_pan', 'plate_with_corner_piece', None, None, 'steam_curl_gold', 'sparkles_gold'],
 'wet-floor': ['mop', 'mop_bucket', 'wet_floor_sign', 'puddle', 'water_drops', 'amber_blob', 'sparkle_white'],
 'wine': ['wine_glass', 'spoon', None, None, 'pop_burst', None, 'clink_sparkle'],
 'oven-mitt-ultimatum': [None, 'oven_mitt', 'hanging_rail', None, 'heat_wave', 'clap_burst', 'shock_ring'],
 'sunday-ult': ['dinner_bell', 'apron', 'wooden_spoon', 'pot_lid', 'rolling_pin', 'colander', None, 'stove', 'burner_ring', 'cyclone', 'steam_curl', 'dining_table'],
 'brisk-means-brisk': [None, None, 'sightseeing_sign', 'speed_lines', 'dust_puff', 'thump_burst'],
 'garden-shower': [None, None, 'spray_arc', 'spray_drops', 'splash', 'rainbow_mist'],
 'rise-and-shine': ['window_shade_down', 'window_shade_up', 'sun_beam', 'sun_glare', 'dust_motes', 'glare_lines'],
 'beanie-master': ['mist_cloud', 'mist_puff_ring', 'mist_wisps', 'bowl_of_beans', 'golden_glow_twinkle', 'speed_lines_short'],
 'grandma-squeeze': ['kiss_mark', 'heart_big', None, 'squeeze_lines', 'warm_glow'],
 'moon-ult': ['full_moon', 'night_sky', 'moonbeam_wide', 'golden_heart_trail', 'patchwork_quilt', 'kiss_mark', None, None, 'starburst'],
}
# the same slug on several sheets: the first sheet listed wins (same picture of the same object); duplicates are not written twice.
def local_bg(im):
    """Magenta as it really is around each item (some sheets have faint lighter cell boxes): nearest background pixel's colour."""
    f = im.astype(np.float32); M = np.median(f.reshape(-1, 3), 0)
    far = np.sqrt(((f - M) ** 2).sum(2)) >= 45
    idx = ndi.distance_transform_edt(far, return_distances=False, return_indices=True)
    bg = f[idx[0], idx[1]]
    return np.stack([ndi.median_filter(bg[..., k], size=9) for k in range(3)], 2)
def groups(d, n, shape):
    """Inked pieces (small merge radius), then the two nearest groups are merged until exactly n items are left (hearts, motes and
    sparkles are several pieces; items sit a gap apart). Reading order: rows by vertical overlap, then left to right."""
    lab, k = ndi.label(ndi.binary_dilation(ndi.binary_opening(d > 40, np.ones((5, 5))), iterations=6))   # opening drops the 1 px cell-border lines some sheets carry
    G = []
    for i, o in enumerate(ndi.find_objects(lab)):
        if (lab[o] == i + 1).sum() < 30: continue
        G.append({'ids': [i + 1], 'b': [o[1].start, o[0].start, o[1].stop, o[0].stop]})
    def gap(p, q):
        dx = max(p[0] - q[2], q[0] - p[2], 0); dy = max(p[1] - q[3], q[1] - p[3], 0); return (dx * dx + dy * dy) ** .5
    while len(G) > n:
        best = min(((gap(G[i]['b'], G[j]['b']), i, j) for i in range(len(G)) for j in range(i + 1, len(G))))
        _, i, j = best; a, b = G[i], G[j]
        G[i] = {'ids': a['ids'] + b['ids'], 'b': [min(a['b'][0], b['b'][0]), min(a['b'][1], b['b'][1]), max(a['b'][2], b['b'][2]), max(a['b'][3], b['b'][3])]}; del G[j]
    if len(G) != n: raise SystemExit('%d items found, expected %d' % (len(G), n))
    G.sort(key=lambda g: (g['b'][1] + g['b'][3]) / 2); rows = []
    for g in G:
        for r in rows:
            lo, hi = max(g['b'][1], r['lo']), min(g['b'][3], r['hi'])
            if hi - lo > .3 * min(g['b'][3] - g['b'][1], r['hi'] - r['lo']): r['items'].append(g); r['lo'] = min(r['lo'], g['b'][1]); r['hi'] = max(r['hi'], g['b'][3]); break
        else: rows.append({'items': [g], 'lo': g['b'][1], 'hi': g['b'][3]})
    rows.sort(key=lambda r: r['lo'])
    return lab, [g['ids'] for r in rows for g in sorted(r['items'], key=lambda g: g['b'][0])]
def main():
    os.makedirs(OUT, exist_ok=True); written = {}
    for sheet, slugs in SHEETS.items():
        im = np.array(Image.open(os.path.join(RAW, f'deedee-fx-{sheet}-v1.png')).convert('RGB'))
        bg = local_bg(im); f = im.astype(np.float32); d = np.sqrt(((f - bg) ** 2).sum(2))
        lab, order = groups(d, len(slugs), d.shape)
        a = np.clip((d - 30) / 130, 0, 1); a = np.where(d > 170, 1, a)
        a3 = np.maximum(a, 1e-3)[..., None]
        rgb = np.clip((f - (1 - a3) * bg) / a3, 0, 255)
        full = np.dstack([rgb, a * 255]).astype(np.uint8)
        for gi, slug in zip(order, slugs):
            if slug is None or slug in written: continue
            m = ndi.binary_dilation(np.isin(lab, gi), iterations=4)   # the group plus a thin soft edge, nothing from neighbours
            cut = full.copy(); cut[~m, 3] = 0
            cut = Image.fromarray(cut, 'RGBA'); bb = cut.getchannel('A').point(lambda v: 255 if v > 14 else 0).getbbox()
            cut = cut.crop(bb)
            if max(cut.size) > MAXSIDE: cut.thumbnail((MAXSIDE, MAXSIDE), Image.LANCZOS)
            cut.save(os.path.join(OUT, slug + '.webp'), quality=92, method=6); written[slug] = (sheet, cut)
    print(len(written), 'props written')
    if '--check' in sys.argv:
        from PIL import ImageDraw
        os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
        items = list(written.items()); cols = 10; rows = (len(items) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 150, rows * 165), (70, 80, 100)); dr = ImageDraw.Draw(sheet)
        for k, (s, (sh, im)) in enumerate(items):
            t = im.copy(); t.thumbnail((140, 140)); x, y = (k % cols) * 150 + 5, (k // cols) * 165 + 5; sheet.paste(t, (x, y), t); dr.text((x, y + 145), s[:22], fill='white')
        sheet.save(os.path.join(ROOT, 'tools/shots/deedee-fx.png'))
if __name__ == '__main__': main()
