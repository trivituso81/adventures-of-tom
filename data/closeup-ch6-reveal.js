'use strict';
// Chapter 6 close-ups (story-ch06.md): the acorn with an X, the squirrels' corkboard, the jar with the gold coin stuck to its bottom, the coin crusted
// with dried starter, and TNB's crock. One scene step, {ch6Reveal:'acorn'|'board'|'jar'|'coin'|'crock'}, shows the picture large (engine/closeup.js REVEAL mode)
// and waits for A. Art: art/closeup/ch6-*.webp, baked by tools/art-library/bake_story_ch6.py from the approved Library entries.
const CH6_REVEAL={
  acorn:{img:'art/closeup/ch6-acorn.webp',label:'ACORN WITH A TINY X'},
  board:{img:'art/closeup/ch6-board.webp',label:'THE SQUIRRELS\' CORKBOARD',still:true},
  jar:{img:'art/closeup/ch6-jarcoin.webp',label:'SOMETHING GOLD ON THE JAR'},
  coin:{img:'art/closeup/ch6-crusted.webp',label:'GOLD COIN, PICNIC BASKET'},
  crock:{img:'art/closeup/ch6-crock.webp',label:'CROCK FOR BREADY MERCURY'},
  v:'ch6s3b'
};
SCENE_OPS.ch6Reveal=o=>lazy(()=>{
  let done=false; const d=CH6_REVEAL[o.ch6Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH6_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
