#!/usr/bin/env python3
"""guidegen1: USE THIS ONE in the Battle Guide. Puts a take into the game and purges what it replaces.

  python3 -I tools/guidegen/use_take.py --state DIR [--root REPO] --requests FILE [--tag guideuse-...]

Each request {anim, take, at, prompt} (guideflow7: tools/guidegen/apply.py writes the list from the rows of queue.json whose use is wanted and passes it with --requests):
  1. the take's video and marks come from DIR (the branch `guidegen`, takes.json); the prompt is the one Tom used (his edits included);
  2. the video is cut into art/clips/<clip>.webp and data/clips/<clip>.js (tools/clip-bake/bake_clip.py, the recipe of its kind) and its <script> tag is added to index.html;
  3. the source and the prompt are kept where the next try starts from: family clips as tools/art-library/prompts/wan-<job>-v<rev>.txt and art/raw/clips/wan-<job>-v<rev>.mp4
     with the job's `rev` raised in tools/art-library/wangen-jobs.json; monster clips as a new version of the entry in data/art-prompts.json (promptRev raised, status approved);
  4. the animation points at the clip: B3_BODY_CLIPS for a body state (and the painted row of that state is removed from B3_BODY_PAINT), `anim:{kind:'clip',clip}` on a move or
     act row, `wind:` on a wind-up (data/b3-*.js);
  5. data/guide-prompts.json records the used prompt (source `used`), data/guide-anims.json is rebuilt, and the build is named, tagged and logged (bump_tags.py, docs/CHANGES.md).
It changes files only; tools/guidegen/apply.py (workflow guide-apply) commits and pushes them, one build for every take of the batch."""
import argparse, datetime, json, os, re, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT0 = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT0, 'tools', 'art-library'))
import recipe as RC


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def jread(p, d=None):
    try: return json.load(open(p, encoding='utf-8'))
    except (OSError, ValueError): return d
def jdump(d, indent=1): return json.dumps(d, indent=indent, ensure_ascii=False) + '\n'


def wire_state(root, owner, state, clip_key, purge=True):
    """B3_BODY_CLIPS[owner][state] = clip; the painted row of that state goes (no painted pose in battle, CLAUDE.md). Returns notes."""
    f = os.path.join(root, 'data', 'b3-clips.js'); t = open(f, encoding='utf-8').read(); notes = []
    m = re.search(r"const B3_BODY_CLIPS=\{(.*?)\n\};", t, re.S)
    if not m: raise RuntimeError('B3_BODY_CLIPS not found in data/b3-clips.js')
    body = m.group(1)
    om = re.search(r"(\n  %s:\s*\{)([^}]*)(\})" % re.escape(owner), body)
    if om:
        items = [x for x in om.group(2).split(',') if x.strip()]
        kept = [x for x in items if x.split(':')[0].strip() != state]
        had = [x for x in items if x.split(':')[0].strip() == state]
        new = kept + ["%s:'%s'" % (state, clip_key)]
        body2 = body[:om.start(2)] + ','.join(new) + body[om.end(2):]
        notes.append('B3_BODY_CLIPS.%s.%s = %s%s' % (owner, state, clip_key, ' (was %s)' % had[0].split(':')[1].strip() if had else ''))
    else:
        body2 = body.rstrip() + ",\n  %s:{%s:'%s'}" % (owner, state, clip_key); notes.append('B3_BODY_CLIPS.%s.%s = %s (new owner row)' % (owner, state, clip_key))
    t = t[:m.start(1)] + body2 + t[m.end(1):]
    if purge:
        pm = re.search(r"const B3_BODY_PAINT=\{(.*?)\n\};", t, re.S)
        if pm and re.search(r"\b%s\s*:\s*\{[^}]*\b%s\s*:" % (re.escape(owner), re.escape(state)), pm.group(1)):
            pb = pm.group(1)
            om2 = re.search(r"(\b%s\s*:\s*\{)([^}]*)(\})" % re.escape(owner), pb)
            items = [x for x in om2.group(2).split(',') if x.strip() and x.split(':')[0].strip() != state]
            pb2 = pb[:om2.start(2)] + ','.join(items) + pb[om2.end(2):]
            t = t[:pm.start(1)] + pb2 + t[pm.end(1):]; notes.append('removed the painted %s.%s from B3_BODY_PAINT' % (owner, state))
    open(f, 'w', encoding='utf-8').write(t)
    return notes


def wire_row(root, anim_id, clip_key):
    """A move or act row points at the clip (a foe's wind-up through `wind:`). The row is found from the animation id
    (move:<skill>, act:<foe>:<act>, wind:<foe>:<act>). Returns notes."""
    import glob
    parts = anim_id.split(':'); kind = parts[0]
    if kind == 'answer':
        # movebench11: the counter video is the spec's `answer.clip` (data/moves/move-<skill>.json); the spec is rewritten the way the workbench's Finished does (rev + 1, a log line by claude) and bundled
        f = os.path.join(root, 'data', 'moves', 'move-%s.json' % parts[1].replace('_', '-'))
        if not os.path.exists(f): raise RuntimeError('the move %s has no spec file (%s) to put the counter video in' % (parts[1], os.path.relpath(f, root)))
        d = json.load(open(f, encoding='utf-8')); live = d.setdefault('live', {}); an = live.setdefault('answer', {})
        an['clip'] = clip_key; d['rev'] = int(d.get('rev') or 0) + 1
        d.setdefault('log', []).append({'rev': d['rev'], 'by': 'claude', 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'what': 'counter video %s from the Battle Guide' % clip_key})
        open(f, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
        r = subprocess.run([sys.executable, '-I', os.path.join(root, 'tools', 'movebench', 'bundle.py')], capture_output=True, text=True, cwd=root)
        if r.returncode: raise RuntimeError('bundle.py failed: ' + (r.stderr or r.stdout)[-300:])
        return ['move %s answer.clip = %s (%s)' % (parts[1], clip_key, os.path.relpath(f, root))]
    if kind == 'move':
        key = parts[1]
        for f in sorted(glob.glob(os.path.join(root, 'data', 'b3-kit-*.js'))):
            lines = open(f, encoding='utf-8').read().split('\n')
            for i, ln in enumerate(lines):
                if ln.startswith('B3_SKILLS.%s={' % key):
                    end = i
                    for j in range(i, min(i + 12, len(lines))):
                        end = j
                        if lines[j].rstrip().endswith('};') or (j > i and lines[j].startswith('B3_SKILLS.')): break
                    for j in range(i, end + 1):
                        am = re.search(r"anim:\{([^}]*)\}", lines[j])
                        if am:
                            rest = [x for x in am.group(1).split(',') if x.strip() and x.split(':')[0].strip() not in ('kind', 'clip')]
                            lines[j] = lines[j][:am.start()] + "anim:{kind:'clip',clip:'%s'%s}" % (clip_key, ''.join(',' + x for x in rest)) + lines[j][am.end():]
                            open(f, 'w', encoding='utf-8').write('\n'.join(lines)); return ['move %s anim = clip %s (%s)' % (key, clip_key, os.path.relpath(f, root))]
                    for j in range(i, end + 1):          # a move with no anim: put one in before its closing
                        if lines[j].rstrip().endswith('};'):
                            lines[j] = lines[j].rstrip()[:-2].rstrip().rstrip(',') + ",anim:{kind:'clip',clip:'%s'}};" % clip_key
                            open(f, 'w', encoding='utf-8').write('\n'.join(lines)); return ['move %s got anim = clip %s (%s)' % (key, clip_key, os.path.relpath(f, root))]
        raise RuntimeError('did not find the move %s (or its anim) in data/b3-kit-*.js' % key)
    foe, act = parts[1], parts[2]
    for f in sorted(glob.glob(os.path.join(root, 'data', 'b3-foes-ch*.js'))):
        lines = open(f, encoding='utf-8').read().split('\n'); inside = False
        for i, ln in enumerate(lines):
            if ln.startswith('B3_FOES.'): inside = ln.startswith('B3_FOES.%s=' % foe)
            if inside and re.search(r"\{id:'%s'," % re.escape(act), ln):
                if kind == 'wind':
                    if not re.search(r"\bwind:'[a-z0-9_]+'", ln): raise RuntimeError('act %s has no wind: to change' % act)
                    lines[i] = re.sub(r"\bwind:'[a-z0-9_]+'", "wind:'%s'" % clip_key, ln, 1); note = '%s:%s wind = %s' % (foe, act, clip_key)
                else:
                    am = re.search(r"anim:\{([^}]*)\}", ln)
                    if am:
                        rest = [x for x in am.group(1).split(',') if x.strip() and x.split(':')[0].strip() not in ('kind', 'clip')]
                        lines[i] = ln[:am.start()] + "anim:{kind:'clip',clip:'%s'%s}" % (clip_key, ''.join(',' + x for x in rest)) + ln[am.end():]; note = '%s:%s anim = clip %s' % (foe, act, clip_key)
                    elif re.search(r"\beffects:\[", ln):
                        lines[i] = re.sub(r"\beffects:\[", "anim:{kind:'clip',clip:'%s'},effects:[" % clip_key, ln, 1); note = '%s:%s got anim = clip %s' % (foe, act, clip_key)
                    else: raise RuntimeError('act %s has no anim: or effects: to put the clip next to' % act)
                open(f, 'w', encoding='utf-8').write('\n'.join(lines)); return [note + ' (%s)' % os.path.relpath(f, root)]
    raise RuntimeError('did not find act %s of %s in data/b3-foes-ch*.js' % (act, foe))


def ensure_script_tag(root, clip_id):
    ix = os.path.join(root, 'index.html'); html = open(ix, encoding='utf-8').read()
    if 'data/clips/%s.js' % clip_id in html: return False
    tags = re.findall(r'<script src="data/clips/[^"]+"></script>\n', html)
    if not tags: raise RuntimeError('index.html has no data/clips script tag to put the new clip next to')
    open(ix, 'w', encoding='utf-8').write(html.replace(tags[-1], tags[-1] + '<script src="data/clips/%s.js?v=clip0"></script>\n' % clip_id)); return True


def _snapshot(root):
    """What a use may touch: the bytes of the files it edits, the names in the folders it adds to."""
    import glob
    files = {}
    for pat in ('data/art-prompts.json', 'tools/art-library/wangen-jobs.json', 'index.html', 'data/b3-clips.js', 'data/b3-kit-*.js', 'data/b3-foes-ch*.js', 'data/guide-prompts.json'):
        for f in glob.glob(os.path.join(root, pat)): files[f] = open(f, 'rb').read()
    dirs = {d: set(os.listdir(os.path.join(root, d))) if os.path.isdir(os.path.join(root, d)) else None
            for d in ('art/raw/clips', 'tools/art-library/prompts', 'data/clips', 'art/clips')}
    return files, dirs


def _rollback(root, snap):
    files, dirs = snap
    for f, b in files.items(): open(f, 'wb').write(b)
    for d, names in dirs.items():
        full = os.path.join(root, d)
        if names is None or not os.path.isdir(full): continue
        for n in set(os.listdir(full)) - names:
            p = os.path.join(full, n); shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)


def use(req, state, root, G, tag):
    """All or nothing: a use that fails half way (the baker, the wire) puts every file back, so a failed take never leaves a
    saved video with no clip behind it (guideusefix1: the run committed art/raw/clips/wan-rose-giddyup-v9.mp4 and nothing else)."""
    snap = _snapshot(root)
    try: return _use(req, state, root, G, tag)
    except BaseException:
        _rollback(root, snap); raise


def _use(req, state, root, G, tag):
    a = G['guide']['anims'].get(req['anim'])
    if not a: raise RuntimeError('no animation %s' % req['anim'])
    A = (state.get('anims') or {}).get(req['anim']) or {}
    t = next((x for x in A.get('takes', []) if x['n'] == int(req['take'])), None)
    if not t or not t.get('video') or not t.get('marks'): raise RuntimeError('take %s of %s has no video and marks to use' % (req['take'], req['anim']))
    vsrc = os.path.join(state['_dir'], t['video'])
    if not os.path.exists(vsrc): raise RuntimeError('the video of take %s is not on the branch any more' % req['take'])
    prompt = (req.get('prompt') or t.get('prompt') or '').strip()
    arts = jread(os.path.join(root, 'data', 'art-prompts.json'), {'entries': []})
    existing = next((e for e in arts['entries'] if e['id'] == a.get('entry')), None)
    entry = RC.entry_for(dict(a, prompt=prompt), G, existing=existing, root=root); c = entry['clip']; notes = []
    clip_key = a.get('clip') or a['newClip']
    kind = c['kind']; marks = t['marks']
    if a['route'] == 'wan':
        jf = os.path.join(root, 'tools', 'art-library', 'wangen-jobs.json'); raw = open(jf, encoding='utf-8').read(); jobs = json.loads(raw)
        job = a.get('job') or ('%s-%s' % (a['owner'], c['id'][len(a['owner']) + 1:] if c['id'].startswith(a['owner'] + '-') else c['id']))
        if job in jobs: rev = jobs[job]['rev'] + 1
        else:
            import copy
            jobs[job] = copy.deepcopy(jobs['tom-idle']); jobs[job]['frame'] = a['start']; jobs[job].pop('pad', None)
            if a.get('pad'): jobs[job]['pad'] = a['pad']
            rev = 1
        pf = 'tools/art-library/prompts/wan-%s-v%d.txt' % (job, rev)
        open(os.path.join(root, pf), 'w', encoding='utf-8').write(prompt + '\n')
        jobs[job].update(rev=rev, prompt_file=pf)
        indent = 1 if raw.startswith('{\n "') else 2
        open(jf, 'w', encoding='utf-8').write(json.dumps(jobs, indent=indent, ensure_ascii=False) + ('\n' if raw.endswith('\n') else ''))
        rel = 'art/raw/clips/wan-%s-v%d.mp4' % (job, rev)
        stamp_for = lambda words: '%s (wan-gen %s rev %d; %s)' % (rel, job, rev, words)
        notes.append('Wan job %s is now rev %d (prompt file %s)' % (job, rev, pf)); rev_label = 'rev %d' % rev
    else:
        k = max([0] + [v.get('n') or 0 for v in (existing or {}).get('versions') or []]) + 1
        while os.path.exists(os.path.join(root, 'art/raw/clips/%s-v%d.mp4' % (entry['id'], k))): k += 1
        rel = 'art/raw/clips/%s-v%d.mp4' % (entry['id'], k)
        day, now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d'), int(time.time() * 1000)
        if not existing:
            sib = next((e for e in arts['entries'] if (e.get('clip') or {}).get('owner') == a['owner'] and not (e['clip']).get('test')), None)
            existing = {'id': entry['id'], 'tab': 'Clips', 'group': (sib or {}).get('group', 'Chapter 1'), 'title': '%s: %s video clip' % (G['guide']['owners'][a['owner']]['name'], a['name']),
                        'ar': (sib or {}).get('ar', '4:3'), 'refs': [a['start']], 'clip': dict(c), 'versions': [], 'rejects': [], 'promptRev': 0, 'status': 'todo'}
            arts['entries'].append(existing); notes.append('new Art Library entry %s' % entry['id'])
        existing.setdefault('versions', []).append({'n': k - 1, 'file': rel, 'date': day, 'from': 'guide', 'at': now, 'marks': marks})
        existing['prompt'] = prompt; existing['status'] = 'approved'; existing['promptRev'] = int(existing.get('promptRev') or 0) + 1
        open(os.path.join(root, 'data', 'art-prompts.json'), 'w', encoding='utf-8').write(jdump(arts))
        stamp_for = lambda words: rel + ' ' + json.dumps(marks, sort_keys=True)
        rev_label = 'prompt v%d' % existing['promptRev']
        notes.append('%s is version %d of %s' % (rel, k, entry['id']))
    os.makedirs(os.path.dirname(os.path.join(root, rel)), exist_ok=True); shutil.copyfile(vsrc, os.path.join(root, rel))
    args, words, kept = RC.bake_args(entry, os.path.join(root, rel), marks)
    r = subprocess.run([sys.executable, '-I', os.path.join(root, 'tools', 'clip-bake', 'bake_clip.py'), os.path.join(root, rel), c['id'], c['owner'], *args, '--stamp', stamp_for(words)], capture_output=True, text=True, cwd=root)
    if r.returncode: raise RuntimeError('the baker failed: ' + (r.stderr or r.stdout)[-300:])
    notes.append('clip %s cut (%d pictures, %s)' % (clip_key, len(kept), words))
    if ensure_script_tag(root, c['id']): notes.append('script tag added to index.html')
    # point the animation at it, and purge what it replaces
    if a['kind'] == 'state':
        notes += wire_state(root, a['owner'], a['state'], clip_key)
    else:
        notes += wire_row(root, req['anim'], clip_key)
    gp = jread(os.path.join(root, 'data', 'guide-prompts.json'), {'anims': {}}); gp.setdefault('anims', {})[req['anim']] = {'prompt': prompt, 'rev': (existing or {}).get('promptRev', 0) if a['route'] == 'xai' else rev, 'source': 'used'}
    open(os.path.join(root, 'data', 'guide-prompts.json'), 'w', encoding='utf-8').write(jdump(gp))
    t['used'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())   # guidestatus1: the list stops showing Ready to review
    return {'anim': req['anim'], 'name': a['name'], 'owner': a['owner'], 'clip': clip_key, 'rev': rev_label, 'notes': notes, 'files': [rel], 'clip_id': c['id'],
            'clip_files': ['art/clips/%s.webp' % c['id'], 'data/clips/%s.js' % c['id']]}   # guideflow7: apply.py confirms these on main after the push


def write_changes(report, tag, root):
    """docs/CHANGES.md heading and notes for a build made of used takes (the build history reads the heading)."""
    rep = jread(report, {'done': [], 'failed': []})
    if not rep.get('done'): return 0
    day = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    names = ', '.join(d['name'] + ' (' + d['owner'] + ')' for d in rep['done'])[:160]
    out = ['## %s (%s): %s now plays a video chosen in the Battle Guide' % (tag, day, names), '',
           'Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.']
    for d in rep['done']:
        out.append('- %s (`%s`, %s): %s' % (d['name'], d['anim'], d['rev'], '; '.join(d['notes'])))
    for f in rep.get('failed') or []: out.append('- not used, %s: %s' % (f['anim'], f['why']))
    p = os.path.join(root, 'docs', 'CHANGES.md'); old = open(p, encoding='utf-8').read()
    open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n\n' + old); return 0


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('--state', default=''); ap.add_argument('--root', default=ROOT0); ap.add_argument('--requests', default='')
    ap.add_argument('--tag', default=''); ap.add_argument('--changes', default='')
    a = ap.parse_args(argv)
    if a.changes: return write_changes(a.changes, a.tag, a.root)
    if not a.state or not a.requests: ap.error('--state and --requests are required')
    root = a.root; sys.path.insert(0, os.path.join(root, 'tools', 'guidegen'))
    doc = jread(os.path.join(root, a.requests), {'requests': []}); reqs = [r for r in doc.get('requests') or [] if r.get('anim') and r.get('take')]
    say('%d use request(s) found' % len(reqs))
    if not reqs: return 0
    state = jread(os.path.join(a.state, 'takes.json'), {'anims': {}}); state['_dir'] = a.state
    G = RC.load(root); G['root'] = root
    done, failed = [], []
    for r in reqs:
        try: done.append(use(r, state, root, G, a.tag)); say('used', r['anim'], 'take', r['take'])
        except Exception as x: failed.append({'anim': r['anim'], 'why': str(x)[:300]}); say('FAILED', r['anim'], str(x)[:300])
    if done:   # only the used animations go back to the branch (keep.py merges them by take)
        json.dump({'anims': {d['anim']: {k: v for k, v in state['anims'][d['anim']].items()} for d in done}}, open(os.path.join(a.state, 'takes-used.json'), 'w'), indent=1)
    json.dump({'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'reqs': [r.get('at') for r in reqs], 'tag': a.tag, 'done': done, 'failed': failed}, open(os.path.join(a.state, 'use-report.json'), 'w'), indent=1)
    if failed: say('USE FAILED for %d of %d; nothing of them was kept' % (len(failed), len(reqs)))
    if done:
        subprocess.run(['node', os.path.join(root, 'tools', 'guidegen', 'build_map.js')], cwd=root, check=False)
    return 0 if not failed else 2


if __name__ == '__main__':
    sys.exit(main())
