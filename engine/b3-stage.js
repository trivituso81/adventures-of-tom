'use strict';
// engine/b3-stage.js: the stage layer of a move (movestage2, plan claude/move-staging-plan.md). movebench8: the steps, lasting things, set piece, objects, marks and budget come from the move's spec (engine/b3-spec.js msStageRow).
// A move has three layers: BODY (the baked video of the person acting, engine/b3-clips.js), STAGE (what this file draws across the battlefield from the
// row, timed to marks on the body clip) and, for a Capstone, a SET PIECE (the row's `setpiece`: dim, the stage fills the screen, restore).
// Drawing and timing only: nothing here changes the fight (Battle 3 resolved the whole result before this plays). A move whose row exists but whose body clip or
// assets are not ready plays what the move plays today (b3PlayMove). Times in a row are seconds at 1x on the BATTLE CLOCK: B3_TEMPO is not applied.
// The only stage actions are those of plan 4.1: fly hover drop cross rain surround place pop words foe shake flash dim glow sfx. No move has code of its own.
// Assets (data/stage/*.js, baked by tools/clip-bake/bake_stage.py) are lazy atlases named clip_stage_<owner>-<name>: they are asked for through B3C.need like a clip,
// so they count toward the clip memory limit (b3cLoaded) and are released with the clips.
// Field: the monsters stand on the LEFT, the party on the right; a fighter faces left.
const B3G={stand:{},A:{},els:[],ins:[],words:[],dim:{from:0,to:0,t0:0,dur:0},shake:null,glows:[],run:null,hits:0};
const B3G_KEEP=9000;   // ms an asset stays wanted after it was last asked for

// The baked stage assets (data/stage/*.js, written by tools/clip-bake/bake_stage.py) call b3gDefine; those files load right after this one (index.html).
const B3G_DATA={};
function b3gDefine(key,D){ B3G_DATA[key]=D; b3gRegister(key,D); }
// One stage asset (a data/stage/*.js file calls b3gDefine; the tests register their own through this).
function b3gRegister(key,D) {
  const fk=key.replace('/','-'),rects={}; D.rects.forEach((r,i)=>{ rects[i]=r; });
  B3G.A[key]={key,fk,D,atlas:paintedAtlas('clip_stage_'+fk,D.src,rects,1)};
}

const b3gAssetsOf=R=>Object.keys(R.assets||{});
// movebench2: cfg.bench is set only by the Move Workbench preview fight (engine/b3-bench.js). There, a row whose body video is not made yet plays its stage steps,
// effects, freeze, shake and sounds over the mover's idle video, and the pictures of its marks fall at 24 pictures a second inside its budget. The game never sets it.
const b3gBench=()=>!!(typeof B3!=='undefined'&&B3.active&&B3.cfg&&B3.cfg.bench);
const b3gNoVideo=R=>!!(R&&R.body&&(R.nobody||(!BCLIPS[R.body.clip]&&b3gBench())));   // movebench15: a row with no body at all (the Family Ruckus, R.nobody) always plays on the stand-in, in the game too
// The stand-in for the missing clip: as long as the row's budget, with a picture every 1/24 s (a mark {pic:n} is n/24 s, never past 95% of the budget).
function b3gStandIn(R) {
  const key=R.body.clip+'|'+(R.budget||3); if(B3G.stand[key]) return B3G.stand[key];
  const dur=Math.round((R.budget||3)*1000),n=Math.max(2,Math.round(dur/1000*24)),ms=[]; for(let i=0;i<n;i++) ms.push(Math.min(i*1000/24,dur*.95));
  return B3G.stand[key]={id:null,dur,n,ms,standIn:true};
}
const b3gClipOf=R=>BCLIPS[R.body.clip]?b3cTrimmed(BCLIPS[R.body.clip],R.body.trim):(b3gNoVideo(R)?b3gStandIn(R):null);   // movebench12: a spec's trim
// A row is usable when its body clip and every asset are baked into this build (otherwise the move plays what it plays today).
// movebench10: in the workbench preview only (cfg.pink, set by engine/b3-bench.js; never by the game or the golden recorder) an object with no baked picture is a pink dashed box of its size, so a row whose picture is
// not made yet still plays its stage. The game plays a row only when every picture is baked, as before.
const b3gPink=()=>!!(typeof B3!=='undefined'&&B3.active&&B3.cfg&&B3.cfg.pink);
const b3gDefined=R=>!!(R&&R.body&&(R.nobody?(b3gPink()||b3gAssetsOf(R).every(k=>B3G.A[k])):((BCLIPS[R.body.clip]&&(b3gPink()||b3gAssetsOf(R).every(k=>B3G.A[k])))||b3gNoVideo(R))));
function b3gWarm(R) {
  b3cWant(R.body.clip,B3G_KEEP);
  for(const k of b3gAssetsOf(R)) if(B3G.A[k]) B3C.need.set('stage_'+B3G.A[k].fk,performance.now()+B3G_KEEP);
}
// The move is over: its video and pictures are no longer asked for, so paintedTick lets them go 3 s later (a phone holds about 16 clip pictures; the next move's own are loading by then).
// A lasting element that is still on screen asks again every frame (b3gWarmDef), so it keeps what it draws.
function b3gLetGo(R) { B3C.need.delete(R.body.clip); for(const k of b3gAssetsOf(R)) if(B3G.A[k]) B3C.need.delete('stage_'+B3G.A[k].fk); }
const b3gReady=R=>b3gDefined(R)&&(b3gNoVideo(R)||b3gPink()?b3gAssetsOf(R).every(k=>!B3G.A[k]||B3G.A[k].atlas.ready)&&(b3gNoVideo(R)||b3cReady(R.body.clip)):b3cReady(R.body.clip)&&b3gAssetsOf(R).every(k=>B3G.A[k].atlas.ready));
// The row of the move or attack this `act` beat plays, or null (a move or attack with no stage in its spec, a row that is not baked yet). movebench14: a monster's attack has one too, from its spec 'act:<monster>:<attack>'.
function b3gRowFor(head) {
  if(!head||(head.t!=='act'&&head.t!=='ruckusSpend')||!head.id||!head.src) return null;   // movebench15: the Family Ruckus spend beat (a head made by b3RuckusHead in engine/b3-play.js) has a row too
  const id=msIdOf(head),R=id?msStageRow(id):null; return R&&b3gDefined(R)?R:null;
}

// ---------- time and place ----------
const b3gEase=q=>{ q=Math.max(0,Math.min(1,q)); return q*q*(3-2*q); };
function b3gMarkMs(R,CL,name) { const m=R.body.marks&&R.body.marks[name]; if(!m) return null; return m.pic!=null?(CL.ms[Math.max(0,Math.min(CL.n-1,m.pic-(CL.trimmed?CL.trimmed.from:0)))]||0):m.f!=null?m.f*CL.dur:m.ms!=null?m.ms:null; }
// Seconds from the start of the move for an `at`: a number, a mark name, a step id, {mark,plus} or {step,plus}.
function b3gAt(R,CL,at,ids) {
  if(typeof at==='number') return at;
  if(typeof at==='string') { if(ids[at]!=null) return ids[at]; const m=b3gMarkMs(R,CL,at); return m==null?0:m/1000; }
  if(at&&at.mark) return (b3gMarkMs(R,CL,at.mark)||0)/1000+(at.plus||0);
  if(at&&at.step) return (ids[at.step]||0)+(at.plus||0);
  if(at&&at.hit) return (ids.$hit||0)+(at.plus||0);   // movebench9: the hit as the move's own timing names it (a mark, or the clip's hit picture), so a step that follows the hit moves with it
  return 0;
}
// movebench14: a monster's attack plays a stage too. It stands on the left and faces right, so everything that is "in front of", "behind", "at the hand", "the other side" or "the way across" is mirrored for it: b3gIsFoe, b3gHomeOf, b3gDir.
const b3gIsFoe=key=>!!key&&key[0]==='f';
function b3gH(key) { const u=b3Unit(B3.F,key); if(u.side==='foe'&&B3P.foe[key]) return b3FoeBox(key).h; const sp=BATTLE_SPRITES[u.id]; return sp?sp.idle.length*sp.scale:60; }
const b3gHome=key=>b3PartyHome(b3Unit(B3.F,key));
// Where a unit stands and which way it faces: {cx, base, sc, dir}; dir is 1 for a family member (faces left, toward the monsters) and -1 for a monster (faces right), so `cx - 38*dir` is in front of either.
function b3gHomeOf(key) {
  if(b3gIsFoe(key)&&B3P.foe[key]) { const b=b3FoeBox(key); return {cx:b.x,base:B3P.foe[key].py,sc:B3P.foe[key].sc,dir:-1}; }
  const h=b3gHome(key),sp=BATTLE_SPRITES[b3Unit(B3.F,key).id]||{scale:1}; return {cx:h.cx,base:h.base,sc:sp.scale,dir:1};
}
const b3gDir=key=>b3gIsFoe(key)?-1:1;
// The other units on the mover's side that are up: family members for a family member, standing monsters for a monster.
function b3gAllies(src) {
  if(b3gIsFoe(src)) return B3.F.foes.filter(f=>f.key!==src&&B3P.foe[f.key]&&!B3.view.u[f.key].ko).map(f=>f.key);
  return B3.F.party.filter(u=>u.key!==src&&!B3.view.u[u.key].ko).map(u=>u.key);
}
// The units the mover is against: the monsters that are standing for a family member, the family members who are up for a monster.
function b3gOpponents(src) {
  if(b3gIsFoe(src)) return B3.F.party.filter(u=>!B3.view.u[u.key].ko).map(u=>u.key);
  return b3gLiveFoes();
}
const b3gFoeBase=key=>{ const L=B3P.foe[key]; return L?L.py:250; };
function b3gLiveFoes() { return B3.F.foes.filter(f=>B3P.foe[f.key]&&!B3.view.u[f.key].ko&&B3P.fa[f.key]&&B3P.fa[f.key].die==null).map(f=>f.key); }
// One anchor as a list of {x,y}. ctx: {src, tgts, attacker, carrier, CL, R}.
function b3gPts(name,ctx) {
  const src=ctx.src,out=[],one=(x,y)=>[{x,y}],fm=b3gIsFoe(src);
  if(fm) name={screen_left:'screen_right',screen_right:'screen_left'}[name]||name;   // movebench14: a monster crosses toward the family, the other way
  const sp=k=>b3Spot(k);
  const front=()=>{
    if(fm) { const ks=b3gOpponents(src); let l=1e9,y=0; for(const k of ks) { const z=b3Spot(k); l=Math.min(l,z.x); y+=z.base; } return {x:Math.max(156,(ks.length?l:360)-70),y:ks.length?y/ks.length-30:230}; }   // the family's front: its left edge, mirrored from the monsters' right edge
    const ks=b3gLiveFoes(); let r=0,y=0; for(const k of ks) { const b=b3FoeBox(k); r=Math.max(r,b.x+b.w*.5); y+=b.y; } return {x:Math.min(420,r+70),y:ks.length?y/ks.length-30:230}; };
  switch(name) {
    case 'self': { const s=sp(src); return one(s.x,s.y); }
    case 'self_front': { const h=b3gHomeOf(src); return one(h.cx-38*h.dir,h.base-12); }
    case 'above_self': { const s=sp(src); return one(s.x,s.top-26); }
    case 'hand': { const h=b3gHomeOf(src),sc=h.sc,hd=(ctx.R.body.hand)||[16,.5*b3gH(src)/sc]; return one(h.cx-hd[0]*sc*h.dir,h.base-hd[1]*sc); }
    case 'target': return (ctx.tgts||[]).slice(0,1).map(k=>{ const s=sp(k); return {x:s.x,y:s.y}; });
    case 'each_target': return (ctx.tgts||[]).map(k=>{ const s=sp(k); return {x:s.x,y:s.y}; });
    case 'above_target': return (ctx.tgts||[]).slice(0,1).map(k=>{ const s=sp(k); return {x:s.x,y:s.top-30}; });
    case 'attacker': return ctx.attacker?(k=>{ const s=sp(k); return one(s.x,s.y); })(ctx.attacker):[];
    case 'carrier': return ctx.carrier?(k=>{ const s=sp(k); return one(s.x,s.y); })(ctx.carrier):[];
    case 'above_carrier': return ctx.carrier?(k=>{ const s=sp(k); return one(s.x,s.top-26); })(ctx.carrier):[];
    case 'ally': case 'each_ally': return b3gAllies(src).map(k=>{ const s=sp(k); return {x:s.x,y:s.y}; }).slice(0,name==='ally'?1:9);
    case 'foes_front': return one(front().x,front().y);
    case 'screen_center': return one(288,162);
    case 'screen_left': return one(-70,162);
    case 'screen_right': return one(650,162);
    case 'top': return one(b3gHomeOf(src).cx,-50);
    case 'floor': return one(288,300);
    default: return [];
  }
}
const b3gPt=(name,ctx)=>(b3gPts(name,ctx)[0]||{x:288,y:162});
// The units an anchor names (movebench10: who a placed, floating or surrounding object belongs to).
function b3gKeysOf(name,ctx) {
  const n=String(name||'self').replace(/^above_/,''),others=()=>b3gAllies(ctx.src);
  switch(n) {
    case 'self': return [ctx.src];
    case 'target': return (ctx.tgts||[]).slice(0,1);
    case 'each_target': return (ctx.tgts||[]).slice();
    case 'attacker': return ctx.attacker?[ctx.attacker]:[];
    case 'carrier': return ctx.carrier?[ctx.carrier]:[];
    case 'ally': return others().slice(0,1);
    case 'each_ally': return others();
    default: return [ctx.src];
  }
}
// Where a `words` sits: 'over:<anchor>' is above it, anything else is the anchor itself.
function b3gWordsAt(where,ctx) {
  const m=/^over:(.+)$/.exec(where||'screen_center'),out=[];
  for(const p of b3gPts(m?m[1]:where,ctx)) out.push({x:p.x,y:m?(m[1]==='target'||m[1]==='attacker'||m[1]==='carrier'||m[1]==='each_ally'||m[1]==='self'?p.y-b3gH(ctx.src)*(m[1]==='self'||m[1]==='each_ally'?.6:.9):p.y-26):p.y});
  return out;
}
function b3gLane(lane,ctx) { return lane==='floor'?300:lane==='mid'?250:lane==='foes'?(()=>{ const ks=b3gOpponents(ctx.src); return ks.length?ks.reduce((s,k)=>s+(b3gIsFoe(k)?b3gFoeBase(k):b3Spot(k).base),0)/ks.length-30:230; })():250; }

// ---------- sizes and drawing ----------
function b3gSize(key,spec,ctx) {   // {h: share of the mover's standing height} or {sw: share of the screen width}
  const A=B3G.A[key],D=A&&A.D; if(!D&&!b3gPink()) return {w:0,h:0};
  const s=spec||{h:.3}; let h,w;   // movebench10: a pink box (no picture yet) is square
  if(s.sw!=null) { w=s.sw*576; h=D?w*D.h/D.w:w; } else { h=(s.h||.3)*b3gH(ctx.src); w=D?h*D.w/D.h:h; }
  return {w,h};
}
function b3gFrameAt(A,ms) { const D=A.D; if(D.n<2) return 0; const L=D.dur||1; const t=D.loop?ms%L:Math.max(0,Math.min(ms,D.dur-1)); let i=0; while(i<D.n-1&&t>=D.ms[i+1]) i++; return i; }
// Draw one asset centred at x,y at the size, frame by time (ms into its video). o: {blend,alpha,flip,rot,sq}
function b3gDraw1(key,x,y,sz,ms,o) {
  const A=B3G.A[key]; if(!A||!A.atlas.ready||!A.atlas.img) return false;
  A.atlas.used=performance.now();
  const D=A.D,R=D.rects[b3gFrameAt(A,ms)],sx=sz.w/D.w,sy=sz.h/D.h;
  gfx.save(); gfx.translate(x,y); if(o&&o.rot) gfx.rotate(o.rot); if(o&&o.flip) gfx.scale(-1,1);
  if(o&&o.sq) gfx.scale(1,o.sq);
  gfx.globalAlpha=Math.max(0,Math.min(1,o&&o.alpha!=null?o.alpha:1));
  if(o&&o.blend==='add') gfx.globalCompositeOperation='lighter';
  gfx.drawImage(A.atlas.img,R[0],R[1],R[2],R[3],-sz.w/2+R[4]*sx,-sz.h/2+R[5]*sy,R[2]*sx,R[3]*sy);
  gfx.restore(); return true;
}

// ---------- stage actions ----------
// Each action is run at a moment (b3gDo) with the move's context and pushes what to draw (B3G.ins) or changes the screen (dim, shake, flash).
function b3gDo(a,ctx,t0) {
  const R=ctx.R,now=B3P.t;
  const push=o=>{ B3G.ins.push(Object.assign({t0:t0==null?now:t0,key:null},o)); };
  switch(a.do) {
    case 'sfx': b3Sfx(a.sfx); break;
    case 'shake': B3G.shake={t0:now,dur:a.dur||.3,amp:a.amp||3}; break;
    case 'flash':
      if(a.on==='carrier'&&ctx.carrier) B3G.glows.push({key:ctx.carrier,t0:now,dur:a.dur||.3,color:a.color||'#ffffff'});
      else B3P.flash={t0:now,dur:a.dur||.3,color:a.color||'#ffffff',a:.55};
      break;
    case 'dim': { const cur=b3gDimAt(now); B3G.dim={from:cur,to:a.amount||0,t0:now,dur:Math.max(.01,a.in||a.out||.3)}; break; }
    case 'glow': { const ks=a.on==='self'?[ctx.src]:a.on==='carrier'&&ctx.carrier?[ctx.carrier]:[ctx.src]; for(const k of ks) B3G.glows.push({key:k,t0:now,dur:a.dur||1,color:a.color||'#ffd27a'}); break; }
    case 'words': {
      const where=b3gWordsAt(a.where,ctx); const sc=a.size||2;
      if(a.glyphs) { const p=where[0]||{x:288,y:162}; B3G.words.push({glyphs:a.glyphs,x:p.x,y:p.y,sc,color:a.color||'#fff1cb',t0:now,each:a.each||.2,hold:a.hold||.6}); }
      else for(const p of where) B3G.words.push({text:a.text,x:p.x,y:p.y,sc,color:a.color||'#fff1cb',t0:now,hold:a.hold||1});
      break; }
    case 'foe': { const ks=a.on==='attacker'&&ctx.attacker?[ctx.attacker]:a.on==='carrier'&&ctx.carrier?[ctx.carrier]:(ctx.tgts||[]).filter(k=>k[0]==='f'); const aim=ctx.attacker&&!ks.length?[ctx.attacker]:ks;
      for(const k of aim) if(B3P.fa[k]) B3P.fa[k].stage={t0:now,dur:a.react==='squash'?.5:.55,kind:a.react||'knock',px:a.px||14}; break; }
    case 'pop': {
      const pts=a.on==='floor'?[{x:288,y:300}]:b3gPts(a.on,ctx),sz=k=>b3gSize(a.asset,R.assets[a.asset].size,ctx);
      for(const p of pts) push({kind:'pop',asset:a.asset,name:(R.assets[a.asset]||{}).name,x:p.x,y:p.y,dur:a.hold||.8,blend:a.blend,size:sz()}); break; }
    case 'place': case 'hover': case 'surround': {   // movebench10: the three lasting actions as timed steps: the object stands in front of, floats over or closes around each one for `hold` seconds
      const asset=a.asset; if(!asset||!R.assets[asset]) break;
      const sz=b3gSize(asset,R.assets[asset].size,ctx);
      for(const k of b3gKeysOf(a.on||'self',ctx)) push({kind:a.do,asset,name:R.assets[asset].name,key:k,dur:a.hold||2,size:sz,pair:!!a.pair,blend:a.blend});
      break; }
    case 'fly': case 'drop': case 'cross': {
      const asset=a.asset||(ctx.el&&ctx.el.L.asset); if(!asset||!R.assets[asset]) break;
      const fromP=a.do==='drop'?null:b3gPt(a.from||'self',ctx),toName=a.to||a.onto,toP=b3gPt(toName,ctx);
      const sz=b3gSize(asset,R.assets[asset].size,ctx);
      let from,to;
      if(a.do==='drop') { to=b3gPt(a.onto,ctx); from={x:to.x,y:-60}; }
      else if(a.do==='cross') {
        const y=a.lane?b3gLane(a.lane,ctx):b3gPt(a.from,ctx).y; const f=b3gPt(a.from||'screen_right',ctx),tt=b3gPt(a.stop||a.to||'screen_left',ctx);
        from={x:f.x,y}; to={x:tt.x,y}; }
      else { from=fromP; to=toP; if(toName==='top') to={x:from.x,y:-60}; }
      const o={kind:a.do,asset,name:(R.assets[asset]||{}).name,from,to,dur:a.dur||.4,arc:a.arc||0,spin:a.spin||0,blend:a.blend,size:sz,back:a.back||null,skid:a.skid||0,id:a.id};
      if(a.back===true) o.back={to:a.from||'self_front'}; else if(a.back&&a.back.to) o.back={to:a.back.to,at:a.back.at};
      if(a.hide&&ctx.el) ctx.el.hideUntil=now+(a.dur||.4)*(o.back?2:1)+.2;
      if(o.back) { o.backTo=b3gPt(o.back.to,ctx);
        if(o.back.at!=null&&ctx.ids) o.hold=Math.max(0,b3gAt(R,ctx.CL,o.back.at,ctx.ids)-(ctx.stepT||0)-o.dur); }   // the thing waits where it landed until the mark (a catch)
      push(o); break; }
    case 'rain': {
      const ks=b3gOpponents(ctx.src),n=a.n||12,dur=a.dur||2,list=a.assets||[a.asset];
      const xs=ks.map(k=>b3Spot(k).x),x0=Math.min.apply(null,xs.concat([300]))-60,x1=Math.max.apply(null,xs.concat([200]))+60;
      for(let i=0;i<n;i++) { const k=ks.length?ks[i%ks.length]:null,tx=k?b3Spot(k).x+(Math.random()-.5)*40:x0+(x1-x0)*Math.random(),ty=k?b3Spot(k).y+(Math.random()-.5)*30:230,asset=list[i%list.length];
        if(!R.assets[asset]) continue;
        push({kind:'fall',asset,name:(R.assets[asset]||{}).name,from:{x:tx+60,y:-70},to:{x:tx,y:ty},t0:now+(dur*.7)*i/n,dur:dur*.3+.15,blend:a.blend,size:b3gSize(asset,R.assets[asset].size,ctx),burst:true}); }
      break; }
    default: break;
  }
}
function b3gDimAt(t) { const d=B3G.dim; if(!d.dur) return d.to; return d.from+(d.to-d.from)*b3gEase((t-d.t0)/d.dur); }
function b3gShakeAt(t) { const s=B3G.shake; if(!s) return null; const q=(t-s.t0)/s.dur; if(q>=1) { B3G.shake=null; return null; } const k=s.amp*(1-q); return {x:Math.round((Math.random()-.5)*2*k),y:Math.round((Math.random()-.5)*2*k)}; }
// A monster pushed back (knock) or squashed (squash) by the stage: b3DrawFoe adds this to where it stands.
function b3gFoeOffset(key,t) {
  const A=B3P.fa[key],S=A&&A.stage; if(!S) return null;
  const q=(t-S.t0)/S.dur; if(q>=1) { A.stage=null; return null; }
  if(S.kind==='squash') return {dx:0,dy:0,sq:1-.35*Math.sin(Math.PI*Math.min(1,q))};
  return {dx:-S.px*Math.sin(Math.PI*Math.min(1,q)*.5+(q>.5?Math.PI*.5*(q-.5)*0:0))*(q<.5?1:2*(1-q)),dy:0,sq:1};
}

// ---------- playing a move's row (b3PlayMove hands over here) ----------
// env: the pieces of b3PlayMove: head, hits, late, reveal, finishNow, cue (arms the move's library effects). Returns true when the row plays the move.
function b3gPlay(R,env) {
  const head=env.head,src=head.src,CL=b3gClipOf(R),standIn=!!CL.standIn,fm=b3gIsFoe(src),home=fm?null:b3gHome(src),dur=CL.dur/1000,now=B3P.t;
  const tg0=env.hits.length?env.hits[0].swing.tgts:head.tgts||[];
  const ctx={R,CL,src,tgts:tg0.length?tg0:(head.tgts||[]),attacker:null,carrier:null};
  // BODY: the clip plays where the fighter stands, on the clip's own clock.
  if(!standIn) { if(fm) B3P.fa[src].cl={id:R.body.clip,C:CL,t0:now,dur}; else B3P.body[src]={kind:'cmove',t0:now,T0:0,jx:home.cx,jy:home.base,C:CL,back:0,dur:dur+.12}; }   // a stand-in leaves the mover on the idle video; a monster plays it where it stands (movebench14)
  // STAGE: the steps of the row and, for a Capstone, of its set piece, each at its moment.
  const ids={},steps=[].concat(R.steps||[],R.setpiece?R.setpiece.steps:[]);
  const marks={}; for(const m in (R.body.marks||{})) marks[m]=(b3gMarkMs(R,CL,m)||0)/1000;
  // movebench9: where `at:{hit:true}` lands. A hit named by a mark is that mark; a row that names none (a move whose spec has steps but leaves the contact automatic) hits where its clip does.
  const hitName0=R.hit==='late'?R.late:R.hit; let hit0=null;
  if(hitName0&&marks[hitName0]!=null) hit0=marks[hitName0]; else if(!hitName0) { try { hit0=b3cLandAt(CL,msTiming(head)); } catch(e) { hit0=null; } }
  if(hit0!=null) ids.$hit=hit0;
  let hitT=null,lastEnd=dur;
  for(const s of steps) { const T=b3gAt(R,CL,s.at,ids); if(s.id) ids[s.id]=T; s._T=T; lastEnd=Math.max(lastEnd,T+(s.dur||s.hold||0)); }
  const hitName=R.hit;
  if(hitName&&hitName!=='late') hitT=ids[hitName]!=null?ids[hitName]:(marks[hitName]!=null?marks[hitName]:null);
  for(const s of steps) { if(s.hit===true&&hitT==null) hitT=s._T+(s.dur||0); if(s.hit==='first'&&hitT==null) hitT=s._T+(s.dur||2)*.35; }
  // A step that carries the hit refines a hit named by its id: a thing that lands (hit:true) hits at its end; a rain (hit:'first') when the first thing lands.
  for(const s of steps) if(s.id&&s.id===hitName&&hitT!=null) { if(s.hit===true) hitT=s._T+(s.dur||0); else if(s.hit==='first') hitT=s._T+(s.dur||2)*.3+.15; }
  const lateT=!hitName&&hit0!=null?hit0:b3gAt(R,CL,(hitName==='late'?R.late:hitName)||0,ids);
  if(hitT==null) hitT=lateT;
  const run=B3G.run={id:head.id,t0:now,hitAt:env.hits.length?hitT:lateT,hitReal:null,marks,ids:Object.assign({},ids),setpiece:!!R.setpiece,budget:R.budget,end:null,len:null,noVideo:standIn&&!R.nobody,clipSec:dur};
  ctx.ids=ids;
  if(env.cue) env.cue(env.hits.length?hitT:lateT);   // vfxfight1: the move's library effects play from the hit's moment (engine/b3-vfx.js)
  for(const s of steps) { b3After(s._T,()=>{ ctx.stepT=s._T; b3gDo(s,ctx); }); }
  // THE HIT (or, for a move with no hit, its effects) shows at its moment.
  const reveal=env.reveal,mark=()=>{ if(run.hitReal==null) run.hitReal=B3P.t-run.t0; };
  const gap=msTiming(head).gap;   // movebench4: the time between hits of a many-hit move is the spec's `gap`
  if(env.hits.length) env.hits.forEach((h,k)=>b3After(hitT+k*gap,()=>{ mark(); reveal(); }));
  else b3After(lateT,()=>{ mark(); for(const b of env.late) b3Show(b); });
  const end=Math.max(dur+.1,lastEnd+.15,(env.hits.length?hitT+Math.max(0,env.hits.length-1)*gap:lateT)+.3,R.setpiece?R.setpiece.dur:0);
  run.len=end;
  b3After(end,()=>{ run.end=B3P.t-run.t0; b3gLetGo(R); env.finishNow(); });
  return true;
}

// ---------- lasting elements: tied to the view's statuses ----------
// An element exists exactly while a unit's status (vu.st) names it. The status beat's show gives it its entrance; a statusEnd gives it its exit; a react or an
// intercept beat sets off its `then`. Reconciled every frame, so a fight that starts with the status on shows it too.
function b3gLastingDefs() { const out=[]; for(const sid of msStagedIds()) { const R=msStageRow(sid),id=sid.slice(5); if(R&&R.lasting&&b3gDefined(R)) for(const L of R.lasting) out.push({id,R,L}); } return out; }
function b3gCarriers(def) {
  const F=B3.F,V=B3.view,out=[];
  for(const u of F.units) { const vu=V.u[u.key]; if(vu&&!vu.ko&&vu.st.includes(def.L.while)) out.push(u.key); }
  return out;
}
function b3gReconcile(t) {
  if(!B3.active||!B3.F||!B3.view) { B3G.els.length=0; return; }
  const defs=b3gLastingDefs(),want=[];
  for(const def of defs) for(const key of b3gCarriers(def)) want.push({def,key});
  for(const e of B3G.els) b3gWarmDef(e.def);
  for(const w of want) { let e=B3G.els.find(x=>x.def.id===w.def.id&&x.def.L.while===w.def.L.while&&x.key===w.key&&!x.leaving);
    if(!e) { b3gWarmDef(w.def); e={def:w.def,L:w.def.L,key:w.key,t0:t,leaving:null,hideUntil:0}; B3G.els.push(e); } }
  for(const e of B3G.els) if(!e.leaving&&!want.some(w=>w.def.id===e.def.id&&w.def.L.while===e.L.while&&w.key===e.key)) e.leaving={t0:t,dur:(e.L.exit&&e.L.exit.dur)||.35};
  B3G.els=B3G.els.filter(e=>!e.leaving||t-e.leaving.t0<e.leaving.dur+.05);
}
function b3gWarmDef(def) { for(const k of b3gAssetsOf(def.R)) if(B3G.A[k]) B3C.need.set('stage_'+B3G.A[k].fk,performance.now()+B3G_KEEP); const A=msAnswer('move:'+def.id); if(A&&A.clip) b3cWant(A.clip,B3G_KEEP); }
// A react or intercept beat shown: any element whose `then` waits for it answers.
function b3gBeat(b) {
  if(!B3.active) return;
  const kind=b.t,answered=new Set();
  for(const e of B3G.els) {
    const T=e.L.then; if(e.leaving||!T||T.beat!==kind) continue;
    // react: the status named by the beat (b.id) and a holder that is one of its two units (the ward's owner, or the monster carrying a shell).
    // intercept: the family member the hit was aimed at (b.tgt) holds the status.
    if(kind==='react'?(e.L.while!==b.id||(e.key!==b.src&&e.key!==b.tgt)):e.key!==b.tgt) continue;
    const R=e.def.R,ctx={R,CL:b3gClipOf(R),src:b.src,tgts:[b.tgt],attacker:kind==='react'?b.tgt:null,carrier:e.key,el:e};
    if(T.do) b3gDo(Object.assign({},T,{hide:true,asset:T.asset||e.L.asset}),ctx);   // movebench11: a then with no `do` plays only its `also` steps and the move's answer
    for(const a of T.also||[]) b3gDo(a,ctx);
    e.thenAt=B3P.t; answered.add(e.def.id); b3gAnswer(e.def.id,b,kind==='react'?b.tgt:null); }
  // the answer of a move whose status this react beat names, when it has no lasting thing of its own that answered
  if(kind==='react'&&b.id) for(const mid of b3gAnswerIds(b.id)) if(!answered.has(mid)) { answered.add(mid); b3gAnswer(mid,b,b.tgt); }
}
// ---------- movebench11: the answer of a move (spec `answer`: a counter video and the effects that play with it) ----------
// The family member who made the move: the unit whose id is the owner of the move's Vibe, else the holder named by the beat.
function b3gOwnerKey(mid,fallback) {
  try { const S=B3_SKILLS[mid],V=S&&B3_VIBES[S.vibe],o=V&&V.owner,u=o&&B3.F.party.find(x=>x.id===o); return u?u.key:fallback; } catch(err) { return fallback; }
}
// The moves with an answer that put the status `sid` on someone (its skill row has a status or taunt effect with that id).
function b3gAnswerIds(sid) {
  const out=[]; for(const id in MS.by) { if(id.slice(0,5)!=='move:'||!msAnswer(id)) continue;
    const S=B3_SKILLS[id.slice(5)]; if(S&&(S.effects||[]).some(x=>x&&x.id===sid&&(x.op==='status'||x.op==='taunt'))) out.push(id.slice(5)); }
  return out;
}
function b3gAnswer(mid,b,attacker) {
  const A=msAnswer('move:'+mid); if(!A||!B3.active||!B3.F) return;
  const owner=b3gOwnerKey(mid,b.src); if(!owner||!B3.view.u[owner]||B3.view.u[owner].ko) return;
  if(A.clip) { const CL=BCLIPS[A.clip]; if(CL&&b3cReady(A.clip)) { const home=b3gHome(owner); B3P.body[owner]={kind:'cmove',t0:B3P.t,T0:0,jx:home.cx,jy:home.base,C:CL,back:0,dur:CL.dur/1000+.12}; } }   // a counter video that is not baked plays nothing
  let aim=attacker; if(!aim||!b3Unit(B3.F,aim)||b3Unit(B3.F,aim).side!=='foe') { const f=B3.F.foes.find(q=>B3P.foe[q.key]&&!(B3.view.u[q.key]&&B3.view.u[q.key].ko)); aim=f?f.key:null; }
  if(aim&&A.effects.length&&typeof b3vArmAnswer==='function') b3vArmAnswer(mid,A.effects,owner,aim);
}

// ---------- drawing ----------
function b3gDrawDim(t) { const d=b3gDimAt(t); if(d>.001) { gfx.globalAlpha=Math.min(.95,d); rect(0,0,576,324,'#02030a'); gfx.globalAlpha=1; } }
function b3gPosOf(i,q) {   // position of a flying instance at q (0 to 1) with the arc
  let x=i.from.x+(i.to.x-i.from.x)*q,y=i.from.y+(i.to.y-i.from.y)*q;
  if(i.arc) y-=Math.sin(Math.PI*q)*i.arc; return {x,y};
}
// movebench10: the pink dashed box of an object with no picture yet (workbench preview only). It is the object's size, moves along the object's real path at the real moments, and says what it is and that it is not final.
function b3gDrawPink(i,x,y,rot,sq,alpha) {
  const w=Math.max(14,i.size.w),h=Math.max(14,i.size.h); B3G.pink=true;
  gfx.save(); gfx.translate(x,y); if(rot) gfx.rotate(rot); if(sq!==1) gfx.scale(1,sq); gfx.globalAlpha=Math.max(0,Math.min(1,alpha));
  gfx.fillStyle='rgba(255,91,210,.22)'; gfx.fillRect(-w/2,-h/2,w,h); gfx.strokeStyle='#ff5bd2'; gfx.lineWidth=2; gfx.setLineDash([6,4]); gfx.strokeRect(-w/2,-h/2,w,h); gfx.setLineDash([]);
  gfx.rotate(-(rot||0)); gfx.fillStyle='#ff5bd2'; gfx.font='700 9px sans-serif'; gfx.textAlign='center'; gfx.textBaseline='middle';
  gfx.fillText(String(i.name||'object').slice(0,18),0,h>26?-5:0); if(h>26) gfx.fillText('NOT FINAL',0,9);
  gfx.restore();
}
// movebench10: a placed, floating or surrounding object (a step, not a lasting thing): slides or drops in over .3 s, stays for `dur`, fades out over the last .25 s.
function b3gDrawHeld(i,t,e) {
  const s=b3Spot(i.key); if(!s) return;
  const inq=b3gEase(Math.min(1,e/.3)),out=i.dur-e<.25?Math.max(0,(i.dur-e)/.25):1,al=Math.min(inq*1.3,1)*out;
  const draw=(x,y,flip)=>{ if(!b3gDraw1(i.asset,x,y,i.size,e*1000,{alpha:al,flip,blend:i.blend})&&b3gPink()&&!B3G.A[i.asset]) b3gDrawPink(i,x,y,0,1,al); };
  const dir=b3gDir(i.key);   // movebench14: in front of a monster is to its right
  if(i.kind==='place') draw(s.x-(38-(1-inq)*40)*dir,s.base-i.size.h*.5-2,false);
  else if(i.kind==='surround') for(const side of i.pair?[-1,1]:[0]) draw(s.x+side*(26+(1-inq)*40),s.base-i.size.h*.5,side>0);
  else draw(s.x,s.top-i.size.h*.55+Math.sin(t*1.2*Math.PI*2)*4-(1-inq)*70,false);
}
function b3gDrawIns(t) {
  const keep=[];
  for(const i of B3G.ins) {
    const e=t-i.t0; if(e<0) { keep.push(i); continue; }
    let x,y,alpha=1,rot=0,sq=1,flip=false;
    const total=i.back?i.dur*2+(i.hold||0):i.dur;
    if(e>total+(i.kind==='pop'?0:.05)) { if(i.kind==='fall'&&i.burst&&!i.burstDone) { i.burstDone=true; B3P.fx.push({kind:'burst',x:i.to.x,y:i.to.y,color:'#ffd27a',t0:t,dur:.35}); } continue; }
    if(i.kind==='place'||i.kind==='hover'||i.kind==='surround') { b3gDrawHeld(i,t,e); keep.push(i); continue; }
    if(i.kind==='pop') { x=i.x; y=i.y; alpha=e<.08?e/.08:1; if(i.dur>0&&e>i.dur-.12) alpha=Math.max(0,(i.dur-e)/.12); }
    else if(i.kind==='fall') { const q=Math.min(1,e/i.dur); ({x,y}=b3gPosOf(i,q*q)); rot=q*2; }
    else if(i.kind==='drop') { const q=Math.min(1,e/i.dur); ({x,y}=b3gPosOf(i,q*q)); if(q>.9) sq=1-(q-.9)*1.2; }
    else if(i.kind==='cross') { const q=b3gEase(Math.min(1,e/i.dur)); x=i.from.x+(i.to.x-i.from.x)*(i.skid?1-Math.pow(1-Math.min(1,e/i.dur),2):q); y=i.from.y; flip=i.to.x>i.from.x; }
    else { // fly (and back)
      const out=e<i.dur,hd=i.hold||0,held=!out&&e<i.dur+hd; const q=out?b3gEase(e/i.dur):held?1:b3gEase((e-i.dur-hd)/i.dur);
      if(out) ({x,y}=b3gPosOf(i,q)); else if(held) { x=i.to.x; y=i.to.y; } else { const f=i.to,t2=i.backTo||i.from; x=f.x+(t2.x-f.x)*q; y=f.y+(t2.y-f.y)*q-Math.sin(Math.PI*q)*(i.arc||0); }
      rot=i.spin?i.spin*Math.PI*2*(e/total):0; }
    if(!b3gDraw1(i.asset,x,y,i.size,e*1000,{blend:i.blend,alpha,rot,sq,flip})&&b3gPink()&&!B3G.A[i.asset]) b3gDrawPink(i,x,y,rot,sq,alpha);
    keep.push(i);
  }
  B3G.ins=keep.filter(i=>t-i.t0<=(i.back?i.dur*2+(i.hold||0):i.dur)+(i.kind==='pop'?0:.05)||t<i.t0);
}
function b3gDrawEls(t) {
  for(const e of B3G.els) {
    const L=e.L,R=e.def.R,asset=L.asset; if(!asset||t<e.hideUntil) { if(L.do!=='glow') continue; }
    const key=e.key,vu=B3.view.u[key]; if(!vu) continue;
    const ctx={R,CL:b3gClipOf(R),src:key,carrier:key,tgts:[]};
    let q=1,qx=0; const age=t-e.t0; if(L.enter) q=Math.min(1,age/(L.enter.dur||.4));
    let al=1; if(e.leaving) { const lq=(t-e.leaving.t0)/e.leaving.dur; al=1-lq; q=1; }
    if(L.do==='glow') { const s=b3Spot(key); gfx.save(); gfx.globalCompositeOperation='lighter'; gfx.globalAlpha=.35+.1*Math.sin(t*5); const g=gfx.createRadialGradient(s.x,s.y,4,s.x,s.y,b3gH(key)*.8); g.addColorStop(0,L.color||'#ffd27a'); g.addColorStop(1,'rgba(0,0,0,0)'); gfx.fillStyle=g; gfx.fillRect(s.x-70,s.y-70,140,140); gfx.restore(); continue; }
    const sz=b3gSize(asset,R.assets[asset].size,ctx);
    if(L.do==='place') {   // the carry-on stands in front of the fighter, slid in from behind on entry, away across the floor on exit
      const h=b3gHome(key),fx=h.cx-38,fy=h.base-sz.h*.5-2; let x=fx+(1-b3gEase(q))*(L.enter&&L.enter.from==='behind'?40:0),y=fy,a=al;
      if(e.leaving&&L.exit&&L.exit.do==='cross') { const lq=b3gEase((t-e.leaving.t0)/e.leaving.dur); x=fx+(650-fx)*lq; a=1; }
      if(e.leaving&&L.exit&&L.exit.do==='fly') y-=b3gEase((t-e.leaving.t0)/e.leaving.dur)*120;   // movebench11: Tom can choose that it flies up and out instead
      b3gDraw1(asset,x,y,sz,age*1000,{alpha:a*(b3gEase(Math.min(1,age/.15)))}); }
    else if(L.do==='surround') {   // a pair of doors, one each side of the carrier
      const s=b3Spot(key),gap=26,k=L.pair?[-1,1]:[0]; const slide=e.leaving?(L.exit&&L.exit.do==='fade'?1:1-b3gEase((t-e.leaving.t0)/e.leaving.dur)):b3gEase(q);   // movebench11: exit fade only fades
      for(const side of k) b3gDraw1(asset,s.x+side*(gap+(1-slide)*40),s.base-sz.h*.5,sz,0,{alpha:e.leaving&&L.exit&&L.exit.do==='fade'?al:Math.min(1,slide*1.3),flip:side>0}); }
    else if(L.do==='hover') {   // the shell floats above its carrier, bobbing; it drops in from the top on entry and flies up on exit
      const s=b3Spot(key),bob=Math.sin(t*(L.rate||1.2)*Math.PI*2)*(L.amp||4); let y=s.top-sz.h*.55+bob-(1-b3gEase(q))*70;
      let hx=s.x; if(e.leaving&&!(L.exit&&L.exit.do==='fade')) { const lq=b3gEase((t-e.leaving.t0)/e.leaving.dur); if(L.exit&&L.exit.do==='cross') hx+=(650-s.x)*lq; else y-=lq*120; }   // movebench11: it flies up (as before), slides off to the right, or only fades
      b3gDraw1(asset,hx,y,sz,age*1000,{alpha:al}); }
  }
}
function b3gDrawWords(t) {
  const keep=[];
  for(const w of B3G.words) {
    const e=t-w.t0; const n=w.glyphs?w.glyphs.length:1,life=w.glyphs?n*w.each+w.hold:w.hold+.25;
    if(e>life) continue; keep.push(w);
    const q=e/life,al=e<.1?e/.1:q>.85?Math.max(0,(1-q)/.15):1; gfx.globalAlpha=al;
    if(w.glyphs) { const shown=Math.min(n,Math.floor(e/w.each)+1),sw=w.sc*7+6,x0=w.x-(n*sw)/2+sw/2;
      for(let k=0;k<shown;k++) { const g=w.glyphs[k],x=x0+k*sw;
        if(g.length>1) { gfx.save(); gfx.translate(x,w.y); gfx.rotate({up:Math.PI,down:0,left:Math.PI/2,right:-Math.PI/2}[g]||0); gfx.scale(w.sc/2,w.sc/2); b3Arrow(0,-3,w.color); gfx.restore(); }
        else b3Text(g,x,w.y-w.sc*2,w.color,w.sc); } }
    else b3Text(w.text,Math.max(40,Math.min(536,w.x)),Math.max(6,w.y-Math.min(1,e)*8),w.color,w.sc);
    gfx.globalAlpha=1;
  }
  B3G.words=keep;
}
function b3gDrawGlows(t) {
  B3G.glows=B3G.glows.filter(g=>t-g.t0<g.dur);
  for(const g of B3G.glows) { const s=b3Spot(g.key),q=(t-g.t0)/g.dur; gfx.save(); gfx.globalCompositeOperation='lighter'; gfx.globalAlpha=Math.min(.55,(1-q)*1.2);
    const c=g.color==='rainbow'?'hsl('+Math.round(t*180%360)+',90%,60%)':g.color,r=gfx.createRadialGradient(s.x,s.y,4,s.x,s.y,b3gH(g.key)*.85); r.addColorStop(0,c); r.addColorStop(1,'rgba(0,0,0,0)'); gfx.fillStyle=r; gfx.fillRect(s.x-80,s.y-80,160,160); gfx.restore(); }
}
// Called by b3Draw: before the monsters (the backdrop's dim) and after the things in flight (props, glows, words).
function b3gDrawBack(t) { try { b3gReconcile(t); b3gDrawDim(t); } catch(e) { gameFault('stage',e); } }
function b3gDrawFront(t) { try { b3gDrawEls(t); b3gDrawIns(t); b3gDrawGlows(t); b3gDrawWords(t); } catch(e) { gameFault('stage',e); } }
function b3gReset() { B3G.els=[]; B3G.ins=[]; B3G.words=[]; B3G.glows=[]; B3G.dim={from:0,to:0,t0:0,dur:0}; B3G.shake=null; B3G.run=null; }
