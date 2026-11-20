# Welcome page buttons and the chapter list's top bar (idea-welcomepage, 2026-11-20).
# Checks, in portrait and landscape and on a narrow phone: NEW GAME and LOAD fit their text and are equally wide; RELOAD and ADMIN
# are icon-only; the chapter list has BACK (left) and the EASY / MEDIUM / HARD toggles (every line fits) above the chapters;
# a toggle saves the difficulty; a chapter starts without the difficulty page; keys move between the top bar and the chapters.
# Usage (repo root): python3 tools/welcome_buttons_test.py [OUT]   (screenshots in OUT, default /tmp/wb). Exit 1 on a failure.
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/wb'; os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def need(ok,msg):
    print(('ok   ' if ok else 'FAIL ')+msg)
    if not ok: fails.append(msg)
RECTS="""()=>{const rot=document.documentElement.classList.contains('rotated'),W=window.innerWidth;
 // landscape is the portrait page turned 90 degrees: measure in the stage's own (unturned) coordinates
 const r=e=>{const b=e.getBoundingClientRect();return rot?{x:b.y,y:W-b.right,w:b.height,h:b.width,r:b.bottom}:{x:b.x,y:b.y,w:b.width,h:b.height,r:b.right}};
 const q=s=>[...document.querySelectorAll(s)];
 const panel=r(document.getElementById('splash-panel'));
 return {panel,mode:splash.mode,
  main:q('#splash .sp-main .sp-choice').map(e=>({t:e.innerText.trim(),...r(e)})),
  tools:q('#splash .sp-tools .sp-choice').map(e=>({t:e.innerText.trim(),label:e.getAttribute('aria-label'),...r(e)})),
  head:q('#splash .sp-head .sp-choice').map(e=>({t:e.innerText.trim(),on:e.classList.contains('on'),...r(e),subFit:[...e.querySelectorAll('.sp-sub,.sp-name')].every(s=>s.scrollWidth<=s.clientWidth+1)})),
  list:r(document.querySelector('#splash .sp-choices')),
  first:q('#splash .sp-choices .sp-choice').slice(0,2).map(e=>({t:e.innerText.trim().split('\\n')[0],...r(e)}))}}"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for layout,vw,vh in (('portrait',430,860),('portrait-narrow',360,740),('portrait-tiny',320,640),('landscape',430,860)):
        ctx=br.new_context(viewport={'width':vw,'height':vh},has_touch=True,timezone_id='America/Los_Angeles')
        pg=ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        if layout=='landscape': pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
        L=layout+': '
        d=pg.evaluate(RECTS)
        pg.screenshot(path=f'{OUT}/{layout}-1-welcome.png')
        m=d['main']; t=d['tools']
        need(len(m)==2 and [x['t'] for x in m]==['NEW GAME','LOAD'], L+'two main buttons NEW GAME and LOAD (%s)'%[x['t'] for x in m])
        need(abs(m[0]['w']-m[1]['w'])<1.5, L+'NEW GAME and LOAD are equally wide (%d, %d)'%(m[0]['w'],m[1]['w']))
        need(m[0]['w']<d['panel']['w']*.36, L+'the main buttons fit their text, far less than half the panel (%d of %d)'%(m[0]['w'],d['panel']['w']))
        need(len(t)==2 and all(x['t']=='' for x in t) and [x['label'] for x in t]==['Reload','Admin'], L+'RELOAD and ADMIN are icon only with labels (%s)'%[(x['t'],x['label']) for x in t])
        need(all(x['w']>=33 and x['h']>=33 for x in t), L+'icon buttons are tap sized (%s)'%[(round(x['w']),round(x['h'])) for x in t])
        need(t[1]['r']<=d['panel']['r']-6 and m[1]['r']<t[0]['x'], L+'the icons sit at the right, no overlap')
        # selection moves between buttons without the buttons changing size
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(150)
        d2=pg.evaluate(RECTS)
        need(abs(d2['main'][0]['w']-m[0]['w'])<1 and abs(d2['main'][1]['w']-m[1]['w'])<1, L+'selecting another button does not resize them')
        pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(100)
        # chapter list
        pg.tap('#splash .sp-main .sp-choice >> nth=0'); pg.wait_for_timeout(500)
        d=pg.evaluate(RECTS)
        pg.screenshot(path=f'{OUT}/{layout}-2-chapters.png')
        h=d['head']
        need(d['mode']=='new' and [x['t'].replace('\n',' ') for x in h][0]=='BACK', L+'chapter list opens with BACK first in the top bar (%s)'%[x['t'] for x in h])
        need(len(h)==4 and [x['t'].split('\n')[0] for x in h[1:]]==['EASY','MEDIUM','HARD'], L+'then EASY, MEDIUM, HARD (%s)'%[x['t'] for x in h])
        need(all(h[i]['x']<h[i+1]['x'] for i in range(3)) and abs(h[0]['y']-h[1]['y'])<2, L+'one row, BACK on the left')
        need(all(x['subFit'] for x in h) and h[-1]['r']<=d['panel']['r'], L+'every toggle line fits inside the frame (%s)'%[x['subFit'] for x in h])
        need(h[0]['y']+h[0]['h']<=d['first'][0]['y'], L+'the top bar is above the first chapter')
        need(sum(1 for x in h if x['on'])==1, L+'exactly one toggle is lit (%s)'%[x['on'] for x in h])
        # toggle HARD, the difficulty is saved and the list stays
        pg.tap('#splash .sp-head .sp-choice.tog >> nth=2'); pg.wait_for_timeout(250)
        st=pg.evaluate("()=>({mode:splash.mode,diff:B7.diff,on:[...document.querySelectorAll('#splash .sp-head .sp-choice.tog')].map(e=>e.classList.contains('on'))})")
        need(st['mode']=='new' and st['diff']=='director' and st['on']==[False,False,True], L+'tapping HARD saves it and stays on the list (%s)'%st)
        pg.tap('#splash .sp-head .sp-choice.tog >> nth=0'); pg.wait_for_timeout(200)
        need(pg.evaluate("()=>B7.diff")=='rose', L+'tapping EASY sets it')
        pg.tap('#splash .sp-head .sp-choice.tog >> nth=1'); pg.wait_for_timeout(200)
        need(pg.evaluate("()=>B7.diff")=='grace', L+'tapping MEDIUM sets it')
        pg.screenshot(path=f'{OUT}/{layout}-3-medium.png')
        # keys: from the top bar down to the first chapter, then up again
        pg.evaluate("()=>{splash.sel=1;splashMark();}")
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==2, L+'right steps along the top bar')
        pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==4, L+'down from the top bar lands on chapter 1')
        pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==2, L+'up from the second column climbs to the lit difficulty (MEDIUM)')
        pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==6, L+'down in the chapters moves a row (chapter 3)')
        pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==4, L+'up moves back to chapter 1')
        pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(100)
        need(pg.evaluate("()=>splash.sel")==0, L+'up from the first column climbs to BACK')
        # BACK returns to the welcome buttons with NEW GAME selected
        pg.tap('#splash .sp-head .sp-choice.back'); pg.wait_for_timeout(300)
        st=pg.evaluate("()=>({mode:splash.mode,sel:splash.sel,head:document.querySelector('#splash .sp-head').hidden})")
        need(st['mode']=='launch' and st['sel']==0 and st['head'], L+'BACK returns to the welcome buttons (%s)'%st)
        pg.screenshot(path=f'{OUT}/{layout}-4-back.png')
        # a chapter starts with no difficulty page and no Start New warning, even when an autosave exists (idea-welcomepage2)
        pg.evaluate("()=>saveGame('auto',true)")
        pg.tap('#splash .sp-main .sp-choice >> nth=0'); pg.wait_for_timeout(500)
        pg.tap('#splash .sp-choices .sp-choice >> nth=1'); pg.wait_for_timeout(800)
        st=pg.evaluate("()=>({mode:splash.mode,active:splash.active,tab:document.querySelector('#splash .sp-tab').textContent,diff:B7.diff,auto:!!readSave('auto')})")
        need(st['mode'] not in ('diff','ask') and st['tab'] not in ('Choose your difficulty','Start New') and st['diff']=='grace' and not st['active'], L+'chapter 2 goes straight on with an autosave present: no difficulty page, no warning (%s)'%st)
        pg.screenshot(path=f'{OUT}/{layout}-5-after-chapter.png')
        need(not errs, L+'no script errors %s'%errs[:2])
        ctx.close()
    # every kind of start, with an autosave present: chapter 1, chapter 2, chapter 11 (Part 2) and BONUS start at once
    for label,idx in (('chapter 1',0),('chapter 2',1),('chapter 11',10),('BONUS',20)):
        ctx=br.new_context(viewport={'width':430,'height':860},has_touch=True,timezone_id='America/Los_Angeles')
        pg=ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
        pg.evaluate("()=>saveGame('auto',true)")
        pg.tap('#splash .sp-main .sp-choice >> nth=0'); pg.wait_for_timeout(500)
        name=pg.evaluate(f"()=>splash.list[4+{idx}].name")
        pg.tap(f'#splash .sp-choices .sp-choice >> nth={idx}'); pg.wait_for_timeout(1500)
        st=pg.evaluate("()=>({mode:splash.mode,active:splash.active,tab:document.querySelector('#splash .sp-tab').textContent})")
        need(not st['active'] and st['mode'] not in ('ask','diff'), f'{label} ({name}) starts at once with an autosave present, no warning page ({st})')
        need(not errs, f'{label}: no script errors {errs[:2]}')
        ctx.close()
    br.close()
srv.shutdown()
print('FAILED %d'%len(fails) if fails else 'all passed'); sys.exit(1 if fails else 0)
