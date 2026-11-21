#!/usr/bin/env python3
"""madelot: eight chapter 1 subtitles were reworded to what their baked clips say. Checks in portrait and landscape that every new line
finds its baked clip (dvClip), that no old wording still does, and that the scene shows the new words in the dialogue box
(screenshots in tools/shots/madelot-*.png). python3 tools/madelot_test.py"""
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')); OUT=os.path.join(ROOT,'tools','shots'); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SPEC=json.load(open(os.path.join(ROOT,'tools/voice-library/retext-madelot.json'),encoding='utf8'))
NAME={'tom':'Tom','deedee':'Deedee','grace':'Grace','bigone':'The Big One'}
SCENE={'tom':'ch1Job','deedee':'ch1End','grace':None,'bigone':None}
fails=[]
def check(c,msg):
    print(('ok   ' if c else 'FAIL ')+msg)
    if not c: fails.append(msg)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
        pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro(); }")
        pg.wait_for_function("()=>Object.keys(DIALOG_CLIPS.clips).some(k=>k.startsWith('tom|Oof'))||Object.keys(DIALOG_CLIPS.clips).length>0",timeout=120000)
        pg.evaluate("()=>{ if(typeof dvLoadAll==='function') dvLoadAll(); }")
        pg.wait_for_timeout(4000)
        for e in SPEC:
            nm=NAME.get(e['voice'],e['voice'].title())
            got=pg.evaluate("([n,t])=>{ const c=dvClip(n,t); return !!c&&typeof c==='string'&&c.length>1000; }",[nm,e['new']])
            old=pg.evaluate("([n,t])=>!!dvClip(n,t)",[nm,e['old']])
            check(got,f"{lay}: {e['voice']} new line has its baked clip: {e['new'][:48]}")
            check(not old,f"{lay}: {e['voice']} old wording has no clip left: {e['old'][:48]}")
        if not os.environ.get('NOSCENE'):
            for e in SPEC:
                if e['voice']=='tom':
                    r=pg.evaluate("""(t)=>{ try{ resetStory('full',1); setChapter(1,{apply:false}); playScene('ch1Job'); }catch(x){ return 'ERR '+x; } return 'started'; }""",e['new'])
                    check(r=='started',f'{lay}: ch1Job starts ({r})')
                    seen=[]
                    for _ in range(80):
                        pg.wait_for_timeout(500)
                        t=pg.evaluate("()=>dialog&&dialog.active?[dialog.name,document.getElementById('dialog-text')?document.getElementById('dialog-text').textContent:'']:null")
                        if t and t not in seen: seen.append(t)
                        if t and e['new'][:20] in (t[1] or ''): pg.screenshot(path=f'{OUT}/madelot-{lay}.png'); break
                        pg.evaluate("()=>{ if(dialog.active) pressAction(); }")
                    check(any(e['new'][:20] in (s[1] or '') for s in seen),f'{lay}: the dialogue box shows "{e["new"][:30]}" ({seen[-2:]})')
        check(not errs,f'{lay}: no page errors {errs[:2]}')
        pg.close()
    br.close()
print('FAILS:',fails); sys.exit(1 if fails else 0)
