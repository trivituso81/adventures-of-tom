'use strict';
// data/b3-status.js — Battle 3: one row per status, buff, stance, mark and Prime (architecture section 2.3), and the hazards.
//   kind    buff, debuff, prime, stance or mark
//   group   'mental' for the statuses a mental cleanse removes (spec 2.8), else null
//   dur     {n, unit}: unit 'turn' counts the carrier's own turns (at the end of each), 'round' counts round dividers,
//           'begin' ends when the carrier's next turn begins (Flustered), 'srcBegin' ends when the next turn of whoever put it
//           on begins (Winged Shell Lock-On: it sits on a monster and goes at Tom's next turn)
//   mods    [{stat, kind, v}]: `kind` is the stacking bucket. Same kind adds, different kinds multiply (spec 2.4).
//           stats: spd, atk, def (the stat itself), out (damage dealt), taken (damage taken), reduce (damage reduction),
//           crit (own Crit Rate), critTaken (Crit Rate of attacks against it), eva (Evasion), acc (chance its attacks miss,
//           written as a negative accuracy), aggro (target weight), recovery (Recovery Ticks), healGiven (heals and shields given)
//           A mod may carry `when` (it counts only on some hits) and `per` (it grows with a counter): engine/b3-core.js b3Mods.
//   flags   blind (its next single-target attack misses, then the status is used up), skipTurn (loses its next turn, then the
//           status is used up), taunt (enemy single-target attacks must aim at the carrier), untargetable, pushImmune
//   peeve   flavors that count as the carrier's Pet Peeves while it is on (Masterpiece Portrait Makeover)
//   tick    damage at the start of each of the carrier's turns
//   regen   healing at the start of each of the carrier's turns, as a share of Max HP
//   intercept {reduce}: single-target hits aimed at the carrier land on the unit that put this status on, that much weaker
//   on      {hook:{...}}: a reaction (engine/b3-hooks.js)
//   weight  which icons show when there are more than 3 (higher first)
//   noSteal  a buff that cannot be ripped off a monster (the Big One's crown: "No Take, Only Throw!" gives Nara an Attack bonus instead)
//   desc    one plain sentence for the full list the player opens by tapping a unit (spec 2.8, the screen rule)
const B3_STATUS={
  // ---- The 3 Primes (spec 2.5): 2 of the foe's turns ----
  toasty:{id:'toasty',name:'Toasty',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    tick:{flavor:'sizzle',power:'light'},short:'TOASTY',color:'#ff8c5a',weight:9,
    desc:'Burns for light Sizzle damage at the start of each turn. A Drench or Racket hit sets it off.'},
  drenched:{id:'drenched',name:'Drenched',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'drenched',v:-.15}],flags:[],
    short:'DRENCHED',color:'#7cc4f2',weight:9,
    desc:'15% slower. A Sizzle, Clobber or Razzle hit sets it off.'},
  dazzled:{id:'dazzled',name:'Dazzled',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'critTaken',kind:'dazzled',v:.15}],flags:[],
    short:'DAZZLED',color:'#ffe27a',weight:9,
    desc:'Attacks against it crit 15% more often. A Clobber or Racket hit sets it off.'},
  // ---- Common statuses (spec 2.8) ----
  slow:{id:'slow',name:'Slow',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'slow',v:-.20}],flags:[],
    short:'SLOW',color:'#9db4d6',weight:3,desc:'20% slower.'},
  stun:{id:'stun',name:'Stun',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[],flags:['skipTurn'],
    short:'STUN',color:'#f2d36b',weight:8,desc:'Loses its next turn.'},
  blind:{id:'blind',name:'Blind',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['blind'],
    short:'BLIND',color:'#c9c9d6',weight:6,desc:'Its next attack on one target misses.'},
  fatigue:{id:'fatigue',name:'Fatigue',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'recovery',kind:'fatigue',v:.20}],flags:[],
    short:'TIRED',color:'#b9a58f',weight:3,desc:'Waits 20% longer after each move.'},
  bleed:{id:'bleed',name:'Bleed',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    tick:{flavor:'clobber',power:'light'},short:'BLEED',color:'#e58a8a',weight:5,
    desc:'Takes light Clobber damage at the start of each turn.'},
  guard_stance:{id:'guard_stance',name:'Guard Stance',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#e6c988',weight:5,desc:'Takes 25% less damage.'},
  mend:{id:'mend',name:'Mend',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],regen:.03,
    short:'MEND',color:'#8fe3a6',weight:5,desc:'Heals a little at the start of each turn. It can be stripped.'},
  // Flustered (spec 2.7): what a foe is from the moment its Composure pips reach 0 until its next turn begins. The Break itself
  // (falling back on the turn bar, losing a wound-up act and any stance) is in engine/b3-resolve.js b3Break.
  flustered:{id:'flustered',name:'Flustered',kind:'debuff',group:null,dur:{n:1,unit:'begin'},mods:[{stat:'taken',kind:'flustered',v:B3_RULES.composure.flusteredTaken}],flags:['pushImmune'],
    short:'FLUSTERED',color:'#ff9a8a',weight:10,desc:'Out of Composure. Takes 35% more damage and cannot be pushed until its next turn begins.'},
  // ---- From the Detonations (spec 2.6) ----
  overloaded:{id:'overloaded',name:'Sensory Overload',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'out',kind:'overload',v:-.25}],flags:[],
    short:'OVERLOAD',color:'#d7a4f5',weight:4,desc:'Deals 25% less damage.'},
  // ---- Kit statuses: Tom, Grace, Rose, Deedee (first Sig Vibes) ----
  eyes_on_me:{id:'eyes_on_me',name:'Eyes On Me',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'aggro',kind:'eyesOnMe',v:.50}],flags:[],
    short:'EYES ON ME',color:'#ffd27a',weight:4,desc:'Monsters aim at Tom more often.'},
  // Zone One Blockade (spec 3.1): a ward. Each enemy action that hits Tom with a melee or projectile act is answered once.
  // The Clobber answer is standard power (my call: the spec gives no tier). Its Composure pip is paid when the answer ends (an answer has its own 3-pip cap).
  zone_one:{id:'zone_one',name:'Zone One Blockade',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{afterHit:{carrier:'target',from:'foe',tags:['melee','projectile'],limit:'action',react:true,
      effects:[{op:'damage',flavor:['clobber'],power:'standard',to:'attacker'},{op:'composure',n:1,to:'attacker'}]}},
    short:'BLOCKADE',color:'#f0c27b',weight:6,
    desc:'A monster that hits Tom with a melee or thrown attack gets a Clobber hip-check back.'},
  // Suite Door Slide (spec 3.1): sits on the family next to Tom. `intercept.reduce` is the "-35% damage" Tom takes the hit at.
  suite_door:{id:'suite_door',name:'Suite Door',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],intercept:{reduce:.35},
    short:'SUITE DOOR',color:'#c9d8f0',weight:6,
    desc:'A hit aimed only at this family member lands on Tom instead, 35% weaker.'},
  squished:{id:'squished',name:'Squished',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{afterHit:{carrier:'target',by:'otherAlly',effects:[{op:'pep',n:1,to:'attacker'}],consume:true}},
    short:'SQUISHED',color:'#f5b8d0',weight:2,desc:'The next family member other than Grace to hit it gains 1 Pep.'},
  stress_melted:{id:'stress_melted',name:'Stress Melted',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'needoh',v:.20}],flags:[],
    short:'SPEED UP',color:'#9be39a',weight:4,desc:'20% faster.'},
  giddyup:{id:'giddyup',name:'Giddyup!',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'giddyup',v:.20}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'20% more Attack.'},
  windexed:{id:'windexed',name:'Windex In The Eyes',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'acc',kind:'windex',v:-.15}],flags:[],
    short:'WINDEX',color:'#8fd0ff',weight:4,desc:'Each of its attacks has a 15% chance to miss.'},
  // ---- Kit statuses: the Traits, Quirks and Capstones of the first Sig Vibes (stage 5a) ----
  // Tarmac Porsche Transfer "locks aggro": a taunt on Tom for 2 turns (my call: the spec gives no length; 2 turns is the common one).
  high_beams:{id:'high_beams',name:'High Beams',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['taunt'],
    short:'ALL EYES',color:'#ffd27a',weight:7,desc:'The Porsche\u2019s high beams are on Tom: any attack aimed at one family member has to aim at him.'},
  // Sensory Satisfying: on whoever is next on the bar as Grace's turn ends, for their next turn.
  so_satisfying:{id:'so_satisfying',name:'So Satisfying',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'out',kind:'satisfying',v:.15},{stat:'healGiven',kind:'satisfying',v:.15}],flags:[],
    short:'SATISFYING',color:'#f5b8d0',weight:4,desc:'Acting right after Grace: this turn hits 15% harder and heals 15% more.'},
  // Slow-Rise Memory Foam: until Grace's next turn begins.
  memory_foam:{id:'memory_foam',name:'Memory Foam',kind:'buff',group:null,dur:{n:1,unit:'begin'},mods:[{stat:'eva',kind:'memoryFoam',v:.15}],flags:[],
    short:'DODGY',color:'#9be39a',weight:4,desc:'Grace springs back into shape: she dodges 15% of attacks.'},
  // "It's OUR Longboard Now": until Rose's next turn begins, so it shortens the wait she has just started.
  our_longboard:{id:'our_longboard',name:'OUR Longboard',kind:'buff',group:null,dur:{n:1,unit:'begin'},mods:[{stat:'spd',kind:'longboard',v:.25}],flags:[],
    short:'SPEED UP',color:'#9be39a',weight:4,desc:'Rose is on the longboard: 25% faster.'},
  // Car-Crumb Vacuum: the whole family, 1 turn each.
  crumb_free:{id:'crumb_free',name:'Not A Crumb',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'crumbFree',v:.15}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'Deedee got every crumb: 15% more Attack.'},
  // Spit Shine: a rider on the monster. The mod counts only for a Clobber hit by a family member other than Deedee, and that
  // hit uses the mark up (Rose's Twin-Lamb Relay holds it for her later hits at 40%: engine/b3-custom.js).
  spit_shine:{id:'spit_shine',name:'Spit Shine',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'taken',kind:'spitShine',v:.30,when:{flavor:'clobber',by:'otherAlly'}}],flags:[],
    on:{afterHit:{carrier:'target',by:'otherAlly',flavor:'clobber',effects:[],consume:true}},
    short:'SHINED',color:'#8fd0ff',weight:3,desc:'Polished up by Deedee: the next Clobber hit from someone else in the family does 30% more damage.'},
  // ---- Kit statuses: the second Sig Vibes (stage 4: their Basics and three Skill 1s) ----
  off_key:{id:'off_key',name:'Off Key',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'screech',v:-.20}],flags:[],
    short:'OFF KEY',color:'#d7a4f5',weight:4,desc:'Grace’s violin is still ringing in its ears: 20% less Attack.'},
  pinched:{id:'pinched',name:'Little Pinch',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'critTaken',kind:'pinch',v:.15}],flags:[],
    short:'PINCHED',color:'#f0c27b',weight:3,desc:'Attacks against it crit 15% more often.'},
  all_better:{id:'all_better',name:'All Better',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'allBetter',v:.20}],flags:[],
    short:'ALL BETTER',color:'#8fe3a6',weight:4,desc:'Deedee made it better: 20% more Attack.'},
  // ---- Kit statuses: Gamer Geek and Craft Artist (stage 5b) ----
  // Winged Shell Lock-On: a mark on the monster until Tom's next turn begins. If it attacks before then, Tom's own small answer
  // lands on it: a free standard Razzle hit (the spec says "free Razzle explosion"; the tier is my call). `answer:'putter'` makes
  // the reaction Tom's and `consume` uses the shell up, so a fast monster that acts twice is hit once. A wind-up turn is not an
  // attack (it deals nothing), so the shell waits for the act that lands. Not a counterattack: `quiet`.
  winged_shell:{id:'winged_shell',name:'Winged Shell',kind:'mark',group:null,dur:{n:1,unit:'srcBegin'},mods:[],flags:[],
    on:{actionDeclared:{carrier:'source',attacks:true,answer:'putter',react:true,quiet:true,consume:true,
      effects:[{op:'damage',flavor:['razzle'],power:'standard',to:'attacker'}]}},
    short:'SHELL',color:'#7aa8ff',weight:7,
    desc:'Tom\u2019s blue winged shell hovers over it until his next turn. If it attacks before then, the shell slams down on it in a free Razzle explosion.'},
  // Masterpiece Portrait Makeover: Razzle is one of its Pet Peeves for 2 of its turns (a Razzle hit does 50% more and takes a pip).
  razzle_weak:{id:'razzle_weak',name:'Razzle Weakness',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],peeve:['razzle'],
    short:'RAZZLE WEAK',color:'#ffe27a',weight:7,
    desc:'Grace\u2019s portrait has it dazzled: Razzle is one of its Pet Peeves for now, so Razzle hits do 50% more and knock a Composure pip off.'},
  // Elixir Hoarder: put on at the start of Tom's turn, gone as his next turn begins, so it covers this turn's hit and the wait it sets.
  elixir_buzz:{id:'elixir_buzz',name:'Elixir Buzz',kind:'buff',group:null,dur:{n:1,unit:'begin'},mods:[{stat:'spd',kind:'elixir',v:.15},{stat:'crit',kind:'elixir',v:.15}],flags:[],
    short:'BUZZING',color:'#9be39a',weight:5,desc:'Tom is saving up and it shows: 15% faster and 15% more likely to crit this turn.'},
  // New Game Plus: the next Skill of 4 Pep or less costs 2 less (never below 1, never a Grand Capstone). It is put on during or
  // after Tom's turn and lasts until his next turn ends, which is the next Skill he can use.
  new_game_plus:{id:'new_game_plus',name:'New Game Plus',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'cost',kind:'ngp',v:-2,when:{skillPep:4}}],flags:[],
    short:'NEXT -2 PEP',color:'#8dc4e6',weight:5,desc:'Tom\u2019s next Skill that costs 4 Pep or less costs 2 less (1 Pep at the least).'},
  // ---- Kit statuses: TNB's Ceramicist and Longboarder (stage 9b) ----
  // Wheel-Thrown Lump: "-10% foe Spd".
  wet_clay:{id:'wet_clay',name:'Wet Clay',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'wetClay',v:-.10}],flags:[],
    short:'CLAYED',color:'#c98a5a',weight:3,desc:'Weighed down by wet clay: 10% slower.'},
  // Three-AM Kiln Firing: +15% Attack on the whole family for 2 turns.
  kiln_glow:{id:'kiln_glow',name:'Kiln Glow',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'kilnGlow',v:.15}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'Still warm from the 3 AM kiln: 15% more Attack.'},
  // Kintsugi Gold Seam: for 1 turn the carrier's hits can also set off Razzle Detonations (engine/b3-resolve.js b3FindDetonation).
  gold_seam:{id:'gold_seam',name:'Gold Seam',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[],flags:['razzleDet'],
    short:'GOLD SEAM',color:'#ffd36b',weight:5,desc:'A gold line where the shield broke: this turn\u2019s hits can also set off Razzle Detonations, such as Short Circuit! on a Drenched monster.'},
  // E-Bike Tag-Along: Fresh Ride blocks the next debuff (engine/b3-ops.js b3PutStatus; the flag is used up when it blocks one).
  fresh_ride:{id:'fresh_ride',name:'Fresh Ride',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['blockDebuff'],
    short:'FRESH RIDE',color:'#8fe3a6',weight:5,desc:'The rental e-bike\u2019s lock is on: the next debuff aimed at this family member bounces off, and then the lock is used up.'},
  // E-Bike Tag-Along: +15% Speed, Attack and Defense. Baxter Hill Longboard Express doubles it (a `mult` of 2 on the carried status).
  e_bike:{id:'e_bike',name:'E-Bike',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'ebike',v:.15},{stat:'atk',kind:'ebike',v:.15},{stat:'def',kind:'ebike',v:.15}],flags:[],
    short:'E-BIKE',color:'#9be39a',weight:6,desc:'Riding a rental e-bike: 15% more Speed, Attack and Defense. Baxter Hill Longboard Express doubles it.'},
  // ---- Kit statuses: Boppy's The Dep and Pepper Boss, Nara's Attached Pup and Guard Dog (stage 9c) ----
  // Warden's Nightstick Rap: "-15% foe Atk 1t".
  back_behind:{id:'back_behind',name:'Back Behind The Line',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'nightstick',v:-.15}],flags:[],
    short:'ATTACK DOWN',color:'#c9a27a',weight:4,desc:'Boppy cracked it across the shin: 15% less Attack for its next turn.'},
  // "Nobody Gets Past Me!": 2 turns, an AoE taunt (every single-target attack must aim at Boppy), +35% Defense, and a grumpy Racket answer
  // (a light hit: my call, the spec gives no tier) to whoever hits him, once per action.
  nobody_past:{id:'nobody_past',name:'Nobody Gets Past Me',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'nobody',v:.35}],flags:['taunt'],
    on:{afterHit:{carrier:'target',from:'foe',limit:'action',react:true,effects:[{op:'damage',flavor:['racket'],power:'light',to:'attacker'}]}},
    short:'NOBODY PASSES',color:'#e6c988',weight:7,desc:'Every single-target attack has to aim at Boppy. He has 35% more Defense and grumbles a Racket answer at whoever hits him.'},
  // 1970 Cross-Country Story: the monster's single-target attacks aim at Boppy for 2 of its turns. It still takes its turns (spec).
  story_lock:{id:'story_lock',name:'Stuck In The Story',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[],flags:['lockAim'],
    short:'STORY LOCK',color:'#d9c28a',weight:6,desc:'Boppy is on his 41st telling of the passing field on the last hill: this monster\u2019s single-target attacks must aim at him.'},
  // Warden's Iron Gate: on every family member for 2 rounds. -40% damage from a party-wide act, and a Clobber answer from Boppy to a melee hit.
  iron_gate:{id:'iron_gate',name:'Iron Gate',kind:'buff',group:null,dur:{n:2,unit:'round'},mods:[{stat:'reduce',kind:'gate',v:.40,when:{aoe:true}}],flags:[],
    on:{afterHit:{carrier:'target',from:'foe',tags:['melee'],limit:'action',react:true,answer:'thorns',effects:[{op:'damage',flavor:['clobber'],power:'light',to:'attacker'}]}},
    short:'IRON GATE',color:'#d9b86a',weight:6,desc:'Boppy\u2019s brass-and-iron gate stands in front of the family: 40% less damage from an attack on everyone, and a monster that hits one of them in melee gets a Clobber hit from Boppy.'},
  // "It's Nothing, It's Fine" Chomp: Spiced Up, 3 turns: +30% on his Sizzle hits and a burn answer (light Sizzle, and it leaves Toasty) to a melee hit.
  spiced_up:{id:'spiced_up',name:'Spiced Up',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[{stat:'out',kind:'spiced',v:.30,when:{flavor:'sizzle'}}],flags:[],
    on:{afterHit:{carrier:'target',from:'foe',tags:['melee'],limit:'action',react:true,effects:[{op:'damage',flavor:['sizzle'],power:'light',to:'attacker'}]}},
    short:'SPICED UP',color:'#ff8c5a',weight:6,desc:'Boppy ate a raw pepper and blames the oven: his Sizzle hits do 30% more, and a monster that hits him in melee gets burned.'},
  // "My Stomach Is Doing Something": 25% more Attack after Sizzle chip or self-heat.
  stomach_buzz:{id:'stomach_buzz',name:'Stomach Doing Something',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'stomach',v:.25}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'Boppy\u2019s stomach is doing something: 25% more Attack.'},
  // 1989 Pickle-Jar Bomb: Toasty turned up. It ticks a second burn (so the burn is doubled) and cuts Defense 20%. It goes when Toasty goes
  // (engine/b3-core.js b3EndStatus), so a Detonation of Toasty puts it out too; while it is on, the monster still counts as Toasty (my call).
  five_alarm:{id:'five_alarm',name:'Five-Alarm Burn',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'fiveAlarm',v:-.20}],flags:[],
    tick:{flavor:'sizzle',power:'light'},short:'FIVE-ALARM',color:'#ff5a3c',weight:8,
    desc:'Toasty turned up to five alarms: it burns twice as hard and has 20% less Defense. It stays Toasty, and goes out with the Toasty.'},
  // Locked On the Gold Ball: Nara's mark. The monster takes 20% more Clobber damage from the family; when it is pushed back on the turn
  // bar, Nara gets a free chase bite at it (light Clobber, once a round).
  my_toy:{id:'my_toy',name:'My Toy',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'taken',kind:'myToy',v:.20,when:{flavor:'clobber'}}],flags:[],
    on:{barMoved:{carrier:'target',pushed:true,limit:'round',react:true,answer:'putter',quiet:true,effects:[{op:'damage',flavor:['clobber'],power:'light',to:'attacker'}]}},
    short:'MY TOY',color:'#ffd36b',weight:6,desc:'Nara has her teeth on it: it takes 20% more Clobber damage, and when it is pushed back on the turn bar she gets a free chase bite.'},
  // Relentless Tug-of-War: -25% Attack and Defense for 2 turns.
  tugged:{id:'tugged',name:'Tugged',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'tug',v:-.25},{stat:'def',kind:'tug',v:-.25}],flags:[],
    short:'WEAKENED',color:'#c9a27a',weight:5,desc:'Nara is hanging off it: 25% less Attack and Defense.'},
  // "No Take, Only Throw!": the Attack bonus Nara gets when there was no buff to rip off.
  gold_grip:{id:'gold_grip',name:'Gold Ball Grip',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'goldGrip',v:.35}],flags:[],
    short:'ATTACK UP',color:'#ffd36b',weight:4,desc:'Nara has the gold tennis ball clenched in her teeth: 35% more Attack.'},
  // Jittery Shake-It-Off: +25% Evasion for 1 turn.
  jitter_shake:{id:'jitter_shake',name:'Shaken Off',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'eva',kind:'shake',v:.25}],flags:[],
    short:'DODGY',color:'#9be39a',weight:4,desc:'Nara shook off the jitters and is hard to catch: she dodges 25% more attacks.'},
  // Vacuum-Cleaner Bolt!: kicked-up debris, -20% accuracy for 2 turns. Hiding behind Tom's legs: -50% damage from a party-wide act, 1 turn.
  debris:{id:'debris',name:'Kicked Debris',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'acc',kind:'debris',v:-.20}],flags:[],
    short:'DEBRIS',color:'#b9a58f',weight:4,desc:'Debris in its eyes: each of its attacks has a 20% chance to miss.'},
  behind_legs:{id:'behind_legs',name:'Behind Tom\u2019s Legs',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'reduce',kind:'legs',v:.50,when:{aoe:true}}],flags:[],
    short:'HIDING',color:'#c9d8f0',weight:5,desc:'Nara is hiding behind Tom\u2019s legs: she takes 50% less damage from an attack on the whole family.'},
  // ---- Kit statuses: Amy, Justin and Olivia (stage 10). Every length is a call where the spec prints none. ----
  // Pace-Partner Run: a Speed VALUE, Amy's Speed when she called the run, stored in the status (`v`). b3Stat (engine/b3-core.js) raises the carrier to it.
  pace_run:{id:'pace_run',name:'Pace Run',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['paceRun'],
    short:'PACE RUN',color:'#9be39a',weight:5,desc:'Running beside Amy: Speed raised to match hers when she called the run. It never slows anyone down.'},
  // Follow-Along Finale Burnout: the whole family waits 20% less after each move.
  finale_pace:{id:'finale_pace',name:'Finale Pace',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'moveRec',kind:'finale',v:-.20}],flags:[],
    short:'QUICK MOVES',color:'#9be39a',weight:4,desc:'Still pumped from the finale: waits 20% less after each move.'},
  // "I'm Counting to Three": 20% less Attack for 2 turns.
  detention:{id:'detention',name:'Detention',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'detention',v:-.20}],flags:[],
    short:'DETENTION',color:'#c9a27a',weight:4,desc:'Sent to the corner: 20% less Attack.'},
  // Four-Tab Binder: a mark. When two family members hit it with two different flavors in one round (a Mix) it loses a Composure pip (2 if either hit struck
  // a Pet Peeve or set off a Detonation) and the whole family gains 1 Pep. Then the Binder is used up.
  binder:{id:'binder',name:'Four-Tab Binder',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{mix:{carrier:'target',consume:true,effects:[{op:'composure',n:1,to:'target'},{op:'composure',n:1,to:'target',when:'mixHot'},{op:'pep',n:1,to:'allies'}]}},
    short:'BINDER',color:'#8fd0ff',weight:5,desc:'Amy\u2019s color-coded binder. The first time two family members hit it with two different flavors in one round, it loses a Composure pip (2 on a Pet Peeve or Detonation) and the family gains 1 Pep.'},
  // Gold-Star Sticker: "guaranteed accuracy" is `trueAim` (engine/b3-resolve.js b3Hit): no miss from an accuracy penalty or Evasion, a Blind still holds.
  gold_star:{id:'gold_star',name:'Gold Star',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'out',kind:'goldStar',v:.35},{stat:'healGiven',kind:'goldStar',v:.35}],flags:['trueAim'],
    short:'GOLD STAR',color:'#ffe27a',weight:6,desc:'A giant gold star: hits, heals and shields are 35% stronger, and the hits cannot miss.'},
  // Classroom Lights-Out Reset: the monster cannot use an act that reaches the whole family on its next turn (engine/b3-foe.js b3ActOk).
  lights_out:{id:'lights_out',name:'Lights Out',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[],flags:['noAoe'],
    short:'LIGHTS OUT',color:'#9db4d6',weight:6,desc:'The lights are off and the room is quiet: it cannot use an attack on the whole family on its next turn.'},
  // Stud-Finder Beep & Knock: +15% Clobber taken for 1 turn.
  knocked_loose:{id:'knocked_loose',name:'Knocked Loose',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'taken',kind:'knocked',v:.15,when:{flavor:'clobber'}}],flags:[],
    short:'LOOSE',color:'#e6c988',weight:3,desc:'Rapped by a stud finder: takes 15% more damage from Clobber hits.'},
  // Hang Fresh Drywall: halves the next 2 melee or thrown hits (`hits`, engine/b3-resolve.js b3Hit), or 3 turns if nobody tests it (my call).
  drywall:{id:'drywall',name:'Drywall',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[{stat:'reduce',kind:'drywall',v:.50,when:{tagsAny:['melee','projectile']}}],flags:[],hits:{n:2,tagsAny:['melee','projectile']},
    short:'DRYWALL',color:'#e8e0d0',weight:6,desc:'A fresh drywall wall in front: the next 2 melee or thrown hits on this family member do half damage.'},
  // Measure Twice, Cut Once: the next Clobber or Razzle hit is a sure crit, and the status is used up by it.
  squared_up:{id:'squared_up',name:'Squared Up',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['guaranteeCrit'],critFlavors:['clobber','razzle'],
    short:'SURE CRIT',color:'#ffd27a',weight:6,desc:'Measured twice: the next Clobber or Razzle hit is a sure crit.'},
  // Store-Bought Bread Peace Offering: +20% Attack for 2 turns.
  bread_peace:{id:'bread_peace',name:'Peace Offering',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'bread',v:.20}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'Store-bought bread, allowed: 20% more Attack.'},
  // Live Circuit: Wired. Hitting a Wired monster arcs part of the damage to the others (the Trait, engine data in data/b3-kit-justin.js).
  wired:{id:'wired',name:'Wired',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    short:'WIRED',color:'#ffe27a',weight:5,desc:'Live current runs through it: when Justin hits it, 30% of that damage arcs to every other monster as Razzle.'},
  // "Don't Touch the Copper!" Banner: a banner strung between two monsters. Once a round, when one loses Composure the other loses 1 pip too.
  copper_link:{id:'copper_link',name:'Copper Banner',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{pipsShaved:{carrier:'target',limit:'roundAll',effects:[{op:'composure',n:1,to:'linked'}]}},
    short:'COPPER',color:'#e6a06a',weight:4,desc:'A light-up copper banner links it to the monster beside it. Once a round, when one loses Composure the other loses 1 pip too.'},
  // Main Breaker Flip: a blackout, its counter attacks do not answer (engine/b3-foe.js b3QueueCounters).
  blackout:{id:'blackout',name:'Blackout',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[],flags:['noPassives'],
    short:'BLACKOUT',color:'#9db4d6',weight:6,desc:'The power is out: its counter attacks cannot answer until its next turn is over.'},
  // Rare Heart-Emoji Text: +40% Razzle damage through Justin's next turn.
  static_charge:{id:'static_charge',name:'Static Charge',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'out',kind:'static',v:.40,when:{flavor:'razzle'}}],flags:[],
    short:'CHARGED',color:'#ffe27a',weight:5,desc:'A rare heart-emoji text and a head full of static: Razzle hits do 40% more damage.'},
  // Criss-Cross Double-Under: +20% Evasion and +15% Attack for 2 turns.
  criss_cross:{id:'criss_cross',name:'Criss-Cross',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'crissCross',v:.20},{stat:'atk',kind:'crissCross',v:.15}],flags:[],
    short:'CRISS-CROSS',color:'#9be39a',weight:5,desc:'In the zone: 20% more Evasion and 15% more Attack.'},
  // "Better Than Bobby!" Hype: +30% Crit Rate for 2 turns.
  bobby_hype:{id:'bobby_hype',name:'Hyped Up',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'crit',kind:'bobby',v:.30}],flags:[],
    short:'CRIT UP',color:'#ffd27a',weight:4,desc:'Trash talk worked: 30% more likely to crit.'},
  // Cool-Mist Humidifier: 25% less damage from thrown acts and acts on the whole family for 2 turns.
  cool_mist:{id:'cool_mist',name:'Cool Mist',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'coolMist',v:.25,when:{tagsAny:['projectile','aoe']}}],flags:[],
    short:'COOL MIST',color:'#7cc4f2',weight:5,desc:'Cool mist in the air: takes 25% less damage from thrown attacks and attacks on the whole family.'},
  // Childproofed Locks: blocks the next debuff aimed at the carrier (engine/b3-ops.js b3PutStatus, the blockDebuff flag).
  childproofed:{id:'childproofed',name:'Childproofed',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[],flags:['blockDebuff'],
    short:'CHILDPROOF',color:'#8fe3a6',weight:5,desc:'Cabinet locks on: the next debuff aimed at this family member bounces off, and then the lock is used up.'},
  // ---- Enemy statuses: chapter 1 ----
  jitterflight:{id:'jitterflight',name:'Jitterflight',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'jitter',v:.20}],flags:[],
    short:'JITTER',color:'#d8e68a',weight:4,desc:'Dodges 20% of attacks. It can be stripped.'},
  // Log Lump starts braced: Guard Stance under its own name (bestiary: "Mossy Brace: Guard Stance (2t)").
  mossy_brace:{id:'mossy_brace',name:'Mossy Brace',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#e6c988',weight:5,desc:'Braced: takes 25% less damage. Panic Boil! or a Break ends it.'},
  // The Big One wears Deedee's muffin tin: +15% Attack and Mend 3%. It is one buff, so any buff strip knocks the whole crown off.
  muffin_crown:{id:'muffin_crown',name:'Muffin-Tin Crown',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'crown',v:.15}],flags:[],regen:.03,noSteal:true,
    short:'CROWN',color:'#f2d36b',weight:6,desc:'Wearing Deedee\u2019s muffin tin: 15% more Attack, and it heals a little at the start of each turn. Any buff strip knocks it off.'},
  // ---- Kit statuses: Cozy Rosie and Registered Nut (stage 5c) ----
  // Tattered Lamby Boomerang: a picture that Lamby is out on the monster. The tackle itself is the `later` effect of the Skill; this
  // mark ends when Rose's next turn begins (the same moment the tackle lands).
  lamby_stuck:{id:'lamby_stuck',name:'Lamby Is Out',kind:'mark',group:null,dur:{n:1,unit:'srcBegin'},mods:[],flags:[],
    short:'LAMBY OUT',color:'#d9b8f0',weight:3,desc:'Rose threw Lamby at it. When Rose\u2019s next turn begins, she tackles it to get him back.'},
  // Kingdom of Ten-Thousand Blankets: the castle stands until Rose's next turn begins, when its warmth wave goes off (a `later` effect).
  blanket_castle:{id:'blanket_castle',name:'Blanket Castle',kind:'buff',group:null,dur:{n:1,unit:'begin'},mods:[],flags:[],
    short:'CASTLE',color:'#ffd27a',weight:5,desc:'A blanket castle guarded by two giant Lambies. When Rose\u2019s next turn begins, a wave of Sizzle warmth hits every monster.'},
  // Sofa-Cushion Citadel: nothing on the family can be pushed back on the turn bar while the fort stands (the shield is its own thing).
  pillow_fort:{id:'pillow_fort',name:'Pillow Fort',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[],flags:['pushImmune'],
    short:'FORT',color:'#c9d8f0',weight:6,desc:'Cushion fort with two Lambies on lookout: this family member cannot be pushed back on the turn bar.'},
  // "Bring a Jacket!" Ward: 20% of Max HP back in all over 3 turns (7% a turn: my call, the spec says "20% HP regen (3t)"), and the
  // first knock-out is held at 1 HP. The `survive` flag is used up the first time it saves someone; the regen goes on.
  jacket:{id:'jacket',name:'Extra Jacket',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[],flags:['survive'],regen:.07,
    short:'JACKET',color:'#8fe3a6',weight:7,desc:'Deedee bundled them in an extra jacket: heals a little at the start of each turn, and the first hit that would knock them out leaves them on 1 HP.'},
  // ---- Enemy statuses: chapters 2 to 4 (stage 11, bestiary v11 section 2) ----
  // Starting evasion buffs: each is jitterflight under its own name (20% Evasion, 2 turns, can be stripped).
  paper_swirl:{id:'paper_swirl',name:'Paper Swirl',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'paperSwirl',v:.20}],flags:[],
    short:'SWIRL',color:'#e8e2c4',weight:4,desc:'A whirl of loose tickets: dodges 20% of attacks. It can be stripped.'},
  choppy_bob:{id:'choppy_bob',name:'Choppy Bob',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'choppyBob',v:.20}],flags:[],
    short:'BOBBING',color:'#e6a06a',weight:4,desc:'Bobbing on the waves: dodges 20% of attacks. It can be stripped.'},
  rafter_hover:{id:'rafter_hover',name:'Rafter Hover',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'rafterHover',v:.20}],flags:[],
    short:'HOVER',color:'#cbb8e8',weight:4,desc:'Hovering up in the rafters: dodges 20% of attacks. It can be stripped.'},
  stage_mist:{id:'stage_mist',name:'Stage Mist',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'stageMist',v:.20}],flags:[],
    short:'MIST',color:'#d4dfe8',weight:4,desc:'Hiding in the fog machine\u2019s mist: dodges 20% of attacks. It can be stripped.'},
  // Elites that start braced: Guard Stance under their own names (25% less damage; Panic Boil! or a Break ends it).
  asphalt_crust:{id:'asphalt_crust',name:'Asphalt Crust',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#9a8f86',weight:5,desc:'A hard crust of old asphalt: takes 25% less damage. Panic Boil! or a Break ends it.'},
  sunken_timber:{id:'sunken_timber',name:'Sunken Timber',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#b99a72',weight:5,desc:'Wedged in like a sunken log: takes 25% less damage. Panic Boil! or a Break ends it.'},
  posterboard_shell:{id:'posterboard_shell',name:'Posterboard Shell',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#f0e2a8',weight:5,desc:'Hiding behind a posterboard shell: takes 25% less damage. Panic Boil! or a Break ends it.'},
  // The Big Shake, below half HP: Guard Stance and Mend 5% together ("Faultline Guard"). The stance and the Mend are two statuses so the
  // party's answers differ: Panic Boil! drops the stance, a buff strip or Nara's steal takes the Mend.
  faultline_guard:{id:'faultline_guard',name:'Faultline Guard',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#c8a27a',weight:5,desc:'The ground locks around it: takes 25% less damage. Panic Boil!, a Break or a pull out of guard ends it.'},
  faultline_mend:{id:'faultline_mend',name:'Faultline Mend',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],regen:.05,
    short:'MEND',color:'#8fe3a6',weight:5,desc:'Cracks seal over: it heals 5% of its Max HP at the start of each turn. It can be stripped.'},
  // Canyon Coyote's Pack Howl: every monster gets it. The Director's ACTION! gives every monster a Speed bonus.
  pack_howl:{id:'pack_howl',name:'Pack Howl',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'packHowl',v:.15}],flags:[],
    short:'ATTACK UP',color:'#ffb38a',weight:4,desc:'The pack is fired up: 15% more Attack. It can be stripped.'},
  action_speed:{id:'action_speed',name:'ACTION!',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'actionSpeed',v:.15}],flags:[],
    short:'SPEED UP',color:'#9be39a',weight:4,desc:'\u201cAnd... ACTION!\u201d: 15% faster. It can be stripped.'},
  // Snag's Hook Catch and The Director's Studio Notes (the family's side of it).
  hooked:{id:'hooked',name:'Hooked',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'hooked',v:-.15}],flags:[],
    short:'HOOKED',color:'#b8c9d8',weight:3,desc:'Caught on a fishing hook: 15% slower.'},
  studio_notes:{id:'studio_notes',name:'Studio Notes',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'studioNotes',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#d7a4f5',weight:4,desc:'The director has notes about the stance: 15% less Defense.'},
  // Skill Lock (bestiary 1.1): a Mental status. The family member cannot use the Skills that come from their Pocket Vibe
  // (engine/b3-core.js b3CanUse reads the `skillLock` flag). Their Main Vibe's Basic and Skills still work.
  skill_lock:{id:'skill_lock',name:'Skill Lock',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[],flags:['skillLock'],
    short:'LOCKED',color:'#c9c9d6',weight:7,desc:'Cannot use the Skills from their Pocket Vibe. Their Basic and their Main Vibe Skills still work.'},
  // ---- Enemy statuses: chapter 5, the school (stage 12a, bestiary v11 section 2) ----
  gym_bounce:{id:'gym_bounce',name:'Gym Bounce',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'gymBounce',v:.20}],flags:[],
    short:'BOUNCY',color:'#ff9a6a',weight:4,desc:'Bouncing on its toes: dodges 20% of attacks. It can be stripped.'},
  trick_question:{id:'trick_question',name:'Trick Question',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'trickQ',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#e8d27a',weight:4,desc:'Too busy second-guessing the answer: 15% less Attack.'},
  picked_last:{id:'picked_last',name:'Picked Last',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'pickedLast',v:-.20}],flags:[],
    short:'ATK DOWN',color:'#c9a27a',weight:4,desc:'Picked last for the team: 20% less Attack.'},
  margin_note:{id:'margin_note',name:'Margin Note',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'marginNote',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#e0687a',weight:4,desc:'A red note in the margin points out every weak spot: 15% less Defense.'},
  // SEE ME: a Mental status. While it lasts, this family member's single-target attacks can only aim at the monster that put it on
  // (`foeTaunt`, read in engine/b3-core.js b3Options). The Red Pen fights alone, so nothing else could be aimed at anyway.
  see_me:{id:'see_me',name:'SEE ME',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[],flags:['foeTaunt'],
    short:'SEE ME',color:'#e0687a',weight:7,desc:'Told to stay after class: single-target attacks can only go at the monster that said it.'},
  // Strict Grading: a counter stance, 30% less damage taken. A Mix (two family members, two different flavors, the same round) ends it at once;
  // so do Panic Boil!, Rose\u2019s Whoopee-Cushion Trap and a Break (any stance). Points Off, its counter act, only answers while it stands.
  strict_grading:{id:'strict_grading',name:'Strict Grading',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.30}],flags:[],
    on:{mix:{carrier:'target',consume:true,effects:[]}},
    short:'GRADING',color:'#e0687a',weight:5,desc:'Red pen out: takes 30% less damage, and every hit on it is answered with Points Off. A Mix, Panic Boil! or a Break ends it.'},
  points_off:{id:'points_off',name:'Points Off',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'pointsOff',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#e0687a',weight:4,desc:'Points taken off: 15% less Attack.'},
  // ---- Enemy statuses: chapter 6, Old Oak Park (stage 12b, bestiary v11 section 2) ----
  leaf_camo:{id:'leaf_camo',name:'Leaf Camo',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'leafCamo',v:.20}],flags:[],
    short:'CAMO',color:'#8fc77a',weight:4,desc:'Hidden in a coat of leaves: dodges 20% of attacks. It can be stripped.'},
  code_red:{id:'code_red',name:'Code Red',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'spd',kind:'codeRed',v:.15}],flags:[],
    short:'SPEED UP',color:'#ff8f7a',weight:4,desc:'\u201cCode red!\u201d: 15% faster for 1 turn. It can be stripped.'},
  cheap_seat:{id:'cheap_seat',name:'Cheap Seat Heckle',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'cheapSeat',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#d9b27a',weight:4,desc:'Heckled from the cheap seats: 15% less Attack.'},
  stakeout_mark:{id:'stakeout_mark',name:'Stakeout Mark',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'critTaken',kind:'stakeout',v:.20}],flags:[],
    short:'WATCHED',color:'#e8c07a',weight:4,desc:'Someone is watching from the branches: attacks against this family member crit 20 points more often.'},
  snack_stash:{id:'snack_stash',name:'Snack Stash',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'snackStash',v:.20}],flags:[],
    short:'DEF UP',color:'#d9b27a',weight:4,desc:'Cheeks stuffed with stolen snacks: 20% more Defense. It can be stripped.'},
  executive_monocle:{id:'executive_monocle',name:'Executive Monocle',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[{stat:'crit',kind:'monocle',v:.20},{stat:'atk',kind:'monocle',v:.20}],flags:[],
    short:'MONOCLE',color:'#f2d36b',weight:6,desc:'A very expensive monocle: 20% more Crit Rate and 20% more Attack. It can be stripped or stolen.'},
  winter_hoard:{id:'winter_hoard',name:'Winter Hoard',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'hoard',v:.25},{stat:'def',kind:'hoard',v:.25}],flags:[],
    short:'HOARD',color:'#d9a15a',weight:6,desc:'A belly full of stash: 25% more Attack and Defense. It can be stripped or stolen.'},
  // ---- Enemy statuses: chapter 7, the Library (stage 12c, bestiary v11 section 3) ----
  coiled_spring:{id:'coiled_spring',name:'Coiled Paper Spring',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'coiledSpring',v:.20}],flags:[],
    short:'SPRING',color:'#e6d9a8',weight:4,desc:'Wound tight and ready to pop: dodges 20% of attacks. It can be stripped.'},
  corner_fold:{id:'corner_fold',name:'Corner Fold',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'cornerFold',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#d9c48a',weight:4,desc:'A dog-eared corner: 15% less Defense.'},
  actually:{id:'actually',name:'\u201cActually...\u201d',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'actually',v:-.20}],flags:[],
    short:'DEF DOWN',color:'#c9b8e8',weight:4,desc:'Corrected in front of everyone: 20% less Defense.'},
  well_technically:{id:'well_technically',name:'Well, Technically',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'wellTechnically',v:.20}],flags:[],
    short:'DEF UP',color:'#c9b8e8',weight:4,desc:'Technically correct, which is the best kind of correct: 20% more Defense. It can be stripped.'},
  hush_hour:{id:'hush_hour',name:'Hush Hour',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'hushHour',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#a8c4d9',weight:4,desc:'Everyone is whispering: 15% less Attack.'},
  jump_scare:{id:'jump_scare',name:'Jump-Out Scare',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'jumpScare',v:-.20}],flags:[],
    short:'ATK DOWN',color:'#e8a8a8',weight:4,desc:'Something popped out of the page: 20% less Attack.'},
  bookmark_guard:{id:'bookmark_guard',name:'Bookmark Guard',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#c9a86b',weight:6,desc:'Holding its place in the book: 25% less damage taken until a Break or the end of the stance.'},
  bookmark_mend:{id:'bookmark_mend',name:'Bookmark Mend',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],regen:.05,
    short:'MEND',color:'#c9a86b',weight:5,desc:'A ribbon of calm: recovers 5% of Max HP at the start of each turn.'},
  // ---- Enemy statuses: chapter 8, Division Nine Car Barn (stage 13a, bestiary v11 section 2) ----
  crosswind:{id:'crosswind',name:'Crosswind',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'crosswind',v:.20}],flags:[],
    short:'CROSSWIND',color:'#cfe0e8',weight:4,desc:'Riding a sideways gust: dodges 20% of attacks. It can be stripped.'},
  tin_lid:{id:'tin_lid',name:'Tin Lunchbox Lid',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#b8bcc4',weight:5,desc:'Hiding behind a tin lunchbox lid: takes 25% less damage. Panic Boil! or a Break ends it.'},
  why_bother:{id:'why_bother',name:'Why Bother?',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'whyBother',v:-.20}],flags:[],
    short:'ATK DOWN',color:'#9fb2c4',weight:4,desc:'Why even try? 20% less Attack.'},
  it_touched:{id:'it_touched',name:'It Touched!',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'itTouched',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#d9a8a8',weight:4,desc:'Something touched something else on the plate: 15% less Defense.'},
  full_furnace:{id:'full_furnace',name:'Full Furnace',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'fullFurnace',v:.20}],flags:[],
    short:'ATTACK UP',color:'#ff8a4a',weight:5,desc:'The firebox is roaring: 20% more Attack. It can be stripped.'},
  // Stage 13b: chapter 9, the Rose Dome Ballroom.
  members_only:{id:'members_only',name:'Members Only',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'membersOnly',v:.15}],flags:[],
    short:'DEF UP',color:'#c9a24a',weight:4,desc:'Behind the velvet rope: 15% more Defense. It can be stripped.'},
  hmph:{id:'hmph',name:'Hmph.',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'hmph',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#b9a3c9',weight:4,desc:'Looked down on: 15% less Defense.'},
  gauche:{id:'gauche',name:'How Gauche!',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'gauche',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#c9a3b9',weight:4,desc:'Mortified in front of everyone: 15% less Attack.'},
  cheater:{id:'cheater',name:'Cheater!',kind:'debuff',group:'mental',dur:{n:1,unit:'turn'},mods:[],flags:['foeTaunt'],
    short:'CHEATER!',color:'#d9604a',weight:6,desc:'Called out as a cheater: single-target attacks can only go at the monster that said it.'},
  wall_hug:{id:'wall_hug',name:'Wall Hug',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'wallHug',v:.20}],flags:[],
    short:'WALL HUG',color:'#a8c9a0',weight:4,desc:'Pressed flat against the wall: dodges 20% of attacks. It can be stripped.'},
  facet_spin:{id:'facet_spin',name:'Facet Spin',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'facetSpin',v:.25}],flags:[],
    short:'FACET SPIN',color:'#e8e8ff',weight:5,desc:'Spinning so her mirrors throw every hit off: dodges 25% of attacks. Shatter Glitz! strips it.'},
  // Stage 13c: chapter 10, the Long Island airport terminal.
  bin_drop:{id:'bin_drop',name:'Overhead Bin Drop',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'binDrop',v:-.15}],flags:[],
    short:'DEF DOWN',color:'#b8c4d9',weight:4,desc:'Something shifted during flight and fell on you: 15% less Defense.'},
  middle_seat:{id:'middle_seat',name:'Middle-Seat Elbow',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'middleSeat',v:-.20}],flags:[],
    short:'ATK DOWN',color:'#c4b8d9',weight:4,desc:'Boxed in by a stranger\u2019s elbow: 20% less Attack.'},
  both_armrests:{id:'both_armrests',name:'Both Armrests Claimed',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#9aa7b8',weight:5,desc:'Both armrests, no apologies: takes 25% less damage. Panic Boil! or a Break ends it.'},
  boarding_group:{id:'boarding_group',name:'Boarding Group Nine',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'boardingGroup',v:.20}],flags:[],
    short:'ATTACK UP',color:'#e8c25a',weight:5,desc:'Group Nine is called: 20% more Attack for a turn. It can be stripped.'},
  // Stage 13d: the bonus chapter, Nine Scoops.
  blue_ice:{id:'blue_ice',name:'Blue-Ice Glaze',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#8fd3ff',weight:5,desc:'A hard blue glaze of ice: takes 25% less damage. Panic Boil! or a Break ends it.'},
  scoop_pass:{id:'scoop_pass',name:'Scoop Pass',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'scoopPass',v:.15}],flags:[],
    short:'DEF UP',color:'#ffd6e8',weight:4,desc:'A fresh scoop passed along: 15% more Defense.'},
  frosted_lid:{id:'frosted_lid',name:'Frosted Lid',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25},{stat:'def',kind:'frostedLid',v:.15}],flags:[],
    short:'GUARD',color:'#cfeaff',weight:6,desc:'The tub lid frosts over: takes 25% less damage and has 15% more Defense. Panic Boil! or a Break ends it.'},
  // Stage 18 bonus (b3s18bonusa): the two statuses the Nine Scoops story fights need. The rules that hand them out are in engine/b3-script.js.
  // Frozen: Brain Freeze's cold. The holder loses every turn until it runs out (the `frozen` flag, engine/b3-resolve.js b3BeginTurn); it is not spent by one skipped turn like a Stun.
  frozen:{id:'frozen',name:'Frozen',kind:'debuff',group:null,dur:{n:9,unit:'turn'},mods:[],flags:['frozen'],
    short:'FROZEN',color:'#aee6ff',weight:9,desc:'Frozen solid, mid boo. Loses every turn until it thaws.'},
  // Birthday Girl: Grace's Birthday Sash (the item `g_bsash`). The story layer puts it on her as a fight begins, for her first 2 turns.
  // Battle 2's version: Power, Warmth, Grit and Cool up, Pep up, crits up. Here: 75% more Attack, 50% more Defense, 25% more crit chance, every Skill costs 1 less Pep (never below 1).
  birthday_girl:{id:'birthday_girl',name:'Birthday Girl',kind:'buff',group:null,dur:{n:2,unit:'turn'},
    mods:[{stat:'atk',kind:'sash',v:.75},{stat:'def',kind:'sash',v:.50},{stat:'crit',kind:'sash',v:.25},{stat:'cost',kind:'sash',v:-1}],flags:[],
    short:'BDAY',color:'#ffd24a',weight:5,desc:'Gold and sparkly. For her first 2 turns Grace has 75% more Attack, 50% more Defense, 25% more crit chance, and every Skill costs 1 less Pep.'}
};

// Hazards: things on the floor of one side for a while (the `hazard` op lays them, engine/b3-foe.js trips them).
//   side    'foe' = the side opposite whoever laid it
//   uses    how many units it catches before it is gone; rounds: it also goes after this many round dividers
//   tags    it catches a unit that uses an act with one of these tags and a power above 0
//   out     that act's damage changes by this much (a damage modifier of its own kind)
//   effects ops on the unit it catches; the unit that laid the hazard is the attacker
// Wet-Floor Hazard (spec 3.5): "next 2 physical foes slip (-25% dmg & Clobber fall)". My calls: "physical" means an act
// tagged melee (bestiary 1.7 lists this Skill as an answer to melee), the fall is a light hit, and the slick dries after 3 rounds.
//   any     true: it catches a monster that starts ANY act that is not a wind-up (not only acts with a tag and a power above 0)
const B3_HAZARDS={
  wet_floor:{id:'wet_floor',name:'Wet Floor',side:'foe',uses:2,rounds:3,tags:['melee'],out:-.25,
    effects:[{op:'damage',flavor:['clobber'],power:'light',to:'target'}],short:'WET FLOOR',color:'#8fd0ff',
    desc:'The next monsters to use a melee attack slip: a light Clobber fall, and that attack does 25% less damage.'},
  // Grand Amphora Masterpiece (spec 3.7): "a vessel absorbing 2 hits before shattering". It stands on the FAMILY's floor (`side:'own'`: the
  // side of whoever laid it). `vessel:true` hands it to engine/b3-custom.js: the next `uses` monster attacks that would hit the family do
  // nothing to them (b3VesselTake), and when the last one is soaked, or after `rounds` rounds, it breaks into B3_VESSEL_BURST (b3VesselBurst).
  amphora:{id:'amphora',name:'Grand Amphora',side:'own',uses:2,rounds:4,tags:['vessel'],vessel:true,out:0,effects:[],short:'AMPHORA',color:'#d98c5f',
    desc:'A towering terracotta vase stands in front of the family and soaks the next 2 monster attacks whole. Then it shatters into a heavy Clobber and Razzle hit on every monster, knocking 2 Composure pips off each. It shatters by itself when 4 rounds have passed.'},
  // Bedazzle-Gun Glue Trap (spec 3.2): "acting foes take Sizzle/Razzle chip + 20% Recovery Ticks" for 2 rounds. The chip is a light
  // two-flavor hit (Sizzle then Razzle, half each) and Fatigue is the 20% longer wait. Every monster that acts is caught while it
  // lasts (uses 99 is "no limit"); a wind-up turn is not an act, the act it fires is.
  glue_trap:{id:'glue_trap',name:'Glue Trap',side:'foe',uses:99,rounds:2,any:true,tags:[],out:0,
    effects:[{op:'damage',flavor:['sizzle','razzle'],power:'light',to:'target'},{op:'status',id:'fatigue',to:'target'}],short:'GLUE',color:'#ff9ad0',pop:'STUCK!',verb:'gets stuck in',
    desc:'Hot glue, googly eyes and rhinestones cover the monsters\u2019 floor for 2 rounds. Every monster that acts takes a light Sizzle and Razzle hit and waits 20% longer after its move.'}
};

// ---- Stage 19: the third Vibes (statuses) ----
Object.assign(B3_STATUS,{
  // Grace, Stage Performer. Airborne: an act tagged `ground_sweep` misses her. Poise: +50% Crit Rate for her next attack Skill, and the bar cannot push her.
  airborne:{id:'airborne',name:'Airborne',kind:'stance',group:null,dur:{n:1,unit:'turn'},mods:[],flags:['airborne'],short:'AIRBORNE',color:'#ffd6f2',weight:7,
    desc:'In the air: a monster\u2019s ground sweep misses.'},
  poise:{id:'poise',name:'Poise',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[{stat:'crit',kind:'poise',v:.50}],flags:['pushImmune'],
    on:{actionEnd:{carrier:'source',attacks:true,consume:true,effects:[]}},
    echo:'poise_echo',short:'POISE',color:'#f7a8e0',weight:6,desc:'+50% Crit Rate for her next attack Skill. The turn bar cannot push her.'},
  poise_echo:{id:'poise_echo',name:'Poise Echo',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'crit',kind:'poise',v:.25}],flags:['pushImmune'],
    short:'ECHO',color:'#f2c8ea',weight:3,desc:'Half of Poise lingers for one more turn: +25% Crit Rate.'},
  // Justin, Armchair Ref. Yellow Penalty Flag: the monster takes 25% more from the next hit a family member lands, and that hit pushes it 15 ticks.
  yellow_flag:{id:'yellow_flag',name:'Yellow Flag',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'taken',kind:'flag',v:.25}],flags:[],
    on:{afterHit:{carrier:'target',fromParty:true,effects:[{op:'push',n:15,to:'target'}],consume:true}},
    short:'FLAG',color:'#ffe14d',weight:5,desc:'Takes 25% more from the next hit a family member lands, and that hit pushes it back a little.'},
  // Flag on the Play!: for its next turn the monster cannot use an act that reaches the whole family or one that puts a buff on its side.
  flag_lock:{id:'flag_lock',name:'Play Flagged',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[],flags:['noAoe','noBuff'],
    short:'FLAGGED',color:'#ffd24d',weight:4,desc:'Cannot use an act that hits the whole family or buffs its side on its next turn.'},
  // Jumbotron Instant Replay: the offender is under review.
  under_review:{id:'under_review',name:'Under Review',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'review',v:-.25}],flags:[],
    short:'REVIEW',color:'#ff9f5a',weight:4,desc:'25% less Defense for 2 turns.'},
  // Tom, Star Baker: Three-Tier Showstopper Cake. The family member's next attack adds a Sizzle splash of 30% of what it dealt.
  sparklers:{id:'sparklers',name:'Sparklers',kind:'buff',group:null,dur:{n:3,unit:'turn'},mods:[],flags:[],
    on:{afterHit:{carrier:'source',attacks:true,tgtFoe:true,limit:'action',consume:true,effects:[{op:'splash',of:'dealt',share:.30,flavor:'sizzle',to:'target'}]}},
    short:'SPARKLERS',color:'#ffd27a',weight:5,desc:'Their next attack adds Sizzle damage worth 30% of what it dealt.'},
  // Rose, Prankster. The nose boop takes 10% Speed from the monster for a turn and gives it to Rose.
  nose_boop:{id:'nose_boop',name:'Booped',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'spd',kind:'boop',v:-.10}],flags:[],
    short:'BOOPED',color:'#f9a8c9',weight:2,desc:'10% slower for a turn.'},
  nose_swift:{id:'nose_swift',name:'Sneaky Swift',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'spd',kind:'boop',v:.10}],flags:[],
    short:'SWIFT',color:'#f9c6dc',weight:2,desc:'10% faster for a turn.'},
  // Backup-Lamby Bait & Switch: Rose and tattered Lamby hide until her next turn begins.
  lamby_hide:{id:'lamby_hide',name:'Hiding',kind:'buff',group:null,dur:{n:1,unit:'begin'},mods:[],flags:['untargetable'],
    short:'HIDING',color:'#e8d8f2',weight:7,desc:'Hiding behind the bait: monsters cannot aim at her until her next turn.'},
  // Mega Whoopee-Cushion Trap: embarrassed monsters land only the first hit of a multi-hit act; a Boss is also shaken (25% less Attack).
  embarrassed:{id:'embarrassed',name:'Embarrassed',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[],flags:['fumble'],
    short:'FUMBLE',color:'#ff9ec7',weight:5,desc:'Fumbles a multi-hit act: only its first hit lands.'},
  shamed:{id:'shamed',name:'Shamed',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'shamed',v:-.25}],flags:[],
    short:'ATK DOWN',color:'#ff8fbf',weight:4,desc:'25% less Attack for 2 turns.'},
  // Amy, SuperMom. Backup Iced Coffee on an ally: 15% faster for 2 turns.
  iced_up:{id:'iced_up',name:'Iced Up',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'iced',v:.15}],flags:[],
    short:'SPEED UP',color:'#c9a77c',weight:3,desc:'15% faster for 2 turns.'},
  // Mom-Arm Seatbelt Stop: the arm across the car seat takes half of any act that reaches the whole family.
  seatbelt:{id:'seatbelt',name:'Seatbelt',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'seatbelt',v:.50,when:{aoe:true}}],flags:[],
    short:'SEATBELT',color:'#9fc5e8',weight:6,desc:'Takes half damage from an act that reaches the whole family, for 2 turns.'},
  // Act-One "Inside Voice" Belt: +25% Defense and no bad effects from monsters for 2 turns.
  inside_voice:{id:'inside_voice',name:'Inside Voice',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'voice',v:.25}],flags:['debuffImmune'],
    short:'BELTED',color:'#f2b8ff',weight:7,desc:'25% more Defense, and bad effects from monsters do not land. 2 turns.'},
  // Deedee, Home Cook. Stuffed: nobody leaves the kitchen hungry (her Trait makes a Stuffed ally hit harder and take less). Stuffed Ward is Stuffed with the
  // Warm Apple Muffins' bite: a monster that hits them up close gets burned.
  stuffed:{id:'stuffed',name:'Stuffed',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    short:'STUFFED',color:'#f0c27b',weight:3,desc:'Full of Deedee\u2019s cooking. With her Home Cook Trait on: 15% more damage dealt and 10% less taken.'},
  stuffed_ward:{id:'stuffed_ward',name:'Stuffed (Muffin)',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{afterHit:{carrier:'target',from:'foe',tags:['melee'],limit:'action',react:true,effects:[{op:'damage',flavor:['sizzle'],power:'light',to:'attacker'}]}},
    short:'MUFFIN',color:'#e8a85c',weight:4,desc:'Stuffed with warm muffins: a monster that hits them up close takes a light Sizzle burn.'},
  // Wine O'Clock Pour: the monsters wobble, 10% less Evasion for a turn.
  tipsy:{id:'tipsy',name:'Tipsy',kind:'debuff',group:'mental',dur:{n:1,unit:'turn'},mods:[{stat:'eva',kind:'tipsy',v:-.10}],flags:[],
    short:'TIPSY',color:'#c58be0',weight:2,desc:'10% less Evasion for a turn.'},
  // Full-House Sunday Dinner: for 2 rounds each of their turns starts with a heal, 1 Pep and a random boost.
  sunday_dinner:{id:'sunday_dinner',name:'Sunday Dinner',kind:'buff',group:null,dur:{n:2,unit:'round'},mods:[],flags:[],
    on:{turnStart:{carrier:'source',show:true,effects:[{op:'heal',pct:.15,to:'self'},{op:'pep',n:1,to:'self'},{op:'status',oneOf:['dinner_atk','dinner_def','dinner_spd'],to:'self'}]}},
    short:'DINNER',color:'#ffd9a0',weight:8,desc:'The family is at the table: each turn starts with a 15% heal, 1 Pep and a random boost.'},
  dinner_atk:{id:'dinner_atk',name:'Seconds (Attack)',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'dinner',v:.15}],flags:[],
    short:'ATK UP',color:'#ffb27a',weight:2,desc:'15% more Attack for a turn.'},
  dinner_def:{id:'dinner_def',name:'Seconds (Defense)',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'def',kind:'dinner',v:.15}],flags:[],
    short:'DEF UP',color:'#b0c7e8',weight:2,desc:'15% more Defense for a turn.'},
  dinner_spd:{id:'dinner_spd',name:'Seconds (Speed)',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'spd',kind:'dinner',v:.15}],flags:[],
    short:'SPEED UP',color:'#b7e8a8',weight:2,desc:'15% more Speed for a turn.'},
  // TNB, Scream King. Spooked: its next hit misses 30% more and does 30% less; anyone faster than it, or Airborne, crits it for sure.
  spooked:{id:'spooked',name:'Spooked',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[{stat:'acc',kind:'spooked',v:-.30},{stat:'out',kind:'spooked',v:-.30},{stat:'critTaken',kind:'spooked',v:1,when:{attackerFast:true}}],flags:[],
    on:{afterHit:{carrier:'source',limit:'action',consume:true,effects:[]}},
    short:'SPOOKED',color:'#a78bd6',weight:5,desc:'Its next hit misses 30% more and does 30% less. A faster family member, or one in the air, always crits it.'},
  // Nara, Picky Princess. Unimpressed Sniff: the monster's next hit does 20% less.
  snubbed:{id:'snubbed',name:'Snubbed',kind:'debuff',group:'mental',dur:{n:2,unit:'turn'},mods:[{stat:'out',kind:'snub',v:-.20}],flags:[],
    on:{afterHit:{carrier:'source',limit:'action',consume:true,effects:[]}},
    short:'SNUBBED',color:'#c9b3a0',weight:3,desc:'Its next hit does 20% less damage.'},
  // Weaponized Puppy Eyes: it will not aim at Nara, and hits 35% weaker, for its next turn.
  puppy_eyes:{id:'puppy_eyes',name:'Puppy Eyes',kind:'debuff',group:'mental',dur:{n:1,unit:'turn'},mods:[{stat:'out',kind:'puppy',v:-.35}],flags:['avoidSrc'],
    short:'PUPPY EYES',color:'#e0b890',weight:5,desc:'Will not aim at Nara and does 35% less damage on its next turn.'},
  plate_warm:{id:'plate_warm',name:'Warm Plate',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'plate',v:.20}],flags:[],
    short:'ATK UP',color:'#ffc27a',weight:3,desc:'20% more Attack for 2 turns.'},
  high_standards:{id:'high_standards',name:'High Standards',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'crit',kind:'standards',v:.15}],flags:[],
    short:'CRIT UP',color:'#ffe0a8',weight:3,desc:'15% more Crit Rate for 2 turns.'},
  fuss:{id:'fuss',name:'Fussing Over Her',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'fuss',v:.15}],flags:[],
    short:'SPEED UP',color:'#c8e8b0',weight:3,desc:'15% faster for 2 turns.'},
  // Olivia, News Anchor. On the Record: every monster is exposed for the whole fight (it cannot be cleansed): the family crits it 15% more.
  on_record:{id:'on_record',name:'On the Record',kind:'mark',group:null,dur:{n:99,unit:'turn'},mods:[{stat:'critTaken',kind:'record',v:.15}],flags:['noCleanse'],
    short:'ON RECORD',color:'#ffe08a',weight:1,desc:'Exposed: the family crits it 15% more. Cannot be cleansed.'},
  mic_in_face:{id:'mic_in_face',name:'Mic in Face',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'mic',v:-1}],flags:[],
    short:'MIC',color:'#ffd0a0',weight:3,desc:'Cannot dodge for 2 turns: the mic is right in its face.'},
  // Breaking Exclusive: a Pet Peeve or other resistance counts one step weaker (a resistance becomes neutral).
  stripped_defenses:{id:'stripped_defenses',name:'Exposed',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['resistStep'],
    short:'EXPOSED',color:'#ff7a9a',weight:4,desc:'Its resistances count one step weaker for 2 turns.'},
  ruckus_boost:{id:'ruckus_boost',name:'Breaking News',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['ruckusBoost'],
    on:{actionEnd:{carrier:'source',consume:true,effects:[]}},
    short:'BREAKING',color:'#ff5a5a',weight:1,desc:'Ruckus gains from this action are 25% bigger.'}
});

// Stage 22 (chapter 11, the airport the family is diverted to): the four statuses its monsters use. Lost Luggage's Frantic Rummage lowers Defense,
// the Standby Sprite's Seat Seventeen lowers Speed and its Podium Counter is the Guard Stance it starts in, and FINAL CALL's Rebooking Stampede
// speeds up every monster for 2 turns. (Fatigue, Slow, Blind and Dazzled are the shared rows above.)
Object.assign(B3_STATUS,{
  rummaged:{id:'rummaged',name:'Frantic Rummage',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'rummage',v:-.20}],flags:[],
    short:'DEF DOWN',color:'#c9b79a',weight:4,desc:'Mismatched socks flung everywhere and a suitcase sitting on your bag: 20% less Defense.'},
  seat_seventeen:{id:'seat_seventeen',name:'Seat Seventeen',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'seat17',v:-.15}],flags:[],
    short:'SPEED DOWN',color:'#b3c2d6',weight:4,desc:'Stuck in a seat that is not yours: 15% less Speed.'},
  podium_counter:{id:'podium_counter',name:'Podium Counter',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#9db0c9',weight:5,desc:'Standing behind the gate podium: takes 25% less damage. Panic Boil! or a Break ends it.'},
  stampede:{id:'stampede',name:'Rebooking Stampede',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'stampede',v:.20}],flags:[],
    short:'SPEED UP',color:'#e8b35a',weight:5,desc:'Everyone rebooked at once and running for the gate: 20% more Speed. It can be stripped.'}
});

// Stage 22 (chapter 12, Tom's street): Gridlock Prime's Four-Way Red Light is a Guard Stance (30% less damage) and two buffs, so the family's answers differ:
// Panic Boil! or a Break drops the stance, a buff strip or Nara's steal takes the buffs, and "Is This Real?" Fact-Check turns the heaviest one (Defense) against it.
Object.assign(B3_STATUS,{
  four_way_red_light:{id:'four_way_red_light',name:'Four-Way Red Light',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.30}],flags:[],
    short:'GUARD',color:'#e0504a',weight:5,desc:'Every light on the block is red and nothing gets through: takes 30% less damage. Panic Boil!, a Break or a pull out of guard ends it.'},
  red_light_def:{id:'red_light_def',name:'Red Light Plating',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'redLightDef',v:.30}],flags:[],
    short:'DEF UP',color:'#d98a5a',weight:6,desc:'Bumper to bumper to bumper: 30% more Defense. It can be stripped, and a Fact-Check turns it against it.'},
  red_light_atk:{id:'red_light_atk',name:'Red Light Rage',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'redLightAtk',v:.25}],flags:[],
    short:'ATK UP',color:'#f08a6a',weight:5,desc:'Stuck so long it is furious: 25% more Attack. It can be stripped.'}
});

// Stage 22 (chapter 13, the tunnel and the dent in the dome wall): the statuses its monsters use. The Signal Fault's Track-Block Arm and the Turnstile Grump's Locked
// Tripod are the Guard Stance they start in; Tap Out! and Deep Bore lower Defense 20%; the Gold Knight's Raised Palm lowers Attack 15% for one turn and his Gold Guard is
// the Guard Stance he takes when he Stands Still. (Slow, Fatigue, Blind, Bleed, Toasty, Dazzled, Skill Lock and Mend are the shared rows above.)
Object.assign(B3_STATUS,{
  track_block_arm:{id:'track_block_arm',name:'Track-Block Arm',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#d9a441',weight:5,desc:'A striped crossing arm held down across the track: takes 25% less damage. Panic Boil! or a Break ends it.'},
  locked_tripod:{id:'locked_tripod',name:'Locked Tripod',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#aab3bd',weight:5,desc:'The three steel bars locked in place: takes 25% less damage. Panic Boil! or a Break ends it.'},
  tap_out:{id:'tap_out',name:'Tap Out!',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'tapout',v:-.20}],flags:[],
    short:'DEF DOWN',color:'#9fb0c4',weight:4,desc:'Your card was rejected and a turnstile is sitting on your pockets: 20% less Defense.'},
  deep_bore:{id:'deep_bore',name:'Deep Bore',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'def',kind:'deepbore',v:-.20}],flags:[],
    short:'DEF DOWN',color:'#a8896a',weight:4,desc:'The drill went straight through your guard: 20% less Defense.'},
  raised_palm:{id:'raised_palm',name:'Raised Palm',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'atk',kind:'palm',v:-.15}],flags:[],
    short:'ATK DOWN',color:'#e2c36b',weight:3,desc:'One gold palm held up, and you stop short: 15% less Attack.'},
  gold_guard:{id:'gold_guard',name:'Gold Guard',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#f0d27a',weight:5,desc:'Knees locked and standing very still: takes 25% less damage. Panic Boil! or a Break ends it.'}
});
