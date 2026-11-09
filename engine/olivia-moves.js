'use strict';
// engine/olivia-moves.js: Olivia's eleven moves as set pieces on engine/stage.js. She is painted (data/olivia-battle-use.js, data/olivia-ab.js):
// every ability frame is a sprite key 'ab_<move>_<n>' ('ab_fc_4', 'ab_du_5'...), n counting cells of her approved Art Library sheet row by row, plus an R copy facing the other way.
// Frames face the way the sheet painted them (toward the enemies, or at the viewer).
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
// Painted effect pictures (art/props/olivia/<prefix>_<name>.webp, cut by tools/sprite-bake/bake_olivia_fx.py). A scene op with art: draws the
// picture once it has loaded. Until then, or if it is missing, it runs the drawn version named in fb (its options in fbs).
const oArt=(s,u)=>{ const q=s.pop?(u<.15?ez(u/.15)*1.2:lerp(1.2,1,cl((u-.15)/.25))):1, yy=s.y1!=null?lerp(s.y0,s.y1,ez(cl(u/.6))):s.y-(s.rise||0)*ez(u);
  gfx.globalAlpha=fin(u,.1)*fade(u,s.fa||.8)*(s.a==null?1:s.a);
  const ok=PROPART.draw('olivia/'+s.art,s.x,yy,{w:s.w!=null?s.w*q:null,h:s.h!=null?s.h*q:null,rot:s.rot}); gfx.globalAlpha=1; return ok; };
SC.oz_art=(s,u)=>{ if(!oArt(s,u)&&s.fb) SC[s.fb](s.fbs||{},u); };
SC.ov_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); label(s.txt,s.x,s.y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.ov_sparks=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.8,4*(1-u)+2,k%2?'#fff3a0':(s.c||GOLD),u*3); } };
SC.ov_ring=(s,u)=>{ const q=ez(u/.55); gfx.globalAlpha=fade(u,.4); gfx.strokeStyle=s.c||CREAM; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(s.x,s.y,6+q*(s.r||34),(6+q*(s.r||34))*.8,0,0,Math.PI*2); gfx.stroke(); };
SC.ov_poof=(s,u)=>{ for(let k=0;k<(s.n||7);k++) { const a=k/(s.n||7)*Math.PI*2,d=ez(u)*(s.r||22); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.55,5*(1-u)+2,4*(1-u)+2,s.c||'#d8cfc0'); } };
SC.ov_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.4); R(0,0,576,324,s.c||'#ffffff'); };
SC.ov_dim=(s,u)=>{ gfx.globalAlpha=fin(u,.12)*fade(u,.85)*(s.a||.45); R(0,0,576,324,s.c||'#0a1030'); };

// ---------- Escalation ladder (Tom, 2026-11-01: splendor, duration and funniness all rise with each unlock) ----------
// Unlock order (data/abilities.js auto): Fact Check, Snack Bag, LivNews, Is This Real, Pyramid, Marine Layer, Double Under,
// Story Time, LACHLAN, MICHAEL, Better Than Bobby. Raw end times below x1.6 = 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 10.6 s.
// Gauges (docs/CHANGES.md olivkit2): splendor points (local effect 1, screen-wide 2, set piece drawn for this move 3) and gag count both rise with the rung.
SC.ov_count=(s,u)=>{ const n=Math.round(lerp(s.a,s.b,ez(u/.8))); gfx.globalAlpha=fin(u,.1)*fade(u,.85); label(n.toLocaleString('en-US')+' WATCHING',s.x,s.y,s.c||'#ffffff',1); };
SC.ov_glitch=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.7)*.8; for(let k=0;k<6;k++) { const y=s.y0+((k*31+Math.floor(u*20)*17)%(s.h||40)),w=20+((k*13+Math.floor(u*9)*7)%30); R(s.x-w/2+((k%2)?6:-6),y,w,3,k%3?'#ff5ad0':'#5affd8'); } };
SC.ov_crack=(s,u)=>{ gfx.globalAlpha=fade(u,.3); gfx.strokeStyle='#ffffff'; gfx.lineWidth=3; gfx.beginPath(); let x=s.x,y=s.y; gfx.moveTo(x,y); for(let k=0;k<5;k++) { x+=(k%2?1:-1)*(10+k*4); y-=8; gfx.lineTo(x,y); } gfx.stroke(); };
SC.ov_night=(s,u)=>{ const a=fin(u,.15)*fade(u,.85); gfx.globalAlpha=a; E(s.x,s.y,16,16,'#fff6c8'); E(s.x+8,s.y-4,14,14,'#101846');
  for(let k=0;k<9;k++) { const tw=.5+.5*Math.sin(u*14+k*2); gfx.globalAlpha=a*tw; star(60+((k*61)%460),24+((k*37)%60),3,'#fff6c8',k); } };
SC.ov_streaks=(s,u)=>{ gfx.globalAlpha=fade(u,.6)*.8; for(let k=0;k<7;k++) { const x=lerp(s.x1,s.x0,cl(u*1.1))+k*22+(k%2)*8,y=s.y-30+(k*11)%50; Ln(x,y,x+34+k*4,y,2,'#fff4d8'); } };
SC.ov_dust=(s,u)=>{ for(let k=0;k<6;k++) { const q=cl(u*1.2-k*.08); if(q<=0) continue; gfx.globalAlpha=(1-q)*.7; E(s.x+k*14+q*20,s.y-q*18,8+q*10,5+q*6,'#e6d8c0'); } };
SC.ov_spot=(s,u)=>{ gfx.globalAlpha=fin(u,.15)*fade(u,.9)*.35; E(s.x,s.y,s.r||50,(s.r||50)*.35,'#fff6c8'); };
SC.ov_confetti=(s,u)=>{ for(let k=0;k<40;k++) { const x=14+((k*97)%548),y=-10+((u*1.2+(k%7)*.1)%1)*330,c=['#ffe08a','#ff7ab8','#9fd8ff','#9fe6a8','#ff7a6a'][k%5]; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(u*6+k); R(-3,-2,6,4,c); gfx.restore(); } };
SC.ov_notes=(s,u)=>{ for(let k=0;k<5;k++) { const q=cl(u*1.4-k*.14); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; const x=s.x+Math.sin(q*5+k)*10+k*6,y=s.y-q*50-k*6; R(x,y,3,9,'#dfe6ff'); E(x,y+9,4,3,'#dfe6ff'); } };
SC.ov_fireflies=(s,u)=>{ for(let k=0;k<12;k++) { const tw=.3+.7*Math.abs(Math.sin(u*9+k*1.7)); gfx.globalAlpha=fin(u,.2)*fade(u,.85)*tw; E(40+((k*101)%500)+Math.sin(u*4+k)*8,120+((k*53)%150)+Math.cos(u*3+k)*6,2.5,2.5,'#e8ffa0'); } };
SC.ov_skysplit=(s,u)=>{ gfx.globalAlpha=fade(u,.4); gfx.strokeStyle='#ffffff'; gfx.lineWidth=2; for(let j=0;j<3;j++) { gfx.beginPath(); let x=s.x+j*24-24,y=s.y; gfx.moveTo(x,y); for(let k=0;k<6;k++) { x+=(k%2?1:-1)*(8+k*3); y-=14; gfx.lineTo(x,y); } gfx.stroke(); } };
SC.ov_banner=(s,u)=>{ const q=ez(u/.12); gfx.globalAlpha=fin(u,.08)*fade(u,.85); R(0,s.y-14,576*q,28,'#1a1030'); R(0,s.y-14,576*q,2,GOLD); R(0,s.y+12,576*q,2,GOLD); if(q>.9) label(s.txt,288,s.y-6,GOLD,3); };

// ---------- Fact Check (basic, 4.0 s) ----------
// notebook opens, squint, the pen jabbed like a microphone, smug
O.fact_check=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,80),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:200,f:'run',ease:'in'},{t:600,x:p.x,y:p.y,f:'ab_fc_1'}];
  K.push(...seq([['ab_fc_1',250],['ab_fc_2',300],['ab_fc_3',300],['ab_fc_4',450],['ab_fc_5',300],['ab_fc_6',300]],600,p.x,p.y));
  K.push({t:2500,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:2950,x:'home',y:'home',f:'idle'},{t:3050,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia flips open her notebook.')],
    [200,()=>sfxp('whoosh')],
    [650,()=>{ say(m.id,'fact_check_open'); sfxp('step'); }],
    [1150,()=>{ setMessage('She squints. One eyebrow goes up.'); scene('oz_art',1.2,{art:'fc_question',x:p.x+12,y:p.y-me.h-16,h:34,pop:1,fa:.9}); }],
    ['hf',1500],
    [1450,()=>{ say(m.id,'fact_check'); sfxp('bump'); }],
    [1500,()=>{ setMessage('She jabs the pen at it like a microphone.'); sfxp('bonk'); jitter(f); landHit(100); scene('oz_art',.6,{art:'fc_jab',x:F.x+F.w*.3,y:F.mid,w:90,pop:1,fb:'ov_ring',fbs:{x:F.x+F.w*.3,y:F.mid,r:40,c:BLUE}}); scene('oz_art',.6,{art:'fc_sparks',x:F.x+F.w*.3,y:F.mid,w:76,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:8,r:30,c:BLUE}}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'SOURCE?',c:'#ffe08a',sc:3}); }],
    [3050,'end',res(E2)+'No comment.']]); };

// ---------- SNACK BAG (signature, 4.5 s) ----------
// dig in the tote, hold up the pouch, toss one to every friend, finger up: one each
const pouch=(x,y)=>{ if(PROPART.draw('olivia/snack_pouch',x,y,{h:20})) return; R(x-6,y-5,12,10,PINK); R(x-6,y-5,12,3,'#ffd0e8'); R(x-4,y-1,8,3,'#fff4fa'); R(x-7,y-6,2,12,'#e85a98'); R(x+5,y-6,2,12,'#e85a98'); };
O.snack_bag=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const live=B2.party.filter(p=>p.hp>0&&!p.dead&&p!==m);
  const K=[{t:0,x:'home',y:'home',f:'ab_sb_1'}];
  K.push(...seq([['ab_sb_1',400],['ab_sb_2',500],['ab_sb_3',450],['ab_sb_4',300],['ab_sb_5',500],['ab_sb_6',650]],0,'home','home'));
  K.push({t:2800,x:'home',y:'home',f:'idle'},{t:3100,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [400,()=>{ setMessage('Olivia digs through her tote.'); say(m.id,'snack_bag_dig'); }],
    [900,()=>{ setMessage('Found one. Under the wipes.'); sfxp('ding'); scene('ov_sparks',.5,{x:me.x-8,y:me.base-me.h*.95,n:7,r:20,c:PINK}); }],
    [1650,()=>{ setMessage('She tosses one to everybody.'); sfxp('whoosh'); E2.apply();
      live.forEach((p,k)=>{ const U=ST.unit(p); ST.fly(pouch,me.x-20,me.base-me.h*.45,U.x,U.base-U.h*.6,.45,40+k*6,k*.12,{spin:3}); }); }],
    [2100,()=>{ for(const p of live) { const U=ST.unit(p); sfxp('ding'); scene('ov_sparks',.7,{x:U.x,y:U.base-U.h*.55,n:9,r:28,c:'#9fe6a8'}); scene('ov_ring',.5,{x:U.x,y:U.base-U.h*.55,r:26,c:'#9fe6a8'}); scene('ov_text',1,{x:U.x,y:U.base-U.h-6,txt:'+HP',c:'#9fe6a8',sc:2}); } }],
    [2100,()=>say(m.id,'snack_bag')],
    ['hf',2200],
    [3100,'end',res(E2)+'One each.']]); };

// ---------- LivNews Live (5.0 s) ----------
// selfie, swing the phone round, report live, tap tap tap as the notifications roll in. A wave of pings hits every enemy and the view count climbs.
const ping=(x,y)=>{ if(PROPART.draw('olivia/chat_bubbles',x,y,{h:18})) return; R(x-6,y-6,12,12,CORAL); R(x-6,y-6,12,3,'#ffb3a8'); R(x-1,y-3,2,4,'#ffffff'); R(x-1,y+2,2,2,'#ffffff'); };
SC.ov_live=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.85); R(s.x-24,s.y-8,48,16,'#d42a2a'); R(s.x-24,s.y-8,48,3,'#ff6a6a'); E(s.x-15,s.y,3,3,'#ffffff'); label('LIVE',s.x+6,s.y,'#ffffff',1); };
O.livnews_live=E2=>{ const {m,fx}=E2,me=ST.unit(m),fam=B2.party.filter(p=>p.hp>0&&!p.dead);
  const K=[{t:0,x:'home',y:'home',f:'ab_ln_1'}];
  K.push(...seq([['ab_ln_1',600],['ab_ln_4',400],['ab_ln_5',800],['ab_ln_6',600],['ab_ln_7',450],['ab_ln_8',450]],0,'home','home'));
  K.push({t:3300,x:'home',y:'home',f:'idle'},{t:3500,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia holds up her phone and fixes her hair.')],
    [600,()=>{ setMessage('She swings it round to the enemies.'); sfxp('whoosh'); }],
    [1000,()=>{ setMessage('LivNews, live.'); say(m.id,'livnews_live'); scene('ov_live',1.9,{x:me.x-10,y:me.base-me.h-14}); scene('ov_count',2.4,{x:me.x-10,y:me.base-me.h-30,a:12,b:48000}); }],
    ['hf',1600],
    [1400,()=>{ setMessage('The chat is cheering.'); fam.forEach((p,i)=>{ const U=ST.unit(p); for(let k=0;k<3;k++) ST.fly(ping,me.x-38,me.base-me.h*.7,U.x+(k-1)*10,U.base-U.h*.6+(k-1)*8,.5,40+k*8,i*.1+k*.08,{spin:1}); }); }],
    [1800,()=>{ sfxp('ding'); landHit(100); for(const p of fam) { const U=ST.unit(p); scene('ov_sparks',.5,{x:U.x,y:U.base-U.h*.6,n:7,r:22,c:CORAL}); scene('ov_ring',.5,{x:U.x,y:U.base-U.h*.6,r:30,c:CORAL}); } }],
    [2000,()=>say(m.id,'livnews_live_chat')],
    [2450,()=>setMessage('Chat is not kind. Chat is loud.')],
    [3300,()=>setMessage('One of the viewers is Michael.')],
    [3500,'end',res(E2)+'It is trending. The family is hyped.']]); };

// ---------- Is This Real? (5.5 s) ----------
// scans the enemy with her phone, squints, gasps, announces it is fake. The enemy glitches and a red FAKE stamp lands on it.
SC.ov_scan=(s,u)=>{ const a=fin(u,.1)*fade(u,.85)*.55; const sweep=Math.sin(u*Math.PI*3)*(s.sw||22); gfx.globalAlpha=a;
  gfx.beginPath(); gfx.moveTo(s.x0,s.y0); gfx.lineTo(s.x1,s.y1-s.hh*.5+sweep); gfx.lineTo(s.x1,s.y1+s.hh*.5+sweep); gfx.closePath(); gfx.fillStyle='#9fe6ff'; gfx.fill(); };
SC.ov_stamp=(s,u)=>{ const q=cl(u/.15),sc=2.4-1.4*q; gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.25); gfx.strokeStyle='#e03a3a'; gfx.lineWidth=3; gfx.strokeRect(-34*sc/2.4*1.2,-12*sc/2.4*1.2,68*sc/2.4*1.2,24*sc/2.4*1.2); gfx.restore(); label('FAKE',s.x,s.y,'#ff4a4a',2.5); };
O.is_this_real=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ab_ir_1'}];
  K.push(...seq([['ab_ir_1',650],['ab_ir_2',500],['ab_ir_3',450],['ab_ir_4',500],['ab_ir_8',700],['ab_ir_6',500]],0,'home','home'));
  K.push({t:3300,x:'home',y:'home',f:'idle'},{t:3550,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia scans it with her phone.'); say(m.id,'is_this_real_hold'); scene('ov_scan',1.6,{x0:me.x-44,y0:me.base-me.h*.62,x1:F.x+F.w*.45,y1:F.mid,hh:F.h*.7,sw:F.h*.18}); sfxp('whoosh'); }],
    [650,()=>{ setMessage('She squints.'); scene('ov_text',1,{x:me.x-10,y:me.base-me.h-10,txt:'ANALYZING...',c:'#9fe6ff',sc:1}); }],
    [1100,()=>{ setMessage('Wait.'); scene('ov_glitch',1,{x:F.x+F.w*.35,y0:F.top+4,h:F.h*.8}); scene('oz_art',1.2,{art:'ir_hand',x:F.x+F.w*.35,y:F.mid,h:70,pop:1,fa:.9}); scene('ov_text',.9,{x:me.x-10,y:me.base-me.h-10,txt:'7 FINGERS',c:'#ff8a8a',sc:1}); }],
    [1700,()=>{ say(m.id,'is_this_real'); setMessage('Too many fingers. Fake.'); }],
    ['hf',1950],
    [1950,()=>{ sfxp('bonk'); jitter(f); landHit(100); scene('oz_art',1.3,{art:'ir_fake',x:F.x+F.w*.35,y:F.mid,w:130,rot:-.25,pop:1,fa:.9,fb:'ov_stamp',fbs:{x:F.x+F.w*.35,y:F.mid}}); scene('ov_ring',.6,{x:F.x+F.w*.35,y:F.mid,r:44,c:'#ff6a6a'}); scene('oz_art',.6,{art:'ir_burst',x:F.x+F.w*.35,y:F.mid,w:76,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.35,y:F.mid,n:9,r:28,c:'#ff6a6a'}}); }],
    [2700,()=>{ setMessage('It is trying to count its own fingers.'); scene('oz_art',1.1,{art:'ir_stars',x:F.x+F.w*.35,y:F.top-8,w:90,fa:.9}); }],
    [3550,'end',res(E2)+'It has no idea what it is any more.']]); };

// ---------- Inverted Pyramid (6.0 s) ----------
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
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:200,f:'run',ease:'in'},{t:600,x:p.x,y:p.y,f:'ab_ip_1'}];
  K.push(...seq([['ab_ip_1',450],['ab_ip_2',500],['ab_ip_3',400],['ab_ip_4',400],['ab_ip_5',600],['ab_ip_6',450]],600,p.x,p.y));
  K.push({t:3400,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:3800,x:'home',y:'home',f:'idle'},{t:3900,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia puts on her professor face.')],
    [200,()=>sfxp('whoosh')],
    [650,()=>{ say(m.id,'inverted_pyramid_lecture'); sfxp('step'); setMessage('Her students are not here. She lectures anyway.'); }],
    [1550,()=>{ setMessage('She draws the inverted pyramid in the air.'); scene('oz_art',1.6,{art:'ip_tri_outline',x:p.x-64,y:p.y-me.h*.8+30,w:96,fa:.95,fb:'ov_pyramid',fbs:{x:p.x-64,y:p.y-me.h*.8,w:96,h:60}}); sfxp('whoosh'); }],
    [2350,()=>{ setMessage('The point comes down.'); sfxp('whoosh'); scene('oz_art',.8,{art:'ip_tri_solid',x:F.x+F.w*.3,y0:F.top-45,y1:F.mid+45,w:84,fa:.75,fb:'ov_pyfall',fbs:{x:F.x+F.w*.3,y0:F.top-80,y1:F.mid+10,w:84,h:70}}); scene('oz_art',.7,{art:'ip_slam',x:F.x+F.w*.3,y:F.top-30,h:80,fa:.7}); }],
    ['hf',2700],
    [2450,()=>say(m.id,'inverted_pyramid')],
    [2700,()=>{ sfxp('bonk'); sfxp('thud'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.4); scene('ov_flash',.2,{a:.4,c:'#fff3a0'}); scene('ov_ring',.7,{x:F.x+F.w*.3,y:F.base-4,r:60,c:GOLD}); scene('ov_poof',.7,{x:F.x+F.w*.3,y:F.base,n:9,r:34,c:'#fff3c0'}); scene('oz_art',1,{art:'ip_dust',x:F.x-F.w*.4,y:F.base-12,w:110,fb:'ov_dust',fbs:{x:F.x-F.w*.4,y:F.base}}); scene('oz_art',.8,{art:'ip_wham',x:F.x+F.w*.3,y:F.mid,w:120,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:14,r:40,c:GOLD}}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'THE LEDE',c:GOLD,sc:3}); }],
    [3100,()=>{ setMessage('Who, what, when, where, WHAM.'); scene('oz_art',1.4,{art:'ip_who_what',x:p.x,y:p.y-me.h-44,h:48,pop:1,fa:.9}); }],
    [3900,'end',res(E2)+'Buried.']]); };

// ---------- Marine Layer (6.5 s) ----------
// shivers in her dress, pulls the hoodie on, hood up and miserable, then declares a crisis as gray fog rolls over every enemy
SC.ov_fog=(s,u)=>{ const a=fin(u,.2)*fade(u,.75)*.8; for(let k=0;k<22;k++) { const x=lerp(s.x1+60,s.x0-40,cl(u*1.15))+((k*37)%110)-55,y=s.y+(((k*53)%100)-50)*s.sp/50+Math.sin(u*5+k)*4; gfx.globalAlpha=a*(.3+(k%3)*.18); E(x,y,36+(k%4)*9,15+(k%3)*5,GRAY); } };
SC.ov_drizzle=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.8)*.5; for(let k=0;k<26;k++) { const x=10+((k*83)%556),y=((u*1.6+(k%9)*.11)%1)*330; Ln(x,y,x-2,y+9,1,'#dfe6ea'); } };
O.marine_layer=E2=>{ const {m,fx}=E2,me=ST.unit(m),foes=foesOf(E2),G=ST.group(foes);
  const K=[{t:0,x:'home',y:'home',f:'ab_ml_1'}];
  K.push(...seq([['ab_ml_1',550],['ab_ml_2',550],['ab_ml_3',600],['ab_ml_4',800],['ab_ml_5',600],['ab_ml_6',700]],0,'home','home'));
  K.push({t:3800,x:'home',y:'home',f:'idle'},{t:4300,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('It is a little chilly in Los Angeles.'); sfxp('whoosh'); scene('ov_text',.9,{x:me.x,y:me.base-me.h-8,txt:'BRRR',c:'#cfe0ea',sc:2}); scene('oz_art',1.4,{art:'ml_thermo',x:me.x+22,y:me.base-me.h*.5,h:40,pop:1,fa:.9}); }],
    [550,()=>{ setMessage('Hoodie on. Over the dress.'); scene('oz_art',1.4,{art:'ml_hoodie',x:me.x,y:me.base-me.h*.55,w:50,pop:1,fa:.9}); }],
    [1150,()=>{ say(m.id,'marine_layer'); setMessage('"It\'s sixty-two degrees."'); scene('ov_dim',3.4,{a:.32,c:'#566878'}); scene('ov_text',1.4,{x:me.x,y:me.base-me.h-8,txt:'62 DEGREES',c:'#cfe0ea',sc:2}); }],
    [1500,()=>{ scene('oz_art',3.2,{art:'ml_fog_bank',x:(G.x0+576)/2,y:G.top+Math.max(20,(G.base-G.top)*.5),w:300,a:.85,fa:.9,fb:'ov_fog',fbs:{x0:G.x0-20,x1:576,y:G.top+Math.max(20,(G.base-G.top)*.5),sp:Math.max(40,G.base-G.top)}}); scene('ov_drizzle',3,{}); scene('oz_art',1.2,{art:'ml_mist',x:(G.x0+560)/2,y:G.top+20,w:260,fa:.9,fb:'ov_streaks',fbs:{x0:G.x0-20,x1:560,y:G.top+20}}); }],
    [1800,()=>say(m.id,'marine_layer_crisis')],
    ['hf',1950],
    [1950,()=>{ setMessage('This is a crisis.'); sfxp('ding'); landHit(100); for(const f of foes) { const F=ST.unit(f); jitter(f); scene('oz_art',.6,{art:'ml_splash',x:F.x+F.w*.3,y:F.mid,w:70,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:8,r:24,c:GRAY}}); scene('oz_art',1.6,{art:'ml_sad_cloud',x:F.x+F.w*.3,y:F.top-8,w:70,pop:1,fa:.9}); scene('ov_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:36,c:'#dfe6ea'}); } battle.shake=Math.max(battle.shake||0,.25); scene('ov_text',1.2,{x:me.x,y:me.base-me.h-8,txt:'CRISIS',c:'#cfd8de',sc:3}); }],
    [2500,()=>{ setMessage('Everyone is cold now. Spiritually.'); for(const f of foes) { const F=ST.unit(f); scene('oz_art',1.4,{art:'ml_snow',x:F.x+F.w*.5,y:F.top-4,w:110,fa:.9}); } }],
    [3100,()=>setMessage('She is from New York. She knows what cold is. This is worse.')],
    [4300,'end',res(E2)+'The marine layer wins again.']]); };

// ---------- Double Under (7.0 s) ----------
// rope out, a rusty first jump that trips her (does nothing), then two big double-unders and a whip
SC.ov_ropering=(s,u)=>{ gfx.globalAlpha=fade(u,.5); gfx.strokeStyle='#c43a3a'; gfx.lineWidth=3; const q=ez(u/.5);
  gfx.beginPath(); gfx.ellipse(s.x,s.y,10+q*(s.r||36),(10+q*(s.r||36))*.55,0,0,Math.PI*2); gfx.stroke(); };
O.double_under=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,100),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:200,f:'run',ease:'in'},{t:600,x:p.x,y:p.y,f:'ab_du_1'}];
  K.push(...seq([['ab_du_1',500],['ab_du_2',500],['ab_du_3',450],['ab_du_4',400],['ab_du_5',400],['ab_du_6',700]],600,p.x,p.y));
  K.push({t:3550,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:3950,x:'home',y:'home',f:'idle'},{t:4050,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia pulls out a jump rope.')],
    [200,()=>sfxp('whoosh')],
    [650,()=>{ say(m.id,'double_under_ready'); }],
    [1100,()=>{ setMessage('She trips on the first jump.'); sfxp('thud'); say(m.id,'double_under_trip'); scene('oz_art',.5,{art:'du_dust',x:p.x,y:p.y,w:60,fb:'ov_poof',fbs:{x:p.x,y:p.y,r:20}}); scene('ov_text',.8,{x:p.x,y:p.y-me.h-6,txt:'OOF',c:'#ffd6c0',sc:2}); }],
    [1650,()=>setMessage('Shoes stay on. This is serious.')],
    [1950,()=>{ setMessage('The champion is back.'); scene('ov_sparks',.6,{x:p.x,y:p.y-me.h*.7,n:8,r:26,c:GOLD}); }],
    [2050,()=>{ sfxp('whoosh'); scene('oz_art',.5,{art:'du_rope_loop',x:p.x,y:p.y-2,w:96,fb:'ov_ropering',fbs:{x:p.x,y:p.y-2,r:46}}); scene('ov_text',.6,{x:p.x,y:p.y-me.h-6,txt:'X2',c:'#ff9a8a',sc:2}); }],
    [2450,()=>{ sfxp('whoosh'); scene('oz_art',.5,{art:'du_rope_loop',x:p.x,y:p.y-2,w:96,fb:'ov_ropering',fbs:{x:p.x,y:p.y-2,r:46}}); scene('ov_text',.6,{x:p.x,y:p.y-me.h-6,txt:'X2 AGAIN',c:'#ff9a8a',sc:2}); }],
    [2850,()=>{ sfxp('bonk'); jitter(f); landHit(50); scene('oz_art',.6,{art:'du_ring',x:F.x+F.w*.3,y:F.base-4,w:F.w*.9,fb:'ov_ropering',fbs:{x:F.x+F.w*.3,y:F.base-4,r:F.w*.5}}); scene('oz_art',.5,{art:'du_stars',x:F.x+F.w*.3,y:F.mid,w:90,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:8,r:26,c:'#ff9a8a'}}); }],
    ['hf',3050],
    [3000,()=>say(m.id,'double_under')],
    [3050,()=>{ setMessage('Double under. Whip.'); sfxp('bonk'); sfxp('ding'); jitter(f); landHit(50); battle.shake=Math.max(battle.shake||0,.4); scene('ov_flash',.15,{a:.3,c:'#ffd6c0'}); scene('oz_art',.5,{art:'du_whip',x:F.x+F.w*.3,y:F.mid+10,w:F.w*.8,fb:'ov_crack',fbs:{x:F.x+F.w*.3,y:F.mid+10}}); scene('ov_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:50,c:'#ff6a5a'}); scene('oz_art',.7,{art:'du_gold',x:F.x+F.w*.3,y:F.mid,w:110,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:14,r:40,c:'#ff6a5a'}}); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'THERE IT IS',c:'#ffd6c0',sc:3}); }],
    [3450,()=>setMessage('Nobody in this family beat her at this. Nobody.')],
    [4050,'end',res(E2)+'Still got it.']]); };

// ---------- Story Time (7.5 s) ----------
// sits down cross-legged, shows the book, reads, shhh, closes it. Night falls, a moon comes out, the enemy nods off.
SC.ov_zzz=(s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; label('Z',s.x+k*10+Math.sin(q*6+k)*4,s.y-q*44-k*8,'#cfd8ff',2+(k%2)); } };
O.story_time=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,110),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:200,f:'run',ease:'in'},{t:600,x:p.x,y:p.y,f:'ab_st_1'}];
  K.push(...seq([['ab_st_1',500],['ab_st_2',500],['ab_st_3',500],['ab_st_4',900],['ab_st_5',600],['ab_st_6',700]],600,p.x,p.y));
  K.push({t:4300,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:4700,x:'home',y:'home',f:'idle'},{t:4800,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Olivia sits down cross-legged.')],
    [200,()=>sfxp('whoosh')],
    [700,()=>{ scene('ov_dim',5.4,{a:.42,c:'#0c1240'}); scene('ov_night',5.2,{x:500,y:46}); scene('ov_spot',5,{x:p.x,y:p.y,r:70}); scene('ov_fireflies',5,{}); setMessage('She opens her own children\'s book.'); }],
    [1600,()=>{ setMessage('She holds up the first page.'); scene('ov_sparks',.8,{x:p.x-10,y:p.y-me.h*.6,n:8,r:22,c:'#cfd8ff'}); scene('oz_art',1.8,{art:'st_book_open',x:p.x-10,y:p.y-me.h*.6,w:60,pop:1,fa:.9}); }],
    [2100,()=>{ say(m.id,'story_time'); setMessage('"Once upon a time, in a very quiet house..."'); scene('ov_notes',2.4,{x:p.x-20,y:p.y-me.h*.8}); }],
    ['hf',2400],
    [2500,()=>{ sfxp('ding'); landHit(100); scene('oz_art',2.8,{art:'st_zzz',x:F.x+F.w*.35,y:F.top+10,w:70,fa:.9,fb:'ov_zzz',fbs:{x:F.x+F.w*.35,y:F.top+10}}); scene('oz_art',2.6,{art:'st_glow',x:F.x+F.w*.35,y:F.mid,w:110,a:.8,fa:.9}); scene('oz_art',.9,{art:'st_stars',x:F.x+F.w*.35,y:F.top+20,w:80,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.35,y:F.top+20,n:9,r:26,c:'#cfd8ff'}}); scene('ov_ring',.8,{x:F.x+F.w*.35,y:F.mid,r:40,c:'#8fa0ff'}); }],
    [2800,()=>{ setMessage('She does the voices.'); scene('oz_art',1.4,{art:'st_swirl',x:F.x+F.w*.35,y:F.mid,w:90,pop:1,fa:.9}); }],
    [3000,()=>{ setMessage(f.name+' is nodding off.'); }],
    [3350,()=>{ say(m.id,'story_time_end'); scene('ov_text',1,{x:p.x,y:p.y-me.h-6,txt:'SHHH',c:'#cfd8ff',sc:2}); scene('oz_art',1.2,{art:'st_book_closed',x:p.x,y:p.y-me.h*.6,w:50,pop:1,fa:.9}); }],
    [3900,()=>setMessage('Page two is never needed.')],
    [4300,()=>setMessage('She wrote it. She will tell you she wrote it.')],
    [4800,'end',res(E2)+'And everybody went to sleep.']]); };

// ---------- MICHAEL! (9.0 s) ----------
// tired stare, breath, yell, a long wait, yell louder, point. A faint WHAT? from somewhere, then a diaper bag flies in from off screen and flattens the enemy. Michael is never drawn (his own sheet is still a draft).
const bag=(x,y,rot)=>{ if(PROPART.draw('olivia/diaper_bag',x,y,{h:30})) return; gfx.save(); gfx.translate(x,y); R(-11,-8,22,16,'#6aa0d8'); R(-11,-8,22,4,'#9fc8ee'); R(-11,0,22,3,'#ffffff'); R(-5,-12,10,4,'#4a78ac'); R(-3,-14,6,3,'#cfd8e6'); gfx.restore(); };
O.michael=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ab_mi_1'}];
  K.push(...seq([['ab_mi_1',400],['ab_mi_2',400],['ab_mi_3',600],['ab_mi_4',1100],['ab_mi_5',800],['ab_mi_6',1400]],0,'home','home'));
  K.push({t:4700,x:'home',y:'home',f:'idle'},{t:5600,f:'idle'});
  ST.keys(fx,K);
  const hitT=3350;
  ST.play(E2,[
    [0,()=>setMessage('Olivia takes a huge breath.')],
    [800,()=>{ say(m.id,'michael_1'); setMessage('MICHAEL!'); battle.shake=Math.max(battle.shake||0,.15); scene('ov_text',1,{x:me.x+24,y:me.base-me.h-4,txt:'MICHAEL!',c:'#ffd27a',sc:3}); }],
    [1500,()=>{ setMessage('Nothing.'); scene('ov_text',.9,{x:me.x+30,y:me.base-me.h-4,txt:'...',c:'#cfd8e6',sc:3}); }],
    [1900,()=>setMessage('Crickets.')],
    [2200,()=>setMessage('A bird. Somewhere, a bird.')],
    [2500,()=>{ say(m.id,'michael'); setMessage('MICHAEL, HANDLE THIS!'); battle.shake=Math.max(battle.shake||0,.4); scene('ov_flash',.15,{a:.25,c:'#ffd27a'}); scene('ov_skysplit',.6,{x:me.x+40,y:me.base-me.h-10}); scene('ov_text',1.1,{x:me.x+30,y:me.base-me.h-4,txt:'HANDLE THIS!',c:'#ff9a7a',sc:3}); }],
    [2750,()=>{ setMessage('A faint voice from somewhere.'); scene('ov_text',.9,{x:548,y:120,txt:'WHAT?',c:'#cfd8e6',sc:1}); }],
    [2950,()=>{ sfxp('whoosh'); ST.fly(bag,640,me.base-me.h*1.3,F.x+F.w*.35,F.mid-4,.55,70,0,{spin:4}); }],
    ['hf',hitT],
    [hitT,()=>{ sfxp('thud'); sfxp('bonk'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.6); scene('ov_flash',.25,{a:.45}); scene('ov_ring',.8,{x:F.x+F.w*.35,y:F.base-4,r:70,c:'#dfe9f6'}); scene('ov_poof',.8,{x:F.x+F.w*.35,y:F.base,n:12,r:44}); scene('ov_dust',1,{x:F.x-F.w*.5,y:F.base}); scene('ov_sparks',.8,{x:F.x+F.w*.35,y:F.mid,n:14,r:40,c:'#9fc8ee'}); scene('ov_text',1.1,{x:F.x+F.w*.35,y:F.top-30,txt:'WHAM',c:'#ffe08a',sc:4}); }],
    [3800,()=>say(m.id,'michael_thanks')],
    [4700,()=>setMessage('He was in the car the whole time.')],
    [5200,()=>setMessage('He did not look up.')],
    [5600,'end',res(E2)+'He handled it.']]); };

// ---------- LACHLAN, NO! (8.0 s) ----------
// she spots Lachlan, drops into a sprinter's start, runs straight through the enemy with speed lines, and reaches Lachlan: he is painted in the last four frames
// (a leap to grab him, scooping him up, a hug, him on her hip with the stick)
O.lachlan_no=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const homeX=me.x,homeY=me.base,endX=Math.max(40,F.x-F.w*.5-46),by=Math.min(316,F.base+4);
  const K=[{t:0,x:'home',y:'home',f:'ab_lk_1'},{t:750,x:'home',y:'home',f:'ab_lk_2'},{t:1150,x:'home',y:'home',f:'run',ease:'in'},{t:1850,x:endX,y:by,f:'ab_lk_3'}];
  K.push({t:2300,x:endX,y:by,f:'ab_lk_4'},{t:2800,x:endX,y:by,f:'ab_lk_5'},{t:3350,x:endX,y:by,f:'ab_lk_6'},{t:4100,x:endX,y:by,f:'runR',ease:'lin'},{t:4700,x:'home',y:'home',f:'idle'},{t:5000,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia spots Lachlan about to climb something.'); say(m.id,'lachlan_no'); scene('ov_flash',.2,{a:.25,c:'#ff8a7a'}); scene('ov_text',1.1,{x:me.x,y:me.base-me.h-6,txt:'LACHLAN, NO!',c:'#ff8a7a',sc:3}); scene('oz_art',1.1,{art:'lk_exclaim',x:me.x+18,y:me.base-me.h-14,h:34,pop:1,fa:.9}); }],
    [750,()=>{ setMessage('Full mom sprint.'); sfxp('whoosh'); scene('ov_banner',1,{y:40,txt:'MOM SPEED'}); }],
    [1150,()=>{ setMessage('The enemy is in the way. The enemy is no longer in the way.'); scene('oz_art',.9,{art:'lk_streak',x:(endX+homeX)/2,y:homeY-me.h*.5,w:Math.abs(homeX-endX)+40,fa:.8,fb:'ov_streaks',fbs:{x0:endX,x1:homeX,y:homeY-me.h*.5}}); scene('oz_art',1,{art:'lk_dust',x:homeX-10,y:homeY-6,w:70,fa:.8,fb:'ov_dust',fbs:{x:homeX-10,y:homeY}}); }],
    ['hf',1550],
    [1550,()=>{ sfxp('bonk'); sfxp('thud'); jitter(f); landHit(100); battle.shake=Math.max(battle.shake||0,.6); scene('ov_flash',.25,{a:.4}); scene('ov_ring',.8,{x:F.x+F.w*.3,y:F.base-4,r:76,c:'#ffd27a'}); scene('oz_art',.9,{art:'lk_burst2',x:F.x+F.w*.3,y:F.base-18,w:110,pop:1,fb:'ov_poof',fbs:{x:F.x+F.w*.3,y:F.base,n:12,r:46}}); scene('oz_art',.8,{art:'lk_burst',x:F.x+F.w*.3,y:F.mid,w:96,pop:1,fb:'ov_sparks',fbs:{x:F.x+F.w*.3,y:F.mid,n:14,r:40,c:'#ffd27a'}}); scene('ov_text',1,{x:F.x+F.w*.3,y:F.top-30,txt:'THROUGH',c:'#ffe08a',sc:3}); }],
    [1850,()=>{ sfxp('thud'); scene('ov_poof',.7,{x:endX,y:by,n:9,r:30}); scene('ov_dust',.8,{x:endX-40,y:by}); }],
    [2350,()=>{ say(m.id,'lachlan_no_got'); setMessage('Got him. Got him. We\'re fine.'); scene('oz_art',1.4,{art:'lk_heart',x:me.x+6,y:me.base-me.h-22,h:30,pop:1,fa:.9}); }],
    [3350,()=>{ setMessage('He was holding a stick. Just a stick.'); scene('ov_text',1,{x:endX+10,y:by-me.h-6,txt:'...',c:'#cfd8e6',sc:3}); scene('oz_art',1.2,{art:'lk_stick',x:endX+14,y:by-6,h:40,pop:1,fa:.9}); }],
    [3900,()=>setMessage('Michael did not notice. Michael is on a call.')],
    [4300,()=>setMessage('She walks back like nothing happened.')],
    [5000,'end',res(E2)+'He was fine. He was always fine.']]); };

// ---------- Better Than Bobby (ultimate, 10.6 s) ----------
// the lights go down, a spotlight. She counts on her fingers, every count a bigger hit on a different enemy, then the mic drop and the confetti.
const mic=(x,y)=>{ if(PROPART.draw('olivia/mic',x,y+2,{h:24})) return; R(x-2,y-2,4,12,'#1a1a22'); E(x,y-5,5,5,'#2a2a34'); R(x-5,y-8,10,2,'#46464f'); };
O.better_than_bobby=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'ab_bb_1'}];
  K.push(...seq([['ab_bb_1',400],['ab_bb_2',700],['ab_bb_3',1000],['ab_bb_4',1200],['ab_bb_5',800],['ab_bb_6',1000]],0,'home','home'));
  K.push({t:5100,x:'home',y:'home',f:'idle'},{t:6000,f:'idle'});
  ST.keys(fx,K);
  const words=['JUMP ROPE','GRADES','PARKING','COOKING','MARIO KART'],times=[500,1200,1800,2300,2900];
  const hit=k=>()=>{ const f=waveFoe(k),F=ST.unit(f); sfxp(k===4?'ding':'bonk'); jitter(f); landHit(20); battle.shake=Math.max(battle.shake||0,.1+k*.08);
    scene('ov_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:26+k*8,c:k%2?GOLD:BLUE}); scene('ov_sparks',.6+k*.05,{x:F.x+F.w*.3,y:F.mid,n:8+k*3,r:24+k*7,c:k%2?GOLD:BLUE,seed:k});
    scene('ov_text',1,{x:F.x+F.w*.3,y:F.top-4-k*2,txt:words[k],c:k===4?'#ffe08a':CREAM,sc:k===4?3:2}); scene('ov_text',.8,{x:me.x-24,y:me.base-me.h-4,txt:String(k+1),c:'#ffd6f0',sc:3+(k===4?1:0)}); if(k===4) scene('ov_flash',.2,{a:.3,c:'#fff3a0'}); };
  ST.play(E2,[
    [0,()=>{ setMessage('Olivia has a list. About her brother Bobby.'); say(m.id,'better_than_bobby_a'); scene('ov_dim',6.2,{a:.5,c:'#0a0820'}); scene('ov_spot',6,{x:me.x,y:me.base,r:64}); }],
    ...times.map((t,k)=>[t,hit(k)]),
    [2100,()=>say(m.id,'better_than_bobby_b')],
    ['hf',2900],
    [3300,()=>{ setMessage('Arms crossed. Chin up.'); scene('ov_text',1.2,{x:me.x,y:me.base-me.h-10,txt:'FIVE FOR FIVE',c:GOLD,sc:2}); }],
    [3500,()=>{ setMessage('She holds out the mic.'); sfxp('whoosh'); scene('ov_sparks',.9,{x:me.x-60,y:me.base-me.h*.5,n:10,r:26,c:GOLD}); }],
    [4300,()=>{ say(m.id,'better_than_bobby'); setMessage('Sorry, Bobby.'); ST.fly(mic,me.x-60,me.base-me.h*.5,me.x-84,me.base+2,.4,24,0,{spin:2}); }],
    [4550,()=>{ sfxp('thud'); sfxp('ding'); battle.shake=Math.max(battle.shake||0,.7); scene('ov_flash',.35,{a:.5,c:'#fff3a0'}); scene('ov_ring',.9,{x:me.x-84,y:me.base+2,r:120,c:'#ffffff'}); scene('ov_confetti',2.4,{}); scene('ov_banner',2.2,{y:40,txt:'BETTER THAN BOBBY'}); }],
    [5100,()=>{ setMessage('A voice from somewhere: I LET YOU WIN.'); scene('ov_text',1,{x:548,y:120,txt:'I LET YOU WIN',c:'#cfd8e6',sc:1}); }],
    [5600,()=>setMessage('He did not. Bobby was not asked for comment.')],
    [6000,'end',res(E2)+'Mic dropped.']]); };

// Same stretch as Justin's moves: the painted frames are held long enough to read.
(function(){ const S0=1.6;
  for(const key of Object.keys(O)) { const fn=O[key];
    O[key]=E2=>{ const k0=ST.keys,p0=ST.play;
      ST.keys=(fx,K)=>k0(fx,K.map(o=>Object.assign({},o,{t:o.t*S0})));
      ST.play=(e,list)=>p0(e,list.map(it=>it[0]==='hf'?['hf',it[1]*S0]:[it[0]*S0,...it.slice(1)]));
      try { return fn(E2); } finally { ST.keys=k0; ST.play=p0; } }; } })();
})();
