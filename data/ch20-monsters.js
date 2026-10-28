'use strict';
// data/ch20-monsters.js — Chapter 20 "The Forever Engine & The Open Sky" (the finale): the Chronos-Leviathan that guards the Forever Engine (a clockwork serpent
// built out of every stopped clock in the sky, with four Resentment Barriers) and Julian Vance with his coat off, afterwards (phase 2: he is the monster
// you comfort, not the one you hit). Same shape as data/ch19-monsters.js (p2Canvas draws the sprite). Battle numbers: data/ch20-battle.js. Loaded after data/ch19-monsters.js.
const LEVI_PAL={o:'#0c0a12',k:'#1c1a24',K:'#34324a',g:'#c8a040',G:'#f2d27a',d:'#7a5a1a',D:'#4a3410',w:'#f4f0e6',W:'#d0ccc0',t:'#08060c',A:'#ffb347',a:'#ff8a2a',c:'#7ad0e8',r:'#d9503f',b:'#3a4a7a',B:'#6a8ad0'};
const LEVI_SPRITE=(()=>{
  const c=p2Canvas(84,76);
  const gear=(cx,cy,r,col,hole)=>{ c.ell(cx,cy,r,r,col); for(let k=0;k<12;k++) { const a=k*Math.PI/6; c.rect(Math.round(cx+Math.cos(a)*(r+1.5))-1,Math.round(cy+Math.sin(a)*(r+1.5))-1,3,3,col); } c.ell(cx,cy,r*.45,r*.45,hole); c.set(cx,cy,'G'); };
  c.ell(42,72,34,3,'t');                                                                                                // shadow
  c.ell(42,56,35,15,'D'); c.ell(42,54,33,14,'g'); c.ell(42,52,31,12,'G'); c.ell(42,58,20,6,'t');                         // the coil: a ring of polished brass
  for(let k=0;k<14;k++) { const a=k*Math.PI*2/14; c.rect(Math.round(42+Math.cos(a)*33)-1,Math.round(54+Math.sin(a)*13),3,2,'d'); }   // scale plates round the coil
  c.rect(35,22,14,36,'D'); c.rect(36,22,12,36,'g'); c.rect(36,22,3,36,'G'); c.rect(45,22,3,36,'d');                      // the neck
  for(let y=26;y<56;y+=5) c.rect(36,y,12,1,'d');                                                                        // neck segments
  gear(14,34,10,'d','k'); gear(70,34,10,'d','k'); gear(14,34,5,'g','k'); gear(70,34,5,'g','k');                         // side gears, turning
  c.ell(42,40,10,10,'D'); c.ell(42,40,9,9,'w'); c.ell(42,40,8,8,'W');                                                  // the chest clock
  for(let k=0;k<12;k++) { const a=k*Math.PI/6; c.set(Math.round(42+Math.cos(a)*7),Math.round(40+Math.sin(a)*7),'t'); }
  c.line(42,40,42,34,'t'); c.line(42,40,46,43,'t'); c.set(42,40,'r');                                                  // the hands: 4:59
  c.ell(42,15,17,13,'D'); c.ell(42,14,16,12,'g'); c.ell(42,12,14,8,'G'); c.rect(32,20,20,5,'d');                        // the head
  c.poly([[28,6],[32,0],[35,8]],'g'); c.poly([[56,6],[52,0],[49,8]],'g');                                                // two clock-hand horns
  c.ell(35,14,3.5,3,'t'); c.ell(49,14,3.5,3,'t'); c.ell(35,14,2.4,2,'A'); c.ell(49,14,2.4,2,'A'); c.set(35,14,'w'); c.set(49,14,'w');   // amber eyes
  c.rect(33,21,18,3,'t'); for(let x=34;x<51;x+=3) { c.poly([[x,21],[x+1,25],[x+2,21]],'w'); }                         // a mouth of little white gear teeth
  c.rect(30,2,3,3,'c'); c.rect(51,2,3,3,'c');                                                                          // cold sparks on the horns
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  leviathan:{id:'leviathan',coins:0,coinStep:0,name:'The Chronos-Leviathan',the:'the Chronos-Leviathan',short:'Leviathan',sprite:LEVI_SPRITE,pal:LEVI_PAL,scale:3,eyes:[[35,14],[49,14]],mouth:[42,22],
    hp:620,hpStep:0,atk:6,xp:400,xpStep:0,level:28,rank:'BOSS',
    intro:'The Forever Engine wakes. Out of the heart of it uncoils a serpent made of every stopped clock in the sky. Gold gears turn along its sides. Its chest says 4:59. It has been holding that minute for twenty years, and it is not going to let go.',
    attacks:['The Leviathan sweeps its tail at {t}.','The Leviathan snaps its gear teeth at {t}.','The Leviathan winds {t} up very tightly.'],
    special:{name:'Time Warp',every:3,kind:'all',msg:'TIME WARP! The Leviathan folds the afternoon in half, and everybody is in the fold!'},
    wobble:'The chest clock stutters...',die:'The chest clock ticks. Just once. The gold comes apart into a thousand small clocks, and every one of them is running.',
    rest:['...it was only supposed to be a little while.','...tick.'],
    talk:['Nothing moves. Nothing leaves. Nothing hurts.','Hold the minute.'],
    again:['Hold the minute.','Round {n}. Still holding.'],
    vapor:['#f2d27a','#ffb347','#7ad0e8','#34324a'],
    hint:'Four Resentment Barriers: DISTANCE, AGING, EXHAUSTION, FEAR. Each one holds his HP up until the family breaks it. When a barrier locks, ▼ Bag has a FAMILY RELAY for that one barrier. Every third turn he calls TIME WARP on everyone (it shows on the turn ribbon first).'},
  julian:{id:'julian',coins:0,coinStep:0,name:'Julian Vance',the:'Julian Vance',short:'Julian',sprite:VANCE_SPRITE,pal:VANCE_PAL,scale:3,eyes:[[27,14],[37,14]],mouth:[32,23],
    hp:620,hpStep:0,atk:4,xp:300,xpStep:0,level:28,rank:'BOSS',
    intro:'The Leviathan is gone. In its place is a glass replica of a living room, a lamp, one armchair, and a man in a long coat sitting very small in it. He does not look up. His hands are shaking. He says: stay away, there is always more time. There is always one more flight next month.',
    attacks:['Julian rereads his old calendar at {t}.','The amber glass presses in on {t}.','Julian looks away from {t}.'],
    special:{name:'One More Flight',every:3,kind:'all',msg:'ONE MORE FLIGHT! Julian says it very quietly, and it lands on everyone.'},
    wobble:'The lamp flickers...',die:'He does not fall. He lets his breath out. It has been twenty years.',
    rest:['...nobody comes.','...I was going to call. Next month.'],
    talk:['Eternal Silence. Please. Just let it be quiet.','I never learned how to say it.'],
    again:['Quiet. Please.','Round {n}. Quiet.'],
    vapor:['#ffd36a','#f4f0e6','#7ad0e8','#262432'],
    hint:'His grief has turned your ATTACK to stone. Nothing you hit him with does anything. Care for him: DANCE, SILLY, PEP TALK, MOON & BACK, GRUMBLE, WARDROBE and PUPPY EYES each warm him once. Use ▼ Bag, BENCH CALL, to bring them in (it is almost free). When all seven have, Tom has one thing left to do.'}
});
const CH20_HEART_SPOTS=[['leviathan',11,5]];
const CH20_JULIAN_SPOTS=[['julian',11,6]];
