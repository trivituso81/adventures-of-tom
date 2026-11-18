'use strict';
// engine/clips.js: battle clips. A clip is a short hand-off from still painted poses to real animation: a strip of
// frames cut from an AI video of the character (tools/clip-bake/bake_clip.py), with a marked impact frame.
// Loaded after engine/painted.js; the data/clips/*.js files (generated) load right after and call bclipDefine.
//
// A clip frame is an ordinary painted frame (engine/painted.js): blank row strings tagged with its place in the clip's
// atlas. The baker sizes the rows so the STANDING figure is exactly as many rows tall as the owner's battle idle, so
// a clip is drawn at the owner's own sprite scale and follows BATTLE_SIZE like every other pose.
//
// In a move (engine/<name>-moves.js), with ST = RFX.ST:
//   const C=ST.clip('rose_strike',{onImpact}); // null if the clip does not exist
//   C.dur     how long the clip plays, in ms at 1x (the timeline's own speed setting applies on top)
//   C.impact  ms from the clip's start to its impact frame (for the High-Five window and sounds); the hit itself goes in
//             ST.clip(id,{onImpact:fn}), which runs when the impact frame is really on screen. C.fire() forces it
//             (a safety net at the end of the move's timeline).
//   C.f       the frame chooser for ST.keys: {t:T0,x,y,f:C.f},{t:T0+C.dur,...} plays the whole clip over that segment
//   C.reach   {dx,up}: the leading point (fist) on the impact frame, battle px left of her middle and above her feet
// Memory: a clip atlas is lazy (never loaded at boot). It loads when a fight that uses it starts (bclipWanted) and is
// released with the other fight sheets (paintedTick).
const BCLIPS={};
function bclipDefine(id,D) {
  const fw=D.w*D.k,fh=D.h*D.k,rects={},blank='.'.repeat(D.w),frames=[];
  for(let i=0;i<D.n;i++) rects[i]=[(i%D.cols)*fw,Math.floor(i/D.cols)*fh,fw,fh];
  paintedAtlas('clip_'+id,D.src,rects,D.k);
  for(let i=0;i<D.n;i++) { const rows=paintRows(Array(D.h).fill(blank),'clip_'+id,i,false);
    rows._ft={dx:D.feet[i][0],w:D.feet[i][1]};   // where the shadow goes (feetOf, engine/battle-draw.js): measured by the baker
    frames.push(rows); }
  BCLIPS[id]=Object.assign({id,frames},D);
}
// The frame showing at ms into the clip.
function bclipFrameAt(C,ms) { let i=0; while(i<C.n-1&&ms>=C.ms[i+1]) i++; return C.frames[i]; }
// Which clips the current fight needs. For now clips play only in the Battle Lab's CLIP TEST fight (B2.labClip).
function bclipWanted() {
  const out=[]; if(typeof B2==='undefined'||!B2.active||!B2.labClip) return out;
  for(const id in BCLIPS) if(B2.party.some(u=>u.id===BCLIPS[id].owner)) out.push(id);
  return out;
}
function bclipReady(id) { const a=PAINTED['clip_'+id]; return !!(a&&a.ready); }
// ST.clip(id,{onImpact}): onImpact runs once, the moment the impact frame is first drawn. The body path runs on the
// frame clock and the move timeline on timers, and on a busy phone the two drift apart, so a hit that must sit on a
// clip frame is fired by the clip itself (after the draw, never inside it), not by a timeline time.
RFX.ST.clip=(id,o={})=>{ const C=BCLIPS[id]; if(!C) return null;
  const sc=(BATTLE_SPRITES[C.owner]||{scale:1}).scale; let fired=false;
  const R={dur:C.dur,impact:C.ms[C.impact],reach:{dx:C.reach[0]*sc,up:C.reach[1]*sc},hit:false};
  R.fire=()=>{ if(fired) return; fired=true; R.hit=true; if(o.onImpact) Promise.resolve().then(()=>{ try { o.onImpact(); } catch(err) { gameFault('clip',err); } }); };
  R.f=u=>{ const ms=u*C.dur; if(ms>=R.impact) R.fire(); return bclipFrameAt(C,ms); };
  return R; };
