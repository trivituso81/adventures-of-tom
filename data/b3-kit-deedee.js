'use strict';
// data/b3-kit-deedee.js — Battle 3 kit: Deedee (spec section 3.5). Built so far: Neat Freak's Basic, Skill 1 and Skill 2.
B3_CAST.deedee={id:'deedee',name:'Deedee',vibes:['deedee_neat'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.deedee_neat={id:'deedee_neat',owner:'deedee',name:'Neat Freak',sig:1,lean:'tempo',
  subtitles:['Crumb Spotter','Mop Marshal','Supreme Dust Terminator'],
  trait:'spotless_floor',basic:'windex_spritz',skills:['wet_floor_hazard','hand_me_my_glasses_scrub','fifty_year_dust_tsunami'],
  quirks:['car_crumb_vacuum','spit_shine'],counter:null};
B3_SKILLS.windex_spritz={id:'windex_spritz',vibe:'deedee_neat',slot:'basic',name:'Windex Spritz',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'windexed',to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Drench hit. Leaves the monster Drenched, and its attacks miss 15% of the time for 2 turns.'};
B3_SKILLS.wet_floor_hazard={id:'wet_floor_hazard',vibe:'deedee_neat',slot:'s1',name:'Wet-Floor Hazard',pep:3,flavor:['drench'],power:0,hits:0,
  target:'field',tags:[],composure:0,effects:[{op:'hazard',id:'wet_floor'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Mops the monsters\u2019 floor. The next 2 monsters to use a melee attack slip: a light Clobber fall, and that attack does 25% less damage.'};
// "Hand Me My Glasses" Scrub: every buff comes off first, then one standard Clobber hit that is 25% stronger for each buff removed
// (my call: the spec's "+25% Drench dmg/buff removed" is added to this Skill's own hit, which the spec lists as Clobber).
B3_SKILLS.hand_me_my_glasses_scrub={id:'hand_me_my_glasses_scrub',vibe:'deedee_neat',slot:'s2',name:'"Hand Me My Glasses" Scrub',pep:4,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'strip',kind:'buff',all:true,to:'target'},{op:'damage',bonus:{per:'stripped',add:.25}}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Scrubs every buff off one monster, then a Clobber hit that is 25% stronger for each buff scrubbed away.'};
