'use strict';
// data/ch13-monsters.js — Chapter 13 "The Subway Beneath the Sea of Clouds": the Transcontinental Sub-Rail, the tunnel Sal and Sol bored
// under the Layover. Friction Sprites of commuting, easiest to hardest: Hushling (HUSH-9's little quiet-speaker; shushes people Drowsy),
// Signal Fault (a railway signal stuck on red; slows people), Turnstile Grump (a gate that eats cards; squashes GRIT). The boss is the
// Dual-Coast Drill Worm: Sal and Sol's tunnel borer, whose two-tone bit is Los Angeles orange on one half and Long Island green on the
// other. HUSH-9 loaded it with a hush chip and it has been drilling at the amber dome ever since. Nobody told it to stop.
// Same shape as data/p2-monsters.js (p2Canvas draws the sprites). Battle numbers: data/ch13-battle.js. Loaded after data/ch12-monsters.js.
const HUSHLING_PAL={o:'#1d1a22',g:'#9aa0ac',G:'#c4c9d2',d:'#6a707e',w:'#f4f0e6',k:'#2a2d36',y:'#f2c75a',p:'#e8b0b0'};
const HUSHLING_SPRITE=(()=>{
  const c=p2Canvas(36,38);
  c.rect(5,10,26,22,'g'); for(const [x,y] of [[5,10],[30,10],[5,31],[30,31]]) c.set(x,y,'.');
  c.rect(6,11,24,3,'G'); c.rect(5,28,26,4,'d');
  c.rect(12,3,12,7,'d'); for(let i=0;i<4;i++) for(let j=0;j<2;j++) c.set(14+i*3,5+j*3,'k');   // the speaker grille
  c.rect(17,0,2,3,'k'); c.ell(18,0,2,2,'y');                                                    // antenna
  c.ell(13,19,3.6,3.6,'w'); c.ell(23,19,3.6,3.6,'w'); c.ell(13,20,1.6,1.8,'k'); c.ell(23,20,1.6,1.8,'k');
  c.rect(14,26,9,1,'k');                                                                        // a mouth, if you could see it
  c.rect(17,21,3,9,'w'); c.rect(17,21,3,1,'G'); c.rect(16,29,5,2,'p');                          // one finger, to the lips
  c.rect(9,32,6,3,'d'); c.rect(21,32,6,3,'d');
  c.outline('o'); return c.rows();
})();
const SIGNALFAULT_PAL={o:'#1d1a22',k:'#2a2d36',K:'#4a4f5c',s:'#9aa0ac',r:'#d9493e',R:'#ff7a6a',y:'#f2c75a',Y:'#ffe08a',g:'#2f5a35',G:'#7ac07a',w:'#f4f0e6',t:'#14131a'};
const SIGNALFAULT_SPRITE=(()=>{
  const c=p2Canvas(40,54);
  c.rect(17,28,6,22,'k'); c.rect(17,28,2,22,'K'); c.rect(11,49,18,4,'K'); c.rect(11,49,18,1,'s');
  c.rect(8,2,24,28,'k'); c.rect(8,2,24,2,'K'); c.rect(8,2,2,28,'K');
  c.rect(10,6,12,2,'t'); c.rect(18,6,12,2,'t');                                                  // visors
  c.ell(15,14,5.6,5.6,'t'); c.ell(15,14,4.6,4.6,'r'); c.ell(14,13,1.6,1.6,'R');                  // the red lamp (left eye)
  c.ell(26,14,5.6,5.6,'t'); c.ell(26,14,4.6,4.6,'y'); c.ell(25,13,1.6,1.6,'Y');                  // the amber lamp (right eye)
  c.rect(12,24,17,3,'t'); c.rect(13,25,15,1,'g');                                                // the green lamp, dim: its mouth
  c.rect(1,10,8,4,'r'); for(let i=0;i<3;i++) c.rect(2+i*3,10,1,4,'w');                          // a stripey stop arm, stuck down
  c.outline('o'); return c.rows();
})();
const TURNSTILE_PAL={o:'#1d1a22',k:'#2a2d36',K:'#4a4f5c',s:'#b8c0cc',S:'#e4eaf2',d:'#6a707e',w:'#f4f0e6',r:'#d9493e',g:'#7ac07a',t:'#14131a',y:'#f2c75a'};
const TURNSTILE_SPRITE=(()=>{
  const c=p2Canvas(42,46);
  c.rect(11,16,20,28,'d'); c.rect(11,16,3,28,'s'); c.rect(8,41,26,5,'K'); c.rect(8,41,26,1,'s');
  c.rect(9,4,24,14,'k'); c.rect(9,4,24,2,'K'); c.rect(11,7,20,9,'t');                           // the LED screen: its face
  c.rect(14,9,4,4,'w'); c.rect(24,9,4,4,'w'); c.rect(15,11,2,2,'k'); c.rect(25,11,2,2,'k');
  c.rect(16,14,10,1,'r');                                                                         // a flat red mouth
  c.rect(15,19,12,2,'t'); c.rect(15,19,12,1,'K');                                                 // the card slot
  c.rect(19,26,4,4,'S');                                                                          // the hub
  for(const [x0,y0,x1,y1] of [[21,28,3,28],[21,28,39,28],[21,28,8,40],[21,28,34,40]]) { c.line(x0,y0,x1,y1,'s'); c.line(x0,y0+1,x1,y1+1,'S'); }
  c.rect(26,19,5,3,'y');                                                                          // an unpaid fare light
  c.outline('o'); return c.rows();
})();
const DRILLWORM_PAL={o:'#1d1a22',s:'#9aa3b2',S:'#cfd6e2',d:'#5f6878',k:'#2a2d36',O:'#f09a5a',P:'#ffd9a8',G:'#7ac08a',H:'#bfe8c8',y:'#f2c75a',Y:'#b8892a',w:'#f4f0e6',b:'#6a5a48',B:'#3f352a',r:'#d9493e'};
const DRILLWORM_SPRITE=(()=>{
  const c=p2Canvas(64,60);
  c.ell(32,55,29,5,'b'); c.ell(32,56,24,3,'B');                                                   // a pile of what it dug
  c.ell(32,48,26,9,'d'); for(let i=0;i<5;i++) c.rect(10+i*9,40,2,16,'k');                          // the body behind: ribbed
  c.ell(32,30,24,23,'d'); c.ell(32,30,22,21,'s'); c.ell(25,20,11,7,'S');                          // the head: a steel drum
  c.rect(7,27,3,6,'d'); c.rect(54,27,3,6,'d'); for(const x of [9,53]) for(const y of [22,36]) c.set(x,y,'S');   // bolts
  c.ell(32,10,14,8,'y'); c.rect(17,13,30,3,'Y'); c.ell(32,9,3,2,'w'); c.rect(31,3,3,3,'r');          // a hard hat with a lamp
  for(const x of [20,44]) { c.ell(x,25,7.4,7.4,'k'); c.ell(x,25,6,6,'w'); c.ell(x,26,2.6,2.8,'o'); c.set(x-2,24,'w'); }   // two headlamps for eyes
  const cx=32,cy=42;
  for(let y=cy-12;y<=cy+12;y++) for(let x=cx-12;x<=cx+12;x++) { const dx=x-cx,dy=y-cy,r=Math.sqrt(dx*dx+dy*dy);
    if(r>11.5) continue; const left=dx<0;
    c.set(x,y,r>8.6?(left?'O':'G'):r>5.4?(left?'P':'H'):r>2.6?(left?'O':'G'):'k'); }          // the bit: LA orange, Long Island green
  c.line(21,40,32,31,'k'); c.line(43,40,32,31,'k'); c.line(32,31,32,38,'k');                       // a seam
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  drillworm:{id:'drillworm',coins:120,coinStep:12,name:'Dual-Coast Drill Worm',the:'the Dual-Coast Drill Worm',short:'Drill Worm',sprite:DRILLWORM_SPRITE,pal:DRILLWORM_PAL,scale:4,eyes:[[20,26],[44,26]],mouth:[32,42],
    hp:170,hpStep:12,atk:4,xp:90,xpStep:8,level:18,rank:'BOSS',
    intro:'The rock wall shudders. A steel drum the size of a cab noses out of the dirt, hard hat first. Its bit is orange on one side and green on the other, and it has been spinning in place for years.',
    attacks:['The Drill Worm grinds against {t}.','The Drill Worm bores a little hole in {t}’s plans.','The Drill Worm throws a shower of gravel at {t}.'],
    special:{name:'Cave-In',every:3,kind:'all',msg:'CAVE-IN! The Drill Worm brings the ceiling down on everyone!'},
    wobble:'The Drill Worm’s bit wobbles...',die:'The bit spins down. The headlamps dim. It sits in the dirt like a dog that finally got told it could stop.',
    rest:['...is it five already? It’s not five. It has never been five.','I just keep going. Nobody ever said where.'],
    talk:['I have been digging since 1952. Nobody told me when to stop.','They called me a worm. I was a union drill.'],
    again:['BRRRRR. Back on the clock. Round two.','Round {n}. Still digging.'],
    vapor:['#f09a5a','#7ac08a','#9aa3b2','#f2c75a'],
    hint:'The boss under the dome. Every third turn it drops a Cave-In on everyone (it shows on the turn ribbon first). Below half HP it calls Hushlings and braces behind a hush chip. Chatter and Kinetic break the chip. Kindest answer: TAKE FIVE.'},
  hushling:{id:'hushling',coins:22,coinStep:3,name:'Hushling',the:'the Hushling',short:'Hushling',sprite:HUSHLING_SPRITE,pal:HUSHLING_PAL,scale:3,eyes:[[13,19],[23,19]],mouth:[18,27],
    hp:36,hpStep:5,atk:3,xp:24,xpStep:3,level:15,rank:'TRICKY',
    intro:'A little grey speaker floats out of the dark with one finger pressed to where its mouth would be. It is very, very polite about it.',
    attacks:['The Hushling shushes {t}.','The Hushling floats into {t} without a sound.','The Hushling holds a finger up to {t}. For a long time.'],
    special:{name:'Hush',every:3,kind:'one',msg:'HUSH! The Hushling presses a finger to somebody’s lips!'},
    wobble:'The Hushling’s antenna droops...',die:'It lowers its finger. Then, very quietly, it says thank you. It is the loudest thing it has ever done.',
    rest:['...shh. Shh. I was told to say shh.','Is it all right if I whisper? I was never allowed to whisper.'],
    talk:['I only know one word. It is shh.','Somebody built me quiet. Nobody asked if I wanted to be.'],
    again:['Shh. Round two.','Round {n}. Still shushing.'],
    drop:{id:'pretzels',chance:.5,msg:'The Hushling lowered its finger and a bag of pretzels fell out of its speaker. It looked relieved.'},
    vapor:['#9aa0ac','#c4c9d2','#f2c75a','#f4f0e6'],
    hint:'HUSH-9’s little drone. It shushes one person Drowsy (PEP down) every third turn. Chatter and Kinetic work; Rose’s RASPBERRY and Grace’s DANCE send it home happy.'},
  signalfault:{id:'signalfault',coins:24,coinStep:4,name:'Signal Fault',the:'the Signal Fault',short:'Signal Fault',sprite:SIGNALFAULT_SPRITE,pal:SIGNALFAULT_PAL,scale:3,eyes:[[15,14],[26,14]],mouth:[20,25],
    hp:38,hpStep:5,atk:3,xp:24,xpStep:4,level:15,rank:'TOUGH',
    intro:'A railway signal leans out of the tunnel wall on a bent pole. Its red lamp is on. Its green lamp has been out since the cave-in.',
    attacks:['The Signal Fault flashes red at {t}.','The Signal Fault drops its stop arm on {t}.','The Signal Fault blinks at {t}. Twice. Rudely.'],
    special:{name:'Red Light',every:3,kind:'one',msg:'RED LIGHT! The Signal Fault holds somebody right where they are!'},
    wobble:'The Signal Fault flickers...',die:'The red lamp goes out. For one second, the green one comes on. The Signal Fault looks absolutely amazed.',
    rest:['...is that green? Was that green?','Nobody ever asks the signal how it feels.'],
    talk:['I have been red for eleven years. A train never came.','I was only ever allowed to say stop.'],
    again:['STOP. Round two.','Round {n}. Still red.'],
    drop:{id:'coldbrew',chance:.4,msg:'The Signal Fault dropped a cold brew from its junction box. Somebody had been hiding it.'},
    vapor:['#d9493e','#f2c75a','#2f5a35','#4a4f5c'],
    hint:'A stuck signal. Every third turn it holds one person in place and pushes them down the turn ribbon. Splash and Kinetic work; it loves Amy’s PEP TALK and TNB’s COFFEE RUN.'},
  turnstile:{id:'turnstile',coins:26,coinStep:4,name:'Turnstile Grump',the:'the Turnstile Grump',short:'Turnstile Grump',sprite:TURNSTILE_SPRITE,pal:TURNSTILE_PAL,scale:3,eyes:[[16,11],[26,11]],mouth:[21,15],
    hp:42,hpStep:5,atk:3,xp:26,xpStep:4,level:16,rank:'TOUGH',
    intro:'A turnstile stands across the platform with its arms folded, which is not a thing a turnstile should be able to do. Its screen says INSUFFICIENT FUNDS.',
    attacks:['The Turnstile Grump clips {t} on the way through.','The Turnstile Grump swings its arm at {t}.','The Turnstile Grump tells {t} to please see an agent.'],
    special:{name:'Tap Out',every:3,kind:'one',msg:'TAP OUT! The Turnstile Grump rejects somebody’s card and sits on their pockets!'},
    wobble:'The Turnstile Grump’s arms clank...',die:'The arms go loose. The screen flickers and, for the first time in years, says PLEASE PROCEED.',
    rest:['...please proceed. Please. Somebody proceed.','Nobody has ever just walked through me. They always hop over.'],
    talk:['Everybody taps and nobody says hello.','I only open when the card works. The card never works.'],
    again:['BZZT. Please see an agent. Round two.','Round {n}. Still insufficient.'],
    drop:{id:'prioritytag',chance:.4,msg:'The Turnstile Grump spat out a PRIORITY tag. Then tried to charge for it.'},
    vapor:['#b8c0cc','#d9493e','#f2c75a','#4a4f5c'],
    hint:'A turnstile that eats cards. Every third turn it squashes one person’s GRIT. Kinetic and Chatter work; it loves TNB’s COFFEE RUN and Amy’s PEP TALK.'}
});
// Map spots. The tunnel: a Hushling, a Signal Fault and a Turnstile Grump drift along each stretch. The boss waits in the chamber under the
// dome (hidden until chapter 13's chamber scene, data/scenes-ch13.js).
const CH13_TUNNEL_SPOTS=[['hushling',7,7],['signalfault',12,3],['turnstile',18,5],['hushling',27,10],['signalfault',31,3],['turnstile',24,6]];
const CH13_CHAMBER_SPOTS=[['drillworm',12,6]];
