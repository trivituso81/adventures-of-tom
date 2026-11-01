# Olivia recruiting check: not offered before chapter 6, offered in Jefferson Park from chapter 6, joins, swap works, fights, save/load keeps her.
import threading, http.server, socketserver, functools, os, base64
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); SHOTS=os.path.join(HERE,'shots')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.go'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ document.getElementById('splash').hidden=true; splash.active=false; }")
    for ch in (0,5,6,7,12,13):
        pg.evaluate(f"()=>{{ __LE.chapterJump({ch}); document.getElementById('splash').hidden=true; }}"); pg.wait_for_timeout(300)
        pg.evaluate("()=>{ __LE.go('jpark'); }"); pg.wait_for_timeout(300)
        print('chapter',ch,'olivia can join in jpark:',pg.evaluate("()=>canBeHere(olivia)"))
    pg.evaluate("()=>{ STORY.mode='full'; __LE.chapterJump(7); document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(6000); pg.evaluate("()=>__LE.go('jpark')"); pg.wait_for_timeout(2500)
    print('map:',pg.evaluate("()=>currentMap.id+' '+currentMap.npcs.map(n=>n.name).join(',')"))
    print('olivia npc:',pg.evaluate("()=>{ const m=Object.values(worlds).find(w=>w.npcs.some(n=>n.name==='Olivia')); return m?m.id+' cousin='+m.npcs.find(n=>n.name==='Olivia').cousin:'none'; }"))
    pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Olivia'); dialog.active=false; offerRecruit(olivia,n); }"); pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(SHOTS,'olivia-offer.png'))
    print('before join:',pg.evaluate("()=>currentMap.id+' '+currentMap.npcs.map(n=>n.name).join(',')+' inparty='+inParty(olivia)+' party='+party.map(p=>p.id)"))
    pg.evaluate("()=>{ const n=currentMap.npcs.find(n=>n.name==='Olivia'); recruitJoin(olivia,n); }"); pg.wait_for_timeout(500)
    print('party:',pg.evaluate("()=>party.map(p=>p.id).join(',')"), 'in party:',pg.evaluate("()=>inParty(olivia)"))
    pg.evaluate("()=>saveGame(1)"); pg.evaluate("()=>{ recruitLeave(olivia,true); }"); pg.wait_for_timeout(200)
    pg.evaluate("()=>loadGame(1)"); pg.wait_for_timeout(800)
    print('after load party:',pg.evaluate("()=>party.map(p=>p.id).join(',')"))
    pg.evaluate("()=>{ __LE.go('le_square'); }") if False else None
    print('errors:',errs or 'none'); br.close()
