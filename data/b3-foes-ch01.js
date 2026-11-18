'use strict';
// data/b3-foes-ch01.js — Battle 3 enemies: chapter 1, Grump Hollow (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// Built so far: Mudling, Skeeter Swarm, Pond Grump, Bog Toad and their four formations. Stage 3 adds the Elite (Log Lump) and The Big One.
//   acts   in printed order. power is the printed multiplier, recovery the printed Base Recovery.
//          hits: one (1 ally, picked by aggro), all (all allies), self.
//          when: {everyTurn:N} the act comes up on every Nth of the foe's own turns; {stripped:id} only after that status was stripped.
//          A charge_up act is announced on one turn and fires on the foe's next turn.
//          effects land on each ally the act hits (enemy flavors leave a Prime only where the row says so).
B3_FOES.mudling={id:'mudling',name:'Mudling',ch:1,role:'swarmer',row:'front',hp:60,atk:19,def:12,spd:99,pips:0,
  peeves:['sizzle','racket'],resists:[],start:[],mechanics:[],drop:'mudpie',
  acts:[
    {id:'wobble',name:'Wobble',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'mud_flick',name:'Mud Flick',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'mud_pie',name:'Mud Pie',flavor:['drench'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],when:{everyTurn:3},effects:[{op:'status',id:'drenched',to:'target'}]}
  ]};
B3_FOES.skeeter={id:'skeeter',name:'Skeeter Swarm',ch:1,role:'hexer',row:'back',hp:78,atk:21,def:14,spd:99,pips:0,
  peeves:['drench','racket'],resists:[],start:['jitterflight'],mechanics:[],drop:'honey',
  acts:[
    {id:'darting_bite',name:'Darting Bite',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'buzz_cloud',name:'Buzz Cloud',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{stripped:'jitterflight'},effects:[{op:'status',id:'jitterflight',to:'self'}]},
    {id:'mosquito_whine',name:'Mosquito Whine',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.grump={id:'grump',name:'Pond Grump',ch:1,role:'bruiser',row:'front',hp:106,atk:24,def:16,spd:89,pips:0,
  peeves:['razzle','sizzle'],resists:[],start:[],mechanics:[],drop:'hoodie',
  acts:[
    {id:'puddle_grumble',name:'Puddle Grumble',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'bog_splash',name:'Bog Splash',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'soggy_slap',name:'Soggy Slap',flavor:['drench'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'drenched',to:'target'}]}
  ]};
B3_FOES.toad={id:'toad',name:'Bog Toad',ch:1,role:'bruiser',row:'front',hp:106,atk:24,def:16,spd:89,pips:0,
  peeves:['sizzle','razzle'],resists:['drench'],start:[],mechanics:[],drop:'lilyhat',
  acts:[
    {id:'night_croak',name:'Night Croak',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'body_slam',name:'Body Slam',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'tongue_lash',name:'Tongue Lash',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[]}
  ]};
// Formations (bestiary section 4). Slots run left to right per side; adjacent means neighbouring slots. vp is paid from stage 4 on.
B3_FORMATIONS.mudling={id:'mudling',ch:1,foes:[{id:'mudling',row:'front'},{id:'mudling',row:'front'}],vp:10};
B3_FORMATIONS.skeeter={id:'skeeter',ch:1,foes:[{id:'mudling',row:'front'},{id:'skeeter',row:'back'}],vp:10};
B3_FORMATIONS.grump={id:'grump',ch:1,foes:[{id:'grump',row:'front'},{id:'mudling',row:'front'}],vp:10};
B3_FORMATIONS.toad={id:'toad',ch:1,foes:[{id:'toad',row:'front'},{id:'skeeter',row:'back'}],vp:10};
