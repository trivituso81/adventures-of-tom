'use strict';
// data/ch15-monsters.js — Chapter 15 "The Eight-Seat Dinner Table": the boss is HUSH-9 Final Form, Vance's Quiet Car with the hush chip turned
// all the way up. It walks into the Rivituso dining room to make the laughing stop. It is a railcar on two legs with a speaker grille for a
// mouth and one big white glove held to where its lips would be. Battle numbers: data/ch15-battle.js. Loaded after data/ch14-monsters.js.
const HUSH9F_PAL={o:'#1d1a22',g:'#8a90a0',G:'#b4bac8',h:'#e6eaf2',d:'#5c6272',k:'#23262e',c:'#7fe0f0',C:'#bff4fa',w:'#f4f0e6',y:'#f2c75a',r:'#d9493e',b:'#3a3a40'};
const HUSH9F_SPRITE=(()=>{
  const c=p2Canvas(64,72);
  c.ell(32,69,25,3,'b');                                                                              // a shadow on the dining room floor
  c.rect(18,56,10,10,'d'); c.rect(36,56,10,10,'d');                                                   // legs
  c.ell(23,66,6,4,'k'); c.ell(41,66,6,4,'k'); c.set(23,66,'g'); c.set(41,66,'g');                     // bogie wheels for feet
  c.rect(10,14,44,44,'G'); c.rect(10,44,44,14,'g'); c.rect(12,16,3,40,'h'); c.rect(50,16,3,40,'d');   // the railcar body
  c.ell(32,14,22,5,'g'); c.ell(32,13,18,3,'G');                                                       // the roof
  c.rect(10,46,44,6,'c'); c.rect(10,46,44,1,'C');                                                     // the QUIET stripe
  c.glyph('Q',14,47,'k'); c.glyph('U',19,47,'k'); c.glyph('I',24,47,'k'); c.glyph('E',28,47,'k'); c.glyph('T',33,47,'k');
  c.rect(15,22,14,10,'k'); c.rect(35,22,14,10,'k');                                                   // two big windows for eyes
  c.rect(17,24,10,6,'c'); c.rect(37,24,10,6,'c'); c.rect(17,24,10,1,'C'); c.rect(37,24,10,1,'C');
  c.rect(21,25,3,5,'k'); c.rect(41,25,3,5,'k');                                                       // pupils, small and tired
  c.line(14,20,28,23,'k'); c.line(50,20,36,23,'k');                                                   // heavy brows
  c.rect(24,36,16,8,'k'); for(let x=26;x<=38;x+=2) c.rect(x,37,1,6,'d');                             // the speaker grille mouth
  c.rect(31,28,4,13,'w'); c.ell(33,28,2.6,2.6,'w'); c.rect(31,28,1,12,'h');                          // one finger raised to the grille
  c.rect(37,38,15,5,'w'); c.ell(36,39,6,8,'w'); c.ell(34,36,2,3,'h');                                 // the glove and its arm
  c.rect(31,1,2,9,'k'); c.ell(32,2,3,3,'r'); c.ell(32,15,5,5,'y'); c.glyph('9',31,13,'k');           // antenna and the number 9
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  hush9final:{id:'hush9final',coins:200,coinStep:15,name:'HUSH-9 Final Form',the:'HUSH-9',short:'HUSH-9',sprite:HUSH9F_SPRITE,pal:HUSH9F_PAL,scale:3,eyes:[[22,27],[42,27]],mouth:[32,40],
    hp:260,hpStep:14,atk:5,xp:130,xpStep:9,level:21,rank:'BOSS',
    intro:'The dining room door does not open. It folds. HUSH-9 ducks in under the frame with its glove raised, and every plate on the table goes quiet. “THIS IS A QUIET CAR.” It has turned its hush chip all the way up.',
    attacks:['HUSH-9 holds its glove up at {t}. Everything goes very soft.','HUSH-9 rolls into {t} without a sound.','HUSH-9 presses its grille to {t}. “Shh.”'],
    special:{name:'Dead Air',every:3,kind:'all',msg:'DEAD AIR! HUSH-9 pulls the sound out of the whole room!'},
    wobble:'The hush chip flickers...',die:'The chip cracks down the middle. HUSH-9 lowers its glove. In the very quiet that follows, somebody at the table starts to laugh, and it does not go away.',
    rest:['...forty-one decibels. Forty-one. That is not a leak. That is not a leak.','Quiet is safe. Quiet is safe. Why is nobody sad?'],
    talk:['Noise is a leak. Everything that is loud is losing something.','Mr. Vance likes it quiet. Quiet is safe.'],
    again:['Shh. Round two.','Round {n}. Still quiet. Still alone.'],
    vapor:['#8a90a0','#b4bac8','#7fe0f0','#e6eaf2'],
    hint:'HUSH-9 with the chip turned all the way up. Every third turn it calls Dead Air on everyone (it shows on the turn ribbon first). Below half HP it calls Hushlings and braces behind the chip: Chatter and Kinetic hits break it, and so does any Tombo. ▼ Bag, BENCH CALL swaps in someone from the bench. Kindest answer: PULL UP A CHAIR.'}
});
