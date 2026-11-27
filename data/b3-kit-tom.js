'use strict';
// data/b3-kit-tom.js — Battle 3 kit: Tom (spec section 3.1). Built: all of Frequent Flier (stage 5a), all of Gamer Geek
// (stage 5b) and all of Star Baker (stage 19, his third Vibe, sig 0: neither Main nor Pocket on joining). Every Trait and Quirk has its name and sentence for the Vibes screen; `soon:true` marks one whose rule is not written.
// A working Trait or Quirk row is one listener (`on` plus the listener fields of engine/b3-hooks.js and `effects`), several
// (`listen:[...]`), `mods` (engine/b3-core.js b3Mods: a mod may carry `when` and `per`), a `counter` of its own, or any mix.
// The Vibe row names every Skill, Trait and Quirk from the spec; a move exists in a fight once its own row is in B3_SKILLS.
// A cast row: vibes (this member's Vibe ids, in the order the Vibes screen lists the ones not equipped), stat (multipliers on the level table).
// A Vibe row: owner, name, sig (1 = the Main Vibe on joining, 2 = the Pocket Vibe on joining, 0 = neither), lean (guard, striker,
//   tempo or support), subtitles (three, taking over at Ranks 1, 3 and 5), trait, basic, skills ([Skill 1, Skill 2, Grand Capstone]),
//   quirks ([Quirk A, Quirk B]), counter (null, or the rule that builds a Portable Counter: engine/b3-progress.js b3Kit).
// What each Rank unlocks is B3_RULES.rankUnlock (data/b3-rules.js). A Skill with no row yet has its name in B3_SOON.
B3_CAST.tom={id:'tom',name:'Tom',vibes:['tom_flier','tom_gamer','tom_baker'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.tom_flier={id:'tom_flier',owner:'tom',name:'Frequent Flier',sig:1,lean:'guard',
  subtitles:['Sky Club Applicant','Diamond Medallion','Delta 360 VIP'],
  trait:'priority_boarding',basic:'lounge_pass_flex',skills:['zone_one_blockade','suite_door_slide','tarmac_porsche_transfer'],
  quirks:['upgrade_certificate','million_miler_status'],counter:null};
B3_SKILLS.lounge_pass_flex={id:'lounge_pass_flex',vibe:'tom_flier',slot:'basic',name:'Lounge Pass Flex',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'eyes_on_me',to:'self'}],line:null,
  short:'Light hit. Monsters aim at Tom more.',
  desc:'Light Racket hit. Eyes On Me: monsters aim at Tom more until his next turn ends.'};
B3_SKILLS.zone_one_blockade={id:'zone_one_blockade',vibe:'tom_flier',slot:'s1',name:'Zone One Blockade',pep:2,flavor:['clobber'],power:0,hits:0,
  target:'self',tags:[],composure:0,effects:[{op:'status',id:'zone_one',to:'self'}],line:null,
  short:'For 2 turns, Tom hip-checks any monster that hits him.',
  desc:'For 2 turns, any monster that hits Tom with a melee or thrown attack gets a Clobber hip-check back.'};
// The family next to Tom when he slides the doors shut are the ones covered (the status sits on them, engine/b3-ops.js `intercept`).
B3_SKILLS.suite_door_slide={id:'suite_door_slide',vibe:'tom_flier',slot:'s2',name:'Suite Door Slide',pep:3,flavor:['support'],power:0,hits:0,
  target:'adjacent_allies',tags:[],composure:0,effects:[{op:'intercept',id:'suite_door'}],line:null,
  short:'For 2 turns, Tom takes hits for the family beside him.',
  desc:'For 2 turns, a hit aimed only at the family next to Tom lands on Tom instead, 35% weaker. Each one he takes gives him 1 Pep.'};

// Tarmac Porsche Transfer (Grand Capstone): the spec prints "heavy AoE" (heavy tier at the all-monsters share), "strips 1 buff"
// and "locks aggro". My calls: 1 buff comes off each monster it hits, and the lock is a taunt that lasts 2 turns.
B3_SKILLS.tarmac_porsche_transfer={id:'tarmac_porsche_transfer',vibe:'tom_flier',slot:'cap',name:'Tarmac Porsche Transfer',pep:5,flavor:['racket'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'strip',kind:'buff',n:1,to:'target'},{op:'taunt',id:'high_beams',to:'self'}],line:null,
  short:'Heavy hit on every monster. Then they all aim at Tom.',
  desc:'Heavy Racket hit on every monster. Each one it hits loses 1 buff. For 2 turns, any attack aimed at one family member has to aim at Tom.'};
// Priority Boarding: the Guard Stance is put on as the fight begins and is counted like one Tom put on during his own turn,
// so it lasts until his second turn ends and covers the monsters' first attacks (my call: counted from the fight's start it
// would end before most monsters have moved). The 20% is its own kind of reduction: it adds to Suite Door Slide's 35%.
B3_TRAITS.priority_boarding={id:'priority_boarding',vibe:'tom_flier',name:'Priority Boarding',
  on:'battleStart',effects:[{op:'status',id:'guard_stance',n:2,to:'self'}],
  mods:[{stat:'reduce',kind:'priorityBoarding',v:.20,when:{steppingIn:.5}}],
  desc:'Tom starts every fight in Guard Stance, until his second turn ends. When he takes a hit for someone at half HP or less, it lands 20% weaker.'};
// Upgrade Certificate: one stamp per enemy action Tom steps in for. "Next Clobber skill" is the next Clobber hit of his that is
// not a Basic: a Clobber Skill on his own turn (Controller Toss), or a hip-check from Zone One Blockade (my call: that hit is
// the Clobber Skill's own). Every hit of that action gets the bonus, then the Certificates are gone.
B3_QUIRKS.upgrade_certificate={id:'upgrade_certificate',vibe:'tom_flier',name:'Upgrade Certificate',
  on:'intercept',carrier:'target',show:true,effects:[{op:'counter',id:'certificate',n:1,max:3,to:'self'}],
  counter:{id:'certificate',name:'Certificates',max:3},
  mods:[{stat:'out',kind:'certificate',v:.20,per:{counter:'certificate',spend:true},when:{flavor:'clobber',notBasic:true}}],
  desc:'Each time Tom takes a hit for someone he stamps 1 Certificate, 3 at most. His next Clobber Skill, or his next Blockade hip-check, cashes them in for 20% more damage each.'};
// Million-Miler Status. A counterattack is an answer Tom gives when hit (Zone One Blockade's hip-check): the pip is added to
// that answer. Stepping in for someone has no answer of its own, so the Quirk gives one: 1 pip off the attacker, as Tom's own
// small action after the monster's (its own 3-pip cap, like any answer). Each also pulls Tom 10 ticks (pulls halve inside a round).
B3_QUIRKS.million_miler_status={id:'million_miler_status',vibe:'tom_flier',name:'Million-Miler Status',
  listen:[{on:'counter',carrier:'source',show:true,effects:[{op:'composure',n:1,to:'target'},{op:'pull',n:10,to:'self'}]},
    {on:'intercept',carrier:'target',react:true,quiet:true,effects:[{op:'composure',n:1,to:'attacker'},{op:'pull',n:10,to:'self'}]}],
  desc:'When Tom counters or takes a hit for someone, 1 more Composure pip comes off the monster and Tom moves 10 ticks up the turn bar.'};

// ---- Gamer Geek (second Sig Vibe) ----
B3_VIBES.tom_gamer={id:'tom_gamer',owner:'tom',name:'Gamer Geek',sig:2,lean:'striker',
  subtitles:['Button Smasher','Pro Controller Owner','Epic Completionist'],
  trait:'gamers_intuition',basic:'cartridge_blow',skills:['controller_toss','winged_shell_lock_on','konami_code'],
  quirks:['elixir_hoarder','new_game_plus'],counter:null};
// Gamer's Intuition: "Pet Peeves or Primed States" is one condition on a damage mod (`peeveOrPrime`, engine/b3-core.js): the
// target has this flavor as a Pet Peeve, or carries any Prime when the hit lands (a hit that sets the Prime off counts: the Prime
// is still on the monster while the damage is worked out). The Ruckus half is a listener on Detonations Tom sets off; the gauge's
// own gains are stage 6, so until then only this +5 reaches it.
B3_TRAITS.gamers_intuition={id:'gamers_intuition',vibe:'tom_gamer',name:'Gamer’s Intuition',
  on:'detonation',carrier:'source',effects:[{op:'ruckus',n:5}],
  mods:[{stat:'out',kind:'gamersIntuition',v:.20,when:{peeveOrPrime:true}}],
  desc:'Tom deals 20% more damage to a monster’s Pet Peeve and to a monster with a Prime on it. His Detonations fill the Family Ruckus gauge 5% more.'};
// Elixir Hoarder: judged as Tom's turn starts (his Pep is what he saved up). The buff ends as his next turn begins.
B3_QUIRKS.elixir_hoarder={id:'elixir_hoarder',vibe:'tom_gamer',name:'Elixir Hoarder',
  on:'turnStart',carrier:'source',pepAtLeast:6,show:true,effects:[{op:'status',id:'elixir_buzz',to:'self'}],
  desc:'When Tom starts his turn with 6 Pep or more, he gets 15% more Speed and crits 15% more often.'};
// New Game Plus: one shared "once a round" (`limitKey`) for both triggers. The status it puts on lasts until the end of Tom's next
// turn, so it covers the next Skill he can use; a Detonation or counter on that turn keeps it going. A counter is a counterattack
// (Zone One Blockade's hip-check, a Winged Shell is not one); Million-Miler Status's step-in answer is not.
B3_QUIRKS.new_game_plus={id:'new_game_plus',vibe:'tom_gamer',name:'New Game Plus',
  listen:[{on:'detonation',carrier:'source',limit:'round',limitKey:'new_game_plus',effects:[{op:'status',id:'new_game_plus',to:'self'}]},
    {on:'counter',carrier:'source',limit:'round',limitKey:'new_game_plus',effects:[{op:'status',id:'new_game_plus',to:'self'}]}],
  desc:'After Tom sets off a Detonation or counters, his next Skill costs 2 Pep less. Once a round, and only for Skills that cost 4 Pep or less.'};
// Cartridge Blow: the light Racket hit, then the `foresee` op (engine/b3-custom.js, claude/battle-kit-ops.md line 9) picks the
// monster's next target early and holds it to that choice. The screen marks that family member NEXT TARGET.
B3_SKILLS.cartridge_blow={id:'cartridge_blow',vibe:'tom_gamer',slot:'basic',name:'Cartridge Blow',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'foresee'}],line:null,
  short:'Light hit. Shows who the monster will attack next.',
  desc:'Light Racket hit. Shows who the monster will aim its next attack at, and it keeps to that.'};
B3_SKILLS.controller_toss={id:'controller_toss',vibe:'tom_gamer',slot:'s1',name:'Controller Toss',pep:2,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'tookHit',add:.40}}],line:null,
  short:'Hit. Stronger if Tom just took a hit.',
  desc:'Clobber hit. 40% stronger if Tom took or blocked a hit since his last turn.'};
// Winged Shell Lock-On: the spec says "Smacks foe" (Clobber, 4 Pep) and a free Razzle explosion if it attacks. Both are standard
// power (my call: the spec names no tier). The explosion is the shell's own status row (data/b3-status.js winged_shell).
B3_SKILLS.winged_shell_lock_on={id:'winged_shell_lock_on',vibe:'tom_gamer',slot:'s2',name:'Winged Shell Lock-On',pep:4,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'winged_shell',to:'target'}],line:null,
  short:'Hit. If it attacks before Tom’s turn, the shell explodes.',
  desc:'Clobber hit. A blue winged shell hovers over the monster until Tom’s next turn. If it attacks before then, the shell slams down in a free Razzle explosion.'};
// Konami Code (Grand Capstone): 6 Pep, Razzle, heavy at the all-monsters share, 2 Composure pips, and each monster's crit chance
// rises 15% for every Prime on it. "Tom glows rainbow-invincible" is the picture only (my call: nothing acts during his own
// action, so a rule would change nothing; it is not a turn of untargetable).
B3_SKILLS.konami_code={id:'konami_code',vibe:'tom_gamer',slot:'cap',name:'Konami Code',pep:6,flavor:['razzle'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:2,effects:[{op:'damage',critPerPrime:.15}],line:null,
  short:'Heavy hit on every monster. Knocks 2 Composure off each.',
  desc:'Heavy Razzle hit on every monster, knocking 2 Composure pips off each. Each monster is 15% more likely to crit for every Prime on it.'};

// ---- Star Baker (third Vibe, stage 19) ----
B3_VIBES.tom_baker={id:'tom_baker',owner:'tom',name:'Star Baker',sig:0,lean:'support',
  subtitles:['Underproofer','Stand-Mixer Pro','Grand Pâtissier'],
  trait:'preheated_oven',basic:'starter_splash',skills:['sheet_pan_bribe','five_hundred_degree_boule','three_tier_showstopper'],
  quirks:['parchment_lined','caramelized_crust'],
  counter:{id:'oven',name:'Oven Temp',max:3,on:'turnEnd',carrier:'source',n:1}};
// Preheated Oven: Oven Temp is a Portable Counter (+1 Stage at the end of each of Tom's turns, 3 at most). Each Stage is +10% on
// every heal and shield Tom gives (`healGiven`) and +10% on his Sizzle hits.
B3_TRAITS.preheated_oven={id:'preheated_oven',vibe:'tom_baker',name:'Preheated Oven',
  mods:[{stat:'healGiven',kind:'oven',v:.10,per:{counter:'oven'}},{stat:'out',kind:'oven',v:.10,per:{counter:'oven'},when:{flavor:'sizzle'}}],
  desc:'Oven Temp goes up 1 Stage after each of Tom’s turns, 3 at most. Each Stage makes his heals and shields 10% bigger and his Sizzle hits 10% stronger.'};
// Starter Splash: on a monster a light Drench hit (it leaves Drenched); on a family member it makes one buff or regen last 1 turn longer
// (the `extend` op, engine/b3-ops.js). My call: "an active buff/regen" is every buff the member wears, each 1 turn longer.
B3_SKILLS.starter_splash={id:'starter_splash',vibe:'tom_baker',slot:'basic',name:'Starter Splash',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'either',tags:[],composure:0,effects:[{op:'damage'}],allyEffects:[{op:'extend',n:1,to:'target'}],line:null,
  short:'Light hit, or makes a family member’s buffs last longer.',
  desc:'Tosses bubbly sourdough starter. On a monster it is a light Drench hit. On a family member it makes every buff and regen they have last 1 turn longer.'};
// Sheet-Pan Bribe: heals now; Sugar Kick comes on Tom's next turn (my call for "in 2 turns": the `later` op runs at the start of Tom's next
// turn, which is 2 turns after the heal counting the ally's own).
B3_SKILLS.sheet_pan_bribe={id:'sheet_pan_bribe',vibe:'tom_baker',slot:'s1',name:'Sheet-Pan Bribe',pep:2,flavor:['support'],power:0,hits:0,
  target:'ally',tags:[],composure:0,effects:[{op:'heal',pct:'small'},
    {op:'later',name:'Sugar Kick',who:'target',effects:[{op:'heal',pct:'small',to:'target'},{op:'pep',n:2,to:'target'}]}],line:null,
  short:'Heals a family member now, and again next turn with +2 Pep.',
  desc:'Slides a warm cinnamon roll to a family member: a small heal now. Sugar Kick comes at the start of Tom’s next turn: a second small heal and 2 Pep for them.'};
// Five-Hundred-Degree Boule: standard Sizzle on every monster (the hit leaves them Toasty), then every family member gets a golden-crust
// shield of 10% Max HP for each Oven Temp Stage (a shield op with `perCounter`).
B3_SKILLS.five_hundred_degree_boule={id:'five_hundred_degree_boule',vibe:'tom_baker',slot:'s2',name:'Five-Hundred-Degree Boule',pep:4,flavor:['sizzle'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'shield',pct:0,perCounter:{counter:'oven',add:.10},to:'allies'}],line:null,
  short:'Sizzle on all monsters. Shields the family.',
  desc:'Uncovers a 500 degree Dutch oven: Sizzle hit on every monster, which leaves them Toasty. Every family member gets a golden-crust shield of 10% Max HP for each Oven Temp Stage.'};
// Three-Tier Showstopper Cake: party heal, cleanse, and the sparkler status (data/b3-status.js sparklers) that adds Sizzle to each
// family member's next hit. That needed no one-off: the status listens for the hit and splashes a share of it.
B3_SKILLS.three_tier_showstopper={id:'three_tier_showstopper',vibe:'tom_baker',slot:'cap',name:'Three-Tier Showstopper Cake',pep:5,flavor:['sizzle'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,effects:[{op:'heal',pct:'party',to:'allies'},{op:'cleanse',to:'allies'},{op:'status',id:'sparklers',to:'allies'}],line:null,
  short:'Heals the family, clears debuffs, adds Sizzle.',
  desc:'Rolls out a three-layer cake blazing with sparklers. Heals the whole family, clears their bad effects, and each of them adds Sizzle damage to their next hit.'};
// Parchment Lined: any heal, shield or other support Skill of Tom's leaves him waiting 25% less (`moveRec` with `supportSkill`).
B3_QUIRKS.parchment_lined={id:'parchment_lined',vibe:'tom_baker',name:'Parchment Lined',
  mods:[{stat:'moveRec',kind:'parchment',v:-.25,when:{supportSkill:true}}],
  desc:'When Tom uses a heal, a shield or another support Skill, he waits 25% less before his next turn.'};
// Caramelized Crust: when a shield Tom put on ends or breaks, the sugar-glass crust shatters on a monster. My calls: the spec says "on
// attacker" but a shield that runs out on its own has none, so the crust always lands on a monster picked by the fight's dice; and only shields
// count (Tom has no heal-over-time: Sugar Kick is one more heal).
B3_QUIRKS.caramelized_crust={id:'caramelized_crust',vibe:'tom_baker',name:'Caramelized Crust',
  listen:[{on:'shieldBroken',shieldBy:'holder',limit:'round',limitKey:'caramel',show:true,effects:[{op:'damage',flavor:['sizzle'],power:'light',to:'randomFoe'}]},
    {on:'shieldEnded',shieldBy:'holder',limit:'round',limitKey:'caramel',show:true,effects:[{op:'damage',flavor:['sizzle'],power:'light',to:'randomFoe'}]}],
  desc:'When a shield Tom gave breaks or runs out, sugar-glass shatters on a random monster for a light Sizzle hit (once a round).'};
