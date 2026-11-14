# REPORT test (report1, docs/REPORTS.md). Opens the report screen in several game states and both layouts with a stand-in GitHub
# (the game's ?gh= address), and checks: the game freezes and thaws (clock, frames, timers), the picture the phone takes matches the real
# screen, the note, pins and game state are filed as reports/<id>.jpg then reports/<id>.json on branch inbox, a report made with no
# connection waits on the device and goes out later, and nothing typed in the report reaches the game.
# Usage (repo root): python3 tools/report_test.py [OUT]     (OUT default /tmp/report; look at OUT/*-sheet.png: real screen left, phone picture right)
import threading, http.server, socketserver, functools, os, sys, json, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageStat
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/report'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
PUTS=[]; GH={'down':False}
class G(http.server.BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def _h(self,code):
        self.send_response(code); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Headers','*'); self.send_header('Access-Control-Allow-Methods','GET,PUT,OPTIONS'); self.send_header('Content-Type','application/json'); self.end_headers()
    def do_OPTIONS(self): self._h(204)
    def do_PUT(self):
        body=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))) or b'{}')
        if GH['down']: self._h(503); self.wfile.write(b'{}'); return
        PUTS.append({'path':self.path,'auth':self.headers.get('Authorization'),'branch':body.get('branch'),'message':body.get('message'),'content':body.get('content','')})
        self._h(201); self.wfile.write(b'{"content":{}}')
gsrv=socketserver.ThreadingTCPServer(('127.0.0.1',0),G); gport=gsrv.server_address[1]
threading.Thread(target=gsrv.serve_forever,daemon=True).start()
fails=[]
def check(ok,what):
    print(('ok   ' if ok else 'FAIL ')+what)
    if not ok: fails.append(what)
START=r"""()=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro(); resetStory('full',2); setChapter(2,{apply:false});
  const m=worlds['town']; currentMap=m; player.x=m.spawn.x; player.y=m.spawn.y; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }"""
def until(pg,expr,ms=15000):   # not wait_for_function: it polls with animation frames or timers, and the freeze holds both
    for _ in range(ms//100):
        if pg.evaluate(expr): return True
        pg.wait_for_timeout(100)
    raise SystemExit('timed out waiting for '+expr)
def sheet(name,real,mine):
    a=Image.open(real).convert('RGB'); b=Image.open(io.BytesIO(mine)).convert('RGB')
    if a.width>a.height and b.height>b.width: pass
    b2=b.resize(a.size); d=ImageStat.Stat(ImageChops.difference(a.resize((a.width//8,a.height//8)),b2.resize((a.width//8,a.height//8)))).mean
    s=Image.new('RGB',(a.width*2+10,a.height),'#f0f'); s.paste(a,(0,0)); s.paste(b2,(a.width+10,0)); s.save(os.path.join(OUT,name+'-sheet.png'))
    return sum(d)/3
def run(pw,layout):
    br=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,args=['--headless=new','--no-proxy-server'])
    cx=br.new_context(viewport={'width':390,'height':844}); pg=cx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.add_init_script("try{localStorage.setItem('aot-gh-token','test-token');}catch(e){}")
    pg.goto(f'http://127.0.0.1:{port}/index.html?gh=http://127.0.0.1:{gport}'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(2500)
    L=layout[0]
    if layout=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }"); pg.wait_for_timeout(600)
    check(pg.evaluate("()=>!!brp.btn&&!brp.btn.hidden"),f'{L} tab shows on a device with the token')
    def shoot(name):
        pg.evaluate("()=>{ brp.btn.style.visibility='hidden'; }"); pg.wait_for_timeout(150)
        real=os.path.join(OUT,f'{name}-{L}-real.png'); pg.screenshot(path=real)
        pg.evaluate("()=>{ brp.btn.style.visibility=''; }")
        pg.evaluate("()=>brpOpen()"); until(pg,"()=>!!brp.shot")
        pg.screenshot(path=os.path.join(OUT,f'{name}-{L}-form.png'))
        mine=base64.b64decode(pg.evaluate("()=>brpJpeg()")); im=Image.open(io.BytesIO(mine))
        if layout=='landscape':   # the phone picture is in the game's own orientation; the real screenshot is the turned device
            r=Image.open(real).rotate(90,expand=True); real=real.replace('-real','-realturned'); r.save(real)
        d=sheet(f'{name}-{L}',real,mine)
        check(d<14,f'{L} {name}: phone picture matches the screen (mean difference {d:.1f}, size {im.size}, {len(mine)//1024} KB)')
        return pg.evaluate("()=>brp.meta")
    # title
    m=shoot('title'); check(m['mode']=='title',f'{L} title mode'); pg.evaluate("()=>brpClose()")
    pg.evaluate(START); pg.wait_for_timeout(1200)
    # freeze: clock, frames and timers stop; they continue after
    pg.evaluate("()=>{ window.__fr=0; const o=updateCamera; updateCamera=function(dt){ window.__fr++; return o.apply(this,arguments); }; window.__tm=0; }")
    pg.wait_for_timeout(200); f0=pg.evaluate("()=>window.__fr")
    m=shoot('map'); pg.evaluate("()=>{ setTimeout(()=>{ window.__tm=1; },100); }"); t1=pg.evaluate("()=>[performance.now(),window.__fr,window.__tm]"); pg.wait_for_timeout(900); t2=pg.evaluate("()=>[performance.now(),window.__fr,window.__tm]")
    check(f0>3 and t1[0]==t2[0] and t1[1]==t2[1] and t2[2]==0,f'{L} frozen: clock, frames and timers stand still ({f0} {t1} {t2})')
    check(m['mode']=='map' and m['map']['id']=='town' and m['story']['chapter']==2 and m['party'][0]=='tom' and m['save'] and m['screen']['layout']==layout,f'{L} map state recorded')
    # typing does not reach the game; pins; send
    px=pg.evaluate("()=>[player.x,player.y,menuOpen]")
    pg.fill('#brp-note','Rose is floating here. m')
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press('m'); pg.keyboard.press('Enter')
    box=pg.locator('#brp-shotwrap canvas').bounding_box(); pg.mouse.click(box['x']+box['width']*.25,box['y']+box['height']*.5); pg.mouse.click(box['x']+box['width']*.75,box['y']+box['height']*.25)
    pg.click('#brp button[data-kind="art"]'); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(OUT,f'filled-{L}-form.png'))
    n0=len(PUTS); pg.click('#brp-send'); until(pg,"()=>!brp.open"); pg.wait_for_timeout(1500)
    t3=pg.evaluate("()=>[performance.now(),window.__fr,window.__tm,player.x,player.y,menuOpen]")
    check(t3[1]>t2[1] and t3[2]==1 and t3[0]-t2[0]<3000,f'{L} thawed: frames and the held timer run again, clock did not jump ({t3[:3]})')
    check(t3[3:]==px,f'{L} keys typed in the report did not move Tom or open the menu')
    new=PUTS[n0:]
    check(len(new)==2 and new[0]['path'].endswith('.jpg') and new[1]['path'].endswith('.json') and all(p['branch']=='inbox' and p['auth']=='Bearer test-token' and '/repos/trivituso81/adventures-of-tom/contents/reports/r-' in p['path'] for p in new),f'{L} filed picture then note on branch inbox ({[p["path"] for p in new]})')
    if len(new)==2:
        doc=json.loads(base64.b64decode(new[1]['content'])); open(os.path.join(OUT,f'sent-{L}.json'),'w').write(json.dumps(doc,indent=1)); open(os.path.join(OUT,f'sent-{L}.jpg'),'wb').write(base64.b64decode(new[0]['content']))
        check(doc['note'].startswith('Rose is floating here') and doc['kind']=='art' and len(doc['pins'])==2 and abs(doc['pins'][0]['x']-.25)<.03 and doc['shot']==new[0]['path'].split('/contents/')[1] and doc['where']['map']['id']=='town',f'{L} note, kind, pins and place are in the file')
    check(pg.evaluate("async()=>(await brpWaiting()).length")==0,f'{L} nothing left waiting after a good send')
    # dialogue
    pg.evaluate("()=>openDialog('Grace',['This is a test line so we can see the dialogue box on the screen. It is long enough to wrap onto a second row.'])"); pg.wait_for_timeout(2500)
    m=shoot('dialog'); check(m['mode']=='dialog' and m['dialog']['who']=='Grace' and 'test line' in m['dialog']['text'],f'{L} dialogue recorded'); pg.evaluate("()=>brpClose()")
    pg.evaluate("()=>{ advanceDialog(); advanceDialog(); }"); pg.wait_for_timeout(300)
    # menu
    pg.evaluate("()=>openMenu(true)"); pg.wait_for_timeout(900); m=shoot('menu'); check(m['mode']=='menu',f'{L} menu mode'); pg.evaluate("()=>brpClose()"); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{ if(menuOpen) closeMenu(); }")
    # battle, and a report made with no connection
    pg.evaluate("()=>window.__LE.b2Start({party:['tom','grace','rose'],level:10,foes:[['mudling','front']],bag:[],heart:0})")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'",timeout=40000); pg.wait_for_timeout(600)
    m=shoot('battle'); check(m['mode']=='battle' and m['battle']['foes'][0]['id']=='mudling' and m['battle']['actor'],f'{L} battle recorded')
    GH['down']=True; n0=len(PUTS); pg.fill('#brp-note','Mudling health bar looks cut off.'); pg.click('#brp-send'); until(pg,"()=>!brp.open"); pg.wait_for_timeout(6500)
    check(len(PUTS)==n0 and pg.evaluate("async()=>(await brpWaiting()).length")==1,f'{L} with GitHub unreachable the report waits on the device')
    pg.screenshot(path=os.path.join(OUT,f'waiting-{L}.png'))
    GH['down']=False; r=pg.evaluate("()=>brpFlush()"); 
    check(r['sent']==1 and r['left']==0 and len(PUTS)==n0+2,f'{L} the waiting report goes out later ({r})')
    # the tab can be turned off
    pg.evaluate("()=>{ localStorage.setItem('aot-report','0'); brpTab(); }"); check(pg.evaluate("()=>brp.btn.hidden"),f'{L} ADMIN switch hides the tab')
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    check(not real,f'{L} no page errors {real[:4]}')
    br.close()
with sync_playwright() as pw:
    for lay in ('portrait','landscape'): run(pw,lay)
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
