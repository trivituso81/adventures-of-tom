// Pass-1 draft review extras (Battle Lab > PASS-1 DRAFT REVIEW): native 1.0x playback, approach and return slides,
// hit-stop, screen shake and small procedural Canvas effects on the impact. vfxfight1: the same effects also draw in a real Battle 3 fight (engine/b3-vfx.js). Code-drawn effects only; no painted poses.
// Meta comes from data/pass1-meta.js. Everything is a no-op for a clip with no entry.
const P1_SLIDE_MS=350;
function p1Meta(id){ const k=String(id).replace(/_/g,'-');   // the clip key is pf_justin_bb_basic, the packet id pf-justin-bb-basic
  const M=typeof PASS1_META!=='undefined'?PASS1_META[k]:null; if(M) return M;   // a row measured on the baked video wins
  return typeof gtMeta==='function'?gtMeta(k):null; }   // else the manifest's contactSec and hitStopFrames (engine/guide-timing.js)
// Time into the clip with hit-stop applied: the clock holds still for hit_stop_frames after the impact.
// A manifest row (from:'manifest', engine/guide-timing.js) counts them at the 24 fps the clips were made at; a row measured on the baked video (data/pass1-meta.js) counts them at 60 fps.
function p1Clock(S,ms){ const M=p1Meta(S.id); if(!M||!M.hit_stop_frames) return ms; const hold=M.hit_stop_frames*1000/(M.from==='manifest'?24:60);
  if(ms<M.impact_ms) return ms; if(ms<M.impact_ms+hold) return M.impact_ms; return ms-hold; }
// Slide lead: a clip that approaches the foe first slides out for P1_SLIDE_MS holding its first picture, plays, then slides back for as long.
function p1Lead(S){ const M=p1Meta(S.id); return M&&M.approach?P1_SLIDE_MS:0; }
// 0..1 slide amount: out over the lead, held through the clip, back over the same time after it.
function p1Slide(S,wall0,lead,ms,len){ if(!lead) return 0; const a=Math.min(1,Math.max(0,wall0/lead)); const b=ms>=len?Math.max(0,1-(ms-len)/lead):1; return Math.min(a,b); }
function p1Shake(S,ms){ const M=p1Meta(S.id); if(!M||!M.screen_shake_px) return 0; const d=ms-M.impact_ms; if(d<0||d>320) return 0;
  return Math.round(Math.sin(d*0.09)*M.screen_shake_px*(1-d/320)); }
const P1_VFX_MS={}, P1_VFX_SELF={}, P1_VFX_LEAD={}, P1_VFX_LAYER={};   // per effect: how long it draws (ms, or a function of its params), whether it draws on the member, not the foe, and how many ms before the contact it starts (a projectile in flight; 0 when not named)
const P1_VFX={   // (g,x,y,u,z,p): z scales the effect so it reads on a phone; p is its params or null
  vfx_core_clobber_impact:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.strokeStyle='#ffd23a'; g.lineWidth=4*z;
    for(let k=0;k<8;k++){ const a=k*Math.PI/4,r0=(10+u*14)*z,r1=(24+u*40)*z; g.beginPath(); g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); g.stroke(); } g.restore(); },
  vfx_red_stud_led_ping:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.fillStyle='#ff3030'; g.beginPath(); g.arc(x,y,(5+u*4)*z,0,7); g.fill(); g.strokeStyle='#ff3030'; g.lineWidth=3*z; g.beginPath(); g.arc(x,y,(8+u*30)*z,0,7); g.stroke(); g.restore(); }
};
// P1_VFX_LAYER: where in a fight's draw order an effect belongs, the library's own `layer` (art-factory/aot-stage2c-vfx-library-v11.json; tools/guide_timing_test.py checks the two agree):
// ground_decal and behind_units draw under the units, unit_overlay over them, foreground_sweep over the whole field and screen_lighting last, under the numbers. An id with no layer is a unit_overlay.
const P1_LAYERS=['ground_decal','behind_units','unit_overlay','foreground_sweep','screen_lighting'];
P1_VFX_LAYER.vfx_red_stud_led_ping='unit_overlay';
const p1Layer=id=>P1_VFX_LAYER[id]||'unit_overlay';
// vfxfight1: a library effect is drawn code, and a fight must never break because one of them throws. Each effect gets the canvas through a guard that counts save() and restore():
// when the effect throws half way (a clip() or a transform it never undid), unwind() puts the canvas back where it was, and a restore() the effect has no save() for is ignored.
function p1Guard(g){ let depth=0; const real=g;
  const px=new Proxy(real,{get(t,k){ if(k==='save') return ()=>{ depth++; t.save(); }; if(k==='restore') return ()=>{ if(depth>0){ depth--; t.restore(); } }; const v=t[k]; return typeof v==='function'?v.bind(t):v; }, set(t,k,v){ t[k]=v; return true; }});
  return {g:px,unwind(){ while(depth>0){ depth--; try{ real.restore(); }catch(e){ break; } } real.globalAlpha=1; real.globalCompositeOperation='source-over'; real.shadowBlur=0; real.shadowColor='rgba(0,0,0,0)'; }}; }
function p1Fault(id,err){ try{ if(typeof gameFault==='function') gameFault('effect '+id,err); else if(typeof console!=='undefined') console.error('fault in effect '+id,err); }catch(e){} }
// Draw each cue of the clip from the impact (a projectile from P1_VFX_LEAD before it, so it lands on the impact), for its own length (P1_VFX_MS, 500 ms when it names none), on the first foe still standing (fight coordinates,
// the same space the foes are drawn in). A cue in P1_VFX_SELF (a heal, a shield, a set-piece on the party side) draws on the member playing the clip instead: the draw call passes where it stands (A), and p._foe tells it where the foe is.
// The effects of the Stage 2C library live in engine/vfx-library.js and add themselves to P1_VFX, P1_VFX_MS and P1_VFX_SELF.
// O (optional, vfxfight1; engine/b3-vfx.js is the caller): meta = the move's timing row when the move is not named by a clip; layer = draw only the effects of that layer; only = draw only this one effect;
// target = {x,y,h} where an effect that draws on the foe lands (default the first foe standing); foe = {x,y,h} where the foe is, for the effects that aim at it (default the target); dead = an object that
// remembers the effects that threw, so one that throws is skipped for the rest of the cue. With no O the call is what the Battle Lab review has always made.
function p1DrawVfx(g,S,ms,A,O){ O=O||{}; const M=O.meta||p1Meta(S&&S.id); if(!M||!M.vfx) return;
  let tg=O.target||O.foe||null, foe=O.foe||null;
  if(!tg){ const f=typeof B2!=='undefined'&&B2.foes&&B2.foes.find(q=>!q.dead); if(!f) return; const h=f.def.sprite.length*f.sc; tg={x:f.px,y:f.py-h*.5,h}; }
  if(!foe) foe=tg;
  const from=A?{x:A.x,y:A.y}:null, dead=O.dead||(S&&typeof S==='object'?(S._vfxDead||(S._vfxDead={})):{});
  for(const id of M.vfx){ if(O.only&&O.only!==id) continue; const fn=P1_VFX[id]; if(!fn||dead[id]) continue; if(O.layer&&p1Layer(id)!==O.layer) continue;
    try{ const p=(M.fxp&&M.fxp[id])||null, Ld=P1_VFX_LEAD[id], lead=typeof Ld==='function'?Ld(p):(Ld||0), L=P1_VFX_MS[id], len=typeof L==='function'?L(p):(L||500), d=ms-M.impact_ms+lead; if(!(d>=0&&d<=len)) continue;
      const G=p1Guard(g);
      try{ if(P1_VFX_SELF[id]){ if(A) fn(G.g,A.x,A.y,d/len,1.8,Object.assign({_h:A.h,_from:from,_foe:foe},p)); } else fn(G.g,tg.x,tg.y,d/len,1.8,Object.assign({_h:tg.h,_from:from,_foe:foe},p)); }
      catch(err){ dead[id]=true; G.unwind(); p1Fault(id,err); }
    }catch(err){ dead[id]=true; p1Fault(id,err); } } }
