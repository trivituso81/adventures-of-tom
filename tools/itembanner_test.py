# ITEM GAINED banner test (engine/party-banner.js itemBanner, itembanner1). Real browser.
# Checks: grantItem shows a held banner (icon, name, note) in place of the old toast; several items share one banner; it queues behind a party banner;
# a fight drop banner waits until the fight is over; shots in portrait and landscape: tools/shots/itembanner-<viewport>.png
# Usage: python3 tools/itembanner_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
TXT="()=>{ const w=document.getElementById('party-banner'); return w&&w.classList.contains('on')?[w.classList.contains('item'),w.querySelector('.pb-line').textContent,w.querySelector('.pb-note').textContent,w.querySelector('.pb-icon').textContent]:null; }"
def dismiss(pg):
    pg.wait_for_timeout(600); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_context(viewport={'width':390,'height':844},has_touch=True).new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.itemBanner'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ intro.active=false; dialog.active=false; }")
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(600)
        pg.evaluate("()=>{ grantItem('cookie'); }"); pg.wait_for_timeout(700)
        t=pg.evaluate(TXT)
        check(name+': single item banner shows name, icon and note',bool(t) and t[0] and 'Got' in t[1] and t[2]!='' and t[3]!='')
        check(name+': held',pg.evaluate("()=>partyBannerHeld()"))
        pg.screenshot(path=os.path.join(SHOTS,f'itembanner-{name}.png'))
        dismiss(pg); check(name+': Enter dismisses, game free',not pg.evaluate("()=>partyBannerHeld()"))
        pg.evaluate("()=>{ grantItem(['juice','juice','cookie']); partyBanner('grace','join'); }"); pg.wait_for_timeout(700)
        t=pg.evaluate(TXT); check(name+': several items on one banner',bool(t) and t[0] and 'x2' in t[1])
        dismiss(pg); t=pg.evaluate(TXT); check(name+': party banner queued behind it',bool(t) and not t[0] and 'Grace' in t[1])
        dismiss(pg); check(name+': all dismissed',not pg.evaluate("()=>partyBannerHeld()"))
    pg.evaluate("()=>{ battle.active=true; itemBanner(['cookie'],'drop'); }"); pg.wait_for_timeout(1200)
    check('drop banner waits while a fight is on',pg.evaluate(TXT) is None)
    pg.evaluate("()=>{ battle.active=false; }"); pg.wait_for_timeout(1200)
    check('drop banner shows after the fight',bool(pg.evaluate(TXT)))
    check('no page errors',not errs)
    if errs: print(errs[:3])
    br.close()
print('FAILED' if fails else 'PASSED'); raise SystemExit(1 if fails else 0)
