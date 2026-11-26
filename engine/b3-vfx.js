'use strict';
// engine/b3-vfx.js (vfxfight1, 2026-11-26): the Stage 2C library effects (engine/vfx-library.js) in a real Battle 3 fight, not only in the Battle Lab pass-1 review.
// A family move's effects come from the move's own timing row: the clip's row when it has one (p1Meta, engine/pass1-vfx.js) or, for every other move, the row the Battle Guide's manifest
// holds for that move id (gtMetaMove, engine/guide-timing.js). b3PlayMove (engine/b3-play.js) arms one cue per move at the moment the move's first hit lands (b3vArm); a cue then draws
// its effects in b3Draw, each effect at the point of the draw order its library `layer` names (P1_VFX_LAYER, engine/pass1-vfx.js), through p1DrawVfx, which is the same call the review makes:
//   ground_decal, behind_units  after the floor's hazards, before the units      screen_lighting  over everything, under the numbers and the big words
//   unit_overlay                after the units, before things in flight         foreground_sweep over the field, after the stage's own front pieces
// Where an effect lands: the effects that draw on the foe land on the move's target (the foe it hits; an ally when the move is aimed at one) and the unit-sized ones (clobber, pops, composure,
// chevrons, badges) once on each target; the heal and the shield land on each ally the move names; a set-piece that draws on the member plays on the caster, where it stands at that moment.
// A fight never breaks because of an effect: p1DrawVfx guards each one (a throw is logged once and that effect stops for the cue), and the draw here is wrapped again, so a cue that fails is dropped.
// Nothing here changes the fight: the rules finished before the first beat played, and nothing waits on an effect.
// Hit stop (hitstop1, 2026-11-26): when a family move's first hit shows, the member who made the move and the foes it hits are held on the picture they show at that moment for
// hitStopFrames / 24 seconds (data/guide-manifest.json: frames at the 24 fps the clips were made at; the row is the move's own, found by move id through gtMetaMove), then they show where the
// fight's clock is. Only what is DRAWN is held: b3Draw draws those units at a held time (b3vUnit); the battle clock, the queue of beats, the rules, the clips and every other effect (library
// effects, numbers, bursts, the other units) run at their normal pace, and nothing waits for a hold. A move with hitStopFrames 0, with no manifest row, with no hit, or a foe's move changes nothing.
// A hold that throws is dropped and the unit is drawn as it always was.
const B3V={cues:[],holds:[],fault:0};
const B3V_FPS=24, B3V_HOLD_MAX=.5;   // the manifest's frames are at 24 per second; the longest manifest row is 8 frames (.33 s), never hold more than half a second
function b3vReset(){ B3V.cues.length=0; B3V.holds.length=0; }
// The effects that draw on every target the move names (unit-sized, library layer unit_overlay); every other effect draws once, on the first target.
const B3V_EACH=new Set(['vfx_core_clobber_impact','vfx_core_detonation_pops','vfx_core_composure_break','vfx_core_timeline_chevrons','vfx_core_status_debuff_badges']);
// The two effects that are drawn on the member in the Lab but belong on the ally a move is aimed at: each ally the move names gets one.
const B3V_ALLY=new Set(['vfx_core_heal_cleanse','vfx_core_shield_ward']);
// The move's timing row, or null (a foe's move, a move the manifest does not name, a clip with no effect).
function b3vMeta(head,cid){
  if(!head||head.t!=='act'||!head.src||head.src[0]==='f') return null;
  let M=null;
  try { M=(cid&&typeof p1Meta==='function'&&p1Meta(cid))||null; if(!(M&&M.vfx&&M.vfx.length)) M=typeof gtMetaMove==='function'?gtMetaMove(head.id):null; } catch(e) { M=null; }
  return M&&M.vfx&&M.vfx.length&&typeof P1_VFX!=='undefined'&&M.vfx.some(id=>P1_VFX[id])?M:null;
}
// The hold, in seconds, the manifest gives this move (0 for none). The manifest's own row only: a row measured on a baked clip (data/pass1-meta.js) counts frames at 60 fps for the Battle Lab review.
function b3vHitStopSec(head){
  try { const R=typeof gtMetaMove==='function'?gtMetaMove(head.id):null,f=R&&R.hit_stop_frames; return typeof f==='number'&&isFinite(f)&&f>0?Math.min(B3V_HOLD_MAX,f/B3V_FPS):0; } catch(e) { return 0; }
}
// Arm a hold for a family move whose first hit shows at fight time t0: the member and the foes the move is aimed at. A unit plays one move at a time: its older hold is dropped.
function b3vHold(head,t0){
  if(!head||head.t!=='act'||!head.src||head.src[0]==='f'||!isFinite(t0)) return;
  const dur=b3vHitStopSec(head); if(!(dur>0)) return;
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
// Arm the move's effects to play from the moment its first hit lands, `sec` seconds from now (the same number the move's own timeline reveals the hit at). Returns true when a library
// projectile (proj_*) is armed, so the default ball that a throw or a cast sends across is left out. hit: the move has a hit that shows at `sec` (then its hit stop is armed too, even when
// the move has no effect). Never throws.
function b3vArm(head,cid,sec,hit){
  try { if(hit&&typeof sec==='number'&&isFinite(sec)) b3vHold(head,B3P.t+Math.max(0,sec)); } catch(err) { try { gameFault('hit stop armed',err); } catch(e) {} }
  try {
    const M=b3vMeta(head,cid); if(!M||typeof sec!=='number'||!isFinite(sec)) return false;
    const tg=(head.tgts&&head.tgts.length?head.tgts:[head.src]).slice(), t0=B3P.t+Math.max(0,sec); let maxLen=0;
    for(const id of M.vfx){ const L=P1_VFX_MS[id],p=(M.fxp&&M.fxp[id])||null; try { maxLen=Math.max(maxLen,(typeof L==='function'?L(p):(L||500))); } catch(e) { maxLen=Math.max(maxLen,6000); } }
    B3V.cues=B3V.cues.filter(c=>c.src!==head.src);   // a unit plays one move at a time: an older cue of theirs that never finished is dropped
    B3V.cues.push({M,id:head.id,src:head.src,tgts:tg,t0,end:t0+(maxLen+500)/1000,dead:{}});
    return M.vfx.some(id=>/^proj_/.test(id)&&P1_VFX[id]);
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
// Draw every active cue's effects of one layer at fight time t. Called from b3Draw at each layer's point.
function b3vDraw(layer,t){
  if(!B3V.cues.length||typeof p1DrawVfx!=='function') return;
  for(const c of B3V.cues.slice()){
    try {
      if(t>c.end){ B3V.cues.splice(B3V.cues.indexOf(c),1); continue; }
      if(t<c.t0-1.5) continue;   // armed ahead of its hit: a projectile starts up to its flight time before it
      const ms=c.M.impact_ms+(t-c.t0)*1000,tgs=c.tgts.map(k=>({k,u:b3Unit(B3.F,k),g:b3vGeo(k)})).filter(q=>q.u&&q.g);
      if(!tgs.length) { B3V.cues.splice(B3V.cues.indexOf(c),1); continue; }   // everyone it aimed at is gone
      const caster=b3vGeo(c.src),foes=tgs.filter(q=>q.u.side==='foe'),aim=(foes[0]||tgs[0]).g;
      let foe=foes.length?foes[0].g:null;
      if(!foe){ const f=B3.F.foes.find(q=>B3P.foe[q.key]&&!(B3.view&&B3.view.u[q.key]&&B3.view.u[q.key].ko)); foe=f?b3vGeo(f.key):aim; }
      const base={meta:c.M,layer,foe,dead:c.dead};
      for(const id of c.M.vfx){
        if(!P1_VFX[id]||c.dead[id]||p1Layer(id)!==layer) continue;
        const one=Object.assign({},base,{only:id});
        if(P1_VFX_SELF[id]){
          if(B3V_ALLY.has(id)){ const al=tgs.filter(q=>q.u.side!=='foe'); for(const q of (al.length?al:[{g:caster}])) if(q.g) p1DrawVfx(gfx,{id:c.id},ms,q.g,one); }
          else if(caster) p1DrawVfx(gfx,{id:c.id},ms,caster,one);
        } else if(B3V_EACH.has(id)) { for(const q of tgs.slice(0,4)) p1DrawVfx(gfx,{id:c.id},ms,caster,Object.assign({},one,{target:q.g})); }
        else p1DrawVfx(gfx,{id:c.id},ms,caster,Object.assign({},one,{target:aim}));
      }
    } catch(err) {   // the cue could not be drawn at all (a unit that is gone): drop it, say so once, and carry on
      const i=B3V.cues.indexOf(c); if(i>=0) B3V.cues.splice(i,1); B3V.fault++; try { gameFault('effects',err); } catch(e) {}
    }
  }
}
