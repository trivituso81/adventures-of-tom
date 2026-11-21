'use strict';
// data/b3-foes-ch02.js — Battle 3 enemies: chapter 2, Jefferson Park and Griffith Park, Los Angeles (bestiary v11 section 2).
// Numbers are the bestiary's printed numbers (the chapter 2 stat blocks were derived at run time in the built game; these are the
// first written-out ones). The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 2's party is three (Tom, TNB, Nara), so the boss prints its HP for 3 and `hp4` for four.
// "all allies" means every family member, so an act that gives a buff to "every foe" uses to:'allies' (the monsters' own side).
B3_FOES.smoglet={id:'smoglet',name:'Smoglet',ch:2,role:'swarmer',row:'front',hp:73,atk:22,def:14,spd:101,pips:0,
  peeves:['razzle','drench'],resists:[],start:[],mechanics:[],drop:'skyjar',
  acts:[
    {id:'soot_cough',name:'Soot Cough',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'tailpipe_puff',name:'Tailpipe Puff',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'toasty',to:'target'}]},
    {id:'brown_haze',name:'Brown Haze',flavor:['sizzle'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'blind',n:1,to:'randomFoe'}]}
  ]};
B3_FOES.tickets={id:'tickets',name:'Ticket Flurry',ch:2,role:'skirmisher',row:'back',hp:90,atk:27,def:15,spd:115,pips:0,
  peeves:['sizzle','drench'],resists:[],start:['paper_swirl'],mechanics:[],drop:'parkticket',
  acts:[
    {id:'windshield_slap',name:'Windshield Slap',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'tuesday_street_cleaning',name:'Tuesday Street Cleaning',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[]},
    {id:'late_fee',name:'Late Fee',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.coyote={id:'coyote',name:'Canyon Coyote',ch:2,role:'skirmisher',row:'front',hp:90,atk:27,def:15,spd:115,pips:0,
  peeves:['racket'],resists:[],start:[],mechanics:[],drop:'bandana',
  acts:[
    {id:'brush_nip',name:'Brush Nip',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',to:'target'}]},
    {id:'trail_pounce',name:'Trail Pounce',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'pack_howl',name:'Pack Howl',flavor:['racket'],power:1,recovery:100,hits:'all',tags:['aoe','buff'],effects:[{op:'status',id:'pack_howl',to:'allies'}]}
  ]};
B3_FOES.gridlock={id:'gridlock',name:'Gridlock',ch:2,role:'bruiser',row:'front',hp:129,atk:29,def:19,spd:91,pips:0,
  peeves:['racket','razzle'],resists:[],start:[],mechanics:[],drop:'hubcap',
  acts:[
    {id:'lay_on_the_horn',name:'Lay On The Horn',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'overheated_radiator',name:'Overheated Radiator',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'toasty',to:'target'}]},
    {id:'rush_hour',name:'Rush Hour',flavor:['clobber'],power:1.2,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[]}
  ]};
// Tar Pit Blob, the chapter's Elite: 4 Composure pips, shrugs off Clobber, starts under its Asphalt Crust.
B3_FOES.tarblob={id:'tarblob',name:'Tar Pit Blob',ch:2,role:'elite',row:'front',hp:202,atk:30,def:23,spd:86,pips:4,
  peeves:['sizzle','drench'],resists:['clobber'],start:['asphalt_crust'],mechanics:[],drop:'fossil',
  acts:[
    {id:'tar_slurp',name:'Tar Slurp',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'slow',to:'target'}]},
    {id:'bubbling_pitch',name:'Bubbling Pitch',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'toasty',to:'target'}]},
    {id:'sticky_situation',name:'Sticky Situation',flavor:['sizzle'],power:1.5,recovery:120,hits:'one',tags:['melee','ground_sweep','charge_up'],effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'slow',to:'target'}]}
  ]};
// The Big Shake, the chapter 2 boss. Above half HP it winds up Aftershock. Below half HP it takes Faultline Guard (Guard Stance and
// Mend 5%, 2 turns) whenever it is not wearing one, and winds up Big Rumble. Panic Boil! drops the stance; a buff strip or a steal takes the Mend.
B3_FOES.bigshake={id:'bigshake',name:'The Big Shake',ch:2,role:'boss',row:'front',hp:460,hp4:620,atk:33,def:21,spd:98,pips:6,
  peeves:['drench','razzle'],resists:[],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'smog_puff',name:'Smog Puff',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',to:'target'}]},
    {id:'boulder_drop',name:'Boulder Drop',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[]},
    {id:'aftershock',name:'Aftershock',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpAbove:.5},effects:[]},
    {id:'faultline_guard',name:'Faultline Guard',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{hpBelow:.5,lacks:'faultline_guard'},
      effects:[{op:'status',id:'faultline_guard',to:'self'},{op:'status',id:'faultline_mend',to:'self'}]},
    {id:'big_rumble',name:'Big Rumble',flavor:['clobber'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[{op:'status',id:'slow',n:1,to:'target'}]}
  ]};
// Formations (bestiary section 4). vp: 10 for each of the chapter's six normal fights, 30 for the boss (bestiary section 5).
B3_FORMATIONS.smoglet={id:'smoglet',ch:2,foes:[{id:'smoglet',row:'front'},{id:'smoglet',row:'front'}],vp:10};
B3_FORMATIONS.tickets={id:'tickets',ch:2,foes:[{id:'smoglet',row:'front'},{id:'tickets',row:'back'}],vp:10};
B3_FORMATIONS.coyote={id:'coyote',ch:2,foes:[{id:'coyote',row:'front'},{id:'tickets',row:'back'}],vp:10};
B3_FORMATIONS.gridlock={id:'gridlock',ch:2,foes:[{id:'gridlock',row:'front'},{id:'smoglet',row:'front'}],vp:10};
B3_FORMATIONS.tarblob={id:'tarblob',ch:2,foes:[{id:'tarblob',row:'front'},{id:'tickets',row:'back'}],vp:10};
B3_FORMATIONS.bigshake={id:'bigshake',ch:2,foes:[{id:'bigshake',row:'front'}],vp:30};
