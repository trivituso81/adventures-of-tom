'use strict';
// data/ch17-battle.js — Chapter 17 battle numbers: the Glass Tower's Stillness guards and the Archivist's Twin Lenses. Loaded after data/ch16-battle.js.
// The Twin Lenses fight like the Big Shake (engine/battle2.js B2_SHAKE_STYLE), same as HUSH-9, the Drill Worm and Marlowe: every third turn a
// telegraphed LONG EXPOSURE on everyone; below half HP two Curators step out of the shelves and it braces behind a lens for TOTAL ARCHIVE
// (2 Kinetic or Sparkle hits, or any Tombo, break the lens). There is NO kind route: the Archivist is not unkind, it simply does not
// listen, and this is the chapter where the family smashes things. The fight is four out front (Tom, Amy, Grace, Rose) with TNB and Nara on the bench
// (▼ Bag swaps them in, the BENCH CALL from chapter 11).
Object.assign(B2_FOES,{
  twinlens:{level:25,hp:3200,pow:40,grit:25,warmth:29,cool:22,pep:16,weak:['kinetic','sparkle'],resist:['splash'],step:4,boss:'twinlens',noRun:true,
    acts:[{name:'Focus',stat:'pow',mult:1.05,elem:'sparkle',target:'one',msg:'{e} focuses a pinpoint of light on {t}.'},
          {name:'Snapshot',stat:'warmth',mult:.9,elem:'sparkle',target:'one',status:['drowsy',2],msg:'{e} takes a snapshot of {t}. {t} is Drowsy, and very still.'},
          {name:'Rack Focus',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} racks focus and {t} goes soft at the edges.'}],
    flop:{name:'Long Exposure',stat:'warmth',mult:.95,elem:'sparkle',target:'all',status:['slow',1],msg:'LONG EXPOSURE! {e} holds the shutter open and everyone is stuck in the frame!'},
    rumble:{name:'Total Archive',stat:'pow',mult:1.55,elem:'sparkle',target:'all',msg:'TOTAL ARCHIVE! {e} files everyone at once!'},
    shield:{need:2,elems:['kinetic','sparkle']},add:'curator'},
  pausesprite:{level:22,hp:270,pow:26,grit:16,warmth:17,cool:16,pep:13,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Tap',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} taps {t}.'},
          {name:'Float Into',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} floats into {t} and does not move.'},
          {name:'Pause',stat:'pow',mult:.7,elem:'chatter',target:'one',every:3,delay:.5,status:['slow',2],msg:'PAUSE! {e} holds {t} right where they are. {t} is Slowed.'}]},
  paperweight:{level:23,hp:330,pow:29,grit:21,warmth:15,cool:12,pep:11,weak:['kinetic','sparkle'],resist:['splash'],step:2,
    acts:[{name:'Roll',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} rolls into {t}.'},
          {name:'Snow',stat:'warmth',mult:.9,elem:'sparkle',target:'one',msg:'{e} shakes itself and snows on {t}.'},
          {name:'Hold Down',stat:'pow',mult:.9,elem:'kinetic',target:'one',every:3,status:['gritdown',2],msg:'HOLD DOWN! {e} sits on {t}. {t} feels squashed.'}]},
  curator:{level:23,hp:340,pow:28,grit:18,warmth:20,cool:15,pep:12,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Label',stat:'warmth',mult:.9,elem:'chatter',target:'one',msg:'{e} labels {t}.'},
          {name:'Straighten',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} straightens {t}’s collar and does not let go.'},
          {name:'Not For Sale',stat:'warmth',mult:.8,elem:'chatter',target:'one',every:3,status:['drowsy',2],msg:'NOT FOR SALE! {e} sticks a label on {t}. {t} is Drowsy.'}]}
});
Object.assign(B2_FORMATIONS,{
  twinlens:[['twinlens','front']],
  pausesprite:()=>Math.random()<.5?[['pausesprite','front'],['pausesprite','front']]:[['pausesprite','front'],['curator','back']],
  paperweight:[['paperweight','front'],['pausesprite','back']],
  curator:[['curator','front'],['pausesprite','back']]});
const B2_CH17_LIKES=['amy.pep','rose.silly','grace.dance','tom.starter','tnb.coffee_run'];
Object.assign(B2_GRUMP,{
  twinlens:{goal:999999,grumpy:'It is not grumpy. It is not anything. It files.',likes:[]},
  pausesprite:{goal:190,grumpy:'It was told that everything is nicer on pause. Nobody ever checked.',likes:B2_CH17_LIKES},
  paperweight:{goal:200,grumpy:'It has been holding the same page down since 1998. Nobody told it the wind stopped.',likes:B2_CH17_LIKES},
  curator:{goal:205,grumpy:'He was never once allowed to touch anything. He is very polite about it.',likes:B2_CH17_LIKES}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{twinlens:170});
B2_SHAKE_STYLE.twinlens={word:'FILING',add:'curator',
  open:e=>'The glass floor hums. '+cap(e.def.the)+' unfold from the ceiling, one lens cold and one lens amber, and a small red light comes on between them.',
  open2:'Every third turn it calls LONG EXPOSURE on everyone. It shows on the turn ribbon first. Tom, Amy, Grace and Rose are out front; TNB and Nara wait on the bench (▼ Bag).',
  phase:N=>N+' opens the shutter all the way. Every shelf in the vault goes quiet.',
  adds:n=>n>1?'Two Curators step out of the shelves!':'A Curator steps out of the shelves!',addSfx:'whoosh',
  idle:N=>N+' refocuses. Slowly. Patiently. Forever.',
  brace:(N,e)=>N+' swings the amber lens round for TOTAL ARCHIVE next turn! Break the lens: '+e.shield.need+' Kinetic or Sparkle hits, or a Tombo.',
  warn:'The shutter starts to open. LONG EXPOSURE next turn hits everyone. Heal up after!'};
