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
  enqueue(()=>{ setMessage(pick(['Tom mashes the A button. Strategy is for later.','Tom presses A. Then A. Then A again, with feeling.'])); fx.controller=1.5; sfx.combo(); say('tom','mash'); scene('spark',1.2,{}); for(let k=0;k<7;k++) b7Later(()=>{ const h=hand(); toss('abtn',h.x,h.y-10,GX+10+(k%3)*12,206+(k%2)*10,0,.5,40+k*4); sfx.select(); },120+k*110); },
    1250,()=>{ battle.slash=.22; sfx.bonk(); battle.shakeEnemy=.4; bt('MASH',96,34,'#ffe08a',4,.9); hit(E2); },
    700,E2.result,()=>checkEnemy()); };
Tm.starter=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom brings out the sourdough starter. Day three. Very active.'); say('tom','starter'); const h=hand(); battle.props.push({kind:'jar',x0:h.x,y0:h.y,x1:h.x,y1:h.y-8,arc:0,spin:false,t:0,dur:1.0}); },
    1000,()=>{ act(fx,.5); const h=hand(); toss('jar',h.x-20,h.y-10,GX,196,0,.65,80); sfx.whoosh(); },
    680,()=>{ sfx.splat(); sfx.bonk(); scene('goo',2.2,{}); scene('splashw',.6,{x:GX,y:200,c:'#efe3c8',c2:'#fff8e8',n:12,sp:80}); battle.shakeEnemy=.5; bt('SPLAT',96,36,'#fff1cb',3,1); hit(E2); },
    900,E2.result+' The Grump is now very bubbly.',()=>checkEnemy()); };
Tm.flashcard=E2=>{ const {fx,dmg,crit}=E2; const cards=[['猫','CAT'],['水','WATER'],['木','TREE'],['犬','DOG'],['月','MOON'],['火','FIRE']]; const per=Math.max(1,Math.floor(dmg/6)),last=Math.max(1,dmg-per*5);
  enqueue(()=>{ setMessage('Tom pulls out the flashcards. Pop quiz. No partial credit.'); say('tom','flashcard'); scene('cardfan',1.1,{}); },
    900,...cards.flatMap(([ch,mean],k)=>[k===0?100:300,()=>{ act(fx,.3); const h=hand(); toss('card',h.x-10,h.y-20,GX+(k%2?16:-10),196+(k%3)*12,0,.34,50,{ch}); sfx.whoosh(); b7Later(()=>{ battle.slash=.18; sfx.slash(); scene('meaning',.7,{text:mean,x:GX+(k%2?60:-60),y:150+(k%3)*18}); landHit(k===5?last:per,crit&&k===5); },340); }]),
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
    500,()=>{ for(let k=0;k<7;k++) b7Later(()=>{ const h=hand(); toss('abtn',h.x,h.y-10,GX+10+(k%3)*12,206+(k%2)*10,0,.4,40); sfx.select(); },k*80); },
    800,()=>{ bar.hp=.02; bar.drain=bar.t; battle.flashEnemy=.6; battle.shakeEnemy=.7; sfx.lineClear(); scene('flash',.5,{a:.7}); scene('glitch',.5,{}); scene('burst',.6,{x:GX,y:GY,r:80,n:14}); bt('GAME OVER',78,26,'#ff8a8a',4,1.4); hit(E2); },
    1300,E2.result+' Roll credits. No post-credits scene.',()=>checkEnemy()); };
})();

// ================= Option 3 Primary kit (phase 3a) =================
// Cards: adventures-of-tom-ability-revamp.md (Tom). Each move: beat 1 (setup), beat 2 (impact at about 1.05 s, inside
// the High-Five window, engine/feel.js B7_HF), beat 3 (the small joke after). Data: B2_SKILLS.tom.o3.
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const tomPos=()=>battle.actorPos||{cx:399,base:246,h:105};
const hand=()=>{ const p=tomPos(); return {x:p.cx-30,y:p.base-Math.round(p.h*.56)}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
// Where a unit stands on the canvas (kind moves can be aimed at a monster, so foes work too).
const home=u=>{ if(u.side==='foe') { const p=b2FoeCanvasPos(u); return {x:p.x,base:p.y,h:p.h}; } const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const top=()=>battle.enemyTop||150;   // the aimed enemy's head, before the warp
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const Tm=RECRUIT_MOVES.tom;
const IMPACT=550;   // ms after beat 2 starts (beat 1 is 500): the hit lands about 1.05 s in

// ---------- Props ----------
PROP2.crumb=(q,u)=>{ for(let k=0;k<4;k++) { const a=k*1.7,r=5; R(Math.cos(a)*r-2,Math.sin(a)*r-2,5,5,OUT); R(Math.cos(a)*r-1,Math.sin(a)*r-1,3,3,k%2?'#e3b47a':'#c98a4b'); } };

// ---------- Scenes ----------
// Controller Tap: one oversized square button drops onto the target and gets pressed once.
SC.bigbtn=(s,u)=>{ const y0=top()-40,drop=ez(u/.4),press=u>.55&&u<.75?6:0; gfx.globalAlpha=u>.85?(1-u)/.15:1;
  const x=GX,y=lerp(-60,y0,drop)+press;
  R(x-26,y+18-press,52,14,OUT); R(x-24,y+20-press,48,10,'#6a6f7a');
  R(x-22,y-14,44,34,OUT); R(x-20,y-12,40,30,'#e0402e'); R(x-20,y-12,40,6,'#ff8a7a'); R(x-6,y-4,12,12,'#fff8e8');
  if(press) label('CLICK',x,y-34,'#ffe08a',2); };
// Starter Inspection: Bready Mercury, in his labeled jar, held at eye level. s.ok: the check mark.
SC.mercury=(s,u)=>{ const p=hand(),x=p.x-10,y=p.y-30-ez(u/.2)*10; gfx.globalAlpha=u>.9?(1-u)/.1:env(u,.08,1);
  R(x-16,y-22,32,8,OUT); R(x-14,y-20,28,5,'#c9a03e'); R(x-16,y-14,32,40,OUT); R(x-14,y-12,28,36,'#cfe6ee'); R(x-14,y,28,24,'#efe3c8');
  for(let k=0;k<5;k++) { const b=((s.t*40+k*13)%22); E(x-9+k*4.5,y+22-b,1.8,1.8,'#fff8e8'); }
  R(x-13,y-8,26,10,'#fff8e8'); label('MERCURY',x,y-6,'#2b2a26',1);
  if(u>.72) check(x+10,y-4,5,'#3faa4a'); };
// The one indignant bubble: swells at the jar, flies to the target, pops.
SC.bubble=(s,u)=>{ const p=hand(),x0=p.x-10,y0=p.y-46,x1=GX,y1=GY-20; const g=ez(u/.35),f=ez(cl((u-.35)/.45)),r=6+g*14;
  if(u>.82) { const q=(u-.82)/.18; gfx.globalAlpha=1-q; for(let k=0;k<8;k++) { const a=k*.785; E(x1+Math.cos(a)*(18+q*26),y1+Math.sin(a)*(14+q*20),4,4,'#efe3c8'); } label('SPLAT',x1,y1-40,'#fff1cb',2); return; }
  const x=lerp(x0,x1,f),y=lerp(y0,y1,f)-Math.sin(f*Math.PI)*50; E(x,y,r+2,r+2,OUT); E(x,y,r,r,'#efe3c8'); E(x-r*.35,y-r*.35,r*.3,r*.25,'#fff8e8'); };
// DEFEND: an open stop-hand in front of the ally, then the NO TOUCHING placard by their shoes.
SC.stophand=(s,u)=>{ const sc=ez(u/.2),x=s.x,y=s.y; gfx.globalAlpha=u>.8?(1-u)/.2:1; gfx.translate(x,y); gfx.scale(sc,sc);
  R(-14,-10,28,28,OUT); R(-12,-8,24,24,'#f2c79a'); for(let k=0;k<4;k++) { R(-13+k*7,-26,7,18,OUT); R(-12+k*7,-25,5,17,'#f2c79a'); } R(12,0,10,8,OUT); R(12,2,8,4,'#f2c79a');
  if(u>.15) { gfx.globalAlpha*=.5; for(let k=0;k<3;k++) Ln(-24-k*6,-20+k*14,-30-k*6,-20+k*14,3,'#9fe8ff'); } };
SC.placard=(s,u)=>{ const d=ez(u/.25),bob=u<.25?0:Math.sin(cl((u-.25)/.15)*Math.PI)*3,x=s.x,y=s.y-14*(1-d)-bob; gfx.globalAlpha=u>.85?(1-u)/.15:d;
  R(x-2,y-6,4,18,OUT); R(x-1,y-5,2,16,'#8a5a30'); R(x-30,y-28,60,24,OUT); R(x-28,y-26,56,20,'#fff8e8'); R(x-28,y-26,56,4,'#e0402e');
  label('NO',x,y-20,'#7a1a14',1); label('TOUCHING',x,y-12,'#7a1a14',1); };
SC.sleeve=(s,u)=>{ const p=tomPos(),x=p.cx-22,y=p.base-p.h*.45; gfx.globalAlpha=env(u,.2,.6); label('*',x-4,y-u*8,'#ffe08a',2); Ln(x,y,x+10,y,2,'#fff8e8'); };
// Proofing Drawer: a low wooden drawer slides open in front of the recipient; warm glow; one-pixel dial turn.
SC.drawer=(s,u)=>{ const x=s.x,y=s.y-6,open=ez(cl((u-.05)/.25)),glow=cl((u-.3)/.2)*env(u,.3,.85); gfx.globalAlpha=u>.9?(1-u)/.1:1;
  if(glow>0) { gfx.globalAlpha*=1; R(x-30,y-s.h-10,60,s.h+10,'rgba(255,184,90,'+(.28*glow)+')'); R(x-22,y-s.h,44,s.h,'rgba(255,214,140,'+(.22*glow)+')'); }
  const puff=cl((u-.35)/.3); if(puff>0) { E(x,y-10-puff*14,16+puff*10,8+puff*6,OUT); E(x,y-10-puff*14,14+puff*10,6+puff*6,'#f6e6c4'); }
  R(x-36,y-4,72,22,OUT); R(x-34,y-2,68,18,'#8a5a30'); const fx2=x-34-open*22; R(fx2-2,y-6,40,26,OUT); R(fx2,y-4,36,22,'#b8834a'); R(fx2+12,y+4,12,4,'#5a3a1e');
  R(x-30,y-8,30*open+8,6,'#fff1cb');
  E(x+24,y+7,6,6,OUT); E(x+24,y+7,4.5,4.5,'#e8e8f0'); const a=-1+(u>.72?.12:0); Ln(x+24,y+7,x+24+Math.cos(a)*4,y+7+Math.sin(a)*4,2,'#e0402e');
  if(u>.72) label('+1',x+24,y-8,'#ffe08a',1); };
// Toast Negotiations: two toast halves by a ruler; one turns until they match; FAIR.
SC.toast=(s,u)=>{ const p=tomPos(),x=p.cx-80,y=p.base-70; gfx.translate(x,y); gfx.scale(1.4,1.4); gfx.translate(-x,-y); gfx.globalAlpha=u>.9?(1-u)/.1:env(u,.08,1);
  R(x-34,y+20,68,8,OUT); R(x-32,y+22,64,4,'#f1d58c'); for(let k=0;k<9;k++) R(x-30+k*7.5,y+22,1,k%2?2:4,OUT);
  const half=(hx,rot)=>{ gfx.save(); gfx.translate(hx,y); gfx.rotate(rot); R(-13,-15,26,30,OUT); R(-11,-13,22,26,'#c98a4b'); R(-8,-10,16,20,'#f1d9a8'); gfx.restore(); };
  half(x-16,0); half(x+16,.5*(1-ez(cl((u-.22)/.3))));
  if(u>.58) label('FAIR',x,y-30,'#9be39a',2); };
// Warranty Void: a peel-tab over the wind-up; one long film strip comes off toward Tom; the icon snaps shut.
SC.peeltab=(s,u)=>{ const x=GX,y=top()-26,p=hand(),pull=ez(cl((u-.25)/.35)),snap=cl((u-.6)/.12); gfx.globalAlpha=u>.88?(1-u)/.12:1;
  if(snap<1) { const k=1-snap; E(x,y,14*k+.1,14*k+.1,OUT); E(x,y,12*k+.1,12*k+.1,'#ffd166'); if(k>.5) label('!',x,y-4,'#7a1a14',2); }
  else label('SNAP',x,y-20,'#9be39a',2);
  const ex=lerp(x+10,p.x,pull),ey=lerp(y,p.y,pull);
  gfx.globalAlpha*=.55; Ln(x-6,y,ex,ey,14,'#dff7ff'); gfx.globalAlpha=u>.88?(1-u)/.12:1;
  R(ex-8,ey-6,16,12,OUT); R(ex-6,ey-4,12,8,'#ffe08a'); R(ex-6,ey-4,4,8,'#ff8a3a'); };
SC.film=(s,u)=>{ const p=hand(),f=ez(cl(u/.6)),w=lerp(26,8,f); gfx.globalAlpha=env(u,.1,.8); R(p.x-w/2,p.y-w/2,w,w,'rgba(223,247,255,.7)'); R(p.x-w/2,p.y-w/2,w,2,'#fff8e8'); };
// Crumb Barrier: a measured line of crumbs, an accordion crust wall bumps the row, the last panel screens one friend.
SC.crumbline=(s,u)=>{ const p=tomPos(),y=p.base-4; gfx.globalAlpha=u>.8?(1-u)/.2:1; for(let k=0;k<8;k++) { const on=u>k*.06; if(on) { R(p.cx-90+k*9,y-2,5,5,OUT); R(p.cx-89+k*9,y-1,3,3,'#c98a4b'); } } };
SC.crustwall=(s,u)=>{ const p=tomPos(),go=ez(cl(u/.55)),x=lerp(p.cx-80,GX+40,go),y=GY+30,n=1+Math.floor(go*5); gfx.globalAlpha=u>.85?(1-u)/.15:1;
  for(let k=0;k<n;k++) { const px=x-k*14,lean=k%2?-.25:.25; gfx.save(); gfx.translate(px,y); gfx.rotate(lean); R(-8,-56,16,56,OUT); R(-6,-54,12,52,'#c98a4b'); R(-4,-50,8,44,'#e3b47a'); gfx.restore(); }
  if(u>.55&&u<.75) label('STRUCTURAL',GX,top()-40,'#f3c37a',2); };
SC.crustscreen=(s,u)=>{ const x=s.x,y=s.y,f=ez(u/.3); gfx.globalAlpha=u>.85?(1-u)/.15:1;
  for(let k=0;k<3;k++) { gfx.save(); gfx.translate(x-34+k*14,y); gfx.rotate((k%2?-.25:.25)*f); R(-7,-48*f,14,48*f,OUT); R(-5,-46*f,10,44*f,'#e3b47a'); gfx.restore(); } };
// Five-Minute Review: three picture-and-glyph cards; the enemy's ? turns into a weakness mark.
SC.review=(s,u)=>{ const p=hand(); gfx.translate(p.x-18,p.y-42); gfx.scale(1.35,1.35); gfx.translate(-(p.x-18),-(p.y-42)); gfx.globalAlpha=u>.85?(1-u)/.15:env(u,.1,1); const pics=['#ffd166','#5c8fe0','#e0402e'];
  for(let k=0;k<3;k++) { const x=p.x-40+k*22,y=p.y-42-(k===1?6:0); R(x-10,y-14,20,28,OUT); R(x-8,y-12,16,24,'#fff8e8'); E(x,y-4,5,5,pics[k]); R(x-5,y+5,10,2,'#2b2a26'); R(x-2,y+8,4,2,'#2b2a26'); }
  if(u>.12&&u<.5) { R(p.x-22,p.y-6,10,4,'#f2c79a'); } };
SC.qmark=(s,u)=>{ const x=GX,y=top()-22; gfx.globalAlpha=u>.85?(1-u)/.15:env(u,.1,1); const done=u>.5;
  E(x,y,13,13,OUT); E(x,y,11,11,done?'#ffe08a':'#cfd8d6'); label(done?'!':'?',x,y-4,done?'#7a1a14':'#2b2a26',2); };
// D-Pad Detour: four chunky arrows draw a little maze under the row; the row zigzags; HERE pin on the old spot.
SC.dpadmaze=(s,u)=>{ const x=GX-60,y=GY+44; gfx.globalAlpha=u>.88?(1-u)/.12:1; const path=[[0,0],[40,0],[40,-14],[80,-14],[80,4],[120,4]];
  const draw=cl(u/.3); for(let i=1;i<path.length;i++) { const q=cl(draw*(path.length-1)-(i-1)); if(q<=0) break; const a=path[i-1],b=path[i]; LnO(x+a[0],y+a[1],x+lerp(a[0],b[0],q),y+lerp(a[1],b[1],q),5,'#9fe8ff'); }
  const ar=(ax,ay,d)=>{ gfx.save(); gfx.translate(ax,ay); gfx.rotate(d*Math.PI/2); R(-6,-9,12,18,OUT); R(-4,-7,8,14,'#ffe08a'); R(-8,-9,16,6,OUT); R(-6,-8,12,4,'#ffe08a'); gfx.restore(); };
  if(u>.05) ar(x+20,y+18,0); if(u>.12) ar(x+40,y-30,3); if(u>.19) ar(x+60,y+18,1); if(u>.26) ar(x+100,y+22,2);
  const w=cl((u-.3)/.35); if(w>0&&w<1) { const seg=w*(path.length-1),i=Math.floor(seg),q=seg-i,a=path[i],b=path[Math.min(i+1,path.length-1)]; E(x+lerp(a[0],b[0],q),y+lerp(a[1],b[1],q)-4,6,6,OUT); E(x+lerp(a[0],b[0],q),y+lerp(a[1],b[1],q)-4,4,4,'#fff8e8'); }
  if(u>.72) { R(x-1,y-26,3,22,OUT); E(x,y-28,7,7,OUT); E(x,y-28,5,5,'#e0402e'); label('HERE',x,y-46,'#fff1cb',1); } };
// Save Point Sandwich: a save crystal over the recipient unfolds into sandwich paper; SAVED.
SC.savecrystal=(s,u)=>{ const x=s.x,y=s.y-ez(u/.25)*14,unf=ez(cl((u-.3)/.2)); gfx.translate(x,y); gfx.scale(1.8,1.8); gfx.translate(-x,-y); gfx.globalAlpha=u>.88?(1-u)/.12:env(u,.08,1);
  if(unf<1) { const k=1-unf; gfx.save(); gfx.translate(x,y); gfx.rotate(s.t*2); gfx.scale(k,1); gfx.beginPath(); gfx.moveTo(0,-16); gfx.lineTo(11,0); gfx.lineTo(0,16); gfx.lineTo(-11,0); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); gfx.beginPath(); gfx.moveTo(0,-13); gfx.lineTo(8,0); gfx.lineTo(0,13); gfx.lineTo(-8,0); gfx.closePath(); gfx.fillStyle='#9fe8ff'; gfx.fill(); gfx.restore(); }
  if(unf>0) { const w=30*unf; R(x-w/2-2,y-8,w+4,22,OUT); R(x-w/2,y-6,w,18,'#eef4f8'); if(unf>.8) { const bite=u>.66; R(x-12,y-4,24,4,'#e3b47a'); R(x-12,y,24,3,'#7bbf5a'); R(x-12,y+3,24,3,'#e07a5a'); R(x-12,y+6,24,4,'#e3b47a'); if(bite) E(x+12,y+1,4,5,'#eef4f8'); } }
  if(u>.7) { label('SAVED',x,y-30,'#9fe8ff',1); check(x+22,y-28,4,'#9be39a'); } };
// Radical Solutions: three abstract study tiles above Tom slot into a glowing outline around the enemy.
SC.tiles=(s,u)=>{ const p=hand(),go=ez(cl((u-.25)/.3)),snap=u>.55; gfx.globalAlpha=u>.88?(1-u)/.12:env(u,.06,1);
  const ex=GX,ey=GY-30;
  if(u>.2) { const a=cl((u-.2)/.2); gfx.globalAlpha*=a; gfx.strokeStyle=snap?'#ffe08a':'rgba(255,224,138,.6)'; gfx.lineWidth=snap?5:3; gfx.strokeRect(ex-34,ey-34,68,68); gfx.globalAlpha=u>.88?(1-u)/.12:1; if(snap) R(ex-36,ey-36,72,72,'rgba(255,240,180,'+(.2*env(u,.55,.8))+')'); }
  const marks=[[[-6,-6,12,3],[-1,-6,3,12]],[[-6,-2,12,3],[-6,3,12,3]],[[-6,-6,3,12],[3,-6,3,12],[-6,4,12,2]]];
  for(let k=0;k<3;k++) { const sx=p.x-34+k*18,sy=p.y-60,tx=ex-20+k*20,ty=ey,x=lerp(sx,tx,go),y=lerp(sy,ty,go)-Math.sin(go*Math.PI)*40;
    gfx.save(); gfx.translate(x,y); gfx.rotate((1-go)*(s.t*3+k)); R(-10,-10,20,20,OUT); R(-8,-8,16,16,'#dff7ff'); for(const m of marks[k]) R(m[0],m[1],m[2],m[3],'#2f6fb0'); gfx.restore(); }
  if(u>.75) { const q=cl((u-.75)/.1); R(p.x-6+q,p.y-20,3,3,'#9fe8ff'); } };
// Patch Notes: a release note over the enemy side; TOUCHING: REMOVED underlined; strikeouts on the wind-ups; folded away.
SC.patchsheet=(s,u)=>{ const tp=tomPos(),fold=ez(cl((u-.75)/.2)),drop=ez(u/.22); gfx.globalAlpha=u>.95?(1-u)/.05:1;
  const w=lerp(170,16,fold),h=lerp(118,16,fold),x=lerp(170,tp.cx-10,fold),y=lerp(lerp(-120,96,drop),tp.base-tp.h*.55,fold);
  R(x-w/2-2,y-h/2-2,w+4,h+4,OUT); R(x-w/2,y-h/2,w,h,'#fff8e8');
  if(fold<.3) { R(x-w/2,y-h/2,w,14,'#1d3a8a'); label('PATCH NOTES 1.1',x,y-h/2+3,'#fff8e8',1);
    for(let k=0;k<3;k++) R(x-70,y-28+k*10,100+((k*37)%40),3,'#c9ccd4');
    label('TOUCHING: REMOVED',x,y+10,'#e0402e',1); const ul=cl((u-.25)/.2); if(ul>0) Ln(x-56,y+22,x-56+112*ul,y+22,3,'#e0402e'); }
  if(u>.42&&u<.8) for(const f of s.foes) { const c=b2FoeCanvasPos(f),cx=c.x,cy=c.y-c.h*.55,q=ez(cl((u-.42)/.08)),r=22*q;
    gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.strokeRect(cx-r,cy-r,r*2,r*2); gfx.strokeStyle='#e0402e'; gfx.lineWidth=4; gfx.strokeRect(cx-r,cy-r,r*2,r*2); Ln(cx-r,cy-r,cx+r,cy+r,4,'#e0402e'); Ln(cx+r,cy-r,cx-r,cy+r,4,'#e0402e'); } };

// ---------- Moves ----------
Tm.controller_tap=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom selects the obvious button.'); say('tom','controller_tap'); fx.controller=1.7; },
    500,()=>{ scene('bigbtn',1.1,{}); sfx.whoosh(); },
    IMPACT,()=>{ sfx.select(); sfx.bonk(); battle.slash=.18; battle.shakeEnemy=.35; hit(E2); },
    450,()=>{ bt('ROUTINE',150,40,'#9fe8ff',1,.9); },
    300,res(E2)+'One button. Entirely sufficient.',()=>checkEnemy()); };
Tm.starter_inspection=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom holds up Bready Mercury. Bready Mercury objects to the temperature.'); say('tom','starter_inspection'); scene('mercury',2.1,{}); },
    500,()=>{ scene('bubble',.75,{}); sfx.whoosh(); },
    IMPACT,()=>{ sfx.splat(); battle.shakeEnemy=.4; scene('splashw',.5,{x:GX,y:GY-10,c:'#efe3c8',c2:'#fff8e8',n:10,sp:60}); hit(E2); },
    500,()=>{ sfx.ding(); },
    300,res(E2)+'Inspection complete. Notes were taken.',()=>checkEnemy()); };
Tm.proofing_drawer=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Tom opens a low wooden drawer. A folded cloth. Perfect warmth.'); say('tom','proofing_drawer'); fx.punch=.4; scene('drawer',2.2,{x:h.x,y:h.base,h:h.h}); sfx.thud(); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); sfx.ding(); },
    500,()=>{ sfx.select(); },
    300,kindLine(t,'The warmth is carefully controlled.'),()=>checkEnemy()); };
Tm.toast_negotiations=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty());
  enqueue(()=>{ setMessage('Tom places two toast halves beside a ruler.'); say('tom','toast_negotiations'); scene('toast',2.2,{}); },
    500,()=>{ fx.punch=.5; const p=tomPos(); for(const u of who) { const h=home(u); toss('crumb',p.cx-80,p.base-70,h.x,h.base-h.h*.55,(u.idx||0)*.05,.45,40); } sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); sfx.ding(); },
    500,()=>{ for(const u of who) if(u.side==='party') battle.fx[u.idx].hop=.3; },
    300,who.some(u=>u.side==='foe')?kindLine(who.find(u=>u.side==='foe')):'Tom has measured the toast. Everyone gets an exactly fair half.',()=>checkEnemy()); };
Tm.warranty_void=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('A bright peel-tab appears on the enemy. Tom knows that tab.'); say('tom','warranty_void'); scene('peeltab',1.6,{}); },
    500,()=>{ fx.punch=.6; sfx.whoosh(); },
    IMPACT,()=>{ sfx.ding(); sfx.slash(); battle.flashEnemy=.3; battle.shakeEnemy=.4; hit(E2); },
    400,()=>{ scene('film',.9,{}); },
    400,res(E2)+'The protective film was load-bearing.',()=>checkEnemy()); };
Tm.crumb_barrier=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Tom taps a neat line of bread crumbs. They line up.'); say('tom','crumb_barrier'); scene('crumbline',1.2,{}); fx.punch=.3; },
    500,()=>{ scene('crustwall',1.1,{}); sfx.whoosh(); },
    IMPACT,()=>{ sfx.thud(); battle.shakeEnemy=.6; scene('dust',.6,{x:GX,y:GY+30,n:8,sp:22,up:14}); hit(E2); },
    300,()=>{ E2.apply(); const g=B2.party.find(p=>p.st.brace&&p.st.brace.by===E2.m)||b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(g) { const h=home(g); scene('crustscreen',1.2,{x:h.x,y:h.base}); } sfx.select(); },
    500,res(E2)+'Bread meets the building code.',()=>checkEnemy()); };
Tm.five_minute_review=E2=>{ const {fx}=E2,t=E2.targets[0];
  enqueue(()=>{ setMessage('Tom opens three flashcards. Five minutes. Picture side first.'); say('tom','five_minute_review'); scene('review',1.8,{}); fx.punch=.3; },
    500,()=>{ scene('qmark',1.3,{}); battle.enemyWobble=.6; sfx.select(); },
    IMPACT,()=>{ E2.apply(); sfx.ding(); },
    500,()=>{ fx.hop=.2; },
    300,'The enemy considers the vocabulary. It looks pleased with its effort.',()=>checkEnemy()); };
Tm.dpad_detour=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Four chunky arrows draw a maze under them.'); say('tom','dpad_detour'); scene('dpadmaze',1.9,{}); fx.controller=1.6; },
    500,()=>{ battle.enemyWobble=.6; sfx.select(); b7Later(()=>sfx.select(),150); b7Later(()=>sfx.select(),300); },
    IMPACT,()=>{ sfx.bonk(); battle.shakeEnemy=.45; hit(E2); },
    500,()=>{ sfx.ding(); },
    300,res(E2)+'The route has become needlessly complicated.',()=>checkEnemy()); };
Tm.save_sandwich=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('A tiny save crystal rises.'); say('tom','save_sandwich'); scene('savecrystal',2.1,{x:h.x,y:h.base-h.h-34}); sfx.levelChime(); },
    500,()=>{ fx.punch=.4; sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); },
    500,()=>{ sfx.ding(); },
    300,kindLine(t,'Progress saved. Lunch secured.'),()=>checkEnemy()); };
Tm.radical_solutions=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Three study tiles turn over above Tom.'); say('tom','radical_solutions'); scene('tiles',1.9,{}); fx.punch=.4; },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ sfx.ding(); battle.flashEnemy=.35; battle.shakeEnemy=.4; scene('glow',.6,{x:GX,y:GY-30,c:'#ffe08a',a:.4}); hit(E2); },
    500,()=>{ sfx.select(); },
    300,res(E2)+'The pieces finally line up.',()=>checkEnemy()); };
Tm.patch_notes=E2=>{ const {fx}=E2;
  if(typeof B2_NOWARP!=='undefined') B2_NOWARP.add('patchsheet');
  enqueue(()=>{ setMessage('A PATCH NOTES sheet descends over the enemies.'); say('tom','patch_notes'); scene('patchsheet',2.3,{foes:b2LiveFoes()}); },
    500,()=>{ fx.punch=.6; sfx.select(); },
    IMPACT,()=>{ sfx.stun(); sfx.ding(); battle.flashEnemy=.35; battle.shakeEnemy=.5; hit(E2); },
    600,()=>{ sfx.whoosh(); },
    300,res(E2)+'The update addresses a known issue.',()=>checkEnemy()); };
// DEFEND (Primary): the same resolver (engine/battle2.js b2DefendSteps), new beats around it.
Tm.defendShow=(u,t,resolve)=>{ const fx=battle.fx[u.idx],h=home(t),self=t===u;
  return [()=>{ b2Msg('Tom notices the lock-on. He straightens one sleeve.'); scene('sleeve',.5,{}); },
    400,()=>{ fx.punch=.8; resolve(); scene('stophand',1.1,{x:h.x-(self?44:36),y:h.base-h.h*.6}); },
    700,()=>{ scene('placard',1.5,{x:h.x-(self?-28:30),y:h.base}); sfx.select(); },
    600];
};
})();

// ================= Option 3 set pieces (animation quality pass, 2026-10-24) =================
// Replaces the phase-3a animations above (1.6 s beats from his stance) with 3.5 to 5 s set pieces on engine/stage.js,
// the standard TNB's and Nara's moves use. Tom is calm and deliberate: he walks over, does one precise thing with a
// big result, tidies up, walks home. Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact.
// Scenes are real coordinates, prefix tm_. DEFEND returns steps around the shared resolver (engine/battle2.js).
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
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const Tm=RECRUIT_MOVES.tom;
const GOLD='#ffe08a',CREAM='#fff8e8',RED='#e0402e',SKY='#9fe8ff',CRUST='#c98a4b',CRUMB='#e3b47a',WOOD='#8a5a30',GREEN='#9be39a';
ST.nw('tm_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(314,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:u.base+3}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tom,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.86+dy});
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const back=(x,me)=>x<me.x?'walkR':'walk';   // the walk frame for heading home from x

// ---------- Shared scenes ----------
SC.tm_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.tm_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||38,s.ry||52,s.c||GOLD); };
SC.tm_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.tm_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.tm_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CREAM); } };
const pad=(x,y,sc=1,press=0)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); RO(-14,-7,28,14,'#6a6f7a'); R(-10,-2,6,2,OUT); R(-8,-4,2,6,OUT); E(7,-1,2.4,2.4,press?GOLD:RED); E(11,-4,2,2,SKY); gfx.restore(); };

// ---------- Controller Tap ----------
SC.tm_pad=(s,u)=>{ const ms=s.t*1000,h=hand(); gfx.globalAlpha=fade(u,.94); pad(h.x-4,h.y-6,1,ms>s.press&&ms<s.press+200); };
SC.tm_bigbtn=(s,u)=>{ const ms=s.t*1000,drop=ez(ms/450),press=ms>s.press&&ms<s.press+260?7:0,x=s.x,y=lerp(-60,s.y,drop)+press; gfx.globalAlpha=fade(u,.85);
  R(x-26,y+18-press,52,14,OUT); R(x-24,y+20-press,48,10,'#6a6f7a'); R(x-22,y-14,44,34,OUT); R(x-20,y-12,40,30,RED); R(x-20,y-12,40,6,'#ff8a7a'); R(x-6,y-4,12,12,CREAM);
  if(press) label('CLICK',x,y-34,GOLD,2); };
Tm.controller_tap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,40),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:1100,x:p.x,y:p.y,f:'idle'},{t:1150,f:'expr'},{t:1850,f:'act',dx:-4},{t:2350,f:'idle',rot:(u,tt)=>Math.sin(tt*6)*.03},{t:2950,f:back(p.x,me)},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom walks over and takes out a tiny controller.'); say(m.id,'controller_tap'); scene('tm_pad',3.0,{press:1850}); }],
    [1150,()=>{ scene('tm_text',.9,{st,txt:'...',sc:2}); setMessage('He studies it. Perfectly still. Tom selects the obvious button.'); }],
    [1400,()=>{ scene('tm_bigbtn',1.4,{x:F.x,y:F.top-30,press:450}); sfx.whoosh(); }],
    ['hf',1850],
    [1850,()=>{ sfx.select(); sfx.bonk(); ST.jolt(f,.35); landHit(100); }],
    [2400,()=>{ scene('tm_text',1,{st,txt:'ROUTINE',c:SKY}); }],
    [4000,'end',res(E2)+'One button. Entirely sufficient.']]); };

// ---------- DEFEND ----------
SC.tm_stophand=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const sc=ez(u/.15),x=st.x-TSP().idle[0].length*TSP().scale*.5-14,y=st.y-TH()*.62; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  R(-14,-10,28,28,OUT); R(-12,-8,24,24,'#f2c79a'); for(let k=0;k<4;k++) { R(-13+k*7,-26,7,18,OUT); R(-12+k*7,-25,5,17,'#f2c79a'); } R(12,0,10,8,OUT); R(12,2,8,4,'#f2c79a');
  if(u>.15) { gfx.globalAlpha*=.5; for(let k=0;k<3;k++) Ln(-24-k*6,-20+k*14,-30-k*6,-20+k*14,3,SKY); } gfx.restore(); };
SC.tm_placard=(s,u)=>{ const d=ez(u/.2),bob=u<.2?0:Math.sin(cl((u-.2)/.12)*Math.PI)*3,x=s.x,y=s.y-14*(1-d)-bob; gfx.globalAlpha=fade(u,.85)*d;
  R(x-2,y-6,4,18,OUT); R(x-1,y-5,2,16,WOOD); R(x-30,y-28,60,24,OUT); R(x-28,y-26,56,20,CREAM); R(x-28,y-26,56,4,RED); label('NO',x,y-20,'#7a1a14',1); label('TOUCHING',x,y-12,'#7a1a14',1); };
SC.tm_sleeve=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const x=st.x-18,y=st.y-TH()*.5; gfx.globalAlpha=fade(u,.5); label('*',x-4,y-u*10,GOLD,2); Ln(x,y,x+12,y,2,CREAM); };
Tm.defendShow=(u,t,resolve)=>{ const fx=battle.fx[u.idx],self=t===u,H=ST.unit(t),me=ST.unit(u);
  const spot=self?{x:me.x,y:me.base}:{x:H.x-H.w*.5-26,y:Math.min(314,H.base+4)};
  let st=null;
  return [()=>{ b2Msg(self?'Tom notices the lock-on. He straightens one sleeve.':'Tom notices the lock-on on '+t.name+'. He straightens one sleeve.');
      st=ST.keys(fx,self?[{t:0,x:'home',y:'home',f:'expr'},{t:600,f:'idle',rot:(q,tt)=>Math.sin(q*Math.PI*2)*.04},{t:900,f:'act',dx:-6},{t:2300,f:'act'},{t:2700,x:'home',y:'home',f:'idle'}]
        :[{t:0,x:'home',y:'home',f:'expr'},{t:600,f:spot.x<me.x?'run':'runR'},{t:1100,x:spot.x,y:spot.y,f:'act',dx:u2=>-ez(u2/.3)*6},{t:2300,f:'act',dx:-6},{t:2550,f:spot.x<me.x?'walkR':'walk'},{t:3300,x:'home',y:'home',f:'idle'}]);
      scene('tm_sleeve',.6,{st}); sfx.select(); },
    self?900:1100,()=>{ resolve(); scene('tm_stophand',1.3,{st}); },
    450,()=>{ scene('tm_placard',1.6,{x:(st&&st.x!=null?st.x:spot.x)+(self?-60:-34),y:spot.y}); sfx.select(); },
    self?1300:1700];
};

// ---------- Starter Inspection ----------
const jar=(x,y,sc,ok,bub)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); R(-16,-22,32,8,OUT); R(-14,-20,28,5,'#c9a03e'); R(-16,-14,32,40,OUT); R(-14,-12,28,36,'#cfe6ee'); R(-14,0,28,24,'#efe3c8');
  for(let k=0;k<5;k++) { const b=((performance.now()/25+k*13)%22); E(-9+k*4.5,22-b,1.8,1.8,CREAM); } R(-13,-8,26,10,CREAM); label('MERCURY',0,-6,'#2b2a26',1); if(ok) check(10,-4,5,'#3faa4a');
  if(bub>0) { const r=4+bub*14; E(0,-24-r,r+2,r+2,OUT); E(0,-24-r,r,r,'#efe3c8'); E(-r*.35,-24-r*1.35,r*.3,r*.25,CREAM); } gfx.restore(); };
SC.tm_jar=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),raise=ez((ms-P.raise)/400)*(ms>P.lower?1-ez((ms-P.lower)/300):1),bub=ms>P.swell&&ms<P.fire?ez((ms-P.swell)/(P.fire-P.swell)):0;
  gfx.globalAlpha=fade(u,.95); jar(h.x-12,h.y-8-raise*34,.9,ms>P.ok,bub); };
Tm.starter_inspection=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),p={x:Math.min(520,F.x+F.w*.5+120),y:Math.min(314,F.base+6)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:1000,x:p.x,y:p.y,f:'idle'},{t:1050,f:'expr'},{t:1700,f:'expr',dx:u=>-Math.sin(u*Math.PI)*6},{t:2200,f:'expr'},{t:2650,f:'act'},{t:3150,f:'idle'},{t:3400,f:back(p.x,me)},{t:4300,x:'home',y:'home',f:'idle'}]);
  const plan={raise:1050,swell:1700,fire:2200,ok:2900,lower:3150};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom carries Bready Mercury out for an inspection.'); say(m.id,'starter_inspection'); scene('tm_jar',4.3,{plan}); }],
    [1050,()=>{ setMessage('He lifts the jar to eye level. Bready Mercury objects to the temperature.'); }],
    [1700,()=>{ sfx.charge(); }],
    [2200,()=>{ const h=hand(); sfx.whoosh(); ST.fly((x,y,uu)=>{ const r=18; E(x,y,r+2,r+2,OUT); E(x,y,r,r,'#efe3c8'); E(x-6,y-6,5,4,CREAM); },h.x-12,h.y-80,F.x,F.mid,.4,50); }],
    ['hf',2600],
    [2600,()=>{ sfx.splat(); ST.jolt(f,.45); landHit(100); scene('tm_poof',.6,{x:F.x,y:F.mid,c:'#efe3c8',n:10,r:34}); scene('tm_text',.9,{x:F.x+62,y:F.top-10,txt:'SPLAT',c:CREAM}); }],
    [2900,()=>{ sfx.ding(); scene('tm_text',.9,{st,txt:'NOTED',c:GREEN}); }],
    [4400,'end',res(E2)+'Inspection complete. Notes were taken.']]); };

// ---------- Proofing Drawer ----------
SC.tm_drawer=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,carry=ms<P.set||ms>P.lift;
  if(carry) { const h=hand(); x=h.x-8; y=h.y+4; } else { x=P.x; y=P.y; }
  const open=carry?0:ez((ms-P.open)/350)*(ms>P.close?1-ez((ms-P.close)/250):1),glow=carry?0:cl((ms-P.open-200)/300)*(ms>P.close?1-cl((ms-P.close)/250):1); gfx.globalAlpha=1;
  gfx.save(); gfx.translate(x,y); const sc=carry?.6:1; gfx.scale(sc,sc);
  if(glow>0) { R(-30,-P.h-10,60,P.h+6,'rgba(255,184,90,'+(.28*glow)+')'); }
  const puff=ms>P.open+250&&!carry?cl((ms-P.open-250)/400)*glow:0; if(puff>0) { E(0,-14-puff*14,16+puff*10,8+puff*6,OUT); E(0,-14-puff*14,14+puff*10,6+puff*6,'#f6e6c4'); }
  R(-36,-8,72,22,OUT); R(-34,-6,68,18,WOOD); const fx2=-34-open*22; R(fx2-2,-10,40,26,OUT); R(fx2,-8,36,22,'#b8834a'); R(fx2+12,0,12,4,'#5a3a1e'); if(open>.3) R(-30,-12,30*open+8,6,'#fff1cb');
  E(24,3,6,6,OUT); E(24,3,4.5,4.5,'#e8e8f0'); const a=-1+(ms>P.dial?.12:0); Ln(24,3,24+Math.cos(a)*4,3+Math.sin(a)*4,2,RED); gfx.restore();
  if(!carry&&ms>P.dial&&ms<P.dial+700) label('+1',x+24,y-14,GOLD,2); };
Tm.proofing_drawer=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,52),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'kneel'},{t:1700,f:'act'},{t:2200,f:'kneel'},{t:2700,f:'act',dx:-4},{t:3000,f:'idle'},{t:3400,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk'},{t:1100,x:sp.x,y:sp.y,f:'kneel'},{t:1700,f:'act',dx:-6},{t:2200,f:'kneel'},{t:2700,f:'act',dx:-4},{t:3000,f:'idle'},{t:3300,f:back(sp.x,me)},{t:4300,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const set=self?500:1100,plan={set,open:1700,close:3000,lift:3250,dial:2700,x:self?sp.x-58:H.x+H.w*.5+4,y:(self?sp.y:H.base)-2,h:H.h},end=self?3500:4400;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Tom sets down a low wooden proofing drawer.':'Tom carries a low wooden proofing drawer over to '+t.name+'.'); say(m.id,'proofing_drawer'); scene('tm_drawer',end/1000,{plan}); }],
    [set,()=>{ sfx.thud(); }],
    [1700,()=>{ setMessage('A folded cloth. Perfect warmth.'); sfx.whoosh(); }],
    ['hf',2150],
    [2150,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('tm_glow',.9,{x:H.x,y:H.mid,c:'#ffb870'}); hopOf(t!==m?t:null); }],
    [2700,()=>{ sfx.select(); setMessage('He adjusts the dial by one pixel.'); }],
    [end,'end',kindLine(t,'The warmth is carefully controlled.')]]); };

// ---------- Toast Negotiations ----------
SC.tm_toast=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y; gfx.globalAlpha=fin(u,.06)*fade(u,.92);
  R(x-34,y+10,68,8,OUT); R(x-32,y+12,64,4,'#f1d58c'); for(let k=0;k<9;k++) R(x-30+k*7.5,y+12,1,k%2?2:4,OUT);
  const half=(hx,rot)=>{ gfx.save(); gfx.translate(hx,y-4); gfx.rotate(rot); R(-11,-13,22,26,OUT); R(-9,-11,18,22,CRUST); R(-6,-8,12,16,'#f1d9a8'); gfx.restore(); };
  const tries=cl((ms-P.turn0)/(P.fair-P.turn0)),rot=.55*(1-tries)+Math.sin(tries*Math.PI*3)*.15*(1-tries);
  if(ms<P.toss) { half(x-14,0); half(x+14,ms<P.turn0?.55:rot); }
  if(ms>P.fair&&ms<P.toss+400) label('FAIR',x,y-34,GREEN,2); };
Tm.toast_negotiations=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m),dee=B2.party.find(p=>p.id==='deedee'&&b2Alive(p));
  const px=foe?front(U[0],70).x:Math.round(U.reduce((a,q)=>a+q.x,0)/U.length)-40,py=foe?front(U[0],70).y:Math.min(312,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+20);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:px<me.x?'walk':'walkR'},{t:900,x:px,y:py,f:'kneel'},{t:1000,f:'kneel',dx:(u,tt)=>u<.8?Math.sin(tt*8)*1.5:0},{t:2100,f:'idle'},{t:2250,f:(u,tt)=>Math.floor(u*4)%2?'act':'idle'},{t:2950,f:'idle'},{t:3250,f:px<me.x?'walkR':'walk'},{t:4100,x:'home',y:'home',f:'idle'}]);
  const tx=px-58,ty=py-20,plan={x:tx,y:ty,turn0:1150,fair:1950,toss:2250};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom kneels and lays two toast halves beside a ruler.'); say(m.id,'toast_negotiations'); scene('tm_toast',3.0,{plan}); }],
    [1150,()=>{ setMessage('He rotates one half. Then again. Until the silhouettes match EXACTLY.'); for(let k=0;k<3;k++) b7Later(()=>sfx.select(),k*260); }],
    [2250,()=>{ who.forEach((u,k)=>{ const q=ST.unit(u); ST.fly((x,y,uu)=>{ gfx.rotate(uu*6); R(-9,-10,18,20,OUT); R(-7,-8,14,16,CRUST); R(-4,-5,8,10,'#f1d9a8'); },tx,ty-6,q.x,q.mid,.4,50,k*.12); }); sfx.whoosh(); }],
    ['hf',2650],
    [2650,()=>{ E2.apply(); sfx.ding(); sfx.heal(); for(const u of who) { const q=ST.unit(u); scene('tm_glow',.8,{x:q.x,y:q.mid,c:'#ffd27a',rx:30,ry:40}); hopOf(u!==m?u:null); } }],
    ...(dee&&!foe?[[2900,()=>{ const q=ST.unit(dee); scene('tm_text',.9,{x:q.x,y:q.top-16,txt:'WARM CRUST',c:'#f3c37a',sc:1}); }]]:[]),
    [4200,'end',foe?kindLine(foe):'Tom has measured the toast. Everyone gets an exactly fair half.']]); };

// ---------- Warranty Void ----------
SC.tm_peel=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),x=P.x,y=P.y; gfx.globalAlpha=fade(u,.94);
  if(ms<P.snap) { const k=1; E(x,y,14*k,14*k,OUT); E(x,y,12*k,12*k,'#ffd166'); label('!',x,y-4,'#7a1a14',2); }
  else if(ms<P.snap+600) label('SNAP',x,y-20,GREEN,2);
  if(ms<P.grab) { RO(x+10,y-6,16,12,GOLD); R(x+10,y-6,5,12,'#ff8a3a'); return; }
  if(ms<P.fold) { const ex=h.x,ey=h.y; gfx.globalAlpha*=.55; Ln(x-6,y,ex,ey,14,'#dff7ff'); gfx.globalAlpha=fade(u,.94); RO(ex-8,ey-6,16,12,GOLD); R(ex-8,ey-6,5,12,'#ff8a3a'); if(ms<P.snap) label('PEEL',(x+ex)/2,(y+ey)/2-16,CREAM,1); return; }
  const f=ez((ms-P.fold)/600),w=lerp(26,8,f); R(h.x-w/2,h.y-w/2,w,w,'rgba(223,247,255,.75)'); R(h.x-w/2,h.y-w/2,w,2,CREAM); if(f>.95) label('FOLDED',h.x,h.y-24,SKY,1); };
Tm.warranty_void=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,34),me=ST.unit(m),pull=Math.min(540,p.x+80);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:1000,x:p.x,y:p.y,f:'idle'},{t:1050,f:'expr'},{t:1400,f:'act',dx:u=>-ez(u)*8},{t:1550,x:p.x,f:'act',dx:-8},{t:2300,x:pull,f:'act'},{t:2400,f:'act',dx:u=>Math.sin(u*Math.PI)*8},
    {t:2900,f:'kneel',dx:(u,tt)=>u<.8?Math.sin(tt*10)*1.2:0},{t:3500,f:'idle'},{t:3650,f:back(pull,me)},{t:4400,x:'home',y:'home',f:'idle'}]);
  const plan={x:F.x+F.w*.3,y:F.top-14,grab:1500,snap:2350,fold:2900};
  ST.play(E2,[
    [0,()=>{ setMessage('A bright peel-tab appears on '+f.name+'. Tom knows that tab.'); say(m.id,'warranty_void'); scene('tm_peel',4.3,{plan}); }],
    [1500,()=>{ sfx.select(); setMessage('He pinches it. He backs away slowly. A very long strip of film.'); }],
    [1600,()=>{ sfx.whoosh(); }],
    ['hf',2350],
    [2350,()=>{ sfx.ding(); sfx.slash&&sfx.slash(); ST.jolt(f,.45); landHit(100); }],
    [2900,()=>{ setMessage('He folds the film neatly instead of dropping it.'); }],
    [4500,'end',res(E2)+'The protective film was load-bearing.']]); };

// ---------- Crumb Barrier ----------
SC.tm_crumbs=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; (s.drop=s.drop||[]); if(ms>P.d0&&ms<P.d1&&st&&st.x!=null&&(!s.last||Math.abs(s.last-st.x)>9)) { s.drop.push(st.x-6); s.last=st.x; }
  if(ms>P.rise) return; gfx.globalAlpha=fade(u,.95); for(const x of s.drop) { R(x-1,P.y-3,6,6,OUT); R(x,P.y-2,4,4,CRUST); } };
SC.tm_wall=(s,u)=>{ const ms=s.t*1000,P=s.plan,go=ez((ms-P.rise)/500); if(ms<P.rise) return; const n=P.n; gfx.globalAlpha=fade(u,.86);
  for(let k=0;k<n;k++) { const px=lerp(P.x1,P.x0,k/(n-1)),lean=k%2?-.25:.25,h=56*go,push=ms>P.hit-150&&ms<P.hit+200?Math.sin(cl((ms-P.hit+150)/350)*Math.PI)*-10:0;
    gfx.save(); gfx.translate(px,P.y+push*0); gfx.rotate(lean*go); R(-8,-h,16,h,OUT); R(-6,-h+2,12,h-4,CRUST); R(-4,-h+6,8,Math.max(0,h-12),CRUMB); gfx.restore(); }
  if(ms>P.hit&&ms<P.hit+700) label('STRUCTURAL',(P.x0+P.x1)/2,P.y-80,'#f3c37a',2); };
SC.tm_screen=(s,u)=>{ const f=ez(u/.3); gfx.globalAlpha=fade(u,.85); for(let k=0;k<3;k++) { gfx.save(); gfx.translate(s.x-34+k*14,s.y); gfx.rotate((k%2?-.25:.25)*f); R(-7,-48*f,14,48*f,OUT); R(-5,-46*f,10,44*f,CRUMB); gfx.restore(); } if(u>.3) label('90 DEGREES',s.x-20,s.y-64,'#f3c37a',1); };
Tm.crumb_barrier=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),y=Math.min(312,Gp.base+16),x1=Math.min(540,Gp.x1+30),x0=Math.max(30,Gp.x0-10);
  const L=lowest(),LU=L?ST.unit(L):null,selfL=L===m;
  const K=[{t:0,x:'home',y:'home',f:'walk'},{t:800,x:x1+20,y:y+4,f:'walk'},{t:1800,x:x0+10,y:y+4,f:'kneel'},{t:2050,f:'act',dx:-4},{t:2200,f:'idle'},{t:2800,f:'walkR'}];
  if(LU&&!selfL) K.push({t:3600,x:Math.min(556,LU.x+LU.w*.5+26),y:LU.base+3,f:'kneel'},{t:3950,f:'idle'},{t:4100,f:back(LU.x+LU.w*.5+26,me)},{t:4600,x:'home',y:'home',f:'idle'});
  else K.push({t:3600,x:'home',y:'home',f:'kneel'},{t:3950,f:'idle'});
  const st=ST.keys(fx,K),plan={d0:800,d1:1800,y,rise:2050,hit:2400,x0,x1,n:Math.max(4,Math.round((x1-x0)/20))};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom walks the line in front of them, dropping a neat row of bread crumbs.'); say(m.id,'crumb_barrier'); scene('tm_crumbs',2.2,{st,plan}); scene('tm_wall',3.3,{plan}); }],
    [1800,()=>{ setMessage('He taps the last crumb with a measuring finger.'); sfx.select(); }],
    [2050,()=>{ sfx.whoosh(); }],
    ['hf',2400],
    [2400,()=>{ sfx.thud(); all(list); landHit(100); }],
    [2700,()=>{ E2.apply(); }],
    [3600,()=>{ if(LU) { scene('tm_screen',1.4,{x:selfL?me.x:LU.x,y:LU.base}); sfx.select(); } }],
    [selfL||!LU?4100:4700,'end',res(E2)+'Bread meets the building code.']]); };

// ---------- Five-Minute Review ----------
SC.tm_cards=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),k=Math.max(0,Math.min(2,Math.floor((ms-P.c0)/P.step))),pics=['#ffd166','#5c8fe0',RED]; gfx.globalAlpha=fade(u,.9);
  const x=h.x-12,y=h.y-26; gfx.save(); gfx.translate(x,y); gfx.scale(1.4,1.4); RO(-10,-14,20,28,CREAM); E(0,-4,5,5,pics[k]); R(-5,5,10,2,'#2b2a26'); R(-2,8,4,2,'#2b2a26'); gfx.restore();
  if(ms>P.c0) label(['DOG','SUN','HOT'][k],x,y-30,CREAM,1); };
SC.tm_q=(s,u)=>{ const ms=s.t*1000,done=ms>s.flip,x=s.x,y=s.y; gfx.globalAlpha=fade(u,.85); E(x,y,13,13,OUT); E(x,y,11,11,done?GOLD:'#cfd8d6'); label(done?'!':'?',x,y-4,done?'#7a1a14':'#2b2a26',2); if(done&&ms<s.flip+700) label('WEAK SPOT',x,y-28,GOLD,1); };
Tm.five_minute_review=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),p=front(F,38),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:1000,x:p.x,y:p.y,f:'kneel'},{t:1100,f:'kneel'},{t:2600,f:'kneel',rot:u=>Math.sin(u*Math.PI*2)*.05},{t:3000,f:'idle'},{t:3200,f:back(p.x,me)},{t:4100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom sits down next to '+t.name+' with three flashcards. Five minutes.'); say(m.id,'five_minute_review'); scene('tm_cards',2.0,{plan:{c0:1150,step:350}}); scene('tm_q',2.6,{x:F.x,y:F.top-22,flip:1100}); }],
    [1150,()=>{ sfx.select(); b7Later(()=>sfx.select(),350); b7Later(()=>sfx.select(),700); ST.jolt(t,.12); }],
    [1700,()=>{ setMessage('The enemy leans toward the answer side. Picture first.'); }],
    ['hf',2250],
    [2250,()=>{ E2.apply(); sfx.ding(); ST.jolt(t,.15); }],
    [2600,()=>{ scene('tm_text',.9,{st,txt:'GOOD',c:GREEN}); }],
    [4200,'end','The enemy considers the vocabulary. It looks pleased with its effort.']]); };

// ---------- D-Pad Detour ----------
SC.tm_maze=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y,path=[[0,0],[40,0],[40,-14],[80,-14],[80,4],[P.w,4]],draw=ez(ms/400); gfx.globalAlpha=fade(u,.9);
  for(let i=1;i<path.length;i++) { const q=cl(draw*(path.length-1)-(i-1)); if(q<=0) break; const a=path[i-1],b=path[i]; LnO(x+a[0],y+a[1],x+lerp(a[0],b[0],q),y+lerp(a[1],b[1],q),5,SKY); }
  const w=cl((ms-P.go)/(P.hit-P.go)); if(w>0&&w<1) { const seg=w*(path.length-1),i=Math.floor(seg),q=seg-i,a=path[i],b=path[Math.min(i+1,path.length-1)]; EO(x+lerp(a[0],b[0],q),y+lerp(a[1],b[1],q)-4,5,5,CREAM); }
  if(ms>P.hit) { R(x+P.w+2,y-12,6,20,OUT); R(x+P.w+3,y-11,4,18,RED); } if(ms>P.pin) { R(x-1,y-26,3,22,OUT); EO(x,y-28,5,5,RED); label('HERE',x,y-46,'#fff1cb',2); } };
SC.tm_bigpad=(s,u)=>{ const ms=s.t*1000,h=hand(),pr=Math.floor((ms-s.p0)/s.step); gfx.globalAlpha=fade(u,.94); pad(h.x-4,h.y-14,1.6,pr>=0&&pr<s.n&&((ms-s.p0)%s.step)<120); };
Tm.dpad_detour=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,96),step=260,n=4,mx=Math.max(26,Gp.x0-30),my=Math.min(312,Gp.base+12);
  const K=[{t:0,x:'home',y:'home',f:'walk'},{t:900,x:p.x,y:p.y,f:'expr'}];
  for(let k=0;k<n;k++) K.push({t:1000+k*step,f:k%2?'act':'expr',dx:[0,-10,8,-6][k]});
  K.push({t:1000+n*step,f:'expr'},{t:2300,f:'walk'},{t:3000,x:mx+18,y:my+2,f:'kneel'},{t:3300,f:'idle'},{t:3450,f:'walkR'},{t:4500,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=1000+n*step+200,plan={x:mx,y:my,w:Math.max(120,Gp.x1-mx+20),go:1000,hit,pin:3000};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom walks out with his controller. Four chunky arrows draw a maze under them.'); say(m.id,'dpad_detour'); scene('tm_maze',4.4,{plan}); scene('tm_bigpad',2.4,{p0:1000,step,n}); }],
    ...[0,1,2,3].map(k=>[1000+k*step,()=>{ sfx.select(); for(const f of list) ST.jolt(f,.15); }]),
    [1100,()=>{ setMessage('Right. Up. Right. Down. The scenic route.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); all(list); landHit(100); scene('tm_text',.9,{x:Gp.x,y:Gp.top-30,txt:'DEAD END',c:SKY}); }],
    [3000,()=>{ sfx.select(); setMessage('He plants a little pin where they started. HERE.'); }],
    [4600,'end',res(E2)+'The route has become needlessly complicated.']]); };

// ---------- Save Point Sandwich ----------
SC.tm_save=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.x,y=P.y-ez(ms/400)*14; const held=ms>P.grab&&ms<P.give,unf=ez((ms-P.unf)/350);
  if(held||ms>=P.give) { const h=hand(); x=held?h.x-10:lerp(h.x-10,P.tx,ez((ms-P.give)/250)); y=held?h.y-12:lerp(h.y-12,P.ty,ez((ms-P.give)/250)); }
  gfx.globalAlpha=fade(u,.92); gfx.save(); gfx.translate(x,y); gfx.scale(1.6,1.6);
  if(unf<1) { const k=1-unf; gfx.save(); gfx.rotate(s.t*2); gfx.scale(k,1); gfx.beginPath(); gfx.moveTo(0,-16); gfx.lineTo(11,0); gfx.lineTo(0,16); gfx.lineTo(-11,0); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); gfx.beginPath(); gfx.moveTo(0,-13); gfx.lineTo(8,0); gfx.lineTo(0,13); gfx.lineTo(-8,0); gfx.closePath(); gfx.fillStyle=SKY; gfx.fill(); gfx.restore(); }
  if(unf>0) { const w=30*unf; R(-w/2-2,-8,w+4,22,OUT); R(-w/2,-6,w,18,'#eef4f8'); if(unf>.8) { const bite=ms>P.bite; R(-12,-4,24,4,CRUMB); R(-12,0,24,3,'#7bbf5a'); R(-12,3,24,3,'#e07a5a'); R(-12,6,24,4,CRUMB); if(bite) E(12,1,4,5,'#eef4f8'); } }
  gfx.restore(); if(ms>P.bite) { label('SAVED',x,y-34,SKY,2); check(x+34,y-34,4,GREEN); } };
Tm.save_sandwich=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'expr'},{t:900,f:'celeb',hop:16},{t:1200,f:'expr'},{t:1800,f:'act',dx:-6},{t:2300,f:'idle'},{t:3000,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk'},{t:1000,x:sp.x,y:sp.y,f:'idle'},{t:1050,f:'celeb',hop:16},{t:1300,f:'expr'},{t:1850,f:'act',dx:u=>-ez(u)*10},{t:2350,f:'act',dx:-10},{t:2800,f:'idle'},{t:3000,f:back(sp.x,me)},{t:4000,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={x:H.x+(self?-30:0),y:H.top-30,grab:self?1000:1150,unf:1350,give:1850,bite:2250,tx:H.x-4,ty:H.mid-6},end=self?3100:4100;
  ST.play(E2,[
    [0,()=>{ setMessage('A tiny save crystal rises over '+(self?'Tom':t.name)+'. Tom walks over.'); say(m.id,'save_sandwich'); scene('tm_save',(end-300)/1000,{plan}); sfx.levelChime(); }],
    [plan.grab,()=>{ sfx.select(); setMessage('He unfolds it. It was sandwich paper all along. Thick homemade bread.'); }],
    [1850,()=>{ sfx.whoosh(); }],
    ['hf',2250],
    [2250,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('tm_glow',.9,{x:H.x,y:H.mid,c:SKY}); hopOf(t!==m?t:null); }],
    [end,'end',kindLine(t,'Progress saved. Lunch secured.')]]); };

// ---------- Radical Solutions ----------
const marks=[[[-6,-6,12,3],[-1,-6,3,12]],[[-6,-2,12,3],[-6,3,12,3]],[[-6,-6,3,12],[3,-6,3,12],[-6,4,12,2]]];
const tile=(x,y,k,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-10,-10,20,20,'#dff7ff'); for(const q of marks[k]) R(q[0],q[1],q[2],q[3],'#2f6fb0'); gfx.restore(); };
SC.tm_tiles=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; if(!st||st.x==null) return; const hd=head(st,-30); gfx.globalAlpha=fade(u,.94);
  for(let k=0;k<3;k++) { const sent=P.send[k]; if(ms>sent) { const q=ez((ms-sent)/300),tx=P.tx-20+k*20; const sx=hd.x+Math.cos(s.t*2+k*2.1)*30,sy=hd.y+Math.sin(s.t*2+k*2.1)*10; if(q<1) tile(lerp(sx,tx,q),lerp(sy,P.ty,q)-Math.sin(q*Math.PI)*30,k,(1-q)*3); else tile(tx,P.ty,k); continue; }
    tile(hd.x+Math.cos(s.t*2+k*2.1)*30,hd.y+Math.sin(s.t*2+k*2.1)*10,k,s.t*2+k); }
  if(ms>P.outline) { const snap=ms>P.hit; gfx.strokeStyle=snap?GOLD:'rgba(255,224,138,.6)'; gfx.lineWidth=snap?5:3; gfx.strokeRect(P.tx-36,P.ty-24,72,48); if(snap&&ms<P.hit+500) { gfx.globalAlpha*=.3; R(P.tx-38,P.ty-26,76,52,'#fff0b4'); } }
  if(ms>P.pixel&&ms<P.pixel+800) { const q=ez((ms-P.pixel)/300); gfx.globalAlpha=1; R(P.tx+38-q*4,P.ty-26,3,3,SKY); } };
Tm.radical_solutions=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,64),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'expr'},{t:400,f:'walk'},{t:1300,x:p.x,y:p.y,f:'expr'},{t:1450,f:'act',dx:-4},{t:1700,f:'expr'},{t:1850,f:'act',dx:-4},{t:2100,f:'expr'},{t:2250,f:'act',dx:u=>-ez(u)*10},{t:2600,f:'idle'},
    {t:2950,f:'act',dx:-3},{t:3250,f:'idle'},{t:3400,f:back(p.x,me)},{t:4300,x:'home',y:'home',f:'idle'}]);
  const plan={send:[1450,1850,2250],tx:F.x,ty:F.mid,outline:1300,hit:2550,pixel:2950};
  ST.play(E2,[
    [0,()=>{ setMessage('Three study tiles turn over above Tom. He walks them over.'); say(m.id,'radical_solutions'); scene('tm_tiles',3.6,{st,plan}); }],
    [1300,()=>{ sfx.select(); setMessage('A target outline. One piece. Two pieces.'); }],
    [1450,()=>{ sfx.whoosh(); }],[1850,()=>{ sfx.whoosh(); }],[2250,()=>{ sfx.whoosh(); }],
    ['hf',2550],
    [2550,()=>{ sfx.ding(); ST.jolt(f,.45); landHit(100); }],
    [2950,()=>{ setMessage('He brushes one stray pixel back into alignment.'); sfx.select(); }],
    [4400,'end',res(E2)+'The pieces finally line up.']]); };

// ---------- Patch Notes ----------
SC.tm_sheet=(s,u)=>{ const ms=s.t*1000,P=s.plan,drop=ez(ms/450),fold=ez((ms-P.fold)/600),h0=hand(); gfx.globalAlpha=fade(u,.96);
  const w=lerp(180,14,fold),hh=lerp(118,14,fold),x=lerp(P.x,h0.x-8,fold),y=lerp(lerp(-120,P.y,drop),h0.y-6,fold);
  RO(x-w/2,y-hh/2,w,hh,CREAM);
  if(fold<.3) { R(x-w/2,y-hh/2,w,14,'#1d3a8a'); label('PATCH NOTES 1.1',x,y-hh/2+3,CREAM,1); for(let k=0;k<3;k++) R(x-70,y-28+k*10,100+((k*37)%40),3,'#c9ccd4');
    label('TOUCHING: REMOVED',x,y+10,RED,1); const ul=cl((ms-P.ul0)/(P.ul1-P.ul0)); if(ul>0) Ln(x-56,y+22,x-56+112*ul,y+22,3,RED); }
  if(ms>P.hit&&ms<P.fold) for(const c of P.F) { const q=ez(cl((ms-P.hit)/100)),r=22*q,cx=c.x,cy=c.mid; gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.strokeRect(cx-r,cy-r,r*2,r*2); gfx.strokeStyle=RED; gfx.lineWidth=4; gfx.strokeRect(cx-r,cy-r,r*2,r*2); Ln(cx-r,cy-r,cx+r,cy+r,4,RED); Ln(cx+r,cy-r,cx-r,cy+r,4,RED); } };
Tm.patch_notes=E2=>{ const {m,fx}=E2,list=foes(E2).length?foes(E2):b2LiveFoes(),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,70);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:1100,x:p.x,y:p.y,f:'idle'},{t:1150,f:'expr'},{t:1500,f:'act',dx:u=>-u*24},{t:2100,f:'act',dx:-24},{t:2300,f:'act',dx:u=>-24+ez(u)*24},{t:2700,f:'expr'},{t:3300,f:'idle'},{t:3450,f:back(p.x,me)},{t:4400,x:'home',y:'home',f:'idle'}]);
  const plan={x:Math.max(110,Gp.x),y:Math.max(70,Gp.top-30),ul0:1500,ul1:2100,hit:2300,fold:2700,F:list.map(f=>ST.foe(f))};
  ST.play(E2,[
    [0,()=>{ setMessage('A PATCH NOTES sheet descends over the enemies. Tom walks up to present it.'); say(m.id,'patch_notes'); scene('tm_sheet',3.4,{plan}); }],
    [1500,()=>{ sfx.select(); setMessage('He underlines one line. TOUCHING: REMOVED.'); }],
    ['hf',2300],
    [2300,()=>{ sfx.stun&&sfx.stun(); sfx.ding(); all(list); landHit(100); }],
    [2700,()=>{ sfx.whoosh(); setMessage('He folds the sheet into a neat pocket square.'); }],
    [4500,'end',res(E2)+'The update addresses a known issue.']]); };
})();
