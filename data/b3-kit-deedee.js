'use strict';
// data/b3-kit-deedee.js — Battle 3 kit: Deedee (spec section 3.5). Built so far: all of Neat Freak (stage 5a wrote its Trait, both
// Quirks and its Grand Capstone); Registered Nut's Basic and Skill 1. Trait and Quirk rows marked `soon:true` have a name and
// a sentence but no rule yet (stage 5b).
B3_CAST.deedee={id:'deedee',name:'Deedee',vibes:['deedee_neat','deedee_nurse','deedee_cook'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.deedee_neat={id:'deedee_neat',owner:'deedee',name:'Neat Freak',sig:1,lean:'tempo',
  subtitles:['Crumb Spotter','Mop Marshal','Supreme Dust Terminator'],
  trait:'spotless_floor',basic:'windex_spritz',skills:['wet_floor_hazard','hand_me_my_glasses_scrub','fifty_year_dust_tsunami'],
  quirks:['car_crumb_vacuum','spit_shine'],counter:null};
B3_SKILLS.windex_spritz={id:'windex_spritz',vibe:'deedee_neat',slot:'basic',name:'Windex Spritz',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'windexed',to:'target'}],line:null,
  short:'Light hit. Leaves it Drenched, so it misses more.',
  desc:'Light Drench hit. Leaves the monster Drenched, and its attacks miss 15% of the time for 2 turns.'};
B3_SKILLS.wet_floor_hazard={id:'wet_floor_hazard',vibe:'deedee_neat',slot:'s1',name:'Wet-Floor Hazard',pep:3,flavor:['drench'],power:0,hits:0,
  target:'field',tags:[],composure:0,effects:[{op:'hazard',id:'wet_floor'}],line:null,
  short:'The next 2 monsters to attack up close slip and fall.',
  desc:'Mops the monsters\u2019 floor. The next 2 monsters to use a melee attack slip: a light Clobber fall, and that attack does 25% less damage.'};
// "Hand Me My Glasses" Scrub: every buff comes off first, then one standard Clobber hit that is 25% stronger for each buff removed
// (my call: the spec's "+25% Drench dmg/buff removed" is added to this Skill's own hit, which the spec lists as Clobber).
B3_SKILLS.hand_me_my_glasses_scrub={id:'hand_me_my_glasses_scrub',vibe:'deedee_neat',slot:'s2',name:'"Hand Me My Glasses" Scrub',pep:4,flavor:['clobber'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'strip',kind:'buff',all:true,to:'target'},{op:'damage',bonus:{per:'stripped',add:.25}}],line:null,
  short:'Scrubs off its boosts, then hits harder for each one.',
  desc:'Scrubs every buff off one monster, then a Clobber hit that is 25% stronger for each buff scrubbed away.'};

// Fifty-Year Dust Tsunami (Grand Capstone): the wave scrubs first (every buff off every monster, and whatever the monsters laid
// on the family's floor), then hits. The spec names no damage tier; my call is heavy at the all-monsters share, the same as the
// other 5 Pep Capstone that does print one (Tarmac Porsche Transfer). Its Drench leaves every monster it hits Drenched by the
// normal rule (not one whose Toasty it set off: spec 2.5).
B3_SKILLS.fifty_year_dust_tsunami={id:'fifty_year_dust_tsunami',vibe:'deedee_neat',slot:'cap',name:'Fifty-Year Dust Tsunami',pep:5,flavor:['drench'],power:'heavy',hits:1,
  target:'all_foes',tags:[],composure:0,effects:[{op:'strip',kind:'buff',all:true,to:'target'},{op:'strip',kind:'hazard'},{op:'damage'}],line:null,
  short:'Scrubs every monster clean, then a heavy wave Drenches all.',
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
// Forty Years a Nurse: the overheal rule lives in the heal op (engine/b3-ops.js), switched on by this row's `custom`. Of the healing
// that goes past full HP, `share` becomes a shield, no more than `cap` of the target's Max HP at once. Heals only; a regen tick is not a heal.
B3_TRAITS.forty_years_a_nurse={id:'forty_years_a_nurse',vibe:'deedee_nurse',name:'Forty Years a Nurse',
  custom:'cleanBill',n:{share:.5,cap:.25},
  desc:'Half of any healing past full HP becomes a Clean Bill Shield, up to 25% of Max HP.'};
// First-Ring Pickup: -1 Pep on a Skill aimed at one family member who is still up and under half HP; a cost never goes below 1 (b3Cost).
B3_QUIRKS.first_ring_pickup={id:'first_ring_pickup',vibe:'deedee_nurse',name:'First-Ring Pickup',
  mods:[{stat:'cost',kind:'firstRing',v:-1,when:{tgtBelow:.5}}],
  desc:'Skills Deedee uses on a family member under half HP cost 1 Pep less, never below 1.'};
// Warm Beats Cold: Stun and Slow never land on her (engine/b3-ops.js b3PutStatus), and a cleanse of hers that took something off heals her.
B3_QUIRKS.warm_beats_cold={id:'warm_beats_cold',vibe:'deedee_nurse',name:'"Warm Beats Cold"',
  immune:['stun','slow'],on:'cleansed',carrier:'source',show:true,effects:[{op:'heal',pct:.10,to:'self'}],
  desc:'Deedee cannot be Stunned or Slowed. When she cleanses a family member, she heals 10% of her own HP.'};
B3_SKILLS.little_pinch_syringe_poke={id:'little_pinch_syringe_poke',vibe:'deedee_nurse',slot:'basic',name:'"Little Pinch!" Syringe Poke',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'pinched',to:'target'}],line:null,
  short:'Light jab. For 1 turn, it takes big hits more often.',
  desc:'Light Clobber jab. Attacks against that monster crit 15% more often for 1 turn.'};
// Deedee Makes It Better: the spec's "snappy single heal" has no size, so it is the standard heal (20% of Max HP). She can use it
// on herself. The +20% Attack lands only when the cleanse cleared something, and lasts the common 2 turns (my call).
B3_SKILLS.deedee_makes_it_better={id:'deedee_makes_it_better',vibe:'deedee_nurse',slot:'s1',name:'Deedee Makes It Better',pep:2,flavor:['support'],power:0,hits:0,
  target:'family',tags:[],composure:0,effects:[{op:'heal',pct:'standard'},{op:'cleanse'},{op:'status',id:'all_better',when:'cleansed'}],line:null,
  short:'Heals one family member and clears their bad effects.',
  desc:'Heals one family member for 20% of their HP and clears every debuff on them. If something was cleared, they get 20% more Attack for 2 turns.'};

// "Bring a Jacket!" Ward: the pick and the family member with the smallest share of HP left (target kind ally_pair). The Extra Jacket status
// regens 20% of Max HP over its 3 turns and holds the first knock-out at 1 HP (data/b3-status.js). 3-round cooldown.
B3_SKILLS.bring_a_jacket_ward={id:'bring_a_jacket_ward',vibe:'deedee_nurse',slot:'s2',name:'"Bring a Jacket!" Ward',pep:4,flavor:['support'],power:0,hits:0,
  target:'ally_pair',tags:[],composure:0,cooldown:3,
  effects:[{op:'status',id:'jacket',to:'target'}],line:null,
  short:'Two family members heal each turn and survive one big hit.',
  desc:'Deedee bundles two family members in extra jackets: the one you pick and whoever is hurt most. They heal a little each turn for 3 turns, and the first hit that would knock them out leaves them on 1 HP. Deedee needs 3 rounds before she can do it again.'};
// To the Moon & Back (Grand Capstone): a knocked-out family member comes back at 80% HP, anyone else heals to full. Then a heavy Sizzle
// wave at the all-monsters share hits every monster and shaves 2 Composure (the spec says "warm Sizzle shockwave shaving 2 Composure"; the tier is my call).
B3_SKILLS.to_the_moon_and_back={id:'to_the_moon_and_back',vibe:'deedee_nurse',slot:'cap',name:'To the Moon & Back',pep:6,flavor:['sizzle'],power:0,hits:0,
  target:'family_or_ko',tags:[],composure:2,
  effects:[{op:'revive',hp:.80,to:'target'},{op:'heal',pct:1,to:'target',when:'notRevived'},{op:'damage',flavor:['sizzle'],power:'heavy',aoe:true,to:'foes'}],
  line:null,
  short:'Revives or fully heals one, then hits every monster.',
  desc:'A full moon rises. A knocked-out family member gets back up with 80% of their HP; anyone else heals all the way. Then a heavy wave of Sizzle warmth hits every monster and knocks 2 Composure off each.'};

// ---- Home Cook (third Vibe, stage 19; sig 0) ----
B3_VIBES.deedee_cook={id:'deedee_cook',owner:'deedee',name:'Home Cook',sig:0,lean:'support',
  subtitles:['Muffin-Tin Baker','Sunday-Roast Pro','Holiday Feast Matriarch'],
  trait:'did_you_eat',basic:'wooden_spoon_taste_test',skills:['warm_apple_muffins','wine_o_clock_pour','full_house_sunday_dinner'],
  quirks:['tupperware_send_off','everything_gives_me_gas'],counter:null};
// "Did You Eat?": the Trait gives the whole family a mod that counts only while that family member is Stuffed (`allyMods`).
B3_TRAITS.did_you_eat={id:'did_you_eat',vibe:'deedee_cook',name:'"Did You Eat?"',
  allyMods:[{stat:'out',kind:'fed',v:.15,when:{has:['stuffed','stuffed_ward']}},{stat:'reduce',kind:'fed',v:.10,when:{has:['stuffed','stuffed_ward']}}],
  desc:'Nobody leaves the kitchen hungry: a family member who is Stuffed deals 15% more damage and takes 10% less.'};
B3_SKILLS.wooden_spoon_taste_test={id:'wooden_spoon_taste_test',vibe:'deedee_cook',slot:'basic',name:'Wooden-Spoon Taste Test',pep:0,flavor:['sizzle'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'stuffed',to:'randomAlly'}],line:null,
  short:'Light hit. A random family member gets Stuffed.',
  desc:'Light Sizzle smack with the wooden spoon. A random family member gets a sample and is Stuffed for 2 turns.'};
B3_SKILLS.warm_apple_muffins={id:'warm_apple_muffins',vibe:'deedee_cook',slot:'s1',name:'Warm Apple Muffins',pep:3,flavor:['sizzle'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,effects:[{op:'heal',pct:'party',to:'allies'},{op:'status',id:'stuffed_ward',to:'allies'}],line:null,
  short:'Heals the family. Stuffed: burns up-close attackers.',
  desc:'A tin of warm cinnamon-apple muffins: a party heal, and everyone is Stuffed for 2 turns. A monster that hits a Stuffed family member up close takes a light Sizzle burn.'};
// Wine O'Clock Pour: a light Drench hit on one row of monsters (10% less Evasion for a turn). The spec's +2 Pep goes to "target ally"; there is no
// ally in a row target, so my call is the family member (Deedee too) with the least Pep.
B3_SKILLS.wine_o_clock_pour={id:'wine_o_clock_pour',vibe:'deedee_cook',slot:'s2',name:'Wine O\u2019Clock Pour',pep:3,flavor:['drench'],power:'light',hits:1,
  target:'foe_row',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'tipsy',to:'target'},{op:'pep',n:2,to:'lowestPepAlly'}],line:null,
  short:'Drench a row, -10% Evasion. +2 Pep for the lowest.',
  desc:'A light Drench splash on one row of monsters: 10% less Evasion for a turn. The family member with the least Pep gets 2 Pep.'};
B3_SKILLS.full_house_sunday_dinner={id:'full_house_sunday_dinner',vibe:'deedee_cook',slot:'cap',name:'Full-House Sunday Dinner',pep:6,flavor:['support'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,effects:[{op:'status',id:'sunday_dinner',to:'allies'}],line:null,
  short:'For 2 rounds, each turn starts with heal, Pep, boost.',
  desc:'Sets the table, with one extra place. For 2 rounds every family member\u2019s turn starts with a 15% heal, 1 Pep and a random boost (Attack, Defense or Speed).'};
// Tupperware Send-Off: a single heal or buff bounces at half size to a second family member, 35% of the time and always at 8 or more Pep (b3Tupperware, engine/b3-custom.js).
B3_QUIRKS.tupperware_send_off={id:'tupperware_send_off',vibe:'deedee_cook',name:'Tupperware Send-Off',custom:'tupperware',n:{chance:.35,pep:8},
  desc:'A heal or buff Deedee gives one family member can bounce to a second at half size (35% of the time, always with 8 or more Pep).'};
B3_QUIRKS.everything_gives_me_gas={id:'everything_gives_me_gas',vibe:'deedee_cook',name:'"Everything Gives Me Gas"',
  on:'statusEnded',ids:['stuffed','stuffed_ward'],show:true,effects:[{op:'pep',n:1,to:'target'}],
  desc:'When Stuffed runs out on a family member, it bursts: they get 1 Pep.'};
