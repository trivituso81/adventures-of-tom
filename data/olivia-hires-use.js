'use strict';
// data/olivia-hires-use.js: overworld half of the painted Olivia (data/olivia-hires.js, art/chars/olivia-ow.webp).
// Loads right after data/justin-hires-use.js and replaces OW.olivia (the old traced pixel set; the 2nd Ave Olivia uses sheet:'olivia').
// Set OLIVIA_HIRES_OFF=true (before this file) to keep the old one.
(function() {
  if(typeof OLIVIA_HIRES==='undefined'||(typeof OLIVIA_HIRES_OFF!=='undefined'&&OLIVIA_HIRES_OFF)) return;
  const AT=OLIVIA_HIRES.atlas;
  paintedAtlas('oliviaOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Olivia facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=OLIVIA_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'oliviaOw',d+'_'+n,flip); });
  const set={pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)};
  set.left=set.side.map(mirrorRows);
  set.k=.867;   // 5'5 (assumed, not given yet) next to Tom 5'11 (42.0 visible rows); the sheet's stand is 44.3 rows (11-05)
  OW.olivia=set;
})();
