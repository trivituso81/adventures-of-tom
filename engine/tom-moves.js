'use strict';
// engine/tom-moves.js — Tom's attacks, built from his hobbies: games, sourdough, Japanese, gadgets, Delta One.
// Same shape as recruit-moves.js: RECRUIT_MOVES.tom[key] queues steps and registers scenes (RFX.SC) and props (PROP2).
RECRUIT_MOVES.tom={};
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const rrect=(x,y,w,h,r,c)=>{ if(!gfx.roundRect) { R(x,y,w,h,c); return; } gfx.beginPath(); gfx.roundRect(x,y,w,h,r); gfx.fillStyle=c; gfx.fill(); };
// Real kanji, drawn with the system font. The only place the game uses one.
const kanji=(ch,x,y,size,c,o)=>{ gfx.save(); gfx.font='bold '+size+'px "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic",sans-serif'; gfx.textAlign='center'; gfx.textBaseline='middle'; if(o) { gfx.lineWidth=Math.max(3,size*.18); gfx.lineJoin='round'; gfx.strokeStyle=o; gfx.strokeText(ch,x,y); } gfx.fillStyle=c; gfx.fillText(ch,x,y); gfx.restore(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const tomPos=()=>battle.actorPos||{cx:399,base:246,h:105};
const hand=()=>{ const p=tomPos(); return {x:p.cx-30,y:p.base-Math.round(p.h*.56)}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const act=(fx,d)=>{ fx.punch=d; };
const Tm=RECRUIT_MOVES.tom;

// ================= Props =================
PROP2.abtn=(q,u)=>{ E(0,0,11,11,OUT); E(0,0,9,9,'#e0402e'); E(-3,-3,4,3,'#ff8a7a'); label('A',0,-2,'#fff8e8',1); };
PROP2.jar=(q,u)=>{ R(-14,-16,28,34,OUT); R(-12,-14,24,30,'#cfe6ee'); R(-12,-14,24,8,'#9fc8d8'); R(-14,-22,28,8,OUT); R(-12,-20,24,5,'#c9a03e'); R(-12,-2,24,18,'#efe3c8'); for(let k=0;k<5;k++) { const a=((k*37)%20)-10,b=((u*90+k*13)%16); E(a,12-b,2,2,'#fff8e8'); } R(-10,-8,3,20,'rgba(255,255,255,.5)'); };
PROP2.card=(q,u)=>{ R(-17,-22,34,44,OUT); R(-15,-20,30,40,'#fff8e8'); R(-15,-20,30,5,'#e0402e'); kanji(q.ch,0,3,24,'#2b2a26'); };
PROP2.tag=(q,u)=>{ poly([[-22,-8],[14,-8],[22,0],[14,8],[-22,8]],'#f1d58c',true); E(16,0,2.5,2.5,OUT); label('$$$',-5,-2,'#7a1a14',1); };
PROP2.pass=(q,u)=>{ R(-30,-13,60,26,OUT); R(-28,-11,56,22,'#fff8e8'); R(-28,-11,56,6,'#1d3a8a'); R(-28,-5,16,16,'#c9ccd4'); label('SEAT 38E',12,-2,'#2b2a26',1); label('BASIC',12,5,'#e0402e',1); };

// ================= Scenes =================
SC.spark=(s,u)=>{ gfx.globalAlpha=env(u,.1,.6); const p=hand(); for(let k=0;k<6;k++) { const a=rr(s,k)*6.3,r=10+u*36; label(k%2?'+':'*',p.x+Math.cos(a)*r,p.y-10+Math.sin(a)*r*.6,k%3?'#ffe08a':'#9fe8ff',2); } };
SC.goo=(s,u)=>{
  const k=ez(u/.1),x=GX-4,y=190-(battle.liftNow||0); gfx.globalAlpha=u>.85?(1-u)/.15:1; const c='#efe3c8',c2='#fff8e8';
  E(x,y,44*k,24*k,OUT); E(x,y,42*k,22*k,c); E(x-14,y-8,16*k,9*k,c2);
  const dr=cl((u-.1)*1.1); for(let d=0;d<5;d++) { const dx=x-32+d*16,len=(10+(d%3)*14)*dr; R(dx-4,y+10,8,len,OUT); R(dx-3,y+10,6,len,c); E(dx,y+10+len,4.6,5.4,OUT); E(dx,y+10+len,3.4,4.2,c); }
  for(let b=0;b<8;b++) { const ph=(s.t*1.6+b/8)%1,bx=x-30+b*9+Math.sin(s.t*5+b)*3,by=y+4-ph*48; gfx.globalAlpha*=1; E(bx,by,2.4+(b%2),2.4+(b%2),OUT); E(bx,by,1.6+(b%2),1.6+(b%2),c2); }
  if(u>.12) label('78% HYDRATION',GX,124,'#ffe08a',2);
};
SC.cardfan=(s,u)=>{ const p=hand(); gfx.globalAlpha=env(u,.1,.85); for(let k=0;k<5;k++) { gfx.save(); gfx.translate(p.x-4,p.y+6); gfx.rotate(-.9+k*.32); R(-9,-40,18,36,OUT); R(-8,-39,16,34,'#fff8e8'); R(-8,-39,16,4,'#e0402e'); gfx.restore(); } };
SC.meaning=(s,u)=>{ gfx.globalAlpha=env(u,.1,.7); label(s.text,s.x,s.y-u*18,s.c||'#9fe8ff',2); };
SC.box=(s,u)=>{
  // A big box drops in, the lid flies, a glowing gadget rises out of it and goes off.
  const land=.14,bx=320,by=u<land?lerp(-120,210,ez(u/land)):210,w=92,h=58;
  gfx.globalAlpha=u>.94?(1-u)/.06:1;
  const open=cl((u-.3)/.12),rise=ez(cl((u-.42)/.2)),glow=cl((u-.55)/.1);
  if(u>land&&u<land+.08) for(let k=0;k<6;k++) { const q=(u-land)/.08; E(bx-50+k*20,by+h-2,8+q*10,4,'rgba(230,220,190,'+(.8-q*.8)+')'); }
  // gadget rising from inside the box
  if(rise>0) { const gy=by+10-rise*96,gx=bx; E(gx,gy+4,40+glow*40,24+glow*20,'rgba(159,232,255,'+(.12+glow*.3)+')'); R(gx-18,gy-28,36,56,OUT); rrect(gx-16,gy-26,32,52,5,'#1c1d24'); rrect(gx-13,gy-22,26,44,3,glow>0?'#dff7ff':'#3a4a66'); if(glow>0) { R(gx-9,gy-16,18,3,'#9fe8ff'); R(gx-9,gy-8,12,3,'#9fe8ff'); R(gx-9,gy,16,3,'#9fe8ff'); label('HELLO',gx,gy+9,'#2f6fb0',1); } E(gx,gy+22,2,2,'#aab'); }
  // box body
  R(bx-w/2-2,by-2,w+4,h+4,OUT); R(bx-w/2,by,w,h,'#c9a070'); R(bx-w/2,by,w,10,'#b88c5a'); R(bx-w/2+10,by+8,w-20,42,'#d9b382'); R(bx-6,by,12,h,'#e8d7b0'); label('FRAGILE',bx,by+h-14,'#7a1a14',1); label('THIS SIDE UP',bx,by+h-8,'#7a1a14',1);
  // flaps: closed, then flung open
  if(open<1) { const fw=w/2*(1-open); R(bx-w/2,by-3,fw,8,OUT); R(bx-w/2+1,by-2,fw-2,6,'#b88c5a'); R(bx+w/2-fw,by-3,fw,8,OUT); R(bx+w/2-fw+1,by-2,fw-2,6,'#b88c5a'); }
  else { for(const sd of [-1,1]) { gfx.save(); gfx.translate(bx+sd*w/2,by); gfx.rotate(sd*1.9); R(sd<0?-w/2:0,-3,w/2,8,OUT); R((sd<0?-w/2:0)+1,-2,w/2-2,6,'#b88c5a'); gfx.restore(); } }
  if(u>land+.02&&u<.3) { const q=(u-land)/.16,tx=bx-w/2+q*w; Ln(bx-w/2,by+1,tx,by+1,4,'#fff8e8'); label('RIP',tx,by-16,'#fff1cb',2); }
  if(glow>0) { gfx.globalAlpha*=env(u,.55,.9); label('ONE MORE THING',bx,by-142,'#ffe08a',2); }
};
SC.gadgetbeam=(s,u)=>{ const e=env(u,.08,.8); if(e<=0) return; gfx.globalAlpha=e; const x0=320,y0=118,x1=GX+16,y1=GY-10; for(let k=0;k<3;k++) Ln(x0,y0,x1,y1,[18,10,4][k],['rgba(159,232,255,.35)','#9fe8ff','#ffffff'][k]); E(x1,y1,18+u*30,12+u*20,'rgba(223,247,255,'+(.6*(1-u))+')'); for(let k=0;k<8;k++) { const a=k*.8+s.t*5,r=14+((s.t*70+k*9)%44); R(x1+Math.cos(a)*r,y1-Math.abs(Math.sin(a))*r*.8,4,4,k%2?'#ffffff':'#9fe8ff'); } };
SC.dutch=(s,u)=>{
  // Cast iron pot drops onto the Grump, lid pops, steam, and a scored loaf rises out.
  const land=.26,x=GX,y=u<land?lerp(-120,186,u/land*u/land):186,w=104,h=52;
  gfx.globalAlpha=u>.95?(1-u)/.05:1;
  const lidUp=ez(cl((u-.38)/.14)),loaf=ez(cl((u-.5)/.22));
  E(x,y+h-6,w/2+8,10,'rgba(47,73,54,.35)');
  // steam puffs
  if(lidUp>0) for(let k=0;k<7;k++) { const ph=(s.t*1.3+k/7)%1,sx=x-40+k*13+Math.sin(s.t*4+k)*5,sy=y-6-ph*70,r=6+ph*10; gfx.globalAlpha=(1-ph)*.85; E(sx,sy,r,r*.8,'#fff8e8'); } gfx.globalAlpha=u>.95?(1-u)/.05:1;
  // loaf
  if(loaf>0) { const ly=y+2-loaf*44; E(x,ly+10,38,8,'rgba(47,73,54,.25)'); E(x,ly,38,24,OUT); E(x,ly,36,22,'#c98a4b'); E(x-6,ly-6,24,12,'#e3b47a'); poly([[x-26,ly-8],[x-6,ly-20],[x+8,ly-12],[x+28,ly-4],[x+10,ly-2],[x-10,ly+2]],'#f1d9a8'); Ln(x-24,ly-6,x+20,ly-14,3,'#8a5a30'); for(let k=0;k<5;k++) label('~',x-24+k*12,ly-36-Math.round(Math.abs(Math.sin(s.t*3+k))*6),'rgba(255,246,220,.8)',2); if(loaf>.9) label('EAR',x+44,ly-28,'#ffe08a',2); }
  // pot
  R(x-w/2-2,y,w+4,h,OUT); R(x-w/2,y+2,w,h-4,'#3a3d44'); R(x-w/2+8,y+2,w-16,6,'#5a5e68'); R(x-w/2-16,y+12,16,10,OUT); R(x+w/2,y+12,16,10,OUT); R(x-w/2-14,y+14,12,6,'#3a3d44'); R(x+w/2+2,y+14,12,6,'#3a3d44');
  // lid, flies up and off
  const lx=x-lidUp*150,ly2=y-14-lidUp*90+Math.sin(lidUp*Math.PI)*-50; gfx.save(); gfx.translate(lx,ly2); gfx.rotate(-lidUp*.6); E(0,0,w/2+4,12,OUT); E(0,0,w/2+2,10,'#3a3d44'); E(-10,-3,24,4,'#5a5e68'); E(0,-10,8,6,OUT); E(0,-10,6,4,'#5a5e68'); gfx.restore();
  if(u>.04&&u<.26) label('500 DEGREES',x,126,'#ff8c3a',2);
};
SC.kanjifire=(s,u)=>{
  // Brush strokes of 火, in order, then the whole character burns red.
  const x=GX,y=150-(battle.liftNow||0),S=78;
  gfx.globalAlpha=u>.9?(1-u)/.1:1;
  const strokes=[[[-.42,-.28],[-.3,-.06]],[[.42,-.28],[.3,-.06]],[[0,-.5],[-.1,-.1],[-.44,.42]],[[.02,-.16],[.14,.08],[.44,.42]]];
  const lit=u>.62,burn=cl((u-.62)/.12);
  if(lit) { E(x,y,54+burn*20,54+burn*20,'rgba(255,140,58,'+(.25*env(u,.62,.9))+')'); }
  strokes.forEach((st,k)=>{ const q=cl((u-.06-k*.13)/.12); if(q<=0) return; for(let i=1;i<st.length;i++) { const segs=st.length-1,q0=cl(q*segs-(i-1)); if(q0<=0) continue; const a=st[i-1],b=st[i]; const x0=x+a[0]*S,y0=y+a[1]*S,x1=lerp(x0,x+b[0]*S,q0),y1=lerp(y0,y+b[1]*S,q0); Ln(x0,y0,x1,y1,16,OUT); Ln(x0,y0,x1,y1,10,lit?(Math.floor(s.t*20)%2?'#ff8c3a':'#e0402e'):'#2b2a26'); } });
  if(u>.12&&u<.62) { const q=Math.floor(u*8)%2; label('HI',x+60,y-50,q?'#ffe08a':'#fff1cb',2); }
  if(lit) { gfx.globalAlpha*=env(u,.62,.9); label('FIRE',x,y+62,'#ffe08a',3); }
};
SC.brush=(s,u)=>{ const p=hand(),x=p.x-6,y=p.y+2; gfx.globalAlpha=env(u,.1,.9); gfx.save(); gfx.translate(x,y); gfx.rotate(-.6+Math.sin(s.t*9)*.25); R(-4,-6,8,44,OUT); R(-3,-5,6,42,'#8a5a30'); R(-3,-5,6,8,'#c9a03e'); poly([[-6,36],[6,36],[2,52],[-2,52]],'#2b2a26',true); gfx.restore(); for(let k=0;k<3;k++) { const q=(s.t*3+k/3)%1; E(x-10-q*20,y+40-q*10,2.5,2.5,'rgba(43,42,38,'+(1-q)+')'); } };
SC.seat=(s,u)=>{
  // A lie-flat pod slides in behind Tom: long bed, headrest at the far end, a little tray with a glass.
  const p=tomPos(),b=p.base,slide=ez(u/.16),fade=u>.9?(1-u)/.1:1; gfx.globalAlpha=fade;
  const x=p.cx+(1-slide)*260,w=150;
  R(x-40,b-30,w+8,30,OUT); R(x-38,b-28,w+4,26,'#1d3a8a'); R(x-38,b-28,w+4,6,'#3458b0'); R(x-34,b-10,w-4,4,'#142a66');
  R(x+w-54,b-74,44,50,OUT); R(x+w-52,b-72,40,46,'#1d3a8a'); R(x+w-50,b-70,36,14,'#c9ccd4'); R(x+w-52,b-44,40,4,'#3458b0');
  R(x+w-70,b-42,30,8,OUT); R(x+w-68,b-40,26,4,'#e8e8f0'); R(x+w-62,b-56,8,16,OUT); R(x+w-60,b-54,4,12,'#ffd166'); E(x+w-58,b-56,5,3,OUT); E(x+w-58,b-56,3.4,1.6,'#fff8e8');
  if(u>.3) { label('1A',x+w-32,b-92,'#ffe08a',2); label('LIE FLAT',x+40,b-44,'#fff1cb',1); }
};
SC.plane=(s,u)=>{
  // The jet sweeps across the sky, banks low over the Grump, and the wash knocks him sideways.
  const t=ez(u),x=lerp(640,-200,t),dip=Math.sin(t*Math.PI),y=60+dip*70,sc=1+dip*.5; gfx.globalAlpha=u>.92?(1-u)/.08:1;
  for(let k=0;k<2;k++) { gfx.strokeStyle='rgba(255,255,255,'+(.35-k*.1)+')'; gfx.lineWidth=7-k*2; gfx.beginPath(); gfx.moveTo(x+40*sc,y-6+k*14); gfx.quadraticCurveTo(x+200,y-10+k*14-dip*20,x+420,y-50*(1-t)+k*14); gfx.stroke(); }
  gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.rotate(-.12+dip*.1);
  poly([[-60,-4],[-50,-12],[40,-12],[62,-2],[40,8],[-50,8]],'#e8e8f0',true); poly([[-60,-4],[-50,8],[40,8],[62,-2]],'#c9ccd4'); poly([[-54,-12],[-40,-36],[-30,-36],[-36,-12]],'#1d3a8a',true);
  poly([[-10,-6],[6,-28],[24,-28],[12,-6]],'#1d3a8a',true); poly([[-20,2],[-2,26],[18,26],[6,2]],'#c9ccd4',true);
  for(let k=0;k<7;k++) R(-36+k*11,-7,6,4,'#5c8fe0'); R(44,-9,10,5,'#5c8fe0'); poly([[-18,2],[-6,2],[-4,12],[-18,12]],'#8a8f96',true); poly([[-50,-12],[-56,-20],[-46,-20],[-42,-12]],'#e0402e');
  label('DELTA',-20,-5,'#1d3a8a',1);
  gfx.restore();
  if(dip>.6) { const q=(dip-.6)/.4; for(let k=0;k<6;k++) { const yy=200+k*12,ln=20+k*8; Ln(GX-80-k*6,yy,GX-80-k*6-ln*q,yy+2,3,'rgba(255,255,255,'+(.7*q)+')'); } for(let k=0;k<5;k++) { const a=rr(s,k); E(GX-60-q*80*a,230-a*40,4,3,'#8fb07a'); } }
};
SC.bossbar=(s,u)=>{
  // A proper boss health bar across the top. It chips with each hit (s.hp from 1 to 0) and drains at the end.
  const drop=ez(u/.1),y=-30+drop*44; gfx.globalAlpha=u>.95?(1-u)/.05:1;
  R(80,y-2,420,22,OUT); R(82,y,416,18,'#1b2d27'); R(84,y+2,412,14,'#4a1a1a');
  const hp=s.drain!=null?cl(s.hp*(1-cl((s.t-s.drain)/.6))):s.hp; R(84,y+2,412*hp,14,'#e0402e'); R(84,y+2,412*hp,4,'#ff8a7a');
  for(let k=1;k<10;k++) R(84+k*41.2,y+2,2,14,OUT);
  label('POND GRUMP',290,y-10,'#fff1cb',1); R(68,y-6,22,24,OUT); R(70,y-4,18,20,'#fff8e8'); R(74,y+2,3,4,OUT); R(81,y+2,3,4,OUT); R(76,y+10,6,3,OUT);
  if(s.drain!=null&&hp<=0) label('FLAWLESS',290,y+24,'#ffe08a',3);
};
SC.glitch=(s,u)=>{ gfx.globalAlpha=1; for(let k=0;k<8;k++) { const a=rr(s,k+Math.floor(s.t*30)),yy=Math.floor(a*300),hh=4+Math.floor(rr(s,k+9)*10),dx=Math.floor((rr(s,k+Math.floor(s.t*17))-.5)*60); try { gfx.drawImage(bcanvas,0,yy,576,hh,dx,yy,576,hh); } catch(e) {} R(0,yy,576,2,k%2?'rgba(159,232,255,.6)':'rgba(224,64,46,.5)'); } };

// ================= Moves =================
Tm.mash=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage(pick(['Tom mashes the A button. Strategy is for later.','Tom presses A. Then A. Then A again, with feeling.'])); fx.controller=1.5; sfx.combo(); say('tom','mash'); scene('spark',1.2,{}); for(let k=0;k<7;k++) setTimeout(()=>{ const h=hand(); toss('abtn',h.x,h.y-10,GX+10+(k%3)*12,206+(k%2)*10,0,.5,40+k*4); sfx.select(); },120+k*110); },
    1250,()=>{ battle.slash=.22; sfx.bonk(); battle.shakeEnemy=.4; bt('MASH',96,34,'#ffe08a',4,.9); hit(E2); },
    700,E2.result,()=>checkEnemy()); };
Tm.starter=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom brings out the sourdough starter. Day three. Very active.'); say('tom','starter'); const h=hand(); battle.props.push({kind:'jar',x0:h.x,y0:h.y,x1:h.x,y1:h.y-8,arc:0,spin:false,t:0,dur:1.0}); },
    1000,()=>{ act(fx,.5); const h=hand(); toss('jar',h.x-20,h.y-10,GX,196,0,.65,80); sfx.whoosh(); },
    680,()=>{ sfx.splat(); sfx.bonk(); scene('goo',2.2,{}); scene('splashw',.6,{x:GX,y:200,c:'#efe3c8',c2:'#fff8e8',n:12,sp:80}); battle.shakeEnemy=.5; bt('SPLAT',96,36,'#fff1cb',3,1); hit(E2); },
    900,E2.result+' The Grump is now very bubbly.',()=>checkEnemy()); };
Tm.flashcard=E2=>{ const {fx,dmg,crit}=E2; const cards=[['猫','CAT'],['水','WATER'],['木','TREE'],['犬','DOG'],['月','MOON'],['火','FIRE']]; const per=Math.max(1,Math.floor(dmg/6)),last=Math.max(1,dmg-per*5);
  enqueue(()=>{ setMessage('Tom pulls out the flashcards. Pop quiz. No partial credit.'); say('tom','flashcard'); scene('cardfan',1.1,{}); },
    900,...cards.flatMap(([ch,mean],k)=>[k===0?100:300,()=>{ act(fx,.3); const h=hand(); toss('card',h.x-10,h.y-20,GX+(k%2?16:-10),196+(k%3)*12,0,.34,50,{ch}); sfx.whoosh(); setTimeout(()=>{ battle.slash=.18; sfx.slash(); scene('meaning',.7,{text:mean,x:GX+(k%2?60:-60),y:150+(k%3)*18}); landHit(k===5?last:per,crit&&k===5); },340); }]),
    800,()=>{ bt('QUIZZED',96,34,'#9fe8ff',3,1); sfx.lineClear(); battle.flashEnemy=.3; },
    800,E2.result+' The Grump got none of them.',()=>checkEnemy()); };
Tm.unbox=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('A package arrives. Tom did not need it. Tom needed it.'); say('tom','unbox'); scene('box',4.2,{}); sfx.slideWhistle(); },
    600,()=>{ sfx.thud(); battle.shakeEnemy=.2; },
    120,()=>{ act(fx,1.2); },
    560,()=>{ sfx.whoosh(); },
    520,()=>{ sfx.charge(); const h=hand(); toss('tag',h.x,h.y,GX+30,250,0,1.2,90); },
    700,()=>{ sfx.ding(); bt('NEW',96,42,'#9fe8ff',4,.8); },
    400,()=>{ scene('gadgetbeam',.9,{}); sfx.laser(); },
    300,()=>{ battle.flashEnemy=.4; scene('flash',.4,{a:.6}); scene('ring',.6,{x:GX,y:264,r:100,c:'#9fe8ff'}); bt('$$$$',96,36,'#ffe08a',4,1); hit(E2); },
    900,E2.result+' It was on sale. It was not on sale.',()=>checkEnemy()); };
Tm.dutch=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom preheats the dutch oven. Five hundred degrees. Lid on.'); say('tom','dutch'); act(fx,.6); scene('dutch',3.4,{}); sfx.charge(); },
    880,()=>{ sfx.thud(); sfx.lineClear(); battle.shakeEnemy=.6; scene('dust',.7,{x:GX,y:262,n:8,sp:22,up:20}); scene('ring',.6,{x:GX,y:264,r:110}); hit(E2); },
    450,()=>{ sfx.whoosh(); },
    500,()=>{ sfx.ding(); bt('CRUSTY',96,34,'#f3c37a',3,1); },
    1200,E2.result+' Perfect oven spring. On the Grump.',()=>checkEnemy()); };
Tm.kanji=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom writes a kanji in the air. Stroke order matters.'); say('tom','kanji'); act(fx,2.2); scene('brush',2.3,{}); scene('kanjifire',3.6,{}); },
    ...[0,1,2,3].flatMap(k=>[k===0?220:470,()=>{ sfx.whoosh(); }]),
    700,()=>{ sfx.fireball(); scene('flames',1.3,{x:GX,y:262,w:120,h:110,n:8}); scene('glow',1.2,{x:GX,y:210,c:'#ff8c3a',a:.45}); battle.flashEnemy=.4; battle.shakeEnemy=.5; bt('FIRE',96,30,'#ff8c3a',4,1); hit(E2); },
    1100,E2.result+' It means fire. Now it also means ouch.',()=>checkEnemy()); };
Tm.delta=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom gets the upgrade. Seat 1A. He lies all the way flat.'); say('tom','delta'); scene('seat',3.2,{back:true}); sfx.slideWhistle(); },
    600,()=>{ sfx.levelChime(); },
    700,()=>{ scene('plane',2.0,{}); sfx.charge(); sfx.run(); },
    1050,()=>{ battle.enemyWobble=.8; sfx.whoosh(); sfx.whoosh(); battle.enemyKnock=.45; battle.shakeEnemy=.5; hit(E2); scene('dust',.8,{x:GX-20,y:262,n:8,sp:26,up:16}); bt('UPGRADED',96,60,'#9fe8ff',3,1); },
    600,()=>{ toss('pass',GX+120,-20,GX+8,212,0,1.0,0,{spin:false}); },
    1100,E2.result+' The Grump is in basic economy. Middle seat.',()=>checkEnemy()); };
Tm.finalboss=E2=>{ const {fx}=E2; let bar;
  enqueue(()=>{ setMessage('Tom reaches the final boss. The music changes.'); say('tom','finalboss'); fx.controller=5.2; sfx.combo(); scene('dark',5.6,{a:.55,back:true}); bar=scene('bossbar',5.8,{hp:1}); },
    900,()=>{ battle.laser={t:0,dur:.7}; sfx.laser(); bar.hp=.78; },
    600,()=>{ battle.laser={t:0,dur:.7}; sfx.laser(); bar.hp=.56; scene('glitch',.35,{}); },
    600,()=>{ battle.fireball={t:0,dur:.5}; sfx.fireball(); },
    520,()=>{ bar.hp=.34; scene('glitch',.3,{}); },
    200,()=>{ battle.tetris={t:0,dur:1.0}; sfx.tetris(); },
    700,()=>{ bar.hp=.12; sfx.lineClear(); scene('glitch',.4,{}); },
    500,()=>{ for(let k=0;k<7;k++) setTimeout(()=>{ const h=hand(); toss('abtn',h.x,h.y-10,GX+10+(k%3)*12,206+(k%2)*10,0,.4,40); sfx.select(); },k*80); },
    800,()=>{ bar.hp=.02; bar.drain=bar.t; battle.flashEnemy=.6; battle.shakeEnemy=.7; sfx.lineClear(); scene('flash',.5,{a:.7}); scene('glitch',.5,{}); scene('burst',.6,{x:GX,y:GY,r:80,n:14}); bt('GAME OVER',78,26,'#ff8a8a',4,1.4); hit(E2); },
    1300,E2.result+' Roll credits. No post-credits scene.',()=>checkEnemy()); };
})();
