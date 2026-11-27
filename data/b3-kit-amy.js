'use strict';
// data/b3-kit-amy.js — Battle 3 kit: Amy (spec section 3.4). Built: all of Fitness Queen and all of Classroom Boss (stage 10).
// SuperMom, her third Vibe, is stage 19 (sig 0).
// Same shape as the other kit files (see the top of data/b3-kit-tom.js). Amy is in the party from chapter 1, so she is not a late joiner.
// Two lines needed more than data: Pace-Partner Run (a copied Speed value: `b3PaceSet`, engine/b3-custom.js) and the Reps rule
// (a Portable Counter on the Vibe row, `counter`, built by engine/b3-progress.js). Every number the spec leaves out is a call,
// written where it is made and listed in claude/battle-build.md "Calls made that Tom has not confirmed".
B3_CAST.amy={id:'amy',name:'Amy',vibes:['amy_fitness','amy_classroom','amy_super'],stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- Fitness Queen (first Sig Vibe) ----------------------------------------------------------------
// Reps (Portable Counter, max 4): every action Amy finishes that is not a Basic builds 1 Rep, and Kettlebell Swing builds 1 itself, so each
// turn she takes is worth exactly 1 Rep (my call: "consecutive active turns" read as "every turn she acts", and the Basic's own +1 is the
// same Rep, not a second one). Reps stay when she is knocked out; Follow-Along Finale Burnout spends them. The listener travels with the
// counter, so a Pocket Vibe Skill that reads Reps builds them by the same rule; the Speed and Clobber bonuses are the Trait's (Main only).
B3_VIBES.amy_fitness={id:'amy_fitness',owner:'amy',name:'Fitness Queen',sig:1,lean:'tempo',
  subtitles:['Living-Room Lunger','Home-Gym Regular','Undefeated HIIT Icon'],
  trait:'workout_streak',basic:'kettlebell_swing',skills:['burpee_blitz','pace_partner_run','follow_along_finale_burnout'],
  quirks:['walk_it_off_hydrate','active_recovery'],
  counter:{id:'reps',name:'Reps',max:4,on:'actionEnd',carrier:'source',notBasic:true,n:1}};
B3_TRAITS.workout_streak={id:'workout_streak',vibe:'amy_fitness',name:'Workout Streak',
  mods:[{stat:'spd',kind:'reps',v:.05,per:{counter:'reps'}},{stat:'out',kind:'reps',v:.05,per:{counter:'reps'},when:{flavor:'clobber'}}],
  desc:'Every turn Amy takes builds a Rep, up to 4. Each Rep gives her 5% more Speed and 5% more damage on Clobber hits.'};
// The spec says "ultra-fast recovery": Base Recovery 60 instead of 80 (my call).
B3_SKILLS.kettlebell_swing={id:'kettlebell_swing',vibe:'amy_fitness',slot:'basic',name:'Kettlebell Swing',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,rec:60,effects:[{op:'damage'},{op:'counter',id:'reps',n:1,max:4,to:'self'}],line:null,
  short:'Light hit. Builds a Rep, and Amy’s next turn comes sooner.',
  desc:'Light Clobber swing. Builds a Rep, and Amy waits much less than after any other Basic.'};
// Burpee Blitz: a standard Clobber hit. With 3 or more Reps it also gives Amy a bonus mini-turn at once: one Basic or one Skill that costs
// 2 Pep or less, paid for in the normal way (only the spec's Colossal Dumpling says "for free", my call). It is her one free action this round.
B3_SKILLS.burpee_blitz={id:'burpee_blitz',vibe:'amy_fitness',slot:'s1',name:'Burpee Blitz',pep:2,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,counter:'reps',
  effects:[{op:'damage'},{op:'grant',to:'self',maxPep:2,basic:true,needCounter:{id:'reps',min:3}}],line:null,
  short:'Hit. With 3 Reps, Amy gets a bonus turn right away.',
  desc:'Standard Clobber jump-kick. With 3 or more Reps, Amy also gets an extra mini-turn right away: a Basic, or a Skill that costs 2 Pep or less. Once a round.'};
// Pace-Partner Run: the ally's Speed is raised to Amy's Speed as it is when she calls them (a copied value, not a percent) for 2 turns.
// My call: it never lowers a faster ally's Speed. The Skill does no damage.
B3_SKILLS.pace_partner_run={id:'pace_partner_run',vibe:'amy_fitness',slot:'s2',name:'Pace-Partner Run',pep:3,flavor:['support'],power:0,hits:0,
  target:'ally',tags:[],composure:0,effects:[{op:'status',id:'pace_run',to:'target'}],line:null,
  short:'One family member keeps up with Amy’s speed for 2 turns.',
  desc:'Amy calls a family member onto a run beside her. For 2 turns their Speed is raised to match hers. It never slows anyone down.'};
// "Walk It Off, Hydrate": two listeners on one row. When a Rep takes her to 4 (the `counterFull` hook), and at the start of every 3rd turn
// she takes, she heals 20% of her HP and gains 1 Pep (the Pep counts toward the 3-a-round refund cap).
B3_QUIRKS.walk_it_off_hydrate={id:'walk_it_off_hydrate',vibe:'amy_fitness',name:'“Walk It Off, Hydrate”',
  listen:[{on:'counterFull',carrier:'source',ids:['reps'],show:true,effects:[{op:'heal',pct:.20,to:'self'},{op:'pep',n:1,to:'self'}]},
    {on:'turnStart',carrier:'source',everyOwnTurn:3,show:true,effects:[{op:'heal',pct:.20,to:'self'},{op:'pep',n:1,to:'self'}]}],
  desc:'When Amy reaches 4 Reps, and at the start of every 3rd turn she takes, she heals 20% of her HP and gains 1 Pep.'};
// Follow-Along Finale Burnout: a capstone Clobber wave that pierces shields and Evasion. All Reps are spent: each adds 25% damage. The whole
// family waits 20% less after every move for 2 turns (my call on the length).
B3_SKILLS.follow_along_finale_burnout={id:'follow_along_finale_burnout',vibe:'amy_fitness',slot:'cap',name:'Follow-Along Finale Burnout',pep:6,flavor:['clobber'],power:'capstone',hits:1,
  target:'all_foes',tags:[],composure:0,counter:'reps',
  effects:[{op:'damage',pierce:true,bonus:{counter:'reps',add:.25,spend:true}},{op:'status',id:'finale_pace',to:'allies'}],line:null,
  short:'Huge hit on every monster. Each Rep makes it stronger.',
  desc:'The workout stream counts down and Amy burns it all out: a capstone Clobber wave that goes through shields and Evasion. Every Rep is spent for 25% more damage each. The whole family waits 20% less after each move for 2 turns.'};
// Active Recovery: a Skill that costs 2 Pep or less waits 40% less, the first time each round (the mod's `oncePerRound`, engine/b3-core.js).
B3_QUIRKS.active_recovery={id:'active_recovery',vibe:'amy_fitness',name:'Active Recovery',
  mods:[{stat:'moveRec',kind:'activeRec',v:-.40,when:{skillPep:2,oncePerRound:'activeRec'}}],
  desc:'Once a round, a Skill that costs 2 Pep or less leaves Amy waiting 40% less before her next turn.'};

// ---------------------------------------------------------------- Classroom Boss (second Sig Vibe) ----------------------------------------------------------------
B3_VIBES.amy_classroom={id:'amy_classroom',owner:'amy',name:'Classroom Boss',sig:2,lean:'support',
  subtitles:['Recess Monitor','Four-Tab Planner','Teacher of the Year'],
  trait:'counting_to_three',basic:'eyes_on_me_clap',skills:['four_tab_binder','gold_star_sticker','classroom_lights_out_reset'],
  quirks:['good_try_margin_note','never_late_once'],counter:null};
// "I'm Counting to Three": the monster takes a turn for the second time before any family member has acted since its first (the
// `foeDoubleTurn` hook, engine/b3-resolve.js b3BeginTurn). Amy answers it with Detention: 20% less Attack for 2 turns and 1 Composure pip.
// My calls: "acting twice" is the same monster with no family member's turn between; the Detention lasts 2 turns.
B3_TRAITS.counting_to_three={id:'counting_to_three',vibe:'amy_classroom',name:'“I’m Counting to Three”',
  on:'foeDoubleTurn',react:true,quiet:true,show:true,
  effects:[{op:'status',id:'detention',to:'attacker'},{op:'composure',n:1,to:'attacker'}],
  desc:'A monster that takes a second turn before anyone in the family has acted gets Detention: 20% less Attack for 2 turns and 1 Composure pip off.'};
B3_SKILLS.eyes_on_me_clap={id:'eyes_on_me_clap',vibe:'amy_classroom',slot:'basic',name:'“Eyes on Me” Clap',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'strip',kind:'buff',n:1,stat:['spd','eva'],to:'target'}],line:null,
  short:'Light hit. Knocks off one of its speed or dodge boosts.',
  desc:'Light Racket hit. It knocks 1 Speed or Evasion buff off the monster.'};
// Four-Tab Binder: a light Racket slam (my call: the spec prints no damage, and a Racket Skill that hits nothing has nothing to set off)
// and the Binder mark for 2 monster turns. The first time two different family members hit the marked monster with two different flavors
// inside one round (a Mix, engine/b3-ruckus.js), it loses 1 pip, 2 if either hit struck a Pet Peeve or set off a Detonation, and everyone
// in the party gains 1 Pep. The Binder is used up when it goes off.
B3_SKILLS.four_tab_binder={id:'four_tab_binder',vibe:'amy_classroom',slot:'s1',name:'Four-Tab Binder',pep:3,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'binder',to:'target'}],line:null,
  short:'Light hit. Two different flavors on it in a round earn Pep.',
  desc:'A light Racket slam with a color-coded binder that marks the monster for 2 of its turns. The first time two family members hit it with two different flavors in one round, it loses 1 Composure pip (2 if either hit struck a Pet Peeve or set off a Detonation) and the whole party gains 1 Pep.'};
// Gold-Star Sticker: +35% damage and +35% healing and shields given, for 2 turns (my call: "potency" is both, as in Sensory Satisfying),
// and "guaranteed accuracy": their hits ignore accuracy penalties and the monster's Evasion (not a Blind: that stays).
B3_SKILLS.gold_star_sticker={id:'gold_star_sticker',vibe:'amy_classroom',slot:'s2',name:'Gold-Star Sticker',pep:3,flavor:['razzle'],power:0,hits:0,
  target:'family',tags:[],composure:0,effects:[{op:'status',id:'gold_star',to:'target'}],line:null,
  short:'One family member’s moves get stronger and can’t miss.',
  desc:'A giant gold star on a family member. For 2 turns their hits, heals and shields are 35% stronger and cannot miss.'};
// "Good Try" Margin Note: whoever breaks a monster that carries one of Amy's debuffs (a Binder, a Detention) heals 15% of their HP and gains
// 1 Pep. The breaker may be Amy. The heal is Amy's, so her Support Lean makes it bigger.
B3_QUIRKS.good_try_margin_note={id:'good_try_margin_note',vibe:'amy_classroom',name:'“Good Try” Margin Note',
  on:'break',tgtFoe:true,tgtDebuffedBy:'holder',show:true,effects:[{op:'heal',pct:.15,to:'attacker'},{op:'pep',n:1,to:'attacker'}],
  desc:'When a family member breaks a monster that has one of Amy’s debuffs on it, they heal 15% of their HP and gain 1 Pep.'};
// Classroom Lights-Out Reset: a heavy Racket wave on every monster (the tier is my call, as for the other 5 Pep Capstones), which locks each
// one out of party-wide acts for 1 of its turns (a wound-up one is lost), and every buff on the family is set back to its full length.
B3_SKILLS.classroom_lights_out_reset={id:'classroom_lights_out_reset',vibe:'amy_classroom',slot:'cap',name:'Classroom Lights-Out Reset',pep:5,flavor:['racket'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'lights_out',to:'foes'},{op:'interrupt',to:'foes',aoeOnly:true},{op:'refresh',to:'allies'}],line:null,
  short:'Heavy hit on every monster. Stops whole-family attacks.',
  desc:'Amy flicks the lights off and the room goes quiet. A heavy Racket wave hits every monster. For 1 turn none of them can use an attack on the whole family. Every buff on the family goes back to its full length.'};
// Never Late Once: a buff Amy puts on a family member pulls them 15 ticks up the turn bar, once per action for each of them.
B3_QUIRKS.never_late_once={id:'never_late_once',vibe:'amy_classroom',name:'Never Late Once',
  on:'statusApplied',carrier:'source',kinds:['buff'],tgtAlly:true,limit:'actionTarget',show:true,effects:[{op:'pull',n:15,to:'target'}],
  desc:'A buff Amy gives a family member also moves them 15 ticks up the turn bar.'};

// ---------------------------------------------------------------- SuperMom (third Vibe, stage 19; sig 0) ----------------------------------------------------------------
B3_VIBES.amy_super={id:'amy_super',owner:'amy',name:'SuperMom',sig:0,lean:'guard',
  subtitles:['Double-Cold-Brew Driver','Ford Explorer Captain','Unstoppable Mama'],
  trait:'eyes_in_back_of_her_head',basic:'backup_iced_coffee',skills:['mom_arm_seatbelt_stop','dairy_free_snack_pack','act_one_inside_voice_belt'],
  quirks:['emergency_purse_tissue','the_rivituso_rule'],counter:null};
// Eyes in the Back of Her Head: when a family member other than Amy falls under 35% of Max HP (the `allyBelowHp` hook, engine/b3-resolve.js b3Hurt)
// she moves 25 ticks up the bar. It cannot go off again for 2 rounds.
B3_TRAITS.eyes_in_back_of_her_head={id:'eyes_in_back_of_her_head',vibe:'amy_super',name:'Eyes in the Back of Her Head',
  on:'allyBelowHp',tgtOther:true,cooldown:2,show:true,effects:[{op:'pull',n:25,to:'self'}],
  desc:'When a family member drops under 35% HP, Amy moves 25 ticks up the turn bar. It cannot happen again for 2 rounds.'};
B3_SKILLS.backup_iced_coffee={id:'backup_iced_coffee',vibe:'amy_super',slot:'basic',name:'Backup Iced Coffee',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'either',tags:[],composure:0,effects:[{op:'damage'}],allyEffects:[{op:'heal',pct:'small'},{op:'status',id:'iced_up',to:'target'}],line:null,
  short:'Light Drench hit, or a small heal and Speed for an ally.',
  desc:'On a monster, a light Drench hit. On a family member, a small heal and 15% more Speed for 2 turns.'};
// Mom-Arm Seatbelt Stop: a fast move (Base Recovery 70, my call for "fast"). It deals no damage (the spec gives the lunge no power); the Seatbelt on the
// two allies halves an act that reaches the whole family for 2 turns (my call for the length).
B3_SKILLS.mom_arm_seatbelt_stop={id:'mom_arm_seatbelt_stop',vibe:'amy_super',slot:'s1',name:'Mom-Arm Seatbelt Stop',pep:2,flavor:['clobber'],power:0,hits:0,rec:70,
  target:'ally_pair',tags:[],composure:0,effects:[{op:'status',id:'seatbelt',to:'target'}],line:null,
  short:'Fast. Two allies take half from whole-family acts.',
  desc:'A fast protective lunge across the formation. Two family members take half damage from any act that reaches the whole family, for 2 turns.'};
B3_SKILLS.dairy_free_snack_pack={id:'dairy_free_snack_pack',vibe:'amy_super',slot:'s2',name:'Dairy-Free Snack Pack',pep:4,flavor:['support'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,effects:[{op:'heal',pct:'party',to:'allies'},{op:'cleanse',ids:['slow','fatigue'],to:'allies'}],line:null,
  short:'Heals the family and clears Slow and Fatigue.',
  desc:'Fruit leather, apple slices and protein bites: a party heal that also clears Slow and Fatigue.'};
B3_SKILLS.act_one_inside_voice_belt={id:'act_one_inside_voice_belt',vibe:'amy_super',slot:'cap',name:'Act-One "Inside Voice" Belt',pep:5,flavor:['racket'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,party:true,effects:[{op:'damage'},{op:'status',id:'inside_voice',to:'allies'}],line:null,
  short:'Heavy hit on all. Family: +25% Defense, no debuffs.',
  desc:'A chandelier-rattling belt: heavy Racket hit on every monster. The whole family gets 25% more Defense and cannot be given bad effects by monsters for 2 turns.'};
// Emergency Purse Tissue: Amy's heals grow 35% on a family member under 40% HP (the heal op reads `healGiven` with the target in view).
B3_QUIRKS.emergency_purse_tissue={id:'emergency_purse_tissue',vibe:'amy_super',name:'Emergency Purse Tissue',
  mods:[{stat:'healGiven',kind:'tissue',v:.35,when:{tgtBelow:.4}}],
  desc:'Amy\u2019s heals do 35% more on a family member under 40% HP.'};
// The Rivituso Rule: a family member (Amy too) takes a crit, or a hit of 25% of their Max HP or more that no shield soaked any of: Amy gets 1 Pep (once a round).
B3_QUIRKS.the_rivituso_rule={id:'the_rivituso_rule',vibe:'amy_super',name:'The Rivituso Rule',
  on:'afterHit',from:'foe',tgtAlly:true,hurtOver:.25,orCrit:true,limit:'round',show:true,effects:[{op:'pep',n:1,to:'self'}],
  desc:'When a family member takes a crit, or a heavy hit (a quarter of their Max HP) with no shield in the way, Amy gets 1 Pep (once a round).'};
