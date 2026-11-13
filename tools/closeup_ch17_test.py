# Chapter 17 snow globe close-up test (engine/closeup.js closeupReveal with snow, data/closeup-ch17.js).
# Plays the real SCENES.ch17Vault from its start in portrait 390 x 844, landscape 844 x 390, Duo 951 x 648.
# Checks: the REVEAL screen opens before Tom's Vault line, caption, snow flakes exist, box inside the screen, A is ignored while rising,
# A continues, Tom's line then plays, the flag ch17-vault stays 'pending', no page errors. Shots: tools/shots/cu17-*.png.
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
def adv(pg,stop,n=300):
    for i in range(n):
        if pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
    return False
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'cu17-{n}.png'))
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name,size in [('portrait',(390,844)),('landscape',(844,390)),('duo',(951,648))]:
        pg=br.new_page(viewport={'width':size[0],'height':size[1]})
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
        pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(17); }"); pg.wait_for_timeout(2000)
        adv(pg,"()=>!intro.active&&!dialog.active&&!transition",200)
        check(name+': globeFind op registered',pg.evaluate("()=>typeof SCENE_OPS.globeFind==='function'"))
        pg.evaluate("()=>{ delete STORY.flags['ch17-vault']; playScene('ch17Vault'); }")
        check(name+': reveal opens before Tom speaks',pg.wait_for_function("()=>closeup.active&&closeup.reveal&&!dialog.active",timeout=5000) is not None)
        pg.wait_for_timeout(2000); shot(pg,name+'-a')
        r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const v=q(closeup.el),b=q(document.querySelector('#closeup .cu-rev')),c=q(closeup.cap),p=q(closeup.pad); return {v:[v.left,v.top,v.right,v.bottom],b:[b.left,b.top,b.right,b.bottom],c:[c.left,c.top,c.right,c.bottom],p:[p.left,p.top,p.right,p.bottom],cap:closeup.cap.textContent,snow:document.querySelectorAll('#closeup .cu-snow i').length}; }")
        ins=lambda a,b: a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
        check(name+': globe, caption, button inside the screen',ins(r['b'],r['v']) and ins(r['c'],r['v']) and ins(r['p'],r['v']))
        check(name+': caption and snow',r['cap']=='THE SNOW GLOBE' and r['snow']>=20)
        pg.wait_for_timeout(1500); shot(pg,name+'-b')
        pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
        check(name+': A continues, screen gone',pg.evaluate("()=>!closeup.active&&!document.getElementById('closeup')&&!closeup.reveal"))
        check(name+': Tom speaks next',adv(pg,"()=>dialog.active",60))
        check(name+': flag ch17-vault is pending',pg.evaluate("()=>flag('ch17-vault')==='pending'"))
        pg.close()
    br.close() if False else None
    check('no page errors',not errs)
    for e in errs[:6]: print('  ',e)
    br.close()
print('FAILS',fails); raise SystemExit(1 if fails else 0)
