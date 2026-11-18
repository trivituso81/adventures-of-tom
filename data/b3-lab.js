'use strict';
// data/b3-lab.js — Battle 3: the NEW BATTLE fights in the Battle Lab (ADMIN > BATTLE LAB > NEW BATTLE).
// One row per fight: party (ids), level (the bestiary's player level for that chapter), formation (a B3_FORMATIONS id),
// bg (a BG_FILES key in engine/battle-draw.js). engine/b3-lab.js lists and starts them; tools/b3-sim.js plays them with no screen.
const B3_LAB=[
  {id:'new1',name:'NEW 1: TWO MUDLINGS',sub:'New battle, stage 1. Tom, Grace, Rose and Deedee against two Mudlings.',
    party:['tom','grace','rose','deedee'],level:2,formation:'mudling',bg:'pond'},
  {id:'new2',name:'NEW 2: MUDLING AND SKEETER',sub:'New battle, stage 1. A Mudling in Front, a Skeeter Swarm in Back.',
    party:['tom','grace','rose','deedee'],level:2,formation:'skeeter',bg:'pond'}
];
