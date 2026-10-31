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
PROP2.tophat=(q,u)=>{ if(PROPART.draw('tnb/top_hat',0,-10,{h:36})) return; RO(-18,-26,36,26,'#2b2a26'); R(-16,-8,32,5,'#c0402e'); RO(-26,0,52,6,'#2b2a26'); };
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
      b7Later(()=>{ if(battle.active) S.roll(1.0); },150);
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
    1100,E2.result+' It looks great. It\'s furious about it.',()=>checkEnemy()); };

// Next Stop: the express train comes through. TNB is driving.
T.metro=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('TNB checks the schedule. The express is right on time.'); pose(fx,'hip',1.2); say(m.id,'metro',.2); scene('stopsign',2.8,{}); scene('track',2.8,{y:270,back:true}); S.ding(); },
    900,()=>{ S.horn(); S.rumble(1.8); path(fx,2.0,q=>({hide:q>.05&&q<.95})); scene('train',1.8,{x0:640,x1:-470,y:272}); bt('DING DING',140,22,'#ffd166',2,.8); },
    720,()=>{ battle.enemyKnock=.45; battle.shakeEnemy=.7; battle.flashEnemy=.3; scene('dust',.8,{x:GX,y:262,n:8,sp:20}); bt('DOORS CLOSING',96,36,'#fff6dc',2,1); sfx.thud(); hit(E2); },
    1250,()=>{ pose(fx,'celeb',.8); },
    E2.result+' TNB gives the train a little wave. It waves back.',()=>checkEnemy()); };

// Jump Scare: lights out, VHS hum, eyes in the dark, then BOO. May leave the monster too rattled to act.
T.jumpscare=E2=>{ const {i,m,fx}=E2; let spooked=false;
  enqueue(()=>{ setMessage('TNB puts on his favorite horror movie. He\'s seen it eleven times.'); say(m.id,'jumpscare',.2); scene('dark',3.4,{a:.85,c:'#06060c'}); scene('vhs',3.4,{}); S.drone(2.2); },
    1100,()=>{ scene('eyes',1.2,{}); },
    1200,()=>{ S.sting(); scene('flash',.25,{a:.8}); scene('scare',1.3,{}); battle.lift={t:0,dur:.7}; battle.flashEnemy=.4; bt('BOO',132,30,'#ff3b3b',5,1); },
    350,()=>{ scene('yikes',1.2,{}); battle.shakeEnemy=.8; hit(E2); spooked=confuseMaybe(.45); },
    800,()=>setMessage(spooked?E2.result+' The '+enemyName().toLowerCase()+' is too scared to move.':E2.result+' TNB wasn\'t scared. Not even a little.'),
    1150,()=>checkEnemy()); };

// Kiln Blast: cone six, straight from the studio.
T.kiln=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('TNB opens the kiln. Cone six. Don\'t touch the door.'); pose(fx,'aim',3.0); say(m.id,'kiln',.3); scene('kiln',3.0,{}); sfx.slideWhistle(); },
    900,()=>{ sfx.fireball(); scene('jet',1.5,{x0:298,y0:236,x1:196,y1:226,w:34,grow:.2,cs:['#ff8c3a','#ffd166','#fff6c8','#ffffff']}); scene('flames',1.4,{x:GX,y:262,w:100,h:120,cs:['#ff8c3a','#ffd166','#fff6c8','#ffffff']}); scene('flash',.45,{c:'#fff2c8',a:.5}); },
    700,()=>{ battle.flashEnemy=.5; battle.shakeEnemy=.7; hit(E2); scene('shards',1.0,{x:GX,y:222,n:14,cs:['#b4573d','#d98f3f','#f4efe0']}); bt('CONE SIX',96,36,'#ffb070',3,1); },
    900,E2.result+' Fired. Let it cool overnight.',()=>checkEnemy()); };

// Bomb the Hill: a hill appears. TNB rides it. No brakes. Never brakes.
T.bomb=E2=>{ const {i,m,fx}=E2;
  enqueue(()=>{ setMessage('A hill appears behind TNB. He\'s been waiting his whole life for this hill.'); say(m.id,'bomb',.3); scene('bighill',3.4,{back:true}); scene('board',3.4,{});
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
    2400,E2.result+' That\'s a wrap on the '+enemyName().toLowerCase()+'. Great work, everybody.',()=>checkEnemy()); };

// ================= Special: WARDROBE =================
// Rolls out the wardrobe rack and throws a fresh outfit to the chosen member: back up if they were down,
// otherwise healed and Wardrobe Fresh (E2.apply runs the numbers).
T.wardrobe=E2=>{ const {i,m,fx}=E2;
  pose(fx,'hip',1.6); S.roll(.7); say(m.id,'wardrobe');
  const target=E2.targets[0]||m,ti=target.idx,down=!alive(target);
  scene('rack',3.2,{back:true,x:470});
  enqueue(
    ()=>{ setMessage(m.name+' rolls out the wardrobe rack. "Arms up. New look."'); },
    1000,()=>{ pose(fx,'throw',.4); const tp=BATTLE_POS[ti]; toss('shirt',400,200,tp.x*3,tp.base*3-60,0,.6,70,{c:'#284fb4',c2:'#ffd166'}); sfx.whoosh(); },
    650,()=>{
      E2.apply();
      scene('glow',.8,{x:BATTLE_POS[ti].x*3,y:BATTLE_POS[ti].base*3-40,c:'#9be39a',a:.35});
      scene('confetti',.9,{x0:BATTLE_POS[ti].x*3-40,x1:BATTLE_POS[ti].x*3+40,n:14});
    },
    down?target.name+' is back up. A fresh outfit can turn anyone’s day around.':target.name+' is Wardrobe Fresh. If they go down, they bounce right back up.',
    ()=>checkEnemy()
  );
};
})();

// ================= Option 3 Primary kit (phase 4) =================
// Cards: adventures-of-tom-ability-revamp.md (TNB). Built to the set-piece standard (status.md, "animation quality
// pass"): every move is 3.5 to 5 s and TNB performs it with his body (walks over, kneels, pushes the rack, rides the
// board), with the card's props as additions. Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the
// impact so the High-Five window closes on it. All scenes here are drawn in real coordinates (prefix tn_, no warp).
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
const poly=(pts,c,o=true)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const T=RECRUIT_MOVES.tnb;
const CLAY='#c98a5c',CLAYD='#8f5634',SLIP='#ecd2b0',CELA='#9fd8c0',COB='#3f6fc0',CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',STEEL='#aeb3ba',TAPE='#f2c94c',RED='#e0402e',WOOD='#b88848';
ST.nw('tn_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const hand=()=>ST.hand();
const hitAll=(E2,list)=>{ for(const f of list) ST.jolt(f,.4); landHit(100); };
// Where TNB stands to work on someone: just right of them, facing them (his sprites face left). Himself: his own spot.
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:u.x+u.w*.5+(t.side==='foe'?34:30),y:u.base+3}; };
const front=f=>({x:f.x+f.w*.5+52,y:f.base+3});
const sfxs=k=>{ if(sfx[k]) sfx[k](); };
const S={ roll(d=1){ noise({dur:d,vol:.1,f0:1800,f1:900,type:'bandpass',q:.7}); },
  drone(d=1.6){ tone({type:'sawtooth',f0:55,f1:52,dur:d,vol:.12,filter:300,sweep:'linear'}); tone({type:'sine',f0:110,f1:104,dur:d,vol:.06}); },
  sting(){ noise({dur:.35,vol:.35,f0:5000,f1:1200,type:'bandpass',q:.6}); tone({type:'sawtooth',f0:1400,f1:1250,dur:.45,vol:.14}); } };

// ---------- Props ----------
const clayCurl=(x,y,r=6,ang=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath();
  for(let k=0;k<=20;k++) { const a=k/20*Math.PI*3.2,rr=r*(1-k/26); const px=Math.cos(a)*rr,py=Math.sin(a)*rr; k?gfx.lineTo(px,py):gfx.moveTo(px,py); } gfx.stroke();
  gfx.strokeStyle=CLAY; gfx.lineWidth=3; gfx.stroke(); gfx.restore(); };
const tray=(x,y,label='REUSE')=>{ poly([[x-18,y-4],[x+18,y-4],[x+14,y+5],[x-14,y+5]],SLIP); R(x-12,y-2,24,2,CLAYD); label&&labelTxt(label,x,y-16,CREAM,1); };
const labelTxt=(t,x,y,c,sc)=>label(t,x,y,c,sc);
// The wardrobe rack: steel tubes, a slat shelf with shoes and a hat, casters, five costumes on wood hangers, a marquee sign.
// Costume pieces hang from (0,0) = the hanger hook. kind: 0 blazer, 1 dress, 2 hoodie, 3 striped shirt, 4 trench coat.
const garment=(kind,c,tr,dk,sw=0)=>{ gfx.save(); gfx.rotate(sw);
  Ln(0,-12,0,-4,1.6,OUT); E(0,-12,1.8,1.8,STEEL); Ln(0,-4,-10,3,3.6,OUT); Ln(0,-4,10,3,3.6,OUT); Ln(0,-4,-10,3,1.6,'#c9a06a'); Ln(0,-4,10,3,1.6,'#c9a06a');
  if(kind===0) { poly([[-10,3],[-14,8],[-13,34],[-9,34],[-8,10]],dk,2); poly([[10,3],[14,8],[13,34],[9,34],[8,10]],dk,2);
    poly([[-9,2],[-4,1],[0,4],[4,1],[9,2],[9,38],[-9,38]],c,2); poly([[-4,1],[0,18],[-7,8]],tr,1.4); poly([[4,1],[0,18],[7,8]],tr,1.4);
    E(0,23,1.2,1.2,GOLD); E(0,29,1.2,1.2,GOLD); R(3,26,5,1.6,dk); R(-9,36,18,2,dk); R(-7,6,1.6,28,'rgba(255,255,255,.25)'); }
  else if(kind===1) { poly([[-6,2],[6,2],[5,12],[13,40],[-13,40],[-5,12]],c,2); for(const px of [-3,0,3]) Ln(px,16,px*2,38,1,dk);
    R(-5.5,12,11,3,tr); poly([[-5,2],[0,9],[5,2],[3,1],[0,4],[-3,1]],tr,1.4); R(-12,36,24,2,tr); E(0,7,1,1,dk); }
  else if(kind===2) { poly([[-8,2],[0,-1],[8,2],[6,9],[-6,9]],dk,2); poly([[-9,6],[-13,10],[-12,32],[-9,32]],dk,2); poly([[9,6],[13,10],[12,32],[9,32]],dk,2);
    poly([[-9,4],[9,4],[10,12],[9,14],[9,36],[-9,36],[-9,14],[-10,12]],c,2); poly([[-6,24],[6,24],[8,33],[-8,33]],dk,1.4);
    Ln(-2,8,-2,16,1.3,tr); Ln(2,8,2,16,1.3,tr); E(-2,16.5,1,1,tr); E(2,16.5,1,1,tr); R(-9,35,18,2,dk); }
  else if(kind===3) { poly([[-9,2],[-3,1],[0,4],[3,1],[9,2],[12,10],[8,13],[8,36],[-8,36],[-8,13],[-12,10]],c,2);
    for(let y=9;y<35;y+=5) R(-8,y,16,1.8,tr); poly([[-3,1],[0,7],[-6,5]],'#fff6dc',1.2); poly([[3,1],[0,7],[6,5]],'#fff6dc',1.2); for(let k=0;k<4;k++) E(0,11+k*6,.8,.8,dk); }
  else { poly([[-10,3],[-14,8],[-14,40],[-10,40],[-9,10]],dk,2); poly([[10,3],[14,8],[14,40],[10,40],[9,10]],dk,2);
    poly([[-9,2],[9,2],[10,46],[-10,46]],c,2); poly([[-9,2],[-1,2],[-5,12]],dk,1.4); poly([[9,2],[1,2],[5,12]],dk,1.4);
    R(-10,22,20,3,dk); R(-2,22,4,3,GOLD); for(const yy of [14,29,37]) { E(-3,yy,.9,.9,GOLD); E(3,yy,.9,.9,GOLD); } }
  gfx.restore(); };
const rack=(x,y,sway=0,sign=true,sleeve=null)=>{
  E(x,y+5,60,6,'rgba(0,0,0,.25)');
  const paintedRack=PROPART.draw('tnb/wardrobe_rack',x+2,y-54,{w:122});   // painted rack with its costumes; the drawn one below is the fallback
  if(!paintedRack) {
  for(const px of [x-48,x+44]) { R(px-1,y-116,6,118,OUT); R(px,y-114,4,114,STEEL); R(px,y-114,1.5,114,'#e6e9ee'); R(px+3,y-114,1,114,'#7d8892'); }
  R(x-53,y-119,110,8,OUT); R(x-51,y-118,106,5,STEEL); R(x-51,y-118,106,1.6,'#eef1f5'); E(x-52,y-115,3,3.6,'#7d8892'); E(x+56,y-115,3,3.6,'#7d8892');
  const cs=[[0,'#e0402e','#fff6dc','#a82a1c'],[1,'#284fb4','#ffd166','#1b3680'],[2,'#6fc27a','#2b2a26','#4a9a56'],[3,'#c9b3e6','#fff6dc','#9a82c4'],[4,'#ffd166','#e0402e','#d6a63a']];
  cs.forEach((c,k)=>{ gfx.save(); gfx.translate(x-34+k*17,y-100+Math.sin(sway+k)*1.2); garment(c[0],c[1],c[2],c[3],Math.sin(sway*.8+k*1.3)*.035); gfx.restore(); });
  // slat shelf with a shoe box, two pairs of shoes and a hat
  RO(x-46,y-20,92,5,'#8a6a46'); R(x-46,y-20,92,1.6,'#b8946a'); for(let k=0;k<6;k++) R(x-40+k*16,y-17,1,3,'#6a4a2c');
  RO(x-43,y-35,22,15,'#d8c8a0'); R(x-43,y-29,22,2,'#c46a3c'); R(x-34,y-26,5,2,'#fff6dc');
  poly([[x-15,y-21],[x-4,y-21],[x-2,y-26],[x-8,y-28],[x-15,y-25]],'#2b2a26',1.8); R(x-15,y-22,13,1.4,'#6b4030');
  poly([[x+2,y-21],[x+13,y-21],[x+15,y-26],[x+9,y-28],[x+2,y-25]],'#8a4a2c',1.8); R(x+2,y-22,13,1.4,'#d9a070');
  E(x+30,y-22,12,3.4,OUT); E(x+30,y-22,11,2.6,'#4a3a2a'); EO(x+30,y-27,6,5,'#5a4632'); R(x+24,y-26,12,2,'#c46a3c');
  // feet and casters
  R(x-56,y-3,112,6,OUT); R(x-54,y-2,108,3.5,'#7d8892'); R(x-54,y-2,108,1.2,'#d8dce2');
  for(const wx of [-50,50]) { R(x+wx-2.5,y+2,5,5,OUT); R(x+wx-1,y+2,2,5,STEEL); EO(x+wx,y+9,5,5,'#2b2a26'); E(x+wx,y+9,1.8,1.8,'#aeb3ba'); }
  }
  if(sign) { const ty=paintedRack?y-112:y-123; Ln(x-26,ty,x-26,y-132,3,OUT); Ln(x+26,ty,x+26,y-132,3,OUT); Ln(x-26,ty,x-26,y-132,1.4,STEEL); Ln(x+26,ty,x+26,y-132,1.4,STEEL);
    RO(x-36,y-152,72,22,'#1b2a5a'); R(x-34,y-150,68,18,'#233a7a'); label('WARDROBE',x,y-144,CREAM,1);
    for(let i=0;i<13;i++) { const on=Math.sin(sway*4+i*1.1)>0; E(x-33+i*5.5,y-151,1.5,1.5,on?'#ffe08a':'#8a7a4a'); E(x-33+i*5.5,y-131,1.5,1.5,on?'#8a7a4a':'#ffe08a'); } }
};
SC.tn_rack=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const x=st.x+(s.off||-78),y=st.y; gfx.globalAlpha=fin(u,.05)*fade(u,.96); rack(x,y,s.t*3,true); };
// A stage light beam from the top of the screen onto a spot.
SC.tn_beam=(s,u)=>{ const a=fin(u,.15)*fade(u,.85)*.35; gfx.globalAlpha=a; gfx.fillStyle='#fff6c8'; gfx.beginPath(); gfx.moveTo(s.x-14,0); gfx.lineTo(s.x+14,0); gfx.lineTo(s.x+60,s.y); gfx.lineTo(s.x-60,s.y); gfx.closePath(); gfx.fill();
  gfx.globalAlpha=a*1.6; E(s.x,s.y,60,10,'#fff6c8'); };
// A costume silhouette drops onto someone, then glows.
SC.tn_costume=(s,u)=>{ const d=ez(u/.35),x=s.x,y=lerp(s.y-170,s.y-s.h*.62,d); gfx.globalAlpha=fade(u,.8);
  gfx.save(); gfx.translate(x,y-8); gfx.scale(1.8,1.8); garment(0,s.c||'#284fb4',s.c2||'#ffd166','rgba(0,0,0,.28)',Math.sin(u*10)*.05*(1-d)); gfx.restore();
  if(u>.35) { gfx.globalAlpha=fade(u,.8)*(1-cl((u-.35)/.4)); ring(x,y+26,30+u*30,40+u*30,3,GOLD); } };
// A crooked collar marker that straightens.
SC.tn_collar=(s,u)=>{ const a=lerp(.5,0,ez((u-.35)/.3)); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(a);
  poly([[-12,0],[0,6],[12,0],[10,-4],[0,1],[-10,-4]],CREAM); gfx.restore(); if(u>.6) label('CONTINUITY',s.x,s.y-22,GOLD,1); };
// A costume tag over someone (the rack costume they now wear).
SC.tn_tag=(s,u)=>{ const y=s.y-ez(u/.2)*10; gfx.globalAlpha=fade(u,.8); RO(s.x-26,y-8,52,14,s.c||CREAM); label(s.txt,s.x,y-4,'#2b2a26',1); };
// Measuring tape: a loop traced around someone, then unzipped like a paper silhouette.
SC.tn_tape=(s,u)=>{ const cx=s.x,cy=s.cy,rx=s.rx,ry=s.ry,tr=cl(u/s.trace),unz=cl((u-s.unzip)/(1-s.unzip)); gfx.globalAlpha=fade(u,.92);
  if(unz<=0) { gfx.lineCap='round'; for(const [w,c] of [[7,OUT],[4,TAPE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2*tr); gfx.stroke(); }
    for(let k=0;k<20*tr;k++) { const a=k/20*Math.PI*2; Ln(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry-2,cx+Math.cos(a)*rx,cy+Math.sin(a)*ry+2,1,'#7a5a10'); } return; }
  for(const side of [-1,1]) { gfx.save(); gfx.translate(cx+side*unz*30,cy-unz*40); gfx.rotate(side*unz*.8); gfx.globalAlpha=fade(u,.92)*(1-unz);
    for(const [w,c] of [[7,OUT],[4,TAPE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(0,0,rx,ry,0,side<0?Math.PI*.5:-Math.PI*.5,side<0?Math.PI*1.5:Math.PI*.5); gfx.stroke(); } gfx.restore(); } };
// A debuff tile falling out of someone.
SC.tn_debuff=(s,u)=>{ const y=s.y+ez(u/.6)*s.fall,x=s.x+u*16; gfx.globalAlpha=1-cl((u-.6)/.4); gfx.save(); gfx.translate(x,y); gfx.rotate(u*3); RO(-7,-7,14,14,'#8a8fa8'); Ln(-4,-4,4,4,2,'#2b2a26'); Ln(4,-4,-4,4,2,'#2b2a26'); gfx.restore(); };
// A pocket test: a pocket with a hand popping in and out.
SC.tn_pocket=(s,u)=>{ const p=Math.abs(Math.sin(u*Math.PI*3)); gfx.globalAlpha=fade(u,.8); RO(s.x-10,s.y-8,20,16,'#5b7fd0'); R(s.x-10,s.y-8,20,4,'#3f5fa8'); E(s.x,s.y-8-p*8,5,5,'#faab7b'); label('POCKETS!',s.x,s.y-30,GOLD,1); };
// A loose thread by someone's health, then two big safety pins and a warm outline.
SC.tn_thread=(s,u)=>{ const x=s.x,y=s.y,pin=cl((u-s.pinAt)/.12); gfx.globalAlpha=fade(u,.9);
  RO(x-22,y-4,36,8,'#2b4a3a'); R(x-20,y-2,26,4,'#9be39a'); const sw=Math.sin(s.t*9)*6*(1-pin);
  if(pin<1) { gfx.strokeStyle=CREAM; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(x+14,y); gfx.quadraticCurveTo(x+22+sw,y+10,x+18+sw,y+22); gfx.stroke(); if(u<s.pinAt) label('LOOSE',x,y-16,CREAM,1); }
  if(pin>0) { for(const k of [-1,1]) { const px=x+k*10,py=y+2; gfx.save(); gfx.translate(px,py); gfx.rotate(k*.3); RO(-3,-14,6,22,'#dfe6ee'); EO(0,-14,5,5,'#dfe6ee'); E(0,-14,2,2,'#8a8fa8'); gfx.restore(); } }
  if(u>s.pinAt) { const q=cl((u-s.pinAt)/.2); gfx.globalAlpha=fade(u,.9)*.9; gfx.strokeStyle='rgba(255,200,120,.9)'; gfx.lineWidth=4; const ox=s.ox,oy=s.oy,w=s.w*(.9+q*.1),h=s.h*(.9+q*.1);
    gfx.beginPath(); gfx.ellipse(ox,oy,w*.5,h*.5,0,0,Math.PI*2); gfx.stroke(); if(q>.5) label('IN ONE PIECE',ox,oy-h*.5-14,GOLD,1); } };
// A lost-property box (it slides in), with a claim ticket.
const lostBox=(x,y)=>{ RO(x-26,y-34,52,34,'#a87a48'); R(x-26,y-34,52,6,'#8a5e32'); RO(x-16,y-26,32,10,CREAM); label('LOST',x,y-24,'#2b2a26',1); };
SC.tn_box=(s,u)=>{ const inn=ez(u/.1),out=u>s.outAt?ez((u-s.outAt)/(1-s.outAt)):0,x=s.x+(1-inn)*120+out*140; gfx.globalAlpha=1-out; lostBox(x,s.y);
  if(s.stampAt&&u>s.stampAt) { const q=cl((u-s.stampAt)/.08); gfx.save(); gfx.translate(x,s.y-50); gfx.rotate(-.15); gfx.globalAlpha=(1-out)*q; RO(-26,-8,52,16,'rgba(0,0,0,0)'); gfx.strokeStyle=RED; gfx.lineWidth=3; gfx.strokeRect(-24,-7,48,14); label('FOUND',0,-3,RED,1); gfx.restore(); } };
SC.tn_ticket=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(h.x-8,h.y-14); gfx.rotate(-.2); RO(-24,-9,48,18,CREAM); R(-24,-9,6,18,'#e8b048'); label('MISSING',3,-6,'#2b2a26',1); label('WARMTH',3,1,RED,1); gfx.restore(); };
// The scarf: from the box to TNB's hand, then a loop around the recipient; s.st follows TNB.
SC.tn_scarf=(s,u)=>{ const h=hand(),bx=s.bx,by=s.by-30; let ex=h.x,ey=h.y; const wrap=cl((u-s.wrapAt)/.12),back=s.backAt?cl((u-s.backAt)/(1-s.backAt)):0;
  if(wrap>0) { ex=lerp(ex,s.tx,wrap); ey=lerp(ey,s.ty,wrap); } if(back>0) { ex=lerp(ex,bx,back); ey=lerp(ey,by,back); }
  gfx.globalAlpha=1; for(const [w,c] of [[10,OUT],[6,'#e86a8a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(bx,by); gfx.quadraticCurveTo((bx+ex)/2,Math.max(by,ey)+30+Math.sin(s.t*5)*5,ex,ey); gfx.stroke(); }
  for(let k=1;k<6;k++) { const q=k/6,px=lerp(bx,ex,q),py=lerp(by,ey,q)+Math.sin(q*Math.PI)*(Math.max(by,ey)-Math.min(by,ey)+30)*.5; R(px-1,py-3,3,6,'#ffd0dc'); }
  if(wrap>=1&&back<.2) { for(const [w,c] of [[9,OUT],[5,'#e86a8a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(s.tx,s.ty,16,6,0,0,Math.PI*2); gfx.stroke(); } } };
SC.tn_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
SC.tn_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||40,s.ry||56,s.c||'#ffd27a'); };
SC.tn_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*8,s.c||CREAM,s.sc||1); };
SC.tn_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||28); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CLAY); } };
SC.tn_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.8); heart(s.x,s.y-ez(u)*16,s.r||6,PINK); };
// Practical Effects: the tiny curtain, the conspicuous string, the cardboard ghost on a spring.
SC.tn_curtain=(s,u)=>{ const x=s.x,y=s.y,pop=cl((u-s.popAt)/.06),ret=cl((u-s.popAt-.18)/.2); gfx.globalAlpha=fin(u,.05)*fade(u,.92);
  RO(x-3,y-70,4,70,WOOD); RO(x-22,y-74,42,5,WOOD); const op=pop>0?1-ret*.4:0; R(x-20,y-68,18*(1-op*.7),60,'#7a1a2a'); R(x+2+op*12,y-68,18*(1-op*.7),60,'#7a1a2a'); R(x-20,y-68,40,4,'#a8283a');
  if(pop>0) { const ext=pop*(1-ret*.6),gx=lerp(x,s.fx,ext),gy=y-40; for(let k=0;k<6;k++) { const zx=lerp(x,gx-16,k/6); Ln(zx,gy+(k%2?-6:6),lerp(x,gx-16,(k+1)/6),gy+(k%2?6:-6),2,STEEL); }
    gfx.save(); gfx.translate(gx,gy+Math.sin(s.t*20)*ret*3); gfx.scale(1.6,1.6); poly([[-16,18],[-16,-8],[-12,-16],[0,-20],[12,-16],[16,-8],[16,18],[10,12],[4,18],[-2,12],[-8,18]],'#f4efe0'); E(-6,-6,3,4,'#2b2a26'); E(6,-6,3,4,'#2b2a26'); E(0,4,4,3,'#2b2a26'); R(10,-10,4,24,'#c9b48a'); gfx.restore(); } };
SC.tn_string=(s,u)=>{ const h=hand(),ax=s.x,ay=s.y-60,taut=s.tautAt&&u>s.tautAt,sag=taut?2:22; gfx.globalAlpha=fade(u,.92);
  gfx.strokeStyle='#fff'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(ax,ay); gfx.quadraticCurveTo((ax+h.x)/2,(ay+h.y)/2+sag,h.x,h.y); gfx.stroke();
  const mx=(ax+h.x)/2,my=(ay+h.y)/2+sag*.5; RO(mx-18,my-22,36,12,CREAM); label('STRING',mx,my-19,'#2b2a26',1); Ln(mx,my-10,mx,my-2,2,CREAM); };
SC.tn_dark=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.85)*(s.a||.45); R(0,0,576,324,'#0a0814'); };
// Rush-Hour Racks: floor clearance arrows and the long sleeve sweeping a row.
SC.tn_arrows=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); for(const x of [s.x0,s.x1]) { poly([[x-8,s.y],[x+8,s.y],[x,s.y-12]],GOLD); } Ln(s.x0,s.y+6,s.x1,s.y+6,2,GOLD); label('CLEARANCE',(s.x0+s.x1)/2,s.y+12,GOLD,1); };
SC.tn_sleeve=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const px=st.x-78-36,py=st.y-104;
  const sweep=cl((u-s.sweepAt)/s.sweepLen),back=cl((u-s.backAt)/.2),ang=lerp(lerp(-1.45,-.05,ez(sweep)),-1.45,ez(back)),len=lerp(60,Math.max(120,px-s.reach),ez(sweep)*(1-ez(back)));
  gfx.globalAlpha=fade(u,.96); gfx.save(); gfx.translate(px,py); gfx.rotate(Math.PI+ang); RO(0,-7,len,14,'#e0402e'); for(let k=20;k<len;k+=24) R(k,-7,3,14,'#b02a1e'); RO(len,-9,10,18,CREAM); gfx.restore();
  if(sweep>.4&&back<.5) { gfx.globalAlpha=1; label('MIND THE SLEEVE GAP',s.lx,s.ly,GOLD,1); } };
// Clay Pigeon: the bird in his palm, in flight (one flap), and the indignant lump.
const pigeon=(x,y,flap,lump=0)=>{ if(lump>0) { EO(x,y,9*(1+lump*.2),7,CLAY); Ln(x-6,y-5,x-1,y-3,2,OUT); Ln(x+6,y-5,x+1,y-3,2,OUT); E(x-3,y-1,1.5,1.5,OUT); E(x+3,y-1,1.5,1.5,OUT); return; }
  EO(x,y,10,7,CLAY); EO(x-9,y-4,5,5,CLAY); poly([[x-14,y-4],[x-19,y-2],[x-14,y-1]],GOLD); E(x-10,y-5,1.5,1.5,OUT); poly([[x+8,y-1],[x+16,y-5],[x+15,y+3]],CLAYD);
  const w=flap?-12:-2; poly([[x-2,y-3],[x+6,y-3],[x+2,y+w-4]],CLAYD); };
SC.tn_shape=(s,u)=>{ const h=hand(),x=h.x-4,y=h.y-10; gfx.globalAlpha=fade(u,.97); if(u<.55) { const q=u/.55; EO(x,y,9-q*2,8,CLAY); for(let k=0;k<3;k++) { const a=s.t*8+k*2.1; R(x+Math.cos(a)*14,y+Math.sin(a)*8,2,2,SLIP); } label('SHAPE',x,y-24,CREAM,1); } else pigeon(x,y,false); };
// Cone Six: the kiln cone indicator (bends, then bows) and the glaze outline.
SC.tn_cone=(s,u)=>{ const bend=cl((u-s.bendAt)/.25),bow=s.bowAt&&u>s.bowAt?Math.sin(cl((u-s.bowAt)/.25)*Math.PI):0; gfx.globalAlpha=fin(u,.06)*fade(u,.93);
  RO(s.x-10,s.y-4,20,4,SLIP); gfx.save(); gfx.translate(s.x,s.y-4); gfx.rotate(-bend*1.0-bow*.5); poly([[-5,0],[5,0],[1,-26],[-1,-26]],'#f0d080'); gfx.restore(); if(bend>.5) label('CONE 6',s.x,s.y-44,GOLD,1); };
SC.tn_glaze=(s,u)=>{ const d=ez(u/.4),x=s.x,y0=s.y-s.h,h=s.h*d; gfx.globalAlpha=fin(u,.05)*fade(u,.8)*.55; gfx.fillStyle=CELA; gfx.beginPath();
  gfx.moveTo(x-s.w*.5,y0); gfx.lineTo(x+s.w*.5,y0); for(let k=0;k<=8;k++) { const px=x+s.w*.5-k*s.w/8; gfx.lineTo(px,y0+h-(k%2?10:0)*d); } gfx.closePath(); gfx.fill();
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.strokeStyle=COB; gfx.lineWidth=3; gfx.strokeRect(x-s.w*.5,y0,s.w,Math.max(2,h)); if(d>.9) label('GLAZED',x,y0-14,CELA,1); };
// Curb Appeal: the board under TNB, the painted curb line that peels up and sweeps.
const board=(x,y,tilt=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); for(const wx of [-24,22]) { E(wx,8,6,6,OUT); E(wx,8,4,4,RED); E(wx,8,1.5,1.5,GOLD); }
  R(-38,-1,76,9,OUT); R(-36,1,72,5,'#c48a4a'); R(-36,1,72,2,'#2b2a26'); gfx.restore(); };
SC.tn_board=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; gfx.globalAlpha=fade(u,.97); board(st.x,st.y+2,Math.sin(s.t*6)*.06); };
SC.tn_curb=(s,u)=>{ const st=s.st; gfx.globalAlpha=fin(u,.08)*fade(u,.92); const y=s.y,x0=s.x0,x1=s.x1; const px=(st&&st.x!=null&&u>s.peelAt&&u<s.flatAt)?st.x:null;
  for(let x=x0;x<x1;x+=8) { let lift=0; if(px!=null&&x>px) { const d=x-px; lift=Math.max(0,1-Math.abs(d-70)/90)*70; } const fl=u>s.flatAt?0:1; R(x,y-lift*fl,6,4,(x/8|0)%2?'#f2d24c':'#fff6dc'); }
  if(u>s.peelAt&&u<s.flatAt) label('CURB APPEAL',(x0+x1)/2,y+12,GOLD,1); if(u>s.flatAt) label('PERFECTLY FLAT',(x0+x1)/2,y+12,CREAM,1); };
// Fix the Wobble: the rocking platform and the clay wedge.
SC.tn_platform=(s,u)=>{ const fixed=u>s.fixAt,a=fixed?0:Math.sin(s.t*7)*.07; gfx.globalAlpha=fin(u,.08)*fade(u,.9); gfx.save(); gfx.translate(s.x,s.y+6); gfx.rotate(a);
  RO(-s.w*.5,-3,s.w,8,'#c9b48a'); R(-s.w*.5,4,8,6,'#8a7a5a'); R(s.w*.5-8,4,8,fixed?6:2,'#8a7a5a'); gfx.restore();
  const wq=cl((u-s.wedgeAt)/(s.fixAt-s.wedgeAt)); if(u>s.wedgeAt) { const wx=lerp(s.x+s.w*.5+40,s.x+s.w*.5-4,ez(wq)); poly([[wx-6,s.y+16],[wx+6,s.y+16],[wx+6,s.y+10]],CLAY); }
  if(!fixed&&u>.15) label('WOBBLE',s.x,s.y+24,CREAM,1); if(fixed&&u<s.fixAt+.2) label('CLICK',s.x+s.w*.5,s.y-8,GOLD,2); };
// Kiln Door Policy: the freestanding kiln doorway, the shield tile, the heat.
SC.tn_kiln=(s,u)=>{ const x=s.x,y=s.y,close=cl((u-s.closeAt)/.08),open=cl((u-s.openAt)/.08),door=close*(1-open),flash=u>s.closeAt+.08&&u<s.closeAt+.2;
  gfx.globalAlpha=fin(u,.06)*fade(u,.92); RO(x-26,y-72,52,72,'#6a6a72'); R(x-20,y-64,40,56,flash?'#ffd27a':'#2b2224'); if(flash) { gfx.globalAlpha*=.6; E(x,y-36,40,50,'#ffb04a'); gfx.globalAlpha=fin(u,.06)*fade(u,.92); }
  R(x-20,y-64,40*door,56,'#8a8a92'); if(door>.5) { R(x-18,y-38,6,4,'#2b2a26'); label('POLICY',x,y-58,GOLD,1); } R(x-30,y-76,60,6,'#4a4a52'); };
const shieldTile=(x,y,cracked=0)=>{ poly([[x-9,y-10],[x+9,y-10],[x+9,y+2],[x,y+11],[x-9,y+2]],cracked?'#c9b48a':CELA); if(cracked) { Ln(x-6,y-6,x+2,y+4,2,OUT); Ln(x+1,y-9,x-2,y,2,OUT); } };
SC.tn_tile=(s,u)=>{ const h=hand(); gfx.globalAlpha=1; shieldTile(h.x-6,h.y-6,s.cracked?1:0); if(s.tag) { RO(h.x-50,h.y-34,44,12,CREAM); label('TRY AGAIN',h.x-28,h.y-31,RED,1); Ln(h.x-14,h.y-22,h.x-8,h.y-12,1,CREAM); } };
SC.tn_heat=(s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.4-k*.1); gfx.globalAlpha=(1-q)*.8; ring(lerp(s.x0,s.x1,q),lerp(s.y0,s.y1,q),10+q*20,14+q*26,3,k%2?'#ffb04a':GOLD); } };

// ---------- Moves ----------
// Clay Offcut (Basic): a curl of spare clay, flicked; it comes back to the REUSE tray.
T.clay_offcut=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'aim'},{t:600,f:'run'},{t:1050,x:420,f:'wind'},{t:1350,f:'throw'},{t:1750,f:'idle'},{t:2200,f:'spread'},{t:2750,hop:8,f:'celeb'},{t:2950,f:'runR'},{t:3550,x:'home',y:'home',f:'idle'}]);
  let curlOn=true;
  ST.play(E2,[
    [0,()=>{ setMessage('TNB notices one little curl of spare clay on his thumb.'); say(m.id,'clay_offcut'); ST.draw(()=>{ if(!curlOn) return; const h=hand(); clayCurl(h.x-4,h.y-12,9,battle.time*2); },1.4); }],
    [1350,()=>{ curlOn=false; const h=hand(); sfx.whoosh(); ST.fly((x,y,u)=>clayCurl(x,y,10,u*12),h.x,h.y-10,F.x+10,F.mid,.45,70); }],
    ['hf',1800],
    [1800,()=>{ sfx.bonk(); ST.jolt(f); scene('tn_poof',.5,{x:F.x+10,y:F.mid,c:CLAY}); scene('tn_text',.9,{x:F.x+62,y:F.top-2,txt:'BONK NOT',c:GOLD,sc:2,y:F.top-34}); landHit(100); }],
    [1900,()=>{ const h=hand(); ST.fly((x,y,u)=>clayCurl(x,y,6,u*8),F.x+10,F.mid,h.x-6,h.y,.5,60); }],
    [2200,()=>{ ST.draw(()=>{ const h=hand(); tray(h.x-8,h.y+2); },.75); }],
    [2450,()=>{ sfx.ding(); }],
    [3650,'end',res(E2)+'The offcut has found a second career.']]); };

// WARDROBE (Signature, Primary animation): out for the rack, roll it into the light, the next costume drops on, collar fixed.
T.wardrobeShow=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,down=t.hp<=0,H=ST.unit(t),self=t===m;
  const sx=self?null:H.x+108,stop={x:self?'home':sx,y:self?'home':H.base+4};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'runR'},{t:500,x:650,f:'runR',hide:true},{t:800,x:720,y:stop.y,f:'run'},{t:1800,x:stop.x,y:stop.y,f:'idle'},{t:2400,f:'run'},
    {t:2700,x:self?'home':H.x+50,f:'act'},{t:3150,f:'celeb',hop:6},{t:3350,f:'runR'},{t:4000,x:700,f:'run',hide:true},{t:4300,x:620,f:'run'},{t:4800,x:'home',y:'home',f:'idle'}]);
  const park=self?BATTLE_POS[m.idx].x*3:sx,rackSt={get x(){ return st.seg>=8?null:(st.seg<=2?st.x:Math.max(park,st.x)); },get y(){ return st.y; }};
  ST.play(E2,[
    [0,()=>{ setMessage('TNB heads off for the wardrobe rack.'); say(m.id,'wardrobe'); sfxs('whoosh'); }],
    [800,()=>{ scene('tn_rack',3.2,{st:rackSt,off:self?-82:-78,back:true}); S.roll(1); }],
    [1500,()=>{ scene('tn_beam',2.6,{x:H.x,y:H.base}); setMessage(down?t.name+' is down. The next scene still needs them.':'Stage lights up. The next scene still needs '+t.name+'.'); }],
    [1900,()=>{ const r=B2_RACK[t.rack||0]||B2_RACK[0]; scene('tn_costume',1.3,{x:H.x,y:H.base,h:H.h,c:r.c,c2:r.c2}); sfxs('whoosh'); }],
    ['hf',2350],
    [2350,()=>{ E2.apply(); sfx.heal(); scene('tn_glow',.9,{x:H.x,y:H.mid,c:'#9be39a'}); const cur=B2_RACK.find(r=>t.st&&t.st[r.id]); if(cur) scene('tn_tag',1.6,{x:H.x,y:H.top-6,txt:cur.tag,c:cur.c}); }],
    [2750,()=>{ scene('tn_collar',1.0,{x:H.x+(self?-6:0),y:H.top+26}); }],
    [3200,()=>{ sfx.ding(); }],
    [4900,'end',down?t.name+' is back up. A fresh outfit can turn anyone’s day around.':t.name+' is Wardrobe Fresh. If they go down, they bounce right back up.']]); };
// The legacy WARDROBE stays for the legacy kit; the Option 3 version plays the new show.
{ const legacy=T.wardrobe; T.wardrobe=E2=>(E2.act&&E2.act.o3&&T.wardrobeShow)?T.wardrobeShow(E2):legacy(E2); }

// Quick Change (A1): a lap with the measuring tape, the loop unzips, a debuff falls out, new pockets.
T.quick_change=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe';
  const rx=H.w*.5+30,ry=16,cx=sp.self?null:H.x;
  const lap=sp.self?{t:700,f:'idle',rot:u=>Math.sin(u*Math.PI*2)*.15}:{t:700,f:u=>Math.sin(u*Math.PI*2)>0?'run':'runR',dx:u=>(H.x+Math.cos(u*Math.PI*2)*rx)-(H.x+rx),dy:u=>Math.sin(u*Math.PI*2)*ry,x:H.x+rx,y:H.base+3};
  const K=sp.self?[{t:0,x:'home',y:'home',f:'aim'},lap,{t:1550,f:'aim'},{t:2100,f:'celeb'},{t:2700,f:'idle'},{t:3300,x:'home',y:'home'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:700,x:H.x+rx,y:H.base+3},lap,{t:1550,x:sp.x,y:sp.y,f:'aim'},{t:2100,f:'celeb'},{t:2650,f:'runR'},{t:3300,x:'home',y:'home',f:'idle'}];
  K[1].x=K[1].x??H.x+rx; ST.keys(fx,K);
  const loopX=sp.self?BATTLE_POS[m.idx].x*3:H.x,loopY=(sp.self?BATTLE_POS[m.idx].base*3:H.base)-H.h*.45;
  ST.play(E2,[
    [0,()=>{ setMessage('TNB pulls out a measuring tape. One loop, very fast.'); say(m.id,'quick_change'); }],
    [700,()=>{ scene('tn_tape',1.6,{x:loopX,cy:loopY,rx:H.w*.5+18,ry:H.h*.55,trace:.5,unzip:.65}); sfx.whoosh(); }],
    ['hf',1750],
    [1750,()=>{ sfx.ding(); E2.apply(); scene('tn_debuff',1.0,{x:H.x+10,y:H.mid,fall:H.base-H.mid}); scene('tn_glow',.8,{x:H.x,y:H.mid,c:'#c9b3e6'});
      if(!foe) { const cur=B2_RACK.find(r=>t.st&&t.st[r.id]); if(cur) scene('tn_tag',1.6,{x:H.x,y:H.top-8,txt:cur.tag,c:cur.c}); } }],
    [2150,()=>{ scene('tn_pocket',1.1,{x:H.x-14,y:H.mid+10}); if(!foe&&t!==m) battle.fx[t.idx].hop=.4; else if(foe) ST.jolt(t,.2); }],
    [3400,'end',kindLine(t,'Same person, better pockets. The pockets were the important part.')]]); };

// Continuity Pins (A2): kneels by the loose thread, two big safety pins, a warm outline; a little heart for Tom.
T.continuity_pins=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),tom=B2.party.find(p=>p.id==='tom'&&b2Alive(p)),foe=t.side==='foe';
  ST.keys(fx,[{t:0,x:'home',y:'home',f:sp.self?'idle':'run'},{t:700,x:sp.x,y:sp.y,f:'kneel'},{t:1350,f:'aim'},{t:1900,f:'aim'},{t:2150,f:'celeb',hop:6},{t:2700,f:sp.self?'idle':'runR'},{t:3400,x:'home',y:'home',f:'idle'}]);
  const tx=H.x+(foe?0:-4),ty=H.top-4;
  ST.play(E2,[
    [0,()=>{ setMessage('TNB spots a loose thread. He always spots the loose thread.'); say(m.id,'continuity_pins'); scene('tn_thread',2.6,{x:tx,y:ty,pinAt:.62,ox:H.x,oy:H.mid,w:H.w*.9,h:H.h*.95}); }],
    [1400,()=>{ const h=hand(); for(const k of [0,1]) ST.fly((x,y)=>{ RO(x-3,y-12,6,20,'#dfe6ee'); EO(x,y-12,5,5,'#dfe6ee'); },h.x,h.y,tx+(k?10:-10),ty+2,.35,40,k*.08,{spin:1}); sfx.whoosh(); }],
    ['hf',1900],
    [1900,()=>{ sfx.ding(); E2.apply(); sfx.heal(); scene('tn_glow',.8,{x:H.x,y:H.mid,c:'#ffd27a'}); if(foe) ST.jolt(t,.15); }],
    [2250,()=>{ if(tom&&!foe&&t!==tom) { const a=ST.unit(m),b=ST.unit(tom); ST.fly((x,y)=>heart(x,y,6,PINK),(battle.actorPos||{cx:a.x}).cx-10,a.top+20,b.x,b.top+10,.6,40); }
      else if(tom&&!foe) scene('tn_heart',1,{x:H.x,y:H.top-6}); }],
    [2850,()=>{ if(tom&&!foe&&t!==tom) { battle.fx[tom.idx].hop=.35; sfxs('kiss'); } }],
    [3500,'end',kindLine(t,'TNB checks the person before the costume.')]]); };

// Lost-and-Found Warmth (A3): claim ticket, a rummage through the lost-property box, a very long scarf, FOUND.
T.lost_found_warmth=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),me=ST.unit(m),bx=me.x-74,by=me.base+2,foe=t.side==='foe';
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'aim'},{t:800,f:'kneel',dx:(u,tt)=>Math.sin(tt*18)*3},{t:1550,f:'throw'},{t:1700,f:sp.self?'throw':'run'},{t:2400,x:sp.self?'home':sp.x,y:sp.self?'home':sp.y,f:'act'},
    {t:2900,f:sp.self?'idle':'runR'},{t:3500,x:'home',y:'home',f:'act'},{t:4000,f:'celeb'},{t:4400,f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB checks a claim ticket. It says MISSING WARMTH.'); say(m.id,'lost_found_warmth'); scene('tn_ticket',.9,{}); scene('tn_box',4.4,{x:bx,y:by,outAt:.9,stampAt:.82}); }],
    [850,()=>{ const items=[(x,y)=>{ RO(x-5,y-8,10,16,'#7a8ca0'); },(x,y)=>{ EO(x,y,7,5,'#e0402e'); },(x,y)=>{ Ln(x-10,y,x+10,y,3,'#2b2a26'); poly([[x-10,y],[x,y-10],[x+10,y]],'#5b7fd0'); }];
      items.forEach((d,k)=>ST.fly(d,bx,by-30,bx+40+k*30,by-10-k*6,.5,60,k*.2,{spin:1})); setMessage('A sock. One glove. An umbrella. Not those.'); sfxs('select'); }],
    [1550,()=>{ scene('tn_scarf',2.8,{bx,by,tx:H.x,ty:H.top+30,wrapAt:.36,backAt:.68}); sfx.whoosh(); }],
    ['hf',2600],
    [2600,()=>{ E2.apply(); sfx.heal(); scene('tn_flakes',1.0,{x:H.x,y:H.base,h:H.h}); scene('tn_glow',.9,{x:H.x,y:H.mid,c:'#ffb0c0'}); if(!foe&&t!==m) battle.fx[t.idx].hop=.35; if(foe) ST.jolt(t,.15); }],
    [3700,()=>{ sfx.select(); }],
    [4500,'end',kindLine(t,'The missing warmth has been turned in.')]]); };

// Practical Effects (A4): lights down, a tiny curtain, a very visible string, a cardboard ghost on a spring. BOO.
T.practical_effects=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),cx=F.x+F.w*.5+26,cy=F.base;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:cx+44,y:cy+3,f:'act'},{t:1150,f:'walk'},{t:1800,x:400,y:'home',f:'kneel'},{t:2250,f:'throw',dx:8,rot:.12},{t:2650,f:'hip'},{t:3200,f:'runR'},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB dims the lights and sets a tiny curtain next to '+f.name+'.'); say(m.id,'practical_effects'); scene('tn_dark',3.9,{a:.5}); S.drone(2.2); }],
    [700,()=>{ scene('tn_curtain',3.2,{x:cx,y:cy,fx:F.x+14,popAt:(2250-700)/3200}); sfxs('select'); }],
    [1150,()=>{ scene('tn_string',1.8,{x:cx,y:cy,tautAt:(1800-1150)/1800}); setMessage('The pull-string is very visible. That\'s part of the charm.'); }],
    ['hf',2350],
    [2250,()=>{ S.sting(); }],
    [2350,()=>{ sfx.bonk(); ST.jolt(f,.5); scene('tn_text',1.1,{x:F.x+62,y:F.top-2,txt:'BOO!',c:'#ff6b6b',sc:3}); landHit(100); }],
    [2700,()=>{ scene('tn_text',1.2,{x:BATTLE_POS[m.idx].x*3-120,y:BATTLE_POS[m.idx].base*3-150,txt:'NICE STRING',c:GOLD,sc:1}); }],
    [4000,'end',res(E2)+'The enemy saw the string and jumped anyway.']]); };

// Rush-Hour Racks (A5): wheels a rack in, floor arrows say it fits, one extremely long sleeve sweeps the row.
T.rush_hour_racks=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),stopX=Math.min(560,G.x1+170),stopY=Math.min(312,G.base+10);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'runR'},{t:400,x:650,f:'runR',hide:true},{t:600,x:740,y:stopY,f:'run'},{t:1500,x:stopX,y:stopY,f:'idle'},{t:1600,f:'wind'},{t:2000,f:'throw'},{t:2500,f:'act'},{t:3000,f:'runR'},
    {t:3700,x:720,f:'run',hide:true},{t:3900,x:640,y:'home',f:'run'},{t:4400,x:'home',y:'home',f:'idle'}]);
  const rackSt={get x(){ return st.seg>=8?null:st.x; },get y(){ return st.y; }};
  ST.play(E2,[
    [0,()=>{ setMessage('TNB wheels in a costume rack. One sleeve is extremely long.'); say(m.id,'rush_hour_racks'); }],
    [600,()=>{ scene('tn_rack',3.2,{st:rackSt,back:true}); scene('tn_sleeve',3.2,{st:rackSt,sweepAt:(2000-600)/3200,sweepLen:.12,backAt:(2550-600)/3200,reach:G.x0-10,lx:G.x,ly:G.top-26}); S.roll(.9); }],
    [1100,()=>{ scene('tn_arrows',1.4,{x0:G.x0,x1:G.x1,y:G.base+16}); }],
    [2000,()=>{ sfx.whoosh(); }],
    ['hf',2300],
    [2300,()=>{ sfx.thud(); hitAll(E2,list); battle.enemyKnock=.45; }],
    [2600,()=>{ setMessage('He folds the sleeve over the rail like he expected this.'); }],
    [4500,'end',res(E2)+'The rack is wider than its travel clearance.']]); };

// Clay Pigeon, Literally (B1): shapes a little clay bird, throws it, one flap, bonk; it comes back as an indignant lump.
T.clay_pigeon=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f);
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'aim'},{t:1000,f:'run'},{t:1400,x:440,f:'wind'},{t:1650,f:'throw'},{t:2100,f:'idle'},{t:2600,f:'aim'},{t:3200,f:'runR'},{t:3800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB shapes a tiny bird out of soft clay.'); say(m.id,'clay_pigeon'); scene('tn_shape',1.65,{}); }],
    [1650,()=>{ const h=hand(); sfx.whoosh(); ST.fly((x,y,u)=>pigeon(x,y,u>.4&&u<.55),h.x,h.y-10,F.x+8,F.mid,.55,80); }],
    ['hf',2200],
    [2200,()=>{ sfx.bonk(); ST.jolt(f); scene('tn_poof',.5,{x:F.x+8,y:F.mid}); scene('tn_text',.9,{x:F.x+62,y:F.top-2,txt:'COO',c:GOLD,sc:2}); landHit(100); }],
    [2250,()=>{ const h0=hand(); ST.fly((x,y,u)=>pigeon(x,y,false,u),F.x+8,F.mid,h0.x-30,h0.y-14,.45,50); }],
    [2700,()=>{ ST.draw(()=>{ const h=hand(); pigeon(h.x-4,h.y-12,false,1); label('HMPH',h.x-4,h.y-34,CREAM,1); },.6); }],
    [3900,'end',res(E2)+'The craftsmanship is better than the joke.']]); };

// Cone Six, Please (B2): sets a kiln cone by the friend, conducts a glaze over them, the cone bends and bows.
T.cone_six=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',conX=H.x+(foe?H.w*.5+8:20);
  const back=c=>(sp.self?c.origX:sp.x)+22;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:sp.self?'idle':'run'},{t:700,x:sp.x,y:sp.y,f:'kneel'},{t:1250,f:'walk'},{t:1500,x:back,f:'spread'},{t:2350,f:'idle'},{t:2450,f:'idle',rot:u=>-Math.sin(u*Math.PI)*.25},{t:2900,f:sp.self?'idle':'runR'},{t:3550,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB sets down a tiny kiln cone. Cone six. Precisely.'); say(m.id,'cone_six'); }],
    [750,()=>{ scene('tn_cone',2.9,{x:conX,y:H.base+2,bendAt:(1700-750)/2900,bowAt:(2450-750)/2900}); sfxs('select'); }],
    [1500,()=>{ scene('tn_glaze',1.6,{x:H.x,y:H.base,w:H.w*.85,h:H.h}); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.heal(); scene('tn_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('tn_glow',.9,{x:H.x,y:H.mid,c:'#ffb070'}); if(foe) ST.jolt(t,.15); else if(t!==m) battle.fx[t.idx].hop=.3; }],
    [2500,()=>{ setMessage('The cone takes a tiny bow. So does TNB.'); }],
    [3650,'end',kindLine(t,'The warmth has been professionally considered.')]]); };

// Curb Appeal (B3): drops the board, finds the curb line, carves it; the line peels up and sweeps the row, then lies flat.
T.curb_appeal=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),cy=Math.min(308,G.base+10),x0=G.x0-30,x1=G.x1+70;
  const wob=(u,tt)=>Math.sin(u*Math.PI*3)*8;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle',rot:-.08},{t:500,x:440,f:'idle',rot:-.1},{t:1100,x:x1+30,y:cy-6,f:'idle',dy:wob,rot:u=>Math.sin(u*Math.PI*3)*.08},
    {t:2300,x:x0-20,y:cy-6,f:'idle',rot:-.12},{t:2600,f:'flip',rot:u=>u*Math.PI*2,hop:30},{t:2900,x:x0-20,f:'flip'},{t:3900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB drops his board and finds a curb with opinions.'); say(m.id,'curb_appeal'); scene('tn_board',3.95,{st}); scene('tn_curb',3.6,{st,y:cy,x0,x1,peelAt:1100/3600,flatAt:2450/3600}); S.roll(2.2); }],
    [1150,()=>{ sfx.whoosh(); }],
    ['hf',1800],
    [1800,()=>{ sfx.thud(); hitAll(E2,list); }],
    [2600,()=>{ sfx.select(); }],
    [4000,'end',res(E2)+'The line was beautiful and inconvenient.']]); };

// Fix the Wobble (B4): the friend's little platform rocks; TNB kneels, slides a clay wedge in, click. Pockets the spare.
T.fix_wobble=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',self=t===m,tf=!foe&&!self?battle.fx[t.idx]:null;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:800,x:sp.x,y:sp.y,f:'kneel'},{t:1900,f:'kneel'},{t:2050,f:'celeb',hop:6},{t:2450,f:'hip'},{t:2750,f:self?'idle':'runR'},{t:3400,x:'home',y:'home',f:'idle'}]);
  if(tf) tf.path={t:0,dur:1.9,fn:(q,c)=>({rot:Math.sin(c.t*7)*.07})};
  ST.play(E2,[
    [0,()=>{ setMessage('Something is wobbling. TNB can tell from across the room.'); say(m.id,'fix_wobble'); scene('tn_platform',2.9,{x:H.x,y:H.base,w:Math.max(56,H.w*.8),wedgeAt:1300/2900,fixAt:1900/2900}); }],
    [900,()=>{ scene('tn_text',1,{x:H.x+H.w*.5,y:H.base-6,txt:'SHORT CORNER',c:CREAM}); }],
    [1300,()=>{ sfxs('select'); }],
    ['hf',1900],
    [1900,()=>{ sfx.ding(); E2.apply(); sfx.heal(); scene('tn_glow',.8,{x:H.x,y:H.mid,c:'#9be39a'}); if(foe) ST.jolt(t,.15); }],
    [2100,()=>{ if(tf) tf.hop=.35; }],
    [2500,()=>{ scene('tn_text',.9,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3-140,txt:'SPARE',c:CREAM}); }],
    [3500,'end',kindLine(t,'The repair is smaller than the relief.')]]); };

// Kiln Door Policy (B5): a freestanding kiln door; he takes the enemy's shield off it like a test tile, fires it, TRY AGAIN.
T.kiln_door_policy=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),kx=F.x+F.w*.5+56,ky=F.base+2;
  let tile=null;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:kx+64,y:ky+1,f:'aim'},{t:1500,f:'throw'},{t:1800,f:'act'},{t:2150,x:kx+54,f:'idle'},{t:2450,f:'aim'},{t:3300,f:'throw'},{t:3600,f:'runR'},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB sets up a small kiln door. It has a policy.'); say(m.id,'kiln_door_policy'); scene('tn_kiln',4.0,{x:kx,y:ky,closeAt:1800/4000,openAt:2450/4000}); }],
    [750,()=>{ const h=hand(); ST.fly((x,y)=>shieldTile(x,y),F.x,F.top+10,h.x-6,h.y-6,.45,50); setMessage('The shield comes off like a test tile.'); sfxs('select'); }],
    [1200,()=>{ tile=scene('tn_tile',.3,{}); }],
    [1500,()=>{ const h=hand(); ST.fly((x,y)=>shieldTile(x,y),h.x-6,h.y-6,kx,ky-36,.3,30); sfx.whoosh(); }],
    [1800,()=>{ sfx.thud(); }],
    ['hf',2150],
    [2150,()=>{ sfx.fireball&&sfx.fireball(); scene('tn_heat',.6,{x0:kx-20,y0:ky-36,x1:F.x,y1:F.mid}); }],
    [2400,()=>{ sfx.bonk(); ST.jolt(f,.5); scene('tn_poof',.6,{x:F.x,y:F.top+10,c:CELA,n:10}); scene('tn_text',1,{x:F.x+62,y:F.top-2,txt:'CRACK',c:CELA,sc:2}); landHit(100); }],
    [2600,()=>{ const h=hand(); ST.fly((x,y)=>shieldTile(x,y,1),kx,ky-36,h.x-6,h.y-6,.3,30); }],
    [2900,()=>{ scene('tn_tile',.45,{cracked:true,tag:true}); }],
    [3350,()=>{ const h=hand(); ST.fly((x,y)=>shieldTile(x,y,1),h.x-6,h.y-6,620,h.y+40,.5,80,0,{spin:2}); sfx.whoosh(); }],
    [4300,'end',res(E2)+'The glaze stays. The shield doesn\'t.']]); };
})();

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// TNB's review: things TNB actually does (throws pots, runs the wardrobe rack on film sets, rides LA Metro, loves horror
// movies, fires his kiln to cone six, longboards). One big readable moment per move, props 2 to 3x larger.
// New on the same numbers: Mug Toss (basic, key mug_toss: a crooked test mug clunks the enemy and lands upright),
// Metro Tap Card (A3, key metro_tap: he taps his card and a light-rail train stops for the friend; Lost-and-Found
// Warmth's numbers), Slasher Jump Scare (A4, key slasher_scare: lights out, a masked slasher lunges from behind the enemy,
// scream, flash; Practical Effects' numbers). Kept, bigger: Quick Change (clothes fly off the rack onto the friend),
// Continuity Pins (sewing flourish, giant safety pins), Clay Pigeon (big bird, flapping), Curb Appeal (faster carve,
// dust), Kiln Door Policy (a big roaring cone six kiln); Cone Six and Fix the Wobble keep their pieces with larger props.
// Scenes prefix tv2_ (no warp). The older functions above stay.
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const steam=(x,y,t,n=3,c='#fff6dc',h=30)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.3)%1; gfx.globalAlpha=a0*(1-q)*.8; E(x-(n-1)*4+k*8+Math.sin(q*6+k)*4,y-q*h,4+q*4,4+q*4,c); } gfx.globalAlpha=a0; };
const T=RECRUIT_MOVES.tnb;
const CLAY='#c98a5c',CLAYD='#8f5634',SLIP='#ecd2b0',CELA='#9fd8c0',COB='#3f6fc0',CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',STEEL='#aeb3ba',RED='#e0402e',BRICK='#b8613e',BRICKD='#8a4128';
ST.nw('tv2_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tnb,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.74+dy});   // the top of his hair (blank rows above it on the rig)
// Head and chest lines of anyone (rigs differ: checked on frames).
const HEADF={tom:.86,grace:.84,rose:.84,amy:.74,deedee:.72,boppy:.72,tnb:.74,nara:.62};
const headY=(t,H)=>t&&t.side==='foe'?H.top+4:H.base-H.h*(HEADF[t&&t.id]||.8);
const chestY=(t,H)=>t&&t.side==='foe'?H.mid:H.base-H.h*((HEADF[t&&t.id]||.8)*.55);
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+(t.side==='foe'?34:30)),y:Math.min(316,u.base+3)}; };
const front=(F,gap=34)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(316,F.base+3)});
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const nameTxt=t=>String(t&&t.name||'').toUpperCase().replace(/[^A-Z0-9 !?.'\-+&]/g,'').slice(0,12);
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.tv2_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.tv2_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-22); x=p.x; y=p.y; } const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); y=Math.max(8,y); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };
SC.tv2_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); };
SC.tv2_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.7,3,s.c||CREAM); } };
SC.tv2_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); };
SC.tv2_poof=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=k/(s.n||10)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||36); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,6*(1-u)+2,6*(1-u)+2,s.c||CREAM); } };
SC.tv2_jump=(s,u)=>{ const q=u; lift(s.f,-Math.sin(q*Math.PI)*(s.h||40)+(q<.5?0:Math.sin(q*40)*3*(1-q)),Math.sin(q*Math.PI*2)*(s.spin||.2),Math.sin(q*Math.PI)*(s.ox||0)); };
SC.tv2_sparkle=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+u*3,d=(s.r||40)*(.5+.5*ez(u)); const x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d*.8,r=4*(1-u)+1; gfx.globalAlpha=1-u; poly([[x,y-r*2],[x+r*.6,y-r*.6],[x+r*2,y],[x+r*.6,y+r*.6],[x,y+r*2],[x-r*.6,y+r*.6],[x-r*2,y],[x-r*.6,y-r*.6]],k%2?GOLD:CREAM,0); } };
if(!sfx.scream) sfx.scream=(d=0)=>{ tone({type:'sawtooth',f0:1500,f1:900,dur:.7,vol:.13,delay:d,filter:3600,sweep:'lin'}); tone({type:'square',f0:1240,f1:760,dur:.65,vol:.07,delay:d+.03,filter:2800,sweep:'lin'}); noise({dur:.5,vol:.32,delay:d,f0:6000,f1:1800,type:'bandpass',q:.8}); };
if(!sfx.rumble) sfx.rumble=(d=0,dur=1.4)=>{ noise({dur,vol:.18,delay:d,f0:180,f1:260,type:'lowpass'}); tone({type:'sawtooth',f0:48,f1:62,dur,vol:.09,delay:d,filter:240}); };
if(!sfx.chime2) sfx.chime2=(d=0)=>{ tone({type:'sine',f0:988,dur:.35,vol:.11,delay:d}); tone({type:'sine',f0:784,dur:.5,vol:.11,delay:d+.32}); };
if(!sfx.hiss) sfx.hiss=(d=0)=>{ noise({dur:.4,vol:.16,delay:d,f0:5200,f1:3000,type:'bandpass',q:.6}); };
if(!sfx.brakes) sfx.brakes=(d=0)=>{ tone({type:'square',f0:2400,f1:2100,dur:.6,vol:.04,delay:d,filter:4000}); noise({dur:.7,vol:.12,delay:d,f0:3000,f1:1200,type:'bandpass',q:1}); };
const S=k=>{ if(sfx[k]) sfx[k](); };

// ---------- Mug Toss (basic; key mug_toss; same numbers as Clay Offcut) ----------
// He pulls a slightly crooked test mug out of his tote (a second, it says so), lobs it, CLUNK, and it lands upright.
const mug=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  if(PROPART.draw('tnb/test_mug',0,-1,{h:26})) { gfx.restore(); return; }   // painted stoneware mug
  ring(9,-1,5,6,5,OUT); ring(9,-1,5,6,2.4,'#e8d2b0');
  poly([[-8,-10],[9,-11.5],[7.5,10],[-7,10]],'#e8d2b0',2.2); R(-8,-10,16.5,4,'#5fae9a'); E(-4,-4,2,3,'#5fae9a'); E(3,-5,1.6,2.4,'#5fae9a'); R(-6,6,12,2,'#c9a07a'); gfx.restore(); };
SC.tv2_mugheld=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms>P.throw) return; const h=hand(); gfx.globalAlpha=1; mug(h.x-6,h.y-14,Math.sin(ms/260)*.08,2.3);
  if(ms>P.show) { RO(h.x-30,h.y-58,48,14,'#f2c94c'); label('2ND',h.x-6,h.y-54,OUT,2); } };
SC.tv2_mugrest=(s,u)=>{ gfx.globalAlpha=fade(u,.85); mug(s.x,s.y,0,2.3); if(s.t>.25) steam(s.x,s.y-26,s.t,3,'#ffffff',26); if(s.t>.35) bigWord('STILL WORKS',s.x,s.y-74,CREAM,2); };
T.mug_toss=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=homeOf(m),wx=Math.max(F.x+F.w*.5+120,Math.min(me.x-40,F.x+190));
  const P={show:900,throw:1950},hit=2500;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:800,x:wx,f:'act'},{t:1650,f:'wind',dx:u=>ez(u)*8},{t:1950,f:'throw',dx:-6},{t:2400,f:'aim'},{t:3300,f:'celeb',hop:6},{t:3600,f:'walkR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  const lx=F.x+F.w*.5+26,ly=F.base-12;
  ST.play(E2,[
    [0,()=>{ setMessage('TNB pulls a slightly crooked mug out of his tote.'); say(m.id,'mug_toss'); scene('tv2_mugheld',2.0,{P}); }],
    [900,()=>{ setMessage('It\'s a second. It even has a sticker that says so.'); S('select'); }],
    [P.throw,()=>{ const h=hand(); sfx.whoosh(); ST.fly(()=>mug(0,0,0,2.3),h.x-6,h.y-14,F.x+6,F.top+14,.55,90,0,{spin:1.25}); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); S('ting'); ST.jolt(f,.5); landHit(100); scene('tv2_rings',.5,{x:F.x+6,y:F.top+14,c:CREAM,r:44}); scene('tv2_big',1.1,{x:F.x,y:F.top-74,txt:'CLUNK!',c:GOLD,sc:4}); }],
    [2550,()=>{ ST.fly(()=>mug(0,0,0,2.3),F.x+6,F.top+14,lx,ly,.5,60,0,{spin:-1}); }],
    [3050,()=>{ sfx.ding(); scene('tv2_mugrest',1.5,{x:lx,y:ly}); setMessage('It lands upright. Not a chip on it.'); }],
    [4500,'end',res(E2)+'Handmade. Slightly crooked. Extremely effective.']]); };

// ---------- Quick Change (A1, kept: clothes fly off the rack onto the friend) ----------
const topHat=(x,y,sc,c='#2b2a26',band=RED)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); RO(-11,-2,22,4,c); RO(-7,-16,14,14,c); R(-7,-6,14,3,band); gfx.restore(); };
const jacket=(x,y,w,h,c,c2)=>{ poly([[x-w*.5,y-h*.45],[x-w*.18,y-h*.55],[x,y-h*.2],[x+w*.18,y-h*.55],[x+w*.5,y-h*.45],[x+w*.42,y+h*.5],[x+w*.08,y+h*.5],[x,y-h*.1],[x-w*.08,y+h*.5],[x-w*.42,y+h*.5]],c);
  R(x-2,y-h*.05,4,4,c2); R(x-2,y+h*.18,4,4,c2); };
const boa=(x,y,w,t)=>{ for(let k=0;k<9;k++) { const q=k/8,px=x-w*.55+q*w*1.1,py=y+Math.sin(q*Math.PI)*8+Math.sin(t*6+k)*1.5; EO(px,py,5,5,k%2?PINK:'#ffc0dc'); } };
SC.tv2_outfit=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.86); const t=s.tgt,H=ST.unit(t),hy=headY(t,H),cy=chestY(t,H),w=Math.min(64,Math.max(34,H.w*.62)),h=Math.max(30,H.h*.32);
  if(ms>P.land[1]) jacket(H.x,cy,w,h,P.c,P.c2);
  if(ms>P.land[2]) boa(H.x,cy-h*.5,w*.8,s.t);
  if(ms>P.land[0]) topHat(H.x+2,hy+2,1.8);
  if(ms>P.land[2]+150&&ms<P.land[2]+1000) bigWord('QUICK CHANGE!',H.x,Math.max(22,hy-70),GOLD,2); };
T.quick_change=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',self=t===m;
  const me=homeOf(m),px=sp.self?me.x:sp.x,py=sp.self?me.y:sp.y;
  const thr=[1000,1400,1800],land=thr.map(x=>x+350),hit=2300;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:700,x:sp.x,y:sp.y,f:'idle'},{t:850,f:'wind'},{t:thr[0],f:'throw'},{t:1250,f:'wind'},{t:thr[1],f:'throw'},{t:1650,f:'wind'},{t:thr[2],f:'throw'},{t:2250,f:'aim'},{t:2600,f:'celeb',hop:8},{t:3000,f:self?'idle':'runR'},{t:3700,x:'home',y:'home',f:'idle'}]);
  const r0=B2_RACK[(t.rack||0)%B2_RACK.length]||B2_RACK[0],hy=headY(t,H),cy=chestY(t,H);
  const P={land,c:foe?'#284fb4':r0.c,c2:foe?GOLD:r0.c2};
  const items=[(x,y)=>topHat(x,y,1.8),(x,y)=>jacket(x,y,40,34,P.c,P.c2),(x,y)=>boa(x,y,40,0)],aims=[[H.x+2,hy+2],[H.x,cy],[H.x,cy-12]];
  ST.play(E2,[
    [0,()=>{ setMessage('TNB rolls out the wardrobe rack. Arms up, '+t.name+'.'); say(m.id,'quick_change'); scene('tn_rack',3.4,{st:{x:px,y:py-34},off:.001,back:true}); scene('tv2_outfit',3.7,{P,tgt:t}); }],
    ...thr.map((ms,k)=>[ms,()=>{ const h=hand(); sfx.whoosh(); ST.fly(items[k],h.x-4,h.y-20,aims[k][0],aims[k][1],.35,self?110:70,0,{spin:k===2?0:1}); }]),
    ...land.map((ms,k)=>[ms,()=>{ S('pickup'); if(!foe&&!self) battle.fx[t.idx].hop=.25; else if(foe) ST.jolt(t,.12); }]),
    ['hf',hit],
    [hit,()=>{ sfx.ding(); E2.apply(); scene('tn_debuff',1.0,{x:H.x+10,y:H.mid,fall:H.base-H.mid}); scene('tv2_sparkle',.9,{x:H.x,y:H.mid,r:H.h*.5,n:10}); scene('tv2_glow',.8,{x:H.x,y:H.mid,c:'#c9b3e6'});
      if(!foe) { const cur=B2_RACK.find(r=>t.st&&t.st[r.id]); if(cur) scene('tn_tag',1.4,{x:H.x,y:Math.max(20,hy-28),txt:cur.tag,c:cur.c,delay:.85}); } }],
    [2650,()=>{ setMessage(foe?'Hat, jacket, boa. It\'s never looked better.':'Hat, jacket, boa. Same person, better pockets.'); }],
    [3800,'end',kindLine(t,'Same person, better pockets. The pockets were the important part.')]]); };

// ---------- Continuity Pins (A2, kept: a sewing flourish and giant safety pins) ----------
const needle=(x,y,ang)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); LnO(-18,0,18,0,3,'#dfe6ee'); ring(-13,0,3,1.6,1.5,OUT); poly([[18,-2],[26,0],[18,2]],'#dfe6ee',1.5); gfx.restore(); };
const bigPin=(x,y,open,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  LnO(0,10,0,-12,2.4,'#dfe6ee'); ring(0,12,3.4,3.4,4,OUT); ring(0,12,3.4,3.4,2,'#dfe6ee');
  gfx.save(); gfx.translate(0,12); gfx.rotate(-open*.9); LnO(2.5,-2,2.5,-24,2,'#eef2f6'); gfx.restore();
  RO(-3.5,-16,7,6,'#c9ced6'); R(-2,-14,4,1.5,'#f4f6fa'); gfx.restore(); };
SC.tv2_sew=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9); const cx=P.x,cy=P.y,rx=P.rx,ry=P.ry,N=40;
  const q=cl((ms-P.s0)/(P.s1-P.s0)); if(q<=0) return;
  const pt=k=>{ const a=-Math.PI/2+k/N*Math.PI*2; return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]; };
  const n=Math.floor(q*N); for(let k=0;k<n;k+=1) { if(k%2) continue; const [x0,y0]=pt(k),[x1,y1]=pt(k+1); LnO(x0,y0,x1,y1,2.5,'#ffd27a'); }
  if(q<1) { const a=-Math.PI/2+q*Math.PI*2,nx=cx+Math.cos(a)*rx,ny=cy+Math.sin(a)*ry+Math.sin(ms/40)*6; needle(nx,ny,a+Math.PI/2+Math.sin(ms/60)*.5); bigWord('STITCH',cx,cy-ry-40,CREAM,2); }
  else if(ms<P.s1+600) bigWord('STITCHED',cx,cy-ry-40,GOLD,2); };
SC.tv2_pins=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9);
  P.pins.forEach((p,k)=>{ const t0=P.drop[k]; if(ms<t0) return; const d=ez((ms-t0)/250),y=lerp(p.y-140,p.y,d),snap=ms>t0+450?1:0; bigPin(p.x,y,snap?0:1,3);
    if(snap&&ms<t0+1100) bigWord('SNAP',p.x+(k?34:-34),p.y-60,GOLD,2); }); };
T.continuity_pins=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),tom=B2.party.find(p=>p.id==='tom'&&b2Alive(p)),foe=t.side==='foe';
  const P={x:H.x,y:H.mid,rx:H.w*.5+12,ry:H.h*.55+6,s0:800,s1:1700},hit=2600;
  const pins={pins:[{x:H.x-H.w*.5+2,y:H.mid+10},{x:H.x+H.w*.5-2,y:H.mid+10}],drop:[1800,2150]};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:sp.self?'idle':'run'},{t:700,x:sp.x,y:sp.y,f:'kneel'},{t:800,f:'aim',dx:(u,tt)=>Math.sin(tt*24)*3},{t:1700,f:'throw'},{t:2150,f:'throw',dx:-4},{t:2600,f:'celeb',hop:8},{t:3100,f:sp.self?'idle':'runR'},{t:3800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB spots a loose thread. He always spots the loose thread.'); say(m.id,'continuity_pins'); scene('tv2_sew',3.4,{P}); scene('tv2_pins',3.6,{P:pins}); }],
    [800,()=>{ setMessage('Needle out. A quick running stitch, all the way around.'); for(let k=0;k<6;k++) tone({type:'square',f0:1500+k*40,dur:.03,vol:.05,delay:k*.14}); }],
    [1800,()=>{ sfx.whoosh(); setMessage('Then the big safety pins. Belt and suspenders.'); }],
    [2250,()=>{ S('click'); }],[2600,()=>{ S('click'); }],
    ['hf',hit],
    [hit,()=>{ sfx.ding(); E2.apply(); sfx.heal(); scene('tv2_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a',rx:H.w*.6,ry:H.h*.6}); scene('tv2_big',1.2,{x:H.x,y:Math.max(40,H.top-74),txt:'IN ONE PIECE',c:GOLD,sc:3}); if(foe) ST.jolt(t,.15); }],
    [2900,()=>{ if(tom&&!foe&&t!==tom) { const a=ST.unit(m),b=ST.unit(tom); ST.fly(()=>heart(0,0,7,PINK),(battle.actorPos||{cx:a.x}).cx-10,a.top+30,b.x,b.top+10,.6,40); } else if(tom&&!foe) ST.fly(()=>heart(0,0,7,PINK),H.x,H.top,H.x,H.top-26,.8,0); }],
    [3500,()=>{ if(tom&&!foe&&t!==tom) { battle.fx[tom.idx].hop=.35; S('kiss'); } }],
    [3900,'end',kindLine(t,'TNB checks the person before the costume.')]]); };

// ---------- Metro Tap Card (A3; key metro_tap; same numbers as Lost-and-Found Warmth) ----------
// He taps his card at the reader (BEEP), a light-rail train glides in behind the line and stops with its doors right at
// the friend; warm air rolls out, they feel better; ding-dong, doors closing, it pulls away.
const tapCard=(x,y,ang)=>{ if(PROPART.draw('tnb/metro_card',x,y,{w:44,rot:ang})) return; gfx.save(); gfx.translate(x,y); gfx.rotate(ang); RO(-17,-11,34,22,'#2f7fd0'); R(-17,-4,34,4,'#ffd166'); R(-13,4,10,4,'#dfe6ee'); label('TAP',4,4,'#fff6dc',1); gfx.restore(); };
const reader=(x,y,ok)=>{ if(PROPART.draw('tnb/card_reader',x,y-42,{h:86})) { if(!ok) label('TAP',x,y-102,GOLD,1); return; }   // painted reader (its light is always green)
  RO(x-6,y-58,12,58,'#5e6670'); RO(x-14,y-80,28,26,'#3a3f46'); R(x-10,y-76,20,14,ok?'#5ad06a':'#2a2f36'); if(ok) { Ln(x-5,y-69,x-1,y-65,2.5,'#fff'); Ln(x-1,y-65,x+6,y-74,2.5,'#fff'); } else label('TAP',x,y-72,GOLD,1); };
SC.tv2_reader=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fin(u,.08)*fade(u,.9); reader(P.x,P.y,ms>P.beep);
  if(ms<P.beep+120) { const h=hand(); tapCard(h.x-4,h.y-10,-.2); }
  if(ms>P.beep&&ms<P.beep+900) bigWord('BEEP!',P.x,P.y-104,'#9be39a',3); };
const trainCar=(x,y,P,doors)=>{ const L=P.len,Hh=70,top=y-Hh;
  if(PROPART.draw('tnb/light_rail_train',x,y-62,{w:176})) { P.paint=1; return; }   // painted light-rail car (no animated doors; the warm light cone still opens at the friend)
  P.paint=0;
  poly([[x-L*.5+26,top],[x+L*.5,top],[x+L*.5,y-10],[x-L*.5,y-10],[x-L*.5,top+30]],'#dfe3e8');
  R(x-L*.5+8,y-24,L-8,8,'#e0402e'); R(x-L*.5+20,top+4,L-24,4,'#c9a23a');
  poly([[x-L*.5+28,top+8],[x-L*.5+44,top+8],[x-L*.5+44,top+30],[x-L*.5+8,top+30]],'#2a3a4a',2);
  for(let wx=x-L*.5+56;wx<x+L*.5-24;wx+=34) { if(Math.abs(wx+12-P.dx-x)<26) continue; RO(wx,top+10,22,18,'#7fb0d8'); R(wx+2,top+12,6,14,'#a8cce8'); }
  const dx=x+P.dx,op=doors*14; RO(dx-16,top+8,32,y-10-top-8,'#2a3440');
  if(op>0) { gfx.globalAlpha*=1; R(dx-16+0,top+8,32,y-18-top,'#ffd98a'); }
  R(dx-16-op,top+8,16,y-18-top,'#c9ced6'); R(dx+op,top+8,16,y-18-top,'#c9ced6'); R(dx-14-op,top+12,12,14,'#7fb0d8'); R(dx+2+op,top+12,12,14,'#7fb0d8');
  for(const k of [-.32,.32]) { EO(x+k*L,y-6,8,8,'#3a3f46'); E(x+k*L,y-6,3,3,STEEL); EO(x+k*L+24,y-6,8,8,'#3a3f46'); }
  R(x-L*.5,y-2,L,3,OUT); Ln(x-L*.2,top,x-L*.1,top-14,2,OUT); Ln(x-L*.1,top-14,x+L*.05,top-14,2,OUT); };
SC.tv2_train=(s,u)=>{ const ms=s.t*1000,P=s.P; let x;
  if(ms<P.stop) x=lerp(P.x0,P.xs,1-Math.pow(1-ez((ms-P.in)/(P.stop-P.in)),2)); else if(ms<P.go) x=P.xs; else x=lerp(P.xs,P.x1,Math.pow(cl((ms-P.go)/(P.gone-P.go)),2));
  if(ms<P.in) return; const doors=ms<P.open?0:ms<P.shut?ez((ms-P.open)/200):1-ez((ms-P.shut)/200);
  gfx.globalAlpha=1; trainCar(x,P.y+Math.sin(ms/50)*(ms<P.stop||ms>P.go?.8:0),P,doors);
  if(ms>P.open&&ms<P.shut+200) { const dx=x+P.dx; gfx.globalAlpha=.35*doors; poly([[dx-16,P.y-62],[dx+16,P.y-62],[dx+46,P.y+14],[dx-46,P.y+14]],'#ffd98a',0); }
  gfx.globalAlpha=1; if(ms>P.stop-200&&ms<P.go) { const sy=Math.max(4,Math.min(P.y-(P.paint?168:122),P.top-48)); RO(x+P.dx-60,sy,120,40,'#2a2f36'); label('NEXT STOP',x+P.dx,sy+5,'#ffb04a',2); label(P.name,x+P.dx,sy+25,'#ffd27a',2); } };
T.metro_tap=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),foe=t.side==='foe',me=homeOf(m),self=t===m;
  const rx=me.x-62,P={x:rx,y:me.y,beep:900};
  const TR={in:1100,stop:2000,open:2150,shut:3050,go:3300,gone:4100,y:Math.max(110,H.base-14),len:260,dx:0,name:nameTxt(t),top:H.top};
  TR.xs=Math.max(40,Math.min(536,H.x)); TR.x0=760+TR.len*.5; TR.x1=-TR.len*.6; const hit=2400;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:600,x:rx+30,f:'aim'},{t:900,f:'celeb',hop:5},{t:1300,f:'idle'},{t:2100,f:'spread'},{t:2900,f:'idle'},{t:3300,f:'walkR'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB pulls out his Metro card. He knows exactly which pocket.'); say(m.id,'metro_tap'); scene('tv2_reader',2.3,{P}); scene('tv2_train',4.3,{P:TR,back:true}); }],
    [P.beep,()=>{ S('beep'); }],
    [TR.in,()=>{ sfx.rumble(0,1.1); setMessage('A light-rail train glides in. Right on time, for once.'); }],
    [1700,()=>{ sfx.brakes(); }],
    [TR.open,()=>{ sfx.hiss(); setMessage('The doors open right at '+t.name+'. Warm air rolls out.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.heal(); scene('tv2_glow',1.0,{x:H.x,y:H.mid,c:'#ffd98a',rx:H.w*.6,ry:H.h*.6}); scene('tv2_sparkle',.9,{x:H.x,y:H.mid,r:H.h*.45}); if(!foe&&!self) battle.fx[t.idx].hop=.35; if(foe) ST.jolt(t,.15); }],
    [2600,()=>{ for(const p of B2.party) if(p!==m&&b2Alive(p)&&p!==t) battle.fx[p.idx].hop=.2; }],
    [TR.shut-250,()=>{ sfx.chime2(); setMessage('Ding dong. Doors closing.'); }],
    [TR.go,()=>{ sfx.rumble(0,.9); }],
    [4300,'end',kindLine(t,'Next stop: feeling better. Please mind the gap.')]]); };

// ---------- Slasher Jump Scare (A4; key slasher_scare; same numbers as Practical Effects) ----------
// Lights out. A flashlight under TNB's chin. Heartbeat. Then a masked slasher lunges out from behind the enemy: scream,
// flash, the enemy jumps out of its skin. Lights up: the slasher waves and backs away into the dark. Kid-safe, no blood.
const slasher=(x,y,sc,arms)=>{ if(PROPART.ready('tnb/slasher_standee')) { const hh=82*sc; PROPART.draw('tnb/slasher_standee',x,y-hh/2,{h:hh,rot:arms>0?Math.sin(performance.now()/70)*.05*Math.min(1,arms):0}); return; }   // painted slasher standee; the drawn figure below is the fallback
  gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  poly([[-20,0],[-16,-48],[-24,-40],[-30,-22],[-26,-16],[-18,-34],[18,-34],[26,-16],[30,-22],[24,-40],[16,-48],[20,0]],'#2a2830');
  const a=arms; poly([[-16,-46],[-30-a*10,-62-a*16],[-24-a*10,-68-a*16],[-10,-50]],'#2a2830'); poly([[16,-46],[30+a*10,-62-a*16],[24+a*10,-68-a*16],[10,-50]],'#2a2830');
  for(const sx of [-1,1]) { const hx=sx*(28+a*10),hy=-66-a*16; for(let k=-1;k<=1;k++) LnO(hx,hy,hx+sx*3+k*4,hy-9,2,'#e8e0d0'); }
  EO(0,-62,13,16,'#2a2830'); E(0,-60,11,14,'#f1ece0'); E(-4.5,-63,3.5,4,'#0a0814'); E(4.5,-63,3.5,4,'#0a0814');
  for(const k of [-6,-2,2,6]) R(k-.5,-52,1.5,4,'#5a5040'); Ln(-7,-50,7,-50,1.5,'#5a5040'); for(const [dx,dy] of [[-6,-70],[6,-70],[0,-72],[-3,-56],[3,-56]]) E(dx,dy,1,1,'#8a8070');
  gfx.restore(); };
SC.tv2_dark=(s,u)=>{ const ms=s.t*1000,P=s.P; let a=0;
  if(ms<P.on+100) a=cl((ms-P.on)/100); else if(ms<P.up) a=1; else a=1-cl((ms-P.up)/350);
  if(ms>P.flick&&ms<P.flick+260) a=Math.sin((ms-P.flick)/30)>0?.55:1;
  gfx.globalAlpha=a*.93; gfx.fillStyle='#06040c'; gfx.beginPath(); gfx.rect(0,0,576,324);
  const st=s.st; if(st&&st.x!=null&&ms>P.on+150&&ms<P.up) { const p=head(st,40),r=1+.04*Math.sin(ms/45); gfx.ellipse(p.x-4,p.y,30*r,40*r,0,0,Math.PI*2); }
  gfx.fill('evenodd'); };
SC.tv2_torch=(s,u)=>{ const ms=s.t*1000,P=s.P,st=s.st; if(!st||st.x==null||ms<P.on||ms>P.up) return; const p=head(st,40); gfx.globalAlpha=.22+.05*Math.sin(ms/50); E(p.x-4,p.y,30,40,'#ffe9a0');
  gfx.globalAlpha=.95; if(!PROPART.draw('tnb/flashlight',p.x-9.5,p.y+39,{w:24,rot:Math.PI/2})) { RO(p.x-14,p.y+30,9,18,'#5e6670'); E(p.x-9.5,p.y+29,6,3,'#fff6c8'); } if(ms>P.on+300&&ms<P.lunge-200) bigWord('SHHH',p.x,p.y-30,CREAM,2); };
SC.tv2_slasher=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.peek) return; let x,y,sc,a=1,arms=0;
  if(ms<P.lunge) { const q=cl((ms-P.peek)/(P.lunge-P.peek)); x=P.bx+Math.sin(ms/400)*4; y=P.by; sc=.9+q*.15; a=.3+q*.4; }
  else if(ms<P.lunge+220) { const q=ez((ms-P.lunge)/220); x=lerp(P.bx,P.fx,q); y=lerp(P.by,P.fy,q); sc=lerp(.9,2.0,q); arms=q; }
  else if(ms<P.wave) { x=P.fx+Math.sin(ms/25)*1.5; y=P.fy; sc=2.0; arms=1; }
  else { const q=cl((ms-P.wave)/(P.gone-P.wave)); x=lerp(P.fx,P.bx,ez(q)); y=lerp(P.fy,P.by,ez(q)); sc=lerp(2.0,.9,ez(q)); arms=.4+Math.sin(ms/70)*.35; a=1-q; }
  gfx.globalAlpha=a; slasher(x,y,sc,arms); };
T.slasher_scare=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),hit=2050;
  const P={on:350,flick:1500,lunge:2000,up:2650,peek:1050,wave:3250,gone:3950,bx:F.x-6,by:Math.max(110,F.base-20),fx:Math.min(540,F.x+F.w*.5+30),fy:Math.min(318,F.base+8)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'aim'},{t:350,f:'hip'},{t:700,f:'act'},{t:1900,f:'dodge'},{t:2650,f:'celeb',hop:6},{t:3100,f:'clap'},{t:3600,f:'idle'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB reaches for the light switch.'); say(m.id,'slasher_scare'); scene('tv2_dark',3.1,{P,st}); scene('tv2_slasher',4.1,{P}); scene('tv2_torch',2.8,{P,st}); }],
    [P.on,()=>{ S('click'); setMessage('Click. Total darkness. A flashlight clicks on under his chin.'); }],
    [700,()=>{ tone({type:'sawtooth',f0:55,f1:52,dur:1.4,vol:.12,filter:300}); }],
    [1000,()=>{ S('heartbeat'); setMessage('Something is standing behind '+(f.def?f.def.the:'it')+'.'); }],
    [1450,()=>{ S('heartbeat'); }],
    [P.flick,()=>{ noise({dur:.25,vol:.12,f0:4000,f1:2000}); }],
    ['hf',hit],
    [P.lunge,()=>{ sfx.scream(); scene('tv2_flash',.45,{a:.95}); }],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('tv2_jump',.9,{f,h:52,spin:.25}); scene('tv2_big',1.3,{x:F.x,y:F.top-74,txt:'AAAAH!',c:'#ff6b6b',sc:4}); setMessage('AAAAH! It jumps clean out of its skin!'); }],
    [P.up,()=>{ S('click'); setMessage('Lights up. The slasher gives a polite little wave.'); }],
    [3150,()=>{ scene('tv2_text',1.2,{st,txt:'GREAT SCREAM!',c:GOLD,sc:2}); S('ding'); }],
    [4200,'end',res(E2)+'Never look behind you. TNB has seen every one of these movies.']]); };

// ---------- Clay Pigeon, Literally (B1, kept: a big clay bird that really flaps) ----------
const bigBird=(x,y,ph,sc,lump=0)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  if(lump>0) { EO(0,0,9+lump*1.5,7,CLAY); Ln(-6,-5,-1,-3,2,OUT); Ln(6,-5,1,-3,2,OUT); E(-3,-1,1.5,1.5,OUT); E(3,-1,1.5,1.5,OUT); gfx.restore(); return; }
  const w=Math.sin(ph); poly([[-1,-2],[7,-2],[3,-4-w*13]],CLAYD,2); EO(0,0,10,7,CLAY); EO(-9,-4,5,5,CLAY); poly([[-14,-4],[-19,-2],[-14,-1]],GOLD,1.5); E(-10,-5,1.5,1.5,OUT); poly([[8,-1],[16,-5],[15,3]],CLAYD,2);
  poly([[-3,-1],[5,-1],[1,-3+w*11]],'#d89a6a',2); gfx.restore(); };
SC.tv2_shape=(s,u)=>{ const h=hand(),x=h.x-8,y=h.y-20,ms=s.t*1000; gfx.globalAlpha=1;
  if(ms<900) { const q=ms/900; EO(x,y,16-q*3,14,CLAY); for(let k=0;k<4;k++) { const a=s.t*9+k*1.6; R(x+Math.cos(a)*24,y+Math.sin(a)*14,3,3,SLIP); } bigWord('SQUISH',x,y-50,CREAM,2); }
  else { bigBird(x,y,s.t*14,2.2); if(ms<1500) bigWord('COO?',x,y-50,GOLD,2); } };
T.clay_pigeon=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=homeOf(m),wx=Math.max(F.x+F.w*.5+120,Math.min(me.x-30,F.x+200)),hit=2300;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'aim',dx:(u,tt)=>Math.sin(tt*20)*1.5},{t:1000,f:'walk'},{t:1450,x:wx,f:'wind'},{t:1700,f:'throw',dx:-6},{t:2200,f:'idle'},{t:2750,f:'aim'},{t:3300,f:'walkR'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB squishes a lump of soft clay into a little bird.'); say(m.id,'clay_pigeon'); scene('tv2_shape',1.7,{}); }],
    [1700,()=>{ const h=hand(); sfx.whoosh(); ST.fly((x,y,u,s)=>{ bigBird(0,0,s.t*22,2.2); },h.x-8,h.y-20,F.x+8,F.mid,.6,90); setMessage('He throws it. It FLAPS.'); }],
    [1900,()=>{ S('squeak'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.5); scene('tv2_poof',.55,{x:F.x+8,y:F.mid,c:CLAY}); scene('tv2_big',1.1,{x:F.x,y:F.top-74,txt:'COO!',c:GOLD,sc:4}); landHit(100); }],
    [2350,()=>{ const h0=hand(); ST.fly((x,y,u)=>bigBird(0,0,0,2.2,u),F.x+8,F.mid,h0.x-30,h0.y-18,.45,50); }],
    [2800,()=>{ ST.draw(()=>{ const h=hand(); bigBird(h.x-8,h.y-18,0,2.2,1); bigWord('HMPH',h.x-8,h.y-56,CREAM,2); },.7); }],
    [4100,'end',res(E2)+'The craftsmanship is better than the joke.']]); };

// ---------- Cone Six, Please (B2, kept: the cone and the glaze are bigger) ----------
SC.tn_cone=(s,u)=>{ const bend=cl((u-s.bendAt)/.25),bow=s.bowAt&&u>s.bowAt?Math.sin(cl((u-s.bowAt)/.25)*Math.PI):0; gfx.globalAlpha=fin(u,.06)*fade(u,.93);
  RO(s.x-20,s.y-6,40,6,SLIP); gfx.save(); gfx.translate(s.x,s.y-6); gfx.rotate(-bend*1.0-bow*.5); poly([[-10,0],[10,0],[2,-54],[-2,-54]],'#f0d080'); gfx.restore(); if(bend>.5) bigWord('CONE 6',s.x,s.y-86,GOLD,2); };
SC.tn_glaze=(s,u)=>{ const d=ez(u/.4),x=s.x,y0=s.y-s.h,h=s.h*d; gfx.globalAlpha=fin(u,.05)*fade(u,.8)*.55; gfx.fillStyle=CELA; gfx.beginPath();
  gfx.moveTo(x-s.w*.5,y0); gfx.lineTo(x+s.w*.5,y0); for(let k=0;k<=8;k++) { const px=x+s.w*.5-k*s.w/8; gfx.lineTo(px,y0+h-(k%2?10:0)*d); } gfx.closePath(); gfx.fill();
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.strokeStyle=COB; gfx.lineWidth=3; gfx.strokeRect(x-s.w*.5,y0,s.w,Math.max(2,h)); if(d>.9) bigWord('GLAZED',x,Math.max(16,y0-22),CELA,2); };

// ---------- Curb Appeal (B3, kept: a faster carve with dust) ----------
SC.tv2_dust=(s,u)=>{ const st=s.st,ms=s.t*1000; s.trail=s.trail||[];
  if(st&&st.x!=null&&ms<s.until) { const l=s.trail[s.trail.length-1]; if(!l||Math.hypot(st.x-l.x,st.y-l.y)>6) s.trail.push({x:st.x+18,y:st.y+6,t:s.t}); }
  for(const p of s.trail) { const a=s.t-p.t; if(a>.7) continue; const q=a/.7; gfx.globalAlpha=(1-q)*.6; E(p.x+q*10,p.y-q*16,5+q*12,4+q*8,'#d8c8a8'); } };
T.curb_appeal=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),cy=Math.min(308,G.base+10),x0=G.x0-30,x1=G.x1+70,hit=1350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle',rot:-.08},{t:300,x:x1+60,y:cy-6,f:'idle',rot:-.14,ease:'in'},{t:650,x:x1+30,f:'idle'},
    {t:700,x:x0-20,y:cy-6,f:'idle',ease:'lin',dy:u=>Math.sin(u*Math.PI*5)*12,rot:u=>Math.cos(u*Math.PI*5)*.18},{t:1550,f:'flip',rot:u=>u*Math.PI*2,hop:34},{t:1850,x:x0-20,f:'celeb'},
    {t:2150,f:'idle',rot:u=>Math.sin(u*Math.PI*3)*.1,dy:u=>Math.sin(u*Math.PI*3)*6},{t:3050,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB drops his board, kicks twice, and carves the curb line. Fast.'); say(m.id,'curb_appeal'); scene('tn_board',3.1,{st}); scene('tn_curb',2.9,{st,y:cy,x0,x1,peelAt:700/2900,flatAt:1650/2900}); scene('tv2_dust',3.1,{st,until:2000}); S('run'); noise({dur:1.6,vol:.1,f0:1800,f1:900,type:'bandpass',q:.7}); }],
    [700,()=>{ sfx.whoosh(); }],[1000,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); all(list); landHit(100); scene('tv2_big',1.0,{x:G.x,y:Math.max(40,G.top-74),txt:'SHRED!',c:GOLD,sc:4}); }],
    [1550,()=>{ S('spin'); }],[1850,()=>{ sfx.select(); }],
    [3300,'end',res(E2)+'The line was beautiful and inconvenient.']]); };

// ---------- Fix the Wobble (B4, kept: the platform, the wedge and the CLICK are bigger) ----------
SC.tn_platform=(s,u)=>{ const fixed=u>s.fixAt,a=fixed?0:Math.sin(s.t*7)*.08; gfx.globalAlpha=fin(u,.08)*fade(u,.9); gfx.save(); gfx.translate(s.x,s.y+6); gfx.rotate(a);
  RO(-s.w*.5,-4,s.w,10,'#c9b48a'); R(-s.w*.5,6,10,8,'#8a7a5a'); R(s.w*.5-10,6,10,fixed?8:3,'#8a7a5a'); gfx.restore();
  const wq=cl((u-s.wedgeAt)/(s.fixAt-s.wedgeAt)); if(u>s.wedgeAt) { const wx=lerp(s.x+s.w*.5+50,s.x+s.w*.5-6,ez(wq)); poly([[wx-12,s.y+20],[wx+12,s.y+20],[wx+12,s.y+10]],CLAY); }
  if(!fixed&&u>.15) bigWord('WOBBLE',s.x,s.y+26,CREAM,2); if(fixed&&u<s.fixAt+.25) bigWord('CLICK',s.x+s.w*.5,s.y-30,GOLD,3); };

// ---------- Kiln Door Policy (B5, kept name and numbers: the animation is now a big roaring cone six kiln) ----------
// A full-size brick kiln drops in. He dials it to CONE 6, it rumbles and glows, he swings the door open: FWOOM, the heat
// rolls over the enemy and melts its shield. He closes the door. Policy.
// Painted kiln (tnb/brick_kiln, door faces left toward the enemy). Image px 147x160: door x 16..95, y 55..140, chimney top at x 127.
const paintedKiln=(x,y,P,ms)=>{ const k=118/160,heat=cl((ms-P.dial)/(P.open-P.dial)),sh=ms>P.dial&&ms<P.shut?Math.sin(ms/22)*heat*2:0,X=ix=>x+sh+(ix-73.5)*k,Y=iy=>y-59+(iy-80)*k;
  gfx.save(); E(x+4,y+1,58,8,'rgba(0,0,0,.3)'); PROPART.draw('tnb/brick_kiln',x+sh,y-59,{h:118});
  const a0=gfx.globalAlpha; if(heat>0) { gfx.globalAlpha=a0*(.1+heat*.28+.05*Math.sin(ms/60)); E(X(70),Y(95),64,54,'#ffb04a'); gfx.globalAlpha=a0; steam(X(127),Y(2),ms/1000,3,'#d8d0c8',40); }
  const dO=ms<P.open?0:ms<P.shut?ez((ms-P.open)/140):1-ez((ms-P.shut)/140);
  if(dO>0) { const dx=X(20),dy=Y(62),dw=70*k,dh=74*k; E(dx+dw*.5,dy+dh*.5,dw*.62,dh*.62,'#ffd27a'); R(dx,dy,dw,dh,'#ffb04a'); for(let q=0;q<5;q++) { const t=(ms/300+q*.2)%1; E(dx+8+q*10,dy+dh-6-t*40,5*(1-t)+2,7*(1-t)+2,q%2?'#fff1b0':'#ff8a2a'); }
    RO(X(14),dy-2,5,dh+4,'#4a4f58'); }
  gfx.restore(); };
const kiln=(x,y,P,ms)=>{ if(PROPART.ready('tnb/brick_kiln')) return paintedKiln(x,y,P,ms); const W=96,Hh=118,top=y-Hh,heat=cl((ms-P.dial)/(P.open-P.dial)),sh=ms>P.dial&&ms<P.shut?Math.sin(ms/22)*heat*2:0; gfx.save(); gfx.translate(sh,0);
  RO(x-W*.5,top,W,Hh,BRICK); for(let r=0;r<9;r++) { const yy=top+6+r*12; R(x-W*.5,yy,W,2,BRICKD); for(let c=0;c<5;c++) { const xx=x-W*.5+((r%2)?10:0)+c*22; R(xx,yy+2,2,10,BRICKD); } }
  if(heat>0) { gfx.globalAlpha*=1; const g=.15+heat*.5+.1*Math.sin(ms/60); const a0=gfx.globalAlpha; gfx.globalAlpha=a0*g; for(let r=0;r<9;r++) R(x-W*.5,top+6+r*12,W,2,'#ffb04a'); gfx.globalAlpha=a0; }
  RO(x-W*.5-6,top-8,W+12,10,'#4a4f58'); RO(x-W*.5-6,y-6,W+12,8,'#4a4f58'); RO(x+W*.5-12,top+6,8,Hh-14,'#4a4f58');
  for(const k of [-.3,.3]) { RO(x+k*W-4,y,8,8,'#3a3f46'); }
  RO(x+W*.5-2,top+40,34,10,'#5e6670'); RO(x+W*.5+30,top+14,6,64,'#5e6670'); // vent pipe
  if(heat>0) steam(x+W*.5+33,top+12,ms/1000,3,'#d8d0c8',40);
  const dx=x+W*.5-30,dy=top+22; EO(dx,dy,13,13,'#e8e4dc'); const na=lerp(-2.4,.5,ez(cl((ms-P.dial)/500))); LnO(dx,dy,dx+Math.cos(na)*10,dy+Math.sin(na)*10,2,RED); label('6',dx+9,dy+2,OUT,1);
  const doorOpen=ms<P.open?0:ms<P.shut?ez((ms-P.open)/140):1-ez((ms-P.shut)/140),dw=56,dh=70,dyy=y-dh-14,dxl=x-W*.5-2;
  if(doorOpen>0) { const g=ms<P.shut?1:1-doorOpen; E(dxl+dw*.5+2,dyy+dh*.5,dw*.55,dh*.55,'#ffd27a'); R(dxl+4,dyy+4,dw-8,dh-8,'#ffb04a'); for(let k=0;k<5;k++) { const q=(ms/300+k*.2)%1; E(dxl+12+k*8,dyy+dh-8-q*40,6*(1-q)+2,8*(1-q)+2,k%2?'#fff1b0':'#ff8a2a'); } }
  const dwid=dw*(1-doorOpen*1.6); if(dwid>0) { RO(dxl,dyy,dwid,dh,'#6a6e76'); R(dxl+4,dyy+4,Math.max(0,dwid-8),dh-8,'#8a8e96'); if(dwid>20) RO(dxl+dwid-10,dyy+dh*.45,6,10,'#c9ced6'); }
  else { const ow=-dwid; RO(dxl-ow,dyy,ow,dh,'#6a6e76'); }
  gfx.restore(); };
SC.tv2_kiln=(s,u)=>{ const ms=s.t*1000,P=s.P; const drop=ez(cl(ms/350)),lift2=ms>P.leave?ez((ms-P.leave)/400):0,y=lerp(-30,P.y,drop)-lift2*360; gfx.globalAlpha=1;
  kiln(P.x,y,P,ms); if(ms>P.dial+150&&ms<P.open) bigWord('CONE 6',P.x,y-150,GOLD,3); if(ms>P.shut&&ms<P.shut+900) bigWord('POLICY',P.x,y-150,CREAM,3); };
SC.tv2_blast=(s,u)=>{ const x0=s.x0,y0=s.y0,x1=s.x1,y1=s.y1,L=Math.hypot(x1-x0,y1-y0)+40,a0=Math.atan2(y1-y0,x1-x0),grow=ez(u/.25),shrink=u>.7?(1-u)/.3:1,len=L*grow,spr=.32*shrink+.05;
  const layer=(f,c,o)=>{ const pts=[[x0,y0-20],[x0,y0+20]]; for(let k=8;k>=0;k--) { const q=k/8,a=a0+lerp(spr,-spr,q)*f,r=len*(.9+.1*Math.sin(s.t*40+k*1.7)); pts.push([x0+Math.cos(a)*r,y0+Math.sin(a)*r]); } gfx.globalAlpha=shrink*.95; poly(pts,c,o); };
  layer(1,'#e0402e',3); layer(.7,'#ff8a2a',0); layer(.4,'#ffe070',0);
  for(let k=0;k<4;k++) { const q=cl(u*1.5-k*.12); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.7; ring(lerp(x0,x1,q),lerp(y0,y1,q),10+q*30,14+q*40,3,k%2?'#ffb04a':GOLD); } };
SC.tv2_shield=(s,u)=>{ const ms=s.t*1000,P=s.P; if(!P.has) return; const cx=P.x,cy=P.y,rx=P.rx,ry=P.ry; gfx.globalAlpha=1;
  if(ms<P.crack) { gfx.globalAlpha=.35; E(cx,cy,rx,ry,CELA); gfx.globalAlpha=.9; ring(cx,cy,rx,ry,3,'#dff6ee'); return; }
  const q=cl((ms-P.crack)/500); if(q>=1) return;
  for(let k=0;k<10;k++) { const a=k/10*Math.PI*2,d=q*60,px=cx+Math.cos(a)*(rx+d),py=cy+Math.sin(a)*(ry+d)+q*q*60; gfx.globalAlpha=1-q; gfx.save(); gfx.translate(px,py); gfx.rotate(a+q*6); poly([[-6,-4],[6,-5],[2,6]],CELA,2); gfx.restore(); } };
T.kiln_door_policy=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),kx=Math.min(456,F.x+F.w*.5+76),ky=Math.min(314,F.base+4),hit=2150;
  const P={x:kx,y:ky,dial:1000,open:1950,shut:2900,leave:3500};
  const SP={x:F.x,y:F.mid,rx:F.w*.55+8,ry:F.h*.55+8,crack:2250,has:!!(f&&f.shield)};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:Math.min(556,kx+104),y:ky+2,f:'idle'},{t:950,f:'aim',dx:(u,tt)=>Math.sin(tt*30)*1.5},{t:1700,f:'wind'},{t:1950,f:'throw',dx:-8},{t:2500,f:'hip'},{t:2800,f:'act',dx:-6},{t:3200,f:'celeb',hop:6},{t:3600,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB wheels in his kiln. The big one.'); say(m.id,'kiln_door_policy'); scene('tv2_kiln',3.95,{P,back:true}); scene('tv2_shield',2.9,{P:SP}); }],
    [350,()=>{ sfx.thud(); }],
    [P.dial,()=>{ for(let k=0;k<6;k++) tone({type:'square',f0:1200,dur:.03,vol:.06,delay:k*.08}); setMessage('He dials it all the way to cone six.'); }],
    [1400,()=>{ sfx.rumble(0,.8); setMessage('It rumbles. The bricks start to glow.'); }],
    [P.open,()=>{ sfx.flame?sfx.flame(0,.9):null; sfx.fireball&&sfx.fireball(); scene('tv2_blast',.95,{x0:kx-50,y0:ky-50,x1:F.x,y1:F.mid}); scene('tv2_flash',.35,{a:.45,c:'#ffb04a'}); setMessage('He swings the door open. FWOOM!'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.6); landHit(100); scene('tv2_big',1.2,{x:F.x,y:F.top-74,txt:'FWOOM!',c:'#ffb040',sc:4}); }],
    [SP.crack,()=>{ S('crunch'); }],
    [P.shut,()=>{ (sfx.clang||sfx.thud)(); setMessage('He closes the door. Bad ideas cool off outside.'); }],
    [4400,'end',res(E2)+'The glaze stays. The shield doesn\'t.']]); };
})();

// ================= Round 3 override from Tom (2026-10-24 18:40, claude/move-review.md) =================
// Throw Down (B1, key throw_down, was clay_pigeon): same numbers (hybrid hit, +15% crit). A heavy wet
// terracotta pigeon out of a slip bucket, a heavy throw, SPLAT, then the pun. The pun does psychic damage (wavy rings,
// PUN DAMAGE); the monster leans away. He pulls out another one: I HAVE MORE. Scenes prefix t3n_.
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const T=RECRUIT_MOVES.tnb;
const TERRA='#c46a3c',TERRAD='#8f4526',WET='#e89a6a',SLIP='#ecd2b0',CREAM='#fff6dc',GOLD='#ffe08a',PURP='#c79bff',STEEL='#aeb3ba';
ST.nw('t3n_');
const S=k=>{ if(sfx[k]) sfx[k](); };
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const TSP=()=>BATTLE_SPRITES.tnb,TH=()=>TSP().idle.length*TSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-TH()*(st.sc||1)*.74+dy});
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const clampX=(txt,x,sc)=>{ const w=(txt.length*4-1)*sc; return Math.max(w/2+8,Math.min(568-w/2,x)); };
SC.t3n_big=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,x=clampX(s.txt,s.x,sc),y=Math.max(sc*5+8,s.y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); };
SC.t3n_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-22-(s.dy||0)); x=p.x; y=p.y; } const sc=s.sc||2; bigWord(s.txt,clampX(s.txt,x,sc),Math.max(8,y-ez(u/.3)*8),s.c||CREAM,sc); };

// A heavy, wet terracotta pigeon (sc 1 is about 40 x 26). wet: glossy highlights and drips.
const pigeon=(x,y,sc,ms,flap)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); const w=flap?Math.sin(ms*.03)*.6:0;
  poly([[-2,-3],[8,-3],[3,-6-w*8]],TERRAD,2); EO(0,0,12,8,TERRA); EO(-11,-5,6,6,TERRA); poly([[-16,-5],[-22,-3],[-16,-1]],'#e8c070',1.5); E(-12,-6,1.6,1.6,OUT);
  poly([[10,-1],[19,-6],[18,4]],TERRAD,2); poly([[-4,-1],[6,-1],[1,-4+w*6]],WET,2); E(-3,-4,4,2,'#ffffffaa'); E(-12,-9,2,1.2,'#ffffffaa');
  for(let k=0;k<3;k++) { const q=((ms/600)+k/3)%1; gfx.globalAlpha*=1; E(-6+k*6,8+q*10,1.4,2+q*2,'#a8613a'); } gfx.restore(); };
const bucket=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); poly([[-14,-22],[14,-22],[11,0],[-11,0]],STEEL,3); R(-14,-22,28,5,SLIP); R(-10,-14,20,2,'#8a9098'); gfx.strokeStyle=OUT; gfx.lineWidth=2.5; gfx.beginPath(); gfx.arc(0,-22,14,Math.PI,0); gfx.stroke(); gfx.restore(); };
SC.t3n_prop=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=P.st; gfx.globalAlpha=fade(u,.96);
  if(ms>P.set&&ms<P.home) bucket(P.bx,P.by,1.6);
  const h=hand();
  if(ms>P.grab&&ms<P.throw) { const lift2=ms<P.heave?ez((ms-P.grab)/300):1; pigeon(h.x-4,h.y-6-lift2*6,2.4,ms,false); if(ms>P.heave&&ms<P.throw) bigWord('HEAVY',h.x-4,h.y-52,CREAM,2); }
  if(ms>P.more&&ms<P.home) { const q=ez((ms-P.more)/250); pigeon(h.x-6,h.y-10-q*30,2.4,ms,true); } };
SC.t3n_splat=(s,u)=>{ const F=s.F,q=ez(u/.08),a=fade(u,.8); gfx.globalAlpha=a; const x=F.x+F.w*.05,y=F.mid-F.h*.1;
  for(let k=0;k<9;k++) { const ang=k/9*Math.PI*2+.3,d=(14+((k*37)%14))*q; EO(x+Math.cos(ang)*d*1.5,y+Math.sin(ang)*d,6+(k%3)*2,5+(k%2)*2,TERRA); }
  EO(x,y,20*q,15*q,TERRA); E(x-6,y-5,6*q,3*q,WET); for(let k=0;k<4;k++) { const dy=ez(cl((u-.1)*1.6))*(18+k*6); R(x-14+k*9,y+8,4,dy,TERRAD); E(x-12+k*9,y+8+dy,3,3,TERRAD); } };
SC.t3n_pun=(s,u)=>{ const P=s.plan; for(let k=0;k<4;k++) { const q=cl(u*1.6-k*.18); if(q<=0||q>=1) continue; const x=lerp(P.x0,P.x1,q),y=lerp(P.y0,P.y1,q); gfx.globalAlpha=(1-q)*.9; gfx.strokeStyle=PURP; gfx.lineWidth=4; gfx.beginPath();
  for(let j=-6;j<=6;j++) { const yy=y+j*5,xx=x+Math.sin(j*.9+u*20)*5; j===-6?gfx.moveTo(xx,yy):gfx.lineTo(xx,yy); } gfx.stroke(); } };
SC.t3n_lean=(s,u)=>{ const q=u<.2?ez(u/.2):u>.85?1-ez((u-.85)/.15):1; lift(s.f,-q*4,-q*.22,-q*26); };
// ---- Throw Down, take two (Tom's feedback 2026-10-28): he throws a bowl on the wheel, the wheel spins out of control, and the bowl
// flies off and lands on the enemy's head. "Throwing a bowl. Literally." Numbers unchanged.
const wheelHead=(ang,speed)=>{ // wheel head ellipse at (0,-54): grooves, plus spin marks that smear when fast
  EO(0,-54,19,5.6,'#9aa3ad'); ring(0,-54,13,3.9,1,'#6e7882'); ring(0,-54,7,2.1,1,'#6e7882');
  for(let k=0;k<3;k++) { const a=ang+k*2.094,mx=Math.cos(a)*16,my=-54+Math.sin(a)*4.6;
    if(speed>16) { gfx.globalAlpha*=.5; ring(0,-54,16,4.6,2,'rgba(255,255,255,.6)'); gfx.globalAlpha/=.5; } else E(mx,my,1.6,1,'#ffffff'); } };
const clayOn=(prog,wob,ms)=>{ { const id=prog<.3?'tnb/clay_lump':prog<.55?'tnb/clay_cylinder':'tnb/clay_bowl';   // painted clay stages (Oct 31)
    const hh=prog<.3?lerp(9,17,prog/.3):prog<.55?lerp(18,26,(prog-.3)/.25):lerp(26,20,cl((prog-.55)/.45));
    if(PROPART.ready(id)) { PROPART.draw(id,wob,-54-hh/2,{h:hh}); return; } }
  // lump -> centered cylinder -> opened bowl, standing on the wheel head (surface at y=-54)
  const open=ez(cl((prog-.3)/.3)),flare=ez(cl((prog-.55)/.45)),w=lerp(8,15,flare),h=lerp(lerp(8,22,ez(cl(prog/.5))),17,flare);
  gfx.save(); gfx.translate(wob,-54);
  poly([[-w*.72,0],[w*.72,0],[w,-h],[-w,-h]],'#d9784a',2);
  R(-w*.6,-h*.9,1.8,h*.8,'rgba(255,255,255,.4)'); R(w*.45,-h*.9,w*.25,h*.9,'rgba(120,60,30,.25)');
  for(let k=1;k<4;k++) Ln(-w*.9,-h*k/4,w*.9,-h*k/4,.8,'rgba(150,70,35,.5)');                         // throwing rings
  E(0,-h,w,Math.max(.6,w*.3*open),'#e89a6a'); if(prog>.32) { E(0,-h,w-2,Math.max(.4,(w-2)*.3*open),'#8a4526'); E(0,-h+.5,w-4,Math.max(.3,(w-4)*.22*open),'#a85a34'); }
  gfx.restore(); };
const bowlProp=(x,y,sc,flip=false)=>{ if(PROPART.draw('tnb/clay_bowl',x,y-1*sc,{w:32*sc,rot:flip?Math.PI:0})) return; gfx.save(); gfx.translate(x,y); gfx.scale(sc,flip?-sc:sc);  // a finished clay bowl, side view
  gfx.fillStyle=OUT; gfx.beginPath(); gfx.moveTo(-14,-9); gfx.quadraticCurveTo(-14,8,0,8); gfx.quadraticCurveTo(14,8,14,-9); gfx.closePath(); gfx.fill();
  gfx.fillStyle='#d9784a'; gfx.beginPath(); gfx.moveTo(-12,-8); gfx.quadraticCurveTo(-12,6,0,6); gfx.quadraticCurveTo(12,6,12,-8); gfx.closePath(); gfx.fill();
  R(-11,-5,22,2.5,'#fff6dc'); R(-9,-2,18,1.2,'#5fae9a'); R(-10,-8,2,9,'rgba(255,255,255,.35)'); R(6,-8,5,12,'rgba(120,60,30,.28)');
  E(0,-8,12.6,3.4,OUT); E(0,-8,11.6,2.8,'#e8b48a'); E(0,-7.8,9.2,1.8,'#8a4526'); R(-5,5.4,10,2.4,'#b8603a'); R(-5,5.4,10,.9,'#e8946a'); gfx.restore(); };
SC.t3n_wheel=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.drop) return;
  const dt=Math.min(.05,s.t-(s.lt==null?s.t:s.lt)); s.lt=s.t;
  const sp=ms<P.tap?4:ms<P.fast?lerp(4,14,ez((ms-P.tap)/(P.fast-P.tap))):ms<P.launch?lerp(14,38,ez((ms-P.fast)/(P.launch-P.fast))):lerp(38,0,ez((ms-P.launch)/1800));
  s.ang=(s.ang||0)+sp*dt;
  const dq=ez((ms-P.drop)/350),by=P.y-(1-dq)*130+(ms>P.drop+350&&ms<P.drop+500?-Math.sin((ms-P.drop-350)/150*Math.PI)*6:0);
  const shake=ms>P.fast&&ms<P.launch+400?Math.sin(ms/22)*lerp(.5,2.2,cl((ms-P.fast)/(P.launch-P.fast))):0;
  gfx.globalAlpha=fade(u,.94); gfx.save(); gfx.translate(P.x+shake,by); gfx.scale(1.5,1.5);
  E(0,3,40,7,'rgba(0,0,0,.28)');
  const wPaint=PROPART.draw('tombo/pottery_wheel',0,-34,{w:70,h:74});   // painted wheel; the drawn electric wheel below is the fallback
  if(wPaint) { if(sp>16) { gfx.globalAlpha*=.5; ring(0,-54,16,4.6,2,'rgba(255,255,255,.6)'); gfx.globalAlpha=fade(u,.94); } } else {
  // electric wheel: housing, dial, pedal on a cable
  RO(-28,-32,56,30,'#59636e'); R(-28,-32,56,4,'#7c8794'); R(-28,-6,56,3,'#3f4852'); for(const bx of [-24,24]) { E(bx,-26,1.2,1.2,'#cfd5dc'); E(bx,-8,1.2,1.2,'#cfd5dc'); }
  label('POT-5',-18,-20,'#d8dce2',1);
  const lvl=ms<P.tap?0:ms<P.fast?1:ms<P.launch?2:3,da=-2.2+lvl*.95; EO(14,-18,6,6,'#cfd5dc'); Ln(14,-18,14+Math.cos(da)*5,-18+Math.sin(da)*5,1.6,OUT);
  const press=ms>P.tap?(ms>P.fast?1:.55):0; gfx.strokeStyle=OUT; gfx.lineWidth=2.4; gfx.beginPath(); gfx.moveTo(28,-14); gfx.quadraticCurveTo(46,-14,50,-4+press*0); gfx.stroke();
  gfx.save(); gfx.translate(54,0); gfx.rotate(press*.16); poly([[-4,-6],[20,-1],[20,4],[-4,4]],'#aeb3ba',2); for(let k=0;k<4;k++) Ln(0+k*5,-3+k*.9,0+k*5,3,1,'#7d8892'); gfx.restore();
  // splash pan and the wheel head on its shaft
  R(-3,-50,6,20,'#59636e'); EO(0,-46,35,9.5,'#aeb3ba'); E(0,-47,30,7.4,'#7d8892'); E(0,-46,27,6,'#b58a64'); E(-8,-48,10,1.6,'rgba(255,255,255,.35)');
  wheelHead(s.ang,sp);
  }
  if(ms>P.clay&&ms<P.launch) { const prog=cl((ms-P.clay)/(P.shape-P.clay)),wob=ms>P.fast?Math.sin(ms/30)*lerp(.4,4,cl((ms-P.fast)/(P.launch-P.fast))):Math.sin(ms/200)*.3; clayOn(prog,wob,ms);
    if(ms>P.tap&&ms<P.launch) { const n=ms>P.fast?14:6; for(let k=0;k<n;k++) { const q=((ms/(ms>P.fast?260:520))+k/n)%1,a=k/n*Math.PI*2+ms/90,r=14+q*(ms>P.fast?64:30); gfx.globalAlpha=fade(u,.94)*(1-q)*.9;
        E(Math.cos(a)*r,-66+Math.sin(a)*r*.45-q*8,1.6,1.3,k%2?'#8fd0ff':'#b99a78'); } gfx.globalAlpha=fade(u,.94); } }
  if(ms>P.launch&&ms<P.launch+900) { gfx.globalAlpha=fade(u,.94)*(1-(ms-P.launch)/900); E(0,-54,12,3.2,'#8a4526'); }   // wet ring left behind
  gfx.restore();
  if(ms>P.fast&&ms<P.launch) { gfx.globalAlpha=fade(u,.94); label('FASTER',P.x-20,by-118,CREAM,2); } gfx.globalAlpha=1; };
SC.t3n_hat=(s,u)=>{ const f=u>.7?ez((u-.7)/.3):0,rot=Math.sin(s.t*17)*.3*(1-f*.6); gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(s.x,s.y+f*34); gfx.rotate(rot); bowlProp(0,0,1.9,true); gfx.restore();
  if(u<.75) for(let k=0;k<3;k++) { const q=(s.t*3+k/3)%1; gfx.globalAlpha=(1-q)*.8; E(s.x-14+k*14,s.y-16-q*12,2,1.6,'#8fd0ff'); } gfx.globalAlpha=1; };
T.throw_down=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=homeOf(m),wx=Math.round(Math.min(me.x-60,F.x+F.w*.5+120)),wy=Math.min(316,F.base+4);
  const set=900,pedal=2000,fast=2400,launch=2800,hit=3350,pun=3700,psy=4400,more=5250,home=5850,end=6650;
  const wheelX=wx-52,P={x:wheelX,y:wy+2,drop:200,clay:1000,shape:2000,tap:pedal,fast,launch};
  const hx=wheelX,hy=wy+2-54*1.5-14,tx=F.x+F.w*.05,ty=F.top+6;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:set,x:wx,y:wy,f:'kneel'},{t:1000,f:'kneel',dy:(u,tt)=>Math.sin(tt*16)*1.2},{t:pedal,f:'aim',dx:-2},{t:fast,f:'wind',dx:u=>ez(u)*10},{t:launch,f:'spread',dx:-4},{t:launch+500,f:'spread',hop:5},{t:hit+300,f:'idle'},{t:pun,f:'aim'},{t:psy,f:'hip'},{t:more,f:'celeb'},{t:home-150,f:'idle'},{t:home,f:'walkR'},{t:home+800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB sets up his pottery wheel. A lump of clay, a calm bowl.'); say(m.id,'throw_down'); scene('t3n_wheel',(home+100)/1000,{P}); S('whoosh'); }],
    [P.drop+350,()=>{ S('thud'); scene('tn_poof',.5,{x:wheelX,y:wy+2,c:'#c9a070'}); }],
    [1000,()=>{ S('splat'); setMessage('He centers the clay. Pulls the walls up. It is a lovely bowl.'); }],
    [1700,()=>{ S('select'); }],
    [pedal,()=>{ S('charge'); scene('t3n_big',.7,{x:wheelX,y:wy-130,txt:'JUST A TAP',c:CREAM,sc:2}); setMessage('He taps the pedal. Just a little.'); }],
    [fast,()=>{ S('charge'); scene('t3n_big',.7,{x:wheelX,y:wy-130,txt:'TOO FAST',c:GOLD,sc:3}); setMessage('The wheel is going a bit faster than the pedal said.'); }],
    [2600,()=>{ S('charge'); setMessage('Water is flying everywhere. The bowl is holding on.'); }],
    [launch,()=>{ S('whoosh'); S('boing'); setMessage('The bowl lets go.'); const dx=tx-hx,dy=ty-hy,n=Math.hypot(dx,dy)||1;
      ST.fly((x,y,uu)=>{ for(const [k,al] of [[3,.15],[2,.25],[1,.4]]) { gfx.globalAlpha=al; bowlProp(-dx/n*k*14,-dy/n*k*14,1.6); } gfx.globalAlpha=1; gfx.save(); gfx.rotate(uu*Math.PI*14); bowlProp(0,0,1.6); gfx.restore(); },hx,hy,tx,ty,(hit-launch)/1000,70);
      scene('t3n_big',.7,{x:wheelX,y:wy-130,txt:'WHOOPS',c:'#ffb04a',sc:3}); }],
    ['hf',hit],
    [hit,()=>{ S('bonk'); S('thud'); ST.jolt(f,.6); landHit(100); scene('t3n_hat',1.7,{x:tx,y:ty+4}); scene('t3n_big',1.1,{x:F.x,y:F.top-74,txt:'CLONK!',c:'#f0a070',sc:4}); setMessage(f.name+' is now wearing a bowl.'); }],
    [pun,()=>{ scene('t3n_text',1.5,{st,txt:'I WAS THROWING A BOWL.',c:CREAM,sc:2,dy:16}); setMessage('He waits. He makes eye contact.'); }],
    [pun+500,()=>{ scene('t3n_text',1.0,{st,txt:'LITERALLY.',c:GOLD,sc:3,dy:-2}); S('select'); }],
    [psy,()=>{ const p=head(st,10); scene('t3n_pun',.9,{plan:{x0:p.x-20,y0:p.y,x1:F.x+F.w*.3,y1:F.mid}}); S('stun'); scene('t3n_lean',(end-psy-200)/1000,{f}); }],
    [psy+300,()=>{ ST.jolt(f,.2); scene('t3n_big',.9,{x:F.x,y:F.top-64,txt:'PUN DAMAGE',c:PURP,sc:3}); scene('t3n_text',1,{x:F.x+F.w*.4,y:F.top-14,txt:'UGH',c:CREAM,sc:2}); setMessage(f.name+' leans away. Slowly.'); }],
    [more,()=>{ S('boing'); scene('t3n_text',1.2,{st,txt:'WAIT! I HAVE MORE!',c:CREAM,sc:2,dy:14}); }],
    [end,'end',res(E2)+'The pun did more damage than the bowl.']]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Mug Toss: a much bigger mug that spins with a blur, and a big CLUNK. Continuity Pins: a bigger needle with a thread
// trail and bigger safety pins. Cone Six, Please: a big glowing cone that takes a bow. Curb Appeal: wheel streaks behind
// the board, a big dust spray and a big SHRED. Fix the Wobble: a big platform that wobbles hard, then settles, with a
// spirit level that reads LEVEL. Same numbers, same beats. Overrides SC.tv2_sew, SC.tv2_pins, SC.tn_cone,
// SC.tn_platform, SC.tv2_dust, T.mug_toss, T.cone_six, T.curb_appeal and T.fix_wobble. Scenes prefix tp2_.
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
const poly=(pts,c,o=3)=>{ gfx.beginPath(); pts.forEach(([x,y],k)=>k?gfx.lineTo(x,y):gfx.moveTo(x,y)); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.lineWidth=o; gfx.strokeStyle=OUT; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const steam=(x,y,t,n=3,c='#fff6dc',h=30)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.3)%1; gfx.globalAlpha=a0*(1-q)*.85; E(x-(n-1)*7+k*14+Math.sin(q*6+k)*5,y-q*h,6+q*7,6+q*7,c); } gfx.globalAlpha=a0; };
const bigWord=(txt,x,y,c,sc)=>{ const w=(txt.length*4-1)*sc; x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(8,y); const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const T=RECRUIT_MOVES.tnb;
const CLAY='#c98a5c',CREAM='#fff6dc',GOLD='#ffe08a',SLIP='#ecd2b0';
ST.nw('tp2_');
const S=k=>{ if(sfx[k]) sfx[k](); };
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+(t.side==='foe'?34:30)),y:Math.min(316,u.base+3)}; };
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
SC.tp2_burst=(s,u)=>{ const q=ez(u/.4); gfx.globalAlpha=fade(u,.5); for(let k=0;k<10;k++) { const a=k/10*Math.PI*2+(s.seed||0),r0=10+q*14,r1=22+q*(s.r||40)*(k%2?.7:1); LnO(s.x+Math.cos(a)*r0,s.y+Math.sin(a)*r0,s.x+Math.cos(a)*r1,s.y+Math.sin(a)*r1,k%2?3:5,k%2?CREAM:(s.c||GOLD)); }
  star(s.x,s.y,(s.r||40)*.5*Math.sin(cl(u*2)*Math.PI),s.c||GOLD,u*2); };

// ---------- Mug Toss: a much bigger mug, a spin blur and a big CLUNK ----------
const MS=2.0;
const mug=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  if(PROPART.draw('tnb/test_mug',0,-1,{h:26})) { gfx.restore(); return; }   // painted stoneware mug
  ring(9,-1,5,6,5.4,OUT); ring(9,-1,5,6,2.6,'#e8d2b0'); ring(9.6,-1.6,4.4,5,.8,'#fff6e6');                                  // handle, with a highlight
  poly([[-8,-10],[9,-11.5],[7.5,10],[-7,10]],'#e8d2b0',2.2);                                                                   // slightly crooked body
  R(3.5,-9,4,18,'rgba(140,96,52,.22)'); R(-6,-6,1.8,11,'rgba(255,255,255,.6)');                                                // shade side, highlight
  for(const [dx,dy] of [[-4,2],[0,5],[-1,-1],[3,3],[-5,6],[2,-3],[5,6],[-3,-4]]) E(dx,dy,.55,.5,'#9a7448');                    // clay speckles
  gfx.fillStyle='#5fae9a'; gfx.beginPath(); gfx.moveTo(-8,-10); gfx.lineTo(9,-11.5); gfx.lineTo(8.8,-4.4);                      // teal glaze with drips
  gfx.quadraticCurveTo(7,-2,5.4,-4.6); gfx.quadraticCurveTo(3.6,-6.2,2,-3.6); gfx.quadraticCurveTo(.6,-1,-1,-4.8); gfx.quadraticCurveTo(-2.8,-7,-4.6,-4.4); gfx.quadraticCurveTo(-5.8,-2.4,-7.6,-4.6); gfx.closePath(); gfx.fill();
  Ln(-7.6,-4.6,8.8,-4.4,.6,'#3f8a7a'); R(-6,-9,6,1,'rgba(255,255,255,.45)');
  R(-5,.5,8,5,'#fff6dc'); R(-4,1.8,6,1,'#e0402e'); R(-4,3.6,4,.8,'#a8825a');                                                    // the sticker
  E(.5,-10.8,8.7,2.3,'#f4e6cc'); E(.5,-10.6,7,1.6,'#6b4a30'); E(.5,-10.2,5.6,1,'#8a6240');                                     // rim and inside
  R(-6,9.4,12.8,2.2,'#b8946a'); R(-6,9.4,12.8,.8,'#d8b48a'); gfx.restore(); };
const spinMug=(x,y,u,turns,sc)=>{ const ang=u*Math.PI*2*turns,a0=gfx.globalAlpha; for(const [d,al] of [[.9,.15],[.55,.3]]) { gfx.globalAlpha=a0*al; mug(x,y,ang-d*Math.sign(turns),sc); } gfx.globalAlpha=a0;
  gfx.strokeStyle='rgba(255,255,255,.75)'; gfx.lineWidth=2.4; gfx.beginPath(); gfx.arc(x,y,16*sc,ang-1.2*Math.sign(turns),ang,turns<0); gfx.stroke(); mug(x,y,ang,sc); };
const mugPainted=()=>{ const sp=BATTLE_SPRITES.tnb; return !!(sp&&sp.hires&&sp.mugPull); };   // painted Mug Toss poses hold their own mug
SC.tp2_mugheld=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms>P.throw) return; const h=hand(); gfx.globalAlpha=1; if(!mugPainted()) mug(h.x-24,h.y-26,Math.sin(ms/260)*.08,MS);
  if(ms>P.show) { RO(h.x-56,h.y-70,50,16,'#f2c94c'); label('2ND',h.x-31,h.y-66,OUT,2); } };
SC.tp2_mugrest=(s,u)=>{ gfx.globalAlpha=fade(u,.85); mug(s.x,s.y,0,MS); if(s.t>.25) steam(s.x-3,s.y-30,s.t,3,'#ffffff',28); if(s.t>.35) bigWord('STILL WORKS',s.x,s.y-66,CREAM,2); };
T.mug_toss=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=homeOf(m),wx=Math.max(F.x+F.w*.5+130,Math.min(me.x-40,F.x+200));
  const P={show:900,throw:1950},hit=2500;
  const pp=mugPainted();
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:800,x:wx,f:pp?'mugPull':'act'},{t:1650,f:pp?'mugWind':'wind',dx:u=>ez(u)*8},{t:1950,f:pp?'mugRel':'throw',dx:-6},{t:2400,f:'aim'},{t:3300,f:'celeb',hop:6},{t:3600,f:'walkR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  const lx=F.x+F.w*.5+34,ly=F.base-38;
  ST.play(E2,[
    [0,()=>{ setMessage('TNB pulls a slightly crooked mug out of his tote.'); say(m.id,'mug_toss'); scene('tp2_mugheld',2.0,{P}); }],
    [900,()=>{ setMessage('It\'s a second. It even has a sticker that says so.'); S('select'); }],
    [P.throw,()=>{ const h=hand(); sfx.whoosh(); ST.fly((x,y,u)=>spinMug(0,0,u,1.5,MS),h.x-(pp?4:24),h.y-(pp?6:26),F.x+6,F.top+18,.55,90); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); S('ting'); ST.jolt(f,.55); landHit(100); scene('tp2_burst',.6,{x:F.x+6,y:F.top+18,r:56}); scene('tv2_flash',.25,{a:.3}); scene('tv2_big',1.1,{x:F.x,y:F.top-74,txt:'CLUNK!',c:GOLD,sc:5}); }],
    [2550,()=>{ ST.fly((x,y,u)=>spinMug(0,0,u,-1,MS),F.x+6,F.top+18,lx,ly,.5,60); }],
    [3050,()=>{ sfx.ding(); scene('tp2_mugrest',1.5,{x:lx,y:ly}); setMessage('It lands upright. Not a chip on it.'); }],
    [4500,'end',res(E2)+'Handmade. Slightly crooked. Extremely effective.']]); };

// ---------- Continuity Pins: a bigger needle with a thread trail, bigger safety pins ----------
const needle=(x,y,ang,sc=2)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc); LnO(-18,0,18,0,3,'#dfe6ee'); ring(-13,0,3,1.6,1.5,OUT); poly([[18,-2],[26,0],[18,2]],'#dfe6ee',1.5); Ln(-14,-1,10,-1,1,'#ffffff'); gfx.restore(); };
const bigPin=(x,y,open,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  LnO(0,10,0,-12,2.4,'#dfe6ee'); ring(0,12,3.4,3.4,4,OUT); ring(0,12,3.4,3.4,2,'#dfe6ee');
  gfx.save(); gfx.translate(0,12); gfx.rotate(-open*.9); LnO(2.5,-2,2.5,-24,2,'#eef2f6'); gfx.restore();
  RO(-3.5,-16,7,6,'#c9ced6'); R(-2,-14,4,1.5,'#f4f6fa'); gfx.restore(); };
SC.tv2_sew=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9); const cx=P.x,cy=P.y,rx=P.rx+6,ry=P.ry+6,N=32;
  const q=cl((ms-P.s0)/(P.s1-P.s0)); if(q<=0) return;
  const pt=k=>{ const a=-Math.PI/2+k/N*Math.PI*2; return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]; };
  const n=Math.floor(q*N);
  // the thread: a thin trail under the stitches, then thick stitches on every other segment
  gfx.strokeStyle='rgba(255,210,122,.6)'; gfx.lineWidth=2; gfx.beginPath(); for(let k=0;k<=n;k++) { const [x,y]=pt(k); k?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke();
  for(let k=0;k<n;k++) { if(k%2) continue; const [x0,y0]=pt(k),[x1,y1]=pt(k+1); LnO(x0,y0,x1,y1,5,'#ffd27a'); }
  if(q<1) { const a=-Math.PI/2+q*Math.PI*2,nx=cx+Math.cos(a)*rx,ny=cy+Math.sin(a)*ry+Math.sin(ms/40)*7,[lx,ly]=pt(n); Ln(lx,ly,nx,ny,2,'#ffd27a'); needle(nx,ny,a+Math.PI/2+Math.sin(ms/60)*.5,2.1); bigWord('STITCH',cx,cy-ry-46,CREAM,3); }
  else if(ms<P.s1+700) bigWord('STITCHED',cx,cy-ry-46,GOLD,3); };
SC.tv2_pins=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=fade(u,.9);
  P.pins.forEach((p,k)=>{ const t0=P.drop[k]; if(ms<t0) return; const d=ez((ms-t0)/250),y=lerp(p.y-170,p.y,d),snap=ms>t0+450?1:0,px=p.x+(k?10:-10); bigPin(px,y,snap?0:1,3.8);
    if(snap&&ms<t0+650) { const r=(ms-t0-450)/200; gfx.globalAlpha=1-r; ring(px,y-20,10+r*30,10+r*30,4,GOLD); gfx.globalAlpha=fade(u,.9); }
    if(snap&&ms<t0+1100) bigWord('SNAP',px+(k?44:-44),p.y-84,GOLD,3); }); };

// ---------- Cone Six, Please: a big glowing cone that takes a bow ----------
const CN=2.3;
SC.tn_cone=(s,u)=>{ const bend=cl((u-s.bendAt)/.25),bow=s.bowAt&&u>s.bowAt?Math.sin(cl((u-s.bowAt)/.25)*Math.PI):0,pl=.5+.5*Math.sin(s.t*7); gfx.globalAlpha=fin(u,.06)*fade(u,.93); const a0=gfx.globalAlpha;
  const tip=-54*CN,ang=-bend*.6-bow*.35;
  // glow behind the cone, brighter as it bends (it is at temperature)
  gfx.globalAlpha=a0*(.25+bend*.3+pl*.12); E(s.x,s.y-30*CN,26*CN,34*CN,'#ffb04a'); gfx.globalAlpha=a0*(.3+bend*.3); E(s.x,s.y-26*CN,14*CN,24*CN,'#ffe08a'); gfx.globalAlpha=a0;
  RO(s.x-22*CN,s.y-6*CN,44*CN,6*CN,SLIP); R(s.x-20*CN,s.y-6*CN,40*CN,2,'#fff6e6');
  gfx.save(); gfx.translate(s.x,s.y-6*CN); gfx.rotate(ang); poly([[-10*CN,0],[10*CN,0],[2*CN,tip],[-2*CN,tip]],'#f0d080',3); R(-6*CN,-14*CN,3*CN,10*CN,'rgba(255,255,255,.45)'); label('6',0,-24*CN,'#b8603a',3);
  if(bow>.1) { E(-4*CN,-36*CN,2*CN,1.2*CN,OUT); E(4*CN,-36*CN,2*CN,1.2*CN,OUT); }
  gfx.restore();
  for(let k=0;k<5;k++) { const a=s.t*2.4+k*1.26,r=34*CN; gfx.globalAlpha=a0*(.5+.5*Math.sin(s.t*6+k)); star(s.x+Math.cos(a)*r*.7,s.y-30*CN+Math.sin(a)*r*.5,4+pl*2,k%2?GOLD:CREAM,s.t*3+k); }
  gfx.globalAlpha=a0; if(bend>.5) bigWord('CONE 6',s.x-80,s.y-44*CN,GOLD,3); if(bow>.3) bigWord('BOW',s.x-80,s.y-30*CN,CREAM,2); };

T.cone_six=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',conX=foe?Math.min(540,H.x+H.w*.5+34):Math.max(60,H.x-H.w*.5-40);
  const back=c=>(sp.self?c.origX:sp.x)+22;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:sp.self?'idle':'run'},{t:700,x:sp.x,y:sp.y,f:'kneel'},{t:1250,f:'walk'},{t:1500,x:back,f:'spread'},{t:2350,f:'idle'},{t:2450,f:'idle',rot:u=>-Math.sin(u*Math.PI)*.25},{t:2900,f:sp.self?'idle':'runR'},{t:3550,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB sets down a tiny kiln cone. Cone six. Precisely.'); say(m.id,'cone_six'); }],
    [750,()=>{ scene('tn_cone',2.9,{x:conX,y:H.base+2,bendAt:(1700-750)/2900,bowAt:(2450-750)/2900}); S('select'); }],
    [1500,()=>{ scene('tn_glaze',1.6,{x:H.x,y:H.base,w:H.w*.85,h:H.h}); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.heal(); scene('tn_flakes',1,{x:H.x,y:H.base,h:H.h}); scene('tn_glow',.9,{x:H.x,y:H.mid,c:'#ffb070'}); if(foe) ST.jolt(t,.15); else if(t!==m) battle.fx[t.idx].hop=.3; }],
    [2500,()=>{ setMessage('The cone takes a tiny bow. So does TNB.'); }],
    [3650,'end',kindLine(t,'The warmth has been professionally considered.')]]); };

// ---------- Curb Appeal: wheel streaks, a big dust spray, a big SHRED ----------
SC.tv2_dust=(s,u)=>{ const st=s.st,ms=s.t*1000; s.trail=s.trail||[];
  if(st&&st.x!=null&&ms<s.until) { const l=s.trail[s.trail.length-1]; if(!l||Math.hypot(st.x-l.x,st.y-l.y)>5) s.trail.push({x:st.x,y:st.y+6,t:s.t}); }
  // wheel streaks: two bright lines along the recent path
  for(let k=1;k<s.trail.length;k++) { const p=s.trail[k-1],q=s.trail[k],a=s.t-q.t; if(a>.4) continue; const al=1-a/.4; gfx.globalAlpha=al*.9;
    LnO(p.x,p.y-2,q.x,q.y-2,3,'#ffd27a'); Ln(p.x,p.y+5,q.x,q.y+5,2,'#fff6dc'); }
  // dust spray: big puffs kicked up behind the board, with grit
  for(const p of s.trail) { const a=s.t-p.t; if(a>.8) continue; const q=a/.8; gfx.globalAlpha=(1-q)*.7; E(p.x+16+q*22,p.y-q*28,8+q*18,6+q*12,'#d8c8a8'); gfx.globalAlpha=(1-q); R(p.x+20+q*40,p.y-6-q*40,3,3,'#a8946e'); R(p.x+10+q*30,p.y-q*22,2,2,'#8a7a5a'); } };
T.curb_appeal=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),cy=Math.min(308,G.base+10),x0=G.x0-30,x1=G.x1+70,hit=1350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle',rot:-.08},{t:300,x:x1+60,y:cy-6,f:'idle',rot:-.14,ease:'in'},{t:650,x:x1+30,f:'idle'},
    {t:700,x:x0-20,y:cy-6,f:'idle',ease:'lin',dy:u=>Math.sin(u*Math.PI*5)*12,rot:u=>Math.cos(u*Math.PI*5)*.18},{t:1550,f:'flip',rot:u=>u*Math.PI*2,hop:34},{t:1850,x:x0-20,f:'celeb'},
    {t:2150,f:'idle',rot:u=>Math.sin(u*Math.PI*3)*.1,dy:u=>Math.sin(u*Math.PI*3)*6},{t:3050,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB drops his board, kicks twice, and carves the curb line. Fast.'); say(m.id,'curb_appeal'); scene('tn_board',3.1,{st}); scene('tn_curb',2.9,{st,y:cy,x0,x1,peelAt:700/2900,flatAt:1650/2900}); scene('tv2_dust',3.1,{st,until:2000}); S('run'); noise({dur:1.6,vol:.1,f0:1800,f1:900,type:'bandpass',q:.7}); }],
    [700,()=>{ sfx.whoosh(); }],[1000,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ sfx.thud(); all(list); landHit(100); for(const f of list) { const q=ST.foe(f); scene('tp2_burst',.55,{x:q.x,y:q.base-10,r:44,c:'#d8c8a8',seed:q.x}); } scene('tv2_big',1.1,{x:G.x,y:Math.max(40,G.top-74),txt:'SHRED!',c:GOLD,sc:5}); }],
    [1550,()=>{ S('spin'); }],[1850,()=>{ sfx.select(); }],
    [3300,'end',res(E2)+'The line was beautiful and inconvenient.']]); };

// ---------- Fix the Wobble: a big platform that wobbles, then settles; the level reads LEVEL ----------
SC.tn_platform=(s,u)=>{ const w=Math.max(112,s.w*1.4),fixed=u>s.fixAt,dt=(u-s.fixAt)*2.9;
  const amp=u<s.wedgeAt?.16:u<s.fixAt?lerp(.16,.06,(u-s.wedgeAt)/(s.fixAt-s.wedgeAt)):.06*Math.exp(-dt*6),a=amp*Math.sin(s.t*(fixed?14:8));
  gfx.globalAlpha=fin(u,.08)*fade(u,.9); const a0=gfx.globalAlpha;
  gfx.save(); gfx.translate(s.x,s.y+8); gfx.rotate(a);
  RO(-w*.5,-6,w,20,'#c9b48a'); R(-w*.5,-6,w,4,'#e0d0a8'); for(let k=1;k<4;k++) R(-w*.5+k*w/4,-2,2,16,'#a8946e');
  RO(-w*.5+4,14,16,12,'#8a7a5a'); RO(w*.5-20,14,16,fixed?12:4,'#8a7a5a');
  // spirit level on top: the bubble slides with the tilt and goes green when it is level
  const lx=w*.5-46,ly=-18,lev=Math.abs(a)<.012&&fixed; RO(lx-24,ly-6,48,12,'#f0c75a'); R(lx-16,ly-3,32,6,lev?'#9be39a':'#cfe8a8'); Ln(lx-4,ly-4,lx-4,ly+4,1.5,OUT); Ln(lx+4,ly-4,lx+4,ly+4,1.5,OUT); E(lx+cl(a*120,-12,12),ly,4,2.5,'#ffffff');
  gfx.restore();
  const wq=cl((u-s.wedgeAt)/(s.fixAt-s.wedgeAt)); if(u>s.wedgeAt) { const wx=lerp(s.x+w*.5+70,s.x+w*.5-11,ez(wq)); poly([[wx-20,s.y+32],[wx+20,s.y+32],[wx+20,s.y+16]],CLAY); }
  gfx.globalAlpha=a0; if(!fixed&&u>.15) bigWord('WOBBLE',s.x,s.y+30,CREAM,3);
  if(fixed&&u<s.fixAt+.13) bigWord('CLICK',s.x+w*.5,s.y-44,GOLD,4); else if(fixed) bigWord('LEVEL',s.x,s.y+30,'#9be39a',3); };
T.fix_wobble=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',self=t===m,tf=!foe&&!self?battle.fx[t.idx]:null;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:self?'idle':'run'},{t:800,x:sp.x,y:sp.y,f:'kneel'},{t:1900,f:'kneel'},{t:2050,f:'celeb',hop:6},{t:2450,f:'hip'},{t:2750,f:self?'idle':'runR'},{t:3400,x:'home',y:'home',f:'idle'}]);
  if(tf) tf.path={t:0,dur:2.2,fn:(q,c)=>({rot:c.t<1.9?Math.sin(c.t*8)*.12*(c.t<1.3?1:lerp(1,.4,(c.t-1.3)/.6)):Math.sin(c.t*14)*.05*Math.exp(-(c.t-1.9)*6)})};
  ST.play(E2,[
    [0,()=>{ setMessage('Something is wobbling. TNB can tell from across the room.'); say(m.id,'fix_wobble'); scene('tn_platform',2.9,{x:H.x,y:H.base,w:Math.max(56,H.w*.8),wedgeAt:1300/2900,fixAt:1900/2900}); }],
    [900,()=>{ scene('tv2_text',1,{x:H.x,y:Math.max(30,H.top-30),txt:'SHORT CORNER',c:CREAM,sc:2}); }],
    [1300,()=>{ S('select'); }],
    ['hf',1900],
    [1900,()=>{ sfx.ding(); E2.apply(); sfx.heal(); scene('tn_glow',.8,{x:H.x,y:H.mid,c:'#9be39a'}); if(foe) ST.jolt(t,.15); }],
    [2100,()=>{ if(tf) tf.hop=.35; }],
    [2500,()=>{ scene('tv2_text',.9,{x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3-150,txt:'SPARE',c:CREAM,sc:2}); }],
    [3500,'end',kindLine(t,'The repair is smaller than the relief.')]]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// TNB's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// TNB for real (a film-set wardrobe runner, not the director; the LA hill he longboards; his pottery; chill). That's a Wrap!
// (A6): last setup on a soundstage (pipe grid, hanging lights, a painted flat behind the monsters); the walkie crackles AND
// THAT'S A WRAP; he pushes a train of wardrobe racks through the family and a fresh costume flies onto each of them; STRIKE
// THE SET! The flat creaks, tips forward and lands face down on every monster (their feet stick out), two lights drop on it,
// the end credits roll, and he sits down in his WARDROBE chair with a coffee in one of his own mugs. Baxter Street Bomb (B6):
// the battlefield turns into Baxter Street at sunset (32% grade, palms, stepped houses); he appears at the top, pops his
// tail, tucks and bombs it, lobs three seconds mugs on the way down (KSSH), hits the bottom and Bert-slides through every
// monster in a sunset dust cloud (they spin), winks a heart at Tom (Tom's turn comes up) and rolls home. Scenes prefix t5_.
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
const heart=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y+r*.9); gfx.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.7,y-r*1.4,x,y-r*.45); gfx.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.6,y-r*.2,x,y+r*.9); gfx.closePath();
  gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const steam=(x,y,t,n=3,c='#ffffff',h=28)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.33)%1; gfx.globalAlpha=a0*(1-q)*.8; E(x-(n-1)*6+k*12+Math.sin(q*6+k)*4,y-q*h,4+q*6,4+q*6,c); } gfx.globalAlpha=a0; };
const T=RECRUIT_MOVES.tnb;
const CREAM='#fff6dc',GOLD='#ffe08a',RED='#e0402e',BLUE='#284fb4',CHROME='#aeb3ba',CHROME2='#d8dce2',PIPE='#2e2e34';
const PLY='#d9c49a',PLY2='#b89c6a',BATTEN='#8a6436',SKY1='#8fc4ec',SKY2='#ffd2a0',PAINTG='#6fae62',CLAY='#c98a5c',CLAY2='#e8d2b0',GLZ='#5fae9a';
ST.nw('t5_');
const S=(k,...a)=>{ if(sfx[k]) sfx[k](...a); };
if(!sfx.walkie) sfx.walkie=(d=0)=>{ noise({dur:.14,vol:.14,delay:d,f0:2600,f1:2000,type:'bandpass'}); noise({dur:.55,vol:.06,delay:d+.15,f0:1800,f1:2600,type:'bandpass'}); tone({type:'square',f0:1250,dur:.05,vol:.04,delay:d+.72}); };
if(!sfx.creak) sfx.creak=(d=0)=>{ tone({type:'sawtooth',f0:95,f1:150,dur:.45,vol:.07,delay:d,filter:700}); tone({type:'sawtooth',f0:140,f1:85,dur:.35,vol:.05,delay:d+.4,filter:600}); };
if(!sfx.crash) sfx.crash=(d=0)=>{ noise({dur:.9,vol:.42,delay:d,f0:2600,f1:140,type:'lowpass'}); tone({type:'square',f0:85,f1:32,dur:.45,vol:.16,delay:d}); };
if(!sfx.shatter) sfx.shatter=(d=0)=>{ noise({dur:.25,vol:.22,delay:d,f0:6500,f1:2800,type:'highpass'}); tone({type:'triangle',f0:2400,f1:1800,dur:.12,vol:.06,delay:d}); };
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const BSP=()=>BATTLE_SPRITES.tnb,BH=()=>BSP().idle.length*BSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-BH()*(st.sc||1)*.74+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const BAR=24;
SC.t5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); gfx.globalAlpha=1; R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.t5_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+BAR+16,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; });
SC.t5_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.t5_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.5,3,s.c||CREAM); } gfx.globalAlpha=1; };
// Monsters spinning as something passes them: list of {f,t,k}; each lifts and spins once over 650 ms.
SC.t5_spin=(s,u)=>{ const ms=s.t*1000+s.t0; for(const b of s.list) { if(ms<b.t) continue; const q=(ms-b.t)/650; if(q>=1) { if(!b.done) { b.done=1; lift(b.f,0,0,0); } continue; }
  lift(b.f,-Math.sin(q*Math.PI)*(s.h||22),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*(s.ox||6)); } };
// A shirt on a wire hanger (the costume colors from the Quick-Change Rack).
const shirt=(x,y,sc,c,c2,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.beginPath(); gfx.moveTo(-12,-14); gfx.quadraticCurveTo(0,-28,12,-14); gfx.stroke(); gfx.strokeStyle=CHROME; gfx.lineWidth=2; gfx.stroke(); E(0,-25,2.5,2.5,CHROME);
  PO([[-14,-14],[14,-14],[22,-5],[15,-1],[13,18],[-13,18],[-15,-1],[-22,-5]],c,2); R(-2,-12,4,28,c2); R(-14,-14,28,3,'rgba(255,255,255,.35)'); gfx.restore(); };
// A speckled stoneware mug (one of his seconds).
const mug=(x,y,ang,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(ang); gfx.scale(sc,sc);
  if(PROPART.draw('tnb/test_mug',0,-1,{h:26})) { gfx.restore(); return; }   // painted stoneware mug
  ring(9,-1,5,6,5,OUT); ring(9,-1,5,6,2.4,CLAY2);
  PO([[-8,-10],[9,-11.5],[7.5,10],[-7,10]],CLAY2,2.2); R(-8,-10,16.5,4,GLZ); E(-4,-4,2,3,GLZ); E(3,-5,1.6,2.4,GLZ); R(-6,6,12,2,'#c9a07a'); R(-6,-6,2,10,'rgba(255,255,255,.45)'); gfx.restore(); };

// ---------- That's a Wrap! (A6) ----------
// The soundstage (back layer): the room goes dark, light cones from the hanging lights, and the painted flat behind the
// monsters (wooden frame, LA sunset painted on canvas, a stage weight at its foot). It creaks before it falls; once the
// falling flat passes edge-on, the front-layer scene takes it over.
const flatFront=(P,top,wob)=>{ const x0=P.x0,x1=P.x1,yb=P.yb,h=yb-top; if(h<=1) return; gfx.save();
  gfx.translate((x0+x1)/2,yb); gfx.rotate(wob); gfx.translate(-(x0+x1)/2,-yb);
  const w=x1-x0,sy=h/P.H;
  RO(x0,top,w,h,BATTEN);
  const g=gfx.createLinearGradient(0,top,0,yb); g.addColorStop(0,SKY1); g.addColorStop(.7,SKY2); g.addColorStop(1,'#f0b080'); gfx.fillStyle=g; gfx.fillRect(x0+5,top+5*sy,w-10,h-10*sy);
  E(x0+w*.62,top+h*.66,26,26*sy,'#ffb04a'); E(x0+w*.62,top+h*.66,18,18*sy,'#ffe08a');
  gfx.fillStyle=PAINTG; gfx.beginPath(); gfx.moveTo(x0+5,yb-5*sy); for(let k=0;k<=8;k++) gfx.lineTo(x0+5+k*(w-10)/8,top+h*(.74+.08*Math.sin(k*1.7))); gfx.lineTo(x1-5,yb-5*sy); gfx.closePath(); gfx.fill();
  for(const [px,ph] of [[.18,.62],[.84,.55]]) { const bx=x0+w*px,by=yb-5*sy,ty=top+h*(1-ph);
    gfx.strokeStyle='#7a5a3a'; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(bx,by); gfx.quadraticCurveTo(bx+6,(by+ty)/2,bx+2,ty); gfx.stroke();
    gfx.fillStyle='#3f8a4a'; for(let k=0;k<6;k++) { const a=k/6*Math.PI*2; gfx.beginPath(); gfx.ellipse(bx+2+Math.cos(a)*12,ty+Math.sin(a)*4*sy,14,4*sy,a,0,Math.PI*2); gfx.fill(); } }
  R(x0+5,top+5*sy,w-10,3*sy,'rgba(255,255,255,.25)');
  if(sy>.6) { RO(x0+8,yb-24*sy,44,14*sy,'#fff6dc'); label('SC 20',x0+30,yb-21*sy,'#2b2a26',1); }
  gfx.restore(); };
SC.t5_studio=(s,u)=>{ const P=s.plan,ms=s.t*1000,k=ez(ms/300)*(u>.93?(1-u)/.07:1);
  gfx.globalAlpha=.6*k; R(0,0,576,324,'#1c1a24'); gfx.globalAlpha=1;
  // light cones while the lights still hang
  for(const L of P.lamps) { if(ms>L.drop) continue; const sw=ms>P.creak?Math.sin(ms/70)*.12:0,ang=L.ang+sw;
    gfx.globalAlpha=.16*k; gfx.fillStyle='#fff2c0'; gfx.beginPath(); gfx.moveTo(L.x,L.y+16); gfx.lineTo(L.x+Math.tan(ang-.32)*230,L.y+246); gfx.lineTo(L.x+Math.tan(ang+.32)*230,L.y+246); gfx.closePath(); gfx.fill(); }
  gfx.globalAlpha=k;
  if(ms<P.split) { const wob=ms>P.creak&&ms<P.fall?Math.sin((ms-P.creak)/45)*.012:0;
    const e=ms>P.fall?Math.pow((ms-P.fall)/P.fd,2):0,top=lerp(P.yb-P.H,P.yb+P.D,e); flatFront(P,top,wob);
    if(ms<P.fall) { RO(P.x0+18,P.yb-10,18,10,'#5a5a60'); RO(P.x1-36,P.yb-10,18,10,'#5a5a60'); } }
  gfx.globalAlpha=1; };
// The falling flat (front layer) once it is past edge-on: the back of the flat (plywood, battens, stencil), lying face down
// on the monsters with their feet sticking out; it lifts away at the end.
SC.t5_fall=(s,u)=>{ const P=s.plan,ms=s.t*1000+s.t0; if(ms<P.split) return;
  const q=cl((ms-P.fall)/P.fd),e=q*q,front=lerp(P.yb-P.H,P.yb+P.D,e); if(front<=P.yb) return;
  const out=ms>P.lift?1-cl((ms-P.lift)/400):1; if(out<=0) return;
  const bounce=ms>P.slam?Math.max(0,Math.sin((ms-P.slam)/40))*Math.exp(-(ms-P.slam)/120)*6:0,fy=front-bounce;
  const cx=(P.x0+P.x1)/2,hw=(P.x1-P.x0)/2,gw=hw*lerp(1,1.16,(fy-P.yb)/P.D);
  gfx.globalAlpha=out;
  E(cx,fy+3,gw+6,6,'rgba(0,0,0,.25)');
  PO([[cx-hw,P.yb],[cx+hw,P.yb],[cx+gw,fy],[cx-gw,fy]],PLY,3);
  const L=(a,b)=>[lerp(cx-hw,cx-gw,b)+(lerp(cx+hw,cx+gw,b)-lerp(cx-hw,cx-gw,b))*a,lerp(P.yb,fy,b)];
  for(const a of [.03,.5,.97]) { const p0=L(a,0),p1=L(a,1); LnO(p0[0],p0[1],p1[0],p1[1],5,BATTEN); }
  for(const b of [.06,.5,.94]) { const p0=L(0,b),p1=L(1,b); LnO(p0[0],p0[1],p1[0],p1[1],4,BATTEN); }
  { const p0=L(.03,.06),p1=L(.5,.94); Ln(p0[0],p0[1],p1[0],p1[1],3,PLY2); }
  if(fy-P.yb>40) { const p=L(.74,.5); label('STAGE 7',p[0],p[1]-12,'#5a3a1a',2); label('THIS SIDE UP',p[0],p[1]+4,'#5a3a1a',1);
    gfx.strokeStyle='#5a3a1a'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(p[0]-20,p[1]+16); gfx.lineTo(p[0]-20,p[1]+26); gfx.moveTo(p[0]-24,p[1]+22); gfx.lineTo(p[0]-20,p[1]+26); gfx.lineTo(p[0]-16,p[1]+22); gfx.stroke(); }
  if(ms>P.slam) for(const F of P.feet) { const x=F.x,w=Math.sin(ms/90+x)*1.5; for(const d of [-9,9]) EO(x+d+w,fy+4,6,4,F.c); }
  gfx.globalAlpha=1; };
// The hanging lights (front layer): a pipe grid along the top, two fresnels on cables that swing in the creak and drop onto
// the fallen flat (CLANG), where they lie tipped over.
const fresnel=(x,y,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-14,-10,28,22,'#3a3a42'); R(-14,-10,28,4,'#55555f'); EO(0,13,11,5,'#fff2c0'); R(-16,-3,3,8,'#55555f'); R(13,-3,3,8,'#55555f'); gfx.restore(); };
SC.t5_lamps=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000,k=ez(ms/300)*(u>.94?(1-u)/.06:1); gfx.globalAlpha=k;
  RO(-4,P.pipe-3,584,6,PIPE); for(let x=30;x<576;x+=90) RO(x,P.pipe-6,8,12,'#55555f');
  for(const L of P.lamps) { const sw=ms>P.creak&&ms<L.drop?Math.sin(ms/70)*.12:0;
    if(ms<L.drop) { const bx=L.x+Math.sin(sw)*40,by=L.y; Ln(L.x,P.pipe,bx,by-10,2,'#111'); fresnel(bx,by,L.ang+sw); continue; }
    const q=(ms-L.drop)/260; if(q<1) { fresnel(L.x,lerp(L.y,L.land,q*q),L.ang+q*2.4); continue; }
    const b=ms<L.drop+520?Math.abs(Math.sin((ms-L.drop-260)/45))*Math.exp(-(ms-L.drop-260)/90)*14:0; if(ms>P.lift+400) continue;
    gfx.globalAlpha=k*(ms>P.lift?1-cl((ms-P.lift)/400):1); fresnel(L.x,L.land-b,L.ang+2.4+(L.k?-.3:.3)); gfx.globalAlpha=k; }
  gfx.globalAlpha=1; });
// Dust puffs all round the fallen flat when it lands.
SC.t5_dust=(s,u)=>{ const P=s.plan; for(let j=0;j<22;j++) { const a=j/22,side=j%4,q=ez(u);
    let x,y; if(side<2) { x=lerp(P.x0-20,P.x1+30,a); y=P.yb+P.D+4; } else { x=side===2?P.x0-24:P.x1+34; y=lerp(P.yb,P.yb+P.D,a); }
    const dx=(side===2?-1:side===3?1:(a-.5)*.8)*q*40,dy=-q*(18+(j%3)*10); gfx.globalAlpha=(1-u)*.75; E(x+dx,y+dy,8+q*14,6+q*10,j%2?'#d8c8a8':'#bfae90'); }
  gfx.globalAlpha=1; };
// The walkie in his hand, and the radio bubble: ...AND THAT'S A WRAP!
SC.t5_walkie=(s,u)=>{ const ms=s.t*1000+s.t0,h=hand(); gfx.globalAlpha=fade(u,.92);
  gfx.save(); gfx.translate(h.x,h.y); gfx.rotate(-.2); RO(-6,-16,12,24,'#26262c'); R(-4,-12,8,6,'#5a6a5a'); for(let k=0;k<3;k++) R(-4,-3+k*3,8,1.5,'#55555f'); RO(2,-30,3,14,'#26262c'); E(-3,-18,1.6,1.6,ms>s.talk&&ms<s.talk+700&&Math.sin(ms/60)>0?'#ff5a4a':'#5a2a2a'); gfx.restore();
  if(ms>s.talk&&ms<s.talk+1100) { const q=(ms-s.talk)/1100,a=fin(q,.08)*fade(q,.82),bx=Math.min(470,Math.max(120,h.x-120)),by=Math.max(BAR+34,h.y-90);
    gfx.globalAlpha=a; const pts=[]; for(let k=0;k<16;k++) { const ang=k/16*Math.PI*2,r=k%2?1:1.14; pts.push([bx+Math.cos(ang)*108*r,by+Math.sin(ang)*26*r]); } PO(pts,'#ffffff',3);
    PO([[bx+50,by+20],[h.x-6,h.y-20],[bx+76,by+14]],'#ffffff',0); gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(bx+50,by+21); gfx.lineTo(h.x-6,h.y-20); gfx.lineTo(bx+76,by+15); gfx.stroke();
    label('...AND THAT\'S A WRAP!',bx,by-5,'#2b2a26',2);
    for(let k=0;k<3;k++) { const r=8+k*7+((ms/10)%7); gfx.strokeStyle='rgba(43,42,38,.6)'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(h.x+2,h.y-30,r,-1.2,-.2); gfx.stroke(); } }
  gfx.globalAlpha=1; };
// The wardrobe racks (front layer): chrome rails, shirts on hangers, a WARDROBE card. Positions come from s.xOf(i,ms).
const rackAt=(x,y,t,cols)=>{ gfx.save(); gfx.translate(x,y);
  RO(-58,-124,4,122,CHROME); RO(54,-124,4,122,CHROME); RO(-60,-126,120,5,CHROME2); RO(-62,-4,124,5,'#8a9098');
  for(const wx of [-56,56]) { EO(wx,5,5,5,'#5e6670'); E(wx,5,2,2,'#2b2a26'); }
  cols.forEach((c,k)=>shirt(-40+k*20,-92+Math.sin(t*7+k)*2,.75,c[0],c[1],Math.sin(t*9+k)*.08));
  RO(-36,-152,72,20,CREAM); label('WARDROBE',0,-147,BLUE,2); gfx.restore(); };
const RACK_COLS=[['#ffb070','#5a3a2a'],['#c9b3e6','#ffd166'],['#ff9ac0','#fff1cb'],['#284fb4','#ffd166'],['#9be39a','#2b2a26']];
SC.t5_racks=inBox((s,u)=>{ const ms=s.t*1000+s.t0; for(let i=0;i<3;i++) { const x=s.xOf(i,ms); if(x==null||x<-80||x>660) continue; rackAt(x,s.y,s.t+i,RACK_COLS.slice(i,i+4)); } });
// A costume flies off the rack onto each friend, with a sparkle ring when it lands.
SC.t5_dress=(s,u)=>{ const ms=s.t*1000+s.t0; for(const d of s.list) { const q=(ms-d.t)/320; if(q<0) continue;
    if(q<1) { const e=ez(q); shirt(lerp(d.x0,d.x,e),lerp(d.y0,d.y,e)-Math.sin(q*Math.PI)*40,lerp(.75,1.15,e),d.c,d.c2,q*6); continue; }
    const r=(ms-d.t-320)/500; if(r<1) { gfx.globalAlpha=1-r; ring(d.x,d.y,10+r*40,6+r*22,3,GOLD); star(d.x+20,d.y-20-r*14,8*(1-r),GOLD,r*3); star(d.x-22,d.y-8-r*10,6*(1-r),CREAM,-r*3); gfx.globalAlpha=1; } } };
// The end credits rolling up on the left, over the fallen set.
SC.t5_credits=(s,u)=>{ const a=fin(u,.08)*fade(u,.88),x0=12,x1=Math.min(360,s.x1),y0=BAR,y1=s.y1,cx=(x0+x1)/2; gfx.globalAlpha=a*.55; R(x0,y0,x1-x0,y1-y0,'#0a0a10');
  gfx.save(); gfx.beginPath(); gfx.rect(x0,y0+2,x1-x0,y1-y0-4); gfx.clip(); gfx.globalAlpha=a; let y=y1+6-u*(s.lines.length*20+(y1-y0)+10);
  for(const [txt,c] of s.lines) { if(txt) bigWord(txt,cx,y,c,2); y+=20; }
  gfx.restore(); gfx.globalAlpha=1; };
// His canvas chair (back layer): WARDROBE on the back, not DIRECTOR. And the coffee, in one of his own mugs.
SC.t5_chair=(s,u)=>{ const k=ez(u/.12),x=s.x,y=s.y; gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(x,y); gfx.scale(1,k);
  LnO(-20,0,48,-38,4,'#c49a62'); LnO(48,0,-20,-38,4,'#c49a62'); RO(-24,-42,78,6,'#7a5a3a');
  RO(4,-108,5,68,'#c49a62'); RO(50,-108,5,68,'#c49a62'); RO(4,-104,51,26,'#2e5a8a'); label('WARDROBE',30,-95,CREAM,1); R(6,-80,47,2,'#1e3a5a');
  gfx.restore(); gfx.globalAlpha=1; };
SC.t5_cup=(s,u)=>{ const h=hand(); gfx.globalAlpha=fin(u,.1)*fade(u,.88); mug(h.x+4,h.y-6,0,1.6); steam(h.x,h.y-26,s.t,3,'#ffffff',26); gfx.globalAlpha=1; };
T.wrap_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),party=b2LiveParty();
  const yb=Math.round(Math.max(BAR+110,Gp.top-8)),x0=Math.max(10,Math.round(Gp.x0-34)),x1=Math.min(300,Math.round(Gp.x1+56));
  const H=yb-(BAR+40),D=Math.max(40,Math.min(296,Gp.base-4)-yb);
  const P={x0,x1,yb,H,D,pipe:BAR+14,creak:3800,fall:4150,fd:380,slam:4530,lift:6250};
  P.split=P.fall+Math.round(P.fd*Math.sqrt(H/(H+D)));
  P.lamps=[{x:x0+(x1-x0)*.28,y:BAR+62,ang:.18,drop:4640,land:yb+D*.42,k:0},{x:x0+(x1-x0)*.72,y:BAR+62,ang:-.2,drop:4800,land:yb+D*.6,k:1}];
  const footC=['#6a4a2a','#4a5a3a','#5a3a4a'];
  P.feet=list.map((f,k)=>({x:ST.foe(f).x,c:footC[k%3]}));
  // the rack train: rack 0 rolls in, TNB pushes it from T1 to T2, then the train rolls on and off by itself
  const cx=Math.round(Math.min(524,me.x)),cy=Math.round(Math.min(me.base,294)),T1=2000,T2=3000,sx=Math.min(560,me.x+40),ex=Math.max(x1+70,Math.min(me.x-150,360)),v=(sx-ex)/(T2-T1),gap=[0,140,250];
  const xOf=(i,ms)=>{ const lead=sx-72; let x;
    if(ms<T1) { if(ms<1600) return null; x=lerp(660,lead,ez((ms-1600)/400)); }
    else if(ms<T2) x=lead-v*(ms-T1);
    else { const d=ms-T2; x=lead-v*(T2-T1)-(v*d+.002*d*d); }
    return x+gap[i]; };
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:500,x:me.x-30,y:288,f:'act'},{t:1300,f:'celeb',hop:10,hn:2},{t:1700,f:'walkR'},
    {t:T1,x:sx,y:292,f:'run',ease:'lin'},{t:T2,x:ex,y:292,f:'hip'},{t:3150,x:ex,y:270,f:'hip'},{t:3400,f:'spread'},{t:3800,f:'aim',dx:(u,tt)=>Math.sin(tt*40)*1.2},
    {t:4150,f:'hip'},{t:4580,f:'celeb',hop:8},{t:4800,f:'walkR'},{t:5350,x:cx,y:cy,f:'sit'},{t:6350,f:'walkR'},{t:6750,x:'home',y:'home',f:'idle'}]);
  // who gets which costume: b2Rack hands them out in party order, starting at the rack's current place
  const base=B2.rack||0,dress=party.map((p,k)=>{ const C=B2_RACK[(base+k)%B2_RACK.length],U=ST.unit(p); let t;
    if(p===m) t=T2+80; else { const lead=sx-72,need=lead-U.x; t=need<0?1650:T1+need/v; }
    return {t:Math.round(t),x:p===m?ex:U.x,y:p===m?222:U.mid,x0:p===m?ex-70:U.x,y0:p===m?190:178,c:C.c,c2:C.c2}; });
  const names=party.filter(p=>p!==m).map(p=>[String(p.name||p.id).toUpperCase(),CREAM]);
  const lines=[['THAT\'S A WRAP',GOLD],['WARDROBE: TNB',CREAM],['STARRING',CHROME2],...names,['MONSTERS: THEMSELVES',CREAM],['NO MONSTERS WERE HARMED',CREAM],['MUCH',CREAM]];
  ST.play(E2,[
    [0,()=>{ scene('t5_bars',6.95,{}); scene('t5_studio',6.75,{plan:P,back:true}); scene('t5_fall',2.6,{plan:P,t0:P.fall,delay:P.fall/1000}); scene('t5_lamps',6.75,{plan:P});
      scene('t5_walkie',1.55,{t0:150,talk:800,delay:.15}); say(m.id,'wrap_ult'); setMessage('Last setup of the day on Stage 7. TNB has his walkie on.'); }],
    [800,()=>{ S('walkie'); setMessage('The walkie crackles. "And that\'s a wrap!"'); }],
    [1300,()=>{ S('cheer'); scene('t5_big',1.1,{x:288,y:BAR+44,txt:'THAT\'S A WRAP!',c:GOLD,sc:4}); }],
    [1600,()=>{ scene('t5_racks',3.0,{t0:1600,y:300,xOf}); scene('t5_dress',2.0,{t0:1600,list:dress}); S('rumble',0,1.6); setMessage('Wardrobe first. TNB pushes the racks through the family. Arms up, everybody.'); }],
    ...dress.map(d=>[d.t,()=>{ S('whoosh'); }]),
    [T2+300,()=>{ E2.apply(); S('ting'); setMessage('Everybody is in fresh wardrobe. Nobody tell continuity.'); }],
    [3420,()=>{ scene('t5_big',1.0,{x:(x0+x1)/2+30,y:BAR+44,txt:'STRIKE THE SET!',c:CREAM,sc:3}); S('select'); setMessage('"Strike the set!" The crew starts unbolting everything.'); }],
    [P.creak,()=>{ S('creak'); scene('t5_big',.5,{x:(x0+x1)/2,y:P.yb-P.H*.4,txt:'CREAK',c:CHROME2,sc:2}); }],
    [P.fall,()=>{ S('whoosh'); setMessage('The flat tips forward. TIMBER.'); }],
    ['hf',P.slam],
    [P.slam,()=>{ S('crash'); S('thud'); for(const f of list) ST.jolt(f,.7); landHit(100); scene('t5_flash',.3,{a:.5,c:'#fff2c0'}); scene('t5_dust',1.0,{plan:P});
      scene('t5_big',.85,{x:288,y:BAR+58,txt:'CRASH!',c:GOLD,sc:5}); setMessage('Face down on every monster. Their little feet stick out.'); }],
    [P.lamps[0].drop+260,()=>{ S('clang'); S('bonk'); }],
    [P.lamps[1].drop+260,()=>{ S('clang'); S('bonk'); }],
    [5250,()=>{ scene('t5_credits',1.75,{lines,x1:Math.max(x1+40,220),y1:yb-4}); setMessage('Roll credits.'); }],
    [5050,()=>{ scene('t5_chair',1.55,{x:cx,y:cy,back:true}); }],
    [5550,()=>{ scene('t5_cup',.85,{}); S('ding'); setMessage('TNB sits down in his wardrobe chair with a coffee. In one of his own mugs, obviously.'); }],
    [6900,'end',()=>res(E2)+'Wrap gift tomorrow. It\'s a mug. It\'s always a mug.']]); };

// ---------- Baxter Street Bomb (B6) ----------
// Baxter Street at sunset (back layer): sky, the hills, a steep street from the top right down to the flat where the monsters
// stand, sidewalk, houses stepped down the hill, palms, the BAXTER ST and 32% signs.
SC.t5_hill=(s,u)=>{ const P=s.plan,ms=s.t*1000,k=ez(ms/400)*(u>.92?(1-u)/.08:1),grow=ez(ms/600); if(k<=0) return; gfx.globalAlpha=k;
  const PH=PROPART.ready('tnb/hill_backdrop'); if(PH) PROPART.draw('tnb/hill_backdrop',288,162,{w:576,h:324}); else {
  const g=gfx.createLinearGradient(0,0,0,220); g.addColorStop(0,'#5a3a7a'); g.addColorStop(.55,'#e8786a'); g.addColorStop(1,'#ffc87a'); gfx.fillStyle=g; gfx.fillRect(0,0,576,324);
  E(150,208,46,46,'#ffe08a'); E(150,208,36,36,'#fff2b0');
  gfx.fillStyle='#7a4a72'; gfx.beginPath(); gfx.moveTo(0,214); for(let x=0;x<=576;x+=24) gfx.lineTo(x,196+Math.sin(x/70)*12+Math.sin(x/23)*4); gfx.lineTo(576,324); gfx.lineTo(0,324); gfx.fill(); }
  const A=P.A,B=P.B,ay=lerp(B.y,A.y,grow),top=x=>x>=A.x?ay:(x>=B.x?lerp(B.y,ay,(x-B.x)/(A.x-B.x)):B.y);
  // the hillside under the street, and the flat pavement at the bottom
  gfx.fillStyle='#9a7a6a'; gfx.beginPath(); gfx.moveTo(576,ay-22); gfx.lineTo(A.x,ay-22); gfx.lineTo(B.x,B.y-22); gfx.lineTo(0,B.y-58); gfx.lineTo(0,324); gfx.lineTo(576,324); gfx.fill();
  gfx.fillStyle='#8e8892'; gfx.beginPath(); gfx.moveTo(0,P.flatTop); gfx.lineTo(B.x,P.flatTop); gfx.lineTo(B.x+30,324); gfx.lineTo(0,324); gfx.fill();
  // houses stepped down the hill
  for(let j=0;j<5;j++) { const hx=A.x+40-j*(A.x-B.x)/4.2,hy=top(Math.max(B.x,hx))-22; if(hx<B.x-10) continue;
    RO(hx-22,hy-34,40,34,['#f0d0a0','#c8e0e0','#f4b8a0','#e0d0f0','#f8e8b0'][j]); PO([[hx-26,hy-34],[hx-2,hy-52],[hx+22,hy-34]],'#b85a3a',2); R(hx-12,hy-24,9,9,'#ffd27a'); R(hx+4,hy-24,9,9,'#ffd27a'); }
  // sidewalk and street
  gfx.fillStyle='#cdbfb4'; gfx.beginPath(); gfx.moveTo(576,ay-22); gfx.lineTo(A.x,ay-22); gfx.lineTo(B.x,B.y-22); gfx.lineTo(0,B.y-22); gfx.lineTo(0,B.y-14); gfx.lineTo(B.x,B.y-14); gfx.lineTo(A.x,ay-14); gfx.lineTo(576,ay-14); gfx.fill();
  gfx.fillStyle='#4a4650'; gfx.beginPath(); gfx.moveTo(576,ay-14); gfx.lineTo(A.x,ay-14); gfx.lineTo(B.x,B.y-14); gfx.lineTo(0,B.y-14); gfx.lineTo(0,B.y+26); gfx.lineTo(B.x,B.y+26); gfx.lineTo(A.x,ay+26); gfx.lineTo(576,ay+26); gfx.fill();
  gfx.setLineDash([12,10]); gfx.strokeStyle='#ffd166'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(576,ay+6); gfx.lineTo(A.x,ay+6); gfx.lineTo(B.x,B.y+6); gfx.lineTo(0,B.y+6); gfx.stroke(); gfx.setLineDash([]);
  // palms along the hill
  for(let j=0;j<4;j++) { const px=B.x+20+j*(A.x-B.x)/3.3,py=top(px)-22,ph=110+(j%2)*26;
    gfx.strokeStyle='#5a3a2a'; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(px,py); gfx.quadraticCurveTo(px+8,py-ph/2,px+3,py-ph); gfx.stroke();
    gfx.fillStyle='#2f5a3a'; for(let f=0;f<7;f++) { const a=f/7*Math.PI*2+Math.sin(s.t*2+j)*.05; gfx.beginPath(); gfx.ellipse(px+3+Math.cos(a)*14,py-ph+Math.sin(a)*5,17,4,a,0,Math.PI*2); gfx.fill(); } }
  // the signs at the top
  if(grow>.8) { const sx=A.x-34,sy=ay-22; if(PROPART.draw('tnb/street_signs',sx,sy-54,{h:108})) { label('32%',sx+32,sy-12,OUT,1); label('32%',sx+32,sy-13,'#ffd166',1); } else {   // painted BAXTER ST + steep-hill signs
    RO(sx-2,sy-92,4,92,'#8a9098'); RO(sx-40,sy-96,80,18,'#2f7a4a'); label('BAXTER ST',sx,sy-91,'#ffffff',2);
    gfx.save(); gfx.translate(sx,sy-58); gfx.rotate(Math.PI/4); RO(-15,-15,30,30,'#ffd166'); gfx.restore(); label('32%',sx,sy-61,'#2b2a26',1); } }
  gfx.globalAlpha=1; };
// The board under his feet: tilted down the hill while he bombs it, sideways in the slide. Speed lines and wheel sparks.
const board=(x,y,tilt,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(sc,sc); for(const wx of [-24,22]) { E(wx,8,6,6,OUT); E(wx,8,4,4,RED); E(wx,8,1.5,1.5,GOLD); }
  R(-38,-1,76,9,OUT); R(-36,1,72,5,'#c48a4a'); R(-36,1,72,2,'#2b2a26'); gfx.restore(); };
SC.t5_board=(s,u)=>{ const P=s.P,st=s.st,ms=s.t*1000+s.t0; if(!st||st.x==null||ms<P.show) return;
  const sc=st.sc||1; let tilt=0;
  if(ms>=P.drop&&ms<P.bottom) tilt=P.ang; else if(ms>=P.bottom&&ms<P.stop) tilt=-.12+Math.sin(ms/40)*.05;
  if(ms>=P.pop&&ms<P.pop+250) tilt=-.5*Math.sin((ms-P.pop)/250*Math.PI);
  if(!s.noBoard) board(st.x,st.y+2,tilt,sc);          // the painted frames carry their own board
  if(ms>=P.drop&&ms<P.stop) { const back=ms<P.bottom?{x:Math.cos(P.ang),y:Math.sin(P.ang)}:{x:1,y:0},H=BH()*sc;
    for(let j=0;j<7;j++) { const o=(ms/3+j*37)%90,yy=st.y-12-j*(H/8); gfx.globalAlpha=.6; Ln(st.x+back.x*(30+o),yy+back.y*(30+o),st.x+back.x*(70+o),yy+back.y*(70+o),2,'#fff6dc'); }
    const wx=st.x+(ms<P.bottom?Math.cos(P.ang)*22*sc:24),wy=st.y+(ms<P.bottom?Math.sin(P.ang)*22*sc:0)+8;
    for(let j=0;j<8;j++) { const q=((ms/120)+j/8)%1,d=8+q*36; gfx.globalAlpha=1-q; E(wx+back.x*d,wy+back.y*d-q*q*10-(j%3)*2,2.4-q*1.4,2.4-q*1.4,j%2?'#ffd166':'#ff8a3a'); } gfx.globalAlpha=1; } };
// The sunset dust cloud kicked up in the slide: pink, orange and purple puffs left behind him.
SC.t5_dust2=(s,u)=>{ const st=s.st,ms=s.t*1000+s.t0; s.puffs=s.puffs||[];
  if(st&&st.x!=null&&ms<s.stop&&ms>s.start) s.puffs.push({x:st.x+16,y:st.y,t:ms,c:['#ff8ab0','#ffb04a','#b88ae0','#ffd166'][s.puffs.length%4]});
  for(const p of s.puffs) { const q=(ms-p.t)/900; if(q>1) continue; gfx.globalAlpha=(1-q)*.7; E(p.x+q*20,p.y-6-q*30,8+q*22,6+q*14,p.c); } gfx.globalAlpha=1; };
// The heart he winks over to Tom.
SC.t5_heart=(s,u)=>{ const e=ez(u),x=lerp(s.x0,s.x1,e),y=lerp(s.y0,s.y1,e)-Math.sin(u*Math.PI)*60,r=lerp(8,13,Math.sin(u*Math.PI)); heart(x,y,r,'#ff6a8a'); };
SC.t5_shards=(s,u)=>{ for(let j=0;j<9;j++) { const a=j/9*Math.PI*2+.3,d=ez(u)*36; gfx.globalAlpha=1-u; gfx.save(); gfx.translate(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d+u*u*30); gfx.rotate(a+u*6);
    PO([[-4,-3],[5,-2],[1,4]],j%3?CLAY2:GLZ,1.5); gfx.restore(); } gfx.globalAlpha=1; };
T.hillbomb_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),tom=b2LiveParty().find(p=>p.id==='tom'&&p!==m);
  const B={x:Math.round(Math.min(360,Math.max(Gp.x1+100,300))),y:Math.round(Math.min(286,Math.max(Gp.base-18,262)))},A={x:540,y:150};
  const C={x:Math.max((BATTLE_SPRITES.tnb&&BATTLE_SPRITES.tnb.bTuck)?66:26,Math.round(Gp.x0-18)),y:B.y},ang=Math.atan2(B.y-A.y,B.x-A.x)+Math.PI;   // board tilt: lower at the left
  const P={A,B,flatTop:Math.min(...Gp.list.map(p=>p.base))-20,show:1050,pop:1350,drop:1750,bottom:3200,stop:4200,ang};
  const slide=t=>lerp(B.x,C.x,(t-P.bottom)/(P.stop-P.bottom));   // the slide runs at a steady speed
  const tAt=x=>P.bottom+(B.x-x)/(B.x-C.x)*(P.stop-P.bottom);
  // Painted longboard frames (bTop, bOllie, bTuck, bLob, bSlide, bRide, bPushR; data/tnb-hires-battle.js) carry the board, so every riding key sits
  // BY lower (the wheels, not the feet, touch the street) and the code-drawn board is off. Old pixel TNB (no bTuck) keeps the old frames and board.
  const PNT=!!(BATTLE_SPRITES.tnb&&BATTLE_SPRITES.tnb.bTuck),BY=PNT?16:0,F=(a,b)=>PNT?a:b;
  const dAt=t=>{ const u=Math.max(0,Math.min(1,(t-P.drop)/(P.bottom-P.drop))),e=u*u; return {x:lerp(A.x-6,B.x,e),y:lerp(A.y+BY,B.y+BY,e)}; };   // where the old drop segment (ease in) puts him at t
  const d1=dAt(2150),d2=dAt(2750),scd=(a,b)=>u=>lerp(a,b,u);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walkR'},{t:500,x:640,y:292,f:'idle',hide:true},{t:P.show,x:A.x,y:A.y+BY,f:F('bTop','idle'),sc:.8},
    {t:P.pop,f:F('bOllie','aim'),sc:.8,hop:10},{t:1550,f:F('bTop','act'),sc:.8,dx:u=>-ez(u)*6},
    ...(PNT?[{t:P.drop,x:A.x-6,y:A.y+BY,f:'bTuck',sc:scd(.8,.9),rot:ang,ease:'lin'},
      {t:2150,x:d1.x,y:d1.y,f:'bLob',sc:scd(.9,.95),rot:ang,ease:'lin'},{t:2750,x:d2.x,y:d2.y,f:'bTuck',sc:scd(.95,1),rot:ang,ease:'lin'},
      {t:P.bottom,x:B.x,y:B.y+BY,f:'bSlide',rot:(u,tt)=>-.1+Math.sin(tt*30)*.03,dx:(u,tt)=>Math.sin(tt*70)*1.5,ease:'lin'},
      {t:P.stop,x:C.x,y:C.y+BY,f:'bRide'},{t:4700,f:'bRide'},{t:5250,f:'bPushR',ease:'in'},{t:6300,x:'home',y:'home',f:'idle'}]
     :[{t:P.drop,x:A.x-6,y:A.y,f:'kneel',sc:u=>lerp(.8,1,u),rot:ang,ease:'in'},
      {t:P.bottom,x:B.x,y:B.y,f:'kneel',rot:(u,tt)=>-.18+Math.sin(tt*30)*.04,dx:(u,tt)=>Math.sin(tt*70)*1.5,ease:'lin'},
      {t:P.stop,x:C.x,y:C.y,f:'hip'},{t:4700,f:'hip'},{t:5250,f:'flip',ease:'in'},{t:6300,x:'home',y:'home',f:'idle'}])]);
  const spins=list.map((f,k)=>({f,k,t:Math.round(tAt(ST.foe(f).x))}));
  const hitT=Math.round(tAt(Gp.x));
  const mugT=[2300,2450,2600],mugs=mugT.map((t,i)=>({t,f:list[i%list.length]}));
  const tomU=tom?ST.unit(tom):null;
  ST.play(E2,[
    [0,()=>{ scene('t5_bars',6.6,{}); scene('t5_hill',5.4,{plan:P,back:true}); scene('t5_board',6.3,{st,P,t0:0,noBoard:PNT}); scene('t5_dust2',2.2,{st,start:P.bottom,stop:P.stop,t0:3000,delay:3});
      say(m.id,'hillbomb_ult'); setMessage('The battlefield tips up into Baxter Street. The steepest street in Echo Park.'); }],
    [P.show,()=>{ S('click'); setMessage('TNB is at the top. Board under one foot. Very chill about it.'); }],
    [P.pop,()=>{ S('click'); S('whoosh'); scene('t5_big',.8,{x:A.x-40,y:A.y-130,txt:'32% GRADE',c:CREAM,sc:3}); }],
    [P.drop,()=>{ S('rumble',0,1.6); scene('t5_big',.8,{x:420,y:BAR+44,txt:'NO BRAKES!',c:GOLD,sc:4}); setMessage('He tucks and bombs it. No brakes. Never brakes.'); }],
    ...mugs.map((g,i)=>[g.t,()=>{ const h=hand(),F=ST.foe(g.f); S('whoosh'); ST.fly((x,y,uu)=>mug(x,y,uu*Math.PI*4,2.2),h.x,h.y-10,F.x,F.top+14,.45,50);
      if(!i) setMessage('Halfway down he lobs three seconds mugs from his tote.'); }]),
    ...mugs.map((g,i)=>[g.t+450,()=>{ const F=ST.foe(g.f); S('shatter'); ST.jolt(g.f,.4); landHit(10); scene('t5_shards',.6,{x:F.x,y:F.top+14});
      if(!i) scene('t5_big',.8,{x:F.x,y:F.top-60,txt:'KSSH!',c:CLAY2,sc:3}); }]),
    [P.bottom,()=>{ S('brakes'); S('rumble',0,1); scene('t5_spin',1.6,{list:spins,t0:P.bottom,h:24,ox:10}); setMessage('Bottom of the hill. He drops a hand and Bert-slides right through them.'); }],
    ['hf',hitT],
    [hitT,()=>{ S('thud'); for(const f of list) ST.jolt(f,.6); landHit(70); scene('t5_flash',.25,{a:.35,c:'#ffd2a0'}); scene('t5_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'STAGGER!',c:GOLD,sc:4});
      setMessage('A sunset dust cloud. Every monster is seeing stars.'); }],
    [4500,()=>{ if(tomU) { scene('t5_heart',.7,{x0:C.x+10,y0:C.y-110,x1:tomU.x,y1:tomU.top+6}); S('ting'); setMessage('TNB winks at Tom.'); } else setMessage('TNB catches his breath. Well, well, well.'); }],
    [5200,()=>{ E2.apply(); if(tomU) { scene('t5_rings',.5,{x:tomU.x,y:tomU.top+6,c:'#ff6a8a',r:30}); scene('t5_big',1.1,{x:tomU.x,y:tomU.top-58,txt:'YOUR TURN, BABE',c:'#ffb0c8',sc:2}); } }],
    [5300,()=>{ S('rumble',0,1); setMessage('He rolls back to his spot like it was nothing.'); }],
    [6550,'end',()=>res(E2)+'He\'d like to go again. Tom would like him not to.']]); };
})();

// ================= Ability revamp (2026-10-27, Tom's direction) =================
// Seven TNB moves got new names and animations on the same numbers (data/battle2-data.js rows kept, keys renamed):
// Foraged at Dawn (A1, was Quick Change: the fancy-food explanation; the debuff falls asleep), Don't Split Up (A2, was
// Continuity Pins: horror rule one, back to back with a flashlight), Scope Creep (A5, was Rush-Hour Racks: a Gantt chart
// that grows until it crushes the row), Tasting Menu (A6 ult, was That's a Wrap!: fourteen courses under cloches, then the
// check lands on every monster), Just Around the Bend (B2, was Cone Six: he climbs the switchbacks and throws down the
// snack), Round with Jojo (B3, was Curb Appeal: his sister Jojo throws one disc through the row, CHAINS), Coffee Run (was Status: Green)
// (B4, was Fix the Wobble: he clicks the friend's status dot from red to green). Every move ends under 5 s. Prefix t6_.
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
const heart=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y+r*.9); gfx.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.7,y-r*1.4,x,y-r*.45); gfx.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.6,y-r*.2,x,y+r*.9); gfx.closePath(); gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const steam=(x,y,t,n=3,c='#ffffff',h=28)=>{ const a0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*1.1+k*.33)%1; gfx.globalAlpha=a0*(1-q)*.8; E(x-(n-1)*6+k*12+Math.sin(q*6+k)*4,y-q*h,4+q*6,4+q*6,c); } gfx.globalAlpha=a0; };
const T=RECRUIT_MOVES.tnb;
const CREAM='#fff6dc',GOLD='#ffe08a',RED='#e0402e',GREEN='#5ad06a',AMBER='#ffb04a',PINK='#ff9ac0',CHROME='#aeb3ba',CHROME2='#d8dce2',INK='#2a2f36',WHITE='#f7f7f2',CLAY2='#e8d2b0',GLZ='#5fae9a',LEATHER='#4a2c1e',LEATHER2='#6b4030',HAIR='#b08a5c',HAIR2='#9a7446',HOOD='#6d8f5e',TRAIL='#c9a070',GRASS='#7fb35f';
ST.nw('t6_');
const S=(k,...a)=>{ if(sfx[k]) sfx[k](...a); };
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const homeOf=m=>({x:BATTLE_POS[m.idx].x*3,y:BATTLE_POS[m.idx].base*3});
const spotFor=(m,t)=>{ if(!t||t===m) return {x:'home',y:'home',self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+(t.side==='foe'?34:30)),y:Math.min(316,u.base+3)}; };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const all=list=>{ for(const f of list) ST.jolt(f,.45); };
const nameTxt=t=>String(t&&t.name||'').toUpperCase().replace(/[^A-Z0-9 !?.'\-+&]/g,'').slice(0,12);
const topY=H=>Math.max(40,H.top-74);
// ---------- Shared scenes ----------
SC.t6_big=(s,u)=>{ let x=s.x,y=s.y; const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; };
SC.t6_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.t6_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.45; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); gfx.globalAlpha=1; };
SC.t6_sparkle=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+u*3,d=(s.r||40)*(.5+.5*ez(u)); const x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d*.8,r=4*(1-u)+1; gfx.globalAlpha=1-u; PO([[x,y-r*2],[x+r*.6,y-r*.6],[x+r*2,y],[x+r*.6,y+r*.6],[x,y+r*2],[x-r*.6,y+r*.6],[x-r*2,y],[x-r*.6,y-r*.6]],k%2?GOLD:CREAM,0); } gfx.globalAlpha=1; };
SC.t6_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.5,3,s.c||CREAM); } gfx.globalAlpha=1; };
SC.t6_dark=(s,u)=>{ const k=fin(u,.08)*fade(u,.9); gfx.globalAlpha=(s.a||.6)*k; R(0,0,576,324,'#0a0c18'); gfx.globalAlpha=1; };
SC.t6_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=k/(s.n||10)*Math.PI*2,d=ez(u)*(s.r||40); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.3-u*10,8*(1-u)+3,6*(1-u)+2,s.c||'#d8c8a8'); } gfx.globalAlpha=1; };
// Monsters lifted and spun as something passes: list of {f,t,k}.
SC.t6_spin=(s,u)=>{ const ms=s.t*1000+s.t0; for(const b of s.list) { if(ms<b.t) continue; const q=(ms-b.t)/600; if(q>=1) { if(!b.done) { b.done=1; lift(b.f,0,0,0); } continue; }
  lift(b.f,-Math.sin(q*Math.PI)*(s.h||20),q*Math.PI*2*(b.k%2?-1:1),-Math.sin(q*Math.PI)*(s.ox||6)); } };
// A laptop in his hands (open) that follows the actor's hand.
const laptop=(x,y,open=1)=>{ if(open>.6&&PROPART.draw('tnb/laptop',x,y-17,{h:36})) return; gfx.save(); gfx.translate(x,y); RO(-18,-2,36,5,CHROME); R(-14,0,28,2,INK); const h=4+22*open; RO(-16,-2-h,30,h,CHROME); if(open>.3) { R(-13,-h+1,24,h-6,'#3d6fb5'); R(-11,-h+3,20,2,WHITE); R(-11,-h+7,14,2,'#9bd2ff'); R(-11,-h+11,18,2,'#9bd2ff'); } gfx.restore(); };
SC.t6_laptop=(s,u)=>{ const ms=s.t*1000; if(s.until&&ms>s.until) return; const h=hand(); gfx.globalAlpha=1; laptop(h.x-4,h.y-6,s.closeAt&&ms>s.closeAt?1-ez((ms-s.closeAt)/250):1); };

// ---------- Foraged at Dawn (A1; key foraged_at_dawn; Quick Change's numbers) ----------
// He carries a huge plate to the friend, sets it down: one pea. Then the description. Every word pops bigger and the
// speech bubble grows until it covers half the stage. The debuff yawns, falls asleep and floats away; a napkin lands.
// Fancy plate: gold charger, white porcelain with a gold ring, then a plated dish drawn in plate space.
// dish: 'pea' | 'scallop' | 'beet' | 'choc'. (true means 'pea'.)
const leaf=(x,y,a,l,c='#4fae4a')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); E(l/2,0,l/2,l*.24,c); gfx.restore(); };
const bloom=(x,y,r,c)=>{ for(let k=0;k<5;k++) { const a=k/5*Math.PI*2; E(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,r*.75,r*.62,c); } E(x,y,r*.5,r*.45,'#ffe08a'); };
const swoosh=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.quadraticCurveTo((x0+x1)/2,y0+(y1-y0)/2-5,x1,y1); gfx.stroke(); };
const dots=(list,r,c)=>{ for(const [x,y] of list) E(x,y,r,r*.85,c); };
const DISH={
  pea:()=>{ swoosh(-22,2,16,1,2.6,'#a6d98c'); dots([[-14,4],[-9,5],[20,3],[23,2]],1.1,'#cfe8b8');
    leaf(-9,-1,-.9,8); leaf(-8,-1,-2.3,7); leaf(9,0,-.5,7); bloom(13,-3,2.2,'#ff9ac0'); bloom(-13,-3,1.6,'#f7f7f2');
    E(1.2,-1,5.4,2.4,'rgba(30,60,30,.35)'); EO(0,-4,4.8,4.6,'#5cb44c'); E(1.6,-2.4,2.8,1.6,'#3d8a38'); E(-1.8,-6,1.8,1.2,'#e4ffd4'); dots([[-4,-9],[3,-10],[7,-7]],.7,'#ffd24a'); },
  scallop:()=>{ swoosh(-22,3,20,1,3,'#f2a33a'); dots([[-16,5],[-9,6],[8,6],[16,5]],1.2,'#2a2f36');
    for(const x of [-12,0,12]) { E(x,-1,6.4,2.8,'rgba(60,40,20,.3)'); EO(x,-3,5.8,3.8,'#f3e3c0'); E(x,-5.2,4.6,1.7,'#c98a3c'); E(x-1.5,-5.6,1.4,.7,'#ffe2a0'); }
    leaf(-6,-7,-1.2,6); leaf(7,-7,-1.9,6); bloom(-19,-2,1.6,'#c070e0'); bloom(20,-2,1.6,'#c070e0'); dots([[-12,-8],[12,-8]],.9,'#ffd24a'); },
  beet:()=>{ swoosh(-22,2,18,3,3,'#f4efe4'); dots([[-16,4],[-11,5],[14,5],[19,4]],1.4,'#fffaf0');
    leaf(-12,-2,-2.6,8); leaf(12,-2,-.4,8); EO(0,-4,10,5.6,'#8a1c4a'); E(0,-5.6,7.8,4,'#b52a66'); E(0,-7,5.4,2.8,'#d04880'); E(0,-8,2.8,1.5,'#8a1c4a'); E(-3,-6.5,2,1,'#ee8ab4');
    dots([[-4,-10],[4,-9],[9,-5]],.8,'#ffd24a'); bloom(16,-4,1.8,'#ffe08a'); },
  choc:()=>{ swoosh(-22,3,18,2,2.6,'#c0204a'); dots([[-17,5],[-12,6],[12,6],[18,4]],1.5,'#c0204a');
    E(0,1,11,3,'rgba(40,20,10,.3)'); EO(0,-5,10,7.6,'#3a1c14'); E(-4,-8,3.2,2,'#8a5a48'); PO([[2,-11],[7,-9],[4,-5]],'#ffd24a',1); PO([[-1,-4],[3,-5],[0,-1]],'#ffd24a',0);
    EO(15,-3,3.4,3.2,'#e0305a'); E(14,-4,1,.8,'#ff9ab0'); leaf(-15,-3,-2.8,7); leaf(-14,-3,-2,6); bloom(-19,0,1.4,'#f7f7f2'); }
};
const peaPlate=(x,y,sc)=>{ if(!PROPART.ready('tnb/pea_plate')) return false; const w=74*sc,k=w/160; E(x+2*sc,y+4*sc,32*sc,9*sc,'rgba(0,0,0,.25)'); return PROPART.draw('tnb/pea_plate',x,y-17*k,{w}); };   // painted plate with the one pea (tools/sprite-bake/build_pea_plate.py); plate centre sits at (x,y)
const courseId={scallop:'tnb/course_scallops',beet:'tnb/course_beet',choc:'tnb/course_choc'};
const plate=(x,y,sc,dish='pea')=>{ if((dish===true||dish==='pea')&&peaPlate(x,y,sc)) return;
  if(courseId[dish]&&PROPART.ready(courseId[dish])) { E(x+2*sc,y+5*sc,34*sc,9*sc,'rgba(0,0,0,.25)'); if(PROPART.draw(courseId[dish],x,y-2*sc,{w:76*sc})) return; } gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  E(2,3,35,12,'rgba(0,0,0,.25)'); EO(0,0,34,12,'#c9a13e'); E(0,0,31,10.6,'#f2d27a'); E(0,-.5,29,9.6,WHITE); ring(0,-.5,22,7.2,1.2,'#d8b14a'); ring(0,-.5,26.5,8.6,.8,'#e6c66a'); E(-16,-5.5,6,1.1,'rgba(255,255,255,.8)');
  if(dish) (DISH[dish===true?'pea':dish]||DISH.pea)(); gfx.restore(); };
SC.t6_plateheld=(s,u)=>{ const ms=s.t*1000; if(ms>s.until) return; const h=hand(); gfx.globalAlpha=1; plate(h.x+4,h.y-12,1.5,'pea'); };
SC.t6_plate=(s,u)=>{ gfx.globalAlpha=fin(u,.06)*fade(u,.92); plate(s.x,s.y,1.9,'pea'); if(s.t<1.2) label('ONE PEA',s.x-14,s.y-44,CREAM,1);
  const g=Math.max(0,Math.sin(s.t*7)),gx=s.x+34,gy=s.y-12; if(g>.1) { const r=2+g*5; PO([[gx,gy-r*1.8],[gx+r*.5,gy-r*.5],[gx+r*1.8,gy],[gx+r*.5,gy+r*.5],[gx,gy+r*1.8],[gx-r*.5,gy+r*.5],[gx-r*1.8,gy],[gx-r*.5,gy-r*.5]],'#ffffff',0); }
  gfx.globalAlpha=1; };
const napkin=(x,y,sc,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); PO([[-12,-6],[12,-6],[14,8],[-14,8]],WHITE,2); Ln(-8,-6,-2,8,1.5,'#d9d9d2'); gfx.restore(); };
SC.t6_bubble=(s,u)=>{ const ms=s.t*1000; const grow=cl((ms-s.t0)/(s.t1-s.t0)),w=lerp(70,300,ez(grow)),h=lerp(22,110,ez(grow)),x=Math.max(w/2+6,Math.min(570-w/2,s.x)),y=Math.max(h+14,Math.min(s.y,290));
  gfx.globalAlpha=fade(u,.9); RO(x-w/2,y-h,w,h,WHITE); PO([[x+w*.2,y],[x+w*.2+14,y+12],[x+w*.2+24,y]],WHITE,2); R(x+w*.2+1,y-2,22,3,WHITE);
  const words=s.words.filter(wd=>ms>=wd.t); const SL=[[.28,.2],[.72,.2],[.3,.5],[.72,.5],[.5,.82]];
  words.forEach((wd,k)=>{ const sc=Math.min(3,1.4+k*.4),q=cl((ms-wd.t)/180),pop=lerp(1.6,1,ez(q)),wx=x-w/2+w*SL[k][0],wy=y-h+h*SL[k][1];
    gfx.save(); gfx.translate(wx,wy); gfx.scale(pop,pop); label(wd.w,0,-sc*2.5,INK,sc); gfx.restore(); }); gfx.globalAlpha=1; };
SC.t6_zzz=(s,u)=>{ gfx.globalAlpha=fade(u,.7); for(let k=0;k<3;k++) { const q=cl(u*1.5-k*.2); if(q<=0) continue; const zx=s.x+10+k*14+Math.sin(q*6)*4,zy=s.y-q*60-k*8,sc=3-k*.5; label('Z',zx+1,zy+1,OUT,sc); label('Z',zx,zy,CHROME2,sc); } gfx.globalAlpha=1; };
T.foraged_at_dawn=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',self=t===m;
  const px=self?H.x-54:Math.max(40,Math.min(540,H.x-(foe?-60:52))),py=Math.min(312,H.base+2),hit=3400;
  const words=[{t:900,w:'FORAGED'},{t:1500,w:'AT DAWN'},{t:2100,w:'A WHISPER'},{t:2600,w:'OF ASH'},{t:3100,w:'INTENTION'}];
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'carry'},{t:650,x:sp.x,y:sp.y,f:'carry'},{t:800,f:'kneel'},{t:1100,f:'spread'},{t:2100,f:'point',dx:(u,tt)=>Math.sin(tt*9)*3},{t:3100,f:'act'},{t:3500,f:'hip'},{t:3900,f:'kneel'},{t:4100,f:self?'idle':'walkR'},{t:4700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB arrives at '+t.name+'\'s table with a very large plate.'); say(m.id,'foraged_at_dawn'); scene('t6_plateheld',.85,{until:800}); }],
    [800,()=>{ S('ting'); scene('t6_plate',3.3,{x:px,y:py}); scene('t6_bubble',3.1,{x:Math.max(160,px-110),y:Math.max(130,py-70),t0:0,t1:2200,words:words.map(w=>({t:w.t-900,w:w.w})),delay:.1}); setMessage('One pea. He lowers his voice.'); }],
    ...words.map(w=>[w.t,()=>{ S('select'); }]),
    [2600,()=>{ setMessage('The description is longer than the pea.'); }],
    [3100,()=>{ scene('t6_zzz',1.0,{x:H.x,y:H.mid}); setMessage(t.name+'\'s '+(foe?'grudge':'trouble')+' has fallen asleep.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); scene('t6_glow',.9,{x:H.x,y:H.mid,c:'#d6ffd0',rx:H.w*.6,ry:H.h*.6}); scene('t6_sparkle',.9,{x:H.x,y:H.mid,r:H.h*.45}); ST.fly(()=>napkin(0,0,1.2,.2),H.x,H.top-60,H.x,H.mid+8,.5,0); if(!foe&&!self) battle.fx[t.idx].hop=.3; if(foe) ST.jolt(t,.12); }],
    [3900,()=>{ S('whoosh'); setMessage('He bows and takes the plate back. Untouched. That\'s correct.'); }],
    [4700,'end',kindLine(t,'The chef\'s intention was that you feel better.')]]); };

// ---------- Don't Split Up (A2; key dont_split_up; Continuity Pins' numbers) ----------
// Lights drop. TNB sprints to the friend, flashlight under his chin: rule one. They stand back to back inside a glowing
// ring (the guard). A twig snaps offstage; both jump. If the friend is Tom, a quick heart before the lights come up.
SC.t6_torch=(s,u)=>{ const ms=s.t*1000; if(ms>s.until) return; const h=hand(); gfx.globalAlpha=1; if(!PROPART.draw('tnb/flashlight',h.x,h.y+2,{w:24,rot:Math.PI/2})) RO(h.x-4,h.y-6,8,16,INK);   // painted flashlight, lens up
  gfx.globalAlpha=.35; PO([[h.x,h.y-6],[h.x-26,h.y-70],[h.x+26,h.y-70]],'#fff2b0',0); gfx.globalAlpha=1; E(h.x,h.y-6,5,3,'#fff2b0'); };
SC.t6_guardring=(s,u)=>{ const k=fin(u,.15)*fade(u,.85); gfx.globalAlpha=k*.9; ring(s.x,s.y,s.rx+Math.sin(s.t*8)*2,s.ry,4,'#9be39a'); gfx.globalAlpha=k*.25; E(s.x,s.y,s.rx,s.ry,'#9be39a'); gfx.globalAlpha=1; };
T.dont_split_up=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),tom=B2.party.find(p=>p.id==='tom'&&b2Alive(p)),foe=t.side==='foe',self=t===m,hit=2300;
  const cx=self?H.x:(H.x+(typeof sp.x==='number'?sp.x:H.x))/2;
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:450,x:sp.x,y:sp.y,f:'point'},{t:800,f:'aim'},{t:1600,f:'flip'},{t:2300,f:'spread'},{t:2800,f:'spread',hop:14},{t:3100,f:'flip'},{t:3700,f:self?'idle':'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('t6_dark',3.75,{a:.62}); say(m.id,'dont_split_up'); S('whoosh'); setMessage('Lights out. TNB grabs '+t.name+' by the arm.'); }],
    [800,()=>{ scene('t6_torch',.9,{until:800}); scene('t6_big',.9,{x:cx,y:topY(H),txt:'RULE ONE',c:CREAM,sc:3}); S('click'); setMessage('Flashlight under the chin. Rule one.'); }],
    [1600,()=>{ scene('t6_big',.8,{x:cx,y:topY(H),txt:'BACK TO BACK',c:CREAM,sc:3}); setMessage('They stand back to back. Nobody goes to check on the noise.'); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); scene('t6_guardring',1.6,{x:cx,y:H.base-6,rx:H.w*.5+44,ry:16}); scene('t6_glow',.9,{x:H.x,y:H.mid,c:'#9be39a',rx:H.w*.6,ry:H.h*.6}); if(foe) ST.jolt(t,.15); }],
    [2800,()=>{ S('crunch'); scene('t6_big',.9,{x:60,y:60,txt:'SNAP',c:AMBER,sc:3,rot:-.1}); if(!foe&&!self) battle.fx[t.idx].hop=.5; setMessage('A twig. Offstage. Both of them jump.'); }],
    [3200,()=>{ if(tom&&!foe&&t===tom) { scene('t6_rings',.5,{x:H.x,y:H.top+6,c:'#ff6a8a',r:26}); ST.fly(()=>heart(0,0,7,PINK),H.x,H.top,H.x,H.top-26,.7,0); S('kiss'); } }],
    [3700,()=>{ S('ding'); setMessage('Lights up. Nobody split up. Everybody lives.'); }],
    [4400,'end',kindLine(t,'Rule two: see rule one.')]]); };

// ---------- Scope Creep (A5; key scope_creep; Rush-Hour Racks' numbers) ----------
// A tidy Gantt chart drops in over the row with one bar. "Tiny change": it grows. Again: sub-bars. Again: the deadline
// slides off the edge and the whole chart crushes down on the row. The project is now 400% bigger.
SC.t6_gantt=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<400) return; const g=P.steps.filter(x=>ms>=x.t).length,prev=P.steps[g-1],q=prev?ez((ms-prev.t)/320):0;
  const W=lerp(g?P.steps[g-1].w0:140,g?P.steps[g-1].w:140,q),Hh=lerp(g?P.steps[g-1].h0:40,g?P.steps[g-1].h:40,q);
  const drop=ms<P.fall?0:ez((ms-P.fall)/(P.slam-P.fall)),y=lerp(P.y,P.yb,drop),x=P.x,sh=ms>=P.slam&&ms<P.slam+350?Math.sin(ms/20)*3:0;
  gfx.globalAlpha=fin(u,.08)*fade(u,.92); gfx.save(); gfx.translate(x+sh,y); RO(-W/2,-Hh,W,Hh,WHITE); R(-W/2,-Hh,W,10,'#3d6fb5'); label('PROJECT',-W/2+26,-Hh+2,WHITE,1);
  const rows=Math.max(1,Math.floor((Hh-18)/12)); for(let r=0;r<rows;r++) { const by=-Hh+16+r*12,bw=Math.min(W-16,lerp(60,W*1.3,r/Math.max(1,rows-1))*(r?1:1)); R(-W/2+8,by,Math.min(W-16,bw),8,r%2?'#ff9a3c':'#5ad06a'); }
  const dl=-W/2+8+Math.min(W+40,lerp(90,W*1.6,q)*(g||1)/Math.max(1,P.steps.length)); Ln(Math.min(dl,W/2+20),-Hh+12,Math.min(dl,W/2+20),0,2,RED); if(dl>W/2+8) label('DUE',W/2+14,-Hh+12,RED,1);
  gfx.restore(); gfx.globalAlpha=1; };
T.scope_creep=E2=>{ const {m,fx}=E2,list=foesOf(E2),G=ST.group(list),me=homeOf(m),hit=2950;
  const wx=Math.max(G.x1+90,Math.min(me.x-30,G.x1+170)),x=Math.max(130,Math.min(300,G.x+10)),gm=(G.top+G.base)*.5;
  const P={x,y:Math.max(60,G.top-24),yb:gm+22,fall:2650,slam:hit,steps:[{t:1000,w0:140,w:200,h0:40,h:52},{t:1600,w0:200,w:270,h0:52,h:76},{t:2200,w0:270,w:360,h0:76,h:104}]};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:500,x:wx,f:'act'},{t:1000,f:'aim',dx:-3},{t:1600,f:'act'},{t:2200,f:'wind',dx:u=>ez(u)*6},{t:2650,f:'throw'},{t:3100,f:'shrug'},{t:3900,f:'walkR'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB opens the project plan. One bar. Very tidy.'); say(m.id,'scope_creep'); scene('t6_laptop',3.1,{until:3100}); scene('t6_gantt',3.7,{P}); }],
    [1000,()=>{ S('click'); scene('t6_big',.7,{x,y:P.y-30,txt:'TINY CHANGE',c:CREAM,sc:2}); setMessage('"Tiny change." The bar grows.'); }],
    [1600,()=>{ S('click'); scene('t6_big',.7,{x,y:P.y-30,txt:'ONE MORE THING',c:AMBER,sc:2}); setMessage('"Just one more thing." Sub-bars appear.'); }],
    [2200,()=>{ S('click'); S('creak'); scene('t6_big',.7,{x,y:P.y-30,txt:'AND ONE MORE',c:RED,sc:2}); setMessage('"And one more." The deadline slides off the edge.'); }],
    [2650,()=>{ S('whoosh'); setMessage('The whole plan comes down on them.'); }],
    ['hf',hit],
    [hit,()=>{ S('crash'); S('thud'); all(list); landHit(100); scene('t6_flash',.3,{a:.4,c:'#fff2c0'}); scene('t6_dust',.9,{x,y:P.yb,r:70,n:12}); scene('t6_big',1.1,{x:G.x,y:Math.max(40,G.top-70),txt:'SCOPE CREEP!',c:GOLD,sc:4}); }],
    [3500,()=>{ scene('t6_big',1.0,{x,y:P.yb-120,txt:'400% BIGGER',c:CREAM,sc:2}); setMessage('The project is now 400% bigger. Same deadline.'); }],
    [4600,'end',res(E2)+'He will circle back on that.']]); };

// ---------- Tasting Menu (A6 ult; key tasting_ult; That's a Wrap!'s numbers) ----------
// Tablecloths unroll under the family, cloches drop and lift (fourteen courses in four seconds: heal, costume), TNB clears
// every plate in one arm, then presents the check: a leather folder the size of a door lands on every monster.
const cloche=(x,y,sc)=>{ if(PROPART.draw('tnb/cloche',x,y-19*sc,{w:62*sc})) return; gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); PO([[-26,0],[-24,-10],[-16,-20],[0,-26],[16,-20],[24,-10],[26,0]],CHROME,2); R(-20,-14,8,10,'rgba(255,255,255,.4)'); EO(0,-28,4,3,CHROME2); RO(-30,0,60,4,CHROME2); gfx.restore(); };
SC.t6_cloths=(s,u)=>{ const ms=s.t*1000; gfx.globalAlpha=fin(u,.05)*fade(u,.92);
  for(const c of s.list) { const q=ez((ms-c.t)/300); if(q<=0) continue; const w=c.w*q,x0=c.x-w/2;
    E(c.x,c.y+24,w*.55,5,'rgba(0,0,0,.3)');
    RO(x0,c.y+1,w,22,WHITE); for(let fx=x0+9;fx<x0+w-6;fx+=13) Ln(fx,c.y+3,fx+Math.sin(fx)*1.5,c.y+21,1.6,'#d6d2c4');
    R(x0,c.y+18,w,3,'#d8b14a'); for(let fx=x0+2;fx<x0+w-2;fx+=4) R(fx,c.y+21,2,3,'#d8b14a');
    RO(x0-3,c.y-13,w+6,15,'#fffaf0'); R(x0,c.y-11,w,2,'#ffffff'); R(x0-3,c.y-1,w+6,2,'#e6dcc0');
    if(q>.9) { const cx=x0+8; RO(cx-3,c.y-34,6,21,'#fff6dc'); E(cx,c.y-39+Math.sin(ms/70+c.x)*.6,2.4,4.4,'#ffb040'); E(cx,c.y-38,1.1,2.2,'#fff2b0'); R(cx-5,c.y-14,10,2,'#d8b14a');
      const vx=x0+w-12; RO(vx-3,c.y-30,6,17,'#bfe3f0'); bloom(vx,c.y-35,3,'#e0402e'); leaf(vx-2,c.y-30,-2.4,7); leaf(vx+2,c.y-30,-.7,7); } }
  gfx.globalAlpha=1; };
SC.t6_cloches=(s,u)=>{ const ms=s.t*1000; gfx.globalAlpha=fade(u,.92);
  for(const c of s.list) { if(ms<c.t) continue; let dy=0,show=true; const beats=c.beats; let k=0; for(;k<beats.length;k++) { const b=beats[k]; if(ms<b.drop) { dy=-120; break; } if(ms<b.land) { dy=lerp(-120,0,ez((ms-b.drop)/(b.land-b.drop))); break; } if(ms<b.lift) { dy=0; break; } if(ms<b.gone) { dy=lerp(0,-110,ez((ms-b.lift)/(b.gone-b.lift))); break; } }
    if(k>=beats.length) show=false; const plated=beats.some(b=>ms>=b.lift)&&ms<c.clear;
    if(plated) { plate(c.x,c.y,1.05,['scallop','beet','choc'][Math.max(0,beats.filter(b=>ms>=b.lift).length-1)]); }
    if(show&&dy>-119) cloche(c.x,c.y+dy,1.1); }
  gfx.globalAlpha=1; };
const folder=(x,y,w,h,open)=>{ if(PROPART.draw('tnb/check_folder',x,y-h/2,{w:h*.97*1.0,h:h*1.0})) return; gfx.save(); gfx.translate(x,y); RO(-w/2,-h,w,h,LEATHER); R(-w/2+6,-h+6,w-12,h-12,LEATHER2); ring(-w/2+w*.5,-h*.5,w*.18,h*.14,3,GOLD); label('THE CHECK',0,-h*.5-5,GOLD,2); gfx.restore(); };
SC.t6_check=(s,u)=>{ const ms=s.t*1000,P=s.P; if(ms<P.in) return; const q=ez((ms-P.in)/(P.slam-P.in)),y=lerp(-40,P.yb,q),sh=ms>=P.slam&&ms<P.slam+300?Math.sin(ms/18)*3:0;
  gfx.globalAlpha=fade(u,.94); folder(P.x+sh,y,P.w,P.h,0);
  if(ms>=P.slam) { for(const f of P.feet) { RO(f-6,P.yb-2,5,10,f%2?'#6a5a4a':'#4a3a3a'); RO(f+4,P.yb-2,5,10,f%2?'#6a5a4a':'#4a3a3a'); } }
  if(ms>=P.receipt) { const r=ez((ms-P.receipt)/300),rh=70*r; RO(P.x+P.w/2-50,P.yb-P.h-rh,54,rh,WHITE); if(r>.95) { label('TOTAL',P.x+P.w/2-23,P.yb-P.h-rh+6,INK,1); bigWord('$1200',P.x+P.w/2-23,P.yb-P.h-rh+20,INK,2); label('SERVICE',P.x+P.w/2-23,P.yb-P.h-rh+42,INK,1); label('NOT INCL.',P.x+P.w/2-23,P.yb-P.h-rh+54,INK,1); } }
  gfx.globalAlpha=1; };
T.tasting_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),G=ST.group(list),party=B2.party.filter(p=>b2Alive(p)),me=homeOf(m);
  const px=Math.min(500,Math.max(380,party.reduce((a,p)=>a+ST.unit(p).x,0)/party.length-10)),hit=3500;
  const beats=[{drop:500,land:750,lift:1300,gone:1500},{drop:1700,land:1850,lift:2000,gone:2150},{drop:2200,land:2320,lift:2450,gone:2600}];
  const cloths=party.map((p,k)=>{ const U=ST.unit(p); return {t:80*k,x:U.x,y:U.base-2,w:Math.max(U.w+30,84)}; });
  const cl2=party.map((p,k)=>{ const U=ST.unit(p); return {t:0,x:U.x+8,y:U.base-6,beats:beats.map(b=>({drop:b.drop+k*60,land:b.land+k*60,lift:b.lift+k*60,gone:b.gone+k*60})),clear:2650+k*60}; });
  const fx1=Math.max(G.x1+60,Math.min(G.x+40,320)),P={x:G.x+6,w:Math.max(150,G.w+90),h:Math.max(72,Math.min(130,G.base-G.top+26)),yb:G.base+2,in:3050,slam:hit,receipt:3950,feet:list.map(f=>ST.foe(f).x)};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walkR'},{t:450,x:px,y:300,f:'carry'},{t:1300,f:'spread'},{t:1700,f:'act'},{t:2200,f:'act',hop:4,hn:3},{t:2650,f:'carry'},{t:2900,x:fx1,y:300,f:'walk'},{t:3050,f:'wind'},{t:3500,f:'point'},{t:3950,f:'hip'},{t:4400,f:'walkR'},{t:4900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('t6_dark',4.9,{a:.3}); scene('t6_cloths',4.6,{list:cloths}); scene('t6_cloches',2.9,{list:cl2}); say(m.id,'tasting_ult'); S('whoosh'); setMessage('TNB snaps a tablecloth under everyone. Service begins.'); }],
    [750,()=>{ S('ting'); setMessage('Linen, candles, silver cloches. Fourteen courses. He is doing all of them.'); }],
    [1300,()=>{ S('ting'); scene('t6_big',.7,{x:px,y:120,txt:'COURSE 1',c:CREAM,sc:3}); setMessage('Course one: seared scallop, saffron, a little gold leaf.'); }],
    [1500,()=>{ E2.apply(); S('heal'); for(const p of party) { const U=ST.unit(p); scene('t6_sparkle',.9,{x:U.x,y:U.mid,r:U.h*.45}); if(p!==m) battle.fx[p.idx].hop=.3; } }],
    [1850,()=>{ S('ting'); scene('t6_big',.5,{x:px,y:120,txt:'COURSE 7',c:CREAM,sc:3}); }],
    [2320,()=>{ S('ting'); scene('t6_big',.5,{x:px,y:120,txt:'COURSE 14',c:GOLD,sc:3}); setMessage('Courses two through fourteen. Each one is a small painting.'); }],
    [2650,()=>{ S('whoosh'); setMessage('He clears every plate in one arm. Then he brings the check.'); }],
    [3050,()=>{ S('rumble',0,.5); }],
    ['hf',hit],
    [hit,()=>{ S('crash'); S('thud'); all(list); landHit(100); scene('t6_flash',.3,{a:.5,c:'#fff2c0'}); scene('t6_dust',1.0,{x:P.x,y:P.yb,r:P.w*.6,n:14}); scene('t6_big',.9,{x:288,y:58,txt:'THE CHECK',c:GOLD,sc:5}); setMessage('The check lands on every monster. Their little feet stick out.'); }],
    [0,()=>{ scene('t6_check',4.8,{P}); }],
    [3950,()=>{ S('ding'); setMessage('Twelve hundred dollars. Service not included.'); }],
    [4850,'end',()=>res(E2)+'He will be back with the mints.']]); };

// ---------- Just Around the Bend (B2; key around_the_bend; Cone Six's numbers) ----------
// A switchback trail unrolls up an LA hill (Observatory on top, Hollywood sign behind). TNB climbs it: at each bend a sign, and "just around the bend". Three bends.
// Summit at golden hour; he throws down a water bottle and trail mix (heal, warm, cool). The stuck boot pops free first.
// An LA hill: smoggy-gold sky, Hollywood sign on a far ridge, downtown skyline, palms, chaparral, and the Observatory on top.
const palm=(x,y,h,lean)=>{ gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x,y); gfx.quadraticCurveTo(x+lean*.2,y-h*.5,x+lean,y-h); gfx.stroke(); Ln(x,y,x,y,1,OUT);
  gfx.strokeStyle='#8a6a42'; gfx.lineWidth=4; gfx.beginPath(); gfx.moveTo(x,y); gfx.quadraticCurveTo(x+lean*.2,y-h*.5,x+lean,y-h); gfx.stroke();
  const tx=x+lean,ty=y-h; for(let k=0;k<7;k++) { const a=-Math.PI+k*Math.PI/6; const ex=tx+Math.cos(a)*26,ey=ty+Math.sin(a)*14+(k<1||k>5?10:0)+4; LnO(tx,ty,ex,ey,3,'#3f9a48'); } E(tx,ty+1,3,3,'#6b4a2a'); };
SC.t6_trail=(s,u)=>{ const ms=s.t*1000,P=s.P; const q=ez(ms/700); const A=fin(u,.05)*fade(u,.93); gfx.globalAlpha=A;
  const px=P.pts[3][0],py=P.pts[3][1],dir=px>288?-1:1,ox=cl(px+dir*46,44,532);
  if(PROPART.ready('tnb/hill_backdrop')) {   // painted golden-hour LA hill (Oct 31); the drawn hill below is the fallback
    PROPART.draw('tnb/hill_backdrop',288,162,{w:576,h:324});
    if(ms>P.gold) { const g=cl((ms-P.gold)/500); gfx.globalAlpha=A*g*.18; R(0,0,576,324,'#ffb060'); gfx.globalAlpha=A; }
    P.pts.slice(1).forEach(([x,y],k)=>{ if(ms<P.signs[k]) return; const ok=k<2&&PROPART.draw('tnb/trail_sign',x+(k?-18:18),y-4,{h:50}); if(ok) return;
      RO(x-2,y-30,4,30,'#8a6436'); RO(x-18,y-42,36,14,WHITE); label(k<2?'0.2 MI':'TOP',x,y-39,INK,1); });
    gfx.globalAlpha=1; return; }
  const sky=gfx.createLinearGradient(0,0,0,250); sky.addColorStop(0,'#5fa6e8'); sky.addColorStop(.65,'#bfd8ea'); sky.addColorStop(1,'#ffd9a8'); gfx.fillStyle=sky; gfx.fillRect(0,0,576,324);
  E(60+(px<288?400:0),70,22,10,'rgba(255,255,255,.8)'); E(100+(px<288?330:0),52,16,7,'rgba(255,255,255,.7)');
  // far ridge with the sign
  const rx=px<288?420:150; gfx.fillStyle='#9fb3c8'; gfx.beginPath(); gfx.moveTo(rx-190,260); gfx.quadraticCurveTo(rx-60,150,rx,148); gfx.quadraticCurveTo(rx+70,150,rx+190,260); gfx.closePath(); gfx.fill();
  label('HOLLYWOOD',rx-18,150,OUT,1); label('HOLLYWOOD',rx-18,149,WHITE,1);
  // downtown skyline in the haze
  const sk=[[0,22],[9,34],[19,26],[27,52],[36,30],[46,64],[57,38],[66,28],[76,44],[86,24]],bx0=px<288?330:70; R(bx0-6,200,104,50,'#8fa3b8');
  sk.forEach(([dx,h],k)=>{ R(bx0+dx,248-h,8,h+4,k%2?'#7c93ac':'#8aa0b6'); if(k===5) { R(bx0+dx+3,248-h-9,2,9,'#7c93ac'); } if(k===3) PO([[bx0+dx,248-h],[bx0+dx+4,248-h-8],[bx0+dx+8,248-h]],'#7c93ac',0); });
  // the hill itself
  gfx.fillStyle=OUT; gfx.beginPath(); gfx.moveTo(-12,330); gfx.lineTo(-12,264); gfx.bezierCurveTo(px*.35,262,px*.6,py+38,px,py+4); gfx.bezierCurveTo(px+(588-px)*.4,py+8,px+(588-px)*.6,236,588,242); gfx.lineTo(588,330); gfx.closePath(); gfx.fill();
  gfx.save(); gfx.translate(0,2); gfx.fillStyle='#b4a35c'; gfx.beginPath(); gfx.moveTo(-12,330); gfx.lineTo(-12,264); gfx.bezierCurveTo(px*.35,262,px*.6,py+38,px,py+4); gfx.bezierCurveTo(px+(588-px)*.4,py+8,px+(588-px)*.6,236,588,242); gfx.lineTo(588,330); gfx.closePath(); gfx.fill(); gfx.restore();
  // shaded slope + chaparral bushes + dry grass ticks
  gfx.save(); gfx.beginPath(); gfx.moveTo(-12,330); gfx.lineTo(-12,264); gfx.bezierCurveTo(px*.35,262,px*.6,py+38,px,py+4); gfx.bezierCurveTo(px+(588-px)*.4,py+8,px+(588-px)*.6,236,588,242); gfx.lineTo(588,330); gfx.closePath(); gfx.clip();
  gfx.globalAlpha=A*.35; E(px+dir*90,py+90,140,60,'#7d7a3a'); gfx.globalAlpha=A;
  for(let k=0;k<26;k++) { const bx=(k*97+13)%576,by=py+30+((k*53)%210); if(by>322) continue; E(bx,by,7+(k%4)*2,4+(k%3),k%3?'#6f8f45':'#8a9a4e'); E(bx-2,by-1,3,2,'#9db35e'); }
  for(let k=0;k<30;k++) { const bx=(k*71+29)%576,by=py+40+((k*37)%200); R(bx,by,2,3,'#d8c070'); }
  gfx.restore(); gfx.globalAlpha=A;
  // palms on the low side
  const lx=px<288?510:56; palm(lx,274,70,dir*-8); palm(lx+(px<288?-34:34),282,56,dir*8);
  // Observatory on the summit
  RO(ox-34,py-12,68,12,'#f6f0e0'); R(ox-34,py-4,68,4,'#e0d8c0'); for(let k=-28;k<=28;k+=8) R(ox+k,py-10,3,7,'#e0d8c0');
  EO(ox,py-12,13,11,'#7fbfa4'); R(ox-13,py-13,26,3,'#f6f0e0'); R(ox-1,py-23,2,10,'#3a5a4a');
  EO(ox-27,py-12,6,5,'#7fbfa4'); EO(ox+27,py-12,6,5,'#7fbfa4'); RO(ox-3,py-44,6,26,'#f6f0e0'); EO(ox,py-46,5,4,'#7fbfa4');
  if(ms>P.gold) { const g=cl((ms-P.gold)/500); gfx.globalAlpha=A*g*.35; R(0,0,576,324,'#ffb060'); gfx.globalAlpha=A; EO(px+dir*-60,60,22*g,22*g,'#ffe08a'); }
  // the trail
  for(let k=0;k<3;k++) { const [x0,y0]=P.pts[k],[x1,y1]=P.pts[k+1],qq=cl(q*3-k); if(qq<=0) continue; const xe=lerp(x0,x1,qq),ye=lerp(y0,y1,qq); LnO(x0,y0,xe,ye,10,'#ecd7a4'); E(xe,ye,4,3,GRASS); }
  P.pts.slice(1).forEach(([x,y],k)=>{ if(ms<P.signs[k]) return; RO(x-2,y-30,4,30,'#8a6436'); RO(x-18,y-42,36,14,WHITE); label(k<2?'0.2 MI':'TOP',x,y-39,INK,1); });
  gfx.globalAlpha=1; };
const bottle=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); RO(-5,-14,10,24,'#5fa8e0'); R(-4,-18,8,5,'#2a6aa8'); R(-3,-6,3,10,'rgba(255,255,255,.5)'); gfx.restore(); };
T.around_the_bend=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),foe=t.side==='foe',self=t===m,hit=3500;
  const bx=Math.max(70,Math.min(500,H.x+(foe?80:-10))),by=H.base-4;
  const pts=[[bx,by],[Math.min(540,bx+90),by-50],[Math.max(36,bx-10),by-96],[Math.min(540,bx+110),by-142]];
  pts[3][1]=Math.max(96,pts[3][1]); pts[2][1]=Math.max(132,pts[2][1]); pts[1][1]=Math.max(172,pts[1][1]);
  if(PROPART.ready('tnb/hill_backdrop')) { pts[1]=[440,168]; pts[2]=[508,120]; pts[3]=[470,64]; }   // walk the painted switchbacks
  const P={pts,signs:[1100,1700,2300],gold:2800};
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:600,x:bx+34,y:by+4,f:'point'},{t:800,x:bx+34,y:by+4,f:'walk',ease:'lin'},{t:1100,x:pts[1][0],y:pts[1][1]+4,f:'walkR',ease:'lin'},{t:1700,x:pts[2][0],y:pts[2][1]+4,f:'walk',ease:'lin'},{t:2300,x:pts[3][0],y:pts[3][1]+4,f:'walkR',ease:'lin'},{t:2800,f:'cheer',hop:6},{t:3150,f:'throw'},{t:3600,f:'celeb'},{t:3900,x:pts[3][0]+10,y:pts[3][1]+4,f:'idle',rot:.3},{t:4000,x:'home',y:'home',f:'idle',rot:u=>.3*(1-u),ease:'in'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('TNB points up the trail. "Short one. Promise."'); say(m.id,'around_the_bend'); scene('t6_trail',4.6,{P,back:true}); }],
    [600,()=>{ S('click'); scene('t6_big',.7,{x:H.x,y:H.base-8,txt:'POP',c:CREAM,sc:2}); setMessage(t.name+'\'s stuck boot pops free. Off we go.'); }],
    [1100,()=>{ S('select'); scene('t6_big',.6,{x:pts[1][0],y:Math.max(52,pts[1][1]-52),txt:'AROUND THE BEND',c:CREAM,sc:2}); setMessage('"It\'s just around the bend."'); }],
    [1700,()=>{ S('select'); scene('t6_big',.6,{x:pts[2][0],y:Math.max(52,pts[2][1]-52),txt:'THIS BEND',c:AMBER,sc:2}); setMessage('"...This bend."'); }],
    [2300,()=>{ S('select'); scene('t6_big',.6,{x:pts[3][0],y:Math.max(52,pts[3][1]-52),txt:'THAT BEND',c:RED,sc:2}); setMessage('"Okay, THAT bend."'); }],
    [2800,()=>{ S('cheer'); S('chime2'); scene('t6_big',.9,{x:pts[3][0],y:Math.max(44,pts[3][1]-60),txt:'SUMMIT',c:GOLD,sc:3}); setMessage('Summit. Golden hour. He pretends this was the plan.'); }],
    [3150,()=>{ S('whoosh'); const h=hand(); ST.fly(()=>bottle(0,0,1.3),h.x,h.y,H.x,H.mid,.35,30,0,{spin:.5}); ST.fly(()=>{ EO(0,0,8,6,'#c98a5c'); E(-3,-1,2,2,'#6cbf5a'); E(3,0,2,2,'#e0402e'); },h.x,h.y,H.x+16,H.mid+6,.38,34,.05,{spin:.5}); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); scene('t6_glow',1.0,{x:H.x,y:H.mid,c:'#ffd98a',rx:H.w*.6,ry:H.h*.6}); scene('t6_sparkle',.9,{x:H.x,y:H.mid,r:H.h*.45}); scene('t6_big',1.0,{x:H.x,y:topY(H),txt:'SNACK',c:GOLD,sc:3}); if(!foe&&!self) battle.fx[t.idx].hop=.35; if(foe) ST.jolt(t,.15); }],
    [3900,()=>{ S('whoosh'); setMessage('He slides back down. The way down is always shorter.'); }],
    [4600,'end',kindLine(t,'It was, in fact, around a bend.')]]); };

// ---------- Round with Jojo (B3; key round_with_jojo; Curb Appeal's numbers) ----------
// A disc golf basket appears past the row. Jojo (his sister) wanders in: long face, rectangular glasses, long straight
// light brown hair, very relaxed. She takes a very long time to line it up. One disc through every monster. CHAINS.
const jojo=(x,y,t,ph)=>{ // ph: 'walk' | 'aim' | 'thumb'. Feet at (x,y). About 88 px tall: a long face, rectangular glasses, long straight hair.
  gfx.save(); gfx.translate(x,y); const bob=ph==='walk'?Math.abs(Math.sin(t*7))*3:Math.sin(t*1.3)*1.2; gfx.translate(0,-bob);
  const step=ph==='walk'?Math.sin(t*14)*4:0;
  RO(-10+step,-16,7,16,'#3f4a63'); RO(3-step,-16,7,16,'#3f4a63'); RO(-12+step,-2,10,3,WHITE); RO(2-step,-2,10,3,WHITE);   // legs, sneakers
  RO(-14,-46,28,30,HOOD); R(-14,-46,28,5,'#5b7a4e'); R(-6,-34,12,10,'#5b7a4e'); R(-2,-44,4,4,'#d8dce2');                  // hoodie, pocket, strings
  RO(-19,-88,10,58,HAIR2); RO(9,-88,10,58,HAIR2);                                                                        // long straight hair down past the chest
  RO(-9,-86,18,42,'#f1c9a4'); RO(-13,-92,26,8,HAIR2); R(-9,-84,18,3,HAIR2);                                              // long face, hair on top
  const blink=Math.sin(t*.9)>.96; R(-9,-70,8,blink?2:7,OUT); R(1,-70,8,blink?2:7,OUT); R(-8,-69,6,blink?1:5,'#dff0ff'); R(2,-69,6,blink?1:5,'#dff0ff'); R(-1,-68,2,1,OUT); // rectangular glasses
  if(!blink) { R(-6,-67,2,2,'#4a3a2a'); R(4,-67,2,2,'#4a3a2a'); } R(-4,-74,6,1,'#7a5a3a'); R(-2,-74,6,1,'#7a5a3a');
  R(-3,-52,6,2,'#c47a6a');                                                                                               // small easy smile
  if(ph==='thumb') { RO(-24,-50,8,14,'#f1c9a4'); R(-22,-58,4,9,'#f1c9a4'); RO(16,-40,8,14,'#f1c9a4'); }
  else if(ph==='aim') { RO(-20,-40,8,14,'#f1c9a4'); RO(12,-50,18,7,'#f1c9a4'); }
  else { RO(-20,-40,8,14,'#f1c9a4'); RO(12,-40,8,14,'#f1c9a4'); }
  gfx.restore(); };
SC.t6_jojo=(s,u)=>{ const ms=s.t*1000,P=s.P; let x,ph='walk'; if(ms<P.in) x=lerp(P.x0,P.xs,ez(ms/P.in)); else if(ms<P.out) { x=P.xs; ph=ms<P.throw?'aim':(ms<P.out?'thumb':'walk'); if(ms>=P.throw&&ms<P.throw+200) ph='walk'; } else x=lerp(P.xs,P.x0,ez((ms-P.out)/(P.gone-P.out)));
  gfx.globalAlpha=1; s.x=x;
  // Painted Jojo (data/jojo-hires-use.js; Tom's photo sheet, Oct 2026). Walk in facing left, line it up (reach-back), x-step, release at P.throw, follow through,
  // hop at CHAINS, high-five, walk out facing right. Falls back to the drawn stand-in while the art loads.
  const J=typeof JOJO_BT!=='undefined'&&JOJO_BT.ready()&&P.hs;
  if(J) { const hs=P.hs,y=P.y,step=['right_step1','right_stand','right_step2','right_stand'][Math.floor(s.t*5)%4];
    if(ms<P.in) JOJO_BT.drawOw(step,x,y-Math.abs(Math.sin(s.t*10))*2,hs,true);
    else if(ms>=P.out) JOJO_BT.drawOw(step,x,y-Math.abs(Math.sin(s.t*10))*2,hs,false);
    else { const bob=Math.sin(s.t*1.3)*1.2; let f='b_reach',dx=0,dy=-bob;
      if(ms>=P.throw+1000) f='b_high'; else if(ms>=P.chains) { f='b_celeb2'; dy=-Math.abs(Math.sin((ms-P.chains)/110))*10; }
      else if(ms>=P.throw+200) f='b_follow'; else if(ms>=P.throw-100) f='b_release'; else if(ms>=P.throw-350) { f='b_xstep'; dx=-6; }
      JOJO_BT.draw(f,x+dx,y+dy,hs,true); }
    if(ms>P.giggle&&ms<P.giggle+600) label('HEH',x+20,P.y-P.hs-10,CREAM,1); return; }
  jojo(x,P.y,s.t,ph);
  if(ms>P.giggle&&ms<P.giggle+600) label('HEH',x+20,P.y-96,CREAM,1); if(ms>P.in&&ms<P.throw) disc(x+30,P.y-48+Math.sin(s.t*2)*2,1); };
const disc=(x,y,sc)=>{ if(PROPART.draw('tnb/flying_disc',x,y,{w:30*sc})) return; gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); EO(0,0,14,5,'#ff6a3c'); E(0,-1,9,3,'#ff8a5c'); gfx.restore(); };
const basket=(x,y,ms,P)=>{ if(PROPART.draw('tnb/disc_golf_basket',x,y-50,{h:100})) { if(ms>P.chains+150) disc(x,y-34,.9); return; }
  RO(x-3,y-90,6,90,CHROME); RO(x-30,y-96,60,6,CHROME2); for(let k=-24;k<=24;k+=8) { const sw=ms>P.chains&&ms<P.chains+500?Math.sin((ms-P.chains)/30+k)*3:0; Ln(x+k,y-90,x+k*.6+sw,y-44,2,CHROME); }
  RO(x-28,y-44,56,22,CHROME); R(x-24,y-40,48,14,'#3a3f46'); for(let k=-20;k<=20;k+=10) Ln(x+k,y-40,x+k,y-26,2,CHROME2); if(ms>P.chains+150) disc(x,y-36,.9); };
SC.t6_basket=(s,u)=>{ const ms=s.t*1000; gfx.globalAlpha=fin(u,.08)*fade(u,.93); basket(s.x,s.y,ms,s.P); gfx.globalAlpha=1; };
SC.t6_discfly=(s,u)=>{ const q=u,x=lerp(s.x0,s.x1,q),y=lerp(s.y0,s.y1,q)-Math.sin(q*Math.PI)*s.arc; gfx.globalAlpha=1; for(let k=1;k<4;k++) { const qq=cl(q-k*.04),xx=lerp(s.x0,s.x1,qq),yy=lerp(s.y0,s.y1,qq)-Math.sin(qq*Math.PI)*s.arc; gfx.globalAlpha=.3-k*.08; disc(xx,yy,1.2); } gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.rotate(Math.sin(q*Math.PI)*.5); disc(0,0,1.4); gfx.restore(); };
T.round_with_jojo=E2=>{ const {m,fx}=E2,list=foesOf(E2),G=ST.group(list),me=homeOf(m),hit=2900;
  const kx=Math.max(28,G.x0-70),ky=Math.min(312,G.base+4),jx=Math.max(G.x1+120,Math.min(me.x-70,470)),jy=Math.min(314,me.y+4);
  const HU=ST.unit(m),hs=Math.round(((HU&&HU.h)||80)*.93),P={x0:620,xs:jx+60,y:jy,in:1300,throw:2500,giggle:1800,out:3900,gone:4800,chains:3100,hs},BP={chains:3100};
  P.hx=P.xs-Math.round(hs*.62); P.hy=jy-Math.round(hs*.74);
  const sorted=list.map(f=>({f,x:ST.foe(f).x})).sort((a,b)=>b.x-a.x),span=jx+90-kx,spins=sorted.map((o,k)=>({f:o.f,t:2500+450*((jx+90-o.x)/span),k}));
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk'},{t:300,x:jx-10,y:jy,f:'point'},{t:1300,f:'aim'},{t:1900,f:'hip'},{t:2300,f:'hip',dx:(u,tt)=>Math.sin(tt*30)*1},{t:2500,f:'spread'},{t:2900,f:'celeb',hop:8},{t:3400,f:'clap'},{t:3900,f:'walkR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A disc golf basket appears. TNB looks off to the right. "Jojo, you\'re up."'); say(m.id,'round_with_jojo'); scene('t6_basket',4.7,{x:kx,y:ky,P:BP}); scene('t6_jojo',4.8,{P}); scene('t6_spin',2.0,{list:spins,t0:2000,delay:2.0,h:22}); }],
    [1300,()=>{ setMessage('Jojo wanders in. She is in no hurry. She has never been in a hurry.'); }],
    [1800,()=>{ S('select'); setMessage('She lines it up. She is still lining it up.'); }],
    [2300,()=>{ scene('t6_big',.5,{x:jx-10,y:jy-110,txt:'...',c:CREAM,sc:3}); setMessage('TNB checks his watch.'); }],
    [2500,()=>{ S('whoosh'); scene('t6_discfly',.6,{x0:P.hx,y0:P.hy,x1:kx,y1:ky-60,arc:90}); setMessage('One throw. It never came down.'); }],
    ...spins.map(sp=>[sp.t,()=>{ ST.jolt(sp.f,.4); S('bonk'); }]),
    ['hf',hit],
    [hit,()=>{ landHit(100); scene('t6_big',1.0,{x:G.x,y:Math.max(40,G.top-70),txt:'THROUGH!',c:GOLD,sc:3}); }],
    [3100,()=>{ S('clang'); S('jangle'); scene('t6_big',1.0,{x:kx+20,y:ky-120,txt:'CHAINS!',c:GOLD,sc:4}); setMessage('CHAINS. Ace. First throw.'); }],
    [3500,()=>{ S('ding'); scene('t6_big',1.0,{x:jx+60,y:Math.max(40,jy-hs-30),txt:'NICE.',c:CREAM,sc:3}); setMessage('Jojo gives a slow high-five to the air. "Nice."'); }],
    [3900,()=>{ setMessage('She wanders off the way she came. Possibly for snacks.'); }],
    [4600,'end',res(E2)+'She does this every Sunday.']]); };

// ---------- Coffee Run (B4; key coffee_run; replaces Status: Green; Fix the Wobble's numbers) ----------
// The wardrobe runner's job. TNB says "coffee run" and sprints offstage. A cafe sign and a long line flash by while he waits.
// He sprints back with a cardboard tray of cups and hands the friend theirs (their name is spelled wrong). Heal + VP.
const cup=(x,y,sc,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc); if(PROPART.draw('tnb/coffee_mug',0,-9,{h:19})) { gfx.restore(); return; }   // painted coffee mug
  PO([[-6,-13],[6,-13],[4.4,0],[-4.4,0]],WHITE,2); R(-5.2,-9,10.4,5,'#a8743c'); RO(-7,-17,14,5,'#3a2a22'); gfx.restore(); };
SC.t6_tray=(s,u)=>{ const ms=s.t*1000; if(ms<s.from||ms>s.until) return; const h=hand(); gfx.globalAlpha=1; RO(h.x-16,h.y-3,32,5,'#b89868'); cup(h.x-9,h.y-4,1.1); cup(h.x+1,h.y-4,1.1); if(ms<s.cupGone) cup(h.x+11,h.y-4,1.1); steam(h.x-4,h.y-22,s.t,2,'#ffffff',16); };
SC.t6_cafe=(s,u)=>{ const ms=s.t*1000; gfx.globalAlpha=fin(u,.08)*fade(u,.9); const x=s.x,y=s.y;
  RO(x-40,y-70,80,22,CREAM); label('CAFE',x-12,y-63,INK,2); RO(x+34,y-48,6,48,'#8a6436');
  for(let k=0;k<5;k++) { const hx=x-70+k*18; RO(hx-5,y-4,10,18,['#3f4a63','#6d4a5e','#4a6a52','#5a5a6a','#7a5a3a'][k]); EO(hx,y-12,6,6,['#f1c9a4','#d8a47c','#f1c9a4','#c48a60','#e8c4a0'][k]); }
  RO(x-44,y-100,28,28,WHITE); const a=ms/180; Ln(x-30,y-86,x-30+Math.cos(a)*9,y-86+Math.sin(a)*9,2,INK); Ln(x-30,y-86,x-30+Math.cos(a/12)*6,y-86+Math.sin(a/12)*6,2,INK);
  gfx.globalAlpha=1; };
SC.t6_streak=(s,u)=>{ gfx.globalAlpha=(1-u)*.7; for(let k=0;k<5;k++) Ln(s.x0,s.y+k*7-14,s.x1,s.y+k*7-14,2,CREAM); gfx.globalAlpha=1; };
T.coffee_run=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t),foe=t.side==='foe',self=t===m,hit=2800,hm=homeOf(m);
  const cupGone=2500,cafeX=Math.min(200,Math.max(90,H.x-120));
  ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:420,x:-70,y:hm.y,f:'run',ease:'lin'},{t:1200,f:'carry'},{t:1500,x:sp.x,y:sp.y,f:'run',ease:'lin'},{t:2050,f:'carry'},{t:2450,f:'throw'},{t:2900,f:'hip'},{t:3500,f:self?'idle':'walkR'},{t:4100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('"Coffee run." TNB is already gone.'); say(m.id,'coffee_run'); S('whoosh'); scene('t6_streak',.4,{x0:hm.x,x1:0,y:hm.y-40}); }],
    [500,()=>{ scene('t6_cafe',1.0,{x:cafeX,y:300}); setMessage('The line is long. He has done this on a film set at 5 a.m. He is fine.'); }],
    [1200,()=>{ S('ting'); scene('t6_tray',1.5,{from:1200,until:2450,cupGone:99999}); setMessage('Tray of cups. One of them says '+t.name+', spelled wrong.'); }],
    [1500,()=>{ S('whoosh'); scene('t6_streak',.5,{x0:0,x1:Math.min(500,sp.x),y:sp.y-40}); }],
    [2000,()=>{ scene('t6_big',.7,{x:H.x,y:topY(H),txt:'COFFEE',c:CREAM,sc:3}); S('click'); }],
    [2450,()=>{ S('whoosh'); const h=hand(); ST.fly(()=>cup(0,0,1.6),h.x,h.y-8,H.x,H.mid,.3,30,0,{spin:.3}); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); S('heal'); S('ding'); scene('t6_glow',.9,{x:H.x,y:H.mid,c:'#ffe2b0',rx:H.w*.6,ry:H.h*.6}); scene('t6_sparkle',.8,{x:H.x,y:H.mid,r:H.h*.4}); scene('t6_big',1.0,{x:H.x,y:topY(H),txt:'WARM',c:AMBER,sc:3}); if(!foe&&!self) battle.fx[t.idx].hop=.35; if(foe) ST.jolt(t,.15); }],
    [3100,()=>{ setMessage('Hot, oat milk, exactly right. He remembered the order.'); }],
    [4100,'end',kindLine(t,'He got the order right. He always does.')]]); };
})();
