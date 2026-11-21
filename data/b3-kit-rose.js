'use strict';
// data/b3-kit-rose.js — Battle 3 kit: Rose (spec section 3.3). Built so far: all of Sugar Rush (stage 5a wrote its Trait, both
// Quirks and its Grand Capstone); Cozy Rosie's Basic. Trait and Quirk rows marked `soon:true` have a name and a sentence but
// no rule yet (stage 5b).
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
  target:'random_foes',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetHas',ids:['toasty','dazzled'],add:.25}}],line:null,anim:{kind:'clip',clip:'rose_lava',shape:'strike'},
  desc:'Three Clobber hops onto random monsters. Each hop hits 25% harder on a Toasty or Dazzled monster.'};
// "Giddyup, Tata!" Launch: the spec's header says Sizzle and its text says "heavy Clobber + Sizzle friction", so it is a two-flavor
// move, Sizzle first (it leaves Toasty), heavy in total. My calls: the shoulders Rose climbs are the next family member due on the
// turn bar, and their +20% Attack lasts the common 2 turns.
B3_SKILLS.giddyup_tata_launch={id:'giddyup_tata_launch',vibe:'rose_sugar',slot:'s2',name:'"Giddyup, Tata!" Launch',pep:4,flavor:['sizzle','clobber'],power:'heavy',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'status',id:'giddyup',to:'nextAlly'},{op:'damage'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Rose climbs the next family member in line: they get 20% more Attack for 2 turns. Then she cannonballs one monster for a heavy Sizzle and Clobber hit.'};

// Double-Lamby Return-Cart Blitz (Grand Capstone): six ricochet hits on random monsters, capstone power shared by the six.
// "+10% escalating dmg/hit vs Flustered": a hit that lands on a Flustered monster is 10% stronger for every hit of the move so
// far (the 1st +10%, the 6th +60%).
B3_SKILLS.double_lamby_return_cart_blitz={id:'double_lamby_return_cart_blitz',vibe:'rose_sugar',slot:'cap',name:'Double-Lamby Return-Cart Blitz',pep:6,flavor:['clobber'],power:'capstone',hits:6,
  target:'random_foes',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetHas',ids:['flustered'],add:.10,grow:true}}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Six Clobber ricochets onto random monsters. On a Flustered monster each one hits harder than the last: 10% more for the 1st, up to 60% more for the 6th.'};
// Bouncy Physics: +2% Family Ruckus for every hit that lands of a move that hits more than once. The gauge is counted now; the
// screen's bar and what the gauge buys arrive with stage 6.
B3_TRAITS.bouncy_physics={id:'bouncy_physics',vibe:'rose_sugar',name:'Bouncy Physics',
  on:'afterHit',carrier:'source',multiHit:true,effects:[{op:'ruckus',n:2}],
  desc:'Every hit of a move that hits more than once fills the Family Ruckus gauge 2% more.'};
// Twin-Lamb Relay: one of the lines that needs its own function (engine/b3-custom.js says exactly what it does). `n.share` is the 40%.
B3_QUIRKS.twin_lamb_relay={id:'twin_lamb_relay',vibe:'rose_sugar',name:'Twin-Lamb Relay',
  custom:'twinLambRelay',n:{share:.40},
  desc:'Backup Lamby tags in. A bonus someone left on a monster for the next hit (Deedee’s Spit Shine) is not used up by the first hit of Rose’s multi-hit moves: every later hit gets it too, at 40% strength.'};
// "It's OUR Longboard Now": 3 hits landed in one action. The Speed is on her from that moment until her next turn begins, so
// it shortens exactly one wait: the one she is about to start (my call for "1t" on a Speed buff she earns as her turn ends).
B3_QUIRKS.its_our_longboard_now={id:'its_our_longboard_now',vibe:'rose_sugar',name:'"It’s OUR Longboard Now"',
  on:'actionEnd',carrier:'source',landed:3,effects:[{op:'status',id:'our_longboard',to:'self'}],
  desc:'When Rose lands 3 or more hits in one turn, she gets 25% more Speed until her next turn: she comes back up the turn bar sooner.'};

// ---- Cozy Rosie (second Sig Vibe) ----
B3_VIBES.rose_cozy={id:'rose_cozy',owner:'rose',name:'Cozy Rosie',sig:2,lean:'support',
  subtitles:['Blanket Burrito','Fort Architect','Keeper of the Two Lambies'],
  trait:'well_loved_original',basic:'pocket_pretzel_and_pat',skills:['tattered_lamby_boomerang','sofa_cushion_citadel','kingdom_of_ten_thousand_blankets'],
  quirks:['mint_condition_backup','emergency_stuffy_swap'],counter:null};
// Well-Loved Original: Rose always holds tattered Lamby, so the Pep comes at the start of every 2nd round (rounds 2, 4, 6...).
B3_TRAITS.well_loved_original={id:'well_loved_original',vibe:'rose_cozy',name:'Well-Loved Original',
  on:'roundStart',every:2,show:true,effects:[{op:'pep',n:1,to:'self'}],
  desc:'Holding tattered Lamby gives Rose 1 Pep every 2 rounds.'};
// Mint-Condition Backup: every shield Rose puts on carries the mod, so it counts for whoever holds one (Rose herself included).
// "+20% Crit Resistance" is read as attacks against them crit 20 points less often (the same stat Dazzled and Little Pinch move).
B3_QUIRKS.mint_condition_backup={id:'mint_condition_backup',vibe:'rose_cozy',name:'Mint-Condition Backup',
  shieldMods:[{stat:'critTaken',kind:'mintBackup',v:-.20}],
  desc:'Family members holding one of Rose’s shields are crit 20% less often.'};
// Emergency Stuffy Swap: the hit comes from the unit that broke the shield (a monster). A light Clobber bonk, once a round (my call: the spec gives no tier).
B3_QUIRKS.emergency_stuffy_swap={id:'emergency_stuffy_swap',vibe:'rose_cozy',name:'Emergency Stuffy Swap',
  on:'shieldBroken',from:'foe',shieldBy:'holder',limit:'round',react:true,show:true,
  effects:[{op:'damage',flavor:['clobber'],power:'light',to:'attacker'}],
  desc:'When one of Rose’s shields breaks, Backup Lamby bonks the monster that broke it. Once a round.'};
// Pocket Pretzel & Pat: the pretzel goes to whoever in the family has the smallest share of their HP left, Rose included
// (my call: a six-year-old eats her own pretzel when she is the one who is hurt). A tiny heal is 5% of Max HP.
B3_SKILLS.pocket_pretzel_and_pat={id:'pocket_pretzel_and_pat',vibe:'rose_cozy',slot:'basic',name:'Pocket Pretzel & Pat',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'heal',pct:'tiny',to:'lowestAlly'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Light Clobber bonk with Lamby. Then a pocket pretzel for whoever in the family is hurt the most: a tiny heal.'};

// Tattered Lamby Boomerang: the throw is a light Clobber hit that leaves Lamby stuck on the monster. The spec's "free fast tackle" has no
// time (kit-ops: "when does the free tackle happen"): my call is that it lands when Rose's next turn begins, before she picks a move
// (`later`), as a standard Clobber hit in 2 pieces, with a self-shield of 10% of Max HP (the spec gives no size).
B3_SKILLS.tattered_lamby_boomerang={id:'tattered_lamby_boomerang',vibe:'rose_cozy',slot:'s1',name:'Tattered Lamby Boomerang',pep:2,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,
  effects:[{op:'damage'},{op:'status',id:'lamby_stuck',to:'target'},
    {op:'later',name:'Give Lamby Back!',effects:[{op:'damage',flavor:['clobber'],power:'standard',hits:2,to:'target'},{op:'shield',pct:.10,to:'self'}]}],
  line:null,anim:{kind:'default',shape:'strike'},
  desc:'Rose throws scruffy Lamby at a monster: a light Clobber hit. When her next turn begins she tackles it to get him back: two quick Clobber hits, and a small shield on her.'};
// Sofa-Cushion Citadel: a 25% Max HP shield on every family member, and nobody can be pushed back for 3 turns. 3-round cooldown.
B3_SKILLS.sofa_cushion_citadel={id:'sofa_cushion_citadel',vibe:'rose_cozy',slot:'s2',name:'Sofa-Cushion Citadel',pep:3,flavor:['support'],power:0,hits:0,
  target:'self',tags:[],composure:0,cooldown:3,
  effects:[{op:'shield',pct:.25,to:'allies'},{op:'status',id:'pillow_fort',to:'allies'}],line:null,anim:{kind:'default',shape:'give'},
  desc:'Cushions and blankets make a fort: every family member gets a shield of 25% of their HP and cannot be pushed back on the turn bar for 3 turns. Rose needs 3 rounds before she can build it again.'};
// Kingdom of Ten-Thousand Blankets (Grand Capstone): one family member heals 60% and is cleansed now; the Sizzle wave comes when Rose's next turn
// begins (my calls: heavy Sizzle at the all-monsters share, the same as Fifty-Year Dust Tsunami).
B3_SKILLS.kingdom_of_ten_thousand_blankets={id:'kingdom_of_ten_thousand_blankets',vibe:'rose_cozy',slot:'cap',name:'Kingdom of Ten-Thousand Blankets',pep:5,flavor:['sizzle'],power:0,hits:0,
  target:'family',tags:[],composure:0,
  effects:[{op:'heal',pct:.60,to:'target'},{op:'cleanse',to:'target'},{op:'status',id:'blanket_castle',to:'self'},
    {op:'later',name:'Warmth Wave',who:'foes',effects:[{op:'damage',flavor:['sizzle'],power:'heavy',aoe:true,to:'foes'}]}],
  line:null,anim:{kind:'default',shape:'give'},
  desc:'A star-lit blanket castle: one family member heals 60% of their HP and every debuff on them clears. When Rose\u2019s next turn begins, a wave of Sizzle warmth hits every monster.'};
