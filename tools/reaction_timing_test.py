# Reaction timing test (reacttime1): plays scenes with sound on and records, for every dialogue page, when each listener's mood pose appears:
# seconds after the page opened, how far the line had got (characters), and whether a spoken clip was driving the clock.
# Usage (repo root): python3 tools/reaction_timing_test.py cases.json /tmp/rt [case names]   (same case format as tools/reaction_test.py)
# Output: /tmp/rt/result.json and a printed table: page, clip length, each listener with cue position, time fired.
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
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
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
        pages=[]
        pg.evaluate("()=>{ try { setSound(true); } catch(e) {} const c=audio(); if(c&&c.state!=='running') c.resume(); }")
        pg.wait_for_function("()=>{ const f=(DIALOG_CAST.files||[]).length; return f&&[...document.scripts].filter(x=>/data\\/voice\\/dialog-/.test(x.src)).length>=f; }",timeout=180000); pg.wait_for_timeout(2500)   # every clip file loaded
        PROBE="()=>({a:intro.active,d:dialog.active,n:dialog.name,i:dialog.index,text:dialog.active?dialog.lines[dialog.index]:'',shown:dialog.shown,len:dialog.chars?dialog.chars.length:0,battle:battle.active,choice:!!(dialog.choices&&dialog.choices.length),playing:DV.playing,clip:DV.page===dialog.index,t0:DV.t0,dur:DV.dur,now:audio()?audio().currentTime:0,reached:dialog.active?emoCueReached():0,pend:EMO.pending.map(p=>p.slice()),posed:[...(player.scenePose&&player.scenePose.emo?[[playerMember().id,player.scenePose.f]]:[]),...followers.filter(f=>f.scenePose&&f.scenePose.emo).map(f=>[f.member.id,f.scenePose.f]),...currentMap.npcs.filter(n=>n.scenePose&&n.scenePose.emo).map(n=>[String(DIALOG_PORTRAIT_IDS[String(n.name).toLowerCase()]||n.name).replace(/^npc_/,''),n.scenePose.f])],rx:dialog.active?(emoReactionsOf(dialog.name,dialog.lines[dialog.index])||[]):[],speaker:EMO.actor?(EMO.actor.member?EMO.actor.member.id:(EMO.actor===player?playerMember().id:String(DIALOG_PORTRAIT_IDS[String(EMO.actor.name).toLowerCase()]||EMO.actor.name).replace(/^npc_/,''))):null})"
        for sc in C['scenes']:
            pg.evaluate("(sc)=>{ if(sc.startsWith('!')) eval(sc.slice(1)); else playScene(sc); }",sc)
            last=None; t=0; cur=None; idle=0
            while t<240:
                pg.wait_for_timeout(60); t+=.06
                st=pg.evaluate(PROBE)
                if st['d']:
                    k=(st['n'],st['i'],st['text'])
                    if k!=last:
                        cur={'scene':sc,'who':st['n'],'text':st['text'],'rx':st['rx'],'clip':st['clip'],'dur':None,'fired':{},'t':0,'speaker':st['speaker']}; pages.append(cur); last=k; idle=0
                    cur['t']+=.06
                    if os.environ.get('SHOTS') and not cur.get('s0') and cur['t']>.3: cur['s0']=1; pg.screenshot(path=os.path.join(OUT,'%s-%02d-a.png'%(C['name'],len(pages))))
                    if st['clip'] and st['t0'] is not None: cur['dur']=round(st['dur'],2)
                    for lid,f in st['posed']:
                        if lid!=cur['speaker'] and lid not in cur['fired']:
                            el=round(st['now']-st['t0'],2) if (st['clip'] and st['t0'] is not None) else None
                            cur['fired'][lid]={'pose':f,'page_s':round(cur['t'],2),'clip_s':el,'reached':st['reached'],'shown':st['shown']}
                            if os.environ.get('SHOTS') and cur.get('s0') and not cur.get('s1') and st['reached']>0: cur['s1']=1; pg.wait_for_timeout(120); pg.screenshot(path=os.path.join(OUT,'%s-%02d-b.png'%(C['name'],len(pages))))
                    done=st['shown']>=st['len'] and not st['playing'] and not st['pend']
                    if done:
                        idle+=1
                        if idle>=6: idle=0; pg.evaluate("()=>{ if(dialog.choices&&dialog.choices.length) pickChoice(0); else advanceDialog(); }")
                    elif cur['t']>25: pg.evaluate("()=>advanceDialog()")
                elif pg.evaluate("()=>typeof closeup!=='undefined'&&closeup.active&&!!closeup.reveal&&!closeup.busy"):
                    pg.wait_for_timeout(600); pg.evaluate("()=>closeupRevealEnd()")   # a close-up picture waits for A
                elif not st['a'] and not st['battle'] and not pg.evaluate("()=>typeof closeup!=='undefined'&&closeup.active"):
                    break
        res[C['name']]={'info':info,'pages':pages,'errs':errs[:5]}
        for p in pages:
            print('%-12s %-14s clip %-5s | %s'%(p['scene'][:12],p['who'][:14],p['dur'] if p['clip'] else 'none',p['text'][:70]))
            for r in p['rx']:
                f=p['fired'].get(r[0])
                print('      %-8s %-11s cue %-3s -> %s'%(r[0],r[1],r[2] if len(r)>2 else 0,('fired at %ss into the page (clip clock %s, line at char %s of %s)'%(f['page_s'],f['clip_s'],f['reached'],len(p['text']))) if f else 'NOT POSED'))
        pg.close()
        print(C['name'],info,len(pages),'pages',errs[:2],flush=True)
    br.close()
json.dump(res,open(os.path.join(OUT,'result.json'),'w'),indent=1)
