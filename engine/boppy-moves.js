'use strict';
// engine/boppy-moves.js: Boppy's Option 3 Primary kit (phase 4b), as set pieces on engine/stage.js (the standard from
// phase 4a on). His legacy moves stay in engine/recruit-moves.js; GRUMBLE's legacy animation is in engine/battle2-moves.js
// and hands over to grumbleShow below for the Option 3 version. Boppy walks over at his own pace (everybody else walks
// too fast), fishes, sits, eats one pepper, tells the 1970 story, and goes home.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix bp_.
// Loaded after engine/deedee-moves.js.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST,HELD=RFX.HELD;
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
const steam=(x,y,t,n=4,c='#fff6dc')=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.23)%1; gfx.globalAlpha=a0*(1-q); E(x-12+k*8+Math.sin(q*6+k)*4,y-q*34,4+q*3,4+q*3,c); } gfx.globalAlpha=a0; };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',RED='#e0402e',GREEN='#8ef0a0',CAP='#2f5a94',LEATHER='#7a4a2e',SEPIA='#f0dcb0';
ST.nw('bp_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});   // his sprite has blank rows above the cap
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';   // his own pace: walk, never run

// ---------- Shared scenes ----------
SC.bp_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.bp_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||38,s.ry||52,s.c||GOLD); };
SC.bp_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.bp_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.bp_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CREAM); } };
SC.bp_shield=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.7)*.9; ring(s.x,s.y,(s.rx||30)*g,(s.ry||44)*g,3,s.c||BLUE); gfx.globalAlpha*=.25; E(s.x,s.y,(s.rx||30)*g,(s.ry||44)*g,s.c||BLUE); };

// ---------- Cap Check ----------
SC.bp_cap=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.96);
  let ang=.25; if(ms>P.sw0&&ms<P.sw1) ang=lerp(.25,-1.5,ez((ms-P.sw0)/(P.sw1-P.sw0))); else if(ms>=P.sw1) ang=lerp(-1.5,.25,ez((ms-P.sw1)/350));
  if(ms<P.sw0) ang+=Math.sin(ms/90)*.06*(ms>P.fuss?1:0);
  HELD.cap({ang},u,h.x,h.y);
  if(ms>P.fuss&&ms<P.sw0) label('ADJUSTING',h.x,h.y-36,CREAM,1);
  if(ms>P.ok) { label('SAME ANGLE',h.x,h.y-40,GOLD,1); } };
B.cap_check=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,42),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1300,x:p.x,y:p.y,f:'hip'},{t:1700,f:'aim',dx:u=>-ez(u)*4},{t:1850,f:'throw',dx:-10},{t:2200,f:'act'},{t:2600,f:'hip'},{t:3000,f:back(p.x,me),hop:2,hn:6},{t:4100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. He appears to be adjusting his cap.'); say(m.id,'cap_check'); scene('bp_cap',3.0,{plan:{fuss:1300,sw0:1700,sw1:1950,ok:2350}}); }],
    [1700,()=>{ sfx.whoosh(); }],
    ['hf',1950],
    [1950,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('bp_poof',.5,{x:F.x+10,y:F.mid,c:BLUE,n:8}); scene('bp_text',1,{txt:'SWAT',x:F.x,y:F.top-8,c:GOLD,sc:2}); }],
    [2350,()=>{ sfx.select(); setMessage('The cap goes back to exactly the same angle.'); }],
    [4200,'end',res(E2)+'Boppy has noticed the attempted shortcut.']]); };

// ---------- GRUMBLE ----------
SC.bp_arrow=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y; if(ms<P.on) return; gfx.globalAlpha=fade(u,.9);
  const sq=ez((ms-P.stop)/260);
  if(sq<1) { const zip=Math.sin(ms/40)*4,w=lerp(120,8,sq); gfx.save(); gfx.translate(x+zip,y); gfx.scale(lerp(1,.1,sq),1);
    gfx.beginPath(); gfx.moveTo(60,-10); gfx.lineTo(-30,-10); gfx.lineTo(-30,-22); gfx.lineTo(-64,0); gfx.lineTo(-30,22); gfx.lineTo(-30,10); gfx.lineTo(60,10); gfx.closePath();
    gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#9be39a'; gfx.fill(); gfx.restore();
    if(sq<.2) { for(let k=0;k<3;k++) R(x+70+k*10+((ms/30+k*7)%10),y-12+k*12,14,2,'rgba(255,246,220,.8)'); label('WALKING SPEED',x,y-36,CREAM,1); } }
  else { const r=22; gfx.beginPath(); for(let k=0;k<8;k++) { const a=Math.PI/8+k*Math.PI/4; const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#d8343a'; gfx.fill(); label('STOP',x,y-3,CREAM,1); } };
B.grumbleShow=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,74),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'sit',dx:(u,tt)=>Math.sin(tt*3)*1},{t:1900,f:'aim',dx:u=>-ez(u)*4},{t:2300,f:'spread',dx:(u,tt)=>u<.2?Math.sin(tt*40)*2:0},{t:3400,f:'hip'},{t:3700,f:back(p.x,me),hop:2,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks out in front. Slowly. He sits down where everybody can see him.'); say(m.id,'grumble'); scene('bp_arrow',3.6,{plan:{x:Gp.x,y:Math.max(40,Gp.top-34),on:1200,stop:2300}}); }],
    [1300,()=>{ sfx.sulk&&sfx.sulk(); scene('bp_text',1.4,{st,txt:'TOO FAST',c:CREAM,sc:2}); setMessage('He points at the walking speed. It is wildly overenthusiastic.'); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.stun(); sfx.thud(); scene('bp_shield',1.2,{x:p.x,y:p.y-BH()*.45,rx:30,ry:46,c:GOLD}); }],
    [2700,()=>{ setMessage('The grumble squashes it into a stop sign. He braces in front.'); }],
    [3400,()=>{ setMessage('They all face him. He keeps one eye on his family.'); }],
    [4800,'end','The complaint is also a defensive formation.']]); };

// ---------- Patient Angler ----------
SC.bp_pond=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; const g=ez((ms-P.on)/300); gfx.globalAlpha=fade(u,.9)*g*.85; E(P.x,P.y,30*g,7*g,'#5f9fd8'); E(P.x-6,P.y-1,16*g,3*g,'#9fd0ff'); };
SC.bp_rod=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.97);
  let ang=1.4,bend=0;
  if(ms>P.sit&&ms<P.tug) ang=.5+Math.sin(ms/700)*.02;
  else if(ms>=P.tug&&ms<P.click) { const q=ez((ms-P.tug)/220); ang=lerp(.5,1.5,q); bend=.6*(1-ez((ms-P.tug-300)/400)); }
  else if(ms>=P.click) ang=lerp(1.5,.55,ez((ms-P.click)/300));
  if(ms>P.home) ang=1.4;
  const H={ang,len:96,bend}; HELD.rod(H,u,h.x,h.y);
  // the float and the line
  if(ms>P.sit&&ms<P.home) { let fx2=P.fx,fy=P.fy+Math.sin(ms/260)*1.2;
    if(ms>P.nudge&&ms<P.nudge+300) fy+=Math.sin((ms-P.nudge)/300*Math.PI)*5;
    if(ms>P.tug) { const q=ez((ms-P.tug)/350); fx2=lerp(P.fx,P.fx+40,q); fy=lerp(P.fy,P.fy-50,q)+Math.sin(q*Math.PI)*-20; }
    if(ms<P.tug+350) { gfx.strokeStyle='rgba(255,255,255,.75)'; gfx.lineWidth=1; gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.quadraticCurveTo((H.tx+fx2)/2,ms>P.tug?(H.ty+fy)/2:Math.max(H.ty,fy)+12,fx2,fy); gfx.stroke();
      EO(fx2,fy,4,5,CREAM); R(fx2-4,fy-1,8,3,RED); }
    if(ms>P.sit+200&&ms<P.nudge) label('PATIENCE',h.x,h.y-50,CREAM,1);
    if(ms>P.nudge&&ms<P.tug) label('NUDGE',P.fx,P.fy-28,CREAM,1); }
  if(ms>P.click&&ms<P.click+700) label('CLICK',h.x-10,h.y-46,GOLD,2); };
B.patient_angler=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,74),me=ST.unit(m);
  const plan={sit:1150,nudge:2000,tug:2500,click:3100,home:3500,fx:F.x+F.w*.5+14,fy:F.base-2};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1150,x:p.x,y:p.y,f:'sit'},{t:2500,f:'wind',dx:u=>ez(u)*6},{t:2850,f:'act',dx:6},{t:3100,f:'sit',dx:u=>6-ez(u)*6},{t:3500,f:back(p.x,me),hop:2,hn:6},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with his rod and sits down. The fish can wait for him.'); say(m.id,'patient_angler'); scene('bp_rod',3.6,{plan}); scene('bp_pond',3.5,{plan:{on:1100,x:plan.fx,y:plan.fy+3}}); }],
    [2000,()=>{ ST.jolt(f,.12); sfx.boop?sfx.boop():sfx.select(); setMessage(cap(f.def?f.def.the:'it')+' gets impatient and nudges the float.'); }],
    ['hf',2500],
    [2500,()=>{ sfx.whoosh(); sfx.splat(); ST.jolt(f,.45); landHit(100); scene('bp_poof',.6,{x:plan.fx,y:plan.fy,c:BLUE,n:10,r:30}); }],
    [3100,()=>{ sfx.select(); setMessage('He reels exactly one click and goes still again.'); }],
    [4600,'end',res(E2)+'The patience was a trap.']]); };

// ---------- Recliner Reservation ----------
const chair=(x,base,foot,sc=1)=>{ gfx.save(); gfx.translate(x,base); gfx.scale(sc,sc);
  R(-14,-4,3,6,OUT); R(12,-4,3,6,OUT);
  RO(-18,-62,22,46,LEATHER); R(-15,-58,16,40,'#8a5a36');
  RO(-18,-24,34,14,'#8a5a36'); RO(-22,-34,8,22,LEATHER); RO(12,-34,8,22,LEATHER);
  if(foot>0) RO(16,-20,26*foot,8,'#8a5a36');
  gfx.restore(); };
SC.bp_chair=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.drop) return; const d=ez((ms-P.drop)/450),y=lerp(P.y-140,P.y,d); gfx.globalAlpha=fade(u,.95);
  if(d<1) { gfx.globalAlpha*=.4; E(P.x,P.y,22*d+6,4,'#000'); gfx.globalAlpha=fade(u,.95); }
  chair(P.x,y,ez((ms-P.foot)/400));
  if(ms<P.card) { RO(P.x-20,y-74,40,12,CREAM); label('RESERVED',P.x,y-71,RED,1); }
  else if(ms<P.card+600) { const q=(ms-P.card)/600; gfx.save(); gfx.translate(P.x+q*70,y-74-Math.sin(q*Math.PI)*40); gfx.rotate(q*4); RO(-20,-6,40,12,CREAM); gfx.restore(); }
  if(ms>P.comfy&&ms<P.comfy+900) label('COMFY?',P.x,y-90,GOLD,2); };
B.recliner_reservation=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const deedee=!foe&&B2.party.find(p=>p.id==='deedee'&&p!==t&&b2Alive(p)),DU=deedee?ST.unit(deedee):null;
  const cx=Math.round(H.x-H.w*.5-6),cy=Math.min(316,H.base+2),sp={x:Math.min(560,H.x+H.w*.5+26),y:Math.min(316,H.base+3)};
  let K,end;
  if(self) { K=[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:'aim'},{t:1300,f:'act'},{t:1700,f:'hip'},{t:2200,f:'walk',hop:2,hn:3},{t:2700,x:cx+2,y:cy,f:'sit'},{t:3700,f:'sit'},{t:3900,f:'walkR',hop:2,hn:3},{t:4400,x:'home',y:'home',f:'idle'}]; end=4500; }
  else { K=[{t:0,x:'home',y:'home',f:amble(sp.x,me),hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'hip'},{t:1300,f:'aim'},{t:1700,f:'act'},{t:2000,f:'hip'},{t:2300,f:'kneel',dx:(u,tt)=>Math.sin(tt*10)*2},{t:3000,f:'celeb',hop:6},{t:3300,f:back(sp.x,me),hop:2,hn:6},{t:4300,x:'home',y:'home',f:'idle'}]; end=4400; }
  const st=ST.keys(fx,K);
  const plan={x:cx,y:cy,drop:self?300:900,card:self?1300:1700,foot:self?1700:2000,comfy:self?2800:2400},hit=self?2100:2200;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Boppy whistles. The recliner comes when called.':'Boppy walks over to '+t.name+'. The recliner follows him.'); say(m.id,'recliner_reservation'); scene('bp_chair',(end-100)/1000,{plan}); }],
    [plan.drop+450,()=>{ sfx.thud(); }],
    [plan.card,()=>{ sfx.whoosh(); setMessage(self?'He lifts the RESERVED card. For himself, this time.':'He lifts the RESERVED card off it. With visible reluctance.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('bp_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a'}); scene('bp_shield',1,{x:H.x,y:H.mid}); hopOf(t!==m?t:null); }],
    ...(DU?[[hit+250,()=>{ scene('bp_shield',1,{x:DU.x,y:DU.mid,c:ROSE}); scene('bp_heart',1,{x:DU.x,y:DU.top-4}); battle.fx[deedee.idx].hop=.3; sfx.ding(); }]]:[]),
    [plan.comfy,()=>{ setMessage(self?'He sits. Nobody else is allowed to. Today he makes an exception for himself.':'He adjusts the cushion until '+(foe?'it':t.name)+' is smiling.'+(DU?' Deedee gets cover too.':'')); }],
    [end,'end',kindLine(t,'The best seat is grudgingly available.')]]); };

// ---------- Headcount, Again ----------
SC.bp_count=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.9);
  P.list.forEach((q,k)=>{ if(ms<P.c0+k*P.step) return; const x=q.x,y=q.top-14,pop=ez((ms-P.c0-k*P.step)/150); EO(x,y,8*pop,8*pop,ms>P.reveal?'#ffe08a':CREAM); label(''+(k+1),x+1,y-2,'#2b2a26',1); });
  if(ms>P.extra) { const h=P.hx!=null?{x:P.hx,y:P.hy}:hand(); if(ms<P.cross+80) { P.hx=h.x; P.hy=h.y; } const x=P.hx,y=P.hy-30,pop=ez((ms-P.extra)/150); EO(x,y,8*pop,8*pop,CREAM); label(''+(P.list.length+1),x+1,y-2,'#2b2a26',1);
    if(ms>P.cross) { const q=ez((ms-P.cross)/200); Ln(x-10,y-10,lerp(x-10,x+10,q),lerp(y-10,y+10,q),3,RED); Ln(x+10,y-10,lerp(x+10,x-10,q),lerp(y-10,y+10,q),3,RED); }
    if(ms<P.cross) label('HIM?',x,y-20,CREAM,1); } };
B.headcount_again=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,62),me=ST.unit(m),n=list.length;
  const c0=1300,step=320,extra=c0+n*step+150,cross=extra+650,reveal=cross+350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim'},{t:c0,f:'aim',dx:(u,tt)=>-Math.sin(u*Math.PI)*6},{t:extra,f:'hip'},{t:cross,f:'act',dx:-4},{t:reveal,f:'aim'},{t:reveal+400,f:'celeb',hop:6},{t:reveal+800,f:back(p.x,me),hop:2,hn:6},{t:reveal+1800,x:'home',y:'home',f:'idle'}]);
  const plan={list:list.map(f=>ST.foe(f)),c0,step,extra,cross,reveal};
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Headcount. Nobody move while he counts.'); say(m.id,'headcount_again'); scene('bp_count',(reveal+1200)/1000,{plan}); }],
    ...list.map((f,k)=>[c0+k*step,()=>{ sfx.select(); ST.jolt(f,.08); }]),
    [extra,()=>{ sfx.boop?sfx.boop():sfx.select(); setMessage('One extra. His own pointing finger got into the count.'); }],
    [cross,()=>{ sfx.thud(); setMessage('He crosses himself out. Headcount, again.'); }],
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('bp_glow',.8,{x:q.x,y:q.mid,c:GOLD}); } }],
    [reveal+400,()=>{ setMessage('He gives the row a surprisingly friendly nod.'); }],
    [reveal+1900,'end','Boppy has included himself by mistake. Twice.']]); };

// ---------- Closing Time ----------
SC.bp_rail=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.94);
  // the CLOSED sign: in his hand, then set down
  const sign=(x,y)=>{ EO(x,y,13,13,CREAM); ring(x,y,10,10,1,'#2b2a26'); Ln(x,y,x,y-7,2,'#2b2a26'); Ln(x,y,x+5,y,2,'#2b2a26'); RO(x-18,y+14,36,9,RED); label('CLOSED',x,y+16,CREAM,1); };
  if(ms<P.set) { const h=hand(); sign(h.x-4,h.y-22); } else sign(P.sx,P.sy);
  if(ms<P.swing) return;
  const q=ez((ms-P.swing)/(P.hit-P.swing)),wob=ms>P.test&&ms<P.test+500?Math.sin((ms-P.test)/40)*.06:0,a=lerp(-Math.PI/2,0,q)+wob;
  const px=P.px,py=P.py; RO(px-3,py,6,P.base-py,'#c9a23a'); EO(px,py,5,5,'#f0d27a');
  gfx.save(); gfx.translate(px,py); gfx.rotate(Math.PI+a); RO(0,-5,P.len,10,'#c8463a'); for(let k=1;k<5;k++) R(P.len*k/5,-5,2,10,'#e8685a'); gfx.restore();
  if(ms>P.hit&&ms<P.hit+900) label('CLOSED',P.px-P.len*.5,P.py-30,GOLD,2); };
B.closing_time=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,56),me=ST.unit(m);
  const plan={set:2500,sx:F.x+F.w*.5+30,sy:F.base-22,swing:1700,hit:2050,test:2200,px:F.x+F.w*.5+12,py:F.mid-6,base:F.base,len:Math.max(50,F.w+10)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim'},{t:1700,f:'throw',dx:-8},{t:2200,f:'act',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2600,f:'hip'},{t:3000,f:back(p.x,me),hop:2,hn:6},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and checks a small clock-shaped sign. CLOSED.'); say(m.id,'closing_time'); scene('bp_rail',3.8,{plan}); }],
    [1700,()=>{ sfx.whoosh(); setMessage('A padded rail swings across the dangerous plan.'); }],
    ['hf',2050],
    [2050,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.45); landHit(100); }],
    [2200,()=>{ setMessage('He tests the rail once, then folds his arms.'); }],
    [4100,'end',res(E2)+'The plan has missed its opening hours.']]); };

// ---------- Everybody Waits ----------
SC.bp_ticket=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.95);
  if(ms<P.pull+200) { const h=hand(); RO(h.x-10,h.y-14,14,16,'#d8343a'); R(h.x-8,h.y-18,10,4,CREAM); if(ms>P.pull-400) label('TAKE A NUMBER',h.x,h.y-34,CREAM,1); }
  if(ms<P.pull) return;
  const q=ez((ms-P.pull)/(P.unroll-P.pull)),top=P.y0,len=(P.y1-P.y0)*q,x=P.x;
  RO(x-9,top,18,Math.max(2,len),CREAM); for(let y=top+6;y<top+len-4;y+=12) R(x-9,y,2,2,'#c9c2b8');
  const word=['F','A','M','I','L','Y',' ','F','I','R','S','T'],gap=(P.y1-P.y0-16)/word.length;
  word.forEach((ch,k)=>{ const y=top+8+k*gap; if(y<top+len-4) label(ch,x,y,RED,1); });
  if(ms>P.unroll) { const g=ez((ms-P.unroll)/300); gfx.globalAlpha*=.12*g; R(x+9,top,P.wide,P.y1-P.y0,'#9fc4f0'); } };
B.everybody_waits=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const lx=foe?Math.round(U[0].x+U[0].w*.5+18):Math.round(Math.min(...U.map(q=>q.x-q.w*.5))-16);
  const y0=Math.max(20,Math.min(...U.map(q=>q.top))-14),y1=Math.min(318,Math.max(...U.map(q=>q.base))+6);
  const sx=foe?Math.min(560,lx+34):Math.max(30,lx-30),sy=Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+4);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(sx,me),hop:2,hn:6},{t:1100,x:sx,y:sy,f:'aim'},{t:1700,f:'throw',dx:foe?-6:6},{t:2600,f:'spread'},{t:3400,f:'hip'},{t:3700,f:back(sx,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  const plan={pull:1700,unroll:2500,x:lx,y0,y1,wide:foe?0:Math.max(...U.map(q=>q.x+q.w*.5))-lx};
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Boppy walks over to '+foe.name+' with an absurdly small ticket dispenser.':'Boppy walks out in front of the family with an absurdly small ticket dispenser.'); say(m.id,'everybody_waits'); scene('bp_ticket',4.2,{plan}); }],
    [1700,()=>{ sfx.select(); sfx.whoosh(); setMessage('He pulls one ticket. It keeps unrolling.'); }],
    ['hf',2500],
    [2500,()=>{ E2.apply(); sfx.ding(); for(const u of who) { const q=ST.unit(u); if(!foe) scene('bp_shield',1.2,{x:q.x,y:q.mid,c:BLUE}); scene('bp_glow',.9,{x:q.x,y:q.mid,c:'#9fd8ff'}); hopOf(u!==m?u:null); } }],
    [2700,()=>{ setMessage(foe?'The ticket says FAMILY FIRST. It makes room anyway.':'The ticket says FAMILY FIRST, before any number. He ushers everyone behind it.'); }],
    [4700,'end',foe?kindLine(foe):'The grumble has become a clear priority.']]); };

// ---------- One Pepper, Sensible Size ----------
SC.bp_pepper=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st,h=hand(); gfx.globalAlpha=fade(u,.96);
  const pep=(x,y,sc,rot=1.1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.rotate(rot); E(0,0,7,16,OUT); E(0,0,5.4,14.4,'#e0402e'); E(2,2,2.4,10,'#a82a1e'); E(-2,-4,1.6,6,'#ff9a80'); R(-2,-22,4,7,OUT); R(-1,-21,2,5,'#4f8a3a'); gfx.restore(); };
  if(ms<P.eat) { pep(h.x-8,h.y-10,.55); if(ms>P.measure) { Ln(h.x-18,h.y-24,h.x-18,h.y+2,2,CREAM); Ln(h.x+2,h.y-24,h.x+2,h.y+2,2,CREAM); label('SENSIBLE',h.x-8,h.y-38,CREAM,1); } }
  else if(ms<P.eat+300&&st&&st.x!=null) { const q=ez((ms-P.eat)/300),mo=head(st,14); pep(lerp(h.x-8,mo.x-6,q),lerp(h.y-10,mo.y,q),.55*(1-q*.6)); }
  if(ms>P.ears&&ms<P.ears+1300&&st&&st.x!=null) { const p=head(st,-6); steam(p.x-16,p.y,s.t,3,'#ffd0b0'); steam(p.x+18,p.y,s.t+.4,3,'#ffd0b0'); if(ms>P.ears+200) label('!',p.x+20,p.y-30,RED,2); }
  if(ms>P.sus) { pep(h.x-8,h.y-12,.4,.4+Math.sin(ms/200)*.1); label('SUSPICIOUS',h.x-8,h.y-34,CREAM,1); } };
const kettle=(x,y)=>{ EO(0+x,0+y,10,8,CREAM); R(x-6,y-11,12,4,OUT); R(x-4,y-10,8,2,CREAM); gfx.save(); gfx.translate(x-9,y-2); gfx.rotate(-.6); RO(-8,-2,8,4,CREAM); gfx.restore(); R(x+6,y-4,6,2,OUT); };
B.sensible_pepper=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,52),me=ST.unit(m);
  const plan={measure:1300,eat:1800,ears:2100,puff:2500,hit:2850,sus:3100};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'hip'},{t:1300,f:'aim'},{t:1800,f:'act'},{t:2100,f:'hip',dx:(u,tt)=>Math.sin(tt*36)*1.5},{t:2500,f:'throw',dx:-6},{t:3100,f:'aim'},{t:3600,f:back(p.x,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with one very small pepper.'); say(m.id,'sensible_pepper'); scene('bp_pepper',3.7,{plan,st}); }],
    [1300,()=>{ setMessage('He measures it between two fingers. Sensible size.'); }],
    [1800,()=>{ sfx.select(); setMessage('He tastes it.'); }],
    [2100,()=>{ sfx.stun(); setMessage('The pepper has its own opinion of sensible.'); }],
    [2500,()=>{ const mo=head(st,14); ST.fly((x,y)=>kettle(x,y),mo.x-10,mo.y,F.x+8,F.mid,.35,20); sfx.whoosh(); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('bp_poof',.6,{x:F.x+8,y:F.mid,c:'#ffb070',n:10,r:30}); scene('bp_text',1,{txt:'WHEW',x:F.x,y:F.top-8,c:'#ffb070',sc:2}); }],
    [3100,()=>{ setMessage('He looks at the rest of the pepper with deep personal suspicion.'); }],
    [4700,'end',res(E2)+'The pepper has its own opinion of sensible.']]); };

// ---------- Seeds of Trouble ----------
SC.bp_packet=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.pocket) return; gfx.globalAlpha=fade(u,.96);
  const tap=ms>P.t0&&ms<P.t1?Math.abs(Math.sin((ms-P.t0)/(P.t1-P.t0)*Math.PI*3))*6:0,shake=ms>P.shake&&ms<P.pocket?Math.sin(ms/30)*3:0;
  const x=h.x-10+shake,y=h.y-20+tap; RO(x-11,y-14,22,28,'#f6e2b8'); R(x-11,y-14,22,6,'#4f8a3a'); label('HOT',x,y-2,RED,1); E(x,y+8,4,3,'#e0402e');
  if(ms>P.show&&ms<P.t0) label('HOMEGROWN',x,y-30,GOLD,1);
  if(ms>P.shake+200) { E(x+16,y+14,2,3,'#f0d27a'); label('ONE LEFT',x,y-30,CREAM,1); } };
B.seeds_of_trouble=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,66),me=ST.unit(m);
  const plan={show:1100,t0:1700,t1:2300,shake:2700,pocket:3200},hit=2300;
  const aims=[0,1,2].map(k=>{ const f=list[k%list.length],q=ST.foe(f); return {x:q.x+(list.length<3?(k-1)*14:0),y:q.mid}; });
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'celeb'},{t:1700,f:'act',dx:(u,tt)=>Math.sin(tt*20)*2},{t:2300,f:'aim'},{t:2700,f:'kneel'},{t:3200,f:'hip'},{t:3500,f:back(p.x,me),hop:2,hn:6},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and shows off a seed packet. Handwritten label. HOT.'); say(m.id,'seeds_of_trouble'); scene('bp_packet',3.3,{plan}); }],
    ...aims.map((a,k)=>[1750+k*120,()=>{ const h=hand(); ST.fly((x,y,uu)=>{ E(x,y,4,5,'#ffb04a'); E(x,y,2,3,'#fff1b0'); },h.x-10,h.y-20,a.x,a.y,.45,30); sfx.whoosh(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); sfx.splat(); all(list); landHit(100); for(const a of aims) scene('bp_poof',.6,{x:a.x,y:a.y,c:'#ffb04a',n:8}); }],
    [2700,()=>{ setMessage('He shakes the packet. One seed left. He pockets it carefully.'); sfx.select(); }],
    [4600,'end',res(E2)+'The crop is performing above expectations.']]); };

// ---------- Mild for Company ----------
SC.bp_pot=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.give) return; gfx.globalAlpha=fade(u,.96);
  const x=h.x-10,y=h.y-6; EO(x,y+4,14,9,'#c9c2b8'); E(x,y-2,11,3,'#e88a4a'); steam(x,y-4,s.t,3,'#ffd9a0');
  const flip=cl((ms-P.flip)/400),sc=Math.cos(flip*Math.PI); gfx.save(); gfx.translate(x,y-26); gfx.scale(Math.abs(sc),1); RO(-14,-6,28,12,CREAM); label(sc>0?'HOT':'MILD',0,-3,sc>0?RED:'#2f6b3a',1); gfx.restore();
  if(ms>P.test&&ms<P.test+500) { RO(x+10,y-16,4,14,'#c9c2b8'); label('TINY',x+12,y-40,CREAM,1); } };
B.mild_for_company=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,26),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:'aim'},{t:1200,f:'act'},{t:1700,f:'throw'},{t:2400,f:'celeb',hop:6},{t:2900,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:amble(sp.x,me),hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'aim'},{t:1700,f:'act'},{t:2200,f:'throw',dx:-6},{t:2700,f:'celeb',hop:6},{t:3100,f:back(sp.x,me),hop:2,hn:6},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={flip:self?400:1200,test:self?1200:1700,give:self?1700:2200},hit=plan.give+350,end=self?3100:4200;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Boppy turns the label on his broth around. HOT. Then MILD.':'Boppy walks over to '+t.name+' with a pot of broth.'); say(m.id,'mild_for_company'); scene('bp_pot',(plan.give+100)/1000,{plan}); }],
    [plan.flip,()=>{ sfx.select(); if(!self) setMessage('He turns the label around. HOT becomes MILD, in careful handwriting.'); }],
    [plan.test,()=>{ setMessage('He tests one tiny spoonful like a safety inspector.'); }],
    [plan.give,()=>{ const h=hand(); ST.fly((x,y)=>{ EO(x,y,8,5,'#c9c2b8'); E(x,y-2,6,2,'#e88a4a'); },h.x-10,h.y-6,H.x+(self?-30:6),H.mid,.35,24); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('bp_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('bp_glow',.9,{x:H.x,y:H.mid,c:'#ffd9a0'}); hopOf(t!==m?t:null); }],
    [hit+300,()=>{ setMessage('The label was accurate. Boppy looks relieved.'); }],
    [end,'end',kindLine(t,'The warning label has been honestly adjusted.')]]); };

// ---------- In Nineteen Seventy ----------
SC.bp_1970=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.92);
  if(ms>P.stool-100) { const x=P.sx,y=P.sy; R(x-12,y-14,24,4,WOOD); Ln(x-10,y-10,x+8,y,3,'#8a5a30'); Ln(x+10,y-10,x-8,y,3,'#8a5a30'); }
  if(ms>P.card) { const d=ez((ms-P.card)/400),y=lerp(-40,P.cy,d),x=P.cx; RO(x-62,y-26,124,52,SEPIA); R(x-58,y-22,116,44,'#e8cf98'); label('1970',x,y-12,'#5a3a1a',4); }
  if(ms>P.card2) { const d=ez((ms-P.card2)/350),x=lerp(P.cx+260,P.cx,d),y=P.cy+44; RO(x-58,y-10,116,20,CREAM); label('FIRST SOME CONTEXT',x,y-3,'#5a3a1a',1); }
  if(ms>P.chairs) for(const q of P.list) { const g=ez((ms-P.chairs)/300),x=q.x+q.w*.5+4,y=q.base; gfx.save(); gfx.translate(x,y); gfx.scale(g,g); RO(-6,-16,12,4,WOOD); R(-6,-12,2,12,'#8a5a30'); R(4,-12,2,12,'#8a5a30'); RO(4,-28,2,14,'#8a5a30'); gfx.restore(); }
  if(ms>P.also&&ms<P.also+900) { const h=hand(); label('ALSO',h.x,h.y-40,GOLD,2); } };
B.nineteen_seventy=E2=>{ const {m,fx}=E2,list=foes(E2).length?foes(E2):b2LiveFoes(),Gp=ST.group(list),p=rowSpot(Gp,84),me=ST.unit(m);
  const plan={stool:1000,sx:p.x,sy:p.y,card:1500,card2:2200,chairs:2800,also:3400,cx:Gp.x,cy:Math.max(40,Gp.top-58),list:list.map(f=>ST.foe(f))},hit=2800;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1000,x:p.x,y:p.y,f:'sit'},{t:1300,f:'aim'},{t:2200,f:'sit',dx:(u,tt)=>Math.sin(tt*5)*1},{t:3400,f:'aim'},{t:3900,f:'sit'},{t:4100,f:back(p.x,me),hop:2,hn:6},{t:5100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and sits down. This takes a while.'); say(m.id,'nineteen_seventy'); scene('bp_1970',4.6,{plan}); }],
    [1300,()=>{ setMessage('He raises one finger. A title card arrives.'); }],
    [1500,()=>{ sfx.thud(); }],
    [2200,()=>{ sfx.whoosh(); setMessage('Then a second card. The introduction has introductory remarks.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('bp_heart',.9,{x:q.x,y:q.top-4,r:5}); } }],
    [3000,()=>{ setMessage('Every enemy finds a little chair and settles in.'); }],
    [3400,()=>{ sfx.select(); setMessage('He prepares another finger.'); }],
    [5200,'end','The story has not started yet. Everyone is waiting for it.']]); };

// ---------- Jar-Lid Negotiations ----------
SC.bp_jar=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.96);
  const lid=(x,y,a=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-12,-4,24,8,'#c9a23a'); R(-10,-2,20,2,'#f0d27a'); gfx.restore(); };
  const x=h.x-10,y=h.y-4;
  if(ms<P.pop) { const shake=ms>P.strain?Math.sin(ms/25)*1.5:0; RO(x-11+shake,y-12,22,26,'#cfe8ee'); R(x-8+shake,y-4,16,14,'#e0402e'); lid(x+shake,y-16,ms>P.strain?Math.sin(ms/30)*.1:0); if(ms>P.strain) label('TIGHT',x,y-36,CREAM,1); return; }
  RO(x-11,y-12,22,26,'#cfe8ee'); R(x-8,y-4,16,14,'#e0402e');
  if(ms<P.guard) { const q=ez((ms-P.pop)/(P.guard-P.pop)); lid(lerp(x,x-30,q),y-16-Math.sin(q*Math.PI)*60,q*12); }
  else { lid(x-14,y-30,-1.2); if(ms>P.guard+100) label('EASY',x-14,y-56,GOLD,2); } };
SC.bp_ringwave=(s,u)=>{ const q=ez(u/.6); gfx.globalAlpha=fade(u,.5)*(1-q*.5); ring(s.x,s.y,s.rx*(.3+q*.8),s.ry*(.3+q*.8),6,'#f0d27a'); ring(s.x,s.y,s.rx*(.2+q*.6),s.ry*(.2+q*.6),3,CREAM); };
B.jar_lid_negotiations=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,50),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],Gh=ST.group(hitList);
  const plan={strain:1500,pop:2400,guard:2900};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'hip'},{t:1500,f:'act',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2400,f:'throw',dx:-6},{t:2900,f:'spread'},{t:3500,f:'hip'},{t:3800,f:back(p.x,me),hop:2,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with a stubborn jar. The lid is one pixel too tight.'); say(m.id,'jar_lid_negotiations'); scene('bp_jar',4.0,{plan}); }],
    [1500,()=>{ setMessage('He was being polite before.'); sfx.charge&&sfx.charge(); }],
    ['hf',plan.pop],
    [plan.pop,()=>{ sfx.thud(); sfx.bonk(); all(hitList); landHit(100); scene('bp_ringwave',.9,{x:Gh.x,y:(Gh.top+Gh.base)/2,rx:Gh.w*.5+30,ry:(Gh.base-Gh.top)*.5+14}); }],
    [2900,()=>{ sfx.select(); setMessage('He holds up the lid as a small guard. It was easy. Apparently.'); }],
    [4900,'end',res(E2)+'The lid accepts the revised terms.']]); };
})();
