'use strict';
// data/justin-hires-use.js: Overworld half of the painted Justin (data/justin-hires.js, art/chars/justin-ow.webp).
// Loads right after data/ellie-hires-use.js and replaces OW.justin (the old traced pixel set; story.js sets sheet:'justin' on the spawned Justin too).
// Set JUSTIN_HIRES_OFF=true (before this file) to keep the old one.
(function() {
  if(typeof JUSTIN_HIRES==='undefined'||(typeof JUSTIN_HIRES_OFF!=='undefined'&&JUSTIN_HIRES_OFF)) return;
  const AT=JUSTIN_HIRES.atlas;
  paintedAtlas('justinOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Justin facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=JUSTIN_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'justinOw',d+'_'+n,flip); });
  const set={pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)};
  set.left=set.side.map(mirrorRows);
  OW.justin=set;
})();
