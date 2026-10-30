'use strict';
// data/p2-monsters.js — Chapter 11 monsters (Part 2 opens): the Endless Concourse of Terminal Infinity, where every
// delay, lost bag and standby list ever left is still waiting. Same shape as data/monsters.js. Friction Sprites of
// air travel, easiest to hardest: Lost Luggage (a teal suitcase with a sock for a tongue; steals a bag item),
// Red-Eye (a sleepy night-flight in a nightcap; yawns people Drowsy), Standby Sprite (a gate-agent gremlin with a
// clipboard; pushes a member down the turn ribbon). Battle numbers: data/p2-battle.js. FINAL CALL (the boss) is C11b.
// Loaded after data/terminal-monsters.js. Sprites are drawn here from simple shapes (no art sheet yet): when Tom sends
// art for these three, replace the *_SPRITE rows and *_PAL only.
const p2Canvas=(w,h)=>{
  const g=Array.from({length:h},()=>Array(w).fill('.'));
  const A={g,w,h,
    set(x,y,c){ x=Math.round(x); y=Math.round(y); if(x>=0&&y>=0&&x<w&&y<h) g[y][x]=c; },
    rect(x,y,rw,rh,c){ for(let j=0;j<rh;j++) for(let i=0;i<rw;i++) A.set(x+i,y+j,c); },
    ell(cx,cy,rx,ry,c){ for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++) for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++) { const dx=(x-cx)/rx,dy=(y-cy)/ry; if(dx*dx+dy*dy<=1) A.set(x,y,c); } },
    poly(pts,c){ let y0=Infinity,y1=-Infinity; for(const p of pts) { y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); }
      for(let y=Math.ceil(y0);y<=Math.floor(y1);y++) { const xs=[]; for(let i=0;i<pts.length;i++) { const a=pts[i],b=pts[(i+1)%pts.length]; if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y)) xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
        xs.sort((p,q)=>p-q); for(let i=0;i+1<xs.length;i+=2) for(let x=Math.round(xs[i]);x<=Math.round(xs[i+1]);x++) A.set(x,y,c); } },
    line(x0,y0,x1,y1,c){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1; for(let i=0;i<=n;i++) A.set(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c); },
    glyph(ch,x,y,c){ const G=P2_GLYPH[ch]; if(!G) return; G.forEach((row,j)=>{ for(let i=0;i<row.length;i++) if(row[i]==='1') A.set(x+i,y+j,c); }); },
    outline(c){ const o=g.map(r=>r.slice()); for(let y=0;y<h;y++) for(let x=0;x<w;x++) { if(g[y][x]!=='.') continue;
      if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{ const v=(g[y+dy]||[])[x+dx]; return v&&v!=='.'; })) o[y][x]=c; }
      for(let y=0;y<h;y++) g[y]=o[y]; },
    rows(){ return g.map(r=>r.join('')); }};
  return A;
};
const P2_GLYPH={'?':['111','001','011','000','010'],'S':['111','100','111','001','111'],'1':['010','110','010','010','111'],'7':['111','001','010','010','010'],'Z':['111','001','010','100','111']};

// ---- Lost Luggage: a teal suitcase, one sock out of the zipper, a tag that says ? ----
const LUGGAGE_PAL={o:'#1d2a30',b:'#3f8f8f',B:'#62b5ae',d:'#2a6670',s:'#245a60',g:'#e8c84a',w:'#f4f0e6',k:'#1d2a30',r:'#d9503f',p:'#e88aa8',y:'#f2d65a',n:'#78c28a',m:'#9a6a3c'};
const LUGGAGE_SPRITE=(()=>{
  const c=p2Canvas(46,48);
  c.rect(7,16,32,24,'b'); for(const [x,y] of [[7,16],[38,16],[7,39],[38,39]]) c.set(x,y,'.');
  c.rect(8,16,30,4,'B'); c.rect(8,36,30,3,'d');
  c.rect(9,16,3,23,'s'); c.rect(34,16,3,23,'s');
  c.rect(19,10,8,2,'k'); c.rect(18,11,2,6,'k'); c.rect(26,11,2,6,'k');       // handle
  c.rect(21,17,4,3,'g'); c.set(22,18,'k'); c.set(23,18,'k');                   // latch
  c.ell(10,32,2,2,'y'); c.set(10,32,'r'); c.rect(31,33,4,3,'n'); c.set(33,34,'w'); // stickers
  c.ell(18,25,3.3,4.3,'w'); c.ell(28,25,3.3,4.3,'w');                          // eyes
  c.ell(17,26,1.7,2.2,'k'); c.ell(27,26,1.7,2.2,'k'); c.set(16,25,'w'); c.set(26,25,'w');
  c.line(14,19,20,21,'k'); c.line(32,19,26,21,'k');                              // worried brows
  for(let x=14;x<=32;x++) { c.set(x,33,'k'); if(x%2===0) c.set(x,34,'w'); }   // zipper mouth with teeth
  c.rect(27,33,3,8,'w'); for(let y=34;y<=39;y+=2) c.rect(27,y,3,1,'p'); c.set(28,40,'p');   // sock tongue
  c.ell(13,43,3.3,3.3,'k'); c.ell(33,43,3.3,3.3,'k'); c.set(13,43,'m'); c.set(33,43,'m');  // wheels
  c.line(7,22,3,20,'k'); c.rect(0,20,6,9,'w'); c.rect(0,20,6,1,'g'); c.glyph('?',1,22,'r'); // the luggage tag
  c.outline('o'); return c.rows();
})();
// ---- Red-Eye: a sleepy night-flight with a nightcap and bags under its eyes ----
const REDEYE_PAL={o:'#161a40',b:'#3d4392',B:'#6a73c8',d:'#2a2f6a',w:'#f4f0e6',k:'#161a40',r:'#e04a4a',R:'#c0303a',y:'#f2d65a',p:'#e88aa8',v:'#5a3a8a',s:'#a8b0f0'};
const REDEYE_SPRITE=(()=>{
  const c=p2Canvas(52,46);
  c.poly([[9,22],[4,8],[14,8],[17,20]],'d'); c.poly([[9,22],[6,12],[12,12],[15,20]],'r');   // tail fin
  c.poly([[22,26],[12,42],[26,42],[34,26]],'d');                                            // far wing
  c.ell(26,24,19,9,'b'); c.ell(26,28,18,5,'B'); c.ell(42,25,8,7,'b');                      // fuselage and nose
  c.poly([[24,28],[16,44],[30,44],[38,28]],'B'); c.rect(18,40,10,1,'s');                    // near wing
  for(const x of [13,19,25,31]) { c.rect(x,20,3,3,'y'); c.set(x,20,'w'); }                    // cabin windows
  c.ell(38,21,4.2,5,'w'); c.ell(46,22,3.6,4.6,'w');                                         // two big tired eyes
  c.rect(34,17,10,3,'b'); c.rect(43,18,8,3,'b');                                            // droopy lids
  c.ell(39,23,1.7,2.2,'k'); c.ell(47,24,1.5,2,'k');
  c.line(36,22,37,24,'r'); c.line(45,21,44,23,'r'); c.line(47,21,46,22,'r');                // bloodshot
  c.line(35,26,41,26,'v'); c.line(43,27,49,27,'v');                                         // bags under the eyes
  c.ell(44,32,3,2.4,'k'); c.rect(43,33,3,1,'p');                                            // a huge yawn
  c.poly([[28,13],[40,15],[18,4]],'R'); c.ell(17,4,3,3,'w'); c.rect(25,13,16,2,'w');        // nightcap
  c.glyph('Z',44,3,'w'); c.glyph('Z',48,0,'s');
  c.outline('o'); return c.rows();
})();
// ---- Standby Sprite: a yellow gate-agent gremlin with a clipboard, a STANDBY paddle and ticket 17 ----
const STANDBY_PAL={o:'#2a2210',y:'#f2c75a',Y:'#fbe08a',d:'#c89a30',n:'#2f4a8a',g:'#e8e0a0',w:'#f4f0e6',k:'#1d1a14',r:'#d9503f',t:'#8a6a42'};
const STANDBY_SPRITE=(()=>{
  const c=p2Canvas(44,50);
  c.line(14,6,10,0,'k'); c.ell(10,0,1.6,1.6,'r'); c.line(28,6,32,0,'k'); c.ell(32,0,1.6,1.6,'r');   // antennae
  c.ell(21,31,11,13,'y'); c.ell(21,34,8,9,'Y');                                                    // body
  c.ell(21,16,11,9,'y'); c.ell(19,13,6,4,'Y');                                                     // head
  c.rect(11,5,21,4,'n'); c.rect(9,8,26,2,'n'); c.rect(19,6,5,2,'g');                               // agent cap with a badge
  c.ell(16,16,3.6,4.2,'w'); c.ell(26,16,3.6,4.2,'w'); c.ell(17.5,17,1.7,2.2,'k'); c.ell(27.5,17,1.7,2.2,'k'); // eyes, sneaking a look sideways
  c.line(14,10,19,12,'k'); c.line(28,10,24,12,'k'); c.line(18,23,24,23,'k'); c.set(17,22,'k'); c.set(25,22,'k');   // worried face
  c.rect(16,28,10,8,'w'); c.rect(16,28,10,1,'r'); c.glyph('1',18,30,'k'); c.glyph('7',22,30,'k');  // ticket number 17
  c.rect(1,24,11,15,'t'); c.rect(2,26,9,12,'w'); c.rect(4,23,5,3,'g'); for(const y of [28,31,34]) c.rect(3,y,7,1,'k'); // clipboard
  c.line(12,30,9,32,'y'); c.line(12,31,9,33,'y');                                                  // arm to the clipboard
  c.rect(34,14,10,9,'r'); c.rect(35,15,8,7,'w'); c.glyph('S',37,16,'r'); c.line(39,23,36,38,'k'); c.line(32,28,36,22,'y'); c.line(33,29,37,23,'y'); // STANDBY paddle
  c.rect(14,43,4,5,'y'); c.rect(25,43,4,5,'y'); c.rect(12,47,7,3,'k'); c.rect(24,47,7,3,'k');       // legs and shoes
  c.outline('o'); return c.rows();
})();

// ---- FINAL CALL: the chapter 11 boss. A departures board on robot legs; every flap says ON TIME or DELAYED, never GONE ----
const FINALCALL_PAL={o:'#1a1428',b:'#3a2f58',B:'#5a4a86',d:'#241c3c',g:'#f2c75a',G:'#fbe08a',w:'#f4f0e6',k:'#161018',r:'#d9503f',s:'#9aa0b8',S:'#6a7088',y:'#e8c84a'};
const FINALCALL_SPRITE=(()=>{
  const c=p2Canvas(60,64);
  c.line(30,0,30,5,'s'); c.ell(30,0,2,2,'r');                                                  // beacon
  c.rect(4,5,52,38,'b'); c.rect(4,5,52,3,'B'); c.rect(4,40,52,3,'d'); c.rect(4,5,3,38,'d'); c.rect(53,5,3,38,'d');   // the board
  c.rect(8,9,44,30,'k');                                                                         // screen
  for(const y of [11,19,27,35]) { c.rect(10,y,40,6,'d'); for(let x=12;x<48;x+=5) c.rect(x,y+1,4,4,'k'); c.rect(11,y+3,38,1,'S'); }   // split-flap rows
  c.rect(10,11,18,6,'g'); c.glyph('1',12,11,'k'); c.glyph('7',16,11,'k'); c.rect(32,11,16,6,'g');   // lit row: a gold ticket
  c.ell(20,26,5,5,'w'); c.ell(40,26,5,5,'w'); c.ell(21,27,2.4,3,'k'); c.ell(41,27,2.4,3,'k'); c.set(20,25,'w'); c.set(40,25,'w');   // two sad eyes
  c.line(14,21,24,23,'k'); c.line(46,21,36,23,'k');                                              // worried brows
  c.line(24,35,36,35,'k'); c.set(23,34,'k'); c.set(37,34,'k');                                  // a small hopeful frown
  c.rect(26,43,8,3,'S');                                                                         // neck
  c.rect(14,46,32,8,'B'); c.rect(14,46,32,2,'G'); c.rect(14,52,32,2,'d');                        // hips
  c.rect(17,54,7,7,'s'); c.rect(36,54,7,7,'s'); c.rect(14,60,13,4,'k'); c.rect(33,60,13,4,'k');  // robot legs and feet
  c.rect(1,18,3,22,'s'); c.rect(56,18,3,22,'s'); c.ell(2,41,2.5,2.5,'S'); c.ell(57,41,2.5,2.5,'S'); // arms
  c.rect(0,12,5,5,'g'); c.set(2,14,'k');                                                         // a tiny gold bell
  c.outline('o'); return c.rows();
})();
Object.assign(MONSTERS,{
  finalcall:{id:'finalcall',coins:90,coinStep:10,name:'FINAL CALL',the:'FINAL CALL',short:'FINAL CALL',sprite:FINALCALL_SPRITE,pal:FINALCALL_PAL,scale:4,eyes:[[20,26],[40,26]],mouth:[30,35],
    hp:150,hpStep:12,atk:4,xp:70,xpStep:8,level:15,rank:'BOSS',
    intro:'The departures board at Gate Infinity unfolds onto two robot legs. Every flap says ON TIME. One flap, in the corner, says NOT YET.',
    attacks:['FINAL CALL slaps {t} with a row of flaps.','FINAL CALL flips {t}’s name to DELAYED.','FINAL CALL crackles static at {t}.'],
    special:{name:'CANCELLED',every:4,kind:'all',msg:'CANCELLED! FINAL CALL flips every flap to a single word!'},
    wobble:'FINAL CALL’s flaps stutter...',die:'The flaps slow down, click, click, and settle on ON TIME. All of them. It sits down on the carpet.',
    rest:['...now boarding. Now boarding. Please. Somebody.','Every other town is happy. That is the whole job.'],
    talk:['I have never once got to fly. I only call it.','Paused is safe. Nobody is late. Nobody is lost.'],
    again:['DING. Final call. Please have your pass ready.','Round {n}. Still boarding.'],
    vapor:['#f2c75a','#3a2f58','#9aa0b8','#d9503f'],
    hint:'The boss of Gate Infinity. It calls someone each turn: act before its next turn or the gate closes. Tom can DEFEND them, and ▼ Bag, BENCH CALL pulls a benched friend in.'},
  lostluggage:{id:'lostluggage',coins:22,coinStep:3,name:'Lost Luggage',the:'the Lost Luggage',short:'Lost Luggage',sprite:LUGGAGE_SPRITE,pal:LUGGAGE_PAL,scale:3,eyes:[[18,25],[28,25]],mouth:[23,33],
    hp:36,hpStep:5,atk:3,xp:22,xpStep:3,level:12,rank:'TRICKY',
    intro:'A teal suitcase wheels itself out of the crowd. A sock hangs out of its zipper. Its tag says ? in marker.',
    attacks:['The Lost Luggage rolls over {t}’s foot.','The Lost Luggage swings its handle at {t}.','The Lost Luggage asks {t} to please identify it.'],
    special:{name:'Rummage',every:3,kind:'one',msg:'RUMMAGE! The Lost Luggage digs through somebody’s bag!'},
    wobble:'The Lost Luggage lists to one side...',die:'It zips itself shut, rolls up to the Lost and Found, and waits very politely.',
    rest:['...it’s mine. It’s probably mine. Is it mine?','Please. Check the tag. Somebody must have the other half.'],
    talk:['Nobody has asked for me in a very long time. I stopped asking, too.','I have a sock. It isn’t mine. I’m keeping it anyway.'],
    again:['Back on the belt! Round two!','Round {n}. Still unclaimed.'],
    drop:{id:'pretzels',chance:.5,msg:'The Lost Luggage coughed up a bag of pretzels from the bottom of its zipper.'},
    vapor:['#3f8f8f','#62b5ae','#e8c84a','#f4f0e6'],
    hint:'Lost and grabby. It rummages through somebody’s bag every third turn and leaves them squashed. Kinetic and Chatter work; it loves Rose’s RASPBERRY and Grace’s SQUISHY.'},
  redeye:{id:'redeye',coins:22,coinStep:4,name:'Red-Eye',the:'the Red-Eye',short:'Red-Eye',sprite:REDEYE_SPRITE,pal:REDEYE_PAL,scale:3,eyes:[[38,21],[46,22]],mouth:[44,32],
    hp:35,hpStep:5,atk:3,xp:22,xpStep:4,level:13,rank:'TRICKY',
    intro:'A little night-flight in a nightcap drifts down the concourse, rubbing both eyes. It has been up since 2019.',
    attacks:['The Red-Eye yawns right at {t}.','The Red-Eye drifts into {t}. It was asleep.','The Red-Eye gives {t} a very tired look.'],
    special:{name:'Overnight',every:3,kind:'one',msg:'OVERNIGHT! The Red-Eye yawns a whole night into somebody!'},
    wobble:'The Red-Eye’s lids droop...',die:'It tucks its nightcap over its eyes and sleeps on a row of seats, right through the boarding call.',
    rest:['...five more minutes. Five more years.','Is it morning? It’s still tonight. It’s always tonight.'],
    talk:['I left at midnight and landed at midnight. I don’t know where the time went.','Everyone gets off. I just keep going.'],
    again:['Yaaawn. Round two.','Round {n}. Still not sure what time it is.'],
    drop:{id:'coldbrew',chance:.5,msg:'The Red-Eye left a cold brew behind. It had two. Neither helped.'},
    vapor:['#3d4392','#6a73c8','#e04a4a','#f4f0e6'],
    hint:'Dozy. It yawns one person Drowsy (PEP down) and a lot of it hits hard. Sparkle and Cozy work. DANCE and bedtime stories send it home happy.'},
  standbysprite:{id:'standbysprite',coins:24,coinStep:4,name:'Standby Sprite',the:'the Standby Sprite',short:'Standby Sprite',sprite:STANDBY_SPRITE,pal:STANDBY_PAL,scale:3,eyes:[[16,16],[26,16]],mouth:[21,23],
    hp:38,hpStep:5,atk:3,xp:24,xpStep:4,level:13,rank:'TOUGH',
    intro:'A gate-agent gremlin steps out with a clipboard and a STANDBY paddle. It is holding ticket number 17. It has been 17 since 1998.',
    attacks:['The Standby Sprite pokes {t} with the clipboard.','The Standby Sprite waves the paddle at {t}.','The Standby Sprite tells {t} they are number 18 on the list.'],
    special:{name:'Wait List',every:3,kind:'one',msg:'WAIT LIST! The Standby Sprite moves somebody to the back of the line!'},
    wobble:'The Standby Sprite checks its list...',die:'It crosses its own name off the list, very slowly, and gets on the next flight.',
    rest:['...seventeen. It’s seventeen. They’ll call seventeen.','Please remain seated until your number is called.'],
    talk:['I got a seat once. Then somebody bigger got it.','Everyone else gets on. I just keep track of who doesn’t.'],
    again:['Back of the list! Round two!','Round {n}. Still on standby.'],
    drop:{id:'prioritytag',chance:.4,msg:'The Standby Sprite handed over a PRIORITY tag. Then asked for it back. Then did not.'},
    vapor:['#f2c75a','#2f4a8a','#d9503f','#f4f0e6'],
    hint:'Fussy. It pushes somebody to the back of the turn ribbon every third turn. Splash and Kinetic work; it loves Amy’s PEP TALK and TNB’s WARDROBE.'}
});
// Map spots. Endless Concourse: a Standby Sprite holds the way east until it is beaten (data/scenes-p2.js); Lost Luggage
// and Red-Eyes drift round the rest.
const P2_CONCOURSE_SPOTS=[['finalcall',34,9],['standbysprite',23,6],['lostluggage',9,5],['lostluggage',12,10],['redeye',16,9],['lostluggage',27,9],['redeye',30,9]];
