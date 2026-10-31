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
    const pw=PROPART.draw('boppy/walking_speed_sign',2,12,{h:86});   // painted sign; the drawn arrow is the fallback
    if(!pw) { gfx.beginPath(); gfx.moveTo(60,-10); gfx.lineTo(-30,-10); gfx.lineTo(-30,-22); gfx.lineTo(-64,0); gfx.lineTo(-30,22); gfx.lineTo(-30,10); gfx.lineTo(60,10); gfx.closePath();
    gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#9be39a'; gfx.fill(); }
    gfx.restore();
    if(sq<.2) { for(let k=0;k<3;k++) R(x+70+k*10+((ms/30+k*7)%10),y-12+k*12,14,2,'rgba(255,246,220,.8)'); if(!pw) label('WALKING SPEED',x,y-36,CREAM,1); } }
  else { if(PROPART.draw('boppy/stop_sign',x,y+10,{h:74})) return; const r=22; gfx.beginPath(); for(let k=0;k<8;k++) { const a=Math.PI/8+k*Math.PI/4; const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#d8343a'; gfx.fill(); label('STOP',x,y-3,CREAM,1); } };
B.grumbleShow=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,74),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'sit',dx:(u,tt)=>Math.sin(tt*3)*1},{t:1900,f:'aim',dx:u=>-ez(u)*4},{t:2300,f:'spread',dx:(u,tt)=>u<.2?Math.sin(tt*40)*2:0},{t:3400,f:'hip'},{t:3700,f:back(p.x,me),hop:2,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks out in front. Slowly. He sits down where everybody can see him.'); say(m.id,'grumble'); scene('bp_arrow',3.6,{plan:{x:Gp.x,y:Math.max(40,Gp.top-34),on:1200,stop:2300}}); }],
    [1300,()=>{ sfx.sulk&&sfx.sulk(); scene('bp_text',1.4,{st,txt:'TOO FAST',c:CREAM,sc:2}); setMessage('He points at the walking speed. It\'s wildly overenthusiastic.'); }],
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
  if(ms>P.stool-100) { const x=P.sx,y=P.sy; if(PROPART.draw('boppy/stool',x,y-14,{h:34})) {} else { R(x-12,y-14,24,4,WOOD); Ln(x-10,y-10,x+8,y,3,'#8a5a30'); Ln(x+10,y-10,x-8,y,3,'#8a5a30'); } }
  if(ms>P.card) { const d=ez((ms-P.card)/400),y=lerp(-40,P.cy,d),x=P.cx; if(!PROPART.draw('boppy/1970_card',x,y,{w:116})) { RO(x-62,y-26,124,52,SEPIA); R(x-58,y-22,116,44,'#e8cf98'); label('1970',x,y-12,'#5a3a1a',4); } }
  if(ms>P.card2) { const d=ez((ms-P.card2)/350),x=lerp(P.cx+260,P.cx,d),y=P.cy+44; RO(x-58,y-10,116,20,CREAM); label('FIRST SOME CONTEXT',x,y-3,'#5a3a1a',1); }
  if(ms>P.chairs) for(const q of P.list) { const g=ez((ms-P.chairs)/300),x=q.x+q.w*.5+4,y=q.base; gfx.save(); gfx.translate(x,y); gfx.scale(g,g); if(!PROPART.draw('boppy/folding_chair',0,-17,{h:34})) { RO(-6,-16,12,4,WOOD); R(-6,-12,2,12,'#8a5a30'); R(4,-12,2,12,'#8a5a30'); RO(4,-28,2,14,'#8a5a30'); } gfx.restore(); }
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
    [5200,'end','The story hasn\'t started yet. Everyone is waiting for it.']]); };

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

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Boppy's review: things Boppy actually does (wears that cap, fishes, counts heads like the Rikers deputy warden he was,
// eats one pepper too many, pickles ghost peppers). One big readable moment per move, props 2 to 3x larger.
// New on the same numbers: Cap Swat (basic, key cap_swat: the cap comes off and he swats like it is a mosquito),
// Lockdown (A4, key lockdown: cell bars slam down, keys jangle), Pepper Breath (B1, key pepper_breath: a cone of pepper
// fire), Five-Alarm Jar (B5, key five_alarm_jar: his pickled ghost peppers set off the alarm). Kept, bigger: Patient
// Angler (splash and reel), Headcount, Again (big numbers), Seeds of Trouble (pepper sparks); Everybody Waits and Mild
// for Company keep their pieces with larger props. Scenes prefix bv_ (no warp). The older functions above stay.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST,HELD=RFX.HELD;
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const steam=(x,y,t,n=4,c='#fff6dc',h=40)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.23)%1; gfx.globalAlpha=a0*(1-q); E(x-(n-1)*5+k*10+Math.sin(q*6+k)*5,y-q*h,5+q*5,5+q*5,c); } gfx.globalAlpha=a0; };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',BLUE='#9fc4f0',WATER='#7cc4f4',IRON='#4a4f58',IRONL='#8a929e',BRASS='#d8b24a',CAPC='#525053',GHOST='#f4f1ff';
ST.nw('bv_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});   // the cap brim line; his rig has blank rows above it
const mouth=st=>{ const sp=st.sp,fr=st.frame,q=sp&&sp.mouthAt&&fr&&sp.mouthAt.get(fr);   // painted frames know where their mouth is
  if(q) { const sc=sp.scale*(st.sc||1); return {x:st.x-fr[0].length*sc/2+q.col*sc,y:st.y-fr.length*sc+q.row*sc}; }
  return {x:st.x-10,y:st.y-BH()*(st.sc||1)*.53}; };
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.bv_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.bv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; } const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.bv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.bv_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,3,s.c||CREAM); } };
SC.bv_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.bv_shield=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.7)*.9; ring(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,4,s.c||BLUE); gfx.globalAlpha*=.25; E(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,s.c||BLUE); };
SC.bv_smoke=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const q=cl(u*1.2-k*.05); if(q<=0) continue; gfx.globalAlpha=(1-q)*.75; E(s.x-24+k*8+Math.sin(k*3+q*5)*6,s.y-q*(s.h||50),7+q*9,7+q*9,s.c||'#6a6460'); } };
if(!sfx.clang) sfx.clang=(d=0)=>{ tone({type:'square',f0:520,f1:470,dur:.55,vol:.13,delay:d,filter:2400}); tone({type:'triangle',f0:1310,dur:.7,vol:.08,delay:d}); noise({dur:.25,vol:.26,delay:d,f0:3200,f1:900}); };
if(!sfx.jangle) sfx.jangle=(d=0,n=6)=>{ for(let k=0;k<n;k++) tone({type:'triangle',f0:2300+((k*577)%900),dur:.07,vol:.07,delay:d+k*.07}); };
if(!sfx.siren) sfx.siren=(d=0)=>{ for(let k=0;k<4;k++) tone({type:'sawtooth',f0:k%2?660:880,f1:k%2?880:660,dur:.3,vol:.08,delay:d+k*.3,filter:1800,sweep:'lin'}); for(let k=0;k<12;k++) tone({type:'square',f0:1900,dur:.035,vol:.05,delay:d+k*.06}); };
if(!sfx.crunch) sfx.crunch=(d=0)=>{ noise({dur:.11,vol:.3,delay:d,f0:2600,f1:900}); noise({dur:.1,vol:.25,delay:d+.13,f0:2200,f1:800}); };
if(!sfx.flame) sfx.flame=(d=0,dur=.8)=>{ noise({dur,vol:.28,delay:d,f0:400,f1:1500,type:'lowpass'}); tone({type:'sawtooth',f0:90,f1:60,dur,vol:.08,delay:d,filter:300}); };

// Bare-headed frames for Cap Swat: the cap pixels become a bald dome with his grey fringe at the back (made once).
const BARE=['act','throw','aim','hip','wind'];
const bareRows=fr=>{ const rows=fr.map(r=>r.split('')),r21=fr[21]; let c0=99,c1=-1; for(let x=0;x<r21.length;x++) if(r21[x]!=='.') { c0=Math.min(c0,x); c1=Math.max(c1,x); }
  const cx=Math.round((c0+c1)/2)+1,hw=r=>{ const q=(22.8-r)/8.8; return Math.round(10.5*Math.sqrt(Math.max(0,1-q*q))); };
  for(let r=11;r<=22;r++) for(let x=c0-4;x<=c1+3;x++) if(rows[r][x]!==undefined) rows[r][x]='.';
  for(let r=14;r<=22;r++) { const w=hw(r),wp=hw(r-1); if(w<2) continue;
    for(let x=cx-w;x<=cx+w;x++) { let ch='o'; if(x===cx-w||x===cx+w||r===14||Math.abs(x-cx)>wp) ch='a'; else if(r<=17&&x<cx-1&&x>cx-6) ch='p'; else if(x>cx+3&&r>=18) ch=(x+r)%3===0?'j':'g'; else if(x<cx-7&&r>=20) ch='g'; rows[r][x]=ch; } }
  return rows.map(r=>r.join('')); };
const ensureBare=()=>{ const sp=BSP(); if(sp.bare_act) return; for(const k of BARE) { const fr=bareRows(sp[k]); sp['bare_'+k]=fr; if(sp.eyeAt) sp.eyeAt.set(fr,sp.eyeAt.get(sp[k])); if(sp.handAt) sp.handAt.set(fr,sp.handAt.get(sp[k])); } };

// ---------- Cap Swat (basic; key cap_swat; same numbers as Cap Check) ----------
// He walks over, takes the cap off (bald head, grey fringe), and swats at the monster like it is a mosquito: miss, miss, SWAT.
const bigCap=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  poly([[-4,4],[-40,2],[-42,9],[-6,10]],'#403b3c',2.5); EO(-12,-2,15,11,CAPC); E(-15,-6,8,4,'#68676c'); Ln(-18,-1,-6,-3,2,'#d2d1d1'); Ln(-14,1,-8,2,1.5,'#d2d1d1'); E(-12,-13,2.5,2,'#68676c'); gfx.restore(); };
SC.bv_cap=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.off||ms>P.on) return; const h=hand(); let ang=-1.25;
  for(const [a,b] of P.sw) { if(ms>=a&&ms<b) ang=lerp(-1.25,.55,ez((ms-a)/(b-a))); else if(ms>=b&&ms<b+200) ang=lerp(.55,-1.25,ez((ms-b)/200)); }
  if(ms>=P.sw[2][1]) ang=lerp(.55,.15,ez((ms-P.sw[2][1])/300));
  if(ms<P.off+200) ang=lerp(-2.4,-1.25,ez((ms-P.off)/200));
  gfx.globalAlpha=1; bigCap(h.x+4,h.y,ang,1.9);
  const st=s.st; if(st&&st.x!=null&&ms<P.off+600) { const p=head(st,8),q=(ms-P.off)/600; gfx.globalAlpha=1-q; Ln(p.x-8-q*4,p.y-8,p.x-8+q*4,p.y-8,2,'#ffffff'); Ln(p.x-8,p.y-12-q*4,p.x-8,p.y-12+q*4,2,'#ffffff'); } };
SC.bv_dodge=(s,u)=>{ const ms=s.t*1000,P=s.P,f=s.f; if(!f) return;
  const q1=cl((ms-P.d1)/450),q2=cl((ms-P.d2)/450);
  if(q1>0&&q1<1) lift(f,Math.sin(q1*Math.PI)*16,0,0); else if(q2>0&&q2<1) lift(f,0,-Math.sin(q2*Math.PI)*.18,-Math.sin(q2*Math.PI)*18); };
B.cap_swat=E2=>{ ensureBare(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const sw=[[1800,1950],[2150,2300],[2500,2650]],hit=2650;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1200,x:p.x,y:p.y,f:'hip'},{t:1450,f:'bare_act'},
    {t:1800,f:'bare_throw',dx:-6},{t:1950,f:'bare_act'},{t:2150,f:'bare_throw',dx:-8},{t:2300,f:'bare_act'},{t:2500,f:'bare_throw',dx:u=>-6-ez(u)*8},{t:2950,f:'bare_hip'},
    {t:3200,f:'hip'},{t:3450,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. Something is pestering his family.'); say(m.id,'cap_swat'); scene('bv_cap',3.3,{st,P:{off:1450,on:3200,sw}}); scene('bv_dodge',2.6,{f,P:{d1:1850,d2:2200}}); }],
    [1450,()=>{ sfx.select(); setMessage('He takes the cap off. Here we go.'); }],
    [1800,()=>{ sfx.whoosh(); }],
    [1950,()=>{ setMessage('Swat! Missed.'); scene('bv_text',.6,{x:F.x,y:F.top-20,txt:'MISS',c:CREAM,sc:2}); }],
    [2150,()=>{ sfx.whoosh(); }],
    [2300,()=>{ setMessage('Swat! Missed again. It\'s quick.'); scene('bv_text',.6,{x:F.x-16,y:F.top-20,txt:'MISS',c:CREAM,sc:2}); }],
    [2500,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('bv_rings',.5,{x:F.x+8,y:F.mid,c:CREAM,r:40}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SWAT!',c:GOLD,sc:4}); }],
    [3200,()=>{ sfx.select(); setMessage('The cap goes back on. Same angle as always.'); }],
    [4500,'end',res(E2)+'Like a mosquito. A big one.']]); };

// ---------- Patient Angler (A1, kept: bigger splash and reel) ----------
SC.bv_pond=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.on) return; const g=ez((ms-P.on)/300); gfx.globalAlpha=fade(u,.9)*g*.9;
  if(!PROPART.draw('boppy/pond',P.x,P.y-6,{w:128*g,h:70*g})) { E(P.x,P.y,56*g,13*g,'#4f8fc8'); E(P.x-8,P.y-2,34*g,6*g,'#8fc8f4'); } for(let k=0;k<2;k++) { const q=(s.t*.7+k*.5)%1; gfx.globalAlpha=fade(u,.9)*g*(1-q)*.8; ring(P.x,P.y,10+q*48,3+q*11,2,'#d8f0ff'); } };
SC.bv_rod=(s,u)=>{ const ms=s.t*1000,P=s.P,h=hand(); gfx.globalAlpha=fade(u,.97);
  let ang=1.4,bend=0;
  if(ms>P.sit&&ms<P.tug) ang=.5+Math.sin(ms/700)*.02;
  else if(ms>=P.tug&&ms<P.reel1) { const q=ez((ms-P.tug)/220); ang=lerp(.5,1.55,q); bend=.8*(1-ez((ms-P.tug-300)/400)); }
  else if(ms>=P.reel1) ang=lerp(1.55,1.1,ez((ms-P.reel1)/300));
  if(ms>P.home) ang=1.4;
  const PN=!!BSP().x_sit1,H={ang,len:132,bend}; if(PN) { H.tx=h.x; H.ty=h.y; } else HELD.rod(H,u,h.x,h.y);   // painted fishing poses already hold the rod; h is its tip
  if(ms>P.reel0&&ms<P.reel1+200) { const cx=h.x-6,cy=h.y+14,a=(ms-P.reel0)/70; if(!PN) { EO(cx,cy,13,13,'#aeb3ba'); E(cx,cy,5,5,'#5e6670'); LnO(cx,cy,cx+Math.cos(a)*16,cy+Math.sin(a)*16,3,'#d8dce2'); EO(cx+Math.cos(a)*16,cy+Math.sin(a)*16,4,4,RED); }
    if(ms>P.reel0+150) bigWord('REEL REEL',cx,h.y-58,GOLD,2); }
  if(ms>P.sit&&ms<P.home) { let fx2=P.fx,fy=P.fy+Math.sin(ms/260)*1.5;
    if(ms>P.nudge&&ms<P.nudge+300) fy+=Math.sin((ms-P.nudge)/300*Math.PI)*7;
    if(ms>P.tug) { const q=ez((ms-P.tug)/350); fx2=lerp(P.fx,P.fx+50,q); fy=lerp(P.fy,P.fy-70,q); }
    if(ms<P.tug+350) { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.quadraticCurveTo((H.tx+fx2)/2,ms>P.tug?(H.ty+fy)/2:Math.max(H.ty,fy)+14,fx2,fy); gfx.stroke();
      if(!PROPART.draw('boppy/bobber',fx2+3,fy-6,{h:32})) { EO(fx2,fy,7,9,CREAM); R(fx2-7,fy-2,14,5,RED); } }
    else { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=2; const ty=P.ft+ (ms<P.reel1?0:-ez((ms-P.reel1)/300)*10); gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.lineTo(P.fx+10,ty); gfx.stroke(); }
    if(ms>P.sit+200&&ms<P.nudge) bigWord('PATIENCE',h.x-30,h.y-58,CREAM,2);
    if(ms>P.nudge&&ms<P.tug) bigWord('NUDGE',P.fx,P.fy-34,CREAM,2); } };
SC.bv_splash=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=fade(u,.6);
  for(let k=0;k<16;k++) { const a=Math.PI*(1.06+k/15*.88),sp=56+(k%4)*16,q=ez(u*1.4),px=x+Math.cos(a)*sp*q*.9,py=y+Math.sin(a)*sp*q*1.5+u*u*90; EO(px,py,4,6,k%2?WATER:'#d8f0ff'); }
  const col=Math.sin(cl(u*1.6)*Math.PI); if(col>0) { E(x,y-col*40,14,col*44,'#bfe6ff'); E(x,y-col*40,8,col*34,'#ffffff'); }
  gfx.globalAlpha=fade(u,.5)*.8; ring(x,y,20+u*60,5+u*14,3,'#d8f0ff'); };
SC.bv_yank=(s,u)=>{ const ms=s.t*1000,q=cl(ms/700); if(q<1) lift(s.f,-Math.sin(q*Math.PI)*34,Math.sin(q*Math.PI*2)*.25,Math.sin(q*Math.PI)*14); };
B.patient_angler=E2=>{ const FA=!!BSP().x_sit1; const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,84),me=ST.unit(m);
  const P={sit:1150,nudge:2000,tug:2500,reel0:2850,reel1:3500,home:3700,fx:F.x+F.w*.5+20,fy:F.base-2,ft:F.mid};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1150,x:p.x,y:p.y,f:FA?'x_fish1':'sit'},{t:1450,f:FA?'x_sit1':'sit'},{t:1850,f:FA?'x_sit2':'sit'},{t:2200,f:FA?'x_sit1':'sit'},{t:2500,f:FA?'x_fish4':'wind',dx:u=>ez(u)*8},{t:2850,f:FA?((u,tt)=>Math.floor(tt*7)%2?'x_fish3':'x_fish2'):'act',dx:(u,tt)=>6+Math.sin(tt*30)*2},{t:3500,f:'celeb',hop:6},{t:3800,f:back(p.x,me),hop:2,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with his rod and sits down. The fish can wait for him.'); say(m.id,'patient_angler'); scene('bv_rod',3.8,{P}); scene('bv_pond',3.7,{P:{on:1100,x:P.fx,y:P.fy+3}}); }],
    [2000,()=>{ ST.jolt(f,.12); sfx.boop?sfx.boop():sfx.select(); setMessage(cap(f.def?f.def.the:'it')+' gets impatient and nudges the float.'); }],
    ['hf',2500],
    [2500,()=>{ sfx.whoosh(); sfx.splat(); ST.jolt(f,.5); landHit(100); scene('bv_splash',1.1,{x:P.fx,y:P.fy}); scene('bv_yank',.8,{f}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SPLASH!',c:'#bfe6ff',sc:4}); setMessage('Hook set! The whole pond jumps.'); }],
    [2850,()=>{ for(let k=0;k<6;k++) tone({type:'square',f0:900,dur:.03,vol:.06,delay:k*.1}); setMessage('He reels it in. Slow and steady. His pace.'); }],
    [3500,()=>{ sfx.ding(); }],
    [4900,'end',res(E2)+'The patience was a trap.']]); };

// ---------- Headcount, Again (A3, kept: big numbers over each enemy) ----------
SC.bv_count=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9);
  const badge=(x,y,n,pop,c)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); EO(0,0,17,17,c); label(''+n,1,-7,OUT,3); gfx.restore(); };
  P.list.forEach((q,k)=>{ const t0=P.c0+k*P.step; if(ms<t0) return; const a=(ms-t0)/180,pop=a<1?ez(a)*1.3:lerp(1.3,1,cl(a-1)); badge(q.x,q.top-30,k+1,pop,ms>P.reveal?GOLD:CREAM); });
  const st=s.st; if(ms>P.extra&&st&&st.x!=null) { if(ms<P.cross+80) { const p=head(st,-26); P.hx=p.x; P.hy=p.y; } const x=P.hx,y=P.hy,a=(ms-P.extra)/180,pop=a<1?ez(a)*1.3:lerp(1.3,1,cl(a-1)); badge(x,y,P.list.length+1,pop,CREAM);
    if(ms>P.cross) { const q=ez((ms-P.cross)/200); LnO(x-16,y-16,lerp(x-16,x+16,q),lerp(y-16,y+16,q),4,RED); LnO(x+16,y-16,lerp(x+16,x-16,q),lerp(y-16,y+16,q),4,RED); }
    if(ms<P.cross) bigWord('HIM?',x,y-36,CREAM,2); } };
B.headcount_again=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,62),me=ST.unit(m),n=list.length;
  const c0=1300,step=360,extra=c0+n*step+150,cross=extra+650,reveal=cross+350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim'},{t:c0,f:'aim',dx:(u,tt)=>-Math.sin(u*Math.PI)*6},{t:extra,f:'hip'},{t:cross,f:'act',dx:-4},{t:reveal,f:'aim'},{t:reveal+400,f:'celeb',hop:6},{t:reveal+800,f:back(p.x,me),hop:2,hn:6},{t:reveal+1800,x:'home',y:'home',f:'idle'}]);
  const P={list:list.map(f=>ST.foe(f)),c0,step,extra,cross,reveal,gx:Gp.x,gy:Math.max(40,Gp.top-74)};
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Headcount. Nobody move while he counts.'); say(m.id,'headcount_again'); scene('bv_count',(reveal+1300)/1000,{P,st}); }],
    ...list.map((f,k)=>[c0+k*step,()=>{ sfx.select(); ST.jolt(f,.1); lift(f,-6); }]),
    [extra,()=>{ sfx.boop?sfx.boop():sfx.select(); setMessage('One extra. He counted himself.'); }],
    [cross,()=>{ sfx.thud(); setMessage('He crosses himself out. Headcount, again.'); }],
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('bv_glow',.8,{x:q.x,y:q.mid,c:GOLD}); } }],
    [reveal+400,()=>{ setMessage('Everybody is accounted for. He gives the row a friendly nod.'); }],
    [reveal+1900,'end','Boppy has included himself by mistake. Twice.']]); };

// ---------- Lockdown (A4; key lockdown; same numbers as Closing Time) ----------
// The Rikers deputy warden: he points, cell bars slam down around the monster, he jangles his big key ring and locks it.
const keyRing=(x,y,t,shake)=>{ const sw=Math.sin(t*(shake?28:6))*(shake?.5:.2); ring(x,y,12,12,5,OUT); ring(x,y,12,12,3,BRASS);
  for(let k=0;k<4;k++) { const a=Math.PI*(.25+k*.17)+sw*(1+k*.3),kx=x+Math.cos(a)*12,ky=y+Math.sin(a)*12,ex=kx+Math.cos(a)*24,ey=ky+Math.sin(a)*24; LnO(kx,ky,ex,ey,4,k%2?'#c9ced6':BRASS); LnO(ex,ey,ex+Math.cos(a+1.4)*6,ey+Math.sin(a+1.4)*6,3,k%2?'#c9ced6':BRASS); } };
SC.bv_cell=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.94);
  const h=hand(); if(ms<P.turn) keyRing(h.x-6,h.y+4,s.t,ms>P.jang&&ms<P.turn);
  if(ms<P.drop) return;
  const d=ez((ms-P.drop)/(P.slam-P.drop)),bounce=ms>P.slam?Math.sin(cl((ms-P.slam)/250)*Math.PI)*-6:0,oy=lerp(-(P.base+30),0,d*d)+bounce;
  const w=P.x1-P.x0,n=6;
  gfx.save(); gfx.translate(0,oy);
  for(let k=0;k<n;k++) { const x=P.x0+k*w/(n-1); RO(x-4,P.top,8,P.base-P.top,IRON); R(x-2,P.top+2,2,P.base-P.top-4,IRONL); }
  RO(P.x0-10,P.top-12,w+20,14,IRON); R(P.x0-8,P.top-10,w+16,3,IRONL); for(let k=0;k<5;k++) EO(P.x0-4+k*(w+8)/4,P.top-5,2.5,2.5,IRONL);
  RO(P.x0-6,P.base-8,w+12,8,IRON);
  const lx=P.x1-4,ly=(P.top+P.base)/2; RO(lx-10,ly-14,20,26,BRASS); E(lx,ly-3,3,3,OUT); R(lx-1,ly-1,3,8,OUT);
  gfx.restore();
  if(ms>P.turn&&ms<P.turn+900) { const q=ez((ms-P.turn)/250),kx=P.x1+4,ky=(P.top+P.base)/2-3; gfx.save(); gfx.translate(kx,ky); gfx.rotate(-q*Math.PI/2); if(!PROPART.draw('boppy/big_key',20,0,{h:36,rot:Math.PI/4})) { LnO(0,0,26,0,4,BRASS); EO(30,0,7,7,BRASS); E(30,0,3,3,OUT); } gfx.restore(); bigWord('CLICK',kx+10,ky-30,CREAM,2); }
  if(ms>P.slam&&ms<P.slam+1300) { const q=(ms-P.slam)/1300; gfx.globalAlpha=(1-q)*.22*(Math.sin(q*Math.PI*6)>0?1:.3); R(0,0,576,324,'#ff2a2a'); } };
B.lockdown=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,70),me=ST.unit(m);
  const P={jang:2200,drop:1500,slam:1800,turn:2700,x0:F.x-F.w*.5-12,x1:F.x+F.w*.5+12,top:Math.max(26,F.top-18),base:F.base+4};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim',dx:u=>-ez(u)*6},{t:1500,f:'spread'},{t:1900,f:'hip'},{t:2200,f:'act',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2700,f:'throw',dx:-6},{t:3000,f:'hip'},{t:3400,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Keys jingling. The deputy warden is on duty.'); say(m.id,'lockdown'); scene('bv_cell',4.3,{P}); sfx.jangle(0,4); }],
    [1100,()=>{ setMessage('He points. YOU.'); scene('bv_text',1,{st,txt:'YOU.',c:CREAM,sc:2}); }],
    [1500,()=>{ sfx.whoosh(); setMessage('Cell bars come down out of nowhere.'); }],
    ['hf',P.slam],
    [P.slam,()=>{ sfx.clang(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('bv_big',1.3,{x:F.x,y:F.top-74,txt:'LOCKDOWN!',c:'#ff6a5a',sc:4}); }],
    [P.jang,()=>{ sfx.jangle(0,8); setMessage('He jangles his big key ring. Very slowly.'); }],
    [P.turn,()=>{ sfx.click?sfx.click():sfx.select(); setMessage('Click. That plan isn\'t going anywhere.'); }],
    [4500,'end',res(E2)+'Nobody gets out on his watch.']]); };

// ---------- Everybody Waits (A5, kept: the dispenser and the FAMILY FIRST ticket are bigger) ----------
SC.bp_ticket=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.95);
  if(ms<P.pull+200) { const h=hand(); RO(h.x-18,h.y-22,26,30,'#d8343a'); R(h.x-14,h.y-28,18,6,CREAM); EO(h.x-5,h.y-8,4,4,'#a82a2a'); if(ms>P.pull-500) bigWord('TAKE A NUMBER',h.x,h.y-50,CREAM,2); }
  if(ms<P.pull) return;
  const q=ez((ms-P.pull)/(P.unroll-P.pull)),top=P.y0,len=(P.y1-P.y0)*q,x=P.x;
  RO(x-15,top,30,Math.max(2,len),CREAM); for(let y=top+6;y<top+len-4;y+=14) { R(x-15,y,3,2,'#c9c2b8'); R(x+12,y,3,2,'#c9c2b8'); }
  const word=['F','A','M','I','L','Y',' ','F','I','R','S','T'],gap=(P.y1-P.y0-16)/word.length,sc=gap>=12?2:1;
  word.forEach((ch,k)=>{ const y=top+6+k*gap; if(y<top+len-sc*5) label(ch,x,y,RED,sc); });
  if(ms>P.unroll) { const g=ez((ms-P.unroll)/300); gfx.globalAlpha*=.14*g; R(x+15,top,P.wide,P.y1-P.y0,'#9fc4f0'); } };

// ---------- Pepper Breath (B1; key pepper_breath; same numbers as One Pepper, Sensible Size) ----------
// One homegrown cayenne at lunch. Crunch. His face goes red, steam comes out of his ears, and he breathes a cone of fire.
const cayenne=(x,y,rot,sc,c='#e0402e')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  if(c==='#e0402e'&&PROPART.draw('boppy/cayenne_pepper',0,0,{h:50})) { gfx.restore(); return; }   // painted; other colours stay drawn
  gfx.beginPath(); gfx.moveTo(-3,-14); gfx.quadraticCurveTo(10,-4,6,10); gfx.quadraticCurveTo(2,20,-6,24); gfx.quadraticCurveTo(-2,12,-6,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill();
  Ln(0,-8,3,6,1.5,'rgba(255,255,255,.6)'); RO(-5,-19,6,5,'#4f8a3a'); R(-3,-24,2,6,'#3f7a2a'); gfx.restore(); };
SC.bv_pepper=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st); gfx.globalAlpha=1;   // the painted frames hold the pepper themselves
  if(ms>P.show&&ms<P.eat) bigWord('HOMEGROWN',mo.x+4,mo.y-62,GOLD,2);
  if(ms>P.eat+200&&ms<P.eat+800) bigWord('CRUNCH',mo.x-6,mo.y-48,CREAM,2);
  if(ms>P.red&&ms<P.fire) { steam(mo.x+16,mo.y-24,s.t,3,'#ffd0b0',34); steam(mo.x+40,mo.y-26,s.t+.4,3,'#ffd0b0',34); } };
SC.bv_cone=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st),tx=P.tx,ty=P.ty,dx=tx-mo.x,dy=ty-mo.y,L=Math.hypot(dx,dy)+30,a0=Math.atan2(dy,dx);
  const grow=ez(ms/220),shrink=u>.8?(1-u)/.2:1,len=L*grow,spread=lerp(.1,.3,ez(ms/500))*shrink;
  const layer=(f,c,jit)=>{ const pts=[[mo.x,mo.y]]; for(let k=0;k<=8;k++) { const q=k/8,a=a0+lerp(-spread,spread,q)*f,r=len*(.92+.08*Math.sin(s.t*40+k*1.7))+Math.sin(s.t*55+k*2.3)*jit; pts.push([mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r]); } gfx.globalAlpha=shrink*.95; poly(pts,c,f===1?3:0); };
  layer(1,'#e0402e',8); layer(.7,'#ff8a2a',6); layer(.38,'#ffe070',4);
  for(let k=0;k<10;k++) { const q=((s.t*2.2)+k/10)%1,a=a0+Math.sin(k*2.1)*spread*.8,r=len*q; gfx.globalAlpha=(1-q)*shrink; E(mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r-q*10,3+q*4,3+q*4,k%2?'#ffd040':'#ff6a2a'); } };
B.pepper_breath=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,100),me=ST.unit(m);
  const P={show:1350,eat:1700,red:1950,fire:2400,done:3500,tx:F.x+F.w*.15,ty:F.mid},hit=2600;
  const wk=(R)=>(u,t)=>'pb_'+(Math.floor(t*6)%2?'walkB':'walkA')+R;   // painted walk, left-facing going out, mirrored coming back
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:p.x<me.x?wk(''):wk('R'),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'pb_present'},{t:1300,f:'pb_admire'},{t:1550,f:'pb_raise'},{t:1700,f:'pb_crunch'},
    {t:1850,f:'pb_chew'},{t:1950,f:'pb_burn',dx:(u,tt)=>Math.sin(tt*40)*2},{t:2150,f:'pb_fan',dx:(u,tt)=>Math.sin(tt*40)*2},{t:2350,f:'pb_inhale'},
    {t:2400,f:'pb_breathA',dx:u=>-ez(u*4)*8},{t:2500,f:'pb_breathB'},{t:2600,f:'pb_breathC'},{t:3200,f:'pb_gasp'},{t:3450,f:'pb_grumble',dx:(u,tt)=>Math.sin(tt*30)*1.5},
    {t:3800,f:'pb_smug'},{t:4050,f:p.x<me.x?wk('R'):wk(''),hop:2,hn:6},{t:5000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with one homegrown cayenne pepper.'); say(m.id,'pepper_breath'); scene('bv_pepper',3.6,{P,st}); }],
    [1300,()=>{ setMessage('He holds it up. He grew it himself. He\'s very proud of it.'); }],
    [1900,()=>{ sfx.crunch(); setMessage('Crunch.'); }],
    [1950,()=>{ sfx.stun(); setMessage('His face goes red. Steam comes out of his ears.'); }],
    [2400,()=>{ sfx.flame(0,1.0); scene('bv_cone',1.1,{P,st}); setMessage('HAAAH! A cone of pepper fire!'); }],
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('bv_big',1.2,{x:F.x,y:F.top-74,txt:'HAAAH!',c:'#ffb040',sc:4}); }],
    [3300,()=>{ sfx.sulk&&sfx.sulk(); scene('bv_smoke',1.2,{x:F.x,y:F.mid,h:56}); scene('bv_text',1.2,{st,txt:'MY STOMACH',c:CREAM,sc:2}); setMessage('Ooh. His stomach has notes.'); }],
    [5100,'end',res(E2)+'He did warn everybody at lunch.']]); };

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
  if(ms>P.stool-100) { const x=P.sx,y=P.sy; if(PROPART.draw('boppy/stool',x,y-14,{h:34})) {} else { R(x-12,y-14,24,4,WOOD); Ln(x-10,y-10,x+8,y,3,'#8a5a30'); Ln(x+10,y-10,x-8,y,3,'#8a5a30'); } }
  if(ms>P.card) { const d=ez((ms-P.card)/400),y=lerp(-40,P.cy,d),x=P.cx; if(!PROPART.draw('boppy/1970_card',x,y,{w:116})) { RO(x-62,y-26,124,52,SEPIA); R(x-58,y-22,116,44,'#e8cf98'); label('1970',x,y-12,'#5a3a1a',4); } }
  if(ms>P.card2) { const d=ez((ms-P.card2)/350),x=lerp(P.cx+260,P.cx,d),y=P.cy+44; RO(x-58,y-10,116,20,CREAM); label('FIRST SOME CONTEXT',x,y-3,'#5a3a1a',1); }
  if(ms>P.chairs) for(const q of P.list) { const g=ez((ms-P.chairs)/300),x=q.x+q.w*.5+4,y=q.base; gfx.save(); gfx.translate(x,y); gfx.scale(g,g); if(!PROPART.draw('boppy/folding_chair',0,-17,{h:34})) { RO(-6,-16,12,4,WOOD); R(-6,-12,2,12,'#8a5a30'); R(4,-12,2,12,'#8a5a30'); RO(4,-28,2,14,'#8a5a30'); } gfx.restore(); }
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
    [5200,'end','The story hasn\'t started yet. Everyone is waiting for it.']]); };

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

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Boppy's review: things Boppy actually does (wears that cap, fishes, counts heads like the Rikers deputy warden he was,
// eats one pepper too many, pickles ghost peppers). One big readable moment per move, props 2 to 3x larger.
// New on the same numbers: Cap Swat (basic, key cap_swat: the cap comes off and he swats like it is a mosquito),
// Lockdown (A4, key lockdown: cell bars slam down, keys jangle), Pepper Breath (B1, key pepper_breath: a cone of pepper
// fire), Five-Alarm Jar (B5, key five_alarm_jar: his pickled ghost peppers set off the alarm). Kept, bigger: Patient
// Angler (splash and reel), Headcount, Again (big numbers), Seeds of Trouble (pepper sparks); Everybody Waits and Mild
// for Company keep their pieces with larger props. Scenes prefix bv_ (no warp). The older functions above stay.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST,HELD=RFX.HELD;
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const steam=(x,y,t,n=4,c='#fff6dc',h=40)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.23)%1; gfx.globalAlpha=a0*(1-q); E(x-(n-1)*5+k*10+Math.sin(q*6+k)*5,y-q*h,5+q*5,5+q*5,c); } gfx.globalAlpha=a0; };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',BLUE='#9fc4f0',WATER='#7cc4f4',IRON='#4a4f58',IRONL='#8a929e',BRASS='#d8b24a',CAPC='#525053',GHOST='#f4f1ff';
ST.nw('bv_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});   // the cap brim line; his rig has blank rows above it
const mouth=st=>{ const sp=st.sp,fr=st.frame,q=sp&&sp.mouthAt&&fr&&sp.mouthAt.get(fr);   // painted frames know where their mouth is
  if(q) { const sc=sp.scale*(st.sc||1); return {x:st.x-fr[0].length*sc/2+q.col*sc,y:st.y-fr.length*sc+q.row*sc}; }
  return {x:st.x-10,y:st.y-BH()*(st.sc||1)*.53}; };
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.bv_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.bv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; } const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.bv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.bv_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,3,s.c||CREAM); } };
SC.bv_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.bv_shield=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.7)*.9; ring(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,4,s.c||BLUE); gfx.globalAlpha*=.25; E(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,s.c||BLUE); };
SC.bv_smoke=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const q=cl(u*1.2-k*.05); if(q<=0) continue; gfx.globalAlpha=(1-q)*.75; E(s.x-24+k*8+Math.sin(k*3+q*5)*6,s.y-q*(s.h||50),7+q*9,7+q*9,s.c||'#6a6460'); } };
if(!sfx.clang) sfx.clang=(d=0)=>{ tone({type:'square',f0:520,f1:470,dur:.55,vol:.13,delay:d,filter:2400}); tone({type:'triangle',f0:1310,dur:.7,vol:.08,delay:d}); noise({dur:.25,vol:.26,delay:d,f0:3200,f1:900}); };
if(!sfx.jangle) sfx.jangle=(d=0,n=6)=>{ for(let k=0;k<n;k++) tone({type:'triangle',f0:2300+((k*577)%900),dur:.07,vol:.07,delay:d+k*.07}); };
if(!sfx.siren) sfx.siren=(d=0)=>{ for(let k=0;k<4;k++) tone({type:'sawtooth',f0:k%2?660:880,f1:k%2?880:660,dur:.3,vol:.08,delay:d+k*.3,filter:1800,sweep:'lin'}); for(let k=0;k<12;k++) tone({type:'square',f0:1900,dur:.035,vol:.05,delay:d+k*.06}); };
if(!sfx.crunch) sfx.crunch=(d=0)=>{ noise({dur:.11,vol:.3,delay:d,f0:2600,f1:900}); noise({dur:.1,vol:.25,delay:d+.13,f0:2200,f1:800}); };
if(!sfx.flame) sfx.flame=(d=0,dur=.8)=>{ noise({dur,vol:.28,delay:d,f0:400,f1:1500,type:'lowpass'}); tone({type:'sawtooth',f0:90,f1:60,dur,vol:.08,delay:d,filter:300}); };

// Bare-headed frames for Cap Swat: the cap pixels become a bald dome with his grey fringe at the back (made once).
const BARE=['act','throw','aim','hip','wind'];
const bareRows=fr=>{ const rows=fr.map(r=>r.split('')),r21=fr[21]; let c0=99,c1=-1; for(let x=0;x<r21.length;x++) if(r21[x]!=='.') { c0=Math.min(c0,x); c1=Math.max(c1,x); }
  const cx=Math.round((c0+c1)/2)+1,hw=r=>{ const q=(22.8-r)/8.8; return Math.round(10.5*Math.sqrt(Math.max(0,1-q*q))); };
  for(let r=11;r<=22;r++) for(let x=c0-4;x<=c1+3;x++) if(rows[r][x]!==undefined) rows[r][x]='.';
  for(let r=14;r<=22;r++) { const w=hw(r),wp=hw(r-1); if(w<2) continue;
    for(let x=cx-w;x<=cx+w;x++) { let ch='o'; if(x===cx-w||x===cx+w||r===14||Math.abs(x-cx)>wp) ch='a'; else if(r<=17&&x<cx-1&&x>cx-6) ch='p'; else if(x>cx+3&&r>=18) ch=(x+r)%3===0?'j':'g'; else if(x<cx-7&&r>=20) ch='g'; rows[r][x]=ch; } }
  return rows.map(r=>r.join('')); };
const ensureBare=()=>{ const sp=BSP(); if(sp.bare_act) return; for(const k of BARE) { const fr=bareRows(sp[k]); sp['bare_'+k]=fr; if(sp.eyeAt) sp.eyeAt.set(fr,sp.eyeAt.get(sp[k])); if(sp.handAt) sp.handAt.set(fr,sp.handAt.get(sp[k])); } };

// ---------- Cap Swat (basic; key cap_swat; same numbers as Cap Check) ----------
// He walks over, takes the cap off (bald head, grey fringe), and swats at the monster like it is a mosquito: miss, miss, SWAT.
const bigCap=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  poly([[-4,4],[-40,2],[-42,9],[-6,10]],'#403b3c',2.5); EO(-12,-2,15,11,CAPC); E(-15,-6,8,4,'#68676c'); Ln(-18,-1,-6,-3,2,'#d2d1d1'); Ln(-14,1,-8,2,1.5,'#d2d1d1'); E(-12,-13,2.5,2,'#68676c'); gfx.restore(); };
SC.bv_cap=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.off||ms>P.on) return; const h=hand(); let ang=-1.25;
  for(const [a,b] of P.sw) { if(ms>=a&&ms<b) ang=lerp(-1.25,.55,ez((ms-a)/(b-a))); else if(ms>=b&&ms<b+200) ang=lerp(.55,-1.25,ez((ms-b)/200)); }
  if(ms>=P.sw[2][1]) ang=lerp(.55,.15,ez((ms-P.sw[2][1])/300));
  if(ms<P.off+200) ang=lerp(-2.4,-1.25,ez((ms-P.off)/200));
  gfx.globalAlpha=1; bigCap(h.x+4,h.y,ang,1.9);
  const st=s.st; if(st&&st.x!=null&&ms<P.off+600) { const p=head(st,8),q=(ms-P.off)/600; gfx.globalAlpha=1-q; Ln(p.x-8-q*4,p.y-8,p.x-8+q*4,p.y-8,2,'#ffffff'); Ln(p.x-8,p.y-12-q*4,p.x-8,p.y-12+q*4,2,'#ffffff'); } };
SC.bv_dodge=(s,u)=>{ const ms=s.t*1000,P=s.P,f=s.f; if(!f) return;
  const q1=cl((ms-P.d1)/450),q2=cl((ms-P.d2)/450);
  if(q1>0&&q1<1) lift(f,Math.sin(q1*Math.PI)*16,0,0); else if(q2>0&&q2<1) lift(f,0,-Math.sin(q2*Math.PI)*.18,-Math.sin(q2*Math.PI)*18); };
B.cap_swat=E2=>{ ensureBare(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const sw=[[1800,1950],[2150,2300],[2500,2650]],hit=2650;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1200,x:p.x,y:p.y,f:'hip'},{t:1450,f:'bare_act'},
    {t:1800,f:'bare_throw',dx:-6},{t:1950,f:'bare_act'},{t:2150,f:'bare_throw',dx:-8},{t:2300,f:'bare_act'},{t:2500,f:'bare_throw',dx:u=>-6-ez(u)*8},{t:2950,f:'bare_hip'},
    {t:3200,f:'hip'},{t:3450,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. Something is pestering his family.'); say(m.id,'cap_swat'); scene('bv_cap',3.3,{st,P:{off:1450,on:3200,sw}}); scene('bv_dodge',2.6,{f,P:{d1:1850,d2:2200}}); }],
    [1450,()=>{ sfx.select(); setMessage('He takes the cap off. Here we go.'); }],
    [1800,()=>{ sfx.whoosh(); }],
    [1950,()=>{ setMessage('Swat! Missed.'); scene('bv_text',.6,{x:F.x,y:F.top-20,txt:'MISS',c:CREAM,sc:2}); }],
    [2150,()=>{ sfx.whoosh(); }],
    [2300,()=>{ setMessage('Swat! Missed again. It\'s quick.'); scene('bv_text',.6,{x:F.x-16,y:F.top-20,txt:'MISS',c:CREAM,sc:2}); }],
    [2500,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('bv_rings',.5,{x:F.x+8,y:F.mid,c:CREAM,r:40}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SWAT!',c:GOLD,sc:4}); }],
    [3200,()=>{ sfx.select(); setMessage('The cap goes back on. Same angle as always.'); }],
    [4500,'end',res(E2)+'Like a mosquito. A big one.']]); };

// ---------- Patient Angler (A1, kept: bigger splash and reel) ----------
SC.bv_pond=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.on) return; const g=ez((ms-P.on)/300); gfx.globalAlpha=fade(u,.9)*g*.9;
  if(!PROPART.draw('boppy/pond',P.x,P.y-6,{w:128*g,h:70*g})) { E(P.x,P.y,56*g,13*g,'#4f8fc8'); E(P.x-8,P.y-2,34*g,6*g,'#8fc8f4'); } for(let k=0;k<2;k++) { const q=(s.t*.7+k*.5)%1; gfx.globalAlpha=fade(u,.9)*g*(1-q)*.8; ring(P.x,P.y,10+q*48,3+q*11,2,'#d8f0ff'); } };
SC.bv_rod=(s,u)=>{ const ms=s.t*1000,P=s.P,h=hand(); gfx.globalAlpha=fade(u,.97);
  let ang=1.4,bend=0;
  if(ms>P.sit&&ms<P.tug) ang=.5+Math.sin(ms/700)*.02;
  else if(ms>=P.tug&&ms<P.reel1) { const q=ez((ms-P.tug)/220); ang=lerp(.5,1.55,q); bend=.8*(1-ez((ms-P.tug-300)/400)); }
  else if(ms>=P.reel1) ang=lerp(1.55,1.1,ez((ms-P.reel1)/300));
  if(ms>P.home) ang=1.4;
  const PN=!!BSP().x_sit1,H={ang,len:132,bend}; if(PN) { H.tx=h.x; H.ty=h.y; } else HELD.rod(H,u,h.x,h.y);   // painted fishing poses already hold the rod; h is its tip
  if(ms>P.reel0&&ms<P.reel1+200) { const cx=h.x-6,cy=h.y+14,a=(ms-P.reel0)/70; if(!PN) { EO(cx,cy,13,13,'#aeb3ba'); E(cx,cy,5,5,'#5e6670'); LnO(cx,cy,cx+Math.cos(a)*16,cy+Math.sin(a)*16,3,'#d8dce2'); EO(cx+Math.cos(a)*16,cy+Math.sin(a)*16,4,4,RED); }
    if(ms>P.reel0+150) bigWord('REEL REEL',cx,h.y-58,GOLD,2); }
  if(ms>P.sit&&ms<P.home) { let fx2=P.fx,fy=P.fy+Math.sin(ms/260)*1.5;
    if(ms>P.nudge&&ms<P.nudge+300) fy+=Math.sin((ms-P.nudge)/300*Math.PI)*7;
    if(ms>P.tug) { const q=ez((ms-P.tug)/350); fx2=lerp(P.fx,P.fx+50,q); fy=lerp(P.fy,P.fy-70,q); }
    if(ms<P.tug+350) { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.quadraticCurveTo((H.tx+fx2)/2,ms>P.tug?(H.ty+fy)/2:Math.max(H.ty,fy)+14,fx2,fy); gfx.stroke();
      if(!PROPART.draw('boppy/bobber',fx2+3,fy-6,{h:32})) { EO(fx2,fy,7,9,CREAM); R(fx2-7,fy-2,14,5,RED); } }
    else { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=2; const ty=P.ft+ (ms<P.reel1?0:-ez((ms-P.reel1)/300)*10); gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.lineTo(P.fx+10,ty); gfx.stroke(); }
    if(ms>P.sit+200&&ms<P.nudge) bigWord('PATIENCE',h.x-30,h.y-58,CREAM,2);
    if(ms>P.nudge&&ms<P.tug) bigWord('NUDGE',P.fx,P.fy-34,CREAM,2); } };
SC.bv_splash=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=fade(u,.6);
  for(let k=0;k<16;k++) { const a=Math.PI*(1.06+k/15*.88),sp=56+(k%4)*16,q=ez(u*1.4),px=x+Math.cos(a)*sp*q*.9,py=y+Math.sin(a)*sp*q*1.5+u*u*90; EO(px,py,4,6,k%2?WATER:'#d8f0ff'); }
  const col=Math.sin(cl(u*1.6)*Math.PI); if(col>0) { E(x,y-col*40,14,col*44,'#bfe6ff'); E(x,y-col*40,8,col*34,'#ffffff'); }
  gfx.globalAlpha=fade(u,.5)*.8; ring(x,y,20+u*60,5+u*14,3,'#d8f0ff'); };
SC.bv_yank=(s,u)=>{ const ms=s.t*1000,q=cl(ms/700); if(q<1) lift(s.f,-Math.sin(q*Math.PI)*34,Math.sin(q*Math.PI*2)*.25,Math.sin(q*Math.PI)*14); };
B.patient_angler=E2=>{ const FA=!!BSP().x_sit1; const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,84),me=ST.unit(m);
  const P={sit:1150,nudge:2000,tug:2500,reel0:2850,reel1:3500,home:3700,fx:F.x+F.w*.5+20,fy:F.base-2,ft:F.mid};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1150,x:p.x,y:p.y,f:FA?'x_fish1':'sit'},{t:1450,f:FA?'x_sit1':'sit'},{t:1850,f:FA?'x_sit2':'sit'},{t:2200,f:FA?'x_sit1':'sit'},{t:2500,f:FA?'x_fish4':'wind',dx:u=>ez(u)*8},{t:2850,f:FA?((u,tt)=>Math.floor(tt*7)%2?'x_fish3':'x_fish2'):'act',dx:(u,tt)=>6+Math.sin(tt*30)*2},{t:3500,f:'celeb',hop:6},{t:3800,f:back(p.x,me),hop:2,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with his rod and sits down. The fish can wait for him.'); say(m.id,'patient_angler'); scene('bv_rod',3.8,{P}); scene('bv_pond',3.7,{P:{on:1100,x:P.fx,y:P.fy+3}}); }],
    [2000,()=>{ ST.jolt(f,.12); sfx.boop?sfx.boop():sfx.select(); setMessage(cap(f.def?f.def.the:'it')+' gets impatient and nudges the float.'); }],
    ['hf',2500],
    [2500,()=>{ sfx.whoosh(); sfx.splat(); ST.jolt(f,.5); landHit(100); scene('bv_splash',1.1,{x:P.fx,y:P.fy}); scene('bv_yank',.8,{f}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SPLASH!',c:'#bfe6ff',sc:4}); setMessage('Hook set! The whole pond jumps.'); }],
    [2850,()=>{ for(let k=0;k<6;k++) tone({type:'square',f0:900,dur:.03,vol:.06,delay:k*.1}); setMessage('He reels it in. Slow and steady. His pace.'); }],
    [3500,()=>{ sfx.ding(); }],
    [4900,'end',res(E2)+'The patience was a trap.']]); };

// ---------- Headcount, Again (A3, kept: big numbers over each enemy) ----------
SC.bv_count=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9);
  const badge=(x,y,n,pop,c)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); EO(0,0,17,17,c); label(''+n,1,-7,OUT,3); gfx.restore(); };
  P.list.forEach((q,k)=>{ const t0=P.c0+k*P.step; if(ms<t0) return; const a=(ms-t0)/180,pop=a<1?ez(a)*1.3:lerp(1.3,1,cl(a-1)); badge(q.x,q.top-30,k+1,pop,ms>P.reveal?GOLD:CREAM); });
  const st=s.st; if(ms>P.extra&&st&&st.x!=null) { if(ms<P.cross+80) { const p=head(st,-26); P.hx=p.x; P.hy=p.y; } const x=P.hx,y=P.hy,a=(ms-P.extra)/180,pop=a<1?ez(a)*1.3:lerp(1.3,1,cl(a-1)); badge(x,y,P.list.length+1,pop,CREAM);
    if(ms>P.cross) { const q=ez((ms-P.cross)/200); LnO(x-16,y-16,lerp(x-16,x+16,q),lerp(y-16,y+16,q),4,RED); LnO(x+16,y-16,lerp(x+16,x-16,q),lerp(y-16,y+16,q),4,RED); }
    if(ms<P.cross) bigWord('HIM?',x,y-36,CREAM,2); } };
B.headcount_again=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,62),me=ST.unit(m),n=list.length;
  const c0=1300,step=360,extra=c0+n*step+150,cross=extra+650,reveal=cross+350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim'},{t:c0,f:'aim',dx:(u,tt)=>-Math.sin(u*Math.PI)*6},{t:extra,f:'hip'},{t:cross,f:'act',dx:-4},{t:reveal,f:'aim'},{t:reveal+400,f:'celeb',hop:6},{t:reveal+800,f:back(p.x,me),hop:2,hn:6},{t:reveal+1800,x:'home',y:'home',f:'idle'}]);
  const P={list:list.map(f=>ST.foe(f)),c0,step,extra,cross,reveal,gx:Gp.x,gy:Math.max(40,Gp.top-74)};
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Headcount. Nobody move while he counts.'); say(m.id,'headcount_again'); scene('bv_count',(reveal+1300)/1000,{P,st}); }],
    ...list.map((f,k)=>[c0+k*step,()=>{ sfx.select(); ST.jolt(f,.1); lift(f,-6); }]),
    [extra,()=>{ sfx.boop?sfx.boop():sfx.select(); setMessage('One extra. He counted himself.'); }],
    [cross,()=>{ sfx.thud(); setMessage('He crosses himself out. Headcount, again.'); }],
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('bv_glow',.8,{x:q.x,y:q.mid,c:GOLD}); } }],
    [reveal+400,()=>{ setMessage('Everybody is accounted for. He gives the row a friendly nod.'); }],
    [reveal+1900,'end','Boppy has included himself by mistake. Twice.']]); };

// ---------- Lockdown (A4; key lockdown; same numbers as Closing Time) ----------
// The Rikers deputy warden: he points, cell bars slam down around the monster, he jangles his big key ring and locks it.
const keyRing=(x,y,t,shake)=>{ const sw=Math.sin(t*(shake?28:6))*(shake?.5:.2); ring(x,y,12,12,5,OUT); ring(x,y,12,12,3,BRASS);
  for(let k=0;k<4;k++) { const a=Math.PI*(.25+k*.17)+sw*(1+k*.3),kx=x+Math.cos(a)*12,ky=y+Math.sin(a)*12,ex=kx+Math.cos(a)*24,ey=ky+Math.sin(a)*24; LnO(kx,ky,ex,ey,4,k%2?'#c9ced6':BRASS); LnO(ex,ey,ex+Math.cos(a+1.4)*6,ey+Math.sin(a+1.4)*6,3,k%2?'#c9ced6':BRASS); } };
SC.bv_cell=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.94);
  const h=hand(); if(ms<P.turn) keyRing(h.x-6,h.y+4,s.t,ms>P.jang&&ms<P.turn);
  if(ms<P.drop) return;
  const d=ez((ms-P.drop)/(P.slam-P.drop)),bounce=ms>P.slam?Math.sin(cl((ms-P.slam)/250)*Math.PI)*-6:0,oy=lerp(-(P.base+30),0,d*d)+bounce;
  const w=P.x1-P.x0,n=6;
  gfx.save(); gfx.translate(0,oy);
  for(let k=0;k<n;k++) { const x=P.x0+k*w/(n-1); RO(x-4,P.top,8,P.base-P.top,IRON); R(x-2,P.top+2,2,P.base-P.top-4,IRONL); }
  RO(P.x0-10,P.top-12,w+20,14,IRON); R(P.x0-8,P.top-10,w+16,3,IRONL); for(let k=0;k<5;k++) EO(P.x0-4+k*(w+8)/4,P.top-5,2.5,2.5,IRONL);
  RO(P.x0-6,P.base-8,w+12,8,IRON);
  const lx=P.x1-4,ly=(P.top+P.base)/2; RO(lx-10,ly-14,20,26,BRASS); E(lx,ly-3,3,3,OUT); R(lx-1,ly-1,3,8,OUT);
  gfx.restore();
  if(ms>P.turn&&ms<P.turn+900) { const q=ez((ms-P.turn)/250),kx=P.x1+4,ky=(P.top+P.base)/2-3; gfx.save(); gfx.translate(kx,ky); gfx.rotate(-q*Math.PI/2); if(!PROPART.draw('boppy/big_key',20,0,{h:36,rot:Math.PI/4})) { LnO(0,0,26,0,4,BRASS); EO(30,0,7,7,BRASS); E(30,0,3,3,OUT); } gfx.restore(); bigWord('CLICK',kx+10,ky-30,CREAM,2); }
  if(ms>P.slam&&ms<P.slam+1300) { const q=(ms-P.slam)/1300; gfx.globalAlpha=(1-q)*.22*(Math.sin(q*Math.PI*6)>0?1:.3); R(0,0,576,324,'#ff2a2a'); } };
B.lockdown=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,70),me=ST.unit(m);
  const P={jang:2200,drop:1500,slam:1800,turn:2700,x0:F.x-F.w*.5-12,x1:F.x+F.w*.5+12,top:Math.max(26,F.top-18),base:F.base+4};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'aim',dx:u=>-ez(u)*6},{t:1500,f:'spread'},{t:1900,f:'hip'},{t:2200,f:'act',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2700,f:'throw',dx:-6},{t:3000,f:'hip'},{t:3400,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Keys jingling. The deputy warden is on duty.'); say(m.id,'lockdown'); scene('bv_cell',4.3,{P}); sfx.jangle(0,4); }],
    [1100,()=>{ setMessage('He points. YOU.'); scene('bv_text',1,{st,txt:'YOU.',c:CREAM,sc:2}); }],
    [1500,()=>{ sfx.whoosh(); setMessage('Cell bars come down out of nowhere.'); }],
    ['hf',P.slam],
    [P.slam,()=>{ sfx.clang(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('bv_big',1.3,{x:F.x,y:F.top-74,txt:'LOCKDOWN!',c:'#ff6a5a',sc:4}); }],
    [P.jang,()=>{ sfx.jangle(0,8); setMessage('He jangles his big key ring. Very slowly.'); }],
    [P.turn,()=>{ sfx.click?sfx.click():sfx.select(); setMessage('Click. That plan isn\'t going anywhere.'); }],
    [4500,'end',res(E2)+'Nobody gets out on his watch.']]); };

// ---------- Everybody Waits (A5, kept: the dispenser and the FAMILY FIRST ticket are bigger) ----------
SC.bp_ticket=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.95);
  if(ms<P.pull+200) { const h=hand(); RO(h.x-18,h.y-22,26,30,'#d8343a'); R(h.x-14,h.y-28,18,6,CREAM); EO(h.x-5,h.y-8,4,4,'#a82a2a'); if(ms>P.pull-500) bigWord('TAKE A NUMBER',h.x,h.y-50,CREAM,2); }
  if(ms<P.pull) return;
  const q=ez((ms-P.pull)/(P.unroll-P.pull)),top=P.y0,len=(P.y1-P.y0)*q,x=P.x;
  RO(x-15,top,30,Math.max(2,len),CREAM); for(let y=top+6;y<top+len-4;y+=14) { R(x-15,y,3,2,'#c9c2b8'); R(x+12,y,3,2,'#c9c2b8'); }
  const word=['F','A','M','I','L','Y',' ','F','I','R','S','T'],gap=(P.y1-P.y0-16)/word.length,sc=gap>=12?2:1;
  word.forEach((ch,k)=>{ const y=top+6+k*gap; if(y<top+len-sc*5) label(ch,x,y,RED,sc); });
  if(ms>P.unroll) { const g=ez((ms-P.unroll)/300); gfx.globalAlpha*=.14*g; R(x+15,top,P.wide,P.y1-P.y0,'#9fc4f0'); } };

// ---------- Pepper Breath (B1; key pepper_breath; same numbers as One Pepper, Sensible Size) ----------
// One homegrown cayenne at lunch. Crunch. His face goes red, steam comes out of his ears, and he breathes a cone of fire.
const cayenne=(x,y,rot,sc,c='#e0402e')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  if(c==='#e0402e'&&PROPART.draw('boppy/cayenne_pepper',0,0,{h:50})) { gfx.restore(); return; }   // painted; other colours stay drawn
  gfx.beginPath(); gfx.moveTo(-3,-14); gfx.quadraticCurveTo(10,-4,6,10); gfx.quadraticCurveTo(2,20,-6,24); gfx.quadraticCurveTo(-2,12,-6,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill();
  Ln(0,-8,3,6,1.5,'rgba(255,255,255,.6)'); RO(-5,-19,6,5,'#4f8a3a'); R(-3,-24,2,6,'#3f7a2a'); gfx.restore(); };
SC.bv_pepper=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st); gfx.globalAlpha=1;   // the painted frames hold the pepper themselves
  if(ms>P.show&&ms<P.eat) bigWord('HOMEGROWN',mo.x+4,mo.y-62,GOLD,2);
  if(ms>P.eat+200&&ms<P.eat+800) bigWord('CRUNCH',mo.x-6,mo.y-48,CREAM,2);
  if(ms>P.red&&ms<P.fire) { steam(mo.x+16,mo.y-24,s.t,3,'#ffd0b0',34); steam(mo.x+40,mo.y-26,s.t+.4,3,'#ffd0b0',34); } };
SC.bv_cone=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st),tx=P.tx,ty=P.ty,dx=tx-mo.x,dy=ty-mo.y,L=Math.hypot(dx,dy)+30,a0=Math.atan2(dy,dx);
  const grow=ez(ms/220),shrink=u>.8?(1-u)/.2:1,len=L*grow,spread=lerp(.1,.3,ez(ms/500))*shrink;
  const layer=(f,c,jit)=>{ const pts=[[mo.x,mo.y]]; for(let k=0;k<=8;k++) { const q=k/8,a=a0+lerp(-spread,spread,q)*f,r=len*(.92+.08*Math.sin(s.t*40+k*1.7))+Math.sin(s.t*55+k*2.3)*jit; pts.push([mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r]); } gfx.globalAlpha=shrink*.95; poly(pts,c,f===1?3:0); };
  layer(1,'#e0402e',8); layer(.7,'#ff8a2a',6); layer(.38,'#ffe070',4);
  for(let k=0;k<10;k++) { const q=((s.t*2.2)+k/10)%1,a=a0+Math.sin(k*2.1)*spread*.8,r=len*q; gfx.globalAlpha=(1-q)*shrink; E(mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r-q*10,3+q*4,3+q*4,k%2?'#ffd040':'#ff6a2a'); } };
B.pepper_breath=E2=>{ const PB=BSP().x_pepper?'x_pepper':'wind',PF=BSP().x_fire?'x_fire':'spread'; const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,100),me=ST.unit(m);
  const P={show:1350,eat:1700,red:1950,fire:2400,done:3500,tx:F.x+F.w*.15,ty:F.mid},hit=2600;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'hip'},{t:1300,f:'act'},{t:1700,f:PB},{t:1950,f:'hip',dx:(u,tt)=>Math.sin(tt*40)*2},
    {t:2350,f:PF,dx:u=>-ez(u*4)*8},{t:3300,f:'hip',dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:3700,f:back(p.x,me),hop:2,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with one homegrown cayenne pepper.'); say(m.id,'pepper_breath'); scene('bv_pepper',3.6,{P,st}); }],
    [1300,()=>{ setMessage('He holds it up. He grew it himself. He\'s very proud of it.'); }],
    [1900,()=>{ sfx.crunch(); setMessage('Crunch.'); }],
    [1950,()=>{ sfx.stun(); setMessage('His face goes red. Steam comes out of his ears.'); }],
    [2400,()=>{ sfx.flame(0,1.0); scene('bv_cone',1.1,{P,st}); setMessage('HAAAH! A cone of pepper fire!'); }],
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('bv_big',1.2,{x:F.x,y:F.top-74,txt:'HAAAH!',c:'#ffb040',sc:4}); }],
    [3300,()=>{ sfx.sulk&&sfx.sulk(); scene('bv_smoke',1.2,{x:F.x,y:F.mid,h:56}); scene('bv_text',1.2,{st,txt:'MY STOMACH',c:CREAM,sc:2}); setMessage('Ooh. His stomach has notes.'); }],
    [4800,'end',res(E2)+'He did warn everybody at lunch.']]); };

// ---------- Seeds of Trouble (B2, kept: a bigger packet and big pepper sparks) ----------
SC.bv_packet=(s,u)=>{ const ms=s.t*1000,P=s.P,h=hand(); if(ms>P.pocket) return; gfx.globalAlpha=fade(u,.96);
  const tap=ms>P.t0&&ms<P.t1?Math.abs(Math.sin((ms-P.t0)/(P.t1-P.t0)*Math.PI*3))*10:0,shake=ms>P.shake&&ms<P.pocket?Math.sin(ms/30)*4:0;
  const x=h.x-16+shake,y=h.y-34+tap; RO(x-20,y-26,40,52,'#f6e2b8'); R(x-20,y-26,40,11,'#4f8a3a'); label('HOT',x,y-10,RED,2); cayenne(x+2,y+10,.9,1);
  if(ms>P.show&&ms<P.t0) bigWord('HOMEGROWN',x,y-56,GOLD,2);
  if(ms>P.shake+200) { E(x+26,y+28,3,4,'#f0d27a'); bigWord('ONE LEFT',x,y-56,CREAM,2); } };
SC.bv_sparks=(s,u)=>{ const x=s.x,y=s.y,q=ez(u/.5); gfx.globalAlpha=fade(u,.55);
  for(let k=0;k<12;k++) { const a=k/12*Math.PI*2+(s.seed||0),r0=8+q*14,r1=18+q*(36+(k%3)*10); LnO(x+Math.cos(a)*r0,y+Math.sin(a)*r0,x+Math.cos(a)*r1,y+Math.sin(a)*r1,k%2?3:4,k%2?'#ffd040':'#ff6a2a'); }
  const fb=Math.sin(cl(u*1.8)*Math.PI); if(fb>0) { E(x,y,fb*24,fb*20,'#e0402e'); E(x,y,fb*16,fb*13,'#ff9a2a'); E(x,y,fb*8,fb*7,'#ffe070'); } };
B.seeds_of_trouble=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,70),me=ST.unit(m);
  const P={show:1100,t0:1700,t1:2300,shake:2800,pocket:3300},hit=2300;
  const aims=[0,1,2].map(k=>{ const f=list[k%list.length],q=ST.foe(f); return {x:q.x+(list.length<3?(k-1)*18:0),y:q.mid}; });
  ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'celeb'},{t:1700,f:'act',dx:(u,tt)=>Math.sin(tt*20)*2},{t:2300,f:'aim'},{t:2800,f:'kneel'},{t:3300,f:'hip'},{t:3600,f:back(p.x,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and shows off a seed packet. Handwritten label. HOT.'); say(m.id,'seeds_of_trouble'); scene('bv_packet',3.4,{P}); }],
    ...aims.map((a,k)=>[1750+k*120,()=>{ const h=hand(); ST.fly((x,y)=>{ E(x+6,y+3,5,4,'rgba(255,120,40,.5)'); EO(x,y,5,7,'#ffb04a'); E(x-1,y-2,2,3,'#fff1b0'); },h.x-16,h.y-34,a.x,a.y,.45,40); sfx.whoosh(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); sfx.splat(); all(list); landHit(100); aims.forEach((a,k)=>scene('bv_sparks',.9,{x:a.x,y:a.y,seed:k*.4})); scene('bv_big',1.1,{x:Gp.x,y:Math.max(40,Gp.top-74),txt:'SIZZLE!',c:'#ffb040',sc:4}); }],
    [2800,()=>{ setMessage('He shakes the packet. One seed left. He pockets it carefully.'); sfx.select(); }],
    [4700,'end',res(E2)+'The crop is performing above expectations.']]); };

// ---------- Mild for Company (B3, kept: a bigger pot and label) ----------
SC.bp_pot=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.give) return; gfx.globalAlpha=fade(u,.96);
  const x=h.x-16,y=h.y-8; RO(x-30,y-6,6,6,'#9a948a'); RO(x+24,y-6,6,6,'#9a948a'); EO(x,y+6,24,15,'#c9c2b8'); E(x,y-4,20,5,'#e88a4a'); steam(x,y-8,s.t,4,'#ffd9a0',46);
  const flip=cl((ms-P.flip)/400),sc=Math.cos(flip*Math.PI); gfx.save(); gfx.translate(x,y-50); gfx.scale(Math.abs(sc),1); RO(-26,-11,52,22,CREAM); label(sc>0?'HOT':'MILD',0,-5,sc>0?RED:'#2f6b3a',2); gfx.restore();
  if(ms>P.test&&ms<P.test+500) { RO(x+18,y-26,5,22,'#c9c2b8'); bigWord('TINY',x+20,y-80,CREAM,2); } };

// ---------- Five-Alarm Jar (B5; key five_alarm_jar; same numbers as Jar-Lid Negotiations) ----------
// A jar of his pickled ghost peppers. The lid pops, a little ghost floats out, he eats one, and the fire alarm goes off.
const gpep=(x,y,rot,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); E(0,0,7,9,OUT); E(0,0,5.4,7.4,'#f6e6a0'); E(1.5,1.5,2,4,'#d8c070'); R(-3,-2,2,2,OUT); R(1,-2,2,2,OUT); R(-1,2,2,2,OUT); R(-1,-12,3,4,'#6a8a3a'); gfx.restore(); };
const jar=(x,y,lidOff,shake)=>{ const sx=shake?Math.sin(performance.now()/25)*2:0; gfx.save(); gfx.translate(x+sx,y);
  if(lidOff?PROPART.draw('boppy/jar_of_ghost_peppers',0,1,{h:58,src:[0,24,103,136]}):PROPART.draw('boppy/jar_of_ghost_peppers',0,-4,{h:68})) { gfx.restore(); return; }   // painted jar (lid cropped off once it pops); drawn jar is the fallback
  RO(-22,-28,44,56,'#cfe8ee'); R(-19,-18,38,43,'#c8d890'); gpep(-9,-6,.4,1.2); gpep(8,2,-.5,1.2); gpep(-5,14,.2,1.1); gpep(10,-14,-.2,1); R(-16,-24,4,40,'rgba(255,255,255,.45)');
  RO(-20,4,40,12,CREAM); label('GHOST',0,6,RED,1);
  if(!lidOff) { RO(-24,-36,48,10,'#c9a23a'); R(-22,-34,44,2,'#f0d27a'); }
  gfx.restore(); };
SC.bv_jar=(s,u)=>{ const ms=s.t*1000,P=s.P,h=hand(),x=h.x-18,y=h.y-36; gfx.globalAlpha=fade(u,.96); if(ms>P.alarm) return;
  jar(x,y,ms>P.pop,ms>P.twist&&ms<P.pop);
  if(ms>P.twist&&ms<P.pop) bigWord('TWIST',x,y-58,CREAM,2);
  if(ms>P.pop&&ms<P.pop+600) { const q=ez((ms-P.pop)/600); gfx.save(); gfx.translate(x-q*60,y-36-Math.sin(q*Math.PI)*70); gfx.rotate(q*10); if(!PROPART.draw('boppy/jar_of_ghost_peppers',0,0,{h:10,w:44,src:[0,0,103,24]})) RO(-24,-5,48,10,'#c9a23a'); gfx.restore(); bigWord('POP!',x-58,y-40,GOLD,2); }
  if(ms>P.pop&&ms<P.eat) { const q=cl((ms-P.pop)/(P.eat-P.pop)),gx=x+Math.sin(q*8)*10,gy=y-40-q*60; gfx.globalAlpha=fade(u,.96)*(1-q*.4);
    E(gx,gy,13,15,OUT); E(gx,gy,11,13,GHOST); poly([[gx-11,gy],[gx-11,gy+16],[gx-6,gy+11],[gx-1,gy+17],[gx+4,gy+11],[gx+11,gy+16],[gx+11,gy]],GHOST,0); R(gx-6,gy-4,3,4,OUT); R(gx+3,gy-4,3,4,OUT); E(gx,gy+5,3,3,OUT);
    gfx.globalAlpha=fade(u,.96); if(q>.15) bigWord('BOO',gx+28,gy-14,GHOST,2); } };
SC.bv_bite=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const h=hand(),mo=mouth(st); gfx.globalAlpha=1;
  if(ms<P.eat+250) { const q=ez((ms-P.eat)/250); { const gx=lerp(h.x-14,mo.x,q),gy=lerp(h.y-30,mo.y,q),gs=1.6*(1-q*.6); if(!PROPART.draw('boppy/ghost_pepper',gx,gy,{h:36*gs/1.6,rot:-.3})) gpep(gx,gy,.3,gs); } }
  if(ms>P.eat+250&&ms<P.eat+800) bigWord('CRUNCH',mo.x-6,mo.y-48,CREAM,2);
  if(ms>P.alarm&&ms<P.done) { const hp=head(st,16),pulse=.4+.2*Math.sin(ms/60); gfx.globalAlpha=pulse; E(hp.x-4,hp.y+4,18,16,'#ff1a0a'); gfx.globalAlpha=1; steam(hp.x-28,hp.y-4,s.t,3,'#ffd0b0',40); steam(hp.x+22,hp.y-4,s.t+.4,3,'#ffd0b0',40); } };
SC.bv_alarm=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; gfx.globalAlpha=fade(u,.92);
  const bx=P.bx,by=P.by,a=s.t*9;
  for(let k=0;k<2;k++) { const ang=a+k*Math.PI; gfx.globalAlpha=fade(u,.92)*.22; poly([[bx,by],[bx+Math.cos(ang-.25)*620,by+Math.sin(ang-.25)*620],[bx+Math.cos(ang+.25)*620,by+Math.sin(ang+.25)*620]],'#ff3a2a',0); }
  gfx.globalAlpha=fade(u,.92); if(!PROPART.draw('boppy/fire_alarm',bx,by+8,{h:52})) { RO(bx-16,by+6,32,8,'#5a5a60'); gfx.beginPath(); gfx.arc(bx,by+6,14,Math.PI,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=Math.sin(a*2)>0?'#ff3a2a':'#c81a12'; gfx.fill(); E(bx-5,by-2,3,4,'#ffb0a0'); }
  if(ms<1300) { const q=ms/1300; gfx.globalAlpha=.2*(Math.sin(q*Math.PI*8)>0?1:0)*(1-q); R(0,0,576,324,'#ff2a1a'); }
  gfx.globalAlpha=fade(u,.92); bigWord('5-ALARM!',bx,by-24,'#ff6a5a',3); };
SC.bv_blaze=(s,u)=>{ const x=s.x,y=s.base,hgt=s.h*Math.sin(cl(u*1.4)*Math.PI*.5+.0)*(u>.75?(1-u)/.25:1); if(hgt<=1) return; gfx.globalAlpha=1;
  const flame=(w,h,c,ph)=>{ const pts=[[x-w,y]]; for(let k=1;k<6;k++) { const q=k/6; pts.push([x-w+q*2*w,y-h*(.55+.45*Math.sin(q*Math.PI))-Math.sin(s.t*30+k*2+ph)*h*.12]); } pts.push([x+w,y]); poly(pts,c,c==='#e0402e'?3:0); };
  flame(s.w*.6,hgt,'#e0402e',0); flame(s.w*.42,hgt*.75,'#ff8a2a',1); flame(s.w*.22,hgt*.45,'#ffe070',2); };
B.five_alarm_jar=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,60),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],Gh=ST.group(hitList);
  const P={twist:1550,pop:1900,eat:2350,alarm:2650,done:3700},hit=2950;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'hip'},{t:1300,f:'act'},{t:1550,f:'act',dx:(u,tt)=>Math.sin(tt*30)*2},{t:1900,f:'throw',dx:-4},{t:2350,f:'wind'},
    {t:2650,f:'celeb2',dx:(u,tt)=>Math.sin(tt*40)*2},{t:2950,f:'spread',dx:u=>-ez(u*4)*6},{t:3400,f:'hip',dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:3900,f:back(p.x,me),hop:2,hn:6},{t:4900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with a jar of his pickled ghost peppers.'); say(m.id,'five_alarm_jar'); scene('bv_jar',3.7,{P}); scene('bv_bite',3.8,{P,st}); }],
    [1550,()=>{ setMessage('He twists the lid. It\'s on there good.'); sfx.charge&&sfx.charge(); }],
    [1900,()=>{ sfx.boing(); setMessage('POP. Something spooky floats out of the jar.'); sfx.boo&&sfx.boo(); }],
    [2350,()=>{ sfx.crunch(); setMessage('He eats one anyway.'); }],
    [2650,()=>{ sfx.siren(); scene('bv_alarm',1.6,{P:{bx:Math.max(70,Math.min(506,(p.x+Gh.x)/2)),by:56},st}); setMessage('The fire alarm goes off. Somebody stop him.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.flame(0,.9); sfx.fireball?sfx.fireball():sfx.bonk(); all(hitList); landHit(100); hitList.forEach((g,k)=>{ const q=ST.foe(g); scene('bv_blaze',1.0,{x:q.x,base:q.base,w:q.w*.7,h:q.h*1.05}); }); scene('bv_big',1.2,{x:Gh.x,y:Math.max(40,Gh.top-74),txt:'WHOOSH!',c:'#ffb040',sc:4}); }],
    [3400,()=>{ sfx.guard?sfx.guard():sfx.thud(); scene('bv_shield',1.2,{x:p.x,y:p.y-BH()*.45,c:GOLD}); setMessage('He braces, sweating. Nobody stopped him.'); }],
    [5000,'end',res(E2)+'Five alarms. Every one of them earned.']]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Cap Swat: a much bigger cap with swing arcs, MISS, MISS, SWAT. Recliner Reservation: a recliner twice the size that
// thumps down with a dust burst. Headcount, Again: big number badges over each enemy. Everybody Waits: a wide FAMILY FIRST
// ticket and one big shield dome over the family. Seeds of Trouble: a bigger packet and fiery seeds that burst into big
// sparks. Mild for Company: a bigger pot with big steam. Same numbers, same beats. Overrides SC.bv_cap, SC.bp_chair,
// SC.bv_count, SC.bp_ticket, B.cap_swat, B.seeds_of_trouble and B.mild_for_company. Scenes prefix bp2_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const bigSteam=(x,y,t,n,c,h=100)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*.8+k*.19)%1,px=x-(n-1)*11+k*22+Math.sin(q*6+k)*9,py=y-q*h,r=9+q*14; gfx.globalAlpha=a0*(1-q)*.35; E(px,py,r+2,r+2,'#8a8478'); gfx.globalAlpha=a0*(1-q)*.95; E(px,py,r,r,c); } gfx.globalAlpha=a0; };
const bigWord=(txt,x,y,c,sc)=>{ const w=(txt.length*4-1)*sc; x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(8,y); const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',BLUE='#9fc4f0',CAPC='#525053',LEATHER='#7a4a2e';
ST.nw('bp2_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
SC.bp2_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,4,s.c||CREAM); } };

// ---------- Cap Swat: a much bigger cap, swing arcs, MISS, MISS, SWAT ----------
const BARE=['act','throw','aim','hip','wind'];
const bareRows=fr=>{ const rows=fr.map(r=>r.split('')),r21=fr[21]; let c0=99,c1=-1; for(let x=0;x<r21.length;x++) if(r21[x]!=='.') { c0=Math.min(c0,x); c1=Math.max(c1,x); }
  const cx=Math.round((c0+c1)/2)+1,hw=r=>{ const q=(22.8-r)/8.8; return Math.round(10.5*Math.sqrt(Math.max(0,1-q*q))); };
  for(let r=11;r<=22;r++) for(let x=c0-4;x<=c1+3;x++) if(rows[r][x]!==undefined) rows[r][x]='.';
  for(let r=14;r<=22;r++) { const w=hw(r),wp=hw(r-1); if(w<2) continue;
    for(let x=cx-w;x<=cx+w;x++) { let ch='o'; if(x===cx-w||x===cx+w||r===14||Math.abs(x-cx)>wp) ch='a'; else if(r<=17&&x<cx-1&&x>cx-6) ch='p'; else if(x>cx+3&&r>=18) ch=(x+r)%3===0?'j':'g'; else if(x<cx-7&&r>=20) ch='g'; rows[r][x]=ch; } }
  return rows.map(r=>r.join('')); };
const ensureBare=()=>{ const sp=BSP(); if(sp.bare_act) return; for(const k of BARE) { const fr=bareRows(sp[k]); sp['bare_'+k]=fr; if(sp.eyeAt) sp.eyeAt.set(fr,sp.eyeAt.get(sp[k])); if(sp.handAt) sp.handAt.set(fr,sp.handAt.get(sp[k])); } };
const CAPS=2.5,REACH=36*CAPS;
const bigCap=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  poly([[-4,4],[-40,2],[-42,9],[-6,10]],'#403b3c',2.5); EO(-12,-2,15,11,CAPC); E(-15,-6,8,4,'#68676c'); Ln(-18,-1,-6,-3,2,'#d2d1d1'); Ln(-14,1,-8,2,1.5,'#d2d1d1'); E(-12,-13,2.5,2,'#68676c'); gfx.restore(); };
SC.bv_cap=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.off||ms>P.on) return; const h=hand(),px=h.x+4,py=h.y; let ang=-1.25;
  for(const [a,b] of P.sw) { if(ms>=a&&ms<b) ang=lerp(-1.25,.55,ez((ms-a)/(b-a))); else if(ms>=b&&ms<b+200) ang=lerp(.55,-1.25,ez((ms-b)/200)); }
  if(ms>=P.sw[2][1]) ang=lerp(.55,.15,ez((ms-P.sw[2][1])/300));
  if(ms<P.off+200) ang=lerp(-2.4,-1.25,ez((ms-P.off)/200));
  // swing arcs: a white sweep behind the cap for each swing, the last one gold
  P.sw.forEach(([a,b],k)=>{ if(ms<a||ms>b+320) return; const cur=ms<b?lerp(-1.25,.55,ez((ms-a)/(b-a))):.55,al=ms<b?1:1-(ms-b)/320;
    for(const [r,w,c] of [[REACH*.95,9,OUT],[REACH*.95,5,k===2?GOLD:'#ffffff'],[REACH*.7,4,OUT],[REACH*.7,2,'#dfe8f0']]) { gfx.globalAlpha=al*(c===OUT?.7:.9); gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(px,py,r,Math.PI-1.25,Math.PI+cur); gfx.stroke(); } });
  gfx.globalAlpha=1; bigCap(px,py,ang,CAPS);
  const st=s.st; if(st&&st.x!=null&&ms<P.off+700) { const p=head(st,8),q=(ms-P.off)/700; gfx.globalAlpha=1-q; for(let k=0;k<3;k++) { const sx=p.x-14+k*12,sy=p.y-14-k%2*6; Ln(sx-3-q*6,sy,sx+3+q*6,sy,2,'#ffffff'); Ln(sx,sy-3-q*6,sx,sy+3+q*6,2,'#ffffff'); } } };
B.cap_swat=E2=>{ ensureBare(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const sw=[[1800,1950],[2150,2300],[2500,2650]],hit=2650;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1200,x:p.x,y:p.y,f:'hip'},{t:1450,f:'bare_act'},
    {t:1800,f:'bare_throw',dx:-6},{t:1950,f:'bare_act'},{t:2150,f:'bare_throw',dx:-8},{t:2300,f:'bare_act'},{t:2500,f:'bare_throw',dx:u=>-6-ez(u)*8},{t:2950,f:'bare_hip'},
    {t:3200,f:'hip'},{t:3450,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. Something is pestering his family.'); say(m.id,'cap_swat'); scene('bv_cap',3.3,{st,P:{off:1450,on:3200,sw}}); scene('bv_dodge',2.6,{f,P:{d1:1850,d2:2200}}); }],
    [1450,()=>{ sfx.select(); setMessage('He takes the cap off. Here we go.'); }],
    [1800,()=>{ sfx.whoosh(); }],
    [1950,()=>{ setMessage('Swat! Missed.'); scene('bv_big',.7,{x:F.x-30,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:-.12}); }],
    [2150,()=>{ sfx.whoosh(); }],
    [2300,()=>{ setMessage('Swat! Missed again. It\'s quick.'); scene('bv_big',.7,{x:F.x+26,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:.12}); }],
    [2500,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('bp2_rings',.6,{x:F.x+8,y:F.mid,c:GOLD,r:60}); scene('bv_flash',.25,{a:.35}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SWAT!',c:GOLD,sc:5}); }],
    [3200,()=>{ sfx.select(); setMessage('The cap goes back on. Same angle as always.'); }],
    [4500,'end',res(E2)+'Like a mosquito. A big one.']]); };

// ---------- Recliner Reservation: twice the size, and it THUMPS down ----------
const CS=1.9;
const chair=(x,base,foot,sc=1)=>{ gfx.save(); gfx.translate(x,base); gfx.scale(sc,sc);
  if(PROPART.draw('boppy/recliner',10,-31,{h:64})) { gfx.restore(); return; }   // painted recliner (footrest already out); drawn chair is the fallback
  R(-14,-4,3,6,OUT); R(12,-4,3,6,OUT);
  RO(-18,-62,22,46,LEATHER); R(-15,-58,16,40,'#8a5a36'); R(-13,-54,12,4,'#9c6a42'); R(-13,-44,12,4,'#9c6a42');
  RO(-18,-24,34,14,'#8a5a36'); R(-15,-22,28,3,'#9c6a42'); RO(-22,-34,8,22,LEATHER); RO(12,-34,8,22,LEATHER);
  if(foot>0) RO(16,-20,22*foot,8,'#8a5a36');
  gfx.restore(); };
const RECL=[];   // who is sitting in the chair right now: {m,st,t0,t1} (st = their ST.keys state), filled by the move below
SC.bp_chair=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.drop) return; const land=P.drop+450,d=cl((ms-P.drop)/450),y=lerp(P.y-330,P.y,d*d); gfx.globalAlpha=fade(u,.95);
  const a0=gfx.globalAlpha;
  if(d<1) { gfx.globalAlpha=a0*.45; E(P.x,P.y,36*d+8,6,'#000'); gfx.globalAlpha=a0; }
  const sq=ms>land&&ms<land+300?Math.sin((ms-land)/300*Math.PI)*.14:0;
  gfx.save(); gfx.translate(P.x,y); gfx.scale(1+sq,1-sq); gfx.translate(-P.x,-y); chair(P.x,y,ez((ms-P.foot)/400),CS); gfx.restore();
  // the chair is drawn over the party, so whoever sits in it is drawn again on top
  for(const r of RECL) { const st=r.st,sp=st&&st.sp,fr=st&&st.frame; if(ms<r.t0||ms>=r.t1||!sp||!fr||st.x==null) continue;
    const w=fr[0].length*sp.scale,h=fr.length*sp.scale; gfx.save(); gfx.globalAlpha=1; gfx.translate(st.x,st.y-h/2); rideBodyDraw(r.m,fr,sp.pal,-w/2,-h/2,sp.scale,{}); gfx.restore(); }
  gfx.globalAlpha=a0;
  const top=y-62*CS;
  if(ms<P.card) { if(!PROPART.draw('boppy/reserved_card',P.x,top-14,{w:84})) { RO(P.x-40,top-30,80,22,CREAM); label('RESERVED',P.x,top-24,RED,2); } }
  else if(ms<P.card+700) { const q=(ms-P.card)/700; gfx.save(); gfx.translate(P.x+q*110,top-19-Math.sin(q*Math.PI)*60); gfx.rotate(q*5); if(!PROPART.draw('boppy/reserved_card',0,5,{w:84})) { RO(-40,-11,80,22,CREAM); label('RESERVED',0,-5,RED,2); } gfx.restore(); }
  if(ms>land&&ms<land+800) { gfx.globalAlpha=a0; bigWord('THUMP!',P.x+10,top-52,CREAM,3); }
  if(ms>P.comfy&&ms<P.comfy+1100) { gfx.globalAlpha=a0; bigWord('COMFY?',P.x-12,top-64,GOLD,3); } };
// the thump itself: dust and a shake, started by the move timeline (added here so the move function stays as it was)
const oldRecliner=B.recliner_reservation;
B.recliner_reservation=E2=>{ const t=E2.targets[0]||E2.m,H=ST.unit(t),self=t===E2.m,cx=Math.round(H.x-H.w*.5-6),cy=Math.min(316,H.base+2),land=(self?300:900)+450;
  oldRecliner(E2); scene('bp2_thump',(land+700)/1000,{x:cx,y:cy,land});
  const keep=ST.cur; RECL.length=0;
  if(self) RECL.push({m:E2.m,st:keep,t0:2700,t1:3900});
  // the ally he sets it up for walks into the chair the moment it lands, sits through the heal, then gets up and goes home
  else if(t.side!=='foe'&&b2Alive(t)&&battle.fx[t.idx]) { const tsp=BATTLE_SPRITES[t.id],sitF=tsp&&tsp.sit?'sit':'kneel';
    const tst=ST.keys(battle.fx[t.idx],[{t:0,x:'home',y:'home',f:'idle'},{t:land,x:'home',y:'home',f:'walk',hop:2,hn:3},{t:land+500,x:cx+2,y:cy,f:sitF},{t:3100,f:sitF},{t:3200,f:'walkR',hop:2,hn:3},{t:3800,x:'home',y:'home',f:'idle'},{t:4300,x:'home',y:'home',f:'idle'}]);
    ST.cur=keep; RECL.push({m:t,st:tst,t0:land+500,t1:3200}); } };
SC.bp2_thump=(s,u)=>{ const ms=s.t*1000; if(ms<s.land) return; if(!s.done) { s.done=1; sfx.bonk&&sfx.bonk(); } const q=cl((ms-s.land)/700);
  for(let k=0;k<14;k++) { const side=k%2?1:-1,d=(24+(k%7)*10)*ez(q); gfx.globalAlpha=(1-q)*.85; E(s.x+side*(40+d),s.y-4-Math.sin(ez(q)*Math.PI)*(6+(k%3)*7),7+q*10,5+q*7,k%3?'#d8cbb0':'#f0e6d0'); }
  gfx.globalAlpha=(1-q)*.8; ring(s.x,s.y,20+q*90,4+q*16,4,CREAM); };

// ---------- Headcount, Again: big number badges over each enemy ----------
const badge=(x,y,n,pop,c)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); EO(0,0,26,26,c); ring(0,0,21,21,2,'rgba(43,42,38,.35)'); label(''+n,1,-12,OUT,5); gfx.restore(); };
SC.bv_count=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9); const a0=gfx.globalAlpha;
  P.list.forEach((q,k)=>{ const t0=P.c0+k*P.step; if(ms<t0) return; const a=(ms-t0)/180,pop=a<1?ez(a)*1.35:lerp(1.35,1,cl(a-1)),by=Math.max(34,q.top-44);
    if(ms<t0+400) { const r=(ms-t0)/400; gfx.globalAlpha=a0*(1-r); ring(q.x,by,26+r*30,26+r*30,4,GOLD); gfx.globalAlpha=a0; }
    badge(q.x,by,k+1,pop,ms>P.reveal?GOLD:CREAM); });
  const st=s.st; if(ms>P.extra&&st&&st.x!=null) { if(ms<P.cross+80) { const p=head(st,-40); P.hx=p.x; P.hy=Math.max(34,p.y); } const x=P.hx,y=P.hy,a=(ms-P.extra)/180,pop=a<1?ez(a)*1.35:lerp(1.35,1,cl(a-1)); badge(x,y,P.list.length+1,pop,CREAM);
    if(ms>P.cross) { const q=ez((ms-P.cross)/200); LnO(x-24,y-24,lerp(x-24,x+24,q),lerp(y-24,y+24,q),6,RED); LnO(x+24,y-24,lerp(x+24,x-24,q),lerp(y-24,y+24,q),6,RED); }
    if(ms<P.cross) bigWord('HIM?',x,y-56,CREAM,3); } };

// ---------- Everybody Waits: a wide FAMILY FIRST ticket and one big shield over the family ----------
SC.bp_ticket=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.95); const a0=gfx.globalAlpha;
  if(ms<P.pull+200) { const h=hand(); if(!PROPART.draw('boppy/ticket_dispenser',h.x-8,h.y-12,{h:56})) { RO(h.x-24,h.y-30,34,40,'#d8343a'); R(h.x-20,h.y-38,26,8,CREAM); EO(h.x-7,h.y-12,5,5,'#a82a2a'); } if(ms>P.pull-500) bigWord('TAKE A NUMBER',h.x,h.y-62,CREAM,2); }
  if(ms<P.pull) return;
  const party=P.wide>0,top=Math.max(8,P.y0-14),full=P.y1-top,q=ez((ms-P.pull)/(P.unroll-P.pull)),len=full*q,cx=P.x+(party?-14:14),hw=27;
  // the big shield first, so the ticket sits in front of it
  if(party&&ms>P.unroll) { const g=ez((ms-P.unroll)/350),dx=P.x+P.wide*.5,dy=(P.y0+P.y1)*.5+4,rx=Math.min(P.wide*.5+16,566-dx)*g,ry=Math.min(dy-6,(P.y1-P.y0)*.5+22)*g,pl=.5+.5*Math.sin(s.t*6);
    gfx.globalAlpha=a0*(.16+pl*.06); E(dx,dy,rx,ry,BLUE); gfx.globalAlpha=a0*.9; ring(dx,dy,rx+2,ry+2,8,OUT); ring(dx,dy,rx,ry,5,BLUE); ring(dx,dy,rx-7,ry-7,2,'#dff0ff');
    gfx.globalAlpha=a0*.5; gfx.strokeStyle='#ffffff'; gfx.lineWidth=5; gfx.beginPath(); gfx.ellipse(dx,dy,Math.max(1,rx-14),Math.max(1,ry-14),0,Math.PI*1.12,Math.PI*1.42); gfx.stroke(); gfx.globalAlpha=a0; }
  const paintT=PROPART.ready('boppy/family_first_ticket');
  if(paintT) { gfx.save(); gfx.beginPath(); gfx.rect(cx-hw-6,top,hw*2+12,Math.max(2,len)); gfx.clip(); PROPART.draw('boppy/family_first_ticket',cx,top+full*.5,{h:full,w:hw*2+12}); gfx.restore(); }   // painted ticket, revealed as it unrolls
  else { RO(cx-hw,top,hw*2,Math.max(2,len),CREAM); for(let y=top+6;y<top+len-4;y+=12) { R(cx-hw,y,3,3,'#c9c2b8'); R(cx+hw-3,y,3,3,'#c9c2b8'); } }
  const gap=(full-14)/6,sc=gap>=17?3:2;
  if(!paintT) ['FAMILY','FIRST'].forEach((wd,c)=>{ const x=cx+(c?13:-12),off=c?(6-wd.length)*gap*.5:0; [...wd].forEach((ch,k)=>{ const y=top+8+off+k*gap; if(y<top+len-sc*5) label(ch,x,y,RED,sc); }); });
  if(ms>P.unroll+500) { gfx.globalAlpha=a0; bigWord('FAMILY FIRST',party?P.x+P.wide*.5:cx,party?Math.max(24,P.y0-30):top-24,GOLD,3); } };

// ---------- Seeds of Trouble: a bigger packet, fiery seeds, big sparks ----------
const cayenne=(x,y,rot,sc,c='#e0402e')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  if(c==='#e0402e'&&PROPART.draw('boppy/cayenne_pepper',0,0,{h:50})) { gfx.restore(); return; }   // painted; other colours stay drawn
  gfx.beginPath(); gfx.moveTo(-3,-14); gfx.quadraticCurveTo(10,-4,6,10); gfx.quadraticCurveTo(2,20,-6,24); gfx.quadraticCurveTo(-2,12,-6,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill();
  Ln(0,-8,3,6,1.5,'rgba(255,255,255,.6)'); RO(-5,-19,6,5,'#4f8a3a'); R(-3,-24,2,6,'#3f7a2a'); gfx.restore(); };
const pk=()=>{ const h=hand(); return {x:h.x-34,y:h.y-64}; };
SC.bp2_packet=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms>P.pocket) return; gfx.globalAlpha=fade(u,.96);
  const tap=ms>P.t0&&ms<P.t1?Math.abs(Math.sin((ms-P.t0)/(P.t1-P.t0)*Math.PI*3))*14:0,shake=ms>P.shake&&ms<P.pocket?Math.sin(ms/30)*6:0,o=pk();
  const x=o.x+shake,y=o.y+tap;
  if(PROPART.draw('boppy/seed_packet',x+4,y-2,{h:104})) {} else {   // painted packet; drawn one is the fallback
  RO(x-36,y-48,72,94,'#f6e2b8'); R(x-36,y-48,72,22,'#4f8a3a'); R(x-36,y-28,72,3,'#3f7a2a'); label('SEEDS',x,y-41,CREAM,2);
  label('HOT',x,y-18,RED,4); cayenne(x+4,y+18,.9,1.6); R(x-30,y+40,60,2,'#d8c49a'); }
  if(ms>P.t0&&ms<P.t1) for(let k=0;k<4;k++) { const fq=(s.t*3+k*.25)%1; gfx.globalAlpha=1-fq; E(x-20+k*13,y-52-fq*30,4,6,k%2?'#ffb04a':'#ff6a2a'); gfx.globalAlpha=1; }
  if(ms>P.show&&ms<P.t0) bigWord('HOMEGROWN',x,y-84,GOLD,3);
  if(ms>P.shake+200) { EO(x+44,y+38,4,5,'#f0d27a'); bigWord('ONE LEFT',x,y-84,CREAM,3); } };
const fireSeed=(x,y)=>{ for(let k=4;k>=0;k--) { E(x+10+k*8,y-k*.6,8-k*1.2,6-k*.9,k>2?'rgba(255,90,30,.6)':k>0?'#ff8a2a':'#ffd040'); } EO(x,y,7,9,'#ffb04a'); E(x-1,y-3,3,4,'#fff1b0'); };
SC.bp2_sparks=(s,u)=>{ const x=s.x,y=s.y,q=ez(u/.5); gfx.globalAlpha=fade(u,.55);
  for(let k=0;k<14;k++) { const a=k/14*Math.PI*2+(s.seed||0),r0=10+q*18,r1=22+q*(38+(k%3)*12); LnO(x+Math.cos(a)*r0,y+Math.sin(a)*r0,x+Math.cos(a)*r1,y+Math.sin(a)*r1,k%2?4:6,k%2?'#ffd040':'#ff6a2a'); }
  const fb=Math.sin(cl(u*1.8)*Math.PI); if(fb>0) { EO(x,y,fb*32,fb*27,'#e0402e'); E(x,y,fb*22,fb*18,'#ff9a2a'); E(x,y,fb*11,fb*9,'#ffe070'); }
  for(let k=0;k<6;k++) { const e=cl(u*1.2-k*.06); if(e<=0) continue; gfx.globalAlpha=(1-e)*.9; E(x-20+k*8+Math.sin(k*2+e*6)*8,y-e*70,3,4,k%2?'#ffd040':'#ff6a2a'); } };
B.seeds_of_trouble=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,76),me=ST.unit(m);
  const P={show:1100,t0:1700,t1:2300,shake:2800,pocket:3300},hit=2300;
  const aims=[0,1,2].map(k=>{ const f=list[k%list.length],q=ST.foe(f); return {x:q.x+(list.length<3?(k-1)*20:0),y:q.mid}; });
  ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'celeb'},{t:1700,f:'act',dx:(u,tt)=>Math.sin(tt*20)*2},{t:2300,f:'aim'},{t:2800,f:'kneel'},{t:3300,f:'hip'},{t:3600,f:back(p.x,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and shows off a seed packet. Handwritten label. HOT.'); say(m.id,'seeds_of_trouble'); scene('bp2_packet',3.4,{P}); }],
    ...aims.map((a,k)=>[1750+k*120,()=>{ const o=pk(); ST.fly((x,y)=>fireSeed(x,y),o.x,o.y-50,a.x,a.y,.45,50); sfx.whoosh(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); sfx.splat(); all(list); landHit(100); aims.forEach((a,k)=>scene('bp2_sparks',1.0,{x:a.x,y:a.y,seed:k*.4})); scene('bv_flash',.3,{a:.3,c:'#ffb040'}); scene('bv_big',1.1,{x:Gp.x,y:Math.max(40,Gp.top-74),txt:'SIZZLE!',c:'#ffb040',sc:5}); }],
    [2800,()=>{ setMessage('He shakes the packet. One seed left. He pockets it carefully.'); sfx.select(); }],
    [4700,'end',res(E2)+'The crop is performing above expectations.']]); };

// ---------- Mild for Company: a bigger pot with big steam ----------
const pot=(x,y,t)=>{ if(PROPART.draw('boppy/pot_of_broth',x,y+4,{w:100})) { bigSteam(x,y-20,t,5,'#ffffff',120); return; }
  RO(x-56,y-10,12,10,'#9a948a'); RO(x+44,y-10,12,10,'#9a948a'); EO(x,y+10,46,28,'#c9c2b8'); E(x-16,y+4,10,12,'#e2ddd4'); EO(x,y-12,44,10,'#aaa398'); E(x,y-12,38,7,'#e88a4a'); E(x-10,y-14,10,2,'#f4b070');
  bigSteam(x,y-20,t,5,'#ffffff',120); };
SC.bp2_pot=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.give) return; gfx.globalAlpha=fade(u,.96);
  const x=h.x-32,y=h.y-24; pot(x,y,s.t);
  const flip=cl((ms-P.flip)/400),sc=Math.cos(flip*Math.PI); gfx.save(); gfx.translate(x,y-92); gfx.scale(Math.abs(sc),1); if(PROPART.draw('boppy/hot_mild_sign',0,0,{h:66})) { if(sc<=0) { RO(-30,-24,60,36,CREAM); label('MILD',0,-14,'#2f6b3a',3); } }   // painted HOT sign; its MILD side is drawn
  else { RO(-46,-18,92,36,CREAM); label(sc>0?'HOT':'MILD',0,-10,sc>0?RED:'#2f6b3a',4); } gfx.restore();
  if(ms>P.test&&ms<P.test+600) { LnO(x+30,y-40,x+38,y-4,4,'#c9c2b8'); EO(x+29,y-42,5,3,'#c9c2b8'); bigWord('TINY',x+60,y-130,CREAM,3); } };
B.mild_for_company=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:'aim'},{t:1200,f:'act'},{t:1700,f:'throw'},{t:2400,f:'celeb',hop:6},{t:2900,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:amble(sp.x,me),hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'aim'},{t:1700,f:'act'},{t:2200,f:'throw',dx:-6},{t:2700,f:'celeb',hop:6},{t:3100,f:back(sp.x,me),hop:2,hn:6},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={flip:self?400:1200,test:self?1200:1700,give:self?1700:2200},hit=plan.give+350,end=self?3100:4200;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Boppy turns the label on his broth around. HOT. Then MILD.':'Boppy walks over to '+t.name+' with a pot of broth.'); say(m.id,'mild_for_company'); scene('bp2_pot',(plan.give+100)/1000,{plan}); }],
    [plan.flip,()=>{ sfx.select(); if(!self) setMessage('He turns the label around. HOT becomes MILD, in careful handwriting.'); }],
    [plan.test,()=>{ setMessage('He tests one tiny spoonful like a safety inspector.'); }],
    [plan.give,()=>{ const h=hand(); ST.fly((x,y)=>{ if(PROPART.draw('boppy/bowl_of_broth',x,y-4,{w:46})) return; EO(x,y+4,18,11,'#c9c2b8'); E(x,y-3,15,4,'#e88a4a'); for(let k=0;k<3;k++) E(x-8+k*8,y-12-k%2*4,4,4,'rgba(255,230,192,.7)'); },h.x-32,h.y-24,H.x+(self?-30:6),H.mid,.4,30); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('bp_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('bp_glow',.9,{x:H.x,y:H.mid,c:'#ffd9a0'}); scene('bp2_rings',.7,{x:H.x,y:H.mid,c:'#ffd9a0',r:50}); hopOf(t!==m?t:null); }],
    [hit+300,()=>{ setMessage('The label was accurate. Boppy looks relieved.'); }],
    [end,'end',kindLine(t,'The warning label has been honestly adjusted.')]]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// Boppy's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// Boppy for real. The One That Got Away (A6): the floor floods into a pond, he braces on a pier and fights something big, yanks
// a whiskered catfish out of the water, then tells you how big it was, three times, and the fish grows to match every time
// (THIS BIG, NO THIS BIG, HONEST TO GOD) until it is the size of a bus and blocks out the lights; it belly-flops on every
// enemy (water columns, a wave), a pier rail goes up in front of the family (Nobody Gets Past), and then it flips back into the
// water and gets away. Van Cortlandt Park '70 (B6): the projector clicks on and the whole screen goes sepia film (grain,
// scratches, sprocket holes) over an autumn park; title card OCTOBER 1970; off comes the cardigan, under it the varsity
// singlet with bib 70; BANG, he laps every enemy three times in a whirl of autumn leaves (they spin as he passes), breaks the
// finish tape, the color snaps back and present-day Boppy walks home patting his stomach: STILL GOT IT. Scenes prefix b5_
// (no warp). His complaints stay canon: the stomach and people walking too fast, never joints.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST,HELD=RFX.HELD;
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
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',MAROON='#8a2432',WATER='#4f8fc8',WATER2='#8fc8f4',FOAM='#e8f6ff',WOOD='#a8743e',WOOD2='#c88f52',WOOD3='#6e4824';
const CAT='#6f6a44',CAT2='#4c4a2e',BELLY='#e8dcb0',KNIT='#6a696d',KNIT2='#8b8a8e';
ST.nw('b5_');
if(!sfx.splash) sfx.splash=(d=0)=>{ noise({dur:.6,vol:.3,delay:d,f0:1800,f1:300,type:'lowpass'}); noise({dur:.3,vol:.12,delay:d+.05,f0:5000,f1:2500,type:'highpass'}); };
if(!sfx.reel) sfx.reel=(d=0,n=10)=>{ for(let k=0;k<n;k++) noise({dur:.03,vol:.09,delay:d+k*.045,f0:4200,f1:3000,type:'highpass'}); };
if(!sfx.projector) sfx.projector=(d=0,n=24)=>{ for(let k=0;k<n;k++) noise({dur:.025,vol:.07,delay:d+k*.06,f0:2600,f1:1800,type:'bandpass'}); tone({type:'sawtooth',f0:60,dur:n*.06,vol:.03,delay:d,filter:200}); };
if(!sfx.bang) sfx.bang=(d=0)=>{ noise({dur:.35,vol:.45,delay:d,f0:3000,f1:200}); tone({type:'square',f0:120,f1:40,dur:.25,vol:.12,delay:d}); };
if(!sfx.crowd) sfx.crowd=(d=0)=>{ noise({dur:1.4,vol:.12,delay:d,f0:900,f1:1400,type:'bandpass'}); };
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const BAR=24;
SC.b5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000');
  if(s.film&&k>.9) { const P=s.film,ms=s.t*1000; if(ms>P.on&&ms<P.off) { const o=(ms/8)%28; for(let x=-28+o;x<590;x+=28) { R(x,7,14,10,'#e8dcc4'); R(x,307,14,10,'#e8dcc4'); } } } };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.b5_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+BAR+16,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; });
SC.b5_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.b5_dim=(s,u)=>{ gfx.globalAlpha=fin(u,.3)*fade(u,.75)*(s.a||.35); R(0,0,576,324,s.c||'#0a1428'); gfx.globalAlpha=1; };
SC.b5_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.5,3,s.c||CREAM); } gfx.globalAlpha=1; };
// Spinning monsters as something passes them: list of {f,t,k}; each lifts and spins once over 650 ms.
SC.b5_spin=(s,u)=>{ const ms=s.t*1000+s.t0; for(const b of s.list) { if(ms<b.t) continue; const q=(ms-b.t)/650; if(q>=1) { if(!b.done) { b.done=1; lift(b.f,0,0,0); } continue; }
  lift(b.f,-Math.sin(q*Math.PI)*(s.h||22),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*(s.ox||6)); } };

// ---------- The One That Got Away (A6) ----------
// The pond: the floor floods with water from the left (back layer, so the monsters stand in it).
SC.b5_pond=(s,u)=>{ const P=s.plan,ms=s.t*1000,g=ez(ms/450),out=u>.92?(1-u)/.08:1,x1=P.wx1*g,y0=P.wy0;
  gfx.globalAlpha=.82*out; gfx.beginPath(); gfx.moveTo(0,y0+8); for(let x=0;x<=x1;x+=12) gfx.lineTo(x,y0+Math.sin(x/30+s.t*3)*3); gfx.lineTo(x1+14,324); gfx.lineTo(0,324); gfx.closePath(); gfx.fillStyle=WATER; gfx.fill();
  gfx.globalAlpha=.55*out; for(let j=0;j<9;j++) { const y=y0+12+j*((324-y0)/9),o=(s.t*30*(j%2?1:-1)+j*47)%120; for(let x=-120+o;x<x1-20;x+=120) Ln(x,y,x+34,y,2,WATER2); }
  gfx.globalAlpha=.7*out; for(let k=0;k<2;k++) { const q=(s.t*.6+k*.5)%1; ring(P.wx,P.wy,10+q*50,3+q*12,2,FOAM); } gfx.globalAlpha=1; };
// The pier under Boppy: planks and pilings (back layer).
SC.b5_pier=(s,u)=>{ const P=s.plan,g=ez(s.t/.35),out=u>.92?(1-u)/.08:1,x0=P.px0,x1=P.px1,y=P.py;
  gfx.globalAlpha=out; for(const px of [x0+8,x0+(x1-x0)*.5,x1-14]) RO(px,y+10,8,(324-y-10)*g,WOOD3);
  RO(x0,y-4,x1-x0,14*g,WOOD); for(let x=x0;x<x1;x+=14) R(x,y-4,1.5,14*g,WOOD3); R(x0,y-4,x1-x0,2,WOOD2); gfx.globalAlpha=1; };
// The catfish, facing left: flat whiskered head, olive back, pale belly, forked tail. mo opens the mouth.
const catfish=(x,y,sc,rot,t,mo=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  const tw=Math.sin(t*14)*3;
  if(PROPART.draw('boppy/giant_catfish',-2,1,{w:78,flip:true})) { gfx.restore(); return; }   // painted catfish (faces left); the drawn fish is the fallback
  PO([[16,0],[31,-12+tw],[27,0],[31,12+tw]],CAT2,2);
  PO([[-4,-8],[3,-16],[8,-8]],CAT2,2); PO([[6,7],[12,12],[13,6]],CAT2,1.5);
  EO(0,0,21,9.5,CAT); EO(-15,1,10,8,CAT); E(-14,1,9,7,CAT);
  E(-2,4.5,17,4.6,BELLY); E(-14,5,8,3.2,BELLY); E(3,-5,14,3,CAT2);
  for(const [sx,sy] of [[-2,-2],[6,-3],[11,1],[-8,-4]]) E(sx,sy,1.5,1.1,CAT2);
  PO([[-10,4],[-5,11],[-3,5]],CAT2,1.5);
  EO(-17,-3,2.4,2.4,'#ffffff'); E(-17.6,-3,1.2,1.4,OUT);
  gfx.fillStyle=OUT; gfx.beginPath(); gfx.ellipse(-23,3,4,1+mo*3,0,0,Math.PI*2); gfx.fill();
  gfx.strokeStyle=OUT; gfx.lineWidth=1.6; gfx.lineCap='round';
  for(const [ax,ay,bx,by,cx,cy] of [[-24,1,-32,-2,-36,4],[-23,4,-30,8,-34,13],[-22,-1,-27,-8,-33,-9],[-21,5,-24,12,-28,16]]) { gfx.beginPath(); gfx.moveTo(ax,ay); gfx.quadraticCurveTo(bx,by+Math.sin(t*6+ax)*1.5,cx,cy); gfx.stroke(); }
  gfx.restore(); };
// Where the fish is at any moment (ms on the move timeline).
const fishAt=(P,ms)=>{ const A1=P.a1,A3=P.a3,A2={x:lerp(A1.x,A3.x,.45),y:lerp(A1.y,A3.y,.45)};
  if(ms<P.leap) return null;
  if(ms<P.b1) { const q=(ms-P.leap)/(P.b1-P.leap); return {x:lerp(P.wx,A1.x,q),y:lerp(P.wy,A1.y,ez(q))-Math.sin(q*Math.PI)*30,sc:1,rot:lerp(-1.1,0,ez(q)),mo:0}; }
  if(ms<P.b2) { const q=(ms-P.b1)/(P.b2-P.b1); return {x:A1.x,y:A1.y+Math.sin(ms/160)*3,sc:1,rot:Math.sin(ms/120)*.12,mo:.3}; }
  if(ms<P.b3) { const q=ez((ms-P.b2)/350); return {x:lerp(A1.x,A2.x,q),y:lerp(A1.y,A2.y,q)+Math.sin(ms/160)*3,sc:lerp(1,P.s2,q),rot:Math.sin(ms/120)*.1,mo:.5}; }
  if(ms<P.drop) { const q=ez((ms-P.b3)/450); return {x:lerp(A2.x,A3.x,q),y:lerp(A2.y,A3.y,q)+Math.sin(ms/200)*3,sc:lerp(P.s2,P.s3,q),rot:Math.sin(ms/200)*.05,mo:.8}; }
  if(ms<P.hit) { const q=(ms-P.drop)/(P.hit-P.drop); return {x:A3.x,y:lerp(A3.y,P.fy,q*q),sc:P.s3,rot:0,mo:1}; }
  if(ms<P.away) { const q=(ms-P.hit)/250,sq=q<1?Math.sin(q*Math.PI)*.18:0; return {x:A3.x,y:P.fy+Math.sin(ms/90)*1.5,sc:P.s3,sy:1-sq,sx:1+sq,rot:Math.sin(ms/140)*.03,mo:.2}; }
  if(ms<P.gone) { const q=(ms-P.away)/(P.gone-P.away); return {x:lerp(A3.x,-140,ez(q)),y:lerp(P.fy,P.wy0+40,q)-Math.sin(q*Math.PI)*70,sc:lerp(P.s3,1.6,ez(q)),rot:lerp(0,-.6,q),mo:0}; }
  return null; };
SC.b5_fish=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,f=fishAt(P,ms); if(!f) return;
  gfx.save(); gfx.translate(f.x,f.y); gfx.scale(f.sx||1,f.sy||1); catfish(0,0,f.sc,f.rot,s.t,f.mo); gfx.restore();
  if(ms<P.b1) for(let k=0;k<8;k++) { const q=((ms-P.leap)/500+k/8)%1; gfx.globalAlpha=1-q; E(f.x+18-k*4,f.y+10+q*30,2.4,3.2,FOAM); gfx.globalAlpha=1; } };
// The fish's shadow on the floor (back layer): grows while it hangs over the enemies.
SC.b5_shadow=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,f=fishAt(P,ms); if(!f||ms>P.hit||ms<P.b2) return; const k=cl((ms-P.b2)/900);
  gfx.globalAlpha=.35*k; E(f.x,P.gbase+4,f.sc*24,f.sc*5,'#0a1428'); gfx.globalAlpha=1; };
// Under the water before it leaps: a dark shape that tugs the line.
SC.b5_lurk=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0; if(ms>P.leap) return; const k=fin(u,.2),x=P.wx+Math.sin(ms/240)*14;
  gfx.globalAlpha=.4*k; E(x,P.wy+6,30,7,'#1a2c48'); gfx.globalAlpha=1; };
// The rod and line: bent double while he fights it, then the big yank. The line runs to the water (the fish after it leaps).
SC.b5_rod=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,h=hand(); if(ms>P.rodOff) return;
  let ang=.85+Math.sin(ms/110)*.05,bend=.85+Math.sin(ms/90)*.15;
  if(ms>P.yank) { const q=ez((ms-P.yank)/180); ang=lerp(.85,1.6,q); bend=lerp(.9,.15,q); }
  const H={ang,len:132,bend}; HELD.rod(H,u,h.x,h.y);
  const f=fishAt(P,ms),tx=f?f.x-28*f.sc:P.wx+Math.sin(ms/240)*14,ty=f?f.y:P.wy+2;
  gfx.strokeStyle='rgba(255,255,255,.9)'; gfx.lineWidth=1.6; gfx.beginPath(); gfx.moveTo(H.tx,H.ty); gfx.lineTo(tx,ty); gfx.stroke();
  if(!f) { const y=P.wy+Math.sin(ms/70)*4; EO(tx,y-2,5,6,CREAM); R(tx-5,y-3,10,4,RED); }
  if(ms>P.reel0&&ms<P.yank) { const cx=h.x-4,cy=h.y+14,a=ms/60; EO(cx,cy,12,12,'#aeb3ba'); E(cx,cy,4,4,'#5e6670'); LnO(cx,cy,cx+Math.cos(a)*15,cy+Math.sin(a)*15,3,'#d8dce2'); } };
// His hands showing how big it was: two mittens and an arrow between them, wider every time.
const mitt=(x,y,d)=>{ EO(x,y,7,9,CREAM); EO(x+d*6,y+1,3,4,CREAM); };
SC.b5_span=inBox((s,u)=>{ const g=u<.25?ez(u/.25):1,w=lerp(s.w0||20,s.w,g),x=Math.max(w/2+10,Math.min(566-w/2,s.x)),y=s.y; gfx.globalAlpha=fade(u,.85);
  LnO(x-w/2+8,y,x+w/2-8,y,3,GOLD); PO([[x-w/2+8,y-7],[x-w/2+1,y],[x-w/2+8,y+7]],GOLD,2); PO([[x+w/2-8,y-7],[x+w/2-1,y],[x+w/2-8,y+7]],GOLD,2);
  mitt(x-w/2-6,y,1); mitt(x+w/2+6,y,-1); gfx.globalAlpha=1; });
// The belly flop: tall water columns at every enemy, a wave rolling outward, drops everywhere.
SC.b5_splash=(s,u)=>{ for(const F of s.list) { const k=Math.sin(Math.min(1,u*1.6)*Math.PI),hgt=k*(F.h+50);
    gfx.globalAlpha=fade(u,.6); PO([[F.x-22,F.base],[F.x-10,F.base-hgt],[F.x+2,F.base-hgt*.82],[F.x+12,F.base-hgt*1.05],[F.x+24,F.base]],WATER2,2);
    E(F.x,F.base-hgt,16*k+2,10*k+2,FOAM);
    for(let j=0;j<7;j++) { const a=-Math.PI/2+(j-3)*.4,d=ez(u)*70; E(F.x+Math.cos(a)*d,F.base-hgt*.6+Math.sin(a)*d+u*u*90,3,4,FOAM); } }
  const G=s.G; gfx.globalAlpha=(1-u)*.8; ring(G.x,G.base+4,40+u*180,8+u*30,5,FOAM); ring(G.x,G.base+4,20+u*120,5+u*20,3,WATER2); gfx.globalAlpha=1; };
// The pier rail in front of the family (Nobody Gets Past): posts and two planks rise at everyone's feet.
SC.b5_rail=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.85);
  for(const q of s.list) { const x0=q.x-q.w*.32,x1=q.x+q.w*.32,y=q.base+4,h=30*g;
    if(PROPART.draw('boppy/pier_rail',q.x,y-h*.62,{w:Math.max(36,x1-x0+16),h:Math.max(2,44*g)})) { gfx.globalAlpha=fade(u,.85)*.25; E(q.x,q.mid,q.w*.5,q.h*.6,'#9fc4f0'); gfx.globalAlpha=fade(u,.85); continue; }
    RO(x0-3,y-h-4,6,h+4,WOOD3); RO(x1-3,y-h-4,6,h+4,WOOD3); RO(x0-6,y-h+3,x1-x0+12,7,WOOD); RO(x0-6,y-h+15,x1-x0+12,7,WOOD2);
    gfx.globalAlpha=fade(u,.85)*.25; E(q.x,q.mid,q.w*.5,q.h*.6,'#9fc4f0'); gfx.globalAlpha=fade(u,.85); } gfx.globalAlpha=1; };
B.fish_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),party=b2LiveParty();
  const sx=Math.round(Math.max(Gp.x1+90,Math.min(me.x-60,Gp.x1+150))),sy=Math.min(me.base,286);
  const wx=Math.round(lerp(Gp.x1+8,sx-40,.45)),wy0=Math.max(BAR+70,Math.min(Gp.base-56,Gp.top+20)),wy=Math.min(300,Gp.base-4);
  const s3=cl((Gp.w+140)/60,3.6,6),a3y=Math.max(BAR+70,Gp.top-46);
  const P={t0:0,wx,wy,wy0,wx1:sx-30,px0:sx-34,px1:Math.min(574,sx+52),py:sy,gbase:Gp.base,
    reel0:900,yank:1900,leap:2000,b1:2450,b2:2950,b3:3450,drop:4150,hit:4400,away:5150,gone:6000,rodOff:2300,
    a1:{x:Math.max(80,wx-20),y:Math.max(BAR+56,Gp.top-30)},a3:{x:Gp.x,y:a3y},s2:2,s3,fy:Math.min(300,Math.round(Gp.base-(Gp.base-Gp.top)*.35))};
  const headY=me.top-12;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:sx<me.x?'walk':'walkR'},{t:600,x:sx,y:sy,f:'aim'},{t:P.reel0,f:'throw',dx:(u,tt)=>Math.sin(tt*30)*2},
    {t:P.yank,f:'throw',dx:u=>4+ez(u)*6},{t:2300,f:'spread'},{t:P.b2,f:'spread',hop:6},{t:P.b3,f:'celeb',hop:10},{t:P.drop,f:'aim'},{t:P.hit+200,f:'celeb2',hop:8,hn:2},
    {t:P.away,f:'hip'},{t:5800,f:sx<me.x?'walkR':'walk'},{t:6400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('b5_bars',6.7,{}); scene('b5_pond',6.5,{plan:P,back:true}); scene('b5_pier',6.5,{plan:P,back:true}); scene('b5_lurk',2,{plan:P,t0:0,back:true});
      scene('b5_shadow',4.5,{plan:P,t0:0,back:true}); scene('b5_dim',1.1,{delay:3.4,a:.4});
      scene('b5_rod',2.3,{plan:P,t0:0}); say(m.id,'fish_ult'); sfx.splash(); setMessage('The floor floods into a pond. Boppy plants a boot on the pier.'); }],
    [P.reel0,()=>{ sfx.reel(0,16); scene('b5_big',.9,{st,txt:'FISH ON!',c:CREAM,sc:3}); setMessage('Something big is on the line. It pulls. Nobody pulls Boppy.'); }],
    [1400,()=>{ sfx.reel(0,10); }],
    [P.yank,()=>{ sfx.whoosh(); sfx.splash(); setMessage('One big yank.'); }],
    [P.leap,()=>{ scene('b5_fish',4.05,{plan:P,t0:P.leap}); scene('b5_rings',.6,{x:wx,y:wy,c:FOAM,r:50}); setMessage('Out it comes! A whiskered catfish. A decent size.'); }],
    [P.b1,()=>{ scene('b5_span',.5,{x:sx,y:headY,w0:12,w:34}); scene('b5_big',.6,{x:sx,y:headY-26,txt:'THIS BIG',c:CREAM,sc:2}); sfx.select(); setMessage('"It was THIS big," says Boppy.'); }],
    [P.b2,()=>{ scene('b5_span',.5,{x:sx-20,y:headY,w0:34,w:90}); scene('b5_big',.6,{x:sx-20,y:headY-30,txt:'NO, THIS BIG!',c:GOLD,sc:3}); sfx.boing(); setMessage('The fish heard him. The fish grows.'); }],
    [P.b3,()=>{ scene('b5_span',.75,{x:288,y:headY,w0:90,w:540}); scene('b5_big',.75,{x:288,y:headY-34,txt:'HONEST TO GOD!',c:'#ffb04a',sc:4}); sfx.boing(); b7Later(()=>sfx.boing(),180);
      setMessage('Now it\'s the size of a bus. It blocks out the lights.'); }],
    [P.drop,()=>{ sfx.whoosh(); }],
    ['hf',P.hit],
    [P.hit,()=>{ sfx.splash(); sfx.thud(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('b5_flash',.3,{a:.5,c:FOAM});
      scene('b5_splash',1.1,{list:list.map(f=>ST.foe(f)),G:Gp}); scene('b5_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'SPLOOSH!',c:FOAM,sc:4}); setMessage('Belly flop. On all of them.'); }],
    [4850,()=>{ E2.apply(); sfx.guard(); const L=b2LiveParty().map(p=>ST.unit(p)); scene('b5_rail',1.7,{list:L});
      scene('b5_big',1.2,{x:420,y:BAR+44,txt:'NOBODY GETS PAST',c:GOLD,sc:3,delay:.25});
      setMessage('The wave washes their buffs over to Boppy. A pier rail goes up in front of the family.'); }],
    [P.away,()=>{ sfx.splash(); scene('b5_big',1.1,{x:Math.max(90,Gp.x0+60),y:BAR+44,txt:'IT GOT AWAY!',c:CREAM,sc:3}); setMessage('Then it flips back in the water and swims off. Of course it does.'); }],
    [P.gone-200,()=>{ sfx.splash(); }],
    [6600,'end',()=>res(E2)+'Next time he tells it, it\'ll be bigger.']]); };

// ---------- Van Cortlandt Park '70 (B6) ----------
// The park in 1970 (back layer): sky, two rows of rolling hills, autumn trees, a dirt course. The sepia goes on top.
SC.b5_park=(s,u)=>{ const k=ez(s.t/.3)*(u>.94?(1-u)/.06:1),P=s.plan; gfx.globalAlpha=k;
  R(0,0,576,324,'#a8c8e0'); for(let j=0;j<4;j++) { const cx=(j*170+s.t*8)%700-60; E(cx,60+j*10,40,12,'#f4f6f8'); E(cx+26,54+j*10,26,10,'#f4f6f8'); }
  gfx.fillStyle='#8aa860'; gfx.beginPath(); gfx.moveTo(0,170); for(let x=0;x<=576;x+=16) gfx.lineTo(x,150+Math.sin(x/90)*22); gfx.lineTo(576,324); gfx.lineTo(0,324); gfx.fill();
  gfx.fillStyle='#6f9048'; gfx.beginPath(); gfx.moveTo(0,200); for(let x=0;x<=576;x+=16) gfx.lineTo(x,196+Math.sin(x/70+1.5)*16); gfx.lineTo(576,324); gfx.lineTo(0,324); gfx.fill();
  for(let j=0;j<9;j++) { const x=20+j*66+(j%2)*18,y=180+Math.sin(x/70+1.5)*16+(j%3)*6; RO(x-3,y-8,6,22,'#6a4a2a'); EO(x,y-20,16,16,['#e8743a','#d8a030','#c8402a'][j%3]); E(x-5,y-25,7,6,['#f49a5a','#f0c050','#e0604a'][j%3]); }
  gfx.fillStyle='#b8946a'; gfx.beginPath(); gfx.moveTo(0,P.lane+18); gfx.quadraticCurveTo(288,P.lane-10,576,P.lane+22); gfx.lineTo(576,P.lane+46); gfx.quadraticCurveTo(288,P.lane+20,0,P.lane+42); gfx.closePath(); gfx.fill();
  gfx.globalAlpha=1; };
// The whole screen as 1970 film: sepia (color blend), flicker, grain, scratches and a vignette.
SC.b5_sepia=(s,u)=>{ const k=ez(s.t/.3)*(u>.96?(1-u)/.04:1); if(k<=0) return;
  gfx.save(); gfx.globalCompositeOperation='color'; gfx.globalAlpha=k*.92; R(0,0,576,324,'#a07a48'); gfx.restore();
  gfx.save(); gfx.globalCompositeOperation='multiply'; gfx.globalAlpha=k*.35; R(0,0,576,324,'#f0d8a8'); gfx.restore();
  gfx.globalAlpha=k*(.04+.04*Math.sin(s.t*47)); R(0,0,576,324,'#fff4dc');
  const sd=Math.floor(s.t*24); for(let j=0;j<60;j++) { const r=((sd*131+j*977)%10007)/10007,r2=((sd*71+j*331)%9973)/9973; gfx.globalAlpha=k*.35; R(r*576,BAR+r2*(324-BAR*2),1.5,1.5,j%2?'#3a2a1a':'#fff4dc'); }
  for(let j=0;j<2;j++) { const r=((sd*53+j*211)%997)/997; if(r<.55) { gfx.globalAlpha=k*.3; R(r*1000%576,BAR,1,324-BAR*2,'#2a1a0a'); } }
  const g=gfx.createRadialGradient(288,162,120,288,162,330); g.addColorStop(0,'rgba(40,24,8,0)'); g.addColorStop(1,'rgba(40,24,8,0.55)'); gfx.globalAlpha=k; gfx.fillStyle=g; gfx.fillRect(0,0,576,324);
  gfx.globalAlpha=1; };
// The title card, like the start of a home movie: a countdown circle, then OCTOBER 1970 and the park.
SC.b5_title=(s,u)=>{ const a=fin(u,.1)*fade(u,.8); gfx.globalAlpha=a*.92; RO(128,40,320,108,'#f4ead4'); R(134,46,308,96,'#2a2016'); gfx.globalAlpha=a;
  const q=cl(s.t/.5); if(q<1) { ring(288,94,34,34,2,'#f4ead4'); gfx.strokeStyle='#f4ead4'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(288,94); gfx.lineTo(288+Math.cos(q*Math.PI*2-Math.PI/2)*34,94+Math.sin(q*Math.PI*2-Math.PI/2)*34); gfx.stroke(); bigWord(String(3-Math.floor(q*3)),288,86,'#f4ead4',3); }
  else { bigWord('OCTOBER 1970',288,62,'#f4ead4',4); label('VAN CORTLANDT PARK',288,100,'#f4ead4',2); label('CHAMPIONSHIP RACE',288,122,'#c8b090',1); }
  gfx.globalAlpha=1; };
// The 1970 varsity singlet with bib 70, worn over him while he runs (follows the body, flips with it).
SC.b5_singlet=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const sc=st.sc||1,H=BH()*sc,sp=BSP(),fl=sp.runFlip&&sp.runFlip.includes(st.frame)||st.frame===sp.flip?-1:1;
  const x=st.x+3*fl*sc,y0=st.y-H*.42,y1=st.y-H*.25,tw=10*sc,bw=12.5*sc; gfx.globalAlpha=fin(u,.04);
  PO([[x-tw,y0],[x-tw+4*sc,y0-3*sc],[x+tw-4*sc,y0-3*sc],[x+tw,y0],[x+bw,y1],[x-bw,y1]],'#fbf8f0',2);
  PO([[x-tw+1,y0+1],[x-tw+5*sc,y0+1],[x+bw-2,y1-1],[x+bw-6*sc,y1-1]],MAROON,0);
  RO(x-6*sc,y0+5*sc,12*sc,9*sc,'#ffffff'); label('70',x,y0+7*sc,OUT,Math.max(1,Math.round(sc*1.4)));
  gfx.globalAlpha=1; };
// The cardigan coming off (and later back on): a grey knit cardigan with buttons.
const cardigan=(x,y,r)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(r); if(PROPART.draw('boppy/cardigan',0,0,{w:62})) { gfx.restore(); return; } PO([[-14,-12],[14,-12],[16,14],[-16,14]],KNIT,2); PO([[-14,-12],[-28,6],[-22,10],[-12,-2]],KNIT2,2); PO([[14,-12],[28,6],[22,10],[12,-2]],KNIT2,2);
  R(-1,-12,2,26,'#4a494d'); for(let k=0;k<3;k++) EO(3,-6+k*7,1.6,1.6,'#c8b090'); gfx.restore(); };
// Autumn leaves whirling round him and trailing behind while he runs (and speed lines).
SC.b5_leaves=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000+s.t0; if(ms<s.P.go||ms>s.P.stop) return;
  s.hist=s.hist||[]; s.hist.push({x:st.x,y:st.y,sc:st.sc||1}); if(s.hist.length>18) s.hist.shift();
  const H=BH()*(st.sc||1),cols=['#e8743a','#d8a030','#c8402a','#f0c050'];
  for(let j=0;j<5;j++) { const p=s.hist[Math.max(0,s.hist.length-1-j*3)]; if(!p) continue; gfx.globalAlpha=.5-j*.08; Ln(p.x+(j%2?-20:20),p.y-H*.3-j*6,p.x+(j%2?-46:46),p.y-H*.3-j*6,2,'#fff4dc'); }
  for(let j=0;j<14;j++) { const a=ms/140+j*.9,r=(18+(j%4)*7)*(st.sc||1),cy=st.y-H*(.15+(j%5)*.15); gfx.globalAlpha=.9;
    gfx.save(); gfx.translate(st.x+Math.cos(a)*r*1.5,cy+Math.sin(a)*r*.35); gfx.rotate(a*2); PO([[-7,0],[0,-5],[7,0],[0,5]],cols[j%4],1.5); Ln(-5,0,5,0,1,'#5a3a1a'); gfx.restore(); }
  for(let j=0;j<s.hist.length;j+=2) { const p=s.hist[j],q=j/s.hist.length; gfx.globalAlpha=q*.7; gfx.save(); gfx.translate(p.x+Math.sin(j)*14,p.y-12-((j*7)%30)); gfx.rotate(j); PO([[-6,0],[0,-4.5],[6,0],[0,4.5]],cols[j%4],1.5); gfx.restore(); }
  gfx.globalAlpha=1; };
// The finish arch and tape at the end of the course; the tape snaps when he breaks it.
SC.b5_finish=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,g=ez((ms-P.arch)/300); if(g<=0) return; const x=P.bx,y=P.lane,h=96*g,out=u>.9?(1-u)/.1:1; gfx.globalAlpha=out;
  const br=ms>P.tape,AW=100*g,AH=86*g,k=AW/160;
  if(PROPART.ready('boppy/finish_arch')) {   // painted arch with its red tape; after the break the middle of the tape is cut away and the drawn ends whip back
    if(!br) PROPART.draw('boppy/finish_arch',x,y-AH*.5+2,{w:AW,h:AH});
    else { const yt=y-AH+2;   // top strip (banner) and the two side pieces (posts); the middle of the tape is gone
      PROPART.draw('boppy/finish_arch',x,yt+26*k,{src:[0,0,160,52],w:AW,h:52*k});
      for(const [sx0,sw] of [[0,40],[120,40]]) PROPART.draw('boppy/finish_arch',x+(sx0+sw/2-80)*k,yt+95*k,{src:[sx0,52,sw,86],w:sw*k,h:86*k}); }
    if(br) { const q=ez((ms-P.tape)/350); LnO(x-30,y-46,x-30-q*14,y-46+q*30,2,'#ffe08a'); LnO(x+30,y-48,x+30+q*16,y-48+q*34,2,'#ffe08a'); }
    gfx.globalAlpha=1; return; }
  RO(x-34,y-h,5,h,'#e8e0d0'); RO(x+30,y-h,5,h,'#e8e0d0'); RO(x-42,y-h-18,84,20,'#2a5a3a'); if(g>.8) label('FINISH',x,y-h-12,'#fff4dc',2);
  if(!br) { LnO(x-30,y-56,x+30,y-58,2,'#ffe08a'); }
  else { const q=ez((ms-P.tape)/350); LnO(x-30,y-56,x-30-q*14,y-56+q*30,2,'#ffe08a'); LnO(x+30,y-58,x+30+q*16,y-58+q*34,2,'#ffe08a'); }
  gfx.globalAlpha=1; };
// The starter's pistol from the top corner: BANG and a puff of smoke.
SC.b5_pistol=(s,u)=>{ const x=s.x,y=BAR+30,k=u<.15?ez(u/.15):1; gfx.globalAlpha=fade(u,.7);
  gfx.save(); gfx.translate(x+40*(1-k),y); if(PROPART.ready('boppy/starter_pistol')) { RO(26,-2,40,10,'#c8a07a'); PROPART.draw('boppy/starter_pistol',14,10,{w:54}); } else { RO(-4,0,30,8,'#5a5a5a'); RO(-4,4,8,14,'#6a4a2a'); RO(26,-2,40,10,'#c8a07a'); } gfx.restore();
  if(u>.15) for(let j=0;j<6;j++) { const q=cl((u-.15)*1.6); gfx.globalAlpha=(1-q)*.8; E(x-6-j*5,y-q*24-j*3,5+q*7,5+q*7,'#e8e0d0'); } gfx.globalAlpha=1; };
// Stomach pat glow when present-day Boppy gets his breath back.
SC.b5_belly=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const H=BH(),x=st.x+2,y=st.y-H*.3; gfx.globalAlpha=fade(u,.7)*(.35+.25*Math.sin(s.t*10)); E(x,y,22,16,'#ff8c3a'); gfx.globalAlpha=1; };
B.xc_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m);
  const fy=Math.min(312,Gp.base+18),by=Math.max(BAR+120,Gp.base-66),Lx=Math.max(30,Gp.x0-30),Rx=Math.min(me.x-30,Math.max(Lx+120,Gp.x1+46)),S={x:me.x-26,y:me.base};
  const bx=Math.max(48,Lx-6),endX=Math.max(16,bx-56);
  const P={go:1350,stop:4450,arch:3700,tape:4300,lane:fy,bx};
  const passes=[[1350,1900,S.x,Lx],[2700,3250,Rx+6,Lx],[4050,4300,Rx+6,bx]];
  const at=(p,x)=>p[0]+cl((p[2]-x)/(p[2]-p[3]))*(p[1]-p[0]);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'spread'},{t:1000,f:'walk'},{t:1150,x:S.x,y:S.y,f:'wind'},{t:1350,f:'run',ease:'lin'},
    {t:1900,x:Lx,y:fy,f:'runR',sc:.82,ease:'lin'},{t:2050,x:Lx-8,y:by,f:'runR',sc:.82,ease:'lin'},{t:2550,x:Rx,y:by,f:'run',ease:'lin'},{t:2700,x:Rx+6,y:fy,f:'run',ease:'lin'},
    {t:3250,x:Lx,y:fy,f:'runR',sc:.82,ease:'lin'},{t:3400,x:Lx-8,y:by,f:'runR',sc:.82,ease:'lin'},{t:3900,x:Rx,y:by,f:'run',ease:'lin'},{t:4050,x:Rx+6,y:fy,f:'run',ease:'lin'},
    {t:4400,x:endX,y:fy,f:'run',ease:'out'},{t:4700,x:endX,y:fy,f:'hip'},{t:5000,f:'walkR',hop:2,hn:5},{t:6300,x:'home',y:'home',f:'hip'},{t:6500,f:'idle'}];
  // the last pass slows from the tape to the stop point, so it runs on to endX after the tape
  K.splice(K.findIndex(k=>k.t===4400),0,{t:4300,x:bx,y:fy,f:'run',ease:'lin'});
  const st=ST.keys(fx,K);
  const spins=[]; passes.forEach((p,n)=>list.forEach((f,k)=>spins.push({f,k:k+n,t:at(p,ST.foe(f).x)})));
  const hits=[Math.round(at(passes[0],Gp.x)),Math.round(at(passes[1],Gp.x)),P.tape];
  const cx=Math.round((Gp.x+me.x)/2);
  ST.play(E2,[
    [0,()=>{ scene('b5_bars',6.8,{film:{on:300,off:4600}}); scene('b5_park',4.6,{plan:P,back:true}); scene('b5_finish',1.2,{plan:P,t0:3700,delay:3.7});
      scene('b5_title',1.05,{delay:.25}); scene('b5_singlet',3.85,{st,delay:.75}); scene('b5_leaves',3.4,{st,P,t0:1150,delay:1.15});
      scene('b5_sepia',4.35,{delay:.25}); sfx.projector(0,30); say(m.id,'xc_ult'); setMessage('The projector clicks on. Did he ever tell you about 1970?'); }],
    [700,()=>{ sfx.whoosh(); const c=ST.unit(m); ST.fly((x,y,uu)=>cardigan(x,y,uu*5),c.x,c.mid,c.x+90,BAR+10,.7,40); setMessage('Off comes the cardigan. Under it: the varsity singlet. Number 70.'); }],
    [1150,()=>{ scene('b5_big',.5,{x:288,y:BAR+56,txt:'ON YOUR MARKS',c:CREAM,sc:3}); }],
    [1300,()=>{ scene('b5_pistol',.9,{x:Math.min(500,S.x+30)}); sfx.bang(); scene('b5_big',.8,{x:Math.min(480,S.x+10),y:BAR+70,txt:'BANG!',c:CREAM,sc:4}); sfx.crowd(.1); setMessage('BANG! And he\'s off like it is 1970.'); }],
    [P.go,()=>{ scene('b5_spin',3.3,{list:spins,t0:P.go,h:20,ox:8}); }],
    ...spins.map(b=>[Math.round(b.t),()=>{ sfx.whoosh(); }]),
    [hits[0],()=>{ landHit(30); scene('b5_big',.9,{x:Gp.x,y:Gp.top-60,txt:'LAPPED!',c:'#ffb04a',sc:3}); setMessage('He laps them once.'); }],
    [hits[1],()=>{ landHit(30); scene('b5_big',.9,{x:Gp.x,y:Gp.top-60,txt:'LAPPED AGAIN!',c:'#ffb04a',sc:3}); setMessage('Twice. And they think HE walks slow.'); }],
    [P.arch,()=>{ sfx.ding(); setMessage('The finish tape goes up. Last lap. Here comes the kick.'); }],
    ['hf',P.tape],
    [P.tape,()=>{ landHit(40); sfx.thud(); sfx.crowd(); for(const f of list) ST.jolt(f,.6); scene('b5_flash',.25,{a:.4,c:'#fff4dc'});
      scene('b5_big',1.2,{x:Math.max(140,bx+40),y:Gp.top-74,txt:'CHAMPION!',c:GOLD,sc:4}); setMessage('Through the tape! Nobody caught him.'); }],
    [4600,()=>{ scene('b5_flash',.4,{a:.8,c:'#ffffff'}); sfx.select(); const c=ST.unit(m); scene('b5_rings',.5,{x:endX,y:fy-60,c:CREAM,r:30}); setMessage('Back to color. Back to now. He\'s a little out of breath.'); }],
    [5000,()=>{ E2.apply(); sfx.guard(); scene('b5_belly',1.4,{st}); }],
    [5300,()=>{ scene('b5_big',1.2,{st,txt:'STILL GOT IT.',c:GOLD,sc:3}); setMessage('"Still got it," says Boppy. He pats his stomach. "Ooh. My stomach."'); }],
    [6700,'end',()=>res(E2)+'He\'ll tell you about it again at dinner.']]); };
})();

// ================= Boppy verdict builds (2026-10-27, claude/boppy-moves-feedback.md) =================
// Cap Swat: a properly drawn baseball cap (crown with panel seams, curved brim, button, sweatband, patch) drawn at its final size, and
// a bare head under it (round scalp, thinning grey fringe). Van Cortlandt Park '70: young Boppy from the cardigan beat to the finish
// (dark full hair, clean shaven, maroon running tank, short shorts, bare legs and socks), back to normal at the colour flash.
// Everybody Waits: line change only (data/lines.js). Numbers, keys and beats unchanged. Frames embedded below. Scenes prefix bf_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',CAPC='#525053';
ST.nw('bf_');
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';
const fin=(u,a=.12)=>u<a?u/a:1;
const CAPS=2.5,REACH=36*CAPS;
// ---- embedded art (generated, tools/boppy_art.py) ----
const NEWPAL={"H": "#2b1a10", "I": "#46301d", "J": "#684626", "K": "#8e6236", "L": "#1a0f09", "R": "#a3283a", "S": "#6e1a28", "T": "#c9485a", "W": "#f6f1e8", "M": "#e2dac8", "N": "#b3a98f", "Z": "#c4bcab", "X": "#f9d1b0", "Y": "#c98462", "Q": "#d99a78", "P": "#e9b490", "O": "#9a5f46"};
const FR={
y_wind:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", ".............................aaaaaa...................", "..........................aKJIIIIIIIIa................", "........................aKJKKKJKJIIHIHIa..............", ".......................aJKKKJKKJJJHHIIHHa.............", "......................aIIIIJJIIHHHIILLHHLa............", "......................aIIJJIIIHIJIIHHLHHIa............", ".....................aJKJIIIIIIIHHHHHIHLLa............", ".....................aJJIIIIJIHHHHHIHLLLLa............", ".....................aIIIIJJHIIHHIIHLLLLLa............", ".....................aIIIIHIHHHHHLLLLLHLLa............", ".....................aIIIIHHHIHHLHLLLLLLLa............", "..................abJaHkHHHHlIaIaIHHIaHHIa............", "..................aIamHInnlHnnlHkaHHbaHHIa............", "..................abnHHIHnonnHHHlkaabaHHIa............", "..................aKnIHonoooononnnnnKaKKKa............", ".................aKooooooooooooooooonmKKKKa...........", ".................amoaaaaooooaaanooolomKKKKa...........", ".................alkbbKjnoonbaqmoollomKKKKa...........", ".................alobIKnnoolbbqooolloIIIKKa...........", "..................booooonnoolooooolloaKKKh............", "..................hoooolollllolpollmoJKIa.............", "....................aoooooolmmmmmpomkaaa..............", ".....................aoonooaaanonopobb................", "......................anonaoonaknnnpna................", "......................aaoaonnnnaooooaa................", "....................aRaloaonnnnalaRaa.................", "...................aaaRaaaonnnnaaRaRaaa...............", "................aRaoonaaaaonnnaRRaRappoa..............", ".................aonnnoonannnaRRRRapooooa.............", ".................aonnnnnnnannaaSRRapooona.............", ".................annnnnnnnannaaaaRapooona.............", "..................annnnnnnanaappoaapooona.............", "...................aannnnannapooopapooona.............", ".....................aaaaaaaapooooaoooona.............", ".....................aRRRRSSaooooooahrraa.............", "....................aRRRRRSRRaonnnnoaaana.............", "....................aRRRRRRRRRaaaaaonnna..............", "....................aRRRRRRRRRRRRRRaaaa...............", ".....................abbdcbbbbbbbbbba.................", ".....................aaaaNaaaaaaaaaaa.................", "....................aNMMNMNMMMMMMMNNa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_spread:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "............................aaaaaa....................", ".........................aKJIIIIIIIIa.................", ".......................aKJKKKJKJIIHIHIa...............", "......................aJKKKJKKJJJHHIIHHa..............", ".....................aIIIIJJIIHHHIILLHHLa.............", ".....................aIIJJIIIHIJIIHHLHHIa.............", "....................aJKJIIIIIIIHHHHHIHLLa.............", "....................aJJIIIIJIHHHHHIHLLLLa.............", "....................aIIIIJJHIIHHIIHLLLLLa.............", "....................aIIIIHIHHHHHLLLLLHLLa.............", "....................aIIIIHHHIHHLHLLLLLLLa.............", ".................abJaHkHHHHlIaIaIHHIaHHIa.............", ".................aIamHInnlHnnlHkaHHbaHHIa.............", ".................abnHHIHnonnHHHlkaabaHHIa.............", ".................aKnIHonoooononnnnnKaKKKa.............", "................aKooooooooooooooooonmKKKKa............", "................amoaaaaooooaaanooolomKKKKa............", "................alkbbKjnoonbaqmoollomKKKKa............", "................alobIKnnoolbbqooolloIIIKKa............", ".................booooonnoolooooolloaKKKh.............", ".................hoooolollllolpollmoJKIa..............", "...................aoooooolmmmmmpomkaaa...............", "....................aoonooonnnonopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", ".......aa.aaaaaaaaaaaaaalpoopSaaRaRRaaaaaaaaaaaaaaa...", "......aonaooooaoooooonakkkkaaRRRRaRappppppoappppppoa..", ".....aonnonnnnaonnnnnnnanRnaRRRRRRapoooooonaooooooooa.", ".....aonnnnnnnaonnnnnnnaanRSaaaSRRapoooooonaooooooona.", ".....annnnnnnnannnnnnnnaanaaRRRRRRaooooooonannnnnoona.", "......annaaaaaaannnnnnaRRWRRRWWWWWRaonnnnnaaaaaaaona..", ".......aa.......aaaaaaRRRRRRRWWWWWRRaaaaaa.......aa...", ".....................aRRRRRRRRRRRRRRa.................", ".....................aRRRRSSRRRRRRSSa.................", "....................aRRRRRSRRRRRRRRSSa................", "....................aRRRRRRRRRRRRRRSSa................", "....................aRRRRRRRRRRRRRRRa.................", ".....................aRRSRRRRRRRRRRRa.................", ".....................aaaabaaaaaaaaaaa.................", "....................aNMMNMNMMMMMMMNNa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aMMNaaaNNMMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_hip:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "............................aaaaaa....................", ".........................aKJIIIIIIIIa.................", ".......................aKJKKKJKJIIHIHIa...............", "......................aJKKKJKKJJJHHIIHHa..............", ".....................aIIIIJJIIHHHIILLHHLa.............", ".....................aIIJJIIIHIJIIHHLHHIa.............", "....................aJKJIIIIIIIHHHHHIHLLa.............", "....................aJJIIIIJIHHHHHIHLLLLa.............", "....................aIIIIJJHIIHHIIHLLLLLa.............", "....................aIIIIHIHHHHHLLLLLHLLa.............", "....................aIIIIHHHIHHLHLLLLLLLa.............", ".................abJaHkHHHHlIaIaIHHIaHHIa.............", ".................aIamHInnlHnnlHkaHHbaHHIa.............", ".................abnHHIHnonnHHHlkaabaHHIa.............", ".................aKnIHonoooononnnnnKaKKKa.............", "................aKooooooooooooooooonmKKKKa............", "................amoaaaaooooaaanooolomKKKKa............", "................alkbbKjnoonbaqmoollomKKKKa............", "................alobIKnnoolbbqooolloIIIKKa............", ".................booooonnoolooooolloaKKKh.............", ".................hoooolollllolpollmoJKIa..............", "...................aoooooolmmmmmpomkaaa...............", "....................aoonooonnnonopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aaaaaalpoopSaaRaRRaaa...............", "................aRaoonakkkkaaRRRRaRappoa..............", ".................aonnnnanRnaRRRRRRapooooa.............", ".................aonnnnaanRSaaaSRRapooona.............", "................aonnnnnaanaaRRRRRRaooooooa............", "................aonnnnaRRWRRRWWWWWRapooona............", "...............annnnnnaRRRRRRWWWWWRaooooooa...........", "...............aannnnaRRRRRRRRRRRRRRaooonaa...........", "...............aoannanaaaRSSRRRRRaaapaonana...........", "...............annaannoonaSRRRRRapppooaaona...........", "................annnnnnnnnaRRRRapoooooonna............", ".................aannnnnnnaRRRRapoooonnaa.............", "...................aannnnnaRRRRaoooonaa...............", ".....................annnaaaaaaaaonna.................", "....................aNaaaMNMMMMMMaaaa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aMMNaaaNNMMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_run1:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "...........................aaaaaa.....................", "........................aKJIIIIIIIIa..................", "......................aKJKKKJKJIIHIHIa................", ".....................aJKKKJKKJJJHHIIHHa...............", "....................aIIIIJJIIHHHIILLHHLa..............", "....................aIIJJIIIHIJIIHHLHHIa..............", "...................aJKJIIIIIIIHHHHHIHLLa..............", "...................aJJIIIIJIHHHHHIHLLLLa..............", "...................aIIIIJJHIIHHIIHLLLLLa..............", "...................aIIIIHIHHHHHLLLLLHLLa..............", "...................aIIIIHHHIHHLHLLLLLLLa..............", "................abJaHkHHHHlIaIaIHHIaHHIa..............", "................aIamHInnlHnnlHkaHHbaHHIa..............", "................abnHHIHnonnHHHlkaabaHHIa..............", "................aKnIHonoooononnnnnKaKKKa..............", "...............aKooooooooooooooooonmKKKKa.............", "...............amoaaaaooooaaanooolomKKKKa.............", "...............alkbbKjnoonbaqmoollomKKKKa.............", "...............alobIKnnoolbbqooolloIIIKKa.............", "................booooonnoolooooolloaKKKh..............", ".................hoooolollllllplolmoJKIa..............", "...................aooooolmmmmmlpomkaaa...............", "....................aooooonnnonoopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aRRRaalpoopSaaRaRRaaa...............", "..................aaRaamooopkaaaaSSappoaa.............", ".................aooaSaammmmaaRRaaapooopoa............", "...............aaonnaRRanRnaRRRRRRapooooooa...........", "..............aoaonnaaRaRnRRSSaaRRaooooooooa..........", "..............aoaonnaRRRanaRaaRRRRRaonoooonaa.........", "..............aoannnnaRRWaRRRWWWWWRRaaononaooa........", ".............aonnaaaaaRRWaRRRWWWWRRRa.aaoaoona........", ".............aonnna..aRRRRSSRRRRRRSSa...apoona........", ".............aonnna..aRRSRSSRRRRRRRRa...apoona........", ".............aonnna..aRRSRSSRRRRRRRRa...apona.........", ".............aonnna..aRRSRRRRRRRRRRRa...apona.........", ".............aonnna..addabbbaadddaaaa..apooooa........", ".............annnna..aMMMNMMMMMMMNaa...aoooona........", "..............anna...aMMMNaaNMNNNNNa....aonna.........", "...............aa.....aMMMaaNNNNNNNa.....aaa..........", "......................aoonaannnnnncca.................", "......................aoonaaannnaaaa..................", "......................aWWZaaZZZZZZZa..................", "......................aaabaaccccckka..................", ".....................acccaa.aaaaaaa...................", ".....................acckda.a....ab...................", ".....................accccdda.........................", ".....................aaaaaaaa.........................", "......................bbbbbbb........................."],
y_run2:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "...........................aaaaaa.....................", "........................aKJIIIIIIIIa..................", "......................aKJKKKJKJIIHIHIa................", ".....................aJKKKJKKJJJHHIIHHa...............", "....................aIIIIJJIIHHHIILLHHLa..............", "....................aIIJJIIIHIJIIHHLHHIa..............", "...................aJKJIIIIIIIHHHHHIHLLa..............", "...................aJJIIIIJIHHHHHIHLLLLa..............", "...................aIIIIJJHIIHHIIHLLLLLa..............", "...................aIIIIHIHHHHHLLLLLHLLa..............", "...................aIIIIHHHIHHLHLLLLLLLa..............", "................abJaHkHHHHlIaIaIHHIaHHIa..............", "................aIamHInnlHnnlHkaHHbaHHIa..............", "................abnHHIHnonnHHHlkaabaHHIa..............", "................aKnIHonoooononnnnnKaKKKa..............", "...............aKooooooooooooooooonmKKKKa.............", "...............amoaaaaooooaaanooolomKKKKa.............", "...............alkbbKjnoonbaqmoollomKKKKa.............", "...............alobIKnnoolbbqooolloIIIKKa.............", "................booooonnoolooooolloaKKKh..............", ".................hoooolollllllplolmoJKIa..............", "...................aooooolmmmmmlpomkaaa...............", "....................aooooonnnonoopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aRRRaalpoopSaaRaRRaaa...............", "..................aSaakpooomaaaSRRSappoa..............", "...................aaRammmmaaaRSRRapooooa.............", "..................aoaRRanRnaRRRRRRapooona.............", "..................aoaaSRRnRaRRaaSSapooona.............", "..................aoaRaRanaRRRRRaaapooona.............", "..................aoaWWRRaWRRRRRa.aoooona.............", "..................aoaWWRRaWRRRRRa.aapoona.............", ".................aanaRRRSRRRRRRRaaaaonnna.............", ".................anaaRRRSRSRRRRaaappaaaaa.............", "..................anaRRRSRSRRRapppooooona.............", "...................aaRRRRRSRRapoooooonna..............", "....................aadabbaadapoooonnaa...............", ".....................aMMMNMMMaoooonaaa................", ".....................aNMaaNMMMaonnaNNa................", ".....................aNNaaMMMMMaaa..a.................", "....................annnnaanooooooa...................", ".....................annaaanoooonna...................", ".....................aZZZaaZWWWWZZa...................", ".....................acccaabaaaaaaa...................", "......................aaa.aacccccaaa..................", "......................ba..adkcccccca..................", "............................acccckka..................", "............................aaaaaaaa..................", "............................bbbbbbb..................."],
bare_act:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "..........................aaaaaa......................", ".......................aPPoooooQQQa...................", ".....................aPPPPPoooQQQQQQa.................", "....................aPPPgoooogoQQQQQYa................", "...................aPPPoPogoQQQQQYYYYYa...............", "...................agPPooooQooQQYYYggYa...............", "..................aiPPoooooQQQQQQYYjjga...............", "..................agPiooooQQQQYOYYYggja...............", "..................aigooOoQQQYQQYYYOjjja...............", "..................aiigoQYYYYYYYYYYOgjja...............", "..................aiiiQQQQQYYYYYYiigjga...............", "...............abfaakllllllaaaiiecaccca...............", "...............acammlnnlnnnlmkaaibaccca...............", "...............abncccenonnceelkaabaqjca...............", "...............ajnccccooooceeennfjajjga...............", "..............ajooooooooooooooofjnmggjga..............", "..............amoaaaaooooaaacooflomggjga..............", "...............alkbbqjnoonbaqmoollomggjga.............", "...............alobcqjnoolbbqooolloceegga.............", "................booooonnoolooooolloagggh..............", "................hoooolgllllilpoolmoigca...............", "..................aooejqqggqqiepomkaaa................", "...................aooefgjqqjffepobb..................", "....................anonnlkkkknnnpna..................", "....................aaonoommllooooaa..................", "..................abaloopooponlabaa...................", ".............aaaaaaaaaalpoopdaabacbaaaaaaaaa..........", "......aaaaaaaoahhhhhrakkkkaabbbbabaAAAAAAhaoa.........", ".....aoooooooahrrrrrrrarcrabbbcbbaAhhhhhhrana.........", "....aonnnnnnnahrrrrrrraarbdaaadbbaAhhhhhhrana.........", "....aonnnnnnnarrrrrrrraaraabbbbbbahhhhhhhrana.........", "....annnnnnnaaarrrrrrabcebbbjgggjbahrrrrraona.........", ".....annaaaa...aaaaaaabbbcbbbjgiiebaaaaaaoona.........", "......aa.............abbbcbbbbbbbbbba..apoona.........", ".....................abbbbddbbbbbbdda.apooona.........", "....................abbbbcdbbbbbbbbddaapooona.........", "....................abbbbcbbbbbbbbbddaaoooona.........", "....................abbbbcbbbbbbbbbba..aonna..........", ".....................abbdcbbbbbbbbbba...aaa...........", ".....................aaaabaaaaaaaaaaa.................", "....................abrrbrbrrrrrrrbba.................", "....................arrrbbbrrrrrrrbba.................", "....................arrbbaabbbrrrrbba.................", "....................arrba.haabrrrrbba.................", "....................arbaa.habbrrrrrbbr................", "...................aabbba.habbbaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
bare_throw:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "..........................aaaaaa......................", ".......................aPPoooooQQQa...................", ".....................aPPPPPoooQQQQQQa.................", "....................aPPPgoooogoQQQQQYa................", "...................aPPPoPogoQQQQQYYYYYa...............", "...................agPPooooQooQQYYYggYa...............", "..................aiPPoooooQQQQQQYYjjga...............", "..................agPiooooQQQQYOYYYggja...............", "..................aigooOoQQQYQQYYYOjjja...............", "..................aiigoQYYYYYYYYYYOgjja...............", "..................aiiiQQQQQYYYYYYiigjga...............", "................abfaakllllllaaaiiecaccca..............", "................acammlnnlnnnlmkaaibaccca..............", "................abncccenonnceelkaabaqjca..............", "................ajnccccooooceeennfjajjga..............", "...............ajooooooooooooooofjnmggjga.............", "...............amoaaaaooooaaacooflomggjga.............", "...............alkbbqjnoonbaqmoollomggjga.............", "...............alobcqjnoolbbqooolloceegga.............", "................booooonnoolooooolloagggh..............", "................hoooolgllllilpoolmoigca...............", ".......aaa........aooejqqggqqiepomkaaa................", "......aoona........aooefgjqqjffepobb..................", ".....aonnnnaa.......anonnlkkkknnnpna..................", ".....annnnnonaa.....aaonoommllooooaa..................", "......annnnnnonaaaabaloopooponlabaa...................", ".......aannnnnahhhraaaalpoopdaabacbaaaaaaaaa..........", ".........aannahrrrrhrakkkkaabbbbabaAAAAAAhaoa.........", "...........anahrrrrrrrarcrabbbcbbaAhhhhhhrana.........", "............aarrrrrrrraarbdaaadbbaAhhhhhhrana.........", "..............arrrrrrraaaraabbbbbahhhhhhhrana.........", "...............aaarrrabbcebbbjgggjahrrrrraona.........", "..................aaaabbbcbbbjgiiebaaaaaaoona.........", ".....................abbbcbbbbbbbbbba..apoona.........", ".....................abbbbddbbbbbbdda.apooona.........", "....................abbbbcdbbbbbbbbddaapooona.........", "....................abbbbcbbbbbbbbbddaaoooona.........", "....................abbbbcbbbbbbbbbba..aonna..........", ".....................abbdcbbbbbbbbbba...aaa...........", ".....................aaaabaaaaaaaaaaa.................", "....................abrrbrbrrrrrrrbba.................", "....................arrrbbbrrrrrrrbba.................", "....................arrbbaabbbrrrrbba.................", "....................arrba.haabrrrrbba.................", "....................arbaa.habbrrrrrbbr................", "...................aabbba.habbbaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
bare_aim:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "...........................aaaaaa.....................", "........................aPPoooooQQQa..................", "......................aPPPPPoooQQQQQQa................", ".....................aPPPgoooogoQQQQQYa...............", "....................aPPPoPogoQQQQQYYYYYa..............", "....................agPPooooQooQQYYYggYa..............", "...................aiPPoooooQQQQQQYYjjga..............", "...................agPiooooQQQQYOYYYggja..............", "...................aigooOoQQQYQQYYYOjjja..............", "...................aiigoQYYYYYYYYYYOgjja..............", "...................aiiiQQQQQYYYYYYiigjga..............", "................abfaakllllllaaaiiecaccca..............", "................acammlnnlnnnlmkaaibaccca..............", "................abncccenonnceelkaabaqjca..............", "................ajnccccooooceeennfjajjga..............", "...............ajooooooooooooooofjnmggjga.............", "...............amoaaaaooooaaacooflomggjga.............", "...............alkbbqjnoonbaqmoollomggjga.............", "...............alobcqjnoolbbqooolloceegga.............", "................booooonnoolooooolloagggh..............", "................hoooolgllllilpoolmoigca...............", "..................aooejqqggqqiepomkaaa................", "...................aooefgjqqjffepobb..................", "....................anonnlkkkknnnpna..................", "....................aaonoommllooooaa..................", "..................abaloopooponlabaa...................", "..............aaaaaaaaalpoopdaabacbaaaa...............", "............aaoahhhhhrakkkkaabbbbabaAAha..............", "...........aooahrrrrrrrarcrabbbcbbaAhhhha.............", "..........aonnahrrrrrrraarbdaaadbbaAhhhra.............", "........aaonnnarrrrrrrraaraaaaabbbaAhhhra.............", ".......aoonnnnnarrrrrrabcebappoaaaAhhhhra.............", "......aonnnnnna.aaaaaabbbcapooopoaAhhhra..............", "......aonnnnaa.......abbbcapoooooahhhhra..............", "......annnnna........abbbbaoooooooahrra...............", ".......annna........abbbbcdaonnnnooaaaa...............", "........aaa.........abbbbcbbaaaaaonnna................", "....................abbbbcbbbbbbbaaaa.................", ".....................abbdcbbbbbbbbbba.................", ".....................aaaabaaaaaaaaaaa.................", "....................abrrbrbrrrrrrrbba.................", "....................arrrbbbrrrrrrrbba.................", "....................arrbbaabbbrrrrbba.................", "....................arrba.haabrrrrbba.................", "....................arbaa.habbrrrrrbbr................", "...................aabbba.habbbaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
bare_hip:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "............................aaaaaa....................", ".........................aPPoooooQQQa.................", ".......................aPPPPPoooQQQQQQa...............", "......................aPPPgoooogoQQQQQYa..............", ".....................aPPPoPogoQQQQQYYYYYa.............", ".....................agPPooooQooQQYYYggYa.............", "....................aiPPoooooQQQQQQYYjjga.............", "....................agPiooooQQQQYOYYYggja.............", "....................aigooOoQQQYQQYYYOjjja.............", "....................aiigoQYYYYYYYYYYOgjja.............", "....................aiiiQQQQQYYYYYYiigjga.............", ".................abfaakllllllaaaiiecaccca.............", ".................acammlnnlnnnlmkaaibaccca.............", ".................abncccenonnceelkaabaqjca.............", ".................ajnccccooooceeennfjajjga.............", "................ajooooooooooooooofjnmggjga............", "................amoaaaaooooaaacooflomggjga............", "................alkbbqjnoonbaqmoollomggjga............", "................alobcqjnoolbbqooolloceegga............", ".................booooonnoolooooolloagggh.............", ".................hoooolgllllilpoolmoigca..............", "...................aooejqqggqqiepomkaaa...............", "....................aooefgjqqjffepobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aaaaaalpoopdaabacbaaa...............", "................abahhrakkkkaabbbbabaAAha..............", ".................ahrrrrarcrabbbcbbaAhhhha.............", ".................ahrrrraarbdaaadbbaAhhhra.............", "................ahrrrrraaraabbbbbbahhhhhha............", "................ahrrrrabcebbbjgggjbaAhhhra............", "...............arrrrrrabbcbbbjgiiebahhhhhha...........", "...............aarrrrabbbcbbbbbbbbbbahhhraa...........", "...............aoarranaaabddbbbbbaaapahrana...........", "...............annaannoonadbbbbbapppooaaona...........", "................annnnnnnnnabbbbapoooooonna............", ".................aannnnnnnabbbbapoooonnaa.............", "...................aannnnnabbbbaoooonaa...............", ".....................annnaaaaaaaaonna.................", "....................abaaarbrrrrrraaaa.................", "....................arrrbbbrrrrrrrbba.................", "....................arrbbaabbbrrrrbba.................", "....................arrbaaabbrrrrrbba.................", "....................arrba.haabrrrrbba.................", "....................arbaa.habbrrrrrbbr................", "...................aabbba.habbbaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
bare_wind:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", ".............................aaaaaa...................", "..........................aPPoooooQQQa................", "........................aPPPPPoooQQQQQQa..............", ".......................aPPPgoooogoQQQQQYa.............", "......................aPPPoPogoQQQQQYYYYYa............", "......................agPPooooQooQQYYYggYa............", ".....................aiPPoooooQQQQQQYYjjga............", ".....................agPiooooQQQQYOYYYggja............", ".....................aigooOoQQQYQQYYYOjjja............", ".....................aiigoQYYYYYYYYYYOgjja............", ".....................aiiiQQQQQYYYYYYiigjga............", "..................abfaakllllllaaaiiecaccca............", "..................acammlnnlnnnlmkaaibaccca............", "..................abncccenonnceelkaabaqjca............", "..................ajnccccooooceeennfjajjga............", ".................ajooooooooooooooofjnmggjga...........", ".................amoaaaaooooaaacooflomggjga...........", ".................alkbbqjnoonbaqmoollomggjga...........", ".................alobcqjnoolbbqooolloceegga...........", "..................booooonnoolooooolloagggh............", "..................hoooolgllllilpoolmoigca.............", "....................aooejqqggqqiepomkaaa..............", ".....................aooefgaaajffepobb................", "......................anonaoonaknnnpna................", "......................aaoaonnnnaooooaa................", "....................abaloaonnnnalabaa.................", "...................aaabaaaonnnnaabacaaa...............", "................abahhraaaaonnnabbabaAAha..............", ".................ahrrrhhrannnabcbbaAhhhha.............", ".................ahrrrrrrrannaadbbaAhhhra.............", ".................arrrrrrrrannaaaabaAhhhra.............", "..................arrrrrrranaappoaaAhhhra.............", "...................aarrrrannapooopaAhhhra.............", ".....................aaaaaaaapooooahhhhra.............", ".....................abbbbddaooooooahrraa.............", "....................abbbbcdbbaonnnnoaaana.............", "....................abbbbcbbbbaaaaaonnna..............", "....................abbbbcbbbbbbbbbaaaa...............", ".....................abbdcbbbbbbbbbba.................", ".....................aaaabaaaaaaaaaaa.................", "....................abrrbrbrrrrrrrbba.................", "....................arrrbbbrrrrrrrbba.................", "....................arrbbaabbbrrrrbba.................", "....................arrba.haabrrrrbba.................", "....................arbaa.habbrrrrrbbr................", "...................aabbba.habbbaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."]
};
const mir=rows=>rows.map(r=>r.split('').reverse().join(''));
let ready=false,saved=null;
const ensureArt=()=>{ if(ready) return; ready=true; const sp=BSP(); Object.assign(sp.pal,NEWPAL);
  const W=FR.y_hip[0].length,eyeOf=k=>(sp.eyeAt&&sp.eyeAt.get(sp[k]))||sp.eye,handOf=k=>sp.handAt&&sp.handAt.get(sp[k]);
  const reg=(rows,src,flip)=>{ if(sp.eyeAt) { const e=eyeOf(src); sp.eyeAt.set(rows,flip?{col:W-1-e.col,row:e.row}:e); }
    if(sp.handAt) { const h=handOf(src); if(h) { const m=p=>flip?[W-1-p[0],p[1]]:p; sp.handAt.set(rows,{n:m(h.n),f:m(h.f)}); } } };
  for(const k of ['act','throw','aim','hip','wind']) reg(FR['bare_'+k],k,false);
  for(const k of ['wind','spread','hip','run1','run2']) reg(FR['y_'+k],k,false);
  FR.y_run1R=mir(FR.y_run1); FR.y_run2R=mir(FR.y_run2); reg(FR.y_run1R,'run1',true); reg(FR.y_run2R,'run2',true);
  for(const k of ['act','throw','aim','hip','wind']) sp['bare_'+k]=FR['bare_'+k]; };
const youngOn=()=>{ ensureArt(); const sp=BSP(); if(saved) return; saved={wind:sp.wind,spread:sp.spread,hip:sp.hip,run:sp.run,runFlip:sp.runFlip};
  if(sp.yg_ready) { sp.wind=sp.yg_ready; sp.spread=sp.yg_wind; sp.hip=sp.yg_celebr; sp.run=[sp.yg_run1,sp.yg_run2]; sp.runFlip=[sp.yg_run1R,sp.yg_run2R]; return; }   // painted young runner
  sp.wind=FR.y_wind; sp.spread=FR.y_spread; sp.hip=FR.y_hip; sp.run=[FR.y_run1,FR.y_run2]; sp.runFlip=[FR.y_run1R,FR.y_run2R]; };
const youngOff=()=>{ if(!saved) return; const sp=BSP(); Object.assign(sp,saved); saved=null; };
// ---- the baseball cap, drawn at final size (hand at the origin, brim to the left) ----
const bigCap=(x,y,ang)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.lineJoin='round'; gfx.lineCap='round';
  if(PROPART.draw('boppy/baseball_cap',-52,-8,{w:126})) { gfx.restore(); return; }   // painted cap; the drawn one below is the fallback
  const path=fn=>{ gfx.beginPath(); fn(); gfx.closePath(); };
  // brim: curved, with a lighter top edge, a dark underside and stitch rows
  path(()=>{ gfx.moveTo(-50,-2); gfx.bezierCurveTo(-76,-6,-102,-2,-114,10); gfx.bezierCurveTo(-104,22,-74,20,-46,12); });
  gfx.fillStyle='#37343a'; gfx.fill(); gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke();
  path(()=>{ gfx.moveTo(-50,-2); gfx.bezierCurveTo(-76,-6,-102,-2,-114,10); gfx.bezierCurveTo(-98,6,-72,4,-48,5); });
  gfx.fillStyle='#6e6b72'; gfx.fill();
  gfx.strokeStyle='#a9a7ae'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(-56,0); gfx.bezierCurveTo(-78,-3,-98,0,-108,8); gfx.stroke();
  gfx.strokeStyle='#201e22'; gfx.lineWidth=2; gfx.setLineDash([3,3]); gfx.beginPath(); gfx.moveTo(-54,8); gfx.bezierCurveTo(-76,9,-96,11,-106,12); gfx.stroke(); gfx.setLineDash([]);
  // crown dome
  path(()=>{ gfx.moveTo(-70,10); gfx.bezierCurveTo(-76,-22,-50,-38,-28,-38); gfx.bezierCurveTo(-4,-38,12,-22,10,10); });
  gfx.fillStyle=CAPC; gfx.fill(); gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke();
  // light from the upper left, shade on the right
  path(()=>{ gfx.moveTo(-66,2); gfx.bezierCurveTo(-70,-20,-50,-34,-30,-34); gfx.bezierCurveTo(-48,-26,-58,-14,-60,2); }); gfx.fillStyle='#6d6b70'; gfx.fill();
  path(()=>{ gfx.moveTo(10,10); gfx.bezierCurveTo(12,-22,-4,-38,-28,-38); gfx.bezierCurveTo(-2,-30,4,-14,2,10); }); gfx.fillStyle='#3e3c40'; gfx.fill();
  // panel seams converge on the button
  gfx.strokeStyle='#2a282c'; gfx.lineWidth=2;
  for(const [bx,cx] of [[-64,-52],[-48,-40],[-18,-14],[0,0]]) { gfx.beginPath(); gfx.moveTo(-28,-36); gfx.quadraticCurveTo(cx,-14,bx,8); gfx.stroke(); }
  // front panel patch
  RO(-60,-16,16,12,'#d9cba8'); Ln(-57,-10,-47,-10,2,'#8a4a2e'); Ln(-57,-7,-50,-7,2,'#8a4a2e');
  // sweatband
  R(-71,5,82,7,'#2f2d31'); Ln(-70,6,9,6,1.5,'#777479');
  // button on top
  E(-28,-38,5,4,OUT); E(-28,-38,3.4,2.6,'#8a888e'); E(-29,-39,1.4,1,'#c8c6cc');
  gfx.restore(); };
SC.bv_cap=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.off||ms>P.on) return; const h=hand(),px=h.x+4,py=h.y; let ang=-1.25;
  for(const [a,b] of P.sw) { if(ms>=a&&ms<b) ang=lerp(-1.25,.55,ez((ms-a)/(b-a))); else if(ms>=b&&ms<b+200) ang=lerp(.55,-1.25,ez((ms-b)/200)); }
  if(ms>=P.sw[2][1]) ang=lerp(.55,.15,ez((ms-P.sw[2][1])/300));
  if(ms<P.off+200) ang=lerp(-2.4,-1.25,ez((ms-P.off)/200));
  P.sw.forEach(([a,b],k)=>{ if(ms<a||ms>b+320) return; const cur=ms<b?lerp(-1.25,.55,ez((ms-a)/(b-a))):.55,al=ms<b?1:1-(ms-b)/320;
    for(const [r,w,c] of [[REACH*.95,9,OUT],[REACH*.95,5,k===2?GOLD:'#ffffff'],[REACH*.7,4,OUT],[REACH*.7,2,'#dfe8f0']]) { gfx.globalAlpha=al*(c===OUT?.7:.9); gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(px,py,r,Math.PI-1.25,Math.PI+cur); gfx.stroke(); } });
  gfx.globalAlpha=1; if(!BSP().x_swat) bigCap(px,py,ang);
  const st=s.st; if(st&&st.x!=null&&ms<P.off+700) { const p=head(st,8),q=(ms-P.off)/700; gfx.globalAlpha=1-q; for(let k=0;k<3;k++) { const sx=p.x-14+k*12,sy=p.y-14-k%2*6; Ln(sx-3-q*6,sy,sx+3+q*6,sy,2,'#ffffff'); Ln(sx,sy-3-q*6,sx,sy+3+q*6,2,'#ffffff'); } } };
B.cap_swat=E2=>{ ensureArt(); const SW=BSP().x_swat?'x_swat':'bare_throw',SF=BSP().x_follow?'x_follow':'bare_act'; const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const sw=[[1800,1950],[2150,2300],[2500,2650]],hit=2650;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1200,x:p.x,y:p.y,f:'hip'},{t:1450,f:SF},
    {t:1800,f:SW,dx:-6},{t:1950,f:SF},{t:2150,f:SW,dx:-8},{t:2300,f:SF},{t:2500,f:SW,dx:u=>-6-ez(u)*8},{t:2950,f:SF},
    {t:3200,f:'hip'},{t:3450,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. Something is pestering his family.'); say(m.id,'cap_swat'); scene('bv_cap',3.3,{st,P:{off:1450,on:3200,sw}}); scene('bv_dodge',2.6,{f,P:{d1:1850,d2:2200}}); }],
    [1450,()=>{ sfx.select(); setMessage('He takes the cap off. Here we go.'); }],
    [1800,()=>{ sfx.whoosh(); }],
    [1950,()=>{ setMessage('Swat! Missed.'); scene('bv_big',.7,{x:F.x-30,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:-.12}); }],
    [2150,()=>{ sfx.whoosh(); }],
    [2300,()=>{ setMessage('Swat! Missed again. It\'s quick.'); scene('bv_big',.7,{x:F.x+26,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:.12}); }],
    [2500,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('bp2_rings',.6,{x:F.x+8,y:F.mid,c:GOLD,r:60}); scene('bv_flash',.25,{a:.35}); scene('bv_big',1.1,{x:F.x,y:F.top-74,txt:'SWAT!',c:GOLD,sc:5}); }],
    [3200,()=>{ sfx.select(); setMessage('The cap goes back on. Same angle as always.'); }],
    [4500,'end',res(E2)+'Like a mosquito. A big one.']]); };
// ---- Van Cortlandt Park '70: young Boppy during the flashback ----
// the tank top is part of the young sprite now, so the old singlet overlay only adds the bib
SC.b5_singlet=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const sc=st.sc||1,H=BH()*sc,sp=BSP(),fl=sp.runFlip&&sp.runFlip.includes(st.frame)||st.frame===sp.flip?-1:1;
  const x=st.x+3*fl*sc,y0=st.y-H*.42; gfx.globalAlpha=fin(u,.04);
  if(!PROPART.draw('boppy/race_bib',x,y0+6.5*sc,{w:12*sc})) { RO(x-5*sc,y0+3*sc,10*sc,7*sc,'#ffffff'); label('70',x,y0+4.5*sc,OUT,Math.max(1,Math.round(sc*1.3))); }
  gfx.globalAlpha=1; };
const xc=B.xc_ult;
B.xc_ult=E2=>{ youngOff(); ensureArt(); const play=ST.play;
  ST.play=(e,list)=>{ ST.play=play; return play(e,[...list,[700,youngOn],[4590,youngOff],[6800,youngOff]]); };
  try { return xc(E2); } finally { ST.play=play; } };
})();
