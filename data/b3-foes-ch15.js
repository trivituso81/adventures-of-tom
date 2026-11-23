'use strict';
// data/b3-foes-ch15.js — Battle 3 enemies: chapter 15, the family dinner (bestiary v11 section 2, "Chapter 15": entry 72, the Windowsill Radio, id `hush9final`).
// Numbers are the bestiary's printed numbers, except where a line below says a number was changed from the simulator. Chapters 15 to 20 are PROVISIONAL in the bestiary.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// What is here: the radio (the chapter's one fight and its boss), the Hushling pods it calls (helpers), and the one formation. Chapter 15's party is four (Tom, Grace, Rose
// and Amy out front; Deedee, Boppy, TNB and Nara sit at the table), so the radio prints its HP for 4 and `hp3` for three.
//
// Name and look: the built scenes (data/scenes-ch15.js) and the painting call this monster HUSH-9 Final Form, and the bestiary calls it the Windowsill Radio (working name),
// noting that the story thread says both ("frozen on the windowsill" and "the thing that woke up") and that "the name and look wait for the script". The player has only ever
// met HUSH-9, so the fight uses that name. It is one string (`name` below) and one id, so it changes in one place when the script settles it. The acts keep the bestiary's names.
//
// Rule lines (bestiary 1.1 and the entry):
//   Speaker pods     the fight starts with 2 Hushling pods in the Back row (the formation). A pod is a Hushling on the chapter 15 helper line: 366 HP, Atk 124, Def 56, Spd 122,
//                    0 pips, no drop, no Vibe Points, and the Hushling's three acts. Tinny Shush cannot hit the same ally twice within 2 of the pod's turns (the Hushling's own rule).
//   Helper feedback  knocking a pod out sends feedback into the radio: 1 Composure pip and Dazzled for 2 turns (`onKo`, the target `allyBoss`, built for chapter 13). The pip goes through the
//                    knocking action's ledger, so it counts inside the 3-pip cap.
//   No helper link   unlike chapter 13's Drill Worm, the radio takes NO damage reduction from its pods: the bestiary prints feedback only, so no reduction number is added.
//   Calling them back  the first Dead Air at or below 50% HP is a different row (`dead_air_calls`) that also calls the pods back, once: it fills the Back row up to its 2 places
//                    (`B3_RULES.add.room.back`) with pods of 366 HP, so a pod that is still standing is not doubled.
//   Mute Button      Skill Lock (2 turns) and -1 Pep on one ally, with a 2-round wait (`waitRounds`, the engine's "X-round wait").
//   Total Silence    below 50% HP, a party-wide act that is charged first.
// `helpers` is a layout-only field (engine/b3-play.js `b3HelperOf`): the radio is drawn 2.5 times large and would hide a pod in the Back slot, so its pods stand in the gap between it
// and the family, like chapter 13's relay. It changes no number.
B3_FOES.hushpod={id:'hushpod',art:'hushling',name:'Hushling Pod',ch:15,role:'helper',row:'back',hp:366,atk:124,def:56,spd:122,pips:0,
  peeves:['racket','clobber'],resists:[],start:[],mechanics:[],drop:null,
  acts:[
    {id:'static_drift',name:'Static Drift',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'tinny_shush',name:'Tinny Shush',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{notSameAllyTurns:2},effects:[{op:'status',id:'skill_lock',n:2,to:'target'}]},
    {id:'dead_channel_hum',name:'Dead-Channel Hum',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'pep',n:-1,to:'target'}]}
  ],
  onKo:[{op:'composure',n:1,to:'allyBoss'},{op:'status',id:'dazzled',n:2,to:'allyBoss'}]};
// The radio, the boss: 7 pips, Front, no running. It resists Razzle; Racket and Clobber are its Pet Peeves.
// CHANGED FROM THE BESTIARY (the only number that is): HP 3,300 (2,478 for three) instead of the printed 2,490 (1,870). On the printed HP the simulator (`node tools/b3-sim.js new87 100
// --support=4`, Rank 2, Tom, Grace, Rose and Amy at level 37) won in 4.2 rounds (shortest 3.6), under the 5 aimed for a boss that brings helpers (held to 5 to 7); the family's Clobber
// and Racket Skills are the radio's Pet Peeves, so the simple player shaves its pips and hits weak points all fight, and the pods add only 732 HP. At 3,000 it ran 5.2, at 3,300 5.6
// (shortest 4.5, longest 6.6) and at 3,600 6.3. 3,300 is the smallest round number that sits inside the target with room on both sides. The other numbers are as printed.
// Chapters 15 to 20 are provisional (bestiary 1.6 says to change the factor when play disagrees), so this is the first number to revisit after Tom plays it.
B3_FOES.hush9final={id:'hush9final',name:'HUSH-9 Final Form',ch:15,role:'boss',row:'front',hp:3300,hp3:2478,atk:163,def:71,spd:118,pips:7,
  peeves:['racket','clobber'],resists:['razzle'],start:[],mechanics:[],drop:null,noRun:true,
  helpers:['hushpod'],
  acts:[
    {id:'squelch_knob',name:'Squelch Knob',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:1,to:'target'}]},
    {id:'cabinet_thump',name:'Cabinet Thump',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'mute_button',name:'Mute Button',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{waitRounds:2},
      effects:[{op:'status',id:'skill_lock',n:2,to:'target'},{op:'pep',n:-1,to:'target'}]},
    {id:'dead_air',name:'Dead Air',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'fatigue',n:1,to:'target'}]},
    {id:'dead_air_calls',name:'Dead Air',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{once:true,hpBelow:.5},
      effects:[{op:'status',id:'fatigue',n:1,to:'target'},{op:'summon',id:'hushpod',row:'back',n:2,hp:366}]},
    {id:'total_silence',name:'Total Silence',flavor:['racket'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formation (bestiary sections 4 and 5): the radio in Front with 2 pods in Back. The chapter has no other fight, so it pays the whole 90 Vibe Points.
B3_FORMATIONS.hush9final={id:'hush9final',ch:15,foes:[{id:'hush9final',row:'front'},{id:'hushpod',row:'back'},{id:'hushpod',row:'back'}],vp:90};
