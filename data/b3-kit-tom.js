'use strict';
// data/b3-kit-tom.js — Battle 3 kit: Tom (spec section 3.1). Built so far: Frequent Flier's Basic, Skill 1 and Skill 2;
// Gamer Geek's Basic and Skill 1. Every Trait and Quirk has its name and sentence for the Vibes screen; `soon:true` marks one
// whose rule is not written yet (stage 5 writes `on` and `effects` and takes the flag off).
// The Vibe row names every Skill, Trait and Quirk from the spec; a move exists in a fight once its own row is in B3_SKILLS.
// A cast row: vibes (this member's Vibe ids, in the order the Vibes screen lists the ones not equipped), stat (multipliers on the level table).
// A Vibe row: owner, name, sig (1 = the Main Vibe on joining, 2 = the Pocket Vibe on joining, 0 = neither), lean (guard, striker,
//   tempo or support), subtitles (three, taking over at Ranks 1, 3 and 5), trait, basic, skills ([Skill 1, Skill 2, Grand Capstone]),
//   quirks ([Quirk A, Quirk B]), counter (null, or the rule that builds a Portable Counter: engine/b3-progress.js b3Kit).
// What each Rank unlocks is B3_RULES.rankUnlock (data/b3-rules.js). A Skill with no row yet has its name in B3_SOON.
B3_CAST.tom={id:'tom',name:'Tom',vibes:['tom_flier','tom_gamer'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.tom_flier={id:'tom_flier',owner:'tom',name:'Frequent Flier',sig:1,lean:'guard',
  subtitles:['Sky Club Applicant','Diamond Medallion','Delta 360 VIP'],
  trait:'priority_boarding',basic:'lounge_pass_flex',skills:['zone_one_blockade','suite_door_slide','tarmac_porsche_transfer'],
  quirks:['upgrade_certificate','million_miler_status'],counter:null};
B3_SKILLS.lounge_pass_flex={id:'lounge_pass_flex',vibe:'tom_flier',slot:'basic',name:'Lounge Pass Flex',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'eyes_on_me',to:'self'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Racket hit. Eyes On Me: monsters aim at Tom more until his next turn ends.'};
B3_SKILLS.zone_one_blockade={id:'zone_one_blockade',vibe:'tom_flier',slot:'s1',name:'Zone One Blockade',pep:2,flavor:['clobber'],power:0,hits:0,
  target:'self',tags:[],composure:0,effects:[{op:'status',id:'zone_one',to:'self'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'For 2 turns, any monster that hits Tom with a melee or thrown attack gets a Clobber hip-check back.'};
// The family next to Tom when he slides the doors shut are the ones covered (the status sits on them, engine/b3-ops.js `intercept`).
B3_SKILLS.suite_door_slide={id:'suite_door_slide',vibe:'tom_flier',slot:'s2',name:'Suite Door Slide',pep:3,flavor:['support'],power:0,hits:0,
  target:'adjacent_allies',tags:[],composure:0,effects:[{op:'intercept',id:'suite_door'}],line:null,anim:{kind:'default',shape:'give'},
  desc:'For 2 turns, a hit aimed only at the family next to Tom lands on Tom instead, 35% weaker. Each one he takes gives him 1 Pep.'};

B3_SOON.tarmac_porsche_transfer='Tarmac Porsche Transfer';
B3_TRAITS.priority_boarding={id:'priority_boarding',vibe:'tom_flier',name:'Priority Boarding',soon:true,
  desc:'Tom starts every fight in Guard Stance for 1 turn. When he takes a hit for someone under half HP, it lands 20% weaker.'};
B3_QUIRKS.upgrade_certificate={id:'upgrade_certificate',vibe:'tom_flier',name:'Upgrade Certificate',soon:true,
  desc:'Each hit Tom takes for someone stamps 1 Certificate, 3 at most. His next Clobber Skill cashes them in for 20% more damage each.'};
B3_QUIRKS.million_miler_status={id:'million_miler_status',vibe:'tom_flier',name:'Million-Miler Status',soon:true,
  desc:'When Tom counters or takes a hit for someone, 1 more Composure pip comes off and Tom moves 10 ticks up the turn bar.'};

// ---- Gamer Geek (second Sig Vibe) ----
B3_VIBES.tom_gamer={id:'tom_gamer',owner:'tom',name:'Gamer Geek',sig:2,lean:'striker',
  subtitles:['Button Smasher','Pro Controller Owner','Epic Completionist'],
  trait:'gamers_intuition',basic:'cartridge_blow',skills:['controller_toss','winged_shell_lock_on','konami_code'],
  quirks:['elixir_hoarder','new_game_plus'],counter:null};
B3_SOON.winged_shell_lock_on='Winged Shell Lock-On';
B3_SOON.konami_code='Konami Code';
B3_TRAITS.gamers_intuition={id:'gamers_intuition',vibe:'tom_gamer',name:'Gamer’s Intuition',soon:true,
  desc:'Tom deals 20% more damage to a monster’s Pet Peeve and to a monster with a Prime on it. His Detonations fill the Family Ruckus gauge 5% more.'};
B3_QUIRKS.elixir_hoarder={id:'elixir_hoarder',vibe:'tom_gamer',name:'Elixir Hoarder',soon:true,
  desc:'When Tom starts his turn with 6 Pep or more, he gets 15% more Speed and crits 15% more often.'};
B3_QUIRKS.new_game_plus={id:'new_game_plus',vibe:'tom_gamer',name:'New Game Plus',soon:true,
  desc:'After Tom sets off a Detonation or counters, his next Skill costs 2 Pep less. Once a round, and only for Skills that cost 4 Pep or less.'};
// Cartridge Blow: the light Racket hit is built. The spec's second half ("highlights enemy's next intended target") is one of the
// lines that needs its own function (claude/battle-kit-ops.md line 9); it arrives with stage 5.
B3_SKILLS.cartridge_blow={id:'cartridge_blow',vibe:'tom_gamer',slot:'basic',name:'Cartridge Blow',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Racket hit.'};
B3_SKILLS.controller_toss={id:'controller_toss',vibe:'tom_gamer',slot:'s1',name:'Controller Toss',pep:2,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'tookHit',add:.40}}],line:null,anim:{kind:'default',shape:'throw'},
  desc:'Clobber hit. 40% stronger if Tom took or blocked a hit since his last turn.'};
