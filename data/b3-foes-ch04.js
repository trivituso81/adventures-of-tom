'use strict';
// data/b3-foes-ch04.js — Battle 3 enemies: chapter 4, Sunset Gold Studios backlot, Los Angeles (bestiary v11 section 2).
// Numbers are the bestiary's printed numbers. The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 4's party is three (Tom, TNB, Nara), so the director prints his HP for 3 and `hp4` for four.
// New in this file: `to:'randomOtherAlly'` (one other monster, by the fight's dice), `to:'otherAllies'` (every other monster),
// `pull` with `next:true` on the foe that is acting (it takes the ticks off the wait this very turn sets), and `stopByIntercept`
// on an act: when Tom's Suite Door Slide steps in, the act's riders (the stun and the push) do not land.
B3_FOES.extra={id:'extra',name:'Extra Extra',ch:4,role:'swarmer',row:'front',hp:124,atk:32,def:20,spd:105,pips:0,
  peeves:['racket','razzle'],resists:[],start:[],mechanics:[],drop:'callsheet',
  acts:[
    {id:'holding_sigh',name:'Holding Sigh',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:1,to:'target'}]},
    {id:'crowd_elbow',name:'Crowd Elbow',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'walk_into_shot',name:'Walk Into Shot',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]}
  ]};
B3_FOES.boommoth={id:'boommoth',name:'Boom Mic Moth',ch:4,role:'hexer',row:'back',hp:162,atk:36,def:23,spd:105,pips:0,
  peeves:['drench','clobber'],resists:['racket'],start:['rafter_hover'],mechanics:[],drop:'windsock',
  acts:[
    {id:'dead_cat_swoop',name:'Dead-Cat Swoop',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'mic_feedback',name:'Mic Feedback',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'skill_lock',n:1,to:'target'}]},
    {id:'boom_drop',name:'Boom Drop',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]}
  ]};
// Clapper Snapper opens the fight with Scene One, Marker! (a `once` act is the first thing a foe does), then rotates its other two.
B3_FOES.clapper={id:'clapper',name:'Clapper Snapper',ch:4,role:'skirmisher',row:'front',hp:152,atk:40,def:21,spd:120,pips:0,
  peeves:['sizzle','razzle'],resists:[],start:[],mechanics:[],drop:'slate',
  acts:[
    {id:'slate_snap',name:'Slate Snap',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'chalk_smack',name:'Chalk Smack',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'scene_one',name:'Scene One, Marker!',flavor:['racket'],power:1.05,recovery:120,hits:'all',tags:['aoe'],when:{once:true},
      effects:[{op:'pull',n:15,to:'randomOtherAlly'}]}
  ]};
B3_FOES.fogwisp={id:'fogwisp',name:'Fog Wisp',ch:4,role:'hexer',row:'back',hp:162,atk:36,def:23,spd:105,pips:0,
  peeves:['sizzle','clobber'],resists:['drench'],start:['stage_mist'],mechanics:[],drop:'fogjuice',
  acts:[
    {id:'damp_chill',name:'Damp Chill',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'fog_bank',name:'Fog Bank',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'pea_souper',name:'Pea Souper',flavor:['drench'],power:1.05,recovery:120,hits:'all',tags:['aoe','charge_up'],
      effects:[{op:'status',id:'drenched',to:'target'},{op:'status',id:'blind',n:1,to:'randomFoe'}]}
  ]};
// Cue Card Crab, the chapter's Elite: 4 Composure pips, shrugs off Clobber, starts behind its Posterboard Shell.
B3_FOES.cuecrab={id:'cuecrab',name:'Cue Card Crab',ch:4,role:'elite',row:'front',hp:342,atk:44,def:31,spd:90,pips:4,
  peeves:['drench','racket'],resists:['clobber'],start:['posterboard_shell'],mechanics:[],drop:'cuecards',
  acts:[
    {id:'claw_pinch',name:'Claw Pinch',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'flat_line_reading',name:'Flat Line Reading',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',to:'target'}]},
    {id:'card_toss',name:'Card Toss',flavor:['clobber'],power:1.15,recovery:120,hits:'all',tags:['projectile','aoe','charge_up'],effects:[{op:'status',id:'bleed',to:'target'}]}
  ]};
// The Director's Cut, the chapter 4 boss. ACTION! once at 60% HP: calls up to 2 Extra Extras (half HP, no pips), pulls every monster
// 25 ticks forward and gives every monster +15% Speed (2 turns, a buff the party can strip or steal). CUT! is a charged megaphone
// blast: Stun (1t) and a 40-tick push. It misses a Blinded Director (the Blind is checked when it fires), a Break or an interrupt
// cancels it, and Tom's Suite Door Slide takes it: Tom takes the blast and the stun and the push do not land (`stopByIntercept`).
B3_FOES.directorscut={id:'directorscut',name:'The Director’s Cut',ch:4,role:'boss',row:'front',hp:470,hp4:630,atk:48,def:29,spd:102,pips:6,
  peeves:['razzle','sizzle'],resists:['racket'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'studio_notes',name:'Studio Notes',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'studio_notes',to:'target'}]},
    {id:'script_smack',name:'Script Smack',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'action',name:'ACTION!',flavor:['support'],power:0,recovery:80,hits:'foes',tags:['buff'],when:{once:true,hpBelow:.6},
      effects:[{op:'summon',id:'extra',row:'front',n:2},{op:'pull',n:25,to:'allies',next:true},{op:'status',id:'action_speed',to:'allies'}]},
    {id:'cut',name:'CUT!',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],stopByIntercept:true,
      effects:[{op:'status',id:'stun',n:1,to:'target'},{op:'push',n:40,to:'target'}]},
    {id:'thats_a_wrap',name:'That’s a Wrap!',flavor:['clobber'],power:1.3,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formations (bestiary section 4). vp: 8 for each normal fight (the chapter has eight), 26 for the boss (bestiary section 5).
B3_FORMATIONS.extra={id:'extra',ch:4,foes:[{id:'extra',row:'front'},{id:'extra',row:'front'},{id:'extra',row:'front'}],vp:8};
B3_FORMATIONS.boommoth={id:'boommoth',ch:4,foes:[{id:'extra',row:'front'},{id:'boommoth',row:'back'}],vp:8};
B3_FORMATIONS.clapper={id:'clapper',ch:4,foes:[{id:'clapper',row:'front'},{id:'extra',row:'front'}],vp:8};
B3_FORMATIONS.fogwisp={id:'fogwisp',ch:4,foes:[{id:'extra',row:'front'},{id:'fogwisp',row:'back'}],vp:8};
B3_FORMATIONS.cuecrab={id:'cuecrab',ch:4,foes:[{id:'cuecrab',row:'front'},{id:'boommoth',row:'back'}],vp:8};
B3_FORMATIONS.directorscut={id:'directorscut',ch:4,foes:[{id:'directorscut',row:'front'}],vp:26};
