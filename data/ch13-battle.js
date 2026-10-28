'use strict';
// data/ch13-battle.js — Chapter 13 battle numbers: the Sub-Rail monsters and the Dual-Coast Drill Worm. Loaded after data/ch12-battle.js.
// The Drill Worm fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE): every third turn a telegraphed Cave-In on everyone. Below
// half HP two Hushlings (HUSH-9's drones) shush in and it braces behind a hush chip for FULL BORE (2 Chatter or Kinetic hits, or any
// Tombo, break the chip: noise is what HUSH-9 cannot stand). Un-Grump route: TAKE FIVE x3 (nobody ever told it to stop).
const B2_BREAK_LINES={
  tom:['You’ve been digging a long time. Take five. I’ll hold the flashlight.','Nobody is behind schedule. Sit down. Have some water. I’ll talk to the foreman.'],
  grace:['Time out! Everybody gets a water break! I’ll time it! Please like and subscribe to your break!','Five minutes! I’m the timekeeper! Nobody is allowed to dig until I say!'],
  rose:['You worked SO hard! You get a juice box! You can have MY juice box!','Take a nap! Naps are for drills too! I’ll sit on you so you stay!'],
  amy:['Union rules. Fifteen minutes. Sit. Hydrate. I will personally write you a note.','You have earned a break. I’ve seen kids work less on a science fair and cry more.'],
  tnb:['Hey. Hard hat off for a minute. I’ve got a thermos. I always have a thermos.','I fix things. I know what a tired machine sounds like. It’s okay to stop.'],
  nara:['Nara drops her tennis ball in front of the drill and sits. Break time. Obviously.'],
  _:['Take five. You’ve earned it.']};
Object.assign(B2_FOES,{
  drillworm:{level:18,hp:1480,pow:33,grit:21,warmth:22,cool:16,pep:14,weak:['chatter','kinetic'],resist:['splash'],step:4,boss:'drillworm',noRun:true,
    praise:{label:'TAKE FIVE',sub:'Free · it has not stopped since 1952',need:3,tag:'BREAK',
      react:['The Drill Worm’s bit slows to a crawl. \"...Five? Five what?\"','Its headlamps dim, very softly. \"Nobody ever told me I could stop.\"']},
    acts:[{name:'Grind',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} grinds against {t}.'},
          {name:'Gravel Spray',stat:'pow',mult:1,elem:'kinetic',target:'all',msg:'{e} kicks up a shower of gravel on everyone.'},
          {name:'Bore',stat:'pow',mult:1.05,elem:'kinetic',target:'one',status:['gritdown',2],msg:'{e} bores straight through {t}’s guard. {t} feels squashed.'}],
    flop:{name:'Cave-In',stat:'pow',mult:1,elem:'kinetic',target:'all',msg:'CAVE-IN! {e} brings the ceiling down on everyone!'},
    rumble:{name:'Full Bore',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'FULL BORE! {e} spins up the drill and goes through everyone!'},
    shield:{need:2,elems:['chatter','kinetic']},add:'hushling'},
  hushling:{level:15,hp:210,pow:19,grit:14,warmth:15,cool:15,pep:12,weak:['chatter','kinetic'],resist:[],step:2,
    acts:[{name:'Shush',stat:'warmth',mult:.9,elem:'chatter',target:'one',msg:'{e} shushes {t}.'},
          {name:'Drift',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} floats into {t} without a sound.'},
          {name:'Hush',stat:'warmth',mult:.8,elem:'chatter',target:'one',every:3,status:['drowsy',2],msg:'HUSH! {e} presses a finger to {t}’s lips. {t} is Drowsy.'}]},
  signalfault:{level:15,hp:225,pow:20,grit:16,warmth:14,cool:13,pep:11,weak:['splash','kinetic'],resist:[],step:2,
    acts:[{name:'Flash',stat:'warmth',mult:.9,elem:'sparkle',target:'one',msg:'{e} flashes red right in {t}’s face.'},
          {name:'Stop Arm',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} drops its stop arm on {t}.'},
          {name:'Red Light',stat:'pow',mult:.7,elem:'chatter',target:'one',every:3,delay:.5,status:['slow',2],msg:'RED LIGHT! {e} holds {t} right where they are. {t} is Slowed.'}]},
  turnstile:{level:16,hp:245,pow:21,grit:18,warmth:13,cool:12,pep:11,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Clip',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} clips {t} on the way through.'},
          {name:'Arm Swing',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} swings an arm at {t}.'},
          {name:'Tap Out',stat:'pow',mult:.9,elem:'kinetic',target:'one',every:3,status:['gritdown',2],msg:'TAP OUT! {e} rejects {t}’s card and sits on their pockets. {t} feels squashed.'}]}
});
Object.assign(B2_FORMATIONS,{
  hushling:()=>Math.random()<.5?[['hushling','front'],['hushling','front']]:[['hushling','front'],['signalfault','back']],
  signalfault:[['signalfault','front'],['hushling','back']],
  turnstile:[['turnstile','front'],['hushling','back']],
  drillworm:[['drillworm','front']]});
const B2_CH13_LIKES=['amy.pep','rose.silly','grace.dance','tom.starter','tnb.coffee_run'];
Object.assign(B2_GRUMP,{
  drillworm:{goal:560,grumpy:'It has drilled at the same wall since the dome came down. Nobody ever told it where to stop.',likes:['amy.pep','tnb.coffee_run','tom.starter','rose.silly','ff2']},
  hushling:{goal:175,grumpy:'It was built to say one word. Nobody asked if it wanted more.',likes:B2_CH13_LIKES},
  signalfault:{goal:180,grumpy:'It has been red for eleven years. A train never came.',likes:B2_CH13_LIKES},
  turnstile:{goal:190,grumpy:'Everybody taps, and nobody says hello.',likes:B2_CH13_LIKES}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{drillworm:120});
B2_SHAKE_STYLE.drillworm={word:'BORING',add:'hushling',
  open:e=>'The wall shudders. '+cap(e.def.the)+' noses out of the dirt, hard hat first, and goes right on drilling at the amber.',
  open2:'Every third turn it drops a Cave-In on everyone. It shows on the turn ribbon before it happens.',
  phase:N=>N+' revs. Gravel rains down off the ceiling.',
  adds:n=>n>1?'Two Hushlings shush out of the dark!':'A Hushling shushes out of the dark!',addSfx:'whoosh',
  idle:N=>N+' grinds in place. Loudly. Hopelessly.',
  brace:(N,e)=>N+' spins up its hush chip for FULL BORE next turn! Break the chip: '+e.shield.need+' Chatter or Kinetic hits, or a Tombo. Noise is what it cannot stand.',
  warn:'The roof starts to creak. CAVE-IN next turn hits everyone. Heal up after!'};
