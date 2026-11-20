# Read-only diagnostic: plays chapter 1 scenes on the current main the way a player would (no SKIP, no FAST),
# pressing Enter only when a line has finished typing, and logs the engine state every 100 ms.
# Usage: python3 -I /tmp/diag/run_nat.py <repo root> <out dir> <mode: open|theft>
import threading, http.server, socketserver, functools, os, json, sys, time
from playwright.sync_api import sync_playwright
ROOT=sys.argv[1]; OUT=sys.argv[2]; MODE=sys.argv[3] if len(sys.argv)>3 else 'open'
os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SNAP=r"""()=>{ const P=a=>{ const p=position(a); return [Math.round(p.x*100)/100,Math.round(p.y*100)/100]; };
  const g=followers.find(f=>f.member===grace), r=followers.find(f=>f.member===rose);
  const vis=id=>{ const e=document.getElementById(id); if(!e) return null; const cs=getComputedStyle(e); return !(e.hidden||cs.display==='none'||cs.visibility==='hidden'); };
  const dirVis=(()=>{ const e=document.querySelector('#dpad .dir'); if(!e) return null; const cs=getComputedStyle(e); return cs.visibility!=='hidden'&&cs.display!=='none'; })();
  const pose=a=>a&&a.scenePose?(Array.isArray(a.scenePose.f)?a.scenePose.f.join('/'):String(a.scenePose.f||a.scenePose.foe)):null;
  const ready=id=>{ const S=typeof STORY_POSES!=='undefined'&&STORY_POSES[id]; if(!S) return null; return S.atlases.map(a=>PAINTED[a]&&PAINTED[a].ready?1:0).join(''); };
  return {ia:intro.active,ph:intro.phase,sid:intro.sid||null,da:dialog.active,who:dialog.active?dialog.name:null,
    line:dialog.active?(dialog.lines[dialog.index]||'').slice(0,34):null,done:dialog.active?dialog.shown>=dialog.chars.length:null,
    cut:vis('cut-ctrl'),cls:document.documentElement.classList.contains('cutscene'),dpad:dirVis,abtn:vis('action'),
    toast:document.getElementById('toast').classList.contains('visible')?document.getElementById('toast').textContent.slice(0,40):null,
    map:currentMap.id,tom:P(player),tf:player.facing,tp:pose(player),g:g?P(g):null,gh:g?!!g.hidden:null,gp:pose(g),r:r?P(r):null,rh:r?!!r.hidden:null,seat:r?!!r.seat:null,rp:pose(r),
    zoom:Math.round(sceneZoom*100)/100,close:typeof closeup!=='undefined'&&!!closeup.active,show:!!intro.showcase,
    npc:currentMap.npcs.filter(n=>!n.hidden&&(n.scenePose||n.scripted)).map(n=>n.name+':'+(pose(n)||'-')+'@'+P(n).join(',')),
    rdy:['tom','grace','rose','deedee','boppy'].map(ready).join('|'),
    flags:Object.keys(STORY.flags).filter(k=>/^(opening|ch1)/.test(k)).join(',')};
}"""
log=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=240000)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    if MODE=='open':
        pg.evaluate("()=>{ window.__routes=[]; chapterJump(1); }")
    elif MODE=='row':
        pg.evaluate("""()=>{ endIntro(); resetStory('full',1); b6Prep(1); for(const k of ['opening-done','ch1-goal','saw-squishy','tombo:rose1','tombo:grace1']) STORY.flags[k]=true;
          setChapter(1,{apply:false}); for(const f of followers) f.hidden=false; currentMap=town; let P=null,at=null;
          for(const [k,p] of town.portals) if(p.kind==='edge'&&p.to==='row') { P=p; at=k; }
          const xy=String(at).split(',').map(Number); player.x=xy[0]; player.y=xy[1]; player.facing='down'; player.hidden=false; player.move=null;
          placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); beginTransition(P); }""")
    else:
        # the kitchen: state as after ch1Goal and ch1Amy, then walk in through the real door portal so the trigger fires by itself
        pg.evaluate("""()=>{ endIntro(); resetStory('full',1); b6Prep(1); for(const k of ['opening-done','ch1-goal','ch1-amy','saw-squishy','tombo:rose1','tombo:grace1']) STORY.flags[k]=true;
          setChapter(1,{apply:false}); for(const f of followers) f.hidden=false; const h=houseById.grands; currentMap=worlds[h.area]||town; player.x=h.door.x; player.y=h.door.y+1; player.facing='up'; player.hidden=false; player.move=null;
          placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); window.storyTriggersReal=storyTriggers;
          const portal=currentMap.portals.get(key(h.door.x,h.door.y)); beginTransition(portal); }""")
    t0=time.time(); last=None; doneAt=None; idle=0; shots=0; lim=330 if MODE=='open' else 300
    endflag={'open':'ch1-goal','row':'ch1-amy','theft':'ch1-theft'}[MODE]
    while time.time()-t0<lim:
        s=pg.evaluate(SNAP); s['t']=round(time.time()-t0,2); log.append(s)
        if s['close']:
            # a close-up picture: tap A after it has been up 2.5 s (the player would look, then press)
            if doneAt is None: doneAt=time.time()
            elif time.time()-doneAt>2.5: pg.keyboard.press('Enter'); doneAt=None
        elif s['da'] and s['done']:
            if doneAt is None: doneAt=time.time()
            elif time.time()-doneAt>0.7: pg.keyboard.press('Enter'); doneAt=None
        else: doneAt=None
        if endflag in s['flags'] and not s['ia'] and not s['da']:
            idle+=1
            if idle==20: pg.screenshot(path=os.path.join(OUT,MODE+'-end.png'))
            if idle>90: break
        else: idle=0
        key=(s['sid'],s['who'],s['tp'],s['gp'],s['rp'])
        if MODE!='open' and key!=last and shots<60 and s['ia']:
            pg.wait_for_timeout(120); pg.screenshot(path=os.path.join(OUT,'%s-%03d.png'%(MODE,shots))); shots+=1
        last=key
        pg.wait_for_timeout(100)
    json.dump({'log':log,'errs':errs},open(os.path.join(OUT,MODE+'.json'),'w'))
    print('frames',len(log),'errs',errs[:5],'secs',round(time.time()-t0,1))
    br.close()
