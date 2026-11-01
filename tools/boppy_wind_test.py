# Boppy drifts behind gradually and the party halts when he is too far back (data/scenes.js BOPPY_WIND).
# Usage: python3 tools/boppy_wind_test.py   (screenshots to tools/shots/boppy-wind-*.png)
import threading, http.server, socketserver, functools, os, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]
JS_WALK="""()=>new Promise(res=>{
  const S=[],ev={halts:0,wasHalt:false,flips:0}; let dir='right',t0=performance.now(),prev=null,maxJump=0,maxGap=0,lastFlip=-9999,J=[];
  const f=followers[followers.length-1];
  function tick(){
    const now=performance.now();
    if(partyHalted()&&!ev.wasHalt){ev.halts++; window.__haltAt=now;}
    ev.wasHalt=partyHalted();
    if(!player.move){ if(!movePlayer(dir)&&!partyHalted()){ dir=({right:'left',left:'right',up:'down',down:'up'})[dir]; ev.flips++; lastFlip=now; if(!movePlayer(dir)) dir=({left:'up',right:'down',up:'left',down:'right'})[dir]; } }
    const p=position(f),q=position(player),gap=Math.hypot(p.x-q.x,p.y-q.y);
    if(prev&&now-lastFlip>700){ const j=Math.hypot(p.x-prev.x,p.y-prev.y); maxJump=Math.max(maxJump,j); if(j>.12) J.push({t:Math.round(now-t0),j:+j.toFixed(2),lag:+BOPPY_WIND.lag.toFixed(2),halt:partyHalted()}); } prev=p; maxGap=Math.max(maxGap,gap);
    S.push({t:Math.round(now-t0),lag:+BOPPY_WIND.lag.toFixed(2),halt:partyHalted(),gap:+gap.toFixed(2)});
    if(now-t0<22000) requestAnimationFrame(tick); else res({halts:ev.halts,maxJump:+maxJump.toFixed(3),maxGap:+maxGap.toFixed(2),flips:ev.flips,haltFrames:S.filter(s=>s.halt).length,frames:S.length,maxLag:Math.max(...S.map(s=>s.lag)),bigJumps:J.slice(0,8),sample:S.filter((s,i)=>i%90===0)});
  }
  requestAnimationFrame(tick);
})"""
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    for i in range(60):
        if not pg.evaluate("()=>window.__LE.intro.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(150)
    pg.evaluate("()=>{ window.__LE.go('town'); }"); pg.wait_for_timeout(800)
    pg.evaluate("()=>{ endIntro(); }"); pg.wait_for_timeout(300)
    print('map',pg.evaluate("()=>currentMap.id+' outside='+currentMap.outside+' region='+regionOf(currentMap)"))
    pg.evaluate("()=>{ for(const m of extras()) recruitLeave(m,true); recruitJoin(boppy,{name:'Boppy'},true,currentMap); placeFollowers(); }"); pg.wait_for_timeout(500)
    print('last follower',pg.evaluate("()=>followers.map(f=>f.member.name).join(',')"),'wind active',pg.evaluate("()=>!!boppyWindFollower()"))
    print('dbg',pg.evaluate("()=>JSON.stringify({mode:STORY.mode,ch:STORY.chapter,inP:inParty(boppy),out:currentMap.outside,reg:regionOf(currentMap),intro:intro.active,bat:battle.active,pm:!!player.move,px:player.x,py:player.y,mv:movePlayer('right'),px2:player.x})"))
    for i in range(20):
        if not pg.evaluate("()=>!!(typeof dialog!=='undefined'&&dialog&&dialog.active)"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    pg.evaluate("()=>{ player.move=null; placeFollowers(); }"); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(SHOTS,'boppy-wind-start.png'))
    print('state',pg.evaluate("()=>JSON.stringify({dlg:typeof dialog!=='undefined'&&dialog&&dialog.active,menu:typeof menuOpen!=='undefined'?menuOpen:null,pm:player.move,dur:player.duration,t:performance.now()|0})"))
    pg.wait_for_timeout(600)
    print('state2',pg.evaluate("()=>JSON.stringify({pm:player.move,x:player.x,y:player.y})"))
    r=pg.evaluate(JS_WALK)
    print(json.dumps({k:v for k,v in r.items() if k!='sample'}))
    print('sample (t ms, lag, halt, gap tiles):',[(s['t'],s['lag'],s['halt'],s['gap']) for s in r['sample']])
    # Phase 2: walk until the party is forced to stop, screenshot it, then screenshot the release.
    pg.evaluate("()=>{ player.move=null; placeFollowers(); window.__w={dir:'right',on:true}; (function tick(){ if(!window.__w.on) return; if(!player.move&&!partyHalted()){ if(!movePlayer(window.__w.dir)) window.__w.dir=({right:'left',left:'right',up:'down',down:'up'})[window.__w.dir]; } requestAnimationFrame(tick); })(); }")
    for i in range(400):
        if pg.evaluate("()=>partyHalted()"): break
        pg.wait_for_timeout(50)
    pg.wait_for_timeout(250); pg.screenshot(path=os.path.join(SHOTS,'boppy-wind-halt.png'))
    print('halted: lag',pg.evaluate("()=>BOPPY_WIND.lag"),'tom moved after halt?',pg.evaluate("()=>{const x=player.x,y=player.y; movePlayer('left'); movePlayer('right'); return player.x!==x||player.y!==y||!!player.move}"))
    for i in range(100):
        if not pg.evaluate("()=>partyHalted()"): break
        pg.wait_for_timeout(50)
    print('released after ~',(i+1)*50+250,'ms, lag',pg.evaluate("()=>BOPPY_WIND.lag"))
    pg.screenshot(path=os.path.join(SHOTS,'boppy-wind-release.png'))
    pg.evaluate("()=>{ window.__w.on=false; }")
    print('errors',errs[-5:])
    json.dump(r,open(os.path.join(SHOTS,'boppy-wind.json'),'w'))
