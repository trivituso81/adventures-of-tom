'use strict';
// data/b3-foes-ch05.js — Battle 3 enemies: chapter 5, the school, Long Island (bestiary v11 section 2).
// Numbers are the bestiary's printed numbers. The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 5's party is four (Tom, Grace, Rose, Amy), so The Red Pen prints its HP for 4 and `hp3` for three.
// New in this file: act field `starts:'act id'` (Strict Grading's first use starts the every-3rd-turn count of the repeat, so the stance
// comes back 3 turns after it was last raised), a counter act with `when:{has:'strict_grading'}` (Points Off only answers while the stance
// stands), the Mental status SEE ME (`foeTaunt`), and Strict Grading's own end: a Mix (`on:{mix}` on the status) as well as a Break or a stance strip.
B3_FOES.popquiz={id:'popquiz',name:'Pop Quiz',ch:5,role:'swarmer',row:'front',hp:148,atk:37,def:22,spd:107,pips:0,
  peeves:['racket','sizzle'],resists:[],start:[],mechanics:[],drop:'quizsheet',
  acts:[
    {id:'paper_cut',name:'Paper Cut',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',to:'target'}]},
    {id:'trick_question',name:'Trick Question',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'trick_question',to:'target'}]},
    {id:'pencils_down',name:'Pencils Down!',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'pep',n:-1,to:'target'},{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.tardybell={id:'tardybell',name:'Tardy Bell',ch:5,role:'hexer',row:'back',hp:194,atk:42,def:25,spd:107,pips:0,
  peeves:['drench','racket'],resists:['clobber'],start:[],mechanics:[],drop:'hallpass',
  acts:[
    {id:'brass_clapper',name:'Brass Clapper',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'youre_late',name:'You’re Late!',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'slow',to:'target'},{op:'push',n:15,to:'target'}]},
    {id:'first_bell_ring',name:'First-Bell Ring',flavor:['racket'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.glitterglue={id:'glitterglue',name:'Glitter Glue',ch:5,role:'hexer',row:'back',hp:194,atk:42,def:25,spd:107,pips:0,
  peeves:['drench','clobber'],resists:['razzle'],start:[],mechanics:[],drop:'gluestick',
  acts:[
    {id:'nozzle_squirt',name:'Nozzle Squirt',flavor:['drench'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'paste_down',name:'Paste Down',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['ground_sweep'],effects:[{op:'status',id:'slow',to:'target'}]},
    {id:'glitter_burst',name:'Glitter Burst',flavor:['razzle'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'blind',n:1,to:'randomFoe'}]}
  ]};
// Dodgeball Dread, the chapter's Elite: 4 Composure pips, shrugs off Clobber, starts bouncing (+20% Evasion).
B3_FOES.dodgeball={id:'dodgeball',name:'Dodgeball Dread',ch:5,role:'elite',row:'front',hp:410,atk:51,def:35,spd:92,pips:4,
  peeves:['racket','drench'],resists:['clobber'],start:['gym_bounce'],mechanics:[],drop:'dodgeitem',
  acts:[
    {id:'rubber_bank_shot',name:'Rubber Bank-Shot',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'picked_last',name:'Picked Last',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'picked_last',to:'target'}]},
    {id:'gym_wall_ricochet',name:'Gym-Wall Ricochet',flavor:['clobber'],power:1.2,recovery:120,hits:'all',tags:['projectile','aoe','charge_up'],effects:[]}
  ]};
// The Red Pen, the chapter 5 boss. Strict Grading: a counter stance (30% less damage taken for 2 turns) first raised when it drops to
// 55% HP, then every 3rd turn after. While it stands, any hit on The Red Pen is answered by Points Off (once per ally action). A Mix
// (two family members, two flavors, one round), Rose's Whoopee-Cushion Trap, Panic Boil! or a Break ends it. Final Grade (below 50% HP)
// is a party-wide act, so Amy's Classroom Lights-Out Reset (`noAoe`) stops it.
B3_FOES.redpen={id:'redpen',name:'The Red Pen',ch:5,role:'boss',row:'front',hp:900,hp3:680,atk:55,def:32,spd:104,pips:6,
  peeves:['drench','razzle'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'margin_note',name:'Margin Note',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'margin_note',to:'target'}]},
    {id:'red_ink_slash',name:'Red Ink Slash',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['melee','ground_sweep'],effects:[{op:'status',id:'drenched',to:'target'}]},
    {id:'see_me',name:'SEE ME',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'status',id:'see_me',to:'target'},{op:'status',id:'fatigue',to:'target'}]},
    {id:'strict_grading_first',name:'Strict Grading',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance'],when:{once:true,hpBelow:.55},starts:'strict_grading',
      effects:[{op:'status',id:'strict_grading',to:'self'}]},
    {id:'strict_grading',name:'Strict Grading',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance'],when:{hpBelow:.55,everyTurn:3,lacks:'strict_grading'},
      effects:[{op:'status',id:'strict_grading',to:'self'}]},
    {id:'points_off',name:'Points Off',flavor:['racket'],power:.8,recovery:0,hits:'attacker',tags:['projectile'],when:{has:'strict_grading'},
      effects:[{op:'status',id:'points_off',to:'attacker'}]},
    {id:'final_grade',name:'Final Grade',flavor:['racket'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formations (bestiary section 4). vp: 12 for each normal fight (the chapter has five, one of them the Elite), 30 for the boss (bestiary section 5).
B3_FORMATIONS.popquiz={id:'popquiz',ch:5,foes:[{id:'popquiz',row:'front'},{id:'popquiz',row:'front'}],vp:12};
B3_FORMATIONS.tardybell={id:'tardybell',ch:5,foes:[{id:'popquiz',row:'front'},{id:'tardybell',row:'back'}],vp:12};
B3_FORMATIONS.glitterglue={id:'glitterglue',ch:5,foes:[{id:'popquiz',row:'front'},{id:'glitterglue',row:'back'}],vp:12};
B3_FORMATIONS.dodgeball={id:'dodgeball',ch:5,foes:[{id:'dodgeball',row:'front'},{id:'tardybell',row:'back'}],vp:12};
B3_FORMATIONS.redpen={id:'redpen',ch:5,foes:[{id:'redpen',row:'front'}],vp:30};
