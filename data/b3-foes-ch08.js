'use strict';
// data/b3-foes-ch08.js — Battle 3 enemies: chapter 8, Division Nine Car Barn (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 8's party is three (Tom, TNB, Nara), so Old Ironbelly prints its HP for 3 and `hp4` for four.
// Old Ironbelly's heat is Sizzle: Hot Coal and BROIL turn TNB's clay shields into Fired Glaze (engine/b3-custom.js, already built).
// New in stage 13a: the strip kind `shieldOrBuff` (The Draft's Pilot-Light Gust) and nothing else; every other act uses a seam that exists.
B3_FOES.lukewarm={id:'lukewarm',name:'Lukewarm',ch:8,role:'swarmer',row:'front',hp:244,atk:56,def:31,spd:111,pips:0,
  peeves:['sizzle','razzle'],resists:['drench'],start:[],mechanics:[],drop:'tepidcoffee',
  acts:[
    {id:'tepid_slosh',name:'Tepid Slosh',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'cold_shoulder',name:'Cold Shoulder',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'room_temperature',name:'Room Temperature',flavor:['drench'],power:1.05,recovery:120,hits:'all',tags:['aoe'],effects:[{op:'status',id:'drenched',to:'target'}]}
  ]};
B3_FOES.leftover={id:'leftover',name:'Leftover',ch:8,role:'swarmer',row:'front',hp:244,atk:56,def:31,spd:111,pips:0,
  peeves:['sizzle','clobber'],resists:['racket'],start:[],mechanics:[],drop:'leftovers',
  acts:[
    {id:'snap_lid_flip',name:'Snap-Lid Flip',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'mystery_tupperware',name:'Mystery Tupperware',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'freezer_burn',name:'Freezer Burn',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe'],effects:[{op:'status',id:'slow',n:1,to:'target'}]}
  ]};
B3_FOES.wetblanket={id:'wetblanket',name:'Wet Blanket',ch:8,role:'bruiser',row:'front',hp:431,atk:73,def:41,spd:101,pips:0,
  peeves:['sizzle','clobber'],resists:['drench'],start:[],mechanics:[],drop:'warmblanket',
  acts:[
    {id:'why_bother',name:'“Why Bother?”',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'why_bother',to:'target'}]},
    {id:'damp_smother',name:'Damp Smother',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'dampen_spirits',name:'Dampen Spirits',flavor:['drench'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'fatigue',to:'target'},{op:'status',id:'drenched',to:'target'}]}
  ]};
B3_FOES.thedraft={id:'thedraft',name:'The Draft',ch:8,role:'skirmisher',row:'back',hp:300,atk:69,def:33,spd:127,pips:0,
  peeves:['sizzle','razzle'],resists:['racket'],start:['crosswind'],mechanics:[],drop:'draftstopper',
  acts:[
    {id:'pilot_light_gust',name:'Pilot-Light Gust',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'strip',kind:'shieldOrBuff',to:'target'}]},
    {id:'hallway_chill',name:'Hallway Chill',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'slam_the_door',name:'Slam the Door!',flavor:['clobber'],power:1.15,recovery:120,hits:'all',tags:['aoe'],effects:[]}
  ]};
// The Picky Eater, the chapter's Elite: 4 Composure pips, shrugs off Clobber, starts behind its Tin Lunchbox Lid (Guard Stance).
B3_FOES.pickyeater={id:'pickyeater',name:'The Picky Eater',ch:8,role:'elite',row:'front',hp:675,atk:76,def:49,spd:95,pips:4,
  peeves:['racket','drench'],resists:['clobber'],start:['tin_lid'],mechanics:[],drop:'hotsauce',
  acts:[
    {id:'ew_it_touched',name:'“EW, It Touched!”',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'it_touched',to:'target'}]},
    {id:'lid_snap',name:'Lid Snap',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'push_it_away',name:'Push It Away',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'fatigue',to:'target'},{op:'push',n:20,to:'target'}]}
  ]};
// Old Ironbelly, the chapter 8 boss. Its own fire is the opening: BROIL and Full Furnace leave Old Ironbelly itself Toasty, and a Drench hit
// then sets off Steam Cloud! (2 pips, plus 1 for the Pet Peeve, the most one action can take). Below 50% HP Full Furnace also gives +20% Attack.
B3_FOES.ironbelly={id:'ironbelly',name:'Old Ironbelly',ch:8,role:'boss',row:'front',hp:1040,hp4:1390,atk:83,def:45,spd:108,pips:7,
  peeves:['drench'],resists:['sizzle'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'soot_puff',name:'Soot Puff',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'belly_bump',name:'Belly Bump',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'hot_coal',name:'Hot Coal',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'toasty',to:'target'}]},
    {id:'broil',name:'BROIL',flavor:['sizzle'],power:1.25,recovery:120,hits:'all',tags:['aoe','charge_up'],
      effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'toasty',to:'self'}]},
    {id:'full_furnace',name:'Full Furnace',flavor:['sizzle'],power:1.35,recovery:120,hits:'all',tags:['aoe','buff','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'toasty',to:'self'},{op:'status',id:'full_furnace',to:'self'}]}
  ]};
// Formations (bestiary section 4). vp: 9 for each normal fight, 27 for the boss (bestiary section 5).
B3_FORMATIONS.lukewarm={id:'lukewarm',ch:8,foes:[{id:'lukewarm',row:'front'},{id:'lukewarm',row:'front'}],vp:9};
B3_FORMATIONS.leftover={id:'leftover',ch:8,foes:[{id:'leftover',row:'front'},{id:'lukewarm',row:'front'}],vp:9};
B3_FORMATIONS.wetblanket={id:'wetblanket',ch:8,foes:[{id:'wetblanket',row:'front'},{id:'lukewarm',row:'front'}],vp:9};
B3_FORMATIONS.thedraft={id:'thedraft',ch:8,foes:[{id:'leftover',row:'front'},{id:'thedraft',row:'back'}],vp:9};
B3_FORMATIONS.pickyeater={id:'pickyeater',ch:8,foes:[{id:'pickyeater',row:'front'},{id:'thedraft',row:'back'}],vp:9};
B3_FORMATIONS.ironbelly={id:'ironbelly',ch:8,foes:[{id:'ironbelly',row:'front'}],vp:27};
