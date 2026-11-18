'use strict';
// data/b3-kit-tom.js — Battle 3 kit: Tom (spec section 3.1). Stage 1 holds his first Sig Vibe's row and its Basic.
// The Vibe row names every Skill, Trait and Quirk from the spec; a move exists in a fight once its own row is in B3_SKILLS.
B3_CAST.tom={id:'tom',name:'Tom',vibes:['tom_flier'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.tom_flier={id:'tom_flier',owner:'tom',name:'Frequent Flier',sig:1,lean:'guard',
  subtitles:['Sky Club Applicant','Diamond Medallion','Delta 360 VIP'],
  trait:'priority_boarding',basic:'lounge_pass_flex',skills:['zone_one_blockade','suite_door_slide','tarmac_porsche_transfer'],
  quirks:['upgrade_certificate','million_miler_status'],counter:null};
B3_SKILLS.lounge_pass_flex={id:'lounge_pass_flex',vibe:'tom_flier',slot:'basic',name:'Lounge Pass Flex',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'eyes_on_me',to:'self'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Racket hit. Eyes On Me: monsters aim at Tom more until his next turn ends.'};
