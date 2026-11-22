'use strict';
// data/b3-tombo-skins.js — Battle 3 stage 16: the Tombos return as SKINS on the Full Family Ruckus (docs/BATTLE3.md "Tombo skins").
// A skin carries no numbers. When two family members fire a Full Family Ruckus and a skin is live for that pair, the screen shows the skin's
// name in place of "Full Family Ruckus" and plays the pair's recorded Tombo lines (data/lines.js, the same clips battle 2 plays). The result
// is still the rule's (both top Skills, engine/b3-ruckus.js). The two moves play their own videos or the default animation; a skin has no
// animation of its own (Tom, 2026-11-19: animation review is out of scope for the battle system).
//
//   id     the battle 2 Tombo id (data/battle2-data.js B2_TOMBOS), kept so the story flag name stays `tombo:<id>`
//   name   what the screen calls it
//   pairs  the two family ids that may fire it (Primaries: Tom and the partner; Family Finishes and Birthday Wish: the pairs who speak in them)
//   flag   the story flag that unlocks it (the Battle Lab has them all, cfg.lab)
//   rank   1 to 3 the Primary's tier; 4 a Family Finish or Birthday Wish. For one pair the live skin is the highest rank unlocked, the later row on a tie.
//   lines  [who, key] pairs: LINES[who][key] in data/lines.js. Only the lines of the two who fire it are played, partner first.
//   toast  the "New Tombo skin" toast (data/scenes.js) names it by `name` and `who`
const B3_SKINS=[
  {id:'grace1',name:'Squishy Delivery',pairs:[['tom','grace']],flag:'tombo:grace1',rank:1,lines:[['grace','tombo'],['tom','tombograce']]},
  {id:'grace2',name:'Uncle Spotter Toss',pairs:[['tom','grace']],flag:'tombo:grace2',rank:2,lines:[['grace','tombo2'],['tom','tombograce2']]},
  {id:'grace3',name:'The Golden Dumpling Wish',pairs:[['tom','grace']],flag:'tombo:grace3',rank:3,lines:[['grace','tombo3'],['tom','tombograce3']]},
  {id:'rose1',name:'Double-Decker Airplane',pairs:[['tom','rose']],flag:'tombo:rose1',rank:1,lines:[['rose','tombo'],['tom','tombodecker']]},
  {id:'rose2',name:'Seat 1A Stowaway',pairs:[['tom','rose']],flag:'tombo:rose2',rank:2,lines:[['rose','tombo2'],['tom','tomborose2']]},
  {id:'rose3',name:'Headphones in the Dark',pairs:[['tom','rose']],flag:'tombo:rose3',rank:3,lines:[['rose','tombo3'],['tom','tomborose3']]},
  {id:'deedee1',name:'Wine and Gossip',pairs:[['tom','deedee']],flag:'tombo:deedee1',rank:1,lines:[['deedee','tombo'],['tom','tombodeedee']]},
  {id:'deedee2',name:'Pick the Rhubarb',pairs:[['tom','deedee']],flag:'tombo:deedee2',rank:2,lines:[['deedee','tombo2'],['tom','tombodeedee2']]},
  {id:'deedee3',name:'Tom Cooks for Mom',pairs:[['tom','deedee']],flag:'tombo:deedee3',rank:3,lines:[['deedee','tombo3'],['tom','tombodeedee3']]},
  {id:'tnb1',name:'Popcorn Jump',pairs:[['tom','tnb']],flag:'tombo:tnb1',rank:1,lines:[['tnb','tombo'],['tom','tombotnb']]},
  {id:'tnb2',name:'Red Line Transfer',pairs:[['tom','tnb']],flag:'tombo:tnb2',rank:2,lines:[['tnb','tombo2'],['tom','tombotnb2']]},
  {id:'tnb3',name:'Cone Six Across the Miles',pairs:[['tom','tnb']],flag:'tombo:tnb3',rank:3,lines:[['tnb','tombo3'],['tom','tombotnb3']]},
  {id:'nara1',name:'Sit. Paw. Treat.',pairs:[['tom','nara']],flag:'tombo:nara1',rank:1,lines:[['nara','tombo'],['tom','tombofetch']]},
  {id:'nara2',name:'Tug of War',pairs:[['tom','nara']],flag:'tombo:nara2',rank:2,lines:[['nara','tombo2'],['tom','tombonara2']]},
  {id:'nara3',name:'Cuddle',pairs:[['tom','nara']],flag:'tombo:nara3',rank:3,lines:[['nara','tombo3'],['tom','tombonara3']]},
  {id:'boppy1',name:'You Hold the Net',pairs:[['tom','boppy']],flag:'tombo:boppy1',rank:1,lines:[['boppy','tombo'],['tom','tombopier']]},
  {id:'boppy2',name:'Nobody Gets Past Us',pairs:[['tom','boppy']],flag:'tombo:boppy2',rank:2,lines:[['boppy','tombo2'],['tom','tomboboppy2']]},
  {id:'boppy3',name:'Garden Lesson',pairs:[['tom','boppy']],flag:'tombo:boppy3',rank:3,lines:[['boppy','tombo3'],['tom','tomboboppy3']]},
  {id:'amy1',name:'I Called It!',pairs:[['tom','amy']],flag:'tombo:amy1',rank:1,lines:[['amy','tombo'],['tom','tomboamy']]},
  {id:'amy2',name:'Ymamot Creation',pairs:[['tom','amy']],flag:'tombo:amy2',rank:2,lines:[['amy','tombo2'],['tom','tomboamy2']]},
  {id:'amy3',name:'Knock It Off!',pairs:[['tom','amy']],flag:'tombo:amy3',rank:3,lines:[['amy','tombo3'],['tom','tomboamy3']]},
  {id:'ff1',name:"Sleepover at Tom's",pairs:[['rose', 'tnb']],flag:'tombo:ff1',rank:4,lines:[['rose', 'ff1'], ['tnb', 'ff1']]},
  {id:'ff2',name:'Run With Us, Mommy!',pairs:[['rose', 'amy']],flag:'tombo:ff2',rank:4,lines:[['rose', 'ff2'], ['amy', 'ff2']]},
  {id:'ff3',name:'Fifty-One Years & Counting',pairs:[['deedee', 'boppy']],flag:'tombo:ff3',rank:4,lines:[['deedee', 'ff3'], ['boppy', 'ff3']]},
  {id:'ff4',name:'The Extra Place',pairs:[['tom', 'grace']],flag:'tombo:ff4',rank:4,lines:[['tom', 'ff4'], ['grace', 'ff4']]},
  {id:'wish',name:'Birthday Wish',pairs:[['tom', 'rose'], ['tom', 'grace']],flag:'tombo:wish',rank:4,lines:[['rose', 'wish'], ['tom', 'wish'], ['grace', 'wish']]},
];

// ---------- Looking one up (the play layer: engine/b3-skins.js) ----------
const B3_SKIN_BY_ID={}; for(const s of B3_SKINS) B3_SKIN_BY_ID[s.id]=s;

