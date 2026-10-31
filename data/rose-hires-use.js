'use strict';
// data/rose-hires-use.js — Puts the painted Rose (data/rose-hires.js, art/chars/rose-*.webp) in place of the old pixel Rose.
// Loaded after engine/painted.js and before data/recruit-sprites.js. Set ROSE_HIRES_OFF=true (before this file) to fall back to the old Rose.
// Every frame keeps its row strings (logic: hand points, outfit keys) and is tagged with its painted frame (engine/painted.js).
// The shoulder ride (data/rose-ride.js) is replaced below by painted views; if painting is off it keeps the old pixel art and palette.
let ROSE_RIDE_PAL=ROSE_OW.pal;
(function() {
  if(typeof ROSE_HIRES==='undefined'||(typeof ROSE_HIRES_OFF!=='undefined'&&ROSE_HIRES_OFF)) return;
  const AT=ROSE_HIRES.atlas,mirror=rows=>{ const m=rows.map(r=>r.split('').reverse().join('')); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  for(const [id,k] of [['roseBattle','bt'],['roseBattleX','btx'],['roseKo','ko'],['roseOw','ow'],['roseRideBt','rideBt'],['roseRideOw','rideOw']]) paintedAtlas(id,AT[k].src,AT[k].rects,AT[k].k).tintMode='coral';
  const tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  // Overworld: the sheet draws Rose facing LEFT; the game's 'side' set faces RIGHT, so side = flipped left frames.
  const O=ROSE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'roseOw',d+'_'+n,flip); });
  ROSE_OW.hires=true; ROSE_OW.pal=O.pal; ROSE_OW.down=mk('down'); ROSE_OW.up=mk('up'); ROSE_OW.side=mk('left',true);
  // Overworld extras (sheet B): crouch, jump, wave, hold (front view, same canvas as the walk frames).
  ROSE_OW.extra={}; for(const k of ['crouch','jump','wave','hold']) ROSE_OW.extra[k]=tag(O['e_'+k].slice(),'roseOw','e_'+k,false);
  // Painted shoulder ride: back layer behind Tom, front layer (shins and shoes) over his shoulders. Anchors come from the baker.
  { const RR=ROSE_HIRES.ride; ROSE_RIDE_PAL=RR.pal;
    for(const key of ['bt_idle','bt_celeb','ow_down','ow_up','ow_left']) { const r=RR[key],at=key[0]==='b'?'roseRideBt':'roseRideOw',nm=key.slice(3);
      ROSE_RIDE[key]={ax:r.ax,ay:r.ay,sx:r.sx,sy:r.sy,back:tag(r.back.slice(),at,nm+'_back',false),front:tag(r.front.slice(),at,nm+'_front',false)}; } }
  // Battle: faces left. Scale 1 (about 73 rows tall, Tom is 100).
  const B=ROSE_HIRES.bt,M=ROSE_HIRES.meta.bt,P=(k,n)=>tag(B[k].slice(),'roseBattle',n||k,false);
  const sp=BATTLE_SPRITES.rose;
  Object.assign(sp,{idle:P('idle'),act:P('act','act'),celeb:P('celeb','celeb'),pal:B.pal,scale:1,eye:{col:M.eye[0],row:M.eye[1]},
    windup:P('windup'),leap:P('leap'),hurtPose:P('hurt'),defend:P('defend'),castPose:P('cast'),hires:true,mouth:{col:34,row:20}});
  sp.expr=sp.act; sp.run=[P('run1'),P('run2')];
  sp.kneel=P('kneel');   // painted kneel (the black eye is painted in by the baker), so battle-draw skips its bruise overlay
  // Extra battle poses (sheet A), faces left like the rest: boop, boopBack, raspberry, boo, tiara, hug, balance, lookout, throwWind, throwRel, sitStory, sitTea.
  for(const k in ROSE_HIRES.x) sp[k]=tag(ROSE_HIRES.x[k].slice(),'roseBattleX',k,false);
  // Tickle Storm frames (own atlas): tk_ready, tk_creepA, tk_creepB, tk_launch, tk_air, tk_land, tk_tickleA to D, tk_feather_draw, tk_feather_swish, tk_feather_twirl, tk_finale, tk_doubled, tk_proud.
  if(ROSE_HIRES.tk) { paintedAtlas('roseBattleT',AT.btt.src,AT.btt.rects,AT.btt.k).tintMode='coral'; for(const k in ROSE_HIRES.tk) sp[k]=tag(ROSE_HIRES.tk[k].slice(),'roseBattleT',k,false); }
  // Lamby Boomerang frames (own atlas): bm_windA, bm_windB, bm_throw, bm_follow, bm_watch, bm_reach, bm_catch, bm_cheer (the lamb flight frames are a prop atlas, art/props/rose/lamby_fly.webp).
  if(ROSE_HIRES.bm) { paintedAtlas('roseBattleB',AT.btb.src,AT.btb.rects,AT.btb.k).tintMode='coral'; for(const k in ROSE_HIRES.bm) sp[k]=tag(ROSE_HIRES.bm[k].slice(),'roseBattleB',k,false); }
  sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  // Knocked out: napping with Lamby. The KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.rose={scale:1,pal:ROSE_HIRES.ko.pal,rows:tag(ROSE_HIRES.ko.rows.slice(),'roseKo','ko',true)};
})();
