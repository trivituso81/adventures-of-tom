#!/usr/bin/env python3
"""Script Editor index builder (Script Editor step 1). Run from the repo root:  python3 tools/script-index/build.py
Loads the game headless, reads every scene (walk.js), adds clip status from data/voice-index.json, the cue words of listener reactions
(docs/emotion-reactions.tsv), hand-written action text (docs/script-actions.tsv) and Play recipes (docs/script-recipes.json),
then writes data/script-index.json. Prints the counts and the list of steps that still read "[something happens]".
Run it after ANY change to a scene (it is part of the push procedure)."""
import os, sys, json, csv, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
def tsv(path):
    p = os.path.join(ROOT, path)
    if not os.path.exists(p): return []
    with open(p, encoding='utf8', newline='') as f: return list(csv.DictReader(f, delimiter='\t'))
actions = {}
for r in tsv('docs/script-actions.tsv'):
    actions[r['scene'] + ':' + r['step']] = r['text'].strip()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = open(os.path.join(ROOT, 'tools', 'script-index', 'walk.js'), encoding='utf8').read()
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    pg = br.new_page(viewport={'width': 430, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=180000)
    # the chapter dialogue clip files load one after another after start; wait until every one has loaded
    pg.wait_for_function("()=>{ const f=(DIALOG_CAST.files||[]); return f.every(u=>[...document.scripts].some(s=>s.src.endsWith(u))); }", timeout=240000)
    pg.wait_for_timeout(4000)
    res = pg.evaluate(JS, actions)
    br.close()
# clip status from the Voice Library index: it.f<0 means no clip; it.ov an old (pre recast) clip
vi = json.load(open(os.path.join(ROOT, 'data', 'voice-index.json'), encoding='utf8'))
byk = {}
for it in vi['items']:
    if it.get('ty') == 'd': byk.setdefault((it['v'], it['x']), it)
# cue words of reactions
cue = {}
for r in tsv('docs/emotion-reactions.tsv'):
    cue[(r['speaker'], r['text'], r['listener'])] = r['at']
nlines = nclip = 0
for sid, sc in res['scenes'].items():
    seen = {}
    for st in sc['steps']:
        if st['k'] != 'talk': continue
        for ln in st['lines']:
            nlines += 1
            base = st['who'] + '|' + ln['t']; seen[base] = seen.get(base, 0) + 1
            ln['ref'] = base if seen[base] == 1 else base + '#' + str(seen[base])
            it = byk.get((st['vid'], ln['t']))
            ln['key'] = (st['vid'] or '') + '|' + ln['t']
            ln['status'] = 'none'
            if ln['clip'] or (it and it.get('f', -1) >= 0): ln['status'] = 'old' if (it and it.get('ov')) else 'clip'
            if it and it.get('f', -1) >= 0: ln['f'] = it['f']
            if it and it.get('s'): ln['s'] = it['s']
            del ln['clip']
            if ln['status'] != 'none': nclip += 1
            if ln.get('react'):
                ln['react'] = [[r[0], r[1], (r[2] if len(r) > 2 else 0), cue.get((st['who'], ln['t'], r[0]), '')] for r in ln['react']]
# cast: ids and names come mixed ('tom' from a walk step, 'Tom' from a talk step): one entry each, the speaker's spelling first
for sc in res['scenes'].values():
    spk = {st['who'].lower(): st['who'] for st in sc['steps'] if st['k'] == 'talk'}
    seen_c, cast = set(), []
    for n in sc['cast']:
        k = n.lower()
        if k in seen_c: continue
        seen_c.add(k); cast.append(spk.get(k) or ({'tnb': 'TNB'}.get(k) or n[:1].upper() + n[1:]))
    sc['cast'] = cast
# chapter grouping in story order; bonus chapter last
chs = [dict(c, scenes=[]) for c in res['chapters']]
chs.append({'n': 'ns', 'title': 'Nine Scoops (bonus)', 'party': {}, 'scenes': []})
by = {c['n']: c for c in chs}
last = 1
for sid in res['order']:
    n = res['scenes'][sid]['chapter']
    if n is None: n = last
    last = n if isinstance(n, int) else last
    res['scenes'][sid]['chapter'] = n
    if n in by: by[n]['scenes'].append(sid)
# per scene order inside a chapter: the trigger order in data/scenes.js is story order; keep the key order of SCENES (file order)
# Play recipes: hand-written file wins, then the trigger, else a guess
rec = {}
rp = os.path.join(ROOT, 'docs', 'script-recipes.json')
if os.path.exists(rp): rec = json.load(open(rp, encoding='utf8'))
for sid, sc in res['scenes'].items():
    r = dict(rec.get(sid) or {})
    r.setdefault('ch', sc['chapter'] if isinstance(sc['chapter'], int) else 1)
    t = sc.get('trig')
    # party: the chapter's own rules. A chapter that locks Tom (the girls stay home) plays with Tom and the people it allows; otherwise Tom, Grace, Rose and the allowed.
    chd = next((c for c in res['chapters'] if c['n'] == r['ch']), None); pr = (chd or {}).get('party') or {}
    if 'party' not in r:
        allow = list(pr.get('allow') or []) if isinstance(pr, dict) else []
        r['party'] = (['tom'] + allow) if 'tom' in (pr.get('lock') or []) else ['tom', 'grace', 'rose'] + allow
    if t and 'map' not in r: r['map'] = t['map']; r['from'] = 'trigger'
    if t and 'unflag' not in r and isinstance(t.get('notFlag'), str): r['unflag'] = [t['notFlag']]
    if t and 'flags' not in r and t.get('flag'): r['flags'] = {t['flag']: True} if isinstance(t['flag'], str) else t['flag']
    if t and t.get('at') and 'start' not in r: r['atRect'] = t['at']
    if 'map' not in r: r['from'] = 'none'
    elif 'from' not in r: r['from'] = 'recipe'
    sc['recipe'] = r
    sc.pop('trig', None)
out = {'made': time.strftime('%Y-%m-%d %H:%M:%S'), 'files': vi['files'], 'speakers': res['speakers'], 'chapters': [c for c in chs if c['scenes']], 'scenes': res['scenes']}
json.dump(out, open(os.path.join(ROOT, 'data', 'script-index.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print('scenes', len(res['scenes']), 'talk lines', nlines, 'with a clip', nclip)
print('walk errors', res['errs'][:5], 'page errors', errs[:3])
print('no map recipe', sum(1 for s in res['scenes'].values() if s['recipe']['from'] == 'none'))
print('steps reading [something happens]:', len(res['missing']))
if '--missing' in sys.argv:
    for k in res['missing']: print(k)
