'use strict';
// data/b3-foes-ch03.js — Battle 3 enemies: chapter 3, the pier and the Sundial Hollow inlet, Long Island (bestiary v11 section 2).
// Numbers are the bestiary's printed numbers. The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 3's party is four (Tom, Grace, Rose, Boppy), so the boss prints its HP for 4 and `hp3` for three.
// Old Iron-Gill dives: Inlet Submerge is itself the wind-up (`then`) of Deep Dive. It lands now (the `row` op moves Iron-Gill to the Back
// row, the `summon` op calls a Soggy Sock to Front when no other monster stands there) and Deep Dive fires on its next turn unless
// an interrupt or a Break cancels it. The dive that comes at 50% HP is a second act (`inlet_submerge_low`) with its own copy of Deep Dive (`deep_dive_low`): the data check wants each wind-up to name its own follow-up. Deep Dive brings it back to Front; if the dive was cancelled it surfaces as its next turn begins
// (`surfaces:true`, engine/b3-foe.js). With every monster in Front gone, a Back-row monster counts as Front (b3EffRow).
B3_FOES.soggysock={id:'soggysock',name:'Soggy Sock',ch:3,role:'swarmer',row:'front',hp:101,atk:28,def:18,spd:103,pips:0,
  peeves:['sizzle','razzle'],resists:['drench'],start:[],mechanics:[],drop:'dampsock',
  acts:[
    {id:'wring_out',name:'Wring Out',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'sock_slap',name:'Sock Slap',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'squelch',name:'Squelch',flavor:['drench'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'slow',to:'target'}]}
  ]};
B3_FOES.bobber={id:'bobber',name:'Bobber',ch:3,role:'skirmisher',row:'front',hp:124,atk:35,def:19,spd:118,pips:0,
  peeves:['drench','clobber'],resists:[],start:['choppy_bob'],mechanics:[],drop:'luckybobber',
  acts:[
    {id:'cork_bonk',name:'Cork Bonk',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'plunk',name:'Plunk!',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'drenched',to:'target'}]},
    {id:'sink_and_pop',name:'Sink & Pop',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee','buff'],effects:[{op:'status',id:'choppy_bob',n:1,to:'self'}]}
  ]};
B3_FOES.tangle={id:'tangle',name:'Tangle',ch:3,role:'bruiser',row:'front',hp:178,atk:36,def:23,spd:93,pips:0,
  peeves:['sizzle','racket'],resists:[],start:[],mechanics:[],drop:'fishline',
  acts:[
    {id:'line_snarl',name:'Line Snarl',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',to:'target'}]},
    {id:'wrap_up',name:'Wrap Up',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'slow',to:'target'}]},
    {id:'big_knot',name:'Big Knot',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'slow',to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
// Snag, the chapter's Elite: 4 Composure pips, shrugs off Drench, starts wedged under its Sunken Timber.
B3_FOES.snag={id:'snag',name:'Snag',ch:3,role:'elite',row:'front',hp:279,atk:38,def:28,spd:88,pips:4,
  peeves:['sizzle'],resists:['drench'],start:['sunken_timber'],mechanics:[],drop:'driftwood',
  acts:[
    {id:'reed_trip',name:'Reed Trip',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'hook_catch',name:'Hook Catch',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'hooked',to:'target'}]},
    {id:'undertow',name:'Undertow',flavor:['drench'],power:1.5,recovery:120,hits:'one',tags:['ground_sweep','charge_up'],effects:[{op:'status',id:'drenched',to:'target'},{op:'push',n:20,to:'target'}]}
  ]};
B3_FOES.irongill={id:'irongill',name:'Old Iron-Gill',ch:3,role:'boss',row:'front',hp:650,hp3:490,atk:41,def:25,spd:100,pips:6,
  peeves:['clobber','razzle'],resists:[],start:[],mechanics:[],drop:null,noRun:true,surfaces:true,
  acts:[
    {id:'pond_spit',name:'Pond Spit',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'},{op:'status',id:'slow',to:'target'}]},
    {id:'whisker_whip',name:'Whisker Whip',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'iron_headbutt',name:'Iron Headbutt',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]},
    {id:'pepper_belch',name:'Pepper Belch',flavor:['sizzle'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],
      effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'toasty',n:1,to:'self'}]},
    {id:'inlet_submerge',name:'Inlet Submerge',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff','charge_up'],when:{everyTurn:3},then:'deep_dive',
      effects:[{op:'row',row:'back',to:'self'},{op:'summon',id:'soggysock',row:'front',n:1,ifNoFront:true}]},
    {id:'inlet_submerge_low',name:'Inlet Submerge',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff','charge_up'],when:{once:true,hpBelow:.5},then:'deep_dive_low',
      effects:[{op:'row',row:'back',to:'self'},{op:'summon',id:'soggysock',row:'front',n:1,ifNoFront:true}]},
    {id:'deep_dive',name:'Deep Dive',flavor:['drench'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],after:'inlet_submerge',
      effects:[{op:'status',id:'drenched',to:'target'},{op:'row',row:'front',to:'self'}]},
    {id:'deep_dive_low',name:'Deep Dive',flavor:['drench'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],after:'inlet_submerge_low',
      effects:[{op:'status',id:'drenched',to:'target'},{op:'row',row:'front',to:'self'}]}
  ]};
// Formations (bestiary section 4). vp: 9 for each normal fight (the chapter has seven), 27 for the boss (bestiary section 5).
B3_FORMATIONS.soggysock={id:'soggysock',ch:3,foes:[{id:'soggysock',row:'front'},{id:'soggysock',row:'front'}],vp:9};
B3_FORMATIONS.bobber={id:'bobber',ch:3,foes:[{id:'bobber',row:'front'},{id:'soggysock',row:'front'}],vp:9};
B3_FORMATIONS.tangle={id:'tangle',ch:3,foes:[{id:'tangle',row:'front'},{id:'bobber',row:'back'}],vp:9};
B3_FORMATIONS.snag={id:'snag',ch:3,foes:[{id:'snag',row:'front'},{id:'bobber',row:'back'}],vp:9};
B3_FORMATIONS.irongill={id:'irongill',ch:3,foes:[{id:'irongill',row:'front'}],vp:27};
