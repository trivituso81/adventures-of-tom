'use strict';
// data/b3-kit-grace.js — Battle 3 kit: Grace (spec section 3.2). Built so far: Squishy Collector's Basic, Skill 1 and Skill 2.
B3_CAST.grace={id:'grace',name:'Grace',vibes:['grace_squishy'],stat:{hp:1,atk:1,def:1,spd:1}};
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
