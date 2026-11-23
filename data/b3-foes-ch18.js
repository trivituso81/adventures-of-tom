'use strict';
// data/b3-foes-ch18.js — Battle 3 enemies: chapter 18, the studio on the top floor (bestiary v11 section 2, "Chapter 18": entry 79, `vance`, working name The Studio Rig).
// Numbers are the bestiary's printed numbers (Atk 203, Def 85, Spd 122; 8 pips; Pet Peeves Clobber and Racket; resists Razzle) except ONE: the HP. The bestiary prints 3,790 (2,840 for
// three); the simulator (`node tools/b3-sim.js new93 24 --support=4`) put that at 3.43 rounds against a target of 6 (accept 5 to 7), so the HP is 6,200 (4,650 for three, still three
// quarters), which plays 5.88 rounds and wins 24 of 24. Nothing else moved (docs/BATTLE3.md "What stage 22 chapter 18 holds").
// The row format and every act field are explained at the top of data/b3-foes-ch01.js. Chapters 15 to 20 are PROVISIONAL in the bestiary.
// What is here: one boss and one formation. Chapter 18 has no normal fight: the Loom Chamber holds one fight, the one the scenes call `vance` (data/scenes-ch18.js), so the boss pays the
// whole chapter's 90 Vibe Points (bestiary section 5). The party is Tom, Grace, Rose and Amy (TNB and Nara stay on the bench, as in the scenes), so the boss prints its HP for 4 and `hp3` for three.
//
// Names: the foe uses the bestiary's working name, The Studio Rig. The foe id stays `vance` because the built scenes, the map monster and the Battle 2 fight all call it that; the
// `name` and each act's `name` are one string each, so they change in one place when the chapter 18 script settles them. The bestiary (section 6) says the rig needs a new look
// once its script says what it is; until the Art Library makes it, Battle 3 draws it with the built `vance` row (the long-coated man at the Loom). The camera is never a target.
//
// Spotlight Lock then Big Flash (the one telegraph of the chapter). It is the chapter 10 pattern (Boarding Group Nine, then GATE CLOSED), so no new rules field is needed:
//   Spotlight Lock  `aim:'back'` looks at the Back row first, `then:'big_flash'` makes the next act the follow-up, and the `mark` op names the ally. The Mark is not a status: it cannot
//                   be cleansed and it stays on that ally through a row change. The lock itself gives the rig +20% Crit Rate for 1 turn (`spotlight_lock`, a buff, so a strip takes it).
//   Big Flash       `hits:'marked'` fires at the Marked ally on its next turn, 1.5x Razzle, charged first. `stopByIntercept` (chapter 4's CUT!): when Tom's Suite Door Slide takes it, Tom
//                   takes the flash and the Stun does not land. A shield that soaks the whole hit also stops the Stun (the shared soak rule). An interrupt or a Break cancels the follow-up.
// Backdrop Wall (once, at 50% HP): a Guard Stance behind a rolled-down backdrop (`backdrop_wall`, 25% less damage for 2 turns), +20% Attack (`backdrop_heat`, a buff) and the lamps
//   overheat and leave it Toasty for 2 turns, so a Racket hit (one of its Pet Peeves) sets off Panic Boil! and brings the backdrop down. A Break ends it too.
// Every Light On (below 50% HP): a party-wide Razzle act that is charged first and tires everyone.
// Cadence (the bestiary prints none): the acts run in printed order, an act whose `when` fails is skipped, Backdrop Wall is the once-at-half-HP act and Every Light On joins below half HP.
// The numbers that are mine are those two and nothing else; they are tuned only through the simulator.

// ---------- The Studio Rig (boss, Front, 6,200 HP (printed 3,790), 8 pips, no running) ----------
B3_FOES.vance={id:'vance',name:'The Studio Rig',ch:18,role:'boss',row:'front',hp:6200,hp3:4650,atk:203,def:85,spd:122,pips:8,
  peeves:['clobber','racket'],resists:['razzle'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'tripod_sweep',name:'Tripod Sweep',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'hot_bulb_pop',name:'Hot Bulb Pop',flavor:['sizzle'],power:1,recovery:100,hits:'two_random',tags:['projectile'],effects:[{op:'status',id:'toasty',n:2,to:'target'}]},
    {id:'spotlight_lock',name:'Spotlight Lock',flavor:['support'],power:0,recovery:80,hits:'one',aim:'back',tags:['charge_up','buff'],then:'big_flash',
      effects:[{op:'mark'},{op:'status',id:'spotlight_lock',to:'self'}]},
    {id:'big_flash',name:'Big Flash',flavor:['razzle'],power:1.5,recovery:120,hits:'marked',tags:['projectile','charge_up'],after:'spotlight_lock',stopByIntercept:true,
      effects:[{op:'status',id:'stun',n:1,to:'target'}]},
    {id:'backdrop_wall',name:'Backdrop Wall',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'status',id:'backdrop_wall',to:'self'},{op:'status',id:'backdrop_heat',to:'self'},{op:'status',id:'toasty',n:2,to:'self'}]},
    {id:'every_light_on',name:'Every Light On',flavor:['razzle'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'fatigue',n:2,to:'target'}]}
  ]};

// ---------- Formation (bestiary sections 4 and 5) ----------
// The chapter pays 90 Vibe Points and has one fight, so the boss pays all of it.
B3_FORMATIONS.vance={id:'vance',ch:18,foes:[{id:'vance',row:'front'}],vp:90};
