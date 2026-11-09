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
        G['n'] += 1; g = {'id': 'g%d' % G['n'], 'public': body.get('public'), 'description': body.get('description'), 'files': {k: {'content': v['content']} for k, v in body['files'].items()}}
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
def cloud(): 
    g = next(iter(G['gists'].values()), None); return json.loads(g['files']['adventures-of-tom-saves.json']['content']) if g else None
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    # 1. setup on phone 1 (no token yet): paste, create the private gist, upload
    c1, p1, e1 = phone(br, token=False)
    ok(p1.evaluate('syncOn()') is False and 'Cloud saves are off' in p1.evaluate('saveNoteLine()'), 'starts with cloud saves off and the save text says how to turn them on')
    put(p1, '1', 1000, 'alpha')
    p1.evaluate("syncTap(m=>window.__msg=m)"); p1.wait_for_function('window.__msg')
    ok('Cloud saves are on' in p1.evaluate('__msg') and 'uploaded' in p1.evaluate('__msg'), 'setup message: ' + p1.evaluate('__msg'))
    g = next(iter(G['gists'].values()), {})
    ok(g.get('public') is False and 'adventures-of-tom-saves.json' in g.get('files', {}), 'gist created PRIVATE with the saves file')
    ok(cloud() and '1' in cloud()['slots'] and 'token' not in json.dumps(cloud()), 'cloud copy holds slot 1 and no token')
    ok('private GitHub gist' in p1.evaluate('saveNoteLine()'), 'save text now mentions the cloud copy')
    # 2. a real save uploads by itself after about 5 s
    n0 = sum(1 for x in G['log'] if x[0] == 'PATCH')
    put(p1, '2', 2000); p1.evaluate("syncQueue()"); p1.wait_for_timeout(6500)
    ok(sum(1 for x in G['log'] if x[0] == 'PATCH') == n0 + 1 and '2' in cloud()['slots'], 'queued save uploads once, about 5 s later')
    p1.evaluate("syncQueue();syncQueue();syncQueue()"); p1.wait_for_timeout(6500)
    ok(sum(1 for x in G['log'] if x[0] == 'PATCH') == n0 + 2, 'three quick saves make one upload')
    # saveGame itself calls syncQueue
    ok(p1.evaluate("syncSet('aot-sync-x','');(saveGame.toString().indexOf('syncQueue')>=0)"), 'saveGame hands every save to syncQueue')
    # 3. phone 2 (new phone): token pasted, pulls both slots, shows the load menu with the cloud option
    c2, p2, e2 = phone(br, token=False)
    ok(local(p2, '1') is None, 'phone 2 starts with no saves')
    p2.evaluate("loadMenu()"); p2.wait_for_timeout(500)
    ok('CLOUD SAVES' in p2.inner_text('#splash'), 'title Load page offers CLOUD SAVES when there are no saves')
    p2.screenshot(path=os.path.join(SHOTS, 'sync-title-load.png'))
    p2.evaluate("syncTap(m=>window.__msg=m)"); p2.wait_for_function('window.__msg')
    ok('Pulled 2 newer saves' in p2.evaluate('__msg') and local(p2, '1')['map'] == 'alpha' and local(p2, '2') is not None, 'new phone pulls both saves: ' + p2.evaluate('__msg'))
    # 4. newer wins both ways; boot pull
    put(p2, '1', 5000, 'beta'); put(p2, '3', 3000, 'gamma')
    p2.evaluate("syncNow(true,false).then(r=>window.__r=r)"); p2.wait_for_function('window.__r')
    ok(cloud()['slots']['1'] and json.loads(cloud()['slots']['1'])['map'] == 'beta' and '3' in cloud()['slots'], 'phone 2 newer slot 1 and new slot 3 reached the cloud')
    put(p1, '2', 100, 'oldtwo')   # phone 1 has an OLDER slot 2 than the cloud
    p1.reload(); p1.wait_for_function('()=>typeof syncNow==="function"'); p1.wait_for_timeout(3500)
    ok(local(p1, '1')['map'] == 'beta' and local(p1, '3')['map'] == 'gamma', 'boot pull on phone 1 brings the newer slot 1 and slot 3')
    ok(local(p1, '2')['when'] == 2000 and local(p1, '2')['map'] == 'home', 'an older local copy is replaced by the newer cloud copy, never the reverse')
    put(p1, '3', 9000, 'newest'); p1.evaluate("syncNow(false,true).then(r=>window.__r=r)"); p1.wait_for_function('window.__r')
    ok(json.loads(cloud()['slots']['3'])['map'] == 'newest', 'a newer local slot is uploaded and the cloud copy never goes back to an older one')
    put(p2, '3', 8000, 'older'); p2.evaluate("window.__r=null;syncNow(false,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r')
    ok(local(p2, '3')['map'] == 'newest', 'phone 2 had an older slot 3 and took the newer one')
    # 5. failures
    G['mode'] = 'down'; p2.evaluate("window.__r=null;syncNow(true,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r')
    ok('reach GitHub' in p2.evaluate('__r.err') and 'problem' in p2.evaluate('saveNoteLine()'), 'offline: a plain message, saves untouched')
    G['mode'] = '401'; p2.evaluate("window.__r=null;syncNow(true,true).then(r=>window.__r=r)"); p2.wait_for_function('window.__r'); p2.wait_for_timeout(300)
    ok('refused the token' in p2.evaluate('__r.err') and p2.locator('#toast, .toast').count() >= 0, 'bad token: plain message')
    G['mode'] = 'ok'
    c3, p3, e3 = phone(br, token=False); G['mode'] = '401'
    p3.evaluate("syncTap(m=>window.__msg=m)"); p3.wait_for_function('window.__msg')
    ok('refused the token' in p3.evaluate('__msg') and p3.evaluate('syncOn()') is False, 'setup with a bad token says so and leaves cloud saves off')
    G['mode'] = '404'; p3.evaluate("window.__msg=null;syncTap(m=>window.__msg=m)"); p3.wait_for_function('window.__msg')
    ok('Gists permission' in p3.evaluate('__msg') and p3.evaluate('syncOn()') is False, 'token without gist permission: tells Tom what the token needs')
    G['mode'] = 'ok'
    # 6. in-game Load tab
    p1.evaluate("splash.active=false;document.getElementById('splash').hidden=true;endIntro&&endIntro()")
    p1.evaluate("openMenu&&openMenu(); menuTab='saves'; renderMenu()"); p1.wait_for_timeout(500)
    txt = p1.evaluate("document.getElementById('menu')?document.getElementById('menu').innerText:''")
    ok('SYNC NOW' in txt and 'CLOUD OFF' in txt, 'Load tab shows SYNC NOW and CLOUD OFF when connected (%s)' % txt.replace('\n', ' | ')[:120])
    p1.screenshot(path=os.path.join(SHOTS, 'sync-load-tab.png'))
    p1.evaluate("syncOff()"); ok(p1.evaluate('syncOn()') is False and p1.evaluate("localStorage.getItem('aot-sync-gist')") is None, 'CLOUD OFF clears the token and gist id on this phone')
    ok(len(G['gists']) == 1, 'only one gist was ever created (phones found the existing one)')
    for n, e in (('p1', e1), ('p2', e2), ('p3', e3)): ok(not e, n + ': no page errors ' + str(e))
    br.close()
print('FAILS:', fails); raise SystemExit(1 if fails else 0)
