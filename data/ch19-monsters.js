'use strict';
// data/ch19-monsters.js — Chapter 19 "The Unsent Dead-Letter Office": the sorting hall where everything nobody could deliver ends up. Two small things work the
// belts (Dead Letter: an envelope that has been returned to sender so many times it forgot who it was for; Rubber Stamp: a stamp that only knows one word)
// and the boss is the Oblivion Censor, the Office's night clerk: a tall man in an eyeshade whose face is a redaction bar. His marker blacks out names, and he
// is trying to black out Tom's. Same shape as data/ch17-monsters.js (p2Canvas draws the sprites). Battle numbers: data/ch19-battle.js. Loaded after data/ch18-monsters.js.
const CENSOR_PAL={o:'#08060c',k:'#1c1a24',K:'#34324a',w:'#f4f0e6',W:'#d0ccc0',t:'#050408',T:'#14121c',g:'#4a7a5a',G:'#7ab08a',r:'#d9503f',R:'#8a2a22',p:'#e8dcb4',P:'#c4b48a',y:'#c8a040',Y:'#f2d27a',s:'#e0c4a8'};
const CENSOR_SPRITE=(()=>{
  const c=p2Canvas(64,88);
  c.ell(32,85,24,3,'t');                                                                                         // a shadow on the slate
  c.rect(17,26,30,48,'k'); c.rect(17,26,30,3,'K'); c.rect(17,26,3,48,'T'); c.rect(44,26,3,48,'T');                // the long black suit jacket
  c.rect(26,26,12,40,'w'); c.rect(27,27,10,38,'W');                                                              // the shirt front, which is a paper form
  for(const [y,w] of [[29,8],[33,6],[37,8],[41,5],[45,8],[49,7],[53,6],[57,8],[61,5]]) c.rect(28,y,w,2,'t');    // redacted lines of text down the shirt
  c.rect(31,26,2,22,'r');                                                                                        // a red tie
  c.rect(18,72,12,10,'k'); c.rect(34,72,12,10,'k'); c.rect(16,80,16,5,'t'); c.rect(32,80,16,5,'t');            // trousers and shoes
  c.rect(14,24,36,4,'K');                                                                                        // the shoulders
  c.rect(23,6,18,20,'t'); c.rect(24,7,16,18,'T');                                                                // the head: one tall black redaction bar
  c.ell(28,14,2.2,2.6,'w'); c.ell(36,14,2.2,2.6,'w'); c.set(28,14,'t'); c.set(36,14,'t');                       // two small white eyes in the black
  c.rect(26,20,12,1,'K');                                                                                        // a thin line where a mouth would be
  c.rect(19,4,26,5,'g'); c.rect(19,4,26,1,'G'); c.rect(17,8,30,2,'g'); c.rect(17,9,30,1,'o');                    // the green eyeshade
  c.rect(8,28,8,4,'k'); c.rect(3,30,8,16,'k'); c.rect(2,32,3,3,'y');                                            // left arm, with a brass sleeve garter
  c.rect(2,44,9,6,'s');                                                                                          // a hand
  c.rect(4,10,3,40,'t'); c.rect(4,10,3,2,'K'); c.rect(4,48,3,4,'y');                                            // the marker: tall, black, brass at the nib
  c.rect(48,28,8,4,'k'); c.rect(53,30,8,16,'k'); c.rect(58,32,3,3,'y');                                         // right arm
  c.rect(52,44,9,6,'s');                                                                                         // a hand
  c.rect(54,38,6,8,'T'); c.rect(52,46,12,6,'p'); c.rect(52,46,12,1,'P');                                        // the stamp: a wooden handle and a block
  c.ell(58,56,8,3,'R'); c.ell(58,55,7,2.4,'r'); c.rect(54,54,8,1,'p');                                          // the red inked face of the stamp
  c.outline('o'); return c.rows();
})();
const DEADLETTER_PAL={o:'#2a2418',p:'#e8dcb4',P:'#c4b48a',d:'#8a7a50',r:'#d9503f',R:'#8a2a22',w:'#f4f0e6',k:'#161216',y:'#f2c75a',b:'#6a8ab0',e:'#e8a0a0'};
const DEADLETTER_SPRITE=(()=>{
  const c=p2Canvas(44,38);
  c.ell(22,35,17,2.6,'d');                                                                                       // shadow
  c.rect(4,8,36,26,'p'); c.rect(4,8,36,2,'w'); c.rect(4,32,36,2,'P');                                           // the envelope
  c.poly([[4,8],[22,22],[40,8]],'P'); c.poly([[6,9],[22,20],[38,9]],'p');                                        // the flap, closed, forever
  c.line(4,34,16,22,'P'); c.line(40,34,28,22,'P');                                                               // the back folds
  c.ell(15,24,2.6,3,'w'); c.ell(29,24,2.6,3,'w'); c.ell(15,25,1.3,1.8,'k'); c.ell(29,25,1.3,1.8,'k');           // eyes
  c.rect(19,30,6,1,'k'); c.set(18,29,'k'); c.set(25,29,'k');                                                    // a flat, tired mouth
  c.ell(33,13,6,6,'R'); c.ell(33,13,5,5,'r'); c.rect(29,12,8,1,'p'); c.rect(29,14,8,1,'p');                   // the red stamp: RETURN
  c.rect(8,13,10,1,'d'); c.rect(8,16,8,1,'d');                                                                   // an old address, smudged
  c.ell(9,28,2.6,2,'e'); c.ell(35,28,2.6,2,'e');                                                                 // cheeks
  c.outline('o'); return c.rows();
})();
const RUBBERSTAMP_PAL={o:'#2a1a10',h:'#8a5a32',H:'#b88a52',b:'#6a4228',r:'#d9503f',R:'#8a2a22',w:'#f4f0e6',k:'#161216',y:'#f2c75a',s:'#2a2a34'};
const RUBBERSTAMP_SPRITE=(()=>{
  const c=p2Canvas(40,46);
  c.ell(20,43,15,2.6,'s');                                                                                       // shadow
  c.ell(20,6,6,5,'h'); c.rect(14,6,12,3,'h'); c.ell(20,5,4,2.6,'H');                                            // the round wooden knob
  c.rect(16,9,8,14,'h'); c.rect(16,9,2,14,'H'); c.rect(22,9,2,14,'b');                                          // the handle
  c.rect(6,22,28,8,'h'); c.rect(6,22,28,2,'H'); c.rect(6,28,28,2,'b');                                          // the block
  c.rect(7,30,26,8,'R'); c.rect(7,30,26,6,'r'); c.rect(9,31,22,1,'R');                                          // the red ink pad
  c.ell(15,26,2.4,2.6,'w'); c.ell(25,26,2.4,2.6,'w'); c.ell(15,27,1.2,1.6,'k'); c.ell(25,27,1.2,1.6,'k');       // eyes in the block
  c.rect(17,34,6,1,'w'); c.rect(16,35,8,1,'w');                                                                  // letters in the ink: NO
  c.rect(9,38,6,5,'b'); c.rect(25,38,6,5,'b'); c.rect(8,42,8,2,'k'); c.rect(24,42,8,2,'k');                    // two little feet
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  censor:{id:'censor',coins:300,coinStep:20,name:'The Oblivion Censor',the:'the Oblivion Censor',short:'Censor',sprite:CENSOR_SPRITE,pal:CENSOR_PAL,scale:3,eyes:[[28,14],[36,14]],mouth:[32,20],
    hp:330,hpStep:18,atk:5,xp:190,xpStep:10,level:26,rank:'BOSS',
    intro:'A tall man in a green eyeshade stands behind the Claim Desk. His face is one black bar with two small white eyes in it. In one hand he holds a marker. In the other, a stamp the size of a pie. He says, very politely: NO SUCH PERSON.',
    attacks:['The Censor blacks out {t}’s name with a marker.','The Censor stamps RETURN TO SENDER on {t} and gives a small shove.','The Censor reads out a form. NO SUCH PERSON. {t} flinches.'],
    special:{name:'Strike It Out',every:3,kind:'all',msg:'STRIKE IT OUT! The Censor draws a long black line through the whole family!'},
    wobble:'The black bar over his face flickers...',die:'The marker runs dry. The black bar slides off his face. Underneath he has a face. It looks like it has not been used in a very long time, and it is very surprised to see you.',
    rest:['...I only know how to say no. Nobody ever gave me a form where it said yes.','I am so tired. Can I sit at the desk for a minute and not stamp anything?'],
    talk:['I do not decide. I only strike. It is the only thing the form lets me do.','Nobody will ever miss a name that is not on the page.'],
    again:['Return to sender. Round two.','Round {n}. Still returning.'],
    vapor:['#050408','#e8dcb4','#d9503f','#4a7a5a'],
    hint:'The night clerk of the Dead-Letter Office. Every third turn he calls STRIKE IT OUT on everyone (it shows on the turn ribbon first). Below half HP he calls Dead Letters from the belts and braces behind the stamp for TOTAL REDACTION. Sparkle and Cozy hits, or any Tombo, break the stamp. He can be won over: he has never been given anything to deliver.'},
  deadletter:{id:'deadletter',coins:38,coinStep:5,name:'Dead Letter',the:'the Dead Letter',short:'Dead Letter',sprite:DEADLETTER_SPRITE,pal:DEADLETTER_PAL,scale:3,eyes:[[15,24],[29,24]],mouth:[22,30],
    hp:58,hpStep:6,atk:4,xp:40,xpStep:4,level:24,rank:'TOUGH',
    intro:'A yellowed envelope slides off the belt on its own. It has a face and a red stamp and an old address, smudged. It has been returned to sender nine hundred times and it is not quite sure who the sender was.',
    attacks:['The Dead Letter paper-cuts {t}.','The Dead Letter flaps itself shut on {t}’s hand.','The Dead Letter tries to deliver itself to {t}, and gets the address wrong.'],
    special:{name:'Return',every:3,kind:'one',msg:'RETURN TO SENDER! The Dead Letter slaps a stamp on somebody and sends them to the back!'},
    wobble:'The Dead Letter’s flap trembles...',die:'The flap finally opens. It was never sealed. Inside is a single line in a very old hand: I MISSED YOU. The Dead Letter looks thrilled, and floats upward.',
    rest:['...is this one for me? Has anyone ever written to me?','I do not know who sent me. I only know I was not wanted back.'],
    talk:['Nobody ever read me. I think I am a good letter.','Delivery is just being wanted by somebody on the other end.'],
    again:['Undeliverable. Round two.','Round {n}. Still returned.'],
    drop:{id:'pretzels',chance:.4,msg:'A pretzel slid out of the Dead Letter, a little bit squished. It had been mailed to somebody who was never home.'},
    vapor:['#e8dcb4','#c4b48a','#d9503f','#f4f0e6'],
    hint:'An envelope with a face. Every third turn it stamps RETURN on one person and shoves them to the back. Kinetic and Chatter work; it loves Rose’s SILLY and Amy’s PEP TALK.'},
  rubberstamp:{id:'rubberstamp',coins:42,coinStep:5,name:'Rubber Stamp',the:'the Rubber Stamp',short:'Rubber Stamp',sprite:RUBBERSTAMP_SPRITE,pal:RUBBERSTAMP_PAL,scale:3,eyes:[[15,26],[25,26]],mouth:[20,34],
    hp:66,hpStep:7,atk:4,xp:44,xpStep:4,level:25,rank:'TOUGH',
    intro:'A wooden rubber stamp on two tiny feet marches down the aisle between the belts. Its ink pad says NO. It has said NO to everything it ever touched. It would like very much to say something else.',
    attacks:['The Rubber Stamp stamps {t}.','The Rubber Stamp stomps down on {t}’s foot.','The Rubber Stamp inks {t}’s sleeve. It says NO.'],
    special:{name:'Denied',every:3,kind:'one',msg:'DENIED! The Rubber Stamp comes down hard on somebody’s name!'},
    wobble:'The Rubber Stamp’s ink pad drips...',die:'The ink runs dry. The block lifts, and underneath it somebody had been carving one word for years, and never been allowed to stamp it: YES.',
    rest:['...yes. Is it all right to say yes? Just once?','Nobody has ever asked me for a yes.'],
    talk:['I am a stamp. I say what the clerk says.','If I had a different pad I would be a different stamp. I think about that.'],
    again:['Denied. Round two.','Round {n}. Still denying.'],
    drop:{id:'coldbrew',chance:.4,msg:'The Rubber Stamp rolled over and a cold brew rolled out from under its ink pad. It had been saving it for a day it could say yes.'},
    vapor:['#d9503f','#8a5a32','#f4f0e6','#2a1a10'],
    hint:'A stamp with feet. Every third turn it comes down on one person (DENIED, GRIT down). Kinetic and Sparkle work; it loves Tom’s starter and TNB’s COFFEE RUN.'}
});
// Map spots: the hub only (the memory rooms are gentle). The boss waits at the Claim Desk (data/scenes-ch19.js, ch19Censor).
const CH19_HUB_SPOTS=[['deadletter',6,10],['rubberstamp',19,10],['deadletter',5,14],['rubberstamp',20,14]];
const CH19_CENSOR_SPOTS=[['censor',12,9]];
