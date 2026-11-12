#!/usr/bin/env python3
"""Headless test for cloud saves (engine/save-sync.js) against a fake GitHub gist API (page.route on api.github.com). No real token.
Run from the repo root: python3 tools/sync_test.py   (needs CHROMIUM like the other tools). Writes tools/shots/sync-*.png"""
import threading, http.server, socketserver, functools, json, os, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
G = {'gists': {}, 'log': [], 'mode': 'ok', 'n': 0}   # the fake GitHub
def api(route):
    req = route.request; url = req.url.split('api.github.com')[1]; m = req.method
    G['log'].append((m, url.split('?')[0]))
    CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'}
    if m == 'OPTIONS': return route.fulfill(status=204, headers=CORS)
    if G['mode'] == '401': return route.fulfill(status=401, headers=CORS, body='{}')
    if G['mode'] == '404': return route.fulfill(status=404, headers=CORS, body='{}')
    if G['mode'] == 'down': return route.abort()
    if 'Bearer test' not in (req.headers.get('authorization') or ''): return route.fulfill(status=401, headers=CORS, body='{}')
    body = json.loads(req.post_data or '{}') if req.post_data else {}
    if m == 'GET' and url.startswith('/gists?'): return route.fulfill(status=200, headers=CORS, content_type='application/json', body=json.dumps(list(G['gists'].values())))
    if m == 'POST' and url == '/gists':
        G['n'] += 1; g = {'id': 'g%d' % G['n'], 'created_at': '2026-11-12T00:00:%02dZ' % G['n'], 'public': body.get('public'), 'description': body.get('description'), 'files': {k: {'content': v['content']} for k, v in body['files'].items()}}
        G['gists'][g['id']] = g; return route.fulfill(status=201, headers=CORS, content_type='application/json', body=json.dumps(g))
    gid = url.split('/gists/')[-1] if '/gists/' in url else ''
    if gid in G['gists']:
        g = G['gists'][gid]
        if m == 'PATCH':
            for k, v in body['files'].items(): g['files'][k] = {'content': v['content']}
        return route.fulfill(status=200, headers=CORS, content_type='application/json', body=json.dumps(g))
    return route.fulfill(status=404, headers=CORS, body='{}')
def phone(br, token=True):
    c = br.new_context(viewport={'width': 390, 'height': 844}); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: d.accept('test'))
    c.route('https://api.github.com/**', api)
    if token: c.add_init_script("localStorage.setItem('aot-sync-token','test')")
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start&&typeof syncNow==="function"'); pg.wait_for_timeout(300)
    return c, pg, errs
def raw(when, mp='home'): return json.dumps({'party': [{'id': 'tom', 'level': 5, 'xp': 0, 'hp': 10, 'maxHp': 10}], 'map': mp, 'when': when})
def put(pg, slot, when, mp='home'):
    pg.evaluate("([s,r])=>{ SAVE_CACHE[s]=r; localStorage.setItem(SAVE_PREFIX+s,r); }", [slot, raw(when, mp)])
def local(pg, slot): return pg.evaluate("(s)=>{ const r=saveRaw(s); return r?JSON.parse(r):null }", slot)
def cloud(gid=None):
    g = G['gists'].get(gid) if gid else next(iter(G['gists'].values()), None)
    return json.loads(g['files']['adventures-of-tom-saves.json']['content']) if g else None
def devs(): return (cloud() or {}).get('devices', {})
def wait_sync(pg): pg.wait_for_function('()=>!syncChecking()', timeout=15000); pg.wait_for_timeout(200)
def load_text(pg): return pg.inner_text('#splash')
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    # 1. setup on phone 1 (no token yet): paste, create the private gist, upload this device's section
    c1, p1, e1 = phone(br, token=False)
    ok(p1.evaluate('syncOn()') is False and 'Cloud saves are off' in p1.evaluate('saveNoteLine()'), 'starts with cloud saves off and the save text says how to turn them on')
    put(p1, '1', 1000, 'alpha'); put(p1, 'auto', 1100, 'alphaauto')
    p1.evaluate("syncTap(m=>window.__msg=m)"); p1.wait_for_function('window.__msg')
    ok('Cloud saves are on' in p1.evaluate('__msg') and 'uploaded' in p1.evaluate('__msg'), 'setup message: ' + p1.evaluate('__msg'))
    g = next(iter(G['gists'].values()), {})
    ok(g.get('public') is False and 'adventures-of-tom-saves.json' in g.get('files', {}), 'gist created PRIVATE with the saves file')
    d1 = p1.evaluate('syncDeviceId()')
    ok(cloud().get('v') == 2 and d1 in devs() and set(devs()[d1]['slots']) == {'1', 'auto'} and 'test' not in json.dumps(cloud()), 'cloud file v2 holds phone 1 section (slot 1 + autosave) and no token')
    ok('private GitHub gist' in p1.evaluate('saveNoteLine()'), 'save text now mentions the cloud copy')
    # 2. a real save uploads by itself after about 5 s; three quick saves make one upload
    n0 = sum(1 for x in G['log'] if x[0] == 'PATCH')
    put(p1, '2', 2000); p1.evaluate("syncQueue()"); p1.wait_for_timeout(6500)
    ok(sum(1 for x in G['log'] if x[0] == 'PATCH') == n0 + 1 and '2' in devs()[d1]['slots'], 'queued save uploads once, about 5 s later')
    p1.evaluate("syncQueue();syncQueue();syncQueue()"); p1.wait_for_timeout(6500)
    ok(sum(1 for x in G['log'] if x[0] == 'PATCH') == n0 + 2, 'three quick saves make one upload')
    ok(p1.evaluate("(saveGame.toString().indexOf('syncQueue')>=0)"), 'saveGame hands every save to syncQueue')
    # 3. phone 2 already has the token and its OWN game in slot 1 and autosave (newer than phone 1's). Tom's report: these used to replace each other.
    c2, p2, e2 = phone(br, token=False)
    put(p2, '1', 5000, 'beta'); put(p2, 'auto', 5100, 'betaauto')
    p2.evaluate("localStorage.setItem('aot-sync-token','test')"); p2.reload(); p2.wait_for_function('()=>typeof syncNow==="function"')
    p2.evaluate("loadMenu()"); p2.wait_for_timeout(100)
    early = load_text(p2)
    wait_sync(p2); p2.wait_for_timeout(300)
    txt = load_text(p2)
    ok('Checking the cloud' in early or 'SLOT 1' in early, 'Load page opened during the launch read says it is checking (%s)' % early.replace('\n', ' | ')[:90])
    ok(txt.count('AUTOSAVE') >= 2 and txt.count('SLOT 1') >= 2 and 'SLOT 2' in txt, 'phone 2 Load page redraws itself and lists its own saves AND phone 1 saves (%s)' % txt.replace('\n', ' | ')[:200])
    ok(local(p2, '1')['map'] == 'beta' and local(p2, 'auto')['map'] == 'betaauto', 'phone 2 own slot 1 and autosave untouched')
    p2.screenshot(path=os.path.join(SHOTS, 'sync-title-load.png'))
    d2 = p2.evaluate('syncDeviceId()')
    ok(d1 in devs() and d2 in devs() and json.loads(devs()[d1]['slots']['1'])['map'] == 'alpha' and json.loads(devs()[d2]['slots']['1'])['map'] == 'beta', 'cloud keeps both devices slot 1, each in its own section')
    # 4. phone 1 sees phone 2 saves too, and its own slot 1 stays alpha even though phone 2 slot 1 is newer
    p1.reload(); p1.wait_for_function('()=>typeof syncNow==="function"'); p1.wait_for_timeout(2000); wait_sync(p1)
    ok(local(p1, '1')['map'] == 'alpha' and local(p1, 'auto')['map'] == 'alphaauto', 'phone 1 own saves never replaced by the newer ones from phone 2')
    others = p1.evaluate("syncOthers().map(o=>[o.slot,o.sv.map])")
    ok(['1', 'beta'] in others and ['auto', 'betaauto'] in others, 'phone 1 lists phone 2 slot 1 and autosave: %s' % others)
    # 5. loading another device save copies it into a free slot here (same number when free) and loads it
    slot = p1.evaluate("(()=>{ const o=syncOthers().find(x=>x.slot==='auto'); return syncTake(o); })()")
    ok(slot == '3' and local(p1, '3')['map'] == 'betaauto', 'another device autosave copied into the first free numbered slot (%s)' % slot)
    ok(all(x[1] != 'betaauto' for x in p1.evaluate("syncOthers().map(o=>[o.slot,o.sv.map])")), 'a save already copied here is not listed twice')
    p1.wait_for_timeout(6500)
    ok('3' in devs()[d1]['slots'] and d2 in devs(), 'the copy is uploaded in phone 1 section; phone 2 section untouched')
    # 5b. never overwrite: with slots 1 to 10 all used here, a cloud save goes to a NEW slot 11; nothing here changes
    before = {str(i): local(p1, str(i)) for i in range(1, 11)}
    for i in range(1, 11):
        if before[str(i)] is None: put(p1, str(i), 3000 + i, 'fill%d' % i)
    before = {str(i): json.dumps(local(p1, str(i))) for i in range(1, 11)}
    slot = p1.evaluate("(()=>{ const o=syncOthers().find(x=>x.slot==='1'); return o?syncTake(o):null; })()")
    ok(slot == '11' and local(p1, '11')['map'] == 'beta', 'all ten slots used: the cloud save goes to a new Slot 11 (%s)' % slot)
    ok(all(json.dumps(local(p1, str(i))) == before[str(i)] for i in range(1, 11)), 'slots 1 to 10 untouched')
    p1.evaluate("openSave&&openSave()"); p1.wait_for_timeout(300)
    pop = p1.evaluate("document.getElementById('menu-save')?document.getElementById('menu-save').innerText:''")
    ok('Slot 11' in pop and 'Slot 12' in pop and 'Empty' in pop, 'save popup lists Slot 11 and offers an empty Slot 12')
    p1.screenshot(path=os.path.join(SHOTS, 'sync-save-pop.png'))
    p1.evaluate("closeMenu&&closeMenu()")
    # backup file restore never replaces either: a different save for slot 1 lands in a new slot; an identical one is skipped
    p1.evaluate("([s,r])=>{ SAVE_CACHE[s]=r; localStorage.setItem(SAVE_PREFIX+s,r); }", ['clear-1', raw(50, 'clearA')])
    r = p1.evaluate("([a,b,c])=>restoreFromText(JSON.stringify({app:'adventures-of-tom',v:1,when:1,slots:{'1':a,'2':b,'clear-1':c}}))", [raw(99999, 'frombackup'), p1.evaluate("saveRaw('2')"), raw(60, 'clearB')])
    ok(p1.evaluate("JSON.parse(saveRaw('clear-1')).map")=='clearA' and p1.evaluate("saveRaw('clear-2')") and json.loads(p1.evaluate("saveRaw('clear-2')"))['map']=='clearB', 'clear data from the backup goes to clear-2; clear-1 untouched')
    ok(r['restored'] == 2 and r['moved'] == 2 and r['kept'] == 1 and json.dumps(local(p1, '1')) == before['1'], 'backup restore: different saves go to new slots, identical one kept, slot 1 untouched (%s)' % r)
    ok(local(p1, '12')['map'] == 'frombackup', 'backup save landed in Slot 12')
    p1.reload(); p1.wait_for_function('()=>typeof syncNow==="function"')
    ok(p1.evaluate("SAVE_SLOTS.includes('12')") and local(p1, '12') is not None, 'slots above 10 come back after a restart')
    # 6. a deleted save on one device leaves the cloud with the next sync of that device only
    p2.evaluate("delete SAVE_CACHE['1'];localStorage.removeItem(SAVE_PREFIX+'1')"); p2.evaluate("window.__r=null;syncNow(true,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r')
    ok('1' not in devs()[d2]['slots'] and '1' in devs()[d1]['slots'], 'phone 2 removing its slot 1 does not touch phone 1 slot 1')
    # 7. an old v1 cloud file (shared slots) shows as "Earlier cloud copy" and is tidied away once its saves are in a device section
    G['gists'].clear(); G['n'] = 0
    G['gists']['old'] = {'id': 'old', 'created_at': '2026-11-09T00:00:00Z', 'public': False, 'files': {'adventures-of-tom-saves.json': {'content': json.dumps({'app': 'adventures-of-tom', 'v': 1, 'when': 1, 'slots': {'4': raw(700, 'legacyfour'), '1': local(p1, '1') and json.dumps(local(p1, '1'))}})}}}
    c4, p4, e4 = phone(br, token=False)
    p4.evaluate("localStorage.setItem('aot-sync-token','test')"); p4.evaluate("window.__r=null;syncNow(false,false).then(r=>window.__r=r)"); p4.wait_for_function('window.__r')
    o4 = p4.evaluate("syncOthers().map(o=>[o.label,o.slot,o.sv.map])")
    ok(['Earlier cloud copy', '4', 'legacyfour'] in o4 and cloud('old').get('v') == 2, 'v1 file read as "Earlier cloud copy" and rewritten as v2: %s' % o4)
    # 8. two devices that each made their own gist end up merged on the oldest one
    G['gists']['new'] = {'id': 'new', 'created_at': '2026-11-10T00:00:00Z', 'public': False, 'files': {'adventures-of-tom-saves.json': {'content': json.dumps({'app': 'adventures-of-tom', 'v': 2, 'when': 2, 'devices': {'dX': {'label': 'iPad app', 'when': 2, 'slots': {'5': raw(800, 'ipadfive')}}}})}}}
    p4.evaluate("window.__msg=null;syncTap(m=>window.__msg=m)"); p4.wait_for_function('window.__msg')
    ok('dX' in cloud('old')['devices'] and ['iPad app', '5', 'ipadfive'] in p4.evaluate("syncOthers().map(o=>[o.label,o.slot,o.sv.map])"), 'saves from a second gist are merged into the oldest gist and listed (%s)' % p4.evaluate('__msg'))
    # 9. failures
    G['mode'] = 'down'; p2.evaluate("window.__r=null;syncNow(true,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r')
    ok('reach GitHub' in p2.evaluate('__r.err') and 'problem' in p2.evaluate('saveNoteLine()'), 'offline: a plain message, saves untouched')
    G['mode'] = '401'; p2.evaluate("window.__r=null;syncNow(true,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r'); p2.wait_for_timeout(300)
    ok('refused the token' in p2.evaluate('__r.err'), 'bad token: plain message')
    G['mode'] = 'ok'
    c3, p3, e3 = phone(br, token=False); G['mode'] = '401'
    p3.evaluate("syncTap(m=>window.__msg=m)"); p3.wait_for_function('window.__msg')
    ok('refused the token' in p3.evaluate('__msg') and p3.evaluate('syncOn()') is False, 'setup with a bad token says so and leaves cloud saves off')
    G['mode'] = '404'; p3.evaluate("window.__msg=null;syncTap(m=>window.__msg=m)"); p3.wait_for_function('window.__msg')
    ok('Gists permission' in p3.evaluate('__msg') and p3.evaluate('syncOn()') is False, 'token without gist permission: tells Tom what the token needs')
    G['mode'] = 'ok'
    # 10. in-game Load tab lists other devices too
    p4.evaluate("splash.active=false;document.getElementById('splash').hidden=true;endIntro&&endIntro()")
    p4.evaluate("openMenu&&openMenu(); menuTab='saves'; renderMenu()"); p4.wait_for_timeout(800)
    txt = p4.evaluate("document.getElementById('menu')?document.getElementById('menu').innerText:''")
    ok('SYNC NOW' in txt and 'CLOUD OFF' in txt and 'From your other devices' in txt and 'iPad app' in txt, 'Load tab shows other devices and SYNC NOW / CLOUD OFF (%s)' % txt.replace('\n', ' | ')[:160])
    p4.screenshot(path=os.path.join(SHOTS, 'sync-load-tab.png'))
    p4.evaluate("syncOff()"); ok(p4.evaluate('syncOn()') is False and p4.evaluate("localStorage.getItem('aot-sync-gist')") is None and p4.evaluate('syncOthers().length') == 0, 'CLOUD OFF clears the token, gist id and the cloud list on this device')
    for n, e in (('p1', e1), ('p2', e2), ('p3', e3), ('p4', e4)): ok(not e, n + ': no page errors ' + str(e))
    br.close()
print('FAILS:', fails); raise SystemExit(1 if fails else 0)
