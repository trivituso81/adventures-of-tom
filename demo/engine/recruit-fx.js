'use strict';
// engine/recruit-fx.js — Held props, scene effects and thrown props for Amy, Deedee, Boppy and TNB.
// Scenes are timed draw functions (battle.scenes); held items follow the actor's hand (battle.held).
const PROP2={};
const RFX={};
(function(){
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const Qd=(x0,y0,cx,cy,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.quadraticCurveTo(cx,cy,x1,y1); gfx.stroke(); };
const QdO=(x0,y0,cx,cy,x1,y1,w,c)=>{ Qd(x0,y0,cx,cy,x1,y1,w+4,OUT); Qd(x0,y0,cx,cy,x1,y1,w,c); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const GX=168,GY=222; // the Grump's middle
RFX.GX=GX; RFX.GY=GY;
if(!sfx.ding) sfx.ding=function(){ tone({type:'sine',f0:1320,f1:1320,dur:.5,vol:.12}); tone({type:'sine',f0:1980,f1:1980,dur:.4,vol:.07,delay:.02}); };

// ---------- Framework ----------
RFX.scene=(kind,dur,o)=>{ const s=Object.assign({kind,dur,t:-((o&&o.delay)||0),seed:Math.random()*100},o); (battle.scenes=battle.scenes||[]).push(s); return s; };
RFX.hold=(i,kind,dur,o)=>{ battle.held=Object.assign({i,kind,dur,t:0},o); return battle.held; };
RFX.update=dt=>{
  if(battle.scenes) { for(const s of battle.scenes) s.t+=dt; battle.scenes=battle.scenes.filter(s=>s.t<s.dur); }
  if(battle.held) { battle.held.t+=dt; if(battle.held.t>battle.held.dur) battle.held=null; }
  battle.enemyWobble=Math.max(0,(battle.enemyWobble||0)-dt);
};
RFX.reset=()=>{ battle.scenes=[]; battle.held=null; battle.enemyWobble=0; };
RFX.draw=back=>{
  if(!battle.scenes) return;
  for(const s of battle.scenes) {
    if(s.t<0||!!s.back!==!!back) continue;
    const f=SC[s.kind]; if(!f) continue;
    gfx.save(); f(s,cl(s.t/s.dur),s.t); gfx.restore(); gfx.globalAlpha=1;
  }
};

// ---------- Held items ----------
const HELD={};
const rot=(hx,hy,a)=>{ const c=Math.cos(a),s=Math.sin(a); return (x,y)=>[hx+x*c-y*s,hy+x*s+y*c]; };
HELD.rod=(h,u,hx,hy)=>{
  const a=h.ang==null?.9:h.ang,Lh=h.len||120,b=(h.bend||0)*Lh*.4,P=rot(hx,hy,a);
  const p0=P(16,0),c1=P(-Lh*.55,0),tip=P(-Lh*.97,b);
  QdO(p0[0],p0[1],c1[0],c1[1],tip[0],tip[1],4,'#8a5a30'); Qd(p0[0],p0[1]-1,c1[0],c1[1]-1,tip[0],tip[1]-1,1.5,'#c99a62');
  const g0=P(-24,0); LnO(p0[0],p0[1],g0[0],g0[1],7,'#d9b27a');
  const rl=P(-10,7); E(rl[0],rl[1],6,6,OUT); E(rl[0],rl[1],4.4,4.4,'#aeb3ba'); E(rl[0],rl[1],1.6,1.6,'#5e6670');
  for(const gx of [-48,-76]) { const g=P(gx,-2+b*(-gx/Lh)*.2); E(g[0],g[1],2.2,2.2,'#dde'); }
  E(tip[0],tip[1],2.6,2.6,OUT); E(tip[0],tip[1],1.5,1.5,'#fff');
  h.tx=tip[0]; h.ty=tip[1];
};
HELD.hose=(h,u,hx,hy)=>{
  const a=h.ang==null?.1:h.ang,P=rot(hx,hy,a),sx=552,sy=268;
  // coil on the ground and the spigot
  for(let k=0;k<3;k++) { gfx.strokeStyle=OUT; gfx.lineWidth=9; gfx.beginPath(); gfx.ellipse(sx-28,sy+2,22-k*5,6-k,0,0,Math.PI*2); gfx.stroke(); }
  for(let k=0;k<3;k++) { gfx.strokeStyle='#3f9a4d'; gfx.lineWidth=5; gfx.beginPath(); gfx.ellipse(sx-28,sy+2,22-k*5,6-k,0,0,Math.PI*2); gfx.stroke(); }
  R(sx-4,sy-34,10,36,OUT); R(sx-2,sy-32,6,32,'#c9a03e'); R(sx-12,sy-30,10,6,OUT); R(sx-11,sy-29,8,4,'#c9a03e'); E(sx+1,sy-38,8,3,OUT); E(sx+1,sy-38,6,2,'#d94a3a');
  const b0=P(16,0);
  QdO(b0[0],b0[1],(b0[0]+sx)/2,Math.max(b0[1],sy)+30,sx,sy-26,6,'#3f9a4d'); Qd(b0[0],b0[1]-2,(b0[0]+sx)/2,Math.max(b0[1],sy)+27,sx,sy-28,2,'#8fe09a');
  const n0=P(12,0),n1=P(-14,0),n2=P(-24,0);
  LnO(n0[0],n0[1],n1[0],n1[1],11,'#c9a03e'); Ln(n0[0],n0[1]-3,n1[0],n1[1]-3,3,'#f1d78a');
  LnO(n1[0],n1[1],n2[0],n2[1],7,'#a98630');
  const tg=P(-2,8); LnO(n0[0],n0[1]+4,tg[0],tg[1],3,'#d94a3a');
  h.tx=n2[0]-2; h.ty=n2[1];
};
HELD.pipe=(h,u,hx,hy)=>{
  const a=h.ang==null?.5:h.ang,P=rot(hx,hy,a);
  const sq=h.squeeze?1+.06*Math.sin(h.t*30):1;
  poly([P(26,-17*sq),P(26,17*sq),P(-24,3),P(-24,-1)],'#f4efe0',true);
  poly([P(26,-17*sq),P(26,17*sq),P(18,17*sq),P(18,-17*sq)],'#e6dfcb');
  const t1=P(-24,-1),t2=P(-24,3),t3=P(-33,1);
  poly([t1,t2,t3],'#ff9fc0',true);
  for(let k=-2;k<=2;k++) { const q=P(-6+k*2,k*4); R(q[0]-1,q[1]-1,2,2,'#e7dcc0'); }
  const knot=P(28,0); E(knot[0],knot[1],5,6,OUT); E(knot[0],knot[1],3.4,4.4,'#e6dfcb');
  h.tx=t3[0]-2; h.ty=t3[1];
};
HELD.pin=(h,u,hx,hy)=>{
  const a=h.ang==null?.9:h.ang,P=rot(hx,hy,a);
  const p0=P(10,0),p1=P(-8,0),p2=P(-46,0),p3=P(-58,0);
  LnO(p0[0],p0[1],p1[0],p1[1],5,'#c79a60'); LnO(p1[0],p1[1],p2[0],p2[1],14,'#e1bd86'); Ln(p1[0],p1[1]-4,p2[0],p2[1]-4,3,'#f6e0b4'); LnO(p2[0],p2[1],p3[0],p3[1],5,'#c79a60');
  h.tx=p2[0]; h.ty=p2[1];
};
HELD.purse=(h,u,hx,hy)=>{
  const sw=Math.sin(h.t*5)*.05,P=rot(hx,hy,sw+.15);
  const a=P(0,4),b=P(-4,22); Ln(a[0],a[1],b[0],b[1],3,OUT);
  const cx=hx-8,cy=hy+34;
  R(cx-19,cy-12,38,26,OUT); R(cx-17,cy-10,34,22,'#a8513a'); R(cx-17,cy-10,34,8,'#c26a4c'); R(cx-3,cy-5,6,6,'#e8c25a');
  if(h.open) { for(let k=0;k<3;k++) { E(cx-9+k*9,cy-14-(k%2)*3,6,5,OUT); E(cx-9+k*9,cy-14-(k%2)*3,4.6,3.8,'#c98a4b'); R(cx-10+k*9,cy-15-(k%2)*3,2,2,'#4a2e1c'); } }
  h.tx=cx; h.ty=cy-10;
};
HELD.basket=(h,u,hx,hy)=>{
  const cx=hx-6,cy=hy+22;
  gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.arc(cx,cy-6,17,Math.PI,0); gfx.stroke(); gfx.strokeStyle='#b88a52'; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(cx,cy-6,17,Math.PI,0); gfx.stroke();
  poly([[cx-22,cy-8],[cx+22,cy-8],[cx+17,cy+14],[cx-17,cy+14]],'#c79a60',true);
  for(let k=0;k<4;k++) R(cx-18+k*10,cy-6,2,18,'#a07842'); for(let k=0;k<2;k++) R(cx-20,cy-2+k*8,40,2,'#a07842');
  for(let k=0;k<(h.count==null?4:h.count);k++) { E(cx-12+k*8,cy-11-(k%2)*3,6,5.5,OUT); E(cx-12+k*8,cy-11-(k%2)*3,4.6,4.2,'#e04a3a'); R(cx-13+k*8,cy-15-(k%2)*3,3,2,'#4f8a3a'); }
  h.tx=cx-4; h.ty=cy-14;
};
HELD.mitt=(h,u,hx,hy)=>{
  E(hx,hy,10,9,OUT); E(hx,hy,8.2,7.2,'#d6453a'); E(hx-6,hy-8,4,5,OUT); E(hx-6,hy-8,2.6,3.6,'#d6453a');
  for(let k=0;k<3;k++) R(hx-5+k*4,hy-1,2,2,'#f3d6a0');
  R(hx+5,hy-6,4,12,'#b8342a');
  h.tx=hx-12; h.ty=hy;
};
HELD.tray=(h,u,hx,hy)=>{
  HELD.mitt(h,u,hx,hy);
  const cy=hy-8; R(hx-34,cy,50,5,OUT); R(hx-33,cy+1,48,3,'#b9bdc4');
  for(let k=0;k<3;k++) { E(hx-24+k*14,cy-5,8,7,OUT); E(hx-24+k*14,cy-5,6.4,5.6,'#d9a05a'); E(hx-26+k*14,cy-7,3,2,'#f0c27f'); }
  for(let k=0;k<3;k++) label('~',hx-24+k*14,cy-26-Math.round(Math.abs(Math.sin(h.t*3+k))*6),'rgba(255,246,220,.8)',2);
  h.tx=hx-24; h.ty=cy-8;
};
HELD.pietin=(h,u,hx,hy)=>{
  const cy=hy-2;
  R(hx-36,cy,42,5,OUT); R(hx-35,cy+1,40,3,'#b9bdc4');
  E(hx-15,cy-3,22,8,OUT); E(hx-15,cy-3,20.4,6.6,'#d9a05a'); E(hx-15,cy-8,17,6,'#e8d5a0'); E(hx-17,cy-11,7,3,'#fff1cb');
  for(let k=-2;k<=2;k++) R(hx-15+k*6-1,cy-12,2,6,'#a86a38');
  h.tx=hx-15; h.ty=cy-8;
};
HELD.clip=(h,u,hx,hy)=>{
  const P=rot(hx-8,hy-8,h.ang==null?-.15:h.ang);
  poly([P(-15,-19),P(15,-19),P(15,19),P(-15,19)],'#8a5a30',true); poly([P(-12,-14),P(12,-14),P(12,16),P(-12,16)],'#fff8e8');
  for(let k=0;k<5;k++) { const a=P(-9,-8+k*5),b=P(9-(k%2)*5,-8+k*5); Ln(a[0],a[1],b[0],b[1],1.5,'#9aa0b5'); }
  const c=P(0,-19); R(c[0]-6,c[1]-4,12,6,OUT); R(c[0]-5,c[1]-3,10,4,'#c9ccd4');
  const ck=P(5,6); label('A+',ck[0],ck[1]-3,'#e0402e',1);
  h.tx=hx-8; h.ty=hy-8;
};
HELD.redpen=(h,u,hx,hy)=>{
  const a=h.ang==null?.6:h.ang,P=rot(hx,hy,a);
  const b0=P(14,0),b1=P(-40,0),t=P(-56,0),cap=P(-30,0);
  LnO(b0[0],b0[1],b1[0],b1[1],8,'#e0402e'); Ln(b0[0],b0[1]-2,b1[0],b1[1]-2,2,'#ff9a8a'); LnO(cap[0],cap[1],P(-22,0)[0],P(-22,0)[1],9,'#f4efe0');
  poly([P(-40,-4),P(-40,4),P(-56,0)],'#7a1a14',true);
  h.tx=t[0]; h.ty=t[1];
};
HELD.cap=(h,u,hx,hy)=>{
  const a=h.ang==null?0:h.ang,P=rot(hx,hy,a);
  const c=P(-6,-6); E(c[0],c[1],15,12,OUT); E(c[0],c[1],13,10,'#2f5a94'); E(c[0]-2,c[1]-3,7,4,'#4f7fb8'); E(c[0],c[1]+1,15,3,OUT);
  const b=P(-24,0); poly([P(-14,-2),P(-34,2),P(-34,6),P(-12,6)],'#244a7d',true);
  E(c[0],c[1]-10,2,2,'#f1d58c');
  h.tx=b[0]; h.ty=b[1];
};
HELD.pepper=(h,u,hx,hy)=>{
  let px=hx-10,py=hy-4;
  if(h.eat) { const k=ez((h.t-h.eat[0])/(h.eat[1]-h.eat[0])); const m=battle.actorMouth||{x:hx-30,y:hy-30}; px=lerp(px,m.x,k); py=lerp(py,m.y,k); if(k>=1) { h.tx=px; h.ty=py; return; } }
  gfx.save(); gfx.translate(px,py); gfx.rotate(h.pa==null?1.1:h.pa);
  const c=h.ghost?['#f4f1ff','#c9c2ee','#ffffff']:['#e0402e','#a82a1e','#ff9a80'];
  E(0,0,7,16,OUT); E(0,0,5.4,14.4,c[0]); E(2,2,2.4,10,c[1]); E(-2,-4,1.6,6,c[2]); R(-2,-22,4,7,OUT); R(-1,-21,2,5,'#4f8a3a');
  if(h.ghost) { R(-3,-4,2,3,'#2b2a26'); R(1,-4,2,3,'#2b2a26'); R(-1,2,2,2,'#2b2a26'); }
  gfx.restore();
  h.tx=px-10; h.ty=py;
};
HELD.mug=(h,u,hx,hy)=>{
  const cx=hx-9,cy=hy-9;
  R(cx-10,cy-10,19,20,OUT); R(cx-8,cy-8,15,16,'#5aa6a8'); R(cx-8,cy-8,5,16,'#7fc4c4'); R(cx-8,cy-8,15,3,'#2f6f74'); R(cx-4,cy-10,12,3,'#6b4429');
  gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath(); gfx.arc(cx+9,cy,6,-Math.PI/2,Math.PI/2); gfx.stroke(); gfx.strokeStyle='#5aa6a8'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(cx+9,cy,6,-Math.PI/2,Math.PI/2); gfx.stroke();
  for(let k=0;k<2;k++) label('~',cx-3+k*8,cy-22-Math.round(Math.abs(Math.sin(h.t*3+k*2))*5),'rgba(255,246,220,.8)',2);
  h.tx=cx; h.ty=cy;
};
HELD.wrench=(h,u,hx,hy)=>{
  const a=h.ang==null?.5:h.ang,P=rot(hx,hy,a);
  const b0=P(14,0),b1=P(-48,0);
  LnO(b0[0],b0[1],b1[0],b1[1],8,'#aeb3ba'); Ln(b0[0],b0[1]-2,b1[0],b1[1]-2,2,'#e4e7ec');
  const j=P(-56,0); E(j[0],j[1],11,11,OUT); E(j[0],j[1],9.2,9.2,'#aeb3ba');
  const m=P(-62,0); poly([P(-54,-4),P(-72,-4),P(-72,4),P(-54,4)],'#2b3f38');
  h.tx=P(-62,0)[0]; h.ty=P(-62,0)[1]; h.jx=j[0]; h.jy=j[1];
};
HELD.tape=(h,u,hx,hy)=>{
  const cx=hx-10,cy=hy-8;
  E(cx,cy,14,14,OUT); E(cx,cy,12,12,'#b9bdc4'); E(cx,cy,7,7,OUT); E(cx,cy,5.6,5.6,'#3c5850'); E(cx-3,cy-5,4,2,'#e4e7ec');
  if(h.pull!=null) { Ln(cx-12,cy+3,cx-12-h.pull*0,cy+3+8,5,OUT); }
  R(cx-14,cy+2,5,12+(h.pull||0)*8,'#9aa0a8');
  h.tx=cx-12; h.ty=cy+4;
};

RFX.postParty=(i,sp,frame,x,y)=>{
  const H=sp.handAt&&(sp.handAt.get(frame)||sp.handAt.get(sp.idle));
  if(!H) return;
  const k=sp.scale,hn=[x+(H.n[0]+.5)*k,y+(H.n[1]+.5)*k],hf=[x+(H.f[0]+.5)*k,y+(H.f[1]+.5)*k];
  if(i===battle.actor) {
    const eye=(sp.eyeAt&&sp.eyeAt.get(frame))||sp.eye;
    battle.actorHand={n:hn,f:hf}; battle.actorMouth={x:x+(eye.col-3.5)*k,y:y+(eye.row+3.5)*k};
  }
  const h=battle.held;
  if(h&&h.i===i) { if(h.angTo!=null) h.ang=(h.ang==null?h.angTo:h.ang+(h.angTo-h.ang)*.25); if(h.sw) h.ang=h.sw[0]+h.sw[1]*Math.sin(h.t*h.sw[2]); }
  if(h&&h.i===i&&HELD[h.kind]) {
    HELD[h.kind](h,h.t/h.dur,Math.round(hn[0]),Math.round(hn[1]));
    if(!h.nofist) { const sk=sp.skin||'#f0b090'; E(hn[0],hn[1],5.5,5.5,OUT); E(hn[0],hn[1],4,4,sk); }
  }
  if(h&&h.i===i&&h.measure) {
    // The "this big" bracket between both hands.
    const a=hn,b=hf; gfx.setLineDash([6,5]); gfx.strokeStyle='#fff6dc'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(a[0],a[1]-14); gfx.lineTo(b[0],b[1]-14); gfx.stroke(); gfx.setLineDash([]);
    for(const p of [a,b]) Ln(p[0],p[1]-22,p[0],p[1]-6,3,'#fff6dc');
    label('THIS BIG',(a[0]+b[0])/2,a[1]-34,'#ffe08a',2);
  }
};

// ---------- Thrown / dropped props ----------
PROP2.cookie=(q,u)=>{ E(0,0,13,12,OUT); E(0,0,11,10,'#cf9455'); E(-3,-3,6,4,'#e3b47a'); R(-6,-4,3,3,'#4a2e1c'); R(3,-2,3,3,'#4a2e1c'); R(-2,4,3,3,'#4a2e1c'); R(4,5,2,2,'#4a2e1c'); };
PROP2.pie=(q,u)=>{ E(0,3,25,11,OUT); E(0,3,23,9,'#cf9455'); E(0,-2,20,8,'#e8d5a0'); E(-5,-5,9,4,'#fff1cb'); for(let i=-2;i<=2;i++) R(i*7-1,-6,2,8,'#a86a38'); E(6,-6,4,4,OUT); E(6,-6,2.6,2.6,'#d94a3a'); };
PROP2.mug=(q,u)=>{ R(-11,-11,21,22,OUT); R(-9,-9,17,18,'#5aa6a8'); R(-9,-9,6,18,'#7fc4c4'); gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath(); gfx.arc(10,0,7,-Math.PI/2,Math.PI/2); gfx.stroke(); gfx.strokeStyle='#5aa6a8'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(10,0,7,-Math.PI/2,Math.PI/2); gfx.stroke(); if(u<.5) R(-6,-12,12,3,'#6b4429'); };
PROP2.pepper=(q,u)=>{
  gfx.save(); gfx.rotate(.5);
  for(let k=1;k<=4;k++) { gfx.globalAlpha=.5-k*.1; E(k*9,-k*5,8-k,12-k*2,'#ff8c3a'); } gfx.globalAlpha=1;
  E(0,0,8,20,OUT); E(0,0,6,18,'#e0402e'); E(2,2,2.6,13,'#a82a1e'); E(-2,-4,2,8,'#ff9a80'); R(-2,-25,4,7,OUT); R(-1,-24,2,5,'#4f8a3a'); gfx.restore();
};
PROP2.recliner=(q,u)=>{
  // Side view, facing left: back, seat, arm and a footrest that pops out on landing.
  const foot=u>.62?cl((u-.62)/.1):0;
  R(-34,-34,22,64,OUT); R(-32,-32,18,60,'#7a4a2e'); R(-32,-32,6,60,'#9a6540');
  R(-34,12,68,20,OUT); R(-32,14,64,16,'#8b5a38'); R(-32,14,64,5,'#a46d44');
  R(-30,-10,50,8,OUT); R(-28,-9,46,6,'#8b5a38');
  R(-34,2,50,16,OUT); R(-32,4,46,12,'#9a6540'); R(-32,4,46,3,'#b27a50');
  if(foot>0) { const fx=-34-foot*30; R(fx,12,36,10,OUT); R(fx+2,13,32,7,'#8b5a38'); R(fx+2,13,32,2,'#a46d44'); }
  R(-30,30,6,6,OUT); R(24,30,6,6,OUT);
  if(u>.7) label('ZZZ',0,-46-Math.round((u-.7)*30),'#fff1cb',2);
};
PROP2.fish=(q,u)=>{
  gfx.save(); gfx.scale(-1,1); gfx.rotate(.5-u*1.2);
  const body='#7fa4b8',belly='#d3e6ee',dark='#4e7388';
  poly([[-74,0],[-40,-26],[10,-32],[52,-18],[74,-4],[52,16],[10,30],[-40,24]],body,true);
  poly([[-50,6],[-30,18],[10,26],[52,12],[60,0],[-20,6]],belly);
  poly([[70,-4],[104,-34],[96,0],[104,34]],dark,true);
  poly([[-20,-28],[10,-52],[30,-24]],dark,true); poly([[0,22],[18,44],[30,20]],dark);
  for(let k=0;k<6;k++) for(let r=0;r<3;r++) R(-34+k*13+(r%2)*6,-14+r*10,5,3,'#a8c8d8');
  E(-52,-8,7,7,OUT); E(-52,-8,5,5,'#fff'); R(-54,-9,3,3,OUT);
  R(-74,4,18,3,OUT); R(-40,-4,3,18,dark);
  gfx.restore();
};
PROP2.bowl=(q,u)=>{
  poly([[-48,-10],[48,-10],[40,12],[24,32],[0,38],[-24,32],[-40,12]],'#8aa6a8',true);
  poly([[-44,-8],[-20,-8],[-26,26],[-34,14]],'#b3cbcc');
  E(0,-10,48,11,OUT); E(0,-10,45.5,9,'#9fbcbc'); E(0,-9,38,6,'#4e6f78');
  R(-30,14,60,4,'#d98f3f'); R(-18,24,36,3,'#d98f3f');
};
PROP2.wrench=(q,u)=>{ gfx.save(); gfx.rotate(-.6); R(-5,-24,10,48,OUT); R(-3,-22,6,44,'#aeb3ba'); E(0,-28,11,11,OUT); E(0,-28,9,9,'#aeb3ba'); R(-3,-38,6,10,'#2b3f38'); gfx.restore(); };

// ---------- Scenes ----------
const SC={};
SC.dust=(s,u)=>{ const n=s.n||5; for(let k=0;k<n;k++) { const a=rr(s,k),dx=(k-(n-1)/2)*(s.sp||14)*(.5+u*.9)+(a-.5)*8,r=(s.r||7)+u*14+a*5,yy=s.y-u*(s.up||12)-a*5; gfx.globalAlpha=(1-u)*.85; E(s.x+dx,yy,r,r*.7,s.c||'#d9d2b4'); E(s.x+dx-2,yy-2,r*.6,r*.4,s.c2||'#f2ecd8'); } };
SC.ring=(s,u)=>{ gfx.globalAlpha=1-u; gfx.strokeStyle=s.c||'#fff6dc'; gfx.lineWidth=5*(1-u)+1; const r=10+u*(s.r||90); gfx.beginPath(); gfx.ellipse(s.x,s.y,r,r*(s.sq||.25),0,0,Math.PI*2); gfx.stroke(); };
SC.burst=(s,u)=>{ const n=s.n||10; gfx.globalAlpha=1-u; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+rr(s,k)*.4,r0=8+u*(s.r||44),r1=r0+10+(1-u)*16; Ln(s.x+Math.cos(a)*r0,s.y+Math.sin(a)*r0,s.x+Math.cos(a)*r1,s.y+Math.sin(a)*r1,4,k%2?(s.c||'#ffe08a'):(s.c2||'#fff6c8')); } E(s.x,s.y,(1-u)*18,(1-u)*18,s.c2||'#fff6c8'); };
SC.confetti=(s,u)=>{ const cs=['#ff6b8b','#ffe08a','#8fd0ff','#9be39a','#ffb070','#c9b3e6']; for(let k=0;k<(s.n||30);k++) { const a=rr(s,k),b=rr(s,k+50),x=(s.x0||60)+((s.x1||300)-(s.x0||60))*a+Math.sin(u*6+k)*10,y=-10+u*330*(.6+b*.6); if(y>268) continue; gfx.save(); gfx.translate(x,y); gfx.rotate(u*8+k); R(-3,-2,6,4,cs[k%6]); gfx.restore(); } };
SC.crumbs=(s,u)=>{ for(let k=0;k<(s.n||14);k++) { const a=rr(s,k),b=rr(s,k+9),x=s.x+(a-.5)*(s.sp||110)*u*1.6,y=s.y-(30+b*40)*Math.sin(Math.min(1,u*1.4)*Math.PI/2)+u*u*(70+b*50); if(y>268) continue; gfx.globalAlpha=1-u*.6; R(x,y,3+(k%2)*2,3,s.c||'#b87a3d'); } };
SC.shards=(s,u)=>{ const cs=s.cs||['#5aa6a8','#7fc4c4','#2f6f74','#f4efe0']; for(let k=0;k<(s.n||12);k++) { const a=rr(s,k),b=rr(s,k+7),ang=a*Math.PI*2,sp=(40+b*70)*u,x=s.x+Math.cos(ang)*sp,y=s.y+Math.sin(ang)*sp*.7+u*u*80; gfx.save(); gfx.translate(x,y); gfx.rotate(u*9+k); gfx.globalAlpha=1-u*u; poly([[-5,-3],[5,-1],[1,5]],cs[k%cs.length]); gfx.restore(); } };
SC.drips=(s,u)=>{ const n=s.n||7; gfx.globalAlpha=u>.8?(1-u)/.2:1; for(let k=0;k<n;k++) { const a=rr(s,k),x=s.x-s.w/2+(k+.5)*s.w/n,len=(6+a*(s.len||34))*cl(u*1.8),c=Array.isArray(s.c)?s.c[k%s.c.length]:s.c; R(x-2,s.y,4,len,c); E(x,s.y+len,3.6,4.4,c); } };
SC.splashw=(s,u)=>{ for(let k=0;k<(s.n||12);k++) { const a=rr(s,k),b=rr(s,k+3),x=s.x+(a-.5)*(s.sp||90)*u*1.4,y=s.y-(50+b*60)*Math.sin(u*Math.PI)*(1-u*.2)+u*20; gfx.globalAlpha=1-u*.7; E(x,y,3,4,k%2?(s.c||'#8fd0ff'):(s.c2||'#e6f7ff')); } SC.ring({x:s.x,y:s.y+10,r:60,c:s.c||'#bfe6ff',sq:.2},u,0); };
SC.count=(s,u)=>{ gfx.globalAlpha=env(u,.1,.7); const y=s.y-u*22,sc=s.sc||4; label(s.text,s.x+2,y+2,'#1b2d27',sc); label(s.text,s.x,y,s.c||'#ffe08a',sc); };
SC.sweat=(s,u)=>{ gfx.globalAlpha=1-u; for(let k=0;k<3;k++) { const a=-1.3-k*.55,r=10+u*30,x=s.x+Math.cos(a)*r*-1.2,y=s.y+Math.sin(a)*r+u*u*26; E(x,y,2.4,3.4,'#9fd8ff'); } };
SC.swish=(s,u)=>{ gfx.globalAlpha=(1-u)*.9; gfx.strokeStyle=s.c||'#fff6dc'; gfx.lineWidth=6*(1-u)+1; gfx.beginPath(); gfx.arc(s.x,s.y,s.r||60,s.a0==null?-2.4:s.a0,(s.a0==null?-2.4:s.a0)+(s.sw||1.8)*ez(u*1.6)); gfx.stroke(); };
SC.note=(s,u)=>{ gfx.globalAlpha=env(u,.1,.7); const x=s.x+Math.sin(u*9)*8,y=s.y-u*50; E(x,y+8,5,4,'#2b1d2b'); R(x+3,y-8,3,16,'#2b1d2b'); R(x+3,y-8,9,3,'#2b1d2b'); };
SC.shadow=(s,u)=>{ const k=ez(u)*(s.r||60); gfx.globalAlpha=.1+.45*u; E(s.x,s.y,k,k*.2,'#18312a'); };
SC.glow=(s,u)=>{ gfx.globalAlpha=env(u)*(s.a||.5); E(s.x,s.y,s.rx||70,s.ry||60,s.c||'#ffd166'); };
SC.dark=(s,u)=>{ gfx.globalAlpha=env(u,.15,.8)*(s.a||.5); R(0,0,576,324,s.c||'#0b1740'); };
SC.flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.5); R(0,0,576,324,s.c||'#ffffff'); };

SC.finishline=(s,u)=>{
  gfx.globalAlpha=u>.85?(1-u)/.15:1;
  for(const px of [92,252]) { R(px-4,112,8,150,OUT); R(px-2,114,4,148,'#e8e0cc'); }
  R(88,106,168,30,OUT); for(let c=0;c<20;c++) for(let r=0;r<3;r++) R(92+c*8,108+r*8,8,8,(c+r)%2?'#2b2a26':'#fff8e8');
  label('FINISH',172,142,'#e0402e',2);
  const y0=206,snap=s.snap||.4;
  if(u<snap) { const w=Math.sin(u*40)*1.5; gfx.strokeStyle=OUT; gfx.lineWidth=9; gfx.beginPath(); gfx.moveTo(96,y0); gfx.quadraticCurveTo(172,y0+10+w,248,y0); gfx.stroke(); gfx.strokeStyle='#e0402e'; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(96,y0); gfx.quadraticCurveTo(172,y0+10+w,248,y0); gfx.stroke(); }
  else { const k=cl((u-snap)/(1-snap)); for(const sd of [-1,1]) { const bx=sd<0?96:248,ex=bx-sd*-1*(58*(1-k*.3)),ey=y0+k*74; gfx.strokeStyle=OUT; gfx.lineWidth=9; gfx.beginPath(); gfx.moveTo(bx,y0); gfx.quadraticCurveTo((bx+ex)/2,y0+k*30+14,ex,ey); gfx.stroke(); gfx.strokeStyle='#e0402e'; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(bx,y0); gfx.quadraticCurveTo((bx+ex)/2,y0+k*30+14,ex,ey); gfx.stroke(); } }
};
SC.redmarks=(s,u)=>{
  const part=(a,b)=>cl((u-a)/(b-a));
  gfx.globalAlpha=u>.9?(1-u)/.1:1; gfx.lineCap='round';
  const stroke=(x0,y0,x1,y1,k)=>{ if(k<=0) return; Ln(x0,y0,lerp(x0,x1,k),lerp(y0,y1,k),9,'#7a1a14'); Ln(x0,y0,lerp(x0,x1,k),lerp(y0,y1,k),6,'#e0402e'); };
  stroke(118,184,218,258,part(.0,.28)); stroke(218,184,118,258,part(.28,.52));
  const k=part(.52,.78); if(k>0) { for(const [w,c] of [[9,'#7a1a14'],[6,'#e0402e']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(GX,208,52,34,-.15,-Math.PI/2,-Math.PI/2+Math.PI*2*k); gfx.stroke(); } }
  if(u>.78) { const p=Math.min(1,(u-.78)/.08); label('F-',GX+2,134+2-(1-p)*10,'#5a1a12',9); label('F-',GX,134-(1-p)*10,'#e0402e',9); label('SEE ME',GX+68,96,'#e0402e',2); }
};
SC.hill=(s,u)=>{
  gfx.globalAlpha=env(u,.06,.94); const base=262,H=50,W=96;
  gfx.beginPath(); gfx.moveTo(GX-W,base); for(let x=-W;x<=W;x+=6) gfx.lineTo(GX+x,base-H*(1-(x/W)*(x/W))); gfx.lineTo(GX+W,base); gfx.closePath();
  gfx.fillStyle='#6f9d55'; gfx.fill(); gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke();
  gfx.save(); gfx.clip(); for(let k=0;k<12;k++) R(GX-W+k*16,base-H+8+(k%3)*14,10,3,'#5f8f4c'); R(GX-W,base-20,2*W,20,'#5a8a48'); gfx.restore();
  R(GX-3,base-H-26,3,28,OUT); poly([[GX,base-H-26],[GX+22,base-H-18],[GX,base-H-10]],'#e0402e',true);
};
SC.blackboard=(s,u)=>{
  const x0=104,y0=14,w=136,h=96,drop=ez(u/.12); gfx.translate(0,-(1-drop)*130); gfx.globalAlpha=u>.92?(1-u)/.08:1;
  R(x0-6,y0-6,w+12,h+12,OUT); R(x0-4,y0-4,w+8,h+8,'#8a5a30'); R(x0,y0,w,h,'#2f5a4a'); R(x0+4,y0+4,w-8,h-8,'#3a6b58');
  R(x0+10,y0+h-8,24,4,'#fff8e8'); R(x0+w-34,y0+h-7,18,3,'#f4a6b8');
  const cx=x0+w/2; label('7 X 8 = ?',cx,y0+14,'#f1ede0',3);
  if(u>.3) label(u>.62?'54':'5 4',cx-28,y0+44,'#ffb3bf',5);
  if(u>.62) { Ln(cx-50,y0+40,cx-6,y0+74,5,'#e0402e'); Ln(cx-6,y0+40,cx-50,y0+74,5,'#e0402e'); }
  if(u>.74) label('56',cx+30,y0+60,'#9fe8ff',5);
  if(u>.46&&u<.62) label('...',cx,y0+52,'#f1ede0',3);
};
SC.miles=(s,u)=>{
  const x=lerp(600,-60,u),y=262; gfx.globalAlpha=1;
  R(x-3,y-70,6,70,OUT); R(x-1,y-68,3,68,'#e8e0cc'); R(x-34,y-86,68,24,OUT); R(x-32,y-84,64,20,'#2f6fb0'); label(s.text||'MILE 1',x,y-79,'#fff8e8',2);
  for(let k=0;k<3;k++) { const cx=x+44+k*12,cy=y-4-(k%2)*3; R(cx-3,cy-8,7,9,OUT); R(cx-2,cy-7,5,7,'#f4efe0'); }
};
SC.stopwatch=(s,u)=>{
  gfx.globalAlpha=env(u,.08,.9); const x=s.x||GX,y=s.y||58;
  R(x-5,y-44,10,8,OUT); R(x-3,y-43,6,6,'#c9ccd4'); E(x,y,34,34,OUT); E(x,y,31,31,'#c9ccd4'); E(x,y,26,26,'#f4f4f0');
  for(let k=0;k<12;k++) { const a=k*Math.PI/6; Ln(x+Math.cos(a)*21,y+Math.sin(a)*21,x+Math.cos(a)*25,y+Math.sin(a)*25,2,'#2b2a26'); }
  const a=-Math.PI/2+u*Math.PI*10; Ln(x,y,x+Math.cos(a)*20,y+Math.sin(a)*20,3,'#e0402e'); E(x,y,3,3,OUT);
  label(u>.55?'9:48':'9:59',x,y+10,u>.55?'#3a8a4a':'#2b2a26',2);
};
SC.trophy=(s,u)=>{
  const land=.4,y=u<land?lerp(-70,152,ez(u/land)):152+Math.sin((u-land)*18)*Math.max(0,(1-(u-land)*3))*8;
  gfx.globalAlpha=u>.88?(1-u)/.12:1; const x=GX;
  R(x-20,y+22,40,12,OUT); R(x-18,y+24,36,8,'#8a5a30'); label('1',x,y+25,'#f1d58c',1);
  R(x-5,y+8,10,16,OUT); R(x-3,y+8,6,16,'#e8b84a');
  poly([[x-22,y-22],[x+22,y-22],[x+18,y-2],[x+8,y+8],[x-8,y+8],[x-18,y-2]],'#e8b84a',true);
  poly([[x-18,y-20],[x-8,y-20],[x-8,y+4],[x-14,y-2]],'#f9e08a');
  gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.arc(x-24,y-12,9,Math.PI*.5,Math.PI*1.5); gfx.stroke(); gfx.beginPath(); gfx.arc(x+24,y-12,9,-Math.PI*.5,Math.PI*.5); gfx.stroke();
  gfx.strokeStyle='#e8b84a'; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(x-24,y-12,9,Math.PI*.5,Math.PI*1.5); gfx.stroke(); gfx.beginPath(); gfx.arc(x+24,y-12,9,-Math.PI*.5,Math.PI*.5); gfx.stroke();
  if(u>land) for(let k=0;k<6;k++) { const a=k*1.05+u*4; label('+',x+Math.cos(a)*(30+(u-land)*50),y+Math.sin(a)*(24+(u-land)*30),'#fff6c8',2); }
};
SC.pieface=(s,u)=>{
  const k=ez(u/.12); gfx.globalAlpha=u>.85?(1-u)/.15:1; const x=GX-6,y=206;
  E(x,y,40*k,30*k,'#fff6e6'); E(x-18*k,y+16,13*k,10*k,'#fff6e6'); E(x+22*k,y+12,12*k,9*k,'#fff6e6'); E(x-6,y-6,22*k,12*k,'#ffffff');
  const dr=cl((u-.12)*1.2);
  for(let d=0;d<4;d++) { const dx=x-28+d*18,len=10+dr*(22+d%2*14); R(dx-3,y+14,6,len,'#fff6e6'); E(dx,y+14+len,4.4,5,'#fff6e6'); }
  if(u>.05) { gfx.save(); gfx.translate(x+4,y-4); gfx.rotate(-.5); E(0,0,24,6,OUT); E(0,0,22,4.4,'#b9bdc4'); gfx.restore(); }
  E(x-16,y-12,4,4,OUT); E(x-16,y-12,2.6,2.6,'#d94a3a');
};
SC.tomatosplat=(s,u)=>{
  gfx.globalAlpha=u>.8?(1-u)/.2:1; const k=ez(u/.1),x=s.x,y=s.y;
  E(x,y,15*k,12*k,'#c93a2c'); E(x-8,y+6,7*k,5*k,'#c93a2c'); E(x+9,y-5,6*k,5*k,'#e04a3a'); E(x-3,y-3,5*k,3*k,'#ff7a6a');
  for(let d=0;d<2;d++) { const len=cl((u-.1)*1.5)*(12+d*10); R(x-6+d*10,y+8,4,len,'#c93a2c'); }
  R(x-10,y-2,2,2,'#f3d58a'); R(x+6,y+4,2,2,'#f3d58a'); R(x+1,y-8,2,2,'#f3d58a');
};
SC.jet=(s,u)=>{
  const e=env(u,s.a||.12,s.b||.85),reach=cl(u/(s.grow||.22)),n=16,cs=s.cs||['#e0402e','#ff8c3a','#ffd166','#fff6c8'];
  if(e<=0) return; gfx.globalAlpha=e>0?Math.min(1,e*1.4):0;
  const x0=s.x0,y0=s.y0,x1=s.x1,y1=s.y1;
  for(let L2=0;L2<cs.length;L2++) {
    const top=[],bot=[];
    for(let k=0;k<=n;k++) { const t=k/n*reach,x=lerp(x0,x1,t),y=lerp(y0,y1,t)+Math.sin(t*10+s.t*28+L2)*(s.wob||5)*t,hw=(s.w||26)*(.18+.82*t)*(1-L2*.24)*(.9+.12*Math.sin(s.t*40+k+L2)); top.push([x,y-hw]); bot.push([x,y+hw]); }
    poly(top.concat(bot.reverse()),cs[L2]);
  }
};
SC.flames=(s,u)=>{
  const e=env(u,.15,.8),cs=s.cs||['#e0402e','#ff8c3a','#ffd166','#fff6c8']; if(e<=0) return; gfx.globalAlpha=Math.min(1,e*1.5);
  for(let L2=0;L2<3;L2++) for(let k=0;k<(s.n||7);k++) { const a=rr(s,k),x=s.x-s.w/2+(k+.5)*s.w/(s.n||7),h=(s.h||90)*e*(.55+.45*Math.sin(s.t*14+k*2.1+L2))*(1-L2*.28)*(.7+a*.5),ww=11-L2*3; poly([[x-ww,s.y],[x-ww*.4,s.y-h*.55],[x+(Math.sin(s.t*11+k)*5),s.y-h],[x+ww*.5,s.y-h*.5],[x+ww,s.y]],cs[L2]); }
};
SC.oven=(s,u)=>{
  const x0=262,y0=164,slide=ez(u/.14),ox=x0+(1-slide)*130,open=cl((u-.2)/.12),close=u>.86?cl((u-.86)/.1):0,o=open*(1-close);
  gfx.globalAlpha=u>.96?(1-u)/.04:1;
  R(ox-2,y0-2,84,102,OUT); R(ox,y0,80,98,'#e9e6dc'); R(ox,y0,80,18,'#c9c4b4');
  for(let k=0;k<4;k++) { E(ox+12+k*18,y0+9,5,5,OUT); E(ox+12+k*18,y0+9,3.6,3.6,k===1?'#d94a3a':'#6a6a6a'); }
  R(ox+8,y0+24,64,66,OUT);
  R(ox+10,y0+26,60,62,o>0?'#ff9a2a':'#2a2b30');
  if(o>0) { R(ox+10,y0+26,60,62,'#ff9a2a'); R(ox+16,y0+34,48,48,'#ffd166'); R(ox+26,y0+46,28,24,'#fff6c8'); for(let k=0;k<3;k++) R(ox+10,y0+44+k*14,60,2,'#a85a1a'); }
  const dw=Math.max(6,60*(1-o)); R(ox+10,y0+26,dw,62,OUT); R(ox+11,y0+27,Math.max(3,dw-2),60,o<.5?'#d8d4c6':'#bdb8a8');
  if(o<.5) { R(ox+16,y0+34,Math.max(2,dw-12),30,'#2a2b30'); R(ox+16,y0+34,Math.max(2,dw-12),8,'#4a4d58'); R(ox+14,y0+72,Math.max(2,dw-8),4,'#6a6a6a'); }
  R(ox+4,y0+98,8,6,OUT); R(ox+68,y0+98,8,6,OUT);
  if(u>.22&&u<.3) label('DING',ox+40,y0-16,'#ffe08a',3);
};
SC.waterjet=(s,u)=>{
  const h=battle.held,x0=h&&h.tx!=null?h.tx:s.x0,y0=h&&h.ty!=null?h.ty:s.y0,e=env(u,.1,.82),reach=cl(u/.18);
  if(e<=0) return; gfx.globalAlpha=Math.min(1,e*1.5);
  const x1=x0+(GX+30-x0)*reach,y1=y0+(GY-y0)*reach,cx=(x0+x1)/2,cy=Math.min(y0,y1)-26*reach;
  Qd(x0,y0,cx,cy,x1,y1,13*(.8+.2*Math.sin(s.t*40)),'#6fb4e8'); Qd(x0,y0,cx,cy,x1,y1,8,'#8fd0ff'); Qd(x0,y0-2,cx,cy-2,x1,y1-2,3,'#e6f7ff');
  for(let k=0;k<8;k++) { const t=((s.t*3+k/8)%1)*reach,px=lerp(x0,x1,t),py=lerp(y0,y1,t)-Math.sin(t/Math.max(.01,reach)*Math.PI)*24*reach; E(px,py,2,2.6,'#e6f7ff'); }
  if(reach>=1) for(let k=0;k<10;k++) { const a=k*.65+s.t*6,r=10+((s.t*70+k*9)%44); E(x1+Math.cos(a)*r,y1-Math.abs(Math.sin(a))*r*.9,2.4,3,k%2?'#e6f7ff':'#8fd0ff'); }
};
SC.puddle=(s,u)=>{ gfx.globalAlpha=env(u,.1,.9)*.85; const k=ez(u/.5)*(s.r||88); E(GX,266,k,k*.16,'#6fb4e8'); E(GX-8,265,k*.7,k*.1,'#9fd0f0'); };
SC.rainbow=(s,u)=>{
  gfx.globalAlpha=env(u,.2,.8)*.8; const cs=['#e0402e','#ff8c3a','#ffd166','#6cc070','#5c8fe0','#9a7fd0'];
  for(let k=0;k<cs.length;k++) { gfx.strokeStyle=cs[k]; gfx.lineWidth=6; gfx.beginPath(); gfx.arc(GX,262,86-k*6,Math.PI,Math.PI+Math.PI*ez(u/.4)); gfx.stroke(); }
};
SC.pipe=(s,u)=>{
  const h=battle.held,tx=h&&h.tx!=null?h.tx:360,ty=h&&h.ty!=null?h.ty:200,e=u>.88?(1-u)/.12:1; gfx.globalAlpha=e;
  const prog=cl(u/.7),pts=[],N=90; for(let k=0;k<=N;k++) { const t=k/N; let x,y; if(t<.55) { const a=t/.55*Math.PI*5.2,r=40*(1-t/.55)+4; x=GX+Math.cos(a)*r*1.1; y=206+Math.sin(a)*r*.8; } else { const q=(t-.55)/.45; x=GX-40+q*80; y=250+Math.sin(q*Math.PI*6)*7; } pts.push([x,y]); }
  const nowI=Math.floor(prog*N),head=pts[Math.min(nowI,N)];
  if(prog<1) Qd(tx,ty,(tx+head[0])/2,Math.min(ty,head[1])-22,head[0],head[1],6,'#ffb3d1');
  for(let k=0;k<=nowI;k++) { const p=pts[k]; E(p[0],p[1],6,6,'#d9709a'); }
  for(let k=0;k<=nowI;k++) { const p=pts[k]; E(p[0],p[1],5,5,'#ff9fc0'); E(p[0]-1.5,p[1]-1.5,2,2,'#ffe0ec'); }
};
SC.sprinkles=(s,u)=>{ const cs=['#ff6b8b','#ffe08a','#8fd0ff','#9be39a','#ffffff','#c9b3e6']; for(let k=0;k<40;k++) { const a=rr(s,k),b=rr(s,k+4),x=GX-64+a*128,y=-20+u*300*(.6+b*.5); if(y>262) continue; gfx.save(); gfx.translate(x,y); gfx.rotate(k+u*5); R(-3,-1,6,2,cs[k%6]); gfx.restore(); } };
SC.moon=(s,u)=>{
  gfx.globalAlpha=env(u,.1,.86); const x=466,y=64+Math.sin(u*3)*3;
  E(x,y,64,64,'rgba(255,240,170,.22)'); E(x,y,50,50,'rgba(255,240,170,.3)'); E(x,y,40,40,OUT); E(x,y,37,37,'#fff0b8'); E(x-9,y-6,8,8,'#e6cd88'); E(x+12,y+10,6,6,'#e6cd88'); E(x+8,y-16,4,4,'#e6cd88'); E(x-12,y+16,5,5,'#e6cd88');
  for(let k=0;k<14;k++) { const a=rr(s,k),b=rr(s,k+3); if(Math.floor(s.t*4+k)%3!==0) label('+',20+a*350,10+b*120,k%2?'#fff6c8':'#9fd8ff',2); }
};
SC.castline=(s,u)=>{
  const h=battle.held; if(!h||h.tx==null) return; const x0=h.tx,y0=h.ty,x1=s.ex,y1=s.ey;
  const out=cl(u/.28),yank=u>.55?cl((u-.55)/.2):0,fade=u>.88?(1-u)/.12:1; gfx.globalAlpha=fade;
  const ex=lerp(x0,x1,out),ey=lerp(y0,y1,out)-Math.sin(out*Math.PI)*70*(1-yank);
  const sag=out<1?(1-out)*40:6;
  Qd(x0,y0,(x0+ex)/2,Math.max(y0,ey)+sag-30*(1-out),ex,ey,2,'#fff6e0');
  if(out<1) E(ex,ey,5,5,'#dde'); else { const bob=Math.sin(s.t*9)*(yank?0:2); E(ex,ey-4+bob,6,6,OUT); E(ex,ey-4+bob,4.6,4.6,'#fff'); R(ex-4,ey-7+bob,8,3,'#e0402e'); R(ex-1,ey+1+bob,2,8,OUT); }
};
SC.reelline=(s,u)=>{
  const h=battle.held; if(!h||h.tx==null) return; const x0=h.tx,y0=h.ty,lift=battle.liftNow||0,x1=GX-18,y1=190-lift;
  gfx.globalAlpha=u>.9?(1-u)/.1:1; const j=Math.sin(s.t*50)*(u<.8?1.4:0);
  Ln(x0,y0,x1,y1+j,3,'#fff6e0'); E(x1,y1,6,6,'#dde'); R(x1-1,y1-2,2,10,OUT);
  if(lift<10&&u<.9) SC.ring({x:GX,y:268,r:90,c:'#bfe6ff',sq:.2},(s.t*1.4)%1,0);
};
SC.ghost=(s,u)=>{
  const m=battle.actorMouth||{x:340,y:150},e=env(u,.08,.9); gfx.globalAlpha=e*.92;
  const t=ez(cl((u-.15)/.55)),x=lerp(m.x,GX+8,t)+Math.sin(u*14)*8*(1-t),y=lerp(m.y,GY-18,t)-Math.sin(t*Math.PI)*40,sc=.35+Math.min(1,u*2.2)*1.0+(t>.9?.2:0);
  gfx.translate(x,y); gfx.scale(sc,sc);
  E(0,0,46,50,'rgba(160,120,255,.25)');
  gfx.beginPath(); gfx.moveTo(-34,40); gfx.lineTo(-34,-6); gfx.bezierCurveTo(-34,-52,34,-52,34,-6); gfx.lineTo(34,40); for(let k=0;k<4;k++) gfx.lineTo(34-(k+1)*17,k%2?40:26+Math.sin(s.t*12)*4); gfx.closePath();
  gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#f4f1ff'; gfx.fill();
  E(-12,-10,7,10,OUT); E(12,-10,7,10,OUT); E(0,12,9,13,OUT); E(-13,-12,2,3,'#fff'); E(11,-12,2,3,'#fff');
  Ln(-34,10,-52,22+Math.sin(s.t*9)*5,7,'#f4f1ff'); Ln(34,10,52,22-Math.sin(s.t*9)*5,7,'#f4f1ff');
};
SC.pepperburst=(s,u)=>{
  const x=s.x||GX,y=s.y||GY; gfx.globalAlpha=1-u*.9;
  for(let k=0;k<3;k++) { const r=10+u*(70+k*22); gfx.strokeStyle=['#ffd166','#ff8c3a','#e0402e'][k]; gfx.lineWidth=10-k*2-u*6; gfx.beginPath(); gfx.arc(x,y,r,0,Math.PI*2); gfx.stroke(); }
  for(let k=0;k<14;k++) { const a=k/14*Math.PI*2+rr(s,k),r=12+u*(60+rr(s,k+2)*50); E(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,5*(1-u*.6),5*(1-u*.6),k%2?'#ff8c3a':'#ffd166'); }
};
SC.steamears=(s,u)=>{
  const h=battle.actorMouth||{x:340,y:150}; gfx.globalAlpha=env(u,.1,.8);
  for(let k=0;k<5;k++) { const ph=(s.t*2.2+k/5)%1; label('~',h.x+22+(k%2)*10,h.y-18-ph*40,'rgba(255,200,180,.9)',2); label('~',h.x+4-(k%2)*8,h.y-30-ph*40,'rgba(255,200,180,.7)',2); }
  E(h.x+10,h.y-8,22,16,'rgba(224,64,46,.25)');
};
SC.wheel=(s,u)=>{
  gfx.globalAlpha=env(u,.08,.92); const x=GX,y=266;
  E(x,y+6,70,13,OUT); E(x,y+6,68,11,'#6a7078'); E(x,y,66,12,OUT); E(x,y,63,10,'#aeb3ba'); E(x,y-1,56,8,'#c9ced4');
  for(let k=0;k<8;k++) { const a=s.t*14+k*Math.PI/4,px=x+Math.cos(a)*50,py=y-1+Math.sin(a)*6; R(px-2,py-1,5,3,'#5e6670'); }
  for(let k=0;k<10;k++) { const a=rr(s,k),b=s.t*3+a,px=x+(k%2?1:-1)*(60+((b*80)%60)),py=y-6-Math.sin(((b*3)%1)*Math.PI)*30; E(px,py,2.6,3.2,'#b9a58a'); }
};
SC.bolt=(s,u)=>{
  const h=battle.held,bx=h&&h.jx!=null?h.jx:208,by=h&&h.jy!=null?h.jy:226; gfx.globalAlpha=u>.9?(1-u)/.1:1;
  const turn=u*Math.PI*1.4,pop=u>.72?(u-.72)*260:0;
  gfx.save(); gfx.translate(bx-pop*.6,by-pop*.5); gfx.rotate(turn);
  poly(Array.from({length:6},(_,k)=>[Math.cos(k*Math.PI/3)*17,Math.sin(k*Math.PI/3)*17]),'#aeb3ba',true); poly(Array.from({length:6},(_,k)=>[Math.cos(k*Math.PI/3)*10,Math.sin(k*Math.PI/3)*10]),'#808890'); E(0,0,4,4,OUT);
  gfx.restore();
  if(u>.1) for(let k=0;k<4;k++) if(Math.floor(u*20+k)%3===0) label('*',bx-14+k*8,by-22-k*3,'#ffe08a',2);
};
SC.kiln=(s,u)=>{
  const x0=264,y0=176,slide=ez(u/.14),ox=x0+(1-slide)*130,open=cl((u-.2)/.1);
  gfx.globalAlpha=u>.95?(1-u)/.05:1;
  R(ox+36,y0-26,14,34,OUT); R(ox+38,y0-24,10,30,'#8a4a3a');
  gfx.beginPath(); gfx.moveTo(ox-2,y0+90); gfx.lineTo(ox-2,y0+34); gfx.bezierCurveTo(ox-2,y0-14,ox+86,y0-14,ox+86,y0+34); gfx.lineTo(ox+86,y0+90); gfx.closePath(); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#b4573d'; gfx.fill();
  gfx.save(); gfx.clip(); for(let r=0;r<10;r++) for(let c=0;c<7;c++) R(ox+(r%2?0:-8)+c*14,y0+r*9,12,7,r%3?'#a84e36':'#c0634a'); gfx.restore();
  R(ox+20,y0+46,44,44,OUT); R(ox+22,y0+48,40,42,open>0?'#ffb030':'#3a3a40');
  if(open>0) { R(ox+26,y0+54,32,34,'#ffd166'); R(ox+32,y0+62,20,26,'#fff6c8'); }
  else { E(ox+42,y0+68,5,5,'#ff8c3a'); }
  R(ox+30,y0+10,24,12,OUT); R(ox+32,y0+12,20,8,'#2b2a26'); E(ox+42,y0+16,3,3,'#ffd166');
  R(ox-6,y0+90,92,8,OUT); R(ox-4,y0+92,88,5,'#6a6a6a');
  if(u>.2) label('CONE 6',ox+42,y0-38,'#ffe08a',2);
};
SC.vat=(s,u)=>{
  const rise=ez(u/.12),x=GX,y=290-rise*40; gfx.globalAlpha=u>.94?(1-u)/.06:1;
  gfx.beginPath(); gfx.moveTo(x-72,y-30); gfx.lineTo(x-66,y+30); gfx.lineTo(x+66,y+30); gfx.lineTo(x+72,y-30); gfx.closePath(); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#8a8f96'; gfx.fill();
  R(x-68,y-8,136,4,'#6a7078'); R(x-66,y+12,132,4,'#6a7078');
  E(x,y-30,72,12,OUT); E(x,y-30,69,10,'#7fb8d8'); E(x-16,y-30,34,7,'#6cc0a0'); E(x+30,y-31,22,5,'#9fd0ea'); E(x-30,y-33,10,2,'#ffffff');
};
SC.tongs=(s,u)=>{
  const lift=battle.liftNow||0; if(lift<=1&&u<.5) return; gfx.globalAlpha=u>.9?(1-u)/.1:1; const top=26-lift*.6;
  Ln(GX,-10,GX,top,3,OUT); E(GX,top,7,7,OUT); E(GX,top,5,5,'#aeb3ba');
  LnO(GX,top,GX-48,GY-lift+4,5,'#aeb3ba'); LnO(GX,top,GX+48,GY-lift+4,5,'#aeb3ba'); E(GX-48,GY-lift+4,5,5,OUT); E(GX+48,GY-lift+4,5,5,OUT);
};
SC.tapewrap=(s,u)=>{
  const h=battle.held,tx=h&&h.tx!=null?h.tx:340,ty=h&&h.ty!=null?h.ty:200;
  const k=cl(u/.7); gfx.globalAlpha=u>.86?(1-u)/.14:1;
  gfx.save(); gfx.beginPath(); gfx.ellipse(GX,GY+2,50,42,0,0,Math.PI*2); gfx.clip();
  for(let b=0;b<5;b++) { const q=cl(k*5-b); if(q<=0) continue; const y=140+b*30; gfx.save(); gfx.translate(GX,y+q*0); gfx.rotate(-.35+b*.16); R(-70,-7,140*q,14,OUT); R(-68,-5,136*q,10,'#b8bcc2'); R(-68,-5,136*q,3,'#d6d9de'); gfx.restore(); }
  gfx.restore();
  const cur=Math.min(4,Math.floor(k*5)); if(k<1) Qd(tx,ty,(tx+GX)/2,Math.min(ty,GY)-20,GX+36,150+cur*24,5,'#b8bcc2');
};
SC.gallery=(s,u)=>{
  // Curtains close over the Grump, part to show a framed spotlit sculpture, then a placard.
  const close=cl(u/.14),open=ez(cl((u-.28)/.16)),x0=64,x1=272,mid=(x0+x1)/2;
  gfx.globalAlpha=u>.93?(1-u)/.07:1;
  if(u>.3) { gfx.globalAlpha*=env(u,.3,.9)*.4; poly([[GX-10,0],[GX+10,0],[GX+80,262],[GX-80,262]],'#fff6c8'); gfx.globalAlpha=u>.93?(1-u)/.07:1; }
  if(u>.42) { const f=env(u,.42,.92); gfx.globalAlpha*=f; gfx.lineWidth=9; gfx.strokeStyle=OUT; gfx.strokeRect(GX-62,150,124,116); gfx.lineWidth=5; gfx.strokeStyle='#e8b84a'; gfx.strokeRect(GX-62,150,124,116); gfx.lineWidth=1.5; gfx.strokeStyle='#f9e08a'; gfx.strokeRect(GX-64,148,128,120); R(GX-34,270,68,14,OUT); R(GX-32,271,64,12,'#f4efe0'); label('UNTITLED',GX,273,'#2b2a26',1); label('GRUMP, CLAY',GX,279,'#6a6a6a',1); gfx.globalAlpha=u>.93?(1-u)/.07:1; }
  R(x0-4,0,x1-x0+8,14,OUT); R(x0-2,2,x1-x0+4,10,'#e8b84a');
  const w=(mid-x0)*(1-open*.85)*close;
  for(const sd of [-1,1]) { const bx=sd<0?x0:x1; const wd=sd<0?w:-w; gfx.fillStyle='#a8283a'; gfx.fillRect(bx,12,wd,250*close+0); gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.strokeRect(bx,12,wd,250*close); for(let f=1;f<5;f++) Ln(bx+wd*f/5,14,bx+wd*f/5,260*close,2,'#7a1626'); }
  if(u>.7) { const p=env(u,.7,.93); gfx.globalAlpha*=p; gfx.save(); gfx.translate(GX+54,166); gfx.rotate(-.3); R(-26,-9,52,18,OUT); R(-24,-7,48,14,'#e0402e'); label('SOLD',0,-3,'#fff8e8',2); gfx.restore(); }
};
RFX.SC=SC; RFX.HELD=HELD;
})();
