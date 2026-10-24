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
RFX.gDumpling=(...a)=>dumpling(...a); RFX.gStar=(...a)=>star(...a);   // for the Option 3 kit below
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
  enqueue(()=>{ setMessage('Grace pulls out the sparkling diamond gold soup dumpling. Squeeze. Squeeze. SQUEEZE.'); say('grace','squishy',.2); pose(fx,'expr',1.6); scene('squish',1.6,{}); for(let k=0;k<3;k++) b7Later(()=>sfx.squeak(),260+k*520); },
    1650,()=>{ fx.punch=.5; pose(fx,'act',.5); const h=hand(); toss('squishy',h.x-6,h.y-6,GX+6,206,0,.6,90,{spin:false}); sfx.whoosh(); },
    620,()=>{ sfx.splat(); sfx.thud(); battle.shakeEnemy=.5; scene('ring',.6,{x:GX,y:264,r:110,c:PINK2}); scene('dust',.6,{x:GX,y:262,n:8,sp:22,up:18,c:'#ffd6ea',c2:'#fff0f6'}); scene('squishland',2.3,{}); bt('SPLAT',96,34,PINK,3,.9); hit(E2); },
    1100,()=>{ sfx.squeak(); },
    1000,E2.result+' The squishy is still rising. Very slowly.',()=>checkEnemy()); };

// GLITTER NAILS (4 MP): a fresh coat of glitter polish, painted right onto the Grump, then she blows on it. Do not smudge.
G.polish=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace opens the glitter polish. The Grump is getting a full set.'); say('grace','polish',.2); appr(fx,3.2); scene('polishhand',3.0,{}); },
    900,()=>{ pose(fx,'act',1.4); scene('strokes',2.6,{}); for(let k=0;k<6;k++) b7Later(()=>{ sfx.whoosh(); battle.shakeEnemy=.1; },k*280); },
    1700,()=>{ pose(fx,'expr',.9); scene('blow',.9,{}); sfx.spray(); },
    800,()=>{ sfx.ding(); battle.flashEnemy=.3; scene('sparkles',1.0,{x:GX,y:GY+30,n:14}); bt('FRESH SET',96,34,PINK,3,1); hit(E2); },
    400,()=>{ bt('DO NOT SMUDGE',96,52,CREAM,2,1); },
    900,E2.result+' Pink. Sparkly. Still wet.',()=>checkEnemy()); };

// RUNWAY WALK (5 MP): lights down, catwalk on, cameras flashing, she struts, hits the pose, and the pose hits the Grump.
G.runway=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Lights down. Grace is walking the runway. Walk, walk, pose.'); say('grace','runway',.2); scene('dark',4.2,{a:.6,back:true}); scene('runway',4.0,{back:true}); appr(fx,3.6); sfx.charge(); },
    700,()=>{ scene('flashes',2.4,{n:18}); for(let k=0;k<9;k++) b7Later(()=>sfx.click(),k*230); },
    1200,()=>{ pose(fx,'celeb',.8); sfx.beat(); bt('WALK',96,34,CREAM,3,.6); },
    700,()=>{ pose(fx,'expr',.7); sfx.beat(); bt('WALK',96,34,CREAM,3,.6); },
    700,()=>{ pose(fx,'celebFlip',.8); sfx.beat(); scene('werk',1.0,{x:gpos().cx,y:gpos().base-gpos().h-20}); bt('POSE',96,34,PINK,4,.8); scene('flashes',.7,{n:10}); sfx.click(); sfx.click(); },
    600,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; battle.flashEnemy=.4; sfx.thud(); scene('burst',.5,{x:214,y:212,c:PINK,c2:GOLD}); bt('WERK',96,34,GOLD,4,1); hit(E2); },
    800,E2.result+' The Grump was not dressed for this.',()=>checkEnemy()); };

// DANCE BATTLE (6 MP, level 2): a boombox drops in, she dances, the Grump tries, the judges are not kind to the Grump.
G.dancebattle=E2=>{ const {fx}=E2; const p=gpos();
  enqueue(()=>{ setMessage('Grace calls a dance battle. A boombox drops in from somewhere.'); say('grace','dancebattle',.2); scene('boombox',4.6,{x:p.cx-110,y:p.base-20,back:true}); sfx.thud(); },
    500,()=>{ fx.twirl=2.2; sfx.dance(); for(let k=0;k<8;k++) b7Later(()=>sfx.beat(),k*270); for(let k=0;k<6;k++) scene('note',.9,{x:p.cx-40+(k%3)*30,y:p.base-90,delay:k*.3}); },
    1100,()=>{ battle.enemyWobble=1.2; bt('YOUR TURN',96,34,CREAM,2,.9); },
    1200,()=>{ scene('scorecards',1.6,{cards:[{t:'10',c:GOLD},{t:'2',c:'#8fb07a'},{t:'10',c:GOLD}]}); sfx.ding(); },
    900,()=>{ fx.roundoff=.6; sfx.whoosh(); },
    500,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; sfx.thud(); scene('burst',.5,{x:214,y:212,c:PURP,c2:PINK2}); bt('YOU LOSE',96,34,GOLD,3,1); hit(E2); },
    800,E2.result+' The Grump got a 2. It was generous.',()=>checkEnemy()); };

// LIKE AND SUBSCRIBE (7 MP, level 3): she goes live. The like, the subscribe button and the bell all land on the Grump. It goes viral.
G.subscribe=E2=>{ const {fx,dmg,crit}=E2; const a=Math.max(1,Math.floor(dmg*.3)),b=Math.max(1,Math.floor(dmg*.3)),c=Math.max(1,dmg-a-b);
  enqueue(()=>{ setMessage('Grace goes live. Hey guys. Welcome back to the channel.'); say('grace','subscribe',.2); scene('recframe',5.2,{views:1000000}); sfx.beep(); pose(fx,'expr',1.2); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('thumb',h.x,h.y,GX-10,200,0,.5,70); sfx.whoosh(); b7Later(()=>{ battle.slash=.2; sfx.bonk(); scene('burst',.4,{x:GX-10,y:200,c:'#9fe8ff',c2:CREAM}); bt('LIKE',96,34,'#9fe8ff',3,.8); landHit(a,false); },500); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('subbtn',h.x,h.y,GX+10,206,0,.5,70,{spin:false}); sfx.whoosh(); b7Later(()=>{ battle.slash=.2; sfx.bonk(); battle.shakeEnemy=.4; scene('burst',.4,{x:GX+10,y:206,c:'#ff8a7a',c2:CREAM}); bt('SUBSCRIBE',96,34,'#ff8a7a',3,.8); landHit(b,false); },500); },
    1100,()=>{ pose(fx,'act',.5); const h=hand(); toss('bell',h.x,h.y,GX,196,0,.5,80); sfx.whoosh(); b7Later(()=>{ sfx.ding(); battle.flashEnemy=.4; battle.enemyKnock=.45; scene('ring',.6,{x:GX,y:264,r:110,c:GOLD}); scene('burst',.5,{x:GX,y:196,c:GOLD,c2:CREAM}); bt('DING',96,34,GOLD,4,.9); landHit(c,crit); },500); },
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
    900,()=>{ fx.handspring=.8; sfx.whoosh(); scene('flashes',1.2,{n:10}); for(let k=0;k<4;k++) b7Later(()=>sfx.click(),k*200); },
    800,()=>{ fx.punch=.4; pose(fx,'act',.4); battle.slash=.2; sfx.bonk(); landHit(per,false); bt('ONE',96,34,CREAM,3,.6); },
    500,()=>{ fx.twirl=1.2; sfx.dance(); for(let k=0;k<4;k++) b7Later(()=>sfx.beat(),k*270); },
    1200,()=>{ pose(fx,'act',.5); const h=hand(); toss('squishy',h.x-6,h.y-6,GX+6,206,0,.5,90,{spin:false}); sfx.whoosh(); b7Later(()=>{ sfx.splat(); battle.shakeEnemy=.4; scene('dust',.5,{x:GX,y:262,n:6,sp:20,up:16,c:'#ffd6ea',c2:'#fff0f6'}); landHit(per,false); bt('TWO',96,34,CREAM,3,.6); },500); },
    1100,()=>{ fx.roundoff=.6; sfx.whoosh(); b7Later(()=>sfx.whoosh(),250); },
    600,()=>{ fx.rebound=.45; sfx.bonk(); landHit(per,false); bt('THREE',96,34,CREAM,3,.6); },
    600,()=>{ fx.flip=.8; sfx.jumpWhistle(); },
    800,()=>{ fx.kick=.45; sfx.slash(); },150,()=>{ battle.slash=.22; battle.enemyKnock=.45; battle.flashEnemy=.5; sfx.thud(); scene('flash',.5,{a:.6}); scene('burst',.6,{x:GX,y:GY,r:80,n:14,c:PINK,c2:GOLD}); scene('ring',.7,{x:GX,y:264,r:130,c:GOLD}); landHit(last,crit); },
    500,()=>{ scene('scorecards',2.2,{cards:['10','10','10']}); sfx.levelChime(); scene('confetti',2.0,{n:50}); scene('flashes',1.6,{n:14}); for(let k=0;k<6;k++) b7Later(()=>sfx.click(),k*180); bt('PERFECT 10',96,30,GOLD,4,1.4); pose(fx,'celeb',1.6); },
    1800,E2.result+' Gold medal. One million views. The Grump needs a minute.',()=>checkEnemy()); };
})();

// ================= Option 3 Primary kit (phase 3b) =================
// Cards: adventures-of-tom-ability-revamp.md (Grace). Same beat plan as Tom's kit (tom-moves.js): beat 1 setup (0.5 s),
// beat 2 impact about 1.05 s in (inside the High-Five window, engine/feel.js B7_HF), beat 3 the small joke.
// Scenes drawn at real unit positions are in B2_NOWARP so the aim warp does not move them twice.
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const gpos=()=>battle.actorPos||{cx:462,base:279,h:78};
const hand=()=>{ const p=gpos(); return {x:p.cx-22,y:p.base-Math.round(p.h*.52)}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const home=u=>{ if(u.side==='foe') { const p=b2FoeCanvasPos(u); return {x:p.x,base:p.y,h:p.h}; } const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const top=()=>battle.enemyTop||150;
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const foesOf=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const box=list=>{ const P=list.map(f=>b2FoeCanvasPos(f)); if(!P.length) return {x0:GX-40,x1:GX+40,y0:GY-50,y1:GY+40};
  return {x0:Math.min(...P.map(p=>p.x-p.w/2)),x1:Math.max(...P.map(p=>p.x+p.w/2)),y0:Math.min(...P.map(p=>p.y-p.h)),y1:Math.max(...P.map(p=>p.y))}; };
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8';
const G=RECRUIT_MOVES.grace,star=RFX.gStar,dumpling=RFX.gDumpling;
const IMPACT=550;   // ms after beat 2 starts (beat 1 is 500)
const UI=1.05/1.8;  // where the impact sits in a 1.8 s scene started on beat 1
// B2_NOWARP lives in engine/battle2-ui.js, which loads after this file, so the names are added when a move first plays.
const NW_LIST=[];
const nowarp=(...k)=>NW_LIST.push(...k);
const NW=()=>{ if(typeof B2_NOWARP!=='undefined') for(const x of NW_LIST) B2_NOWARP.add(x); };
nowarp('g_heelspark','g_countmarks','g_footstep','g_consult','g_swatch','g_nail','g_ringhold','g_warmcircle','g_thumb','g_eight',
  'g_beams','g_toeloop','g_warmring','g_mat','g_matend','g_spots');

// ---------- Props ----------
PROP2.g_swatch=(q,u)=>{ R(-5,-14,10,28,OUT); R(-3,-12,6,24,q.c||PINK); R(-3,-12,6,5,CREAM); };

// ---------- Scenes ----------
// Heel Click: a click spark at her heels, then a shoe-shaped tap mark pops on the target.
SC.g_heelspark=(s,u)=>{ const p=gpos(),x=p.cx-4,y=p.base-2; gfx.globalAlpha=1-u; for(let k=0;k<5;k++) { const a=-Math.PI+k*Math.PI/4; Ln(x+Math.cos(a)*(6+u*10),y+Math.sin(a)*(6+u*10),x+Math.cos(a)*(10+u*16),y+Math.sin(a)*(10+u*16),2,GOLD); } };
SC.g_shoemark=(s,u)=>{ const x=GX+6,y=GY-14,pop=u<.25?ez(u/.25)*1.25:lerp(1.25,1,cl((u-.25)/.15)); gfx.globalAlpha=fade(u,.7); gfx.translate(x,y); gfx.rotate(-.35); gfx.scale(pop,pop);
  E(0,-6,12,16,OUT); E(0,-6,10,14,PINK); R(-7,10,14,10,OUT); R(-5,12,10,6,PINK); E(-3,-10,4,6,PINK2);
  gfx.rotate(.35); for(let k=0;k<3;k++) Ln(-26-k*2,-22+k*14,-34-k*2,-24+k*14,3,CREAM); };

// DANCE: four count marks on the floor in front of her; each ally gets one footstep and a pulse; the last mark is a heart.
SC.g_countmarks=(s,u)=>{ const p=gpos(),y=p.base+8; gfx.globalAlpha=fade(u,.88);
  for(let k=0;k<4;k++) { const x=p.cx-96+k*26,on=u>k*.07+.02,last=k===3&&u>.62;
    if(last) { const b=1+Math.sin(cl((u-.62)/.12)*Math.PI)*.3; E(x,y+2,13,5,OUT); heart(x,y-6,8*b,'#ff6b9a'); continue; }
    E(x,y,12,5,OUT); E(x,y,10,4,on?GOLD:'#8a7a90'); if(on&&u<.4) label(''+(k+5),x,y-18,CREAM,2); } };
SC.g_footstep=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=fade(u,.6); const d=ez(u/.2);
  E(x-8,y+2,6,3,OUT); E(x-8,y+2,4.5,2,PINK2); E(x+8,y+2-4*d,6,3,OUT); E(x+8,y+2-4*d,4.5,2,PINK2);
  ring(x,y-s.h*.45,26+u*22,34+u*26,3,'rgba(255,226,122,'+(.7*(1-u))+')'); };

// Dumpling Consult: the dumpling on a tiny formal cushion by the recipient, an appointment card, one squeeze, a debuff
// icon pushed away. s.x, s.y is the recipient's head.
SC.g_consult=(s,u)=>{ const x=s.x+(s.foe?40:-40),y=s.y-10-ez(u/.15)*8; gfx.globalAlpha=fade(u,.9);
  R(x-24,y+10,48,12,OUT); R(x-22,y+12,44,8,PURP); R(x-22,y+12,44,3,'#d6c0f2'); R(x-26,y+18,6,6,GOLD); R(x+20,y+18,6,6,GOLD);
  const sq=u>UI-.05&&u<UI+.14?Math.sin(cl((u-UI+.05)/.19)*Math.PI):0; dumpling(x,y-4,sq,.55);
  if(u<UI) { R(x+28,y-22,22,14,OUT); R(x+30,y-20,18,10,CREAM); R(x+30,y-20,18,3,PINK); label('APPT',x+39,y-17,'#2b2a26',1); }
  if(u>UI-.02&&u<UI+.3) { const q=ez((u-UI+.02)/.25),ix=x+(s.foe?-1:1)*(18+q*40),iy=y-30-q*16; gfx.globalAlpha*=1-q; R(ix-7,iy-7,14,14,OUT); R(ix-5,iy-5,10,10,'#9aa3c8'); Ln(ix,iy-3,ix,iy+3,2,'#2b2a26'); Ln(ix-3,iy+1,ix,iy+4,2,'#2b2a26'); Ln(ix+3,iy+1,ix,iy+4,2,'#2b2a26'); }
  if(u>.78) { gfx.globalAlpha=fade(u,.9); heart(s.x,s.y-24,5,'#ff6b9a'); } };

// Glitter Check-In: a fan of swatches like an operations chart; each recipient gets a nail-shaped shield and a check.
SC.g_swatch=(s,u)=>{ const p=hand(),x=p.x-6,y=p.y-20,open=ez(u/.25); gfx.globalAlpha=fade(u,.8); const C=[PINK,PURP,GOLD,'#9fe8ff','#9be39a'];
  for(let k=0;k<5;k++) { gfx.save(); gfx.translate(x,y+10); gfx.rotate((k-2)*.32*open-.2); R(-5,-34,10,30,OUT); R(-3,-32,6,26,C[k]); R(-3,-32,6,5,CREAM); gfx.restore(); }
  E(x,y+10,4,4,OUT); E(x,y+10,2,2,GOLD); };
SC.g_nail=(s,u)=>{ const x=s.x,y=s.y,g=ez(u/.2); gfx.globalAlpha=fade(u,.75); gfx.translate(x,y); gfx.scale(g,g);
  R(-11,-6,22,24,OUT); E(0,-6,11,10,OUT); R(-9,-6,18,22,'#ffe27a'); E(0,-6,9,8,'#ffe27a'); R(-6,-8,5,16,CREAM);
  const gl=(s.t*2)%1; star(6,-10+gl*20,2+gl*2,CREAM); if(u>.3) check(16,-14,4,'#9be39a'); };

// Ring-Light Rescue: she holds a ring light with a COLD dial and clicks it to WARM; a warm circle on the recipient,
// amber flakes falling out of it.
SC.g_ringhold=(s,u)=>{ const p=hand(),x=p.x-18,y=p.y-34,warm=u>UI; gfx.globalAlpha=env(u,.06,.85);
  R(x-2,y+20,4,20,OUT); R(x-1,y+21,2,18,'#6a6f7a');
  ring(x,y,18,18,8,OUT); ring(x,y,18,18,5,warm?'#ffb45a':'#9fd0ff'); if(warm) { gfx.globalAlpha*=.35; E(x,y,15,15,'#ffd27a'); gfx.globalAlpha=env(u,.06,.85); }
  R(x+22,y-8,30,14,OUT); R(x+24,y-6,26,10,CREAM); label(warm?'WARM':'COLD',x+37,y-3,warm?'#c2561e':'#2f6fb0',1);
  if(u>UI-.03&&u<UI+.06) label('CLICK',x,y-34,GOLD,1); };
SC.g_warmcircle=(s,u)=>{ const x=s.x,y=s.y,r=ez(u/.2); gfx.globalAlpha=fade(u,.7);
  E(x,y,40*r,52*r,'rgba(255,170,80,.22)'); ring(x,y,40*r,52*r,4,'#ffb45a');
  for(let k=0;k<6;k++) { const fx2=x-24+k*10,fy=y-30+u*70+(k%2)*10; gfx.globalAlpha=fade(u,.7)*(1-u); R(fx2,fy,4,4,'#e8b048'); }
  gfx.globalAlpha=fade(u,.7); if(u>.45) { label('WARM',x,y-s.h*.55-8,'#ffb45a',1); } };

// Comment Moderation: a jagged rude bubble by the target; she pinches it into a little recycling square that snaps
// onto the enemy; a polite COMMENTS PAUSED card replaces it. Warped with the target.
SC.g_rude=(s,u)=>{ const x=GX+44,y=top()-24; gfx.globalAlpha=fade(u,.9);
  if(u<UI-.06) { const g=ez(u/.15),w=40*g,h=22*g,pts=[]; for(let k=0;k<12;k++) { const a=k/12*Math.PI*2,r=k%2?1:1.25; pts.push([x+Math.cos(a)*w*r,y+Math.sin(a)*h*r]); }
    gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(const q of pts) gfx.lineTo(q[0],q[1]); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#ffb0a0'; gfx.fill();
    gfx.beginPath(); gfx.moveTo(x-12,y+h); gfx.lineTo(x-26,y+h+14); gfx.lineTo(x-2,y+h); gfx.closePath(); gfx.fillStyle='#ffb0a0'; gfx.fill(); if(g>.8) label('#!*&',x,y-4,'#7a1a14',2); return; }
  if(u<UI+.12) { const q=ez((u-UI+.06)/.18),sx=lerp(x,GX,q),sy=lerp(y,GY-20,q),w=lerp(16,10,q); R(sx-w-2,sy-w-2,w*2+4,w*2+4,OUT); R(sx-w,sy-w,w*2,w*2,'#9be39a');
    Ln(sx-w*.5,sy,sx+w*.4,sy-w*.5,2,'#2f6b3a'); Ln(sx+w*.4,sy-w*.5,sx+w*.2,sy+w*.5,2,'#2f6b3a'); Ln(sx+w*.2,sy+w*.5,sx-w*.5,sy,2,'#2f6b3a'); return; }
  const c=ez((u-UI-.12)/.1); R(x-34,y-12,68*c+.1,26,OUT); if(c>.9) { R(x-32,y-10,64,22,CREAM); R(x-32,y-10,64,4,'#9aa3c8'); label('COMMENTS',x,y-4,'#2b2a26',1); label('PAUSED',x,y+4,'#2b2a26',1); } };

// Thumbnail Face: a tiny reaction frame by Grace with a surprised face stretches until it bonks across the row; a WOW
// arrow points at the least impressive bit of floor.
SC.g_thumb=(s,u)=>{ const p=gpos(),B=box(s.foes||[]),g=ez(cl((u-.25)/(UI-.25)));
  const x0=lerp(p.cx-70,B.x0-12,g),x1=lerp(p.cx-30,B.x1+12,g),y0=lerp(p.base-p.h-22,B.y0-12,g),y1=lerp(p.base-p.h+8,B.y1+8,g);
  gfx.globalAlpha=fade(u,.85)*(u>UI+.1?.8:1);
  if(u<UI+.1) { gfx.strokeStyle=OUT; gfx.lineWidth=8; gfx.strokeRect(x0,y0,x1-x0,y1-y0); gfx.strokeStyle='#e0402e'; gfx.lineWidth=4; gfx.strokeRect(x0,y0,x1-x0,y1-y0);
    const cx=(x0+x1)/2,cy=(y0+y1)/2,k=lerp(.4,2.2,g); E(cx-10*k,cy-6*k,3*k,4*k,OUT); E(cx+10*k,cy-6*k,3*k,4*k,OUT); E(cx,cy+8*k,5*k,7*k,OUT); E(cx,cy+8*k,3.5*k,5*k,'#7a1a14');
    R(x1-26,y0+4,22,10,'#e0402e'); label('REC',x1-15,y0+6,CREAM,1); }
  if(u>UI+.1) { const fx2=B.x0-26,fy=B.y1+16; LnO(fx2-34,fy-26,fx2-6,fy-4,4,GOLD); LnO(fx2-6,fy-4,fx2-16,fy-6,4,GOLD); LnO(fx2-6,fy-4,fx2-8,fy-14,4,GOLD); label('WOW',fx2-44,fy-40,GOLD,2); R(fx2-3,fy-2,4,3,'#8a7a6a'); } };

// Eight-Count Reset: eight stepping dots over her; the target's buff icon bobs off-beat, one exact step hooks it over
// to her; the eighth count lands with a pointed finger.
SC.g_eight=(s,u)=>{ const p=gpos(),cx=p.cx+24,cy=p.base-p.h-26; gfx.globalAlpha=fade(u,.88);
  for(let k=0;k<8;k++) { const a=Math.PI*(1.1+k*.115),x=cx+Math.cos(a)*48,y=cy+Math.sin(a)*22+20,on=k<7?u>k*.07:u>UI+.18;
    E(x,y,5,5,OUT); E(x,y,3.5,3.5,on?(k===7?PINK:GOLD):'#6a6a7a'); }
  if(u>UI+.18) { label('8',cx+52,cy-12,PINK,2); }
  const t=s.foe?home(s.foe):{x:GX,base:GY+30,h:80},sx=t.x,sy=t.base-t.h-18,q=ez(cl((u-UI+.08)/.22)),bob=u<UI-.08?Math.sin(s.t*7.3)*5:0;
  const x=lerp(sx,p.cx-20,q),y=lerp(sy+bob,p.base-p.h-4,q)-Math.sin(q*Math.PI)*30; if(u<UI+.3) { R(x-9,y-9,18,18,OUT); R(x-7,y-7,14,14,'#9be39a'); Ln(x,y+4,x,y-4,2,'#1d4a2a'); Ln(x-3,y-1,x,y-4,2,'#1d4a2a'); Ln(x+3,y-1,x,y-4,2,'#1d4a2a'); } };

// Balance-Beam Borders: two low beams slide in around the row and clap inward with a padded bonk.
SC.g_beams=(s,u)=>{ const B=box(s.foes||[]),slide=ez(u/.28),clap=u>UI-.04&&u<UI+.12?Math.sin(cl((u-UI+.04)/.16)*Math.PI):0,gap=lerp(16,4,clap);
  gfx.globalAlpha=fade(u,.86); const w=B.x1-B.x0+60,x=lerp(-w-20,B.x0-30,slide);
  const beam=y=>{ R(x,y-6,w,12,OUT); R(x+2,y-4,w-4,8,'#e8cfa0'); R(x+2,y-4,w-4,3,'#f6e6c4'); for(const lx of [x+16,x+w-20]) { R(lx,y+6,6,10,OUT); R(lx+1,y+6,4,9,'#8a5a30'); } };
  beam(B.y0-gap); beam(B.y1+gap); if(clap>.5) label('BONK',(B.x0+B.x1)/2,B.y0-gap-26,GOLD,2); };

// Warm-Up Lap: she draws a little looping route with one toe; it turns into a warm ring under each friend.
SC.g_toeloop=(s,u)=>{ const p=gpos(),x=p.cx-30,y=p.base+6,d=ez(u/.35); gfx.globalAlpha=fade(u,.6);
  gfx.strokeStyle=GOLD; gfx.lineWidth=3; gfx.beginPath(); gfx.ellipse(x,y,18,6,0,0,Math.PI*2*d); gfx.stroke();
  if(d>.95) { R(x+16,y-4,6,3,GOLD); R(x+18,y-1,3,3,GOLD); } };
SC.g_warmring=(s,u)=>{ const x=s.x,y=s.y,g=ez(u/.25); gfx.globalAlpha=fade(u,.7);
  E(x,y,30*g,9*g,'rgba(255,170,80,.35)'); ring(x,y,30*g,9*g,3,'#ffb45a');
  for(let k=0;k<4;k++) { const a=s.t*4+k*Math.PI/2; R(x+Math.cos(a)*28*g-2,y+Math.sin(a)*8*g-2,4,4,CREAM); } };

// Mat Patrol: a coach clap, a rolled mat unspools under the target and cushions its startled drop; the spare padded
// end curls beside the most hurt friend.
SC.g_mat=(s,u)=>{ const T=s.foe?home(s.foe):{x:GX,base:GY+44,h:80},MX=T.x,y=T.base,go=ez(u/(UI-.02)),x=lerp(MX+150,MX,go); gfx.globalAlpha=fade(u,.88);
  const flat=cl((u-UI+.08)/.12);
  if(flat<1) { const r=lerp(16,6,flat); E(x,y-r,r+2,r+2,OUT); E(x,y-r,r,r,'#4f86d8'); ring(x,y-r,r*.55,r*.55,2,'#9fc4f0'); }
  if(flat>0) { const w=110*flat; R(MX-w/2-2,y-8,w+4,12,OUT); R(MX-w/2,y-6,w,8,'#4f86d8'); for(let k=1;k<4;k++) R(MX-w/2+k*w/4,y-6,2,8,'#3a68b0'); }
  if(u>UI+.1&&u<UI+.3) label('PADDED',MX,y-T.h-30,'#9fc4f0',2); };
SC.g_matend=(s,u)=>{ const x=s.x-26,y=s.base,g=ez(u/.3); gfx.globalAlpha=fade(u,.8);
  R(x-12,y-6,24*g+.1,8,OUT); R(x-10,y-4,20*g+.1,4,'#4f86d8'); if(g>.9) { E(x+12,y-10,8,8,OUT); E(x+12,y-10,6,6,'#4f86d8'); ring(x+12,y-10,3,3,2,'#9fc4f0'); } };

// Spotlight Shuffle: three light circles hop across the row like a shell game, then snap into bright impact squares;
// Grace stays centered in the one light that did not move.
SC.g_spots=(s,u)=>{ const F=s.foes&&s.foes.length?s.foes:[],p=gpos(); gfx.globalAlpha=fade(u,.86);
  gfx.save(); gfx.globalAlpha*=.4; E(p.cx-4,p.base+4,28,8,'#fff6dc'); gfx.restore();
  const B=box(F),y=B.y1+6;
  if(u<UI) { for(let k=0;k<3;k++) { const ph=(u/UI)*3+k,i=Math.floor(ph)%3,j=(i+1)%3,q=ez(ph%1),xi=lerp(B.x0,B.x1,i/2),xj=lerp(B.x0,B.x1,j/2);
      const x=lerp(xi,xj,q),hop=Math.sin(q*Math.PI)*16; gfx.save(); gfx.globalAlpha*=.6; E(x,y-hop,22,7,'#fff6dc'); gfx.restore(); ring(x,y-hop,22,7,2,GOLD); } return; }
  const q=ez(cl((u-UI)/.08)); for(const f of F) { const c=b2FoeCanvasPos(f),r=lerp(8,26,q),cy=c.y-c.h*.5; gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.strokeRect(c.x-r,cy-r,r*2,r*2); gfx.strokeStyle=GOLD; gfx.lineWidth=4; gfx.strokeRect(c.x-r,cy-r,r*2,r*2); }
  if(u>UI+.12) label('WRONG MARK',(B.x0+B.x1)/2,B.y0-26,GOLD,1); };

// ---------- Moves ----------
G.heel_click=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace finds her mark.'); say('grace','heel_click'); pose(fx,'expr',.5); },
    500,()=>{ scene('g_heelspark',.4,{}); sfx.click(); b7Later(()=>sfx.click(),120); },
    IMPACT,()=>{ scene('g_shoemark',.9,{}); pose(fx,'act',.4); sfx.bonk(); battle.shakeEnemy=.3; hit(E2); },
    350,()=>{ pose(fx,'celeb',.6); bt('EYES HERE',150,40,PINK2,1,.9); },
    400,res(E2)+'It was standing in the wrong spot.',()=>checkEnemy()); };
G.danceShow=E2=>{ const {m,fx}=E2;
  enqueue(()=>{ setMessage('Grace makes room in the routine.'); say('grace','dance'); scene('g_countmarks',1.9,{}); for(let k=0;k<4;k++) b7Later(()=>sfx.click(),k*110); },
    500,()=>{ fx.twirl=1.0; sfx.dance(); for(const p of b2LiveParty()) { const h=home(p); scene('g_footstep',.9,{x:h.x,y:h.base,h:h.h}); } },
    IMPACT,()=>{ E2.apply(); sfx.ding(); bt('DANCE BREAK',96,24,GOLD,3,1.1); },
    500,()=>{ pose(fx,'expr',.5); for(const p of b2LiveParty()) if(p!==m) battle.fx[p.idx].hop=.3; },
    300,'Everyone finishes on the count. Even the late one.',()=>checkEnemy()); };
G.dumpling_consult=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Grace seats the gold dumpling on a tiny consultation cushion.'); say('grace','dumpling_consult'); scene('g_consult',1.8,{x:h.x,y:h.base-h.h,foe:t.side==='foe'}); pose(fx,'expr',.9); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); sfx.squeak(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'The consultation is extremely sparkly.'),()=>checkEnemy()); };
G.glitter_checkin=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),rose=who.find(u=>u.id==='rose');
  enqueue(()=>{ setMessage('Grace opens a fan of glitter swatches. This is a tactical decision.'); say('grace','glitter_checkin'); scene('g_swatch',1.7,{}); },
    500,()=>{ const p=hand(); if(rose) { const h=home(rose); toss('g_swatch',p.x-6,p.y-30,h.x,h.base-h.h*.55,0,.4,40,{c:PINK}); } sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); for(const u of who) { const h=home(u); scene('g_nail',1.0,{x:h.x+(u.side==='foe'?30:-30),y:h.base-h.h*.55}); } sfx.ding(); },
    500,()=>{ for(const u of who) if(u.side==='party') battle.fx[u.idx].hop=.3; },
    300,who.some(u=>u.side==='foe')?kindLine(who.find(u=>u.side==='foe')):'Grace checks every hand twice.',()=>checkEnemy()); };
G.ringlight_rescue=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Grace holds up a ring light. The dial says COLD.'); say('grace','ringlight_rescue'); scene('g_ringhold',1.8,{}); pose(fx,'expr',.9); },
    500,()=>{ sfx.beep(); },
    IMPACT,()=>{ sfx.click(); scene('g_warmcircle',1.1,{x:h.x,y:h.base-h.h*.45,h:h.h}); E2.apply(); sfx.ding(); },
    500,()=>{ pose(fx,'celeb',.5); },
    300,kindLine(t,'The lighting is much kinder now.'),()=>checkEnemy()); };
G.comment_moderation=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('A rude comment pops up next to the enemy.'); say('grace','comment_moderation'); scene('g_rude',1.9,{}); sfx.beep(); },
    500,()=>{ pose(fx,'act',.5); sfx.whoosh(); },
    IMPACT,()=>{ sfx.click(); sfx.bonk(); battle.flashEnemy=.25; battle.shakeEnemy=.35; hit(E2); },
    500,()=>{ sfx.ding(); },
    300,res(E2)+'Grace removes the unhelpful comment.',()=>checkEnemy()); };
G.thumbnail_face=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace makes a small surprised face in a tiny frame.'); say('grace','thumbnail_face'); scene('g_thumb',1.9,{foes:foesOf(E2)}); pose(fx,'expr',1.0); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ sfx.bonk(); sfx.click(); battle.flashEnemy=.3; battle.shakeEnemy=.45; hit(E2); },
    500,()=>{ sfx.ding(); pose(fx,'celeb',.5); },
    300,res(E2)+'The reaction is slightly larger than necessary.',()=>checkEnemy()); };
G.eight_count=E2=>{ const {fx}=E2,t=foesOf(E2)[0];
  enqueue(()=>{ setMessage('Grace counts it out. The enemy is off the beat.'); say('grace','eight_count'); scene('g_eight',1.9,{foe:t}); for(let k=0;k<4;k++) b7Later(()=>sfx.beat(),k*130); },
    500,()=>{ pose(fx,'act',.6); sfx.whoosh(); },
    IMPACT,()=>{ sfx.bonk(); battle.slash=.18; battle.shakeEnemy=.35; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,res(E2)+'Grace borrows the good part.',()=>checkEnemy()); };
G.beam_borders=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Two low balance beams slide in around them.'); say('grace','beam_borders'); scene('g_beams',1.9,{foes:foesOf(E2)}); sfx.slideWhistle(); },
    500,()=>{ pose(fx,'celeb',.6); sfx.whoosh(); },
    IMPACT,()=>{ sfx.thud(); battle.shakeEnemy=.5; hit(E2); },
    500,()=>{ pose(fx,'expr',.5); },
    300,res(E2)+'The available wiggle room is precisely zero.',()=>checkEnemy()); };
G.warmup_lap=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty());
  enqueue(()=>{ setMessage('Grace draws a little loop with one toe. Warm-up time.'); say('grace','warmup_lap'); scene('g_toeloop',1.4,{}); pose(fx,'expr',.8); },
    500,()=>{ for(const u of who) { const h=home(u); scene('g_warmring',1.3,{x:h.x,y:h.base}); } sfx.whoosh(); },
    IMPACT,()=>{ E2.apply(); for(const u of who) if(u.side==='party') battle.fx[u.idx].hop=.25; sfx.ding(); },
    500,()=>{ pose(fx,'celeb',.5); },
    300,who.some(u=>u.side==='foe')?kindLine(who.find(u=>u.side==='foe')):'The warm-up has an unusually strict director.',()=>checkEnemy()); };
G.mat_patrol=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Grace spots the wind-up. One coach clap.'); say('grace','mat_patrol'); scene('g_mat',1.9,{foe:foesOf(E2)[0]}); sfx.click(); pose(fx,'act',.4); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ sfx.thud(); battle.enemyKnock=.35; battle.shakeEnemy=.45; hit(E2); },
    300,()=>{ E2.apply(); const g=B2.party.find(p=>p.st.brace&&p.st.brace.by===E2.m); if(g) { const h=home(g); scene('g_matend',1.2,{x:h.x,base:h.base}); } sfx.select(); },
    500,res(E2)+'The landing has been professionally padded.',()=>checkEnemy()); };
G.spotlight_shuffle=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Three spotlights start hopping around the floor.'); say('grace','spotlight_shuffle'); scene('g_spots',1.9,{foes:foesOf(E2)}); scene('dark',1.9,{a:.35,back:true}); },
    500,()=>{ pose(fx,'expr',.6); for(let k=0;k<3;k++) b7Later(()=>sfx.click(),k*140); },
    IMPACT,()=>{ sfx.ding(); sfx.bonk(); battle.flashEnemy=.35; battle.shakeEnemy=.45; hit(E2); },
    500,()=>{ pose(fx,'celeb',.6); },
    300,res(E2)+'The enemies have missed their entrance.',()=>checkEnemy()); };
// Every move registers the unwarped scenes first (see NW above).
for(const k of ['heel_click','danceShow','dumpling_consult','glitter_checkin','ringlight_rescue','comment_moderation','thumbnail_face',
  'eight_count','beam_borders','warmup_lap','mat_patrol','spotlight_shuffle']) { const f=G[k]; G[k]=E2=>{ NW(); return f(E2); }; }
})();

// ================= Option 3 set pieces (animation quality pass, 2026-10-24) =================
// Replaces the phase-3b animations above (1.6 s beats from her stance) with 3.5 to 5 s set pieces on engine/stage.js,
// the standard TNB's and Nara's moves use: Grace cartwheels, flips, balances and walks to friends, then goes home.
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix gr_.
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
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const G=RECRUIT_MOVES.grace,star=RFX.gStar,dumpling=RFX.gDumpling;
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8',BLUE='#4f86d8';
ST.nw('gr_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=30)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const rowSpot=(Gp,gap=50)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(314,Gp.base+6)});
const spotFor=(m,t,gap=26)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:u.base+3}; };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const GSP=()=>BATTLE_SPRITES.grace,GH=()=>GSP().idle.length*GSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-GH()*(st.sc||1)*.84+dy});
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const wheel=n=>u=>-u*Math.PI*2*n;   // n cartwheels (she faces left, so she turns counter-clockwise as she travels left)
const wheelR=n=>u=>u*Math.PI*2*n;

// ---------- Shared scenes ----------
SC.gr_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.gr_trail=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; if(ms<(s.from||0)||ms>(s.to||1e9)) return; (s.pts=s.pts||[]).push([st.x,st.y-GH()*.5,s.t]);
  for(const [x,y,t0] of s.pts) { const a=1-(s.t-t0)/.5; if(a<=0) continue; gfx.globalAlpha=a; star(x+Math.sin(t0*40)*10,y+Math.cos(t0*33)*14,2+a*3,[PINK,PURP,GOLD,CREAM][Math.floor(t0*20)%4]); } };
SC.gr_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); };
SC.gr_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.gr_dark=(s,u)=>{ gfx.globalAlpha=fin(u,.12)*fade(u,.85)*(s.a||.45); R(0,0,576,324,'#0a0814'); };
SC.gr_beam=(s,u)=>{ const a=fin(u,.15)*fade(u,.85)*.35; gfx.globalAlpha=a; gfx.fillStyle='#fff6c8'; gfx.beginPath(); gfx.moveTo(s.x-12,0); gfx.lineTo(s.x+12,0); gfx.lineTo(s.x+(s.w||46),s.y); gfx.lineTo(s.x-(s.w||46),s.y); gfx.closePath(); gfx.fill(); gfx.globalAlpha=a*1.6; E(s.x,s.y,s.w||46,9,'#fff6c8'); };

// ---------- Heel Click ----------
SC.gr_crowd=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.7); for(let k=0;k<5;k++) { const x=s.x+k*16,y=s.y+Math.abs(Math.sin(s.t*8+k))*-3; EO(x,y-14,6,6,'#3a3348'); R(x-7,y-8,14,10,'#3a3348'); } label('AUDIENCE',s.x+32,s.y-34,CREAM,1); };
SC.gr_heels=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=1-u; for(let k=0;k<6;k++) { const a=-Math.PI+k*Math.PI/5; Ln(x+Math.cos(a)*(6+u*12),y+Math.sin(a)*(6+u*12),x+Math.cos(a)*(10+u*20),y+Math.sin(a)*(10+u*20),2,GOLD); } if(u<.6) label('CLICK',x,y-22,GOLD,1); };
SC.gr_shoe=(s,u)=>{ const pop=u<.2?ez(u/.2)*1.3:lerp(1.3,1,cl((u-.2)/.15)); gfx.globalAlpha=fade(u,.7); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.35); gfx.scale(pop,pop);
  E(0,-6,12,16,OUT); E(0,-6,10,14,PINK); R(-7,10,14,10,OUT); R(-5,12,10,6,PINK); E(-3,-10,4,6,PINK2); gfx.restore(); };
G.heel_click=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30),me=ST.unit(m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'idle',rot:wheel(2),hop:20,hn:2,ns:true},{t:950,x:p.x,y:p.y,f:'idle'},{t:1050,f:'flip'},{t:1400,f:'expr'},{t:1550,f:'celeb',hop:14},{t:1750,f:'act',dx:u=>-ez(u/.4)*12},
    {t:2050,f:'celeb'},{t:2750,f:'runR'},{t:3400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace cartwheels in. Twice. She finds her mark.'); say(m.id,'heel_click'); scene('gr_trail',.95,{st}); sfx.whoosh(); b7Later(()=>sfx.whoosh(),450); }],
    [1050,()=>{ scene('gr_crowd',.75,{x:Math.min(470,me.x-30),y:316}); }],
    [1550,()=>{ sfx.click(); b7Later(()=>sfx.click(),120); scene('gr_heels',.5,{x:p.x,y:p.y-4}); }],
    ['hf',1800],
    [1800,()=>{ sfx.bonk(); ST.jolt(f,.3); scene('gr_shoe',.9,{x:F.x+4,y:F.mid}); landHit(100); }],
    [2050,()=>{ scene('gr_text',.9,{st,txt:'EYES HERE',c:PINK2}); sfx.ding(); }],
    [3500,'end',res(E2)+'It was standing in the wrong spot.']]); };

// ---------- DANCE ----------
SC.gr_marks=(s,u)=>{ const ms=s.t*1000,x0=s.x-48,y=s.y+8; gfx.globalAlpha=fade(u,.9);
  for(let k=0;k<4;k++) { const x=x0+k*32,on=ms>s.c0+k*200,last=k===3&&ms>s.heartAt;
    if(last) { const b=1+Math.sin(cl((ms-s.heartAt)/250)*Math.PI)*.35; E(x,y+2,13,5,OUT); heart(x,y-6,8*b,'#ff6b9a'); continue; }
    E(x,y,12,5,OUT); E(x,y,10,4,on?GOLD:'#8a7a90'); if(on&&ms<s.c0+k*200+400) label(''+(k+5),x,y-20,CREAM,2); } };
SC.gr_footstep=(s,u)=>{ const x=s.x,y=s.y,d=ez(u/.2); gfx.globalAlpha=fade(u,.6); E(x-8,y+2,6,3,OUT); E(x-8,y+2,4.5,2,PINK2); E(x+8,y+2-4*d,6,3,OUT); E(x+8,y+2-4*d,4.5,2,PINK2);
  ring(x,y-s.h*.45,26+u*22,34+u*26,3,'rgba(255,226,122,'+(.7*(1-u))+')'); };
G.danceShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const px=Math.round(U.reduce((a,q)=>a+q.x,0)/U.length)-30,py=Math.min(312,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+22);
  const late=party.find(p=>p.id==='rose'&&p!==m)||party.find(p=>p!==m);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:px<me.x?'run':'runR'},{t:700,x:px,y:py,f:'idle'},{t:750,f:(u,tt)=>Math.floor(u*8)%2?'celeb':'idle'},
    {t:1550,f:(u,tt)=>['celeb','flip','celebFlip','idle'][Math.floor(tt*9)%4],dx:u=>Math.sin(u*Math.PI*4)*20,hop:10,hn:4},{t:2450,f:'act'},{t:2950,f:'celeb',hop:16},{t:3300,f:px<me.x?'runR':'run'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace takes the floor in front of everyone. Dance break.'); say(m.id,'dance'); scene('gr_marks',3.0,{x:px,y:py,c0:750,heartAt:2450}); }],
    [750,()=>{ for(let k=0;k<4;k++) b7Later(()=>sfx.click(),k*200); setMessage('Five, six, seven, eight.'); }],
    [1550,()=>{ sfx.dance(); party.forEach((p,k)=>{ const q=ST.unit(p); scene('gr_footstep',.9,{x:q.x,y:q.base,h:q.h,delay:k*.18}); if(p!==m) b7Later(()=>{ battle.fx[p.idx].hop=.3; },k*180); }); }],
    ['hf',2450],
    [2450,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('gr_text',1.1,{x:px,y:py-110,txt:'DANCE BREAK',c:GOLD}); }],
    [2500,()=>{ if(late) { const q=ST.unit(late); scene('gr_text',1,{x:q.x,y:q.top-16,txt:'LATE',c:PINK}); battle.fx[late.idx].hop=.4; } }],
    [4100,'end','Everyone finishes on the count. Even the late one.']]); };

// ---------- Dumpling Consult ----------
SC.gr_consult=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=1;
  if(ms<P.seat||ms>P.back) { const h=hand(); dumpling(h.x-6,h.y-8,0,.45); return; }
  const x=P.cx,y=P.cy,a=fin((ms-P.seat)/1000,.2)*(ms>P.back-250?(P.back-ms)/250:1); gfx.globalAlpha=Math.max(0,a);
  R(x-24,y-2,48,12,OUT); R(x-22,y,44,8,PURP); R(x-22,y,44,3,'#d6c0f2'); R(x-26,y+6,6,6,GOLD); R(x+20,y+6,6,6,GOLD);
  const sq=ms>P.sq&&ms<P.sq+450?Math.pow(Math.abs(Math.sin(cl((ms-P.sq)/450)*Math.PI*2)),1.4):0; dumpling(x,y-16,sq,.6);
  if(ms<P.sq) { RO(x+28,y-36,22,12,CREAM); R(x+28,y-36,22,3,PINK); label('APPT',x+39,y-33,'#2b2a26',1); }
  if(ms>P.sq+300&&ms<P.sq+1100) { const q=ez((ms-P.sq-300)/800),ix=P.tx+q*30,iy=P.ty-q*40; gfx.globalAlpha*=1-q; RO(ix-6,iy-6,12,12,'#9aa3c8'); Ln(ix,iy-3,ix,iy+3,2,'#2b2a26'); } };
G.dumpling_consult=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'kneel'},{t:1500,f:'idle'},{t:1600,f:'act'},{t:2300,f:'expr',rot:u=>Math.sin(u*Math.PI*4)*.06},{t:2800,f:'celeb',hop:8},{t:3200,f:'idle'},{t:3500,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:1000,x:sp.x,y:sp.y,f:'kneel'},{t:1500,f:'idle'},{t:1600,f:'act',dx:u=>-ez(u)*6},{t:2300,f:'expr',rot:u=>Math.sin(u*Math.PI*4)*.06},{t:2800,f:'celeb',hop:8},
      {t:3100,f:'walkR',hop:3,hn:5},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const cx=self?sp.x-36:H.x+H.w*.5+4,cy=(self?sp.y:H.base)-4,end=self?3600:4200,plan={seat:self?500:1000,sq:1900,back:3100,cx,cy,tx:H.x,ty:H.top+10};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Grace consults the gold dumpling herself.':'Grace carries the gold dumpling over to '+t.name+'.'); say(m.id,'dumpling_consult'); scene('gr_consult',end/1000,{plan}); }],
    [plan.seat,()=>{ setMessage('She seats it on a tiny consultation cushion. It has an appointment card.'); sfx.select(); }],
    [1900,()=>{ for(let k=0;k<2;k++) b7Later(()=>sfx.squeak(),k*220); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.ding(); scene('gr_glow',.9,{x:H.x,y:H.mid,c:GOLD}); scene('gr_heart',1,{x:H.x,y:H.top-6}); hopOf(t!==m?t:null); }],
    [2400,()=>{ scene('gr_text',.9,{x:cx,y:cy-56,txt:'EXCELLENT ADVICE',c:GOLD,sc:1}); }],
    [end,'end',kindLine(t,'The consultation is extremely sparkly.')]]); };

// ---------- Glitter Check-In ----------
SC.gr_swatch=(s,u)=>{ const h=hand(),x=h.x-6,y=h.y-16,open=ez(u/.15); gfx.globalAlpha=fade(u,.94); const C=[PINK,PURP,GOLD,'#9fe8ff','#9be39a'];
  for(let k=0;k<5;k++) { gfx.save(); gfx.translate(x,y+10); gfx.rotate((k-2)*.32*open-.2); R(-5,-30,10,26,OUT); R(-3,-28,6,22,C[k]); R(-3,-28,6,5,CREAM); gfx.restore(); } E(x,y+10,4,4,OUT); E(x,y+10,2,2,GOLD); };
SC.gr_nail=(s,u)=>{ const g=ez(u/.2); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(g,g);
  R(-11,-6,22,24,OUT); E(0,-6,11,10,OUT); R(-9,-6,18,22,s.c||'#ffe27a'); E(0,-6,9,8,s.c||'#ffe27a'); R(-6,-8,5,16,CREAM); const gl=(s.t*2)%1; star(6,-10+gl*20,2+gl*2,CREAM); gfx.restore(); if(u>.25) check(s.x+16,s.y-14,4,'#9be39a'); };
G.glitter_checkin=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m);
  const order=foe?[foe]:who.filter(u=>u!==m).sort((a,b)=>(a.id==='rose'?-1:0)-(b.id==='rose'?-1:0));
  const K=[{t:0,x:'home',y:'home',f:'idle'}],visits=[]; let t=350,cx=me.x;
  for(const u of order) { const q=ST.unit(u),x=Math.min(560,q.x+q.w*.5+24),y=q.base+3; K.push({t,f:x<cx?'walk':'walkR',hop:3,hn:4}); t+=650; K.push({t,x,y,f:'act'}); visits.push([t,u]); if(foe) K.push({t:t+400,f:'celeb',hop:10,hn:2},{t:t+1000,f:'act'}); t+=foe?1100:350; cx=x; }
  if(!foe&&who.includes(m)) { K.push({t,f:me.x<cx?'walk':'walkR',hop:3,hn:4}); t+=650; K.push({t,x:'home',y:'home',f:'act'}); visits.push([t,m]); t+=350; }
  else { K.push({t,f:'walkR',hop:3,hn:4}); t+=700; K.push({t,x:'home',y:'home',f:'idle'}); }
  const last=visits.length?visits[visits.length-1][0]:t; K.push({t:Math.max(t,last+350),f:'celeb',hop:8},{t:Math.max(t,last+350)+400,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const C=[PINK,PURP,GOLD,'#9fe8ff'];
  ST.play(E2,[
    [0,()=>{ setMessage('Grace opens a fan of glitter swatches like an operations chart. Rounds.'); say(m.id,'glitter_checkin'); scene('gr_swatch',(last+300)/1000,{}); }],
    ...visits.map(([ms,u],k)=>[ms,()=>{ const q=ST.unit(u); scene('gr_nail',1.4,{x:q.x+(u.side==='foe'?30:-30),y:q.mid,c:u.id==='rose'?PINK:C[k%4]}); sfx.ding(); if(u!==m) hopOf(u);
      if(u.id==='rose'&&!foe) scene('gr_text',.9,{x:q.x,y:q.top-16,txt:'FIRST CHOICE',c:PINK,sc:1}); }]),
    ['hf',last],
    [last,()=>{ E2.apply(); sfx.heal(); }],
    [Math.max(last+800,K[K.length-1].t+100),'end',foe?kindLine(foe):'Grace checks every hand twice.']]); };

// ---------- Ring-Light Rescue ----------
SC.gr_ring=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,carry=ms<P.set||ms>P.fold;
  if(carry) { const h=hand(); x=h.x-10; y=h.y-26; } else { x=P.x; y=P.y; }
  const warm=ms>P.click&&!carry,sc=carry?.6:1; gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  RO(-2,20,4,carry?20:44,'#6a6f7a'); if(!carry) { Ln(-12,64,0,62,3,OUT); Ln(12,64,0,62,3,OUT); }
  ring(0,0,18,18,8,OUT); ring(0,0,18,18,5,warm?'#ffb45a':'#9fd0ff'); if(warm) { gfx.globalAlpha=.35; E(0,0,15,15,'#ffd27a'); gfx.globalAlpha=1; }
  if(!carry) { RO(22,-8,30,12,CREAM); label(warm?'WARM':'COLD',37,-6,warm?'#c2561e':'#2f6fb0',1); if(ms>P.click-60&&ms<P.click+250) label('CLICK',0,-34,GOLD,2); }
  gfx.restore(); };
SC.gr_warm=(s,u)=>{ const r=ez(u/.2); gfx.globalAlpha=fade(u,.7); E(s.x,s.y,40*r,52*r,'rgba(255,170,80,.22)'); ring(s.x,s.y,40*r,52*r,4,'#ffb45a');
  for(let k=0;k<6;k++) { const fx2=s.x-24+k*10,fy=s.y-30+u*70+(k%2)*10; gfx.globalAlpha=fade(u,.7)*(1-u); R(fx2,fy,4,4,'#e8b048'); } };
G.ringlight_rescue=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,52),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'kneel'},{t:1100,f:'expr'},{t:1800,f:'act',dx:-6},{t:2050,f:'act'},{t:2500,f:'celeb',hop:10},{t:2900,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'kneel'},{t:1150,f:'expr'},{t:1800,f:'act',dx:-6},{t:2050,f:'act'},{t:2500,f:'celeb',hop:10},{t:2900,f:'kneel'},{t:3150,f:'runR'},{t:3850,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const plan={set:self?600:800,click:1950,fold:self?3000:3000,x:(self?sp.x:sp.x)-28,y:(self?sp.y:sp.y)-66},end=self?3400:3950;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Grace sets up her ring light. The dial says COLD.':'Grace runs a ring light over to '+t.name+'. The dial says COLD.'); say(m.id,'ringlight_rescue'); scene('gr_ring',end/1000,{plan}); }],
    [plan.set,()=>{ sfx.select(); }],
    [1150,()=>{ setMessage('She checks the light. Too blue. Obviously.'); sfx.beep(); }],
    ['hf',1950],
    [1950,()=>{ sfx.click(); E2.apply(); sfx.ding(); sfx.heal(); scene('gr_warm',1.2,{x:H.x,y:H.mid}); hopOf(t!==m?t:null); }],
    [2500,()=>{ scene('gr_text',.9,{st:ST.cur,txt:'MUCH KINDER',c:'#ffb45a'}); }],
    [end,'end',kindLine(t,'The lighting is much kinder now.')]]); };

// ---------- Comment Moderation ----------
SC.gr_rude=(s,u)=>{ const ms=s.t*1000,P=s.plan;
  if(ms<P.grab) { const x=P.x,y=P.y,g=ez(ms/250),w=40*g,h=22*g,pts=[]; for(let k=0;k<12;k++) { const a=k/12*Math.PI*2,r=k%2?1:1.25; pts.push([x+Math.cos(a)*w*r,y+Math.sin(a)*h*r]); }
    gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(const q of pts) gfx.lineTo(q[0],q[1]); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#ffb0a0'; gfx.fill();
    gfx.beginPath(); gfx.moveTo(x-12,y+h); gfx.lineTo(x-26,y+h+14); gfx.lineTo(x-2,y+h); gfx.closePath(); gfx.fillStyle='#ffb0a0'; gfx.fill(); if(g>.8) label('#!*&',x,y-4,'#7a1a14',2); return; }
  if(ms<P.toss) { const h=hand(),q=ez((ms-P.grab)/(P.crush-P.grab)),w=lerp(22,9,q); RO(h.x-w,h.y-w-6,w*2,w*2,q<.5?'#ffb0a0':'#9be39a'); if(q>.5) { Ln(h.x-w*.5,h.y-6,h.x+w*.4,h.y-6-w*.5,2,'#2f6b3a'); Ln(h.x+w*.4,h.y-6-w*.5,h.x+w*.2,h.y-6+w*.5,2,'#2f6b3a'); } return; }
  if(ms>P.card) { const c=ez((ms-P.card)/200); RO(P.x-34,P.y-12,68*c+.1,24,CREAM); if(c>.9) { R(P.x-32,P.y-10,64,4,'#9aa3c8'); label('COMMENTS',P.x,P.y-4,'#2b2a26',1); label('PAUSED',P.x,P.y+4,'#2b2a26',1); } } };
G.comment_moderation=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:6},{t:1000,x:p.x,y:p.y,f:'expr'},{t:1050,f:'celeb',hop:30},{t:1350,f:'kneel',dx:(u,tt)=>Math.sin(tt*40)*2},{t:1750,f:'idle',rot:wheel(1),hop:48,ns:true},
    {t:2150,f:'act',dx:-10},{t:2600,f:(u,tt)=>Math.floor(tt*10)%2?'idle':'expr'},{t:2950,f:'runR'},{t:3650,x:'home',y:'home',f:'idle'}]);
  const plan={x:F.x+F.w*.5+10,y:F.top-22,grab:1200,crush:1700,toss:2150,card:2350};
  ST.play(E2,[
    [0,()=>{ setMessage('A rude comment pops up next to '+f.name+'. Grace marches over.'); say(m.id,'comment_moderation'); scene('gr_rude',3.6,{plan}); sfx.beep(); }],
    [1200,()=>{ sfx.click(); setMessage('She plucks it right out of the air and crumples it.'); }],
    [1750,()=>{ sfx.whoosh(); }],
    [2150,()=>{ const h=hand(); ST.fly((x,y)=>{ RO(x-8,y-8,16,16,'#9be39a'); },h.x,h.y-6,F.x,F.mid,.12,10); }],
    ['hf',2250],
    [2250,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('gr_text',.9,{x:F.x+62,y:F.top-10,txt:'DELETED',c:'#9be39a'}); }],
    [2600,()=>{ sfx.ding(); }],
    [3750,'end',res(E2)+'Grace removes the unhelpful comment.']]); };

// ---------- Thumbnail Face ----------
SC.gr_frame=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; if(!st||st.x==null) return; const hd=head(st,0),B=P.B;
  const g=ez((ms-P.stretch)/(P.hit-P.stretch)),x0=lerp(hd.x-22,B.x0-14,g),x1=lerp(hd.x+14,B.x1+14,g),y0=lerp(hd.y-20,B.y0-14,g),y1=lerp(hd.y+16,B.y1+8,g);
  gfx.globalAlpha=fade(u,.86); if(ms>P.hit+400) return;
  gfx.strokeStyle=OUT; gfx.lineWidth=8; gfx.strokeRect(x0,y0,x1-x0,y1-y0); gfx.strokeStyle='#e0402e'; gfx.lineWidth=4; gfx.strokeRect(x0,y0,x1-x0,y1-y0);
  R(x1-24,y0+3,20,9,'#e0402e'); label('REC',x1-14,y0+5,CREAM,1);
  if(g>.05) { const cx=(x0+x1)/2,cy=(y0+y1)/2,k=lerp(.6,2.4,g); E(cx-10*k,cy-6*k,3*k,4*k,OUT); E(cx+10*k,cy-6*k,3*k,4*k,OUT); E(cx,cy+8*k,5*k,7*k,OUT); E(cx,cy+8*k,3.5*k,5*k,'#7a1a14'); } };
SC.gr_wow=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.8); const fx2=s.x,fy=s.y; LnO(fx2-34,fy-26,fx2-6,fy-4,4,GOLD); LnO(fx2-6,fy-4,fx2-16,fy-6,4,GOLD); LnO(fx2-6,fy-4,fx2-8,fy-14,4,GOLD); label('WOW',fx2-44,fy-40,GOLD,2); R(fx2-3,fy-2,4,3,'#8a7a6a'); };
G.thumbnail_face=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p0=rowSpot(Gp,100),p1=rowSpot(Gp,34),B={x0:Gp.x0,x1:Gp.x1,y0:Gp.top,y1:Gp.base};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p0.x,y:p0.y,f:'expr'},{t:1400,f:'celeb',hop:22},{t:1700,f:'run'},{t:2200,x:p1.x,y:p1.y,f:'act'},{t:2700,f:'kneel'},{t:3000,f:'runR'},{t:3700,x:'home',y:'home',f:'idle'}]);
  const plan={stretch:1700,hit:2200,B};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace holds a tiny frame up to her face. Small surprised face.'); say(m.id,'thumbnail_face'); scene('gr_frame',3.0,{st,plan}); }],
    [1400,()=>{ setMessage('Bigger. BIGGER.'); sfx.jumpWhistle(); }],
    [1700,()=>{ sfx.whoosh(); }],
    ['hf',2200],
    [2200,()=>{ sfx.bonk(); sfx.click(); all(list); landHit(100); }],
    [2600,()=>{ scene('gr_wow',1.2,{x:Gp.x0-20,y:Gp.base+16}); sfx.ding(); }],
    [2700,()=>{ scene('gr_text',.8,{st,txt:'PERFECT',c:PINK}); }],
    [3800,'end',res(E2)+'The reaction is slightly larger than necessary.']]); };

// ---------- Eight-Count Reset ----------
const buffIcon=(x,y)=>{ RO(x-7,y-7,14,14,'#9be39a'); Ln(x,y+4,x,y-4,2,'#1d4a2a'); Ln(x-3,y-1,x,y-4,2,'#1d4a2a'); Ln(x+3,y-1,x,y-4,2,'#1d4a2a'); };
SC.gr_dots=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.9);
  for(let k=0;k<8;k++) { const [dx,dy]=P.steps[k],x=P.x+dx,y=P.y+dy+4,on=ms>P.c0+k*P.beat; E(x,y,6,3,OUT); E(x,y,4.5,2,on?(k===7?PINK:GOLD):'#6a6a7a'); }
  const n=Math.floor((ms-P.c0)/P.beat); if(n>=0&&n<8&&ms<P.c0+8*P.beat) { const st=s.st; if(st&&st.x!=null) { const p=head(st,-34); label(''+(n+1),p.x,p.y,n===7?PINK:CREAM,2); } } };
SC.gr_buff=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y; if(ms<P.hook) { x=P.x; y=P.y+Math.sin(s.t*7.3)*6; } else { const st=s.st,q=ez((ms-P.hook)/300),p=head(st,-14); x=lerp(P.x,p.x,q); y=lerp(P.y,p.y,q)-Math.sin(q*Math.PI)*30; } gfx.globalAlpha=fade(u,.9); buffIcon(x,y); };
G.eight_count=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,44),beat=170;
  const steps=[[0,0],[-14,0],[-14,8],[0,8],[0,0],[-14,0],[-14,8],[-22,4]];
  const K=[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'idle'}];
  steps.forEach(([dx,dy],k)=>K.push({t:760+k*beat,x:p.x+dx,y:p.y+dy,f:k%2?'celeb':'idle',hop:k===7?0:6}));
  K.push({t:760+8*beat,f:'act',dx:u=>-ez(u)*8},{t:760+8*beat+300,f:'act'},{t:2500,f:'celeb',hop:10},{t:2900,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hookAt=760+7*beat,hit=760+8*beat;
  ST.play(E2,[
    [0,()=>{ setMessage('Grace counts it out right next to '+f.name+'. It is off the beat.'); say(m.id,'eight_count'); scene('gr_dots',2.6,{st,plan:{x:p.x,y:p.y,steps,c0:760,beat}}); scene('gr_buff',3.4,{st,plan:{x:F.x,y:F.top-18,hook:hookAt}}); }],
    [760,()=>{ for(let k=0;k<8;k++) b7Later(()=>sfx.beat(),k*beat); }],
    [hookAt,()=>{ sfx.whoosh(); setMessage('One exact side-step. Her finish, its good part.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('gr_text',.9,{st,txt:'EIGHT',c:PINK}); }],
    [2500,()=>{ sfx.ding(); }],
    [3700,'end',res(E2)+'Grace borrows the good part.']]); };

// ---------- Balance-Beam Borders ----------
SC.gr_beams=(s,u)=>{ const ms=s.t*1000,P=s.plan,slide=ez(ms/450),clap=ms>P.clap-80&&ms<P.clap+250?Math.sin(cl((ms-P.clap+80)/330)*Math.PI):0,gap=lerp(14,3,clap);
  gfx.globalAlpha=fade(u,.9); const w=P.x1-P.x0+70,x=lerp(-w-30,P.x0-35,slide);
  const beam=(y)=>{ R(x,y-6,w,12,OUT); R(x+2,y-4,w-4,8,'#e8cfa0'); R(x+2,y-4,w-4,3,'#f6e6c4'); for(const lx of [x+16,x+w-22]) { R(lx,y+6,6,10,OUT); R(lx+1,y+6,4,9,'#8a5a30'); } };
  if(s.back) beam(P.yb-gap); else beam(P.yf+gap); if(!s.back&&clap>.5) label('BONK',(P.x0+P.x1)/2,P.yb-gap-30,GOLD,2); };
G.beam_borders=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,60),yf=Math.min(306,Gp.base+12),yb=Gp.top+Math.min(40,(Gp.base-Gp.top)*.6);
  const onBeam={x:Gp.x,y:yf-5};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:650,x:p.x,y:p.y,f:'idle',rot:wheel(2),hop:70,hn:1,ns:true},{t:1250,x:onBeam.x,y:onBeam.y,f:'celeb',rot:(u,tt)=>Math.sin(tt*5)*.09,dx:u=>Math.sin(u*Math.PI*2)*14},
    {t:2450,f:'idle',rot:wheelR(1),hop:80,ns:true},{t:3050,x:p.x,y:p.y,f:'celeb'},{t:3250,f:'runR'},{t:3900,x:'home',y:'home',f:'idle'}]);
  const plan={x0:Gp.x0,x1:Gp.x1,yf,yb,clap:1700};
  ST.play(E2,[
    [0,()=>{ setMessage('Two low balance beams slide in around them. Grace runs at it.'); say(m.id,'beam_borders'); scene('gr_beams',3.4,{plan,back:true}); scene('gr_beams',3.4,{plan}); sfx.slideWhistle(); }],
    [650,()=>{ sfx.whoosh(); b7Later(()=>sfx.whoosh(),300); scene('gr_trail',.6,{st}); }],
    [1250,()=>{ sfx.thud(); setMessage('She lands one foot on the beam. Perfectly comfortable.'); }],
    ['hf',1700],
    [1700,()=>{ sfx.thud(); all(list); landHit(100); }],
    [2000,()=>{ scene('gr_text',.9,{st,txt:'STAY IN LANE',c:GOLD,sc:1}); }],
    [2450,()=>{ sfx.jumpWhistle(); }],
    [4000,'end',res(E2)+'The available wiggle room is precisely zero.']]); };

// ---------- Warm-Up Lap ----------
SC.gr_lapring=(s,u)=>{ const ms=s.t*1000,P=s.plan,d=cl((ms-P.from)/P.len); gfx.globalAlpha=fade(u,.88); if(d<=0) return;
  for(const [w,c] of [[6,OUT],[3,'#ffb45a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(P.cx,P.cy,P.rx,P.ry,0,0,Math.PI*2*d); gfx.stroke(); }
  if(d>=1) { gfx.globalAlpha=fade(u,.88)*.25; E(P.cx,P.cy,P.rx,P.ry,'#ffb45a'); } };
SC.gr_warmring=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.7); E(s.x,s.y,30*g,9*g,'rgba(255,170,80,.35)'); ring(s.x,s.y,30*g,9*g,3,'#ffb45a');
  for(let k=0;k<4;k++) { const a=s.t*4+k*Math.PI/2; R(s.x+Math.cos(a)*28*g-2,s.y+Math.sin(a)*8*g-2,4,4,CREAM); } };
G.warmup_lap=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const cx=foe?U[0].x:Math.round(U.reduce((a,q)=>a+q.x,0)/U.length),cy=foe?U[0].base:Math.round(U.reduce((a,q)=>a+q.base,0)/U.length);
  const rx=foe?U[0].w*.5+30:Math.max(...U.map(q=>Math.abs(q.x-cx)))+40,ry=foe?16:Math.max(...U.map(q=>Math.abs(q.base-cy)))+14;
  const sx=cx+rx,sy=cy,lap0=500,lapLen=1400,check=lowest()&&!foe?lowest():null,C=check?ST.unit(check):null;
  const K=[{t:0,x:'home',y:'home',f:'run'},{t:lap0,x:sx,y:sy,f:u=>Math.sin(u*Math.PI*2)>0?'run':'runR',dx:u=>Math.cos(u*Math.PI*2)*rx-rx,dy:u=>Math.sin(u*Math.PI*2)*ry},
    {t:lap0+lapLen,x:sx,y:sy,f:'expr',rot:(u,tt)=>Math.sin(tt*12)*.06},{t:2500,f:'idle'}];
  if(C) K.push({t:2550,f:'run'},{t:2950,x:C.x+C.w*.5+20,y:C.base+3,f:'kneel'},{t:3350,f:'celeb',hop:8},{t:3600,f:'runR'},{t:4200,x:'home',y:'home',f:'idle'});
  else K.push({t:2550,f:'celeb',hop:8},{t:2900,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),hit=lap0+lapLen,end=C?4300:3700;
  ST.play(E2,[
    [0,()=>{ setMessage('Warm-up lap. Grace leads. Everyone follows. Nobody skips.'); say(m.id,'warmup_lap'); scene('gr_lapring',(end-200)/1000,{plan:{cx,cy:cy-4,rx,ry,from:lap0,len:lapLen}}); }],
    [lap0,()=>{ sfx.whoosh(); }],
    ['hf',hit],
    [hit,()=>{ E2.apply(); sfx.ding(); sfx.heal(); for(const u of who) { const q=ST.unit(u); scene('gr_warmring',1.3,{x:q.x,y:q.base}); hopOf(u!==m?u:null); } setMessage('Ankle circles. The smallest ankle gets the most coaching.'); }],
    ...(C?[[2950,()=>{ scene('gr_text',.9,{x:C.x,y:C.top-16,txt:'GOOD ANKLE',c:GOLD,sc:1}); sfx.select(); }]]:[]),
    [end,'end',foe?kindLine(foe):'The warm-up has an unusually strict director.']]); };

// ---------- Mat Patrol ----------
SC.gr_mat=(s,u)=>{ const ms=s.t*1000,P=s.plan,go=ez((ms-P.kick)/(P.drop-P.kick)),x=lerp(P.kx,P.mx,go),y=P.y; gfx.globalAlpha=fade(u,.9); if(ms<P.kick) { const r=14; E(P.kx,y-r,r+2,r+2,OUT); E(P.kx,y-r,r,r,BLUE); ring(P.kx,y-r,r*.55,r*.55,2,'#9fc4f0'); return; }
  const flat=cl((ms-P.drop+120)/180);
  if(flat<1) { const r=lerp(14,6,flat); E(x,y-r,r+2,r+2,OUT); E(x,y-r,r,r,BLUE); ring(x,y-r,r*.55,r*.55,2,'#9fc4f0'); }
  if(flat>0) { const w=P.w*flat; R(P.mx-w/2-2,y-8,w+4,12,OUT); R(P.mx-w/2,y-6,w,8,BLUE); for(let k=1;k<4;k++) R(P.mx-w/2+k*w/4,y-6,2,8,'#3a68b0'); if(ms>P.drop&&ms<P.drop+700) label('PADDED',P.mx,y-P.h-26,'#9fc4f0',2); } };
SC.gr_matend=(s,u)=>{ const g=ez(u/.3); gfx.globalAlpha=fade(u,.8); const x=s.x,y=s.y; R(x-12,y-6,24*g+.1,8,OUT); R(x-10,y-4,20*g+.1,4,BLUE); if(g>.9) { E(x+12,y-10,8,8,OUT); E(x+12,y-10,6,6,BLUE); ring(x+12,y-10,3,3,2,'#9fc4f0'); } };
G.mat_patrol=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,56),me=ST.unit(m),L=lowest(),LU=L?ST.unit(L):null,selfL=L===m;
  const K=[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'idle'},{t:750,f:(u,tt)=>Math.floor(u*4)%2?'celeb':'idle'},{t:1150,f:'act',dx:u=>-ez(u/.5)*14},{t:1450,f:'act'},{t:1800,f:'expr'}];
  if(LU&&!selfL) K.push({t:2100,f:LU.x<p.x?'run':'runR'},{t:2800,x:Math.min(560,LU.x+LU.w*.5+24),y:LU.base+3,f:'kneel'},{t:3200,f:LU.x+LU.w*.5+24<me.x?'runR':'run'},{t:3800,x:'home',y:'home',f:'idle'});
  else K.push({t:2100,f:'runR'},{t:2800,x:'home',y:'home',f:'kneel'},{t:3200,f:'idle'});
  const st=ST.keys(fx,K),plan={kick:1150,drop:1650,kx:p.x-20,mx:F.x,y:F.base+2,w:Math.max(90,F.w+40),h:F.h};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace spots the wind-up and sprints over with a rolled mat.'); say(m.id,'mat_patrol'); scene('gr_mat',2.8,{plan}); }],
    [750,()=>{ sfx.click(); b7Later(()=>sfx.click(),200); setMessage('One coach clap. Two.'); }],
    [1150,()=>{ sfx.whoosh(); }],
    ['hf',1650],
    [1650,()=>{ sfx.thud(); ST.jolt(f,.5); landHit(100); }],
    [2000,()=>{ E2.apply(); }],
    [2800,()=>{ if(LU) { scene('gr_matend',1.2,{x:selfL?me.x-30:LU.x-26,y:LU.base}); sfx.select(); } }],
    [3900,'end',res(E2)+'The landing has been professionally padded.']]); };

// ---------- Spotlight Shuffle ----------
SC.gr_spots=(s,u)=>{ const ms=s.t*1000,P=s.plan,B=P.B,y=B.base+6; gfx.globalAlpha=fade(u,.9);
  if(ms<P.snap) { const q0=cl((ms-P.from)/(P.snap-P.from)); for(let k=0;k<3;k++) { const ph=q0*4+k,i=Math.floor(ph)%3,j=(i+1)%3,q=ez(ph%1),x=lerp(lerp(B.x0,B.x1,i/2),lerp(B.x0,B.x1,j/2),q),hop=Math.sin(q*Math.PI)*16;
      gfx.save(); gfx.globalAlpha*=.6; E(x,y-hop,22,7,'#fff6dc'); gfx.restore(); ring(x,y-hop,22,7,2,GOLD); } return; }
  const q=ez(cl((ms-P.snap)/120)); for(const f of P.list) { const c=ST.foe(f),r=lerp(8,26,q); gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.strokeRect(c.x-r,c.mid-r,r*2,r*2); gfx.strokeStyle=GOLD; gfx.lineWidth=4; gfx.strokeRect(c.x-r,c.mid-r,r*2,r*2); }
  if(ms>P.snap+300) label('WRONG MARK',(B.x0+B.x1)/2,B.top-26,GOLD,2); };
G.spotlight_shuffle=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,40),c={x:Math.min(546,Gp.x1+44),y:Math.min(312,Gp.base+10)},xl=Math.max(30,Gp.x0-14);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:600,x:p.x,y:Math.min(314,Gp.base+16),f:'idle',rot:wheel(3),hop:16,hn:3,ns:true},{t:1500,x:xl,y:Math.min(314,Gp.base+16),f:'expr'},
    {t:1600,f:'celeb',rot:wheelR(1),hop:54,ns:true},{t:2000,x:c.x,y:c.y,f:'celeb'},{t:2900,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'}]);
  const plan={B:Gp,list,from:400,snap:2000};
  ST.play(E2,[
    [0,()=>{ setMessage('Lights down. Three spotlights start hopping around the floor.'); say(m.id,'spotlight_shuffle'); scene('gr_dark',3.5,{a:.4,back:true}); scene('gr_spots',3.2,{plan}); }],
    [600,()=>{ sfx.whoosh(); setMessage('Grace cartwheels along the row swapping the floor marks with one toe.'); for(let k=0;k<3;k++) b7Later(()=>sfx.click(),k*300); scene('gr_trail',.9,{st}); }],
    [1600,()=>{ sfx.jumpWhistle(); scene('gr_beam',1.9,{x:c.x,y:c.y,w:30}); }],
    ['hf',2000],
    [2000,()=>{ sfx.ding(); sfx.bonk(); all(list); landHit(100); }],
    [2200,()=>{ scene('gr_text',.9,{st,txt:'CENTER',c:GOLD}); }],
    [3700,'end',res(E2)+'The enemies have missed their entrance.']]); };
})();
