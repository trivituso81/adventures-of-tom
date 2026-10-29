'use strict';
// data/battle-size.js — One place that sets how big each party member is drawn in battle. Loaded after data/deedee-hires-battle.js. data/tnb-hires-battle.js and data/amy-hires-battle.js load later and read BATTLE_SIZE themselves.
// The number multiplies the sprite's own scale (and its KO sprite), so every pose, hand point and effect that reads sp.scale follows.
// Heights at 1.0 were Tom 100, Grace 81, Rose 73, Deedee 93 (painted), Amy 88 (painted; her battle file reads BATTLE_SIZE.amy itself, like TNB's) and Boppy 124, TNB 126 (rig). Now (battle px):
// Tom 130, Deedee 130, Grace 113, Rose 106, Amy 125, Boppy 120, TNB 126, so the kids read as bigger next to Tom and the adults line up.
const BATTLE_SIZE={tom:1.3,grace:1.4,rose:1.45,deedee:1.4,amy:1.4,boppy:.97,tnb:(typeof TNB_HIRES!=='undefined'&&TNB_OW.hires)?1.3:1};
for(const id in BATTLE_SIZE) {
  const k=BATTLE_SIZE[id];
  if(BATTLE_SPRITES[id]) BATTLE_SPRITES[id].scale*=k;
  if(typeof KO_SPRITES!=='undefined'&&KO_SPRITES[id]) KO_SPRITES[id].scale*=k;
}
