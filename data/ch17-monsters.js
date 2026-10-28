'use strict';
// data/ch17-monsters.js — Chapter 17 "Ascent of the Glass Tower": Julian Vance's 60-story tower in Downtown LA. Everything in it is built to keep
// a moment from ending. Three kinds of Stillness guard the stairs and the shelf halls, easiest to hardest: Pause Sprite (a pause button with a
// face; holds people in place), Paperweight (a glass dome with a snowstorm that never settles; squashes GRIT), Curator (a very stiff man in white
// gloves with a label gun; sticks NOT FOR SALE on people until they go Drowsy). The boss is the Archivist's Twin Lenses: a brass gantry with a cold
// lens (STILL) and an amber lens (ARCHIVE) that files whatever it looks at. Same shape as data/ch13-monsters.js (p2Canvas draws the sprites).
// Battle numbers: data/ch17-battle.js. Loaded after data/ch16-monsters.js.
const PAUSESPRITE_PAL={o:'#161a26',b:'#5a74a8',B:'#8aa4d8',d:'#3a4c7a',w:'#f4f0e6',W:'#d8d4cc',k:'#161a26',y:'#f2c75a',p:'#e8a0a0'};
const PAUSESPRITE_SPRITE=(()=>{
  const c=p2Canvas(40,42);
  c.ell(20,20,17,17,'d'); c.ell(20,19,16,16,'b'); c.ell(15,11,8,5,'B');                                   // the round blue button
  c.rect(10,9,8,22,'w'); c.rect(23,9,8,22,'w'); c.rect(10,9,8,2,'W'); c.rect(23,9,8,2,'W');               // two bars: the pause symbol
  c.rect(16,9,2,22,'W'); c.rect(29,9,2,22,'W');
  c.ell(14,16,2.4,3,'k'); c.ell(27,16,2.4,3,'k'); c.set(13,14,'w'); c.set(26,14,'w');                      // an eye on each bar
  c.rect(15,26,11,1,'k'); c.set(14,25,'k'); c.set(26,25,'k');                                               // a very flat mouth
  c.ell(8,21,2.6,2.2,'p'); c.ell(33,21,2.6,2.2,'p');                                                        // cheeks
  c.rect(11,36,7,4,'d'); c.rect(23,36,7,4,'d');                                                             // two little feet
  c.outline('o'); return c.rows();
})();
const PAPERWEIGHT_PAL={o:'#161e2a',g:'#9cc8e4',G:'#d6eefa',h:'#ffffff',s:'#6e9ab8',w:'#f4f0e6',r:'#c8553d',R:'#8a3a2a',b:'#8a6a4a',B:'#5a4028',L:'#b88a5a',k:'#161e2a',y:'#f2c75a',n:'#4f7d45',p:'#e8a0a0'};
const PAPERWEIGHT_SPRITE=(()=>{
  const c=p2Canvas(46,48);
  c.ell(23,44,20,3,'B');                                                                                   // shadow
  c.rect(5,34,36,10,'b'); c.rect(5,34,36,2,'L'); c.rect(5,42,36,2,'B');                                    // the wooden base
  c.ell(23,22,19,18,'s'); c.ell(23,21,18,17,'g'); c.ell(23,26,16,11,'G');                                  // the glass dome
  c.rect(7,28,32,6,'w');                                                                                   // snow on the ground inside
  c.rect(15,17,16,12,'R'); c.poly([[13,18],[23,9],[33,18]],'r'); c.rect(20,22,5,7,'y'); c.rect(21,24,3,5,'B'); // a tiny house
  for(const [x,y] of [[9,14],[14,9],[30,10],[36,16],[11,24],[35,25],[24,6],[19,13]]) c.set(x,y,'h');         // snow still falling
  c.ell(14,13,4,2.4,'h'); c.set(13,12,'G');                                                                // glare
  c.ell(16,38,2.4,2.8,'w'); c.ell(30,38,2.4,2.8,'w'); c.ell(16,39,1.2,1.6,'k'); c.ell(30,39,1.2,1.6,'k');   // eyes on the base
  c.rect(20,41,7,1,'k'); c.ell(10,40,2,1.4,'p'); c.ell(36,40,2,1.4,'p');
  c.outline('o'); return c.rows();
})();
const CURATOR_PAL={o:'#1a1a22',k:'#2c2c36',g:'#8e8e9a',G:'#b8b8c4',w:'#f4f0e6',W:'#d8d4cc',s:'#e8c8a8',S:'#c8a080',r:'#d9503f',y:'#f2c75a',t:'#14141a',h:'#6a6a76',p:'#e8a0a0'};
const CURATOR_SPRITE=(()=>{
  const c=p2Canvas(40,58);
  c.rect(12,22,18,26,'g'); c.rect(12,22,18,3,'G'); c.rect(18,22,6,26,'k');                                // a long grey coat
  c.rect(19,23,4,24,'w'); for(const y of [27,32,37,42]) c.set(21,y,'t');                                    // shirt front and buttons
  c.rect(12,46,7,10,'k'); c.rect(23,46,7,10,'k'); c.rect(10,54,10,3,'t'); c.rect(22,54,10,3,'t');         // trousers and shoes
  c.ell(21,12,7.6,8.6,'s'); c.ell(21,14,6,6.4,'S'); c.rect(13,3,16,5,'h'); c.rect(14,1,14,3,'h');          // the head and a flat pillbox hat
  c.rect(13,3,16,1,'G'); c.ell(17,12,2.4,2.4,'w'); c.ell(25,12,2.4,2.4,'w'); c.set(17,12,'t'); c.set(25,12,'t');
  c.rect(14,10,6,1,'t'); c.rect(22,10,6,1,'t'); c.rect(19,11,4,1,'t');                                    // round glasses
  c.rect(18,17,6,1,'t');                                                                                    // a stiff mouth
  c.rect(5,24,7,5,'g'); c.rect(2,28,7,6,'w'); c.rect(2,28,7,1,'W');                                       // left arm, white glove
  c.rect(30,24,7,5,'g'); c.rect(31,28,9,5,'w'); c.rect(31,28,9,1,'W');                                    // right arm, white glove
  c.rect(34,26,5,3,'k'); c.rect(35,24,3,3,'r'); c.rect(33,29,2,2,'y');                                     // a label gun
  c.rect(0,33,9,6,'w'); c.rect(1,34,7,1,'r'); c.rect(1,36,5,1,'W');                                       // a label: NOT FOR SALE
  c.outline('o'); return c.rows();
})();
const TWINLENS_PAL={o:'#14121a',y:'#c8a040',Y:'#f2d27a',d:'#7a5a1a',k:'#2a2430',K:'#4a4452',c:'#7ad0e8',C:'#c4f0fa',n:'#2a6a88',a:'#f2a33a',A:'#ffd36a',e:'#b8641e',w:'#f4f0e6',r:'#d9503f',R:'#ff8a7a',t:'#0e0c12',s:'#9a9aa6',b:'#241f2a'};
const TWINLENS_SPRITE=(()=>{
  const c=p2Canvas(80,60);
  c.ell(40,57,34,3,'b');                                                                                   // a shadow on the glass floor
  c.rect(34,2,12,6,'k'); c.rect(34,2,12,1,'K'); c.rect(38,0,4,3,'s');                                      // the ceiling mount
  c.rect(37,8,6,10,'k'); c.rect(37,8,2,10,'K');                                                            // the gantry arm
  c.rect(10,17,60,7,'y'); c.rect(10,17,60,2,'Y'); c.rect(10,22,60,2,'d');                                  // the brass bar between the lenses
  c.ell(40,20,6,6,'k'); c.ell(40,20,4.4,4.4,'r'); c.ell(39,19,1.6,1.6,'R');                                // the red record light in the middle
  // left lens: STILL (cold and clear)
  c.ell(20,34,19,19,'k'); c.ell(20,34,18,18,'y'); c.ell(20,34,15.6,15.6,'d'); c.ell(20,34,14,14,'n'); c.ell(20,34,12,12,'c'); c.ell(20,34,7,7,'C');
  c.ell(20,34,4.4,4.8,'t'); c.ell(19,33,1.4,1.6,'w'); c.ell(14,26,4,2.4,'C'); c.set(13,25,'w');
  // right lens: ARCHIVE (amber, a little too warm)
  c.ell(60,34,19,19,'k'); c.ell(60,34,18,18,'y'); c.ell(60,34,15.6,15.6,'d'); c.ell(60,34,14,14,'e'); c.ell(60,34,12,12,'a'); c.ell(60,34,7,7,'A');
  c.ell(60,34,4.4,4.8,'t'); c.ell(59,33,1.4,1.6,'w'); c.ell(54,26,4,2.4,'A'); c.set(53,25,'w');
  for(let i=0;i<8;i++) { const a=i*Math.PI/4+.4; c.line(20+Math.cos(a)*14,34+Math.sin(a)*14,20+Math.cos(a)*18,34+Math.sin(a)*18,'k'); c.line(60+Math.cos(a)*14,34+Math.sin(a)*14,60+Math.cos(a)*18,34+Math.sin(a)*18,'k'); }   // aperture ticks
  c.rect(34,44,12,9,'k'); c.rect(34,44,12,1,'K'); for(let i=0;i<5;i++) c.rect(36+i*2,47,1,5,'s');         // a speaker grille where its mouth would be
  c.rect(29,24,22,3,'y'); c.rect(29,24,22,1,'Y');
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  twinlens:{id:'twinlens',coins:260,coinStep:18,name:'The Archivist’s Twin Lenses',the:'the Archivist’s Twin Lenses',short:'Twin Lenses',sprite:TWINLENS_SPRITE,pal:TWINLENS_PAL,scale:4,eyes:[[20,34],[60,34]],mouth:[40,48],
    hp:330,hpStep:18,atk:5,xp:170,xpStep:10,level:25,rank:'BOSS',
    intro:'A brass gantry unfolds out of the ceiling with a cold lens on one side and an amber one on the other. Both of them are looking at you. A very calm voice says, Please hold still. I am making space.',
    attacks:['The Twin Lenses focus a pinpoint of light on {t}.','The Twin Lenses take a snapshot of {t}.','The Twin Lenses rack focus, and {t} goes soft at the edges.'],
    special:{name:'Long Exposure',every:3,kind:'all',msg:'LONG EXPOSURE! The Twin Lenses hold the shutter open and everyone is stuck in the frame!'},
    wobble:'The brass bar creaks...',die:'The cold lens cracks first, then the amber one. The red light goes out. Somewhere in the ceiling, very quietly, a voice says: filing incomplete.',
    rest:['...incomplete. Why is it incomplete.','I have eleven thousand towns. I have never once had a family that would not hold still.'],
    talk:['I do not decide what is worth keeping. I only keep it.','Every frame is the best afternoon. You have never been in one. That is the problem.'],
    again:['Please hold still. Round two.','Round {n}. Still filing.'],
    vapor:['#7ad0e8','#f2a33a','#c8a040','#f4f0e6'],
    hint:'The Archivist’s eyes. Every third turn it calls LONG EXPOSURE on everyone (it shows on the turn ribbon first). Below half HP it calls Curators and braces behind a lens for TOTAL ARCHIVE. Kinetic and Sparkle hits break the lens, and so does any Tombo. There is no kind route.'},
  pausesprite:{id:'pausesprite',coins:30,coinStep:4,name:'Pause Sprite',the:'the Pause Sprite',short:'Pause Sprite',sprite:PAUSESPRITE_SPRITE,pal:PAUSESPRITE_PAL,scale:3,eyes:[[14,16],[27,16]],mouth:[20,26],
    hp:44,hpStep:5,atk:3,xp:30,xpStep:3,level:22,rank:'TRICKY',
    intro:'A round blue button with two white bars on it floats down the stairwell. It has a face. It has been on pause for a very long time, and it would like you to join it.',
    attacks:['The Pause Sprite taps {t}.','The Pause Sprite floats into {t} and does not move.','The Pause Sprite holds up two fingers at {t}. Then two more.'],
    special:{name:'Pause',every:3,kind:'one',msg:'PAUSE! The Pause Sprite freezes somebody right where they stand!'},
    wobble:'The Pause Sprite’s bars flicker...',die:'The two bars slide apart. For one second the button turns into a little triangle, pointing forward, and it looks absolutely thrilled.',
    rest:['...play? Was that play? I have never been play.','I was a button. Nobody ever pushed me twice.'],
    talk:['I only have one setting. It is wait.','Everything is nicer on pause. That is what I was told.'],
    again:['Paused. Round two.','Round {n}. Still pausing.'],
    drop:{id:'coldbrew',chance:.4,msg:'The Pause Sprite turned into a triangle and dropped a cold brew. It had been saving it for when things started again.'},
    vapor:['#5a74a8','#8aa4d8','#f4f0e6','#161a26'],
    hint:'A pause button with a face. Every third turn it freezes one person (Slow). Kinetic and Chatter work; it loves Rose’s SILLY and Grace’s DANCE.'},
  paperweight:{id:'paperweight',coins:34,coinStep:4,name:'Paperweight',the:'the Paperweight',short:'Paperweight',sprite:PAPERWEIGHT_SPRITE,pal:PAPERWEIGHT_PAL,scale:3,eyes:[[16,38],[30,38]],mouth:[23,41],
    hp:52,hpStep:6,atk:4,xp:34,xpStep:4,level:23,rank:'TOUGH',
    intro:'A glass dome the size of a beach ball rolls out of the dark on a wooden base. Inside it, a tiny house sits in a snowstorm that has not settled in years.',
    attacks:['The Paperweight rolls into {t}.','The Paperweight sets itself down on {t}’s foot.','The Paperweight shakes itself and snows on {t}.'],
    special:{name:'Hold Down',every:3,kind:'one',msg:'HOLD DOWN! The Paperweight sits on somebody and does not get up!'},
    wobble:'The snow in the Paperweight swirls...',die:'The dome tips over and the snow finally settles. The little house has a light on. Somebody inside waves.',
    rest:['...is the snow supposed to stop? It stopped. It stopped!','Somebody shook me in 1998. I have been shaking ever since.'],
    talk:['I hold things down. That is all a paperweight does.','Nobody wants to be the one who lets the papers fly.'],
    again:['Heavy. Round two.','Round {n}. Still holding.'],
    drop:{id:'pretzels',chance:.4,msg:'A bag of pretzels rolled out from under the Paperweight. Something had been holding them down.'},
    vapor:['#9cc8e4','#d6eefa','#8a6a4a','#f4f0e6'],
    hint:'A snow globe with a grudge. Every third turn it sits on one person and squashes their GRIT. Kinetic and Sparkle work; it loves Amy’s PEP TALK and TNB’s COFFEE RUN.'},
  curator:{id:'curator',coins:36,coinStep:5,name:'Curator',the:'the Curator',short:'Curator',sprite:CURATOR_SPRITE,pal:CURATOR_PAL,scale:3,eyes:[[17,12],[25,12]],mouth:[21,17],
    hp:56,hpStep:6,atk:4,xp:38,xpStep:4,level:23,rank:'TOUGH',
    intro:'A very stiff man in white gloves steps out from between two shelves with a label gun. He has already put a sticker on the wall. It says NOT FOR SALE.',
    attacks:['The Curator labels {t}.','The Curator straightens {t}’s collar and does not let go.','The Curator tells {t} very quietly not to touch the exhibits.'],
    special:{name:'Not For Sale',every:3,kind:'one',msg:'NOT FOR SALE! The Curator sticks a label on somebody and files them away!'},
    wobble:'The Curator’s glasses slip...',die:'The label gun clicks empty. He looks at his own white gloves, and then, carefully, takes one off. He has never touched anything in his life.',
    rest:['...is it all right if I touch it? Is it all right?','I have been told to look and not touch since 1987.'],
    talk:['I catalog. I do not decide.','Please step back from the exhibit. Please. I mean it kindly.'],
    again:['Do not touch. Round two.','Round {n}. Still cataloguing.'],
    drop:{id:'prioritytag',chance:.4,msg:'The Curator peeled off one label and handed it over. It said PRIORITY. He had never given anybody anything before.'},
    vapor:['#8e8e9a','#f4f0e6','#d9503f','#2c2c36'],
    hint:'A museum guard with a label gun. Every third turn he labels one person NOT FOR SALE (PEP down). Kinetic and Chatter work; he loves Tom’s starter and Rose’s SILLY.'}
});
// Map spots: the lower stairwell (floors 2 to 30) and the shelf hall (floors 30 to 36). The boss waits in the vault (data/scenes-ch17.js, ch17Vault).
const CH17_STAIR_SPOTS=[['pausesprite',10,39],['paperweight',8,34],['curator',6,29],['pausesprite',10,24],['paperweight',7,19],['curator',11,14],['pausesprite',6,9]];
const CH17_SHELF_SPOTS=[['paperweight',7,6],['curator',13,5],['pausesprite',19,8],['curator',23,6],['paperweight',16,8]];
const CH17_VAULT_SPOTS=[['twinlens',10,4]];
