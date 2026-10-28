'use strict';
// data/p2-battle.js — Part 2 (chapter 11) battle numbers for the Terminal Infinity monsters. Loads after data/battle2-data.js.
// Monsters themselves (sprites, lines): data/p2-monsters.js.
const B2_P2_LIKES=['amy.pep','rose.silly','grace.squishy','tom.starter','deedee.hug'];
Object.assign(B2_FOES,{
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
  standbysprite:[['standbysprite','front']]});
Object.assign(B2_GRUMP,{
  lostluggage:{goal:170,grumpy:'Nobody has asked for it since 1989. Its tag just says ?.',likes:B2_P2_LIKES},
  redeye:{goal:175,grumpy:'It has flown the same night since 1989. Nobody ever let it land.',likes:B2_P2_LIKES},
  standbysprite:{goal:190,grumpy:'Number 17 on the list since 1998. Nobody has ever called its number.',likes:B2_P2_LIKES}});
