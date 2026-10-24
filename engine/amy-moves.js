'use strict';
// engine/amy-moves.js: Amy's Option 3 Primary kit (phase 4b), as set pieces on engine/stage.js (the standard from
// phase 4a on). Her legacy moves stay in engine/recruit-moves.js; PEP TALK's legacy animation is in
// engine/battle2-moves.js and hands over to pepShow below for the Option 3 version. Amy runs everywhere (a teacher and
// a racer), grades, coaches, hands out water, and is jogging in place before anyone notices.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix am_.
// Loaded after engine/boppy-moves.js.
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
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',ROSE='#ff9ac0',WOOD='#b88848',BLUE='#9fc4f0',RED='#e0402e',GREEN='#8ef0a0',PEN='#d8343a',TRACK='#d86a4a';
ST.nw('am_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});   // her sprite has blank rows above the head
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'runR':'run';
const go=(x,me)=>x<me.x?'run':'runR';
const jog=(u,tt)=>Math.floor(tt*9)%2?'run':'idle';   // jogging in place

// ---------- Shared scenes ----------
SC.am_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.am_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||38,s.ry||52,s.c||GOLD); };
SC.am_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.am_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.am_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CREAM); } };
SC.am_ringhit=(s,u)=>{ const q=ez(u/.5); gfx.globalAlpha=fade(u,.4)*(1-q*.4); ring(s.x,s.y,6+q*(s.r||30),6+q*(s.r||30)*.8,4,s.c||CREAM); };

// ---------- Starting Step ----------
SC.am_tick=(s,u)=>{ gfx.globalAlpha=fade(u,.9); R(s.x-14,s.y,28,3,CREAM); if(s.t*1000<500) label('LACE',s.x,s.y-58,CREAM,1); };
A.starting_step=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'kneel'},{t:450,f:'run',ease:'in'},{t:1050,x:p.x,y:p.y,f:'act',dx:u=>-Math.sin(u*Math.PI)*12},{t:1350,f:jog,hop:4,hn:6},{t:2250,f:back(p.x,me),ease:'lin'},{t:2850,x:'home',y:'home',f:jog,hop:3,hn:4},{t:3200,f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy checks one shoelace without stopping.'); say(m.id,'starting_step'); scene('am_tick',1,{x:me.x,y:me.base+2}); }],
    [450,()=>{ sfx.run&&sfx.run(); sfx.whoosh(); }],
    ['hf',1150],
    [1150,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('am_ringhit',.5,{x:F.x+8,y:F.mid,r:30}); }],
    [1350,()=>{ scene('am_text',1,{st,txt:'ON THE MOVE',c:GOLD,sc:2}); setMessage('She is already jogging in place when it notices.'); }],
    [3300,'end',res(E2)+'Amy does not waste the first second.']]); };

// ---------- PEP TALK ----------
SC.am_arrow=(s,u)=>{ const g=ez(u/.2),b=Math.sin(s.t*8)*2; gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(s.x,s.y+b); gfx.scale(g,g);
  gfx.beginPath(); gfx.moveTo(0,-14); gfx.lineTo(10,-2); gfx.lineTo(4,-2); gfx.lineTo(4,10); gfx.lineTo(-4,10); gfx.lineTo(-4,-2); gfx.lineTo(-10,-2); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=GOLD; gfx.fill(); gfx.restore(); };
SC.am_todo=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; gfx.globalAlpha=fade(u,.95);
  const len=Math.min(P.max,(ms-P.on)*.09),x0=P.x,y=P.y; RO(x0,y-4,len,8,CREAM); for(let k=8;k<len-4;k+=10) R(x0+k,y-1,6,1,'#9aa3c8');
  RO(x0+len-4,y-7,8,14,CREAM); if(len>40) label('TO DO',x0+20,y-16,CREAM,1); if(ms>P.step) label('STEP',x0+len,y-18,GOLD,1); };
A.pepShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),others=party.filter(p=>p!==m),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const cx=Math.round(U.reduce((a,q)=>a+q.x,0)/U.length),py=Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+18),px=Math.max(40,Math.min(...U.map(q=>q.x-q.w*.5))-24);
  const K=[{t:0,x:'home',y:'home',f:go(px,me)},{t:700,x:px,y:py,f:'clap'},{t:950,f:'idle'},{t:1050,f:'clap'},{t:1300,f:'aim'}];
  let t=1400; const visits=[];
  for(const o of others) { const q=ST.unit(o); visits.push([t,o,q]); K.push({t,f:'aim',dx:(u,tt)=>Math.sin(tt*16)*1.5}); t+=360; }
  const applyAt=t; K.push({t,f:'celeb',hop:8},{t:t+500,f:'hip',dy:u=>ez(u)*2},{t:t+1000,f:back(px,me)},{t:t+1600,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy runs out in front of the team.'); say(m.id,'pep_talk'); scene('am_todo',(applyAt+1500)/1000,{plan:{on:900,x:px+18,y:py-2,max:150,step:applyAt+500}}); }],
    [700,()=>{ sfx.clap?sfx.clap():sfx.select(); setMessage('One firm coach clap. Then another.'); }],
    [1050,()=>{ sfx.clap?sfx.clap():sfx.select(); }],
    ...visits.map(([ms,o,q])=>[ms,()=>{ scene('am_arrow',(applyAt-ms+1300)/1000,{x:q.x,y:q.top-16}); battle.fx[o.idx].hop=.3; sfx.select(); }]),
    [1400,()=>{ setMessage('She points at each of them. Next action: yours.'); }],
    ['hf',applyAt],
    [applyAt,()=>{ E2.apply(); sfx.levelUp(); for(const o of others) { const q=ST.unit(o); scene('am_glow',.9,{x:q.x,y:q.mid,c:GOLD}); } scene('am_text',1.2,{st,txt:'YOU GOT THIS',c:GOLD,sc:2}); }],
    [applyAt+500,()=>{ setMessage('Behind her, the to-do list keeps unrolling. She steps on the end of it.'); }],
    [applyAt+1700,'end','Amy believes it before everybody else does. Next attack or heal +50%.']]); };
A.pep_talk=E2=>A.pep(E2);   // the Option 3 signature key (data/abilities.js); the legacy key stays 'pep' (engine/battle2-moves.js)

// ---------- Margin Notes ----------
SC.am_pen=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.put) return; gfx.globalAlpha=1; gfx.save(); gfx.translate(h.x-4,h.y-6); gfx.rotate(ms>P.draw&&ms<P.tick+200?-.9+Math.sin(ms/50)*.2:-.5); RO(-3,-22,6,26,PEN); R(-3,-22,6,5,'#f4f0e6'); R(-1,4,2,4,'#2b2a26'); gfx.restore(); };
SC.am_bracket=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; gfx.globalAlpha=fade(u,.92); const q=ez((ms-P.draw)/500),x=F.x+F.w*.5+6,y0=F.top+4,y1=F.base-4,ym=lerp(y0,y1,q);
  if(ms>P.draw) { Ln(x,y0,x+6,y0,3,PEN); Ln(x,y0,x,ym,3,PEN); if(q>=1) Ln(x,y1,x+6,y1,3,PEN); }
  if(ms>P.tick) { const k=ez((ms-P.tick)/200),cx=F.x,cy=F.mid; Ln(cx-10,cy,lerp(cx-10,cx-2,k),lerp(cy,cy+8,k),4,PEN); if(k>=1) Ln(cx-2,cy+8,lerp(cx-2,cx+14,ez((ms-P.tick-200)/200)),lerp(cy+8,cy-12,ez((ms-P.tick-200)/200)),4,PEN); }
  if(ms>P.note) { const g=ez((ms-P.note)/250); gfx.save(); gfx.translate(F.x-F.w*.3,F.top-6); gfx.rotate(-.12); gfx.scale(g,g); RO(-26,-10,52,20,'#fff27a'); label('PLEASE',0,-7,'#2b2a26',1); label('EXPLAIN',0,1,'#2b2a26',1); gfx.restore(); } };
A.margin_notes=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,40),me=ST.unit(m);
  const plan={draw:1100,tick:1800,note:2300,put:3000,F};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'aim'},{t:1100,f:'act',dx:(u,tt)=>Math.sin(tt*12)*1.5},{t:1800,f:'throw',dx:-6},{t:2300,f:'hip'},{t:2900,f:back(p.x,me)},{t:3600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over, red pen already uncapped.'); say(m.id,'margin_notes'); scene('am_pen',3.0,{plan}); scene('am_bracket',3.6,{plan}); }],
    [1100,()=>{ sfx.select(); setMessage('A neat red bracket beside one armor section.'); }],
    ['hf',1800],
    [1800,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.4); landHit(100); }],
    [2300,()=>{ sfx.select(); setMessage('A note sticks to the least convincing piece.'); }],
    [3700,'end',res(E2)+'The feedback is thorough and legible.']]); };

// ---------- Hall Pass Home ----------
SC.am_door=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; const g=ez((ms-P.on)/300); gfx.globalAlpha=fade(u,.9)*g; const x=P.x,b=P.y,h=P.h;
  RO(x-14,b-h,28,h,WOOD); gfx.globalAlpha*=.9; R(x-11,b-h+3,22,h-3,'#ffd27a'); E(x,b-h*.5,10,h*.35,'#fff1b0'); if(ms>P.on+200) label('HOME',x,b-h-12,GOLD,1); };
SC.am_pass=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.95); let x=h.x-8,y=h.y-10; gfx.save(); gfx.translate(x,y); gfx.rotate(-.15); RO(-14,-8,28,16,WOOD); label('HOME',0,-3,CREAM,1); R(-1,-14,2,6,OUT); gfx.restore();
  if(ms>P.stamp) { const g=ez((ms-P.stamp)/200); gfx.save(); gfx.translate(x,y-26); gfx.scale(lerp(1.6,1,g),lerp(1.6,1,g)); gfx.rotate(-.1); gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.strokeRect(-36,-8,72,16); label('RETURN WHEN',0,-6,RED,1); label('READY',0,1,RED,1); gfx.restore(); } };
A.hall_pass_home=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,24),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:'aim'},{t:1500,f:'throw'},{t:2100,f:'celeb',hop:8},{t:2600,f:'hip'},{t:3200,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:800,x:sp.x,y:sp.y,f:'aim'},{t:1500,f:'throw',dx:-6},{t:2100,f:'celeb',hop:8},{t:2600,f:'hip'},{t:3100,f:back(sp.x,me)},{t:3800,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={on:self?400:800,x:Math.round(H.x-H.w*.5-14),y:H.base,h:Math.round(Math.min(90,H.h*.95)),stamp:2600},hit=1700,end=self?3300:3900;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy writes herself a HOME hall pass. Allowed, apparently.':'Amy runs over to '+t.name+' with a HOME hall pass.'); say(m.id,'hall_pass_home'); scene('am_pass',(end-100)/1000,{plan}); scene('am_door',(end-100)/1000,{plan}); }],
    [plan.on,()=>{ sfx.doorIn?sfx.doorIn():sfx.select(); setMessage('A narrow warm doorway opens beside them.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('am_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('am_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a'}); hopOf(t!==m?t:null); }],
    [2600,()=>{ sfx.thud(); setMessage('The pass gets a cheerful stamp.'); }],
    [end,'end',kindLine(t,'The pass includes a warm place to go.')]]); };

// ---------- Gold-Star Recess ----------
SC.am_card=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.done+900) return; gfx.globalAlpha=1; const x=h.x-14,y=h.y-28; RO(x-20,y-14,40,28,CREAM); R(x-16,y-10,10,10,'#2b2a26'); R(x-14,y-8,6,6,CREAM); label('RECESS',x+6,y-8,'#2b2a26',1);
  if(ms>P.done) { gfx.save(); gfx.translate(x,y+4); gfx.rotate(-.2); gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.strokeRect(-14,-6,28,12); label('DONE',0,-3,RED,1); gfx.restore(); } };
SC.am_pinwheel=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.85); let x=s.x,y=s.y-ez(u/.4)*10; if(s.hold&&s.st&&s.st.x!=null) { const h=hand(); x=h.x-6; y=h.y-26; }
  R(x-1,y,2,20,WOOD); for(let k=0;k<4;k++) { gfx.save(); gfx.translate(x,y); gfx.rotate(s.t*8+k*Math.PI/2); gfx.scale(g,g); gfx.beginPath(); gfx.moveTo(0,0); gfx.lineTo(12,-4); gfx.lineTo(10,6); gfx.closePath(); gfx.fillStyle=k%2?GOLD:'#ffb04a'; gfx.fill(); gfx.restore(); } star(x,y,4,GOLD); };
A.goldstar_recess=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const sx=foe?front(U[0],40).x:Math.max(40,Math.min(...U.map(q=>q.x-q.w*.5))-26),sy=foe?front(U[0],40).y:Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+14);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(sx,me)},{t:800,x:sx,y:sy,f:'aim'},{t:1500,f:'act',dx:-6},{t:1900,f:'spread'},{t:2700,f:'celeb',hop:8},{t:3200,f:'hip'},{t:3500,f:back(sx,me)},{t:4200,x:'home',y:'home',f:'idle'}]);
  const plan={done:1500},hit=1900;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy runs over with a task card. One empty box: RECESS.'); say(m.id,'goldstar_recess'); scene('am_card',2.6,{plan}); }],
    [1500,()=>{ sfx.thud(); setMessage('She stamps DONE over the empty box.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.ding(); sfx.heal(); for(const u of who) { const q=ST.unit(u); scene('am_pinwheel',2.0,{x:q.x,y:q.top-22}); scene('am_glow',.9,{x:q.x,y:q.mid,c:GOLD}); hopOf(u!==m?u:null); } }],
    [2700,()=>{ scene('am_pinwheel',1.6,{hold:true,st}); setMessage(foe?'The assignment is to stop for a moment. Even for '+foe.name+'.':'She takes the last pinwheel herself. Rest counts as good work.'); }],
    [4300,'end',foe?kindLine(foe):'The assignment is to stop for a moment.']]); };

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

// ---------- A Better Question ----------
SC.am_tiles=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; gfx.globalAlpha=fade(u,.92);
  const conv=ez((ms-P.flip)/(P.hit-P.flip));
  if(ms<P.hit) ['A','B','C','D'].forEach((ch,k)=>{ const a=s.t*2.4+k*Math.PI/2,r=lerp(F.w*.6+20,4,conv),x=F.x+Math.cos(a)*r,y=F.mid+Math.sin(a)*r*.55; RO(x-8,y-8,16,16,CREAM); label(ch,x+1,y-3,'#2b2a26',1); });
  else if(ms<P.hit+700) { const g=ez((ms-P.hit)/200); gfx.save(); gfx.translate(F.x,F.mid); gfx.scale(g*1.6,g*1.6); label('?',1,-8,GOLD,4); gfx.restore(); }
  const h=hand(); if(ms<P.hit) { const f=cl((ms-P.flip)/250),sc=Math.cos(f*Math.PI); gfx.save(); gfx.translate(h.x-10,h.y-24); gfx.scale(Math.abs(sc),1); RO(-14,-10,28,20,CREAM); label(sc>0?'Q':'?',0,-3,sc>0?'#2b2a26':PEN,sc>0?1:2); gfx.restore(); } };
A.better_question=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,44),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const plan={flip:1500,hit:2050,F};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'hip'},{t:1300,f:'aim'},{t:1500,f:'throw',dx:-6},{t:2200,f:'hip'},{t:2700,f:'celeb',hop:6},{t:3000,f:back(p.x,me)},{t:3700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over. Four answer tiles orbit '+(f.def?f.def.the:'it')+'.'); say(m.id,'better_question'); scene('am_tiles',3.0,{plan}); }],
    [1500,()=>{ sfx.whoosh(); setMessage('She flips the question card.'); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.45); landHit(100); }],
    [2600,()=>{ if(girls.length) { for(const g of girls) { const q=ST.unit(g); scene('am_heart',1,{x:q.x,y:q.top-4}); battle.fx[g.idx].hop=.3; } sfx.select(); setMessage('A quick nod to '+girls.map(g=>g.name).join(' and ')+'.'); } else setMessage('It prepared answers to the wrong question.'); }],
    [3800,'end',res(E2)+'Amy changes the question, not her standards.']]); };

// ---------- Lace, Then Race ----------
SC.am_lace=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.snap+500) return; gfx.globalAlpha=1; const x=P.x,y=P.y,tight=ez((ms-P.pull)/(P.snap-P.pull)),r=lerp(14,6,tight);
  ring(x-r,y-4,r,r*.6,3,CREAM); ring(x+r,y-4,r,r*.6,3,CREAM); EO(x,y-4,3,3,CREAM); if(ms>P.snap) label('KNOT OK',x,y-30,GOLD,1); else label('LACE',x,y-30,CREAM,1); };
A.lace_then_race=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30),me=ST.unit(m);
  const plan={pull:200,snap:900,x:me.x-10,y:me.base-4};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'kneel',dx:(u,tt)=>Math.sin(tt*14)*1},{t:950,f:'run',ease:'in'},{t:1450,x:p.x,y:p.y,f:'act',dx:u=>-Math.sin(u*Math.PI)*12},{t:1750,f:jog,hop:4,hn:4},{t:2300,f:back(p.x,me),ease:'lin'},{t:2900,x:'home',y:'home',f:'hip'},{t:3300,f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy pulls one shoelace into a crisp loop.'); say(m.id,'lace_then_race'); scene('am_lace',1.5,{plan}); }],
    [900,()=>{ sfx.select(); setMessage('Knot snapped shut. Race.'); }],
    [950,()=>{ sfx.run&&sfx.run(); sfx.whoosh(); }],
    ['hf',1500],
    [1500,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('am_ringhit',.6,{x:F.x+8,y:F.mid,r:34,c:GOLD}); }],
    [3400,'end',res(E2)+'The preparation took less time than the hit.']]); };

// ---------- Hill Math ----------
SC.am_route=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.put) return; const x=h.x-12,y=h.y-24; gfx.globalAlpha=1; RO(x-18,y-12,36,24,CREAM); const q=ez((ms-P.draw)/400);
  gfx.strokeStyle=TRACK; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(x-14,y+8); gfx.lineTo(x-14+14*q,y+8-16*q); if(q>=1) gfx.lineTo(x+14,y+8); gfx.stroke(); };
SC.am_hill=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.rise-200) return; const g=ez((ms-P.rise)/300)*(1-ez((ms-P.sink)/400)); gfx.globalAlpha=fade(u,.95);
  const x=P.x,b=P.b,w=P.w,h=36*g; gfx.beginPath(); gfx.moveTo(x-w,b+4); gfx.lineTo(x,b+4-h); gfx.lineTo(x+w,b+4); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#6fae5a'; gfx.fill();
  if(g>.5) label('STEEP',x,b-h-14,CREAM,1);
  if(ms>P.flat) { const q=ez((ms-P.flat)/300); Ln(P.fx0,P.fy,lerp(P.fx0,P.fx1,q),P.fy,4,CREAM); if(q>=1) label('FLAT',(P.fx0+P.fx1)/2,P.fy-14,GOLD,1); } };
A.hill_math=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],nbs=hitList.filter(x=>x!==f);
  const plan={draw:1000,put:1700,rise:1700,sink:3200,flat:2500,x:F.x,b:F.base,w:Math.max(28,F.w*.6),fx0:F.x+F.w*.5+8,fx1:p.x-8,fy:p.y+6};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'aim'},{t:1000,f:'act',dx:(u,tt)=>Math.sin(tt*10)*1},{t:1700,f:'throw',dx:-6},{t:2200,f:'hip'},{t:2500,f:'aim'},{t:3100,f:back(p.x,me)},{t:3800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over and draws one steep contour line on a route card.'); say(m.id,'hill_math'); scene('am_route',1.8,{plan}); scene('am_hill',3.6,{plan}); }],
    ['hf',1900],
    [1900,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.5); for(const n of nbs) ST.jolt(n,.3); landHit(100); setMessage('The steep part goes under the enemy. The neighbors roll outward.'); }],
    [2500,()=>{ sfx.select(); setMessage('She points out the perfectly flat path beside it. Hers.'); }],
    [3900,'end',res(E2)+'Amy has distributed the elevation unfairly.']]); };

// ---------- Water-Station Truce ----------
SC.am_tray=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.set) return; gfx.globalAlpha=fade(u,.94); const x=P.x,y=P.y;
  R(x-2,y-20,4,20,'#c9c2b8'); RO(x-16,y-24,32,5,'#c9c2b8'); if(ms<P.give) { RO(x-5,y-36,10,12,'#cfe8ee'); R(x-3,y-32,6,6,'#6cb0e0'); }
  if(ms<P.arrow+400) { const q=ez((ms-P.arrow)/400),ax=lerp(x+24,x+90,q); gfx.globalAlpha*=1-q; RO(ax-14,y-44,28,10,'#c8463a'); label('FINISH',ax,y-43,CREAM,1); gfx.globalAlpha=fade(u,.94); }
  if(ms>P.watch) { const h=hand(); EO(h.x-8,h.y-6,7,7,'#2b2a26'); label('NOT A RACE',h.x-8,h.y-30,CREAM,1); } };
A.water_truce=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'kneel'},{t:600,f:'aim'},{t:1200,f:'throw'},{t:1700,f:'act'},{t:2300,f:'kneel'},{t:2900,f:'hip'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:800,x:sp.x,y:sp.y,f:'kneel'},{t:1200,f:'throw',dx:6},{t:1700,f:'act',dx:-6},{t:2300,f:'kneel'},{t:2900,f:'hip'},{t:3200,f:back(sp.x,me)},{t:3900,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={set:self?300:800,arrow:1200,give:1700,watch:2300,x:self?me.x-40:Math.round((H.x+sp.x)/2)+4,y:self?me.base:sp.y},hit=2000,end=self?3400:4000;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy sets out one plain cup of water. For herself.':'Amy runs over to '+t.name+' and sets out a water station.'); say(m.id,'water_truce'); scene('am_tray',(end-100)/1000,{plan}); }],
    [1200,()=>{ sfx.whoosh(); setMessage('She pushes the finish line away from the tray.'); }],
    [1700,()=>{ ST.fly((x,y)=>{ RO(x-4,y-5,8,10,'#cfe8ee'); R(x-2,y-2,4,5,'#6cb0e0'); },plan.x,plan.y-30,H.x+(self?-10:4),H.mid,.3,20); sfx.select(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('am_glow',.9,{x:H.x,y:H.mid,c:'#9fd8ff'}); hopOf(t!==m?t:null); }],
    [2300,()=>{ setMessage('She turns her stopwatch face down. On purpose.'); }],
    [end,'end',kindLine(t,'Nobody has to win the water break.')]]); };

// ---------- False Start ----------
SC.am_block=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; gfx.globalAlpha=fade(u,.94); const g=ez((ms-P.on)/250); if(ms<P.on) return;
  const bx=F.x+F.w*.5+4,by=F.base; gfx.save(); gfx.translate(bx,by); gfx.scale(g,g); RO(-6,-10,12,10,'#5a6a80'); R(-6,-10,12,3,'#9aa3c8'); gfx.restore();
  const slide=ez((ms-P.line)/300),lx=lerp(bx+40,bx+12,slide); R(lx-1,by-2,3,8,CREAM); R(lx-1,by+4,3,2,CREAM);
  if(ms>P.hit&&ms<P.hit+900) label('FALSE START',F.x,F.top-20,GOLD,2); if(ms>P.point) label('LINE',lx,by+10,CREAM,1); };
A.false_start=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,38),me=ST.unit(m);
  const plan={on:700,line:1200,hit:1600,point:2100,F};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'kneel'},{t:1200,f:'act',dx:u=>-ez(u)*8},{t:1600,f:'throw',dx:-8},{t:2100,f:'aim'},{t:2700,f:back(p.x,me)},{t:3400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy catches it leaning early. She sprints over.'); say(m.id,'false_start'); scene('am_block',3.4,{plan}); }],
    [1200,()=>{ sfx.select(); setMessage('She slides the start line in behind its foot.'); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.45); landHit(100); }],
    [2100,()=>{ setMessage('She points at the line. She says nothing else.'); }],
    [3500,'end',res(E2)+'The enemy is sent back to its starting block.']]); };

// ---------- Shakeout Mile ----------
SC.am_slider=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.9); const x=P.x,y=P.y; RO(x-50,y-4,100,8,'#2c323e'); label('EASY',x-40,y-18,GREEN,1); label('RACE',x+40,y-18,RED,1);
  const q=ez((ms-P.push)/500),kx=lerp(x+42,x-42,q)+(ms<P.push?Math.sin(ms/60)*2:0); RO(kx-5,y-9,10,18,GOLD); };
SC.am_steps=(s,u)=>{ const ms=s.t*1000,st=s.st; if(!st||st.x==null) return; const L=s.list; if(ms>s.from&&ms<s.to&&(!L.length||Math.hypot(L[L.length-1].x-st.x,L[L.length-1].y-st.y)>14)) L.push({x:st.x,y:st.y+2,t:ms});
  for(const p of L) { const a=1-cl((ms-p.t)/1500); if(a<=0) continue; gfx.globalAlpha=a*.8; E(p.x-3,p.y,3,2,'#ffb45a'); E(p.x+4,p.y-2,3,2,'#ffb45a'); } };
A.shakeout_mile=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m);
  const loop=(foe?[foe]:who.filter(u=>u!==m));
  const K=[{t:0,x:'home',y:'home',f:'act'},{t:900,f:'aim'},{t:1100,f:'walk',hop:2,hn:3}];
  let t=1100;
  for(const o of loop) { const q=ST.unit(o); K.push({t,f:(uu,tt)=>Math.floor(tt*6)%2?'run':'idle',hop:2,hn:3}); t+=520; K.push({t,x:Math.max(30,q.x-q.w*.5-12),y:Math.min(318,q.base+10)}); }
  K.push({t,f:'walkR',hop:2,hn:3}); t+=600; const homeAt=t; K.push({t,x:'home',y:'home',f:'spread'},{t:t+700,f:'celeb'},{t:t+1000,f:'idle'});
  const st=ST.keys(fx,K),hit=Math.max(1700,homeAt-200);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sets a pace slider between EASY and RACE. It is drifting toward RACE.'); say(m.id,'shakeout_mile'); scene('am_slider',2.2,{plan:{x:me.x-60,y:Math.max(30,me.top-20),push:400}}); scene('am_steps',(homeAt+1200)/1000,{st,from:1100,to:homeAt,list:[]}); }],
    [400,()=>{ sfx.select(); setMessage('She pushes it firmly to EASY. Easy means actually easy.'); }],
    [1100,()=>{ setMessage('A gentle jog. Warm footprints follow her round.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.ding(); for(const u of who) { const q=ST.unit(u); scene('am_glow',.9,{x:q.x,y:q.mid,c:'#ffb45a'}); scene('am_flakes',1,{x:q.x,y:q.base,h:q.h}); hopOf(u!==m?u:null); } }],
    [homeAt,()=>{ setMessage('She finishes with a relaxed stretch. Reluctantly.'); }],
    [homeAt+1100,'end',foe?kindLine(foe):'Amy demonstrates a sustainable pace. The party speeds up.']]); };
})();

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Tom's review: things Amy actually does (teacher, runner, dairy-free, fiercely competitive), one big readable moment per move.
// Kettlebell Swing (basic), Red Pen, Hot Lunch Tray, Gold-Star Recess (bigger stars), Inside Voices!, Pop Quiz, Burpee Blitz,
// Hill Repeats, Oat Milk, Please, False Start (big line and blocks), Negative Split. Same numbers as the slots they replace.
// Same engine/stage.js standard; scenes prefix av_. The older functions above stay for the superseded keys.
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
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',IRON='#3a3f46',IRON2='#6a727c',GREEN='#6fae5a',GREEN2='#8fd06a',SKY='#9fd8ff',MINT='#8ef0a0',TRAY='#e8a04a',SOUP='#e8913a';
ST.nw('av_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoes=()=>{ const M=B2.move; return M?[...new Set(M.waves.flat().map(e=>e.t))].filter(t=>t.side==='foe'):[]; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const rowSpot=(Gp,gap=56)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(316,Gp.base+6)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'runR':'run';
const go=(x,me)=>x<me.x?'run':'runR';
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const dance=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; return {cx:c.origX+(r.dx||0),base:c.origBase+(r.dy||0),rot:r.rot||0,frame:r.frame?(c.sp[r.frame]||c.sp.idle):null}; }}; };
const clap=()=>{ (sfx.clap||sfx.bonk)(); };
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
SC.av_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.7); R(0,0,576,324,s.c||'#ffffff'); };
SC.av_hearts=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; heart(s.x-20+k*10+Math.sin(q*6+k)*5,s.y-q*44,5+(k%2)*2,k%2?'#ff9ac0':'#ff6b9a'); } };

// ---------- Kettlebell Swing (basic) ----------
// She runs over with a big kettlebell, hikes it back between her knees, and swings it up into the monster. WHUMP.
const bell=(x,y,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); ring(0,-16,9,9,9,OUT); ring(0,-16,9,9,5,IRON2); EO(0,0,15,14,IRON); E(-5,-5,5,4,IRON2); label('35',1,-2,CREAM,1); gfx.restore(); };
SC.av_bell=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(st.x==null) return; gfx.globalAlpha=1;
  const px=st.x+4,py=st.y-AH()*.42,r=36;
  let a=null;
  if(ms<P.hike) { const h=hand(); bell(h.x-2,h.y+14,1.1); return; }
  if(ms<P.swing) { const q=(ms-P.hike)/(P.swing-P.hike); a=Math.PI*.5-Math.sin(q*Math.PI*1.5)*.45; }
  else if(ms<P.hit) { const q=ez((ms-P.swing)/(P.hit-P.swing)); a=lerp(Math.PI*.38,Math.PI*1.03,q); }
  else if(ms<P.drop) { const q=ez((ms-P.hit)/(P.drop-P.hit)); a=lerp(Math.PI*1.03,Math.PI*1.32,Math.sin(q*Math.PI*.5)); }
  else { const q=ez((ms-P.drop)/300); a=lerp(Math.PI*1.32,Math.PI*.5,q); }
  const bx=px+Math.cos(a)*r,by=py+Math.sin(a)*r;
  if(ms>P.swing&&ms<P.hit+150) { gfx.globalAlpha=.5; for(let k=1;k<4;k++) { const b=a-k*.18; gfx.beginPath(); gfx.arc(px,py,r+8,b-.15,b); gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.stroke(); } gfx.globalAlpha=1; }
  Ln(px,py,bx,by,5,OUT); bell(bx,by,1.4); };
A.kettlebell_swing=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,42),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'wind',dy:u=>ez(u)*6},{t:1350,f:'wind',dy:6,dx:(u,tt)=>Math.sin(u*Math.PI*1.5)*4},{t:1650,f:'throw',dx:u=>-ez(u)*10},
    {t:2100,f:'celeb',hop:6},{t:2600,f:back(p.x,me)},{t:3300,x:'home',y:'home',f:'idle'}]);
  const plan={st,hike:800,swing:1350,hit:1650,drop:2100};
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over carrying a very big kettlebell.'); say(m.id,'kettlebell_swing'); scene('av_bell',3.3,{plan}); sfx.run&&sfx.run(); }],
    [800,()=>{ sfx.thud(); setMessage('She hikes it back between her knees. Flat back.'); }],
    [1350,()=>{ sfx.whoosh(); }],
    ['hf',1650],
    [1650,()=>{ sfx.bonk(); sfx.thud(); ST.jolt(f,.55); landHit(100); scene('av_big',1,{x:F.x,y:F.top-74,txt:'WHUMP!',c:GOLD,sc:4}); scene('av_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:42}); scene('av_burst',.6,{x:F.x+F.w*.3,y:F.mid,n:8,r:44}); }],
    [2100,()=>{ scene('av_text',1.1,{st,txt:'HIPS NOT BACK',c:CREAM}); }],
    [3400,'end',res(E2)+'Perfect form. She checked.']]); };

// ---------- Red Pen (A1) ----------
// A test paper slaps onto the monster. A giant red marker writes a huge F and circles it. SEE ME AFTER CLASS.
SC.av_redf=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.paper) return;
  const w=P.w,h=P.h,x=F.x,y=F.mid; const g=ez((ms-P.paper)/220),out=ez((ms-P.peel)/400);
  gfx.globalAlpha=1-out; gfx.save(); gfx.translate(x,y+out*30); gfx.rotate(-.06+out*.4); gfx.scale(lerp(1.4,1,g),lerp(1.4,1,g));
  RO(-w/2,-h/2,w,h,CREAM); for(let k=0;k<6;k++) R(-w/2+6,-h/2+18+k*(h-24)/6,w-12,1,'#9fc4f0'); R(-w/2+10,-h/2,2,h,'#f0a0a0'); label('QUIZ',-w/2+20,-h/2+5,'#2b2a26',1);
  const fx0=-w*.18,ft=-h*.3,fb=h*.32,fr=w*.24,fm=-h*.02; const pt=[[fx0,ft,fx0,fb],[fx0,ft,fr,ft],[fx0,fm,fr*.75,fm]];
  let tip=null; pt.forEach(([a,b,c,d],k)=>{ const q=cl((ms-P.strokes[k])/220); if(q<=0) return; const ex=lerp(a,c,q),ey=lerp(b,d,q); Ln(a,b,ex,ey,9,PEN); if(q<1||k===2) tip=[ex,ey]; });
  if(ms>P.circle) { const q=ez((ms-P.circle)/300); gfx.strokeStyle=PEN; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(w*.02,0,w*.42,h*.44,-.1,-1.2,-1.2+q*Math.PI*2.1); gfx.stroke(); }
  gfx.restore();
  if(ms<P.pen) { // the giant marker, its tip on the stroke
    let tx=x,ty=y; if(tip) { tx=x+tip[0]; ty=y+tip[1]; } else if(ms>P.circle) { const q=ez((ms-P.circle)/300),an=-1.2+q*Math.PI*2.1; tx=x+w*.02+Math.cos(an)*w*.42; ty=y+Math.sin(an)*h*.44; } else { tx=x+w*.3; ty=y-h*.3; }
    gfx.globalAlpha=1; gfx.save(); gfx.translate(tx,ty); gfx.rotate(-.75); R(-8,-70,16,62,OUT); R(-6,-68,12,58,PEN); R(-6,-68,12,12,'#f4f0e6'); R(-4,-10,8,10,OUT); R(-2,-8,4,8,'#8a1a1a'); gfx.restore(); } };
A.red_pen=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const plan={paper:900,strokes:[1250,1550,1850],circle:2150,pen:2550,peel:3500,F,w:Math.round(cl(F.w*.95,64,110)),h:Math.round(cl(F.h*.9,72,120))};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'throw',dx:-6},{t:1100,f:'aim',dx:(u,tt)=>Math.sin(tt*14)*2},{t:2550,f:'hip'},{t:3200,f:back(p.x,me)},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over with a quiz and a very large red marker.'); say(m.id,'red_pen'); scene('av_redf',3.9,{plan}); }],
    [900,()=>{ sfx.splat?sfx.splat():sfx.thud(); setMessage('She slaps the quiz right onto it.'); }],
    [1250,()=>{ sfx.select(); }],[1550,()=>{ sfx.select(); }],[1850,()=>{ sfx.select(); }],
    ['hf',2150],
    [2150,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('av_big',1.4,{x:F.x,y:F.top-74,txt:'F',c:PEN,sc:6}); setMessage('A giant red F. Circled. Twice.'); }],
    [2600,()=>{ scene('av_text',1.4,{x:F.x,y:F.top-18,txt:'SEE ME AFTER CLASS',c:'#ff6a60'}); }],
    [4000,'end',res(E2)+'It will be seeing her after class.']]); };

// ---------- Hot Lunch Tray (A2) ----------
// A steaming cafeteria tray of soup for a friend. The cold melts off them. HOT LUNCH.
const lunch=(x,y,sc,t)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  poly([[-30,-6],[30,-6],[34,6],[-34,6]],TRAY); R(-26,-4,20,8,'#d88a3a'); R(4,-4,22,8,'#d88a3a');
  EO(-15,-6,11,5,CREAM); E(-15,-7,8,3,SOUP); EO(15,-6,6,4,'#d8a060'); EO(26,-10,4,4,'#e04040'); R(25,-16,2,4,'#5a3a1a');
  gfx.globalAlpha*=.8; for(let k=0;k<3;k++) { const q=(t*1.2+k/3)%1; gfx.strokeStyle='#ffffff'; gfx.lineWidth=3; gfx.beginPath(); for(let j=0;j<8;j++) { const yy=-12-j*4-q*14,xx=-21+k*6+Math.sin(j*.9+t*6+k)*3; j?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke(); }
  gfx.restore(); };
SC.av_lunch=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.94); let x,y,sc=1.1;
  if(ms<P.give) { const h=hand(); x=h.x-8; y=h.y-4; } else { const q=ez((ms-P.give)/300),h=hand(); x=lerp(h.x-8,P.x,q); y=lerp(h.y-4,P.y,q); sc=lerp(1.1,1.5,q); }
  lunch(x,y,sc,s.t); if(ms>P.give+300&&ms<P.give+1600) label('HOT',x-16,y-60,'#ffb45a',2); };
SC.av_melt=(s,u)=>{ for(let k=0;k<10;k++) { const q=cl(u*1.4-k*.04),x=s.x-s.w*.5+((k*37)%10)/10*s.w,y=s.top+((k*53)%10)/10*s.h*.8+q*20; gfx.globalAlpha=(1-q)*.9; R(x,y,6,6,'#cfeeff'); R(x+2,y+6,2,q*10,'#9fd8ff'); } };
A.hot_lunch_tray=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,26),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:'aim'},{t:1500,f:'sit',dy:2},{t:2700,f:'celeb',hop:8},{t:3100,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:sp.x<me.x?'walk':'walkR',hop:2,hn:6},{t:1100,x:sp.x,y:sp.y,f:'aim'},{t:1400,f:'throw',dx:-6},{t:2400,f:'celeb',hop:8},{t:2900,f:back(sp.x,me)},{t:3600,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),give=self?1500:1400,hit=give+400,end=self?3300:3800;
  const plan={give,x:self?me.x-30:H.x+H.w*.1,y:self?me.base-30:H.mid+6};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy grabs a hot lunch tray for herself. Teachers eat too.':'Amy carries a steaming cafeteria tray over to '+t.name+'. Careful, it is hot.'); say(m.id,'hot_lunch_tray'); scene('av_lunch',(end-100)/1000,{plan}); }],
    [give,()=>{ sfx.select(); setMessage('Tomato soup, a roll, an apple. The steam alone does it.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('av_glow',1,{x:H.x,y:H.mid,c:'#ffb45a'}); scene('av_melt',1.2,{x:H.x,top:H.top,w:H.w,h:H.h}); scene('av_big',1.2,{x:H.x,y:H.top-60,txt:'HOT LUNCH!',c:'#ffb45a',sc:3}); hopOf(t!==m?t:null); }],
    [end,'end',kindLine(t,'Warm all the way through. Soup first, then recess.')]]); };

// ---------- Gold-Star Recess (A3, kept; bigger stars) ----------
// Same task card and DONE stamp; then huge gold stars rain down over the whole party and pop. RECESS.
SC.av_card=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); if(ms>P.done+900) return; gfx.globalAlpha=1; const x=h.x-16,y=h.y-34; gfx.save(); gfx.translate(x,y); gfx.scale(1.6,1.6); RO(-20,-14,40,28,CREAM); R(-16,-10,10,10,'#2b2a26'); R(-14,-8,6,6,CREAM); label('RECESS',6,-8,'#2b2a26',1);
  if(ms>P.done) { gfx.rotate(-.2); gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.strokeRect(-14,-2,28,12); label('DONE',0,1,RED,1); } gfx.restore(); };
SC.av_rain=(s,u)=>{ const n=s.n||22; for(let k=0;k<n;k++) { const d=(k*.07)%1*.5,q=cl((u-d)/.45); if(q<=0||q>=1) continue; const x=s.x0+((k*61)%100)/100*(s.x1-s.x0),y=lerp(-30,s.y1-((k*29)%40),Math.min(1,q/.7));
  const pop=q>.7?ez((q-.7)/.3):0; gfx.globalAlpha=1-pop; star(x,y,(12+(k%3)*4)*(1+pop*.6),k%3?GOLD:GOLD2,s.t*3+k); } };
A.goldstar_recess=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const sx=foe?front(U[0],40).x:Math.max(40,Math.min(...U.map(q=>q.x-q.w*.5))-26),sy=foe?front(U[0],40).y:Math.min(316,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+14);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(sx,me)},{t:800,x:sx,y:sy,f:'aim'},{t:1500,f:'act',dx:-6},{t:1900,f:'celeb',hop:12,hn:2},{t:2700,f:'spread'},{t:3300,f:'hip'},{t:3600,f:back(sx,me)},{t:4300,x:'home',y:'home',f:'idle'}]);
  const x0=Math.max(10,Math.min(...U.map(q=>q.x-q.w*.6))),x1=Math.min(566,Math.max(...U.map(q=>q.x+q.w*.6))),y1=Math.max(...U.map(q=>q.base));
  ST.play(E2,[
    [0,()=>{ setMessage('Amy runs over with a task card. One empty box: RECESS.'); say(m.id,'goldstar_recess'); scene('av_card',2.6,{plan:{done:1500}}); }],
    [1500,()=>{ sfx.thud(); setMessage('She stamps DONE over the empty box.'); }],
    ['hf',1900],
    [1900,()=>{ E2.apply(); sfx.levelUp(); scene('av_rain',2.2,{x0,x1,y1,n:24}); scene('av_big',1.6,{x:(x0+x1)/2,y:Math.min(...U.map(q=>q.top))-40,txt:'RECESS!',c:GOLD,sc:4});
      for(const q of who) { const P=ST.unit(q); scene('av_glow',1.1,{x:P.x,y:P.mid,c:GOLD}); hopOf(q!==m?q:null); } }],
    [2500,()=>{ sfx.ding(); setMessage(foe?'Gold stars everywhere. Even '+foe.name+' gets a few.':'Gold stars for everybody. Rest counts as good work.'); for(const q of who) { const P=ST.unit(q); scene('av_burst',.8,{x:P.x,y:P.top-6,n:6,r:30,c:GOLD2}); } }],
    [4400,'end',foe?kindLine(foe):'The assignment is to stop for a moment.']]); };

// ---------- Inside Voices! (A4; Eyes Up Front numbers) ----------
// She marches to the row and flicks the lights off and on. Then the teacher clap. The whole row goes silent.
SC.av_lights=(s,u)=>{ const ms=s.t*1000,P=s.plan; const off=P.flicks.some(([a,b])=>ms>=a&&ms<b); if(off) { gfx.globalAlpha=.78; R(0,0,576,324,'#0a0c18'); }
  const x=P.sx,y=P.sy; gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(1.7,1.7); RO(-14,-20,28,40,'#f4f0e6'); R(-4,-12,8,24,'#c9c2b8'); RO(-4,off?0:-12,8,12,'#ffffff'); gfx.restore(); if(ms<P.flicks[P.flicks.length-1][1]+200) bigWord(off?'OFF':'ON',x,y-50,CREAM,2); };
SC.av_claps=(s,u)=>{ const ms=s.t*1000,P=s.plan; P.claps.forEach((c,k)=>{ const q=(ms-c)/450; if(q<0||q>1) return; const h=head(P.st,8); gfx.globalAlpha=1-q; bigWord('CLAP',h.x-30+(k%2)*60,h.y-q*20-k*4,GOLD,2); ring(h.x,h.y+30,10+q*30,8+q*22,3,CREAM); }); };
SC.av_hush=(s,u)=>{ for(const q of s.list) { const x=q.x,y=q.top-22; gfx.globalAlpha=fin(u,.15)*fade(u,.8); RO(x-18,y-10,36,18,CREAM); label('...',x+1,y-6,'#2b2a26',2); R(x-4,y+8,6,4,CREAM); } };
A.inside_voices=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,60),me=ST.unit(m);
  const plan={flicks:[[1100,1350],[1550,1800]],claps:[2050,2300,2550,2700,2850],sx:Math.min(552,p.x+52),sy:Math.max(50,p.y-AH()*.95)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'hip'},{t:1000,f:'celeb2'},{t:1950,f:'hip'},
    {t:2050,f:(u,tt)=>Math.floor(tt*8)%2?'clap':'spread'},{t:2950,f:'aim'},{t:3500,f:back(p.x,me)},{t:4200,x:'home',y:'home',f:'idle'}]);
  plan.st=st;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy marches over to the light switch.'); say(m.id,'inside_voices'); scene('av_lights',3.4,{plan}); scene('av_claps',3.4,{plan}); }],
    [1100,()=>{ sfx.click&&sfx.click(); setMessage('Lights off. Lights on. Lights off. Lights on.'); }],[1350,()=>{ sfx.click&&sfx.click(); }],[1550,()=>{ sfx.click&&sfx.click(); }],[1800,()=>{ sfx.click&&sfx.click(); }],
    [2050,()=>{ clap(); setMessage('The teacher clap. Clap, clap, clap-clap-clap.'); }],[2300,()=>clap()],[2550,()=>clap()],[2700,()=>clap()],[2850,()=>clap()],
    ['hf',2950],
    [2950,()=>{ E2.apply(); sfx.stun(); for(const f of list) ST.jolt(f,.2); scene('av_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'INSIDE VOICES!',c:GOLD,sc:3}); scene('av_hush',1.4,{list:list.map(f=>ST.foe(f))}); }],
    [3300,()=>{ setMessage('Every one of them stops. She waits anyway.'); }],
    [4300,'end','The room suddenly remembers its manners.']]); };

// ---------- Pop Quiz (A5; A Better Question numbers) ----------
// POP QUIZ! A huge stapled test packet drops out of the sky and slams onto the monster.
SC.av_packet=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.drop) return; const w=P.w,h=P.h;
  const q=cl((ms-P.drop)/(P.hit-P.drop)),y=ms<P.hit?lerp(-h,F.top-h*.3,q*q):F.top-h*.3+Math.min(8,(ms-P.hit)*.03),sq=ms>P.hit?Math.max(0,1-(ms-P.hit)/200)*.25:0;
  gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(F.x,y+h/2); gfx.rotate(-.08); gfx.scale(1+sq,1-sq);
  for(let k=3;k>=1;k--) RO(-w/2+k*4,-h/2+k*4,w,h,'#e8e2d4'); RO(-w/2,-h/2,w,h,CREAM); R(-w/2+8,-h/2+6,6,4,'#9aa3a8');
  bigWord('POP QUIZ',0,-h/2+12,PEN,2); for(let k=0;k<5;k++) { const yy=-h/2+34+k*(h-44)/5; RO(-w/2+10,yy,6,6,CREAM); R(-w/2+22,yy+2,w-34,2,'#9aa3a8'); } gfx.restore(); };
SC.av_pencils=(s,u)=>{ for(let k=0;k<6;k++) { const a=-Math.PI*.15-k*Math.PI*.14,d=ez(u)*70,x=s.x+Math.cos(a)*d*1.3,y=s.y+Math.sin(a)*d-Math.sin(u*Math.PI)*20+u*u*40;
  gfx.globalAlpha=1-u*u; gfx.save(); gfx.translate(x,y); gfx.rotate(u*10+k); R(-12,-3,24,6,OUT); R(-10,-2,18,4,'#ffd23a'); R(8,-2,3,4,'#f0a0a0'); gfx.restore(); } };
A.pop_quiz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const plan={drop:1300,hit:1750,F,w:Math.round(cl(F.w*1.15,80,130)),h:Math.round(cl(F.w*1.4,96,150))};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'celeb2'},{t:1100,f:'celeb',hop:16},{t:1500,f:'throw',dx:-8},{t:2100,f:'hip'},{t:2900,f:'clap'},{t:3200,f:back(p.x,me)},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints over. Clear your desks.'); say(m.id,'pop_quiz'); scene('av_packet',3.2,{plan}); }],
    [800,()=>{ scene('av_big',1.0,{st,txt:'POP QUIZ!',c:GOLD,sc:3}); sfx.jumpWhistle?sfx.jumpWhistle():sfx.whoosh(); }],
    [1300,()=>{ sfx.slideWhistle?sfx.slideWhistle():sfx.whoosh(); setMessage('A very thick test packet drops out of the sky.'); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('av_dust',.6,{x:F.x,y:F.base,r:50}); scene('av_pencils',.9,{x:F.x,y:F.top}); scene('av_text',1.2,{x:F.x,y:F.top-90,txt:'NO TALKING',c:CREAM}); }],
    [2600,()=>{ if(girls.length) { for(const g of girls) { const q=ST.unit(g); scene('av_hearts',1,{x:q.x,y:q.top}); battle.fx[g.idx].hop=.3; } sfx.select(); setMessage(girls.map(g=>g.name).join(' and ')+' already know every answer.'); } else setMessage('It did not study.'); }],
    [4000,'end',res(E2)+'Pencils down.']]); };

// ---------- Burpee Blitz (B1; Lace, Then Race numbers) ----------
// Three real burpees right in front of it (squat, plank, squat, jump), counting down, then the last jump is an uppercut.
const PL=()=>AH()*.42;
SC.av_count=(s,u)=>{ const ms=s.t*1000,P=s.plan; P.marks.forEach(([t0,txt])=>{ const q=(ms-t0)/500; if(q<0||q>1) return; const h=head(P.st,-10); gfx.globalAlpha=1-q*q; bigWord(txt,h.x,h.y-ez(q)*16,GOLD,3); }); };
A.burpee_blitz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,52),k=front(F,10),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'idle'}]; let t=800; const marks=[],nums=['3','2','1'];
  for(let i=0;i<3;i++) { K.push({t,f:'kneel'},{t:t+160,f:'kneel',rot:-1.5,dy:PL(),dx:-8},{t:t+380,f:'kneel'},{t:t+520,f:'celeb',hop:24}); marks.push([t+520,nums[i]]); t+=720; }
  const leap=t; K.push({t,f:'kneel'},{t:t+150,f:'act',hop:30,dx:u=>-ez(u)*6},{t:t+500,x:k.x,y:k.y,f:'celeb',hop:10},{t:t+900,f:back(k.x,me)},{t:t+1600,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=leap+450;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy drops right in front of it. Burpees.'); say(m.id,'burpee_blitz'); scene('av_count',(leap+400)/1000,{plan:{st,marks}}); }],
    ...marks.map(([ms])=>[ms,()=>{ sfx.thud(); scene('av_dust',.4,{x:st.x||p.x,y:p.y,r:22,n:6}); }]),
    [leap,()=>{ setMessage('The last one does not come back down where it started.'); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('av_big',1,{x:F.x,y:F.top-74,txt:'BURPEE!',c:GOLD,sc:4}); scene('av_burst',.6,{x:F.x+F.w*.3,y:F.mid,n:8,r:44}); }],
    [leap+1700,'end',res(E2)+'She is not even out of breath. She says.']]); };

// ---------- Hill Repeats (B2; Hill Math numbers) ----------
// A real hill heaves up out of the ground. She sprints up and down it three times, faster each time, then charges down onto them.
SC.av_hill=(s,u)=>{ const ms=s.t*1000,P=s.plan; const g=ez((ms-P.rise)/350)*(1-ez((ms-P.sink)/400)); if(g<=0) return; gfx.globalAlpha=1;
  const H=P.H*g,b=P.b; poly([[P.xa-18,b+6],[P.xm-12,b-H],[P.xm+12,b-H],[P.xb+18,b+6]],GREEN); gfx.globalAlpha=.6; poly([[P.xm-12,b-H+2],[P.xm+12,b-H+2],[P.xm+30,b-H*.5],[P.xm-6,b-H*.55]],GREEN2);
  gfx.globalAlpha=1; if(g>.6) { R(P.xm-1,b-H-26,3,24,OUT); poly([[P.xm+1,b-H-26],[P.xm+18,b-H-20],[P.xm+1,b-H-14]],RED); }
  P.reps.forEach(([t0,txt])=>{ const q=(ms-t0)/600; if(q<0||q>1) return; gfx.globalAlpha=1-q; bigWord(txt,P.xm,b-H-44-q*14,CREAM,2); }); };
A.hill_repeats=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),hitList=waveFoes().length?waveFoes():[f],nbs=hitList.filter(x=>x!==f);
  const b=Math.min(316,F.base+4),xa=Math.round(F.x+F.w*.5+6),xb=Math.min(552,xa+160),xm=Math.round((xa+xb)/2),Hh=80;
  const K=[{t:0,x:'home',y:'home',f:go(xb,me)},{t:700,x:xb,y:b}]; let t=700; const reps=[]; const legs=[[480,420],[400,340],[320,280]];
  legs.forEach(([up,dn],i)=>{ K.push({t,f:'run',ease:'lin'}); t+=up; K.push({t,x:xm,y:b-Hh,f:'celeb'}); reps.push([t,'REP '+(i+1)]); t+=90; K.push({t,f:'runR',ease:'lin'}); t+=dn; K.push({t,x:xb,y:b}); });
  K.push({t,f:'run',ease:'lin'}); t+=260; K.push({t,x:xm,y:b-Hh,f:'run',ease:'in'}); t+=260; const hit=t; K.push({t,x:xa+10,y:b,f:'act'},{t:t+400,f:'hip'},{t:t+900,f:back(xa,me)},{t:t+1700,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={rise:300,sink:hit+500,xa,xb,xm,b,H:Hh,reps};
  ST.play(E2,[
    [0,()=>{ setMessage('The ground heaves up into a real, steep hill.'); say(m.id,'hill_repeats'); scene('av_hill',(hit+1000)/1000,{plan}); sfx.thud(); }],
    [700,()=>{ setMessage('Amy sprints up it. And down. And up.'); sfx.run&&sfx.run(); }],
    ...reps.map(([ms])=>[ms,()=>sfx.select()]),
    [hit-520,()=>{ setMessage('Over the top this time. Straight down onto them.'); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.55); for(const n of nbs) ST.jolt(n,.35); landHit(100); scene('av_dust',.6,{x:F.x,y:F.base,r:60,n:12}); scene('av_big',1.2,{x:F.x,y:F.top-74,txt:'HILL REPEATS!',c:GOLD,sc:3}); }],
    [hit+1800,'end',res(E2)+'Three repeats and a bonus one. Of course.']]); };

// ---------- Oat Milk, Please (B3; Water-Station Truce numbers) ----------
// A cheese pizza slice and a milk carton roll up. Amy waves them off, NO THANKS, and hands the friend her oat milk latte.
const pizza=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); poly([[-22,-16],[22,-16],[0,26]],'#ffd24a'); R(-24,-20,48,8,OUT); R(-22,-18,44,5,'#c8843a'); E(-6,-4,4,3,'#ffb030'); E(7,2,3,3,'#ffb030');
  E(-6,-8,2,3,OUT); E(5,-8,2,3,OUT); gfx.restore(); };
const carton=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-14,-14,28,34,'#ffffff'); poly([[-14,-14],[0,-26],[14,-14]],'#f4f4f4'); R(-14,-2,28,10,'#4f86d8'); label('MILK',0,0,'#ffffff',1); E(-6,-9,2,3,OUT); E(5,-9,2,3,OUT); gfx.restore(); };
const latte=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); poly([[-11,-18],[11,-18],[8,18],[-8,18]],'#d8b48a'); R(-12,-24,24,7,OUT); R(-11,-23,22,5,'#ffffff'); R(3,-38,3,15,'#7ac06a');
  R(-10,-4,20,10,'#5a3a2a'); label('OAT',0,-2,CREAM,1); gfx.restore(); };
SC.av_dairy=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.roll) return; gfx.globalAlpha=1;
  const inQ=ez((ms-P.roll)/600),outQ=ez((ms-P.away)/500),off=-120;
  [[pizza,P.x-70,0],[carton,P.x-30,1]].forEach(([draw,x0,k])=>{ const x=lerp(x0+off,x0,inQ)+lerp(0,off-60,outQ),y=P.y-22-Math.abs(Math.sin((ms/1000)*9+k))*8; draw(x,y,ms<P.away?Math.sin(ms/90+k)*.25:-(ms-P.away)/80);
    if(ms>P.no&&ms<P.away+300) { const q=ez((ms-P.no)/200); gfx.save(); gfx.translate(x,y-4); gfx.scale(q,q); LnO(-16,-16,16,16,5,RED); LnO(16,-16,-16,16,5,RED); gfx.restore(); } }); };
SC.av_latte=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.done) return; gfx.globalAlpha=1; let x,y,sc=1.2;
  if(ms<P.give) { const h=hand(); x=h.x-6; y=h.y-14; } else { const q=ez((ms-P.give)/300),h=hand(); x=lerp(h.x-6,P.tx,q); y=lerp(h.y-14,P.ty,q); sc=lerp(1.2,1.6,q); }
  if(ms>P.show) latte(x,y,sc); };
A.oat_milk_please=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const sx=self?me.x:sp.x,sy=self?me.base:sp.y,end=self?4000:4500;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'}]:[{t:0,x:'home',y:'home',f:go(sp.x,me)},{t:800,x:sp.x,y:sp.y,f:'idle'}];
  K.push({t:1500,f:'hip'},{t:1700,f:'spread',dx:(u,tt)=>Math.sin(tt*18)*3},{t:2600,f:'aim'},{t:2900,f:'throw',dx:-6},{t:3300,f:'celeb',hop:8},{t:3700,f:self?'idle':back(sx,me)});
  if(!self) K.push({t:4400,x:'home',y:'home',f:'idle'}); else K.push({t:4000,f:'idle'});
  ST.keys(fx,K);
  const plan={roll:900,no:1700,away:2300,x:sx-20,y:sy},lp={show:2500,give:2900,done:end-200,tx:self?me.x-26:H.x+H.w*.15,ty:self?me.base-50:H.mid};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy reaches for something to drink.':'Amy jogs over to '+t.name+' with a drink.'); say(m.id,'oat_milk_please'); scene('av_dairy',2.9,{plan}); scene('av_latte',end/1000,{plan:lp}); }],
    [900,()=>{ sfx.boing?sfx.boing():sfx.select(); setMessage('A cheese pizza and a milk carton roll right up to her.'); }],
    [1700,()=>{ sfx.nope?sfx.nope():sfx.select(); scene('av_big',1,{x:sx-50,y:sy-AH()-24,txt:'NO THANKS!',c:'#ff6a60',sc:3}); setMessage('She waves them off. Firmly. Very firmly.'); }],
    [2300,()=>{ sfx.whoosh(); }],
    [2500,()=>{ setMessage('Out comes her oat milk latte instead.'); }],
    ['hf',3200],
    [3200,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('av_glow',1,{x:H.x,y:H.mid,c:'#f0d8b0'}); scene('av_text',1.2,{x:H.x,y:H.top-30,txt:'AHH',c:CREAM}); hopOf(t!==m?t:null); }],
    [end,'end',kindLine(t,'Dairy-free and delicious. She was right.')]]); };

// ---------- False Start (B4, kept; big line and blocks) ----------
// Huge starting blocks and a fat white START line under the monster. It leans early. She blows the whistle and sends it back.
SC.av_start=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.on) return; const g=ez((ms-P.on)/250); gfx.globalAlpha=fade(u,.94);
  const lx=F.x-F.w*.5-20,lw=F.w+60,by=F.base; RO(lx,by+2,lw*g,10,'#ffffff'); if(g>.9) label('START',lx+lw/2,by+16,CREAM,2);
  gfx.save(); gfx.translate(F.x+F.w*.5+14,by); gfx.scale(g*2.2,g*2.2); poly([[-10,0],[-10,-8],[0,-2],[0,0]],'#d84a3a'); poly([[2,0],[2,-10],[12,-3],[12,0]],'#d84a3a'); R(-12,0,26,3,'#9aa3a8'); gfx.restore();
  if(ms>P.lean&&ms<P.hit) lift(P.f,0,-.25*ez((ms-P.lean)/200),-10*ez((ms-P.lean)/200));
  if(ms>P.hit&&ms<P.hit+900) { const q=ez((ms-P.hit)/400); lift(P.f,0,lerp(-.25,0,q),lerp(-10,22,q)*(1-ez((ms-P.hit-500)/400))); } };
SC.av_flag=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.9); R(h.x-6,h.y-50,3,48,OUT); poly([[h.x-4,h.y-50],[h.x-38,h.y-44],[h.x-4,h.y-30]],RED); };
A.false_start=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,58),me=ST.unit(m);
  const plan={on:300,lean:900,hit:1600,F,f};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'hip'},{t:500,f:go(p.x,me)},{t:1200,x:p.x,y:p.y,f:'aim'},{t:1600,f:'throw',dx:-10},{t:2100,f:'aim',dx:(u,tt)=>Math.sin(tt*10)*2},{t:2900,f:back(p.x,me)},{t:3600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A big white start line and starting blocks appear under it.'); say(m.id,'false_start'); scene('av_start',3.5,{plan}); sfx.thud(); }],
    [900,()=>{ setMessage('It leans. Early. Amy is already sprinting over.'); sfx.whoosh(); }],
    [1200,()=>{ (sfx.jumpWhistle||sfx.select)(); scene('av_flag',1.8,{}); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('av_big',1.2,{x:F.x,y:F.top-74,txt:'FALSE START!',c:GOLD,sc:3}); }],
    [2100,()=>{ setMessage('She points at the line. Back behind it.'); }],
    [3700,'end',res(E2)+'The enemy is sent back to its starting block.']]); };

// ---------- Negative Split (B5; Shakeout Mile numbers) ----------
// Stopwatch on. First half: an easy jog. Second half: a flat-out sprint with speed lines. The whole party picks it up with her.
SC.av_watch=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(st.x==null) return;
  if(ms<P.go+400) { const h=hand(); gfx.globalAlpha=1; EO(h.x-6,h.y-14,10,10,'#e8e4dc'); R(h.x-8,h.y-28,5,4,OUT); const a=ms/300; Ln(h.x-6,h.y-14,h.x-6+Math.cos(a)*7,h.y-14+Math.sin(a)*7,2,OUT); }
  P.splits.forEach(([t0,txt,c])=>{ const q=(ms-t0)/1300; if(q<0||q>1) return; gfx.globalAlpha=1-q*q; bigWord(txt,P.lx,P.ly-q*10,c,2); });
  if(ms>P.fast&&ms<P.fastEnd) { gfx.globalAlpha=.8; for(let k=0;k<5;k++) Ln(st.x-16-k*4,st.y-20-k*12,st.x-56-k*10,st.y-20-k*12,3,CREAM); } };
A.negative_split=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const lx=Math.max(30,Math.min(...U.map(q=>q.x-q.w*.5))-30),ly=Math.min(318,Math.max(...U.map(q=>q.base))+12),rx=556;
  const K=[{t:0,x:'home',y:'home',f:'aim'},{t:600,f:'walk',hop:2,hn:5},{t:2000,x:lx,y:ly,f:'hip'},{t:2200,f:'runR',ease:'in',hop:3,hn:4},{t:2800,x:rx,y:ly,f:'run'},{t:3100,x:'home',y:'home',f:'celeb',hop:10},{t:3600,f:'idle'}];
  const st=ST.keys(fx,K),hit=3100;
  const plan={st,go:600,fast:2200,fastEnd:2900,lx:(lx+rx)/2,ly:Math.max(60,Math.min(...U.map(q=>q.top))-30),splits:[[2000,'1ST HALF 4:12',CREAM],[2800,'2ND HALF 3:58',MINT]]};
  ST.play(E2,[
    [0,()=>{ setMessage('Amy clicks her stopwatch. First half: nice and easy.'); say(m.id,'negative_split'); scene('av_watch',3.6,{plan}); sfx.select(); }],
    [2000,()=>{ setMessage('Halfway. Now she speeds up.'); sfx.ding(); }],
    [2200,()=>{ sfx.whoosh(); sfx.run&&sfx.run(); if(!foe) who.filter(u=>u!==m).forEach((p,k)=>dance(p,1.2,(q,tt)=>({dx:Math.sin(tt*20+k)*2,dy:-Math.abs(Math.sin(tt*14+k))*8,frame:Math.floor(tt*10+k)%2?'run':'idle'}))); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); scene('av_big',1.3,{x:plan.lx,y:plan.ly-30,txt:'NEGATIVE SPLIT!',c:MINT,sc:3}); for(const q of who) { const P=ST.unit(q); scene('av_glow',.9,{x:P.x,y:P.mid,c:'#ffb45a'}); hopOf(q!==m?q:null); } }],
    [4300,'end',foe?kindLine(foe):'Faster in the second half. The party picks up the pace.']]); };
})();
