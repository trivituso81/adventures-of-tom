'use strict';
// data/b3-kit-nara.js — Battle 3 kit: Nara (spec section 3.8). Built: Attached Pup and Guard Dog (stage 9c). Picky Princess, her third Vibe, is stage 19 (sig 0).
// Same shape as the other kit files (see the top of data/b3-kit-tom.js). Nara joins in chapter 2: her Vibe Points start from the late joiners'
// pool (engine/b3-progress.js b3NewLoadout), and her Main Vibe is Attached Pup, her Pocket Vibe Guard Dog.
// Four lines needed their own rule: Locked On the Gold Ball (the memory is `b3GoldBall`, engine/b3-custom.js, and the My Toy mark is a status row),
// Sandbox Clue Digger (`b3Treasure`), Nervous Vibrations (`nervous`, engine/b3-core.js b3Evasion) and Pressed Against Your Shins (`shins`,
// engine/b3-core.js b3Stat). Every number the spec leaves out is a call, written where it is made.
B3_CAST.nara={id:'nara',name:'Nara',vibes:['nara_pup','nara_guard','nara_princess'],late:true,stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- Attached Pup (first Sig Vibe) ----------------------------------------------------------------
B3_VIBES.nara_pup={id:'nara_pup',owner:'nara',name:'Attached Pup',sig:1,lean:'tempo',
  subtitles:['Porch-Step Waiter','Vacuum Survivor','Stage-Five Clinger'],
  trait:'nervous_vibrations',basic:'startled_water_bowl_flip',skills:['jittery_shake_it_off','vacuum_cleaner_bolt','dont_leave_me_meltdown'],
  quirks:['where_are_you_going','pressed_against_your_shins'],counter:null};
// Nervous Vibrations: +3% Evasion for every Pep she is holding, up to +30%, and half of that against an attack that hits the whole family
// (`nervous`, engine/b3-core.js b3Evasion). It is read every time a monster's hit is rolled, so it follows her Pep as it rises and falls.
B3_TRAITS.nervous_vibrations={id:'nervous_vibrations',vibe:'nara_pup',name:'Nervous Vibrations',
  custom:'nervous',n:{per:.03,max:.30,wide:.5},
  desc:'Nara dodges 3% more attacks for every Pep she is holding, up to 30%. Against an attack that hits the whole family it is half as much.'};
// Startled Water-Bowl Flip: the spec says "front-row Drench". My call: one light Drench hit on one monster, aimed like any other Basic (Drench has no
// Back-row discount, so the row does not change it).
B3_SKILLS.startled_water_bowl_flip={id:'startled_water_bowl_flip',vibe:'nara_pup',slot:'basic',name:'Startled Water-Bowl Flip',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,
  short:'Light hit. Leaves the monster Drenched.',
  desc:'Light Drench hit when Nara jumps at a noise and flips her water bowl. The monster is Drenched.'};
// Jittery Shake-It-Off: the spec's "AoE Drenched" is the Drenched Prime on every monster with no damage (the ops list says so); it clears Nara's
// debuffs and gives her +25% Evasion for 1 turn.
B3_SKILLS.jittery_shake_it_off={id:'jittery_shake_it_off',vibe:'nara_pup',slot:'s1',name:'Jittery Shake-It-Off',pep:3,flavor:['drench'],power:0,hits:0,
  target:'all_foes',tags:[],composure:0,effects:[{op:'status',id:'drenched',to:'foes'},{op:'cleanse',to:'self'},{op:'status',id:'jitter_shake',to:'self'}],line:null,
  short:'Drenches every monster. Nara dodges more for 1 turn.',
  desc:'A full-body nervous shake sprays every monster: they are all Drenched. It clears Nara’s debuffs, and she dodges 25% more attacks for 1 turn.'};
// Vacuum-Cleaner Bolt!: a light Clobber hit on one row of monsters (a row hits like an AoE, at 70%: the tier is my call), kicked debris cuts their
// accuracy 20% for 2 turns, and Nara hides behind Tom's legs: 50% less damage from an attack on the whole family for 1 turn. "Tom's legs" is the
// picture: it works whoever is in the family.
B3_SKILLS.vacuum_cleaner_bolt={id:'vacuum_cleaner_bolt',vibe:'nara_pup',slot:'s2',name:'Vacuum-Cleaner Bolt!',pep:3,flavor:['clobber'],power:'light',hits:1,
  target:'foe_row',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'debris',to:'target'},{op:'status',id:'behind_legs',to:'self'}],line:null,
  short:'Light hit on a row of monsters, then Nara hides behind Tom.',
  desc:'Nara spots the vacuum and bolts, kicking debris at a row of monsters: a light Clobber hit on each, and each misses 20% more for 2 turns. Then she hides behind Tom’s legs and takes 50% less damage from an attack on the whole family for 1 turn.'};
// "Where Are You Going?!": when a monster's attack misses her, she darts to the family's side: +1 Pep for her and that monster is Drenched.
B3_QUIRKS.where_are_you_going={id:'where_are_you_going',vibe:'nara_pup',name:'“Where Are You Going?!”',
  on:'dodge',carrier:'target',limit:'round',show:true,effects:[{op:'pep',n:1,to:'self'},{op:'status',id:'drenched',to:'attacker'}],
  desc:'When Nara dodges an attack she darts to her human’s side: she gets 1 Pep and the monster is Drenched (once a round).'};
// "Don't Leave Me!" Meltdown: a heavy Drench and Racket hit on every monster at the all-monsters share (the tier is my call, like the other 5 Pep
// Capstones), and it sets off every Toasty and Dazzled on them in turn (the Skill field `detonatesAll`, engine/b3-resolve.js b3Hit: the Drench part
// sets off Toasty as Steam Cloud!, the Racket part sets off Dazzled as Sensory Overload!, and a Drenched or second Prime goes the same way).
B3_SKILLS.dont_leave_me_meltdown={id:'dont_leave_me_meltdown',vibe:'nara_pup',slot:'cap',name:'“Don’t Leave Me!” Meltdown',pep:5,flavor:['drench','racket'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,detonatesAll:true,effects:[{op:'damage'}],line:null,
  short:'Heavy hit on every monster. Sets off Toasty and Dazzled.',
  desc:'A 9 AM front-door howl and frantic circles: a heavy Drench and Racket hit on every monster. It sets off every Toasty and Dazzled on them at once.'};
// Pressed Against Your Shins: her Attack also grows by half of the Speed bonuses she wears (`shins`, engine/b3-core.js b3Stat). The bonuses counted
// are the positive Speed mods of her statuses and Quirks (an E-Bike, a NeeDoh squeeze), not her Lean, and a Slow does not take any away.
B3_QUIRKS.pressed_against_your_shins={id:'pressed_against_your_shins',vibe:'nara_pup',name:'Pressed Against Your Shins',
  custom:'shins',n:{share:.5},
  desc:'Nara clings tight. Half of any Speed bonus she has is added to her Attack as well.'};

// ---------------------------------------------------------------- Guard Dog (second Sig Vibe) ----------------------------------------------------------------
B3_VIBES.nara_guard={id:'nara_guard',owner:'nara',name:'Guard Dog',sig:2,lean:'striker',
  subtitles:['Window Tree-Growler','Porch Patrol Officer','Alpha Block Guardian'],
  trait:'locked_on_the_gold_ball',basic:'grip_chicken_snap',skills:['relentless_tug_of_war','no_take_only_throw','stunt_double_squirrel_intercept'],
  quirks:['sandbox_clue_digger','forty_pound_counterweight'],counter:null};
// Locked On the Gold Ball: a monster that Nara hits in two of her actions in a row is marked My Toy for 2 of its turns (`goldBall` op, engine/b3-custom.js
// b3GoldBall, run as each of her actions ends). A My Toy monster takes 20% more Clobber damage, from the whole family (my call: the spec says "+20% Clobber"
// and does not say whose), and when it is pushed back on the turn bar Nara gets a free light Clobber chase bite at it, once a round (status My Toy).
B3_TRAITS.locked_on_the_gold_ball={id:'locked_on_the_gold_ball',vibe:'nara_guard',name:'Locked On the Gold Ball',
  on:'actionEnd',carrier:'source',effects:[{op:'goldBall'}],
  desc:'When Nara hits the same monster in two of her turns in a row, it is marked My Toy for 2 turns. It takes 20% more Clobber damage, and when it is pushed back on the turn bar Nara gets a free chase bite.'};
// Grip-Chicken Snap: the spec's "5% HP plain-chicken snack if foe debuffed": she heals 5% of her Max HP when the monster she bit carries a debuff
// (Slow, Stun, Blind, Fatigue, Bleed, Cracked-style debuffs; a Prime alone is not one: my call).
B3_SKILLS.grip_chicken_snap={id:'grip_chicken_snap',vibe:'nara_guard',slot:'basic',name:'Grip-Chicken Snap',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'heal',pct:.05,to:'self',when:'targetDebuffed'}],line:null,
  short:'Quick bite. Heals Nara if the monster has a bad effect.',
  desc:'Quick Clobber bite. If the monster has a debuff on it, Nara gets a plain-chicken snack and heals 5% of her HP.'};
B3_SKILLS.relentless_tug_of_war={id:'relentless_tug_of_war',vibe:'nara_guard',slot:'s1',name:'Relentless Tug-of-War',pep:3,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'tugged',to:'target'},{op:'strip',kind:'stance',to:'target'}],line:null,
  short:'Hit. The monster is weaker for 2 turns.',
  desc:'Nara clamps on and pulls. A standard Clobber hit, the monster has 25% less Attack and Defense for 2 turns, and she yanks it out of any stance.'};
// "No Take, Only Throw!": a standard Clobber hit, then she rips the heaviest buff off the monster and wears it for the turns it had left. If it had
// no buff she could take (none, or the Big One's crown, which is stuck on: `noSteal`), she gets +35% Attack for 2 turns instead.
B3_SKILLS.no_take_only_throw={id:'no_take_only_throw',vibe:'nara_guard',slot:'s2',name:'“No Take, Only Throw!”',pep:3,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'steal',n:1,to:'target'},{op:'status',id:'gold_grip',to:'self',when:'notStolen'}],line:null,
  short:'Hit. Nara steals one of its boosts for herself.',
  desc:'Nara clenches the gold tennis ball in her teeth. A standard Clobber hit, and she rips one buff off the monster to wear herself. If there is no buff to take, she gets 35% more Attack for 2 turns instead.'};
// Sandbox Clue Digger: at the start of every fight, and again when a Boss Breaks, she digs up one treasure (b3Treasure): a Pep Bone (2 Pep for
// whoever has the least), a Squeaky Toy (a light Racket squeak on a random monster) or a Chicken Strip (15% HP for whoever has the least HP left).
B3_QUIRKS.sandbox_clue_digger={id:'sandbox_clue_digger',vibe:'nara_guard',name:'Sandbox Clue Digger',
  listen:[{on:'battleStart',show:true,effects:[{op:'treasure'}]},{on:'break',tgtBoss:true,show:true,effects:[{op:'treasure'}]}],
  desc:'Nara digs up a buried treasure at the start of a fight and whenever a Boss is Broken: a Pep Bone (2 Pep for whoever has the least), a Squeaky Toy (a light Racket squeak on a monster) or a Chicken Strip (15% HP for whoever has the least).'};
// Stunt-Double Squirrel Intercept: three Clobber hits at the capstone tier, shared between the hits (a single target, so it is not discounted as
// a wave), that ignore shields and Evasion (`pierce`), and do 40% more to a My Toy or Flustered monster.
B3_SKILLS.stunt_double_squirrel_intercept={id:'stunt_double_squirrel_intercept',vibe:'nara_guard',slot:'cap',name:'Stunt-Double Squirrel Intercept',pep:6,flavor:['clobber'],power:'capstone',hits:3,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',pierce:true,bonus:{if:'targetHas',ids:['my_toy','flustered'],add:.40}}],line:null,
  short:'Three pounces that go right through shields.',
  desc:'Nara flashes her HORSE STUNT DOUBLE lanyard and pounces three times. The hits ignore shields and Evasion, and do 40% more to a monster that is My Toy or Flustered.'};
// Forty-Pound Counterweight: when another family member hits a My Toy monster, Nara is pulled 15 ticks up the turn bar (once an action).
B3_QUIRKS.forty_pound_counterweight={id:'forty_pound_counterweight',vibe:'nara_guard',name:'Forty-Pound Counterweight',
  on:'afterHit',byAlly:true,tgtFoe:true,targetPrime:'my_toy',limit:'action',show:true,effects:[{op:'pull',n:15,to:'self'}],
  desc:'When a family member hits a My Toy monster, Nara pulls all forty pounds and moves 15 ticks up the turn bar (once per move).'};

// ---- Picky Princess (third Vibe, stage 19; sig 0) ----
B3_VIBES.nara_princess={id:'nara_princess',owner:'nara',name:'Picky Princess',sig:0,lean:'support',
  subtitles:['Bowl Snubber','Plate Bandit','Forbidden Couch Royalty'],
  trait:'high_standards_trait',basic:'unimpressed_sniff',skills:['weaponized_puppy_eyes','only_off_your_plate','eighth_chair_pie_crust_decree'],
  quirks:['belly_rub_tax','allowed_on_the_couch'],counter:null};
// High Standards: a family member who heals Nara or buffs her gets 1 Pep and 15% more Crit Rate for 2 turns (my call: a Nara who heals or buffs herself does not count).
B3_TRAITS.high_standards_trait={id:'high_standards_trait',vibe:'nara_princess',name:'High Standards',
  listen:[{on:'healed',carrier:'target',byAlly:true,limit:'action',show:true,effects:[{op:'pep',n:1,to:'attacker'},{op:'status',id:'high_standards',to:'attacker'}]},
    {on:'statusApplied',carrier:'target',byAlly:true,kinds:['buff'],limit:'action',limitKey:'hsb',show:true,effects:[{op:'pep',n:1,to:'attacker'},{op:'status',id:'high_standards',to:'attacker'}]}],
  desc:'A family member who heals or buffs Nara gets 1 Pep and 15% more Crit Rate for 2 turns.'};
B3_SKILLS.unimpressed_sniff={id:'unimpressed_sniff',vibe:'nara_princess',slot:'basic',name:'Unimpressed Sniff',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'snubbed',to:'target'}],line:null,
  short:'Light hit. Its next hit does 20% less.',
  desc:'Light Racket hit. Nara sniffs the monster like cold kibble and looks away: its next hit does 20% less damage.'};
B3_SKILLS.weaponized_puppy_eyes={id:'weaponized_puppy_eyes',vibe:'nara_princess',slot:'s1',name:'Weaponized Puppy Eyes',pep:3,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,
  effects:[{op:'damage'},{op:'status',id:'puppy_eyes',to:'target'},{op:'composure',n:1,to:'target',when:'targetBuffed'},{op:'composure',n:1,to:'target',when:'peeveHit'}],line:null,
  short:'Light hit. It will not aim at Nara and hits weaker.',
  desc:'Light Racket hit. For its next turn the monster will not aim at Nara and does 35% less damage. 1 Composure pip off a monster with a buff, 1 more on a Pet Peeve hit or a Detonation.'};
B3_SKILLS.only_off_your_plate={id:'only_off_your_plate',vibe:'nara_princess',slot:'s2',name:'"Only Off Your Plate"',pep:3,flavor:['sizzle'],power:0,hits:0,
  target:'ally',tags:[],composure:0,
  effects:[{op:'heal',pct:.30,to:'target'},{op:'heal',pct:.30,to:'self'},{op:'shield',pct:.10,to:'target'},{op:'shield',pct:.10,to:'self'},{op:'status',id:'plate_warm',to:'target'},{op:'status',id:'plate_warm',to:'self'}],line:null,
  short:'Nara and an ally each heal 30%, shield, and hit harder.',
  desc:'An ally shares warm food off their plate: Nara and that ally each heal 30% of Max HP, get a small warm shield (10% Max HP) and 20% more Attack for 2 turns.'};
B3_SKILLS.eighth_chair_pie_crust_decree={id:'eighth_chair_pie_crust_decree',vibe:'nara_princess',slot:'cap',name:'Eighth-Chair Pie-Crust Decree',pep:5,flavor:['racket'],power:0,hits:0,
  target:'all_foes',tags:[],composure:0,party:true,
  effects:[{op:'composure',n:1,to:'target'},{op:'cleanse',group:'mental',to:'allies'},{op:'pull',n:20,to:'allies'}],line:null,
  short:'-1 Composure on all, clears mental, pulls family.',
  desc:'Nara hops on her own dining chair and barks for chicken and crust: every monster loses 1 Composure pip, the family loses their mental bad effects, and everyone moves 20 ticks up the turn bar.'};
B3_QUIRKS.belly_rub_tax={id:'belly_rub_tax',vibe:'nara_princess',name:'Belly-Rub Tax',
  on:'afterHit',carrier:'target',from:'foe',hurtOver:.20,limit:'round',show:true,effects:[{op:'status',id:'fuss',to:'allies'}],
  desc:'When a monster hits Nara for 20% of her Max HP or more with no shield in the way, the family fusses over her: 15% more Speed for 2 turns (once a round).'};
B3_QUIRKS.allowed_on_the_couch={id:'allowed_on_the_couch',vibe:'nara_princess',name:'Allowed on the Couch',custom:'couch',n:{},
  desc:'A single buff put on Nara is copied, for half as many turns, onto the family member with the lowest HP.'};
