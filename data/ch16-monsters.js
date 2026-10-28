'use strict';
// data/ch16-monsters.js — Chapter 16 "The Amber Eclipse": the boss is Marlowe Transformed. Monochrome Marlowe, Vance's fixer, took the colour out of
// places because quiet is safe. After the beam, Vance "helps with his notes": the amber that is left over goes into Marlowe, and the man who
// only ever wanted things to be LESS becomes an eclipse: a grey suit in front of a black disc with an amber ring, a clipboard that now says
// NONE, and one fist full of amber glass. His add is the Grey Note, a sticky note that says LESS. Battle numbers: data/ch16-battle.js.
// Loaded after data/ch15-monsters.js.
Object.assign(P2_GLYPH,{L:['100','100','100','100','111'],E:['111','100','111','100','111'],N:['101','111','111','111','101'],O:['111','101','101','101','111']});
const MARLOWE_E_PAL={o:'#1d1a22',k:'#3a3a42',g:'#6e6e76',G:'#8d8d96',s:'#d8d4cc',S:'#b8b4ac',h:'#9a9aa2',w:'#f4f0e6',t:'#0e0c12',a:'#f2a33a',A:'#ffd36a',d:'#b8641e',b:'#2a2830',m:'#6a5a48'};
const MARLOWE_E_SPRITE=(()=>{
  const c=p2Canvas(64,66),cx=32,cy=19;
  c.ell(32,63,24,3,'b');                                                                              // a shadow on the grass
  c.rect(21,50,9,12,'k'); c.rect(34,50,9,12,'k'); c.rect(19,60,12,4,'t'); c.rect(33,60,12,4,'t');     // legs and shoes
  for(let i=0;i<16;i++) { const a=i*Math.PI/8; c.line(cx+Math.cos(a)*18,cy+Math.sin(a)*18,cx+Math.cos(a)*26,cy+Math.sin(a)*26,i%2?'a':'A'); }   // the corona rays
  c.ell(cx,cy,19,19,'A'); c.ell(cx,cy,16.5,16.5,'a'); c.ell(cx,cy,14,14,'t');                         // the eclipse: ring, glow, black disc
  c.poly([[15,34],[24,28],[40,28],[49,34],[47,54],[17,54]],'g'); c.rect(17,44,30,10,'k'); c.rect(17,44,30,1,'G');   // the suit
  c.poly([[27,29],[32,41],[37,29]],'w'); c.rect(31,33,2,13,'a'); c.rect(30,31,4,3,'d');               // shirt and a tie that has turned amber
  c.line(22,36,22,53,'a'); c.line(42,36,42,53,'a'); c.line(25,39,30,47,'A'); c.line(39,40,35,48,'A');    // amber leaking out of the seams
  c.ell(cx,22,8,9.5,'s'); c.ell(cx,23,6,7,'S'); c.ell(cx,14,8.5,4.5,'h');                              // his face and grey hair
  c.rect(27,20,3,2,'A'); c.rect(35,20,3,2,'A'); c.set(28,20,'w'); c.set(36,20,'w');                    // eyes full of amber
  c.line(26,18,30,19,'k'); c.line(38,18,34,19,'k'); c.line(29,27,35,27,'k');                           // flat brows, flat mouth
  c.rect(10,33,8,17,'g'); c.rect(10,33,8,1,'G');                                                       // the clipboard arm
  c.rect(2,38,17,19,'m'); c.rect(4,40,13,15,'w'); c.rect(7,38,7,3,'S');                                // a clipboard, and its page
  for(const y of [43,46,49]) c.rect(6,y,9,1,'S');                                                      // lines of notes
  c.line(5,41,16,54,'a'); c.line(6,41,17,54,'a');                                                      // all of it struck out
  c.rect(47,31,7,9,'g'); c.rect(50,19,6,14,'g'); c.rect(50,19,6,1,'G');                                // the raised arm
  c.poly([[49,7],[56,1],[62,9],[58,17],[52,14]],'d'); c.poly([[51,8],[56,4],[59,9],[56,14],[53,12]],'A'); c.ell(53,16,5,5,'s');   // a fist of amber glass
  c.outline('o'); return c.rows();
})();
const GREYNOTE_PAL={o:'#1d1a22',G:'#aeb2bc',g:'#8d919c',h:'#d4d8e0',k:'#3a3a42',w:'#f4f0e6',a:'#f2a33a',b:'#2a2830',S:'#c4c8d0'};
const GREYNOTE_SPRITE=(()=>{
  const c=p2Canvas(32,34);
  c.ell(16,31,11,2.4,'b');
  c.rect(4,4,24,24,'G'); c.rect(4,4,24,3,'h'); c.rect(4,25,24,3,'g'); c.poly([[21,28],[28,21],[28,28]],'S');   // a grey sticky note with a curled corner
  c.ell(12,13,3.2,3.2,'w'); c.ell(21,13,3.2,3.2,'w'); c.ell(12,14,1.4,1.6,'o'); c.ell(21,14,1.4,1.6,'o');     // two worried eyes
  c.line(9,10,14,11,'k'); c.line(24,10,19,11,'k'); c.line(13,20,20,20,'k');                                   // flat mouth
  c.glyph('L',6,22,'k'); c.glyph('E',10,22,'k'); c.glyph('S',14,22,'k'); c.glyph('S',18,22,'k');              // it says LESS
  c.set(26,6,'a'); c.set(5,26,'a');
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  marlowe16:{id:'marlowe16',coins:240,coinStep:16,name:'Marlowe',the:'Marlowe',short:'Marlowe',sprite:MARLOWE_E_SPRITE,pal:MARLOWE_E_PAL,scale:4,eyes:[[28,21],[36,21]],mouth:[32,27],
    hp:300,hpStep:16,atk:5,xp:160,xpStep:10,level:23,rank:'BOSS',
    intro:'Marlowe stands up very straight. The amber pours into his suit until there is none left to pour, and a black disc with a ring of fire opens behind his head. The page on his clipboard changes. It says NOTES: NONE.',
    attacks:['Marlowe draws a neat line through {t}.','Marlowe takes the color out of {t}’s next five minutes.','Marlowe writes something small and final about {t}.'],
    special:{name:'Overexposure',every:3,kind:'all',msg:'OVEREXPOSURE! Marlowe pulls the color out of everyone at once!'},
    wobble:'The amber ring flickers...',die:'The amber lets go of him all at once. Marlowe is just a man in a grey suit, sitting very still on the grass with an empty clipboard. Nobody plays a song. It is only wind.',
    rest:['...less. I only ever wanted it less. I did not want it gone.','Is it quiet enough now. Somebody tell me it is quiet enough.'],
    talk:['Less noise. Less color. Less. Mr. Vance said less was safe.','Notes. I have so many notes. None of them are good.'],
    again:['Less. Round two.','Round {n}. Still less.'],
    vapor:['#f2a33a','#ffd36a','#6e6e76','#0e0c12'],
    hint:'Vance’s fixer, with all the amber that was left over. Every third turn he calls Overexposure on everyone (it shows on the turn ribbon first). Below half HP he calls Grey Notes and braces behind the eclipse for TOTAL ECLIPSE. Chatter, Splash and Kinetic hits break the eclipse, and so does any Tombo. There is no kind route. He is not listening.'},
  greynote:{id:'greynote',coins:26,coinStep:3,name:'Grey Note',the:'the Grey Note',short:'Grey Note',sprite:GREYNOTE_SPRITE,pal:GREYNOTE_PAL,scale:3,eyes:[[12,13],[21,13]],mouth:[16,20],
    hp:40,hpStep:5,atk:3,xp:26,xpStep:3,level:21,rank:'TRICKY',
    intro:'A grey sticky note peels itself off the air and floats over, the corner curled. It says LESS. It looks sorry about it.',
    attacks:['The Grey Note sticks itself to {t}’s back.','The Grey Note flutters into {t}.','The Grey Note crosses something out on {t}.'],
    special:{name:'Fade',every:3,kind:'one',msg:'FADE! The Grey Note drains the color out of somebody!'},
    wobble:'The Grey Note’s corner curls...',die:'The note goes soft and slides to the grass. It says MORE, for a second, in somebody’s handwriting. Then it is just paper.',
    rest:['...less? Is it still less?','I was only a reminder.'],
    talk:['I am a reminder. I do not make the rules.','Somebody wrote LESS on me and then left.'],
    again:['Less. Again.','Round {n}. Still sticky.'],
    drop:{id:'pretzels',chance:.5,msg:'The Grey Note fluttered down and a bag of pretzels fell out of its fold. It did not look at them.'},
    vapor:['#aeb2bc','#d4d8e0','#f2a33a','#f4f0e6'],
    hint:'Marlowe’s little reminder. It fades one person (PEP down) every third turn. Chatter, Splash and Kinetic all work.'}
});
