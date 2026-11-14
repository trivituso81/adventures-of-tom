'use strict';
// Chapter 3 close-ups (story-ch03.md): the two flashbulbs side by side in Deedee's kitchen, the gold fish coin Old Iron-Gill shakes out of
// his mustache, Boppy's hat with the coin in the band, and the three bulbs Deedee lines up at the end.
// One scene step, {ch3Reveal:'bulbs2'|'coin'|'hat'|'bulbs3'}, shows the picture large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch3-*.webp, baked by tools/art-library/bake_closeup_ch3.py from the approved Library entries.
const CH3_REVEAL={
  bulbs2:{img:'art/closeup/ch3-bulbs2.webp',label:'TWO BURNT FLASHBULBS'},
  coin:{img:'art/closeup/ch3-coin.webp',label:'A GOLD COIN WITH A FISH ON IT'},
  hat:{img:'art/closeup/ch3-hat.webp',label:'BOPPY’S HAT'},
  bulbs3:{img:'art/closeup/ch3-bulbs3.webp',label:'THREE BURNT FLASHBULBS'},
  v:'ch3a'
};
SCENE_OPS.ch3Reveal=o=>lazy(()=>{
  let done=false; const d=CH3_REVEAL[o.ch3Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH3_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
