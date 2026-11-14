'use strict';
// Chapter 2 close-ups (story-ch02.md): the perfectly round bread bowl TNB baked, and the gold lemon coin the Big Shake sneezes out.
// One scene step, {ch2Reveal:'loaf'|'coin'}, shows the picture large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch2-*.webp, baked by tools/art-library/bake_closeup_ch2.py from the approved Library entries.
const CH2_REVEAL={
  loaf:{img:'art/closeup/ch2-loaf.webp',label:'BREAD BOWL (PERFECTLY ROUND)'},
  coin:{img:'art/closeup/ch2-coin.webp',label:'A SMALL GOLD COIN'},
  v:'ch2a'
};
SCENE_OPS.ch2Reveal=o=>lazy(()=>{
  let done=false; const d=CH2_REVEAL[o.ch2Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH2_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
