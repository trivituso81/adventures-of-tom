'use strict';
// data/tom-hires-use.js — Puts the baked painted Tom (data/tom-hires.js) in place of the old pixel Tom.
// Loaded after data/overworld-sprites.js and before data/recruit-sprites.js. Set TOM_HIRES_OFF=true (before this file) to fall back to the old Tom.
(function() {
  if(typeof TOM_HIRES==='undefined'||(typeof TOM_HIRES_OFF!=='undefined'&&TOM_HIRES_OFF)) return;
  const mirror=rows=>rows.map(r=>r.split('').reverse().join(''));
  // Overworld: same shape as the old TOM_OW (pal, down/up/side with [stand, step, step]); recruit-sprites.js preps it at scale 1.
  TOM_OW.hires=true; TOM_OW.pal=TOM_HIRES.ow.pal; TOM_OW.down=TOM_HIRES.ow.down; TOM_OW.up=TOM_HIRES.ow.up; TOM_OW.side=TOM_HIRES.ow.side;
  // Battle: faces left like the old one. Scale 1 (the old Tom was 40 rows at 2.6; this is about 100 rows at 1).
  const B=TOM_HIRES.bt,M=TOM_HIRES.meta.bt;
  const sp={idle:B.idle,act:B.act,celeb:B.celeb,expr:B.act,run:[B.run1,B.run2],pal:B.pal,scale:1,eye:{col:M.eye[0],row:M.eye[1]},
    wind:undefined,windup:B.windup,leap:B.leap,hurtPose:B.hurt,defend:B.defend,castPose:B.cast,hires:true};
  sp.kneel=B.kneel;   // painted kneel (already has the black eye), so battle-draw skips its bruise overlay for hires sprites
  sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  BATTLE_SPRITES.tom=sp;
  // Knocked out: the family KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.tom={scale:.8,pal:TOM_HIRES.ko.pal,rows:TOM_HIRES.ko.rows};
})();
