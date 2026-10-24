'use strict';
// engine/nara.js — Nara, cousin Olivia's Labradoodle (Olivia and Michael's dog; their kids are Lachlan, 4, and Isla, 1).
// 40 pounds, seven years old, playful and full of energy. Loves fetch. Separation anxiety. Very picky eater. Pees when she gets too excited.
// She roams Jefferson Park in Los Angeles. The first time Tom gets close she spots him and comes running (meeting scene),
// then she can join the party (alongside TNB; she stays in LA). This file holds her attacks, her special PUPPY EYES, the meeting scene,
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
PROP2.tball=(q,u)=>{ E(0,0,10,10,OUT); E(0,0,8,8,'#d8ef4a'); E(-2,-2,3,3,'#f2ffa0'); gfx.strokeStyle='#fff8e8'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(-9,0,9,-.9,.9); gfx.stroke(); gfx.beginPath(); gfx.arc(9,0,9,Math.PI-.9,Math.PI+.9); gfx.stroke(); };
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
    900,()=>{ pose(fx,'celeb',.9); sfx.squeak(); },E2.result+' She got the ball. She would like to go again.',()=>checkEnemy()); };
N.zoomies=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara gets the zoomies. Nobody knows why. Not even Nara.'); run(fx,2.6,4); sfx.run(); say(m.id,'zoomies'); for(let k=0;k<8;k++) scene('dust',.5,{x:100+(k%4)*110,y:262,n:4,delay:k*.3}); },
    ...[0,1,2,3].flatMap(k=>[k===0?420:620,()=>{ battle.slash=.18; sfx.slash(); sfx.bark(); bt('ZOOM',60+k*30,30+(k%2)*10,'#9fe8ff',3,.6); part(E2,4,k); }]),
    900,()=>{ pose(fx,'celeb',.8); },E2.result+' She is panting. She is thrilled.',()=>checkEnemy()); };
N.puddle=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara gets SO excited about the Grump. Too excited.'); appr(fx,2.4); barks(4,.1); say(m.id,'puddle',.3); },
    760,()=>{ fx.cheer=1.2; sfx.giggle&&sfx.giggle(); },
    700,()=>{ scene('naraPuddle',2.6,{}); sfx.splat(); bt('OOPS',96,32,'#e9e07a',4,1); },
    600,()=>{ battle.enemyKnock=.5; battle.shakeEnemy=.45; sfx.thud(); scene('splashw',.6,{x:GX,y:250,c:'#e9e07a',c2:'#f6f0b0',n:10,sp:80}); hit(E2); confuseMaybe(.3); },
    700,()=>setMessage(E2.result+(battle.enemyStunned===2?' The Grump slips. It is very confused about what just happened.':' The Grump steps in it. It is not happy.')),1300,()=>checkEnemy()); };
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
  enqueue(()=>{ setMessage('Nara thinks Tom might leave. Without her. She cannot handle it.'); pose(fx,'sit',3); sfx.whine(); scene('dark',3,{a:.35}); },
    800,()=>{ say(m.id,'howl'); sfx.howl(); scene('howlRings',2,{from:mouth(E2)}); bt('AWOOOO',96,30,'#c9b3e6',4,1.6); },
    1300,()=>{ battle.shakeEnemy=.6; battle.flashEnemy=.3; sfx.thud(); hit(E2); confuseMaybe(.35); },
    700,()=>setMessage(E2.result+(battle.enemyStunned===2?' The Grump feels terrible. And very confused.':' Tom did not leave. He would never.')),1200,()=>checkEnemy()); };
N.squirrel=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Nara freezes. Ears up. Something moved.'); pose(fx,'idle2',1.1); bt('!',150,40,'#ffe08a',5,1); sfx.ding(); },
    1000,()=>{ setMessage('SQUIRREL!'); say(m.id,'squirrel'); scene('squirrel',3.2,{passes:4}); run(fx,3.2,4); sfx.run(); barks(6,.16); bt('SQUIRREL!',96,30,'#ffb070',4,1.4); },
    ...[0,1,2,3].flatMap(k=>[k===0?500:700,()=>{ battle.slash=.2; sfx.slash(); scene('dust',.5,{x:GX+(k%2?30:-30),y:262,n:5}); part(E2,4,k); }]),
    700,()=>{ battle.enemyKnock=.5; battle.flashEnemy=.4; sfx.fanfare(); scene('confetti',1.4,{x0:70,x1:290,n:34}); scene('ring',.6,{x:GX,y:264,r:90}); },
    900,E2.result+' The squirrel got away. The Grump did not.',()=>checkEnemy()); };

// ================= Special: PUPPY EYES =================
// Nara sits and looks up. The enemy is Smitten and skips its next turn (E2.apply rolls it; bosses resist more).
N.puppy=E2=>{ const {i,m,fx}=E2; const t=E2.targets[0];
  pose(fx,'sit',2.2); sfx.whine(); say(m.id,'puppy',.2);
  scene('pupHearts',2.2,{i}); scene('bigEyes',1.8,{});
  enqueue('Nara sits. Head tilt. Big brown eyes.',
    900,()=>{ E2.apply(); if(t&&t.st.smitten) { sfx.stun(); bt('AWWW',96,32,'#ff9ac0',4,1.2); setMessage(cap(t.def.the)+' melts. It cannot attack something that cute next turn.'); }
      else setMessage(t?cap(t.def.the)+' looks away on purpose. It has seen this trick before.':'Nobody is looking.'); },
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
const ball=(x,y,r=8)=>{ E(x,y,r+2,r+2,OUT); E(x,y,r,r,BALL); E(x-r*.3,y-r*.3,r*.35,r*.35,'#f2ffa0'); gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(x-r,y,r,-.9,.9); gfx.stroke(); };
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
    [3800,'end',()=>t&&t.st.smitten?cap(t.def.the)+' melts. It cannot attack something that cute next turn.':(t?cap(t.def.the)+' looks away on purpose. It has seen this trick before.':'Nobody is looking.')]]); };
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
  const steps=[[0,()=>{ setMessage('Four little flags pop up. There are four places, so she will go to all four.'); say(m.id,'five_second_zoomies'); }],
    [900,()=>{ barks(3,.1); sfxs('run'); }],['hf',1250]];
  pts.forEach((p,k)=>steps.push([1250+k*380,()=>{ hitT[k]=flags.t; sfx.slash(); ST.jolt(p.f,.35); scene('na_dust',.5,{x:p.x,y:p.y}); scene('na_text',.6,{x:p.x,y:p.y-80,txt:'ZOOM',c:'#9fe8ff'}); landHit(25); }]));
  steps.push([2900,()=>{ scene('na_route',1.4,{pts:[{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3},...pts,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3}]}); setMessage('The route map updates a moment after she has finished it.'); }]);
  steps.push([4300,'end',res(E2)+'Nara has been everywhere on the map. She is panting. She is thrilled.']);
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
    [4100,'end',res(E2)+'Nara does not approve of that game.']]); };

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
    [3800,'end',kindLine(t,'Nara makes sure her friend knows she is there.')]]); };

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
    [3800,'end',res(E2)+'The puddle is tiny. The detour is not.']]); };

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
    S.talk('Tom',['Nara! What are YOU doing here?!','Where is Olivia? Where is Michael? Where are Lachlan and Isla?!']),
    S.call(()=>naraPuddle(map,n.x,n.y)),
    S.wait(.5),
    S.talk('Tom',['...And she peed. She is so happy she peed. Of COURSE she did.']),
    S.call(()=>sfx.squeak()),
    S.talk('Nara',['Nara drops a very wet tennis ball at Tom’s feet. Then she leans on his legs and looks up at him.']),
    S.talk('Tom',['Okay. Okay. Nobody is getting left alone today. We will find your family.']),
    S.call(()=>{ endIntro(); n.idle=1; grantItem('naraball'); if(typeof heartTrace==='function') { heartTrace('nara-meet'); setFlag('met-nara'); } setTimeout(()=>{ if(!inParty(nara)&&!dialog.active&&!battle.active) offerRecruit(nara,n); },900); })
  ];
  runScene(steps);
}

// Talking to her after that: barks, wiggles, sometimes a puddle, then the offer to come along.
function talkToNara(n) {
  if(!n.visitedOnce) { startNaraMeet(n); return; }
  say('nara','greet');
  const excited=Math.random()<.3;
  n.lines=[pick(['Nara wiggles so hard her whole back half goes sideways.','Nara brings Tom a stick. It is the best stick. He has to see it.','Nara sniffed every jacaranda on 2nd Ave. She has a full report.','Nara rolls over for belly rubs. She has earned them. She says.','Somebody offered Nara a biscuit. She looked at it like it was a rock.','Nara drops the tennis ball at Tom’s feet. Then picks it back up. Then drops it. Throw it. THROW IT.'])];
  if(excited) n.lines.push('...She got a little too excited. There is a puddle. Tom steps around it.');
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
