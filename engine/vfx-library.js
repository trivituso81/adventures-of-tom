'use strict';
// engine/vfx-library.js (vfxlib1, 2026-11-26): the first 8 effects of the Stage 2C shared VFX library (art-factory/aot-stage2c-vfx-library-v11.json),
// in the library's order: clobber_impact, sizzle_wave, drench_splash, razzle_beam_arc, racket_rings, detonation_pops, composure_break, heal_cleanse.
// Each one is drawn in code on a Canvas (no painted frames), takes the params its library entry lists, and has defaults so a move that names no
// params still draws. Signature (g,x,y,u,z,p): g the canvas, x,y the middle of the unit it lands on, u 0..1 through the effect's own length
// (P1_VFX_MS), z the phone scale, p the params or null. engine/pass1-vfx.js draws them from the impact of a pass-1 clip on the foe (the heal on
// the member playing the clip: P1_VFX_SELF). They add themselves to P1_VFX, so a move's libraryAssets in data/guide-manifest.json pick them up.
// The party stands on the right of the screen and the foe on the left, so every swing, spray, bolt and beam comes in from the right.
// Not here yet: sound (sfxHook names only), the set-pieces and projectiles, and drawing in a real fight (only the Battle Lab review draws them).
const VL_TAU=Math.PI*2, VL_INK='#3b2a1a';
const vlRnd=n=>{ const s=Math.sin(n*127.1+311.7)*43758.5453; return s-Math.floor(s); };   // the same n gives the same number, so every frame redraws the same particles
const vlClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const vlEase=u=>1-Math.pow(1-u,3);
const vlBack=u=>{ const c=1.70158; return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2); };   // overshoots, then settles: the pop of a lettered callout
const vlFade=(u,a)=>u<1-a?1:Math.max(0,(1-u)/a);   // opaque, then fades over the last fraction a of the effect
const vlP=(p,d)=>Object.assign({},d,p||{});
const vlLerp=(a,b,t)=>a+(b-a)*t;
function vlStar(g,x,y,R,r,spikes,rot){ g.beginPath(); for(let i=0;i<spikes*2;i++){ const a=rot+i*Math.PI/spikes, q=i%2?r:R; i?g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q); } g.closePath(); }
function vlDrop(g,x,y,r,col){ g.fillStyle=col; g.beginPath(); g.arc(x,y,r,0,VL_TAU); g.fill(); g.fillStyle='#fff'; g.globalAlpha*=.7; g.beginPath(); g.arc(x-r*.3,y-r*.3,r*.3,0,VL_TAU); g.fill(); g.globalAlpha/=.7; }
function vlBolt(g,x0,y0,x1,y1,seed,jag){ const n=9, dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1; g.beginPath(); g.moveTo(x0,y0);
  for(let i=1;i<n;i++){ const t=i/n, o=(vlRnd(seed+i*3.1)-.5)*2*jag; g.lineTo(x0+dx*t-dy/L*o,y0+dy*t+dx/L*o); } g.lineTo(x1,y1); }

// 1. Clobber Kinetic Impact Burst: { hits: 1..7, intervalMs: 110, scale: 0.8..1.8, pierceShield: bool, color }
const VL_CLOBBER_HIT_MS=450;
function vlClobber(g,x,y,u,z,p){ p=vlP(p,{hits:1,intervalMs:110,scale:1,pierceShield:false,color:'#d97706'});
  const n=vlClamp(Math.round(p.hits)||1,1,7), total=VL_CLOBBER_HIT_MS+(n-1)*p.intervalMs, t=u*total, s=vlClamp(p.scale,.8,1.8)*z;
  for(let k=0;k<n;k++){ const lu=(t-k*p.intervalMs)/VL_CLOBBER_HIT_MS; if(lu<0||lu>1) continue;
    const cx=x+(n>1?(vlRnd(k+1)-.5)*30*s:0), cy=y+(n>1?(vlRnd(k+9)-.5)*26*s:0), R=(12+vlEase(lu)*30)*s;
    g.save(); g.globalAlpha=1-lu*lu;
    g.strokeStyle='#fff3c4'; g.lineWidth=3*s; for(let j=0;j<3;j++){ g.beginPath(); g.arc(cx,cy,R*(1.05+j*.22),-Math.PI*(.3+j*.07),Math.PI*(.18-j*.07)); g.stroke(); }   // smear arcs trailing the swing, on the side it came from
    g.fillStyle=p.color; g.strokeStyle=VL_INK; g.lineWidth=2*s; vlStar(g,cx,cy,R,R*.46,8,k*.4); g.fill(); g.stroke();
    g.fillStyle='#fff7d6'; vlStar(g,cx,cy,R*.5,R*.22,8,k*.4); g.fill();
    g.globalAlpha=(1-lu)*.55; g.fillStyle='#d8c9a8'; for(let j=0;j<3;j++){ g.beginPath(); g.arc(cx+(j-1)*18*s*(.4+lu),cy+16*s+lu*8*s,(5+lu*11)*s,0,VL_TAU); g.fill(); }   // dust puff at the feet
    g.restore(); }
  if(p.pierceShield&&u<.7){ const a=1-u/.7; g.save(); g.globalAlpha=a; g.strokeStyle='#fff'; g.lineWidth=3*z; g.shadowColor=VL_INK; g.shadowBlur=3*z;   // the crack that goes through a shield
    for(let k=0;k<3;k++){ vlBolt(g,x,y,x+Math.cos(k*2.1+.5)*46*z,y+Math.sin(k*2.1+.5)*46*z,k*7,7*z); g.stroke(); } g.restore(); } }

// 2. Sizzle Heat Wave & Burn Embers: { scope: 'single'|'aoe'|'dual', applyToasty, fiveAlarm, triggerTicks: 0..2 }
function vlSizzle(g,x,y,u,z,p){ p=vlP(p,{scope:'single',applyToasty:false,fiveAlarm:false,triggerTicks:0});
  const wide=p.scope==='aoe'?1.7:p.scope==='dual'?1.3:1, W=70*z*wide, a=vlFade(u,.35); g.save();
  const bx=x+W-u*2*W, gr=g.createLinearGradient(bx-48*z,0,bx+48*z,0); gr.addColorStop(0,'rgba(239,68,68,0)'); gr.addColorStop(.5,'rgba(249,115,22,.5)'); gr.addColorStop(1,'rgba(239,68,68,0)');
  g.globalAlpha=a; g.fillStyle=gr; g.beginPath(); g.ellipse(bx,y,48*z,64*z,0,0,VL_TAU); g.fill();   // the sweeping heat band
  g.strokeStyle='#fde68a'; g.lineWidth=2*z; for(let i=0;i<4;i++){ g.beginPath(); for(let j=0;j<=10;j++){ const yy=y-56*z+j*11.2*z, xx=bx+(i-1.5)*14*z+Math.sin(j*.9+u*14+i)*5*z; j?g.lineTo(xx,yy):g.moveTo(xx,yy); } g.stroke(); }   // wobbling distortion lines
  const cols=['#f97316','#fbbf24','#ef4444'], n=Math.round(12*wide);
  for(let i=0;i<n;i++){ const t=vlClamp(u*1.15-vlRnd(i)*.2,0,1); if(t<=0) continue; g.globalAlpha=a*(1-t*.6); g.fillStyle=cols[i%3];
    g.beginPath(); g.arc(x+(vlRnd(i+20)-.5)*W*1.5+Math.sin(t*6+i)*6*z,y+34*z-t*(36+vlRnd(i+40)*58)*z,(2.4+vlRnd(i+60)*2.4)*z*(1-t*.5),0,VL_TAU); g.fill(); }   // rising embers
  if(p.applyToasty){ g.globalAlpha=a; for(let i=0;i<8;i++){ const an=u*5+i*VL_TAU/8; g.fillStyle=i%2?'#fbbf24':'#f97316'; g.beginPath(); g.arc(x+Math.cos(an)*28*z,y-46*z+Math.sin(an)*9*z,3*z,0,VL_TAU); g.fill(); } }   // Toasty ember ring over the head
  if(p.fiveAlarm){ g.globalAlpha=a; for(let i=0;i<5;i++){ const fx=x+(i-2)*15*z, fh=(22+vlRnd(i+80)*16)*z*(.6+.4*Math.sin(u*18+i*2)), fy=y+40*z;   // Five-Alarm flame tongues
      g.fillStyle=i%2?'#f97316':'#ef4444'; g.beginPath(); g.moveTo(fx-7*z,fy); g.quadraticCurveTo(fx-8*z,fy-fh*.6,fx,fy-fh); g.quadraticCurveTo(fx+8*z,fy-fh*.6,fx+7*z,fy); g.closePath(); g.fill(); } }
  for(let k=0;k<Math.min(2,p.triggerTicks|0);k++){ const lu=(u-(.42+k*.2))/.18; if(lu<0||lu>1) continue; g.globalAlpha=1-lu; g.strokeStyle='#fff3c4'; g.lineWidth=3*z;   // burn-tick pop bursts
    for(let i=0;i<8;i++){ const an=i*VL_TAU/8, r0=(6+lu*8)*z, r1=(14+lu*24)*z; g.beginPath(); g.moveTo(x+Math.cos(an)*r0,y-20*z+Math.sin(an)*r0); g.lineTo(x+Math.cos(an)*r1,y-20*z+Math.sin(an)*r1); g.stroke(); } }
  g.restore(); }

// 3. Drench Splash, Mist & Droplet Spray: { mode: 'spray'|'row_wave'|'aoe_cloud'|'shake_360', tintHex, applyDrenched }
function vlDrench(g,x,y,u,z,p){ p=vlP(p,{mode:'spray',tintHex:'#0284c7',applyDrenched:true}); const col=p.tintHex, a=vlFade(u,.3); g.save();
  if(p.mode==='row_wave'){ const front=x+110*z-u*230*z; g.globalAlpha=a*.8; g.fillStyle=col; g.beginPath(); g.moveTo(x+110*z,y+44*z);
    for(let xx=x+110*z;xx>=front;xx-=6*z){ const k=(xx-front)/(90*z); g.lineTo(xx,y+14*z-Math.exp(-k*2.2)*40*z+Math.sin(xx*.12/z+u*10)*3*z); }   // a wave with a crest at its front, coming in from the party side
    g.lineTo(front,y+44*z); g.closePath(); g.fill(); g.globalAlpha=a; g.fillStyle='#fff'; for(let i=0;i<6;i++) { g.beginPath(); g.arc(front+i*7*z,y-22*z+i*5*z+Math.sin(i+u*9)*3*z,(3-i*.3)*z,0,VL_TAU); g.fill(); } }   // foam on the crest
  else if(p.mode==='aoe_cloud'){ for(let i=0;i<7;i++){ const ox=(vlRnd(i)-.5)*100*z, oy=(vlRnd(i+9)-.5)*60*z, r=(14+vlEase(u)*(26+vlRnd(i+18)*14))*z; g.globalAlpha=a*.38; g.fillStyle=col; g.beginPath(); g.arc(x+ox,y+oy,r,0,VL_TAU); g.fill(); g.globalAlpha=a*.5; g.fillStyle='#fff'; g.beginPath(); g.arc(x+ox-r*.25,y+oy-r*.25,r*.45,0,VL_TAU); g.fill(); } }
  else if(p.mode==='shake_360'){ for(let i=0;i<24;i++){ const an=i*VL_TAU/24+vlRnd(i)*.2, sp=(46+vlRnd(i+30)*40)*z, t=vlEase(vlClamp(u*1.2,0,1)); g.globalAlpha=a; vlDrop(g,x+Math.cos(an)*sp*t,y+Math.sin(an)*sp*t*.8+u*u*30*z,(2+vlRnd(i+50)*2.4)*z,col); } }
  else { for(let i=0;i<16;i++){ const t=vlClamp(u*1.4-vlRnd(i)*.5,0,1); if(t<=0) continue; const x0=x+92*z, y0=y-24*z, x1=x+(vlRnd(i+20)-.5)*34*z, y1=y+(vlRnd(i+40)-.5)*44*z;   // spray: droplets in an arc from the left
      g.globalAlpha=t>.92?(1-t)*12*a:a; vlDrop(g,vlLerp(x0,x1,t),vlLerp(y0,y1,t)-Math.sin(t*Math.PI)*(24+vlRnd(i+60)*26)*z,(2.4+vlRnd(i+80)*2)*z,col); } }
  if(p.applyDrenched&&u>.55){ const k=vlClamp((u-.55)/.2,0,1), hy=y-58*z; g.globalAlpha=a*k; g.fillStyle=col; g.strokeStyle='#fff'; g.lineWidth=1.5*z;   // the Drenched drip over the head
    g.beginPath(); g.moveTo(x,hy-9*z); g.quadraticCurveTo(x+9*z,hy+2*z,x,hy+8*z); g.quadraticCurveTo(x-9*z,hy+2*z,x,hy-9*z); g.fill(); g.stroke(); }
  g.restore(); }

// 4. Razzle Voltage Arc, Beam & Glitter: { style: 'beam'|'chain_arc'|'glitter_flick'|'blackout_flash', chainTargets: [{dx,dy}], splashPct: 0.25..0.75 }
function vlRazzle(g,x,y,u,z,p){ p=vlP(p,{style:'chain_arc',chainTargets:[],splashPct:.5}); const col='#9333ea', a=vlFade(u,.4), ox=x+104*z, oy=y-34*z; g.save();
  if(p.style==='beam'){ const gr=g.createLinearGradient(ox,oy,x,y); gr.addColorStop(0,'rgba(255,255,255,.85)'); gr.addColorStop(1,'rgba(147,51,234,.12)');
    g.globalAlpha=a*Math.min(1,u*8); g.fillStyle=gr; g.beginPath(); g.moveTo(ox,oy); g.lineTo(x-24*z,y-28*z); g.lineTo(x-24*z,y+34*z); g.closePath(); g.fill();   // the spotlight cone
    g.globalAlpha=a*.5; g.fillStyle='#fff'; g.beginPath(); g.ellipse(x,y+4*z,16*z,24*z,0,0,VL_TAU); g.fill(); }
  else if(p.style==='glitter_flick'){ for(let i=0;i<14;i++){ const t=vlClamp(u*1.4-vlRnd(i)*.4,0,1), s=Math.sin(t*Math.PI); if(s<=0) continue; g.globalAlpha=s*.95; g.fillStyle=['#f0abfc','#fff','#c084fc'][i%3]; vlStar(g,x+(vlRnd(i+20)-.5)*100*z,y+(vlRnd(i+40)-.5)*90*z,(5+vlRnd(i+60)*6)*z*s,1.2*z,4,0); g.fill(); } }
  else if(p.style==='blackout_flash'){ { const vg=g.createRadialGradient(x,y,20*z,x,y,210*z); vg.addColorStop(0,'rgba(0,0,0,.5)'); vg.addColorStop(1,'rgba(0,0,0,0)'); g.globalAlpha=a; g.fillStyle=vg; g.beginPath(); g.arc(x,y,210*z,0,VL_TAU); g.fill(); }   // the lights go out around the target
     const r=vlEase(vlClamp(u*1.6,0,1))*110*z; g.globalAlpha=(1-vlClamp(u*1.6,0,1))*.95;
    const gr=g.createRadialGradient(x,y,0,x,y,Math.max(1,r)); gr.addColorStop(0,'#fff'); gr.addColorStop(.6,'rgba(255,255,255,.6)'); gr.addColorStop(1,'rgba(147,51,234,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,Math.max(1,r),0,VL_TAU); g.fill(); }
  else { const seed=Math.floor(u*14)*5; g.globalAlpha=a;   // chain_arc: the bolt jumps shape every frame or so
    g.strokeStyle=col; g.lineWidth=7*z; g.lineJoin='round'; vlBolt(g,ox,oy,x,y,seed,9*z); g.stroke(); g.strokeStyle='#fff'; g.lineWidth=2.2*z; vlBolt(g,ox,oy,x,y,seed,9*z); g.stroke();
    (p.chainTargets||[]).slice(0,4).forEach((c,i)=>{ g.globalAlpha=a*vlClamp(p.splashPct,.25,.75); g.strokeStyle=col; g.lineWidth=4*z; vlBolt(g,x,y,x+(c.dx||0)*z,y+(c.dy||0)*z,seed+i*11,6*z); g.stroke(); g.strokeStyle='#fff'; g.lineWidth=1.4*z; vlBolt(g,x,y,x+(c.dx||0)*z,y+(c.dy||0)*z,seed+i*11,6*z); g.stroke(); }); }   // the splash to the next targets
  if(u>.5){ const k=vlClamp((u-.5)/.2,0,1); g.globalAlpha=a*k; g.fillStyle='#f0abfc'; g.strokeStyle=VL_INK; g.lineWidth=1.2*z; vlStar(g,x,y-56*z,8*z,2*z,4,u*3); g.fill(); g.stroke(); }   // the Dazzled sparkle over the head
  g.restore(); }

// 5. Racket Sonic Rings & Callout Waves: { shape: 'rings'|'jagged_screech'|'cone_blast'|'story_loops', count: 3..5, targetScope: 'single'|'aoe' }
function vlRacket(g,x,y,u,z,p){ p=vlP(p,{shape:'rings',count:3,targetScope:'single'}); const n=vlClamp(Math.round(p.count)||3,3,5), S=p.targetScope==='aoe'?1.7:1; g.save(); g.strokeStyle='#db2777'; g.lineJoin='round';
  for(let i=0;i<n;i++){ const ru=vlClamp(u*1.3-i*.14,0,1); if(ru<=0||ru>=1) continue; g.globalAlpha=(1-ru)*.95; g.lineWidth=(4.5-ru*3)*z; const r=(12+vlEase(ru)*66)*z*S;
    if(p.shape==='jagged_screech'){ g.beginPath(); for(let k=0;k<=28;k++){ const an=k*VL_TAU/28, q=r*(k%2?1.16:.94); const px=x+Math.cos(an)*q, py=y+Math.sin(an)*q*.62; k?g.lineTo(px,py):g.moveTo(px,py); } g.stroke(); }
    else if(p.shape==='cone_blast'){ const o=x+100*z, rr=(26+vlEase(ru)*140)*z; g.beginPath(); g.arc(o,y-6*z,rr,Math.PI-.55,Math.PI+.55); g.stroke(); if(i===0){ g.globalAlpha=(1-ru)*.14; g.fillStyle='#db2777'; g.beginPath(); g.moveTo(o,y-6*z); g.arc(o,y-6*z,rr,Math.PI-.55,Math.PI+.55); g.closePath(); g.fill(); } }
    else if(p.shape==='story_loops'){ const cx=x+(i-(n-1)/2)*24*z, rr=(10+vlEase(ru)*30)*z; g.beginPath(); g.ellipse(cx,y-8*z-ru*18*z,rr,rr*.6,i*.5,0,VL_TAU); g.stroke(); g.fillStyle='#db2777'; g.beginPath(); g.arc(cx,y-8*z-ru*18*z,2.4*z*(1-ru),0,VL_TAU); g.fill(); }
    else { g.beginPath(); g.ellipse(x,y,r,r*.62,0,0,VL_TAU); g.stroke(); } }
  g.restore(); }

// 6. All 6 v11 Prime -> Detonation Bursts: { recipe: 'steam'|'panic_boil'|'hydro_slip'|'short_circuit'|'shatter_glitz'|'sensory_overload' }
const VL_DET={steam:{t:'Steam Cloud!',c:'#e2e8f0',d:'#475569'},panic_boil:{t:'Panic Boil!',c:'#fb923c',d:'#7c2d12'},hydro_slip:{t:'Hydro-Slip!',c:'#38bdf8',d:'#0c4a6e'},
  short_circuit:{t:'Short Circuit!',c:'#facc15',d:'#713f12'},shatter_glitz:{t:'Shatter Glitz!',c:'#f0abfc',d:'#701a75'},sensory_overload:{t:'Sensory Overload!',c:'#fb7185',d:'#881337'}};
function vlDetonation(g,x,y,u,z,p){ p=vlP(p,{recipe:'steam'}); const R=VL_DET[p.recipe]||VL_DET.steam, ru=vlClamp(u*2.2,0,1); g.save();
  g.globalAlpha=1-ru; g.strokeStyle=R.c; g.lineWidth=(8-6*ru)*z; g.beginPath(); g.arc(x,y,(14+vlEase(ru)*72)*z,0,VL_TAU); g.stroke();   // the elemental ring
  g.globalAlpha=(1-ru)*.9; g.fillStyle=R.c; g.strokeStyle=R.c;
  for(let i=0;i<8;i++){ const an=i*VL_TAU/8+vlRnd(i)*.3, d=(18+vlEase(ru)*52)*z, px=x+Math.cos(an)*d, py=y+Math.sin(an)*d*.8;   // what flies out depends on the recipe
    if(p.recipe==='steam'){ g.beginPath(); g.arc(px,py,(7+ru*8)*z,0,VL_TAU); g.fill(); }
    else if(p.recipe==='panic_boil'){ g.beginPath(); g.arc(px,py-ru*14*z,(3+vlRnd(i+5)*4)*z,0,VL_TAU); g.stroke(); }
    else if(p.recipe==='hydro_slip'){ vlDrop(g,px,py+ru*10*z,3.2*z,R.c); }
    else if(p.recipe==='short_circuit'){ g.lineWidth=2.4*z; vlBolt(g,x,y,px,py,i*5+Math.floor(u*12),5*z); g.stroke(); }
    else if(p.recipe==='shatter_glitz'){ vlStar(g,px,py,(6+vlRnd(i+9)*4)*z,1.4*z,4,ru*3); g.fill(); }
    else { g.lineWidth=3*z; g.beginPath(); g.moveTo(x+Math.cos(an)*(20+ru*8)*z,y+Math.sin(an)*(20+ru*8)*z); g.lineTo(px,py); g.stroke(); } }
  if(p.recipe==='sensory_overload'){ g.lineWidth=2*z; for(let k=1;k<=2;k++){ g.beginPath(); g.arc(x,y,(10+ru*34*k)*z+Math.sin(u*40+k)*2*z,0,VL_TAU); g.stroke(); } }
  const s=u<.22?vlBack(u/.22):1, a=vlFade(u,.25); g.globalAlpha=a; g.translate(x,y-62*z); g.rotate(-.12); g.scale(s,s);   // the lettered callout pops in with a little overshoot
  g.font='italic 900 '+Math.round(17*z)+'px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
  g.lineWidth=6*z; g.strokeStyle=R.d; g.strokeText(R.t,0,0); g.fillStyle=R.c; g.fillText(R.t,0,0); g.restore(); }

// 7. Composure Pip Shatter & Flustered Banner: { pipsShaved: 1..4, triggeredBreak: bool }
function vlComposure(g,x,y,u,z,p){ p=vlP(p,{pipsShaved:1,triggeredBreak:false}); const N=4, shaved=p.triggeredBreak?N:vlClamp(Math.round(p.pipsShaved)||1,1,N), py=y-50*z, a=vlFade(u,.25); g.save();
  for(let i=0;i<N;i++){ const px=x+(i-(N-1)/2)*20*z, order=N-1-i, broken=order<shaved, bt=.14+(broken?order:0)*.08, lu=(u-bt)/.45;   // the pips shatter from the right, one after another
    if(!broken||lu<0){ g.globalAlpha=a; const sh=broken&&u>bt-.1?Math.sin(u*90)*1.6*z:0; g.fillStyle='#f8fafc'; g.strokeStyle=VL_INK; g.lineWidth=2*z; g.beginPath(); g.arc(px+sh,py,7.4*z,0,VL_TAU); g.fill(); g.stroke();
      g.fillStyle='rgba(220,38,38,.35)'; g.beginPath(); g.arc(px+sh-1.6*z,py-1.6*z,2.6*z,0,VL_TAU); g.fill(); if(broken&&u>bt-.1){ g.strokeStyle='#dc2626'; g.lineWidth=1.4*z; g.beginPath(); g.moveTo(px-4*z,py-5*z); g.lineTo(px,py); g.lineTo(px+3*z,py+5*z); g.stroke(); } continue; }
    if(lu>1) continue; for(let k=0;k<3;k++){ const an=k*VL_TAU/3+vlRnd(i*4+k)*1.4, d=vlEase(lu)*(20+vlRnd(i+k+30)*14)*z, sx=px+Math.cos(an)*d, sy=py+Math.sin(an)*d*.7+lu*lu*34*z;   // three porcelain shards fly and fall
      g.globalAlpha=(1-lu)*a; g.fillStyle='#f1f5f9'; g.strokeStyle=VL_INK; g.lineWidth=1.4*z; g.save(); g.translate(sx,sy); g.rotate(lu*7+k); g.beginPath(); g.moveTo(-4*z,3*z); g.lineTo(0,-5*z); g.lineTo(4.4*z,3*z); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
  if(p.triggeredBreak){ const ru=vlClamp((u-.3)*2.4,0,1);
    if(ru>0&&ru<1){ g.globalAlpha=1-ru; g.strokeStyle='#dc2626'; g.lineWidth=(6-4.5*ru)*z; g.beginPath(); for(let k=0;k<=20;k++){ const an=k*VL_TAU/20, q=(10+vlEase(ru)*78)*z*(k%2?1.14:.92); const sx=x+Math.cos(an)*q, sy=y+Math.sin(an)*q*.8; k?g.lineTo(sx,sy):g.moveTo(sx,sy); } g.closePath(); g.stroke(); }   // the full shatter ring
    if(u>.38){ const k=vlBack(vlClamp((u-.38)/.2,0,1)); g.globalAlpha=a; g.save(); g.translate(x,py-24*z); g.scale(k,k); g.fillStyle='#fef2f2'; g.strokeStyle='#dc2626'; g.lineWidth=2.4*z;   // the Flustered banner
      g.beginPath(); g.rect(-44*z,-10*z,88*z,20*z); g.fill(); g.stroke(); g.fillStyle='#991b1b'; g.font='italic 900 '+Math.round(12*z)+'px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Flustered!',0,1*z); g.restore();
      for(let s=0;s<3;s++){ const an=u*11+s*VL_TAU/3; g.globalAlpha=a; g.fillStyle='#fde047'; g.strokeStyle=VL_INK; g.lineWidth=1.2*z; vlStar(g,x+Math.cos(an)*26*z,y-34*z+Math.sin(an)*8*z,5*z,2.2*z,5,an); g.fill(); g.stroke(); } } }   // dizzy stars
  g.restore(); }

// 8. Emerald Heal, Regen, Cleanse & Revive: { healPct: 5..100, cleanse, isRevive, overhealShield }. Draws on the member (P1_VFX_SELF); p._h is the member's height.
function vlHeal(g,x,y,u,z,p){ p=vlP(p,{healPct:25,cleanse:false,isRevive:false,overhealShield:false}); const H=p._h||90*z, base=y+H*.5, a=vlFade(u,.3), n=Math.round(6+vlClamp(p.healPct,5,100)/100*18); g.save();
  if(p.isRevive){ const k=vlEase(vlClamp(u*2.5,0,1)), ph=H*2.2*k, gr=g.createLinearGradient(0,base,0,base-ph); gr.addColorStop(0,'rgba(16,185,129,.75)'); gr.addColorStop(1,'rgba(251,191,36,0)');   // the vertical revive pillar
    g.globalAlpha=a*.8; g.fillStyle=gr; g.fillRect(x-17*z,base-ph,34*z,ph); g.globalAlpha=a*.9; g.fillStyle='rgba(255,255,255,.75)'; g.fillRect(x-5*z,base-ph*.9,10*z,ph*.9); }
  if(p.overhealShield&&u>.3){ const k=vlClamp((u-.3)/.25,0,1); g.globalAlpha=a*k*(.75+.25*Math.sin(u*20)); g.fillStyle='rgba(52,211,153,.2)'; g.strokeStyle='#34d399'; g.lineWidth=3*z; g.beginPath(); g.ellipse(x,y,H*.36,H*.62,0,0,VL_TAU); g.fill(); g.stroke(); }   // overheal turns into a Clean Bill shield glow
  for(let k=0;k<2;k++){ const ru=vlClamp(u*1.4-k*.2,0,1); if(ru<=0||ru>=1) continue; g.globalAlpha=(1-ru)*a; g.strokeStyle=k?'#fbbf24':'#10b981'; g.lineWidth=3*z; g.beginPath(); g.ellipse(x,base-ru*H,(20+ru*8)*z,(7+ru*2)*z,0,0,VL_TAU); g.stroke(); }   // two rings climb the body
  for(let i=0;i<n;i++){ const t=vlClamp(u*1.25-vlRnd(i)*.3,0,1); if(t<=0||t>=1) continue; const px=x+(vlRnd(i+20)-.5)*52*z+Math.sin(t*7+i)*7*z, py=base-t*H*1.1; g.globalAlpha=a*(1-t*.5);
    if(i%3===0){ g.fillStyle='#fde68a'; vlStar(g,px,py,4.4*z,1.2*z,4,t*4); g.fill(); } else { g.fillStyle=i%2?'#34d399':'#a3e635'; g.save(); g.translate(px,py); g.rotate(t*5+i); g.beginPath(); g.ellipse(0,0,4.6*z,2.2*z,0,0,VL_TAU); g.fill(); g.restore(); } }   // rising leaves and sparkles
  if(p.cleanse){ for(let i=0;i<8;i++){ const t=vlClamp(u*1.3-vlRnd(i+90)*.35,0,1); if(t<=0||t>=1) continue; g.globalAlpha=a*(1-t*.3); g.fillStyle=t<.45?'#64748b':'#fef08a';   // debuff specks dissolve into sparks
      g.fillRect(x+(vlRnd(i+100)-.5)*38*z-2*z,y+H*.1-t*H*.9-2*z,4*z*(1-t*.4),4*z*(1-t*.4)); } }
  g.restore(); }

Object.assign(P1_VFX,{vfx_core_clobber_impact:vlClobber,vfx_core_sizzle_wave:vlSizzle,vfx_core_drench_splash:vlDrench,vfx_core_razzle_beam_arc:vlRazzle,
  vfx_core_racket_rings:vlRacket,vfx_core_detonation_pops:vlDetonation,vfx_core_composure_break:vlComposure,vfx_core_heal_cleanse:vlHeal});
Object.assign(P1_VFX_MS,{vfx_core_clobber_impact:p=>VL_CLOBBER_HIT_MS+(vlClamp(Math.round((p&&p.hits)||1),1,7)-1)*((p&&p.intervalMs)||110),vfx_core_sizzle_wave:900,vfx_core_drench_splash:850,
  vfx_core_razzle_beam_arc:700,vfx_core_racket_rings:800,vfx_core_detonation_pops:1100,vfx_core_composure_break:p=>p&&p.triggeredBreak?1300:900,vfx_core_heal_cleanse:1100});
P1_VFX_SELF.vfx_core_heal_cleanse=true;
