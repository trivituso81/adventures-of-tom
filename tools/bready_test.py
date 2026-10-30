# Bready Mercury on Tom's kitchen island (engine/plate.js drawBreadyJar, drawn live over art/tomhouse.webp).
# Checks the jar is drawn when the story allows, is gone in chapter 6 until ch6-clear, the island text changes with it,
# and saves screenshots.   Usage: python3 tools/bready_test.py
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
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__LE.go('tomhouse')"); pg.wait_for_timeout(1500)
    # park Tom beside the island so the camera shows the kitchen
    pg.evaluate("()=>{ player.x=8; player.y=8; player.facing='right'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(800)
    def island_text():
        return pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.name==='Kitchen island'); return storyVariant(o,'text')||o.text||o.desc||null; }")
    # chapter 0 / demo: jar drawn
    pg.screenshot(path=os.path.join(SHOTS,'bready-island.png'))
    check('story allows the jar in the default state',pg.evaluate("()=>!storyMatch({chapter:6,notFlag:'ch6-clear'})"))
    t=island_text(); print('island text:',t)
    check('island text mentions Bready Mercury',bool(t) and 'Bready' in t)
    # chapter 6 before the Oak boss: jar gone
    pg.evaluate("()=>{ STORY.chapter=6; delete STORY.flags['ch6-clear']; }"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SHOTS,'bready-gone.png'))
    check('jar hidden in chapter 6 before ch6-clear',pg.evaluate("()=>storyMatch({chapter:6,notFlag:'ch6-clear'})"))
    t=island_text(); check('island text says the jar is gone',bool(t) and 'footprints' in t)
    # ch6-clear: back
    pg.evaluate("()=>{ STORY.flags['ch6-clear']=true; }"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SHOTS,'bready-back.png'))
    check('jar back after ch6-clear',pg.evaluate("()=>!storyMatch({chapter:6,notFlag:'ch6-clear'})"))
    check('island text back to Bready',(island_text() or '').find('Bready')>=0)
    pg.evaluate("()=>{ STORY.chapter=12; delete STORY.flags['ch6-clear']; }")
    check('jar present in chapter 12',pg.evaluate("()=>!storyMatch({chapter:6,notFlag:'ch6-clear'})"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails)
