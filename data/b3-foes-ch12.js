'use strict';
// data/b3-foes-ch12.js — Battle 3 enemies: chapter 12, Tom's street in Los Angeles (Jefferson Park), bestiary v11 section 2, "Chapter 12".
// Numbers are the bestiary's printed numbers, except where a line below says a number was changed from the simulator.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// What is here: Gridlock Prime (the chapter's one fight; Julian Vance's Monochrome Marlowe only introduces it), the little Gridlock it calls (the bestiary's
// "helper" line: HP 713 with four in the party, 357 with three, Atk 110, Def 55, Spd 105) and the one formation.
// The bestiary draft has the boss carry all three neighbor coins and leaves the chapter's other fights to the chapter 12 script, which has none, so the
// formation pays the boss's 45 Vibe Points and no other fight exists to pay the rest.
//
// Gridlock Prime's rule lines (bestiary 1.1 and the entry):
//   Four-Way Red Light  three statuses at once on itself: a Guard Stance at 30% less damage, +30% Def and +25% Atk, 2 turns. Its first use (above half HP)
//                       and its second (once below half HP) each call 1 Gridlock to the Front; the repeat use calls nobody. The Def buff is the heavier
//                       one (`weight`), so Olivia's "Is This Real?" Fact-Check turns that one against it. Panic Boil! or a Break ends the stance.
//   Overheated Radiator Exhaust Heatwave leaves Gridlock Prime itself Toasty (2t) as well as the family; a Drench hit then sets off Steam Cloud!
//                       (3 pips with the Pet Peeve) and a Racket hit sets off Panic Boil! (the rules already do both).
//   Total Gridlock      below half HP, a party-wide floor sweep that is charged first.
B3_FOES.gridlockprime={id:'gridlockprime',name:'Gridlock Prime',ch:12,role:'boss',row:'front',hp:1860,hp3:1400,atk:125,def:60,spd:113,pips:7,
  peeves:['drench','racket'],resists:[],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'air_horn_honk',name:'Air-Horn Honk',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'no_signal_merge',name:'No-Signal Merge',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'exhaust_heatwave',name:'Exhaust Heatwave',flavor:['sizzle'],power:1.1,recovery:100,hits:'all',tags:['aoe'],
      effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'toasty',to:'self'}]},
    {id:'gridlocked_first',name:'Gridlocked Intersection',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{once:true,hpAbove:.5},
      effects:[{op:'status',id:'four_way_red_light',to:'self'},{op:'status',id:'red_light_def',to:'self'},{op:'status',id:'red_light_atk',to:'self'},
        {op:'summon',id:'gridlockhelper',row:'front',n:1,hp:713,hp3:357}]},
    {id:'gridlocked_second',name:'Gridlocked Intersection',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'status',id:'four_way_red_light',to:'self'},{op:'status',id:'red_light_def',to:'self'},{op:'status',id:'red_light_atk',to:'self'},
        {op:'summon',id:'gridlockhelper',row:'front',n:1,hp:713,hp3:357}]},
    {id:'gridlocked_intersection',name:'Gridlocked Intersection',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{everyTurn:3,lacks:'four_way_red_light'},
      effects:[{op:'status',id:'four_way_red_light',to:'self'},{op:'status',id:'red_light_def',to:'self'},{op:'status',id:'red_light_atk',to:'self'}]},
    {id:'total_gridlock',name:'Total Gridlock',flavor:['clobber'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// The little Gridlock the boss calls: the chapter 2 monster's three acts on the chapter 12 helper numbers. Called mid-fight, so it carries no pips and pays no drop.
B3_FOES.gridlockhelper={id:'gridlockhelper',name:'Gridlock',ch:12,role:'bruiser',row:'front',hp:713,hp3:357,atk:110,def:55,spd:105,pips:0,
  peeves:['racket','razzle'],resists:[],start:[],mechanics:[],drop:null,
  acts:[
    {id:'lay_on_the_horn',name:'Lay On The Horn',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'overheated_radiator',name:'Overheated Radiator',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'toasty',to:'target'}]},
    {id:'rush_hour',name:'Rush Hour',flavor:['clobber'],power:1.2,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[]}
  ]};
// Formation (bestiary section 4 and 5): the boss alone, 45 Vibe Points.
B3_FORMATIONS.gridlockprime={id:'gridlockprime',ch:12,foes:[{id:'gridlockprime',row:'front'}],vp:45};
