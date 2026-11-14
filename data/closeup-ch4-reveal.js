'use strict';
// Chapter 4 close-ups (story-ch04.md): the laminated VISITOR lanyard TNB hangs on Tom, the gold coin with a cowboy hat on it, and the CREW lanyard.
// One scene step, {ch4Reveal:'visitor'|'coin'|'crew'|'phone'}, shows the picture large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch4-*.webp, baked by tools/art-library/bake_story_ch4.py from the approved Library entries.
const CH4_REVEAL={
  visitor:{img:'art/closeup/ch4-visitor.webp',label:'A LAMINATED VISITOR BADGE'},
  coin:{img:'art/closeup/ch4-coin.webp',label:'A GOLD COIN WITH A COWBOY HAT ON IT'},
  crew:{img:'art/closeup/ch4-crew.webp',label:'A CREW BADGE'},
  phone:{img:'art/closeup/ch4-phone.webp',label:'THE PHOTO FOR THE PLANE'},
  v:'ch4a'
};
SCENE_OPS.ch4Reveal=o=>lazy(()=>{
  let done=false; const d=CH4_REVEAL[o.ch4Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH4_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
