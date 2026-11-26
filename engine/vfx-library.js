'use strict';
// engine/vfx-library.js (vfxlib1, 2026-11-26): the first 8 effects of the Stage 2C shared VFX library (art-factory/aot-stage2c-vfx-library-v11.json),
// in the library's order: clobber_impact, sizzle_wave, drench_splash, razzle_beam_arc, racket_rings, detonation_pops, composure_break, heal_cleanse.
// Each one is drawn in code on a Canvas (no painted frames), takes the params its library entry lists, and has defaults so a move that names no
// params still draws. Signature (g,x,y,u,z,p): g the canvas, x,y the middle of the unit it lands on, u 0..1 through the effect's own length
// (P1_VFX_MS), z the phone scale, p the params or null. engine/pass1-vfx.js draws them from the impact of a pass-1 clip on the foe (the heal on
// the member playing the clip: P1_VFX_SELF). They add themselves to P1_VFX, so a move's libraryAssets in data/guide-manifest.json pick them up.
// The party stands on the right of the screen and the foe on the left, so every swing, spray, bolt and beam comes in from the right.
// Effects 9 to 15 (shield, chevrons, badges, the four projectiles) are further down (vfxlib2). Not here yet: sound (sfxHook names only), the set-pieces, and drawing in a real fight (only the Battle Lab review draws them).
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

// ---- vfxlib2 (2026-11-26): library effects 9 to 15, in the library's order: shield_ward, timeline_chevrons, status_debuff_badges, then the four projectiles. ----
// p._h is the height of the unit the effect draws on (the member for the shield, the foe for the rest) and p._from is where the member playing the clip
// stands ({x,y}, fight coordinates); engine/pass1-vfx.js fills both. Projectiles fly from the member to the foe, so from the right to the left, and arrive
// at the clip's contact moment: P1_VFX_LEAD says how long before the contact each one starts (the other effects start at the contact).
const vlH=(p,z)=>p&&p._h>0?p._h:90*z;
const vlFrom=(p,x,y,z)=>p&&p._from&&isFinite(p._from.x)&&isFinite(p._from.y)?p._from:{x:x+240*z,y:y-8*z};   // no caster known: start off to the right of the target
// A small painted-in-code prop for a projectile (spriteId picks it; an id it does not know is a round ball). Drawn at x,y, about r wide, turned by rot.
function vlProp(g,id,x,y,r,rot,col){ id=String(id||'').toLowerCase(); g.save(); g.translate(x,y); g.rotate(rot||0); g.lineWidth=Math.max(1,r*.16); g.strokeStyle=VL_INK; g.lineJoin='round';
  const el=(rx,ry,f,dx,dy)=>{ g.fillStyle=f; g.beginPath(); g.ellipse(dx||0,dy||0,rx,ry,0,0,VL_TAU); g.fill(); g.stroke(); }, rc=(w,h,f,dx,dy)=>{ g.fillStyle=f; g.beginPath(); g.rect((dx||0)-w/2,(dy||0)-h/2,w,h); g.fill(); g.stroke(); };
  if(/clay/.test(id)){ el(r*.9,r*.62,'#8b8478'); g.fillStyle='rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r*.25,-r*.2,r*.32,r*.16,0,0,VL_TAU); g.fill(); }
  else if(/chili|seed/.test(id)){ for(let k=0;k<3;k++) el(r*.3,r*.16,k%2?'#ef4444':'#f97316',(k-1)*r*.55,((k*37)%5-2)*r*.14); }
  else if(/jar|mason/.test(id)){ rc(r*1.1,r*1.4,'#bfe3ee'); rc(r*1.2,r*.3,'#9ca3af',0,-r*.78); g.fillStyle='rgba(255,255,255,.6)'; g.fillRect(-r*.34,-r*.5,r*.16,r*.8); }
  else if(/flag|penalty/.test(id)){ rc(r*.14,r*1.7,'#78716c'); g.fillStyle='#facc15'; g.beginPath(); g.moveTo(r*.07,-r*.8); g.lineTo(r*1.1,-r*.55); g.lineTo(r*.07,-r*.2); g.closePath(); g.fill(); g.stroke(); }
  else if(/popcorn/.test(id)){ for(let k=0;k<4;k++) el(r*.36,r*.34,k%2?'#fff7d6':'#fde68a',((k%2)-.5)*r*.8,(k>1?.35:-.3)*r); }
  else if(/tool/.test(id)){ rc(r*1.6,r*.9,'#dc2626',0,r*.12); g.lineWidth=r*.16; g.beginPath(); g.moveTo(-r*.5,-r*.32); g.lineTo(-r*.5,-r*.62); g.lineTo(r*.5,-r*.62); g.lineTo(r*.5,-r*.32); g.stroke(); }
  else if(/dumpling|soup/.test(id)){ el(r*.8,r*.6,'#fafafa'); g.lineWidth=r*.1; for(let k=-1;k<=1;k++){ g.beginPath(); g.moveTo(k*r*.26,-r*.5); g.lineTo(k*r*.12,-r*.12); g.stroke(); } }
  else if(/controller|strap/.test(id)){ rc(r*1.5,r*.8,'#334155'); g.fillStyle='#e2e8f0'; g.beginPath(); g.arc(-r*.4,0,r*.12,0,VL_TAU); g.arc(r*.4,0,r*.12,0,VL_TAU); g.fill(); }
  else if(/lamb/.test(id)){ el(r*.7,r*.6,'#f5efe2'); el(r*.2,r*.3,'#e7d9c3',-r*.5,-r*.5); el(r*.2,r*.3,'#e7d9c3',r*.5,-r*.5); g.fillStyle=VL_INK; g.beginPath(); g.arc(-r*.2,0,r*.07,0,VL_TAU); g.arc(r*.2,0,r*.07,0,VL_TAU); g.fill(); }
  else if(/lure|fish/.test(id)){ el(r*.8,r*.3,'#cbd5e1'); g.fillStyle='#ef4444'; g.beginPath(); g.arc(r*.5,0,r*.16,0,VL_TAU); g.fill(); g.beginPath(); g.arc(-r*.9,r*.15,r*.28,-.3,Math.PI*.9); g.stroke(); }
  else if(/doh|ball/.test(id)){ el(r*.7,r*.7,'#84cc16'); g.fillStyle='#d9f99d'; g.beginPath(); g.arc(-r*.2,-r*.2,r*.2,0,VL_TAU); g.fill(); }
  else if(/cinnamon|roll/.test(id)){ el(r*.8,r*.8,'#d6a063'); g.strokeStyle='#92400e'; g.lineWidth=r*.12; g.beginPath(); g.arc(0,0,r*.4,0,Math.PI*1.7); g.arc(0,0,r*.2,0,Math.PI*1.5); g.stroke(); g.fillStyle='rgba(255,255,255,.7)'; g.beginPath(); g.arc(r*.1,-r*.3,r*.2,0,VL_TAU); g.fill(); }
  else if(/muffin/.test(id)){ g.fillStyle='#e5e7eb'; g.beginPath(); g.moveTo(-r*.5,r*.1); g.lineTo(r*.5,r*.1); g.lineTo(r*.38,r*.7); g.lineTo(-r*.38,r*.7); g.closePath(); g.fill(); g.stroke(); el(r*.62,r*.46,'#b4763a',0,-r*.12); }
  else if(/snack|diaper|pack|bag/.test(id)){ rc(r*1.1,r*1.2,'#fbbf24'); g.fillStyle='#fff'; g.fillRect(-r*.3,-r*.2,r*.6,r*.4); }
  else if(/bike|chirp/.test(id)){ g.fillStyle='rgba(0,0,0,0)'; g.beginPath(); g.arc(-r*.5,r*.2,r*.4,0,VL_TAU); g.arc(r*.5,r*.2,r*.4,0,VL_TAU); g.stroke(); g.beginPath(); g.moveTo(-r*.5,r*.2); g.lineTo(0,-r*.4); g.lineTo(r*.5,r*.2); g.stroke(); }
  else el(r*.7,r*.7,col||'#b45309');
  g.restore(); }

// 9. Ally Shield, Carapace, Drywall & Ward Shell: { targetIds, skin: 'clay'|'glaze'|'drywall'|'jacket'|'crust'|'seatbelt'|'velvet'|'plush', shieldPct }
// Draws on the member playing the clip (P1_VFX_SELF); targetIds are not read, the shell goes on that member. p._h is the member's height.
const VL_SHIELD={clay:['#c2764a','#7c3f1d'],glaze:['#2dd4bf','#0f766e'],drywall:['#f1f5f9','#94a3b8'],jacket:['#fb923c','#9a3412'],crust:['#f6c453','#92400e'],seatbelt:['#64748b','#1e293b'],velvet:['#be123c','#fbbf24'],plush:['#f9a8d4','#be185d']};
function vlShield(g,x,y,u,z,p){ p=vlP(p,{targetIds:[],skin:'glaze',shieldPct:30}); const S=VL_SHIELD[p.skin]||VL_SHIELD.glaze, H=vlH(p,z), a=vlFade(u,.3), k=vlBack(vlClamp(u/.28,0,1));
  const rx=Math.max(1,H*.38*k), ry=Math.max(1,H*.62*k), th=(2+vlClamp(p.shieldPct,5,100)/100*5)*z, sk=VL_SHIELD[p.skin]?p.skin:'glaze'; g.save();
  g.globalAlpha=a*.28; g.fillStyle=S[0]; g.beginPath(); g.ellipse(x,y,rx,ry,0,0,VL_TAU); g.fill();   // the shell
  g.globalAlpha=a; g.strokeStyle=S[0]; g.lineWidth=th; g.beginPath(); g.ellipse(x,y,rx,ry,0,0,VL_TAU); g.stroke(); g.strokeStyle=S[1]; g.lineWidth=1.4*z; g.beginPath(); g.ellipse(x,y,rx+th*.5,ry+th*.5,0,0,VL_TAU); g.stroke();
  g.lineWidth=1.6*z; g.fillStyle=S[1];
  if(sk==='clay'){ g.strokeStyle=S[1]; for(let i=-1;i<=1;i++){ g.beginPath(); g.ellipse(x,y+i*ry*.4,rx*Math.sqrt(1-i*i*.16),rx*.2,0,0,VL_TAU); g.stroke(); } }   // throwing-wheel rings
  else if(sk==='glaze'){ g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=3*z; g.beginPath(); g.ellipse(x,y,rx*.8,ry*.8,0,Math.PI*1.1,Math.PI*1.45); g.stroke(); const sp=vlClamp((u-.3)*3,0,1); g.globalAlpha=a*Math.sin(sp*Math.PI); g.fillStyle='#fff'; vlStar(g,x-rx*.55,y-ry*.55,6*z,1.4*z,4,0); g.fill(); }   // the fired glaze catches the light
  else if(sk==='drywall'){ g.strokeStyle=S[1]; g.beginPath(); g.moveTo(x,y-ry); g.lineTo(x,y+ry); g.moveTo(x-rx,y); g.lineTo(x+rx,y); g.stroke(); for(const [sx,sy] of [[-.55,-.6],[.55,-.6],[-.55,.6],[.55,.6]]){ g.beginPath(); g.arc(x+sx*rx,y+sy*ry,2*z,0,VL_TAU); g.fill(); } }   // panel seams and screws
  else if(sk==='jacket'){ g.strokeStyle=S[1]; g.setLineDash([4*z,3*z]); g.beginPath(); g.ellipse(x,y,rx*.82,ry*.82,0,0,VL_TAU); g.stroke(); g.setLineDash([]); g.beginPath(); g.moveTo(x,y-ry*.8); g.lineTo(x,y+ry*.8); g.stroke(); }   // knit stitching and a zip
  else if(sk==='crust'){ g.strokeStyle=S[1]; g.lineWidth=2.4*z; for(let i=-1;i<=1;i++){ g.beginPath(); g.moveTo(x+i*rx*.4-rx*.12,y-ry*.35); g.lineTo(x+i*rx*.4+rx*.12,y+ry*.35); g.stroke(); } g.fillStyle='#fef3c7'; for(let i=0;i<6;i++){ g.beginPath(); g.arc(x+(vlRnd(i)-.5)*rx*1.3,y+(vlRnd(i+9)-.5)*ry*1.4,1.5*z,0,VL_TAU); g.fill(); } }   // scored loaf, sesame
  else if(sk==='seatbelt'){ g.strokeStyle=S[1]; g.lineWidth=7*z; g.beginPath(); g.moveTo(x-rx*.8,y-ry*.78); g.lineTo(x+rx*.8,y+ry*.78); g.stroke(); g.fillStyle='#e2e8f0'; g.fillRect(x+rx*.5-4*z,y+ry*.5-4*z,8*z,8*z); }   // the mom-arm bar across
  else if(sk==='velvet'){ g.fillStyle=S[1]; for(const sx of [-1,1]){ g.fillRect(x+sx*rx-1.6*z,y-ry*.3,3.2*z,ry*.9); g.beginPath(); g.arc(x+sx*rx,y-ry*.34,3.4*z,0,VL_TAU); g.fill(); } g.strokeStyle=S[0]; g.lineWidth=4*z; g.beginPath(); g.moveTo(x-rx,y-ry*.3); g.quadraticCurveTo(x,y+ry*.2,x+rx,y-ry*.3); g.stroke(); }   // two brass posts and the rope
  else { g.strokeStyle=S[1]; g.setLineDash([3*z,3*z]); g.beginPath(); g.ellipse(x,y,rx*.8,ry*.8,0,0,VL_TAU); g.stroke(); g.setLineDash([]); g.fillStyle=S[1]; g.beginPath(); g.arc(x-rx*.18,y-ry*.1,2.2*z,0,VL_TAU); g.arc(x+rx*.18,y-ry*.1,2.2*z,0,VL_TAU); g.fill(); }   // plush stitching and two button eyes
  const fl=vlClamp((u-.24)/.14,0,1); if(fl>0&&fl<1){ g.globalAlpha=(1-fl)*.9; g.strokeStyle='#fff'; g.lineWidth=3*z; g.beginPath(); g.ellipse(x,y,rx*(1+fl*.25),ry*(1+fl*.2),0,0,VL_TAU); g.stroke(); }   // the latch flash
  g.restore(); }

// 10. Timeline Push, Pull, Swap & Pep/Ruckus Pop: { targetIds, dir: 'pull'|'push'|'swap'|'bonus_turn', pct: 10..35, pepDelta: 0..2 }
// The same arrows as the turn bar: teal left-pointing for a pull forward, red right-pointing for a push back. Draws on the unit it lands on.
function vlChev(g,cx,cy,s,col,left){ g.strokeStyle=col; g.lineWidth=Math.max(1,s*.42); g.lineCap='round'; g.lineJoin='round'; g.beginPath(); if(left){ g.moveTo(cx+s*.5,cy-s); g.lineTo(cx-s*.5,cy); g.lineTo(cx+s*.5,cy+s); } else { g.moveTo(cx-s*.5,cy-s); g.lineTo(cx+s*.5,cy); g.lineTo(cx-s*.5,cy+s); } g.stroke(); }
function vlChevrons(g,x,y,u,z,p){ p=vlP(p,{targetIds:[],dir:'push',pct:20,pepDelta:0}); const H=vlH(p,z), a=vlFade(u,.3), n=2+Math.round(vlClamp(p.pct,10,35)/35*3), dir=p.dir, TEAL='#14b8a6', RED='#ef4444'; g.save();
  const lane=(ly,left,col)=>{ for(let i=0;i<n;i++){ const t=((u*1.6+i/n)%1), px=x+(left?1:-1)*(1-2*t)*(22+n*8)*z; g.globalAlpha=a*Math.sin(t*Math.PI); vlChev(g,px,ly,7*z,col,left); } };
  if(dir==='swap'){ lane(y-H*.14,true,TEAL); lane(y+H*.14,false,RED); g.globalAlpha=a*.8; g.strokeStyle='#0ea5e9'; g.lineWidth=2.4*z; g.beginPath(); g.arc(x,y,H*.3,u*8,u*8+Math.PI*1.2); g.stroke(); g.beginPath(); g.arc(x,y,H*.3,u*8+Math.PI,u*8+Math.PI*2.2); g.stroke(); }   // two lanes and a swap ring
  else if(dir==='bonus_turn'){ const ru=vlClamp(u*1.4,0,1); g.globalAlpha=(1-ru)*a; g.strokeStyle='#fbbf24'; g.lineWidth=(5-3*ru)*z; g.beginPath(); g.ellipse(x,y+H*.5,14*z+vlEase(ru)*H*.5,5*z+vlEase(ru)*H*.14,0,0,VL_TAU); g.stroke();   // the bonus-turn ring and a mini turn token
    const k=vlBack(vlClamp((u-.2)/.25,0,1)); g.globalAlpha=a; g.fillStyle='#fef3c7'; g.strokeStyle='#d97706'; g.lineWidth=2*z; g.beginPath(); g.arc(x,y-H*.5-14*z,8*z*k,0,VL_TAU); g.fill(); g.stroke(); vlChev(g,x,y-H*.5-14*z,3.4*z*k,'#d97706',true); }
  else { const pull=dir==='pull'; lane(y,pull,pull?TEAL:RED); g.globalAlpha=a; g.font='900 '+Math.round(11*z)+'px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=3.4*z; g.lineJoin='round'; g.strokeStyle=VL_INK; g.fillStyle=pull?'#99f6e4':'#fecaca'; const t=(pull?'-':'+')+Math.round(vlClamp(p.pct,10,35))+'%'; g.strokeText(t,x,y-H*.5-12*z); g.fillText(t,x,y-H*.5-12*z); }
  const pep=vlClamp(Math.round(p.pepDelta)||0,0,2); for(let i=0;i<pep;i++){ const k=vlBack(vlClamp((u-.3-i*.12)/.2,0,1)); if(k<=0) continue; g.globalAlpha=a; g.fillStyle='#fde047'; g.strokeStyle=VL_INK; g.lineWidth=1.4*z; vlStar(g,x+(i-(pep-1)/2)*22*z,y-H*.5-34*z-u*8*z,9*z*k,3.6*z*k,5,-.2); g.fill(); g.stroke(); }   // gold Pep stars rise over the head
  g.restore(); }

// 11. Stat Buff/Debuff, Strip, Invert & Taunt Tether: { mode: 'buff_up'|'debuff_down'|'strip'|'steal'|'invert'|'taunt_tether'|'mix_mark'|'perm_def_crack' }
// Three screen-rule badges sit on the foe's head (just above it: p._h is the foe's height); the stolen badges and the tether run to the member (p._from).
function vlBadge(g,x,y,r,col,glyph){ g.save(); g.fillStyle=col; g.strokeStyle='#fff'; g.lineWidth=Math.max(1,r*.2); g.beginPath(); g.arc(x,y,r,0,VL_TAU); g.fill(); g.stroke(); g.fillStyle='#fff'; g.strokeStyle='#fff'; g.lineWidth=Math.max(1,r*.3); g.lineJoin='round'; g.lineCap='round';
  if(glyph==='up'||glyph==='down'){ const s=glyph==='up'?-1:1; g.beginPath(); g.moveTo(x-r*.5,y-s*r*.1); g.lineTo(x,y+s*r*.5); g.lineTo(x+r*.5,y-s*r*.1); g.stroke(); g.beginPath(); g.moveTo(x,y+s*r*.5); g.lineTo(x,y-s*r*.5); g.stroke(); }
  else if(glyph==='shield'){ g.beginPath(); g.moveTo(x-r*.5,y-r*.5); g.lineTo(x+r*.5,y-r*.5); g.lineTo(x+r*.5,y+r*.05); g.quadraticCurveTo(x+r*.4,y+r*.5,x,y+r*.65); g.quadraticCurveTo(x-r*.4,y+r*.5,x-r*.5,y+r*.05); g.closePath(); g.fill(); }
  else if(glyph==='tab'){ g.beginPath(); g.rect(x-r*.5,y-r*.3,r,r*.7); g.fill(); g.beginPath(); g.rect(x-r*.5,y-r*.55,r*.5,r*.3); g.fill(); }
  g.restore(); }
function vlBadges(g,x,y,u,z,p){ p=vlP(p,{mode:'debuff_down'}); const H=vlH(p,z), hy=y-H*.5-13*z, r=8*z, a=vlFade(u,.25), m=p.mode, fr=vlFrom(p,x,y,z); g.save();
  const slot=i=>x+(i-1)*22*z, pop=i=>vlBack(vlClamp((u-i*.08)/.2,0,1));
  if(m==='buff_up'||m==='debuff_down'){ const up=m==='buff_up'; for(let i=0;i<3;i++){ const k=pop(i); if(k<=0) continue; g.globalAlpha=a; vlBadge(g,slot(i),hy+(up?-u*8:u*6)*z,r*k,up?['#14b8a6','#22c55e','#f59e0b'][i]:['#64748b','#ef4444','#6366f1'][i],up?'up':'down'); } }
  else if(m==='strip'){ for(let i=0;i<3;i++){ const k=pop(i), bu=vlClamp((u-.4-i*.07)/.3,0,1); if(bu<=0){ if(k>0){ g.globalAlpha=a; vlBadge(g,slot(i),hy,r*k,'#14b8a6','up'); } continue; }
      if(bu>=1) continue; g.globalAlpha=(1-bu)*a; for(let j=0;j<6;j++){ const an=j*VL_TAU/6+vlRnd(i*6+j)*.5, d=vlEase(bu)*(14+vlRnd(j+i*9)*10)*z; g.fillStyle=j%2?'#fef08a':'#99f6e4'; g.beginPath(); g.arc(slot(i)+Math.cos(an)*d,hy+Math.sin(an)*d,(3-bu*2)*z,0,VL_TAU); g.fill(); } } }   // each badge pops into shards
  else if(m==='steal'){ for(let i=0;i<3;i++){ const t=vlClamp((u-.2-i*.08)/.55,0,1), k=pop(i); if(t>=1) continue; const px=vlLerp(slot(i),fr.x,vlEase(t)), py=vlLerp(hy,fr.y-20*z,vlEase(t))-Math.sin(t*Math.PI)*34*z; g.globalAlpha=a*(1-t*.3); vlBadge(g,px,py,r*Math.max(k,0)*(1-t*.3),'#22c55e','up'); } }   // the buffs fly off in an arc to the thief
  else if(m==='invert'){ for(let i=0;i<3;i++){ const t=vlClamp((u-.2-i*.07)/.35,0,1), s=Math.cos(t*Math.PI), k=pop(i); if(k<=0) continue; g.globalAlpha=a; g.save(); g.translate(slot(i),hy); g.scale(1,Math.abs(s)<.06?.06:s); const flipped=t>.5; vlBadge(g,0,0,r*k,flipped?'#ef4444':'#14b8a6',flipped?'down':'up'); g.restore(); } }
  else if(m==='taunt_tether'){ const k=vlBack(vlClamp(u/.2,0,1)); g.globalAlpha=a; g.strokeStyle='#f59e0b'; g.lineWidth=2.2*z; g.setLineDash([6*z,5*z]); g.lineDashOffset=-u*160*z; g.beginPath(); g.moveTo(x,hy); g.quadraticCurveTo((x+fr.x)/2,Math.min(hy,fr.y)-26*z,fr.x,fr.y-H*.3); g.stroke(); g.setLineDash([]);   // the aggro tether to the one it is locked on
    g.strokeStyle='#ef4444'; g.lineWidth=2*z; g.beginPath(); g.arc(x,hy,11*z*k,u*5,u*5+Math.PI*1.5); g.stroke(); g.beginPath(); g.moveTo(x-16*z*k,hy); g.lineTo(x-7*z*k,hy); g.moveTo(x+16*z*k,hy); g.lineTo(x+7*z*k,hy); g.stroke(); }
  else if(m==='mix_mark'){ for(let i=0;i<4;i++){ const k=pop(i); if(k<=0) continue; const tx=x+(i-1.5)*19*z; g.globalAlpha=a; g.fillStyle=i%2?'#818cf8':'#6366f1'; g.strokeStyle='#fff'; g.lineWidth=1.6*z; g.beginPath(); g.moveTo(tx-8*z*k,hy+6*z*k); g.lineTo(tx-8*z*k,hy-4*z*k); g.quadraticCurveTo(tx-8*z*k,hy-9*z*k,tx-3*z*k,hy-9*z*k); g.lineTo(tx+3*z*k,hy-9*z*k); g.quadraticCurveTo(tx+8*z*k,hy-9*z*k,tx+8*z*k,hy-4*z*k); g.lineTo(tx+8*z*k,hy+6*z*k); g.closePath(); g.fill(); g.stroke(); } }   // four browser-tab marks
  else if(m==='perm_def_crack'){ const k=pop(0); g.globalAlpha=a; if(k>0) vlBadge(g,x,hy,r*1.2*k,'#64748b','shield'); const c=vlClamp((u-.25)/.2,0,1);
    g.strokeStyle='#fff'; g.lineWidth=1.8*z; g.shadowColor=VL_INK; g.shadowBlur=2*z; g.beginPath(); g.moveTo(x+1*z,hy-9*z*c); g.lineTo(x-3*z,hy-2*z*c); g.lineTo(x+2*z,hy+2*z*c); g.lineTo(x-1*z,hy+9*z*c); g.stroke();   // the shield badge splits
    for(let i=0;i<3;i++){ const f=vlClamp((u-.4-i*.08)/.3,0,1); if(f<=0) continue; g.lineWidth=2.2*z; vlBolt(g,x+(i-1)*H*.16,y-H*.3,x+(i-1)*H*.2,y-H*.3+f*H*.6,i*13,5*z); g.stroke(); } }   // permanent fissures down the foe
  g.restore(); }

// 12. Lobbed Projectile Arc Engine: { spriteId, startPos, endPos, arcHeightPx: 45..110, spinSpeed, impactVfxId }
// Flies from the member (or startPos) to the foe (or endPos) in VL_ARC_FLY ms, right to left, with spin, a ground shadow and a fading trail, and lands at the
// contact moment. spinSpeed is turns per flight. impactVfxId is not drawn here: the move's own impact effect (the clobber, the splash) is its own library asset.
const VL_ARC_FLY=560, VL_ARC_TAIL=140, VL_ARC_MS=VL_ARC_FLY+VL_ARC_TAIL;
function vlArc(g,x,y,u,z,p){ p=vlP(p,{spriteId:'',startPos:null,endPos:null,arcHeightPx:70,spinSpeed:2,impactVfxId:''}); const e=p.endPos||{x,y}, s=p.startPos||vlFrom(p,x,y,z), f=VL_ARC_FLY/VL_ARC_MS, t=vlClamp(u/f,0,1), ah=vlClamp(p.arcHeightPx,45,110)*z*.8;
  const at=q=>({x:vlLerp(s.x,e.x,q),y:vlLerp(s.y,e.y,q)-ah*4*q*(1-q)}); g.save();
  if(u<f){ const P=at(t), hh=4*t*(1-t); g.globalAlpha=.3; g.fillStyle='#000'; g.beginPath(); g.ellipse(P.x,vlLerp(s.y,e.y,t)+34*z,(11-hh*4)*z,(3.4-hh)*z,0,0,VL_TAU); g.fill();   // the shadow on the ground under the flight
    for(let k=3;k>=1;k--){ const T=at(Math.max(0,t-k*.05)); g.globalAlpha=.16*(4-k)/3; g.fillStyle='#fff'; g.beginPath(); g.arc(T.x,T.y,5*z,0,VL_TAU); g.fill(); }
    g.globalAlpha=1; vlProp(g,p.spriteId,P.x,P.y,15*z,t*p.spinSpeed*VL_TAU,'#b45309'); }
  else { const k=(u-f)/(1-f); g.globalAlpha=(1-k)*.7; g.fillStyle='#e7dcc5'; for(let j=0;j<4;j++){ g.beginPath(); g.arc(e.x+(j-1.5)*9*z*(.6+k),e.y+24*z-k*8*z-(j%2)*5*z,(4+k*8)*z,0,VL_TAU); g.fill(); } }   // a puff where it lands
  g.restore(); }

// 13. Boomerang & Fishing-Line Pull Engine: { spriteId, hasLine, pullTargetToFront, apexTimeFrac: 0.5 }
// Out to the foe (a bonk at the apex, which is the clip's contact moment) and back to the member on a different curve. hasLine draws the taut line from the
// member; pullTargetToFront draws the tug chevrons that drag the foe toward the party on the way back.
const VL_BOOM_MS=900;
function vlBoom(g,x,y,u,z,p){ p=vlP(p,{spriteId:'',hasLine:false,pullTargetToFront:false,apexTimeFrac:.5}); const ap=vlClamp(p.apexTimeFrac,.3,.7), s=vlFrom(p,x,y,z), out=u<ap, w=out?vlEase(u/ap):vlClamp((u-ap)/(1-ap),0,1), ew=out?w:w*w*(3-2*w); g.save();
  const px=out?vlLerp(s.x,x,ew):vlLerp(x,s.x,ew), py=(out?vlLerp(s.y,y,ew)-Math.sin(ew*Math.PI)*38*z:vlLerp(y,s.y,ew)+Math.sin(ew*Math.PI)*34*z);   // out on the high curve, back on the low one
  if(p.hasLine){ g.strokeStyle='#f1f5f9'; g.lineWidth=1.6*z; g.shadowColor=VL_INK; g.shadowBlur=1.5*z; g.beginPath(); g.moveTo(s.x,s.y); const sag=p.pullTargetToFront&&!out?0:(out?6:10)*z; g.quadraticCurveTo((s.x+px)/2,(s.y+py)/2+sag,px,py); g.stroke(); g.shadowBlur=0; }   // the taut line
  const ru=u/ap; if(u<.985){ g.globalAlpha=1; vlProp(g,p.spriteId,px,py,14*z,p.hasLine?Math.atan2(s.y-py,s.x-px)+Math.PI:u*7*VL_TAU,'#0284c7'); }
  if(out&&ru>.9||!out&&u-ap<.14){ const bk=out?0:(u-ap)/.14; g.globalAlpha=1-bk; g.fillStyle='#fff3c4'; g.strokeStyle=VL_INK; g.lineWidth=1.6*z; vlStar(g,x,y,(10+bk*14)*z,(4+bk*5)*z,7,bk); g.fill(); g.stroke(); }   // the bonk at the apex
  if(p.pullTargetToFront&&!out){ const k=vlClamp((u-ap)/(1-ap),0,1); g.globalAlpha=Math.sin(k*Math.PI); for(let i=0;i<3;i++) vlChev(g,x+(14+i*11+k*30)*z,y,6*z,'#ef4444',false); }   // the foe is dragged toward the party
  g.restore(); }

// 14. Ally Toss & Party Snack Distribution Engine: { spriteId, targetAllyIds: [], arcHeightPx: 30..55, onCatchVfxId }
// The one projectile that flies to the party's side (rightward): a gentle arc from the member to one ally or all four (one item each, a beat apart).
// onCatchVfxId names a library effect that plays, squeezed into the end of the effect, where each item is caught.
const VL_HAND_MS=800, VL_HAND_AT=[[40,-4],[62,-28],[24,-32],[68,10]];
function vlHandoff(g,x,y,u,z,p){ p=vlP(p,{spriteId:'',targetAllyIds:[],arcHeightPx:42,onCatchVfxId:''}); const n=vlClamp((Array.isArray(p.targetAllyIds)?p.targetAllyIds.length:0)||1,1,4), s=vlFrom(p,x,y,z), ah=vlClamp(p.arcHeightPx,30,55)*z*.8, fly=.56; g.save();
  for(let k=0;k<n;k++){ const t0=(u-k*.07)/fly, e={x:s.x+VL_HAND_AT[n===1?0:k][0]*z,y:s.y+VL_HAND_AT[n===1?0:k][1]*z}; if(t0<0) continue;
    if(t0<1){ const t=vlEase(t0); g.globalAlpha=1; vlProp(g,p.spriteId,vlLerp(s.x,e.x,t),vlLerp(s.y,e.y,t)-ah*4*t0*(1-t0),12*z,t0*3,'#059669'); continue; }
    const cu=vlClamp((u-k*.07-fly)/Math.max(.05,1-fly-k*.07),0,1); g.globalAlpha=(1-cu)*.9; g.strokeStyle='#34d399'; g.lineWidth=(3-2*cu)*z; g.beginPath(); g.arc(e.x,e.y,(6+vlEase(cu)*20)*z,0,VL_TAU); g.stroke();   // the catch pop
    g.fillStyle='#fde68a'; for(let j=0;j<4;j++){ const an=j*VL_TAU/4+cu*2; vlStar(g,e.x+Math.cos(an)*(10+cu*14)*z,e.y+Math.sin(an)*(10+cu*14)*z,4*z*(1-cu),1*z,4,0); g.fill(); }
    const fn=p.onCatchVfxId&&p.onCatchVfxId!=='proj_ally_handoff_party'&&!/^proj_/.test(p.onCatchVfxId)?P1_VFX[p.onCatchVfxId]:null; if(fn&&cu<1) fn(g,e.x,e.y,cu,z,{_h:56*z}); }
  g.restore(); }

// 15. Persistent Ground Hazard & Lava Floor Engine: { hazardType: 'wet_floor'|'hot_glue'|'molten_lava'|'skateboard_debris', durationRounds: 1..2 }
// A flattened floor decal under the foe's feet (p._h is the foe's height): it spreads in, stays for the rest of the effect, then fades. Round pips mark 1 or 2 rounds.
const VL_HAZ_MS=1800;
function vlHazard(g,x,y,u,z,p){ p=vlP(p,{hazardType:'wet_floor',durationRounds:1}); const H=vlH(p,z), fy=y+H*.5, rd=vlClamp(Math.round(p.durationRounds)||1,1,2), grow=vlEase(vlClamp(u/.16,0,1)), rx=Math.max(1,(52+(rd-1)*10)*z*grow), ry=rx*.28, a=vlFade(u,.2), T=p.hazardType, tm=u*VL_HAZ_MS/1000; g.save(); g.globalAlpha=a;
  const base=(f,s)=>{ g.fillStyle=f; g.strokeStyle=s; g.lineWidth=2*z; g.beginPath(); g.ellipse(x,fy,rx,ry,0,0,VL_TAU); g.fill(); g.stroke(); };
  if(T==='hot_glue'){ base('rgba(249,168,212,.5)','#be185d'); for(let i=0;i<14;i++){ const an=vlRnd(i)*VL_TAU, d=Math.sqrt(vlRnd(i+9))*.85, sx=x+Math.cos(an)*rx*d, sy=fy+Math.sin(an)*ry*d, tw=.5+.5*Math.sin(tm*9+i*1.7); g.fillStyle=i%3?'#f0abfc':'#fff'; vlStar(g,sx,sy,(2.4+tw*2.4)*z,.8*z,4,0); g.fill(); } }   // rhinestones twinkling in a glue mat
  else if(T==='molten_lava'){ base('rgba(234,88,12,.78)','#7c2d12'); g.fillStyle='#fbbf24'; for(let i=0;i<5;i++){ const bt=(tm*.9+vlRnd(i))%1, bx=x+(vlRnd(i+4)-.5)*rx*1.5, by=fy+(vlRnd(i+8)-.5)*ry*1.2; g.globalAlpha=a*(1-bt); g.beginPath(); g.arc(bx,by,(2+bt*5)*z,0,VL_TAU); g.fill(); }   // bubbles swell and pop
    g.globalAlpha=a; for(let i=0;i<3;i++){ const cx=x+(i-1)*rx*.55, cy=fy+Math.sin(tm*3+i*2)*1.5*z-ry*.1; g.fillStyle=['#cbd5c0','#99c9c4','#e6d3b3'][i]; g.strokeStyle=VL_INK; g.lineWidth=1.6*z; g.beginPath(); g.rect(cx-9*z,cy-4*z,18*z,8*z); g.fill(); g.stroke(); } }   // sofa cushions floating on it
  else if(T==='skateboard_debris'){ base('rgba(148,163,184,.35)','#475569'); for(let i=0;i<3;i++){ const k=((tm*.8+i/3)%1), wx=x+rx*(1-2*k)*.8, wy=fy+(i-1)*ry*.4; g.strokeStyle='#1e293b'; g.fillStyle='#e2e8f0'; g.lineWidth=1.8*z; g.beginPath(); g.arc(wx,wy,4.4*z,0,VL_TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(wx,wy); g.lineTo(wx+Math.cos(k*30)*4*z,wy+Math.sin(k*30)*4*z); g.stroke(); }   // wheels rolling out from the party side
    g.fillStyle='#a16207'; for(let i=0;i<3;i++){ g.save(); g.translate(x+(i-1)*rx*.5,fy+ry*.2*(i%2?-1:1)); g.rotate(i*1.3); g.fillRect(-6*z,-1.6*z,12*z,3.2*z); g.restore(); } }   // splinters of deck
  else { base('rgba(125,211,252,.5)','#0369a1'); g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2*z; g.beginPath(); g.ellipse(x,fy,rx*.8,ry*.7,0,Math.PI*1.1,Math.PI*1.5); g.stroke();
    for(let i=0;i<9;i++){ const bt=(tm*.6+vlRnd(i))%1, bx=x+(vlRnd(i+4)-.5)*rx*1.6, by=fy-bt*18*z+(vlRnd(i+8)-.5)*ry; g.globalAlpha=a*Math.sin(bt*Math.PI)*.9; g.strokeStyle='#fff'; g.fillStyle='rgba(255,255,255,.35)'; g.lineWidth=1.2*z; g.beginPath(); g.arc(bx,by,(2.6+vlRnd(i)*3)*z,0,VL_TAU); g.fill(); g.stroke(); }   // soap suds drifting up
    g.globalAlpha=a; g.fillStyle='#facc15'; g.strokeStyle=VL_INK; g.lineWidth=1.6*z; g.beginPath(); g.moveTo(x+rx*.72,fy-ry*.2); g.lineTo(x+rx*.72-8*z,fy+ry*.5); g.lineTo(x+rx*.72+8*z,fy+ry*.5); g.closePath(); g.fill(); g.stroke(); g.fillStyle=VL_INK; g.fillRect(x+rx*.72-3*z,fy+ry*.1,6*z,1.6*z); }   // a wet-floor cone
  g.globalAlpha=a; for(let i=0;i<rd;i++){ g.fillStyle='#fff'; g.strokeStyle=VL_INK; g.lineWidth=1.4*z; g.beginPath(); g.arc(x-rx*.9+i*10*z,fy+ry*1.35,3.4*z,0,VL_TAU); g.fill(); g.stroke(); }   // one pip a round
  g.restore(); }

Object.assign(P1_VFX,{vfx_core_shield_ward:vlShield,vfx_core_timeline_chevrons:vlChevrons,vfx_core_status_debuff_badges:vlBadges,proj_arc_single:vlArc,proj_boomerang_return:vlBoom,
  proj_ally_handoff_party:vlHandoff,proj_ground_hazard_mat:vlHazard});
Object.assign(P1_VFX_MS,{vfx_core_shield_ward:1000,vfx_core_timeline_chevrons:900,vfx_core_status_debuff_badges:1000,proj_arc_single:VL_ARC_MS,proj_boomerang_return:VL_BOOM_MS,
  proj_ally_handoff_party:VL_HAND_MS,proj_ground_hazard_mat:VL_HAZ_MS});
Object.assign(P1_VFX_LEAD,{proj_arc_single:VL_ARC_FLY,proj_boomerang_return:p=>Math.round(VL_BOOM_MS*vlClamp((p&&p.apexTimeFrac)||.5,.3,.7)),proj_ally_handoff_party:0});
P1_VFX_SELF.vfx_core_shield_ward=true;
