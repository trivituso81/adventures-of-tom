// Pass-1 draft review extras (Battle Lab > PASS-1 DRAFT REVIEW): native 1.0x playback, approach and return slides,
// hit-stop, screen shake and small procedural Canvas effects on the impact. Code-drawn effects only; no painted poses.
// Meta comes from data/pass1-meta.js. Everything is a no-op for a clip with no entry.
const P1_SLIDE_MS=350;
function p1Meta(id){ return typeof PASS1_META!=='undefined'?PASS1_META[String(id).replace(/_/g,'-')]||null:null; }   // the clip key is pf_justin_bb_basic, the packet id pf-justin-bb-basic
// Time into the clip with hit-stop applied: the clock holds still for hit_stop_frames at 60 fps after the impact.
function p1Clock(S,ms){ const M=p1Meta(S.id); if(!M||!M.hit_stop_frames) return ms; const hold=M.hit_stop_frames*1000/60;
  if(ms<M.impact_ms) return ms; if(ms<M.impact_ms+hold) return M.impact_ms; return ms-hold; }
// Slide lead: a clip that approaches the foe first slides out for P1_SLIDE_MS holding its first picture, plays, then slides back for as long.
function p1Lead(S){ const M=p1Meta(S.id); return M&&M.approach?P1_SLIDE_MS:0; }
// 0..1 slide amount: out over the lead, held through the clip, back over the same time after it.
function p1Slide(S,wall0,lead,ms,len){ if(!lead) return 0; const a=Math.min(1,Math.max(0,wall0/lead)); const b=ms>=len?Math.max(0,1-(ms-len)/lead):1; return Math.min(a,b); }
function p1Shake(S,ms){ const M=p1Meta(S.id); if(!M||!M.screen_shake_px) return 0; const d=ms-M.impact_ms; if(d<0||d>260) return 0;
  return Math.round(Math.sin(d*0.09)*M.screen_shake_px*(1-d/260)); }
const P1_VFX={
  vfx_core_clobber_impact:(g,x,y,u)=>{ g.save(); g.globalAlpha=1-u; g.strokeStyle='#ffd23a'; g.lineWidth=3;
    for(let k=0;k<8;k++){ const a=k*Math.PI/4,r0=10+u*14,r1=24+u*40; g.beginPath(); g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); g.stroke(); } g.restore(); },
  vfx_red_stud_led_ping:(g,x,y,u)=>{ g.save(); g.globalAlpha=1-u; g.fillStyle='#ff3030'; g.beginPath(); g.arc(x,y,4+u*3,0,7); g.fill(); g.strokeStyle='#ff3030'; g.lineWidth=2; g.beginPath(); g.arc(x,y,6+u*26,0,7); g.stroke(); g.restore(); },
  vfx_core_status_debuff_badges:(g,x,y,u)=>{ g.save(); g.globalAlpha=Math.min(1,u*3)*(1-u*.5); g.fillStyle='#5b6e8c'; for(let k=0;k<3;k++){ g.beginPath(); g.arc(x-18+k*18,y-34-u*14,6,0,7); g.fill(); } g.restore(); },
  vfx_core_timeline_chevrons:(g,x,y,u)=>{ g.save(); g.globalAlpha=1-u; g.strokeStyle='#8fd0ff'; g.lineWidth=2; for(let k=0;k<3;k++){ const cx=x+10+k*10+u*14; g.beginPath(); g.moveTo(cx,y-8); g.lineTo(cx+6,y); g.lineTo(cx,y+8); g.stroke(); } g.restore(); }
};
// Draw each cue of the clip for 500 ms from the impact. (x,y) is the foe-side impact point in fight coordinates.
function p1DrawVfx(g,S,ms,x,y){ const M=p1Meta(S.id); if(!M) return; const d=ms-M.impact_ms; if(d<0||d>500) return;
  for(const id of M.vfx){ const f=P1_VFX[id]; if(f) f(g,x,y,d/500); } }
