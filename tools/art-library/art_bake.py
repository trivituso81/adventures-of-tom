#!/usr/bin/env python3
"""Art Library bake step (B5). Run by .github/workflows/art-bake.yml after a push that touched art/raw/**, or by hand.

What it does, for every APPROVED entry of data/art-prompts.json whose newest version file changed in this push:
  1. optional background key (entry `bake.key`): the generator's "magenta" comes out crimson (about 214,2,104), so the key colour is read
     from the four corners of the picture, not assumed; pixels close to it that touch the border become transparent;
  2. copies the picture to `bake.src` (a path under tools/sprite-bake/src/ that the bake script reads);
  3. runs the bake script: `python3 -I tools/sprite-bake/<bake.script> <bake.args...>`;
  4. then (once for the whole run) moves every cache tag the tag check demands (tools/art-library/bump_tags.py) and puts a CHANGES entry at the top.
An entry with no `bake` field is reported and left alone (art that only lives in art/raw/ until a bake is wired for it).

The `bake` object in data/art-prompts.json (set by Claude in tools/art-library/make-prompts.js, never by Tom):
  { "script": "bake_foe.py", "args": ["mudling"], "src": "tools/sprite-bake/src/foe-mudling-v1.png", "key": "corner" }   ("key" optional)

Usage: python3 tools/art-library/art_bake.py [--files a.png,b.png | --before <sha>] [--dry] [--tag NEWTAG]
  --files   the changed art/raw files (default: git diff --name-only <before> HEAD, or HEAD~1 when --before is absent)
  --dry     print the plan, change nothing
Exit 0 on success or when there is nothing to bake; 1 when a bake or the tag check fails (the workflow then does not commit)."""
import datetime, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'data', 'art-prompts.json')

def sh(*cmd, check=False):
    r = subprocess.run(list(cmd), cwd=ROOT, capture_output=True, text=True)
    if check and r.returncode: raise SystemExit(f'FAILED: {" ".join(cmd)}\n{r.stdout}\n{r.stderr}')
    return r

def changed_files(argv):
    if '--files' in argv:
        return [p for p in argv[argv.index('--files') + 1].split(',') if p]
    before = argv[argv.index('--before') + 1] if '--before' in argv else 'HEAD~1'
    if not before.strip('0'): before = 'HEAD~1'   # a branch's first push reports an all-zero sha
    r = sh('git', 'diff', '--name-only', before, 'HEAD')
    return [p for p in r.stdout.split('\n') if p]

def key_background(src, dst):
    """Make the picture's background transparent. Key colour = median of the four corner patches; only pixels near it that
    are connected to the border go (so a pink thing inside the figure survives)."""
    import numpy as np
    from PIL import Image
    from scipy import ndimage as ndi
    im = Image.open(src).convert('RGBA'); a = np.array(im)
    h, w = a.shape[:2]; p = max(4, min(h, w) // 100)
    corners = np.concatenate([a[:p, :p, :3].reshape(-1, 3), a[:p, -p:, :3].reshape(-1, 3), a[-p:, :p, :3].reshape(-1, 3), a[-p:, -p:, :3].reshape(-1, 3)])
    col = np.median(corners, axis=0)
    d = np.sqrt(((a[:, :, :3].astype(float) - col) ** 2).sum(axis=2))
    near = d < 70
    lab, n = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    soft = ndi.binary_dilation(bg, iterations=1) & ~bg & (d < 130)   # one-pixel fringe: pull it toward transparent
    a[bg, 3] = 0
    a[soft, 3] = (a[soft, 3] * 0.5).astype('uint8')
    Image.fromarray(a).save(dst)
    return [int(x) for x in col]

def next_number():
    f = os.path.join(ROOT, 'docs', 'CHANGES.md')
    nums = [int(m) for m in re.findall(r'^## \d{4}-\d{2}-\d{2} \((\d+)\)', open(f, encoding='utf-8').read(), re.M)]
    return (max(nums) + 1) if nums else 1

def prepend_changes(ids, tag, notes):
    f = os.path.join(ROOT, 'docs', 'CHANGES.md')
    txt = open(f, encoding='utf-8').read()
    today = datetime.date.today().isoformat()
    body = (f'## {today} ({next_number()}): Art Library bake, {", ".join(ids)} (`{tag}`, made by the art-bake Action)\n\n'
            f'- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).\n'
            + ''.join(f'- {n}\n' for n in notes)
            + '- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.\n\n')
    open(f, 'w', encoding='utf-8').write(body + txt)

def main():
    argv = sys.argv[1:]
    dry = '--dry' in argv
    files = changed_files(argv)
    raws = [p for p in files if p.startswith('art/raw/') and p.lower().endswith('.png') and os.path.exists(os.path.join(ROOT, p))]
    if not raws:
        print('art_bake: no art/raw picture changed, nothing to do'); return 0
    entries = json.load(open(DATA, encoding='utf-8'))['entries']
    todo, skipped = [], []
    for e in entries:
        vs = e.get('versions') or []
        if e.get('status') != 'approved' or not vs: continue
        newest = vs[-1].get('file') or vs[-1].get('path')
        if newest not in raws: continue
        (todo if e.get('bake') else skipped).append((e, newest))
    for e, p in skipped: print(f'art_bake: {e["id"]} ({p}) has no `bake` field yet: stored only, nothing baked')
    # a picture in art/raw that no approved entry claims (e.g. committed by hand)
    claimed = {p for _, p in todo + skipped}
    for p in raws:
        if p not in claimed: print(f'art_bake: {p} is not the newest approved version of any entry: ignored')
    if not todo:
        print('art_bake: nothing to bake'); return 0
    notes, ids = [], []
    for e, p in todo:
        b = e['bake']; src = b['src']
        if not src.startswith('tools/sprite-bake/src/') or '..' in src or '..' in b['script'] or '/' in b['script']:
            print(f'art_bake: {e["id"]}: refusing odd bake paths {src!r} {b["script"]!r}'); return 1
        print(f'art_bake: {e["id"]}: {p} -> {src}, then {b["script"]} {" ".join(b.get("args", []))}')
        if dry: continue
        dst = os.path.join(ROOT, src)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if b.get('key') == 'corner':
            col = key_background(os.path.join(ROOT, p), dst)
            notes.append(f'{e["id"]}: background keyed from the corner colour rgb{tuple(col)}')
        else:
            shutil.copyfile(os.path.join(ROOT, p), dst)
        r = sh(sys.executable, '-I', os.path.join('tools', 'sprite-bake', b['script']), *b.get('args', []))
        print(r.stdout[-1500:]); print(r.stderr[-1500:], file=sys.stderr)
        if r.returncode: print(f'art_bake: {b["script"]} failed for {e["id"]}'); return 1
        notes.append(f'{e["id"]}: `{b["script"]} {" ".join(b.get("args", []))}` ran from {p}')
        ids.append(e['id'])
    if dry: return 0
    tag = (argv[argv.index('--tag') + 1] if '--tag' in argv else 'artbake' + os.environ.get('GITHUB_RUN_NUMBER', datetime.datetime.utcnow().strftime('%m%d%H%M')))
    r = sh(sys.executable, os.path.join('tools', 'art-library', 'bump_tags.py'), tag)
    print(r.stdout); print(r.stderr, file=sys.stderr)
    if r.returncode: print('art_bake: tag bump failed, not committing anything'); return 1
    prepend_changes(ids, tag, notes)
    print(f'art_bake: baked {ids}, tag {tag}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
