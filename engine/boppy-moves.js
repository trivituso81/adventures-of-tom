'use strict';
// engine/boppy-moves.js: Boppy's Option 3 Primary kit (phase 4b), as set pieces on engine/stage.js (the standard from
// phase 4a on). His legacy moves stay in engine/recruit-moves.js; GRUMBLE's legacy animation is in engine/battle2-moves.js
// and hands over to grumbleShow below for the Option 3 version. Boppy walks over at his own pace (everybody else walks
// too fast), fishes, sits, eats one pepper, tells the 1970 story, and goes home.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix ba_.
// Loaded after engine/deedee-moves.js.
// ================= Option 3 Primary kit, painted (Nov 2026) =================
// The twelve Primary moves play Boppy's approved painted ability sheets (data/boppy-ab.js, f:'ab_<sheet>_<n>'). The props he holds (cap, ticket
// dispenser, key ring, seed packet, jar, rod, pepper) are painted into those frames, so nothing here draws them. Separate objects (cell bars, the
// FAMILY FIRST ticket, pond, recliner, 1970 cards, chairs, fire alarm, stop sign) stay props. Scenes prefix ba_ (no aim warp).
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>paintHeart(x,y+r*.3,r*1.15,c);
const steam=(x,y,t,n=4,c='#fff6dc',h=40)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.23)%1; gfx.globalAlpha=a0*(1-q); E(x-12+k*8+Math.sin(q*6+k)*4,y-q*h,4+q*3,4+q*3,c); } gfx.globalAlpha=a0; };
const B=RECRUIT_MOVES.boppy;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',BLUE='#9fc4f0',RED='#e0402e',WATER='#7cc4f4',IRON='#4a4f58',IRONL='#8a929e',BRASS='#d8b24a',SEPIA='#f0dcb0',WOOD='#b88848',LEATHER='#7a4a2e',GHOST='#f4f1ff';
ST.nw('ba_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.72+dy});
// painted frames know their mouth and rod tip (data/boppy-hires-battle.js); drawn pieces anchor there
const at=(st,map,fb)=>{ const sp=st.sp,fr=st.frame,q=sp&&sp[map]&&fr&&sp[map].get(fr); if(q) { const sc=sp.scale*(st.sc||1); return {x:st.x-fr[0].length*sc/2+q.col*sc,y:st.y-fr.length*sc+q.row*sc}; } return fb(st); };
const mouth=st=>at(st,'mouthAt',s=>({x:s.x-10,y:s.y-BH()*(s.sc||1)*.7}));
const tip=st=>at(st,'tipAt',s=>({x:s.x-60,y:s.y-BH()*(s.sc||1)*.5}));
const back=(x,me)=>x<me.x?'walkR':'walk';
const amble=(x,me)=>x<me.x?'walk':'walkR';
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
if(!sfx.clang) sfx.clang=(d=0)=>{ tone({type:'square',f0:520,f1:470,dur:.55,vol:.13,delay:d,filter:2400}); tone({type:'triangle',f0:1310,dur:.7,vol:.08,delay:d}); noise({dur:.25,vol:.26,delay:d,f0:3200,f1:900}); };
if(!sfx.jangle) sfx.jangle=(d=0,n=6)=>{ for(let k=0;k<n;k++) tone({type:'triangle',f0:2300+((k*577)%900),dur:.07,vol:.07,delay:d+k*.07}); };
if(!sfx.siren) sfx.siren=(d=0)=>{ for(let k=0;k<4;k++) tone({type:'sawtooth',f0:k%2?660:880,f1:k%2?880:660,dur:.3,vol:.08,delay:d+k*.3,filter:1800,sweep:'lin'}); for(let k=0;k<12;k++) tone({type:'square',f0:1900,dur:.035,vol:.05,delay:d+k*.06}); };
if(!sfx.crunch) sfx.crunch=(d=0)=>{ noise({dur:.11,vol:.3,delay:d,f0:2600,f1:900}); noise({dur:.1,vol:.25,delay:d+.13,f0:2200,f1:800}); };
if(!sfx.flame) sfx.flame=(d=0,dur=.8)=>{ noise({dur,vol:.28,delay:d,f0:400,f1:1500,type:'lowpass'}); tone({type:'sawtooth',f0:90,f1:60,dur,vol:.08,delay:d,filter:300}); };

// ---------- Shared scenes ----------
SC.ba_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.ba_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; } const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.ba_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.ba_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,3,s.c||CREAM); } };
SC.ba_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.ba_shield=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.7)*.9; ring(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,4,s.c||BLUE); gfx.globalAlpha*=.25; E(s.x,s.y,(s.rx||32)*g,(s.ry||48)*g,s.c||BLUE); };
SC.ba_smoke=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const q=cl(u*1.2-k*.05); if(q<=0) continue; gfx.globalAlpha=(1-q)*.75; E(s.x-24+k*8+Math.sin(k*3+q*5)*6,s.y-q*(s.h||50),7+q*9,7+q*9,s.c||'#6a6460'); } };
SC.ba_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.ba_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.ba_dodge=(s,u)=>{ const ms=s.t*1000,P=s.P,f=s.f; if(!f) return; const q1=cl((ms-P.d1)/450),q2=cl((ms-P.d2)/450);
  if(q1>0&&q1<1) lift(f,Math.sin(q1*Math.PI)*16,0,0); else if(q2>0&&q2<1) lift(f,0,-Math.sin(q2*Math.PI)*.18,-Math.sin(q2*Math.PI)*18); };

// ---------- Cap Check (cap sheet: 9 frames; the cap is painted in his hand) ----------
B.cap_swat=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const hit=2650;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_cap_9'},{t:1450,f:'ab_cap_2'},
    {t:1700,f:'ab_cap_4'},{t:1800,f:'ab_cap_3',dx:-6},{t:1950,f:'ab_cap_2'},{t:2050,f:'ab_cap_4'},{t:2150,f:'ab_cap_3',dx:-8},{t:2300,f:'ab_cap_2'},{t:2400,f:'ab_cap_4'},{t:2500,f:'ab_cap_3',dx:u=>-6-ez(u)*8},
    {t:2950,f:'ab_cap_7',dx:-2},{t:3200,f:'ab_cap_6'},{t:3450,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. At his own pace. Something is pestering his family.'); say(m.id,'cap_swat'); scene('ba_dodge',2.6,{f,P:{d1:1850,d2:2200}}); }],
    [1450,()=>{ sfx.select(); setMessage('He takes the cap off. Here we go.'); }],
    [1800,()=>{ sfx.whoosh(); }],
    [1950,()=>{ setMessage('Swat! Missed.'); scene('ba_big',.7,{x:F.x-30,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:-.12}); }],
    [2150,()=>{ sfx.whoosh(); }],
    [2300,()=>{ setMessage('Swat! Missed again. It\'s quick.'); scene('ba_big',.7,{x:F.x+26,y:F.top-46,txt:'MISS',c:CREAM,sc:3,rot:.12}); }],
    [2500,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.slash(); sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('ba_rings',.6,{x:F.x+8,y:F.mid,c:GOLD,r:60}); scene('ba_flash',.25,{a:.35}); scene('ba_big',1.1,{x:F.x,y:F.top-74,txt:'SWAT!',c:GOLD,sc:5}); }],
    [3200,()=>{ sfx.select(); setMessage('The cap goes back on. Same angle as always.'); }],
    [4500,'end',res(E2)+'Like a mosquito. A big one.']]); };

// ---------- GRUMBLE ----------
SC.ba_arrow=(s,u)=>{ const ms=s.t*1000,P=s.plan,x=P.x,y=P.y; if(ms<P.on) return; gfx.globalAlpha=fade(u,.9);
  const sq=ez((ms-P.stop)/260);
  if(sq<1) { const zip=Math.sin(ms/40)*4; gfx.save(); gfx.translate(x+zip,y); gfx.scale(lerp(1,.1,sq),1);
    const pw=PROPART.draw('boppy/walking_speed_sign',2,12,{h:86});
    if(!pw) { gfx.beginPath(); gfx.moveTo(60,-10); gfx.lineTo(-30,-10); gfx.lineTo(-30,-22); gfx.lineTo(-64,0); gfx.lineTo(-30,22); gfx.lineTo(-30,10); gfx.lineTo(60,10); gfx.closePath();
    gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#9be39a'; gfx.fill(); }
    gfx.restore();
    if(sq<.2) { for(let k=0;k<3;k++) R(x+70+k*10+((ms/30+k*7)%10),y-12+k*12,14,2,'rgba(255,246,220,.8)'); if(!pw) label('WALKING SPEED',x,y-36,CREAM,1); } }
  else { if(PROPART.draw('boppy/stop_sign',x,y+10,{h:74})) return; const r=22; gfx.beginPath(); for(let k=0;k<8;k++) { const a=Math.PI/8+k*Math.PI/4; const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#d8343a'; gfx.fill(); label('STOP',x,y-3,CREAM,1); } };
B.grumbleShow=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,74),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_grumble_1',dx:(u,tt)=>Math.sin(tt*3)*1},{t:1900,f:'ab_grumble_5',dx:u=>-ez(u)*4},{t:2300,f:'ab_grumble_3',dx:(u,tt)=>u<.2?Math.sin(tt*40)*2:0},{t:3400,f:'ab_grumble_2'},{t:3700,f:back(p.x,me),hop:2,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks out in front. Slowly. He sits down where everybody can see him.'); say(m.id,'grumble'); scene('ba_arrow',3.6,{plan:{x:Gp.x,y:Math.max(40,Gp.top-34),on:1200,stop:2300}}); }],
    [1300,()=>{ sfx.sulk&&sfx.sulk(); scene('ba_text',1.4,{st,txt:'TOO FAST',c:CREAM,sc:2}); setMessage('He points at the walking speed. It\'s wildly overenthusiastic.'); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.stun(); sfx.thud(); scene('ba_shield',1.2,{x:p.x,y:p.y-BH()*.45,rx:30,ry:46,c:GOLD}); }],
    [2700,()=>{ setMessage('The grumble squashes it into a stop sign. He braces in front.'); }],
    [3400,()=>{ setMessage('They all face him. He keeps one eye on his family.'); }],
    [4800,'end','The complaint is also a defensive formation.']]); };

// ---------- Patient Angler (angler sheet: 1 to 3 seated with the rod, 4 to 6 standing on the hook) ----------
SC.ba_pond=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.on) return; const g=ez((ms-P.on)/300); gfx.globalAlpha=fade(u,.9)*g*.9;
  if(!PROPART.draw('boppy/pond',P.x,P.y-6,{w:128*g,h:70*g})) { E(P.x,P.y,56*g,13*g,'#4f8fc8'); E(P.x-8,P.y-2,34*g,6*g,'#8fc8f4'); } for(let k=0;k<2;k++) { const q=(s.t*.7+k*.5)%1; gfx.globalAlpha=fade(u,.9)*g*(1-q)*.8; ring(P.x,P.y,10+q*48,3+q*11,2,'#d8f0ff'); } };
SC.ba_line=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const T=tip(st); gfx.globalAlpha=fade(u,.97);   // the rod is painted; the line starts at its tip
  if(ms>P.sit&&ms<P.home) { let fx2=P.fx,fy=P.fy+Math.sin(ms/260)*1.5;
    if(ms>P.nudge&&ms<P.nudge+300) fy+=Math.sin((ms-P.nudge)/300*Math.PI)*7;
    if(ms>P.tug) { const q=ez((ms-P.tug)/350); fx2=lerp(P.fx,P.fx+50,q); fy=lerp(P.fy,P.fy-70,q); }
    if(ms<P.tug+350) { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(T.x,T.y); gfx.quadraticCurveTo((T.x+fx2)/2,ms>P.tug?(T.y+fy)/2:Math.max(T.y,fy)+14,fx2,fy); gfx.stroke();
      if(!PROPART.draw('boppy/bobber',fx2+3,fy-6,{h:32})) { EO(fx2,fy,7,9,CREAM); R(fx2-7,fy-2,14,5,RED); } }
    else { gfx.strokeStyle='rgba(255,255,255,.85)'; gfx.lineWidth=2; const ty=P.ft+(ms<P.reel1?0:-ez((ms-P.reel1)/300)*10); gfx.beginPath(); gfx.moveTo(T.x,T.y); gfx.lineTo(P.fx+10,ty); gfx.stroke(); }
    if(ms>P.sit+200&&ms<P.nudge) bigWord('PATIENCE',T.x+40,T.y-30,CREAM,2);
    if(ms>P.nudge&&ms<P.tug) bigWord('NUDGE',P.fx,P.fy-34,CREAM,2);
    if(ms>P.reel0+150&&ms<P.reel1+200) bigWord('REEL REEL',T.x+50,T.y-40,GOLD,2); } };
SC.ba_splash=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=fade(u,.6);
  for(let k=0;k<16;k++) { const a=Math.PI*(1.06+k/15*.88),sp=56+(k%4)*16,q=ez(u*1.4),px=x+Math.cos(a)*sp*q*.9,py=y+Math.sin(a)*sp*q*1.5+u*u*90; EO(px,py,4,6,k%2?WATER:'#d8f0ff'); }
  const col=Math.sin(cl(u*1.6)*Math.PI); if(col>0) { E(x,y-col*40,14,col*44,'#bfe6ff'); E(x,y-col*40,8,col*34,'#ffffff'); }
  gfx.globalAlpha=fade(u,.5)*.8; ring(x,y,20+u*60,5+u*14,3,'#d8f0ff'); };
SC.ba_yank=(s,u)=>{ const ms=s.t*1000,q=cl(ms/700); if(q<1) lift(s.f,-Math.sin(q*Math.PI)*34,Math.sin(q*Math.PI*2)*.25,Math.sin(q*Math.PI)*14); };
B.patient_angler=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,84),me=ST.unit(m);
  const P={sit:1150,nudge:2000,tug:2500,reel0:2850,reel1:3500,home:3700,fx:F.x+F.w*.5+20,fy:F.base-2,ft:F.mid};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1150,x:p.x,y:p.y,f:'ab_angler_1'},{t:1450,f:'ab_angler_2'},{t:1850,f:'ab_angler_3'},{t:2200,f:'ab_angler_2'},{t:2500,f:'ab_angler_4',dx:u=>ez(u)*8},
    {t:2850,f:(u,tt)=>Math.floor(tt*7)%2?'ab_angler_5':'ab_angler_6',dx:(u,tt)=>6+Math.sin(tt*30)*2},{t:3500,f:'ab_angler_6',hop:6},{t:3800,f:back(p.x,me),hop:2,hn:6},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with his rod and sits down. The fish can wait for him.'); say(m.id,'patient_angler'); scene('ba_line',3.8,{P,st}); scene('ba_pond',3.7,{P:{on:1100,x:P.fx,y:P.fy+3}}); }],
    [2000,()=>{ ST.jolt(f,.12); sfx.boop?sfx.boop():sfx.select(); setMessage(cap(f.def?f.def.the:'it')+' gets impatient and nudges the float.'); }],
    ['hf',2500],
    [2500,()=>{ sfx.whoosh(); sfx.splat(); ST.jolt(f,.5); landHit(100); scene('ba_splash',1.1,{x:P.fx,y:P.fy}); scene('ba_yank',.8,{f}); scene('ba_big',1.1,{x:F.x,y:F.top-74,txt:'SPLASH!',c:'#bfe6ff',sc:4}); setMessage('Hook set! The whole pond jumps.'); }],
    [2850,()=>{ for(let k=0;k<6;k++) tone({type:'square',f0:900,dur:.03,vol:.06,delay:k*.1}); setMessage('He reels it in. Slow and steady. His pace.'); }],
    [3500,()=>{ sfx.ding(); }],
    [4900,'end',res(E2)+'The patience was a trap.']]); };

// ---------- Recliner Reservation (recliner sheet: 1 hips, 2 point, 3 welcome, 4 thumbs up, 5 arms crossed, 6 facepalm) ----------
const CS=1.9;
const chair=(x,base,foot,sc=1)=>{ gfx.save(); gfx.translate(x,base); gfx.scale(sc,sc);
  if(PROPART.draw('boppy/recliner',10,-31,{h:64})) { gfx.restore(); return; }
  R(-14,-4,3,6,OUT); R(12,-4,3,6,OUT);
  RO(-18,-62,22,46,LEATHER); R(-15,-58,16,40,'#8a5a36'); R(-13,-54,12,4,'#9c6a42'); R(-13,-44,12,4,'#9c6a42');
  RO(-18,-24,34,14,'#8a5a36'); R(-15,-22,28,3,'#9c6a42'); RO(-22,-34,8,22,LEATHER); RO(12,-34,8,22,LEATHER);
  if(foot>0) RO(16,-20,22*foot,8,'#8a5a36');
  gfx.restore(); };
const RECL=[];   // who is sitting in the chair right now: {m,st,t0,t1} (st = their ST.keys state)
SC.ba_chair=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.drop) return; const land=P.drop+450,d=cl((ms-P.drop)/450),y=lerp(P.y-330,P.y,d*d); gfx.globalAlpha=fade(u,.95);
  const a0=gfx.globalAlpha;
  if(d<1) { gfx.globalAlpha=a0*.45; E(P.x,P.y,36*d+8,6,'#000'); gfx.globalAlpha=a0; }
  const sq=ms>land&&ms<land+300?Math.sin((ms-land)/300*Math.PI)*.14:0;
  gfx.save(); gfx.translate(P.x,y); gfx.scale(1+sq,1-sq); gfx.translate(-P.x,-y); chair(P.x,y,ez((ms-P.foot)/400),CS); gfx.restore();
  for(const r of RECL) { const st=r.st,sp=st&&st.sp,fr=st&&st.frame; if(ms<r.t0||ms>=r.t1||!sp||!fr||st.x==null) continue;   // whoever sits in the chair is drawn again on top
    const w=fr[0].length*sp.scale,h=fr.length*sp.scale; gfx.save(); gfx.globalAlpha=1; gfx.translate(st.x,st.y-h/2); rideBodyDraw(r.m,fr,sp.pal,-w/2,-h/2,sp.scale,{}); gfx.restore(); }
  gfx.globalAlpha=a0;
  const top=y-62*CS;
  if(ms<P.card) { if(!PROPART.draw('boppy/reserved_card',P.x,top-14,{w:84})) { RO(P.x-40,top-30,80,22,CREAM); label('RESERVED',P.x,top-24,RED,2); } }
  else if(ms<P.card+700) { const q=(ms-P.card)/700; gfx.save(); gfx.translate(P.x+q*110,top-19-Math.sin(q*Math.PI)*60); gfx.rotate(q*5); if(!PROPART.draw('boppy/reserved_card',0,5,{w:84})) { RO(-40,-11,80,22,CREAM); label('RESERVED',0,-5,RED,2); } gfx.restore(); }
  if(ms>land&&ms<land+800) { gfx.globalAlpha=a0; bigWord('THUMP!',P.x+10,top-52,CREAM,3); }
  if(ms>P.comfy&&ms<P.comfy+1100) { gfx.globalAlpha=a0; bigWord('COMFY?',P.x-12,top-64,GOLD,3); } };
SC.ba_thump=(s,u)=>{ const ms=s.t*1000; if(ms<s.land) return; if(!s.done) { s.done=1; sfx.bonk&&sfx.bonk(); } const q=cl((ms-s.land)/700);
  for(let k=0;k<14;k++) { const side=k%2?1:-1,d=(24+(k%7)*10)*ez(q); gfx.globalAlpha=(1-q)*.85; E(s.x+side*(40+d),s.y-4-Math.sin(ez(q)*Math.PI)*(6+(k%3)*7),7+q*10,5+q*7,k%3?'#d8cbb0':'#f0e6d0'); }
  gfx.globalAlpha=(1-q)*.8; ring(s.x,s.y,20+q*90,4+q*16,4,CREAM); };
B.recliner_reservation=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),self=t===m,me=ST.unit(m),foe=t.side==='foe';
  const deedee=!foe&&B2.party.find(p=>p.id==='deedee'&&p!==t&&b2Alive(p)),DU=deedee?ST.unit(deedee):null;
  const cx=Math.round(H.x-H.w*.5-6),cy=Math.min(316,H.base+2),sp={x:Math.min(560,H.x+H.w*.5+26),y:Math.min(316,H.base+3)};
  let K,end;
  if(self) { K=[{t:0,x:'home',y:'home',f:'ab_recliner_1'},{t:500,f:'ab_recliner_2'},{t:1300,f:'ab_recliner_3'},{t:1700,f:'ab_recliner_1'},{t:2200,f:'walk',hop:2,hn:3},{t:2700,x:cx+2,y:cy,f:'sit'},{t:3700,f:'sit'},{t:3900,f:'walkR',hop:2,hn:3},{t:4400,x:'home',y:'home',f:'idle'}]; end=4500; }
  else { K=[{t:0,x:'home',y:'home',f:amble(sp.x,me),hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'ab_recliner_1'},{t:1300,f:'ab_recliner_2'},{t:1700,f:'ab_recliner_5'},{t:2000,f:'ab_recliner_1'},{t:2300,f:'ab_recliner_3',dx:(u,tt)=>Math.sin(tt*10)*2},{t:3000,f:'ab_recliner_4',hop:6},{t:3300,f:back(sp.x,me),hop:2,hn:6},{t:4300,x:'home',y:'home',f:'idle'}]; end=4400; }
  const st=ST.keys(fx,K);
  const plan={x:cx,y:cy,drop:self?300:900,card:self?1300:1700,foot:self?1700:2000,comfy:self?2800:2400},hit=self?2100:2200,land=plan.drop+450;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Boppy whistles. The recliner comes when called.':'Boppy walks over to '+t.name+'. The recliner follows him.'); say(m.id,'recliner_reservation'); scene('ba_chair',(end-100)/1000,{plan}); scene('ba_thump',(land+700)/1000,{x:cx,y:cy,land}); }],
    [land,()=>{ sfx.thud(); }],
    [plan.card,()=>{ sfx.whoosh(); setMessage(self?'He lifts the RESERVED card. For himself, this time.':'He lifts the RESERVED card off it. With visible reluctance.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('ba_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a'}); scene('ba_shield',1,{x:H.x,y:H.mid}); hopOf(t!==m?t:null); }],
    ...(DU?[[hit+250,()=>{ scene('ba_shield',1,{x:DU.x,y:DU.mid,c:ROSE}); scene('ba_heart',1,{x:DU.x,y:DU.top-4}); battle.fx[deedee.idx].hop=.3; sfx.ding(); }]]:[]),
    [plan.comfy,()=>{ setMessage(self?'He sits. Nobody else is allowed to. Today he makes an exception for himself.':'He adjusts the cushion until '+(foe?'it':t.name)+' is smiling.'+(DU?' Deedee gets cover too.':'')); }],
    [end,'end',kindLine(t,'The best seat is grudgingly available.')]]);
  const keep=st; RECL.length=0;
  if(self) RECL.push({m,st:keep,t0:2700,t1:3900});
  // the ally he sets it up for walks into the chair the moment it lands, sits through the heal, then gets up and goes home
  else if(!foe&&b2Alive(t)&&battle.fx[t.idx]) { const tsp=BATTLE_SPRITES[t.id],sitF=tsp&&tsp.sit?'sit':'kneel';
    const tst=ST.keys(battle.fx[t.idx],[{t:0,x:'home',y:'home',f:'idle'},{t:land,x:'home',y:'home',f:'walk',hop:2,hn:3},{t:land+500,x:cx+2,y:cy,f:sitF},{t:3100,f:sitF},{t:3200,f:'walkR',hop:2,hn:3},{t:3800,x:'home',y:'home',f:'idle'},{t:4300,x:'home',y:'home',f:'idle'}]);
    ST.cur=keep; RECL.push({m:t,st:tst,t0:land+500,t1:3200}); } };

// ---------- Headcount, Again (headcount sheet: 1 finger up, 2 and 3 pointing, 4 "me?", 5 wink, 6 thumbs up) ----------
const badge=(x,y,n,pop,c)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); EO(0,0,26,26,c); ring(0,0,21,21,2,'rgba(43,42,38,.35)'); label(''+n,1,-12,OUT,5); gfx.restore(); };
SC.ba_count=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9); const a0=gfx.globalAlpha;
  P.list.forEach((q,k)=>{ const t0=P.c0+k*P.step; if(ms<t0) return; const a=(ms-t0)/180,pop=a<1?ez(a)*1.35:lerp(1.35,1,cl(a-1)),by=Math.max(34,q.top-44);
    if(ms<t0+400) { const r=(ms-t0)/400; gfx.globalAlpha=a0*(1-r); ring(q.x,by,26+r*30,26+r*30,4,GOLD); gfx.globalAlpha=a0; }
    badge(q.x,by,k+1,pop,ms>P.reveal?GOLD:CREAM); });
  const st=s.st; if(ms>P.extra&&st&&st.x!=null) { if(ms<P.cross+80) { const p=head(st,-40); P.hx=p.x; P.hy=Math.max(34,p.y); } const x=P.hx,y=P.hy,a=(ms-P.extra)/180,pop=a<1?ez(a)*1.35:lerp(1.35,1,cl(a-1)); badge(x,y,P.list.length+1,pop,CREAM);
    if(ms>P.cross) { const q=ez((ms-P.cross)/200); LnO(x-24,y-24,lerp(x-24,x+24,q),lerp(y-24,y+24,q),6,RED); LnO(x+24,y-24,lerp(x+24,x-24,q),lerp(y-24,y+24,q),6,RED); }
    if(ms<P.cross) bigWord('HIM?',x,y-56,CREAM,3); } };
B.headcount_again=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,62),me=ST.unit(m),n=list.length;
  const c0=1300,step=360,extra=c0+n*step+150,cross=extra+650,reveal=cross+350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_headcount_1'},{t:c0,f:(u,tt)=>Math.floor(tt*3)%2?'ab_headcount_3':'ab_headcount_2',dx:(u,tt)=>-Math.sin(u*Math.PI)*6},{t:extra,f:'ab_headcount_4'},{t:reveal,f:'ab_headcount_5'},{t:reveal+400,f:'ab_headcount_6',hop:6},{t:reveal+800,f:back(p.x,me),hop:2,hn:6},{t:reveal+1800,x:'home',y:'home',f:'idle'}]);
  const P={list:list.map(f=>ST.foe(f)),c0,step,extra,cross,reveal};
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Headcount. Nobody move while he counts.'); say(m.id,'headcount_again'); scene('ba_count',(reveal+1300)/1000,{P,st}); }],
    ...list.map((f,k)=>[c0+k*step,()=>{ sfx.select(); ST.jolt(f,.1); lift(f,-6); }]),
    [extra,()=>{ sfx.boop?sfx.boop():sfx.select(); setMessage('One extra. He counted himself.'); }],
    [cross,()=>{ sfx.thud(); setMessage('He crosses himself out. Headcount, again.'); }],
    ['hf',reveal],
    [reveal,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('ba_glow',.8,{x:q.x,y:q.mid,c:GOLD}); } }],
    [reveal+400,()=>{ setMessage('Everybody is accounted for. He gives the row a friendly nod.'); }],
    [reveal+1900,'end','Boppy has included himself by mistake. Twice.']]); };

// ---------- Lockdown (lockdown sheet: 1 keys low, 2 point, 3 fist, 4 keys raised, 5 turning the key, 6 arms crossed) ----------
SC.ba_cell=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.94);
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
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_lockdown_2',dx:u=>-ez(u)*6},{t:1500,f:'ab_lockdown_3'},{t:1900,f:'ab_lockdown_1'},{t:2200,f:'ab_lockdown_4',dx:(u,tt)=>Math.sin(tt*30)*2},{t:2700,f:'ab_lockdown_5',dx:-4},{t:3000,f:'ab_lockdown_6'},{t:3400,f:back(p.x,me),hop:2,hn:6},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over. Keys jingling. The deputy warden is on duty.'); say(m.id,'lockdown'); scene('ba_cell',4.3,{P}); sfx.jangle(0,4); }],
    [1100,()=>{ setMessage('He points. YOU.'); scene('ba_text',1,{st,txt:'YOU.',c:CREAM,sc:2}); }],
    [1500,()=>{ sfx.whoosh(); setMessage('Cell bars come down out of nowhere.'); }],
    ['hf',P.slam],
    [P.slam,()=>{ sfx.clang(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('ba_big',1.3,{x:F.x,y:F.top-74,txt:'LOCKDOWN!',c:'#ff6a5a',sc:4}); }],
    [P.jang,()=>{ sfx.jangle(0,8); setMessage('He jangles his big key ring. Very slowly.'); }],
    [P.turn,()=>{ sfx.click?sfx.click():sfx.select(); setMessage('Click. That plan isn\'t going anywhere.'); }],
    [4500,'end',res(E2)+'Nobody gets out on his watch.']]); };

// ---------- Everybody Waits (wait sheet: 1 dispenser, 2 pulling the ticket, 3 ticket held up, 4 stop palm, 5 ushering, 6 dispenser under his arm) ----------
SC.ba_ticket=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.95); const a0=gfx.globalAlpha;
  if(ms>P.pull-500&&ms<P.pull+200&&s.st&&s.st.x!=null) { const hp=head(s.st,-30); bigWord('TAKE A NUMBER',hp.x,hp.y,CREAM,2); }
  if(ms<P.pull) return;
  const party=P.wide>0,top=Math.max(8,P.y0-14),full=P.y1-top,q=ez((ms-P.pull)/(P.unroll-P.pull)),len=full*q,cx=P.x+(party?-14:14),hw=27;
  if(party&&ms>P.unroll) { const g=ez((ms-P.unroll)/350),dx=P.x+P.wide*.5,dy=(P.y0+P.y1)*.5+4,rx=Math.min(P.wide*.5+16,566-dx)*g,ry=Math.min(dy-6,(P.y1-P.y0)*.5+22)*g,pl=.5+.5*Math.sin(s.t*6);
    gfx.globalAlpha=a0*(.16+pl*.06); E(dx,dy,rx,ry,BLUE); gfx.globalAlpha=a0*.9; ring(dx,dy,rx+2,ry+2,8,OUT); ring(dx,dy,rx,ry,5,BLUE); ring(dx,dy,rx-7,ry-7,2,'#dff0ff');
    gfx.globalAlpha=a0*.5; gfx.strokeStyle='#ffffff'; gfx.lineWidth=5; gfx.beginPath(); gfx.ellipse(dx,dy,Math.max(1,rx-14),Math.max(1,ry-14),0,Math.PI*1.12,Math.PI*1.42); gfx.stroke(); gfx.globalAlpha=a0; }
  const paintT=PROPART.ready('boppy/family_first_ticket');
  if(paintT) { gfx.save(); gfx.beginPath(); gfx.rect(cx-hw-6,top,hw*2+12,Math.max(2,len)); gfx.clip(); PROPART.draw('boppy/family_first_ticket',cx,top+full*.5,{h:full,w:hw*2+12}); gfx.restore(); }
  else { RO(cx-hw,top,hw*2,Math.max(2,len),CREAM); for(let y=top+6;y<top+len-4;y+=12) { R(cx-hw,y,3,3,'#c9c2b8'); R(cx+hw-3,y,3,3,'#c9c2b8'); } }
  const gap=(full-14)/6,sc=gap>=17?3:2;
  if(!paintT) ['FAMILY','FIRST'].forEach((wd,c)=>{ const x=cx+(c?13:-12),off=c?(6-wd.length)*gap*.5:0; [...wd].forEach((ch,k)=>{ const y=top+8+off+k*gap; if(y<top+len-sc*5) label(ch,x,y,RED,sc); }); });
  if(ms>P.unroll+500) { gfx.globalAlpha=a0; bigWord('FAMILY FIRST',party?P.x+P.wide*.5:cx,party?Math.max(24,P.y0-30):top-24,GOLD,3); } };
B.everybody_waits=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const lx=foe?Math.round(U[0].x+U[0].w*.5+18):Math.round(Math.min(...U.map(q=>q.x-q.w*.5))-16);
  const y0=Math.max(20,Math.min(...U.map(q=>q.top))-14),y1=Math.min(318,Math.max(...U.map(q=>q.base))+6);
  const sx=foe?Math.min(560,lx+34):Math.max(30,lx-30),sy=Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+4);
  const WT=[0,'ab_wait_1','ab_wait_2','ab_wait_3','ab_wait_4','ab_wait_5','ab_wait_6'],w=k=>foe?WT[k]:WT[k]+'F';   // beside the family he faces them (mirrored)
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(sx,me),hop:2,hn:6},{t:1100,x:sx,y:sy,f:w(1)},{t:1700,f:w(2),dx:foe?-6:6},{t:2500,f:w(3)},{t:2650,f:w(4)},{t:3000,f:w(5)},{t:3400,f:w(6)},{t:3700,f:back(sx,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  const plan={pull:1700,unroll:2500,x:lx,y0,y1,wide:foe?0:Math.max(...U.map(q=>q.x+q.w*.5))-lx};
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Boppy walks over to '+foe.name+' with an absurdly small ticket dispenser.':'Boppy walks out in front of the family with an absurdly small ticket dispenser.'); say(m.id,'everybody_waits'); scene('ba_ticket',4.2,{plan,st}); }],
    [1700,()=>{ sfx.select(); sfx.whoosh(); setMessage('He pulls one ticket. It keeps unrolling.'); }],
    ['hf',2500],
    [2500,()=>{ E2.apply(); sfx.ding(); for(const u of who) { const q=ST.unit(u); if(!foe) scene('ba_shield',1.2,{x:q.x,y:q.mid,c:BLUE}); scene('ba_glow',.9,{x:q.x,y:q.mid,c:'#9fd8ff'}); hopOf(u!==m?u:null); } }],
    [2700,()=>{ setMessage(foe?'The ticket says FAMILY FIRST. It makes room anyway.':'The ticket says FAMILY FIRST, before any number. He ushers everyone behind it.'); }],
    [4700,'end',foe?kindLine(foe):'The grumble has become a clear priority.']]); };

// ---------- Pepper Breath (pepper sheet: 1 pepper up, 2 chewing, 3 red and steaming, 4 mouth wide, 5 breathing fire, 6 holds his stomach) ----------
SC.ba_pepper=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st); gfx.globalAlpha=1;
  if(ms>P.show&&ms<P.eat) bigWord('HOMEGROWN',mo.x+4,mo.y-62,GOLD,2);
  if(ms>P.eat+200&&ms<P.eat+800) bigWord('CRUNCH',mo.x-6,mo.y-48,CREAM,2);
  if(ms>P.red&&ms<P.fire) { steam(mo.x+16,mo.y-24,s.t,3,'#ffd0b0',34); steam(mo.x+40,mo.y-26,s.t+.4,3,'#ffd0b0',34); } };
SC.ba_cone=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st),tx=P.tx,ty=P.ty,dx=tx-mo.x,dy=ty-mo.y,L=Math.hypot(dx,dy)+30,a0=Math.atan2(dy,dx);
  const grow=ez(ms/220),shrink=u>.8?(1-u)/.2:1,len=L*grow,spread=lerp(.1,.3,ez(ms/500))*shrink;
  const layer=(f,c,jit)=>{ const pts=[[mo.x,mo.y]]; for(let k=0;k<=8;k++) { const q=k/8,a=a0+lerp(-spread,spread,q)*f,r=len*(.92+.08*Math.sin(s.t*40+k*1.7))+Math.sin(s.t*55+k*2.3)*jit; pts.push([mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r]); } gfx.globalAlpha=shrink*.95; poly(pts,c,f===1?3:0); };
  layer(1,'#e0402e',8); layer(.7,'#ff8a2a',6); layer(.38,'#ffe070',4);
  for(let k=0;k<10;k++) { const q=((s.t*2.2)+k/10)%1,a=a0+Math.sin(k*2.1)*spread*.8,r=len*q; gfx.globalAlpha=(1-q)*shrink; E(mo.x+Math.cos(a)*r,mo.y+Math.sin(a)*r-q*10,3+q*4,3+q*4,k%2?'#ffd040':'#ff6a2a'); } };
B.pepper_breath=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,100),me=ST.unit(m);
  const P={show:1350,eat:1700,red:1950,fire:2400,done:3500,tx:F.x+F.w*.15,ty:F.mid},hit=2600;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_pepper_1'},{t:1700,f:'ab_pepper_2'},{t:1950,f:'ab_pepper_3',dx:(u,tt)=>Math.sin(tt*40)*2},
    {t:2350,f:'ab_pepper_4'},{t:2450,f:'ab_pepper_5',dx:u=>-ez(u*4)*8},{t:3300,f:'ab_pepper_6',dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:3700,f:back(p.x,me),hop:2,hn:6},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with one homegrown cayenne pepper.'); say(m.id,'pepper_breath'); scene('ba_pepper',3.6,{P,st}); }],
    [1300,()=>{ setMessage('He holds it up. He grew it himself. He\'s very proud of it.'); }],
    [1900,()=>{ sfx.crunch(); setMessage('Crunch.'); }],
    [1950,()=>{ sfx.stun(); setMessage('His face goes red. Steam comes out of his ears.'); }],
    [2400,()=>{ sfx.flame(0,1.0); scene('ba_cone',1.1,{P,st}); setMessage('HAAAH! A cone of pepper fire!'); }],
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('ba_big',1.2,{x:F.x,y:F.top-74,txt:'HAAAH!',c:'#ffb040',sc:4}); }],
    [3300,()=>{ sfx.sulk&&sfx.sulk(); scene('ba_smoke',1.2,{x:F.x,y:F.mid,h:56}); scene('ba_text',1.2,{st,txt:'MY STOMACH',c:CREAM,sc:2}); setMessage('Ooh. His stomach has notes.'); }],
    [4800,'end',res(E2)+'He did warn everybody at lunch.']]); };

// ---------- Seeds of Trouble (seeds sheet: 1 packet, 2 opening it, 3 pouring seeds, 4 winding up, 5 throwing, 6 pocketing it) ----------
const fireSeed=(x,y)=>{ for(let k=4;k>=0;k--) { E(x+10+k*8,y-k*.6,8-k*1.2,6-k*.9,k>2?'rgba(255,90,30,.6)':k>0?'#ff8a2a':'#ffd040'); } EO(x,y,7,9,'#ffb04a'); E(x-1,y-3,3,4,'#fff1b0'); };
SC.ba_sparks=(s,u)=>{ const x=s.x,y=s.y,q=ez(u/.5); gfx.globalAlpha=fade(u,.55);
  for(let k=0;k<14;k++) { const a=k/14*Math.PI*2+(s.seed||0),r0=10+q*18,r1=22+q*(38+(k%3)*12); LnO(x+Math.cos(a)*r0,y+Math.sin(a)*r0,x+Math.cos(a)*r1,y+Math.sin(a)*r1,k%2?4:6,k%2?'#ffd040':'#ff6a2a'); }
  const fb=Math.sin(cl(u*1.8)*Math.PI); if(fb>0) { EO(x,y,fb*32,fb*27,'#e0402e'); E(x,y,fb*22,fb*18,'#ff9a2a'); E(x,y,fb*11,fb*9,'#ffe070'); }
  for(let k=0;k<6;k++) { const e=cl(u*1.2-k*.06); if(e<=0) continue; gfx.globalAlpha=(1-e)*.9; E(x-20+k*8+Math.sin(k*2+e*6)*8,y-e*70,3,4,k%2?'#ffd040':'#ff6a2a'); } };
SC.ba_packet=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const p=head(st,-34); gfx.globalAlpha=1;
  if(ms>P.show&&ms<P.t0) bigWord('HOMEGROWN',p.x,p.y,GOLD,3);
  if(ms>P.shake+200&&ms<P.pocket) bigWord('ONE LEFT',p.x,p.y,CREAM,3); };
B.seeds_of_trouble=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,76),me=ST.unit(m);
  const P={show:1100,t0:1700,t1:2300,shake:2800,pocket:3300},hit=2300;
  const aims=[0,1,2].map(k=>{ const f=list[k%list.length],q=ST.foe(f); return {x:q.x+(list.length<3?(k-1)*20:0),y:q.mid}; });
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_seeds_1'},{t:1250,f:'ab_seeds_2'},{t:1450,f:'ab_seeds_3'},{t:1700,f:'ab_seeds_4',dx:u=>-ez(u)*4},{t:1800,f:'ab_seeds_5',dx:-4},{t:2800,f:'ab_seeds_6'},{t:3600,f:back(p.x,me),hop:2,hn:6},{t:4600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and shows off a seed packet. Handwritten label. HOT.'); say(m.id,'seeds_of_trouble'); scene('ba_packet',3.4,{P,st}); }],
    ...aims.map((a,k)=>[1750+k*120,()=>{ const h=ST.hand(); ST.fly((x,y)=>fireSeed(x,y),h.x,h.y-10,a.x,a.y,.45,50); sfx.whoosh(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.fireball?sfx.fireball():sfx.bonk(); sfx.splat(); all(list); landHit(100); aims.forEach((a,k)=>scene('ba_sparks',1.0,{x:a.x,y:a.y,seed:k*.4})); scene('ba_flash',.3,{a:.3,c:'#ffb040'}); scene('ba_big',1.1,{x:Gp.x,y:Math.max(40,Gp.top-74),txt:'SIZZLE!',c:'#ffb040',sc:5}); }],
    [2800,()=>{ setMessage('He shakes the packet. One seed left. He pockets it carefully.'); sfx.select(); }],
    [4700,'end',res(E2)+'The crop is performing above expectations.']]); };

// ---------- Mild for Company (mild sheet: 1 jar, 2 turning the label, 3 spoon test, 4 tasting, 5 relief, 6 offering the jar) ----------
B.mild_for_company=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'ab_mild_1'},{t:400,f:'ab_mild_2'},{t:1200,f:'ab_mild_3'},{t:1450,f:'ab_mild_4'},{t:1700,f:'ab_mild_6'},{t:2400,f:'ab_mild_5',hop:6},{t:2900,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:amble(sp.x,me),hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'ab_mild_1'},{t:1200,f:'ab_mild_2'},{t:1700,f:'ab_mild_3'},{t:1950,f:'ab_mild_4'},{t:2200,f:'ab_mild_6',dx:-6},{t:2700,f:'ab_mild_5',hop:6},{t:3100,f:back(sp.x,me),hop:2,hn:6},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={flip:self?400:1200,test:self?1200:1700,give:self?1700:2200},hit=plan.give+350,end=self?3100:4200;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Boppy turns the label on his pepper jelly around. HOT. Then MILD.':'Boppy walks over to '+t.name+' with a jar of his pepper jelly.'); say(m.id,'mild_for_company'); }],
    [plan.flip,()=>{ sfx.select(); if(!self) setMessage('He turns the label around. HOT becomes MILD, in careful handwriting.'); }],
    [plan.test,()=>{ setMessage('He tests one tiny spoonful like a safety inspector.'); }],
    [plan.give,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('ba_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('ba_glow',.9,{x:H.x,y:H.mid,c:'#ffd9a0'}); scene('ba_rings',.7,{x:H.x,y:H.mid,c:'#ffd9a0',r:50}); hopOf(t!==m?t:null); }],
    [hit+300,()=>{ setMessage('The label was accurate. Boppy looks relieved.'); }],
    [end,'end',kindLine(t,'The warning label has been honestly adjusted.')]]); };

// ---------- Nineteen Seventy (nineteen sheet: 1 in the armchair, 2 one finger, 3 two fingers, 4 hand on heart, 5 laughing, 6 on a stool) ----------
SC.ba_1970=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.92);
  if(ms>P.card) { const d=ez((ms-P.card)/400),y=lerp(-40,P.cy,d),x=P.cx; if(!PROPART.draw('boppy/1970_card',x,y,{w:116})) { RO(x-62,y-26,124,52,SEPIA); R(x-58,y-22,116,44,'#e8cf98'); label('1970',x,y-12,'#5a3a1a',4); } }
  if(ms>P.card2) { const d=ez((ms-P.card2)/350),x=lerp(P.cx+260,P.cx,d),y=P.cy+44; RO(x-58,y-10,116,20,CREAM); label('FIRST SOME CONTEXT',x,y-3,'#5a3a1a',1); }
  if(ms>P.chairs) for(const q of P.list) { const g=ez((ms-P.chairs)/300),x=q.x+q.w*.5+4,y=q.base; gfx.save(); gfx.translate(x,y); gfx.scale(g,g); if(!PROPART.draw('boppy/folding_chair',0,-17,{h:34})) { RO(-6,-16,12,4,WOOD); R(-6,-12,2,12,'#8a5a30'); R(4,-12,2,12,'#8a5a30'); RO(4,-28,2,14,'#8a5a30'); } gfx.restore(); }
  if(ms>P.also&&ms<P.also+900&&s.st&&s.st.x!=null) { const p=head(s.st,-30); label('ALSO',p.x,p.y,GOLD,2); } };
B.nineteen_seventy=E2=>{ const {m,fx}=E2,list=foes(E2).length?foes(E2):b2LiveFoes(),Gp=ST.group(list),p=rowSpot(Gp,84),me=ST.unit(m);
  const plan={card:1500,card2:2200,chairs:2800,also:3400,cx:Gp.x,cy:Math.max(40,Gp.top-58),list:list.map(f=>ST.foe(f))},hit=2800;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1000,x:p.x,y:p.y,f:'ab_nineteen_1'},{t:1300,f:'ab_nineteen_2'},{t:2200,f:'ab_nineteen_3',dx:(u,tt)=>Math.sin(tt*5)*1},{t:2800,f:'ab_nineteen_4'},{t:3400,f:'ab_nineteen_2'},{t:3900,f:'ab_nineteen_5'},{t:4100,f:back(p.x,me),hop:2,hn:6},{t:5100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over and sits down. This takes a while.'); say(m.id,'nineteen_seventy'); scene('ba_1970',4.6,{plan,st}); }],
    [1300,()=>{ setMessage('He raises one finger. A title card arrives.'); }],
    [1500,()=>{ sfx.thud(); }],
    [2200,()=>{ sfx.whoosh(); setMessage('Then a second card. The introduction has introductory remarks.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.ding(); for(const f of list) { const q=ST.foe(f); scene('ba_heart',.9,{x:q.x,y:q.top-4,r:5}); } }],
    [3000,()=>{ setMessage('Every enemy finds a little chair and settles in.'); }],
    [3400,()=>{ sfx.select(); setMessage('He prepares another finger.'); }],
    [5200,'end','The story hasn\'t started yet. Everyone is waiting for it.']]); };

// ---------- Five-Alarm Jar (jar sheet: 1 jar, 2 twisting the lid, 3 lid off, 4 eating one, 5 red face, 6 gasping) ----------
SC.ba_jar=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const h=ST.hand(),x=h.x-18,y=h.y-36; gfx.globalAlpha=fade(u,.96);
  if(ms>P.twist&&ms<P.pop) bigWord('TWIST',x,y-34,CREAM,2);
  if(ms>P.pop&&ms<P.pop+600) { const q=ez((ms-P.pop)/600); gfx.save(); gfx.translate(x-q*60,y-20-Math.sin(q*Math.PI)*70); gfx.rotate(q*10); RO(-12,-4,24,8,'#c9a23a'); R(-10,-2,20,2,'#f0d27a'); gfx.restore(); bigWord('POP!',x-58,y-24,GOLD,2); }
  if(ms>P.pop&&ms<P.eat) { const q=cl((ms-P.pop)/(P.eat-P.pop)),gx=x+Math.sin(q*8)*10,gy=y-24-q*60; gfx.globalAlpha=fade(u,.96)*(1-q*.4);
    E(gx,gy,13,15,OUT); E(gx,gy,11,13,GHOST); poly([[gx-11,gy],[gx-11,gy+16],[gx-6,gy+11],[gx-1,gy+17],[gx+4,gy+11],[gx+11,gy+16],[gx+11,gy]],GHOST,0); R(gx-6,gy-4,3,4,OUT); R(gx+3,gy-4,3,4,OUT); E(gx,gy+5,3,3,OUT);
    gfx.globalAlpha=fade(u,.96); if(q>.15) bigWord('BOO',gx+28,gy-14,GHOST,2); } };
SC.ba_bite=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null) return; const mo=mouth(st); gfx.globalAlpha=1;
  if(ms>P.eat+250&&ms<P.eat+800) bigWord('CRUNCH',mo.x-6,mo.y-48,CREAM,2);
  if(ms>P.alarm&&ms<P.done) { const hp=head(st,16),pulse=.4+.2*Math.sin(ms/60); gfx.globalAlpha=pulse; E(hp.x-4,hp.y+4,18,16,'#ff1a0a'); gfx.globalAlpha=1; steam(hp.x-28,hp.y-4,s.t,3,'#ffd0b0',40); steam(hp.x+22,hp.y-4,s.t+.4,3,'#ffd0b0',40); } };
SC.ba_alarm=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.92);
  const bx=P.bx,by=P.by,a=s.t*9;
  for(let k=0;k<2;k++) { const ang=a+k*Math.PI; gfx.globalAlpha=fade(u,.92)*.22; poly([[bx,by],[bx+Math.cos(ang-.25)*620,by+Math.sin(ang-.25)*620],[bx+Math.cos(ang+.25)*620,by+Math.sin(ang+.25)*620]],'#ff3a2a',0); }
  gfx.globalAlpha=fade(u,.92); if(!PROPART.draw('boppy/fire_alarm',bx,by+8,{h:52})) { RO(bx-16,by+6,32,8,'#5a5a60'); gfx.beginPath(); gfx.arc(bx,by+6,14,Math.PI,0); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=Math.sin(a*2)>0?'#ff3a2a':'#c81a12'; gfx.fill(); E(bx-5,by-2,3,4,'#ffb0a0'); }
  if(ms<1300) { const q=ms/1300; gfx.globalAlpha=.2*(Math.sin(q*Math.PI*8)>0?1:0)*(1-q); R(0,0,576,324,'#ff2a1a'); }
  gfx.globalAlpha=fade(u,.92); bigWord('5-ALARM!',bx,by-24,'#ff6a5a',3); };
SC.ba_blaze=(s,u)=>{ const x=s.x,y=s.base,hgt=s.h*Math.sin(cl(u*1.4)*Math.PI*.5+.0)*(u>.75?(1-u)/.25:1); if(hgt<=1) return; gfx.globalAlpha=1;
  const flame=(w,h,c,ph)=>{ const pts=[[x-w,y]]; for(let k=1;k<6;k++) { const q=k/6; pts.push([x-w+q*2*w,y-h*(.55+.45*Math.sin(q*Math.PI))-Math.sin(s.t*30+k*2+ph)*h*.12]); } pts.push([x+w,y]); poly(pts,c,c==='#e0402e'?3:0); };
  flame(s.w*.6,hgt,'#e0402e',0); flame(s.w*.42,hgt*.75,'#ff8a2a',1); flame(s.w*.22,hgt*.45,'#ffe070',2); };
B.five_alarm_jar=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,60),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],Gh=ST.group(hitList);
  const P={twist:1550,pop:1900,eat:2350,alarm:2650,done:3700},hit=2950;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:amble(p.x,me),hop:2,hn:6},{t:1100,x:p.x,y:p.y,f:'ab_jar_1'},{t:1550,f:'ab_jar_2',dx:(u,tt)=>Math.sin(tt*30)*2},{t:1900,f:'ab_jar_3',dx:-4},{t:2350,f:'ab_jar_4'},
    {t:2650,f:'ab_jar_5',dx:(u,tt)=>Math.sin(tt*40)*2},{t:2950,f:'ab_jar_5',dx:u=>-ez(u*4)*6},{t:3400,f:'ab_jar_6',dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:3900,f:back(p.x,me),hop:2,hn:6},{t:4900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Boppy walks over with a jar of his pickled ghost peppers.'); say(m.id,'five_alarm_jar'); scene('ba_jar',3.7,{P,st}); scene('ba_bite',3.8,{P,st}); }],
    [1550,()=>{ setMessage('He twists the lid. It\'s on there good.'); sfx.charge&&sfx.charge(); }],
    [1900,()=>{ sfx.boing(); setMessage('POP. Something spooky floats out of the jar.'); sfx.boo&&sfx.boo(); }],
    [2350,()=>{ sfx.crunch(); setMessage('He eats one anyway.'); }],
    [2650,()=>{ sfx.siren(); scene('ba_alarm',1.6,{P:{bx:Math.max(70,Math.min(506,(p.x+Gh.x)/2)),by:56},st}); setMessage('The fire alarm goes off. Somebody stop him.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.flame(0,.9); sfx.fireball?sfx.fireball():sfx.bonk(); all(hitList); landHit(100); hitList.forEach(g=>{ const q=ST.foe(g); scene('ba_blaze',1.0,{x:q.x,base:q.base,w:q.w*.7,h:q.h*1.05}); }); scene('ba_big',1.2,{x:Gh.x,y:Math.max(40,Gh.top-74),txt:'WHOOSH!',c:'#ffb040',sc:4}); }],
    [3400,()=>{ sfx.guard?sfx.guard():sfx.thud(); scene('ba_shield',1.2,{x:p.x,y:p.y-BH()*.45,c:GOLD}); setMessage('He braces, sweating. Nobody stopped him.'); }],
    [5000,'end',res(E2)+'Five alarms. Every one of them earned.']]); };
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
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const tip=st=>{ const sp=st.sp,fr=st.frame,q=sp&&sp.tipAt&&fr&&sp.tipAt.get(fr); if(q) { const sc=sp.scale*(st.sc||1); return {x:st.x-fr[0].length*sc/2+q.col*sc,y:st.y-fr.length*sc+q.row*sc}; } return {x:st.x-60,y:st.y-BATTLE_SPRITES.boppy.idle.length*BATTLE_SPRITES.boppy.scale*(st.sc||1)*.5}; };   // painted rod tip (data/boppy-hires-battle.js)
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
SC.b5_rod=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0,st=s.st; if(ms>P.rodOff||!st||st.x==null) return;   // the rod and reel are painted into the fish_2 and fish_3 frames; the line starts at the rod tip
  const T=tip(st),f=fishAt(P,ms),tx=f?f.x-28*f.sc:P.wx+Math.sin(ms/240)*14,ty=f?f.y:P.wy+2;
  gfx.strokeStyle='rgba(255,255,255,.9)'; gfx.lineWidth=1.6; gfx.beginPath(); gfx.moveTo(T.x,T.y); gfx.lineTo(tx,ty); gfx.stroke();
  if(!f) { const y=P.wy+Math.sin(ms/70)*4; EO(tx,y-2,5,6,CREAM); R(tx-5,y-3,10,4,RED); } };
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
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:sx<me.x?'walk':'walkR'},{t:600,x:sx,y:sy,f:'ab_fish_2'},{t:P.reel0,f:'ab_fish_2',dx:(u,tt)=>Math.sin(tt*30)*2},
    {t:P.yank,f:'ab_fish_3',dx:u=>4+ez(u)*6},{t:2300,f:'ab_fish_5'},{t:P.b2,f:'ab_fish_6',hop:6},{t:P.b3,f:'ab_fish_8',hop:10},{t:P.hit+200,f:'ab_fish_9',hop:8,hn:2},
    {t:P.away,f:'ab_fish_7'},{t:5800,f:sx<me.x?'walkR':'walk'},{t:6400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('b5_bars',6.7,{}); scene('b5_pond',6.5,{plan:P,back:true}); scene('b5_pier',6.5,{plan:P,back:true}); scene('b5_lurk',2,{plan:P,t0:0,back:true});
      scene('b5_shadow',4.5,{plan:P,t0:0,back:true}); scene('b5_dim',1.1,{delay:3.4,a:.4});
      scene('b5_rod',2.3,{plan:P,t0:0,st}); say(m.id,'fish_ult'); sfx.splash(); setMessage('The floor floods into a pond. Boppy plants a boot on the pier.'); }],
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
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const B=RECRUIT_MOVES.boppy;
ST.nw('bf_');
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.boppy,BH=()=>BSP().idle.length*BSP().scale;
const fin=(u,a=.12)=>u<a?u/a:1;
// ---- embedded art (generated, tools/boppy_art.py) ----
const NEWPAL={"H": "#2b1a10", "I": "#46301d", "J": "#684626", "K": "#8e6236", "L": "#1a0f09", "R": "#a3283a", "S": "#6e1a28", "T": "#c9485a", "W": "#f6f1e8", "M": "#e2dac8", "N": "#b3a98f", "Z": "#c4bcab", "X": "#f9d1b0", "Y": "#c98462", "Q": "#d99a78", "P": "#e9b490", "O": "#9a5f46"};
const FR={
y_wind:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", ".............................aaaaaa...................", "..........................aKJIIIIIIIIa................", "........................aKJKKKJKJIIHIHIa..............", ".......................aJKKKJKKJJJHHIIHHa.............", "......................aIIIIJJIIHHHIILLHHLa............", "......................aIIJJIIIHIJIIHHLHHIa............", ".....................aJKJIIIIIIIHHHHHIHLLa............", ".....................aJJIIIIJIHHHHHIHLLLLa............", ".....................aIIIIJJHIIHHIIHLLLLLa............", ".....................aIIIIHIHHHHHLLLLLHLLa............", ".....................aIIIIHHHIHHLHLLLLLLLa............", "..................abJaHkHHHHlIaIaIHHIaHHIa............", "..................aIamHInnlHnnlHkaHHbaHHIa............", "..................abnHHIHnonnHHHlkaabaHHIa............", "..................aKnIHonoooononnnnnKaKKKa............", ".................aKooooooooooooooooonmKKKKa...........", ".................amoaaaaooooaaanooolomKKKKa...........", ".................alkbbKjnoonbaqmoollomKKKKa...........", ".................alobIKnnoolbbqooolloIIIKKa...........", "..................booooonnoolooooolloaKKKh............", "..................hoooolollllolpollmoJKIa.............", "....................aoooooolmmmmmpomkaaa..............", ".....................aoonooaaanonopobb................", "......................anonaoonaknnnpna................", "......................aaoaonnnnaooooaa................", "....................aRaloaonnnnalaRaa.................", "...................aaaRaaaonnnnaaRaRaaa...............", "................aRaoonaaaaonnnaRRaRappoa..............", ".................aonnnoonannnaRRRRapooooa.............", ".................aonnnnnnnannaaSRRapooona.............", ".................annnnnnnnannaaaaRapooona.............", "..................annnnnnnanaappoaapooona.............", "...................aannnnannapooopapooona.............", ".....................aaaaaaaapooooaoooona.............", ".....................aRRRRSSaooooooahrraa.............", "....................aRRRRRSRRaonnnnoaaana.............", "....................aRRRRRRRRRaaaaaonnna..............", "....................aRRRRRRRRRRRRRRaaaa...............", ".....................abbdcbbbbbbbbbba.................", ".....................aaaaNaaaaaaaaaaa.................", "....................aNMMNMNMMMMMMMNNa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_spread:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "............................aaaaaa....................", ".........................aKJIIIIIIIIa.................", ".......................aKJKKKJKJIIHIHIa...............", "......................aJKKKJKKJJJHHIIHHa..............", ".....................aIIIIJJIIHHHIILLHHLa.............", ".....................aIIJJIIIHIJIIHHLHHIa.............", "....................aJKJIIIIIIIHHHHHIHLLa.............", "....................aJJIIIIJIHHHHHIHLLLLa.............", "....................aIIIIJJHIIHHIIHLLLLLa.............", "....................aIIIIHIHHHHHLLLLLHLLa.............", "....................aIIIIHHHIHHLHLLLLLLLa.............", ".................abJaHkHHHHlIaIaIHHIaHHIa.............", ".................aIamHInnlHnnlHkaHHbaHHIa.............", ".................abnHHIHnonnHHHlkaabaHHIa.............", ".................aKnIHonoooononnnnnKaKKKa.............", "................aKooooooooooooooooonmKKKKa............", "................amoaaaaooooaaanooolomKKKKa............", "................alkbbKjnoonbaqmoollomKKKKa............", "................alobIKnnoolbbqooolloIIIKKa............", ".................booooonnoolooooolloaKKKh.............", ".................hoooolollllolpollmoJKIa..............", "...................aoooooolmmmmmpomkaaa...............", "....................aoonooonnnonopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", ".......aa.aaaaaaaaaaaaaalpoopSaaRaRRaaaaaaaaaaaaaaa...", "......aonaooooaoooooonakkkkaaRRRRaRappppppoappppppoa..", ".....aonnonnnnaonnnnnnnanRnaRRRRRRapoooooonaooooooooa.", ".....aonnnnnnnaonnnnnnnaanRSaaaSRRapoooooonaooooooona.", ".....annnnnnnnannnnnnnnaanaaRRRRRRaooooooonannnnnoona.", "......annaaaaaaannnnnnaRRWRRRWWWWWRaonnnnnaaaaaaaona..", ".......aa.......aaaaaaRRRRRRRWWWWWRRaaaaaa.......aa...", ".....................aRRRRRRRRRRRRRRa.................", ".....................aRRRRSSRRRRRRSSa.................", "....................aRRRRRSRRRRRRRRSSa................", "....................aRRRRRRRRRRRRRRSSa................", "....................aRRRRRRRRRRRRRRRa.................", ".....................aRRSRRRRRRRRRRRa.................", ".....................aaaabaaaaaaaaaaa.................", "....................aNMMNMNMMMMMMMNNa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aMMNaaaNNMMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_hip:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "............................aaaaaa....................", ".........................aKJIIIIIIIIa.................", ".......................aKJKKKJKJIIHIHIa...............", "......................aJKKKJKKJJJHHIIHHa..............", ".....................aIIIIJJIIHHHIILLHHLa.............", ".....................aIIJJIIIHIJIIHHLHHIa.............", "....................aJKJIIIIIIIHHHHHIHLLa.............", "....................aJJIIIIJIHHHHHIHLLLLa.............", "....................aIIIIJJHIIHHIIHLLLLLa.............", "....................aIIIIHIHHHHHLLLLLHLLa.............", "....................aIIIIHHHIHHLHLLLLLLLa.............", ".................abJaHkHHHHlIaIaIHHIaHHIa.............", ".................aIamHInnlHnnlHkaHHbaHHIa.............", ".................abnHHIHnonnHHHlkaabaHHIa.............", ".................aKnIHonoooononnnnnKaKKKa.............", "................aKooooooooooooooooonmKKKKa............", "................amoaaaaooooaaanooolomKKKKa............", "................alkbbKjnoonbaqmoollomKKKKa............", "................alobIKnnoolbbqooolloIIIKKa............", ".................booooonnoolooooolloaKKKh.............", ".................hoooolollllolpollmoJKIa..............", "...................aoooooolmmmmmpomkaaa...............", "....................aoonooonnnonopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aaaaaalpoopSaaRaRRaaa...............", "................aRaoonakkkkaaRRRRaRappoa..............", ".................aonnnnanRnaRRRRRRapooooa.............", ".................aonnnnaanRSaaaSRRapooona.............", "................aonnnnnaanaaRRRRRRaooooooa............", "................aonnnnaRRWRRRWWWWWRapooona............", "...............annnnnnaRRRRRRWWWWWRaooooooa...........", "...............aannnnaRRRRRRRRRRRRRRaooonaa...........", "...............aoannanaaaRSSRRRRRaaapaonana...........", "...............annaannoonaSRRRRRapppooaaona...........", "................annnnnnnnnaRRRRapoooooonna............", ".................aannnnnnnaRRRRapoooonnaa.............", "...................aannnnnaRRRRaoooonaa...............", ".....................annnaaaaaaaaonna.................", "....................aNaaaMNMMMMMMaaaa.................", "....................aMMMNNNMMMMMMMNNa.................", "....................aMMNNaaNNNMMMMNNa.................", "....................aMMNaaaNNMMMMMNNa.................", "....................aoona.oaanoooonna.................", "....................aonaa.oannooooonno................", "...................aaZZZa.WaZZZaaaaaaa................", "..................acbdaa.haaaabccccccaah..............", "..................accdah..ddadccccbbcaab..............", "..................aaaaa.....aaaaaaaaaaab..............", ".....................ab..........adda.ah.............."],
y_run1:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "...........................aaaaaa.....................", "........................aKJIIIIIIIIa..................", "......................aKJKKKJKJIIHIHIa................", ".....................aJKKKJKKJJJHHIIHHa...............", "....................aIIIIJJIIHHHIILLHHLa..............", "....................aIIJJIIIHIJIIHHLHHIa..............", "...................aJKJIIIIIIIHHHHHIHLLa..............", "...................aJJIIIIJIHHHHHIHLLLLa..............", "...................aIIIIJJHIIHHIIHLLLLLa..............", "...................aIIIIHIHHHHHLLLLLHLLa..............", "...................aIIIIHHHIHHLHLLLLLLLa..............", "................abJaHkHHHHlIaIaIHHIaHHIa..............", "................aIamHInnlHnnlHkaHHbaHHIa..............", "................abnHHIHnonnHHHlkaabaHHIa..............", "................aKnIHonoooononnnnnKaKKKa..............", "...............aKooooooooooooooooonmKKKKa.............", "...............amoaaaaooooaaanooolomKKKKa.............", "...............alkbbKjnoonbaqmoollomKKKKa.............", "...............alobIKnnoolbbqooolloIIIKKa.............", "................booooonnoolooooolloaKKKh..............", ".................hoooolollllllplolmoJKIa..............", "...................aooooolmmmmmlpomkaaa...............", "....................aooooonnnonoopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aRRRaalpoopSaaRaRRaaa...............", "..................aaRaamooopkaaaaSSappoaa.............", ".................aooaSaammmmaaRRaaapooopoa............", "...............aaonnaRRanRnaRRRRRRapooooooa...........", "..............aoaonnaaRaRnRRSSaaRRaooooooooa..........", "..............aoaonnaRRRanaRaaRRRRRaonoooonaa.........", "..............aoannnnaRRWaRRRWWWWWRRaaononaooa........", ".............aonnaaaaaRRWaRRRWWWWRRRa.aaoaoona........", ".............aonnna..aRRRRSSRRRRRRSSa...apoona........", ".............aonnna..aRRSRSSRRRRRRRRa...apoona........", ".............aonnna..aRRSRSSRRRRRRRRa...apona.........", ".............aonnna..aRRSRRRRRRRRRRRa...apona.........", ".............aonnna..addabbbaadddaaaa..apooooa........", ".............annnna..aMMMNMMMMMMMNaa...aoooona........", "..............anna...aMMMNaaNMNNNNNa....aonna.........", "...............aa.....aMMMaaNNNNNNNa.....aaa..........", "......................aoonaannnnnncca.................", "......................aoonaaannnaaaa..................", "......................aWWZaaZZZZZZZa..................", "......................aaabaaccccckka..................", ".....................acccaa.aaaaaaa...................", ".....................acckda.a....ab...................", ".....................accccdda.........................", ".....................aaaaaaaa.........................", "......................bbbbbbb........................."],
y_run2:["......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "......................................................", "...........................aaaaaa.....................", "........................aKJIIIIIIIIa..................", "......................aKJKKKJKJIIHIHIa................", ".....................aJKKKJKKJJJHHIIHHa...............", "....................aIIIIJJIIHHHIILLHHLa..............", "....................aIIJJIIIHIJIIHHLHHIa..............", "...................aJKJIIIIIIIHHHHHIHLLa..............", "...................aJJIIIIJIHHHHHIHLLLLa..............", "...................aIIIIJJHIIHHIIHLLLLLa..............", "...................aIIIIHIHHHHHLLLLLHLLa..............", "...................aIIIIHHHIHHLHLLLLLLLa..............", "................abJaHkHHHHlIaIaIHHIaHHIa..............", "................aIamHInnlHnnlHkaHHbaHHIa..............", "................abnHHIHnonnHHHlkaabaHHIa..............", "................aKnIHonoooononnnnnKaKKKa..............", "...............aKooooooooooooooooonmKKKKa.............", "...............amoaaaaooooaaanooolomKKKKa.............", "...............alkbbKjnoonbaqmoollomKKKKa.............", "...............alobIKnnoolbbqooolloIIIKKa.............", "................booooonnoolooooolloaKKKh..............", ".................hoooolollllllplolmoJKIa..............", "...................aooooolmmmmmlpomkaaa...............", "....................aooooonnnonoopobb.................", ".....................anonnlkkkknnnpna.................", ".....................aaonoommllooooaa.................", "...................abaloopooponlabaa..................", "..................aRRRaalpoopSaaRaRRaaa...............", "..................aSaakpooomaaaSRRSappoa..............", "...................aaRammmmaaaRSRRapooooa.............", "..................aoaRRanRnaRRRRRRapooona.............", "..................aoaaSRRnRaRRaaSSapooona.............", "..................aoaRaRanaRRRRRaaapooona.............", "..................aoaWWRRaWRRRRRa.aoooona.............", "..................aoaWWRRaWRRRRRa.aapoona.............", ".................aanaRRRSRRRRRRRaaaaonnna.............", ".................anaaRRRSRSRRRRaaappaaaaa.............", "..................anaRRRSRSRRRapppooooona.............", "...................aaRRRRRSRRapoooooonna..............", "....................aadabbaadapoooonnaa...............", ".....................aMMMNMMMaoooonaaa................", ".....................aNMaaNMMMaonnaNNa................", ".....................aNNaaMMMMMaaa..a.................", "....................annnnaanooooooa...................", ".....................annaaanoooonna...................", ".....................aZZZaaZWWWWZZa...................", ".....................acccaabaaaaaaa...................", "......................aaa.aacccccaaa..................", "......................ba..adkcccccca..................", "............................acccckka..................", "............................aaaaaaaa..................", "............................bbbbbbb..................."],
};
const mir=rows=>rows.map(r=>r.split('').reverse().join(''));
let ready=false,saved=null;
const ensureArt=()=>{ if(ready) return; ready=true; const sp=BSP(); Object.assign(sp.pal,NEWPAL);
  const W=FR.y_hip[0].length,eyeOf=k=>(sp.eyeAt&&sp.eyeAt.get(sp[k]))||sp.eye,handOf=k=>sp.handAt&&sp.handAt.get(sp[k]);
  const reg=(rows,src,flip)=>{ if(sp.eyeAt) { const e=eyeOf(src); sp.eyeAt.set(rows,flip?{col:W-1-e.col,row:e.row}:e); }
    if(sp.handAt) { const h=handOf(src); if(h) { const m=p=>flip?[W-1-p[0],p[1]]:p; sp.handAt.set(rows,{n:m(h.n),f:m(h.f)}); } } };
  for(const k of ['wind','spread','hip','run1','run2']) reg(FR['y_'+k],k,false);
  FR.y_run1R=mir(FR.y_run1); FR.y_run2R=mir(FR.y_run2); reg(FR.y_run1R,'run1',true); reg(FR.y_run2R,'run2',true);
  };
const youngOn=()=>{ ensureArt(); const sp=BSP(); if(saved) return; saved={wind:sp.wind,spread:sp.spread,hip:sp.hip,run:sp.run,runFlip:sp.runFlip};
  if(sp.yg_ready) { sp.wind=sp.yg_ready; sp.spread=sp.yg_wind; sp.hip=sp.yg_celebr; sp.run=[sp.yg_run1,sp.yg_run2]; sp.runFlip=[sp.yg_run1R,sp.yg_run2R]; return; }   // painted young runner
  sp.wind=FR.y_wind; sp.spread=FR.y_spread; sp.hip=FR.y_hip; sp.run=[FR.y_run1,FR.y_run2]; sp.runFlip=[FR.y_run1R,FR.y_run2R]; };
const youngOff=()=>{ if(!saved) return; const sp=BSP(); Object.assign(sp,saved); saved=null; };
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
