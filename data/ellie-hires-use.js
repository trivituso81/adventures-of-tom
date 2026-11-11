'use strict';
// data/ellie-hires-use.js: Overworld half of the painted Aunt Ellie (data/ellie-hires.js, art/chars/ellie-ow.webp).
// Loads right after data/npc-sprites.js and replaces OW.ellie (the old traced pixel set). Set ELLIE_HIRES_OFF=true (before this file) to keep the old one.
(function() {
  if(typeof ELLIE_HIRES==='undefined'||(typeof ELLIE_HIRES_OFF!=='undefined'&&ELLIE_HIRES_OFF)) return;
  const AT=ELLIE_HIRES.atlas;
  paintedAtlas('ellieOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Ellie facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=ELLIE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'ellieOw',d+'_'+n,flip); });
  const set={pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)};
  set.left=set.side.map(mirrorRows);
  OW.ellie=set;
})();
