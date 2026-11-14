'use strict';
// Chapter 5 close-ups (story-ch05.md): Amy's two iced coffees, the binder with its tabs, TNB's gummy worms and note, Rose's gap-toothed grin,
// the gold coin with a kickball on it, the photo for the flight west, and Amy's clipboard with the coin under the clip.
// One scene step, {ch5Reveal:'coffees'|'binder'|'gummy'|'grin'|'coin'|'phone'|'clipboard'}, shows the picture large (engine/closeup.js REVEAL mode) and waits for A.
// Art: art/closeup/ch5-*.webp, baked by tools/art-library/bake_story_ch5.py from the approved Library entries.
const CH5_REVEAL={
  coffees:{img:'art/closeup/ch5-coffees.webp',label:'TWO ICED COFFEES'},
  binder:{img:'art/closeup/ch5-binder.webp',label:'A BINDER WITH COLOR-CODED TABS'},
  gummy:{img:'art/closeup/ch5-gummynote.webp',label:'GUMMY WORMS, AND A NOTE FROM TNB'},
  grin:{img:'art/closeup/ch5-grin.webp',label:'ROSE, WITH A GAP WHERE THE TOOTH WAS'},
  coin:{img:'art/closeup/ch5-coin.webp',label:'A GOLD COIN WITH A KICKBALL ON IT'},
  phone:{img:'art/closeup/ch5-phone.webp',label:'THE PHOTO FOR THE PLANE'},
  clipboard:{img:'art/closeup/ch5-clipboard.webp',label:'AMY\'S CLIPBOARD, WITH A GOLD STAR'},
  v:'ch5a'
};
SCENE_OPS.ch5Reveal=o=>lazy(()=>{
  let done=false; const d=CH5_REVEAL[o.ch5Reveal];
  return {start(){ done=false; if(!closeupReveal(d.img,d.label,()=>{ done=true; },CH5_REVEAL.v,d.still?{still:true}:null)) done=true; },
    update(){ return done; }};
});
