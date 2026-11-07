'use strict';
// engine/tombo-frames.js: painted Tombo frames (data/tombo-frames.js, art/tombo/*.webp, cut by tools/sprite-bake/tombo_frames.py).
// tbf(tid,who,n,sp) returns the painted frame n (1 to 6) of a Tombo for use as `frame` in pathOf: who 'tom' (Tom's sheet), 'p' (the partner's
// sheet) or 'pair' (one sheet with both people). Frames are sized so the standing figure matches that character's battle pose, so they draw at
// the unit's own scale. Pass the unit's sprite `sp` (c.sp) so eye and hand lookups find something.
// Atlases load only while a fight has the partner in the party (paintedLazy/paintedOwners in engine/painted.js, ids tbo_<partner>_<id>_<who>).
(function() {
  if(typeof TOMBO_FRAMES==='undefined') return;
  for(const tid in TOMBO_FRAMES) { const T=TOMBO_FRAMES[tid]; for(const who of ['tom','p','pair']) { const A=T[who]; if(A) paintedAtlas('tbo_'+T.partner+'_'+tid+'_'+who,A.src,A.rects,A.k); } }
  const cache={};
  window.tbf=function(tid,who,n,sp) {
    const T=TOMBO_FRAMES[tid],A=T&&T[who],R=A&&A.rects[n]; if(!R) return null;
    const key=tid+'/'+who+'/'+n; let r=cache[key];
    if(!r) { const w=Math.max(1,Math.round(R[2]/A.k)),h=Math.max(1,Math.round(R[3]/A.k)); r=new Array(h).fill('.'.repeat(w)); paintRows(r,'tbo_'+T.partner+'_'+tid+'_'+who,String(n),false); cache[key]=r; }
    if(sp&&sp.eyeAt&&!sp.eyeAt.has(r)) { const e=sp.eyeAt.get(sp.idle); if(e) sp.eyeAt.set(r,e); }
    if(sp&&sp.handAt&&!sp.handAt.has(r)) { const h=sp.handAt.get(sp.idle); if(h) sp.handAt.set(r,h); }
    return r;
  };
})();
