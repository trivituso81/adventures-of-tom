'use strict';
// data/b3-rules.js — Battle 3 (the v11 battle system): every rule number from spec sections 1 and 2.
// Design: claude/battle-architecture.md (Project). Spec: claude/battle-spec-v11.md. Bestiary: claude/bestiary-v11.md.
// Data only. To tune the game, change a number here; no engine file needs to change.
// Battle 3 loads beside battle 2 (engine/battle2*.js). Every Battle 3 global starts with B3 or b3.
const B3_RULES={
  // Timeline (spec 2.2). A wait is in ticks. Recovery Ticks = Base Recovery x 100 / Speed.
  round:100,                                  // a round is a 100-tick window; a divider sits at every multiple
  recovery:{basic:80,s1:100,s2:100,cap:120},  // Base Recovery by skill slot
  telegraph:80,                               // an enemy's announce turn (charge_up) uses this Base Recovery (my call: matches Big Glare and Inlet Submerge)
  startWait:{party:50,foe:75},                // opening waits, x 100 / Speed (architecture section 6)
  forecast:100,                               // the turn bar counts every future action as this Recovery
  halving:.5,                                 // each further push (or pull) on the same unit inside one round
  grantedPerRound:1,
  // Pep (spec 2.3)
  pep:{min:0,max:10,start:4,basic:2,refundCap:3,costFloor:1,detonation:1,intercept:1},
  // Damage (spec 2.4). Damage = Attack x Skill Power x 100 / (100 + Defense) x modifiers.
  power:{light:.5,standard:1,heavy:1.6,capstone:2.2},
  aoeShare:.7,                                // a party Skill that hits all foes or a row uses 70% of its tier
  peeve:1.5,resist:.65,
  crit:{rate:.05,dmg:1.5},
  heal:{tiny:.05,small:.10,standard:.20,party:.15},
  caps:{outBonus:1,reduction:.60,evasion:.60,shield:.40,crack:.25},
  shieldTurns:3,
  backRowClobber:.20,                         // Back-row units take this much less single-target Clobber damage
  statusTurns:2,                              // common statuses last 2 turns unless a row says otherwise
  primeTurns:2,
  // Aggro (spec 2.8)
  aggro:{front:100,back:60},
  // Composure (spec 2.7). Built in stage 3; the numbers live here from the start.
  composure:{capPerAction:3,capFullRuckus:4,flusteredTaken:.35},
  // Family Ruckus (spec 2.10). Built in stage 6.
  ruckus:{mix:5,detonation:8,extraHit:1,brk:15,doubleTeam:50,full:100,doubleTeamPower:.5},
  // Vibe Mastery (spec section 1). Built in stage 4.
  rankVp:[0,60,220,450,800],
  leans:{guard:{hp:.15,def:.15},striker:{atk:.15},tempo:{spd:.15},support:{healGiven:.15}},
  pickMeUp:{pep:4,hp:.25},
  lowHp:.25                                   // the low HP look (battle 2's rule, kept)
};

// The five damage flavors plus Support (spec 2.5). `prime` is the Prime a party hit of that flavor leaves.
const B3_FLAVORS={
  clobber:{id:'clobber',name:'Clobber',prime:null,color:'#f0c27b'},
  sizzle:{id:'sizzle',name:'Sizzle',prime:'toasty',color:'#ff8c5a'},
  drench:{id:'drench',name:'Drench',prime:'drenched',color:'#7cc4f2'},
  razzle:{id:'razzle',name:'Razzle',prime:'dazzled',color:'#ffe27a'},
  racket:{id:'racket',name:'Racket',prime:null,color:'#d7a4f5'},
  support:{id:'support',name:'Support',prime:null,color:'#8fe3a6'}
};

// The six Detonations (spec 2.6). A row matches when the foe holds `prime` and a hit of `flavor` arrives.
// Every Detonation consumes the Prime and gives the attacker +1 Pep. `pips` is the Composure it shaves (stage 3).
const B3_DETONATIONS=[
  {id:'steam_cloud',name:'Steam Cloud!',prime:'toasty',flavor:'drench',pips:2,effects:[{op:'status',id:'blind'}]},
  {id:'steam_cloud',name:'Steam Cloud!',prime:'drenched',flavor:'sizzle',pips:2,effects:[{op:'status',id:'blind'}]},
  {id:'panic_boil',name:'Panic Boil!',prime:'toasty',flavor:'racket',pips:1,effects:[{op:'strip',kind:'stance'}]},
  {id:'hydro_slip',name:'Hydro-Slip!',prime:'drenched',flavor:'clobber',pips:1,effects:[{op:'push',n:25}]},
  {id:'short_circuit',name:'Short Circuit!',prime:'drenched',flavor:'razzle',pips:2,effects:[{op:'splash',share:.4,flavor:'razzle',to:'adjacent'}]},
  {id:'shatter_glitz',name:'Shatter Glitz!',prime:'dazzled',flavor:'clobber',pips:1,effects:[{op:'strip',kind:'buff',n:1}]},
  {id:'sensory_overload',name:'Sensory Overload!',prime:'dazzled',flavor:'racket',pips:1,effects:[{op:'status',id:'overloaded'}]}
];

// Character Level stat table: one table for everyone (architecture section 6), taken from the player columns of the
// bestiary's chapter baseline (section 1.5). Rows are [level, HP, Attack, Defense, Speed]; levels in between are
// worked out on a straight line, and level 1 continues the first line backwards.
const B3_LEVELS=[
  [2,115,26,16,100],[4,145,31,19,101],[7,190,39,23,102],[9,230,45,26,103],[12,280,53,30,104],
  [14,335,62,34,105],[17,390,71,37,106],[19,445,80,41,107],[22,505,90,45,108],[25,570,102,49,109],
  [27,630,112,52,110],[30,695,124,56,111],[32,755,136,60,112],[35,820,148,63,113],[37,880,162,67,114],
  [40,940,176,70,115],[42,995,190,73,116],[45,1050,205,76,117],[47,1100,220,79,118],[50,1150,235,82,120]
];

// Filled by the kit files (data/b3-kit-*.js), the status file and the enemy files (data/b3-foes-*.js).
const B3_CAST={},B3_VIBES={},B3_SKILLS={},B3_TRAITS={},B3_QUIRKS={},B3_FOES={},B3_FORMATIONS={};
