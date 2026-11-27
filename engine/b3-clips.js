'use strict';
// engine/b3-clips.js — Battle 3 video clips (stage 8, architecture 2.7). Drawing only: nothing here changes the fight.
// Which clip shows which body state, and which clip a move, an act or a wind-up plays, is the animation's spec (data/moves/*.json, engine/b3-spec.js: msStateClip, msAnimOf, msWindClip; movebench12).
// The clips themselves are defined by engine/clips.js (bclipDefine) and loaded as lazy atlases (engine/painted.js).
//
// Memory (architecture risk 7, docs/BATTLE3.md "Clips"): a clip's picture is about 10 MB once decoded, so a fight keeps only the idle
// loops loaded for the whole fight (b3cWanted). Every other clip is asked for the moment it is about to be needed (b3cWant) and is
// released a few seconds after its last picture (engine/painted.js paintedTick). A move waits up to 2.5 s for its clip, then plays its
// default animation instead; a body state with no loaded clip shows the painted frame.
const B3C={need:new Map(),peak:0,waitMax:2.5,over:null,gs:{}};
const B3C_KEEP=4500;   // ms a clip stays wanted after it was last asked for

// wanproof: a fight may carry its own clips on top of the body specs (msStateClip) (B3C.over={F, map:{owner:{state:id}}}, set by the Lab row
// PROOF: GRACE'S GUARD (VIDEO), engine/b3-lab.js). Only for that one fight.
function b3cOver(owner) { const O=B3C.over; return O&&typeof B3!=='undefined'&&B3.active&&B3.F===O.F?O.map[owner]||null:null; }
// The clip id for an owner (a family member's or a monster's id) in a state, or null.
function b3cOf(owner,state) { const V=b3cOver(owner),id=(V&&V[state])||msStateClip(owner,state); return id&&BCLIPS[id]?id:null; }
// movebench12: a spec may trim a clip ({from,to}: the first and last picture that play). The trimmed clip is a view that shares the pictures (cached on the clip), so every user of a clip (a move, a state, a wind-up) draws the same
// pictures and the same length. A trim that keeps every picture, or one that names pictures the clip does not have, answers the clip itself.
function b3cTrimmed(C,T) {
  if(!C||!T||typeof T.from!=='number'||typeof T.to!=='number') return C;
  const f=Math.max(0,Math.min(C.n-1,T.from)),t=Math.max(f,Math.min(C.n-1,T.to));
  if(f===0&&t===C.n-1) return C;
  const key=f+'-'+t,cache=C._tr||(C._tr={}); if(cache[key]) return cache[key];
  const m0=C.ms[f],end=t+1<C.n?C.ms[t+1]:C.dur,sh=v=>v==null?v:Math.max(0,Math.min(t-f,v-f));
  const V=Object.assign({},C,{n:t-f+1,ms:C.ms.slice(f,t+1).map(x=>x-m0),frames:C.frames.slice(f,t+1),dur:end-m0,impact:C.impact==null?null:Math.max(0,Math.min(t-f,C.impact-f)),trimmed:{from:f,to:t},_tr:null});
  if(C.rise!=null) V.rise=sh(C.rise); if(C.lower!=null) V.lower=sh(C.lower);
  return cache[key]=V;
}
// The trim a body state's spec names.
const b3cStateTrim=(owner,state)=>msTrimOf('body:'+owner+':'+state);
// A guard clip (kind guard, wanproof; every fight since wanch1): the owner's guard comes up, holds and goes down from the one video.
function b3cGuardClip(u) { const id=b3cOf(u.id,'guard'),C=id&&BCLIPS[id]; return C&&C.kind==='guard'?b3cTrimmed(C,b3cStateTrim(u.id,'guard')):null; }
const b3cReady=id=>!!id&&!!BCLIPS[id]&&bclipReady(id);
// Ask for a clip to be loaded (and kept for a few seconds). True when the clip exists at all.
function b3cWant(id,ms) { if(!id||!BCLIPS[id]) return false; B3C.need.set(id,performance.now()+(ms||B3C_KEEP)); return true; }
// The clip of an owner's state if it is loaded now (asking for it either way), else null.
function b3cGet(owner,state,ms) { const id=b3cOf(owner,state); if(!id) return null; b3cWant(id,ms); return bclipReady(id)?b3cTrimmed(BCLIPS[id],b3cStateTrim(owner,state)):null; }
// What the fight wants loaded right now (engine/clips.js bclipWanted): every fighter's idle loop, the guard video of whoever is guarding,
// plus what was asked for lately.
function b3cWanted() {
  const out=[]; if(!B3.active||!B3.F) return out;
  for(const u of B3.F.units) { for(const st of ['idle','guard']) { const id=b3cOf(u.id,st); if(id&&(st==='idle'||(BCLIPS[id].kind==='guard'&&b3cGuarding(u)))&&!out.includes(id)) out.push(id); } }
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
  const m=mirrorRows(fr); m._clip=true; if(fr._ft) m._ft={dx:-fr._ft.dx,w:fr._ft.w}; if(fr._below) m._below=fr._below;
  return fr._mir=m;
}
// Where a clip fighter stands to land a move on a monster: the clip's leading point (a fist, a spray) on the monster's near side.
function b3cStand(src,C,tgtKey) {
  const sc=(BATTLE_SPRITES[C.owner]||{scale:1}).scale,z=b3Spot(tgtKey),b=B3P.foe[tgtKey]?b3FoeBox(tgtKey):null;
  const tipX=b?b.x+b.w*.5-8:z.x,tipY=z.y,dx=C.reach?C.reach[0]*sc:0,up=C.reach?C.reach[1]*sc:0;
  return {x:Math.min(548,Math.max(z.sx-30,tipX+dx)),y:Math.max(z.sb-12,Math.min(z.sb+6,tipY+up))};
}
// pairmove1 (Tom 2026-11-21 20:07: "she jumps on the shoulders and then jumps off and says giddy up"): a move whose video shows two family
// members (the move's spec: body.pair = {with: <member id>, clip: <clip id>}). It plays when that member is in the party, standing, and the clip
// exists: the video is drawn as the partner's body at the partner's spot and the mover is hidden for its length (b3PlayMove). Otherwise the
// move's own clip (body.clip) plays. Returns {key, clip} or null.
function b3cPair(head) {
  const AN=head&&head.t==='act'?msAnimOf(head):null,P=AN&&AN.pair;
  if(!P||!head.src||head.src[0]==='f'||typeof B3==='undefined'||!B3.F||!BCLIPS[P.clip]) return null;
  const u=B3.F.party.find(x=>x.id===P.with&&x.key!==head.src),vu=u&&B3.view&&B3.view.u[u.key];
  return u&&vu&&!vu.ko?{key:u.key,clip:P.clip}:null;
}
// When, in seconds after a clip starts, its move lands: the marked impact frame, or `at` of its length for a clip with no impact.
// Where in a clip the hit lands, in seconds: the move's own `contact` (engine/b3-spec.js msTiming) when it gives a time ({sec}); else the clip's hit picture (a strike clip's impact); else {share} of the clip's length, half of it when the move names none.
function b3cLandAt(C,TM) { const ct=TM&&TM.contact; if(ct&&typeof ct==='object'&&typeof ct.sec==='number'&&isFinite(ct.sec)) return Math.max(0,ct.sec);
  return (C.kind==='strike'&&C.impact!=null?C.ms[C.impact]:C.dur*(ct&&typeof ct==='object'&&typeof ct.share==='number'&&isFinite(ct.share)?ct.share:.5))/1000; }

// ---------- Asking ahead ----------
// A move is about to play: load what its beats will show, so the pictures are there when the hit lands.
function b3cWarmBeats(beats) {
  for(const b of beats) {
    const AN=b.t==='act'?msAnimOf(b):null;
    if(AN) { b3cWant(AN.clip,8000); if(AN.pair) b3cWant(AN.pair.clip,8000); const u=b3Unit(B3.F,b.src); if(u&&u.side==='party') b3cWant(b3cOf(u.id,'run'),8000); }
    else if(b.t==='telegraph'&&b3cWindOf(b)) b3cWant(b3cWindOf(b),8000);
    else if(b.t==='hit'||b.t==='miss'||b.t==='ko') { const id=b.tgt,u=id&&b3Unit(B3.F,id); if(!u) continue;
      const st=b.t==='ko'?(u.side==='foe'?'die':'ko'):b.t==='miss'?'dodge':'hit'; b3cWant(b3cOf(u.id,st),6000); }
    else if(b.t==='hazardTrip') { const u=b3Unit(B3.F,b.tgt); if(u) b3cWant(b3cOf(u.id,'slip'),6000); }
    else if(b.t==='break') { const u=b3Unit(B3.F,b.tgt); if(u) b3cWant(b3cOf(u.id,'flustered'),9000); }
    else if(b.t==='act') { const u=b3Unit(B3.F,b.src); if(u&&u.side==='party') b3cWant(b3cOf(u.id,b.shape==='strike'?'run':b.shape==='give'?'give':'cast'),6000); }
  }
}
// A fighter starts a one-shot body clip (hit, dodge, give, cast): {kind:'cs'} on the body. Returns how long it plays, or 0 when there is no loaded clip.
// The wind-up clip a telegraph beat shows: the spec of the monster's act that charges ('wind:<monster>:<act>').
function b3cWindOf(b) { const u=b&&b.t==='telegraph'&&b.src&&b.src[0]==='f'?b3Unit(B3.F,b.src):null; return u?msWindClip(u.id,b.id):null; }
function b3cBodyClip(key,state,keepIfPlaying) {
  const u=b3Unit(B3.F,key),C=u&&b3cGet(u.id,state);
  if(!C) return 0;
  const B=B3P.body[key];
  if(keepIfPlaying&&B&&B.kind==='cs'&&B.state===state&&B3P.t-B.t0<C.dur/1000*.4) return C.dur/1000;
  B3P.body[key]={kind:'cs',state,id:C.id,C,t0:B3P.t,dur:C.dur/1000};
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
// Is the guard clip showing anything right now (up, holding, or still lowering)? When not, the idle loop shows (wanch1).
function b3cGuardActive(C,key,on,t) { const G=B3C.gs[key]; if(on||(G&&G.on)) return true; if(!G||G.t0<-90) return false; return (t-G.t0)*1000+G.from<C.dur; }
// idea-tomgrace: a family member in B3_VIDEO_ONLY (data/b3-clips.js) is drawn from videos only, never a painted frame.
function b3cVideoOnly(u) { return !!u&&typeof B3_VIDEO_ONLY!=='undefined'&&B3_VIDEO_ONLY.includes(u.id); }
// The video picture that stands in for a painted one (video-only members). reach: a reaching move began at t0, so their give video plays
// once from then (a member with no give video keeps the idle loop). Otherwise the idle, guard or victory loop. Null until a video is loaded.
function b3cStandIn(u,vu,t,reach,t0) {
  if(reach) { const G=b3cGet(u.id,'give',6000); if(G) return b3cOnce(G,(t-t0)*1000); }
  return b3cMemberFrame(u,vu,t,null);
}
// A knocked-out video-only member whose knock-out video is not loaded (or not made): their hit video plays to its middle (the deepest wince) and holds there.
function b3cKoStandIn(u,t,e) { const H=b3cGet(u.id,'hit',8000),I=H?null:b3cGet(u.id,'idle',9000);
  return H?b3cOnce(H,Math.min(e*1000,H.dur*.5)):I?bclipFrameAt(I,0):null; }
// The picture of a family member's clip right now, or null (draw the painted frame). e0 is the time the body started this state.
function b3cMemberFrame(u,vu,t,B) {
  const cheering=!vu.ko&&(B3P.cheer||B3P.cheerKey===u.key);   // a won fight: the victory video beats a guard that is still up (guardwin1)
  const GC=!vu.ko&&!cheering&&b3cGuardClip(u),gon=GC&&b3cGuarding(u);
  if(GC&&(!B||(B.kind==='hit'&&B.guard))&&(b3cGuardActive(GC,u.key,gon,t)||!b3cOf(u.id,'idle'))) { b3cWant(GC.id,9000); if(bclipReady(GC.id)) return b3cGuardFrame(GC,u.key,gon,t); }   // not loaded yet: the idle video below until it is
  if(vu.ko) { const C=b3cGet(u.id,'ko',8000); if(!C) return null; return b3cOnce(C,B&&B.kind==='ko'?(t-B.t0)*1000:C.dur); }   // plays from the moment they went down, then holds its last picture
  if(B&&B.kind==='cs') { const C=B.C||BCLIPS[B.id]; b3cWant(B.id,3000); return C&&bclipReady(B.id)?b3cOnce(C,(t-B.t0)*1000):null; }
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
  const cl=A.cl; if(cl&&t<cl.t0+cl.dur+.05) { const C=cl.C||BCLIPS[cl.id]; b3cWant(cl.id,3000); if(C&&bclipReady(cl.id)) return {fr:b3cOnce(C,(t-cl.t0)*1000)}; }
  if(A.windId&&!(vu.st.includes('flustered'))) { const C=b3cTrimmed(BCLIPS[A.windId],A.windTrim); b3cWant(A.windId,5000); if(C&&bclipReady(A.windId)) { if(A.windT0==null) A.windT0=t; return {fr:b3cOnce(C,(t-A.windT0)*1000)}; } }
  if(vu.st.includes('flustered')) { const C=b3cGet(id,'flustered',9000); if(C) return {fr:b3cOnce(C,(t-(A.flusT==null?t:A.flusT))*1000)}; return null; }
  const I=b3cGet(id,'idle',9000);
  return I?{fr:bclipLoopFrame(I,t*1000+f.slot*900)}:null;
}
// A monster starts a one-shot clip on itself (hit, slip). A clip already playing past 40% is left to finish (a many-hit move would restart it forever).
function b3cFoeClip(key,state) {
  const f=b3Unit(B3.F,key),A=B3P.fa[key],C=f&&A&&b3cGet(f.id,state);
  if(!C) return false;
  if(A.cl&&B3P.t<A.cl.t0+A.cl.dur*.4) return true;
  A.cl={id:C.id,C,t0:B3P.t,dur:C.dur/1000}; return true;
}
