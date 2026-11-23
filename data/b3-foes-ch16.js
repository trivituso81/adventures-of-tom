'use strict';
// data/b3-foes-ch16.js — Battle 3 enemies: chapter 16, the town square (bestiary v11 section 2, "Chapter 16": entries 73 and 74, `greynote` and `marlowe16`).
// Numbers are the bestiary's printed numbers EXCEPT Marlowe's HP: printed 2,700 (hp3 2,020), set here to 1,300 (hp3 975) because the simulator put the printed number at 18.75 rounds
// with 9 of 100 fights lost (target 5 to 7); at 1,300 it is 6.68 rounds, 100 of 100 won. See docs/BATTLE3.md "What stage 22 chapter 16 holds" and the card history of c-b3s22ch16.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js. Chapters 15 to 20 are PROVISIONAL in the bestiary.
// What is here: the Grey Note (the bestiary's Citation Slip, working name), its helper row (the one the boss calls, 404 HP), Marlowe (the bestiary's Square's Sign, working
// name) and the two formations. Chapter 16's party is four (Tom, Amy, TNB and Nara; Deedee and Boppy are statues and the girls are on their way to Cab 7), so the boss prints
// its HP for 4 and `hp3` for three.
//
// Names: the bestiary notes that the sign and the slips are working names from a draft ("Plaza Permit Cutout", "Citation Slip") that Tom has not seen, and that the story
// thread puts this fight in the square against Vance's fixer. The built scenes (data/scenes-ch16.js, data/ch16-monsters.js) call the boss Marlowe and the sticky notes that say
// LESS Grey Notes, and the family has only ever met those. So the fight uses the scene's names, the way chapter 15 uses HUSH-9 and chapter 14 uses the armor's real motion names:
// the foe's `name` and each act's `name` are one string each, so they change in one place when the script settles them. Every number, flavor, tag and effect is the bestiary's.
//   bestiary name                       built name
//   The Square's Sign (`marlowe16`)     Marlowe
//   Citation Slip (`greynote`)          Grey Note
//   Red-Line Strike / Zoning Fine       Strike Through / Marginal Note (the Battle 2 acts they match)
//   Issue Citations (Red-Tape Wall)     Brace Behind the Eclipse (Behind the Eclipse)
//   Plaza Curfew / Total Shut-Down      Overexposure / Total Eclipse (the Battle 2 names the scenes and tips already use)
//   Adhesive Slap / Ordinance Flutter / Permit Revoked   Stick / Flutter / Fade
//
// Rule lines (bestiary 1.1 and the entry):
//   Behind the Eclipse  (Red-Tape Wall) a Guard Stance at 30% less damage (`eclipse_wall`) and a +20% Defense buff (`eclipse_plating`), 2 turns, and it calls Grey Notes into the
//                       Back row up to its 2 places (`summon`, 404 HP each; one that is already standing is not doubled). While the stance lasts, 15% of any hit whose flavor is NOT
//                       Racket or Drench (his Pet Peeves) bounces back at whoever threw it: the `bounce` op (engine/b3-ops.js), plain damage, no Defense, the shield soaks it first,
//                       and it never knocks anyone out. Panic Boil!, a Break and a stance-breaking Skill end the stance and the bounce with it; Olivia's Fact-Check turns the
//                       Defense buff. It is used twice in the fight: once above half HP and once below half HP (`once` acts; the bestiary gives no cadence, this is my call,
//                       tuned only through the simulator: a third, repeating wall with refilling Grey Notes ran the fight past 8 rounds at any HP that kept it winnable).
//   Overexposure        a party-wide act that is charged first: Blind and Slow for 1 turn.
//   Total Eclipse       below 50% HP, a party-wide floor sweep that is charged first.
//   No helper link, no helper feedback: the bestiary prints neither for the Grey Notes, so knocking one out only removes a Grey Note's attacks and its Fatigue and buff strip.
// `helpers` is a layout-only field (engine/b3-play.js `b3HelperOf`): the boss is drawn 2.5 times large, so its Grey Notes stand in the gap between it and the family. It changes no number.
const B3_CH16_NOTE_ACTS=[
  {id:'stick',name:'Stick',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
  {id:'flutter',name:'Flutter',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'bleed',n:2,to:'target'}]},
  {id:'fade',name:'Fade',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'strip',kind:'buff',n:1,to:'target'}]}
];
// The Grey Note in its own fight: 1,000 HP by hand (the Hexer role would give 808; a pair at 808 ran about 2.7 rounds, the shortest normal fight in the game). Hexer, Back, no pips.
B3_FOES.greynote={id:'greynote',name:'Grey Note',ch:16,role:'hexer',row:'back',hp:1000,atk:133,def:59,spd:124,pips:0,
  peeves:['racket','drench'],resists:[],start:[],mechanics:[],drop:'pretzels',
  acts:JSON.parse(JSON.stringify(B3_CH16_NOTE_ACTS))};
// The Grey Note the boss calls (helper): the same stats and acts on 404 HP, so the boss fight is unchanged by the 1,000 above. A called add pays no drop and no Vibe Points.
B3_FOES.greynoteh={id:'greynoteh',art:'greynote',name:'Grey Note',ch:16,role:'helper',row:'back',hp:404,atk:133,def:59,spd:124,pips:0,
  peeves:['racket','drench'],resists:[],start:[],mechanics:[],drop:null,
  acts:JSON.parse(JSON.stringify(B3_CH16_NOTE_ACTS))};
// Marlowe, the boss: 8 pips, Front, no running. He resists Clobber; Racket and Drench are his Pet Peeves.
B3_FOES.marlowe16={id:'marlowe16',name:'Marlowe',ch:16,role:'boss',row:'front',hp:1300,hp3:975,atk:175,def:76,spd:120,pips:8,
  peeves:['racket','drench'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  helpers:['greynoteh'],quietEnd:true,   // quietEnd: his fall is silent (engine/b3-story.js b3sAward; the tragedy chapter has no fanfare)
  acts:[
    {id:'strike_through',name:'Strike Through',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'marginal_note',name:'Marginal Note',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'marginal_note',to:'target'}]},
    {id:'brace_first',name:'Brace Behind the Eclipse',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{once:true,hpAbove:.5},
      effects:[{op:'status',id:'eclipse_wall',to:'self'},{op:'status',id:'eclipse_plating',to:'self'},{op:'summon',id:'greynoteh',row:'back',n:2,hp:404}]},
    {id:'brace_second',name:'Brace Behind the Eclipse',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'status',id:'eclipse_wall',to:'self'},{op:'status',id:'eclipse_plating',to:'self'},{op:'summon',id:'greynoteh',row:'back',n:2,hp:404}]},
    {id:'overexposure',name:'Overexposure',flavor:['racket'],power:1.2,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'blind',n:1,to:'target'},{op:'status',id:'slow',n:1,to:'target'}]},
    {id:'total_eclipse',name:'Total Eclipse',flavor:['clobber'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formations (bestiary sections 4 and 5): two Grey Notes (Front and Back) at 15 Vibe Points; Marlowe in Front with two Grey Notes in Back at the boss's 60.
B3_FORMATIONS.greynote={id:'greynote',ch:16,foes:[{id:'greynote',row:'front'},{id:'greynote',row:'back'}],vp:15};
B3_FORMATIONS.marlowe16={id:'marlowe16',ch:16,foes:[{id:'marlowe16',row:'front'},{id:'greynoteh',row:'back'},{id:'greynoteh',row:'back'}],vp:60};
