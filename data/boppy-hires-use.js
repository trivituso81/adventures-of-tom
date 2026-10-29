'use strict';
// data/boppy-hires-use.js — Overworld half of the painted Boppy (data/boppy-hires.js, art/chars/boppy-*.webp).
// Loaded after data/tom-hires-use.js and before data/recruit-sprites.js (which preps BOPPY_OW). The battle half is
// data/boppy-hires-battle.js (it has to load after her pose files). Set BOPPY_HIRES_OFF=true (before this file) to fall back to the old Boppy.
(function() {
  if(typeof BOPPY_HIRES==='undefined'||(typeof BOPPY_HIRES_OFF!=='undefined'&&BOPPY_HIRES_OFF)) return;
  const AT=BOPPY_HIRES.atlas;
  paintedAtlas('boppyBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('boppyKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('boppyOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Boppy facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=BOPPY_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'boppyOw',d+'_'+n,flip); });
  BOPPY_OW.hires=true; BOPPY_OW.pal=O.pal; BOPPY_OW.down=mk('down'); BOPPY_OW.up=mk('up'); BOPPY_OW.side=mk('left',true);
})();
