#!/usr/bin/env python3
"""linegap1 test: story scenes open with AUTO ON and each spoken line holds for its own gap (docs/line-gaps.tsv).
Plays chapter 1's ch1Amy with nobody pressing anything. Checks: AUTO is ON in the scene, every page's gap equals its tsv
row, with a (pretend) clip the hold is exactly the gap, the scene reaches its end by itself, turning AUTO off inside the
scene sticks for the next line and is remembered for scenes only, and an ordinary conversation still opens with AUTO OFF.
Usage (repo root): python3 tools/linegap_test.py      (CHROMIUM and PLAYWRIGHT_BROWSERS_PATH as for the other tests)
"""
import threading, http.server, socketserver, functools, os, re, sys, time
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETUP=re.search(r'^SETUP=r"""(.*?)"""',open(os.path.join(ROOT,'tools','reaction_test.py'),encoding='utf8').read(),re.S|re.M).group(1)
SEC={'snap':.15,'normal':.65,'beat':1.25}
want={}
for r in open(os.path.join(ROOT,'docs','line-gaps.tsv'),encoding='utf8').read().split('\n')[1:]:
    if r.strip(): ch,scene,sp,after,text=r.split('\t'); want[sp+'|'+text]=(scene,SEC[after])
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
C={'name':'amy','ch':1,'map':'row','scenes':['ch1Amy'],'party':['tom','grace','rose']}
fails=[]; ok=lambda c,m: (print('ok  ' if c else 'FAIL',m), fails.append(m) if not c else None)
PAGE="()=>dialog.active?{k:dialog.name+'|'+dialog.lines[dialog.index],on:DA.on,gap:daGap(),wait:daWait(),cut:cutsceneOn()}:null"
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    def load():
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(800); pg.evaluate(SETUP,C)
    def play(max_s=120,on_page=None):
        pg.evaluate("()=>playScene('ch1Amy')"); seen=[]; t0=time.time(); last=None
        while time.time()-t0<max_s:
            p=pg.evaluate(PAGE)
            if p and p['k']!=last:
                last=p['k']; p['withClip']=pg.evaluate("()=>{ const d=DV.page; DV.page=dialog.index; const w=daWait(); DV.page=d; return w; }"); seen.append(p)
                if on_page: on_page(len(seen),p)
            if not p and seen and not pg.evaluate("()=>cutsceneOn()"): break
            pg.wait_for_timeout(120)
        return seen
    load(); pg.evaluate("()=>{ localStorage.removeItem('le-scene-auto'); localStorage.removeItem('le-dialog-auto'); }")
    seen=play()
    lines=[k for k,(sc,_) in want.items() if sc=='ch1Amy']
    ok([p['k'] for p in seen]==lines,'ch1Amy played all %d lines to the end with no button press (saw %d)'%(len(lines),len(seen)))
    ok(all(p['on'] and p['cut'] for p in seen),'AUTO was ON on every page of the scene')
    ok(all(abs(p['gap']-want[p['k']][1])<1e-9 for p in seen if p['k'] in want),'every page has the gap of its tsv row: '+' '.join('%.2f'%p['gap'] for p in seen))
    ok(all(abs(p['withClip']-p['gap'])<1e-9 for p in seen),'with a clip the hold is exactly the gap')
    ok(all(p['wait']>=1.4 for p in seen),'with no clip the read time is kept (a snap never shortens reading)')
    # turn AUTO off on the first page: the next line must open with it still off, and only the scene setting is saved
    def off(n,p):
        if n==1: pg.evaluate("()=>setDialogAuto(false,true)")
        else: pg.evaluate("()=>advanceDialog()")
    load(); seen=play(60,on_page=lambda n,p: (off(n,p), pg.wait_for_timeout(700), pg.evaluate("()=>{ if(dialog.active){ advanceDialog(); advanceDialog(); } }")))
    ok(len(seen)>1 and not seen[1]['on'],'turned off in a scene: the next line opens with AUTO OFF')
    st=pg.evaluate("()=>[localStorage.getItem('le-scene-auto'),localStorage.getItem('le-dialog-auto')]")
    ok(st==['off',None],'only the scene setting was saved: %s'%st)
    pg.evaluate("()=>localStorage.removeItem('le-scene-auto')")
    load(); pg.evaluate("()=>openDialog('Sign',['A plain sign.'],null)"); p=pg.evaluate(PAGE)
    ok(p and not p['on'] and not p['cut'],'an ordinary conversation still opens with AUTO OFF')
    ok(not errs,'no page errors %s'%errs[:2])
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
