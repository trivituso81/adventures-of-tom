'use strict';
// data/b3-kit-deedee.js — Battle 3 kit: Deedee (spec section 3.5). Stage 1: Neat Freak's Basic.
B3_CAST.deedee={id:'deedee',name:'Deedee',vibes:['deedee_neat'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.deedee_neat={id:'deedee_neat',owner:'deedee',name:'Neat Freak',sig:1,lean:'tempo',
  subtitles:['Crumb Spotter','Mop Marshal','Supreme Dust Terminator'],
  trait:'spotless_floor',basic:'windex_spritz',skills:['wet_floor_hazard','hand_me_my_glasses_scrub','fifty_year_dust_tsunami'],
  quirks:['car_crumb_vacuum','spit_shine'],counter:null};
B3_SKILLS.windex_spritz={id:'windex_spritz',vibe:'deedee_neat',slot:'basic',name:'Windex Spritz',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'windexed',to:'target'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Light Drench hit. Leaves the monster Drenched, and its attacks miss 15% of the time for 2 turns.'};
