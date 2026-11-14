'use strict';
// Chapter 7 close-up (story-ch07.md scene 9): the gold coin with a book cart on it. {ch7Reveal:'coin'} shows it large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch7-coin.webp, baked by tools/art-library/bake_ch7_stage3.py from the approved Library entry ch7-coin.
const CH7_REVEAL={
  coin:{img:'art/closeup/ch7-coin.webp',label:'A BOOK CART COIN'},
  v:'ch7s3'
};
SCENE_OPS.ch7Reveal=o=>lazy(()=>{
  let done=false; const d=CH7_REVEAL[o.ch7Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH7_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
