'use strict';
// data/b3-kit-rose.js — Battle 3 kit: Rose (spec section 3.3). Built so far: Sugar Rush's Basic, Skill 1 and Skill 2;
// Cozy Rosie's Basic. Trait and Quirk rows marked `soon:true` have a name and a sentence but no rule yet (stage 5).
// A multi-hit move's `power` is the whole move's power, shared evenly by its hits (my call: the spec gives one tier per move).
B3_CAST.rose={id:'rose',name:'Rose',vibes:['rose_sugar','rose_cozy'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.rose_sugar={id:'rose_sugar',owner:'rose',name:'Sugar Rush',sig:1,lean:'striker',
  subtitles:['Ankle Tackler','Shoulder Jockey','Human Pinball'],
  trait:'bouncy_physics',basic:'lamb_tuck_ankle_tackle',skills:['the_floor_is_lava','giddyup_tata_launch','double_lamby_return_cart_blitz'],
  quirks:['twin_lamb_relay','its_our_longboard_now'],counter:null};
B3_SKILLS.lamb_tuck_ankle_tackle={id:'lamb_tuck_ankle_tackle',vibe:'rose_sugar',slot:'basic',name:'Lamb-Tuck Ankle Tackle',pep:0,flavor:['clobber'],power:'light',hits:2,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Two quick Clobber hits on one monster.'};
B3_SKILLS.the_floor_is_lava={id:'the_floor_is_lava',vibe:'rose_sugar',slot:'s1',name:'The Floor Is Lava!',pep:3,flavor:['clobber'],power:'standard',hits:3,
  target:'random_foes',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetHas',ids:['toasty','dazzled'],add:.25}}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Three Clobber hops onto random monsters. Each hop hits 25% harder on a Toasty or Dazzled monster.'};
// "Giddyup, Tata!" Launch: the spec's header says Sizzle and its text says "heavy Clobber + Sizzle friction", so it is a two-flavor
// move, Sizzle first (it leaves Toasty), heavy in total. My calls: the shoulders Rose climbs are the next family member due on the
// turn bar, and their +20% Attack lasts the common 2 turns.
B3_SKILLS.giddyup_tata_launch={id:'giddyup_tata_launch',vibe:'rose_sugar',slot:'s2',name:'"Giddyup, Tata!" Launch',pep:4,flavor:['sizzle','clobber'],power:'heavy',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'status',id:'giddyup',to:'nextAlly'},{op:'damage'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Rose climbs the next family member in line: they get 20% more Attack for 2 turns. Then she cannonballs one monster for a heavy Sizzle and Clobber hit.'};

B3_SOON.double_lamby_return_cart_blitz='Double-Lamby Return-Cart Blitz';
B3_TRAITS.bouncy_physics={id:'bouncy_physics',vibe:'rose_sugar',name:'Bouncy Physics',soon:true,
  desc:'Every hit of a move that hits more than once fills the Family Ruckus gauge 2% more.'};
B3_QUIRKS.twin_lamb_relay={id:'twin_lamb_relay',vibe:'rose_sugar',name:'Twin-Lamb Relay',soon:true,
  desc:'Backup Lamby tags in. On Rose’s moves that hit more than once, extras that ride on a hit go off on every hit, at 40% strength.'};
B3_QUIRKS.its_our_longboard_now={id:'its_our_longboard_now',vibe:'rose_sugar',name:'"It’s OUR Longboard Now"',soon:true,
  desc:'When Rose lands 3 or more hits in one turn, she gets 25% more Speed for 1 turn.'};

// ---- Cozy Rosie (second Sig Vibe) ----
B3_VIBES.rose_cozy={id:'rose_cozy',owner:'rose',name:'Cozy Rosie',sig:2,lean:'support',
  subtitles:['Blanket Burrito','Fort Architect','Keeper of the Two Lambies'],
  trait:'well_loved_original',basic:'pocket_pretzel_and_pat',skills:['tattered_lamby_boomerang','sofa_cushion_citadel','kingdom_of_ten_thousand_blankets'],
  quirks:['mint_condition_backup','emergency_stuffy_swap'],counter:null};
B3_SOON.tattered_lamby_boomerang='Tattered Lamby Boomerang';
B3_SOON.sofa_cushion_citadel='Sofa-Cushion Citadel';
B3_SOON.kingdom_of_ten_thousand_blankets='Kingdom of Ten-Thousand Blankets';
B3_TRAITS.well_loved_original={id:'well_loved_original',vibe:'rose_cozy',name:'Well-Loved Original',soon:true,
  desc:'Holding tattered Lamby gives Rose 1 Pep every 2 rounds.'};
B3_QUIRKS.mint_condition_backup={id:'mint_condition_backup',vibe:'rose_cozy',name:'Mint-Condition Backup',soon:true,
  desc:'Family members holding one of Rose’s shields are crit 20% less often.'};
B3_QUIRKS.emergency_stuffy_swap={id:'emergency_stuffy_swap',vibe:'rose_cozy',name:'Emergency Stuffy Swap',soon:true,
  desc:'When one of Rose’s shields breaks, Backup Lamby bonks the monster that broke it. Once a round.'};
// Pocket Pretzel & Pat: the pretzel goes to whoever in the family has the smallest share of their HP left, Rose included
// (my call: a six-year-old eats her own pretzel when she is the one who is hurt). A tiny heal is 5% of Max HP.
B3_SKILLS.pocket_pretzel_and_pat={id:'pocket_pretzel_and_pat',vibe:'rose_cozy',slot:'basic',name:'Pocket Pretzel & Pat',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'heal',pct:'tiny',to:'lowestAlly'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Light Clobber bonk with Lamby. Then a pocket pretzel for whoever in the family is hurt the most: a tiny heal.'};
