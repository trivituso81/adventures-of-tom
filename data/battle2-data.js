'use strict';
// data/battle2-data.js — Numbers for the battle system (claude/battle-design.md sections 2 to 5).
// Stats, elements, statuses, every character's kit, enemy stat blocks, formations and Battle Lab fights.
// engine/battle2.js runs the fight, engine/battle2-ui.js draws it, engine/battle2-moves.js plays the animations.

// ---- Stats: [level 1, level 50] for each of the six stats. Values in between are a straight line. ----
const B2_STAT_KEYS=['hp','pow','grit','warmth','cool','pep'];
const B2_STAT_NAMES={hp:'HP',pow:'POW',grit:'GRIT',warmth:'WARMTH',cool:'COOL',pep:'PEP'};
const B2_STATS={
  tom:   {hp:[110,950],pow:[14,90],grit:[13,88],warmth:[12,80],cool:[13,86],pep:[11,70]},
  grace: {hp:[ 90,780],pow:[11,74],grit:[10,66],warmth:[14,92],cool:[11,72],pep:[14,90]},
  rose:  {hp:[ 84,740],pow:[10,72],grit:[ 9,62],warmth:[13,88],cool:[10,70],pep:[15,92]},
  amy:   {hp:[104,900],pow:[15,96],grit:[11,74],warmth:[11,76],cool:[11,74],pep:[15,94]},
  deedee:{hp:[ 96,860],pow:[10,68],grit:[13,86],warmth:[16,99],cool:[13,88],pep:[11,72]},
  boppy: {hp:[120,999],pow:[15,94],grit:[16,99],warmth:[10,70],cool:[11,76],pep:[ 9,60]},
  tnb:   {hp:[100,880],pow:[12,80],grit:[11,76],warmth:[15,94],cool:[16,99],pep:[12,78]},
  nara:  {hp:[ 92,800],pow:[15,94],grit:[10,68],warmth:[11,74],cool:[10,66],pep:[17,99]}
};
function b2Stat(id,key,lvl) { const r=(B2_STATS[id]||B2_STATS.tom)[key]; return Math.round(r[0]+(r[1]-r[0])*(Math.max(1,Math.min(50,lvl))-1)/49); }

// ---- Resources (section 2) ----
const B2_VP={cap:10,start:5,regen:2,basic:1};
// CTB: ticks until next turn = floor(1200/(PEP+30) * weight). Weights: quick 0.7, standard 1.0, heavy 1.3.
const B2_WEIGHT={quick:.7,standard:1,heavy:1.3,instant:.01};   // instant: Tom's Diamond Medallion (engine/battle2-traits.js)

// ---- Six everyday elements (section 3). Weak hits x1.5, resisted hits x0.5. ----
const B2_ELEMS={
  kinetic:{name:'Kinetic',color:'#f1e2c0',dark:'#8a7650',icon:'K'},
  cozy:   {name:'Cozy',   color:'#ff9a4a',dark:'#a8401c',icon:'C'},
  splash: {name:'Splash', color:'#6cc4f0',dark:'#1f6a9a',icon:'S'},
  sparkle:{name:'Sparkle',color:'#ffe27a',dark:'#b08a1c',icon:'*'},
  chatter:{name:'Chatter',color:'#d2b8f0',dark:'#6a4a9a',icon:'~'},
  amber:  {name:'Amber',  color:'#e8b048',dark:'#7a5010',icon:'A'}
};
const B2_WEAK=1.5,B2_RESIST=.5;

// ---- Statuses (section 3 plus the stat ups and downs the path skills need) ----
// turns count down at the start of the owner's turn. mod: stat changes (+.3 = +30%). taken: damage taken change.
// skip: the owner loses its next turn. miss: chance its single attacks miss. evade: chance single attacks on it miss.
const B2_STATUS={
  guarded: {name:'Bodyguarded',short:'GUARDED',color:'#f0c75a',buff:true},
  guard:   {name:'Guarding',short:'GUARD',color:'#f0c75a',buff:true},
  brace:   {name:'Guard',short:'GUARD',color:'#f0c75a',buff:true,taken:-.5},
  pumped:  {name:'Pumped Up',short:'PUMPED',color:'#ffd166',buff:true,next:.5},
  tucked:  {name:'Tucked In',short:'TUCKED',color:'#ff9ac0',buff:true,regen:.15,mod:{grit:.25,cool:.25}},
  fresh:   {name:'Wardrobe Fresh',short:'FRESH',color:'#9fd8ff',buff:true,autoRevive:.5,immune:true},
  shield:  {name:'Nobody Gets Past',short:'SAFE',color:'#9fd8ff',buff:true,taken:-.4},
  powup:   {name:'POW Up',short:'POW+',color:'#ffb070',buff:true,mod:{pow:.3}},
  gritup:  {name:'GRIT Up',short:'GRIT+',color:'#c9d6a0',buff:true,mod:{grit:.3}},
  pepup:   {name:'PEP Up',short:'PEP+',color:'#9be39a',buff:true,mod:{pep:.3}},
  kilnglow:{name:'Kiln Glow',short:'GLOW',color:'#ffb070',buff:true,mod:{warmth:.25,cool:.25}},
  warmup:  {name:'WARMTH Up',short:'WARM+',color:'#ff9ac0',buff:true,mod:{warmth:.25}},
  best:    {name:'Personal Best',short:'BEST',color:'#ffe08a',buff:true,mod:{pow:.3,warmth:.3}},
  critup:  {name:'Glitter Nails',short:'CRIT+',color:'#ffe27a',buff:true,crit:.25,reflect:.2},
  costume: {name:'Genre Costume',short:'COSTUME',color:'#c9b3e6',buff:true,mod:{pow:.25,grit:.25}},
  evade:   {name:'Evasive',short:'EVADE',color:'#d2b8f0',buff:true,evade:.5},
  decoy:   {name:'Spotlight',short:'SPOT',color:'#ffe08a',buff:true},
  pietin:  {name:'Pie Tin',short:'PIE TIN',color:'#e8d5a0',buff:true,mod:{grit:.5},perm:true},
  goofed:  {name:'Goofed',short:'GOOFED',color:'#ffb0d0',debuff:true,skip:true},
  smitten: {name:'Smitten',short:'SMITTEN',color:'#ff9ac0',debuff:true,skip:true},
  staggered:{name:'Staggered',short:'STAGGER',color:'#ffe08a',debuff:true,skip:true,taken:.5},
  grumbled:{name:'Grumbled',short:'GRUMBLED',color:'#cfd8d6',debuff:true,mod:{pow:-.3,warmth:-.3}},
  shushed: {name:'Shushed',short:'SHUSHED',color:'#9aa3c8',debuff:true,mental:true},
  amber:   {name:'Amber-Stuck',short:'AMBER',color:'#e8b048',debuff:true,mod:{pep:-.5}},
  slow:    {name:'Slowed',short:'SLOW',color:'#9fd0ff',debuff:true,mod:{pep:-.2}},
  drowsy:  {name:'Drowsy',short:'PEP-',color:'#9fd0ff',debuff:true,mod:{pep:-.3}},
  frozen:  {name:'Scared Stiff',short:'FROZEN',color:'#9fd0ff',debuff:true,mod:{pep:-.4}},
  dizzy:   {name:'Dizzy',short:'DIZZY',color:'#d2b8f0',debuff:true,miss:.25,mental:true},
  gritdown:{name:'GRIT Down',short:'GRIT-',color:'#f3a08c',debuff:true,mod:{grit:-.25}},
  cooldown:{name:'COOL Down',short:'COOL-',color:'#f3a08c',debuff:true,mod:{cool:-.25}},
  powdown: {name:'POW Down',short:'POW-',color:'#f3a08c',debuff:true,mod:{pow:-.25}},
  pinned:  {name:'Hooked',short:'HOOKED',color:'#9fd8ff',debuff:true},
  stunned: {name:'Seeing Stars',short:'STUN',color:'#ffe08a',debuff:true,skip:true},
  // Chapter 4 (Backlot Bedlam). Silenced: no ▶ Skills. Fogged In: their own attacks can miss. Cut: loses the next turn
  // (the Director's Cut's CUT!; Wardrobe Fresh blocks it like any debuff).
  silenced:{name:'Silenced',short:'MUTED',color:'#9aa3c8',debuff:true,mental:true},
  fogged:  {name:'Fogged In',short:'FOGGED',color:'#cfd8d6',debuff:true,miss:.3},
  cut:     {name:'Cut!',short:'CUT',color:'#ff8f80',debuff:true,skip:true},
  // Chapter 5 (Long Island Elementary). Tardy and Glued: they act later. See Me: the Red Pen's mark, double damage taken.
  tardy:   {name:'Tardy',short:'TARDY',color:'#ffd166',debuff:true,mod:{pep:-.35}},
  glued:   {name:'Glued',short:'GLUED',color:'#e9c9ff',debuff:true,mod:{pep:-.3}},
  seeme:   {name:'See Me',short:'SEE ME',color:'#ff5a4a',debuff:true,taken:1},
  // Chapter 6 (Old Oak Park). Heckled: WARMTH down (kind moves and heals go weaker). Spotted: the Twig Spy's mark, takes more.
  heckled: {name:'Heckled',short:'HECKLED',color:'#e3c394',debuff:true,mod:{warmth:-.3},mental:true},
  spotted: {name:'Spotted',short:'SPOTTED',color:'#9fd8ff',debuff:true,taken:.35},
  // Chapter 8 (the Car Barn). Chilled: WARMTH and PEP down. Heat 1 to 4: Old Ironbelly's oven heat (shown over her; not a
  // buff or debuff, so nothing cures or steals it; engine/battle2.js B2_IRON sets it).
  chilled: {name:'Chilled',short:'CHILLED',color:'#9fd8ff',debuff:true,mod:{warmth:-.25,pep:-.15}},
  heat1:   {name:'Warm',short:'WARM',color:'#ffd27a',perm:true},
  heat2:   {name:'Hot',short:'HOT',color:'#ffb04a',perm:true},
  heat3:   {name:'Very Hot',short:'HOTTER',color:'#ff8a3a',perm:true},
  heat4:   {name:'BROIL',short:'BROIL',color:'#ff5a3a',perm:true},
  // Chapter 9 (the Moon Club). Snubbed: WARMTH and COOL down (a Velvet Rope says you are not on the list). Mirror sides:
  // the Mirrorball's mirrored element (shown over her; engine/battle2.js B2_BALL sets it). Spotlit: her SOLO is coming.
  snubbed: {name:'Snubbed',short:'SNUBBED',color:'#d8506a',debuff:true,mod:{warmth:-.2,cool:-.2},mental:true},
  mirsparkle:{name:'Mirror: Sparkle',short:'MIRROR *',color:'#ffe27a',perm:true},
  mirkinetic:{name:'Mirror: Kinetic',short:'MIRROR K',color:'#f1e2c0',perm:true},
  mirsplash:{name:'Mirror: Splash',short:'MIRROR S',color:'#6cc4f0',perm:true},
  mircozy:  {name:'Mirror: Cozy',short:'MIRROR C',color:'#ff9a4a',perm:true},
  // Chapter 10 (Terminal Zero). Boarding: the Last Call called this person (they must act before her next turn; not a
  // buff or debuff, so nothing cures or steals it). Grounded: the gate closed on them, so they lose their next turn.
  boarding:{name:'Now Boarding',short:'BOARDING',color:'#f2c75a',perm:true},
  grounded:{name:'Gate Closed',short:'GROUNDED',color:'#ff8f80',debuff:true,skip:true},
  // Traits (F4b, engine/battle2-traits.js). hide: shown as the trait badge on the party card instead of a status tag.
  shoulder:{name:'Shoulder Ride',short:'RIDE',color:'#ffb3cf',buff:true,hide:true},
  hero:    {name:'Action Hero',short:'HERO',color:'#ffb070',buff:true,mod:{pow:.25,grit:.25},costume:true},
  cardigan:{name:'Cozy Cardigan',short:'CARDIGAN',color:'#c9b3e6',buff:true,mod:{warmth:.25,cool:.25},costume:true},
  finalgirl:{name:'Final Girl',short:'FINAL GIRL',color:'#ff9ac0',buff:true,autoRevive:.5,costume:true}
};
// TNB's Quick-Change Rack: WARDROBE and Quick Change dress the target in the next costume, in this order, round and round.
const B2_RACK=[{id:'hero',name:'Action Hero',tag:'HERO',c:'#ffb070',c2:'#5a3a2a',does:'POW and GRIT +25%'},
  {id:'cardigan',name:'Cozy Cardigan',tag:'COZY',c:'#c9b3e6',c2:'#ffd166',does:'WARMTH and COOL +25%'},
  {id:'finalgirl',name:'Final Girl',tag:'GIRL',c:'#ff9ac0',c2:'#fff1cb',does:'gets right back up once if knocked out'}];
// Trait numbers (battle-design section 5, Unique Mechanics).
const B2_TRAIT={miles:3,trend:[1,1.2,1.5],ride:4,rideHit:.4,cadence:.05,cadenceMax:5,crustMax:3,crustHeal:.2,burnMax:3,ghostPip:.3};

// ---- Kits (section 5). Every character has a free basic (D-pad Up), a signature special (Down) and path skills (Right).
// Fields: key (the animation in RECRUIT_MOVES and the spoken line in LINES), name, vp, elem, stat (pow, warmth or hybrid),
// mult, hits, target (enemy, splash, row, front, all, multi, ally, party, self), weight (quick, standard, heavy),
// fx (effects after the hits: [op, ...args], see b2Effect in engine/battle2.js), support (true: a support animation
// from engine/battle2-moves.js instead of the attack animation), crit (extra crit chance; 1 = always).
// Until F6 (Stampcards) everyone knows every path skill.
const B2_SKILLS={
  tom:{
    basic:{key:'mash',name:'Press Start',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',
      desc:'Fast controller combo. Free, and gives +1 VP.'},
    special:{key:'defend',name:'DEFEND',vp:1,target:'ally',weight:'quick',kind:'defend',
      desc:'Step in front of an ally for 2 turns. Hits aimed at them go to Tom, 40% softer.'},
    skills:[
      {key:'starter',name:'Starter Splash',vp:2,elem:['splash'],stat:'warmth',mult:1.2,target:'row',weight:'standard',fx:[['st','slow',3,'t']],
        desc:'Splashes sourdough starter across a row. Slows them (PEP -20%).'},
      {key:'dutch',name:'Dutch Oven',vp:4,elem:['cozy'],stat:'pow',mult:1.8,target:'enemy',weight:'heavy',fx:[['heal',.3,0,'lowest']],
        desc:'Drops a cast-iron pot. The hot boule heals the most hurt ally 30%.'},
      {key:'unbox',name:'Unboxing',vp:3,elem:['sparkle'],target:'party',weight:'standard',support:true,fx:[['randbuff',3,'party']],
        desc:'A fresh gadget for everyone: POW, GRIT or PEP +30% for 3 turns.'},
      {key:'delta',name:'Delta One',vp:5,elem:['cozy','kinetic'],stat:'warmth',mult:2.2,target:'all',weight:'heavy',fx:[['refill','self']],
        desc:'A lie-flat pod crosses the screen. Hits all. Refills Tom’s VP.'},
      {key:'flashcard',name:'Flashcard Flurry',vp:2,elem:['chatter'],stat:'warmth',mult:.5,hits:3,target:'multi',weight:'standard',fx:[['reveal','allFoes']],
        desc:'Three flashcards at random enemies. Shows every weakness.'},
      {key:'kanji',name:'Kanji Strike',vp:4,elem:['sparkle'],stat:'warmth',mult:2,target:'enemy',weight:'standard',debuffBonus:.5,
        desc:'A glowing brushstroke. +50% if the target has a debuff.'},
      {key:'finalboss',name:'Final Boss',vp:6,elem:['kinetic','sparkle'],stat:'hybrid',mult:2.8,target:'all',weight:'heavy',
        desc:'A 16-bit limit break. Hits all enemies.'}
    ],
    // Option 3 Primary kit (option3-implementation-brief.md, phase 3a). Cards: adventures-of-tom-ability-revamp.md.
    // o3:true moves use the Option 3 effect registry (engine/battle2-effects.js). sig:true is the signature version:
    // DEFEND keeps its legacy resolver (engine/battle2.js b2DefendSteps); only the animation is new.
    // data/abilities.js B8_KITS says which slot each key belongs to (engine/progress.js b8Move picks the version).
    o3:[
      {key:'button_mash',name:'Press Start',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',o3:true,
        desc:'Tom presses one button. Nothing connects. He throws the controller. Free, and gives +1 VP.'},
      {key:'defend',sig:true,name:'DEFEND',vp:1,target:'ally',weight:'quick',kind:'defend',o3:true,
        desc:'Step in front of an ally for 2 turns. Hits aimed at them go to Tom, 40% softer.'},
      {key:'starter_splash',name:'Starter Splash',vp:2,elem:['splash'],stat:'warmth',mult:1.35,target:'enemy',weight:'quick',o3:true,
        fx:[['ctq',.10,'t']],desc:'Bready Mercury burps a wave of bubbly starter across the row; it crashes on one enemy. Pushes its next turn back a little.'},
      {key:'sourdough_snob',name:'Sourdough Snob',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.30,.4,'t'],['cure','amber','t']],desc:'Tom feeds an ally warm bread during an unsolicited lecture on wild yeast. Heals 30% and clears Amber-Stuck. Kind on a monster.'},
      {key:'overpriced_gadget',name:'Retail Therapy',vp:4,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.18,.4,'party'],['crust',1,'deedee']],desc:'Tom unboxes a ridiculously expensive gadget and the joy heals the party 18%. Deedee adds a Warm Crust. The receipt keeps printing. Kind on a monster.'},
      {key:'noise_canceling',name:'Noise-Canceling',vp:4,elem:['sparkle'],stat:'warmth',mult:1.8,target:'enemy',weight:'standard',o3:true,
        fx:[['interrupt','t']],desc:'Tom puts on his flight headphones and the noise stops. Hits one enemy and cancels its wind-up.'},
      {key:'seat_1a',name:'Seat 1A, Peasants',vp:5,elem:['cozy'],stat:'warmth',mult:1.5,target:'row',weight:'heavy',o3:true,
        fx:[['st','guard',1,'lowest']],desc:'A Delta One privacy door slams shut on a row and the shade comes down. The most hurt friend is tucked in: Guarded (half damage) for 1 turn.'},
      {key:'flashcard_flurry',name:'Flashcard Flurry',vp:2,elem:['chatter'],target:'enemy',weight:'quick',o3:true,kindFoe:25,
        fx:[['reveal','t'],['ctq',.20,'t']],desc:'Flashcards fly at every enemy. Shows one enemy\'s weakness, delays its turn and warms it up.'},
      {key:'konami_code',name:'Konami Code',vp:3,elem:['kinetic'],stat:'pow',mult:1.3,target:'row',weight:'standard',o3:true,
        fx:[['ctq',.15,'t']],desc:'Up, up, down, down, left, right, left, right, B, A. Each arrow slams the row; 30 LIVES. Hits a row and delays them.'},
      {key:'skincare_10',name:'10-Step Skincare',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.30,.4,'t'],['vp',1,'t']],desc:'Tom pauses the battle for skincare. A red-light LED mask heals an ally 30% and gives +1 VP. Kind on a monster.'},
      {key:'kanji_strike',name:'Kanji Strike',vp:4,elem:['sparkle'],stat:'warmth',mult:2,target:'enemy',weight:'standard',o3:true,
        debuffBonus:.35,desc:'A giant glowing brushstroke. +35% if the target has a debuff.'},
      {key:'know_it_all',name:'Know-It-All',vp:6,elem:['sparkle'],stat:'warmth',mult:1.4,target:'all',weight:'heavy',o3:true,
        fx:[['interrupt','t']],desc:'Ummm... actually. Big red FACT CHECK stamps hit every enemy and cancel their wind-ups.'},
      // Ultimates (phase 5a). Primary versions come from Option 2 (option3-implementation-brief.md core rule 2); the card's
      // "refill self" on Boarding Group Zero is held to the brief's VP cap (+3).
      {key:'delta_ult',name:'Boarding Group Zero',vp:8,elem:['cozy'],stat:'hybrid',mult:3.4,target:'all',weight:'heavy',o3:true,
        fx:[['shieldBreak','t','Boarding passes everywhere! The shield is torn up!'],['heal',.35,.4,'party'],['vp',3,'self']],
        desc:'Ultimate. A red-eye flight runs over every enemy and breaks shields. The party heals 35% and Tom gets 3 VP back.'},
      {key:'cart_ult',name:'Cartridge Tilt',vp:8,elem:['sparkle'],stat:'pow',mult:3.8,target:'all',weight:'heavy',o3:true,
        fx:[['goof',1,'t'],['st','grit_down',3,'t'],['st','cool_down',3,'t']],
        desc:'Ultimate. Tom blows the dust out of the game and tilts the stage. Huge hit on every enemy; Goofs them and lowers GRIT and COOL.'}
    ]},
  grace:{
    basic:{key:'cartwheel',name:'Cartwheel',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',crit:.1,
      desc:'A crisp cartwheel kick. Free, +1 VP, and crits often.'},
    special:{key:'dance',name:'DANCE',vp:3,elem:['sparkle'],target:'party',weight:'standard',kind:'signature',fx:[['heal',.25,1.2,'party']],
      desc:'A choreographed party heal: 25% HP plus her WARMTH for everyone.'},
    skills:[
      {key:'squishy',name:'Squishy Squeeze',vp:2,elem:['cozy'],target:'ally',weight:'quick',support:true,kindFoe:true,fx:[['heal',.45,0,'t'],['cure','one','t']],
        desc:'Squeezes the gold dumpling squishy. Heals one ally 45% and cures one debuff. Or let a monster squeeze it.'},
      {key:'polish',name:'Glitter Nails',vp:3,elem:['sparkle'],target:'party',weight:'standard',support:true,fx:[['st','critup',3,'party']],
        desc:'Sparkly nails for everyone. Crit rate +25%, and 20% of WARMTH damage bounces back, for 3 turns.'},
      {key:'runway',name:'Runway Walk',vp:3,elem:['sparkle'],target:'row',weight:'standard',fx:[['st','dizzy',3,'t'],['st','decoy',2,'self']],
        desc:'Struts past a row. They get dizzy (miss 25%) and go after Grace instead of hurt allies.'},
      {key:'subscribe',name:'Like and Subscribe',vp:5,elem:['chatter','sparkle'],target:'party',weight:'standard',support:true,fx:[['heal',.35,0,'party']],
        desc:'Ring-light flash. Heals the party 35%.'},
      {key:'dancebattle',name:'Dance Battle',vp:3,elem:['kinetic'],stat:'warmth',mult:1.6,target:'enemy',weight:'standard',fx:[['steal','t']],
        desc:'A step-off. Steals one of the enemy’s buffs.'},
      {key:'beam',name:'Beam Dismount',vp:4,elem:['kinetic'],stat:'pow',mult:2.1,target:'splash',weight:'standard',
        desc:'A high-flying flip. Full hit on one, 60% on the ones beside it.'},
      {key:'perfect10',name:'Perfect 10',vp:6,elem:['sparkle','kinetic'],stat:'pow',mult:3,target:'enemy',weight:'heavy',crit:1,
        desc:'A flawless routine. Always a critical hit.'}
    ],
    // Option 3 Primary kit (phase 3b, rebuilt by Tom's move review 2026-10-24: claude/move-review.md). DANCE (sig:true)
    // keeps its legacy resolver; animations: the "Move review rebuilds" IIFE at the end of engine/grace-moves.js.
    o3:[
      {key:'cartwheel',name:'Cartwheel',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'quick',o3:true,
        desc:'Two cartwheels in and a cartwheel kick. Free, and gives +1 VP.'},
      {key:'dance',sig:true,name:'DANCE',vp:3,elem:['sparkle'],target:'party',weight:'standard',kind:'signature',o3:true,fx:[['heal',.25,1.2,'party']],
        desc:'Lead a dance break that heals the party: 25% HP plus her WARMTH for everyone.'},
      {key:'squishy_squeeze',name:'Squishy Squeeze',vp:3,elem:['sparkle'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.35,.4,'t'],['cure','one','t']],desc:'A friend squeezes the gold dumpling squishy. Heals 35% and clears one debuff. Kind on a monster.'},
      {key:'glitter_nails',name:'Glitter Nails',vp:4,elem:['sparkle'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['st','glitter_nails',2,'party'],['heal',.10,0,'rose']],desc:'Grace paints everyone\'s nails: crit +25% and 20% reflect for 2 turns. Rose gets a little heal. Kind on a monster.'},
      {key:'welcome_back',name:'Welcome Back to My Channel',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.20,.4,'t'],['cure','amber','t']],desc:'A pretend vlog with a hairbrush mic. The friend she interviews heals 20% and clears Amber-Stuck. Kind on a monster.'},
      {key:'like_subscribe',name:'Like and Subscribe',vp:4,elem:['chatter'],stat:'warmth',mult:1.5,target:'enemy',weight:'standard',o3:true,
        fx:[['st','shushed',1,'t']],desc:'A giant SUBSCRIBE button bonks an enemy and blocks its Chatter for 1 turn.'},
      {key:'dumpling_drop',name:'Dumpling Drop',vp:5,elem:['sparkle'],stat:'warmth',mult:1.4,target:'row',weight:'standard',o3:true,
        fx:[['st','dizzy',2,'t']],desc:'Her whole squishy collection rains down on a row. Hits them and makes them Dizzy (miss 25%) for 2 turns.'},
      {key:'dance_battle',name:'Dance Battle',vp:2,elem:['kinetic'],stat:'hybrid',mult:1.4,target:'enemy',weight:'quick',o3:true,
        fx:[['steal','t']],desc:'A step-off with the monster. Grace wins, hits it and takes one of its buffs.'},
      {key:'beam_dismount',name:'Beam Dismount',vp:3,elem:['kinetic'],stat:'hybrid',mult:1.4,target:'row',weight:'standard',o3:true,
        fx:[['st','hooked',2,'t']],desc:'Grace flips off the balance beam onto a row. Hits them and stops their dodging for 2 turns.'},
      {key:'handstand_contest',name:'Handstand Contest',vp:4,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.15,.4,'party'],['st','pep_up',2,'party',.15]],desc:'Everybody upside down. Grace wins, obviously. The party heals 15% and gets PEP +15% for 2 turns. Kind on a monster.'},
      {key:'split_leap',name:'Split Leap',vp:4,elem:['kinetic'],stat:'hybrid',mult:1.8,target:'enemy',weight:'standard',o3:true,
        fx:[['interrupt','t'],['st','guard',1,'lowest']],desc:'A split leap across the whole row. Kicks one enemy, cancels its wind-up, and the most hurt friend is Guarded for 1 turn.'},
      {key:'chalk_up',name:'Chalk Up',vp:5,elem:['sparkle'],stat:'hybrid',mult:1.8,target:'row',weight:'standard',crit:.25,o3:true,
        desc:'Chalk clap, then a tumbling pass under the spotlight across a row. Hits them with +25% crit chance.'},
      // Ultimates (phase 5b). Primary versions come from Option 2 (option3-implementation-brief.md core rule 2). Ten Million
      // Subscribers' kindFoe is dropped: an all-enemies move has no kind branch in b2TargetOptions.
      {key:'viral_ult',name:'Ten Million Subscribers',vp:7,elem:['sparkle'],stat:'warmth',mult:3.2,target:'all',weight:'heavy',o3:true,
        fx:[['heal',.5,.4,'party'],['st','glitter_nails',3,'party'],['trend','lock',2]],
        desc:'Ultimate. A pretend livestream hits ten million. A rainbow hits every enemy; the party heals 50%, gets Glitter Nails, and her Trending locks at x1.5.'},
      {key:'olympic_ult',name:'Diamond Leotard Finale',vp:8,elem:['kinetic'],stat:'hybrid',mult:3.9,target:'enemy',weight:'heavy',crit:1,o3:true,
        fx:[['shieldBreak','t','She sticks the landing! The shield shatters!'],['ct',-1,'others']],
        desc:'Ultimate. A championship floor routine lands on one enemy: always a critical hit, breaks its shield, and everyone else goes to the front of the line.'}
    ]},
  rose:{
    basic:{key:'boop',name:'Boop',elem:['kinetic'],stat:'pow',mult:.9,target:'enemy',weight:'standard',fx:[['ct',.12,'t']],
      desc:'Boops it on the nose. Free, +1 VP, and nudges its turn back.'},
    special:{key:'silly',name:'RASPBERRY',vp:2,elem:['chatter'],target:'enemy',weight:'standard',kind:'signature',fx:[['goof',1,'t']],
      desc:'Ridiculous faces. The enemy gets Goofed and loses its next turn. Bosses drop what they are holding.'},
    skills:[
      {key:'peekaboo',name:'Peekaboo',vp:2,elem:['chatter'],stat:'warmth',mult:.8,target:'enemy',weight:'quick',fx:[['ct',.3,'t']],
        desc:'Hides, then pops out. Pushes the enemy’s next turn back 30%.'},
      {key:'twirl',name:'Twirl Tornado',vp:3,elem:['kinetic'],stat:'pow',mult:1.4,target:'row',weight:'standard',fx:[['st','dizzy',3,'t'],['interrupt','t']],
        desc:'Spins through a row. Dizzy (miss 25%), and it breaks a boss’s wind-up.'},
      {key:'dressup',name:'Dress-Up Day',vp:3,elem:['sparkle'],target:'self',weight:'quick',support:true,fx:[['st','evade',3,'self'],['ct',-.6,'slowest']],
        desc:'Dress-up! Rose dodges half of all hits for 3 turns and the slowest ally jumps ahead.'},
      {key:'bedtime',name:'Monster Under the Bed',vp:5,elem:['chatter','sparkle'],stat:'warmth',mult:2,target:'all',weight:'heavy',fx:[['goof',.75,'t']],
        desc:'Her bedtime monster is on her side. Hits all, 75% chance to Goof each.'},
      {key:'lamby',name:'Lamby Launch',vp:2,elem:['kinetic'],stat:'pow',mult:1.5,target:'enemy',weight:'standard',
        desc:'Hurls her stuffed lamb, then climbs onto Tom’s shoulders (Shoulder Ride).'},
      {key:'pounce',name:'Piggyback Pounce',vp:4,elem:['kinetic'],stat:'pow',mult:1.9,target:'splash',weight:'standard',fx:[['row','back','t']],
        desc:'Leaps off Tom’s back. Splash hit, knocks the target to the back row, and climbs back up.'},
      {key:'stampede',name:'Lamby Stampede',vp:6,elem:['kinetic'],stat:'pow',mult:2.7,target:'all',weight:'heavy',
        desc:'A herd of stuffed lambs. Hits all enemies.'}
    ],
    // Option 3 Primary kit (phase 3c, rebuilt by Tom's move review 2026-10-24: claude/move-review.md). The signature
    // shows as RASPBERRY everywhere; its key stays silly and it keeps the legacy resolver (goof). Animations: the
    // "Move review rebuilds" IIFE at the end of engine/rose-moves.js (RASPBERRY and Lookout Lamby: the set-piece IIFE).
    o3:[
      {key:'boop',name:'Boop',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'quick',o3:true,
        desc:'Rose pokes it with one finger: poke, poke, BOOP. Free, and gives +1 VP.'},
      {key:'silly',sig:true,name:'RASPBERRY',vp:2,elem:['chatter'],target:'enemy',weight:'standard',kind:'signature',o3:true,fx:[['goof',1,'t']],
        desc:'Tongue out, big raspberry. A regular enemy is Goofed and loses its next turn. Bosses drop what they are holding.'},
      {key:'boo',name:'Boo!!',vp:2,elem:['chatter'],target:'enemy',weight:'quick',o3:true,kindFoe:25,
        fx:[['ctq',.25,'t']],desc:'Rose vanishes in a poof, pops up behind one enemy and yells BOOOO. Delays its turn, then it laughs (cheers it up).'},
      {key:'dress_up_tiara',name:'Rainbow Unicorn Cut-Out',vp:3,elem:['sparkle'],stat:'warmth',mult:1.4,target:'enemy',weight:'standard',o3:true,
        fx:[['st','grit_down',2,'t']],desc:'Craft time. Rose draws a unicorn on a rainbow, cuts it out with her safety scissors and sticks it on one enemy. Hits it, and it is too busy admiring it: GRIT down 25% for 2 turns.'},
      {key:'giggle_storm',name:'Tickle Storm',vp:4,elem:['chatter'],stat:'warmth',mult:.4,hits:3,target:'row',weight:'standard',o3:true,
        fx:[['interrupt','t']],desc:'Rose wiggles her tickle fingers and the tickles turn into a storm of feathers. Three hits across a row and cancels their wind-ups.'},
      {key:'lamby_hug',name:'Lamby Hug',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.30,.4,'t'],['cure','mental','t']],desc:'Rose presses Lamby and Backup Lamby on a friend for a double squishy hug. Heals 30% and clears mental debuffs. Kind on a monster.'},
      {key:'floor_is_lava',name:'Floor Is Lava!',vp:5,elem:['kinetic'],stat:'warmth',mult:1.6,target:'row',weight:'standard',o3:true,
        fx:[['st','dizzy',2,'t']],desc:'Rose yells THE FLOOR IS LAVA and hops on a cushion. The row hot-foots it: hit and Dizzy (miss 25%) for 2 turns.'},
      {key:'lookout_lamby',name:'Lamby Boomerang',vp:2,elem:['kinetic'],stat:'pow',mult:1.4,target:'enemy',weight:'standard',o3:true,
        fx:[['ifup','tom',[['mount']],[['st','guard',1,'self']]]],desc:'Rose throws Lamby and Backup Lamby like boomerangs: two soft bonks on one enemy, and they come back. Then she climbs onto Tom\'s shoulders, or Guards herself if he is away.'},
      {key:'piggyback_pounce',name:'Piggyback Pounce',vp:3,elem:['kinetic'],stat:'pow',mult:1.7,target:'enemy',weight:'quick',o3:true,
        fx:[['interrupt','t'],['ctq',-.10,'lowest']],desc:'Rose jumps off Tom\'s shoulders onto an enemy. Hits, cancels its wind-up, and the most hurt friend acts a little sooner.'},
      {key:'bedtime_story',name:'Bedtime Story',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.25,.4,'t'],['cure','amber','t']],desc:'Rose reads a friend a bedtime story with Lamby and Backup Lamby. Heals 25% and clears Amber-Stuck. Kind on a monster.'},
      {key:'lamby_boomerang',name:'Ms. Cathy\'s Snack Attack',vp:5,elem:['sparkle'],stat:'warmth',mult:1.6,target:'row',weight:'standard',o3:true,
        fx:[['st','cool_down',2,'t']],desc:'Rose yells for Ms. Cathy, her sitter. She walks in and throws cookies, cupcakes and candy at a row. Sugar rush: COOL down 25% for 2 turns.'},
      {key:'pillow_fort',name:'Pillow Fort',vp:5,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:30,
        fx:[['st','guard',1,'party'],['cure','amber','party'],['heal',.10,0,'tom']],desc:'A couch-cushion fort with a blanket roof over everyone. Guards the party for 1 turn, clears Amber-Stuck, and Tom gets a small heal. Kind on a monster.'},
      // Ultimates (phase 5b). Primary versions from Option 2. Tea Party's kindFoe is dropped (all enemies has no kind branch).
      // Shoulder Mecha uses the brief's tuned row (Miles capped at +1 per action).
      {key:'teaparty_ult',name:'Tea Party with Lamby',vp:7,elem:['sparkle'],stat:'warmth',mult:3.3,target:'all',weight:'heavy',o3:true,
        fx:[['goof',1,'t'],['heal',.40,.4,'party'],['cure','debuff','party']],
        desc:'Ultimate. Every enemy sits down at a tiny tea table with Lamby. Pinkies up! A rainbow tea geyser hits them all and Goofs them; the party heals 40% and loses its debuffs.'},
      {key:'mecha_ult',name:'Operation Shoulder Mecha',vp:8,elem:['kinetic'],stat:'hybrid',mult:4.0,target:'all',weight:'heavy',o3:true,
        fx:[['mount'],['st','stunned',1,'t'],['mile',1]],
        desc:'Ultimate. Rose rides Tom and they turn into a cardboard-box robot. A rainbow crayon laser hits every enemy and Stuns them; Rose stays on his shoulders and Tom gets +1 Upgrade Mile.'}
    ]},
  amy:{
    basic:{key:'basic',name:'Sprint Tackle',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',
      desc:'A runner’s tackle. Free, and gives +1 VP.'},
    special:{key:'pep',name:'PEP TALK',vp:3,elem:['chatter'],target:'party',weight:'standard',kind:'signature',fx:[['st','pumped',3,'others']],
      desc:'A fierce coach speech. Everyone else’s next attack or heal is +50%.'},
    skills:[
      {key:'redpen',name:'Green Pen',vp:2,elem:['chatter'],stat:'warmth',mult:1.3,target:'enemy',weight:'standard',fx:[['reveal','t'],['st','gritdown',3,'t']],
        desc:'Marks its mistakes in red. Shows its weakness and lowers its GRIT 25%.'},
      {key:'quiz',name:'Surprise Quiz',vp:3,elem:['chatter'],stat:'warmth',mult:1.2,target:'enemy',weight:'standard',fx:[['ct',.4,'t'],['interrupt','t']],
        desc:'Surprise test. Pushes its turn back 40% and breaks a wind-up.'},
      {key:'pb',name:'Personal Best',vp:5,elem:['sparkle'],target:'party',weight:'standard',support:true,fx:[['vp',3,'party'],['cure','mental','party'],['st','best',3,'party']],
        desc:'Everyone gets +3 VP, clears their head, and hits 30% harder for 3 turns.'},
      {key:'burpee',name:'Burpee Blitz',vp:2,elem:['kinetic'],stat:'pow',mult:.5,hits:3,target:'enemy',weight:'quick',
        desc:'Three quick hits. Amy acts again soon.'},
      {key:'hills',name:'Hill Repeats',vp:4,elem:['kinetic'],stat:'pow',mult:2,target:'splash',weight:'standard',fx:[['st','gritdown',3,'t']],
        desc:'Up and down the hill. Splash hit, and cracks their GRIT 25%.'},
      {key:'marathon',name:'Marathon',vp:3,elem:['cozy'],target:'party',weight:'standard',support:true,fx:[['st','pepup',3,'party'],['cure','amber','party']],
        desc:'Sets the pace. Party PEP +30% for 3 turns, and no more Amber-Stuck.'},
      {key:'finish',name:'Finish Line',vp:6,elem:['kinetic','sparkle'],stat:'pow',mult:2.6,target:'all',weight:'heavy',
        desc:'Sprints through and breaks the tape. Hits all enemies.'}
    ],
    // Option 3 Primary kit (phase 4b). Cards: adventures-of-tom-ability-revamp.md (Amy). PEP TALK (sig:true) keeps its
    // legacy resolver; only the animation is new (RECRUIT_MOVES.amy.pepShow, engine/amy-moves.js). The doc key is pep_talk,
    // the legacy key pep: RECRUIT_MOVES.amy.pep_talk and LINES.amy.pep_talk alias the old ones (B8_SIG_LEGACY for kindness).
    o3:[
      {key:'kettlebell_swing',name:'Kettlebell Swing',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'quick',o3:true,
        desc:'A big kettlebell swung right into an enemy. Free, and gives +1 VP.'},
      {key:'pep_talk',sig:true,name:'PEP TALK',vp:3,elem:['chatter'],target:'party',weight:'standard',kind:'signature',o3:true,fx:[['st','pumped',3,'others']],
        desc:'Encourage everyone else. Their next attack or heal is +50%.'},
      {key:'red_pen',name:'Green Pen',vp:2,elem:['sparkle'],stat:'warmth',mult:1.35,target:'enemy',weight:'standard',o3:true,
        fx:[['reveal','t'],['st','grit_down',2,'t']],desc:'A giant red F. Hits one enemy, shows its weakness and lowers its GRIT for 2 turns.'},
      {key:'hot_lunch_tray',name:'Hot Lunch Tray',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.20,.4,'t'],['cure','amber','t']],desc:'A steaming tray of cafeteria soup. Heals a friend 20% and clears Amber-Stuck. Kind on a monster.'},
      {key:'goldstar_recess',name:'Gold-Star Recess',vp:4,elem:['sparkle'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.20,.4,'party']],desc:'Call a proper recess. Heals the party 20%. Kind on a monster.'},
      {key:'inside_voices',name:'Inside Voices!',vp:4,elem:['chatter'],target:'row',weight:'standard',o3:true,kindFoe:25,
        fx:[['ctq',.20,'t'],['interrupt','t']],desc:'Lights flick, teacher clap. Delays an enemy row, cancels wind-ups, and warms them up.'},
      {key:'pop_quiz',name:'Surprise Quiz',vp:5,elem:['sparkle'],stat:'hybrid',mult:2.0,target:'enemy',weight:'standard',o3:true,debuffBonus:.5,
        fx:[['heal',.05,0,'grace'],['heal',.05,0,'rose']],desc:'A test packet slams down. Hits one enemy, +50% if it has a debuff. Grace and Rose get a little reassurance.'},
      {key:'burpee_blitz',name:'Burpee Blitz',vp:2,elem:['kinetic'],stat:'pow',mult:1.4,target:'enemy',weight:'quick',crit:.15,o3:true,
        desc:'Burpees, burpees, then one big jump into it. Extra crit chance.'},
      {key:'hill_repeats',name:'Hill Repeats',vp:4,elem:['kinetic'],stat:'pow',mult:1.5,target:'splash',weight:'standard',o3:true,
        fx:[['st','grit_down',2,'t',.20]],desc:'Up and down a real hill. Hits it and its neighbors, and lowers its GRIT 20%.'},
      {key:'oat_milk_please',name:'Oat Milk, Please',vp:3,elem:['splash'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.30,.4,'t'],['vp',1,'t']],desc:'No pizza, no milk carton: her oat milk latte. Heals a friend 30% and restores 1 VP. Kind on a monster.'},
      {key:'false_start',name:'False Start',vp:4,elem:['kinetic'],stat:'pow',mult:1.7,target:'enemy',weight:'quick',o3:true,
        fx:[['interrupt','t'],['ctq',.15,'t']],desc:'Catch one enemy leaning too early. Hits it, cancels its wind-up, and delays its turn.'},
      {key:'negative_split',name:'Negative Split',vp:5,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['st','pep_up',2,'party'],['cure','amber','party']],desc:'Easy first half, faster second half. The party gets PEP +25% for 2 turns and loses Amber-Stuck. Kind on a monster.'},
      // Ultimates (phase 5b). Primary versions from Option 2. See Me is the registry's see_me (B8_ST_ALIAS seeme: they take
      // double damage for 2 turns). Boston Qualifier pulls the party forward 50% (the card's words; the table's +0.5 sign).
      {key:'detention_ult',name:'Nobody Leaves',vp:8,elem:['chatter'],stat:'hybrid',mult:3.5,target:'all',weight:'heavy',o3:true,
        fx:[['st','see_me',2,'t'],['ct',.6,'t'],['vp',3,'party']],
        desc:'Ultimate. The last bell rings and nobody leaves the room. Hits them all, marks them See Me (double damage for 2 turns), knocks their turns back 60%, and the party gets 3 VP.'},
      {key:'marathon_ult',name:'Boston Qualifier',vp:8,elem:['kinetic'],stat:'pow',mult:3.8,target:'all',weight:'heavy',o3:true,
        fx:[['st','personal_best',3,'party'],['cure','debuff','party'],['ct',-.5,'party']],
        desc:'Ultimate. Amy leads the whole family over the Mile 26.2 finish line, straight through every enemy. Huge hit on all of them; the party loses its debuffs, gets Personal Best for 3 turns, and moves up 50%.'}
    ]},
  deedee:{
    basic:{key:'basic',name:'Spit Shine',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',
      desc:'Licks a thumb and scrubs its face. Free, and gives +1 VP.'},
    special:{key:'hug',name:'MOON & BACK',vp:4,elem:['cozy'],target:'party',weight:'standard',kind:'signature',fx:[['heal',.4,1.5,'party'],['st','tucked',3,'party']],
      desc:'A group hug. Heals 40% plus her WARMTH, and everyone is Tucked In (regen).'},
    skills:[
      {key:'nurse',name:'Registered Nut',vp:2,elem:['cozy'],target:'ally',weight:'quick',support:true,kindFoe:true,fx:[['heal',.45,0,'t'],['cure','one','t']],
        desc:'A retired nurse’s check-up. Heals one ally 45% and cures one debuff. Works on grumpy monsters too.'},
      {key:'crisp',name:'Rhubarb Crisp',vp:3,elem:['cozy'],target:'ally',weight:'standard',support:true,kindFoe:true,fx:[['heal',.6,0,'t'],['crust',1]],
        desc:'A steaming slice. Heals one ally 60%, or feed it to a monster to warm it right up. Leaves a Warm Crust on the tray.'},
      {key:'mop',name:'Wet Floor',vp:3,elem:['splash'],target:'front',weight:'standard',fx:[['cure','debuff','party'],['st','drowsy',3,'t']],
        desc:'Mops the floor. Clears the party’s debuffs and the front row slips (PEP -30%).'},
      {key:'dinner',name:'Sunday Dinner',vp:5,elem:['cozy'],target:'party',weight:'standard',support:true,fx:[['heal',.4,0,'party'],['crust',3]],
        desc:'A full Sunday dinner. Heals the party 40% and fills the tray with Warm Crusts.'},
      {key:'walk',name:'Power Walk',vp:2,elem:['kinetic'],stat:'pow',mult:1.5,target:'enemy',weight:'quick',
        desc:'A brisk charge. Deedee acts again soon.'},
      {key:'wine',name:'Wine O’Clock',vp:3,elem:['cozy'],target:'self',weight:'quick',support:true,fx:[['st','warmup',3,'self',1]],
        desc:'One glass, now and then. Doubles her WARMTH for 3 turns.'},
      {key:'moonshot',name:'To the Moon & Back',vp:5,elem:['cozy','sparkle'],stat:'warmth',mult:2.3,target:'all',weight:'heavy',
        desc:'Love to the moon and back down on every enemy.'}
    ],
    // Option 3 Primary kit (phase 3d). Cards: adventures-of-tom-ability-revamp.md (Deedee). MOON & BACK (sig:true) keeps
    // its legacy resolver; only the animation is new (RECRUIT_MOVES.deedee.moon_back, engine/deedee-moves.js). LINES.deedee.moon_back repeats the 'hug' lines, so the baked clips play.
    // baking:true marks the actions whose crust op is the baking token event (trait integration note on her card).
    o3:[   // Move review (2026-10-24): A3 Wet Floor!, A4 Wine O'Clock (key wine), B3 Rise and Shine, B4 Beanie Master, B5 Grandma Squeeze.
      // Same numbers as the slots they replace. Animations: the "Move review rebuilds" IIFE at the end of engine/deedee-moves.js.
      {key:'dish_towel_flick',name:'Dish-Towel Flick',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',o3:true,
        desc:'Flick one enemy with a clean dish towel. Free, and gives +1 VP.'},
      {key:'moon_back',sig:true,name:'MOON & BACK',vp:4,elem:['cozy'],target:'party',weight:'standard',kind:'signature',o3:true,fx:[['heal',.4,1.5,'party'],['st','tucked',3,'party']],
        desc:'Wrap the party in a loving group hug. Heals 40% plus her WARMTH, and everyone is Tucked In (regen).'},
      {key:'registered_nut',name:'Registered Nut, Reporting',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.35,.4,'t'],['cure','one','t']],desc:'A proper check-up from a very energetic nurse. Heals a friend 35% and removes one debuff. Kind on a monster.'},
      {key:'corner_piece',name:'Corner-Piece Privilege',vp:4,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:35,baking:true,
        fx:[['heal',.45,.4,'t'],['crust',1]],desc:'The best corner of homemade rhubarb crisp. Heals a friend 45% and adds one Warm Crust. Kind on a monster.'},
      {key:'wet_floor',name:'Wet Floor!',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,baking:true,
        fx:[['heal',.25,.4,'t'],['cure','amber','t'],['crust',1],['heal',.10,0,'boppy']],desc:'She mops around a friend: the sticky stuff comes right up. Heals 25%, clears Amber-Stuck, adds a Warm Crust. Boppy gets extra care. Somebody always slips. Kind on a monster.'},
      {key:'wine',name:'Wine O’Clock',vp:4,elem:['kinetic'],stat:'warmth',mult:1.6,target:'enemy',weight:'standard',o3:true,
        fx:[['interrupt','t']],desc:'Ting, ting, ting: a toast. Every monster freezes to listen. Hits one enemy and cancels its wind-up.'},
      {key:'oven_mitt_ultimatum',name:'Oven Mitt Ultimatum',vp:5,elem:['cozy'],stat:'warmth',mult:1.6,target:'row',weight:'standard',o3:true,
        fx:[['st','grumbled',2,'t']],desc:'Clap the oven mitts once. Hits a row and lowers its POW and WARMTH 30% for 2 turns.'},
      {key:'brisk_means_brisk',name:'Brisk Walk',vp:2,elem:['kinetic'],stat:'pow',mult:1.5,target:'enemy',weight:'quick',o3:true,
        desc:'One very brisk pass through an enemy. Deedee acts again soon.'},
      {key:'garden_shower',name:'Garden Shower',vp:3,elem:['splash'],stat:'warmth',mult:1.2,target:'row',weight:'standard',o3:true,
        fx:[['ctq',.15,'t']],desc:'Water an enemy row rather thoroughly. Hits them and delays their next turns.'},
      {key:'rise_and_shine',name:'Rise and Shine',vp:4,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['cure','mental','party'],['cure','amber','party'],['st','cool_up',2,'party']],desc:'She yanks the shades open. Monsters squint; friends wake up. Clears mental debuffs and Amber-Stuck, and the party gets COOL +25% for 2 turns. Kind on a monster.'},
      {key:'beanie_master',name:'Beanie Master',vp:4,elem:['sparkle'],stat:'warmth',mult:1.6,target:'enemy',weight:'standard',o3:true,
        fx:[['steal','t']],desc:'There were beans at lunch. A big green cloud: hits one enemy and its buff blows over to her.'},
      {key:'grandma_squeeze',name:'Grandma Squeeze',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.25,.4,'t'],['vp',2,'t']],desc:'One big squeezy hug and a lipstick kiss. Heals 25% and restores 2 VP. Kind on a monster.'},
      // Ultimates (phase 5b). Primary versions from Option 2 (Deedee's Kit Table). All-enemies moves have no kind branch,
      // so kindFoe is dropped. Caps: party heal 60%, revive 50%. Animations: the "Option 3 Ultimates" IIFE at the end of
      // engine/deedee-moves.js (revived friends also get Tucked In there, since ops skip a friend revived by the same move).
      {key:'sunday_ult',name:'Sunday Roast Spread',vp:8,elem:['cozy'],stat:'warmth',mult:3.2,target:'all',weight:'heavy',o3:true,baking:true,
        fx:[['heal',.60,.4,'party'],['cure','debuff','party'],['crust',3],['tray',3]],
        desc:'Ultimate. The dinner bell rings, a kitchen whirlwind hits every enemy, and the family sits down to Sunday dinner. Heals the party 60%, clears their debuffs, and fills the tray with 3 Hot Dishes.'},
      {key:'moon_ult',name:'To the Moon and Back',vp:8,elem:['sparkle'],stat:'warmth',mult:3.4,target:'all',weight:'heavy',o3:true,
        fx:[['revive',.50,'party'],['st','tucked_in',3,'party'],['smit',1,'t']],
        desc:'Ultimate. A golden heart flies round the full moon and comes back down as starlight on every enemy. Revives fallen friends at 50%, Tucks In the party for 3 turns, and every enemy may go Smitten.'}
    ]},
  boppy:{
    basic:{key:'basic',name:'Cap Swat',elem:['kinetic'],stat:'pow',mult:1.1,target:'enemy',weight:'standard',
      desc:'Swats with his cap. Free, and gives +1 VP.'},
    special:{key:'grumble',name:'GRUMBLE',vp:2,elem:['chatter'],target:'row',weight:'standard',kind:'signature',fx:[['st','grumbled',3,'t'],['st','brace',1,'self']],
      desc:'Complains about his stomach. A row hits 30% softer and goes after Boppy, who guards.'},
    skills:[
      {key:'cast',name:'Cast Line',vp:2,elem:['splash'],stat:'pow',mult:1.5,target:'enemy',weight:'standard',fx:[['row','front','t'],['st','pinned',3,'t']],
        desc:'Hooks one. Pulls a back-row enemy to the front and it cannot dodge.'},
      {key:'recliner',name:'Recliner Drop',vp:3,elem:['kinetic'],stat:'pow',mult:1.8,target:'enemy',weight:'standard',fx:[['heal',.3,0,'self'],['st','brace',1,'self']],
        desc:'Drops his recliner on it, then sits. Heals Boppy 30% and he guards.'},
      {key:'bigcatch',name:'Big Catch',vp:3,elem:['splash'],stat:'pow',mult:2,target:'enemy',weight:'standard',fx:[['ct',.4,'t'],['take','t']],
        desc:'Reels it in. Pushes its turn back 40% and steals what it is holding.'},
      {key:'gotaway',name:'The One That Got Away',vp:5,elem:['splash'],stat:'pow',mult:2.4,target:'all',weight:'heavy',fx:[['st','shield',2,'party']],
        desc:'The legendary fish crashes through. Hits all, and the party takes 40% less for 2 turns.'},
      {key:'pepper',name:'Pepper Breath',vp:2,elem:['cozy'],stat:'warmth',mult:1.4,target:'enemy',weight:'standard',fx:[['burn',1]],
        desc:'Breathes pure pepper. +1 Heartburn.'},
      {key:'hotpepper',name:'Hot Pepper',vp:3,elem:['cozy'],stat:'warmth',mult:1.5,target:'splash',weight:'standard',fx:[['st','powup',3,'self',.4],['burn',1]],
        desc:'Eats a hot pepper. Splash hit, his POW +40% for 3 turns, and +1 Heartburn.'},
      {key:'trackstar',name:'Track Star Story',vp:3,elem:['chatter'],target:'all',weight:'standard',support:true,fx:[['st','drowsy',3,'t'],['st','pepup',3,'self']],
        desc:'His college cross country story. Again. Enemies get drowsy (PEP -30%) and Boppy speeds up.'},
      {key:'ghost',name:'Ghost Pepper',vp:6,elem:['cozy'],stat:'hybrid',mult:2.7,target:'all',weight:'heavy',
        desc:'The hottest pepper there is. Hits all enemies, and burns his Heartburn for +30% per pip.'}
    ],
    // Option 3 Primary kit (phase 4b). Cards: adventures-of-tom-ability-revamp.md (Boppy). GRUMBLE (sig:true) keeps its
    // legacy resolver; only the animation is new (RECRUIT_MOVES.boppy.grumbleShow, engine/boppy-moves.js). Same key on both.
    // pepper:true marks the actions whose burn op is the pepper event (trait integration note on his card).
    o3:[
      {key:'cap_swat',name:'Cap Swat',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',o3:true,
        desc:'Cap off, and he swats one enemy like a mosquito. Free, and gives +1 VP.'},
      {key:'grumble',sig:true,name:'GRUMBLE',vp:2,elem:['chatter'],target:'row',weight:'standard',kind:'signature',o3:true,fx:[['st','grumbled',3,'t'],['st','brace',1,'self']],
        desc:'Grumble at an enemy row. It hits 30% softer and goes after Boppy, who guards.'},
      {key:'patient_angler',name:'Patient Angler',vp:2,elem:['splash'],stat:'pow',mult:1.4,target:'enemy',weight:'standard',o3:true,
        fx:[['row','front','t'],['st','hooked',2,'t']],desc:'Wait for the right tug. Hits one enemy, pulls it to the front when there is room, and it cannot dodge.'},
      {key:'recliner_reservation',name:'Recliner Reservation',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.30,.4,'t'],['st','guard',1,'t'],['st','guard',1,'deedee']],desc:'Reserve the best seat for a friend. Heals 30% and guards them; Deedee gets cover too. Kind on a monster.'},
      {key:'headcount_again',name:'Headcount, Again',vp:3,elem:['chatter'],target:'row',weight:'standard',o3:true,kindFoe:25,
        fx:[['reveal','t'],['ctq',.20,'t']],desc:'Count an enemy row twice. Shows their weaknesses, delays their turns, and warms them up.'},
      {key:'lockdown',name:'Lockdown',vp:4,elem:['kinetic'],stat:'pow',mult:1.8,target:'enemy',weight:'standard',o3:true,
        fx:[['interrupt','t'],['st','hooked',1,'t']],desc:'Cell bars slam down around one enemy. Hits it, cancels its wind-up, and it cannot dodge.'},
      {key:'everybody_waits',name:'Everybody Waits',vp:5,elem:['chatter'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['st','nobody_gets_past',2,'party']],desc:'Ask the whole world to wait a moment. The party takes 40% less damage for 2 turns. Kind on a monster.'},
      {key:'pepper_breath',name:'Pepper Breath',vp:2,elem:['cozy'],stat:'pow',mult:1.4,target:'enemy',weight:'standard',o3:true,pepper:true,
        fx:[['burn',1]],desc:'One homegrown cayenne, then a cone of pepper fire. Hits one enemy and +1 Heartburn.'},
      {key:'seeds_of_trouble',name:'Seeds of Trouble',vp:3,elem:['cozy'],stat:'pow',mult:1.4,target:'row',weight:'standard',o3:true,pepper:true,
        fx:[['burn',1]],desc:'Tap a pepper seed packet across a row. Hits the row and +1 Heartburn.'},
      {key:'mild_for_company',name:'Mild for Company',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,pepper:true,
        fx:[['heal',.25,.4,'t'],['cure','amber','t'],['burn',1]],desc:'A genuinely mild pepper broth. Heals a friend 25%, clears Amber-Stuck, and +1 Heartburn. Kind on a monster.'},
      {key:'nineteen_seventy',name:'In Nineteen Seventy',vp:4,elem:['chatter'],target:'all',weight:'heavy',o3:true,kindFoe:25,
        fx:[['ctq',.20,'t']],desc:'Begin the college story in its proper year. Delays every enemy and gently cheers them up.'},
      {key:'five_alarm_jar',name:'Five-Alarm Jar',vp:5,elem:['kinetic'],stat:'pow',mult:1.6,target:'splash',weight:'heavy',o3:true,
        fx:[['shieldBreak','t'],['st','guard',1,'self']],desc:'His pickled ghost peppers set off the fire alarm. Hits one enemy and its neighbors, breaks its shield, and Boppy guards.'},
      // Ultimates (phase 5b). Primary versions from Option 2 (Boppy's Kit Table). Nobody Gets Past is the registry's shield
      // (40% less damage); turns knocked back 80% is a positive ct (as Amy's detention_ult). Animations: the "Option 3
      // Ultimates" IIFE at the end of engine/boppy-moves.js (prefix b5_).
      {key:'fish_ult',name:'The One That Got Away',vp:8,elem:['splash'],stat:'pow',mult:3.6,target:'all',weight:'heavy',o3:true,
        fx:[['st','nobody_gets_past',2,'party'],['steal','t'],['st','stunned',1,'t']],
        desc:'Ultimate. Boppy reels in the legendary catfish, and it gets bigger every time he tells it. It belly-flops on every enemy: steals a buff from each, Stuns them, and the party takes 40% less damage for 2 turns.'},
      {key:'xc_ult',name:'Van Cortlandt Park \'70',vp:8,elem:['kinetic'],stat:'pow',mult:3.9,target:'all',weight:'heavy',o3:true,
        fx:[['burn',3],['ct',.8,'t'],['st','personal_best',2,'self']],
        desc:'Ultimate. Back to the 1970 cross-country race, in sepia. Boppy laps every enemy three times and breaks the tape: huge hit on all of them, their turns knocked back 80%, Heartburn maxed, and Personal Best for 2 turns.'}
    ]},
  tnb:{
    basic:{key:'basic',name:'Mug Toss',elem:['kinetic'],stat:'warmth',mult:1,target:'enemy',weight:'standard',
      desc:'Lobs a chipped studio mug. Free, and gives +1 VP.'},
    special:{key:'wardrobe',name:'WARDROBE',vp:4,elem:['sparkle'],target:'allyko',weight:'standard',kind:'signature',fx:[['revive',.6,'t'],['heal',.5,0,'t'],['st','fresh',3,'t'],['rack','t']],
      desc:'The wardrobe rack. Revives a fallen ally at 60%, or heals 50%, gives a one-time auto-revive and the next costume on the rack.'},
    skills:[
      {key:'quickchange',name:'Quick Change',vp:2,elem:['sparkle'],target:'ally',weight:'quick',support:true,fx:[['cure','debuff','t'],['rack','t']],
        desc:'A mid-turn outfit swap. Cures debuffs and puts on the next costume on the rack for 3 turns.'},
      {key:'metro',name:'Next Stop',vp:3,elem:['kinetic'],target:'party',weight:'quick',fx:[['ct',-.35,'others']],
        desc:'The Metro bell chimes. Everyone else moves up the turn ribbon.'},
      {key:'jumpscare',name:'Jump Scare',vp:3,elem:['chatter'],stat:'warmth',mult:1.7,target:'row',weight:'standard',fx:[['st','frozen',2,'t']],
        desc:'Horror-movie lighting. Hits a row and scares them stiff (PEP -40%).'},
      {key:'wrap',name:'That’s a Wrap',vp:6,elem:['sparkle','cozy'],stat:'warmth',mult:2.6,target:'all',weight:'heavy',fx:[['heal',.3,0,'party']],
        desc:'The finale. Hits all enemies and heals the party 30%.'},
      {key:'carve',name:'Carve',vp:2,elem:['kinetic'],stat:'pow',mult:1.5,target:'enemy',weight:'standard',fx:[['st','cooldown',3,'t']],
        desc:'Carves in on the longboard. Lowers its COOL 25%.'},
      {key:'kiln',name:'Kiln Blast',vp:4,elem:['cozy'],stat:'warmth',mult:2.1,target:'splash',weight:'standard',fx:[['shieldBreak','t']],
        desc:'A roaring kiln. Splash hit, and it melts shields instantly.'},
      {key:'bomb',name:'Bomb the Hill',vp:5,elem:['kinetic'],stat:'hybrid',mult:2.4,target:'all',weight:'heavy',fx:[['st','evade',3,'self']],
        desc:'Shreds down a steep LA street. Hits all, and TNB dodges half of all hits.'}
    ],
    // Option 3 Primary kit (phase 4). Cards: adventures-of-tom-ability-revamp.md (TNB). WARDROBE (sig:true) keeps its
    // legacy resolver; only the animation is new (RECRUIT_MOVES.tnb.wardrobeShow, engine/tnb-moves.js). Quick Change
    // and WARDROBE advance the costume rack; nothing else does.
    o3:[
      {key:'mug_toss',name:'Mug Toss',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',o3:true,
        desc:'A slightly crooked test mug, lobbed at an enemy. Free, and gives +1 VP.'},
      {key:'wardrobe',sig:true,name:'WARDROBE',vp:4,elem:['sparkle'],target:'allyko',weight:'standard',kind:'signature',o3:true,fx:[['revive',.6,'t'],['heal',.5,0,'t'],['st','fresh',3,'t'],['rack','t']],
        desc:'Help a friend recover and find their next costume. Revives a fallen ally at 60%, or heals 50%, with a one-time auto-revive and the next costume on the rack.'},
      {key:'foraged_at_dawn',name:'Foraged at Dawn',vp:2,elem:['sparkle'],target:'ally',weight:'quick',o3:true,kindFoe:25,
        fx:[['cure','one','t'],['rack','t']],desc:'One pea, described at length. Clears one debuff and dresses a friend in the next rack costume. Kind on a monster.'},
      {key:'dont_split_up',name:'Don\'t Split Up',vp:3,elem:['sparkle'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.25,.4,'t'],['st','guard',1,'t'],['heal',.10,0,'tom']],desc:'Rule one: nobody splits up. Heals 25% and Guards them for 1 turn; Tom gets a small extra check. Kind on a monster.'},
      {key:'metro_tap',name:'Metro Tap Card',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.20,.4,'t'],['cure','amber','t']],desc:'He taps his Metro card and a light-rail train stops right at a friend. Heals 20% and clears Amber-Stuck. Kind on a monster.'},
      {key:'slasher_scare',name:'Slasher Jump Scare',vp:4,elem:['sparkle'],stat:'warmth',mult:1.6,target:'enemy',weight:'standard',o3:true,
        fx:[['interrupt','t']],desc:'Lights out. A masked slasher lunges from behind the enemy. Hits one enemy and cancels its wind-up.'},
      {key:'scope_creep',name:'Scope Creep',vp:5,elem:['kinetic'],stat:'warmth',mult:1.5,target:'row',weight:'standard',o3:true,
        fx:[['st','grit_down',2,'t']],desc:'The plan grows until it crushes a row. Hits them and lowers GRIT 25% for 2 turns.'},
      {key:'throw_down',name:'Throw Down',vp:2,elem:['kinetic'],stat:'hybrid',mult:1.4,target:'enemy',weight:'quick',crit:.15,o3:true,
        desc:'A bowl thrown on the wheel spins off and lands on one enemy, then the pun. Hits one enemy with +15% crit chance (the pun does the psychic damage).'},
      {key:'around_the_bend',name:'Just Around the Bend',vp:4,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.25,.4,'t'],['cure','amber','t'],['st','kiln_glow',2,'t']],desc:'Three bends and a summit snack. Heals a friend 25%, clears Amber-Stuck, and WARMTH and COOL +25% for 2 turns. Kind on a monster.'},
      {key:'round_with_jojo',name:'Round with Jojo',vp:4,elem:['kinetic'],stat:'hybrid',mult:1.4,target:'row',weight:'quick',o3:true,
        fx:[['ctq',.15,'t']],desc:'Jojo throws one disc through the row. Hits a row and delays them.'},
      {key:'coffee_run',name:'Coffee Run',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.20,.4,'t'],['vp',2,'t']],desc:'TNB sprints off and brings back everyone\'s order. Heals 20% and restores 2 VP. Kind on a monster.'},
      {key:'kiln_door_policy',name:'Kiln Door Policy',vp:6,elem:['cozy'],stat:'warmth',mult:1.9,target:'enemy',weight:'heavy',o3:true,
        fx:[['shieldBreak','t'],['interrupt','t']],desc:'Close the kiln door on a bad idea. Hits one enemy, breaks its shield and cancels its wind-up.'},
      // Ultimates (phase 5b). Primary versions from Option 2 (TNB's Kit Table). rack on the party dresses each friend in the
      // next costume on the Quick-Change Rack; Wardrobe Fresh is the registry's 'fresh'; Tom's turn up 50% is a negative ct on
      // the member id (as Nara's Lonely Howl). Animations: the "Option 3 Ultimates" IIFE at the end of engine/tnb-moves.js (t5_).
      {key:'tasting_ult',name:'Tasting Menu',vp:8,elem:['sparkle'],stat:'warmth',mult:3.5,target:'all',weight:'heavy',o3:true,
        fx:[['heal',.4,.4,'party'],['rack','party'],['st','wardrobe_fresh',2,'party']],
        desc:'Ultimate. Fourteen courses under cloches (heals 40%, a fresh costume each, Wardrobe Fresh for 2 turns), then the check lands on every enemy.'},
      {key:'hillbomb_ult',name:'Baxter Street Bomb',vp:8,elem:['kinetic'],stat:'hybrid',mult:3.9,target:'all',weight:'heavy',o3:true,
        fx:[['st','evasive',3,'self'],['st','staggered',1,'t'],['ct',-.5,'tom']],
        desc:'Ultimate. TNB bombs down Baxter Street, lobbing seconds mugs on the way, and Bert-slides through every enemy: huge hit on all and Stagger, TNB is Evasive for 3 turns, and Tom\'s turn comes up 50% sooner.'}
    ]},
  nara:{
    basic:{key:'basic',name:'Jump Up',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'standard',fx:[['coins',5,15]],
      desc:'Muddy paws. Free, +1 VP, and she steals a few coins.'},
    special:{key:'puppy',name:'HUMAN EYES',vp:2,elem:['sparkle'],target:'enemy',weight:'standard',kind:'signature',fx:[['smit',1,'t']],
      desc:'The head tilt. The enemy is Smitten and skips its next turn (bosses: 45%).'},
    skills:[
      {key:'fetch',name:'Fetch',vp:2,elem:['kinetic'],stat:'pow',mult:1.6,target:'enemy',weight:'standard',critAfterTom:true,
        desc:'Tom throws, Nara chases. Always crits if Tom acted right before her.'},
      {key:'zoomies',name:'Zoomies',vp:3,elem:['kinetic'],stat:'pow',mult:.45,hits:4,target:'multi',weight:'standard',fx:[['st','pepup',3,'self',.4]],
        desc:'Four random hits, and her PEP +40%.'},
      {key:'tug',name:'Tug of War',vp:3,elem:['kinetic'],stat:'pow',mult:1.8,target:'enemy',weight:'standard',fx:[['st','powdown',3,'t'],['take','t']],
        desc:'Grrr. Lowers its POW 25% and steals what it is holding.'},
      {key:'squirrel',name:'SQUIRREL!',vp:6,elem:['kinetic','chatter'],stat:'pow',mult:2.8,target:'all',weight:'heavy',
        desc:'A phantom squirrel. A supersonic charge through every enemy.'},
      {key:'puddle',name:'Happy Puddle',vp:2,elem:['splash'],target:'front',weight:'standard',fx:[['st','drowsy',3,'t']],
        desc:'An excited puddle. The front row slips (PEP -30%).'},
      {key:'shake',name:'Wet Dog Shake',vp:3,elem:['splash'],stat:'warmth',mult:1.5,target:'all',weight:'standard',fx:[['cure','debuff','self']],
        desc:'Water everywhere. Hits all and shakes off her debuffs.'},
      {key:'howl',name:'Lonely Howl',vp:4,elem:['chatter'],target:'all',weight:'standard',fx:[['st','cooldown',3,'t',.3],['ct',-2,'tom']],
        desc:'A pack howl. Enemy COOL -30%, and Tom (or TNB) jumps to the front of the ribbon.'}
    ],
    // Option 3 Primary kit (phase 4). Cards: adventures-of-tom-ability-revamp.md (Nara). HUMAN EYES (sig:true, renamed from PUPPY EYES) keeps its
    // legacy resolver (smit). Signature key: the doc names it puppy_eyes (legacy key puppy), so RECRUIT_MOVES.nara.puppy_eyes
    // and LINES.nara.puppy_eyes exist (same words as puppy, so its baked clips play). Nara never speaks words.
    o3:[
      {key:'jump_up',name:'Jump Up',elem:['kinetic'],stat:'pow',mult:1,target:'enemy',weight:'quick',o3:true,fx:[['coins',5,15]],
        desc:'Both front paws, right on it. Her worst habit. Free, +1 VP, and she shakes loose a few coins.'},
      {key:'puppy_eyes',sig:true,name:'HUMAN EYES',vp:2,elem:['sparkle'],target:'enemy',weight:'standard',kind:'signature',o3:true,fx:[['smit',1,'t']],
        desc:'Her eyes look eerily human. A regular enemy is Smitten and skips its next turn (bosses: 45%).'},
      {key:'tennis_ball_fetch',name:'Tennis Ball Fetch',vp:2,elem:['kinetic'],stat:'pow',mult:1.5,target:'enemy',weight:'quick',critAfterTom:true,o3:true,
        desc:'She rockets after the ball, straight through one enemy. Always crits if Tom acted right before Nara.'},
      {key:'dont_leave_me',name:'Don\'t Leave Me!',vp:3,elem:['kinetic'],stat:'pow',mult:.4,hits:4,target:'multi',weight:'quick',o3:true,
        fx:[['st','pep_up',2,'self',.20]],desc:'Somebody steps away. AWOOOO, then frantic laps. Four random hits, and her PEP +20% for 2 turns.'},
      {key:'just_one_bite',name:'Just One Bite?',vp:3,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.25,.4,'t'],['cure','amber','t']],desc:'Drool, head tilt, paw tap. The friend shares. Heals a friend 25% and clears Amber-Stuck. Kind on a monster.'},
      {key:'counter_surfer',name:'Counter Surfer',vp:4,elem:['kinetic'],stat:'pow',mult:1.6,target:'enemy',weight:'standard',o3:true,
        fx:[['steal','t'],['interrupt','t']],desc:'Paws on the counter; she snatches its snack and runs. Hits, cancels its wind-up and steals one buff.'},
      {key:'stranger_alert',name:'Stranger Alert',vp:5,elem:['kinetic'],stat:'pow',mult:1.5,target:'row',weight:'standard',o3:true,
        fx:[['st','hooked',2,'t']],desc:'Strangers on her street. Bark bark bark: the row freezes. Hits them and stops their dodging for 2 turns.'},
      {key:'doodle_fluff',name:'Doodle Fluff',vp:2,elem:['cozy'],target:'ally',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.25,.4,'t'],['cure','mental','t']],desc:'A huge shake of curls, then she flops on a friend like a warm blanket. Heals 25% and clears mental debuffs. Kind on a monster.'},
      {key:'shake_everyone',name:'Shake It Off, Everyone',vp:4,elem:['splash'],target:'party',weight:'standard',o3:true,kindFoe:25,
        fx:[['heal',.15,.4,'party'],['cure','one','party']],desc:'A slightly damp reset. The party heals 15% and each friend loses one debuff. Kind on a monster.'},
      {key:'not_leaving',name:'Not Leaving',vp:5,elem:['cozy'],target:'allyko',weight:'heavy',o3:true,
        fx:[['revive',.25,'t'],['ift','tom',[['cure','debuff','t']],[]]],desc:'Stay with a fallen friend until they get up at 25% HP. Tom also loses all his debuffs.'},
      {key:'happy_puddle',name:'Happy Puddle',vp:3,elem:['splash'],stat:'pow',mult:1.3,target:'front',weight:'standard',o3:true,
        fx:[['ctq',.20,'t']],desc:'She is SO excited. A happy puddle; the front row slips and loses time.'},
      {key:'food_inspector',name:'Family Food Inspector',vp:5,elem:['cozy'],target:'party',weight:'standard',o3:true,kindFoe:30,
        fx:[['heal',.18,.4,'party'],['cure','amber','party']],desc:'Approve the homemade meal. The party heals 18% and clears Amber-Stuck. Kind on a monster.'},
      // Ultimates (phase 5b). Primary versions from Option 2 (Nara's Kit Table). kindFoe dropped on The Unsent Scent (all-enemies
      // moves have no kind branch); its revive is capped at 50% (B8_FX.cap) and only for Tom (skipped if he is not in the party).
      // Animations: the "Option 3 Ultimates" IIFE at the end of engine/nara.js (nu_).
      {key:'squirrel_ult',name:'CHAIRMAN CHEEKS!',vp:7,elem:['kinetic'],stat:'pow',mult:3.7,target:'all',weight:'heavy',o3:true,
        fx:[['shieldBreak','t','Chairman Cheeks runs right through the shield. So does Nara!'],['st','staggered',1,'t'],['st','pep_up',3,'party']],
        desc:'Ultimate. Chairman Cheeks, the smug squirrel, shows up behind the enemies. Nara chases him five laps through all of them: huge hit on all, breaks shields and Staggers them, and the party gets PEP Up for 3 turns.'},
      {key:'pack_ult',name:'The Unsent Scent',vp:8,elem:['cozy'],stat:'hybrid',mult:3.8,target:'all',weight:'heavy',o3:true,
        fx:[['revive',.5,'tom'],['heal',.45,.4,'party'],['scent',3,'t']],
        desc:'Ultimate. Alone in the grey, Nara catches one golden crumb of home and follows the scent through every enemy (huge hit on all, Tracked Scent for 3 turns) into Tom\'s arms: Tom gets back up at 50% if he was down, and the party heals 45%.'}
    ]}
};
function b2Kit(id) { return B2_SKILLS[id]||B2_SKILLS.tom; }

// ---- Enemies. Stats at the listed level; each level above adds `step` of every stat (HP x6). ----
// acts: what the enemy does. every: on every Nth turn. target: one or all. elem drives resist/weak on the party (later).
// evade: chance a single hit misses it. goofEasy: SILLY and Goof chances never fail on it.
const B2_FOES={
  mudling:{level:1,hp:60,pow:10,grit:8,warmth:6,cool:6,pep:9,weak:['cozy','chatter'],resist:[],step:2,
    acts:[{name:'Mud Flick',stat:'pow',mult:1,elem:'splash',target:'one',msg:'{e} flicks mud at {t}.'},
          {name:'Wobble',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} wobbles into {t}.'},
          {name:'Mud Pie',stat:'pow',mult:1.5,elem:'splash',target:'one',every:3,msg:'{e} throws a whole Mud Pie at {t}!'}]},
  skeeter:{level:2,hp:70,pow:11,grit:7,warmth:9,cool:7,pep:17,weak:['splash','chatter'],resist:[],step:2,evade:.25,
    acts:[{name:'Bite',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} bites {t} eleven times.'},
          {name:'Whine',stat:'warmth',mult:.6,elem:'chatter',target:'one',vpDrain:2,every:3,msg:'{e} whines at {t} until {t} cannot think straight.'}]},
  grump:{level:1,hp:110,pow:12,grit:10,warmth:9,cool:8,pep:10,weak:['sparkle','cozy'],resist:[],step:2,
    acts:[{name:'Splash',stat:'pow',mult:1,elem:'splash',target:'one',msg:'{e} splashes at {t}.'},
          {name:'Grumble',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} grumbles at {t} at full volume.'},
          {name:'Soggy Slap',stat:'pow',mult:1.5,elem:'splash',target:'one',every:3,msg:'{e} uses Soggy Slap on {t}!'}]},
  toad:{level:3,hp:170,pow:15,grit:12,warmth:10,cool:9,pep:9,weak:['cozy','sparkle'],resist:['splash'],step:3,
    acts:[{name:'Body Slam',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} body-slams {t}.'},
          {name:'Croak',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} croaks at {t}. The croak has weight.'},
          {name:'Tongue Lash',stat:'pow',mult:.8,elem:'kinetic',target:'all',every:3,msg:'{e} whips its tongue across the whole party!'}]},
  log:{level:4,hp:240,pow:14,grit:20,warmth:9,cool:10,pep:6,weak:['cozy'],resist:[],step:3,goofEasy:true,
    acts:[{name:'Roll',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} rolls into {t}.'},
          {name:'Branch',stat:'pow',mult:1.1,elem:'kinetic',target:'one',msg:'{e} drops a branch on {t}.'},
          {name:'Timber',stat:'pow',mult:1.8,elem:'kinetic',target:'one',every:4,msg:'TIMBER. {e} falls on {t}!'}]},
  // Chapter 3: Cattail Pier and the Whispering Marsh (data/marsh-monsters.js).
  soggysock:{level:3,hp:100,pow:13,grit:9,warmth:8,cool:8,pep:10,weak:['cozy','sparkle'],resist:['splash'],step:2,
    acts:[{name:'Sock Slap',stat:'pow',mult:1,elem:'splash',target:'one',msg:'{e} slaps {t}. Wetly.'},
          {name:'Wring Out',stat:'pow',mult:.9,elem:'splash',target:'one',msg:'{e} wrings itself out over {t}.'},
          {name:'Squelch',stat:'pow',mult:1.45,elem:'splash',target:'one',every:3,msg:'{e} SQUELCHES on {t}!'}]},
  bobber:{level:4,hp:115,pow:12,grit:8,warmth:12,cool:10,pep:18,weak:['splash','kinetic'],resist:[],step:2,evade:.25,
    acts:[{name:'Bonk',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} bobs into {t}. Then away. Then into {t} again.'},
          {name:'Plunk',stat:'warmth',mult:.6,elem:'splash',target:'one',vpDrain:2,every:3,msg:'{e} goes PLUNK at {t}. {t} forgets what they were doing.'}]},
  tangle:{level:4,hp:150,pow:13,grit:10,warmth:12,cool:9,pep:11,weak:['cozy','chatter'],resist:[],step:3,
    acts:[{name:'Snarl',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} snarls around {t}.'},
          {name:'Wrap Up',stat:'pow',mult:.8,elem:'kinetic',target:'one',status:['slow',2],msg:'{e} wraps up {t}’s ankles. {t} is Slowed.'},
          {name:'Big Knot',stat:'pow',mult:1.5,elem:'kinetic',target:'one',every:3,status:['slow',2],msg:'{e} ties {t} up in a BIG KNOT!'}]},
  snag:{level:5,hp:250,pow:15,grit:21,warmth:9,cool:11,pep:6,weak:['cozy'],resist:['splash'],step:3,goofEasy:true,
    acts:[{name:'Trip',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} trips {t}.'},
          {name:'Catch',stat:'pow',mult:1.1,elem:'kinetic',target:'one',msg:'{e} catches {t}’s sleeve and does not let go.'},
          {name:'Undertow',stat:'pow',mult:1.75,elem:'splash',target:'one',every:4,msg:'{e} drags {t} into the UNDERTOW!'}]},
  // The Big One (battle-design section 4): pie tin on its head (+50% GRIT) until SILLY knocks it off,
  // Swamp Chomp lock-ons, then below half HP it calls two Mudlings and braces for a Muddy Belly-Flop behind a shield.
  bigone:{level:5,hp:560,pow:18,grit:12,warmth:12,cool:10,pep:11,weak:['sparkle','chatter'],resist:[],step:4,boss:'bigone',noRun:true,
    start:[['pietin',99]],
    acts:[{name:'Tail Slap',stat:'pow',mult:1,elem:'splash',target:'one',msg:'{e} tail-slaps {t}.'},
          {name:'Big Glare',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} glares at {t} with both eyes. It hurts somehow.'}],
    chomp:{name:'Swamp Chomp',stat:'pow',mult:1.8,elem:'kinetic',target:'one',msg:'{e} lunges at {t}. SWAMP CHOMP!'},
    flop:{name:'Muddy Belly-Flop',stat:'pow',mult:1.25,elem:'splash',target:'all',msg:'{e} leaps up high. MUDDY BELLY-FLOP!'},
    shield:{need:2,elems:['sparkle','chatter']}},
  // The Big Shake (chapter 2 boss): a hill that stands up under the Griffith Observatory, its pipes clogged with purple smog.
  // Every third turn it telegraphs an Aftershock on everyone. Below half HP it vents two Smoglets out of the pipes and
  // braces for a Big Rumble behind a Clogged Pipe shield (2 Splash or Sparkle hits break it; any Tombo too).
  bigshake:{level:5,hp:600,pow:20,grit:13,warmth:15,cool:10,pep:10,weak:['splash','sparkle'],resist:[],step:4,boss:'bigshake',noRun:true,
    acts:[{name:'Rumble',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} rumbles right under {t}.'},
          {name:'Boulder Drop',stat:'pow',mult:1.15,elem:'kinetic',target:'one',msg:'{e} drops a boulder near {t}. Then on {t}.'},
          {name:'Smog Puff',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['drowsy',2],msg:'{e} coughs a purple Smog Puff at {t}. {t} feels very sleepy.'}],
    flop:{name:'Aftershock',stat:'pow',mult:1,elem:'kinetic',target:'all',msg:'AFTERSHOCK! {e} knocks everyone off their feet!'},
    rumble:{name:'Big Rumble',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'{e} shakes the whole hill. BIG RUMBLE!'},
    shield:{need:2,elems:['splash','sparkle']}},
  // Old Iron-Gill (chapter 3 boss): an armored catfish older than the pier, full of Boppy's peppers. Built like the Big
  // Shake (engine/battle2.js B2_SHAKE_STYLE): every third turn a telegraphed Pepper Belch on everyone. Below half HP two
  // Bobbers pop up and it sinks for a Deep Dive behind a shield (2 Splash or Kinetic hits break it; any Tombo too).
  irongill:{level:6,hp:680,pow:21,grit:15,warmth:14,cool:11,pep:9,weak:['kinetic','sparkle'],resist:[],step:4,boss:'irongill',noRun:true,
    acts:[{name:'Whisker Whip',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} whips {t} with a whisker.'},
          {name:'Iron Headbutt',stat:'pow',mult:1.15,elem:'kinetic',target:'one',msg:'{e} head-butts {t}. It CLANGS.'},
          {name:'Pond Spit',stat:'warmth',mult:.8,elem:'splash',target:'one',status:['slow',2],msg:'{e} spits pond water at {t}. {t} is Slowed.'}],
    flop:{name:'Pepper Belch',stat:'pow',mult:1,elem:'cozy',target:'all',msg:'PEPPER BELCH! {e} burps pickled peppers over everyone!'},
    rumble:{name:'Deep Dive',stat:'pow',mult:1.45,elem:'splash',target:'all',msg:'{e} comes up under everyone at once. DEEP DIVE!'},
    shield:{need:2,elems:['splash','kinetic']}},
  // Chapter 4: the studio lot, the Backlot and Soundstage 7 (data/backlot-monsters.js).
  extra:{level:4,hp:62,pow:11,grit:8,warmth:8,cool:8,pep:9,weak:['chatter','sparkle'],resist:[],step:2,
    acts:[{name:'Elbow',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} elbows {t} on the way to craft services.'},
          {name:'Big Sigh',stat:'warmth',mult:.85,elem:'chatter',target:'one',msg:'{e} sighs at {t}. Loudly. For a long time.'},
          {name:'Walk Into Shot',stat:'pow',mult:1.3,elem:'kinetic',target:'one',every:3,msg:'{e} WALKS INTO THE SHOT and bumps {t}!'}]},
  boommoth:{level:5,hp:120,pow:14,grit:9,warmth:13,cool:10,pep:15,weak:['splash','kinetic'],resist:['chatter'],step:2,evade:.15,
    acts:[{name:'Swoop',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} swoops down at {t}.'},
          {name:'Feedback',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['silenced',2],msg:'{e} lets out a FEEDBACK SCREECH at {t}. {t} is Silenced: no skills for a bit.'},
          {name:'Boom Drop',stat:'pow',mult:1.5,elem:'kinetic',target:'one',every:3,msg:'{e} drops the whole boom pole on {t}!'}]},
  clapper:{level:5,hp:110,pow:16,grit:10,warmth:9,cool:9,pep:24,weak:['cozy','sparkle'],resist:[],step:2,first:true,
    acts:[{name:'Snap',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} snaps at {t}.'},
          {name:'Slate',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} slates {t}. Scene one, take one.'},
          {name:'Marker!',stat:'pow',mult:.75,elem:'chatter',target:'all',every:3,msg:'MARKER! {e} claps so hard everyone flinches!'}]},
  fogwisp:{level:6,hp:130,pow:12,grit:8,warmth:15,cool:14,pep:12,weak:['cozy','kinetic'],resist:['splash'],step:2,evade:.2,
    acts:[{name:'Damp Chill',stat:'warmth',mult:1,elem:'splash',target:'one',msg:'{e} drifts over {t}. It is cold and damp.'},
          {name:'Fog Bank',stat:'warmth',mult:.6,elem:'splash',target:'one',status:['fogged',2],msg:'{e} wraps {t} in fog. {t} can barely see.'},
          {name:'Pea Souper',stat:'warmth',mult:.7,elem:'splash',target:'all',every:3,status:['fogged',2],msg:'PEA SOUPER! {e} fogs up everyone!'}]},
  cuecrab:{level:5,hp:180,pow:14,grit:17,warmth:10,cool:12,pep:10,weak:['splash','chatter'],resist:['kinetic'],step:3,
    praise:{label:'COMPLIMENT',sub:'Free · it loves a compliment',share:.45,
      react:['The crab lowers its cards. It\'s blushing. Crabs are already red, but still.','The crab holds up a new card: REALLY?','The crab clutches its cards to its chest.']},
    acts:[{name:'Pinch',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} pinches {t}.'},
          {name:'Line Reading',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} holds up a card for {t}: YOU ARE BAD AT THIS.'},
          {name:'Card Toss',stat:'pow',mult:.8,elem:'kinetic',target:'all',every:3,msg:'{e} throws every card it has! Paper cuts for everyone!'}]},
  // The Director's Cut (chapter 4 boss, engine/battle2.js B2_DIRECTOR): every third turn it telegraphs CUT! (the next
  // person on the turn ribbon loses their turn) or Take Two (it heals itself), taking turns. Below half HP two Extra
  // Extras walk on and it braces behind a shield for That's a Wrap on everyone (Popcorn Jump or any Tombo breaks it;
  // so do 3 Cozy hits). Un-Grump route: GREAT TAKE! (▼ Care & Bag) three times.
  directorscut:{level:7,hp:760,pow:22,grit:15,warmth:16,cool:13,pep:11,weak:['sparkle','cozy'],resist:['chatter'],step:4,boss:'directorscut',noRun:true,
    praise:{label:'GREAT TAKE!',sub:'Free · tell it what it never hears',need:3,
      react:['The Director’s Cut stops mid-yell. "...Great?" Its beret tilts.','The Director’s Cut squeaks. "Did you say GREAT? Say it again. Into me."']},
    acts:[{name:'Megaphone Blast',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} yells right at {t}. Through itself.'},
          {name:'Script Smack',stat:'pow',mult:1.1,elem:'kinetic',target:'one',msg:'{e} whacks {t} with a rolled-up script.'},
          {name:'Notes',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['gritdown',2],msg:'{e} gives {t} notes. Nine pages of notes. {t} feels smaller.'}],
    take2:.16,
    rumble:{name:'That’s a Wrap',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'THAT’S A WRAP! {e} shouts so loud the whole set falls over!'},
    shield:{need:3,elems:['cozy']}},
  // Chapter 5: Long Island Elementary (data/school-monsters.js).
  popquiz:{level:5,hp:70,pow:12,grit:8,warmth:10,cool:9,pep:12,weak:['chatter','cozy'],resist:[],step:2,
    acts:[{name:'Paper Cut',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} paper-cuts {t}.'},
          {name:'Trick Question',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} asks {t} a trick question. {t} is Dizzy.'},
          {name:'Time’s Up',stat:'warmth',mult:.7,elem:'chatter',target:'one',vpDrain:2,every:3,msg:'TIME’S UP! {e} snatches the pencil from {t}.'}]},
  tardybell:{level:6,hp:125,pow:15,grit:10,warmth:11,cool:10,pep:16,weak:['splash','chatter'],resist:['kinetic'],step:2,
    acts:[{name:'Bonk',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} swings and bonks {t}.'},
          {name:'You’re Late',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['tardy',2],msg:'{e} rings at {t}: LATE! {t} is Tardy.'},
          {name:'Recess Bell',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['tardy',1],msg:'RECESS BELL! {e} rings so loud everyone loses track of time!'}]},
  glitterglue:{level:6,hp:135,pow:13,grit:11,warmth:14,cool:12,pep:11,weak:['splash','kinetic'],resist:['sparkle'],step:2,
    acts:[{name:'Squirt',stat:'warmth',mult:1,elem:'splash',target:'one',msg:'{e} squirts {t}. It is cold. It is sparkly.'},
          {name:'Glue Down',stat:'pow',mult:.8,elem:'splash',target:'one',status:['glued',2],msg:'{e} glues {t}’s shoes to the floor. {t} is Glued.'},
          {name:'Glitter Bomb',stat:'warmth',mult:.75,elem:'sparkle',target:'all',every:3,status:['dizzy',1],msg:'GLITTER BOMB! {e} gets glitter in everyone’s eyes!'}]},
  dodgeball:{level:6,hp:150,pow:17,grit:11,warmth:10,cool:10,pep:18,weak:['chatter','splash'],resist:['kinetic'],step:3,evade:.25,
    acts:[{name:'Bounce',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} bounces off {t}.'},
          {name:'Picked Last',stat:'warmth',mult:.9,elem:'chatter',target:'one',status:['powdown',2],msg:'{e} picks {t} last. {t} feels small.'},
          {name:'Ricochet',stat:'pow',mult:.8,elem:'kinetic',target:'all',every:3,msg:'RICOCHET! {e} bounces off every wall and everyone in the gym!'}]},
  // The Red Pen (chapter 5 boss, engine/battle2.js B2_REDPEN): every third turn it locks onto someone for SEE ME (a hit
  // that marks them: double damage taken for 2 turns; its normal attacks then go for the marked one; DEFEND covers it,
  // Squishy Squeeze clears it). Below half HP two Pop Quizzes flutter in and it braces behind a shield for Final Grade
  // on everyone (2 Splash or Sparkle hits, any Tombo, or Amy's Pop Quiz break it). Un-Grump route: NICE HANDWRITING x3.
  redpen:{level:8,hp:820,pow:23,grit:15,warmth:17,cool:14,pep:12,weak:['splash','sparkle'],resist:['kinetic'],step:4,boss:'redpen',noRun:true,
    praise:{label:'NICE HANDWRITING',sub:'Free · nobody ever says it',need:3,tag:'NICE',
      react:['The Red Pen stops mid-circle. "...Nice?" A tiny drop of ink rolls down its side.','The Red Pen clicks twice. "Say it again. Slowly. In cursive."']},
    acts:[{name:'Red Ink',stat:'pow',mult:1.05,elem:'splash',target:'one',msg:'{e} flicks red ink all over {t}.'},
          {name:'Margin Note',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} writes AWK in the margin next to {t}.'},
          {name:'Points Off',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['gritdown',2],msg:'{e} takes points off {t}. {t} feels like a C minus.'}],
    chomp:{name:'SEE ME',stat:'pow',mult:1.3,elem:'chatter',target:'one',status:['seeme',2],msg:'{e} circles {t} in red ink. SEE ME. {t} takes double damage for a while!'},
    rumble:{name:'Final Grade',stat:'pow',mult:1.45,elem:'chatter',target:'all',msg:'FINAL GRADE! {e} grades everyone at once. Nobody gets an A!'},
    shield:{need:2,elems:['splash','sparkle']}},
  // Chapter 6: Old Oak Park, the Old Oak and its crown (data/oak-monsters.js).
  acornagent:{level:6,hp:72,pow:13,grit:9,warmth:10,cool:9,pep:14,weak:['chatter','splash'],resist:[],step:2,
    acts:[{name:'Bonk',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} bonks {t} with its cap.'},
          {name:'Pebble',stat:'pow',mult:.85,elem:'kinetic',target:'one',status:['dizzy',2],msg:'{e} pings a pebble off {t}’s head. {t} is Dizzy.'},
          {name:'Code Red',stat:'pow',mult:.7,elem:'kinetic',target:'all',every:3,msg:'CODE RED! {e} radios in, and pebbles rain on everyone!'}]},
  stickysap:{level:6,hp:96,pow:12,grit:12,warmth:13,cool:12,pep:9,weak:['cozy','kinetic'],resist:['splash'],step:2,
    acts:[{name:'Drip',stat:'warmth',mult:1,elem:'splash',target:'one',msg:'{e} drips on {t}. It does not come off.'},
          {name:'Stuck',stat:'pow',mult:.8,elem:'splash',target:'one',status:['glued',2],msg:'{e} sticks {t} to the bark. {t} is Glued.'},
          {name:'Sap Flow',stat:'warmth',mult:.7,elem:'splash',target:'all',every:3,status:['glued',1],msg:'SAP FLOW! {e} oozes over everyone’s shoes!'}]},
  peanutgallery:{level:7,hp:140,pow:14,grit:11,warmth:15,cool:12,pep:15,weak:['chatter','cozy'],resist:['kinetic'],step:2,
    acts:[{name:'Boo',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} boos {t}. Loudly. With its whole shell.'},
          {name:'Heckle',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['heckled',2],msg:'{e} tells {t} their shoes are untied. {t} is Heckled.'},
          {name:'Standing Boo-vation',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['heckled',1],msg:'STANDING BOO-VATION! {e} boos everyone at once!'}]},
  twigspy:{level:7,hp:130,pow:16,grit:10,warmth:11,cool:13,pep:17,weak:['cozy','sparkle'],resist:['chatter'],step:2,evade:.25,
    acts:[{name:'Poke',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} pokes {t} with its sharpest end.'},
          {name:'Stakeout',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['spotted',2],msg:'{e} watches {t} through its binoculars. {t} is Spotted: they take more damage.'},
          {name:'Leaf Storm',stat:'pow',mult:.75,elem:'kinetic',target:'all',every:3,msg:'LEAF STORM! {e} shakes every leaf in the garden onto everyone!'}]},
  cheekstuffer:{level:7,hp:190,pow:16,grit:16,warmth:10,cool:11,pep:10,weak:['splash','chatter'],resist:['kinetic'],step:3,
    acts:[{name:'Cheek Bump',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} bumps {t} with both cheeks.'},
          {name:'Crumb Spray',stat:'warmth',mult:.9,elem:'chatter',target:'one',msg:'{e} tries to talk with its mouth full. Crumbs go all over {t}.'},
          {name:'Snack Snatch',stat:'pow',mult:.8,elem:'kinetic',target:'one',vpDrain:3,every:3,msg:'SNACK SNATCH! {e} stuffs {t}’s energy right in its cheeks!'}]},
  // The Acorn Cache: buried by Chairman Cheeks mid-fight. It never acts (inert). Nara digs it up for double damage.
  acorncache:{level:9,hp:60,pow:1,grit:8,warmth:1,cool:8,pep:4,weak:['kinetic'],resist:[],step:3,inert:true,
    acts:[{name:'Sit',stat:'pow',mult:0,elem:'kinetic',target:'one',msg:'{e} sits there.'}]},
  // Chairman Cheeks (chapter 6 boss, engine/battle2.js B2_CHEEKS): on its 2nd, 5th, 8th... turn it buries an Acorn Cache;
  // if the cache is still there on its next turn it digs it up and eats it (heals, POW up). Below half HP two Acorn
  // Agents drop in and it braces behind a shield for The Big Stash on everyone (2 Kinetic or Splash hits, or any Tombo,
  // break it). Un-Grump route: SHARE A SNACK (▼ Care & Bag) three times.
  chairman:{level:9,hp:880,pow:24,grit:16,warmth:17,cool:15,pep:13,weak:['splash','cozy'],resist:['chatter'],step:4,boss:'chairman',noRun:true,
    praise:{label:'SHARE A SNACK',sub:'Free · nobody ever shares with it',need:3,tag:'SHARED',
      react:['Chairman Cheeks freezes. It sniffs. "...For me? Nobody... for ME?" Its tie droops.','Chairman Cheeks takes it very carefully, in both paws. "Is this a trick? Is the trick that it\'s not a trick?"']},
    acts:[{name:'Cheek Slam',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} slams {t} with both cheeks.'},
          {name:'Acorn Volley',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} spits three acorns at {t}. Rapid fire.'},
          {name:'Filibuster',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} chitters at {t} for a very long time. {t} is Dizzy.'}],
    rumble:{name:'The Big Stash',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'THE BIG STASH! {e} dumps the whole hoard on everyone!'},
    shield:{need:2,elems:['kinetic','splash']}},
  // Chapter 7: the Stacks under the Hush Library and the Reading Room (data/library-monsters.js).
  shusher:{level:7,hp:78,pow:13,grit:9,warmth:12,cool:10,pep:15,weak:['sparkle','cozy'],resist:[],step:2,
    acts:[{name:'Tassel Flick',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} flicks {t} with its tassel.'},
          {name:'SHHH',stat:'warmth',mult:.7,elem:'chatter',target:'one',status:['shushed',2],msg:'{e} shushes {t}. Right in the ear. {t} is Shushed: no Chatter moves.'},
          {name:'Hush Hour',stat:'warmth',mult:.65,elem:'chatter',target:'all',every:3,msg:'HUSH HOUR! {e} shushes everyone at once!'}]},
  dogear:{level:7,hp:92,pow:14,grit:10,warmth:10,cool:11,pep:11,weak:['splash','cozy'],resist:['chatter'],step:2,
    acts:[{name:'Paper Cut',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} paper-cuts {t}.'},
          {name:'Fold',stat:'pow',mult:.85,elem:'kinetic',target:'one',status:['gritdown',2],msg:'{e} folds {t}’s collar down. {t} feels smaller.'},
          {name:'Crease',stat:'pow',mult:.7,elem:'kinetic',target:'all',every:3,msg:'CREASE! {e} folds the whole aisle in half!'}]},
  cliffhanger:{level:8,hp:150,pow:16,grit:11,warmth:15,cool:12,pep:15,weak:['cozy','chatter'],resist:['kinetic'],step:2,
    acts:[{name:'Swing',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} swings off the shelf into {t}.'},
          {name:'Plot Twist',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} tells {t} a plot twist. {t} is Dizzy.'},
          {name:'To Be Continued',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['dizzy',1],msg:'TO BE CONTINUED! {e} leaves everyone hanging!'}]},
  knowitall:{level:8,hp:160,pow:15,grit:14,warmth:14,cool:13,pep:12,weak:['chatter','sparkle'],resist:['cozy'],step:2,
    acts:[{name:'Spine Bonk',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} bonks {t} with its spine. Technically a fact.'},
          {name:'Actually',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['gritdown',2],msg:'{e} says ACTUALLY to {t}. {t} feels like a C minus.'},
          {name:'Well, Technically',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,msg:'WELL, TECHNICALLY! {e} corrects everyone at once!'}]},
  popup:{level:8,hp:165,pow:18,grit:11,warmth:11,cool:11,pep:18,weak:['kinetic','sparkle'],resist:['chatter'],step:3,evade:.25,
    acts:[{name:'Pop!',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} pops up at {t}. BOO!'},
          {name:'Jump Out',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['powdown',2],msg:'{e} jumps out at {t}. {t} jumps too. POW down.'},
          {name:'Big Reveal',stat:'pow',mult:.8,elem:'kinetic',target:'all',every:3,msg:'BIG REVEAL! {e} pops open at everyone!'}]},
  // The Unread (chapter 7 boss, engine/battle2.js B2_UNREAD): it reads one chapter at a time. On its 2nd, 5th, 8th...
  // turn it announces a PAGE TURN; on the next turn it turns to a new genre, and its weakness and resistance change
  // (B2_UNREAD.genres). Below half HP two Shushers slip out of its pages and it braces behind a shield for THE END on
  // everyone (2 Sparkle or Cozy hits, or any Tombo). Un-Grump route: READ ALOUD (▼ Care & Bag) three times.
  unread:{level:10,hp:900,pow:24,grit:16,warmth:18,cool:15,pep:12,weak:['chatter'],resist:['kinetic'],step:4,boss:'unread',noRun:true,
    praise:{label:'READ ALOUD',sub:'Free · nobody has ever read it',need:3,tag:'READ',
      react:['The Unread goes very still. A page flutters. "...Keep going. Please."','The Unread leans in. Dust drifts off its cover. "Nobody has ever done the voices before."']},
    acts:[{name:'Cover Slam',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} slams its cover on {t}.'},
          {name:'Whisper',stat:'warmth',mult:.95,elem:'chatter',target:'one',status:['heckled',2],msg:'{e} whispers one of {t}’s secrets to the whole room. {t} is Heckled.'},
          {name:'Dust Cloud',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} blows seventy years of dust at {t}. {t} is Dizzy.'},
          {name:'SHHHH',stat:'warmth',mult:.6,elem:'chatter',target:'all',status:['shushed',1],msg:'SHHHHHH! {e} hushes the whole room. Nobody can talk!'}],
    rumble:{name:'THE END',stat:'pow',mult:1.45,elem:'chatter',target:'all',msg:'THE END! {e} slams shut on everyone at once!'},
    shield:{need:2,elems:['sparkle','cozy']}},
  // Chapter 8: the Car Barn on Jefferson Boulevard and its Boiler Room (data/barn-monsters.js).
  lukewarm:{level:8,hp:84,pow:14,grit:10,warmth:12,cool:11,pep:13,weak:['cozy','sparkle'],resist:['splash'],step:2,
    acts:[{name:'Slosh',stat:'warmth',mult:1,elem:'splash',target:'one',msg:'{e} sloshes {t}. It is room temperature.'},
          {name:'Cold Shoulder',stat:'warmth',mult:.75,elem:'chatter',target:'one',status:['chilled',2],msg:'{e} gives {t} the cold shoulder. {t} is Chilled.'},
          {name:'Room Temperature',stat:'warmth',mult:.65,elem:'splash',target:'all',every:3,status:['chilled',1],msg:'ROOM TEMPERATURE! {e} takes the warm out of everyone!'}]},
  leftover:{level:8,hp:98,pow:15,grit:12,warmth:11,cool:10,pep:10,weak:['cozy','kinetic'],resist:['chatter'],step:2,
    acts:[{name:'Lid Flip',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} flips its lid at {t}.'},
          {name:'Mystery Smell',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} opens up next to {t}. The smell! {t} is Dizzy.'},
          {name:'Freezer Burn',stat:'pow',mult:.7,elem:'kinetic',target:'all',every:3,status:['chilled',1],msg:'FREEZER BURN! {e} gets frosty with everyone!'}]},
  wetblanket:{level:9,hp:165,pow:16,grit:13,warmth:15,cool:13,pep:12,weak:['cozy','kinetic'],resist:['splash'],step:2,
    acts:[{name:'Smother',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} flops over {t} and smothers them.'},
          {name:'Why Bother',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['powdown',2],msg:'{e} sighs at {t}: why bother? {t} feels like not bothering.'},
          {name:'Damp Spirits',stat:'warmth',mult:.7,elem:'splash',target:'all',every:3,status:['drowsy',1],msg:'DAMP SPIRITS! {e} drapes itself over everyone!'}]},
  thedraft:{level:9,hp:150,pow:17,grit:11,warmth:14,cool:14,pep:18,weak:['cozy','sparkle'],resist:['chatter'],step:2,evade:.25,
    acts:[{name:'Gust',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} gusts right through {t}.'},
          {name:'Cold Shoulder',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['chilled',2],msg:'{e} gives {t} the cold shoulder. {t} is Chilled.'},
          {name:'Slam the Door',stat:'pow',mult:.75,elem:'kinetic',target:'all',every:3,msg:'SLAM THE DOOR! {e} blows every door in the shop shut on everyone!'}]},
  pickyeater:{level:9,hp:190,pow:17,grit:15,warmth:12,cool:12,pep:11,weak:['chatter','splash'],resist:['kinetic'],step:3,
    acts:[{name:'Lid Snap',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} snaps its lid at {t}.'},
          {name:'EW',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['heckled',2],msg:'{e} looks at {t} and says EW. {t} is Heckled.'},
          {name:'Push It Away',stat:'pow',mult:.8,elem:'kinetic',target:'one',vpDrain:3,every:3,msg:'PUSH IT AWAY! {e} shoves {t}’s whole tray back, energy and all!'}]},
  // Old Ironbelly (chapter 8 boss, engine/battle2.js B2_IRON): her oven heat goes up one step every turn (WARM, HOT,
  // HOTTER, BROIL). At BROIL she telegraphs a BROIL on everyone for her next turn, then cools back to WARM. Splash hits
  // cool her one step (and call off a BROIL); Cozy hits stoke her one step. Below half HP two Lukewarms drip out of the
  // ash pan and she braces behind a shield for FULL FURNACE on everyone (2 Splash or Kinetic hits, or any Tombo).
  // Un-Grump route: BAKE SOMETHING (▼ Care & Bag) three times; each one also puts a step of her heat into the bread.
  ironbelly:{level:11,hp:960,pow:25,grit:17,warmth:18,cool:16,pep:12,weak:['splash'],resist:['cozy'],step:4,boss:'ironbelly',noRun:true,
    praise:{label:'BAKE SOMETHING',sub:'Free · nothing baked in her since 1963',need:3,tag:'BAKED',
      react:['Old Ironbelly goes very quiet. Her grate ticks. "...Is that bread? In ME?"','Old Ironbelly’s glow goes soft and gold. "Sixty years. I forgot what that smell does to a stove."']},
    acts:[{name:'Belly Bump',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} bumps {t} with her big iron belly.'},
          {name:'Hot Coal',stat:'pow',mult:1,elem:'cozy',target:'one',msg:'{e} spits a hot coal at {t}.'},
          {name:'Soot Puff',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} puffs soot all over {t}. {t} is Dizzy.'},
          {name:'Draw the Flame',stat:'warmth',mult:.8,elem:'cozy',target:'one',status:['chilled',2],msg:'{e} pulls the warm right out of {t}. {t} is Chilled.'}],
    flop:{name:'BROIL',stat:'pow',mult:1.25,elem:'cozy',target:'all',msg:'BROIL! {e} throws open her firebox. Everyone gets the full five hundred degrees!'},
    rumble:{name:'Full Furnace',stat:'pow',mult:1.45,elem:'cozy',target:'all',msg:'FULL FURNACE! {e} opens every damper at once!'},
    shield:{need:2,elems:['splash','kinetic']}},
  // Chapter 9: the Moon Club and its Dome (data/club-monsters.js).
  velvetrope:{level:9,hp:88,pow:14,grit:11,warmth:13,cool:11,pep:13,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Rope Swing',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} swings its velvet rope at {t}.'},
          {name:'Not on the List',stat:'warmth',mult:.75,elem:'chatter',target:'one',status:['snubbed',2],msg:'{e} checks the list. {t} is not on it. {t} is Snubbed.'},
          {name:'Members Only',stat:'warmth',mult:.65,elem:'chatter',target:'all',every:3,status:['snubbed',1],msg:'MEMBERS ONLY! {e} snubs everyone at once!'}]},
  stuffedshirt:{level:9,hp:100,pow:15,grit:13,warmth:11,cool:12,pep:10,weak:['chatter','splash'],resist:['sparkle'],step:2,
    acts:[{name:'Stiff Arm',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} stiff-arms {t}. Very starched.'},
          {name:'Hmph',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['gritdown',2],msg:'{e} looks down its nose at {t}. {t} feels underdressed.'},
          {name:'How Gauche',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,msg:'HOW GAUCHE! {e} sniffs at everyone at once!'}]},
  coathanger:{level:10,hp:170,pow:17,grit:13,warmth:14,cool:13,pep:13,weak:['kinetic','splash'],resist:['cozy'],step:2,
    acts:[{name:'Hook',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} hooks {t} by the collar.'},
          {name:'Cling',stat:'pow',mult:.85,elem:'kinetic',target:'one',status:['slow',2],msg:'{e} clings to {t} and will not let go. {t} is Slowed.'},
          {name:'Hang On',stat:'pow',mult:.7,elem:'kinetic',target:'all',every:3,status:['slow',1],msg:'HANG ON! {e} clings to everybody at once!'}]},
  soreloser:{level:10,hp:175,pow:17,grit:14,warmth:14,cool:12,pep:14,weak:['cozy','sparkle'],resist:['chatter'],step:2,
    acts:[{name:'Card Flick',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} flicks a card at {t}.'},
          {name:'Cheater!',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} shouts CHEATER at {t}. {t} is Dizzy.'},
          {name:'Fifty-Two Pickup',stat:'pow',mult:.8,elem:'kinetic',target:'one',vpDrain:3,every:3,msg:'FIFTY-TWO PICKUP! {e} throws the deck at {t} and takes their energy for the pot!'}]},
  wallflower:{level:10,hp:180,pow:18,grit:12,warmth:13,cool:13,pep:16,weak:['sparkle','cozy'],resist:['kinetic'],step:3,evade:.25,
    acts:[{name:'Sorry!',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} bumps {t} by accident. SORRY.'},
          {name:'Do Not Look',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['frozen',2],msg:'{e} hides from {t} so hard that {t} freezes too. {t} is Scared Stiff.'},
          {name:'Petal Storm',stat:'warmth',mult:.75,elem:'sparkle',target:'all',every:3,msg:'DO NOT LOOK AT ME! {e} flings petals everywhere!'}]},
  // The Mirrorball (chapter 9 boss, engine/battle2.js B2_BALL): her mirror side shows one element (Sparkle, Kinetic,
  // Splash, Cozy, round and round; it turns after each of her turns). Hits with that element bounce back: she takes a
  // quarter, the attacker takes some (never a knockout). Tombos never bounce. Every third turn she SPOTLIGHTs someone
  // and does a SOLO on them next turn (Tom can DEFEND). Below half HP two Stuffed Shirts stroll in and she braces behind
  // a shield for LAST DANCE on everyone (2 Chatter or Kinetic hits, or any Tombo). Un-Grump route: ASK HER TO DANCE x3.
  mirrorball:{level:12,hp:980,pow:26,grit:17,warmth:19,cool:16,pep:13,weak:['chatter'],resist:[],step:4,boss:'mirrorball',noRun:true,
    praise:{label:'ASK HER TO DANCE',sub:'Free · nobody has asked since 1971',need:3,tag:'DANCED',
      react:['The Mirrorball stops turning for a moment. "...Me? You want to dance with ME?"','The Mirrorball glows a little warmer. "Nobody has asked me that since the band packed up."']},
    acts:[{name:'Dazzle',stat:'warmth',mult:1,elem:'sparkle',target:'one',status:['dizzy',2],msg:'{e} flashes a hundred little lights in {t}’s eyes. {t} is Dizzy.'},
          {name:'Chain Swing',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} swings down on her chain into {t}.'},
          {name:'Glitter Beam',stat:'warmth',mult:.8,elem:'sparkle',target:'all',msg:'{e} spins. Beams of light everywhere. Nobody can see a thing.'}],
    solo:{name:'SOLO',stat:'pow',mult:1.6,elem:'sparkle',target:'one',msg:'SOLO! {e} drops the whole spotlight on {t}!'},
    rumble:{name:'LAST DANCE',stat:'pow',mult:1.45,elem:'sparkle',target:'all',msg:'LAST DANCE! {e} spins the whole Dome!'},
    shield:{need:2,elems:['chatter','kinetic']}},
  // Chapter 10: Terminal Zero and Gate Zero (data/terminal-monsters.js).
  carryon:{level:10,hp:96,pow:15,grit:13,warmth:11,cool:11,pep:12,weak:['sparkle','splash'],resist:[],step:2,
    acts:[{name:'Wheelie',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} rolls right over {t}’s foot.'},
          {name:'Overhead Bin',stat:'pow',mult:.9,elem:'kinetic',target:'one',status:['gritdown',2],msg:'{e} falls out of the overhead bin onto {t}. {t} feels squashed.'},
          {name:'Gate Check',stat:'pow',mult:.7,elem:'kinetic',target:'all',every:3,msg:'GATE CHECK! {e} bumps into everyone looking for a spot!'}]},
  jetlag:{level:10,hp:90,pow:13,grit:11,warmth:15,cool:13,pep:11,weak:['kinetic','cozy'],resist:['chatter'],step:2,
    acts:[{name:'Yawn',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['drowsy',2],msg:'{e} yawns right at {t}. {t} is Drowsy.'},
          {name:'Red-Eye',stat:'warmth',mult:1,elem:'sparkle',target:'one',msg:'{e} gives {t} the red-eye. Ouch.'},
          {name:'Time Zone',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['drowsy',1],msg:'TIME ZONE! {e} puts everyone three hours behind!'}]},
  longline:{level:11,hp:182,pow:17,grit:14,warmth:14,cool:13,pep:12,weak:['kinetic','sparkle'],resist:['chatter'],step:2,
    acts:[{name:'Belt Snap',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} snaps a belt at {t}.'},
          {name:'Please Wait',stat:'pow',mult:.85,elem:'kinetic',target:'one',status:['slow',2],msg:'{e} tells {t} to wait to be called. {t} is Slowed.'},
          {name:'Random Screening',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['slow',1],msg:'RANDOM SCREENING! {e} pulls everyone aside!'}]},
  unclaimed:{level:11,hp:188,pow:18,grit:16,warmth:13,cool:12,pep:12,weak:['splash','cozy'],resist:['kinetic'],step:2,
    acts:[{name:'Heavy Bag',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} thumps down on {t}. It is VERY heavy.'},
          {name:'Carousel',stat:'warmth',mult:.85,elem:'chatter',target:'one',status:['dizzy',2],msg:'{e} spins {t} round the carousel. {t} is Dizzy.'},
          {name:'Excess Baggage',stat:'pow',mult:.8,elem:'kinetic',target:'one',vpDrain:3,every:3,msg:'EXCESS BAGGAGE! {e} charges {t} a fee and takes their energy!'}]},
  armresthog:{level:11,hp:194,pow:18,grit:13,warmth:14,cool:14,pep:15,weak:['chatter','sparkle'],resist:['cozy'],step:3,
    acts:[{name:'Elbow',stat:'pow',mult:1.05,elem:'kinetic',target:'one',status:['powdown',2],msg:'{e} elbows {t} off the armrest. {t} feels weaker.'},
          {name:'Recline',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} reclines all the way back into {t}.'},
          {name:'Full Recline',stat:'pow',mult:.75,elem:'kinetic',target:'all',every:3,status:['drowsy',1],msg:'FULL RECLINE! {e} flops back onto everyone and starts snoring!'}]},
  // The Last Call (chapter 10 boss, engine/battle2.js B2_CALL): at the start of each of her turns she calls one person (NOW
  // BOARDING, on whoever is furthest down the ribbon, Tom last). If they act before her next turn they board (+2 VP);
  // if not, GATE CLOSED hits them and they lose their next turn, unless Tom is DEFENDing them (he walks them on).
  // DELAYED pushes the person she called back down the ribbon. Below half HP two Carry-Ons roll in and she braces behind a shield for
  // FINAL BOARDING on everyone (2 Kinetic or Sparkle hits, or any Tombo). Un-Grump route: ANSWER THE CALL x3.
  lastcall:{level:13,hp:1040,pow:27,grit:18,warmth:20,cool:17,pep:13,weak:['splash','cozy'],resist:['chatter'],step:4,boss:'lastcall',noRun:true,
    praise:{label:'ANSWER THE CALL',sub:'Free · nobody has answered since 1989',need:3,tag:'CHECKED IN',
      react:['The Last Call’s flaps stop spinning. \"...Somebody is HERE? At Gate Zero?\"','Her flaps flutter, very softly. \"Thirty-seven years. I forgot what a passenger sounds like.\"']},
    acts:[{name:'Flap Slap',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} slaps {t} with a whole row of flaps.'},
          {name:'DELAYED',stat:'warmth',mult:.85,elem:'chatter',target:'one',delay:.7,msg:'{e} flips {t}’s flap to DELAYED. {t} gets pushed down the ribbon!'},
          {name:'Static',stat:'warmth',mult:.8,elem:'sparkle',target:'all',msg:'{e} crackles static over the speakers. Everybody winces.'}],
    gate:{name:'GATE CLOSED',stat:'pow',mult:1.3,elem:'kinetic',target:'one',msg:'GATE CLOSED!'},
    rumble:{name:'FINAL BOARDING',stat:'pow',mult:1.45,elem:'sparkle',target:'all',msg:'FINAL BOARDING! {e} flips every flap at once!'},
    shield:{need:2,elems:['kinetic','sparkle']}}
};
// Elements for monsters without their own block (weak, resist).
const B2_FOE_ELEMS={smoglet:[['sparkle','splash'],[]],tickets:[['cozy','splash'],[]],coyote:[['chatter'],[]],gridlock:[['chatter','sparkle'],[]],
  tarblob:[['cozy'],['kinetic']],bigshake:[['splash','sparkle'],[]]};
// Any monster without its own block gets one built from its old numbers so formations can use it.
function b2FoeDef(id) {
  if(B2_FOES[id]) return B2_FOES[id];
  const d=MONSTERS[id]||MONSTERS.mudling,L=d.level||1,el=B2_FOE_ELEMS[id]||[[],[]];
  B2_FOES[id]={level:L,hp:d.hp*5,pow:8+d.atk*3,grit:6+L*2+(d.armor||0)*3,warmth:6+L*2,cool:6+L*2,pep:d.dodge?14:9,weak:el[0],resist:el[1],step:2,
    evade:d.dodge?.2:0,goofEasy:!!d.confuseBonus,noRun:d.rank==='BOSS',
    acts:[{name:'Attack',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:(d.attacks&&d.attacks[0])||'{e} attacks {t}.'},
      {name:'Attack',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:(d.attacks&&d.attacks[1])||'{e} attacks {t}.'},
      d.special?{name:d.special.name,stat:'pow',mult:d.special.kind==='all'?1:1.5,elem:'kinetic',target:d.special.kind==='all'?'all':'one',every:d.special.every||3,vpDrain:d.special.kind==='drain'?2:0,msg:d.special.msg}:null].filter(Boolean)};
  return B2_FOES[id];
}
// Who shows up when Tom walks into a monster on the map. Default: just that monster.
const B2_FORMATIONS={mudling:[['mudling','front'],['mudling','front']],smoglet:[['smoglet','front'],['smoglet','front']],soggysock:[['soggysock','front'],['soggysock','front']],
  // Chapter 4. Extras come in crowds of 3 or 4 (a function picks).
  extra:()=>Math.random()<.5?[['extra','front'],['extra','front'],['extra','front']]:[['extra','front'],['extra','front'],['extra','front'],['extra','back']],
  boommoth:[['boommoth','front'],['extra','back']],clapper:[['clapper','front'],['extra','front']],fogwisp:[['fogwisp','front'],['fogwisp','front']],
  // Chapter 5. Pop Quizzes come in twos or threes; each room's troublemaker brings a Pop Quiz.
  popquiz:()=>Math.random()<.5?[['popquiz','front'],['popquiz','front']]:[['popquiz','front'],['popquiz','front'],['popquiz','back']],
  tardybell:[['tardybell','front'],['popquiz','back']],glitterglue:[['glitterglue','front'],['popquiz','back']],dodgeball:[['dodgeball','front'],['popquiz','back']],
  // Chapter 6. Acorn Agents come in twos or threes; each troublemaker brings an agent; inside the Oak, saps pair up.
  acornagent:()=>Math.random()<.5?[['acornagent','front'],['acornagent','front']]:[['acornagent','front'],['acornagent','front'],['acornagent','back']],
  stickysap:[['stickysap','front'],['acornagent','back']],
  peanutgallery:[['peanutgallery','front'],['acornagent','back']],twigspy:[['twigspy','front'],['acornagent','back']],cheekstuffer:[['cheekstuffer','front'],['acornagent','back']],
  // Chapter 7. Shushers come in twos; Dog-Ears in twos or threes; each wing's troublemaker brings a Shusher.
  shusher:[['shusher','front'],['shusher','front']],
  dogear:()=>Math.random()<.5?[['dogear','front'],['dogear','front']]:[['dogear','front'],['dogear','front'],['shusher','back']],
  cliffhanger:[['cliffhanger','front'],['shusher','back']],knowitall:[['knowitall','front'],['dogear','back']],popup:[['popup','front'],['shusher','back']],
  // Chapter 8. Lukewarms come in twos; Leftovers in twos or threes; each shop's troublemaker brings one along.
  lukewarm:[['lukewarm','front'],['lukewarm','front']],
  leftover:()=>Math.random()<.5?[['leftover','front'],['leftover','front']]:[['leftover','front'],['leftover','front'],['lukewarm','back']],
  wetblanket:[['wetblanket','front'],['lukewarm','back']],thedraft:[['thedraft','front'],['leftover','back']],pickyeater:[['pickyeater','front'],['leftover','back']],
  // Chapter 9. Velvet Ropes come in twos; Stuffed Shirts in twos or threes; each room's troublemaker brings one along.
  velvetrope:[['velvetrope','front'],['velvetrope','front']],
  stuffedshirt:()=>Math.random()<.5?[['stuffedshirt','front'],['stuffedshirt','front']]:[['stuffedshirt','front'],['stuffedshirt','front'],['velvetrope','back']],
  coathanger:[['coathanger','front'],['velvetrope','back']],soreloser:[['soreloser','front'],['stuffedshirt','back']],wallflower:[['wallflower','front'],['velvetrope','back']],
  // Chapter 10. Carry-Ons come in twos or threes; Jet Lags in twos; each wing's troublemaker brings one along.
  carryon:()=>Math.random()<.5?[['carryon','front'],['carryon','front']]:[['carryon','front'],['carryon','front'],['jetlag','back']],
  jetlag:[['jetlag','front'],['jetlag','front']],
  longline:[['longline','front'],['jetlag','back']],unclaimed:[['unclaimed','front'],['carryon','back']],armresthog:[['armresthog','front'],['jetlag','back']]};

// ---- Kindness (battle-design section 9). Every enemy has a pink Warmth bar; when it fills, the enemy is Un-Grumped:
// it feels better, waves and hops home, and counts as beaten (+50% coins, +20% HEART, a stamp in Grace's Kindness Scrapbook).
// B2_KIND: how much Warmth a kind move gives (member.move key), before scaling by the actor's WARMTH (x WARMTH/50).
// An enemy's favorites (its `likes`, shown by Inspect) count in full and fill HEART; any other kind move counts half.
// Repeating a move on the same enemy halves it each time (the joke gets old). Party-wide kind moves warm every enemy.
const B2_KIND={
  'rose.silly':200,'rose.peekaboo':120,'nara.puppy':250,
  'deedee.crisp':300,'deedee.hug':150,'deedee.dinner':150,'deedee.nurse':120,
  'grace.squishy':150,'grace.dance':150,'grace.subscribe':100,
  'tnb.metro':120,'tnb.wardrobe':150,'tnb.quickchange':100,'tom.starter':100,
  'amy.pep':150,'amy.pb':150,'boppy.recliner':120,'boppy.grumble':120,'boppy.trackstar':100
};
const B2_KIND_SCALE=50,B2_KIND_OTHER=.5,B2_KIND_REPEAT=.5,B2_KIND_GOAL_STEP=.1;
// What makes each enemy grumpy (the Inspect hint) and what cheers it up. goal: Warmth needed at its base level
// (+10% per level above). Monsters not listed use their area's default.
const B2_HOLLOW_LIKES=['rose.silly','rose.peekaboo','deedee.crisp','deedee.hug','nara.puppy'];
const B2_LA_LIKES=['tnb.metro','tnb.wardrobe','grace.dance','grace.squishy','tom.starter'];
// The marsh (chapter 3) is Boppy's turf: his grumbling and his stories go over well with fishing junk.
const B2_MARSH_LIKES=['boppy.grumble','boppy.trackstar','boppy.recliner','rose.silly','grace.dance'];
const B2_SET_LIKES=['tnb.wardrobe','tnb.quickchange','tnb.metro','nara.puppy','tom.starter'];
// Long Island Elementary (chapter 5) is Amy's turf: a good pep talk goes a long way with school stuff.
const B2_SCHOOL_LIKES=['amy.pep','amy.pb','grace.dance','rose.silly','grace.squishy'];
// Old Oak Park (chapter 6): the squirrels' crew. Nara's human eyes and TNB's charm go a long way; so does bread.
const B2_OAK_LIKES=['nara.puppy','tnb.metro','tnb.wardrobe','tom.starter','tnb.quickchange'];
// The Stacks (chapter 7): old books like to be read, and like a good show. Grace's channel goes over very well.
const B2_STACKS_LIKES=['grace.subscribe','grace.dance','grace.squishy','rose.silly','rose.peekaboo'];
// The Car Barn (chapter 8): cold kitchen things want warming up. TNB's moves and a good meal go over well.
const B2_BARN_LIKES=['tnb.wardrobe','tnb.quickchange','tom.starter','nara.puppy','tnb.metro'];
// The Moon Club (chapter 9): fancy party things want somebody to show up. Deedee's hugs and Boppy's stories go over well.
const B2_CLUB_LIKES=['deedee.hug','deedee.dinner','deedee.crisp','boppy.trackstar','tom.starter'];
// Terminal Zero (chapter 10): tired travel things want somebody to cheer them on. Amy's pep talks and Rose's silliness go over well.
const B2_TERM_LIKES=['amy.pep','amy.pb','rose.silly','grace.squishy','tom.starter'];
const B2_GRUMP={
  velvetrope:{goal:95,grumpy:'It has kept the line tidy since 1971. Nobody has come to the door.',likes:B2_CLUB_LIKES},
  stuffedshirt:{goal:105,grumpy:'Ironed for the last dance in 1971. Nobody has dressed up since.',likes:B2_CLUB_LIKES},
  coathanger:{goal:165,grumpy:'A lady left a coat with it in 1971 and said she\'d be right back.',likes:B2_CLUB_LIKES},
  soreloser:{goal:170,grumpy:'Fifty-five years in the deck. Every game, they take the Joker out first.',likes:B2_CLUB_LIKES},
  wallflower:{goal:175,grumpy:'It stood by the wall for every song. Nobody ever asked it to dance.',likes:B2_CLUB_LIKES},
  carryon:{goal:100,grumpy:'Packed for a trip in 1989. Nobody ever came to pick it up.',likes:B2_TERM_LIKES},
  jetlag:{goal:95,grumpy:'It hasn\'t known what time it\'s since 1989. Every clock says midnight.',likes:B2_TERM_LIKES},
  longline:{goal:165,grumpy:'Nobody has reached the front of it since 1989. A line with no front is just a crowd.',likes:B2_TERM_LIKES},
  unclaimed:{goal:170,grumpy:'Round and round the carousel since 1989. Every other bag got picked up.',likes:B2_TERM_LIKES},
  armresthog:{goal:180,grumpy:'It\'s saved these seats for someone since 1989. Nobody ever sat down next to it.',likes:B2_TERM_LIKES},
  lastcall:{goal:470,grumpy:'She\'s called Flight Zero every midnight since 1989. Nobody ever answered.',likes:['amy.pep','rose.silly','grace.dance','tom.starter','grace.squishy']},
  mirrorball:{goal:460,grumpy:'She turned for every full moon dance until 1971. Then the doors closed, and nobody came back.',likes:['deedee.hug','deedee.dinner','boppy.trackstar','tom.starter','deedee.crisp']},
  lukewarm:{goal:95,grumpy:'Poured at seven in the morning and forgotten by five past. Nobody ever finishes it.',likes:B2_BARN_LIKES},
  leftover:{goal:105,grumpy:'Brought home from a potluck in March. Nobody has opened it since.',likes:B2_BARN_LIKES},
  wetblanket:{goal:165,grumpy:'It put out every spark in the Car Barn for fifty years. Nobody ever thanked it, and now nothing is warm.',likes:B2_BARN_LIKES},
  thedraft:{goal:160,grumpy:'Everybody slams the door on it. Every single time.',likes:B2_BARN_LIKES},
  pickyeater:{goal:180,grumpy:'Every lunch in here used to be warmed up in Ironbelly. Since 1963, every lunch is cold.',likes:B2_BARN_LIKES},
  ironbelly:{goal:450,grumpy:'She cooked for the night crews every night for fifty years. Cold since 1963. Nobody has baked a thing in her since.',likes:['tom.starter','tnb.wardrobe','nara.puppy','tnb.quickchange','tnb.metro']},
  shusher:{goal:90,grumpy:'It marks everybody’s place, and nobody ever remembers which page it was on.',likes:B2_STACKS_LIKES},
  dogear:{goal:100,grumpy:'Folded at page 212 in 1987. Nobody ever came back to finish the book.',likes:B2_STACKS_LIKES},
  cliffhanger:{goal:160,grumpy:'Everybody reads the first chapter and puts it back. Nobody has ever found out how it ends.',likes:B2_STACKS_LIKES},
  knowitall:{goal:170,grumpy:'It knows everything that starts with K, and nobody looks anything up anymore.',likes:B2_STACKS_LIKES},
  popup:{goal:170,grumpy:'Built to be the big surprise. Nobody has opened it in six years.',likes:B2_STACKS_LIKES},
  unread:{goal:440,grumpy:'Shelved in 1952. Never checked out. Never opened. Nobody has ever read it aloud.',likes:['grace.subscribe','rose.peekaboo','grace.dance','rose.silly','tom.starter']},
  acornagent:{goal:90,grumpy:'It does all the running for the Chairman, and nobody ever says thank you.',likes:B2_OAK_LIKES},
  stickysap:{goal:110,grumpy:'Everybody touches the tree and then says EW.',likes:B2_OAK_LIKES},
  peanutgallery:{goal:150,grumpy:'Nobody ever cheers for the peanut. They just crack it open.',likes:B2_OAK_LIKES},
  twigspy:{goal:150,grumpy:'Nobody ever looks twice at a stick. It\'s a lonely job.',likes:B2_OAK_LIKES},
  cheekstuffer:{goal:180,grumpy:'It\'s always worried about winter. In Los Angeles. Nobody has ever shared a snack with it.',likes:B2_OAK_LIKES},
  acorncache:{goal:999,grumpy:'It\'s an acorn. It\'s not grumpy. It\'s a snack.',likes:[]},
  chairman:{goal:420,grumpy:'Chased off every bird feeder on 2nd Avenue for twenty years. Nobody has ever shared a thing with it.',likes:['nara.puppy','tnb.metro','tnb.wardrobe','tom.starter','tnb.quickchange']},
  popquiz:{goal:80,grumpy:'Nobody ever studies for it. That\'s the whole point of it. It\'s still hurt.',likes:B2_SCHOOL_LIKES},
  tardybell:{goal:140,grumpy:'Everybody groans when it rings. Forty years of groaning.',likes:B2_SCHOOL_LIKES},
  glitterglue:{goal:140,grumpy:'Used for one art project, then three years in a drawer.',likes:B2_SCHOOL_LIKES},
  dodgeball:{goal:160,grumpy:'Every kid in school is scared of it, and nobody ever picks it first.',likes:B2_SCHOOL_LIKES},
  redpen:{goal:400,grumpy:'A hundred thousand wrong answers went through it. Nobody has ever said its handwriting is nice.',likes:['amy.pep','amy.pb','grace.dance','rose.silly','tom.starter']},
  mudling:{goal:90,grumpy:'Cold, muddy, and nobody ever laughs at its jokes.',likes:B2_HOLLOW_LIKES},
  skeeter:{goal:100,grumpy:'Hungry, itchy, and everybody swats at it.',likes:B2_HOLLOW_LIKES},
  grump:{goal:150,grumpy:'Its pond is cold and nobody laughs at its croaks.',likes:B2_HOLLOW_LIKES},
  toad:{goal:200,grumpy:'It croaks all night and nobody croaks back.',likes:B2_HOLLOW_LIKES},
  log:{goal:240,grumpy:'Soggy, stuck, and it hasn\'t moved in years.',likes:B2_HOLLOW_LIKES},
  bigshake:{goal:320,grumpy:'Stuck under the city for a million years, and now its pipes are clogged with smog. Nobody ever asks how it\'s doing.',likes:['tnb.metro','tnb.wardrobe','tom.starter','nara.puppy','grace.dance']},
  soggysock:{goal:110,grumpy:'It lost its other sock in 1998 and has been soaking in the marsh ever since.',likes:B2_MARSH_LIKES},
  bobber:{goal:130,grumpy:'It bobs all day and nothing ever bites.',likes:B2_MARSH_LIKES},
  tangle:{goal:150,grumpy:'Somebody cast it badly in 1997. It\'s been in a knot ever since, and pulling only makes it worse.',likes:B2_MARSH_LIKES},
  snag:{goal:240,grumpy:'Every line in the marsh catches on it, and then everybody yells at it.',likes:B2_MARSH_LIKES},
  irongill:{goal:340,grumpy:'Older than the pier, every hook in the marsh has been in its lip, and nobody comes fishing just to visit anymore.',likes:['boppy.grumble','boppy.trackstar','boppy.recliner','rose.silly','grace.dance']},
  // Chapter 4: film-set Sprites like being noticed: TNB's wardrobe, Nara's head tilt, a compliment.
  extra:{goal:70,grumpy:'Nine hours in holding, a cold sandwich, and nobody ever sees its face.',likes:B2_SET_LIKES},
  boommoth:{goal:130,grumpy:'It hangs over everybody all day and nobody ever looks up.',likes:B2_SET_LIKES},
  clapper:{goal:130,grumpy:'Every take starts with it, and nobody remembers it.',likes:B2_SET_LIKES},
  fogwisp:{goal:140,grumpy:'They pump it in, and then they open the doors. Every single time.',likes:B2_SET_LIKES},
  cuecrab:{goal:220,grumpy:'It holds up every line, and nobody has ever said "nice handwriting."',likes:B2_SET_LIKES},
  directorscut:{goal:380,grumpy:'Forty years of bad takes went through it. Nobody has ever once said "great take."',likes:['tnb.wardrobe','tnb.quickchange','tnb.metro','nara.puppy','tom.starter']},
  bigone:{goal:350,grumpy:'The biggest, coldest, muddiest one. Nobody has laughed at its croaks in a hundred years.',likes:B2_HOLLOW_LIKES},
  _hollow:{goal:120,grumpy:'Cold, muddy, and nobody laughs at its croaks.',likes:B2_HOLLOW_LIKES},
  _la:{goal:120,grumpy:'Stuck in LA traffic, lonely, or overheated.',likes:B2_LA_LIKES}
};
function b2Grump(id) { return B2_GRUMP[id]||((MONSTERS[id]&&MONSTERS[id].la)?B2_GRUMP._la:B2_GRUMP._hollow); }

// ---- HEART meter (section 2): shared party gauge, 0 to 100, four hearts of 25. Kept between normal fights
// (STORY.flags.heart); a boss fight starts at 25. ----
const B2_HEART={cap:100,basic:5,care:15,weak:15,hurt:10,calm:20,boss:25};

// ---- Tombos (section 6): Tom plus one partner, paid from HEART, 0 VP. Picked on Tom's or the partner's turn (D-pad Left);
// the partner acts too without losing their own turn. Every Tombo breaks a boss's shield. Unlocked by the story flag
// in `flag` (the Battle Lab has them all). Tier 1 costs 25, tier 2 50, tier 3 75.
// Fields like a skill (elem, stat, mult, target, fx) plus partner, tier, cost, kindV (Warmth to the enemies it targets
// or, for party Tombos, to every enemy), and the animation in B2_TOMBO_ANIM (engine/battle2-kind.js).
const B2_TOMBOS=[
  {id:'grace1',partner:'grace',tier:1,cost:25,flag:'tombo:grace1',name:'Squishy Delivery',elem:['sparkle'],target:'party',weight:'standard',kindV:250,
    fx:[['heal',.35,0,'party'],['cure','debuff','party']],
    desc:'Grace begs for a new squishy and Tom sighs and says fine. A gift box floats down from the sky and a big pink sparkly dice squishy tumbles onto the front monster. The party heals 35% and loses its debuffs, and every enemy warms up.'},
  // Director's Cuts (dc: the Primary they belong to). Same HEART cost; numbers from the designed Director's Cut row (revamp
  // plan dc_tb_grace_1 Sparkle 2.1 row; option 3 brief dc_tombo_rose_clouds Chatter, no damage; dc_tombo_amy_dismissal
  // Sparkle party, vp 2 party, cure one Amy; dc_tombo_deedee_clean Splash party, heal 25% party, cure one each; dc_tb_boppy_1
  // Splash 2.3 all, row front, hooked (pinned) 2, burn 2 Boppy; dc_tb_tnb_1 Splash 2.2 all, cure party, cool down 2, rack Tom, kind; option 3 brief
  // dc_tb_nara_1 Which Hand? Kinetic 2.2 enemy, take; dc_tombo_grace_spotter Kinetic 2.8 row, hooked (pinned) 2, crit .25). Open when the Primary's
  // story flag is set and Tom and the partner are level 30 (b8DcOpen); the Battle Lab has them all.
  {id:'grace1_dc',dc:'grace1',partner:'grace',tier:1,cost:25,flag:'tombo:grace1',name:'Smash That Like Button',elem:['sparkle'],stat:'warmth',mult:2.1,target:'row',weight:'standard',kindV:250,
    fx:[['st','critup',3,'party'],['reveal','t'],['trend',1]],
    desc:'Grace makes Tom say the outro with her. A giant LIKE button drops from the sky and Tom smashes it with both hands. A Sparkle hit on a whole row (it warms them up and shows their weak spots), Glitter Nails for the party (more crits, some damage bounces back) for 3 turns, and Grace’s Trending goes up.'},
  {id:'rose1',partner:'rose',tier:1,cost:25,flag:'tombo:rose1',name:'Double-Decker Airplane',elem:['kinetic'],stat:'pow',mult:2.2,target:'enemy',weight:'standard',
    fx:[['st','stunned',1,'t'],['mount']],
    desc:'Rose rides Tom’s shoulders and they fly a loop through the monsters like a biplane, then she leans down and boops its nose. A big Kinetic hit, it sees stars (loses its next turn), and Rose stays up on Tom’s shoulders.'},
  {id:'rose1_dc',dc:'rose1',partner:'rose',tier:1,cost:25,flag:'tombo:rose1',name:'That Cloud Is Lamby',elem:['chatter'],target:'enemy',weight:'standard',kindV:250,
    fx:[['interrupt','t'],['ct',.25,'t'],['mount']],
    desc:'Tom says the cloud is a sourdough loaf. Rose says it is Lamby with Tom’s hair. The cloud agrees with Rose, turns into a giant fluffy Lamby and sits on one enemy. No damage: it warms right up, its wind-up is cancelled, its next turn comes later, and Rose stays up on Tom’s shoulders.'},
  {id:'deedee1',partner:'deedee',tier:1,cost:25,flag:'tombo:deedee1',name:'Wine and Gossip',elem:['cozy'],target:'party',weight:'standard',
    fx:[['heal',.60,0,'party'],['cure','amber','party'],['crust',2]],
    desc:'Tom and Deedee gossip about the monster over a glass of wine until it shrinks with embarrassment, then Deedee brings out the crisp. The party heals 60%, Amber melts away, and 2 Warm Crusts go on the tray.'},
  {id:'deedee1_dc',dc:'deedee1',partner:'deedee',tier:1,cost:25,flag:'tombo:deedee1',name:'Clean As You Go',elem:['splash'],target:'party',weight:'standard',kindV:250,
    fx:[['heal',.25,0,'party'],['cure','one','party']],
    desc:'Deedee washes faster and faster and Tom cannot keep up: the tower of clean plates in his arms grows to the ceiling and topples onto a monster. No damage: every enemy warms up, the party heals 25%, and each friend shakes off one debuff.'},
  {id:'tnb1',partner:'tnb',tier:1,cost:25,flag:'tombo:tnb1',name:'Popcorn Jump',elem:['cozy'],stat:'hybrid',mult:2.4,target:'all',weight:'standard',
    fx:[['st','kilnglow',3,'party']],
    desc:'Movie night. The slasher jumps out, so does Tom, and the giant popcorn bowl rains on every enemy. A big Cozy hit on every enemy; TNB laughs and kisses him, and the party glows: WARMTH and COOL +25% for 3 turns.'},
  {id:'tnb1_dc',dc:'tnb1',partner:'tnb',tier:1,cost:25,flag:'tombo:tnb1',name:'2nd Ave Window Wash',elem:['splash'],stat:'hybrid',mult:2.2,target:'all',weight:'standard',kindV:250,
    fx:[['cure','debuff','party'],['st','cooldown',2,'t'],['rack','tom']],
    desc:'Smog rolls down 2nd Ave. Tom sets up a turbo fan and blows it onto the monsters; TNB carves past on his longboard with the garden hose, kisses Tom, and a soapy wave washes over every enemy. A Splash hit on every enemy (it warms them up too), COOL Down for 2 turns, the party loses its debuffs, and Tom gets a costume from the rack.'},
  {id:'nara1',partner:'nara',tier:1,cost:25,flag:'tombo:nara1',name:'Sit. Paw. Treat.',elem:['kinetic'],stat:'pow',mult:2.3,target:'enemy',weight:'standard',crit:1,
    fx:[['scent',3,'t'],['heal',.2,0,'tom'],['heal',.2,0,'partner']],
    desc:'Tom holds up a treat. Nara sits, then gives him her paw so hard a giant paw slams down on the enemy. A sure critical Kinetic hit, the enemy is marked with her scent (Tracked Scent for 3 turns), and Tom and Nara each heal 20%.'},
  {id:'nara1_dc',dc:'nara1',partner:'nara',tier:1,cost:25,flag:'tombo:nara1',name:'Puzzle Toy',elem:['kinetic'],stat:'pow',mult:2.2,target:'enemy',weight:'standard',
    fx:[['take','t']],
    desc:'Tom hides treats in a puzzle toy. Nara sniffs, flips each lid and finds them one by one. The last treat is under the monster, so she sniffs it out and flips the monster over to get it. A Kinetic hit on one enemy, and she grabs whatever it is holding (coins if it holds nothing).'},
  {id:'boppy1',partner:'boppy',tier:1,cost:25,flag:'tombo:boppy1',name:'You Hold the Net',elem:['splash'],stat:'pow',mult:2.1,target:'all',weight:'standard',
    fx:[['row','front','t'],['st','grumbled',3,'t']],
    desc:'Tom holds the net, Boppy fishes, and they scoop every enemy out of the water in one huge net and dump them on the pier. A Splash hit on every enemy, the back row lands in the front, and they all hit 30% softer for 3 turns.'},
  {id:'boppy1_dc',dc:'boppy1',partner:'boppy',tier:1,cost:25,flag:'tombo:boppy1',name:'Quiet on Cattail Pier',elem:['splash'],stat:'pow',mult:2.3,target:'all',weight:'standard',
    fx:[['row','front','t'],['st','pinned',2,'t'],['burn',2,'boppy']],
    desc:'Father and son on Cattail Pier. Tom baits the hook with sourdough crust; Boppy shushes him, casts one huge line over every monster, and they both heave. A big Splash hit on every enemy, the back row is reeled into the front, they are Hooked (cannot dodge) for 2 turns, and Boppy gets 2 Heartburn.'},
  {id:'amy1',partner:'amy',tier:1,cost:25,flag:'tombo:amy1',name:'I Called It!',elem:['kinetic','sparkle'],stat:'pow',mult:2.2,target:'all',weight:'standard',
    fx:[['st','pepup',3,'party']],
    desc:'Tom and Amy both call dibs on the same monster and shove each other back and forth, knocking into every enemy. A Kinetic and Sparkle hit on all of them, and the party is faster (PEP +30%) for 3 turns.'},
  {id:'amy1_dc',dc:'amy1',partner:'amy',tier:1,cost:25,flag:'tombo:amy1',name:'Opening Night',elem:['sparkle'],target:'party',weight:'standard',kindV:250,
    fx:[['vp',2,'party'],['cure','one','amy']],
    desc:'Tom and Amy put on a musical for the party. Tom directs from his chair with a megaphone; Amy sings, jazz hands, kick line, spin; Tom joins the big finish in a top hat. No damage: every enemy warms up, the party gets 2 VP, and Amy shakes off one debuff.'},
  // Tier 2 (Task T, tombo-review.md Primary column; numbers from the revamp plan section I3, tier-2 rows). 50% HEART.
  // Not animated yet: a Tombo without B2_TOMBO_ANIM falls back to b2TomboPlain.
  {id:'grace2',partner:'grace',tier:2,cost:50,flag:'tombo:grace2',name:'Uncle Spotter Toss',elem:['kinetic'],stat:'pow',mult:2.9,target:'splash',weight:'standard',crit:1,
    fx:[['choreo',2,'tom']],
    desc:'Tom spots Grace like a gymnastics coach and tosses her sky-high; she flips and lands on the monster. A sure critical Kinetic hit that splashes its neighbors, and Tom gets 1 VP and a quicker next turn.'},
  {id:'grace2_dc',dc:'grace2',partner:'grace',tier:2,cost:50,flag:'tombo:grace2',name:'Judge Grace',elem:['kinetic'],stat:'pow',mult:2.8,target:'row',weight:'standard',crit:.25,
    fx:[['st','pinned',2,'t']],
    desc:'Grace makes Tom try a cartwheel. It is terrible, and she scores it a 2. The monsters laugh so hard they forget to defend, and Grace shows him how it is done, right into their faces. A Kinetic hit on one row with extra crit chance, and they are Hooked (cannot dodge) for 2 turns.'},
  {id:'rose2',partner:'rose',tier:2,cost:50,flag:'tombo:rose2',name:'Seat 1A Stowaway',elem:['cozy'],stat:'warmth',mult:2.8,target:'all',weight:'standard',kindV:300,
    fx:[['goof',1,'t'],['steal','t'],['st','evade',2,'both']],
    desc:'Tom wheels his carry-on into the monsters with a blanket over a lump with two sneakers sticking out. BOO! Rose pops out with Lamby and a giant raspberry. A Cozy hit on every enemy; they are Goofed and lose a buff each, and Tom and Rose turn Evasive for 2 turns.'},
  {id:'rose2_dc',dc:'rose2',partner:'rose',tier:2,cost:50,flag:'tombo:rose2',name:'Princess and Her Bodyguard',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['st','evade',2,'party'],['cure','mental','partner'],['mount']],
    desc:'Rose in full princess dress-up; Tom in sunglasses and an earpiece as her royal bodyguard. He clears the way, she knights each monster with Lamby, and they bow out of her path. No damage: every enemy warms up, the party turns Evasive for 2 turns, Rose shakes off Dizzy and other mind troubles, and she rides home on Tom\'s shoulders.'},
  {id:'amy2',partner:'amy',tier:2,cost:50,flag:'tombo:amy2',name:'Ymamot Creation',elem:['kinetic'],stat:'pow',mult:2.9,target:'all',weight:'standard',
    fx:[['row','back','t'],['ct',.5,'t'],['st','pepup',3,'party']],
    desc:'A flashback. Little Tom and little Amy at the kitchen counter: ketchup, pickles, cereal, mustard, a whole lemon and one sock, all in the bowl. A Ymamot Creation (Tom backwards). They sling it across every monster. A Kinetic hit on every enemy, they all go to the back row and lose time, and the party is faster for 3 turns.'},
  {id:'amy2_dc',dc:'amy2',partner:'amy',tier:2,cost:50,flag:'tombo:amy2',name:'Party Decorators',elem:['kinetic'],target:'party',weight:'standard',
    fx:[['refill','both'],['st','brace',1,'party']],
    desc:'The girls\' birthday is tomorrow. Tom hangs streamers from a wobbly stepladder, Amy strings the HAPPY BIRTHDAY banner and blows up one balloon far too much. Pop. Ladder. Cake arrives anyway. No damage: Tom and Amy refill their VP, and the party Guards (takes half damage) for 1 turn.'},
  {id:'deedee2',partner:'deedee',tier:2,cost:50,flag:'tombo:deedee2',name:'Pick the Rhubarb',elem:['sparkle'],stat:'warmth',mult:2.7,target:'all',weight:'standard',
    fx:[['cure','debuff','party'],['st','coolup',3,'party'],['st','shushed',2,'t'],['crust',2]],
    desc:'Deedee puts Tom to work in her garden. The rhubarb will not come out, so they both pull, and the root is the monster. A Sparkle hit on every enemy (Shushed for 2 turns), the party loses its debuffs and gets COOL +25% for 3 turns, and 2 Warm Crusts go on the tray.'},
  {id:'deedee2_dc',dc:'deedee2',partner:'deedee',tier:2,cost:50,flag:'tombo:deedee2',name:'Trip to Italy',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['st','tucked',3,'party'],['crust',2]],
    desc:'Deedee has a binder. Three rings, tabs. A map of Italy unrolls and the pins go in: Rome, Florence, the coast. Espresso, gelato, a Vespa. Everybody gets a brochure, the monsters too. No damage: every enemy warms up, the party is Tucked In for 3 turns, and 2 Warm Crusts go on the tray.'},
  {id:'boppy2',partner:'boppy',tier:2,cost:50,flag:'tombo:boppy2',name:'Nobody Gets Past Us',elem:['chatter'],stat:'warmth',mult:2.7,target:'all',weight:'standard',kindV:300,
    fx:[['interrupt','t'],['st','shield',3,'party']],
    desc:'Father and son stand shoulder to shoulder and a jail-cell door with bars slams down in front of the family. A Chatter hit on every enemy that stops their wind-ups, and the party takes 40% less damage for 3 turns.'},
  {id:'boppy2_dc',dc:'boppy2',partner:'boppy',tier:2,cost:50,flag:'tombo:boppy2',name:"Measure Twice",elem:['splash'],stat:'pow',mult:2.8,target:'enemy',weight:'standard',
    fx:[['steal','t']],
    desc:'Tom\'s sink drips. Boppy brings the wrench. One turn: a spray. Another: three sprays. A third: a geyser, water on the ceiling, and Tom in tears. The geyser blasts the monster. A big Splash hit on one enemy that breaks its shield and steals a buff.'},
  {id:'tnb2',partner:'tnb',tier:2,cost:50,flag:'tombo:tnb2',name:'Measure Twice',elem:['kinetic'],stat:'pow',mult:2.9,target:'all',weight:'standard',
    fx:[['ct',-1,'party'],['st','evade',2,'party'],['st','staggered',1,'t']],
    desc:'Tom drives the subway, TNB surfs the roof and hands everyone a transfer, and the train barrels through the monsters. A Kinetic hit on every enemy (Staggered), the whole party jumps to the front of the line, and everyone is Evasive for 2 turns.'},
  {id:'tnb2_dc',dc:'tnb2',partner:'tnb',tier:2,cost:50,flag:'tombo:tnb2',name:'Last Train Home',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['cure','debuff','party'],['ct',-.25,'both']],
    desc:'Tom and TNB sprint for the last train as the doors close. TNB jams his longboard in the doors, Tom dives through, and the doors shut on the monsters. No damage: every enemy warms up, the party loses its debuffs, and Tom and TNB get a quicker next turn.'},
  {id:'nara2',partner:'nara',tier:2,cost:50,flag:'tombo:nara2',name:'Tug of War',elem:['kinetic'],stat:'pow',mult:2.8,target:'enemy',weight:'standard',
    fx:[['steal','t'],['steal','t'],['steal','t'],['st','gritdown',3,'t']],
    desc:'Tom and Nara tug a rope toy. Tom pulls politely; Nara pulls with all forty pounds and Tom flies into the monster, still holding on. A big Kinetic hit that steals its buffs and lowers its GRIT for 3 turns.'},
  {id:'nara2_dc',dc:'nara2',partner:'nara',tier:2,cost:50,flag:'tombo:nara2',name:'Nara, No!',elem:['kinetic'],stat:'pow',mult:2.8,target:'all',weight:'standard',
    fx:[['interrupt','t']],
    desc:'Zoomies. Nara tears around the room and bowls through every monster while Tom stands in the middle saying "Nara, no." Then she sits at his feet, very proud. A Kinetic hit on every enemy that stops their wind-ups.'},
  // Tier 3 (Task T, tombo-review.md Primary column; numbers from the revamp plan section I3, tier-3 rows, mapped onto real ops
  // with the caps: revive 50%, party heal 60%). 75% HEART. Unlock beats are in chapters 17 and 19, which do not exist yet,
  // so tier 3 is Battle Lab only for now. pause = lose time (ctq), Tom's Upgrade Mile comes with every Tombo already.
  {id:'grace3',partner:'grace',tier:3,cost:75,flag:'tombo:grace3',name:'The Golden Dumpling Wish',elem:['sparkle'],stat:'warmth',mult:3.8,target:'all',weight:'standard',kindV:300,
    fx:[['revive',.5,'party'],['heal',.6,0,'party'],['cure','debuff','party'],['trend','lock',3]],
    desc:'Grace holds up the golden dumpling and it wakes like a grumpy genie. Tom wishes too loudly and gets squished flat, then tiny dumplings rain down and bonk every enemy. A huge Sparkle hit on all of them; fallen friends get back up at 50%, the party heals 60% and loses its debuffs, and Grace’s Trending locks at the top for 3 turns.'},
    {id:'grace3_dc',dc:'grace3',partner:'grace',tier:3,cost:75,flag:'tombo:grace3',name:'Shadow Squishy',elem:['sparkle'],stat:'warmth',mult:3.6,target:'enemy',weight:'standard',kindV:300,
    fx:[['closeup',2,'t']],
    desc:'Lights out, lamp on. Tom makes a shadow bunny on the wall. It is not good. Grace fixes it into a perfect shadow dumpling, the shadow grows across the whole wall, and the monster panics and hides from a squishy. A big Sparkle hit on one enemy (it warms right up), and it gets a Close-Up: the next damaging hit on it counts double.'},
{id:'rose3',partner:'rose',tier:3,cost:75,flag:'tombo:rose3',name:'Headphones in the Dark',elem:['chatter'],stat:'warmth',mult:4.0,target:'all',weight:'standard',kindV:300,
    fx:[['pause',1,'t'],['heal',.5,0,'party'],['mount']],
    desc:'In the dark, Rose wears Tom’s big headphones and follows his video game song to him. Giant 8-bit notes rain down and pin every enemy in place. A huge Chatter hit on all of them, they all lose time, the party heals 50%, and Rose rides on Tom’s shoulders.'},
    {id:'rose3_dc',dc:'rose3',partner:'rose',tier:3,cost:75,flag:'tombo:rose3',name:'Lamby Night-Light',elem:['chatter'],target:'all',weight:'standard',kindV:300,
    fx:[['ct',.4,'t'],['interrupt','t'],['cure','mental','party'],['mount']],
    desc:'Bedtime, and Rose is scared of the dark. Tom holds Lamby up like a night-light, and Lamby glows brighter and brighter until the dark runs away, and the monsters with it. No damage: every enemy warms up, loses its wind-up and its next turn comes later, the party’s mental debuffs (Dizzy, Shushed, Heckled and the like) clear, and Rose rides on Tom’s shoulders.'},
{id:'amy3',partner:'amy',tier:3,cost:75,flag:'tombo:amy3',name:'Knock It Off!',elem:['kinetic'],stat:'pow',mult:.75,hits:6,target:'enemy',weight:'standard',crit:1,
    fx:[['st','best',3,'party']],
    desc:'A flashback to the couch. Little Tom and little Amy fight over the good spot: pillow, slipper, cushion, the remote. Every swing misses the sibling and hits the monster, until Mom yells KNOCK IT OFF. Six sure critical Kinetic hits on one enemy, and the party gets Personal Best (POW and WARMTH +30%) for 3 turns.'},
    {id:'amy3_dc',dc:'amy3',partner:'amy',tier:3,cost:75,flag:'tombo:amy3',name:'Elevator Cheat',elem:['cozy'],target:'party',weight:'standard',
    fx:[['ct',-.55,'party'],['st','pepup',2,'party'],['cure','amber','party']],
    desc:'Same tower, inside. Amy takes the stairs at full speed; Tom presses the elevator button. The doors open on the roof and Amy is already there with her stopwatch, so mad she stomps a hole in the roof. No damage: the whole party jumps up the turn order, gets PEP +30% for 2 turns, and Amber melts off.'},
  {id:'deedee3',partner:'deedee',tier:3,cost:75,flag:'tombo:deedee3',name:'Tom Cooks for Mom',elem:['cozy'],stat:'warmth',mult:3.7,target:'all',weight:'standard',kindV:300,
    fx:[['heal',.6,0,'party'],['st','tucked',3,'party'],['crust',3],['tray',3]],
    desc:'For once Tom cooks for his mom. He waves his best sourdough under her nose; she takes a bite, says it needs salt, and cleans his kitchen so hard every enemy gets swept off the stage. A huge Cozy hit on all of them; the party heals 60% and is Tucked In for 3 turns, and the tray fills with 3 Hot Dishes.'},
    {id:'deedee3_dc',dc:'deedee3',partner:'deedee',tier:3,cost:75,flag:'tombo:deedee3',name:'Feast on Jefferson Park',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['revive',.35,'party'],['heal',.6,0,'party'],['cure','debuff','party'],['crust',3]],
    desc:'A block-party feast under the string lights on Jefferson Park. Tom passes the dishes; Deedee rearranges everyone\'s plates and wipes the table while they eat. No damage: every enemy warms up, fallen friends get back up at 35%, the party heals 60% and loses its debuffs, and 3 Warm Crusts go on the tray.'},
  {id:'boppy3',partner:'boppy',tier:3,cost:75,flag:'tombo:boppy3',name:'Garden Lesson',elem:['cozy'],stat:'pow',mult:4.1,target:'all',weight:'standard',
    fx:[['st','stunned',1,'t'],['cure','amber','party'],['burn',3,'boppy']],
    desc:'Boppy teaches Tom to plant tomatoes: stake, hole, seedling, water. Tom plants his upside down. Boppy fixes it, the vines shoot up, and giant tomatoes fly at every monster. He eats a pepper off his own vine. The biggest Cozy hit there is on every enemy; they see stars (lose a turn), Amber melts off the party, and Boppy\'s Heartburn fills.'},
    {id:'boppy3_dc',dc:'boppy3',partner:'boppy',tier:3,cost:75,flag:'tombo:boppy3',name:'Pepper Contest',elem:['cozy'],stat:'pow',mult:3.5,target:'row',weight:'standard',
    fx:[['st','gritdown',3,'t'],['steal','t'],['burn',1,'boppy']],
    desc:'Father and son eat hot peppers one after another, staring each other down. Tom sweats buckets; Boppy stays calm until his stomach rumbles, and they both breathe fire into the monsters. A big Cozy hit on a row that lowers their GRIT for 3 turns and steals a buff from each, and Boppy\'s Heartburn fills a little.'},
  {id:'tnb3',partner:'tnb',tier:3,cost:75,flag:'tombo:tnb3',name:'Cone Six Across the Miles',elem:['cozy'],stat:'hybrid',mult:4.2,target:'all',weight:'standard',
    fx:[['heal',.6,0,'party'],['rack','party'],['continuity',2,'party']],
    desc:'TNB holds the first cup he ever threw; Tom holds the matching one across the country. They clink, the map folds in half, and the distance shatters. A huge Cozy hit on every enemy; the party heals 60%, everyone gets a fresh costume, and each friend heals 25% after their next turn if hurt.'},
    {id:'tnb3_dc',dc:'tnb3',partner:'tnb',tier:3,cost:75,flag:'tombo:tnb3',name:'Golden Repair',elem:['sparkle'],stat:'warmth',mult:3.5,target:'enemy',weight:'standard',
    fx:[['st','brace',2,'party'],['cure','amber','party']],
    desc:'A cup breaks. Tom holds the pieces and TNB mends them with gold, the Japanese way (kintsugi). The gold seams light up and blast across the room. A big Sparkle hit on one enemy; the party Guards (takes half damage) for 2 turns, and Amber melts off.'},
  {id:'nara3',partner:'nara',tier:3,cost:75,flag:'tombo:nara3',name:'Cuddle',elem:['sparkle'],stat:'warmth',mult:4.2,target:'all',weight:'standard',kindV:300,
    fx:[['cure','debuff','party'],['st','fearless',2,'party']],
    desc:'The dark traps Tom, alone and fading. Nara finds him by scent and climbs into his lap, and the warmth of the cuddle cracks the dark into color. A huge Sparkle hit on every enemy; the party loses its debuffs and is Fearless (no new debuffs) for 2 turns.'},
    {id:'nara3_dc',dc:'nara3',partner:'nara',tier:3,cost:75,flag:'tombo:nara3',name:'Under the Table',elem:['sparkle'],stat:'hybrid',mult:4.0,target:'all',weight:'standard',
    fx:[['st','pinned',2,'t']],
    desc:'Family dinner. Tom sneaks Nara bits of his sourdough under the table; she pops up so excited the tablecloth flies off and lands over every monster like a net. A huge Sparkle hit on every enemy, and they are Hooked for 2 turns (no dodging).'},
  // Family Finishes (tombo-review.md "Family Finishes", revamp plan I3 "Family Finishes (4 Total)" with the caps: party heal
  // 60%, revive 50%, VP +3). 75% HEART. `who` replaces `partner`: the members who must all be in the fight and standing
  // ('all' = everyone in the party, 3 or more); any of them can start it. Tom's Upgrade Mile only when he takes part.
  // Listed after the Tombos. Unlock beats are in chapters 11 to 20, so Battle Lab only for now.
  {id:'ff1',who:['tom','tnb','grace','rose'],tier:'ff',cost:75,flag:'tombo:ff1',name:"Sleepover at Tom's",elem:['sparkle'],stat:'warmth',mult:4.3,target:'all',weight:'standard',kindV:300,
    fx:[['heal',.6,0,'party'],['mount'],['trend','lock',2],['rack','party']],
    desc:'The girls’ first sleepover at Tom and TNB’s. Rose builds a blanket fort, Grace starts a dance party, Tom hands out snacks and TNB tells a scary story. The fort grows into a castle and topples onto the monsters. A huge Sparkle hit on every enemy; the party heals 60% and gets fresh costumes, Rose rides on Tom’s shoulders, and Grace’s Trending locks for 2 turns.'},
  {id:'ff2',who:['amy','grace','rose'],tier:'ff',cost:75,flag:'tombo:ff2',name:'Run With Us, Mommy!',elem:['kinetic'],stat:'pow',mult:4.4,target:'all',weight:'standard',
    fx:[['cure','debuff','party'],['vp',3,'party'],['st','best',3,'party'],['ct',-.75,'party']],
    desc:'A grey wall of clocks, chains and ungraded papers forces Amy to one knee. Grace sticks a gold star on her and counts her in; Rose ties on her ribbon and hands her Lamby. The girls take Mom’s hands and the three of them sprint right through it. A huge Kinetic hit on every enemy; the party loses its debuffs, gets 3 VP and Personal Best for 3 turns, and moves up the line.'},
  {id:'ff3',who:['deedee','boppy','tom'],tier:'ff',cost:75,flag:'tombo:ff3',name:'Fifty-One Years & Counting',elem:['cozy'],stat:'warmth',mult:4.4,target:'all',weight:'standard',kindV:300,
    fx:[['revive',.5,'party'],['heal',.6,0,'party'],['st','tucked',3,'party'],['st','shield',3,'party']],
    desc:'Deedee and Boppy hold hands across fifty-one years while Tom frames their picture. A huge Cozy hit on every enemy; fallen friends get back up at 50%, the party heals 60%, and everyone is Tucked In and takes 40% less damage for 3 turns.'},
  {id:'ff4',who:'all',tier:'ff',cost:75,flag:'tombo:ff4',name:'The Extra Place',elem:['sparkle','cozy'],stat:'hybrid',mult:5.0,target:'all',weight:'standard',kindV:300,
    fx:[['revive',.5,'party'],['heal',.6,0,'party'],['cure','debuff','party'],['refill','party']],
    desc:'The whole family sets one extra place at the table, the monster sits down, and everyone raises a glass. The CLINK shakes the whole stage. The biggest Sparkle and Cozy hit there is on every enemy; fallen friends get back up at 50%, the party heals 60%, loses its debuffs, and refills its VP.'},
  // Family Finish Director's Cuts: no damage, level 30 for every member (b8DcOpen). Listed after the Primaries.
  {id:'ff1_dc',dc:'ff1',who:['tom','tnb','grace','rose'],tier:'ff',cost:75,flag:'tombo:ff1',name:'Pottery Lesson',elem:['sparkle'],target:'all',weight:'standard',kindV:300,
    fx:[['goof',1,'t'],['st','brace',1,'party']],
    desc:'TNB teaches the family pottery. Rose’s pot flies, Grace’s turns into a squishy, Tom’s collapses, and the kiln fires them into fireworks over the monsters. No damage: every enemy warms up and is Goofed for 1 turn, and the party braces for the next hit.'},
  {id:'ff2_dc',dc:'ff2',who:['amy','grace','rose'],tier:'ff',cost:75,flag:'tombo:ff2',name:'Breakfast in Bed',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['refill','party'],['cure','debuff','party'],['ct',-.25,'amy']],
    desc:'The girls make Mom breakfast in bed. Grace does the dairy-free pancakes, Rose does ALL the syrup, and the tower tips onto the monsters. No damage: every enemy warms up, the party refills its VP and loses its debuffs, and Amy moves up the line a little.'},
  {id:'ff3_dc',dc:'ff3',who:['deedee','boppy','tom'],tier:'ff',cost:75,flag:'tombo:ff3',name:'The Family Walk',elem:['cozy'],target:'party',weight:'standard',kindV:300,
    fx:[['heal',.35,0,'party'],['st','tucked',3,'party'],['cure','amber','party']],
    desc:'A slow evening walk, Tom in the middle, Deedee setting the pace and Boppy complaining about it. No damage: every enemy warms up, the party heals 35%, everyone is Tucked In for 3 turns, and Amber wears off.'},
  {id:'ff4_dc',dc:'ff4',who:'all',tier:'ff',cost:75,flag:'tombo:ff4',name:'The Eight-Seat Dinner Table',elem:['cozy'],target:'all',weight:'standard',kindV:300,
    fx:[['heal',.4,0,'party'],['cure','debuff','party'],['vp',3,'party']],
    desc:'The long table seats everyone, and each place sets off a little light that joins the rest into one big heart. No damage: every enemy warms up, the party heals 40%, loses its debuffs, and gets 3 VP.'}
];

// ---- Battle Lab: test fights reached from the title screen until the full game opens. ----
// Battle Lab: one fight per chapter boss, chapters 1 to 20 (chapter 20 has two). Paged in engine/splash.js. Chapter 18's boss cannot be beaten by design.
const B2_LAB=[
  {ch:1,name:'THE BIG ONE',sub:'Chapter 1. Tom, Grace, Rose and Deedee.',party:['tom','grace','rose','deedee'],level:4,foes:[['bigone','front']]},
  {ch:2,name:'THE BIG SHAKE',sub:'Chapter 2. Tom, TNB and Nara.',party:['tom','tnb','nara'],level:4,la:true,foes:[['bigshake','front']]},
  {ch:3,name:'OLD IRON-GILL',sub:'Chapter 3. Tom, Grace, Rose and Boppy.',party:['tom','grace','rose','boppy'],level:6,foes:[['irongill','front']]},
  {ch:4,name:'THE DIRECTOR’S CUT',sub:'Chapter 4. Tom, TNB and Nara.',party:['tom','tnb','nara'],level:7,la:true,studio:true,foes:[['directorscut','front']]},
  {ch:5,name:'THE RED PEN',sub:'Chapter 5. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:8,school:true,cafe:true,foes:[['redpen','front']]},
  {ch:6,name:'CHAIRMAN CHEEKS',sub:'Chapter 6. Tom, TNB and Nara.',party:['tom','tnb','nara'],level:9,la:true,oak:true,crown:true,foes:[['chairman','front']]},
  {ch:7,name:'THE UNREAD',sub:'Chapter 7. Tom, Grace and Rose.',party:['tom','grace','rose'],level:10,stacks:true,readroom:true,foes:[['unread','front']]},
  {ch:8,name:'OLD IRONBELLY',sub:'Chapter 8. Tom, TNB and Nara.',party:['tom','tnb','nara'],level:11,la:true,barn:true,boiler:true,foes:[['ironbelly','front']]},
  {ch:9,name:'THE MIRRORBALL',sub:'Chapter 9. Tom, Deedee and Boppy.',party:['tom','deedee','boppy'],level:12,club:true,dome:true,foes:[['mirrorball','front']]},
  {ch:10,name:'THE LAST CALL',sub:'Chapter 10. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:13,term:true,gate:true,foes:[['lastcall','front']]},
  {ch:11,name:'FINAL CALL',sub:'Chapter 11. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:14,term:true,gate:true,foes:[['finalcall','front']]},
  {ch:12,name:'GRIDLOCK PRIME',sub:'Chapter 12. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:15,la:true,foes:[['gridlockprime','front']]},
  {ch:13,name:'DRILL WORM',sub:'Chapter 13. Tom, Amy, TNB and Nara.',party:['tom','amy','tnb','nara'],level:17,la:true,foes:[['drillworm','front']]},
  {ch:14,name:'WARDEN BOPPY',sub:'Chapter 14. Tom, Amy, Grace and Rose.',party:['tom','amy','grace','rose'],level:19,foes:[['warden','front']]},
  {ch:15,name:'HUSH-9 FINAL FORM',sub:'Chapter 15. Tom, Amy, Grace and Rose.',party:['tom','amy','grace','rose'],level:20,foes:[['hush9final','front']]},
  {ch:16,name:'MARLOWE TRANSFORMED',sub:'Chapter 16. Tom, Amy, TNB and Nara.',party:['tom','amy','tnb','nara'],level:22,la:true,foes:[['marlowe16','front']]},
  {ch:17,name:'THE TWIN LENSES',sub:'Chapter 17. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:24,la:true,foes:[['twinlens','front']]},
  {ch:18,name:'JULIAN VANCE',sub:'Chapter 18. Survival fight, cannot be won. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:25,la:true,foes:[['vance','front']]},
  {ch:19,name:'THE OBLIVION CENSOR',sub:'Chapter 19. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:25,la:true,foes:[['censor','front']]},
  {ch:20,name:'THE CHRONOS-LEVIATHAN',sub:'Chapter 20. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:27,foes:[['leviathan','front']]},
  {ch:20,name:'JULIAN, LAST FIGHT',sub:'Chapter 20. Tom, Grace, Rose and Amy.',party:['tom','grace','rose','amy'],level:27,foes:[['julian','front']]}
];
const B2_LAB_BAG=['bandage','bandage','juice','lemonade','balloon','cushion','goldstar','whistle'];
