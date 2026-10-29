'use strict';
// data/rose-hires-use.js — Puts the painted Rose (data/rose-hires.js, art/chars/rose-*.webp) in place of the old pixel Rose.
// Loaded after engine/painted.js and before data/recruit-sprites.js. Set ROSE_HIRES_OFF=true (before this file) to fall back to the old Rose.
// Every frame keeps its row strings (logic: hand points, outfit keys) and is tagged with its painted frame (engine/painted.js).
// The shoulder-ride art (data/rose-ride.js) is still the old pixel Rose; it keeps her old palette here.
const ROSE_RIDE_PAL=ROSE_OW.pal;
(function() {
  if(typeof ROSE_HIRES==='undefined'||(typeof ROSE_HIRES_OFF!=='undefined'&&ROSE_HIRES_OFF)) return;
  const AT=ROSE_HIRES.atlas,mirror=rows=>{ const m=rows.map(r=>r.split('').reverse().join('')); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  for(const [id,k] of [['roseBattle','bt'],['roseKo','ko'],['roseOw','ow']]) paintedAtlas(id,AT[k].src,AT[k].rects,AT[k].k).tintMode='coral';
  const tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  // Overworld: the sheet draws Rose facing LEFT; the game's 'side' set faces RIGHT, so side = flipped left frames.
  const O=ROSE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'roseOw',d+'_'+n,flip); });
  ROSE_OW.hires=true; ROSE_OW.pal=O.pal; ROSE_OW.down=mk('down'); ROSE_OW.up=mk('up'); ROSE_OW.side=mk('left',true);
  // Battle: faces left. Scale 1 (about 73 rows tall, Tom is 100).
  const B=ROSE_HIRES.bt,M=ROSE_HIRES.meta.bt,P=(k,n)=>tag(B[k].slice(),'roseBattle',n||k,false);
  const sp=BATTLE_SPRITES.rose;
  Object.assign(sp,{idle:P('idle'),act:P('act','act'),celeb:P('celeb','celeb'),pal:B.pal,scale:1,eye:{col:M.eye[0],row:M.eye[1]},
    windup:P('windup'),leap:P('leap'),hurtPose:P('hurt'),defend:P('defend'),castPose:P('cast'),hires:true,mouth:{col:34,row:20}});
  sp.expr=sp.act; sp.run=[P('run1'),P('run2')];
  sp.kneel=P('kneel');   // painted kneel (the black eye is painted in by the baker), so battle-draw skips its bruise overlay
  sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  // Knocked out: napping with Lamby. The KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.rose={scale:1,pal:ROSE_HIRES.ko.pal,rows:tag(ROSE_HIRES.ko.rows.slice(),'roseKo','ko',true)};
})();
