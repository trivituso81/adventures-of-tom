'use strict';
// data/michael-hires-use.js: painted Michael carrying Lachlan and Isla (data/michael-hires.js, art/chars/michael-ow.webp).
// Loads right after data/jojo-hires-use.js and replaces OW.michael (the old traced pixel set MICHAEL_OW in data/npc-sprites.js stays as the fallback).
// The sheet draws him facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
(function() {
  if(typeof MICHAEL_HIRES==='undefined') return;
  const AT=MICHAEL_HIRES.atlas;
  paintedAtlas('michaelOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  const O=MICHAEL_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'michaelOw',d+'_'+n,flip); });
  const set={pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)};
  set.left=set.side.map(mirrorRows);
  OW.michael=set;
})();
