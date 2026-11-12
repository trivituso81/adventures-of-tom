# Coin find reveal test (engine/closeup.js closeupReveal, data/closeup-coinfinds.js). Real browser, real art.
# Checks: each of the 7 find scenes (chapters 3 to 9) holds exactly one {coinFind:N} in the right order; the scene op shows the coin,
# holds the scene until A, then the scene continues; world paused; portrait 390x844, landscape 844x390, Duo 951x648.
# Shots: tools/shots/coinfind-<viewport>-<n>.png. Usage: python3 tools/coinfinds_test.py
import threading, http.server, socketserver, functools, os, sys, re
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
src=open(os.path.join(ROOT,'data/scenes.js'),encoding='utf8').read()
check('each {coinFind:N} appears exactly once, N=1..7',[len(re.findall(r'\{coinFind:%d\}'%n,src)) for n in range(1,8)]==[1]*7)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(3); }"); pg.wait_for_timeout(2500)
    for i in range(300):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    # which scenes hold a coinFind
    holds=pg.evaluate("()=>{ const T=v=>typeof v==='function'?String(v):JSON.stringify(v,(k,x)=>typeof x==='function'?String(x):x); return Object.keys(SCENES).filter(k=>/coinFind/.test(T(SCENES[k]))).map(k=>[k,+/coinFind\\W+(\\d)/.exec(T(SCENES[k]))[1]]); }")
    print('scenes:',holds)
    check('7 find scenes, one per coin',sorted(h[1] for h in holds)==list(range(1,8)))
    pg.evaluate("()=>{ SCENES.__cf=n=>[{coinFind:n},{flag:'cf-after-'+n}]; }")
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390),'duo':(951,648)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(600)
        for n in range(1,8):
            pg.evaluate("n=>{ SCENES['__cf'+n]=[{coinFind:n},{flag:'cf-after-'+n}]; setFlag('cf-after-'+n,false); playScene('__cf'+n); }",n)
            pg.wait_for_timeout(2300)
            ok=pg.evaluate("()=>closeup.active&&closeup.reveal&&!!document.querySelector('#closeup .cu-rev img')")
            check(f'{name} coin {n}: shown and scene held',ok and not pg.evaluate("n=>!!flag('cf-after-'+n)",n))
            r=pg.evaluate("()=>{ const q=e=>e.getBoundingClientRect(); const c=q(document.querySelector('#closeup .cu-rev')),v=q(closeup.el),p=q(closeup.pad.firstChild),t=q(closeup.cap); return {c:[c.left,c.top,c.right,c.bottom],v:[v.left,v.top,v.right,v.bottom],p:[p.left,p.top,p.right,p.bottom],t:[t.left,t.top,t.right,t.bottom]}; }")
            ins=lambda a,b:a[0]>=b[0]-1 and a[1]>=b[1]-1 and a[2]<=b[2]+1 and a[3]<=b[3]+1
            check(f'{name} coin {n}: coin, caption and button inside the screen, no overlap',ins(r['c'],r['v']) and ins(r['p'],r['v']) and ins(r['t'],r['v']) and r['c'][3]<=r['t'][1]+1 and r['t'][3]<=r['p'][1]+1)
            if n in (1,4,7) or name=='portrait': pg.screenshot(path=os.path.join(SHOTS,f'coinfind-{name}-{n}.png'))
            if n==1:
                pg.evaluate("()=>{window.__p0=player.x+','+player.y}"); pg.keyboard.down('ArrowLeft'); pg.wait_for_timeout(300); pg.keyboard.up('ArrowLeft')
                check(name+': world paused',pg.evaluate("()=>window.__p0===player.x+','+player.y")); 
            pg.keyboard.press('Enter'); pg.wait_for_timeout(1000)
            check(f'{name} coin {n}: A continues the scene',pg.evaluate("n=>!closeup.active&&!!flag('cf-after-'+n)",n))
    check('no page errors',not errs)
    if errs: print(errs[:6])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
