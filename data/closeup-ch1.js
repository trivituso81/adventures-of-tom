'use strict';
// Chapter 1 close-ups (story-ch01.md): the gold dragonfly coin, Boppy's gold teeth, the phone on the cab seat, and Grace's list.
// One scene step, {ch1Reveal:'coin'|'grin'|'phone'|'list'}, shows the picture large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch1-*.webp, baked by tools/art-library/bake_closeup_ch1.py from the approved Library entries.
// The grin is a cropped chapter 1 Library painting shown as a close-up screen, not as a dialogue face (dialogue faces never use hero paintings).
const CH1_REVEAL={
  coin:{img:'art/closeup/ch1-coin.webp',label:'A SMALL GOLD COIN'},
  grin:{img:'art/closeup/ch1-grin.webp',label:'BOPPY’S GOLD TEETH',still:true},
  phone:{img:'art/closeup/ch1-phone.webp',label:'A PHONE ON THE SEAT',still:true},
  list:{img:'art/closeup/ch1-list.webp',label:'GRACE’S LIST',still:true},
  v:'ch1d'
};
SCENE_OPS.ch1Reveal=o=>lazy(()=>{
  let done=false; const d=CH1_REVEAL[o.ch1Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH1_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
