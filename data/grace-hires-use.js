'use strict';
// data/grace-hires-use.js — Puts the painted Grace (data/grace-hires.js, art/chars/grace-*.webp) in place of the old pixel Grace.
// Loaded after data/tom-hires-use.js and before data/recruit-sprites.js. Set GRACE_HIRES_OFF=true (before this file) to fall back to the old Grace.
// Same pattern as Tom: every frame keeps its row strings (logic) and is tagged with its painted frame (engine/painted.js).
(function() {
  if(typeof GRACE_HIRES==='undefined'||(typeof GRACE_HIRES_OFF!=='undefined'&&GRACE_HIRES_OFF)) return;
  const AT=GRACE_HIRES.atlas,mirror=rows=>{ const m=rows.map(r=>r.split('').reverse().join('')); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  // Outfit tint: only the violet leotard (blue above red above green) changes colour, in the garment rows. Returns a brightness factor, 0 = leave alone.
  const violet=(r,g,b)=>{ if(b<r+8||r<=g+12||b<=g+40||Math.max(r,g,b)>=235) return 0; const lum=(r*.3+g*.59+b*.11)/255; return Math.max(.5,Math.min(1.3,lum/.26)); };
  paintedAtlas('graceBattle',AT.bt.src,AT.bt.rects,AT.bt.k,violet);
  paintedAtlas('graceKo',AT.ko.src,AT.ko.rects,AT.ko.k,violet);
  paintedAtlas('graceOw',AT.ow.src,AT.ow.rects,AT.ow.k,violet);
  const tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  // Overworld: same shape as the old GRACE_OW (pal, down/up/side with [stand, step, step]); recruit-sprites.js preps it at scale 1.
  // The sheet draws Grace facing LEFT; the game's 'side' set faces RIGHT, so side = flipped left frames.
  const O=GRACE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'graceOw',d+'_'+n,flip); });
  GRACE_OW.hires=true; GRACE_OW.pal=O.pal; GRACE_OW.down=mk('down'); GRACE_OW.up=mk('up'); GRACE_OW.side=mk('left',true);
  // Battle: faces left. Scale 1 (the old Grace was 40 rows at 2; this is 81 rows at 1, same height on screen).
  const B=GRACE_HIRES.bt,M=GRACE_HIRES.meta.bt,P=(k,n)=>tag(B[k].slice(),'graceBattle',n||k,false);
  const old=BATTLE_SPRITES.grace;
  const sp={idle:P('idle'),act:P('act','act'),celeb:P('celeb','celeb'),pal:B.pal,scale:1,eye:{col:M.eye[0],row:M.eye[1]},
    windup:P('windup'),leap:P('leap'),hurtPose:P('hurt'),defend:P('defend'),castPose:P('cast'),hires:true};
  sp.expr=sp.act; sp.run=[P('run1'),P('run2')];
  sp.kneel=P('kneel');   // painted kneel (already has the black eye), so battle-draw skips its bruise overlay for hires sprites
  sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  sp.beg=P('beg'); sp.begFlip=mirror(sp.beg);   // Squishy Delivery begging pose: the kneel without the bruise
  BATTLE_SPRITES.grace=sp;
  // Knocked out: the family KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.grace={scale:.8,pal:GRACE_HIRES.ko.pal,rows:tag(GRACE_HIRES.ko.rows.slice(),'graceKo','ko',true)};
  // Her bespoke cartwheel poses (data/grace-wheel.js) are still built from the old pixel body; keep their own palette so they draw right.
  if(typeof GRACE_WHEEL!=='undefined'&&old&&old.pal) {
    const oldPal=old.pal;
    for(const fn of ['frame','mirror']) { const f0=GRACE_WHEEL[fn]; GRACE_WHEEL[fn]=function() { const r=f0.apply(this,arguments); if(r&&!r._pal) r._pal=oldPal; return r; }; }
  }
})();
