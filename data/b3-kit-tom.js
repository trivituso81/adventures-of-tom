'use strict';
// data/b3-kit-tom.js — Battle 3 kit: Tom (spec section 3.1). Built so far: Frequent Flier's Basic, Skill 1 and Skill 2.
// The Vibe row names every Skill, Trait and Quirk from the spec; a move exists in a fight once its own row is in B3_SKILLS.
B3_CAST.tom={id:'tom',name:'Tom',vibes:['tom_flier'],stat:{hp:1,atk:1,def:1,spd:1}};
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
