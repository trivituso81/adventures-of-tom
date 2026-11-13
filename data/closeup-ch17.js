'use strict';
// Chapter 17 snow globe close-up (Tom 2026-11-12, claude/closeup-plan.md Row 3). Scene step {globeFind:true} (SCENES.ch17Vault, right before
// Tom's "The Vault. One plinth, one snow globe..." line) shows the globe large (REVEAL mode, engine/closeup.js) with slow snow drawn in code
// inside the glass, the REVEAL glint, and the caption THE SNOW GLOBE; A continues. Art: art/closeup/ch17-globe.webp (tools/art-library/bake_closeup_ch17.py).
// GLOBE_SNOW is the glass circle as fractions of the picture (centre x, y and radius); n is the flake count.
const CH17_GLOBE={v:'closeup5',snow:{x:.5,y:.5,r:.33,n:26}};
SCENE_OPS.globeFind=o=>lazy(()=>{
  let done=false;
  return {start(){ done=false; if(!closeupReveal('art/closeup/ch17-globe.webp','THE SNOW GLOBE',()=>{ done=true; },CH17_GLOBE.v,{snow:CH17_GLOBE.snow})) done=true; },
    update(){ return done; }};
});
