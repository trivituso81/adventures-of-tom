'use strict';
// data/b3-kit-deedee.js — Battle 3 kit: Deedee (spec section 3.5). Built so far: all of Neat Freak (stage 5a wrote its Trait, both
// Quirks and its Grand Capstone); Registered Nut's Basic and Skill 1. Trait and Quirk rows marked `soon:true` have a name and
// a sentence but no rule yet (stage 5b).
B3_CAST.deedee={id:'deedee',name:'Deedee',vibes:['deedee_neat','deedee_nurse'],stat:{hp:1,atk:1,def:1,spd:1}};
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

// Fifty-Year Dust Tsunami (Grand Capstone): the wave scrubs first (every buff off every monster, and whatever the monsters laid
// on the family's floor), then hits. The spec names no damage tier; my call is heavy at the all-monsters share, the same as the
// other 5 Pep Capstone that does print one (Tarmac Porsche Transfer). Its Drench leaves every monster it hits Drenched by the
// normal rule (not one whose Toasty it set off: spec 2.5).
B3_SKILLS.fifty_year_dust_tsunami={id:'fifty_year_dust_tsunami',vibe:'deedee_neat',slot:'cap',name:'Fifty-Year Dust Tsunami',pep:5,flavor:['drench'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'strip',kind:'buff',all:true,to:'target'},{op:'strip',kind:'hazard'},{op:'damage'}],line:null,anim:{kind:'default',shape:'cast'},
  desc:'Scrubs every buff off every monster and clears anything they left on the family\u2019s floor. Then a heavy Drench wave hits them all and leaves them Drenched.'};
// Spotless Floor: "a Drenched foe" is one that is Drenched when the pips come off, or whose Drenched this same action set off
// (Deedee's Scrub on a Drenched monster is a Hydro-Slip!, which uses the Drenched up before the pips are counted). The extra
// pip is inside the action's 3-pip cap. A slip on her Wet-Floor Hazard is her shave too.
B3_TRAITS.spotless_floor={id:'spotless_floor',vibe:'deedee_neat',name:'Spotless Floor',
  on:'pipsShaved',carrier:'source',targetPrime:'drenched',limit:'round',show:true,effects:[{op:'composure',n:1,to:'target'}],
  desc:'Once a round, the first time Deedee knocks Composure off a Drenched monster, 1 more pip comes off.'};
// Car-Crumb Vacuum: once per action however many buffs came off. A stance knocked off by her Panic Boil! counts as a buff.
B3_QUIRKS.car_crumb_vacuum={id:'car_crumb_vacuum',vibe:'deedee_neat',name:'Car-Crumb Vacuum',
  on:'buffStripped',carrier:'source',limit:'action',effects:[{op:'status',id:'crumb_free',to:'allies'}],
  desc:'When Deedee strips a buff or a hazard from the monsters, the whole family gets 15% more Attack for 1 turn.'};
// Spit Shine: a mark of its own on the monster, 2 of its turns like the Prime (my call: it stays if someone else sets the
// Drenched off with a different flavor). The next Clobber hit by another family member uses it up.
B3_QUIRKS.spit_shine={id:'spit_shine',vibe:'deedee_neat',name:'Spit Shine',
  on:'primeApplied',carrier:'source',ids:['drenched'],effects:[{op:'status',id:'spit_shine',to:'target'}],
  desc:'A monster Deedee leaves Drenched takes 30% more damage from the next Clobber hit by someone else in the family.'};

// ---- Registered Nut (second Sig Vibe) ----
B3_VIBES.deedee_nurse={id:'deedee_nurse',owner:'deedee',name:'Registered Nut',sig:2,lean:'support',
  subtitles:['Band-Aid Dispenser','Forty-Year Floor Nurse','Matron of Moon & Back'],
  trait:'forty_years_a_nurse',basic:'little_pinch_syringe_poke',skills:['deedee_makes_it_better','bring_a_jacket_ward','to_the_moon_and_back'],
  quirks:['first_ring_pickup','warm_beats_cold'],counter:null};
B3_SOON.bring_a_jacket_ward='"Bring a Jacket!" Ward';
B3_SOON.to_the_moon_and_back='To the Moon & Back';
B3_TRAITS.forty_years_a_nurse={id:'forty_years_a_nurse',vibe:'deedee_nurse',name:'Forty Years a Nurse',soon:true,
  desc:'Half of any healing past full HP becomes a Clean Bill Shield, up to 25% of Max HP.'};
B3_QUIRKS.first_ring_pickup={id:'first_ring_pickup',vibe:'deedee_nurse',name:'First-Ring Pickup',soon:true,
  desc:'Skills Deedee uses on a family member under half HP cost 1 Pep less, never below 1.'};
B3_QUIRKS.warm_beats_cold={id:'warm_beats_cold',vibe:'deedee_nurse',name:'"Warm Beats Cold"',soon:true,
  desc:'Deedee cannot be Stunned or Slowed. When she cleanses a family member, she heals 10% of her own HP.'};
B3_SKILLS.little_pinch_syringe_poke={id:'little_pinch_syringe_poke',vibe:'deedee_nurse',slot:'basic',name:'"Little Pinch!" Syringe Poke',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'pinched',to:'target'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Light Clobber jab. Attacks against that monster crit 15% more often for 1 turn.'};
// Deedee Makes It Better: the spec's "snappy single heal" has no size, so it is the standard heal (20% of Max HP). She can use it
// on herself. The +20% Attack lands only when the cleanse cleared something, and lasts the common 2 turns (my call).
B3_SKILLS.deedee_makes_it_better={id:'deedee_makes_it_better',vibe:'deedee_nurse',slot:'s1',name:'Deedee Makes It Better',pep:2,flavor:['support'],power:0,hits:0,
  target:'family',tags:[],composure:0,effects:[{op:'heal',pct:'standard'},{op:'cleanse'},{op:'status',id:'all_better',when:'cleansed'}],line:null,anim:{kind:'default',shape:'give'},
  desc:'Heals one family member for 20% of their HP and clears every debuff on them. If something was cleared, they get 20% more Attack for 2 turns.'};
