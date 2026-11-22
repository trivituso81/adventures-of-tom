'use strict';
// data/b3-foes-ch11.js — Battle 3 enemies: chapter 11, the Endless Concourse of Terminal Infinity (bestiary v11 section 2, "Chapter 11").
// Numbers are the bestiary's printed numbers, except where a line below says a number was changed from the simulator.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// What is here: Lost Luggage, Red-Eye, the Standby Sprite (the chapter's Elite), FINAL CALL (the boss) and the four formations. Chapter 11 has
// no fight with Julian Vance himself: his scene ends with "FINAL CALL." and the departures board steps out, so FINAL CALL is his fight.
// Chapter 11's party is four (Tom, Grace, Rose, Amy; TNB and Nara wait on the gold benches), so FINAL CALL prints its HP for 4 and `hp3` for three.
//
// FINAL CALL's three rule lines (bestiary 1.1 and the entry):
//   Gate Change      `hits:'front_back'` picks 1 Front ally and 1 Back ally (two allies like two_random when one row is empty), both are pushed 20 ticks,
//                    FINAL CALL is left Dazzled (1t) on itself, and the `tradeRows` op swaps the two rows. With nobody in one row nothing changes row.
//   Rebooking Stampede  a once-at-60% wind-up: it calls Lost Luggage to the Front (up to 2: the Front row holds 3 and FINAL CALL is one), gives every
//                    monster +20% Speed for 2 turns, and on its next turn the party-wide floor sweep (`stampede_sweep`, the Avalanche's numbers) lands.
//   ALL FLIGHTS CANCELLED  below half HP, a party-wide act that takes a Pep and tires everyone.
// Battle 2's FINAL CALL called one person a turn, had a CANCELLED shield and a LET IT FLY kindness route; none of that is in Battle 3 (no Kindness in
// battle, spec 1.1). The BENCH CALL swap is the gold Boarding Gate benches before the fight (engine/bench.js), as it already is.
B3_FOES.lostluggage={id:'lostluggage',name:'Lost Luggage',ch:11,role:'bruiser',row:'front',hp:638,atk:101,def:51,spd:105,pips:0,
  peeves:['clobber','racket'],resists:[],start:[],mechanics:[],drop:'pretzels',
  acts:[
    {id:'handle_swing',name:'Handle Swing',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'caster_wheelie',name:'Caster Wheelie',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'frantic_rummage',name:'Frantic Rummage',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'rummaged',to:'target'}]}
  ]};
B3_FOES.redeye={id:'redeye',name:'Red-Eye',ch:11,role:'hexer',row:'back',hp:472,atk:87,def:44,spd:116,pips:0,
  peeves:['razzle','sizzle'],resists:['racket'],start:[],mechanics:[],drop:'coldbrew',
  acts:[
    {id:'sleepy_yawn',name:'Sleepy Yawn',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',to:'target'}]},
    {id:'midnight_contrail',name:'Midnight Contrail',flavor:['razzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'cabin_lights_dim',name:'Cabin Lights Dim',flavor:['racket'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
// The Standby Sprite, the chapter's Elite: 4 Composure pips, and it starts behind the gate podium (Guard Stance, 25% less damage for 2 turns).
B3_FOES.standbysprite={id:'standbysprite',name:'Standby Sprite',ch:11,role:'elite',row:'front',hp:999,atk:106,def:61,spd:99,pips:4,
  peeves:['drench','clobber'],resists:[],start:['podium_counter'],mechanics:[],drop:'prioritytag',
  acts:[
    {id:'paddle_swat',name:'Paddle Swat',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'seat_seventeen',name:'Seat Seventeen',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'seat_seventeen',to:'target'}]},
    {id:'waitlist_bump',name:'Waitlist Bump',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'push',n:30,to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.finalcall={id:'finalcall',name:'FINAL CALL',ch:11,role:'boss',row:'front',hp:1670,hp3:1250,atk:115,def:56,spd:112,pips:7,
  peeves:['razzle','racket'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'gate_change',name:'Gate Change',flavor:['racket'],power:.85,recovery:80,hits:'front_back',tags:['projectile'],
      effects:[{op:'push',n:20,to:'target'},{op:'status',id:'dazzled',n:1,to:'self'},{op:'tradeRows'}]},
    {id:'rebooking_stampede',name:'Rebooking Stampede',flavor:['support'],power:0,recovery:80,hits:'foes',tags:['charge_up','buff'],when:{once:true,hpBelow:.6},then:'stampede_sweep',
      effects:[{op:'summon',id:'lostluggage',row:'front',n:2},{op:'status',id:'stampede',to:'allies'}]},
    {id:'concourse_strobe_arc',name:'Concourse Strobe Arc',flavor:['razzle'],power:1.05,recovery:100,hits:'all',tags:['projectile','aoe'],effects:[{op:'status',id:'blind',n:1,to:'randomFoe'}]},
    {id:'baggage_claim_avalanche',name:'Baggage-Claim Avalanche',flavor:['clobber'],power:1.25,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'slow',n:1,to:'target'}]},
    {id:'stampede_sweep',name:'Baggage-Claim Avalanche',flavor:['clobber'],power:1.25,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],after:'rebooking_stampede',effects:[{op:'status',id:'slow',n:1,to:'target'}]},
    {id:'all_flights_cancelled',name:'ALL FLIGHTS CANCELLED',flavor:['razzle'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
// Formations (bestiary section 4). vp: 10 for each normal fight (the chapter has six, one of them the Elite), 30 for the boss (bestiary section 5).
// `lostluggage` and `redeye` are the two map monsters of the concourse's packs and they name the same fight: Lost Luggage in Front, Red-Eye in Back.
B3_FORMATIONS.lostluggage={id:'lostluggage',ch:11,foes:[{id:'lostluggage',row:'front'},{id:'redeye',row:'back'}],vp:10};
B3_FORMATIONS.redeye={id:'redeye',ch:11,foes:[{id:'lostluggage',row:'front'},{id:'redeye',row:'back'}],vp:10};
B3_FORMATIONS.standbysprite={id:'standbysprite',ch:11,foes:[{id:'standbysprite',row:'front'},{id:'redeye',row:'back'}],vp:10};
B3_FORMATIONS.finalcall={id:'finalcall',ch:11,foes:[{id:'finalcall',row:'front'}],vp:30};
