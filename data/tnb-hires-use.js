'use strict';
// data/tnb-hires-use.js — Overworld half of the painted TNB (data/tnb-hires.js, art/chars/tnb-*.webp).
// Loaded after data/rose-hires-use.js and before data/recruit-sprites.js (which preps TNB_OW). The battle half is
// data/tnb-hires-battle.js (it has to load after his pose files). Set TNB_HIRES_OFF=true (before this file) to fall back to the old TNB.
(function() {
  if(typeof TNB_HIRES==='undefined'||(typeof TNB_HIRES_OFF!=='undefined'&&TNB_HIRES_OFF)) return;
  const AT=TNB_HIRES.atlas;
  paintedAtlas('tnbBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('tnbKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('tnbOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws TNB facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=TNB_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'tnbOw',d+'_'+n,flip); });
  TNB_OW.hires=true; TNB_OW.pal=O.pal; TNB_OW.down=mk('down'); TNB_OW.up=mk('up'); TNB_OW.side=mk('left',true);
})();
