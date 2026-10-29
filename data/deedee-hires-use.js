'use strict';
// data/deedee-hires-use.js — Overworld half of the painted Deedee (data/deedee-hires.js, art/chars/deedee-*.webp).
// Loaded after data/tom-hires-use.js and before data/recruit-sprites.js (which preps DEEDEE_OW). The battle half is
// data/deedee-hires-battle.js (it has to load after her pose files). Set DEEDEE_HIRES_OFF=true (before this file) to fall back to the old Deedee.
(function() {
  if(typeof DEEDEE_HIRES==='undefined'||(typeof DEEDEE_HIRES_OFF!=='undefined'&&DEEDEE_HIRES_OFF)) return;
  const AT=DEEDEE_HIRES.atlas;
  paintedAtlas('deedeeBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('deedeeKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('deedeeOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Deedee facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=DEEDEE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'deedeeOw',d+'_'+n,flip); });
  DEEDEE_OW.hires=true; DEEDEE_OW.pal=O.pal; DEEDEE_OW.down=mk('down'); DEEDEE_OW.up=mk('up'); DEEDEE_OW.side=mk('left',true);
})();
