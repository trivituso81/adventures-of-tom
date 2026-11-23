'use strict';
// data/b3-foes-ch20.js — Battle 3 foes for stage 22, chapter 20 (the studio again: the Forever Engine). Bestiary entries 84 to 86 (claude/bestiary-v11.md, "Chapter 20: The studio again"):
//   84  Blue Lens and Orange Lens (`bluelens`, `orangelens`)  Special, two lenses the Collector sets in Back for phase 2. They never attack.
//   85  The Collector (`leviathan`)                            Boss, Front, 8 pips, no running. Three phases with phase lines.
//   86  Julian Vance                                          NOT a fight. He never starts a battle, so he has no row here (the built Battle 2 care fight is skipped on Battle 3: data/scenes-ch20.js).
// The foe id stays `leviathan` because the map monster and the boss flag (`battle:leviathan`, `kind:leviathan`) are named for it; the foe NAME is the bestiary's, "The Collector" (the same
// choice chapter 17 made for the Twin Lenses). The built scenes still call it the Chronos-Leviathan, in their own recorded words.
// Numbers are the bestiary's printed numbers (5,140 HP, 3,860 for three). The simulator did not move any (docs/BATTLE3.md "What stage 22 chapter 20 holds").
// The rules this chapter adds (engine/b3-last.js, a few lines in b3-core, b3-resolve, b3-foe, b3-ops, b3-timeline):
//   phases:{lines:[.66,.31]}   three phases; damage past a line is lost, the next phase starts at once (a new phase act first: `when:{phase:2,once:true}`).
//   helperLinks:[{id,reduce,flavors?,untilPhase?}]   the lenses' cuts: Blue halves Sizzle and Razzle, Orange cuts everything by a quarter, both stop in phase 3.
//   op stillFrame / refillPips, `noInterrupt` on an act, `endsFight` on a boss (its helpers go dark when it falls), and `reserve` on the fight (the bench to pick from).
// Helper feedback is the chapter 13 shape: a lens knocked out takes 2 pips and 5% of the Collector's Max HP (a flat amount that stops on a phase line).

// ---------- Blue Lens and Orange Lens (Special, Back, 500 HP, no attack, 0 pips, 0 VP) ----------
B3_FOES.bluelens={id:'bluelens',name:'Blue Lens',ch:20,role:'helper',row:'back',hp:500,atk:0,def:75,spd:115,pips:0,
  peeves:['sizzle','clobber'],resists:['drench','razzle'],start:[],mechanics:[],drop:null,
  acts:[],
  onKo:[{op:'composure',n:2,to:'allyBoss'},{op:'hpLoss',pct:.05,to:'allyBoss'}]};
B3_FOES.orangelens={id:'orangelens',name:'Orange Lens',ch:20,role:'helper',row:'back',hp:500,atk:0,def:75,spd:115,pips:0,
  peeves:['drench','racket'],resists:['sizzle','clobber'],start:[],mechanics:[],drop:null,
  acts:[],
  onKo:[{op:'composure',n:2,to:'allyBoss'},{op:'hpLoss',pct:.05,to:'allyBoss'}]};

// ---------- The Collector (boss, Front, 5,140 HP (3,860 for three), 8 pips, no running) ----------
// Phase 1: Gold Shard, Still Frame, Shutter Blade Snap. Phase 2 (66%): Lens Set first, then Gold Shard, Low Whisper, Shutter Blade Snap. Phase 3 (31%): Countdown first (it refills its 8 pips and counts
// down 200 ticks to The Biggest Picture), then Gold Shard and Shutter Blade Snap. Only a Break stops the count: `noInterrupt` makes an interrupt Skill skip it. Both phase acts are once acts
// (the Countdown does not come back after a Break; the bestiary prints no repeat). The lenses' cuts end in phase 3 ("drops its resistances").
B3_FOES.leviathan={id:'leviathan',name:'The Collector',ch:20,role:'boss',row:'front',hp:5140,hp3:3860,atk:219,def:92,spd:124,pips:8,
  peeves:['sizzle','razzle'],resists:[],start:[],mechanics:[],drop:null,noRun:true,endsFight:true,
  phases:{lines:[.66,.31]},
  helperLinks:[{id:'bluelens',reduce:.5,flavors:['sizzle','razzle'],untilPhase:2},{id:'orangelens',reduce:.25,untilPhase:2}],
  acts:[
    {id:'gold_shard',name:'Gold Shard',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'bleed',n:2,to:'target'}]},
    {id:'still_frame',name:'Still Frame',flavor:['razzle'],power:1,recovery:100,hits:'all',tags:['aoe'],when:{phase:1},effects:[{op:'stillFrame',pep:2,slow:1}]},
    {id:'shutter_blade_snap',name:'Shutter Blade Snap',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','ground_sweep','charge_up'],effects:[{op:'status',id:'shutter_cut',n:2,to:'target'}]},
    {id:'lens_set',name:'Lens Set',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{phase:2,once:true},
      effects:[{op:'summon',id:'bluelens',row:'back',n:1,hp:500},{op:'summon',id:'orangelens',row:'back',n:1,hp:500}]},
    {id:'low_whisper',name:'Low Whisper',flavor:['racket'],power:1.15,recovery:100,hits:'all',tags:['aoe'],when:{phase:2},effects:[{op:'status',id:'fatigue',n:1,to:'target'}]},
    {id:'countdown',name:'Countdown',flavor:['support'],power:0,recovery:200,hits:'self',tags:['charge_up'],when:{phase:3,once:true},then:'the_biggest_picture',effects:[{op:'refillPips',to:'self'}]},
    {id:'the_biggest_picture',name:'The Biggest Picture',flavor:['razzle'],power:3,recovery:120,hits:'all',tags:['aoe','charge_up'],after:'countdown',noInterrupt:true,
      effects:[{op:'pep',n:-3,to:'target'},{op:'status',id:'slow',n:2,to:'target'}]}
  ]};

// ---------- Formations ----------
// The one fight is the Collector alone; its lenses come in at phase 2. Vibe Points are the chapter's 90 (bestiary section 5: the boss 90, nothing else).
B3_FORMATIONS.leviathan={id:'leviathan',ch:20,foes:[{id:'leviathan',row:'front'}],vp:90,repick:true};

// Art stand-ins (page only; the simulator has no MONSTERS). The Collector is drawn from the built Chronos-Leviathan row (`MONSTERS.leviathan`). The lenses are new: each is one lens of the Twin
// Lenses' gantry on a stand, cold for the Blue Lens and amber for the Orange Lens, until the Art Library makes their sheets.
if(typeof MONSTERS!=='undefined'&&typeof p2Canvas==='function'&&MONSTERS.twinlens) {
  const mk=(blue)=>{ const c=p2Canvas(44,52),[R,A,B]=blue?['n','c','C']:['e','a','A'];
    c.ell(22,49,18,3,'b');
    c.rect(18,40,8,9,'k'); c.rect(18,40,8,1,'K'); c.rect(12,47,20,3,'y'); c.rect(12,47,20,1,'Y');
    c.rect(20,0,4,8,'k'); c.rect(20,0,2,8,'K');
    c.ell(22,22,19,19,'k'); c.ell(22,22,18,18,'y'); c.ell(22,22,15.6,15.6,'d'); c.ell(22,22,14,14,R); c.ell(22,22,12,12,A); c.ell(22,22,7,7,B);
    c.ell(22,22,4.4,4.8,'t'); c.ell(21,21,1.4,1.6,'w'); c.ell(16,14,4,2.4,B); c.set(15,13,'w');
    for(let i=0;i<8;i++) { const a=i*Math.PI/4+.4; c.line(22+Math.cos(a)*14,22+Math.sin(a)*14,22+Math.cos(a)*18,22+Math.sin(a)*18,'k'); }
    c.outline('o'); return c.rows(); };
  const def=(id,name,blue)=>Object.assign({},MONSTERS.twinlens,{id,name,the:'the '+name,short:name,sprite:mk(blue),scale:3,eyes:[[22,22]],mouth:[22,36],rank:'SPECIAL',
    intro:'A lens on a brass stand sets itself in the back of the room and turns to look at you.'});
  if(!MONSTERS.bluelens) MONSTERS.bluelens=def('bluelens','Blue Lens',true);
  if(!MONSTERS.orangelens) MONSTERS.orangelens=def('orangelens','Orange Lens',false);
}
