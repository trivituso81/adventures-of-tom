// Pass-1 draft review extras (Battle Lab > PASS-1 DRAFT REVIEW): native 1.0x playback, approach and return slides,
// hit-stop, screen shake and small procedural Canvas effects on the impact. Code-drawn effects only; no painted poses.
// Meta comes from data/pass1-meta.js. Everything is a no-op for a clip with no entry.
const P1_SLIDE_MS=350;
function p1Meta(id){ const k=String(id).replace(/_/g,'-');   // the clip key is pf_justin_bb_basic, the packet id pf-justin-bb-basic
  const M=typeof PASS1_META!=='undefined'?PASS1_META[k]:null; if(M) return M;   // a row measured on the baked video wins
  return typeof gtMeta==='function'?gtMeta(k):null; }   // else the manifest's contactSec and hitStopFrames (engine/guide-timing.js)
// Time into the clip with hit-stop applied: the clock holds still for hit_stop_frames at 60 fps after the impact.
function p1Clock(S,ms){ const M=p1Meta(S.id); if(!M||!M.hit_stop_frames) return ms; const hold=M.hit_stop_frames*1000/60;
  if(ms<M.impact_ms) return ms; if(ms<M.impact_ms+hold) return M.impact_ms; return ms-hold; }
// Slide lead: a clip that approaches the foe first slides out for P1_SLIDE_MS holding its first picture, plays, then slides back for as long.
function p1Lead(S){ const M=p1Meta(S.id); return M&&M.approach?P1_SLIDE_MS:0; }
// 0..1 slide amount: out over the lead, held through the clip, back over the same time after it.
function p1Slide(S,wall0,lead,ms,len){ if(!lead) return 0; const a=Math.min(1,Math.max(0,wall0/lead)); const b=ms>=len?Math.max(0,1-(ms-len)/lead):1; return Math.min(a,b); }
function p1Shake(S,ms){ const M=p1Meta(S.id); if(!M||!M.screen_shake_px) return 0; const d=ms-M.impact_ms; if(d<0||d>320) return 0;
  return Math.round(Math.sin(d*0.09)*M.screen_shake_px*(1-d/320)); }
const P1_VFX_MS={}, P1_VFX_SELF={}, P1_VFX_LEAD={};   // per effect: how long it draws (ms, or a function of its params), whether it draws on the member, not the foe, and how many ms before the contact it starts (a projectile in flight; 0 when not named)
const P1_VFX={   // (g,x,y,u,z,p): z scales the effect so it reads on a phone; p is its params or null
  vfx_core_clobber_impact:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.strokeStyle='#ffd23a'; g.lineWidth=4*z;
    for(let k=0;k<8;k++){ const a=k*Math.PI/4,r0=(10+u*14)*z,r1=(24+u*40)*z; g.beginPath(); g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); g.stroke(); } g.restore(); },
  vfx_red_stud_led_ping:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.fillStyle='#ff3030'; g.beginPath(); g.arc(x,y,(5+u*4)*z,0,7); g.fill(); g.strokeStyle='#ff3030'; g.lineWidth=3*z; g.beginPath(); g.arc(x,y,(8+u*30)*z,0,7); g.stroke(); g.restore(); }
};
// Draw each cue of the clip from the impact (a projectile from P1_VFX_LEAD before it, so it lands on the impact), for its own length (P1_VFX_MS, 500 ms when it names none), on the first foe still standing (fight coordinates,
// the same space the foes are drawn in). A cue in P1_VFX_SELF (a heal) draws on the member playing the clip instead: the draw call passes where it stands (A).
// The effects of the Stage 2C library live in engine/vfx-library.js and add themselves to P1_VFX, P1_VFX_MS and P1_VFX_SELF.
function p1DrawVfx(g,S,ms,A){ const M=p1Meta(S.id); if(!M) return;
  const f=B2.foes.find(q=>!q.dead); if(!f) return; const h=f.def.sprite.length*f.sc, x=f.px, y=f.py-h*.5, from=A?{x:A.x,y:A.y}:null;   // from: where the member playing the clip stands, for a projectile's start and a tether's end
  for(const id of M.vfx){ const fn=P1_VFX[id]; if(!fn) continue; const p=(M.fxp&&M.fxp[id])||null, Ld=P1_VFX_LEAD[id], lead=typeof Ld==='function'?Ld(p):(Ld||0), L=P1_VFX_MS[id], len=typeof L==='function'?L(p):(L||500), d=ms-M.impact_ms+lead; if(d<0||d>len) continue;
    if(P1_VFX_SELF[id]){ if(A) fn(g,A.x,A.y,d/len,1.8,Object.assign({_h:A.h,_from:from},p)); } else fn(g,x,y,d/len,1.8,Object.assign({_h:h,_from:from},p)); } }
