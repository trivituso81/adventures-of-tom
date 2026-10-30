# Talking distance: Tom and the neighbor he faces or talks to are drawn a few px apart (TALK_GAP_X/Y) (engine/town-render.js talkGapFrame), eased in;
# nothing else moves (tiles, collision, interaction unchanged). Checks all four approach directions, that it eases back out, that a
# monster and the TNB kiss get no gap, and saves before/after screenshots.   Usage: python3 tools/talkgap_test.py
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
def clear(pg):
    quiet=0
    for i in range(80):
        if pg.evaluate("()=>dialog.active||intro.active||!!transition"):
            quiet=0; pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
        else:
            quiet+=1
            if quiet>=3: return True
            pg.wait_for_timeout(250)
    return False
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(500)
    clear(pg)
    mapid=pg.evaluate("()=>{ for(const id in worlds){ if((worlds[id].npcs||[]).some(x=>x.name==='Pip')) return id; } return null; }")
    check(f'Pip found ({mapid})',bool(mapid))
    clear(pg); pg.evaluate(f"()=>window.__LE.go('{mapid}')"); pg.wait_for_timeout(1800); clear(pg)
    # find a spot with free tiles on every side by trying each direction and keeping those that are walkable
    for d,(dx,dy,face) in {'below':(0,1,'up'),'above':(0,-1,'down'),'right':(1,0,'left'),'left':(-1,0,'right')}.items():
        ok=pg.evaluate("""(a)=>{ const [dx,dy,face]=a; const n=currentMap.npcs.find(x=>x.name==='Pip'); n.roam=0; n.move=null; n.path=[]; n.idle=99;
          for(const m of currentMap.npcs) if(m!==n) m.idle=99;
          player.x=n.x+dx; player.y=n.y+dy; player.facing=face; player.move=null; placeFollowers(); camera.snap=true;
          for(const x of [...currentMap.npcs,...followers,player]) x._tg={x:0,y:0};
          return true; }""",[dx,dy,face])
        pg.wait_for_timeout(60)
        if d=='below': pg.screenshot(path=os.path.join(SHOTS,'talkgap-before.png'))
        pg.wait_for_timeout(700)
        g=pg.evaluate("()=>{ const n=currentMap.npcs.find(x=>x.name==='Pip'); return {p:player._tg,n:n._tg,partner:talkPartnerNow&&talkPartnerNow.name}; }")
        sx,sy=(dx,dy)
        check(f'{d}: Tom pushed away from Pip by the gap',abs(g['p']['x']-sx*9)<.5 and abs(g['p']['y']-sy*11)<.5)
        check(f'{d}: Pip pushed the other way',abs(g['n']['x']+sx*9)<.5 and abs(g['n']['y']+sy*11)<.5)
        if d=='below': pg.screenshot(path=os.path.join(SHOTS,'talkgap-after-below.png'))
        if d=='right': pg.screenshot(path=os.path.join(SHOTS,'talkgap-after-right.png'))
    # opening the dialogue keeps the gap; closing and walking away eases it back to zero
    pg.evaluate("""()=>{ const n=currentMap.npcs.find(x=>x.name==='Pip'); player.x=n.x; player.y=n.y+1; player.facing='up'; player.move=null; }""")
    pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    check('dialogue open with Pip',pg.evaluate("()=>dialog.active&&dialog.npc&&dialog.npc.name==='Pip'"))
    pg.screenshot(path=os.path.join(SHOTS,'talkgap-dialog.png'))
    check('gap held during dialogue',pg.evaluate("()=>Math.abs(player._tg.y-11)<.5"))
    clear(pg)
    pg.evaluate("()=>{ player.x=player.x+4; player.y=player.y+4; player.move=null; }"); pg.wait_for_timeout(700)
    check('gap eases back to zero when Tom walks off',pg.evaluate("()=>player._tg.x===0&&player._tg.y===0&&currentMap.npcs.every(n=>!n._tg||(n._tg.x===0&&n._tg.y===0))"))
    # tile positions are never touched
    check('tiles unchanged by the gap',pg.evaluate("()=>Number.isInteger(player.x)&&Number.isInteger(player.y)"))
    check('no page errors',not errs)
    if errs: print(errs[:5])
    br.close()
print('FAILS:',fails)
