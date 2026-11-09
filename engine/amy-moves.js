'use strict';
// engine/amy-moves.js: Amy's Option 3 kit on engine/stage.js. Her fourteen Primary moves are the painted kit at the END of this file
// (data/amy-ab.js frames, Nov 2026). The four older blocks above it now hold only what is still used: effect scenes the painted kit
// reuses by name (prefixes av_, a5_, ap_, mk_, a6_), the A.pep_talk alias, Eyes Up Front, and the rig poses her Tombos ask for (amyLabPoses).
// The comment above each kept scene names the move it was first drawn for. Her legacy moves stay in engine/recruit-moves.js; PEP TALK's
// legacy animation is in engine/battle2-moves.js and hands over to A.pepShow for the Option 3 version.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates.
// Loaded after engine/boppy-moves.js.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
// painted heart (engine/town-render.js paintHeart)
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',RED='#e0402e',GREEN='#8ef0a0',PEN='#d8343a',TRACK='#d86a4a';
ST.nw('am_');
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
// her sprite has blank rows above the head
const back=(x,me)=>x<me.x?'runR':'run';
const go=(x,me)=>x<me.x?'run':'runR';
// ---------- PEP TALK ----------
A.pep_talk=E2=>A.pep(E2);   // the Option 3 signature key (data/abilities.js); the legacy key stays 'pep' (engine/battle2-moves.js)

// ---------- Eyes Up Front ----------
SC.am_pointer=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.put) return; gfx.globalAlpha=1; const tx=P.cx+18,ty=P.cy; const a=Math.atan2(ty-(h.y-6),tx-h.x),L=ms>P.aim?Math.min(70,Math.hypot(tx-h.x,ty-h.y)):30;
  gfx.save(); gfx.translate(h.x-2,h.y-6); gfx.rotate(ms>P.aim?a:-2.3); RO(0,-2,L,4,WOOD); R(L-6,-2,6,4,'#2b2a26'); gfx.restore(); };
SC.am_attn=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.aim) return; const g=ez((ms-P.aim)/250); gfx.globalAlpha=fade(u,.9); ring(P.cx,P.cy,16*g,16*g,4,OUT); ring(P.cx,P.cy,16*g,16*g,2,CREAM);
  if(ms>P.look) for(const q of P.list) { const dx=P.cx-q.x,dy=P.cy-q.top,d=Math.hypot(dx,dy)||1,ex=q.x+dx/d*4,ey=q.top-10+dy/d*2; EO(ex-5,ey,4,4,CREAM); EO(ex+5,ey,4,4,CREAM); E(ex-5+dx/d*2,ey+dy/d*1.5,2,2,'#2b2a26'); E(ex+5+dx/d*2,ey+dy/d*1.5,2,2,'#2b2a26'); }
  if(ms>P.star) star(P.cx,P.cy,ez((ms-P.star)/200)*10,GOLD,s.t); };
A.eyes_up_front=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,64),me=ST.unit(m);
  const plan={aim:1100,look:1500,star:2400,put:3100,cx:Math.round((Gp.x1+p.x)/2)-6,cy:Math.max(40,Gp.top-26),list:list.map(f=>ST.foe(f))},hit=1700;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'hip'},{t:1100,f:'aim'},{t:2400,f:'clap'},{t:2700,f:'hip'},{t:3100,f:back(p.x,me)},{t:3800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over with a classroom pointer.'); say(m.id,'eyes_up_front'); scene('am_pointer',3.2,{plan}); scene('am_attn',3.7,{plan}); }],
    [1100,()=>{ sfx.select(); setMessage('The pointer stops on an empty circle. Eyes up front.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.stun(); for(const f of list) ST.jolt(f,.15); }],
    [2400,()=>{ sfx.ding(); setMessage('Every one of them looks. She puts a little star in the circle.'); }],
    [3900,'end','The room suddenly remembers its manners.']]); };

})();

// ================= Move review rebuilds (2026-10-24): effect scenes kept for the painted kit (prefix av_) =================
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
// painted heart (engine/town-render.js paintHeart)
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',IRON='#3a3f46',IRON2='#6a727c',GREEN='#6fae5a',GREEN2='#8fd06a',SKY='#9fd8ff',MINT='#8ef0a0',TRAY='#e8a04a',SOUP='#e8913a';
ST.nw('av_');
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.av_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.av_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } const w=(s.txt.length*4-1)*(s.sc||2); x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.av_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM)); } };
SC.av_ring=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.4)*(1-q*.4); ring(s.x,s.y,8+q*(s.r||40),8+q*(s.r||40)*.75,5,s.c||CREAM); };
SC.av_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI+k/((s.n||10)-1)*Math.PI,d=ez(u)*(s.r||34); gfx.globalAlpha=(1-u)*.85; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.5,5*(1-u)+2,4*(1-u)+2,'#e8dcc4'); } };
SC.av_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };

// ---------- Hill Repeats (B2; Hill Math numbers) ----------
// A real hill heaves up out of the ground. She sprints up and down it three times, faster each time, then charges down onto them.
SC.av_hill=(s,u)=>{ const ms=s.t*1000,P=s.plan; const g=ez((ms-P.rise)/350)*(1-ez((ms-P.sink)/400)); if(g<=0) return; gfx.globalAlpha=1;
  const H=P.H*g,b=P.b; const hhp=H+38;
  if(!PROPART.draw('amy/hill_with_flag',P.xm,b+8-hhp/2,{w:P.xb-P.xa+48,h:hhp})) {
  poly([[P.xa-18,b+6],[P.xm-12,b-H],[P.xm+12,b-H],[P.xb+18,b+6]],GREEN); gfx.globalAlpha=.6; poly([[P.xm-12,b-H+2],[P.xm+12,b-H+2],[P.xm+30,b-H*.5],[P.xm-6,b-H*.55]],GREEN2);
  gfx.globalAlpha=1; if(g>.6) { R(P.xm-1,b-H-26,3,24,OUT); poly([[P.xm+1,b-H-26],[P.xm+18,b-H-20],[P.xm+1,b-H-14]],RED); } } gfx.globalAlpha=1;
  P.reps.forEach(([t0,txt])=>{ const q=(ms-t0)/600; if(q<0||q>1) return; gfx.globalAlpha=1-q; bigWord(txt,P.xm,b-H-44-q*14,CREAM,2); }); };

})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24): set pieces kept for Nobody Leaves and Boston Qualifier (prefix a5_) =================
// Chalkboard, clock, chalk writing, blast and red circles; finish arch, tape, speed lines, bowling-pin tumbles, confetti. BAR=24 letterbox.
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
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',SKY='#9fd8ff',MINT='#8ef0a0',VPB='#86a9ff';
const BOARD='#2f5a3e',BOARD2='#3c6e4c',WOOD='#9a6a3a',WOOD2='#c48a4a',WOOD3='#6e4824',BRASS='#e0b040',BRASS2='#fff0a0',CHALK='#f2f2ea';
const BLUE='#1f4fae',YEL='#ffd23a',FOIL='#d8dee8',FOIL2='#ffffff',FOIL3='#a8b2c2';
const CONF=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff','#ffffff'];
ST.nw('a5_');
if(!sfx.schoolBell) sfx.schoolBell=()=>{ for(let k=0;k<14;k++) tone({type:'square',f0:k%2?1180:1260,dur:.05,vol:.07,delay:k*.055,filter:3000}); };
if(!sfx.chalk) sfx.chalk=()=>{ noise({dur:.09,vol:.12,f0:5200,f1:3600,type:'bandpass',q:2}); };
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const BAR=24;
SC.a5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.a5_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+BAR+16,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; });
SC.a5_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.a5_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); gfx.globalAlpha=1; };
// A party member who is not the actor, moved on its own path: fn(ms) returns {x,y} offsets from home, frame and rot.
// 'run'/'runR' resolve to the run cycle (left- or right-facing).

// ---------- Detention Forever (A6) ----------
// P: the plan. Board behind the enemies (back layer); the podium, pointer, clock writing and the blast in front.
const bellDraw=(x,y,shake)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(Math.sin(shake*60)*.18*(shake>0?1:0)); if(PROPART.draw('amy/school_bell',0,-2,{h:48})) { gfx.restore(); return; }
  RO(-3,-22,6,10,WOOD3); EO(0,0,16,15,BRASS); E(-5,-5,6,5,BRASS2); EO(0,2,4,4,'#8a6a2a'); RO(-9,12,18,4,WOOD3); gfx.restore(); };
SC.a5_bell=inBox((s,u)=>{ const ring_=u<.75?1:0; bellDraw(s.x,s.y,ring_?s.t:0);
  if(ring_) for(let k=0;k<3;k++) { const q=((s.t*3)+k/3)%1; gfx.globalAlpha=(1-q)*.8; gfx.strokeStyle=GOLD; gfx.lineWidth=3;
    for(const sd of [-1,1]) { gfx.beginPath(); gfx.arc(s.x,s.y,20+q*30,sd<0?Math.PI*.75:-Math.PI*.25,sd<0?Math.PI*1.25:Math.PI*.25); gfx.stroke(); } } gfx.globalAlpha=1; });
SC.a5_board=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0,B=P.B; if(ms<P.drop) return; if(ms>P.boom+80) return;
  const q=ms<P.drop+220?ez((ms-P.drop)/220):1,dy=(1-q)*-(B.y1+10),bob=ms<P.drop+420&&ms>P.drop+220?Math.sin((ms-P.drop-220)/200*Math.PI)*4:0;
  const x0=B.x0,x1=B.x1,y0=B.y0+dy+bob,y1=B.y1+dy+bob;
  if(PROPART.draw('amy/chalkboard',(x0+x1)/2,(y0+y1)/2,{w:x1-x0+14,h:y1-y0+14})) R(x0+8,y0+5,x1-x0-16,y1-y0-10,BOARD);   // painted frame, clean board for the chalk lines
  else { RO(x0-6,y0-6,x1-x0+12,y1-y0+12,WOOD); R(x0-6,y0-6,x1-x0+12,3,WOOD2); RO(x0,y0,x1-x0,y1-y0,BOARD); }
  gfx.globalAlpha=.25; for(let k=0;k<5;k++) R(x0+10+k*((x1-x0)/5),y0+6+((k*13)%20),26,3,'#ffffff'); gfx.globalAlpha=1;
  RO(x0+8,y1+2,x1-x0-16,5,WOOD2); R(x0+30,y1-1,14,4,CHALK); R(x0+60,y1-2,18,6,'#e8dcc8'); });
// The podium in front of Amy (she stands behind it), with an apple on top that pops into blue VP sparkles.
SC.a5_podium=(s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0,g=ez((ms-P.podium)/220); if(g<=0) return; const x=P.px,y=P.py,h=56*g;
  gfx.globalAlpha=fade(u,.94);
  const H0=78*g,pap=ms<P.apple,pok=pap?PROPART.draw('amy/podium_with_apple',x,y-H0/2,{h:H0}):PROPART.draw('amy/podium_with_apple',x,y-H0*.7875/2,{h:H0*.7875,src:[0,34,129,126]});   // the apple is cropped off once it has popped
  if(!pok) { PO([[x-22,y],[x+22,y],[x+17,y-h],[x-17,y-h]],WOOD); R(x-16,y-h+8,32,3,WOOD3); R(x-2,y-h+14,4,h-20,WOOD2);
  PO([[x-27,y-h],[x+27,y-h],[x+24,y-h-8],[x-24,y-h-8]],WOOD2); }
  if(!pok&&g>=1&&ms<P.apple) { EO(x-12,y-h-14,7,6,'#e03a2e'); E(x-14,y-h-16,2.5,2,'#ff9a8a'); R(x-12,y-h-23,2,5,WOOD3); E(x-8,y-h-22,4,2,'#6fae5a'); }
  gfx.globalAlpha=1; };
// The pointer stick in her hand: up, then three taps on the podium, then pointed at the clock, then at them.
// The wall clock: 2:59, about to hit 3:00. Then it spins backward an hour to 2:00.
SC.a5_clock=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0,C=P.clock; if(ms>P.boom+80) return; const g=ez((ms-P.drop-150)/200); if(g<=0) return;
  const r=17*g; PROPART.draw('amy/wall_clock',C.x,C.y,{w:r*2.5});   // painted bezel; the drawn face and hands go on top so the clock can wind back
  EO(C.x,C.y,r,r,CREAM); ring(C.x,C.y,r-2,r-2,1.5,'#9aa3a8'); for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; R(C.x+Math.cos(a)*(r-5)-1,C.y+Math.sin(a)*(r-5)-1,2,2,OUT); }
  // minutes past 2:00 (59 = 2:59). Ticks to 59.8, then spins back 60 minutes.
  let m=59; if(ms>P.spin0) { const q=ez((ms-P.spin0)/(P.spin1-P.spin0)); m=lerp(59.6,0,q); } else if(ms>P.clockPoint) m=lerp(59,59.6,ez((ms-P.clockPoint)/300));
  const ma=m/60*Math.PI*2-Math.PI/2,ha=(2+m/60)/12*Math.PI*2-Math.PI/2;
  LnO(C.x,C.y,C.x+Math.cos(ha)*r*.5,C.y+Math.sin(ha)*r*.5,2,OUT); Ln(C.x,C.y,C.x+Math.cos(ma)*r*.8,C.y+Math.sin(ma)*r*.8,2,RED); E(C.x,C.y,2,2,OUT);
  if(ms>P.spin0&&ms<P.spin1) for(let k=0;k<3;k++) { gfx.globalAlpha=.6-k*.18; gfx.strokeStyle=SKY; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(C.x,C.y,r+5+k*4,ma,ma+1.2); gfx.stroke(); }
  gfx.globalAlpha=1;
  if(ms>P.clockPoint&&ms<P.spin0) bigWord('2:59',C.x,C.y+r+6,CREAM,2);
  if(ms>P.spin1&&ms<P.spin1+1500) { const q=(ms-P.spin1)/1500; gfx.globalAlpha=fade(q,.8); bigWord('2:00',C.x,C.y+r+6,SKY,2); gfx.globalAlpha=1; } });
// Chalk writing lines on the board, three rows, each with its own giant chalk stick at the cursor.
const LINE='I WILL NOT CAUSE FRICTION';
SC.a5_lines=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0,B=P.B; if(ms<P.write0||ms>P.boom+80) return; const sc=P.lsc,cw=4*sc,n=LINE.length;
  for(let r=0;r<3;r++) { const t0=P.write0+r*150,q=cl((ms-t0)/P.writeDur); if(q<=0) continue; const k=Math.floor(q*n),txt=LINE.slice(0,k);
    const y=B.y0+12+r*(sc*5+8),x0=B.lx; if(txt) { gfx.globalAlpha=.92; label(txt,x0+((txt.length*4-1)*sc)/2,y,CHALK,sc); gfx.globalAlpha=1; }
    if(q<1) { const cx=x0+k*cw+2,cy=y+sc*2+Math.sin(ms/40+r)*1.5; gfx.save(); gfx.translate(cx,cy); gfx.rotate(-.6); if(!PROPART.draw('amy/chalk_and_erasers',9,-7,{w:26,src:[2,2,68,44]})) { RO(-3,-16,7,24,CHALK); R(-3,-16,7,4,'#ffd0d0'); } gfx.restore();
      gfx.globalAlpha=.6; E(cx+2,cy+8,3,2,CHALK); gfx.globalAlpha=1; } } });
// The blast: chalk dust clouds, felt erasers and red-pen report cards flying out of where the board was.
SC.a5_blast=inBox((s,u)=>{ const B=s.B,cx=(B.x0+B.x1)/2,cy=(B.y0+B.y1)/2,W=B.x1-B.x0;
  for(let k=0;k<14;k++) { const a=k/14*Math.PI*2+.3,d=ez(u)*(60+(k%4)*18); gfx.globalAlpha=(1-u)*.8; E(cx+Math.cos(a)*d*W/180,cy+Math.sin(a)*d*.6,14*(1-u*.4)+4,10*(1-u*.4)+3,'#eef0ea'); }
  for(let k=0;k<10;k++) { const a=-Math.PI*.95+k/9*Math.PI*1.1+((k*37)%10)/40,sp=150+(k%3)*50,x=cx+Math.cos(a)*sp*u*W/180,y=cy+Math.sin(a)*sp*u+u*u*160,rot=u*(6+k)*(k%2?1:-1);
    gfx.globalAlpha=fade(u,.75); gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
    if(k%2) { if(!PROPART.draw('amy/chalk_and_erasers',0,0,{w:28,src:[0,86,98,57]})) { RO(-11,-5,22,10,'#3a4a8a'); R(-11,1,22,4,'#e8dcc4'); } }
    else { if(!PROPART.draw('amy/report_cards',0,0,{h:32})) { RO(-10,-13,20,26,CREAM); label('F',0,-9,PEN,2); R(-6,4,12,1,'#9fc4f0'); R(-6,7,10,1,'#9fc4f0'); } }
    gfx.restore(); }
  for(let k=0;k<8;k++) { const a=k/8*Math.PI*2+1,d=ez(u)*90; gfx.globalAlpha=(1-u)*.9; E(cx+Math.cos(a)*d*1.3,cy+Math.sin(a)*d*.8,5,4,PEN); }
  gfx.globalAlpha=1; });
// Red ink circles round every enemy (the engine pops SEE ME itself).
SC.a5_seeme=inBox((s,u)=>{ s.list.forEach((F,k)=>{ const q=ez((u*1.2-k*.08)/.3); if(q<=0) return; gfx.globalAlpha=fade(u,.8);
  gfx.strokeStyle=PEN; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(F.x,F.mid,F.w*.62,F.h*.62,-.12,-1.3,-1.3+q*Math.PI*2.1); gfx.stroke();
}); gfx.globalAlpha=1; });
// The apple bursts into blue sparkles that fly to everyone (the +3 VP).
SC.a5_vp=(s,u)=>{ for(const q of s.to) for(let k=0;k<5;k++) { const v=cl(u*1.3-k*.06); if(v<=0||v>=1) continue; const x=lerp(s.x,q.x+(k-2)*6,ez(v)),y=lerp(s.y,q.top+10,ez(v))-Math.sin(v*Math.PI)*50;
  gfx.globalAlpha=1-v*.4; star(x,y,4+(k%2)*2,k%2?'#ffffff':VPB,v*6+k); } gfx.globalAlpha=1;
  if(u<.3) { gfx.globalAlpha=1-u/.3; for(let k=0;k<8;k++) { const a=k/8*Math.PI*2,d=u/.3*22; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,3,3,k%2?'#e03a2e':'#ff9a8a'); } gfx.globalAlpha=1; } };

// ---------- Boston Qualifier (B6) ----------
// The FINISH arch and crowd barriers (back layer), the tape (front), the stopwatch, speed lines, bowling-pin tumbles,
// confetti cannons and foil finisher blankets.
SC.a5_arch=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000,g=ez(ms/300),out=u>.94?(1-u)/.06:1,ax=P.ax,gy=P.gy,top=BAR+10,hw=44;
  gfx.globalAlpha=out;
  // crowd barriers along the back with heads bobbing and two signs
  const by=P.cy; for(let x=-10;x<586;x+=8) { const k=(x/8)|0,bob=Math.abs(Math.sin(ms/180+k*1.7))*(ms>P.cheer?5:2); E(x+4,by-8-bob-(k%3)*2,4,4.5,['#f0c8a8','#c8946a','#8a5a3a','#f4d8b8'][k%4]); R(x+1,by-4-bob-(k%3)*2,7,8,CONF[k%6]); }
  if(PROPART.ready('amy/crowd_barriers')) { for(let x=-10,j=0;x<586;x+=58,j++) PROPART.draw('amy/crowd_barriers',x+29,by+9,{w:62,flip:j%2===1}); }
  else for(let x=-10;x<586;x+=40) { RO(x,by,36,10,BLUE); R(x+2,by+2,32,2,'#5c88e0'); R(x+4,by+12,3,10,OUT); R(x+29,by+12,3,10,OUT); }
  for(const [sx,txt] of [[P.sign1,'GO AMY!'],[P.sign2,'26.2']]) { const bob=Math.abs(Math.sin(ms/200+sx))*6; R(sx-1,by-34-bob,3,24,OUT); RO(sx-22,by-50-bob,44,18,CREAM); label(txt,sx,by-46-bob,BLUE,1); }
  // the arch
  const y1=gy,h=(y1-top)*g,AWW=140*g,AWH=AWW*135/160;
  if(PROPART.draw('amy/finish_arch',ax,y1+4-AWH/2,{w:Math.max(1,AWW)})) { if(g>.9) { const ytop=y1+4-AWH; R(ax-20,ytop+4,40,16,'#111'); label('2:'+String(59).padStart(2,'0')+':'+String(Math.floor(50+Math.min(ms,P.tape)/1000*2)%60).padStart(2,'0'),ax,ytop+9,'#ff5a4a',1); } }
  else { for(const px of [ax-hw,ax+hw]) { RO(px-5,y1-h,10,h,BLUE); R(px-5,y1-h,3,h,'#5c88e0'); }
  if(g>.5) { const yb=y1-h; RO(ax-hw-10,yb,hw*2+20,22,BLUE); R(ax-hw-8,yb+2,hw*2+16,3,YEL); R(ax-hw-8,yb+17,hw*2+16,3,YEL); bigWord('FINISH',ax,yb+6,YEL,2);
    RO(ax-24,yb+24,48,12,'#111'); const clk=Math.min(ms,P.tape)/1000; label('2:'+String(59).padStart(2,'0')+':'+String(Math.floor(50+clk*2)%60).padStart(2,'0'),ax,yb+27,'#ff5a4a',1); } }
  gfx.globalAlpha=1; });
// The finish tape across the arch at chest height; snaps in two at P.tape and the halves flutter down.
SC.a5_tape=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000,ax=P.ax,hw=44,y=P.gy-P.chest; if(ms<300) return;
  if(ms<P.tape) { gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.moveTo(ax-hw,y); gfx.quadraticCurveTo(ax,y+4+Math.sin(ms/150)*2,ax+hw,y); gfx.stroke(); gfx.strokeStyle=YEL; gfx.lineWidth=3; gfx.stroke(); return; }
  const q=cl((ms-P.tape)/700);
  if(PROPART.draw('amy/finish_tape',ax,y+17,{w:106})) return;   // painted snapped tape and its two stanchions
  for(const sd of [-1,1]) { const px=ax+sd*hw; gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.moveTo(px,y);
    const ex=px-sd*hw*(1-q*.4),ey=y+q*40+Math.sin(ms/70+sd)*4*(1-q); gfx.quadraticCurveTo(px-sd*hw*.5,y+q*30-8*(1-q),ex,ey); gfx.stroke(); gfx.strokeStyle=YEL; gfx.lineWidth=3; gfx.stroke(); } });
// The stopwatch in her hand while she checks it.
// Speed lines trailing the pack while they sprint (to the right of the runners).
SC.a5_speed=(s,u)=>{ const P=s.plan,st=P.st; if(st.x==null) return; const k=fin(u,.1)*fade(u,.75);
  for(let j=0;j<16;j++) { const y=P.y0+((j*29)%(P.y1-P.y0)),x=st.x+40+((j*53)%140)+((s.t*500+j*37)%60); gfx.globalAlpha=k*(.35+(j%3)*.15); Ln(x,y,x+40+(j%4)*16,y,2+(j%2),j%2?'#ffffff':CREAM); } gfx.globalAlpha=1; };
// Monsters spin like bowling pins as the front of the pack passes them.
SC.a5_bowl=(s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0; for(const b of P.pins) { if(ms<b.t) continue; const q=(ms-b.t)/750; if(q>=1) continue;
  lift(b.f,-Math.sin(q*Math.PI)*(40+b.k*6),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*14); } };
// Confetti cannons from both arch posts.
SC.a5_confetti=inBox((s,u)=>{ for(const sd of [-1,1]) { const ox=s.ax+sd*44,oy=s.gy-90; for(let k=0;k<26;k++) { const a=-Math.PI/2+sd*(.15+((k*37)%10)/22),sp=220+(k%5)*40,t=s.t;
  const x=ox+Math.cos(a)*sp*t*(1-t*.3),y=oy+Math.sin(a)*sp*t+t*t*260; gfx.globalAlpha=fade(u,.7); gfx.save(); gfx.translate(x,y); gfx.rotate(t*8+k); R(-3,-2,6,4,CONF[k%7]); gfx.restore(); } } gfx.globalAlpha=1; });
// Foil finisher blankets round everyone's shoulders: the back of the blanket behind the body (back layer), two front flaps
// in front, open down the middle so the face and front still show. SHF: shoulder height as a fraction of the visible body
// (chibi heads for Tom, Grace and Rose; the recruit rigs are adult proportions and have blank rows above the head).
const SHF={tom:.5,grace:.52,rose:.5,amy:.66,deedee:.66,boppy:.66,tnb:.66,nara:.55};
const foilBox=(q,id,g)=>{ const sp=BATTLE_SPRITES[id],rows=sp?sp.idle:[],k=rows.findIndex(r=>/[^.]/.test(r)),vis=q.h-Math.max(0,k)*(sp?sp.scale:2);
  const sh=q.base-vis*(SHF[id]||.6),bot=q.base-vis*.14; return {x:q.x+vis*.02,sh,bot,sw:vis*.38*g+2,bw:vis*.56*g+2}; };
const foilPaint=pts=>{ if(!PROPART.ready('amy/foil_blankets')) return; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const [x,y] of pts) { x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); }
  gfx.save(); gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.clip(); PROPART.draw('amy/foil_blankets',(x0+x1)/2,(y0+y1)/2,{w:Math.max(24,(x1-x0)*1.2),h:Math.max(24,(y1-y0)*1.2)}); gfx.restore();
  gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.lineJoin='round'; gfx.stroke(); };
SC.a5_foilB=(s,u)=>{ const g=ez(u/.12); for(const [q,id] of s.list) { const b=foilBox(q,id,g); gfx.globalAlpha=fade(u,.9);
  const bp=[[b.x-b.sw*.5,b.sh],[b.x+b.sw*.5,b.sh],[b.x+b.bw*.5,b.bot],[b.x-b.bw*.5,b.bot]]; PO(bp,FOIL3); foilPaint(bp); } gfx.globalAlpha=1; };
SC.a5_foil=(s,u)=>{ const g=ez(u/.12); for(const [q,id] of s.list) { const b=foilBox(q,id,g),sh=Math.sin(s.t*7+b.x)*.5+.5; gfx.globalAlpha=fade(u,.9);
  for(const sd of [-1,1]) { const o0=b.x+sd*b.sw*.5,o1=b.x+sd*b.bw*.5,i0=b.x+sd*b.sw*.2,i1=b.x+sd*b.bw*.3;
    const fp=[[o0,b.sh],[i0,b.sh+2],[i1,b.bot],[o1,b.bot]]; PO(fp,FOIL); foilPaint(fp);
    gfx.globalAlpha=fade(u,.9)*(.4+.6*(sd<0?sh:1-sh)); PO([[lerp(o0,i0,.35),b.sh+3],[lerp(o0,i0,.6),b.sh+3],[lerp(o1,i1,.6),b.bot-3],[lerp(o1,i1,.3),b.bot-3]],FOIL2,0); gfx.globalAlpha=fade(u,.9); }
  RO(b.x-b.sw*.5,b.sh-2,b.sw,3,GOLD2); } gfx.globalAlpha=1; };
})();

// ================= Polish pass (2026-10-24): Almond Milk props kept for the painted kit (prefixes ap_, mk_) =================
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',PEN='#d8343a',MINT='#8ef0a0',TRAY='#e8a04a',SOUP='#e8913a';
ST.nw('ap_');
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;

// ---------- Almond Milk, Please: bigger pizza and carton, a huge NO THANKS ----------
const DS=1.8;
const carton=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(DS,DS);
  // a pint of milk: gable top with a fin, blue band, little cow spots and a real label
  poly([[-16,-14],[0,-30],[16,-14]],OUT); poly([[-13,-14],[0,-26],[13,-14]],'#e9edf6'); R(-2,-31,4,5,OUT); R(-1,-30,2,4,'#c6cfe0');
  RO(-15,-15,30,38,'#ffffff'); R(-13,-13,26,34,'#fbfcff'); R(-13,-13,5,34,'#e1e7f3'); R(-13,-1,26,12,'#3a74c9'); R(-13,-1,26,2,'#6a9ae0');
  label('MILK',0,3,'#ffffff',1);
  for(const [a2,b2,w2] of [[-9,-9,6],[3,-10,7],[7,15,5],[-10,14,6]]) { R(a2,b2,w2,4,'#2b2a26'); R(a2+1,b2+4,w2-2,2,'#2b2a26'); }
  E(-5,-5,1.6,2.4,OUT); E(5,-5,1.6,2.4,OUT);
  gfx.restore(); };
// ---------- Almond Milk, Please: the milk carton she kicks, its splash and puddle (props amy/milk_*, art/props/amy; used by the painted kit below) ----------
SC.mk_carton=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.pop) return; if(ms>=P.hit-50) { if(!P.fired) { P.fired=true; P.onHit(); } return; } gfx.globalAlpha=1; let x=P.x0,y=P.y0,rot=0,sc=1,dent=false;
  if(ms<P.kick) { const q=ez((ms-P.pop)/300); sc=q*(1+.2*Math.sin(q*Math.PI)); y-=Math.abs(Math.sin((ms-P.pop)/95))*16*(1-q); if(ms>P.line) x+=Math.sin(ms/55)*.9; }   // pops in, then trembles
  else { const q=cl((ms-P.kick)/(P.hit-P.kick)); x=lerp(P.x0,P.x1,q); y=lerp(P.y0,P.y1,q)-Math.sin(q*Math.PI)*P.arc; rot=-q*Math.PI*5; dent=true; }
  gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  if(!PROPART.draw(dent?'amy/milk_carton_dented':'amy/milk_carton',0,0,{h:P.h,rot})) carton(0,0,rot);
  gfx.restore(); };
SC.mk_splash=(s,u)=>{ const ms=s.t*1000,P=s.plan;
  if(ms<800) { const q=ms/800; gfx.globalAlpha=1-ez((q-.35)/.65); const k=.55+.8*ez(q*1.6); if(!PROPART.draw('amy/milk_burst',P.ix,P.iy,{h:P.bh*k})) E(P.ix,P.iy,P.bh*.45*k,P.bh*.35*k,'#f4f7ff'); }
  for(const F of P.F) { const t1=ms-F.d; if(t1<0) continue; const fa=1-ez((ms-P.fade)/800);
    { const q=ez(t1/260),a=1-ez((t1-380)/520); if(a>0) { gfx.globalAlpha=a; if(!PROPART.draw('amy/milk_crown',F.x,F.base-4-q*6,{w:F.cw*(.5+.6*q)})) E(F.x,F.base-6,F.cw*.4*q,6*q,'#f4f7ff'); } }   // crown at the feet
    { const q=ez((t1-60)/220); if(q>0) { gfx.globalAlpha=fa*q; const dy=ez((t1-100)/2200)*7;                                                                   // splat on the body, sliding down
      if(!PROPART.draw('amy/milk_splat',F.x-F.w*.04,F.mid-F.sh*.12+dy,{h:F.sh*(.6+.4*q),rot:F.rot})) E(F.x,F.mid+dy,F.sh*.4,F.sh*.35,'#f4f7ff'); } } }
  gfx.globalAlpha=1; };
SC.mk_puddle=(s,u)=>{ const ms=s.t*1000,P=s.plan;   // drawn behind the foes (back:true)
  for(const F of P.F) { const t1=ms-F.d-250; if(t1<0) continue; const q=ez(t1/400),fa=1-ez((ms-P.fade-300)/800); gfx.globalAlpha=fa*q;
    if(!PROPART.draw('amy/milk_puddle',F.x+4,F.base+2,{w:F.pw*q})) E(F.x+4,F.base+2,F.pw*.5*q,6*q,'#f4f7ff'); }
  gfx.globalAlpha=1; };

})();
// ================= Family Move Lab scenes (2026-10-27): effect scenes kept for the painted kit (prefix a6_), and the rig poses
// her Tombos ask for (window.amyLabPoses, engine/battle2-kind.js) =================
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
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',SKY='#9fd8ff',MINT='#8ef0a0',BLUE='#1f4fae',YEL='#ffd23a',WOOD='#9a6a3a',WOOD2='#c48a4a',WOOD3='#6e4824',TRACK='#c86a4a';
ST.nw('a6_');
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
if(!sfx.whistle) sfx.whistle=()=>{ for(let k=0;k<3;k++) tone({type:'square',f0:2400+k*60,f1:2600,dur:.1,vol:.09,delay:k*.11,filter:5000}); };
if(!sfx.click) sfx.click=()=>{ noise({dur:.03,vol:.18,f0:3000,f1:1500,type:'bandpass',q:4}); };
// Extra Amy frames for her Tombos (engine/battle2-kind.js amyPoses); data/amy-hires-extra-use.js swaps in painted ones.
const POSE={
  whistle:{nh:[-5,-6],fh:[1,8]},            // hand to mouth (whistle)
  shh:{nh:[-3,-8],fh:[2,8],lean:-2},        // finger to lips
  reach:{nh:[-7,-13],fh:[2,8],lean:-2},     // reaching up to a switch
  bend:{nh:[-8,12],fh:[-6,12],lean:-9},     // hands to the floor
  jump:{nh:[-11,-12],fh:[11,-12]},          // arms straight up
  write:{nh:[-13,-4],fh:[2,7],lean:-3},     // arm out, writing
  card:{nh:[-6,-13],fh:[2,8],lean:-1},      // holding a card up high
  carry:{nh:[-11,9],fh:[-9,9],lean:-1},     // both hands out, holding a tray
  hold:{nh:[-10,-2],fh:[-8,-2],lean:-2},    // both hands out, higher
  grab:{nh:[-13,0],fh:[-12,-2],lean:-5}     // leaning in, both hands grabbing
};
let posed=false; const poses=()=>{ if(posed) return; posed=true; for(const k in POSE) RECRUIT_POSES.add('amy',k,POSE[k]); };   // data/recruit-poses.js loads after this file
window.amyLabPoses=poses;   // the Tombo scenes (engine/battle2-kind.js, Task U) use these frames too

// ---------- Shared scenes ----------
SC.a6_big=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc; let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y); gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; };
SC.a6_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } const w=(s.txt.length*4-1)*(s.sc||2); x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); gfx.globalAlpha=1; };
SC.a6_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM),u*4+k); } gfx.globalAlpha=1; };
SC.a6_ring=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.4)*(1-q*.4); ring(s.x,s.y,8+q*(s.r||40),8+q*(s.r||40)*.75,5,s.c||CREAM); gfx.globalAlpha=1; };
SC.a6_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI+k/((s.n||10)-1)*Math.PI,d=ez(u)*(s.r||34); gfx.globalAlpha=(1-u)*.85; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.5,5*(1-u)+2,4*(1-u)+2,'#e8dcc4'); } gfx.globalAlpha=1; };
SC.a6_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); gfx.globalAlpha=1; };
SC.a6_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.7); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.a6_hearts=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; const x=s.x-20+k*10+Math.sin(q*6+k)*5,y=s.y-q*44,r=5+(k%2)*2,c=k%2?'#ff9ac0':'#ff6b9a'; paintHeart(x,y+r*.3,r*1.15,c); } gfx.globalAlpha=1; };
// Afterimages of the actor's last positions (s.trail is filled by the move).
SC.a6_ghost=(s,u)=>{ const st=s.st; if(!st||st.x==null||!st.frame) return; const T=s.trail; const now=performance.now(); if(!T.last||now-T.last>s.every) { T.last=now; T.list.push({x:st.x,y:st.y,f:st.frame,t:now}); if(T.list.length>s.n) T.list.shift(); }
  const sp=st.sp; for(const g of T.list) { const a=1-(now-g.t)/s.life; if(a<=0) continue; gfx.globalAlpha=a*.45; const w=g.f[0].length*sp.scale,h=g.f.length*sp.scale; drawSprite(g.f,sp.pal,g.x-w/2,g.y-h,sp.scale); } gfx.globalAlpha=1; };

// ---------- Burpee Blitz (B1): real burpees, counted, and the last jump lands on it ----------
// Beats per rep: stand, bend (hands to the floor), kick the feet back into a plank, push-up down, press up, feet back in, jump with arms up.
SC.a6_count=(s,u)=>{ const ms=s.t*1000,P=s.plan,n=P.marks.filter(([t0])=>ms>=t0).length; if(!n&&ms<P.show) return;
  const last=P.marks[n-1],pop=last?Math.max(0,1-(ms-last[0])/240):0,fin2=n>=P.marks.length;
  gfx.globalAlpha=fin(u,.04)*fade(u,.88); gfx.save(); gfx.translate(P.x,P.y); gfx.scale(1+pop*.3,1+pop*.3);
  RO(-50,-36,100,70,fin2?'#3a2a08':'#1c2230'); R(-46,-32,92,4,'#ffffff22'); label('BURPEES',0,-28,'#9db1cc',2); bigWord(String(n),0,-12,fin2?GOLD:CREAM,6); gfx.restore(); gfx.globalAlpha=1; };
SC.a6_beat=(s,u)=>{ const ms=s.t*1000,P=s.plan; for(const [t0,txt] of P.beats) { const q=(ms-t0)/520; if(q<0||q>1) continue; gfx.globalAlpha=1-q*q; bigWord(txt,P.x,P.y-q*12,CREAM,3); } gfx.globalAlpha=1; };
SC.a6_leap=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; gfx.globalAlpha=fade(u,.6)*.85; for(let k=0;k<6;k++) { const x=st.x-24+k*10,y0=st.y+8+(k%2)*10; Ln(x,y0,x,y0+30+(k%3)*12,3,k%2?CREAM:GOLD); } gfx.globalAlpha=1; };

// ---------- PEP TALK: the whole body in it ----------
// She sprints out in front of the team, skids to a stop, blows the whistle, flexes, points at every one of them by name,
// squats and springs straight up with LET'S GO, claps the three-clap, and throws both arms up as the boost lands.
SC.a6_callout=(s,u)=>{ const g=ez(u/.15),b=Math.sin(s.t*9)*3; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y+b); gfx.scale(g,g);
  PO([[0,-16],[12,-2],[5,-2],[5,10],[-5,10],[-5,-2],[-12,-2]],GOLD); gfx.restore(); bigWord(s.txt,s.x,s.y-36+b,GOLD,2); gfx.globalAlpha=1; };
SC.a6_claps=(s,u)=>{ const ms=s.t*1000,P=s.plan; P.claps.forEach((c,k)=>{ const q=(ms-c)/420; if(q<0||q>1) return; const h=head(P.st,10); gfx.globalAlpha=1-q; bigWord('CLAP',h.x-34+(k%2)*68,h.y-q*22-k*3,GOLD,2); ring(h.x,h.y+26,10+q*34,8+q*24,3,CREAM); }); gfx.globalAlpha=1; };

// ---------- False Start (B4): the monster jumps the gun; she drags it back to the blocks ----------
// Start line and blocks under it. ON YOUR MARKS. SET. Her starter pistol goes up. It lunges early. BANG: FALSE START.
// She marches over, grabs it, hauls it back and slams it into the blocks, then shows it the red card.
SC.a6_line=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.on) return; const g=ez((ms-P.on)/250); gfx.globalAlpha=fade(u,.94);
  const lx=F.x-F.w*.5-30,lw=F.w+80,by=F.base; const lpw=lw*g*.95,lpt=PROPART.draw('amy/starting_line',F.x,by+16,{w:Math.max(1,lpw*.9),h:Math.max(1,lpw*.28)});
  if(!lpt) { RO(lx,by+2,lw*g,14,'#ffffff');
  gfx.save(); gfx.translate(F.x-F.w*.5-6,by+2); gfx.scale(-g*3.4,g*3.4); PO([[-10,0],[-10,-8],[0,-2],[0,0]],'#d84a3a'); PO([[2,0],[2,-10],[12,-3],[12,0]],'#d84a3a'); R(-12,0,26,3,'#9aa3a8'); gfx.restore(); }
  if(g>.9) bigWord('START',lx+lw/2,by+22,CREAM,3);
  for(const [t0,txt] of P.calls) { const q=(ms-t0)/700; if(q<0||q>1) continue; gfx.globalAlpha=1-q*q; bigWord(txt,F.x,F.top-60-q*10,CREAM,3); }
  gfx.globalAlpha=1;
  // the monster: leans early, lunges, gets hauled back past the line, slams into the blocks
  if(ms>P.lean&&ms<P.lunge) lift(P.f,0,-.22*ez((ms-P.lean)/200),-10*ez((ms-P.lean)/200));
  else if(ms>=P.lunge&&ms<P.grab) { const q=ez((ms-P.lunge)/260); lift(P.f,-Math.sin(q*Math.PI)*6,lerp(-.22,-.3,q),lerp(-10,-38,q)); }
  else if(ms>=P.grab&&ms<P.slam) { const q=ez((ms-P.grab)/(P.slam-P.grab)); lift(P.f,0,lerp(-.3,.25,q),lerp(-38,30,q)); }
  else if(ms>=P.slam&&ms<P.slam+900) { const q=ez((ms-P.slam)/500); lift(P.f,0,lerp(.25,0,q),lerp(30,6,q)); } };

// ---------- Hot Lunch Tray (A2): a real cafeteria lunch ----------
// She carries a full tray with both hands (tomato soup, grilled cheese triangles, green beans, an apple, an almond-milk
// carton and a cookie) over to the friend, sets it on a pop-up lunch table, and the steam does the rest.
const SOUP='#d8452e',TRAYC='#e9a04a';
SC.a6_table=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; const g=ez((ms-P.on)/250); gfx.globalAlpha=fade(u,.94); const x=P.x,y=P.y,w=150*g;
  if(!PROPART.draw('amy/lunch_table',x,y-34,{w:Math.max(1,w*.8)})) { RO(x-w/2,y-30,w,8,'#b84a3a'); R(x-w/2+4,y-28,w-8,2,'#e86a5a'); for(const px of [x-w/2+10,x+w/2-14]) { RO(px,y-22,4,22,'#9aa3a8'); } } gfx.globalAlpha=1; };
SC.a6_melt=(s,u)=>{ for(let k=0;k<10;k++) { const q=cl(u*1.4-k*.04),x=s.x-s.w*.5+((k*37)%10)/10*s.w,y=s.top+((k*53)%10)/10*s.h*.8+q*20; gfx.globalAlpha=(1-q)*.9; R(x,y,6,6,'#cfeeff'); R(x+2,y+6,2,q*10,'#9fd8ff'); } gfx.globalAlpha=1; };

// ---------- Inside Voices! (A4): the light switch, in detail ----------
// A ceiling lamp hangs over the row on a cord that runs to a big wall switch plate beside her. She reaches up and flips
// the toggle: off (the room goes dark, the lamp dies), on, off, on. Then the teacher clap, finger to her lips, and the
// whole row goes quiet.
SC.a6_lampB=(s,u)=>{ const ms=s.t*1000,P=s.plan,off=P.flicks.some(([a,b])=>ms>=a&&ms<b); gfx.globalAlpha=fade(u,.94); const x=P.lx,y=P.ly;
  // cord from the ceiling, along the top, down to the switch
  Ln(x,0,x,y-26,3,'#2b2a26'); Ln(x,8,P.sx+8,8,3,'#2b2a26'); Ln(P.sx+8,8,P.sx+8,P.sy-24,3,'#2b2a26');
  // shade and bulb
  if(!PROPART.draw('amy/ceiling_lamp',x,y-6,{w:96})) { PO([[x-34,y],[x+34,y],[x+20,y-26],[x-20,y-26]],'#3f8f5f'); R(x-30,y-4,60,3,'#2f6f48'); EO(x,y+6,9,10,off?'#c9c2b8':'#fff6c8'); } if(!off) { gfx.globalAlpha*=.35; PO([[x-34,y+2],[x+34,y+2],[x+130,324],[x-130,324]],'#fff2b0',0); }
  gfx.globalAlpha=1; };
SC.a6_hush=(s,u)=>{ for(const q of s.list) { const x=q.x,y=q.top-22; gfx.globalAlpha=fin(u,.15)*fade(u,.8); RO(x-18,y-10,36,18,CREAM); label('...',x+1,y-6,'#2b2a26',2); R(x-4,y+8,6,4,CREAM); } gfx.globalAlpha=1; };
SC.a6_zz=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.8)*g; for(let k=0;k<3;k++) { const q=(s.t*.7+k/3)%1; bigWord('SHH',s.x+k*8-8,s.y-q*30,CREAM,1); } gfx.globalAlpha=1; };

// ---------- Gold-Star Recess (A3): the sticker chart ----------
// She pulls a sticker chart down out of nowhere, one row per family member, and slaps a big gold star sticker on every
// row (the stickers fly from her hand). Full chart: she rings the recess bell, the chart flies up and gold stars rain.
SC.a6_chart=(s,u)=>{ const ms=s.t*1000,P=s.plan; const g=ez((ms-P.on)/300),up=ez((ms-P.up)/350); if(g<=0||up>=1) return; const x=P.x,w=P.w,h=P.rows.length*28+34,y0=P.y-h*g+(up?-up*(P.y+40):0);
  gfx.globalAlpha=fade(u,.96); if(PROPART.ready('amy/sticker_chart')) { const pw=h*.78; R(x-pw*.38,-4,3,Math.max(0,y0+10),'#2b2a26'); R(x+pw*.38-3,-4,3,Math.max(0,y0+10),'#2b2a26'); PROPART.draw('amy/sticker_chart',x,y0+h/2,{h:h}); gfx.globalAlpha=1; return; }   // painted chart (its stars are painted; the stickers still fly onto it)
  R(x-w/2+8,-4,4,Math.max(0,y0+4),'#2b2a26'); R(x+w/2-12,-4,4,Math.max(0,y0+4),'#2b2a26');   // painted chart (its stars are painted; the stickers still fly onto it)
  RO(x-w/2,y0,w,h,CREAM); R(x-w/2+4,y0+4,w-8,18,BLUE); label('GOLD STAR CHART',x,y0+11,CREAM,1);
  P.rows.forEach((r,k)=>{ const ry=y0+30+k*28; R(x-w/2+6,ry+24,w-12,1,'#9fc4f0'); label(r.name,x-w/2+12+(r.name.length*4-1),ry+7,'#2b2a26',2);
    for(let c=0;c<4;c++) { const sx=x-w/2+92+c*26,got=c<3||ms>r.at; if(got) star(sx,ry+12,got&&c===3&&ms<r.at+300?lerp(16,10,ez((ms-r.at)/300)):10,c===3?GOLD2:GOLD,k+c); else ring(sx,ry+12,7,7,1.5,'#c9c2b8'); } });
  gfx.globalAlpha=1; };
SC.a6_sticker=(s,u)=>{ const q=ez(u); const x=lerp(s.x0,s.x1,q),y=lerp(s.y0,s.y1,q)-Math.sin(u*Math.PI)*34; gfx.globalAlpha=1; star(x,y,12*(1-q*.3),GOLD2,u*8); };
SC.a6_rain=(s,u)=>{ const n=s.n||22; for(let k=0;k<n;k++) { const d=(k*.07)%1*.5,q=cl((u-d)/.45); if(q<=0||q>=1) continue; const x=s.x0+((k*61)%100)/100*(s.x1-s.x0),y=lerp(-30,s.y1-((k*29)%40),Math.min(1,q/.7));
  const pop=q>.7?ez((q-.7)/.3):0; gfx.globalAlpha=1-pop; star(x,y,(12+(k%3)*4)*(1+pop*.6),k%3?GOLD:GOLD2,s.t*3+k); } gfx.globalAlpha=1; };

// ---------- Surprise Quiz (A5): desks slide in, papers go out face down, the timer runs out, the packet slams ----------
SC.a6_desks=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.9);
  P.list.forEach((F,k)=>{ const g=ez((ms-P.on-k*120)/300); if(g<=0) return; const w=Math.max(56,F.w*.9),x=F.x+(1-g)*160,y=Math.min(318,F.base+12);
    const dw=Math.max(70,w*1.05),dh=dw*.925,dpt=PROPART.draw('amy/student_desks',x,y+4-dh/2,{w:dw}),dty=dpt?y-dh*.55:y-36;
    if(!dpt) { for(const lx of [x-w/2+6,x+w/2-10]) { RO(lx,y-24,4,24,'#8a857c'); }
    RO(x-w/2,y-30,w,8,WOOD2); R(x-w/2+2,y-29,w-4,2,'#e0a860'); R(x-w/2+4,y-22,w-8,2,WOOD3); }
    if(ms>P.paper+k*180) { const pq=ez((ms-P.paper-k*180)/250); gfx.save(); gfx.translate(x+(1-pq)*70,dty-(1-pq)*60); gfx.rotate(-.1); RO(-13,-8,26,14,CREAM); R(-9,-4,18,1,'#9fc4f0'); R(-9,-1,12,1,'#9fc4f0'); R(-9,2,16,1,'#9fc4f0'); gfx.restore(); }
    if(ms>P.pencil+k*180&&ms<P.collect) { const ang=Math.sin(ms/120+k)*.3; gfx.save(); gfx.translate(x+w/2-16,dty-4); gfx.rotate(-.7+ang); R(-11,-2,22,5,OUT); R(-9,-1,18,3,'#ffd23a'); R(8,-1,3,3,'#f0a0a0'); gfx.restore(); } });
  gfx.globalAlpha=1; };
SC.a6_timer=(s,u)=>{ const ms=s.t*1000,P=s.plan; const g=ez((ms-P.on)/250)*(1-ez((ms-P.off)/300)); if(g<=0) return; gfx.globalAlpha=g; gfx.save(); gfx.translate(P.x,P.y); gfx.scale(g,g);
  const left=ms<P.run?300:Math.max(0,300-(ms-P.run)*.3*(ms<P.fast?1:8)),mm=Math.floor(left/60),ss=Math.floor(left%60),tt=mm+':'+String(ss).padStart(2,'0');
  if(PROPART.draw('amy/quiz_timer',0,0,{w:92})) { R(-27,-11,54,22,'#cdd5c6'); bigWord(tt,0,-8,left<=0?RED:(ms>P.fast?'#c23a28':'#1f2a24'),3); gfx.restore(); gfx.globalAlpha=1; return; }
  RO(-44,-22,88,44,'#1c2230'); R(-40,-18,80,3,'#ffffff22');
  bigWord(tt,0,-6,left<=0?RED:(ms>P.fast?'#ff8a70':CREAM),4); label('QUIZ TIMER',0,-18,'#9db1cc',1); gfx.restore(); gfx.globalAlpha=1; };
SC.a6_packet=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.drop) return; const w=P.w,h=P.h;
  const q=cl((ms-P.drop)/(P.hit-P.drop)),rest=F.top-h*.3,y=ms<P.hit?lerp(-h*1.2,rest,q*q):rest+Math.min(8,(ms-P.hit)*.03),sq=ms>P.hit?Math.max(0,1-(ms-P.hit)/220)*.3:0;
  gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(F.x,y+h/2); gfx.rotate(-.06); gfx.scale(1+sq,1-sq);
  if(!PROPART.draw('amy/answer_key_packet',0,0,{w:w+16,h:h+10})) {
  for(let k=9;k>=1;k--) RO(-w/2+k*2.5,-h/2+k*3,w,h,k%2?'#e8e2d4':'#f4efe2');
  RO(-w/2,-h/2,w,h,CREAM); RO(-12,-h/2-8,24,14,'#2b2a26'); R(-8,-h/2-14,16,8,'#9aa3a8');
  bigWord('QUIZ',0,-h/2+12,PEN,3); label('50 PAGES',0,-h/2+34,'#5a5a60',2);
  for(let k=0;k<5;k++) { const yy=-h/2+52+k*(h-62)/5; RO(-w/2+12,yy,7,7,CREAM); R(-w/2+26,yy+2,w-40,2,'#9aa3a8'); } } gfx.restore();
  if(ms>P.hit&&ms<P.hit+380) { const z=(ms-P.hit)/380; gfx.globalAlpha=1-z; for(let k=0;k<10;k++) { const a=Math.PI+k/9*Math.PI,d=w*.6+z*40; Ln(F.x+Math.cos(a)*d,F.base+Math.sin(a)*d*.35,F.x+Math.cos(a)*(d+20),F.base+Math.sin(a)*(d+20)*.35,4,CREAM); } } gfx.globalAlpha=1; };
SC.a6_pencils=(s,u)=>{ for(let k=0;k<6;k++) { const a=-Math.PI*.15-k*Math.PI*.14,d=ez(u)*70,x=s.x+Math.cos(a)*d*1.3,y=s.y+Math.sin(a)*d-Math.sin(u*Math.PI)*20+u*u*40;
  gfx.globalAlpha=1-u*u; gfx.save(); gfx.translate(x,y); gfx.rotate(u*10+k); if(!PROPART.draw('amy/pencils',0,0,{h:26})) { R(-12,-3,24,6,OUT); R(-10,-2,18,4,'#ffd23a'); R(8,-2,3,4,'#f0a0a0'); } gfx.restore(); } gfx.globalAlpha=1; };

// ---------- Negative Split (B5): a track around the team, two laps, the second one faster ----------
// A red running track paints itself in an oval round the whole party with a pace clock at the top. Lap 1 is an easy jog
// (4:12). At the halfway line she hits the watch and lap 2 is a flat-out sprint with afterimages and speed lines (3:58).
// The family joins in jogging in place on lap 2, and the boost lands as she crosses the line.
SC.a6_track=(s,u)=>{ const ms=s.t*1000,P=s.plan,g=ez(ms/400)*(1-ez((ms-P.off)/400)); if(g<=0) return; const {cx,cy,rx,ry}=P; gfx.globalAlpha=g*.9;
  gfx.save(); gfx.beginPath(); gfx.ellipse(cx,cy,rx+16,ry+8,0,0,Math.PI*2); gfx.fillStyle=TRACK; gfx.fill(); gfx.beginPath(); gfx.ellipse(cx,cy,rx-16,ry-8,0,0,Math.PI*2); gfx.fillStyle='#8fbf6a'; gfx.fill();
  for(const k of [0,1]) { gfx.strokeStyle='#fff8e8'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.ellipse(cx,cy,rx+16-k*32,ry+8-k*16,0,0,Math.PI*2); gfx.stroke(); } gfx.restore();
  // start/finish line on the near side and the halfway line on the far side
  if(!PROPART.draw('amy/track_section',cx,cy+ry+2,{w:70})) R(cx-3,cy+ry-10,6,18,'#ffffff'); R(cx-3,cy-ry-10,6,18,'#ffffff'); label('START',cx,cy+ry+12,CREAM,1); label('HALF',cx,cy-ry-22,CREAM,1);
  gfx.globalAlpha=1; };
SC.a6_clock=(s,u)=>{ const ms=s.t*1000,P=s.plan,g=ez(ms/300)*(1-ez((ms-P.off)/300)); if(g<=0) return; gfx.globalAlpha=g; gfx.save(); gfx.translate(P.x,P.y); gfx.scale(g,g);
  const fast=ms>P.fast,tot=ms<P.fast?ms/P.fast*252:cl((ms-P.fast)/(P.fastEnd-P.fast))*238,mm=Math.floor(tot/60),ss=Math.floor(tot%60);
  if(PROPART.draw('amy/pace_clock',0,10,{w:88})) { R(-34,-30,68,26,'#14161c'); label(fast?'LAP 2  FAST':'LAP 1  EASY',0,-28,fast?MINT:'#9db1cc',1); bigWord(mm+':'+String(ss).padStart(2,'0'),0,-20,fast?MINT:'#ff5a4a',3); }
  else { RO(-70,-24,140,48,'#1c2230'); R(-66,-20,132,3,'#ffffff22'); label(fast?'LAP 2':'LAP 1',-44,-14,fast?MINT:'#9db1cc',1); label(fast?'FAST':'EASY',44,-14,fast?MINT:'#9db1cc',1);
  bigWord(mm+':'+String(ss).padStart(2,'0'),0,-4,fast?MINT:CREAM,4); } gfx.restore();
  for(const [t0,txt,c] of P.splits) { const q=(ms-t0)/1300; if(q<0||q>1) continue; gfx.globalAlpha=1-q*q; bigWord(txt,P.x,P.y+40-q*10,c,2); } gfx.globalAlpha=1; };
SC.a6_speed=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(st.x==null) return; const a=ez(ms/150)*fade(u,.8);
  for(let k=0;k<16;k++) { const q=((ms/240)+k*.137)%1,y=P.y0+((k*53)%100)/100*(P.y1-P.y0),x=lerp(620,-80,q),L=40+((k*31)%5)*16; gfx.globalAlpha=a*.6; Ln(x,y,x+L,y,k%3?3:5,k%4?CREAM:MINT); }
  gfx.globalAlpha=a*.9; for(let k=0;k<4;k++) Ln(st.x+22+k*4,st.y-24-k*12,st.x+64+k*10,st.y-24-k*12,4,CREAM); gfx.globalAlpha=1; };

// ---------- Boston Qualifier (B6): the whole race, not just the tape ----------
// On top of the finish arch, tape, crowd, speed lines, bowling-pin tumbles, confetti and foil blankets: a course map
// card with the route and a dot racing along it (Heartbreak Hill flagged), the HEREFORD ST and BOYLSTON ST signs
// swinging in as the pack turns right then left, the arch clock freezing at 2:59:58, a BQ stamp, and a finisher medal
// that flies round her neck.
SC.a6_course=(s,u)=>{ const ms=s.t*1000,P=s.plan,g=ez(ms/300)*(1-ez((ms-P.off)/300)); if(g<=0) return; const x=P.x,y=P.y,w=170,h=62; gfx.globalAlpha=g; gfx.save(); gfx.translate(x,y); gfx.scale(g,g);
  if(PROPART.draw('amy/course_map_card',0,6,{h:92})) { const q0=cl((ms-P.go)/(P.off-P.go-400)),pp=[[-30,-20],[-22,-6],[-10,4],[2,-6],[10,12],[22,2]],n0=pp.length-1,sg=Math.min(n0-1,Math.floor(q0*n0)),f0=q0*n0-sg;
    EO(lerp(pp[sg][0],pp[sg+1][0],f0),lerp(pp[sg][1],pp[sg+1][1],f0)+6,4,4,GOLD2); gfx.restore(); gfx.globalAlpha=1; return; }
  RO(-w/2,-h/2,w,h,'#f6f0dc'); R(-w/2+4,-h/2+4,w-8,12,BLUE); label('THE COURSE',0,-h/2+8,CREAM,1);
  const pts=[[-72,16],[-52,4],[-30,14],[-6,0],[10,12],[28,-6],[46,10],[70,2]]; gfx.strokeStyle='#8a857c'; gfx.lineWidth=3; gfx.beginPath(); pts.forEach((p,k)=>k?gfx.lineTo(p[0],p[1]+6):gfx.moveTo(p[0],p[1]+6)); gfx.stroke();
  for(const k of [1,3,5]) { R(pts[k][0]-1,pts[k][1]+3,3,6,OUT); } label('HEARTBREAK',28,-20,'#2b2a26',1); star(28,0,5,RED); label('26.2',70,-10,'#2b2a26',1);
  const q=cl((ms-P.go)/(P.off-P.go-400)),n=pts.length-1,seg=Math.min(n-1,Math.floor(q*n)),f=q*n-seg,px=lerp(pts[seg][0],pts[seg+1][0],f),py=lerp(pts[seg][1],pts[seg+1][1],f)+6;
  EO(px,py,4,4,GOLD2); gfx.restore(); gfx.globalAlpha=1; };
SC.a6_sign=(s,u)=>{ const g=ez(u/.15),sw=Math.sin(u*10)*(1-u)*.25; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(sw); gfx.scale(g,g); RO(-2,0,4,s.h||50,'#8a857c');
  gfx.rotate(-.08); if(!PROPART.draw('amy/street_signs',0,-5,{w:84,src:s.txt[0]==='H'?[0,20,125,60]:[0,78,125,60]})) { RO(-38,-14,76,18,'#2e7a3c'); R(-36,-12,72,3,'#4faa5e'); label(s.txt,0,-9,CREAM,1); } gfx.restore(); gfx.globalAlpha=1; };
SC.a6_bq=(s,u)=>{ const g=u<.15?ez(u/.15)*1.5:lerp(1.5,1,cl((u-.15)/.15)); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.18); gfx.scale(g,g); if(!PROPART.draw('amy/bq_stamp',0,-6,{h:84})) { gfx.strokeStyle=RED; gfx.lineWidth=4; gfx.strokeRect(-46,-20,92,40); bigWord('BQ!',0,-12,RED,5); } gfx.restore(); gfx.globalAlpha=1; };
})();

// ================= Option 3 Primary kit, painted (Nov 2026) =================
// The fourteen Primary moves play Amy's approved painted ability sheets (data/amy-ab.js, f:'ab_<sheet>_<n>'; a trailing F faces right).
// What she holds (kettlebell, green pen, lunch tray, whistle, sticker sheet, light switch, test packets, bell, clipboard, almond milk latte,
// stopwatch) is painted into those frames, so nothing here draws it. Timing, spoken lines, hit frames and effects follow the old versions.
// Scenes prefix az_ (no aim warp). Effect scenes from the blocks above (av_, a5_, a6_) are reused by name.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',GREEN='#3fae4a',MINT='#8ef0a0',SKY='#9fd8ff';
ST.nw('az_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const foesOf=E2=>{ const l=foes(E2); return l.length?l:b2LiveFoes(); };
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'runR':'run';
const go=(x,me)=>x<me.x?'run':'runR';
const clap=()=>{ (sfx.clap||sfx.bonk)(); };

// ---------- Kettlebell Swing (basic) ----------
// Sheet: 1 bell between the knees, 2 and 3 swung out front, 4 hiked back, 5 the big swing (impact), 6 standing tall, bell down.
// Painted effects from amy-fx-kettlebell-swing (tools/sprite-bake/bake_amy_fx.py): dust at the hike, swoosh on the swing, burst at impact.
SC.az_kbdust=(s,u)=>{ const k=.6+.6*ez(u); gfx.globalAlpha=fade(u,.4)*.9; PROPART.draw('amy/kb_dust',s.x,s.y-14*k,{h:30*k,flip:true}); gfx.globalAlpha=1; };
SC.az_kbswoosh=(s,u)=>{ const q=ez(u/.35); gfx.globalAlpha=fade(u,.45)*.8; PROPART.draw('amy/kb_swoosh',s.x,s.y,{w:s.w*(.55+.45*q),flip:true,rot:-.15}); gfx.globalAlpha=1; };
SC.az_kbburst=(s,u)=>{ const g=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.25)); gfx.globalAlpha=fade(u,.55); const ok=PROPART.draw('amy/kb_burst',s.x,s.y,{h:s.h*g,rot:.1}); gfx.globalAlpha=1; if(!ok) SC.av_burst(s,u); };   // drawn stars only until the picture has loaded
A.kettlebell_swing=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'ab_kettle_1'},{t:1100,f:'ab_kettle_4'},{t:1350,f:'ab_kettle_3'},{t:1500,f:'ab_kettle_2',dx:-4},{t:1650,f:'ab_kettle_5',dx:u=>-ez(u)*10},
    {t:2100,f:'ab_kettle_6'},{t:2600,f:back(p.x,me)},{t:3300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over carrying a very big kettlebell.'); say(m.id,'kettlebell_swing'); sfx.run&&sfx.run(); }],
    [800,()=>{ sfx.thud(); setMessage('She hikes it back between her knees. Flat back.'); scene('az_kbdust',.7,{x:p.x-6,y:p.y}); }],
    [1350,()=>{ sfx.whoosh(); scene('az_kbswoosh',.45,{x:p.x-50,y:p.y-AH()*.52,w:78}); }],
    ['hf',1650],
    [1650,()=>{ sfx.bonk(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('av_big',1,{x:F.x,y:F.top-74,txt:'WHUMP!',c:GOLD,sc:4}); scene('av_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:42}); scene('az_kbburst',.6,{x:F.x+F.w*.3,y:F.mid,h:76,n:8,r:44}); }],
    [2100,()=>{ scene('av_text',1.1,{st,txt:'HIPS NOT BACK',c:CREAM}); }],
    [3400,'end',res(E2)+'Perfect form. She checked.']]); };

// ==== GROUP A (pep_talk, red_pen, hot_lunch_tray, goldstar_recess, inside_voices, pop_quiz, detention_ult) ====

// Party members bounce or clap along (frames by name); used by PEP TALK.
const dance=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; let fr=null; if(r.frame==='run'||r.frame==='runR') { const a=r.frame==='run'?c.sp.run:c.sp.runFlip; fr=a?a[Math.floor(c.t*12)%2]:c.sp.idle; } else if(r.frame) fr=c.sp[r.frame]||c.sp.idle;
  const [wx,wy]=ST.unwarp(c.origX+(r.dx||0),c.origBase+(r.dy||0)); return {cx:wx,base:wy,rot:r.rot||0,frame:fr}; }}; };
const VPB='#86a9ff',BRASS2='#fff0a0';

// ---------- PEP TALK (signature) ----------
// Sheet: 1 hands together (clap), 2 fist up shouting, 3 arms wide, 4 pointing, 5 two thumbs up, 6 hands cupped round her mouth (the call).
A.pepShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),others=party.filter(p=>p!==m),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const py=Math.min(316,Math.round(Math.max(...U.map(q=>q.base)))+16),px=Math.max(46,Math.round(Math.min(...U.map(q=>q.x-q.w*.5))-28));
  const K=[{t:0,x:'home',y:'home',f:go(px,me),hop:3,hn:3},{t:600,x:px+10,y:py,f:'ab_pep_1',ease:'out'},{t:700,x:px,y:py,f:'ab_pep_6'},{t:1250,f:'ab_pep_2',hop:7,hn:2},{t:1700,f:'ab_pep_1'}];
  let t=1800; const visits=[];
  for(const o of others) { const q=ST.unit(o); visits.push([t,o,q]); K.push({t,f:'ab_pep_4',hop:5,dx:(u,tt)=>-ez(u)*6}); t+=420; }
  const squat=t,applyAt=t+360; K.push({t:squat,f:'ab_pep_1',dy:u=>ez(u)*6},{t:applyAt,f:'ab_pep_3',hop:40,ease:'out'},{t:applyAt+420,f:'ab_pep_1',hop:3,hn:3},{t:applyAt+1050,f:'ab_pep_5',hop:6},{t:applyAt+1500,f:back(px,me),hop:3,hn:3},{t:applyAt+2100,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={st,claps:[applyAt+420,applyAt+640,applyAt+860]};
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints out in front of the whole team.'); say(m.id,'pep_talk'); }],
    [600,()=>{ sfx.thud(); scene('a6_dust',.5,{x:px+14,y:py,r:30,n:8}); }],
    [700,()=>{ sfx.select(); scene('a6_big',.9,{x:Math.max(90,px-60),y:py-AH()-30,txt:'HEY, TEAM!',c:CREAM,sc:3}); setMessage('Hands round her mouth. Everybody looks up.'); }],
    [1250,()=>{ sfx.select(); scene('a6_text',.9,{st,txt:'HUDDLE UP!',c:GOLD,sc:2}); }],
    ...visits.map(([ms,o,q])=>[ms,()=>{ scene('a6_callout',(applyAt-ms+900)/1000,{x:q.x,y:q.top-18,txt:o.name.toUpperCase()+'!'}); battle.fx[o.idx].hop=.35; sfx.select(); }]),
    [1800,'She points at every one of them. By name. Loudly.'],
    [squat,()=>{ setMessage('She crouches...'); }],
    ['hf',applyAt],
    [applyAt,()=>{ E2.apply(); sfx.levelUp(); (sfx.jumpWhistle||sfx.whoosh)(); scene('a6_flash',.25,{a:.35,c:GOLD}); scene('a6_big',1.2,{x:px,y:Math.max(50,py-AH()-70),txt:'LET\'S GO!!',c:GOLD,sc:4,rot:-.06}); for(const o of others) { const q=ST.unit(o); scene('a6_glow',1,{x:q.x,y:q.mid,c:GOLD}); scene('a6_burst',.7,{x:q.x,y:q.top,n:6,r:30}); } setMessage('...and springs straight up. LET\'S GO!'); }],
    [applyAt+420,()=>{ clap(); scene('a6_claps',1.4,{plan}); setMessage('Clap. Clap. Clap. The whole party claps back.'); for(const o of others) dance(o,.9,(q,tt)=>({frame:Math.floor(tt*8)%2?'clap':'idle',dy:-Math.abs(Math.sin(tt*10))*4})); }],
    [applyAt+640,()=>clap()],[applyAt+860,()=>clap()],
    [applyAt+1050,()=>{ scene('a6_text',1,{st,txt:'YOU GOT THIS',c:GOLD,sc:2}); }],
    [applyAt+2200,'end','Amy believes it before everybody else does. Next attack or heal +50%.']]); };
A.pep_talk=E2=>A.pep(E2);   // the Option 3 signature key; RM.amy.pep (engine/battle2-moves.js) hands Option 3 over to pepShow

// ---------- Green Pen (A1) ----------
// Sheet (3 x 3): 1 pen at her chest, 2 cap off, 3 the big circle swing, 4 pen low, 5 pen out front, 6 pen up by her face, 7 to 9 pointing.
// A quiz paper slaps onto the monster; she draws three green checks and a big green circle round what went right.
SC.az_quiz=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.paper) return;
  const w=P.w,h=P.h,x=F.x,y=F.mid; const g=ez((ms-P.paper)/220),out=ez((ms-P.peel)/400);
  gfx.globalAlpha=1-out; gfx.save(); gfx.translate(x,y+out*30); gfx.rotate(-.06+out*.4); gfx.scale(lerp(1.4,1,g),lerp(1.4,1,g));
  R(-w/2-2,-h/2-2,w+4,h+4,OUT); R(-w/2,-h/2,w,h,CREAM); for(let k=0;k<6;k++) R(-w/2+6,-h/2+18+k*(h-24)/6,w-12,1,'#9fc4f0'); R(-w/2+10,-h/2,2,h,'#f0a0a0'); label('QUIZ',-w/2+20,-h/2+5,'#2b2a26',1);   // plain paper (the painted quiz prop has a red F on it)
  P.strokes.forEach((t0,k)=>{ const q=cl((ms-t0)/200); if(q<=0) return; const cx=-w*.22+k*w*.22,cy=-h*.18+k*h*.16,a=[cx-8,cy],b=[cx-2,cy+7],c=[cx+11,cy-9];
    const q1=cl(q*2),q2=cl(q*2-1); Ln(a[0],a[1],lerp(a[0],b[0],q1),lerp(a[1],b[1],q1),5,GREEN); if(q2>0) Ln(b[0],b[1],lerp(b[0],c[0],q2),lerp(b[1],c[1],q2),5,GREEN); });
  for(const c0 of [P.circle,P.circle+350]) if(ms>c0) { const q=ez((ms-c0)/300); gfx.strokeStyle=GREEN; gfx.lineWidth=5; gfx.beginPath(); gfx.ellipse(0,c0>P.circle?3:0,w*.46+(c0>P.circle?5:0),h*.46+(c0>P.circle?4:0),-.1,-1.2,-1.2+q*Math.PI*2.1); gfx.stroke(); }
  gfx.restore(); gfx.globalAlpha=1; };
A.red_pen=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,54),me=ST.unit(m);
  const plan={paper:900,strokes:[1350,1650,1950],circle:2250,peel:3700,F,w:Math.round(cl(F.w*.95,64,110)),h:Math.round(cl(F.h*.9,72,120))};
  const stroke=(u,tt)=>Math.sin(tt*18)*1.5;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'ab_pen_7',dx:-6},{t:1100,f:'ab_pen_2'},{t:1350,f:'ab_pen_5',dx:stroke},{t:1650,f:'ab_pen_4',dx:stroke},{t:1950,f:'ab_pen_5',dx:stroke},{t:2250,f:'ab_pen_3'},
    {t:2900,f:'ab_pen_6'},{t:3100,f:'ab_pen_1'},{t:3500,f:back(p.x,me)},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over with a quiz and a very large green marker.'); say(m.id,'red_pen'); scene('az_quiz',4.0,{plan}); }],
    [900,()=>{ (sfx.splat||sfx.thud)(); setMessage('She slaps the quiz right onto it.'); }],
    [1100,()=>{ sfx.click(); setMessage('Cap off.'); }],
    ...plan.strokes.map(t=>[t,()=>{ sfx.select(); }]),
    [1350,'One check. Two. Three. She presses hard.'],
    ['hf',2250],
    [2250,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('a6_ring',.6,{x:F.x,y:F.mid,r:50,c:MINT}); scene('a6_big',1.4,{x:F.x,y:F.top-74,txt:'GOOD!',c:MINT,sc:5}); setMessage('A giant green circle round what went right. Twice.'); }],
    [2600,()=>{ sfx.select(); }],
    [2900,()=>{ sfx.click(); scene('a6_text',1.4,{x:F.x,y:F.top-18,txt:'NOW THE REST',c:MINT}); setMessage('Cap on. Now the rest.'); }],
    [4300,'end',res(E2)+'Now it knows exactly what to work on.']]); };

// ---------- Hot Lunch Tray (A2) ----------
// Sheet: 1 tray held, steam up, 2 walking with the tray, 3 leaning in to offer it, 4 spoon in the soup, 5 spoon up, 6 tray held close, smiling.
A.hot_lunch_tray=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,46),self=t===m,me=ST.unit(m);
  const tx=self?me.x-30:Math.round(H.x-4),ty=Math.min(318,(self?me.base:H.base)+22);
  const walk=sp.x<me.x?'ab_tray_2':'ab_tray_2F',walkBack=sp.x<me.x?'ab_tray_2F':'ab_tray_2';
  const K=self?[{t:0,x:'home',y:'home',f:'ab_tray_1',dy:u=>Math.sin(u*Math.PI*4)*1.5},{t:1200,f:'ab_tray_6'},{t:1600,f:'ab_tray_3',dx:-6},{t:2000,f:'ab_tray_4'},{t:2300,f:'ab_tray_5'},{t:2600,f:'ab_tray_6',hop:3},{t:3100,f:'ab_tray_1'},{t:3500,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:walk,dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*2},{t:1300,x:sp.x,y:sp.y,f:'ab_tray_1'},{t:1600,f:'ab_tray_3',dx:u=>-ez(u)*8},{t:2000,f:'ab_tray_4',dx:-8},{t:2300,f:'ab_tray_5',dx:-8},{t:2600,f:'ab_tray_6',hop:3},{t:3100,f:'ab_tray_1'},{t:3500,f:walkBack,dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*2},{t:4200,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),give=1600,hit=give+450,end=self?3600:4300;
  const tp={on:1300,x:tx,y:ty};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy carries a full hot lunch tray. For herself. Teachers eat too.':'Amy carries a full hot lunch tray over to '+t.name+'. Both hands. Careful.'); say(m.id,'hot_lunch_tray'); scene('a6_table',(end-100)/1000,{plan:tp}); }],
    [1300,()=>{ sfx.thud(); setMessage('A lunch table pops up. She holds the tray out.'); }],
    [give,()=>{ sfx.select(); setMessage('Tomato soup. Grilled cheese triangles. Green beans. An apple, a cookie and almond milk.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('a6_glow',1,{x:H.x,y:H.mid,c:'#ffb45a'}); scene('a6_melt',1.2,{x:H.x,top:H.top,w:H.w,h:H.h}); scene('a6_big',1.2,{x:H.x,y:H.top-60,txt:'HOT LUNCH!',c:'#ffb45a',sc:3}); hopOf(t!==m?t:null); }],
    [2600,'Dip the sandwich in the soup. That is the correct order.'],
    [end,'end',kindLine(t,'Warm all the way through. Soup first, then recess.')]]); };

// ---------- Gold-Star Recess (A3) ----------
// Sheet: 1 whistle at her lips, 2 arm up waving, 3 arms wide, 4 sticker sheet at her chest, 5 one star held out, 6 sticker sheet up high.
A.goldstar_recess=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const sx=foe?front(U[0],40).x:Math.max(40,Math.min(...U.map(q=>q.x-q.w*.5))-24),sy=foe?front(U[0],40).y:Math.min(316,Math.round(Math.max(...U.map(q=>q.base)))+12);
  const cx=Math.max(110,sx-104),cw=206,cy=Math.max(60,sy-AH()*.55),rows=who.map((q,k)=>({name:q.name.toUpperCase().slice(0,6),at:1700+k*380,u:q}));
  const K=[{t:0,x:'home',y:'home',f:go(sx,me)},{t:700,x:sx,y:sy,f:'ab_recess_2'},{t:1000,f:'ab_recess_2',dy:u=>ez(u)*8},{t:1300,f:'ab_recess_4'}];
  rows.forEach(r=>{ K.push({t:r.at-250,f:'ab_recess_6',hop:3},{t:r.at,f:'ab_recess_5',dx:-6}); });
  const bellAt=rows[rows.length-1].at+500,up=bellAt+700;
  K.push({t:bellAt-200,f:'ab_recess_4'},{t:bellAt,f:'ab_recess_1',dx:(u,tt)=>Math.sin(tt*30)*1},{t:up,f:'ab_recess_3',hop:14},{t:up+600,f:'ab_recess_2',hop:5},{t:up+1200,f:'ab_recess_4'},{t:up+1500,f:back(sx,me)},{t:up+2200,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),x0=Math.max(10,Math.min(...U.map(q=>q.x-q.w*.6))),x1=Math.min(566,Math.max(...U.map(q=>q.x+q.w*.6))),y1=Math.max(...U.map(q=>q.base));
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over and pulls down the gold star chart.'); say(m.id,'goldstar_recess'); scene('a6_chart',(up+600)/1000,{plan:{on:1000,up,x:cx,w:cw,y:cy,rows}}); }],
    [1000,()=>{ sfx.whoosh(); setMessage('One row each. Three stars each. One empty box each.'); }],
    ...rows.map(r=>[r.at,()=>{ const h=ST.hand(); scene('a6_sticker',.3,{x0:h.x,y0:h.y,x1:PROPART.ready('amy/sticker_chart')?cx+8:cx-cw/2+92+78,y1:cy-(rows.length*28+34)+30+rows.indexOf(r)*28+12}); sfx.select(); }]),
    ...rows.map(r=>[r.at+300,()=>{ sfx.ding(); hopOf(r.u!==m?r.u:null); setMessage('Gold star: '+r.u.name+'.'); }]),
    [bellAt,()=>{ sfx.whistle(); const h=head(st,6); scene('a6_ring',.6,{x:h.x-14,y:h.y+8,r:30,c:GOLD}); setMessage('Full chart. She blows the recess whistle.'); }],
    ['hf',up],
    [up,()=>{ E2.apply(); sfx.levelUp(); scene('a6_rain',2.2,{x0,x1,y1,n:24}); scene('a6_big',1.6,{x:(x0+x1)/2,y:Math.min(...U.map(q=>q.top))-40,txt:'RECESS!',c:GOLD,sc:4});
      for(const q of who) { const P=ST.unit(q); scene('a6_glow',1.1,{x:P.x,y:P.mid,c:GOLD}); hopOf(q!==m?q:null); } }],
    [up+600,()=>{ sfx.ding(); setMessage(foe?'Gold stars everywhere. Even '+foe.name+' gets a few.':'Gold stars for everybody. Rest counts as good work.'); for(const q of who) { const P=ST.unit(q); scene('a6_burst',.8,{x:P.x,y:P.top-6,n:6,r:30,c:GOLD2}); } }],
    [up+2300,'end',foe?kindLine(foe):'The assignment is to stop for a moment.']]); };

// ---------- Inside Voices! (A4) ----------
// Sheet: 1 hand on the wall switch, 2 the switch flipped, 3 hand up (quiet signal), 4 the teacher clap, 5 finger to her lips, 6 hands folded, waiting.
// The switch is painted in her frames; this scene only darkens the room on each flick and shows the CLICK words.
SC.az_lights=(s,u)=>{ const ms=s.t*1000,P=s.plan,off=P.flicks.some(([a,b])=>ms>=a&&ms<b);
  if(off) { const k=P.flicks.find(([a,b])=>ms>=a&&ms<b),d=ms-k[0]; gfx.globalAlpha=d<90?(Math.floor(d/30)%2?.5:.9):.9; R(0,0,576,324,'#04050b'); }
  else for(const [a,b] of P.flicks) { const d=ms-b; if(d>=0&&d<220) { gfx.globalAlpha=(1-d/220)*.5; R(0,0,576,324,'#fffbe8'); } }
  gfx.globalAlpha=1; if(ms<P.flicks[P.flicks.length-1][1]+300&&ms>P.flicks[0][0]-100) bigWord(off?'CLICK. OFF.':'CLICK. ON.',Math.min(520,P.sx+10),Math.max(20,P.sy-70),off?'#9aa3a8':GOLD,3); gfx.globalAlpha=1; };
A.inside_voices=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,64),me=ST.unit(m);
  const plan={flicks:[[1200,1500],[1750,2050]],sx:Math.max(60,p.x-36),sy:Math.max(70,p.y-AH()*.9),lx:Math.round(Gp.x),ly:Math.max(30,Math.round(Gp.top-62))};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'ab_voices_6'},{t:1050,f:'ab_voices_1'},{t:1200,f:'ab_voices_2'},{t:1500,f:'ab_voices_1'},{t:1750,f:'ab_voices_2'},{t:2050,f:'ab_voices_1'},{t:2250,f:'ab_voices_3'},
    {t:2400,f:(u,tt)=>Math.floor(tt*8)%2?'ab_voices_4':'ab_voices_6',hop:2,hn:4},{t:3300,f:'ab_voices_5'},{t:4100,f:'ab_voices_6'},{t:4500,f:back(p.x,me)},{t:5200,x:'home',y:'home',f:'idle'}]);
  plan.st=st; const claps=[2400,2650,2900,3050,3200];
  ST.play(E2,[
    [0,()=>{ setMessage('Amy marches over to the wall switch.'); say(m.id,'inside_voices'); scene('a6_lampB',4.6,{plan,back:true}); scene('az_lights',4.6,{plan}); }],
    [1050,'She reaches up.'],
    ...plan.flicks.map(([a,b])=>[a,()=>{ sfx.click(); setMessage('Lights off.'); }]),
    ...plan.flicks.map(([a,b])=>[b,()=>{ sfx.click(); setMessage('Lights on.'); }]),
    [2400,()=>{ setMessage('The teacher clap. Clap, clap, clap-clap-clap.'); }],
    ...claps.map(c=>[c,()=>{ clap(); const h=head(st,8); scene('a6_text',.5,{x:h.x-20+(c%2)*40,y:h.y-10,txt:'CLAP',c:GOLD,sc:2}); }]),
    ['hf',3300],
    [3300,()=>{ E2.apply(); sfx.stun(); for(const f of list) ST.jolt(f,.2); scene('a6_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'INSIDE VOICES!',c:GOLD,sc:3}); scene('a6_hush',1.6,{list:list.map(f=>ST.foe(f))}); scene('a6_zz',1.4,{x:head(st).x-24,y:head(st).y-16}); }],
    [3700,'Finger to her lips. Every one of them stops. She waits anyway.'],
    [5300,'end','The room suddenly remembers its manners.']]); };

// ---------- Surprise Quiz (A5) ----------
// Sheet: 1 packets at her chest, 2 one packet handed out, 3 a packet held up, 4 lunging, packet out (the slam), 5 pencil up, 6 arms crossed with the packet.
A.pop_quiz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),all=waveFoes().length?waveFoes():[f],list=[f].concat(all.filter(x=>x!==f)).slice(0,4).map(x=>ST.foe(x)),p=front(F,48),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const paper=1300,pencil=1900,run=2300,fast=2800,drop=3250,hit=3700;
  const plan={on:700,paper,pencil,collect:hit,list},tp={on:run-200,run,fast,off:hit+800,x:Math.min(520,p.x+40),y:48},pk={drop,hit,F,w:Math.round(cl(F.w*1.4,100,160)),h:Math.round(cl(F.w*1.7,116,180))};
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'ab_quiz_3',hop:10},{t:1100,f:'ab_quiz_1'}];
  list.forEach((F2,k)=>K.push({t:paper+k*180,f:'ab_quiz_2',dx:-5},{t:paper+k*180+120,f:'ab_quiz_1'}));
  K.push({t:run,f:'ab_quiz_6'},{t:fast,f:'ab_quiz_5',dx:(u,tt)=>Math.sin(tt*14)*1.5},{t:drop,f:'ab_quiz_3',hop:14},{t:hit,f:'ab_quiz_4',dx:-8},{t:hit+500,f:'ab_quiz_6'},{t:hit+1200,f:'ab_quiz_5'},{t:hit+1600,f:back(p.x,me)},{t:hit+2300,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints over. Clear your desks.'); say(m.id,'pop_quiz'); scene('a6_desks',(hit+1200)/1000,{plan}); scene('a6_timer',(hit+900)/1000,{plan:tp}); scene('a6_packet',(hit+1500)/1000,{plan:pk}); }],
    [700,()=>{ scene('a6_big',1.0,{st,txt:'SURPRISE QUIZ!',c:GOLD,sc:2}); (sfx.jumpWhistle||sfx.whoosh)(); setMessage('Desks slide in under every one of them.'); sfx.whoosh(); }],
    ...list.map((F2,k)=>[paper+k*180,()=>{ sfx.select(); }]),
    [paper,'Papers face down. No peeking.'],
    [pencil,()=>{ sfx.ding(); setMessage('Pencils up. You may begin.'); }],
    [run,()=>{ sfx.click(); setMessage('Five minutes on the clock.'); }],
    [fast,()=>{ sfx.whoosh(); setMessage('Which somehow go by very, very fast.'); }],
    [drop,()=>{ (sfx.slideWhistle||sfx.whoosh)(); setMessage('TIME. The answer key drops out of the sky. All fifty pages.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); sfx.thud(); sfx.bonk(); ST.jolt(f,.7); landHit(100); scene('a6_flash',.18,{a:.45}); scene('a6_dust',.7,{x:F.x,y:F.base,r:70,n:14}); scene('a6_pencils',.9,{x:F.x,y:F.top}); }],
    [hit+250,()=>{ sfx.ding(); scene('a6_big',1.5,{x:F.x,y:Math.max(40,F.top-pk.h*.3-60),txt:'PENCILS DOWN!',c:CREAM,sc:3}); setMessage('PENCILS DOWN.'); }],
    [hit+1200,()=>{ if(girls.length) { for(const g of girls) { const q=ST.unit(g); scene('a6_hearts',1,{x:q.x,y:q.top}); battle.fx[g.idx].hop=.3; } sfx.select(); setMessage(girls.map(g=>g.name).join(' and ')+' already know every answer.'); } else setMessage('It didn\'t study.'); }],
    [hit+2400,'end',res(E2)+'Pencils down.']]); };

// ---------- Nobody Leaves (A6 ultimate) ----------
// Sheet (3 x 3): 1 hand bell, 2 bell up ringing, 3 pointing, 4 crouched wide (blocking the way), 5 writing on her clipboard, 6 arms crossed,
// 7 arms out (nobody leaves), 8 papers hugged to her chest, 9 pointing lunge. Board, clock, podium, chalk and blast are the a5_ scenes (no pointer stick now).
SC.az_taps=(s,u)=>{ const ms=s.t*1000; for(const t0 of s.taps) { const q=(ms-t0)/420; if(q<0||q>1) continue; gfx.globalAlpha=1-q; bigWord('TAP',s.x,s.y-q*14,CREAM,2); } gfx.globalAlpha=1; };
A.detention_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m);
  let x0=Math.max(10,Math.round(Gp.x0-24)),x1=Math.min(340,Math.round(Gp.x1+24)); if(x1-x0<224) { const c=(x0+x1)/2; x0=Math.max(10,Math.round(c-112)); x1=Math.min(340,x0+224); }
  const lsc=x1-x0>=214?2:1,B={x0,x1,y0:24+8,y1:Math.max(24+110,Math.round(Gp.base-26)),lx:x0+8};
  const spot={x:Math.min(548,Math.round(Gp.x1+78)),y:Math.min(310,Math.round(Gp.base+8))};
  const P={t0:0,B,lsc,drop:250,podium:650,tap0:1100,taps:[1100,1300,1500],clockPoint:1700,spin0:1950,spin1:2400,write0:2450,writeDur:900,see:3650,pointEnd:4000,boom:4000,apple:4500,
    clock:{x:Math.min(x1+26,372),y:24+30},px:spot.x-30,py:spot.y};
  const bell={x:Math.min(P.clock.x+40,420),y:24+28};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:spot.x<me.x?'run':'runR'},{t:650,x:spot.x,y:spot.y,f:'ab_detention_2'},{t:1000,f:'ab_detention_9'},{t:1700,f:'ab_detention_3',dx:(u,tt)=>Math.sin(tt*10)*1.5},
    {t:2450,f:'ab_detention_5'},{t:3650,f:'ab_detention_6'},{t:4000,f:'ab_detention_7',hop:6},{t:4500,f:'ab_detention_4'},{t:5100,f:'ab_detention_8'},{t:5500,f:spot.x<me.x?'runR':'run'},{t:6200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('a5_bars',6.6,{}); scene('a5_bell',1.4,{x:bell.x,y:bell.y}); sfx.schoolBell(); b7Later(()=>sfx.schoolBell(),800); say(m.id,'detention_ult');
      scene('a5_big',1,{x:bell.x,y:bell.y+48,txt:'RRRRING!',c:BRASS2,sc:3}); setMessage('The last bell of the day rings. Nobody is going home.'); }],
    [250,()=>{ scene('a5_board',4.0,{plan:P,t0:250,back:true}); scene('a5_clock',3.85,{plan:P,t0:250}); scene('a5_lines',3.85,{plan:P,t0:250}); }],
    [470,()=>{ (sfx.clang||sfx.thud)(); sfx.thud(); for(const f of list) ST.jolt(f,.3); setMessage('A chalkboard slams down behind every one of them.'); }],
    [650,()=>{ scene('a5_podium',5.0,{plan:P,t0:650}); sfx.thud(); }],
    [1100,()=>{ (sfx.click||sfx.select)(); scene('az_taps',.9,{taps:[0,200,400],x:(B.x0+B.x1)/2,y:B.y0+10}); setMessage('Amy points at the board. Three taps. Eyes up here.'); }],[1300,()=>(sfx.click||sfx.select)()],[1500,()=>(sfx.click||sfx.select)()],
    [1700,()=>{ setMessage('The clock is about to hit 3:00. Freedom.'); (sfx.ting||sfx.ding)(); }],
    [1950,()=>{ sfx.whoosh(); setMessage('She winds it back an hour.'); }],
    [2400,()=>{ scene('a5_big',1.1,{x:P.clock.x,y:P.clock.y+70,txt:'ONE MORE HOUR',c:SKY,sc:2}); sfx.stun(); }],
    [2450,()=>{ setMessage('Giant chalk writes their lines for them.'); for(let k=0;k<8;k++) b7Later(()=>sfx.chalk(),k*130); }],
    [3650,()=>{ scene('a5_big',.9,{st,txt:'SEE ME.',c:'#ff6a60',sc:3}); sfx.select(); }],
    ['hf',4000],
    [4000,()=>{ sfx.thud(); sfx.bonk(); (sfx.clang||sfx.thud)(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('a5_flash',.35,{a:.55}); scene('a5_blast',1.2,{B});
      scene('a5_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'NOBODY LEAVES!',c:GOLD,sc:3}); setMessage('The whole board blows apart. Erasers. Chalk dust. Report cards.'); }],
    [4500,()=>{ E2.apply(); sfx.ding(); sfx.levelUp(); scene('a5_seeme',1.7,{list:list.map(f=>ST.foe(f))});
      scene('a5_vp',1.2,{x:P.px-12,y:P.py-70,to:party.map(p=>ST.unit(p))}); for(const p of party) { const q=ST.unit(p); scene('a5_glow',1,{x:q.x,y:q.mid,c:VPB}); } }],
    [5100,()=>{ scene('a5_big',1.1,{st,txt:'NOBODY LEAVES.',c:CREAM,sc:2}); setMessage('Every one of them has to see her after class.'); }],
    [6400,'end',()=>res(E2)+'Nobody leaves. She brought snacks for the long haul.']]); };

// ==== END GROUP A ====

// ==== GROUP B (burpee_blitz, hill_repeats, oat_milk_please, false_start, negative_split, marathon_ult) ====
// Group B helpers. cycB: two painted frames alternating (a running stride); danceB: moves a party member other than the actor on its own path.
const YB='#ffd23a',BARB=24;   // letterbox bar height and finish-line yellow, as in the ultimate block above
const cycB=(a,b,r=10)=>(u,t)=>Math.floor(t*r)%2?b:a;
const danceB=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; let fr=null; if(r.frame==='run'||r.frame==='runR') { const a=r.frame==='run'?c.sp.run:c.sp.runFlip; fr=a?a[Math.floor(c.t*12)%2]:c.sp.idle; } else if(r.frame) fr=c.sp[r.frame]||c.sp.idle;
  const [wx,wy]=ST.unwarp(c.origX+(r.dx||0),c.origBase+(r.dy||0)); return {cx:wx,base:wy,rot:r.rot||0,frame:fr}; }}; };

// ---------- Burpee Blitz (B1) ----------
// Sheet: 1 hands on hips, 2 squat with palms down, 3 plank, 4 feet jumped in, 5 jump with arms up, 6 landing punch. Four reps; the fourth jump lands on it.
A.burpee_blitz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,56),k=front(F,12),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'ab_burpee_1'}]; let t=900; const marks=[],beats=[],PX=p.x,PY=p.y;
  const rep=(t0,last)=>{ K.push({t:t0,f:'ab_burpee_2',x:PX,y:PY},{t:t0+280,f:'ab_burpee_3',x:PX+22,y:PY,ease:'out'},{t:t0+440,f:'ab_burpee_3',x:PX+22,y:PY,dy:u=>Math.sin(u*Math.PI)*6},{t:t0+580,f:'ab_burpee_3',x:PX+22,y:PY},{t:t0+720,f:'ab_burpee_4',x:PX,y:PY,ease:'out'});
    if(!last) K.push({t:t0+860,f:'ab_burpee_5',x:PX,y:PY,hop:34}); beats.push([t0,'SQUAT'],[t0+150,'HANDS'],[t0+280,'PLANK'],[t0+440,'PUSH'],[t0+580,'UP'],[t0+720,'IN'],[t0+860,last?'LAST ONE':'JUMP!']); };
  for(let i=0;i<3;i++) { rep(t,false); marks.push([t+880,String(i+1)]); t+=1200; }
  rep(t,true); const leap=t+860; marks.push([leap+140,'4']);
  K.push({t:leap,f:'ab_burpee_5',hop:120,x:k.x,y:k.y,ease:'lin',ns:1},{t:leap+330,x:k.x,y:k.y,f:'ab_burpee_6',hop:8},{t:leap+950,f:'ab_burpee_1'},{t:leap+1250,f:back(k.x,me)},{t:leap+1950,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=leap+330,bx=Math.min(522,Math.max(54,p.x+100)),by=44;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy drops right in front of it. Burpees. Real ones.'); say(m.id,'burpee_blitz'); scene('a6_count',(leap+1400)/1000,{plan:{marks,show:700,x:bx,y:by}}); scene('a6_beat',(leap+300)/1000,{plan:{beats,x:Math.max(60,Math.min(500,p.x-40)),y:Math.max(44,p.y-AH()-34)}}); }],
    ...beats.filter(b=>b[1]==='PLANK').map(([ms])=>[ms,()=>{ sfx.thud(); scene('a6_dust',.4,{x:p.x-20,y:p.y,r:26,n:6}); }]),
    ...beats.filter(b=>b[1]==='PUSH').map(([ms])=>[ms,()=>sfx.select()]),
    ...marks.slice(0,3).map(([ms])=>[ms,()=>{ (sfx.jumpWhistle||sfx.whoosh)(); scene('a6_dust',.4,{x:p.x,y:p.y,r:22,n:6}); }]),
    [1500,'Down, feet back, push-up, feet in, JUMP. She counts out loud.'],
    [leap-740,()=>{ setMessage('Number four doesn\'t come back down where it started.'); }],
    [leap,()=>{ (sfx.jumpWhistle||sfx.whoosh)(); sfx.whoosh(); scene('a6_leap',.5,{st}); scene('a6_dust',.6,{x:p.x,y:p.y,r:34,n:10}); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); sfx.ding(); ST.jolt(f,.65); landHit(100); scene('a6_big',1.1,{x:F.x,y:F.top-74,txt:'BURPEE!',c:GOLD,sc:5}); scene('a6_burst',.7,{x:F.x+F.w*.3,y:F.mid,n:10,r:56}); }],
    [leap+2000,'end',res(E2)+'She\'s not even out of breath. She says.']]); };

// ---------- Hill Repeats (B2) ----------
// Sheet: 1 ready, 2 and 5 sprinting strides, 3 fist up at the top, 4 crouched to go, 6 hands on knees, winking. Up the hill faces left; back down is the same stride mirrored.
A.hill_repeats=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],nbs=hitList.filter(x=>x!==f);
  const b=Math.min(316,F.base+4),xa=Math.round(F.x+F.w*.5+6),xb=Math.min(552,xa+160),xm=Math.round((xa+xb)/2),Hh=80;
  const UP=cycB('ab_hills_2','ab_hills_5'),DN=cycB('ab_hills_2F','ab_hills_5F');
  const K=[{t:0,x:'home',y:'home',f:go(xb,me)},{t:700,x:xb,y:b,f:'ab_hills_4'}]; let t=900; const reps=[]; const legs=[[480,420],[400,340],[320,280]];
  legs.forEach(([up,dn],i)=>{ K.push({t,f:UP,ease:'lin'}); t+=up; K.push({t,x:xm,y:b-Hh,f:'ab_hills_3'}); reps.push([t,'REP '+(i+1)]); t+=90; K.push({t,f:DN,ease:'lin'}); t+=dn; K.push({t,x:xb,y:b}); });
  K.push({t,f:UP,ease:'lin'}); t+=260; K.push({t,x:xm,y:b-Hh,f:'ab_hills_2',ease:'in'}); t+=260; const hit=t; K.push({t,x:xa+10,y:b,f:'ab_hills_5'},{t:t+400,f:'ab_hills_6'},{t:t+900,f:back(xa,me)},{t:t+1700,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={rise:300,sink:hit+500,xa,xb,xm,b,H:Hh,reps};
  ST.play(E2,[
    [0,()=>{ setMessage('The ground heaves up into a real, steep hill.'); say(m.id,'hill_repeats'); scene('av_hill',(hit+1000)/1000,{plan}); sfx.thud(); }],
    [700,()=>{ setMessage('Amy sprints up it. And down. And up.'); sfx.run&&sfx.run(); }],
    ...reps.map(([ms])=>[ms,()=>sfx.select()]),
    [hit-520,()=>{ setMessage('Over the top this time. Straight down onto them.'); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.55); for(const n of nbs) ST.jolt(n,.35); landHit(100); scene('av_dust',.6,{x:F.x,y:F.base,r:60,n:12}); scene('av_big',1.2,{x:F.x,y:F.top-74,txt:'HILL REPEATS!',c:GOLD,sc:3}); }],
    [hit+1800,'end',res(E2)+'Three repeats and a bonus one. Of course.']]); };

// ---------- Almond Milk, Please (B3) ----------
// Sheet: 1 hand up (no thanks), 2 both hands up (definitely not), 3 latte at her side, 4 latte held out, 5 a sip, 6 latte up with a wink,
// 7 kneeling, fist ready (lining up the kick), 8 arms wide (the kick's balance), 9 pointing low. The latte is painted; nothing draws it.
// With monsters on the field she first boots the cow's milk carton at them (mk_carton, mk_splash, mk_puddle: separate objects).
A.oat_milk_please=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=(t===m?spotFor(m,t,30):{x:H.x-12,y:Math.min(316,H.base+30)}),self=t===m,me=ST.unit(m);
  const kick=t.side!=='foe'&&b2LiveFoes().length>0,lf=b2LiveFoes().sort((a,b)=>ST.unit(b).x-ST.unit(a).x),live=lf.map(f=>ST.unit(f));
  const o=kick?4200:0,sx=self?me.x:sp.x;
  const lt=self?{show:100,give:400,apply:700,wink:800,rest:1400,end:1500}:{show:800,give:1050,apply:1300,wink:1400,back:1800,home:2400,end:2500},end=o+lt.end;
  const K=[];
  if(kick) K.push({t:0,x:'home',y:'home',f:'ab_milk_9'},{t:350,f:'ab_milk_1'},{t:700,f:'ab_milk_2'},{t:1050,f:'ab_milk_7'},{t:1600,f:'ab_milk_7',dx:u=>ez(u)*8},
    {t:1950,f:'ab_milk_8',dx:u=>8-ez(u)*12},{t:2650,f:'ab_milk_9'},{t:2850,f:'ab_milk_7',hop:6},{t:3650,f:'ab_milk_1'});
  if(self) K.push({t:o,x:'home',y:'home',f:'ab_milk_3'},{t:o+lt.give,f:'ab_milk_5'},{t:o+lt.wink,f:'ab_milk_6'},{t:o+lt.rest,x:'home',y:'home',f:'idle'});
  else K.push({t:o,x:'home',y:'home',f:go(sp.x,me)},{t:o+700,x:sp.x,y:sp.y,f:'ab_milk_3'},{t:o+lt.show,f:'ab_milk_3'},{t:o+lt.give,f:'ab_milk_4',dx:-6},{t:o+lt.wink,f:'ab_milk_6'},{t:o+lt.back,f:back(sx,me)},{t:o+lt.home,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const F0=live[0]||{x:me.x-200,mid:me.base-60,w:60,h:90,base:me.base};
  const cp={pop:100,line:1050,kick:1980,hit:2750,x0:Math.max(30,me.x-62),y0:me.base-28,h:56,x1:F0.x+F0.w*.1,y1:F0.mid,arc:60};
  const sp2={ix:cp.x1,iy:cp.y1,bh:Math.min(130,Math.max(84,F0.h)),fade:1900,F:live.map((u2,k)=>({x:u2.x,w:u2.w,mid:u2.mid,base:u2.base,d:k*90,cw:Math.max(64,u2.w*1.05),sh:cl(u2.h*.62,32,80),pw:Math.max(70,u2.w*1.3),rot:(k%2?.25:-.2)}))};
  cp.onHit=()=>{ sfx.thud(); for(const f of lf) ST.jolt(f,.4); scene('mk_splash',3.2,{plan:sp2}); scene('mk_puddle',3.2,{plan:sp2,back:true}); scene('av_text',.9,{x:cp.x1,y:Math.max(40,cp.y1-60),txt:'SPLASH!',c:CREAM}); setMessage('The carton bursts. Every monster is now very damp and very dairy.'); };   // fired by the carton scene on arrival, so it stays in step with the flight
  const items=[[0,()=>{ say(m.id,'oat_milk_please');
      if(kick) { setMessage('A carton of cow\'s milk appears at Amy\'s feet.'); scene('mk_carton',2.9,{plan:cp}); sfx.boing?sfx.boing():sfx.select(); }
      else setMessage(self?'Amy reaches for something to drink.':'Amy jogs over to '+t.name+' with a drink.'); }]];
  if(kick) items.push(
    [1050,()=>{ sfx.nope?sfx.nope():sfx.select(); setMessage('Amy does not do dairy. She lines up the kick.'); }],
    [1950,()=>{ sfx.whoosh(); setMessage('BOOT! The carton goes flying.'); }],
    [2850,()=>{ sfx.select(); setMessage('GOAL! Amy pumps her fist.'); }],
    [o-200,()=>{ setMessage('Then she hands out the dairy-free snacks.'); }]);
  items.push(
    [o+lt.show,()=>{ sfx.whoosh(); setMessage('Out comes her almond milk latte instead.'); }],
    ['hf',o+lt.apply],
    [o+lt.apply,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('av_glow',1,{x:H.x,y:H.mid,c:'#f0d8b0'}); scene('av_text',1.2,{x:H.x,y:H.top-30,txt:'AHH',c:CREAM}); hopOf(t!==m?t:null); }],
    [end,'end',kindLine(t,'Dairy-free and delicious. She was right.')]);
  ST.play(E2,items); };

// ---------- False Start (B4) ----------
// Sheet: 1 stopwatch and whistle ready, 2 whistle in her mouth, 3 whistle blown, palm up (stop), 4 pointing, 5 arms crossed, 6 stopwatch up with a smile.
// The start line and blocks (a6_line) are separate objects. She calls the start on her whistle (painted), so no starter pistol is drawn.
A.false_start=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,70),g=front(F,14),me=ST.unit(m);
  const plan={on:300,calls:[[800,'ON YOUR MARKS'],[1500,'SET...']],lean:1700,lunge:2000,grab:2900,slam:3400,F,f},bang=2200;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'ab_start_1'},{t:1500,f:'ab_start_2',dx:(u,tt)=>Math.sin(tt*20)*.8},{t:2200,f:'ab_start_3',hop:10},{t:2450,f:go(g.x,me),hop:4,hn:3},{t:2900,x:g.x,y:g.y,f:'ab_start_4',dx:u=>-ez(u)*8},
    {t:3100,f:'ab_start_4',x:g.x+36,y:g.y,dx:(u,tt)=>Math.sin(tt*24)*2,ease:'in'},{t:3400,f:'ab_start_5',x:g.x+36,y:g.y,hop:6},{t:3800,f:'ab_start_4',hop:4},{t:4800,f:'ab_start_6'},{t:5100,f:back(g.x,me)},{t:5800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A big white start line and starting blocks appear under it.'); say(m.id,'false_start'); scene('a6_line',5.0,{plan}); sfx.thud(); }],
    [800,()=>{ sfx.select(); setMessage('ON YOUR MARKS.'); }],
    [1500,()=>{ sfx.select(); setMessage('SET. Her whistle goes in. Nobody move.'); }],
    [1700,'It leans. Early.'],
    [2000,()=>{ sfx.whoosh(); setMessage('It GOES. Before the whistle.'); }],
    [bang,()=>{ sfx.whistle(); scene('a6_flash',.2,{a:.4}); scene('a6_big',1.2,{x:F.x,y:F.top-80,txt:'FALSE START!',c:GOLD,sc:4}); setMessage('TWEET. FALSE START. Amy is already marching over.'); }],
    [2900,()=>{ sfx.select(); setMessage('She points it back.'); }],
    [3100,()=>{ sfx.whoosh(); setMessage('And marches it all the way back behind the line.'); }],
    ['hf',plan.slam],
    [plan.slam,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('a6_dust',.6,{x:F.x-F.w*.4,y:F.base,r:40,n:10}); scene('a6_big',1,{x:F.x,y:F.top-70,txt:'BACK IN THE BLOCKS',c:CREAM,sc:2}); }],
    [3800,()=>{ sfx.ding(); setMessage('She points at the line. Again. From the blocks.'); }],
    [4800,'Try again. From the blocks. It won\'t.'],
    [5900,'end',res(E2)+'The enemy is sent back to its starting block.']]); };

// ---------- Negative Split (B5) ----------
// Sheet: 1 easy jog, 2 to 5 running strides, 6 both arms up. Lap one uses the easy stride, lap two the fast ones; a6_track and a6_clock draw the track and the split board.
A.negative_split=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const x0=Math.min(...U.map(q=>q.x-q.w*.5)),x1=Math.max(...U.map(q=>q.x+q.w*.5)),cx=Math.round((x0+x1)/2),rx=Math.round(cl((x1-x0)/2+40,110,230)),ry=Math.round(cl(rx*.34,34,60)),cy=Math.min(318-ry,Math.round(Math.max(...U.map(q=>q.base))-14));
  const SLOW=[cycB('ab_split_1','ab_split_2',7),cycB('ab_split_1F','ab_split_2F',7)],FAST=[cycB('ab_split_4','ab_split_5',12),cycB('ab_split_4F','ab_split_5F',12)];
  // waypoints round the oval (angles from the near side, clockwise as seen from the front); index 0 faces left, 1 faces right
  const LAP1=2300,LAP2=1300,wp=(t0,dur,n,fast)=>{ const K=[],S=fast?FAST:SLOW; for(let k=0;k<=n;k++) { const a=Math.PI/2+k/n*Math.PI*2,x=Math.round(cx+Math.cos(a)*rx),y=Math.round(cy+Math.sin(a)*ry);
    const right=Math.cos(a)>0.05?true:(Math.cos(a)<-.05?false:Math.sin(a)>0); K.push({t:t0+Math.round(k/n*dur),x,y,f:S[right?1:0],ease:'lin',hop:fast?3:2,hn:3}); } return K; };
  const start={x:cx,y:Math.min(318,cy+ry)};
  const K=[{t:0,x:'home',y:'home',f:go(start.x,me)},{t:600,x:start.x,y:start.y,f:'ab_split_1'},{t:900,f:'ab_split_1'}].concat(wp(900,LAP1,8,false));
  K.push({t:900+LAP1,x:start.x,y:start.y,f:'ab_split_3',hop:4}); K.push(...wp(900+LAP1+200,LAP2,8,true));
  const hit=900+LAP1+200+LAP2; K.push({t:hit,x:start.x,y:start.y,f:'ab_split_6',hop:18},{t:hit+500,f:'ab_split_6',hop:4},{t:hit+1000,f:back(start.x,me)},{t:hit+1700,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),fast=900+LAP1+200;
  const plan={cx,cy,rx,ry,off:hit+1300},cp={x:cx,y:Math.max(44,cy-ry-AH()-10),fast,fastEnd:hit,off:hit+1200,splits:[[900+LAP1,'LAP 1: 4:12',CREAM],[hit,'LAP 2: 3:58',MINT]]},trail={list:[]};
  ST.play(E2,[
    [0,()=>{ setMessage('A running track paints itself round the whole team.'); say(m.id,'negative_split'); scene('a6_track',(hit+1400)/1000,{plan,back:true}); scene('a6_clock',(hit+1300)/1000,{plan:cp}); }],
    [600,()=>{ sfx.click(); setMessage('Watch on. Lap one: nice and easy.'); }],
    [900,()=>{ sfx.run&&sfx.run(); }],
    [900+LAP1,()=>{ sfx.ding(); sfx.click(); setMessage('4:12. Halfway. Now she goes.'); }],
    [fast,()=>{ sfx.whoosh(); sfx.run&&sfx.run(); scene('a6_speed',(LAP2+200)/1000,{plan:{st,y0:Math.max(40,Math.min(...U.map(q=>q.top))-20),y1:cy+ry}}); scene('a6_ghost',(LAP2+300)/1000,{st,trail,every:70,n:6,life:380});
      if(!foe) who.filter(u=>u!==m).forEach((p,k)=>danceB(p,(LAP2+200)/1000,(q,tt)=>({dx:Math.sin(tt*20+k)*2,dy:-Math.abs(Math.sin(tt*14+k))*8,frame:Math.floor(tt*10+k)%2?'run':'idle'}))); setMessage('Lap two. Flat out. The whole family picks it up with her.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); scene('a6_flash',.2,{a:.3,c:MINT}); scene('a6_big',1.3,{x:cx,y:Math.max(60,cy-ry-AH()-50),txt:'NEGATIVE SPLIT!',c:MINT,sc:3}); for(const q of who) { const P=ST.unit(q); scene('a6_glow',.9,{x:P.x,y:P.mid,c:'#ffb45a'}); hopOf(q!==m?q:null); } }],
    [hit+500,'3:58. Fourteen seconds faster. She wrote it down already.'],
    [hit+1800,'end',foe?kindLine(foe):'Faster in the second half. The party picks up the pace.']]); };

// ---------- Boston Qualifier (B6, ultimate) ----------
// Sheet: 1 hands on knees in her BOSTON bib, 2 to 4 running strides (4 with a fist up), 5 breaking the tape, 6 thumbs up in her foil blanket and medal.
// Frame 5 (her painted tape) shows only while the drawn tape is still whole, so the snapped tape is never doubled. The arch, the tape before it breaks, signs, confetti and everyone else's foil blankets stay drawn. Her own blanket and medal are painted (frame 6).
A.marathon_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m),others=party.filter(p=>p!==m);
  const U=party.map(p=>ST.unit(p)),minX=Math.min(...U.map(q=>q.x)),ly=Math.min(306,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length));
  const ax=Math.max(62,Math.min(100,Math.round(Gp.x0-6))),lead={x:Math.round(minX-46),y:ly},finish=ax-6;
  const RUN0=2300,RUN1=3300,dx=finish-lead.x,tape=RUN1-40;
  const P={ax,gy:ly,chest:Math.round(AH()*.58),cy:Math.max(BARB+70,Math.min(132,Math.round(Gp.top-10))),sign1:Math.round(lead.x-8),sign2:Math.round((lead.x+560)/2+30),cheer:RUN0,tape,t0:0,st:null,y0:Gp.top,y1:ly};
  const at=x=>RUN0+cl((lead.x-x)/(lead.x-finish))*(RUN1-RUN0);
  P.pins=list.map((f,k)=>{ const F=ST.foe(f); return {f,k,t:at(F.x+F.w*.25)}; });
  const hit=Math.round(at(Gp.x)),STRIDE=cycB('ab_marathon_2','ab_marathon_3',12),HOME=cycB('ab_marathon_2F','ab_marathon_3F',10),JOG=cycB('ab_marathon_2','ab_marathon_3',8);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:lead.x<me.x?'run':'runR'},{t:700,x:lead.x,y:lead.y,f:'ab_marathon_1'},{t:1300,f:'ab_marathon_4',hop:10},{t:1700,f:JOG,dx:(u,tt)=>Math.sin(tt*14)*1.5,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},
    {t:RUN0,f:STRIDE,ease:'lin'},{t:RUN1-260,x:Math.round(lead.x+dx*.74),y:lead.y,f:'ab_marathon_5',ease:'lin'},{t:tape,x:finish,y:lead.y,f:'ab_marathon_4',hop:16},{t:3700,f:'ab_marathon_4',hop:6},{t:3800,f:HOME},{t:4700,x:'home',y:'home',f:'ab_marathon_6',hop:10},{t:6000,f:'idle'}]);
  P.st=st;
  // everyone else: jog in place on KICK NOW!, then the same sprint (same distance), then jog home
  for(const p of others) { const k=p.idx; danceB(p,4.7,(qq,tt)=>{ const ms=qq*4700;
    if(ms<1700) return {};
    if(ms<RUN0) return {frame:'run',dx:Math.sin(tt*14+k)*1.5,dy:-Math.abs(Math.sin(tt*14+k))*4};
    if(ms<RUN1) { const q=(ms-RUN0)/(RUN1-RUN0); return {frame:'run',dx:dx*q,dy:-Math.abs(Math.sin(tt*16+k))*3}; }
    if(ms<3800) return {dx,frame:'celeb',dy:-Math.abs(Math.sin((ms-RUN1)/500*Math.PI))*10};
    const q=ez((ms-3800)/900); return {frame:q<1?'runR':null,dx:dx*(1-q),dy:-Math.abs(Math.sin(tt*12+k))*3*(1-q)}; }); }
  ST.play(E2,[
    [0,()=>{ scene('a5_bars',6.6,{}); scene('a5_arch',6.5,{plan:P,back:true}); scene('a5_tape',4.4,{plan:P}); (sfx.cheer||sfx.whoosh)(); say(m.id,'marathon_ult');
      setMessage('Mile 26. A finish line pops up on the far side. The crowd goes wild.'); scene('a6_course',2.6,{plan:{x:288,y:BARB+44,go:300,off:2500}}); }],
    [1000,'Twenty-six miles in. Heartbreak Hill is behind her. One more to go.'],
    [700,()=>{ (sfx.ting||sfx.select)(); scene('a5_big',1,{x:ax,y:BARB+80,txt:'MILE 26.2',c:YB,sc:3}); setMessage('Amy looks up at the clock. She can still make her qualifying time.'); }],
    [1300,()=>{ scene('a5_big',1,{st,txt:'KICK NOW!',c:GOLD,sc:3}); sfx.select(); setMessage('KICK NOW! The whole family lines up behind her.'); }],
    [RUN0,()=>{ sfx.fanfare(); (sfx.cheer||sfx.whoosh)(); sfx.run(); scene('a5_speed',(RUN1-RUN0+200)/1000,{plan:P}); scene('a5_bowl',2.0,{plan:Object.assign({},P,{t0:RUN0})});
      setMessage('They sprint. Straight through the middle of the enemies.'); scene('a6_sign',1.6,{x:Math.min(540,lead.x+30),y:Gp.top-30,txt:'HEREFORD ST',h:46}); }],
    [RUN0+450,()=>{ scene('a6_sign',1.5,{x:Math.max(40,ax+60),y:Gp.top-30,txt:'BOYLSTON ST',h:46}); scene('a5_big',.8,{x:288,y:Gp.top-50,txt:'RIGHT. THEN LEFT.',c:CREAM,sc:2}); }],
    ...P.pins.map(b=>[Math.round(b.t),()=>{ sfx.bonk(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('a5_flash',.3,{a:.4}); }],
    [tape,()=>{ sfx.fanfare(); (sfx.cheer||sfx.ding)(); sfx.bonk(); scene('a5_confetti',1.6,{ax,gy:ly}); scene('a5_flash',.3,{a:.4,c:YB});
      scene('a5_big',1.4,{x:Math.max(140,ax+60),y:Gp.top-74,txt:'BOSTON QUALIFIER!',c:YB,sc:3}); setMessage('Amy breaks the tape with her chest. Boston Qualifier!'); scene('a6_bq',1.6,{x:ax,y:BARB+74,delay:.4}); }],
    [3700,()=>{ sfx.ding(); setMessage('2:59:58. Under three hours. A medal, and she did the math already.'); }],
    [3800,()=>{ setMessage('Everybody jogs it out. Hands on heads. Breathe.'); }],
    [4700,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); const FL=others.map(p=>[ST.unit(p),p.id]); scene('a5_foilB',1.7,{list:FL,back:true}); scene('a5_foil',1.7,{list:FL}); for(const p of party) { const q=ST.unit(p); scene('a5_glow',1,{x:q.x,y:q.mid,c:GOLD}); } }],
    [5300,()=>{ scene('a5_big',1,{st,txt:'WE QUALIFIED!',c:GOLD,sc:2}); setMessage('Foil blankets for the whole family. Personal bests all round.'); }],
    [6400,'end',()=>res(E2)+'She\'s already signing everyone up for next year.']]); };

// ==== END GROUP B ====
})();
