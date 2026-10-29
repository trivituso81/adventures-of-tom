'use strict';
// data/tomride-use.js: Tom carrying Rose on his shoulders as ONE painted figure (data/tomride-hires.js, art/chars/tomride-*.webp).
// Loaded after data/recruit-sprites.js (it adds OW.tomRide). Used whenever Rose rides: the welcome screen, the overworld
// (engine/town-render.js) and battle (engine/rose-ride.js rideBodyDraw). Set TOMRIDE_OFF=true before this file for the old layered pixel Rose.
// TOMRIDE.bt has the same pose names as Tom's battle sprite, so a Tom frame maps to its ride frame (rideFrameOf in engine/rose-ride.js).
const TOMRIDE={ok:false,bt:null};
(function() {
  if(typeof TOMRIDE_HIRES==='undefined'||(typeof TOMRIDE_OFF!=='undefined'&&TOMRIDE_OFF)) return;
  const AT=TOMRIDE_HIRES.atlas;
  paintedAtlas('tomrideBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('tomrideKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('tomrideOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  const rev=rows=>rows.map(r=>r.split('').reverse().join('')),tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  const mirror=rows=>{ const m=rev(rows); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  // Overworld: the sheet draws him facing LEFT; the game's 'side' set faces RIGHT, so side = flipped left frames (as for Tom).
  const O=TOMRIDE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rev(rows):rows.slice(),'tomrideOw',d+'_'+n,flip); });
  OW.tomRide=prepOW({pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)},1);
  // Battle: faces left like Tom. Same row resolution as his own sprite, so the same scale applies.
  const B=TOMRIDE_HIRES.bt,P=(k,n)=>tag(B[k].slice(),'tomrideBattle',n||k,false);
  const sp={pal:B.pal,idle:P('idle'),act:P('act'),celeb:P('celeb'),windup:P('windup'),leap:P('leap'),hurtPose:P('hurt'),
    defend:P('defend'),castPose:P('cast'),kneel:P('kneel'),run:[P('run1'),P('run2')]};
  sp.expr=sp.act; sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  TOMRIDE.bt=sp; TOMRIDE.ok=true;
})();
