'use strict';
// data/tom-hires-use.js — Puts the painted Tom (data/tom-hires.js, art/chars/tom-*.webp) in place of the old pixel Tom.
// Loaded after engine/painted.js and before data/recruit-sprites.js. Set TOM_HIRES_OFF=true (before this file) to fall back to the old Tom.
// Every frame keeps its row strings (logic: hand points, Rose's seat, outfit keys) and is tagged with its painted frame (engine/painted.js).
let TOM_STRETCH=null;
(function() {
  if(typeof TOM_HIRES==='undefined'||(typeof TOM_HIRES_OFF!=='undefined'&&TOM_HIRES_OFF)) return;
  const AT=TOM_HIRES.atlas,mirror=rows=>{ const m=rows.map(r=>r.split('').reverse().join('')); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  paintedAtlas('tomBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('tomPose',AT.pose.src,AT.pose.rects,AT.pose.k).tintFrac=[.47,.77];
  paintedAtlas('tomStretch',AT.stretch.src,AT.stretch.rects,AT.stretch.k);
  paintedAtlas('tomKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('tomOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  const tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  // Overworld: same shape as the old TOM_OW (pal, down/up/side with [stand, step, step]); recruit-sprites.js preps it at scale 1.
  // The sheet draws Tom facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=TOM_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'tomOw',d+'_'+n,flip); });
  TOM_OW.hires=true; TOM_OW.pal=O.pal; TOM_OW.down=mk('down'); TOM_OW.up=mk('up'); TOM_OW.side=mk('left',true);
  // Arrival stretch (engine/intro.js): painted front-facing poses, in the order tired, start, full, side, crack, neck, exhale, fresh.
  TOM_STRETCH={}; for(const k of Object.keys(TOM_HIRES.stretch)) TOM_STRETCH[k]=tag(TOM_HIRES.stretch[k].slice(),'tomStretch',k,false);
  // Battle: faces left like the old one. Scale 1 (the old Tom was 40 rows at 2.6; this is 100 rows at 1).
  const B=TOM_HIRES.bt,M=TOM_HIRES.meta.bt,P=(k,n)=>tag(B[k].slice(),'tomBattle',n||k,false);
  const sp={idle:P('idle'),act:P('act','act'),celeb:P('celeb','celeb'),pal:B.pal,scale:1,eye:{col:M.eye[0],row:M.eye[1]},
    windup:P('windup'),leap:P('leap'),hurtPose:P('hurt'),defend:P('defend'),castPose:P('cast'),hires:true};
  for(const k of ['hold','annoyed','tw_windup','tw_follow','lift','fling','unbox','flick','brush','limit','startled','direct']) sp[k]=tag(TOM_HIRES.pose[k].slice(),'tomPose',k,false);   // custom poses: f:'hold' etc. in a move's keys
  sp.expr=sp.act; sp.run=[P('run1'),P('run2')];
  sp.kneel=P('kneel');   // painted kneel (already has the black eye), so battle-draw skips its bruise overlay for hires sprites
  sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  BATTLE_SPRITES.tom=sp;
  // Knocked out: the family KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.tom={scale:.8,pal:TOM_HIRES.ko.pal,rows:tag(TOM_HIRES.ko.rows.slice(),'tomKo','ko',true)};
})();
