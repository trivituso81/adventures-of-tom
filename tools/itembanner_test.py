# ITEM GAINED banner test (engine/party-banner.js itemBanner, itembanner1). Real browser.
# itembannerart1: an item listed in ITEM_ART shows its painted picture (art/items/<id>.webp) in the ring; an item with no picture, or whose file fails to load, shows its emoji.
# Checks: grantItem shows a held banner (icon, name, note) in place of the old toast; several items share one banner; it queues behind a party banner;
# a fight drop banner waits until the fight is over; shots in portrait and landscape: tools/shots/itembanner-<viewport>.png
# Usage: python3 tools/itembanner_test.py
import threading, http.server, socketserver, functools, os, io
from PIL import Image, ImageDraw
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
    pg=br.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block').new_page()   # no service worker: the test serves its own picture for art/items/cookie.webp
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
    # itembannerart1: painted picture in the banner, emoji only without a picture
    dismiss(pg)   # the drop banner above is still on screen
    im=Image.new('RGBA',(200,160),(0,0,0,0)); ImageDraw.Draw(im).ellipse([20,10,180,150],fill=(222,170,40,255)); buf=io.BytesIO(); im.save(buf,'PNG'); PNG=buf.getvalue()
    ctx=pg.context
    ctx.route('**/art/items/cookie.webp*',lambda r: r.fulfill(status=200,content_type='image/png',body=PNG))
    ctx.route('**/art/items/juice.webp*',lambda r: r.fulfill(status=404,body=''))
    ICON="()=>{ const w=document.getElementById('party-banner'); const i=w.querySelector('.pb-icon'); return {shown:getComputedStyle(i).display!=='none',pics:[...i.querySelectorAll('img')].map(x=>[x.dataset.item,x.naturalWidth,x.getAttribute('src')]),emoji:[...i.querySelectorAll('.pb-emoji')].map(x=>x.textContent),face:getComputedStyle(w.querySelector('.pb-face')).display}; }"
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(600)
        pg.evaluate("()=>{ ITEM_ART.splice(0,ITEM_ART.length,'cookie','juice'); grantItem('cookie'); }"); pg.wait_for_timeout(900)
        t=pg.evaluate(ICON)
        check(name+': an item with a picture shows the picture, not the emoji',t['shown'] and len(t['pics'])==1 and t['pics'][0][0]=='cookie' and t['pics'][0][1]>0 and 'art/items/cookie.webp?v=' in t['pics'][0][2] and not t['emoji'] and t['face']=='none')
        pg.screenshot(path=os.path.join(SHOTS,f'itembanner-art-{name}.png')); dismiss(pg)
        pg.evaluate("()=>{ grantItem('juice'); }"); pg.wait_for_timeout(900)
        t=pg.evaluate(ICON)
        check(name+': a picture that fails to load falls back to the emoji',t['shown'] and not t['pics'] and len(t['emoji'])==1 and t['emoji'][0]!='')
        dismiss(pg)
        pg.evaluate("()=>{ grantItem(['cookie','roll']); }"); pg.wait_for_timeout(900)
        t=pg.evaluate(ICON)
        check(name+': two items on one banner mix a picture and an emoji',len(t['pics'])==1 and len(t['emoji'])==1)
        pg.screenshot(path=os.path.join(SHOTS,f'itembanner-art-mixed-{name}.png')); dismiss(pg)
        pg.evaluate("()=>{ ITEM_ART.splice(0,ITEM_ART.length); grantItem('cookie'); }"); pg.wait_for_timeout(900)
        t=pg.evaluate(ICON)
        check(name+': an item not in ITEM_ART keeps its emoji',not t['pics'] and len(t['emoji'])==1)
        dismiss(pg)
    check('no page errors',not errs)
    if errs: print(errs[:3])
    br.close()
print('FAILED' if fails else 'PASSED'); raise SystemExit(1 if fails else 0)
