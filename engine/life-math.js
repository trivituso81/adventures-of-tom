'use strict';
// engine/life-math.js (effectslab1): the curves of the small motions people get in story scenes. engine/emotions.js (actorLife) draws with them and
// effects.html (ADMIN > EFFECTS) previews with the same functions, so the preview is the game's own maths. Loads before engine/emotions.js; needs nothing else.
// No breathing here and never: Tom 2026-11-20, people in the overworld do not breathe (battle idle only).
const LIFE_SQ=.12, LIFE_HOP_PX=8, LIFE_HOP_SEC=.3, LIFE_PIP_SEC=1.3, LIFE_WINCE_SEC=2.6;
// Squash and settle: 0.94, 1.04, 1.0 over LIFE_SQ seconds; e is elapsed/LIFE_SQ. Returns the scale (1 once e >= 1).
function lifeSquashScale(e) { return e>=1?1:(e<.33?1-.06*(e/.33):(e<.66?.94+.10*((e-.33)/.33):1.04-.04*((e-.66)/.34))); }
function lifeHopLift(sec) { return sec<LIFE_HOP_SEC?LIFE_HOP_PX*Math.sin(Math.PI*sec/LIFE_HOP_SEC):0; }
