'use strict';
// data/enemy-facing.js: which way each enemy looks, and one switch for the way every enemy should look.
// Loaded right after data/terminal-monsters.js, before anything draws a monster.
//
// Enemies stand on the LEFT of the battle screen and the family stands on the RIGHT. Most enemy art is drawn
// front-on and has no facing, so only enemies drawn clearly in profile or three-quarter view are listed here.
//   ENEMY_FACE_DRAWN  which way the artwork looks as it was traced: 'L' (toward the left edge) or 'R'.
//   ENEMY_FACE_WANT   which way enemies should look in the game.
// An enemy whose drawn facing differs from ENEMY_FACE_WANT is mirrored once, here, at load: its pixel rows, its
// eyes and its mouth (the battle moves aim at those). Everything that draws a monster (the battle, the turn ribbon,
// the overworld) reads MONSTERS, so they all agree. Set ENEMY_FACE_WANT to 'R' to make them look at the family instead.
const ENEMY_FACE_WANT='R';
const ENEMY_FACE_DRAWN={
  // drawn looking left (fogwisp trails its tail to the right, so it is moving and looking left)
  coyote:'L', mudling:'L', grump:'L', toad:'L', fogwisp:'L',
  // drawn looking right
  directorscut:'R', dogear:'R', extra:'R', longline:'R', peanutgallery:'R', dodgeball:'R', armresthog:'R'
};
// Drawn front-on with a slight turn, left alone on purpose: soreloser, popup, coathanger, clapper, knowitall, wallflower, stuffedshirt.
(function() {
  for(const id of Object.keys(ENEMY_FACE_DRAWN)) {
    const d=MONSTERS[id];
    if(!d||ENEMY_FACE_DRAWN[id]===ENEMY_FACE_WANT||d.flipped) continue;
    const W=Math.max(...d.sprite.map(r=>r.length));
    d.sprite=d.sprite.map(r=>r.padEnd(W,'.').split('').reverse().join(''));
    if(d.eyes) d.eyes=d.eyes.map(e=>[W-1-e[0],e[1]]).reverse();
    if(d.mouth) d.mouth=[W-1-d.mouth[0],d.mouth[1]];
    d.flipped=true;
  }
})();
