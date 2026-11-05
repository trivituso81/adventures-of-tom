# Area Builder test (areas.html): open the page, pick town, paint tiles, undo, door note, Check, Export, persistence; shots in portrait and landscape.
# Usage: python3 tools/areas_test.py     (starts its own server; shots in tools/shots/areas-*.png)
import threading, http.server, socketserver, functools, os, sys, json, subprocess
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def ck(name,ok,extra=''):
    print(('ok   ' if ok else 'FAIL ')+name+(' '+str(extra) if extra!='' else ''))
    if not ok: fails.append(name)
os.makedirs(os.path.join(ROOT,'tools/shots'),exist_ok=True)
def click_tile(pg,x,y):
    b=pg.evaluate("(()=>{const r=document.getElementById('cv').getBoundingClientRect();return [r.left,r.top,parseFloat(document.getElementById('cv').style.width),M=__areas.M.w]})()")
    T=(b[2]-26)/b[3]; sx=b[0]+26+(x+.5)*T; sy=b[1]+26+(y+.5)*T
    pg.evaluate("([x,y])=>{const w=document.getElementById('wrap');w.scrollLeft=Math.max(0,x-w.clientWidth/2);w.scrollTop=Math.max(0,y-w.clientHeight/2);}",[26+(x+.5)*T,26+(y+.5)*T])
    r=pg.evaluate("(()=>{const r=document.getElementById('cv').getBoundingClientRect();return [r.left,r.top]})()")
    pg.mouse.click(r[0]+26+(x+.5)*T,r[1]+26+(y+.5)*T)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    ctx=br.new_context(viewport={'width':393,'height':852},device_scale_factor=2,has_touch=False); pg=ctx.new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/areas.html'); pg.wait_for_selector('html[data-ready]',timeout=90000)
    pg.select_option('#mapsel','town'); pg.wait_for_timeout(600)
    n0=pg.evaluate("Object.keys(__areas.ed.tiles).length"); ck('no edits at start',n0==0)
    cnt=pg.evaluate("(()=>{const c={};for(const v of __areas.sys)c[v]=(c[v]||0)+1;return c})()"); print('town classes',cnt)
    ck('town has doors and exits',cnt.get('D',0)>0 and cnt.get('E',0)>0)
    pg.screenshot(path='tools/shots/areas-portrait-start.png')
    # find a blocked tile and a walkable tile to paint
    bt=pg.evaluate("(()=>{const M=__areas.M,s=__areas.sys;for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(s[y*M.w+x]==='B'&&!M.objectAt.has(x+','+y))return [x,y]})()")
    pg.click('button[data-t=W]'); click_tile(pg,*bt)
    ck('paint Walk on a blocked tile',pg.evaluate("__areas.ed.tiles[%d+','+%d]==='W'"%tuple(bt)))
    pg.click('#undo'); ck('undo removes it',pg.evaluate("Object.keys(__areas.ed.tiles).length")==0)
    # drag three tiles to Block along row of walkable tiles
    wt=pg.evaluate("(()=>{const M=__areas.M,s=__areas.sys;for(let y=2;y<M.h;y++)for(let x=2;x<M.w-4;x++)if([0,1,2].every(i=>s[y*M.w+x+i]==='W'))return [x,y]})()")
    pg.click('button[data-t=B]')
    for i in range(3): click_tile(pg,wt[0]+i,wt[1])
    ck('three tiles painted Block',pg.evaluate("Object.values(__areas.ed.tiles).filter(v=>v==='B').length")==3)
    # persistence
    pg.reload(); pg.wait_for_selector('html[data-ready]',timeout=90000); pg.wait_for_timeout(500)
    ck('edits persist after reload',pg.evaluate("Object.keys(__areas.ed.tiles).length")==3)
    # door note flow
    pg.click('button[data-t=D]'); click_tile(pg,*bt)
    ck('note bar opens for a new door',pg.evaluate("getComputedStyle(document.getElementById('notebar')).display")!='none')
    pg.fill('#noteTxt',"to Aunt Ellie's house"); pg.click('#noteOk')
    ck('note stored',pg.evaluate("Object.values(__areas.ed.notes).includes(\"to Aunt Ellie's house\")"))
    # check: unedited-system map must pass; wall off the spawn
    pg.click('#clear'); pg.click('#check'); sysbad=pg.evaluate("document.getElementById('status').textContent"); print(sysbad)
    pg.screenshot(path='tools/shots/areas-portrait-check.png')
    pg.evaluate("(()=>{const M=__areas.M;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])__areas.ed.tiles[(M.spawn.x+dx)+','+(M.spawn.y+dy)]='B';})()")
    pg.evaluate("document.getElementById('check').click()"); st=pg.evaluate("document.getElementById('status').textContent")
    ck('check reports cut-off tiles after walling the spawn',('cannot be reached' in st),st[:70])
    pg.click('#clear')
    pg.evaluate("document.getElementById('c-obj').checked=true;document.getElementById('c-beh').checked=true;document.getElementById('c-npc').checked=true;document.getElementById('c-obj').dispatchEvent(new Event('change'))")
    pg.click('button[data-t=B]'); click_tile(pg,*wt); pg.click('#export'); j=json.loads(pg.input_value('#exportTxt'))
    ck('export JSON shape',j['map']=='town' and j['w']==30 and j['h']==26 and len(j['system_hash'])==16 and len(j['tiles'])==1,list(j['tiles'].items())[:1])
    open(os.path.join(ROOT,'tools/shots/areas-export.json'),'w').write(json.dumps(j))
    pg.screenshot(path='tools/shots/areas-portrait-edit.png'); pg.click('#exportClose')
    # room without a painting and an interior
    pg.select_option('#mapsel','tomhouse'); pg.wait_for_timeout(400); ck('interior loads',pg.evaluate("__areas.M.id")=='tomhouse')
    pg.select_option('#mapsel','row'); pg.wait_for_timeout(500); pg.click('#check'); print(pg.evaluate("document.getElementById('status').textContent"))
    # zoom and pan: buttons, Fit, Ctrl+wheel, Hand tool drag, then a real two-finger pinch on a touch page
    pg.select_option('#mapsel','town'); pg.wait_for_timeout(500); pg.click('#clear')
    pg.click('#zfit'); z_fit=pg.evaluate("__areas.zoom")
    ck('Fit shows the whole map',pg.evaluate("(()=>{const w=document.getElementById('wrap'),c=document.getElementById('cv');return c.offsetWidth<=w.clientWidth+1&&c.offsetHeight<=w.clientHeight+1})()"),round(z_fit,3))
    for _ in range(4): pg.click('#zin')
    z_in=pg.evaluate("__areas.zoom"); ck('zoom + buttons grow the map',z_in>z_fit*2,round(z_in,3))
    ck('zoom label matches',pg.inner_text('#zlab')==str(round(z_in*100))+'%',pg.inner_text('#zlab'))
    pg.click('#zout'); ck('zoom - shrinks',pg.evaluate("__areas.zoom")<z_in)
    # the tile under the middle of the view must stay put when zooming
    mid=lambda: pg.evaluate("(()=>{const w=document.getElementById('wrap'),r=w.getBoundingClientRect(),T=__areas.zoom*32;return [(w.scrollLeft+w.clientWidth/2-26)/T,(w.scrollTop+w.clientHeight/2-26)/T]})()")
    pg.evaluate("(()=>{const w=document.getElementById('wrap');w.scrollLeft=300;w.scrollTop=300;})()"); m0=mid(); pg.click('#zin'); m1=mid()
    ck('zoom keeps the middle of the view fixed',abs(m0[0]-m1[0])<.6 and abs(m0[1]-m1[1])<.6,(m0,m1))
    pg.evaluate("__areas.zoomAt(1)"); pg.mouse.move(200,400); pg.keyboard.down('Control'); pg.mouse.wheel(0,-300); pg.keyboard.up('Control'); pg.wait_for_timeout(150)
    ck('Ctrl+wheel zooms in',pg.evaluate("__areas.zoom")>1.2,pg.evaluate("__areas.zoom"))
    pg.evaluate("__areas.zoomAt(4)"); ck('zoom is capped by canvas size',pg.evaluate("__areas.zoom")<=4.001 and pg.evaluate("document.getElementById('cv').width*document.getElementById('cv').height")<=16.1e6,pg.evaluate("[__areas.zoom,document.getElementById('cv').width*document.getElementById('cv').height]"))
    pg.evaluate("__areas.zoomAt(1)"); pg.click('button[data-t=H]')
    pg.evaluate("(()=>{const w=document.getElementById('wrap');w.scrollLeft=200;w.scrollTop=200;})()"); s0=pg.evaluate("[document.getElementById('wrap').scrollLeft,document.getElementById('wrap').scrollTop]")
    pg.mouse.move(250,500); pg.mouse.down(); pg.mouse.move(190,440,steps=4); pg.mouse.up(); s1=pg.evaluate("[document.getElementById('wrap').scrollLeft,document.getElementById('wrap').scrollTop]")
    ck('Hand tool drag pans',abs((s1[0]-s0[0])-60)<3 and abs((s1[1]-s0[1])-60)<3,(s0,s1)); ck('Hand tool paints nothing',pg.evaluate("Object.keys(__areas.ed.tiles).length")==0)
    pg.click('button[data-t=W]')
    pg.screenshot(path='tools/shots/areas-zoom-portrait.png')
    tctx=br.new_context(viewport={'width':393,'height':852},device_scale_factor=2,has_touch=True); tp=tctx.new_page(); terrs=[]; tp.on('pageerror',lambda e:terrs.append(str(e)))
    tp.goto(f'http://127.0.0.1:{port}/areas.html'); tp.wait_for_selector('html[data-ready]',timeout=90000); tp.select_option('#mapsel','town'); tp.wait_for_timeout(500)
    tp.evaluate("__areas.zoomAt(1)"); cdp=tctx.new_cdp_session(tp)
    zb=tp.evaluate("__areas.zoom"); sb=tp.evaluate("[document.getElementById('wrap').scrollLeft,document.getElementById('wrap').scrollTop]")
    def touch(t,pts): cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
    touch('touchStart',[(150,400),(250,400)])
    for k in range(1,9): touch('touchMove',[(150-k*8,400),(250+k*8,400)])
    touch('touchEnd',[]); tp.wait_for_timeout(200)
    za=tp.evaluate("__areas.zoom"); ck('two-finger pinch out zooms in',za>zb*1.5,(round(zb,2),round(za,2)))
    ck('pinch paints nothing',tp.evaluate("Object.keys(__areas.ed.tiles).length")==0)
    zb=za; touch('touchStart',[(80,400),(300,400)])
    for k in range(1,9): touch('touchMove',[(80+k*10,400),(300-k*10,400)])
    touch('touchEnd',[]); tp.wait_for_timeout(200)
    ck('two-finger pinch in zooms out',tp.evaluate("__areas.zoom")<zb*.7,(round(zb,2),round(tp.evaluate("__areas.zoom"),2)))
    sb=tp.evaluate("[document.getElementById('wrap').scrollLeft,document.getElementById('wrap').scrollTop]")
    touch('touchStart',[(150,400),(250,400)])
    for k in range(1,7): touch('touchMove',[(150,400-k*12),(250,400-k*12)])
    touch('touchEnd',[]); tp.wait_for_timeout(200)
    sa=tp.evaluate("[document.getElementById('wrap').scrollLeft,document.getElementById('wrap').scrollTop]")
    ck('two-finger drag pans',abs(sa[1]-sb[1])>30 or abs(sa[0]-sb[0])>30,(sb,sa))
    # one finger still paints (Walk tool) after all that
    wt2=tp.evaluate("(()=>{const M=__areas.M,s=__areas.sys;for(let y=2;y<M.h;y++)for(let x=2;x<M.w-4;x++)if(s[y*M.w+x]==='B'&&!M.objectAt.has(x+','+y))return [x,y]})()")
    tp.evaluate("__areas.zoomAt(2)"); tp.evaluate("(([x,y])=>{const w=document.getElementById('wrap'),T=__areas.zoom*32;w.scrollLeft=Math.max(0,26+(x+.5)*T-w.clientWidth/2);w.scrollTop=Math.max(0,26+(y+.5)*T-w.clientHeight/2);})",wt2)
    pos=tp.evaluate("(([x,y])=>{const r=document.getElementById('cv').getBoundingClientRect(),T=__areas.zoom*32;return [r.left+26+(x+.5)*T,r.top+26+(y+.5)*T]})",wt2)
    touch('touchStart',[(pos[0],pos[1])]); touch('touchEnd',[]); tp.wait_for_timeout(150)
    ck('one-finger tap still paints after zooming',tp.evaluate("__areas.ed.tiles[%d+','+%d]==='W'"%tuple(wt2)),wt2)
    tp.screenshot(path='tools/shots/areas-zoom-touch.png'); ck('no page errors on touch page',not terrs,terrs); tctx.close()
    # landscape
    pg.set_viewport_size({'width':852,'height':393}); pg.wait_for_timeout(500); pg.screenshot(path='tools/shots/areas-landscape.png'); pg.click('#export'); pg.screenshot(path='tools/shots/areas-landscape-export.png'); pg.click('#exportClose')
    ck('no page errors',not errs,errs)
    br.close()
# install tool dry run on the export (one tile changed)
r=subprocess.run([sys.executable,os.path.join(HERE,'apply_walkmap.py'),os.path.join(ROOT,'tools/shots/areas-export.json'),'--dry-run'],capture_output=True,text=True,cwd=ROOT)
print(r.stdout.strip()[-400:],r.stderr.strip()[-300:])
ck('apply_walkmap dry run reports the tile',r.returncode==0 and ('1 tile(s) changed' in r.stdout or '1 skipped' in r.stdout))
print('AREAS FAILS:',len(fails)); sys.exit(1 if fails else 0)
