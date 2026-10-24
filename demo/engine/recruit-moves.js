'use strict';
// engine/recruit-moves.js — Every attack for Amy and Boppy (Deedee's live in engine/deedee-moves.js, TNB's in engine/tnb-moves.js), each with its own animation.
// A move is a function of E = {i, m, fx, dmg, crit, result}; it queues steps like cmdAttack always has
// (strings are messages, numbers are delays in ms, functions run instantly).
const RECRUIT_MOVES={amy:{},deedee:{},boppy:{},tnb:{}};
(function(){
const {scene,hold,GX,GY}=RFX;
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const appr=(fx,d)=>{ fx.appr=d; fx.apprDur=d; };
const hit=E=>landHit(E.dmg,E.crit);
const home=E=>({x:BATTLE_POS[E.i].x*3,y:BATTLE_POS[E.i].base*3});
const hand=E=>{ const a=battle.actorHand; if(a) return {x:a.n[0]-8,y:a.n[1]-8}; const h=home(E); return {x:h.x-20,y:h.y-60}; };
const talk=E=>say(E.m.id,LINES[E.m.id].basic&&E.key==='basic'?'basic':E.key,.2);
const held=()=>battle.held;
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60)=>battle.props.push({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur});
// One throw: wind up, then release. Returns steps for enqueue.
const throwStep=(E,release,gap=300)=>[()=>pose(E.fx,'wind',gap/1000+.05),gap,()=>{ pose(E.fx,'throw',.34); release(); },gap];
const A=RECRUIT_MOVES.amy,D=RECRUIT_MOVES.deedee,B=RECRUIT_MOVES.boppy,T=RECRUIT_MOVES.tnb;

// ================= AMY: track, classroom =================
A.basic=E=>{ const {i,m,fx}=E; const h=home(E);
  enqueue(()=>{ setMessage(pick(['Amy sprints in and shoulders it. She does not slow down.','Amy tackles it like the finish line owes her money.'])); appr(fx,1.5); sfx.run(); say(m.id,LINES[m.id].basic?'basic':'attack'); for(let k=0;k<5;k++) scene('dust',.5,{x:h.x-26-k*24,y:h.y+2,n:3,delay:.05+k*.11}); },
    880,()=>{ fx.punch=.4; pose(fx,'act',.5); battle.slash=.22; sfx.thud(); sfx.slash(); scene('burst',.45,{x:214,y:212}); scene('ring',.55,{x:GX+34,y:264,r:84}); scene('dust',.6,{x:226,y:262,n:6}); bt('WHAM',96,32,'#ffe08a',4,.9); hit(E); battle.enemyKnock=.3; },
    800,E.result,()=>checkEnemy()); };
A.burpee=E=>{ const {i,m,fx}=E,h=home(E);
  enqueue(()=>{ setMessage('Amy drops into burpees. Five of them. In two seconds.'); fx.burpee=1.5; sfx.whoosh(); say(m.id,'burpee'); for(let k=0;k<5;k++) scene('count',.55,{text:String(k+1),x:h.x,y:h.y-120,delay:.12+k*.3,c:k===4?'#ffe08a':'#9fe8ff',sc:k===4?5:4}); for(let k=0;k<3;k++) scene('sweat',.7,{x:h.x-14,y:h.y-96,delay:.4+k*.4}); for(let k=0;k<5;k++) scene('dust',.4,{x:h.x,y:h.y+3,n:3,sp:10,delay:.05+k*.3}); },
    1500,()=>{ fx.lunge=.6; pose(fx,'act',.5); },330,()=>{ battle.slash=.22; sfx.thud(); scene('ring',.6,{x:GX+34,y:264,r:100}); scene('burst',.5,{x:216,y:226,c:'#9fe8ff'}); scene('dust',.6,{x:230,y:262,n:6}); bt('BURPEE',96,36,'#9fe8ff',3,.9); hit(E); },
    700,E.result+' The last one landed on the Grump.',()=>checkEnemy()); };
A.finish=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Amy sees a finish line. It is through the Grump.'); fx.run=1.3; fx.runDur=1.3; fx.runPasses=1; sfx.run(); say(m.id,'finish'); scene('finishline',1.8,{snap:.17}); },
    380,()=>{ sfx.fanfare(); scene('confetti',1.4,{x0:90,x1:260,n:34}); bt('FINISH',96,36,'#ffe08a',3,1); },
    300,()=>{ battle.slash=.2; sfx.slash(); hit(E); battle.enemyKnock=.45; },
    900,E.result+' First place. Obviously.',()=>checkEnemy()); };
A.redpen=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Amy pulls out the red pen. The Grump is being graded.'); appr(fx,3.1); say(m.id,'redpen',.4); },
    720,()=>{ pose(fx,'act',2.0); hold(i,'redpen',2.2,{ang:.55,sw:[.55,.22,10]}); },
    260,()=>{ scene('redmarks',1.7,{}); sfx.bonk(); },
    380,()=>sfx.bonk(),380,()=>sfx.bonk(),420,()=>{ sfx.thud(); battle.shakeEnemy=.4; hit(E); bt('SEE ME',96,30,'#ff8a8a',3,1); },
    900,E.result+' F. F. See me after class.',()=>checkEnemy()); };
A.hills=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Hill repeats. Up the Grump, down the Grump, three times.'); fx.run=2.4; fx.runDur=2.4; fx.runPasses=3; battle.hill=true; sfx.run(); say(m.id,'hills'); scene('hill',2.6,{back:true}); for(let k=0;k<3;k++) scene('count',.7,{text:'REP '+(k+1),x:GX,y:60,delay:.2+k*.8,sc:3,c:'#9fe8ff'}); },
    ...[0,1,2].flatMap(k=>[k===0?400:800,()=>{ battle.slash=.2; sfx.slash(); landHit(Math.max(1,Math.round(E.dmg/3)),E.crit&&k===2); }]),
    1000,()=>{ battle.hill=false; },E.result,()=>checkEnemy()); };
A.quiz=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Pop quiz! No talking. Eyes on your own slime.'); appr(fx,3.2); say(m.id,'quiz',.4); },
    720,()=>{ pose(fx,'hip',1.2); hold(i,'clip',2.4,{}); scene('blackboard',2.4,{}); sfx.whoosh(); },
    1100,()=>{ pose(fx,'throw',.6); const hh=hand(E); for(let k=0;k<6;k++) battle.props.push({kind:'paper',x0:hh.x,y0:hh.y,x1:130+k*14,y1:200+(k%2)*12,t:-k*.08,dur:.7+k*.08}); sfx.whoosh(); },
    900,()=>{ hit(E); if(Math.random()<.4) confuse2(); bt('???',60,36,'#fff1cb',4,1); battle.shakeEnemy=.4; },
    600,()=>setMessage(battle.enemyStunned===2?E.result+' The Grump did not study.':E.result),1150,()=>checkEnemy()); };
A.marathon=E=>{ const {i,m,fx}=E; const mi=['MILE 5','MILE 10','MILE 15','MILE 20','MILE 26'];
  enqueue(()=>{ setMessage('Amy runs a marathon. All of it goes through the Grump.'); fx.run=3.2; fx.runDur=3.2; fx.runPasses=5; sfx.run(); say(m.id,'marathon'); mi.forEach((t,k)=>scene('miles',.85,{text:t,delay:k*.64})); for(let k=0;k<4;k++) scene('sweat',.8,{x:BATTLE_POS[i].x*3-14,y:BATTLE_POS[i].base*3-96,delay:.6+k*.7}); scene('finishline',1.3,{snap:.3,delay:2.5}); },
    ...[0,1,2,3,4].flatMap(k=>[k===0?320:640,()=>{ battle.slash=.2; sfx.slash(); landHit(Math.max(1,Math.round(E.dmg/5)),E.crit&&k===4); }]),
    500,()=>{ sfx.fanfare(); scene('confetti',1.4,{x0:80,x1:280,n:34}); bt('26.2',52,36,'#9fe8ff',4,1); },
    700,E.result+' Negative splits.',()=>checkEnemy()); };
A.pb=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Amy sets a personal best. The Grump is the course.'); fx.run=1.8; fx.runDur=1.8; fx.runPasses=2; sfx.run(); say(m.id,'pb'); scene('stopwatch',3.2,{x:GX,y:58}); },
    ...[0,1].flatMap(k=>[k===0?450:900,()=>{ battle.slash=.2; sfx.slash(); landHit(Math.max(1,Math.round(E.dmg/2)),E.crit&&k===1); }]),
    700,()=>{ pose(fx,'celeb',1.6); battle.enemyKnock=.45; battle.flashEnemy=.5; sfx.levelChime(); scene('trophy',1.8,{}); bt('NEW PB',96,36,'#ffe08a',3,1.2); },
    780,()=>{ sfx.thud(); sfx.fanfare(); scene('confetti',1.6,{x0:70,x1:290,n:40}); scene('ring',.6,{x:GX,y:264,r:90}); battle.shakeEnemy=.5; },
    1000,E.result+' A new record. She will mention it at dinner.',()=>checkEnemy()); };
function confuse2(){ battle.enemyStunned=2; sfx.stun(); }

// DEEDEE: her moves live in engine/deedee-moves.js.

// ================= BOPPY: fishing, peppers, recliner =================
B.basic=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage(pick(['Boppy swats it with his cap. His stomach complains.','Boppy leans in and bonks it. Then sits down. Not feeling good.'])); appr(fx,1.8); say(m.id,LINES[m.id].basic?'basic':'attack'); },
    650,()=>{ pose(fx,'act',1.0); hold(i,'cap',1.1,{ang:.3,sw:[.5,.25,9]}); },
    420,()=>{ const h=held(); if(h) { h.sw=null; h.ang=-.2; } scene('swish',.35,{x:236,y:200,r:46,a0:-2.5,sw:2.2}); sfx.slash(); },
    120,()=>{ scene('burst',.4,{x:212,y:212}); scene('dust',.5,{x:216,y:226,n:4}); sfx.bonk(); battle.slash=.2; bt('SWAT',96,34,'#ffe08a',4,.8); hit(E); },
    760,E.result,()=>checkEnemy()); };
B.cast=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Boppy casts. Perfect form. His stomach disagrees.'); hold(i,'rod',2.7,{ang:.9,angTo:2.1,len:124}); pose(fx,'wind',.7); say(m.id,'cast'); },
    650,()=>{ const h=held(); if(h) h.angTo=.25; pose(fx,'throw',.6); sfx.whoosh(); scene('castline',1.6,{ex:GX+6,ey:206}); },
    650,()=>{ const h=held(); if(h) { h.angTo=1.7; h.bend=.7; } pose(fx,'wind',.7); sfx.thud(); battle.shakeEnemy=.5; scene('splashw',.7,{x:GX,y:226,n:10,sp:80}); bt('YANK',48,36,'#ffe08a',3,.9); hit(E); },
    900,E.result+' Hooked. Then released. Boppy is sporting.',()=>checkEnemy()); };
B.pepper=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Boppy had a pepper with lunch. He leans in and breathes.'); hold(i,'pepper',1.5,{eat:[.3,.8],pa:1.0}); pose(fx,'hip',1.5); say(m.id,'pepper',.3); },
    900,()=>{ scene('steamears',1.2,{}); sfx.stun(); },
    700,()=>{ pose(fx,'act',1.4); const mo=battle.actorMouth||{x:340,y:150}; sfx.fireball(); scene('jet',1.4,{x0:mo.x,y0:mo.y,x1:GX+44,y1:GY-8,w:30,grow:.26,wob:9}); scene('flames',1.0,{x:GX,y:262,w:96,h:96,delay:.32}); scene('flash',.35,{c:'#ffb070',a:.3,delay:.3}); },
    600,()=>{ battle.shakeEnemy=.7; hit(E); bt('WHEW',52,36,'#ffb070',3,.9); },
    900,E.result+' The Grump has questions about lunch.',()=>checkEnemy()); };
B.recliner=E=>{ const {i,m,fx}=E,h=home(E);
  enqueue(()=>{ setMessage('Boppy whistles. The recliner comes when called.'); pose(fx,'hip',1.8); say(m.id,'recliner'); sfx.slideWhistle(); for(let k=0;k<3;k++) scene('note',.9,{x:h.x-30-k*10,y:h.y-96,delay:k*.18}); },
    450,()=>{ scene('shadow',1.3,{x:GX,y:264,r:70}); battle.props.push({kind:'recliner',x0:GX,y0:-70,x1:GX+4,y1:204,t:0,dur:1.3}); },
    1250,()=>{ sfx.thud(); sfx.lineClear(); battle.shakeEnemy=.7; scene('ring',.7,{x:GX,y:264,r:120}); scene('dust',.8,{x:GX,y:264,n:8,sp:20}); hit(E); bt('DO NOT SIT',96,36,'#ffe08a',2,1); },
    950,E.result+' Everyone has tried. Everyone has been told.',()=>checkEnemy()); };
B.hotpepper=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Boppy grew this one himself. He offers it. The Grump accepts.'); hold(i,'pepper',.9,{pa:1.1}); pose(fx,'wind',.55); say(m.id,'hotpepper'); },
    520,()=>{ battle.held=null; pose(fx,'throw',.45); const h=hand(E); battle.props.push({kind:'pepper',x0:h.x,y0:h.y,x1:GX,y1:212,arc:60,spin:false,t:0,dur:.75}); sfx.whoosh(); },
    780,()=>{ sfx.fireball(); sfx.splat(); battle.shakeEnemy=.9; scene('pepperburst',.9,{x:GX,y:GY}); scene('flames',1.0,{x:GX,y:262,w:90,h:100}); battle.props.push({kind:'steam',x0:GX,y0:150,x1:GX,y1:150,t:0,dur:1.4}); bt('HOT!!',96,36,'#ff6b5a',3,1); hit(E); },
    900,E.result+' The garden hose flinched too.',()=>checkEnemy()); };
B.bigcatch=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Boppy sets the hook. Big one. The biggest one.'); hold(i,'rod',3.4,{ang:1.0,angTo:1.9,len:124}); pose(fx,'wind',.7); say(m.id,'bigcatch'); },
    600,()=>{ const h=held(); if(h) h.angTo=.3; pose(fx,'throw',.5); sfx.whoosh(); scene('castline',.5,{ex:GX-4,ey:212}); },
    520,()=>{ const h=held(); if(h) { h.angTo=1.5; h.bend=.95; h.sw=[1.5,.07,34]; } pose(fx,'wind',2.0); sfx.charge(); scene('reelline',2.4,{}); battle.enemyWobble=1.0; },
    350,()=>{ battle.lift={t:0,dur:1.4}; sfx.slideWhistle(); scene('ring',1.4,{x:GX,y:266,r:80,c:'#bfe6ff',sq:.2}); },
    1000,()=>{ battle.enemyWobble=0; },
    380,()=>{ sfx.thud(); sfx.splat(); battle.shakeEnemy=.6; battle.flashEnemy=.4; scene('splashw',1.0,{x:GX,y:262,n:16,sp:150}); scene('ring',.8,{x:GX,y:266,r:130,c:'#bfe6ff',sq:.2}); bt('BIG CATCH',96,36,'#ffe08a',2,1); hit(E); },
    900,E.result+' Boppy will describe this one for years.',()=>checkEnemy()); };
B.ghost=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Ghost pepper. Boppy eats it whole. Nobody could stop him.'); hold(i,'pepper',1.5,{ghost:true,eat:[.3,.85],pa:1.0}); pose(fx,'hip',1.5); say(m.id,'ghost',.3); },
    1000,()=>{ scene('dark',2.4,{a:.6,c:'#1a0f3a'}); scene('steamears',.9,{}); sfx.stun(); },
    600,()=>{ pose(fx,'act',1.6); scene('ghost',1.9,{}); sfx.slideWhistle(); bt('BOO',70,30,'#d6c8ff',4,.9); },
    1100,()=>{ sfx.fireball(); scene('flames',1.2,{x:GX,y:262,w:100,h:110,cs:['#6a4fc8','#9a7fe8','#d6c8ff','#ffffff']}); scene('flash',.4,{c:'#c9b3ff',a:.4}); battle.flashEnemy=.6; battle.shakeEnemy=.8; hit(E); battle.props.push({kind:'steam',x0:GX,y0:150,x1:GX,y1:150,t:0,dur:1.6}); bt('GHOST PEPPER',96,36,'#d6c8ff',2,1.2); },
    1000,E.result+' Boppy needs milk. Immediately.',()=>checkEnemy()); };
B.gotaway=E=>{ const {i,m,fx}=E;
  enqueue(()=>{ setMessage('Boppy spreads his arms. "It was THIS big." It was.'); fx.hug=1.3; hold(i,'none',1.6,{measure:true,nofist:true}); say(m.id,'gotaway'); sfx.slideWhistle(); },
    1000,()=>{ battle.props.push({kind:'fish',x0:640,y0:70,x1:70,y1:210,arc:90,t:0,dur:1.1}); sfx.slideWhistle(); scene('splashw',.9,{x:480,y:150,n:8,sp:120,delay:.1}); },
    860,()=>{ sfx.thud(); sfx.splat(); battle.enemyKnock=.5; battle.flashEnemy=.5; scene('splashw',1.0,{x:GX,y:226,n:18,sp:170}); scene('ring',.8,{x:GX,y:266,r:130,c:'#bfe6ff',sq:.2}); bt('THIS BIG',96,36,'#ffe08a',3,1.2); hit(E); },
    900,E.result+' The one that got away came back.',()=>checkEnemy()); };

// Map the data-file keys onto the move table (some keys differ from the function names above).
A.hills=A.hills; 
for(const id in RECRUIT_MOVES) for(const k in RECRUIT_MOVES[id]) { const f=RECRUIT_MOVES[id][k]; RECRUIT_MOVES[id][k]=E=>{ E.key=k; f(E); }; }
})();
