#!/usr/bin/env python3
"""Unused voice audit. Finds voice lines and baked clips the full game never plays, so they are purged BEFORE Tom spends ElevenLabs credits on them.
Usage (repo root):  python3 tools/clip-audit/unused_voice.py [--write-spec out.json]
Reports (1) line kinds in LINES whose name appears in no source file as a quoted string (never called),
        (2) kinds only reachable through the generic attack/basic fallback in say() (engine/speech.js), for characters whose every move has its own line,
        (3) baked battle clips whose words match no live line (old audio for a reworded line),
        (4) baked dialogue clips whose text is not in tools/voice-library/harvest.json or the source (templated 'Round N.' monster lines are live and ignored).
(5) lines for a REPLACED move: the kind has an old animation function in engine/*-moves.js (so check 1 passes) but is no longer a key in any kit, Stampcard version or combo table.
--write-spec writes a spec for: node tools/clip-audit/purge_unused.js <spec> --apply   (then remove the kinds from data/lines.js by hand,
rebuild the index: python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js, bump the ?v= tags, add a docs/CHANGES.md entry).
A kind used only through dynamic code (a name built by string concatenation) shows as a candidate: check it by hand before purging."""
import os, re, sys, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--headless=new', '--no-proxy-server'])
    pg = br.new_page(); pg.goto(f'http://127.0.0.1:{port}/index.html', timeout=240000)
    pg.wait_for_function('()=>window.__LE&&window.__LE.B2_SKILLS', timeout=240000); pg.wait_for_timeout(2500)
    D = pg.evaluate("""()=>{const S=__LE.B2_SKILLS,kits={};for(const id in S){const k=S[id];kits[id]=[k.basic&&k.basic.key,k.special&&k.special.key,...(k.skills||[]).map(x=>x.key),...(k.o3||[]).map(x=>x.key)].filter(Boolean);}
      const clips=[];for(const id in VOICE_CLIPS.clips)for(const k in VOICE_CLIPS.clips[id])for(const c of VOICE_CLIPS.clips[id][k])if(c)clips.push([id,k,c.text]);
      return {L:LINES,kits,clips,dkeys:Object.keys(DIALOG_CLIPS.clips)}}""")
    br.close()
src = ''
for d, _, fs in os.walk(ROOT):
    rel = os.path.relpath(d, ROOT)
    if rel.split(os.sep)[0] in ('demo', 'tools', '.git', 'art', 'audio', 'docs', 'build', 'launch', 'music', 'portraits', 'bgs') or rel.startswith(os.path.join('data', 'voice')): continue
    for f in fs:
        if not f.endswith(('.js', '.html')) or f in ('lines.js', 'voice-clips.js') or (rel == '.' and f != 'index.html'): continue
        src += '\n' + open(os.path.join(d, f), encoding='utf8', errors='ignore').read()
src = src.replace("\\'", "'")
quoted = set(re.findall(r'[\'"`](\w+)[\'"`]', src))
L = D['L']; dead = {}; fallback = {}
for cid, kinds in L.items():
    for k in kinds:
        if k not in quoted: dead.setdefault(cid, []).append(k)
    own = all(k in kinds for k in D['kits'].get(cid, []))
    if own and D['kits'].get(cid) and 'attack' in kinds and 'attack' not in dead.get(cid, []): fallback[cid] = 'attack'
live = {c + '|' + t for c, ks in L.items() for k, ts in ks.items() for t in ts}
orph = [{'id': i, 'k': k, 'text': t} for i, k, t in D['clips'] if i + '|' + t not in live]
print('1. kinds never called:', {c: v for c, v in dead.items()})
print('2. attack pool only reachable as a fallback (every move has its own line):', list(fallback), '(check scenes and Move Lab by hand)')
print('3. baked battle clips with no live line:', len(orph)); [print('   ', o['id'] + '.' + o['k'] + ': ' + o['text']) for o in orph]
h = {x['text'] for x in json.load(open(os.path.join(ROOT, 'tools/voice-library/harvest.json')))['lines']}
# Dialogue keys come from the files on disk, not the page: engine/dialog-voice.js loads data/voice/dialog-ch*.js one at a time after
# startup, so the page has only some of them 2.5 s in (ch2clips found this: a 2,288-clip tree showed far fewer keys in the page).
# A clip is live when its full text (backslashes dropped on both sides, so \' and \" match) is in the harvest or the source.
import glob
dkeys = []
for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'voice', 'dialog-ch*.js'))):
    for line in open(f, encoding='utf8'):
        if line.startswith('Object.assign(DIALOG_CLIPS.clips,'): dkeys += list(json.loads(line[len('Object.assign(DIALOG_CLIPS.clips,'):-3]).keys())
srcnb = src.replace('\\', '')
od = [k for k in dkeys if k.split('|', 1)[1] not in h and not re.match(r'^[^|]+\|Round \d+\. ', k) and k.split('|', 1)[1].replace('\\', '') not in srcnb]
print('4. dialogue clips not in harvest or source:', len(od)); [print('   ', k[:120]) for k in od]

import glob
live_keys = set()
for t in D['kits'].values(): live_keys |= set(t)
for f in ('data/abilities.js', 'data/battle2-data.js', 'data/progress.js', 'data/party.js'):
    txt = open(os.path.join(ROOT, f), encoding='utf8', errors='ignore').read()
    live_keys |= set(re.findall(r'key\s*:\s*["\'](\w+)["\']', txt)) | set(re.findall(r'play\s*:\s*["\'](\w+)["\']', txt))
live_keys |= {k[3:] for k in list(live_keys) if k.startswith('rx_')}
funcs = set()
for f in glob.glob(os.path.join(ROOT, 'engine', '*-moves.js')) + [os.path.join(ROOT, 'engine', 'nara.js')]:
    funcs |= set(re.findall(r'\b[A-Z][A-Za-z0-9_]{0,3}\.(\w+)\s*=\s*E2\s*=>', open(f, encoding='utf8', errors='ignore').read()))
replaced = {}
for cid, kinds in L.items():
    for k in kinds:
        if k in funcs and k not in live_keys and k not in dead.get(cid, []) and not any(k.startswith(x + '_') for x in live_keys if len(x) > 3):
            replaced.setdefault(cid, []).append(k)
print('5. lines for replaced moves (old animation code still exists):', replaced)
if '--write-spec' in sys.argv:
    out = sys.argv[sys.argv.index('--write-spec') + 1]
    dk = {c: list(v) for c, v in dead.items()}
    for c in fallback: dk.setdefault(c, []).append('attack')
    for c, v in replaced.items(): dk.setdefault(c, []).extend(v)
    json.dump({'deadKinds': dk, 'orphanClips': orph, 'orphanDialog': od}, open(out, 'w'), indent=1); print('spec written', out)
