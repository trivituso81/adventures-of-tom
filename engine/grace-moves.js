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
  if(PROPART.draw('grace/gold_dumpling_squishy',x,y,{h:46*sc,sx:1+sq*.5,sy:1-sq*.45})) return;   // painted (art/props/grace); the drawn one below is the fallback
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
    800,E2.result+' The Grump wasn\'t dressed for this.',()=>checkEnemy()); };

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
    500,()=>{ scene('scorecards',2.2,{cards:['10','10','10']}); sfx.levelChime(); scene('confetti',2.0,{n:50}); scene('flashes',1.6,{n:14}); for(let k=0;k<6;k++) b7Later(()=>sfx.click(),k*180); bt('PERFECT 10',96,30,GOLD,4,1.4); pose(fx,'celeb',1.6); fx.p10=1.6; },
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
  if(PROPART.draw('grace/giant_glitter_nail',0,2,{h:38})) { gfx.restore(); if(u>.25) check(s.x+16,s.y-14,4,'#9be39a'); return; }   // painted giant glitter nail; the drawn one below is the fallback
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
const buffIcon=(x,y)=>{ if(PROPART.draw('grace/green_up_arrow',x,y,{h:22})) return;   // painted green up arrow
  RO(x-7,y-7,14,14,'#9be39a'); Ln(x,y+4,x,y-4,2,'#1d4a2a'); Ln(x-3,y-1,x,y-4,2,'#1d4a2a'); Ln(x+3,y-1,x,y-4,2,'#1d4a2a'); };
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
    [0,()=>{ setMessage('Grace counts it out right next to '+f.name+'. It\'s off the beat.'); say(m.id,'eight_count'); scene('gr_dots',2.6,{st,plan:{x:p.x,y:p.y,steps,c0:760,beat}}); scene('gr_buff',3.4,{st,plan:{x:F.x,y:F.top-18,hook:hookAt}}); }],
    [760,()=>{ for(let k=0;k<8;k++) b7Later(()=>sfx.beat(),k*beat); }],
    [hookAt,()=>{ sfx.whoosh(); setMessage('One exact side-step. Her finish, its good part.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('gr_text',.9,{st,txt:'EIGHT',c:PINK}); }],
    [2500,()=>{ sfx.ding(); }],
    [3700,'end',res(E2)+'Grace borrows the good part.']]); };

// ---------- Balance-Beam Borders ----------
SC.gr_beams=(s,u)=>{ const ms=s.t*1000,P=s.plan,slide=ez(ms/450),clap=ms>P.clap-80&&ms<P.clap+250?Math.sin(cl((ms-P.clap+80)/330)*Math.PI):0,gap=lerp(14,3,clap);
  gfx.globalAlpha=fade(u,.9); const w=P.x1-P.x0+70,x=lerp(-w-30,P.x0-35,slide);
  const beam=(y)=>{ if(PROPART.draw('grace/balance_beam',x+w/2,y+2,{w:w,h:26,src:[0,2,160,56]})) { for(const lx of [x+16,x+w-22]) { R(lx,y+12,6,8,OUT); R(lx+1,y+12,4,7,'#8a5a30'); } return; }   // painted plank stretched along the row, drawn legs under it
    R(x,y-6,w,12,OUT); R(x+2,y-4,w-4,8,'#e8cfa0'); R(x+2,y-4,w-4,3,'#f6e6c4'); for(const lx of [x+16,x+w-22]) { R(lx,y+6,6,10,OUT); R(lx+1,y+6,4,9,'#8a5a30'); } };
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
  if(flat>0&&PROPART.draw('grace/spring_floor_mat',P.mx,y+6,{w:(P.w+10)*flat+.1,sy:.6})) { if(ms>P.drop&&ms<P.drop+700) label('PADDED',P.mx,y-P.h-26,'#9fc4f0',2); }
  else if(flat>0) { const w=P.w*flat; R(P.mx-w/2-2,y-8,w+4,12,OUT); R(P.mx-w/2,y-6,w,8,BLUE); for(let k=1;k<4;k++) R(P.mx-w/2+k*w/4,y-6,2,8,'#3a68b0'); if(ms>P.drop&&ms<P.drop+700) label('PADDED',P.mx,y-P.h-26,'#9fc4f0',2); } };
SC.gr_matend=(s,u)=>{ const g=ez(u/.3); gfx.globalAlpha=fade(u,.8); const x=s.x,y=s.y; if(PROPART.draw('grace/spring_floor_mat',x,y-2,{w:46*g+.1})) return;   // painted spring floor mat under the guarded friend
  R(x-12,y-6,24*g+.1,8,OUT); R(x-10,y-4,20*g+.1,4,BLUE); if(g>.9) { E(x+12,y-10,8,8,OUT); E(x+12,y-10,6,6,BLUE); ring(x+12,y-10,3,3,2,'#9fc4f0'); } };
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

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Tom's review: things a nine-year-old gymnast and pretend YouTuber actually does, one big readable moment per move.
// Cartwheel (basic; the o3 cast of the legacy G.cartwheel routes to G.cartwheelShow), DANCE (bigger twirl, confetti, the whole
// party dancing), Squishy Squeeze, Glitter Nails, Welcome Back to My Channel, Like and Subscribe, Dumpling Drop, Dance Battle,
// Beam Dismount, Handstand Contest, Split Leap, Chalk Up. Same engine/stage.js standard; scenes prefix gv_.
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
const G=RECRUIT_MOVES.grace,star=RFX.gStar,dumpling=RFX.gDumpling;
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8',BLUE='#4f86d8',RED='#e8402e',MINT='#9be39a',SKYC='#9fe8ff';
const CONF=[PINK,PURP,GOLD,SKYC,MINT,'#ffb45a'];
ST.nw('gv_');
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
const all=(list,k=.4)=>{ for(const f of list) ST.jolt(f,k); };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const wheel=n=>u=>-u*Math.PI*2*n,wheelR=n=>u=>u*Math.PI*2*n;
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
// A party member who is not the actor moves on a simple path (no aim warp; that only applies to the actor).
// fn(u,t,c) returns {dx,dy,rot,frame}; frame is a sprite key.
const dance=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; return {cx:c.origX+(r.dx||0),base:c.origBase+(r.dy||0),rot:r.rot||0,frame:r.frame?(c.sp[r.frame]||c.sp.idle):null}; }}; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.gv_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||PINK,sc); gfx.restore(); };
SC.gv_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||PINK)); } };
SC.gv_confetti=(s,u)=>{ const n=s.n||60; for(let k=0;k<n;k++) { const sp=.6+((k*37)%10)/12,x=(k*97+s.seed*13)%576+Math.sin(s.t*3+k)*14,y=-10+((s.t*sp*180)+(k*53)%120)%(340);
  gfx.globalAlpha=fin(u,.05)*fade(u,.85); gfx.save(); gfx.translate(x,y); gfx.rotate(s.t*6+k); R(-3,-2,6,4,CONF[k%CONF.length]); gfx.restore(); } };
SC.gv_glitter=(s,u)=>{ for(let k=0;k<26;k++) { const a=k*2.4,d=ez(u)*(s.r||70)*(.4+(k%5)/5); gfx.globalAlpha=fade(u,.4); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.7,2+(k%3)*1.5,CONF[k%CONF.length]); } };
SC.gv_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };

// ---------- Cartwheel (basic) ----------
// Rebuilt 2026-10-25 from docs/reference/cartwheel-preview.html. A lunge with arms straight up, then two real cartwheels:
// her body rolls over whichever hand or foot is on the floor (left hand, right hand, right foot, left foot), upside down
// in a star, easing in on the first wheel and out on the second. She lands facing the monster, kicks (impact 1800),
// TA-DA! with one hop, and hops home. Poses come from data/grace-wheel.js (hip-centred frames, rotated about the hip).
SC.gv_dust=(s,u)=>{ gfx.globalAlpha=(1-u)*.9; for(const dx of [-8,0,8]) E(s.x+dx*(1+u*1.5),s.y-2-u*8,3+u*4,2+u*3,'#e8e2d6'); };
SC.gv_shadow=(s,u)=>{ const st=s.st; if(!st||st.x==null||st.gy==null) return; const lift=Math.max(0,st.gy-st.foot); gfx.globalAlpha=.28*Math.max(.35,1-lift/60); E(st.x,st.gy+4,20-Math.min(10,lift/6),4,'#2f4936'); };
G.cartwheelShow=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),W=GRACE_WHEEL,P=W.P,S=W.scale,HC=W.C*S;
  const sp=GSP(),D=Math.PI/180;
  // Rolling table (sprite pixels): two wheels, hip path and which limb is planted, the planted limb never sliding.
  const NS=600,WH=2,pose=p=>p<.12?W.blend('lunge','star',p/.12,3):(p>.86?W.blend('star','land',(p-.86)/.14,3):{q:P.star,key:'star'});
  const TB=[]; { let x=0,c=-1;
    for(let i=0;i<=NS;i++) { const p=i/NS,b=pose(p),th=(b.q.lean||0)*D-WH*2*Math.PI*p,e=W.tips(b.q,th);
      if(c>=0) { const pr=TB[i-1]; x=pr.x+pr.e[c][0]-e[c][0]; }
      let mx=-1e9,mi=0; e.forEach((v,k)=>{ if(v[1]>mx) { mx=v[1]; mi=k; } }); c=mi; TB.push({x,low:W.low(b.q,th),th,b,e,c}); } }
  // Where she lands: the kick reaches the monster's front edge. The roll is squeezed to fit the gap (it is a little longer
  // than most gaps), so the planted hand or foot drifts a touch instead of the body overshooting.
  const kickReach=-Math.min(...W.tips(P.kick,P.kick.lean*D).map(v=>v[0]))*S;
  const KX=Math.min(me.x-60,F.x+F.w*.5-2+kickReach),LX=KX+10,GY=Math.min(314,F.base+3),HX=me.x,HY=me.base;
  const DIST=-TB[NS].x*S,K=Math.max(.35,Math.min(1.15,(HX-LX)/DIST));
  const st={x:null,y:null,frame:null,fx,gy:HY,foot:HY}; ST.cur=st;
  const puffs=[],bursts=[.25,.75];
  let lastC=-1,lastP=0,landed=false;
  const hipFor=(q,th,gy,hop=0)=>gy-W.low(q,th)*S-hop;
  // Hip position, rotation and frame for any moment of the move (ms at 1x).
  const at=ms=>{
    if(ms<250) { const b=W.blend('stand','lunge',ms/250,2),th=b.q.lean*D; return {x:HX,gy:HY,th,fr:W.frame(b.q,b.key),y:hipFor(b.q,th,HY)}; }
    if(ms<1500) { const u=(ms-250)/1250,p=lerp(u,ez(u),.6),i=Math.round(p*NS),r=TB[i],gy=lerp(HY,GY,ez(p));
      return {x:HX+r.x*S*K,gy,th:r.th,fr:W.frame(r.b.q,r.b.key),y:gy-r.low*S,p,r}; }
    if(ms<1650) { const q=P.land; return {x:LX,gy:GY,th:0,fr:W.frame('land'),y:hipFor(q,0,GY)}; }
    if(ms<1800) { const u=ez((ms-1650)/150),b=u<.5?{q:P.chamber,key:'chamber'}:{q:P.kick,key:'kick'},th=b.q.lean*D*u; return {x:lerp(LX,KX,u),gy:GY,th,fr:W.frame(b.q,b.key),y:hipFor(b.q,th,GY)}; }
    if(ms<1950) { const th=P.kick.lean*D; return {x:KX,gy:GY,th,fr:W.frame('kick'),y:hipFor(P.kick,th,GY)}; }
    if(ms<2100) { const u=(ms-1950)/150,b=u<.5?{q:P.chamber,key:'chamber'}:{q:P.sstand,key:'sstand'},th=b.q.lean*D*(1-u); return {x:KX,gy:GY,th,fr:W.frame(b.q,b.key),y:hipFor(b.q,th,GY)}; }
    if(ms<2900) { const u=(ms-2100)/800,hop=u<.35?Math.sin(u/.35*Math.PI)*14:0; return {x:KX,gy:GY,th:0,fr:sp.celeb,std:1,y:GY-hop}; }
    const u=cl((ms-2900)/600),hop=Math.abs(Math.sin(u*Math.PI*3))*14,gy=lerp(GY,HY,u); return {x:lerp(KX,HX,u),gy,th:0,fr:sp.flip,std:1,y:gy-hop}; };
  fx.path={t:0,dur:3.5,st:true,fn:(q,c)=>{ const ms=q*3500,s=at(ms);
    st.x=s.x; st.gy=s.gy; st.frame=s.fr; st.sp=sp; st.sc=1;
    if(s.std) { st.y=s.y; st.foot=s.y; const [wx,wy]=ST.unwarp(s.x,s.y); return {cx:wx,base:wy,frame:s.fr,rot:0,noShadow:true}; }
    st.y=s.y+(s.std?0:0); st.hip=s.y; st.foot=s.y+W.low(P.stand,0)*S;
    if(s.r) { const r=s.r;   // dust where a new hand or foot touches down, a sparkle burst each time she is upside down
      if(r.c!==lastC&&lastC!==-1) { const e=W.rot(r.e[r.c],0); puffs.push([s.x+e[0]*S,s.gy]); } lastC=r.c;
      for(const k of bursts) if(lastP<k&&s.p>=k) { const v=W.rot([0,-W.TL*.6],r.th); scene('gv_burst',.5,{x:s.x+v[0]*S,y:s.y+v[1]*S,n:8,r:44,sz:7,c:GOLD,c2:CREAM}); sfx.whoosh(); }
      lastP=s.p; st.foot=s.y+r.low*S; }
    while(puffs.length) { const [px,py]=puffs.shift(); scene('gv_dust',.32,{x:px,y:py}); sfx.step(); }
    if(ms>=1500&&!landed) { landed=true; scene('gv_dust',.32,{x:LX-10,y:GY}); scene('gv_dust',.32,{x:LX+10,y:GY}); sfx.bump(); }
    const [wx,wy]=ST.unwarp(s.x,s.y+HC);
    return {cx:wx,base:wy,frame:s.fr,rot:s.th,noShadow:true}; }};
  scene('gv_shadow',3.5,{st});
  ST.play(E2,[
    [0,()=>{ setMessage('Grace cartwheels in. Twice. Showing off the whole way.'); say(m.id,'cartwheel'); }],
    [250,()=>{ sfx.whoosh(); }],
    ['hf',1800],
    [1800,()=>{ sfx.bonk(); ST.jolt(f,.45); landHit(100); scene('gv_big',.3,{x:F.x,y:F.top-74,txt:'HI-YAH!',c:PINK,sc:4}); scene('gv_burst',.5,{x:F.x+F.w*.3,y:F.mid,n:8,r:40}); }],
    [2100,()=>{ scene('gv_big',.8,{st,txt:'TA-DA!',c:PINK2,sc:3}); sfx.ding(); }],
    [3450,'end',res(E2)+'She sticks the landing and takes a bow.']]); };
{ const legacy=G.cartwheel; G.cartwheel=E2=>(E2.act&&E2.act.o3?G.cartwheelShow(E2):legacy(E2)); }

// ---------- DANCE (signature) ----------
// Grace counts it in, twirls big in the middle, confetti everywhere, and the whole party dances along with her.
SC.gv_notes=(s,u)=>{ for(let k=0;k<8;k++) { const q=((s.t*.9)+k/8)%1,x=s.x-90+k*24+Math.sin(q*6+k)*8,y=s.y-q*90; gfx.globalAlpha=(1-q)*fade(u,.85);
  E(x,y,5,4,OUT); E(x,y,3.5,2.6,CONF[k%CONF.length]); Ln(x+4,y,x+4,y-14,2,OUT); } };
G.danceShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),U=party.map(p=>ST.unit(p)),me=ST.unit(m);
  const px=Math.round(U.reduce((a,q)=>a+q.x,0)/U.length)-30,py=Math.min(312,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+22);
  const twirl=(u,tt)=>Math.floor(tt*14)%2?'idle':'flip';
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:px<me.x?'run':'runR'},{t:700,x:px,y:py,f:'idle'},{t:750,f:(u,tt)=>Math.floor(u*8)%2?'celeb':'idle'},
    {t:1550,f:twirl,sc:u=>1+Math.sin(cl(u/.3)*Math.PI/2)*.22,hop:14,hn:3},{t:2450,f:'celeb',sc:1.22,hop:30},{t:2800,f:(u,tt)=>['celeb','flip','celebFlip','idle'][Math.floor(tt*8)%4],dx:u=>Math.sin(u*Math.PI*4)*16,hop:8,hn:4},
    {t:3500,f:px<me.x?'runR':'run'},{t:4200,x:'home',y:'home',f:'idle'}]);
  const others=party.filter(p=>p!==m);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace takes the floor in front of everyone. Dance break.'); say(m.id,'dance'); }],
    [750,()=>{ for(let k=0;k<4;k++) b7Later(()=>sfx.click(),k*200); setMessage('Five, six, seven, eight.'); }],
    [1550,()=>{ sfx.dance(); sfx.spin&&sfx.spin(); setMessage('She twirls. Everybody else has to dance too. Those are the rules.'); scene('gv_notes',2.6,{x:px,y:py-70});
      others.forEach((p,k)=>{ const ph=k*1.3; dance(p,2.3,(q,tt)=>({dx:Math.sin(tt*7+ph)*7,dy:-Math.abs(Math.sin(tt*7+ph))*12,rot:Math.sin(tt*7+ph)*.12,frame:Math.floor(tt*3.5+k)%2?'celeb':'idle'})); }); }],
    ['hf',2450],
    [2450,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('gv_confetti',1.9,{n:70,seed:3}); scene('gv_big',1.3,{x:px,y:py-158,txt:'DANCE BREAK!',c:GOLD,sc:4});
      for(const p of party) { const q=ST.unit(p); scene('gv_glitter',.8,{x:q.x,y:q.mid,r:40}); } }],
    [4300,'end','Everyone dances. Even the ones who said they wouldn\'t.']]); };

// ---------- Squishy Squeeze (A1) ----------
// Grace carries the gold dumpling squishy over, holds it out, and the friend gives it the biggest squeeze. SQUISH.
SC.gv_squish=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,sc=.75,sq=0;
  if(ms<P.hold) { const h=hand(); x=h.x-10; y=h.y-10; }
  else { const q=ez((ms-P.hold)/250); x=lerp(hand().x-10,P.x,q); y=lerp(hand().y-10,P.y,q); sc=lerp(.75,1.35,q);
    if(ms>P.sq&&ms<P.sq+1100) sq=Math.pow(Math.abs(Math.sin(cl((ms-P.sq)/1100)*Math.PI*3)),1.2)*.95; }
  if(ms>P.back) { const q=ez((ms-P.back)/250),h=hand(); x=lerp(P.x,h.x-10,q); y=lerp(P.y,h.y-10,q); sc=lerp(1.35,.75,q); sq=0; }
  gfx.globalAlpha=1; dumpling(x,y,sq,sc);
  if(sq>.5) { gfx.globalAlpha=.8; for(let k=0;k<6;k++) { const a=k*Math.PI/3; Ln(x+Math.cos(a)*44,y+Math.sin(a)*28,x+Math.cos(a)*58,y+Math.sin(a)*38,3,CREAM); } } };
G.squishy_squeeze=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,goL=sp.x<ST.unit(m).x;   // goL: the ally's spot is left of her home; face the way she walks
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'expr'},{t:1100,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*3},{t:2600,f:'celeb',hop:10},{t:3000,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:goL?'walk':'walkR',hop:4,hn:6},{t:1000,x:sp.x,y:sp.y,f:'expr'},{t:1200,f:'act',dx:u=>-ez(u)*6},{t:2600,f:'celeb',hop:10},{t:2900,f:goL?'walkR':'walk',hop:3,hn:5},{t:3900,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),hold=self?1100:1200,end=self?3400:4000;
  const plan={hold,sq:hold+350,back:2600,x:self?H.x-32:H.x+H.w*.25,y:H.mid-4};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Grace gives the gold dumpling squishy a squeeze herself.':'Grace carries the gold dumpling squishy over to '+t.name+'. Squeeze it!'); say(m.id,'squishy_squeeze'); scene('gv_squish',end/1000,{plan}); }],
    [plan.sq,()=>{ for(let k=0;k<3;k++) b7Later(()=>sfx.squeak(),k*360); }],
    ['hf',plan.sq+180],
    [plan.sq+180,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('gr_glow',1,{x:H.x,y:H.mid,c:GOLD}); scene('gv_big',1.1,{x:H.x,y:H.top-76,txt:'SQUISH!',c:GOLD,sc:4}); hopOf(t!==m?t:null); }],
    [plan.sq+700,()=>{ scene('gv_glitter',.9,{x:plan.x,y:plan.y,r:60}); }],
    [end,'end',kindLine(t,'The squishy has been squeezed. Everyone feels better.')]]); };

// ---------- Glitter Nails (A2) ----------
// Grace visits everyone with a big bottle of glitter polish and paints their nails; each gets a giant sparkly nail. Glitter burst.
const polish=(x,y,a,c)=>{ if(PROPART.draw('grace/pink_nail_polish_bottle',x,y+6,{h:50,rot:a||0})) return;   // painted bottle; drawn one below is the fallback
  gfx.save(); gfx.translate(x,y); gfx.rotate(a||0); R(-11,-6,22,30,OUT); R(-9,-4,18,26,c||PINK); R(-6,0,4,18,'#ffd0e6'); for(let k=0;k<4;k++) R(-6+k*4,6+(k%2)*8,2,2,CREAM);
  R(-6,-24,12,20,OUT); R(-4,-22,8,16,'#2b2a26'); gfx.restore(); };
SC.gv_bottle=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.95); polish(h.x-6,h.y-6,-.3+Math.sin(s.t*12)*.15,PINK); };
SC.gv_bignail=(s,u)=>{ const g=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.15)); gfx.globalAlpha=fade(u,.82);
  if(PROPART.draw('grace/giant_glitter_nail',s.x,s.y,{h:50*g})) return;   // painted giant glitter nail (pink); the drawn one below is the fallback
  gfx.save(); gfx.translate(s.x,s.y); gfx.scale(g*1.6,g*1.6);
  R(-11,-4,22,22,OUT); E(0,-6,11,11,OUT); R(-9,-4,18,20,'#f6d4b8'); E(0,-6,9,9,s.c||PINK); R(-9,-6,18,4,s.c||PINK); R(-5,-12,3,8,CREAM); const gl=(s.t*2)%1; star(5,-12+gl*14,1.5+gl*2,CREAM); gfx.restore(); };
G.glitter_nails=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m);
  const order=foe?[foe]:who.filter(u=>u!==m).sort((a,b)=>(a.id==='rose'?-1:0)-(b.id==='rose'?-1:0));
  const K=[{t:0,x:'home',y:'home',f:'idle'}],visits=[]; let t=300,cx=me.x;
  for(const u of order) { const q=ST.unit(u),x=Math.min(560,q.x+q.w*.5+22),y=q.base+3; K.push({t,f:x<cx?'walk':'walkR',hop:3,hn:4}); t+=600; K.push({t,x,y,f:'kneel'}); visits.push([t+250,u]); K.push({t:t+250,f:'act',dx:(uu,tt)=>Math.sin(tt*30)*1.5}); t+=foe?1300:650; cx=x; }
  if(!foe&&who.includes(m)) { K.push({t,f:me.x<cx?'walk':'walkR',hop:3,hn:4}); t+=600; K.push({t,x:'home',y:'home',f:'kneel'}); visits.push([t+200,m]); t+=550; }
  const last=visits.length?visits[visits.length-1][0]:t,fin2=Math.max(t,last+300);
  K.push({t:fin2,f:'celeb',hop:16},{t:fin2+400,f:'idle'},{t:fin2+700,x:'home',y:'home',f:'idle'});
  ST.keys(fx,K);
  const C=[PINK,PURP,GOLD,SKYC];
  ST.play(E2,[
    [0,()=>{ setMessage('Grace shakes a big bottle of glitter polish. Manicures for everyone.'); say(m.id,'glitter_nails'); scene('gv_bottle',(last+250)/1000,{}); }],
    ...visits.map(([ms,u],k)=>[ms,()=>{ const q=ST.unit(u); scene('gv_bignail',1.3,{x:q.x+(u.side==='foe'?36:-34),y:q.mid,c:u.id==='rose'?PINK:C[k%4]}); sfx.ding(); if(u!==m) hopOf(u);
      if(u.id==='rose'&&!foe) scene('gv_text',.9,{x:q.x,y:q.top-16,txt:'PINK',c:PINK,sc:2}); }]),
    ['hf',last],
    [last,()=>{ E2.apply(); sfx.heal(); }],
    [fin2,()=>{ sfx.ding(); const xs=who.map(u=>ST.unit(u)); const gx=xs.reduce((a,q)=>a+q.x,0)/xs.length,gy=xs.reduce((a,q)=>a+q.mid,0)/xs.length; scene('gv_glitter',1.1,{x:gx,y:gy,r:110}); scene('gv_big',1.2,{x:gx,y:Math.min(...xs.map(q=>q.top))-30,txt:'GLITTER NAILS!',c:PINK,sc:3}); }],
    [Math.max(fin2+900,K[K.length-1].t+100),'end',foe?kindLine(foe):'Nobody is allowed to touch anything for ten minutes.']]); };

// ---------- Welcome Back to My Channel (A3) ----------
// Grace makes a pretend vlog: her hairbrush is the microphone, a pretend phone frame says REC. HI GUYS! She interviews the friend,
// who answers into the brush and feels much better.
const brush=(x,y,a)=>{ if(PROPART.draw('grace/hairbrush_microphone',x,y+3,{h:58,rot:a+.6})) return;   // painted hairbrush mic (already drawn on a slant, so rot is eased by .6); drawn one below is the fallback
  gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-3,0,6,26,PURP); EO(0,-8,11,12,PINK2); for(let k=0;k<4;k++) for(let j=0;j<3;j++) E(-6+k*4,-14+j*5,1.2,1.2,'#7a4a8a'); gfx.restore(); };
SC.gv_brush=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); let x=h.x-4,y=h.y-6,a=-.4;
  if(ms>P.ask&&ms<P.back) { const q=ez((ms-P.ask)/200); x=lerp(h.x-4,P.tx,q); y=lerp(h.y-6,P.ty,q); a=lerp(-.4,-1.1,q); }
  gfx.globalAlpha=fade(u,.96); brush(x,y,a); };
SC.gv_rec=(s,u)=>{ const B=s.B,ms=s.t*1000,g=ez(ms/250); gfx.globalAlpha=fade(u,.9); const x0=lerp((B.x0+B.x1)/2,B.x0,g),x1=lerp((B.x0+B.x1)/2,B.x1,g);
  gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.strokeRect(x0,B.y0,x1-x0,B.y1-B.y0); gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.setLineDash([8,6]); gfx.strokeRect(x0,B.y0,x1-x0,B.y1-B.y0); gfx.setLineDash([]);
  if(Math.floor(ms/400)%2) E(x0+12,B.y0+12,5,5,RED); label('REC',x0+32,B.y0+8,CREAM,2);
  for(const [cx,cy,sx,sy] of [[x0,B.y0,1,1],[x1,B.y0,-1,1],[x0,B.y1,1,-1],[x1,B.y1,-1,-1]]) { Ln(cx,cy,cx+sx*14,cy,4,GOLD); Ln(cx,cy,cx,cy+sy*14,4,GOLD); } };
SC.gv_bubble=(s,u)=>{ const g=ez(u/.15); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(g,g); RO(-30,-16,60,26,CREAM);
  gfx.beginPath(); gfx.moveTo(-6,10); gfx.lineTo(-14,20); gfx.lineTo(4,10); gfx.closePath(); gfx.fillStyle=CREAM; gfx.fill(); if(s.heart) heart(0,-4,8,'#ff6b9a'); else label(s.txt,0,-9,'#5a3a8a',2); gfx.restore(); };
G.welcome_back=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m,me=ST.unit(m);
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'celeb',hop:10},{t:900,f:'act'},{t:1700,f:'expr'},{t:2300,f:'act'},{t:2900,f:'celeb',hop:10},{t:3300,f:'idle'},{t:3600,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'run'},{t:800,x:sp.x,y:sp.y,f:'celeb',hop:10},{t:1100,f:'act'},{t:1700,f:'act',dx:u=>-ez(u)*6},{t:2700,f:'celeb',hop:12},{t:3100,f:'runR'},{t:3800,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),end=self?3700:3900;
  const xs=self?[me]:[H,ST.unit(m)],bx0=Math.max(8,Math.min(H.x-H.w*.5-14,sp.x-40)),bx1=Math.min(568,Math.max(H.x+H.w*.5,sp.x+30)),by0=Math.max(8,H.top-30),by1=Math.min(320,H.base+14);
  const plan={ask:1700,back:2600,tx:self?me.x-14:H.x+H.w*.3,ty:self?me.top+24:H.top+H.h*.35};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Grace picks up her hairbrush. It\'s a microphone now.':'Grace runs over to '+t.name+' with her hairbrush. It\'s a microphone now.'); say(m.id,'welcome_back'); scene('gv_brush',end/1000,{plan}); }],
    [self?900:1100,()=>{ scene('gv_rec',(end-1300)/1000,{B:{x0:bx0,x1:bx1,y0:by0,y1:by1}}); scene('gv_big',1.1,{x:(bx0+bx1)/2,y:by0-16,txt:'HI GUYS!',c:PINK,sc:3}); sfx.ding(); }],
    [1700,()=>{ setMessage(self?'Today on the channel: how Grace is feeling. Answer: amazing.':'Today on the channel: '+t.name+'. How are you feeling?'); sfx.select(); }],
    ['hf',2100],
    [2100,()=>{ E2.apply(); sfx.heal(); scene('gv_bubble',1.2,{x:H.x+(t.side==='foe'?10:-20),y:H.top-14,heart:true}); scene('gr_glow',1,{x:H.x,y:H.mid,c:'#ffb45a'}); hopOf(t!==m?t:null); }],
    [2700,()=>{ scene('gv_text',.9,{st,txt:'SMASH THAT LIKE',c:PINK2,sc:1}); sfx.ding(); }],
    [end,'end',kindLine(t,'Great episode. Everyone feels much better.')]]); };

// ---------- Like and Subscribe (A4) ----------
// A giant red SUBSCRIBE button drops out of the sky onto the monster. BONK. It turns grey: SUBSCRIBED, and the bell rings.
SC.gv_subbtn=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f); let y,sq=1,done=ms>P.hit+200;
  if(ms<P.hit) { const q=ms/P.hit; y=lerp(-60,F.top-18,q*q); } else { const q=cl((ms-P.hit)/400); y=F.top-18-Math.sin(q*Math.PI)*16; sq=ms<P.hit+120?.8:1; }
  const w=110,h=34*sq,x=F.x; gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(x,y); R(-w/2-3,-h/2-3,w+6,h+6,OUT); R(-w/2,-h/2,w,h,done?'#9aa0aa':RED); R(-w/2,-h/2,w,5,done?'#c0c6d0':'#ff7a6a');
  label(done?'SUBSCRIBED':'SUBSCRIBE',8,-5,CREAM,2); gfx.beginPath(); gfx.moveTo(-w/2+10,-8); gfx.lineTo(-w/2+10,8); gfx.lineTo(-w/2+22,0); gfx.closePath(); gfx.fillStyle=CREAM; gfx.fill(); gfx.restore();
  if(done) { const r=Math.sin(ms/50)*.4*(1-cl((ms-P.hit-200)/900)),bx=x+w/2+18,by=y-6; gfx.save(); gfx.translate(bx,by); gfx.rotate(r); EO(0,0,9,10,GOLD); R(-11,6,22,4,OUT); R(-10,6,20,3,GOLD); E(0,12,3,3,OUT); gfx.restore(); } };
G.like_subscribe=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,34);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:5,hn:6},{t:1000,x:p.x,y:p.y,f:'expr'},{t:1200,f:'act',dx:-8},{t:1500,f:'celeb',hop:20},{t:2100,f:'act'},{t:2700,f:'celeb',hop:10,hn:2},{t:3200,f:'runR'},{t:3900,x:'home',y:'home',f:'idle'}]);
  const plan={hit:900};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace marches up to '+f.name+' and points at the sky.'); say(m.id,'like_subscribe'); }],
    [1200,()=>{ scene('gv_subbtn',2.4,{f,plan}); sfx.whoosh(); setMessage('And don\'t forget to SUBSCRIBE.'); }],
    ['hf',2100],
    [2100,()=>{ sfx.bonk(); sfx.thud(); ST.jolt(f,.6); landHit(100); scene('gv_big',1,{x:F.x,y:F.top-80,txt:'BONK!',c:RED,sc:4}); }],
    [2350,()=>{ sfx.ding(); b7Later(()=>sfx.ding(),160); scene('gv_text',.9,{x:F.x+62,y:F.top-30,txt:'DING DING',c:GOLD}); }],
    [4000,'end',res(E2)+'It\'s now subscribed. It can\'t argue with that.']]); };

// ---------- Dumpling Drop (A5) ----------
// Grace's whole squishy collection rains down on the row, bouncing off heads. SQUISH SQUISH.
SC.gv_rain=(s,u)=>{ const ms=s.t*1000,L=s.L; for(let k=0;k<s.n;k++) { const f=L[k%L.length],F=ST.unit(f),t0=k*90,q=(ms-t0)/520; if(q<0) continue;
    const hx=F.x+((k*29)%30-15),hy=F.top+4; let x,y,rot=k;
    if(q<1) { x=hx+(1-q)*((k*13)%40-20); y=lerp(-40,hy,q*q); rot=q*2; }
    else { const b=q-1,dir=k%2?1:-1; x=hx+dir*b*90; y=hy-Math.sin(Math.min(1,b)*Math.PI)*46+Math.max(0,b-1)*200; rot=b*6*dir; if(b>2) continue; }
    gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.rotate(rot*.3); const C=[null,'#ffc1dc','#c9a6f0','#9fe8ff','#9be39a'][k%5];
    if(!C) dumpling(0,0,q>.95&&q<1.15?.7:0,.42); else { const sq=q>.95&&q<1.15?.6:0; EO(0,0,13*(1+sq*.4),11*(1-sq*.4),C); E(-4,-2,1.6,1.6,OUT); E(4,-2,1.6,1.6,OUT); E(0,3,2,1.4,'#ff6b9a'); } gfx.restore(); } };
SC.gv_dizzy=(s,u)=>{ for(const f of s.L) { const F=ST.unit(f); for(let k=0;k<3;k++) { const a=s.t*6+k*2.1; gfx.globalAlpha=fade(u,.8); star(F.x+Math.cos(a)*24,F.top-6+Math.sin(a)*6,4,k%2?GOLD:PINK2); } } };
G.dumpling_drop=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,52);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'celeb',hop:12},{t:1000,f:'celeb',dy:(u,tt)=>-Math.abs(Math.sin(tt*10))*6},{t:2600,f:'expr'},{t:2900,f:'celeb',hop:12},{t:3300,f:'runR'},{t:4000,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace runs over with her backpack. It\'s full of squishies. All of them.'); say(m.id,'dumpling_drop'); }],
    [1000,()=>{ scene('gv_big',1.1,{st,txt:'INCOMING!',c:GOLD,sc:3}); sfx.whoosh(); }],
    [1200,()=>{ scene('gv_rain',2.4,{L:list,n:16}); setMessage('Her whole collection rains down. Every limited edition.'); }],
    ['hf',1750],
    [1750,()=>{ sfx.squeak(); sfx.bonk(); all(list); landHit(50); }],
    [2150,()=>{ sfx.squeak(); sfx.boing(); all(list); landHit(50); scene('gv_big',1,{x:Gp.x,y:Gp.top-74,txt:'SQUISH SQUISH!',c:PINK,sc:3}); scene('gv_dizzy',1.4,{L:list}); }],
    [2500,()=>{ sfx.squeak(); }],
    [4100,'end',res(E2)+'She\'ll want every single one of those back.']]); };

// ---------- Dance Battle (B1) ----------
// A step-off. Spotlight on Grace: her moves. Spotlight on the monster: it tries. Spotlight on Grace: big finish. She wins its buff.
const buffIcon=(x,y)=>{ RO(x-9,y-9,18,18,MINT); Ln(x,y+5,x,y-5,3,'#1d4a2a'); Ln(x-4,y-1,x,y-5,3,'#1d4a2a'); Ln(x+4,y-1,x,y-5,3,'#1d4a2a'); };
SC.gv_spot=(s,u)=>{ const ms=s.t*1000,P=s.plan,who=ms<P.b?'g':(ms<P.c?'f':'g'),x=who==='g'?P.gx:P.fx,y=who==='g'?P.gy:P.fy;
  gfx.globalAlpha=fin(u,.08)*fade(u,.9)*.45; R(0,0,576,324,'#0a0814'); gfx.globalAlpha=fin(u,.08)*fade(u,.9)*.4; gfx.fillStyle='#fff6c8'; gfx.beginPath(); gfx.moveTo(x-14,0); gfx.lineTo(x+14,0); gfx.lineTo(x+52,y); gfx.lineTo(x-52,y); gfx.closePath(); gfx.fill();
  gfx.globalAlpha=fade(u,.9); E(x,y,52,10,'rgba(255,246,200,.35)'); if(ms<P.a+700) label('DANCE BATTLE',(P.gx+P.fx)/2,30,GOLD,3);
  if(ms>P.b&&ms<P.c) lift(s.f,-Math.abs(Math.sin(ms/160))*8,Math.sin(ms/120)*.25);
  if(ms>P.c+300&&ms<P.c+1300) label('WINNER',P.gx,P.gy-GH()-34,PINK,2); };
SC.gv_steal=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; let x,y; if(ms<P.hook) { x=P.x; y=P.y+Math.sin(s.t*7)*6; } else { const q=ez((ms-P.hook)/350),p=head(st,-16); x=lerp(P.x,p.x,q); y=lerp(P.y,p.y,q)-Math.sin(q*Math.PI)*34; } gfx.globalAlpha=fade(u,.9); buffIcon(x,y); };
G.dance_battle=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,56);
  const moves=(u,tt)=>['celeb','flip','celebFlip','idle'][Math.floor(tt*9)%4];
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:650,x:p.x,y:p.y,f:'idle'},{t:700,f:moves,hop:10,hn:5,dx:u=>Math.sin(u*Math.PI*3)*10},{t:1500,f:'expr'},
    {t:2300,f:'idle',rot:wheelR(1),hop:30,ns:true},{t:2700,f:'celeb',sc:1.1},{t:3000,f:'act',dx:u=>-ez(u)*8},{t:3300,f:'celeb',hop:12},{t:3700,f:'runR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  const plan={a:650,b:1500,c:2300,gx:p.x,gy:p.y,fx:F.x,fy:F.base+3};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace challenges '+f.name+' to a dance battle.'); say(m.id,'dance_battle'); scene('gv_spot',3.4,{plan,f,back:true}); scene('gv_steal',4.0,{st,plan:{x:F.x,y:F.top-22,hook:3000}}); }],
    [700,()=>{ for(let k=0;k<6;k++) b7Later(()=>sfx.beat(),k*130); }],
    [1500,()=>{ setMessage('Its turn. It tries. It really tries.'); sfx.boing(); }],
    [2300,()=>{ sfx.whoosh(); setMessage('Grace. Big finish.'); }],
    [2700,()=>{ scene('gv_confetti',1,{n:30,seed:9}); sfx.ding(); }],
    ['hf',3000],
    [3000,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); }],
    [4500,'end',res(E2)+'The judges were unanimous. The judge was Grace.']]); };

// ---------- Beam Dismount (B2) ----------
// A balance beam rolls in beside the row. Grace hops up, poses, and flips off it in a double back tuck onto them. A 10.0 card.
SC.gv_beam=(s,u)=>{ const P=s.plan,ms=s.t*1000,g=ez(ms/350),x=lerp(600,P.x0,g),w=P.w,y=P.y; gfx.globalAlpha=fade(u,.92);
  if(PROPART.draw('grace/balance_beam',x+w/2,y-8+(P.h+16)/2,{h:P.h+16})) return;   // painted beam (art/props/grace); the drawn one below is the fallback
  R(x-2,y-6,w+4,12,OUT); R(x,y-4,w,8,'#e8cfa0'); R(x,y-4,w,3,'#f6e6c4'); for(const lx of [x+12,x+w-18]) { R(lx,y+6,6,P.h-6,OUT); R(lx+1,y+6,4,P.h-7,'#8a5a30'); R(lx-6,y+P.h-4,18,6,OUT); } };
SC.gv_card=(s,u)=>{ const g=u<.15?ez(u/.15)*1.3:lerp(1.3,1,cl((u-.15)/.12)); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(.1); gfx.scale(g,g);
  R(-30,-24,60,44,OUT); R(-28,-22,56,40,CREAM); R(-28,-22,56,7,PINK); label('10.0',0,-6,'#2b2a26',3); R(-3,20,6,26,OUT); R(-2,20,4,25,'#8a5a30'); gfx.restore(); };
G.beam_dismount=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),bx0=Math.min(470,Gp.x1+40),bw=86,by=Math.min(300,Gp.base)-46,top={x:Gp.x,y:Gp.top+6},land=rowSpot(Gp,30);
  const onB={x:bx0+bw*.55,y:by-4};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:bx0+bw+18,y:Math.min(314,by+46),f:'celeb',hop:30},{t:1100,x:onB.x,y:onB.y,f:'celeb',rot:(u,tt)=>Math.sin(tt*5)*.07,ns:true},
    {t:1700,f:'kneel',ns:true},{t:1900,f:'idle',rot:wheelR(2),dy:u=>-Math.sin(u*Math.PI)*120,sc:1.1,ease:'lin',ns:true},{t:2600,x:top.x,y:top.y,f:'kneel',ns:true},{t:2800,f:'celeb',ns:true,hop:30},
    {t:3150,x:land.x,y:land.y,f:'celeb',sc:1.12},{t:3500,f:'runR'},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('A balance beam rolls in beside them. Grace runs at it.'); say(m.id,'beam_dismount'); scene('gv_beam',3.3,{plan:{x0:bx0,w:bw,y:by,h:46}}); }],
    [800,()=>{ sfx.jumpWhistle(); }],
    [1100,()=>{ sfx.thud(); setMessage('Up on the beam. Arms up. Perfectly still.'); scene('gv_text',.7,{st,txt:'ARMS UP',c:PINK2}); }],
    [1900,()=>{ sfx.whoosh(); b7Later(()=>sfx.whoosh(),300); scene('gr_trail',.7,{st}); setMessage('Double back tuck. Off the beam. Onto them.'); }],
    ['hf',2600],
    [2600,()=>{ sfx.thud(); sfx.bonk(); all(list,.55); landHit(100); scene('gv_big',.9,{x:Gp.x,y:Gp.top-74,txt:'STUCK IT!',c:GOLD,sc:4}); }],
    [3150,()=>{ scene('gv_card',1.2,{x:land.x-6,y:land.y-GH()-56}); sfx.ding(); }],
    [4300,'end',res(E2)+'The judges give it a ten. The judges are her sister.']]); };

// ---------- Handstand Contest (B3) ----------
// Grace calls a handstand contest. Everybody goes upside down. One by one they wobble and fall. Grace stays up. She wins, obviously.
SC.gv_trophy=(s,u)=>{ const g=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.15)); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(g,g);
  if(PROPART.draw('grace/gold_trophy_cup',0,-6,{h:48})) { gfx.restore(); return; }   // painted trophy; the drawn one below is the fallback
  gfx.beginPath(); gfx.moveTo(-16,-18); gfx.lineTo(16,-18); gfx.lineTo(10,4); gfx.lineTo(-10,4); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=GOLD; gfx.fill();
  ring(-17,-10,6,7,3,GOLD); ring(17,-10,6,7,3,GOLD); RO(-3,4,6,8,GOLD); RO(-11,12,22,6,GOLD); label('1',0,-14,'#7a4a10',2); gfx.restore(); };
G.handstand_contest=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m);
  const others=foe?[]:who.filter(u=>u!==m),flip=Math.PI;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'celeb',hop:12},{t:500,f:'expr'},{t:900,f:'idle',rot:u=>ez(u/.4)*flip,dy:u=>-ez(u/.4)*8},{t:3200,f:'idle',rot:flip,dy:-8},
    {t:3500,f:'celeb',hop:22},{t:3900,f:'idle'},{t:4100,x:'home',y:'home',f:'idle'}]);
  const falls=others.map((u,k)=>1700+k*450),last=falls.length?falls[falls.length-1]:1700;
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Grace challenges '+foe.name+' to a handstand contest.':'Grace calls a handstand contest. Everybody up!'); say(m.id,'handstand_contest'); }],
    [500,()=>{ scene('gv_big',1.2,{x:me.x-80,y:Math.max(60,me.top-60),txt:'HANDSTAND CONTEST!',c:PINK,sc:2}); sfx.charge(); }],
    [900,()=>{ sfx.whoosh(); others.forEach((u,k)=>{ const fall=falls[k]-900; dance(u,(fall+700)/1000,(q,tt)=>{ const ms=q*(fall+700); const up=ms<fall?ez(ms/300):1-ez((ms-fall)/350);
        return {rot:up*flip+(ms<fall?Math.sin(tt*(6+k*2))*.18*up:0),dy:-up*8,frame:'idle'}; }); });
      if(foe) scene('gv_flipfoe',2.6,{f:foe}); }],
    ...others.map((u,k)=>[falls[k],()=>{ sfx.thud(); const q=ST.unit(u); scene('gv_text',.8,{x:q.x,y:q.top-14,txt:'OOF',c:CREAM}); }]),
    ['hf',last+250],
    [last+250,()=>{ E2.apply(); sfx.heal(); sfx.ding(); for(const u of who) { const q=ST.unit(u); scene('gr_warmring',1.2,{x:q.x,y:q.base}); } }],
    [last+500,()=>{ scene('gv_trophy',1.4,{x:me.x,y:me.base+18}); scene('gv_text',1.3,{x:me.x,y:me.base-GH()-60,txt:'GRACE WINS',c:GOLD}); }],
    [Math.max(4200,last+1500),'end',foe?kindLine(foe):'Grace wins. She was always going to win.']]); };
SC.gv_flipfoe=(s,u)=>{ const ms=s.t*1000,up=ms<1400?ez(ms/300):1-ez((ms-1400)/400); lift(s.f,-up*10,up*Math.PI+Math.sin(ms/90)*.2*up); };

// ---------- Split Leap (B4) ----------
// Grace runs and does a huge split leap across the whole row, kicking the target as she sails over. She lands on the far side.
SC.gv_leap=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; if(ms<s.from||ms>s.to) return; const y=st.y-GH()*.5; gfx.globalAlpha=.8;
  for(let k=1;k<5;k++) Ln(st.x+k*14,y-10+k*2,st.x+k*14+18,y-10+k*2,3,k%2?PINK2:CREAM);
  gfx.globalAlpha=.9; LnO(st.x-26,y+12,st.x+26,y+12,5,'#f6d4b8'); };
G.split_leap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),list=b2LiveFoes(),Gp=ST.group(list.length?list:[f]),F=ST.unit(f),me=ST.unit(m),L=lowest(),LU=L?ST.unit(L):null;
  const start=rowSpot(Gp,60),far={x:Math.max(26,Gp.x0-34),y:Math.min(314,Gp.base+6)},topY=Math.max(60,Gp.top-40);
  const span=start.x-far.x,hitQ=cl((start.x-F.x)/Math.max(1,span),.1,.9);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:start.x,y:start.y,f:'run'},{t:900,f:'act',dy:u=>-Math.sin(u*Math.PI)*(start.y-topY),sc:1.15,ease:'lin',ns:true},
    {t:2100,x:far.x,y:far.y,f:'celeb',hop:10},{t:2500,f:'flip'},{t:2800,f:'runR'},{t:3800,x:'home',y:'home',f:'idle'}]);
  const hit=Math.round(900+hitQ*1200);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace takes a running start.'); say(m.id,'split_leap'); scene('gv_leap',2.2,{st,from:900,to:2100}); }],
    [900,()=>{ sfx.jumpWhistle(); scene('gv_big',1,{x:Gp.x,y:topY-36,txt:'SPLIT LEAP!',c:PINK,sc:3}); setMessage('A split leap over the whole row.'); }],
    ['hf',hit],
    [hit,()=>{ sfx.bonk(); ST.jolt(f,.55); landHit(100); scene('gv_burst',.6,{x:F.x,y:F.top,n:8,r:40}); }],
    [2100,()=>{ sfx.thud(); E2.apply(); if(LU) { scene('gr_heart',1.1,{x:LU.x,y:LU.top-8,r:8}); scene('gv_text',1,{x:LU.x,y:LU.top-24,txt:'GUARDED',c:SKYC,sc:1}); } }],
    [2500,()=>{ scene('gv_text',.8,{st,txt:'TA-DA',c:GOLD}); sfx.ding(); }],
    [3900,'end',res(E2)+'Clean over the top. Not one toe touched them. Well, one did.']]); };

// ---------- Chalk Up (B5) ----------
// Lights down, spotlight on. Grace claps her chalky hands: a big white POOF. Then a tumbling pass down the row and she sticks it.
SC.gv_chalk=(s,u)=>{ const g=ez(u/.25); for(let k=0;k<14;k++) { const a=k*.9,d=g*(30+(k%4)*10); gfx.globalAlpha=fade(u,.5)*.85; E(s.x+Math.cos(a)*d,s.y-12+Math.sin(a)*d*.6,10+(k%3)*4,8+(k%3)*3,'#f4f4f0'); }
  if(u<.6) { gfx.globalAlpha=fade(u,.4); label('CLAP',s.x,s.y-58,CREAM,2); } };
SC.gv_prints=(s,u)=>{ for(const f of s.L) { const F=ST.unit(f); gfx.globalAlpha=fade(u,.85)*.9; for(const dx of [-8,8]) { E(F.x+dx,F.mid,4,5,'#f4f4f0'); for(let k=0;k<4;k++) E(F.x+dx-4+k*2.6,F.mid-6,1.2,2,'#f4f4f0'); } } };
G.chalk_up=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),p=rowSpot(Gp,46),xl=Math.max(30,Gp.x0-16),c={x:Math.min(546,Gp.x1+44),y:Math.min(312,Gp.base+10)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:650,x:p.x,y:p.y,f:'expr'},{t:900,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*3},{t:1500,f:'celeb'},
    {t:1700,x:p.x,y:Math.min(314,Gp.base+14),f:'idle',rot:wheel(3),hop:22,hn:3,ns:true},{t:2700,x:xl,y:Math.min(314,Gp.base+14),f:'celeb',sc:1.1},{t:3000,f:'idle',rot:wheelR(1),hop:50,ns:true},
    {t:3400,x:c.x,y:c.y,f:'celeb'},{t:3800,f:'runR'},{t:4400,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Lights down. One spotlight. Grace walks to the chalk bowl.'); say(m.id,'chalk_up'); scene('gr_dark',4.2,{a:.42,back:true}); }],
    [650,()=>{ scene('gr_beam',1.0,{x:p.x,y:p.y,w:36}); }],
    [1100,()=>{ sfx.click(); b7Later(()=>sfx.click(),160); scene('gv_chalk',1.3,{x:p.x-6,y:p.y-GH()*.5}); scene('gv_big',.9,{x:p.x-30,y:p.y-GH()-60,txt:'POOF!',c:CREAM,sc:4}); }],
    [1700,()=>{ sfx.whoosh(); setMessage('Tumbling pass. Round-off, handspring, handspring.'); scene('gr_trail',1,{st}); for(let k=0;k<3;k++) b7Later(()=>sfx.whoosh(),k*330); }],
    [2000,()=>{ sfx.bonk(); all(list); landHit(34); }],
    [2350,()=>{ sfx.bonk(); all(list); landHit(33); }],
    ['hf',2700],
    [2700,()=>{ sfx.bonk(); sfx.ding(); all(list); landHit(33); scene('gv_prints',1.6,{L:list}); }],
    [3400,()=>{ scene('gr_beam',1.0,{x:c.x,y:c.y,w:32}); scene('gv_big',1,{x:c.x-30,y:c.y-GH()-50,txt:'STUCK IT',c:GOLD,sc:3}); sfx.ding(); }],
    [4500,'end',res(E2)+'Chalk handprints everywhere. That\'s how you know it was good.']]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// Grace's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// a nine-year-old doing it for real. Ten Million Subscribers (A6): a pretend livestream with her hairbrush mic, the viewer
// count spins from 3 (her family) to 10000000, a homemade tinfoil Diamond Play Button drops in on a string, she holds it up and
// it throws a rainbow across every enemy; golden confetti heals the party. Diamond Leotard Finale (B6): the floor turns into a
// blue spring floor, sequins, corner salute, a sprint on the diagonal, a triple twist straight off the top of the screen and a
// meteor landing on the target (shield break, sure crit); the other monsters hold up 10.0 cards. Scenes prefix g5_ (no warp).
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
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const G=RECRUIT_MOVES.grace,star=RFX.gStar;
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8',RED='#e8402e',MINT='#9be39a',SKYC='#9fe8ff',FOIL='#d8dde6',FOILD='#9aa2b0',MAT='#2f5fd0',MATD='#244bb0';
const RAINBOW=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff'];
const CONF=[PINK,PURP,GOLD,SKYC,MINT,'#ffb45a'];
ST.nw('g5_');
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const GSP=()=>BATTLE_SPRITES.grace,GH=()=>GSP().idle.length*GSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-GH()*(st.sc||1)*.84+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
if(!sfx.cheer) sfx.cheer=()=>{ noise({dur:1.3,vol:.16,f0:700,f1:1500,type:'bandpass',q:.5}); noise({dur:1.0,vol:.1,f0:1800,f1:2600,type:'bandpass',q:.8,delay:.15}); };
if(!sfx.fanfare) sfx.fanfare=()=>{ [523,659,784,1047].forEach((f,k)=>tone({type:'square',f0:f,dur:k===3?.5:.14,vol:.08,delay:k*.12,filter:2400})); };
if(!sfx.floorMusic) sfx.floorMusic=()=>{ [659,784,988,784,1175,988,1319].forEach((f,k)=>tone({type:'triangle',f0:f,dur:.22,vol:.1,delay:k*.16})); };
// Thin letterbox bars (24 px, so the party's feet stay in shot). Scenes that would spill over them draw clipped (inBox).
const BAR=24;
SC.g5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.g5_big=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  const x=Math.max(w/2+8,Math.min(568-w/2,s.x)),y=Math.max(sc*5+BAR+16,s.y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||PINK,sc); gfx.restore(); };
SC.g5_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-26); x=p.x; y=p.y; }
  const sc=s.sc||2,w=(s.txt.length*4-1)*sc; x=Math.max(w/2+6,Math.min(570-w/2,x)); bigWord(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,sc); };

// ---------- Ten Million Subscribers (A6) ----------
const brush=(x,y,a)=>{ if(PROPART.draw('grace/hairbrush_microphone',x,y+3,{h:58,rot:a+.6})) return;   // painted hairbrush mic (already drawn on a slant, so rot is eased by .6); drawn one below is the fallback
  gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-3,0,6,26,PURP); EO(0,-8,11,12,PINK2); for(let k=0;k<4;k++) for(let j=0;j<3;j++) E(-6+k*4,-14+j*5,1.2,1.2,'#7a4a8a'); gfx.restore(); };
SC.g5_brush=(s,u)=>{ const ms=s.t*1000; if(ms>s.to) return; const h=hand(); gfx.globalAlpha=1; brush(h.x-4,h.y-6,-.4); };
// The pretend livestream: a phone frame round the stage, LIVE, and a viewer count that sits at 3 and then goes up a lot.
const viewers=(ms,P)=>{ if(ms<P.c0) return 3; if(ms>=P.c1) return 10000000; const q=(ms-P.c0)/(P.c1-P.c0); return Math.round(3*Math.pow(10000000/3,q*q)); };
SC.g5_live=inBox((s,u)=>{ const ms=s.t*1000,P=s.plan,g=ez(ms/300),off=ms>P.off?ez((ms-P.off)/300):0,k=g*(1-off); if(k<=0) return;
  const x0=lerp(288,12,k),x1=lerp(288,564,k),y0=lerp(162,BAR+8,k),y1=lerp(162,324-BAR-8,k); gfx.globalAlpha=1;
  gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.strokeRect(x0,y0,x1-x0,y1-y0); gfx.strokeStyle=CREAM; gfx.lineWidth=3; gfx.setLineDash([10,7]); gfx.strokeRect(x0,y0,x1-x0,y1-y0); gfx.setLineDash([]);
  for(const [cx,cy,sx,sy] of [[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]]) { Ln(cx,cy,cx+sx*18,cy,5,GOLD); Ln(cx,cy,cx,cy+sy*18,5,GOLD); }
  if(k<1) return;
  RO(x0+10,y0+10,44,16,RED); if(Math.floor(ms/400)%2) E(x0+18,y0+18,3,3,CREAM); label('LIVE',x0+36,y0+15,CREAM,2);
  const n=viewers(ms,P),txt=String(n),w=(txt.length*4-1)*2;
  RO(x1-w-22,y0+10,w+12,30,'rgba(20,20,40,.85)'); label('VIEWERS',x1-16-w/2,y0+12,PINK2,1); label(txt,x1-16-w/2,y0+22,ms>=P.c1?GOLD:CREAM,2);
  // little hearts floating up the right edge, faster once it blows up
  const rate=ms>P.c0?3:1; for(let j=0;j<6;j++) { const q=((s.t*.5*rate)+j/6)%1; gfx.globalAlpha=1-q; heart(x1-24+Math.sin(q*9+j)*8,y1-14-q*120,5+(j%2)*2,j%3?PINK:'#ff5a7a'); }
  gfx.globalAlpha=1; });
// The homemade Diamond Play Button: a cardboard square wrapped in tinfoil, a glitter-glue diamond, DIAMOND in marker.
const plaque=(x,y,t,k=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(k,k);
  if(PROPART.draw('grace/play_button_plaque',0,0,{h:66})) { /* painted tinfoil play button; the sparkles below still twinkle */ } else {
  RO(-26,-30,52,60,FOIL); for(let j=0;j<6;j++) Ln(-22+j*9,-26+((j*7)%9),-18+j*8,22-((j*5)%11),1,FOILD);
  R(-26,-30,52,6,'#f2f5fa');
  PO([[0,-20],[16,-4],[0,14],[-16,-4]],'#bff0ff',2); PO([[0,-20],[16,-4],[0,-4]],'#ffffff',0); PO([[-16,-4],[0,14],[0,-4]],'#7fd0ec',0);
  PO([[-4,-9],[6,-4],[-4,1]],'#ffffff',0);
  label('DIAMOND',0,19,'#5a3a8a',1); }
  for(let j=0;j<5;j++) { const q=(t*1.6+j*.37)%1; gfx.globalAlpha=Math.sin(q*Math.PI); star(-20+((j*19)%40),-24+((j*23)%46),2+q*2.5,j%2?'#ffffff':GOLD); }
  gfx.globalAlpha=1; gfx.restore(); };
SC.g5_plaque=inBox((s,u)=>{ const ms=s.t*1000,P=s.plan; let x=P.hx,y=P.hy,k=1;
  if(ms<P.land) { const q=cl(ms/P.land); y=lerp(-40,P.hy,ez(q)); }
  else if(ms<P.grab) { y=P.hy+Math.sin((ms-P.land)/1000*9)*4*Math.max(0,1-(ms-P.land)/500); }
  if(ms<P.grab) { gfx.globalAlpha=1; Ln(x,0,x,y-30,2,'#f2f5fa'); }
  else { const st=s.st,p=head(st,-52),q=ez((ms-P.grab)/220); x=lerp(P.hx,p.x,q); y=lerp(P.hy,p.y,q); k=lerp(1,1.15,q); }
  if(ms>P.beam0&&ms<P.beam1) { gfx.globalAlpha=.5+.3*Math.sin(s.t*30); E(x,y-4,40,40,'#ffffff'); }
  s.x=x; s.y=y; gfx.globalAlpha=fade(u,.94); plaque(x,y,s.t,1.4*k); gfx.globalAlpha=1; });
// The rainbow: from the plaque to every enemy, six bands that wobble.
SC.g5_prism=(s,u)=>{ const P=s.plan,src=P.src(); if(!src) return; const g=ez(u/.2)*fade(u,.75),Gp=P.Gp;
  const xe=Gp.x0-30,ya=Gp.top-30,yb=Gp.base+10,n=6;
  for(let k=0;k<n;k++) { const w0=lerp(ya,yb,k/n)+Math.sin(s.t*8+k)*4,w1=lerp(ya,yb,(k+1)/n)+Math.sin(s.t*8+k+1)*4;
    gfx.globalAlpha=g*.75; PO([[src.x,src.y-4+k-3],[lerp(src.x,xe,g),lerp(src.y,w0,g)],[lerp(src.x,xe,g),lerp(src.y,w1,g)]],RAINBOW[k],0); }
  gfx.globalAlpha=g*.6; PO([[src.x,src.y-4],[lerp(src.x,xe,g),lerp(src.y,(ya+yb)/2-8,g)],[lerp(src.x,xe,g),lerp(src.y,(ya+yb)/2+8,g)]],'#ffffff',0);
  gfx.globalAlpha=1; };
// LIKE thumbs and hearts scroll up the whole screen.
const thumb=(x,y)=>{ EO(x,y,11,11,'#4f86d8'); R(x-6,y-1,9,8,'#ffffff'); R(x-3,y-8,4,8,'#ffffff'); R(x-8,y,3,7,'#ffffff'); };
SC.g5_storm=inBox((s,u)=>{ const n=s.n||34; for(let k=0;k<n;k++) { const sp=.7+((k*37)%10)/14,x=(k*71+13)%560+8+Math.sin(s.t*2+k)*10,y=340-((s.t*sp*220)+(k*53)%200)%380;
  gfx.globalAlpha=fin(u,.06)*fade(u,.8); if(k%3===0) thumb(x,y); else if(k%3===1) heart(x,y,6+(k%2)*2,k%2?PINK:'#ff5a7a'); else bigWord('LIKE',x,y,CREAM,2); } gfx.globalAlpha=1; });
SC.g5_gold=inBox((s,u)=>{ for(let k=0;k<70;k++) { const sp=.6+((k*37)%10)/12,x=(k*97+29)%576+Math.sin(s.t*3+k)*14,y=-10+((s.t*sp*170)+(k*53)%120)%340;
  gfx.globalAlpha=fin(u,.05)*fade(u,.85); gfx.save(); gfx.translate(x,y); gfx.rotate(s.t*6+k); R(-3,-2,6,4,k%4?GOLD:'#fff2b8'); gfx.restore(); } gfx.globalAlpha=1; });
SC.g5_kiss=(s,u)=>{ gfx.globalAlpha=fade(u,.6); heart(lerp(s.x,s.x-120,ez(u)),s.y-Math.sin(u*Math.PI)*30,6+u*10,'#ff5a7a'); gfx.globalAlpha=1; };
SC.g5_prism=inBox(SC.g5_prism);
G.viral_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),me=ST.unit(m),party=b2LiveParty();
  const floor=Math.min(272,me.base-6),cx=Math.round(Math.max(Gp.x1+64,Math.min(me.x-110,Gp.x1+84)));
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:650,x:cx,y:floor,f:'act'},{t:900,f:'celeb',hop:12,hn:2},{t:1500,f:'act'},
    {t:2300,f:'expr',dx:u=>Math.sin(u*Math.PI*6)*2*(1-u)},{t:3000,f:'celeb',hop:16},{t:3200,f:'celeb',dy:(u,tt)=>-Math.abs(Math.sin(tt*6))*3},
    {t:4500,f:'celeb',hop:10,hn:2},{t:5100,f:'act'},{t:5450,f:'runR'},{t:6100,x:'home',y:'home',f:'idle'}]);
  const lp={c0:1300,c1:2250,off:5600};
  const pp={land:550,grab:700,beam0:1000,beam1:2100,hx:cx-6,hy:Math.round(floor-GH()-70)};
  let pl=null;
  ST.play(E2,[
    [0,()=>{ scene('g5_bars',6.2,{}); setMessage('Grace grabs her hairbrush. It\'s a microphone now. She\'s going LIVE.'); say(m.id,'viral_ult'); scene('g5_brush',6.2,{to:3000}); }],
    [650,()=>{ scene('g5_live',6.1,{plan:lp}); sfx.click&&sfx.click(); b7Later(()=>sfx.ding(),150); }],
    [900,()=>{ scene('g5_big',1.1,{x:cx,y:floor-GH()-40,txt:'HI GUYS!',c:PINK,sc:3}); setMessage('Viewers: 3. Her whole family.'); }],
    [1300,()=>{ setMessage('Then the count starts going up. And UP.'); for(let k=0;k<8;k++) b7Later(()=>sfx.click&&sfx.click(),k*110); }],
    [2250,()=>{ sfx.cheer(); sfx.fanfare(); scene('g5_big',1.3,{x:288,y:120,txt:'10 MILLION!',c:GOLD,sc:5}); setMessage('TEN MILLION SUBSCRIBERS!'); }],
    [2300,()=>{ pl=scene('g5_plaque',2.85,{plan:pp,st}); sfx.whoosh(); }],
    [2900,()=>{ setMessage('A Diamond Play Button drops in on a string. Tinfoil. Glitter glue. Perfect.'); sfx.ding(); }],
    [3300,()=>{ scene('g5_prism',1.5,{plan:{Gp,src:()=>pl&&pl.x!=null?{x:pl.x,y:pl.y}:null}}); scene('g5_storm',2.4,{}); sfx.whoosh(); b7Later(()=>sfx.whoosh(),200); setMessage('She holds it up. It catches the light.'); }],
    ['hf',3900],
    [3900,()=>{ sfx.bonk(); sfx.ding(); for(const f of list) { const F=ST.foe(f); ST.jolt(f,.5); scene('gv_burst',.7,{x:F.x,y:F.mid,n:10,r:46,c:PINK,c2:SKYC}); } landHit(100); scene('flash',.3,{a:.45});
      scene('g5_big',1.1,{x:Gp.x,y:Gp.top-74,txt:'SPARKLE!',c:SKYC,sc:4}); }],
    [4500,()=>{ E2.apply(); sfx.heal(); sfx.cheer(); scene('g5_gold',1.6,{}); for(const p of party) { const q=ST.unit(p); scene('gv_glitter',.9,{x:q.x,y:q.mid,r:40}); }
    }],
    [5100,()=>{ scene('g5_kiss',.9,{x:cx-10,y:floor-GH()*.7}); setMessage('She blows a kiss to the camera. Bye guys!'); }],
    [5350,()=>{ scene('g5_big',.9,{x:cx,y:floor-GH()-30,txt:'BYE GUYS!',c:PINK2,sc:3}); }],
    [6200,'end',()=>res(E2)+'Ten million subscribers. Most of them are family. It still counts.']]); };

// ---------- Diamond Leotard Finale (B6) ----------
// The floor (drawn behind everyone): a royal-blue spring floor with a white boundary line, wiping in from the right.
SC.g5_floor=(s,u)=>{ const ms=s.t*1000,k=ez(ms/450)*(u>.92?(1-u)/.08:1); if(k<=0) return; gfx.save(); gfx.globalAlpha=1;
  const y0=172,clipX=lerp(600,-30,ez(ms/450)); gfx.beginPath(); gfx.rect(clipX,0,640,324); gfx.clip(); gfx.globalAlpha=u>.92?(1-u)/.08:1;
  PO([[30,y0],[546,y0],[600,324],[-24,324]],MAT,0);
  for(let j=0;j<9;j++) { const xa=lerp(30,546,j/8),xb=lerp(-24,600,j/8); Ln(xa,y0,xb,324,2,MATD); }
  for(let j=1;j<4;j++) { const y=lerp(y0,324,j/4); Ln(lerp(30,-24,j/4),y,lerp(546,600,j/4),y,1,MATD); }
  gfx.strokeStyle='#ffffff'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(50,y0+8); gfx.lineTo(526,y0+8); gfx.lineTo(572,316); gfx.lineTo(4,316); gfx.closePath(); gfx.stroke();
  gfx.restore(); };
// Sequins all over her (the diamond leotard): twinkling glints on her body, wherever the path takes her.
SC.g5_sequins=(s,u)=>{ const st=s.st; if(!st||st.x==null||st.y<-20) return; const h=GH()*(st.sc||1);
  for(let j=0;j<7;j++) { const q=(s.t*2.2+j*.31)%1,x=st.x-8+((j*7)%16),y=st.y-h*(.25+((j*11)%30)/100); gfx.globalAlpha=Math.sin(q*Math.PI)*fade(u,.9); star(x,y,1.5+q*2.5,j%2?'#ffffff':SKYC); }
  gfx.globalAlpha=1; };
SC.g5_poof=(s,u)=>{ for(let k=0;k<14;k++) { const a=k/14*Math.PI*2,d=ez(u)*(s.r||40); gfx.globalAlpha=1-u; star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.8,4*(1-u)+2,k%2?SKYC:'#ffffff'); }
  if(u<.4) { gfx.globalAlpha=(1-u/.4)*.7; E(s.x,s.y,30,40,'#ffffff'); } gfx.globalAlpha=1; };
// A vortex of gold and pink stars that spins round her while she twists up and off the top of the screen.
SC.g5_vortex=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const cy=Math.max(-10,st.y-GH()*.5);
  for(let k=0;k<12;k++) { const a=s.t*9+k/12*Math.PI*2,r=26+(k%3)*10; gfx.globalAlpha=fade(u,.8); star(st.x+Math.cos(a)*r,cy+Math.sin(a)*r*.45+(k%4-2)*14,3+(k%2)*2,k%2?PINK:GOLD); }
  (s.pts=s.pts||[]).push([st.x,cy,s.t]); for(const [x,y,t0] of s.pts) { const a=1-(s.t-t0)/.45; if(a<=0) continue; gfx.globalAlpha=a*.7; E(x,y,8*a+2,8*a+2,k5(t0)); }
  gfx.globalAlpha=1; };
const k5=t=>RAINBOW[Math.floor(t*14)%6];
// The meteor: a streak behind her on the way down.
SC.g5_meteor=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const cy=st.y-GH()*.5;
  for(let k=0;k<5;k++) { gfx.globalAlpha=(1-k/5)*.6*fade(u,.8); E(st.x+k*3,cy-k*26,16-k*2,22-k*2,k%2?PINK:GOLD); } gfx.globalAlpha=1; };
SC.g5_shock=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,10+q*120,4+q*30,4,k%2?GOLD:'#ffffff'); } gfx.globalAlpha=1; };
SC.g5_score=(s,u)=>{ const g=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.12)); gfx.globalAlpha=fade(u,.82); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(s.rot||0); gfx.scale(g,g);
  R(-3,16,6,24,OUT); R(-2,16,4,23,'#8a5a30'); R(-28,-20,56,40,OUT); R(-26,-18,52,36,CREAM); R(-26,-18,52,7,s.c||PINK); label('10.0',0,-5,'#2b2a26',3); gfx.restore(); gfx.globalAlpha=1; };
// The diamond leotard: her lavender top swaps to icy sequin colors for the routine (palette letters of GRACE_BT), then back.
const LEO={s:'#4fbfee',v:'#8fdcff',x:'#c4efff',y:'#eafcff',n:'#2f96c8',j:'#1f6a9a'};let leoWas=null;
const leotard=on=>{ const pal=BATTLE_SPRITES.grace&&BATTLE_SPRITES.grace.pal; if(!pal) return;
  if(on&&!leoWas) { leoWas={}; for(const k in LEO) { leoWas[k]=pal[k]; pal[k]=LEO[k]; } }
  else if(!on&&leoWas) { for(const k in leoWas) pal[k]=leoWas[k]; leoWas=null; } };
G.olympic_ult=E2=>{ const {m,fx}=E2,f=foesOf(E2)[0],F=ST.unit(f),me=ST.unit(m),judges=b2LiveFoes().filter(x=>x!==f),party=b2LiveParty(),others=party.filter(p=>p!==m);
  const corner={x:536,y:194},launch={x:Math.min(520,F.x+F.w*.5+120),y:Math.min(312,F.base+6)},land={x:Math.min(548,F.x+F.w*.5+34),y:Math.min(314,F.base+3)};
  const tw=n=>u=>-ez(u)*Math.PI*2*n;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walkR'},{t:650,x:corner.x,y:corner.y,f:'idle'},{t:700,f:(u,tt)=>Math.floor(tt*16)%2?'idle':'flip',sc:u=>1+Math.sin(u*Math.PI)*.15},
    {t:1150,f:'celeb'},{t:1650,f:'idle',dy:u=>Math.sin(u*Math.PI)*-3},{t:1850,f:'run',ease:'in'},{t:2550,x:launch.x,y:launch.y,f:'kneel'},
    {t:2700,f:'idle',rot:tw(3),ease:'in',ns:true},{t:3250,x:launch.x-30,y:-90,f:'idle',hide:true,ns:true},
    {t:3500,x:land.x+60,y:-120,f:'idle',rot:u=>-Math.PI*.15,ease:'in',ns:true},{t:3800,x:land.x,y:land.y,f:'kneel'},{t:4000,f:'celeb',sc:1.12},
    {t:5100,f:'runR'},{t:5900,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ scene('g5_bars',6.0,{}); scene('g5_floor',5.8,{back:true}); setMessage('The whole floor turns into a championship spring floor.'); say(m.id,'olympic_ult'); sfx.floorMusic(); }],
    [700,()=>{ scene('g5_poof',.8,{x:corner.x,y:corner.y-GH()*.5}); scene('g5_sequins',5.2,{st}); leotard(true); sfx.spin&&sfx.spin(); setMessage('Grace twirls into her diamond leotard. Sequins. So many sequins.'); }],
    [1150,()=>{ scene('g5_text',1,{st,txt:'ARMS UP!',c:PINK2}); sfx.ding(); setMessage('Corner of the mat. She salutes the judges.'); }],
    [1300,()=>{ judges.forEach((j,k)=>{ const J=ST.foe(j); b7Later(()=>{ scene('g5_score',2.2,{x:J.x+6,y:J.top-34,rot:(k%2?-.1:.1),c:CONF[k%CONF.length]}); lift(j,-6,0,0); },k*160); }); if(judges.length) setMessage('The other monsters are the judges now. They weren\'t asked.'); }],
    [1650,()=>{ setMessage('Deep breath.'); }],
    [1850,()=>{ sfx.whoosh(); setMessage('She sprints the diagonal!'); }],
    [2700,()=>{ scene('g5_vortex',.6,{st}); sfx.jumpWhistle&&sfx.jumpWhistle(); sfx.whoosh(); b7Later(()=>sfx.whoosh(),180); setMessage('Triple twist! Straight up! Off the top of the screen!'); }],
    [3250,()=>{ scene('g5_big',.5,{x:launch.x-30,y:84,txt:'...',c:CREAM,sc:4}); }],
    [3500,()=>{ scene('g5_meteor',.32,{st}); sfx.whoosh(); }],
    ['hf',3800],
    [3800,()=>{ sfx.thud(); sfx.bonk(); sfx.stun&&sfx.stun(); ST.jolt(f,.7); lift(f,-14,.25,-10); landHit(100); E2.apply(); scene('flash',.35,{a:.6}); scene('g5_shock',.8,{x:F.x,y:F.base});
      scene('gv_burst',.8,{x:F.x,y:F.mid,n:12,r:56,c:GOLD,c2:PINK}); scene('g5_big',1.2,{x:F.x,y:F.top-104,txt:'PERFECT 10!',c:GOLD,sc:4}); }],
    [4000,()=>{ sfx.cheer(); sfx.fanfare(); scene('g5_text',1.1,{st,txt:'STUCK IT!',c:PINK2}); }],
    [4300,()=>{ const pts=[F.x-40,F.x+10,F.x+60]; pts.forEach((x,k)=>b7Later(()=>{ scene('g5_score',1.6,{x,y:Math.max(70,F.top-24-(k===1?16:0)),rot:(k-1)*.12,c:CONF[k]}); sfx.ding(); },k*150));
      others.forEach((p,k)=>{ battle.fx[p.idx].hop=.4; const q=ST.unit(p); scene('g5_text',.9,{x:q.x,y:q.top-10,txt:'GO!',c:MINT,sc:2}); }); if(others.length) setMessage('Everyone else rushes to the front of the line.'); }],
    [5900,()=>leotard(false)],
    [6000,'end',()=>{ leotard(false); return res(E2)+'Tens across the board. The judges were the monsters. They had no choice.'; }]]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// Glitter Nails: a big sparkly bottle, and a big glittering hand on each friend. Like and Subscribe: the SUBSCRIBE button
// is huge and its shadow grows before it bonks. Dumpling Drop: fewer, bigger squishies that squash and bounce. Split
// Leap: a slow-motion freeze at the top of the split. Same numbers, same beats. Overrides SC.gv_bottle, SC.gv_bignail,
// SC.gv_subbtn, SC.gv_rain and G.split_leap. Scenes prefix gp_.
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
const G=RECRUIT_MOVES.grace,star=RFX.gStar,dumpling=RFX.gDumpling;
const PINK='#ff7fb3',PINK2='#ffc1dc',PURP='#b48fe0',GOLD='#ffe08a',CREAM='#fff8e8',RED='#e8402e',MINT='#9be39a',SKYC='#9fe8ff',SKIN='#f6d4b8';
const CONF=[PINK,PURP,GOLD,SKYC,MINT,'#ffb45a'];
ST.nw('gp_');
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const GSP=()=>BATTLE_SPRITES.grace,GH=()=>GSP().idle.length*GSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-GH()*(st.sc||1)*.84+dy});
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const S=k=>{ if(sfx[k]) sfx[k](); };

// ---------- Glitter Nails: big bottle, glittering hands ----------
const bottle=(x,y,a,sc)=>{ if(PROPART.draw('grace/pink_nail_polish_bottle',x,y-1*sc,{h:46*sc,rot:a})) return;   // painted bottle; the drawn one below is the fallback
  gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(sc,sc); R(-11,-6,22,30,OUT); R(-9,-4,18,26,PINK); R(-6,0,4,18,'#ffd0e6'); for(let k=0;k<6;k++) R(-6+(k%3)*5,4+Math.floor(k/3)*9,2,2,k%2?GOLD:CREAM);
  R(-6,-24,12,20,OUT); R(-4,-22,8,16,'#2b2a26'); R(-3,-21,2,12,'#5a5a60'); gfx.restore(); };
SC.gv_bottle=(s,u)=>{ const h=hand(); gfx.globalAlpha=fade(u,.95); const x=h.x-8,y=h.y-14; bottle(x,y,-.3+Math.sin(s.t*12)*.15,2);
  for(let k=0;k<5;k++) { const a=s.t*4+k*1.26,r=34+Math.sin(s.t*6+k)*4; star(x+Math.cos(a)*r,y-4+Math.sin(a)*r*.7,3+Math.sin(s.t*9+k)*1.5,CONF[k%CONF.length]); } };
const glitterHand=(x,y,sc,c,t)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  EO(0,6,10,9,SKIN); for(const [fx,fy,h] of [[-8,-2,10],[-3,-6,13],[2,-6,14],[7,-4,12]]) { RO(fx-2,fy-h,5,h+6,SKIN); E(fx+.5,fy-h+2,2.6,3,c); E(fx-.4,fy-h+1,.9,1.2,'#ffffff'); }
  RO(9,2,7,5,SKIN); E(14,3,2.4,2.2,c); gfx.restore(); };
SC.gv_bignail=(s,u)=>{ const g=u<.15?ez(u/.15)*1.3:lerp(1.3,1,cl((u-.15)/.15)); gfx.globalAlpha=fade(u,.82); if(!PROPART.draw('grace/giant_glitter_nail',s.x,s.y,{h:58*g})) glitterHand(s.x,s.y,2.2*g,s.c||PINK,s.t);   // painted giant glitter nail (pink); the drawn hand is the fallback
  for(let k=0;k<8;k++) { const q=((s.t*1.4)+k/8)%1,a=k*.8; gfx.globalAlpha=fade(u,.82)*Math.sin(q*Math.PI); star(s.x+Math.cos(a)*(22+q*22),s.y-10+Math.sin(a)*(18+q*14)-q*12,2+Math.sin(q*Math.PI)*4,CONF[k%CONF.length]); } };

// ---------- Like and Subscribe: a huge button ----------
SC.gv_subbtn=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f),w=230,h0=66; let y,sq=1; const done=ms>P.hit+200,land=F.top-h0*.5+4;
  if(ms<P.hit) { const q=ms/P.hit; y=lerp(-80,land,q*q); gfx.globalAlpha=.25+q*.3; E(F.x,F.base+2,w*.25+q*w*.25,10,'#000000'); } else { const q=cl((ms-P.hit)/450); y=land-Math.sin(q*Math.PI)*22; sq=ms<P.hit+140?.72:1; }
  const h=h0*sq,x=F.x; gfx.globalAlpha=fade(u,.9);
  if(!done&&PROPART.draw('grace/subscribe_button',x,y,{w:w*.8,sy:sq})) { /* painted red button; once SUBSCRIBED it turns to the drawn grey one */ }
  else { gfx.save(); gfx.translate(x,y); R(-w/2-4,-h/2-4,w+8,h+8,OUT); R(-w/2,-h/2,w,h,done?'#9aa0aa':RED); R(-w/2,-h/2,w,8,done?'#c0c6d0':'#ff7a6a'); R(-w/2,h/2-6,w,6,done?'#80868f':'#b02a1e');
  label(done?'SUBSCRIBED':'SUBSCRIBE',18,-8,CREAM,3); gfx.beginPath(); gfx.moveTo(-w/2+16,-14); gfx.lineTo(-w/2+16,14); gfx.lineTo(-w/2+38,0); gfx.closePath(); gfx.fillStyle=CREAM; gfx.fill(); gfx.restore(); }
  if(done) { const r=Math.sin(ms/50)*.45*(1-cl((ms-P.hit-200)/900)),bx=x+w/2+26,by=y-10; gfx.save(); gfx.translate(bx,by); gfx.rotate(r); gfx.scale(1.8,1.8); if(!PROPART.draw('grace/notification_bell',0,2,{h:28})) { EO(0,0,9,10,GOLD); R(-11,6,22,4,OUT); R(-10,6,20,3,GOLD); E(0,12,3,3,OUT); } gfx.restore(); } };

// ---------- Dumpling Drop: fewer, bigger squishies that bounce ----------
SC.gv_rain=(s,u)=>{ const ms=s.t*1000,L=s.L,n=6; for(let k=0;k<n;k++) { const f=L[k%L.length],F=ST.unit(f),t0=k*120,q=(ms-t0)/520; if(q<0) continue;
    const hx=F.x+((k*23)%24-12),hy=F.top-6; let x,y,rot=0,sqx=1,sqy=1;
    if(q<1) { x=hx+(1-q)*((k*13)%40-20); y=lerp(-60,hy,q*q); rot=q*.6; }
    else { const b=q-1,dir=k%2?1:-1; if(b<.18) { const z=Math.sin(b/.18*Math.PI); sqx=1+z*.45; sqy=1-z*.4; x=hx; y=hy+z*6; }
      else { const c=b-.18; x=hx+dir*c*110; y=hy-Math.sin(Math.min(1,c*1.1)*Math.PI)*70+Math.max(0,c-.9)*260; rot=c*5*dir; if(c>1.9) continue; } }
    gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.rotate(rot*.3); gfx.scale(sqx,sqy); const C=[null,'#ffc1dc','#c9a6f0','#9fe8ff','#9be39a','#ffd88a'][k%6];
    if(!C) dumpling(0,0,0,.95); else if(PROPART.draw('grace/plush_squishies',0,0,{h:52})) { /* painted squishy trio */ } else { EO(0,0,26,22,C); E(-9,-6,3,3,OUT); E(9,-6,3,3,OUT); E(-14,2,4,2.5,'#ff9ac0'); E(14,2,4,2.5,'#ff9ac0'); gfx.beginPath(); gfx.arc(0,2,5,.2,Math.PI-.2); gfx.strokeStyle=OUT; gfx.lineWidth=2.5; gfx.stroke(); E(-8,-12,5,3,'#ffffffaa'); }
    gfx.restore(); if(q>=1&&q<1.2) { gfx.globalAlpha=1-(q-1)/.2; bigWord('SQUISH',hx,hy-34,PINK2,2); } } };

// ---------- Split Leap: a slow-motion freeze at the top ----------
SC.gp_slow=(s,u)=>{ const ms=s.t*1000,a=ez(ms/150)*(ms>s.len-150?ez((s.len-ms)/150):1); if(a<=0) return; const st=s.st;
  gfx.globalAlpha=a*.32; R(0,0,576,324,'#2a2060'); gfx.globalAlpha=a; R(0,0,576,18,'#0b0a12'); R(0,306,576,18,'#0b0a12');
  bigWord('SLOW-MO',288,26,PINK2,3); if(st&&st.x!=null) { const y=st.y-GH()*.55; for(let k=0;k<7;k++) { const q=((ms/700)+k/7)%1,a2=k*.9; gfx.globalAlpha=a*Math.sin(q*Math.PI); star(st.x+Math.cos(a2)*(40+q*20),y+Math.sin(a2)*(30+q*10),3+Math.sin(q*Math.PI)*4,CONF[k%CONF.length]); }
    gfx.globalAlpha=a*.85; for(let k=1;k<5;k++) Ln(st.x+18+k*16,y-16+k*6,st.x+40+k*16,y-16+k*6,3,k%2?PINK2:CREAM); } };
G.split_leap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),list=b2LiveFoes(),Gp=ST.group(list.length?list:[f]),F=ST.unit(f),me=ST.unit(m),L=lowest(),LU=L?ST.unit(L):null;
  const start={x:Math.min(552,Gp.x1+60),y:Math.min(314,Gp.base+6)},far={x:Math.max(26,Gp.x0-34),y:Math.min(314,Gp.base+6)},topY=Math.max(70,F.top-24),ax=F.x+18;
  const up=900,apex=1350,go2=2250,land=2700,hit=2350;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:start.x,y:start.y,f:'run'},{t:up,f:'act',sc:1.15,ease:'out',ns:true},{t:apex,x:ax,y:topY,f:'act',sc:1.3,dx:u=>-u*8,dy:u=>-Math.sin(u*Math.PI)*3,ease:'lin',ns:true},
    {t:go2,x:ax-8,y:topY,f:'act',sc:1.15,ease:'in',ns:true},{t:land,x:far.x,y:far.y,f:'celeb',hop:10},{t:land+350,f:'flip'},{t:land+650,f:'runR'},{t:land+1650,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace takes a running start.'); say(m.id,'split_leap'); scene('gv_leap',(land+100)/1000,{st,from:up,to:land}); }],
    [up,()=>{ S('jumpWhistle'); setMessage('A split leap over the whole row.'); }],
    [apex,()=>{ S('click'); scene('gp_slow',(go2-apex)/1000,{st,len:go2-apex}); scene('gv_big',(go2-apex)/1000,{x:288,y:310,txt:'SPLIT LEAP!',c:PINK,sc:3}); setMessage('She freezes at the top. Perfect split. Hold it. Hold it.'); }],
    ['hf',hit],
    [hit,()=>{ S('bonk'); ST.jolt(f,.55); landHit(100); scene('gv_burst',.6,{x:F.x,y:F.top,n:8,r:40}); }],
    [land,()=>{ S('thud'); E2.apply(); if(LU) { scene('gr_heart',1.1,{x:LU.x,y:LU.top-8,r:8}); scene('gv_text',1,{x:LU.x,y:LU.top-24,txt:'GUARDED',c:SKYC,sc:1}); } }],
    [land+350,()=>{ scene('gv_text',.8,{st,txt:'TA-DA',c:GOLD}); S('ding'); }],
    [land+1750,'end',res(E2)+'Clean over the top. Not one toe touched them. Well, one did.']]); };
})();

// ================= Tom's move feedback (2026-10-26, claude/grace-moves-feedback.md) =================
// Three moves rebuilt on Grace's pose rig (data/grace-wheel.js: her own head and torso, arms and legs placed by angle):
// DANCE is a real eight-count (step-touch, grapevine, hips, spin, final pose) with planted feet; Dance Battle is a
// taunting dance-off; Handstand Contest is a true handstand (hands on the floor, legs straight up, hair hanging) while
// Tom and Rose wobble and topple. Same numbers, lines and closing messages. Scenes prefix gf_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const G=RECRUIT_MOVES.grace,star=RFX.gStar,W=GRACE_WHEEL,S=W.scale,HC=W.C*S,D=Math.PI/180;
const PINK='#ff7fb3',PINK2='#ffc1dc',GOLD='#ffe08a',CREAM='#fff8e8',MINT='#9be39a',SKYC='#9fe8ff',PURP='#b48fe0';
ST.nw('gf_');
const S_=n=>{ if(sfx[n]) sfx[n](); };
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const GSP=()=>BATTLE_SPRITES.grace,GH=()=>GSP().idle.length*GSP().scale;
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
SC.gf_word=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.25:lerp(1.25,1,cl((u-.12)/.12)),sc=s.sc||3,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { x=s.st.x; y=s.st.gy-GH()-30; } x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+30,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.75); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5,s.c||PINK,sc); gfx.restore(); };
SC.gf_dust=(s,u)=>{ gfx.globalAlpha=(1-u)*.85; for(const dx of [-6,0,6]) E(s.x+dx*(1+u*1.4),s.y-2-u*6,2.5+u*3.5,1.8+u*2.5,'#e8e2d6'); };
SC.gf_shadow=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const lift=Math.max(0,st.lift||0); gfx.globalAlpha=.28*Math.max(.35,1-lift/60); E(st.x,st.gy+4,20-Math.min(10,lift/6),4,'#2f4936'); };
// Floor tap marks under each step: a little pink ring that fades.
SC.gf_tap=(s,u)=>{ const g=ez(u/.3); gfx.globalAlpha=fade(u,.3)*.8; gfx.strokeStyle=s.c||PINK2; gfx.lineWidth=2; gfx.beginPath(); gfx.ellipse(s.x,s.y+2,4+g*9,1.5+g*3,0,0,Math.PI*2); gfx.stroke(); };
SC.gf_notes=(s,u)=>{ for(let k=0;k<6;k++) { const q=((s.t*.8)+k/6)%1,x=s.x-70+k*28+Math.sin(q*6+k)*8,y=s.y-q*80; gfx.globalAlpha=(1-q)*fade(u,.85);
  E(x,y,5,4,OUT); E(x,y,3.5,2.6,[PINK,PURP,GOLD,SKYC,MINT][k%5]); Ln(x+4,y,x+4,y-14,2,OUT); } };

// ---------- Poses (added to the rig's table so blends can be cached) ----------
Object.assign(W.P,{
  gf_stand:{lA:-5,lB:5,aA:-14,aB:14},
  gf_bounce:{lA:-7,lB:7,bA:.3,bB:.3,aA:-30,aB:30,cA:.4,cB:.4,eA:-1,eB:-1},
  gf_clapR:{lA:-20,lB:3,aA:58,cA:.7,eA:-1,aB:-58,cB:.7,eB:-1},          // step-touch, hands clap at the chest
  gf_clapL:{lA:-3,lB:20,aA:58,cA:.7,eA:-1,aB:-58,cB:.7,eB:-1},
  gf_vine1:{lA:-26,lB:12,aA:-85,aB:85},                                    // grapevine: step out, arms wide
  gf_vine2:{lA:14,lB:-12,aA:-130,aB:55},                                   // cross behind, one arm up
  gf_swayL:{lA:-8,lB:10,bB:.25,aA:-20,cA:.55,eA:-1,aB:20,cB:.55,eB:-1},    // hands on hips, knee pops
  gf_swayR:{lA:-10,lB:8,bA:.25,aA:-20,cA:.55,eA:-1,aB:20,cB:.55,eB:-1},
  gf_spin:{lA:-2,lB:2,aA:-176,aB:176},
  gf_final:{lA:-30,lB:4,aA:-20,cA:.55,eA:-1,aB:160},                       // hand on hip, arm up, toe pointed
  gf_point:{lA:-14,lB:8,bB:.15,aA:-90,aB:20,cB:.55,eB:-1},                 // points at the monster
  gf_beck1:{lA:-14,lB:8,bB:.15,aA:-75,cA:.1,aB:20,cB:.55,eB:-1},          // come on (fingers out) ...
  gf_beck2:{lA:-14,lB:8,bB:.15,aA:-40,cA:.75,aB:20,cB:.55,eB:-1},         // ... (pulled back in)
  gf_hip:{lA:-4,lB:18,bB:.35,aA:-20,cA:.55,eA:-1,aB:150},                  // hip pop, one hand up
  gf_shim1:{lA:-12,lB:12,bA:.2,bB:.2,aA:-100,aB:100},
  gf_shim2:{lA:-12,lB:12,bA:.2,bB:.2,aA:-80,aB:80},
  gf_vogue:{lA:-24,lB:6,aA:-150,aB:120,cB:.4},
  gf_reach:{lA:-3,lB:3,aA:-172,aB:172},                                    // arms up, about to kick over
  gf_lunge:{lA:-30,lB:10,bA:.3,aA:-172,aB:172},
  gf_hsup:{lA:-3,lB:3,al:1.55,aA:-168,aB:168},                             // the handstand line (drawn upside down)
  gf_hs:{lA:-2,lB:2,al:1.55,aA:-168,aB:168,hang:1},
  gf_hsStrad:{lA:-38,lB:38,al:1.55,aA:-168,aB:168,hang:1},
  gf_hsStag:{lA:-2,lB:24,bB:.5,al:1.55,aA:-168,aB:168,hang:1},
  gf_land:{lA:-12,lB:12,aA:-170,aB:170}});
const PF=(name,mir)=>mir?W.mirror(name,name):W.frame(name);
const PB=(a,b,t,st=3)=>{ const r=W.blend(a,b,t,st); return {q:r.q,fr:W.frame(r.q,r.key)}; };

// A rig body on Grace's battle.fx: at(ms) returns {x,gy,std:frame} (a normal sprite frame standing on gy, optional hop)
// or {x,gy,q,fr,th,hop} (a rig frame; the lowest hand or foot sits on gy). Returns the state scenes follow.
const rigPath=(fx,dur,at)=>{ const st={x:null,gy:null,fx,lift:0}; ST.cur=st;
  fx.path={t:0,dur:dur/1000,st:true,fn:(q,c)=>{ const ms=q*dur,s=at(ms,c)||{},hop=s.hop||0;
    st.x=s.x; st.gy=s.gy; st.lift=hop; st.sp=c.sp; st.sc=1;
    if(s.std) { st.frame=s.std; st.y=s.gy-hop; const [wx,wy]=ST.unwarp(s.x,s.gy-hop); return {cx:wx,base:wy,frame:s.std,rot:s.rot||0,noShadow:true}; }
    const th=s.th||0,hip=s.gy-W.low(s.q,th)*S-hop; st.frame=s.fr; st.y=hip;
    const [wx,wy]=ST.unwarp(s.x,hip+HC); return {cx:wx,base:wy,frame:s.fr,rot:th,noShadow:true}; }};
  scene('gf_shadow',dur/1000,{st}); return st; };
// A non-actor party member on a simple path (offsets from home).
const moveU=(u,dur,fn)=>{ if(!u||u.side!=='party') return; const fx=battle.fx[u.idx]; fx.path={t:0,dur,fn:(q,c)=>{ const r=fn(q,c.t,c)||{}; return {cx:c.origX+(r.dx||0),base:c.origBase+(r.dy||0),rot:r.rot||0,frame:r.frame?(c.sp[r.frame]||c.sp.idle):null}; }}; };

// ---------- DANCE (signature) ----------
// Walk to the middle, snap the count in, then an eight-count on the beat (300 ms): step-touch right, step-touch left,
// grapevine out and back, hip sways, a spin, and the final pose. Each step lands with a dust puff and a tap ring under
// that foot. The party dances along on the same beat. Heal at the final pose.
G.danceShow=E2=>{ const {m,fx}=E2,party=b2LiveParty(),U=party.map(p=>ST.unit(p)),me=ST.unit(m),sp=GSP();
  const px=Math.round(Math.min(...U.map(q=>q.x)))-62,py=Math.min(312,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+22);
  const B0=1500,BT=300,SPIN=B0+8*BT,FIN=SPIN+450,HOME=FIN+700,END=HOME+600;
  // [pose, x offset, mirrored] for the eight beats.
  const CH=[['gf_clapR',-8],['gf_clapL',8],['gf_clapR',-8],['gf_clapL',8],['gf_vine1',-14],['gf_vine2',-24],['gf_vine1',-34],['gf_clapR',-34],
    ['gf_swayL',-26],['gf_swayR',-18]];
  // Eight counts: 1 step R, 2 touch, 3 step L, 4 touch ... folded into the table above (10 poses over 8 beats, 240 ms each).
  const BB=8*BT/CH.length;
  const at=ms=>{
    if(ms<700) { const u=ez(ms/700); return {x:lerp(me.x,px,u),gy:lerp(me.base,py,u),std:sp.idle,hop:Math.abs(Math.sin(u*Math.PI*3))*10}; }
    if(ms<B0) { const k=Math.floor((ms-750)/200); if(ms<750) return {x:px,gy:py,q:W.P.gf_stand,fr:PF('gf_stand')};
      const on=k>=0&&(ms-750)%200<110; const n=on?'gf_bounce':'gf_stand'; return {x:px,gy:py,q:W.P[n],fr:PF(n)}; }
    if(ms<SPIN) { const i=Math.min(CH.length-1,Math.floor((ms-B0)/BB)),u=((ms-B0)-i*BB)/BB,[n,dx]=CH[i],prev=i?CH[i-1]:['gf_stand',0];
      const b=u<.35?PB(prev[0],n,u/.35,2):{q:W.P[n],fr:PF(n)};
      const th=n==='gf_swayL'?-8*D*ez(u/.4):n==='gf_swayR'?8*D*ez(u/.4):0;
      return {x:px+lerp(prev[1],dx,ez(cl(u/.35))),gy:py,q:b.q,fr:b.fr,th,hop:u<.3?Math.sin(u/.3*Math.PI)*3:0}; }
    if(ms<FIN) { const u=(ms-SPIN)/450,k=Math.floor(u*8)%4,n=k===1||k===3?'sstand':'gf_spin';
      return {x:px+lerp(-18,0,ez(u)),gy:py,q:W.P[n],fr:k>=2?PF(n,1):PF(n),hop:Math.sin(u*Math.PI)*16}; }
    if(ms<HOME) { const u=(ms-FIN)/220; return {x:px,gy:py,q:W.P.gf_final,fr:PF('gf_final'),th:4*D*ez(u),hop:u<1?Math.sin(cl(u)*Math.PI)*6:0}; }
    const u=cl((ms-HOME)/600); return {x:lerp(px,me.x,ez(u)),gy:lerp(py,me.base,ez(u)),std:sp.flip,hop:Math.abs(Math.sin(u*Math.PI*3))*12}; };
  const st=rigPath(fx,END,at);
  const others=party.filter(p=>p!==m);
  const steps=[];
  for(let i=0;i<CH.length;i++) steps.push([B0+Math.round(i*BB),()=>{ S_('step'); const foot=st.x+(CH[i][1]<(i?CH[i-1][1]:0)?-8:8);
    scene('gf_dust',.3,{x:foot,y:py}); scene('gf_tap',.5,{x:foot,y:py,c:i%2?PINK2:GOLD}); if(i%2===0) S_('beat'); }]);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace takes the floor in front of everyone. Dance break.'); say(m.id,'dance'); }],
    [750,()=>{ for(let k=0;k<4;k++) b7Later(()=>{ S_('click'); scene('gf_word',.25,{x:px,y:py-GH()-36,txt:['5','6','7','8'][k],c:k===3?GOLD:CREAM,sc:3}); },k*200); setMessage('Five, six, seven, eight.'); }],
    [B0,()=>{ sfx.dance(); setMessage('Step, touch. Grapevine. Hips. She\'s been practicing this all week.'); scene('gf_notes',(SPIN-B0+600)/1000,{x:px,y:py-GH()-40});
      others.forEach((p,k)=>{ moveU(p,(SPIN-B0)/1000,(q,tt)=>{ const ms=q*(SPIN-B0),b=Math.floor(ms/BT),v=(ms%BT)/BT; return {dx:(b%2?6:-6)*ez(cl(v/.4)),dy:-Math.sin(cl(v/.35)*Math.PI)*5,frame:b%4===3?'celeb':'idle'}; }); }); }],
    ...steps,
    [SPIN,()=>{ S_('whoosh'); setMessage('And spin!'); }],
    ['hf',FIN],
    [FIN,()=>{ E2.apply(); sfx.ding(); sfx.heal(); scene('gv_confetti',1.9,{n:70,seed:3}); scene('gf_word',1.3,{x:px,y:py-GH()-70,txt:'DANCE BREAK!',c:GOLD,sc:4});
      for(const p of party) { const q=ST.unit(p); scene('gv_glitter',.8,{x:q.x,y:q.mid,r:40}); } }],
    [END,'end','Everyone dances. Even the ones who said they wouldn\'t.']]); };

// ---------- Dance Battle (B1) ----------
// Lights down, spotlight on Grace. She struts up, points at the monster, beckons it (COME ON!), then shimmy, hip pop,
// spin into a vogue. Spotlight on the monster: it tries a wobbly move and falls over. Spotlight back on Grace: one
// last strut, a hair flip and a pose that blasts it with sparkles (the hit). She takes its buff. WINNER.
SC.gf_spot=(s,u)=>{ const ms=s.t*1000,P=s.plan,onF=ms>P.b&&ms<P.c,x=onF?P.fx:(s.st&&s.st.x!=null?s.st.x:P.gx),y=onF?P.fy:P.gy;
  gfx.globalAlpha=fin(u,.06)*fade(u,.92)*.5; R(0,0,576,324,'#0a0814');
  gfx.globalAlpha=fin(u,.06)*fade(u,.92)*.4; gfx.fillStyle='#fff6c8'; gfx.beginPath(); gfx.moveTo(x-14,0); gfx.lineTo(x+14,0); gfx.lineTo(x+54,y); gfx.lineTo(x-54,y); gfx.closePath(); gfx.fill();
  gfx.globalAlpha=fade(u,.92); E(x,y,54,10,'rgba(255,246,200,.35)');
  if(ms<1400) label('DANCE BATTLE',(P.gx+P.fx)/2,30,GOLD,3);
  if(ms>P.c+900&&ms<P.c+1900) label('WINNER',P.gx,P.gy-GH()-40,PINK,2); };
SC.gf_foeTry=(s,u)=>{ const f=s.f,ms=s.t*1000,P=s.plan; if(!f) return; f.spinAt=performance.now();
  if(ms<300) { f.oy=-Math.abs(Math.sin(ms/90))*6; f.spin=0; f.ox=0; return; }
  if(ms<700) { const k=(ms-300)/400; f.oy=-Math.abs(Math.sin(ms/70))*10; f.spin=Math.sin(ms/60)*.35; f.ox=Math.sin(ms/80)*8; return; }
  if(ms<1000) { const k=ez((ms-700)/300); f.spin=lerp(Math.sin(700/60)*.35,1.25,k); f.oy=k*6; f.ox=-k*10; return; }
  f.spin=1.25*(1-ez((ms-1000)/400)); f.oy=6*(1-ez((ms-1000)/400)); f.ox=-10*(1-ez((ms-1000)/400)); };
SC.gf_sweat=(s,u)=>{ for(let k=0;k<3;k++) { const q=((s.t*1.6)+k/3)%1; gfx.globalAlpha=(1-q)*fade(u,.8); E(s.x+(k-1)*16+q*(k-1)*10,s.y+q*18,3,4,SKYC); } };
const buffIcon=(x,y)=>{ if(PROPART.draw('grace/green_up_arrow',x,y,{h:30})) return;   // painted green up arrow
  R(x-11,y-11,22,22,OUT); R(x-9,y-9,18,18,MINT); Ln(x,y+5,x,y-5,3,'#1d4a2a'); Ln(x-4,y-1,x,y-5,3,'#1d4a2a'); Ln(x+4,y-1,x,y-5,3,'#1d4a2a'); };
SC.gf_steal=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; let x,y; if(ms<P.hook) { x=P.x; y=P.y+Math.sin(s.t*7)*6; } else { const q=ez((ms-P.hook)/350),tx=st.x,ty=st.gy-GH()-16; x=lerp(P.x,tx,q); y=lerp(P.y,ty,q)-Math.sin(q*Math.PI)*34; } gfx.globalAlpha=fade(u,.9); buffIcon(x,y); };
G.dance_battle=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),sp=GSP();
  const gx=Math.min(me.x-40,F.x+F.w*.5+70),gy=Math.min(314,F.base+3),fy=F.base+3;
  const B=2700,C=3900,END=5600;
  const pose=(n,mir)=>({q:W.P[n],fr:PF(n,mir)});
  const at=ms=>{
    if(ms<650) { const u=ez(ms/650); return {x:lerp(me.x,gx,u),gy:lerp(me.base,gy,u),std:Math.floor(ms/110)%2?sp.idle:sp.act,hop:Math.abs(Math.sin(u*Math.PI*4))*7}; }   // strut
    if(ms<1050) return Object.assign({x:gx,gy},pose('gf_point'));
    if(ms<1700) { const k=Math.floor((ms-1050)/160)%2; return Object.assign({x:gx,gy,hop:k?0:2},pose(k?'gf_beck2':'gf_beck1')); }
    if(ms<2050) { const k=Math.floor((ms-1700)/60)%2; return Object.assign({x:gx+(k?3:-3),gy,th:(k?4:-4)*D},pose(k?'gf_shim1':'gf_shim2')); }          // shimmy
    if(ms<2350) { const u=(ms-2050)/300; return Object.assign({x:gx,gy,th:10*D*ez(u/.3),hop:u<.25?Math.sin(u/.25*Math.PI)*8:0},pose('gf_hip')); }      // hip pop
    if(ms<B) { const u=(ms-2350)/(B-2350),k=Math.floor(u*8)%4,n=k%2?'sstand':'gf_spin'; if(u>.85) return Object.assign({x:gx,gy},pose('gf_vogue'));
      return Object.assign({x:gx,gy,hop:Math.sin(u*Math.PI)*14},pose(n,k>=2)); }
    if(ms<C) { const k=Math.floor((ms-B)/300)%2; return Object.assign({x:gx,gy},pose(k?'gf_swayR':'gf_swayL')); }                               // waits, hands on hips
    if(ms<C+500) { const u=ez((ms-C)/500); return Object.assign({x:gx-u*18,gy,hop:Math.sin(u*Math.PI)*10},pose('gf_vine1')); }                     // one strut in
    if(ms<C+1300) { const u=(ms-C-500)/800; return Object.assign({x:gx-18,gy,th:u<.2?-6*D:0},pose(u<.2?'gf_hip':'gf_final')); }                     // hair flip, pose
    const u=cl((ms-C-1300)/(END-C-1300-100)); return {x:lerp(gx-18,me.x,ez(u)),gy:lerp(gy,me.base,ez(u)),std:sp.flip,hop:Math.abs(Math.sin(u*Math.PI*3))*12}; };
  const st=rigPath(fx,END,at);
  const plan={b:B,c:C,gx,gy,fx:F.x,fy};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace challenges '+f.name+' to a dance battle.'); say(m.id,'dance_battle'); scene('gf_spot',(END-200)/1000,{plan,st,back:true}); scene('gf_steal',(END-300)/1000,{st,plan:{x:F.x,y:F.top-22,hook:C+700}}); }],
    [650,()=>{ S_('select'); scene('gf_word',.6,{st,txt:'YOU.',c:CREAM,sc:3}); }],
    [1050,()=>{ setMessage('She points. She beckons. Come on, then.'); scene('gf_word',.7,{st,txt:'COME ON!',c:PINK,sc:3}); for(let k=0;k<4;k++) b7Later(()=>S_('click'),k*160); }],
    [1700,()=>{ sfx.dance(); for(let k=0;k<6;k++) b7Later(()=>S_('beat'),k*170); scene('gf_word',.4,{x:gx,y:gy-GH()-44,txt:'SHIMMY',c:GOLD,sc:2}); }],
    [2050,()=>{ S_('boing'); scene('gf_word',.4,{x:gx,y:gy-GH()-44,txt:'POP!',c:PINK,sc:3}); scene('gf_dust',.3,{x:gx+8,y:gy}); }],
    [2350,()=>{ S_('whoosh'); }],
    [2650,()=>{ sfx.ding(); scene('gv_burst',.5,{x:gx,y:gy-GH()*.6,n:8,r:40}); }],
    [B,()=>{ setMessage('Its turn. It tries. It really, really tries.'); S_('boing'); scene('gf_foeTry',(C-B)/1000,{f,plan}); scene('gf_word',.5,{x:gx,y:gy-GH()-40,txt:'YOUR TURN',c:CREAM,sc:2}); }],
    [B+700,()=>{ S_('thud'); scene('gf_sweat',1.0,{x:F.x,y:F.top-14}); scene('gf_word',.7,{x:F.x,y:F.top-40,txt:'OOPS',c:SKYC,sc:3}); }],
    [C,()=>{ S_('whoosh'); setMessage('Grace. Big finish.'); }],
    [C+500,()=>{ S_('whoosh'); scene('gf_word',.4,{st,txt:'FLIP',c:PINK2,sc:2}); }],
    ['hf',C+700],
    [C+700,()=>{ sfx.bonk(); sfx.ding(); ST.jolt(f,.5); landHit(100); scene('gv_burst',.6,{x:F.x,y:F.mid,n:12,r:56,c:GOLD,c2:PINK}); scene('gv_confetti',1.2,{n:40,seed:9});
      scene('gf_word',.9,{x:F.x,y:F.top-60,txt:'SERVED!',c:GOLD,sc:4}); }],
    [END,'end',res(E2)+'The judges were unanimous. The judge was Grace.']]); };

// ---------- Handstand Contest (B3) ----------
// Everybody up. Grace lunges, kicks over into a real handstand (hands planted, legs straight, hair hanging down) and
// holds it like a statue. Tom and Rose kick up too (their arms-up frame upside down), wobble harder and harder and
// topple over one at a time: OOF. Grace adds a straddle for style, comes down to a stick, and the trophy appears.
SC.gf_trophy=(s,u)=>{ const g=u<.15?ez(u/.15)*1.25:lerp(1.25,1,cl((u-.15)/.15)); gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(s.x,s.y); gfx.scale(g,g);
  if(PROPART.draw('grace/gold_trophy_cup',0,-6,{h:48})) { gfx.restore(); return; }   // painted trophy; the drawn one below is the fallback
  gfx.beginPath(); gfx.moveTo(-16,-18); gfx.lineTo(16,-18); gfx.lineTo(10,4); gfx.lineTo(-10,4); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=GOLD; gfx.fill();
  gfx.strokeStyle=GOLD; gfx.lineWidth=3; for(const sx of [-1,1]) { gfx.beginPath(); gfx.ellipse(sx*17,-10,6,7,0,0,Math.PI*2); gfx.stroke(); }
  R(-5,2,10,12,OUT); R(-3,4,6,8,GOLD); R(-13,10,26,10,OUT); R(-11,12,22,6,GOLD); label('1',0,-14,'#7a4a10',2); gfx.restore(); };
SC.gf_flipfoe=(s,u)=>{ const f=s.f,ms=s.t*1000,up=ms<s.fall?ez(ms/300):1-ez((ms-s.fall)/400); f.spinAt=performance.now(); f.oy=-up*10; f.ox=0; f.spin=up*Math.PI+Math.sin(ms/90)*.2*up*(1+ms/1500); };
G.handstand_contest=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),me=ST.unit(m),sp=GSP();
  const others=foe?[]:who.filter(u=>u!==m&&u.side==='party');
  const UP=900,HOLD=1400,falls=others.map((u,k)=>2000+k*520),last=falls.length?falls[falls.length-1]+350:2400;
  const STRAD=last+200,DOWN=last+800,LAND=DOWN+450,TROPHY=LAND+100,HOME=LAND+1100,END=HOME+600;
  const X=me.x,GY=me.base;
  const at=ms=>{
    if(ms<500) return {x:X,gy:GY,std:sp.celeb,hop:Math.sin(ms/500*Math.PI)*12};
    if(ms<UP) { const u=ms-500<150?PB('gf_reach','gf_lunge',(ms-500)/150,2):{q:W.P.gf_lunge,fr:PF('gf_lunge')}; return {x:X,gy:GY,q:u.q,fr:u.fr,th:-10*D*ez((ms-500)/400)}; }
    if(ms<HOLD) { const u=ez((ms-UP)/(HOLD-UP)),b=PB('gf_lunge','gf_hsup',u,4),th=lerp(-10*D,-Math.PI,u); return {x:X-u*10,gy:GY,q:b.q,fr:u>.8?PF('gf_hs'):b.fr,th}; }
    if(ms<STRAD) return {x:X-10,gy:GY,q:W.P.gf_hs,fr:PF('gf_hs'),th:-Math.PI};
    if(ms<DOWN) { const u=(ms-STRAD)/(DOWN-STRAD),n=u<.2||u>.85?'gf_hs':(u<.55?'gf_hsStrad':'gf_hsStag'); return {x:X-10,gy:GY,q:W.P[n],fr:PF(n),th:-Math.PI}; }
    if(ms<LAND) { const u=ez((ms-DOWN)/(LAND-DOWN)),b=PB('gf_hsup','gf_land',u,4),th=lerp(-Math.PI,-2*Math.PI,u); return {x:X-10+u*10,gy:GY,q:b.q,fr:u<.15?PF('gf_hs'):b.fr,th}; }
    if(ms<HOME) { const u=(ms-LAND)/300; return {x:X,gy:GY,q:W.P.gf_land,fr:PF('gf_land'),hop:u<1?Math.sin(cl(u)*Math.PI)*8:0}; }
    return {x:X,gy:GY,std:sp.celeb,hop:Math.abs(Math.sin(cl((ms-HOME)/600)*Math.PI*2))*8}; };
  rigPath(fx,END,at);
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Grace challenges '+foe.name+' to a handstand contest.':'Grace calls a handstand contest. Everybody up!'); say(m.id,'handstand_contest'); }],
    [500,()=>{ scene('gv_big',1.2,{x:me.x-80,y:Math.max(60,me.top-60),txt:'HANDSTAND CONTEST!',c:PINK,sc:2}); sfx.charge(); }],
    [UP,()=>{ sfx.whoosh();
      others.forEach((u,k)=>{ const fall=falls[k]-UP,dur=fall+900; moveU(u,dur/1000,(q,tt)=>{ const ms=q*dur;
        if(ms<350) { const up=ez(ms/350); return {rot:up*Math.PI,dy:-up*6,frame:'celeb'}; }
        if(ms<fall) { const g=(ms-350)/(fall-350),w=Math.sin(tt*(7+k*2))*(.06+g*.3); return {rot:Math.PI+w,dx:Math.sin(tt*(5+k))*g*6,dy:-6,frame:'celeb'}; }
        if(ms<fall+300) { const v=ez((ms-fall)/300); return {rot:Math.PI+(k%2?-1:1)*v*Math.PI*.55,dx:(k%2?-1:1)*v*14,dy:-6+v*8,frame:'celeb'}; }
        return {rot:0,frame:'kneel',dy:0}; }); });
      if(foe) scene('gf_flipfoe',(last-UP+600)/1000,{f:foe,fall:last-UP}); }],
    [HOLD,()=>{ sfx.thud(); setMessage('Grace is up. Straight as a pencil. Not even a wobble.'); }],
    ...others.map((u,k)=>[falls[k]+300,()=>{ sfx.thud(); const q=ST.unit(u); scene('gv_text',.8,{x:q.x,y:q.top-14,txt:'OOF',c:CREAM}); }]),
    [STRAD,()=>{ S_('whoosh'); scene('gv_burst',.5,{x:X-10,y:GY-110,n:8,r:40,c:GOLD,c2:CREAM}); }],
    ['hf',STRAD+300],
    [STRAD+300,()=>{ E2.apply(); sfx.heal(); sfx.ding(); for(const u of who) { const q=ST.unit(u); scene('gr_warmring',1.2,{x:q.x,y:q.base}); } }],
    [LAND,()=>{ sfx.thud(); scene('gf_dust',.35,{x:X-10,y:GY}); scene('gf_dust',.35,{x:X+10,y:GY}); }],
    [TROPHY,()=>{ scene('gf_trophy',1.4,{x:me.x,y:me.base+18}); scene('gv_text',1.3,{x:me.x,y:me.base-GH()-60,txt:'GRACE WINS',c:GOLD}); sfx.fanfare(); }],
    [END,'end',foe?foe.name+' warms up a little.':'Grace wins. She was always going to win.']]); };
})();

// ================= Open Strings, Portrait Mode, Bedazzle Blast (2026-10-30) =================
// Three gymnastics primaries replaced with Grace's new interests, same numbers and effects as the moves they replace
// (claude/grace-open-strings-prompt.md, grace-portrait-mode-prompt.md, grace-bedazzle-blast-prompt.md):
//   open_strings   (was beam_dismount): row hit, foes Hooked (no dodging) 2 turns. A first-year violin screech.
//   portrait_mode  (was split_leap): one foe hit, its wind-up cancelled, the most hurt friend Guarded. She draws the monster.
//   bedazzle_blast (was chalk_up): row hit, +25% crit. Rhinestone gun; the foes that crit get the sharp gem.
// Painted frames os_*, pm_*, bz_* (data/grace-extra.js, art/chars/grace-extra.webp, wired in data/grace-hires-use.js) and
// props art/props/grace (screech_burst, sour_note, ... gem_hopper). Scenes prefix gx_ (no aim warp).
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST,G=RECRUIT_MOVES.grace;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const PINK='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',SKYC='#9fe8ff',LIME='#b6e85a',PURP='#b48fe0';
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const front=(F,gap=30)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const rowSpot=(Gp,gap=50)=>({x:Math.min(552,Gp.x1+gap),y:Math.min(314,Gp.base+6)});
const GSP=()=>BATTLE_SPRITES.grace,GH=()=>GSP().idle.length*GSP().scale;
const all=(list,k=.4)=>{ for(const f of list) ST.jolt(f,k); };
const lowest=()=>b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const prop=(id,x,y,o)=>PROPART.draw('grace/'+id,x,y,o);
const rnd=(k,s=0)=>{ const v=Math.sin(k*127.1+s*311.7)*43758.5453; return v-Math.floor(v); };
ST.nw('gx_');
if(!sfx.screech) sfx.screech=(d=0)=>{ tone({type:'sawtooth',f0:1500,f1:2100,dur:.32,vol:.07,delay:d}); tone({type:'sawtooth',f0:1490,f1:2080,dur:.32,vol:.05,delay:d}); noise({dur:.3,vol:.05,f0:3000,f1:5000,type:'bandpass',q:1.2,delay:d}); };
if(!sfx.scribble) sfx.scribble=(d=0)=>{ for(let k=0;k<4;k++) noise({dur:.05,vol:.1,f0:2400,f1:1800,type:'bandpass',q:1.5,delay:d+k*.07}); };
if(!sfx.pew) sfx.pew=(d=0)=>{ tone({type:'square',f0:2200,f1:700,dur:.09,vol:.08,delay:d}); noise({dur:.08,vol:.08,f0:5000,f1:7000,type:'bandpass',q:1,delay:d}); };
// Words and big words that follow the actor's head or sit at a point (same look as gv_big / gv_text).
const head=(st,dy=0)=>({x:st.x,y:st.y-GH()*(st.sc||1)*.84+dy});
SC.gx_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||PINK,sc); gfx.restore(); };
SC.gx_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
// A painted prop flying along an arc from a point near the actor (or a fixed point) to a target, spinning a little, fading at the end.
SC.gx_fly=(s,u)=>{ const e=s.ease==='lin'?u:ez(u),x0=s.st&&s.st.x!=null&&s.ax!=null?s.st.x+s.ax:s.x0,y0=s.st&&s.st.y!=null&&s.ay!=null?s.st.y+s.ay:s.y0;
  if(s.fix==null&&s.st) { s.fix=[x0,y0]; } const fx0=s.fix?s.fix[0]:x0,fy0=s.fix?s.fix[1]:y0;
  const x=lerp(fx0,s.x1,e),y=lerp(fy0,s.y1,e)-Math.sin(u*Math.PI)*(s.arc||30); gfx.globalAlpha=fin(u,.08)*(s.keep?1:fade(u,.8));
  if(!prop(s.id,x,y,{h:s.h||30,rot:(s.rot0||0)+u*(s.spin||0)})) { ellipse(x,y,8,8,s.c||GOLD); } gfx.globalAlpha=1; };
const fly=(id,st,ax,ay,x1,y1,dur,o={})=>scene('gx_fly',dur,Object.assign({id,st,ax,ay,x1,y1},o));

// ---------- Open Strings (B2) ----------
// Grace marches up with her violin, tucks it under her chin, saws out a screeching scale at the row (sour notes fly), the big
// SCREECH hits everyone (ear rings, they cannot hear themselves dodge), a string snaps, she pushes through, big finish, listens
// for applause, shrugs, explains she has only had six lessons, takes a recital bow and walks home proud.
SC.gx_screech=(s,u)=>{ const P=s.plan,q=ez(u/.25),a=fade(u,.6); gfx.globalAlpha=a;
  if(!prop('screech_burst',P.x-26-q*16,P.y,{w:P.w*(.5+.5*q)})) { for(let k=0;k<3;k++) label('SCREE',P.x-20,P.y-20+k*14,GOLD,2); }
  for(const F of P.F) { const t1=u*s.dur*1000-F.d; if(t1<0) continue; const g=ez(t1/260),w=Math.sin(t1/70)*3; gfx.globalAlpha=a*Math.min(1,g*1.2);
    if(!prop('ear_rings',F.x+w,F.top+F.h*.18,{w:Math.max(44,F.w*.7)*(.7+.4*g),rot:t1/900})) { for(let r=1;r<=3;r++) { gfx.strokeStyle=GOLD; gfx.lineWidth=2; gfx.beginPath(); gfx.ellipse(F.x,F.top+F.h*.2,r*10*g,r*7*g,0,0,Math.PI*2); gfx.stroke(); } } }
  gfx.globalAlpha=1; };
G.open_strings=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,72),U=list.map(f=>ST.unit(f));
  const T={in:700,tuck:1050,breath:1400,stroke:1750,wince:2000,saw1:2250,saw2:2500,saw3:2750,saw4:3000,screech:3250,slip:3750,push:3980,finish:4250,listen:4520,shrug:4820,lessons:5100,bow:5520,proud:5850,back:6120,home:6800};   // after the screech the tail runs quick (Tom 22:35)
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'os_arrive',hop:4,hn:5},{t:T.in,x:p.x,y:p.y,f:'os_tuck'},{t:T.breath,f:'os_breath',sc:1.04},{t:T.stroke,f:'os_stroke'},{t:T.wince,f:'os_wince'},
    {t:T.saw1,f:'os_sawup',dx:u=>Math.sin(u*Math.PI)*2},{t:T.saw2,f:'os_sawdown',dx:u=>-Math.sin(u*Math.PI)*2},{t:T.saw3,f:'os_sawup',dx:u=>Math.sin(u*Math.PI)*3},{t:T.saw4,f:'os_sawdown',dx:u=>-Math.sin(u*Math.PI)*3},
    {t:T.screech,f:'os_screech',dx:(u,tt)=>Math.sin(tt*60)*2,sc:1.06},{t:T.slip,f:'os_slip'},{t:T.push,f:'os_push',dx:(u,tt)=>Math.sin(tt*40)*1.5},{t:T.finish,f:'os_finish',hop:8},{t:T.listen,f:'os_listen'},
    {t:T.shrug,f:'os_shrug'},{t:T.lessons,f:'os_lessons'},{t:T.bow,f:'os_bow'},{t:T.proud,f:'os_proud'},{t:T.back,f:'os_arriveR',hop:4,hn:4},{t:T.home,x:'home',y:'home',f:'idle'}]);
  const note=(id,k,at,dur=.75)=>{ const tx=Gp.x0+rnd(k,1)*Math.max(40,Gp.w),ty=Gp.top-10+rnd(k,2)*(Gp.base-Gp.top)*.7; fly(id,st,-30,-GH()*.62,tx,ty,dur,{arc:24+rnd(k,3)*30,spin:(rnd(k,4)-.5)*3,h:26+rnd(k,5)*10,rot0:(rnd(k,6)-.5)*.6}); };
  const plan={x:Gp.x1-4,y:Gp.top+(Gp.base-Gp.top)*.45,w:Math.max(80,Math.min(140,Gp.w*.8)),F:U.map((q,k)=>({x:q.x,top:q.top,h:q.h,w:q.w,d:k*70}))};
  ST.play(E2,[
    [0,()=>{ setMessage('Grace marches up with her violin. First year. Six lessons.'); }],
    [T.in,()=>{ sfx.select(); setMessage('Under the chin. Elbows up. Very professional.'); }],
    [T.breath,()=>{ scene('gx_text',.5,{st,txt:'...',c:CREAM}); }],
    [T.stroke,()=>{ sfx.screech(); note('sour_note',1,0); setMessage('The first note. It is not a note anyone asked for.'); }],
    [T.saw1,()=>{ sfx.screech(); sfx.screech(.25); note('wobbly_notes',2,0); note('sour_note',3,0,.9); }],
    [T.saw3,()=>{ sfx.screech(); sfx.screech(.25); note('cracked_note',4,0); note('wobbly_notes',5,0,.9); setMessage('A scale. Allegedly.'); }],
    ['hf',T.screech],
    [T.screech,()=>{ sfx.screech(); sfx.screech(.12); sfx.screech(.24); all(list,.6); landHit(100); E2.apply(); scene('gx_screech',.9,{plan}); scene('gx_big',.9,{x:Gp.x,y:Gp.top-60,txt:'SCREEEE!',c:GOLD,sc:4}); setMessage('The open strings. Every monster covers its ears. Nobody is dodging anything.'); }],
    [T.slip,()=>{ sfx.click(); fly('snapped_string',st,-36,-GH()*.7,st.x-70,p.y-10,.55,{arc:40,spin:2,h:22}); scene('gx_text',.6,{st,txt:'TWANG',c:LIME}); }],
    [T.push,()=>{ sfx.screech(); note('sour_note',6,0,.7); setMessage('A string snaps. She keeps going. That is showmanship.'); }],
    [T.finish,()=>{ sfx.ding(); scene('gx_big',.8,{st,txt:'BIG FINISH',c:PINK,sc:3}); }],
    [T.listen,()=>{ setMessage('She listens for applause.'); }],
    [T.shrug,()=>{ sfx.select(); }],
    [T.lessons,()=>{ say(m.id,'open_strings'); scene('gx_text',1,{st,txt:'SIX LESSONS',c:CREAM}); }],
    [T.bow,()=>{ sfx.ding(); scene('gx_text',.8,{st,txt:'THANK YOU',c:GOLD}); }],
    [T.home+100,'end',res(E2)+'Her teacher says she is improving. Her teacher is very kind.']]); };

// ---------- Portrait Mode (B4) ----------
// Sketchbook out. She measures the monster with her pencil, orders it to hold still (its wind-up is cancelled), draws it at
// lightning speed (scribbles, shavings, eraser crumbs), signs with a flourish, jabs the pencil at it like a tiny fencer (the hit),
// rips the page out, admires it, and turns to hold the drawing up in front of the most hurt friend (Guard).
SC.gx_page=(s,u)=>{ const P=s.plan,ms=u*s.dur*1000; let x,y,h,a=1,rot=0;
  if(ms<P.show) return;
  if(ms<P.turn) { const q=ez((ms-P.show)/300); const hd=head(P.st,-10); x=hd.x+6; y=hd.y-30-q*26; h=lerp(30,78,q); rot=Math.sin(ms/400)*.06; }
  else { const q=ez((ms-P.turn)/450); const hd=head(P.st,-10); x=lerp(hd.x+6,P.gx,q); y=lerp(hd.y-56,P.gy,q); h=lerp(78,P.gh,q); a=fade(u,.9); }
  gfx.globalAlpha=a; if(!prop('portrait_page',x,y,{h,rot})) { rect(x-h*.35,y-h*.5,h*.7,h,'#fffaf0'); label('ART',x,y,'#444',2); } gfx.globalAlpha=1; };
SC.gx_sketchfx=(s,u)=>{ const P=s.plan,ms=u*s.dur*1000; gfx.globalAlpha=1;
  for(const b of P.bits) { const t1=ms-b.at; if(t1<0||t1>b.len) continue; const q=t1/b.len,h=s.st.x!=null?s.st.x:0; const hd=head(s.st,0);
    const x=hd.x+b.dx+(b.vx||0)*q*60,y=hd.y+b.dy+(b.vy||0)*q*60+(b.g?ez(q)*b.g:0); gfx.globalAlpha=fin(q,.1)*fade(q,.7);
    prop(b.id,x,y,{h:b.h,rot:(b.spin||0)*q}); }
  gfx.globalAlpha=1; };
G.portrait_mode=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),p=front(F,62),L=lowest(),LU=L?ST.unit(L):null,selfL=!L||L===m;
  const T={in:700,open:1000,measure:1350,pose:1750,sketchA:2250,sketchB:2550,compare:2850,sketchC:3100,erase:3450,sign:3800,jab:4150,tear:4600,admire:4950,shield:5550,wink:6250,back:6650,home:7450};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'pm_arrive',hop:4,hn:5},{t:T.in,x:p.x,y:p.y,f:'pm_open'},{t:T.measure,f:'pm_measure'},{t:T.pose,f:'pm_pose'},{t:T.sketchA,f:'pm_sketchA',dx:(u,tt)=>Math.sin(tt*50)*1.2},
    {t:T.sketchB,f:'pm_sketchB',dx:(u,tt)=>Math.sin(tt*50)*1.2},{t:T.compare,f:'pm_compare'},{t:T.sketchC,f:'pm_sketchC',dx:(u,tt)=>Math.sin(tt*60)*1.5},{t:T.erase,f:'pm_erase',dx:(u,tt)=>Math.sin(tt*40)*2},{t:T.sign,f:'pm_sign'},
    {t:T.jab,f:'pm_jab',dx:u=>-ez(Math.min(1,u*3))*26*(1-ez((u-.7)/.3)),ease:'out'},{t:T.tear,f:'pm_tear'},{t:T.admire,f:'pm_admire'},{t:T.shield,f:'pm_shield'},{t:T.wink,f:'pm_wink'},{t:T.back,f:'pm_leaveR',hop:4,hn:4},{t:T.home,x:'home',y:'home',f:'idle'}]);
  const gx=Math.min(528,selfL?me.x-44:LU.x-LU.w*.5-18),gy=selfL?me.mid:LU.mid,gh=Math.max(56,Math.min(90,(selfL?me.h:LU.h)*.8));
  const page={show:0,turn:T.shield-T.admire,st,gx,gy,gh};   // times from the scene start (T.admire)
  const bits=[{id:'scribble_cloud',at:T.sketchA,len:650,dx:-34,dy:44,h:40,spin:.4},{id:'pencil_shavings',at:T.sketchA+200,len:700,dx:-16,dy:34,h:22,vx:-.6,g:40,spin:3},{id:'scribble_cloud',at:T.sketchC,len:420,dx:-30,dy:40,h:46,spin:-.5},
    {id:'pencil_shavings',at:T.sketchC+100,len:700,dx:-20,dy:32,h:20,vx:.5,g:44,spin:-3},{id:'eraser_crumbs',at:T.erase+80,len:700,dx:-36,dy:44,h:26,vx:-.9,g:38},{id:'blank_page',at:T.tear+80,len:900,dx:-10,dy:-10,h:40,vx:-.5,vy:-1.1,spin:1.2}];
  ST.play(E2,[
    [0,()=>{ setMessage('Grace walks up with her sketchbook. '+f.name+' is about to get drawn.'); }],
    [T.in,()=>{ sfx.select(); }],
    [T.measure,()=>{ sfx.click(); scene('gx_text',.5,{st,txt:'HMM',c:CREAM}); setMessage('One eye closed. Pencil out. She is measuring it.'); }],
    [T.pose,()=>{ say(m.id,'portrait_mode'); sfx.stun(); ST.jolt(f,.2); scene('gx_fly',.5,{id:'sketch_burst',x0:F.x,y0:F.mid,x1:F.x,y1:F.mid,h:F.h*.7,keep:true}); scene('gx_big',1,{x:F.x,y:F.top-54,txt:'HOLD IT!',c:SKYC,sc:3}); setMessage(f.name+' freezes mid pose. Whatever it was winding up is cancelled.'); }],
    [T.sketchA,()=>{ sfx.scribble(); scene('gx_sketchfx',(T.tear+1000-T.sketchA)/1000,{st,plan:{bits:bits.map(b=>Object.assign({},b,{at:b.at-T.sketchA}))}}); }],
    [T.sketchB,()=>{ sfx.scribble(); setMessage('Scribble scribble scribble. Tongue out. Very serious.'); }],
    [T.compare,()=>{ scene('gx_text',.5,{st,txt:'HMM',c:CREAM}); }],
    [T.sketchC,()=>{ sfx.scribble(); sfx.scribble(.2); }],
    [T.erase,()=>{ sfx.chalk?sfx.chalk():sfx.click(); setMessage('A little eraser. Blow the crumbs off.'); }],
    [T.sign,()=>{ sfx.ding(); scene('gx_text',.7,{st,txt:'SIGNED',c:GOLD}); }],
    ['hf',T.jab+120],
    [T.jab+120,()=>{ sfx.bonk(); ST.jolt(f,.6); landHit(100); E2.apply(); scene('gx_fly',.5,{id:'sketch_burst',x0:F.x+F.w*.3,y0:F.mid,x1:F.x+F.w*.3,y1:F.mid,h:F.h*.7,keep:true,spin:1}); scene('gx_big',.8,{x:F.x,y:F.top-60,txt:'POKE!',c:PINK,sc:4}); setMessage('And a pencil jab. For the art.'); }],
    [T.tear,()=>{ sfx.crunch?sfx.crunch():sfx.click(); setMessage('RIP. Out comes the page.'); }],
    [T.admire,()=>{ sfx.ding(); scene('gx_page',(T.home-T.admire)/1000,{plan:page}); scene('gx_text',.9,{st,txt:'OOH',c:CREAM}); }],
    [T.shield,()=>{ sfx.whoosh(); if(!selfL) { scene('gx_text',1.1,{x:LU.x,y:LU.top-24,txt:'GUARDED',c:SKYC,sc:1}); } else scene('gx_text',1.1,{st,txt:'GUARDED',c:SKYC,sc:1}); setMessage(selfL?'She holds the drawing up like a shield.':'She holds the drawing up in front of '+L.name+'. A shield. Signed.'); }],
    [T.wink,()=>{ sfx.select(); }],
    [T.home+100,'end',res(E2)+'It is actually a really good drawing. The monster did not deserve it.']]); };

// ---------- Bedazzle Blast (B5) ----------
// Out comes the pink rhinestone gun. Load, safety off, aim, and she sprays the whole row with gems, sweeping low and high. Gems
// stick to every monster; the ones that crit get the sharp teardrop gem point first with a big sparkle. She blows on the tip,
// inspects, decides they need MORE sparkle, tops them up, admires, poses.
SC.gx_gems=(s,u)=>{ const P=s.plan,ms=u*s.dur*1000; const fa=fade(u,.88);
  for(const g of P.gems) { const t1=ms-g.at; if(t1<0) continue; const q=ez(t1/180),a=fa; gfx.globalAlpha=a*Math.min(1,q*1.4);
    if(!prop(g.id,g.x,g.y-(1-q)*6,{h:g.h*(g.sharp?1:(.6+.4*q)),rot:g.rot})) ellipse(g.x,g.y,g.h*.4,g.h*.4,g.c||PINK);
    if(g.sharp&&t1<700) { const k=Math.sin(Math.min(1,t1/700)*Math.PI); gfx.globalAlpha=a*k; prop('sparkle_star',g.x+6,g.y-10,{h:g.h*1.7*(0.6+k),rot:t1/400}); }
    else if(t1>300&&((t1/260)|0)%3===(g.k%3)) { gfx.globalAlpha=a*.9; prop('sparkle_star',g.x+g.h*.3,g.y-g.h*.3,{h:g.h*.6}); } }
  gfx.globalAlpha=1; };
G.bedazzle_blast=E2=>{ const {m,fx}=E2,list=foes(E2),Gp=ST.group(list),me=ST.unit(m),p=rowSpot(Gp,84),U=list.map(f=>ST.unit(f));
  const waves=(B2.move&&B2.move.waves||[]).flat(),critOf=f=>waves.some(e=>e.t===f&&e.crit);
  const T={in:700,draw:1000,load:1300,safety:1650,aim:1950,fireA:2250,low:2550,high:2850,fireB:3150,one:3450,blow:3950,inspect:4350,more:4750,topup:5150,admire:5600,pose:6050,back:6550,home:7350};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'bz_arrive',hop:4,hn:5},{t:T.in,x:p.x,y:p.y,f:'bz_draw'},{t:T.load,f:'bz_load'},{t:T.safety,f:'bz_safety'},{t:T.aim,f:'bz_aim'},
    {t:T.fireA,f:'bz_fireA',dx:(u,tt)=>Math.sin(tt*70)*2},{t:T.low,f:'bz_sweeplow',dx:(u,tt)=>Math.sin(tt*70)*2},{t:T.high,f:'bz_sweephigh',dx:(u,tt)=>Math.sin(tt*70)*2},{t:T.fireB,f:'bz_fireB',dx:(u,tt)=>Math.sin(tt*70)*2},
    {t:T.one,f:'bz_onehand',dx:(u,tt)=>Math.sin(tt*70)*2},{t:T.blow,f:'bz_blow'},{t:T.inspect,f:'bz_inspect'},{t:T.more,f:'bz_notenough'},{t:T.topup,f:'bz_topup',dx:(u,tt)=>Math.sin(tt*70)*2},{t:T.admire,f:'bz_admire',hop:8},{t:T.pose,f:'bz_pose'},
    {t:T.back,f:'bz_arriveR',hop:4,hn:4},{t:T.home,x:'home',y:'home',f:'idle'}]);
  const gems=[]; let gk=0;
  const stick=(at,n,sharp)=>{ U.forEach((q,i)=>{ const crit=critOf(list[i]); for(let j=0;j<n;j++) { const k=gk++; const id=sharp&&crit?'gem_sharp':['gem_pink','gem_blue','gem_gold'][k%3];
    gems.push({id,k,at:at+i*60+j*45,x:q.x-q.w*.35+rnd(k,7)*q.w*.7,y:q.top+q.h*.12+rnd(k,8)*q.h*.7,h:sharp&&crit?Math.max(22,q.h*.26):12+rnd(k,9)*8,rot:(rnd(k,10)-.5)*.8,sharp:sharp&&crit}); } }); };
  const spray=(k,yk)=>{ const tx=Gp.x0+rnd(k,11)*Math.max(40,Gp.w),ty=Gp.top+(Gp.base-Gp.top)*yk; fly('gem_spray',st,-44,-GH()*.58,tx,ty,.42,{arc:8,h:34,ease:'lin',rot0:-.2}); for(let j=0;j<3;j++) fly(['gem_pink','gem_blue','gem_gold'][(k+j)%3],st,-46,-GH()*.58-4,tx+(rnd(k+j,12)-.5)*60,ty+(rnd(k+j,13)-.5)*50,.4+j*.05,{arc:10,h:12,ease:'lin',spin:3}); };
  stick(T.fireA+420,2,false); stick(T.low+420,2,false); stick(T.high+420,2,false); stick(T.fireB+420,2,false); stick(T.one+420,1,true); stick(T.topup+420,2,false);
  const sharpAny=list.some(critOf);
  ST.play(E2,[
    [0,()=>{ say(m.id,'bedazzle_blast'); setMessage('Grace reaches for the rhinestone gun. Everyone knows what that means.'); }],
    [T.draw,()=>{ sfx.whoosh(); }],
    [T.load,()=>{ sfx.click(); fly('gem_hopper',st,-20,-GH()-30,st.x-20,st.y-GH()-10,.5,{arc:0,h:34,keep:false}); setMessage('Hopper in. Fully loaded. Extra sparkly.'); }],
    [T.safety,()=>{ sfx.click(); scene('gx_text',.5,{st,txt:'CLICK',c:CREAM}); }],
    [T.aim,()=>{ sfx.select(); setMessage('One eye closed. Aim. Hold still, everybody.'); scene('gx_gems',(T.home-T.aim)/1000,{plan:{gems:gems.map(g=>Object.assign({},g,{at:g.at-T.aim}))}}); }],
    [T.fireA,()=>{ sfx.pew(); sfx.pew(.12); sfx.spray(); spray(1,.45); all(list,.4); landHit(34); setMessage('Gems. Gems everywhere.'); }],
    [T.low,()=>{ sfx.pew(); sfx.pew(.12); spray(2,.8); all(list,.3); }],
    [T.high,()=>{ sfx.pew(); sfx.pew(.12); spray(3,.15); all(list,.3); }],
    [T.fireB,()=>{ sfx.pew(); sfx.pew(.1); sfx.pew(.2); spray(4,.5); all(list,.4); landHit(33); }],
    ['hf',T.one+300],
    [T.one,()=>{ sfx.pew(); sfx.spray(); spray(5,.4); U.forEach((q,i)=>{ if(critOf(list[i])) fly('gem_sharp',st,-48,-GH()*.58,q.x,q.mid,.3,{arc:0,h:30,ease:'lin',rot0:-.6,keep:true}); }); }],
    [T.one+300,()=>{ sfx.bonk(); sfx.ding(); all(list,.6); landHit(33); E2.apply(); scene('gx_big',.9,{x:Gp.x,y:Gp.top-60,txt:sharpAny?'SHARP ONE!':'BEDAZZLED!',c:sharpAny?SKYC:PINK,sc:4}); setMessage(sharpAny?'A sharp one lands point first. That one hurt.':'Every monster is now mostly rhinestone.'); }],
    [T.blow,()=>{ sfx.blow?sfx.blow():sfx.whoosh(); setMessage('She blows on the tip. Like a cowboy.'); }],
    [T.inspect,()=>{ scene('gx_text',.5,{st,txt:'HMM',c:CREAM}); }],
    [T.more,()=>{ sfx.nope?sfx.nope():sfx.select(); scene('gx_big',.8,{st,txt:'MORE SPARKLE',c:PINK,sc:3}); setMessage('She squints at them. Not enough sparkle.'); }],
    [T.topup,()=>{ sfx.pew(); sfx.pew(.1); sfx.spray(); spray(6,.5); all(list,.25); }],
    [T.admire,()=>{ sfx.ding(); sfx.fanfare(); scene('gx_text',.9,{st,txt:'PERFECT',c:GOLD}); }],
    [T.pose,()=>{ sfx.select(); }],
    [T.home+100,'end',res(E2)+'They sparkle now. They will sparkle for weeks. Rhinestones do not come off.']]); };
})();
