'use strict';
// data/b3-status.js — Battle 3: one row per status, buff, stance, mark and Prime (architecture section 2.3), and the hazards.
//   kind    buff, debuff, prime, stance or mark
//   group   'mental' for the statuses a mental cleanse removes (spec 2.8), else null
//   dur     {n, unit}: unit 'turn' counts the carrier's own turns (at the end of each), 'round' counts round dividers,
//           'begin' ends when the carrier's next turn begins (Flustered)
//   mods    [{stat, kind, v}]: `kind` is the stacking bucket. Same kind adds, different kinds multiply (spec 2.4).
//           stats: spd, atk, def (the stat itself), out (damage dealt), taken (damage taken), reduce (damage reduction),
//           crit (own Crit Rate), critTaken (Crit Rate of attacks against it), eva (Evasion), acc (chance its attacks miss,
//           written as a negative accuracy), aggro (target weight), recovery (Recovery Ticks), healGiven (heals and shields given)
//   flags   blind (its next single-target attack misses, then the status is used up), skipTurn (loses its next turn, then the
//           status is used up), taunt (enemy single-target attacks must aim at the carrier), untargetable, pushImmune
//   tick    damage at the start of each of the carrier's turns
//   regen   healing at the start of each of the carrier's turns, as a share of Max HP
//   intercept {reduce}: single-target hits aimed at the carrier land on the unit that put this status on, that much weaker
//   on      {hook:{...}}: a reaction (engine/b3-hooks.js)
//   weight  which icons show when there are more than 3 (higher first)
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
  // ---- Kit statuses: the second Sig Vibes (stage 4: their Basics and three Skill 1s) ----
  off_key:{id:'off_key',name:'Off Key',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'screech',v:-.20}],flags:[],
    short:'OFF KEY',color:'#d7a4f5',weight:4,desc:'Grace’s violin is still ringing in its ears: 20% less Attack.'},
  pinched:{id:'pinched',name:'Little Pinch',kind:'debuff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'critTaken',kind:'pinch',v:.15}],flags:[],
    short:'PINCHED',color:'#f0c27b',weight:3,desc:'Attacks against it crit 15% more often.'},
  all_better:{id:'all_better',name:'All Better',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'allBetter',v:.20}],flags:[],
    short:'ALL BETTER',color:'#8fe3a6',weight:4,desc:'Deedee made it better: 20% more Attack.'},
  // ---- Enemy statuses: chapter 1 ----
  jitterflight:{id:'jitterflight',name:'Jitterflight',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'jitter',v:.20}],flags:[],
    short:'JITTER',color:'#d8e68a',weight:4,desc:'Dodges 20% of attacks. It can be stripped.'},
  // Log Lump starts braced: Guard Stance under its own name (bestiary: "Mossy Brace: Guard Stance (2t)").
  mossy_brace:{id:'mossy_brace',name:'Mossy Brace',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#e6c988',weight:5,desc:'Braced: takes 25% less damage. Panic Boil! or a Break ends it.'},
  // The Big One wears Deedee's muffin tin: +15% Attack and Mend 3%. It is one buff, so any buff strip knocks the whole crown off.
  muffin_crown:{id:'muffin_crown',name:'Muffin-Tin Crown',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'atk',kind:'crown',v:.15}],flags:[],regen:.03,
    short:'CROWN',color:'#f2d36b',weight:6,desc:'Wearing Deedee\u2019s muffin tin: 15% more Attack, and it heals a little at the start of each turn. Any buff strip knocks it off.'}
};

// Hazards: things on the floor of one side for a while (the `hazard` op lays them, engine/b3-foe.js trips them).
//   side    'foe' = the side opposite whoever laid it
//   uses    how many units it catches before it is gone; rounds: it also goes after this many round dividers
//   tags    it catches a unit that uses an act with one of these tags and a power above 0
//   out     that act's damage changes by this much (a damage modifier of its own kind)
//   effects ops on the unit it catches; the unit that laid the hazard is the attacker
// Wet-Floor Hazard (spec 3.5): "next 2 physical foes slip (-25% dmg & Clobber fall)". My calls: "physical" means an act
// tagged melee (bestiary 1.7 lists this Skill as an answer to melee), the fall is a light hit, and the slick dries after 3 rounds.
const B3_HAZARDS={
  wet_floor:{id:'wet_floor',name:'Wet Floor',side:'foe',uses:2,rounds:3,tags:['melee'],out:-.25,
    effects:[{op:'damage',flavor:['clobber'],power:'light',to:'target'}],short:'WET FLOOR',color:'#8fd0ff',
    desc:'The next monsters to use a melee attack slip: a light Clobber fall, and that attack does 25% less damage.'}
};
