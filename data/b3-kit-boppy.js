'use strict';
// data/b3-kit-boppy.js — Battle 3 kit: Boppy (spec section 3.6). Built: The Dep and Pepper Boss (stage 9c). Boat Angler, his third Vibe, is stage 19 (sig 0).
// Same shape as the other kit files (see the top of data/b3-kit-tom.js). Boppy joins in chapter 3: his Vibe Points start from the late joiners'
// pool (engine/b3-progress.js b3NewLoadout), and his Main Vibe is The Dep, his Pocket Vibe Pepper Boss.
// Three lines needed their own rule (engine/b3-custom.js and the engine files named there): "Gold Like My Teeth", "The Hose Flinched" and
// "The Mailbox Moved". The Trait Boppy Speed has one small rule too (`boppySpeed`). Every number the spec leaves out is a call, written where it is made.
B3_CAST.boppy={id:'boppy',name:'Boppy',vibes:['boppy_dep','boppy_pepper','boppy_angler'],late:true,stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- The Dep (first Sig Vibe) ----------------------------------------------------------------
B3_VIBES.boppy_dep={id:'boppy_dep',owner:'boppy',name:'The Dep',sig:1,lean:'guard',
  subtitles:['Sofa Sentry','Rikers Lineup Boss','Immovable Gold Warden'],
  trait:'boppy_speed',basic:'wardens_nightstick_rap',skills:['nobody_gets_past_me','cross_country_story_1970','wardens_iron_gate'],
  quirks:['gold_like_my_teeth','the_mailbox_moved'],counter:null};
// Boppy Speed: "Nobody rushes Boppy: timeline pushback immune >50% HP; +40% aggro." Above half of his Max HP a push does nothing to him
// (`boppySpeed`, engine/b3-timeline.js b3Push, so a Stun on him is the same), and his aggro weight is 40% higher.
B3_TRAITS.boppy_speed={id:'boppy_speed',vibe:'boppy_dep',name:'Boppy Speed',
  custom:'boppySpeed',n:{above:.50},mods:[{stat:'aggro',kind:'boppySpeed',v:.40}],
  desc:'Nobody rushes Boppy: while he is above half HP, nothing can push him back on the turn bar. Monsters aim at him 40% more often.'};
B3_SKILLS.wardens_nightstick_rap={id:'wardens_nightstick_rap',vibe:'boppy_dep',slot:'basic',name:'Warden’s Nightstick Rap',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'back_behind',to:'target'}],line:null,
  short:'Light hit. The monster hits softer on its next turn.',
  desc:'Light Clobber hit with the warden’s nightstick. The monster has 15% less Attack for its next turn.'};
// "Nobody Gets Past Me!": the spec's "2t AoE taunt, +35% Def, grumpy Racket counter when hit" is one status (Nobody Gets Past Me) on Boppy:
// the taunt flag (every single-target monster attack aims at him), +35% Defense, and a light Racket answer to a hit, once per action (my call:
// no tier in the spec). It does no damage of its own.
B3_SKILLS.nobody_gets_past_me={id:'nobody_gets_past_me',vibe:'boppy_dep',slot:'s1',name:'“Nobody Gets Past Me!”',pep:3,flavor:['racket'],power:0,hits:0,
  target:'self',tags:[],composure:0,effects:[{op:'taunt',id:'nobody_past',to:'self'}],line:null,
  short:'For 2 turns, monsters must attack Boppy, and he’s tougher.',
  desc:'Boppy takes the Rikers stance for 2 turns. Every single-target monster attack has to aim at him, he has 35% more Defense, and he grumbles a Racket answer at whoever hits him.'};
// 1970 Cross-Country Story: slows Boppy and the monster 20% (the common Slow, 2 turns) and locks that monster's aim onto Boppy for 2 of its turns.
// The lock holds against a taunt on someone else. The monster still takes its turns. It deals no damage (my call: the spec prints none).
B3_SKILLS.cross_country_story_1970={id:'cross_country_story_1970',vibe:'boppy_dep',slot:'s2',name:'1970 Cross-Country Story',pep:3,flavor:['racket'],power:0,hits:0,
  target:'foe',tags:[],composure:0,effects:[{op:'status',id:'slow',to:'self'},{op:'status',id:'slow',to:'target'},{op:'status',id:'story_lock',to:'target'}],line:null,
  short:'Slows Boppy and one monster, and it has to aim at Boppy.',
  desc:'Boppy tells the 41st version of the story about passing someone on the last hill. He and the monster are both 20% slower for 2 turns, and for 2 of its turns the monster’s single-target attacks have to aim at him. It still takes its turns.'};
// "Gold Like My Teeth": once a battle a hit that would knock Boppy out leaves him on 1 HP and gives him 3 Pep (`goldTeeth`, engine/b3-resolve.js
// b3Hurt). My calls: an Extra Jacket (the Ward's survive) is used first if he wears one; the Pep counts toward the 3-a-round refund cap.
B3_QUIRKS.gold_like_my_teeth={id:'gold_like_my_teeth',vibe:'boppy_dep',name:'“Gold Like My Teeth”',
  custom:'goldTeeth',n:{pep:3},
  desc:'Once a battle, a hit that would knock Boppy out leaves him on 1 HP and gives him 3 Pep.'};
// Warden's Iron Gate: a status on every family member for 2 rounds (my call: a status, not a hazard, so it ends with the round dividers the
// way the spec's "2 rounds" says). 40% less damage from a party-wide act; a monster that hits one of them with a melee act gets a light Clobber
// hit from Boppy (the thorns are his, aimed at the attacker; my call on the tier). No damage the turn it is slammed down.
B3_SKILLS.wardens_iron_gate={id:'wardens_iron_gate',vibe:'boppy_dep',slot:'cap',name:'Warden’s Iron Gate',pep:5,flavor:['clobber'],power:0,hits:0,
  target:'self',tags:[],composure:0,effects:[{op:'status',id:'iron_gate',to:'allies'}],line:null,
  short:'For 2 rounds, a gate softens attacks on the whole family.',
  desc:'Slams the gleaming brass-and-iron Rikers gate down in front of the family for 2 rounds. Everyone takes 40% less damage from an attack that hits the whole family, and a monster that hits one of them in melee gets a Clobber hit from Boppy.'};
// "The Mailbox Moved": Boppy's answers (the counter of "Nobody Gets Past Me!", the Iron Gate's thorns) take the flavor and the status riders of
// his last Skill (`mailbox`, engine/b3-custom.js b3MailboxEffects).
B3_QUIRKS.the_mailbox_moved={id:'the_mailbox_moved',vibe:'boppy_dep',name:'“The Mailbox Moved”',
  custom:'mailbox',n:{},
  desc:'Boppy never admits fault. His answers to a hit copy the flavor of the last Skill he used, and put on the monster whatever that Skill put on its target.'};

// ---------------------------------------------------------------- Pepper Boss (second Sig Vibe) ----------------------------------------------------------------
B3_VIBES.boppy_pepper={id:'boppy_pepper',owner:'boppy',name:'Pepper Boss',sig:2,lean:'striker',
  subtitles:['Garden Nibbler','1989 Pickle Keeper','Five-Alarm Iron Gut'],
  trait:'my_stomach',basic:'seeds_of_trouble',skills:['its_nothing_its_fine_chomp','pickle_jar_bomb_1989','the_ghost_one_that_looks_back'],
  quirks:['the_hose_flinched','no_reach_for_water'],counter:null};
// "My Stomach Is Doing Something": 30% less Sizzle damage taken (a reduction that counts only for a Sizzle hit, or a Sizzle burn tick), and
// 25% more Attack for 2 turns after a monster's Sizzle hit lands on him or he heats himself (Spiced Up). My calls: "chip" is any Sizzle hit a
// monster lands on him; a burn tick does not set off the Attack bonus; once an action for each.
B3_TRAITS.my_stomach={id:'my_stomach',vibe:'boppy_pepper',name:'“My Stomach Is Doing Something”',
  mods:[{stat:'reduce',kind:'stomach',v:.30,when:{flavor:'sizzle'}}],
  listen:[{on:'afterHit',carrier:'target',from:'foe',flavor:'sizzle',limit:'action',effects:[{op:'status',id:'stomach_buzz',to:'self'}]},
          {on:'statusApplied',carrier:'target',ids:['spiced_up'],limit:'action',effects:[{op:'status',id:'stomach_buzz',to:'self'}]}],
  desc:'Boppy takes 30% less Sizzle damage. When Sizzle hits him, or he heats himself up with a pepper, his Attack is 25% higher for 2 turns.'};
B3_SKILLS.seeds_of_trouble={id:'seeds_of_trouble',vibe:'boppy_pepper',slot:'basic',name:'Seeds of Trouble',pep:0,flavor:['sizzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,
  short:'Light hit. Leaves the monster Toasty.',
  desc:'Flicks homegrown chili seeds for a light Sizzle hit that leaves the monster Toasty.'};
// "It's Nothing, It's Fine" Chomp: heals Boppy 20% of his Max HP (the spec's number) and gives Spiced Up for 3 turns.
B3_SKILLS.its_nothing_its_fine_chomp={id:'its_nothing_its_fine_chomp',vibe:'boppy_pepper',slot:'s1',name:'“It’s Nothing, It’s Fine” Chomp',pep:2,flavor:['sizzle'],power:0,hits:0,
  target:'self',tags:[],composure:0,effects:[{op:'heal',pct:.20,to:'self'},{op:'status',id:'spiced_up',to:'self'}],line:null,
  short:'Boppy heals a little and his Sizzle hits get stronger.',
  desc:'Eats a raw pepper and blames the oven. Boppy heals 20% of his HP and is Spiced Up for 3 turns: his Sizzle hits do 30% more, and a monster that hits him in melee gets burned.'};
// 1989 Pickle-Jar Bomb: a standard Sizzle hit on every monster at the all-monsters share (no tier in the spec: my call), then every monster that is
// Toasty (this hit left them so) also gets Five-Alarm Burn: a second burn each turn and 20% less Defense. A monster with Five-Alarm Burn still
// counts as Toasty for Detonations (the spec does not say: my call).
B3_SKILLS.pickle_jar_bomb_1989={id:'pickle_jar_bomb_1989',vibe:'boppy_pepper',slot:'s2',name:'1989 Pickle-Jar Bomb',pep:4,flavor:['sizzle'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'upgrade',from:'toasty',id:'five_alarm',to:'foes'}],line:null,
  short:'Hits every monster. Toasty ones burn twice as hard.',
  desc:'Hurls the prized 1989 pickled-pepper jar at the whole group: a standard Sizzle hit on every monster. Every Toasty monster turns up to Five-Alarm Burn: it burns twice as hard and has 20% less Defense.'};
// "The Hose Flinched": the burn (and every other damage-over-time tick) of a status Boppy put on can crit (`hoseFlinched`, engine/b3-resolve.js
// b3TickHit): the usual crit chance and damage.
B3_QUIRKS.the_hose_flinched={id:'the_hose_flinched',vibe:'boppy_pepper',name:'“The Hose Flinched”',
  custom:'hoseFlinched',n:{},
  desc:'The garden is so hot that the burns Boppy puts on can land critical hits.'};
// The Ghost One That Looks Back: a heavy Sizzle hit on every monster (the tier is my call, the same as Konami Code), then two full burn ticks at
// once on each monster, which stay on (every damage-over-time status of Sizzle: Toasty and Five-Alarm Burn; the ticks can crit with the Hose Quirk).
B3_SKILLS.the_ghost_one_that_looks_back={id:'the_ghost_one_that_looks_back',vibe:'boppy_pepper',slot:'cap',name:'The Ghost One That Looks Back',pep:6,flavor:['sizzle'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'tick',n:2,flavor:'sizzle',to:'foes'}],line:null,
  short:'Heavy hit on every monster. Their burns go off twice.',
  desc:'Boppy lets the forbidden ghost pepper out of the back garden: a heavy Sizzle cone hits every monster, then every burn on them ticks twice at once. The burns stay on.'};
// "No Reach for Water": when Boppy's hit sets off Steam Cloud!, he gets 2 Pep, once a round (my call: only his own Detonations count).
B3_QUIRKS.no_reach_for_water={id:'no_reach_for_water',vibe:'boppy_pepper',name:'No Reach for Water',
  on:'detonation',carrier:'source',ids:['steam_cloud'],limit:'round',show:true,effects:[{op:'pep',n:2,to:'self'}],
  desc:'Boppy will not lose a spice contest. When his hit sets off Steam Cloud!, he gets 2 Pep (once a round).'};

// ---- Boat Angler (third Vibe, stage 19; sig 0) ----
B3_VIBES.boppy_angler={id:'boppy_angler',owner:'boppy',name:'Boat Angler',sig:0,lean:'striker',
  subtitles:['Deckhand Fibber','Long Island Sound Skipper','Admiral of the Big One'],
  trait:'it_was_this_big',basic:'choppy_water_cast',skills:['lead_sinker_boat_slam','trophy_striper_haul','long_island_sound_leviathan'],
  quirks:['lucky_boat_lure_2006','star_in_graces_key'],
  counter:{id:'tally',name:'Whopper Tally',max:4,on:'actionEnd',carrier:'source',skillVibe:'boppy_angler',n:1}};
// "It Was THIS Big!": every Angler move (the Basic too) adds 1 Whopper Tally, 4 at most. The widening is on Trophy Striper Haul (`widen`), the
// growing is on the Leviathan (`bonus` that spends it). It builds while Angler is his Main Vibe, or his Pocket Vibe with a Skill that reads it.
B3_TRAITS.it_was_this_big={id:'it_was_this_big',vibe:'boppy_angler',name:'"It Was THIS Big!"',viaVibe:true,
  desc:'Each Boat Angler move adds 1 Whopper Tally, 4 at most. At 2 or more his Trophy Striper Haul reaches every monster, and the Leviathan grows with every Tally.'};
B3_SKILLS.choppy_water_cast={id:'choppy_water_cast',vibe:'boppy_angler',slot:'basic',name:'Choppy-Water Cast',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'row',row:'front',to:'target'}],line:null,
  short:'Light Drench hit. Hooks a back-row monster forward.',
  desc:'Light Drench hit. A monster in the Back row is hooked into the Front row.'};
// Lead-Sinker Boat Slam: standard Clobber (my call: the spec says "heavy" in words but prices it at 2 Pep), +20% against a Drenched or hooked monster.
B3_SKILLS.lead_sinker_boat_slam={id:'lead_sinker_boat_slam',vibe:'boppy_angler',slot:'s1',name:'Lead-Sinker Boat Slam',pep:2,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetHas',ids:['drenched','hooked'],add:.20}}],line:null,
  short:'Standard hit, +20% on a Drenched or hooked monster.',
  desc:'Standard Clobber hit with the heavy sinker. 20% more damage on a Drenched monster or one that was hooked.'};
B3_SKILLS.trophy_striper_haul={id:'trophy_striper_haul',vibe:'boppy_angler',slot:'s2',name:'Trophy Striper Haul',pep:4,flavor:['drench','clobber'],power:'standard',hits:1,
  target:'foe_row',widen:{counter:'tally',min:2},counter:'tally',tags:[],composure:0,effects:[{op:'damage'}],line:null,
  short:'Hits a row. Every monster at Tally 2 or more.',
  desc:'Hauls a cooler-sized striped bass over the rail: a standard Drench and Clobber hit on one row of monsters, or on every monster once the Whopper Tally is 2 or more. The Drench leaves them Drenched.'};
// Leviathan: heavy Drench on every monster, needs Tally 2, +25% for every Tally, which it spends. 2 Composure pips on each monster.
B3_SKILLS.long_island_sound_leviathan={id:'long_island_sound_leviathan',vibe:'boppy_angler',slot:'cap',name:'Long Island Sound Leviathan',pep:6,flavor:['drench'],power:'heavy',hits:1,
  target:'all_foes',needs:{counter:'tally',min:2},counter:'tally',tags:[],composure:0,
  effects:[{op:'damage',bonus:{counter:'tally',add:.25,spend:true}},{op:'composure',n:2,to:'target'}],line:null,
  short:'Needs Tally 2. Heavy hit on all, +25% per Tally.',
  desc:'Needs 2 or more Whopper Tally and spends it all. A heavy Drench hit on every monster, 25% stronger for every Tally spent, and 2 Composure pips off each.'};
// 2006 Lucky Boat Lure: when Boppy pulls or pushes a monster on the turn bar, or hooks it into the Front row, 1 more Composure pip comes off it and it is Drenched.
B3_QUIRKS.lucky_boat_lure_2006={id:'lucky_boat_lure_2006',vibe:'boppy_angler',name:'2006 Lucky Boat Lure',
  listen:[{on:'barMoved',carrier:'source',tgtFoe:true,limit:'action',limitKey:'lure',show:true,effects:[{op:'composure',n:1,to:'target'},{op:'prime',id:'drenched',to:'target'}]},
    {on:'rowMoved',carrier:'source',tgtFoe:true,limit:'action',limitKey:'lure',show:true,effects:[{op:'composure',n:1,to:'target'},{op:'prime',id:'drenched',to:'target'}]}],
  desc:'When Boppy moves a monster on the turn bar or hooks it forward, 1 more Composure pip comes off it and it is Drenched (once an action).'};
// Star in Grace's Key: every Portable Counter Boppy keeps starts the fight at 2 (the `counter` op's id '*').
B3_QUIRKS.star_in_graces_key={id:'star_in_graces_key',vibe:'boppy_angler',name:'Star in Grace\u2019s Key',
  on:'battleStart',show:true,effects:[{op:'counter',id:'*',n:2,to:'self'}],
  desc:'Boppy starts every battle with 2 stacks of any stacking job meter he has going.'};
