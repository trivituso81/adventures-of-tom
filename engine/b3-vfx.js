'use strict';
// engine/b3-vfx.js (vfxfight1 2026-11-26, movebench4 2026-11-26): what a family move plays at the moment its first hit lands, in a real Battle 3 fight, read from the move's spec (engine/b3-spec.js, data/moves/<slug>.json):
// the hit stop (timing.hitStop), the screen shake (timing.shake) and the Stage 2C library effects (effects: fx, at, on, params, off). A move with no spec plays none of it and nothing waits.
// The library effects (engine/vfx-library.js) are drawn code and register themselves in the tables below (P1_VFX, P1_VFX_MS, P1_VFX_SELF, P1_VFX_LEAD, P1_VFX_LAYER, P1_VFX_ON); this file is loaded before that one.
// b3PlayMove (engine/b3-play.js) arms one cue per move at the moment its first hit lands (b3vArm); a cue then draws its effects in b3Draw, each effect at the point of the draw order its library `layer` names
// (P1_VFX_LAYER, the library's own `layer` field), through p1DrawVfx:
//   ground_decal, behind_units  after the floor's hazards, before the units      screen_lighting  over everything, under the numbers and the big words
//   unit_overlay                after the units, before things in flight         foreground_sweep over the field, after the stage's own front pieces
// Where an effect lands is its `on` (auto, target, each_target, self, each_ally, field). auto is the effect's own default (P1_VFX_ON, else self for an effect that draws on the member, else target): the unit-sized ones
// (clobber, pops, composure, chevrons, badges) land once on each target, the heal and the shield on each ally the move names, a set-piece that draws on the member on the caster where it stands at that moment, every other
// effect once on the move's target (the foe it hits; an ally when the move is aimed at one). `at` is when it starts: at the contact (the default), so many seconds from it, a named moment of the move, or so many seconds from the move's start.
// A fight never breaks because of an effect: p1DrawVfx guards each one (a throw is logged once and that effect stops for the cue), and the draw here is wrapped again, so a cue that fails is dropped.
// Nothing here changes the fight: the rules finished before the first beat played, and nothing waits on an effect.
// Hit stop (hitstop1, 2026-11-26): when a family move's first hit shows, the member who made the move and the foes it hits are held on the picture they show at that moment for timing.hitStop / 24 seconds
// (frames at the 24 fps the clips were made at). Only what is DRAWN is held: b3Draw draws those units at a held time (b3vUnit); the battle clock, the queue of beats, the rules, the clips and every other effect run at their
// normal pace, and nothing waits for a hold. A move with a hitStop of 0, with no spec, with no hit, or a foe's move changes nothing. A hold that throws is dropped and the unit is drawn as it always was.
// Screen shake (movebench4): timing.shake pixels, a short side to side shake of the whole field for a third of a second from the moment the first hit lands (b3vShakeAt, drawn by b3Draw).
const B3V={cues:[],holds:[],shake:null,fault:0};
const B3V_FPS=24, B3V_HOLD_MAX=.5, B3V_SHAKE_MS=320;   // the frames are at 24 per second; the longest hold in a spec is 8 frames (.33 s), never hold more than half a second
function b3vReset(){ B3V.cues.length=0; B3V.holds.length=0; B3V.shake=null; }
// The library effects register themselves here (engine/vfx-library.js): how long each draws (ms, or a function of its params), whether it draws on the member, not the foe, how many ms before the contact it starts (a projectile in flight; 0 when
// not named), the layer of the draw order it belongs to, and the `on` it has when a spec says auto (each_target, each_ally; nothing here means the target, or the member for an effect that draws on the member).
const P1_VFX_MS={}, P1_VFX_SELF={}, P1_VFX_LEAD={}, P1_VFX_LAYER={}, P1_VFX_ON={};
const P1_VFX={   // (g,x,y,u,z,p): z scales the effect so it reads on a phone; p is its params or null
  vfx_core_clobber_impact:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.strokeStyle='#ffd23a'; g.lineWidth=4*z;
    for(let k=0;k<8;k++){ const a=k*Math.PI/4,r0=(10+u*14)*z,r1=(24+u*40)*z; g.beginPath(); g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1); g.stroke(); } g.restore(); },
  vfx_red_stud_led_ping:(g,x,y,u,z)=>{ g.save(); g.globalAlpha=1-u; g.fillStyle='#ff3030'; g.beginPath(); g.arc(x,y,(5+u*4)*z,0,7); g.fill(); g.strokeStyle='#ff3030'; g.lineWidth=3*z; g.beginPath(); g.arc(x,y,(8+u*30)*z,0,7); g.stroke(); g.restore(); }
};
// P1_VFX_LAYER: where in a fight's draw order an effect belongs, the library's own `layer` (art-factory/aot-stage2c-vfx-library-v11.json; tools/movebench/timing_test.py checks the two agree):
// ground_decal and behind_units draw under the units, unit_overlay over them, foreground_sweep over the whole field and screen_lighting last, under the numbers. An id with no layer is a unit_overlay.
const P1_LAYERS=['ground_decal','behind_units','unit_overlay','foreground_sweep','screen_lighting'];
P1_VFX_LAYER.vfx_red_stud_led_ping='unit_overlay';
const p1Layer=id=>P1_VFX_LAYER[id]||'unit_overlay';
function p1Guard(g){ let depth=0; const real=g;
  const px=new Proxy(real,{get(t,k){ if(k==='save') return ()=>{ depth++; t.save(); }; if(k==='restore') return ()=>{ if(depth>0){ depth--; t.restore(); } }; const v=t[k]; return typeof v==='function'?v.bind(t):v; }, set(t,k,v){ t[k]=v; return true; }});
  return {g:px,unwind(){ while(depth>0){ depth--; try{ real.restore(); }catch(e){ break; } } real.globalAlpha=1; real.globalCompositeOperation='source-over'; real.shadowBlur=0; real.shadowColor='rgba(0,0,0,0)'; }}; }
function p1Fault(id,err){ try{ if(typeof gameFault==='function') gameFault('effect '+id,err); else if(typeof console!=='undefined') console.error('fault in effect '+id,err); }catch(e){} }
// Draw each effect of meta M (impact_ms, vfx: [effect ids], fxp: {id: params}) from the impact (a projectile from P1_VFX_LEAD before it, so it lands on the impact), for its own length (P1_VFX_MS, 500 ms when it names none), on the
// target (fight coordinates, the same space the foes are drawn in). An effect in P1_VFX_SELF (a heal, a shield, a set-piece on the party side) draws on the member playing the move instead: the draw call passes where it stands (A),
// and p._foe tells it where the foe is. ms: the effect's clock, in milliseconds, 0 being the contact. S: the move ({id}).
// O: layer = draw only the effects of that layer; only = draw only this one effect; target = {x,y,h} where an effect that draws on the foe lands; foe = {x,y,h} where the foe is, for the effects that aim at it (default the target);
// dead = an object that remembers the effects that threw, so one that throws is skipped for the rest of the cue. With no target and no foe nothing is drawn.
function p1DrawVfx(g,S,ms,A,O){ O=O||{}; const M=O.meta; if(!M||!M.vfx) return;
  const tg=O.target||O.foe||null; if(!tg) return;
  const foe=O.foe||tg, from=A?{x:A.x,y:A.y}:null, dead=O.dead||(S&&typeof S==='object'?(S._vfxDead||(S._vfxDead={})):{});
  for(const id of M.vfx){ if(O.only&&O.only!==id) continue; const fn=P1_VFX[id]; if(!fn||dead[id]) continue; if(O.layer&&p1Layer(id)!==O.layer) continue;
    try{ const p=(M.fxp&&M.fxp[id])||null, Ld=P1_VFX_LEAD[id], lead=typeof Ld==='function'?Ld(p):(Ld||0), L=P1_VFX_MS[id], len=typeof L==='function'?L(p):(L||500), d=ms-M.impact_ms+lead; if(!(d>=0&&d<=len)) continue;
      const G=p1Guard(g);
      try{ if(P1_VFX_SELF[id]){ if(A) fn(G.g,A.x,A.y,d/len,1.8,Object.assign({_h:A.h,_from:from,_foe:foe},p)); } else fn(G.g,tg.x,tg.y,d/len,1.8,Object.assign({_h:tg.h,_from:from,_foe:foe},p)); }
      catch(err){ dead[id]=true; G.unwind(); p1Fault(id,err); }
    }catch(err){ dead[id]=true; p1Fault(id,err); } } }
// The hold, in seconds, a move's timing gives it (0 for none): timing.hitStop frames at 24 a second, never more than half a second.
function b3vHitStopSec(T){ const f=T&&T.hitStop; return typeof f==='number'&&isFinite(f)&&f>0?Math.min(B3V_HOLD_MAX,f/B3V_FPS):0; }
// Arm a hold for a family move whose first hit shows at fight time t0: the member and the foes the move is aimed at. A unit plays one move at a time: its older hold is dropped.
function b3vHold(head,t0,T){
  if(!head||head.t!=='act'||!head.src||head.src[0]==='f'||!isFinite(t0)) return;
  const dur=b3vHitStopSec(T); if(!(dur>0)) return;
  const keys=[head.src]; for(const k of (head.tgts||[])){ const u=b3Unit(B3.F,k); if(u&&u.side==='foe'&&keys.indexOf(k)<0) keys.push(k); }
  B3V.holds=B3V.holds.filter(h=>h.src!==head.src);
  B3V.holds.push({src:head.src,keys,t0,dur,start:null,r:Math.random()});   // r: the one shake the held picture keeps
}
// The time a unit is drawn at: the held moment while a hold of theirs is on, else the clock. A hold starts at the first frame drawn at or after its hit moment (so the hit's own state is already
// set), and one that the clock has already passed (a long stall) is dropped, never played late. Returns {t, h} where h is the hold that is on, or null.
function b3vTimeOf(key,t){
  let on=null;
  B3V.holds=B3V.holds.filter(h=>{
    if(h.start==null&&t>=h.t0) { if(t>=h.t0+h.dur) return false; h.start=t; }
    if(h.start!=null&&t>=h.start+h.dur) return false;   // over: the unit shows where the clock is
    if(!on&&h.start!=null&&t>=h.start&&h.keys.indexOf(key)>=0) on=h;
    return true;
  });
  return {t:on?on.start:t,h:on};
}
// Draw one unit with fn(time). While a hold is on, the unit's picture is that of the held moment and its shake stands still (Math.random answers one fixed number for the call). If the held draw
// throws, the hold is dropped, the fault is logged, and the unit is drawn at the clock as it was before this existed.
function b3vUnit(key,t,fn){
  let r; try { r=b3vTimeOf(key,t); } catch(e) { r=null; }
  if(!r||!r.h||r.t===t) return fn(t);
  const h=r.h,R=Math.random; let err=null;
  try { Math.random=()=>h.r; fn(r.t); } catch(e) { err=e; } finally { Math.random=R; }
  if(err) { B3V.holds=B3V.holds.filter(q=>q!==h); B3V.fault++; try { gameFault('hit stop',err); } catch(e) {} return fn(t); }
}
// The screen shake of a move whose first hit shows at fight time t0: the whole field shakes side to side by `px` pixels and settles over B3V_SHAKE_MS. One shake at a time (a newer one replaces an older).
function b3vShake(t0,px){ if(!(px>0)||!isFinite(t0)) return; B3V.shake={t0,px}; }
// {x,y} to move the field by at fight time t, or null. Deterministic (a sine, no random numbers), so a moment is one picture.
function b3vShakeAt(t){ const s=B3V.shake; if(!s) return null; const d=(t-s.t0)*1000; if(d<0) return null; if(d>B3V_SHAKE_MS) { if(d>B3V_SHAKE_MS+2000) B3V.shake=null; return null; }
  return {x:Math.round(Math.sin(d*0.09)*s.px*(1-d/B3V_SHAKE_MS)),y:0}; }
// When one of a cue's effects starts, in seconds from the contact (the moment the first hit lands): 0 at the contact, `plus` after or before it, a moment the move named (a mark of its stage run), or so many seconds from the move's start.
function b3vAtSec(c,e){ const a=e.at; if(a==null||a==='contact') return 0; const pl=typeof a.plus==='number'&&isFinite(a.plus)?a.plus:0;
  if(typeof a.sec==='number'&&isFinite(a.sec)) return c.tArm+a.sec-c.t0;
  if(typeof a.mark==='string') { const R=typeof B3G!=='undefined'&&B3G.run; if(R&&R.marks&&typeof R.marks[a.mark]==='number'&&typeof R.t0==='number') return R.t0+R.marks[a.mark]-c.t0+pl; return pl; }
  return pl; }
// Arm the move's effects, hit stop and shake to play from the moment its first hit lands, `sec` seconds from now (the same number the move's own timeline reveals the hit at). Returns true when a library
// projectile (proj_*) is armed, so the default ball that a throw or a cast sends across is left out. hit: the move has a hit that shows at `sec` (then its hit stop and shake are armed too, even when
// the move has no effect). Never throws.
function b3vArm(head,cid,sec,hit){
  let T=null; try { T=msTiming(head); } catch(err) { T=null; }
  try { if(hit&&T&&!T.noHit&&typeof sec==='number'&&isFinite(sec)) { b3vHold(head,B3P.t+Math.max(0,sec),T); if(head&&head.src&&head.src[0]!=='f') b3vShake(B3P.t+Math.max(0,sec),T.shake); } } catch(err) { try { gameFault('hit stop armed',err); } catch(e) {} }
  try {
    if(!head||head.t!=='act'||!head.src||head.src[0]==='f'||typeof sec!=='number'||!isFinite(sec)) return false;   // a foe's move draws no library effect (phase 14)
    const E=msEffects(head); if(!E.length||!E.some(e=>P1_VFX[e.fx]||b3gBench())) return false;   // movebench7: in the workbench preview an effect with no drawer still arms, to show its pink box
    const tg=(head.tgts&&head.tgts.length?head.tgts:[head.src]).slice(), t0=B3P.t+Math.max(0,sec), imp=T&&T.impactMs!=null?T.impactMs:0; let maxLen=0;
    const cue={M:{impact_ms:imp,vfx:E.map(e=>e.fx),fxp:Object.fromEntries(E.filter(e=>e.params).map(e=>[e.fx,e.params]))},fx:E,id:head.id,src:head.src,tgts:tg,t0,end:t0,dead:{},tArm:B3P.t};
    for(const e of E){ const L=P1_VFX_MS[e.fx],p=e.params||null; let len; try { len=(typeof L==='function'?L(p):(L||500)); } catch(x) { len=6000; } maxLen=Math.max(maxLen,len+b3vAtSec(cue,e)*1000); }
    cue.end=t0+(maxLen+500)/1000;
    B3V.cues=B3V.cues.filter(c=>c.src!==head.src);   // a unit plays one move at a time: an older cue of theirs that never finished is dropped
    B3V.cues.push(cue);
    for(const e of E) if(e.sfx&&typeof b3After==='function'&&typeof b3Sfx==='function') b3After(Math.max(0,sec+b3vAtSec(cue,e)),()=>b3Sfx(e.sfx));
    return E.some(e=>/^proj_/.test(e.fx)&&P1_VFX[e.fx]);
  } catch(err) { try { gameFault('effects armed',err); } catch(e) {} return false; }
}
// {x,y,h}: the middle of a unit and its height, in fight coordinates. A foe stands where its box says; a family member where it was last drawn (it may have run over to the monster),
// else at home.
function b3vGeo(key){
  const u=b3Unit(B3.F,key); if(!u) return null;
  if(u.side==='foe'&&!B3P.foe[key]) return null;   // not standing yet, or not any more
  if(u.side!=='foe'){ const d=B3P.at&&B3P.at[key]; if(d) return {x:d.cx,y:d.base-Math.round(d.h*.5),h:d.h}; }
  const S=b3Spot(key); return {x:S.x,y:S.y,h:Math.max(1,S.base-S.top)};
}
// movebench7: an effect id with no drawer (a library entry that is not built) is a pink dashed box in the workbench preview only (cfg.bench; claude/movebench-plan.md section e.3). It sits on the target for 0.9 s from the
// effect's moment and says what it is and that it is not final. The game never draws it.
function b3vPink(id,e,c,t,aim){
  const st=c.t0+b3vAtSec(c,e), u=(t-st)/.9; if(!(u>=0&&u<=1)||!aim) return;
  const w=84,h=54,x=aim.x-w/2,y=aim.y-h/2; gfx.save(); gfx.globalAlpha=u<.8?1:(1-u)/.2; gfx.fillStyle='rgba(255,91,210,.22)'; gfx.fillRect(x,y,w,h); gfx.strokeStyle='#ff5bd2'; gfx.lineWidth=2; gfx.setLineDash([6,4]); gfx.strokeRect(x,y,w,h);
  gfx.setLineDash([]); gfx.fillStyle='#ff5bd2'; gfx.font='700 9px sans-serif'; gfx.textAlign='center'; gfx.textBaseline='middle';
  gfx.fillText(String(id).replace(/^(vfx_core_|vfx_|proj_|setpiece_)/,'').replace(/_/g,' ').slice(0,18),aim.x,aim.y-5); gfx.fillText('NOT FINAL',aim.x,aim.y+9); gfx.restore();
}
// Draw every active cue's effects of one layer at fight time t. Called from b3Draw at each layer's point.
function b3vDraw(layer,t){
  if(!B3V.cues.length||typeof p1DrawVfx!=='function') return;
  for(const c of B3V.cues.slice()){
    try {
      if(t>c.end){ B3V.cues.splice(B3V.cues.indexOf(c),1); continue; }
      if(t<c.t0-1.5+Math.min(0,...c.fx.map(e=>b3vAtSec(c,e)))) continue;   // armed ahead of its hit: a projectile starts up to its flight time before it
      const tgs=c.tgts.map(k=>({k,u:b3Unit(B3.F,k),g:b3vGeo(k)})).filter(q=>q.u&&q.g);
      if(!tgs.length) { B3V.cues.splice(B3V.cues.indexOf(c),1); continue; }   // everyone it aimed at is gone
      const caster=b3vGeo(c.src),foes=tgs.filter(q=>q.u.side==='foe'),aim=(foes[0]||tgs[0]).g;
      let foe=foes.length?foes[0].g:null;
      if(!foe){ const f=B3.F.foes.find(q=>B3P.foe[q.key]&&!(B3.view&&B3.view.u[q.key]&&B3.view.u[q.key].ko)); foe=f?b3vGeo(f.key):aim; }
      for(const e of c.fx){
        const id=e.fx; if(!P1_VFX[id]){ if(b3gBench()&&layer==='unit_overlay') b3vPink(id,e,c,t,aim); continue; }   // no drawer: the preview shows a pink box, the game shows nothing
        if(c.dead[id]||p1Layer(id)!==layer) continue;
        const ms=c.M.impact_ms+(t-c.t0-b3vAtSec(c,e))*1000,Me={impact_ms:c.M.impact_ms,vfx:[id],fxp:e.params?{[id]:e.params}:null};
        const base={meta:Me,layer,foe,dead:c.dead},S={id:c.id},self=!!P1_VFX_SELF[id],on=e.on&&e.on!=='auto'?e.on:(P1_VFX_ON[id]||(self?'self':'target'));
        const al=tgs.filter(q=>q.u.side!=='foe');
        if(on==='each_ally'){ for(const q of (al.length?al:[{g:caster}])) if(q.g) { if(self) p1DrawVfx(gfx,S,ms,q.g,base); else p1DrawVfx(gfx,S,ms,caster,Object.assign({},base,{target:q.g})); } }
        else if(on==='each_target'){ for(const q of tgs.slice(0,4)) { if(self) { if(q.g) p1DrawVfx(gfx,S,ms,q.g,base); } else p1DrawVfx(gfx,S,ms,caster,Object.assign({},base,{target:q.g})); } }
        else if(on==='self'){ if(caster) { if(self) p1DrawVfx(gfx,S,ms,caster,base); else p1DrawVfx(gfx,S,ms,caster,Object.assign({},base,{target:caster})); } }
        else if(on==='field') p1DrawVfx(gfx,S,ms,caster,Object.assign({},base,{target:foe}));
        else if(self) { if(caster) p1DrawVfx(gfx,S,ms,caster,base); }
        else p1DrawVfx(gfx,S,ms,caster,Object.assign({},base,{target:aim}));
      }
    } catch(err) {   // the cue could not be drawn at all (a unit that is gone): drop it, say so once, and carry on
      const i=B3V.cues.indexOf(c); if(i>=0) B3V.cues.splice(i,1); B3V.fault++; try { gameFault('effects',err); } catch(e) {}
    }
  }
}
