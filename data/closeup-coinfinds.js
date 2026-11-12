'use strict';
// The seven coin finds, chapters 3 to 9 (Tom 2026-11-12; spec claude/closeup-coinfinds-spec.md). Each find scene has one step
// {coinFind:N} (N = 1..7, the order of CH10_COINS) that shows that coin large (engine/closeup.js, REVEAL mode) and waits for A.
// The art is the chapter 10 coin set (art/closeup/ch10-coin-N.webp, baked by tools/art-library/bake_closeup.py ch10).
SCENE_OPS.coinFind=o=>lazy(()=>{
  let done=false;
  return {start(){ done=false; const n=o.coinFind; if(!closeupReveal('art/closeup/ch10-coin-'+n+'.webp',CH10_COINS[n-1],()=>{ done=true; },CLOSEUP_DEFS.ch10.v)) done=true; },
    update(){ return done; }};
});
