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
  enqueue(()=>{ setMessage('A package arrives. Tom didn\'t need it. Tom needed it.'); say('tom','unbox'); scene('box',4.2,{}); sfx.slideWhistle(); },
    600,()=>{ sfx.thud(); battle.shakeEnemy=.2; },
    120,()=>{ act(fx,1.2); },
    560,()=>{ sfx.whoosh(); },
    520,()=>{ sfx.charge(); const h=hand(); toss('tag',h.x,h.y,GX+30,250,0,1.2,90); },
    700,()=>{ sfx.ding(); bt('NEW',96,42,'#9fe8ff',4,.8); },
    400,()=>{ scene('gadgetbeam',.9,{}); sfx.laser(); },
    300,()=>{ battle.flashEnemy=.4; scene('flash',.4,{a:.6}); scene('ring',.6,{x:GX,y:264,r:100,c:'#9fe8ff'}); bt('$$$$',96,36,'#ffe08a',4,1); hit(E2); },
    900,E2.result+' It was on sale. It wasn\'t on sale.',()=>checkEnemy()); };
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

// ================= Option 3 Ultimates (phase 5a, 2026-10-24) =================
// Tom's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2): Boarding Group Zero (A6)
// and Cartridge Tilt (B6). 5.5 to 6 s cinematic set pieces on engine/stage.js. Timelines are absolute ms at 1x.
// Cartridge Tilt copies the live canvas twice: into the cartridge label, and to tilt the whole stage 30 degrees.
// Monsters flip through f.spin/f.ox/f.oy (engine/battle2-ui.js), refreshed every frame by the scene that owns them.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const PO=(pts,c,o=2)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); if(o) { gfx.strokeStyle=OUT; gfx.lineWidth=o; gfx.lineJoin='round'; gfx.stroke(); } };
const Tm=RECRUIT_MOVES.tom;
const GOLD='#ffe08a',CREAM='#fff8e8',RED='#e0402e',SKY='#9fe8ff',GREEN='#9be39a',NAVY='#1d3a8a',SKIN='#f2c79a',WARM='#ffd27a';
ST.nw('tm_');
const res=E2=>E2.result?E2.result+' ':'';
const TSP=()=>BATTLE_SPRITES.tom,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.86+dy});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
if(!sfx.jet) sfx.jet=()=>{ noise({dur:1.6,vol:.2,f0:200,f1:1800,type:'bandpass',q:.6}); tone({type:'sawtooth',f0:60,f1:170,dur:1.5,vol:.12,filter:600,q:2}); };
if(!sfx.chunk) sfx.chunk=()=>{ noise({dur:.14,vol:.3,f0:900,f1:200,type:'lowpass',q:1}); tone({type:'square',f0:110,f1:70,dur:.18,vol:.16}); tone({type:'square',f0:220,f1:160,dur:.08,vol:.1,delay:.1}); };
if(!sfx.blow) sfx.blow=()=>{ noise({dur:1.0,vol:.26,f0:500,f1:2400,type:'bandpass',q:.4}); };
const bars=k=>{ R(0,0,576,46*k,'#000'); R(0,324-46*k,576,46*k,'#000'); };
SC.tm_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); bars(k); };
SC.tm_cap=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*6,s.c||CREAM,s.sc||2); };
SC.tm_glow2=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||34,s.ry||46,s.c||GOLD); };
SC.tm_puffs=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,5*(1-u)+1,5*(1-u)+1,s.c||CREAM); } };

// ---------- Boarding Group Zero ----------
// Gate scanner beeps PRIORITY BOARDING, a red carpet rolls to a glowing door, Tom lies flat in a pod with a sleep mask,
// the jet rolls in (his window says Zzz), streaks through the enemy line, hot towels fall on the party, Tom wakes rested.
SC.tm_phone=(s,u)=>{ const ms=s.t*1000,h=hand(); gfx.globalAlpha=fade(u,.9); RO(h.x-6,h.y-14,10,16,'#2b2f38'); R(h.x-4,h.y-12,6,11,ms>s.beep?'#3fe07a':'#5c8fe0'); };
SC.tm_scan=(s,u)=>{ const ms=s.t*1000,ok=ms>s.beep,x=s.x,y=s.y,k=ez(ms/300); gfx.globalAlpha=fade(u,.92);
  const top=y-64*k; RO(x-5,top+14,10,y-top-14,'#6a6f7a'); RO(x-13,top,26,16,'#2b2f38'); R(x-10,top+3,20,10,ok?'#3fe07a':'#4a5060');
  if(ok&&ms<s.beep+1300) { label('PRIORITY',x,top-34,GREEN,2); label('BOARDING',x,top-20,GREEN,2); } };
SC.tm_carpet=(s,u)=>{ const ms=s.t*1000,P=s.plan,k=ez((ms-P.r0)/(P.r1-P.r0)); if(ms<P.r0) return; const xe=lerp(P.x0,P.x1,k); gfx.globalAlpha=fade(u,.93);
  const a=Math.min(P.x0,xe),b=Math.max(P.x0,xe); R(a,P.y-5,b-a,12,OUT); R(a,P.y-3,b-a,8,'#c8283a'); R(a,P.y-3,b-a,2,'#e8c84a'); R(a,P.y+3,b-a,2,'#e8c84a');
  if(k<1) { EO(xe,P.y-2,6,8,'#a81e30'); R(xe-1,P.y-8,2,12,'#e8c84a'); } };
SC.tm_door=(s,u)=>{ const ms=s.t*1000,P=s.plan,k=ez((ms-P.d0)/300),x=P.x,y=P.y; if(ms<P.d0) return; gfx.globalAlpha=fade(u,.9);
  const h=96*k,w=48,glow=ms>P.in&&ms<P.in+500?1-(ms-P.in)/500:0;
  R(x-w/2-4,y-h-4,w+8,h+4,OUT); R(x-w/2-2,y-h-2,w+4,h+2,'#8a8f9a'); R(x-w/2,y-h,w,h,'#fff0b4'); gfx.globalAlpha*=.5; R(x-w/2+4,y-h+4,w-8,h-4,'#ffffff'); gfx.globalAlpha=fade(u,.9);
  if(glow>0) { gfx.globalAlpha=glow*.6; E(x,y-h/2,w*1.4,h*.8,'#fff6cc'); gfx.globalAlpha=fade(u,.9); }
  if(k>.9) { RO(x-26,y-h-24,52,14,NAVY); label('GATE 0',x,y-h-20,CREAM,1); } };
// The lie-flat pod. Tom's body is drawn by the path (rotated); the duvet and mask go over him.
SC.tm_pod=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y; gfx.globalAlpha=fin(u,.08)*fade(u,.88);
  if(!s.front) { RO(x-54,y-14,108,12,NAVY); R(x-52,y-2,104,10,'#14204a'); R(x-50,y-12,100,4,'#3a5aa8'); RO(x+40,y-40,12,28,NAVY); RO(x-58,y-34,12,22,'#c9ccd4'); R(x-60,y-36,16,3,OUT); RO(x-56,y-44,4,8,'#cfe6ee'); return; }
  const lay=ms>P.lay; if(!lay) return;
  RO(x-52,y-50,70,36,'#eef2f6'); R(x-52,y-50,70,4,'#c9d2e0'); for(let k=0;k<3;k++) R(x-44+k*20,y-30,8,2,'#c9d2e0');
  R(x-52,y-18,104,16,NAVY); R(x-52,y-6,104,4,'#3a5aa8');   // pod rim in front of the body
  RO(x+18,y-31,16,6,NAVY);   // sleep mask over the eyes
  RO(x-22,y-58,14,7,CREAM);   // a warm towel on the chest
  for(let k=0;k<3;k++) { const q=((s.t*.8+k/3)%1); gfx.globalAlpha=(1-q)*fade(u,.88); label('Z',x+30+q*24+k*2,y-56-q*30,CREAM,1+(k===2?1:0)); } };
const jet=(k,t,zz,thrust)=>{ gfx.save(); gfx.scale(k,k);
  PO([[160,4],[214,4],[246,46],[224,46]],'#c9ccd4');   // far wing
  PO([[206,-12],[236,-52],[254,-52],[248,-12]],NAVY);   // tail fin
  R(0,-16,250,32,OUT); E(4,0,18,18,OUT); PO([[244,-16],[272,-8],[272,6],[244,16]],OUT,0);
  R(4,-14,242,28,'#eef2f6'); E(6,0,16,16,'#eef2f6'); PO([[244,-14],[270,-7],[270,5],[244,14]],'#eef2f6',0);
  R(4,6,266,4,NAVY); R(-2,-6,12,5,'#2b3a5a');
  for(let i=0;i<15;i++) { const lit=.75+.25*Math.sin(t*6+i); gfx.globalAlpha=1; R(36+i*13,-6,7,7,i===1?'#fff6cc':WARM); }
  label('GROUP ZERO',140,-14,NAVY,1);
  PO([[96,6],[150,6],[196,52],[176,52]],'#b8bac2');   // near wing
  R(116,18,40,16,OUT); R(118,20,36,12,'#9a9ca4'); E(118,26,6,7,'#2b2f38');
  const fl=thrust*(6+Math.sin(t*40)*2); if(fl>0) { E(158+fl,26,4+fl,5,'#ffb04a'); E(156+fl*.6,26,2+fl*.5,3,'#fff6cc'); }
  gfx.restore();
  if(zz) for(let j=0;j<2;j++) { const q=((t*.9+j/2)%1); gfx.globalAlpha=1-q; label('Z',(49+q*8)*k,(-14-q*26)*k,CREAM,2); gfx.globalAlpha=1; } };
SC.tm_jet=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,th=.4;
  if(ms<P.park) { const q=ez(ms/(P.park-P.a0)); x=lerp(620,P.px,q); y=P.py; }
  else if(ms<P.go) { x=P.px+Math.sin(s.t*30)*1.2; y=P.py; th=.4+.6*cl((ms-P.park)/(P.go-P.park)); }
  else { const q=cl((ms-P.go)/(P.out-P.go)),e=q*q; x=lerp(P.px,-360,e); y=lerp(P.py,P.ey,e); th=1.4; }
  s.x=x; s.y=y;
  if(ms>P.go) { gfx.globalAlpha=.55; gfx.save(); gfx.translate(x,y); const a=Math.atan2(P.ey-P.py,-360-P.px); gfx.rotate(a+Math.PI); R(240,-8,700,16,'#ffffff'); gfx.globalAlpha=.3; R(240,-14,700,28,'#ffffff'); gfx.restore(); gfx.globalAlpha=1; }
  gfx.save(); gfx.translate(x,y); if(ms>P.go) gfx.rotate(Math.atan2(P.ey-P.py,P.px+360)*.9);
  jet(1.1,s.t,ms<P.go,th); gfx.restore();
  if(ms>P.park&&ms<P.go) { label('COZY',x+120,y-46,WARM,2); label('KINETIC',x+170,y+72,'#ffb04a',2); } };
SC.tm_passes=(s,u)=>{ for(let k=0;k<10;k++) { const a=s.seed+k*.63,d=ez(u)*(30+k%3*12),x=s.x+Math.cos(a)*d,y=s.y-Math.abs(Math.sin(a))*d*.8+u*u*60;
  gfx.save(); gfx.translate(x,y); gfx.rotate(a+u*6); gfx.globalAlpha=1-u*u; R(-7,-4,14,8,OUT); R(-6,-3,12,6,'#ffffff'); R(-6,-3,3,6,NAVY); gfx.restore(); } };
const towel=(x,y,uu)=>{ R(-9,-5,18,10,OUT); R(-8,-4,16,8,CREAM); R(-4,-4,1,8,'#e6dccb'); R(2,-4,1,8,'#e6dccb'); gfx.globalAlpha=.6; for(let k=0;k<2;k++) E(-4+k*8,-10-((uu*30+k*7)%10),2,3,'#ffffff'); gfx.globalAlpha=1; };
SC.tm_mask=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,8); gfx.globalAlpha=fade(u,.85); RO(p.x-16,p.y-2,30,5,NAVY); };
Tm.delta_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),party=b2LiveParty();
  const doorX=Math.round(Math.max(Gp.x1+70,me.x-80)),floor=Math.min(312,me.base+4),pod={x:doorX,y:floor};
  const lieSc=.72,lieBase=pod.y-22+TH()*lieSc/2;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'expr'},{t:1300,f:'walk'},{t:2050,x:doorX+6,y:floor,f:'walk'},{t:2100,hide:true},
    {t:2300,x:pod.x+8,y:lieBase,f:'idle',rot:Math.PI/2,sc:lieSc,ns:true},{t:3150,hide:true},
    {t:4950,x:'home',y:'home',f:'kneel'},{t:5350,f:'idle'},{t:5600,f:'celeb',hop:6},{t:6000,f:'idle'}]);
  const plan={r0:700,r1:1300,x0:me.x-10,x1:doorX,y:floor,d0:700,in:2100,x:doorX,lay:2300};
  const jp={a0:3150,park:3700,go:4000,out:4500,px:250,py:112,ey:Math.round(Gp.top+Gp.base)/2+30};
  let jetS=null;
  ST.play(E2,[
    [0,()=>{ scene('tm_bars',6.2,{}); setMessage('Now boarding Group Zero! Tom taps his boarding pass.'); say(m.id,'delta_ult'); scene('tm_phone',1.3,{beep:550}); scene('tm_scan',2.2,{x:me.x-48,y:floor,beep:550}); }],
    [550,()=>{ sfx.beep&&sfx.beep(); b7Later(()=>sfx.beep&&sfx.beep(),130); }],
    [700,()=>{ scene('tm_carpet',2.5,{plan}); scene('tm_door',1.65,{plan}); sfx.whoosh(); setMessage('A red carpet rolls out to the gate.'); }],
    [2100,()=>{ sfx.ding(); }],
    [2200,()=>{ scene('tm_pod',1.05,{plan:{x:pod.x,y:pod.y,lay:100},back:true}); scene('tm_pod',1.05,{plan:{x:pod.x,y:pod.y,lay:100},front:true}); setMessage('Lie-flat pod. 180 degrees. Sleep mask. Warm towel.'); }],
    [3150,()=>{ jetS=scene('tm_jet',1.5,{plan:{a0:0,park:550,go:850,out:1350,px:jp.px,py:jp.py,ey:jp.ey}}); sfx.jet(); setMessage('Somewhere above the stage, the engines spool up.'); }],
    [4000,()=>{ sfx.jet(); sfx.whoosh(); setMessage('Nonstop service through the enemy line!'); }],
    ['hf',4200],
    [4200,()=>{ sfx.bonk(); for(const f of list) { const F=ST.foe(f); ST.jolt(f,.5); scene('tm_passes',1.1,{x:F.x,y:F.mid}); } landHit(100); scene('flash',.25,{a:.35}); }],
    [4500,()=>{ party.forEach((p,k)=>{ const q=ST.unit(p); ST.fly(towel,q.x+(k%2?8:-8),20,q.x,q.mid,.45,0,k*.1); }); setMessage('Hot towels for everyone.'); }],
    [5050,()=>{ E2.apply(); sfx.heal(); for(const p of party) { const q=ST.unit(p); scene('tm_glow2',.9,{x:q.x,y:q.mid,c:'#ffe7c2'}); } scene('tm_mask',1.1,{st}); }],
    [5600,()=>{ scene('tm_cap',1.1,{x:me.x,y:me.top-30,txt:'WELL RESTED',c:GOLD}); sfx.levelChime(); }],
    [6100,'end',()=>res(E2)+'Tom slept the whole way. Thank you for flying Group Zero.']]); };

// ---------- Cartridge Tilt ----------
// Tom looks at the camera and reaches up out of the frame. The battle shrinks into a grey cartridge in his giant
// hands; he blows the dust out of the pins (dust and rainbow glitch bars), slams it back in (KA-CHUNK), and the
// whole stage tilts 30 degrees: every monster flips onto its head in a sparkle burst, then the stage rights itself.
const RAINBOW=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff'];
let tiltBuf=null;
const grab=()=>{ const c=document.createElement('canvas'); c.width=576; c.height=324; c.getContext('2d').drawImage(gfx.canvas,0,0); return c; };
const rotPt=(x,y,px,py,a)=>{ const c=Math.cos(a),s=Math.sin(a),dx=x-px,dy=y-py; return {x:px+dx*c-dy*s,y:py+dx*s+dy*c}; };
const gripHand=(x,y,dir)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(dir,1);
  RO(-58,-34,40,74,SKIN); R(-58,-34,8,74,'#d9a77a'); for(let k=0;k<4;k++) { RO(-22,-28+k*17,26,12,SKIN); R(0,-28+k*17,4,12,'#e8b88a'); } RO(-30,40,18,22,SKIN); gfx.restore(); };
SC.tm_cart=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(!s.img) s.img=grab();
  const q=ez(ms/600),blow=ms>P.blow&&ms<P.ins?(ms-P.blow)/(P.ins-P.blow):0,ins=ez((ms-P.ins)/(P.chunk-P.ins));
  const tip=blow>0?Math.sin(Math.min(1,blow*3)*Math.PI/2)*(blow>.85?1-(blow-.85)/.15:1):0;
  const cx=288+(blow>0?Math.sin(s.t*50)*2:0),cy=lerp(160,236,ins)-tip*20,sc=lerp(1,.86,tip*.4)*(ms>P.chunk&&ms<P.chunk+120?.97:1);
  gfx.save(); gfx.setTransform(1,0,0,1,0,0);
  gfx.globalAlpha=q; R(0,0,576,324,'#0b0d12');
  // The console the cartridge goes back into.
  if(ms>P.ins-200) { const k=ez((ms-P.ins+200)/300); R(118,324-70*k,340,74,OUT); R(122,328-70*k,332,70,'#4a4c54'); R(122,328-70*k,332,8,'#6a6c74'); R(178,322-70*k,220,10,'#14161c'); R(132,340-70*k,40,6,RED); }
  gfx.globalAlpha=q; gfx.translate(cx,cy); gfx.scale(sc,sc*(1-tip*.12));
  PO([[-116,-102],[116,-102],[116,94],[102,104],[-102,104],[-116,94]],'#9a9ca4',3);
  R(-116,-102,232,12,'#b8bac2'); for(let k=0;k<4;k++) { R(-110+k*6,-80,3,52,'#82848c'); R(98+k*6-12,-80,3,52,'#82848c'); }
  R(-80,104,160,12,OUT); for(let k=0;k<19;k++) R(-77+k*8,106,5,9,'#e8c84a');
  R(-92,-72,184,110,OUT);
  // The live battle, shrinking into the label window.
  const lx=-88,ly=-50,lw=176,lh=99;
  gfx.save(); gfx.setTransform(1,0,0,1,0,0); gfx.globalAlpha=1; gfx.imageSmoothingEnabled=true;
  const tx=cx+lx*sc,ty=cy+ly*sc*(1-tip*.12),tw=lw*sc,th=lh*sc*(1-tip*.12);
  gfx.drawImage(s.img,lerp(0,tx,q),lerp(0,ty,q),lerp(576,tw,q),lerp(324,th,q)); gfx.restore();
  R(-88,-68,176,18,NAVY); label('THE ADVENTURES',0,-66,CREAM,1); label('OF TOM',0,-59,GOLD,1);
  if(blow>0) for(let k=0;k<5;k++) { const yy=-48+((k*23+s.t*260)%96); gfx.globalAlpha=q*.7; R(-88,yy,176,4+(k%2)*3,RAINBOW[(k+Math.floor(s.t*12))%6]); }
  gfx.restore();
  // Tom's giant hands, holding it from outside the game.
  if(q>.5) { gfx.globalAlpha=cl((q-.5)*2); gripHand(cx-118*sc,cy+10,1); gripHand(cx+118*sc,cy+10,-1); }
  if(blow>0) { gfx.globalAlpha=1;
    for(let k=0;k<14;k++) { const a=(blow*1.4-k*.06); if(a<0||a>1) continue; const x=cx-20-a*340+k*9,y=cy+118+Math.sin(k*2.1+a*6)*24; gfx.globalAlpha=1-a; E(x,y,6+a*16,4+a*10,k%3?'#8a8478':'#b8b0a0'); }
    for(let k=0;k<4;k++) { const yy=200+((k*31+s.t*300)%110); gfx.globalAlpha=.6; R(0,yy,576,5,RAINBOW[(k*2+Math.floor(s.t*10))%6]); }
    gfx.globalAlpha=1; if(blow<.8) label('WHOOOOSH!',288,286,CREAM,3); }
  if(ms>P.chunk&&ms<P.chunk+500) { gfx.globalAlpha=1; label('KA-CHUNK!',288,64,GOLD,3); }
  gfx.restore(); };
SC.tm_tilt=(s,u)=>{ const ms=s.t*1000,P=s.plan,a=P.a;
  const ang=ms<P.t1?-ez(ms/P.t1)*a:ms<P.t2?-a:-a*(1-ez((ms-P.t2)/(P.t3-P.t2)));
  const now=performance.now();
  for(const f of P.list) { if(!f||f.dead) continue; const k=ms<P.f0?0:ms<P.f1?ez((ms-P.f0)/(P.f1-P.f0)):ms<P.t2?1:1+ez((ms-P.t2)/(P.t3-P.t2));
    f.spin=k*Math.PI; f.oy=-Math.abs(Math.sin(k*Math.PI))*26; f.ox=-Math.sin(k/2*Math.PI)*22; f.spinAt=now; }
  if(!tiltBuf) { tiltBuf=document.createElement('canvas'); tiltBuf.width=576; tiltBuf.height=324; }
  const b=tiltBuf.getContext('2d'); b.clearRect(0,0,576,324); b.drawImage(gfx.canvas,0,0);
  gfx.save(); gfx.setTransform(1,0,0,1,0,0); gfx.globalAlpha=1; R(0,0,576,324,'#0b0d12');
  gfx.translate(P.px,P.py); gfx.rotate(ang); gfx.drawImage(tiltBuf,-P.px,-P.py); gfx.restore();
  bars(u>.85?(1-u)/.15:1);
  if(ms<P.f0+500) { const ff=ms<120?1-ms/120:0; if(ff>0) { gfx.globalAlpha=ff*.7; R(0,0,576,324,'#ffffff'); gfx.globalAlpha=1; } } };
const star=(x,y,r,c)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,rr=k%2?r*.45:r; gfx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); gfx.save(); gfx.translate(x,y); gfx.scale(.75,.75); gfx.translate(-x,-y); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
SC.tm_sparkle=(s,u)=>{ for(let k=0;k<9;k++) { const a=s.seed+k*.7,d=ez(u)*(26+(k%3)*16); gfx.globalAlpha=1-u*u; star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.8,7*(1-u*.5),RAINBOW[k%6]); }
  if(u<.6) { gfx.globalAlpha=(1-u/.6)*.8; E(s.x,s.y,40*ez(u/.3),30*ez(u/.3),'#fff6cc'); } };
Tm.cart_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),floor=Math.min(312,me.base+4),cx=300;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:800,x:cx,y:floor,f:'expr'},{t:850,f:'expr',rot:(q,tt)=>Math.sin(q*Math.PI*4)*.07},{t:1250,f:'celeb',dy:q=>ez(q)*4},
    {t:1350,f:'celeb',ease:'in'},{t:1600,x:cx,y:-70,f:'celeb',hide:true},
    {t:4700,x:cx,y:-70,f:'celeb',ease:'in'},{t:4950,x:cx,y:floor,f:'kneel'},{t:5150,f:'idle'},{t:5300,f:'walkR'},{t:6000,x:'home',y:'home',f:'idle'}]);
  const plan={blow:600,ins:1350,chunk:1600},tp={a:Math.PI/7.5,t1:350,t2:1000,t3:1450,f0:250,f1:600,px:Math.round(Gp.x+40),py:Math.round(Gp.base-40),list};
  ST.play(E2,[
    [0,()=>{ scene('tm_bars',3.35,{}); setMessage('Tom looks right at the camera. He shakes his head.'); say(m.id,'cart_ult'); }],
    [850,()=>{ scene('tm_cap',.9,{x:cx,y:floor-TH()-26,txt:'...',sc:2}); }],
    [1250,()=>{ setMessage('He reaches up, past the top of the screen.'); sfx.jumpWhistle&&sfx.jumpWhistle(); }],
    [1650,()=>{ scene('tm_cart',1.75,{plan}); sfx.whoosh(); setMessage('The whole battle is a game cartridge now. THE ADVENTURES OF TOM.'); }],
    [2250,()=>{ sfx.blow(); setMessage('He blows the dust out of the pins.'); }],
    [3000,()=>{ sfx.whoosh(); }],
    [3250,()=>{ sfx.chunk(); sfx.thud(); }],
    [3400,()=>{ scene('tm_tilt',1.5,{plan:tp}); setMessage('KA-CHUNK. The whole stage tilts!'); }],
    ['hf',3900],
    [3900,()=>{ sfx.ding(); sfx.bonk(); sfx.stun&&sfx.stun(); landHit(100);
      for(const f of list) { const F=ST.foe(f),p=rotPt(F.x-22,F.mid-26,tp.px,tp.py,-tp.a); ST.jolt(f,.3); scene('tm_sparkle',1,{x:p.x,y:p.y}); } }],
    [4700,()=>{ setMessage('The game is working again. Tom drops back in.'); }],
    [4950,()=>{ sfx.thud(); }],
    [5250,()=>{ scene('tm_cap',1.1,{x:cx,y:floor-TH()-30,txt:'UNCALLED FOR',c:GOLD}); }],
    [6100,'end',()=>res(E2)+'The game works again. The enemies are upside down about it.']]); };
})();

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Tom's review: things Tom actually does (games, sourdough, gadgets, flying, Japanese), one big readable moment per move.
// Button Mash (basic), Starter Splash, Crumb Shot, Mint Unboxing, Noise-Canceling, Window Seat, Flashcard Flurry,
// Konami Code, Save Point Sandwich (kept; big spinning crystal and a save chime), Kanji Strike. Same numbers as the
// slots they replace. Same engine/stage.js standard; scenes prefix tv_. The older functions above stay for the old keys.
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
const rrO=(x,y,w,h,r,c)=>{ gfx.beginPath(); if(gfx.roundRect) gfx.roundRect(x,y,w,h,r); else gfx.rect(x,y,w,h); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const Tm=RECRUIT_MOVES.tom;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',SKY='#9fe8ff',BLUE='#5c8fe0',CRUST='#c98a4b',CRUMB='#f1d9a8',WOOD='#8a5a30',GREEN='#9be39a',
  STARTER='#efe3c8',GREY='#6a6f7a',GREY2='#8c929c',INK='#1b1b22',FIRE='#ff8a3a';
ST.nw('tv_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tom,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.86+dy});
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const go=(x,me)=>x<me.x?'walk':'walkR';
const back=(x,me)=>x<me.x?'walkR':'walk';
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.tv_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-40); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.tv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30-(s.dy||0)); x=p.x; y=p.y; } const w=(s.txt.length*4-1)*(s.sc||2); x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.tv_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM)); } };
SC.tv_ring=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.4)*(1-q*.4); ring(s.x,s.y,8+q*(s.r||40),8+q*(s.r||40)*.75,5,s.c||CREAM); };
SC.tv_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.tv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.7); R(0,0,576,324,s.c||'#ffffff'); };
SC.tv_hearts=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; heart(s.x-20+k*10+Math.sin(q*6+k)*5,s.y-q*44,5+(k%2)*2,k%2?'#ff9ac0':'#ff6b9a'); } };
SC.tv_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI+k/((s.n||10)-1)*Math.PI,d=ez(u)*(s.r||34); gfx.globalAlpha=(1-u)*.85; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.5,5*(1-u)+2,4*(1-u)+2,s.c||'#e8dcc4'); } };

// A big game controller: grey body, grips, D-pad, red A and yellow B. lit: 'U','D','L','R','A','B' or a press flag.
const pad=(x,y,sc,lit)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  EO(-14,4,8,7,GREY); EO(14,4,8,7,GREY); rrO(-20,-8,40,16,6,GREY); R(-18,-6,36,3,GREY2);
  const dp=(dx,dy,w,h,k)=>R(-11+dx,-1+dy,w,h,lit===k?GOLD:INK); dp(-3,-4,4,3,'U'); dp(-3,2,4,3,'D'); dp(-6,-1,3,4,'L'); dp(1,-1,3,4,'R'); R(-12,-3,2,2,INK); R(-10,-1,2,2,INK);
  E(9,1,3,3,lit==='B'?GOLD:'#f0c040'); E(15,-2,3,3,lit==='A'||lit===true?GOLD:RED); R(-3,-5,6,2,'#3a3f46'); gfx.restore(); };

// ---------- Button Mash (basic) ----------
// He kneels in front of the monster with a giant controller and mashes. A tiny cloud of A's, a combo counter climbing
// over the monster (x2 ... x16), then the last press lands one big hit: COMBO x16.
SC.tv_mash=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.95);
  const k=Math.floor((ms-P.t0)/70),mashing=ms>P.t0&&ms<P.t1,lit=mashing?(k%2?'A':'B'):(ms>P.t1&&ms<P.hit+200?'A':null);
  const jx=mashing?Math.sin(ms*.09)*2:0,jy=mashing?Math.cos(ms*.13)*2:0; pad(h.x-8+jx,h.y+18+jy,1.9,lit);
  if(mashing) for(let j=0;j<6;j++) { const q=((ms-P.t0)/420+j/6)%1,x=h.x-8+Math.sin(j*2.7)*22+(q*16)*(j%2?1:-1),y=h.y+4-q*46; gfx.globalAlpha=1-q; bigWord(j%3?'A':'B',x,y,j%3?'#ff8a7a':GOLD,2); }
  const F=P.F; if(ms>P.t0&&ms<P.hit) { const n=Math.min(15,1+Math.floor((ms-P.t0)/(P.t1-P.t0)*15)),sc=2+Math.min(2,n/8); gfx.globalAlpha=1; bigWord('X'+n,F.x,F.top-36-sc*2,n>10?GOLD:CREAM,sc); if(n>3) label('COMBO',F.x,F.top-20,SKY,1); } };
Tm.button_mash=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,62),me=ST.unit(m);
  const t0=1000,t1=2350,hit=2500;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:900,x:p.x,y:p.y,f:'kneel'},{t:t0,f:'kneel',dx:(u,tt)=>Math.sin(tt*45)*2.2,dy:(u,tt)=>Math.abs(Math.sin(tt*30))*-1.5},{t:t1,f:'act',dx:u=>-ez(u)*12},
    {t:hit+150,f:'celeb',hop:10},{t:hit+650,f:'idle'},{t:hit+900,f:back(p.x,me)},{t:hit+1750,x:'home',y:'home',f:'idle'}]);
  const plan={t0,t1,hit,F};
  const taps=[]; for(let k=0;k<9;k++) taps.push([t0+k*150,()=>{ sfx.select(); if(k%3===1) ST.jolt(f,.1); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom kneels in front of '+f.name+' with a very large controller.'); say(m.id,'button_mash'); scene('tv_mash',(hit+700)/1000,{plan}); }],
    [t0,()=>{ setMessage('He mashes. Frantically. His face stays completely calm.'); }],
    ...taps,
    ['hf',hit],
    [hit,()=>{ (sfx.combo||sfx.bonk)(); sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('tv_big',1.1,{x:F.x,y:F.top-74,txt:'COMBO X16!',c:GOLD,sc:3}); scene('tv_burst',.6,{x:F.x+F.w*.2,y:F.mid,n:10,r:46}); scene('tv_ring',.6,{x:F.x+F.w*.2,y:F.mid,r:44}); }],
    [hit+1850,'end',res(E2)+'Very technical.']]); };

// ---------- Starter Splash (A1) ----------
// Tom opens Bready Mercury's jar at the end of the row. The jar burps, and a wave of bubbly starter rolls across the
// field along the monsters' feet line, cresting and crashing on the target. Everyone else gets sticky feet.
const jar=(x,y,sc,lid,bub)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  { gfx.save(); gfx.translate(lid*50,-20-lid*190); gfx.rotate(lid*5); R(-16,-4,32,8,OUT); R(-14,-2,28,5,'#c9a03e'); gfx.restore(); }
  R(-16,-16,32,42,OUT); R(-14,-14,28,38,'#cfe6ee'); R(-14,-2,28,26,STARTER); for(let k=0;k<5;k++) { const b=((performance.now()/25+k*13)%22); E(-9+k*4.5,22-b,1.8,1.8,CREAM); }
  R(-13,-10,26,10,CREAM); label('DAY 3',0,-8,'#2b2a26',1);
  if(bub>0) { const r=3+bub*9; E(0,-18-r*.6,r+2,r*.8+2,OUT); E(0,-18-r*.6,r,r*.8,STARTER); } gfx.restore(); };
SC.tv_jar=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),raise=ez((ms-P.raise)/350)*(ms>P.lower?1-ez((ms-P.lower)/300):1);
  const lid=ms<P.pop?0:(ms<P.close?ez((ms-P.pop)/500):0),bub=ms>P.raise&&ms<P.pop?ez((ms-P.raise)/(P.pop-P.raise)):0;
  gfx.globalAlpha=fade(u,.95); const wob=ms>P.raise&&ms<P.pop?Math.sin(ms*.06)*.08:0; gfx.save(); gfx.translate(h.x-16,h.y-10-raise*30); gfx.rotate(wob); jar(0,0,1.5,lid,bub); gfx.restore(); };
SC.tv_wave=(s,u)=>{ const ms=s.t*1000+s.t0,P=s.plan; if(ms<P.go) return; const y=P.y,H=P.H;
  const fr=P.jx-P.v*(ms-P.go),grow=ez((ms-P.go)/250),out=ms>P.done?ez((ms-P.done)/500):0; if(out>=1) return;
  const tailX=P.jx,crest=fr+16,top=y-H*grow*(1-out*.8);
  const pts=[[tailX,y+4],[fr-14,y+4]];
  pts.push([fr-6,y-H*.4*grow*(1-out)],[fr+2,top+H*.12],[crest,top],[crest+16,top+H*.18]);
  for(let k=0;k<=8;k++) { const x=lerp(crest+24,tailX,k/8),ripple=Math.sin(k*1.7+ms*.012)*5; pts.push([x,y-H*(.55-.35*k/8)*grow*(1-out)+ripple]); }
  gfx.globalAlpha=1-out; poly(pts,STARTER);
  E(crest+2,top+8,12,8,CREAM); E(crest-4,top+2,6,5,'#ffffff');
  for(let k=0;k<14;k++) { const x=lerp(fr+6,tailX-6,((k*37)%14)/14),yy=y-6-((k*53)%10)/10*H*.4*grow*(1-out),r=2+(k%3); E(x,yy-Math.sin(ms*.01+k)*2,r,r,k%2?CREAM:'#d8c9a8'); }
  if(ms>P.splash&&ms<P.splash+500) { const q=(ms-P.splash)/500; for(let k=0;k<10;k++) { const a=-Math.PI*(.15+k*.07),d=q*70; gfx.globalAlpha=(1-q); EO(P.tx+Math.cos(a)*d,P.ty+Math.sin(a)*d*1.2+q*q*40,5,5,STARTER); } } };
SC.tv_goo=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.6)*.95; for(const q of s.list) { EO(q.x,q.base,q.w*.45,7,STARTER); for(let k=0;k<3;k++) E(q.x-q.w*.25+k*q.w*.25,q.base-3,3,3,CREAM); } };
Tm.starter_splash=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),all=b2LiveFoes(),Gp=ST.group(all),p=rowSpot(Gp,84);
  const go0=1900,hit=2500,y=Math.min(318,F.base+2),jx=p.x-50,v=Math.max(.25,(jx-F.x)/(hit-go0));
  const plan={raise:1000,pop:1650,close:3250,lower:3500,go:go0,jx,v,y,H:Math.round(cl(F.h*.95,56,96)),tx:F.x,ty:F.mid,splash:hit,done:hit+Math.round((F.x+80)/v)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:1650,f:'act',dx:u=>-ez(u)*6},{t:2000,f:'expr'},{t:3250,f:'kneel'},{t:3600,f:'idle'},{t:3700,f:back(p.x,me)},{t:4500,x:'home',y:'home',f:'idle'}]);
  const sp=all.filter(o=>o!==f).map(o=>{ const O=ST.unit(o); return [go0+Math.max(0,(jx-O.x)/v),()=>{ ST.jolt(o,.25); sfx.splat(); }]; });
  ST.play(E2,[
    [0,()=>{ setMessage('Tom carries Bready Mercury, his sourdough starter, to the end of the row.'); say(m.id,'starter_splash'); scene('tv_jar',4.0,{plan}); }],
    [1000,()=>{ setMessage('Day three. He\'s VERY bubbly. The lid starts to rattle.'); sfx.charge(); }],
    [1650,()=>{ (sfx.boing||sfx.whoosh)(); scene('tv_text',.9,{x:jx-10,y:p.y-TH()-20,txt:'BURP',c:STARTER,sc:3}); }],
    [1850,()=>{ scene('tv_wave',(plan.done+500-1850)/1000,{plan,t0:1850}); sfx.whoosh(); setMessage('A wave of starter rolls out across the field.'); }],
    ...sp,
    ['hf',hit],
    [hit,()=>{ sfx.splat(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('tv_big',1.1,{x:F.x,y:F.top-74,txt:'SPLOOSH!',c:STARTER,sc:4}); }],
    [hit+400,()=>{ scene('tv_goo',2.2,{list:all.map(o=>ST.unit(o))}); }],
    [3250,()=>{ sfx.select(); scene('tv_text',1.1,{st,txt:'GOOD BOY',c:CREAM}); setMessage('He screws the lid back on. Good boy, Mercury.'); }],
    [4600,'end',res(E2)+'Everything is a little sticky now.']]); };

// ---------- Crumb Shot (A2) ----------
// Tom kneels by the friend with a cutting board and a warm boule. He saws it open; steam pours out of the crumb and
// curls over them (the heal). Then he holds up his phone for the crumb shot. Flash.
const boule=(x,y,sc,cut,open)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  if(!cut) { EO(0,-10,22,14,CRUST); E(-4,-16,12,5,'#e0a868'); LnO(-10,-18,8,-14,2,'#f1d9a8'); }
  else { const o=open*10; gfx.save(); gfx.translate(-o,0); EO(-2,-10,13,14,CRUST); E(-4,-14,6,4,'#e0a868'); gfx.restore();
    gfx.save(); gfx.translate(6+o,-2); gfx.rotate(open*.5); EO(0,-8,13,14,CRUMB); for(const [hx,hy,r] of [[-4,-12,2.5],[3,-6,2],[-2,-3,1.6],[5,-14,1.6],[-6,-6,1.4]]) E(hx,hy,r,r*1.2,'#d8b888'); ring(0,-8,13,14,3,CRUST); gfx.restore(); }
  gfx.restore(); };
SC.tv_bread=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y-(1-ez((ms-P.set)/200))*30; if(ms<P.set) return; gfx.globalAlpha=fade(u,.95);
  RO(x-46,y-6,92,10,WOOD); R(x-44,y-4,88,3,'#b07a44');
  const cut=ms>P.cut,open=cut?ez((ms-P.cut)/300):0; boule(x,y-6,1.8,cut,open);
  if(ms>P.saw0&&ms<P.cut+150) { const q=Math.sin((ms-P.saw0)*.03),kx=x+q*14,ky=y-24+cl((ms-P.saw0)/(P.cut-P.saw0))*14; gfx.save(); gfx.translate(kx,ky); R(-38,-4,58,8,OUT); R(-36,-2,46,4,'#dfe6ee'); for(let k=0;k<10;k++) R(-36+k*4.6,2,2,2,'#9aa3ac'); R(12,-4,22,8,OUT); R(14,-2,18,4,'#5a3a1e'); gfx.restore();
    for(let k=0;k<4;k++) { const q2=((ms-P.saw0)/300+k/4)%1; gfx.globalAlpha=1-q2; R(x-6+k*5+q2*(k%2?14:-14),y-14+q2*12,3,3,CRUST); } gfx.globalAlpha=fade(u,.95); }
  if(cut) { gfx.globalAlpha=.8*fade(u,.8); for(let k=0;k<4;k++) { const q=((ms-P.cut)/1100+k/4)%1; gfx.strokeStyle='#ffffff'; gfx.lineWidth=5-q*2; gfx.beginPath(); for(let j=0;j<10;j++) { const yy=y-30-j*7-q*30,xx=x+10+Math.sin(j*.8+ms*.006+k)*7-(P.dir*j*q*8); j?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke(); } } };
SC.tv_phone=(s,u)=>{ const ms=s.t*1000,h=hand(); gfx.globalAlpha=fade(u,.9); RO(h.x-12,h.y-34,16,26,'#2b2f3a'); R(h.x-10,h.y-31,12,19,'#7fb8e8'); E(h.x-4,h.y-21,4,3,CRUST);
  if(ms>s.flash&&ms<s.flash+300) { gfx.globalAlpha=1-(ms-s.flash)/300; star(h.x-4,h.y-22,22,'#ffffff'); } };
Tm.crumb_shot=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),sp=self?{x:me.x,y:me.base}:(t.side==='foe'?spotFor(m,t,96):{x:Math.max(150,H.x-H.w*.5-24),y:Math.min(316,H.base+3)});
  const bx=self?me.x-80:sp.x-82,by=Math.min(318,sp.y+2),cut=2000,hit=2400,snap=3050;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'kneel'},{t:1100,f:'kneel',dx:(u,tt)=>Math.sin(tt*18)*3},{t:cut,f:'kneel'},{t:2650,f:'expr'},{t:snap+450,f:'idle'},{t:3800,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:1000,x:sp.x,y:sp.y,f:'kneel'},{t:1100,f:'kneel',dx:(u,tt)=>Math.sin(tt*18)*3},{t:cut,f:'kneel'},{t:2650,f:'expr'},{t:snap+450,f:'idle'},{t:snap+650,f:back(sp.x,me)},{t:snap+1500,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),end=self?4000:snap+1600,plan={x:bx,y:by,set:self?500:950,saw0:1100,cut,dir:(H.x<bx?1:-1)};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Tom sets down a cutting board and a warm boule.':'Tom carries a cutting board and a warm boule over to '+t.name+'.'); say(m.id,'crumb_shot'); scene('tv_bread',(end-150)/1000,{plan}); }],
    [1100,()=>{ setMessage('He saws it open. Slowly. The crust crackles.'); for(let k=0;k<4;k++) b7Later(()=>sfx.select(),k*220); }],
    [cut,()=>{ sfx.whoosh(); scene('tv_text',1,{x:bx,y:by-92,txt:'OPEN CRUMB',c:CRUMB,sc:2}); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('tv_glow',1.1,{x:H.x,y:H.mid,c:'#ffd8a0'}); scene('tv_hearts',1,{x:H.x,y:H.top}); hopOf(t!==m?t:null); setMessage('The steam rolls over '+(self?'him':t.name)+'. It smells like a Sunday.'); }],
    [2650,()=>{ scene('tv_phone',1.0,{flash:snap-2650}); }],
    [snap,()=>{ (sfx.shutter||sfx.select)(); scene('tv_flash',.3,{a:.55}); scene('tv_big',1.1,{x:bx,y:by-86,txt:'CRUMB SHOT',c:GOLD,sc:3}); }],
    [end,'end',kindLine(t,'He\'ll be posting that one.')]]); };

// ---------- Mint Unboxing (A3) ----------
// A brand-new gadget box. He peels the plastic film off in one long, perfect strip, lifts the lid, and a golden light
// pours out. He holds the gadget over his head. His joy heals everyone.
SC.tv_box=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y-(1-ez((ms-P.set)/200))*30,h=hand(); if(ms<P.set) return; gfx.globalAlpha=fade(u,.95);
  const lid=ms<P.lid?0:ez((ms-P.lid)/350),beams=ms>P.lid+150&&ms<P.put?cl((ms-P.lid-150)/300)*(ms>P.put-300?(P.put-ms)/300:1):0;
  if(beams>0) { gfx.globalAlpha=beams*.5; for(let k=0;k<7;k++) { const a=-Math.PI/2+(k-3)*.28+Math.sin(ms*.003+k)*.04; gfx.beginPath(); gfx.moveTo(x-6,y-30); gfx.lineTo(x+Math.cos(a-.08)*170,y-30+Math.sin(a-.08)*170); gfx.lineTo(x+Math.cos(a+.08)*170,y-30+Math.sin(a+.08)*170); gfx.closePath(); gfx.fillStyle=k%2?'#fff4c0':GOLD; gfx.fill(); } gfx.globalAlpha=fade(u,.95); }
  RO(x-30,y-30,60,32,'#f6f6f8'); R(x-30,y-10,60,6,BLUE); label('NEW',x+16,y-24,RED,1);
  if(ms<P.peel1) { gfx.globalAlpha*=.4; R(x-30,y-30,60,32,'#dff7ff'); gfx.globalAlpha=fade(u,.95); }
  if(ms>P.peel0&&ms<P.peel1+250) { const q=ez((ms-P.peel0)/(P.peel1-P.peel0)),ex=lerp(x+28,h.x,q),ey=lerp(y-30,h.y,q); gfx.globalAlpha*=.6; Ln(x-28,y-30,ex,ey,10,'#dff7ff'); gfx.globalAlpha=fade(u,.95); if(q<1) bigWord('PEEL...',x,y-56,CREAM,2); }
  { gfx.save(); gfx.translate(x-lid*70,y-32-Math.sin(lid*Math.PI)*34+lid*28); RO(-32,-8,64,10,'#ffffff'); R(-32,-2,64,3,BLUE); gfx.restore(); }
  if(ms>P.up&&ms<P.put) { const p={x:P.st.x-4,y:P.st.y-TH()*(P.st.sc||1)-16}; gfx.save(); gfx.translate(p.x,p.y); gfx.rotate(Math.sin(ms*.008)*.08); RO(-11,-17,22,34,'#22252e'); R(-9,-15,18,26,'#7fd8ff'); R(-9,-15,18,6,'#c8f0ff'); E(0,14,2,2,GREY2); gfx.restore(); star(p.x+18,p.y-18,6+Math.sin(ms*.02)*2,'#ffffff',ms*.005); star(p.x-16,p.y+10,4,GOLD,ms*.007); } };
Tm.mint_unboxing=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m),dee=B2.party.find(p=>p.id==='deedee'&&b2Alive(p));
  const px=foe?front(U[0],90).x:Math.max(170,Math.min(...U.map(q=>q.x-q.w*.5))-24),py=foe?front(U[0],90).y:Math.min(314,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+14);
  const peel0=1150,peel1=1950,lid=2150,up=2450,hit=2650,put=3600;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(px,me)},{t:900,x:px,y:py,f:'kneel'},{t:peel0,f:'kneel',dx:u=>ez(u)*6},{t:lid,f:'kneel'},{t:up,f:'celeb',hop:8,hn:2},{t:put-200,f:'expr'},{t:put,f:'kneel'},{t:put+300,f:'idle'},{t:put+400,f:back(px,me)},{t:put+1200,x:'home',y:'home',f:'idle'}]);
  const plan={x:px-64,y:py,set:900,peel0,peel1,lid,up,put,st};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom kneels down with a brand-new box. Still in the plastic.'); say(m.id,'mint_unboxing'); scene('tv_box',(put+250)/1000,{plan}); }],
    [peel0,()=>{ setMessage('He peels the film off in one long, perfect strip.'); for(let k=0;k<4;k++) b7Later(()=>sfx.select(),k*200); }],
    [lid,()=>{ sfx.whoosh(); (sfx.fanfare||sfx.levelUp)(); }],
    [up,()=>{ scene('tv_big',1.3,{x:px-30,y:py-TH()-66,txt:'MINT!',c:GOLD,sc:4}); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.ding(); sfx.heal(); for(const u of who) { const q=ST.unit(u); scene('tv_glow',.9,{x:q.x,y:q.mid,c:GOLD,rx:32,ry:44}); scene('tv_hearts',1,{x:q.x,y:q.top}); hopOf(u!==m?u:null); } setMessage(foe?foe.name+' gets to hold it. Carefully.':'Everyone gets to look at it. Nobody touches the screen.'); }],
    ...(dee&&!foe?[[hit+300,()=>{ const q=ST.unit(dee); scene('tv_text',.9,{x:q.x,y:q.top-16,txt:'WARM CRUST',c:'#f3c37a',sc:1}); }]]:[]),
    [put,()=>{ sfx.select(); setMessage('He puts it back in the box. He\'s keeping the box.'); }],
    [put+1300,'end',foe?kindLine(foe):'The box is being kept. Forever.']]); };

// ---------- Noise-Canceling (A4) ----------
// The monster is loud: jagged noise and BLAH bubbles. Tom walks up, puts on his big flight headphones, taps ANC on, and
// a quiet blue wave rolls out from him. The noise freezes and pops; the monster's yell is muted. Ahh.
const phones=(x,y,sc,on)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.strokeStyle=OUT; gfx.lineWidth=8; gfx.beginPath(); gfx.arc(0,0,16,Math.PI*1.05,Math.PI*1.95); gfx.stroke();
  gfx.strokeStyle='#3a3f46'; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(0,0,16,Math.PI*1.05,Math.PI*1.95); gfx.stroke(); RO(-21,-4,9,15,'#3a3f46'); RO(12,-4,9,15,'#3a3f46'); R(-19,-2,3,11,GREY2); R(18,-2,3,11,GREY2); E(16,9,1.5,1.5,on?'#7dff8a':'#555'); gfx.restore(); };
SC.tv_noise=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F,mx=F.x+F.w*.3,my=F.mid-F.h*.1; const frz=ms>P.quiet?cl((ms-P.quiet)/300):0;
  if(ms<P.quiet+350) for(let k=0;k<4;k++) { const q=((ms/700)+k/4)%1,d=frz?lerp(30+q*120,0,frz):30+q*120; gfx.globalAlpha=(1-q)*(1-frz); gfx.strokeStyle=frz?'#aaaaaa':(k%2?RED:FIRE); gfx.lineWidth=4; gfx.beginPath(); for(let j=-4;j<=4;j++) { const a=j*.16,r=d+(j%2?6:-6); const px=mx+Math.cos(a)*r,py=my+Math.sin(a)*r; j===-4?gfx.moveTo(px,py):gfx.lineTo(px,py); } gfx.stroke(); }
  const words=['BLAH','YAP','BLAH','NAG']; if(ms<P.quiet) words.forEach((w,k)=>{ const q=((ms/900)+k/4)%1; gfx.globalAlpha=Math.sin(q*Math.PI); bigWord(w,mx+30+q*80,my-30-k*14+Math.sin(q*6)*4,k%2?'#ffb0a0':CREAM,2); });
  if(ms>P.quiet) { const q=ez((ms-P.quiet)/600); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(F.x-F.w*.5-6,F.mid); gfx.scale(lerp(.4,1.3,Math.min(1,q*1.4)),lerp(.4,1.3,Math.min(1,q*1.4)));
    R(-18,-7,10,14,OUT); R(-16,-5,6,10,CREAM); poly([[-10,-7],[2,-16],[2,16],[-10,7]],CREAM); LnO(8,-8,22,8,4,RED); LnO(22,-8,8,8,4,RED); gfx.restore(); } };
SC.tv_phones=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(!st||st.x==null) return; gfx.globalAlpha=1;
  const top={x:st.x+P.hx,y:st.y-TH()*(st.sc||1)+P.hy}; let x,y,sc;
  if(ms<P.lift) { const h=hand(); x=h.x-6; y=h.y-4; sc=1; } else if(ms<P.on) { const q=ez((ms-P.lift)/(P.on-P.lift)),h=hand(); x=lerp(h.x-6,top.x,q); y=lerp(h.y-4,top.y,q)-Math.sin(q*Math.PI)*20; sc=lerp(1,1.15,q); } else { x=top.x; y=top.y; sc=1.15; }
  phones(x,y,sc,ms>P.click); if(ms>P.click&&ms<P.click+900) bigWord('ANC ON',top.x,top.y-40,'#7dff8a',2); };
SC.tv_hush=(s,u)=>{ const q=ez(u); gfx.globalAlpha=(1-q)*.7; ring(s.x,s.y,20+q*s.r,14+q*s.r*.7,10,'#8fd0ff'); gfx.globalAlpha=(1-q)*.18; E(s.x,s.y,20+q*s.r,14+q*s.r*.7,'#8fd0ff'); };
Tm.noise_canceling=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,52),me=ST.unit(m);
  const lift=1050,on=1500,click=1650,quiet=1900,hit=2150;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:lift,f:'act',dx:-3},{t:on,f:'expr'},{t:click,f:'act',dx:-4},{t:quiet,f:'idle'},{t:2500,f:'idle',rot:(u,tt)=>Math.sin(tt*2.4)*.05},{t:3500,f:back(p.x,me)},{t:4300,x:'home',y:'home',f:'idle'}]);
  const plan={F,st,lift,on,click,quiet,hx:-4,hy:6};
  ST.play(E2,[
    [0,()=>{ setMessage(f.name+' won\'t stop yelling. Tom walks over anyway.'); say(m.id,'noise_canceling'); scene('tv_noise',3.9,{plan}); scene('tv_phones',4.4,{plan}); }],
    [lift,()=>{ setMessage('He takes out his big flight headphones. He puts them on.'); sfx.whoosh(); }],
    [click,()=>{ sfx.select(); }],
    [quiet,()=>{ scene('tv_hush',.7,{x:p.x-10,y:p.y-TH()*.6,r:Math.max(140,p.x-F.x+60)}); (sfx.charge||sfx.whoosh)(); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); ST.jolt(f,.5); landHit(100); scene('tv_big',1.2,{x:F.x,y:F.top-74,txt:'SILENCE',c:'#8fd0ff',sc:4}); }],
    [2500,()=>{ scene('tv_text',1.2,{st,txt:'AHH',c:CREAM,dy:22}); setMessage('Tom closes his eyes. Total quiet. Just like seat 1A.'); }],
    [4400,'end',res(E2)+'The noise has been canceled.']]); };

// ---------- Window Seat (A5) ----------
// A giant airplane window frames the enemy row. Tom reaches up, pulls the shade halfway, then all the way: THUNK.
// It stays down for a beat (the row is gone), rolls up on dazed monsters, and he hangs DO NOT DISTURB on the most
// hurt friend (Guarded).
SC.tv_window=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y,w=P.w,h=P.h; const show=ez(ms/300)*(ms>P.gone?1-ez((ms-P.gone)/300):1); if(show<=0) return;
  gfx.globalAlpha=show*.22; R(x-w/2+12,y-h/2+12,w-24,h-24,'#bfe8ff');
  gfx.globalAlpha=show*.5; for(let k=0;k<3;k++) { const cx=x-w/2+30+((k*97+ms*.02)%(w-60)),cy=y-h/2+26+k*20; E(cx,cy,16,6,'#ffffff'); E(cx+10,cy-4,10,6,'#ffffff'); }
  gfx.globalAlpha=show; let sh;
  if(ms<P.pull0) sh=.08; else if(ms<P.half) sh=lerp(.08,.45,ez((ms-P.pull0)/(P.half-P.pull0))); else if(ms<P.slam) sh=.45; else if(ms<P.up) sh=lerp(.45,1,ez((ms-P.slam)/120)); else sh=lerp(1,.08,ez((ms-P.up)/350));
  const ih=h-24,shY=y-h/2+12,shH=ih*sh; R(x-w/2+12,shY,w-24,shH,'#e8e2d4'); for(let k=1;k<6;k++) { const ly=shY+shH*k/6; R(x-w/2+12,ly,w-24,1,'#c9c0ae'); }
  R(x-w/2+12,shY+shH-6,w-24,6,'#cfc6b2'); RO(x-12,shY+shH-4,24,8,'#b8ae98');
  gfx.lineWidth=16; gfx.strokeStyle=OUT; gfx.beginPath(); if(gfx.roundRect) gfx.roundRect(x-w/2+4,y-h/2+4,w-8,h-8,34); else gfx.rect(x-w/2+4,y-h/2+4,w-8,h-8); gfx.stroke();
  gfx.lineWidth=11; gfx.strokeStyle='#f0ece4'; gfx.beginPath(); if(gfx.roundRect) gfx.roundRect(x-w/2+4,y-h/2+4,w-8,h-8,34); else gfx.rect(x-w/2+4,y-h/2+4,w-8,h-8); gfx.stroke(); };
SC.tv_tag=(s,u)=>{ const d=ez(u/.2),sw=Math.sin(s.t*5)*.12*(1-u); gfx.globalAlpha=fade(u,.85)*d; gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(sw); RO(-16,-2,32,40,'#ffd0e0'); E(0,4,5,5,OUT); E(0,4,3,3,'#ffd0e0'); label('DO NOT',0,14,'#7a1a3a',1); label('DISTURB',0,24,'#7a1a3a',1); gfx.restore(); };
Tm.window_seat=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m);
  const w=Math.max(176,Math.min(330,Gp.w+80)),h=Math.max(150,Math.min(210,Gp.base-Gp.top+70)),cx=Math.max(w/2+4,Math.min(572-w/2,Gp.x)),cy=Math.max(h/2+4,Math.min(320-h/2,Gp.base-h/2+20));
  const p={x:Math.min(552,cx+w/2+50),y:Math.min(316,Gp.base+6)};
  const L=lowest(),LU=L?ST.unit(L):null,selfL=L===m,pull0=1150,half=1600,slam=1950,up=2900,gone=3400;
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:pull0,f:'act',dx:u=>-ez(u)*8,dy:u=>-ez(u)*4},{t:half,f:'expr'},{t:slam-120,f:'act',dx:-10,dy:u=>ez(u)*6},{t:slam+200,f:'idle'},{t:2600,f:'idle'}];
  let tagAt=3300,end;
  if(LU&&!selfL) { const tx=Math.min(556,LU.x+LU.w*.5+26); K.push({t:2700,f:go(tx,{x:p.x})},{t:tagAt,x:tx,y:LU.base+3,f:'expr'},{t:tagAt+500,f:'idle'},{t:tagAt+600,f:back(tx,me)},{t:tagAt+1200,x:'home',y:'home',f:'idle'}); end=tagAt+1300; }
  else { K.push({t:2700,f:back(p.x,me)},{t:3500,x:'home',y:'home',f:'expr'},{t:3900,f:'idle'}); tagAt=3500; end=4300; }
  const st=ST.keys(fx,K),plan={x:cx,y:cy,w,h,pull0,half,slam,up,gone};
  ST.play(E2,[
    [0,()=>{ setMessage('A giant airplane window appears around the enemies. Tom walks up to the shade.'); say(m.id,'window_seat'); scene('tv_window',(gone+350)/1000,{plan}); }],
    [pull0,()=>{ setMessage('He pulls the shade down. Halfway. He considers it.'); sfx.select(); }],
    [slam-150,()=>{ sfx.whoosh(); }],
    ['hf',slam],
    [slam,()=>{ sfx.thud(); sfx.bonk(); for(const f of list) ST.jolt(f,.45); landHit(100); scene('tv_big',1.2,{x:cx,y:Gp.top-74,txt:'SHADE DOWN',c:CREAM,sc:3}); }],
    [slam+250,()=>{ E2.apply(); setMessage('Shade down. Lights off. First class.'); }],
    [up,()=>{ sfx.whoosh(); }],
    [tagAt,()=>{ if(LU) { const q=selfL?me:LU; scene('tv_tag',1.4,{x:selfL?me.x-44:q.x-q.w*.5-6,y:q.mid-30}); sfx.select(); } }],
    [end,'end',res(E2)+'Don\'t disturb.']]); };

// ---------- Flashcard Flurry (B1) ----------
// POP QUIZ. Tom flicks flashcards from a deck at every monster, one after another; they bonk and stick. Over the target,
// the ? flips to ! (its weakness). On a kind cast it gets a gold-star sticker instead.
const card=(x,y,sc,k,rot)=>{ const pics=['#ffd166',BLUE,RED,GREEN]; gfx.save(); gfx.translate(x,y); gfx.rotate(rot||0); gfx.scale(sc,sc); RO(-10,-14,20,28,CREAM); E(0,-4,5,5,pics[k%4]); R(-6,6,12,2,'#2b2a26'); R(-3,9,6,2,'#2b2a26'); gfx.restore(); };
SC.tv_deck=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.94); const left=Math.max(0,P.n-Math.floor(Math.max(0,ms-P.c0)/P.step)); for(let k=Math.min(3,left);k>0;k--) card(h.x-12-k*2,h.y-14-k*2,1.4,k,0); };
SC.tv_stuck=(s,u)=>{ gfx.globalAlpha=fade(u,.7); card(s.x,s.y,1.4,s.k,s.rot); if(u<.4) { gfx.globalAlpha=1-u/.4; bigWord(s.w,s.x,s.y-30,CREAM,1); } };
SC.tv_q=(s,u)=>{ const ms=s.t*1000,done=ms>s.flip,x=s.x,y=s.y,sq=done&&ms<s.flip+200?Math.abs(Math.cos((ms-s.flip)/200*Math.PI)):1; gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(x,y); gfx.scale(sq,1); EO(0,0,17,17,done?(s.kind?GOLD2:GOLD):'#cfd8d6'); if(s.kind&&done) star(0,0,11,CREAM); else bigWord(done?'!':'?',1,-5,done?'#7a1a14':'#2b2a26',3); gfx.restore(); };
Tm.flashcard_flurry=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),me=ST.unit(m),all=b2LiveFoes(),Gp=ST.group(all),kind=!!(B2.move&&B2.move.kindOnFoe);
  const sx=Math.max(Gp.x1+70,Math.min(me.x-40,Gp.x1+150)),sy=Math.min(316,me.base+6),n=6,c0=1150,step=170;
  const order=[]; for(let k=0;k<n-1;k++) order.push(all[k%all.length]); order.push(t);
  const words=['DOG','SUN','HOT','CAT','TREE','?'];
  const K=[{t:0,x:'home',y:'home',f:go(sx,me)},{t:800,x:sx,y:sy,f:'expr'}];
  for(let k=0;k<n;k++) K.push({t:c0+k*step-40,f:'act',dx:u=>-Math.sin(u*Math.PI)*8});
  K.push({t:c0+n*step,f:'expr'},{t:3200,f:'idle'},{t:3300,f:back(sx,me)},{t:4000,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),reveal=c0+n*step+350;
  const throws=order.map((o,k)=>[c0+k*step,()=>{ const O=ST.unit(o),h=hand(),rot=(k%2?-.3:.3); sfx.whoosh(); ST.fly((x,y,uu)=>card(0,0,1.4,k,uu*9),h.x-12,h.y-14,O.x,O.mid,.26,30);
    b7Later(()=>{ sfx.select(); ST.jolt(o,.18); scene('tv_stuck',1.2,{x:O.x+((k*13)%20)-10,y:O.mid-((k*7)%14),k,rot,w:o===t&&k===n-1?'?':words[k%5]}); },260); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom steps out with a deck of flashcards.'); say(m.id,'flashcard_flurry'); scene('tv_deck',(c0+n*step+200)/1000,{plan:{c0,step,n}}); scene('tv_q',3.4,{x:Math.min(560,F.x+F.w*.5+20),y:F.mid-6,flip:reveal,kind}); }],
    [900,()=>{ scene('tv_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'POP QUIZ!',c:CREAM,sc:3}); sfx.select(); }],
    [c0,()=>{ setMessage(kind?'Flashcards for everybody. '+t.name+' gets the easy ones.':'Flashcards for everybody. Fast. No peeking.'); }],
    ...throws,
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); sfx.ding(); ST.jolt(t,.2); scene('tv_big',1.3,{x:F.x,y:F.top-74,txt:kind?'GOOD JOB!':'WEAK SPOT!',c:GOLD,sc:3}); }],
    [4100,'end',kind?kindLine(t):'Pencils down. The answers are showing.']]); };

// ---------- Konami Code (B2) ----------
// A giant controller lies on the floor between the party and the row. Tom hops from button to button: up, up, down,
// down, left, right, left, right, B, A. Every press drops a giant arrow on a monster; the code fills in at the top.
// On A: flash, 30 LIVES, and a 1UP over every friend.
const KSEQ=['U','U','D','D','L','R','L','R','B','A'];
const arrow=(x,y,sc,k,c)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate({U:0,R:Math.PI/2,D:Math.PI,L:-Math.PI/2}[k]); gfx.scale(sc,sc); poly([[0,-14],[12,0],[5,0],[5,12],[-5,12],[-5,0],[-12,0]],c); gfx.restore(); };
const glyph=(x,y,sc,k)=>{ if(k==='A'||k==='B') { EO(x,y,9*sc,9*sc,k==='A'?RED:'#f0c040'); bigWord(k,x+sc,y-3*sc,CREAM,Math.max(1,Math.round(sc*1.4))); } else arrow(x,y,sc,k,SKY); };
SC.tv_konmat=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y; gfx.globalAlpha=fin(u,.06)*fade(u,.93); const k=P.times.findIndex((tt,i)=>ms>=tt&&ms<tt+180),lit=k>=0?KSEQ[k]:null;
  poly([[x-84,y+14],[x+84,y+14],[x+70,y-14],[x-70,y-14]],GREY); poly([[x-74,y+8],[x+74,y+8],[x+64,y-10],[x-64,y-10]],GREY2);
  const dp=P.dpad; for(const [k2,dx,dy] of [['U',0,-8],['D',0,8],['L',-14,0],['R',14,0]]) { gfx.save(); gfx.translate(dp+dx,y+dy); gfx.scale(1,.55); RO(-7,-7,14,14,lit===k2?GOLD:INK); gfx.restore(); }
  EO(P.bx,y+2,10,6,lit==='B'?GOLD:'#f0c040'); EO(P.ax,y-2,10,6,lit==='A'?GOLD:RED); label('B',P.bx,y,'#2b2a26',1); label('A',P.ax,y-4,CREAM,1); };
SC.tv_code=(s,u)=>{ const ms=s.t*1000,P=s.plan,n=P.times.filter(tt=>ms>=tt).length,x0=288-10*13+13,y=34; gfx.globalAlpha=fade(u,.9); RO(x0-20,y-16,10*26+14,32,'#20232c');
  for(let k=0;k<10;k++) { const x=x0+k*26; if(k<n) glyph(x,y,.8,KSEQ[k]); else R(x-6,y,12,2,'#5a6070'); }
  if(n>=10&&ms<P.times[9]+600&&Math.floor(ms/80)%2) { gfx.strokeStyle=GOLD; gfx.lineWidth=3; gfx.strokeRect(x0-20,y-16,10*26+14,32); } };
SC.tv_drop=(s,u)=>{ const q=ez(u/.25),sq=u>.25&&u<.45?1-Math.sin((u-.25)/.2*Math.PI)*.3:1; gfx.globalAlpha=fade(u,.6); gfx.save(); gfx.translate(s.x,lerp(-40,s.y,q)); gfx.scale(1/sq,sq); glyph(0,0,2.2,s.k); gfx.restore(); };
SC.tv_1up=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.7); bigWord('1UP',s.x,s.y-ez(u)*26,'#7dff8a',2); };
Tm.konami_code=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m);
  const mx=Math.round(Math.max(Gp.x1+90,Math.min(me.x-70,(Gp.x1+me.x)/2+10))),my=Math.min(310,Math.max(Gp.base,me.base)+4),dpad=mx-40,bx=mx+28,ax=mx+52;
  const step=230,t0=1150,times=KSEQ.map((_,k)=>t0+k*step),boom=times[9]+350;
  const spot=k=>{ const c=KSEQ[k]; return c==='U'?[dpad,my-8]:c==='D'?[dpad,my+8]:c==='L'?[dpad-14,my]:c==='R'?[dpad+14,my]:c==='B'?[bx,my+2]:[ax,my-2]; };
  const K=[{t:0,x:'home',y:'home',f:go(mx,me)},{t:900,x:mx+20,y:my,f:'expr'},{t:times[0]-220,x:mx+20,y:my,f:'expr',hop:22}];
  times.forEach((tt,k)=>{ const [x,y]=spot(k); K.push({t:tt,x,y:y+6,f:k%2?'act':'expr',hop:20}); });
  K[K.length-1].hop=0; K[K.length-1].f='celeb';
  K.push({t:boom+700,f:'idle'},{t:boom+850,f:back(ax,me)},{t:boom+1600,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={x:mx,y:my,dpad,bx,ax,times};
  const hits={1:15,3:15,5:15,7:15};
  const presses=times.map((tt,k)=>[tt,()=>{ const o=list[k%list.length]; if(!o) return; const O=ST.unit(o); (k>=8?sfx.boing:sfx.select)(); scene('tv_drop',.7,{x:O.x,y:O.top-12,k:KSEQ[k]}); b7Later(()=>{ ST.jolt(o,.3); sfx.bonk(); },60); if(hits[k]) landHit(hits[k]); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('A giant controller unrolls on the floor. Tom has been waiting his whole life for this.'); say(m.id,'konami_code'); scene('tv_konmat',(boom+1300)/1000,{plan}); scene('tv_code',(boom+900)/1000,{plan}); }],
    [t0,()=>{ setMessage('Up. Up. Down. Down. Left. Right. Left. Right. B. A.'); }],
    ...presses,
    ['hf',boom],
    [boom,()=>{ (sfx.levelUp||sfx.fanfare)(); sfx.thud(); for(const f of list) ST.jolt(f,.55); landHit(40); scene('tv_flash',.35,{a:.6}); scene('tv_big',1.6,{x:Gp.x,y:Gp.top-74,txt:'30 LIVES!',c:GOLD,sc:4});
      for(const q of b2LiveParty()) { const U=ST.unit(q); scene('tv_1up',1.3,{x:U.x,y:U.top-10}); } }],
    [boom+1700,'end',res(E2)+'Thirty lives. He\'s not going to need them.']]); };

// ---------- Save Point Sandwich (B3, kept; big crystal, save chime) ----------
// Same beats as before: a save crystal rises over the friend, Tom walks over and unfolds it into a sandwich. The crystal
// is now big and spinning with rings and a save chime, and the sandwich is big too.
SC.tv_save=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.x,y=P.y-ez(ms/400)*16; const held=ms>P.grab&&ms<P.give,unf=ez((ms-P.unf)/350);
  if(held||ms>=P.give) { const h=hand(); x=held?h.x-14:lerp(h.x-14,P.tx,ez((ms-P.give)/250)); y=held?h.y-20:lerp(h.y-20,P.ty,ez((ms-P.give)/250)); }
  gfx.globalAlpha=fade(u,.92);
  if(unf<1) { const k=1-unf,sc=held?2:3.2; gfx.globalAlpha*=.5*k; for(let r=0;r<2;r++) { const q=((ms/700)+r/2)%1; ring(x,y,(14+q*30)*sc/3,(6+q*12)*sc/3,3,SKY); } gfx.globalAlpha=fade(u,.92);
    gfx.save(); gfx.translate(x,y+Math.sin(ms*.006)*3); gfx.scale(sc*Math.abs(Math.cos(ms*.007))*k+.15,sc*k); gfx.beginPath(); gfx.moveTo(0,-16); gfx.lineTo(11,0); gfx.lineTo(0,16); gfx.lineTo(-11,0); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill();
    gfx.beginPath(); gfx.moveTo(0,-13); gfx.lineTo(8,0); gfx.lineTo(0,13); gfx.lineTo(-8,0); gfx.closePath(); gfx.fillStyle=SKY; gfx.fill(); gfx.beginPath(); gfx.moveTo(0,-13); gfx.lineTo(8,0); gfx.lineTo(0,0); gfx.closePath(); gfx.fillStyle='#e0fbff'; gfx.fill(); gfx.restore();
    for(let k2=0;k2<4;k2++) { const a=ms*.004+k2*Math.PI/2; star(x+Math.cos(a)*28*sc/3,y+Math.sin(a)*12*sc/3,3,'#ffffff',a); }
    if(!held&&ms<P.grab) { bigWord('SAVE',x,y+40,SKY,2); } }
  if(unf>0) { gfx.save(); gfx.translate(x,y); gfx.scale(2.2,2.2); const w=30*unf; R(-w/2-2,-8,w+4,22,OUT); R(-w/2,-6,w,18,'#eef4f8'); if(unf>.8) { const bite=ms>P.bite; R(-12,-4,24,4,CRUMB); R(-12,0,24,3,'#7bbf5a'); R(-12,3,24,3,'#e07a5a'); R(-12,6,24,4,CRUMB); if(bite) E(12,1,4,5,'#eef4f8'); } gfx.restore(); }
  if(ms>P.bite) { bigWord('SAVED',x,y-48,SKY,3); } };
Tm.save_sandwich=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'expr'},{t:900,f:'celeb',hop:16},{t:1200,f:'expr'},{t:1800,f:'act',dx:-6},{t:2300,f:'idle'},{t:3000,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:1000,x:sp.x,y:sp.y,f:'idle'},{t:1050,f:'celeb',hop:16},{t:1300,f:'expr'},{t:1850,f:'act',dx:u=>-ez(u)*10},{t:2350,f:'act',dx:-10},{t:2800,f:'idle'},{t:3000,f:back(sp.x,me)},{t:4000,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={x:H.x+(self?-34:0),y:H.top-40,grab:self?1000:1150,unf:1350,give:1850,bite:2250,tx:H.x-4,ty:H.mid-8},end=self?3100:4100;
  ST.play(E2,[
    [0,()=>{ setMessage('A big save crystal spins up over '+(self?'Tom':t.name)+'. Tom walks over.'); say(m.id,'save_sandwich'); scene('tv_save',(end-300)/1000,{plan}); sfx.levelChime(); }],
    [plan.grab,()=>{ sfx.select(); setMessage('He unfolds it. It was sandwich paper all along. Thick homemade bread.'); }],
    [1850,()=>{ sfx.whoosh(); }],
    ['hf',2250],
    [2250,()=>{ E2.apply(); sfx.levelChime(); sfx.heal(); scene('tv_glow',.9,{x:H.x,y:H.mid,c:SKY}); hopOf(t!==m?t:null); }],
    [end,'end',kindLine(t,'Progress saved. Lunch secured.')]]); };

// ---------- Kanji Strike (B4) ----------
// Tom raises a giant calligraphy brush and writes the kanji for fire in the air over the monster, four glowing strokes.
// It flares, slams into the monster, and bursts into flames. FIRE.
const KANJI=[[[-.55,-.4],[-.32,-.08]],[[.6,-.48],[.36,-.08]],[[.03,-.92],[.01,-.2],[-.2,.36],[-.72,.86]],[[.02,.06],[.32,.46],[.82,.86]]];
const plen=pts=>{ let L=0; for(let i=1;i<pts.length;i++) L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); return L; };
const partial=(pts,q)=>{ const L=plen(pts)*q,out=[pts[0]]; let acc=0; for(let i=1;i<pts.length;i++) { const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); if(acc+d>=L) { const f=(L-acc)/d; out.push([lerp(pts[i-1][0],pts[i][0],f),lerp(pts[i-1][1],pts[i][1],f)]); return out; } acc+=d; out.push(pts[i]); } return out; };
const stroke=(pts,x,y,S,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.lineJoin='round'; gfx.beginPath(); pts.forEach(([a,b],i)=>{ const px=x+a*S,py=y+b*S; i?gfx.lineTo(px,py):gfx.moveTo(px,py); }); gfx.stroke(); };
SC.tv_kanji=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.x,y=P.y,S=P.S; if(ms>P.slam) return;
  const flare=ms>P.flare?cl((ms-P.flare)/(P.slam-P.flare)):0; if(flare>0) { const q=ez(flare); S=lerp(P.S,P.S*1.15,q); }
  let tip=null; const done=[]; KANJI.forEach((pts,k)=>{ const q=cl((ms-P.strokes[k])/P.dur); if(q<=0) return; const pp=q<1?partial(pts,ez(q)):pts; done.push(pp); if(q<1) tip=pp[pp.length-1]; });
  gfx.globalAlpha=.35; for(const pp of done) stroke(pp,x,y,S,S*.24,flare>0?'#ffffff':FIRE);
  gfx.globalAlpha=1; for(const pp of done) stroke(pp,x,y,S,S*.15+6,INK); for(const pp of done) stroke(pp,x,y,S,S*.15,flare>0?'#fff4c0':GOLD2);
  if(tip) { const tx=x+tip[0]*S,ty=y+tip[1]*S; gfx.save(); gfx.translate(tx,ty); gfx.rotate(-.6); gfx.scale(1.5,1.5); R(-5,-60,10,50,OUT); R(-3,-58,6,46,'#c8a060'); for(let k=0;k<4;k++) R(-3,-50+k*10,6,2,'#8a6a3a'); poly([[-6,-12],[6,-12],[2,6],[0,10],[-2,6]],INK); gfx.restore(); } };
SC.tv_fire=(s,u)=>{ for(let k=0;k<16;k++) { const q=cl(u*1.5-((k*7)%16)/40),a=-Math.PI/2+((k*37)%16-8)*.12,d=ez(q)*(s.r||70); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; const x=s.x+Math.cos(a)*d*.7,y=s.y+Math.sin(a)*d-q*20,r=(10-q*7)*(1+(k%3)*.3); E(x,y,r+2,r*1.3+2,OUT); E(x,y,r,r*1.3,k%3?FIRE:'#ffd14a'); E(x,y+r*.3,r*.4,r*.5,'#fff4c0'); } };
Tm.kanji_strike=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,104),me=ST.unit(m);
  const S=Math.round(cl(F.h*1.05,74,96)),strokes=[1150,1450,1750,2150],dur=330,flare=2550,slam=2800;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:1100,f:'act',dx:(u,tt)=>-6+Math.sin(tt*5)*5,dy:-2},{t:flare,f:'expr'},{t:slam-100,f:'act',dx:u=>-ez(u)*14},{t:slam+300,f:'idle'},{t:3500,f:'act',dx:(u,tt)=>u<.6?Math.sin(tt*30)*3:0},{t:3800,f:back(p.x,me)},{t:4600,x:'home',y:'home',f:'idle'}]);
  const plan={x:F.x,y:Math.max(S*.95+10,F.top-S*.25),S,strokes,dur,flare,slam};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom walks out with a very large calligraphy brush.'); say(m.id,'kanji_strike'); scene('tv_kanji',slam/1000+.05,{plan}); }],
    ...strokes.map((tt,k)=>[tt,()=>{ sfx.whoosh(); if(k===0) setMessage('He writes in the air. Four strokes. Perfect stroke order.'); }]),
    [flare,()=>{ (sfx.charge||sfx.ding)(); setMessage('It glows. It means fire.'); }],
    ['hf',slam],
    [slam,()=>{ sfx.slash&&sfx.slash(); sfx.thud(); ST.jolt(f,.6); landHit(100); scene('tv_flash',.3,{a:.5,c:'#fff0c0'}); scene('tv_fire',1.2,{x:F.x,y:F.mid,r:F.h*.8}); scene('tv_big',1.3,{x:F.x,y:F.top-74,txt:'FIRE!',c:FIRE,sc:4}); }],
    [3500,()=>{ setMessage('He flicks the ink off the brush. It should have studied.'); sfx.select(); }],
    [4700,'end',res(E2)+'Fire. Stroke order counts.']]); };
})();

// ================= Round 3 overrides from Tom (2026-10-24 18:40, claude/move-review.md) =================
// Five renamed moves with new keys: Sourdough Snob (A2, was crumb_shot), Overpriced Gadget (A3, was mint_unboxing),
// Seat 1A, Peasants (A5, was window_seat), 10-Step Skincare (B3, was save_sandwich), Know-It-All (B5, was patch_notes).
// Same numbers as the slots. Same engine/stage.js standard; scenes prefix t3_. Older functions stay for the old keys.
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
const rrO=(x,y,w,h,r,c)=>{ gfx.beginPath(); if(gfx.roundRect) gfx.roundRect(x,y,w,h,r); else gfx.rect(x,y,w,h); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const Tm=RECRUIT_MOVES.tom;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',SKY='#9fe8ff',BLUE='#5c8fe0',CRUST='#c98a4b',CRUMB='#f1d9a8',WOOD='#8a5a30',
  GREY='#6a6f7a',GREY2='#8c929c',INK='#1b1b22',NAVY='#1f2c4a',NAVY2='#2c3e66',PINK='#ff9ac0';
ST.nw('t3_');
const say2=(id,k)=>{ try{ say(id,k); }catch(e){} };
const S=(k,...a)=>{ if(sfx[k]) sfx[k](...a); };
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tom,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.86+dy});
const HEADF={tom:.86,grace:.84,rose:.84,amy:.74,deedee:.72,boppy:.72,tnb:.74,nara:.62};
const faceY=(t,H)=>t&&t.side==='foe'?H.top+H.h*.3:H.base-H.h*((HEADF[t&&t.id]||.8)-.09);
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const go=(x,me)=>x<me.x?'walk':'walkR';
const back=(x,me)=>x<me.x?'walkR':'walk';
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const clampX=(txt,x,sc)=>{ const w=(txt.length*4-1)*sc; return Math.max(w/2+8,Math.min(568-w/2,x)); };
SC.t3_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-40); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4; x=clampX(s.txt,x,sc); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.t3_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30-(s.dy||0)); x=p.x; y=p.y; } const sc=s.sc||2; bigWord(s.txt,clampX(s.txt,x,sc),Math.max(8,y-ez(u/.3)*8),s.c||CREAM,sc); };
SC.t3_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM)); } };
SC.t3_ring=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.4)*(1-q*.4); ring(s.x,s.y,8+q*(s.r||40),8+q*(s.r||40)*.75,5,s.c||CREAM); };
SC.t3_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.t3_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.7); R(0,0,576,324,s.c||'#ffffff'); };
SC.t3_hearts=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; heart(s.x-20+k*10+Math.sin(q*6+k)*5,s.y-q*44,5+(k%2)*2,k%2?PINK:'#ff6b9a'); } };
SC.t3_spark=(s,u)=>{ for(let k=0;k<(s.n||6);k++) { const q=((u*(s.sp||2))+k/(s.n||6))%1,a=k*2.4; gfx.globalAlpha=Math.sin(q*Math.PI)*fade(u,.8); star(s.x+Math.cos(a)*(s.r||30)*(.5+q*.5),s.y+Math.sin(a)*(s.r||30)*.6-q*10,3+Math.sin(q*Math.PI)*4,k%2?'#ffffff':GOLD,q*3); } };

// A whole boule with a scored ear (sc 1 = 44 x 28).
const loaf=(x,y,sc,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); EO(0,-10,22,14,CRUST); E(-4,-17,13,5,'#e0a868'); LnO(-12,-19,10,-13,2,CRUMB); E(-14,-6,3,2,'#a86a34'); E(10,-4,3,2,'#a86a34'); gfx.restore(); };
const slice=(x,y,sc,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); EO(0,0,10,9,CRUMB); ring(0,0,10,9,3,CRUST); for(const [hx,hy,r] of [[-3,-3,2],[3,1,1.6],[-1,3,1.3],[4,-4,1.2]]) E(hx,hy,r,r*1.2,'#d8b888'); gfx.restore(); };

// ---------- Sourdough Snob (A2) ----------
// Tom carries a huge warm boule to the friend and an easel chart pops up: WILD YEAST 101. He tears off a slice and feeds
// them (the heal). While they chew, he lectures with a pointer: FLOUR+WATER, WAIT 48 HRS, ADMIRE CRUST. CHEW CHEW over
// the friend; he holds the boule up high, sparkling: ADMIRE THE CRUST! Nobody asked.
SC.t3_chart=(s,u)=>{ const ms=s.t*1000,P=s.plan,a=ez((ms-P.c0)/280)*(ms>P.c1?1-ez((ms-P.c1)/300):1); if(a<=0) return;
  const x=P.cx,y=P.cy-(1-a)*30,W=180,H=128; gfx.globalAlpha=a;
  LnO(x-50,y+H/2-6,x-70,y+H/2+40,4,WOOD); LnO(x+50,y+H/2-6,x+70,y+H/2+40,4,WOOD);
  RO(x-W/2,y-H/2,W,H,CREAM); R(x-W/2,y-H/2,W,20,'#2d5a3a'); label('WILD YEAST 101',x,y-H/2+5,CREAM,2);
  // The diagram: a yeast cell budding, bubbles, an arrow, a loaf.
  const dy=y-H/2+42; EO(x-58,dy,15,12,'#f3e2b0'); E(x-60,dy-2,5,4,'#c9a060'); EO(x-40,dy-11,7,6,'#f3e2b0');
  for(let k=0;k<4;k++) { const q=((ms/900)+k/4)%1; E(x-30+k*6,dy+6-q*18,2+k%2,2+k%2,'#bfe3ff'); }
  poly([[x-14,dy-4],[x+6,dy-4],[x+6,dy-10],[x+18,dy],[x+6,dy+10],[x+6,dy+4],[x-14,dy+4]],GOLD); loaf(x+50,dy+10,.9);
  const steps=['FLOUR+WATER','WAIT 48 HRS','ADMIRE CRUST'];
  steps.forEach((t,k)=>{ if(ms<P.steps[k]) return; const q=ez((ms-P.steps[k])/200); gfx.globalAlpha=a*q; label((k+1)+' '+t,x-6,y+6+k*15,k===2?'#a8401c':'#2b2a26',2); });
  gfx.globalAlpha=a;
  const k=P.steps.filter(tt=>ms>=tt).length-1;
  if(ms>P.p0&&ms<P.p1&&k>=0) { const h=hand(),ty=y+11+k*15,tx=x+W/2-8; LnO(h.x-2,h.y-2,tx,ty,3,'#d8b070'); E(tx,ty,3,3,RED); } };
SC.t3_loafheld=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.drop) return; const h=hand(),st=P.st; gfx.globalAlpha=1;
  if(ms>P.up&&ms<P.down&&st&&st.x!=null) { const q=ez((ms-P.up)/250)*(ms>P.down-250?ez((P.down-ms)/250):1); const p=head(st,-36); loaf(lerp(h.x-6,p.x,q),lerp(h.y+8,p.y,q),lerp(1.5,2.3,q),Math.sin(ms*.01)*.05);
    if(q>.8) { for(let k=0;k<6;k++) { const a=ms*.004+k*1.05; star(p.x+Math.cos(a)*58,p.y-20+Math.sin(a)*24,4+Math.sin(ms*.02+k)*2,k%2?'#ffffff':GOLD,a); } } return; }
  loaf(h.x-4,h.y+18,1.3,-.1); };
SC.t3_chew=(s,u)=>{ const ms=s.t*1000; if(ms>s.stop) return; const k=Math.floor(ms/300)%2; gfx.globalAlpha=fin(u,.05); bigWord('CHEW',s.x+(k?6:-6),s.y-(k?4:0),CREAM,2); };
Tm.sourdough_snob=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foeT=t.side==='foe';
  const sp=self?{x:me.x,y:me.base}:foeT?spotFor(m,t,44):{x:Math.max(230,H.x-H.w*.5-30),y:Math.min(316,H.base+4)};
  const cx=cl(self?me.x-90:foeT?(H.x+sp.x)/2:sp.x-96,100,476),cy=Math.max(70,Math.min(H.top,sp.y-TH())-74);
  const feed=1350,hit=1700,st0=[2100,2600,3100],up=3500,down=4300,c1=3450,walk=4550;
  const K=self?[{t:0,x:'home',y:'home',f:'expr'},{t:feed,f:'act',dx:-6},{t:hit,f:'expr'},{t:1950,f:'act',dx:(u,tt)=>-4+Math.sin(tt*6)*3},{t:up,f:'celeb'},{t:down,f:'expr'},{t:walk,f:'idle'},{t:walk+400,f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:1000,x:sp.x,y:sp.y,f:'expr'},{t:feed,f:'act',dx:u=>-ez(u)*8},{t:hit,f:'expr'},{t:1950,f:'act',dx:(u,tt)=>-4+Math.sin(tt*6)*3},{t:up,f:'celeb',hop:6},{t:down,f:'expr'},{t:walk,f:back(sp.x,me)},{t:walk+850,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),plan={cx,cy,c0:1000,c1,steps:st0,p0:1950,p1:up,up,down,drop:walk+900,st},end=walk+1000;
  const tx=H.x-(t.side==='foe'?0:4),ty=self?faceY(m,me)+6:faceY(t,H)+8;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Tom holds up a warm sourdough boule. He has a chart.':'Tom brings '+t.name+' a warm sourdough boule. And a chart.'); say2(m.id,'sourdough_snob'); scene('t3_loafheld',end/1000,{plan}); scene('t3_chart',(c1+320)/1000,{plan}); }],
    [1000,()=>{ S('whoosh'); scene('t3_text',1,{x:cx,y:cy-82,txt:'A LECTURE',c:CREAM,sc:2}); }],
    [feed,()=>{ S('select'); const h=hand(); ST.fly((x,y,uu)=>slice(0,0,1.8,uu*6),h.x-8,h.y,tx,ty,.32,30); setMessage('He tears off a big warm slice. Here. Eat.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); S('ding'); scene('t3_glow',1.1,{x:H.x,y:H.mid,c:'#ffd8a0'}); scene('t3_hearts',1,{x:H.x,y:H.top}); hopOf(t!==m?t:null); scene('t3_chew',(up-hit)/1000+.3,{x:H.x,y:H.top-12,stop:up-hit}); }],
    [st0[0],()=>{ S('select'); setMessage('While they chew, he explains wild yeast. Nobody asked.'); }],
    [st0[1],()=>{ S('select'); }],
    [st0[2],()=>{ S('select'); setMessage('Forty-eight hours of fermentation. He has a pointer.'); }],
    [up,()=>{ (sfx.fanfare||sfx.ding)(); scene('t3_big',1.4,{x:cx,y:cy,txt:'ADMIRE THE CRUST!',c:GOLD,sc:3}); setMessage('Stop chewing. Look at the crust. LOOK at it.'); }],
    [end,'end',kindLine(t,'He\'s still talking about the crust.')]]); };

// ---------- Overpriced Gadget (A3) ----------
// A huge matte-black box drops in front of Tom, price tag swinging ($1499). The lid slides off by itself. Very slowly.
// Golden light. He holds up the gadget (giant camera bump) and the joy heals everyone: RETAIL THERAPY. Then the receipt
// prints, and keeps printing, all the way to the floor. He looks at it. WORTH IT.
SC.t3_gbox=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y-(1-ez((ms-P.set)/220))*40; if(ms<P.set) return; gfx.globalAlpha=fade(u,.95);
  const lift=ms<P.lid0?0:ms<P.lid1?ez((ms-P.lid0)/(P.lid1-P.lid0))*.35:(.35+ez((ms-P.lid1)/250)*.65);
  const beams=ms>P.lid1&&ms<P.rc0?cl((ms-P.lid1)/250)*(ms>P.rc0-300?(P.rc0-ms)/300:1):0;
  if(beams>0) { gfx.globalAlpha=beams*.45; for(let k=0;k<7;k++) { const a=-Math.PI/2+(k-3)*.26+Math.sin(ms*.003+k)*.04; gfx.beginPath(); gfx.moveTo(x,y-58); gfx.lineTo(x+Math.cos(a-.08)*190,y-58+Math.sin(a-.08)*190); gfx.lineTo(x+Math.cos(a+.08)*190,y-58+Math.sin(a+.08)*190); gfx.closePath(); gfx.fillStyle=k%2?'#fff4c0':GOLD; gfx.fill(); } gfx.globalAlpha=fade(u,.95); }
  RO(x-48,y-58,96,58,'#22242a'); R(x-48,y-58,96,4,'#3a3d46'); label('MAX',x,y-34,'#6a6f7a',3);
  // The price tag on a string.
  const sw=Math.sin(ms*.006)*.35; gfx.save(); gfx.translate(x+48,y-50); gfx.rotate(sw); Ln(0,0,0,20,2,'#d8d0c0'); RO(-22,20,44,18,'#fff4c0'); E(-17,29,2,2,OUT); label('$1499',2,26,RED,1); gfx.restore();
  // The lid slides up and away.
  if(lift<1) { const ly=y-58-lift*30,lx=x+(lift>.35?(lift-.35)/.65*120:0); gfx.save(); gfx.translate(lx,ly); gfx.rotate(lift>.35?(lift-.35)*1.4:0); RO(-52,-16,104,20,'#2c2f36'); R(-52,-16,104,4,'#454954'); gfx.restore(); if(ms>P.lid0&&ms<P.lid1) bigWord('FWOOOMP...',x,y-102,CREAM,2); }
  // Once he has looked at it, the gadget lies on the box.
  if(ms>P.rc0) gadget(x,y-66,1.4,0,Math.PI/2);
  // The receipt unrolls from his hand to the floor and piles up.
  if(ms>P.rc0&&P.st&&P.st.x!=null) { const h={x:P.st.x-24,y:head(P.st).y-18},top=h.y+2,fl=P.floor,L=ez((ms-P.rc0)/(P.rc1-P.rc0))*(fl-top+90),hang=Math.min(L,fl-top),pile=Math.max(0,L-hang);
    R(h.x-9,top,18,hang+2,OUT); R(h.x-7,top,14,hang,'#ffffff'); for(let k=0;k<hang/9;k++) R(h.x-5,top+4+k*9,6+((k*3)%5),2,'#9aa0aa');
    for(let k=0;k<Math.min(6,pile/14);k++) { gfx.save(); gfx.translate(h.x-10+k*7,fl-4-(k%2)*4); gfx.rotate(k%2?.5:-.4); RO(-9,-3,18,6,'#ffffff'); gfx.restore(); }
    if(L>30) bigWord('$1499.99',h.x-46,top+6,RED,2); } };
const gadget=(x,y,sc,ms,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot!=null?rot:Math.sin(ms*.008)*.06); gfx.scale(sc,sc); rrO(-12,-19,24,38,4,'#1a1b20'); R(-10,-17,20,34,'#2c2f36');
  EO(-3,-10,7,7,'#3a3d46'); E(-5,-12,2.2,2.2,'#0b0c10'); E(-1,-12,2.2,2.2,'#0b0c10'); E(-5,-8,2.2,2.2,'#0b0c10'); E(-1,-8,1.4,1.4,'#e8e0a0'); gfx.restore(); };
SC.t3_gadget=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(!st||st.x==null||ms<P.up||ms>P.rc0) return; const q=ez((ms-P.up)/250),h=hand(),p=head(st,-44);
  const x=lerp(h.x,p.x,q),y=lerp(h.y,p.y,q); gfx.globalAlpha=1; gadget(x,y,2.2,ms); for(let k=0;k<5;k++) { const a=ms*.005+k*1.25; star(x+Math.cos(a)*50,y+Math.sin(a)*28,4+Math.sin(ms*.02+k)*2,k%2?'#ffffff':GOLD,a); } };
Tm.overpriced_gadget=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m),dee=B2.party.find(p=>p.id==='deedee'&&b2Alive(p));
  const px=foe?Math.min(548,U[0].x+U[0].w*.5+130):Math.max(250,Math.min(...U.map(q=>q.x-q.w*.5))-4),py=foe?Math.min(316,U[0].base+3):Math.min(314,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+14);
  const set=950,lid0=1250,lid1=2150,up=2400,hit=2600,rc0=3000,rc1=3700,look=3800,done=4400;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(px,me)},{t:900,x:px,y:py,f:'kneel'},{t:lid0,f:'kneel',dy:(u,tt)=>Math.sin(tt*3)*1},{t:lid1,f:'kneel'},{t:up,f:'celeb',hop:8,hn:2},{t:rc0,f:'expr'},{t:look,f:'expr',dx:(u,tt)=>u<.5?0:-2},{t:done,f:'idle'},{t:done+100,f:back(px,me)},{t:done+900,x:'home',y:'home',f:'idle'}]);
  const plan={x:px-64,y:py,set,lid0,lid1,up,rc0,rc1,done,floor:Math.min(320,py+4),st};
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Tom brings '+foe.name+' a very expensive box.':'Tom kneels down. A huge matte-black box lands in front of him.'); say2(m.id,'overpriced_gadget'); scene('t3_gbox',(done+250)/1000,{plan}); scene('t3_gadget',(done+50)/1000,{plan}); }],
    [set,()=>{ S('thud'); scene('t3_text',1.1,{x:px-64,y:py-112,txt:'MAX CHIP',c:'#c8ccd6',sc:2}); }],
    [lid0,()=>{ setMessage('The lid slides off by itself. Very slowly. He doesn\'t help it.'); S('whoosh'); }],
    [lid1,()=>{ (sfx.fanfare||sfx.levelUp)(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('ding'); S('heal'); scene('t3_big',1.4,{x:288,y:52,txt:'RETAIL THERAPY',c:GOLD,sc:3}); for(const u of who) { const q=ST.unit(u); scene('t3_glow',.9,{x:q.x,y:q.mid,c:GOLD,rx:32,ry:44}); scene('t3_hearts',1,{x:q.x,y:q.top}); hopOf(u!==m?u:null); }
      setMessage(foe?foe.name+' gets to hold it. Two hands.':'Everyone looks at it. The joy is real. The battery is full.'); }],
    ...(dee&&!foe?[[hit+300,()=>{ const q=ST.unit(dee); scene('t3_text',1,{x:q.x,y:q.top-16,txt:'WARM CRUST',c:'#f3c37a',sc:1}); }]]:[]),
    [rc0,()=>{ S('beep'); for(let k=0;k<6;k++) b7Later(()=>S('click'),k*110); setMessage('The receipt prints. And prints. And prints.'); }],
    [look,()=>{ scene('t3_text',1.4,{st,txt:'WORTH IT.',c:CREAM,sc:3,dy:16}); setMessage('He reads the total. He nods slowly.'); }],
    [done+1000,'end',foe?kindLine(foe):'Did he need it? No. Is he keeping the box? Yes.']]); };

// ---------- Seat 1A, Peasants (A5) ----------
// A BOARDING GROUP 5 sign pops over the enemy row. Tom walks up with a little remote. BZZZ: a tall navy Delta One privacy
// door slides across the row and SLAMS shut (the hit), DO NOT DISTURB light on. The motorized shade whirs down behind
// it. The door slides back on dazed monsters. He tucks the most hurt friend under a plush duvet and a pillow (Guarded),
// then lies flat himself for a second, eye mask on.
SC.t3_group5=(s,u)=>{ const a=fin(u,.08)*fade(u,.85),x=s.x,y=s.y; gfx.globalAlpha=a; gfx.save(); gfx.translate(x,y+Math.sin(s.t*4)*2); RO(-74,-18,148,36,'#2050a0'); label('BOARDING',0,-13,CREAM,2); label('GROUP 5',0,1,GOLD,2); gfx.restore(); };
SC.t3_suite=(s,u)=>{ const ms=s.t*1000,P=s.plan,x0=P.x0,x1=P.x1,top=P.top+44,bot=P.bot,W=x1-x0;
  const show=ez(ms/250)*(ms>P.gone?1-ez((ms-P.gone)/300):1); if(show<=0) return; gfx.globalAlpha=show;
  // The privacy door slides in from the right edge of the row.
  let c; if(ms<P.d0) c=0; else if(ms<P.slam) c=ez((ms-P.d0)/(P.slam-P.d0)); else if(ms<P.open) c=1; else c=1-ez((ms-P.open)/400);
  if(c>0) { const dw=W*c,dx=x1-dw; RO(dx,top,dw,bot-top,NAVY); for(let k=0;k<5;k++) { const yy=top+64+k*((bot-top-70)/5); if(dw>16) R(dx+6,yy,dw-12,3,NAVY2); }
    if(dw>60) { RO(dx+10,top+8,36,20,'#c9a23a'); label('1A',dx+28,top+13,INK,2); E(dx+dw-14,top+16,5,5,ms>P.slam&&Math.floor(ms/250)%2?RED:'#5a1a14'); RO(dx+dw-14,(top+bot)/2,6,26,GREY2);
      // The window in the door, and its motorized shade.
      const wx=dx+dw/2,wy=top+44,ww=Math.min(64,dw-70),wh=34; if(ww>20) { rrO(wx-ww/2,wy-wh/2,ww,wh,10,'#bfe8ff'); E(wx-8,wy-6,10,4,'#ffffff');
        const sh=ms<P.shade?0:ms<P.open?ez((ms-P.shade)/600):1-ez((ms-P.open)/300); R(wx-ww/2+2,wy-wh/2+2,ww-4,(wh-4)*sh,'#e8e2d4'); for(let k=1;k<4;k++) if((wh-4)*sh*k/4>2) R(wx-ww/2+2,wy-wh/2+2+(wh-4)*sh*k/4,ww-4,1,'#c9c0ae');
        if(ms>P.shade&&ms<P.shade+800) bigWord('WHIRRR',wx,wy+26,CREAM,2); } } }
  if(ms>P.d0&&ms<P.slam) bigWord('BZZZ',Math.min(560,x1+20),top+40,CREAM,2); };
SC.t3_duvet=(s,u)=>{ const ms=s.t*1000,H=s.H,a=ez(ms/350); gfx.globalAlpha=fade(u,.9); const w=H.w+18,full=s.lie?H.h:H.h*.62,h=full*a,x=H.x-w/2+(s.dx||0),y=H.base+2-h;
  rrO(x,y,w,h,8,'#6c8ae0'); for(let k=1;k<4;k++) R(x+4,y+k*h/4,w-8,2,'#5a76c8'); for(let k=1;k<3;k++) R(x+k*w/3,y+4,2,Math.max(0,h-8),'#5a76c8'); R(x,y,w,Math.min(9,h),'#f4f0ff'); for(let k=0;k<3;k++) star(x+10+k*(w-20)/2,y+h*.55,3,'#ffffff'); };
SC.t3_mask=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; gfx.globalAlpha=fade(u,.85); const p={x:st.x+(s.lie?TH()*.36:-4),y:s.lie?st.y-18:head(st).y-2}; RO(p.x-12,p.y-4,24,8,'#3a2a5a'); R(p.x-10,p.y-2,8,4,'#5a4a8a'); R(p.x+2,p.y-2,8,4,'#5a4a8a');
  for(let k=0;k<3;k++) { const q=((s.t*.8)+k/3)%1; gfx.globalAlpha=Math.sin(q*Math.PI); label('Z',p.x+12+q*16+k*4,p.y-14-q*26,CREAM,2+(k%2)); } };
Tm.seat_1a=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,64);
  const L=lowest(),LU=L?ST.unit(L):null,selfL=L===m,d0=1250,slam=1950,shade=2050,open=3000,gone=3500;
  const x0=Math.max(4,Gp.x0-16),x1=Math.min(572,Gp.x1+16),top=Math.max(4,Gp.top-70),bot=Math.min(322,Gp.base+10);
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:1150,f:'act',dx:-4},{t:slam-150,f:'act',dx:-8},{t:slam+250,f:'expr'},{t:2700,f:'idle'}];
  let tuck=3300,end,lie;
  if(LU&&!selfL) { const tx=Math.max(220,LU.x-LU.w*.5-18); K.push({t:2800,f:tx>p.x?'walkR':'walk'},{t:tuck,x:tx,y:LU.base+4,f:'flip',dx:u=>Math.sin(u*Math.PI)*6},{t:tuck+600,f:'flip'},{t:tuck+700,f:me.x>tx?'walkR':'walk'},{t:tuck+1300,x:'home',y:'home',f:'idle'}); lie=tuck+1350; }
  else { K.push({t:2800,f:back(p.x,me)},{t:3600,x:'home',y:'home',f:'idle'}); tuck=3650; lie=3650; }
  const dy=TH()/2-16; K.push({t:lie,f:'idle',rot:u=>ez(u/.4)*Math.PI/2,dy:u=>ez(u/.4)*dy,dx:u=>-ez(u/.4)*28},{t:lie+1300,f:'idle',rot:u=>(1-ez(u))*Math.PI/2,dy:u=>(1-ez(u))*dy,dx:u=>-(1-ez(u))*28},{t:lie+1650,f:'idle'});
  end=lie+1750;
  const st=ST.keys(fx,K),plan={x0,x1,top,bot,d0,slam,shade,open,gone};
  ST.play(E2,[
    [0,()=>{ setMessage('Now boarding: Group 5. Tom isn\'t in Group 5.'); say2(m.id,'seat_1a'); scene('t3_group5',(open-200)/1000,{x:(x0+x1)/2,y:top+18}); scene('t3_suite',(gone+320)/1000,{plan}); }],
    [1150,()=>{ S('beep'); setMessage('He presses one button on a little remote.'); }],
    [d0,()=>{ S('whoosh'); }],
    ['hf',slam],
    [slam,()=>{ S('thud'); S('bonk'); for(const f of list) ST.jolt(f,.45); landHit(100); scene('t3_big',1.2,{x:Math.min(560,x1+40),y:top+80,txt:'SLAM!',c:CREAM,sc:4}); }],
    [shade,()=>{ S('charge'); setMessage('The privacy door is shut. The shade comes down. Seat 1A.'); }],
    [open,()=>{ S('whoosh'); }],
    [tuck,()=>{ E2.apply(); S('select'); if(LU) { const H=selfL?me:LU; if(selfL) scene('t3_duvet',(end-tuck)/1000,{H:{x:me.x-28+TH()*.1,w:TH()*.85,h:26,base:me.base},lie:true}); else { scene('t3_duvet',1.8,{H:LU}); scene('t3_text',1.3,{x:LU.x,y:LU.top-22,txt:'TUCKED IN',c:'#c8d8ff',sc:2}); } } setMessage(L?(selfL?'He tucks himself in. Duvet. Lie flat.':'He tucks '+L.name+' in under a plush duvet. Guarded.'):'Lights down.'); }],
    [lie,()=>{ S('select'); scene('t3_mask',1.3,{st,lie:true}); scene('t3_text',1.2,{x:me.x,y:me.top-30,txt:'LIE FLAT',c:'#c8d8ff',sc:2}); }],
    [end,'end',res(E2)+'Wait your turn, Group 5.']]); };

// ---------- 10-Step Skincare (B3) ----------
// The battle PAUSES: the screen goes grey, a PAUSED banner. Tom walks to the friend with a tray of bottles and runs the
// routine: STEP 1/10 CLEANSE ... 10/10 SPF, a bottle popping up each time. A glowing red LED mask goes on (the heal and
// +1 VP). A 20:00 timer races down to 0:00. Mask off, sparkles: PORES IMMACULATE. Unpause.
const STEPS=['CLEANSE','OIL','TONER','ESSENCE','SERUM','AMPOULE','SHEET','EYE','MOIST','SPF'];
SC.t3_pause=(s,u)=>{ const ms=s.t*1000,a=ez(ms/250)*(ms>s.off?1-ez((ms-s.off)/300):1); if(a<=0) return; gfx.globalAlpha=a*.42; R(0,0,576,324,'#6a6a6a');
  gfx.globalAlpha=a; RO(208,8,160,30,INK); R(222,15,6,16,CREAM); R(232,15,6,16,CREAM); label('PAUSED',306,16,CREAM,3); };
const bottle=(x,y,sc,k)=>{ const c=['#ffd0e0','#c8f0ff','#fff4c0','#d8c8ff','#c8ffd8'][k%5]; gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); RO(-5,-10,10,16,c); RO(-3,-15,6,5,k%2?'#3a3d46':'#c9a23a'); R(-3,-4,6,4,'#ffffff'); gfx.restore(); };
SC.t3_routine=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.r0||ms>P.mask) return; const n=Math.min(10,1+Math.floor((ms-P.r0)/P.step)),x=P.x,y=P.y; gfx.globalAlpha=1;
  bigWord('STEP '+n+' OF 10',x,y-30,CREAM,3); bigWord(STEPS[n-1],x,y-8,PINK,2);
  const q=((ms-P.r0)%P.step)/P.step; bottle(P.fx+30+Math.sin(n*2.1)*8,P.fy+10-q*26,2.4,n); };
SC.t3_led=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.mask||ms>P.off+300) return; const on=ez((ms-P.mask)/200),off=ms>P.off?ez((ms-P.off)/300):0,x=P.fx,y=P.fy-off*40;
  gfx.globalAlpha=(1-off); const pulse=.5+Math.sin(ms*.012)*.2; gfx.globalAlpha=(1-off)*pulse*.5; E(x,y,46,46,'#ff3a3a'); gfx.globalAlpha=(1-off)*pulse*.35; E(x,y,72,66,'#ff6a5a');
  gfx.globalAlpha=1-off; gfx.save(); gfx.translate(x,y-(1-on)*30); rrO(-17,-20,34,40,10,'#f4f4f6'); R(-11,-8,8,4,INK); R(3,-8,8,4,INK);
  for(let r=0;r<5;r++) for(let c=0;c<4;c++) { if(r===1) continue; const lx=-10+c*6.7,ly=-15+r*7; E(lx,ly,1.8,1.8,Math.sin(ms*.02+r+c)>-.3?'#ff2a2a':'#a01a1a'); } gfx.restore();
  if(ms>P.t0&&ms<P.off) { const secs=Math.max(0,Math.round(1200*(1-cl((ms-P.t0)/(P.off-P.t0-150))))),mm=Math.floor(secs/60),ss=secs%60; bigWord(mm+':'+(ss<10?'0':'')+ss,x,y-72,ms>P.off-200?'#7dff8a':CREAM,3); } };
Tm.skincare_10=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foeT=t.side==='foe',sp=foeT?spotFor(m,t,30):{x:Math.max(220,H.x-H.w*.5-20),y:Math.min(316,H.base+4)},A=foeT?'act':'flip',X=foeT?'expr':'flip',sg=foeT?-1:1;
  const r0=1100,step=150,mask=r0+10*step+100,hit=mask+150,t0=mask+400,off=t0+1300,end=self?off+900:off+1700;
  const fxX=H.x-(t.side==='foe'?0:3),fyY=self?faceY(m,me):faceY(t,H);
  const K=self?[{t:0,x:'home',y:'home',f:'expr'},{t:r0,f:'act',dx:(u,tt)=>Math.sin(tt*20)*2},{t:mask,f:'expr'},{t:t0,f:'idle',dy:(u,tt)=>Math.abs(Math.sin(tt*5))*-2},{t:off,f:'celeb'},{t:off+500,f:'idle'},{t:off+800,f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:1000,x:sp.x,y:sp.y,f:X},{t:r0,f:A,dx:(u,tt)=>sg*4+Math.sin(tt*20)*3},{t:mask,f:X,dx:sg*6},{t:t0,f:X,dy:(u,tt)=>Math.abs(Math.sin(tt*5))*-2},{t:off,f:foeT?'celeb':'flip',hop:6},{t:off+500,f:X},{t:off+700,f:back(sp.x,me)},{t:off+1550,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),plan={r0,step,mask,off,t0,x:cl(fxX,90,486),y:Math.max(60,H.top-28),fx:fxX,fy:fyY};
  ST.play(E2,[
    [0,()=>{ setMessage('Tom pauses the battle. Everyone freezes. It\'s skincare time.'); say2(m.id,'skincare_10'); S('menuOpen'); scene('t3_pause',(off+600)/1000,{off:off+200}); scene('t3_routine',(mask+50)/1000,{plan}); scene('t3_led',(off+350)/1000,{plan}); }],
    [r0,()=>{ setMessage('Ten steps. In order. He has a tray.'); }],
    ...STEPS.map((_,k)=>[r0+k*step,()=>S('select')]),
    [mask,()=>{ S('charge'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); S('levelChime'); scene('t3_text',1.3,{x:H.x+30,y:H.mid,txt:'+1 VP',c:SKY,sc:2}); hopOf(t!==m?t:null); }],
    [t0,()=>{ setMessage('The red-light mask needs twenty minutes. Everyone waits.'); for(let k=0;k<8;k++) b7Later(()=>S('click'),k*150); }],
    [off,()=>{ S('ding'); scene('t3_spark',1.1,{x:fxX,y:fyY,r:30,n:8}); scene('t3_big',1.4,{x:H.x,y:Math.max(46,H.top-46),txt:'PORES: IMMACULATE',c:'#ffe0ec',sc:3}); }],
    [off+250,()=>{ S('menuClose'); }],
    [end,'end',kindLine(t,'Glowing. Hydrated. Back to the fight.')]]); };

// ---------- Know-It-All (B5) ----------
// Every monster says something wrong in a speech bubble (BREAD IS EASY, PLANES ARE SLOW...). Tom walks up and raises one
// finger: UMMM... ACTUALLY. Big red FACT CHECK stamps slam onto each monster one by one (FALSE, a red X): each stamp
// hits. They go red with embarrassment and forget what they were winding up. WRONG.
const CLAIMS=['BREAD IS EASY','PLANES ARE SLOW','I AM SCARY','1+1=3','KANJI IS EASY'];
SC.t3_claim=(s,u)=>{ const ms=s.t*1000,a=fin(u,.06)*(ms>s.gone?1-ez((ms-s.gone)/200):1); if(a<=0) return; const w=(s.txt.length*4-1)*2+20,x=cl(s.x,w/2+6,570-w/2),y=Math.max(30,s.y);
  gfx.globalAlpha=a; rrO(x-w/2,y-16,w,24,8,'#ffffff'); poly([[x-6,y+8],[x+6,y+8],[x,y+18]],'#ffffff'); label(s.txt,x,y-9,INK,2); };
SC.t3_stamp=(s,u)=>{ const q=u<.12?ez(u/.12):1,sc=lerp(1.8,.82,q),a=fade(u,.75); gfx.globalAlpha=a; gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.18); gfx.scale(sc,sc);
  gfx.globalAlpha=a*.55; R(-60,-28,120,56,'#ffffff'); gfx.globalAlpha=a; gfx.strokeStyle=OUT; gfx.lineWidth=9; gfx.strokeRect(-60,-28,120,56); gfx.strokeStyle=RED; gfx.lineWidth=5; gfx.strokeRect(-60,-28,120,56); label('FACT CHECK',0,-21,RED,2); R(-50,-7,100,3,RED); label('FALSE',0,0,RED,4); gfx.restore(); };
SC.t3_blush=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.75); for(const F of s.list) { E(F.x-F.w*.22,F.top+F.h*.42,8,4,'#ff6a7a'); E(F.x+F.w*.12,F.top+F.h*.42,8,4,'#ff6a7a'); EO(F.x+F.w*.36,F.top+10-ez(u)*6,4,6,'#9fe8ff'); } };
Tm.know_it_all=E2=>{ const {m,fx}=E2,list=foes(E2).length?foes(E2):b2LiveFoes(),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,72),n=list.length;
  const c0=900,fing=1700,s0=2300,gap=n>1?Math.min(330,900/(n-1)):0,last=s0+gap*(n-1),blush=last+250,end=last+2100;
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:900,x:p.x,y:p.y,f:'expr'},{t:fing,f:'act',dx:-4,dy:-2},{t:s0-100,f:'expr'}];
  list.forEach((_,k)=>K.push({t:s0+k*gap-60,f:'act',dx:u=>-Math.sin(u*Math.PI)*10}));
  K.push({t:last+300,f:'expr'},{t:last+1100,f:'idle'},{t:last+1200,f:back(p.x,me)},{t:last+2000,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),FS=list.map(f=>ST.foe(f));
  ST.play(E2,[
    [0,()=>{ setMessage('The monsters start saying things. Wrong things.'); say2(m.id,'know_it_all'); }],
    ...list.map((f,k)=>[c0+k*180,()=>{ const F=FS[k]; S('talk',k*3+1); scene('t3_claim',(s0+k*gap-c0-k*180+150)/1000,{x:F.x,y:F.top-22,txt:CLAIMS[(k+(f.idx||0))%CLAIMS.length],gone:s0+k*gap-c0-k*180}); }]),
    [fing,()=>{ S('select'); scene('t3_text',1.1,{st,txt:'UMMM...',c:CREAM,sc:2,dy:6}); setMessage('Tom raises one finger.'); }],
    [fing+550,()=>{ scene('t3_text',1.0,{st,txt:'ACTUALLY',c:GOLD,sc:3,dy:10}); }],
    ['hf',s0],
    ...list.map((f,k)=>[s0+k*gap,()=>{ const F=FS[k]; S('thud'); S('stun'); ST.jolt(f,.5); landHit(k===n-1?100-Math.floor(100/n)*(n-1):Math.floor(100/n)); scene('t3_stamp',1.4,{x:F.x,y:F.mid-6}); if(k===0) setMessage('FACT CHECK. FACT CHECK. FACT CHECK.'); }]),
    [blush,()=>{ S('nope'); scene('t3_blush',1.5,{list:FS}); scene('t3_big',1.3,{x:Gp.x,y:Math.max(44,Gp.top-54),txt:'WRONG!',c:RED,sc:4}); setMessage('So embarrassed they forget what they were doing.'); }],
    [end,'end',res(E2)+'He has a source for that. Several.']]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Noise-Canceling: huge headphones, and the monster's sound wave is drawn as a big red wave that gets cut off mid-air
// (MUTED) when the ANC kicks in. Flashcard Flurry: bigger cards, one readable kana on each (KU, SHI, TSU, HE, I, KO).
// Same numbers, same beats. Overrides SC.tv_phones, SC.tv_noise and Tm.flashcard_flurry. Scenes prefix tp_.
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
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const Tm=RECRUIT_MOVES.tom;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',FIRE='#ff8a3a',GREY2='#8c929c',INK='#1b1b22',BLUE='#5c8fe0',GREEN='#9be39a';
ST.nw('tp_');
const S=k=>{ if(sfx[k]) sfx[k](); };
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tom,TH=()=>TSP().idle.length*TSP().scale;
const go=(x,me)=>x<me.x?'walk':'walkR';
const back=(x,me)=>x<me.x?'walkR':'walk';

// ---------- Noise-Canceling: huge headphones, the sound wave cut off mid-air ----------
const phones=(x,y,sc,on)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.strokeStyle=OUT; gfx.lineWidth=8; gfx.beginPath(); gfx.arc(0,0,16,Math.PI*1.05,Math.PI*1.95); gfx.stroke();
  gfx.strokeStyle='#3a3f46'; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(0,0,16,Math.PI*1.05,Math.PI*1.95); gfx.stroke(); RO(-22,-5,10,17,'#3a3f46'); RO(12,-5,10,17,'#3a3f46'); R(-20,-3,3,13,GREY2); R(19,-3,3,13,GREY2); E(17,10,1.8,1.8,on?'#7dff8a':'#555'); gfx.restore(); };
SC.tv_phones=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(!st||st.x==null) return; gfx.globalAlpha=1;
  const top={x:st.x-2,y:st.y-TH()*(st.sc||1)+20}; let x,y,sc;
  if(ms<P.lift) { const h=hand(); x=h.x-6; y=h.y-4; sc=1.4; } else if(ms<P.on) { const q=ez((ms-P.lift)/(P.on-P.lift)),h=hand(); x=lerp(h.x-6,top.x,q); y=lerp(h.y-4,top.y,q)-Math.sin(q*Math.PI)*24; sc=lerp(1.4,2.1,q); } else { x=top.x; y=top.y; sc=2.1; }
  phones(x,y,sc,ms>P.click); if(ms>P.click&&ms<P.click+900) bigWord('ANC ON',top.x,top.y-62,'#7dff8a',3); };
SC.tv_noise=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F,st=P.st,mx=F.x+F.w*.3,my=F.mid-F.h*.15;
  const tx=st&&st.x!=null?st.x-26:mx+180,ty=st&&st.x!=null?st.y-TH()*.7:my;
  const grow=ez(ms/700),cutX=lerp(mx,tx,.55),cut=ms>P.quiet,dq=cut?cl((ms-P.quiet)/700):0;
  const end=cut?cutX:lerp(mx,tx,grow); if(dq>=1&&cut) {} else {
    const pts=[]; for(let x=mx;x<=end;x+=4) { const k=(x-mx)/Math.max(1,tx-mx),amp=cut?14*(1-dq):14+Math.sin(ms*.02)*3; pts.push([x,lerp(my,ty,k)+Math.sin(x*.12-ms*.03)*amp+(cut?dq*dq*60:0)]); }
    if(pts.length>1) { gfx.globalAlpha=cut?1-dq:fade(u,.9); for(const [w,c] of [[11,OUT],[6,cut?'#aaaaaa':RED],[2,cut?'#dddddd':'#ffb0a0']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineJoin='round'; gfx.lineCap='round'; gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.stroke(); } } }
  if(!cut) ['BLAH','YAP','BLAH','NAG'].forEach((w,k)=>{ const q=((ms/900)+k/4)%1; gfx.globalAlpha=Math.sin(q*Math.PI); bigWord(w,mx+20+q*90,my-34-k*12+Math.sin(q*6)*4,k%2?'#ffb0a0':CREAM,3); });
  if(cut&&ms<P.quiet+900) { const q=(ms-P.quiet)/900,cy=lerp(my,ty,.55); gfx.globalAlpha=1-q; star(cutX,cy,18+q*14,'#ffffff',q*2); bigWord('MUTED',cutX,cy-46,'#8fd0ff',3); }
  if(cut) { const q=ez((ms-P.quiet)/600); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(F.x-F.w*.5-8,F.mid); const k=lerp(.4,1.6,Math.min(1,q*1.4)); gfx.scale(k,k);
    R(-18,-7,10,14,OUT); R(-16,-5,6,10,CREAM); poly([[-10,-7],[2,-16],[2,16],[-10,7]],CREAM); LnO(8,-8,22,8,4,RED); LnO(22,-8,8,8,4,RED); gfx.restore(); } };

// Tom now stands well back from the monster so the wave has room to cross (and be cut).
Tm.noise_canceling=E2=>{ const {m,fx}=E2,f=(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t),F=ST.unit(f),me=ST.unit(m),p={x:Math.min(560,Math.max(F.x+F.w*.5+150,Math.min(me.x-20,F.x+F.w*.5+190))),y:Math.min(316,F.base+3)};
  const lift=1050,on=1500,click=1650,quiet=1900,hit=2150;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:950,x:p.x,y:p.y,f:'expr'},{t:lift,f:'act',dx:-3},{t:on,f:'expr'},{t:click,f:'act',dx:-4},{t:quiet,f:'idle'},{t:2500,f:'idle',rot:(u,tt)=>Math.sin(tt*2.4)*.05},{t:3500,f:back(p.x,me)},{t:4300,x:'home',y:'home',f:'idle'}]);
  const plan={F,st,lift,on,click,quiet};
  ST.play(E2,[
    [0,()=>{ setMessage(f.name+' won\'t stop yelling. Tom walks over anyway.'); say(m.id,'noise_canceling'); scene('tv_noise',3.9,{plan}); scene('tv_phones',4.4,{plan}); }],
    [lift,()=>{ setMessage('He takes out his big flight headphones. He puts them on.'); S('whoosh'); }],
    [click,()=>{ S('select'); }],
    [quiet,()=>{ scene('tv_hush',.7,{x:p.x-10,y:p.y-TH()*.6,r:Math.max(140,p.x-F.x+60)}); (sfx.charge||sfx.whoosh)(); setMessage('The noise is cut off mid-air.'); }],
    ['hf',hit],
    [hit,()=>{ S('thud'); ST.jolt(f,.5); landHit(100); scene('tv_big',1.2,{x:F.x,y:F.top-74,txt:'SILENCE',c:'#8fd0ff',sc:4}); }],
    [2500,()=>{ scene('tv_text',1.2,{st,txt:'AHH',c:CREAM,dy:30}); setMessage('Tom closes his eyes. Total quiet. Just like seat 1A.'); }],
    [4400,'end',res(E2)+'The noise has been canceled.']]); };

// ---------- Flashcard Flurry: small cards, one real kanji each (sun, moon, fire, water, tree, mountain) ----------
// Strokes are drawn by hand (no font needed) in a -.5 to .5 box; the meaning pops up when a card sticks.
const KANA=[['SUN',[[[-.3,-.5],[.3,-.5],[.3,.5],[-.3,.5],[-.3,-.5]],[[-.3,0],[.3,0]]]],
  ['MOON',[[[-.3,-.5],[-.3,.45],[-.42,.55]],[[-.3,-.5],[.3,-.5],[.3,.42],[.2,.54]],[[-.3,-.1],[.3,-.1]],[[-.3,.2],[.3,.2]]]],
  ['FIRE',[[[-.2,-.28],[-.38,.02]],[[.2,-.28],[.38,.02]],[[.02,-.52],[-.12,.0],[-.46,.5]],[[-.04,-.05],[.22,.2],[.5,.5]]]],
  ['WATER',[[[0,-.55],[0,.5],[-.12,.56]],[[-.46,-.1],[-.1,-.1],[-.44,.42]],[[.32,-.3],[.1,-.05]],[[.1,.05],[.5,.45]]]],
  ['TREE',[[[-.5,-.2],[.5,-.2]],[[0,-.55],[0,.5]],[[-.1,-.05],[-.45,.45]],[[.1,-.05],[.45,.45]]]],
  ['MOUNTAIN',[[[-.45,.45],[.45,.45]],[[-.45,-.1],[-.45,.45]],[[0,-.52],[0,.45]],[[.45,-.1],[.45,.45]]]]];
const card=(x,y,sc,k,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot||0); gfx.scale(sc,sc); RO(-13,-17,26,34,CREAM); R(-13,11,26,6,'#d8e8ff');
  gfx.strokeStyle=INK; gfx.lineWidth=2.3; gfx.lineCap='round'; gfx.lineJoin='round'; for(const pts of KANA[k%6][1]) { gfx.beginPath(); pts.forEach(([a,b],i)=>{ const px=a*20,py=b*20-3; i?gfx.lineTo(px,py):gfx.moveTo(px,py); }); gfx.stroke(); }
  gfx.restore(); };
SC.tp_deck=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.94); const left=Math.max(0,P.n-Math.floor(Math.max(0,ms-P.c0)/P.step)); for(let k=Math.min(3,left);k>0;k--) card(h.x-10-k*2,h.y-14-k*2,1.1,(P.n-left+k-1)%6,0); };
SC.tp_stuck=(s,u)=>{ gfx.globalAlpha=fade(u,.7); card(s.x,s.y,1.3,s.k,s.rot); if(u<.55) { gfx.globalAlpha=1-u/.55; bigWord(KANA[s.k%6][0],s.x,s.y-34,CREAM,2); } };
Tm.flashcard_flurry=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),me=ST.unit(m),all=b2LiveFoes(),Gp=ST.group(all),kind=!!(B2.move&&B2.move.kindOnFoe);
  const sx=Math.max(Gp.x1+70,Math.min(me.x-40,Gp.x1+150)),sy=Math.min(316,me.base+6),n=6,c0=1150,step=190;
  const order=[]; for(let k=0;k<n-1;k++) order.push(all[k%all.length]); order.push(t);
  const K=[{t:0,x:'home',y:'home',f:go(sx,me)},{t:800,x:sx,y:sy,f:'expr'}];
  for(let k=0;k<n;k++) K.push({t:c0+k*step-40,f:'act',dx:u=>-Math.sin(u*Math.PI)*8});
  K.push({t:c0+n*step,f:'expr'},{t:3300,f:'idle'},{t:3400,f:back(sx,me)},{t:4100,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K); const reveal=c0+n*step+350;
  const throws=order.map((o,k)=>[c0+k*step,()=>{ const O=ST.unit(o),h=hand(),rot=(k%2?-.25:.25),ox=((k*17)%28)-14,oy=((k*11)%18)-9; S('whoosh'); ST.fly((x,y,uu)=>card(0,0,1.3,k,uu*9),h.x-10,h.y-14,O.x+ox,O.mid+oy,.26,30);
    b7Later(()=>{ S('select'); ST.jolt(o,.18); scene('tp_stuck',1.3,{x:O.x+ox,y:O.mid+oy,k,rot}); },260); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom steps out with a deck of kanji flashcards.'); say(m.id,'flashcard_flurry'); scene('tp_deck',(c0+n*step+200)/1000,{plan:{c0,step,n}}); scene('tv_q',3.5,{x:Math.min(560,F.x+F.w*.5+24),y:F.mid-16,flip:reveal,kind}); }],
    [900,()=>{ scene('tv_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'POP QUIZ!',c:CREAM,sc:3}); S('select'); }],
    [c0,()=>{ setMessage(kind?'Flashcards for everybody. '+t.name+' gets the easy ones.':'Sun. Moon. Fire. Water. Tree. Mountain. No peeking.'); }],
    ...throws,
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); S('ding'); ST.jolt(t,.2); scene('tv_big',1.3,{x:F.x,y:F.top-74,txt:kind?'GOOD JOB!':'WEAK SPOT!',c:GOLD,sc:3}); }],
    [4200,'end',kind?kindLine(t):'Pencils down. The answers are showing.']]); };
// ---------- Button Mash (basic), rebuilt 2026-10-27: one button, no signal, the controller gets thrown ----------
// Tom stays at his spot. He presses one button on a wireless controller, nothing happens (a little signal icon with a red
// cross), he says it is not connecting, and he throws the controller at the monster. Same numbers: free, +1 VP.
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const ctl=(x,y,sc,rot,lit,led)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot||0); gfx.scale(sc,sc);
  RO(-5,-12,10,5,'#3a3f46'); R(-3,-11,6,2,GREY2);
  const rr=(a,b,w,h,r,c)=>{ gfx.beginPath(); if(gfx.roundRect) gfx.roundRect(a,b,w,h,r); else gfx.rect(a,b,w,h); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
  E(-13,5,6,7,OUT); E(13,5,6,7,OUT); E(-13,5,4.2,5.2,'#6a6f7a'); E(13,5,4.2,5.2,'#6a6f7a'); rr(-18,-8,36,15,5,'#6a6f7a'); R(-16,-6,32,2,GREY2);
  R(-12,-3,5,2,INK); R(-10.5,-4.5,2,5,INK); E(10,-1,2.4,2.4,lit?GOLD:RED); E(14,-3,2,2,'#f0c040'); E(0,-4,1.6,1.6,led?'#ff4a3a':'#5a1a14'); gfx.restore(); };
SC.tp_ctl=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.thr) return; gfx.globalAlpha=1; const h=hand();
  const wind=ms>P.wind?ez((ms-P.wind)/(P.thr-P.wind)):0,press=P.presses.some(t=>ms>t&&ms<t+110),shake=ms>P.ugh&&ms<P.wind?Math.sin(ms*.09)*2:0;
  const x=h.x-8+shake-wind*10,y=h.y-4-wind*16,led=Math.floor(ms/180)%2===0&&ms>P.presses[0];
  ctl(x,y+(press?2:0),1.25,-.3-wind*.7,press,led);
  // The signal icon over the controller: three arcs, a red cross once the presses fail.
  if(ms>P.presses[0]+100&&ms<P.wind) { const sx=x+4,sy=y-26,a=Math.min(1,(ms-P.presses[0]-100)/150); gfx.globalAlpha=a;
    gfx.strokeStyle=CREAM; gfx.lineCap='round'; gfx.lineWidth=2.5; for(let k=1;k<=3;k++) { gfx.beginPath(); gfx.arc(sx,sy+8,k*5,Math.PI*1.2,Math.PI*1.8); gfx.stroke(); } E(sx,sy+8,1.8,1.8,CREAM);
    if(ms>P.presses[1]) { Ln(sx-9,sy-6,sx+9,sy+10,3.5,OUT); Ln(sx+9,sy-6,sx-9,sy+10,3.5,OUT); Ln(sx-9,sy-6,sx+9,sy+10,2,RED); Ln(sx+9,sy-6,sx-9,sy+10,2,RED); } } };
SC.tp_cdown=(s,u)=>{ const q=ez(u/.35); gfx.globalAlpha=fade(u,.7); ctl(s.x+q*s.dx,s.y+Math.abs(Math.sin(q*Math.PI*2))*-8*(1-q)+q*s.dy,1.25,.5+q*1.4,false,false); };
Tm.button_mash=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const presses=[500,900,1300],ugh=1650,wind=2250,thr=2650,fly=360,hit=thr+fly;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'act'},{t:ugh,f:'act',dy:(u,tt)=>Math.sin(tt*30)*-.7},{t:ugh+10,f:'expr'},{t:wind,f:'expr',dx:(u,tt)=>Math.sin(tt*40)*1.5},{t:wind+10,f:'act'},{t:thr,f:'act',dx:u=>ez(u)*8},
    {t:thr+10,f:'act',dx:-8},{t:hit+500,f:'expr'},{t:hit+1300,f:'idle'}]);
  const plan={presses,ugh,wind,thr};
  const taps=presses.map((t,k)=>[t,()=>{ S('select'); if(k===2) S('nope'); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('Tom takes out a wireless controller and presses one button.'); scene('tp_ctl',(thr+80)/1000,{plan}); }],
    ...taps,
    [presses[1]+80,()=>{ scene('tv_text',1.0,{st,txt:'...',c:CREAM,sc:2,dy:6}); }],
    [ugh,()=>{ say(m.id,'button_mash'); setMessage('Nothing. He presses it again. Nothing.'); scene('tv_text',1.2,{st,txt:'UGH.',c:RED,sc:3,dy:10}); }],
    [wind,()=>{ setMessage('Tom winds up.'); }],
    [thr,()=>{ const h=hand(); S('whoosh'); ST.fly((x,y,uu)=>ctl(0,0,1.25,0,false,false),h.x-8,h.y-26,F.x,F.mid,fly/1000,34,0,{spin:3}); }],
    ['hf',hit],
    [hit,()=>{ S('bonk'); S('thud'); ST.jolt(f,.6); landHit(100); scene('tv_big',1.0,{x:F.x,y:F.top-62,txt:'BONK!',c:GOLD,sc:4}); scene('tv_burst',.6,{x:F.x,y:F.mid,n:10,r:46}); scene('tv_ring',.6,{x:F.x,y:F.mid,r:42});
      scene('tp_cdown',1.2,{x:F.x,y:F.mid,dx:-26,dy:F.base-F.mid-6}); setMessage('The controller connects. Just not the way it was meant to.'); }],
    [hit+1700,'end',res(E2)+'It was the Bluetooth.']]); };
})();
