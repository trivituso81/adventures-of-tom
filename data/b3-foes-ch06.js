'use strict';
// data/b3-foes-ch06.js — Battle 3 enemies: chapter 6, Old Oak Park (bestiary v11 section 2).
// Numbers are the bestiary's printed numbers. The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 6's party is three (Tom, TNB, Nara), so Chairman Cheeks prints his HP for 3 and `hp4` for four.
// New in this file: target `randomFrontAlly` (Code Red!), the Acorn Cache add with its own printed HP (`summon` with `hp`), the act
// conditions `noAllyId` and `allyAge` (Stash for Winter: call a cache when none stands, eat the one that has stood for 2 of his turns),
// the op `eat` (the cache is swallowed, no feedback), and `onKo` on a foe: helper feedback when the cache is knocked out first
// (every family member +1 Pep, the boss loses 10% of its Max HP as flat damage and 1 Composure pip).
B3_FOES.acornagent={id:'acornagent',name:'Acorn Agent',ch:6,role:'swarmer',row:'front',hp:185,atk:44,def:26,spd:109,pips:0,
  peeves:['racket','drench'],resists:[],start:[],mechanics:[],drop:'acorn',
  acts:[
    {id:'cap_bonk',name:'Cap Bonk',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'pebble_toss',name:'Pebble Toss',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'code_red',name:'Code Red!',flavor:['racket'],power:1.05,recovery:120,hits:'all',tags:['aoe'],effects:[{op:'status',id:'code_red',to:'randomFrontAlly'}]}
  ]};
B3_FOES.stickysap={id:'stickysap',name:'Sticky Sap',ch:6,role:'bruiser',row:'front',hp:328,atk:57,def:34,spd:99,pips:0,
  peeves:['sizzle','clobber'],resists:['drench'],start:[],mechanics:[],drop:'sapjar',
  acts:[
    {id:'resin_drip',name:'Resin Drip',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'bark_glue',name:'Bark Glue',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['ground_sweep'],effects:[{op:'status',id:'slow',to:'target'}]},
    {id:'sap_flow',name:'Sap Flow',flavor:['drench'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'slow',to:'target'}]}
  ]};
B3_FOES.peanutgallery={id:'peanutgallery',name:'Peanut Gallery',ch:6,role:'hexer',row:'back',hp:242,atk:49,def:29,spd:109,pips:0,
  peeves:['racket','sizzle'],resists:['clobber'],start:[],mechanics:[],drop:'peanuts',
  acts:[
    {id:'shell_boo',name:'Shell Boo',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'cheap_seat_heckle',name:'Cheap Seat Heckle',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'cheap_seat',to:'target'}]},
    {id:'standing_boovation',name:'Standing Boo-vation',flavor:['racket'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.twigspy={id:'twigspy',name:'Twig Spy',ch:6,role:'skirmisher',row:'back',hp:228,atk:55,def:27,spd:125,pips:0,
  peeves:['sizzle','razzle'],resists:['racket'],start:['leaf_camo'],mechanics:[],drop:'binoculars',
  acts:[
    {id:'branch_poke',name:'Branch Poke',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'stakeout_mark',name:'Stakeout Mark',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'stakeout_mark',to:'target'}]},
    {id:'leaf_storm',name:'Leaf Storm',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['projectile','aoe'],effects:[]}
  ]};
// Cheek Stuffer, the chapter's Elite: 4 Composure pips, shrugs off Clobber. Snack Snatch takes a Pep and stuffs its cheeks (+20% Defense).
B3_FOES.cheekstuffer={id:'cheekstuffer',name:'Cheek Stuffer',ch:6,role:'elite',row:'front',hp:513,atk:60,def:40,spd:94,pips:4,
  peeves:['drench','racket'],resists:['clobber'],start:[],mechanics:[],drop:'cheekpouch',
  acts:[
    {id:'crumb_spray',name:'Crumb Spray',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'cheek_bump',name:'Cheek Bump',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'snack_snatch',name:'Snack Snatch',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','buff','charge_up'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'snack_stash',to:'self'}]}
  ]};
// The Acorn Cache (bestiary entry 34): a stash Chairman Cheeks calls into the Back row. It never attacks. It arrives with its own printed
// HP (150, not half), 0 pips and pays 0 VP. If it is still standing on his 2nd turn after the call he eats it. Knocked out first, it pays the
// family back through `onKo`: +1 Pep for everyone, and the boss loses 10% of its Max HP (flat, never the last point) and 1 Composure pip.
B3_FOES.acorncache={id:'acorncache',name:'Acorn Cache',ch:6,role:'helper',row:'back',hp:150,atk:0,def:26,spd:109,pips:0,
  peeves:['clobber','sizzle'],resists:[],start:[],mechanics:[],drop:null,acts:[],
  onKo:[{op:'pep',n:1,to:'foes'},{op:'hpLoss',pct:.10,to:'otherAllies'},{op:'composure',n:1,to:'otherAllies'}]};
// Chairman Cheeks, the chapter 6 boss. Executive Monocle: he starts with +20% Crit Rate and +20% Atk (3 turns, a buff the party can strip or steal).
// Stash for Winter is two acts with one name: every 3 rounds, when no cache stands, he calls one into the Back row; on his 2nd turn after a call
// he eats it (15% HP back, Winter Hoard +25% Atk and Def for 2 turns). The Big Stash is the below-50% wind-up.
B3_FOES.chairman={id:'chairman',name:'Chairman Cheeks',ch:6,role:'boss',row:'front',hp:1130,hp4:1500,atk:65,def:37,spd:106,pips:6,
  peeves:['drench','sizzle'],resists:['racket'],start:['executive_monocle'],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'filibuster',name:'Filibuster',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',to:'target'}]},
    {id:'acorn_volley',name:'Acorn Volley',flavor:['clobber'],power:1,recovery:100,hits:'two_random',tags:['projectile'],effects:[]},
    {id:'cheek_slam',name:'Cheek Slam',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]},
    {id:'stash_for_winter',name:'Stash for Winter',flavor:['support'],power:0,recovery:80,hits:'field',tags:['buff'],when:{everyRound:3,noAllyId:'acorncache'},
      effects:[{op:'summon',id:'acorncache',row:'back',n:1,hp:150}]},
    {id:'stash_eat',name:'Stash for Winter',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{allyId:'acorncache',allyAge:2},
      effects:[{op:'eat',id:'acorncache'},{op:'heal',pct:.15,to:'self'},{op:'status',id:'winter_hoard',to:'self'}]},
    {id:'the_big_stash',name:'The Big Stash',flavor:['clobber'],power:1.35,recovery:120,hits:'all',tags:['projectile','ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formations (bestiary section 4). vp: 6 for each normal fight (the chapter has ten), 30 for the boss (bestiary section 5).
B3_FORMATIONS.acornagent={id:'acornagent',ch:6,foes:[{id:'acornagent',row:'front'},{id:'acornagent',row:'front'}],vp:6};
B3_FORMATIONS.stickysap={id:'stickysap',ch:6,foes:[{id:'stickysap',row:'front'},{id:'acornagent',row:'front'}],vp:6};
B3_FORMATIONS.peanutgallery={id:'peanutgallery',ch:6,foes:[{id:'acornagent',row:'front'},{id:'peanutgallery',row:'back'}],vp:6};
B3_FORMATIONS.twigspy={id:'twigspy',ch:6,foes:[{id:'acornagent',row:'front'},{id:'twigspy',row:'back'}],vp:6};
B3_FORMATIONS.cheekstuffer={id:'cheekstuffer',ch:6,foes:[{id:'cheekstuffer',row:'front'},{id:'peanutgallery',row:'back'}],vp:6};
B3_FORMATIONS.chairman={id:'chairman',ch:6,foes:[{id:'chairman',row:'front'}],vp:30};
