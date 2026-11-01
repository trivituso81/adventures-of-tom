'use strict';
// engine/olivia-moves.js: Olivia's eleven moves as set pieces on engine/stage.js. She is painted (data/olivia-battle-use.js):
// every ability frame is a sprite key named as in the sheet ('fc_jab', 'du_jump_a', 'mi_yell_2'...), plus an R copy facing the other way.
// Frames face left (toward the enemies) except mi_yell_1 to mi_thanks, which face right (she calls toward the right edge of the screen).
// Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scene prefix ov_ (drawn without the aim warp).
// The wrapper at the bottom stretches every move by 1.6 like Justin's, so the painted frames are held long enough to read.
// Loaded after engine/justin-moves.js.
(function(){
if(typeof RECRUIT_MOVES==='undefined'||typeof RFX==='undefined') return;
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const O=RECRUIT_MOVES.olivia=RECRUIT_MOVES.olivia||{};
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.8)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const star=(x,y,r,c,rot=0)=>{ gfx.beginPath(); for(let k=0;k<10;k++) { const a=rot-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr; if(k) gfx.lineTo(px,py); else gfx.moveTo(px,py); } gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
ST.nw('ov_');
const CREAM='#fff8e8',GOLD='#ffe08a',CORAL='#ff7a6a',PINK='#ff7ab8',BLUE='#9fd8ff',GRAY='#c9d0d6';
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foesOf=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const waveFoe=k=>{ const M=B2.move,w=M&&M.waves[Math.min(k,M.waves.length-1)]; return (w&&w[0]&&w[0].t)||null; };
const front=(F,gap=40)=>({x:Math.min(552,F.x+F.w*.5+gap),y:Math.min(316,F.base+4)});
const jitter=f=>ST.jolt(f,.45);
const seq=(list,t0,x,y,extra={})=>{ const out=[]; let t=t0; for(const [f,d,o] of list) { out.push(Object.assign({t,x,y,f},extra,o||{})); t+=d; } return out; };
const sfxp=n=>{ try { if(sfx[n]) sfx[n](); } catch(e){} };

// ---------- shared scenes ----------
SC.ov_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.ov_sparks=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.8,4*(1-u)+2,k%2?'#fff3a0':(s.c||GOLD),u*3); } };
SC.ov_ring=(s,u)=>{ const q=ez(u/.55); gfx.globalAlpha=fade(u,.4); gfx.strokeStyle=s.c||CREAM; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(s.x,s.y,6+q*(s.r||34),(6+q*(s.r||34))*.8,0,0,Math.PI*2); gfx.stroke(); };
SC.ov_poof=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const a=k/(s.n||7)*Math.PI*2,d=ez(u)*(s.r||22); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.55,5*(1-u)+2,4*(1-u)+2,s.c||'#d8cfc0'); } };
SC.ov_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.4); R(0,0,576,324,s.c||'#ffffff'); };
SC.ov_dim=(s,u)=>{ gfx.globalAlpha=fin(u,.12)*fade(u,.85)*(s.a||.45); R(0,0,576,324,s.c||'#0a1030'); };

// ---------- Fact Check (basic) ----------
// notebook opens, squint, the pen jabbed like a microphone, smug
O.fact_check=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,80),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'in'},{t:800,x:p.x,y:p.y,f:'fc_open'}];
  K.push(...seq([['fc_open',500],['fc_squint',450],['fc_jab',700],['fc_smug',500]],800,p.x,p.y));
  K.push({t:2950,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:3550,x:'home',y:'home',f:'idle'},{t:3750,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia flips open her notebook.')],
    [300,()=>sfxp('whoosh')],
    [850,()=>{ say(m.id,'fact_check_open'); sfxp('step'); }],
    [1400,()=>setMessage('She squints. One eyebrow goes up.')],
    ['hf',1850],
    [1750,()=>{ say(m.id,'fact_check'); sfxp('bump'); }],
    [1850,()=>{ setMessage('She jabs the pen at it like a microphone.'); sfxp('bonk'); jitter(f); landHit(100); scene('ov_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:40,c:BLUE}); scene('ov_sparks',.6,{x:F.x+F.w*.3,y:F.mid,n:8,r:30,c:BLUE}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'SOURCE?',c:'#ffe08a',sc:3}); }],
    [3550,'end',res(E2)+'No comment.']]); };

// ---------- SNACK BAG (signature) ----------
// dig in the tote, hold up the pouch, toss one to every friend, finger up: one each
const pouch=(x,y)=>{ R(x-6,y-5,12,10,PINK); R(x-6,y-5,12,3,'#ffd0e8'); R(x-4,y-1,8,3,'#fff4fa'); R(x-7,y-6,2,12,'#e85a98'); R(x+5,y-6,2,12,'#e85a98'); };
O.snack_bag=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const live=B2.party.filter(p=>p.hp>0&&!p.dead&&p!==m);
  const K=[{t:0,x:'home',y:'home',f:'sb_dig'}];
  K.push(...seq([['sb_dig',650],['sb_found',500],['sb_toss_wind',350],['sb_toss',650],['sb_one_each',800]],0,'home','home'));
  K.push({t:2950,x:'home',y:'home',f:'idle'},{t:3200,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia digs through her tote.'); say(m.id,'snack_bag_dig'); }],
    [650,()=>{ setMessage('Found one.'); sfxp('ding'); scene('ov_sparks',.5,{x:me.x-8,y:me.base-me.h*.95,n:7,r:20,c:PINK}); }],
    [1500,()=>{ setMessage('She tosses one to everybody.'); sfxp('whoosh'); E2.apply();
      live.forEach((p,k)=>{ const U=ST.unit(p); ST.fly(pouch,me.x-20,me.base-me.h*.45,U.x,U.base-U.h*.6,.45,40+k*6,k*.12,{spin:3}); }); }],
    [2000,()=>{ for(const p of live) { const U=ST.unit(p); sfxp('ding'); scene('ov_sparks',.7,{x:U.x,y:U.base-U.h*.55,n:9,r:28,c:'#9fe6a8'}); scene('ov_text',1,{x:U.x,y:U.base-U.h-6,txt:'+HP',c:'#9fe6a8',sc:2}); } }],
    [2000,()=>say(m.id,'snack_bag')],
    ['hf',2100],
    [3200,'end',res(E2)+'One each.']]); };

// ---------- LivNews Live ----------
// selfie, swing the phone round, report live, tap tap tap as the notifications roll in. A wave of pings hits every enemy.
const ping=(x,y)=>{ R(x-6,y-6,12,12,CORAL); R(x-6,y-6,12,3,'#ffb3a8'); R(x-1,y-3,2,4,'#ffffff'); R(x-1,y+2,2,2,'#ffffff'); };
SC.ov_live=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.85); R(s.x-24,s.y-8,48,16,'#d42a2a'); R(s.x-24,s.y-8,48,3,'#ff6a6a'); E(s.x-15,s.y,3,3,'#ffffff'); label('LIVE',s.x+6,s.y,'#ffffff',1); };
O.livnews_live=E2=>{ const {m,fx}=E2,me=ST.unit(m),foes=foesOf(E2);
  const K=[{t:0,x:'home',y:'home',f:'ln_selfie'}];
  K.push(...seq([['ln_selfie',650],['ln_turn',450],['ln_live',850],['ln_tapping',650],['ln_check',550]],0,'home','home'));
  K.push({t:3150,x:'home',y:'home',f:'idle'},{t:3400,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia holds up her phone and fixes her hair.')],
    [650,()=>{ setMessage('She swings it round to the enemies.'); sfxp('whoosh'); }],
    [1100,()=>{ setMessage('LivNews, live.'); say(m.id,'livnews_live'); scene('ov_live',1.6,{x:me.x-10,y:me.base-me.h-14}); }],
    ['hf',1700],
    [1500,()=>{ foes.forEach((f,i)=>{ const F=ST.unit(f); for(let k=0;k<3;k++) ST.fly(ping,me.x-38,me.base-me.h*.7,F.x+F.w*.25+(k-1)*10,F.mid+(k-1)*10,.5,34+k*8,i*.1+k*.09,{spin:1}); }); }],
    [1950,()=>{ sfxp('ding'); landHit(100); for(const f of foes) { const F=ST.unit(f); jitter(f); scene('ov_sparks',.5,{x:F.x+F.w*.25,y:F.mid,n:6,r:20,c:CORAL}); } }],
    [2150,()=>say(m.id,'livnews_live_chat')],
    [3400,'end',res(E2)+'It is trending.']]); };

// ---------- Inverted Pyramid ----------
// lecture, trace the wide top edge, slope down to the point, then slam the point onto the enemy
SC.ov_pyramid=(s,u)=>{ const a=fin(u,.08)*fade(u,.9); gfx.globalAlpha=a; const w=s.w,h=s.h,x=s.x,y=s.y;
  const q1=cl(u/.3),q2=cl((u-.3)/.3),q3=cl((u-.6)/.25);
  gfx.strokeStyle=GOLD; gfx.lineWidth=3; gfx.lineCap='round';
  gfx.beginPath(); gfx.moveTo(x-w/2,y); gfx.lineTo(lerp(x-w/2,x+w/2,q1),y); gfx.stroke();
  if(q2>0) { gfx.beginPath(); gfx.moveTo(x-w/2,y); gfx.lineTo(lerp(x-w/2,x,q2),lerp(y,y+h,q2)); gfx.moveTo(x+w/2,y); gfx.lineTo(lerp(x+w/2,x,q2),lerp(y,y+h,q2)); gfx.stroke(); }
  if(q3>0) { gfx.globalAlpha=a*q3*.5; gfx.beginPath(); gfx.moveTo(x-w/2,y); gfx.lineTo(x+w/2,y); gfx.lineTo(x,y+h); gfx.closePath(); gfx.fillStyle=GOLD; gfx.fill(); } };
SC.ov_pyfall=(s,u)=>{ const q=ez(cl(u/.6)); const y=lerp(s.y0,s.y1,q); gfx.globalAlpha=fade(u,.75); const w=s.w,h=s.h;
  gfx.beginPath(); gfx.moveTo(s.x-w/2,y-h); gfx.lineTo(s.x+w/2,y-h); gfx.lineTo(s.x,y); gfx.closePath(); gfx.fillStyle='#ffd24a'; gfx.fill(); gfx.strokeStyle='#fff3a0'; gfx.lineWidth=3; gfx.stroke(); };
O.inverted_pyramid=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,90),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'in'},{t:800,x:p.x,y:p.y,f:'ip_lecture'}];
  K.push(...seq([['ip_lecture',700],['ip_top_edge',500],['ip_slope',500],['ip_point',450],['ip_slam',750],['ip_nod',600]],800,p.x,p.y));
  K.push({t:4300,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:4900,x:'home',y:'home',f:'idle'},{t:5100,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia puts on her professor face.')],
    [300,()=>sfxp('whoosh')],
    [850,()=>{ say(m.id,'inverted_pyramid_lecture'); sfxp('step'); }],
    [1500,()=>{ setMessage('She draws the inverted pyramid in the air.'); scene('ov_pyramid',1.8,{x:p.x-60,y:p.y-me.h*.75,w:70,h:44}); sfxp('whoosh'); }],
    [2900,()=>{ setMessage('The point comes down.'); sfxp('whoosh'); scene('ov_pyfall',.9,{x:F.x+F.w*.3,y0:F.top-60,y1:F.mid+10,w:60,h:50}); }],
    ['hf',3300],
    [3000,()=>say(m.id,'inverted_pyramid')],
    [3300,()=>{ sfxp('bonk'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.35); scene('ov_flash',.2,{a:.35,c:'#fff3a0'}); scene('ov_sparks',.7,{x:F.x+F.w*.3,y:F.mid,n:12,r:34,c:GOLD}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'THE LEDE',c:GOLD,sc:2}); }],
    [5100,'end',res(E2)+'Buried.']]); };

// ---------- Double Under ----------
// rope out, a rusty first jump that trips her (does nothing), then two big double-unders and a whip
SC.ov_ropering=(s,u)=>{ gfx.globalAlpha=fade(u,.5); gfx.strokeStyle='#c43a3a'; gfx.lineWidth=3; const q=ez(u/.5);
  gfx.beginPath(); gfx.ellipse(s.x,s.y,10+q*(s.r||36),(10+q*(s.r||36))*.55,0,0,Math.PI*2); gfx.stroke(); };
O.double_under=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,100),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'in'},{t:800,x:p.x,y:p.y,f:'du_ready'}];
  K.push(...seq([['du_ready',650],['du_trip',550],['du_laugh',650],['du_focus',550],['du_jump_a',450],['du_jump_b',450],['du_whip',800]],800,p.x,p.y));
  K.push({t:4900,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:5500,x:'home',y:'home',f:'idle'},{t:5700,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia pulls out a jump rope.')],
    [300,()=>sfxp('whoosh')],
    [850,()=>{ say(m.id,'double_under_ready'); }],
    [1450,()=>{ setMessage('She trips on the first jump.'); sfxp('thud'); say(m.id,'double_under_trip'); scene('ov_poof',.5,{x:p.x,y:p.y,r:20}); }],
    [2650,()=>setMessage('The champion is back.')],
    ['hf',4200],
    [3700,()=>{ sfxp('whoosh'); }],
    [3950,()=>{ sfxp('bonk'); jitter(f); landHit(50); scene('ov_ropering',.6,{x:F.x+F.w*.3,y:F.base-4,r:F.w*.5}); scene('ov_sparks',.5,{x:F.x+F.w*.3,y:F.mid,n:7,r:24,c:'#ff9a8a'}); }],
    [4150,()=>say(m.id,'double_under')],
    [4200,()=>{ setMessage('Double under. Whip.'); sfxp('bonk'); sfxp('ding'); jitter(f); landHit(50); battle.shake=Math.max(battle.shake||0,.3); scene('ov_sparks',.7,{x:F.x+F.w*.3,y:F.mid,n:12,r:34,c:'#ff6a5a'}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'THERE IT IS',c:'#ffd6c0',sc:2}); }],
    [5700,'end',res(E2)+'Still got it.']]); };

// ---------- Story Time ----------
// sits down cross-legged, shows the book, reads, shhh, closes it. The enemy nods off.
SC.ov_zzz=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.18); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; label('Z',s.x+k*10+Math.sin(q*6+k)*4,s.y-q*40-k*8,'#cfd8ff',2+(k%2)); } };
O.story_time=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,110),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'run',ease:'in'},{t:800,x:p.x,y:p.y,f:'st_sit'}];
  K.push(...seq([['st_sit',700],['st_show',600],['st_read',1300],['st_shhh',650],['st_close',750]],800,p.x,p.y));
  K.push({t:4800,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:5400,x:'home',y:'home',f:'idle'},{t:5600,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia sits down cross-legged.')],
    [300,()=>sfxp('whoosh')],
    [900,()=>{ scene('ov_dim',4.4,{a:.35,c:'#101846'}); setMessage('She opens her own children\'s book.'); }],
    [1500,()=>setMessage('She holds up the first page.')],
    [2100,()=>{ say(m.id,'story_time'); setMessage('"Once upon a time, in a very quiet house..."'); }],
    ['hf',2300],
    [2500,()=>{ sfxp('ding'); landHit(100); scene('ov_zzz',2.4,{x:F.x+F.w*.35,y:F.top+10}); scene('ov_sparks',.8,{x:F.x+F.w*.35,y:F.top+20,n:8,r:24,c:'#cfd8ff'}); }],
    [3400,()=>{ setMessage(f.name+' is nodding off.'); }],
    [4100,()=>say(m.id,'story_time_end')],
    [5600,'end',res(E2)+'And everybody went to sleep.']]); };

// ---------- MICHAEL! ----------
// breath, yell, wait, yell louder. A diaper bag flies in from off screen on the right and flattens the enemy. Michael is never drawn.
const bag=(x,y,rot)=>{ gfx.save(); gfx.translate(x,y); R(-11,-8,22,16,'#6aa0d8'); R(-11,-8,22,4,'#9fc8ee'); R(-11,0,22,3,'#ffffff'); R(-5,-12,10,4,'#4a78ac'); R(-3,-14,6,3,'#cfd8e6'); gfx.restore(); };
O.michael=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'mi_breath'}];
  K.push(...seq([['mi_breath',600],['mi_yell_1',700],['mi_wait',700],['mi_yell_2',900],['mi_thanks',850]],0,'home','home'));
  K.push({t:3750,x:'home',y:'home',f:'idle'},{t:4000,f:'idle'});
  ST.keys(fx,K);
  const hitT=2700;
  ST.play(E2,[
    [0,()=>setMessage('Olivia takes a huge breath.')],
    [620,()=>{ say(m.id,'michael_1'); setMessage('MICHAEL!'); battle.shake=Math.max(battle.shake||0,.15); scene('ov_text',1,{x:me.x+24,y:me.base-me.h-4,txt:'MICHAEL!',c:'#ffd27a',sc:3}); }],
    [1500,()=>setMessage('Nothing.')],
    [2050,()=>{ say(m.id,'michael'); setMessage('MICHAEL, HANDLE THIS!'); battle.shake=Math.max(battle.shake||0,.3); scene('ov_text',1.1,{x:me.x+30,y:me.base-me.h-4,txt:'HANDLE THIS!',c:'#ff9a7a',sc:3}); }],
    [2150,()=>{ sfxp('whoosh'); ST.fly(bag,640,me.base-me.h*1.3,F.x+F.w*.35,F.mid-4,.55,70,0,{spin:4}); }],
    ['hf',hitT],
    [hitT,()=>{ sfxp('thud'); sfxp('bonk'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.5); scene('ov_flash',.2,{a:.35}); scene('ov_poof',.7,{x:F.x+F.w*.35,y:F.base,n:10,r:36}); scene('ov_sparks',.7,{x:F.x+F.w*.35,y:F.mid,n:10,r:30,c:'#9fc8ee'}); scene('ov_text',1,{x:F.x+F.w*.35,y:F.top-4,txt:'WHAM',c:'#ffe08a',sc:3}); }],
    [3050,()=>say(m.id,'michael_thanks')],
    [4000,'end',res(E2)+'He handled it.']]); };

// ---------- Better Than Bobby (ultimate) ----------
// counts on her fingers, every count is a hit on a different enemy, then the mic drop
const mic=(x,y)=>{ R(x-2,y-2,4,12,'#1a1a22'); E(x,y-5,5,5,'#2a2a34'); R(x-5,y-8,10,2,'#46464f'); };
O.better_than_bobby=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'bb_one'}];
  K.push(...seq([['bb_one',600],['bb_two',600],['bb_three',600],['bb_four_and_five',900],['bb_crossed',650],['bb_mic',700],['bb_drop',900]],0,'home','home'));
  K.push({t:4950,x:'home',y:'home',f:'idle'},{t:5200,f:'idle'});
  ST.keys(fx,K);
  const words=['JUMP ROPE','GRADES','PARKING','COOKING','MARIO KART'],times=[300,900,1500,2100,2650];
  const hit=k=>()=>{ const f=waveFoe(k),F=ST.unit(f); sfxp(k===4?'ding':'bonk'); jitter(f); landHit(20); scene('ov_sparks',.6,{x:F.x+F.w*.3,y:F.mid,n:6+k,r:22+k*4,c:k%2?GOLD:BLUE,seed:k}); scene('ov_text',1,{x:F.x+F.w*.3,y:F.top-4,txt:words[k],c:k===4?'#ffe08a':CREAM,sc:2}); scene('ov_text',.8,{x:me.x-24,y:me.base-me.h-4,txt:String(k+1),c:'#ffd6f0',sc:3}); };
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia has a list. About her brother Bobby.'); say(m.id,'better_than_bobby_a'); }],
    ...times.map((t,k)=>[t,hit(k)]),
    ['hf',2650],
    [2100,()=>say(m.id,'better_than_bobby_b')],
    [3000,()=>setMessage('Arms crossed. Chin up.')],
    [3650,()=>{ setMessage('She holds out the mic.'); sfxp('whoosh'); }],
    [4350,()=>{ say(m.id,'better_than_bobby'); setMessage('Sorry, Bobby.'); sfxp('thud'); ST.fly(mic,me.x-60,me.base-me.h*.5,me.x-84,me.base+2,.4,24,0,{spin:2}); scene('ov_flash',.2,{a:.3,c:'#fff3a0'}); }],
    [5200,'end',res(E2)+'Mic dropped.']]); };

// ---------- Is This Real? ----------
// scans the enemy with her phone, squints, gasps, announces it is fake. A red FAKE stamp lands on it.
SC.ov_scan=(s,u)=>{ const a=fin(u,.1)*fade(u,.85)*.55; const sweep=Math.sin(u*Math.PI*3)*(s.sw||22); gfx.globalAlpha=a;
  gfx.beginPath(); gfx.moveTo(s.x0,s.y0); gfx.lineTo(s.x1,s.y1-s.hh*.5+sweep); gfx.lineTo(s.x1,s.y1+s.hh*.5+sweep); gfx.closePath(); gfx.fillStyle='#9fe6ff'; gfx.fill(); };
SC.ov_stamp=(s,u)=>{ const q=cl(u/.15),sc=2.4-1.4*q; gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.25); gfx.strokeStyle='#e03a3a'; gfx.lineWidth=3; gfx.strokeRect(-34*sc/2.4*1.2,-12*sc/2.4*1.2,68*sc/2.4*1.2,24*sc/2.4*1.2); gfx.restore(); label('FAKE',s.x,s.y,'#ff4a4a',2.5); };
O.is_this_real=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ir_scan'}];
  K.push(...seq([['ir_scan',700],['ir_squint',550],['ir_gasp',550],['ir_fake',900],['ir_sigh',650]],0,'home','home'));
  K.push({t:3350,x:'home',y:'home',f:'idle'},{t:3600,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia scans it with her phone.'); say(m.id,'is_this_real_hold'); scene('ov_scan',1.3,{x0:me.x-44,y0:me.base-me.h*.62,x1:F.x+F.w*.45,y1:F.mid,hh:F.h*.7,sw:F.h*.18}); sfxp('whoosh'); }],
    [750,()=>setMessage('She squints.')],
    [1300,()=>setMessage('Wait.')],
    [1850,()=>{ say(m.id,'is_this_real'); setMessage('Too many fingers. Fake.'); }],
    ['hf',2000],
    [2000,()=>{ sfxp('bonk'); jitter(f); landHit(100); scene('ov_stamp',1.1,{x:F.x+F.w*.35,y:F.mid}); scene('ov_ring',.6,{x:F.x+F.w*.35,y:F.mid,r:40,c:'#ff6a6a'}); }],
    [3600,'end',res(E2)+'It has no idea what it is any more.']]); };

// ---------- Marine Layer ----------
// shivers in her dress, pulls the hoodie on, hood up and miserable, then declares a crisis as gray fog rolls over every enemy
SC.ov_fog=(s,u)=>{ const a=fin(u,.2)*fade(u,.75)*.75; for(let k=0;k<14;k++) { const x=lerp(s.x1+60,s.x0-30,cl(u*1.15))+((k*37)%90)-45,y=s.y+(((k*53)%100)-50)*s.sp/50+Math.sin(u*5+k)*4; gfx.globalAlpha=a*(.35+(k%3)*.18); E(x,y,34+(k%4)*8,14+(k%3)*5,GRAY); } };
O.marine_layer=E2=>{ const {m,fx}=E2,me=ST.unit(m),foes=foesOf(E2),G=ST.group(foes);
  const K=[{t:0,x:'home',y:'home',f:'ml_shiver'}];
  K.push(...seq([['ml_shiver',650],['ml_hoodie',650],['ml_hood_up',750],['ml_crisis',1000],['ml_sulk',700]],0,'home','home'));
  K.push({t:3750,x:'home',y:'home',f:'idle'},{t:4000,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('It is a little chilly in Los Angeles.'); sfxp('whoosh'); }],
    [650,()=>setMessage('Hoodie on.')],
    [1300,()=>{ say(m.id,'marine_layer'); setMessage('"It\'s sixty-two degrees."'); scene('ov_dim',2.6,{a:.28,c:'#566878'}); }],
    [1700,()=>scene('ov_fog',2.6,{x0:G.x0-20,x1:576,y:G.top+G.w*0+Math.max(20,(G.base-G.top)*.5),sp:Math.max(40,G.base-G.top)})],
    [2050,()=>say(m.id,'marine_layer_crisis')],
    ['hf',2150],
    [2150,()=>{ setMessage('This is a crisis.'); sfxp('ding'); landHit(100); for(const f of foes) { const F=ST.unit(f); jitter(f); scene('ov_sparks',.5,{x:F.x+F.w*.3,y:F.mid,n:6,r:20,c:GRAY}); } battle.shake=Math.max(battle.shake||0,.2); scene('ov_text',1,{x:me.x,y:me.base-me.h-6,txt:'CRISIS',c:'#cfd8de',sc:3}); }],
    [4000,'end',res(E2)+'The marine layer wins again.']]); };

// ---------- LACHLAN, NO! ----------
// she spots Lachlan (off screen, never drawn), sprints straight through the enemy, skids to a stop with her arms out, sighs with relief
O.lachlan_no=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const homeX=me.x,homeY=me.base,endX=Math.max(40,F.x-F.w*.5-46),by=Math.min(316,F.base+4);
  const K=[{t:0,x:'home',y:'home',f:'lk_gasp'},{t:750,x:'home',y:'home',f:'lk_sprint_wind'},{t:1200,x:'home',y:'home',f:'lk_sprint',ease:'in'},{t:1900,x:endX,y:by,f:'lk_skid'}];
  K.push({t:2500,x:endX,y:by,f:'lk_relief'},{t:3350,x:endX,y:by,f:'run',ease:'lin'},{t:4000,x:'home',y:'home',f:'idle'},{t:4250,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia spots Lachlan about to climb something.'); say(m.id,'lachlan_no'); scene('ov_text',1,{x:me.x,y:me.base-me.h-6,txt:'LACHLAN, NO!',c:'#ff8a7a',sc:3}); }],
    [750,()=>{ setMessage('Full mom sprint.'); sfxp('whoosh'); }],
    ['hf',1580],
    [1580,()=>{ sfxp('bonk'); sfxp('thud'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.5); scene('ov_flash',.2,{a:.3}); scene('ov_poof',.8,{x:F.x+F.w*.3,y:F.base,n:10,r:40}); scene('ov_sparks',.7,{x:F.x+F.w*.3,y:F.mid,n:10,r:32,c:'#ffd27a'}); }],
    [1900,()=>{ sfxp('thud'); scene('ov_poof',.6,{x:endX,y:by,n:8,r:26}); }],
    [2600,()=>{ say(m.id,'lachlan_no_got'); setMessage('Got him. Got him. We\'re fine.'); }],
    [4250,'end',res(E2)+'He was fine. He was always fine.']]); };

// Same stretch as Justin's moves: the painted frames are held long enough to read.
(function(){ const S0=1.6;
  for(const key of Object.keys(O)) { const fn=O[key];
    O[key]=E2=>{ const k0=ST.keys,p0=ST.play;
      ST.keys=(fx,K)=>k0(fx,K.map(o=>Object.assign({},o,{t:o.t*S0})));
      ST.play=(e,list)=>p0(e,list.map(it=>it[0]==='hf'?['hf',it[1]*S0]:[it[0]*S0,...it.slice(1)]));
      try { return fn(E2); } finally { ST.keys=k0; ST.play=p0; } }; } })();
})();
