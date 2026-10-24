'use strict';
// engine/tnb-moves.js — TNB's attacks, built from his hobbies: pottery, longboarding, horror movies, mass transit, working as a wardrobe runner on film sets.
// Same shape as tom-moves.js: RECRUIT_MOVES.tnb[key] queues steps and registers scenes (RFX.SC) and props (PROP2).
// Also holds his special, WARDROBE (he rolls out the wardrobe rack and dresses someone in something fresh and cozy).
RECRUIT_MOVES.tnb={};
(function(){
const SC=RFX.SC,{scene,hold,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const appr=(fx,d)=>{ fx.appr=d; fx.apprDur=d; };
const path=(fx,dur,fn)=>{ fx.path={t:0,dur,fn}; return fx.path; };
const hit=E2=>landHit(E2.dmg,E2.crit);
const part=(E2,n,k)=>landHit(Math.max(1,Math.round(E2.dmg/n)),E2.crit&&k===n-1);
const pos=()=>battle.actorPos||{cx:519,base:315,h:90};
const hand=()=>{ const a=battle.actorHand; if(a) return {x:a.n[0]-8,y:a.n[1]-8}; const p=pos(); return {x:p.cx-20,y:p.base-60}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const confuseMaybe=c=>{ if(!battle.missing&&Math.random()<c) { battle.enemyStunned=2; sfx.stun(); return true; } return false; };
const enemyName=()=>((battle.enemy&&battle.enemy.def&&battle.enemy.def.short)||'Grump').toUpperCase();
const T=RECRUIT_MOVES.tnb;

// ================= Sounds =================
const S={
  ding(){ tone({type:'triangle',f0:1175,dur:.25,vol:.16}); tone({type:'triangle',f0:932,dur:.35,vol:.16,delay:.22}); },
  horn(){ tone({type:'square',f0:311,dur:.55,vol:.12,filter:1400}); tone({type:'square',f0:370,dur:.55,vol:.1,filter:1400}); },
  rumble(d=1.4){ noise({dur:d,vol:.16,f0:400,f1:120,type:'lowpass'}); tone({type:'triangle',f0:60,f1:45,dur:d,vol:.18}); },
  roll(d=1){ noise({dur:d,vol:.1,f0:1800,f1:900,type:'bandpass',q:.7}); },
  clack(){ noise({dur:.08,vol:.4,f0:3500,f1:900,type:'bandpass',q:1}); tone({type:'square',f0:900,f1:300,dur:.06,vol:.22}); },
  drone(d=1.6){ tone({type:'sawtooth',f0:55,f1:52,dur:d,vol:.12,filter:300,sweep:'linear'}); tone({type:'sine',f0:110,f1:104,dur:d,vol:.06}); },
  sting(){ noise({dur:.35,vol:.35,f0:5000,f1:1200,type:'bandpass',q:.6}); tone({type:'sawtooth',f0:1400,f1:1250,dur:.45,vol:.14}); tone({type:'sawtooth',f0:1480,f1:1320,dur:.45,vol:.12}); },
  walkie(){ noise({dur:.18,vol:.14,f0:2500,f1:2400,type:'bandpass',q:4}); tone({type:'square',f0:1600,dur:.04,vol:.06,delay:.2}); }
};

// ================= Props =================
PROP2.tnbmug=(q,u)=>{ const c=q.c||'#5aa6a8'; R(-11,-11,21,22,OUT); R(-9,-9,17,18,c); R(-9,-9,5,18,'rgba(255,255,255,.28)'); gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.arc(11,0,6,-1.3,1.3); gfx.stroke(); gfx.strokeStyle=c; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(11,0,6,-1.3,1.3); gfx.stroke(); R(-9,-9,17,3,'#f4efe0'); };

// ================= Scenes =================
// The longboard under TNB's feet, wherever he is. s.tilt leans it.
const board=(x,y,tilt=0)=>{
  gfx.save(); gfx.translate(x,y); gfx.rotate(tilt);
  for(const wx of [-24,22]) { E(wx,8,6,6,OUT); E(wx,8,4,4,'#e0402e'); E(wx,8,1.5,1.5,'#ffe08a'); }
  R(-38,-1,76,9,OUT); R(-36,1,72,5,'#c48a4a'); R(-36,1,72,2,'#2b2a26'); R(-30,5,60,1,'#9a6a36');
  E(-38,3,4,4.5,OUT); E(38,3,4,4.5,OUT); E(-37,3,2.6,3,'#c48a4a'); E(37,3,2.6,3,'#c48a4a');
  gfx.restore();
};
SC.board=(s,u)=>{
  const p=pos(); gfx.globalAlpha=u>.96?(1-u)/.04:1;
  board(p.cx,p.base+2,s.tilt?Math.sin(s.t*6)*.08:0);
  if(s.lines) for(let k=0;k<4;k++) R(p.cx+44+k*12,p.base-14-k*12,18-k*3,3,'rgba(255,246,220,'+(.6-k*.12)+')');
};
// S-shaped carve marks on the ground.
SC.carvetrail=(s,u)=>{
  gfx.globalAlpha=env(u,.05,.7)*.75;
  gfx.strokeStyle='#fff6dc'; gfx.lineWidth=3; gfx.setLineDash([10,8]); gfx.beginPath();
  const x0=s.x0,x1=s.x1,n=Math.round(lerp(0,40,cl(u/.6)));
  for(let k=0;k<=n;k++) { const q=k/40,x=lerp(x0,x1,q),y=s.y+Math.sin(q*Math.PI*3)*14; if(k===0) gfx.moveTo(x,y); else gfx.lineTo(x,y); }
  gfx.stroke(); gfx.setLineDash([]);
};
// The steep hill TNB bombs down. Back scene.
const hillY=x=>{ const q=cl((x-330)/240); return 284-ez(q)*150; };
SC.bighill=(s,u)=>{
  gfx.globalAlpha=env(u,.06,.94);
  gfx.beginPath(); gfx.moveTo(300,324); for(let x=300;x<=580;x+=6) gfx.lineTo(x,hillY(x)); gfx.lineTo(580,324); gfx.closePath();
  gfx.fillStyle='#7aa860'; gfx.fill(); gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke();
  gfx.save(); gfx.clip(); for(let k=0;k<10;k++) R(330+k*26,hillY(330+k*26)+14+(k%3)*12,12,3,'#5f8f4c'); gfx.restore();
  // a road on the slope
  gfx.strokeStyle='#5e6670'; gfx.lineWidth=10; gfx.beginPath(); for(let x=320;x<=576;x+=6) { const y=hillY(x)+6; if(x===320) gfx.moveTo(x,y); else gfx.lineTo(x,y); } gfx.stroke();
  gfx.strokeStyle='#ffe08a'; gfx.lineWidth=2; gfx.setLineDash([8,8]); gfx.beginPath(); for(let x=320;x<=576;x+=6) { const y=hillY(x)+6; if(x===320) gfx.moveTo(x,y); else gfx.lineTo(x,y); } gfx.stroke(); gfx.setLineDash([]);
  // sign at the top
  const sx=548,sy=hillY(548); R(sx-2,sy-46,4,46,OUT); poly([[sx,sy-62],[sx+16,sy-46],[sx,sy-30],[sx-16,sy-46]],'#ffd166',true);
  label('!',sx,sy-50,OUT,2);
};
// A giant film slate over the monster. s.text is the scene line; the arm snaps shut at s.snap (0..1).
const slate=(x,y,open,lines)=>{
  RO(x-62,y,124,74,'#2b2a26');
  R(x-60,y+2,120,2,'#fff6dc'); R(x-60,y+26,120,2,'#fff6dc'); R(x-60,y+50,120,2,'#fff6dc'); R(x-2,y+28,2,46,'#fff6dc');
  label(lines[0],x,y+12,'#fff6dc',2); label(lines[1],x-31,y+36,'#fff6dc',1); label(lines[2],x+31,y+36,'#fff6dc',1);
  label('WARDROBE',x-31,y+60,'#ffe08a',1); label('ROLL 1',x+31,y+60,'#fff6dc',1);
  // stripes bar, hinged at the left
  RO(x-62,y-16,124,14,'#fff6dc'); for(let k=0;k<6;k++) poly([[x-60+k*21,y-14],[x-50+k*21,y-14],[x-58+k*21,y-4],[x-68+k*21,y-4]].map(p=>[Math.max(x-60,p[0]),p[1]]),'#2b2a26');
  gfx.save(); gfx.translate(x-62,y-16); gfx.rotate(-open*.7);
  R(-2,-16,128,16,OUT); R(0,-14,124,12,'#fff6dc'); for(let k=0;k<6;k++) poly([[4+k*21,-14],[14+k*21,-14],[6+k*21,-2],[-4+k*21,-2]].map(p=>[Math.max(0,p[0]),p[1]]),'#2b2a26');
  gfx.restore();
};
SC.slate=(s,u)=>{
  const drop=ez(u/.2),y=lerp(-110,s.y||104,drop),snap=s.snap||.6;
  const open=u<.25?1:(u<snap-.06?1:(u<snap?(snap-u)/.06:0));
  gfx.globalAlpha=u>.9?(1-u)/.1:1;
  slate(GX,y,open,s.lines||['SCENE 1','TAKE 1',enemyName()]);
  if(u>snap&&u<snap+.12) { gfx.globalAlpha=1-(u-snap)/.12; for(let k=0;k<8;k++) { const a=k/8*Math.PI*2; Ln(GX-62+Math.cos(a)*10,y-16+Math.sin(a)*10,GX-62+Math.cos(a)*34,y-16+Math.sin(a)*34,3,'#fff6dc'); } }
};
// Film-set dressing: REC dot and a frame, like a monitor.
SC.monitor=(s,u)=>{
  gfx.globalAlpha=env(u,.05,.9);
  gfx.strokeStyle='#fff6dc'; gfx.lineWidth=3;
  for(const [x,y,dx,dy] of [[60,40,1,1],[516,40,-1,1],[60,280,1,-1],[516,280,-1,-1]]) { gfx.beginPath(); gfx.moveTo(x,y+dy*22); gfx.lineTo(x,y); gfx.lineTo(x+dx*22,y); gfx.stroke(); }
  if(Math.floor(s.t*2.5)%2===0) E(80,58,6,6,'#e0402e'); label('REC',104,55,'#fff6dc',2);
  label('00:0'+Math.floor(s.t)+':'+String(Math.floor(s.t*24)%24).padStart(2,'0'),470,55,'#fff6dc',2);
};
// The train. Front of the train starts at s.x0 and ends at s.x1. Passes in front of everyone.
const train=(fx,y,flip)=>{
  const L=380,H=96;
  // body
  gfx.beginPath(); gfx.moveTo(fx,y-H+30); gfx.quadraticCurveTo(fx,y-H,fx+34,y-H); gfx.lineTo(fx+L,y-H); gfx.lineTo(fx+L,y-14); gfx.lineTo(fx,y-14); gfx.closePath();
  gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#dfe3e6'; gfx.fill();
  R(fx+2,y-44,L-2,10,'#e0a028'); R(fx+2,y-34,L-2,6,'#c0402e');
  // windshield and a driver who looks a lot like TNB
  poly([[fx+6,y-H+30],[fx+30,y-H+8],[fx+56,y-H+8],[fx+56,y-52],[fx+6,y-52]],'#2f4d63',true);
  E(fx+38,y-64,8,8,'#f7ad7c'); R(fx+30,y-74,16,6,'#795338'); R(fx+32,y-55,14,3,'#213d53');
  // windows and passengers
  for(let k=0;k<6;k++) { const wx=fx+72+k*50; RO(wx,y-H+12,36,30,'#9fc8d8'); E(wx+18,y-H+36,7,7,['#2b2a26','#795338','#c9a03e','#525053','#ab7a47','#2b2a26'][k]); R(wx+3,y-H+14,8,26,'rgba(255,255,255,.35)'); }
  // doors
  for(const dx of [150,300]) { R(fx+dx-2,y-H+4,24,H-20,OUT); R(fx+dx,y-H+6,20,H-24,'#c9ccd4'); R(fx+dx+9,y-H+6,2,H-24,OUT); }
  // headlight and destination sign
  E(fx+10,y-24,6,5,OUT); E(fx+10,y-24,4,3.5,'#fff6c8');
  RO(fx+64,y-H-14,110,14,'#2b2a26'); label('EXPRESS',fx+119,y-H-10,'#ffd166',2);
  // wheels and rail
  for(const wx of [40,90,L-90,L-40]) { E(fx+wx,y-10,13,13,OUT); E(fx+wx,y-10,10,10,'#5e6670'); E(fx+wx,y-10,3,3,'#aeb3ba'); }
};
SC.track=(s,u)=>{ gfx.globalAlpha=env(u,.05,.95); R(-10,s.y-2,600,6,OUT); R(-10,s.y-1,600,3,'#aeb3ba'); for(let x=-10;x<590;x+=24) R(x,s.y+4,14,5,'#6b4429'); };
SC.train=(s,u)=>{
  const fx=lerp(s.x0||620,s.x1||-460,u),y=s.y||272;
  train(fx,y);
  for(let k=0;k<6;k++) R(fx+380+10+k*18,y-90+k*14,30-k*4,3,'rgba(255,246,220,'+(.6-k*.09)+')');
};
// The "next stop" sign that drops in before the train.
SC.stopsign=(s,u)=>{
  const y=lerp(-50,24,ez(u/.15)); gfx.globalAlpha=u>.85?(1-u)/.15:1;
  RO(GX-112,y,224,40,'#1d3a8a'); R(GX-108,y+4,216,32,'#284fb4');
  label('NEXT STOP',GX,y+8,'#fff6dc',2); label(enemyName(),GX,y+22,'#ffd166',2);
  E(GX+96,y+20,9,9,'#fff6dc'); label('M',GX+96,y+17,'#1d3a8a',1);
};
// A headlight coming out of the dark.
SC.headlight=(s,u)=>{
  const r=lerp(4,140,u*u),x=lerp(560,420,u),y=212;
  gfx.globalAlpha=cl(u*1.4); E(x,y,r*1.6,r,'rgba(255,246,200,.25)'); E(x,y,r,r*.7,'rgba(255,246,200,.6)'); E(x,y,r*.4,r*.3,'#ffffff');
};
// VHS look: scanlines, static and PLAY.
SC.vhs=(s,u)=>{
  gfx.globalAlpha=env(u,.05,.9)*.5;
  for(let y=0;y<324;y+=4) R(0,y,576,1,'rgba(0,0,0,.6)');
  gfx.globalAlpha=env(u,.05,.9);
  for(let k=0;k<26;k++) { const a=rr(s,k+Math.floor(s.t*20)); R(Math.floor(a*576),Math.floor(rr(s,k+40+Math.floor(s.t*20))*324),2+Math.floor(a*6),2,'rgba(255,255,255,.5)'); }
  label(s.text||'PLAY >',70,30,'#fff6dc',3);
};
// Eyes opening in the dark behind the monster.
SC.eyes=(s,u)=>{
  const open=cl((u-.1)/.25),blink=Math.floor(s.t*3)%7===6?.1:1,h=7*open*blink;
  gfx.globalAlpha=env(u,.1,.9);
  for(const ex of [GX-34,GX+34]) { E(ex,120,16,h+2,'#3a0a0a'); E(ex,120,13,h,'#ffe08a'); E(ex+2,120,3,Math.max(1,h-1),'#2b0a0a'); }
};
// The big scary face. Hand-drawn pixel ghoul.
SC.scare=(s,u)=>{
  const k=u<.12?lerp(.3,1.15,u/.12):(u<.2?lerp(1.15,1,(u-.12)/.08):1),x=GX,y=150;
  gfx.globalAlpha=u>.75?(1-u)/.25:1;
  gfx.save(); gfx.translate(x+(u<.4?(Math.random()-.5)*10:0),y); gfx.scale(k,k);
  E(0,0,94,104,OUT); E(0,0,90,100,'#d8e4d0'); E(-20,-30,40,30,'#e8f0e0');
  E(-38,-18,24,28,OUT); E(38,-18,24,28,OUT); E(-38,-14,6,6,'#ff3b3b'); E(38,-14,6,6,'#ff3b3b');
  poly([[-6,6],[6,6],[0,22]],'#5a6a58');
  E(0,58,46,30,OUT); for(let j=0;j<7;j++) poly([[-40+j*12,38],[-28+j*12,38],[-34+j*12,56]],'#fff6dc'); for(let j=0;j<6;j++) poly([[-34+j*12,80],[-22+j*12,80],[-28+j*12,64]],'#fff6dc');
  for(let j=0;j<4;j++) R(-70+j*40,-96+((j%2)*6),6,22,'#a8b8a0');
  gfx.restore();
};
SC.yikes=(s,u)=>{ gfx.globalAlpha=env(u,.1,.75); const b=Math.round(Math.abs(Math.sin(s.t*12))*8); label('!!',GX+64,(battle.enemyTop||170)-26-b,'#ffe08a',4); };
// Movie bars and rolling credits.
SC.letterbox=(s,u)=>{ const k=ez(u/.12)*(u>.9?(1-u)/.1:1); R(0,0,576,46*k,'#000'); R(0,324-46*k,576,46*k,'#000'); };
SC.credits=(s,u)=>{
  const lines=s.lines,sh=u*(lines.length*34+160);
  gfx.globalAlpha=u>.85?(1-u)/.15:1;
  lines.forEach((t,k)=>{ const y=330+k*34-sh; if(y<40||y>290) return; label(t[0],288,y,'#ffd166',1); label(t[1],288,y+10,'#fff6dc',2); });
};
// Wardrobe pieces he throws.
const shirtOn=(c,c2)=>{ gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(-14,-14); gfx.quadraticCurveTo(0,-30,14,-14); gfx.stroke(); gfx.strokeStyle='#aeb3ba'; gfx.lineWidth=2.5; gfx.stroke(); E(0,-26,3,3,'#aeb3ba'); poly([[-16,-14],[16,-14],[24,-4],[16,0],[14,20],[-14,20],[-16,0],[-24,-4]],c,true); R(-2,-12,4,30,c2); };
PROP2.shirt=(q,u)=>shirtOn(q.c||'#e0402e',q.c2||'#fff6dc');
PROP2.tophat=(q,u)=>{ RO(-18,-26,36,26,'#2b2a26'); R(-16,-8,32,5,'#c0402e'); RO(-26,0,52,6,'#2b2a26'); };
PROP2.boa=(q,u)=>{ for(let k=0;k<9;k++) { const a=k/8*Math.PI; E(Math.cos(a)*26,Math.sin(a)*14-4,8,7,k%2?'#ff8fb8':'#ff6b9a'); } };
PROP2.bowtie=(q,u)=>{ poly([[0,0],[-18,-10],[-18,10]],'#e0402e',true); poly([[0,0],[18,-10],[18,10]],'#e0402e',true); E(0,0,5,5,OUT); E(0,0,3,3,'#ff8a7a'); };
// The rolling wardrobe rack, beside TNB.
SC.rack=(s,u)=>{
  const tx=s.x||420,ty=s.y||306,x=lerp(640,tx,ez(u/.2));
  gfx.globalAlpha=u>.92?(1-u)/.08:1;
  R(x-56,ty-120,4,120,OUT); R(x+52,ty-120,4,120,OUT); R(x-58,ty-122,116,5,OUT); R(x-56,ty-121,112,3,'#aeb3ba');
  R(x-62,ty-2,124,5,OUT); for(const wx of [-56,54]) { E(wx+x,ty+6,5,5,OUT); E(wx+x,ty+6,3,3,'#5e6670'); }
  const cs=[['#e0402e','#fff6dc'],['#284fb4','#ffd166'],['#9be39a','#2b2a26'],['#c9b3e6','#fff6dc'],['#ffd166','#e0402e']];
  cs.forEach((c,k)=>{ gfx.save(); gfx.translate(x-40+k*20,ty-88+Math.sin(s.t*3+k)*1.5); gfx.scale(.8,.8); shirtOn(c[0],c[1]); gfx.restore(); });
  RO(x-36,ty-150,72,18,'#fff6dc'); label('WARDROBE',x,ty-147,'#284fb4',2);
};
// The monster, dressed for its scene: top hat, bow tie, boa.
SC.dressed=(s,u)=>{
  const x=battle.enemyX||GX,top=battle.enemyTop||180,k=s.pieces||3;
  gfx.globalAlpha=u>.9?(1-u)/.1:1;
  gfx.save(); gfx.translate(x,top-14); if(k>0) { RO(-18,-26,36,26,'#2b2a26'); R(-16,-8,32,5,'#c0402e'); RO(-26,0,52,6,'#2b2a26'); } gfx.restore();
  gfx.save(); gfx.translate(x,226); if(k>2) for(let j=0;j<9;j++) { const a=j/8*Math.PI; E(Math.cos(a)*40,Math.sin(a)*12+8,8,7,j%2?'#ff8fb8':'#ff6b9a'); } if(k>1) { poly([[0,0],[-18,-10],[-18,10]],'#e0402e',true); poly([[0,0],[18,-10],[18,10]],'#e0402e',true); E(0,0,5,5,OUT); } gfx.restore();
};

// ================= Moves =================
// Mug Toss: a second from the shelf. Free.
T.basic=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage(pick(['TNB lobs a mug at it. A second. He has plenty.','TNB bonks it with a bowl. Handmade. Food safe.'])); hold(i,'mug',1.3,{}); say(m.id,'basic'); },
    300,()=>pose(fx,'wind',.35),320,()=>{ pose(fx,'throw',.34); battle.held=null; const h=hand(); toss('mug',h.x,h.y,GX+6,208,0,.65,70); sfx.whoosh(); },320,
    380,()=>{ sfx.bonk(); sfx.splat(); battle.shakeEnemy=.4; scene('shards',.9,{x:GX+6,y:208,n:12}); scene('crumbs',.8,{x:GX+6,y:208,n:14,c:'#6b4429',sp:90}); scene('burst',.35,{x:GX+10,y:208,c:'#f4efe0'}); bt('CLINK',96,34,'#9fd8ff',3,.8); hit(E2); },
    720,E2.result,()=>checkEnemy()); };

// Carve: hops on the longboard and carves S-turns straight into the monster.
T.carve=E2=>{ const {i,m,fx}=E2; const p0=pos();
  enqueue(()=>{ setMessage('TNB drops his longboard and pushes off. Carve left. Carve right.'); say(m.id,'carve',.2);
      scene('board',2.0,{}); scene('carvetrail',2.0,{x0:p0.cx,x1:250,y:p0.base+8});
      setTimeout(()=>{ if(battle.active) S.roll(1.0); },150);
      path(fx,2.0,(q,c)=>{
        if(q<.55) { const u=q/.55,x=lerp(c.origX,250,u*u*(3-2*u)),wob=Math.sin(u*Math.PI*3); return {cx:x,base:c.origBase-10+wob*14,rot:wob*.12}; }
        if(q<.68) { const u=(q-.55)/.13; return {cx:250+Math.sin(u*Math.PI)*-14,base:c.origBase-10-Math.sin(u*Math.PI)*30,rot:-u*.3}; }
        const u=(q-.68)/.32; return {cx:lerp(250,c.origX,u*u*(3-2*u)),base:c.origBase-10-Math.sin(u*Math.PI)*16,rot:0};
      }); },
    1150,()=>{ sfx.thud(); battle.slash=.22; battle.enemyKnock=.45; scene('burst',.45,{x:214,y:226}); scene('dust',.6,{x:230,y:262,n:6}); bt('CARVED',96,34,'#ffe08a',3,.9); hit(E2); },
    950,E2.result+' TNB rolls back, not even out of breath.',()=>checkEnemy()); };

// Quick Change: TNB rolls in the wardrobe rack and dresses the monster for its scene. Three pieces, three hits.
T.quickchange=E2=>{ const {i,m,fx}=E2; const pieces=['tophat','bowtie','boa'];
  enqueue(()=>{ setMessage('TNB rolls in the wardrobe rack. The '+enemyName().toLowerCase()+' is needed on set. In costume.'); say(m.id,'quickchange',.2); S.roll(.8); scene('rack',4.0,{back:true,x:470}); },
    ...pieces.flatMap((kd,k)=>[k===0?800:450,()=>pose(fx,'wind',.25),220,()=>{ pose(fx,'throw',.3); const h=hand(); toss(kd,h.x,h.y,GX,kd==='tophat'?(battle.enemyTop||180)-24:226,0,.5,70); sfx.whoosh(); },
      500,()=>{ sfx.bonk(); battle.shakeEnemy=.3; scene('burst',.35,{x:GX,y:kd==='tophat'?(battle.enemyTop||180)-14:226,c:'#fff6dc'}); part(E2,3,k); if(k===0) scene('dressed',3.2,{pieces:1}); else battle.scenes.filter(q=>q.kind==='dressed').forEach(q=>q.pieces=k+1); bt(['HAT','BOW TIE','BOA'][k],96,32,'#ffd166',3,.6); }]),
    400,()=>{ sfx.levelChime(); battle.flashEnemy=.3; scene('flash',.25,{a:.35}); bt('CONTINUITY',96,36,'#ff8fb8',3,1.1); },
    1100,E2.result+' It looks great. It is furious about it.',()=>checkEnemy()); };

// Next Stop: the express train comes through. TNB is driving.
T.metro=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('TNB checks the schedule. The express is right on time.'); pose(fx,'hip',1.2); say(m.id,'metro',.2); scene('stopsign',2.8,{}); scene('track',2.8,{y:270,back:true}); S.ding(); },
    900,()=>{ S.horn(); S.rumble(1.8); path(fx,2.0,q=>({hide:q>.05&&q<.95})); scene('train',1.8,{x0:640,x1:-470,y:272}); bt('DING DING',140,22,'#ffd166',2,.8); },
    720,()=>{ battle.enemyKnock=.45; battle.shakeEnemy=.7; battle.flashEnemy=.3; scene('dust',.8,{x:GX,y:262,n:8,sp:20}); bt('DOORS CLOSING',96,36,'#fff6dc',2,1); sfx.thud(); hit(E2); },
    1250,()=>{ pose(fx,'celeb',.8); },
    E2.result+' TNB gives the train a little wave. It waves back.',()=>checkEnemy()); };

// Jump Scare: lights out, VHS hum, eyes in the dark, then BOO. May leave the monster too rattled to act.
T.jumpscare=E2=>{ const {i,m,fx}=E2; let spooked=false;
  enqueue(()=>{ setMessage('TNB puts on his favorite horror movie. He has seen it eleven times.'); say(m.id,'jumpscare',.2); scene('dark',3.4,{a:.85,c:'#06060c'}); scene('vhs',3.4,{}); S.drone(2.2); },
    1100,()=>{ scene('eyes',1.2,{}); },
    1200,()=>{ S.sting(); scene('flash',.25,{a:.8}); scene('scare',1.3,{}); battle.lift={t:0,dur:.7}; battle.flashEnemy=.4; bt('BOO',132,30,'#ff3b3b',5,1); },
    350,()=>{ scene('yikes',1.2,{}); battle.shakeEnemy=.8; hit(E2); spooked=confuseMaybe(.45); },
    800,()=>setMessage(spooked?E2.result+' The '+enemyName().toLowerCase()+' is too scared to move.':E2.result+' TNB was not scared. Not even a little.'),
    1150,()=>checkEnemy()); };

// Kiln Blast: cone six, straight from the studio.
T.kiln=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('TNB opens the kiln. Cone six. Do not touch the door.'); pose(fx,'aim',3.0); say(m.id,'kiln',.3); scene('kiln',3.0,{}); sfx.slideWhistle(); },
    900,()=>{ sfx.fireball(); scene('jet',1.5,{x0:298,y0:236,x1:196,y1:226,w:34,grow:.2,cs:['#ff8c3a','#ffd166','#fff6c8','#ffffff']}); scene('flames',1.4,{x:GX,y:262,w:100,h:120,cs:['#ff8c3a','#ffd166','#fff6c8','#ffffff']}); scene('flash',.45,{c:'#fff2c8',a:.5}); },
    700,()=>{ battle.flashEnemy=.5; battle.shakeEnemy=.7; hit(E2); scene('shards',1.0,{x:GX,y:222,n:14,cs:['#b4573d','#d98f3f','#f4efe0']}); bt('CONE SIX',96,36,'#ffb070',3,1); },
    900,E2.result+' Fired. Let it cool overnight.',()=>checkEnemy()); };

// Bomb the Hill: a hill appears. TNB rides it. No brakes. Never brakes.
T.bomb=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('A hill appears behind TNB. He has been waiting his whole life for this hill.'); say(m.id,'bomb',.3); scene('bighill',3.4,{back:true}); scene('board',3.4,{});
      path(fx,3.4,(q,c)=>{
        if(q<.14) { const u=q/.14; return {cx:lerp(c.origX,552,u),base:lerp(c.origBase,hillY(552),u)-10-Math.sin(u*Math.PI)*60,noShadow:true}; }
        if(q<.32) return {cx:552,base:hillY(552)-10,rot:Math.sin(c.t*14)*.05,noShadow:true};
        if(q<.62) { const u=(q-.32)/.3,x=lerp(552,40,u*u); return {cx:x,base:(x>330?hillY(x):284)-10,rot:x>330?-.35*(1-(x-330)/220)-.2:0,noShadow:true}; }
        if(q<.72) return {hide:true};
        const u=(q-.72)/.28; return {cx:lerp(640,c.origX,1-Math.pow(1-u,2)),base:c.origBase-10,rot:0};
      }); },
    1100,()=>{ bt('NO BRAKES',96,24,'#ffe08a',3,1.2); S.roll(1.2); sfx.slideWhistle(); },
    700,()=>{ for(let k=0;k<6;k++) scene('dust',.5,{x:300-k*20,y:286,n:3,delay:k*.04}); },
    150,()=>{ sfx.thud(); sfx.lineClear(); battle.enemyKnock=.45; battle.shakeEnemy=.8; battle.flashEnemy=.4; scene('ring',.7,{x:GX,y:264,r:120}); scene('burst',.5,{x:GX,y:226,r:70,n:14}); scene('dust',.8,{x:GX,y:262,n:8}); bt('BOMBED',96,36,'#ffb070',4,1); hit(E2); },
    1550,E2.result+' TNB comes back around from the other side. Somehow.',()=>checkEnemy()); };

// That's a Wrap: final take. The last train out of the dark, a rain of mugs, then credits.
T.wrap=E2=>{ const {i,m,fx}=E2;
  const credits=[['STARRING','THE '+enemyName()],['DIRECTED BY','TOM'],['WARDROBE','TNB'],['MUGS BY','TNB'],['TRAIN BY','METRO'],['NO MONSTERS WERE','HARMED. MOSTLY.']];
  enqueue(()=>{ setMessage('TNB checks the call sheet. "Last scene of the day. Everybody in costume. Final take."'); appr(fx,2.6); say(m.id,'wrap',.2); S.walkie(); scene('monitor',2.4,{}); scene('slate',2.2,{snap:.66,lines:['FINAL SCENE','TAKE 99',enemyName()]}); },
    1450,()=>{ S.clack(); pose(fx,'act',.5); bt('ACTION',96,30,'#ffe08a',4,.8); battle.shakeEnemy=.4; },
    900,()=>{ scene('dark',2.4,{a:.85,c:'#06060c'}); scene('headlight',1.1,{}); S.drone(1.2); S.horn(); },
    1000,()=>{ S.rumble(1.4); scene('track',1.6,{y:270,back:true}); scene('train',1.2,{x0:640,x1:-470,y:272}); scene('flash',.3,{c:'#fff6c8',a:.6}); },
    430,()=>{ battle.enemyKnock=.45; battle.shakeEnemy=.7; sfx.thud(); part(E2,2,0); bt('LAST TRAIN',96,36,'#ffd166',3,.7); },
    900,()=>{ const cs=['#5aa6a8','#b4573d','#d98f3f','#8aa6a8','#c9b3e6']; for(let k=0;k<9;k++) toss('tnbmug',120+k*12,-30-k*6,GX-30+(k*23)%60,196+(k%3)*12,k*.09,.55,0,{c:cs[k%5]}); sfx.whoosh(); bt('MUG RAIN',96,36,'#9fd8ff',3,.9); },
    800,()=>{ sfx.bonk(); sfx.splat(); battle.shakeEnemy=.8; battle.flashEnemy=.5; scene('shards',1.0,{x:GX,y:214,n:22}); part(E2,2,1); },
    500,()=>{ scene('letterbox',4.2,{}); scene('credits',4.2,{lines:credits}); pose(fx,'celeb',1.5); sfx.fanfare(); bt('THAT\'S A WRAP',96,22,'#ffe08a',3,1.6); },
    1800,()=>{ scene('confetti',1.6,{x0:70,x1:300,n:40}); },
    2400,E2.result+' That is a wrap on the '+enemyName().toLowerCase()+'. Great work, everybody.',()=>checkEnemy()); };

// ================= Special: WARDROBE =================
// Rolls out the wardrobe rack. Revives a fallen member at half HP, otherwise dresses the most hurt one in something cozy for +8 HP.
window.cmdWardrobe=function() {
  busy();
  const i=battle.actor,m=party[i],fx=battle.fx[i];
  pose(fx,'hip',1.6);
  S.roll(.7);
  say(m.id,'wardrobe');
  const down=party.find(p=>!alive(p));
  const target=down||party.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
  const ti=party.indexOf(target);
  scene('rack',3.2,{back:true,x:470});
  enqueue(
    ()=>{ setMessage(m.name+' rolls out the wardrobe rack. "Arms up. New look."'); },
    1000,()=>{ pose(fx,'throw',.4); const tp=BATTLE_POS[ti]; toss('shirt',400,200,tp.x*3,tp.base*3-60,0,.6,70,{c:'#284fb4',c2:'#ffd166'}); sfx.whoosh(); },
    650,()=>{
      let h;
      if(down) { h=Math.ceil(target.maxHp/2); target.hp=h; }
      else { h=Math.min(8,target.maxHp-target.hp); target.hp+=h; }
      pop('+'+h,BATTLE_POS[ti].x,BATTLE_POS[ti].base-34,'#9be39a'); sfx.heal(); refreshBattleStatus();
      scene('glow',.8,{x:BATTLE_POS[ti].x*3,y:BATTLE_POS[ti].base*3-40,c:'#9be39a',a:.35});
      scene('confetti',.9,{x0:BATTLE_POS[ti].x*3-40,x1:BATTLE_POS[ti].x*3+40,n:14});
    },
    down?target.name+' is back up. A fresh outfit can turn anyone’s day around.':(target.hp>=target.maxHp?target.name+' is good as new. And very well dressed.':target.name+' gets a cozy sweater. +8 HP.'),
    ()=>afterAction()
  );
};
})();
