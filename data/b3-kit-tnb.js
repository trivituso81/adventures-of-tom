'use strict';
// data/b3-kit-tnb.js — Battle 3 kit: TNB (spec section 3.7). Built: all of Ceramicist and all of Longboarder (stage 9b).
// Same shape as the other kit files (see the top of data/b3-kit-tom.js). TNB is the first family member to join after chapter 1
// (chapter 2 on); his Vibe Points start from the late joiners' pool (`late:true` on his cast row; engine/b3-progress.js, stage 9c).
// Six lines needed their own rule (engine/b3-custom.js): Wet Clay to Stoneware, Three-AM Kiln Firing (the firing half), Grand Amphora
// Masterpiece, Kintsugi Gold Seam, Waymo Tailgate Rescue (the rebalance half) and Baxter Hill Longboard Express (the doubling half).
B3_CAST.tnb={id:'tnb',name:'TNB',vibes:['tnb_potter','tnb_boarder','tnb_scream'],late:true,stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- Ceramicist (first Sig Vibe) ----------------------------------------------------------------
B3_VIBES.tnb_potter={id:'tnb_potter',owner:'tnb',name:'Ceramicist',sig:1,lean:'support',
  subtitles:['Pinch-Pot Dabbler','Spring-Street Wheel Thrower','Master of Kintsugi'],
  trait:'wet_clay_to_stoneware',basic:'wheel_thrown_lump',skills:['center_the_bowl','three_am_kiln_firing','grand_amphora_masterpiece'],
  quirks:['coaster_policy','kintsugi_gold_seam'],counter:null};
// Wet Clay to Stoneware (one-off `wetClay`, engine/b3-custom.js): a "clay shield" is a shield made by one of TNB's Ceramicist Skills (the
// shield op's `clay:true`). While this Trait is on, a clay shield soaks `soak` more Clobber damage than its size (20%), and a Sizzle hit
// on whoever wears it fires it into Fired Glaze, which throws `reflect` of what it soaks (30%) back at the attacker. Three-AM Kiln Firing
// fires every clay shield on the family whether or not the Trait is on.
B3_TRAITS.wet_clay_to_stoneware={id:'wet_clay_to_stoneware',vibe:'tnb_potter',name:'Wet Clay to Stoneware',
  custom:'wetClay',n:{soak:.20,reflect:.30},
  desc:'The clay shields TNB makes soak 20% more Clobber damage. When Sizzle touches one, it is fired into Fired Glaze, which throws 30% of what it soaks back at the attacker.'};
B3_SKILLS.wheel_thrown_lump={id:'wheel_thrown_lump',vibe:'tnb_potter',slot:'basic',name:'Wheel-Thrown Lump',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'wet_clay',to:'target'}],line:null,
  short:'Light hit. Slows the monster down for 2 turns.',
  desc:'Light Clobber hit with a lump of wet clay. The monster is 10% slower for 2 turns.'};
// Center the Bowl: the spec's "30% Max HP clay carapace" is a clay shield of 30% of the target's Max HP (the Support Lean makes it bigger);
// it clears Toasty and Bleed. Any family member can be picked, TNB too (my call).
B3_SKILLS.center_the_bowl={id:'center_the_bowl',vibe:'tnb_potter',slot:'s1',name:'Center the Bowl',pep:3,flavor:['support'],power:0,hits:0,
  target:'family',tags:[],composure:0,effects:[{op:'cleanse',ids:['toasty','bleed'],to:'target'},{op:'shield',pct:.30,clay:true,to:'target'}],line:null,
  short:'Clay shield on one family member. Clears Toasty and Bleed.',
  desc:'Puts a pottery wheel under a family member and shapes a clay shield around them worth 30% of their HP. It clears Toasty and Bleed.'};
// Three-AM Kiln Firing: the spec prints no tier for the Sizzle wave, so it is standard at the all-monsters share (my call).
// The firing, the Kiln Glow (+15% Attack, 2 turns) and the wave all land at once; the glow goes on every family member, TNB included.
B3_SKILLS.three_am_kiln_firing={id:'three_am_kiln_firing',vibe:'tnb_potter',slot:'s2',name:'Three-AM Kiln Firing',pep:4,flavor:['sizzle'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'vitrify',to:'allies'},{op:'status',id:'kiln_glow',to:'allies'}],line:null,
  short:'Hits all monsters, leaves them Toasty, family gets stronger.',
  desc:'A standard Sizzle wave hits every monster and leaves them Toasty. It fires every clay shield on the family into Fired Glaze, and the whole family gets 15% more Attack for 2 turns.'};
// Coaster Policy: "shielded allies deal +15% bonus elemental damage". My call: +15% on every hit of any flavor while the family member
// holds any shield (not only TNB's), counted as a damage bonus of its own kind. The mod is given to the whole family at the start of the
// fight (`allyMods`, engine/b3-core.js); `shielded` is the new mod condition (engine/b3-core.js b3ModWhen).
B3_QUIRKS.coaster_policy={id:'coaster_policy',vibe:'tnb_potter',name:'Coaster Policy',
  allyMods:[{stat:'out',kind:'coaster',v:.15,when:{shielded:true}}],
  desc:'Every family member with a shield up deals 15% more damage, TNB too.'};
// Grand Amphora Masterpiece: the vessel is a hazard on the family's floor (B3_HAZARDS.amphora). It soaks the next 2 monster attacks whole
// (engine/b3-custom.js b3VesselTake); the second one it soaks, or the end of its 4th round, breaks it into a heavy Clobber and Razzle wave
// on every monster and 2 Composure pips off each (b3VesselBurst). Deals nothing the turn it is set down.
B3_SKILLS.grand_amphora_masterpiece={id:'grand_amphora_masterpiece',vibe:'tnb_potter',slot:'cap',name:'Grand Amphora Masterpiece',pep:5,flavor:['clobber'],power:0,hits:0,
  target:'field',tags:[],composure:0,effects:[{op:'hazard',id:'amphora'}],line:null,
  short:'A big vase blocks 2 attacks, then smashes every monster.',
  desc:'Sets a towering terracotta vase in front of the family. It soaks the next 2 monster attacks whole, then shatters into a heavy Clobber and Razzle hit on every monster that also knocks 2 Composure pips off each. If nobody attacks it, it shatters by itself when 4 rounds have passed.'};
// Kintsugi Gold Seam: when any family member's shield breaks, TNB mends them 15% of their Max HP and for 1 turn their hits set off
// Razzle Detonations too (the `razzleDet` flag, engine/b3-resolve.js b3FindDetonation). Once per action for each member.
B3_QUIRKS.kintsugi_gold_seam={id:'kintsugi_gold_seam',vibe:'tnb_potter',name:'Kintsugi Gold Seam',
  on:'shieldBroken',tgtAlly:true,limit:'actionTarget',show:true,
  effects:[{op:'heal',pct:.15,to:'target'},{op:'status',id:'gold_seam',to:'target'}],
  desc:'When a family member’s shield breaks, TNB heals them 15% of their HP, and for 1 turn their hits can also set off Razzle Detonations.'};

// ---------------------------------------------------------------- Longboarder (second Sig Vibe) ----------------------------------------------------------------
B3_VIBES.tnb_boarder={id:'tnb_boarder',owner:'tnb',name:'Longboarder',sig:2,lean:'tempo',
  subtitles:['Sidewalk Pusher','Baxter-Hill Bomber','Car-Free Street Legend'],
  trait:'carving_momentum',basic:'longboard_push_and_carve',skills:['e_bike_tag_along','waymo_tailgate_rescue','baxter_hill_longboard_express'],
  quirks:['tap_card_transfer','no_car_no_tickets'],counter:null};
// Carving Momentum: his Basic's wait is 10% shorter (a Recovery mod that only counts for a Basic, `when:{basic:true}`).
B3_TRAITS.carving_momentum={id:'carving_momentum',vibe:'tnb_boarder',name:'Carving Momentum',
  mods:[{stat:'moveRec',kind:'carving',v:-.10,when:{basic:true}}],
  desc:'TNB’s Basic Action leaves him waiting 10% less before his next turn.'};
// Longboard Push & Carve: the spec's "-10% own Recovery Ticks" is a Base Recovery of 72 instead of 80 (the Skill field `rec`);
// Carving Momentum takes another 10% off that. "Scanning stats" is only the picture: nothing reads a "seen" flag yet (Olivia, stage 10).
B3_SKILLS.longboard_push_and_carve={id:'longboard_push_and_carve',vibe:'tnb_boarder',slot:'basic',name:'Longboard Push & Carve',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,rec:72,effects:[{op:'damage'}],line:null,
  short:'Light hit. TNB’s next turn comes a little sooner.',
  desc:'Light Clobber hit as TNB cruises past on the longboard. He waits 10% less than after any other Basic.'};
// E-Bike Tag-Along: Fresh Ride and the e-bike each last the common 2 turns (the spec gives the buff 2t and Fresh Ride no length: my call).
// The spec's +15% (v11) is for Speed, Attack and Defense together.
B3_SKILLS.e_bike_tag_along={id:'e_bike_tag_along',vibe:'tnb_boarder',slot:'s1',name:'E-Bike Tag-Along',pep:2,flavor:['support'],power:0,hits:0,
  target:'family',tags:[],composure:0,effects:[{op:'cleanse',to:'target'},{op:'status',id:'fresh_ride',to:'target'},{op:'status',id:'e_bike',to:'target'}],line:null,
  short:'Powers up one family member and clears their bad effects.',
  desc:'Unlocks a rental e-bike for a family member. It clears their debuffs, blocks the next debuff for 2 turns, and gives 15% more Speed, Attack and Defense for 2 turns.'};
// Waymo Tailgate Rescue: a standard Razzle flash on every monster (no tier in the spec: my call) that also blinds each one. Picked on a
// knocked-out family member it brings them back at 40% of their HP; picked on anyone else it is a safe HP rebalance (b3Rebalance).
B3_SKILLS.waymo_tailgate_rescue={id:'waymo_tailgate_rescue',vibe:'tnb_boarder',slot:'s2',name:'Waymo Tailgate Rescue',pep:4,flavor:['razzle'],power:0,hits:0,
  target:'family_or_ko',tags:[],composure:0,
  effects:[{op:'damage',flavor:['razzle'],power:'standard',aoe:true,to:'foes'},{op:'status',id:'blind',to:'foes'},{op:'revive',hp:.40,to:'target'},{op:'rebalance',to:'target',when:'notRevived'}],
  line:null,
  short:'Hits and blinds every monster, and helps one family member.',
  desc:'A self-driving SUV spins its lidar: a standard Razzle flash hits every monster and blinds each one (its next single-target attack misses). Pick a knocked-out family member and the door pops open and they get up with 40% HP. Pick anyone else and the healthiest family member shares HP with them until both have the same share.'};
// TAP-Card Transfer: three small rules in one row. Buffs TNB puts on last 1 more turn (the one-off `tapCard`, applied in b3PutStatus), +10%
// Evasion for TNB, and at the start of his turn (once a round) the slowest other family member is pulled 15 ticks up the bar (my call:
// the spec says only "pull slowest ally 15% forward"; "slowest" is the lowest Speed stat).
B3_QUIRKS.tap_card_transfer={id:'tap_card_transfer',vibe:'tnb_boarder',name:'TAP-Card Transfer',
  custom:'tapCard',n:{extend:1},mods:[{stat:'eva',kind:'tap',v:.10}],
  on:'turnStart',carrier:'source',limit:'round',show:true,effects:[{op:'pull',n:15,to:'slowestAlly'}],
  desc:'The buffs TNB gives last 1 turn longer, he dodges 10% more attacks, and at the start of his turn the slowest family member moves 15 ticks up the turn bar.'};
// Baxter Hill Longboard Express: a heavy Razzle wave on every monster at the all-monsters share (the tier is my call, the same as the other
// 5 Pep Capstones), then every E-Bike buff on the family is doubled and set to last 2 turns (b3DoubleBuff), then +20% Family Ruckus.
B3_SKILLS.baxter_hill_longboard_express={id:'baxter_hill_longboard_express',vibe:'tnb_boarder',slot:'cap',name:'Baxter Hill Longboard Express',pep:5,flavor:['razzle'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'double',id:'e_bike',n:2,to:'allies'},{op:'ruckus',n:20}],line:null,
  short:'Heavy hit on every monster. Leaves them Dazzled.',
  desc:'TNB bombs down Baxter Street next to a Metro train: a heavy Razzle hit on every monster that leaves them Dazzled. Every E-Bike buff on the family is doubled and lasts 2 turns, and the Family Ruckus gauge jumps 20%.'};
// No Car, No Tickets: Slow never lands on TNB, and the first time his hit sets off a Dazzled Detonation on a monster, that monster's
// Defense is cut 10% for the rest of the fight (once per monster).
B3_QUIRKS.no_car_no_tickets={id:'no_car_no_tickets',vibe:'tnb_boarder',name:'No Car, No Tickets',
  immune:['slow'],on:'detonation',carrier:'source',ids:['shatter_glitz','sensory_overload'],show:true,
  effects:[{op:'crack',n:.10,once:'noCar',to:'target'}],
  desc:'TNB cannot be Slowed. The first time he sets off a Dazzled Detonation on a monster, its Defense is cut 10% for the rest of the fight.'};

// ---------------------------------------------------------------- Scream King (third Vibe, stage 19; sig 0) ----------------------------------------------------------------
B3_VIBES.tnb_scream={id:'tnb_scream',owner:'tnb',name:'Scream King',sig:0,lean:'striker',
  subtitles:['Popcorn Tosser','Slasher Scholar','Untouchable Final Boy'],
  trait:'dont_look_behind_you',basic:'flashlight_under_chin',skills:['flying_popcorn_jump_scare','dont_go_in_the_basement','act_three_mask_reveal'],
  quirks:['forty_seven_rewatches','sequel_hook'],counter:null};
// "Don't Look Behind You": my call for "Racket-debuffed or slower": a monster that carries any debuff or mark, or is slower than TNB (`tgtWeak`).
B3_TRAITS.dont_look_behind_you={id:'dont_look_behind_you',vibe:'tnb_scream',name:'"Don\u2019t Look Behind You"',
  mods:[{stat:'out',kind:'behind',v:.30,when:{tgtWeak:true}}],
  on:'afterHit',carrier:'source',tgtFoe:true,tgtWeak:true,limit:'actionTarget',show:true,effects:[{op:'composure',n:1,to:'target'}],
  desc:'TNB hits a monster 30% harder, and takes 1 more Composure pip, if it carries a debuff or is slower than he is.'};
B3_SKILLS.flashlight_under_chin={id:'flashlight_under_chin',vibe:'tnb_scream',slot:'basic',name:'Flashlight Under Chin',pep:0,flavor:['razzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,
  short:'Light Razzle hit. Leaves it Dazzled.',
  desc:'Spooky campfire uplighting: a light Razzle hit that leaves the monster Dazzled.'};
B3_SKILLS.flying_popcorn_jump_scare={id:'flying_popcorn_jump_scare',vibe:'tnb_scream',slot:'s1',name:'Flying Popcorn Jump-Scare',pep:3,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'spooked',to:'target'}],line:null,
  short:'Light hit. Spooks it: weaker next hit, crits on it.',
  desc:'Light Racket hit with a horror sting. The monster is Spooked: its next hit misses 30% more and does 30% less, and a faster or Airborne family member always crits it.'};
B3_SKILLS.dont_go_in_the_basement={id:'dont_go_in_the_basement',vibe:'tnb_scream',slot:'s2',name:'"Don\u2019t Go In The Basement!"',pep:4,flavor:['racket'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'pull',n:20,to:'nextAlly'}],line:null,
  short:'Standard hit on all. Pulls the next ally up 20.',
  desc:'VHS static and a slamming cellar door: a standard Racket hit on every monster, and the next family member due to act moves 20 ticks up the turn bar.'};
// Act-Three Mask Reveal: one heavy Racket hit (my call: the spec says "ambush" and a multiplier, so it is a single-target hit), 1.5 times as strong on a monster with 2 or more debuffs.
B3_SKILLS.act_three_mask_reveal={id:'act_three_mask_reveal',vibe:'tnb_scream',slot:'cap',name:'Act-Three Mask Reveal',pep:6,flavor:['racket'],power:'heavy',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetDebuffs',min:2,add:.5}}],line:null,
  short:'Heavy hit, 1.5 times as strong on 2+ debuffs.',
  desc:'The lights die and purple fog floods the stage: a heavy Racket hit that does 50% more to a monster carrying 2 or more debuffs.'};
B3_QUIRKS.forty_seven_rewatches={id:'forty_seven_rewatches',vibe:'tnb_scream',name:'Forty-Seven Rewatches',
  mods:[{stat:'eva',kind:'rewatch',v:.20,when:{attackerDebuffed:true}}],
  desc:'TNB knows every trope: 20% more Evasion against a monster that carries a debuff.'};
// Sequel Hook: a KO or a Composure Break by TNB refunds 2 Pep, once a round between the two.
B3_QUIRKS.sequel_hook={id:'sequel_hook',vibe:'tnb_scream',name:'Sequel Hook',
  listen:[{on:'ko',carrier:'source',tgtFoe:true,limit:'round',limitKey:'sequel',show:true,effects:[{op:'pep',n:2,to:'self'}]},
    {on:'break',carrier:'source',limit:'round',limitKey:'sequel',show:true,effects:[{op:'pep',n:2,to:'self'}]}],
  desc:'When TNB knocks out a monster or Breaks its Composure he gets 2 Pep back (once a round).'};
