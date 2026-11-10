# Scene staging audit (CHANGES "talkstage1"). Plays every triggered story scene (TRIGGERS in data/scenes*.js) with battles auto-won and
# records, on every dialogue page, where each person in the scene stands and which way they face. Then scores each page:
#   overlap   two people share a column within two rows (the same rule the boss staging uses: stageApart in engine/story.js)
#   offcenter the group stands tight against walls or the map edge instead of in open floor (clearance test, see score())
#   hidden    a party member stands where painted scenery (gate boards, trees) covers them
#   facing    someone faces away from the rest of the group (dot product of facing and the direction to the others <= 0)
# Usage (repo root):  python3 tools/scene_stage_audit.py run OUT [filter ...]   filter = trigger id prefixes (ch1-, ns-) or ids
#                     python3 tools/scene_stage_audit.py report OUT [--all]      prints the table (failing scenes unless --all)
# Output: OUT/<trigger id>.json (snapshots), OUT/<trigger id>-NN.png (one screenshot per dialogue page), OUT/summary.json.
import threading, http.server, socketserver, functools, os, json, sys, math, re
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Party at each chapter (same table the boss staging cases use); members a scene recruits itself ({join}) are removed first.
PARTY={1:['tom','grace','rose','deedee'],2:['tom','tnb','nara'],3:['tom','grace','rose','boppy'],4:['tom','tnb','nara'],5:['tom','grace','rose','amy'],
 6:['tom','tnb','nara'],7:['tom','grace','rose'],8:['tom','tnb','nara'],9:['tom','deedee','boppy'],10:['tom','grace','rose','amy'],
 11:['tom','grace','rose','amy'],12:['tom','grace','rose','amy'],13:['tom','amy','tnb','nara'],14:['tom','amy','grace','rose'],
 15:['tom','grace','rose','amy'],16:['tom','grace','rose','amy'],17:['tom','grace','rose','amy'],18:['tom','grace','rose','amy'],
 19:['tom','grace','rose','amy'],20:['tom','grace','rose','amy'],21:['tom','grace','rose']}

SETUP=r"""(C)=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  window.__bcErr=[];
  resetStory('full',C.ch); const st=chselStateBefore(C.ch); Object.assign(STORY.flags,st.flags);
  for(const id of st.gives) if(items[id]&&!bag.includes(id)) bag.push(id);
  const keys=Object.keys(SCENES), first=keys.indexOf(C.scene);
  const take=(k,v)=>{ if(!k||k==='goal'||v==='pending'||v===false||v===null) return; STORY.flags[k]=v===undefined?true:v; };
  const fromSource=fn=>{ for(const m of String(fn).matchAll(/setFlag\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?/g)) take(m[1],m[2]); };
  const walk=x=>{ if(!x) return; if(Array.isArray(x)){x.forEach(walk);return;} if(typeof x==='function'){fromSource(x);return;}
    if(typeof x!=='object'||typeof x.start==='function') return; if(typeof x.flag==='string') take(x.flag,x.value);
    if(typeof x.battle==='string') take('battle:'+x.battle,'win'); if(typeof x.call==='function') fromSource(x.call);
    for(const k of ['then','else','all','seq']) if(x[k]) walk(x[k]); };
  const pre=new RegExp('^'+C.prefix+'[A-Z]');
  for(let i=0;i<first;i++){ const id=keys[i]; if(!pre.test(id)) continue; let s=SCENES[id]; if(typeof s==='function'){ fromSource(s); try{s=s({});}catch(e){s=null;} } walk(s); }
  const W=C.when||{}; const sets=v=>typeof v==='string'?{[v]:true}:Array.isArray(v)?Object.fromEntries(v.map(k=>[k,true])):(v&&typeof v==='object'?v:{});
  for(const [k,v] of Object.entries(sets(W.flag))) STORY.flags[k]=v;
  for(const k of Object.keys(sets(W.notFlag))) delete STORY.flags[k];
  delete STORY.flags[C.flagOwn];
  setChapter(C.ch,{apply:false}); STORY.override=null;
  b6Prep(10);
  for(const m of extras()) recruitLeave(m,true);
  const wantGirls=C.party.includes('grace'); if(girlsAway()===wantGirls) setGirlsAway(!wantGirls);
  for(const id of C.party) { if(['tom','grace','rose'].includes(id)) continue; const m=MEMBERS()[id]; if(m) forceJoin(m,true); }
  window.storyTriggers=()=>false;
  SCENE_OPS.battle=o=>S.call(()=>{ let m=typeof o.battle==='function'?o.battle():typeof o.battle==='object'?o.battle:findMonster(o.battle);
    const id=(m&&m.monster)||o.battle; setFlag('battle:'+id,'win'); });
  const m=worlds[C.map]; if(!m) return {err:'no map '+C.map}; currentMap=m;
  let s=C.start; if(!s){ const sp=m.spawn||{x:1,y:1}; s=[sp.x,sp.y,'down']; }
  player.x=s[0]; player.y=s[1]; player.facing=s[2]||'down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  layout.mode=C.layout==='landscape'?'landscape':'portrait'; applyLayout();
  return {party:party.map(p=>p.id),map:currentMap.id};
}"""
# People in the scene: the party (Tom and followers) plus every map NPC a scene is holding (held or scripted); the NPC a line names is held by {huddle} first.
SNAP=r"""()=>{ const P=a=>{ const p=position(a); return [Math.round(p.x*100)/100,Math.round(p.y*100)/100]; };
  const memo=new Map(),H=a=>{ const q=position(a); return typeof huddleHidden==='function'?huddleHidden(currentMap,Math.round(q.x),Math.round(q.y),memo):false; };
  const people=[{id:'tom',kind:'party',pos:P(player),facing:player.facing,posed:!!player.scenePose,hid:H(player)}];
  for(const f of followers) if(!f.hidden&&party.includes(f.member)&&!f.seat) people.push({id:f.member.id,kind:'party',pos:P(f),facing:f.facing,posed:!!(f.scenePose||f.scr),hid:H(f)});
  const pp=P(player);
  for(const n of currentMap.npcs){ if(n.hidden||followers.includes(n)) continue; const q=P(n);
    if(n.held||n.scripted||n.name===dialog.name) people.push({id:n.name,kind:n.monster?'monster':'npc',pos:q,facing:n.facing,held:!!n.held||!!n.scripted,posed:!!n.scenePose}); }
  const w=currentMap.w||(currentMap.plateMask&&currentMap.plateMask[0].length)||0,h=currentMap.h||(currentMap.plateMask&&currentMap.plateMask.length)||0;
  return {who:dialog.name,idx:dialog.index,map:currentMap.id,w,h,people};
}"""
GRID=r"""()=>{ const w=currentMap.w||(currentMap.plateMask&&currentMap.plateMask[0].length)||0,h=currentMap.h||(currentMap.plateMask&&currentMap.plateMask.length)||0; const g=[];
  for(let y=0;y<h;y++){ let r=''; for(let x=0;x<w;x++) r+=walkable(currentMap,x,y)?'.':'#'; g.push(r); } return g; }"""
JOINS=r"""(id)=>{ let s=SCENES[id]; try{ if(typeof s==='function') s=s({}); }catch(e){ return []; }
  const j=[]; try{ for(const m of JSON.stringify(s,(k,v)=>typeof v==='function'?undefined:v).matchAll(/"join":"(\w+)"/g)) j.push(m[1]); }catch(e){}
  return j; }"""
START=r"""(a)=>{ const m=worlds[a.map]; if(!m) return null; const ok=(x,y)=>walkable(m,x,y)&&!m.portals.has(key(x,y));
  let cx,cy; if(a.at){ cx=Math.round((a.at[0]+a.at[2])/2); cy=Math.round((a.at[1]+a.at[3])/2); } else { const s=m.spawn||{x:1,y:1}; cx=s.x; cy=s.y; }
  let best=null,bd=1e9; const R=14; for(let y=cy-R;y<=cy+R;y++) for(let x=cx-R;x<=cx+R;x++){ if(!ok(x,y)) continue; if(a.at&&(x<a.at[0]||y<a.at[1]||x>a.at[2]||y>a.at[3])) continue;
    const d=Math.hypot(x-cx,y-cy); if(d<bd){bd=d;best=[x,y];} }
  return best; }"""

DIRV={'up':(0,-1),'down':(0,1),'left':(-1,0),'right':(1,0)}

def clearance(grid):
    """Chebyshev distance from every tile to the nearest blocked tile or the map edge (0 on blocked tiles)."""
    h=len(grid); w=len(grid[0]) if h else 0
    INF=10**6; d=[[0 if grid[y][x]=='#' else INF for x in range(w)] for y in range(h)]
    from collections import deque
    q=deque((x,y) for y in range(h) for x in range(w) if grid[y][x]=='#')
    for y in range(h):
        for x in range(w):
            if grid[y][x]=='.' and (x in(0,w-1) or y in(0,h-1)): d[y][x]=1; q.append((x,y))
    while q:
        x,y=q.popleft()
        for dx in(-1,0,1):
            for dy in(-1,0,1):
                nx,ny=x+dx,y+dy
                if 0<=nx<w and 0<=ny<h and d[ny][nx]>d[y][x]+1: d[ny][nx]=d[y][x]+1; q.append((nx,ny))
    return d

def score(snap,grid,clr):
    """Return the list of failures for one dialogue page."""
    ppl=[p for p in snap['people'] if p['kind']!='monster' or p.get('held')]
    # the group: everyone within 6 tiles of Tom
    tom=next(p for p in ppl if p['id']=='tom'); tx,ty=tom['pos']
    grp=[p for p in ppl if math.hypot(p['pos'][0]-tx,p['pos'][1]-ty)<=6]
    if len(grp)<2: return [],grp
    fails=[]
    P=[(round(p['pos'][0]),round(p['pos'][1])) for p in grp]
    for i in range(len(grp)):
        for j in range(i+1,len(grp)):
            if grp[i].get('posed') or grp[j].get('posed'): continue   # a deliberate pratfall pile
            if abs(P[i][0]-P[j][0])<1 and abs(P[i][1]-P[j][1])<3: fails.append(('overlap',f"{grp[i]['id']}+{grp[j]['id']}"))
    # centering: the group's centroid should have room around it. clearance at the centroid compared with the best clearance nearby.
    w,h=snap['w'],snap['h']
    cx=sum(p[0] for p in P)/len(P); cy=sum(p[1] for p in P)/len(P)
    def cl(x,y):
        x=int(round(x)); y=int(round(y))
        return clr[y][x] if 0<=x<w and 0<=y<h else 0
    here=cl(cx,cy); best=max(cl(x,y) for x in range(int(cx)-5,int(cx)+6) for y in range(int(cy)-5,int(cy)+6))
    edge=[p['id'] for p,(x,y) in zip(grp,P) if p['kind']=='party' and (x<=0 or y<=0 or x>=w-1 or y>=h-2)]
    offfloor=[p['id'] for p,(x,y) in zip(grp,P) if p['kind']=='party' and not(0<=x<w and 0<=y<h and grid[y][x]=='.')]
    if edge: fails.append(('offcenter','on the map edge or in the bottom two rows (under the dialogue box): '+','.join(edge)))
    elif offfloor: fails.append(('offcenter','off the walkable floor: '+','.join(offfloor)))
    hid=[p['id'] for p in grp if p['kind']=='party' and p.get('hid') and not p.get('posed')]
    if hid: fails.append(('hidden','behind painted scenery: '+','.join(hid)))
    elif best>=2 and here<=0.5*best and here<=1: fails.append(('offcenter',f'centroid clearance {here} of {best}'))
    # facing: each person should face somewhere toward the others (not away from them)
    for p,(x,y) in zip(grp,P):
        if p.get('posed') or p['facing'] not in DIRV: continue
        ox=[(a,b) for q,(a,b) in zip(grp,P) if q is not p]
        mx=sum(a for a,b in ox)/len(ox)-x; my=sum(b for a,b in ox)/len(ox)-y
        if abs(mx)<.01 and abs(my)<.01: continue
        fx,fy=DIRV[p['facing']]
        if fx*mx+fy*my<=0: fails.append(('facing',f"{p['id']} faces {p['facing']}"))
    return fails,grp

def run(out,filters):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    os.makedirs(out,exist_ok=True)
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    socketserver.TCPServer.allow_reuse_address=True
    srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    summary={}
    with sync_playwright() as pw:
        kw={'args':['--headless=new','--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
        br=pw.chromium.launch(**kw)
        pg0=br.new_page(); pg0.goto(f'http://127.0.0.1:{port}/index.html'); pg0.wait_for_function('()=>window.__LE&&window.__LE.playScene',timeout=180000)
        trig=pg0.evaluate("()=>TRIGGERS.filter(t=>typeof t.scene==='string').map(t=>({id:t.id,map:t.map,at:t.at||null,when:t.when||{},scene:t.scene}))"); pg0.close()
        if filters: trig=[t for t in trig if any(t['id']==f or (f.endswith('-') and t['id'].startswith(f)) for f in filters)]
        for T in trig:
          if os.path.exists(os.path.join(out,T['id']+'.json')) and not os.environ.get('REDO'): continue   # resume: skip scenes already audited
          for attempt in (1,2):
            try:
              audit_one(br,port,out,T,summary); break
            except Exception as e:
              print(T['id'],'attempt',attempt,'failed:',str(e)[:80],flush=True)
              try: br.close()
              except Exception: pass
              br=pw.chromium.launch(**kw)
        br.close()
    old={}
    p=os.path.join(out,'summary.json')
    if os.path.exists(p): old=json.load(open(p))
    old.update(summary); json.dump(old,open(p,'w'),indent=1)

def audit_one(br,port,out,T,summary):
    from PIL import Image
    if True:
        if True:
            ch=T['when'].get('chapter',1); ch=ch[-1] if isinstance(ch,list) else ch
            pre=re.match(r'^([a-z]+\d*)[A-Z]',T['scene']); pre=pre.group(1) if pre else 'ch'+str(ch)
            pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e)))
            pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump',timeout=180000); pg.wait_for_timeout(600)
            joins=pg.evaluate(JOINS,T['scene'])
            party=[m for m in PARTY.get(ch,PARTY[1]) if m not in joins]
            start=pg.evaluate(START,T)
            C={'ch':ch,'map':T['map'],'scene':T['scene'],'prefix':pre,'when':T['when'],'party':party,'flagOwn':T['id'],
               'start':[start[0],start[1],'down'] if start else None,'layout':'portrait'}
            info=pg.evaluate(SETUP,C)
            if info.get('err'): print(T['id'],info); pg.close(); return
            grid=pg.evaluate(GRID); snaps=[]; shots=[]; last=None; t=0; dw=0
            pg.evaluate("(sc)=>playScene(sc)",T['scene'])
            while t<75:
                pg.wait_for_timeout(150); t+=.15
                st=pg.evaluate("()=>({a:intro.active,d:dialog.active,n:dialog.name,i:dialog.index,typed:dialog.active&&dialog.shown>=dialog.chars.length,battle:battle.active})")
                if st['d']:
                    k=(st['n'],st['i'])
                    if k!=last:
                        pg.wait_for_timeout(250); s=pg.evaluate(SNAP)
                        if s['map']!=T['map'] and s['map']!=info['map']: grid=pg.evaluate(GRID)
                        s['grid']=grid; snaps.append(s)
                        fn=os.path.join(out,f"{T['id']}-{len(shots):02d}.png"); pg.screenshot(path=fn); shots.append(fn); last=k
                    if st['typed']:
                        dw+=1
                        if dw>=2: dw=0; pg.evaluate("()=>{ if(dialog.choices&&dialog.choices.length) pickChoice(0); else advanceDialog(); }")
                elif not st['a'] and not st['battle']: break
            for s in snaps: s['grid']=s['grid']
            json.dump({'trigger':T,'party':party,'snaps':snaps,'errs':errs[:3]},open(os.path.join(out,T['id']+'.json'),'w'))
            fails=0
            for s in snaps:
                clr=clearance(s['grid']); f,_=score(s,s['grid'],clr); fails+=1 if f else 0
            summary[T['id']]={'pages':len(snaps),'failpages':fails,'scene':T['scene'],'map':T['map']}
            print(T['id'],T['scene'],T['map'],len(snaps),'pages',fails,'failing',errs[:1],flush=True)
            pg.close()

def report(out,show_all=False):
    rows=[]
    for fn in sorted(os.listdir(out)):
        if not fn.endswith('.json') or fn=='summary.json': continue
        d=json.load(open(os.path.join(out,fn))); T=d['trigger']; kinds={}; pages=[]
        for i,s in enumerate(d['snaps']):
            clr=clearance(s['grid']); f,grp=score(s,s['grid'],clr)
            if f: pages.append((i,f))
            for k,_ in f: kinds[k]=kinds.get(k,0)+1
        rows.append((T['id'],T['scene'],T['map'],len(d['snaps']),kinds,pages))
    bad=[r for r in rows if r[4]]
    print(f"{len(rows)} scenes audited, {len(bad)} with at least one failing page")
    print('| trigger | scene | map | pages | overlap | offcenter | hidden | facing | first failing page |'); print('|---|---|---|---|---|---|---|---|---|')
    for r in (rows if show_all else bad):
        k=r[4]; first=f"p{r[5][0][0]}: "+'; '.join(f"{a} {b}" for a,b in r[5][0][1])[:90] if r[5] else ''
        print(f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {k.get('overlap',0)} | {k.get('offcenter',0)} | {k.get('hidden',0)} | {k.get('facing',0)} | {first} |")

if __name__=='__main__':
    if len(sys.argv)<3: print(__doc__); sys.exit(1)
    if sys.argv[1]=='run': run(sys.argv[2],sys.argv[3:])
    elif sys.argv[1]=='report': report(sys.argv[2],'--all' in sys.argv)
