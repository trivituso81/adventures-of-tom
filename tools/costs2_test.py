#!/usr/bin/env python3
"""costs2 test (python3 tools/costs2_test.py [outdir]): the AI Costs page fills itself in. Nothing here calls a paid service or the real repo.
  A  tools/costlog.py against stand-in git remotes: rows are pushed to main without touching the checkout, a repeat of one run writes nothing, bad
     amounts are dropped, a main that moved is merged, a partial clone (the art-gen checkout) does not fetch every blob, credits rows keep their unit
  B  tools/costs_sync.py as the Action runs it, against stand-in ElevenLabs, fal and xAI servers: three reads, one row a day per service, a refused key becomes
     one dated note (again only after a balance was read in between), missing secrets write nothing, dry run writes nothing, no key is ever printed
  C  costs.html: a balance read earlier less the use logged after it, credits rows shown as credits and never taken off dollars, the newest 40 use rows,
     "Needs a look" for a balance that could not be read, the page keeps its desktop and Duo layouts (tools/costs_test.py and costs_duo_test.py are run on their own)
  D  wiring: every job that spends calls the logger and its workflow gives it COSTS_LOG_REPO; costs-sync is a daily schedule with the secrets named in the docs
Screenshots land in outdir. Prints FAILS: []."""
import os, sys, io, json, re, time, shutil, subprocess, tempfile, threading, contextlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..'))
sys.path.insert(0, HERE)
import costlog, costs_fixture as fx   # noqa: E402
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/costs2'; os.makedirs(out, exist_ok=True)
fails = []
def ok(c, name, why=''):
    print(('PASS ' if c else 'FAIL ') + name + ('' if c else '  :: ' + str(why)[:400]))
    if not c: fails.append(name)

TMP = tempfile.mkdtemp(prefix='costs2-')
os.environ.pop('COSTS_LOG_REPO', None); os.environ.pop('COSTS_LOG_REMOTE', None)

# ---------------------------------------------------------------- A: costlog
bare = fx.make_remote(TMP)
w = fx.clone(bare, TMP + '/w1')
open(w + '/jobout.txt', 'w').write('output of the running job\n')           # an untracked file the job keeps next to its code
open(w + '/README.md', 'a').write('local edit\n')                           # a tracked file with an edit that must survive
head0 = fx.sh('git', 'rev-parse', 'HEAD', cwd=w).stdout.strip(); st0 = fx.sh('git', 'status', '--porcelain', cwd=w).stdout
rows = [{'service': 'xai', 'amount': 0.3612, 'what': 'art-gen Action: pictures', 'source': 'art-gen run', 'run': 'https://x/run/1'},
        {'service': 'elevenlabs', 'unit': 'credits', 'amount': 12663.4, 'what': 'voice-gen Action: 5 lines', 'source': 'voice-gen run', 'run': 'https://x/run/1'},
        {'service': 'fal', 'amount': 0, 'what': 'nothing spent', 'source': 's'}, {'service': 'fal', 'amount': -1, 'what': 'negative', 'source': 's'},
        {'service': 'fal', 'amount': 'abc', 'what': 'not a number', 'source': 's'}, {'service': 'fal', 'amount': .1, 'what': '', 'source': 'no what'}]
done = costlog.log_usage(w, rows)
c = fx.main_costs(bare)
ok(len(done) == 2 and len(c['usage']) == 3 and c['usage'][0]['what'] == 'earlier', 'two good rows are written after the earlier one; zero, negative, non-numeric and unnamed rows are dropped', c['usage'])
x = c['usage'][1]
ok(x['service'] == 'xai' and x['amount'] == 0.3612 and re.match(r'^\d{4}-\d\d-\d\d$', x['date']) and x['at'].endswith('Z') and x['run'] == 'https://x/run/1', 'a dollar row keeps four decimals, a Pacific date, a time and its run', x)
e = c['usage'][2]
ok(e['unit'] == 'credits' and e['amount'] == 12663.4, 'a credits row keeps its unit', e)
ok(c['updated'] == costlog.today(), 'the file says it was updated today', c['updated'])
ok(fx.sh('git', 'rev-parse', 'HEAD', cwd=w).stdout.strip() == head0 and fx.sh('git', 'status', '--porcelain', cwd=w).stdout == st0 and open(w + '/jobout.txt').read() == 'output of the running job\n' and 'local edit' in open(w + '/README.md').read(),
   'the job\'s own checkout is untouched: same HEAD, same status, its output file and its edit are still there')
sha1 = fx.main_sha(bare)
again = costlog.log_usage(w, rows)
ok(again == [] and fx.main_sha(bare) == sha1, 'the same run logged again writes nothing and pushes nothing')
ok(len(costlog.log_usage(w, [dict(rows[0], what='another line of the same run')])) == 1, 'another line of the same run is a new row')
log = fx.sh('git', '--git-dir', bare, 'log', '-1', '--format=%an|%s', 'main').stdout.strip()
ok(log.startswith('github-actions[bot]|costs: job spend logged [skip ci]'), 'the commit is the bot\'s and skips CI', log)
# the opt-in: nothing happens unless COSTS_LOG_REPO is set; a broken repo never raises
buf = io.StringIO()
with contextlib.redirect_stdout(buf): r0 = costlog.log_from_env([{'service': 'xai', 'amount': 1, 'what': 'x', 'source': 's'}])
ok(r0 == [] and 'not logged' in buf.getvalue() and fx.main_sha(bare) != '', 'without COSTS_LOG_REPO the spend is printed, not logged')
os.environ['COSTS_LOG_REPO'] = TMP + '/does-not-exist'
buf = io.StringIO()
with contextlib.redirect_stdout(buf): r1 = costlog.log_from_env([{'service': 'xai', 'amount': 1, 'what': 'x', 'source': 's'}])
ok(r1 == [] and 'warning: could not log' in buf.getvalue(), 'a repository that cannot be reached prints a warning and does not raise', buf.getvalue())
os.environ['COSTS_LOG_REPO'] = w
with contextlib.redirect_stdout(io.StringIO()): r2 = costlog.log_from_env([{'service': 'fal', 'amount': .26, 'what': 'wan-gen Action: start', 'source': 'wan-gen run'}])
ok(len(r2) == 1 and fx.main_costs(bare)['usage'][-1]['what'] == 'wan-gen Action: start', 'with COSTS_LOG_REPO set the row is logged through log_from_env')
os.environ.pop('COSTS_LOG_REPO')
# main moves between the fetch and the push: the competing change and ours both end up on main
orig, state = costlog.git, {'n': 0}
def racing(root, *a, **k):
    if a and a[0] == 'push' and state['n'] == 0:
        state['n'] = 1; fx.push_competing(bare, TMP, lambda d: d['balances'].append({'service': 'fal', 'date': '2026-11-21', 'left': 9.0, 'unit': 'usd', 'source': 'someone else'}))
    return orig(root, *a, **k)
costlog.git = racing
try: costlog.log_usage(w, [{'service': 'xai', 'amount': .5, 'what': 'raced row', 'source': 's'}])
finally: costlog.git = orig
c = fx.main_costs(bare)
ok(any(u['what'] == 'raced row' for u in c['usage']) and any(b['source'] == 'someone else' for b in c['balances']), 'a push refused because main moved is retried from a fresh fetch and keeps the other writer\'s change', (c['balances'], c['usage'][-1]))
# the art-gen kind of checkout: depth 1, no blobs, sparse. It must still work and must not download every file.
pw = fx.clone(bare, TMP + '/w2', shallow=True, partial=True)
fx.sh('git', 'sparse-checkout', 'set', '--no-cone', '/data/costs.json', cwd=pw)
miss0 = len([l for l in fx.sh('git', 'rev-list', '--objects', '--missing=print', '--all', cwd=pw).stdout.splitlines() if l.startswith('?')])
costlog.log_usage(pw, [{'service': 'xai', 'amount': .7, 'what': 'from a partial clone', 'source': 's'}])
miss1 = len([l for l in fx.sh('git', 'rev-list', '--objects', '--missing=print', '--all', cwd=pw).stdout.splitlines() if l.startswith('?')])
ok(any(u['what'] == 'from a partial clone' for u in fx.main_costs(bare)['usage']) and miss0 >= 6 and miss1 >= 5, 'a partial sparse clone logs too and does not fetch every blob (missing blobs %d before, %d after)' % (miss0, miss1))
ok(sorted(fx.sh('git', '--git-dir', bare, 'ls-tree', '-r', '--name-only', 'main').stdout.split()) == sorted(['README.md', 'data/costs.json'] + ['art/big%d.bin' % i for i in range(6)]), 'main still holds every other file: only data/costs.json changed')

# ---------------------------------------------------------------- B: costs_sync against stand-in servers
KEYS = {'el': 'xi_SECRET_el_123', 'fal': 'fal_SECRET_key_456', 'fal_admin': 'fal_SECRET_admin_789', 'xai': 'xai_SECRET_mgmt_012', 'team': 'team-SECRET-345'}
S = {'el_count': 150000, 'el_limit': 600000, 'fal_ok_keys': {KEYS['fal_admin']}, 'fal_bal': 24.5, 'xai_val': '-2742', 'xai_ok': True, 'el_status': 200, 'seen': []}
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def j(self, code, doc):
        b = json.dumps(doc).encode(); self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        S['seen'].append(self.path)
        if self.path.startswith('/v1/user/subscription'):
            if self.headers.get('xi-api-key') != KEYS['el'] or S['el_status'] != 200: return self.j(S['el_status'] if self.headers.get('xi-api-key') == KEYS['el'] else 401, {'detail': 'no'})
            return self.j(200, {'character_count': S['el_count'], 'character_limit': S['el_limit'], 'tier': 'pro'})
        if self.path.startswith('/v1/account/billing'):
            k = (self.headers.get('Authorization') or '')[4:]
            if k not in S['fal_ok_keys']: return self.j(403, {'error': {'message': 'admin scope needed for ' + k}})
            return self.j(200, {'username': 't', 'credits': {'current_balance': S['fal_bal'], 'currency': 'USD'}})
        if self.path == '/v1/billing/teams/%s/prepaid/balance' % KEYS['team']:
            if self.headers.get('Authorization') != 'Bearer ' + KEYS['xai'] or not S['xai_ok']: return self.j(401, {'error': 'bad key ' + KEYS['xai']})
            return self.j(200, {'changes': [], 'total': {'val': S['xai_val']}})
        self.j(404, {})
srv = ThreadingHTTPServer(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d' % srv.server_port
os.makedirs(TMP + '/b2'); bare2 = fx.make_remote(TMP + '/b2')
w3 = fx.clone(bare2, TMP + '/w3')
def sync(env_extra, *args):
    e = {k: v for k, v in os.environ.items() if not k.startswith(('ELEVENLABS', 'FAL_', 'XAI_'))}
    e.update(ELEVENLABS_BASE=URL, FAL_API=URL, XAI_MANAGEMENT_BASE=URL); e.update(env_extra)
    p = subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools', 'costs_sync.py'), '--root', w3] + list(args), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=e)
    return p.returncode, p.stdout
ALLKEYS = {'ELEVENLABS_API_KEY': KEYS['el'], 'FAL_ADMIN_KEY': KEYS['fal_admin'], 'XAI_MANAGEMENT_KEY': KEYS['xai'], 'XAI_TEAM_ID': KEYS['team']}
outs = []
rc, o = sync({}); outs.append(o)
ok(rc == 0 and o.count(' skip ') == 3 and 'ELEVENLABS_API_KEY' in o and 'XAI_MANAGEMENT_KEY' in o and fx.main_costs(bare2)['balances'] == [], 'with no secrets all three are skipped, each saying which secret, and nothing is written', o)
rc, o = sync(ALLKEYS, '--dry-run'); outs.append(o)
ok(rc == 0 and 'dry run' in o and fx.main_costs(bare2)['balances'] == [] and ' ok ' in o, 'a dry run reads and prints but writes nothing')
sha = fx.main_sha(bare2)
rc, o = sync(ALLKEYS); outs.append(o)
b = fx.main_costs(bare2)['balances']; by = {x['service']: x for x in b}
ok(rc == 0 and set(by) == {'elevenlabs', 'fal', 'xai'}, 'all three balances are written', (rc, o, b))
ok(by['elevenlabs']['left'] == 450000 and by['elevenlabs']['limit'] == 600000 and by['elevenlabs']['unit'] == 'credits', 'ElevenLabs: credits left = limit less used, with the limit', by.get('elevenlabs'))
ok(by['fal']['left'] == 24.5 and by['fal']['unit'] == 'usd' and 'FAL_ADMIN_KEY' in by['fal']['source'], 'fal: dollars left, and the source names the key used', by.get('fal'))
ok(by['xai']['left'] == 27.42 and by['xai']['unit'] == 'usd', 'xAI: a total of -2742 cents is $27.42 left', by.get('xai'))
ok(all(x['date'] == costlog.today() and x['at'].endswith('Z') for x in b) and fx.main_costs(bare2)['updated'] == costlog.today(), 'each row has today\'s Pacific date and a time; the file\'s updated date moves')
ok(fx.sh('git', '--git-dir', bare2, 'log', '-1', '--format=%an|%s', 'main').stdout.startswith('github-actions[bot]|costs: balances read [skip ci]'), 'the commit is the bot\'s and skips CI')
S['el_count'] = 160000; S['xai_val'] = '2000'
rc, o = sync(ALLKEYS); outs.append(o)
b = fx.main_costs(bare2)['balances']
ok(len(b) == 3 and {x['service']: x['left'] for x in b} == {'elevenlabs': 440000, 'fal': 24.5, 'xai': 20.0}, 'a second read the same day replaces the first (one row a day per service); a positive total from xAI is read as the same size', b)
# a hand-filed balance (no `read` flag) is never replaced
fx.push_competing(bare2, TMP, lambda d: d['balances'].append({'service': 'xai', 'date': costlog.today(), 'left': 31.42, 'unit': 'usd', 'source': 'Tom read the console'}))
rc, o = sync(ALLKEYS); outs.append(o)
b = fx.main_costs(bare2)['balances']
ok(any(x.get('source') == 'Tom read the console' for x in b) and len([x for x in b if x['service'] == 'xai']) == 2, 'a balance filed by hand the same day is kept beside the job\'s', b)
# fal with only an API scope key: refused, one note; the same trouble again writes no second note
fx.push_competing(bare2, TMP, lambda d: d.update(balances=[x for x in d['balances'] if x['service'] != 'fal']))
only = dict(ALLKEYS); only.pop('FAL_ADMIN_KEY'); only['FAL_KEY'] = KEYS['fal']
rc, o = sync(only); outs.append(o)
notes = [x for x in fx.main_costs(bare2)['balances'] if x['service'] == 'fal']
ok(len(notes) == 1 and 'text' in notes[0] and 'FAL_ADMIN_KEY' in notes[0]['text'] and notes[0]['job'] and notes[0]['at'] and 'left' not in notes[0], 'an API scope fal key is refused: one dated note saying to set FAL_ADMIN_KEY', notes)
sha = fx.main_sha(bare2)
rc, o = sync(only); outs.append(o)
ok(len([x for x in fx.main_costs(bare2)['balances'] if x['service'] == 'fal' and x.get('text')]) == 1 and 'same note already filed' in o, 'the same trouble the next day is not noted twice')
rc, o = sync(ALLKEYS); outs.append(o)
rc, o = sync(only); outs.append(o)
ok(len([x for x in fx.main_costs(bare2)['balances'] if x['service'] == 'fal' and x.get('text')]) == 2, 'the trouble noted again after a balance was read in between', [x for x in fx.main_costs(bare2)['balances'] if x['service'] == 'fal'])
# xAI refused, ElevenLabs refused
S['xai_ok'] = False; S['el_status'] = 500
rc, o = sync(ALLKEYS); outs.append(o)
b = fx.main_costs(bare2)['balances']
ok(any(x['service'] == 'xai' and x.get('text') and 'refused the management key' in x['text'] for x in b) and any(x['service'] == 'elevenlabs' and x.get('text') and '500' in x['text'] for x in b), 'a refused xAI key and an ElevenLabs error each become a note', [x for x in b if x.get('text')])
ok(rc == 0, 'a service that cannot be read does not fail the job')
S['xai_ok'] = True; S['el_status'] = 200; S['xai_val'] = 'not a number'
rc, o = sync(ALLKEYS); outs.append(o)
ok(any(x['service'] == 'xai' and x.get('text') and 'readable total' in x['text'] for x in fx.main_costs(bare2)['balances']), 'an unreadable xAI total is a note, not a guess')
allout = '\n'.join(outs)
ok(not any(v in allout for v in KEYS.values()), 'no key, admin key, management key or team id is ever printed')
notes_text = json.dumps(fx.main_costs(bare2))
ok(not any(v in notes_text for v in KEYS.values()), 'no key is ever written to data/costs.json')
ok('—' not in notes_text and '—' not in open(ROOT + '/tools/costs_sync.py', encoding='utf-8').read(), 'no em dash in the notes the job writes')

# ---------------------------------------------------------------- C: the page
from playwright.sync_api import sync_playwright
raw = open(ROOT + '/data/costs.json', encoding='utf-8').read(); D = json.loads(raw)
srvp = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8098'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
HP = 'http://127.0.0.1:8098/costs.html?today=2026-11-21'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        cx = br.new_context(viewport={'width': 1440, 'height': 900}); pg = cx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        def show(doc, route):
            body = json.dumps(doc)
            pg.unroute('**/data/costs.json*'); pg.route('**/data/costs.json*', lambda r: r.fulfill(status=200, content_type='application/json', body=body))
            pg.goto(HP + '#/' + route); pg.reload(); pg.wait_for_selector('#view .wrap, #ph .card, #ph .row'); pg.wait_for_timeout(250)
            return pg.inner_text('body')
        def doc2(**kw):
            d = json.loads(raw)
            for k, v in kw.items(): d[k] = v
            return d
        # the real file: xAI has usage_logged_from, so with no balance it still says Not read yet
        t = show(doc2(), 'service/xai')
        ok('Not read yet' in t, 'xAI with no balance read still says Not read yet (the log is complete only from the day it started)')
        # a balance read on Nov 21 at 10:00, use logged after it (11:00) and before it (09:00)
        bal = {'service': 'xai', 'date': '2026-11-21', 'at': '2026-11-21T18:00:00Z', 'left': 30.0, 'unit': 'usd', 'source': 'Read from xAI by the costs-sync job.', 'read': True}
        use = [{'service': 'xai', 'date': '2026-11-21', 'at': '2026-11-21T17:00:00Z', 'amount': 2.0, 'what': 'before the read', 'source': 's'},
               {'service': 'xai', 'date': '2026-11-21', 'at': '2026-11-21T19:00:00Z', 'amount': 4.5, 'what': 'after the read', 'source': 's'},
               {'service': 'xai', 'date': '2026-11-22', 'amount': 1.0, 'what': 'next day, no time', 'source': 's'},
               {'service': 'elevenlabs', 'unit': 'credits', 'date': '2026-11-21', 'at': '2026-11-21T19:30:00Z', 'amount': 12663, 'what': 'voice-gen Action: 5 lines', 'source': 'voice-gen run'}]
        d = doc2(balances=D['balances'] + [bal], usage=D['usage'] + use)
        t = show(d, 'service/xai'); pg.screenshot(path=out + '/xai-estimate.png')
        ok('About $24.50' in t and 'less $5.50 of use' in t, 'xAI: $30.00 read, less $4.50 logged after it in the day and $1.00 on a later day, is about $24.50 (the use before the read is not taken off)', t[:600])
        ok('before the read' in t and 'after the read' in t, 'every use row is listed')
        ok(t.index('next day, no time') < t.index('after the read') < t.index('before the read'), 'use rows are newest first')
        t = show(doc2(balances=D['balances'] + [dict(bal, left=30.0)], usage=D['usage']), 'service/xai')
        ok('$30.00' in t and 'About' not in t.split('Balance')[1][:60], 'with no use after the read the balance is shown as read, not as an estimate', t[:300])
        # elevenlabs: credits row rendered as credits, balance row as credits, and nothing taken off
        eb = {'service': 'elevenlabs', 'date': '2026-11-21', 'at': '2026-11-21T14:00:00Z', 'left': 450000, 'limit': 600000, 'unit': 'credits', 'source': 'Read from ElevenLabs by the costs-sync job.', 'read': True}
        t = show(doc2(balances=D['balances'] + [eb], usage=D['usage'] + use), 'service/elevenlabs'); pg.screenshot(path=out + '/elevenlabs.png')
        ok('450,000 credits' in t and '12,663 credits' in t and 'About' not in t.split('Balance')[1][:80], 'ElevenLabs: the balance in credits, the job\'s use as 12,663 credits, no dollar estimate', t[:500])
        # fal: usage_complete, balance read: anchored estimate uses all use after it
        fb = {'service': 'fal', 'date': '2026-11-21', 'at': '2026-11-21T14:00:00Z', 'left': 8.0, 'unit': 'usd', 'source': 'Read from fal by the costs-sync job.', 'read': True}
        fu = {'service': 'fal', 'date': '2026-11-21', 'at': '2026-11-21T15:00:00Z', 'amount': 0.26, 'what': 'wan-gen Action: start', 'source': 'wan-gen run'}
        t = show(doc2(balances=D['balances'] + [fb], usage=D['usage'] + [fu]), 'service/fal')
        ok('About $7.74' in t, 'fal: $8.00 read less $0.26 logged after it is about $7.74', t[:400])
        # more than 40 use rows: 40 shown, the rest named
        many = [{'service': 'xai', 'date': '2026-11-%02d' % (1 + i % 20), 'at': '2026-11-%02dT10:%02d:00Z' % (1 + i % 20, i), 'amount': .01, 'what': 'row %d' % i, 'source': 's'} for i in range(46)]
        t = show(doc2(usage=many), 'service/xai')
        ok('6 earlier rows are in data/costs.json' in t and t.count('row ') >= 40, 'with 46 use rows the newest 40 are listed and the rest are counted', t[-300:])
        # needs a look
        note = {'service': 'fal', 'date': '2026-11-21', 'at': '2026-11-21T14:00:00Z', 'text': 'The costs-sync job could not read the balance: fal refused FAL_KEY for the billing call (it needs an admin scope key); set the repo secret FAL_ADMIN_KEY.', 'source': 'costs-sync job', 'job': True}
        t = show(doc2(balances=D['balances'] + [note]), '')
        ok('fal.ai: balance not read' in t and 'FAL_ADMIN_KEY' in t, 'an unreadable balance is listed under Needs a look', t[-600:])
        t = show(doc2(balances=D['balances'] + [note, dict(fb, at='2026-11-21T16:00:00Z')]), '')
        ok('balance not read' not in t, 'and leaves the list once a later balance is read')
        # phone layout: the same rows, credits shown as credits
        pg.set_viewport_size({'width': 669, 'height': 900})
        t = show(doc2(balances=D['balances'] + [eb], usage=D['usage'] + use), 'service/elevenlabs'); pg.screenshot(path=out + '/elevenlabs-phone.png')
        ok('12,663 credits' in t, 'the phone layout shows the credits row too', t[:300])
        ok(not errs, 'no page error', errs)
        br.close()
finally:
    srvp.terminate()
# tools/costs_test.py and tools/costs_duo_test.py run on the real file by themselves (the night manifest runs both); they each own a port, so they are not started from here.

# ---------------------------------------------------------------- D: wiring
JOBS = [('tools/art-library/artgen.py', 'costlog.log_usage', None, 'art-gen'), ('tools/art-library/clipgen.py', 'costlog.log_from_env', 'clip-gen', 'clip-gen'), ('tools/guidegen/make_take.py', 'costlog.log_from_env', 'clip-gen', 'clip-gen'),
        ('tools/clip-gate/vision.py', 'costlog.log_from_env', 'clip-gate', 'clip-gate'), ('tools/voice-learn/voicegen.py', 'costlog.log_from_env', 'voice-gen', 'voice-gen'),
        ('tools/art-library/wangen.py', 'costlog.log_from_env', 'wan-gen', 'wan-gen'), ('tools/art-library/artqa.py', 'costlog.log_from_env', 'art-gen', 'art-gen')]
for f, call, wf, name in JOBS:
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    ok(call in src and 'import costlog' in src, '%s calls the logger' % f)
    y = open(os.path.join(ROOT, '.github', 'workflows', name + '.yml'), encoding='utf-8').read()
    ok('COSTS_LOG_REPO: ${{ github.workspace }}' in y or name == 'art-gen', '%s.yml gives it COSTS_LOG_REPO' % name)
ag = open(ROOT + '/.github/workflows/art-gen.yml').read()
ok('/tools/costlog.py' in ag and 'COSTS_LOG_REPO' in ag and '/data/costs.json' in ag, 'art-gen\'s sparse checkout holds tools/costlog.py and data/costs.json, and the replay step has COSTS_LOG_REPO')
cs = open(ROOT + '/.github/workflows/costs-sync.yml').read()
ok("cron: '" in cs and 'workflow_dispatch' in cs and all(k in cs for k in ('ELEVENLABS_API_KEY', 'FAL_ADMIN_KEY', 'XAI_MANAGEMENT_KEY', 'XAI_TEAM_ID')) and '/tools/costlog.py' in cs and 'contents: write' in cs and 'dry_run' in cs, 'costs-sync runs daily and by hand (dry by default) with the secrets named, and checks out costlog.py')
ok('—' not in open(ROOT + '/tools/costlog.py', encoding='utf-8').read() and '—' not in cs, 'no em dash in costlog.py or the workflow')
print('\nFAILS:', fails)
sys.exit(1 if fails else 0)
