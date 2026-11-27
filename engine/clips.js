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
//   const C=ST.clip('rose_boop',{onImpact}); // null if the clip does not exist
//   C.dur     how long the clip plays, in ms at 1x (the timeline's own speed setting applies on top)
//   C.impact  ms from the clip's start to its impact frame (for the High-Five window and sounds); the hit itself goes in
//             ST.clip(id,{onImpact:fn}), which runs when the impact frame is really on screen. C.fire() forces it
//             (a safety net at the end of the move's timeline).
//   C.f       the frame chooser for ST.keys: {t:T0,x,y,f:C.f},{t:T0+C.dur,...} plays the whole clip over that segment
//   C.reach   {dx,up}: the leading point (fist) on the impact frame, battle px left of her middle and above her feet
// Kinds (D.kind, set by the baker; clipkinds1):
//   strike  (default) a one-shot move with an impact frame, played by a move through ST.clip.
//   loop    an idle that repeats: a monster waiting (D.wrap: forward only, see bclipLoopFrame). b2FoeFrame (engine/battle2-ui.js) draws it instead of the painted
//           stance whenever the monster is not winding up, attacking or being hit. It plays forward, then backward
//           (bclipLoopFrame), so the repeat has no jump: a video's last picture never matches its first (the video
//           model is only given the first picture).
//   state   a one-shot that ends in a held pose: a party member going out of the fight (asleep). drawBattle
//           (engine/battle-draw.js) plays it once from the moment they go down and holds its last picture.
// bclipFor(owner,kind) gives the loaded clip of that kind for a party member or monster id, or null.
// Picture (clippack1): each frame is trimmed to its own painted pixels and the trimmed frames are packed tightly, so the
// picture the phone holds in memory is under half the size of a grid of full frames. D.rects[i] says where frame i is.
// Memory: a clip atlas is lazy (never loaded at boot). It loads when a fight that uses it starts (bclipWanted) and is
// released with the other fight sheets (paintedTick).
const BCLIPS={};
function bclipDefine(id,D) {
  const fw=D.w*D.k,fh=D.h*D.k,rects={},blank='.'.repeat(D.w),frames=[];
  for(let i=0;i<D.n;i++) rects[i]=D.rects[i].concat(fw,fh);   // x,y,w,h in the picture; ox,oy inside the full fw x fh frame (paintedCanvas puts it back)
  paintedAtlas('clip_'+id,D.src,rects,D.k);
  for(let i=0;i<D.n;i++) { const rows=paintRows(Array(D.h).fill(blank),'clip_'+id,i,false);
    rows._clip=true; rows._ft={dx:D.feet[i][0],w:D.feet[i][1]};   // where the shadow goes (feetOf, engine/battle-draw.js): measured by the baker
    if(D.below) rows._below=D.below;   // rose-lava-xftr: the frame reaches this many rows under the feet line (bake_clip.py --below); Battle 3 lowers it
    frames.push(rows); }
  BCLIPS[id]=Object.assign({id,frames,kind:'strike'},D);
}
// The frame showing at ms into the clip.
function bclipFrameAt(C,ms) { let i=0; while(i<C.n-1&&ms>=C.ms[i+1]) i++; return C.frames[i]; }
// Which clips the current fight needs. For now clips play only in Battle Lab clip fights (B2.labClip): CLIP TEST: ROSE and the chapter reviews.
// A chapter review (B2.labReview, engine/clip-review.js) holds a chapter's worth of clips, far more than a phone can keep decoded at once
// (about 10 MB each), so it wants only the monsters' idle loops on the field and the one clip being shown.
function bclipWanted() {
  const out=[]; if(typeof B3!=='undefined'&&B3.active) return b3cWanted();   // Battle 3 (engine/b3-clips.js): idle loops for the fight, the rest as asked
  if(typeof B2==='undefined'||!B2.active||!B2.labClip) return out;
  if(B2.labReview) { for(const id in BCLIPS) if(BCLIPS[id].kind==='loop'&&(B2.foes.some(f=>f.id===BCLIPS[id].owner)||(/^pf_/.test(id)&&B2.party.some(u=>u.id===BCLIPS[id].owner)))) out.push(id); if(B2.clipShow) out.push(B2.clipShow.id); return out; }
  // clipch1: a Lab fight that names its clips (L.clips, B2.labClips) loads only those: once chapter 1 is baked, Tom, Grace and Rose have about
  // ten clips each, and loading every clip of everyone on the field would not fit in a phone's memory.
  if(B2.labClips) { for(const id of B2.labClips) if(BCLIPS[id]) out.push(id); return out; }
  for(const id in BCLIPS) if(B2.party.some(u=>u.id===BCLIPS[id].owner)||B2.foes.some(f=>f.id===BCLIPS[id].owner)) out.push(id);
  return out;
}
// A loop clip at ms: forward to its last picture, then backward to its first, over and over. A wrap loop (D.wrap, clipch1fix: something in it
// falls or turns, which the backward half would send back up or turn back) plays forward only; the baker ends it on the picture nearest the first.
function bclipLoopLen(C) { return C.wrap?C.dur:2*C.dur; }
function bclipLoopFrame(C,ms) { if(C.wrap) return bclipFrameAt(C,ms%C.dur); const t=ms%(2*C.dur); return bclipFrameAt(C,t>=C.dur?2*C.dur-t-1:t); }
function bclipFor(owner,kind) {
  if(typeof B2==='undefined'||!B2.active||!B2.labClip) return null;
  const ko=BCLIPS[owner+'_ko'];   // clipko1: a knocked-out clip beats any other state clip (a nap is a Sleep status, not a knock-out: Tom 2026-11-18)
  if(kind==='state'&&ko&&bclipReady(ko.id)) return ko;
  for(const id in BCLIPS) { const C=BCLIPS[id]; if(C.owner===owner&&C.kind===kind&&bclipReady(id)) return C; }
  return null;
}
// Make every frame's canvas now (no outfit tint). A pass-1 clip is played from its first picture to its last, and building the pictures one by one
// while the clock runs is what could make a slow phone sit on the first one.
function bclipWarm(C) { C._warm=true; const keep=activeTint; activeTint=null; try { for(const rows of C.frames) paintedCanvas(rows,false); } catch(e) { gameFault('clip',e); } activeTint=keep; }
function bclipReady(id) { const a=PAINTED['clip_'+id]; return !!(a&&a.ready); }
// The frame of the clip a chapter review is showing for this party member or monster (Battle Lab > CHAPTER n REVIEW, engine/clip-review.js),
// or null. The clip plays in place, in the real fight, over the real backdrop: a loop goes forward and back once, a one-shot plays once and
// its last picture stays a moment, then the review is told (B2.clipShow.onEnd) so it can start the next one. t is battle.time in seconds.
function bclipShowFrame(owner,t) {
  const S=typeof B2!=='undefined'&&B2.active&&B2.labReview&&B2.clipShow;
  if(!S||S.owner!==owner) {   // a review: a member with a video idle (pf_<who>_idle) rests on it, no painted frame
    if(typeof B2==='undefined'||!B2.active||!B2.labReview||!B2.party||!B2.party.some(u=>u.id===owner)) return null;
    const I=BCLIPS['pf_'+owner+'_idle']; if(!I||!bclipReady(I.id)) return null;
    if(!I._warm) bclipWarm(I);
    return bclipLoopFrame(I,t*1000);
  }
  const C=BCLIPS[S.id]; if(!C||!bclipReady(S.id)) return null;
  if(!C._warm) { bclipWarm(C); return bclipFrameAt(C,0); }   // every picture is made into a canvas first, so the clock never waits on one (iPhone)
  if(S.t0==null) S.t0=t;   // the clock starts when the first picture can be drawn
  const ms=(t-S.t0)*1000;
  const len=C.kind==='loop'?bclipLoopLen(C):C.dur+(C.kind==='state'?1500:500);
  if(ms>=len) { if(!S.over) { S.over=true; const f=S.onEnd; setTimeout(()=>{ if(B2.clipShow===S) B2.clipShow=null; if(f) f(S.id); },0); } return C.kind==='loop'?bclipLoopFrame(C,0):bclipFrameAt(C,C.dur); }
  return C.kind==='loop'?bclipLoopFrame(C,ms):bclipFrameAt(C,Math.min(ms,C.dur));
}
// ST.clip(id,{onImpact}): onImpact runs once, the moment the impact frame is first drawn. The body path runs on the
// frame clock and the move timeline on timers, and on a busy phone the two drift apart, so a hit that must sit on a
// clip frame is fired by the clip itself (after the draw, never inside it), not by a timeline time.
RFX.ST.clip=(id,o={})=>{ const C=BCLIPS[id]; if(!C||C.kind!=='strike') return null;
  const sc=(BATTLE_SPRITES[C.owner]||{scale:1}).scale; let fired=false;
  const R={dur:C.dur,impact:C.ms[C.impact],reach:{dx:C.reach[0]*sc,up:C.reach[1]*sc},hit:false};
  R.fire=()=>{ if(fired) return; fired=true; R.hit=true; if(o.onImpact) Promise.resolve().then(()=>{ try { o.onImpact(); } catch(err) { gameFault('clip',err); } }); };
  R.f=u=>{ const ms=u*C.dur; if(ms>=R.impact) R.fire(); return bclipFrameAt(C,ms); };
  return R; };
