'use strict';
// data/b3-kit-justin.js — Battle 3 kit: Justin (spec section 3.9). Built: all of Basement Boss and all of Live Wire (stage 10).
// Armchair Ref, his third Vibe, is stage 19 to 21. Same shape as the other kit files (see the top of data/b3-kit-tom.js).
// His Main Vibe on joining is Basement Boss, his Pocket Vibe Live Wire (spec: "Sig: Basement Boss + Live Wire").
// One line needed its own function: Demo-Day Prybar (`prybar`, engine/b3-custom.js). Every number the spec leaves out is a call,
// written where it is made and listed in claude/battle-build.md "Calls made that Tom has not confirmed".
B3_CAST.justin={id:'justin',name:'Justin',vibes:['justin_basement','justin_wire'],stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- Basement Boss (first Sig Vibe) ----------------------------------------------------------------
B3_VIBES.justin_basement={id:'justin_basement',owner:'justin',name:'Basement Boss',sig:1,lean:'guard',
  subtitles:['Stud Finder','Drywall Pro','Master Gut-Renovator'],
  trait:'load_bearing_swing',basic:'stud_finder_beep_and_knock',skills:['demo_day_prybar','hang_fresh_drywall','dropped_screw_toolbox_punt'],
  quirks:['measure_twice_cut_once','store_bought_bread_peace_offering'],counter:null};
// Load-Bearing Swing: a Clobber move leaves him waiting 15% longer (the `skillFlavor` condition on a Recovery mod), and once a round a
// Clobber hit on a monster that is shielded, or whose Defense is at least his own, knocks 1 extra pip off it (my call: "high-Def" is
// "Defense at least as high as his own base Defense", so it still means something in chapter 20; `tgtGuarded`, engine/b3-hooks.js).
B3_TRAITS.load_bearing_swing={id:'load_bearing_swing',vibe:'justin_basement',name:'Load-Bearing Swing',
  mods:[{stat:'moveRec',kind:'swing',v:.15,when:{skillFlavor:'clobber'}}],
  on:'afterHit',carrier:'source',flavor:'clobber',tgtGuarded:true,limit:'round',show:true,effects:[{op:'composure',n:1,to:'target'}],
  desc:'Justin waits 15% longer after a Clobber move. Once a round, a Clobber hit on a shielded monster, or one with at least his Defense, knocks 1 extra Composure pip off it.'};
B3_SKILLS.stud_finder_beep_and_knock={id:'stud_finder_beep_and_knock',vibe:'justin_basement',slot:'basic',name:'Stud-Finder Beep & Knock',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'knocked_loose',to:'target'}],line:null,anim:{kind:'default',shape:'strike'},
  short:'Light hit. Clobber hits do more to it for 1 turn.',
  desc:'Light Clobber hit with a beeping stud finder. For 1 turn the monster takes 15% more damage from Clobber hits.'};
// Demo-Day Prybar: a standard Clobber hit that first rips every shield and Guard Stance off the monster (so nothing soaks or softens it), then
// blasts the broken barrier's value at the monsters standing next to it as Clobber splash. A shield's value is what it had left; a Guard
// Stance's is 25% of the damage the hit did. With no barrier it is a plain standard hit. Broken shields set off "shield broken" listeners.
B3_SKILLS.demo_day_prybar={id:'demo_day_prybar',vibe:'justin_basement',slot:'s1',name:'Demo-Day Prybar',pep:3,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'prybar'}],line:null,anim:{kind:'default',shape:'strike'},
  short:'Rips off its shields, then hits it and the ones beside it.',
  desc:'A standard Clobber hit that rips every shield and Guard Stance off the monster first. What they were worth blasts into the monsters next to it as Clobber splash.'};
// Hang Fresh Drywall: the 2 family members next to Justin each get a wall that halves the next 2 melee or thrown hits aimed at them
// (the status field `hits`, engine/b3-resolve.js b3WearDown). It lasts at most 3 turns if nobody tests it (my call).
B3_SKILLS.hang_fresh_drywall={id:'hang_fresh_drywall',vibe:'justin_basement',slot:'s2',name:'Hang Fresh Drywall',pep:4,flavor:['support'],power:0,hits:0,
  target:'adjacent_allies',tags:[],composure:0,effects:[{op:'status',id:'drywall',to:'target'}],line:null,anim:{kind:'default',shape:'give'},
  short:'A wall halves the next 2 hits on the family beside Justin.',
  desc:'Justin screws up a wall in front of the 2 family members next to him. It cuts the next 2 melee or thrown hits on each of them in half.'};
// Measure Twice, Cut Once: a turn spent on a Support Skill (no damage) squares up his aim: his next Clobber or Razzle hit is a sure crit.
B3_QUIRKS.measure_twice_cut_once={id:'measure_twice_cut_once',vibe:'justin_basement',name:'Measure Twice, Cut Once',
  on:'actionEnd',carrier:'source',supportTurn:true,show:true,effects:[{op:'status',id:'squared_up',to:'self'}],
  desc:'After Justin spends a turn on a Support Skill, his next Clobber or Razzle hit is a sure crit.'};
// Dropped-Screw Toolbox Punt: a capstone Clobber hit on one monster, doubled (+100%, the outgoing cap) if it is Flustered (the spec says "huge
// multiplier": my call), then 15% of its base Defense is cracked for the rest of the fight, once per monster.
B3_SKILLS.dropped_screw_toolbox_punt={id:'dropped_screw_toolbox_punt',vibe:'justin_basement',slot:'cap',name:'Dropped-Screw Toolbox Punt',pep:6,flavor:['clobber'],power:'capstone',hits:1,
  target:'foe',tags:[],composure:0,
  effects:[{op:'damage',bonus:{if:'targetHas',ids:['flustered'],add:1}},{op:'crack',n:.15,once:'toolbox',to:'target'}],line:null,anim:{kind:'default',shape:'strike'},
  short:'Huge hit. Double damage on a Flustered monster.',
  desc:'A tiny screw lands on his foot, he hops on one leg, and the 80-pound toolbox flies: a capstone Clobber hit that does double damage to a Flustered monster. It cracks 15% of the monster’s Defense for the rest of the fight, once per monster.'};
// Store-Bought Bread Peace Offering: any shield breaking, a family member's or a monster's, gives Justin 20% more Attack for 2 turns and 1 Pep,
// once a round.
B3_QUIRKS.store_bought_bread_peace_offering={id:'store_bought_bread_peace_offering',vibe:'justin_basement',name:'Store-Bought Bread Peace Offering',
  on:'shieldBroken',limit:'round',show:true,effects:[{op:'status',id:'bread_peace',to:'self'},{op:'pep',n:1,to:'self'}],
  desc:'When any shield breaks, on the family or on a monster, Justin gets 20% more Attack for 2 turns and 1 Pep. Once a round.'};

// ---------------------------------------------------------------- Live Wire (second Sig Vibe) ----------------------------------------------------------------
B3_VIBES.justin_wire={id:'justin_wire',owner:'justin',name:'Live Wire',sig:2,lean:'striker',
  subtitles:['Flashlight Holder','Copper-Banner Pro','High-Voltage Grid Wizard'],
  trait:'live_circuit',basic:'voltage_tester_poke',skills:['dont_touch_the_copper_banner','main_breaker_flip','flashlight_block_rewire'],
  quirks:['rubber_soled_workboots','rare_heart_emoji_text'],counter:null};
// Live Circuit: a monster Justin hits while it is Dazzled or Drenched becomes Wired for 2 turns (the Prime the hit itself set off counts). A hit
// on a monster that was already Wired arcs 30% of the damage the action did to it, as Razzle, to every other monster (once per action
// for each monster). The arc is listed first so a monster that becomes Wired on this hit does not arc yet.
B3_TRAITS.live_circuit={id:'live_circuit',vibe:'justin_wire',name:'Live Circuit',
  listen:[{on:'afterHit',carrier:'source',tgtHasStatus:'wired',limit:'actionTarget',show:true,effects:[{op:'splash',flavor:'razzle',share:.30,of:'dealt',to:'otherFoes'}]},
    {on:'afterHit',carrier:'source',tgtPrimeAny:['dazzled','drenched'],limit:'actionTarget',effects:[{op:'status',id:'wired',to:'target'}]}],
  desc:'A Dazzled or Drenched monster that Justin hits becomes Wired for 2 turns. Hitting a Wired monster arcs 30% of the damage to every other monster as Razzle.'};
B3_SKILLS.voltage_tester_poke={id:'voltage_tester_poke',vibe:'justin_wire',slot:'basic',name:'Voltage-Tester Poke',pep:0,flavor:['razzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,anim:{kind:'default',shape:'strike'},
  short:'Light hit. Leaves the monster Dazzled.',
  desc:'Light Razzle hit with a pocket voltage tester. It leaves the monster Dazzled.'};
// "Don't Touch the Copper!" Banner: a light Razzle hit (my call, as for the Four-Tab Binder) and a copper banner strung between the monster and
// the one standing next to it (the lower slot, if both sides have one) for 2 monster turns. Once a round, when either loses Composure the other
// loses 1 pip too (`limit:'roundAll'`: the banner as a whole, not each monster).
B3_SKILLS.dont_touch_the_copper_banner={id:'dont_touch_the_copper_banner',vibe:'justin_wire',slot:'s1',name:'“Don’t Touch the Copper!” Banner',pep:3,flavor:['razzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,
  effects:[{op:'damage'},{op:'status',id:'copper_link',to:'target'},{op:'status',id:'copper_link',to:'targetNeighbor'}],line:null,anim:{kind:'default',shape:'cast'},
  short:'Light hit. Links two monsters to lose Composure together.',
  desc:'A light Razzle hit, and a light-up copper banner strung between the monster and the one next to it for 2 turns. Once a round, when one of them loses Composure, the other loses 1 pip too.'};
// Main Breaker Flip: a heavy Razzle hit that cancels a wound-up act (the `interrupt` op) and blacks the monster out for 1 turn: its counter acts
// (its passives) do not answer. Composure: 1 pip printed; the Pet Peeve pip and a Detonation's own pips add to it as for every Skill (cap 3).
B3_SKILLS.main_breaker_flip={id:'main_breaker_flip',vibe:'justin_wire',slot:'s2',name:'Main Breaker Flip',pep:4,flavor:['razzle'],power:'heavy',hits:1,
  target:'foe',tags:[],composure:1,effects:[{op:'damage'},{op:'interrupt',to:'target'},{op:'status',id:'blackout',to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  short:'Heavy hit. Stops its wind-up and knocks 1 Composure off.',
  desc:'A heavy Razzle hit and a blackout. The monster loses an attack it was winding up, and for 1 turn its counter attacks cannot answer. Knocks 1 Composure pip off.'};
// Rubber-Soled Workboots: 30% less damage from Razzle and from Sizzle hits, and a Short Circuit! that Justin sets off gives him 1 more Pep.
B3_QUIRKS.rubber_soled_workboots={id:'rubber_soled_workboots',vibe:'justin_wire',name:'Rubber-Soled Workboots',
  mods:[{stat:'reduce',kind:'boots',v:.30,when:{flavor:'razzle'}},{stat:'reduce',kind:'boots',v:.30,when:{flavor:'sizzle'}}],
  on:'detonation',carrier:'source',ids:['short_circuit'],show:true,effects:[{op:'pep',n:1,to:'self'}],
  desc:'Justin takes 30% less damage from Razzle and Sizzle hits. A Short Circuit! he sets off gives him 1 more Pep.'};
// Flashlight Block Rewire: a capstone Razzle hit on one monster, then 75% of what it did arcs to every other monster that is Wired or Drenched.
B3_SKILLS.flashlight_block_rewire={id:'flashlight_block_rewire',vibe:'justin_wire',slot:'cap',name:'Flashlight Block Rewire',pep:6,flavor:['razzle'],power:'capstone',hits:1,
  target:'foe',tags:[],composure:0,
  effects:[{op:'damage'},{op:'splash',flavor:'razzle',share:.75,of:'dealt',to:'otherFoesLive'}],line:null,anim:{kind:'default',shape:'cast'},
  short:'Huge hit that jumps to every Wired or Drenched monster.',
  desc:'Flashlight in his teeth, Justin cross-wires the transformer: a capstone Razzle hit that chains 75% of its damage to every other monster that is Wired or Drenched.'};
// Rare Heart-Emoji Text: when a hit of Justin's Breaks a monster or knocks one out, he stores a Static Charge: 40% more damage on his Razzle
// hits through his next turn.
B3_QUIRKS.rare_heart_emoji_text={id:'rare_heart_emoji_text',vibe:'justin_wire',name:'Rare Heart-Emoji Text',
  listen:[{on:'break',carrier:'source',show:true,effects:[{op:'status',id:'static_charge',to:'self'}]},
    {on:'ko',carrier:'source',tgtFoe:true,show:true,effects:[{op:'status',id:'static_charge',to:'self'}]}],
  desc:'When Justin Breaks or knocks out a monster, he stores a Static Charge: his Razzle hits do 40% more damage through his next turn.'};
