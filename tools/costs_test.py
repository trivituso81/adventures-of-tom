#!/usr/bin/env python3
"""costs1 test (python3 tools/costs_test.py [outdir]): ADMIN > AI COSTS (costs.html, data/costs.json) on a desktop window.
Checks the data file (every charge has a date, a known service, a kind and an amount; no em dash), that the page's totals equal the file's sums on the
Overview, Ledger and Totals screens, the date and Game tools only filters, subtotals by service, ticked rows, a matrix cell opening the ledger, a
service screen, a charge added on this computer, a recorded balance, a balance written into the file by a job, the CSV, the page's own tab icon and the admin link.
Screenshots land in outdir. Prints FAILS: []."""
import json, os, re, subprocess, sys, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/costs'; os.makedirs(out, exist_ok=True)
fails = []
raw = open(os.path.join(ROOT, 'data', 'costs.json'), encoding='utf-8').read(); D = json.loads(raw)
T, S = D['transactions'], {s['id']: s for s in D['services']}
if '—' in raw or '—' in open(os.path.join(ROOT, 'costs.html'), encoding='utf-8').read(): fails.append('em dash in costs.html or data/costs.json')
ids = set()
for t in T:
    if not re.match(r'^\d{4}-\d\d-\d\d$', t.get('date', '')): fails.append('bad date %s' % t.get('id'))
    if t.get('service') not in S: fails.append('unknown service %s' % t.get('id'))
    if t.get('type') not in ('subscription', 'credits', 'refund'): fails.append('bad kind %s' % t.get('id'))
    if not isinstance(t.get('amount'), (int, float)): fails.append('bad amount %s' % t.get('id'))
    if (t.get('type') == 'refund') != (t.get('amount', 0) < 0): fails.append('refund sign %s' % t.get('id'))
    if t.get('id') in ids: fails.append('duplicate id %s' % t.get('id'))
    ids.add(t.get('id'))
    for k in ('what', 'via', 'ref', 'source'):
        if not t.get(k): fails.append('%s has no %s' % (t.get('id'), k))
def money(v): return ('-$' if v < 0 else '$') + '{:,.2f}'.format(abs(v))
def tot(rows): return round(sum(t['amount'] for t in rows), 2)
ALL = tot(T); GAME = tot([t for t in T if S[t['service']]['scope'] == 'game']); NOV = tot([t for t in T if t['date'][:7] == '2026-11'])
XAI = tot([t for t in T if t['service'] == 'xai']); XAINOV = tot([t for t in T if t['service'] == 'xai' and t['date'][:7] == '2026-11'])
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8096'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
H = 'http://127.0.0.1:8096/costs.html?today=2026-11-20'
def txt(pg, sel): return pg.inner_text(sel).replace('\n', '').strip()
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        cx = br.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True); pg = cx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        # overview
        pg.goto(H); pg.wait_for_selector('#grand')
        if txt(pg, '#grand') != money(ALL): fails.append('overview total %s, file says %s' % (txt(pg, '#grand'), money(ALL)))
        if pg.locator('#ch-months svg path, #ch-months svg rect:not(.hit)').count() < 6: fails.append('month chart has too few marks')
        if 'Nov 26, 2026' not in pg.inner_text('#view'): fails.append('next charge (Claude, Nov 26) not shown')
        pg.hover('#ch-months .hit >> nth=-1'); pg.wait_for_timeout(150)
        if money(NOV) not in pg.inner_text('#tip'): fails.append('month tooltip total %s' % pg.inner_text('#tip'))
        pg.screenshot(path=out + '/overview.png', full_page=False)
        pg.mouse.move(5, 5)
        pg.evaluate("document.getElementById('view').scrollTo(0,99999)"); pg.wait_for_timeout(100); pg.screenshot(path=out + '/overview-bottom.png')
        # filters
        pg.click('#bar button[data-v="game"]')
        if txt(pg, '#grand') != money(GAME): fails.append('game tools only total %s, want %s' % (txt(pg, '#grand'), money(GAME)))
        pg.click('#bar button[data-v="month"]')
        want = tot([t for t in T if t['date'][:7] == '2026-11' and S[t['service']]['scope'] == 'game'])
        if txt(pg, '#grand') != money(want): fails.append('this month total %s, want %s' % (txt(pg, '#grand'), money(want)))
        pg.click('#bar button[data-v="all"]'); pg.click('#bar button[data-f="scope"][data-v="all"]')
        # ledger
        pg.click('#nav a[href="#/ledger"]'); pg.wait_for_selector('#ltotal')
        if txt(pg, '#ltotal') != money(ALL): fails.append('ledger total %s' % txt(pg, '#ltotal'))
        if pg.locator('#view tbody tr[data-id]').count() != len(T): fails.append('ledger rows %d, file has %d' % (pg.locator('#view tbody tr[data-id]').count(), len(T)))
        pg.screenshot(path=out + '/ledger.png')
        pg.click('button[data-group="service"]')
        heads = pg.locator('tr.grp').evaluate_all('e=>e.map(x=>x.innerText.replace(/\\s+/g," ").trim())')
        if len(heads) != len({t['service'] for t in T}): fails.append('service groups %s' % heads)
        if not any(h.startswith('xAI API') and h.endswith(money(XAI)) for h in heads): fails.append('xAI subtotal missing in %s' % heads)
        pg.screenshot(path=out + '/ledger-by-service.png')
        pg.click('button[data-group="month"]'); pg.screenshot(path=out + '/ledger-by-month.png')
        pg.click('button[data-group="none"]')
        two = sorted(T, key=lambda t: t['date'] + t['time'], reverse=True)[:2]
        for t in two: pg.check('input[data-sel="%s"]' % t['id'])
        if money(tot(two)) not in txt(pg, '#lsel'): fails.append('ticked sum %s, want %s' % (txt(pg, '#lsel'), money(tot(two))))
        pg.click('#clearsel')
        pg.fill('#lq', 'top-up'); pg.wait_for_timeout(100)
        want = tot([t for t in T if 'top-up' in t['what'].lower()])
        if txt(pg, '#ltotal') != money(want): fails.append('search total %s, want %s' % (txt(pg, '#ltotal'), money(want)))
        if pg.evaluate('document.activeElement.id') != 'lq': fails.append('search box lost the cursor while typing')
        pg.fill('#lq', '')
        with pg.expect_download() as dl: pg.click('#csv')
        f = out + '/ledger.csv'; dl.value.save_as(f); lines = open(f, encoding='utf-8', newline='').read().strip().split('\r\n')
        if len(lines) != len(T) + 1 or not lines[0].startswith('Date,'): fails.append('csv has %d lines' % len(lines))
        # totals
        pg.click('#nav a[href="#/totals"]'); pg.wait_for_selector('#mtotal')
        if txt(pg, '#mtotal') != money(ALL) or txt(pg, '#grand') != money(ALL): fails.append('totals screen %s %s' % (txt(pg, '#mtotal'), txt(pg, '#grand')))
        if pg.locator('#ch-cum svg path').count() < 2: fails.append('running total chart missing')
        pg.screenshot(path=out + '/totals.png')
        pg.evaluate("document.getElementById('view').scrollTo(0,99999)"); pg.wait_for_timeout(100); pg.screenshot(path=out + '/totals-bottom.png')
        pg.click('td[data-cell="xai|2026-11"]'); pg.wait_for_selector('#ltotal')
        if txt(pg, '#ltotal') != money(XAINOV): fails.append('matrix cell opened ledger with %s, want %s' % (txt(pg, '#ltotal'), money(XAINOV)))
        pg.click('#lmonth'); pg.click('button.chip[data-svc="xai"]')
        # services
        pg.click('#nav a[href="#/services"]'); pg.wait_for_selector('a.card')
        if pg.locator('a.card').count() != len(S): fails.append('service cards %d' % pg.locator('a.card').count())
        pg.screenshot(path=out + '/services.png')
        pg.click('a.card[href="#/service/claude"]'); pg.wait_for_selector('dl.kv')
        body = pg.inner_text('#view')
        for w in ('Ultra', '$249.99 a month', 'Apple App Store', 'Ten times the Pro plan', money(tot([t for t in T if t['service'] == 'claude']))):
            if w not in body: fails.append('Claude screen lacks "%s"' % w)
        pg.screenshot(path=out + '/service-claude.png')
        pg.goto(H + '#/service/xai'); pg.wait_for_selector('#recbal')
        if 'Not read yet' not in pg.inner_text('#view'): fails.append('xAI balance should say Not read yet')
        pg.click('#recbal'); pg.fill('#dlg input[name=amount]', '31.42'); pg.click('#dlg button.gold'); pg.wait_for_timeout(150)
        if '$31.42' not in pg.inner_text('#view'): fails.append('recorded balance not shown')
        pg.screenshot(path=out + '/service-xai.png')
        pg.goto(H + '#/service/fal'); pg.wait_for_selector('dl.kv')
        if 'About $9.85' not in pg.inner_text('#view'): fails.append('fal estimate (paid less logged use) not shown')
        # add a charge on this computer
        pg.click('#add'); pg.fill('#dlg input[name=amount]', '20'); pg.fill('#dlg input[name=what]', 'Test renewal'); pg.screenshot(path=out + '/add.png'); pg.click('#dlg button.gold')
        pg.goto(H + '#/ledger'); pg.wait_for_selector('#ltotal')
        if txt(pg, '#ltotal') != money(round(ALL + 20, 2)) or 'Added on this computer' not in pg.inner_text('#view'): fails.append('added charge not counted: %s' % txt(pg, '#ltotal'))
        pg.click('button[data-del]'); pg.wait_for_timeout(100)
        if txt(pg, '#ltotal') != money(ALL): fails.append('removed charge still counted')
        # a balance written into the ledger file by a job shows with its meter
        D2 = json.loads(raw); D2['balances'].append({'service': 'elevenlabs', 'date': '2026-11-20', 'left': 450000, 'limit': 600000, 'unit': 'credits', 'source': 'Read from ElevenLabs by the costs-sync job.'})
        pg.route('**/data/costs.json*', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(D2)))
        pg.goto(H + '#/service/elevenlabs'); pg.reload(); pg.wait_for_selector('.meter', timeout=5000)
        if '450,000 credits' not in pg.inner_text('#view'): fails.append('ElevenLabs balance from the file not shown')
        pg.screenshot(path=out + '/service-elevenlabs.png'); pg.unroute('**/data/costs.json*')
        # smaller desktop window
        pg.set_viewport_size({'width': 1280, 'height': 720}); pg.goto(H); pg.wait_for_selector('#grand'); pg.screenshot(path=out + '/overview-1280.png')
        if pg.evaluate('document.documentElement.scrollWidth>innerWidth'): fails.append('sideways scroll at 1280 wide')
        # its own tab icon (costs1icon)
        hrefs = pg.eval_on_selector_all('link[rel~="icon"], link[rel="apple-touch-icon"]', 'e=>e.map(x=>x.getAttribute("href"))')
        if sorted(h.split('?')[0] for h in hrefs) != ['icon-costs-180.png', 'icon-costs-32.png']: fails.append('icon links are %s' % hrefs)
        for n in ('180', '32'):
            a = cx.request.get('http://127.0.0.1:8096/icon-costs-%s.png' % n); b = cx.request.get('http://127.0.0.1:8096/icon-admin-%s.png' % n)
            if a.status != 200 or a.body() == b.body(): fails.append('icon-costs-%s.png missing or the same as the admin icon' % n)
        # the admin page links here
        pg.goto('http://127.0.0.1:8096/admin.html'); pg.wait_for_selector('a.btn')
        if pg.locator('a.btn[href="costs.html"]').count() != 1: fails.append('admin.html has no AI Costs button')
        if errs: fails.append('page errors: %s' % errs[:3])
        br.close()
finally:
    srv.terminate()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
