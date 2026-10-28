'use strict';
// data/maps-ch12.js — Chapter 12 "Welcome to Jefferson Park, Girls": small additions to the Los Angeles specs in data/maps-la.js.
// Loaded after data/maps-la.js and BEFORE engine/la.js, which merges LA_PALETTES into the palettes and builds every area and room.
//   Monochrome Marlowe: a grey suit, grey hair, grey everything. He is the only thing in Los Angeles that is not warm.
//   Gridlock Prime: sits in the Jefferson and 2nd Ave intersection (hidden and held still until chapter 12's boss scene, data/scenes-ch12.js).
LA_PALETTES.marlowe={skin:'#d8d4cc',hair:'#9a9aa2',shirt:'#6e6e76',pants:'#3a3a42',hat:null};
LA_AREAS.find(a=>a.id==='jpark').monsters=[['gridlockprime',14,10]];
