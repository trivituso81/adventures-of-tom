'use strict';
// data/p2-battle.js — Part 2 (chapter 11) battle numbers for the Terminal Infinity monsters. Loads after data/battle2-data.js.
// Monsters themselves (sprites, lines): data/p2-monsters.js.
const B2_P2_LIKES=['amy.pep','rose.silly','grace.squishy','tom.starter','deedee.hug'];
Object.assign(B2_FOES,{
  // FINAL CALL (chapter 11 boss): the Last Call's rules (engine/battle2.js b2CallTurn) with its own words. It calls one person each
  // turn (act before its next turn, or GATE CLOSED; Tom can DEFEND them). Below half HP two Lost Luggage roll in and it braces behind
  // a shield for CANCELLED on everyone (2 Kinetic or Sparkle hits, or any Tombo; Sleepover at Tom's is the hinted answer).
  // ▼ Bag, BENCH CALL (engine/benchcall.js) swaps the fourth member for someone on the bench. Un-Grump route: LET IT FLY x3.
  finalcall:{level:15,hp:1280,pow:29,grit:19,warmth:22,cool:18,pep:14,weak:['sparkle','chatter'],resist:['kinetic'],step:4,boss:'finalcall',noRun:true,
    praise:{label:'LET IT FLY',sub:'Free · it has never once got to fly',need:3,tag:'ON TIME',
      react:['FINAL CALL’s flaps stop. \"...You want me to come with you? On the flight?\"','Its flaps flutter, very softly. \"Nobody ever asked the board to board.\"']},
    acts:[{name:'Flap Slap',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} slaps {t} with a whole row of flaps.'},
          {name:'DELAYED',stat:'warmth',mult:.85,elem:'chatter',target:'one',delay:.7,msg:'{e} flips {t}’s flap to DELAYED. {t} gets pushed down the ribbon!'},
          {name:'Static',stat:'warmth',mult:.8,elem:'sparkle',target:'all',msg:'{e} crackles static over every speaker. Everybody winces.'}],
    gate:{name:'GATE CLOSED',stat:'pow',mult:1.3,elem:'kinetic',target:'one',msg:'GATE CLOSED!'},
    rumble:{name:'CANCELLED',stat:'pow',mult:1.45,elem:'sparkle',target:'all',msg:'CANCELLED! {e} flips every flap at once!'},
    shield:{need:2,elems:['kinetic','sparkle']},add:'lostluggage'},
  lostluggage:{level:12,hp:200,pow:19,grit:15,warmth:13,cool:13,pep:12,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Wheelie',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} rolls right over {t}’s foot.'},
          {name:'Handle Swing',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} swings its handle at {t}.'},
          {name:'Rummage',stat:'pow',mult:.9,elem:'kinetic',target:'one',every:3,status:['gritdown',2],msg:'RUMMAGE! {e} digs through {t}’s bag and sits on it. {t} feels squashed.'}]},
  redeye:{level:13,hp:215,pow:17,grit:13,warmth:20,cool:15,pep:11,weak:['sparkle','cozy'],resist:['chatter'],step:2,
    acts:[{name:'Contrail',stat:'warmth',mult:1,elem:'sparkle',target:'one',msg:'{e} drifts past {t} and leaves a cold white streak.'},
          {name:'Yawn',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['drowsy',2],msg:'{e} yawns right at {t}. {t} is Drowsy.'},
          {name:'Nap Time',stat:'warmth',mult:.7,elem:'chatter',target:'all',every:3,status:['drowsy',1],msg:'NAP TIME! {e} turns the cabin lights down for everybody!'}]},
  standbysprite:{level:13,hp:240,pow:19,grit:16,warmth:15,cool:14,pep:13,weak:['splash','kinetic'],resist:[],step:2,
    acts:[{name:'Clipboard',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} bonks {t} with the clipboard.'},
          {name:'Paddle Swat',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} swats {t} with the STANDBY paddle.'},
          {name:'Wait List',stat:'pow',mult:.7,elem:'chatter',target:'one',every:3,delay:.5,msg:'WAIT LIST! {e} moves {t} to the back of the line.'}]}
});
Object.assign(B2_FORMATIONS,{
  lostluggage:()=>Math.random()<.5?[['lostluggage','front'],['lostluggage','front']]:[['lostluggage','front'],['redeye','back']],
  redeye:[['redeye','front'],['lostluggage','back']],
  standbysprite:[['standbysprite','front']],
  finalcall:[['finalcall','front']]});
Object.assign(B2_GRUMP,{
  finalcall:{goal:520,grumpy:'It has called every gate in the layover and never once got to fly.',likes:['amy.pep','rose.silly','tom.starter','grace.dance','ff1']},
  lostluggage:{goal:170,grumpy:'Nobody has asked for it since 1989. Its tag just says ?.',likes:B2_P2_LIKES},
  redeye:{goal:175,grumpy:'It has flown the same night since 1989. Nobody ever let it land.',likes:B2_P2_LIKES},
  standbysprite:{goal:190,grumpy:'Number 17 on the list since 1998. Nobody has ever called its number.',likes:B2_P2_LIKES}});
