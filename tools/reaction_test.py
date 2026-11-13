# Reaction pilot test (react2): same harness as boss_stage_test.py, also records every emo-posed NPC per page. Boss staging test (CHANGES stage1). Inventory harness: plays boss lead-in and after scenes with the battle auto-won, and records where the party stands
# and which way each member faces on every dialogue page. Usage (repo root): python3 tools/boss_stage_test.py tools/boss_stage_cases.json /tmp/stage [case names...]
# then: python3 tools/boss_stage_report.py /tmp/stage/result.json  (every row must show 0 overlap pages; about 1 min per case)
import threading, http.server, socketserver, functools, os, json, sys, math
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cases=json.load(open(sys.argv[1])); OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
only=sys.argv[3:]
if only: cases=[c for c in cases if c['name'] in only]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP=r"""(C)=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  window.__bcErr=[];
  resetStory('full',C.ch); const st=chselStateBefore(C.ch); Object.assign(STORY.flags,st.flags);
  for(const id of st.gives) if(items[id]&&!bag.includes(id)) bag.push(id);
  // flags from this chapter's scenes defined before the first scene we play
  const keys=Object.keys(SCENES), first=keys.indexOf(C.scenes[0]);
  const take=(k,v)=>{ if(!k||k==='goal'||v==='pending'||v===false||v===null) return; STORY.flags[k]=v===undefined?true:v; };
  const fromSource=fn=>{ for(const m of String(fn).matchAll(/setFlag\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?/g)) take(m[1],m[2]); };
  const walk=x=>{ if(!x) return; if(Array.isArray(x)){x.forEach(walk);return;} if(typeof x==='function'){fromSource(x);return;}
    if(typeof x!=='object'||typeof x.start==='function') return; if(typeof x.flag==='string') take(x.flag,x.value);
    if(typeof x.battle==='string') take('battle:'+x.battle,'win'); if(typeof x.call==='function') fromSource(x.call);
    for(const k of ['then','else','all','seq']) if(x[k]) walk(x[k]); };
  const pre=new RegExp('^'+(C.prefix||('ch'+C.ch))+'[A-Z]');
  for(let i=0;i<first;i++){ const id=keys[i]; if(!pre.test(id)) continue; let s=SCENES[id]; if(typeof s==='function'){ fromSource(s); try{s=s({});}catch(e){s=null;} } walk(s); }
  for(const f of C.unflag||[]) delete STORY.flags[f];
  for(const [k,v] of Object.entries(C.flags||{})) STORY.flags[k]=v;
  setChapter(C.ch,{apply:false}); STORY.override=null;
  b6Prep(10);
  for(const m of extras()) recruitLeave(m,true);
  const wantGirls=C.party.includes('grace'); if(girlsAway()===wantGirls) setGirlsAway(!wantGirls);
  for(const id of C.party) { if(['tom','grace','rose'].includes(id)) continue; const m=MEMBERS()[id]; if(m) forceJoin(m,true); }
  for(const id of C.bench||[]) { const m=MEMBERS()[id]; if(m&&typeof benchAdd==='function') benchAdd(m); }   // people who walk along but sit out fights (near1)
  window.storyTriggers=()=>false;
  // battles win at once
  SCENE_OPS.battle=o=>S.call(()=>{ let m=typeof o.battle==='function'?o.battle():typeof o.battle==='object'?o.battle:findMonster(o.battle);
    const id=(m&&m.monster)||o.battle; if(m) monsterFall(m); setFlag('battle:'+id,'win'); storyWorld();   // storyWorld: the real game reruns the world rules before the after scene (bossend5); monsterFall: what a real win does (b2RewardsData); a boss must stay (bossend1)
    if(typeof C.kind==='string') setFlag('kind:'+id,true); });
  const m=worlds[C.map]; currentMap=m; const s=C.start||[m.spawn.x,m.spawn.y,'down'];
  player.x=s[0]; player.y=s[1]; player.facing=s[2]||'down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  if(C.layout==='landscape'){ layout.mode='landscape'; applyLayout(); } else { layout.mode='portrait'; applyLayout(); }
  return {party:party.map(p=>p.id),map:currentMap.id};
}"""
SNAP=r"""(boss)=>{ const P=a=>{ const p=position(a); return [Math.round(p.x*100)/100,Math.round(p.y*100)/100]; };
  const ids=[{id:(typeof playerMember==='function'?playerMember():hero).id,a:player},...followers.filter(f=>!f.hidden&&(party.includes(f.member)||(typeof onBench==='function'&&onBench(f.member)))).map(f=>({id:f.member.id,a:f}))];
  const b=boss?(sceneActor(boss)||currentMap.npcs.find(n=>n.monster===boss)||null):null;
  return {who:dialog.name, idx:dialog.index, line:(dialog.pages&&dialog.pages[dialog.index])||'', map:currentMap.id, outside:!!currentMap.outside,
    party:ids.map(o=>({id:o.id,pos:P(o.a),facing:o.a.facing,pose:o.a.scenePose?String(o.a.scenePose.f):null,hidden:!!o.a.hidden,hid:!!(typeof huddleHidden==='function'&&huddleHidden(currentMap,Math.round(P(o.a)[0]),Math.round(P(o.a)[1]),new Map()))})),
    cam:(typeof camera!=='undefined'?[camera.x,camera.y,camera.zoom||camera.scale||null]:null),ppos:P(player),dock:(document.getElementById('dialog').getBoundingClientRect().top),npcs:currentMap.npcs.filter(n=>n.scenePose&&n.scenePose.emo).map(n=>[n.name,n.scenePose.f]),
    boss:b&&!b.hidden?{pos:P(b),name:b.name}:null};
}"""
OBJ=r"""(sel)=>{ const m=currentMap,o=m.objects.find(o=>o[sel]||o.name===sel||o.kind===sel); if(!o) return null;
  const c=[]; for(let x=o.x;x<o.x+o.w;x++) { c.push([x,o.y+o.h,'up']); c.push([x,o.y-1,'down']); } for(let y=o.y;y<o.y+o.h;y++) { c.push([o.x-1,y,'right']); c.push([o.x+o.w,y,'left']); }
  const busy=new Set(m.npcs.filter(n=>!n.hidden).map(n=>key(Math.round(n.x),Math.round(n.y))));
  const open=(x,y)=>walkable(m,x,y)&&!m.portals.has(key(x,y))&&!busy.has(key(x,y));
  let best=null;
  for(const [x,y,f] of c) { if(!open(x,y)) continue;
    // the longest walk-in of up to 7 steps that ends on this tile (breadth first, backwards)
    const prev=new Map([[key(x,y),null]]); let q=[[x,y]],far=[x,y];
    for(let d=0;d<7&&q.length;d++) { const nq=[]; for(const [a,b] of q) for(const [dx,dy] of [[0,1],[-1,0],[1,0],[0,-1]]) { const k=key(a+dx,b+dy); if(prev.has(k)||!open(a+dx,b+dy)) continue; prev.set(k,[a,b]); nq.push([a+dx,b+dy]); } if(nq.length) far=nq[0]; q=nq; }
    const pts=[]; for(let p=far;p;p=prev.get(key(p[0],p[1]))) pts.push(p);
    const cost=-pts.length+(f==='up'?0:2); if(!best||cost<best.cost) best={f,pts,cost}; }
  if(!best) return {fail:'no open tile beside it',rect:[o.x,o.y,o.w,o.h]};
  const st=best.pts[0]; player.x=st[0]; player.y=st[1]; player.move=null; placeFollowers(); camera.snap=true;
  const dirs=[]; for(let i=1;i<best.pts.length;i++) dirs.push(directionTo(best.pts[i][0]-best.pts[i-1][0],best.pts[i][1]-best.pts[i-1][1]));
  return {dirs,face:best.f,rect:[o.x,o.y,o.w,o.h],name:o.name,end:best.pts[best.pts.length-1]};
}"""
res={}
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for C in cases:
        pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(800)
        info=pg.evaluate(SETUP,C)
        for d in C.get('walk',[]):
            pg.evaluate("(d)=>{ movePlayer(d); }",d); pg.wait_for_timeout(260)
        if C.get('obj'):   # item1: walk Tom up to an object (found by a property, its name or its kind) the way a player would, and press A on it
            pg.evaluate("()=>{ for(const n of currentMap.npcs) if(n.monster&&!n.scripted) { n.hidden=true; n.x=-9; n.y=-9; } }")   # roaming monsters would start a fight on the way; the test is about the standing places
            plan=pg.evaluate(OBJ,C['obj'])
            if not plan or plan.get('fail'): print(C['name'],'NO OBJECT',plan,flush=True); pg.close(); res[C['name']]={'info':info,'snaps':[],'errs':['no object '+C['obj']]}; continue
            if False: print(C['name'],'NO OBJECT',C['obj'],flush=True); pg.close(); res[C['name']]={'info':info,'snaps':[],'errs':['no object '+C['obj']]}; continue
            for d in plan['dirs']:
                for _ in range(40):
                    if pg.evaluate("(d)=>!player.move&&movePlayer(d)",d): break
                    pg.wait_for_timeout(60)
            pg.wait_for_function("()=>!player.move",timeout=8000); pg.wait_for_timeout(500); pg.evaluate("(f)=>{ player.facing=f; objPressNote(); }",plan['face']); info['tgt']=pg.evaluate("()=>{ const t=facingTarget(); return t?[t.kind,t.value&&t.value.name]:null; }"); info['obj']=plan['rect']; info['press']=pg.evaluate("()=>!!objPressLive()"); info['at']=pg.evaluate("()=>[player.x,player.y,player.facing]"); info['want']=plan['end']
        pg.wait_for_timeout(300)
        snaps=[]; shots=[]; fins=[]
        for sc in C['scenes']:
            pg.evaluate("(sc)=>{ if(sc.startsWith('!')) eval(sc.slice(1)); else playScene(sc); }",sc)
            last=None; t=0; dw=0
            while t<90:
                pg.wait_for_timeout(150); t+=.15
                st=pg.evaluate("()=>({a:intro.active,d:dialog.active,n:dialog.name,i:dialog.index,typed:dialog.active&&dialog.shown>=dialog.chars.length,battle:battle.active,choice:!!(dialog.choices&&dialog.choices.length)})")
                if st['d']:
                    k=(st['n'],st['i'])
                    if k!=last:
                        pg.wait_for_timeout(250)
                        s=pg.evaluate(SNAP,C.get('boss')); s['scene']=sc; snaps.append(s)
                        fn=os.path.join(OUT,f"{C['name']}-{len(shots):02d}.png"); pg.evaluate("()=>{document.getElementById('dialog').style.opacity='.25'}"); pg.screenshot(path=fn); pg.evaluate("()=>{document.getElementById('dialog').style.opacity=''}"); shots.append(fn); last=k
                    if st['typed']:
                        dw+=1
                        if dw>=2: dw=0; pg.evaluate("()=>{ if(dialog.choices&&dialog.choices.length) pickChoice(0); else advanceDialog(); }")
                elif not st['a'] and not st['battle']:
                    break
                elif st['a'] and not st['d'] and not st['battle'] and os.environ.get('FIN'):
                    # no dialogue on screen: a finale or a walk is playing; keep a frame of it
                    fn=os.path.join(OUT,f"{C['name']}-fin-{len(fins):02d}.png"); pg.screenshot(path=fn); fins.append(fn); pg.wait_for_timeout(250)
        res[C['name']]={'info':info,'snaps':snaps,'errs':errs[:5]}
        if shots:
            ims=[Image.open(f) for f in shots]; cols=6; w,h=ims[0].size; sc_=300/w; tw,th=int(w*sc_),int(h*sc_); rows=(len(ims)+cols-1)//cols
            sheet=Image.new('RGB',(cols*tw,rows*th),(20,20,20))
            for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
            sheet.save(os.path.join(OUT,f"{C['name']}-sheet.png"))
        pg.close()
        print(C['name'],info,len(snaps),'pages',errs[:2],flush=True)
    br.close()
json.dump(res,open(os.path.join(OUT,'result.json'),'w'),indent=1)
