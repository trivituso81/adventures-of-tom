'use strict';
// data/battle-size.js — One place that sets how big each party member is drawn in battle. Loaded after data/deedee-hires-battle.js, the last file that builds a battle sprite.
// The number multiplies the sprite's own scale (and its KO sprite), so every pose, hand point and effect that reads sp.scale follows.
// (Boppy is painted since 2026-10-29: data/boppy-hires-battle.js loads after boppy-poses.js and reads BATTLE_SIZE.boppy itself; painted idle is 93 rows, so 1.3 gives about 121 px.)
// Heights at 1.0 were Tom 100, Grace 81, Rose 73, Deedee 93 (painted) and Amy 132, Boppy 124, TNB 126 (rig). Now (battle px):
// Tom 130, Deedee 130, Grace 113, Rose 106, Amy 125, Boppy 120, TNB 126, so the kids read as bigger next to Tom and the adults line up.
const BATTLE_SIZE={tom:1.3,grace:1.4,rose:1.45,deedee:1.4,amy:.95,boppy:1.3,tnb:1};
for(const id in BATTLE_SIZE) {
  const k=BATTLE_SIZE[id];
  if(BATTLE_SPRITES[id]) BATTLE_SPRITES[id].scale*=k;
  if(typeof KO_SPRITES!=='undefined'&&KO_SPRITES[id]) KO_SPRITES[id].scale*=k;
}
