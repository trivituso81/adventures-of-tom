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
A START PICTURE entry (field `startpic`, movebench13: a start picture made for one move, tools/art-library/start-prompts.js) is baked by tools/movebench/ownstart.py (the Direct-Hero hand band:
the factory's own register_edit, lock_hero_pixels and gate1_measured, unchanged) to art/clips/start/<who>-<slug>.png; a picture that fails Gate 1 is named in the CHANGES entry and nothing is written.
A STAGE entry (field `stage`, movebench10: a Battle stage object picture, tools/art-library/stage-prompts.js) is baked by tools/clip-bake/bake_stage.py.
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
    study = bool(c.get('test'))                                              # a study video (clipstudy1): keep the video, cut nothing
    kind = c.get('kind', 'strike')                                           # strike | loop | state (tools/clip-bake/bake_clip.py); only a strike has a HIT
    if kind not in ('strike', 'loop', 'state'): raise SystemExit(f'{e["id"]}: odd clip kind {kind!r}')
    need = ('first', 'hit', 'last') if kind == 'strike' else ('first', 'last')
    if not study and (not all(isinstance(m.get(k), (int, float)) for k in need) or not all(m[a] < m[b] for a, b in zip(need, need[1:])) or m['first'] < 0):
        raise SystemExit(f'{e["id"]}: the approved version has no usable {", ".join(need)} marks: {m}')
    mp4 = os.path.join(ROOT, p)
    if p.endswith('.json'):
        d = json.load(open(mp4, encoding='utf-8'))
        if d.get('src'):                                                     # the same video approved again (new marks or speed): the game's own copy
            if not re.fullmatch(r'art/raw/clips/[a-z0-9-]+\.mp4', d['src']) or not os.path.exists(os.path.join(ROOT, d['src'])): raise SystemExit(f'{e["id"]}: the earlier copy {d["src"]!r} is not in the game files')
            mp4 = os.path.join(ROOT, d['src'])
        else:
            url = d['url']
            if not url.startswith('https://'): raise SystemExit(f'{e["id"]}: odd video address')
            mp4 = mp4[:-5] + '.mp4'
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'art-bake'}), timeout=120) as r, open(mp4, 'wb') as f: shutil.copyfileobj(r, f)
    if study: return f'{e["id"]}: study video saved as {os.path.relpath(mp4, ROOT)} ({os.path.getsize(mp4) // 1024} KB). No clip was cut and nothing in the game changed.'
    pr = sh('ffmpeg', '-nostdin', '-i', mp4)                              # ffmpeg only (no ffprobe): it prints the video's facts and stops
    fm = re.search(r', ([\d.]+) fps', pr.stderr); dm = re.search(r'Duration: (\d+):(\d+):([\d.]+)', pr.stderr)
    if not fm or not dm: raise SystemExit(f'{e["id"]}: could not read the video {p}\n{pr.stderr[-600:]}')
    fps = float(fm.group(1)); nfr = max(1, round((int(dm.group(1)) * 3600 + int(dm.group(2)) * 60 + float(dm.group(3))) * fps))
    speed = m.get('speed') if isinstance(m.get('speed'), (int, float)) and .25 <= m['speed'] <= 8 else c.get('speed', 1)   # Tom's SPEED pick in REVIEW wins over the entry's
    step = max(1, round(c.get('step', 3) * fps / 30))                     # clip.step is written for a 30 a second video
    first = min(nfr - 1, round(m['first'] * fps)); last = min(nfr - 1, round(m['last'] * fps))
    kept = list(range(first, last + 1, step))
    pace = ','.join(f'{round(s * fps)}:{max(1, round(st * fps / 30))}:{sp:g}' for s, st, sp in c.get('pace', []))   # clip.pace: [[second, step, speed], ...] (bake_clip.py --pace)
    if len(kept) < 4: raise SystemExit(f'{e["id"]}: START and END are too close together ({len(kept)} pictures)')
    impact = min(kept[1:], key=lambda f: abs(f - m['hit'] * fps)) if kind == 'strike' else -1   # the kept picture nearest Tom's HIT mark (never the standing first one)
    r = sh(sys.executable, '-I', os.path.join('tools', 'clip-bake', 'bake_clip.py'), mp4, c['id'], c['owner'], '--first', str(first), '--last', str(kept[-1]),
           '--step', str(step), '--impact', str(impact), '--fig-rows', str(c['figRows']), '--speed', str(speed), '--fps', str(fps), '--kind', kind, '--k', str(c.get('k', 4)), *(['--pace', pace] if pace else []),
           *(['--calm', str(c['calm'])] if c.get('calm') and kind == 'loop' else []), *(['--wrap'] if c.get('wrap') and kind == 'loop' else []), '--stamp', clip_stamp(e))   # clip.wrap (clipch1fix): the game plays the loop forward only   # clip.calm (seconds, clipfoes1): the baker picks the calmest stretch between START and END
    print(r.stdout[-1500:]); print(r.stderr[-1500:], file=sys.stderr)
    if r.returncode: raise SystemExit(f'art_bake: bake_clip.py failed for {e["id"]}')
    tagline = f'<script src="data/clips/{c["id"]}.js?v=clip0"></script>'       # bump_tags moves the tag
    ix = os.path.join(ROOT, 'index.html'); html = open(ix, encoding='utf-8').read()
    if f'data/clips/{c["id"]}.js' not in html:
        tags = re.findall(r'<script src="data/clips/[^"]+"></script>\n', html)
        if not tags: raise SystemExit('art_bake: index.html has no data/clips script tag to put the new clip next to')
        html = html.replace(tags[-1], tags[-1] + tagline + '\n'); open(ix, 'w', encoding='utf-8').write(html)
    return f'{e["id"]}: clip `{c["id"]}` cut from {p} ({fps:g} pictures a second; video frames {first} to {kept[-1]}, every {step}, {"hit at frame " + str(impact) if kind == "strike" else kind}; {len(kept)} pictures kept; played at {speed:g}x). {r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""}' + (' Calm stretch: ' + next((l for l in r.stdout.splitlines() if l.startswith('calm stretch')), '?') if c.get('calm') and kind == 'loop' else '')

def bake_stage(e, p):
    """movebench10: one approved Battle stage object picture (field `stage`, tab Props, tools/art-library/stage-prompts.js) -> art/stage/<owner>-<name>.webp + data/stage/<owner>-<name>.js
    through tools/clip-bake/bake_stage.py (the magenta key reads its colour from the corners, so the generator's crimson is fine) and its <script> tag in index.html after the other stage assets."""
    s = e['stage']; key = s.get('key', '')
    if not re.fullmatch(r'[a-z0-9]+/[a-z0-9]+', key) or s.get('kind') != 'prop' or s.get('bg') != 'magenta': raise SystemExit(f'{e["id"]}: odd stage entry {s!r} (a picture is a prop on magenta, key owner/name)')
    if not p.startswith('art/raw/') or '..' in p: raise SystemExit(f'{e["id"]}: odd picture path {p!r}')
    r = sh(sys.executable, '-I', os.path.join('tools', 'clip-bake', 'bake_stage.py'), os.path.join(ROOT, p), key, '--kind', 'prop', '--bg', 'magenta', '--px', str(s.get('px') or 384), '--tag', 'stage0')
    print(r.stdout[-1200:]); print(r.stderr[-1200:], file=sys.stderr)
    if r.returncode: raise SystemExit(f'art_bake: bake_stage.py failed for {e["id"]}')
    fk = key.replace('/', '-'); ix = os.path.join(ROOT, 'index.html'); html = open(ix, encoding='utf-8').read()
    if f'data/stage/{fk}.js' not in html:
        tags = re.findall(r'<script src="data/stage/[^"]+"></script>\n', html)
        anchor = tags[-1] if tags else (re.search(r'<script src="engine/b3-stage\.js[^"]*"></script>\n', html) or [None])[0]
        if not anchor: raise SystemExit('art_bake: index.html has no engine/b3-stage.js script tag to put the stage asset after')
        open(ix, 'w', encoding='utf-8').write(html.replace(anchor, anchor + f'<script src="data/stage/{fk}.js?v=stage0"></script>\n', 1))
    return f'{e["id"]}: stage object `{key}` baked from {p}. {r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""}'

def bake_start(e, p):
    """movebench13: one approved start picture of one move (field `startpic`) -> art/clips/start/<who>-<slug>.png. The hand band of the Library's picture is put on the person's standard start picture
    (tools/movebench/ownstart.py); the head, the face and the body proportions stay the standard picture's pixels. Returns a note; raises when Gate 1 fails."""
    s = e['startpic']; who, slug = s.get('who', ''), s.get('slug', '')
    if not re.fullmatch(r'[a-z0-9]+', who) or not re.fullmatch(r'[a-z0-9-]+', slug) or e['id'] != f'start-{who}-{slug}': raise SystemExit(f'{e["id"]}: odd start picture entry {s!r}')
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'movebench'))
    import ownstart
    out = os.path.join(ROOT, 'art', 'clips', 'start', f'{who}-{slug}.png')
    try: rep = ownstart.finish(who, os.path.join(ROOT, p), out, ROOT)
    except ownstart.StartPicError as x: raise SystemExit(str(x))
    return f'{e["id"]}: start picture of {who} for {s.get("move", slug)} baked from {p}: only the hand band is the Library picture, the rest is the standard start picture (head difference {rep["gate1"]["head_mean_abs_diff_vs_hero"]}). It is the start picture of that move now: Make this video uses it.'

def stale_stage(entries):
    """Approved stage objects the game does not have yet (a cancelled run would leave one uncut; clipbatch1's reason, for pictures)."""
    out = set()
    for e in entries:
        s = e.get('stage'); vs = e.get('versions') or []
        if not s or e.get('status') != 'approved' or not vs or not isinstance(s, dict) or not re.fullmatch(r'[a-z0-9]+/[a-z0-9]+', s.get('key', '')): continue
        newest = vs[-1].get('file') or vs[-1].get('path') or ''
        if newest and os.path.exists(os.path.join(ROOT, newest)) and not os.path.exists(os.path.join(ROOT, 'data', 'stage', s['key'].replace('/', '-') + '.js')): out.add(e['id'])
    return out

def clip_stamp(e):
    """What a baked clip was cut from: the newest approved file and its marks. bake_clip.py writes it into data/clips/<id>.js."""
    v = e['versions'][-1]
    return (v.get('file') or v.get('path') or '') + ' ' + json.dumps(v.get('marks') or {}, sort_keys=True)

def stale_clips(entries):
    """Approved clips that were never cut, or were cut from an older approval (clipbatch1). A batch approves dozens of clips in a row, each
    approval starts this job, and GitHub keeps only the newest waiting run per workflow: a run that is cancelled would leave its clip
    uncut. So every run also cuts any approved clip the game does not have yet. A clip file with no stamp (cut before clipbatch1) counts as current."""
    out = set()
    for e in entries:
        c = e.get('clip'); vs = e.get('versions') or []
        if not c or c.get('test') or e.get('status') != 'approved' or not vs: continue
        newest = vs[-1].get('file') or vs[-1].get('path') or ''
        if not newest or not os.path.exists(os.path.join(ROOT, newest)): continue
        js = os.path.join(ROOT, 'data', 'clips', c['id'] + '.js')
        if not os.path.exists(js): out.add(e['id']); continue
        m = re.search(r'^// Baked from: (.*)$', open(js, encoding='utf-8').read(), re.M)
        if m and m.group(1).strip() != clip_stamp(e): out.add(e['id'])
    return out

def next_number():
    f = os.path.join(ROOT, 'docs', 'CHANGES.md')
    nums = [int(m) for m in re.findall(r'^## \d{4}-\d{2}-\d{2} \((\d+)\)', open(f, encoding='utf-8').read(), re.M)]
    return (max(nums) + 1) if nums else 1

def prepend_changes(ids, tag, notes):
    f = os.path.join(ROOT, 'docs', 'CHANGES.md')
    txt = open(f, encoding='utf-8').read()
    today = datetime.date.today().isoformat()
    body = (f'## {today} ({next_number()}): Art Library bake, {", ".join(ids) if len(ids) <= 6 else str(len(ids)) + " entries"} (`{tag}`, made by the art-bake Action)\n\n'
            f'- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).\n'
            + ''.join(f'- {n}\n' for n in notes)
            + '- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.\n\n')
    open(f, 'w', encoding='utf-8').write(body + txt)

def main():
    argv = sys.argv[1:]
    dry = '--dry' in argv
    files = changed_files(argv)
    raws = [p for p in files if p.startswith('art/raw/') and (p.lower().endswith('.png') or (p.startswith('art/raw/clips/') and p.lower().endswith(('.mp4', '.json')))) and os.path.exists(os.path.join(ROOT, p))]
    entries = json.load(open(DATA, encoding='utf-8'))['entries']
    catchup = stale_clips(entries) | stale_stage(entries)
    if not raws and not catchup:
        print('art_bake: no art/raw picture changed, nothing to do'); return 0
    todo, skipped = [], []
    for e in entries:
        vs = e.get('versions') or []
        if e.get('status') != 'approved' or not vs: continue
        newest = vs[-1].get('file') or vs[-1].get('path')
        if newest not in raws and e['id'] not in catchup: continue
        (todo if e.get('bake') or e.get('clip') or e.get('stage') or e.get('startpic') else skipped).append((e, newest))
    for e, p in skipped: print(f'art_bake: {e["id"]} ({p}) has no `bake` field yet: stored only, nothing baked')
    # a picture in art/raw that no approved entry claims (e.g. committed by hand)
    claimed = {p for _, p in todo + skipped}
    for p in raws:
        if p not in claimed: print(f'art_bake: {p} is not the newest approved version of any entry: ignored')
    if not todo:
        print('art_bake: nothing to bake'); return 0
    notes, ids, failed = [], [], []
    for e, p in todo:
        if e.get('clip'):
            print(f'art_bake: {e["id"]}: clip video {p} -> art/clips/{e["clip"]["id"]}.webp' + (' (catch-up: not cut yet)' if e['id'] in catchup and p not in raws else ''))
            if not dry:
                try: notes.append(bake_clip(e, p)); ids.append(e['id'])
                except (SystemExit, Exception) as x:   # one bad clip must not stop the other 69 (clipbatch1); it is named in the CHANGES entry and tried again by the next run
                    failed.append(e['id']); notes.append(f'FAILED to cut {e["id"]} ({p}): {x}'); print(f'art_bake: FAILED {e["id"]}: {x}', file=sys.stderr)
            continue
        if e.get('startpic'):
            print(f'art_bake: {e["id"]}: start picture {p} -> art/clips/start/{e["startpic"].get("who")}-{e["startpic"].get("slug")}.png')
            if not dry:
                try: notes.append(bake_start(e, p)); ids.append(e['id'])
                except (SystemExit, Exception) as x:
                    failed.append(e['id']); notes.append(f'FAILED to bake {e["id"]} ({p}): {x}'); print(f'art_bake: FAILED {e["id"]}: {x}', file=sys.stderr)
            continue
        if e.get('stage'):
            print(f'art_bake: {e["id"]}: stage object picture {p} -> data/stage/' + e['stage']['key'].replace('/', '-') + '.js')
            if not dry:
                try: notes.append(bake_stage(e, p)); ids.append(e['id'])
                except (SystemExit, Exception) as x:
                    failed.append(e['id']); notes.append(f'FAILED to bake {e["id"]} ({p}): {x}'); print(f'art_bake: FAILED {e["id"]}: {x}', file=sys.stderr)
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
    if not ids and failed:
        print(f'art_bake: nothing could be cut: {failed}'); return 0
    tag = (argv[argv.index('--tag') + 1] if '--tag' in argv else 'artbake' + os.environ.get('GITHUB_RUN_NUMBER', datetime.datetime.utcnow().strftime('%m%d%H%M')))
    r = sh(sys.executable, os.path.join('tools', 'art-library', 'bump_tags.py'), tag)
    print(r.stdout); print(r.stderr, file=sys.stderr)
    if r.returncode: print('art_bake: tag bump failed, not committing anything'); return 1
    prepend_changes(ids, tag, notes)
    print(f'art_bake: baked {ids}, tag {tag}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
