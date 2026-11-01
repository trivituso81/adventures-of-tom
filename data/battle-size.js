'use strict';
// data/battle-size.js — One place that sets how big each party member is drawn in battle. Loaded after data/deedee-hires-battle.js. data/tnb-hires-battle.js and data/amy-hires-battle.js load later and read BATTLE_SIZE themselves.
// The number multiplies the sprite's own scale (and its KO sprite), so every pose, hand point and effect that reads sp.scale follows.
// (Boppy is painted since 2026-10-29: data/boppy-hires-battle.js loads after boppy-poses.js and reads BATTLE_SIZE.boppy itself; painted idle is 62 rows like the pixel rig, so .97 (x2) gives about 120 px.)
// Heights at 1.0 were Tom 100, Grace 81, Rose 73, Deedee 93 (painted), Amy 88 and Boppy 94 (painted; their battle files read BATTLE_SIZE themselves, like TNB's) and TNB 126 (rig). Now (battle px):
// Tom 130, Deedee 130, Grace 113, Rose 106, Amy 125, Boppy 122, TNB 126, so the kids read as bigger next to Tom and the adults line up.
// 2026-11-01 (Tom): every adult's face (hairline to chin) is Justin's 49 px and figure heights follow real heights at Justin's 6'4" = 153 px:
// Tom 5'11" 143, TNB 5'10" 141, Boppy 5'7" 135, Amy and Deedee 5'5" 131. Heads were enlarged in the bakes (BATTLE_HEAD_RATIO / TARGET_BT). Grace and Rose unchanged.
const BATTLE_SIZE={tom:1.43,grace:1.4,rose:1.45,deedee:1.322,amy:1.322,boppy:1.007,tnb:(typeof TNB_HIRES!=='undefined'&&TNB_OW.hires)?1.409:1};
for(const id in BATTLE_SIZE) {
  const k=BATTLE_SIZE[id];
  if(BATTLE_SPRITES[id]) BATTLE_SPRITES[id].scale*=k;
  if(typeof KO_SPRITES!=='undefined'&&KO_SPRITES[id]) KO_SPRITES[id].scale*=k;
}
