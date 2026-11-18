'use strict';
// data/b3-lab.js — Battle 3: the NEW BATTLE fights in the Battle Lab (ADMIN > BATTLE LAB > NEW BATTLE).
// One row per fight: party (ids, in standing order: neighbours in this list are "adjacent"), level (the bestiary's player level
// for that chapter), formation (a B3_FORMATIONS id), bg (a BG_FILES key in engine/battle-draw.js), rows (optional {id:'back'}).
// engine/b3-lab.js lists and starts them; tools/b3-sim.js plays them with no screen.
// Tom stands second so that Suite Door Slide covers two family members (Grace and Rose).
const B3_LAB=[
  {id:'new1',name:'NEW 1: TWO MUDLINGS',sub:'Chapter 1 fight. Two Mudlings in Front.',
    party:['grace','tom','rose','deedee'],level:2,formation:'mudling',bg:'pond'},
  {id:'new2',name:'NEW 2: MUDLING AND SKEETER',sub:'Chapter 1 fight. A Mudling in Front, a Skeeter Swarm in Back.',
    party:['grace','tom','rose','deedee'],level:2,formation:'skeeter',bg:'pond'},
  {id:'new3',name:'NEW 3: POND GRUMP AND MUDLING',sub:'Chapter 1 fight. A Pond Grump winds up a big Soggy Slap.',
    party:['grace','tom','rose','deedee'],level:2,formation:'grump',bg:'pond'},
  {id:'new4',name:'NEW 4: BOG TOAD AND SKEETER',sub:'Chapter 1 fight. A Bog Toad sweeps the whole family with its tongue.',
    party:['grace','tom','rose','deedee'],level:2,formation:'toad',bg:'pond'}
];
