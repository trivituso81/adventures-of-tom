'use strict';
// data/ch18-monsters.js — Chapter 18 "No Touching, Please.": Julian Vance at the top of the Glass Tower, floor 60, in front of the Chronos Loom.
// He is the man in the long coat who never took his hat off. This is the survival fight (data/ch18-battle.js): he cannot be hurt, he fires the
// Unwriting Ray, and Tom stands in front of it. Same shape as data/ch17-monsters.js (p2Canvas draws the sprite). Loaded after data/ch17-monsters.js.
const VANCE_PAL={o:'#0c0a12',k:'#262432',K:'#3e3a4e',h:'#1a1822',H:'#2e2a3a',g:'#c8a040',G:'#f2d27a',d:'#7a5a1a',s:'#e0c4a8',S:'#b89878',w:'#f4f0e6',W:'#d8d4cc',r:'#d9503f',A:'#ffd36a',t:'#08060c',c:'#7ad0e8',C:'#c4f0fa',n:'#2a6a88'};
const VANCE_SPRITE=(()=>{
  const c=p2Canvas(64,82);
  c.ell(32,79,23,3,'t');                                                                                      // a shadow on the glass
  c.poly([[15,28],[49,28],[55,76],[9,76]],'k');                                                               // the long coat
  c.poly([[15,28],[22,28],[18,76],[9,76]],'H'); c.poly([[42,28],[49,28],[55,76],[46,76]],'H');               // the lit edges of the coat
  c.rect(31,36,2,40,'t');                                                                                      // the centre seam
  c.poly([[23,27],[32,44],[32,27]],'K'); c.poly([[41,27],[32,44],[32,27]],'K');                                // the lapels
  c.rect(28,27,8,12,'w'); c.rect(31,29,2,10,'r');                                                              // shirt and a thin red tie
  for(const y of [46,54,62,70]) { c.set(29,y,'G'); c.set(35,y,'G'); }                                          // gold buttons
  c.rect(14,74,12,5,'t'); c.rect(38,74,12,5,'t'); c.rect(14,74,12,1,'H'); c.rect(38,74,12,1,'H');             // shoes under the hem
  c.rect(23,24,18,4,'K');                                                                                      // the collar, turned up
  c.ell(32,18,7.4,8.6,'s'); c.ell(32,20,6,6.4,'S');                                                            // the face
  c.rect(12,10,40,3,'h'); c.rect(12,10,40,1,'H'); c.rect(20,1,24,10,'h'); c.rect(20,1,24,2,'H');             // the hat: brim and crown
  c.rect(20,8,24,2,'g'); c.rect(20,8,24,1,'G');                                                                // the gold band
  c.rect(23,13,18,3,'t'); c.set(27,14,'A'); c.set(37,14,'A');                                                  // his eyes, in the shadow of the brim
  c.rect(28,23,8,1,'t');                                                                                       // a thin, patient mouth
  // the right arm (screen left) holds the Unwriting Ray out toward the party: a brass rod and a pale lens
  c.poly([[15,30],[22,30],[10,52],[6,52]],'k'); c.ell(7,53,3.4,3.4,'s');
  c.rect(0,50,10,6,'d'); c.rect(0,50,10,2,'g'); c.rect(1,54,8,1,'t');
  c.ell(1,53,3.6,3.6,'n'); c.ell(1,53,2.6,2.6,'c'); c.set(0,52,'C'); c.set(1,52,'w');
  // the left arm hangs open at his side; a gold watch chain runs from the vest to a pocket
  c.poly([[42,30],[49,30],[53,56],[47,56]],'k'); c.ell(50,58,3.2,3.2,'s'); c.rect(48,59,2,3,'S');
  c.line(36,44,44,50,'G'); c.ell(45,52,3,3,'G'); c.ell(45,52,2,2,'W'); c.set(45,51,'t');
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  vance:{id:'vance',coins:0,coinStep:0,name:'Julian Vance',the:'Julian Vance',short:'Vance',sprite:VANCE_SPRITE,pal:VANCE_PAL,scale:3,eyes:[[27,14],[37,14]],mouth:[32,23],
    hp:99999,hpStep:0,atk:5,xp:0,xpStep:0,level:26,rank:'BOSS',
    intro:'A man in a long coat stands in front of a loom the size of a house. His hat is on. A gold lens at the end of his arm is already looking at you.',
    attacks:['Julian Vance raises the Unwriting Ray at {t}.'],
    special:{name:'Unwriting Ray',every:2,kind:'all',msg:'UNWRITING RAY! Julian Vance fires the Loom’s beam at the family!'},
    wobble:'The threads of the Loom sing...',die:'He does not fall. Nothing in this room is allowed to.',
    rest:['...it was meant for five.'],talk:['Hold still. It is gentle. It is the gentlest thing I ever made.'],again:['Hold still.'],
    vapor:['#ffd36a','#f4f0e6','#7ad0e8','#262432'],
    hint:'He cannot be hurt. Every ray is aimed at the family, and Tom steps in front of every one. DEFEND, heal Tom, and hold on.'}
});
const CH18_PINNACLE_SPOTS=[['vance',10,6]];
