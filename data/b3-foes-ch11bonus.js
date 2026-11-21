'use strict';
// data/b3-foes-ch11bonus.js — Battle 3 enemies: the bonus chapter, Nine Scoops (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// The bonus party is three (Tom, Grace, Rose) on the chapter 5 baseline, so Brain Freeze prints his HP for 3 and `hp4` for four.
// New in stage 13: the act condition `allyHurt` (Cone Head's Scoop Pass only when another monster is below full HP) and the target `lowestOtherAlly`.
B3_FOES.gremlin={id:'gremlin',name:'Sprinkle Gremlin',ch:'bonus',role:'swarmer',row:'front',hp:148,atk:37,def:22,spd:107,pips:0,
  peeves:['sizzle','drench'],resists:[],start:[],mechanics:[],drop:null,
  acts:[
    {id:'sprinkle_flick',name:'Sprinkle Flick',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'sugar_hop',name:'Sugar Hop',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'sprinkle_spray',name:'Sprinkle Spray',flavor:['razzle'],power:1.05,recovery:120,hits:'all',tags:['projectile','aoe'],effects:[{op:'status',id:'dazzled',n:2,to:'target'}]}
  ]};
B3_FOES.slushslug={id:'slushslug',name:'Slushie Slug',ch:'bonus',role:'elite',row:'front',hp:410,atk:51,def:35,spd:92,pips:4,
  peeves:['sizzle','razzle'],resists:['drench'],start:['blue_ice'],mechanics:[],drop:null,
  acts:[
    {id:'syrup_ooze',name:'Syrup Ooze',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['ground_sweep'],effects:[{op:'status',id:'drenched',n:2,to:'target'}]},
    {id:'slush_sneeze',name:'Slush Sneeze',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'slush_rush',name:'Slush Rush',flavor:['clobber'],power:1.2,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'slow',n:1,to:'target'}]}
  ]};
B3_FOES.conehead={id:'conehead',name:'Cone Head',ch:'bonus',role:'hexer',row:'back',hp:194,atk:42,def:25,spd:107,pips:0,
  peeves:['sizzle','racket'],resists:[],start:[],mechanics:[],drop:null,
  acts:[
    {id:'waffle_poke',name:'Waffle Poke',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'mint_chip_drip',name:'Mint-Chip Drip',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',n:2,to:'target'}]},
    {id:'scoop_pass',name:'Scoop Pass',flavor:['support'],power:0,recovery:100,hits:'self',tags:['buff'],when:{allyHurt:true},
      effects:[{op:'heal',pct:.2,to:'lowestOtherAlly'},{op:'status',id:'scoop_pass',to:'lowestOtherAlly'}]}
  ]};
// Brain Freeze, the bonus boss. Frosted Lid (Guard Stance plus +15% Def) goes up once below half HP, just before Deep Freeze; Panic Boil! pops it.
B3_FOES.brainfreeze={id:'brainfreeze',name:'Brain Freeze',ch:'bonus',role:'boss',row:'front',hp:930,hp4:1250,atk:55,def:32,spd:104,pips:6,
  peeves:['sizzle','razzle'],resists:['drench'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'frost_breath',name:'Frost Breath',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'cold_shoulder',name:'Cold Shoulder',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'frosted_lid',name:'Frosted Lid',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],when:{hpBelow:.5,once:true},effects:[{op:'status',id:'frosted_lid',to:'self'}]},
    {id:'ice_cube_pitch',name:'Ice-Cube Pitch',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'status',id:'stun',n:1,to:'target'}]},
    {id:'temple_throb',name:'Temple Throb',flavor:['clobber'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'fatigue',n:2,to:'target'}]},
    {id:'deep_freeze',name:'Deep Freeze',flavor:['drench'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'drenched',n:2,to:'target'},{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
// Formations (bestiary section 4). vp: 10 for each normal fight, 30 for the boss (bestiary section 5).
B3_FORMATIONS.gremlin={id:'gremlin',ch:'bonus',foes:[{id:'gremlin',row:'front'},{id:'gremlin',row:'front'},{id:'gremlin',row:'front'}],vp:10};
B3_FORMATIONS.conehead={id:'conehead',ch:'bonus',foes:[{id:'gremlin',row:'front'},{id:'conehead',row:'back'},{id:'conehead',row:'back'}],vp:10};
B3_FORMATIONS.slushslug={id:'slushslug',ch:'bonus',foes:[{id:'slushslug',row:'front'},{id:'conehead',row:'back'}],vp:10};
B3_FORMATIONS.brainfreeze={id:'brainfreeze',ch:'bonus',foes:[{id:'brainfreeze',row:'front'}],vp:30};
