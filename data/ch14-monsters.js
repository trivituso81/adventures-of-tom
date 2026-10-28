'use strict';
// data/ch14-monsters.js — Chapter 14 "The Rikers Wall of Rivituso Row": the boss is Warden Boppy, Boppy in the Warden's gold plate, standing at
// the Rivituso gate. He cannot be beaten, only reached: every hit on the armor makes it hum brighter (and heals it), so the kind route is the
// whole fight (DEFEND, Amy's pace, jokes, and Deedee from the porch). Battle numbers: data/ch14-battle.js. Loaded after data/ch13-monsters.js.
const WARDEN_PAL={o:'#1d1a22',G:'#e8b030',g:'#c08a1c',h:'#fff0a0',d:'#8a5e12',k:'#2a2330',w:'#e9e2d0',r:'#d9493e',s:'#9aa3b2',S:'#cfd6e2',m:'#6a5a48',a:'#ffe27a',b:'#3f352a'};
const WARDEN_SPRITE=(()=>{
  const c=p2Canvas(52,66);
  c.ell(26,62,22,3.4,'b');                                                                          // a shadow on the porch boards
  c.rect(15,46,9,14,'g'); c.rect(28,46,9,14,'g'); c.rect(15,46,2,14,'G'); c.rect(28,46,2,14,'G');   // legs
  c.rect(13,58,12,5,'d'); c.rect(27,58,12,5,'d'); c.rect(13,58,12,1,'g'); c.rect(27,58,12,1,'g');    // boots
  c.ell(26,34,16,15,'G'); c.ell(26,34,14,13,'g'); c.ell(26,31,12,10,'G'); c.ell(21,27,5,4,'h');       // the breastplate
  c.rect(14,43,24,4,'d'); c.rect(23,42,6,6,'a');                                                       // belt and buckle
  c.ell(9,26,7,6,'G'); c.ell(43,26,7,6,'G'); c.ell(8,24,3,2,'h'); c.ell(42,24,3,2,'h');               // pauldrons
  c.rect(4,29,6,15,'g'); c.rect(42,29,6,15,'g'); c.rect(3,43,8,5,'G'); c.rect(41,43,8,5,'G');         // arms and gauntlets
  c.rect(47,2,3,60,'m'); c.rect(47,2,1,60,'s');                                                        // the gate bar he leans on
  c.rect(44,2,9,9,'s'); c.rect(44,2,9,2,'S'); c.rect(48,0,1,3,'S');                                    // its axe blade
  c.ell(26,15,12,12,'G'); c.ell(26,15,10,10,'g'); c.rect(14,13,24,6,'k');                              // the great helm and its visor
  c.rect(17,14,5,3,'a'); c.rect(30,14,5,3,'a'); c.set(18,14,'h'); c.set(31,14,'h');                    // eyes glowing through the slit
  c.rect(24,0,4,8,'r'); c.rect(24,0,4,2,'d');                                                          // a red crest
  c.rect(19,21,14,4,'w'); c.rect(21,24,10,1,'w'); c.rect(25,21,2,4,'k');                              // the mustache, still Boppy's
  c.ell(26,5,6,2,'h');                                                                                // a shine on the crown
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  warden:{id:'warden',coins:180,coinStep:14,name:'Warden Boppy',the:'Warden Boppy',short:'Warden Boppy',sprite:WARDEN_SPRITE,pal:WARDEN_PAL,scale:4,eyes:[[19,15],[32,15]],mouth:[26,23],
    hp:240,hpStep:14,atk:4,xp:110,xpStep:9,level:20,rank:'BOSS',
    intro:'The gold armor hums. Warden Boppy stands in front of the Rivituso door with the gate bar across his knees, and he does not so much as blink. The glass behind him stays up. That is the deal.',
    attacks:['Warden Boppy lowers the gate bar at {t}.','Warden Boppy plants the bar in front of {t}. “Halt.”','Warden Boppy bumps {t} back with a gold shoulder.'],
    special:{name:'Gate Slam',every:3,kind:'all',msg:'GATE SLAM! Warden Boppy brings the bar down across the whole yard!'},
    wobble:'The gold plate rattles...',die:'The hum drops. The gold goes soft and runs down him like warm wax. Underneath, in a flannel shirt, is just Boppy.',
    rest:['...it doesn’t hurt. It doesn’t hurt. I’m fine. Don’t hit me.','Go home. Go back to the good coast. I made a deal.'],
    talk:['I stand here and the glass stays up. That’s the deal.','Nobody gets hurt. Nobody gets old. Nobody gets left.'],
    again:['Halt. Round two.','Round {n}. I’m still standing. I’ve been standing for hours.'],
    vapor:['#e8b030','#ffe27a','#fff0a0','#f4f0e6'],
    hint:'You cannot beat him: every hit only makes the armor hum brighter. DEFEND, Amy’s PEP TALK, Grace’s DANCE and Rose’s SILLY warm him up. Make him laugh (▼ Bag, three times). Deedee will call from the porch when he is ready.'}
});
