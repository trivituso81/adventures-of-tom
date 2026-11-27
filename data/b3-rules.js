'use strict';
// data/b3-rules.js — Battle 3 (the v11 battle system): every rule number from spec sections 1 and 2.
// Design: claude/battle-architecture.md (Project). Spec: claude/battle-spec-v11.md. Bestiary: claude/bestiary-v11.md.
// Data only. To tune the game, change a number here; no engine file needs to change.
// Battle 3 loads beside the old battle engine. Every Battle 3 global starts with B3 or b3.
const B3_RULES={
  // Timeline (spec 2.2). A wait is in ticks. Recovery Ticks = Base Recovery x 100 / Speed.
  round:100,                                  // a round is a 100-tick window; a divider sits at every multiple
  recovery:{basic:80,s1:100,s2:100,cap:120},  // Base Recovery by skill slot
  telegraph:80,                               // an enemy's announce turn (charge_up) uses this Base Recovery (my call: matches Big Glare and Inlet Submerge)
  startWait:{party:50,foe:75},                // opening waits, x 100 / Speed (architecture section 6)
  arrive:100,                                 // a revived family member rejoins the bar waiting this x 100 / Speed (spec 2.1's rule for arriving)
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
  stunBossTicks:30,                           // a Stun on a Boss is a 30-tick push instead of a lost turn (spec 2.8)
  primeTurns:2,
  // Aggro (spec 2.8)
  aggro:{front:100,back:60},
  // Party rows (spec 2.1): the row a family member stands in by default, from their Main Vibe's Lean. At least 1 stands in Front.
  rowByLean:{guard:'front',striker:'front',tempo:'front',support:'back'},
  // Composure (spec 2.7). One action shaves 3 pips at most from one foe (4 for a Full Family Ruckus). At 0 pips the foe is
  // Flustered: it goes behind every unit due inside the next `flusterWindow` ticks and takes `flusteredTaken` more damage.
  composure:{capPerAction:3,capFullRuckus:4,flusteredTaken:.35,peeve:1,flusterWindow:100},
  // Adds (bestiary 1.1): a foe called in mid-fight arrives at this share of its entry's HP, with 0 pips. A side shows 3 in Front and 2 in Back at most.
  add:{hp:.5,room:{front:3,back:2}},
  // Family Ruckus (spec 2.10). Built in stage 6.
  ruckus:{mix:5,detonation:8,extraHit:1,brk:15,doubleTeam:50,full:100,doubleTeamPower:.5},
  // Vibe Mastery (spec section 1; engine/b3-progress.js). rankVp[k] is the VP that reaches Rank k+1; the last one is mastery.
  rankVp:[0,60,220,450,800],
  // The Rank that unlocks each part of a Vibe. The Trait, the Basic and Skill 1 come at Rank 1.
  rankUnlock:{trait:1,basic:1,s1:1,s2:2,quirkA:3,cap:4,quirkB:5},
  subtitleRank:[1,3,5],                       // the Rank at which each of a Vibe's three Subtitles takes over
  pocketVp:.5,                                // the equipped Pocket Vibe earns this share of a fight's VP (the Main Vibe earns all of it)
  quirkSlots:2,
  // Casual Mode, "Freelancer" (spec section 1; engine/b3-progress.js, stage 21): opens when every Vibe of a member is mastered. As Main it gives `pockets` Pocket
  // Vibe slots, all of the member's Traits and a Basic of their choice, with no Lean, and it earns no Vibe Points. It is not a row of B3_VIBES.
  casual:{id:'freelancer',pockets:2,traits:'all',basic:'chosen',lean:null,earnsVp:false},
  labRank:2,                                  // the Rank every Vibe starts at in the Battle Lab (the Rank chapter 1 reaches)
  // Stat Leans (spec section 1): the Main Vibe's Lean only. Max HP is set when the fight begins; the others are mods of kind 'lean'.
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
// Every Detonation consumes the Prime and gives the attacker +1 Pep. `pips` is the Composure it shaves.
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

// What the Vibes screen says about each Lean.
const B3_LEANS={
  guard:{id:'guard',name:'Guard',desc:'15% more Max HP and 15% more Defense'},
  striker:{id:'striker',name:'Striker',desc:'15% more Attack'},
  tempo:{id:'tempo',name:'Tempo',desc:'15% more Speed'},
  support:{id:'support',name:'Support',desc:'heals and shields given are 15% bigger'}
};

// Filled by the kit files (data/b3-kit-*.js), the status file and the enemy files (data/b3-foes-*.js).
// B3_SOON holds the NAMES of Skills a Vibe row lists whose own rows are not written yet ({id: name}): the Vibes screen shows
// them greyed. A Skill is in B3_SKILLS or in B3_SOON, never both: the kit stage that writes the row deletes the name here.
const B3_CAST={},B3_VIBES={},B3_SKILLS={},B3_SOON={},B3_TRAITS={},B3_QUIRKS={},B3_FOES={},B3_FORMATIONS={};

// Pick-Me-Up (spec 2.9): every family member has this command in every Vibe. It shows in SKILLS while someone is knocked out.
B3_SKILLS.pick_me_up={id:'pick_me_up',vibe:null,common:true,slot:'s1',name:'Pick-Me-Up',pep:B3_RULES.pickMeUp.pep,flavor:['support'],power:0,hits:0,
  target:'ko_ally',tags:[],composure:0,effects:[{op:'revive',hp:B3_RULES.pickMeUp.hp}],line:null,
  short:'Gets a knocked-out family member back on their feet.',
  desc:'Gets a knocked-out family member back on their feet with a quarter of their HP.'};
