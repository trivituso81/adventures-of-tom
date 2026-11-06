'use strict';
// engine/justin-moves.js: Justin's nine moves as set pieces on engine/stage.js. His ability frames are painted (Art Library sheets, data/justin-ab.js, art/chars/justin-ab.webp):
// every frame is a sprite key 'ab_<short>_<n>' (n counts the sheet's cells row by row from 1), plus an R copy facing right; stock stances (idle, run) come from data/justin-battle-use.js.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scene prefix jv_ (drawn without the aim warp).
// Loaded after engine/amy-moves.js.
(function(){
if(typeof RECRUIT_MOVES==='undefined'||typeof RFX==='undefined') return;
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const J=RECRUIT_MOVES.justin=RECRUIT_MOVES.justin||{};
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.8)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
ST.nw('jv_');
const CREAM='#fff8e8',GOLD='#ffe08a',COPPER='#d8844a',SPARK='#fff3a0',BLUE='#9fd8ff';
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const waveFoe=k=>{ const M=B2.move,w=M&&M.waves[Math.min(k,M.waves.length-1)]; return (w&&w[0]&&w[0].t)||null; };
const front=(F,gap=40)=>({x:Math.min(552,F.x+F.w*.5+gap),y:Math.min(316,F.base+4)});
const jitter=f=>ST.jolt(f,.45);
// a run of frames: seq([['ab_wire_2',300],...],t0) -> keys at x,y
const seq=(list,t0,x,y,extra={})=>{ const out=[]; let t=t0; for(const [f,d,o] of list) { out.push(Object.assign({t,x,y,f},extra,o||{})); t+=d; } return out; };
const wob=(a,b)=>u=>Math.sin(u*Math.PI*2*(b||1))*a;
// wire nuts are painted (art/props/justin/wire_nut_*, from the approved wire-nuts objects sheet); the drawn hexagon is only the fallback until the image loads
const NUT_ART={'#f06a1a':'orange','#f0c030':'yellow','#3a8ae8':'blue'};
const hexNut=(x,y,r,c)=>{ if(NUT_ART[c]&&PROPART.draw('justin/wire_nut_'+NUT_ART[c],x,y,{h:r*3.4})) return; gfx.beginPath(); for(let k=0;k<6;k++) { const a=k*Math.PI/3; gfx[k?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r); } gfx.closePath(); gfx.fillStyle='#17110d'; gfx.fill(); gfx.beginPath(); for(let k=0;k<6;k++) { const a=k*Math.PI/3; gfx[k?'lineTo':'moveTo'](x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2)); } gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };

// ---------- shared scenes ----------
SC.jv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.jv_sparks=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.8,4*(1-u)+2,k%2?SPARK:(s.c||GOLD),u*3); } };
SC.jv_ring=(s,u)=>{ const q=ez(u/.55); gfx.globalAlpha=fade(u,.4); gfx.strokeStyle=s.c||CREAM; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(s.x,s.y,6+q*(s.r||34),(6+q*(s.r||34))*.8,0,0,Math.PI*2); gfx.stroke(); };
SC.jv_poof=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const a=k/(s.n||7)*Math.PI*2,d=ez(u)*(s.r||22); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.55,5*(1-u)+2,4*(1-u)+2,s.c||'#d8cfc0'); } };
SC.jv_dark=(s,u)=>{ gfx.globalAlpha=fin(u,.08)*fade(u,.9)*(s.a||.72); R(0,0,576,324,'#050a1c'); };
SC.jv_zapfx=(s,u)=>{ gfx.globalAlpha=fade(u,.6); for(let k=0;k<5;k++) { const a=k*1.26+u*9,d=8+k*3; Ln(s.x,s.y,s.x+Math.cos(a)*d*(1+u),s.y+Math.sin(a)*d*(1+u),2,k%2?SPARK:BLUE); } };

// ---------- Loose Wire (basic) ----------
// spot the wire, yank it, jab it at the foe, zap himself, drop it, smirk
SC.jv_wirespark=(s,u)=>{ gfx.globalAlpha=fade(u,.5); for(let k=0;k<10;k++) { const a=-Math.PI/2+(k/10-.5)*3.2+s.seed,d=ez(u)*(16+k%3*8); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,3+(k%2)*2,k%2?SPARK:'#ffb040',u*4+k); } };
// forked lightning from (x0,y0) to (x1,y1): redrawn jagged every frame, wide blue glow under a white core, two short forks, a flash at the far end
SC.jv_arc=(s,u)=>{ const n=9,fl=Math.floor(u*28),on=fade(u,.7); const pts=[]; for(let k=0;k<=n;k++) { const q=k/n,amp=k===0||k===n?0:(s.amp||14); const r1=Math.sin((k*12.9898+fl*78.233)*43758.5453)*.5+.5,r2=Math.sin((k*39.346+fl*11.135)*24634.6345)*.5+.5; pts.push([lerp(s.x0,s.x1,q)+(r1-.5)*2*amp,lerp(s.y0,s.y1,q)+(r2-.5)*2*amp]); }
  const path=P=>{ gfx.beginPath(); P.forEach((q,k)=>k?gfx.lineTo(q[0],q[1]):gfx.moveTo(q[0],q[1])); };
  gfx.lineCap='round'; gfx.lineJoin='round'; gfx.globalAlpha=.35*on; gfx.strokeStyle=BLUE; gfx.lineWidth=14; path(pts); gfx.stroke();
  gfx.globalAlpha=.8*on; gfx.lineWidth=7; path(pts); gfx.stroke();
  gfx.globalAlpha=on; gfx.strokeStyle='#ffffff'; gfx.lineWidth=3; path(pts); gfx.stroke();
  for(let b=0;b<2;b++) { const i=3+b*3,q=pts[i],a=(b?1:-1)*(.7+((fl+b)%3)*.25),L=26+b*8,tx=q[0]+Math.cos(Math.atan2(s.y1-s.y0,s.x1-s.x0)+a)*L,ty=q[1]+Math.sin(Math.atan2(s.y1-s.y0,s.x1-s.x0)+a)*L,mx=(q[0]+tx)/2+(b?5:-5),my=(q[1]+ty)/2-4; gfx.globalAlpha=.9*on; gfx.strokeStyle=SPARK; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(q[0],q[1]); gfx.lineTo(mx,my); gfx.lineTo(tx,ty); gfx.stroke(); }
  gfx.globalAlpha=.55*on; E(s.x1,s.y1,18+(fl%3)*4,14+(fl%2)*4,BLUE); gfx.globalAlpha=on; E(s.x1,s.y1,8,6,'#ffffff'); };
// brief white-blue screen flash (the strike)
SC.jv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.4); R(0,0,576,324,s.c||'#dff3ff'); };
// crackling arcs around a body (the shock back on Justin)
SC.jv_crackle=(s,u)=>{ const fl=Math.floor(u*22); gfx.lineCap='round'; for(let k=0;k<7;k++) { const a=k*0.9+fl*1.7,d=10+((k*7+fl*3)%5)*5,x0=s.x+Math.cos(a)*d*.6,y0=s.y+Math.sin(a)*d*.9,x1=s.x+Math.cos(a+.5)*(d+12),y1=s.y+Math.sin(a+.5)*(d+12)*1.1; gfx.globalAlpha=fade(u,.6); gfx.strokeStyle=k%2?SPARK:BLUE; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo((x0+x1)/2+(k%2?4:-4),(y0+y1)/2-3); gfx.lineTo(x1,y1); gfx.stroke(); } };
J.loose_wire=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,84),me=ST.unit(m);
  // trimmed (Tom, 17:25): three painted poses, pull / jab / zap
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'in'},{t:800,x:p.x,y:p.y,f:'ab_wire_1'}];
  K.push(...seq([['ab_wire_1',150],['ab_wire_2',150],['ab_wire_3',200],['ab_wire_4',350],['ab_wire_5',400],['ab_wire_6',200]],800,p.x,p.y));
  K.push({t:2250,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:2850,x:'home',y:'home',f:'idle'},{t:3050,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Justin spots a loose wire in a wall that is not there.')],
    [300,()=>sfx.whoosh&&sfx.whoosh()],
    [850,()=>say(m.id,'loose_wire_spot')],
    ['hf',1300],
    [1250,()=>{ sfx.bump&&sfx.bump(); say(m.id,'loose_wire'); }],
    [1300,()=>{ setMessage('He jabs the bare copper end at it.'); sfx.zap&&sfx.zap(); jitter(f); landHit(100); scene('jv_flash',.18,{a:.45}); scene('jv_arc',.8,{x0:p.x-38,y0:p.y-me.h*.5,x1:F.x+F.w*.25,y1:F.mid,amp:15}); scene('jv_wirespark',.7,{x:F.x+F.w*.3,y:F.mid,seed:0}); scene('jv_sparks',.6,{x:F.x+F.w*.3,y:F.mid,n:12,r:34,c:BLUE}); scene('jv_ring',.5,{x:F.x+F.w*.3,y:F.mid,r:46,c:BLUE}); }],
    [1430,()=>{ jitter(f); sfx.zap&&sfx.zap(); scene('jv_arc',.6,{x0:p.x-38,y0:p.y-me.h*.5,x1:F.x+F.w*.3,y1:F.mid+8,amp:18}); scene('jv_sparks',.5,{x:F.x+F.w*.2,y:F.mid,n:10,r:28,c:SPARK,seed:.5}); }],
    [1600,()=>{ sfx.zap&&sfx.zap(); scene('jv_crackle',.7,{x:p.x,y:p.y-me.h*.5}); scene('jv_zapfx',.6,{x:p.x-4,y:p.y-80}); scene('jv_text',.9,{x:p.x,y:p.y-130,txt:'ZZT',c:SPARK,sc:2}); }],
    [2250,'end',res(E2)+'Not his problem any more.']]); };

// ---------- Wire Nuts (three quick throws) ----------
J.wire_nuts=E2=>{ const {m,fx}=E2,me=ST.unit(m),f0=waveFoe(0)||firstFoe(E2),f1=waveFoe(1)||f0,f2=waveFoe(2)||f0;
  const K=[{t:0,x:'home',y:'home',f:'idle'}];
  K.push(...seq([['ab_nuts_1',200],['ab_nuts_2',250],['ab_nuts_3',250],['ab_nuts_4',300],['ab_nuts_5',300],['ab_nuts_6',650]],0,'home','home'));
  K.push({t:1950,x:'home',y:'home',f:'idle'},{t:2250,f:'idle'});
  ST.keys(fx,K);
  const cols=['#f06a1a','#f0c030','#3a8ae8'];
  const toss=(f,t0,dur,hit,pct,n)=>{ const F=ST.unit(f); for(let k=0;k<n;k++) { const c=cols[(k+n)%cols.length]; ST.fly((x,y)=>hexNut(x,y,5,c),me.x-30,me.base-me.h*.55,F.x+(k-1)*8,F.mid+(k-1)*6,.38,36+k*8,k*.05,{spin:2+k}); }
    return [[t0+dur*1000-380+380,()=>{ sfx.bonk&&sfx.bonk(); jitter(f); landHit(pct); scene('jv_sparks',.4,{x:F.x,y:F.mid,n:5,r:16,c:'#f0c030'}); }]]; };
  ST.play(E2,[
    [0,()=>{ setMessage('Justin digs in his pocket.'); say(m.id,'wire_nuts'); }],
    [500,()=>{ setMessage('Fistfuls of wire nuts.'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',1540],
    [820,()=>{ for(let k=0;k<3;k++) ST.fly((x,y)=>hexNut(x,y,5,cols[k]),me.x-30,me.base-me.h*.5,ST.unit(f0).x+(k-1)*8,ST.unit(f0).mid+(k-1)*6,.62,30+k*8,k*.1,{spin:2}); }],
    [1240,()=>{ sfx.bonk&&sfx.bonk(); jitter(f0); landHit(34); scene('jv_sparks',.4,{x:ST.unit(f0).x,y:ST.unit(f0).mid,n:5,r:16,c:'#f0c030'}); }],
    [1120,()=>{ for(let k=0;k<3;k++) ST.fly((x,y)=>hexNut(x,y,5,cols[k+1]),me.x-30,me.base-me.h*.5,ST.unit(f1).x+(k-1)*8,ST.unit(f1).mid+(k-1)*6,.62,30+k*8,k*.1,{spin:3}); }],
    [1540,()=>{ sfx.bonk&&sfx.bonk(); jitter(f1); landHit(33); scene('jv_sparks',.4,{x:ST.unit(f1).x,y:ST.unit(f1).mid,n:5,r:16,c:'#e86aa8'}); }],
    [1420,()=>{ ST.fly((x,y)=>hexNut(x,y,7,'#3a8ae8'),me.x-30,me.base-me.h*.6,ST.unit(f2).x,ST.unit(f2).mid,.72,50,0,{spin:4}); }],
    [1875,()=>{ sfx.bonk&&sfx.bonk(); sfx.ding&&sfx.ding(); jitter(f2); landHit(33); scene('jv_sparks',.5,{x:ST.unit(f2).x,y:ST.unit(f2).mid,n:7,r:22,c:'#50c868'}); }],
    [1900,()=>say(m.id,'wire_nuts_nod')],
    [2250,'end',res(E2)+'Never enough of these.']]); };

// ---------- Bad Call ----------
J.bad_call=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ab_call_1'}];
  // Tom (18:18): he sits on the couch and watches (watch, then leans in) for a good while BEFORE he gets frustrated
  K.push(...seq([['ab_call_1',1100],['ab_call_2',500],['ab_call_3',380],['ab_call_4',420],['ab_call_5',480],['ab_call_6',420]],0,'home','home'));
  K.push({t:3300,x:'home',y:'home',f:'idle'},{t:3560,f:'idle'});
  ST.keys(fx,K);
  SC.jv_callwave=SC.jv_callwave||((s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.4-k*.1); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; const x=lerp(s.x0,s.x1,q); gfx.strokeStyle='#ffd27a'; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(x,s.y,4+q*10,10+q*24,0,0,Math.PI*2); gfx.stroke(); } });
  // The couch is painted into his sitting frames (ab_call_1 to 3). The wide TV is a painted prop in the back layer (behind him); it shows football until he rises,
  // then the play is replaced by a yellow flag on the field (drawn here, so it lines up with the painted screen).
  SC.jv_tv=SC.jv_tv||((s,u,t)=>{ gfx.globalAlpha=fin(u,.05)*fade(u,.94); const w=s.w,h=w*123/160,cy=s.base-h/2;
    const ok=PROPART.draw('justin/tv_football',s.x,cy,{w}),x0=s.x-w/2+w*.056,y0=cy-h/2+h*.065,sw=w*.88,sh=h*.715;   // the screen inside the bezel
    if(!ok) { R(s.x-w/2,cy-h/2,w,h*.86,'#1a1a22'); R(x0,y0,sw,sh,'#3f8a3a'); }
    if(t>=s.flag) { R(x0,y0,sw,sh,'#3f8a3a'); for(let k=1;k<4;k++) R(x0+sw*k/4-1,y0,2,sh,'#e8f0e0'); const a=x0+sw*.5,b=y0+sh*.55;
      R(a-9,b-6,18,12,'#ffe14a'); R(a-9,b-6,18,3,'#fff7b0'); R(a-9,b+3,18,3,'#e0b020'); R(a+9,b-1,5,4,'#e0b020'); R(a+13,b+1,3,3,'#b88810'); R(a-12,b+4,4,3,'#e0b020'); } });
  ST.play(E2,[
    [0,()=>{ setMessage('Justin is on the couch. The game is on.'); scene('jv_tv',5.8,{back:true,x:Math.max(70,me.x-175),base:me.base-26,w:104,flag:2.7}); }],
    [250,()=>say(m.id,'bad_call_couch')],
    [1150,()=>setMessage('Something is not right with that play.')],
    [1620,()=>{ setMessage('He is up. He is pointing.'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',2420],
    [2030,()=>{ scene('jv_callwave',.9,{x0:me.x-50,x1:F.x+F.w*.4,y:F.mid}); sfx.bump&&sfx.bump(); say(m.id,'bad_call'); }],
    [2420,()=>{ sfx.bonk&&sfx.bonk(); jitter(f); landHit(100); scene('jv_text',1,{x:me.x-20,y:me.base-me.h-6,txt:'WHAT?!',c:'#ff7a5a',sc:3}); scene('jv_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:40,c:'#ffd27a'}); }],
    [2900,()=>{ sfx.thud&&sfx.thud(); ST.jolt(f,.2); scene('jv_poof',.5,{x:me.x,y:me.base,r:30}); }],
    [3560,'end',res(E2)+'The ref has been told.']]); };

// ---------- Fresh Fit ----------
SC.jv_dazzle=(s,u)=>{ gfx.globalAlpha=fade(u,.3)*.8; R(0,0,576,324,'#ffffff'); gfx.globalAlpha=fade(u,.7); for(let k=0;k<12;k++) { const a=k*Math.PI/6+u,d=ez(u)*(24+k%3*14); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,5+k%3*3,k%2?'#fff3a0':'#ffd6f0',u*5); } for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(s.x,s.y,s.x+Math.cos(a)*(30+u*40),s.y+Math.sin(a)*(30+u*40),3,'#fff8c0'); } };
J.fresh_fit=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),mid={x:Math.max(me.x-130,F.x+F.w*.5+90),y:me.base};
  // sheet 04 redo (lwire1 session): frames 1 to 5 everyday clothes, 6 the swap spin, 7 to 16 the green suit
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'lin'},{t:1000,x:mid.x,y:mid.y,f:'idle'}];
  K.push(...seq([['idle',300],['ab_fit_1',300],['ab_fit_2',300],['ab_fit_3',250],['ab_fit_4',250],['ab_fit_5',150],['ab_fit_6',150],['ab_fit_7',450],['ab_fit_8',200]],1000,mid.x,mid.y));   // everyday clothes until the flash, then the suit
  K.push({t:3350,x:mid.x,y:mid.y,f:'ab_fit_1R',ease:'lin'},{t:4100,x:'home',y:'home',f:'ab_fit_1R'},{t:4350,f:'idle'});
  ST.keys(fx,K);
  const body={x:mid.x,y:mid.y-me.h*.5};
  ST.play(E2,[
    [0,()=>{ setMessage('Justin walks it out like a runway.'); say(m.id,'fresh_fit_runway'); }],
    [300,()=>sfx.step&&sfx.step()],
    [1300,()=>{ setMessage('Quick change.'); sfx.whoosh&&sfx.whoosh(); scene('jv_flash',.22,{a:.55,c:'#fff3a0'}); scene('jv_poof',.5,{x:body.x,y:body.y,n:10,r:34,c:'#fff8e8'}); scene('jv_sparks',.6,{x:body.x,y:body.y,n:12,r:44,c:GOLD}); }],
    [1700,()=>{ setMessage('Fresh fit.'); sfx.ding&&sfx.ding(); scene('jv_sparks',.5,{x:body.x,y:body.y,n:10,r:30,c:'#9fe6a8',seed:.4}); }],
    [2100,()=>{ setMessage('Pose.'); say(m.id,'fresh_fit'); }],
    ['hf',2650],
    [2650,()=>{ sfx.ding&&sfx.ding(); sfx.whoosh&&sfx.whoosh(); jitter(f); landHit(100); scene('jv_dazzle',.9,{x:F.x,y:F.mid}); }],
    [2850,()=>scene('jv_text',1,{x:mid.x,y:mid.y-me.h-8,txt:'DESIGNER',c:'#ffd6f0',sc:2})],
    [4350,'end',res(E2)+'It cost more than the pond.']]); };

// ---------- Demo Day ----------
SC.jv_chunks=(s,u)=>{ for(let k=0;k<12;k++) { const q=cl(u*1.25-k*.03); if(q<=0||q>=1) continue; const x=s.x+(k-6)*(s.w/12),y=s.top+q*q*(s.h+30)-12; gfx.globalAlpha=1-q*.5; gfx.save(); gfx.translate(x,y); gfx.rotate(q*5+k); if(!PROPART.draw(['justin/brick_chunk','justin/rubble'][k%2],0,0,{h:9+(k%3)*3,flip:k%2===0})) R(-5,-4,10,8,k%2?'#c9bfb0':'#a89d8c'); gfx.restore(); } };
SC.jv_dust=(s,u)=>{ const q=ez(u/.8); gfx.globalAlpha=fade(u,.35)*.9; if(!PROPART.draw('justin/dust_puff',s.x,s.y-q*8,{w:(s.r||30)*2*(.5+q*.7)})) SC.jv_poof(s,u); };
J.demo_day=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,38),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:250,f:'run',ease:'lin'},{t:800,x:p.x,y:p.y,f:'ab_demo_1'}];
  K.push(...seq([['ab_demo_1',300],['ab_demo_2',300],['ab_demo_3',150],['ab_demo_4',350],['ab_demo_5',200],['ab_demo_6',400]],800,p.x,p.y));
  K.push({t:2500,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:3100,x:'home',y:'home',f:'idle'},{t:3300,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin spots a basement wall that has to go.'); say(m.id,'demo_day'); }],
    [250,()=>sfx.step&&sfx.step()],
    [850,()=>setMessage('He hoists the sledgehammer.')],
    ['hf',1550],
    [1550,()=>{ sfx.thud&&sfx.thud(); sfx.bonk&&sfx.bonk(); ST.jolt(f,.4); landHit(45); scene('jv_dust',.5,{x:F.x,y:F.top+10,r:30}); }],
    [1700,()=>scene('jv_chunks',1.1,{x:F.x,top:F.top-20,w:F.w,h:F.h})],
    [2100,()=>{ sfx.thud&&sfx.thud(); sfx.bonk&&sfx.bonk(); ST.jolt(f,.6); landHit(55); scene('jv_dust',.6,{x:F.x,y:F.top+20,r:40}); }],
    [2200,()=>{ scene('jv_chunks',1.3,{x:F.x,top:F.top-30,w:F.w+20,h:F.h}); scene('jv_text',1,{x:F.x,y:F.top-14,txt:'DEMO DAY',c:'#ffe08a',sc:2}); }],
    [2300,()=>say(m.id,'demo_day_done')],
    [3300,'end',res(E2)+'The wall is coming down.']]); };

// ---------- Breaker Flip ----------
SC.jv_bolt=(s,u)=>{ const q=cl(u/.55); gfx.globalAlpha=fade(u,.5); const seg=8; let px=s.x,py=-4; for(let k=1;k<=seg;k++) { const nx=s.x+(k%2?-1:1)*(10-k)*(1+(k*7%3)),ny=lerp(-4,s.y,k/seg); if(k/seg<=q+.12) { Ln(px,py,nx,ny,8,'#9fd8ff'); Ln(px,py,nx,ny,3,'#ffffff'); } px=nx; py=ny; } };
J.breaker_flip=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:150,x:'home',y:'home',f:'ab_breaker_1'}];
  K.push(...seq([['ab_breaker_1',350],['ab_breaker_2',150],['ab_breaker_8',400],['ab_breaker_5',800],['ab_breaker_6',400],['ab_breaker_7',350],['ab_breaker_9',600]],150,'home','home'));
  K.push({t:3200,x:'home',y:'home',f:'idle'},{t:3500,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Justin finds the panel. Which breaker is it.')],
    [650,()=>say(m.id,'breaker_flip')],
    [700,()=>{ sfx.thud&&sfx.thud(); setMessage('Breaker off.'); scene('jv_dark',2.5,{a:.74}); }],
    [1100,()=>setMessage('Three. Two. One.')],
    ['hf',2300],
    [1750,()=>say(m.id,'breaker_flip_on')],
    [1800,()=>sfx.whoosh&&sfx.whoosh()],
    [1850,()=>{ sfx.thud&&sfx.thud(); setMessage('Breaker on.'); }],
    [2300,()=>{ sfx.zap&&sfx.zap(); sfx.bonk&&sfx.bonk(); jitter(f); landHit(100); scene('jv_bolt',.6,{x:F.x,y:F.mid}); scene('flash',.35,{a:.6}); scene('jv_zapfx',.6,{x:F.x,y:F.mid}); scene('jv_text',.9,{x:F.x,y:F.top-8,txt:'ZAP',c:'#9fd8ff',sc:3}); }],
    [3150,'end',res(E2)+'Back on. Mostly.']]); };

// ---------- Giant Sneeze ----------
// Quick build, then the sneeze frames are held long (Tom, 13:51); everything around them is fast. Already timed: not scaled below.
J.giant_sneeze=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ab_sneeze_1'}];
  K.push(...seq([['ab_sneeze_1',350],['ab_sneeze_2',400],['ab_sneeze_3',350],['ab_sneeze_4',800],['ab_sneeze_5',200],['ab_sneeze_6',200]],0,'home','home'));   // the sneeze keeps its long hold
  K.push({t:2300,x:'home',y:'home',f:'idle'},{t:2600,f:'idle'});
  ST.keys(fx,K);
  const x0=f.px,slideMax=Math.min(90,Math.max(30,x0-F.w*.5-12));
  const back=()=>{ f.px=x0; };
  SC.jv_gale=SC.jv_gale||((s,u)=>{ gfx.globalAlpha=fade(u,.5)*.8; for(let k=0;k<9;k++) { const q=cl(u*1.5-k*.03),x=s.x0-q*(s.x0-s.x1),y=s.y+(k-4)*9+Math.sin(q*8+k)*3; Ln(x,y,x-22-k%3*8,y,3-k%2,k%2?'#ffffff':'#bfe4ff'); } });
  ST.play(E2,[
    [0,()=>setMessage('Justin\'s nose twitches.')],
    [330,()=>{ setMessage('Ah...'); say(m.id,'giant_sneeze_build'); }],
    [750,()=>{ setMessage('Ah...'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',1100],
    [1050,()=>say(m.id,'giant_sneeze')],
    [1100,()=>{ setMessage('AH CHOOOOO!'); sfx.sneeze&&sfx.sneeze(); scene('jv_gale',.8,{x0:me.x-34,x1:F.x+F.w*.4,y:me.base-me.h*.7}); scene('jv_text',1.1,{x:me.x-20,y:me.base-me.h-4,txt:'CHOO!',c:'#bfe4ff',sc:3}); battle.shake=Math.max(battle.shake||0,.5); }],
    [1230,()=>{ jitter(f); landHit(100); ST.draw((s,u)=>{ f.px=x0-ez(u/.7)*slideMax; if(u>=1) back(); },1.1); }],
    [2450,()=>{ back(); setMessage(f.name+' is blown across the room.'); }],
    [2900,'end',res(E2)+'Bless him.']]); };

// ---------- Foot Tap ----------
// Rose (Grace if Rose is down) walks over and taps his sneaker toe. The scream is the hit, and its pained faces are held long
// (Tom, 13:51); the rest is fast. Already timed: not scaled below.
J.foot_tap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const alive=id=>B2.party.find(p=>p.id===id&&p.hp>0&&!p.dead&&!p.calm);
  const tp=alive('rose')||alive('grace')||B2.party.find(p=>p!==m&&p.hp>0&&!p.dead&&!p.calm)||null,tn=tp?tp.name:'Rose';
  if(tp) { const T=ST.unit(tp),spot={x:me.x-58,y:me.base+2},tfx=battle.fx[tp.idx],go=T.x<spot.x?'runR':'run',bk=T.x<spot.x?'run':'runR';
    ST.keys(tfx,[{t:0,x:'home',y:'home',f:'idle'},{t:150,x:'home',y:'home',f:'idle'},{t:750,x:spot.x,y:spot.y,f:go,ease:'lin'},{t:850,x:spot.x,y:spot.y,f:'flip'},{t:1050,x:spot.x,y:spot.y,f:'kneel'},{t:1300,x:spot.x,y:spot.y,f:'flip'},{t:1700,x:spot.x,y:spot.y,f:'flip'},{t:2250,x:'home',y:'home',f:bk,ease:'lin'},{t:2400,x:'home',y:'home',f:'idle'},{t:3740,f:'idle'}]); }
  const K=[{t:0,x:'home',y:'home',f:'ab_foot_1'}];
  K.push(...seq([['ab_foot_1',1190],['ab_foot_2',350],['ab_foot_3',1100],['ab_foot_4',150],['ab_foot_5',150],['ab_foot_6',300],['ab_foot_7',200]],0,'home','home'));   // the scream keeps its long hold
  K.push({t:3440,x:'home',y:'home',f:'idle'},{t:3740,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin is just standing there in the nicest sneakers.'); say(m.id,'foot_tap_idle'); }],
    [650,()=>setMessage(tp?tn+' comes over, very quietly.':'Nobody is near, so the floor does it for them.')],
    [1000,()=>setMessage(tp?tn+' taps his toe. Lightly.':'Something taps his toe. Lightly.')],
    [1100,()=>{ if(tp) say(tp.id,'foot_tap_tap'); }],
    [1050,()=>sfx.step&&sfx.step()],
    ['hf',1540],
    [1190,()=>{ sfx.bump&&sfx.bump(); scene('jv_ring',.4,{x:me.x-34,y:me.base-6,r:14,c:'#ffffff'}); }],
    [1520,()=>say(m.id,'foot_tap')],
    [1540,()=>{ sfx.bonk&&sfx.bonk(); sfx.thud&&sfx.thud(); battle.shake=Math.max(battle.shake||0,.7); jitter(f); landHit(100); scene('jv_text',1.1,{x:me.x-12,y:me.base-me.h-6,txt:'OUCH!',c:'#ff7a5a',sc:3}); scene('jv_ring',.7,{x:me.x-20,y:me.base-me.h*.5,r:70,c:'#ffd27a'}); scene('jv_ring',.9,{x:me.x-20,y:me.base-me.h*.5,r:120,c:'#ffffff'}); }],
    [2200,()=>{ ST.jolt(f,.5); scene('jv_text',1.2,{x:me.x-12,y:me.base-me.h-6,txt:'MY FOOT!',c:'#ff7a5a',sc:3}); }],
    [3740,'end',res(E2)+'He is fine. He is fine.']]); };

// ---------- DRYWALL (special): carries a sheet in, screws it up in front of the party, all damage halved ----------
SC.jv_sheet=(s,u)=>{ const x=s.x,base=s.base,h=s.h,w=s.w,q=1,a=fin(u,.06)*(u>.9?(1-u)/.1:1); gfx.globalAlpha=a;
  gfx.save(); gfx.translate(x,base); gfx.rotate(-(1-q)*1.2); if(PROPART.draw('justin/drywall_sheet',0,-h/2,{h,w:Math.min(h*.49,w+12)})) { gfx.restore(); return; }   // painted sheet with its four screws; the drawn one below is the fallback
  R(-w/2,-h,w,h,'#ebe4d6'); R(-w/2,-h,w,4,'#fff9ec'); R(-w/2,-h,3,h,'#cfc6b4'); R(w/2-3,-h,3,h,'#cfc6b4');
  for(let k=1;k<4;k++) R(-w/2+6,-h+k*h/4-1,w-12,2,'#d8d0c0');
  const sc=cl((u-.3)/.5); for(let k=0;k<4;k++) if(sc>k/4) E(-w/2+7+(k%2)*(w-14),-h+10+Math.floor(k/2)*(h-20),2.5,2.5,'#8a8f98');
  gfx.restore(); };
J.drywall=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const live=B2.party.filter(p=>p.hp>0&&!p.dead),xs=live.map(p=>ST.unit(p).x),xmax=Math.max(...xs,me.x),xmin=Math.min(...xs,me.x),by=Math.max(...live.map(p=>ST.unit(p).base),me.base);
  const sx=xmin-52,sw=Math.max(40,Math.min(58,(xmax-xmin)*.18+30)),sh=Math.min(170,me.h+6),px=sx+sw+12;
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:150,x:'home',y:'home',f:'ab_dry_1',ease:'lin'},{t:900,x:px,y:by+2,f:'ab_dry_1'}];   // he carries the sheet in (it is painted in his hands)
  K.push(...seq([['ab_dry_2',250],['ab_dry_3',250],['ab_dry_4',500],['ab_dry_5',300],['ab_dry_6',350]],900,px,by+2));
  K.push({t:2550,x:px,y:by+2,f:'runR',ease:'lin'},{t:3100,x:'home',y:'home',f:'idle'},{t:3250,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin has a sheet of drywall under his arm.'); say(m.id,'drywall_sheet'); }],
    [150,()=>sfx.whoosh&&sfx.whoosh()],
    [950,()=>{ sfx.thud&&sfx.thud(); setMessage('He stands it in front of everyone.'); say(m.id,'drywall'); }],
    [2200,()=>{ sfx.thud&&sfx.thud(); scene('jv_sheet',2.2,{x:sx,base:by+2,h:sh,w:sw}); }],   // the sheet he screwed up (painted in his frames) stays standing in front of the party
    [1400,()=>{ sfx.drill&&sfx.drill(); }],
    ['hf',1600],
    [1600,()=>{ sfx.drill&&sfx.drill(); }],
    [2250,()=>{ sfx.ding&&sfx.ding(); scene('jv_sparks',.7,{x:sx,y:by-sh*.5,n:9,r:34,c:'#ebe4d6'}); scene('jv_text',1.1,{x:sx+20,y:by-sh-8,txt:'HALF DAMAGE',c:'#ebe4d6',sc:2}); }],
    [3250,'end',res(E2)+'Let it dry.']]); };

// Tom (13:51): his moves should be faster. Every move except the two hand-timed ones above plays at about 1.5x.
(function(){ const S0=1.6,SLOW={giant_sneeze:1.4,foot_tap:1.4};   // timeline stretch per move (Tom 18:16: trimmed moves played too fast, slow the key frames)
  for(const key of Object.keys(J)) { const S=SLOW[key]||S0; const fn=J[key];
    J[key]=E2=>{ const k0=ST.keys,p0=ST.play;
      ST.keys=(fx,K)=>k0(fx,K.map(o=>Object.assign({},o,{t:o.t*S})));
      ST.play=(e,list)=>p0(e,list.map(it=>it[0]==='hf'?['hf',it[1]*S]:[it[0]*S,...it.slice(1)]));
      try { return fn(E2); } finally { ST.keys=k0; ST.play=p0; } }; } })();
})();
