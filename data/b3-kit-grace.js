'use strict';
// data/b3-kit-grace.js — Battle 3 kit: Grace (spec section 3.2). Built: all of Squishy Collector (stage 5a) and all of Craft
// Artist (stage 5b). A Trait or Quirk row marked `soon:true` has a name and a sentence but no rule yet.
B3_CAST.grace={id:'grace',name:'Grace',vibes:['grace_squishy','grace_craft'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.grace_squishy={id:'grace_squishy',owner:'grace',name:'Squishy Collector',sig:1,lean:'tempo',
  subtitles:['NeeDoh Molder','Dumpling Squeezer','Golden Squishy Keeper'],
  trait:'sensory_satisfying',basic:'soup_dumpling_squeeze',skills:['needoh_stretch_pass','crunchy_sugar_cube_pop','colossal_diamond_gold_dumpling'],
  quirks:['slow_rise_memory_foam','ultra_rare_limited_edition'],counter:null};
B3_SKILLS.soup_dumpling_squeeze={id:'soup_dumpling_squeeze',vibe:'grace_squishy',slot:'basic',name:'Soup-Dumpling Squeeze',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'squished',to:'target'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Light Clobber hit. The next other family member to hit that monster gains 1 Pep.'};
B3_SKILLS.needoh_stretch_pass={id:'needoh_stretch_pass',vibe:'grace_squishy',slot:'s1',name:'NeeDoh Stretch Pass',pep:3,flavor:['support'],power:0,hits:0,
  target:'ally',tags:[],composure:0,effects:[{op:'place',where:'next'},{op:'status',id:'stress_melted',to:'target'}],line:null,anim:{kind:'default',shape:'give'},
  desc:'Pulls one family member up the turn bar to act right after Grace, with 20% more Speed for 2 turns. Once a round for each person.'};
// Crunchy Sugar-Cube Pop: 4 Pep and the full 30-tick push (decision 3 in claude/battle-v11-decisions.md). Light power is my call:
// the spec names no damage tier, and the cancel and the push are what the 4 Pep buys.
B3_SKILLS.crunchy_sugar_cube_pop={id:'crunchy_sugar_cube_pop',vibe:'grace_squishy',slot:'s2',name:'Crunchy Sugar-Cube Pop',pep:4,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'interrupt',to:'target'},{op:'push',n:30,to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Racket hit. Cancels the attack a monster is winding up and pushes it 30 ticks back on the turn bar.'};

// Colossal Diamond-Gold Dumpling (Grand Capstone): one family member takes a Skill of 4 Pep or less at once, for free, and
// Grace and that member each gain 1 Pep (spec 3.2). It is their one granted action of the round (spec 2.2): someone who
// already had one, or who has no such Skill to use, cannot be chosen. My call: "any skill" means a Skill, never the Basic.
B3_SKILLS.colossal_diamond_gold_dumpling={id:'colossal_diamond_gold_dumpling',vibe:'grace_squishy',slot:'cap',name:'Colossal Diamond-Gold Dumpling',pep:6,flavor:['support'],power:0,hits:0,
  target:'ally',tags:[],composure:0,effects:[{op:'pep',n:1,to:'self'},{op:'pep',n:1,to:'target'},{op:'grant',maxPep:4,free:true,to:'target'}],line:null,anim:{kind:'default',shape:'give'},
  desc:'One family member uses a Skill of 4 Pep or less right now, for free, without losing their place on the turn bar. Grace and that family member each gain 1 Pep. Once a round for each person.'};
// Sensory Satisfying: judged as Grace's turn ends. If the very next face on the turn bar is family, they get So Satisfying
// for their next turn. My call: "skill potency" is damage dealt and heals and shields given.
B3_TRAITS.sensory_satisfying={id:'sensory_satisfying',vibe:'grace_squishy',name:'Sensory Satisfying',
  on:'turnEnd',carrier:'source',effects:[{op:'status',id:'so_satisfying',to:'nextIfAlly'}],
  desc:'If a family member is next on the turn bar when Grace finishes her turn, their next turn hits 15% harder and heals 15% more.'};
// Slow-Rise Memory Foam: any push, pull or pass Grace causes counts, a Hydro-Slip! she sets off included.
B3_QUIRKS.slow_rise_memory_foam={id:'slow_rise_memory_foam',vibe:'grace_squishy',name:'Slow-Rise Memory Foam',
  on:'barMoved',carrier:'source',effects:[{op:'status',id:'memory_foam',to:'self'}],
  desc:'When Grace moves anyone on the turn bar, she gets 15% Evasion until her next turn.'};
// Ultra-Rare Limited Edition: a Skill aimed at a family member (NeeDoh Stretch Pass, the Dumpling, Pick-Me-Up), not a Basic.
B3_QUIRKS.ultra_rare_limited_edition={id:'ultra_rare_limited_edition',vibe:'grace_squishy',name:'Ultra-Rare Limited Edition',
  mods:[{stat:'moveRec',kind:'ultraRare',v:-.30,when:{allySkill:true}}],
  desc:'Grace waits 30% less after a Skill she uses on a family member.'};

// ---- Craft Artist (second Sig Vibe) ----
B3_VIBES.grace_craft={id:'grace_craft',owner:'grace',name:'Craft Artist',sig:2,lean:'striker',
  subtitles:['Finger-Paint Dabbler','Serial Bedazzler','Grand Mixed-Media Master'],
  trait:'creative_mess',basic:'glitter_brush_flick',skills:['open_string_violin_screech','bedazzle_gun_glue_trap','masterpiece_portrait_makeover'],
  quirks:['permanent_marker','double_coat'],counter:null};
// Creative Mess: 25% of the damage the action dealt to that monster (a standard hit's worth when it dealt none: a hazard's Fatigue)
// splashes as Razzle onto the monsters next to it. A Prime and a debuff put on the same monster in one action splash once
// (`limit:'actionTarget'`, shared by both listeners through `limitKey`). A mark (Squished, a Winged Shell) is not a debuff.
B3_TRAITS.creative_mess={id:'creative_mess',vibe:'grace_craft',name:'Creative Mess',
  listen:[{on:'primeApplied',carrier:'source',tgtFoe:true,limit:'actionTarget',limitKey:'creative_mess',effects:[{op:'splash',flavor:'razzle',share:.25,to:'adjacent',of:'dealt'}]},
    {on:'statusApplied',carrier:'source',tgtFoe:true,kinds:['debuff'],limit:'actionTarget',limitKey:'creative_mess',effects:[{op:'splash',flavor:'razzle',share:.25,to:'adjacent',of:'dealt'}]}],
  desc:'When Grace puts a Prime or a debuff on a monster, the monsters next to it take a 25% Razzle splash.'};
// Permanent Marker: a mod on Grace, read when a Prime goes on (engine/b3-core.js b3AddStatus): 1 more of the monster's turns.
B3_QUIRKS.permanent_marker={id:'permanent_marker',vibe:'grace_craft',name:'Permanent Marker',
  mods:[{stat:'primeTurns',kind:'marker',v:1}],
  desc:'A Prime Grace puts on a monster lasts 1 more of its turns.'};
// Double Coat (the one-off, engine/b3-custom.js): Grace remembers the flavor of her last move. A Razzle move after a Racket move,
// or a Racket move after a Razzle move, takes 1 Composure pip off every monster it hit, free. My calls: her Basic counts as a
// move, and a move of any other flavor in between (Glue Trap's Sizzle, a Support move) starts the count again.
B3_QUIRKS.double_coat={id:'double_coat',vibe:'grace_craft',name:'Double Coat',
  custom:'doubleCoat',n:{pips:1},
  desc:'When Grace follows a Razzle Skill with a Racket Skill, or the other way round, the second one knocks 1 Composure pip off for free.'};
B3_SKILLS.glitter_brush_flick={id:'glitter_brush_flick',vibe:'grace_craft',slot:'basic',name:'Glitter-Brush Flick',pep:0,flavor:['razzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,anim:{kind:'default',shape:'throw'},
  desc:'Light Razzle hit. Leaves the monster Dazzled.'};
// Open-String Violin Screech: standard power at the all-monsters share (70%). It sets off Dazzled by the normal Racket rule.
B3_SKILLS.open_string_violin_screech={id:'open_string_violin_screech',vibe:'grace_craft',slot:'s1',name:'Open-String Violin Screech',pep:3,flavor:['racket'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'off_key',to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Racket hit on every monster. Each one it hits has 20% less Attack for 2 turns. It sets off Dazzled.'};
// Bedazzle-Gun Glue Trap: lays the Glue Trap hazard (data/b3-status.js) on the monsters' floor for 2 rounds.
B3_SKILLS.bedazzle_gun_glue_trap={id:'bedazzle_gun_glue_trap',vibe:'grace_craft',slot:'s2',name:'Bedazzle-Gun Glue Trap',pep:4,flavor:['sizzle'],power:0,hits:0,
  target:'field',tags:[],composure:0,effects:[{op:'hazard',id:'glue_trap'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Covers the monsters\u2019 floor in hot glue and rhinestones for 2 rounds. Every monster that acts takes a light Sizzle and Razzle hit and waits 20% longer after its move.'};
// Masterpiece Portrait Makeover (Grand Capstone): heavy Razzle on one monster, then Razzle becomes one of its Pet Peeves for 2 of
// its turns. The damage comes first, so the blast itself does not use the weakness (my call: the spec says "forcing temporary
// weakness", which is for the hits that follow).
B3_SKILLS.masterpiece_portrait_makeover={id:'masterpiece_portrait_makeover',vibe:'grace_craft',slot:'cap',name:'Masterpiece Portrait Makeover',pep:5,flavor:['razzle'],power:'heavy',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'razzle_weak',to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Heavy Razzle hit. For 2 of its turns Razzle is one of that monster\u2019s Pet Peeves: Razzle hits do 50% more and knock a Composure pip off.'};
