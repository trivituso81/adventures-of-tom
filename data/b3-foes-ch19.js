'use strict';
// data/b3-foes-ch19.js — Battle 3 enemies: chapter 19, the lost-mail office (bestiary v11 section 2, "Chapter 19": entries 80 to 83).
// Numbers are the bestiary's printed numbers (PROVISIONAL, chapters 15 to 20) except ONE: the Censor's HP. The bestiary prints 3,400 (2,550 for three); the simulator
// (`node tools/b3-sim.js new97 24 --support=4`) put that at 9.83 rounds against a target of 6 (accept 5 to 7; 6.45 with the stamp switched off), so the HP is 2,300 (1,725 for three, still three
// quarters), which plays 6.22 rounds and wins 24 of 24. The Elites (2.7 and 2.8 rounds) and the Courier fight (6.8 rounds, the bestiary's own estimate) are as printed.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
//
// Tom is frozen and out of the party for the whole chapter. The party is Grace, Rose, Amy, TNB and Nara (data/scenes-ch19.js), so a boss prints its HP for 4 and `hp3` for three.
// Normal fights are ONE Elite at a time (the v10.1 draft paired two Elites, which ran as long as a boss).
//
// What this chapter adds to the rules (docs/BATTLE3.md "What stage 22 chapter 19 holds"):
//   REDACTED        `redact:{dmg:.5}` on the Censor. At each round divider from round 2 it stamps the flavor that did the most damage to it in the round before (a tie, or no damage,
//                   stamps nothing). For that round attacks of only that flavor do half damage and take no pips, and the attacker loses 1 Pep after the action (never below 0; a Basic
//                   Action still gains its +2 first). A two-flavor move loses only its matching half. A Break tears the stamp down. It is the foe's own state, not a status (engine/b3-timeline.js).
//   Wax-Seal Ward   two statuses the Dead Letter starts with: `wax_ward` (+20% Defense) and `wax_seal` (flag `bounceDebuff`): the next debuff aimed at it does not land, it goes back on
//                   whoever sent it, and the seal is used up (engine/b3-ops.js b3PutStatus). Composure loss and Primes still get through.
//   Wall Perch      `perch:true` on the Courier: it stays in the Back row with no monster in Front (b3EffRow). Its acts follow the row it is in (`when:{row}`): wind up the Slam from the Back,
//                   fire it (which lands it in Front), then Pneumatic Whoosh swaps it back (`row:'swap'`). A row move or a Break puts it in Front until its own next Whoosh.
//
// The Courier has no scene that places it (the maps call only `deadletter`, `rubberstamp` and `censor`), so it is a Lab-only fight, like chapter 13's Gold Knight. It is drawn with the
// built `rubberstamp` sprite until the Art Library makes its own (bestiary section 6).

// ---------- Dead Letter (Elite, Front, 2,142 HP, 5 pips) ----------
B3_FOES.deadletter={id:'deadletter',name:'Dead Letter',ch:19,role:'elite',row:'front',hp:2142,atk:193,def:96,spd:109,pips:5,
  peeves:['clobber','sizzle'],resists:[],start:['wax_ward','wax_seal'],mechanics:[],drop:'pretzels',
  acts:[
    {id:'paper_edge_slash',name:'Paper-Edge Slash',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',n:2,to:'target'}]},
    {id:'flap_seal',name:'Flap Seal',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'return_to_sender',name:'Return To Sender',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'push',n:30,to:'target'},{op:'status',id:'slow',n:2,to:'target'}]}
  ]};

// ---------- Rubber Stamp (Elite, Front, 2,142 HP, 5 pips) ----------
// It starts braced on the ink pad (a Guard Stance, 25% less damage for 2 turns).
B3_FOES.rubberstamp={id:'rubberstamp',name:'Rubber Stamp',ch:19,role:'elite',row:'front',hp:2142,atk:193,def:96,spd:109,pips:5,
  peeves:['clobber','razzle'],resists:['drench'],start:['ink_pad'],mechanics:[],drop:'coldbrew',
  acts:[
    {id:'ink_stomp',name:'Ink Stomp',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'postmark',name:'Postmark',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'drenched',n:2,to:'target'},{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'denied',name:'DENIED!',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'denied',to:'target'},{op:'status',id:'fatigue',n:2,to:'target'}]}
  ]};

// ---------- Brass Mail-Chute Courier (Mini-boss with Elite stats, Back, 2,300 HP (1,720 for three), 5 pips, no running) ----------
// Cadence (the bestiary prints none beyond "swaps rows every turn"): Ricochet, Hot Steam Vent, Special Delivery Slam (wound up from the Back, lands in Front), Pneumatic Whoosh (back to the Back,
// +20% Evasion). The Slam is only wound up from the Back and the Whoosh only used from the Front, so a row move or a Break just shortens the cycle.
B3_FOES.mailcourier={id:'mailcourier',art:'rubberstamp',name:'Brass Mail-Chute Courier',ch:19,role:'elite',row:'back',hp:2300,hp3:1720,atk:193,def:96,spd:109,pips:5,perch:true,
  peeves:['razzle','drench'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'sorting_claw_ricochet',name:'Sorting-Claw Ricochet',flavor:['clobber'],power:1,recovery:100,hits:'two_random',tags:['projectile'],effects:[]},
    {id:'hot_steam_vent',name:'Hot Steam Vent',flavor:['sizzle'],power:1,recovery:100,hits:'all',tags:['aoe'],effects:[{op:'status',id:'toasty',n:2,to:'target'},{op:'status',id:'toasty',n:1,to:'self'}]},
    {id:'special_delivery_slam',name:'Special Delivery Slam',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],when:{row:'back'},
      effects:[{op:'pep',n:-1,to:'target'},{op:'push',n:25,to:'target'},{op:'row',row:'front',to:'self'}]},
    {id:'pneumatic_whoosh',name:'Pneumatic Whoosh',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile','buff'],when:{row:'front'},
      effects:[{op:'row',row:'swap',to:'self'},{op:'status',id:'whoosh_eva',to:'self'}]}
  ]};

// ---------- The Dead-Letter Censor (boss, Front, 2,300 HP (printed 3,400; 1,725 for three), 8 pips, no running) ----------
// REDACTED is `redact` (see the top of this file). Dead-Letter Sort is the once-at-half-HP act: it calls 1 Dead Letter, which starts with its own Wax-Seal Ward (+20% Defense).
// UNDELIVERABLE joins the acts below half HP. No act has a single-target spike, because Tom is not there to take one.
B3_FOES.censor={id:'censor',name:'The Dead-Letter Censor',ch:19,role:'boss',row:'front',hp:2300,hp3:1725,atk:210,def:89,spd:123,pips:8,redact:{dmg:.5},
  peeves:['razzle','sizzle'],resists:['racket'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'black_marker_strike',name:'Black-Marker Strike',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'black_marker',to:'target'}]},
    {id:'no_such_address',name:'“No Such Address”',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'strip',kind:'buff',n:1,to:'target'}]},
    {id:'dead_letter_sort',name:'Dead-Letter Sort',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'summon',id:'deadletter',row:'front',n:1}]},
    {id:'strike_it_out',name:'Strike It Out',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'slow',n:1,to:'target'}]},
    {id:'undeliverable',name:'UNDELIVERABLE',flavor:['clobber'],power:1.3,recovery:120,hits:'all',tags:['projectile','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};

// ---------- Formations ----------
// Vibe Points are the chapter's 90 (bestiary section 5): four normal fights at 10 each (the scenes place Dead Letters and Rubber Stamps in the halls), the Courier 20 and the Censor 30.
B3_FORMATIONS.deadletter={id:'deadletter',ch:19,foes:[{id:'deadletter',row:'front'}],vp:10};
B3_FORMATIONS.rubberstamp={id:'rubberstamp',ch:19,foes:[{id:'rubberstamp',row:'front'}],vp:10};
B3_FORMATIONS.mailcourier={id:'mailcourier',ch:19,foes:[{id:'deadletter',row:'front'},{id:'mailcourier',row:'back'}],vp:20};
B3_FORMATIONS.censor={id:'censor',ch:19,foes:[{id:'censor',row:'front'}],vp:30};
