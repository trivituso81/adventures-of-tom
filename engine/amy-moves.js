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
    [1350,()=>{ scene('am_text',1,{st,txt:'ON THE MOVE',c:GOLD,sc:2}); setMessage('She\'s already jogging in place when it notices.'); }],
    [3300,'end',res(E2)+'Amy doesn\'t waste the first second.']]); };

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
    [0,()=>{ setMessage('Amy sets a pace slider between EASY and RACE. It\'s drifting toward RACE.'); say(m.id,'shakeout_mile'); scene('am_slider',2.2,{plan:{x:me.x-60,y:Math.max(30,me.top-20),push:400}}); scene('am_steps',(homeAt+1200)/1000,{st,from:1100,to:homeAt,list:[]}); }],
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
// Hill Repeats, Almond Milk, Please, False Start (big line and blocks), Negative Split. Same numbers as the slots they replace.
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
const bell=(x,y,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); if(PROPART.draw('amy/kettlebell',0,-5,{h:44})) { gfx.restore(); return; } ring(0,-16,9,9,9,OUT); ring(0,-16,9,9,5,IRON2); EO(0,0,15,14,IRON); E(-5,-5,5,4,IRON2); label('35',1,-2,CREAM,1); gfx.restore(); };
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
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'hike',dy:u=>ez(u)*6},{t:1350,f:'swingup',dy:6,dx:(u,tt)=>Math.sin(u*Math.PI*1.5)*4},{t:1500,f:'swingtop',dy:2},{t:1650,f:'throw',dx:u=>-ez(u)*10},
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
    [4000,'end',res(E2)+'It\'ll be seeing her after class.']]); };

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
    [0,()=>{ setMessage(self?'Amy grabs a hot lunch tray for herself. Teachers eat too.':'Amy carries a steaming cafeteria tray over to '+t.name+'. Careful, it\'s hot.'); say(m.id,'hot_lunch_tray'); scene('av_lunch',(end-100)/1000,{plan}); }],
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
  bigWord('QUIZ',0,-h/2+12,PEN,2); for(let k=0;k<5;k++) { const yy=-h/2+34+k*(h-44)/5; RO(-w/2+10,yy,6,6,CREAM); R(-w/2+22,yy+2,w-34,2,'#9aa3a8'); } gfx.restore(); };
SC.av_pencils=(s,u)=>{ for(let k=0;k<6;k++) { const a=-Math.PI*.15-k*Math.PI*.14,d=ez(u)*70,x=s.x+Math.cos(a)*d*1.3,y=s.y+Math.sin(a)*d-Math.sin(u*Math.PI)*20+u*u*40;
  gfx.globalAlpha=1-u*u; gfx.save(); gfx.translate(x,y); gfx.rotate(u*10+k); R(-12,-3,24,6,OUT); R(-10,-2,18,4,'#ffd23a'); R(8,-2,3,4,'#f0a0a0'); gfx.restore(); } };
A.pop_quiz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const plan={drop:1300,hit:1750,F,w:Math.round(cl(F.w*1.15,80,130)),h:Math.round(cl(F.w*1.4,96,150))};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'celeb2'},{t:1100,f:'celeb',hop:16},{t:1500,f:'throw',dx:-8},{t:2100,f:'hip'},{t:2900,f:'clap'},{t:3200,f:back(p.x,me)},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints over. Clear your desks.'); say(m.id,'pop_quiz'); scene('av_packet',3.2,{plan}); }],
    [800,()=>{ scene('av_big',1.0,{st,txt:'SURPRISE QUIZ!',c:GOLD,sc:2}); sfx.jumpWhistle?sfx.jumpWhistle():sfx.whoosh(); }],
    [1300,()=>{ sfx.slideWhistle?sfx.slideWhistle():sfx.whoosh(); setMessage('A very thick test packet drops out of the sky.'); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('av_dust',.6,{x:F.x,y:F.base,r:50}); scene('av_pencils',.9,{x:F.x,y:F.top}); scene('av_text',1.2,{x:F.x,y:F.top-90,txt:'NO TALKING',c:CREAM}); }],
    [2600,()=>{ if(girls.length) { for(const g of girls) { const q=ST.unit(g); scene('av_hearts',1,{x:q.x,y:q.top}); battle.fx[g.idx].hop=.3; } sfx.select(); setMessage(girls.map(g=>g.name).join(' and ')+' already know every answer.'); } else setMessage('It didn\'t study.'); }],
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
    [leap,()=>{ setMessage('The last one doesn\'t come back down where it started.'); sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('av_big',1,{x:F.x,y:F.top-74,txt:'BURPEE!',c:GOLD,sc:4}); scene('av_burst',.6,{x:F.x+F.w*.3,y:F.mid,n:8,r:44}); }],
    [leap+1700,'end',res(E2)+'She\'s not even out of breath. She says.']]); };

// ---------- Hill Repeats (B2; Hill Math numbers) ----------
// A real hill heaves up out of the ground. She sprints up and down it three times, faster each time, then charges down onto them.
SC.av_hill=(s,u)=>{ const ms=s.t*1000,P=s.plan; const g=ez((ms-P.rise)/350)*(1-ez((ms-P.sink)/400)); if(g<=0) return; gfx.globalAlpha=1;
  const H=P.H*g,b=P.b; const hhp=H+38;
  if(!PROPART.draw('amy/hill_with_flag',P.xm,b+8-hhp/2,{w:P.xb-P.xa+48,h:hhp})) {
  poly([[P.xa-18,b+6],[P.xm-12,b-H],[P.xm+12,b-H],[P.xb+18,b+6]],GREEN); gfx.globalAlpha=.6; poly([[P.xm-12,b-H+2],[P.xm+12,b-H+2],[P.xm+30,b-H*.5],[P.xm-6,b-H*.55]],GREEN2);
  gfx.globalAlpha=1; if(g>.6) { R(P.xm-1,b-H-26,3,24,OUT); poly([[P.xm+1,b-H-26],[P.xm+18,b-H-20],[P.xm+1,b-H-14]],RED); } } gfx.globalAlpha=1;
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

// ---------- Almond Milk, Please (B3; Water-Station Truce numbers) ----------
// A cheese pizza slice and a milk carton roll up. Amy waves them off, NO THANKS, and hands the friend her almond milk latte.
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
A.oat_milk_please=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=(t===m?spotFor(m,t,30):{x:H.x-12,y:Math.min(316,H.base+30)}),self=t===m,me=ST.unit(m);
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
    [2500,()=>{ setMessage('Out comes her almond milk latte instead.'); }],
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

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// Amy's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// Amy for real. Detention Forever (A6): the last bell rings, a chalkboard slams down behind every enemy, she stands at a
// podium and taps her pointer three times, the wall clock is about to hit 3:00 and she winds it back an hour (ONE MORE HOUR),
// giant chalk writes I WILL NOT CAUSE FRICTION for them, SEE ME, and the board blows apart in erasers, chalk dust and red-pen
// report cards; every enemy is circled in red ink and the apple on her podium pops into +3 VP for the party. Boston Qualifier
// (B6): a blue-and-yellow FINISH arch and crowd barriers at the far side, Amy checks her watch, KICK NOW!, the whole family
// sprints with her straight through the enemies (they spin like bowling pins), she breaks the tape with her chest, confetti
// cannons, and everyone jogs home wrapped in foil finisher blankets. Scenes prefix a5_ (no warp). BAR=24 letterbox and inBox().
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
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',SKY='#9fd8ff',MINT='#8ef0a0',VPB='#86a9ff';
const BOARD='#2f5a3e',BOARD2='#3c6e4c',WOOD='#9a6a3a',WOOD2='#c48a4a',WOOD3='#6e4824',BRASS='#e0b040',BRASS2='#fff0a0',CHALK='#f2f2ea';
const BLUE='#1f4fae',YEL='#ffd23a',FOIL='#d8dee8',FOIL2='#ffffff',FOIL3='#a8b2c2';
const CONF=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff','#ffffff'];
ST.nw('a5_');
if(!sfx.schoolBell) sfx.schoolBell=()=>{ for(let k=0;k<14;k++) tone({type:'square',f0:k%2?1180:1260,dur:.05,vol:.07,delay:k*.055,filter:3000}); };
if(!sfx.chalk) sfx.chalk=()=>{ noise({dur:.09,vol:.12,f0:5200,f1:3600,type:'bandpass',q:2}); };
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
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
SC.a5_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5);
  star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||CREAM),u*4+k); } gfx.globalAlpha=1; };
SC.a5_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); gfx.globalAlpha=1; };
// A party member who is not the actor, moved on its own path: fn(ms) returns {x,y} offsets from home, frame and rot.
// 'run'/'runR' resolve to the run cycle (left- or right-facing).
const jog=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur:dur/1000,fn:(q,c)=>{ const r=fn(q*dur,c.t)||{};
  let fr=null; if(r.frame==='run'||r.frame==='runR') { const a=r.frame==='run'?c.sp.run:c.sp.runFlip; fr=a?a[Math.floor(c.t*12)%2]:c.sp.idle; } else if(r.frame) fr=c.sp[r.frame]||c.sp.idle;
  const [wx,wy]=ST.unwarp(c.origX+(r.dx||0),c.origBase+(r.dy||0)); return {cx:wx,base:wy,rot:r.rot||0,frame:fr}; }}; };

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
SC.a5_pointer=(s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0; if(ms<P.tap0-150||ms>P.pointEnd) return; const h=hand(),L=74; let a;
  const tapK=P.taps.findIndex(t=>ms>=t-160&&ms<t+120);
  // angles run past PI so the stick swings through the left: raised 3.98 (up-left), tap 2.95 (down-left onto the podium)
  if(ms<P.clockPoint) { if(tapK>=0) { const t=P.taps[tapK],q=ms<t?1-(t-ms)/160:1-(ms-t)/120; a=lerp(3.98,2.95,1-q); } else a=3.98; }
  else if(ms<P.see) { a=Math.atan2(P.clock.y-h.y,P.clock.x-h.x)+Math.sin(ms/120)*.04; if(a<0) a+=Math.PI*2; }
  else a=Math.PI+.12+Math.sin(ms/90)*.05;
  const tx=h.x+Math.cos(a)*L,ty=h.y+Math.sin(a)*L; { const ps=L/210,r=a+.785,ox=.46*160*ps,oy=-.46*160*ps; if(!PROPART.draw('amy/pointer_stick',h.x+ox*Math.cos(r)-oy*Math.sin(r),h.y+ox*Math.sin(r)+oy*Math.cos(r),{h:160*ps,rot:r})) { LnO(h.x,h.y,tx,ty,3,'#c8a070'); E(tx,ty,2.5,2.5,RED); } }
  P.taps.forEach(t=>{ const q=(ms-t)/420; if(q<0||q>1) return; gfx.globalAlpha=1-q; bigWord('TAP',P.px-8,P.py-82-q*14,CREAM,2); gfx.globalAlpha=1; }); };
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
A.detention_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m);
  // the board: behind the enemies, at least wide enough for the lines at 2x
  let x0=Math.max(10,Math.round(Gp.x0-24)),x1=Math.min(340,Math.round(Gp.x1+24)); if(x1-x0<224) { const c=(x0+x1)/2; x0=Math.max(10,Math.round(c-112)); x1=Math.min(340,x0+224); }
  const lsc=x1-x0>=214?2:1,B={x0,x1,y0:BAR+8,y1:Math.max(BAR+110,Math.round(Gp.base-26)),lx:x0+8};
  const spot={x:Math.min(548,Math.round(Gp.x1+78)),y:Math.min(310,Math.round(Gp.base+8))};
  const P={t0:0,B,lsc,drop:250,podium:650,tap0:1100,taps:[1100,1300,1500],clockPoint:1700,spin0:1950,spin1:2400,write0:2450,writeDur:900,see:3650,pointEnd:4000,boom:4000,apple:4500,
    clock:{x:Math.min(x1+26,372),y:BAR+30},px:spot.x-30,py:spot.y};
  const bell={x:Math.min(P.clock.x+40,420),y:BAR+28};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:spot.x<me.x?'run':'runR'},{t:650,x:spot.x,y:spot.y,f:'hip'},{t:1000,f:'aim'},{t:1700,f:'aim',dx:(u,tt)=>Math.sin(tt*10)*1.5},
    {t:2450,f:'hip'},{t:3650,f:'aim',dx:u=>-ez(u)*6},{t:4000,f:'celeb2',hop:6},{t:4500,f:'clap'},{t:5100,f:'hip'},{t:5500,f:spot.x<me.x?'runR':'run'},{t:6200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('a5_bars',6.6,{}); scene('a5_bell',1.4,{x:bell.x,y:bell.y}); sfx.schoolBell(); b7Later(()=>sfx.schoolBell(),800); say(m.id,'detention_ult');
      scene('a5_big',1,{x:bell.x,y:bell.y+48,txt:'RRRRING!',c:BRASS2,sc:3}); setMessage('The last bell of the day rings. Nobody is going home.'); }],
    [250,()=>{ scene('a5_board',4.0,{plan:P,t0:250,back:true}); scene('a5_clock',3.85,{plan:P,t0:250}); scene('a5_lines',3.85,{plan:P,t0:250}); }],
    [470,()=>{ (sfx.clang||sfx.thud)(); sfx.thud(); for(const f of list) ST.jolt(f,.3); setMessage('A chalkboard slams down behind every one of them.'); }],
    [650,()=>{ scene('a5_podium',5.0,{plan:P,t0:650}); scene('a5_pointer',3.4,{plan:P,t0:650}); sfx.thud(); }],
    [1100,()=>{ (sfx.click||sfx.select)(); setMessage('Amy taps her pointer. Three times. Eyes up here.'); }],[1300,()=>(sfx.click||sfx.select)()],[1500,()=>(sfx.click||sfx.select)()],
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
SC.a5_watch=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.85); EO(h.x-8,h.y-16,11,11,'#e8e4dc'); R(h.x-10,h.y-31,5,4,OUT); ring(h.x-8,h.y-16,8,8,1.5,'#9aa3a8');
  const a=s.t*8; Ln(h.x-8,h.y-16,h.x-8+Math.cos(a)*7,h.y-16+Math.sin(a)*7,2,RED); gfx.globalAlpha=1; };
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
A.marathon_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m),others=party.filter(p=>p!==m);
  const U=party.map(p=>ST.unit(p)),minX=Math.min(...U.map(q=>q.x)),ly=Math.min(306,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length));
  const ax=Math.max(62,Math.min(100,Math.round(Gp.x0-6))),lead={x:Math.round(minX-46),y:ly},finish=ax-6;
  const RUN0=2300,RUN1=3300,dx=finish-lead.x,tape=RUN1-40;
  const P={ax,gy:ly,chest:Math.round(AH()*.58),cy:Math.max(BAR+70,Math.min(132,Math.round(Gp.top-10))),sign1:Math.round(lead.x-8),sign2:Math.round((lead.x+560)/2+30),cheer:RUN0,tape,t0:0,st:null,y0:Gp.top,y1:ly};
  const at=x=>RUN0+cl((lead.x-x)/(lead.x-finish))*(RUN1-RUN0);
  P.pins=list.map((f,k)=>{ const F=ST.foe(f); return {f,k,t:at(F.x+F.w*.25)}; });
  const hit=Math.round(at(Gp.x));
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:lead.x<me.x?'run':'runR'},{t:700,x:lead.x,y:lead.y,f:'aim'},{t:1300,f:'celeb2',hop:10},{t:1700,f:'run',dx:(u,tt)=>Math.sin(tt*14)*1.5,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},
    {t:RUN0,f:'run',ease:'lin'},{t:RUN1,x:finish,y:lead.y,f:'celeb',hop:16},{t:3700,f:'celeb',hop:6},{t:3800,f:'runR'},{t:4700,x:'home',y:'home',f:'celeb',hop:10},{t:5300,f:'clap'},{t:6000,f:'idle'}]);
  P.st=st;
  // everyone else: jog in place on KICK NOW!, then the same sprint (same distance), then jog home
  for(const p of others) { const k=p.idx; jog(p,4700,(ms,tt)=>{
    if(ms<1700) return {};
    if(ms<RUN0) return {frame:'run',dx:Math.sin(tt*14+k)*1.5,dy:-Math.abs(Math.sin(tt*14+k))*4};
    if(ms<RUN1) { const q=(ms-RUN0)/(RUN1-RUN0); return {frame:'run',dx:dx*q,dy:-Math.abs(Math.sin(tt*16+k))*3}; }
    if(ms<3800) return {dx,frame:'celeb',dy:-Math.abs(Math.sin((ms-RUN1)/500*Math.PI))*10};
    const q=ez((ms-3800)/900); return {frame:q<1?'runR':null,dx:dx*(1-q),dy:-Math.abs(Math.sin(tt*12+k))*3*(1-q)}; }); }
  ST.play(E2,[
    [0,()=>{ scene('a5_bars',6.6,{}); scene('a5_arch',6.5,{plan:P,back:true}); scene('a5_tape',4.4,{plan:P}); (sfx.cheer||sfx.whoosh)(); say(m.id,'marathon_ult');
      setMessage('Mile 26. A finish line pops up on the far side. The crowd goes wild.'); }],
    [700,()=>{ scene('a5_watch',.9,{}); (sfx.ting||sfx.select)(); scene('a5_big',1,{x:ax,y:BAR+80,txt:'MILE 26.2',c:YEL,sc:3}); setMessage('Amy checks her watch. She can still make her qualifying time.'); }],
    [1300,()=>{ scene('a5_big',1,{st,txt:'KICK NOW!',c:GOLD,sc:3}); sfx.select(); setMessage('KICK NOW! The whole family lines up behind her.'); }],
    [RUN0,()=>{ sfx.fanfare(); (sfx.cheer||sfx.whoosh)(); sfx.run(); scene('a5_speed',(RUN1-RUN0+200)/1000,{plan:P}); scene('a5_bowl',2.0,{plan:Object.assign({},P,{t0:RUN0})});
      setMessage('They sprint. Straight through the middle of the enemies.'); }],
    ...P.pins.map(b=>[Math.round(b.t),()=>{ sfx.bonk(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('a5_flash',.3,{a:.4}); }],
    [tape,()=>{ sfx.fanfare(); (sfx.cheer||sfx.ding)(); sfx.bonk(); scene('a5_confetti',1.6,{ax,gy:ly}); scene('a5_flash',.3,{a:.4,c:YEL});
      scene('a5_big',1.4,{x:Math.max(140,ax+60),y:Gp.top-74,txt:'BOSTON QUALIFIER!',c:YEL,sc:3}); setMessage('Amy breaks the tape with her chest. Boston Qualifier!'); }],
    [3800,()=>{ setMessage('Everybody jogs it out. Hands on heads. Breathe.'); }],
    [4700,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); const FL=party.map(p=>[ST.unit(p),p.id]); scene('a5_foilB',1.7,{list:FL,back:true}); scene('a5_foil',1.7,{list:FL}); for(const p of party) { const q=ST.unit(p); scene('a5_glow',1,{x:q.x,y:q.mid,c:GOLD}); } }],
    [5300,()=>{ scene('a5_big',1,{st,txt:'WE QUALIFIED!',c:GOLD,sc:2}); setMessage('Foil blankets for the whole family. Personal bests all round.'); }],
    [6400,'end',()=>res(E2)+'She\'s already signing everyone up for next year.']]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Hot Lunch Tray: a bigger tray with tall rising steam. Inside Voices!: the whole screen flickers dark and light. Pop Quiz:
// a thick packet that slams down, PENCILS DOWN. Burpee Blitz: a burpee counter and a big final jump. Almond Milk, Please:
// bigger pizza and carton and a huge NO THANKS. False Start: big starting blocks and a big red flag. Negative Split: a
// stopwatch on screen and speed lines in the second half. Same numbers, same beats. Overrides SC.av_lunch, SC.av_lights,
// SC.av_packet, SC.av_dairy, SC.av_latte, SC.av_start, SC.av_flag, SC.av_watch, A.pop_quiz, A.burpee_blitz and
// A.oat_milk_please. Scenes prefix ap_.
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
const poly=(pts,c)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',RED='#e0402e',PEN='#d8343a',MINT='#8ef0a0',TRAY='#e8a04a',SOUP='#e8913a';
ST.nw('ap_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const spotFor=(m,t,gap=30)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:Math.min(316,u.base+3)}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const ASP=()=>BATTLE_SPRITES.amy,AH=()=>ASP().idle.length*ASP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-AH()*(st.sc||1)*.74+dy});
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const back=(x,me)=>x<me.x?'runR':'run';
const go=(x,me)=>x<me.x?'run':'runR';
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };

// ---------- Hot Lunch Tray: bigger tray, tall rising steam ----------
const tray=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  poly([[-30,-6],[30,-6],[34,6],[-34,6]],TRAY); R(-26,-4,20,8,'#d88a3a'); R(4,-4,22,8,'#d88a3a');
  EO(-15,-6,11,5,CREAM); E(-15,-7,8,3,SOUP); EO(15,-6,6,4,'#d8a060'); EO(26,-10,4,4,'#e04040'); R(25,-16,2,4,'#5a3a1a'); gfx.restore(); };
const steam=(x,y,t,h,w)=>{ for(let k=0;k<3;k++) { const q=(t*.9+k/3)%1; gfx.globalAlpha*=1; const a0=gfx.globalAlpha;
    for(const [lw,c,al] of [[w+4,'#c8d0d8',.35],[w,'#ffffff',.9]]) { gfx.globalAlpha=a0*al*Math.sin(Math.max(.05,1-q)*Math.PI*.5); gfx.strokeStyle=c; gfx.lineWidth=lw; gfx.lineCap='round'; gfx.beginPath();
      for(let j=0;j<12;j++) { const yy=y-j*h/12-q*h*.35,xx=x+(k-1)*w*2.2+Math.sin(j*.7+t*5+k*2)*w*1.1; j?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke(); } gfx.globalAlpha=a0; } };
SC.av_lunch=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.94); let x,y,sc=1.6;
  if(ms<P.give) { const h=hand(); x=h.x-12; y=h.y-4; } else { const q=ez((ms-P.give)/300),h=hand(); x=lerp(h.x-12,P.x,q); y=lerp(h.y-4,P.y,q); sc=lerp(1.6,2.3,q); }
  const a0=gfx.globalAlpha; steam(x-15*sc,y-10*sc,s.t,28*sc+20,3+sc*1.6); gfx.globalAlpha=a0; tray(x,y,sc);
  if(ms>P.give+300&&ms<P.give+1600) { gfx.globalAlpha=a0; bigWord('HOT',Math.max(30,x-58*sc/1.6),y-22,'#ffb45a',3); } };

// ---------- Inside Voices!: the whole screen flickers ----------
SC.av_lights=(s,u)=>{ const ms=s.t*1000,P=s.plan,fl=P.flicks; const k=fl.find(([a,b])=>ms>=a&&ms<b);
  if(k) { const d=ms-k[0]; gfx.globalAlpha=d<100?(Math.floor(d/33)%2?.45:.95):.93-Math.sin(ms/40)*.03; R(0,0,576,324,'#04050b'); }
  else for(const [a,b] of fl) { const d=ms-b; if(d>=0&&d<260) { gfx.globalAlpha=(1-d/260)*.6*(Math.floor(d/40)%2?.6:1); R(0,0,576,324,'#fffbe8'); } }
  const off=!!k,x=Math.max(40,P.sx-96),y=Math.max(56,P.sy-AH()*.15-40); gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(2.5,2.5); RO(-14,-20,28,40,'#f4f0e6'); R(-4,-12,8,24,'#c9c2b8'); RO(-4,off?0:-12,8,12,'#ffffff'); gfx.restore();
  if(ms<fl[fl.length-1][1]+300&&ms>fl[0][0]-100) bigWord(off?'OFF':'ON',Math.min(548,x+66),Math.max(20,y-10),off?'#9aa3a8':GOLD,3); };

// ---------- Pop Quiz: a thick packet slams down, PENCILS DOWN ----------
const PK=P=>({w:Math.round(P.w*1.25),h:Math.round(P.h*1.2)});
SC.av_packet=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.drop) return; const {w,h}=PK(P);
  const q=cl((ms-P.drop)/(P.hit-P.drop)),rest=F.top-h*.3,y=ms<P.hit?lerp(-h*1.2,rest,q*q):rest+Math.min(8,(ms-P.hit)*.03),sq=ms>P.hit?Math.max(0,1-(ms-P.hit)/220)*.3:0;
  gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(F.x,y+h/2); gfx.rotate(-.06); gfx.scale(1+sq,1-sq);
  for(let k=9;k>=1;k--) RO(-w/2+k*2.5,-h/2+k*3,w,h,k%2?'#e8e2d4':'#f4efe2');
  RO(-w/2,-h/2,w,h,CREAM); RO(-12,-h/2-8,24,14,'#2b2a26'); R(-8,-h/2-14,16,8,'#9aa3a8');
  bigWord('QUIZ',0,-h/2+12,PEN,3); label('50 PAGES',0,-h/2+34,'#5a5a60',2);
  for(let k=0;k<5;k++) { const yy=-h/2+52+k*(h-62)/5; RO(-w/2+12,yy,7,7,CREAM); R(-w/2+26,yy+2,w-40,2,'#9aa3a8'); } gfx.restore();
  if(ms>P.hit&&ms<P.hit+380) { const z=(ms-P.hit)/380; gfx.globalAlpha=1-z; for(let k=0;k<10;k++) { const a=Math.PI+k/9*Math.PI,d=w*.6+z*40; Ln(F.x+Math.cos(a)*d,F.base+Math.sin(a)*d*.35,F.x+Math.cos(a)*(d+20),F.base+Math.sin(a)*(d+20)*.35,4,CREAM); } } };
A.pop_quiz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const plan={drop:1300,hit:1750,F,w:Math.round(cl(F.w*1.15,80,130)),h:Math.round(cl(F.w*1.4,96,150))},top=F.top-PK(plan).h*.3;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'celeb2'},{t:1100,f:'celeb',hop:16},{t:1500,f:'throw',dx:-8},{t:2100,f:'hip'},{t:2900,f:'clap'},{t:3200,f:back(p.x,me)},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints over. Clear your desks.'); say(m.id,'pop_quiz'); scene('av_packet',3.2,{plan}); }],
    [800,()=>{ scene('av_big',1.0,{st,txt:'SURPRISE QUIZ!',c:GOLD,sc:2}); sfx.jumpWhistle?sfx.jumpWhistle():sfx.whoosh(); }],
    [1300,()=>{ sfx.slideWhistle?sfx.slideWhistle():sfx.whoosh(); setMessage('A very, very thick test packet drops out of the sky.'); }],
    ['hf',plan.hit],
    [plan.hit,()=>{ sfx.thud(); sfx.thud(); sfx.bonk(); ST.jolt(f,.7); landHit(100); scene('av_flash',.18,{a:.45}); scene('av_dust',.7,{x:F.x,y:F.base,r:70,n:14}); scene('av_pencils',.9,{x:F.x,y:F.top}); }],
    [plan.hit+250,()=>{ sfx.ding(); scene('av_big',1.5,{x:F.x,y:Math.min(F.top-74,top-14),txt:'PENCILS DOWN!',c:CREAM,sc:3}); setMessage('PENCILS DOWN.'); }],
    [2700,()=>{ if(girls.length) { for(const g of girls) { const q=ST.unit(g); scene('av_hearts',1,{x:q.x,y:q.top}); battle.fx[g.idx].hop=.3; } sfx.select(); setMessage(girls.map(g=>g.name).join(' and ')+' already know every answer.'); } else setMessage('It didn\'t study.'); }],
    [4000,'end',res(E2)+'Pencils down.']]); };

// ---------- Burpee Blitz: a counter and a big final jump ----------
const PL=()=>AH()*.42;
SC.ap_count=(s,u)=>{ const ms=s.t*1000,P=s.plan,n=P.marks.filter(([t0])=>ms>=t0).length; if(!n&&ms<P.show) return;
  const last=P.marks[n-1],pop=last?Math.max(0,1-(ms-last[0])/240):0,x=P.x,y=P.y,fin2=n>=P.marks.length;
  gfx.globalAlpha=fin(u,.04)*fade(u,.88); gfx.save(); gfx.translate(x,y); gfx.scale(1+pop*.3,1+pop*.3);
  RO(-50,-36,100,70,fin2?'#3a2a08':'#1c2230'); R(-46,-32,92,4,'#ffffff22'); label('BURPEES',0,-28,'#9db1cc',2);
  bigWord(String(n),0,-12,fin2?GOLD:CREAM,6); gfx.restore(); };
SC.ap_leap=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; gfx.globalAlpha=fade(u,.6)*.85; for(let k=0;k<6;k++) { const x=st.x-24+k*10,y0=st.y+8+(k%2)*10; Ln(x,y0,x,y0+30+(k%3)*12,3,k%2?CREAM:GOLD); } };
A.burpee_blitz=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,52),k=front(F,10),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'idle'}]; let t=800; const marks=[];
  for(let i=0;i<3;i++) { K.push({t,f:'kneel'},{t:t+160,f:'kneel',rot:-1.5,dy:PL(),dx:-8},{t:t+380,f:'kneel'},{t:t+520,f:'celeb',hop:24}); marks.push([t+520,String(i+1)]); t+=720; }
  const leap=t; marks.push([leap+200,'4']);
  K.push({t,f:'kneel',dy:u=>ez(u)*8},{t:t+200,f:'act',hop:110,dx:u=>-ez(u)*6},{t:t+700,x:k.x,y:k.y,f:'celeb',hop:10},{t:t+1100,f:back(k.x,me)},{t:t+1800,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=leap+450,bx=Math.min(522,Math.max(54,p.x+104)),by=44;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy drops right in front of it. Burpees. She\'s counting.'); say(m.id,'burpee_blitz'); scene('ap_count',(leap+1300)/1000,{plan:{marks,show:700,x:bx,y:by}}); }],
    ...marks.slice(0,3).map(([ms])=>[ms,()=>{ sfx.thud(); sfx.select(); scene('av_dust',.4,{x:st.x||p.x,y:p.y,r:22,n:6}); }]),
    [leap,()=>{ setMessage('Number four doesn\'t come back down where it started.'); sfx.whoosh(); }],
    [leap+200,()=>{ (sfx.jumpWhistle||sfx.whoosh)(); scene('ap_leap',.5,{st}); scene('av_dust',.6,{x:p.x,y:p.y,r:34,n:10}); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); sfx.ding(); ST.jolt(f,.65); landHit(100); scene('av_big',1.1,{x:F.x,y:F.top-74,txt:'BURPEE!',c:GOLD,sc:5}); scene('av_burst',.7,{x:F.x+F.w*.3,y:F.mid,n:10,r:56}); }],
    [leap+1900,'end',res(E2)+'She\'s not even out of breath. She says.']]); };

// ---------- Almond Milk, Please: bigger pizza and carton, a huge NO THANKS ----------
const DS=1.8;
const pizza=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(DS,DS);
  // a cheese pizza slice: outlined wedge, glossy orange cheese, a thick golden crust, pepperoni, bubbles and a drip
  poly([[-25,-19],[25,-19],[1,29]],OUT); poly([[-22,-16],[22,-16],[0,25]],'#f5b53c'); poly([[-16,-14],[16,-14],[0,16]],'#ffd35a');
  R(-26,-23,52,10,OUT); R(-24,-21,48,7,'#c98a3e'); R(-24,-21,48,2,'#e8b56a'); for(const cx of [-18,-9,0,9,18]) R(cx,-18,2,3,'#a86a2a');
  for(const [a2,b2] of [[-8,-6],[8,-4],[0,8]]) { EO(a2,b2,5,4.4,OUT); EO(a2,b2,4,3.4,'#c13a24'); E(a2-1.4,b2-1.2,1.4,1,'#e66a4e'); }
  for(const [a2,b2] of [[-3,-12],[12,-11],[-13,-11],[3,2]]) E(a2,b2,1.4,1.1,'#fff0a0');
  R(14,-12,3,10,'#ffd35a'); E(15.5,-2,2.4,2.2,'#ffd35a');
  E(-5,-9,1.6,2.4,OUT); E(5,-9,1.6,2.4,OUT);   // eyes: a very sure little pizza
  gfx.restore(); };
const carton=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(DS,DS);
  // a pint of milk: gable top with a fin, blue band, little cow spots and a real label
  poly([[-16,-14],[0,-30],[16,-14]],OUT); poly([[-13,-14],[0,-26],[13,-14]],'#e9edf6'); R(-2,-31,4,5,OUT); R(-1,-30,2,4,'#c6cfe0');
  RO(-15,-15,30,38,'#ffffff'); R(-13,-13,26,34,'#fbfcff'); R(-13,-13,5,34,'#e1e7f3'); R(-13,-1,26,12,'#3a74c9'); R(-13,-1,26,2,'#6a9ae0');
  label('MILK',0,3,'#ffffff',1);
  for(const [a2,b2,w2] of [[-9,-9,6],[3,-10,7],[7,15,5],[-10,14,6]]) { R(a2,b2,w2,4,'#2b2a26'); R(a2+1,b2+4,w2-2,2,'#2b2a26'); }
  E(-5,-5,1.6,2.4,OUT); E(5,-5,1.6,2.4,OUT);
  gfx.restore(); };
const latte=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); if(PROPART.draw('amy/oat_latte',0,-6,{h:58})) { gfx.restore(); return; }
  // an almond-milk latte in a tall glass: layers of espresso and milk, foam with latte art, a paper sleeve, a green straw,
  // a cookie on the saucer
  EO(0,22,16,4,OUT); EO(0,21,14,3,'#e8e2d4');
  poly([[-12,-18],[12,-18],[9,20],[-9,20]],OUT); poly([[-10,-16],[10,-16],[7,18],[-7,18]],'#e9dcc4');
  poly([[-8,-2],[8,-2],[7,18],[-7,18]],'#6b4226'); poly([[-9,-9],[9,-9],[8,-2],[-8,-2]],'#c79868'); R(-9,-16,18,6,'#f7f0e0');
  R(-6,-14,2,16,'#ffffff55'); E(0,-14,6,1.8,'#d9b98a'); R(-2,-15,4,2,'#8a5a30');
  R(-10,2,20,9,'#c28a52'); R(-10,2,20,1,'#d9a46a'); label('ALM',0,5,'#fff6e4',1);
  R(3,-38,3,26,OUT); R(4,-38,1.5,26,'#6ab85a'); R(1,-39,6,2,'#6ab85a');
  EO(15,22,4,2.6,OUT); EO(15,21,3,1.8,'#b98a4e');
  gfx.restore(); };
SC.av_dairy=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.roll) return; gfx.globalAlpha=1;
  const inQ=ez((ms-P.roll)/600),outQ=ez((ms-P.away)/500),off=-160;
  { const pxm=lerp(P.x-75+off,P.x-75,inQ)+lerp(0,off-90,outQ),pym=P.y-40-Math.abs(Math.sin((ms/1000)*9))*10;   // the grumpy pizza and milk as one painted pair
    if(PROPART.draw('amy/grumpy_lunch_pair',pxm,pym,{w:150,rot:ms<P.away?Math.sin(ms/90)*.12:-(ms-P.away)/80})) {
      if(ms>P.no&&ms<P.away+300) { const q=ez((ms-P.no)/200); gfx.save(); gfx.translate(pxm,pym-6); gfx.scale(q*3,q*3); LnO(-16,-16,16,16,5,RED); LnO(16,-16,-16,16,5,RED); gfx.restore(); }
      return; } }
  [[pizza,P.x-112,0],[carton,P.x-38,1]].forEach(([draw,x0,k])=>{ const x=lerp(x0+off,x0,inQ)+lerp(0,off-90,outQ),y=P.y-40-Math.abs(Math.sin((ms/1000)*9+k))*10; draw(x,y,ms<P.away?Math.sin(ms/90+k)*.25:-(ms-P.away)/80);
    if(ms>P.no&&ms<P.away+300) { const q=ez((ms-P.no)/200); gfx.save(); gfx.translate(x,y-6); gfx.scale(q*1.6,q*1.6); LnO(-16,-16,16,16,5,RED); LnO(16,-16,-16,16,5,RED); gfx.restore(); } }); };
SC.av_latte=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.done) return; gfx.globalAlpha=1; let x,y,sc=1.6;
  if(ms<P.give) { const h=hand(); x=h.x-8; y=h.y-18; } else { const q=ez((ms-P.give)/300),h=hand(); x=lerp(h.x-8,P.tx,q); y=lerp(h.y-18,P.ty,q); sc=lerp(1.6,2.2,q); }
  if(ms>P.show) latte(x,y,sc); };
// ---------- Almond Milk, Please: a carton of cow's milk appears, Amy boots it at the foes, then dairy-free treats for a friend ----------
// Painted frames mk_* (data/amy-hires-extra.js 'mk', art/chars/amy-mk.webp, wired in data/amy-hires-extra-use.js) and props amy/milk_* (art/props/amy).
// Kindness on a foe (kindFoe) skips the kick and goes straight to the latte. The kick is visual only: numbers, heal and spoken line are unchanged.
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
A.oat_milk_please=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=(t===m?spotFor(m,t,30):{x:H.x-12,y:Math.min(316,H.base+30)}),self=t===m,me=ST.unit(m);
  const kick=t.side!=='foe'&&b2LiveFoes().length>0,lf=b2LiveFoes().sort((a,b)=>ST.unit(b).x-ST.unit(a).x),live=lf.map(f=>ST.unit(f));
  const o=kick?4200:0,sx=self?me.x:sp.x,sy=self?me.base:sp.y;
  const lt=self?{show:100,give:400,apply:700,wink:800,rest:1400,end:1500}:{show:800,give:1050,apply:1300,wink:1400,back:1800,home:2400,end:2500},end=o+lt.end;
  const K=[];
  if(kick) K.push({t:0,x:'home',y:'home',f:'mk_spot'},{t:350,f:'mk_glare'},{t:700,f:'mk_nope'},{t:1050,f:'mk_line'},{t:1350,f:'mk_back'},{t:1600,f:'mk_windA'},{t:1800,f:'mk_windB'},
    {t:1950,f:'mk_kick'},{t:2150,f:'mk_follow'},{t:2400,f:'mk_balance'},{t:2650,f:'mk_watch'},{t:2850,f:'mk_goal',hop:6},{t:3250,f:'mk_laugh'},{t:3650,f:'mk_dust'},{t:3950,f:'mk_hair'});
  if(self) K.push({t:o,x:'home',y:'home',f:'aim'},{t:o+lt.give,f:'throw',dx:-6},{t:o+lt.wink,f:'mk_wink'},{t:o+lt.rest,x:'home',y:'home',f:'idle'});
  else K.push({t:o,x:'home',y:'home',f:go(sp.x,me)},{t:o+700,x:sp.x,y:sp.y,f:'idle'},{t:o+lt.show,f:'aim'},{t:o+lt.give,f:'throw',dx:-6},{t:o+lt.wink,f:'mk_wink'},{t:o+lt.back,f:back(sx,me)},{t:o+lt.home,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const lp={show:o+lt.show,give:o+lt.give,done:end-200,tx:self?me.x-26:H.x+H.w*.15,ty:self?me.base-50:H.mid};
  const F0=live[0]||{x:me.x-200,mid:me.base-60,w:60,h:90,base:me.base};
  const cp={pop:100,line:1050,kick:1980,hit:2750,x0:Math.max(30,me.x-62),y0:me.base-28,h:56,x1:F0.x+F0.w*.1,y1:F0.mid,arc:60};
  const sp2={ix:cp.x1,iy:cp.y1,bh:Math.min(130,Math.max(84,F0.h)),fade:1900,F:live.map((u2,k)=>({x:u2.x,w:u2.w,mid:u2.mid,base:u2.base,d:k*90,cw:Math.max(64,u2.w*1.05),sh:cl(u2.h*.62,32,80),pw:Math.max(70,u2.w*1.3),rot:(k%2?.25:-.2)}))};
  cp.onHit=()=>{ sfx.thud(); for(const f of lf) ST.jolt(f,.4); scene('mk_splash',3.2,{plan:sp2}); scene('mk_puddle',3.2,{plan:sp2,back:true}); scene('av_text',.9,{x:cp.x1,y:Math.max(40,cp.y1-60),txt:'SPLASH!',c:CREAM}); setMessage('The carton bursts. Every monster is now very damp and very dairy.'); };   // fired by the carton scene on arrival, so it stays in step with the flight
  const items=[[0,()=>{ say(m.id,'oat_milk_please'); scene('av_latte',end/1000,{plan:lp});
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

// ---------- False Start: big blocks, big red flag ----------
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
SC.av_start=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.on) return; const g=ez((ms-P.on)/250); gfx.globalAlpha=fade(u,.94);
  const lx=F.x-F.w*.5-30,lw=F.w+80,by=F.base; RO(lx,by+2,lw*g,14,'#ffffff'); if(g>.9) bigWord('START',lx+lw/2,by+22,CREAM,3);
  gfx.save(); gfx.translate(F.x-F.w*.5-6,by+2); gfx.scale(-g*3.4,g*3.4); poly([[-10,0],[-10,-8],[0,-2],[0,0]],'#d84a3a'); poly([[2,0],[2,-10],[12,-3],[12,0]],'#d84a3a'); R(-12,0,26,3,'#9aa3a8'); gfx.restore();
  if(ms>P.lean&&ms<P.hit) lift(P.f,0,-.25*ez((ms-P.lean)/200),-10*ez((ms-P.lean)/200));
  if(ms>P.hit&&ms<P.hit+900) { const q=ez((ms-P.hit)/400); lift(P.f,0,lerp(-.25,0,q),lerp(-10,22,q)*(1-ez((ms-P.hit-500)/400))); } };
SC.av_flag=(s,u)=>{ const h=hand(),t=s.t; gfx.globalAlpha=fade(u,.9); const px=h.x-4,top=h.y-104; RO(px-2,top,4,102,'#c9c2b8'); EO(px,top-2,4,4,GOLD);
  const pts=[]; for(let k=0;k<=8;k++) { const x=px-k*9,w=Math.sin(t*14-k*.8)*4*(k/8); pts.push([x,top+4+w]); } for(let k=8;k>=0;k--) { const x=px-k*9,w=Math.sin(t*14-k*.8)*4*(k/8); pts.push([x,top+46+w]); }
  poly(pts,RED); gfx.globalAlpha*=.35; R(px-60,top+10,50,6,'#ffffff'); };

// ---------- Negative Split: stopwatch on screen, speed lines ----------
SC.av_watch=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; if(st.x==null) return;
  if(P.y0==null) { const U=b2LiveParty().map(q=>ST.unit(q)); P.y0=Math.max(80,Math.min(...U.map(q=>q.top))-10); P.y1=Math.min(318,Math.max(...U.map(q=>q.base))+6); }
  const cx=288,cy=52,r=30,g=ez(ms/250)*(1-ez((ms-3300)/300)); if(g>0) { gfx.globalAlpha=g; gfx.save(); gfx.translate(cx,cy); gfx.scale(g,g);
    RO(-6,-r-14,12,10,'#9aa3a8'); RO(-3,-r-6,6,6,'#9aa3a8'); EO(0,0,r+4,r+4,'#c9c2b8'); EO(0,0,r-2,r-2,'#fffbe8');
    for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; Ln(Math.cos(a)*(r-8),Math.sin(a)*(r-8),Math.cos(a)*(r-4),Math.sin(a)*(r-4),2,OUT); }
    const fast=ms>P.fast,sec=ms<P.fast?ms/1000*1.1:(P.fast/1000*1.1+(ms-P.fast)/1000*4.4),a=-Math.PI/2+sec*Math.PI*2;
    Ln(0,0,Math.cos(a)*(r-6),Math.sin(a)*(r-6),3,fast?RED:OUT); E(0,0,3,3,OUT); gfx.restore();
    const tot=ms<P.fast?ms/P.fast*252:252+cl((ms-P.fast)/(P.fastEnd-P.fast))*238,mm=Math.floor(tot/60),ss=Math.floor(tot%60);
    bigWord(mm+':'+String(ss).padStart(2,'0'),cx+r+42,cy-6,fast?MINT:CREAM,3); bigWord(fast?'2ND HALF':'1ST HALF',cx-r-48,cy-4,fast?MINT:'#9db1cc',2); }
  if(ms<P.go+400) { const h=hand(); gfx.globalAlpha=1; EO(h.x-6,h.y-14,10,10,'#e8e4dc'); R(h.x-8,h.y-28,5,4,OUT); const a=ms/300; Ln(h.x-6,h.y-14,h.x-6+Math.cos(a)*7,h.y-14+Math.sin(a)*7,2,OUT); }
  P.splits.forEach(([t0,txt,c])=>{ const q=(ms-t0)/1300; if(q<0||q>1) return; gfx.globalAlpha=1-q*q; bigWord(txt,P.lx,P.ly-q*10,c,2); });
  if(ms>P.fast&&ms<P.fastEnd+250) { const a=ez((ms-P.fast)/150)*(1-ez((ms-P.fastEnd)/250)); for(let k=0;k<22;k++) { const q=((ms/260)+k*.137)%1,y=P.y0+((k*53)%100)/100*(P.y1-P.y0),x=lerp(620,-80,q),L=50+((k*31)%5)*20;
      gfx.globalAlpha=a*.75; Ln(x,y,x+L,y,k%3?3:5,k%4?CREAM:MINT); }
    gfx.globalAlpha=a*.9; for(let k=0;k<5;k++) Ln(st.x-18-k*4,st.y-24-k*12,st.x-70-k*12,st.y-24-k*12,4,CREAM); } };
})();
// ================= Family Move Lab custom scenes (2026-10-27, session 3) =================
// Tom's lab feedback (claude/family-lab-feedback.md): every move below is rebuilt as its own scene on
// data/recruit-poses.js frames (no rig warp). Numbers, costs and effects are unchanged. Scenes prefix a6_ (no warp).
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
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const A=RECRUIT_MOVES.amy;
const CREAM='#fff8e8',GOLD='#ffe08a',GOLD2='#ffc23a',RED='#e0402e',PEN='#d8343a',SKY='#9fd8ff',MINT='#8ef0a0',BLUE='#1f4fae',YEL='#ffd23a',WOOD='#9a6a3a',WOOD2='#c48a4a',WOOD3='#6e4824',TRACK='#c86a4a';
const CONF=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff','#ffffff'];
ST.nw('a6_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const foesOf=E2=>{ const l=foes(E2); return l.length?l:b2LiveFoes(); };
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
const clap=()=>{ (sfx.clap||sfx.bonk)(); };
const dance=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; let fr=null; if(r.frame==='run'||r.frame==='runR') { const a=r.frame==='run'?c.sp.run:c.sp.runFlip; fr=a?a[Math.floor(c.t*12)%2]:c.sp.idle; } else if(r.frame) fr=c.sp[r.frame]||c.sp.idle;
  const [wx,wy]=ST.unwarp(c.origX+(r.dx||0),c.origBase+(r.dy||0)); return {cx:wx,base:wy,rot:r.rot||0,frame:fr}; }}; };
if(!sfx.whistle) sfx.whistle=()=>{ for(let k=0;k<3;k++) tone({type:'square',f0:2400+k*60,f1:2600,dur:.1,vol:.09,delay:k*.11,filter:5000}); };
if(!sfx.click) sfx.click=()=>{ noise({dur:.03,vol:.18,f0:3000,f1:1500,type:'bandpass',q:4}); };
// Extra Amy frames for these scenes (IK arms on her own body; crouch ones use the kneel body).
const POSE={
  whistle:{nh:[-5,-6],fh:[1,8]},            // hand to mouth (whistle)
  shh:{nh:[-3,-8],fh:[2,8],lean:-2},        // finger to lips
  reach:{nh:[-7,-13],fh:[2,8],lean:-2},     // reaching up to a switch
  bend:{nh:[-8,12],fh:[-6,12],lean:-9},     // hands to the floor
  plank:{nh:[-13,1],fh:[-13,1]},            // arms straight (drawn turned on its side)
  pushup:{nh:[-6,3],fh:[-6,3]},             // arms bent (turned on its side)
  jump:{nh:[-11,-12],fh:[11,-12]},          // arms straight up
  write:{nh:[-13,-4],fh:[2,7],lean:-3},     // arm out, writing
  card:{nh:[-6,-13],fh:[2,8],lean:-1},      // holding a card up high
  carry:{nh:[-11,9],fh:[-9,9],lean:-1},     // both hands out, holding a tray
  hold:{nh:[-10,-2],fh:[-8,-2],lean:-2},    // both hands out, higher
  grab:{nh:[-13,0],fh:[-12,-2],lean:-5},    // leaning in, both hands grabbing
  pistol:{nh:[-2,-13],fh:[2,8]}             // arm straight up
};
// ---------- Burpee Blitz: Amy's burpee frames, rebuilt from Tom's reference sheet (data/amy-burpee.js) ----------
// squat (hinge, hands reaching), plant (palms on the floor), plank (high plank), pushup (chest to the floor), plank2 (pressed back up),
// tuck (feet jumped in, squat). Each frame faces left with its feet on the bottom row.
const burpeeFrames=()=>{ const sp=BATTLE_SPRITES.amy; if(sp.plank&&sp.plank.cut) return;
  for(const n in AMY_BURPEE) { const rows=AMY_BURPEE[n]; rows.cut=1; sp[n]=rows; sp.eyeAt.set(rows,{col:Math.round(rows[0].length*.28),row:Math.round(rows.length*.3)}); sp.handAt.set(rows,{n:[Math.round(rows[0].length*.3),rows.length-2],f:[Math.round(rows[0].length*.4),rows.length-2]}); } };
let posed=false; const poses=()=>{ if(posed) return; posed=true; for(const k in POSE) RECRUIT_POSES.add('amy',k,POSE[k]); burpeeFrames(); };   // data/recruit-poses.js loads after this file
// the standing body turned on its side (plank): the body's underside is about 23 px below the turn point
const PLANK_DY=40;
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
SC.a6_hearts=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.08); if(q<=0) continue; gfx.globalAlpha=1-q; const x=s.x-20+k*10+Math.sin(q*6+k)*5,y=s.y-q*44,r=5+(k%2)*2,c=k%2?'#ff9ac0':'#ff6b9a'; E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); PO([[x-r*1.05,y],[x,y+r*1.1],[x+r*1.05,y]],c,0); } gfx.globalAlpha=1; };
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
A.burpee_blitz=E2=>{ poses(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,56),k=front(F,12),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'hip'}]; let t=900; const marks=[],beats=[],PX=p.x,PY=p.y;
  // the plank lies with its head toward the monster: the turn point sits a little right of the standing spot
  const rep=(t0,last)=>{ K.push({t:t0,f:'squat',dy:u=>ez(u)*2},{t:t0+150,f:'plant',x:PX,y:PY+16},{t:t0+280,f:'plank',x:PX-8,y:PY+16,ease:'out'},{t:t0+440,f:'pushup',x:PX-8,y:PY+16},{t:t0+580,f:'plank2',x:PX-8,y:PY+16},{t:t0+720,f:'tuck',x:PX,y:PY+16,ease:'out'}); if(!last) K.push({t:t0+860,f:'bjump',x:PX,y:PY,hop:34}); beats.push([t0,'SQUAT'],[t0+150,'HANDS'],[t0+280,'PLANK'],[t0+440,'PUSH'],[t0+580,'UP'],[t0+720,'IN'],[t0+860,last?'LAST ONE':'JUMP!']); };
  for(let i=0;i<3;i++) { rep(t,false); marks.push([t+880,String(i+1)]); t+=1200; }
  rep(t,true); const leap=t+860; marks.push([leap+140,'4']);
  K.push({t:leap,f:'bjump',hop:120,x:k.x,y:k.y,ease:'lin',ns:1},{t:leap+520,x:k.x,y:k.y,f:'bjump',hop:8},{t:leap+950,f:'hip'},{t:leap+1250,f:back(k.x,me)},{t:leap+1950,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=leap+330,bx=Math.min(522,Math.max(54,p.x+100)),by=44;
  ST.play(E2,[
    [0,()=>{ setMessage('Amy drops right in front of it. Burpees. Real ones.'); say(m.id,'burpee_blitz'); scene('a6_count',(leap+1400)/1000,{plan:{marks,show:700,x:bx,y:by}}); scene('a6_beat',(leap+300)/1000,{plan:{beats,x:Math.max(60,Math.min(500,p.x-40)),y:Math.max(44,p.y-AH()-34)}}); }],
    ...beats.filter(b=>b[1]==='PLANK').map(([ms])=>[ms,()=>{ sfx.thud(); scene('a6_dust',.4,{x:p.x+40,y:p.y,r:26,n:6}); }]),
    ...beats.filter(b=>b[1]==='PUSH').map(([ms])=>[ms,()=>sfx.select()]),
    ...marks.slice(0,3).map(([ms])=>[ms,()=>{ (sfx.jumpWhistle||sfx.whoosh)(); scene('a6_dust',.4,{x:p.x,y:p.y,r:22,n:6}); }]),
    [1500,'Down, feet back, push-up, feet in, JUMP. She counts out loud.'],
    [leap-740,()=>{ setMessage('Number four doesn\'t come back down where it started.'); }],
    [leap,()=>{ (sfx.jumpWhistle||sfx.whoosh)(); sfx.whoosh(); scene('a6_leap',.5,{st}); scene('a6_dust',.6,{x:p.x,y:p.y,r:34,n:10}); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); sfx.ding(); ST.jolt(f,.65); landHit(100); scene('a6_big',1.1,{x:F.x,y:F.top-74,txt:'BURPEE!',c:GOLD,sc:5}); scene('a6_burst',.7,{x:F.x+F.w*.3,y:F.mid,n:10,r:56}); }],
    [leap+2000,'end',res(E2)+'She\'s not even out of breath. She says.']]); };

// ---------- PEP TALK: the whole body in it ----------
// She sprints out in front of the team, skids to a stop, blows the whistle, flexes, points at every one of them by name,
// squats and springs straight up with LET'S GO, claps the three-clap, and throws both arms up as the boost lands.
SC.a6_whistle=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.9); if(!PROPART.draw('amy/coach_whistle',h.x+1,h.y-9,{w:30})) { Ln(h.x+2,h.y-2,h.x+10,h.y-26,2,'#2b2a26'); EO(h.x-2,h.y+1,6,4,'#c9c2b8'); R(h.x-10,h.y-2,8,4,'#c9c2b8'); E(h.x-1,h.y,2,1.5,OUT); }
  if(s.blow) { const q=(s.t*1000)%500/500; gfx.globalAlpha=(1-q)*.9; for(let k=0;k<3;k++) { const d=6+q*26+k*8; Ln(h.x-14-d,h.y-4+(k-1)*8,h.x-18-d,h.y-4+(k-1)*8,3,CREAM); } } gfx.globalAlpha=1; };
SC.a6_callout=(s,u)=>{ const g=ez(u/.15),b=Math.sin(s.t*9)*3; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y+b); gfx.scale(g,g);
  PO([[0,-16],[12,-2],[5,-2],[5,10],[-5,10],[-5,-2],[-12,-2]],GOLD); gfx.restore(); bigWord(s.txt,s.x,s.y-36+b,GOLD,2); gfx.globalAlpha=1; };
SC.a6_claps=(s,u)=>{ const ms=s.t*1000,P=s.plan; P.claps.forEach((c,k)=>{ const q=(ms-c)/420; if(q<0||q>1) return; const h=head(P.st,10); gfx.globalAlpha=1-q; bigWord('CLAP',h.x-34+(k%2)*68,h.y-q*22-k*3,GOLD,2); ring(h.x,h.y+26,10+q*34,8+q*24,3,CREAM); }); gfx.globalAlpha=1; };
A.pepShow=E2=>{ poses(); const {m,fx}=E2,party=b2LiveParty(),others=party.filter(p=>p!==m),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const py=Math.min(316,Math.round(Math.max(...U.map(q=>q.base)))+16),px=Math.max(46,Math.round(Math.min(...U.map(q=>q.x-q.w*.5))-28));
  const K=[{t:0,x:'home',y:'home',f:go(px,me),hop:3,hn:3},{t:600,x:px+10,y:py,f:'hip',ease:'out'},{t:700,x:px,y:py,f:'whistle'},{t:1250,f:'flex',hop:7,hn:2},{t:1700,f:'hip'}];
  let t=1800; const visits=[];
  for(const o of others) { const q=ST.unit(o); visits.push([t,o,q]); K.push({t,f:'point',hop:5,dx:(u,tt)=>-ez(u)*6}); t+=420; }
  const squat=t,applyAt=t+360; K.push({t:squat,f:'bend',dy:u=>ez(u)*6},{t:applyAt,f:'jump',hop:40,ease:'out'},{t:applyAt+420,f:'clap',hop:3,hn:3},{t:applyAt+1050,f:'cheer',hop:6},{t:applyAt+1500,f:back(px,me),hop:3,hn:3},{t:applyAt+2100,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={st,claps:[applyAt+420,applyAt+640,applyAt+860]};
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints out in front of the whole team.'); say(m.id,'pep_talk'); }],
    [600,()=>{ sfx.thud(); scene('a6_dust',.5,{x:px+14,y:py,r:30,n:8}); }],
    [700,()=>{ sfx.whistle(); scene('a6_whistle',.55,{blow:true}); scene('a6_big',.9,{x:Math.max(90,px-60),y:py-AH()-30,txt:'FWEEET!',c:CREAM,sc:3}); setMessage('One long whistle. Everybody looks up.'); }],
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
SC.a6_pistol=(s,u)=>{ const h=hand(),ms=s.t*1000; gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(h.x,h.y-2); gfx.rotate(-1.2); if(!PROPART.draw('amy/starter_pistol',7,2,{w:32,flip:true})) { RO(-4,-6,22,7,'#2b2a26'); RO(-6,0,8,12,'#6e4824'); } gfx.restore();
  if(ms>s.bang&&ms<s.bang+500) { const q=(ms-s.bang)/500; gfx.globalAlpha=1-q; const bx=h.x+6,by=h.y-24-q*20; star(bx,by,14+q*10,GOLD2,q*3); gfx.save(); gfx.translate(bx,by-14); gfx.rotate(-.2); RO(-24,-8,48,16,CREAM); label('BANG',0,-3,RED,2); gfx.restore(); } gfx.globalAlpha=1; };
SC.a6_redcard=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(h.x-2,h.y-18); gfx.rotate(-.12+Math.sin(s.t*12)*.06); if(!PROPART.draw('amy/red_card',0,-1,{h:34})) { RO(-10,-16,20,30,RED); R(-7,-12,6,4,'#ff8a80'); } gfx.restore(); gfx.globalAlpha=1; };
A.false_start=E2=>{ poses(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,70),g=front(F,14),me=ST.unit(m);
  const plan={on:300,calls:[[800,'ON YOUR MARKS'],[1500,'SET...']],lean:1700,lunge:2000,grab:2900,slam:3400,F,f},bang=2200;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'hip'},{t:1500,f:'pistol',dx:(u,tt)=>Math.sin(tt*20)*.8},{t:2200,f:'pistol',hop:10},{t:2450,f:go(g.x,me),hop:4,hn:3},{t:2900,x:g.x,y:g.y,f:'grab',dx:u=>-ez(u)*8},
    {t:3100,f:'grab',x:g.x+36,y:g.y,dx:(u,tt)=>Math.sin(tt*24)*2,ease:'in'},{t:3400,f:'throw',x:g.x+36,y:g.y,hop:6},{t:3800,f:'card',hop:4},{t:4800,f:'hip'},{t:5100,f:back(g.x,me)},{t:5800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A big white start line and starting blocks appear under it.'); say(m.id,'false_start'); scene('a6_line',5.0,{plan}); sfx.thud(); }],
    [800,()=>{ sfx.select(); setMessage('ON YOUR MARKS.'); }],
    [1500,()=>{ scene('a6_pistol',1.1,{bang:bang-1500}); sfx.select(); setMessage('SET. Her starter pistol goes up. Nobody move.'); }],
    [1700,'It leans. Early.'],
    [2000,()=>{ sfx.whoosh(); setMessage('It GOES. Before the gun.'); }],
    [bang,()=>{ (sfx.bang||sfx.thud)(); sfx.whistle(); scene('a6_flash',.2,{a:.4}); scene('a6_big',1.2,{x:F.x,y:F.top-80,txt:'FALSE START!',c:GOLD,sc:4}); setMessage('BANG. FALSE START. Amy is already marching over.'); }],
    [2900,()=>{ sfx.select(); setMessage('She grabs it by the scruff.'); }],
    [3100,()=>{ sfx.whoosh(); setMessage('And hauls it all the way back behind the line.'); }],
    ['hf',plan.slam],
    [plan.slam,()=>{ sfx.thud(); sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('a6_dust',.6,{x:F.x-F.w*.4,y:F.base,r:40,n:10}); scene('a6_big',1,{x:F.x,y:F.top-70,txt:'BACK IN THE BLOCKS',c:CREAM,sc:2}); }],
    [3800,()=>{ scene('a6_redcard',1.1,{}); sfx.ding(); setMessage('Red card. She keeps one in her sock.'); }],
    [4800,'Try again. From the blocks. It won\'t.'],
    [5900,'end',res(E2)+'The enemy is sent back to its starting block.']]); };

// ---------- Hot Lunch Tray (A2): a real cafeteria lunch ----------
// She carries a full tray with both hands (tomato soup, grilled cheese triangles, green beans, an apple, an almond-milk
// carton and a cookie) over to the friend, sets it on a pop-up lunch table, and the steam does the rest.
const SOUP='#d8452e',TRAYC='#e9a04a';
const trayDraw=(x,y,sc,t)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); if(PROPART.draw('amy/lunch_tray',0,-10,{w:78})) { gfx.restore(); return; }
  // a real cafeteria tray: slate-blue, raised rim, molded compartments
  PO([[-42,-2],[42,-2],[48,12],[-48,12]],'#2c3a52'); PO([[-40,-1],[40,-1],[45,10],[-45,10]],'#56688a'); R(-40,-1,80,2,'#8ea2c4');
  R(-38,2,34,6,'#44577a'); R(-2,2,12,6,'#44577a'); R(12,2,26,6,'#44577a'); R(-38,2,34,1,'#34445f'); R(12,2,26,1,'#34445f');
  // PIZZA SLICE (left): golden crust, orange cheese, pepperoni, a drip
  PO([[-37,6],[-5,6],[-21,-17]],'#2b2a26'); PO([[-35,5],[-7,5],[-21,-14]],'#f0b445'); PO([[-35,5],[-7,5],[-9,1],[-33,1]],'#d9902e'); R(-33,2,24,2,'#c47a2a');
  for(const [a,b] of [[-23,-3],[-17,0],[-26,1],[-21,-9]]) { EO(a,b,3.2,2.8,'#b3321f'); E(a-1,b-1,1.2,1,'#d9573d'); }
  Ln(-24,-9,-23,-5,1,'#f7d070'); R(-14,-4,2,3,'#f7d070');
  // TATER TOTS (middle): little golden barrels
  for(const [a,b] of [[1,3],[5,3],[9,3],[3,-2],[7,-2],[5,-7]]) { RO(a-2.5,b-2.5,5,5,'#d99a3a'); R(a-1,b-2,1.5,1.5,'#f2c262'); R(a,b+1,2,1,'#a8661c'); }
  // APPLE (right): bright red with a highlight, stem and leaf
  EO(24,2,7,6.5,'#2b2a26'); EO(24,2,6,5.5,'#d93a2e'); E(21.5,-0.5,1.8,1.4,'#ff9a88'); R(23.5,-7,1.6,4,'#6b4a2a'); PO([[25,-6],[31,-9],[29,-4]],'#4f9a45');
  // MILK CARTON (back right): gable top, blue and white, cow spots, "MILK"
  RO(33,-21,12,20,'#2b2a26'); R(34,-20,10,18,'#f6f6fb'); PO([[33,-21],[39,-28],[45,-21]],'#2b2a26'); PO([[34,-21],[39,-26],[44,-21]],'#dfe6f2'); R(34,-14,10,6,'#3a74c9'); label('MILK',39,-11,'#fff',1);
  R(35,-6,3,3,'#3a3a46'); R(40,-4,3,3,'#3a3a46'); R(38,-19,2,3,'#3a3a46');
  // spork
  RO(-10,-8,3,14,'#e9e9ee');
  gfx.restore(); };
const steam=(x,y,t,h,n)=>{ gfx.globalAlpha*=.75; for(let k=0;k<n;k++) { const q=(t*1.1+k/n)%1; gfx.strokeStyle='#ffffff'; gfx.lineWidth=3; gfx.beginPath(); for(let j=0;j<8;j++) { const yy=y-6-j*(h/8)-q*18,xx=x-24+k*(48/n)+Math.sin(j*.9+t*6+k)*4; j?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.globalAlpha*=.92; gfx.stroke(); } };
SC.a6_table=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms<P.on) return; const g=ez((ms-P.on)/250); gfx.globalAlpha=fade(u,.94); const x=P.x,y=P.y,w=150*g;
  if(!PROPART.draw('amy/lunch_table',x,y-34,{w:Math.max(1,w*.8)})) { RO(x-w/2,y-30,w,8,'#b84a3a'); R(x-w/2+4,y-28,w-8,2,'#e86a5a'); for(const px of [x-w/2+10,x+w/2-14]) { RO(px,y-22,4,22,'#9aa3a8'); } } gfx.globalAlpha=1; };
SC.a6_tray=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.96); let x,y,sc=1.1;
  if(ms<P.give) { const h=hand(); x=h.x-8; y=h.y+10+Math.sin(ms/90)*1.5; sc=.95; } else { const q=ez((ms-P.give)/320),h=hand(); x=lerp(h.x-8,P.x,q); y=lerp(h.y+10,P.y,q); sc=lerp(.95,1.5,q); }
  const a0=gfx.globalAlpha; steam(x-12*sc,y-14*sc,s.t,22*sc+10,3); gfx.globalAlpha=a0; trayDraw(x,y,sc,s.t); gfx.globalAlpha=1; };
SC.a6_melt=(s,u)=>{ for(let k=0;k<10;k++) { const q=cl(u*1.4-k*.04),x=s.x-s.w*.5+((k*37)%10)/10*s.w,y=s.top+((k*53)%10)/10*s.h*.8+q*20; gfx.globalAlpha=(1-q)*.9; R(x,y,6,6,'#cfeeff'); R(x+2,y+6,2,q*10,'#9fd8ff'); } gfx.globalAlpha=1; };
A.hot_lunch_tray=E2=>{ poses(); const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,46),self=t===m,me=ST.unit(m);
  const tx=self?me.x-30:Math.round(H.x-4),ty=Math.min(318,(self?me.base:H.base)+22);
  const K=self?[{t:0,x:'home',y:'home',f:'carry',dy:u=>Math.sin(u*Math.PI*4)*1.5},{t:1200,f:'hold'},{t:1600,f:'carry',dx:-6},{t:2600,f:'cheer',hop:8},{t:3100,f:'hip'},{t:3500,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'carry',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*2,dx:(u,tt)=>Math.sin(tt*9)*.6},{t:1300,x:sp.x,y:sp.y,f:'hold'},{t:1600,f:'carry',dx:u=>-ez(u)*8},{t:2000,f:'carry',dx:-8},{t:2600,f:'cheer',hop:8},{t:3100,f:'hip'},{t:3500,f:back(sp.x,me)},{t:4200,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),give=1600,hit=give+450,end=self?3600:4300;
  const plan={give,x:tx,y:ty-32},tp={on:1300,x:tx,y:ty};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Amy carries a full hot lunch tray. For herself. Teachers eat too.':'Amy carries a full hot lunch tray over to '+t.name+'. Both hands. Careful.'); say(m.id,'hot_lunch_tray'); scene('a6_table',(end-100)/1000,{plan:tp}); scene('a6_tray',(end-100)/1000,{plan}); }],
    [1300,()=>{ sfx.thud(); setMessage('A lunch table pops up. She sets the tray down.'); }],
    [give,()=>{ sfx.select(); setMessage('Tomato soup. Grilled cheese triangles. Green beans. An apple, a cookie and almond milk.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.ding(); scene('a6_glow',1,{x:H.x,y:H.mid,c:'#ffb45a'}); scene('a6_melt',1.2,{x:H.x,top:H.top,w:H.w,h:H.h}); scene('a6_big',1.2,{x:H.x,y:H.top-60,txt:'HOT LUNCH!',c:'#ffb45a',sc:3}); hopOf(t!==m?t:null); }],
    [2600,'Dip the sandwich in the soup. That is the correct order.'],
    [end,'end',kindLine(t,'Warm all the way through. Soup first, then recess.')]]); };

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
SC.a6_switch=(s,u)=>{ const ms=s.t*1000,P=s.plan,off=P.flicks.some(([a,b])=>ms>=a&&ms<b);
  if(off) { const k=P.flicks.find(([a,b])=>ms>=a&&ms<b),d=ms-k[0]; gfx.globalAlpha=d<90?(Math.floor(d/30)%2?.5:.9):.9; R(0,0,576,324,'#04050b'); }
  else for(const [a,b] of P.flicks) { const d=ms-b; if(d>=0&&d<220) { gfx.globalAlpha=(1-d/220)*.5; R(0,0,576,324,'#fffbe8'); } }
  const x=P.sx,y=P.sy; gfx.globalAlpha=1; if(!PROPART.draw('amy/wall_light_switch',x,y,{h:96,sy:off?-1:1})) { gfx.save(); gfx.translate(x,y); gfx.scale(2.4,2.4);
  RO(-14,-20,28,40,'#f4f0e6'); R(-12,-18,24,36,'#fbf8f0'); R(-12,-18,2,36,'#d8d2c6'); for(const sy of [-15,15]) { EO(0,sy,2,2,'#c9c2b8'); R(-1,sy-1,2,2,'#8a857c'); }
  R(-5,-11,10,22,'#c9c2b8'); const ty=off?3:-10; RO(-4,ty,8,8,'#ffffff'); R(-3,ty+1,6,2,'#e8e4dc'); label(off?'OFF':'ON',0,off?-8:6,'#8a857c',1); gfx.restore(); }
  if(ms<P.flicks[P.flicks.length-1][1]+300&&ms>P.flicks[0][0]-100) bigWord(off?'CLICK. OFF.':'CLICK. ON.',Math.min(540,x+10),Math.max(20,y-70),off?'#9aa3a8':GOLD,3);
  gfx.globalAlpha=1; };
SC.a6_hush=(s,u)=>{ for(const q of s.list) { const x=q.x,y=q.top-22; gfx.globalAlpha=fin(u,.15)*fade(u,.8); RO(x-18,y-10,36,18,CREAM); label('...',x+1,y-6,'#2b2a26',2); R(x-4,y+8,6,4,CREAM); } gfx.globalAlpha=1; };
SC.a6_zz=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.8)*g; for(let k=0;k<3;k++) { const q=(s.t*.7+k/3)%1; bigWord('SHH',s.x+k*8-8,s.y-q*30,CREAM,1); } gfx.globalAlpha=1; };
A.inside_voices=E2=>{ poses(); const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,64),me=ST.unit(m);
  const plan={flicks:[[1200,1500],[1750,2050]],sx:Math.max(60,p.x-40),sy:Math.max(70,p.y-AH()*.95),lx:Math.round(Gp.x),ly:Math.max(30,Math.round(Gp.top-62))};
  const flick=u=>-ez(u)*2;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'hip'},{t:1050,f:'reach',dx:3},{t:1200,f:'reach',dx:3,dy:flick},{t:1500,f:'reach',dx:3,dy:flick},{t:1750,f:'reach',dx:3,dy:flick},{t:2050,f:'reach',dx:3,dy:flick},{t:2250,f:'hip'},
    {t:2400,f:(u,tt)=>Math.floor(tt*8)%2?'clap':'spread',hop:2,hn:4},{t:3300,f:'shh',lean:-2},{t:4100,f:'aim'},{t:4500,f:back(p.x,me)},{t:5200,x:'home',y:'home',f:'idle'}]);
  plan.st=st; const claps=[2400,2650,2900,3050,3200];
  ST.play(E2,[
    [0,()=>{ setMessage('Amy marches over to the wall switch.'); say(m.id,'inside_voices'); scene('a6_lampB',4.6,{plan,back:true}); scene('a6_switch',4.6,{plan}); }],
    [1050,'She reaches up.'],
    ...plan.flicks.map(([a,b])=>[a,()=>{ sfx.click(); setMessage('Lights off.'); }]),
    ...plan.flicks.map(([a,b])=>[b,()=>{ sfx.click(); setMessage('Lights on.'); }]),
    [2400,()=>{ setMessage('The teacher clap. Clap, clap, clap-clap-clap.'); }],
    ...claps.map(c=>[c,()=>{ clap(); const h=head(st,8); scene('a6_text',.5,{x:h.x-20+(c%2)*40,y:h.y-10,txt:'CLAP',c:GOLD,sc:2}); }]),
    ['hf',3300],
    [3300,()=>{ E2.apply(); sfx.stun(); for(const f of list) ST.jolt(f,.2); scene('a6_big',1.3,{x:Gp.x,y:Gp.top-74,txt:'INSIDE VOICES!',c:GOLD,sc:3}); scene('a6_hush',1.6,{list:list.map(f=>ST.foe(f))}); scene('a6_zz',1.4,{x:head(st).x-24,y:head(st).y-16}); }],
    [3700,'Finger to her lips. Every one of them stops. She waits anyway.'],
    [5300,'end','The room suddenly remembers its manners.']]); };

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
SC.a6_bell=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(h.x-2,h.y-6); gfx.rotate(Math.sin(s.t*40)*.3); if(!PROPART.draw('amy/recess_handbell',0,-5,{h:38})) { RO(-2,-20,4,10,WOOD3); EO(0,0,10,9,'#e0b040'); E(-3,-3,3,2.5,'#fff0a0'); EO(0,4,3,3,'#8a6a2a'); } gfx.restore();
  for(let k=0;k<3;k++) { const q=((s.t*3)+k/3)%1; gfx.globalAlpha=(1-q)*.7; ring(h.x-2,h.y-6,12+q*26,12+q*26,3,GOLD); } gfx.globalAlpha=1; };
SC.a6_rain=(s,u)=>{ const n=s.n||22; for(let k=0;k<n;k++) { const d=(k*.07)%1*.5,q=cl((u-d)/.45); if(q<=0||q>=1) continue; const x=s.x0+((k*61)%100)/100*(s.x1-s.x0),y=lerp(-30,s.y1-((k*29)%40),Math.min(1,q/.7));
  const pop=q>.7?ez((q-.7)/.3):0; gfx.globalAlpha=1-pop; star(x,y,(12+(k%3)*4)*(1+pop*.6),k%3?GOLD:GOLD2,s.t*3+k); } gfx.globalAlpha=1; };
A.goldstar_recess=E2=>{ poses(); const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const sx=foe?front(U[0],40).x:Math.max(40,Math.min(...U.map(q=>q.x-q.w*.5))-24),sy=foe?front(U[0],40).y:Math.min(316,Math.round(Math.max(...U.map(q=>q.base)))+12);
  const cx=Math.max(110,sx-104),cw=206,cy=Math.max(60,sy-AH()*.55),rows=who.map((q,k)=>({name:q.name.toUpperCase().slice(0,6),at:1700+k*380,u:q}));
  const K=[{t:0,x:'home',y:'home',f:go(sx,me)},{t:700,x:sx,y:sy,f:'reach'},{t:1000,f:'reach',dy:u=>ez(u)*8},{t:1300,f:'hip'}];
  rows.forEach(r=>{ K.push({t:r.at-250,f:'card',hop:3},{t:r.at,f:'throw',dx:-6}); });
  const bellAt=rows[rows.length-1].at+500,up=bellAt+700;
  K.push({t:bellAt-200,f:'hip'},{t:bellAt,f:'pump',hop:4,hn:3,dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:up,f:'jump',hop:14},{t:up+600,f:'cheer',hop:5},{t:up+1200,f:'hip'},{t:up+1500,f:back(sx,me)},{t:up+2200,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),x0=Math.max(10,Math.min(...U.map(q=>q.x-q.w*.6))),x1=Math.min(566,Math.max(...U.map(q=>q.x+q.w*.6))),y1=Math.max(...U.map(q=>q.base));
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over and pulls down the gold star chart.'); say(m.id,'goldstar_recess'); scene('a6_chart',(up+600)/1000,{plan:{on:1000,up,x:cx,w:cw,y:cy,rows}}); }],
    [1000,()=>{ sfx.whoosh(); setMessage('One row each. Three stars each. One empty box each.'); }],
    ...rows.map(r=>[r.at,()=>{ const h=hand(); scene('a6_sticker',.3,{x0:h.x,y0:h.y,x1:PROPART.ready('amy/sticker_chart')?cx+8:cx-cw/2+92+78,y1:cy-(rows.length*28+34)+30+rows.indexOf(r)*28+12}); sfx.select(); }]),
    ...rows.map(r=>[r.at+300,()=>{ sfx.ding(); hopOf(r.u!==m?r.u:null); setMessage('Gold star: '+r.u.name+'.'); }]),
    [bellAt,()=>{ sfx.ding(); sfx.ding(); scene('a6_bell',.7,{}); setMessage('Full chart. She rings the recess bell.'); }],
    ['hf',up],
    [up,()=>{ E2.apply(); sfx.levelUp(); scene('a6_rain',2.2,{x0,x1,y1,n:24}); scene('a6_big',1.6,{x:(x0+x1)/2,y:Math.min(...U.map(q=>q.top))-40,txt:'RECESS!',c:GOLD,sc:4});
      for(const q of who) { const P=ST.unit(q); scene('a6_glow',1.1,{x:P.x,y:P.mid,c:GOLD}); hopOf(q!==m?q:null); } }],
    [up+600,()=>{ sfx.ding(); setMessage(foe?'Gold stars everywhere. Even '+foe.name+' gets a few.':'Gold stars for everybody. Rest counts as good work.'); for(const q of who) { const P=ST.unit(q); scene('a6_burst',.8,{x:P.x,y:P.top-6,n:6,r:30,c:GOLD2}); } }],
    [up+2300,'end',foe?kindLine(foe):'The assignment is to stop for a moment.']]); };

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
SC.a6_stack=(s,u)=>{ const ms=s.t*1000,P=s.plan; if(ms>P.off) return; const h=hand(); gfx.globalAlpha=1; const n=Math.max(1,P.n-P.list.filter(t=>ms>t).length); gfx.save(); gfx.translate(h.x-10,h.y-4); gfx.rotate(-.15); for(let k=n-1;k>=0;k--) { RO(-12,-8-k*2,24,14,k%2?'#f4efe2':CREAM); } gfx.restore(); };
SC.a6_pencils=(s,u)=>{ for(let k=0;k<6;k++) { const a=-Math.PI*.15-k*Math.PI*.14,d=ez(u)*70,x=s.x+Math.cos(a)*d*1.3,y=s.y+Math.sin(a)*d-Math.sin(u*Math.PI)*20+u*u*40;
  gfx.globalAlpha=1-u*u; gfx.save(); gfx.translate(x,y); gfx.rotate(u*10+k); if(!PROPART.draw('amy/pencils',0,0,{h:26})) { R(-12,-3,24,6,OUT); R(-10,-2,18,4,'#ffd23a'); R(8,-2,3,4,'#f0a0a0'); } gfx.restore(); } gfx.globalAlpha=1; };
A.pop_quiz=E2=>{ poses(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),all=waveFoes().length?waveFoes():[f],list=[f].concat(all.filter(x=>x!==f)).slice(0,4).map(x=>ST.foe(x)),p=front(F,48),me=ST.unit(m);
  const girls=['grace','rose'].map(id=>B2.party.find(q=>q.id===id&&b2Alive(q))).filter(Boolean);
  const paper=1300,pencil=1900,run=2300,fast=2800,drop=3250,hit=3700;
  const plan={on:700,paper,pencil,collect:hit,list},tp={on:run-200,run,fast,off:hit+800,x:Math.min(520,p.x+40),y:48},pk={drop,hit,F,w:Math.round(cl(F.w*1.4,100,160)),h:Math.round(cl(F.w*1.7,116,180))};
  const K=[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:700,x:p.x,y:p.y,f:'celeb2',hop:10},{t:1100,f:'carry'}];
  list.forEach((F2,k)=>K.push({t:paper+k*180,f:'throw',dx:-5},{t:paper+k*180+120,f:'carry'}));
  K.push({t:run,f:'hip'},{t:fast,f:'point',dx:(u,tt)=>Math.sin(tt*14)*1.5},{t:drop,f:'jump',hop:14},{t:hit,f:'throw',dx:-8},{t:hit+500,f:'hip'},{t:hit+1200,f:'clap'},{t:hit+1600,f:back(p.x,me)},{t:hit+2300,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy sprints over. Clear your desks.'); say(m.id,'pop_quiz'); scene('a6_desks',(hit+1200)/1000,{plan}); scene('a6_timer',(hit+900)/1000,{plan:tp}); scene('a6_packet',(hit+1500)/1000,{plan:pk}); scene('a6_stack',(hit+1500)/1000,{plan:{n:list.length+2,list:list.map((x,k)=>paper+k*180),off:drop}}); }],
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
A.negative_split=E2=>{ poses(); const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const x0=Math.min(...U.map(q=>q.x-q.w*.5)),x1=Math.max(...U.map(q=>q.x+q.w*.5)),cx=Math.round((x0+x1)/2),rx=Math.round(cl((x1-x0)/2+40,110,230)),ry=Math.round(cl(rx*.34,34,60)),cy=Math.min(318-ry,Math.round(Math.max(...U.map(q=>q.base))-14));
  // waypoints round the oval (angles from the near side, clockwise as seen from the front)
  const LAP1=2300,LAP2=1300,wp=(t0,dur,n,fast)=>{ const K=[]; for(let k=0;k<=n;k++) { const a=Math.PI/2+k/n*Math.PI*2,x=Math.round(cx+Math.cos(a)*rx),y=Math.round(cy+Math.sin(a)*ry); K.push({t:t0+Math.round(k/n*dur),x,y,f:Math.cos(a)>0.05?'runR':(Math.cos(a)<-.05?'run':(Math.sin(a)>0?'runR':'run')),ease:'lin',hop:fast?3:2,hn:3}); } return K; };
  const start={x:cx,y:Math.min(318,cy+ry)};
  const K=[{t:0,x:'home',y:'home',f:go(start.x,me)},{t:600,x:start.x,y:start.y,f:'pump'},{t:900,f:'idle'}].concat(wp(900,LAP1,8,false));
  K.push({t:900+LAP1,x:start.x,y:start.y,f:'pump',hop:4}); K.push(...wp(900+LAP1+200,LAP2,8,true));
  const hit=900+LAP1+200+LAP2; K.push({t:hit,x:start.x,y:start.y,f:'jump',hop:18},{t:hit+500,f:'cheer',hop:4},{t:hit+1000,f:back(start.x,me)},{t:hit+1700,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),fast=900+LAP1+200;
  const plan={cx,cy,rx,ry,off:hit+1300},cp={x:cx,y:Math.max(44,cy-ry-AH()-10),fast,fastEnd:hit,off:hit+1200,splits:[[900+LAP1,'LAP 1: 4:12',CREAM],[hit,'LAP 2: 3:58',MINT]]},trail={list:[]};
  ST.play(E2,[
    [0,()=>{ setMessage('A running track paints itself round the whole team.'); say(m.id,'negative_split'); scene('a6_track',(hit+1400)/1000,{plan,back:true}); scene('a6_clock',(hit+1300)/1000,{plan:cp}); }],
    [600,()=>{ sfx.click(); setMessage('Watch on. Lap one: nice and easy.'); }],
    [900,()=>{ sfx.run&&sfx.run(); }],
    [900+LAP1,()=>{ sfx.ding(); sfx.click(); setMessage('4:12. Halfway. Now she goes.'); }],
    [fast,()=>{ sfx.whoosh(); sfx.run&&sfx.run(); scene('a6_speed',(LAP2+200)/1000,{plan:{st,y0:Math.max(40,Math.min(...U.map(q=>q.top))-20),y1:cy+ry}}); scene('a6_ghost',(LAP2+300)/1000,{st,trail,every:70,n:6,life:380});
      if(!foe) who.filter(u=>u!==m).forEach((p,k)=>dance(p,(LAP2+200)/1000,(q,tt)=>({dx:Math.sin(tt*20+k)*2,dy:-Math.abs(Math.sin(tt*14+k))*8,frame:Math.floor(tt*10+k)%2?'run':'idle'}))); setMessage('Lap two. Flat out. The whole family picks it up with her.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); scene('a6_flash',.2,{a:.3,c:MINT}); scene('a6_big',1.3,{x:cx,y:Math.max(60,cy-ry-AH()-50),txt:'NEGATIVE SPLIT!',c:MINT,sc:3}); for(const q of who) { const P=ST.unit(q); scene('a6_glow',.9,{x:P.x,y:P.mid,c:'#ffb45a'}); hopOf(q!==m?q:null); } }],
    [hit+500,'3:58. Fourteen seconds faster. She wrote it down already.'],
    [hit+1800,'end',foe?kindLine(foe):'Faster in the second half. The party picks up the pace.']]); };

// ---------- Red Pen (A1): she writes the F herself ----------
// Same giant quiz on the monster, but the marker is in her hand: she uncaps it, reaches in and draws the F stroke by
// stroke (her arm follows the pen), circles it twice, and caps it. SEE ME AFTER CLASS.
SC.a6_redf=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=P.F; if(ms<P.paper) return;
  const w=P.w,h=P.h,x=F.x,y=F.mid; const g=ez((ms-P.paper)/220),out=ez((ms-P.peel)/400);
  gfx.globalAlpha=1-out; gfx.save(); gfx.translate(x,y+out*30); gfx.rotate(-.06+out*.4); gfx.scale(lerp(1.4,1,g),lerp(1.4,1,g));
  if(!PROPART.draw('amy/giant_quiz_paper',0,0,{w:w+10,h:h+10})) { RO(-w/2,-h/2,w,h,CREAM); for(let k=0;k<6;k++) R(-w/2+6,-h/2+18+k*(h-24)/6,w-12,1,'#9fc4f0'); R(-w/2+10,-h/2,2,h,'#f0a0a0'); label('QUIZ',-w/2+20,-h/2+5,'#2b2a26',1); label('NAME:',w*.2,-h/2+5,'#2b2a26',1); }
  const fx0=-w*.18,ft=-h*.3,fb=h*.32,fr=w*.24,fm=-h*.02; const pt=[[fx0,ft,fx0,fb],[fx0,ft,fr,ft],[fx0,fm,fr*.75,fm]];
  let tip=null; pt.forEach(([a,b,c,d],k)=>{ const q=cl((ms-P.strokes[k])/220); if(q<=0) return; const ex=lerp(a,c,q),ey=lerp(b,d,q); Ln(a,b,ex,ey,9,PEN); if(q<1||(k===2&&ms<P.circle)) tip=[ex,ey]; });
  for(const c0 of [P.circle,P.circle+350]) if(ms>c0) { const q=ez((ms-c0)/300); gfx.strokeStyle=PEN; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(w*.02,c0>P.circle?3:0,w*.42+(c0>P.circle?5:0),h*.44+(c0>P.circle?4:0),-.1,-1.2,-1.2+q*Math.PI*2.1); gfx.stroke(); if(q<1) { const an=-1.2+q*Math.PI*2.1; tip=[w*.02+Math.cos(an)*w*.42,Math.sin(an)*h*.44]; } }
  gfx.restore();
  // the marker: from her hand to wherever the ink is going (capped before the first stroke and after the last)
  if(ms<P.put) { const hd=hand(),writing=tip&&ms>=P.strokes[0]&&ms<P.circle+650; let tx,ty; if(writing) { tx=x+tip[0]; ty=y+tip[1]; } else { tx=hd.x-18; ty=hd.y-26; }
    const dx=tx-hd.x,dy=ty-hd.y,L=Math.min(Math.hypot(dx,dy),86)||1,a=Math.atan2(dy,dx);
    gfx.globalAlpha=1;
    { const ps=.5,tx2=hd.x+Math.cos(a)*L,ty2=hd.y+Math.sin(a)*L,r=a+Math.PI+.77,ox=.48*160*ps,oy=-.43*160*ps;   // painted marker: nib at the ink, body running back past her hand
      if(PROPART.draw('amy/giant_red_marker',tx2+ox*Math.cos(r)-oy*Math.sin(r),ty2+ox*Math.sin(r)+oy*Math.cos(r),{h:160*ps,rot:r})) return; }
    gfx.save(); gfx.translate(hd.x,hd.y); gfx.rotate(a); R(-6,-7,L+4,14,OUT); R(-4,-5,L,10,PEN); R(L-16,-5,12,10,writing?'#8a1a1a':'#f4f0e6'); if(!writing) R(-4,-5,10,10,'#f4f0e6'); gfx.restore(); } };
A.red_pen=E2=>{ poses(); const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,54),me=ST.unit(m);
  const plan={paper:900,strokes:[1350,1650,1950],circle:2250,put:3100,peel:3700,F,w:Math.round(cl(F.w*.95,64,110)),h:Math.round(cl(F.h*.9,72,120))};
  const stroke=(u,tt)=>Math.sin(tt*18)*1.5;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:go(p.x,me)},{t:800,x:p.x,y:p.y,f:'throw',dx:-6},{t:1100,f:'hold'},{t:1350,f:'write',dx:stroke,dy:u=>-ez(u)*6},{t:1650,f:'write',dx:stroke,dy:-6},{t:1950,f:'write',dx:stroke,dy:-2},{t:2250,f:'write',dx:(u,tt)=>Math.cos(tt*20)*3,dy:(u,tt)=>Math.sin(tt*20)*3},
    {t:2900,f:'hold'},{t:3100,f:'hip'},{t:3500,f:back(p.x,me)},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Amy jogs over with a quiz and a very large red marker.'); say(m.id,'red_pen'); scene('a6_redf',4.0,{plan}); }],
    [900,()=>{ (sfx.splat||sfx.thud)(); setMessage('She slaps the quiz right onto it.'); }],
    [1100,()=>{ sfx.click(); setMessage('Cap off.'); }],
    ...plan.strokes.map(t=>[t,()=>{ sfx.select(); }]),
    [1350,'One stroke. Two. Three. She presses hard.'],
    ['hf',2250],
    [2250,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('a6_big',1.4,{x:F.x,y:F.top-74,txt:'F',c:PEN,sc:6}); setMessage('A giant red F. Circled. Twice.'); }],
    [2600,()=>{ sfx.select(); }],
    [2900,()=>{ sfx.click(); scene('a6_text',1.4,{x:F.x,y:F.top-18,txt:'SEE ME AFTER CLASS',c:'#ff6a60'}); setMessage('Cap on. See me after class.'); }],
    [4300,'end',res(E2)+'It\'ll be seeing her after class.']]); };

// ---------- Boston Qualifier (B6): the whole race, not just the tape ----------
// On top of the finish arch, tape, crowd, speed lines, bowling-pin tumbles, confetti and foil blankets: a course map
// card with the route and a dot racing along it (Heartbreak Hill flagged), the HEREFORD ST and BOYLSTON ST signs
// swinging in as the pack turns right then left, the arch clock freezing at 2:59:58, a BQ stamp, and a finisher medal
// that flies round her neck.
const BAR=24;
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
SC.a6_medal=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const q=ez(u/.35),hx=lerp(s.x0,st.x,q),hy=lerp(s.y0,st.y-AH()*.5,q)-Math.sin(cl(u/.35)*Math.PI)*60; gfx.globalAlpha=fade(u,.9);
  if(q>=1) { gfx.strokeStyle=BLUE; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(st.x-12,st.y-AH()*.66); gfx.lineTo(hx,hy-2); gfx.lineTo(st.x+10,st.y-AH()*.66); gfx.stroke(); }
  gfx.save(); gfx.translate(hx,hy); gfx.rotate(q<1?u*8:0); if(!PROPART.draw('amy/finisher_medal',0,0,{h:26,src:[8,66,108,94]})) { EO(0,0,10,10,GOLD2); ring(0,0,7,7,1.5,'#b88a1a'); star(0,0,4,CREAM); } gfx.restore(); gfx.globalAlpha=1; };
A.marathon_ult=E2=>{ poses(); const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m),others=party.filter(p=>p!==m);
  const U=party.map(p=>ST.unit(p)),minX=Math.min(...U.map(q=>q.x)),ly=Math.min(306,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length));
  const ax=Math.max(62,Math.min(100,Math.round(Gp.x0-6))),lead={x:Math.round(minX-46),y:ly},finish=ax-6;
  const RUN0=2300,RUN1=3300,dx=finish-lead.x,tape=RUN1-40;
  const P={ax,gy:ly,chest:Math.round(AH()*.58),cy:Math.max(BAR+70,Math.min(132,Math.round(Gp.top-10))),sign1:Math.round(lead.x-8),sign2:Math.round((lead.x+560)/2+30),cheer:RUN0,tape,t0:0,st:null,y0:Gp.top,y1:ly};
  const at=x=>RUN0+cl((lead.x-x)/(lead.x-finish))*(RUN1-RUN0);
  P.pins=list.map((f,k)=>{ const F=ST.foe(f); return {f,k,t:at(F.x+F.w*.25)}; });
  const hit=Math.round(at(Gp.x));
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:lead.x<me.x?'run':'runR'},{t:700,x:lead.x,y:lead.y,f:'aim'},{t:1300,f:'celeb2',hop:10},{t:1700,f:'run',dx:(u,tt)=>Math.sin(tt*14)*1.5,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},
    {t:RUN0,f:'run',ease:'lin'},{t:RUN1,x:finish,y:lead.y,f:'celeb',hop:16},{t:3700,f:'celeb',hop:6},{t:3800,f:'runR'},{t:4700,x:'home',y:'home',f:'celeb',hop:10},{t:5300,f:'clap'},{t:6000,f:'idle'}]);
  P.st=st;
  // everyone else: jog in place on KICK NOW!, then the same sprint (same distance), then jog home
  for(const p of others) { const k=p.idx; dance(p,4.7,(qq,tt)=>{ const ms=qq*4700;
    if(ms<1700) return {};
    if(ms<RUN0) return {frame:'run',dx:Math.sin(tt*14+k)*1.5,dy:-Math.abs(Math.sin(tt*14+k))*4};
    if(ms<RUN1) { const q=(ms-RUN0)/(RUN1-RUN0); return {frame:'run',dx:dx*q,dy:-Math.abs(Math.sin(tt*16+k))*3}; }
    if(ms<3800) return {dx,frame:'celeb',dy:-Math.abs(Math.sin((ms-RUN1)/500*Math.PI))*10};
    const q=ez((ms-3800)/900); return {frame:q<1?'runR':null,dx:dx*(1-q),dy:-Math.abs(Math.sin(tt*12+k))*3*(1-q)}; }); }
  ST.play(E2,[
    [0,()=>{ scene('a5_bars',6.6,{}); scene('a5_arch',6.5,{plan:P,back:true}); scene('a5_tape',4.4,{plan:P}); (sfx.cheer||sfx.whoosh)(); say(m.id,'marathon_ult');
      setMessage('Mile 26. A finish line pops up on the far side. The crowd goes wild.'); scene('a6_course',2.6,{plan:{x:288,y:BAR+44,go:300,off:2500}}); }],
    [1000,'Twenty-six miles in. Heartbreak Hill is behind her. One more to go.'],
    [700,()=>{ scene('a5_watch',.9,{}); (sfx.ting||sfx.select)(); scene('a5_big',1,{x:ax,y:BAR+80,txt:'MILE 26.2',c:YEL,sc:3}); setMessage('Amy checks her watch. She can still make her qualifying time.'); }],
    [1300,()=>{ scene('a5_big',1,{st,txt:'KICK NOW!',c:GOLD,sc:3}); sfx.select(); setMessage('KICK NOW! The whole family lines up behind her.'); }],
    [RUN0,()=>{ sfx.fanfare(); (sfx.cheer||sfx.whoosh)(); sfx.run(); scene('a5_speed',(RUN1-RUN0+200)/1000,{plan:P}); scene('a5_bowl',2.0,{plan:Object.assign({},P,{t0:RUN0})});
      setMessage('They sprint. Straight through the middle of the enemies.'); scene('a6_sign',1.6,{x:Math.min(540,lead.x+30),y:Gp.top-30,txt:'HEREFORD ST',h:46}); }],
    [RUN0+450,()=>{ scene('a6_sign',1.5,{x:Math.max(40,ax+60),y:Gp.top-30,txt:'BOYLSTON ST',h:46}); scene('a5_big',.8,{x:288,y:Gp.top-50,txt:'RIGHT. THEN LEFT.',c:CREAM,sc:2}); }],
    ...P.pins.map(b=>[Math.round(b.t),()=>{ sfx.bonk(); }]),
    ['hf',hit],
    [hit,()=>{ sfx.thud(); for(const f of list) ST.jolt(f,.6); landHit(100); scene('a5_flash',.3,{a:.4}); }],
    [tape,()=>{ sfx.fanfare(); (sfx.cheer||sfx.ding)(); sfx.bonk(); scene('a5_confetti',1.6,{ax,gy:ly}); scene('a5_flash',.3,{a:.4,c:YEL});
      scene('a5_big',1.4,{x:Math.max(140,ax+60),y:Gp.top-74,txt:'BOSTON QUALIFIER!',c:YEL,sc:3}); setMessage('Amy breaks the tape with her chest. Boston Qualifier!'); scene('a6_bq',1.6,{x:ax,y:BAR+74,delay:.4}); }],
    [3700,()=>{ scene('a6_medal',1.8,{st,x0:ax,y0:BAR+40}); sfx.ding(); setMessage('2:59:58. Under three hours. A medal, and she did the math already.'); }],
    [3800,()=>{ setMessage('Everybody jogs it out. Hands on heads. Breathe.'); }],
    [4700,()=>{ E2.apply(); sfx.heal(); sfx.levelUp(); const FL=party.map(p=>[ST.unit(p),p.id]); scene('a5_foilB',1.7,{list:FL,back:true}); scene('a5_foil',1.7,{list:FL}); for(const p of party) { const q=ST.unit(p); scene('a5_glow',1,{x:q.x,y:q.mid,c:GOLD}); } }],
    [5300,()=>{ scene('a5_big',1,{st,txt:'WE QUALIFIED!',c:GOLD,sc:2}); setMessage('Foil blankets for the whole family. Personal bests all round.'); }],
    [6400,'end',()=>res(E2)+'She\'s already signing everyone up for next year.']]); };
})();
