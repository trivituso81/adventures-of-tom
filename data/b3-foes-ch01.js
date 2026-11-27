'use strict';
// data/b3-foes-ch01.js — Battle 3 enemies: chapter 1, Grump Hollow (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// All of chapter 1 is here: Mudling, Skeeter Swarm, Pond Grump, Bog Toad, Log Lump (Elite), The Big One (boss) and the six formations.
//   pips   Composure pips (Elites and Bosses). hp3 / hp4: the boss's HP when the party has 3 or 4 members and `hp` is for the other size.
//   acts   in printed order. power is the printed multiplier, recovery the printed Base Recovery (0 = fires at once, does not move the foe).
//          hits: one (1 ally, picked by aggro), all (all allies), self, marked (the ally this foe Marked), attacker (a counter act:
//                it answers an ally's action that hit this foe, once per action), two_random, front_back (1 Front and 1 Back ally, for the `tradeRows` op), two_adjacent (with grow:[2,3,'all']
//                the number rises with each use), fastest (the fastest ally), foes (every monster), field (nobody: it calls an add).
//          aim:  'back' = a `one` act looks at Back-row allies first.
//          when: every condition listed must hold. everyTurn:N (every Nth of its own turns, counted again after it fires),
//                everyRound:N (at every Nth round divider), waitRounds:N (N dividers must pass before it is picked again),
//                once:true (one time in the fight), hpBelow / hpAbove (share of Max HP), stripped:id (only after that status was
//                stripped), has:id / lacks:id (a status it carries), notSameAllyTurns:N (not at the same ally again for N turns).
//          which video plays an act, and the clip held while it is wound up, are the act's spec (data/moves/act-<monster>-<act>.json, wind-<monster>-<act>.json; engine/b3-spec.js)
//          then: 'act id' = this act IS the wind-up: it lands now and the named act fires on the foe's next turn.
//          after:'act id' = only ever fires as that wind-up's follow-up, never from the list.
//          A charge_up act with no `then` is announced on one turn and fires on the foe's next turn.
//          effects land on each ally the act hits (enemy flavors leave a Prime only where the row says so). {op:'mark'} Marks the
//          act's target for the follow-up (bestiary 1.1: not a status, cannot be cleansed, ends when the follow-up fires or is cancelled).
// The order a foe picks in is at the top of engine/b3-foe.js.
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
// Log Lump, the chapter's Elite: 4 Composure pips, one Pet Peeve, and it starts braced.
B3_FOES.log={id:'log',name:'Log Lump',ch:1,role:'elite',row:'front',hp:166,atk:25,def:19,spd:85,pips:4,
  peeves:['sizzle'],resists:[],start:['mossy_brace'],mechanics:[],drop:'barkslab',
  acts:[
    {id:'low_roll',name:'Low Roll',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'branch_jab',name:'Branch Jab',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'timber',name:'Timber!',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'slow',to:'target'}]}
  ]};
// The Big One, the chapter 1 boss. Big Glare is the wind-up of Swamp Chomp: it lands now, Marks its target, and the bite comes on
// its next turn (Tom's Suite Door Slide can take the bite, Grace's Crunchy Sugar-Cube Pop or a Break cancels it).
// Below half HP it puts the Muffin-Tin Crown back on once, and winds up Muddy Belly-Flop every 3rd turn.
B3_FOES.bigone={id:'bigone',name:'The Big One',ch:1,role:'boss',row:'front',hp:610,hp3:460,atk:28,def:17,spd:96,pips:6,
  peeves:['razzle','racket'],resists:[],start:['muffin_crown'],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'big_glare',name:'Big Glare',flavor:['racket'],power:.8,recovery:80,hits:'one',aim:'back',tags:['projectile','charge_up'],then:'swamp_chomp',effects:[{op:'mark'}]},
    {id:'tail_slap',name:'Tail Slap',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'swamp_chomp',name:'Swamp Chomp',flavor:['clobber'],power:1.5,recovery:120,hits:'marked',tags:['melee','charge_up'],after:'big_glare',effects:[]},
    {id:'muddy_belly_flop',name:'Muddy Belly-Flop',flavor:['drench'],power:1.2,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5,everyTurn:3},effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'crown_polish',name:'Crown Polish',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{hpBelow:.5,once:true},effects:[{op:'status',id:'muffin_crown',to:'self'}]}
  ]};
// Formations (bestiary section 4). Slots run left to right per side; adjacent means neighbouring slots. vp is paid from stage 4 on.
B3_FORMATIONS.mudling={id:'mudling',ch:1,foes:[{id:'mudling',row:'front'},{id:'mudling',row:'front'}],vp:10};
B3_FORMATIONS.skeeter={id:'skeeter',ch:1,foes:[{id:'mudling',row:'front'},{id:'skeeter',row:'back'}],vp:10};
B3_FORMATIONS.grump={id:'grump',ch:1,foes:[{id:'grump',row:'front'},{id:'mudling',row:'front'}],vp:10};
B3_FORMATIONS.toad={id:'toad',ch:1,foes:[{id:'toad',row:'front'},{id:'skeeter',row:'back'}],vp:10};
B3_FORMATIONS.log={id:'log',ch:1,foes:[{id:'log',row:'front'},{id:'skeeter',row:'back'}],vp:10};
B3_FORMATIONS.bigone={id:'bigone',ch:1,foes:[{id:'bigone',row:'front'}],vp:30};
