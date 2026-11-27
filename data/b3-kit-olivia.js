'use strict';
// data/b3-kit-olivia.js — Battle 3 kit: Olivia (spec section 3.10). Built: all of Rope Champ and all of Working Mom (stage 10).
// News Anchor, her third Vibe, is stage 19 (sig 0). Same shape as the other kit files (see the top of data/b3-kit-tom.js).
// Olivia is in the party from chapter 1, so she is not a late joiner. Her Main Vibe on joining is Rope Champ, her Pocket Vibe Working Mom.
// Two Portable Counters: Cadence (Rope Champ) and Mom Prep (Working Mom), both written on the Vibe rows and built by engine/b3-progress.js.
// A Skill that reads a counter carries `counter:'<id>'`, so it still works when its Vibe is the Pocket Vibe.
// Every number the spec leaves out is a call, written where it is made and listed in claude/battle-build.md "Calls made that Tom has not confirmed".
B3_CAST.olivia={id:'olivia',name:'Olivia',vibes:['olivia_rope','olivia_mom','olivia_news'],stat:{hp:1,atk:1,def:1,spd:1}};

// ---------------------------------------------------------------- Rope Champ (first Sig Vibe) ----------------------------------------------------------------
// Cadence (Portable Counter, max 3: 0 is no rhythm yet, then 1x, 2x, 3x): every turn Olivia attacks builds 1 (a Basic builds its own, so each
// attacking turn is worth exactly 1, as for Amy's Reps; Better Than Bobby builds 1 too). A turn spent on a Support Skill, one that deals no damage and
// builds no Cadence, takes it all away. Muscle Memory pauses it instead. The reset travels with the counter, so it holds in the Pocket too.
B3_VIBES.olivia_rope={id:'olivia_rope',owner:'olivia',name:'Rope Champ',sig:1,lean:'striker',
  subtitles:['Rusty Champ','Double-Under Machine','Undisputed Freestyle Legend'],
  trait:'unbroken_rhythm',basic:'rusty_speed_rope_snap',skills:['criss_cross_double_under','better_than_bobby_hype','regional_championship_freestyle'],
  quirks:['muscle_memory','trophy_shelf_ego'],
  counter:{id:'cadence',name:'Cadence',max:3,on:'actionEnd',carrier:'source',attacks:true,notBasic:true,n:1,
    extra:[{on:'actionEnd',carrier:'source',supportTurn:true,lacksCustom:'muscleMemory',effects:[{op:'counter',id:'cadence',n:-9,to:'self'}]}]}};
// Unbroken Rhythm: each Cadence rank is 10% more Crit Damage (the Trait, Main only). Each rank also adds 1 hit to the Rope Skills that read
// Cadence (Criss-Cross Double-Under, Regional Championship Freestyle). The Basic stays one hit (my call: the spec prints the hit counts on those two Skills).
B3_TRAITS.unbroken_rhythm={id:'unbroken_rhythm',vibe:'olivia_rope',name:'Unbroken Rhythm',
  mods:[{stat:'critDmg',kind:'cadence',v:.10,per:{counter:'cadence'}}],
  desc:'Every turn Olivia attacks builds Cadence, up to 3. Each rank gives her 10% more Crit Damage and 1 more hit on Criss-Cross Double-Under and Regional Championship Freestyle. A turn on a Support Skill resets it.'};
B3_SKILLS.rusty_speed_rope_snap={id:'rusty_speed_rope_snap',vibe:'olivia_rope',slot:'basic',name:'Rusty Speed-Rope Snap',pep:0,flavor:['clobber'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'counter',id:'cadence',n:1,max:3,to:'self'}],line:null,
  short:'Light hit. Builds 1 Cadence.',
  desc:'Light Clobber whip with an old jump rope. Builds 1 Cadence.'};
// Criss-Cross Double-Under: the spec's "2 to 5 hits by Cadence" is `hitsBy`: 2 hits plus 1 per rank. The standard tier is the power at 2 hits; each extra
// hit adds 15% of it (my call: a flat split would make Cadence's extra hits worth almost nothing). Then +20% Evasion and +15% Attack for 2 turns.
B3_SKILLS.criss_cross_double_under={id:'criss_cross_double_under',vibe:'olivia_rope',slot:'s1',name:'Criss-Cross Double-Under',pep:3,flavor:['clobber'],power:'standard',hits:2,
  hitsBy:{counter:'cadence',base:2,per:1,max:5,grow:.15},target:'foe',tags:[],composure:0,counter:'cadence',
  effects:[{op:'damage'},{op:'status',id:'criss_cross',to:'self'}],line:null,
  short:'A flurry of hits, plus one more for each Cadence.',
  desc:'A Clobber flurry of 2 hits, plus 1 for each Cadence rank (up to 5). Each hit past the second adds 15% to the move’s power. Olivia then has 20% more Evasion and 15% more Attack for 2 turns.'};
// "Better Than Bobby!" Hype: builds 1 Cadence, +30% Crit Rate for 2 turns, and her next turn comes 25 ticks sooner (the `next` pull: it takes 25 off
// the wait this very turn sets, engine/b3-ops.js). It deals no damage and builds Cadence itself, so it is not a Support turn and does not reset it.
B3_SKILLS.better_than_bobby_hype={id:'better_than_bobby_hype',vibe:'olivia_rope',slot:'s2',name:'“Better Than Bobby!” Hype',pep:2,flavor:['racket'],power:0,hits:0,
  target:'self',tags:[],composure:0,counter:'cadence',
  effects:[{op:'counter',id:'cadence',n:1,max:3,to:'self'},{op:'status',id:'bobby_hype',to:'self'},{op:'pull',n:25,next:true,to:'self'}],line:null,
  short:'Builds 1 Cadence, and Olivia’s next turn comes sooner.',
  desc:'Olivia trash-talks her childhood rival. Builds 1 Cadence, gives her 30% more Crit Rate for 2 turns, and her next turn comes 25 ticks sooner.'};
// Muscle Memory: with it equipped a Support turn leaves Cadence where it is (`lacksCustom:'muscleMemory'` on the reset in the Vibe row).
B3_QUIRKS.muscle_memory={id:'muscle_memory',vibe:'olivia_rope',name:'Muscle Memory',
  custom:'muscleMemory',n:{},
  desc:'A turn on a Support Skill no longer resets Olivia’s Cadence. It just waits.'};
// Regional Championship Freestyle: 4 hits plus 1 per Cadence rank (up to 7) on one monster, a capstone at 4 hits, each extra hit adding 15% of it.
// +10% damage for each buff Olivia has (the `buffs` bonus), and a slam that knocks 2 Composure pips off. Cadence is not spent.
B3_SKILLS.regional_championship_freestyle={id:'regional_championship_freestyle',vibe:'olivia_rope',slot:'cap',name:'Regional Championship Freestyle',pep:6,flavor:['clobber'],power:'capstone',hits:4,
  hitsBy:{counter:'cadence',base:4,per:1,max:7,grow:.15},target:'foe',tags:[],composure:2,counter:'cadence',
  effects:[{op:'damage',bonus:{buffs:true,add:.10}}],line:null,
  short:'Four fast hits, plus one more for each Cadence.',
  desc:'Bleachers and pyro: 4 rapid Clobber strikes, plus 1 for each Cadence rank (up to 7). Each strike past the fourth adds 15% to the move’s power, and every buff Olivia has adds 10% damage. The slam knocks 2 Composure pips off.'};
// Trophy-Shelf Ego: 8% more damage for each different buff Olivia has, up to 4 buffs (+32%).
B3_QUIRKS.trophy_shelf_ego={id:'trophy_shelf_ego',vibe:'olivia_rope',name:'Trophy-Shelf Ego',
  mods:[{stat:'out',kind:'trophy',v:.08,per:{buffs:true,max:4}}],
  desc:'Olivia does 8% more damage for each different buff she has, up to 32%.'};

// ---------------------------------------------------------------- Working Mom (second Sig Vibe) ----------------------------------------------------------------
// Mom Prep (Portable Counter, max 3): every turn Olivia takes builds 1, whatever she does. Diaper-Bag Snack Drop spends it.
B3_VIBES.olivia_mom={id:'olivia_mom',owner:'olivia',name:'Working Mom',sig:2,lean:'support',
  subtitles:['One-Handed Emailer','Double-Stroller General','CEO of Bedtime'],
  trait:'multitasking_pro',basic:'baby_wipe_swipe',skills:['diaper_bag_snack_drop','cool_mist_humidifier','michael_grab_the_kids'],
  quirks:['nap_window_efficiency','childproofed_locks'],
  counter:{id:'momprep',name:'Mom Prep',max:3,on:'turnEnd',carrier:'source',n:1}};
// Multitasking Pro: the rule is the Vibe's counter (so it comes along in the Pocket); the Trait row names it for the Vibes screen.
B3_TRAITS.multitasking_pro={id:'multitasking_pro',vibe:'olivia_mom',name:'Multitasking Pro',viaVibe:true,
  desc:'Juggling work, Lachlan and Isla builds 1 Mom Prep each turn Olivia takes, up to 3. Diaper-Bag Snack Drop spends it for a bigger heal.'};
// Baby-Wipe Swipe (target kind `either`): picked on a monster it is a light Drench swat with a cold wet wipe. Picked on a family member (Olivia too)
// it clears their lightest-weight debuff, 1 of them, a "minor" one (a status weight of 4 or less: Slow, Fatigue, an accuracy drop), and heals 10%.
B3_SKILLS.baby_wipe_swipe={id:'baby_wipe_swipe',vibe:'olivia_mom',slot:'basic',name:'Baby-Wipe Swipe',pep:0,flavor:['drench'],power:'light',hits:1,
  target:'either',tags:[],composure:0,effects:[{op:'damage'}],allyEffects:[{op:'cleanse',n:1,minor:true,to:'target'},{op:'heal',pct:'small',to:'target'}],
  line:null,
  short:'Light hit on a monster, or a small heal for family.',
  desc:'Pick a monster for a light Drench swat with a cold wet wipe. Pick a family member to clear 1 minor debuff (Slow, Fatigue, an accuracy drop) and heal 10%.'};
// Diaper-Bag Snack Drop: a party heal of 10% plus 4% for each Mom Prep (spent): 10% to 22%. At 3 Mom Prep the family member with the least Pep also
// gets 1 Pep. The tote is party-wide (`party:true`, read by Childproofed Locks).
B3_SKILLS.diaper_bag_snack_drop={id:'diaper_bag_snack_drop',vibe:'olivia_mom',slot:'s1',name:'Diaper-Bag Snack Drop',pep:3,flavor:['support'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,counter:'momprep',
  effects:[{op:'heal',pct:.10,to:'allies',perCounter:{counter:'momprep',add:.04,spend:true}},{op:'pep',n:1,to:'lowestPepAlly',needCounter:{id:'momprep',min:3}}],line:null,
  short:'The whole family heals a little. Mom Prep makes it more.',
  desc:'Snacks and sippy cups for everyone: the whole family heals 10%, plus 4% for each Mom Prep, which is used up. At 3 Mom Prep the family member with the least Pep gets 1 Pep.'};
// Cool-Mist Humidifier: the family takes 25% less damage from thrown (projectile) acts and from acts that hit the whole family, for 2 turns, and every
// monster is left Drenched. It deals no damage (the spec prints none).
B3_SKILLS.cool_mist_humidifier={id:'cool_mist_humidifier',vibe:'olivia_mom',slot:'s2',name:'Cool-Mist Humidifier',pep:4,flavor:['drench'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,effects:[{op:'status',id:'cool_mist',to:'allies'},{op:'status',id:'drenched',to:'foes'}],line:null,
  short:'Drenches every monster and softens attacks on the family.',
  desc:'Isla’s cool-mist humidifier: for 2 turns the family takes 25% less damage from thrown attacks and from attacks on everyone, and every monster is left Drenched.'};
// Nap-Window Efficiency: the spec's "add 0 extra Recovery Ticks" has nothing to be compared with, so (my call) a Support Skill waits as little as a Basic
// does: 80 instead of 100, which is 20% less. A Support Capstone gets the same 20%. A "Support Skill" deals no damage and builds no counter.
B3_QUIRKS.nap_window_efficiency={id:'nap_window_efficiency',vibe:'olivia_mom',name:'Nap-Window Efficiency',
  mods:[{stat:'moveRec',kind:'nap',v:-.20,when:{supportSkill:true}}],
  desc:'Support Skills leave Olivia waiting 20% less before her next turn, as little as after a Basic.'};
// "Michael, Grab the Kids!": a capstone with no damage (the spec prints none): every monster is startled 25 ticks back on the turn bar, the whole
// family heals 15% (the moderate party heal), and every Mental status, Stun included, comes off the family.
B3_SKILLS.michael_grab_the_kids={id:'michael_grab_the_kids',vibe:'olivia_mom',slot:'cap',name:'“Michael, Grab the Kids!”',pep:5,flavor:['racket'],power:0,hits:0,
  target:'self',tags:[],composure:0,party:true,
  effects:[{op:'push',n:25,to:'foes'},{op:'heal',pct:'party',to:'allies'},{op:'cleanse',group:'mental',to:'allies'}],line:null,
  short:'Pushes every monster back and heals the family a little.',
  desc:'Michael sprints across the field with a toddler under each arm and a hot dinner tray. Every monster is startled 25 ticks back on the turn bar, the whole family heals 15%, and Stun and every other Mental status come off the family.'};
// Childproofed Locks: when a party-wide Skill of Olivia's heals or buffs the family, one random family member (Olivia too) gets Childproofed:
// it blocks the next debuff aimed at them. Once per action however many heals and buffs it gave.
B3_QUIRKS.childproofed_locks={id:'childproofed_locks',vibe:'olivia_mom',name:'Childproofed Locks',
  listen:[{on:'healed',carrier:'source',partySkill:true,limit:'action',limitKey:'locks',show:true,effects:[{op:'status',id:'childproofed',to:'randomAlly'}]},
    {on:'statusApplied',carrier:'source',kinds:['buff'],partySkill:true,limit:'action',limitKey:'locks',show:true,effects:[{op:'status',id:'childproofed',to:'randomAlly'}]}],
  desc:'When Olivia heals or buffs the whole family, a random family member gets Childproofed: the next debuff aimed at them bounces off.'};

// ---------------------------------------------------------------- News Anchor (third Vibe, stage 19; sig 0) ----------------------------------------------------------------
B3_VIBES.olivia_news={id:'olivia_news',owner:'olivia',name:'News Anchor',sig:0,lean:'tempo',
  subtitles:['Curbside Reporter','Live Fact-Checker','Prime-Time Broadcast Queen'],
  trait:'on_the_record',basic:'hot_mic_question',skills:['camera_crew_spotlight','is_this_real_fact_check','livnews_breaking_exclusive'],
  quirks:['inverted_pyramid','investigative_scoop'],counter:null};
// On The Record: every monster is marked at the start of the fight and crits 15% more from the family. The spec's "reveals Pet Peeves and Composure"
// needs nothing here: Battle 3 never hides a monster's Pet Peeves or Composure pips, so the exposure is the mark.
B3_TRAITS.on_the_record={id:'on_the_record',vibe:'olivia_news',name:'On The Record',
  on:'battleStart',show:true,effects:[{op:'status',id:'on_record',to:'foes'}],
  desc:'Every monster is exposed from the first moment, for good: the family crits it 15% more often.'};
B3_SKILLS.hot_mic_question={id:'hot_mic_question',vibe:'olivia_news',slot:'basic',name:'Hot-Mic Question',pep:0,flavor:['racket'],power:'light',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'mic_in_face',to:'target'}],line:null,
  short:'Light hit. It cannot dodge for 2 turns.',
  desc:'Light Racket hit. The mic is in its face: it cannot dodge for 2 turns.'};
B3_SKILLS.camera_crew_spotlight={id:'camera_crew_spotlight',vibe:'olivia_news',slot:'s1',name:'Camera-Crew Spotlight',pep:3,flavor:['razzle'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'splash',of:'dealt',share:.25,flavor:'racket',to:'otherFoes'}],line:null,
  short:'Dazzles. A quarter of the hit splashes to the rest.',
  desc:'Standard Razzle hit that leaves the monster Dazzled. 25% of the damage splashes as Racket to every other monster.'};
// "Is This Real?" Fact-Check: standard Racket (my call), +35% for every buff the monster has (counted before the swap), then its heaviest buff turns into the matching debuff.
B3_SKILLS.is_this_real_fact_check={id:'is_this_real_fact_check',vibe:'olivia_news',slot:'s2',name:'"Is This Real?" Fact-Check',pep:3,flavor:['racket'],power:'standard',hits:1,
  target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{targetBuffs:true,add:.35}},{op:'invert',n:1,to:'target'}],line:null,
  short:'+35% per buff on it, then turns one buff against it.',
  desc:'Standard Racket hit, 35% stronger for every buff the monster has. Then its heaviest buff is inverted into the matching debuff.'};
B3_SKILLS.livnews_breaking_exclusive={id:'livnews_breaking_exclusive',vibe:'olivia_news',slot:'cap',name:'LivNews Breaking Exclusive',pep:5,flavor:['racket'],power:'standard',hits:1,
  target:'all_foes',tags:[],composure:0,
  effects:[{op:'status',id:'ruckus_boost',to:'self'},{op:'damage'},{op:'status',id:'stripped_defenses',to:'target'},{op:'composure',n:2,ifBuffed:true,to:'target'}],line:null,
  short:'Hits all, weakens resistances, -2 pips on buffed.',
  desc:'Standard Racket hit on every monster. Their resistances count one step weaker for 2 turns, a monster with a buff loses 2 more Composure pips, and the Ruckus gains of this action are 25% bigger.'};
B3_QUIRKS.inverted_pyramid={id:'inverted_pyramid',vibe:'olivia_news',name:'Inverted Pyramid',
  on:'afterHit',carrier:'source',peeveHit:true,limit:'action',show:true,effects:[{op:'pep',n:1,to:'self'}],
  desc:'When Olivia hits a monster\u2019s Pet Peeve she gets 1 Pep (once an action).'};
B3_QUIRKS.investigative_scoop={id:'investigative_scoop',vibe:'olivia_news',name:'Investigative Scoop',custom:'scoop',n:{},
  desc:'The first debuff Olivia puts on a Boss lasts 1 turn longer and cannot be cleansed.'};
