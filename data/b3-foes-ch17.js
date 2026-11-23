'use strict';
// data/b3-foes-ch17.js — Battle 3 enemies: chapter 17, Julian's building in Los Angeles (bestiary v11 section 2, "Chapter 17": entries 75 to 78, `pausesprite`, `paperweight`,
// `curator` and `twinlens`). Numbers are the bestiary's printed numbers except one: the Twin Lenses' HP is 3,800 (2,850 for three), printed 2,910 (2,180). At the printed HP the simulator won in 4.4 rounds, under the
// 5 to 7 a boss with a helper is aimed at (bestiary 1.6); at 3,800 it lands at about 5.7 (docs/BATTLE3.md "What stage 22 chapter 17 holds").
// The row format and every act field are explained at the top of data/b3-foes-ch01.js. Chapters 15 to 20 are PROVISIONAL in the bestiary.
// What is here: the Pause Sprite (Hexer), the Brass Desk Weight (Elite), the Curator (Elite), the Twin Lenses (boss) and the formations. Chapter 17 has no fight with Julian Vance:
// his voice only speaks in the scenes, so the Twin Lenses are his fight. The stairs team is three (Tom, Grace, Rose); the shelf hall and the Vault are four (Tom, Amy, TNB, Nara;
// then Tom, Grace, Rose, Amy), so the boss prints its HP for 4 and `hp3` for three.
//
// Names: this file uses the bestiary's names, the ones on the card (Brass Desk Weight, The Twin Lenses). Battle 2 and the built scenes call them the Paperweight (a glass dome with a
// snowstorm in it) and the Archivist's Twin Lenses; the foe `name` and each act's `name` are one string each, so they change in one place when the script settles them. The bestiary
// (section 6) says the snow-globe look needs a new painting; until the Art Library makes it, `paperweight` draws with the built Paperweight sprite. Every number, flavor, tag and effect is the bestiary's.
//   bestiary name / built name                         acts
//   Brass Desk Weight / Paperweight                    Brass Roll (Roll), Magnifier Glare (Snow), Hold The Stack (Hold Down)
//   The Twin Lenses / the Archivist's Twin Lenses      Rack Focus, Cold Safelight, Enlarger Burn, Darkroom Call, Long Exposure, Contact-Sheet Archive
//
// The Twin Lenses' stances (the one new rule in this chapter). `stances` on a foe row lists them, `stance0` is the one it starts in. A foe in a stance has that stance's Pet Peeves and Resists
// instead of its row's (`u.peeves`, `u.resists`: every rule that reads them, the damage, the preview, the glow and the Pet Peeve line on the card, sees the stance it is in). It swaps
//   - at every round divider (engine/b3-timeline.js b3RoundStart), and
//   - on its own Rack Focus (the `stance` op, engine/b3-ops.js),
// so two swaps in one round cancel. A stance is the foe's own state, not a status: a Break, Panic Boil!, a buff strip or a cleanse cannot take it away, and Composure and Primes carry
// through a swap (a Drenched put on in Orange can be set off by a Clobber hit in Blue: Hydro-Slip!). `when:{stance:'blue'}` limits an act to one stance. The row's own `peeves` and
// `resists` are the Blue stance, which is also the one it starts in (the Battle Guide and the data check read them).
//   Blue    Pet Peeves Sizzle and Clobber, resists Drench and Razzle.      Cold Safelight is Blue only.
//   Orange  Pet Peeves Drench and Razzle, resists Sizzle and Racket.       Enlarger Burn is Orange only.
// Cadence (the bestiary prints none): the acts run in printed order, an act whose `when` fails is skipped, Darkroom Call is the once-at-half-HP act, Contact-Sheet Archive joins below half HP.
// The numbers that are mine are those two and nothing else; they are tuned only through the simulator.
//
// The Pause Sprite's Self-Timer Beep puts +20% Speed on one monster standing in Front (`randomFrontAlly`, as the chapter 6 Code Red! does), and the Pause Sprite is in Back, so it is always
// for the Elite in front of it.

// ---------- The Pause Sprite (Hexer, Back, 884 HP) ----------
B3_FOES.pausesprite={id:'pausesprite',name:'Pause Sprite',ch:17,role:'hexer',row:'back',hp:884,atk:143,def:63,spd:125,pips:0,
  peeves:['clobber','racket'],resists:[],start:[],mechanics:[],drop:'coldbrew',
  acts:[
    {id:'shutter_tap',name:'Shutter Tap',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'hold_that_pose',name:'Hold That Pose',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'push',n:25,to:'target'},{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'self_timer_beep',name:'Self-Timer Beep',flavor:['support'],power:0,recovery:100,hits:'foes',tags:['buff'],effects:[{op:'status',id:'self_timer',to:'randomFrontAlly'}]}
  ]};

// ---------- The Brass Desk Weight (Elite, Front, 1,872 HP, 5 pips) ----------
// It starts sitting on its heavy brass base (a Guard Stance, 25% less damage for 2 turns).
B3_FOES.paperweight={id:'paperweight',name:'Brass Desk Weight',ch:17,role:'elite',row:'front',hp:1872,atk:173,def:88,spd:107,pips:5,
  peeves:['clobber','razzle'],resists:['drench'],start:['heavy_brass_base'],mechanics:[],drop:'pretzels',
  acts:[
    {id:'brass_roll',name:'Brass Roll',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'magnifier_glare',name:'Magnifier Glare',flavor:['razzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'hold_the_stack',name:'Hold The Stack',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'held_stack',to:'target'},{op:'status',id:'slow',n:2,to:'target'}]}
  ]};

// ---------- The Curator (Elite, Front, 1,872 HP, 5 pips) ----------
// It starts with White-Glove Protocol: +25% Defense and a seal that blocks the first debuff the family puts on it (2 turns, buffs).
B3_FOES.curator={id:'curator',name:'Curator',ch:17,role:'elite',row:'front',hp:1872,atk:173,def:88,spd:107,pips:5,
  peeves:['clobber','racket'],resists:[],start:['white_glove','glove_seal'],mechanics:[],drop:'prioritytag',
  acts:[
    {id:'label_gun_tag',name:'Label-Gun Tag',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'label_tag',to:'target'}]},
    {id:'frame_straighten',name:'Frame Straighten',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'do_not_touch',name:'“Do Not Touch The Proofs”',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'status',id:'skill_lock',n:2,to:'target'},{op:'pep',n:-1,to:'target'}]}
  ]};

// ---------- The Twin Lenses (boss, Front, 2,910 HP, 8 pips, no running) ----------
// Called Curator: at half HP the Darkroom Call brings one Curator to the Front (half its entry's HP, no pips, no Vibe Points: the add rule) and the boss gains +20% Defense for 2 turns.
B3_FOES.twinlens={id:'twinlens',name:'The Twin Lenses',ch:17,role:'boss',row:'front',hp:3800,hp3:2850,atk:188,def:81,spd:121,pips:8,
  peeves:['sizzle','clobber'],resists:['drench','razzle'],start:[],mechanics:[],drop:null,noRun:true,
  stance0:'blue',
  stances:{
    blue:{name:'Blue Lens',peeves:['sizzle','clobber'],resists:['drench','razzle']},
    orange:{name:'Orange Lens',peeves:['drench','razzle'],resists:['sizzle','racket']}
  },
  acts:[
    {id:'rack_focus',name:'Rack Focus',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep','buff'],effects:[{op:'stance'},{op:'status',id:'rack_focus',to:'self'}]},
    {id:'cold_safelight',name:'Cold Safelight',flavor:['drench'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{stance:'blue'},effects:[{op:'status',id:'drenched',to:'target'},{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'enlarger_burn',name:'Enlarger Burn',flavor:['sizzle'],power:1,recovery:100,hits:'one',tags:['projectile'],when:{stance:'orange'},effects:[{op:'status',id:'toasty',to:'target'},{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'darkroom_call',name:'Darkroom Call',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{once:true,hpBelow:.5},
      effects:[{op:'summon',id:'curator',row:'front',n:1},{op:'status',id:'darkroom_def',to:'self'}]},
    {id:'long_exposure',name:'Long Exposure',flavor:['razzle'],power:1.2,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'slow',n:1,to:'target'},{op:'status',id:'fatigue',n:1,to:'target'}]},
    {id:'contact_sheet_archive',name:'Contact-Sheet Archive',flavor:['sizzle','drench'],power:1.3,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'toasty',n:1,to:'target'},{op:'status',id:'drenched',n:1,to:'target'}]}
  ]};

// ---------- Formations (bestiary sections 4 and 5) ----------
// 5 Vibe Points for each of the chapter's 12 normal fights (7 on the stairs, 5 in the shelf hall) and 30 for the boss: the bestiary's 90. The Pause Sprite and the Curator are two map
// monsters that name the same fight (the bestiary's "`pausesprite`, `curator`": a Curator in Front, a Pause Sprite behind it); the Brass Desk Weight has a Pause Sprite behind it.
B3_FORMATIONS.pausesprite={id:'pausesprite',ch:17,foes:[{id:'curator',row:'front'},{id:'pausesprite',row:'back'}],vp:5};
B3_FORMATIONS.curator={id:'curator',ch:17,foes:[{id:'curator',row:'front'},{id:'pausesprite',row:'back'}],vp:5};
B3_FORMATIONS.paperweight={id:'paperweight',ch:17,foes:[{id:'paperweight',row:'front'},{id:'pausesprite',row:'back'}],vp:5};
B3_FORMATIONS.twinlens={id:'twinlens',ch:17,foes:[{id:'twinlens',row:'front'}],vp:30};
