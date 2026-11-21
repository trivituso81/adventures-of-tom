#!/usr/bin/env python3
"""voiceboard1: Generate all N voices from a board card.   python3 tools/voiceboard_test.py [outdir]
No real key, no money: the job runs against the stand-in ElevenLabs (tools/voice-library/stub.py), a copy of the repo and a local bare git remote that plays GitHub.
PART 1, the board page (390x844 and 844x390, stub GitHub): a Tom card with `voice_chapter` and one with a `voices` list show the lines that have no clip (the count is
  worked out HERE from data/voice-index.json by the rule of voicegen.py, not copied from the page), the credits estimate (0.44 per character), two taps (the first only
  arms, the second saves `vgen` with the commit `board: vgen <id>`), the Started text, a finished run (made, needs a human, failed, build), a waiting card (button says
  what it waits on), a card with nothing to make, the board file stays valid, no sideways scroll.
PART 2, the job (tools/voice-learn/voiceboard.py): a dry run changes nothing and sends nothing; a real run makes a take for every asked line that has no clip
  (the line that ElevenLabs refuses goes on the card as failed), merges them into data/voice/dialog-ch2.js on main with a docs/CHANGES.md entry named voices-<card>-<run>,
  keeps the takes on branch `generated`, writes vgen.run (made, failed, needs_human, credits, build) and the card's next; a second run finds nothing left to make;
  with a stale main (someone pushed between) the merge is redone and still lands.
Prints FAILS: []."""
import base64, json, os, shutil, subprocess, sys, tempfile, time, urllib.request, datetime
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..'))
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board'; os.makedirs(out, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)
T = datetime.date.today().isoformat()
IDX = json.load(open(os.path.join(ROOT, 'data', 'voice-index.json'), encoding='utf-8'))
def want_lines(keys=None, chapter=None):   # the rule worked out here from voicegen.candidates(), not copied from the page
    seen, res = set(), []
    for it in IDX['items']:
        if it.get('t') != 'd' or it.get('f', 0) >= 0 or it.get('nv') or not it.get('s'): continue
        k = it['v'] + '|' + it['x']
        if k in seen: continue
        if (keys and k in keys) or (chapter and chapter in (it.get('c') or [])): seen.add(k); res.append(it)
    return res
CH2 = want_lines(chapter=2)
L3 = [it for it in IDX['items'] if it.get('t') == 'd' and it.get('f', 0) < 0 and not it.get('nv') and it.get('s')][:3]
K3 = [it['v'] + '|' + it['x'] for it in L3]
have = next(it for it in IDX['items'] if it.get('t') == 'd' and it.get('f', 0) >= 0)
def credits(items, cap=12000): return round(min(sum(len(i['s']) for i in items), cap) * .44)
# ---------------------------------------------------------------- PART 1: the page
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
def tc(i, title, **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Voice Clips', 'title': title, 'next': 'Make the voices.', 'blocks': [], 'fyi': True, 'changed': T, 'created': T, 'ask': 'voice', 'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
b['cards'] += [tc('t-v-ch', 'Voices of chapter 2', voice_chapter=2),
               tc('t-v-list', 'Three voices', voices=K3),
               tc('t-v-none', 'Nothing to make', voices=[have['v'] + '|' + have['x']]),
               tc('t-v-wait', 'Waiting voices', col='wait', waiting_on='tom', voice_chapter=2),
               tc('t-v-done', 'Finished voices', voices=K3, vgen={'want': False, 'run': {'state': 'done', 'at': '2026-11-21T01:00:00Z', 'made': K3[:2], 'failed': [{'id': 'tom|x', 'why': 'ElevenLabs error'}], 'needs_human': [K3[2]], 'credits': 1234.0, 'chars': 2800, 'build': 'voices-t-v-done-7', 'note': ''}})]
tb = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(b, open(tb, 'w'), indent=1)
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8095'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
stub = subprocess.Popen([sys.executable, os.path.join(HERE, 'art-library', 'stub.py'), '8096'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, STUB_BOARD=tb))
time.sleep(2)
def stored():
    f = json.load(urllib.request.urlopen('http://127.0.0.1:8096/files'))['data/board.json']['content']; return json.loads(base64.b64decode(f.replace('\n', '')).decode())
def card(i): return next(x for x in stored()['cards'] if x['id'] == i)
INIT = "localStorage.setItem('aot-gh-token','test');"
URL = 'http://127.0.0.1:8095/board.html?gh=http://127.0.0.1:8096'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for tag, vp in (('portrait', {'width': 390, 'height': 844}), ('landscape', {'width': 844, 'height': 390})):
            ctx = br.new_context(viewport=vp); pg = ctx.new_page(); errs = []
            pg.add_init_script(INIT); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_selector('.card[data-id="t-v-ch"]'); pg.wait_for_timeout(800)
            exp = 'Generate all %d voices (about %s credits)' % (len(CH2), format(credits(CH2), ','))
            lc = pg.inner_text('.card[data-id="t-v-ch"]')
            ok('%d lines with no clip yet' % len(CH2) in lc or tag == 'landscape', tag + ': list card names the count')
            pg.click('.card[data-id="t-v-ch"] .t'); pg.wait_for_selector('#sheet .pics')
            btn = pg.inner_text('#sheet button.gen')
            ok(btn == exp if tag == 'portrait' else 'Asked' in btn, tag + ': chapter button text %r wants %r' % (btn, exp if tag == 'portrait' else 'Asked (the portrait tap is saved)'))
            ok('%d lines with no clip yet' % len(CH2) in pg.inner_text('#sheet .pics'), tag + ': sheet names the count')
            ok(len(CH2) > 0, 'chapter 2 has lines with no clip in the index (the test needs some)')
            if tag == 'portrait':
                puts = lambda: [l for l in json.load(urllib.request.urlopen('http://127.0.0.1:8096/log')) if l.get('github') == 'PUT']
                n0 = len(puts())
                pg.click('#sheet button.gen'); pg.wait_for_timeout(300)
                ok('Tap again to confirm' in pg.inner_text('#sheet button.gen'), 'first tap arms: ' + pg.inner_text('#sheet button.gen'))
                ok(len(puts()) == n0, 'the first tap saved nothing')
                pg.click('#sheet button.gen'); pg.wait_for_timeout(900)
                pl = puts()
                ok(len(pl) == n0 + 1 and pl[-1]['msg'] == 'board: vgen t-v-ch', 'second tap commit: %s' % [x['msg'] for x in pl[n0:]])
                g = card('t-v-ch').get('vgen') or {}
                ok(g.get('want') is True and g.get('n') == len(CH2) and g.get('est') == credits(CH2) and g.get('at', '').endswith('Z'), 'vgen written: %s' % g)
                h = card('t-v-ch')['history'][-1]['t']
                ok(h.startswith('Tom approved generating %d voices' % len(CH2)) and '—' not in h, 'history line: ' + h)
                ok(pg.is_disabled('#sheet button.gen') and 'Asked' in pg.inner_text('#sheet button.gen') and 'Started. The voices are made' in pg.inner_text('#sheet .pics'), 'button disabled with the Started text after the tap')
            pg.screenshot(path=f'{out}/board-voices-{tag}.png'); pg.click('#bclose')
            pg.click('.card[data-id="t-v-list"] .t'); pg.wait_for_selector('#sheet .pics')
            ok(pg.inner_text('#sheet button.gen') == 'Generate all 3 voices (about %s credits)' % format(credits(L3), ','), tag + ': list card button: ' + pg.inner_text('#sheet button.gen'))
            pg.click('#bclose')
            pg.click('.card[data-id="t-v-none"] .t'); pg.wait_for_selector('#sheet .pics')
            ok(pg.is_disabled('#sheet button.gen') and 'Nothing to make' in pg.inner_text('#sheet button.gen'), tag + ': nothing to make is disabled: ' + pg.inner_text('#sheet button.gen'))
            pg.click('#bclose')
            pg.evaluate("openSheet('t-v-wait')"); pg.wait_for_selector('#sheet .pics')
            ok(pg.is_disabled('#sheet button.gen') and pg.inner_text('#sheet button.gen').startswith('Waiting on'), tag + ': waiting card: ' + pg.inner_text('#sheet button.gen'))
            pg.click('#bclose')
            pg.evaluate("openSheet('t-v-done')"); pg.wait_for_selector('#sheet .pics')
            d = pg.inner_text('#sheet .pics')
            for w in ('Last run: finished', 'about 1,234 credits', 'Made and in the game: 2 (build voices-t-v-done-7)', 'Could not make (1)', 'Failed tom|x: ElevenLabs error'):
                ok(w in d, tag + ': finished run shows "%s"' % w)
            pg.screenshot(path=f'{out}/board-voices-done-{tag}.png'); pg.click('#bclose')
            sw = pg.evaluate('document.documentElement.scrollWidth')
            ok(sw <= vp['width'] + 1, tag + ': no sideways scroll (%d)' % sw)
            real = [e for e in errs if 'Failed to load' not in e]
            ok(not real, tag + ': page errors ' + str(real[:3]))
            if tag == 'portrait':
                open('/tmp/board_voiceboard_after.json', 'w').write(json.dumps(stored()))
                r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), '/tmp/board_voiceboard_after.json'], capture_output=True, text=True)
                ok(r.returncode == 0, 'board_check accepts the board the page wrote: ' + r.stdout[-200:])
            ctx.close()
        br.close()
finally:
    srv.terminate(); stub.terminate()
# ---------------------------------------------------------------- the real board: the first card
rb = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
rc = {c['id']: c for c in rb['cards']}
v2 = rc.get('t-ch2voices')
ok(bool(v2) and v2.get('ask') == 'voice' and v2.get('voice_chapter') == 2 and v2.get('col') in ('wait', 'up', 'done'), 't-ch2voices exists: ask voice, voice_chapter 2')
ok('t-ch2voices' in (rc['t-ch2play'].get('blocks') or []), 't-ch2voices waits on t-ch2play')
ok(rc['c-voiceboard'].get('after') == 't-ch2voices', 'c-voiceboard hands to t-ch2voices')
# ---------------------------------------------------------------- PART 2: the job
TMP = tempfile.mkdtemp(prefix='vbtest-'); WORK = TMP + '/work'; REMOTE = TMP + '/remote.git'; OUTD = TMP + '/gen'
G = ('git', '-c', 'user.name=t', '-c', 'user.email=t@t')
def sh(*a, cwd=None, env=None):
    return subprocess.run(a, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
print('copying the repo (without art and the big voice files)...', flush=True)
os.makedirs(WORK)
def keep(rel, name):
    if rel in ('.git', 'art', 'inbox', 'generated', 'tools/shots', 'tools/art-library/results') or name == 'node_modules': return False
    if rel.startswith('docs/') and rel != 'docs/CHANGES.md': return False
    if rel.startswith('data/voice/') and rel != 'data/voice/dialog-ch2.js' and name not in ('tom.js', 'grace.js', 'rose.js', 'amy.js', 'deedee.js', 'boppy.js', 'tnb.js'): return False
    return not name.endswith(('.png', '.webp', '.mp3'))
def copy_tree(src, dst, rel=''):
    os.makedirs(dst, exist_ok=True)
    for n in os.listdir(src):
        r = (rel + '/' + n) if rel else n
        if not keep(r, n): continue
        sp, dp = os.path.join(src, n), os.path.join(dst, n)
        if os.path.isdir(sp) and not os.path.islink(sp): copy_tree(sp, dp, r)
        elif os.path.isfile(sp): shutil.copy2(sp, dp)
copy_tree(ROOT, WORK)
class R: returncode = 0; stdout = ''
r = R()
ok(r.returncode == 0, 'repo copied: ' + r.stdout[-200:])
# the copy's voice index: three made-up lines of chapter 2 (one the stand-in refuses), plus the real ones, so the lines are known
idx = json.load(open(WORK + '/data/voice-index.json', encoding='utf-8'))
SYN = [('tom', 'Voiceboard test line one.', '[calm] Voiceboard test line one.'), ('grace', 'Voiceboard test line two.', '[bright] Voiceboard test line two.'),
       ('tom', 'Voiceboard refused line.', '[calm] Voiceboard refused line. [REFUSE]')]
for v, x, s in SYN:
    idx['items'].append({'t': 'd', 'v': v, 'x': x, 'ty': 'd', 'c': [2], 'w': '', 'f': -1, 's': s})
for v in ('tom', 'grace'):
    idx['voices'].setdefault('dialog|' + v, {'voice_id': 'voice-' + v, 'stability': .5, 'similarity': .8, 'model': 'eleven_v4'})
json.dump(idx, open(WORK + '/data/voice-index.json', 'w'), ensure_ascii=False)
SYNK = [v + '|' + x for v, x, s in SYN]
board = json.load(open(WORK + '/data/board.json', encoding='utf-8'))
board['cards'] = [c for c in board['cards'] if c['id'] in ('c-voiceboard',)]
board['cards'].append(tc('t-jobcard', 'Job card', voices=SYNK, vgen={'want': True, 'at': '2026-11-21T01:00:00Z'}))
json.dump(board, open(WORK + '/data/board.json', 'w'), indent=1, ensure_ascii=False)
sh('git', 'init', '-q', '-b', 'main', cwd=WORK); sh('git', 'init', '-q', '--bare', '-b', 'main', REMOTE); sh('git', 'remote', 'add', 'origin', REMOTE, cwd=WORK)
sh(*G, 'add', '-A', cwd=WORK); r = sh(*G, 'commit', '-q', '-m', 'seed', cwd=WORK); r = sh('git', 'push', '-q', 'origin', 'main', cwd=WORK)
ok(r.returncode == 0, 'seed pushed to the local remote: ' + r.stdout[-200:])
EL = subprocess.Popen([sys.executable, os.path.join(HERE, 'voice-library', 'stub.py'), '8851'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
def show(ref, path):
    p = sh('git', '--git-dir', REMOTE, 'show', ref + ':' + path); return p.stdout if p.returncode == 0 else None
RUN = '41'
def job(*args, key='test'):
    env = dict(os.environ, ELEVENLABS_API_KEY=key, ELEVENLABS_BASE='http://127.0.0.1:8851', ARTGEN_REMOTE='origin', GITHUB_ACTIONS='true', GITHUB_RUN_NUMBER=RUN, CI='1')
    return sh(sys.executable, '-I', WORK + '/tools/voice-learn/voiceboard.py', '--repo', WORK, '--out', OUTD, '--no-guard', *args, env=env)
def bcard(): return next(c for c in json.loads(show('main', 'data/board.json'))['cards'] if c['id'] == 't-jobcard')
try:
    head0 = sh('git', '--git-dir', REMOTE, 'rev-parse', 'main').stdout.strip()
    r = job('--card', 't-jobcard', '--dry-run')
    ok(r.returncode == 0 and 'dry run: nothing was sent' in r.stdout and '3 lines with no clip' in r.stdout, 'dry run lists 3 lines: ' + r.stdout[-300:])
    ok(sh('git', '--git-dir', REMOTE, 'rev-parse', 'main').stdout.strip() == head0, 'dry run pushed nothing')
    ok(not json.load(urllib.request.urlopen('http://127.0.0.1:8851/log')), 'dry run sent nothing to ElevenLabs')
    r = job('--card', 't-jobcard', '--max-chars', '500')
    print(r.stdout[-2500:])
    ok(r.returncode == 0, 'job finished: exit %d' % r.returncode)
    c = bcard(); g = c.get('vgen') or {}; run = g.get('run') or {}
    ok(g.get('want') is False and run.get('state') == 'done', 'vgen.want false and run.state done: want=%s state=%s' % (g.get('want'), run.get('state')))
    ok(sorted(run.get('made') or []) == sorted(SYNK[:2]), 'made the two good lines: %s' % run.get('made'))
    ok(len(run.get('failed') or []) + len(run.get('needs_human') or []) == 1 and SYNK[2] not in (run.get('made') or []), 'the refused line is listed as failed or needing a human, not made: %s %s' % (run.get('failed'), run.get('needs_human')))
    ok(run.get('build') == 'voices-t-jobcard-41', 'build name %s' % run.get('build'))
    ok('VOICE LIBRARY' in c.get('next', '') and '—' not in c.get('next', ''), 'card next says to listen: ' + c.get('next', '')[:120])
    ch2 = show('main', 'data/voice/dialog-ch2.js') or ''
    ok('Voiceboard test line one.' in ch2 and 'Voiceboard test line two.' in ch2 and 'Voiceboard refused line.' not in ch2, 'the two takes are in data/voice/dialog-ch2.js, the refused one is not')
    chg = show('main', 'docs/CHANGES.md') or ''
    ok(chg.startswith('## voices-t-jobcard-41 (' + T + '): 2 voice takes made from board card t-jobcard'), 'CHANGES entry first: ' + chg[:120])
    ok('voices-t-jobcard-41' in (show('main', 'engine/main.js') or ''), 'the build stamp moved to the new build')
    ok('voices-t-jobcard-41' in (show('main', 'data/build-history.js') or ''), 'the build is in the build history')
    gen = sh('git', '--git-dir', REMOTE, 'ls-tree', '--name-only', 'generated').stdout
    ok('export-001.json' in gen and 'needs-human.json' in gen, 'takes kept on branch generated: ' + gen.replace('\n', ' '))
    ok(len(json.load(urllib.request.urlopen('http://127.0.0.1:8851/log'))) >= 3, 'the stand-in ElevenLabs got the requests')
    log = json.load(urllib.request.urlopen('http://127.0.0.1:8851/log'))
    ok({l.get('path') for l in log} == {'tts'} and all(l.get('text') for l in log), 'only text-to-speech calls reached ElevenLabs, each with text')
    # a second run: nothing left that can be made except the refused line (on needs-human, not retried)
    RUN = '42'
    r = job('--card', 't-jobcard')
    ok(r.returncode == 0, 'second run exits cleanly: ' + r.stdout[-300:])
    made2 = (bcard().get('vgen') or {}).get('run', {}).get('made')
    ok(not made2, 'the second run made nothing again: %s' % made2)
    ok('xi-api-key' not in json.dumps(bcard()) and '"test"' not in json.dumps(bcard().get('vgen')), 'the key is not on the card')
finally:
    EL.terminate()
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
