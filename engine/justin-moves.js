'use strict';
// engine/justin-moves.js: Justin's nine moves as set pieces on engine/stage.js. He is painted (data/justin-battle-use.js):
// every ability frame is a sprite key named as in the sheet ('lw_jab', 'wn_throwA'...), plus an R copy facing right.
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
// a run of frames: seq([['lw_grab',300],...],t0) -> keys at x,y
const seq=(list,t0,x,y,extra={})=>{ const out=[]; let t=t0; for(const [f,d,o] of list) { out.push(Object.assign({t,x,y,f},extra,o||{})); t+=d; } return out; };
const wob=(a,b)=>u=>Math.sin(u*Math.PI*2*(b||1))*a;
const hexNut=(x,y,r,c)=>{ gfx.beginPath(); for(let k=0;k<6;k++) { const a=k*Math.PI/3; gfx[k?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r); } gfx.closePath(); gfx.fillStyle='#17110d'; gfx.fill(); gfx.beginPath(); for(let k=0;k<6;k++) { const a=k*Math.PI/3; gfx[k?'lineTo':'moveTo'](x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2)); } gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };

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
J.loose_wire=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,36),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:380,f:'run',ease:'in'},{t:900,x:p.x,y:p.y,f:'lw_spot'}];
  K.push(...seq([['lw_grab',260],['lw_pull',300],['lw_present',300],['lw_jab',260],['lw_zap',420],['lw_drop',320],['lw_smirk',520]],900,p.x,p.y));
  K.push({t:3300,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:3900,x:'home',y:'home',f:'idle'},{t:4100,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>setMessage('Justin spots a loose wire in a wall that is not there.')],
    [700,()=>say(m.id,'loose_wire_spot')],
    [380,()=>sfx.whoosh&&sfx.whoosh()],
    ['hf',2300],
    [1500,()=>{ sfx.bump&&sfx.bump(); say(m.id,'loose_wire'); }],
    [2200,()=>{ setMessage('He jabs the bare copper end at it.'); sfx.zap&&sfx.zap(); jitter(f); landHit(100); scene('jv_wirespark',.6,{x:F.x+F.w*.3,y:F.mid,seed:0}); }],
    [2400,()=>{ sfx.zap&&sfx.zap(); scene('jv_zapfx',.5,{x:p.x-4,y:p.y-80}); scene('jv_text',.9,{x:p.x,y:p.y-130,txt:'ZZT',c:SPARK,sc:2}); }],
    [3000,()=>say(m.id,'loose_wire_zap')],
    [3300,'end',res(E2)+'Not his problem any more.']]); };

// ---------- Wire Nuts (three quick throws) ----------
J.wire_nuts=E2=>{ const {m,fx}=E2,me=ST.unit(m),f0=waveFoe(0)||firstFoe(E2),f1=waveFoe(1)||f0,f2=waveFoe(2)||f0;
  const K=[{t:0,x:'home',y:'home',f:'idle'}];
  K.push(...seq([['wn_reach',260],['wn_grab',240],['wn_show',420],['wn_wind',260],['wn_throwA',200],['wn_throwB',200],['wn_throwC',260],['wn_reload',300],['wn_windB',220],['wn_throwD',200],['wn_throwE',360],['wn_dust',300],['wn_pocket',360],['wn_nod',420]],0,'home','home'));
  K.push({t:4000,x:'home',y:'home',f:'idle'},{t:4300,f:'idle'});
  ST.keys(fx,K);
  const cols=['#e84a3a','#f0c030','#3a8ae8','#e86aa8','#50c868'];
  const toss=(f,t0,dur,hit,pct,n)=>{ const F=ST.unit(f); for(let k=0;k<n;k++) { const c=cols[(k+n)%cols.length]; ST.fly((x,y)=>hexNut(x,y,5,c),me.x-30,me.base-me.h*.55,F.x+(k-1)*8,F.mid+(k-1)*6,.38,36+k*8,k*.05,{spin:2+k}); }
    return [[t0+dur*1000-380+380,()=>{ sfx.bonk&&sfx.bonk(); jitter(f); landHit(pct); scene('jv_sparks',.4,{x:F.x,y:F.mid,n:5,r:16,c:'#f0c030'}); }]]; };
  ST.play(E2,[
    [0,()=>{ setMessage('Justin digs in his pocket.'); say(m.id,'wire_nuts'); }],
    [900,()=>{ setMessage('Fistfuls of wire nuts.'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',1900],
    [1250,()=>say(m.id,'wire_nuts_1')],
    [1280,()=>{ for(let k=0;k<3;k++) ST.fly((x,y)=>hexNut(x,y,5,cols[k]),me.x-30,me.base-me.h*.5,ST.unit(f0).x+(k-1)*8,ST.unit(f0).mid+(k-1)*6,.26,30+k*8,k*.05,{spin:2}); }],
    [1700,()=>{ sfx.bonk&&sfx.bonk(); jitter(f0); landHit(34); scene('jv_sparks',.4,{x:ST.unit(f0).x,y:ST.unit(f0).mid,n:5,r:16,c:'#f0c030'}); }],
    [1870,()=>say(m.id,'wire_nuts_2')],
    [1900,()=>{ for(let k=0;k<3;k++) ST.fly((x,y)=>hexNut(x,y,5,cols[k+1]),me.x-30,me.base-me.h*.5,ST.unit(f1).x+(k-1)*8,ST.unit(f1).mid+(k-1)*6,.26,30+k*8,k*.05,{spin:3}); }],
    [2300,()=>{ sfx.bonk&&sfx.bonk(); jitter(f1); landHit(33); scene('jv_sparks',.4,{x:ST.unit(f1).x,y:ST.unit(f1).mid,n:5,r:16,c:'#e86aa8'}); }],
    [2600,()=>say(m.id,'wire_nuts_3')],
    [2700,()=>{ ST.fly((x,y)=>hexNut(x,y,7,'#3a8ae8'),me.x-30,me.base-me.h*.6,ST.unit(f2).x,ST.unit(f2).mid,.3,50,0,{spin:4}); }],
    [3150,()=>{ sfx.bonk&&sfx.bonk(); sfx.ding&&sfx.ding(); jitter(f2); landHit(33); scene('jv_sparks',.5,{x:ST.unit(f2).x,y:ST.unit(f2).mid,n:7,r:22,c:'#50c868'}); }],
    [3850,()=>say(m.id,'wire_nuts_nod')],
    [4300,'end',res(E2)+'Never enough of these.']]); };

// ---------- Bad Call ----------
J.bad_call=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'bc_watch'}];
  K.push(...seq([['bc_watch',300],['bc_lean',300],['bc_shock',320],['bc_rise',320],['bc_point',420],['bc_yellA',260],['bc_yellB',240],['bc_yellC',240],['bc_pace',300],['bc_armsOut',300],['bc_headGrab',300],['bc_stomp',300],['bc_yellD',300],['bc_huff',340],['bc_sit',420],['bc_mutter',620]],0,'home','home'));
  K.push({t:5200,x:'home',y:'home',f:'idle'},{t:5500,f:'idle'});
  ST.keys(fx,K);
  SC.jv_callwave=SC.jv_callwave||((s,u)=>{ for(let k=0;k<4;k++) { const q=cl(u*1.4-k*.1); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; const x=lerp(s.x0,s.x1,q); gfx.strokeStyle='#ffd27a'; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(x,s.y,4+q*10,10+q*24,0,0,Math.PI*2); gfx.stroke(); } });
  ST.play(E2,[
    [0,()=>setMessage('Justin is on the couch. The game is on.')],
    [150,()=>say(m.id,'bad_call_couch')],
    [960,()=>{ setMessage('He is up. He is pointing.'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',1700],
    [1500,()=>{ scene('jv_callwave',.9,{x0:me.x-50,x1:F.x+F.w*.4,y:F.mid}); sfx.bump&&sfx.bump(); say(m.id,'bad_call'); }],
    [1700,()=>{ sfx.bonk&&sfx.bonk(); jitter(f); landHit(100); scene('jv_text',1,{x:me.x-20,y:me.base-me.h-6,txt:'WHAT?!',c:'#ff7a5a',sc:3}); scene('jv_ring',.6,{x:F.x+F.w*.3,y:F.mid,r:40,c:'#ffd27a'}); }],
    [2900,()=>{ sfx.thud&&sfx.thud(); ST.jolt(f,.2); scene('jv_poof',.5,{x:me.x,y:me.base,r:30}); }],
    [3550,()=>say(m.id,'bad_call_yell')],
    [4000,()=>setMessage('He sits back down, muttering.')],
    [4500,()=>say(m.id,'bad_call_sit')],
    [5500,'end',res(E2)+'The ref has been told.']]); };

// ---------- Fresh Fit ----------
SC.jv_dazzle=(s,u)=>{ gfx.globalAlpha=fade(u,.3)*.8; R(0,0,576,324,'#ffffff'); gfx.globalAlpha=fade(u,.7); for(let k=0;k<12;k++) { const a=k*Math.PI/6+u,d=ez(u)*(24+k%3*14); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,5+k%3*3,k%2?'#fff3a0':'#ffd6f0',u*5); } for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(s.x,s.y,s.x+Math.cos(a)*(30+u*40),s.y+Math.sin(a)*(30+u*40),3,'#fff8c0'); } };
J.fresh_fit=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),mid={x:Math.max(me.x-130,F.x+F.w*.5+90),y:me.base};
  const walk=(u,t)=>Math.floor(t*7)%2?'ff_walkA':'ff_walkB';
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:walk,ease:'lin'},{t:1000,x:mid.x,y:mid.y,f:'ff_stop'}];
  K.push(...seq([['ff_stop',260],['ff_collar',320],['ff_sleeve',280],['ff_shades',380],['ff_poseA',280],['ff_poseB',280],['ff_turn',260],['ff_poseC',280],['ff_cuff',260],['ff_poseD',420],['ff_lookBack',260],['ff_wink',420]],1000,mid.x,mid.y));
  K.push({t:4700,x:mid.x,y:mid.y,f:'ff_strutR',ease:'lin'},{t:5500,x:'home',y:'home',f:'ff_strutR'},{t:5800,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin walks it out like a runway.'); say(m.id,'fresh_fit_runway'); }],
    [300,()=>sfx.step&&sfx.step()],
    [1250,()=>say(m.id,'fresh_fit_shades')],
    [1800,()=>{ setMessage('Collar. Cuff. Shades.'); sfx.ding&&sfx.ding(); }],
    ['hf',3600],
    [3300,()=>{ setMessage('Pose.'); say(m.id,'fresh_fit'); }],
    [3600,()=>{ sfx.ding&&sfx.ding(); sfx.whoosh&&sfx.whoosh(); jitter(f); landHit(100); scene('jv_dazzle',.9,{x:F.x,y:F.mid}); }],
    [4100,()=>scene('jv_text',1,{x:mid.x,y:mid.y-me.h-8,txt:'DESIGNER',c:'#ffd6f0',sc:2})],
    [5200,()=>say(m.id,'fresh_fit_wink')],
    [5800,'end',res(E2)+'It cost more than the pond.']]); };

// ---------- Demo Day ----------
SC.jv_wall=(s,u)=>{ const x=s.x,y0=s.top-18,w=s.w+30,h=s.h+30,a=fin(u,.12)*(u>.86?(1-u)/.14:1);
  gfx.globalAlpha=a*.92; R(x-w/2,y0,w,h,'#c9bfb0'); R(x-w/2,y0,w,5,'#e6dccd'); for(let r=0;r<4;r++) R(x-w/2+6,y0+14+r*(h/4),w-12,2,'#a89d8c');
  const c=cl((u-s.t1)/.06); if(c>0) { gfx.strokeStyle='#4a4238'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(x-6,y0+4); gfx.lineTo(x+8,y0+h*.3); gfx.lineTo(x-10,y0+h*.55); gfx.lineTo(x+6,y0+h*.8); gfx.stroke(); }
  const c2=cl((u-s.t2)/.06); if(c2>0) { gfx.strokeStyle='#4a4238'; gfx.beginPath(); gfx.moveTo(x-w*.4,y0+h*.35); gfx.lineTo(x,y0+h*.4); gfx.lineTo(x+w*.4,y0+h*.3); gfx.moveTo(x-w*.3,y0+h*.7); gfx.lineTo(x+w*.3,y0+h*.65); gfx.stroke(); } };
SC.jv_chunks=(s,u)=>{ for(let k=0;k<12;k++) { const q=cl(u*1.25-k*.03); if(q<=0||q>=1) continue; const x=s.x+(k-6)*(s.w/12),y=s.top+q*q*(s.h+30)-12; gfx.globalAlpha=1-q*.5; gfx.save(); gfx.translate(x,y); gfx.rotate(q*5+k); R(-5,-4,10,8,k%2?'#c9bfb0':'#a89d8c'); gfx.restore(); } };
J.demo_day=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,38),me=ST.unit(m);
  const walk=(u,t)=>Math.floor(t*7)%2?'dd_walkA':'dd_walkB';
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:250,f:walk,ease:'lin'},{t:1000,x:p.x,y:p.y,f:'dd_lookUp'}];
  K.push(...seq([['dd_lookUp',300],['dd_crack',240],['dd_lift',320],['dd_shoulder',280],['dd_windA',260],['dd_windB',260],['dd_swingA',160],['dd_swingB',120],['dd_impact',320],['dd_recoil',300],['dd_windB',240],['dd_swingC',160],['dd_impactB',360],['dd_rest',380],['dd_wipe',480]],1000,p.x,p.y));
  K.push({t:5600,x:p.x,y:p.y,f:'runR',ease:'lin'},{t:6200,x:'home',y:'home',f:'idle'},{t:6400,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin spots a basement wall that has to go.'); say(m.id,'demo_day'); }],
    [250,()=>sfx.step&&sfx.step()],
    [1000,()=>scene('jv_wall',3.4,{x:F.x,top:F.top,w:F.w,h:F.h,t1:.31,t2:.57})],
    [1000,()=>say(m.id,'demo_day_look')],
    [1300,()=>setMessage('He hoists the sledgehammer.')],
    [2450,()=>say(m.id,'demo_day_one')],
    ['hf',2600],
    [2600,()=>{ sfx.thud&&sfx.thud(); sfx.bonk&&sfx.bonk(); ST.jolt(f,.4); landHit(45); scene('jv_poof',.5,{x:F.x,y:F.top+10,r:30}); }],
    [3000,()=>scene('jv_chunks',1.1,{x:F.x,top:F.top-20,w:F.w,h:F.h})],
    [3820,()=>say(m.id,'demo_day_two')],
    [3960,()=>{ sfx.thud&&sfx.thud(); sfx.bonk&&sfx.bonk(); ST.jolt(f,.6); landHit(55); scene('jv_poof',.6,{x:F.x,y:F.top+20,r:40}); }],
    [4100,()=>{ scene('jv_chunks',1.3,{x:F.x,top:F.top-30,w:F.w+20,h:F.h}); scene('jv_text',1,{x:F.x,y:F.top-14,txt:'DEMO DAY',c:'#ffe08a',sc:2}); }],
    [4750,()=>say(m.id,'demo_day_done')],
    [6400,'end',res(E2)+'The wall is coming down.']]); };

// ---------- Breaker Flip ----------
SC.jv_bolt=(s,u)=>{ const q=cl(u/.55); gfx.globalAlpha=fade(u,.5); const seg=8; let px=s.x,py=-4; for(let k=1;k<=seg;k++) { const nx=s.x+(k%2?-1:1)*(10-k)*(1+(k*7%3)),ny=lerp(-4,s.y,k/seg); if(k/seg<=q+.12) { Ln(px,py,nx,ny,8,'#9fd8ff'); Ln(px,py,nx,ny,3,'#ffffff'); } px=nx; py=ny; } };
J.breaker_flip=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const walk=(u,t)=>Math.floor(t*7)%2?'bf_walkA':'bf_walkB';
  const K=[{t:0,x:'home',y:'home',f:walk},{t:100,f:walk,ease:'lin'},{t:500,x:'home',y:'home',f:'bf_open'}];
  K.push(...seq([['bf_open',300],['bf_scan',300],['bf_trace',300],['bf_found',320],['bf_grip',300],['bf_flipOff',320],['bf_dark',500],['bf_wait',420],['bf_count',480],['bf_flipOn',340],['bf_flash',420],['bf_brace',420],['bf_close',360],['bf_salute',480]],500,'home','home'));
  K.push({t:5800,x:'home',y:'home',f:'idle'},{t:6100,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin finds the panel. Which breaker is it.'); say(m.id,'breaker_flip_which'); }],
    [1400,()=>say(m.id,'breaker_flip_found')],
    [2000,()=>setMessage('He finds it. Hand on the switch.')],
    [2300,()=>say(m.id,'breaker_flip')],
    [2520,()=>{ sfx.thud&&sfx.thud(); setMessage('Breaker off.'); scene('jv_dark',1.5,{a:.74}); }],
    [3300,()=>{ setMessage('Three. Two. One.'); say(m.id,'breaker_flip_count'); }],
    ['hf',4300],
    [4000,()=>sfx.whoosh&&sfx.whoosh()],
    [4150,()=>say(m.id,'breaker_flip_on')],
    [4300,()=>{ sfx.thud&&sfx.thud(); setMessage('Breaker on.'); }],
    [4560,()=>{ sfx.zap&&sfx.zap(); sfx.bonk&&sfx.bonk(); jitter(f); landHit(100); scene('jv_bolt',.6,{x:F.x,y:F.mid}); scene('flash',.35,{a:.6}); scene('jv_zapfx',.6,{x:F.x,y:F.mid}); scene('jv_text',.9,{x:F.x,y:F.top-8,txt:'ZAP',c:'#9fd8ff',sc:3}); }],
    [5150,()=>say(m.id,'breaker_flip_salute')],
    [6100,'end',res(E2)+'Back on. Mostly.']]); };

// ---------- Giant Sneeze ----------
// Quick build, then the sneeze frames are held long (Tom, 13:51); everything around them is fast. Already timed: not scaled below.
J.giant_sneeze=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'gs_walkA'}];
  K.push(...seq([['gs_walkA',170],['gs_twitch',200],['gs_sniff',210],['gs_rub',210],['gs_buildA',210],['gs_buildB',220],['gs_buildC',250],['gs_peak',400],['gs_sneezeA',300],['gs_sneezeB',800],['gs_sneezeC',500],['gs_recoil',230],['gs_stagger',250],['gs_sniffB',200],['gs_wipe',250],['gs_excuse',350]],0,'home','home'));
  K.push({t:4750,x:'home',y:'home',f:'idle'},{t:5050,f:'idle'});
  ST.keys(fx,K);
  const x0=f.px,slideMax=Math.min(90,Math.max(30,x0-F.w*.5-12));
  const back=()=>{ f.px=x0; };
  SC.jv_gale=SC.jv_gale||((s,u)=>{ gfx.globalAlpha=fade(u,.5)*.8; for(let k=0;k<9;k++) { const q=cl(u*1.5-k*.03),x=s.x0-q*(s.x0-s.x1),y=s.y+(k-4)*9+Math.sin(q*8+k)*3; Ln(x,y,x-22-k%3*8,y,3-k%2,k%2?'#ffffff':'#bfe4ff'); } });
  ST.play(E2,[
    [0,()=>setMessage('Justin\'s nose twitches.')],
    [100,()=>say(m.id,'giant_sneeze_twitch')],
    [900,()=>{ setMessage('Ah...'); say(m.id,'giant_sneeze_build'); }],
    [1470,()=>{ setMessage('Ah...'); sfx.whoosh&&sfx.whoosh(); }],
    ['hf',2170],
    [2120,()=>say(m.id,'giant_sneeze')],
    [2170,()=>{ setMessage('AH CHOOOOO!'); sfx.sneeze&&sfx.sneeze(); scene('jv_gale',.8,{x0:me.x-34,x1:F.x+F.w*.4,y:me.base-me.h*.7}); scene('jv_text',1.1,{x:me.x-20,y:me.base-me.h-4,txt:'CHOO!',c:'#bfe4ff',sc:3}); battle.shake=Math.max(battle.shake||0,.5); }],
    [2300,()=>{ jitter(f); landHit(100); ST.draw((s,u)=>{ f.px=x0-ez(u/.7)*slideMax; if(u>=1) back(); },1.1); }],
    [3600,()=>{ back(); setMessage(f.name+' is blown across the room.'); }],
    [4400,()=>say(m.id,'giant_sneeze_excuse')],
    [5050,'end',res(E2)+'Bless him.']]); };

// ---------- Foot Tap ----------
// Rose (Grace if Rose is down) walks over and taps his sneaker toe. The scream is the hit, and its pained faces are held long
// (Tom, 13:51); the rest is fast. Already timed: not scaled below.
J.foot_tap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m);
  const alive=id=>B2.party.find(p=>p.id===id&&p.hp>0&&!p.dead&&!p.calm);
  const tp=alive('rose')||alive('grace')||B2.party.find(p=>p!==m&&p.hp>0&&!p.dead&&!p.calm)||null,tn=tp?tp.name:'Rose';
  if(tp) { const T=ST.unit(tp),spot={x:me.x-58,y:me.base+2},tfx=battle.fx[tp.idx],go=T.x<spot.x?'runR':'run',bk=T.x<spot.x?'run':'runR';
    ST.keys(tfx,[{t:0,x:'home',y:'home',f:'idle'},{t:300,x:'home',y:'home',f:'idle'},{t:900,x:spot.x,y:spot.y,f:go,ease:'lin'},{t:1000,x:spot.x,y:spot.y,f:'flip'},{t:1250,x:spot.x,y:spot.y,f:'kneel'},{t:1500,x:spot.x,y:spot.y,f:'flip'},{t:1900,x:spot.x,y:spot.y,f:'flip'},{t:2500,x:'home',y:'home',f:bk,ease:'lin'},{t:2650,x:'home',y:'home',f:'idle'},{t:5600,f:'idle'}]); }
  const K=[{t:0,x:'home',y:'home',f:'ft_idle'}];
  K.push(...seq([['ft_idle',500],['ft_notice',280],['ft_wave',330],['ft_glance',280],['ft_tapped',170],['ft_freeze',270],['ft_screamA',250],['ft_screamB',700],['ft_screamC',700],['ft_hop',160],['ft_clutch',170],['ft_hopB',160],['ft_screamD',450],['ft_pant',250],['ft_point',280],['ft_fine',380]],0,'home','home'));
  K.push({t:5330,x:'home',y:'home',f:'idle'},{t:5600,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin is just standing there in the nicest sneakers.'); say(m.id,'foot_tap_idle'); }],
    [700,()=>{ setMessage(tn+' comes over, very quietly.'); say(m.id,'foot_tap_wave'); }],
    [1300,()=>{ if(tp) say(tp.id,'foot_tap_tap'); }],
    [1200,()=>setMessage(tn+' taps his toe. Lightly.')],
    [1350,()=>sfx.step&&sfx.step()],
    ['hf',2080],
    [1390,()=>{ sfx.bump&&sfx.bump(); scene('jv_ring',.4,{x:me.x-34,y:me.base-6,r:14,c:'#ffffff'}); }],
    [2000,()=>say(m.id,'foot_tap')],
    [2080,()=>{ sfx.bonk&&sfx.bonk(); sfx.thud&&sfx.thud(); battle.shake=Math.max(battle.shake||0,.7); jitter(f); landHit(100); scene('jv_text',1.5,{x:me.x-12,y:me.base-me.h-6,txt:'MY FOOT!',c:'#ff7a5a',sc:3}); scene('jv_ring',.7,{x:me.x-20,y:me.base-me.h*.5,r:70,c:'#ffd27a'}); scene('jv_ring',.9,{x:me.x-20,y:me.base-me.h*.5,r:120,c:'#ffffff'}); }],
    [2500,()=>ST.jolt(f,.5)],
    [3970,()=>say(m.id,'foot_tap_light')],
    [4950,()=>say(m.id,'foot_tap_fine')],
    [5600,'end',res(E2)+'He is fine. He is fine.']]); };

// ---------- DRYWALL (special): carries a sheet in, screws it up in front of the party, all damage halved ----------
SC.jv_sheet=(s,u)=>{ const x=s.x,base=s.base,h=s.h,w=s.w,q=s.up?1:ez(u/.2),a=fin(u,.06)*(u>.9?(1-u)/.1:1); gfx.globalAlpha=a;
  gfx.save(); gfx.translate(x,base); gfx.rotate(-(1-q)*1.2); R(-w/2,-h,w,h,'#ebe4d6'); R(-w/2,-h,w,4,'#fff9ec'); R(-w/2,-h,3,h,'#cfc6b4'); R(w/2-3,-h,3,h,'#cfc6b4');
  for(let k=1;k<4;k++) R(-w/2+6,-h+k*h/4-1,w-12,2,'#d8d0c0');
  const sc=cl((u-.3)/.5); for(let k=0;k<4;k++) if(sc>k/4) E(-w/2+7+(k%2)*(w-14),-h+10+Math.floor(k/2)*(h-20),2.5,2.5,'#8a8f98');
  gfx.restore(); };
J.drywall=E2=>{ const {m,fx}=E2,me=ST.unit(m);
  const live=B2.party.filter(p=>p.hp>0&&!p.dead),xs=live.map(p=>ST.unit(p).x),xmax=Math.max(...xs,me.x),xmin=Math.min(...xs,me.x),by=Math.max(...live.map(p=>ST.unit(p).base),me.base);
  const sx=xmin-52,sw=Math.max(40,Math.min(58,(xmax-xmin)*.18+30)),sh=Math.min(170,me.h+6),px=sx+sw+12;
  const walk=(u,t)=>Math.floor(t*7)%2?'dw_walkA':'dw_walkB';
  const K=[{t:0,x:'home',y:'home',f:'idle'},{t:300,f:'dw_walkA'},{t:600,x:'home',y:'home',f:'dw_reach'}];
  K.push(...seq([['dw_reach',280],['dw_lift',300]],600,'home','home'));
  K.push({t:1200,x:'home',y:'home',f:walk,ease:'lin'},{t:2000,x:px,y:by+2,f:'dw_carryB'});
  K.push(...seq([['dw_swing',300],['dw_set',340],['dw_lean',300],['dw_driverA',260],['dw_driverB',240],['dw_driverC',240],['dw_driverB',240],['dw_driverC',260],['dw_tap',280],['dw_step',280],['dw_admire',480],['dw_thumbs',520]],2000,px,by+2));
  K.push({t:5800,x:px,y:by+2,f:'runR',ease:'lin'},{t:6400,x:'home',y:'home',f:'idle'},{t:6600,f:'idle'});
  ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Justin has a sheet of drywall under his arm.'); say(m.id,'drywall_sheet'); }],
    [1200,()=>sfx.whoosh&&sfx.whoosh()],
    [2300,()=>{ sfx.thud&&sfx.thud(); scene('jv_sheet',3.9,{x:sx,base:by+2,h:sh,w:sw}); setMessage('He stands it in front of everyone.'); say(m.id,'drywall'); }],
    [3000,()=>{ sfx.drill&&sfx.drill(); say(m.id,'drywall_screws'); }],
    ['hf',3600],
    [4000,()=>{ sfx.drill&&sfx.drill(); }],
    [4200,()=>say(m.id,'drywall_tap')],
    [4600,()=>{ sfx.ding&&sfx.ding(); scene('jv_sparks',.7,{x:sx,y:by-sh*.5,n:9,r:34,c:'#ebe4d6'}); scene('jv_text',1.1,{x:sx+20,y:by-sh-8,txt:'HALF DAMAGE',c:'#ebe4d6',sc:2}); }],
    [5250,()=>say(m.id,'drywall_dry')],
    [6600,'end',res(E2)+'Let it dry.']]); };

// Tom (13:51): his moves should be faster. Every move except the two hand-timed ones above plays at about 1.5x.
(function(){ const S=.66,skip=new Set(['giant_sneeze','foot_tap']);
  for(const key of Object.keys(J)) { if(skip.has(key)) continue; const fn=J[key];
    J[key]=E2=>{ const k0=ST.keys,p0=ST.play;
      ST.keys=(fx,K)=>k0(fx,K.map(o=>Object.assign({},o,{t:o.t*S})));
      ST.play=(e,list)=>p0(e,list.map(it=>it[0]==='hf'?['hf',it[1]*S]:[it[0]*S,...it.slice(1)]));
      try { return fn(E2); } finally { ST.keys=k0; ST.play=p0; } }; } })();
})();
