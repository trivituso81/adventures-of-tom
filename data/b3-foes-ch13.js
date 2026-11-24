'use strict';
// data/b3-foes-ch13.js — Battle 3 enemies: chapter 13, the tunnel under the dome and the dent in the dome wall (bestiary v11 section 2, "Chapter 13").
// Numbers are the bestiary's printed numbers, except where a line below says a number was changed from the simulator.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// What is here: Hushling, Signal Fault and Turnstile Grump (the tunnel's regulars; the last two are Elites), the Wired Relay Hushling (a helper), the
// Dual-Coast Drill Worm (the tunnel's boss), The Gold Knight (the chapter's last fight) and the formations. Chapter 13's party is four (Tom, Amy, TNB and
// Nara; Grace and Rose wait at the cab stand), so both bosses print their HP for 4 and `hp3` for three.
//
// Two engine rules are new in this chapter (bestiary 1.1, "Helper links" and "Helper feedback"):
//   helperLink:{id,reduce}  the Drill Worm takes 25% less damage while a Wired Relay Hushling stands on its side. It is an ordinary reduction, so it adds to a
//                           Guard Stance and any other reduction up to the 60% cap (engine/b3-core.js b3FoeUnit and the mod condition `allyStands`).
//   onKo on the helper      when a Wired Relay Hushling is knocked out the feedback takes 2 Composure pips off the Drill Worm and leaves it Dazzled (2 turns). The pips go
//                           into the knocking action's ledger, so they count inside the 3-pip cap (engine/b3-resolve.js). The target `allyBoss` is the Boss on that side.
// The Gold Knight uses `custom:{boppySpeed:{above:.5}}`: the same rule as Boppy's Trait, so above half HP nothing pushes him back on the turn bar (the first tell).
//
// Not in this file: the Part 1 monsters that come back (bestiary section 3). They are SEEN at the end of chapter 13 and FOUGHT in chapter 14, so their Part 2 rows
// belong to chapter 14's card.
B3_FOES.hushling={id:'hushling',name:'Hushling',ch:13,role:'hexer',row:'back',hp:587,atk:104,def:50,spd:119,pips:0,
  peeves:['racket','clobber'],resists:[],start:[],mechanics:[],drop:'pretzels',
  acts:[
    {id:'static_drift',name:'Static Drift',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'tinny_shush',name:'Tinny Shush',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{notSameAllyTurns:2},effects:[{op:'status',id:'skill_lock',n:2,to:'target'}]},
    {id:'dead_channel_hum',name:'Dead-Channel Hum',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'pep',n:-1,to:'target'}]}
  ]};
// Signal Fault, an Elite: 4 Composure pips, and it starts braced behind its Track-Block Arm (Guard Stance, 25% less damage for 2 turns).
B3_FOES.signalfault={id:'signalfault',name:'Signal Fault',ch:13,role:'elite',row:'front',hp:1242,atk:125,def:69,spd:102,pips:4,
  peeves:['drench','clobber'],resists:[],start:['track_block_arm'],mechanics:[],drop:'coldbrew',
  acts:[
    {id:'amber_strobe',name:'Amber Strobe',flavor:['razzle'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'crossing_arm_drop',name:'Crossing-Arm Drop',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'eleven_year_red_light',name:'Eleven-Year Red Light',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'push',n:30,to:'target'},{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
// Turnstile Grump, an Elite: the same shape, braced behind its Locked Tripod.
B3_FOES.turnstile={id:'turnstile',name:'Turnstile Grump',ch:13,role:'elite',row:'front',hp:1242,atk:125,def:69,spd:102,pips:4,
  peeves:['clobber','racket'],resists:[],start:['locked_tripod'],mechanics:[],drop:'prioritytag',
  acts:[
    {id:'hip_clip',name:'Hip Clip',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'three_bar_spin',name:'Three-Bar Spin',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'tap_out',name:'Tap Out!',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'tap_out',to:'target'}]}
  ]};
// The Wired Relay Hushling (bestiary entry 68): a Hushling wired to the Drill Worm, with its own printed HP (400), 0 pips and 0 VP. It uses the Hushling's acts. While it
// stands the Drill Worm takes 25% less damage (the Worm's `helperLink`). Knocked out, the feedback takes 2 pips off the Worm and leaves it Dazzled for 2 turns.
B3_FOES.relayhushling={id:'relayhushling',name:'Wired Relay Hushling',ch:13,role:'helper',row:'back',hp:400,atk:104,def:60,spd:115,pips:0,
  peeves:['racket','clobber'],resists:[],start:[],mechanics:[],drop:null,
  acts:[
    {id:'static_drift',name:'Static Drift',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},
    {id:'tinny_shush',name:'Tinny Shush',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{notSameAllyTurns:2},effects:[{op:'status',id:'skill_lock',n:2,to:'target'}]},
    {id:'dead_channel_hum',name:'Dead-Channel Hum',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'pep',n:-1,to:'target'}]}
  ],
  onKo:[{op:'composure',n:2,to:'allyBoss'},{op:'status',id:'dazzled',n:2,to:'allyBoss'}]};
// The Dual-Coast Drill Worm, the tunnel's boss (7 pips, resists Drench). It starts with one Wired Relay Hushling (the formation) and calls one more, once, at 50% HP
// (Relay Call). Tunnel Friction Spark leaves the Worm itself Toasty for 1 turn, which a Racket hit turns into Panic Boil!. Below half HP Full Bore Cave-In.
B3_FOES.drillworm={id:'drillworm',name:'Dual-Coast Drill Worm',ch:13,role:'boss',row:'front',hp:2070,hp3:1550,atk:136,def:63,spd:115,pips:7,
  peeves:['racket','clobber'],resists:['drench'],start:[],mechanics:[],drop:null,noRun:true,
  helperLink:{id:'relayhushling',reduce:.25},
  acts:[
    {id:'bit_grind',name:'Bit Grind',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',n:2,to:'target'}]},
    {id:'tunnel_friction_spark',name:'Tunnel Friction Spark',flavor:['sizzle'],power:1,recovery:100,hits:'two_random',tags:['projectile'],
      effects:[{op:'status',id:'toasty',n:2,to:'target'},{op:'status',id:'toasty',n:1,to:'self'}]},
    {id:'gravel_spray',name:'Gravel Spray',flavor:['clobber'],power:1.05,recovery:100,hits:'all',tags:['projectile','aoe'],effects:[]},
    {id:'deep_bore',name:'Deep Bore',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'deep_bore',to:'target'}]},
    {id:'relay_call',name:'Relay Call',flavor:['support'],power:0,recovery:80,hits:'field',tags:['buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'summon',id:'relayhushling',row:'back',n:1,hp:400}]},
    {id:'full_bore_cave_in',name:'Full Bore Cave-In',flavor:['clobber'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// The Gold Knight (bestiary entry 70), the chapter's last fight, at the dent in the dome wall. He never speaks, uses no weapon, and every act is a silent version of
// something Boppy does (chapter 14 uses the same seven motions under their real names). Nobody Rushes Him: `boppySpeed` above half HP. He resists Clobber, and
// Sizzle and Racket are his Pet Peeves: Visor Heat leaves him Toasty, so a Racket hit sets off Panic Boil! and drops Gold Guard. Wide Arms grows 2, 3, then everyone.
// At 0 HP he drops to one knee and the coin falls out of his chest plate; the armor does not break (what follows is a scene, not battle).
B3_FOES.goldknight={id:'goldknight',name:'The Gold Knight',ch:13,role:'boss',row:'front',hp:2480,hp3:1860,atk:136,def:63,spd:102,pips:7,
  peeves:['sizzle','racket'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  custom:{boppySpeed:{above:.5}},
  acts:[
    {id:'raised_palm',name:'Raised Palm',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'raised_palm',to:'target'}]},
    {id:'slow_walk',name:'Slow Walk',flavor:['clobber'],power:1,recovery:100,hits:'fastest',tags:['melee'],effects:[{op:'status',id:'slow',n:2,to:'target'},{op:'push',n:20,to:'target'}]},
    {id:'wide_arms',name:'Wide Arms',flavor:['clobber'],power:1,recovery:100,hits:'two_adjacent',grow:[2,3,'all'],tags:['melee'],effects:[]},
    {id:'visor_heat',name:'Visor Heat',flavor:['sizzle'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],
      effects:[{op:'status',id:'toasty',n:2,to:'target'},{op:'status',id:'toasty',n:2,to:'self'}]},
    {id:'stand_still',name:'Stand Still',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],effects:[{op:'status',id:'gold_guard',to:'self'},{op:'status',id:'mend',n:2,to:'self'}]},
    {id:'gold_squeeze',name:'Gold Squeeze',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]},
    {id:'helmet_hum',name:'Helmet Hum',flavor:['racket'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'slow',n:2,to:'target'},{op:'status',id:'fatigue',n:2,to:'target'}]}
  ]};
// Formations (bestiary section 4). vp: 7 for each normal fight (the chapter has six, every one with an Elite), 18 for the Drill Worm and 30 for the Gold Knight
// (bestiary section 5: 6 x 7 + 18 + 30 = 90). `hushling` and `turnstile` are the tunnel's two map monsters that name the same fight, as in chapter 11.
B3_FORMATIONS.hushling={id:'hushling',ch:13,foes:[{id:'turnstile',row:'front'},{id:'hushling',row:'back'}],vp:7};
B3_FORMATIONS.turnstile={id:'turnstile',ch:13,foes:[{id:'turnstile',row:'front'},{id:'hushling',row:'back'}],vp:7};
B3_FORMATIONS.signalfault={id:'signalfault',ch:13,foes:[{id:'signalfault',row:'front'},{id:'hushling',row:'back'}],vp:7};
B3_FORMATIONS.drillworm={id:'drillworm',ch:13,foes:[{id:'drillworm',row:'front'},{id:'relayhushling',row:'back'}],vp:18};
B3_FORMATIONS.goldknight={id:'goldknight',ch:13,foes:[{id:'goldknight',row:'front'}],vp:30};

// Art stand-ins (page only; the simulator has no MONSTERS). Battle 3 draws a foe from its monster row (`btBattleDef(MONSTERS[f.id])`, engine/b3-play.js), and the
// Wired Relay Hushling and the Gold Knight are new, so they have none. Until the Art Library makes their sheets (bestiary section 6: the Hushling with its wire, the helmet-closed
// armor) they are drawn with the Hushling's and Warden Boppy's rows, under their own names. A real row of the same id (`MONSTERS.relayhushling`) replaces the stand-in.
if(typeof MONSTERS!=='undefined') {
  if(!MONSTERS.relayhushling&&MONSTERS.hushling) MONSTERS.relayhushling=Object.assign({},MONSTERS.hushling,{id:'relayhushling',name:'Wired Relay Hushling',the:'the Wired Relay Hushling',short:'Relay Hushling'});
  if(!MONSTERS.goldknight&&MONSTERS.warden) MONSTERS.goldknight=Object.assign({},MONSTERS.warden,{id:'goldknight',name:'The Gold Knight',the:'The Gold Knight',short:'Gold Knight'});
}
