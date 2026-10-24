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
// Nara sits and looks up. Most enemies cannot bring themselves to attack her next turn.
window.cmdPuppy=function() {
  busy();
  const i=battle.actor,m=party[i],fx=battle.fx[i];
  const boss=battle.enemy.def.rank==='BOSS',works=Math.random()<(boss?.45:.75);
  pose(fx,'sit',2.2); sfx.whine(); say(m.id,'puppy',.2);
  scene('pupHearts',2.2,{i}); scene('bigEyes',1.8,{});
  if(works) battle.puppy=true;
  enqueue('Nara sits. Head tilt. Big brown eyes.',900,()=>{ if(works) { sfx.stun(); bt('AWWW',96,32,'#ff9ac0',4,1.2); } },
    works?cap(battle.enemy.def.the)+' melts. It cannot attack something that cute next turn.':cap(battle.enemy.def.the)+' looks away on purpose. It has seen this trick before.',
    ()=>afterAction());
};
// The melted enemy skips its next turn.
const LE_enemyTurn=enemyTurn;
enemyTurn=function() {
  if(battle.puppy&&battle.enemy&&battle.enemy.hp>0) {
    battle.puppy=false; battle.state='busy'; refreshBattleStatus();
    enqueue(cap(battle.enemy.def.the)+' looks at Nara. Nara looks back. It cannot do it.',()=>playerTurn());
    return;
  }
  return LE_enemyTurn.apply(this,arguments);
};
const LE_startBattle=startBattle;
startBattle=function() { battle.puppy=false; return LE_startBattle.apply(this,arguments); };
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
