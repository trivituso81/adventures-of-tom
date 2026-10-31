'use strict';
// engine/nara.js — Nara, cousin Olivia's Labradoodle (Olivia and Michael's dog; their kids are Lachlan, 4, and Isla, 1).
// 40 pounds, seven years old, playful and full of energy. Loves fetch. Separation anxiety. Very picky eater. Pees when she gets too excited.
// She roams Jefferson Park in Los Angeles. The first time Tom gets close she spots him and comes running (meeting scene),
// then she can join the party (alongside TNB; she stays in LA). This file holds her attacks, her special PUPPY DOG EYES (formerly PUPPY EYES), the meeting scene,
// her overworld talk, the excited-puddle decal, and her travel line. Sprites live in data/nara.js; stats, moves and gear in data/party.js.
// Battle rules for her traits live in engine/battle.js (picky items, frantic when Tom is down, victory puddle).
// Loaded after engine/travel.js.
RECRUIT_MOVES.nara={};
(function(){
const SC=RFX.SC,{scene,hold,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const appr=(fx,d)=>{ fx.appr=d; fx.apprDur=d; };
const run=(fx,d,passes)=>{ fx.run=d; fx.runDur=d; fx.runPasses=passes; };
const hit=E2=>landHit(E2.dmg,E2.crit);
const part=(E2,n,k)=>landHit(Math.max(1,Math.round(E2.dmg/n)),E2.crit&&k===n-1);
const home=E2=>({x:BATTLE_POS[E2.i].x*3,y:BATTLE_POS[E2.i].base*3});
const mouth=E2=>{ const a=battle.actorHand; if(a) return {x:a.n[0],y:a.n[1]}; const h=home(E2); return {x:h.x-30,y:h.y-40}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const confuseMaybe=c=>{ if(!battle.missing&&Math.random()<c+(battle.enemy.def.confuseBonus||0)) { battle.enemyStunned=2; sfx.stun(); return true; } return false; };
const N=RECRUIT_MOVES.nara;

// ================= Sounds =================
sfx.bark=sfx.bark||function(d=0){ tone({type:'square',f0:620,f1:380,dur:.09,vol:.07,delay:d}); tone({type:'triangle',f0:460,f1:300,dur:.1,vol:.06,delay:d+.02}); };
sfx.squeak=sfx.squeak||function(d=0){ tone({type:'sine',f0:1400,f1:2200,dur:.08,vol:.07,delay:d}); tone({type:'sine',f0:2200,f1:1500,dur:.08,vol:.06,delay:d+.08}); };
sfx.howl=sfx.howl||function(){ tone({type:'triangle',f0:420,f1:780,dur:.5,vol:.07}); tone({type:'triangle',f0:780,f1:620,dur:.9,vol:.07,delay:.5}); };
sfx.whine=sfx.whine||function(){ tone({type:'sine',f0:900,f1:1250,dur:.35,vol:.05}); tone({type:'sine',f0:1250,f1:820,dur:.45,vol:.05,delay:.35}); };
const barks=(n,gap=.14)=>{ for(let k=0;k<n;k++) sfx.bark(k*gap); };

// ================= Props and scenes =================
PROP2.tball=(q,u)=>{ if(PROPART.draw('nara/tennis_ball',0,0,{h:24})) return; E(0,0,10,10,OUT); E(0,0,8,8,'#d8ef4a'); E(-2,-2,3,3,'#f2ffa0'); gfx.strokeStyle='#fff8e8'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(-9,0,9,-.9,.9); gfx.stroke(); gfx.beginPath(); gfx.arc(9,0,9,Math.PI-.9,Math.PI+.9); gfx.stroke(); };
// Muddy paw prints stamped across the enemy.
SC.paws=(s,u)=>{ gfx.globalAlpha=env(u,.05,.75); const n=s.n||4; for(let k=0;k<n;k++) { if(u<k/(n+2)) continue; const x=GX-40+k*24+(k%2)*6,y=200-k*10+(k%2)*14; E(x,y,7,6,'#5a3a24'); for(let t=0;t<3;t++) E(x-6+t*6,y-9,2.6,2.6,'#5a3a24'); } };
// Hearts drifting up around Nara (puppy eyes).
SC.pupHearts=(s,u)=>{ const p=battle.fx&&BATTLE_POS[s.i]; if(!p) return; const cx=p.x*3,by=p.base*3-60; for(let k=0;k<6;k++) { const ph=(u*1.8+k/6)%1; gfx.globalAlpha=(1-ph)*env(u,.1,.85); label('<3',cx-36+k*14+Math.round(Math.sin(s.t*5+k)*6),by-Math.round(ph*60),k%2?'#ff9ac0':'#ffd3e0',2); } };
// Big shiny eyes over the enemy's head, so you can see what it is looking at.
SC.bigEyes=(s,u)=>{ gfx.globalAlpha=env(u,.12,.8); const x=GX+90,y=120; R(x-34,y-18,68,36,OUT); R(x-32,y-16,64,32,'#fff1cb'); for(const ex of [x-14,x+14]) { E(ex,y,11,12,OUT); E(ex,y,9,10,'#3a2418'); E(ex-3,y-4,3.4,3.4,'#ffffff'); E(ex+3,y+3,1.6,1.6,'#ffffff'); } };
// A pale puddle under someone. i: party slot (Nara herself after a win), or the enemy when i is undefined.
SC.naraPuddle=(s,u)=>{ const p=s.i!=null&&BATTLE_POS[s.i]; const x=p?p.x*3+4:GX,y=p?p.base*3+2:266,r=(s.r||(p?26:80))*Math.min(1,u/.3); gfx.globalAlpha=env(u,.05,.8)*.8; E(x,y,r,r*.22,'#e9e07a'); E(x-r*.2,y-1,r*.55,r*.12,'#f6f0b0'); };
// The tug rope: from Nara's mouth to the enemy, yanked back and forth.
SC.tugrope=(s,u)=>{ const m=s.from,yank=Math.sin(s.t*12)*6,mx=m.x,my=m.y,ex=GX+30+yank,ey=212; gfx.globalAlpha=env(u,.05,.92);
  gfx.strokeStyle=OUT; gfx.lineWidth=8; gfx.beginPath(); gfx.moveTo(mx,my); gfx.quadraticCurveTo((mx+ex)/2,(my+ey)/2+14-Math.abs(yank),ex,ey); gfx.stroke();
  gfx.strokeStyle='#e04a5a'; gfx.lineWidth=4; gfx.setLineDash([8,6]); gfx.beginPath(); gfx.moveTo(mx,my); gfx.quadraticCurveTo((mx+ex)/2,(my+ey)/2+14-Math.abs(yank),ex,ey); gfx.stroke();
  gfx.strokeStyle='#4a9ae0'; gfx.lineDashOffset=7; gfx.beginPath(); gfx.moveTo(mx,my); gfx.quadraticCurveTo((mx+ex)/2,(my+ey)/2+14-Math.abs(yank),ex,ey); gfx.stroke(); gfx.setLineDash([]); gfx.lineDashOffset=0;
  E(ex,ey,9,9,OUT); E(ex,ey,7,7,'#e04a5a'); };
// Water flung off a wet dog, in a fan toward the enemy.
SC.shakeSpray=(s,u)=>{ const h=s.from; for(let k=0;k<(s.n||18);k++) { const a=rr(s,k),b=rr(s,k+9),ang=Math.PI*(.85+a*.5),d=u*(140+b*120); const x=h.x+Math.cos(ang)*d,y=h.y-40+Math.sin(ang)*d*.5+u*u*60; gfx.globalAlpha=1-u*.8; E(x,y,3,4,k%2?'#8fd0ff':'#e6f7ff'); } };
// Sound rings rolling out of the howl.
SC.howlRings=(s,u)=>{ const h=s.from; for(let k=0;k<4;k++) { const q=(u*2+k/4)%1; gfx.globalAlpha=(1-q)*env(u,.05,.85); gfx.strokeStyle=k%2?'#c9b3e6':'#fff1cb'; gfx.lineWidth=4; const r=20+q*220; gfx.beginPath(); gfx.arc(h.x-10,h.y-46,r,Math.PI*.8,Math.PI*1.2); gfx.stroke(); } };
// The squirrel: dashes across the battlefield; Nara is right behind it.
SC.squirrel=(s,u)=>{ const q=(u*(s.passes||3))%1,dir=Math.floor(u*(s.passes||3))%2?1:-1,x=dir<0?lerp(560,20,q):lerp(20,560,q),y=244-Math.abs(Math.sin(q*Math.PI*6))*18;
  gfx.save(); gfx.translate(x,y); gfx.scale(-dir,1);
  E(14,-14,12,16,OUT); E(14,-14,10,14,'#a8642e'); E(12,-18,5,8,'#d08a4a');                     // tail
  E(-2,-4,13,9,OUT); E(-2,-4,11,7,'#8a5226'); E(-12,-10,7,7,OUT); E(-12,-10,5.5,5.5,'#8a5226'); // body, head
  R(-15,-19,4,5,OUT); R(-14,-18,2,3,'#8a5226'); E(-15,-11,1.6,1.6,'#111'); E(-8,-1,3,2,'#d9b98a'); // ear, eye, belly
  gfx.restore(); };

// ================= Attacks =================
N.basic=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage(pick(['Nara jumps up to say hello. With all four paws.','Nara is SO happy to meet the Grump. Paws first.'])); appr(fx,1.6); barks(2); say(m.id,'basic',.2); },
    700,()=>{ pose(fx,'celeb',.6); fx.punch=.35; battle.slash=.2; sfx.thud(); scene('paws',1.4,{n:4}); scene('burst',.4,{x:210,y:214,c:'#d8b384'}); bt('HI HI HI',96,32,'#fff1cb',3,.9); hit(E2); },
    800,E2.result+' Muddy paw prints everywhere.',()=>checkEnemy()); };
N.fetch=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara drops a ball at Tom’s feet. Tom throws it. Right at the Grump.'); pose(fx,'sit',1); sfx.squeak(); say(m.id,'fetch',.2); },
    700,()=>{ const h=home(E2); toss('tball',h.x-80,h.y-90,GX+10,206,0,.6,90); sfx.whoosh(); },
    600,()=>{ sfx.bonk(); battle.shakeEnemy=.3; scene('burst',.4,{x:GX+10,y:206,c:'#d8ef4a'}); part(E2,2,0); bt('BONK',96,34,'#d8ef4a',3,.8); },
    200,()=>{ run(fx,1.2,1); sfx.run(); barks(3,.12); },
    560,()=>{ battle.slash=.2; sfx.slash(); part(E2,2,1); battle.enemyKnock=.35; scene('dust',.6,{x:GX+20,y:262,n:6}); },
    900,()=>{ pose(fx,'celeb',.9); sfx.squeak(); },E2.result+' She got the ball. She\'d like to go again.',()=>checkEnemy()); };
N.zoomies=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara gets the zoomies. Nobody knows why. Not even Nara.'); run(fx,2.6,4); sfx.run(); say(m.id,'zoomies'); for(let k=0;k<8;k++) scene('dust',.5,{x:100+(k%4)*110,y:262,n:4,delay:k*.3}); },
    ...[0,1,2,3].flatMap(k=>[k===0?420:620,()=>{ battle.slash=.18; sfx.slash(); sfx.bark(); bt('ZOOM',60+k*30,30+(k%2)*10,'#9fe8ff',3,.6); part(E2,4,k); }]),
    900,()=>{ pose(fx,'celeb',.8); },E2.result+' She\'s panting. She\'s thrilled.',()=>checkEnemy()); };
N.puddle=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara gets SO excited about the Grump. Too excited.'); appr(fx,2.4); barks(4,.1); say(m.id,'puddle',.3); },
    760,()=>{ fx.cheer=1.2; sfx.giggle&&sfx.giggle(); },
    700,()=>{ scene('naraPuddle',2.6,{}); sfx.splat(); bt('OOPS',96,32,'#e9e07a',4,1); },
    600,()=>{ battle.enemyKnock=.5; battle.shakeEnemy=.45; sfx.thud(); scene('splashw',.6,{x:GX,y:250,c:'#e9e07a',c2:'#f6f0b0',n:10,sp:80}); hit(E2); confuseMaybe(.3); },
    700,()=>setMessage(E2.result+(battle.enemyStunned===2?' The Grump slips. It\'s very confused about what just happened.':' The Grump steps in it. It\'s not happy.')),1300,()=>checkEnemy()); };
N.tug=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara grabs the Grump by something. Tug of war. Nara never loses tug of war.'); appr(fx,3.2); say(m.id,'tug',.3); },
    700,()=>{ pose(fx,'aim',2.4); scene('tugrope',2.4,{from:mouth(E2)}); sfx.growl?sfx.growl():sfx.sulk(); },
    ...[0,1,2].flatMap(k=>[k===0?500:600,()=>{ battle.enemyKnock=.25; battle.shakeEnemy=.3; sfx.thud(); bt(['TUG','TUG','YANK'][k],96,30+k*6,'#ffb070',3,.6); part(E2,3,k); }]),
    800,E2.result+' She won. She always wins.',()=>checkEnemy()); };
N.shake=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara jumps in a puddle. Then she walks right up to the Grump and shakes.'); appr(fx,2.6); say(m.id,'shake',.3); sfx.splat(); },
    720,()=>{ fx.tickle=1.4; const h=mouth(E2); for(let k=0;k<3;k++) scene('shakeSpray',.8,{from:{x:h.x+30,y:h.y+40},delay:k*.35,n:20}); sfx.whoosh(); bt('BRRRRR',96,32,'#9fe8ff',3,1.2); },
    1100,()=>{ battle.shakeEnemy=.5; sfx.splat(); scene('splashw',.6,{x:GX,y:206,n:12,sp:90}); hit(E2); },
    800,E2.result+' Everything smells like wet dog now. Everything.',()=>checkEnemy()); };
N.howl=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara thinks Tom might leave. Without her. She can\'t handle it.'); pose(fx,'sit',3); sfx.whine(); scene('dark',3,{a:.35}); },
    800,()=>{ say(m.id,'howl'); sfx.howl(); scene('howlRings',2,{from:mouth(E2)}); bt('AWOOOO',96,30,'#c9b3e6',4,1.6); },
    1300,()=>{ battle.shakeEnemy=.6; battle.flashEnemy=.3; sfx.thud(); hit(E2); confuseMaybe(.35); },
    700,()=>setMessage(E2.result+(battle.enemyStunned===2?' The Grump feels terrible. And very confused.':' Tom didn\'t leave. He\'d never.')),1200,()=>checkEnemy()); };
N.squirrel=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara freezes. Ears up. Something moved.'); pose(fx,'idle2',1.1); bt('!',150,40,'#ffe08a',5,1); sfx.ding(); },
    1000,()=>{ setMessage('SQUIRREL!'); say(m.id,'squirrel'); scene('squirrel',3.2,{passes:4}); run(fx,3.2,4); sfx.run(); barks(6,.16); bt('SQUIRREL!',96,30,'#ffb070',4,1.4); },
    ...[0,1,2,3].flatMap(k=>[k===0?500:700,()=>{ battle.slash=.2; sfx.slash(); scene('dust',.5,{x:GX+(k%2?30:-30),y:262,n:5}); part(E2,4,k); }]),
    700,()=>{ battle.enemyKnock=.5; battle.flashEnemy=.4; sfx.fanfare(); scene('confetti',1.4,{x0:70,x1:290,n:34}); scene('ring',.6,{x:GX,y:264,r:90}); },
    900,E2.result+' The squirrel got away. The Grump didn\'t.',()=>checkEnemy()); };

// ================= Special: PUPPY DOG EYES (key puppy) =================
// Nara sits and looks up. The enemy is Smitten and skips its next turn (E2.apply rolls it; bosses resist more).
N.puppy=E2=>{ const {i,m,fx}=E2; const t=E2.targets[0];
  pose(fx,'sit',2.2); sfx.whine(); say(m.id,'puppy',.2);
  scene('pupHearts',2.2,{i}); scene('bigEyes',1.8,{});
  enqueue('Nara sits. Head tilt. Big brown eyes.',
    900,()=>{ E2.apply(); if(t&&t.st.smitten) { sfx.stun(); bt('AWWW',96,32,'#ff9ac0',4,1.2); setMessage(cap(t.def.the)+' melts. It can\'t attack something that cute next turn.'); }
      else setMessage(t?cap(t.def.the)+' looks away on purpose. It\'s seen this trick before.':'Nobody is looking.'); },
    1300,()=>checkEnemy());
};
})();

// ================= Option 3 Primary kit (phase 4) =================
// Cards: adventures-of-tom-ability-revamp.md (Nara). Set-piece standard (status.md, "animation quality pass"): every
// move is 3.5 to 5 s and Nara performs it (trots over, sits, tugs, streaks, shakes), with the card's props added.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes here are real-coordinate (na_, no warp).
// Nara never speaks words: her lines are barks; the narration carries the meaning.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const poly=(pts,c,o=true)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const N=RECRUIT_MOVES.nara;
const CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',BALL='#d8ef4a',JERKY='#a8582e',WATER='#8fd0ff',RED='#e0402e',WOOD='#b88848';
ST.nw('na_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe');
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const mouth=()=>ST.hand();
const barks=(n,gap=.14)=>{ for(let k=0;k<n;k++) sfx.bark(k*gap); };
const hitAll=list=>{ for(const f of list) ST.jolt(f,.4); landHit(100); };
// Nara stands just right of someone, facing them (her sprites face left). Herself: her own spot.
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:u.x+u.w*.5+(t.side==='foe'?34:26),y:u.base+3}; };
const wag=(u,tt)=>Math.sin(tt*26)*.07;

// ---------- Props ----------
const ball=(x,y,r=8)=>{ if(PROPART.draw('nara/tennis_ball',x,y,{h:(r+2)*2.2})) return; E(x,y,r+2,r+2,OUT); E(x,y,r,r,BALL); E(x-r*.3,y-r*.3,r*.35,r*.35,'#f2ffa0'); gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(x-r,y,r,-.9,.9); gfx.stroke(); };
SC.na_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*8,s.c||CREAM,s.sc||1); };
SC.na_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||28); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||'#d8b384'); } };
SC.na_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||40,s.ry||56,s.c||'#ffd27a'); };
SC.na_hearts=(s,u)=>{ for(let k=0;k<(s.n||3);k++) { const q=cl(u*1.2-k*.15); gfx.globalAlpha=(1-q)*fin(u,.1); heart(s.x-12+k*12,s.y-q*40,5,k%2?PINK:'#ffd3e0'); } };
SC.na_coins=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.3-k*.06),x=s.x+(k-2)*12*q*2,y=s.y-Math.sin(q*Math.PI)*36+q*30; gfx.globalAlpha=1-cl((u-.7)/.3); EO(x,y,5,5,'#ffd24a'); R(x-1,y-3,2,6,'#c99a20'); } };
SC.na_wag=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; gfx.globalAlpha=fade(u,.9); for(let k=0;k<3;k++) { const a=Math.sin(s.t*26+k)*.6; Ln(p.x+30+k*4,p.y-40+k*3,p.x+38+k*4+Math.cos(a)*6,p.y-48+k*3+Math.sin(a)*6,2,CREAM); } };
// The wrong-way landing arc of a hip check.
SC.na_arc=(s,u)=>{ gfx.globalAlpha=fade(u,.7)*.9; gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.setLineDash([6,5]); gfx.beginPath(); gfx.arc(s.x,s.y,s.r,Math.PI*1.1,Math.PI*1.1+Math.PI*.8*ez(u/.5)); gfx.stroke(); gfx.setLineDash([]); };
// PUPPY EYES: the spotlight vignette, the square eye highlights, the target melting.
SC.na_spot=(s,u)=>{ const a=fin(u,.15)*fade(u,.85)*.55; gfx.globalAlpha=a; gfx.fillStyle='#0a0814'; gfx.beginPath(); gfx.rect(0,0,576,324); gfx.ellipse(s.x,s.y,70,90,0,0,Math.PI*2,true); gfx.fill('evenodd'); };
SC.na_eyes=(s,u)=>{ const p=ST.cur,g=ez((u-.25)/.35); if(!p||p.x==null||g<=0) return; const sp=p.sp||BATTLE_SPRITES.nara,fr=p.frame||sp.idle,h=fr.length*sp.scale;
  const ex=p.x-3,eyy=p.y-h*.7; gfx.globalAlpha=fade(u,.9); for(const dx of [-7,6]) { const r=1.5+g*3; R(ex+dx-r-1,eyy-r-1,r*2+2,r*2+2,OUT); R(ex+dx-r,eyy-r,r*2,r*2,'#fff'); R(ex+dx-r,eyy-r,r*.9,r*.9,'#bfe8ff'); }
  if(g>.8) { gfx.globalAlpha=fade(u,.9)*.8; for(const dx of [-7,6]) { const a=s.t*6; Ln(ex+dx+Math.cos(a)*7,eyy+Math.sin(a)*7,ex+dx+Math.cos(a)*10,eyy+Math.sin(a)*10,1,'#fff'); } } };
SC.na_melt=(s,u)=>{ const q=ez((u-.1)/.4); gfx.globalAlpha=fade(u,.85); heart(s.x,s.y-q*24,4+q*8,PINK); if(q>.6) label('AWWW',s.x,s.y-50,PINK,2); };
// Ball, Please: the angled rebound board.
SC.na_board=(s,u)=>{ gfx.globalAlpha=fin(u,.08)*fade(u,.9); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.5); RO(-4,-24,8,30,WOOD); gfx.restore(); RO(s.x-14,s.y+4,28,4,'#8a5e32'); if(u<.3) label('BANK SHOT',s.x,s.y-44,CREAM,1); };
SC.na_ballmouth=(s,u)=>{ const p=mouth(); ball(p.x-4,p.y+2,7); };
// Zoomies: checkpoint flags and the delayed route line.
SC.na_flags=(s,u)=>{ gfx.globalAlpha=fade(u,.92); s.pts.forEach((p,k)=>{ const up=fin(cl(u*8-k*.6),1),down=s.hitT&&s.hitT[k]!=null&&s.t>s.hitT[k]; const a=down?Math.min(1.4,(s.t-s.hitT[k])*6):0;
  gfx.save(); gfx.translate(p.x,p.y); gfx.rotate(a); RO(-1,-30*up,2,30*up,WOOD); if(up>.9) { poly([[1,-30],[16,-25],[1,-20]],k%2?GOLD:RED); label(''+(k+1),8,-28,'#2b2a26',1); } gfx.restore(); }); };
SC.na_route=(s,u)=>{ const P=s.pts,q=ez(u/.6),n=P.length-1; gfx.globalAlpha=fade(u,.8); gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.setLineDash([5,6]); gfx.beginPath();
  for(let k=0;k<=n*q;k++) { const p=P[Math.min(n,k)]; k?gfx.lineTo(p.x,p.y):gfx.moveTo(p.x,p.y); } gfx.stroke(); gfx.setLineDash([]); if(q>.9) label('ROUTE UPDATED',(P[0].x+P[n].x)/2,Math.min(...P.map(p=>p.y))-20,GOLD,1); };
SC.na_dust=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); gfx.globalAlpha=(1-q)*.7; E(s.x+k*7+q*20,s.y-q*8,4+q*5,3+q*3,'#e6dcc4'); } };
// Trade You: the CHICKEN JERKY packet and one piece.
const packet=(x,y)=>{ RO(x-14,y-20,28,20,'#e8d8b0'); R(x-14,y-20,28,5,RED); label('CHICKEN',x,y-14,'#2b2a26',1); label('JERKY',x,y-7,RED,1); };
SC.na_packet=(s,u)=>{ const p=mouth(),carry=u<s.dropAt; gfx.globalAlpha=fade(u,.93); if(carry) { gfx.save(); gfx.translate(p.x,p.y+4); gfx.scale(.7,.7); packet(0,10); gfx.restore(); } else packet(s.x,s.y); };
SC.na_piece=(s,u)=>{ const x=lerp(s.x0,s.x1,ez(u/.3)),y=s.y,back=s.backAt?Math.sin(cl((u-s.backAt)/.25)*Math.PI)*12:0; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x+back,y); gfx.rotate(.3); RO(-9,-3,18,6,JERKY); gfx.restore(); if(u>.35&&u<.6) { gfx.globalAlpha*=.6; E(x,y-6,16,10,'#ffd27a'); } };
// Keep-Away: the knotted rope from her mouth to a wind-up icon over the target; the icon pops free.
SC.na_rope=(s,u)=>{ const p=mouth(),ix=s.ix,iy=s.iy,pop=u>s.popAt; const yank=Math.sin(s.t*12)*4; gfx.globalAlpha=fade(u,.95);
  if(!pop) { for(const [w,c] of [[8,OUT],[4,'#e04a5a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(p.x,p.y); gfx.quadraticCurveTo((p.x+ix)/2,(p.y+iy)/2+18-Math.abs(yank),ix,iy); gfx.stroke(); }
    EO(p.x+2,p.y,5,5,'#4a9ae0'); EO(ix,iy,6,6,'#4a9ae0'); } };
const windIcon=(x,y)=>{ RO(x-10,y-10,20,20,'#ffb070'); label('!',x,y-3,'#2b2a26',2); };
SC.na_icon=(s,u)=>{ const pop=cl((u-s.popAt)/.25); const x=lerp(s.ix,s.dx,ez(pop)),y=lerp(s.iy,s.dy,ez(pop))-Math.sin(pop*Math.PI)*60; gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(x,y); gfx.rotate(pop*6); windIcon(0,0); gfx.restore(); if(pop>=1) label('MINE NOW',s.dx,s.dy-24,GOLD,1); };
// No Ball Left Behind: the long under-sofa retriever sweeping a row, the found ball, paw-print gap blockers.
SC.na_retriever=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; const sw=cl((u-s.sweepAt)/s.len),x=lerp(s.x1,s.x0,ez(sw)),y=lerp(s.y1??s.y,s.y0??s.y,ez(sw)); gfx.globalAlpha=fade(u,.94);
  if(u<s.sweepAt) return; Ln(p.x-24,p.y-10,x,y,5,OUT); Ln(p.x-24,p.y-10,x,y,3,'#9aa3a8'); RO(x-14,y-4,20,6,'#e04a5a'); if(sw>.1&&sw<.9) label('UNDER HERE',x,y-22,CREAM,1); };
SC.na_found=(s,u)=>{ const x=lerp(s.x0,s.x1,ez(u/.4)); gfx.globalAlpha=fade(u,.85); ball(x,s.y-8+Math.abs(Math.sin(u*12))*-4,7); if(u>.4) label('FOUND IT',s.x1,s.y-30,GOLD,1); };
SC.na_blockers=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.85); for(const x of s.xs) { E(x,s.y,6,5,'#5a3a24'); for(let k=0;k<3;k++) E(x-6+k*6,s.y-8,2.4,2.4,'#5a3a24'); } label('NO DODGING',(s.xs[0]+s.xs[s.xs.length-1])/2,s.y+12,GOLD,1); };
// Paw on Your Shoe: a worried thought cloud; the warm paw pulse.
SC.na_cloud=(s,u)=>{ const pop=cl((u-s.popAt)/.15); gfx.globalAlpha=fin(u,.1)*(1-pop); const x=s.x,y=s.y-pop*14; for(const [dx,dy,r] of [[-10,2,9],[0,-4,11],[11,2,9],[0,6,8]]) EO(x+dx,y+dy,r,r*.8,'#c8cad8');
  for(let k=0;k<5;k++) { const px=x-8+k*4,py=y+Math.sin(k*2+s.t*8)*3; R(px,py,3,2,'#4a4a60'); } E(x-16,y+16,3,3,'#c8cad8'); E(x-20,y+22,2,2,'#c8cad8'); };
SC.na_pawpulse=(s,u)=>{ const q=ez(u/.7); gfx.globalAlpha=(1-q)*.9; ring(s.x,s.y,10+q*40,4+q*16,3,'#ffb45a'); gfx.globalAlpha=fade(u,.6); E(s.x,s.y,6,5,'#ffb45a'); for(let k=0;k<3;k++) E(s.x-6+k*6,s.y-8,2.4,2.4,'#ffb45a'); if(u>.5) label('STAY',s.x,s.y-26,GOLD,1); };
// Shake It Off: droplets from her to each recipient; debuff tiles knocked off.
SC.na_spray=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; const fx0=p.x,fy0=p.y-30; for(const t of s.to) for(let k=0;k<7;k++) { const q=cl(u*1.6-k*.06),x=lerp(fx0,t.x+(k-3)*5,q),y=lerp(fy0,t.y,q)-Math.sin(q*Math.PI)*20; gfx.globalAlpha=(1-cl((q-.85)/.15)); E(x,y,2.5,3.2,k%2?WATER:'#e6f7ff'); }
  if(u>.5) for(const t of s.to) { gfx.globalAlpha=fade(u,.8); label('DAMP',t.x,t.y-26,WATER,1); } };
SC.na_tiles=(s,u)=>{ for(const t of s.to) { const q=ez(u),x=t.x+q*30,y=t.y-q*30+q*q*60; gfx.globalAlpha=1-u; gfx.save(); gfx.translate(x,y); gfx.rotate(q*5); RO(-6,-6,12,12,'#8a8fa8'); gfx.restore(); } };
// Not Leaving: the nose-contact heartbeat.
SC.na_beat=(s,u)=>{ const beat=Math.abs(Math.sin(s.t*7)),on=u>s.at; gfx.globalAlpha=fade(u,.9); heart(s.x,s.y,on?4+beat*5:3,on?'#ff6b9a':'#8a6a7a'); if(on) { gfx.globalAlpha=fade(u,.9)*.6; ring(s.x,s.y,10+beat*14,8+beat*10,2,'#ff6b9a'); } if(u>s.at+.15) label('STILL HERE',s.x,s.y-28,PINK,1); };
// Puddle Geography: a three-pixel puddle with a huge label, dotted detours, a detour sign.
SC.na_puddle=(s,u)=>{ gfx.globalAlpha=fin(u,.08)*fade(u,.93); R(s.x-1,s.y,3,1,'#f6f0b0'); R(s.x,s.y-1,1,1,'#f6f0b0'); if(u>.1) { Ln(s.x,s.y-6,s.x+22,s.y-34,1,CREAM); label('PUDDLE',s.x+32,s.y-44,CREAM,1); label('(ACTUAL SIZE)',s.x+32,s.y-36,CREAM,1); } };
SC.na_detour=(s,u)=>{ const q=ez(u/.6); gfx.globalAlpha=fade(u,.85); gfx.strokeStyle=GOLD; gfx.lineWidth=2; gfx.setLineDash([4,5]);
  for(const f of s.fs) { gfx.beginPath(); const N2=24; for(let k=0;k<=N2*q;k++) { const a=k/N2*Math.PI*2,px=f.x+Math.sin(a)*(f.w*.5+30)+Math.sin(a*3)*10,py=f.base+6-Math.sin(a/2)*40+Math.cos(a*2)*8; k?gfx.lineTo(px,py):gfx.moveTo(px,py); } gfx.stroke(); }
  gfx.setLineDash([]); const sx=s.sx,sy=s.sy,wob=u>s.bumpAt?Math.sin((u-s.bumpAt)*40)*(1-cl((u-s.bumpAt)/.3))*.4:0; gfx.save(); gfx.translate(sx,sy); gfx.rotate(wob); RO(-1,-30,2,30,WOOD); RO(-24,-42,48,14,'#f2a03a'); label('DETOUR',0,-38,'#2b2a26',1); gfx.restore(); };
// Family Food Inspector: two covered dishes; one fancy (rejected), one HOMEMADE (stamped and opened).
const cloche=(x,y,c,lid)=>{ EO(x,y+2,22,5,CREAM); gfx.save(); gfx.translate(x,y-lid*24); EO(0,0,18,14,c); R(-18,0,36,4,c); EO(0,-14,3,3,c); gfx.restore(); };
SC.na_dishes=(s,u)=>{ const lid=cl((u-s.openAt)/.12),rej=cl((u-s.rejectAt)/.12),st=u>s.stampAt; gfx.globalAlpha=fin(u,.06)*fade(u,.94);
  gfx.save(); gfx.translate(s.x0+rej*-20,s.y); gfx.rotate(-rej*.2); gfx.globalAlpha*=1-rej*.5; cloche(0,0,'#e8c84a',0); label('FANCY',0,-34,'#c9a23a',1); gfx.restore(); gfx.globalAlpha=fin(u,.06)*fade(u,.94);
  cloche(s.x1,s.y,'#dfe6ee',lid); label('HOMEMADE',s.x1,s.y+12,CREAM,1); if(rej>.5&&u<s.stampAt) label('NOPE',s.x0,s.y-50,RED,1);
  if(st) { gfx.save(); gfx.translate(s.x1,s.y-8-lid*24); gfx.globalAlpha=fade(u,.94); E(0,0,6,5,'#e05a6a'); for(let k=0;k<3;k++) E(-6+k*6,-8,2.4,2.4,'#e05a6a'); gfx.restore(); if(u<s.openAt+.15) label('APPROVED',s.x1,s.y-56,GOLD,1); }
  if(lid>0) { E(s.x1,s.y-4,14,5,'#d9a05a'); for(let k=0;k<3;k++) { const q=(u*1.2+k*.3)%1; gfx.globalAlpha=(1-q)*.8; E(s.x1-8+k*8,s.y-10-q*30,4,4,CREAM); } } };
SC.na_steam=(s,u)=>{ for(const t of s.to) for(let k=0;k<4;k++) { const q=cl(u*1.4-k*.1),x=lerp(s.x,t.x,q),y=lerp(s.y,t.y,q)-Math.sin(q*Math.PI)*30; gfx.globalAlpha=(1-q)*.8; E(x,y,5,4,'#fff1d8'); } };
SC.na_bowl=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.9); EO(s.x,s.y,12,5,'#c96a4a'); E(s.x,s.y-2,8,2,'#d9a05a'); label('PLAIN',s.x,s.y-18,CREAM,1); };

// ---------- Moves ----------
// Happy Hip Check (Basic): a whole-rear-half wag, a trot over, one happy sideways hop into it, coins, lands facing the wrong way.
N.happy_hip_check=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),px=F.x+F.w*.5+30,py=F.base+3;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'celeb',rot:wag,hop:6,hn:4},{t:700,f:'run'},{t:1300,x:px+24,y:py,f:'flip',rot:wag},{t:1550,f:'flip',rot:u=>-.25*Math.sin(u*Math.PI)},{t:1800,x:px-6,f:'flip',hop:16},{t:2100,x:px+20,f:'flip',rot:wag,hop:4,hn:3},{t:2700,f:'runR'},{t:3300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara plants her front paws and wags her entire back half.'); say(m.id,'happy_hip_check'); barks(2); }],
    ['hf',1800],
    [1800,()=>{ sfx.thud(); ST.jolt(f,.45); scene('na_poof',.5,{x:F.x+F.w*.4,y:F.mid}); scene('na_coins',1.0,{x:F.x,y:F.mid}); scene('na_text',1,{x:F.x+62,y:F.top-2,txt:'BUMP',c:GOLD,sc:2}); landHit(100); }],
    [2100,()=>{ scene('na_arc',.8,{x:px+6,y:py-30,r:30}); scene('na_text',1,{x:px+20,y:py-100,txt:'?',c:CREAM,sc:2}); }],
    [3400,'end',res(E2)+'Nara brings her entire greeting.']]); };

// PUPPY EYES (Signature, Primary animation): center stage, sit, head tilt, paws together, the look.
N.puppyEyesShow=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=t?ST.unit(t):{x:168,top:180},sx=410,sy=Math.min(312,BATTLE_POS[m.idx].base*3-6);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:sx,y:sy,f:'sit'},{t:1100,f:'sit',rot:-.16},{t:2600,f:'sit',rot:u=>-.16+Math.sin(u*Math.PI*4)*.05},{t:3100,f:'runR'},{t:3700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara trots to the middle of the room and sits.'); say(m.id,'puppy_eyes'); sfx.whine(); }],
    [800,()=>{ scene('na_spot',2.4,{x:sx,y:sy-30}); scene('na_eyes',2.0,{}); setMessage('Head tilt. Paws together. Big brown eyes.'); }],
    ['hf',1900],
    [1900,()=>{ E2.apply(); if(t) scene('na_melt',1.6,{x:F.x,y:F.top}); if(t&&t.st.smitten) { sfx.stun(); ST.jolt(t,.2); } }],
    [2700,()=>{ scene('na_wag',.6,{}); sfxs('squeak'); }],
    [3800,'end',()=>t&&t.st.smitten?cap(t.def.the)+' melts. It can\'t attack something that cute next turn.':(t?cap(t.def.the)+' looks away on purpose. It\'s seen this trick before.':'Nobody is looking.')]]); };
N.puppy_eyes=E2=>N.puppyEyesShow(E2);
const sfxs=k=>{ if(sfx[k]) sfx[k](); };

// Ball, Please (A1): drops a ball by a rebound board, one paw tap, bank shot, then she is waiting where it lands.
N.ball_please=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),bx=Math.max(F.x+F.w*.5+60,300),by=F.base+6,lx=bx+80,ly=by+8;
  let held=true;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:bx+44,y:by,f:'idle'},{t:1150,f:'act'},{t:1500,f:'idle'},{t:1900,f:'run'},{t:2250,x:lx+18,y:ly,f:'celeb',hop:10},{t:2700,f:'sit'},{t:3300,f:'runR'},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara trots out with a tennis ball and a small angled board.'); say(m.id,'ball_please'); ST.draw(()=>{ if(held) { const p=mouth(); ball(p.x-4,p.y+2,7); } },1.0); }],
    [600,()=>{ scene('na_board',3.0,{x:bx,y:by}); }],
    [900,()=>{ held=false; const p=mouth(); ST.fly((x,y)=>ball(x,y),p.x-4,p.y+2,bx+14,by-6,.25,10); sfxs('squeak'); }],
    [1200,()=>{ ST.fly((x,y)=>ball(x,y),bx+14,by-6,bx,by-20,.15,0,0,{ease:'lin'}); }],
    [1350,()=>{ ST.fly((x,y)=>ball(x,y),bx,by-20,F.x+8,F.mid,.3,30,0,{ease:'lin'}); sfx.whoosh(); }],
    ['hf',1650],
    [1650,()=>{ sfx.bonk(); ST.jolt(f); scene('na_poof',.5,{x:F.x+8,y:F.mid,c:BALL}); scene('na_text',1,{x:F.x+62,y:F.top-2,txt:'BANK',c:BALL,sc:2}); landHit(100); }],
    [1700,()=>{ ST.fly((x,y)=>ball(x,y),F.x+8,F.mid,lx,ly-40,.55,70); }],
    [2250,()=>{ held=true; ST.draw(()=>{ if(held) { const p=mouth(); ball(p.x-4,p.y+2,7); } },1.7); sfxs('squeak'); barks(1); }],
    [2700,()=>{ scene('na_text',.9,{x:lx,y:ly-100,txt:'AGAIN?',c:GOLD}); }],
    [4000,'end',res(E2)+'Nara already knew where the ball would land.']]); };

// Five-Second Zoomies (A2): four checkpoint flags, a streak through four targets, a route line that updates afterwards.
N.five_second_zoomies=E2=>{ const {m,fx}=E2,M=B2.move,W=(M&&M.waves||[]).map(w=>w[0]&&w[0].t).filter(Boolean),T=W.length?W:foes(E2);
  const pts=[0,1,2,3].map(k=>{ const f=T[k%T.length],U=ST.unit(f); return {x:U.x+(k%2?-1:1)*(U.w*.5+10),y:U.base+4,f}; });
  const K=[{t:0,x:'home',y:'home',f:'wind',rot:u=>Math.sin(u*40)*.05},{t:900,f:'run'}];
  pts.forEach((p,k)=>K.push({t:1250+k*380,x:p.x,y:p.y,f:k%2?'runR':'run',ns:true}));
  K.push({t:1250+4*380,x:'home',y:'home',f:'celeb',hop:6,hn:3}); K.push({t:3700,f:'celeb'});
  ST.keys(fx,K);
  const hitT=[];
  const flags=scene('na_flags',3.6,{pts,hitT});
  const steps=[[0,()=>{ setMessage('Four little flags pop up. There are four places, so she\'ll go to all four.'); say(m.id,'five_second_zoomies'); }],
    [900,()=>{ barks(3,.1); sfxs('run'); }],['hf',1250]];
  pts.forEach((p,k)=>steps.push([1250+k*380,()=>{ hitT[k]=flags.t; sfx.slash(); ST.jolt(p.f,.35); scene('na_dust',.5,{x:p.x,y:p.y}); scene('na_text',.6,{x:p.x,y:p.y-80,txt:'ZOOM',c:'#9fe8ff'}); landHit(25); }]));
  steps.push([2900,()=>{ scene('na_route',1.4,{pts:[{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3},...pts,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3}]}); setMessage('The route map updates a moment after she\'s finished it.'); }]);
  steps.push([4300,'end',res(E2)+'Nara has been everywhere on the map. She\'s panting. She\'s thrilled.']);
  ST.play(E2,steps); };

// Trade You (A3): carries a CHICKEN JERKY packet over, noses out one piece, almost takes it back, sits proudly.
N.trade_you=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',pk={x:H.x+(foe?H.w*.5+8:18),y:H.base+2};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:sp.self?'idle':'run'},{t:800,x:sp.x,y:sp.y,f:'idle'},{t:1000,f:'act'},{t:1300,f:'idle'},{t:1800,f:'idle'},{t:2300,dx:u=>-Math.sin(u*Math.PI)*16,f:'act'},{t:2700,f:'idle',rot:u=>Math.sin(u*Math.PI*6)*.12},{t:3000,f:'sit'},{t:3500,f:sp.self?'idle':'runR'},{t:4100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara brings over her CHICKEN JERKY. Her good food.'); say(m.id,'trade_you'); scene('na_packet',4.0,{x:pk.x,y:pk.y,dropAt:1000/4000}); }],
    [1300,()=>{ scene('na_piece',2.6,{x0:pk.x,x1:H.x+(foe?0:-6),y:H.base-10,backAt:(2300-1300)/2600}); sfxs('select'); }],
    ['hf',1800],
    [1800,()=>{ E2.apply(); sfx.heal(); scene('na_glow',.9,{x:H.x,y:H.mid,c:'#ffb070'}); if(foe) ST.jolt(t,.15); else if(t!==m) battle.fx[t.idx].hop=.3; }],
    [2350,()=>{ setMessage('She checks twice that she really meant to give that away.'); }],
    [3000,()=>{ scene('na_hearts',1,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3-90}); }],
    [4200,'end',kindLine(t,'Nara parts with the good stuff.')]]); };

// Keep-Away Rules (A4): a knotted rope loops the target's wind-up, three tugs leaning back, it pops free; she guards it.
N.keepaway_rules=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),px=Math.max(F.x+F.w*.5+90,300),py=F.base+4,ix=F.x,iy=F.top-18,dx=px+40,dy=py-6;
  const tug=u=>Math.max(0,Math.sin(u*Math.PI*3))*14;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:px,y:py,f:'aim'},{t:1100,f:'aim',dx:tug,rot:u=>Math.max(0,Math.sin(u*Math.PI*3))*.18},{t:2200,f:'idle'},{t:2500,x:px-8,f:'expr'},{t:3400,f:'runR'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara trots out with her knotted rope toy.'); say(m.id,'keepaway_rules'); }],
    [800,()=>{ scene('na_rope',1.4,{ix,iy,popAt:(2100-800)/1400}); scene('na_icon',3.0,{ix,iy,dx,dy,popAt:(2100-800)/3000}); setMessage(f.name+' was playing too roughly with that.'); }],
    [1300,()=>{ sfx.thud(); scene('na_text',.5,{x:px,y:py-90,txt:'TUG',c:'#ffb070'}); }],
    [1650,()=>{ sfx.thud(); scene('na_text',.5,{x:px,y:py-90,txt:'TUG',c:'#ffb070'}); }],
    ['hf',2100],
    [2100,()=>{ sfx.bonk(); ST.jolt(f,.5); scene('na_poof',.5,{x:ix,y:iy,c:'#ffb070'}); scene('na_text',1,{x:F.x+62,y:F.top-2,txt:'YANK',c:'#ffb070',sc:2}); landHit(100); }],
    [2600,()=>{ setMessage('She sets it down behind her and stands in the way.'); scene('na_text',1,{x:px,y:py-96,txt:'GRR',c:CREAM}); }],
    [4100,'end',res(E2)+'Nara doesn\'t approve of that game.']]); };

// No Ball Left Behind (A5): flattens to look under the row, sweeps the retriever across their feet, the ball rolls out.
N.no_ball_left=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),ly=Math.min(318,G.base+8),sx=G.x1+60;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:sx,y:ly,f:'kneel',rot:-.12},{t:1300,f:'kneel'},{t:1500,f:'aim'},{t:2300,x:G.x0+20,f:'run'},{t:2600,f:'celeb',hop:20},{t:2900,f:'idle'},{t:3500,f:'runR'},{t:4200,x:'home',y:'home',f:'idle'}]);
  const xs=list.map(f=>ST.unit(f)).sort((a,b)=>a.x-b.x).flatMap((u,k,a)=>k<a.length-1?[(u.x+a[k+1].x)/2]:[]).concat([G.x0-6,G.x1+6]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara flattens herself and looks under the whole row.'); say(m.id,'no_ball_left'); }],
    [900,()=>{ scene('na_text',1,{x:sx,y:ly-70,txt:'?',c:CREAM,sc:2}); }],
    [1500,()=>{ const P=list.map(f=>ST.unit(f)).sort((a,b)=>a.x-b.x); scene('na_retriever',1.2,{sweepAt:0,len:.6,x0:G.x0,x1:G.x1+20,y:ly,y0:P[0].base+6,y1:P[P.length-1].base+6}); sfx.whoosh(); }],
    ['hf',2000],
    [2000,()=>{ sfx.thud(); hitAll(list); battle.enemyKnock=.4; }],
    [2300,()=>{ scene('na_found',1.4,{x0:G.x,x1:G.x0+10,y:ly}); sfxs('squeak'); }],
    [2700,()=>{ scene('na_blockers',1.3,{xs,y:ly+6}); setMessage('She blocks every escape gap with very focused paws.'); }],
    [4300,'end',res(E2)+'Nara checks the place nobody else checked.']]); };

// Paw on Your Shoe (B1): sees the worried thought, trots over, one paw on their shoe; the thought pops. She stays a beat.
N.paw_on_shoe=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe';
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle',rot:-.1},{t:500,f:sp.self?'idle':'run'},{t:1200,x:sp.x,y:sp.y,f:'sit'},{t:1500,dx:u=>-u*8,f:'act'},{t:2700,dx:-8,f:'act'},{t:3100,f:sp.self?'idle':'runR'},{t:3700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara notices a worried thought over '+(t===m?'herself':t.name)+'.'); say(m.id,'paw_on_shoe'); scene('na_cloud',2.2,{x:H.x-8,y:H.top-16,popAt:(1800-0)/2200}); }],
    [1500,()=>{ setMessage('One paw, squarely on the shoe.'); }],
    ['hf',1800],
    [1800,()=>{ E2.apply(); sfx.heal(); scene('na_pawpulse',1.2,{x:H.x+(foe?0:4),y:H.base+2}); scene('na_glow',.9,{x:H.x,y:H.mid,c:'#ffb45a'}); if(foe) ST.jolt(t,.15); else if(t!==m) battle.fx[t.idx].hop=.3; }],
    [2400,()=>{ scene('na_hearts',.9,{x:H.x,y:H.top}); }],
    [3800,'end',kindLine(t,'Nara makes sure her friend knows she\'s there.')]]); };

// Shake It Off, Everyone (B2): stands in front of the party, one twitch nobody notices, a full shake; damp, better friends.
N.shake_everyone=E2=>{ const {m,fx}=E2,tg=E2.targets||[],kind=tg.length===1&&tg[0].side==='foe',to=tg.map(t=>{ const U=ST.unit(t); return {x:U.x,y:U.mid,u:t}; });
  const cx=kind?ST.unit(tg[0]).x+ST.unit(tg[0]).w*.5+40:420,cy=kind?ST.unit(tg[0]).base+3:Math.min(318,BATTLE_POS[m.idx].base*3+2);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:cx,y:cy,f:'idle'},{t:1000,f:'idle',rot:u=>u>.3&&u<.5?.08:0},{t:1500,f:'idle',rot:(u,tt)=>Math.sin(tt*45)*.28,dx:(u,tt)=>Math.sin(tt*45)*4},{t:2400,f:'celeb',hop:10,hn:2},{t:3000,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara walks into the middle of everyone, slightly wet.'); say(m.id,'shake_everyone'); }],
    [1100,()=>{ scene('na_text',.5,{x:cx,y:cy-90,txt:'!',c:CREAM,sc:2}); setMessage('One warning shoulder twitch. Nobody notices in time.'); }],
    [1500,()=>{ scene('na_spray',1.4,{to}); sfx.splat&&sfx.splat(); }],
    ['hf',2000],
    [2000,()=>{ E2.apply(); sfx.heal(); scene('na_tiles',.8,{to}); for(const o of to) { if(o.u.side==='party'&&o.u!==m) battle.fx[o.u.idx].hop=.3; if(o.u.side==='foe') ST.jolt(o.u,.2); } }],
    [3700,'end',kindLine(kind?tg[0]:null,'Everyone looks better after a shake. Damper, too.')]]); };

// Not Leaving (B3): runs to the fallen friend, nudges a limp hand, nose against it until a heartbeat; leans her weight in.
N.not_leaving=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,down=t.hp<=0,H=ST.unit(t),sp=spotFor(m,t);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'act'},{t:1200,f:'idle',dx:u=>-Math.abs(Math.sin(u*Math.PI*2))*10},{t:1600,dx:-10,f:'idle',rot:-.15},{t:2600,f:'idle',dx:u=>-10-Math.sin(u*Math.PI)*14,rot:-.25},{t:3100,f:'celeb',rot:wag},{t:3600,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage(down?'Nara runs to '+t.name+' and plants both front paws.':'Nara runs to '+t.name+'. Just checking.'); sfx.whine(); }],
    [1200,()=>{ setMessage('She nudges a limp hand. Once. Twice.'); }],
    [1600,()=>{ say(m.id,'not_leaving'); scene('na_beat',2.0,{x:H.x-6,y:H.top+10,at:(2400-1600)/2000}); }],
    ['hf',2400],
    [2400,()=>{ E2.apply(); sfx.heal(); scene('na_glow',1,{x:H.x,y:H.mid,c:'#ff9ac0'}); }],
    [2700,()=>{ setMessage('She leans her whole forty pounds into her friend.'); scene('na_hearts',1.2,{x:H.x+20,y:H.top,n:4}); }],
    [4400,'end',down?t.name+' is back up. Nara rejected being left behind.':'Nara was never going to leave anyway.']]); };

// Puddle Geography (B4): a happy bounce, a three-pixel puddle, the front row takes an enormous detour into a DETOUR sign.
N.puddle_geography=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),fs=list.map(f=>ST.unit(f)),px=G.x1+40,py=Math.min(318,G.base+6);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:px+40,y:py,f:'celeb',hop:16,hn:3},{t:1400,f:'idle'},{t:1700,f:'runR'},{t:2600,x:'home',y:'home',f:'flip'},{t:3200,f:'flip',rot:u=>Math.sin(u*Math.PI)*.2},{t:3700,f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara is SO excited. Bounce. Bounce. Bounce.'); say(m.id,'puddle_geography'); barks(3,.12); }],
    [1300,()=>{ scene('na_puddle',3.0,{x:px+8,y:py}); setMessage('A tiny puddle. Visibly tiny.'); sfx.splat&&sfx.splat(); }],
    [1700,()=>{ scene('na_detour',2.4,{fs,sx:G.x0-24,sy:py,bumpAt:(2300-1700)/2400}); setMessage('The front row takes the long way around. The very long way.'); }],
    ['hf',2300],
    [2300,()=>{ sfx.thud(); hitAll(list); }],
    [2900,()=>{ scene('na_text',1,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3-90,txt:'?',c:CREAM,sc:2}); }],
    [3800,'end',res(E2)+'The puddle is tiny. The detour isn\'t.']]); };

// Family Food Inspector (B5): two covered dishes; sniff, reject the fancy one, stamp HOMEMADE; warm steam for everyone.
N.food_inspector=E2=>{ const {m,fx}=E2,tg=E2.targets||[],kind=tg.length===1&&tg[0].side==='foe',to=tg.map(t=>{ const U=ST.unit(t); return {x:U.x,y:U.mid,u:t}; });
  const base=kind?ST.unit(tg[0]):null,y=kind?base.base+4:Math.min(292,BATTLE_POS[m.idx].base*3-20),x1=kind?base.x+base.w*.5+30:400,x0=x1-70;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:600,x:x0+30,y:y,f:'idle'},{t:800,dx:u=>-Math.abs(Math.sin(u*Math.PI*3))*8,f:'idle'},{t:1500,f:'flip',rot:-.15},{t:1800,f:'runR'},{t:2100,x:x1+30,f:'act',hop:8},{t:2500,f:'idle'},{t:3200,f:'sit'},{t:3700,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Two covered dishes. One is fancy. One says HOMEMADE.'); say(m.id,'food_inspector'); scene('na_dishes',3.9,{x0,x1,y,rejectAt:1500/3900,stampAt:2150/3900,openAt:2450/3900}); }],
    [850,()=>{ scene('na_text',.8,{x:x0,y:y-70,txt:'SNIFF',c:CREAM}); }],
    [1500,()=>{ setMessage('Nara sniffs the fancy one and turns her nose up.'); }],
    [2150,()=>{ sfx.thud(); setMessage('The homemade one gets a paw of approval.'); }],
    ['hf',2550],
    [2550,()=>{ scene('na_steam',1.2,{x:x1,y:y-20,to}); }],
    [2900,()=>{ E2.apply(); sfx.heal(); for(const o of to) { if(o.u.side==='party'&&o.u!==m) battle.fx[o.u.idx].hop=.3; if(o.u.side==='foe') ST.jolt(o.u,.15); } }],
    [3200,()=>{ scene('na_bowl',1.1,{x:x1+10,y:y+2}); }],
    [4400,'end',kindLine(kind?tg[0]:null,'The homemade option passes inspection. Nara gets her own plain little portion.')]]); };
})();

// ================= Overworld: Nara in Jefferson Park =================

const NARA_NPC=Object.assign(actor('Nara',27,19,'washington',[]),{sheet:'nara',dog:true,roam:14,duration:.34});
worlds.jpark.npcs.push(NARA_NPC);

// Excited puddles: a small decal on the ground that dries up after a while (drawn with the rugs, under everyone).
const LE_drawRug_nara=drawRug;
drawRug=function(r) {
  if(!r.puddle) return LE_drawRug_nara.apply(this,arguments);
  const left=r.until-elapsedTime; if(left<=0) return;
  const a=Math.min(1,left/2)*.85,cx=(r.x+.5)*T,cy=(r.y+.82)*T,k=Math.min(1,(elapsedTime-r.start)/.4);
  gfx.globalAlpha=a; ellipse(cx,cy,13*k,5*k,'#d9cf6a'); ellipse(cx-3,cy-1,8*k,3*k,'#f2ecaa'); gfx.globalAlpha=1;
};
function naraPuddle(map,x,y) {
  map.rugs=map.rugs.filter(r=>!r.puddle||r.until>elapsedTime);
  map.rugs.push({puddle:true,x,y,start:elapsedTime,until:elapsedTime+14});
  sfx.splat&&sfx.splat();
}

// The first meeting: Nara spots Tom, comes running, jumps on him, and gets so excited she pees.
function startNaraMeet(n) {
  if(n.visitedOnce) return;
  n.visitedOnce=true;
  const map=currentMap;
  n.path=[]; n.move=null; n.idle=1e9;   // she stays put for the scene instead of wandering off
  // A free tile next to Tom for her to run to.
  const spots=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:player.x+dx,y:player.y+dy})).filter(p=>canOccupy(map,p.x,p.y,n)||(p.x===n.x&&p.y===n.y));
  spots.sort((a,b)=>(Math.abs(a.x-n.x)+Math.abs(a.y-n.y))-(Math.abs(b.x-n.x)+Math.abs(b.y-n.y)));
  const goal=spots[0];
  const route=goal&&!(goal.x===n.x&&goal.y===n.y)?findPath(map,n,goal).map(p=>[p.x,p.y]):[];
  const steps=[
    S.call(()=>{ player.facing=directionTo(n.x-player.x,n.y-player.y); sfx.bark(); sfx.bark(.16); }),
    S.talk('Tom',['...Is that... NARA?!']),
    S.call(()=>{ sfx.bark(); sfx.bark(.14); sfx.bark(.28); }),
    route.length?S.walk(n,route,.13,k=>{ if(k%2) sfx.step(); }):S.wait(.1),
    S.call(()=>{ n.facing=directionTo(player.x-n.x,player.y-n.y); player.facing=directionTo(n.x-player.x,n.y-player.y); }),
    {t:0,start(){ this.t=0; snd.oof&&snd.oof(0); sfx.giggle&&sfx.giggle(); },
      update(dt){ this.t+=dt; const t=this.t,u=Math.min(1,t/.3),back=t>1?Math.min(1,(t-1)/.3):0,k=u*(1-back);
        n.scr={x:n.x+(player.x-n.x)*.4*k,y:n.y+(player.y-n.y)*.4*k}; n.lift=(t<1?Math.abs(Math.sin(t*14))*6:0)+k*10;
        if(t>.2&&t<1.1&&Math.floor(t*10)!==Math.floor((t-dt)*10)&&Math.floor(t*10)%2===0) intro.hearts.push({x:player.x+.5+(Math.random()-.5)*.8,y:player.y-.6,t:0});
        if(t>=1.3) { n.scr=null; n.lift=0; return true; } return false; }},
    S.talk('Nara',['Arf! Arf arf arf! Awoo!'],[['nara','greet']]),
    S.talk('Tom',['Nara! What are YOU doing here?!','Where\'s Olivia? Where\'s Michael? Where are Lachlan and Isla?!']),
    S.call(()=>naraPuddle(map,n.x,n.y)),
    S.wait(.5),
    S.talk('Tom',['...And she peed. She\'s so happy she peed. Of COURSE she did.']),
    S.call(()=>sfx.squeak()),
    S.talk('Nara',['Nara drops a very wet tennis ball at Tom’s feet. Then she leans on his legs and looks up at him.']),
    S.talk('Tom',['Okay. Okay. Nobody is getting left alone today. We\'ll find your family.']),
    S.call(()=>{ endIntro(); n.idle=1; grantItem('naraball'); if(typeof heartTrace==='function') { heartTrace('nara-meet'); setFlag('met-nara'); } setTimeout(()=>{ if(!inParty(nara)&&!dialog.active&&!battle.active) offerRecruit(nara,n); },900); })
  ];
  runScene(steps);
}

// Talking to her after that: barks, wiggles, sometimes a puddle, then the offer to come along.
function talkToNara(n) {
  if(!n.visitedOnce) { startNaraMeet(n); return; }
  say('nara','greet');
  const excited=Math.random()<.3;
  n.lines=[pick(['Nara wiggles so hard her whole back half goes sideways.','Nara brings Tom a stick. It\'s the best stick. He has to see it.','Nara sniffed every jacaranda on 2nd Ave. She has a full report.','Nara rolls over for belly rubs. She\'s earned them. She says.','Somebody offered Nara a biscuit. She looked at it like it was a rock.','Nara drops the tennis ball at Tom’s feet. Then picks it back up. Then drops it. Throw it. THROW IT.'])];
  if(excited) n.lines.push('...She got a little too excited. There\'s a puddle. Tom steps around it.');
  n.onClose=()=>{ if(!inParty(nara)) offerRecruit(nara,n); };
  if(excited) { const prev=n.onClose; n.onClose=()=>{ naraPuddle(currentMap,n.x,n.y); prev(); }; }
  openDialog(n.name,n.lines,n);
}

// She notices Tom from a few tiles away the first time he walks by.
const LE_update_nara=update;
update=function(dt) {
  LE_update_nara.apply(this,arguments);
  if(inParty(nara)) NARA_NPC.visitedOnce=true;   // a save made while she was in the party still counts as met
  if(NARA_NPC.visitedOnce||currentMap!==worlds.jpark||intro.active||dialog.active||transition||battle.active||menuOpen||shopOpen||player.move) return;
  if(!worlds.jpark.npcs.includes(NARA_NPC)) return;
  if(Math.abs(NARA_NPC.x-player.x)+Math.abs(NARA_NPC.y-player.y)<=4) startNaraMeet(NARA_NPC);
};

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Nara's review: things Nara actually does (jumps on people, fetch, separation panic, begging, counter surfing, barking
// at the window, the Labradoodle coat, happy puddles). One big readable moment per move. Jump Up (basic), PUPPY DOG EYES (the
// signature show; key puppy_eyes), Tennis Ball Fetch, Don't Leave Me!, Just One Bite?, Counter Surfer, Stranger Alert,
// Doodle Fluff, Shake It Off, Everyone (kept; a big spray across the screen), Happy Puddle. Same numbers as the slots
// they replace. Scenes prefix nv_ (no warp). The older functions above stay for the old keys.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const N=RECRUIT_MOVES.nara;
const CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',BALL='#d8ef4a',WATER='#8fd0ff',RED='#e0402e',WOOD='#b88848',FUR='#1c1718',FUR2='#2e2627',FUR3='#463b3b',PEE='#e9e07a',ICE='#bfe8ff';
ST.nw('nv_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const mouth=()=>ST.hand();
const barks=(n,gap=.14)=>{ for(let k=0;k<n;k++) sfx.bark(k*gap); };
const sfxs=k=>{ if(sfx[k]) sfx[k](); };
const wag=(u,tt)=>Math.sin(tt*26)*.07;
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+(t.side==='foe'?34:26)),y:Math.min(316,u.base+3)}; };
const tomU=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const NH=()=>BATTLE_SPRITES.nara.idle.length*BATTLE_SPRITES.nara.scale;
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const ball=(x,y,r=14)=>{ if(PROPART.draw('nara/tennis_ball',x,y,{h:(r+2)*2.2})) return; E(x,y,r+2,r+2,OUT); E(x,y,r,r,BALL); E(x-r*.3,y-r*.3,r*.35,r*.35,'#f2ffa0'); gfx.strokeStyle=CREAM; gfx.lineWidth=Math.max(2,r*.2); gfx.beginPath(); gfx.arc(x-r,y,r,-.9,.9); gfx.stroke(); gfx.beginPath(); gfx.arc(x+r,y,r,Math.PI-.9,Math.PI+.9); gfx.stroke(); };
const paw=(x,y,r,c)=>{ E(x,y+r*.3,r*.75,r*.6,c); for(let k=0;k<4;k++) E(x-r*.9+k*r*.6,y-r*.55-(k===1||k===2?r*.2:0),r*.28,r*.32,c); };
// Big outlined words; keep them at F.top-74 over a monster so they clear the damage number.
SC.nv_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.nv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); const sc=s.sc||2,w=(s.txt.length*4-1)*sc; const x=Math.max(w/2+6,Math.min(570-w/2,s.x)); bigWord(s.txt,x,s.y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.nv_hearts=(s,u)=>{ for(let k=0;k<(s.n||5);k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; heart(s.x-20+k*10+Math.sin(q*6+k)*5,s.y-q*44,6+(k%2)*2,k%2?PINK:'#ff6b9a'); } };
SC.nv_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.nv_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI+k/((s.n||10)-1)*Math.PI,d=ez(u)*(s.r||34); gfx.globalAlpha=(1-u)*.85; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.5,5*(1-u)+2,4*(1-u)+2,s.c||'#e8dcc4'); } };
SC.nv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.nv_coins=(s,u)=>{ for(let k=0;k<7;k++) { const q=cl(u*1.2-k*.05),dir=(k-3)/3,x=s.x+dir*60*q,y=s.y-Math.sin(q*Math.PI)*60+q*q*40; gfx.globalAlpha=1-cl((u-.8)/.2); if(k<4&&PROPART.ready('nara/gold_coins')) { PROPART.draw('nara/gold_coins',x,y,{h:20,rot:q*5+k}); continue; } EO(x,y,8,8,'#ffd24a'); R(x-1.5,y-5,3,10,'#c99a20'); } };

// ---------- Jump Up (basic) ----------
// She spots it, runs over, rears up and plants both front paws on it; coins shake loose. Tom calls out from his spot.
SC.nv_paws=(s,u)=>{ const p=ez(u/.1); gfx.globalAlpha=fade(u,.75); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(p,p); for(const [dx,dy] of [[-16,6],[16,-4]]) { paw(dx,dy,13,OUT); paw(dx,dy,10,'#5a3a24'); } gfx.restore(); };
N.jump_up=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),px=Math.min(556,F.x+F.w*.5+30),py=Math.min(316,F.base+3),tom=tomU(),T=tom&&ST.unit(tom);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'celeb',rot:wag,hop:8,hn:3},{t:500,f:'run'},{t:1100,x:px+18,y:py,f:'wind',rot:(u,tt)=>Math.sin(tt*40)*.04},{t:1350,x:px,f:'act',rot:u=>ez(u/.6)*.55,dy:u=>-ez(u/.6)*16},
    {t:2700,f:'act',rot:(u,tt)=>.55+Math.sin(tt*18)*.05,dy:(u,tt)=>-16+Math.sin(tt*18)*2},{t:2950,f:'idle',rot:u=>.55*(1-ez(u)),dy:u=>-16*(1-ez(u))},{t:3250,f:'celeb',rot:wag,hop:5,hn:2},{t:3700,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara spots '+f.name+'. A new friend! A NEW FRIEND!'); say(m.id,'jump_up'); barks(2); }],
    [1350,()=>{ setMessage('Up she goes. Both front paws, right on it.'); sfx.whoosh(); }],
    ['hf',1550],
    [1550,()=>{ sfx.thud(); ST.jolt(f,.5); landHit(100); scene('nv_paws',2.4,{x:F.x+F.w*.15,y:F.mid}); scene('nv_coins',1.3,{x:F.x,y:F.mid}); scene('nv_big',1.2,{x:F.x,y:F.top-74,txt:'UP UP UP!',c:GOLD,sc:3}); }],
    [1700,()=>{ sfxs('coin'); }],
    [2100,()=>{ if(T) { say('tom','nara_no_jump'); hopOf(tom); scene('nv_text',1.5,{x:T.x,y:T.top-20,txt:'NARA! NO JUMPING!',c:CREAM,sc:2}); setMessage('Tom, from across the room: Nara, no jumping!'); } else setMessage('Somebody says no jumping. Nobody means it.'); }],
    [2950,()=>{ setMessage('She drops down. Tail going. Not sorry.'); scene('nv_text',1.2,{x:px,y:py-NH()-24,txt:'WAG WAG',c:GOLD,sc:2}); }],
    [4400,'end',res(E2)+'Nara greets everybody the same way. Paws first.']]); };

// ---------- PUPPY DOG EYES (signature show; key puppy_eyes) ----------
// She sits mid-room; the screen cuts to a close-up of her face: the eyes are eerily, completely human. Eyebrows and all.
// Back to the room: the monster looks away, looks back (double take), then melts.
SC.nv_closeup=(s,u)=>{ const op=ez(u/.12)*(1-ez((u-.88)/.12)),H=170*op,cy=150; if(H<1) return;
  if(PROPART.ready('nara/face_eyes_open')&&PROPART.ready('nara/face_eyes_closed')) { gfx.globalAlpha=.6*op; R(0,0,576,324,'#0a0814'); gfx.globalAlpha=op; const bl=u>.56&&u<.64, z=.92+.08*ez(u/.5); PROPART.draw(bl?'nara/face_eyes_closed':'nara/face_eyes_open',288,156,{h:276*z}); gfx.globalAlpha=1; return; }
  gfx.globalAlpha=.55*op; R(0,0,576,324,'#0a0814'); gfx.globalAlpha=1;
  gfx.save(); gfx.beginPath(); gfx.rect(0,cy-H/2,576,H); gfx.clip();
  R(0,cy-H/2,576,H,FUR);
  for(let k=0;k<90;k++) { const x=(k*53)%600-12,y=cy-90+((k*37)%180),r=10+(k%4)*3; E(x,y,r,r*.8,k%3?FUR2:FUR3); E(x-r*.3,y-r*.3,r*.35,r*.3,'#5a4c4c'); }
  E(288,cy+70,46,30,'#0e0b0b'); E(276,cy+62,12,7,'#3a3434');
  const blink=u>.56&&u<.64?Math.sin((u-.56)/.08*Math.PI):0,dil=ez((u-.25)/.3),brow=ez((u-.35)/.2);
  for(const sd of [-1,1]) { const ex=288+sd*72,ey=cy-8;
    gfx.save(); gfx.beginPath(); gfx.ellipse(ex,ey,40,17,0,0,Math.PI*2); gfx.lineWidth=6; gfx.strokeStyle='#0b0909'; gfx.stroke(); gfx.clip();
    E(ex,ey,40,17,'#f4efe6'); E(ex,ey+8,40,6,'#e6ddd0'); E(ex+sd*-2,ey,13,13,'#6b4226'); ring(ex+sd*-2,ey,13,13,2,'#3e2414'); E(ex+sd*-2,ey,5+dil*3,5+dil*3,'#0b0909'); E(ex+sd*-2-4,ey-5,3,3,'#ffffff');
    R(ex-42,ey-19,84,38*blink,'#2a2222'); gfx.restore();
    LnO(ex-30,ey-20,ex+30,ey-20,2,'#0b0909');
    const bi=ex-sd*30,bo=ex+sd*30; Ln(bi,ey-34-brow*12,bo,ey-36+brow*2,7,'#120e0e'); Ln(bi,ey-34-brow*12,bo,ey-36+brow*2,3,'#2e2424');
    for(let k=0;k<3;k++) Ln(ex-12+k*12,ey+17,ex-14+k*12,ey+23,2,'#0b0909'); }
  gfx.restore();
  gfx.globalAlpha=op; R(0,cy-H/2-3,576,3,OUT); R(0,cy+H/2,576,3,OUT); };
N.puppyEyesShow=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=t?ST.unit(t):{x:168,top:180,base:260,h:80,w:60,mid:220},sx=410,sy=Math.min(312,BATTLE_POS[m.idx].base*3-6);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:sx,y:sy,f:'sit'},{t:2800,f:'sit',rot:-.12},{t:3400,f:'sit',rot:u=>-.12+Math.sin(u*Math.PI*4)*.05},{t:3900,f:'runR'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara trots to the middle of the room and sits.'); say(m.id,'puppy_eyes'); sfx.whine(); }],
    [850,()=>{ scene('nv_closeup',1.8,{}); sfx.charge(); setMessage('She looks up. Those aren\'t dog eyes. Those are PEOPLE eyes.'); }],
    [1000,()=>{ scene('nv_big',1.5,{x:288,y:58,txt:'PUPPY DOG EYES',c:CREAM,sc:3}); }],
    [2700,()=>{ if(!t) return; setMessage(cap(t.def.the)+' looks away. Then looks back. Wait. WHAT?'); ST.draw((s,u)=>{ const q=cl(u/.93);
        const ox=q<.35?-ez(q/.35)*16:lerp(-16,6,ez((q-.35)/.15))*(1-ez((q-.7)/.3)),sp=q<.35?-.12*ez(q/.35):lerp(-.12,.08,ez((q-.35)/.15))*(1-ez((q-.7)/.3)); lift(t,0,sp,ox); },.75); }],
    [3000,()=>{ if(t) { scene('nv_text',.9,{x:F.x,y:F.top-14,txt:'!?',c:GOLD,sc:3}); sfx.boing(); } }],
    ['hf',3250],
    [3250,()=>{ E2.apply(); if(t&&t.st.smitten) { sfx.stun(); scene('na_melt',1.6,{x:F.x,y:F.top}); scene('nv_big',1.2,{x:F.x,y:F.top-74,txt:'AWWW',c:PINK,sc:4}); scene('nv_hearts',1.4,{x:F.x,y:F.top+10});
        ST.draw((s,u)=>{ const q=u; lift(t,ez(q/.5)*F.h*.12*(1-ez((q-.8)/.2)),Math.sin(q*30)*.05*(1-q),0); },1.2); } }],
    [4600,'end',()=>t&&t.st.smitten?cap(t.def.the)+' melts. It can\'t attack something that looks at it like that.':(t?cap(t.def.the)+' looks away on purpose. It\'s seen this trick before.':'Nobody is looking.')]]); };
N.puppy_eyes=E2=>N.puppyEyesShow(E2);

// ---------- Tennis Ball Fetch (A1) ----------
// Tom throws (or she flips it up herself); she rockets after it straight through the monster, grabs it at the far side,
// trots back proud and drops it at home: AGAIN?
SC.nv_speed=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; gfx.globalAlpha=fade(u,.8)*.9; for(let k=0;k<6;k++) { const y=p.y-14-k*11,len=40+((k*29)%30); LnO(p.x+36,y,p.x+36+len,y,2,CREAM); } };
N.tennis_ball_fetch=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),H0=homeOf(m),lx=Math.max(30,F.x-F.w*.5-50),ly=Math.min(316,F.base+4),tom=tomU(),T=tom&&ST.unit(tom);
  let hold=false,drop=null;
  const ex=lx+30,cross=F.x+F.w*.2; let uu=.5; for(let k=0;k<30;k++) { const x=lerp(H0.x,ex,ez(uu)); uu+=(x>cross?1:-1)*.5/Math.pow(2,k+1); } const hit=Math.round(700+uu*800);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'wind',rot:(u,tt)=>Math.sin(tt*30)*.05},{t:700,f:'run',ns:true},{t:1500,x:ex,y:ly,f:'celeb',hop:10},{t:1900,f:'runR'},{t:3000,x:'home',y:'home',f:'sit'},{t:3800,f:'sit',rot:-.12}]);
  ST.play(E2,[
    [0,()=>{ setMessage(T?'Tom holds up the tennis ball. Nara stops breathing.':'Nara noses her tennis ball into the air.'); say(m.id,'tennis_ball_fetch'); }],
    [300,()=>{ const a=T?{x:T.x-10,y:T.top+16}:mouth(); ST.fly((x,y)=>ball(x,y),a.x,a.y,lx,ly-14,.9,140); sfx.whoosh(); if(T) hopOf(tom); setMessage('The ball flies. She\'s GONE.'); }],
    [700,()=>{ barks(2,.1); scene('nv_speed',.8,{}); sfxs('run'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('nv_dust',.6,{x:F.x,y:F.base,r:40}); scene('nv_big',1.1,{x:F.x,y:F.top-74,txt:'FETCH!',c:BALL,sc:4}); }],
    [1200,()=>{ ST.fly((x,y)=>ball(x,y),lx,ly-14,lx,ly-14,.3,16,0,{ease:'lin'}); sfxs('squeak'); }],
    [1500,()=>{ hold=true; ST.draw(()=>{ if(hold) { const p=mouth(); ball(p.x-6,p.y+4,11); } else if(drop) ball(drop.x,drop.y,11); },2.4); barks(1); setMessage('Got it. Very proud. Very slobbery.'); }],
    [3000,()=>{ hold=false; const p=mouth(); drop={x:p.x-24,y:Math.min(318,BATTLE_POS[m.idx].base*3-8)}; sfxs('squeak'); scene('nv_text',1.1,{x:H0.x,y:H0.y-NH()-24,txt:'AGAIN?',c:GOLD,sc:2}); }],
    [3900,'end',res(E2)+'She\'ll do that forty more times if anyone lets her.']]); };

// ---------- Don't Leave Me! (A2) ----------
// Someone takes ONE step away. Nara panics: AWOOOOO, then frantic laps all over the room, crashing into monsters (4 hits).
// They come back; she jumps on them like they were gone a year.
SC.nv_howl=(s,u)=>{ for(let k=0;k<4;k++) { const q=(u*2.2+k/4)%1; gfx.globalAlpha=(1-q)*fade(u,.85); gfx.strokeStyle=k%2?'#c9b3e6':CREAM; gfx.lineWidth=5; const r=16+q*190; gfx.beginPath(); gfx.arc(s.x,s.y,r,Math.PI*1.05,Math.PI*1.6); gfx.stroke(); } };
SC.nv_sweat=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; gfx.globalAlpha=fade(u,.9); for(let k=0;k<3;k++) { const q=(s.t*3+k/3)%1; E(p.x+10+k*10,p.y-NH()-4-q*16,3,4,WATER); } };
N.dont_leave_me=E2=>{ const {m,fx}=E2,M=B2.move,W=(M&&M.waves||[]).map(w=>w[0]&&w[0].t).filter(Boolean),T=W.length?W:foes(E2);
  const L=tomU()||b2LiveParty().find(p=>p!==m),LU=L&&ST.unit(L),away=LU?Math.max(0,Math.min(120,560-LU.x-LU.w*.3)):0,H0=homeOf(m);
  if(L) battle.fx[L.idx].path={t:0,dur:4.0,fn:(q,c)=>{ const ms=q*4000,dx=ms<300?0:(ms<1000?ez((ms-300)/700)*away:(ms<3300?away:away*(1-ez((ms-3300)/400)))); return {cx:c.origX+dx,base:c.origBase,frame:ms>300&&ms<3300?(c.sp.flip||c.sp.idle):null}; }};
  const pts=[0,1,2,3].map(k=>{ const f=T[k%T.length],U=ST.unit(f); return {x:Math.max(20,Math.min(556,U.x+(k%2?-1:1)*(U.w*.5+6))),y:Math.min(316,U.base+4),f}; });
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:700,f:'idle',rot:-.1},{t:1000,f:'sit',rot:u=>ez(u/.3)*.35},{t:1800,f:'run'}];
  pts.forEach((p,k)=>K.push({t:2100+k*380,x:p.x,y:p.y-(k%2?18:0),f:k%2?'runR':'run',ns:true}));
  const back=LU?{x:Math.min(556,LU.x-34),y:Math.min(316,LU.base+3)}:{x:H0.x,y:H0.y};
  K.push({t:3900,x:back.x,y:back.y,f:'celeb',hop:16,hn:3,rot:wag},{t:4500,f:'runR'},{t:5000,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const words=['CRASH','BONK','OOF','CRASH'];
  const steps=[[0,()=>{ setMessage(L?L.name+' takes ONE step away. To get a snack.':'The room gets very quiet. Too quiet.'); say(m.id,'dont_leave_me'); }],
    [500,()=>{ if(LU) scene('nv_text',1.0,{x:LU.x+away,y:LU.top-18,txt:'BRB',c:CREAM,sc:2}); }],
    [700,()=>{ scene('nv_text',.8,{x:H0.x,y:H0.y-NH()-24,txt:'!',c:CREAM,sc:3}); sfx.whine(); }],
    [1050,()=>{ sfx.howl(); scene('nv_howl',1.2,{x:H0.x-16,y:H0.y-NH()+10}); scene('nv_big',1.4,{x:H0.x-150,y:84,txt:'AWOOOOO!',c:'#c9b3e6',sc:4}); setMessage('Nara panics. Loudly.'); }],
    [1800,()=>{ scene('nv_sweat',2.2,{}); barks(4,.1); sfxs('run'); setMessage('She runs laps. Everywhere. Into everything.'); }],
    ['hf',2100]];
  pts.forEach((p,k)=>steps.push([2100+k*380,()=>{ sfx.thud(); ST.jolt(p.f,.4); scene('nv_dust',.5,{x:p.x,y:p.y}); scene('nv_text',.6,{x:p.x,y:ST.unit(p.f).top-20-(k%2)*16,txt:words[k],c:'#ffb070'}); landHit(25); }]));
  steps.push([3500,()=>{ if(L) setMessage(L.name+' comes back. Nara reacts like it\'s been a year.'); }]);
  steps.push([3900,()=>{ if(L) { hopOf(L); scene('nv_hearts',1.2,{x:back.x+10,y:back.y-NH()}); } barks(3,.12); }]);
  steps.push([5100,'end',res(E2)+'Everybody is right here. Nara has counted. Twice.']);
  ST.play(E2,steps); };

// ---------- Just One Bite? (A3) ----------
// A plate by the friend. Nara sits beside it: drool, head tilt, one paw tap, a tiny whine. The friend caves and shares.
SC.nv_plate=(s,u)=>{ const x=s.x,y=s.y,bit=s.biteAt!=null&&s.t*1000>s.biteAt; gfx.globalAlpha=fin(u,.08)*fade(u,.92);
  EO(x,y,26,7,'#f4f2ea'); E(x,y-1,18,4,'#e2ded2');
  RO(x-18,y-14,36,6,'#e8b878'); R(x-18,y-8,36,3,'#7fc46a'); R(x-18,y-5,36,3,'#e05a4a'); RO(x-18,y-4,36,5,'#e8b878');
  if(bit) { E(x+16,y-9,8,8,'#f4f2ea'); E(x+12,y-3,5,5,'#f4f2ea'); } };
SC.nv_drool=(s,u)=>{ const p=mouth(); gfx.globalAlpha=fade(u,.9); for(let k=0;k<3;k++) { const q=(s.t*1.4+k/3)%1; E(p.x-2,p.y+6+q*24,2.4,3.4+q*2,'#e6f7ff'); } E(p.x-2,Math.min(320,s.floor),6*fin(u,.4),2,'#cfeeff'); };
N.just_one_bite=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,foe=t.side==='foe',H0=homeOf(m);
  const ny=foe?Math.min(316,H.base+4):Math.min(320,(self?H0.y:H.base)+24),nx=foe?Math.min(560,H.x+H.w*.5+64):Math.min(556,(self?H0.x:H.x)+14),pl={x:nx-48,y:ny};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:800,x:nx,y:ny,f:'sit'},{t:1900,f:'sit',rot:u=>-.2*ez(u/.3)},{t:2300,f:'act',rot:-.2,dx:u=>-Math.abs(Math.sin(u*Math.PI*2))*8},{t:2700,f:'sit',rot:-.2},{t:3300,f:'celeb',hop:8,hn:2,rot:wag},{t:3800,f:self?'idle':'runR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  const plate=scene('nv_plate',4.4,{x:pl.x,y:pl.y,biteAt:3050});
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Nara finds a sandwich. She waits for permission anyway.':'There\'s a sandwich by '+t.name+'. Nara sits next to it. Very politely.'); say(m.id,'just_one_bite'); }],
    [900,()=>{ scene('nv_text',1.4,{x:pl.x+10,y:pl.y-NH()-30,txt:'JUST ONE BITE?',c:GOLD,sc:2}); }],
    [1150,()=>{ scene('nv_drool',2.0,{floor:ny-2}); setMessage('A little drool.'); }],
    [1900,()=>{ setMessage('The head tilt.'); }],
    [2300,()=>{ setMessage('One paw tap.'); sfxs('select'); }],
    [2650,()=>{ sfx.whine(); scene('nv_text',.7,{x:nx,y:ny-NH()-28,txt:'WHINE',c:CREAM,sc:1}); }],
    [2950,()=>{ if(!self) scene('nv_text',1.1,{x:H.x,y:H.top-44,txt:'FINE.',c:CREAM,sc:2}); const p={x:nx-30,y:ny-NH()*.55}; ST.fly((x,y)=>{ RO(x-7,y-3,14,6,'#e8b878'); },pl.x+12,pl.y-10,p.x,p.y,.3,24); }],
    ['hf',3250],
    [3250,()=>{ E2.apply(); sfx.heal(); scene('nv_glow',.9,{x:H.x,y:H.mid,c:'#ffb070'}); scene('nv_hearts',1.2,{x:nx,y:ny-NH()}); if(!self) { scene('nv_hearts',1.2,{x:H.x,y:H.top}); hopOf(t); } }],
    [4500,'end',kindLine(t,'They share. Everybody feels better. Nara most of all.')]]); };

// ---------- Counter Surfer (A4) ----------
// A kitchen counter behind the monster with its snack on it (glowing: that is its buff). Nara tiptoes over, paws up,
// snatches it, and bolts. The buff goes with the snack.
SC.nv_counter=(s,u)=>{ const x=s.x,y=s.y,w=84; gfx.globalAlpha=fin(u,.08)*fade(u,.93);
  RO(x-w/2,y-6,w,42,'#c9a06a'); R(x-w/2,y+4,w,2,'#a07a48'); RO(x-w/2+8,y+10,w/2-12,20,'#b98a52'); RO(x+4,y+10,w/2-12,20,'#b98a52'); E(x-6,y+20,2,2,OUT); E(x+10,y+20,2,2,OUT); RO(x-w/2-4,y-12,w+8,8,'#eae4d6');
  if(!s.gone||s.t*1000<s.gone) { const cx=x-10,cy=y-14; const g=.5+.5*Math.sin(s.t*6); gfx.globalAlpha*=1; E(cx,cy-10,26,20,'rgba(255,224,138,'+(.25+g*.2)+')');
    RO(cx-10,cy-10,20,10,'#e88aa8'); EO(cx,cy-14,12,7,'#fff1f4'); EO(cx,cy-22,3,3,RED); label('SNACK',cx,cy-40,CREAM,1); label('^',cx+18,cy-26,GOLD,2); } };
SC.nv_snack=(s,u)=>{ if(!s.on()) return; const p=mouth(); gfx.save(); gfx.translate(p.x-6,p.y+2); RO(-8,-6,16,8,'#e88aa8'); EO(0,-9,9,5,'#fff1f4'); EO(0,-15,2.5,2.5,RED); gfx.restore(); gfx.globalAlpha=.9; label('^',p.x+14,p.y-26+Math.sin(s.t*8)*3,GOLD,2); };
N.counter_surfer=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),cx=Math.min(500,F.x+F.w*.5+40),cy=Math.max(150,F.base-44),nx=Math.min(556,cx+40),ny=Math.min(316,F.base+8);
  let has=false;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'walk',dy:(u,tt)=>Math.abs(Math.sin(tt*9))*-2},{t:1700,x:nx,y:ny,f:'idle',rot:-.05},{t:1850,f:'act',rot:u=>ez(u/.5)*.5,dy:u=>-ez(u/.5)*14},{t:2250,f:'runR'},{t:2900,x:620,y:ny-6,f:'runR'},{t:3400,x:620,f:'run'},{t:4000,x:'home',y:'home',f:'idle',rot:wag}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A kitchen counter. On it: '+f.name+'’s snack. Unguarded.'); say(m.id,'counter_surfer'); scene('nv_counter',4.5,{x:cx,y:cy,gone:2150}); }],
    [600,()=>{ setMessage('Nara tiptoes. Nara has never tiptoed in her life. She tiptoes now.'); }],
    [1850,()=>{ setMessage('Paws up on the counter.'); }],
    ['hf',2150],
    [2150,()=>{ has=true; sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('nv_text',1,{x:F.x,y:F.top-20,txt:'HEY!',c:CREAM,sc:3}); scene('nv_big',1.1,{x:F.x,y:F.top-74,txt:'SNATCHED!',c:GOLD,sc:3}); scene('nv_snack',2.0,{on:()=>has}); }],
    [2300,()=>{ barks(2,.1); sfxs('run'); setMessage('She runs off with it. The good feeling goes with the snack.'); }],
    [3100,()=>{ has=false; sfxs('pickup'); scene('nv_text',1,{x:548,y:ny-NH()-20,txt:'CHOMP',c:CREAM,sc:2}); }],
    [4200,'end',res(E2)+'Nara has eaten the evidence.']]); };

// ---------- Stranger Alert (A5) ----------
// She sits in a window, very still, ears up. Strangers on HER street (the whole row). Then BARK BARK BARK: they freeze.
SC.nv_window=(s,u)=>{ const x=s.x,y=s.y,w=s.w,h=s.h; gfx.globalAlpha=fin(u,.08)*fade(u,.93);
  gfx.save(); gfx.globalAlpha*=.18; R(x-w/2,y,w,h,'#bfe0ff'); gfx.restore();
  RO(x-w/2-6,y-6,w+12,8,'#f4efe6'); RO(x-w/2-6,y+h-2,w+12,8,'#f4efe6'); RO(x-w/2-6,y,6,h,'#f4efe6'); RO(x+w/2,y,6,h,'#f4efe6'); RO(x-2,y,4,h,'#f4efe6'); RO(x-w/2,y+h*.45,w,4,'#f4efe6');
  for(const sd of [-1,1]) { gfx.beginPath(); gfx.moveTo(x+sd*(w/2+6),y-6); gfx.lineTo(x+sd*(w/2+26),y-6); gfx.lineTo(x+sd*(w/2+18),y+h+6); gfx.lineTo(x+sd*(w/2+6),y+h+6); gfx.closePath(); gfx.fillStyle='#d8607a'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); } };
SC.nv_bark=(s,u)=>{ const q=ez(u); gfx.globalAlpha=1-u; for(let k=0;k<3;k++) { const r=20+q*(s.r||260)-k*18; if(r<4) continue; gfx.strokeStyle=k%2?GOLD:CREAM; gfx.lineWidth=6-k; gfx.beginPath(); gfx.arc(s.x,s.y,r,Math.PI*.8,Math.PI*1.2); gfx.stroke(); } };
SC.nv_freeze=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); for(const F of s.list) { gfx.strokeStyle=ICE; gfx.lineWidth=3; gfx.setLineDash([6,4]); gfx.strokeRect(F.x-F.w*.5-6,F.top-6,F.w+12,F.h+10); gfx.setLineDash([]);
    for(let k=0;k<4;k++) { const sx=F.x-F.w*.5+k*F.w/3; gfx.beginPath(); gfx.moveTo(sx-5,F.base+4); gfx.lineTo(sx,F.base-12); gfx.lineTo(sx+5,F.base+4); gfx.closePath(); gfx.fillStyle=ICE; gfx.fill(); gfx.lineWidth=2; gfx.strokeStyle=OUT; gfx.stroke(); } } };
N.stranger_alert=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),H0=homeOf(m),wy=H0.y-NH()-18,nh=NH();
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'sit'},{t:1400,f:'sit',rot:.05},{t:1850,f:'act',rot:u=>Math.sin(u*Math.PI*6)*.08,dy:u=>-Math.abs(Math.sin(u*Math.PI*3))*8},{t:3000,f:'sit'},{t:4300,f:'idle'}]);
  const hitB=(k,amt)=>()=>{ barks(1); scene('nv_bark',.6,{x:H0.x-40,y:H0.y-nh*.6,r:H0.x-G.x0}); scene('nv_big',.8,{x:G.x+(k-1)*70,y:G.top-60-k*14,txt:'BARK!',c:k%2?CREAM:GOLD,sc:3+(k===2?1:0)}); for(const f of list) ST.jolt(f,.4); landHit(amt); };
  ST.play(E2,[
    [0,()=>{ setMessage('Nara sits at the window. Very still. Ears up.'); say(m.id,'stranger_alert'); scene('nv_window',4.4,{x:H0.x,y:wy,w:Math.max(96,BATTLE_SPRITES.nara.idle[0].length*2+20),h:nh+24}); }],
    [700,()=>{ scene('nv_text',1.2,{x:H0.x,y:wy-14,txt:'...',c:CREAM,sc:3}); }],
    [1400,()=>{ setMessage('Strangers. On HER street.'); scene('nv_text',.6,{x:H0.x,y:wy-14,txt:'!',c:GOLD,sc:4}); sfx.boing(); }],
    ['hf',1900],
    [1900,hitB(0,34)],[2250,hitB(1,33)],[2600,hitB(2,33)],
    [2800,()=>{ scene('nv_freeze',1.5,{list:list.map(f=>ST.unit(f))}); scene('nv_text',1.3,{x:G.x,y:G.base+16,txt:'FROZEN',c:ICE,sc:2}); setMessage('Nobody moves. Nobody even blinks.'); }],
    [4400,'end',res(E2)+'The street is safe. Nara is very proud of herself.']]); };

// ---------- Doodle Fluff (B1) ----------
// She shakes out her big curly coat into a huge cloud, then flops on the friend like a warm curly blanket.
SC.nv_fluff=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.6); for(let k=0;k<26;k++) { const a=k/26*Math.PI*2+s.seed,d=q*(30+(k%5)*14),r=(8+(k%3)*4)*(.5+q*.8),x=s.x+Math.cos(a)*d*1.3,y=s.y+Math.sin(a)*d*.8;
    E(x,y,r+2,r+2,OUT); E(x,y,r,r,k%2?FUR2:FUR3); E(x-r*.3,y-r*.3,r*.3,r*.3,'#6a5a5a'); } };
SC.nv_blanket=(s,u)=>{ const F=s.F,w=F.w*.75+18,cx=F.x,cy=F.base-F.h*.38,dr=ez(u/.15),b=Math.sin(s.t*3)*1.5; gfx.globalAlpha=fade(u,.9);
  gfx.save(); gfx.translate(cx,cy-(1-dr)*30+b); E(0,0,w*.5+3,F.h*.3+3,OUT); E(0,0,w*.5,F.h*.3,FUR);
  for(let k=0;k<16;k++) { const x=-w*.45+(k%8)*w*.13,y=-F.h*.16+Math.floor(k/8)*F.h*.2,r=7+(k%3)*2; E(x,y,r,r*.85,k%2?FUR2:FUR3); }
  const hx=-w*.5-6,hy=-F.h*.12; E(hx,hy,15,13,OUT); E(hx,hy,13,11,FUR2); E(hx-10,hy+2,4,3,'#0b0909'); E(hx-3,hy-3,2,2,'#fff'); E(hx+4,hy-3,2,2,'#fff'); E(hx-6,hy+9,4,5,'#ee95aa');
  E(w*.5+2,-F.h*.2,6,6,FUR3); gfx.restore(); if(u>.3&&u<.85) label('COZY',cx,cy-F.h*.3-26,GOLD,2); };
N.doodle_fluff=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,U=ST.unit(t),sp=spotFor(m,t),self=sp.self,foe=t.side==='foe';
  const fl=self?{x:U.x,y:U.base}:{x:U.x,y:U.base};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:800,x:sp.x,y:sp.y,f:'idle'},{t:1000,f:'idle',rot:(u,tt)=>Math.sin(tt*45)*.3,dx:(u,tt)=>Math.sin(tt*45)*4},{t:2000,f:'celeb',hop:22},{t:2300,x:fl.x,y:fl.y,f:'idle',hide:true},
    {t:3900,x:Math.min(560,U.x+U.w*.5+20),y:Math.min(316,U.base+3),f:'celeb',hop:10},{t:4200,f:self?'idle':'runR'},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara walks over to '+(self?'a nice spot':t.name)+' and shakes out her big curly coat.'); say(m.id,'doodle_fluff'); }],
    [1000,()=>{ const s0=sp.self?homeOf(m):sp; scene('nv_fluff',1.4,{x:s0.x,y:s0.y-NH()*.5}); sfxs('spray'); }],
    [1150,()=>{ const s0=sp.self?homeOf(m):sp; scene('nv_big',1.2,{x:s0.x-20,y:s0.y-NH()-40,txt:'FLOOF!',c:CREAM,sc:4}); }],
    [2000,()=>{ setMessage('Then she flops on '+(self?'the floor':t.name)+' like a warm curly blanket.'); sfx.boing(); }],
    [2300,()=>{ scene('nv_blanket',1.6,{F:U}); sfx.thud(); }],
    ['hf',2600],
    [2600,()=>{ E2.apply(); sfx.heal(); scene('nv_glow',1,{x:U.x,y:U.mid,c:'#ffb45a'}); scene('nv_hearts',1.3,{x:U.x,y:U.top}); if(foe) ST.jolt(t,.15); }],
    [4900,'end',kindLine(t,'Forty pounds of warm curly blanket. Every worry, gone.')]]); };

// ---------- Shake It Off, Everyone (B2, kept) ----------
// Same beats as before, plus one big spray across the whole screen.
SC.nv_bigspray=(s,u)=>{ for(let k=0;k<70;k++) { const a=(k*137.5%360)/180*Math.PI,sp=.5+((k*31)%50)/50,d=ez(u)*700*sp,x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d*.6+u*u*60; if(x<-10||x>590||y<-10||y>334) continue; gfx.globalAlpha=1-cl((u-.6)/.4); E(x,y,3+(k%3),4+(k%3),k%3?WATER:'#e6f7ff'); } };
N.shake_everyone=E2=>{ const {m,fx}=E2,tg=E2.targets||[],kind=tg.length===1&&tg[0].side==='foe',to=tg.map(t=>{ const U=ST.unit(t); return {x:U.x,y:U.mid,u:t}; });
  const cx=kind?ST.unit(tg[0]).x+ST.unit(tg[0]).w*.5+40:420,cy=kind?ST.unit(tg[0]).base+3:Math.min(318,BATTLE_POS[m.idx].base*3+2);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:cx,y:cy,f:'idle'},{t:1000,f:'idle',rot:u=>u>.3&&u<.5?.08:0},{t:1500,f:'idle',rot:(u,tt)=>Math.sin(tt*45)*.28,dx:(u,tt)=>Math.sin(tt*45)*4},{t:2400,f:'celeb',hop:10,hn:2},{t:3000,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara walks into the middle of everyone, slightly wet.'); say(m.id,'shake_everyone'); }],
    [1100,()=>{ scene('nv_text',.5,{x:cx,y:cy-NH()-20,txt:'!',c:CREAM,sc:3}); setMessage('One warning shoulder twitch. Nobody notices in time.'); }],
    [1500,()=>{ scene('nv_bigspray',1.6,{x:cx,y:cy-NH()*.5}); scene('na_spray',1.4,{to}); sfxs('spray'); sfx.splat&&sfx.splat(); scene('nv_big',1.2,{x:288,y:60,txt:'SHAKE SHAKE SHAKE',c:WATER,sc:3}); }],
    ['hf',2000],
    [2000,()=>{ E2.apply(); sfx.heal(); scene('na_tiles',.8,{to}); for(const o of to) { if(o.u.side==='party'&&o.u!==m) battle.fx[o.u.idx].hop=.3; if(o.u.side==='foe') ST.jolt(o.u,.2); } }],
    [3700,'end',kindLine(kind?tg[0]:null,'Everyone looks better after a shake. Damper, too.')]]); };

// ---------- Happy Puddle (B4) ----------
// She is SO excited to see the front row. Bounce, bounce, wag. A happy puddle spreads under their feet. They slip.
SC.nv_puddle=(s,u)=>{ const a=fin(u,.05)*fade(u,.92)*.9; s.spots.forEach((p,k)=>{ const g=ez((u-k*.06)/.25); if(g<=0) return; const x=lerp(s.sx,p.x,g),rx=lerp(6,p.w*.5+18,g),ry=10*g;
  gfx.globalAlpha=a; E(x,p.y,rx+2,ry+2,'#c9bd48'); E(x,p.y,rx,ry,PEE); E(x-rx*.3,p.y-ry*.3,rx*.4,ry*.3,'#f6f0b0');
  for(let j=0;j<3;j++) { const q=(s.t*1.5+j/3+k*.2)%1; gfx.globalAlpha=(1-q)*a; label('+',x-rx*.5+j*rx*.5,p.y-6-q*10,'#fffbd0',1); } }); };
N.happy_puddle=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),px=Math.min(530,G.x1+44),py=Math.min(316,G.base+6),Ps=list.map(f=>ST.unit(f));
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:px,y:py,f:'celeb',hop:18,hn:4,rot:wag},{t:1700,f:'idle',rot:wag},{t:2000,f:'runR'},{t:2400,x:Math.min(556,px+60),y:py,f:'sit'},{t:3300,f:'sit',rot:-.14},{t:3900,f:'runR'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara sees the whole front row. She\'s SO excited.'); say(m.id,'happy_puddle'); barks(3,.12); }],
    [800,()=>{ scene('nv_text',.9,{x:px,y:py-NH()-24,txt:'WIGGLE WIGGLE',c:GOLD,sc:2}); }],
    [1500,()=>{ scene('nv_puddle',3.0,{sx:px-20,spots:Ps.map(F=>({x:F.x,y:F.base+2,w:F.w}))}); sfx.splat&&sfx.splat(); setMessage('A happy little puddle. It spreads. Right under their feet.'); }],
    [2100,()=>{ sfx.slideWhistle(); ST.draw((s,u)=>{ const q=u; list.forEach((f,k)=>{ const sd=k%2?1:-1,F=Ps[k];
        const sp=q<.35?Math.sin(q*60+k)*.14*ez(q/.35):(q<.8?sd*.5*ez((q-.35)/.15):sd*.5*(1-ez((q-.8)/.2))),oy=q<.35?0:(q<.5?-F.h*.18*Math.sin((q-.35)/.15*Math.PI/2):lerp(-F.h*.18,6,ez((q-.5)/.1))*(1-ez((q-.8)/.2))),ox=q<.35?Math.sin(q*44+k)*6:0;
        lift(f,oy,sp,ox); }); },1.5); Ps.forEach((F,k)=>scene('nv_text',.8,{x:F.x,y:F.top-14,txt:'WHOA',c:CREAM,sc:2})); }],
    ['hf',2700],
    [2700,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.4); landHit(100); scene('nv_big',1.1,{x:G.x,y:G.top-74,txt:'SLIP!',c:PEE,sc:4}); }],
    [3300,()=>{ scene('nv_text',1,{x:Math.min(556,px+60),y:py-NH()-24,txt:'?',c:CREAM,sc:3}); }],
    [4600,'end',res(E2)+'The front row lost its footing. Nara lost nothing. She\'s delighted.']]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Jump Up: a bigger rear-up with big paws planted, held still for Tom's line in a speech bubble. Tennis Ball Fetch: a
// bigger ball, speed lines across the screen and a big FETCH. Just One Bite?: a bigger sandwich and a long drool drip.
// Counter Surfer: a bigger counter and cake, and she runs off with it. Shake It Off, Everyone: a much bigger spray, with
// drops landing on the screen. Not Leaving: a bigger lean-in and a big heart. Happy Puddle: a bigger puddle and a
// cartoon slip, feet up. Family Food Inspector: bigger dishes and a big paw stamp. Same numbers, same beats. Overrides
// SC.nv_paws, SC.nv_speed, SC.nv_bigspray, SC.nv_puddle and N.jump_up, N.tennis_ball_fetch, N.just_one_bite,
// N.counter_surfer, N.not_leaving, N.happy_puddle, N.food_inspector. Scenes prefix np_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const heartO=(x,y,r,c)=>{ heart(x,y,r+2.5,OUT); heart(x,y,r,c); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const bigWord=(txt,x,y,c,sc)=>{ const w=(txt.length*4-1)*sc; x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(8,y); const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const N=RECRUIT_MOVES.nara;
const CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',BALL='#d8ef4a',WATER='#8fd0ff',RED='#e0402e',PEE='#e9e07a';
ST.nw('np_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const mouth=()=>ST.hand();
const barks=(n,gap=.14)=>{ for(let k=0;k<n;k++) sfx.bark(k*gap); };
const sfxs=k=>{ if(sfx[k]) sfx[k](); };
const wag=(u,tt)=>Math.sin(tt*26)*.07;
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+(t.side==='foe'?34:26)),y:Math.min(316,u.base+3)}; };
const tomU=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const NH=()=>BATTLE_SPRITES.nara.idle.length*BATTLE_SPRITES.nara.scale;
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const ball=(x,y,r=14)=>{ if(PROPART.draw('nara/tennis_ball',x,y,{h:(r+2)*2.2})) return; E(x,y,r+2,r+2,OUT); E(x,y,r,r,BALL); E(x-r*.3,y-r*.3,r*.35,r*.35,'#f2ffa0'); gfx.strokeStyle=CREAM; gfx.lineWidth=Math.max(2,r*.2); gfx.beginPath(); gfx.arc(x-r,y,r,-.9,.9); gfx.stroke(); gfx.beginPath(); gfx.arc(x+r,y,r,Math.PI-.9,Math.PI+.9); gfx.stroke(); };
const paw=(x,y,r,c)=>{ E(x,y+r*.3,r*.75,r*.6,c); for(let k=0;k<4;k++) E(x-r*.9+k*r*.6,y-r*.55-(k===1||k===2?r*.2:0),r*.28,r*.32,c); };
// A speech bubble with a tail pointing down at the speaker.
SC.np_say=(s,u)=>{ const sc=s.sc||2,w=(s.txt.length*4-1)*sc+22,h=sc*5+16,pop=u<.1?ez(u/.1)*1.15:lerp(1.15,1,cl((u-.1)/.1)); let x=Math.max(w/2+6,Math.min(570-w/2,s.x)),y=Math.max(h/2+6,s.y);
  gfx.globalAlpha=fade(u,.88); gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop);
  poly([[s.tx-x-8,h/2-2],[s.tx-x+8,h/2-2],[s.tx-x+2,h/2+14]],'#fffaf0',3); RO(-w/2,-h/2,w,h,'#fffaf0'); R(-w/2+4,h/2-4,w-8,2,'#e8dcc4'); label(s.txt,0,-sc*2.5,OUT,sc); gfx.restore(); };
SC.np_streaks=(s,u)=>{ const p=ST.cur; if(!p||p.x==null) return; gfx.globalAlpha=fade(u,.8)*.9; const dir=s.dir||1;
  for(let k=0;k<9;k++) { const y=p.y-6-k*9-((k*13)%7),len=70+((k*47)%110),x0=p.x+dir*(30+((k*23)%20)); LnO(x0,y,x0+dir*len,y,k%3?2:3,k%2?CREAM:'#ffffff'); }
  for(let k=0;k<4;k++) { const q=(s.t*3+k/4)%1; gfx.globalAlpha=(1-q)*.7; E(p.x+dir*(24+q*50),p.y-2-q*10,5+q*8,4+q*5,'#e8dcc4'); } };

// ---------- Jump Up: a bigger rear-up, big paws, a held pose for Tom's line ----------
SC.nv_paws=(s,u)=>{ const p=ez(u/.1); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(p,p); for(const [dx,dy] of [[-24,10],[24,-8]]) { if(PROPART.draw('nara/muddy_paw_print',dx,dy,{h:50,rot:dx<0?-.25:.25})) continue; paw(dx,dy,22,OUT); paw(dx,dy,18,'#5a3a24'); E(dx,dy+6,7,5,'#7a5038'); } gfx.restore(); };
N.jump_up=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),px=Math.min(556,F.x+F.w*.5+30),py=Math.min(316,F.base+3),tom=tomU(),T=tom&&ST.unit(tom);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'celeb',rot:wag,hop:8,hn:3},{t:500,f:'run'},{t:1100,x:px+18,y:py,f:'wind',rot:(u,tt)=>Math.sin(tt*40)*.04},{t:1350,x:px,f:'act',rot:u=>ez(u/.6)*.8,dy:u=>-ez(u/.6)*30},
    {t:1700,f:'act',rot:.8,dy:-30},{t:3200,f:'act',rot:(u,tt)=>.8+Math.sin(tt*18)*.05,dy:(u,tt)=>-30+Math.sin(tt*18)*2},{t:3450,f:'idle',rot:u=>.8*(1-ez(u)),dy:u=>-30*(1-ez(u))},{t:3750,f:'celeb',rot:wag,hop:5,hn:2},{t:4150,f:'runR'},{t:4750,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara spots '+f.name+'. A new friend! A NEW FRIEND!'); say(m.id,'jump_up'); barks(2); }],
    [1350,()=>{ setMessage('Up she goes. Both front paws, right on it.'); sfx.whoosh(); }],
    ['hf',1550],
    [1550,()=>{ sfx.thud(); ST.jolt(f,.55); landHit(100); scene('nv_paws',2.6,{x:F.x+F.w*.1,y:F.top+F.h*.4}); scene('nv_coins',1.3,{x:F.x,y:F.mid}); scene('nv_big',1.2,{x:F.x,y:F.top-74,txt:'UP UP UP!',c:GOLD,sc:4}); }],
    [1700,()=>{ sfxs('coin'); }],
    [1950,()=>{ if(T) { say('tom','nara_no_jump'); hopOf(tom); scene('np_say',1.9,{x:T.x,y:T.top-30,tx:T.x,txt:'NARA! NO JUMPING!',sc:2}); setMessage('Tom, from across the room: Nara, no jumping!'); } else setMessage('Somebody says no jumping. Nobody means it.'); }],
    [2500,()=>{ scene('nv_text',.9,{x:px,y:py-NH()-56,txt:'...',c:CREAM,sc:3}); }],
    [3450,()=>{ setMessage('She drops down. Tail going. Not sorry.'); scene('nv_text',1.2,{x:px,y:py-NH()-24,txt:'WAG WAG',c:GOLD,sc:3}); }],
    [4850,'end',res(E2)+'Nara greets everybody the same way. Paws first.']]); };

// ---------- Tennis Ball Fetch: a bigger ball, speed lines, a big FETCH ----------
SC.nv_speed=(s,u)=>SC.np_streaks(Object.assign(s,{dir:1}),u);
N.tennis_ball_fetch=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),H0=homeOf(m),lx=Math.max(30,F.x-F.w*.5-50),ly=Math.min(316,F.base+4),tom=tomU(),T=tom&&ST.unit(tom);
  let hold=false,drop=null;
  const ex=lx+30,cross=F.x+F.w*.2; let uu=.5; for(let k=0;k<30;k++) { const x=lerp(H0.x,ex,ez(uu)); uu+=(x>cross?1:-1)*.5/Math.pow(2,k+1); } const hit=Math.round(700+uu*800);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'wind',rot:(u,tt)=>Math.sin(tt*30)*.05},{t:700,f:'run',ns:true},{t:1500,x:ex,y:ly,f:'celeb',hop:10},{t:1900,f:'runR'},{t:3000,x:'home',y:'home',f:'sit'},{t:3800,f:'sit',rot:-.12}]);
  ST.play(E2,[
    [0,()=>{ setMessage(T?'Tom holds up the tennis ball. Nara stops breathing.':'Nara noses her tennis ball into the air.'); say(m.id,'tennis_ball_fetch'); }],
    [300,()=>{ const a=T?{x:T.x-10,y:T.top+16}:mouth(); ST.fly((x,y,u)=>{ gfx.globalAlpha=.35; ball(x+18,y+6,16); gfx.globalAlpha=1; ball(x,y,20); },a.x,a.y,lx,ly-20,.9,150); sfx.whoosh(); if(T) hopOf(tom); setMessage('The ball flies. She\'s GONE.'); }],
    [700,()=>{ barks(2,.1); scene('np_streaks',.85,{dir:1}); scene('nv_big',.9,{x:(H0.x+ex)/2,y:84,txt:'ZOOM',c:CREAM,sc:3,rot:-.08}); sfxs('run'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('nv_dust',.7,{x:F.x,y:F.base,r:56}); scene('nv_flash',.25,{a:.3}); scene('nv_big',1.2,{x:F.x,y:F.top-74,txt:'FETCH!',c:BALL,sc:5}); }],
    [1200,()=>{ ST.fly((x,y)=>ball(x,y,20),lx,ly-20,lx,ly-20,.3,16,0,{ease:'lin'}); sfxs('squeak'); }],
    [1500,()=>{ hold=true; ST.draw(()=>{ if(hold) { const p=mouth(); ball(p.x-8,p.y+4,15); } else if(drop) ball(drop.x,drop.y,15); },2.4); barks(1); setMessage('Got it. Very proud. Very slobbery.'); }],
    [1900,()=>{ scene('np_streaks',1.0,{dir:-1}); }],
    [3000,()=>{ hold=false; const p=mouth(); drop={x:p.x-30,y:Math.min(316,BATTLE_POS[m.idx].base*3-12)}; sfxs('squeak'); scene('nv_text',1.1,{x:H0.x,y:H0.y-NH()-24,txt:'AGAIN?',c:GOLD,sc:3}); }],
    [3900,'end',res(E2)+'She\'ll do that forty more times if anyone lets her.']]); };

// ---------- Just One Bite?: a bigger sandwich and a long drool drip ----------
SC.np_plate=(s,u)=>{ const x=s.x,y=s.y,bit=s.biteAt!=null&&s.t*1000>s.biteAt; gfx.globalAlpha=fin(u,.08)*fade(u,.92);
  if(PROPART.ready('nara/sandwich_plate')&&PROPART.ready('nara/sandwich_bitten')) { PROPART.draw(bit?'nara/sandwich_bitten':'nara/sandwich_plate',x,y-24,{w:104});
    if(s.t>.3&&!bit) for(let k=0;k<3;k++) { const q=(s.t*.9+k*.33)%1; gfx.globalAlpha=(1-q)*.6; E(x-16+k*16+Math.sin(q*6+k)*4,y-52-q*30,5+q*4,5+q*4,'#ffffff'); } return; }
  EO(x,y,48,11,'#f4f2ea'); E(x,y-2,34,6,'#e2ded2');
  RO(x-36,y-34,72,12,'#e8b878'); R(x-34,y-32,68,3,'#f4d09a'); poly([[x-38,y-22],[x+38,y-22],[x+34,y-16],[x+20,y-20],[x+6,y-15],[x-10,y-20],[x-24,y-15],[x-38,y-18]],'#7fc46a',2);
  RO(x-34,y-16,68,5,'#e05a4a'); R(x-30,y-15,10,2,'#ff8a7a'); R(x-4,y-15,10,2,'#ff8a7a'); RO(x-36,y-10,72,10,'#e8b878');
  if(bit) { E(x+34,y-22,14,14,'#f4f2ea'); E(x+26,y-10,9,8,'#f4f2ea'); E(x+30,y-34,8,6,'#f4f2ea'); }
  if(s.t>.3&&!bit) for(let k=0;k<3;k++) { const q=(s.t*.9+k*.33)%1; gfx.globalAlpha=(1-q)*.6; E(x-16+k*16+Math.sin(q*6+k)*4,y-42-q*30,5+q*4,5+q*4,'#ffffff'); } };
SC.np_drool=(s,u)=>{ const p=mouth(),ms=s.t*1000,per=900,q=(ms%per)/per,n=Math.floor(ms/per); gfx.globalAlpha=fade(u,.9);
  const x=p.x-4,y0=p.y+6,floor=s.floor;
  if(q<.6) { const L=ez(q/.6)*26; E(x,y0+L*.5,3,L*.5+3,'#e6f7ff'); E(x,y0+L,5,6,'#e6f7ff'); E(x-1.5,y0+L-2,1.5,2,'#ffffff'); }
  else { const fq=(q-.6)/.4,yy=lerp(y0+26,floor-4,fq*fq); E(x,y0+4,2.5,5,'#e6f7ff'); E(x,yy,4,6,'#e6f7ff'); }
  const pud=cl((n+(q>.95?1:0))/3); if(pud>0||n>0) { gfx.globalAlpha=fade(u,.9)*.85; E(x,floor,8+pud*14,3+pud*3,'#cfeeff'); E(x-3,floor-1,4+pud*5,1.2,'#ffffff'); } };
N.just_one_bite=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,foe=t.side==='foe',H0=homeOf(m);
  const ny=foe?Math.min(316,H.base+4):Math.min(320,(self?H0.y:H.base)+24),nx=foe?Math.min(560,H.x+H.w*.5+76):Math.min(556,(self?H0.x:H.x)+14),pl={x:nx-80,y:ny};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:800,x:nx,y:ny,f:'sit'},{t:1900,f:'sit',rot:u=>-.2*ez(u/.3)},{t:2300,f:'act',rot:-.2,dx:u=>-Math.abs(Math.sin(u*Math.PI*2))*8},{t:2700,f:'sit',rot:-.2},{t:3300,f:'celeb',hop:8,hn:2,rot:wag},{t:3800,f:self?'idle':'runR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  scene('np_plate',4.4,{x:pl.x,y:pl.y,biteAt:3050});
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Nara finds a sandwich. She waits for permission anyway.':'There\'s a sandwich by '+t.name+'. Nara sits next to it. Very politely.'); say(m.id,'just_one_bite'); }],
    [900,()=>{ scene('nv_text',1.5,{x:pl.x+20,y:pl.y-NH()-40,txt:'JUST ONE BITE?',c:GOLD,sc:3}); }],
    [1150,()=>{ scene('np_drool',2.1,{floor:ny-2}); setMessage('A little drool. Then a lot of drool.'); }],
    [1900,()=>{ setMessage('The head tilt.'); }],
    [2300,()=>{ setMessage('One paw tap.'); sfxs('select'); }],
    [2650,()=>{ sfx.whine(); scene('nv_text',.8,{x:nx,y:ny-NH()-30,txt:'WHINE',c:CREAM,sc:2}); }],
    [2950,()=>{ if(!self) scene('nv_text',1.1,{x:H.x,y:H.top-44,txt:'FINE.',c:CREAM,sc:3}); const p={x:nx-30,y:ny-NH()*.55}; ST.fly((x,y)=>{ RO(x-14,y-5,28,10,'#e8b878'); R(x-12,y-1,24,2,'#7fc46a'); },pl.x+24,pl.y-22,p.x,p.y,.3,30); }],
    ['hf',3250],
    [3250,()=>{ E2.apply(); sfx.heal(); scene('nv_glow',.9,{x:H.x,y:H.mid,c:'#ffb070'}); scene('nv_hearts',1.2,{x:nx,y:ny-NH(),n:7}); if(!self) { scene('nv_hearts',1.2,{x:H.x,y:H.top}); hopOf(t); } }],
    [4500,'end',kindLine(t,'They share. Everybody feels better. Nara most of all.')]]); };

// ---------- Counter Surfer: a bigger counter and cake; she runs off with it ----------
const cake=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); EO(0,2,16,4,'#f4f2ea'); poly([[-12,0],[12,0],[12,-12],[-12,-16]],'#f4c7d4',2); R(-12,-8,24,3,'#ffffff'); poly([[-12,-16],[12,-12],[14,-15],[-10,-20]],'#fff1f4',2); EO(0,-20,3,3,RED); R(-.5,-26,1.5,5,'#4f8a3a'); gfx.restore(); };
SC.np_counter=(s,u)=>{ const x=s.x,y=s.y,w=128; gfx.globalAlpha=fin(u,.08)*fade(u,.93); const a0=gfx.globalAlpha;
  RO(x-w/2,y,w,62,'#c9a06a'); R(x-w/2,y+10,w,2,'#a07a48'); RO(x-w/2+8,y+16,w/2-14,40,'#b98a52'); RO(x+6,y+16,w/2-14,40,'#b98a52'); EO(x-12,y+36,3,3,'#e8dcc4'); EO(x+14,y+36,3,3,'#e8dcc4'); RO(x-w/2-6,y-8,w+12,10,'#eae4d6'); R(x-w/2-4,y-6,w+8,3,'#ffffff');
  if(!s.gone||s.t*1000<s.gone) { const cx=x-12,cy=y-8,g=.5+.5*Math.sin(s.t*6); gfx.globalAlpha=a0*(.25+g*.2); E(cx,cy-22,44,34,GOLD); gfx.globalAlpha=a0; cake(cx,cy,2.4);
    bigWord('SNACK',cx,cy-78,CREAM,2); label('^',cx+44,cy-50+Math.sin(s.t*8)*3,GOLD,3); }
  else if(s.t*1000<s.gone+500) { gfx.globalAlpha=a0*(1-(s.t*1000-s.gone)/500); bigWord('GONE',x-12,y-34,RED,3); } };
SC.np_snack=(s,u)=>{ if(!s.on()) return; const p=mouth(); cake(p.x-14,p.y+10,1.6); gfx.globalAlpha=.9; label('^',p.x+18,p.y-34+Math.sin(s.t*8)*3,GOLD,3); };
N.counter_surfer=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),cx=Math.min(488,F.x+F.w*.5+66),cy=Math.max(120,F.base-72),nx=Math.min(556,cx+58),ny=Math.min(316,F.base+8);
  let has=false;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'walk',dy:(u,tt)=>Math.abs(Math.sin(tt*9))*-2},{t:1700,x:nx,y:ny,f:'idle',rot:-.05},{t:1850,f:'act',rot:u=>ez(u/.5)*.6,dy:u=>-ez(u/.5)*22},{t:2250,f:'runR'},{t:2900,x:640,y:ny-6,f:'runR'},{t:3400,x:640,f:'run'},{t:4000,x:'home',y:'home',f:'idle',rot:wag}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A kitchen counter. On it: '+f.name+'’s snack. Unguarded.'); say(m.id,'counter_surfer'); scene('np_counter',4.5,{x:cx,y:cy,gone:2150}); }],
    [600,()=>{ setMessage('Nara tiptoes. Nara has never tiptoed in her life. She tiptoes now.'); scene('nv_text',1.1,{x:nx+10,y:ny-NH()-30,txt:'TIPTOE',c:CREAM,sc:2}); }],
    [1850,()=>{ setMessage('Paws up on the counter.'); }],
    ['hf',2150],
    [2150,()=>{ has=true; sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('nv_text',1,{x:F.x,y:F.top-20,txt:'HEY!',c:CREAM,sc:3}); scene('nv_big',1.1,{x:F.x,y:F.top-74,txt:'SNATCHED!',c:GOLD,sc:4}); scene('np_snack',2.0,{on:()=>has}); }],
    [2300,()=>{ barks(2,.1); sfxs('run'); scene('np_streaks',.7,{dir:-1}); setMessage('She runs off with it. The good feeling goes with the snack.'); }],
    [3100,()=>{ has=false; sfxs('pickup'); scene('nv_big',1.1,{x:520,y:ny-NH()-30,txt:'CHOMP',c:CREAM,sc:4}); }],
    [4200,'end',res(E2)+'Nara has eaten the evidence.']]); };

// ---------- Shake It Off, Everyone: a much bigger spray, and drops on the screen ----------
SC.nv_bigspray=(s,u)=>{ const al=1-cl((u-.65)/.35);
  for(let k=0;k<150;k++) { const a=(k*137.5%360)/180*Math.PI,sp=.4+((k*31)%60)/60,d=ez(u)*720*sp,x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d*.6+u*u*70; if(x<-12||x>588||y<-12||y>336) continue;
    const r=3+(k%4)*1.6; gfx.globalAlpha=al*.8; Ln(x-Math.cos(a)*r*4,y-Math.sin(a)*r*2.4,x,y,Math.max(1.5,r*.6),'rgba(230,247,255,.8)'); gfx.globalAlpha=al; E(x,y,r,r*1.25,k%3?WATER:'#e6f7ff'); }
  for(let k=0;k<10;k++) { const t0=.28+k*.035; if(u<t0) continue; const q=(u-t0)/(1-t0),x=36+((k*157)%504),y=26+((k*89)%190)+q*q*70,r=10+(k%3)*5;
    gfx.globalAlpha=al*.8; E(x,y-r*1.2,r*.35,r*1.2,'rgba(191,232,255,.35)'); E(x,y,r,r*1.15,'rgba(191,232,255,.5)'); ring(x,y,r,r*1.15,2,'rgba(255,255,255,.85)'); E(x-r*.35,y-r*.4,r*.25,r*.3,'#ffffff'); } };

// ---------- Not Leaving: a bigger lean-in and a big heart ----------
SC.np_beat=(s,u)=>{ const beat=Math.abs(Math.sin(s.t*7)),on=u>s.at; gfx.globalAlpha=fade(u,.9); heartO(s.x,s.y,on?10+beat*8:6,on?'#ff6b9a':'#8a6a7a');
  if(on) { gfx.globalAlpha=fade(u,.9)*.6; ring(s.x,s.y,16+beat*24,12+beat*18,3,'#ff6b9a'); } if(u>s.at+.12) { gfx.globalAlpha=fade(u,.9); bigWord('STILL HERE',s.x,s.y-48,PINK,2); } };
SC.np_bigheart=(s,u)=>{ const p=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.15)),r=26*p; gfx.globalAlpha=fade(u,.75); heartO(s.x,s.y-ez(u)*26,r,'#ff6b9a'); heart(s.x-r*.35,s.y-ez(u)*26-r*.35,r*.25,'#ffc0d4');
  for(let k=0;k<6;k++) { const a=k/6*Math.PI*2+u*2,d=r+ez(u)*30; star(s.x+Math.cos(a)*d,s.y-ez(u)*26+Math.sin(a)*d*.8,4,k%2?GOLD:PINK,u*4+k); } };
N.not_leaving=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,down=t.hp<=0,H=ST.unit(t),sp=spotFor(m,t);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'act'},{t:1200,f:'idle',dx:u=>-Math.abs(Math.sin(u*Math.PI*2))*12},{t:1600,dx:-14,f:'idle',rot:-.2},{t:2600,f:'idle',dx:u=>-14-Math.sin(u*Math.PI)*24,rot:u=>-.2-ez(u/.3)*.22},{t:3300,f:'celeb',rot:wag},{t:3700,f:'runR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage(down?'Nara runs to '+t.name+' and plants both front paws.':'Nara runs to '+t.name+'. Just checking.'); sfx.whine(); }],
    [1200,()=>{ setMessage('She nudges a limp hand. Once. Twice.'); scene('nv_text',.9,{x:H.x,y:H.top-20,txt:'NUDGE',c:CREAM,sc:2}); }],
    [1600,()=>{ say(m.id,'not_leaving'); scene('np_beat',2.1,{x:H.x-6,y:H.top+4,at:(2400-1600)/2100}); }],
    ['hf',2400],
    [2400,()=>{ E2.apply(); sfx.heal(); scene('na_glow',1,{x:H.x,y:H.mid,c:'#ff9ac0'}); }],
    [2700,()=>{ setMessage('She leans her whole forty pounds into her friend.'); scene('np_bigheart',1.4,{x:(H.x+sp.x)/2,y:H.top-30}); scene('nv_hearts',1.3,{x:H.x+20,y:H.top,n:7}); scene('nv_text',1.2,{x:sp.x+20,y:sp.y-NH()-24,txt:'LEAN',c:GOLD,sc:2}); }],
    [4500,'end',down?t.name+' is back up. Nara rejected being left behind.':'Nara was never going to leave anyway.']]); };

// ---------- Happy Puddle: a bigger puddle and a cartoon slip ----------
SC.nv_puddle=(s,u)=>{ const a=fin(u,.05)*fade(u,.92)*.92; s.spots.forEach((p,k)=>{ const g=ez((u-k*.06)/.25); if(g<=0) return; const x=lerp(s.sx,p.x,g),rx=lerp(8,p.w*.5+42,g),ry=16*g;
  gfx.globalAlpha=a; if(PROPART.ready('nara/happy_puddle')) { const w=rx*2.1; PROPART.draw('nara/happy_puddle',x,p.y,{w,sy:cl(2*ry/(w/1.8),.3,1)}); } else { E(x,p.y,rx+3,ry+3,'#b8ac38'); E(x,p.y,rx,ry,PEE); E(x-rx*.3,p.y-ry*.3,rx*.45,ry*.32,'#f6f0b0'); E(x+rx*.35,p.y+ry*.2,rx*.15,ry*.15,'#f6f0b0'); }
  for(let j=0;j<2;j++) { const q=(s.t*.9+j*.5+k*.2)%1; gfx.globalAlpha=(1-q)*a*.8; ring(x,p.y,rx*(.3+q*.6),ry*(.3+q*.6),2,'#fffbd0'); } }); };
SC.np_dizzy=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.75); for(let k=0;k<3;k++) { const a=s.t*7+k*2.09; star(s.x+Math.cos(a)*22,s.y+Math.sin(a)*7,6,k%2?GOLD:CREAM,s.t*5); } };
N.happy_puddle=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),px=Math.min(530,G.x1+44),py=Math.min(316,G.base+6),Ps=list.map(f=>ST.unit(f));
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:px,y:py,f:'celeb',hop:18,hn:4,rot:wag},{t:1700,f:'idle',rot:wag},{t:2000,f:'runR'},{t:2400,x:Math.min(556,px+60),y:py,f:'sit'},{t:3300,f:'sit',rot:-.14},{t:3900,f:'runR'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Nara sees the whole front row. She\'s SO excited.'); say(m.id,'happy_puddle'); barks(3,.12); }],
    [800,()=>{ scene('nv_text',.9,{x:px,y:py-NH()-24,txt:'WIGGLE WIGGLE',c:GOLD,sc:2}); }],
    [1500,()=>{ scene('nv_puddle',3.0,{sx:px-20,spots:Ps.map(F=>({x:F.x,y:F.base+2,w:F.w}))}); sfx.splat&&sfx.splat(); setMessage('A happy little puddle. It spreads. Right under their feet.'); }],
    [2100,()=>{ sfx.slideWhistle(); ST.draw((s,u)=>{ const q=u; list.forEach((f,k)=>{ const sd=k%2?1:-1,F=Ps[k];
        const sp=q<.3?Math.sin(q*60+k)*.2*ez(q/.3):(q<.75?sd*1.25*ez((q-.3)/.12):sd*1.25*(1-ez((q-.75)/.25))),oy=q<.3?0:(q<.48?-F.h*.5*Math.sin((q-.3)/.18*Math.PI/2):lerp(-F.h*.5,8,ez((q-.48)/.08))*(1-ez((q-.75)/.25))),ox=q<.3?Math.sin(q*44+k)*9:sd*-10*ez((q-.3)/.2)*(1-ez((q-.75)/.25));
        lift(f,oy,sp,ox); }); },1.6); Ps.forEach((F,k)=>scene('nv_text',.8,{x:F.x,y:F.top-18,txt:'WHOA',c:CREAM,sc:3})); }],
    ['hf',2700],
    [2700,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.45); landHit(100); scene('nv_big',1.1,{x:G.x,y:G.top-74,txt:'SLIP!',c:PEE,sc:5}); Ps.forEach(F=>{ scene('np_dizzy',1.4,{x:F.x,y:F.top-6}); scene('nv_dust',.5,{x:F.x,y:F.base,r:40,c:'#f6f0b0'}); }); }],
    [3300,()=>{ scene('nv_text',1,{x:Math.min(556,px+60),y:py-NH()-24,txt:'?',c:CREAM,sc:3}); }],
    [4600,'end',res(E2)+'The front row lost its footing. Nara lost nothing. She\'s delighted.']]); };

// ---------- Family Food Inspector: bigger dishes and a big paw stamp ----------
const cloche=(x,y,c,lid)=>{ EO(x,y+4,46,9,'#f4f2ea'); E(x,y+2,34,5,'#e2ded2');
  if(lid<1) { gfx.save(); gfx.translate(x,y-lid*40); gfx.rotate(-lid*.5); gfx.beginPath(); gfx.ellipse(0,0,38,32,0,Math.PI,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill();
    E(-14,-16,8,5,'rgba(255,255,255,.55)'); EO(0,-34,6,5,c); R(-38,-2,76,4,'rgba(0,0,0,.15)'); gfx.restore(); } };
SC.np_dishes=(s,u)=>{ const ms=s.t*1000,lid=ez((ms-s.openAt)/300),rej=ez((ms-s.rejectAt)/300),st=ms>s.stampAt; gfx.globalAlpha=fin(u,.06)*fade(u,.94); const a0=gfx.globalAlpha;
  gfx.save(); gfx.translate(s.x0-rej*34,s.y); gfx.rotate(-rej*.3); gfx.globalAlpha=a0*(1-rej*.55); if(!PROPART.draw('nara/fancy_covered_dish',0,-30,{h:72})) cloche(0,0,'#e8c84a',0); bigWord('FANCY',0,-84,'#c9a23a',2); gfx.restore(); gfx.globalAlpha=a0;
  if(rej>.5&&ms<s.stampAt+200) bigWord('NOPE',s.x0-34,s.y-84,RED,3);
  if(lid>0) { E(s.x1,s.y-4,30,8,'#d9a05a'); E(s.x1-8,s.y-7,10,3,'#f0c070'); for(let k=0;k<4;k++) { const q=(s.t*1.1+k*.25)%1; gfx.globalAlpha=a0*(1-q)*.85; E(s.x1-18+k*12,s.y-14-q*50,7+q*6,7+q*6,'#ffffff'); } gfx.globalAlpha=a0; }
  if(!PROPART.draw('nara/homemade_covered_dish',s.x1,s.y-34,{h:72})) { cloche(s.x1,s.y,'#dfe6ee',lid); bigWord('HOMEMADE',s.x1,s.y+20,CREAM,2); }
  // the stamp: a big paw comes down onto the homemade dish, leaves a print, rings out
  if(ms>s.stampAt-250&&ms<s.stampAt+250) { const q=ez((ms-s.stampAt+250)/250),py=lerp(s.y-150,s.y-30,q),sc=lerp(1.6,1,q); gfx.save(); gfx.translate(s.x1,py); gfx.scale(sc,sc); paw(0,0,24,OUT); paw(0,0,20,'#2e2627'); E(0,7,8,6,'#5a4c4c'); gfx.restore(); }
  if(st) { const ly=s.y-30-lid*40; gfx.globalAlpha=a0*(1-lid); if(!PROPART.draw('nara/homemade_stamp',s.x1,ly,{h:44})) paw(s.x1,ly,15,'#e05a6a');
    const q=(ms-s.stampAt)/400; if(q<1) { gfx.globalAlpha=a0*(1-q); ring(s.x1,s.y-20,20+q*60,10+q*30,4,GOLD); }
    if(ms<s.stampAt+1300) { gfx.globalAlpha=a0; gfx.save(); gfx.translate(s.x1,s.y-104); gfx.rotate(-.14); RO(-62,-16,124,32,'#fff6ee'); gfx.strokeStyle=RED; gfx.lineWidth=4; gfx.strokeRect(-58,-12,116,24); label('APPROVED',0,-7,RED,3); gfx.restore(); } } };
N.food_inspector=E2=>{ const {m,fx}=E2,tg=E2.targets||[],kind=tg.length===1&&tg[0].side==='foe',to=tg.map(t=>{ const U=ST.unit(t); return {x:U.x,y:U.mid,u:t}; });
  const base=kind?ST.unit(tg[0]):null,y=kind?base.base+4:Math.min(292,BATTLE_POS[m.idx].base*3-20),x1=kind?Math.min(470,base.x+base.w*.5+60):400,x0=x1-120;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:600,x:x0+50,y:y,f:'idle'},{t:800,dx:u=>-Math.abs(Math.sin(u*Math.PI*3))*8,f:'idle'},{t:1500,f:'flip',rot:-.15},{t:1800,f:'runR'},{t:2100,x:x1+50,f:'act',hop:8},{t:2500,f:'idle'},{t:3200,f:'sit'},{t:3700,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Two covered dishes. One is fancy. One says HOMEMADE.'); say(m.id,'food_inspector'); scene('np_dishes',3.9,{x0,x1,y,rejectAt:1500,stampAt:2150,openAt:2450}); }],
    [850,()=>{ scene('nv_text',.8,{x:x0,y:y-96,txt:'SNIFF SNIFF',c:CREAM,sc:2}); }],
    [1500,()=>{ setMessage('Nara sniffs the fancy one and turns her nose up.'); }],
    [2150,()=>{ sfx.thud(); sfx.ding(); setMessage('The homemade one gets a paw of approval.'); }],
    ['hf',2550],
    [2550,()=>{ scene('na_steam',1.2,{x:x1,y:y-20,to}); }],
    [2900,()=>{ E2.apply(); sfx.heal(); for(const o of to) { if(o.u.side==='party'&&o.u!==m) battle.fx[o.u.idx].hop=.3; if(o.u.side==='foe') ST.jolt(o.u,.15); } }],
    [3200,()=>{ scene('na_bowl',1.1,{x:x1+40,y:y+2}); }],
    [4400,'end',kindLine(kind?tg[0]:null,'The homemade option passes inspection. Nara gets her own plain little portion.')]]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-25) =================
// Nara's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// Nara for real (a dog: barks and whines only, never words; the narration says what she means; tennis balls; Tom is her
// person). CHAIRMAN CHEEKS! (A6): Old Oak Park; a smug squirrel in a top hat and monocle peeks out from behind the
// monsters, waggles his tail at her, her eyes lock on (TARGET: SQUIRREL!!), and she chases him five laps through every
// monster in a whirl of oak leaves, acorns, tennis balls and one park bench; he zips up the oak just in time, the monsters
// do not (Stagger, shields break), and she barks up the tree while the family gets fired up. The Unsent Scent (B6):
// everything goes grey and quiet and she is alone, ears down, until one golden sourdough crumb floats down; she sniffs,
// barks twice, the grey shatters, a golden scent trail of bread, clay mugs and hearts runs through every monster and loops
// back to Tom; she follows it through them all (paw prints, Tracked Scent) and leaps into Tom's arms (he gets back up if he
// was down), and the warm glow heals the pack. Scenes prefix nu_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const PO=(pts,c,o=2)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); if(o) { gfx.strokeStyle=OUT; gfx.lineWidth=o; gfx.lineJoin='round'; gfx.stroke(); } };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const heart=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y+r*.9); gfx.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.7,y-r*1.4,x,y-r*.45); gfx.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.6,y-r*.2,x,y+r*.9); gfx.closePath();
  gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const N=RECRUIT_MOVES.nara;
const CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',BALL='#d8ef4a',RED='#e0402e',FUR='#8a5226',FUR2='#a8642e',BELLY='#d9b98a',CLAY2='#e8d2b0',GLZ='#5fae9a',BREAD='#d8a050';
ST.nw('nu_');
const S=(k,...a)=>{ if(sfx[k]) sfx[k](...a); };
if(!sfx.chitter) sfx.chitter=(d=0)=>{ for(let k=0;k<5;k++) tone({type:'square',f0:2400+(k%2)*500,f1:1900,dur:.035,vol:.05,delay:d+k*.05}); };
if(!sfx.sniff) sfx.sniff=(d=0)=>{ for(let k=0;k<3;k++) noise({dur:.07,vol:.1,delay:d+k*.11,f0:3200,f1:1800,type:'bandpass'}); };
const barks=(n,gap=.14,d=0)=>{ for(let k=0;k<n;k++) sfx.bark(d+k*gap); };
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const BAR=24;
SC.nu_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); gfx.globalAlpha=1; R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); gfx.globalAlpha=1; };
SC.nu_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  const x=Math.max(w/2+8,Math.min(568-w/2,s.x)),y=Math.max(sc*5+BAR+16,s.y),sh=s.shake?Math.sin(s.t*60)*s.shake:0;
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x+sh,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); });
SC.nu_flash=inBox((s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); });
SC.nu_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.5,s.w||3,s.c||CREAM); } gfx.globalAlpha=1; };
SC.nu_spin=(s,u)=>{ const ms=s.t*1000+s.t0; for(const b of s.list) { if(ms<b.t) continue; const q=(ms-b.t)/650; if(q>=1) { if(!b.done) { b.done=1; lift(b.f,0,0,0); } continue; }
  lift(b.f,-Math.sin(q*Math.PI)*(s.h||22),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*(s.ox||6)); } };
// A Nara speech-free bubble for Tom (he talks; she does not).
SC.nu_say=inBox((s,u)=>{ const a=fin(u,.08)*fade(u,.85),w=(s.txt.length*4-1)*2+24,x=Math.max(w/2+8,Math.min(568-w/2,s.x)),y=Math.max(BAR+22,s.y); gfx.globalAlpha=a;
  RO(x-w/2,y-14,w,26,'#ffffff'); PO([[s.x-6,y+12],[s.x+6,y+12],[s.x+2,y+24]],'#ffffff',0); Ln(s.x-6,y+13,s.x+2,y+24,2.5,OUT); Ln(s.x+6,y+13,s.x+2,y+24,2.5,OUT); label(s.txt,x,y-5,'#2b2a26',2); });
const ball=(x,y,r=8)=>{ if(PROPART.draw('nara/tennis_ball',x,y,{h:(r+2)*2.2})) return; E(x,y,r+2,r+2,OUT); E(x,y,r,r,BALL); E(x-r*.3,y-r*.3,r*.35,r*.35,'#f2ffa0'); gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(x-r,y,r,-.9,.9); gfx.stroke(); };
const pawPrint=(x,y,r,c)=>{ E(x,y,r,r*.85,c); for(let k=0;k<3;k++) E(x-r+k*r,y-r*1.3,r*.38,r*.38,c); };

// ---------- CHAIRMAN CHEEKS! (A6) ----------
// Chairman Cheeks: a smug squirrel, feet at (0,0), facing left (dir 1 faces right). Puffed cheeks, a little top hat with
// a gold band, a monocle on a chain. tw: tail waggle.
const cheeks=(x,y,sc,dir,t,tw=1,tip=0,pose)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc*(dir>0?-1:1),sc);
  { const PA={peek:['squirrel_peek',{w:36,dy:-15}],run:['squirrel_run',{w:48,dy:-19}],tip:['squirrel_tip_hat',{h:44,dy:-22}],branch:['squirrel_on_branch',{h:40,dy:-14}]}[pose];
    if(PA&&PROPART.draw('nara/'+PA[0],0,PA[1].dy,PA[1])) { gfx.restore(); return; } }
  const wa=Math.sin(t*14)*.25*tw;
  gfx.save(); gfx.translate(8,-10); gfx.rotate(wa); EO(6,-12,8,14,FUR2); EO(10,-28,8,9,FUR2); E(4,-14,4,9,'#c8824a'); E(9,-29,4,4,'#c8824a'); gfx.restore();
  EO(0,-11,10,11,FUR); E(-3,-9,5,7,BELLY);
  EO(-8,-26,8,7,FUR); EO(-13,-23,4,3.5,'#b8743e'); R(-7,-36,4,6,OUT); R(-6,-35,2,4,FUR);
  E(-11,-28,1.6,1.6,'#111'); gfx.strokeStyle='#ffd166'; gfx.lineWidth=1.4; gfx.beginPath(); gfx.arc(-11,-28,3.6,0,Math.PI*2); gfx.stroke(); Ln(-8,-26,-4,-14,.8,'#ffd166');
  Ln(-15,-22,-11,-21,1.2,'#3a2418');
  gfx.save(); gfx.translate(-7,-33); gfx.rotate(-.15-tip); RO(-6,-9,11,9,'#1e1c22'); R(-6,-3,11,2,'#ffd166'); RO(-9,0,17,2,'#1e1c22'); gfx.restore();
  EO(-5,0,4,2.4,FUR); EO(5,0,4,2.4,FUR); E(-12,-15,3,2.5,FUR);
  gfx.restore(); };
// Old Oak Park (back layer): a soft sky, a lawn, and a big oak on the far left (the trunk he climbs).
SC.nu_park=(s,u)=>{ const P=s.plan,ms=s.t*1000,k=ez(ms/400)*(u>.93?(1-u)/.07:1); if(k<=0) return; gfx.globalAlpha=k;
  const g=gfx.createLinearGradient(0,0,0,200); g.addColorStop(0,'#9fd4f0'); g.addColorStop(1,'#e6f4dc'); gfx.fillStyle=g; gfx.fillRect(0,0,576,324);
  for(const [cx,cy,r] of [[300,64,22],[330,58,28],[360,66,20],[470,90,16],[492,84,22]]) E(cx,cy,r*1.4,r*.8,'#ffffff');
  gfx.fillStyle='#8cc46a'; gfx.beginPath(); gfx.moveTo(0,168); for(let x=0;x<=576;x+=32) gfx.lineTo(x,160+Math.sin(x/90)*10); gfx.lineTo(576,324); gfx.lineTo(0,324); gfx.fill();
  gfx.fillStyle='#78b45a'; for(let j=0;j<40;j++) { const x=(j*53)%576,y=180+(j*37)%130; R(x,y,2,5,'#6aa84e'); R(x+3,y+1,2,4,'#6aa84e'); }
  // a far bench and a path
  gfx.fillStyle='#e8d8b0'; gfx.beginPath(); gfx.moveTo(250,324); gfx.quadraticCurveTo(330,220,480,172); gfx.lineTo(500,172); gfx.quadraticCurveTo(360,230,300,324); gfx.fill();
  // the oak
  const tx=P.tx; if(PROPART.draw('nara/oak_tree',tx+6,P.ground-96,{w:210})) { gfx.globalAlpha=1; return; } R(tx-15,P.treeTop-6,30,P.ground-P.treeTop+6,OUT); R(tx-13,P.treeTop-4,26,P.ground-P.treeTop+4,'#7a5232'); for(let j=0;j<6;j++) R(tx-9+(j%2)*10,P.treeTop+20+j*30,3,14,'#5a3a22');
  LnO(tx,P.branch,tx+52,P.branch-18,7,'#7a5232');
  for(const [dx,dy,r] of [[-10,-30,46],[34,-46,40],[70,-26,34],[-36,0,30],[52,0,30],[18,-8,38]]) EO(tx+dx,P.treeTop+dy,r,r*.72,dx%20?'#4f9a48':'#5aa852');
  gfx.globalAlpha=1; };
// Chairman Cheeks, start to finish: peeks out from behind the middle monster (clipped at its head), waggles, tips his hat
// and bolts; runs just ahead of Nara for five laps; zips up the oak and sits on the branch looking smug.
SC.nu_cheeks=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000,a=u>.95?(1-u)/.05:1; gfx.globalAlpha=a;
  if(ms<P.run) { const F=P.peekF,up=ez((ms-P.peek)/350); if(ms<P.peek) return; const x=F.x+F.w*.18,y=F.top+36-up*32;
    gfx.save(); gfx.beginPath(); gfx.rect(0,0,576,F.top+6); gfx.clip(); cheeks(x,y,1.5,1,s.t,ms>P.peek+500?1:0,ms>P.run-400?Math.sin((ms-P.run+400)/400*Math.PI)*.6:0,'peek'); gfx.restore();
    if(ms>P.peek+600&&ms<P.run-300) { gfx.globalAlpha=a*fin((ms-P.peek-600)/1000,.2); label('CHITTER',x+30,y-52,CREAM,1); } return; }
  if(ms<P.climb) { const q=cl((ms-P.run)/(P.climb-P.run)),c=P.chase(Math.min(1,q+.06)),d=P.dir(Math.min(1,q+.06)),hop=Math.abs(Math.sin(ms/55))*6;
    cheeks(c.x,c.y-hop,1.4,d,s.t*1.6,1.6,0,'run'); return; }
  const q=cl((ms-P.climb)/320),x=lerp(P.tx+8,P.tx+30,ez(q)),y=lerp(P.ground-4,P.branch-6,ez(q));
  if(q<1) { gfx.save(); gfx.translate(x,y); gfx.rotate(-Math.PI/2*(1-q)); cheeks(0,0,1.5,1,s.t*2,1.4,0,'run'); gfx.restore(); return; }
  const tip=ms>P.climb+700&&ms<P.climb+1300?Math.sin((ms-P.climb-700)/600*Math.PI)*.8:0;
  cheeks(x,y,1.5,1,s.t,1,tip,tip>.05?'tip':'branch'); if(ms>P.climb+500) { gfx.globalAlpha=a*.9; label('CHITTER',x+14,y-50,CREAM,1); } });
// Her eyes lock on: a red scope ring over the squirrel and TARGET: SQUIRREL!!
SC.nu_scope=inBox((s,u)=>{ const P=s.plan,F=P.peekF,x=F.x+F.w*.18,y=F.top-14,lk=ez(u/.35),r=lerp(70,28,lk); gfx.globalAlpha=fin(u,.08)*fade(u,.88);
  ring(x,y,r+2,r+2,6,OUT); ring(x,y,r,r,3,'#ff3a3a'); for(let k=0;k<4;k++) { const a=k*Math.PI/2+s.t*(1-lk)*6; Ln(x+Math.cos(a)*(r-8),y+Math.sin(a)*(r-8),x+Math.cos(a)*(r+12),y+Math.sin(a)*(r+12),3,'#ff3a3a'); }
  if(lk>.95) { RO(x-60,y-r-34,120,16,'#2b0a0a'); label('TARGET: SQUIRREL!!',x,y-r-30,'#ff6a5a',1); } });
// The park whirl that follows her: oak leaves, acorns and tennis balls left behind and spinning round her.
SC.nu_whirl=inBox((s,u)=>{ const st=s.st,ms=s.t*1000; s.bits=s.bits||[]; const a=u>.9?(1-u)/.1:1;
  if(st&&st.x!=null&&ms<s.stop) for(let j=0;j<2;j++) s.bits.push({x:st.x,y:st.y-30-Math.random()*30,t:ms,k:s.bits.length,vx:(Math.random()-.5)*60,vy:-40-Math.random()*60});
  for(const b of s.bits) { const q=(ms-b.t)/900; if(q>1) continue; const x=b.x+b.vx*q,y=b.y+b.vy*q+q*q*70,rot=q*8+b.k;
    gfx.globalAlpha=a*(1-q); gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
    if(b.k%7===0) ball(0,0,6); else if(b.k%5===0) { EO(0,2,4,5,'#9a6a3a'); EO(0,-3,5,3,'#6a4a2a'); } else { gfx.fillStyle=['#e88a3a','#5aa852','#c8a040','#d0602a'][b.k%4]; gfx.beginPath(); gfx.ellipse(0,0,8,3.5,0,0,Math.PI*2); gfx.fill(); R(-1,-1,9,1.5,'#6a4a2a'); }
    gfx.restore(); }
  if(st&&st.x!=null&&ms<s.stop) for(let k=0;k<8;k++) { const an=s.t*16+k*Math.PI/4,rx=44,x=st.x+Math.cos(an)*rx,y=st.y-36+Math.sin(an)*20; gfx.globalAlpha=a*.85; gfx.save(); gfx.translate(x,y); gfx.rotate(an);
    if(k%4===0) ball(0,0,6); else { gfx.fillStyle=k%2?'#e88a3a':'#5aa852'; gfx.beginPath(); gfx.ellipse(0,0,8,3.5,0,0,Math.PI*2); gfx.fill(); } gfx.restore(); } });
const bench=(x,y,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); if(PROPART.draw('nara/park_bench',0,0,{w:72})) { gfx.restore(); return; } RO(-30,-14,60,6,'#3f7a4a'); RO(-30,-4,60,6,'#3f7a4a'); RO(-26,4,4,14,'#2b2a26'); RO(22,4,4,14,'#2b2a26'); RO(-30,-24,60,6,'#3f7a4a'); gfx.restore(); };
N.squirrel_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m);
  const peek=list.slice().sort((a,b)=>ST.foe(a).base-ST.foe(b).base||ST.foe(b).x-ST.foe(a).x)[0],peekF=ST.foe(peek);
  const bases=Gp.list.map(p=>p.base),yT=Math.max(BAR+120,Math.min(...bases)-12),yB=Math.min(298,Math.max(...bases)+6);
  const L=Math.max(40,Gp.x0-6),Rr=Math.min(400,Gp.x1+60),PASSES=5;
  const chase=q=>{ const z=cl(q)*PASSES,j=Math.min(PASSES-1,Math.floor(z)),f=z-j,e=ez(f),x=j%2?lerp(L,Rr,e):lerp(Rr,L,e),y=lerp(j%2?yB:yT,j%2?yT:yB,e)-Math.abs(Math.sin(f*Math.PI*3))*10; return {x,y}; };
  const dir=q=>{ const z=cl(q)*PASSES,j=Math.min(PASSES-1,Math.floor(z)); return j%2?1:-1; };
  const P={peek:600,run:2500,climb:4700,tx:Math.max(22,Math.round(Gp.x0-30)),ground:Math.min(296,yB),treeTop:BAR+70,branch:BAR+92,peekF,chase,dir};
  const C0=chase(0),C1=chase(1),RUN=P.run,END=P.climb;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle'},{t:1200,f:'idle2',hop:8},{t:1500,f:'idle2',dx:(u,tt)=>Math.sin(tt*50)*1.2},{t:1700,f:'act',hop:6,hn:4},
    {t:2300,f:'run'},{t:RUN,x:C0.x,y:C0.y,f:u=>dir(u)<0?'run':'runR',ease:'lin',dx:u=>chase(u).x-lerp(C0.x,C1.x,u),dy:u=>chase(u).y-lerp(C0.y,C1.y,u)},
    {t:END,x:C1.x,y:C1.y,f:'celeb',hop:22,hn:4},{t:5900,f:'celeb',hop:10,hn:2},{t:6100,f:'runR'},{t:6800,x:'home',y:'home',f:'idle'}]);
  const passT=k=>RUN+(k+.5)*(END-RUN)/PASSES;
  const spins=list.map((f,k)=>({f,k,t:END+40+k*60}));
  ST.play(E2,[
    [0,()=>{ scene('nu_bars',6.95,{}); scene('nu_park',6.75,{plan:P,back:true}); scene('nu_cheeks',6.6,{plan:P});
      setMessage('A quiet afternoon in Old Oak Park. Nara is on patrol.'); }],
    [P.peek,()=>{ S('chitter'); setMessage('Something moves behind the monsters. A tiny top hat. A monocle.'); }],
    [1200,()=>{ S('ding'); scene('nu_big',.55,{x:me.x-10,y:me.top-30,txt:'!',c:GOLD,sc:6}); scene('nu_big',1.3,{x:288,y:BAR+30,txt:'CHAIRMAN CHEEKS',c:CREAM,sc:3}); S('chitter',.4);
      setMessage('Chairman Cheeks. Her arch-nemesis. He waggles his tail at her.'); }],
    [1700,()=>{ say(m.id,'squirrel_ult'); barks(5,.15); scene('nu_scope',1.0,{plan:P}); scene('nu_big',1.0,{x:me.x-90,y:me.top-60,txt:'ARF! ARF! ARF!',c:'#ffb070',sc:3,shake:3});
      setMessage('(She means: YOU. In MY park. AGAIN.)'); }],
    [RUN-300,()=>{ S('chitter'); }],
    [RUN,()=>{ S('run'); S('whoosh'); scene('nu_whirl',2.6,{st,stop:END-RUN}); scene('nu_big',1.0,{x:288,y:BAR+30,txt:'SQUIRREL!!',c:GOLD,sc:5});
      setMessage('He tips his hat and bolts. Nara is gone. Right through the monsters.'); }],
    ...[0,1,2,3,4].map(k=>[Math.round(passT(k)),()=>{ S('slash'); S('bark'); for(const f of list) ST.jolt(f,.35); landHit(8);
      if(k===1) { ST.fly((x,y,uu)=>bench(x,y,uu*Math.PI*3),-40,yB-20,Rr+60,yT-30,.7,90); S('whoosh'); }
      if(k===2) setMessage('Leaves. Acorns. Tennis balls. One park bench. Five laps.'); }]),
    ['hf',END+60],
    [END,()=>{ S('chitter'); S('squeak'); }],
    [END+60,()=>{ S('crash'); S('thud'); landHit(60); for(const f of list) ST.jolt(f,.7); scene('nu_spin',1.1,{list:spins,t0:END+60,h:26,ox:8}); scene('nu_flash',.3,{a:.5});
      scene('nu_rings',.8,{x:Gp.x,y:Gp.base-20,r:140,w:5,c:GOLD}); scene('nu_big',1.3,{x:288,y:BAR+30,txt:'STAGGER!',c:GOLD,sc:5});
      setMessage('Chairman Cheeks zips up the oak just in time. The monsters don\'t.'); }],
    [5300,()=>{ E2.apply(); barks(4,.2); scene('nu_big',.9,{x:P.tx+70,y:P.branch+40,txt:'ARF! ARF!',c:'#ffb070',sc:2});
      setMessage('Nara barks up the tree. The whole family is fired up. (She means: COME DOWN HERE.)'); }],
    [6000,()=>{ S('chitter'); }],
    [6950,'end',()=>res(E2)+'Chairman Cheeks will be back. Nara will be ready.']]); };

// ---------- The Unsent Scent (B6) ----------
// The grey (front layer, created first so the later scenes stay in color): a saturation wash that turns everything drawn so
// far grey, a little static, and a spotlight on Nara. At P.color it snaps back to color.
SC.nu_grey=(s,u)=>{ const P=s.plan,ms=s.t*1000,k=ms<P.color?ez(ms/400):1-cl((ms-P.color)/250); if(k<=0) return;
  gfx.save(); gfx.globalAlpha=k; gfx.globalCompositeOperation='saturation'; R(0,0,576,324,'#808080'); gfx.globalCompositeOperation='source-over';
  gfx.globalAlpha=k*.55; gfx.fillStyle='#0a0a10'; gfx.beginPath(); gfx.rect(0,0,576,324); gfx.ellipse(P.S.x,P.S.y-36,80,96,0,0,Math.PI*2,true); gfx.fill('evenodd');
  for(let j=0;j<140;j++) { const x=(j*97+ms*1.7*(j%3+1))%576,y=(j*61+ms*.9*(j%5))%324; gfx.globalAlpha=k*.22; R(x,y,2,1,j%2?'#ffffff':'#000000'); }
  gfx.globalAlpha=k*.12; for(let y=0;y<324;y+=4) R(0,y,576,1,'#000');
  gfx.restore(); gfx.globalAlpha=1; };
// The grey breaking up: grey glass shards flying out from Nara.
SC.nu_shatter=inBox((s,u)=>{ for(let j=0;j<26;j++) { const a=j/26*Math.PI*2+.2,d=ez(u)*(160+(j%5)*50); gfx.globalAlpha=1-u; gfx.save(); gfx.translate(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.7+u*u*40); gfx.rotate(a+u*5);
  PO([[-10,-7],[12,-4],[3,10]],j%3?'#9a9aa6':'#c8c8d2',2); gfx.restore(); } });
// One golden sourdough crumb floating down to her nose.
SC.nu_crumb=inBox((s,u)=>{ const q=ez(u/.7),x=s.x+Math.sin(s.t*3)*14*(1-q),y=lerp(BAR+10,s.y,q); gfx.globalAlpha=fade(u,.9);
  gfx.globalAlpha*=.35+.15*Math.sin(s.t*8); E(x,y,18,18,'#ffd27a'); gfx.globalAlpha=fade(u,.9); EO(x,y,6,5,BREAD); E(x-2,y-2,2.5,2,'#f0c878'); E(x+2,y+1,1.2,1.2,'#a8702a');
  for(let k=0;k<3;k++) { const a=s.t*4+k*2.1; Ln(x+Math.cos(a)*10,y+Math.sin(a)*10,x+Math.cos(a)*14,y+Math.sin(a)*14,1.5,GOLD); } });
// The golden scent trail: from her nose through every monster, round the far side and back to Tom. Drawn as it is
// revealed, with little things she smells drifting along it (bread, a clay mug, hearts, paw prints).
const trailPath=pts=>{ const D=[];   // dense polyline through pts (Catmull-Rom), then arc length
  for(let i=0;i<pts.length-1;i++) { const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    for(let k=0;k<16;k++) { const t=k/16,t2=t*t,t3=t2*t; D.push({x:.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),y:.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)}); } }
  D.push(pts[pts.length-1]); const L=[0]; for(let i=1;i<D.length;i++) L.push(L[i-1]+Math.hypot(D[i].x-D[i-1].x,D[i].y-D[i-1].y));
  const at=p=>{ const d=cl(p)*L[L.length-1]; let i=1; while(i<L.length-1&&L[i]<d) i++; const q=(d-L[i-1])/Math.max(1e-6,L[i]-L[i-1]); return {x:lerp(D[i-1].x,D[i].x,q),y:lerp(D[i-1].y,D[i].y,q)}; };
  return {D,L,at,len:L[L.length-1]}; };
const smellBit=(k,x,y,t)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(Math.sin(t*3+k)*.3);
  if(k%4===0) { EO(0,0,9,6,BREAD); R(-5,-3,10,1.5,'#a8702a'); R(-3,0,8,1.5,'#a8702a'); }
  else if(k%4===1) { ring(6,0,3,4,4,OUT); ring(6,0,3,4,2,CLAY2); PO([[-6,-7],[6,-8],[5,7],[-5,7]],CLAY2,2); R(-6,-7,12,3,GLZ); }
  else if(k%4===2) heart(0,0,6,PINK); else pawPrint(0,2,4,'#ffd166');
  gfx.restore(); };
SC.nu_trail=inBox((s,u)=>{ const T=s.trail,ms=s.t*1000,rev=ez(ms/s.reveal),a=u>.85?(1-u)/.15:1,n=Math.max(2,Math.floor(T.D.length*rev)); if(a<=0) return;
  for(const [w,c,al] of [[22,'#ffd166',.25],[12,'#ffe08a',.45],[4,'#fff6c8',.95]]) { gfx.globalAlpha=a*al; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.lineJoin='round'; gfx.beginPath();
    for(let i=0;i<n;i++) i?gfx.lineTo(T.D[i].x,T.D[i].y):gfx.moveTo(T.D[i].x,T.D[i].y); gfx.stroke(); }
  for(let k=0;k<14;k++) { const p=((s.t*.22+k/14)%1); if(p>rev) continue; const q=T.at(p); gfx.globalAlpha=a*fin(Math.min(p,1-p)*10,1); smellBit(k,q.x,q.y-10+Math.sin(s.t*5+k)*4,s.t); }
  for(let k=0;k<20;k++) { const p=(k/20+s.t*.05)%1; if(p>rev) continue; const q=T.at(p); gfx.globalAlpha=a*(.4+.4*Math.sin(s.t*9+k)); E(q.x+Math.sin(k*7)*10,q.y+Math.cos(k*5)*8,1.6,1.6,'#ffffff'); } });
// Golden paw prints bursting where she runs through a monster, and the paw target mark left on it (Tracked Scent).
SC.nu_pawburst=(s,u)=>{ for(let k=0;k<8;k++) { const a=k/8*Math.PI*2+.3,d=ez(u)*(s.r||46); gfx.globalAlpha=1-u; pawPrint(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,5*(1-u*.5),k%2?'#ffd166':'#ffb04a'); }
  gfx.globalAlpha=(1-u)*.8; ring(s.x,s.y,10+ez(u)*(s.r||46),6+ez(u)*(s.r||46)*.5,4,GOLD); gfx.globalAlpha=1; };
SC.nu_mark=(s,u)=>{ const F=ST.foe(s.f),k=fin(u,.1)*fade(u,.85),x=F.x,y=F.top-12,pl=1+Math.sin(s.t*6)*.06; gfx.globalAlpha=k; gfx.save(); gfx.translate(x,y); gfx.scale(pl,pl);
  ring(0,0,15,15,6,OUT); ring(0,0,15,15,3,'#c9e39a'); pawPrint(0,3,4.5,'#c9e39a'); gfx.restore(); gfx.globalAlpha=1; };
// The warm glow of the pack: soft rings rolling out from Tom over everyone, and hearts.
SC.nu_glow=(s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.4-k*.12); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.7; ring(s.x,s.y,20+q*260,12+q*110,6,k%2?'#ffb0c8':'#ffd27a'); }
  for(let k=0;k<10;k++) { const q=cl(u*1.2-k*.05); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; heart(s.x-70+k*16+Math.sin(k*3+s.t*4)*8,s.y-20-q*90,5+k%3*2,k%2?PINK:'#ffd3e0'); } gfx.globalAlpha=1; };
SC.nu_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.75); bigWord(s.txt,s.x,s.y-ez(u/.3)*10,s.c||CREAM,s.sc||2); gfx.globalAlpha=1; };
N.pack_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m);
  const tom=B2.party.find(p=>p.id==='tom'&&p!==m),tomDown=!!(tom&&tom.hp<=0),others=B2.party.filter(p=>p!==m);
  const tomU=tom?ST.unit(tom):null,grpU=others.length?{x:others.reduce((a,p)=>a+ST.unit(p).x,0)/others.length,base:others.reduce((a,p)=>a+ST.unit(p).base,0)/others.length}:{x:420,base:270};
  const Sx=Math.round(Math.min(me.x-60,Math.max(Gp.x1+90,me.x-120))),Sy=Math.round(Math.min(300,me.base-6)),P={S:{x:Sx,y:Sy},color:2300};
  const land=tomU?{x:tomU.x+40,y:tomU.base-12}:{x:grpU.x,y:grpU.base-10};
  const foeSorted=list.slice().sort((a,b)=>ST.foe(b).x-ST.foe(a).x);
  const pts=[{x:Sx,y:Sy}].concat(foeSorted.map(f=>{ const F=ST.foe(f); return {x:F.x,y:Math.min(300,F.base-4)}; }));
  const Cx=Math.max(46,Gp.x0-10),Cy=Math.min(296,Math.max(...Gp.list.map(p=>p.base))-6);
  pts.push({x:Cx,y:Cy},{x:Cx+34,y:BAR+124},{x:(Cx+land.x)/2,y:BAR+96},{x:land.x-40,y:Math.max(BAR+110,land.y-70)},land);
  const T=trailPath(pts);
  // where the bottom pass ends (the far-left corner) along the trail, and when she crosses each monster
  const pAt=pt=>{ let best=0,bd=1e9; for(let i=0;i<T.D.length;i++) { const d=Math.hypot(T.D[i].x-pt.x,T.D[i].y-pt.y); if(d<bd) { bd=d; best=i; } } return T.L[best]/T.len; };
  const pC=pAt({x:Cx,y:Cy}),R0=2800,R1=3800,R2=4500,timeAt=p=>p<=pC?R0+(p/pC)*(R1-R0):R1+((p-pC)/(1-pC))*(R2-R1);
  const pathP=ms=>ms<=R1?pC*(ms-R0)/(R1-R0):pC+(1-pC)*(ms-R1)/(R2-R1);
  const cross=foeSorted.map(f=>({f,t:Math.round(timeAt(pAt({x:ST.foe(f).x,y:Math.min(300,ST.foe(f).base-4)})))}));
  const share=Math.floor(60/Math.max(1,cross.length)),rest=100-share*cross.length;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:700,x:Sx,y:Sy,f:'sit',dy:2},{t:1500,f:'idle2',dy:(u,tt)=>Math.sin(tt*30)*1.5},{t:2300,f:'act',hop:8,hn:2},
    {t:2700,f:'run'},{t:R0,x:pts[0].x,y:pts[0].y,f:'run',ease:'lin',dx:u=>T.at(pC*u).x-lerp(pts[0].x,Cx,u),dy:u=>T.at(pC*u).y-lerp(pts[0].y,Cy,u)},
    {t:R1,x:Cx,y:Cy,f:'runR',ease:'lin',dx:u=>T.at(pC+(1-pC)*u).x-lerp(Cx,land.x,u),dy:u=>T.at(pC+(1-pC)*u).y-lerp(Cy,land.y,u)},
    {t:R2,x:land.x,y:land.y,f:'celeb',rot:-.15,dx:(u,tt)=>Math.sin(tt*20)*1.5},{t:5300,x:land.x+(tomU?6:0),y:tomU?tomU.base+3:land.y,f:'sit'},{t:6000,f:'runR'},{t:6800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('nu_bars',7.15,{}); scene('nu_grey',2.6,{plan:P}); S('whine',.5); setMessage('Everything goes grey and quiet. Nara is all alone. Ears down.'); }],
    [900,()=>{ scene('nu_crumb',1.6,{x:Sx-40,y:Sy-44}); S('ting'); setMessage('One golden crumb floats down. Sourdough.'); }],
    [1500,()=>{ say(m.id,'pack_ult'); S('sniff'); scene('nu_text',.9,{x:Sx-30,y:Sy-110,txt:'SNFF SNFF',c:CREAM,sc:2}); setMessage('Sniff. Sniff sniff.'); }],
    [P.color,()=>{ barks(2,.2); S('crash'); scene('nu_flash',.35,{a:.7}); scene('nu_shatter',.8,{x:Sx-20,y:Sy-40}); scene('nu_trail',4.4,{trail:T,reveal:500});
      scene('nu_big',1.1,{x:288,y:BAR+30,txt:'ARF! ARF!',c:'#ffb070',sc:5}); setMessage(tom?'(She means: I know that smell. That\'s MY person.)':'(She means: I know that smell. That\'s MY pack.)'); }],
    [R0,()=>{ S('run'); S('whoosh'); setMessage('She follows the scent of home. Straight through every monster.'); }],
    ...cross.map(c=>[c.t,()=>{ const F=ST.foe(c.f); S('slash'); S('bark'); ST.jolt(c.f,.5); landHit(share); scene('nu_pawburst',.6,{x:F.x,y:F.mid}); scene('nu_mark',3.2,{f:c.f}); }]),
    ['hf',R1],
    [R1,()=>{ S('thud'); for(const f of list) ST.jolt(f,.6); landHit(rest); scene('nu_pawburst',.8,{x:Gp.x,y:Gp.base-30,r:120}); scene('nu_big',.65,{x:288,y:BAR+30,txt:'TRACKED!',c:'#c9e39a',sc:5}); }],
    [R2,()=>{ E2.apply(); S('levelChime'); scene('nu_glow',1.6,{x:tomU?tomU.x:grpU.x,y:tomU?tomU.mid:grpU.base-40}); if(tom) battle.fx[tom.idx].hop=.3;
      scene('nu_big',1.2,{x:288,y:BAR+30,txt:tom?'FOUND HIM!':'FOUND THEM!',c:GOLD,sc:5});
      setMessage(tom?(tomDown?'She finds him anyway. Tom is back on his feet, covered in dog.':'She leaps right into Tom\'s arms and licks his whole face.'):'She finds the whole pack by smell. Everyone gets a lick.'); }],
    [R2+400,()=>{ if(tomU) { S('squeak'); scene('nu_text',.8,{x:land.x+10,y:land.y-80,txt:'SLURP',c:PINK,sc:2}); } }],
    [5200,()=>{ if(tomU) scene('nu_say',1.4,{x:tomU.x,y:tomU.top-26,txt:'GOOD GIRL.'}); setMessage('The warm glow of the pack heals everybody.'); }],
    [7100,'end',()=>res(E2)+'Nara never forgets her pack. Not for a second.']]); };
})();
