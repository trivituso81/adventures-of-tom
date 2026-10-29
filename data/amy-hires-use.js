'use strict';
// data/amy-hires-use.js — Overworld half of the painted Amy (data/amy-hires.js, art/chars/amy-*.webp).
// Loaded before data/recruit-sprites.js (which preps AMY_OW). The battle half is
// data/amy-hires-battle.js (it has to load after her pose files). Set AMY_HIRES_OFF=true (before this file) to fall back to the old Amy.
(function() {
  if(typeof AMY_HIRES==='undefined'||(typeof AMY_HIRES_OFF!=='undefined'&&AMY_HIRES_OFF)) return;
  const AT=AMY_HIRES.atlas;
  paintedAtlas('amyBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('amyKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('amyOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet draws Amy facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=AMY_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'amyOw',d+'_'+n,flip); });
  AMY_OW.hires=true; AMY_OW.pal=O.pal; AMY_OW.down=mk('down'); AMY_OW.up=mk('up'); AMY_OW.side=mk('left',true);
})();
