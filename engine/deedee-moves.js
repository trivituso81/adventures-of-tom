'use strict';
// engine/deedee-moves.js — Deedee's attacks, built from her life: retired registered nurse (Tom says registered nut),
// rhubarb crisp, big Sunday dinners, power walks, cleaning, and a glass of wine now and then.
// Same shape as tnb-moves.js: RECRUIT_MOVES.deedee[key] queues steps and registers scenes (RFX.SC), held items (RFX.HELD) and props (PROP2).
// Also holds her special, MOON & BACK (group hug: +5 HP and +2 MP for everyone).
RECRUIT_MOVES.deedee={};
const DD_XF=(k,fb)=>(BATTLE_SPRITES.deedee&&BATTLE_SPRITES.deedee['x_'+k])?'x_'+k:fb;   // painted extra pose if baked, else the older frame
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
  if(PROPART.draw('deedee/crisp_pan',x,y-4,{w:76})) return;   // painted pan with its own steam
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
    720,()=>{ pose(fx,DD_XF('lick','act'),.62); scene('dthumb',1.1,{x:GX+18,y:206}); S.squeak(); battle.enemyWobble=1.0; },
    360,()=>{ pose(fx,DD_XF('scrub','act'),.7); S.squeak(); },360,()=>{ S.squeak(); bt('SCRUB',96,32,'#fff1cb',3,.7); },
    420,()=>{ S.sparkle(); scene('dgleam',1.2,{x:GX,y:226}); battle.flashEnemy=.25; hit(E2); bt('SPARKLY',96,36,'#bfe6ff',3,.9); },
    800,E2.result+' Much better. Now it\'s presentable.',()=>checkEnemy()); };

// Power Walk: ten thousand steps, around and through the monster, arms pumping.
D.walk=E2=>{ const {i,m,fx}=E2; const LAP=.95,N=3,DUR=LAP*N; let face=1;
  enqueue(()=>{ setMessage('Deedee laces up. Morning walk. She doesn\'t stop for monsters.'); say(m.id,'walk',.1);
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
    900,E2.result+' Deedee isn\'t even out of breath. The '+enemyName().toLowerCase()+' is.',()=>checkEnemy()); };

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
  enqueue(()=>{ setMessage('Deedee mops the whole battlefield. It sparkles. It\'s VERY slippery.'); say(m.id,'mop',.2); hold(i,'dmop',2.4,{scrub:true}); scene('dwet',4.6,{}); S.swish(1.6);
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
  enqueue(()=>{ setMessage('Deedee pulls a rhubarb crisp out of the oven. It\'s still bubbling. Her recipe. Nobody gets the recipe.'); hold(i,'dcrisp',1.9,{}); pose(fx,'aim',1.9); say(m.id,'crisp',.3); S.bubbling(1.6); },
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
    300,'There\'s no shortened version of this love. Everyone is Tucked In.',()=>checkEnemy()); };
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
  enqueue(()=>{ setMessage('Deedee unlatches a window that wasn\'t there a moment ago.'); say('deedee','windows_open'); scene('d_window',1.9,{}); pose(fx,'act',.6); sfx.doorIn&&sfx.doorIn(); },
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

// ================= Option 3 set pieces (animation quality pass, 2026-10-24) =================
// Replaces the phase-3d animations above (1.6 s beats from her stance) with 3.5 to 5 s set pieces on engine/stage.js,
// the standard TNB's and Nara's moves use: Deedee power-walks over, nurses, bakes, waters and tidies, then goes home.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix dd_.
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
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const heartPath=(x,y,r)=>{ gfx.beginPath(); for(let k=0;k<=36;k++) { const a=k/36*Math.PI*2,hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a)); const px=x+hx*r/16,py=y+hy*r/16; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); };
const steam=(x,y,t,n=4,c='#fff6dc')=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.23)%1; gfx.globalAlpha=a0*(1-q); E(x-12+k*8+Math.sin(q*6+k)*4,y-q*34,4+q*3,4+q*3,c); } gfx.globalAlpha=a0; };
const D=RECRUIT_MOVES.deedee;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',CRUST='#d9a05a',RED='#e0402e',GREEN='#8ef0a0',SKIN='#f6d4b8';
ST.nw('dd_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const DSP=()=>BATTLE_SPRITES.deedee,DH=()=>DSP().idle.length*DSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-DH()*(st.sc||1)*.72+dy});   // her sprite has blank rows above the head
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'walkR':'walk';
const brisk=(u,tt)=>Math.sin(tt*14)>0?'run':'walk';   // arms pumping

// ---------- Shared scenes ----------
SC.dd_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.dd_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||38,s.ry||52,s.c||GOLD); };
SC.dd_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.dd_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.dd_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CREAM); } };

// ---------- Dish-Towel Flick ----------
SC.dd_spot=(s,u)=>{ const ms=s.t*1000; if(ms>s.gone) return; gfx.globalAlpha=1; R(s.x-3,s.y-3,6,6,'#2b2a26'); if(ms>s.seen) { ring(s.x,s.y,10+Math.sin(s.t*8)*2,10+Math.sin(s.t*8)*2,2,CREAM); label('SPOT',s.x,s.y-20,CREAM,1); } };
SC.dd_towel=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),x=h.x,y=h.y; gfx.globalAlpha=fade(u,.96);
  if(ms>P.fold) { const f=ez((ms-P.fold)/350),w=26-f*12; RO(x-w/2,y-6,w,12,CREAM); R(x-w/2+3,y-3,w-6,2,BLUE); R(x-w/2+3,y+1,w-6,2,BLUE); if(f>.9) label('SQUARE',x,y-22,CREAM,1); return; }
  const snap=ms<P.snap-100?0:Math.sin(cl((ms-P.snap+100)/350)*Math.PI),len=lerp(28,110,snap),ang=lerp(.9,-.05,snap); gfx.save(); gfx.translate(x,y); gfx.rotate(Math.PI-ang);
  gfx.beginPath(); gfx.moveTo(0,-7); gfx.quadraticCurveTo(len*.5,-7-snap*14,len,-4); gfx.lineTo(len,6); gfx.quadraticCurveTo(len*.5,8-snap*14,0,7); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=CREAM; gfx.fill();
  for(let k=1;k<4;k++) Ln(len*k/4,-6,len*k/4,6,2,BLUE); gfx.restore(); if(snap>.8) label('SNAP',x-len*.8,y-24,GOLD,2); };
D.dish_towel_flick=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,40),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:8},{t:1000,x:p.x,y:p.y,f:'aim',dx:u=>-ez(u)*6},{t:1500,f:'wind'},{t:1750,f:'throw',dx:-8},{t:2150,f:'clap'},{t:2600,f:'hip'},{t:2950,f:back(p.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee power-walks over. She\'s seen a spot. Nobody else has seen a spot.'); say(m.id,'dish_towel_flick'); scene('dd_spot',2.0,{x:F.x+8,y:F.mid-8,seen:1000,gone:1850}); scene('dd_towel',3.0,{plan:{snap:1850,fold:2150}}); }],
    [1500,()=>{ sfx.whoosh(); }],
    ['hf',1850],
    [1850,()=>{ sfx.bonk(); ST.jolt(f,.35); landHit(100); scene('dd_poof',.5,{x:F.x+8,y:F.mid-8,c:BLUE,n:8}); }],
    [2150,()=>{ sfx.select(); setMessage('She folds the towel into a precise square.'); }],
    [4000,'end',res(E2)+'The spot has been dealt with.']]); };

// ---------- MOON & BACK ----------
SC.dd_moon=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),mx=110,my=60,go=ez((ms-P.go)/(P.top-P.go)),bk=ez((ms-P.top)/(P.heart-P.top)); gfx.globalAlpha=fade(u,.94);
  EO(mx,my,16,16,'#fff1b0'); E(mx+6,my-2,12,12,'#1b1a2e');
  const x0=P.x0??h.x,y0=P.y0??h.y; if(ms>P.go&&ms<P.heart+300) { const ex=lerp(x0,mx+18,go),ey=lerp(y0,my+8,go); Ln(x0,y0,ex,ey,5,OUT); Ln(x0,y0,ex,ey,3,GOLD);
    const n=Math.floor(go*9); for(let k=1;k<=n;k++) { const q=k/9,lx=lerp(x0,mx+18,q),ly=lerp(y0,my+8,q); Ln(lx,ly-5,lx,ly+5,2,OUT); if(k%3===0) label(''+(k*100000),lx,ly-16,CREAM,1); }
    if(bk>0) { Ln(mx+18,my+8,lerp(mx+18,P.cx,bk),lerp(my+8,P.cy,bk),5,OUT); Ln(mx+18,my+8,lerp(mx+18,P.cx,bk),lerp(my+8,P.cy,bk),3,ROSE); } }
  if(ms>P.top&&ms<P.top+900) label('TO THE MOON',mx+70,my-6,GOLD,1);
  if(ms>P.heart) { const r=lerp(0,P.r,ez((ms-P.heart)/350)); for(const [w,c] of [[7,OUT],[4,ROSE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; heartPath(P.cx,P.cy,r); gfx.stroke(); } if(ms>P.heart+300) label('...AND BACK',P.cx,P.cy-P.r-20,GOLD,2); } };
D.hugShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),others=party.filter(p=>p!==m),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const cx=Math.round(U.reduce((a,q)=>a+q.x,0)/U.length),cy=Math.round(U.reduce((a,q)=>a+q.mid,0)/U.length),px=cx-20,py=Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+18);
  const K=[{t:0,x:'home',y:'home',f:px<me.x?'walk':'walkR',hop:3,hn:5},{t:700,x:px,y:py,f:DD_XF('hug','spread')},{t:900,f:'celeb'},{t:1700,f:DD_XF('hug','spread')}];
  let t=1800; const visits=[];
  for(const o of others) { const q=ST.unit(o),x=Math.min(560,q.x+q.w*.5+18),y=Math.min(316,q.base+3); K.push({t,f:'run'}); t+=380; K.push({t,x,y,f:'spread',dx:(u,tt)=>Math.sin(tt*20)*1.5}); visits.push([t,o]); t+=260; }
  const heartAt=t; K.push({t,f:'celeb',hop:10},{t:t+400,f:'walk'},{t:t+1000,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const plan={go:900,top:1600,heart:heartAt-500,cx,cy,r:Math.max(70,(Math.max(...U.map(q=>q.x))-Math.min(...U.map(q=>q.x)))*.7+30),x0:px-20,y0:py-DH()*.8};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks into the middle of everyone and opens her arms.'); say(m.id,'moon_back'); scene('dd_moon',(heartAt+1200)/1000,{plan}); }],
    [900,()=>{ sfx.charge(); setMessage('A measuring line heads for the moon. And keeps going.'); }],
    [1700,()=>{ setMessage('Then it comes all the way back. One hug each.'); }],
    ...visits.map(([ms,o])=>[ms,()=>{ const q=ST.unit(o); scene('dd_heart',.9,{x:q.x,y:q.top-4}); battle.fx[o.idx].hop=.3; sfx.kiss?sfx.kiss():sfx.select(); }]),
    ['hf',heartAt],
    [heartAt,()=>{ E2.apply(); for(const p of party) { const q=ST.unit(p); scene('dd_glow',.9,{x:q.x,y:q.mid,c:ROSE}); } sfx.fountain?sfx.fountain():sfx.heal(); sfx.heal(); }],
    [heartAt+1100,'end','There\'s no shortened version of this love. Everyone is Tucked In.']]); };
D.moon_back=E2=>D.hugShow(E2);

// ---------- Registered Nut, Reporting ----------
SC.dd_badge=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,x=st.x+4,y=st.y-DH()*.40,tilt=lerp(.35,0,ez((ms-s.fix)/300)); gfx.globalAlpha=fade(u,.95); gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(.8,.8);
  if(PROPART.draw('deedee/rn_badge',0,-4,{h:44})) { gfx.restore(); return; }   // painted RN REGISTERED NUT badge
  RO(-20,-10,40,20,CREAM); R(-20,-10,40,5,BLUE); label('RN',-8,-1,'#2b2a26',1); R(-2,-4,20,10,GOLD); label('NUT',8,-1,'#7a1a14',1); gfx.restore(); };
SC.dd_pulse=(s,u)=>{ const ms=s.t*1000,x=s.x,y=s.y,w=56,fix=cl((ms-s.fixAt)/300); gfx.globalAlpha=fade(u,.9); RO(x-w/2,y-16,w,32,'#1b2a2e');
  gfx.strokeStyle=GREEN; gfx.lineWidth=2; gfx.beginPath(); for(let k=0;k<=28;k++) { const q=k/28,px=x-w/2+4+q*(w-8),ph=(q*4+s.t*1.5)%1; let py; if(fix<1) py=y+Math.sin(q*40+s.t*20)*lerp(10,0,fix)*(k%3?1:.3); else py=y-(ph<.1?ph*120:ph<.2?(.2-ph)*120:0)*.7; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.stroke();
  if(fix>.95) label('OK',x+w/2-10,y-26,GREEN,2); };
D.registered_nut=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,22),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:600,f:'aim'},{t:1900,f:'act'},{t:2400,f:'throw'},{t:2800,f:'celeb',hop:8},{t:3200,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'hip'},{t:1100,f:'aim',dx:u=>-ez(u)*6},{t:1900,f:'act',dx:-6},{t:2400,f:'throw'},{t:2800,f:'celeb',hop:8},{t:3100,f:back(sp.x,me),hop:3,hn:6},{t:4000,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),end=self?3300:4100;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee checks herself. Registered nut, reporting.':'Deedee hurries over to '+t.name+'. Registered nut, reporting.'); say(m.id,'registered_nut'); scene('dd_badge',(end-200)/1000,{st,fix:self?300:900}); }],
    [self?600:1100,()=>{ setMessage('She takes a wrist and checks the pulse. The badge sticker says NUT.'); scene('dd_pulse',1.9,{x:H.x+(self?-60:-50),y:H.top-12,fixAt:self?1300:800}); sfx.beep&&sfx.beep(); }],
    ['hf',1900],
    [1900,()=>{ E2.apply(); sfx.heal(); scene('dd_glow',.9,{x:H.x,y:H.mid,c:GREEN}); hopOf(t!==m?t:null); }],
    [2400,()=>{ const h=hand(); ST.fly((x,y,uu)=>{ gfx.rotate(uu*5); RO(-8,-6,16,12,'#9aa3c8'); Ln(-4,0,4,0,2,'#2b2a26'); },H.x,H.top+14,h.x+120,h.y-60,.6,40); sfx.whoosh(); setMessage('She peels the unhelpful sticker off and pats a hand.'); }],
    [end,'end',kindLine(t,'The bedside manner is brisk and affectionate.')]]); };

// ---------- Corner-Piece Privilege ----------
const pan=(x,y,lift,regrow,rot=-.12)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-30,-12,60,24,'#c9c2b8'); R(-27,-9,54,18,CRUST); for(let k=0;k<6;k++) R(-24+k*9,-6+(k%2)*8,5,4,'#b0683a');
  const cw=14*(1-lift)+14*regrow; R(13,-9,cw,cw,'#f0b860'); gfx.restore(); };
SC.dd_pan=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),lift=ez((ms-P.lift)/250),regrow=ez((ms-P.regrow)/400); gfx.globalAlpha=fade(u,.96); pan(h.x-18,h.y+4,lift,regrow,ms>P.angle&&ms<P.lift?-.5:-.12);
  if(ms>P.angle&&ms<P.lift) label('CORNER',h.x-6,h.y-26,GOLD,1); if(regrow>.9) label('AGAIN',h.x-6,h.y-26,GOLD,1); };
SC.dd_dish=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.85); EO(s.x,s.y+6,16*g,6*g,CREAM); R(s.x-7*g,s.y-4,14*g,10,CRUST); R(s.x-7*g,s.y-6,14*g,4,'#f0b860'); steam(s.x,s.y-6,s.t,3); if(u>.4) heart(s.x,s.y-26,4,'#ff6b9a'); };
D.corner_piece=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,26),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'aim'},{t:900,f:'act'},{t:1500,f:'throw'},{t:1900,f:'hip'},{t:2600,f:'celeb',hop:8},{t:3100,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:6},{t:900,x:sp.x,y:sp.y,f:'aim'},{t:1300,f:'act',dx:u=>-ez(u)*8},{t:1800,f:'throw',dx:-8},{t:2200,f:'hip'},{t:2700,f:'celeb',hop:8},{t:3000,f:back(sp.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K); const lift=self?1000:1500,end=self?3200:4000;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee angles the crisp pan. One corner is clearly the best corner.':'Deedee carries the rhubarb crisp over to '+t.name+'.'); say(m.id,'corner_piece'); scene('dd_pan',(end-300)/1000,{plan:{angle:self?200:950,lift,regrow:lift+500}}); }],
    [lift,()=>{ sfx.whoosh(); setMessage('She lifts the golden corner onto a dish.'); const h=hand(); ST.fly((x,y)=>{ R(x-7,y-6,14,12,'#f0b860'); },h.x-4,h.y-4,H.x+(self?-26:6),H.mid,.35,30); }],
    ['hf',lift+400],
    [lift+400,()=>{ E2.apply(); sfx.heal(); scene('dd_dish',1.3,{x:H.x+(self?-26:6),y:H.mid}); hopOf(t!==m?t:null); }],
    [lift+600,()=>{ setMessage('The empty corner folds into a fresh golden one. Again.'); const h=hand(); ST.fly((x,y)=>{ R(x-2,y-2,4,4,CRUST); },h.x,h.y,h.x+30,h.y-60,.5,20); }],
    [end,'end',kindLine(t,'Somehow everybody is her favorite.')]]); };

// ---------- Pepper-Free Plate ----------
SC.dd_nottoday=(s,u)=>{ const ms=s.t*1000,x=s.x,y=s.y,slide=ez((ms-s.at)/300); gfx.globalAlpha=fin(u,.05)*fade(u,.9); RO(x-7+slide*12,y-14,14,22,'#e86040'); R(x-5+slide*12,y-16,10,4,'#2b2a26'); for(let k=0;k<3;k++) R(x-4+slide*12+k*3,y-8+k*4,2,2,'#f6c060');
  RO(x-16,y-12,30*slide+.1,20,CREAM); if(slide>.8) { label('NOT',x-1,y-8,RED,1); label('TODAY',x-1,y,RED,1); } };
SC.dd_bowl=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y; if(ms<P.set) { const h=hand(); x=h.x-6; y=h.y; } else { x=P.x; y=P.y; } gfx.globalAlpha=fade(u,.94);
  EO(x,y+4,16,8,CRUST); E(x,y-2,13,5,'#f6e2b8'); E(x,y-2,9,3,'#f0b860'); steam(x,y-4,s.t,4,'#ffd9a0'); };
SC.dd_plain=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.85); EO(s.x,s.y+4,12*g,5*g,CREAM); R(s.x-5*g,s.y-2,10*g,6,'#f6e2b8'); if(u>.3) label('PLAIN',s.x,s.y-18,CREAM,1); };
D.pepper_free_plate=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,26),self=t===m,me=ST.unit(m),bop=t.side!=='foe'&&B2.party.find(p=>p.id==='boppy'&&b2Alive(p)&&p!==t),BU=bop?ST.unit(bop):null;
  const K=[{t:0,x:'home',y:'home',f:'kneel'},{t:700,f:'act',dx:-6},{t:1000,f:'idle'}];
  if(self) K.push({t:1200,f:'aim'},{t:2200,f:'hip'});
  else K.push({t:1150,f:'walk',hop:3,hn:6},{t:1900,x:sp.x,y:sp.y,f:'aim',dx:u=>-ez(u)*8},{t:2400,f:'hip'});
  let t0=self?2600:2800,end;
  if(BU) { K.push({t:t0,f:BU.x+BU.w*.5+22<(self?me.x:sp.x)?'walk':'walkR'},{t:t0+700,x:Math.min(560,BU.x+BU.w*.5+22),y:Math.min(316,BU.base+3),f:'aim'},{t:t0+1100,f:'celeb',hop:8},{t:t0+1400,f:'walk'},{t:t0+2100,x:'home',y:'home',f:'idle'}); end=t0+2200; }
  else { K.push({t:t0,f:self?'celeb':back(sp.x,me),hop:3,hn:6},{t:t0+800,x:'home',y:'home',f:'idle'}); end=t0+900; }
  ST.keys(fx,K);
  const plan={set:self?1200:1900,x:H.x+(self?-40:4),y:H.mid+6},hit=self?1600:2300;
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee kneels and slides the pepper jar behind a small card.'); say(m.id,'pepper_free_plate'); scene('dd_nottoday',2.4,{x:me.x-60,y:me.base-24,at:600}); scene('dd_bowl',(end-200)/1000,{plan}); }],
    [self?1200:1150,()=>{ setMessage(self?'A warm baked bread bowl. For her, this time.':'She carries a warm bread bowl over to '+t.name+'. No peppers.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('dd_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('dd_glow',.9,{x:H.x,y:H.mid,c:'#ffd9a0'}); hopOf(t!==m?t:null); }],
    ...(BU?[[t0+700,()=>{ scene('dd_plain',1.2,{x:BU.x-26,y:BU.mid}); battle.fx[bop.idx].hop=.3; sfx.ding(); setMessage('Boppy gets a small plain portion. And a look.'); }]]:[]),
    [end,'end',kindLine(t,'The recipe has been adjusted without a fuss.')]]); };

// ---------- Rolling-Pin Rounds ----------
SC.dd_wind=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y,flat=cl((ms-P.hit+80)/160),flip=ez((ms-P.flip)/300); gfx.globalAlpha=fade(u,.9);
  if(ms<P.flip) { if(flat<1) { const h=lerp(22,4,flat); EO(x,y+22-h,18,h,'#f0d8b0'); if(ms<P.hit-500) label('UNEVEN',x,y-16,CREAM,1); } else { EO(x,y+20,26,3,'#f0d8b0'); label('FLAT',x,y-12,GOLD,2); } return; }
  const h=ST.cur?hand():{x,y},fx2=lerp(x,h.x-40,flip),fy=lerp(y+20,h.y-10,flip); gfx.save(); gfx.translate(fx2,fy); gfx.scale(1,Math.cos(flip*Math.PI)); EO(0,0,26,3,'#f0d8b0'); gfx.restore(); };
SC.dd_pin=(s,u)=>{ const ms=s.t*1000,h=hand(); if(ms>s.put) return; gfx.globalAlpha=1; gfx.save(); gfx.translate(h.x-6,h.y-4); gfx.rotate(ms>s.roll0&&ms<s.roll1?(ms-s.roll0)/60:0); RO(-20,-6,40,12,WOOD); RO(-30,-3,10,6,'#8a5a30'); RO(20,-3,10,6,'#8a5a30'); gfx.restore(); };
D.rolling_pin_rounds=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m),across=Math.max(30,F.x-F.w*.5+10);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'aim',dx:u=>-Math.sin(u*Math.PI)*6},{t:1500,f:'wind'},{t:1650,x:p.x,f:'act'},{t:2150,x:across+50,f:'act'},{t:2450,f:'aim'},{t:2850,f:'hip'},{t:3150,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={x:F.x,y:F.top-30,hit:2050,flip:2450};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee marches over with a rolling pin. The wind-up is uneven.'); say(m.id,'rolling_pin_rounds'); scene('dd_wind',3.4,{plan}); scene('dd_pin',3.0,{roll0:1650,roll1:2150,put:2900}); }],
    [900,()=>{ setMessage('She inspects it like a patch of pastry.'); }],
    [1650,()=>{ sfx.whoosh(); }],
    ['hf',2050],
    [2050,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.45); landHit(100); }],
    [2450,()=>{ setMessage('She turns it over, checks it, and sets it aside.'); sfx.select(); }],
    [4200,'end',res(E2)+'The dangerous bit is now much flatter.']]); };

// ---------- Oven Mitt Ultimatum ----------
SC.dd_mitts=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),on=ez((ms-P.on)/600),clap=ms>P.clap-80&&ms<P.clap+160?Math.sin(cl((ms-P.clap+80)/240)*Math.PI):0,hang=ez((ms-P.hang)/350);
  if(ms<P.on) return; gfx.globalAlpha=fade(u,.96);
  const mitt=(x,y,f)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(f*on,on); EO(0,0,15,19,'#f0a0a0'); EO(-12,-8,6,8,'#f0a0a0'); R(-10,10,20,6,CREAM); for(let k=0;k<4;k++) E(-9+k*6,-2,2,2,'#ffd0d0'); gfx.restore(); };
  const gap=lerp(24,3,clap),x=h.x+hang*40,y=h.y-12-hang*30; mitt(x-gap,y,1); mitt(x+gap,y,-1); if(hang>.9) Ln(x-30,y-24,x+30,y-24,2,WOOD); if(ms<P.on+700) label('FLUFFY',h.x,h.y-46,CREAM,1); };
SC.dd_wave=(s,u)=>{ const B=s.G,q=ez(u/.5),w=(B.x1-B.x0)/2+16*q,h=(B.base-B.top)/2+10*q,cx=(B.x0+B.x1)/2,cy=(B.top+B.base)/2; gfx.globalAlpha=fade(u,.6)*(1-q*.6);
  gfx.strokeStyle='rgba(255,180,90,.9)'; gfx.lineWidth=6; gfx.strokeRect(cx-w,cy-h,w*2,h*2); gfx.globalAlpha*=.3; R(cx-w,cy-h,w*2,h*2,'#ffb45a'); if(u>.2&&u<.7) { gfx.globalAlpha=fade(u,.6); label('ENOUGH',cx,B.top-26,GOLD,2); } };
D.oven_mitt_ultimatum=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,60),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'kneel'},{t:1000,f:'act',dx:(u,tt)=>Math.sin(tt*6)*2},{t:1700,f:'celeb'},{t:2150,f:'clap'},{t:2500,f:'hip'},{t:2900,f:'spread'},{t:3250,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={on:1000,clap:2150,hang:2900};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up to them and slowly puts on two very fluffy oven mitts.'); say(m.id,'oven_mitt_ultimatum'); scene('dd_mitts',3.4,{plan}); }],
    [1700,()=>{ sfx.charge(); setMessage('The fluffy mitts go up.'); }],
    ['hf',2150],
    [2150,()=>{ sfx.thud(); sfx.bonk(); scene('dd_wave',.9,{G:Gp}); all(list); landHit(100); }],
    [2900,()=>{ sfx.select(); setMessage('She hangs the mitts up neatly. The enemies look chastened.'); }],
    [4200,'end',res(E2)+'Deedee has used the serious mitts.']]); };

// ---------- Brisk Means Brisk ----------
SC.dd_thump=(s,u)=>{ const q=ez(u/.4); gfx.globalAlpha=fade(u,.7)*(1-q*.5); for(let k=0;k<3;k++) ring(s.x-10+k*6,s.y,8+q*22+k*4,14+q*26+k*4,2,CREAM); if(u>.25) label('WHUMP',s.x,s.y-50,CREAM,2); };
SC.dd_sign=(s,u)=>{ const g=ez(u/.15),rot=s.t*7; gfx.globalAlpha=fade(u,.85); const y=s.y-Math.sin(u*Math.PI)*20; if(PROPART.ready&&PROPART.ready('deedee/sightseeing_sign')) { gfx.save(); gfx.translate(s.x,y); gfx.scale(Math.cos(rot)*g,g); PROPART.draw('deedee/sightseeing_sign',0,-18,{h:52}); gfx.restore(); return; }   // painted SIGHTSEEING sign on its post, spinning
  RO(s.x-1,y-6,2,22,WOOD); gfx.save(); gfx.translate(s.x,y-10); gfx.scale(Math.cos(rot)*g,g); RO(-30,-8,60,16,CREAM); if(Math.abs(Math.cos(rot))>.4) label('SIGHTSEEING',0,-2,'#2b2a26',1); gfx.restore(); };
SC.dd_speed=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; if(ms<s.from||ms>s.to) return; gfx.globalAlpha=.6; const dir=s.dir(ms); for(let k=0;k<4;k++) R(st.x+dir*(26+k*9),st.y-DH()*.6+k*9,12-k*2,2,'rgba(255,246,220,.7)'); };
D.brisk_means_brisk=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),far=Math.max(24,F.x-F.w*.5-36),fy=Math.min(316,F.base+4),ret=Math.min(316,F.base+18);
  const passAt=Math.round(1400*(me.x-F.x)/(me.x-far));
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle'},{t:250,f:brisk,ease:'lin'},{t:1650,x:far,y:fy,f:'flip'},{t:1900,f:(u,tt)=>Math.sin(tt*14)>0?'runR':'walkR',dy:u=>Math.sin(u*Math.PI)*16,ease:'lin'},{t:3500,x:'home',y:'home',f:'idle'},{t:3700,f:'hip'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee sets off. Perfectly respectable posture. Arms moving.'); say(m.id,'brisk_means_brisk'); scene('dd_speed',3.6,{st,from:250,to:3500,dir:ms=>ms<1650?1:-1}); }],
    [250,()=>{ sfx.run&&sfx.run(); }],
    ['hf',250+passAt],
    [250+passAt,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('dd_thump',.8,{x:F.x,y:F.mid}); }],
    [500+passAt,()=>{ scene('dd_sign',1.4,{x:F.x+14,y:F.base}); setMessage('Straight through. A tiny SIGHTSEEING sign spins in her wake.'); sfx.select(); }],
    [1650,()=>{ setMessage('She turns at the far end and keeps walking. Brisk means brisk.'); }],
    [3900,'end',res(E2)+'The stroll has become an event.']]); };

// ---------- Garden Shower ----------
SC.dd_nozzle=(s,u)=>{ const ms=s.t*1000,h=hand(),x=h.x-6,y=h.y-2; gfx.globalAlpha=fade(u,.94); RO(x-8,y-6,22,12,'#5fa05a'); RO(x+14,y-4,8,8,'#9aa3c8'); R(x-14,y-2,6,4,'#5fa05a');
  if(ms<s.spray0||ms>s.spray1) { RO(x-24,y-30,48,14,CREAM); label('GENTLE',x,y-26,'#2f6b3a',1); if(ms>s.spray1) label('GOOD',x,y-42,CREAM,1); } };
SC.dd_spray=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms<P.s0||ms>P.s1) return; const q=(ms-P.s0)/(P.s1-P.s0),tx=lerp(P.x1+10,P.x0-10,q); gfx.globalAlpha=.9;
  for(let k=0;k<26;k++) { const f=k/26,x=lerp(h.x-14,tx+Math.sin(f*9+s.t*20)*10,f),y=lerp(h.y-4,P.y0-10+f*30,f)-Math.sin(f*Math.PI)*40+((f*7+s.t*3)%1)*12; E(x,y,3,4,BLUE); }
  for(const p of P.list) if(Math.abs(p.x-tx)<p.w*.6) { gfx.globalAlpha=.6; E(p.x,p.base,p.w*.45,5,'#6aa8e0'); } };
D.garden_shower=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,70),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'aim'},{t:1500,f:'aim',dx:u=>-Math.sin(u*Math.PI)*14,dy:u=>Math.sin(u*Math.PI*2)*3},{t:2700,f:'hip'},{t:3150,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={s0:1500,s1:2700,x0:Gp.x0,x1:Gp.x1,y0:Gp.top,list:list.map(f=>ST.foe(f))},hit=2100;
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks over with the garden hose. She checks the nozzle. GENTLE. Good.'); say(m.id,'garden_shower'); scene('dd_nozzle',3.2,{spray0:1500,spray1:2700}); scene('dd_spray',3.0,{plan}); }],
    [1500,()=>{ sfx.spray?sfx.spray():sfx.vapor&&sfx.vapor(); b7Later(()=>sfx.spray&&sfx.spray(),400); b7Later(()=>sfx.spray&&sfx.spray(),800); setMessage('One wide, thorough sweep.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.splat(); all(list); landHit(100); }],
    [2700,()=>{ setMessage('She checks the nozzle again. Very gentle.'); }],
    [4200,'end',res(E2)+'The watering schedule was ambitious.']]); };

// ---------- Windows Open ----------
SC.dd_window=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.x,y=P.y,carry=ms<P.set; if(carry) { const h=hand(); x=h.x-20; y=h.y-30; }
  const sc=carry?.55:1,open=ez((ms-P.open)/400),bil=Math.sin(s.t*3)*.5+.5; gfx.globalAlpha=fade(u,.94); gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  RO(-28,-36,56,72,WOOD); R(-24,-32,48,64,'#bfe4ff'); R(-2,-32,4,64,WOOD); R(-24,-2,48,4,WOOD);
  if(open>0) for(const sd of [-1,1]) { const cw=14+bil*10*open,bx=sd*26; gfx.beginPath(); gfx.moveTo(bx,-34); gfx.quadraticCurveTo(bx+cw*open*2,0,bx,34); gfx.lineTo(bx-sd*8,34); gfx.quadraticCurveTo(bx-sd*8+cw*open*2.4,0,bx-sd*8,-34); gfx.closePath(); gfx.fillStyle=ROSE; gfx.fill(); }
  gfx.restore(); if(!carry&&ms<P.open) label('LATCH',x,y-50,CREAM,1);
  if(ms>P.out) { for(let k=0;k<5;k++) { const q=cl((ms-P.out-k*120)/700); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; const ix=lerp(P.from[k%P.from.length].x,x+30,ez(q))+q*60,iy=lerp(P.from[k%P.from.length].y,y-10,ez(q))-q*30; if(k%2) RO(ix-6,iy-6,12,12,'#4a4a60'); else R(ix-3,iy-3,6,6,'#e8b048'); } }
  if(ms>P.heart) { gfx.globalAlpha=fade(u,.94); heart(x,y-50,7,'#ff6b9a'); label('FRESH START',x,y+50,ROSE,1); } };
D.windows_open=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const wx=foe?front(U[0],60).x:Math.max(80,Math.min(...U.map(q=>q.x))-70),wy=(foe?U[0].mid:Math.round(U.reduce((a,q)=>a+q.mid,0)/U.length));
  const sx=Math.min(560,wx+44),sy=foe?front(U[0],60).y:Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+10);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:1000,x:sx,y:sy,f:'kneel'},{t:1300,f:'act',dx:-6},{t:1700,f:(u,tt)=>Math.floor(tt*8)%2?'wind':'throw'},{t:2700,f:'spread'},{t:3100,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={set:1000,open:1350,out:1750,heart:2500,x:wx,y:wy,from:U.map(q=>({x:q.x,y:q.mid}))};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee carries over a freestanding window and sets it down beside everyone.'); say(m.id,'windows_open'); scene('dd_window',3.8,{plan}); }],
    [1350,()=>{ sfx.doorIn?sfx.doorIn():sfx.select(); sfx.whoosh(); setMessage('She unlatches it. Warm air in. She shoos the stale mood out with her apron.'); }],
    ['hf',2100],
    [2100,()=>{ E2.apply(); for(const u of who) { const q=ST.unit(u); scene('dd_glow',.9,{x:q.x,y:q.mid,c:'#9fd8ff'}); hopOf(u!==m?u:null); } sfx.ding(); }],
    [4200,'end',foe?kindLine(foe):'The stale mood goes out first.']]); };

// ---------- Spotless Record ----------
SC.dd_spoon=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),x=h.x-4,y=h.y-24,pol=ms>P.p0&&ms<P.p1?Math.sin((ms-P.p0)/40):0,bright=ez((ms-P.p1)/200); gfx.globalAlpha=fade(u,.94);
  gfx.save(); gfx.translate(x,y); gfx.rotate(-.4); RO(-3,0,6,34,bright?'#dde8f0':'#8a8a90'); EO(0,-8,10,13,bright?'#eef6ff':'#9a9aa0'); if(bright) E(-3,-11,3,4,CREAM); else { E(2,-6,4,5,'#5f5f66'); if(ms<P.p0+200) { EO(1,-8,4,4,GOLD); } } gfx.restore();
  if(pol) Ln(x-12+pol*6,y-16,x+6+pol*6,y-24,3,CREAM); if(ms<P.p0) label('TARNISHED',x,y-34,CREAM,1); };
SC.dd_buffshine=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.fx,y=P.fy; if(ms>P.p1) { const st=s.st,q=ez((ms-P.p1)/400); if(st&&st.x!=null) { x=lerp(P.fx,st.x+6,q); y=lerp(P.fy,st.y-DH()*.36,q)-Math.sin(q*Math.PI)*30; } } gfx.globalAlpha=fade(u,.94);
  EO(x,y,8,8,GOLD); for(let k=0;k<6;k++) { const a=s.t*5+k*Math.PI/3; Ln(x+Math.cos(a)*11,y+Math.sin(a)*11,x+Math.cos(a)*15,y+Math.sin(a)*15,2,GOLD); } if(ms>P.p1+450) label('SHINE',x,y-22,GOLD,1); };
D.spotless_record=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'aim'},{t:1400,f:(u,tt)=>Math.floor(tt*14)%2?'act':'wind',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2200,f:'act',dx:-8},{t:2500,f:'hip'},{t:3000,f:'aim'},{t:3300,f:back(p.x,me),hop:3,hn:6},{t:4200,x:'home',y:'home',f:'idle'}]);
  const plan={p0:1400,p1:2200,fx:F.x+F.w*.3,fy:F.top-10};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up with a serving spoon. The shine on that enemy is just surface.'); say(m.id,'spotless_record'); scene('dd_spoon',3.3,{plan}); scene('dd_buffshine',3.4,{st,plan}); }],
    [1400,()=>{ setMessage('One brisk polish. Then another. Then several.'); for(let k=0;k<5;k++) b7Later(()=>sfx.whoosh(),k*150); }],
    ['hf',2200],
    [2200,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.4); landHit(100); }],
    [2500,()=>{ sfx.levelChime(); setMessage('The shine moves onto her apron. She checks her reflection.'); }],
    [4300,'end',res(E2)+'The shine has found a cleaner home.']]); };

// ---------- Take a Breather ----------
SC.dd_breath=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.in-250) return; const ph=ms<P.in?0:(ms<P.peak?ez((ms-P.in)/(P.peak-P.in)):1-ez((ms-P.peak)/(P.out-P.peak))*.7),r=10+ph*22; gfx.globalAlpha=fade(u,.9);
  E(P.x,P.y,r,r,'rgba(255,200,90,.22)'); ring(P.x,P.y,r,r,3,'#ffb45a'); label(ms<P.peak?'IN':'OUT',P.x,P.y-3,'#ffb45a',2);
  if(ms>P.in-200&&ms<P.out) { const h=hand(); RO(h.x-2,h.y-24,4,16,SKIN); EO(h.x,h.y-8,6,6,SKIN); label('ONE',h.x,h.y-38,CREAM,1); } };
D.take_a_breather=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,24),self=t===m,me=ST.unit(m);
  const breathe=u=>1+Math.sin(cl(u)*Math.PI)*.06;
  const K=self?[{t:0,x:'home',y:'home',f:'sit'},{t:600,f:'aim'},{t:1200,f:'sit',sc:breathe},{t:2600,f:'act'},{t:2900,f:'celeb',hop:8},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:900,x:sp.x,y:sp.y,f:'sit'},{t:1100,f:'aim'},{t:1500,f:'sit',sc:breathe},{t:2800,f:'act',dx:-6},{t:3100,f:'idle'},{t:3300,f:back(sp.x,me),hop:3,hn:6},{t:4200,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={x:H.x+(self?-50:-40),y:H.top-14,in:self?1200:1500,peak:self?1900:2200,out:self?2600:2900},end=self?3400:4300,hit=plan.peak+150;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee sits down for one proper breath.':'Deedee sits down next to '+t.name+' and holds up one finger.'); say(m.id,'take_a_breather'); scene('dd_breath',(plan.out+300)/1000,{plan}); }],
    [plan.in,()=>{ setMessage('In. Slowly. She breathes with them.'); sfx.vapor&&sfx.vapor(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('dd_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a'}); hopOf(t!==m?t:null); }],
    [plan.out-100,()=>{ scene('dd_heart',1,{x:H.x,y:H.top-6}); sfx.ding(); }],
    [end,'end',kindLine(t,'Deedee makes a little space to breathe.')]]); };
})();

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Deedee's review: things Deedee actually does (tidies, nurses, bakes, mops, a glass of wine, power-walks with hand
// weights, gardens, yanks the shades open, squeezes everyone). One big readable moment per move, props 2 to 3x larger.
// Kept, bigger: Dish-Towel Flick (towel), Registered Nut (stethoscope and a bandage pop), Corner-Piece (steaming pan),
// Brisk Means Brisk (hand weights), Garden Shower (hose arc). New on the same numbers: Wet Floor! (A3, key wet_floor),
// Wine O'Clock (A4, key wine: the legacy 'wine' handler routes o3 casts here), Rise and Shine (B3), Beanie Master (B4),
// Grandma Squeeze (B5). Scenes prefix dv_ (no warp). The older functions above stay for the old keys.
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
const heartO=(x,y,r,c)=>{ heart(x,y,r+2.5,OUT); heart(x,y,r,c); };
const D=RECRUIT_MOVES.deedee;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',CRUST='#d9a05a',RED='#e0402e',GREEN='#8ef0a0',WATER='#7cc4f4',SILVER='#cfd6de',LIP='#d8203a',STINK='#9ed86a';
ST.nw('dv_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const liveFoes=()=>(B2.foes||[]).filter(f=>!f.dead&&f.hp>0);
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
// Both hands (n = near/left, f = far/right) while a path runs.
const hands=()=>{ const st=ST.cur; if(st&&st.fx&&st.fx.path&&st.sp&&st.x!=null) { const fr=st.frame,sp=st.sp,h=sp.handAt&&sp.handAt.get(fr),sc=sp.scale*(st.sc||1),w=fr[0].length*sc,H=fr.length*sc;
    if(h) return {n:{x:st.x-w/2+h.n[0]*sc,y:st.y-H+h.n[1]*sc},f:{x:st.x-w/2+h.f[0]*sc,y:st.y-H+h.f[1]*sc}}; }
  const a=hand(); return {n:a,f:{x:a.x+22,y:a.y}}; };
const DSP=()=>BATTLE_SPRITES.deedee,DH=()=>DSP().idle.length*DSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-DH()*(st.sc||1)*.72+dy});
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'walkR':'walk';
const brisk=(u,tt)=>Math.sin(tt*14)>0?'run':'walk';
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const HEADF={tom:.86,grace:.84,rose:.84,nara:.62};
// A unit's cheek (the face side is the left for the party, facing the monsters).
const cheek=u=>{ const U=ST.unit(u); if(u.side==='foe') return {x:U.x+U.w*.12,y:U.top+U.h*.4}; const hf=HEADF[u.id]||.72; return {x:U.x-U.w*.16,y:U.base-U.h*(hf-.13)}; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.dv_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.dv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; } const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.dv_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.dv_hearts=(s,u)=>{ for(let k=0;k<(s.n||5);k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; heart(s.x-20+k*10+Math.sin(q*6+k)*5,s.y-q*44,6+(k%2)*2,k%2?ROSE:'#ff6b9a'); } };
SC.dv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.dv_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,3,s.c||CREAM); } };
SC.dv_drops=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI*(1.1+k/((s.n||10)-1)*.8),d=ez(u)*(s.r||36),x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d+u*u*30; gfx.globalAlpha=1-u; E(x,y,3,4,s.c||WATER); } };
if(!sfx.ting) sfx.ting=(d=0)=>{ tone({type:'sine',f0:2637,dur:.6,vol:.16,delay:d}); tone({type:'triangle',f0:5274,dur:.35,vol:.05,delay:d}); };
if(!sfx.heartbeat) sfx.heartbeat=(d=0)=>{ tone({type:'sine',f0:70,f1:50,dur:.12,vol:.35,delay:d}); tone({type:'sine',f0:62,f1:45,dur:.14,vol:.3,delay:d+.17}); };
// Beanie Master's toot: a sound effect, never speech. A real fart: an air "pfft", a fast flutter of low buzzes that sags in pitch,
// a rumbling body under it, then three little sputters. Loud on purpose (about 3x the old one). Kid-safe silly.
sfx.toot=(d=0)=>{
  noise({dur:.16,vol:1.2,delay:d,f0:1900,f1:450,type:'bandpass',q:.7});
  let t=d+.04;
  for(let k=0;k<26;k++) { const q=k/26,f=150-q*98+((k%3)-1)*11*(1-q*.4);
    tone({type:'sawtooth',f0:f,f1:f*.84,dur:.07,vol:1.15-q*.3,delay:t,filter:950-q*380,q:3,attack:.003}); t+=.028+q*.01; }
  tone({type:'square',f0:80,f1:44,dur:1.0,vol:.65,delay:d+.03,filter:380,q:2,sweep:'lin'});
  noise({dur:1.05,vol:.85,delay:d+.03,f0:750,f1:170,type:'lowpass'});
  [.9,1.0,1.12].forEach((o,i)=>{ tone({type:'sawtooth',f0:86-i*12,f1:56-i*8,dur:.1,vol:1.0,delay:d+o,filter:520,q:2}); noise({dur:.09,vol:.34,delay:d+o,f0:650,f1:200,type:'lowpass'}); });
};

// ---------- Dish-Towel Flick (basic, kept: only the towel is bigger) ----------
SC.dv_towel=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),x=h.x,y=h.y; gfx.globalAlpha=fade(u,.96);
  if(ms>P.fold) { const f=ez((ms-P.fold)/350),w=58-f*24; RO(x-w/2-10,y-14,w,28,CREAM); for(const dy of [-7,0,7]) R(x-w/2-6,y+dy-1,w-8,3,BLUE); if(f>.9) bigWord('SQUARE',x-10,y-36,CREAM,2); return; }
  const reach=Math.max(80,x-s.tx+16),snap=ms<P.snap-120?0:Math.sin(cl((ms-P.snap+120)/380)*Math.PI),wob=ms>P.wind&&ms<P.snap-120?Math.sin(ms/45)*.18:0;
  const len=lerp(60,reach,snap),ang=lerp(1.0,-.05,snap)+wob,th=16;
  gfx.save(); gfx.translate(x,y); gfx.rotate(Math.PI-ang);
  gfx.beginPath(); gfx.moveTo(0,-th); gfx.quadraticCurveTo(len*.5,-th-snap*26,len,-th*.6); gfx.lineTo(len+8,th*.8); gfx.quadraticCurveTo(len*.5,th-snap*26,0,th); gfx.closePath();
  gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=CREAM; gfx.fill();
  for(let k=1;k<5;k++) Ln(len*k/5,-th*.8-snap*18*Math.sin(k/5*Math.PI),len*k/5+2,th*.8-snap*18*Math.sin(k/5*Math.PI),4,BLUE);
  for(let k=0;k<4;k++) Ln(len+8,-th*.4+k*th*.4,len+16,-th*.5+k*th*.4,2,CREAM);
  gfx.restore(); if(snap>.75) bigWord('SNAP!',x-len*.6,y-44,GOLD,3); };
D.dish_towel_flick=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,40),me=ST.unit(m);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:8},{t:1000,x:p.x,y:p.y,f:'aim',dx:u=>-ez(u)*6},{t:1500,f:'wind'},{t:1750,f:'throw',dx:-8},{t:2150,f:'clap'},{t:2600,f:'hip'},{t:2950,f:back(p.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee power-walks over. She\'s seen a spot. Nobody else has seen a spot.'); say(m.id,'dish_towel_flick'); scene('dd_spot',2.0,{x:F.x+8,y:F.mid-8,seen:1000,gone:1850}); scene('dv_towel',3.0,{tx:F.x+8,plan:{wind:1500,snap:1850,fold:2150}}); }],
    [1500,()=>{ sfx.whoosh(); setMessage('She twists her big dish towel into a rope.'); }],
    ['hf',1850],
    [1850,()=>{ sfx.bonk(); sfx.slash&&sfx.slash(); ST.jolt(f,.45); landHit(100); scene('dv_rings',.5,{x:F.x+8,y:F.mid-8,c:BLUE,r:36}); scene('dv_big',1.1,{x:F.x,y:F.top-74,txt:'FLICK!',c:CREAM,sc:4}); }],
    [2150,()=>{ sfx.select(); setMessage('She folds the towel into a precise square.'); }],
    [4000,'end',res(E2)+'The spot has been dealt with.']]); };

// ---------- Registered Nut, Reporting (A1, kept: big stethoscope and a bandage pop) ----------
SC.dv_steth=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,P=s.P,hd=head(st),own={x:st.x-6,y:st.y-DH()*.40},go=ez((ms-P.on)/300);
  const cx=lerp(own.x,P.x,go),cy=lerp(own.y,P.y,go),jx=hd.x-2,jy=hd.y+22; gfx.globalAlpha=fade(u,.95);
  for(const ex of [-11,11]) { LnO(hd.x+ex,hd.y+8,jx,jy+4,3,'#3a3f46'); EO(hd.x+ex,hd.y+8,3,3,SILVER); }
  gfx.lineCap='round'; for(const [w,c] of [[9,OUT],[5,'#3a3f46']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(jx,jy); gfx.quadraticCurveTo((jx+cx)/2,Math.max(jy,cy)+40,cx,cy); gfx.stroke(); }
  EO(cx,cy,14,14,SILVER); E(cx,cy,9,9,'#9aa6b2'); E(cx-4,cy-4,4,4,'#ffffff');
  if(ms>P.b0&&ms<P.b1) { const ph=((ms-P.b0)%520)/520,beat=ph<.15?ph/.15:ph<.3?1-(ph-.15)/.15*.5:.5*(1-(ph-.3)/.7),hx=P.x+(P.foe?0:-6),hy=P.y-44;
    heartO(hx,hy,10+beat*9,'#ff4a6a'); if(ph<.5) bigWord('BA-DUMP',hx,hy-40,CREAM,2); } };
SC.dv_bandage=(s,u)=>{ const pop=u<.1?ez(u/.1)*1.35:lerp(1.35,1,cl((u-.1)/.1)); gfx.globalAlpha=fade(u,.88); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(pop,pop);
  if(PROPART.draw('deedee/bandage',0,0,{w:60,rot:-.5})) { PROPART.draw('deedee/bandage',0,0,{w:60,rot:.5}); gfx.restore(); return; }   // painted heart bandage, crossed twice like the drawn pair
  for(const a of [-.6,.6]) { gfx.save(); gfx.rotate(a); RO(-26,-8,52,16,'#f0c890'); RO(-8,-6,16,12,'#fff0d8'); for(const dx of [-20,-14,14,20]) for(const dy of [-3,3]) R(dx-1,dy-1,2,2,'#c99a62'); gfx.restore(); }
  gfx.restore(); };
D.registered_nut=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,22),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:DD_XF('nurse','aim')},{t:1900,f:'clap'},{t:2300,f:'celeb',hop:8},{t:2800,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'hip'},{t:1050,f:DD_XF('nurse','aim'),dx:u=>-ez(u)*6},{t:2000,f:'clap',dx:-6},{t:2350,f:'celeb',hop:8},{t:2900,f:back(sp.x,me),hop:3,hn:6},{t:3800,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),end=self?3200:3900,hit=self?1900:2050;
  const P={on:self?400:850,x:self?me.x-6:(foe?H.x+H.w*.2:H.x-H.w*.05),y:self?me.base-DH()*.40:H.mid+(foe?0:H.h*.06),b0:self?700:1150,b1:hit-80,foe};
  const bx=foe?H.x:H.x-H.w*.08,by=foe?H.mid:H.mid-H.h*.12;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee checks herself. Registered nut, reporting.':'Deedee hurries over to '+t.name+'. Registered nut, reporting.'); say(m.id,'registered_nut'); scene('dd_badge',(end-200)/1000,{st,fix:self?300:900}); scene('dv_steth',(hit+500)/1000,{st,P}); }],
    [P.b0,()=>{ setMessage('Out comes the big stethoscope. Ba-dump. Ba-dump.'); for(let k=0;k<3;k++) sfx.heartbeat(k*.52); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.boing(); scene('dv_bandage',(end-hit)/1000,{x:self?me.x-14:bx,y:self?me.base-DH()*.5:by}); scene('dv_big',1.1,{x:self?me.x:H.x,y:(self?me.top:H.top)-40,txt:'POP!',c:CREAM,sc:4}); scene('dv_glow',.9,{x:H.x,y:H.mid,c:GREEN}); hopOf(t!==m?t:null); setMessage('A bandage. A big one. Right where it counts.'); }],
    [end,'end',kindLine(t,'Vitals: excellent. Bandage: enormous.')]]); };

// ---------- Corner-Piece Privilege (A2, kept: a big steaming pan) ----------
const bigSteam=(x,y,t,n,c,h=70)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*.9+k*.19)%1; gfx.globalAlpha=a0*(1-q)*.9; E(x-(n-1)*9+k*18+Math.sin(q*6+k)*8,y-q*h,7+q*8,7+q*8,c); } gfx.globalAlpha=a0; };
const bigPan=(x,y,lift,regrow,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-62,-6,12,8,'#9a948a'); RO(50,-6,12,8,'#9a948a'); RO(-52,-20,104,40,'#c9c2b8'); R(-47,-15,94,30,CRUST);
  for(let k=0;k<14;k++) R(-42+(k%7)*13,-11+Math.floor(k/7)*12+(k%2)*3,7,5,'#b0483a'); for(let k=0;k<8;k++) R(-40+k*12,-14,6,3,'#f0c070');
  const cw=26*(1-lift)+26*regrow; if(cw>.5) { R(21+(26-cw),-15,cw,cw*.9,'#f0b860'); R(21+(26-cw),-15,cw,3,'#ffd890'); } gfx.restore(); };
SC.dv_pan=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),lift=ez((ms-P.lift)/250),regrow=ez((ms-P.regrow)/400),cx=h.x-30,cy=h.y-14; gfx.globalAlpha=fade(u,.96);
  gfx.save(); gfx.translate(cx,cy); gfx.scale(.85,.85); bigPan(0,0,lift,regrow,ms>P.angle&&ms<P.lift?-.28:-.08); gfx.restore(); bigSteam(cx,cy-20,s.t,5,'#fff6dc');
  if(ms<P.angle) bigWord('HOT!',cx-30,cy-70+Math.sin(s.t*10)*2,'#ffb070',2); if(ms>P.angle&&ms<P.lift) bigWord('CORNER',cx+20,cy-70,GOLD,2); if(regrow>.9) bigWord('AGAIN',cx+20,cy-70,GOLD,2); };
SC.dv_dish=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.85); if(PROPART.draw('deedee/plate_with_corner_piece',s.x,s.y,{w:62*g})) { bigSteam(s.x,s.y-14,s.t,3,'#fff6dc',44); if(u>.35) heartO(s.x,s.y-50,7,'#ff6b9a'); return; }   // painted plate with the corner piece (ice cream on top)
  EO(s.x,s.y+10,28*g,9*g,CREAM); R(s.x-13*g,s.y-8,26*g,18,CRUST); R(s.x-13*g,s.y-10,26*g,6,'#f0b860'); for(let k=0;k<3;k++) R(s.x-9*g+k*8*g,s.y-2,4,3,'#b0483a'); bigSteam(s.x,s.y-10,s.t,3,'#fff6dc',44); if(u>.35) heartO(s.x,s.y-50,7,'#ff6b9a'); };
D.corner_piece=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,52),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'aim'},{t:900,f:'act'},{t:1500,f:'throw'},{t:1900,f:'hip'},{t:2600,f:'celeb',hop:8},{t:3100,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:6},{t:900,x:sp.x,y:sp.y,f:'aim'},{t:1300,f:'act',dx:u=>-ez(u)*8},{t:1800,f:'throw',dx:-8},{t:2200,f:'hip'},{t:2700,f:'celeb',hop:8},{t:3000,f:back(sp.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K); const lift=self?1000:1500,end=self?3200:4000,dx=self?me.x-60:Math.max(24,H.x-H.w*.5-14),dy=self?me.mid:H.mid+6;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee pulls a whole steaming pan of rhubarb crisp out of the oven. One corner is clearly the best corner.':'Deedee marches a whole steaming pan of rhubarb crisp over to '+t.name+'.'); say(m.id,'corner_piece'); scene('dv_pan',(end-300)/1000,{plan:{angle:self?200:950,lift,regrow:lift+500}}); }],
    [lift,()=>{ sfx.whoosh(); setMessage('She lifts the golden corner onto a dish.'); const h=hand(); ST.fly((x,y)=>{ RO(x-12,y-10,24,20,'#f0b860'); },h.x+10,h.y-10,dx,dy,.35,40); }],
    ['hf',lift+400],
    [lift+400,()=>{ E2.apply(); sfx.heal(); scene('dv_dish',(end-lift-400)/1000,{x:dx,y:dy}); scene('dv_big',1.2,{x:dx,y:Math.min(dy-60,H.top-50),txt:'CORNER PIECE!',c:GOLD,sc:3}); hopOf(t!==m?t:null); }],
    [lift+700,()=>{ setMessage('The empty corner fills back in with a fresh golden one. Again.'); }],
    [end,'end',kindLine(t,'Somehow everybody is her favorite.')]]); };

// ---------- Wet Floor! (A3; key wet_floor; same numbers as Pepper-Free Plate) ----------
// She mops around the friend (the sticky Amber comes right up), puts out a big yellow sign, and the shine runs all the way
// across the floor. A monster steps on it and slips. Kind on a monster: she mops right under it.
SC.dv_mop=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const h=hand(),fl=st.y-2,swish=s.t*1000>s.m0&&s.t*1000<s.m1?Math.sin(s.t*14)*14:0; gfx.globalAlpha=fade(u,.96);
  const top={x:h.x+26,y:h.y-70},hx=h.x-30+swish,hy=fl; if(PROPART.draw('deedee/mop',hx+12,hy-44,{h:96,rot:swish*.012})) return;   // painted mop, head on the floor
  LnO(top.x,top.y,hx+6,hy-14,4,WOOD);
  gfx.save(); gfx.translate(hx,hy-6); RO(-18,-12,36,6,'#8a8f98'); for(let k=0;k<9;k++) { const x=-16+k*4,sw=Math.sin(s.t*14+k)*3; LnO(x,-6,x+sw-3,10,2,'#e8e2d0'); } gfx.restore(); };
SC.dv_bucket=(s,u)=>{ const g=ez(u/.1); gfx.globalAlpha=fade(u,.94); const x=s.x,y=s.y; gfx.save(); gfx.translate(x,y); gfx.scale(g,g);
  if(PROPART.draw('deedee/mop_bucket',0,-24,{h:50})) { gfx.restore(); return; }   // painted yellow mop bucket
  gfx.beginPath(); gfx.moveTo(-18,-28); gfx.lineTo(18,-28); gfx.lineTo(14,0); gfx.lineTo(-14,0); gfx.closePath(); gfx.fillStyle='#f0c43a'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  E(0,-28,18,4,'#6aa8e0'); gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(0,-28,16,Math.PI,0); gfx.stroke(); for(let k=0;k<3;k++) { const q=(s.t+k/3)%1; gfx.globalAlpha=(1-q)*.8; E(-8+k*8,-32-q*12,3,3,'#e6f7ff'); } gfx.restore(); };
SC.dv_amber=(s,u)=>{ const ms=s.t*1000; s.blobs.forEach((b,k)=>{ const gone=ez((ms-s.clean-k*90)/200); if(gone>=1) return; gfx.globalAlpha=1-gone; EO(b.x,b.y,9*(1-gone*.5),5*(1-gone*.5),'#e8902a'); E(b.x-2,b.y-2,3,2,'#ffc870'); });
  if(ms<s.clean) { gfx.globalAlpha=1; bigWord('STICKY',s.x,s.y-26,'#ffb050',1); } };
SC.dv_wet=(s,u)=>{ const ms=s.t*1000,P=s.P,g=ez((ms-P.g0)/(P.g1-P.g0)); if(g<=0) return; gfx.globalAlpha=fin(u,.02)*fade(u,.9)*.75;
  const n=18; for(let k=0;k<=n;k++) { const q=k/n; if(q>g) break; const x=lerp(P.x1,P.x0,q),y=lerp(P.y1,P.y0,q); E(x,y,22,7,'#bfe6ff'); }
  gfx.globalAlpha=fin(u,.02)*fade(u,.9); for(let k=0;k<7;k++) { const q=((k/7)+s.t*.25)%1; if(q>g) continue; const x=lerp(P.x1,P.x0,q),y=lerp(P.y1,P.y0,q)-2,tw=.5+.5*Math.sin(s.t*9+k*2); Ln(x-6*tw,y,x+6*tw,y,2,'#ffffff'); Ln(x,y-6*tw,x,y+6*tw,2,'#ffffff'); } };
SC.dv_sign=(s,u)=>{ const pop=u<.06?ez(u/.06)*1.25:lerp(1.25,1,cl((u-.06)/.06)); gfx.globalAlpha=fade(u,.92); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(pop,pop);
  if(PROPART.draw('deedee/wet_floor_sign',0,-33,{h:66})) { gfx.restore(); return; }   // painted WET FLOOR sign
  gfx.beginPath(); gfx.moveTo(-6,-64); gfx.lineTo(6,-64); gfx.lineTo(26,0); gfx.lineTo(-26,0); gfx.closePath(); gfx.fillStyle='#ffd230'; gfx.fill(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke();
  gfx.beginPath(); gfx.moveTo(0,-56); gfx.lineTo(8,-42); gfx.lineTo(-8,-42); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); label('!',0,-53,'#ffd230',1);
  label('WET',0,-36,OUT,2); label('FLOOR',0,-22,OUT,2); gfx.restore(); };
D.wet_floor=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),foeT=t.side==='foe',sp=foeT?front(H,44):spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const lf=liveFoes(),sl=foeT?t:lf.slice().sort((a,b)=>ST.unit(b).x-ST.unit(a).x)[0],SF=sl?ST.unit(sl):null;
  const bop=!foeT&&B2.party.find(p=>p.id==='boppy'&&b2Alive(p)&&p!==t),BU=bop?ST.unit(bop):null;
  const fy=sp.y,mx=self?me.x:sp.x,signX=foeT?Math.min(556,sp.x+40):Math.max(30,H.x-H.w*.5-24);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':brisk,hop:3,hn:6},{t:900,x:mx,y:fy,f:DD_XF('mop','aim')},{t:1000,f:DD_XF('mop','aim'),dx:(u,tt)=>Math.sin(tt*14)*10},{t:2300,f:'hip'},{t:2500,f:'throw'},{t:2700,f:'hip'},{t:3100,f:'expr'},{t:3700,f:self?'idle':'walkR',hop:3,hn:6},{t:4500,x:'home',y:'home',f:'idle'}]);
  const P={g0:1000,g1:2600,x1:mx+10,y1:fy,x0:SF?SF.x:mx-160,y0:SF?SF.base+2:fy};
  const blobs=foeT?[]:[[-18,2],[4,6],[20,0],[-4,-3]].map(([dx,dy])=>({x:H.x+dx,y:H.base+dy}));
  const end=4700;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee rolls out her mop and bucket.':'Deedee hurries over to '+t.name+' with her mop and bucket.'); say(m.id,'wet_floor'); scene('dv_mop',(end-300)/1000,{st,m0:1000,m1:2300}); if(blobs.length) scene('dv_amber',2.2,{blobs,x:H.x,y:H.base,clean:1500}); }],
    [900,()=>{ scene('dv_bucket',3.4,{x:Math.min(560,mx+34),y:fy+2}); scene('dv_wet',(end-900)/1000,{P:Object.assign({},P,{g0:100,g1:1700})}); }],
    [1000,()=>{ setMessage('She mops. Thoroughly. The sticky stuff comes right up.'); for(let k=0;k<4;k++) b7Later(()=>sfx.spray&&sfx.spray(),k*300); }],
    ['hf',1700],
    [1700,()=>{ E2.apply(); sfx.heal(); scene('dv_glow',.9,{x:H.x,y:H.mid,c:'#bfe6ff'}); scene('dv_big',1.1,{x:H.x,y:H.top-40,txt:'SPARKLING!',c:'#bfe6ff',sc:3}); hopOf(t!==m?t:null); }],
    ...(BU?[[2000,()=>{ scene('dv_glow',.8,{x:BU.x,y:BU.mid,c:'#bfe6ff'}); battle.fx[bop.idx].hop=.3; setMessage('She mops a careful path to Boppy too. He lifts his feet.'); }]]:[]),
    [2500,()=>{ scene('dv_sign',(end-2500)/1000,{x:signX,y:Math.min(318,(foeT?sp.y:H.base)+4)}); sfx.thud(); }],
    [2650,()=>{ if(!sl) return; sfx.slideWhistle(); setMessage((foeT?cap(sl.def.the):'Over there, '+sl.def.the)+' steps right onto the wet floor.');
      ST.draw((s,u)=>{ const q=u,sd=foeT?1:-1; const sp2=q<.2?Math.sin(q*70)*.12:(q<.45?sd*1.35*ez((q-.2)/.25):(q<.8?sd*1.35:sd*1.35*(1-ez((q-.8)/.2)))),oy=q<.2?0:(q<.32?-SF.h*.25*Math.sin((q-.2)/.12*Math.PI/2):lerp(-SF.h*.25,SF.h*.18,ez((q-.32)/.13))*(1-ez((q-.8)/.2))),ox=q<.2?Math.sin(q*50)*7:sd*-10*ez((q-.2)/.3)*(1-ez((q-.8)/.2)); lift(sl,oy,sp2,ox); },1.5);
      scene('dv_text',.7,{x:SF.x,y:SF.top-16,txt:'WHOA!',c:CREAM,sc:2}); }],
    [3100,()=>{ if(!sl) return; sfx.thud(); sl.shake=Math.max(sl.shake||0,.3); scene('dv_big',1.2,{x:SF.x,y:SF.top-74,txt:'SLIP!',c:'#bfe6ff',sc:4}); scene('dv_drops',.7,{x:SF.x,y:SF.base,r:44,c:'#bfe6ff'}); if(foeT) scene('dv_text',1,{x:SF.x,y:SF.top-20,txt:'HEE HEE',c:GOLD,sc:2}); }],
    [3150,()=>{ scene('dv_text',1.2,{st,txt:'WATCH YOUR STEP!',c:'#ffd230',sc:2}); }],
    [end,'end',kindLine(t,'Clean floor. Clean slate. Watch your step.')]]); };

// ---------- Wine O'Clock (A4; key wine; same numbers as Rolling-Pin Rounds) ----------
// She taps her wine glass with a spoon for a toast: ting, ting, TING. Every monster freezes mid wind-up to listen
// (the last ting rings into the target). Cheers. A sip. Ahh.
const glass=(x,y,fill=1,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  EO(0,22,10,3,'#e8f4ff'); LnO(0,6,0,22,2,'#e8f4ff');
  gfx.beginPath(); gfx.moveTo(-13,-22); gfx.quadraticCurveTo(-15,4,0,7); gfx.quadraticCurveTo(15,4,13,-22); gfx.closePath(); gfx.fillStyle='rgba(232,244,255,.55)'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  if(fill>0) { gfx.save(); gfx.clip(); R(-16,-10+(1-fill)*14,32,20,'#f3df7a'); R(-16,-10+(1-fill)*14,32,3,'#fff1a8'); gfx.restore(); }
  Ln(-8,-18,-9,-4,3,'rgba(255,255,255,.85)'); gfx.restore(); };
SC.dv_glass=(s,u)=>{ const ms=s.t*1000,hs=hands(),P=s.P; gfx.globalAlpha=fade(u,.96); const fill=ms<P.sip?1:lerp(1,.45,ez((ms-P.sip)/500));
  glass(hs.n.x-4,hs.n.y-14,fill,1.15);
  if(ms<P.sip) { const sx=hs.f.x,sy=hs.f.y; gfx.save(); gfx.translate(sx,sy); gfx.rotate(-.9); LnO(0,0,0,-24,2,SILVER); EO(0,-28,4,6,SILVER); gfx.restore(); } };
SC.dv_freeze=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.85); for(const f of s.list) { const F=ST.unit(f); bigWord('!',F.x+F.w*.3,F.top-12,GOLD,3); } if(u>.2&&u<.8) { gfx.globalAlpha=1; const G=ST.group(s.list); bigWord('LISTENING...',G.x,G.top-48,CREAM,2); } };
D.wine=(old=>E2=>(E2.act&&E2.act.o3&&D.wineShow)?D.wineShow(E2):old(E2))(D.wine);
D.wineShow=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,62),me=ST.unit(m),list=liveFoes();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:back(p.x,me)==='walkR'?'walkR':'walk',hop:3,hn:6},{t:900,x:p.x,y:p.y,f:DD_XF('toast','aim')},{t:1250,f:'clap'},{t:1400,f:DD_XF('toast','aim')},{t:1650,f:'clap'},{t:1800,f:DD_XF('toast','aim')},{t:2050,f:'clap'},{t:2300,f:'celeb',hop:6},{t:2900,f:'expr'},{t:3500,f:'hip'},{t:3900,f:back(p.x,me),hop:3,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  const P={sip:2950};
  const ting=(k)=>()=>{ const hs=hands(); sfx.ting(); scene('dv_rings',.7,{x:hs.n.x,y:hs.n.y-20,c:GOLD,r:30+k*20}); scene('dv_text',.8,{x:hs.n.x-20-k*30,y:hs.n.y-60-k*16,txt:'TING',c:GOLD,sc:2+(k===2?1:0)}); };
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up with a glass of wine and a spoon. She has an announcement.'); say(m.id,'wine'); scene('dv_glass',4.0,{P}); }],
    [1250,ting(0)],
    [1350,()=>{ setMessage('Ting, ting, ting. A toast! Every monster freezes mid wind-up to listen.'); scene('dv_freeze',2.2,{list}); ST.draw(()=>{ list.forEach((g,k)=>lift(g,-4,(k%2?1:-1)*.14,0)); },2.1); }],
    [1650,ting(1)],
    ['hf',2050],
    [2050,()=>{ ting(2)(); const hs=hands(); ST.fly((x,y,uu)=>{ gfx.globalAlpha=1-uu*.5; ring(x,y,10+uu*14,8+uu*10,4,GOLD); },hs.n.x,hs.n.y-20,F.x,F.mid,.25,0,0,{ease:'lin'}); }],
    [2300,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('dv_big',1.2,{x:F.x,y:F.top-74,txt:'TING!',c:GOLD,sc:4}); scene('dv_text',1.1,{st,txt:'CHEERS!',c:CREAM,sc:3}); setMessage('Cheers! The last TING rings right through it.'); }],
    [2950,()=>{ setMessage('She sips.'); sfx.vapor&&sfx.vapor(); }],
    [3450,()=>{ scene('dv_text',1.2,{st,txt:'AHH.',c:GOLD,sc:3}); sfx.ding(); setMessage('Ahh. Everyone may now resume.'); }],
    [4900,'end',res(E2)+'It\'s five o’clock somewhere. Its wind-up is cancelled.']]); };

// ---------- Brisk Means Brisk (B1, kept: hand weights and swinging arms) ----------
const dumbbell=(x,y,rot,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); RO(-11,-2,22,4,'#9aa3b0'); for(const sd of [-1,1]) { RO(sd*11-5,-9,10,18,'#ff7aa8'); R(sd*11-3,-7,3,14,'#ffb0cc'); } gfx.restore(); };
SC.dv_weights=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; gfx.globalAlpha=fade(u,.97); const hs=hands(),on=ms>s.from&&ms<s.to,sw=on?Math.sin(s.t*14):0;
  dumbbell(hs.f.x,hs.f.y-sw*10,.3+sw*.6,1); dumbbell(hs.n.x,hs.n.y+sw*10,-.3-sw*.6,1); if(on) { for(const [h,d] of [[hs.n,1],[hs.f,-1]]) { gfx.globalAlpha=.5; gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(h.x,h.y+sw*10*d,18,-.6+d*sw*.4,.6+d*sw*.4); gfx.stroke(); } }
  if(ms<s.from+600&&ms>200) { gfx.globalAlpha=1; bigWord('1 LB',hs.n.x,hs.n.y-30,'#ff7aa8',1); } };
D.brisk_means_brisk=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),far=Math.max(24,F.x-F.w*.5-36),fy=Math.min(316,F.base+4);
  const passAt=Math.round(1400*(me.x-F.x)/(me.x-far));
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'clap'},{t:450,f:brisk,ease:'lin'},{t:1850,x:far,y:fy,f:'flip'},{t:2100,f:(u,tt)=>Math.sin(tt*14)>0?'runR':'walkR',dy:u=>Math.sin(u*Math.PI)*16,ease:'lin'},{t:3700,x:'home',y:'home',f:'idle'},{t:3900,f:'hip'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee picks up her pink hand weights. Perfectly respectable posture.'); say(m.id,'brisk_means_brisk'); scene('dv_weights',4.0,{st,from:450,to:3700}); scene('dd_speed',3.8,{st,from:450,to:3700,dir:ms=>ms<1850?1:-1}); sfx.ding(); }],
    [450,()=>{ sfx.run&&sfx.run(); setMessage('Arms swinging. Weights pumping. She sets off.'); }],
    ['hf',450+passAt],
    [450+passAt,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('dd_thump',.8,{x:F.x,y:F.mid}); scene('dv_big',1.1,{x:F.x,y:F.top-74,txt:'BRISK!',c:'#ff7aa8',sc:4}); }],
    [700+passAt,()=>{ scene('dd_sign',1.4,{x:F.x+14,y:F.base}); setMessage('Straight through. A tiny SIGHTSEEING sign spins in her wake.'); sfx.select(); }],
    [1850,()=>{ setMessage('She turns at the far end and keeps walking. Brisk means brisk.'); }],
    [4100,'end',res(E2)+'The stroll has become an event.']]); };

// ---------- Garden Shower (B2, kept: one big hose arc across the row) ----------
SC.dv_hose=(s,u)=>{ const ms=s.t*1000,h=hand(),x=h.x-8,y=h.y-2,P=s.P; gfx.globalAlpha=fade(u,.96);
  gfx.lineCap='round'; for(const [w,c] of [[9,OUT],[5,'#4f9a4a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(x+10,y+2); gfx.quadraticCurveTo(x+60,P.fl+30,600,P.fl-10); gfx.stroke(); }
  RO(x-12,y-8,26,14,'#5fa05a'); RO(x-26,y-5,14,8,'#9aa3c8');
  if(ms>P.s0&&ms<P.s1) { const q=(ms-P.s0)/(P.s1-P.s0),tx=lerp(P.x1+20,P.x0-20,q),ty=P.yl,sx=x-28,sy=y-2,mx=sx-(sx-tx)*.45,my=Math.min(sy,ty)-80;
    for(const [w,c,a] of [[18,OUT,.9],[13,WATER,.95],[5,'#e6f7ff',.9]]) { gfx.globalAlpha=a; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(sx,sy); gfx.quadraticCurveTo(mx,my,tx,ty); gfx.stroke(); }
    gfx.globalAlpha=.9; for(let k=0;k<12;k++) { const q2=((s.t*3+k/12)%1),a=Math.PI*(1.15+(k%6)/5*.7),d=q2*36; E(tx+Math.cos(a)*d,ty+Math.sin(a)*d+q2*q2*30,3,4,k%2?WATER:'#e6f7ff'); }
    for(const p of P.list) if(Math.abs(p.x-tx)<p.w*.7) { gfx.globalAlpha=.55; E(p.x,p.base+2,p.w*.55,7,'#6aa8e0'); } }
  if(ms<P.s0) { gfx.globalAlpha=1; bigWord('GENTLE',x-6,y-30,'#8ef0a0',1); } };
D.garden_shower=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,150),me=ST.unit(m);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'aim'},{t:1500,f:'aim',dx:u=>-Math.sin(u*Math.PI)*14,dy:u=>Math.sin(u*Math.PI*2)*3},{t:2900,f:'hip'},{t:3300,f:'walkR',hop:3,hn:6},{t:4200,x:'home',y:'home',f:'idle'}]);
  const P={s0:1500,s1:2900,x0:Gp.x0,x1:Gp.x1,yl:Gp.top+Math.max(10,(Gp.base-Gp.top)*.3),fl:p.y,list:list.map(f=>ST.foe(f))},hit=2200;
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks over with the garden hose. She checks the nozzle. GENTLE. Good.'); say(m.id,'garden_shower'); scene('dv_hose',3.6,{P}); }],
    [1500,()=>{ for(let k=0;k<5;k++) b7Later(()=>sfx.spray&&sfx.spray(),k*260); setMessage('One big arc. Right across the whole row.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.splat(); for(const f of list) ST.jolt(f,.4); landHit(100); scene('dv_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'SPLOOSH!',c:WATER,sc:4}); for(const f of list) { const U=ST.unit(f); scene('dv_drops',.8,{x:U.x,y:U.top+6,r:40}); } }],
    [2900,()=>{ setMessage('She checks the nozzle again. Still says gentle.'); }],
    [4300,'end',res(E2)+'The watering schedule was ambitious.']]); };

// ---------- Rise and Shine (B3; key rise_and_shine; same numbers as Windows Open) ----------
// The room is dark. Deedee walks to the window and yanks the shade cord: ZIP. Blinding light floods in. The monsters
// squint; everybody else wakes right up.
SC.dv_dim=(s,u)=>{ const ms=s.t*1000; const a=ms<s.open?fin(u,.08)*.55:.55*(1-cl((ms-s.open)/150)); if(a<=0) return; gfx.globalAlpha=a; R(0,0,576,324,'#0a0f2a'); };
SC.dv_shade=(s,u)=>{ const ms=s.t*1000,P=s.P,x=P.x,y=P.y,w=120,h=86,up=ez((ms-P.open)/220); gfx.globalAlpha=fin(u,.06)*fade(u,.93);
  if(PROPART.ready&&PROPART.ready('deedee/window_with_shade')) {   // painted window; the shade is a roll-down blind laid over the painted glass
    const WH=128,WW=WH*142/160,gx0=x-WW*.40,gw=WW*.80,gy0=y-WH/2+WH*.36,gh=WH*.54;
    PROPART.draw('deedee/window_with_shade',x,y,{h:WH}); const sh=gh*(1-up);
    if(sh>1) { gfx.save(); R(gx0,gy0,gw,sh,'#f2e6c8'); for(let k=1;k<4;k++) R(gx0,gy0+sh*k/4,gw,1,'#d8c8a0'); RO(gx0,gy0+sh-4,gw,4,'#d8c8a0'); gfx.restore(); }
    const cy0=gy0+sh,hs=s.st&&s.st.x!=null&&ms>P.grab&&ms<P.open+120?hand():null,cx=gx0+gw-4;
    if(hs) { Ln(cx,cy0,hs.x,hs.y,2,OUT); EO(hs.x,hs.y,4,5,'#e8e2d0'); } else { Ln(cx,cy0,cx,cy0+30,2,OUT); EO(cx,cy0+34,4,5,'#e8e2d0'); }
    if(ms>P.open&&ms<P.open+500) { gfx.globalAlpha=1; bigWord('ZIP!',x+WW/2+24,y-WH/2+10,CREAM,3); } return; }
  RO(x-w/2-8,y-h/2-8,w+16,h+16,WOOD); R(x-w/2,y-h/2,w,h,up>0?'#bfe8ff':'#1c2440');
  if(up>0) { EO(x+22,y-8,22*up,22*up,'#fff27a'); for(let k=0;k<3;k++) E(x-30+k*20,y+24,14,6,'#ffffff'); }
  R(x-2,y-h/2,4,h,WOOD); R(x-w/2,y-2,w,4,WOOD);
  const sh=(h)*(1-up); if(sh>1) { R(x-w/2,y-h/2,w,sh,'#f2e6c8'); for(let k=1;k<4;k++) R(x-w/2,y-h/2+sh*k/4,w,1,'#d8c8a0'); RO(x-w/2,y-h/2+sh-6,w,6,'#d8c8a0'); }
  RO(x-w/2-10,y-h/2-14,w+20,10,'#c8a070');
  const cy0=y-h/2+sh,hs=s.st&&s.st.x!=null&&ms>P.grab&&ms<P.open+120?hand():null,cx=x+w/2-14;
  if(hs) { Ln(cx,cy0,hs.x,hs.y,2,OUT); EO(hs.x,hs.y,4,5,'#e8e2d0'); } else { Ln(cx,cy0,cx,cy0+34,2,OUT); EO(cx,cy0+38,4,5,'#e8e2d0'); }
  if(ms>P.open&&ms<P.open+500) { gfx.globalAlpha=1; bigWord('ZIP!',x+w/2+30,y-h/2-6,CREAM,3); } };
SC.dv_light=(s,u)=>{ const q=u,flash=Math.max(0,1-q*3); gfx.globalAlpha=flash*.85; R(0,0,576,324,'#fffbe0');
  gfx.globalAlpha=(.22+.06*Math.sin(s.t*6))*fade(q,.7); const x=s.x,y=s.y; for(let k=0;k<5;k++) { const a0=1.95+k*.22,a1=a0+.12; gfx.beginPath(); gfx.moveTo(x,y); gfx.lineTo(x+Math.cos(a0)*900,y+Math.sin(a0)*900); gfx.lineTo(x+Math.cos(a1)*900,y+Math.sin(a1)*900); gfx.closePath(); gfx.fillStyle='#fff3a0'; gfx.fill(); } };
SC.dv_squint=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); for(const f of s.list) { const F=ST.unit(f); const ex=F.x,ey=F.top+F.h*.33; bigWord('>',ex-10,ey-6,CREAM,2); bigWord('<',ex+10,ey-6,CREAM,2); bigWord('SQUINT',F.x,F.top-16,'#fff27a',1); } };
D.rise_and_shine=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m),fl=liveFoes(),party=who.filter(u=>u.side==='party');
  const wx=foe?Math.min(470,ST.unit(foe).x+150):310,wy=66,sx=wx+50,sy=foe?Math.min(316,ST.unit(foe).base+6):Math.min(316,me.base+4);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:1000,x:sx,y:sy,f:'aim'},{t:1550,f:'wind'},{t:1700,f:'throw',dy:6},{t:1850,f:'celeb',hop:10},{t:2800,f:'hip'},{t:3100,f:back(sx,me),hop:3,hn:6},{t:4000,x:'home',y:'home',f:'idle'}]);
  const P={x:wx,y:wy,grab:1000,open:1700};
  ST.play(E2,[
    [0,()=>{ setMessage('The shades are drawn. It\'s very dark in here. Deedee doesn\'t approve.'); say(m.id,'rise_and_shine'); scene('dv_dim',2.0,{open:1700}); scene('dv_shade',4.1,{P,st}); }],
    [1000,()=>{ setMessage('She takes hold of the shade cord.'); }],
    [1700,()=>{ sfx.whoosh(); sfx.levelChime(); scene('dv_light',2.2,{x:wx,y:wy}); scene('dv_big',1.6,{x:288,y:44,txt:'RISE AND SHINE!',c:'#fff27a',sc:3}); setMessage('ZIP! Blinding morning light floods the room.'); }],
    [1900,()=>{ const sq=foe?[foe]:fl; scene('dv_squint',1.6,{list:sq}); ST.draw((s,u)=>{ sq.forEach((g,k)=>lift(g,0,-.16*ez(u/.15)*(1-ez((u-.8)/.2))+Math.sin(u*40)*.02,6*ez(u/.15)*(1-ez((u-.8)/.2)))); },1.6); if(!foe) setMessage('The monsters squint. Everybody else wakes right up.'); }],
    ['hf',2100],
    [2100,()=>{ E2.apply(); sfx.ding(); for(const u of who) { const q=ST.unit(u); scene('dv_glow',.9,{x:q.x,y:q.mid,c:'#fff27a'}); if(u!==m) hopOf(u); if(u.side==='party') scene('dv_text',.9,{x:q.x,y:q.top-12,txt:'!',c:GOLD,sc:3}); } }],
    [4100,'end',foe?kindLine(foe):'Good morning, everybody. The day is wasting.']]); };

// ---------- Beanie Master (B4; key beanie_master; same numbers as Spotless Record) ----------
// Tom's name for it. Deedee walks up, stops, turns around... PFFFT. A big green cloud rolls over the monster; it gags,
// and its good mood blows right over to her. She covers her mouth: "Oh my!" (the toot is a sound effect, not speech).
// A soft radial blob: the building block of the mist.
const haze=(x,y,r,al,rgb)=>{ if(al<=0) return; const gr=gfx.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba('+rgb+','+al+')'); gr.addColorStop(1,'rgba('+rgb+',0)'); gfx.globalAlpha=1; gfx.fillStyle=gr; gfx.beginPath(); gfx.arc(x,y,r,0,Math.PI*2); gfx.fill(); };
// The cloud is a fine green mist: many faint soft blobs, a spray of tiny specks and thin curling wisps, no outlines. It drifts to the monster and settles on it.
SC.dv_cloud=(s,u)=>{ const x0=s.x,y0=s.y,tx=s.tx,g=ez(cl(u/.45)),env=fade(u,.45)*fin(u,.05);
  for(let k=0;k<30;k++) { const q=cl(g*1.25-k*.015); if(q<=0) continue; const a=k*2.399,x=x0+(tx-x0)*q*(.5+(k%5)*.12)+Math.cos(a)*q*10,y=y0+Math.sin(a)*q*(.25+(k%6)*.1)*60-q*10+Math.sin(u*3+k)*4,r=(12+(k%4)*5)*(.5+q*1.1);
    haze(x,y,r,.2*env,k%3?'140,210,80':'190,235,120'); }
  for(let k=0;k<80;k++) { const q=cl(g*1.3-k*.007); if(q<=0) continue; const a=k*1.7+k*k*.013,x=x0+(tx-x0)*q*(.35+(k%9)*.08)+Math.cos(a*3)*q*26,y=y0+Math.sin(a*2.3)*q*34*(.4+(k%5)*.15)-q*8+Math.sin(u*5+k)*2;
    gfx.globalAlpha=(.35+(k%4)*.1)*env; gfx.fillStyle=k%2?'#d6f59a':'#8fd05a'; gfx.beginPath(); gfx.arc(x,y,.8+(k%3)*.7,0,Math.PI*2); gfx.fill(); }
  gfx.globalAlpha=.35*env; gfx.strokeStyle='#bff08a'; gfx.lineWidth=1.5; gfx.lineCap='round';
  for(let k=0;k<5;k++) { const yy=y0-14+k*8; gfx.beginPath(); for(let j=0;j<=14;j++) { const f=j/14,x=lerp(x0,tx,f*g),y=yy-f*10+Math.sin(f*9+s.t*5+k)*5*f; if(j) gfx.lineTo(x,y); else gfx.moveTo(x,y); } gfx.stroke(); }
  if(u>.25) { const q=cl((u-.25)/.25),e=q*fade(u,.5); haze(tx,y0-4,46,.38*e,'120,200,60'); haze(tx,y0-6,28,.3*e,'190,235,120'); }
  gfx.globalAlpha=1; };
// The blast at her back: a pop of mist, a thin shock ring and a few fine speed lines.
SC.dv_toot=(s,u)=>{ const x=s.x,y=s.y;
  for(let k=0;k<2;k++) { const q=cl(u*1.6-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.7; ring(x,y,8+q*34,6+q*26,3-q*2,k?'#ffffff':'#bff08a'); }
  gfx.globalAlpha=fade(u,.5)*.8; for(let k=0;k<9;k++) { const a=Math.PI+(k-4)*.34,d0=8+ez(u)*14,d1=d0+10+ez(u)*30; Ln(x+Math.cos(a)*d0,y+Math.sin(a)*d0*.7,x+Math.cos(a)*d1,y+Math.sin(a)*d1*.7,2,k%2?'#d6f59a':'#9ed86a'); }
  const p=ez(cl(u/.5)); haze(x-6,y,16+p*22,.6*(1-u*u),'150,215,90'); haze(x-8,y-2,8+p*10,.5*(1-u*u),'210,245,150'); gfx.globalAlpha=1; };
SC.dv_buff=(s,u)=>{ const st=s.st,ms=s.t*1000; let x=s.fx,y=s.fy; if(ms>s.go&&st&&st.x!=null) { const q=ez((ms-s.go)/600); x=lerp(s.fx,st.x,q); y=lerp(s.fy,st.y-DH()*.6,q)-Math.sin(q*Math.PI)*40; } gfx.globalAlpha=fade(u,.9);
  EO(x,y,9,9,GOLD); for(let k=0;k<6;k++) { const a=s.t*5+k*Math.PI/3; Ln(x+Math.cos(a)*12,y+Math.sin(a)*12,x+Math.cos(a)*17,y+Math.sin(a)*17,2,GOLD); } if(ms>s.go+600) bigWord('MINE NOW',x,y-26,GOLD,1); };
D.beanie_master=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,44),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'idle'},{t:1300,f:'flip'},{t:1900,f:'flip',hop:7,dx:(u,tt)=>Math.sin(tt*50)*2*(1-u)},{t:2700,f:'expr'},{t:3500,f:'hip'},{t:3800,f:back(p.x,me),hop:3,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up to have a word with '+f.name+'.'); }],
    [900,()=>{ setMessage('She stops. She turns around. Uh oh. There were beans at lunch.'); scene('dv_text',.9,{st,txt:'...',c:CREAM,sc:3}); }],
    [1900,()=>{ sfx.toot(); hopOf(m); scene('dv_toot',.8,{x:p.x-22,y:p.y-DH()*.32}); scene('dv_cloud',2.4,{x:p.x-22,y:p.y-DH()*.32,tx:F.x}); scene('dv_big',1.2,{x:p.x+10,y:p.y-DH()-40,txt:'PFFFT!',c:STINK,sc:4,rot:-.08}); setMessage('PFFFT! A truly heroic toot.'); }],
    ['hf',2250],
    [2250,()=>{ sfx.bonk(); ST.jolt(f,.5); landHit(100); ST.draw((s,u)=>lift(f,0,Math.sin(u*30)*.12*(1-u),Math.sin(u*26)*6*(1-u)),1.1); scene('dv_big',1.2,{x:F.x,y:F.top-74,txt:'GAG!',c:STINK,sc:4}); scene('dv_buff',2.0,{st,fx:F.x+F.w*.3,fy:F.top-8,go:400}); }],
    [2700,()=>{ say(m.id,'beanie_master'); scene('dv_text',1.3,{st,txt:'OH MY!',c:ROSE,sc:3}); setMessage('Deedee covers her mouth. Oh my!'); }],
    [3250,()=>{ sfx.levelChime(); setMessage('Its good mood blows right over to her.'); }],
    [4800,'end',res(E2)+'Deedee is the Beanie Master. Nobody will speak of this.']]); };

// ---------- Grandma Squeeze (B5; key grandma_squeeze; same numbers as Take a Breather) ----------
// Arms out from across the room, one big squeezy hug, and a lipstick kiss on the cheek to finish.
const lips=(x,y,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.rotate(-.2);
  gfx.beginPath(); gfx.moveTo(-14,0); gfx.quadraticCurveTo(-8,-10,-2,-4); gfx.quadraticCurveTo(0,-6,2,-4); gfx.quadraticCurveTo(8,-10,14,0); gfx.quadraticCurveTo(0,-2,-14,0); gfx.closePath(); gfx.fillStyle=LIP; gfx.fill();
  gfx.beginPath(); gfx.moveTo(-14,1); gfx.quadraticCurveTo(0,4,14,1); gfx.quadraticCurveTo(8,12,0,12); gfx.quadraticCurveTo(-8,12,-14,1); gfx.closePath(); gfx.fill();
  Ln(-11,1,11,1,1.5,'#8a1020'); gfx.restore(); };
SC.dv_kiss=(s,u)=>{ const pop=u<.08?ez(u/.08)*1.4:lerp(1.4,1,cl((u-.08)/.08)); gfx.globalAlpha=fade(u,.9); const c=s.u?cheek(s.u):{x:s.x,y:s.y}; lips(c.x,c.y,pop*.8); };
D.grandma_squeeze=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const sp=self?{x:me.x,y:me.base}:{x:Math.min(560,H.x+H.w*.5+(foe?14:4)),y:Math.min(316,H.base+3)};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'spread':'run'},{t:self?300:800,x:sp.x,y:sp.y,f:'spread'},{t:self?500:950,f:'clap',dx:(u,tt)=>Math.sin(tt*22)*3,rot:(u,tt)=>Math.sin(tt*9)*.06},{t:2200,f:'act',dx:-8},{t:2700,f:'celeb',hop:8},{t:3100,f:self?'idle':back(sp.x,me),hop:3,hn:6},{t:4000,x:'home',y:'home',f:'idle'}]);
  if(!self&&!foe) battle.fx[t.idx].path={t:0,dur:2.4,fn:(q,c)=>{ const ms=q*2400; if(ms<950||ms>2200) return {}; const w=Math.sin(ms/45); return {cx:c.origX+w*2,base:c.origBase,rot:Math.sin(ms/110)*.07,sc:1-.06*Math.abs(w)}; }};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee gives herself a big squeeze. She deserves one.':'Deedee spots '+t.name+' from across the room. Arms out. No escape.'); say(m.id,'grandma_squeeze'); }],
    [950,()=>{ scene('dv_big',1.3,{x:H.x,y:H.top-40,txt:'SQUEEZE!',c:ROSE,sc:4}); scene('dv_hearts',1.4,{x:H.x,y:H.top,n:7}); sfx.squeak&&sfx.squeak(); b7Later(()=>sfx.squeak&&sfx.squeak(),300); setMessage('One big squeezy Deedee hug.'); if(foe) ST.draw((s,u)=>lift(t,Math.abs(Math.sin(u*20))*-4,Math.sin(u*24)*.06,0),1.25); }],
    ['hf',1500],
    [1500,()=>{ E2.apply(); sfx.heal(); scene('dv_glow',1,{x:H.x,y:H.mid,c:ROSE}); }],
    [2300,()=>{ sfx.kiss?sfx.kiss():sfx.select(); scene('dv_kiss',(4100-2300)/1000,{u:t}); const c=cheek(t); scene('dv_text',1.1,{x:c.x-30,y:c.y-30,txt:'MWAH!',c:LIP,sc:3}); setMessage('And a lipstick kiss on the cheek. That won\'t come off for days.'); }],
    [4100,'end',kindLine(t,'Squeezed, kissed, and feeling much better.')]]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Corner-Piece Privilege: a bigger steaming pan with the golden corner glowing. Wine O'Clock: a bigger glass and big sound
// rings on every TING. Oven Mitt Ultimatum: huge fluffy mitts and a big clap shockwave. Brisk Means Brisk: speed lines and
// big pumping arms. Grandma Squeeze: a bigger hug squash and a big lipstick mark. Same numbers, same beats. Overrides
// SC.dv_pan, SC.dv_glass, SC.dd_mitts, SC.dv_weights, SC.dd_speed, SC.dv_kiss, D.wineShow, D.oven_mitt_ultimatum and
// D.grandma_squeeze. Scenes prefix dp_.
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
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const D=RECRUIT_MOVES.deedee;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',CRUST='#d9a05a',SILVER='#cfd6de',LIP='#d8203a';
ST.nw('dp_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const liveFoes=()=>(B2.foes||[]).filter(f=>!f.dead&&f.hp>0);
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const hands=()=>{ const st=ST.cur; if(st&&st.fx&&st.fx.path&&st.sp&&st.x!=null) { const fr=st.frame,sp=st.sp,h=sp.handAt&&sp.handAt.get(fr),sc=sp.scale*(st.sc||1),w=fr[0].length*sc,H=fr.length*sc;
    if(h) return {n:{x:st.x-w/2+h.n[0]*sc,y:st.y-H+h.n[1]*sc},f:{x:st.x-w/2+h.f[0]*sc,y:st.y-H+h.f[1]*sc}}; }
  const a=hand(); return {n:a,f:{x:a.x+22,y:a.y}}; };
const DSP=()=>BATTLE_SPRITES.deedee,DH=()=>DSP().idle.length*DSP().scale;
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'walkR':'walk';
const brisk=(u,tt)=>Math.sin(tt*14)>0?'run':'walk';
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };

// ---------- Corner-Piece Privilege: bigger pan, glowing golden corner ----------
const PS=1.35;
const bigSteam=(x,y,t,n,c,h=110)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*.8+k*.17)%1; gfx.globalAlpha=a0*(1-q)*.85; E(x-(n-1)*12+k*24+Math.sin(q*6+k)*10,y-q*h,9+q*12,9+q*12,c); } gfx.globalAlpha=a0; };
const bigPan=(lift,regrow,rot)=>{ gfx.rotate(rot); if(PROPART.draw('deedee/crisp_pan',0,-4,{w:132})) return;   // painted pan (its cut corner is painted in); the drawn one with the growing corner is the fallback
  RO(-62,-6,12,8,'#9a948a'); RO(50,-6,12,8,'#9a948a'); RO(-52,-20,104,40,'#c9c2b8'); R(-47,-15,94,30,CRUST);
  for(let k=0;k<14;k++) R(-42+(k%7)*13,-11+Math.floor(k/7)*12+(k%2)*3,7,5,'#b0483a'); for(let k=0;k<8;k++) R(-40+k*12,-14,6,3,'#f0c070');
  const cw=26*(1-lift)+26*regrow; if(cw>.5) { R(21+(26-cw),-15,cw,cw*.9,'#f0b860'); R(21+(26-cw),-15,cw,3,'#ffd890'); } };
SC.dv_pan=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),lift=ez((ms-P.lift)/250),regrow=ez((ms-P.regrow)/400),cx=h.x-44,cy=h.y-20,rot=ms>P.angle&&ms<P.lift?-.28:-.08; gfx.globalAlpha=fade(u,.96);
  const a0=gfx.globalAlpha; bigSteam(cx,cy-24,s.t,6,'#fff6dc'); gfx.globalAlpha=a0;
  gfx.save(); gfx.translate(cx,cy); gfx.scale(PS,PS); bigPan(lift,regrow,rot);
  const glow=(1-lift)+regrow; if(glow>.05) { const pl=.5+.5*Math.sin(s.t*8); gfx.globalAlpha=a0*glow*(.35+pl*.3); E(34,-6,22+pl*6,18+pl*5,'#ffd84a'); gfx.globalAlpha=a0*glow; ring(34,-6,18+pl*4,15+pl*3,2,'#fff1a8');
    for(let k=0;k<4;k++) { const a=s.t*3+k*Math.PI/2; star(34+Math.cos(a)*26,-6+Math.sin(a)*20,3+pl*2,k%2?GOLD:CREAM,s.t*4+k); } }
  gfx.restore(); gfx.globalAlpha=a0;
  if(ms<P.angle) bigWord('HOT!',cx-40,cy-84+Math.sin(s.t*10)*2,'#ffb070',3); if(ms>P.angle&&ms<P.lift) bigWord('THE CORNER',cx+16,cy-84,GOLD,3); if(regrow>.9) bigWord('AGAIN!',cx+20,cy-84,GOLD,3); };

// ---------- Wine O'Clock: bigger glass, big sound rings ----------
const glass=(x,y,fill=1,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  EO(0,22,10,3,'#e8f4ff'); LnO(0,6,0,22,2,'#e8f4ff');
  gfx.beginPath(); gfx.moveTo(-13,-22); gfx.quadraticCurveTo(-15,4,0,7); gfx.quadraticCurveTo(15,4,13,-22); gfx.closePath(); gfx.fillStyle='rgba(232,244,255,.55)'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  if(fill>0) { gfx.save(); gfx.clip(); R(-16,-10+(1-fill)*14,32,20,'#f3df7a'); R(-16,-10+(1-fill)*14,32,3,'#fff1a8'); gfx.restore(); }
  Ln(-8,-18,-9,-4,3,'rgba(255,255,255,.85)'); gfx.restore(); };
const GS=2,gpos=()=>{ const hs=hands(); return {x:hs.n.x-30,y:hs.n.y-12,f:hs.f}; };
SC.dv_glass=(s,u)=>{ const ms=s.t*1000,g=gpos(),P=s.P; gfx.globalAlpha=fade(u,.96); const fill=ms<P.sip?1:lerp(1,.45,ez((ms-P.sip)/500));
  glass(g.x,g.y,fill,GS);
  if(ms<P.sip) { const sx=lerp(g.f.x,g.x+20,.5),sy=g.f.y-14; gfx.save(); gfx.translate(sx,sy); gfx.rotate(-1.1); if(!PROPART.draw('deedee/spoon',0,-22,{h:48})) { LnO(0,0,0,-34,3,SILVER); EO(0,-40,5,8,SILVER); } gfx.restore(); } };
SC.dp_rings=(s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.3-k*.12); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.95; ring(s.x,s.y,10+q*s.r,8+q*s.r*.75,(k%2?4:7)*(1-q)+1,k%2?CREAM:(s.c||GOLD)); }
  gfx.globalAlpha=fade(u,.5); for(let k=0;k<8;k++) { const a=k/8*Math.PI*2+.2,d=14+ez(u)*s.r*.55; Ln(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,s.x+Math.cos(a)*(d+10),s.y+Math.sin(a)*(d+10)*.75,3,GOLD); } };
SC.dp_freeze=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.85); for(const f of s.list) { const F=ST.unit(f); bigWord('!',F.x+F.w*.3,F.top-12,GOLD,4); } if(u>.2&&u<.8) { gfx.globalAlpha=1; const G=ST.group(s.list); bigWord('LISTENING...',G.x,G.top-52,CREAM,2); } };
D.wineShow=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,62),me=ST.unit(m),list=liveFoes();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:back(p.x,me)==='walkR'?'walkR':'walk',hop:3,hn:6},{t:900,x:p.x,y:p.y,f:DD_XF('toast','aim')},{t:1250,f:'clap'},{t:1400,f:DD_XF('toast','aim')},{t:1650,f:'clap'},{t:1800,f:DD_XF('toast','aim')},{t:2050,f:'clap'},{t:2300,f:'celeb',hop:6},{t:2900,f:'expr'},{t:3500,f:'hip'},{t:3900,f:back(p.x,me),hop:3,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  const P={sip:2950};
  const ting=(k)=>()=>{ const g=gpos(); sfx.ting(); scene('dp_rings',.8,{x:g.x,y:g.y-18,r:60+k*45}); scene('dv_text',.8,{x:g.x-30-k*34,y:g.y-70-k*14,txt:'TING',c:GOLD,sc:3+(k===2?1:0)}); };
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up with a glass of wine and a spoon. She has an announcement.'); say(m.id,'wine'); scene('dv_glass',4.0,{P}); }],
    [1250,ting(0)],
    [1350,()=>{ setMessage('Ting, ting, ting. A toast! Every monster freezes mid wind-up to listen.'); scene('dp_freeze',2.2,{list}); ST.draw(()=>{ list.forEach((g,k)=>lift(g,-4,(k%2?1:-1)*.14,0)); },2.1); }],
    [1650,ting(1)],
    ['hf',2050],
    [2050,()=>{ ting(2)(); const g=gpos(); ST.fly((x,y,uu)=>{ gfx.globalAlpha=1-uu*.4; ring(x,y,14+uu*24,11+uu*18,6,GOLD); ring(x,y,6+uu*12,5+uu*9,3,CREAM); },g.x,g.y-18,F.x,F.mid,.25,0,0,{ease:'lin'}); }],
    [2300,()=>{ sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('dp_rings',.7,{x:F.x,y:F.mid,r:70,c:CREAM}); scene('dv_big',1.2,{x:F.x,y:F.top-74,txt:'TING!',c:GOLD,sc:5}); scene('dv_text',1.1,{st,txt:'CHEERS!',c:CREAM,sc:3}); setMessage('Cheers! The last TING rings right through it.'); }],
    [2950,()=>{ setMessage('She sips.'); sfx.vapor&&sfx.vapor(); }],
    [3450,()=>{ scene('dv_text',1.2,{st,txt:'AHH.',c:GOLD,sc:3}); sfx.ding(); setMessage('Ahh. Everyone may now resume.'); }],
    [4900,'end',res(E2)+'It\'s five o’clock somewhere. Its wind-up is cancelled.']]); };

// ---------- Oven Mitt Ultimatum: huge mitts, a big clap shockwave ----------
const MS=2.0;
SC.dd_mitts=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),on=ez((ms-P.on)/600),clap=ms>P.clap-80&&ms<P.clap+160?Math.sin(cl((ms-P.clap+80)/240)*Math.PI):0,hang=ez((ms-P.hang)/350);
  if(ms<P.on) return; gfx.globalAlpha=fade(u,.96);
  const mitt=(x,y,f)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(f*on*MS,on*MS); EO(0,0,15,19,'#f0a0a0'); EO(-12,-8,6,8,'#f0a0a0'); for(let k=0;k<5;k++) E(-11+k*5.5,-14+Math.sin(k)*2,3,3,'#ffc8c8'); R(-10,10,20,6,CREAM); for(let k=0;k<5;k++) E(-9+k*4.5,13,2.5,2.5,'#ffffff'); for(let k=0;k<4;k++) E(-9+k*6,-2,2,2,'#ffd0d0'); gfx.restore(); };
  const gap=lerp(24,3,clap)*MS*.85,x=h.x-20+hang*40,y=h.y-40-hang*30; mitt(x-gap,y,1); mitt(x+gap,y,-1); if(hang>.9) Ln(x-60,y-50,x+60,y-50,3,WOOD);
  if(ms<P.on+800) bigWord('FLUFFY',h.x-10,h.y-110,CREAM,2); };
SC.dp_shock=(s,u)=>{ const q=ez(u); for(let k=0;k<3;k++) { const qq=cl(u*1.4-k*.14); if(qq<=0||qq>=1) continue; gfx.globalAlpha=(1-qq)*.9; ring(s.x,s.y,20+qq*s.r,14+qq*s.r*.55,10*(1-qq)+2,k%2?CREAM:'#ffb45a'); }
  gfx.globalAlpha=fade(u,.4)*.8; for(let k=0;k<12;k++) { const a=k/12*Math.PI*2,d=24+q*s.r*.8; Ln(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.55,s.x+Math.cos(a)*(d+26),s.y+Math.sin(a)*(d+26)*.55,4,CREAM); } };
D.oven_mitt_ultimatum=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,60),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'kneel'},{t:1000,f:'act',dx:(u,tt)=>Math.sin(tt*6)*2},{t:1700,f:'celeb'},{t:2150,f:'clap'},{t:2500,f:'hip'},{t:2900,f:'spread'},{t:3250,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={on:1000,clap:2150,hang:2900};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up to them and slowly puts on two enormous, very fluffy oven mitts.'); say(m.id,'oven_mitt_ultimatum'); scene('dd_mitts',3.4,{plan}); }],
    [1700,()=>{ sfx.charge(); setMessage('The fluffy mitts go up.'); }],
    ['hf',2150],
    [2150,()=>{ sfx.thud(); sfx.bonk(); sfx.thud(); const h=hand(); scene('dv_flash',.2,{a:.5,c:'#fff1d8'}); scene('dp_shock',.8,{x:h.x-20,y:h.y-40,r:Math.max(220,h.x-Gp.x0+40)}); scene('dd_wave',.9,{G:Gp});
      scene('dv_big',1.2,{x:(Gp.x+p.x)/2,y:Gp.top-74,txt:'CLAP!',c:'#ffb45a',sc:5}); all(list); landHit(100); }],
    [2900,()=>{ sfx.select(); setMessage('She hangs the mitts up neatly. The enemies look chastened.'); }],
    [4200,'end',res(E2)+'Deedee has used the serious mitts.']]); };

// ---------- Brisk Means Brisk: speed lines, big pumping arms ----------
const dumbbell=(x,y,rot,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); RO(-11,-2,22,4,'#9aa3b0'); for(const sd of [-1,1]) { RO(sd*11-5,-9,10,18,'#ff7aa8'); R(sd*11-3,-7,3,14,'#ffb0cc'); } gfx.restore(); };
SC.dv_weights=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; gfx.globalAlpha=fade(u,.97); const hs=hands(),on=ms>s.from&&ms<s.to,sw=on?Math.sin(s.t*14):0,A=16;
  dumbbell(hs.f.x,hs.f.y-sw*A,.3+sw*.8,1.3); dumbbell(hs.n.x,hs.n.y+sw*A,-.3-sw*.8,1.3);
  if(on) for(const [h,d] of [[hs.n,1],[hs.f,-1]]) { gfx.globalAlpha=.65; gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(h.x,h.y,28,-.9,.9); gfx.stroke(); gfx.globalAlpha=.4; gfx.beginPath(); gfx.arc(h.x,h.y,36,-.7,.7); gfx.stroke(); }
  if(ms<s.from+700&&ms>200) { gfx.globalAlpha=1; bigWord('1 LB',hs.n.x,hs.n.y-40,'#ff7aa8',2); }
  if(on&&Math.floor(s.t*4)%2) { gfx.globalAlpha=.9; bigWord(Math.floor(s.t*2)%2?'HUP':'TWO',st.x,st.y-DH()-20,CREAM,2); } };
SC.dd_speed=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; if(ms<s.from||ms>s.to) return; const dir=s.dir(ms);
  for(let k=0;k<9;k++) { const q=((ms/220)+k*.23)%1,y=st.y-DH()*.95+k*(DH()*.9/8),x=st.x+dir*(30+q*120),L=26+(k%3)*16; gfx.globalAlpha=(1-q)*.85; Ln(x,y,x+dir*L,y,k%2?3:4,k%3?CREAM:'#ffd0e0'); }
  for(let k=0;k<3;k++) { const q=((ms/300)+k/3)%1; gfx.globalAlpha=(1-q)*.7; E(st.x+dir*(14+q*30),st.y-2-q*8,4+q*6,3+q*4,'#e8dcc4'); } };

// ---------- Grandma Squeeze: bigger squash, big lipstick ----------
const lips=(x,y,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.rotate(-.2);
  gfx.beginPath(); gfx.moveTo(-14,0); gfx.quadraticCurveTo(-8,-10,-2,-4); gfx.quadraticCurveTo(0,-6,2,-4); gfx.quadraticCurveTo(8,-10,14,0); gfx.quadraticCurveTo(0,-2,-14,0); gfx.closePath(); gfx.fillStyle=LIP; gfx.fill();
  gfx.beginPath(); gfx.moveTo(-14,1); gfx.quadraticCurveTo(0,4,14,1); gfx.quadraticCurveTo(8,12,0,12); gfx.quadraticCurveTo(-8,12,-14,1); gfx.closePath(); gfx.fill();
  Ln(-11,1,11,1,1.5,'#8a1020'); E(-6,-3,2,1.2,'#ff8a9a'); E(5,6,3,1.4,'#ff8a9a'); gfx.restore(); };
const HEADF={tom:.86,grace:.84,rose:.84,nara:.62};
const cheek=u=>{ const U=ST.unit(u); if(u.side==='foe') return {x:U.x+U.w*.12,y:U.top+U.h*.4}; const hf=HEADF[u.id]||.72; return {x:U.x-U.w*.16,y:U.base-U.h*(hf-.13)}; };
SC.dv_kiss=(s,u)=>{ const pop=u<.08?ez(u/.08)*1.6:lerp(1.6,1,cl((u-.08)/.1)); gfx.globalAlpha=fade(u,.9); const c=s.u?cheek(s.u):{x:s.x,y:s.y}; if(!PROPART.draw('deedee/kiss_mark',c.x,c.y,{w:62*pop,rot:-.2})) lips(c.x,c.y,pop*1.5); };
SC.dp_hug=(s,u)=>{ for(let k=0;k<9;k++) { const q=((s.t/1.1)+k/9)%1,a=-Math.PI/2+(k-4)*.32; gfx.globalAlpha=Math.sin(q*Math.PI)*fade(u,.8); const x=s.x+Math.cos(a)*(20+q*50),y=s.y+Math.sin(a)*(20+q*46)-q*20,r=5+Math.sin(q*Math.PI)*5;
  E(x-r*.5,y-r*.2,r*.6+2,r*.6+2,OUT); E(x+r*.5,y-r*.2,r*.6+2,r*.6+2,OUT); E(x-r*.5,y-r*.2,r*.6,r*.6,k%2?ROSE:'#ff6b9a'); E(x+r*.5,y-r*.2,r*.6,r*.6,k%2?ROSE:'#ff6b9a');
  gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=k%2?ROSE:'#ff6b9a'; gfx.fill(); } };
D.grandma_squeeze=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const sp=self?{x:me.x,y:me.base}:{x:Math.min(560,H.x+H.w*.5+(foe?14:4)),y:Math.min(316,H.base+3)};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'spread':'run'},{t:self?300:800,x:sp.x,y:sp.y,f:'spread'},{t:self?500:950,f:'clap',dx:(u,tt)=>Math.sin(tt*22)*5,rot:(u,tt)=>Math.sin(tt*9)*.1,sc:(u,tt)=>1+Math.abs(Math.sin(tt*11))*.06},{t:2200,f:'act',dx:-8},{t:2700,f:'celeb',hop:8},{t:3100,f:self?'idle':back(sp.x,me),hop:3,hn:6},{t:4000,x:'home',y:'home',f:'idle'}]);
  if(!self&&!foe) battle.fx[t.idx].path={t:0,dur:2.4,fn:(q,c)=>{ const ms=q*2400; if(ms<950||ms>2200) return {}; const w=Math.sin(ms/55); return {cx:c.origX+w*4,base:c.origBase,rot:Math.sin(ms/110)*.12,sc:1-.18*Math.abs(w)}; }};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee gives herself a big squeeze. She deserves one.':'Deedee spots '+t.name+' from across the room. Arms out. No escape.'); say(m.id,'grandma_squeeze'); }],
    [950,()=>{ scene('dv_big',1.3,{x:H.x,y:H.top-84,txt:'SQUEEZE!',c:ROSE,sc:5}); scene('dp_hug',1.3,{x:H.x,y:H.top+10}); sfx.squeak&&sfx.squeak(); b7Later(()=>sfx.squeak&&sfx.squeak(),300); b7Later(()=>sfx.squeak&&sfx.squeak(),600); setMessage('One big squeezy Deedee hug.'); if(foe) ST.draw((s,u)=>lift(t,Math.abs(Math.sin(u*20))*-8,Math.sin(u*24)*.12,0),1.25); }],
    ['hf',1500],
    [1500,()=>{ E2.apply(); sfx.heal(); scene('dv_glow',1,{x:H.x,y:H.mid,c:ROSE}); }],
    [2300,()=>{ sfx.kiss?sfx.kiss():sfx.select(); scene('dv_kiss',(4100-2300)/1000,{u:t}); const c=cheek(t); scene('dv_text',1.1,{x:c.x-46,y:c.y-40,txt:'MWAH!',c:LIP,sc:4}); setMessage('And a big lipstick kiss on the cheek. That won\'t come off for days.'); }],
    [4100,'end',kindLine(t,'Squeezed, kissed, and feeling much better.')]]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// Deedee's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// Deedee for real. Sunday Roast Spread (A6): she rings the dinner bell, ties on her apron at a stove, lights all four burners,
// cooks at top speed (pots, spoons, a rolling pin, a colander and a pie whirl round her), the kitchen whirlwind sweeps through
// every enemy, then a long oak table with a white cloth slides in, the family takes their seats at the eight places, the food
// lands (roast turkey, mashed potatoes, salad, gravy, rhubarb crisp) and everyone raises a hand: heal, cure, crusts and Hot
// Dishes. To the Moon and Back (B6): the sky goes dark and starry under a big full moon, the family comes in for a group hug,
// a golden heart flies from Deedee up to the moon, loops round it and comes back down as a shower of starlight on every enemy,
// then the starlight falls on the family (fallen friends get up) and wraps them in patchwork quilts; the monsters go soft
// (Smitten) and she blows them a kiss. Scenes prefix d5_ (no warp). BAR=24 letterbox and inBox(), jog() from Amy's file.
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
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const heartO=(x,y,r,c)=>{ heart(x,y,r+2.5,OUT); heart(x,y,r,c); };
const D=RECRUIT_MOVES.deedee;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',ROSE='#ff9ac0',PINK='#ff6b9a',RED='#e0402e',GREEN='#8ef0a0',SKY='#9fd8ff';
const WOOD='#a8743e',WOOD2='#c88f52',WOOD3='#6e4824',CLOTH='#fbfaf4',CLOTH2='#e4e0d4',STEEL='#cfd6de',STEEL2='#8e98a4',ENAMEL='#f4f1ea';
const NIGHT='#141a3e',NIGHT2='#232c66',MOON='#fff4c4',MOON2='#f0dc94';
ST.nw('d5_');
if(!sfx.ting) sfx.ting=(d=0)=>{ tone({type:'sine',f0:2637,dur:.6,vol:.16,delay:d}); tone({type:'triangle',f0:5274,dur:.35,vol:.05,delay:d}); };
if(!sfx.whoomp) sfx.whoomp=(d=0)=>{ noise({dur:.28,vol:.16,f0:500,f1:120,type:'lowpass',delay:d}); };
if(!sfx.sizzle) sfx.sizzle=()=>{ noise({dur:.5,vol:.07,f0:6000,f1:4000,type:'highpass'}); };
if(!sfx.harp) sfx.harp=()=>{ [523,659,784,988,1175,1319,1568].forEach((f,k)=>tone({type:'triangle',f0:f,dur:.5,vol:.07,delay:k*.07})); };
if(!sfx.dinnerBell) sfx.dinnerBell=()=>{ for(let k=0;k<6;k++) { tone({type:'sine',f0:k%2?1760:1568,dur:.25,vol:.12,delay:k*.13}); tone({type:'triangle',f0:k%2?3520:3136,dur:.15,vol:.03,delay:k*.13}); } };
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const DSP=()=>BATTLE_SPRITES.deedee,DH=()=>DSP().idle.length*DSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-DH()*(st.sc||1)*.72+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const BAR=24;
SC.d5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.d5_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+BAR+16,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; });
SC.d5_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.d5_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); gfx.globalAlpha=1; };
SC.d5_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5);
  star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM),u*4+k); } gfx.globalAlpha=1; };
// A party member who is not the actor, moved on its own path: fn(ms) returns {dx,dy} offsets from home, frame and rot.
const jog=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur:dur/1000,fn:(q,c)=>{ const r=fn(q*dur,c.t)||{};
  let fr=null; if(r.frame==='run'||r.frame==='runR') { const a=r.frame==='run'?c.sp.run:c.sp.runFlip; fr=a?a[Math.floor(c.t*12)%2]:c.sp.idle; } else if(r.frame) fr=c.sp[r.frame]||c.sp.idle;
  const [wx,wy]=ST.unwarp(c.origX+(r.dx||0),c.origBase+(r.dy||0)); return {cx:wx,base:wy,rot:r.rot||0,frame:fr}; }}; };

// ---------- Sunday Roast Spread (A6) ----------
// The dinner bell in her hand while she walks over.
SC.d5_bell=(s,u)=>{ const h=hand(),sw=Math.sin(s.t*24)*.5; gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(h.x,h.y); gfx.rotate(sw);
  if(!PROPART.draw('deedee/dinner_bell',0,-6,{h:42})) { RO(-2,-20,4,12,WOOD3); PO([[-5,-9],[5,-9],[11,6],[-11,6]],GOLD2); R(-8,2,16,3,'#fff0a0'); EO(0,9,3,3,'#8a6a2a'); } gfx.restore();
  for(let k=0;k<2;k++) { const q=((s.t*3)+k/2)%1; gfx.globalAlpha=(1-q)*.8*fade(u,.8); gfx.strokeStyle=GOLD; gfx.lineWidth=3;
    for(const sd of [-1,1]) { gfx.beginPath(); gfx.arc(h.x,h.y,14+q*24,sd<0?Math.PI*.7:-Math.PI*.3,sd<0?Math.PI*1.3:Math.PI*.3); gfx.stroke(); } } gfx.globalAlpha=1; };
// Her apron while she cooks (front of the body, white with a red trim and a heart pocket).
SC.d5_apron=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const H=DH(),x=st.x+2,y0=st.y-H*.52,y1=st.y-H*.17,tw=13,bw=18;
  gfx.globalAlpha=fin(u,.06)*fade(u,.96);
  Ln(x-tw+2,y0,x-6,y0-12,2,CLOTH2); Ln(x+tw-2,y0,x+6,y0-12,2,CLOTH2);
  if(PROPART.draw('deedee/apron',x,(y0+y1)/2-3,{h:(y1-y0)*1.45})) { gfx.globalAlpha=1; return; }   // painted blue floral apron
  PO([[x-tw,y0],[x+tw,y0],[x+bw,y1],[x-bw,y1]],CLOTH); R(x-bw+1,y1-4,bw*2-2,3,RED); R(x-tw,y0+12,tw*2,2,RED); heart(x,y0+24,5,'#ff6b9a'); gfx.globalAlpha=1; };
// The stove: an enamel range with four burners that light one by one. Flames roar while she cooks.
SC.d5_stove=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,g=ez((ms-P.stove)/240); if(g<=0) return; const out=ms>P.stoveOut?1-ez((ms-P.stoveOut)/260):1; if(out<=0) return;
  const x=s.x,y=s.y,w=84,h=50*g*out,top=y-h;
  const PS=PROPART.draw('deedee/stove',x,y-h*.62,{h:h*1.24});   // painted range (its own burners, oven and glow); the flames still light on top
  if(!PS) { RO(x-w/2,top,w,h,ENAMEL); R(x-w/2,top,w,8,'#d8d2c4'); for(let k=0;k<4;k++) EO(x-30+k*20,top+4,3,2.5,'#3a3430'); }
  if(!PS&&h>26) { RO(x-w/2+10,top+14,w-20,h-22,'#3a3430'); const glow=ms>P.cook0&&ms<P.go?.6+Math.sin(ms/60)*.2:.25; gfx.globalAlpha=glow; R(x-w/2+12,top+16,w-24,h-26,'#ff9a3a'); gfx.globalAlpha=1;
    R(x-w/2+14,top+18,w-28,3,'#ffffff55'); RO(x-16,top+10,32,3,STEEL2); }
  if(!PS) RO(x-w/2-2,top-6,w+4,6,'#2a2622');
  for(let k=0;k<4;k++) { const bx=x-30+k*20; if(!PS) RO(bx-7,top-8,14,2,'#555'); if(ms<P.burn[k]) continue;
    const big=(ms>P.cook0&&ms<P.go)?1.9:1,lit=ez((ms-P.burn[k])/120);
    for(let j=0;j<5;j++) { const fx=bx-6+j*3,fl=Math.sin(ms/45+j*1.7+k)*2; E(fx,top-12-fl*.5,2.2,(5+fl)*big*lit,'#5cb8ff'); E(fx,top-14-fl*.6-(big-1)*5,1.2,(3+fl*.5)*big*lit,j%2?'#ffb04a':'#ffe08a'); } }
  if(ms>P.burn[3]&&ms<P.burn[3]+300) { const q=(ms-P.burn[3])/300; gfx.globalAlpha=1-q; ring(x,top-10,20+q*40,8+q*14,3,'#ffb04a'); gfx.globalAlpha=1; } };
// Kitchen things, drawn about 2x: a pot, a wooden spoon, a rolling pin, a colander, a pie, a carrot, a whisk, a ladle.
const KIT=['pot','spoon','pin','colander','pie','carrot','whisk','ladle'];
const KITART={pot:['pot_colander_and_carrot',28],colander:['pot_colander_and_carrot',26,1],carrot:['pot_colander_and_carrot',24,0,.5],spoon:['kitchen_utensils',30],pin:['kitchen_utensils',32,1],whisk:['kitchen_utensils',28,0,.6],ladle:['kitchen_utensils',26,1,.4],pie:['pie',30]};   // painted clusters stand in for the single drawn things
const kit=(k,x,y,r)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(r);
  const ka=KITART[k]; if(ka&&PROPART.draw('deedee/'+ka[0],0,0,{h:ka[1],flip:!!ka[2]})) { gfx.restore(); return; }
  if(k==='pot') { RO(-12,-6,24,14,STEEL2); R(-12,-6,24,3,STEEL); RO(-17,-4,5,3,OUT); RO(12,-4,5,3,OUT); }
  else if(k==='spoon') { LnO(-14,0,8,0,3,WOOD2); EO(11,0,6,4,WOOD2); }
  else if(k==='pin') { RO(-12,-4,24,8,WOOD2); R(-12,-3,24,2,'#e8b878'); RO(-18,-2,6,4,WOOD); RO(12,-2,6,4,WOOD); }
  else if(k==='colander') { EO(0,0,13,8,STEEL); for(let j=0;j<5;j++) E(-8+j*4,1,1.2,1.2,STEEL2); RO(-17,-2,4,3,STEEL2); RO(13,-2,4,3,STEEL2); }
  else if(k==='pie') { EO(0,0,13,7,'#d9a05a'); E(0,-1,10,5,'#e8b878'); for(let j=0;j<3;j++) R(-8+j*7,-3,2,5,'#b05a3a'); }
  else if(k==='carrot') { PO([[-12,-3],[10,0],[-12,3]],'#ff8a2a'); Ln(-12,0,-17,-4,2,'#5ab84a'); Ln(-12,0,-17,4,2,'#5ab84a'); }
  else if(k==='whisk') { LnO(-14,0,0,0,3,WOOD3); for(const o of [-4,0,4]) { gfx.strokeStyle=STEEL; gfx.lineWidth=2; gfx.beginPath(); gfx.ellipse(8,o*.4,9,4+Math.abs(o)*.3,0,0,Math.PI*2); gfx.stroke(); } }
  else { LnO(-14,0,6,0,2.5,STEEL2); EO(10,2,6,5,STEEL); }
  gfx.restore(); };
// The whirlwind: kitchen things orbit over the stove while she cooks, then the whole cyclone (with steam and flame
// streaks) travels left through every enemy, lifting and spinning them as it passes.
SC.d5_whirl=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0; if(ms<P.cook0||ms>P.goEnd+300) return;
  const grow=ez((ms-P.cook0)/600),tr=ez((ms-P.go)/(P.goEnd-P.go)),cx=lerp(P.sx,P.ex,tr),cy=lerp(P.sy,P.ey,tr),R0=lerp(24,46,grow)+tr*18,fo=ms>P.goEnd?1-(ms-P.goEnd)/300:1;
  gfx.globalAlpha=fo;
  for(let k=0;k<4;k++) { const q=((ms/700)+k/4)%1; gfx.globalAlpha=fo*(1-q)*.5; ring(cx,cy-q*20,R0*(.6+q*.7),R0*(.25+q*.25),3,k%2?'#ffffff':'#ffd0a0'); }
  if(ms>P.go) for(let k=0;k<6;k++) { const a=ms/90+k; gfx.globalAlpha=fo*.6; Ln(cx+Math.cos(a)*R0*1.2,cy+Math.sin(a)*R0*.45,cx+Math.cos(a+.6)*R0*1.3,cy+Math.sin(a+.6)*R0*.5,3,k%2?'#ffb04a':'#ffe08a'); }
  gfx.globalAlpha=fo;
  KIT.forEach((k,i)=>{ const a=ms/(ms>P.go?110:170)+i/KIT.length*Math.PI*2,rx=R0*(1+(i%2)*.25),x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*rx*.42-(i%3)*6;
    kit(k,x,y,a*2+i); });
  gfx.globalAlpha=1;
  for(const b of P.pins) { if(ms<b.t) continue; const q=(ms-b.t)/750; if(q>=1) continue; lift(b.f,-Math.sin(q*Math.PI)*(34+b.k*6),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*10); } });
// Cooking words over the stove, one after another.
SC.d5_words=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0; P.words.forEach(([t,w],k)=>{ const q=(ms-t)/700; if(q<0||q>1) return;
  gfx.globalAlpha=fade(q,.7); const pop=q<.15?ez(q/.15)*1.25:lerp(1.25,1,cl((q-.15)/.15)); gfx.save(); gfx.translate(P.sx+(k-1)*58,P.sy-58-q*10); gfx.scale(pop,pop); bigWord(w,0,0,[GOLD,CREAM,'#ffb04a'][k%3],2); gfx.restore(); }); gfx.globalAlpha=1; };
// The table: a long oak table under a white cloth, eight places set, sliding in from the right in front of the family.
// Food lands on it one dish at a time (P.food times). Drawn in front, so the family stands behind it.
const steam=(x,y,ms,k)=>{ for(let j=0;j<2;j++) { const q=((ms/900)+j/2+k*.3)%1; gfx.globalAlpha=(1-q)*.7; gfx.strokeStyle='#ffffff'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(x+j*6-3,y-q*18);
  gfx.quadraticCurveTo(x+j*6-3+Math.sin(q*6+k)*5,y-q*18-6,x+j*6-3,y-q*18-12); gfx.stroke(); } gfx.globalAlpha=1; };
const DISHART={turkey:['roast_turkey',null,54],potato:['side_dishes',[0,38,100,62],34],salad:['side_dishes',[58,0,102,58],34],gravy:['side_dishes',[55,62,105,79],30],crisp:['plate_with_corner_piece',null,40]};
const dish=(k,x,y,g,ms)=>{ if(g<=0) return; gfx.save(); gfx.translate(x,y); gfx.scale(g,g);
  const da=DISHART[k]; if(da&&PROPART.draw('deedee/'+da[0],0,-da[2]*.35,{w:da[2]*(da[0]==='roast_turkey'?1.15:1),src:da[1]||undefined})) { gfx.restore(); if(k==='turkey'||k==='crisp'||k==='potato') steam(x,y-22*g,ms,KIT.indexOf(k)+x); return; }
  if(k==='turkey') { EO(0,0,24,6,CLOTH2); EO(0,-8,16,10,'#c8782e'); E(-5,-12,7,4,'#e8a050'); RO(-22,-8,8,4,'#c8782e'); RO(14,-8,8,4,'#c8782e'); EO(-22,-6,2.5,2.5,CLOTH); EO(22,-6,2.5,2.5,CLOTH);
    for(let j=0;j<4;j++) E(-18+j*12,2,3,2,'#5ab84a'); }
  else if(k==='potato') { EO(0,0,14,7,'#7cb0e0'); E(0,-5,12,7,'#fff6d8'); E(-3,-8,4,3,'#ffffff'); E(2,-9,3,2,'#ffe08a'); }
  else if(k==='salad') { EO(0,0,14,7,'#e8d8b8'); for(let j=0;j<6;j++) E(-9+j*3.6,-5-(j%2)*3,4,3,j%3?'#5ab84a':'#8ad86a'); E(-2,-6,2,2,'#e0402e'); E(5,-4,2,2,'#e0402e'); }
  else if(k==='gravy') { EO(0,-2,12,6,CLOTH); E(0,-4,9,3,'#8a5428'); PO([[9,-5],[18,-9],[12,-2]],CLOTH,2); RO(-14,-4,3,5,CLOTH2); }
  else { RO(-15,-12,30,14,'#c84a4a'); R(-13,-12,26,5,'#e8b878'); for(let j=0;j<5;j++) E(-11+j*5.5,-12,2.5,2,'#d9a05a'); }
  gfx.restore(); if(k==='turkey'||k==='crisp'||k==='potato') steam(x,y-22*g,ms,KIT.indexOf(k)+x); };
SC.d5_table=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,T=P.T,inn=ez((ms-P.table)/500),out=ms>P.tableOut?ez((ms-P.tableOut)/450):0,off=(1-inn)*330+out*330; if(inn<=0) return;
  const x0=P.tx0+off,x1=P.tx1+off;
  RO(x0+10,T+20,8,26,WOOD3); RO(x1-18,T+20,8,26,WOOD3); RO(x0+(x1-x0)*.5-4,T+22,8,24,WOOD3);
  RO(x0,T-7,x1-x0,11,CLOTH); R(x0,T+1,x1-x0,2,CLOTH2);
  RO(x0-4,T+4,x1-x0+8,20,CLOTH); R(x0-4,T+8,x1-x0+8,2,GOLD2);
  for(let x=x0-4;x<x1+4;x+=10) { E(x+5,T+24,5.5,3.5,OUT); E(x+5,T+23,4.5,2.5,CLOTH); }
  for(let i=0;i<8;i++) { const px=P.seat0+i*P.seatW+off; EO(px,T-3,10,3.5,'#ffffff'); ring(px,T-3,6,2,1,CLOTH2); R(px-15,T-6,1.5,6,STEEL2); R(px+13,T-6,1.5,6,STEEL2); }
  P.dishes.forEach(([k,dx,t])=>{ const q=(ms-t)/260,g=q<=0?0:(q<1?ez(q)*1.25:lerp(1.25,1,cl(q-1))); dish(k,P.mid+dx+off,T-5,g,ms); });
  P.dishes.forEach(([k,dx,t])=>{ const q=(ms-t)/500; if(q<0||q>1) return; gfx.globalAlpha=1-q; for(let j=0;j<6;j++) { const a=j/6*Math.PI*2; star(P.mid+dx+off+Math.cos(a)*q*24,T-14+Math.sin(a)*q*12,4,GOLD,q*5); } gfx.globalAlpha=1; }); };
D.sunday_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m),others=party.filter(p=>p!==m);
  const sx=Math.round(Math.max(Gp.x1+60,Math.min(320,(Gp.x1+340)/2))),sb=290,cook={x:sx+50,y:sb+2};
  const T=240,seat0=304,seatW=32,seatY=T+14;
  const P={t0:0,stove:700,burn:[950,1080,1210,1340],cook0:1450,go:2500,goEnd:3200,stoveOut:3250,table:3350,tableOut:5600,
    sx,sy:sb-50-48,ex:Math.max(20,Gp.x0-24),ey:Gp.top+18,T,tx0:seat0-22,tx1:seat0+7*seatW+22,seat0,seatW,mid:seat0+3.5*seatW,
    words:[[1600,'CHOP!'],[1950,'BASTE!'],[2300,'BAKE!']],
    dishes:[['turkey',16,3950],['potato',-48,4100],['salad',80,4250],['gravy',-112,4380],['crisp',-80,4500]]};
  const at=x=>P.go+cl((P.sx-x)/(P.sx-P.ex))*(P.goEnd-P.go);
  P.pins=list.map((f,k)=>{ const F=ST.foe(f); return {f,k,t:at(F.x)}; });
  const hit=Math.round(at(Gp.x));
  // seats: Deedee at the head (the last place), everyone else at every other place from the left
  const seatOf=new Map(); seatOf.set(m,7); others.forEach((p,k)=>seatOf.set(p,[1,3,5,6,4,2,0][k]));
  const seatX=p=>seat0+seatOf.get(p)*seatW;
  const cookF=(u,tt)=>['act','throw','wind','celeb'][Math.floor(tt*8)%4];
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:cook.x<me.x?'walk':'walkR'},{t:700,x:cook.x,y:cook.y,f:DD_XF('bell','hip')},{t:950,f:'aim'},{t:P.cook0,f:cookF,dx:(u,tt)=>Math.sin(tt*20)*3,hop:5,hn:6},
    {t:P.go,f:'throw',hop:8},{t:3350,f:seatX(m)<cook.x?'walk':'walkR'},{t:3900,x:seatX(m),y:seatY,f:'spread'},{t:4550,f:'celeb',hop:10,hn:2},{t:5300,f:'clap'},
    {t:5600,f:me.x<seatX(m)?'walk':'walkR'},{t:6300,x:'home',y:'home',f:'idle'}]);
  for(const p of others) { const U=ST.unit(p),dx=seatX(p)-U.x,dy=seatY-U.base,k=p.idx; jog(p,6300,(ms,tt)=>{
    if(ms<3350) return {};
    if(ms<3900) { const q=ez((ms-3350)/550); return {frame:dx<0?'run':'runR',dx:dx*q,dy:dy*q}; }
    if(ms<4550) return {dx,dy};
    if(ms<5300) return {dx,dy,frame:'celeb',dy:dy-Math.abs(Math.sin((ms-4550)/380*Math.PI+k))*8};
    if(ms<5600) return {dx,dy};
    const q=ez((ms-5600)/700); return {frame:q<1?(dx<0?'runR':'run'):null,dx:dx*(1-q),dy:dy*(1-q)}; }); }
  ST.play(E2,[
    [0,()=>{ scene('d5_bars',6.6,{}); scene('d5_bell',.95,{}); sfx.dinnerBell(); say(m.id,'sunday_ult');
      scene('d5_big',.65,{st,txt:'DING DING!',c:GOLD,sc:3}); setMessage('Deedee rings the dinner bell. Sunday dinner, everybody!'); }],
    [700,()=>{ scene('d5_stove',2.9,{plan:P,t0:700,x:sx,y:sb}); scene('d5_apron',2.65,{st}); scene('d5_big',.9,{st,txt:'APRON ON!',c:CREAM,sc:2}); sfx.thud(); setMessage('A stove pops up. Apron on. Sleeves up.'); }],
    ...P.burn.map((t,k)=>[t,()=>{ sfx.whoomp(); if(k===3) setMessage('All four burners. Full blast.'); }]),
    [P.cook0,()=>{ scene('d5_whirl',2.1,{plan:P,t0:P.cook0}); scene('d5_words',1.6,{plan:P,t0:P.cook0}); sfx.sizzle(); setMessage('She chops, bastes and bakes at top speed. Things are flying.'); }],
    [1950,()=>{ sfx.sizzle(); (sfx.clang||sfx.bonk)(); }],[2300,()=>{ sfx.sizzle(); sfx.whoosh(); }],
    [P.go,()=>{ sfx.whoosh(); b7Later(()=>sfx.whoosh(),250); setMessage('The kitchen whirlwind spins right out of the kitchen.'); }],
    ...P.pins.map(b=>[Math.round(b.t),()=>{ sfx.bonk(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('d5_flash',.3,{a:.45,c:'#ffd0a0'});
      scene('d5_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'KITCHEN WHIRLWIND!',c:'#ffb04a',sc:3}); }],
    [3350,()=>{ scene('d5_table',3.0,{plan:P,t0:3350}); sfx.whoosh(); setMessage('A long table slides in. White cloth. Eight places, all set.'); }],
    ...P.dishes.map(([k,dx,t])=>[t,()=>{ sfx.ding(); }]),
    [4550,()=>{ scene('d5_big',1.1,{x:Math.max(200,Gp.x+60),y:BAR+50,txt:'DINNER IS SERVED!',c:GOLD,sc:3}); sfx.fanfare?sfx.fanfare():sfx.levelUp(); setMessage('Roast turkey, mashed potatoes, salad, gravy and rhubarb crisp. Everybody sits.'); }],
    [4850,()=>{ E2.apply(); sfx.heal(); for(const p of b2LiveParty()) { const q=ST.unit(p); scene('d5_glow',1.1,{x:seatX(p)||q.x,y:seatY-q.h*.5,c:GOLD}); } }],
    [5300,()=>{ scene('d5_big',1,{st,txt:'EAT, EAT!',c:CREAM,sc:2}); setMessage('Nobody leaves this table hungry. Nobody.'); }],
    [6500,'end',()=>res(E2)+'There are leftovers for the tray. There are always leftovers.']]); };

// ---------- To the Moon and Back (B6) ----------
// The night sky (back layer): dark blue, twinkling stars, and a big golden full moon with a sleepy smile.
SC.d5_night=(s,u)=>{ const k=ez(u/.1)*(u>.9?(1-u)/.1:1),P=s.plan;
  gfx.globalAlpha=k*.94; R(0,0,576,324,NIGHT); gfx.globalAlpha=k*.5; R(0,0,576,150,NIGHT2);
  for(let j=0;j<46;j++) { const x=(j*97)%576,y=BAR+((j*53)%170),tw=.4+.6*Math.abs(Math.sin(s.t*2+j)); gfx.globalAlpha=k*tw; if(j%7===0) star(x,y,3.5,'#fff8d0',0); else R(x,y,2,2,'#ffffff'); }
  const M=P.moon; gfx.globalAlpha=k*.25; E(M.x,M.y,M.r*2,M.r*2,MOON); gfx.globalAlpha=k*.4; E(M.x,M.y,M.r*1.45,M.r*1.45,MOON);
  gfx.globalAlpha=k; EO(M.x,M.y,M.r,M.r,MOON); E(M.x-10,M.y-12,7,6,MOON2); E(M.x+12,M.y+10,5,4,MOON2); E(M.x+14,M.y-8,3,3,MOON2);
  gfx.strokeStyle=OUT; gfx.lineWidth=2; for(const sd of [-1,1]) { gfx.beginPath(); gfx.arc(M.x+sd*10,M.y-2,4,Math.PI*.15,Math.PI*.85); gfx.stroke(); }
  gfx.beginPath(); gfx.arc(M.x,M.y+6,8,Math.PI*.2,Math.PI*.8); gfx.stroke(); E(M.x-17,M.y+6,4,2.5,'#ffb0a0'); E(M.x+17,M.y+6,4,2.5,'#ffb0a0'); gfx.globalAlpha=1; };
// Hearts over the group hug.
SC.d5_hugs=(s,u)=>{ for(let k=0;k<8;k++) { const q=((s.t*.9)+k/8)%1; gfx.globalAlpha=(1-q)*fade(u,.8); heartO(s.x-40+((k*29)%80)+Math.sin(q*6+k)*5,s.y-q*60,5+(k%3)*2,k%2?ROSE:PINK); } gfx.globalAlpha=1; };
// The golden heart: from Deedee's heart up to the moon, once round it, and back down onto the enemies. A stardust tail.
const heartAt=(P,ms)=>{ const M=P.moon,lr=M.r+22;
  if(ms<P.h1) { const q=ez((ms-P.h0)/(P.h1-P.h0)),a0=-Math.PI*.15,ex=M.x+Math.cos(a0)*lr,ey=M.y+Math.sin(a0)*lr; return {x:lerp(P.hx,ex,q)+Math.sin(q*Math.PI)*30,y:lerp(P.hy,ey,q)-Math.sin(q*Math.PI)*40,sc:lerp(.6,1,q)}; }
  if(ms<P.h2) { const q=(ms-P.h1)/(P.h2-P.h1),a=-Math.PI*.15-q*Math.PI*2; return {x:M.x+Math.cos(a)*lr,y:M.y+Math.sin(a)*lr*.9,sc:1}; }
  const q=ez((ms-P.h2)/(P.h3-P.h2)),a0=-Math.PI*.15,sx=M.x+Math.cos(a0)*lr,sy=M.y+Math.sin(a0)*lr*.9; return {x:lerp(sx,P.gx,q)-Math.sin(q*Math.PI)*20,y:lerp(sy,P.gy,q),sc:lerp(1,1.6,q)}; };
SC.d5_heart=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0; if(ms<P.h0||ms>P.h3) return;
  for(let k=14;k>=1;k--) { const t=ms-k*45; if(t<P.h0) continue; const p=heartAt(P,t); gfx.globalAlpha=(1-k/15)*.8; star(p.x+Math.sin(k*2.3)*4,p.y+Math.cos(k*1.7)*4,2+(15-k)*.25,k%2?GOLD:'#ffffff',k); }
  gfx.globalAlpha=1; const p=heartAt(P,ms),r=11*p.sc+Math.sin(ms/90)*1.2; gfx.globalAlpha=.35; E(p.x,p.y,r*2.2,r*2.2,GOLD); gfx.globalAlpha=1; heartO(p.x,p.y,r,GOLD2); E(p.x-r*.4,p.y-r*.35,r*.25,r*.2,'#fff6c0'); };
// The moonbeam: a wide shimmering cone from the moon over the enemies, with starlight falling through it.
SC.d5_beam=(s,u)=>{ const P=s.plan,M=P.moon,k=fin(u,.1)*fade(u,.7),sh=.25+Math.sin(s.t*12)*.06;
  gfx.globalAlpha=k*sh; PO([[M.x-12,M.y+M.r*.6],[M.x+12,M.y+M.r*.6],[P.bx1,P.by],[P.bx0,P.by]],'#fff0a0',0);
  gfx.globalAlpha=k*sh*.8; PO([[M.x-5,M.y+M.r*.7],[M.x+5,M.y+M.r*.7],[lerp(P.bx0,P.bx1,.7),P.by],[lerp(P.bx0,P.bx1,.3),P.by]],'#ffffff',0);
  for(let j=0;j<28;j++) { const q=((s.t*1.1)+j/28)%1,x=lerp(P.bx0+10,P.bx1-10,((j*37)%28)/27),y=lerp(P.top,P.by,q); gfx.globalAlpha=k*(1-q*.6); star(x+Math.sin(q*8+j)*4,y,3+(j%3),j%3?GOLD:'#ffffff',q*6+j); }
  gfx.globalAlpha=1; };
// Starlight falling on the family when it reaches them.
SC.d5_dust=(s,u)=>{ for(const q of s.to) for(let j=0;j<7;j++) { const v=((u*1.6)+j/7)%1; gfx.globalAlpha=fade(u,.6)*(1-v); star(q.x-q.w*.4+((j*23)%(q.w*.8)),q.top-30+v*(q.h+20),3+(j%2),j%2?GOLD:'#ffffff',v*6+j); } gfx.globalAlpha=1; };
// Starlight quilts round everyone's shoulders: patchwork squares, a back panel behind the body and two front flaps.
const SHF={tom:.5,grace:.52,rose:.5,amy:.6,deedee:.58,boppy:.6,tnb:.6,nara:.55};
const quiltBox=(q,id,g)=>{ const sp=BATTLE_SPRITES[id],rows=sp?sp.idle:[],k=rows.findIndex(r=>/[^.]/.test(r)),vis=q.h-Math.max(0,k)*(sp?sp.scale:2);
  const sh=q.base-vis*(SHF[id]||.6),bot=q.base-vis*.2; return {x:q.x+vis*.02,sh,bot:lerp(sh,bot,g),sw:vis*.46,bw:vis*.66}; };
const PATCH=['#ffb0c8','#ffe08a','#9fd8ff','#c3b0ff','#9be39a','#fff6e0'];
// One patchwork quilt wrapped round the shoulders: 3 by 3 patches, stitched, with a scalloped hem. It unrolls downward.
SC.d5_quilt=(s,u)=>{ const g=ez(u/.16); s.list.forEach(([q,id],n)=>{ const b=quiltBox(q,id,g),xl=y=>lerp(b.x-b.sw/2,b.x-b.bw/2,(y-b.sh)/Math.max(1,b.bot-b.sh)),xr=y=>lerp(b.x+b.sw/2,b.x+b.bw/2,(y-b.sh)/Math.max(1,b.bot-b.sh));
  gfx.globalAlpha=fade(u,.9); PO([[xl(b.sh)-2,b.sh-2],[xr(b.sh)+2,b.sh-2],[xr(b.bot)+2,b.bot+2],[xl(b.bot)-2,b.bot+2]],OUT,0);
  let PQ=false; if(PROPART.ready&&PROPART.ready('deedee/patchwork_quilt')) { gfx.save(); gfx.beginPath(); gfx.moveTo(xl(b.sh)-2,b.sh-2); gfx.lineTo(xr(b.sh)+2,b.sh-2); gfx.lineTo(xr(b.bot)+2,b.bot+2); gfx.lineTo(xl(b.bot)-2,b.bot+2); gfx.closePath(); gfx.clip();
    PQ=PROPART.draw('deedee/patchwork_quilt',b.x,(b.sh+b.bot)/2,{w:b.bw+8,h:Math.max(4,b.bot-b.sh+6)}); gfx.restore(); }   // painted patchwork quilt, stretched into the shoulder wrap and clipped to it
  if(!PQ) for(let r=0;r<3;r++) { const y0=lerp(b.sh,b.bot,r/3),y1=lerp(b.sh,b.bot,(r+1)/3); for(let c=0;c<3;c++) {
    const p=[[lerp(xl(y0),xr(y0),c/3),y0],[lerp(xl(y0),xr(y0),(c+1)/3),y0],[lerp(xl(y1),xr(y1),(c+1)/3),y1],[lerp(xl(y1),xr(y1),c/3),y1]]; PO(p,PATCH[(n*2+r*3+c)%6],0);
    if((r+c+n)%3===0) heart((p[0][0]+p[2][0])/2,(y0+y1)/2-1,2.4,'#ff6b9a'); } }
  gfx.globalAlpha=fade(u,.9)*(PQ?0:.9); gfx.setLineDash([2,2]); gfx.strokeStyle='#ffffff'; gfx.lineWidth=1;
  for(let r=1;r<3;r++) { const y=lerp(b.sh,b.bot,r/3); gfx.beginPath(); gfx.moveTo(xl(y)+1,y); gfx.lineTo(xr(y)-1,y); gfx.stroke(); }
  for(let c=1;c<3;c++) { gfx.beginPath(); gfx.moveTo(lerp(xl(b.sh),xr(b.sh),c/3),b.sh+1); gfx.lineTo(lerp(xl(b.bot),xr(b.bot),c/3),b.bot-1); gfx.stroke(); } gfx.setLineDash([]);
  gfx.globalAlpha=fade(u,.9); for(let x=xl(b.bot);x<xr(b.bot)-2;x+=6) { E(x+3,b.bot+1,3.6,2.6,OUT); E(x+3,b.bot,2.8,1.8,PATCH[(n+Math.round(x))%6]); }
  gfx.globalAlpha=fade(u,.9)*(.5+.5*Math.sin(s.t*6+n)); star(xr(b.sh)-2,b.sh+3,3.5,'#ffffff',s.t*2); gfx.globalAlpha=1; }); };
// Big soft hearts over every monster that went Smitten.
SC.d5_smit=inBox((s,u)=>{ s.list.forEach((F,k)=>{ const q=ez((u-k*.06)/.2); if(q<=0) return; const bob=Math.sin(s.t*5+k)*3; gfx.globalAlpha=fade(u,.8); heartO(F.x+F.w*.2,F.top-12+bob,8*q,PINK); heartO(F.x-F.w*.15,F.top-4-bob,5*q,ROSE); }); gfx.globalAlpha=1; });
// The kiss: a lipstick kiss mark and a heart from her hand to the enemies.
SC.d5_lips=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.6); const p=u<.2?ez(u/.2)*1.3:1; gfx.save(); gfx.translate(h.x-6,h.y-8); gfx.scale(p,p);
  E(0,-3,8,4,OUT); E(0,3,8,4,OUT); E(-3,-3,5,3,'#d8203a'); E(3,-3,5,3,'#d8203a'); E(0,3,7,3,'#d8203a'); gfx.restore(); gfx.globalAlpha=1; };
D.moon_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m),others=party.filter(p=>p!==m);
  const moon={x:Math.round(Math.max(170,Math.min(320,(Gp.x+me.x)/2))),y:BAR+52,r:32};
  const chest={x:me.x-6,y:me.base-DH()*.42};
  const P={t0:0,moon,h0:1600,h1:2400,h2:3150,h3:3700,hx:chest.x,hy:chest.y,gx:Gp.x,gy:Math.round((Gp.top+Gp.base)/2),bx0:Math.max(0,Gp.x0-26),bx1:Math.min(576,Gp.x1+26),by:Gp.base+10,top:moon.y+moon.r};
  const hugX=me.x-12,hugY=me.base;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle'},{t:800,f:'spread'},{t:1500,f:'clap'},{t:1600,f:DD_XF('launch','celeb2')},{t:2400,f:'spread'},{t:3550,f:'aim'},{t:4300,f:'celeb',hop:8},{t:4900,f:'throw'},{t:5600,f:'idle'},{t:6400,f:'idle'}]);
  for(const p of others) { const U=ST.unit(p),dx=(hugX-U.x)*.55,dy=(hugY-U.base)*.55,k=p.idx; jog(p,6400,(ms,tt)=>{
    if(ms<800) return {};
    if(ms<1400) { const q=ez((ms-800)/600); return {frame:dx>0?'runR':'run',dx:dx*q,dy:dy*q}; }
    if(ms<5800) return {dx:dx+Math.sin(tt*2+k)*1.5,dy,rot:Math.sin(tt*2+k)*.04};
    const q=ez((ms-5800)/600); return {frame:q<1?(dx>0?'run':'runR'):null,dx:dx*(1-q),dy:dy*(1-q)}; }); }
  const off=new Map(others.map(p=>{ const U=ST.unit(p); return [p,{dx:(hugX-U.x)*.55,dy:(hugY-U.base)*.55}]; }));
  const hugUnit=p=>{ const U=ST.unit(p),o=off.get(p); return o?Object.assign({},U,{x:U.x+o.dx,base:U.base+o.dy,top:U.top+o.dy,mid:U.mid+o.dy}):U; };
  const downBefore=B2.party.filter(p=>p.hp<=0);
  ST.play(E2,[
    [0,()=>{ scene('d5_bars',6.6,{}); scene('d5_night',6.2,{plan:P,back:true}); (sfx.harp||sfx.heal)(); say(m.id,'moon_ult');
      setMessage('The sky goes dark and full of stars. A big full moon comes up.'); }],
    [800,()=>{ scene('d5_hugs',2.6,{x:hugX-20,y:me.top}); scene('d5_big',1,{st,txt:'GROUP HUG!',c:ROSE,sc:3}); sfx.heal(); setMessage('Deedee opens her arms. Everybody in. Group hug.'); }],
    [P.h0,()=>{ scene('d5_heart',(P.h3-P.h0)/1000+.05,{plan:P,t0:P.h0}); sfx.ting(); sfx.whoosh(); setMessage('A golden heart flies out of the hug, straight up at the moon.'); }],
    [P.h1,()=>{ scene('d5_big',1.1,{x:moon.x+80,y:moon.y+10,txt:'TO THE MOON...',c:GOLD,sc:2}); sfx.harp&&sfx.harp(); }],
    [P.h2,()=>{ sfx.whoosh(); setMessage('All the way round the moon...'); }],
    ['hf',P.h3],
    [P.h3,()=>{ sfx.thud(); sfx.ding(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('d5_flash',.35,{a:.5,c:'#fff0a0'});
      scene('d5_beam',1.6,{plan:P}); scene('d5_burst',.9,{x:Gp.x,y:Math.round((Gp.top+Gp.base)/2),r:70,n:14,sz:9});
      scene('d5_big',1.4,{x:Gp.x,y:Gp.top-74,txt:'...AND BACK!',c:GOLD,sc:4}); setMessage('...and back. Starlight pours down on every one of them.'); }],
    [4300,()=>{ E2.apply(); sfx.levelUp(); for(const p of downBefore) if(p.hp>0) b2AddStatus(p,'tucked',3,{by:m});
      const live=b2LiveParty(),FL=live.map(p=>[hugUnit(p),p.id]); scene('d5_dust',1.2,{to:FL.map(x=>x[0])}); scene('d5_quilt',1.5,{list:FL});
      const sm=list.filter(f=>f.st&&f.st.smitten).map(f=>ST.foe(f)); if(sm.length) scene('d5_smit',1.9,{list:sm});
      setMessage(downBefore.some(p=>p.hp>0)?'The starlight reaches the family. Everybody is back up, tucked in under starry quilts.':'The starlight reaches the family and tucks everyone in under starry quilts.'); }],
    [4900,()=>{ scene('d5_lips',.8,{}); ST.fly((x,y,uu)=>{ gfx.globalAlpha=1-uu*.3; heartO(x,y,7,PINK); gfx.globalAlpha=1; },hand().x,hand().y,Gp.x+20,Gp.top,.7,40);
      scene('d5_big',1,{st,txt:'MWAH!',c:ROSE,sc:3}); (sfx.kiss||sfx.ting)(); setMessage('She blows the monsters a kiss. They melt a little.'); }],
    [6600,'end',()=>res(E2)+'She loves this family to the moon and back. Even the monsters feel it.']]); };
})();

// ================= Deedee verdict builds (2026-10-27, claude/deedee-moves-feedback.md) =================
// Dish-Towel Flick: a whiplash flick (wind-up, fast snap with a crack, motion streak, small shockwave) with a detailed checked towel.
// MOON & BACK: soft moonbeams from the moon onto each family member, drifting motes and sparkles, shimmer on each Tucked In member.
// Registered Nut, Reporting: the stethoscope hangs round her neck (eyes clear) and the chest piece goes on the patient's chest.
// Oven Mitt Ultimatum: clearly quilted oven mitts on her hands, with scorch and steam. Brisk Walk (renamed in the data files, key
// brisk_means_brisk): clear hand weights gripped in both hands in every frame. Garden Shower: a real water spray. Beanie Master:
// a new opening line (LINES.deedee.beanie_master_open, silent until baked). Rise and Shine: voice direction only (baker note).
// Same numbers, keys, hits and effects. Scenes prefix df_.
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
const heartP=(x,y,r)=>{ gfx.beginPath(); for(let k=0;k<=36;k++) { const a=k/36*Math.PI*2,hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a)); const px=x+hx*r/16,py=y+hy*r/16; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); };
const twk=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y-r); gfx.lineTo(x+r*.22,y-r*.22); gfx.lineTo(x+r,y); gfx.lineTo(x+r*.22,y+r*.22); gfx.lineTo(x,y+r); gfx.lineTo(x-r*.22,y+r*.22); gfx.lineTo(x-r,y); gfx.lineTo(x-r*.22,y-r*.22); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const D=RECRUIT_MOVES.deedee;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',SILVER='#cfd6de',WATER='#5aa8e8',WATER2='#a8dcff';
ST.nw('df_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const hands=()=>{ const st=ST.cur; if(st&&st.fx&&st.fx.path&&st.sp&&st.x!=null) { const fr=st.frame,sp=st.sp,h=sp.handAt&&sp.handAt.get(fr),sc=sp.scale*(st.sc||1),w=fr[0].length*sc,H=fr.length*sc;
    if(h) return {n:{x:st.x-w/2+h.n[0]*sc,y:st.y-H+h.n[1]*sc},f:{x:st.x-w/2+h.f[0]*sc,y:st.y-H+h.f[1]*sc}}; }
  const a=hand(); return {n:a,f:{x:a.x+22,y:a.y}}; };
const DSP=()=>BATTLE_SPRITES.deedee,DH=()=>DSP().idle.length*DSP().scale;
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'walkR':'walk';
const brisk=(u,tt)=>Math.sin(tt*14)>0?'run':'walk';
const liveFoes=()=>(B2.foes||[]).filter(f=>!f.dead&&f.hp>0);

// ---------- Dish-Towel Flick: a whiplash flick with a properly detailed dish towel ----------
const TWL='#fbf6e6',TWB='#5f93d6',TWB2='#a9c5ea',TWH='#cdbf94';
// spine(s) -> point; a checked towel ribbon with stripes, a stitched hem, fringe at the tip and a hanging loop at the base
const drawTowel=(x,y,th,L,w,bend,alpha=1)=>{ const N=20,sp=[],dx=Math.cos(th),dy=Math.sin(th),px=-dy,py=dx;
  for(let i=0;i<=N;i++) { const s=i/N,b=bend(s); sp.push([x+dx*L*s+px*b,y+dy*L*s+py*b]); }
  const nm=sp.map((p,i)=>{ const a=sp[Math.max(0,i-1)],c=sp[Math.min(N,i+1)]; let tx=c[0]-a[0],ty=c[1]-a[1]; const l=Math.hypot(tx,ty)||1; tx/=l; ty/=l; return [-ty,tx]; });
  const hw=i=>w*(.85+.15*i/N);
  const edge=(k)=>sp.map((p,i)=>[p[0]+nm[i][0]*hw(i)*k,p[1]+nm[i][1]*hw(i)*k]);
  const top=edge(1),bot=edge(-1); gfx.save(); const a0=gfx.globalAlpha*alpha; gfx.globalAlpha=a0; gfx.lineJoin='round';
  gfx.beginPath(); top.forEach((p,i)=>i?gfx.lineTo(p[0],p[1]):gfx.moveTo(p[0],p[1])); for(let i=N;i>=0;i--) gfx.lineTo(bot[i][0],bot[i][1]); gfx.closePath();
  gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=TWL; gfx.fill();
  // red and blue checks: cross bands every third step and two long stripes
  for(let i=0;i<N;i++) { const band=i%3===0,thin=i%3===1; if(!band&&!thin) continue; gfx.beginPath(); gfx.moveTo(top[i][0],top[i][1]); gfx.lineTo(top[i+1][0],top[i+1][1]); gfx.lineTo(bot[i+1][0],bot[i+1][1]); gfx.lineTo(bot[i][0],bot[i][1]); gfx.closePath(); gfx.fillStyle=band?TWB:TWB2; gfx.globalAlpha=a0*(band?.9:.7); gfx.fill(); gfx.globalAlpha=a0; }
  gfx.globalAlpha=a0; for(const k of [.5,-.5]) { const e=edge(k); gfx.beginPath(); e.forEach((p,i)=>i?gfx.lineTo(p[0],p[1]):gfx.moveTo(p[0],p[1])); gfx.strokeStyle='#d8584a'; gfx.lineWidth=2; gfx.stroke(); }
  // stitched hem near both long edges
  gfx.setLineDash([3,3]); for(const k of [.86,-.86]) { const e=edge(k); gfx.beginPath(); e.forEach((p,i)=>i?gfx.lineTo(p[0],p[1]):gfx.moveTo(p[0],p[1])); gfx.strokeStyle=TWH; gfx.lineWidth=1.3; gfx.stroke(); } gfx.setLineDash([]);
  // fringe at the tip
  const tp=sp[N],tn=nm[N],tt=[tn[1],-tn[0]]; for(let j=-3;j<=3;j++) { const bx=tp[0]+tn[0]*hw(N)*j/3.2,by=tp[1]+tn[1]*hw(N)*j/3.2; Ln(bx,by,bx+tt[0]*8+tn[0]*j*.4,by+tt[1]*8+tn[1]*j*.4,2.2,'#e8dcb4'); }
  // hanging loop at the base corner
  const b0=sp[0],bn=nm[0]; ring(b0[0]+bn[0]*hw(0)-dx*4,b0[1]+bn[1]*hw(0)-dy*4,5,6,4.5,OUT); ring(b0[0]+bn[0]*hw(0)-dx*4,b0[1]+bn[1]*hw(0)-dy*4,5,6,2,'#d8584a');
  gfx.restore(); return sp[N]; };
const foldedTowel=(x,y,f)=>{ const w=lerp(58,36,f); RO(x-w/2,y-18,w,36,TWL); for(let k=0;k<4;k++) R(x-w/2+3+k*(w-6)/4,y-16,(w-6)/8,32,k%2?TWB2:TWB);
  for(const dy of [-7,0,7]) R(x-w/2+1,y+dy-1,w-2,2,'#d8584a'); gfx.setLineDash([3,3]); gfx.strokeStyle=TWH; gfx.lineWidth=1.3; gfx.strokeRect(x-w/2+3,y-14,w-6,28); gfx.setLineDash([]);
  ring(x+w/2-6,y-18,4,5,3.5,OUT); ring(x+w/2-6,y-18,4,5,1.8,'#d8584a'); for(let j=0;j<5;j++) Ln(x-w/2-1,y-12+j*6,x-w/2-6,y-12+j*6,2,'#e8dcb4'); };
SC.df_towel=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),x=h.x,y=h.y-4; gfx.globalAlpha=fade(u,.96);
  if(P.painted) { // the painted frames already carry the towel: draw only the whoosh arc, the crack burst and the word
    const S=P.snap,tip=[Math.max(s.tx,x-120),y];
    if(ms>=S-130&&ms<S) { gfx.globalAlpha=.6; for(const [r,w,c] of [[70,10,'#ffffff'],[70,4,'#bfe0ff'],[44,5,'#ffffff']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(x-40,y,r,-.9,-3.1,true); gfx.stroke(); } gfx.globalAlpha=1; }
    if(ms>=S&&ms<S+260) { const q=(ms-S)/260; gfx.globalAlpha=1-q; for(let k=0;k<10;k++) { const a=k/10*Math.PI*2; Ln(tip[0]+Math.cos(a)*(8+q*10),tip[1]+Math.sin(a)*(8+q*10),tip[0]+Math.cos(a)*(18+q*26),tip[1]+Math.sin(a)*(18+q*26),k%2?3:2,k%2?'#ffffff':GOLD); } twk(tip[0],tip[1],20*(1-q)+8,'#ffffff'); gfx.globalAlpha=1; if(q<.8) bigWord('CRACK!',tip[0]+6,tip[1]-46,GOLD,3); }
    return; }
  if(ms>P.fold) { const f=ez((ms-P.fold)/350); foldedTowel(x-10,y+2,f); if(f>.9) bigWord('SQUARE',x-10,y-40,CREAM,2); return; }
  const S=P.snap,reach=Math.max(90,x-s.tx+14); let th,L,lag,wv=0,ghost=0;
  if(ms<P.wind-420) { th=1.78+Math.sin(ms/260)*.08; L=64; lag=-4; }
  else if(ms<P.wind) { const q=ez((ms-(P.wind-420))/420); th=lerp(1.78,-.62,q); L=lerp(64,76,q); lag=lerp(-4,16,Math.sin(q*Math.PI)); }
  else if(ms<S-130) { th=-.62+Math.sin(ms/38)*.05; L=78+Math.sin(ms/30)*2; lag=2; }
  else if(ms<S) { const q=(ms-(S-130))/130,e=q*q*(3-2*q*.55); th=lerp(-.62,-3.1,e); L=lerp(78,reach,e); lag=(1-e)*46; ghost=1; }
  else { const q=cl((ms-S)/320),r=ez(cl((ms-S-120)/300)); th=lerp(-3.1,-2.5,r); L=lerp(reach,64,r); lag=0; wv=(1-q)*20; }
  const bend=sc=>lag*sc*sc+wv*Math.sin(sc*9-(ms-S)/20)*sc;
  if(ghost) { // motion streak: a fan of ghost towels and a swoosh arc behind the snap
    const q=(ms-(S-130))/130; for(let g=4;g>=1;g--) { const e2=Math.max(0,q-g*.1),th2=lerp(-.62,-3.1,e2*e2*(3-2*e2*.55)),L2=lerp(78,reach,e2); drawTowel(x,y,th2,L2,12,s2=>lag*.4*s2*s2,.1+.07*(5-g)); }
    gfx.globalAlpha=.6; for(const [r,w,c] of [[L*.92,10,'#ffffff'],[L*.92,4,'#bfe0ff'],[L*.6,5,'#ffffff']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(x,y,r,-.62-.2,th+.08,true); gfx.stroke(); } gfx.globalAlpha=1; }
  const tip=drawTowel(x,y,th,L,13,bend);
  if(ms>=S&&ms<S+260) { const q=(ms-S)/260; gfx.globalAlpha=1-q; for(let k=0;k<10;k++) { const a=k/10*Math.PI*2; Ln(tip[0]+Math.cos(a)*(8+q*10),tip[1]+Math.sin(a)*(8+q*10),tip[0]+Math.cos(a)*(18+q*26),tip[1]+Math.sin(a)*(18+q*26),k%2?3:2,k%2?'#ffffff':GOLD); } twk(tip[0],tip[1],20*(1-q)+8,'#ffffff'); gfx.globalAlpha=1; if(q<.8) bigWord('CRACK!',tip[0]+6,tip[1]-46,GOLD,3); }
  };
SC.df_shock=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.5-k*.12); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.9; ring(s.x,s.y,6+q*(s.r||44),4+q*(s.r||44)*.8,(5-q*4)+k*.4,k%2?'#ffffff':'#bfe0ff'); }
  gfx.globalAlpha=(1-u)*.9; for(let k=0;k<8;k++) { const a=k/8*Math.PI*2+.2,d=10+ez(u)*32; Ln(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,s.x+Math.cos(a)*(d+12),s.y+Math.sin(a)*(d+12),3,'#ffffff'); } gfx.globalAlpha=1; };
D.dish_towel_flick=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,40),me=ST.unit(m),PT=!!(BATTLE_SPRITES.deedee&&BATTLE_SPRITES.deedee.x_fsnap);
  if(PT) ST.keys(fx,[{t:0,x:'home',y:'home',f:(u,tt)=>Math.sin(tt*10)>0?'x_fwalk':'x_fspot',hop:3,hn:8},{t:1000,x:p.x,y:p.y,f:'x_fspot'},{t:1250,f:'x_ftaut'},{t:1420,f:'x_fshake'},{t:1520,f:'x_fwind1'},{t:1740,f:'x_fwind2',dx:u=>-ez(u)*3},{t:1850,f:'x_fsnap',dx:-10},{t:2000,f:'x_ffollow'},{t:2150,f:'x_frecoil'},{t:2450,f:'x_ffold'},{t:2800,f:'x_ftuck'},{t:3150,f:'x_fdone'},{t:3500,f:back(p.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}]);
  else ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:8},{t:1000,x:p.x,y:p.y,f:'aim',dx:u=>-ez(u)*6},{t:1500,f:'wind'},{t:1750,f:'wind',dx:u=>-ez(u)*3},{t:1850,f:'throw',dx:-10},{t:2150,f:'clap'},{t:2600,f:'hip'},{t:2950,f:back(p.x,me),hop:3,hn:6},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee power-walks over. She\'s seen a spot. Nobody else has seen a spot.'); say(m.id,'dish_towel_flick'); scene('dd_spot',2.0,{x:F.x+8,y:F.mid-8,seen:1000,gone:1850}); scene('df_towel',3.0,{tx:F.x+8,plan:{wind:1500,snap:1850,fold:2150,painted:PT}}); }],
    [1150,()=>{ setMessage('She snaps her dish towel out and cocks her arm back.'); sfx.whoosh(); }],
    [1500,()=>{ sfx.charge&&sfx.charge(); setMessage('The towel goes taut. Oh no. She\'s lined it up.'); }],
    [1730,()=>{ sfx.whoosh(); }],
    ['hf',1850],
    [1850,()=>{ sfx.slash&&sfx.slash(); sfx.bonk(); sfx.bang?sfx.bang():sfx.thud(); ST.jolt(f,.6); landHit(100); scene('df_shock',.55,{x:F.x+8,y:F.mid-8,r:46}); scene('dv_flash',.12,{a:.3,c:'#ffffff'}); scene('dv_big',1.1,{x:F.x,y:F.top-74,txt:'FLICK!',c:CREAM,sc:4}); }],
    [2150,()=>{ sfx.select(); setMessage('She folds the towel into a precise square.'); }],
    [4000,'end',res(E2)+'The spot has been dealt with.']]); };

// ---------- MOON & BACK: soft moonbeams onto each member, drifting motes, sparkles, a shimmer as they are tucked in ----------
const MX=110,MY=60;
const beamPoly=(x0,y0,x1,y1,w0,w1,c0,c1,a)=>{ const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,px=-dy/l,py=dx/l; const g=gfx.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,c0); g.addColorStop(1,c1);
  gfx.beginPath(); gfx.moveTo(x0+px*w0,y0+py*w0); gfx.lineTo(x1+px*w1,y1+py*w1); gfx.lineTo(x1-px*w1,y1-py*w1); gfx.lineTo(x0-px*w0,y0-py*w0); gfx.closePath(); gfx.globalAlpha=a; gfx.fillStyle=g; gfx.fill(); };
SC.df_moon=(s,u)=>{ const ms=s.t*1000,P=s.plan,t=s.t,out=fade(u,.94); gfx.globalAlpha=out;
  const hg=gfx.createRadialGradient(MX,MY,6,MX,MY,62); hg.addColorStop(0,'rgba(220,235,255,.55)'); hg.addColorStop(1,'rgba(220,235,255,0)'); gfx.globalAlpha=out*(.7+.15*Math.sin(t*3)); gfx.fillStyle=hg; gfx.beginPath(); gfx.arc(MX,MY,62,0,Math.PI*2); gfx.fill(); gfx.globalAlpha=out;
  EO(MX,MY,16,16,'#fff1d0'); E(MX+6,MY-2,12,12,'#1b1a2e'); E(MX-6,MY+5,2.5,2.5,'#e6d8b0'); E(MX-2,MY-7,2,2,'#e6d8b0');
  const x0=P.x0??hand().x,y0=P.y0??hand().y,go=ez((ms-P.go)/(P.top-P.go));
  if(ms>P.go-300&&ms<P.heart+400) PROPART.draw('deedee/measuring_tape',x0,y0+2,{h:26,rot:-.2});   // painted tape measure in her hand, where the line pays out
  if(ms>P.go&&ms<P.heart+400) { const ex=lerp(x0,MX+18,go),ey=lerp(y0,MY+8,go); gfx.globalAlpha=out*.9; Ln(x0,y0,ex,ey,5,'rgba(60,70,110,.7)'); Ln(x0,y0,ex,ey,3,'#dfeaff');
    const n=Math.floor(go*9); for(let k=1;k<=n;k++) { const q=k/9,lx=lerp(x0,MX+18,q),ly=lerp(y0,MY+8,q); Ln(lx-3,ly+4,lx+3,ly-4,2,'#ffffff'); if(k%3===0) label(''+(k*100000),lx,ly-16,CREAM,1); twk(lx+Math.sin(t*6+k)*4,ly-8,3+Math.sin(t*9+k),'#ffffff'); } }
  if(ms>P.top&&ms<P.top+900) { gfx.globalAlpha=out; label('TO THE MOON',MX+70,MY-6,GOLD,1); }
  // the moonbeams: wide soft shafts from the moon onto each member
  P.mem.forEach((q,i)=>{ const b=ez((ms-(P.top+i*140))/520); if(b<=0) return; const sh=.82+.18*Math.sin(t*4+i*1.7);
    const sx=MX+16,sy=MY+10,tx=q.x-4,ty=q.top+14+i*3,ex=lerp(sx,tx,b),ey=lerp(sy,ty,b),w1=Math.max(11,q.w*.42)*(.4+.6*b);
    beamPoly(sx,sy,ex,ey,5,w1,'rgba(235,244,255,.95)','rgba(170,200,255,.5)',out*.30*sh);
    beamPoly(sx,sy,ex,ey,3,w1*.62,'rgba(255,255,255,.95)','rgba(200,225,255,.6)',out*.26*sh);
    beamPoly(sx,sy,ex,ey,1.5,w1*.28,'rgba(255,255,255,1)','rgba(230,242,255,.8)',out*.30*sh);
    // drifting motes and sparkles along the shaft
    for(let k=0;k<16;k++) { const v=((t*.22+k/16+i*.17)%1)*b,cx=lerp(sx,tx,v)+Math.sin(k*5.3+t*1.3)*lerp(3,w1,v)*.8,cy=lerp(sy,ty,v)+Math.cos(k*3.1+t)*3; const tw=.5+.5*Math.sin(t*7+k*2.1); gfx.globalAlpha=out*(.35+.55*tw)*sh; E(cx,cy,1.2+tw*1.3,1.2+tw*1.3,k%3?'#ffffff':'#bfe0ff'); }
    for(let k=0;k<4;k++) { const v=((k*.27+i*.11+Math.floor(t*1.6+k)*.19)%1)*b,cx=lerp(sx,tx,v)+Math.sin(k*9.7+Math.floor(t*1.6+k))*w1*.5*v,cy=lerp(sy,ty,v); const ph=(t*1.6+k)%1; gfx.globalAlpha=out*Math.sin(ph*Math.PI)*.95; twk(cx,cy,4+ph*5,'#ffffff'); }
    if(b>.85) { const gl=ez((b-.85)/.15); gfx.globalAlpha=out*gl*(.24+.08*Math.sin(t*5+i)); const g2=gfx.createRadialGradient(q.x,q.mid,4,q.x,q.mid,q.w*.9+14); g2.addColorStop(0,'rgba(220,235,255,.9)'); g2.addColorStop(1,'rgba(220,235,255,0)'); gfx.fillStyle=g2; gfx.beginPath(); gfx.arc(q.x,q.mid,q.w*.9+14,0,Math.PI*2); gfx.fill(); } });
  // the heart: the line comes all the way back
  if(ms>P.heart) { gfx.globalAlpha=out; const r=lerp(0,P.r,ez((ms-P.heart)/350)); for(const [w,c] of [[7,OUT],[4,ROSE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; heartP(P.cx,P.cy,r); gfx.stroke(); } if(ms>P.heart+300) label('...AND BACK',P.cx,P.cy-P.r-20,GOLD,2); }
  gfx.globalAlpha=1; };
SC.df_tuck=(s,u)=>{ const t=s.t,q=s; gfx.globalAlpha=fade(u,.7)*fin(u,.1); const g=gfx.createRadialGradient(q.x,q.y,4,q.x,q.y,q.w*.8+18); g.addColorStop(0,'rgba(215,232,255,.75)'); g.addColorStop(.6,'rgba(190,215,255,.3)'); g.addColorStop(1,'rgba(190,215,255,0)');
  gfx.globalAlpha*=.55+.2*Math.sin(t*9); gfx.fillStyle=g; gfx.beginPath(); gfx.ellipse(q.x,q.y,q.w*.8+18,q.h*.6+14,0,0,Math.PI*2); gfx.fill(); gfx.globalAlpha=fade(u,.75);
  for(let k=0;k<7;k++) { const a=t*2.4+k*.9,ph=(t*1.1+k/7)%1; twk(q.x+Math.cos(a)*(q.w*.42+6),q.y+q.h*.3-ph*q.h*.9,3+2*Math.sin(ph*Math.PI),k%2?'#ffffff':'#c8e0ff'); } gfx.globalAlpha=1; };
D.hugShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),others=party.filter(p=>p!==m),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const cx=Math.round(U.reduce((a,q)=>a+q.x,0)/U.length),cy=Math.round(U.reduce((a,q)=>a+q.mid,0)/U.length),px=cx-20,py=Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+18);
  const K=[{t:0,x:'home',y:'home',f:px<me.x?'walk':'walkR',hop:3,hn:5},{t:700,x:px,y:py,f:DD_XF('hug','spread')},{t:900,f:'celeb'},{t:1700,f:DD_XF('hug','spread')}];
  let t=1800; const visits=[];
  for(const o of others) { const q=ST.unit(o),x=Math.min(560,q.x+q.w*.5+18),y=Math.min(316,q.base+3); K.push({t,f:'run'}); t+=380; K.push({t,x,y,f:'spread',dx:(u,tt)=>Math.sin(tt*20)*1.5}); visits.push([t,o]); t+=260; }
  const heartAt=t; K.push({t,f:'celeb',hop:10},{t:t+400,f:'walk'},{t:t+1000,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const plan={go:900,top:1600,heart:heartAt-500,cx,cy,r:Math.max(70,(Math.max(...U.map(q=>q.x))-Math.min(...U.map(q=>q.x)))*.7+30),x0:px-20,y0:py-DH()*.8,mem:U.map(q=>({x:q.x,w:q.w,mid:q.mid,base:q.base,top:q.top}))};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks into the middle of everyone and opens her arms.'); say(m.id,'moon_back'); scene('df_moon',(heartAt+1200)/1000,{plan}); }],
    [900,()=>{ sfx.charge(); setMessage('A measuring line heads for the moon. And keeps going.'); }],
    [1700,()=>{ setMessage('Then it comes all the way back. Moonbeams, one each.'); if(sfx.chime) sfx.chime(); }],
    ...visits.map(([ms,o])=>[ms,()=>{ const q=ST.unit(o); scene('dd_heart',.9,{x:q.x,y:q.top-4}); battle.fx[o.idx].hop=.3; sfx.kiss?sfx.kiss():sfx.select(); }]),
    ['hf',heartAt],
    [heartAt,()=>{ E2.apply(); for(const p of party) { const q=ST.unit(p); scene('dd_glow',.9,{x:q.x,y:q.mid,c:ROSE}); scene('df_tuck',1.6,{x:q.x,y:q.mid,w:q.w,h:q.h}); } sfx.fountain?sfx.fountain():sfx.heal(); sfx.heal(); }],
    [heartAt+1100,'end','There\'s no shortened version of this love. Everyone is Tucked In.']]); };
D.moon_back=E2=>D.hugShow(E2);

// ---------- Registered Nut, Reporting: stethoscope round her neck, chest piece on the patient's chest ----------
const CHEST={tom:.47,grace:.45,rose:.43,amy:.56,boppy:.56,tnb:.58,nara:.4,deedee:.56};
SC.df_steth=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,P=s.P,k=st.sc||1; gfx.globalAlpha=fade(u,.95);
  const nx=st.x+2*k,ny=st.y-52*k,yx=nx+1*k,yy=ny+17*k,hs=hands(),go=ez((ms-P.on)/320);
  const TUBE='#2c3037',ME='#c9d0d8';
  if(P.painted) { // the painted frames carry the stethoscope; add only the glint where the chest piece touches and the heartbeat
    if(ms>P.b0-150&&ms<P.b1+150) ring(hs.n.x,hs.n.y,11+Math.sin(ms/90)*2,11+Math.sin(ms/90)*2,1.5,'#ffffff');
    if(ms>P.b0&&ms<P.b1) { const ph=((ms-P.b0)%520)/520,beat=ph<.15?ph/.15:ph<.3?1-(ph-.15)/.15*.5:.5*(1-(ph-.3)/.7),bx=P.x+(P.foe?0:-6),by=P.y-44;
      gfx.globalAlpha=fade(u,.95); gfx.save(); gfx.translate(bx,by); const r=10+beat*9; heartP(0,0,r+2.5); gfx.fillStyle=OUT; gfx.fill(); heartP(0,0,r); gfx.fillStyle='#ff4a6a'; gfx.fill(); gfx.restore(); if(ph<.5) bigWord('BA-DUMP',bx,by-40,CREAM,2); }
    return; }
  // the tubes: round the back of the neck, then down in a V over the chest to the Y junction
  if(!PROPART.draw('deedee/stethoscope',nx,ny+9*k,{h:26*k})) {   // painted stethoscope round her neck, else the drawn tubes
  for(const [w,c] of [[6.5,OUT],[3.6,TUBE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.lineJoin='round';
    gfx.beginPath(); gfx.moveTo(nx-9*k,ny-4*k); gfx.quadraticCurveTo(nx-10*k,ny+9*k,yx,yy); gfx.stroke();
    gfx.beginPath(); gfx.moveTo(nx+10*k,ny-4*k); gfx.quadraticCurveTo(nx+11*k,ny+9*k,yx,yy); gfx.stroke(); }
  Ln(nx-8*k,ny-3*k,nx-6*k,ny+6*k,1.2,'#8a929e'); EO(nx-9*k,ny-4*k,2.4,2.4,ME); EO(nx+10*k,ny-4*k,2.4,2.4,ME); }   // earpieces rest on the collar
  EO(yx,yy,2.6,2.6,ME);
  // the chest piece: out of the Y junction, into her hand, onto the patient
  const sx=P.self?yx-2*k:hs.n.x,sy=P.self?yy+8*k:hs.n.y;   // the hand that holds it
  const tx=P.x,ty=P.y,cx=lerp(sx,tx,go),cy=lerp(sy,ty,go)-Math.sin(go*Math.PI)*8,slack=ms<P.on?0:1;
  const hx=ms<P.on?yx+4*k:cx,hy=ms<P.on?yy+16*k:cy;
  for(const [w,c] of [[6.5,OUT],[3.6,TUBE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(yx,yy); gfx.quadraticCurveTo((yx+hx)/2+(P.foe?0:4),Math.max(yy,hy)+14,hx,hy); gfx.stroke(); }
  EO(hx,hy,8,8,ME); E(hx,hy,5,5,'#7e8a97'); E(hx-2,hy-2,2,2,'#ffffff'); if(ms>P.on+260) { ring(hx,hy,11,11,1.5,'#ffffff'); }
  if(ms>P.b0&&ms<P.b1) { const ph=((ms-P.b0)%520)/520,beat=ph<.15?ph/.15:ph<.3?1-(ph-.15)/.15*.5:.5*(1-(ph-.3)/.7),bx=P.x+(P.foe?0:-6),by=P.y-44;
    gfx.globalAlpha=fade(u,.95); gfx.save(); gfx.translate(bx,by); const r=10+beat*9; heartP(0,0,r+2.5); gfx.fillStyle=OUT; gfx.fill(); heartP(0,0,r); gfx.fillStyle='#ff4a6a'; gfx.fill(); gfx.restore(); if(ph<.5) bigWord('BA-DUMP',bx,by-40,CREAM,2); } };
D.registered_nut=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,22),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const PT=!!(BATTLE_SPRITES.deedee&&BATTLE_SPRITES.deedee.x_nlis1);
  const K=PT?(self?[{t:0,x:'home',y:'home',f:'x_nclip'},{t:300,f:'x_nput'},{t:500,f:'x_nout'},{t:700,f:'x_nlean'},{t:900,f:'x_nlis1'},{t:1200,f:'x_nlis2'},{t:1550,f:'x_naha'},{t:1900,f:'x_nverdict'},{t:2300,f:'x_nwrite'},{t:2650,f:'x_nclear'},{t:3000,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'x_nwalk',hop:3,hn:6},{t:800,x:sp.x,y:sp.y,f:'x_nsalute'},{t:1000,f:'x_nclip'},{t:1150,f:'x_nput'},{t:1300,f:'x_nout'},{t:1450,f:'x_nlean'},{t:1550,f:'x_nlis1'},{t:1750,f:'x_nlis2'},{t:1900,f:'x_naha'},{t:2050,f:'x_nverdict'},{t:2400,f:'x_nwrite'},{t:2800,f:'x_nclear'},{t:3250,f:back(sp.x,me),hop:3,hn:6},{t:3800,x:'home',y:'home',f:'idle'}])
    :self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:DD_XF('nurse','aim')},{t:1900,f:'clap'},{t:2300,f:'celeb',hop:8},{t:2800,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'hip'},{t:1050,f:DD_XF('nurse','aim'),dx:u=>-ez(u)*6},{t:2000,f:'clap',dx:-6},{t:2350,f:'celeb',hop:8},{t:2900,f:back(sp.x,me),hop:3,hn:6},{t:3800,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),end=self?3200:3900,hit=self?1900:2050;
  const ch=foe?.5:(CHEST[t.id]||.56);   // chest height as a share of the patient's height, so it sits at Grace's chest for her pose
  const P={on:self?400:850,self,foe,x:self?me.x-6:(foe?H.x+H.w*.12:H.x-H.w*.12),y:self?me.base-DH()*.36:H.base-H.h*ch,b0:PT?(self?900:1550):(self?700:1150),b1:hit-80,painted:PT};
  const bx=foe?H.x:H.x-H.w*.08,by=foe?H.mid:H.mid-H.h*.12;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Deedee checks herself. Registered nut, reporting.':'Deedee hurries over to '+t.name+'. Registered nut, reporting.'); say(m.id,'registered_nut'); if(!PT) scene('dd_badge',(end-200)/1000,{st,fix:self?300:900}); scene('df_steth',(hit+500)/1000,{st,P}); }],
    [P.b0,()=>{ setMessage('Off her neck comes the big stethoscope. Ba-dump. Ba-dump.'); for(let k=0;k<3;k++) sfx.heartbeat(k*.52); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.boing(); scene('dv_bandage',(end-hit)/1000,{x:self?me.x-14:bx,y:self?me.base-DH()*.5:by}); scene('dv_big',1.1,{x:self?me.x:H.x,y:(self?me.top:H.top)-40,txt:'POP!',c:CREAM,sc:4}); scene('dv_glow',.9,{x:H.x,y:H.mid,c:'#8ef0a0'}); hopOf(t!==m?t:null); setMessage('A bandage. A big one. Right where it counts.'); }],
    [end,'end',kindLine(t,'Vitals: excellent. Bandage: enormous.')]]); };

// ---------- Oven Mitt Ultimatum: clearly quilted oven mitts, scorch and steam ----------
const mitt=(x,y,sc,rot,flip,scorch,wave)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc*flip,sc);
  if(PROPART.draw('deedee/oven_mitts',0,-6,{h:56,src:flip>0?[0,0,88,160]:[60,0,89,160]})) { if(scorch>0) { gfx.globalAlpha*=scorch*.8; E(0,-22,8,6,'#4a3226'); E(-6,-15,5,4,'#3a281e'); gfx.globalAlpha/=Math.max(.01,scorch*.8); } gfx.restore(); return; }   // painted oven mitt (left or right half of the painted pair)
  const BODY='#d65a4a',BODY2='#a93a32',CUFF='#3c6cae',CF='#f4efe0';
  const body=()=>{ gfx.beginPath(); gfx.moveTo(-13,12); gfx.lineTo(-14,-12); gfx.quadraticCurveTo(-14,-30,0,-31); gfx.quadraticCurveTo(14,-30,14,-12); gfx.lineTo(13,12); gfx.closePath(); };
  gfx.lineJoin='round';
  gfx.save(); gfx.translate(-15,-6); gfx.rotate(-.55); gfx.beginPath(); gfx.ellipse(0,0,7,12,0,0,Math.PI*2); gfx.lineWidth=4.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=BODY2; gfx.fill(); gfx.setLineDash([2,2]); gfx.beginPath(); gfx.ellipse(0,0,4.6,9,0,0,Math.PI*2); gfx.strokeStyle='#f4e6c8'; gfx.lineWidth=1; gfx.stroke(); gfx.setLineDash([]); gfx.restore();
  body(); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=BODY; gfx.fill();
  gfx.save(); body(); gfx.clip(); gfx.strokeStyle=BODY2; gfx.lineWidth=1.6; for(let k=-40;k<=40;k+=8) { gfx.beginPath(); gfx.moveTo(k-30,-40); gfx.lineTo(k+30,40); gfx.stroke(); gfx.beginPath(); gfx.moveTo(k+30,-40); gfx.lineTo(k-30,40); gfx.stroke(); }
  for(let a=-3;a<=3;a++) for(let b=-5;b<=3;b++) { const px=a*8+(b%2?4:0),py=b*8; if(Math.abs(px)<13&&py>-30&&py<9) E(px,py,1.1,1.1,'#f4e6c8'); }
  gfx.restore();
  gfx.setLineDash([3,3]); gfx.beginPath(); gfx.moveTo(-10,10); gfx.lineTo(-11,-12); gfx.quadraticCurveTo(-11,-26,0,-27); gfx.quadraticCurveTo(11,-26,11,-12); gfx.lineTo(10,10); gfx.strokeStyle='#f4e6c8'; gfx.lineWidth=1.3; gfx.stroke(); gfx.setLineDash([]);
  RO(-15,8,30,12,CUFF); for(let k=0;k<5;k++) R(-12+k*6,9,3,10,CF); R(-15,8,30,2,'#2c4f86'); ring(13,20,4,5,4.2,OUT); ring(13,20,4,5,1.8,CUFF);
  if(scorch>0) { gfx.globalAlpha*=scorch; E(0,-24,8,6,'#4a3226'); E(-6,-17,5,4,'#3a281e'); E(5,-15,4,3,'#523a2c'); gfx.globalAlpha/=scorch; }
  gfx.restore(); };
SC.df_mitts=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; gfx.globalAlpha=fade(u,.96); const hs=hands(),h=hand();
  const on=ez((ms-P.on)/520),clap=ms>P.clap-80&&ms<P.clap+160?Math.sin(cl((ms-P.clap+80)/240)*Math.PI):0,hang=ez((ms-P.hang)/350),burn=ez((ms-P.clap)/600);
  const sc=.95*on,wig=ms<P.on+520?Math.sin(ms/40)*.12*(1-on):0;
  let nx=hs.n.x,ny=hs.n.y-8,fx=hs.f.x,fy=hs.f.y-8; const st=s.st; if(st&&st.x!=null&&hs.n.y<st.y-70) { nx-=10; fx+=10; ny-=10; fy-=10; }   // raised arms: keep the mitts clear of her face
  if(ms>P.clap-80&&ms<P.hang) { const cx=(nx+fx)/2; nx=lerp(nx,cx-7,clap*.4+.2); fx=lerp(fx,cx+7,clap*.4+.2); }
  const rot=ms>P.hang?0:(ms<P.clap-400?-.35:0);
  if(hang<=0) { mitt(nx,ny,sc,rot+wig,1,burn,0); mitt(fx,fy,sc,-rot-wig,-1,burn,0); }
  else { const rx=h.x-30,ry=h.y-86; gfx.globalAlpha=fade(u,.96); if(!PROPART.draw('deedee/hanging_rail',rx,ry-4,{w:96})) { Ln(rx-44,ry,rx+44,ry,4,OUT); Ln(rx-44,ry,rx+44,ry,2,WOOD); } /* painted wall rail with hooks */ for(const [sx0,sd] of [[-22,1],[22,-1]]) { const x2=lerp(sd>0?nx:fx,rx+sx0,hang),y2=lerp(sd>0?ny:fy,ry+36,hang); mitt(x2,y2,.95,hang*Math.PI*(sd>0?1:-1),sd>0?1:-1,burn,0); } }
  // steam and scorch smoke off the mitts after the clap
  if(ms>P.clap-40&&ms<P.hang+800) { for(const [px,py] of [[nx,ny-26],[fx,fy-26]]) for(let k=0;k<5;k++) { const q=((s.t*.9+k*.21)%1); gfx.globalAlpha=(1-q)*.8*fade(u,.9); E(px+Math.sin(q*6+k)*6+(k-2)*3,py-q*38,5+q*7,5+q*7,k%2?'#f6f2ea':'#d9d4ca'); } }
  if(ms>P.clap&&ms<P.clap+400) { const q=(ms-P.clap)/400; gfx.globalAlpha=1-q; for(let k=0;k<8;k++) { const a=-Math.PI/2+(k-3.5)*.4; Ln((nx+fx)/2+Math.cos(a)*10,ny-20+Math.sin(a)*10,(nx+fx)/2+Math.cos(a)*(22+q*22),ny-20+Math.sin(a)*(22+q*22),2.5,k%2?'#ffd078':'#ff9a4a'); } }
  if(ms<P.on+900) { gfx.globalAlpha=fin(u,.05); bigWord('OVEN MITTS',h.x-10,h.y-112,CREAM,2); } gfx.globalAlpha=1; };
D.oven_mitt_ultimatum=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,60),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'kneel'},{t:1000,f:'act',dx:(u,tt)=>Math.sin(tt*6)*2},{t:1700,f:'celeb'},{t:2150,f:'clap'},{t:2500,f:'hip'},{t:2900,f:'spread'},{t:3250,f:'walkR',hop:3,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  const plan={on:1000,clap:2150,hang:2900};
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks up to them and slowly puts on two enormous, very quilted oven mitts.'); say(m.id,'oven_mitt_ultimatum'); scene('df_mitts',3.4,{plan,st}); }],
    [1700,()=>{ sfx.charge(); setMessage('The oven mitts go up.'); }],
    ['hf',2150],
    [2150,()=>{ sfx.thud(); sfx.bonk(); sfx.thud(); const h=hand(); scene('dv_flash',.2,{a:.5,c:'#fff1d8'}); scene('dp_shock',.8,{x:h.x-20,y:h.y-40,r:Math.max(220,h.x-Gp.x0+40)}); scene('dd_wave',.9,{G:Gp});
      scene('dv_big',1.2,{x:(Gp.x+p.x)/2,y:Gp.top-74,txt:'CLAP!',c:'#ffb45a',sc:5}); for(const f of list) ST.jolt(f,.45); landHit(100); }],
    [2900,()=>{ sfx.select(); setMessage('She hangs the mitts up neatly. A little scorched. The enemies look chastened.'); }],
    [4200,'end',res(E2)+'Deedee has used the serious mitts.']]); };

// ---------- Brisk Walk (key brisk_means_brisk): hand weights gripped in both hands in every frame ----------
const bell=(x,y,rot,sc,fist)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  if(PROPART.draw('deedee/hand_weights',0,0,{w:36})) { EO(0,0,6.5,6.5,fist); for(const dx of [-3,0,3]) Ln(dx,-5,dx,5,1,'#c8855f'); gfx.restore(); return; }   // painted pink 3 LB weight, fist on top
  RO(-15,-2.5,30,5,'#9aa3b0');
  for(const sd of [-1,1]) { RO(sd*15-(sd>0?0:8),-10,8,20,'#ff7aa8'); R(sd*15-(sd>0?0:8)+1,-8,3,16,'#ffb8d2'); R(sd*15-(sd>0?0:8)+5,-8,2,16,'#d85088'); }
  EO(0,0,6.5,6.5,fist); for(const dx of [-3,0,3]) Ln(dx,-5,dx,5,1,'#c8855f'); gfx.restore(); };
SC.df_weights=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,on=ms>s.from&&ms<s.to,sw=on?Math.sin(s.t*14):0,pop=ez(ms/180); gfx.globalAlpha=fade(u,.985); const hs=hands(),SK='#f2b48a';
  for(const [h,d] of [[hs.f,1],[hs.n,-1]]) bell(h.x,h.y+sw*3*d,(.5+sw*.28)*d,1.3*pop,SK);
  if(on) for(const [h,d] of [[hs.n,1],[hs.f,-1]]) { gfx.globalAlpha=.6; gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(h.x,h.y,30,-.9,.9); gfx.stroke(); gfx.globalAlpha=.4; gfx.beginPath(); gfx.arc(h.x,h.y,38,-.7,.7); gfx.stroke(); }
  if(ms<s.from+700&&ms>150) { gfx.globalAlpha=1; bigWord('1 LB',hs.n.x,hs.n.y-44,'#ff7aa8',2); }
  if(on&&Math.floor(s.t*4)%2) { gfx.globalAlpha=.9; bigWord(Math.floor(s.t*2)%2?'HUP':'TWO',st.x,st.y-DH()-20,CREAM,2); } gfx.globalAlpha=1; };
D.brisk_means_brisk=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),far=Math.max(24,F.x-F.w*.5-36),fy=Math.min(316,F.base+4);
  const passAt=Math.round(1400*(me.x-F.x)/(me.x-far));
  const PT=!!(BATTLE_SPRITES.deedee&&BATTLE_SPRITES.deedee.x_bpw1);   // painted tracksuit set (weights are painted in)
  const LOOP=['x_bpw1','x_bpw2','x_bsp1','x_bsp2','x_bfull'];
  const st=PT?ST.keys(fx,[{t:0,x:'home',y:'home',f:'x_bready'},{t:450,f:(u,tt)=>Math.abs(tt*1000-(450+passAt))<130?'x_bpass':LOOP[Math.floor(tt*9)%LOOP.length],ease:'lin'},{t:1850,x:far,y:fy,f:'x_bturn'},{t:2100,f:(u,tt)=>'x_bback',dy:u=>Math.sin(u*Math.PI)*16,ease:'lin'},{t:3700,x:'home',y:'home',f:'x_bcool'},{t:3950,f:'x_bwin'}])
    :ST.keys(fx,[{t:0,x:'home',y:'home',f:'clap'},{t:450,f:brisk,ease:'lin'},{t:1850,x:far,y:fy,f:'flip'},{t:2100,f:(u,tt)=>Math.sin(tt*14)>0?'runR':'walkR',dy:u=>Math.sin(u*Math.PI)*16,ease:'lin'},{t:3700,x:'home',y:'home',f:'idle'},{t:3900,f:'hip'}]);
  ST.play(E2,[
    [0,()=>{ setMessage(PT?'Deedee changes into her tracksuit and grabs her orange hand weights. Perfectly respectable posture.':'Deedee picks up her pink hand weights. Perfectly respectable posture.'); say(m.id,'brisk_means_brisk'); if(!PT) scene('df_weights',4.35,{st,from:450,to:3700}); scene('dd_speed',3.8,{st,from:450,to:3700,dir:ms=>ms<1850?1:-1}); sfx.ding(); }],
    [450,()=>{ sfx.run&&sfx.run(); setMessage('Arms swinging. Weights pumping. She sets off.'); }],
    ['hf',450+passAt],
    [450+passAt,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('dd_thump',.8,{x:F.x,y:F.mid}); scene('dv_big',1.1,{x:F.x,y:F.top-74,txt:'BRISK!',c:'#ff7aa8',sc:4}); }],
    [700+passAt,()=>{ scene('dd_sign',1.4,{x:F.x+14,y:F.base}); setMessage('Straight through. A tiny SIGHTSEEING sign spins in her wake.'); sfx.select(); }],
    [1850,()=>{ setMessage('She turns at the far end and keeps walking. A brisk walk is a brisk walk.'); }],
    [4100,'end',res(E2)+'The stroll has become an event.']]); };

// ---------- Garden Shower: a real water spray (fan of droplets, arcing streams, splashes, mist, rainbow glints) ----------
const RB=['#ff6a6a','#ffb04a','#ffe85a','#7ae07a','#5ac8ff','#7a7aff','#c07aff'];
SC.df_hose=(s,u)=>{ const ms=s.t*1000,h=hand(),x=h.x-8,y=h.y-2,P=s.P,t=s.t; gfx.globalAlpha=fade(u,.96);
  gfx.lineCap='round'; for(const [w,c] of [[9,OUT],[5,'#4f9a4a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(x+10,y+2); gfx.quadraticCurveTo(x+60,P.fl+30,600,P.fl-10); gfx.stroke(); }
  if(!PROPART.draw('deedee/garden_hose',x-2,y+6,{h:40,flip:true})) { RO(x-12,y-8,26,14,'#5fa05a'); RO(x-26,y-5,14,8,'#9aa3c8'); R(x-10,y-6,3,10,'#8ee08a'); }   // painted coiled hose with brass nozzle and GENTLE tag
  if(ms>P.s0&&ms<P.s1) { const q=(ms-P.s0)/(P.s1-P.s0),tx=lerp(P.x1+20,P.x0-20,q),ty=P.yl,sx=x-28,sy=y-2,N=9,env=Math.min(1,(ms-P.s0)/150,(P.s1-ms)/200);
    // soft nozzle mist
    gfx.globalAlpha=.4*env; E(sx-2,sy,7,5,'#e8f6ff');
    const pts=[];
    for(let k=0;k<N;k++) { const f=(k-(N-1)/2),tk={x:tx+f*13,y:ty+((k*37)%5-2)*7},mx=(sx+tk.x)/2+f*7,my=Math.min(sy,tk.y)-52-Math.abs(f)*4;
      // translucent arcing stream under the droplets
      for(const [w,c,a] of [[8,'#7cc0f4',.25],[4,'#e6f7ff',.35]]) { gfx.globalAlpha=a*env; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(sx,sy); gfx.quadraticCurveTo(mx,my,tk.x,tk.y); gfx.stroke(); }
      for(let j=0;j<9;j++) { const v=((t*1.9+j/9+k*.13)%1),ix=(1-v)*(1-v)*sx+2*(1-v)*v*mx+v*v*tk.x,iy=(1-v)*(1-v)*sy+2*(1-v)*v*my+v*v*tk.y; gfx.globalAlpha=env*(.5+.5*Math.sin(v*Math.PI)); E(ix,iy,2.4,3,j%3?WATER2:'#ffffff'); E(ix-.6,iy-.8,.9,.9,'#ffffff'); }
      // loose spray flung off the streams
      for(let j=0;j<4;j++) { const v=((t*1.3+j/4+k*.31)%1),a=-Math.PI*(.15+.7*((k*7+j*3)%10)/10),d=v*26; const bx=lerp(sx,tk.x,.55+.4*((j+k)%3)/3),by=lerp(sy,tk.y,.55)-30+((k*5)%7); gfx.globalAlpha=env*(1-v)*.8; E(bx+Math.cos(a)*d,by+Math.sin(a)*d+v*v*22,1.6,2,WATER2); }
      // splash crown where it lands on the row
      const sp=((t*2.1+k*.37)%1); gfx.globalAlpha=env*(1-sp)*.9; ring(tk.x,tk.y,4+sp*15,2+sp*6,2,'#e6f7ff');
      for(let j=0;j<5;j++) { const a=Math.PI*(1.1+j*.2),dd=sp*17; E(tk.x+Math.cos(a)*dd,tk.y+Math.sin(a)*dd*1.1+sp*sp*14,1.8,2.2,WATER2); }
      pts.push(tk); }
    // mist drifting over the row
    for(let k=0;k<10;k++) { const q2=((t*.45+k*.173)%1),mxp=tx+(k-5)*17+Math.sin(t*2+k)*8,myp=ty-8-q2*30; gfx.globalAlpha=env*(1-q2)*.2; E(mxp,myp,12+q2*14,7+q2*9,'#eaf6ff'); }
    // a faint rainbow arc and glints
    gfx.globalAlpha=.3*env; for(let b=0;b<RB.length;b++) { gfx.strokeStyle=RB[b]; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(tx,ty+34,64-b*3.4,Math.PI*1.12,Math.PI*1.88); gfx.stroke(); }
    for(let k=0;k<7;k++) { const ph=((t*1.7+k*.29)%1),gx=tx+Math.cos(k*2.4+t)*50,gy=ty-14-Math.abs(Math.sin(k*1.7))*34; gfx.globalAlpha=env*Math.sin(ph*Math.PI); twk(gx,gy,3+ph*4,RB[k%7]); }
    for(const p of P.list) if(Math.abs(p.x-tx)<p.w*.9) { gfx.globalAlpha=.55*env; E(p.x,p.base+2,p.w*.55,7,'#6aa8e0'); } }
  if(ms<P.s0) { gfx.globalAlpha=1; bigWord('GENTLE',x-6,y-30,'#8ef0a0',1); } gfx.globalAlpha=1; };
D.garden_shower=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,150),me=ST.unit(m);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:brisk,hop:3,hn:7},{t:900,x:p.x,y:p.y,f:'aim'},{t:1500,f:'aim',dx:u=>-Math.sin(u*Math.PI)*14,dy:u=>Math.sin(u*Math.PI*2)*3},{t:2900,f:'hip'},{t:3300,f:'walkR',hop:3,hn:6},{t:4200,x:'home',y:'home',f:'idle'}]);
  const P={s0:1500,s1:2900,x0:Gp.x0,x1:Gp.x1,yl:Gp.top+Math.max(10,(Gp.base-Gp.top)*.3),fl:p.y,list:list.map(f=>ST.foe(f))},hit=2200;
  ST.play(E2,[
    [0,()=>{ setMessage('Deedee walks over with the garden hose. She checks the nozzle. GENTLE. Good.'); say(m.id,'garden_shower'); scene('df_hose',3.6,{P}); }],
    [1500,()=>{ for(let k=0;k<7;k++) b7Later(()=>sfx.spray&&sfx.spray(),k*200); setMessage('One big spray. Right across the whole row.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.splat(); for(const f of list) ST.jolt(f,.4); landHit(100); scene('dv_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'SPLOOSH!',c:WATER,sc:4}); for(const f of list) { const U=ST.unit(f); scene('dv_drops',.8,{x:U.x,y:U.top+6,r:40}); } }],
    [2900,()=>{ setMessage('She checks the nozzle again. Still says gentle.'); }],
    [4300,'end',res(E2)+'The watering schedule was ambitious.']]); };

// ---------- Beanie Master: opens with "I am the Beanie Master!" before the cloud ----------
const bm=D.beanie_master;
D.beanie_master=E2=>{ const {m}=E2,play=ST.play;
  ST.play=(e,list)=>{ ST.play=play; return play(e,[...list,[250,()=>{ say(m.id,'beanie_master_open',0,null,{text:'I am the Beanie Master!',len:85320,from:0,to:2.85}); setMessage('"I am the Beanie Master!" says Deedee, with great dignity.'); }]]); };
  try { return bm(E2); } finally { ST.play=play; } };
})();
