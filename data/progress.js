'use strict';
// data/progress.js — Progression numbers (F6; claude/battle-design.md sections 5 and 7).
// Levels 1 to 50 at a flat 100 XP each, the Stampcard path names, battle XP per monster, the trait descriptions for
// the menu, and everyone's starting Signature Tool. Stampcard slots and points: data/abilities.js.
// The logic lives in engine/progress.js. Loaded after data/battle2-data.js (paths point at B2_SKILLS keys).

const B6={xpPerLevel:100,maxLevel:50,
  // Stamp Points, Polish Points, Remix Tickets, node costs and gates: B8 in data/abilities.js (Option 3).
  bossXp:100,           // a boss fight is one full level for everyone
  tierXp:.05,tierXpMax:10};   // +5% XP per time that monster has been beaten (up to +50%)

// ---- Stampcard path names. The slots (A1 to A6, B1 to B6), both versions of each and the Auto-Stamp route are in
// data/abilities.js (B8_KITS). ----
const B6_PATHS={
  tom:[{name:'Home Baker',sub:'Sourdough, gadgets, first class'},{name:'Polyglot Gamer',sub:'Flashcards, kanji, boss fights'}],
  grace:[{name:'Influencer Cleric',sub:'Squishies, glitter, ring lights'},{name:'Acro-Star',sub:'Gymnastics and dance battles'}],
  rose:[{name:'Giggle Gremlin',sub:'Peekaboo, spins, dress-up'},{name:'Piggyback Kid',sub:'Lamby and Tom’s shoulders'}],
  amy:[{name:'Head Teacher',sub:'Red pens and pop quizzes'},{name:'Marathon Mom',sub:'Burpees, hills, the finish line'}],
  deedee:[{name:'Registered Baker',sub:'Check-ups, crisp, Sunday dinner'},{name:'Busy Bee',sub:'Power walks and wine o’clock'}],
  boppy:[{name:'Rikers Warden',sub:'Fishing, the recliner, headcounts'},{name:'Pepper Champion',sub:'Peppers and the 1970 story'}],
  tnb:[{name:'Set Costumer',sub:'Wardrobe, the Metro, horror'},{name:'Kiln & Longboard',sub:'Pottery and steep LA streets'}],
  nara:[{name:'Goodest Girl',sub:'Fetch, zoomies, tug of war'},{name:'Pack Heart',sub:'Puddles, shakes and howls'}]
};

// ---- Battle XP per monster at its base level (normal fights add up to about 20 to 35; bosses give B6.bossXp). ----
const B6_XP={mudling:12,skeeter:24,grump:26,toad:30,log:34,bigone:100,
  smoglet:13,tickets:26,coyote:28,gridlock:32,tarblob:35,bigshake:100,
  soggysock:15,bobber:27,tangle:30,snag:36,irongill:100,
  extra:10,boommoth:28,clapper:28,fogwisp:31,cuecrab:36,directorscut:100};

// ---- Each character's battle trait, for the Status page (the rules are in engine/battle2-traits.js). ----
const B6_TRAITS={
  tom:{name:'Diamond Medallion',text:'DEFEND on an ally or any Tombo earns an Upgrade Mile (max 3). At 3 Miles his next skill is free and he goes again right away.'},
  grace:{name:'Trending Meter',text:'Each move different from her last one trends higher (x1.0, x1.2, x1.5). Boosts her heals and critical hits. Repeating a move resets it.'},
  rose:{name:'Shoulder Ride',text:'Lamby Launch, Piggyback Pounce and Double-Decker Boop end with her up on Tom’s shoulders for 3 turns. Tom takes her hits, and her skills hit twice.'},
  amy:{name:'Pace Setter',text:'Every action she takes speeds up the whole party (+5% PEP each, up to +25%). A knockout resets it.'},
  deedee:{name:'Warm Crust Tokens',text:'Rhubarb Crisp and Sunday Dinner put Warm Crusts on the tray (max 3). Anyone can eat one as a free action to heal 20%. Even Nara.'},
  boppy:{name:'Heartburn',text:'Peppers and hits he takes while guarding add Heartburn. At 3 his next attack or GRUMBLE lets out the Warden’s Counter-Roar and stuns whoever hit him.'},
  tnb:{name:'Quick-Change Rack',text:'Quick Change and WARDROBE dress the target in the next costume on the rack: Action Hero, Cozy Cardigan, then Final Girl.'},
  nara:{name:'Frantic, Picky, Puddles',text:'POW +50% and PEP +30% while Tom is knocked out. Only eats Chicken Jerky and homemade food. Sometimes leaves a happy puddle after a win.'}
};

// ---- Starting Signature Tools (data/party.js has the items). Members start holding these. ----
const B6_STARTER={tom:'k_keyboard',grace:'g_dumpling',rose:'r_lambytoy',amy:'a_whistle',deedee:'d_pin',boppy:'b_rod',tnb:'n_rib',nara:'y_stick'};
