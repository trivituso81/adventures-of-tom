#!/usr/bin/env python3
"""Art Library bake step (B5). Run by .github/workflows/art-bake.yml after a push that touched art/raw/**, or by hand.

What it does, for every APPROVED entry of data/art-prompts.json whose newest version file changed in this push:
  1. optional background key (entry `bake.key`): the generator's "magenta" comes out crimson (about 214,2,104), so the key colour is read
     from the four corners of the picture, not assumed; pixels close to it that touch the border become transparent;
  2. copies the picture to `bake.src` (a path under tools/sprite-bake/src/ that the bake script reads);
  3. runs the bake script: `python3 -I tools/sprite-bake/<bake.script> <bake.args...>`;
  4. then (once for the whole run) moves every cache tag the tag check demands (tools/art-library/bump_tags.py) and puts a CHANGES entry at the top.
A CLIP entry (field `clip`, tab Clips: a short video of a character, see tools/art-library/clip-prompts.js) needs no `bake`
field: its approved file is art/raw/clips/<id>-v<n>.mp4 (or a .json holding the video's address when the phone could not keep
a copy; the video is then downloaded next to it), and the newest version carries Tom's three marks in seconds
(`marks`: first, hit, last). bake_clip() turns the marks into frame numbers and runs tools/clip-bake/bake_clip.py.
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

def bake_clip(e, p):
    """One approved clip video -> art/clips/<clip.id>.webp + data/clips/<clip.id>.js (+ its <script> tag in index.html). Returns a note."""
    import urllib.request
    c = e['clip']; v = e['versions'][-1]; m = v.get('marks') or {}
    if not re.fullmatch(r'[a-z0-9-]+', c['id']) or not re.fullmatch(r'[a-z0-9]+', c['owner']): raise SystemExit(f'{e["id"]}: odd clip id or owner')
    if not all(isinstance(m.get(k), (int, float)) for k in ('first', 'hit', 'last')) or not (0 <= m['first'] < m['hit'] < m['last']):
        raise SystemExit(f'{e["id"]}: the approved version has no usable START, HIT and END marks: {m}')
    mp4 = os.path.join(ROOT, p)
    if p.endswith('.json'):
        url = json.load(open(mp4, encoding='utf-8'))['url']
        if not url.startswith('https://'): raise SystemExit(f'{e["id"]}: odd video address')
        mp4 = mp4[:-5] + '.mp4'
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'art-bake'}), timeout=120) as r, open(mp4, 'wb') as f: shutil.copyfileobj(r, f)
    pr = sh('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=r_frame_rate,nb_read_frames', '-of', 'json', mp4, check=True)
    st = json.loads(pr.stdout)['streams'][0]; a, b = st['r_frame_rate'].split('/'); fps = float(a) / float(b); nfr = int(st['nb_read_frames'])
    step = max(1, round(c.get('step', 3) * fps / 30))                     # clip.step is written for a 30 a second video
    first = min(nfr - 1, round(m['first'] * fps)); last = min(nfr - 1, round(m['last'] * fps))
    kept = list(range(first, last + 1, step))
    if len(kept) < 4: raise SystemExit(f'{e["id"]}: START and END are too close together ({len(kept)} pictures)')
    impact = min(kept[1:], key=lambda f: abs(f - m['hit'] * fps))         # the kept picture nearest Tom's HIT mark (never the standing first one)
    r = sh(sys.executable, '-I', os.path.join('tools', 'clip-bake', 'bake_clip.py'), mp4, c['id'], c['owner'], '--first', str(first), '--last', str(kept[-1]),
           '--step', str(step), '--impact', str(impact), '--fig-rows', str(c['figRows']), '--speed', str(c.get('speed', 1)), '--fps', str(fps))
    print(r.stdout[-1500:]); print(r.stderr[-1500:], file=sys.stderr)
    if r.returncode: raise SystemExit(f'art_bake: bake_clip.py failed for {e["id"]}')
    tagline = f'<script src="data/clips/{c["id"]}.js?v=clip0"></script>'       # bump_tags moves the tag
    ix = os.path.join(ROOT, 'index.html'); html = open(ix, encoding='utf-8').read()
    if f'data/clips/{c["id"]}.js' not in html:
        tags = re.findall(r'<script src="data/clips/[^"]+"></script>\n', html)
        if not tags: raise SystemExit('art_bake: index.html has no data/clips script tag to put the new clip next to')
        html = html.replace(tags[-1], tags[-1] + tagline + '\n'); open(ix, 'w', encoding='utf-8').write(html)
    return f'{e["id"]}: clip `{c["id"]}` cut from {p} ({fps:g} pictures a second; video frames {first} to {kept[-1]}, every {step}, hit at frame {impact}; {len(kept)} pictures kept). {r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""}'

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
    raws = [p for p in files if p.startswith('art/raw/') and (p.lower().endswith('.png') or (p.startswith('art/raw/clips/') and p.lower().endswith(('.mp4', '.json')))) and os.path.exists(os.path.join(ROOT, p))]
    if not raws:
        print('art_bake: no art/raw picture changed, nothing to do'); return 0
    entries = json.load(open(DATA, encoding='utf-8'))['entries']
    todo, skipped = [], []
    for e in entries:
        vs = e.get('versions') or []
        if e.get('status') != 'approved' or not vs: continue
        newest = vs[-1].get('file') or vs[-1].get('path')
        if newest not in raws: continue
        (todo if e.get('bake') or e.get('clip') else skipped).append((e, newest))
    for e, p in skipped: print(f'art_bake: {e["id"]} ({p}) has no `bake` field yet: stored only, nothing baked')
    # a picture in art/raw that no approved entry claims (e.g. committed by hand)
    claimed = {p for _, p in todo + skipped}
    for p in raws:
        if p not in claimed: print(f'art_bake: {p} is not the newest approved version of any entry: ignored')
    if not todo:
        print('art_bake: nothing to bake'); return 0
    notes, ids = [], []
    for e, p in todo:
        if e.get('clip'):
            print(f'art_bake: {e["id"]}: clip video {p} -> art/clips/{e["clip"]["id"]}.webp')
            if not dry: notes.append(bake_clip(e, p)); ids.append(e['id'])
            continue
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
