'use strict';
// engine/b3-clips.js — Battle 3 video clips (stage 8, architecture 2.7). Drawing only: nothing here changes the fight.
// The table of which clip shows which body state is data/b3-clips.js (B3_BODY_CLIPS); a move or an act names its own clip in its row
// (anim:{kind:'clip',clip:id}). The clips themselves are defined by engine/clips.js (bclipDefine) and loaded as lazy atlases (engine/painted.js).
//
// Memory (architecture risk 7, docs/BATTLE3.md "Clips"): a clip's picture is about 10 MB once decoded, so a fight keeps only the idle
// loops loaded for the whole fight (b3cWanted). Every other clip is asked for the moment it is about to be needed (b3cWant) and is
// released a few seconds after its last picture (engine/painted.js paintedTick). A move waits up to 2.5 s for its clip, then plays its
// default animation instead; a body state with no loaded clip shows the painted frame.
const B3C={need:new Map(),peak:0,waitMax:2.5,over:null,gs:{}};
const B3C_KEEP=4500;   // ms a clip stays wanted after it was last asked for

// wanproof: a fight may carry its own clips on top of B3_BODY_CLIPS (B3C.over={F, map:{owner:{state:id}}}, set by the Lab row
// PROOF: GRACE'S GUARD (VIDEO), engine/b3-lab.js). Only for that one fight: B3_BODY_CLIPS and the painted states stay as they are.
function b3cOver(owner) { const O=B3C.over; return O&&typeof B3!=='undefined'&&B3.active&&B3.F===O.F?O.map[owner]||null:null; }
// The clip id for an owner (a family member's or a monster's id) in a state, or null.
function b3cOf(owner,state) { const V=b3cOver(owner),T=B3_BODY_CLIPS[owner],id=(V&&V[state])||(T&&T[state]); return id&&BCLIPS[id]?id:null; }
// A guard clip (kind guard, wanproof) shown as the owner's guard AND as their standing picture: this fight only (b3cOver).
function b3cGuardClip(u) { const V=b3cOver(u.id),id=V&&V.guard,C=id&&BCLIPS[id]; return C&&C.kind==='guard'?C:null; }
const b3cReady=id=>!!id&&!!BCLIPS[id]&&bclipReady(id);
// Ask for a clip to be loaded (and kept for a few seconds). True when the clip exists at all.
function b3cWant(id,ms) { if(!id||!BCLIPS[id]) return false; B3C.need.set(id,performance.now()+(ms||B3C_KEEP)); return true; }
// The clip of an owner's state if it is loaded now (asking for it either way), else null.
function b3cGet(owner,state,ms) { const id=b3cOf(owner,state); if(!id) return null; b3cWant(id,ms); return bclipReady(id)?BCLIPS[id]:null; }
// What the fight wants loaded right now (engine/clips.js bclipWanted): every fighter's idle loop, plus what was asked for lately.
function b3cWanted() {
  const out=[]; if(!B3.active||!B3.F) return out;
  for(const u of B3.F.units) { for(const st of ['idle','guard']) { const id=st==='idle'||b3cOver(u.id)?b3cOf(u.id,st):null; if(id&&!out.includes(id)) out.push(id); } }
  const now=performance.now();
  for(const [id,until] of B3C.need) { if(until<now) B3C.need.delete(id); else if(!out.includes(id)) out.push(id); }
  return out;
}
// How many clip pictures are decoded right now (about 10 MB each). B3C.peak is the most seen this page load.
function b3cLoaded() { let n=0; for(const id in PAINTED) if(/^clip_/.test(id)&&PAINTED[id].img) n++; if(n>B3C.peak) B3C.peak=n; return n; }
setInterval(()=>{ try { if(typeof B3!=='undefined'&&B3.active) b3cLoaded(); } catch(e) {} },500);

// A clip's frame ms after its start: it plays once and holds its last picture.
const b3cOnce=(C,ms)=>bclipFrameAt(C,Math.max(0,Math.min(ms,C.dur)));
// The same frame turned to face the other way (a runner coming home). Cached on the frame; keeps the shadow's place.
function b3cMirror(fr) {
  if(fr._mir) return fr._mir;
  const m=mirrorRows(fr); m._clip=true; if(fr._ft) m._ft={dx:-fr._ft.dx,w:fr._ft.w};
  return fr._mir=m;
}
// Where a clip fighter stands to land a move on a monster: the clip's leading point (a fist, a spray) on the monster's near side.
function b3cStand(src,C,tgtKey) {
  const sc=(BATTLE_SPRITES[C.owner]||{scale:1}).scale,z=b3Spot(tgtKey),b=B3P.foe[tgtKey]?b3FoeBox(tgtKey):null;
  const tipX=b?b.x+b.w*.5-8:z.x,tipY=z.y,dx=C.reach?C.reach[0]*sc:0,up=C.reach?C.reach[1]*sc:0;
  return {x:Math.min(548,Math.max(z.sx-30,tipX+dx)),y:Math.max(z.sb-12,Math.min(z.sb+6,tipY+up))};
}
// When, in seconds after a clip starts, its move lands: the marked impact frame, or `at` of its length for a clip with no impact.
function b3cLandAt(C,anim) { return (C.kind==='strike'&&C.impact!=null?C.ms[C.impact]:C.dur*(anim&&anim.at!=null?anim.at:.5))/1000; }

// ---------- Asking ahead ----------
// A move is about to play: load what its beats will show, so the pictures are there when the hit lands.
function b3cWarmBeats(beats) {
  for(const b of beats) {
    if(b.t==='act'&&b.anim&&b.anim.kind==='clip') { b3cWant(b.anim.clip,8000); const u=b3Unit(B3.F,b.src); if(u&&u.side==='party') b3cWant(b3cOf(u.id,'run'),8000); }
    else if(b.t==='telegraph'&&b.wind) b3cWant(b.wind,8000);
    else if(b.t==='hit'||b.t==='miss'||b.t==='ko') { const id=b.tgt,u=id&&b3Unit(B3.F,id); if(!u) continue;
      const st=b.t==='ko'?(u.side==='foe'?'die':'ko'):b.t==='miss'?'dodge':'hit'; b3cWant(b3cOf(u.id,st),6000); }
    else if(b.t==='hazardTrip') { const u=b3Unit(B3.F,b.tgt); if(u) b3cWant(b3cOf(u.id,'slip'),6000); }
    else if(b.t==='break') { const u=b3Unit(B3.F,b.tgt); if(u) b3cWant(b3cOf(u.id,'flustered'),9000); }
    else if(b.t==='act'&&!b.anim) { const u=b3Unit(B3.F,b.src); if(u&&u.side==='party') b3cWant(b3cOf(u.id,b.shape==='strike'?'run':b.shape==='give'?'give':'cast'),6000); }
  }
}
// A fighter starts a one-shot body clip (hit, dodge, give, cast): {kind:'cs'} on the body. Returns how long it plays, or 0 when there is no loaded clip.
function b3cBodyClip(key,state,keepIfPlaying) {
  const u=b3Unit(B3.F,key),C=u&&b3cGet(u.id,state);
  if(!C) return 0;
  const B=B3P.body[key];
  if(keepIfPlaying&&B&&B.kind==='cs'&&B.state===state&&B3P.t-B.t0<C.dur/1000*.4) return C.dur/1000;
  B3P.body[key]={kind:'cs',state,id:C.id,t0:B3P.t,dur:C.dur/1000};
  return C.dur/1000;
}
// Does the family member wear a guard (a stance, a shield, or a Mark) in the view? Then the guard loop shows in place of the idle loop.
function b3cGuarding(u) {
  const vu=B3.view.u[u.key]; if(!vu) return false;
  return vu.sh>0||vu.st.some(id=>B3_STATUS[id]&&B3_STATUS[id].kind==='stance')||b3ViewMarked(u.key);
}
// A guard clip's picture right now (kind guard): standing on its first picture; when the guard goes up, the rise plays once, then the
// held stretch (pictures rise..lower-1) loops forward and back; when it comes down, the lowering plays once and the first picture is
// held again. Going up in the middle of a lowering (or down in the middle of a rise) starts from the picture of the same height.
function b3cGuardFrame(C,key,on,t) {
  const G=B3C.gs[key]||(B3C.gs[key]={on:false,t0:-99,from:0}),up=C.ms[C.rise],dn=C.ms[C.lower];
  if(on!==G.on) { const was=b3cGuardMs(C,G,t); G.on=on; G.t0=t;
    G.from=on?(was>=dn&&was<C.dur?Math.max(0,up*(1-(was-dn)/Math.max(1,C.dur-dn))):0):(was<up?dn+(C.dur-dn)*(1-was/Math.max(1,up)):dn); }
  return bclipFrameAt(C,b3cGuardMs(C,G,t));
}
function b3cGuardMs(C,G,t) {
  const e=(t-G.t0)*1000,up=C.ms[C.rise],dn=C.ms[C.lower];
  if(G.on) { const r=G.from+e; if(r<up) return r; const len=dn-up,q=(r-up)%(2*len); return up+(q<len?q:2*len-q-1); }
  if(G.t0<-90) return 0;
  const r=G.from+e; return r<C.dur?r:0;
}
// The picture of a family member's clip right now, or null (draw the painted frame). e0 is the time the body started this state.
function b3cMemberFrame(u,vu,t,B) {
  const GC=!vu.ko&&b3cGuardClip(u);
  if(GC&&(!B||(B.kind==='hit'&&B.guard))) { b3cWant(GC.id,9000); return bclipReady(GC.id)?b3cGuardFrame(GC,u.key,b3cGuarding(u),t):null; }
  if(vu.ko) { const C=b3cGet(u.id,'ko',8000); if(!C) return null; return b3cOnce(C,B&&B.kind==='ko'?(t-B.t0)*1000:C.dur); }   // plays from the moment they went down, then holds its last picture
  if(B&&B.kind==='cs') { const C=BCLIPS[B.id]; b3cWant(B.id,3000); return C&&bclipReady(B.id)?b3cOnce(C,(t-B.t0)*1000):null; }
  if(B) return null;   // a painted pose or a path is playing
  if(B3P.cheer||B3P.cheerKey===u.key) { const C=b3cGet(u.id,'victory',9000); if(!C) return null; if(B3P.cheerAt==null) B3P.cheerAt=t; return b3cOnce(C,(t-B3P.cheerAt)*1000); }
  const guard=b3cGuarding(u)?b3cGet(u.id,'guard'):null;
  if(guard) return bclipLoopFrame(guard,t*1000+u.slot*700);
  const I=b3cGet(u.id,'idle',9000);
  return I?bclipLoopFrame(I,t*1000+u.slot*700):null;
}
// A monster's clip picture right now, or null. Order: dying, a hit or slip playing, a move's clip, a wound-up hold, Flustered, the idle loop.
function b3cFoeFrame(f,A,vu,t,hurtish) {
  const id=f.id;
  if(A.die!=null) { const C=b3cGet(id,'die',9000); if(C) return {fr:b3cOnce(C,(t-A.die)*1000),dur:C.dur/1000}; return null; }
  const cl=A.cl; if(cl&&t<cl.t0+cl.dur+.05) { const C=BCLIPS[cl.id]; b3cWant(cl.id,3000); if(C&&bclipReady(cl.id)) return {fr:b3cOnce(C,(t-cl.t0)*1000)}; }
  if(A.windId&&!(vu.st.includes('flustered'))) { const C=BCLIPS[A.windId]; b3cWant(A.windId,5000); if(C&&bclipReady(A.windId)) { if(A.windT0==null) A.windT0=t; return {fr:b3cOnce(C,(t-A.windT0)*1000)}; } }
  if(vu.st.includes('flustered')) { const C=b3cGet(id,'flustered',9000); if(C) return {fr:b3cOnce(C,(t-(A.flusT==null?t:A.flusT))*1000)}; return null; }
  const I=b3cGet(id,'idle',9000);
  return I?{fr:bclipLoopFrame(I,t*1000+f.slot*900)}:null;
}
// A monster starts a one-shot clip on itself (hit, slip). A clip already playing past 40% is left to finish (a many-hit move would restart it forever).
function b3cFoeClip(key,state) {
  const f=b3Unit(B3.F,key),A=B3P.fa[key],C=f&&A&&b3cGet(f.id,state);
  if(!C) return false;
  if(A.cl&&B3P.t<A.cl.t0+A.cl.dur*.4) return true;
  A.cl={id:C.id,t0:B3P.t,dur:C.dur/1000}; return true;
}
