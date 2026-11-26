#!/usr/bin/env python3
"""b3_vfx_test.py (vfxfight1, 2026-11-26): the Stage 2C library effects (engine/vfx-library.js) in a real Battle 3 fight (engine/b3-vfx.js), in Chrome.
  1. Layers: one effect of each library layer is drawn in one real b3Draw frame, and the order is the layers' order: ground_decal, behind_units, the foes and the family,
     unit_overlay, foreground_sweep, screen_lighting.
  2. Every move of the manifest that names a library effect, armed on a real fight and swept through its whole life with b3Draw: each of its effects draws, none throws, and the
     canvas is the same afterwards.
  3. Played by hand through the real screen (portrait, then landscape): every move of the family the Lab fights bring is used from the deck. A move the manifest gives effects arms them
     when its hit lands (the cue's contact time is within 0.3 s of the hit's own beat), the effects that draw on the foe land on the foe the move hits, and the fight goes on.
  4. A fight never breaks: an effect that throws after a save() and a clip(), a cue whose unit is gone, and a move that names an effect nobody built; the fight reaches the next turn,
     the canvas state is put back, and the fault is logged once.
Sheets: tools/shots/b3-vfx-layers.png, b3-vfx-portrait.png, b3-vfx-landscape.png. Run (repo root): python3 tools/b3_vfx_test.py [fight ...]   Env: CHROMIUM, OUT, MOVES=n (limit of moves per member, 0 = all)."""
import threading, http.server, socketserver, functools, os, sys, json, io
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
LIMIT=int(os.environ.get('MOVES','0'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def need(ok,what):
    print(('ok   ' if ok else 'FAIL ')+what[:260])
    if not ok: fails.append(what)
def errors(errs): return [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e and 'Hiccup' not in e and 'fault in' not in e]
def wait_cmd(pg,t=60000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
def start(pg,fid):
    pg.evaluate("([i])=>{ b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; b3Lab(B3_LAB.findIndex(L=>L.id===i),{seed:7}); }",[fid])
    wait_cmd(pg); pg.wait_for_timeout(300)
    pg.evaluate("()=>{ B7.speed=2; }")
PREP="""()=>{ for(const p of B3.F.party) { p.pep=10; if(!p.ko) p.hp=p.maxHp; } for(const f of B3.F.foes) { f.hp=f.maxHp=99999; if(!f.broken&&!f.flusterTurn) { f.pips=f.maxPips; f.pipLock=false; } } b3ViewSync(); b3Render(); }"""
def canvas(pg,rot):
    r=pg.evaluate("()=>{ const b=document.getElementById('battle-canvas').getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; }")
    im=Image.open(io.BytesIO(pg.screenshot(clip=r))).convert('RGB')
    return im.rotate(90,expand=True) if rot else im
def sheet(frames,cols,path,w=420):
    if not frames: return
    frames=[f.resize((w,int(f.height*w/f.width))) for f in frames]; h=max(f.height for f in frames); rows=(len(frames)+cols-1)//cols
    S=Image.new('RGB',(cols*w,rows*h),(20,20,28))
    for i,f in enumerate(frames): S.paste(f,((i%cols)*w,(i//cols)*h))
    S.save(path)

LAYERS="""()=>{
  const ids={ground_decal:'proj_ground_hazard_mat',behind_units:'setpiece_3tier_sparkler_cake',unit_overlay:'vfx_core_clobber_impact',foreground_sweep:'vfx_core_sizzle_wave',screen_lighting:'setpiece_broadway_spotlights'};
  const ord=[],real={};
  for(const L in ids){ const id=ids[L],f=P1_VFX[id]; real[id]=f; P1_VFX[id]=function(){ ord.push('fx:'+L); return f.apply(this,arguments); }; }
  const foe=b3DrawFoe,mem=b3DrawMember; window.b3DrawFoe=function(){ ord.push('foe'); return foe.apply(this,arguments); }; window.b3DrawMember=function(){ ord.push('member'); return mem.apply(this,arguments); };
  const t=B3P.t, src=B3.F.party[0].key; B3V.cues.length=0;
  for(const L in ids){ const id=ids[L],len=(()=>{ const M=P1_VFX_MS[id]; return typeof M==='function'?M(null):(M||500); })(); B3V.cues.push({M:{impact_ms:0,vfx:[id],fxp:null},id:'layers',src,tgts:['f0'],t0:t-len*.0004,end:t+30,dead:{}}); }
  const faults0=(window.__faults||[]).length; b3Draw();
  B3V.cues.length=0; Object.assign(P1_VFX,real); window.b3DrawFoe=foe; window.b3DrawMember=mem;
  return {ord,faults:(window.__faults||[]).length-faults0}; }"""
SWEEP="""(doc)=>{
  const party=B3.F.party.map(p=>p.key),foes=B3.F.foes.map(f=>f.key),rows=[];
  const drawn={},real={}; for(const id of Object.keys(P1_VFX)){ const f=P1_VFX[id]; real[id]=f; P1_VFX[id]=function(){ drawn[id]=(drawn[id]||0)+1; return f.apply(this,arguments); }; }
  const t0=B3P.t,f0=(window.__faults||[]).length,tr=fightCtx.getTransform(),log=[]; const origFault=gameFault;
  for(const m of doc.moves){ if(!m.moveId||!(m.libraryAssets||[]).length) continue;
    for(const k in drawn) delete drawn[k];
    const ally=m.libraryAssets.some(a=>/heal_cleanse|shield_ward/.test(a)),head={t:'act',id:m.moveId,src:party[0],tgts:ally?[party[1]]:foes.slice()};
    B3P.t=t0; B3V.cues.length=0; B3V.holds.length=0; b3vArm(head,null,1,!ally); const c=B3V.cues[0];   // hitstop1: the sweep also draws every move through its hit stop
    if(!c){ rows.push({id:m.moveId,err:'no cue'}); continue; }
    for(let s=-1.5;s<=(c.end-c.t0)+.2;s+=.1){ B3P.t=c.t0+s; try { b3Draw(); } catch(e) { rows.push({id:m.moveId,err:'b3Draw threw '+e.message}); break; } }
    const want=m.libraryAssets.filter(a=>P1_VFX[a]),missing=want.filter(a=>!drawn[a]);
    rows.push({id:m.moveId,want:want.length,missing,dead:Object.keys(c.dead)});
  }
  Object.assign(P1_VFX,real); B3V.cues.length=0; B3V.holds.length=0; B3P.t=t0;
  const tr2=fightCtx.getTransform();
  return {rows,faults:(window.__faults||[]).length-f0,transform:[tr.a,tr.b,tr.c,tr.d,tr.e,tr.f].join()===[tr2.a,tr2.b,tr2.c,tr2.d,tr2.e,tr2.f].join()}; }"""
INSTR="""()=>{ if(window.__I) return; window.__I=true; window.__L=[]; const L=window.__L,r=x=>Math.round(x*1000)/1000;
  for(const id of Object.keys(P1_VFX)){ const f=P1_VFX[id]; P1_VFX[id]=function(g,x,y,u,z,p){ L.push(['fx',id,r(B3P.t),Math.round(x),Math.round(y),r(u)]); return f.apply(this,arguments); }; }
  const A=b3vArm; window.b3vArm=function(h,c,s,hit){ const ret=A(h,c,s,hit),cu=B3V.cues[B3V.cues.length-1]; L.push(['arm',h.id,r(B3P.t),r(s),ret,cu&&cu.src===h.src?cu.M.vfx:null,cu&&cu.src===h.src?r(cu.t0):null,h.tgts]); return ret; };
  const S=b3Show; window.b3Show=function(b){ if(b.t==='act'||b.t==='hit'||b.t==='dmg'||b.t==='heal'||b.t==='miss') L.push(['show',b.t,r(B3P.t),b.id||null]); return S(b); }; }"""
def play_all(pg,fid,rot,frames):
    """Uses every move of every family member of a Lab fight, once each, from the deck (a number key highlights a move, Enter uses it, as a player does)."""
    start(pg,fid); pg.evaluate(INSTR); done={}; seen={}; results=[]
    names=pg.evaluate("()=>B3.F.party.map(p=>p.id)")
    for _ in range(160):
        wait_cmd(pg)
        if pg.evaluate("()=>B3.ui==='done'"): break
        pg.evaluate(PREP); pg.wait_for_timeout(150)
        who=pg.evaluate("()=>B3.actor.id"); full=pg.evaluate("()=>B3.deck.map(e=>e.name)"); plain=pg.evaluate("()=>B3.deck.filter(e=>!e.ruckus).map(e=>e.name)")
        seen[who]=plain; d=done.setdefault(who,set())
        pend=[n for n in plain if n not in d]
        if os.environ.get('ONLY'): pend=[n for n in pend if n in os.environ['ONLY'].split('|')]
        if LIMIT: pend=pend[:max(0,LIMIT-len(d))]
        if not pend:
            if all(n in seen and not [m for m in seen[n] if m not in done.get(n,set())][:max(0,(LIMIT or 99)-len(done.get(n,set())))] for n in names): break
            n=plain[0]
        else: n=pend[0]
        d.add(n)
        pg.evaluate("()=>{ window.__L.length=0; }")
        pg.mouse.move(2,2); j=full.index(n)
        if j<9: pg.keyboard.press('Digit'+str(j+1))
        else: pg.evaluate("(i)=>b3Select(i)",j)
        pg.wait_for_timeout(200); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        taken=who in [f[0] for f in frames]
        for k in range(45):
            if not taken and pg.evaluate("()=>window.__L.some(r=>r[0]==='fx')"): frames.append((who,canvas(pg,rot))); taken=True
            if k>8 and pg.evaluate("()=>window.__LE.battle.state==='command'&&(B3.ui==='deck'||B3.ui==='done')"): break
            pg.wait_for_timeout(110)
        wait_cmd(pg)
        results.append((who,n,pg.evaluate("()=>window.__L.slice()")))
    return results
def judge(res,man,tag):
    by={m['moveId']:m for m in man['moves'] if m.get('moveId')}
    played=0; good=0
    for who,n,L in res:
        acts=[r for r in L if r[0]=='show' and r[1]=='act']; arms=[r for r in L if r[0]=='arm' and r[5] is not None]; fx=[r for r in L if r[0]=='fx']
        if not acts: continue
        mid=acts[0][3]; m=by.get(mid); played+=1
        want=list((m or {}).get('libraryAssets',[]))
        if not want:
            need(not arms and not fx,f"{tag} {who} {n} ({mid}): the manifest names no library effect, so none is armed or drawn ({len(arms)} armed, {len(fx)} drawn)"); good+=1; continue
        i0=L.index(acts[0]); i1=L.index(acts[1]) if len(acts)>1 else len(L)   # only the beats of this move: a ward's 'hit' is a monster's later turn, not its contact
        hits=[r for r in L[i0:i1] if r[0]=='show' and r[1] in('hit','heal','dmg','miss')]
        if arms and arms[0][6] is not None: hits=[h for h in hits if h[2]-acts[0][2]<=arms[0][6]-acts[0][2]+1.0]   # the move's own beats only: a monster's reply a turn later is not its contact
        gap=min(abs(h[2]-arms[0][6]) for h in hits) if arms and hits and arms[0][6] is not None else None
        built=[a for a in want if a in {r[1] for r in fx}]
        ok=bool(arms) and bool(built) and (gap is None or gap<=0.3)
        need(ok,f"{tag} {who} {n} ({mid}): {len(want)} library effects named, {len(built)} drawn, armed {len(arms)} ({','.join(sorted({a[1] for a in arms}))}), hit to contact gap {gap}")
        if not ok and os.environ.get('DEBUG'): print('   DEBUG',[r for r in L if r[0] in('show','arm')])
        if ok: good+=1
    return played,good
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--no-sandbox']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    elif os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&typeof GT!=="undefined"&&GT.loaded',timeout=180000); pg.wait_for_timeout(1500)
    man=json.load(open(os.path.join(ROOT,'data/guide-manifest.json'),encoding='utf-8'))
    fights=[a for a in sys.argv[1:] if not a.startswith('-')] or ['new1','new10','new9','new8']
    # 1. layers
    start(pg,'new1'); pg.evaluate(PREP)
    o=pg.evaluate(LAYERS); ord_=o['ord']; print('draw order:',' '.join(ord_))
    ix=lambda s:[i for i,v in enumerate(ord_) if v==s]
    f_first=min(ix('foe')+ix('member')) if ix('foe')+ix('member') else -1; m_last=max(ix('member')) if ix('member') else -1
    need(len(ix('fx:ground_decal'))==1 and len(ix('fx:behind_units'))==1 and len(ix('fx:unit_overlay'))>=1 and len(ix('fx:foreground_sweep'))==1 and len(ix('fx:screen_lighting'))==1 and o['faults']==0,f"each layer's effect drew in the frame, no fault: {o}")
    need(ix('fx:ground_decal')[0]<ix('fx:behind_units')[0]<f_first,'ground_decal then behind_units, both before the first unit is drawn')
    need(m_last<ix('fx:unit_overlay')[0]<ix('fx:foreground_sweep')[0]<ix('fx:screen_lighting')[0],'unit_overlay after the last unit, then foreground_sweep, then screen_lighting last')
    need(ix('foe') and ix('member') and max(ix('foe'))<min(ix('member')),'foes are drawn before the family (the order the fight always had)')
    # layer frames for the sheet: one frame per layer, drawn alone
    lf=[]
    for L,id_ in [('ground_decal','proj_ground_hazard_mat'),('behind_units','setpiece_3tier_sparkler_cake'),('unit_overlay','vfx_core_clobber_impact'),('foreground_sweep','vfx_core_sizzle_wave'),('screen_lighting','setpiece_broadway_spotlights')]:
        pg.evaluate("""([id,src])=>{ const L=P1_VFX_MS[id],len=typeof L==='function'?L(null):(L||500); B7.speed=1; B3V.cues.length=0; B3V.cues.push({M:{impact_ms:0,vfx:[id],fxp:null},id:'l',src:B3.F.party[0].key,tgts:['f0'],t0:B3P.t-len*.00045,end:B3P.t+30,dead:{}}); }""",[id_,0])
        pg.wait_for_timeout(60); lf.append(canvas(pg,False)); pg.evaluate("()=>{ B3V.cues.length=0; B7.speed=2; }")
    sheet(lf,5,os.path.join(OUT,'b3-vfx-layers.png'),w=360)
    # 2. every manifest move, swept
    r=pg.evaluate(SWEEP,man); rows=r['rows']
    bad=[x for x in rows if x.get('err') or x.get('missing') or x.get('dead')]
    need(len(rows)>=119 and not bad and r['faults']==0 and r['transform'],f"all {len(rows)} moves that name a library effect draw every effect in a real b3Draw, none throws, the canvas is left as it was (bad: {bad[:3]}, faults {r['faults']}, transform {r['transform']})")
    # 3. played by hand, portrait and landscape
    pf=[]; lf2=[]
    for k,fid in enumerate(fights):
        res=play_all(pg,fid,False,pf); p,g=judge(res,man,fid+' portrait'); print(fid,'portrait: played',p,'moves,',g,'with their effects right')
        need(p>=8,f'{fid}: moves were played ({p})')
    pg.evaluate("()=>{ b3LabReset(); }"); pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(500)
    res=play_all(pg,fights[0],True,lf2); p,g=judge(res,man,fights[0]+' landscape'); print(fights[0],'landscape: played',p,'moves,',g,'with their effects right')
    sheet([f for _,f in pf],4,os.path.join(OUT,'b3-vfx-portrait.png'),w=380); sheet([f for _,f in lf2],4,os.path.join(OUT,'b3-vfx-landscape.png'),w=380)
    pg.evaluate("()=>{ toggleLayout(); B7.speed=1; }"); pg.wait_for_timeout(400)
    # 4. a fight never breaks
    start(pg,'new1'); pg.evaluate(PREP); pg.evaluate(INSTR)
    pg.evaluate("""()=>{ window.__faults=[]; const f=P1_VFX.vfx_core_clobber_impact; window.__real=f; P1_VFX.vfx_core_clobber_impact=function(g){ g.save(); g.beginPath(); g.rect(0,0,10,10); g.clip(); g.translate(300,300); g.globalAlpha=.1; throw new Error('effect boom'); }; window.__tr=fightCtx.getTransform(); }""")
    who=pg.evaluate("()=>B3.actor.id")
    pg.keyboard.press('Enter'); pg.wait_for_timeout(400)
    for k in range(120):
        if pg.evaluate("()=>window.__LE.battle.state==='command'&&B3.ui==='deck'&&B3.F.turnLog.length>=2") : break
        pg.wait_for_timeout(250)
    st=pg.evaluate("""()=>{ const tr=fightCtx.getTransform(),o=window.__tr; fightCtx.save(); const clipOk=(()=>{ fightCtx.setTransform(1,0,0,1,0,0); fightCtx.fillStyle='#f0f'; fightCtx.fillRect(100,100,5,5); const d=fightCtx.getImageData(100,100,1,1).data; return d[0]===255&&d[2]===255; })(); fightCtx.restore();
      return {turns:B3.F.turnLog.length,ui:B3.ui,fault:(window.__faults||[]).map(f=>f.where),same:[tr.a,tr.b,tr.c,tr.d,tr.e,tr.f].join()===[o.a,o.b,o.c,o.d,o.e,o.f].join(),alpha:fightCtx.globalAlpha,clipOk}; }""")
    print('throwing effect:',st)
    need(st['turns']>=2 and st['ui']=='deck','a fight goes on after an effect throws (turns '+str(st['turns'])+', ui '+st['ui']+')')
    need(st['fault'].count('effect vfx_core_clobber_impact')==1,f"the fault is logged once: {st['fault']}")
    need(st['same'] and st['alpha']==1 and st['clipOk'],f"the canvas is put back after a throw (same transform {st['same']}, alpha {st['alpha']}, no leftover clip {st['clipOk']})")
    # a cue whose unit is gone, and a move that names an effect nobody built
    v=pg.evaluate("""()=>{ window.__faults=[]; const f0=B3V.fault; B3V.cues.length=0; B3V.cues.push({M:{impact_ms:0,vfx:['vfx_core_clobber_impact'],fxp:null},id:'g',src:'nobody',tgts:['nobody'],t0:B3P.t,end:B3P.t+9,dead:{}}); b3Draw(); const gone=B3V.cues.length,gf=B3V.fault-f0;
      const key=B3.F.foes[0].key,box=B3P.foe[key]; B3P.foe[key]={}; B3V.cues.push({M:{impact_ms:0,vfx:['vfx_core_clobber_impact'],fxp:null},id:'g2',src:B3.F.party[0].key,tgts:[key],t0:B3P.t,end:B3P.t+9,dead:{}}); let thr1=null; try{ b3vDraw('unit_overlay',B3P.t); b3vDraw('unit_overlay',B3P.t); }catch(e){ thr1=e.message; } B3P.foe[key]=box; const broke=B3V.cues.length,bf=B3V.fault-f0;
      B3V.cues.length=0; const head={t:'act',id:'rose_x',src:B3.F.party[0].key,tgts:['f0']}; const arm=b3vArm(head,null,1); const none=B3V.cues.length;
      const M={impact_ms:0,vfx:['vfx_nobody_built'],fxp:null}; B3V.cues.push({M,id:'n',src:B3.F.party[0].key,tgts:['f0'],t0:B3P.t,end:B3P.t+9,dead:{}}); let thrown=null; try{ b3Draw(); }catch(e){ thrown=e.message; }
      B3V.cues.length=0; return {gone,gf,broke,bf,thr1,arm,none,thrown,faults:(window.__faults||[]).map(f=>f.where)}; }""")
    print('gone unit / broken cue / unbuilt effect:',v)
    need(v['gone']==0 and v['gf']==0,f"a cue whose targets are all gone is dropped without a fault ({v})")
    need(v['broke']==0 and v['bf']==1 and v['thr1'] is None and v['faults'].count('effects')==1,f"a cue that cannot be drawn (a foe whose art is broken) is dropped, logged once, and nothing is thrown ({v})")
    need(v['arm'] is False and v['none']==0,'a move the manifest does not name arms nothing')
    need(v['thrown'] is None,'a move that names an effect nobody built draws nothing and does not throw')
    pg.evaluate("()=>{ P1_VFX.vfx_core_clobber_impact=window.__real; }")
    e=errors(errs); need(not e,f'no page errors: {e[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
