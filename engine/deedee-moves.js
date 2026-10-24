'use strict';
// engine/deedee-moves.js — Deedee's attacks, built from her life: retired registered nurse (Tom says registered nut),
// rhubarb crisp, big Sunday dinners, power walks, cleaning, and a glass of wine now and then.
// Same shape as tnb-moves.js: RECRUIT_MOVES.deedee[key] queues steps and registers scenes (RFX.SC), held items (RFX.HELD) and props (PROP2).
// Also holds her special, MOON & BACK (group hug: +5 HP and +2 MP for everyone).
RECRUIT_MOVES.deedee={};
(function(){
const SC=RFX.SC,HELD=RFX.HELD,{scene,hold,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const rot=(hx,hy,a)=>{ const c=Math.cos(a),s=Math.sin(a); return (x,y)=>[hx+x*c-y*s,hy+x*s+y*c]; };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const appr=(fx,d)=>{ fx.appr=d; fx.apprDur=d; };
const path=(fx,dur,fn)=>{ fx.path={t:0,dur,fn}; return fx.path; };
const hit=E2=>landHit(E2.dmg,E2.crit);
const part=(E2,n,k)=>landHit(Math.max(1,Math.round(E2.dmg/n)),E2.crit&&k===n-1);
const pos=()=>battle.actorPos||{cx:519,base:315,h:120};
const hand=()=>{ const a=battle.actorHand; if(a) return {x:a.n[0]-8,y:a.n[1]-8}; const p=pos(); return {x:p.cx-20,y:p.base-60}; };
const head=()=>{ const m=battle.actorMouth; if(m) return {x:m.x+4,y:m.y-34}; const p=pos(); return {x:p.cx,y:p.base-96}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const confuseMaybe=c=>{ if(!battle.missing&&Math.random()<c) { battle.enemyStunned=2; sfx.stun(); return true; } return false; };
const enemyName=()=>((battle.enemy&&battle.enemy.def&&battle.enemy.def.short)||'Grump');
const later=(ms,f)=>b7Later(()=>{ if(battle.active) f(); },ms);
const D=RECRUIT_MOVES.deedee;
const homeOf=i=>({cx:BATTLE_POS[i].x*3,base:BATTLE_POS[i].base*3});

// A pixel heart, centered on x,y. r is about half its width.
const heart=(x,y,r,c,o=true)=>{
  const p=[]; for(let k=0;k<=24;k++) { const a=k/24*Math.PI*2,hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a)); p.push([x+hx*r/16,y+hy*r/16]); }
  poly(p,c,o); E(x-r*.42,y-r*.38,r*.18,r*.14,'rgba(255,255,255,.55)');
};
// A four-point twinkle.
const twinkle=(x,y,r,c='#fff6c8')=>{ poly([[x,y-r],[x+r*.25,y-r*.25],[x+r,y],[x+r*.25,y+r*.25],[x,y+r],[x-r*.25,y+r*.25],[x-r,y],[x-r*.25,y-r*.25]],c); };

// ================= Sounds =================
const S={
  squeak(){ for(let k=0;k<3;k++) tone({type:'square',f0:1700+k*120,f1:2300+k*120,dur:.07,vol:.07,delay:k*.11,filter:3000}); },
  sparkle(){ [1568,2093,2637,3136].forEach((f,k)=>tone({type:'sine',f0:f,dur:.14,vol:.08,delay:k*.05})); },
  step(){ noise({dur:.05,vol:.18,f0:900,f1:300,type:'lowpass'}); },
  beep(){ tone({type:'square',f0:2400,dur:.06,vol:.06}); },
  pinch(){ tone({type:'sine',f0:1800,f1:2600,dur:.12,vol:.12}); noise({dur:.06,vol:.2,f0:4000,f1:2000,type:'bandpass',q:2}); },
  swish(d=.9){ noise({dur:d,vol:.12,f0:1200,f1:2200,type:'bandpass',q:.8}); },
  bubbles(){ for(let k=0;k<6;k++) tone({type:'sine',f0:500+Math.random()*700,f1:900+Math.random()*900,dur:.06,vol:.07,delay:k*.07}); },
  bubbling(d=1.4){ for(let k=0;k<Math.round(d*8);k++) tone({type:'sine',f0:220+Math.random()*160,f1:320+Math.random()*220,dur:.05,vol:.06,delay:k*.12}); },
  pop(){ noise({dur:.09,vol:.4,f0:2200,f1:500,type:'bandpass',q:1.4}); tone({type:'sine',f0:600,f1:180,dur:.12,vol:.2}); },
  ping(){ tone({type:'triangle',f0:1980,dur:.18,vol:.12}); tone({type:'sine',f0:2970,dur:.12,vol:.05}); },
  pour(d=.8){ noise({dur:d,vol:.08,f0:700,f1:1400,type:'bandpass',q:3}); },
  clink(){ tone({type:'sine',f0:3520,dur:.35,vol:.08}); tone({type:'sine',f0:4186,dur:.3,vol:.05,delay:.01}); },
  bell(){ [0,.26,.52].forEach(d=>{ tone({type:'triangle',f0:1318,dur:.3,vol:.12,delay:d}); tone({type:'sine',f0:2637,dur:.22,vol:.05,delay:d}); }); },
  plate(){ noise({dur:.07,vol:.3,f0:3000,f1:1500,type:'bandpass',q:2}); tone({type:'triangle',f0:1046,dur:.12,vol:.08}); },
  launch(){ tone({type:'square',f0:300,f1:1600,dur:.7,vol:.08,filter:2400,sweep:'linear'}); noise({dur:.7,vol:.12,f0:600,f1:2400,type:'bandpass',q:.6}); },
  fall(){ tone({type:'square',f0:1800,f1:240,dur:.85,vol:.08,filter:2400,sweep:'linear'}); },
  smooch(){ tone({type:'sine',f0:900,f1:1500,dur:.08,vol:.12}); tone({type:'sine',f0:1500,f1:700,dur:.08,vol:.1,delay:.08}); }
};

// ================= Held items =================
// A giant syringe, needle forward. h.push (0..1) is how far the plunger is in.
HELD.dsyringe=(h,u,hx,hy)=>{
  const P=rot(hx,hy,h.ang==null?.05:h.ang),push=h.push||0;
  const q=(pts,c,o)=>poly(pts.map(p=>P(p[0],p[1])),c,o);
  q([[30,-4],[30,4],[-14,4],[-14,-4]],'#c9ccd2',true);           // plunger rod
  q([[34,-11],[34,11],[30,11],[30,-11]],'#9aa0a8',true);           // thumb rest
  q([[12,-11],[12,11],[-44,11],[-44,-11]],'#eef6fb',true);          // barrel
  const fill=lerp(-42,10,push); q([[fill,-9],[fill,9],[-42,9],[-42,-9]],'#ff8fb8');
  q([[fill,-9],[fill,9],[fill+3,9],[fill+3,-9]],'#3d3a44');          // stopper
  for(let k=0;k<5;k++) { const a=P(-36+k*10,-11),b=P(-36+k*10,-6); Ln(a[0],a[1],b[0],b[1],1.5,'#7a8a96'); }
  q([[14,-15],[14,15],[10,15],[10,-15]],'#c9ccd2',true);            // finger flange
  q([[-44,-5],[-44,5],[-52,2],[-52,-2]],'#c9ccd2',true);            // hub
  const n0=P(-52,0),n1=P(-84,0); Ln(n0[0],n0[1],n1[0],n1[1],4,OUT); Ln(n0[0],n0[1],n1[0],n1[1],2,'#e8ecf0');
  const gl=P(-6,-8),gl2=P(-34,-8); Ln(gl[0],gl[1],gl2[0],gl2[1],2,'rgba(255,255,255,.8)');
  h.tx=n1[0]; h.ty=n1[1];
};
// The mop. The head stays on the floor, wherever Deedee is.
HELD.dmop=(h,u,hx,hy)=>{
  const p=pos(),fy=p.base+2,mx=hx-46+Math.sin(h.t*(h.scrub?26:4))*(h.scrub?10:2);
  LnO(hx+12,hy-10,mx,fy-16,5,'#c98a4b'); Ln(hx+11,hy-11,mx+2,fy-18,1.5,'#e8b77a');
  R(mx-17,fy-20,34,7,OUT); R(mx-15,fy-19,30,5,'#3f8fd0');
  for(let k=0;k<12;k++) { const x=mx-18+k*3.4,sw=Math.sin(h.t*30+k)*2; Ln(x,fy-14,x+sw-2,fy+3,4,OUT); Ln(x,fy-14,x+sw-2,fy+2,2,k%2?'#e8eef4':'#c8d4de'); }
};
// A glass baking dish of rhubarb crisp, in two oven mitts.
const crispDish=(x,y,t,steam=true)=>{
  R(x-34,y-12,68,22,OUT); R(x-32,y-10,64,18,'rgba(220,240,255,.55)');
  R(x-30,y-4,60,11,'#c73a5a'); R(x-30,y+2,60,5,'#9e2846');
  for(let k=0;k<5;k++) { const bx=x-24+k*12,by=y-4+Math.sin(t*6+k)*1; E(bx,by,3,2,'#ff6f8f'); }
  for(let k=0;k<9;k++) E(x-28+k*7,y-8+((k*5)%3),5,4,k%2?'#d79a4e':'#e8b46a');
  for(let k=0;k<6;k++) R(x-26+k*10,y-11,3,2,'#f4d38c');
  R(x-36,y-8,4,10,OUT); R(x+32,y-8,4,10,OUT);
  if(steam) for(let k=0;k<3;k++) { const ph=(t*.9+k/3)%1; gfx.globalAlpha=(1-ph)*.6; E(x-16+k*16+Math.sin(ph*9+k)*5,y-18-ph*34,5+ph*4,4+ph*3,'#ffffff'); gfx.globalAlpha=1; }
};
HELD.dcrisp=(h,u,hx,hy)=>{
  const x=hx-18,y=hy-6; crispDish(x,y,h.t);
  for(const mx of [x-36,x+36]) { EO(mx,y-1,7,9,'#e59aa8'); R(mx-5,y+5,10,4,'#c97786'); }
};
// A wine glass. Swirls when h.swirl is set; h.sip tips it toward her mouth.
HELD.dwine=(h,u,hx,hy)=>{
  const x=hx-8,y=hy+2,tip=h.sip?Math.sin(cl((h.t-h.sip[0])/(h.sip[1]-h.sip[0]))*Math.PI)*-.7:0;
  gfx.save(); gfx.translate(x,y+14); gfx.rotate(tip); gfx.translate(-x,-(y+14));
  Ln(x,y+4,x,y+20,5,OUT); Ln(x,y+4,x,y+20,2,'#e8f2f8'); E(x,y+21,9,3,OUT); E(x,y+21,7,2,'#e8f2f8');
  E(x,y-6,12,13,OUT); E(x,y-6,10,11,'rgba(225,240,250,.85)');
  const sw=h.swirl?Math.sin(h.t*10)*2:0; gfx.save(); gfx.beginPath(); gfx.ellipse(x,y-6,10,11,0,0,Math.PI*2); gfx.clip();
  R(x-11,y-3+sw*.3,22,14,'#7a1f3d'); E(x+sw,y-3,10,2.5,'#a8325a'); gfx.restore();
  R(x-6,y-14,2,6,'rgba(255,255,255,.8)');
  gfx.restore();
};
// The dinner bell. Rings while held.
HELD.dbell=(h,u,hx,hy)=>{
  const a=Math.sin(h.t*22)*.5,P=rot(hx-6,hy-14,a);
  const q=(pts,c,o)=>poly(pts.map(p=>P(p[0],p[1])),c,o);
  q([[-3,0],[3,0],[3,14],[-3,14]],'#8a5a30',true);
  q([[-6,-2],[6,-2],[12,-20],[14,-26],[-14,-26],[-12,-20]],'#e8c04a',true);
  q([[-9,-20],[-4,-20],[-6,-24],[-10,-24]],'#fff1a8');
  const c=P(0,-30); E(c[0],c[1],4,4,OUT); E(c[0],c[1],2.6,2.6,'#c9a03e');
};

// ================= Props =================
PROP2.dsign=(q,u)=>{
  poly([[0,-36],[22,28],[-22,28]],'#ffd23a',true); R(-20,26,40,4,OUT);
  label('WET',0,-6,OUT,2); label('FLOOR',0,8,OUT,1);
  // the little slipping person
  E(3,-22,2.5,2.5,OUT); Ln(2,-19,-2,-12,2,OUT); Ln(-2,-12,4,-9,2,OUT); Ln(-2,-12,-6,-8,2,OUT); Ln(0,-17,-5,-19,2,OUT);
};
PROP2.dcrisp=(q,u)=>{ crispDish(0,0,battle.time,false); };
PROP2.dscoop=(q,u)=>{
  EO(0,0,15,13,'#fff8ec'); E(-5,-4,5,4,'#ffffff');
  for(let k=0;k<4;k++) { E(-10+k*7,10+(k%2)*3,3,4,'#fff8ec'); }
  E(2,-14,5,5,OUT); E(2,-14,3.6,3.6,'#e0303a'); Ln(2,-18,6,-25,2,'#4a7a3a'); E(1,-15,1.2,1.2,'#ffd0d0');
};
PROP2.dcork=(q,u)=>{ RO(-6,-4,12,8,'#d8a868'); R(-6,-4,3,8,'#b88848'); R(1,-1,2,2,'#9a6a36'); };
PROP2.dheart=(q,u)=>{ heart(0,0,q.r||9,q.c||'#ff6b9a'); };
// Sunday dinner dishes. q.dish picks one.
const dish=(kind,x,y)=>{
  if(kind==='meatballs') { E(x,y+6,26,8,OUT); E(x,y+6,24,6,'#f4efe0'); E(x,y+2,20,7,'#c8402e'); for(let k=0;k<5;k++) { EO(x-12+k*6,y-1-(k%2)*4,4,4,'#7a4428'); } E(x-6,y-4,3,2,'#f2e6a0'); }
  else if(kind==='lasagna') { RO(x-22,y-8,44,18,'#d8d0c0'); R(x-20,y-6,40,14,'#e8b46a'); for(let k=0;k<3;k++) R(x-20,y-4+k*4,40,2,k%2?'#c8402e':'#f4e6b8'); R(x-20,y-6,40,3,'#f0c870'); E(x-8,y-5,3,2,'#c8402e'); E(x+9,y-6,4,2,'#4a8a3a'); }
  else if(kind==='bread') { poly([[x-24,y+4],[x+24,y-4],[x+26,y+4],[x-22,y+10]],'#d89a4a',true); for(let k=0;k<5;k++) Ln(x-16+k*8,y+5-k*1.6,x-12+k*8,y+1-k*1.6,2,'#9a5a26'); for(let k=0;k<4;k++) E(x-12+k*8,y+3-k*1.5,2,1.5,'#6aa04a'); }
  else if(kind==='chicken') { E(x,y+8,28,7,OUT); E(x,y+8,26,5,'#f4efe0'); EO(x,y-2,17,12,'#d88a3a'); E(x-5,y-6,7,4,'#f0b060'); EO(x+18,y-8,4,7,'#c87830'); E(x+19,y-16,3,3,'#fff6dc'); EO(x-18,y-6,4,6,'#c87830'); E(x-19,y-13,3,3,'#fff6dc'); }
  else if(kind==='gravy') { E(x,y+8,18,5,OUT); E(x,y+8,16,3,'#f4efe0'); poly([[x-14,y+6],[x+10,y+6],[x+12,y-6],[x-12,y-6]],'#f4efe0',true); R(x-12,y-6,24,4,'#8a5a30'); poly([[x-12,y-4],[x-24,y-10],[x-14,y]],'#f4efe0',true); gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(x+14,y,5,-1.4,1.4); gfx.stroke(); }
};
PROP2.ddish=(q,u)=>{ dish(q.dish,0,0); };

// ================= Scenes =================
// The thumb, licked and going in. Rubs back and forth across the monster's face.
SC.dthumb=(s,u)=>{
  const inn=ez(cl(u/.18)),out=ez(cl((u-.82)/.18)),dx=(1-inn)*120+out*140+(u>.18&&u<.82?Math.sin(s.t*30)*14:0);
  const x=s.x+dx,y=s.y+14+(u>.18&&u<.82?Math.cos(s.t*30)*3:0);
  gfx.globalAlpha=1-out;
  RO(x+44,y-16,22,36,'#253b4a'); R(x+44,y-16,4,36,'#3a5468');      // sleeve cuff
  RO(x+14,y-12,32,30,'#efbc8e');                                       // the fist
  for(let k=0;k<3;k++) R(x+14,y-3+k*7,12,2,'#c98a62');                 // curled fingers
  R(x+14,y-12,32,4,'#f8d4b4');
  EO(x+6,y-12,14,7,'#efbc8e'); E(x-4,y-13,5,4.5,'#ffe8de'); E(x-4,y-13,3,2.5,'#ffffff');  // the thumb, nail out
  E(x+10,y-7,8,2,'#d39a6c');
  if(u>.2&&u<.8) { gfx.globalAlpha=.7; E(x-12,y-14,4,4,'#bfe6ff'); gfx.globalAlpha=1; }
  if(u>.2&&u<.8&&Math.floor(s.t*10)%2) { twinkle(x-14,y-16,7); twinkle(x-6,y+16,5,'#bfe6ff'); }
};
// The shine afterwards: a gleam sweeps across the monster, twinkles pop.
SC.dgleam=(s,u)=>{
  const sx=lerp(s.x-90,s.x+90,ez(u/.6)); gfx.globalAlpha=env(u,.05,.6)*.7;
  poly([[sx-10,s.y-70],[sx+6,s.y-70],[sx-14,s.y+50],[sx-30,s.y+50]],'#ffffff');
  gfx.globalAlpha=1;
  for(let k=0;k<7;k++) { const a=rr(s,k),b=rr(s,k+5),ph=cl(u*1.6-k*.12); if(ph<=0||ph>=1) continue; twinkle(s.x-60+a*120,s.y-60+b*100,10*Math.sin(ph*Math.PI),k%3?'#fff6c8':'#bfe6ff'); }
};
// The pedometer: counts up to s.to steps.
SC.dpedo=(s,u)=>{
  gfx.globalAlpha=env(u,.06,.9); const x=s.x,y=s.y+Math.sin(s.t*12)*1.5;
  RO(x-46,y-22,92,40,'#ff7fae'); R(x-46,y-22,92,6,'#ffa8c8');
  RO(x-38,y-12,76,20,'#cfe8c0');
  const n=Math.floor(ez(cl(u/.88))*s.to); const txt=String(n).padStart(5,' ');
  label(txt,x,y-7,'#20402a',2);
  label('STEPS',x,y+11,'#fff6dc',1);
  E(x+40,y-18,4,4,Math.floor(s.t*6)%2?'#ffe08a':'#c9a03e');
};
// Speed lines and puffs behind whoever is walking.
SC.dspeed=(s,u)=>{
  const p=pos(); gfx.globalAlpha=.6*env(u,.05,.9); const dir=s.dir?s.dir():1;
  for(let k=0;k<4;k++) R(p.cx+dir*(28+k*12),p.base-80+k*16,dir*(20-k*3),3,'#fff6dc');
};
// Her old nurse cap, on her head, wherever she is.
SC.dcap=(s,u)=>{
  const h=head(),pop=u<.1?ez(u/.1):1,y=h.y-(1-pop)*30; gfx.globalAlpha=u>.95?(1-u)/.05:1;
  poly([[h.x-22,y+6],[h.x+22,y+6],[h.x+16,y-10],[h.x-16,y-10]],'#ffffff',true);
  R(h.x-20,y+2,40,4,'#e6e6ee');
  R(h.x-2,y-8,4,12,'#e0303a'); R(h.x-6,y-4,12,4,'#e0303a');
  if(u<.2) for(let k=0;k<4;k++) twinkle(h.x-30+k*20,y-18+(k%2)*8,6*(1-u/.2));
};
// The BRAVE sticker, slapped on the monster.
SC.dsticker=(s,u)=>{
  const k=u<.08?ez(u/.08)*1.25:(u<.14?lerp(1.25,1,(u-.08)/.06):1); gfx.globalAlpha=u>.9?(1-u)/.1:1;
  gfx.save(); gfx.translate(s.x,s.y); gfx.scale(k,k); gfx.rotate(-.18);
  const pts=[]; for(let j=0;j<10;j++) { const a=-Math.PI/2+j*Math.PI/5,r=j%2?10:22; pts.push([Math.cos(a)*r,Math.sin(a)*r]); }
  poly(pts,'#ffd23a',true); label('BRAVE',0,-2,'#c0402e',1);
  gfx.restore();
};
// Little stars circling the monster's head: it is woozy.
SC.dwoozy=(s,u)=>{
  const top=(battle.enemyTop||170)-6; gfx.globalAlpha=env(u,.1,.85);
  for(let k=0;k<4;k++) { const a=s.t*5+k*Math.PI/2; twinkle(GX+Math.cos(a)*34,top+Math.sin(a)*8,7,k%2?'#ffe08a':'#ff9ac0'); }
};
// The floor, freshly mopped. The wet patch reaches from Deedee back toward the monster and shines.
SC.dwet=(s,u)=>{
  const reach=ez(cl(u/.55)),xl=lerp(540,46,reach),y=270; gfx.globalAlpha=env(u,.05,.85)*.75;
  E((xl+560)/2,y,(560-xl)/2+10,18,'#9fd8ff'); gfx.globalAlpha*=.8; E((xl+560)/2,y-3,(560-xl)/2,11,'#d8f2ff'); gfx.globalAlpha*=.8; E((xl+560)/2,y-5,Math.max(1,(560-xl)/2-20),3,'#ffffff');
  gfx.globalAlpha=env(u,.05,.85);
  for(let k=0;k<8;k++) { const a=rr(s,k),x=lerp(xl,540,a),ph=(s.t*1.4+a)%1; if(x>xl+6) twinkle(x,y-4+(k%3)*4,6*Math.sin(ph*Math.PI),'#ffffff'); }
  for(let k=0;k<10;k++) { const a=rr(s,k+20),x=lerp(xl,540,a),ph=(s.t*.8+a*2)%1; if(x>xl+6) { gfx.globalAlpha=(1-ph)*.8; gfx.strokeStyle='#ffffff'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.arc(x,y-8-ph*40,3+a*4,0,Math.PI*2); gfx.stroke(); } }
};
// Bubbles everywhere.
SC.dbubbles=(s,u)=>{
  for(let k=0;k<(s.n||16);k++) { const a=rr(s,k),b=rr(s,k+40),x=s.x+(a-.5)*(s.sp||140)+Math.sin(s.t*3+k)*8,y=s.y-u*(60+b*90),r=4+b*7; gfx.globalAlpha=(1-u)*.9; gfx.strokeStyle='#ffffff'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(x,y,r,0,Math.PI*2); gfx.stroke(); E(x-r*.35,y-r*.35,r*.25,r*.25,'#ffffff'); }
};
// Rhubarb crisp: the pink splat on the monster, and crumble.
SC.dsplat=(s,u)=>{
  gfx.globalAlpha=u>.8?(1-u)/.2:1; const k=ez(cl(u/.12));
  const blob=(x,y,r,c)=>E(x,y,r*k,r*.7*k,c);
  blob(s.x,s.y,36,'#c73a5a'); blob(s.x-30,s.y+16,14,'#c73a5a'); blob(s.x+32,s.y+12,12,'#c73a5a'); blob(s.x+6,s.y+30,10,'#c73a5a');
  blob(s.x-6,s.y-6,22,'#e04f72'); blob(s.x-12,s.y-12,8,'#ff8fab');
  for(let j=0;j<12;j++) { const a=rr(s,j),b=rr(s,j+4); E(s.x-34+a*68,s.y-20+b*26,5*k,4*k,j%2?'#d79a4e':'#e8b46a'); }
  for(let j=0;j<6;j++) { const a=rr(s,j+9),len=cl(u*2)*(12+a*26); R(s.x-28+j*11,s.y+18,5,len,'#c73a5a'); E(s.x-25.5+j*11,s.y+18+len,3.5,4,'#c73a5a'); }
};
// Steam rising off something hot.
SC.dsteam=(s,u)=>{ for(let k=0;k<(s.n||6);k++) { const ph=(s.t*.9+k/(s.n||6))%1,x=s.x+(rr(s,k)-.5)*(s.w||80)+Math.sin(ph*8+k)*6; gfx.globalAlpha=(1-ph)*.65*env(u,.1,.8); E(x,s.y-ph*60,6+ph*6,5+ph*4,'#ffffff'); } };
// The wine bottle beside her. s.popped once the cork is out.
SC.dbottle=(s,u)=>{
  const p=s.fix||pos(),x=p.cx+40,y=p.base; gfx.globalAlpha=env(u,.08,.9);
  RO(x-9,y-40,18,40,'#2f5a3a'); RO(x-4,y-56,8,18,'#2f5a3a'); R(x-9,y-34,18,14,'#f4efe0'); label('V',x,y-30,'#7a1f3d',1);
  R(x-7,y-38,4,30,'rgba(255,255,255,.25)');
  if(!s.popped) { const wob=s.t>s.wob?Math.sin(s.t*40)*2:0; RO(x-3+wob,y-62,6,6,'#d8a868'); }
  else if(s.t<s.popAt+.5) { gfx.globalAlpha=1-(s.t-s.popAt)/.5; for(let k=0;k<5;k++) E(x-6+k*3,y-64-(s.t-s.popAt)*60-k*4,3,3,'#ffffff'); }
};
// "AHH" hearts drifting off her after a sip.
SC.dahh=(s,u)=>{ const p=pos(); for(let k=0;k<5;k++) { const ph=cl(u*1.3-k*.12); if(ph<=0||ph>=1) continue; gfx.globalAlpha=1-ph; heart(p.cx-20+k*12+Math.sin(ph*7+k)*6,p.base-110-ph*60,6,k%2?'#ff9ac0':'#ffd3e0',false); } };
// Sunday dinner: the table, set in front of the monster. s.dishes lists what has landed.
SC.dtable=(s,u)=>{
  const slide=1-ez(cl(u/.1)),x=GX-slide*360,y=246; gfx.globalAlpha=u>.94?(1-u)/.06:1;
  // napkin bib on the monster
  if(slide<.2) { const by=(battle.enemyTop||170)+52; poly([[GX-22,by],[GX+22,by],[GX,by+26]],'#ffffff',true); E(GX,by,4,3,'#e0303a'); }
  RO(x-104,y+10,8,24,'#8a5a30'); RO(x+96,y+10,8,24,'#8a5a30');
  R(x-112,y-6,224,22,OUT); R(x-110,y-4,220,18,'#ffffff');
  for(let i=0;i<14;i++) for(let j=0;j<2;j++) if((i+j)%2) R(x-110+i*15.7,y-4+j*9,15.7,9,'#e0403a');
  R(x-110,y+12,220,3,'#c0302a');
  const spots={meatballs:-70,lasagna:-24,bread:22,chicken:68,gravy:-46};
  for(const d of (s.dishes||[])) dish(d,x+spots[d],y-12);
  if(s.candles) for(const cx of [-92,92]) { RO(x+cx-3,y-26,6,20,'#f4efe0'); E(x+cx,y-31+Math.sin(s.t*12)*1,3,5,'#ffd166'); E(x+cx,y-30,1.5,3,'#fff6c8'); }
};
// To the Moon and Back: the trail of hearts behind her as she flies.
SC.dtrail=(s,u)=>{
  const p=pos(); (s.pts=s.pts||[]).push({x:p.cx,y:p.base-40,t:s.t}); if(s.pts.length>40) s.pts.shift();
  for(const q of s.pts) { const age=s.t-q.t; if(age>.6) continue; gfx.globalAlpha=(1-age/.6)*env(u,.02,.9); heart(q.x+Math.sin(q.t*20)*6,q.y+age*30,7*(1-age/.6)+2,'#ff6b9a',false); }
};
// The flag she plants on the moon.
SC.dflag=(s,u)=>{
  const x=s.x,y=s.y,k=ez(cl(u/.12)); gfx.globalAlpha=env(u,.02,.9);
  Ln(x,y,x,y-36*k,3,OUT); Ln(x,y,x,y-36*k,1.5,'#e8eef4');
  if(k>=1) { const w=Math.sin(s.t*8)*2; poly([[x,y-36],[x+26,y-31+w],[x,y-24]],'#ff6b9a',true); heart(x+9,y-30+w*.5,4,'#ffffff',false); }
};
// The heart comet she rides back down on, from the moon to the monster.
SC.dcomet=(s,u)=>{
  const q=ez(u),x=lerp(s.x0,s.x1,q),y=lerp(s.y0,s.y1,q*q);
  for(let k=1;k<10;k++) { const qq=Math.max(0,q-k*.035),tx=lerp(s.x0,s.x1,qq),ty=lerp(s.y0,s.y1,qq*qq); gfx.globalAlpha=(1-k/10)*.85; E(tx,ty,18-k,18-k,k%2?'#ff9ac0':'#ffe08a'); }
  gfx.globalAlpha=1; E(x,y,30,30,'rgba(255,154,192,.35)'); heart(x,y,22,'#ff4f8a'); twinkle(x+20,y-22,8);
};
// A crescent moon rising behind the party (MOON & BACK).
SC.dcrescent=(s,u)=>{
  const x=s.x||470,y=(s.y||74)+(1-ez(cl(u/.3)))*60; gfx.globalAlpha=env(u,.12,.82);
  E(x,y,50,50,'rgba(255,240,170,.18)');
  gfx.beginPath(); gfx.arc(x,y,32,0,Math.PI*2); gfx.arc(x+14,y-8,28,0,Math.PI*2,true); gfx.fillStyle=OUT; gfx.fill('evenodd');
  gfx.beginPath(); gfx.arc(x,y,30,0,Math.PI*2); gfx.arc(x+14,y-8,28,0,Math.PI*2,true); gfx.fillStyle='#fff0b8'; gfx.fill('evenodd');
  for(let k=0;k<8;k++) { const a=rr(s,k),b=rr(s,k+3); if(Math.floor(s.t*4+k)%3) twinkle(300+a*260,20+b*90,4+((k*7)%3),k%2?'#fff6c8':'#9fd8ff'); }
};

// ================= Moves =================
// Spit Shine: she licks her thumb and goes in. Every grandma's oldest move. Free.
D.basic=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage(pick(['Deedee licks her thumb. The '+enemyName().toLowerCase()+' has a smudge.','"Hold still, honey. You have something on your face." Here comes the thumb.'])); appr(fx,2.3); say(m.id,'basic'); },
    720,()=>{ pose(fx,'act',1.0); scene('dthumb',1.1,{x:GX+18,y:206}); S.squeak(); battle.enemyWobble=1.0; },
    360,()=>S.squeak(),360,()=>{ S.squeak(); bt('SCRUB',96,32,'#fff1cb',3,.7); },
    420,()=>{ S.sparkle(); scene('dgleam',1.2,{x:GX,y:226}); battle.flashEnemy=.25; hit(E2); bt('SPARKLY',96,36,'#bfe6ff',3,.9); },
    800,E2.result+' Much better. Now it is presentable.',()=>checkEnemy()); };

// Power Walk: ten thousand steps, around and through the monster, arms pumping.
D.walk=E2=>{ const {i,m,fx}=E2; const LAP=.95,N=3,DUR=LAP*N; let face=1;
  enqueue(()=>{ setMessage('Deedee laces up. Morning walk. She does not stop for monsters.'); say(m.id,'walk',.1);
      scene('dpedo',DUR+.5,{x:288,y:40,to:10000}); scene('dspeed',DUR,{dir:()=>face});
      path(fx,DUR,(q,c)=>{
        const L=Math.min(N-1e-6,q*N),u=L%1,step=Math.abs(Math.sin(c.t*16));
        const fr=Math.floor(c.t*10)%2;
        if(u<.5) { face=1; const v=ez(u/.5); return {cx:lerp(c.origX,96,v),base:c.origBase-step*5,frame:c.sp.run[fr],rot:-.06}; }
        face=-1; const v=ez((u-.5)/.5); return {cx:lerp(96,c.origX,v),base:c.origBase+10-step*5,frame:c.sp.runFlip[fr],rot:.06};
      });
      for(let k=0;k<Math.round(DUR*7);k++) later(k*140,()=>S.step()); },
    ...[0,1,2].flatMap(k=>[k===0?330:950,()=>{ battle.slash=.2; battle.enemyWobble=.4; sfx.slash(); S.beep(); scene('dust',.5,{x:GX+30,y:262,n:5}); bt(['EXCUSE ME','COMING THROUGH','ON YOUR LEFT'][k],96,30+k*2,'#ff9ac0',2,.7); part(E2,3,k); }]),
    1000,()=>{ sfx.levelChime(); scene('confetti',1.2,{x0:180,x1:400,n:24}); bt('10000 STEPS',96,36,'#ffe08a',3,1.1); pose(fx,'celeb',.9); },
    900,E2.result+' Deedee is not even out of breath. The '+enemyName().toLowerCase()+' is.',()=>checkEnemy()); };

// Registered Nut: retired registered nurse. Tom calls her a registered nut. A little pinch, then a BRAVE sticker.
D.nurse=E2=>{ const {i,m,fx}=E2; let woozy=false;
  enqueue(()=>{ setMessage('Deedee puts on her old nurse cap. Retired registered nurse. Tom says registered nut.'); scene('dcap',4.2,{}); S.sparkle(); pose(fx,'hip',1.0); say(m.id,'nurse',.5); },
    1000,()=>{ hold(i,'dsyringe',2.6,{ang:.04}); pose(fx,'aim',.8); sfx.charge&&sfx.charge(); bt('LITTLE PINCH',96,24,'#ff9ac0',2,1); },
    700,()=>{ appr(fx,2.0); },
    700,()=>{ S.pinch(); battle.flashEnemy=.3; battle.shakeEnemy=.35; scene('burst',.35,{x:GX+28,y:214,c:'#ff9ac0'}); bt('PINCH',96,32,'#ffffff',4,.6); const h=battle.held; if(h) h.pushT=battle.time; },
    ...[1,2,3].flatMap(k=>[110,()=>{ const h=battle.held; if(h) h.push=k/3; }]),
    300,()=>{ hit(E2); woozy=confuseMaybe(.35); },
    500,()=>{ battle.held=null; S.smooch(); scene('dsticker',2.0,{x:GX-12,y:(battle.enemyTop||170)+34}); bt('BRAVE',96,36,'#ffd23a',3,1); if(woozy) scene('dwoozy',2.4,{}); },
    900,()=>setMessage(woozy?E2.result+' The '+enemyName().toLowerCase()+' feels a little woozy. Sit down a minute, honey.':E2.result+' It gets a sticker. It was very brave.'),
    1100,()=>checkEnemy()); };

// Wet Floor: she mops the whole battlefield. It sparkles. It is VERY slippery. Then the sign.
D.mop=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('Deedee mops the whole battlefield. It sparkles. It is VERY slippery.'); say(m.id,'mop',.2); hold(i,'dmop',2.4,{scrub:true}); scene('dwet',4.6,{}); S.swish(1.6);
      path(fx,2.2,(q,c)=>{ const u=q<.5?ez(q/.5):1-ez((q-.5)/.5),wig=Math.sin(c.t*18); return {cx:lerp(c.origX,300,u)+wig*6,base:c.origBase-Math.abs(wig)*3}; });
      scene('dbubbles',2.0,{x:420,y:262,n:14,sp:220,delay:.3}); },
    1300,()=>{ S.bubbles(); scene('dbubbles',1.6,{x:GX,y:262,n:12,sp:120}); battle.enemyWobble=.8; bt('SHINY',96,30,'#bfe6ff',3,.7); },
    900,()=>{ scene('shadow',.6,{x:GX,y:264,r:30}); toss('dsign',GX+4,-60,GX+4,(battle.enemyTop||170)-30,0,.6,0,{spin:false}); sfx.slideWhistle(); },
    600,()=>{ sfx.bonk(); part(E2,2,0); battle.shakeEnemy=.3; scene('burst',.35,{x:GX,y:(battle.enemyTop||170)-10}); },
    250,()=>{ battle.lift={t:0,dur:.8}; sfx.whoosh(); bt('WHOOPS',96,24,'#ffe08a',3,.8); scene('dbubbles',1.2,{x:GX,y:262,n:10,sp:90}); },
    800,()=>{ sfx.thud(); battle.shakeEnemy=.7; battle.flashEnemy=.3; scene('splashw',.8,{x:GX,y:262,n:14,sp:130}); scene('ring',.6,{x:GX,y:266,r:110,c:'#bfe6ff'}); part(E2,2,1); bt('SLIPPED',96,36,'#9fd8ff',3,1); },
    1000,E2.result+' She did put the sign out. Technically.',()=>checkEnemy()); };

// Rhubarb Crisp: straight from the oven, still bubbling. Dropped on from above, then a scoop of ice cream on top.
D.crisp=E2=>{ const {i,m,fx}=E2; const top=()=>(battle.enemyTop||170);
  enqueue(()=>{ setMessage('Deedee pulls a rhubarb crisp out of the oven. It is still bubbling. Her recipe. Nobody gets the recipe.'); hold(i,'dcrisp',1.9,{}); pose(fx,'aim',1.9); say(m.id,'crisp',.3); S.bubbling(1.6); },
    1700,()=>{ battle.held=null; pose(fx,'throw',.5); const h=hand(); toss('dcrisp',h.x,h.y,GX,-60,0,.45,40,{spin:false}); sfx.whoosh(); },
    700,()=>{ scene('shadow',.5,{x:GX,y:264,r:50}); toss('dcrisp',GX,-60,GX,top()+10,0,.45,0,{spin:false}); sfx.slideWhistle(); },
    450,()=>{ sfx.splat(); sfx.thud(); battle.shakeEnemy=.6; battle.flashEnemy=.3; scene('dsplat',2.6,{x:GX,y:top()+34}); scene('crumbs',1.0,{x:GX,y:top()+14,n:26,sp:150,c:'#e8b46a'}); scene('dsteam',2.4,{x:GX,y:top()+20,w:90}); part(E2,2,0); bt('HOT HOT HOT',96,30,'#ff6f8f',3,.9); },
    900,()=>{ toss('dscoop',300,-40,GX+2,top()+4,0,.6,30,{spin:false}); sfx.slideWhistle(); },
    600,()=>{ S.plate(); sfx.bonk(); battle.shakeEnemy=.4; scene('burst',.4,{x:GX,y:top()+4,c:'#fff8ec'}); scene('dbubbles',.9,{x:GX,y:top(),n:6,sp:40}); part(E2,2,1); bt('A LA MODE',96,36,'#fff8ec',3,1.1); },
    1000,E2.result+' It asks for the recipe. Absolutely not.',()=>checkEnemy()); };

// Wine O'Clock: one glass. She earned it. The cork has other plans: it pops and ricochets.
D.wine=E2=>{ const {i,m,fx}=E2; const p0=homeOf(i); let bottle=null;
  const bx=p0.cx+40,by=p0.base-62,top=()=>(battle.enemyTop||170)+30;
  enqueue(()=>{ setMessage('Deedee pours herself a glass of wine. Just one. She earned it.'); say(m.id,'wine',.2); bottle=scene('dbottle',4.6,{fix:p0,wob:.9}); hold(i,'dwine',4.4,{swirl:true}); pose(fx,'hip',2.0); later(300,()=>S.pour(.7)); },
    1300,()=>{ S.clink(); bt('CHEERS',150,36,'#ffd3e0',2,.8); },
    500,()=>{ if(bottle) { bottle.popped=true; bottle.popAt=bottle.t; } S.pop(); battle.props.push({kind:'dcork',x0:bx,y0:by,x1:GX+20,y1:top(),arc:30,spin:true,t:0,dur:.32}); bt('POP',150,24,'#fff6dc',4,.6); },
    320,()=>{ S.ping(); battle.shakeEnemy=.35; scene('burst',.3,{x:GX+20,y:top()}); part(E2,3,0); battle.props.push({kind:'dcork',x0:GX+20,y0:top(),x1:40,y1:80,arc:20,spin:true,t:0,dur:.3}); },
    300,()=>{ S.ping(); scene('burst',.25,{x:40,y:80,r:20}); battle.props.push({kind:'dcork',x0:40,y0:80,x1:GX-20,y1:top()-20,arc:0,spin:true,t:0,dur:.28}); },
    280,()=>{ S.ping(); battle.shakeEnemy=.35; scene('burst',.3,{x:GX-20,y:top()-20}); part(E2,3,1); battle.props.push({kind:'dcork',x0:GX-20,y0:top()-20,x1:80,y1:268,arc:10,spin:true,t:0,dur:.28}); bt('PING',96,30,'#fff1cb',3,.5); },
    280,()=>{ S.ping(); scene('dust',.4,{x:80,y:268,n:3}); battle.props.push({kind:'dcork',x0:80,y0:268,x1:GX+6,y1:top()-50,arc:30,spin:true,t:0,dur:.3}); },
    300,()=>{ S.ping(); sfx.thud(); battle.shakeEnemy=.6; battle.flashEnemy=.4; scene('burst',.45,{x:GX+6,y:top()-50,r:60}); part(E2,3,2); battle.props.push({kind:'dcork',x0:GX+6,y0:top()-50,x1:GX-50,y1:268,arc:50,spin:true,t:0,dur:.6}); bt('PING PING',96,36,'#ffe08a',3,.9); },
    700,()=>{ const h=battle.held; if(h&&h.kind==='dwine') h.sip=[h.t,h.t+.9]; scene('dahh',1.6,{}); },
    900,()=>{ bt('AHH',160,40,'#ffd3e0',3,.9); },
    600,E2.result+' Deedee never spilled a drop.',()=>checkEnemy()); };

// Sunday Dinner: the bell rings, the table slides in, the monster gets a bib, and the dishes keep coming.
D.dinner=E2=>{ const {i,m,fx}=E2; const order=['meatballs','lasagna','bread','chicken'],names=['MEATBALLS','LASAGNA','GARLIC BREAD','SECONDS?'];
  let table=null;
  enqueue(()=>{ setMessage('Deedee rings the dinner bell. Sunday dinner. Everybody sits. Including the '+enemyName().toLowerCase()+'.'); hold(i,'dbell',1.1,{}); pose(fx,'celeb',1.1); S.bell(); say(m.id,'dinner',.6); },
    1100,()=>{ table=scene('dtable',6.4,{dishes:[],candles:true}); sfx.whoosh(); },
    700,()=>bt('MANGIA',96,26,'#ffe08a',3,.8),
    ...order.flatMap((d,k)=>[k===0?300:150,()=>pose(fx,'wind',.25),220,()=>{ pose(fx,'throw',.3); const h=hand(); toss('ddish',h.x,h.y,GX+[-70,-24,22,68][k],234,0,.5,80,{spin:false,dish:d}); sfx.whoosh(); },
      500,()=>{ S.plate(); battle.shakeEnemy=.3; battle.enemyWobble=.3; if(table) table.dishes.push(d); scene('dsteam',1.2,{x:GX+[-70,-24,22,68][k],y:226,w:30,n:3}); part(E2,4,k); bt(names[k],96,30+k*2,'#fff1cb',2,.6); }]),
    500,()=>{ battle.flashEnemy=.4; battle.shakeEnemy=.6; sfx.thud(); sfx.levelChime(); bt('STUFFED',96,36,'#ffb070',4,1.2); scene('dsteam',1.4,{x:GX,y:(battle.enemyTop||170),w:60,n:5}); },
    1200,E2.result+' Nobody leaves this table hungry. Nobody leaves this table at all.',()=>checkEnemy()); };

// To the Moon and Back: she says it every day. Today she means it literally. Up to the moon, a flag, then back down on a heart.
D.moonshot=E2=>{ const {i,m,fx}=E2; const DUR=4.6,MX=466,MY=28;
  enqueue(()=>{ setMessage('Deedee says it every day. Today she means it literally.'); say(m.id,'moonshot',.1);
      scene('dark',DUR+.4,{a:.7,back:true}); scene('moon',DUR+.4,{back:true});
      path(fx,DUR,(q,c)=>{
        if(q<.1) return {frame:c.sp.kneel,base:c.origBase+Math.sin(c.t*30)*1};
        if(q<.28) { const u=ez((q-.1)/.18); return {cx:lerp(c.origX,MX,u),base:lerp(c.origBase,MY,u)-Math.sin(u*Math.PI)*40,sc:lerp(1,.42,u),rot:Math.sin(u*Math.PI)*-.4,frame:c.sp.celeb,noShadow:true}; }
        if(q<.56) return {cx:MX-6,base:MY,sc:.42,frame:Math.floor(c.t*4)%2?c.sp.celeb:c.sp.celeb2,noShadow:true};
        if(q<.82) return {hide:true};
        const u=(q-.82)/.18; return {cx:lerp(GX+90,c.origX,u),base:lerp(c.origBase,c.origBase,u)-Math.sin(u*Math.PI)*70,frame:c.sp.celeb};
      }); },
    450,()=>{ S.launch(); scene('dtrail',.9,{}); scene('dust',.6,{x:pos().cx,y:pos().base,n:6}); },
    900,()=>{ sfx.ding(); scene('dflag',2.8,{x:MX+16,y:MY}); bt('TO THE MOON',96,28,'#ffe08a',3,1.3); },
    1250,()=>{ S.fall(); scene('dcomet',1.15,{x0:MX,y0:MY-20,x1:GX,y1:GY-10}); },
    1150,()=>{ sfx.thud(); sfx.lineClear(); hit(E2); battle.flashEnemy=.6; battle.shakeEnemy=.8; battle.enemyKnock=.45;
      scene('flash',.5,{c:'#ff9ac0',a:.55}); scene('ring',.8,{x:GX,y:262,r:140,c:'#ff9ac0'}); scene('burst',.6,{x:GX,y:GY,r:80,n:16,c:'#ff6b9a',c2:'#ffe08a'}); scene('dust',.9,{x:GX,y:262,n:9});
      for(let k=0;k<10;k++) { const a=k/10*Math.PI*2; toss('dheart',GX,GY,GX+Math.cos(a)*160,GY+Math.sin(a)*90,k*.02,.8,40,{spin:false,r:8,c:k%2?'#ff6b9a':'#ff9ac0'}); }
      bt('AND BACK',96,36,'#ff9ac0',4,1.4); },
    1300,()=>{ pose(fx,'celeb',.8); scene('confetti',1.4,{x0:80,x1:300,n:30}); },
    600,E2.result+' To the moon. And back. And right onto the '+enemyName().toLowerCase()+'.',()=>checkEnemy()); };

// ================= Special: MOON & BACK =================
// A crescent moon rises, hearts fly from Deedee to everyone, and the group hug heals (E2.apply runs the numbers).
D.hug=E2=>{ const {i,m,fx}=E2;
  if(E2.act&&E2.act.o3&&D.hugShow) return D.hugShow(E2);   // Option 3 Primary animation (second IIFE below)
  fx.hug=2.6; sfx.heal(); say(m.id,'hug');
  scene('dcrescent',3.6,{back:true});
  const team=battlePartyList();
  enqueue(
    ()=>{ setMessage(m.name+' opens her arms. "To the moon and back. Everybody in."'); bt('TO THE MOON AND BACK',96,22,'#ffe08a',2,1.6); },
    700,()=>{ const h=homeOf(i); team.forEach((p,j)=>{ if(!alive(p)||j===i) return; const q=BATTLE_POS[j]; toss('dheart',h.cx-10,h.base-90,q.x*3,q.base*3-70,j*.08,.55,60,{spin:false,r:10}); }); S.smooch(); },
    700,()=>{
      E2.apply();
      team.forEach((p,j)=>{ if(!alive(p)) return; scene('glow',.9,{x:BATTLE_POS[j].x*3,y:BATTLE_POS[j].base*3-40,rx:40,ry:56,c:'#ff9ac0',a:.35}); });
      sfx.fountain();
    },
    'Everyone is healed and Tucked In. And a kiss on the head.',
    ()=>checkEnemy()
  );
};
})();

// ================= Option 3 Primary kit (phase 3d) =================
// Cards: adventures-of-tom-ability-revamp.md (Deedee). Same beat plan as the other kits: beat 1 setup (0.5 s), beat 2
// impact about 1.05 s in (inside the High-Five window, engine/feel.js B7_HF), beat 3 the small joke.
// Scenes drawn at real unit positions are in B2_NOWARP so the aim warp does not move them twice.
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const gpos=()=>battle.actorPos||{cx:519,base:315,h:120};
const hand=()=>{ const a=battle.actorHand; if(a) return {x:a.n[0]-8,y:a.n[1]-8}; const p=gpos(); return {x:p.cx-20,y:p.base-60}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const home=u=>{ if(u.side==='foe') { const p=b2FoeCanvasPos(u); return {x:p.x,base:p.y,h:p.h}; } const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const top=()=>battle.enemyTop||150;
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const foesOf=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const box=list=>{ const P=list.map(f=>b2FoeCanvasPos(f)); if(!P.length) return {x0:GX-40,x1:GX+40,y0:GY-50,y1:GY+40};
  return {x0:Math.min(...P.map(p=>p.x-p.w/2)),x1:Math.max(...P.map(p=>p.x+p.w/2)),y0:Math.min(...P.map(p=>p.y-p.h)),y1:Math.max(...P.map(p=>p.y))}; };
const steam=(x,y,u,n=4,c='#fff6dc')=>{ for(let k=0;k<n;k++) { const q=(u*1.3+k*.23)%1; gfx.globalAlpha*=1-q; E(x-12+k*8+Math.sin(q*6+k)*4,y-q*34,4+q*3,4+q*3,c); gfx.globalAlpha/= (1-q)||1; } };
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',APRON='#f6e6c4',WOOD='#b88848',TEAL='#7fcfc0',BLUE='#9fc4f0',CRUST='#d9a05a',RED='#e0402e';
const D=RECRUIT_MOVES.deedee;
const IMPACT=550;   // ms after beat 2 starts (beat 1 is 500)
const UI=1.05/1.8;  // where the impact sits in a 1.8 s scene started on beat 1
const NW_LIST=[];
const nowarp=(...k)=>NW_LIST.push(...k);
const NW=()=>{ if(typeof B2_NOWARP!=='undefined') for(const x of NW_LIST) B2_NOWARP.add(x); };
nowarp('d_towel','d_moonline','d_badge','d_pulse','d_cornerpan','d_dishout','d_nottoday','d_bowl','d_mitts','d_mittwave','d_sightsee','d_nozzle','d_shower',
  'd_window','d_spoon','d_breathring');

// ---------- Scenes ----------
// Dish-Towel Flick: a tiny dark pixel on the target, a towel snaps from her hand, then folds into a precise square.
SC.d_pixel=(s,u)=>{ const x=GX+10,y=GY-30; gfx.globalAlpha=fade(u,.9); if(u<.9) { R(x-3,y-3,6,6,'#2b2a26'); if(u>.3) { ring(x,y,10+Math.sin(s.t*8)*2,10+Math.sin(s.t*8)*2,2,CREAM); label('SPOT',x,y-20,CREAM,1); } } };
SC.d_towel=(s,u)=>{ const p=hand(),x=p.x,y=p.y-6,snap=u<UI-.04?0:ez((u-UI+.04)/.1),back=u>UI+.1?ez((u-UI+.1)/.2):0,fold=u>.8?ez((u-.8)/.15):0; gfx.globalAlpha=fade(u,.95);
  if(fold>0) { const w=22-fold*8; RO(x-w/2,y-6,w,12,CREAM); R(x-w/2+3,y-3,w-6,2,BLUE); R(x-w/2+3,y+1,w-6,2,BLUE); if(fold>.9) label('SQUARE',x,y-22,CREAM,1); return; }
  const len=lerp(28,96,snap)*(1-back*.7),ang=lerp(.6,-.1,snap); gfx.save(); gfx.translate(x,y); gfx.rotate(ang);
  gfx.beginPath(); gfx.moveTo(0,-7); gfx.quadraticCurveTo(len*.5,-7-Math.sin(snap*Math.PI)*14,len,-4); gfx.lineTo(len,6); gfx.quadraticCurveTo(len*.5,8-Math.sin(snap*Math.PI)*14,0,7); gfx.closePath();
  gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=CREAM; gfx.fill(); for(let k=1;k<4;k++) Ln(len*k/4,-6,len*k/4,6,2,BLUE); gfx.restore();
  if(snap>.9&&back<.3) label('SNAP',x+len*.9,y-22,GOLD,2); };

// MOON & BACK: a measuring line stretches from her toward a small moon, loops back into a heart around the party, and runs out of numbers.
SC.d_moonline=(s,u)=>{ const p=gpos(),x0=p.cx-30,y0=p.base-p.h*.6,mx=120,my=70,go=ez(cl(u/(UI-.05))),back=u<UI?0:ez((u-UI)/.25); gfx.globalAlpha=fade(u,.92);
  EO(mx,my,16,16,'#fff1b0'); E(mx+6,my-2,12,12,'#1b1a2e'); gfx.globalAlpha*=.9; E(mx+6,my-2,12,12,'rgba(27,26,46,0)'); gfx.globalAlpha=fade(u,.92);
  const ex=lerp(x0,mx+18,go),ey=lerp(y0,my+8,go); Ln(x0,y0,ex,ey,5,OUT); Ln(x0,y0,ex,ey,3,GOLD);
  const n=Math.floor(go*9); for(let k=1;k<=n;k++) { const q=k/9,lx=lerp(x0,mx+18,q),ly=lerp(y0,my+8,q); Ln(lx,ly-5,lx,ly+5,2,OUT); if(k%3===0) label(''+(k*100000),lx,ly-16,CREAM,1); }
  if(back>0) { const P=b2LiveParty().map(q=>home(q)),cx=P.reduce((a,b)=>a+b.x,0)/(P.length||1),cy=P.reduce((a,b)=>a+b.base-b.h*.5,0)/(P.length||1),r=lerp(0,70,back);
    gfx.globalAlpha=fade(u,.92)*.9; gfx.strokeStyle=OUT; gfx.lineWidth=7; heartPath(cx,cy,r); gfx.stroke(); gfx.strokeStyle=ROSE; gfx.lineWidth=4; heartPath(cx,cy,r); gfx.stroke(); }
  if(u>.84) { gfx.globalAlpha=fade(u,.92); label('...AND BACK',mx+60,my-8,GOLD,1); } };
function heartPath(x,y,r) { gfx.beginPath(); for(let k=0;k<=36;k++) { const a=k/36*Math.PI*2,hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a)); const px=x+hx*r/16,py=y+hy*r/16; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); }

// Registered Nut, Reporting: a nurse badge with NUT on a sticker by her; a pulse icon by the recipient straightens; a debuff sticker peels away.
SC.d_badge=(s,u)=>{ const p=gpos(),x=p.cx+26,y=p.base-p.h*.62,tilt=lerp(.3,0,ez(u/.3)); gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); RO(-20,-10,40,20,CREAM); R(-20,-10,40,5,BLUE); label('RN',-8,-1,'#2b2a26',1); R(-2,-4,20,10,GOLD); label('NUT',8,-1,'#7a1a14',1); gfx.restore(); };
SC.d_pulse=(s,u)=>{ const x=s.x+(s.foe?44:-44),y=s.y-s.h*.5,w=56,fix=cl((u-UI+.08)/.16); gfx.globalAlpha=fade(u,.9); RO(x-w/2,y-16,w,32,'#1b2a2e');
  gfx.strokeStyle='#8ef0a0'; gfx.lineWidth=2; gfx.beginPath(); for(let k=0;k<=28;k++) { const q=k/28,px=x-w/2+4+q*(w-8),ph=(q*4+s.t*1.5)%1; let py;
    if(fix<1) py=y+Math.sin(q*40+s.t*20)*lerp(10,0,fix)*(k%3?1:.3); else py=y-(ph<.1?ph*120:ph<.2?(.2-ph)*120:0)*.7; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.stroke();
  if(fix>.95) label('OK',x+w/2-10,y-26,'#8ef0a0',1);
  if(u>UI+.1) { const q=ez((u-UI-.1)/.25),sx=s.x+(s.foe?-1:1)*(14+q*34),sy=s.y-s.h*.8-q*14; gfx.globalAlpha=fade(u,.9)*(1-q); gfx.save(); gfx.translate(sx,sy); gfx.rotate(q*1.2); RO(-8,-6,16,12,'#9aa3c8'); Ln(-4,0,4,0,2,'#2b2a26'); gfx.restore(); } };

// Corner-Piece Privilege: a crisp pan angled to show one golden corner; the corner lifts onto a dish and the empty corner folds into a new one.
SC.d_cornerpan=(s,u)=>{ const p=hand(),x=p.x-16,y=p.y+6,lift=u<UI-.06?0:ez((u-UI+.06)/.14),regrow=u>UI+.14?ez((u-UI+.14-.2)/.2):0; gfx.globalAlpha=fade(u,.92);
  gfx.save(); gfx.translate(x,y); gfx.rotate(-.12); RO(-30,-12,60,24,'#c9c2b8'); R(-27,-9,54,18,CRUST); for(let k=0;k<6;k++) R(-24+k*9,-6+(k%2)*8,5,4,'#b0683a');
  const cw=14*(1-lift)+14*regrow; R(13,-9,cw,cw,'#f0b860'); if(u<UI-.06) { label('CORNER',22,-20,GOLD,1); } if(regrow>.9) label('AGAIN?',22,-20,GOLD,1); gfx.restore(); };
SC.d_dishout=(s,u)=>{ const x=s.x+(s.foe?40:-40),y=s.y-s.h*.4,g=ez(u/.2); gfx.globalAlpha=fade(u,.85); EO(x,y+6,16*g,6*g,CREAM); R(x-7*g,y-4,14*g,10,CRUST); R(x-7*g,y-6,14*g,4,'#f0b860'); steam(x,y-6,u,3); if(u>.5) heart(x,y-26,4,'#ff6b9a'); };

// Pepper-Free Plate: a pepper jar slid behind a NOT TODAY card; a warm bread bowl by the recipient, steam loosening amber; Boppy's plain portion.
SC.d_nottoday=(s,u)=>{ const p=gpos(),x=p.cx-54,y=p.base-p.h*.4,slide=ez(u/.3); gfx.globalAlpha=fade(u,.9); RO(x-7+slide*10,y-14,14,22,'#e86040'); R(x-5+slide*10,y-16,10,4,'#2b2a26'); for(let k=0;k<3;k++) R(x-4+slide*10+k*3,y-8+k*4,2,2,'#f6c060');
  RO(x-16,y-10,30*slide+.1,18,CREAM); if(slide>.8) { label('NOT',x-1,y-6,RED,1); label('TODAY',x-1,y+2,RED,1); } };
SC.d_bowl=(s,u)=>{ const x=s.x+(s.foe?44:-44),y=s.y-s.h*.35,g=ez(u/.2); gfx.globalAlpha=fade(u,.88); EO(x,y+4,16*g,8*g,CRUST); E(x,y-2,13*g,5*g,'#f6e2b8'); E(x,y-2,9*g,3*g,'#f0b860'); steam(x,y-4,u,4,'#ffd9a0');
  if(u>UI-.02&&u<UI+.3) { const q=(u-UI+.02)/.32; gfx.globalAlpha=fade(u,.88)*(1-q); for(let k=0;k<5;k++) R(s.x-16+k*8,s.y-s.h*.6+q*50+(k%2)*8,4,4,'#e8b048'); } };
SC.d_plainportion=(s,u)=>{ const x=s.x-30,y=s.y-s.h*.4,g=ez(u/.25); gfx.globalAlpha=fade(u,.85); EO(x,y+4,12*g,5*g,CREAM); R(x-5*g,y-2,10*g,6,'#f6e2b8'); if(u>.4) label('PLAIN',x,y-18,CREAM,1); };

// Rolling-Pin Rounds: the raised wind-up icon inspected like uneven dough; one rolling-pin pass flattens it with a dough-colored bonk.
SC.d_pin=(s,u)=>{ const x=GX,y=top()-26,go=ez(cl((u-.25)/(UI-.25))),px=lerp(x-70,x+70,go),flat=cl((u-UI+.04)/.12); gfx.globalAlpha=fade(u,.9);
  if(flat<1) { const h=lerp(22,4,flat); EO(x,y+22-h,18,h,'#f0d8b0'); if(u<.25) label('UNEVEN',x,y-16,CREAM,1); } else { EO(x,y+20,26,3,'#f0d8b0'); if(u>UI+.2) label('FLAT',x,y-12,GOLD,2); }
  if(u>.25&&u<UI+.16) { gfx.save(); gfx.translate(px,y-6); gfx.rotate(go*6); RO(-20,-6,40,12,WOOD); RO(-30,-3,10,6,'#8a5a30'); RO(20,-3,10,6,'#8a5a30'); gfx.restore(); } };

// Oven Mitt Ultimatum: two disproportionately fluffy mitts go on; one clap sends a warm rectangular pressure wave over the row; mitts hung up.
SC.d_mitts=(s,u)=>{ const p=hand(),on=ez(u/.3),clap=u>UI-.06&&u<UI+.08?Math.sin(cl((u-UI+.06)/.14)*Math.PI):0,gap=lerp(26,2,clap),hang=u>.82?ez((u-.82)/.15):0; gfx.globalAlpha=fade(u,.95);
  const mitt=(x,y,f)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(f,1); EO(0,0,15*on,19*on,'#f0a0a0'); EO(-12*on,-8*on,6*on,8*on,'#f0a0a0'); R(-10*on,10*on,20*on,6*on,CREAM); for(let k=0;k<4;k++) E(-9*on+k*6*on,-2*on,2,2,'#ffd0d0'); gfx.restore(); };
  const y=p.y-10-hang*40,x=p.x+hang*30; mitt(x-gap,y,1); mitt(x+gap,y,-1); if(hang>.9) Ln(x-30,y-24,x+30,y-24,2,WOOD); if(u<.3) label('FLUFFY',p.x,p.y-44,CREAM,1); };
SC.d_mittwave=(s,u)=>{ const B=box(s.foes||[]),q=ez(u/.5),cx=(B.x0+B.x1)/2,cy=(B.y0+B.y1)/2,w=(B.x1-B.x0)/2+16*q,h=(B.y1-B.y0)/2+10*q; gfx.globalAlpha=fade(u,.6)*(1-q*.6);
  gfx.strokeStyle='rgba(255,180,90,.9)'; gfx.lineWidth=6; gfx.strokeRect(cx-w,cy-h,w*2,h*2); gfx.globalAlpha*=.3; R(cx-w,cy-h,w*2,h*2,'#ffb45a'); if(u>.2&&u<.7) { gfx.globalAlpha=fade(u,.6); label('ENOUGH',cx,B.y0-26,GOLD,2); } };

// Brisk Means Brisk: a perfectly respectable walking posture, an air-thump through the enemy, a tiny SIGHTSEEING sign spinning in her wake.
SC.d_airthump=(s,u)=>{ const x=GX,y=GY-20,q=ez(u/.4); gfx.globalAlpha=fade(u,.7)*(1-q*.5); for(let k=0;k<3;k++) ring(x-10+k*6,y,8+q*22+k*4,14+q*26+k*4,2,CREAM); if(u>.3) label('WHUMP',x,y-50,CREAM,2); };
SC.d_sightsee=(s,u)=>{ const p=gpos(),x=p.cx+34,y=p.base-14,g=ez(u/.2),rot=u*7; gfx.globalAlpha=fade(u,.85); RO(x-1,y-6,2,22,WOOD); gfx.save(); gfx.translate(x,y-10); gfx.scale(Math.cos(rot)*g,g); RO(-30,-8,60,16,CREAM); if(Math.abs(Math.cos(rot))>.4) label('SIGHTSEEING',0,-2,'#2b2a26',1); gfx.restore(); };

// Garden Shower: a nozzle labeled GENTLE checked twice; a wide dotted shower sweeps once across the row, tipping the targets like stems.
SC.d_nozzle=(s,u)=>{ const p=hand(),x=p.x-6,y=p.y-4; gfx.globalAlpha=fade(u,.9); RO(x-8,y-6,22,12,'#5fa05a'); RO(x+14,y-4,8,8,'#9aa3c8'); R(x-14,y-2,6,4,'#5fa05a');
  RO(x-24,y-28,48,14,CREAM); label('GENTLE',x,y-24,'#2f6b3a',1); if((u<.3)||(u>.8)) label('CHECK',x,y-40,CREAM,1); };
SC.d_shower=(s,u)=>{ const B=box(s.foes||[]),p=gpos(),q=ez(u/.6); gfx.globalAlpha=fade(u,.8);
  for(let k=0;k<22;k++) { const f=k/22,x=lerp(p.cx-10,lerp(B.x0-10,B.x1+10,f),q),y=lerp(p.base-p.h*.5,B.y0-20+((f*7+s.t*2)%1)*40,q); if(q>f*.6) E(x,y,3,4,BLUE); }
  if(u>.5) { gfx.globalAlpha=fade(u,.8)*.6; for(const f of (s.foes||[])) { const c=b2FoeCanvasPos(f); E(c.x,c.y,c.w*.45,5,'#6aa8e0'); } } };

// Windows Open: a freestanding window frame beside the party unlatches; curtains billow in while dark thought icons and amber flakes drift out.
SC.d_window=(s,u)=>{ const P=b2LiveParty().map(q=>home(q)),x=Math.min(...P.map(q=>q.x))-70,y=(P.reduce((a,b)=>a+b.base-b.h*.6,0)/(P.length||1)),open=ez(cl((u-.3)/.3)),bil=Math.sin(s.t*3)*.5+.5; gfx.globalAlpha=fade(u,.92);
  RO(x-28,y-36,56,72,WOOD); R(x-24,y-32,48,64,'#bfe4ff'); R(x-2,y-32,4,64,WOOD); R(x-24,y-2,48,4,WOOD);
  if(open>0) { const cw=14+bil*10*open; gfx.beginPath(); gfx.moveTo(x-26,y-34); gfx.quadraticCurveTo(x-26+cw*open*2,y,x-26,y+34); gfx.lineTo(x-26+8,y+34); gfx.quadraticCurveTo(x-26+8+cw*open*2.4,y,x-26+8,y-34); gfx.closePath(); gfx.fillStyle=ROSE; gfx.fill();
    gfx.beginPath(); gfx.moveTo(x+26,y-34); gfx.quadraticCurveTo(x+26+cw*open*2,y,x+26,y+34); gfx.lineTo(x+26-8,y+34); gfx.quadraticCurveTo(x+26-8+cw*open*2.4,y,x+26-8,y-34); gfx.closePath(); gfx.fillStyle=ROSE; gfx.fill(); }
  if(u<.3) label('LATCH',x,y-50,CREAM,1); if(open>.95&&u>UI) { for(let k=0;k<4;k++) { const q=cl((u-UI-k*.04)/.3); gfx.globalAlpha=fade(u,.92)*(1-q); const ix=x-40-q*50,iy=y-20+k*12-q*10; if(k%2) { RO(ix-6,iy-6,12,12,'#4a4a60'); } else R(ix-3,iy-3,6,6,'#e8b048'); } gfx.globalAlpha=fade(u,.92); label('FRESH START',x,y+52,ROSE,1); }
  if(u>.85) { heart(x,y-46,6,'#ff6b9a'); } };

// Spotless Record: a tarnished spoon reflects the target's buff; one polish gathers it into a bright spot; the shine moves to her apron.
SC.d_spoon=(s,u)=>{ const p=hand(),x=p.x-4,y=p.y-24,pol=u>UI-.1&&u<UI+.05?Math.sin(cl((u-UI+.1)/.15)*Math.PI*3):0,bright=u>UI?ez((u-UI)/.12):0; gfx.globalAlpha=fade(u,.92);
  gfx.save(); gfx.translate(x,y); gfx.rotate(-.4); RO(-3,0,6,34,bright?'#dde8f0':'#8a8a90'); EO(0,-8,10,13,bright?'#eef6ff':'#9a9aa0'); if(bright) { E(-3,-11,3,4,CREAM); } else E(2,-6,4,5,'#5f5f66'); gfx.restore();
  if(pol) { Ln(x-12+pol*6,y-16,x+6+pol*6,y-24,3,CREAM); } if(u>.2&&u<UI) label('TARNISHED',x,y-34,CREAM,1); if(bright>.9&&u>UI+.25) { const ax=p.x+20,ay=p.y+14; for(let k=0;k<3;k++) { const a=s.t*4+k*2.1; Ln(ax+Math.cos(a)*6,ay+Math.sin(a)*6,ax+Math.cos(a)*11,ay+Math.sin(a)*11,2,CREAM); } label('SHINE',ax,ay-18,GOLD,1); } };
SC.d_reflect=(s,u)=>{ const x=GX+40,y=top()-10,q=u<.5?1:1-ez((u-.5)/.4); gfx.globalAlpha=fade(u,.9)*q; EO(x,y,10,10,GOLD); for(let k=0;k<6;k++) { const a=s.t*5+k*Math.PI/3; Ln(x+Math.cos(a)*13,y+Math.sin(a)*13,x+Math.cos(a)*18,y+Math.sin(a)*18,2,GOLD); } };

// Take a Breather: one finger beside a small warm breathing circle that expands once and settles; a hand pat and a heart.
SC.d_breathring=(s,u)=>{ const x=s.x+(s.foe?44:-44),y=s.y-s.h*.6,ph=u<UI?ez(u/UI):1-ez((u-UI)/.3)*.5,r=10+ph*18; gfx.globalAlpha=fade(u,.9);
  E(x,y,r,r,'rgba(255,200,90,.22)'); ring(x,y,r,r,3,'#ffb45a'); label(u<UI?'IN':'OUT',x,y-3,'#ffb45a',1);
  const p=hand(); RO(p.x-2,p.y-26,4,16,'#f6d4b8'); EO(p.x,p.y-10,6,6,'#f6d4b8'); label('ONE',p.x,p.y-38,CREAM,1);
  if(u>.78) heart(s.x,s.y-s.h-10,5,'#ff6b9a'); };

// ---------- Moves ----------
D.dish_towel_flick=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee notices a spot. Nobody else noticed a spot.'); say('deedee','dish_towel_flick'); scene('d_pixel',1.0,{}); scene('d_towel',1.9,{}); pose(fx,'expr',.5); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ pose(fx,'act',.4); sfx.bonk(); battle.shakeEnemy=.3; hit(E2); },
    350,()=>{ pose(fx,'celeb',.6); sfx.select(); },
    400,res(E2)+'The spot has been dealt with.',()=>checkEnemy()); };
D.hugShow=E2=>{ const {m,fx}=E2;
  enqueue(()=>{ setMessage('Deedee opens her arms. A measuring line heads for the moon.'); say('deedee','moon_back'); scene('d_moonline',1.9,{}); pose(fx,'celeb',1.0); sfx.charge(); },
    500,()=>{ fx.hug=1.3; const h=home(m); for(const p of b2LiveParty()) { if(p===m) continue; const q=home(p); toss('dheart',h.x-10,h.base-h.h*.7,q.x,q.base-q.h*.6,0,.5,60,{spin:false,r:9}); } sfx.kiss&&sfx.kiss(); },
    IMPACT,()=>{ E2.apply(); for(const p of b2LiveParty()) scene('glow',.9,{x:home(p).x,y:home(p).base-40,rx:40,ry:56,c:'#ff9ac0',a:.35}); sfx.fountain(); bt('TO THE MOON',96,22,GOLD,2,1.2); },
    500,()=>{ for(const p of b2LiveParty()) if(p!==m) battle.fx[p.idx].hop=.3; sfx.heal(); },
    300,'There is no shortened version of this love. Everyone is Tucked In.',()=>checkEnemy()); };
D.registered_nut=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Deedee straightens her badge. The sticker says NUT.'); say('deedee','registered_nut'); scene('d_badge',1.0,{}); pose(fx,'expr',.9); },
    500,()=>{ scene('d_pulse',1.4,{x:h.x,y:h.base,h:h.h,foe:t.side==='foe'}); sfx.beep&&sfx.beep(); },
    IMPACT,()=>{ E2.apply(); sfx.heal(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'The bedside manner is brisk and affectionate.'),()=>checkEnemy()); };
D.corner_piece=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Deedee angles the pan. One corner is clearly the best corner.'); say('deedee','corner_piece'); scene('d_cornerpan',1.9,{}); pose(fx,'expr',1.0); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ scene('d_dishout',1.1,{x:h.x,y:h.base,h:h.h,foe:t.side==='foe'}); E2.apply(); sfx.heal(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'Somehow everybody is her favorite.'),()=>checkEnemy()); };
D.pepper_free_plate=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t),bop=B2.party.find(p=>p.id==='boppy'&&b2Alive(p));
  enqueue(()=>{ setMessage('The pepper jar goes behind a small card. The card says NOT TODAY.'); say('deedee','pepper_free_plate'); scene('d_nottoday',1.0,{}); pose(fx,'expr',.9); },
    500,()=>{ scene('d_bowl',1.4,{x:h.x,y:h.base,h:h.h,foe:t.side==='foe'}); sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); sfx.heal(); },
    500,()=>{ if(bop&&t.side!=='foe') { const b=home(bop); scene('d_plainportion',1.0,{x:b.x,y:b.base,h:b.h}); } pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'The recipe has been adjusted without a fuss.'),()=>checkEnemy()); };
D.rolling_pin_rounds=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee inspects the wind-up. Uneven. Needs a pass.'); say('deedee','rolling_pin_rounds'); scene('d_pin',1.9,{}); pose(fx,'expr',.5); },
    500,()=>{ pose(fx,'act',.7); sfx.whoosh(); },
    IMPACT,()=>{ sfx.thud(); sfx.bonk(); battle.enemyKnock=.3; battle.shakeEnemy=.45; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.select(); },
    300,res(E2)+'The dangerous bit is now much flatter.',()=>checkEnemy()); };
D.oven_mitt_ultimatum=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee puts on the serious mitts. Slowly.'); say('deedee','oven_mitt_ultimatum'); scene('d_mitts',1.9,{}); pose(fx,'expr',.6); },
    500,()=>{ sfx.charge(); },
    IMPACT,()=>{ scene('d_mittwave',.8,{foes:foesOf(E2)}); sfx.thud(); sfx.bonk(); battle.flashEnemy=.3; battle.shakeEnemy=.5; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); },
    300,res(E2)+'Deedee has used the serious mitts.',()=>checkEnemy()); };
D.brisk_means_brisk=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee sets off. Respectable posture. Arms moving.'); say('deedee','brisk_means_brisk'); pose(fx,'act',.5); fx.appr=1.0; fx.apprDur=1.0; sfx.run&&sfx.run(); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ scene('d_airthump',.8,{}); sfx.bonk(); battle.shakeEnemy=.35; battle.enemyKnock=.2; hit(E2); },
    400,()=>{ scene('d_sightsee',1.1,{}); pose(fx,'celeb',.5); sfx.select(); },
    400,res(E2)+'The stroll has become an event.',()=>checkEnemy()); };
D.garden_shower=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee checks the nozzle. GENTLE. Good.'); say('deedee','garden_shower'); scene('d_nozzle',1.9,{}); pose(fx,'expr',.6); },
    500,()=>{ scene('d_shower',1.2,{foes:foesOf(E2)}); sfx.spray?sfx.spray():sfx.vapor(); },
    IMPACT,()=>{ sfx.splat(); battle.shakeEnemy=.3; battle.enemyWobble=.4; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.select(); },
    300,res(E2)+'The watering schedule was ambitious.',()=>checkEnemy()); };
D.windows_open=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty());
  enqueue(()=>{ setMessage('Deedee unlatches a window that was not there a moment ago.'); say('deedee','windows_open'); scene('d_window',1.9,{}); pose(fx,'act',.6); sfx.doorIn&&sfx.doorIn(); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); for(const u of who) scene('glow',.9,{x:home(u).x,y:home(u).base-40,rx:36,ry:50,c:'#9fd8ff',a:.3}); sfx.ding(); },
    500,()=>{ for(const u of who) if(u.side==='party'&&u!==m) battle.fx[u.idx].hop=.25; pose(fx,'celeb',.5); },
    300,who.some(u=>u.side==='foe')?kindLine(who.find(u=>u.side==='foe')):'The stale mood goes out first.',()=>checkEnemy()); };
D.spotless_record=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Deedee holds up a spoon. The shine on that enemy is just surface.'); say('deedee','spotless_record'); scene('d_spoon',1.9,{}); scene('d_reflect',1.1,{}); pose(fx,'expr',.6); },
    500,()=>{ pose(fx,'act',.6); sfx.whoosh(); },
    IMPACT,()=>{ sfx.ding(); sfx.bonk(); battle.flashEnemy=.3; battle.shakeEnemy=.35; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.levelChime(); },
    300,res(E2)+'The shine has found a cleaner home.',()=>checkEnemy()); };
D.take_a_breather=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Deedee holds up one finger. One breath. Together.'); say('deedee','take_a_breather'); scene('d_breathring',1.8,{x:h.x,y:h.base,h:h.h,foe:t.side==='foe'}); pose(fx,'expr',1.0); },
    500,()=>{ sfx.vapor&&sfx.vapor(); },
    IMPACT,()=>{ E2.apply(); sfx.heal(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'Deedee makes a little space to breathe.'),()=>checkEnemy()); };
D.moon_back=E2=>D.hugShow(E2);   // the Option 3 signature key (data/abilities.js); the legacy key stays 'hug'
// Every move registers the unwarped scenes first (see NW above).
for(const k of ['dish_towel_flick','hugShow','moon_back','registered_nut','corner_piece','pepper_free_plate','rolling_pin_rounds','oven_mitt_ultimatum',
  'brisk_means_brisk','garden_shower','windows_open','spotless_record','take_a_breather']) { const f=D[k]; D[k]=E2=>{ NW(); return f(E2); }; }
})();
