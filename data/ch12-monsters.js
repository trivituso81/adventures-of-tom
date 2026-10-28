'use strict';
// data/ch12-monsters.js — Chapter 12 "Welcome to Jefferson Park, Girls": the boss, Gridlock Prime. Monochrome Marlowe greyed out
// Jefferson Boulevard and every traffic light on it went red, so the little Gridlock that lives at the corner grew into the whole
// intersection and parked across all four lanes. It is not angry. It has been waiting for a green light and nobody ever gave it one.
// Same shape as data/p2-monsters.js (p2Canvas draws the sprite). Battle numbers: data/ch12-battle.js. Loaded after data/p2-monsters.js.
const GRIDPRIME_PAL={o:'#1d1a22',r:'#d9493e',R:'#ff7a6a',d:'#9c2f2a',k:'#3a3d46',K:'#5a5f6c',s:'#b8bec9',w:'#f4f0e6',y:'#f2c75a',Y:'#8a6f2a',g:'#2f5a35',G:'#7ac07a',b:'#9ad0e8',B:'#5e98bd',t:'#25232b'};
const GRIDPRIME_SPRITE=(()=>{
  const c=p2Canvas(64,58);
  // the road under it: asphalt with a crosswalk
  c.rect(2,50,60,6,'k'); c.rect(2,50,60,1,'K');
  for(let i=0;i<9;i++) c.rect(6+i*6,52,3,3,'w');
  // the car body
  c.rect(6,26,52,22,'r'); for(const [x,y] of [[6,26],[57,26],[6,47],[57,47]]) c.set(x,y,'.');
  c.rect(7,27,50,3,'R'); c.rect(6,43,52,5,'d');
  c.rect(14,15,36,12,'r'); c.rect(15,16,34,3,'R');                       // the cabin
  c.rect(17,19,13,8,'b'); c.rect(34,19,13,8,'b'); c.rect(17,25,13,2,'B'); c.rect(34,25,13,2,'B'); c.rect(30,19,4,8,'r');
  // wheels
  c.ell(16,48,7,6,'t'); c.ell(16,48,3,3,'s'); c.ell(48,48,7,6,'t'); c.ell(48,48,3,3,'s');
  // headlight eyes, pointed a little at the ground: it is not angry, it is stuck
  c.ell(18,34,4.6,4.6,'w'); c.ell(46,34,4.6,4.6,'w'); c.ell(18,36,2.1,2.3,'o'); c.ell(46,36,2.1,2.3,'o'); c.set(17,35,'w'); c.set(45,35,'w');
  // the grille, with a barricade's yellow teeth
  c.rect(23,39,18,6,'t'); for(let i=0;i<4;i++) c.rect(24+i*4,40,2,4,'y');
  // the traffic light on the roof: red lit, yellow and green dark
  c.rect(26,0,12,16,'k'); c.rect(27,1,10,1,'K'); c.rect(30,16,4,2,'K');
  c.ell(32,3.5,3.1,3.1,'R'); c.ell(32,8,3.1,3.1,'Y'); c.ell(32,12.5,3.1,3.1,'g');
  c.rect(25,2,1,3,'t'); c.rect(38,2,1,3,'t');
  // a stop sign on the left, a striped barricade board on the right
  c.poly([[2,12],[5,9],[10,9],[13,12],[13,17],[10,20],[5,20],[2,17]],'r'); c.rect(3,14,9,2,'w'); c.rect(6,20,2,7,'K');
  c.rect(51,10,11,6,'y'); for(let i=0;i<4;i++) c.rect(52+i*3,10,1,6,'t'); c.rect(56,16,2,10,'K');
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  gridlockprime:{id:'gridlockprime',coins:110,coinStep:12,name:'Gridlock Prime',the:'Gridlock Prime',short:'Gridlock Prime',sprite:GRIDPRIME_SPRITE,pal:GRIDPRIME_PAL,scale:4,eyes:[[18,35],[46,35]],mouth:[32,42],
    hp:160,hpStep:12,atk:4,xp:80,xpStep:8,level:16,rank:'BOSS',
    intro:'Every light on Jefferson Boulevard turns red at once. A car the size of an intersection rolls into the middle of it and parks across all four lanes. Its headlights are pointed at the ground.',
    attacks:['Gridlock Prime honks at {t}. For a very long time.','Gridlock Prime inches into {t}.','Gridlock Prime merges into {t} without signaling.'],
    special:{name:'Rush Hour',every:3,kind:'all',msg:'RUSH HOUR! Gridlock Prime floors it into everyone!'},
    wobble:'Gridlock Prime’s red light flickers...',die:'The red light flickers, goes dark, and the green one comes on. Gridlock Prime rolls out of the intersection at a very polite eleven miles an hour.',
    rest:['...Green. That was green. Was that green?','Somebody go first. I’ll follow. I’m always last.'],
    talk:['I have been red for a very long time.','Everybody else got to go. I am the one who holds them.'],
    again:['HONK. Lane closure. Round two.','Round {n}. Still red.'],
    vapor:['#d9493e','#f2c75a','#7ac07a','#5a5f6c'],
    hint:'The boss of Jefferson Boulevard. Every third turn it floors Rush Hour on everyone (it shows on the turn ribbon first). Below half HP it calls Gridlocks and braces behind a red light. Kinetic and Splash break the light; Run With Us, Mommy! breaks it in one go.'}
});
