'use strict';
// data/grace-wheel-use.js — Draws Grace's bespoke gymnastics poses (cartwheel showpiece, her Tombo move, round-off combos) from her painted
// pose frames (data/grace-wheel-hires.js, art/chars/grace-wheel.webp) instead of the old pixel body built in data/grace-wheel.js.
// The motion maths in grace-wheel.js (hip path, which hand or foot is planted, rotation) is unchanged; only the picture is swapped:
// W.frame / W.mirror return a painted 130 x 130 frame with the hip at its centre, drawn at the sprite scale (1), which is the same
// 130 px box the old 65-row frames made at scale 2. Blended poses (tweens between two named poses) show the nearer painted pose.
// Set GRACE_WHEEL_HIRES_OFF=true before this file to keep the old pixel frames. Loaded after data/grace-hires-use.js.
(function() {
  if(typeof GRACE_WHEEL_HIRES==='undefined'||typeof GRACE_WHEEL==='undefined'||(typeof GRACE_WHEEL_HIRES_OFF!=='undefined'&&GRACE_WHEEL_HIRES_OFF)) return;
  if(typeof GRACE_HIRES!=='undefined'&&!(BATTLE_SPRITES.grace&&BATTLE_SPRITES.grace.hires)) return;   // old pixel Grace is on screen: keep the old frames
  const H=GRACE_WHEEL_HIRES,W=GRACE_WHEEL,P=W.P;
  paintedAtlas('graceWheel',H.src,H.rects,H.k);
  const cache={};
  const blank=()=>Array.from({length:H.rows},()=>'.'.repeat(H.rows));
  const painted=(name,flip)=>{ const k=name+(flip?'~':''); return cache[k]||(cache[k]=paintRows(blank(),'graceWheel',name,flip)); };
  W.painted=painted;     // W.painted('handstand'|'leap'|'salute'|'dance'|'balance'|'bow'|'split'|'bridge'|...) for other moves
  // Model poses and the painted frame that shows each one.
  const FRONT=['stand','lunge','star','land'],SIDE=['chamber','kick','sstand','tuck'];
  const num=v=>v||0;
  const dist=(q,p)=>Math.abs(num(q.lA)-num(p.lA))+Math.abs(num(q.lB)-num(p.lB))+.4*(Math.abs(num(q.aA)-num(p.aA))+Math.abs(num(q.aB)-num(p.aB)))+.5*Math.abs(num(q.lean)-num(p.lean));
  const pick=(q,key)=>{
    if(typeof key==='string'&&P[key]===q&&H.rects[key]) return key;
    const set=(q.side?SIDE:FRONT).filter(n=>P[n]&&H.rects[n]);
    let best=set[0],bd=1e9;
    for(const n of set) { const d=dist(q,P[n]); if(d<bd) { bd=d; best=n; } }
    return best;
  };
  const oldFrame=W.frame,oldMirror=W.mirror;
  W.frame=function(q,key) { if(typeof q==='string') { key=q; q=P[q]; } return painted(pick(q,key),false); };
  W.mirror=function(q,key) { if(typeof q==='string') { key=q; q=P[q]; } return painted(pick(q,key),true); };
  W.oldFrame=oldFrame; W.oldMirror=oldMirror;
})();
