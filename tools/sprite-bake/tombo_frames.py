"""Tombo frames: approved Art Library sheets -> art/tombo/<id>-<who>.webp (+ data/tombo-frames.js) and object cutouts -> art/props/tombo/<slug>.webp.
Person sheets (1248 x 832, 3 x 2 cells, magenta) are used as painted, one scale factor per sheet so the standing height equals that character's battle
'ready' pose (rect height of 'idle' in data/<id>-hires.js). Pair sheets keep both people in one frame, scaled so the pair's median standing height is Tom's ready height.
Object sheets (1152 x 864, up to 4 x 3) are cut by ink, magenta keyed out, longest side 420, named by the object list in the Art Library prompt.
Usage: python3 tools/sprite-bake/tombo_frames.py <tombo id> [...]   (no ids = all in SETS).  Contact sheet: tools/shots/tombo-<id>.png"""
import os, sys, re, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import ndimage as ndi
from walk_sheet_frames import _key as _key_magenta
from ability_frames import _rs
import ability_frames_tnb
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW = os.path.join(ROOT, 'art/raw/characters'); OUT = os.path.join(ROOT, 'art/tombo'); PROPS = os.path.join(ROOT, 'art/props/tombo')


def _key(rgb):
    """Sheet to RGBA. True magenta sheets use the vetted walk-sheet key; the generator sometimes paints crimson or pink grounds instead, keyed here:
    ground colour = median of the border, ground = pixels near it connected to the border, soft edge, ground colour unmixed from edge pixels."""
    b = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]).astype(np.float32); K = np.median(b, 0)
    if np.abs(K - np.array([255, 0, 255])).max() < 45: return _key_magenta(rgb)
    a = rgb.astype(np.float32); d = np.sqrt(((a - K) ** 2).sum(2))
    cand = d < 75
    lab, n = ndi.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    holes = ndi.label(cand & ~bg)[0]
    hs = ndi.sum(cand & ~bg, holes, range(1, holes.max() + 1)) if holes.max() else []
    for i, sz in enumerate(hs, 1):
        if sz >= 12: bg |= holes == i            # enclosed ground between arms, legs, heads
    near = ndi.binary_dilation(bg, iterations=4) & ~bg
    al = np.where(bg, 0.0, np.where(near, np.clip((d - 75) / 80.0, 0, 1), 1.0))
    al = np.maximum(al, 0)
    rgbf = np.clip((a - (1 - al[..., None]) * K) / np.maximum(al, 1e-3)[..., None], 0, 255)
    rgbf = np.where(al[..., None] > 0.02, rgbf, 0)
    return np.dstack([rgbf, al * 255]).astype(np.uint8)


ability_frames_tnb._key = _key
_frames = ability_frames_tnb._frames
READY = {}   # char -> (k, idle rect height px)
for c in ['tom', 'tnb', 'nara', 'rose', 'grace', 'amy', 'deedee', 'boppy']:
    s = open(os.path.join(ROOT, 'data/%s-hires.js' % c)).read(400000)
    m = re.search(r'atlas:\{"bt": \{"src": "[^"]+", "k": (\d+), "rects": \{"idle": \[\d+, \d+, (\d+), (\d+)\]', s)
    READY[c] = (int(m.group(1)), int(m.group(3)))
# id -> partner, kind ('split' = tom + partner sheets, 'pair' = one sheet), file versions
SETS = {}
for i, p in [('amy2', 'amy'), ('amy3', 'amy'), ('boppy1', 'boppy'), ('boppy2', 'boppy'), ('deedee2', 'deedee'), ('deedee3', 'deedee'), ('nara1', 'nara'), ('rose3', 'rose'), ('tnb1', 'tnb')]:
    SETS[i] = dict(partner=p, kind='split')
for i, p in [('grace1', 'grace'), ('grace2', 'grace'), ('grace3', 'grace'), ('rose1', 'rose'), ('rose2', 'rose'), ('amy1', 'amy'), ('deedee1', 'deedee')]:
    SETS[i] = dict(partner=p, kind='pair')
INSTALLED = ['tnb1', 'nara1', 'boppy1', 'amy2', 'amy3', 'boppy2', 'deedee2', 'deedee3', 'rose3', 'grace1', 'grace2', 'grace3', 'rose1', 'rose2', 'amy1', 'deedee1']   # Tombos whose animation plays these frames; only these go into data/tombo-frames.js
OBJ_VER = {'grace1': 'v2'}
# rose1 is one row of four approved poses (hoist, level, banked, boop). The figures' arms nearly touch, so the cut uses the gaps between them.
PAIR_CUTS = {'rose1': [0, 295, 645, 945, 1248]}
PAIR_GRID = {'rose2': (4, 1)}   # rose2: four approved poses in one row (whistle, wheel, wiggle, pop)


def _frames_cut(path, xs):
    rgba = _key(np.array(Image.open(path).convert('RGB')))
    out = []
    for a, b in zip(xs, xs[1:]):
        cut = rgba.copy(); cut[:, :a, 3] = 0; cut[:, b:, 3] = 0
        im = Image.fromarray(cut, 'RGBA'); out.append(im.crop(im.getbbox()))
    return out
OBJ_ALIAS = {'tnb1': {'cardboard_villain_standee': 'villain_standee'}, 'grace1': {'glittery_pink_cube_squishy': 'dice_squishy',}, 'grace2': {'gymnastics_landing_mat': 'blue_gym_mat'}, 'rose1': {}, 'rose2': {}}   # sheet name -> game slug (tombo/<slug>)


def raw(name):
    return os.path.join(RAW, name)


def ref_height(fr):
    up = sorted(im.height for im in fr if im.height > 1.25 * im.width)
    return up[len(up) // 2] if up else None


def person_frames(path, char, fallback_ref=None):
    fr = _frames(path, 3, 2)
    ref = ref_height(fr)
    if ref is None:
        ref = fallback_ref or max(im.height for im in fr) / 0.62
        print('  no upright frame in %s, ref %d (fallback)' % (os.path.basename(path), ref))
    f = READY[char][1] / float(ref)
    return [_rs(im, f) for im in fr], f


def pack(frames, path, maxw=2048):
    x = y = rowh = 0; at = {}
    for n, im in frames.items():
        if x + im.width > maxw: x = 0; y += rowh; rowh = 0
        at[n] = (x, y); x += im.width; rowh = max(rowh, im.height)
    atlas = Image.new('RGBA', (maxw, y + rowh), (0, 0, 0, 0)); rects = {}
    for n, im in frames.items():
        atlas.paste(im, at[n]); rects[n] = [at[n][0], at[n][1], im.width, im.height]
    atlas = atlas.crop((0, 0, max(r[0] + r[2] for r in rects.values()), atlas.height))
    atlas.save(path, 'WEBP', lossless=True, quality=100, method=6)
    print('  wrote', os.path.relpath(path, ROOT), atlas.size, os.path.getsize(path) // 1024, 'KB')
    return rects


def prompt_objects(tid, objname):
    tid = tid.split('-')[0]
    d = json.load(open(os.path.join(ROOT, 'data/art-prompts.json')))
    E = {x['id']: x for x in d['entries']}
    p = E[objname]['prompt']; i = p.find('in reading order:')
    out = []
    for line in p[i:].splitlines():
        m = re.match(r'\s*(\d+)\.\s+(.*?):', line)
        if m: out.append(re.sub(r'[^a-z0-9]+', '_', re.sub(r'^(an?|the) ', '', m.group(2).strip().lower())).strip('_'))
    known = json.load(open(os.path.join(ROOT, 'tools/tombo_props_map.json'))).get(tid, {}).get('new', [])
    res = []
    for nm in out:   # the game's slug for this object: the known slug whose words all appear in the name (giant_popcorn_bowl -> popcorn_bowl), else the name itself
        nz = lambda x: {w[:-1] if w.endswith('s') and len(w) > 3 else w for w in x.split('_')}
        t = nz(nm); hit = [k for k in known if nz(k) <= t]
        res.append(max(hit, key=len) if hit else nm)
    return res


def object_cutouts(tid, objname, file):
    slugs = prompt_objects(tid, objname)
    rgba = _key(np.array(Image.open(file).convert('RGB')))
    A = rgba[:, :, 3] > 24
    lab, n = ndi.label(ndi.binary_dilation(A, iterations=10))
    comps = []
    for i, s in enumerate(ndi.find_objects(lab), 1):
        m = (lab == i) & A
        if m.sum() < 3000: continue
        comps.append((s, m))
    H, W = A.shape; cols = 4; rows_n = 3
    cell = lambda c: min(rows_n - 1, int((c[0][0].start + c[0][0].stop) / 2 / H * rows_n)) * cols + min(cols - 1, int((c[0][1].start + c[0][1].stop) / 2 / W * cols))
    comps.sort(key=lambda c: (cell(c) // cols, (c[0][1].start + c[0][1].stop)))
    print('  objects: %d pieces, %d names %s' % (len(comps), len(slugs), slugs))
    assert len(comps) == len(slugs), (objname, len(comps), len(slugs))
    out = {}
    for slug, (s, m) in zip(slugs, comps):
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        cut = rgba.copy(); cut[~ndi.binary_dilation(m, iterations=10), 3] = 0
        im = Image.fromarray(cut[y0:y1, x0:x1], 'RGBA'); im = im.crop(im.getbbox())
        sc = 420.0 / max(im.size)
        if sc < 1: im = _rs(im, sc)
        out[slug] = im
    return out


def contact(items, path, cw=330, ch=460):
    cols = 6; sheet = Image.new('RGBA', (cols * cw, ((len(items) + cols - 1) // cols) * ch), (70, 110, 70, 255))
    for n, (k, v) in enumerate(items):
        sc = min(1.0, (ch - 10) / v.height, (cw - 10) / v.width); v = _rs(v, sc) if sc < 1 else v
        sheet.alpha_composite(v, ((n % cols) * cw + (cw - v.width) // 2, (n // cols) * ch + ch - v.height - 5))
    sheet.convert('RGB').save(path)


def run(tid):
    cfg = SETS[tid]; p = cfg['partner']; os.makedirs(OUT, exist_ok=True); os.makedirs(PROPS, exist_ok=True)
    print(tid, cfg)
    info = {'partner': p, 'kind': cfg['kind']}; shots = []
    if cfg['kind'] == 'split':
        tf, f1 = person_frames(raw('tombo-%s-tom-v1.png' % tid), 'tom')
        pf, f2 = person_frames(raw('tombo-%s-%s-v1.png' % (tid, p)), p)
        print('  scale tom %.3f partner %.3f' % (f1, f2))
        for who, fr, ch in [('tom', tf, 'tom'), ('p', pf, p)]:
            rects = pack({str(i + 1): im for i, im in enumerate(fr)}, os.path.join(OUT, '%s-%s.webp' % (tid, who)))
            info[who] = {'src': 'art/tombo/%s-%s.webp' % (tid, who), 'k': READY[ch][0], 'rects': rects}
            shots += [('%s%d' % (who, i + 1), im) for i, im in enumerate(fr)]
    else:
        if tid in PAIR_CUTS: fr = _frames_cut(raw('tombo-%s-v1.png' % tid), PAIR_CUTS[tid])
        elif tid in PAIR_GRID: fr = _frames(raw('tombo-%s-v1.png' % tid), *PAIR_GRID[tid])
        else: fr = _frames(raw('tombo-%s-v1.png' % tid), 3, 2)
        hs = sorted(im.height for im in fr); ref = hs[len(hs) // 2]
        f = READY['tom'][1] / float(ref); fr = [_rs(im, f) for im in fr]
        print('  pair scale %.3f (median frame height %d)' % (f, ref))
        rects = pack({str(i + 1): im for i, im in enumerate(fr)}, os.path.join(OUT, '%s-pair.webp' % tid))
        info['pair'] = {'src': 'art/tombo/%s-pair.webp' % tid, 'k': READY['tom'][0], 'rects': rects}
        shots += [('pair%d' % (i + 1), im) for i, im in enumerate(fr)]
    of = raw('tombo-%s-objects-%s.png' % (tid, OBJ_VER.get(tid, 'v1')))
    if os.path.exists(of):
        objs = object_cutouts(tid, 'tombo-%s-objects' % tid, of)
        known = set(json.load(open(os.path.join(ROOT, 'tools/tombo_props_map.json'))).get(tid, {}).get('new', [])) | set(OBJ_ALIAS.get(tid, {}).values())
        objs = {OBJ_ALIAS.get(tid, {}).get(k, k): v for k, v in objs.items()}
        for slug, im in objs.items():
            if slug not in known: print('  not saved (not a slug the game uses):', slug); continue
            im.save(os.path.join(PROPS, slug + '.webp'), quality=92, method=6, exact=True)
        shots += list(objs.items()); info['objects'] = list(objs)
    os.makedirs(os.path.join(ROOT, 'tools/shots'), exist_ok=True)
    contact(shots, os.path.join(ROOT, 'tools/shots/tombo-%s.png' % tid))
    return info


if __name__ == '__main__':
    ids = sys.argv[1:] or list(SETS)
    path = os.path.join(ROOT, 'tools/sprite-bake/tombo_frames_state.json')
    allinfo = json.load(open(path)) if os.path.exists(path) else {}
    for t in ids: allinfo[t] = run(t)
    json.dump(allinfo, open(path, 'w'), indent=1, sort_keys=True)
    js = ("'use strict';\n// data/tombo-frames.js: GENERATED by tools/sprite-bake/tombo_frames.py (painted Tombo frames, art/tombo/*.webp). Do not edit.\n"
          "// TOMBO_FRAMES[id] = {partner, kind, tom|p|pair: {src, k, rects}}. Atlases are registered lazily (ids tbo_<partner>_<id>_<who>); engine/tombo-frames.js draws them.\n"
          "const TOMBO_FRAMES=" + json.dumps({t: {k: v for k, v in i.items() if k != 'objects'} for t, i in sorted(allinfo.items()) if t in INSTALLED}, separators=(',', ':'), sort_keys=True) + ";\n")
    open(os.path.join(ROOT, 'data/tombo-frames.js'), 'w').write(js)
