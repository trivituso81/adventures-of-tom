'use strict';
// engine/grace-moves.js — Grace's attacks, built from her hobbies: gymnastics, dance, YouTube, nail polish, squishies, fashion.
// Same shape as tom-moves.js: RECRUIT_MOVES.grace[key] queues steps and registers scenes (RFX.SC) and props (PROP2).
RECRUIT_MOVES.grace={};
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const Qd=(x0,y0,cx,cy,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.quadraticCurveTo(cx,cy,x1,y1); gfx.stroke(); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const rrect=(x,y,w,h,r,c)=>{ if(!gfx.roundRect) { R(x,y,w,h,c); return; } gfx.beginPath(); gfx.roundRect(x,y,w,h,r); gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const gpos=()=>battle.actorPos||{cx:462,base:279,h:78};
const hand=()=>{ const p=gpos(); return {x:p.cx-22,y:p.base-Math.round(p.h*.52)}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const appr=(fx,d)=>{ fx.appr=d; fx.apprDur=d; };
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8';
const G=RECRUIT_MOVES.grace;

// Sounds this file needs that audio.js does not have yet.
if(!sfx.squeak) sfx.squeak=()=>{ tone({type:'sine',f0:1500,f1:2300,dur:.09,vol:.16}); tone({type:'sine',f0:2300,f1:1200,dur:.14,vol:.12,delay:.09}); };
if(!sfx.click) sfx.click=()=>{ noise({dur:.04,vol:.22,f0:3500,f1:1500,type:'bandpass',q:1}); tone({type:'square',f0:2600,dur:.03,vol:.08}); };
if(!sfx.beep) sfx.beep=()=>{ tone({type:'square',f0:1760,dur:.08,vol:.1}); };
if(!sfx.beat) sfx.beat=()=>{ tone({type:'sine',f0:150,f1:45,dur:.18,vol:.3}); noise({dur:.05,vol:.1,f0:5000,f1:7000}); };
if(!sfx.spray) sfx.spray=()=>{ noise({dur:.22,vol:.14,f0:2500,f1:5000,type:'bandpass',q:.8}); };
if(!sfx.ding) sfx.ding=()=>{ tone({type:'sine',f0:1320,dur:.5,vol:.12}); tone({type:'sine',f0:1980,dur:.4,vol:.07,delay:.02}); };

// ================= Drawing bits =================
// Grace's sparkling diamond gold soup dumpling squishy, the same pixel art as the opening (SQUISHY in intro.js).
// sq is how squeezed it is (0 round, 1 flat). Drawn centered on x,y, about 54x42 at sc=1.
const dumpling=(x,y,sq,sc=1)=>{
  const sx=sc*(1+sq*.5),sy=sc*(1-sq*.45),P=3,rows=SQUISHY,w=rows[0].length,h=rows.length;
  gfx.save(); gfx.translate(x,y); gfx.scale(sx,sy);
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) {
    let ch=rows[r][c]; if(ch==='.') continue;
    if(sq>.6&&ch==='e'&&r<9) ch='g'; // eyes squeeze shut
    gfx.fillStyle=SQUISHY_PAL[ch]; gfx.fillRect((c-w/2)*P,(r-h/2)*P,P+.5,P+.5);
  }
  gfx.restore();
  // Diamond glints.
  const t=performance.now()/1000,a=gfx.globalAlpha;
  for(let k=0;k<3;k++) { const ph=(t*1.3+k/3)%1; gfx.globalAlpha=a*(1-Math.abs(ph-.5)*2); star(x+[-20,18,4][k]*sx,y+[-14,-8,-24][k]*sy,2+ph*4,k%2?'#aef0ff':'#fffbe6'); }
  gfx.globalAlpha=a;
};
const star=(x,y,r,c)=>{ const pts=[]; for(let k=0;k<10;k++) { const a=-Math.PI/2+k*Math.PI/5,rad=k%2?r*.45:r; pts.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad]); } poly(pts,c); };
const bottle=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a||0); R(-9,-6,18,26,OUT); R(-7,-4,14,22,PINK); R(-5,0,4,16,'#ffb3d1'); R(-6,-20,12,16,OUT); R(-4,-18,8,12,'#2b2a26'); R(-2,-17,2,10,'#55524a'); gfx.restore(); };
const card=(x,y,txt,c,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot||0); R(-19,-24,38,48,OUT); R(-17,-22,34,44,CREAM); R(-17,-22,34,6,c||PINK); label(txt,0,2,'#2b2a26',3); gfx.restore(); };

// ================= Scenes =================
SC.sparkles=(s,u)=>{
  // Twinkles that follow Grace (s.follow) or sit at s.x,s.y.
  const p=s.follow?gpos():{cx:s.x,base:s.y,h:0},n=s.n||10; gfx.globalAlpha=env(u,.1,.8);
  for(let k=0;k<n;k++) { const a=rr(s,k),b=rr(s,k+20),ph=(s.t*2+a)%1,x=p.cx-30+a*60+Math.sin(s.t*3+k)*6,y=p.base-p.h*.5-40+b*80-ph*30,r=2+Math.sin(ph*Math.PI)*4; star(x,y,r,[PINK,PURP,GOLD,CREAM][k%4]); }
};
SC.squish=(s,u)=>{
  // Held squishy in Grace's hand, squeezed three times.
  const h=hand(),sq=Math.pow(Math.abs(Math.sin(u*Math.PI*3)),1.5)*cl(u*6);
  gfx.globalAlpha=u>.9?(1-u)/.1:1;
  dumpling(h.x-6,h.y-6,sq,1);
  if(sq>.7) label('SQUEAK',h.x-6,h.y-54,GOLD,2);
};
SC.squishland=(s,u)=>{
  // The squishy sits on the Grump, pancaked, and very slowly puffs back up.
  const y=206-(battle.liftNow||0),sq=1-ez(cl((u-.25)/.6)); gfx.globalAlpha=u>.9?(1-u)/.1:1;
  dumpling(GX+6,y,sq,1.25);
  if(u>.3&&u<.85) label('SLOW RISE',GX+6,y-58,PINK2,2);
};
SC.polishhand=(s,u)=>{ const h=hand(); gfx.globalAlpha=env(u,.1,.9); bottle(h.x-4,h.y+4,-.4+Math.sin(s.t*7)*.15); for(let k=0;k<3;k++) { const q=(s.t*2+k/3)%1; E(h.x-14-q*8,h.y+28+q*22,2.5,3.5,'rgba(255,127,179,'+(1-q)+')'); } };
SC.strokes=(s,u)=>{
  // Pink brush strokes appear across the Grump one by one, then glitter.
  const y0=GY-(battle.liftNow||0),n=6; gfx.globalAlpha=u>.9?(1-u)/.1:1;
  for(let k=0;k<n;k++) { const q=cl((u-.05-k*.11)/.1); if(q<=0) continue; const yy=y0-30+k*14,x0=GX-44+(k%2)*10,x1=x0+70; Qd(x0,yy,lerp(x0,x1,q)*.5+x0*.5,yy-10,lerp(x0,x1,q),yy,10,k%2?PINK:PURP); }
  if(u>.7) for(let k=0;k<12;k++) { const a=rr(s,k),b=rr(s,k+7),ph=(s.t*3+a)%1; star(GX-44+a*88,y0-40+b*70,1.5+Math.sin(ph*Math.PI)*3.5,[GOLD,CREAM,PINK2][k%3]); }
};
SC.blow=(s,u)=>{ const h=hand(); gfx.globalAlpha=env(u,.1,.8); for(let k=0;k<4;k++) { const q=(u*1.4+k*.22)%1; label('~',h.x-30-q*(h.x-30-GX-40),h.y-10+Math.sin(q*9+k)*6,'rgba(255,248,232,'+(1-q)+')',2); } };
SC.runway=(s,u)=>{
  // A lit catwalk from Grace to the Grump, with two spotlights swinging over it.
  const p=gpos(),k=ez(u/.12); gfx.globalAlpha=u>.9?(1-u)/.1:1;
  const x0=p.cx+40,x1=GX+40,y=p.base+8;
  R(x1,y-6,(x0-x1)*k,14,OUT); R(x1,y-4,(x0-x1)*k,10,'#f7eaf3'); R(x1,y-4,(x0-x1)*k,3,'#ffffff');
  for(let i=0;i<8;i++) { const x=x1+i*((x0-x1)/8)*k; E(x,y+9,3,1.6,PINK); }
  for(const d of [-1,1]) { const sx=288+d*150,ang=Math.sin(s.t*2.2+d)*.35; gfx.globalAlpha*=.28; poly([[sx,-10],[sx-60+ang*120,y+10],[sx+60+ang*120,y+10]],d<0?'#ffd6ea':'#e4d2ff'); gfx.globalAlpha/=.28; }
};
SC.flashes=(s,u)=>{
  // Paparazzi: white starbursts popping around the stage.
  const n=s.n||14; for(let k=0;k<n;k++) { const t0=rr(s,k)*.9,q=(u-t0)/.1; if(q<0||q>1) continue; const x=40+rr(s,k+5)*500,y=30+rr(s,k+9)*150; gfx.globalAlpha=1-q; star(x,y,8+q*26,'#ffffff'); E(x,y,4,4,CREAM); }
};
SC.boombox=(s,u)=>{
  const x=s.x,y=s.y,drop=ez(u/.12),yy=lerp(-80,y,drop),pump=1+Math.abs(Math.sin(s.t*8))*.12; gfx.globalAlpha=u>.92?(1-u)/.08:1;
  R(x-52,yy-30,104,52,OUT); R(x-50,yy-28,100,48,'#3a3d6a'); R(x-50,yy-28,100,10,'#5b5fa0'); R(x-30,yy-40,60,12,OUT); R(x-28,yy-38,56,8,'#5b5fa0');
  for(const d of [-1,1]) { E(x+d*28,yy-2,16*pump,16*pump,OUT); E(x+d*28,yy-2,13*pump,13*pump,'#1d1f3a'); E(x+d*28,yy-2,6*pump,6*pump,'#8a8fd0'); }
  R(x-10,yy-10,20,16,'#9fe8ff'); R(x-8,yy-8,16,4,'#2b2a26'); R(x-8,yy-2,6*(1+Math.sin(s.t*8)),2,PINK); R(x-8,yy+2,6*(1+Math.cos(s.t*9)),2,GOLD);
  if(u>.1) for(let k=0;k<5;k++) { const ph=(s.t*1.1+k/5)%1; gfx.globalAlpha=1-ph; label(k%2?'#':'!',x-50+k*25+Math.sin(ph*8)*8,yy-50-ph*70,[PINK,GOLD,PURP][k%3],2); }
};
SC.scorecards=(s,u)=>{
  // Three judges pop up along the bottom of the stage, between the monster and the party, and hold up their cards.
  const cards=s.cards||['10','10','10'],n=cards.length;
  for(let k=0;k<n;k++) { const q=ez(cl((u-.05-k*.12)/.15)); if(q<=0) continue; const x=236+k*58,y=lerp(380,282,q)-Math.abs(Math.sin(s.t*4+k))*3; gfx.globalAlpha=u>.9?(1-u)/.1:1;
    R(x-11,y+24,22,40,OUT); R(x-9,y+26,18,38,['#4e81a3','#8b5a38','#4a7a4a'][k%3]); E(x,y+20,8,8,OUT); E(x,y+20,6.5,6.5,'#efbc8e');
    const c=typeof cards[k]==='string'?{t:cards[k]}:cards[k]; gfx.save(); gfx.translate(x,y-6); gfx.scale(.8,.8); card(0,0,c.t,c.c||(c.t==='10'?GOLD:PINK),(k-1)*.08); gfx.restore(); }
};
SC.recframe=(s,u)=>{
  // A phone recording frame over the whole stage: corner brackets, REC, LIVE, and a view counter that climbs.
  gfx.globalAlpha=env(u,.06,.94); const L=14,m=16;
  for(const [x,y,dx,dy] of [[m,m,1,1],[576-m,m,-1,1],[m,324-m,1,-1],[576-m,324-m,-1,-1]]) { Ln(x,y,x+dx*34,y,4,CREAM); Ln(x,y,x,y+dy*34,4,CREAM); }
  if(Math.floor(s.t*2)%2===0) { E(40,44,6,6,'#e0402e'); } label('REC',66,42,'#ffffff',2);
  R(470,30,80,20,'#e0402e'); label('LIVE',510,38,'#ffffff',2);
  const views=Math.round((s.views||1000000)*Math.pow(ez(cl((u-.1)/.75)),2)); label((views.toLocaleString?views.toLocaleString('en-US'):String(views))+' VIEWS',288,42,GOLD,2);
  for(let k=0;k<3;k++) { const ph=(s.t*.7+k/3)%1; gfx.globalAlpha=env(u,.06,.94)*(1-ph); label('<3',540-ph*10+Math.sin(ph*9)*10,290-ph*120,PINK,2); }
};
SC.beamapp=(s,u)=>{
  // The balance beam rises under Grace's starting spot.
  const p=s.p,k=ez(u/.15),y=p.base-2,h=38*k; gfx.globalAlpha=u>.9?(1-u)/.1:1;
  for(const d of [-1,1]) { R(p.cx+d*42-5,y-h+8,10,h-8,OUT); R(p.cx+d*42-3,y-h+10,6,h-10,'#8a8f96'); }
  R(p.cx-70,y-h-8,140,12,OUT); R(p.cx-68,y-h-6,136,8,'#d9b27a'); R(p.cx-68,y-h-6,136,2,'#f1d9a8');
};
SC.spot=(s,u)=>{ const p=s.follow?gpos():{cx:s.x,base:s.y}; gfx.globalAlpha=env(u,.1,.9)*.35; poly([[p.cx-10,-10],[p.cx+10,-10],[p.cx+70,p.base+10],[p.cx-70,p.base+10]],s.c||'#fff2c8'); gfx.globalAlpha=env(u,.1,.9)*.5; E(p.cx,p.base+6,70,10,s.c||'#fff2c8'); };
SC.werk=(s,u)=>{ gfx.globalAlpha=env(u,.1,.8); const x=s.x,y=s.y-u*14; for(let k=0;k<6;k++) { const a=k/6*Math.PI*2+s.t*2; star(x+Math.cos(a)*(40+u*20),y+Math.sin(a)*(18+u*10),4,[PINK,GOLD,PURP][k%3]); } };

// ================= Props =================
PROP2.squishy=(q,u)=>{ dumpling(0,0,0,1.1); };
PROP2.thumb=(q,u)=>{ rrect(-16,-6,28,30,5,OUT); rrect(-14,-4,24,26,4,'#9fe8ff'); R(-14,2,24,3,'#5fb8d8'); R(-14,10,24,3,'#5fb8d8'); R(-14,18,24,3,'#5fb8d8'); R(4,-34,14,32,OUT); R(6,-32,10,28,'#9fe8ff'); E(11,-32,6,6,OUT); E(11,-32,4,4,'#9fe8ff'); };
PROP2.subbtn=(q,u)=>{ rrect(-46,-14,92,28,6,OUT); rrect(-44,-12,88,24,5,'#e0402e'); label('SUBSCRIBE',0,-2,'#ffffff',2); };
PROP2.bell=(q,u)=>{ poly([[-16,12],[-12,-8],[-6,-18],[0,-22],[6,-18],[12,-8],[16,12]],GOLD,true); R(-20,10,40,6,OUT); R(-18,12,36,2,'#f1c349'); E(0,18,5,4,OUT); E(0,18,3,2.5,GOLD); E(0,-24,3,3,OUT); };
PROP2.bottle=(q,u)=>{ bottle(0,0,0); };

// ================= Moves =================
// CARTWHEEL (free): the signature, now with a sparkle trail and a hair-flip bonk at the end.
G.cartwheel=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace cartwheels in. Sparkles. Then one firm bonk.'); appr(fx,1.7); fx.cartwheel=.9; sfx.whoosh(); say('grace','cartwheel',.5); scene('sparkles',1.4,{follow:true,n:12}); },
    900,()=>{ fx.punch=.4; pose(fx,'act',.45); battle.slash=.22; sfx.bonk(); scene('burst',.4,{x:214,y:212,c:PINK,c2:CREAM}); bt('BONK',96,34,GOLD,3,.8); hit(E2); },
    700,E2.result,()=>checkEnemy()); };

// SQUISHY SQUEEZE (3 MP): she squeezes her diamond gold soup dumpling squishy three times, throws it, it pancakes the Grump and slowly rises.
G.squishy=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace pulls out the sparkling diamond gold soup dumpling. Squeeze. Squeeze. SQUEEZE.'); say('grace','squishy',.2); pose(fx,'expr',1.6); scene('squish',1.6,{}); for(let k=0;k<3;k++) setTimeout(()=>sfx.squeak(),260+k*520); },
    1650,()=>{ fx.punch=.5; pose(fx,'act',.5); const h=hand(); toss('squishy',h.x-6,h.y-6,GX+6,206,0,.6,90,{spin:false}); sfx.whoosh(); },
    620,()=>{ sfx.splat(); sfx.thud(); battle.shakeEnemy=.5; scene('ring',.6,{x:GX,y:264,r:110,c:PINK2}); scene('dust',.6,{x:GX,y:262,n:8,sp:22,up:18,c:'#ffd6ea',c2:'#fff0f6'}); scene('squishland',2.3,{}); bt('SPLAT',96,34,PINK,3,.9); hit(E2); },
    1100,()=>{ sfx.squeak(); },
    1000,E2.result+' The squishy is still rising. Very slowly.',()=>checkEnemy()); };

// GLITTER NAILS (4 MP): a fresh coat of glitter polish, painted right onto the Grump, then she blows on it. Do not smudge.
G.polish=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace opens the glitter polish. The Grump is getting a full set.'); say('grace','polish',.2); appr(fx,3.2); scene('polishhand',3.0,{}); },
    900,()=>{ pose(fx,'act',1.4); scene('strokes',2.6,{}); for(let k=0;k<6;k++) setTimeout(()=>{ sfx.whoosh(); battle.shakeEnemy=.1; },k*280); },
    1700,()=>{ pose(fx,'expr',.9); scene('blow',.9,{}); sfx.spray(); },
    800,()=>{ sfx.ding(); battle.flashEnemy=.3; scene('sparkles',1.0,{x:GX,y:GY+30,n:14}); bt('FRESH SET',96,34,PINK,3,1); hit(E2); },
    400,()=>{ bt('DO NOT SMUDGE',96,52,CREAM,2,1); },
    900,E2.result+' Pink. Sparkly. Still wet.',()=>checkEnemy()); };

// RUNWAY WALK (5 MP): lights down, catwalk on, cameras flashing, she struts, hits the pose, and the pose hits the Grump.
G.runway=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Lights down. Grace is walking the runway. Walk, walk, pose.'); say('grace','runway',.2); scene('dark',4.2,{a:.6,back:true}); scene('runway',4.0,{back:true}); appr(fx,3.6); sfx.charge(); },
    700,()=>{ scene('flashes',2.4,{n:18}); for(let k=0;k<9;k++) setTimeout(()=>sfx.click(),k*230); },
    1200,()=>{ pose(fx,'celeb',.8); sfx.beat(); bt('WALK',96,34,CREAM,3,.6); },
    700,()=>{ pose(fx,'expr',.7); sfx.beat(); bt('WALK',96,34,CREAM,3,.6); },
    700,()=>{ pose(fx,'celebFlip',.8); sfx.beat(); scene('werk',1.0,{x:gpos().cx,y:gpos().base-gpos().h-20}); bt('POSE',96,34,PINK,4,.8); scene('flashes',.7,{n:10}); sfx.click(); sfx.click(); },
    600,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; battle.flashEnemy=.4; sfx.thud(); scene('burst',.5,{x:214,y:212,c:PINK,c2:GOLD}); bt('WERK',96,34,GOLD,4,1); hit(E2); },
    800,E2.result+' The Grump was not dressed for this.',()=>checkEnemy()); };

// DANCE BATTLE (6 MP, level 2): a boombox drops in, she dances, the Grump tries, the judges are not kind to the Grump.
G.dancebattle=E2=>{ const {fx}=E2; const p=gpos();
  enqueue(()=>{ setMessage('Grace calls a dance battle. A boombox drops in from somewhere.'); say('grace','dancebattle',.2); scene('boombox',4.6,{x:p.cx-110,y:p.base-20,back:true}); sfx.thud(); },
    500,()=>{ fx.twirl=2.2; sfx.dance(); for(let k=0;k<8;k++) setTimeout(()=>sfx.beat(),k*270); for(let k=0;k<6;k++) scene('note',.9,{x:p.cx-40+(k%3)*30,y:p.base-90,delay:k*.3}); },
    1100,()=>{ battle.enemyWobble=1.2; bt('YOUR TURN',96,34,CREAM,2,.9); },
    1200,()=>{ scene('scorecards',1.6,{cards:[{t:'10',c:GOLD},{t:'2',c:'#8fb07a'},{t:'10',c:GOLD}]}); sfx.ding(); },
    900,()=>{ fx.roundoff=.6; sfx.whoosh(); },
    500,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; sfx.thud(); scene('burst',.5,{x:214,y:212,c:PURP,c2:PINK2}); bt('YOU LOSE',96,34,GOLD,3,1); hit(E2); },
    800,E2.result+' The Grump got a 2. It was generous.',()=>checkEnemy()); };

// LIKE AND SUBSCRIBE (7 MP, level 3): she goes live. The like, the subscribe button and the bell all land on the Grump. It goes viral.
G.subscribe=E2=>{ const {fx,dmg,crit}=E2; const a=Math.max(1,Math.floor(dmg*.3)),b=Math.max(1,Math.floor(dmg*.3)),c=Math.max(1,dmg-a-b);
  enqueue(()=>{ setMessage('Grace goes live. Hey guys. Welcome back to the channel.'); say('grace','subscribe',.2); scene('recframe',5.2,{views:1000000}); sfx.beep(); pose(fx,'expr',1.2); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('thumb',h.x,h.y,GX-10,200,0,.5,70); sfx.whoosh(); setTimeout(()=>{ battle.slash=.2; sfx.bonk(); scene('burst',.4,{x:GX-10,y:200,c:'#9fe8ff',c2:CREAM}); bt('LIKE',96,34,'#9fe8ff',3,.8); landHit(a,false); },500); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('subbtn',h.x,h.y,GX+10,206,0,.5,70,{spin:false}); sfx.whoosh(); setTimeout(()=>{ battle.slash=.2; sfx.bonk(); battle.shakeEnemy=.4; scene('burst',.4,{x:GX+10,y:206,c:'#ff8a7a',c2:CREAM}); bt('SUBSCRIBE',96,34,'#ff8a7a',3,.8); landHit(b,false); },500); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('bell',h.x,h.y,GX,196,0,.5,80); sfx.whoosh(); setTimeout(()=>{ sfx.ding(); battle.flashEnemy=.4; battle.enemyKnock=.45; scene('ring',.6,{x:GX,y:264,r:110,c:GOLD}); scene('burst',.5,{x:GX,y:196,c:GOLD,c2:CREAM}); bt('DING',96,34,GOLD,4,.9); landHit(c,crit); },500); },
    900,()=>{ sfx.levelChime(); scene('confetti',1.6,{n:40}); bt('VIRAL',96,30,PINK,4,1.2); pose(fx,'celeb',1.2); },
    1200,E2.result+' One million views. The Grump is in the comments.',()=>checkEnemy()); };

// BEAM DISMOUNT (8 MP, level 4): the beam rises, she mounts it, flies off, lands on the Grump, and the judges all agree.
G.beam=E2=>{ const {fx}=E2; const p=Object.assign({},gpos());
  enqueue(()=>{ setMessage('A balance beam rises out of the grass. Grace mounts. Full routine.'); say('grace','beam',.2); scene('beamapp',4.4,{p,back:true}); sfx.slideWhistle(); },
    700,()=>{ pose(fx,'celeb',.5); sfx.whoosh(); },
    500,()=>{ pose(fx,'celebFlip',.5); sfx.whoosh(); },
    500,()=>{ fx.dismount=1.5; sfx.jumpWhistle(); scene('sparkles',1.5,{follow:true,n:12}); },
    900,()=>{ battle.enemyKnock=.45; battle.shakeEnemy=.5; sfx.thud(); scene('ring',.6,{x:GX,y:264,r:110,c:GOLD}); scene('dust',.6,{x:GX,y:262,n:8,sp:24,up:18}); bt('STUCK IT',96,34,GOLD,3,.9); hit(E2); },
    600,()=>{ scene('scorecards',1.8,{cards:['10','10','10']}); sfx.ding(); scene('confetti',1.5,{n:30}); },
    1500,E2.result+' The judges are standing.',()=>checkEnemy()); };

// PERFECT 10 (10 MP, level 5): everything at once. Spotlight, tumbling pass, cameras, dance break, the squishy, the flip kick, all tens.
G.perfect10=E2=>{ const {fx,dmg,crit}=E2; const per=Math.max(1,Math.floor(dmg/5)),last=Math.max(1,dmg-per*3); const p=Object.assign({},gpos());
  enqueue(()=>{ setMessage('Grace takes the floor. Spotlight. Music. Every single thing she knows.'); say('grace','perfect10',.2); scene('dark',7.4,{a:.55,back:true}); scene('spot',7.2,{follow:true,back:true}); scene('boombox',7.0,{x:p.cx-120,y:p.base-20,back:true}); sfx.thud(); },
    500,()=>{ appr(fx,6.4); fx.cartwheel=.9; sfx.whoosh(); scene('sparkles',6.2,{follow:true,n:12}); },
    900,()=>{ fx.handspring=.8; sfx.whoosh(); scene('flashes',1.2,{n:10}); for(let k=0;k<4;k++) setTimeout(()=>sfx.click(),k*200); },
    800,()=>{ fx.punch=.4; pose(fx,'act',.4); battle.slash=.2; sfx.bonk(); landHit(per,false); bt('ONE',96,34,CREAM,3,.6); },
    500,()=>{ fx.twirl=1.2; sfx.dance(); for(let k=0;k<4;k++) setTimeout(()=>sfx.beat(),k*270); },
    1200,()=>{ pose(fx,'act',.5); const h=hand(); toss('squishy',h.x-6,h.y-6,GX+6,206,0,.5,90,{spin:false}); sfx.whoosh(); setTimeout(()=>{ sfx.splat(); battle.shakeEnemy=.4; scene('dust',.5,{x:GX,y:262,n:6,sp:20,up:16,c:'#ffd6ea',c2:'#fff0f6'}); landHit(per,false); bt('TWO',96,34,CREAM,3,.6); },500); },
    1100,()=>{ fx.roundoff=.6; sfx.whoosh(); setTimeout(()=>sfx.whoosh(),250); },
    600,()=>{ fx.rebound=.45; sfx.bonk(); landHit(per,false); bt('THREE',96,34,CREAM,3,.6); },
    600,()=>{ fx.flip=.8; sfx.jumpWhistle(); },
    800,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; battle.flashEnemy=.5; sfx.thud(); scene('flash',.5,{a:.6}); scene('burst',.6,{x:GX,y:GY,r:80,n:14,c:PINK,c2:GOLD}); scene('ring',.7,{x:GX,y:264,r:130,c:GOLD}); landHit(last,crit); },
    500,()=>{ scene('scorecards',2.2,{cards:['10','10','10']}); sfx.levelChime(); scene('confetti',2.0,{n:50}); scene('flashes',1.6,{n:14}); for(let k=0;k<6;k++) setTimeout(()=>sfx.click(),k*180); bt('PERFECT 10',96,30,GOLD,4,1.4); pose(fx,'celeb',1.6); },
    1800,E2.result+' Gold medal. One million views. The Grump needs a minute.',()=>checkEnemy()); };
})();
