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
const later=(ms,f)=>setTimeout(()=>{ if(battle.active) f(); },ms);
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
// A crescent moon rises, hearts fly from Deedee to everyone, everyone gets +5 HP and +2 MP. And a hug.
const deedeeHug=function() {
  busy();
  const i=battle.actor,m=party[i],fx=battle.fx[i];
  fx.hug=2.6;
  sfx.heal();
  say(m.id,'hug');
  scene('dcrescent',3.6,{back:true});
  enqueue(
    ()=>{ setMessage(m.name+' opens her arms. "To the moon and back. Everybody in."'); bt('TO THE MOON AND BACK',96,22,'#ffe08a',2,1.6); },
    700,()=>{ const h=homeOf(i); party.forEach((p,j)=>{ if(!alive(p)||j===i) return; const q=BATTLE_POS[j]; toss('dheart',h.cx-10,h.base-90,q.x*3,q.base*3-70,j*.08,.55,60,{spin:false,r:10}); }); S.smooch(); },
    700,()=>{
      party.forEach((p,j)=>{ if(!alive(p)) return; const h=Math.min(5,p.maxHp-p.hp),q=Math.min(2,p.maxMp-p.mp); p.hp+=h; p.mp+=q; pop('+'+h,BATTLE_POS[j].x,BATTLE_POS[j].base-34,'#9be39a');
        scene('glow',.9,{x:BATTLE_POS[j].x*3,y:BATTLE_POS[j].base*3-40,rx:40,ry:56,c:'#ff9ac0',a:.35}); });
      sfx.fountain(); refreshBattleStatus();
    },
    'Everyone gets +5 HP and +2 MP. And a hug. And a kiss on the head.',
    ()=>afterAction()
  );
};
cmdHug=deedeeHug; CMD_FN.hug=deedeeHug;
})();
