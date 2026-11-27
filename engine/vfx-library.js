'use strict';
// engine/vfx-library.js (vfxlib1, 2026-11-26): the first 8 effects of the Stage 2C shared VFX library (art-factory/aot-stage2c-vfx-library-v11.json),
// in the library's order: clobber_impact, sizzle_wave, drench_splash, razzle_beam_arc, racket_rings, detonation_pops, composure_break, heal_cleanse.
// Each one is drawn in code on a Canvas (no painted frames), takes the params its library entry lists, and has defaults so a move that names no
// params still draws. Signature (g,x,y,u,z,p): g the canvas, x,y the middle of the unit it lands on, u 0..1 through the effect's own length
// (P1_VFX_MS), z the phone scale, p the params or null. engine/b3-vfx.js draws them from the moment a move's first hit lands, on the foe (the heal on
// the member playing the move: P1_VFX_SELF). They add themselves to P1_VFX, so a move's libraryAssets in data/guide-manifest.json pick them up.
// The party stands on the right of the screen and the foe on the left, so every swing, spray, bolt and beam comes in from the right.
// Effects 9 to 15 (shield, chevrons, badges, the four projectiles) are further down (vfxlib2). Sound (sfxHook names only) is played by a move's spec (an effect's `sfx`).
const VL_TAU=Math.PI*2, VL_INK='#3b2a1a';
const vlRnd=n=>{ const s=Math.sin(n*127.1+311.7)*43758.5453; return s-Math.floor(s); };   // the same n gives the same number, so every frame redraws the same particles
const vlClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const vlEase=u=>1-Math.pow(1-u,3);
const vlBack=u=>{ const c=1.70158; return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2); };   // overshoots, then settles: the pop of a lettered callout
const vlFade=(u,a)=>u<1-a?1:Math.max(0,(1-u)/a);   // opaque, then fades over the last fraction a of the effect
const vlP=(p,d)=>Object.assign({},d,p||{});
const vlLerp=(a,b,t)=>a+(b-a)*t;
const vlSm=u=>u*u*(3-2*u);   // smoothstep: eases in and out, so a vehicle spends its time crossing the screen
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
// stands ({x,y}, fight coordinates); engine/b3-vfx.js fills both. Projectiles fly from the member to the foe, so from the right to the left, and arrive
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

// ---- vfxlib3 (2026-11-26): library effects 16 to 37, the 22 custom set-pieces, in the library's order. ----
// A set-piece is bigger than a unit: it spans the enemy half, the party side or the whole screen, so it is drawn in fight coordinates (576 x 324, VL_W x VL_HT)
// around the anchor engine/b3-vfx.js gives it. An effect that draws on the foe (P1_VFX_SELF unset) gets the foe in x,y and the member in p._from; an effect
// that draws on the member (P1_VFX_SELF set) gets the member in x,y, its height in p._h and the foe in p._foe {x,y,h}. The library's `layer` (behind_units,
// unit_overlay ...) is in P1_VFX_LAYER at the end of this file: a real fight (engine/b3-vfx.js) draws each effect at its layer's point.
const VL_W=576, VL_HT=324;
function vlRR(g,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); g.beginPath(); g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r); g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h); g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r); g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y); g.closePath(); }
function vlBox(g,x,y,w,h,f,s,r){ vlRR(g,x,y,w,h,r||0); g.fillStyle=f; g.fill(); if(s){ g.strokeStyle=s; g.stroke(); } }
function vlPoly(g,pts,f,s){ g.beginPath(); pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); if(f){ g.fillStyle=f; g.fill(); } if(s){ g.strokeStyle=s; g.stroke(); } }
function vlDisc(g,x,y,r,f,s){ g.beginPath(); g.arc(x,y,Math.max(.1,r),0,VL_TAU); if(f){ g.fillStyle=f; g.fill(); } if(s){ g.strokeStyle=s; g.stroke(); } }
function vlText(g,t,x,y,px,f,s,w){ g.save(); g.font='900 '+Math.round(px)+'px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.lineWidth=w||px*.28; g.strokeStyle=s||VL_INK; g.strokeText(t,x,y); g.fillStyle=f||'#fff'; g.fillText(t,x,y); g.restore(); }
function vlDim(g,a,col,hole){ if(a<=0) return; g.save(); g.globalAlpha=a; g.fillStyle=col||'#0b1020'; g.beginPath(); g.rect(-60,-60,VL_W+120,VL_HT+120); if(hole) g.ellipse(hole.x,hole.y,hole.rx,hole.ry,0,0,VL_TAU); g.fill('evenodd'); g.restore(); }   // the screen darkens; a hole keeps one spot lit
const vlFoeOf=(p,x,y,z)=>p&&p._foe&&isFinite(p._foe.x)&&isFinite(p._foe.y)?p._foe:{x:x-240*z,y:y,h:90*z};   // no foe known: off to the left of the member
const vlPipRow=(g,x,y,n,z)=>{ for(let i=0;i<n;i++){ vlDisc(g,x+i*10*z,y,3.4*z,'#fff',VL_INK); } };

// 16. Delta 360 Black Tarmac Porsche SUV: { speedPxSec: 1150, highBeamAlpha: .85, dustTrail: true }
// Screeches right to left across the enemy half on the foe's floor with blinding high beams and a trail of jet-wash rings. It draws on the foe, so the whole pass takes (screen + two car lengths) / speed.
const VL_PORSCHE_LEN=88, vlPorscheMs=p=>Math.max(600,Math.round((VL_W+VL_PORSCHE_LEN*1.8*2)/vlClamp(+(p&&p.speedPxSec)||1150,600,1600)*1000));
function vlPorsche(g,x,y,u,z,p){ p=vlP(p,{speedPxSec:1150,highBeamAlpha:.85,dustTrail:true}); const L=VL_PORSCHE_LEN*z, s=L/100, fy=y+vlH(p,z)*.5+6*z, cx=VL_W+L*.8-(VL_W+L*2)*u, ba=vlClamp(+p.highBeamAlpha,0,1), tm=u*vlPorscheMs(p)/1000; g.save();
  if(p.dustTrail){ for(let i=0;i<9;i++){ const d=(i+1)*17*s, rr=(8+i*3.4)*s, sw=Math.sin(tm*16-i*.9); g.globalAlpha=.55*(1-i/10); g.strokeStyle=i%2?'#e2e8f0':'#94a3b8'; g.lineWidth=3*z; g.beginPath(); g.ellipse(cx+54*s+d,fy-12*s-sw*5*s,rr*.5,rr*.34+Math.abs(sw)*3*s,0,0,VL_TAU); g.stroke(); }
    for(let i=0;i<10;i++){ g.globalAlpha=.4*(1-i/11); vlDisc(g,cx+60*s+i*21*s,fy-6*s-vlRnd(i)*10*s,(7+i*1.6)*s,'rgba(203,213,225,.8)'); } }   // swirling rings and dust puffs behind the car
  g.translate(cx,fy); g.scale(-1,1); g.lineWidth=2*z; g.lineJoin='round'; g.globalAlpha=1;
  const bm=g.createLinearGradient(52*s,0,360*s,0); bm.addColorStop(0,'rgba(255,255,230,'+ba+')'); bm.addColorStop(1,'rgba(255,255,230,0)'); g.fillStyle=bm; g.beginPath(); g.moveTo(52*s,-26*s); g.lineTo(360*s,-78*s); g.lineTo(360*s,14*s); g.closePath(); g.fill();   // the high beams
  vlBox(g,-50*s,-34*s,100*s,24*s,'#111827','#000',7*s); vlPoly(g,[[-28*s,-34*s],[-14*s,-54*s],[22*s,-54*s],[38*s,-34*s]],'#0b1220','#000'); vlPoly(g,[[-22*s,-36*s],[-12*s,-50*s],[0,-50*s],[0,-36*s]],'#7dd3fc'); vlPoly(g,[[4*s,-36*s],[4*s,-50*s],[20*s,-50*s],[32*s,-36*s]],'#7dd3fc');
  g.fillStyle='rgba(255,255,255,.28)'; g.fillRect(-46*s,-31*s,92*s,3*s); vlBox(g,-8*s,-37*s,2*s,6*s,'#d1d5db'); vlDisc(g,45*s,-24*s,6*s,'#fffbe0','#fde68a');
  for(const wx of [-30,30]){ vlDisc(g,wx*s,-10*s,10.5*s,'#0f172a','#000'); vlDisc(g,wx*s,-10*s,5*s,'#94a3b8'); g.strokeStyle='#e2e8f0'; g.lineWidth=1.4*z; g.beginPath(); g.moveTo(wx*s,-10*s); g.lineTo(wx*s+Math.cos(tm*40)*5*s,-10*s+Math.sin(tm*40)*5*s); g.stroke(); }
  g.globalAlpha=ba; g.fillStyle='#fff'; vlStar(g,52*s,-26*s,15*s,3*s,4,tm*3); g.fill();   // the glare at the lamps
  g.restore(); }

// 17. Delta One Privacy-Pod Sliding Doors: { allyIds: [], closeDurationMs: 420, amberLedPulse: true }
// Draws on the member playing the clip (P1_VFX_SELF): a pod forms around each adjacent ally, above and below it (allyIds counted, 2 when none are named, up to 3), the two doors glide shut, the cabin lock light
// pulses amber, and a dotted tether runs from each ally's pod back to the member.
const VL_POD_MS=1500;
function vlPod(g,x,y,u,z,p){ p=vlP(p,{allyIds:[],closeDurationMs:420,amberLedPulse:true}); const H=vlH(p,z), n=vlClamp((Array.isArray(p.allyIds)?p.allyIds.length:0)||2,1,3), a=vlFade(u,.22), cl=vlClamp(+p.closeDurationMs||420,200,900)/VL_POD_MS, tm=u*VL_POD_MS/1000, w=H*.74, h=H*1.02; g.save(); g.globalAlpha=a; g.lineWidth=2*z; g.lineJoin='round';
  const pods=[]; for(let i=0;i<n;i++) pods.push([-8*z*(i+1),(i%2?1:-1)*(1+(i>>1))*H*1.05]);   // a pod round each adjacent ally, above and below the member
  pods.forEach((q,i)=>{ const cx=x+q[0], cy=y+q[1]+H*.05, k=vlEase(vlClamp((u-.08-i*.06)/cl,0,1)), pop=vlBack(vlClamp((u-i*.06)/.12,0,1));
    g.save(); g.translate(cx,cy); g.scale(pop,pop); vlBox(g,-w*.5,-h*.5,w,h,'rgba(15,118,110,.22)','#115e59',8*z);   // the pod's back and frame
    const dw=w*.5*k; vlBox(g,-w*.5,-h*.5,dw,h,'#14b8a6','#115e59',4*z); vlBox(g,w*.5-dw,-h*.5,dw,h,'#0f766e','#115e59',4*z);   // two doors slide in from the sides
    g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(-w*.5+4*z,-h*.4,3*z,h*.5*k);
    if(k>.95){ const lit=p.amberLedPulse?.55+.45*Math.sin(tm*14+i):1; vlDisc(g,0,-h*.5+9*z,4.2*z,'rgba(251,191,36,'+lit+')','#92400e'); g.globalAlpha=a*lit*.35; vlDisc(g,0,-h*.5+9*z,9*z,'#fbbf24'); g.globalAlpha=a; }   // cabin lock light
    g.restore();
    if(k>.2){ g.save(); g.globalAlpha=a*.8*k; g.strokeStyle='#5eead4'; g.lineWidth=2.4*z; g.setLineDash([5*z,4*z]); g.lineDashOffset=-tm*30; g.beginPath(); g.moveTo(cx+w*.5,cy); g.quadraticCurveTo(x+q[0]*.3+w*.5,(cy+y)/2,x-w*.5,y); g.stroke(); g.restore(); } });   // a tether back to the member
  g.restore(); }

// 18. Giant Sky-Dropped Floor Controller (Konami Code): { buttonSeq: ['U','U','D','D','L','R','L','R','B','A'], meteorCount: 14 }
// Draws on the member (P1_VFX_SELF). A giant pad drops flat under the member's feet and squashes, lights its buttons in the order of buttonSeq, then fires a rainbow of starbeams and meteorCount retro meteors left, at the foes.
const VL_PAD_MS=2600, VL_RAINBOW=['#ef4444','#f97316','#facc15','#22c55e','#38bdf8','#6366f1','#c026d3'];
function vlSkyPad(g,x,y,u,z,p){ p=vlP(p,{buttonSeq:['U','U','D','D','L','R','L','R','B','A'],meteorCount:14}); const H=vlH(p,z), fy=y+H*.5+5*z, seq=Array.isArray(p.buttonSeq)&&p.buttonSeq.length?p.buttonSeq.map(String):['U','D'], n=seq.length, mc=vlClamp(Math.round(+p.meteorCount)||14,4,30), a=vlFade(u,.12), dr=vlClamp(u/.14,0,1), land=dr>=1, sq=land?Math.max(0,.25*Math.exp(-(u-.14)*30)*Math.cos((u-.14)*90)):0, step=vlClamp(Math.floor(vlClamp((u-.16)/.44,0,.999)*n),0,n-1), lit=u>.16&&u<.62?seq[step]:'', tm=u*VL_PAD_MS/1000; g.save(); g.globalAlpha=a;
  const foe=vlFoeOf(p,x,y,z);
  if(u>.6){ const bu=vlClamp((u-.6)/.25,0,1), ay=y-H*.2; VL_RAINBOW.forEach((c,i)=>{ const ty=foe.y+(i-3)*17*z; g.globalAlpha=a*(1-Math.max(0,(u-.85)/.15))*.9; g.strokeStyle=c; g.lineWidth=5.5*z; g.lineCap='round'; g.beginPath(); g.moveTo(x-30*z,ay); g.lineTo(x-30*z+(foe.x-x+30*z)*vlEase(bu),ay+(ty-ay)*vlEase(bu)); g.stroke(); });   // starbeams
    for(let i=0;i<mc;i++){ const t=vlClamp((u-.56)*2.4-vlRnd(i)*.55,0,1); if(t<=0||t>=1) continue; const mx=foe.x-(vlRnd(i+30)-.35)*150*z-t*70*z, my=-30*z+t*(foe.y+40*z)+vlRnd(i+60)*20*z; g.globalAlpha=a*(1-t*.3); g.strokeStyle='#fde68a'; g.lineWidth=3*z; g.beginPath(); g.moveTo(mx+34*z,my-34*z); g.lineTo(mx,my); g.stroke(); g.fillStyle=i%2?'#fff':'#f9a8d4'; vlStar(g,mx,my,6*z,2*z,4,t*6); g.fill(); } }   // retro meteors
  g.globalAlpha=a; g.save(); g.translate(x,fy-(1-vlEase(dr))*(fy+90*z)); g.scale((1+sq)*.62,(.5-sq*.45)*.62); g.lineWidth=2.6*z; g.lineJoin='round'; vlBox(g,-92*z,-44*z,184*z,88*z,'#475569','#0f172a',22*z); vlBox(g,-84*z,-38*z,168*z,76*z,'#64748b','#1e293b',18*z);
  const dp=(c,dx,dy,w,h)=>{ vlBox(g,dx-w/2,dy-h/2,w,h,c,'#0f172a',3*z); }, on=c=>lit===c;   // the cross at left, B and A at right
  dp(on('L')?'#fde047':'#1e293b',-72*z,0,22*z,18*z); dp(on('R')?'#fde047':'#1e293b',-24*z,0,22*z,18*z); dp(on('U')?'#fde047':'#1e293b',-48*z,-22*z,18*z,22*z); dp(on('D')?'#fde047':'#1e293b',-48*z,22*z,18*z,22*z); dp('#0f172a',-48*z,0,16*z,16*z);
  vlDisc(g,30*z,12*z,14*z,on('B')?'#fde047':'#dc2626','#0f172a'); vlDisc(g,64*z,-8*z,14*z,on('A')?'#fde047':'#2563eb','#0f172a'); vlBox(g,-10*z,28*z,22*z,7*z,'#1e293b','#0f172a',3*z); g.restore();
  if(u>.14&&u<.66){ vlText(g,seq.slice(0,step+1).join(' '),x,fy-H*1.05,12*z,'#fde047','#1e1b4b'); }   // the code so far, over the pad
  g.restore(); }

// 19. Three-Tier Showstopper Cake Cart: { sparklerCount: 9, partyInfusionTint: '#ef4444' }
// Draws on the member (P1_VFX_SELF): a cart rolls in behind the party carrying a three-tier cake, sparklers fizz gold on the tiers, and embers in partyInfusionTint rise over the allies (the infused next attack).
const VL_CAKE_MS=2300;
function vlCake(g,x,y,u,z,p){ z*=.8; p=vlP(p,{sparklerCount:9,partyInfusionTint:'#ef4444'}); const H=vlH(p,z), fy=y+H*.5+4*z, n=vlClamp(Math.round(+p.sparklerCount)||9,3,16), a=vlFade(u,.2), roll=vlEase(vlClamp(u/.3,0,1)), cx=x+50*z+(1-roll)*220*z, tm=u*VL_CAKE_MS/1000, tint=/^#[0-9a-f]{6}$/i.test(p.partyInfusionTint)?p.partyInfusionTint:'#ef4444'; g.save(); g.globalAlpha=a; g.lineWidth=2*z; g.lineJoin='round';
  vlBox(g,cx-34*z,fy-18*z,68*z,7*z,'#92400e','#451a03',3*z); for(const wx of [-24,24]){ vlDisc(g,cx+wx*z,fy-5*z,6*z,'#1e293b','#000'); vlDisc(g,cx+wx*z,fy-5*z,2.4*z,'#cbd5e1'); }   // the cart
  const tiers=[[30,15,'#fbcfe8'],[22,14,'#fef3c7'],[14,13,'#fde68a']]; let ty=fy-18*z; const tops=[];
  tiers.forEach((t,i)=>{ vlBox(g,cx-t[0]*z,ty-t[1]*z,t[0]*2*z,t[1]*z,t[2],'#7c2d12',4*z); g.fillStyle='#f472b6'; for(let k=0;k<5;k++){ vlDisc(g,cx-t[0]*z+(k+.5)*t[0]*2*z/5,ty-t[1]*z,3*z,'#f472b6'); } ty-=t[1]*z; tops.push([cx,ty,t[0]]); });   // icing drips
  for(let i=0;i<n;i++){ const t=tops[i%3], sx=t[0]+(((i/3|0)%3)-1)*t[2]*.55*z, sy=t[1]; g.strokeStyle='#fef3c7'; g.lineWidth=2*z; g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx,sy-10*z); g.stroke();
    for(let r=0;r<5;r++){ const an=vlRnd(i*7+r)*VL_TAU+tm*9, ln=(3+vlRnd(i+r*3)*6+Math.sin(tm*21+i+r)*2)*z; g.strokeStyle=r%2?'#fde047':'#fff7ed'; g.lineWidth=1.6*z; g.beginPath(); g.moveTo(sx,sy-10*z); g.lineTo(sx+Math.cos(an)*ln,sy-10*z+Math.sin(an)*ln); g.stroke(); }
    g.fillStyle='#fde047'; vlStar(g,sx,sy-10*z,3.4*z,1*z,4,tm*5); g.fill(); }   // gold sparklers
  if(u>.3){ for(let i=0;i<16;i++){ const t=vlClamp(((u-.3)*1.5+vlRnd(i)*.5)%1,0,1), ex=x+(vlRnd(i+5)-.5)*90*z-t*30*z, ey=fy-H*.1-t*H*1.15; g.globalAlpha=a*Math.sin(t*Math.PI)*.9; vlDisc(g,ex,ey,(2.4+vlRnd(i+9)*2)*z,tint); } }   // embers carried to the allies
  g.restore(); }

// 20. Colossal Sky-Steamer & Diamond-Gold Dumpling: { targetAllyId, squashBounceFactor: .18, sparkleDensity: 28 }
// Draws on the member (P1_VFX_SELF), the ally who gets the free skill: a bamboo steamer unlatches overhead, a house-sized diamond-gold dumpling drops on the ally, squashes by squashBounceFactor and bounces softly, and sparkleDensity gold Pep sparkles burst out.
const VL_DUMP_MS=2400;
function vlDumpling(g,x,y,u,z,p){ p=vlP(p,{targetAllyId:'',squashBounceFactor:.18,sparkleDensity:28}); const H=vlH(p,z), fy=y+H*.5, R=H*.85, bf=vlClamp(+p.squashBounceFactor||.18,.05,.4), nsp=vlClamp(Math.round(+p.sparkleDensity)||28,6,50), a=vlFade(u,.2), top=-40*z; g.save(); g.globalAlpha=a; g.lineWidth=2*z; g.lineJoin='round';
  const lid=vlEase(vlClamp(u/.16,0,1)), fall=vlClamp((u-.14)/.2,0,1), tb=Math.max(0,u-.34), sq=fall>=1?bf*Math.exp(-tb*9)*Math.cos(tb*26):0, lc=fy-R*.72, cy=lc-(1-fall*fall)*(lc-top+R);   // the steamer opens, the dumpling falls and settles
  if(fall<1){ g.save(); g.translate(x,top); vlBox(g,-50*z,-4*z,100*z,16*z,'#d6a463','#7c4a1d',4*z); g.strokeStyle='#7c4a1d'; for(let i=-2;i<=2;i++){ g.beginPath(); g.moveTo(i*18*z,-4*z); g.lineTo(i*18*z,12*z); g.stroke(); }
    g.save(); g.translate(-50*z,-8*z); g.rotate(-lid*.9); vlBox(g,0,-12*z,100*z,12*z,'#e0b878','#7c4a1d',4*z); g.restore(); g.fillStyle='#fde047'; g.fillRect(-4*z,12*z,8*z,5*z); g.restore(); }   // the steamer with its lid thrown open and the latch
  const rx=R*(1+sq), ry=R*.78*(1-sq*1.1), gr=g.createRadialGradient(x-R*.3,cy-ry*.5,R*.1,x,cy,R*1.1); gr.addColorStop(0,'#fff7c2'); gr.addColorStop(.6,'#facc15'); gr.addColorStop(1,'#b45309'); g.globalAlpha=a*(fall>=1&&u>.5?.78:.92); g.fillStyle=gr; g.strokeStyle='#92400e'; g.lineWidth=3*z; g.beginPath(); g.ellipse(x,cy,rx,ry,0,0,VL_TAU); g.fill(); g.stroke();
  g.strokeStyle='rgba(120,53,15,.55)'; g.lineWidth=2*z; for(let i=-3;i<=3;i++){ g.beginPath(); g.moveTo(x+i*rx*.1,cy-ry*.92); g.quadraticCurveTo(x+i*rx*.2,cy-ry*.5,x+i*rx*.34,cy-ry*.18); g.stroke(); }   // the pleats
  g.fillStyle='rgba(255,255,255,.75)'; for(let i=0;i<5;i++){ const dx=x+(i-2)*rx*.3, dy=cy-ry*.1+(i%2)*ry*.25; vlPoly(g,[[dx,dy-6*z],[dx+4*z,dy],[dx,dy+6*z],[dx-4*z,dy]],'rgba(255,255,255,.8)'); }   // diamond facets
  if(u>.34){ for(let i=0;i<nsp;i++){ const t=vlClamp((u-.34)*1.7-vlRnd(i)*.3,0,1); if(t<=0||t>=1) continue; const an=vlRnd(i+40)*VL_TAU, d=(R*.9+t*R*1.1); g.globalAlpha=a*(1-t); g.fillStyle=i%3?'#fde047':'#fff'; vlStar(g,x+Math.cos(an)*d,cy+Math.sin(an)*d*.7,(3+vlRnd(i+7)*3)*z,1.1*z,4,t*5+i); g.fill(); } }   // Pep sparkles
  g.restore(); }

// 21. Giant Wooden Easel & Neon Portrait Reveal: { targetEnemyId, gemCount: 24, forcePeeve: 'Razzle' }
// Draws on the member (P1_VFX_SELF): an easel flips open beside it, a velvet drape falls off a neon portrait, neon watercolour waves blast left at the foe and gemCount craft gems fly with them; a chip names the forced pet peeve.
const VL_EASEL_MS=2300;
function vlEasel(g,x,y,u,z,p){ p=vlP(p,{targetEnemyId:'',gemCount:24,forcePeeve:'Razzle'}); const H=vlH(p,z), fy=y+H*.5, gc=vlClamp(Math.round(+p.gemCount)||24,6,40), a=vlFade(u,.2), ex=x-64*z, fl=vlBack(vlClamp(u/.18,0,1)), dr=vlEase(vlClamp((u-.16)/.2,0,1)), foe=vlFoeOf(p,x,y,z), tm=u*VL_EASEL_MS/1000; g.save(); g.globalAlpha=a; g.lineWidth=2.4*z; g.lineJoin='round'; g.lineCap='round';
  g.save(); g.translate(ex,fy); g.scale(fl,fl); g.strokeStyle='#5b3a1c'; g.lineWidth=4*z; g.beginPath(); g.moveTo(-26*z,0); g.lineTo(-10*z,-H*1.05); g.moveTo(26*z,0); g.lineTo(10*z,-H*1.05); g.moveTo(0,-H*.35); g.lineTo(0,2*z); g.stroke();   // the A-frame legs
  const cw=60*z, ch=74*z, cy=-H*.98; vlBox(g,-cw/2-4*z,cy-4*z,cw+8*z,ch+8*z,'#8b5a2b','#3f2411',4*z); vlBox(g,-cw/2,cy,cw,ch,'#f8fafc','#3f2411',2*z);   // the canvas in its frame
  if(u>.16){ const pa=vlClamp((u-.2)/.2,0,1); g.save(); g.globalAlpha=a*pa; g.strokeStyle='#22d3ee'; g.lineWidth=3*z; g.beginPath(); g.ellipse(0,cy+ch*.45,15*z,19*z,0,0,VL_TAU); g.stroke(); g.strokeStyle='#f472b6'; g.beginPath(); g.arc(0,cy+ch*.45-2*z,18*z,Math.PI*1.05,Math.PI*1.95); g.stroke(); g.fillStyle='#a78bfa'; vlDisc(g,-6*z,cy+ch*.4,2.6*z,'#a78bfa'); vlDisc(g,6*z,cy+ch*.4,2.6*z,'#a78bfa'); g.strokeStyle='#facc15'; g.beginPath(); g.arc(0,cy+ch*.52,6*z,.2,Math.PI-.2); g.stroke(); g.restore(); }   // the neon portrait
  if(dr<1){ g.fillStyle='#9f1239'; g.strokeStyle='#4c0519'; g.beginPath(); g.rect(-cw/2-3*z,cy-3*z+dr*(ch+10*z),cw+6*z,ch+6*z-dr*(ch*.2)); g.fill(); g.stroke(); g.fillStyle='#fbbf24'; g.fillRect(-cw/2-3*z,cy-3*z+dr*(ch+10*z),cw+6*z,4*z); }   // the velvet falls away
  g.restore();
  if(u>.34){ const bu=vlClamp((u-.34)/.4,0,1); for(let k=0;k<5;k++){ g.globalAlpha=a*(1-vlClamp((u-.78)/.22,0,1))*.8; g.strokeStyle=['#38bdf8','#f472b6','#a3e635','#facc15','#c084fc'][k]; g.lineWidth=6*z; g.beginPath(); const L=(ex-14*z-foe.x)*vlEase(bu); for(let s=0;s<=14;s++){ const px=ex-20*z-L*s/14, py=fy-H*.8+(foe.y-fy+H*.8)*(s/14)*vlEase(bu)+Math.sin(s*1.2-tm*10+k)*7*z+(k-2)*6*z; s?g.lineTo(px,py):g.moveTo(px,py); } g.stroke(); }   // watercolour waves
    g.lineWidth=1.2*z; for(let i=0;i<gc;i++){ const t=vlClamp((u-.36)*1.9-vlRnd(i)*.35,0,1); if(t<=0||t>=1) continue; const gx=ex-20*z-(ex-foe.x)*t, gy=fy-H*.8+(foe.y-fy+H*.8)*t-Math.sin(t*Math.PI)*34*z+(vlRnd(i+9)-.5)*26*z; g.globalAlpha=a; vlPoly(g,[[gx,gy-5*z],[gx+4*z,gy],[gx,gy+5*z],[gx-4*z,gy]],['#f472b6','#38bdf8','#fde047','#a3e635'][i%4],'#fff'); } }   // craft gems
  if(u>.74){ g.globalAlpha=a*vlClamp((u-.74)/.1,0,1); vlText(g,String(p.forcePeeve)+' Pet Peeve',foe.x,foe.y-(foe.h||90*z)*.6-18*z,12*z,'#e9d5ff','#4c1d95'); }
  g.restore(); }

// 22. Broadway Spotlights & Flashbulb Rig: { dimAlpha: .42, flashCount: 12, trackCaster: true }
// Draws on the member (P1_VFX_SELF): the clearing dims, three golden theatre spotlights swing in from above onto the member (they follow it when trackCaster is true, else they sit on its starting spot), and flashCount flashbulbs pop in the dark from the contact.
const VL_SPOT_MS=2200;
function vlSpot(g,x,y,u,z,p){ p=vlP(p,{dimAlpha:.42,flashCount:12,trackCaster:true}); const H=vlH(p,z), da=vlClamp(+p.dimAlpha||.42,.1,.7), fc=vlClamp(Math.round(+p.flashCount)||12,3,24), a=vlFade(u,.2), k=vlEase(vlClamp(u/.2,0,1)), lx=p.trackCaster?x:x+Math.sin(u*9)*10*z, ly=y; g.save();
  vlDim(g,da*a*k,'#0b0618',{x:lx,y:ly+H*.1,rx:H*.7,ry:H*.62});   // the screen darkens, the caster's spot stays lit
  for(let i=0;i<3;i++){ const sx=lx+(i-1)*H*1.5+Math.sin(u*5+i*2)*16*z, sw=(1-k)*60*z; g.globalAlpha=a*k*.5; const cg=g.createLinearGradient(0,-20*z,0,ly+H*.55); cg.addColorStop(0,'rgba(253,230,138,.9)'); cg.addColorStop(1,'rgba(253,230,138,.12)'); g.fillStyle=cg; g.beginPath(); g.moveTo(sx-6*z,-20*z); g.lineTo(sx+6*z,-20*z); g.lineTo(lx+H*.5+sw,ly+H*.55); g.lineTo(lx-H*.5-sw,ly+H*.55); g.closePath(); g.fill();   // a golden cone
    g.globalAlpha=a; vlBox(g,sx-10*z,-24*z,20*z,12*z,'#374151','#111827',3*z); vlDisc(g,sx,-10*z,6*z,'#fde68a','#a16207'); }
  g.globalAlpha=a*.6*k; g.fillStyle='rgba(253,224,71,.5)'; g.beginPath(); g.ellipse(lx,ly+H*.55,H*.62,H*.15,0,0,VL_TAU); g.fill();   // the pool of light on the floor
  for(let i=0;i<fc;i++){ const t=vlClamp((u-.34)*3-vlRnd(i)*1.4,0,1); if(t<=0||t>=1) continue; const fx=(vlRnd(i+3)*.9+.05)*VL_W, fy=ly-H*.9+vlRnd(i+11)*H*1.9; g.globalAlpha=a*(1-t); g.fillStyle='#fff'; vlStar(g,fx,fy,(8+14*(1-t))*z,1.4*z,4,0); g.fill(); g.globalAlpha=a*(1-t)*.5; vlDisc(g,fx,fy,(5+t*14)*z,'rgba(255,255,255,.5)'); }   // flashbulbs
  g.restore(); }

// 23. Sofa-Cushion Citadel & Twin-Lamby Lookouts: { partyShieldPct: .25, antiPushAnchor: true }
// Draws on the member (P1_VFX_SELF): sofa cushions pop up one by one into a pillow-fort wall across the party side, two Lambies sit on top as lookouts, and with antiPushAnchor a small anchor marks the fort as fixed on the timeline.
const VL_FORT_MS=1900;
function vlFort(g,x,y,u,z,p){ p=vlP(p,{partyShieldPct:.25,antiPushAnchor:true}); const H=vlH(p,z), fy=y+H*.5+3*z, a=vlFade(u,.22), rows=3, cols=6, cw=17*z, ch=H*.36, x0=x-cols*cw*.5+4*z, pal=['#f9a8d4','#93c5fd','#fde68a','#86efac','#fdba74','#c4b5fd']; g.save(); g.globalAlpha=a; g.lineWidth=2*z; g.lineJoin='round';
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const idx=r*cols+c, t=vlBack(vlClamp((u-idx*.03)/.16,0,1)); if(t<=0) continue; const px=x0+c*cw+(r%2?cw*.5:0), py=fy-(r+1)*ch*.8, w=cw*1.05, hh=ch*.92; g.save(); g.translate(px+w/2,py+hh/2); g.scale(t,t); vlBox(g,-w/2,-hh/2,w,hh,pal[(idx+r)%6],'#6b3410',hh*.35); g.fillStyle='rgba(255,255,255,.4)'; g.fillRect(-w*.3,-hh*.28,w*.5,hh*.14); g.fillStyle='#6b3410'; vlDisc(g,0,0,1.6*z,'#6b3410'); g.restore(); }   // the cushion bricks
  const lt=vlBack(vlClamp((u-.42)/.16,0,1)); if(lt>0){ for(const sx of [-1,1]){ vlProp(g,'tattered_lamby',x+sx*cw*1.6,fy-rows*ch*.8-9*z*lt,11*z*lt,sx*.12); } }   // the twin lookouts
  if(p.antiPushAnchor&&u>.55){ const ap=vlClamp((u-.55)/.14,0,1); g.globalAlpha=a*ap; const ax=x+cols*cw*.5+8*z, ay=fy-ch*1.6; g.strokeStyle='#0f766e'; g.lineWidth=3.2*z; g.beginPath(); g.arc(ax,ay-8*z,3.4*z,0,VL_TAU); g.moveTo(ax,ay-4*z); g.lineTo(ax,ay+12*z); g.moveTo(ax-6*z,ay); g.lineTo(ax+6*z,ay); g.moveTo(ax-10*z,ay+6*z); g.quadraticCurveTo(ax,ay+18*z,ax+10*z,ay+6*z); g.stroke(); }   // an anchor
  if(u>.3){ g.globalAlpha=a*vlClamp((u-.3)/.12,0,1); vlText(g,'+'+Math.round(vlClamp(+p.partyShieldPct||.25,0,1)*100)+'% shield',x,fy-rows*ch*.8-34*z,10*z,'#d1fae5','#064e3b'); }
  g.restore(); }

// 24. Star-Lit Kingdom of Ten-Thousand Blankets: { targetAllyId, warmWaveDelayTurns: 1, twinkleStars: 30 }
// Draws on the member (P1_VFX_SELF): a castle of quilted blankets rises behind the party under warm string lights (twinkleStars of them), the heal glow lifts off it, and a warm Sizzle wave rolls left at the foes; the wave lands warmWaveDelayTurns turns later, marked by pips.
const VL_CASTLE_MS=2700;
function vlCastle(g,x,y,u,z,p){ p=vlP(p,{targetAllyId:'',warmWaveDelayTurns:1,twinkleStars:30}); const H=vlH(p,z), fy=y+H*.5+4*z, ns=vlClamp(Math.round(+p.twinkleStars)||30,8,60), a=vlFade(u,.2), rise=vlEase(vlClamp(u/.3,0,1)), tm=u*VL_CASTLE_MS/1000, cx=x+8*z, cw=104*z, ch=H*1.5*rise; g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round';
  const blk=['#fb923c','#f472b6','#facc15','#fda4af','#fdba74'], tower=(tx,tw,th,c)=>{ vlBox(g,tx-tw/2,fy-th,tw,th,c,'#7c2d12',3*z); g.strokeStyle='rgba(124,45,18,.35)'; g.lineWidth=1.4*z; for(let i=1;i<4;i++){ g.beginPath(); g.moveTo(tx-tw/2,fy-th*i/4); g.lineTo(tx+tw/2,fy-th*i/4); g.stroke(); } for(let k=0;k<3;k++){ g.fillStyle=c; g.strokeStyle='#7c2d12'; g.lineWidth=2*z; g.fillRect(tx-tw/2+k*tw/3,fy-th-7*z,tw/3-2*z,7*z); } };   // a quilted tower with battlements
  tower(cx-cw*.38,34*z,ch*.8,blk[0]); tower(cx+cw*.38,34*z,ch*.8,blk[1]); tower(cx,56*z,ch,blk[2]); vlBox(g,cx-cw*.22,fy-ch*.34,cw*.44,ch*.34,'#7c2d12','#431407',16*z);   // the gate
  vlPoly(g,[[cx-12*z,fy-ch],[cx+12*z,fy-ch],[cx,fy-ch-24*z*rise]],'#be123c','#4c0519'); g.strokeStyle='#4c0519'; g.beginPath(); g.moveTo(cx,fy-ch-24*z*rise); g.lineTo(cx,fy-ch-36*z*rise); g.stroke(); vlPoly(g,[[cx,fy-ch-36*z*rise],[cx+12*z,fy-ch-31*z*rise],[cx,fy-ch-26*z*rise]],'#fde047','#a16207');   // a roof and a flag
  for(let i=0;i<ns;i++){ const sx=cx-cw*.55+vlRnd(i)*cw*1.1, sy=fy-ch*(.1+vlRnd(i+20)*.95), tw=.5+.5*Math.sin(tm*6+i*2.1); if(sy>fy-6*z) continue; g.globalAlpha=a*tw*rise; g.fillStyle=i%3?'#fef08a':'#fff'; vlStar(g,sx,sy,(2.4+tw*2.6)*z,.7*z,4,0); g.fill(); }   // string lights twinkling
  if(u>.5){ const wu=vlClamp((u-.5)/.4,0,1), foe=vlFoeOf(p,x,y,z); for(let k=0;k<3;k++){ g.globalAlpha=a*(1-wu)*.8; g.strokeStyle=['#fb923c','#fbbf24','#f87171'][k]; g.lineWidth=(6-k)*z; g.beginPath(); g.ellipse(cx-cw*.5-(cx-cw*.5-foe.x)*vlEase(wu)*.9,fy-H*.45,(10+wu*30)*z,(26+wu*30)*z,0,Math.PI*.5,Math.PI*1.5); g.stroke(); } }   // the warm wave rolls left
  vlPipRow(g,cx-cw*.2,fy+11*z,vlClamp(Math.round(+p.warmWaveDelayTurns)||1,1,3),z);
  g.restore(); }

// 25. Trampoline-Sized Pink Whoopee Cushion: { inflateMs: 650, blastScale: 2.1, breakStances: true }
// Draws on the foe (flat on its floor): the cushion slides in from the right under the enemy line, inflates over inflateMs, then goes off in a PFFFFRT! shockwave of blastScale and, when breakStances is true, cracks break the foes' stances.
const VL_WHOOPEE_MS=2000;
function vlWhoopee(g,x,y,u,z,p){ p=vlP(p,{inflateMs:650,blastScale:2.1,breakStances:true}); const H=vlH(p,z), fy=y+H*.5, inf=vlClamp(+p.inflateMs||650,300,1200)/VL_WHOOPEE_MS, bs=vlClamp(+p.blastScale||2.1,1,3), sl=vlEase(vlClamp(u/.2,0,1)), pu=vlClamp((u-.2)/inf,0,1), bu=vlClamp((u-.2-inf)/.45,0,1), a=vlFade(u,.18), cx=x+(1-sl)*260*z, rx=(40+pu*20)*z*(bu>0?1-bu*.4:1), ry=(10+pu*16)*z*(bu>0?1-bu*.6:1); g.save(); g.globalAlpha=a; g.lineWidth=2.4*z; g.lineJoin='round';
  g.fillStyle='rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx,fy+4*z,rx*1.05,5*z,0,0,VL_TAU); g.fill();
  const gr=g.createRadialGradient(cx-rx*.3,fy-ry*.8,2*z,cx,fy-ry*.4,rx*1.1); gr.addColorStop(0,'#fbcfe8'); gr.addColorStop(1,'#ec4899'); g.fillStyle=gr; g.strokeStyle='#9d174d'; g.beginPath(); g.ellipse(cx,fy-ry*.5,rx,ry+4*z,0,0,VL_TAU); g.fill(); g.stroke();   // the cushion
  vlDisc(g,cx+rx*.62,fy-ry*.4,3.4*z,'#9d174d'); g.strokeStyle='#9d174d'; g.beginPath(); g.moveTo(cx-rx*.55,fy-ry*.9); g.quadraticCurveTo(cx-rx*.2,fy-ry*1.5,cx+rx*.1,fy-ry*.95); g.stroke();
  if(bu>0){ for(let k=0;k<3;k++){ const ru=vlClamp(bu*1.2-k*.16,0,1); if(ru<=0||ru>=1) continue; g.globalAlpha=a*(1-ru); g.strokeStyle=k%2?'#f9a8d4':'#db2777'; g.lineWidth=(7-k*2)*z; g.beginPath(); g.ellipse(cx,fy,rx*(1+ru*bs*1.6),ry*.7*(1+ru*bs*1.6)+4*z,0,0,VL_TAU); g.stroke(); }   // the shockwave
    for(let i=0;i<10;i++){ const t=vlClamp(bu*1.2-vlRnd(i)*.2,0,1); if(t<=0||t>=1) continue; g.globalAlpha=a*(1-t)*.8; vlDisc(g,cx+(vlRnd(i+4)-.5)*rx*3.4*bs*t,fy-t*30*z-vlRnd(i)*10*z,(5+t*9)*z,'rgba(244,114,182,.7)'); }
    g.globalAlpha=a; vlText(g,'PFFFFRT!',cx,fy-H*.75-bu*14*z,Math.round((16+bs*5)*z/1.8),'#fbcfe8','#831843');
    if(p.breakStances&&bu>.2){ g.globalAlpha=a*vlClamp((bu-.2)/.2,0,1)*(1-Math.max(0,(u-.85)/.15)); g.strokeStyle='#fde047'; g.lineWidth=3*z; g.beginPath(); g.moveTo(x-16*z,fy-H*.7); g.lineTo(x-4*z,fy-H*.5); g.lineTo(x-14*z,fy-H*.34); g.lineTo(x,fy-H*.16); g.moveTo(x+14*z,fy-H*.72); g.lineTo(x+4*z,fy-H*.52); g.lineTo(x+12*z,fy-H*.36); g.stroke(); } }   // cracks: the stance breaks
  g.restore(); }

// 26. Full-House 8-Seat Sunday Dinner Table: { durationRounds: 2, candleFlicker: true }
// Draws on the member (P1_VFX_SELF): a long table with eight chairs glides across the party side and settles, candlelight warms every ally (flickering when candleFlicker is true), and pips mark the rounds it stays.
const VL_TABLE_MS=3000;
function vlTable(g,x,y,u,z,p){ p=vlP(p,{durationRounds:2,candleFlicker:true}); const H=vlH(p,z), fy=y+H*.5+6*z, a=vlFade(u,.18), rd=vlClamp(Math.round(+p.durationRounds)||2,1,3), gl=vlEase(vlClamp(u/.28,0,1)), cx=x+8*z+(1-gl)*260*z, tw=112*z, tm=u*VL_TABLE_MS/1000; g.save(); g.globalAlpha=a; g.lineWidth=2*z; g.lineJoin='round';
  const fl=p.candleFlicker?.7+.3*Math.sin(tm*17)*Math.sin(tm*5.3):.85; g.globalAlpha=a*fl*.4*gl; const lg=g.createRadialGradient(cx,fy-H*.5,4*z,cx,fy-H*.5,H*1.3); lg.addColorStop(0,'rgba(253,186,116,.85)'); lg.addColorStop(1,'rgba(253,186,116,0)'); g.fillStyle=lg; g.beginPath(); g.arc(cx,fy-H*.5,H*1.3,0,VL_TAU); g.fill(); g.globalAlpha=a;   // candlelight over the party
  for(let i=0;i<8;i++){ const cxx=cx-tw*.42+(i%4)*tw*.28, back=i<4; g.save(); g.translate(cxx,fy-(back?12*z:-2*z)); vlBox(g,-7*z,-26*z*(back?1:.6),14*z,22*z*(back?1:.6),'#a16207','#451a03',2*z); g.fillStyle='#451a03'; g.fillRect(-7*z,-4*z,14*z,3*z); g.fillRect(-6*z,-1*z,2*z,8*z); g.fillRect(4*z,-1*z,2*z,8*z); g.restore(); }   // eight chairs
  vlBox(g,cx-tw/2,fy-34*z,tw,9*z,'#92400e','#451a03',3*z); g.fillStyle='#451a03'; g.fillRect(cx-tw/2+10*z,fy-26*z,6*z,26*z); g.fillRect(cx+tw/2-16*z,fy-26*z,6*z,26*z); vlBox(g,cx-tw*.46,fy-38*z,tw*.92,5*z,'#fef3c7','#92400e',2*z);   // the table and its cloth
  for(let i=0;i<3;i++){ const px=cx+(i-1)*tw*.28; vlBox(g,px-2*z,fy-52*z,4*z,14*z,'#fef3c7','#92400e',1*z); const fh=(6+Math.sin(tm*18+i*2)*(p.candleFlicker?2:0))*z; vlPoly(g,[[px-3*z,fy-52*z],[px,fy-52*z-fh*1.6],[px+3*z,fy-52*z]],'#fbbf24'); }   // candles
  if(u>.35){ for(let i=0;i<7;i++){ const t=vlClamp(((u-.35)*1.3+vlRnd(i)*.6)%1,0,1); g.globalAlpha=a*Math.sin(t*Math.PI)*.85; g.fillStyle=i%2?'#fde68a':'#fb923c'; vlStar(g,cx+(vlRnd(i+8)-.5)*tw*.9,fy-H*.2-t*H*.7,3.2*z,1*z,4,t*4); g.fill(); } }   // little heal and boost sparks
  g.globalAlpha=a; vlPipRow(g,cx-5*z*(rd-1),fy+13*z,rd,z);
  g.restore(); }

// 27. Rising Full Moon & Moonlight Embrace: { targetAllyId, moonRiseMs: 1800, sizzleShave: 2 }
// Draws on the member (P1_VFX_SELF): the screen cools to night blue, a radiant full moon rises over the party side (moonRiseMs), a column of moonlight falls on the target ally, and a warm Sizzle shockwave rolls left; sizzleShave pips show the Composure it takes.
const vlMoonMs=p=>Math.round(vlClamp(+(p&&p.moonRiseMs)||1800,800,3000)+900);
function vlMoon(g,x,y,u,z,p){ p=vlP(p,{targetAllyId:'',moonRiseMs:1800,sizzleShave:2}); const H=vlH(p,z), fy=y+H*.5, tot=vlMoonMs(p), rise=vlEase(vlClamp(u*tot/vlClamp(+p.moonRiseMs||1800,800,3000),0,1)), a=vlFade(u,.18), mx=x+34*z, my=VL_HT*.62-rise*VL_HT*.46, R=34*z, tm=u*tot/1000, sh=vlClamp(Math.round(+p.sizzleShave)||2,0,4); g.save();
  vlDim(g,.34*a*rise,'#0a1033'); g.globalAlpha=a*rise;
  const hg=g.createRadialGradient(mx,my,R*.6,mx,my,R*3.2); hg.addColorStop(0,'rgba(254,243,199,.75)'); hg.addColorStop(1,'rgba(254,243,199,0)'); g.fillStyle=hg; g.beginPath(); g.arc(mx,my,R*3.2,0,VL_TAU); g.fill();   // the glow round it
  const mg=g.createRadialGradient(mx-R*.3,my-R*.3,R*.1,mx,my,R); mg.addColorStop(0,'#fffbeb'); mg.addColorStop(1,'#fde68a'); g.fillStyle=mg; g.strokeStyle='#d97706'; g.lineWidth=2.4*z; g.beginPath(); g.arc(mx,my,R,0,VL_TAU); g.fill(); g.stroke();
  g.fillStyle='rgba(180,140,80,.35)'; vlDisc(g,mx-R*.3,my-R*.1,R*.18,'rgba(180,140,80,.35)'); vlDisc(g,mx+R*.25,my+R*.25,R*.24,'rgba(180,140,80,.3)'); vlDisc(g,mx+R*.1,my-R*.45,R*.12,'rgba(180,140,80,.3)');
  if(rise>.7){ const ca=vlClamp((rise-.7)/.3,0,1); g.globalAlpha=a*ca*.5; const cg=g.createLinearGradient(0,my,0,fy); cg.addColorStop(0,'rgba(254,243,199,.9)'); cg.addColorStop(1,'rgba(254,243,199,.1)'); g.fillStyle=cg; g.beginPath(); g.moveTo(mx-R*.6,my+R*.6); g.lineTo(mx+R*.6,my+R*.6); g.lineTo(x+H*.5,fy); g.lineTo(x-H*.5,fy); g.closePath(); g.fill(); }   // moonlight on the ally
  if(u*tot>vlClamp(+p.moonRiseMs||1800,800,3000)*.8){ const wu=vlClamp((u*tot-vlClamp(+p.moonRiseMs||1800,800,3000)*.8)/(tot*.25),0,1); for(let k=0;k<3;k++){ g.globalAlpha=a*(1-wu)*.7; g.strokeStyle=['#fde68a','#fb923c','#fbbf24'][k]; g.lineWidth=(7-k*2)*z; g.beginPath(); g.ellipse(x-wu*(x+40*z)*.95,fy-H*.45,(8+wu*26)*z,(24+wu*40)*z,0,Math.PI*.5,Math.PI*1.5); g.stroke(); } if(sh&&wu>.1){ g.globalAlpha=a*(1-wu); vlPipRow(g,x-wu*(x+40*z)*.9-5*z*(sh-1),fy-H*.45-60*z,sh,z); } }   // the warm shockwave
  for(let i=0;i<14;i++){ const sx=vlRnd(i)*VL_W, sy=vlRnd(i+9)*VL_HT*.5, tw=.5+.5*Math.sin(tm*5+i*3); g.globalAlpha=a*rise*tw*.9; g.fillStyle='#fff'; vlStar(g,sx,sy,2.6*z,.6*z,4,0); g.fill(); }
  g.restore(); }

// 28. Fifty-Year Sparkling Soapy Tsunami: { sweepMs: 1650, wipeHazards: true, wipeBuffs: true }
// Draws on the foe: a wall of soapy water surges right to left across the whole enemy clearing over sweepMs, bubbles riding its crest; behind it the foes gleam (sparkles) and drip. wipeHazards and wipeBuffs add small struck-through chips (hazard, buff) that the wave scrubs away.
const vlTideMs=p=>Math.round(vlClamp(+(p&&p.sweepMs)||1650,800,3000)+450);
function vlTsunami(g,x,y,u,z,p){ p=vlP(p,{sweepMs:1650,wipeHazards:true,wipeBuffs:true}); const H=vlH(p,z), fy=y+H*.5+8*z, tot=vlTideMs(p), su=vlClamp(u*tot/vlClamp(+p.sweepMs||1650,800,3000),0,1), wx=VL_W+110*z-(VL_W+260*z)*su, a=vlFade(u,.2), wh=H*2.1, tm=u*tot/1000; g.save(); g.globalAlpha=a; g.lineWidth=2.4*z; g.lineJoin='round';
  if(su>0&&su<1){ const wg=g.createLinearGradient(wx-120*z,0,wx+60*z,0); wg.addColorStop(0,'rgba(186,230,253,.15)'); wg.addColorStop(.35,'rgba(56,189,248,.8)'); wg.addColorStop(1,'rgba(2,132,199,.92)'); g.fillStyle=wg; g.strokeStyle='#0369a1'; g.beginPath(); g.moveTo(wx+130*z,fy+6*z); g.lineTo(wx+130*z,fy-wh*.3);
    for(let i=0;i<=12;i++){ const q=i/12, px=wx+130*z-q*190*z, curl=Math.sin(q*Math.PI)*wh*(1-q*.55)+Math.sin(q*14+tm*9)*5*z; g.lineTo(px,fy-wh*.3-curl*.7); } g.lineTo(wx-60*z,fy+6*z); g.closePath(); g.fill(); g.stroke();   // the wall of water with its curling crest
    for(let i=0;i<22;i++){ const bx=wx-40*z+vlRnd(i)*160*z, by=fy-vlRnd(i+9)*wh*.85, br=(3+vlRnd(i+4)*6)*z; g.globalAlpha=a*.85; vlDisc(g,bx,by,br,'rgba(255,255,255,.35)','#fff'); }   // soap bubbles in it
    g.globalAlpha=a; g.fillStyle='#fff'; for(let i=0;i<9;i++){ vlDisc(g,wx-52*z+vlRnd(i+30)*40*z,fy-wh*.3-Math.sin(i*.7)*wh*.45*(1-i*.04)-vlRnd(i)*8*z,(5+vlRnd(i+2)*5)*z,'#fff','#bae6fd'); }   // foam along the lip
    if(p.wipeHazards||p.wipeBuffs){ const chips=[]; if(p.wipeHazards) chips.push(['hazard','#facc15']); if(p.wipeBuffs) chips.push(['buff','#4ade80']); chips.forEach((c,i)=>{ const cx=x-30*z+i*54*z, gone=wx<cx+40*z; g.globalAlpha=a*(gone?.25:1); vlBox(g,cx-22*z,y-H*.95-i*2*z,44*z,13*z,c[1],'#111827',5*z); vlText(g,c[0],cx,y-H*.95+6.5*z-i*2*z,8*z,'#111','#fff',2*z); if(gone){ g.strokeStyle='#dc2626'; g.lineWidth=2.4*z; g.beginPath(); g.moveTo(cx-24*z,y-H*.95+6*z-i*2*z); g.lineTo(cx+24*z,y-H*.95+6*z-i*2*z); g.stroke(); } }); } }   // the chips it scrubs away
  if(su>.55){ const gu=vlClamp((su-.55)/.45,0,1); for(let i=0;i<10;i++){ const t=vlClamp(gu*1.1-vlRnd(i)*.35+(u>.9?0:0),0,1); if(t<=0||t>=1) continue; g.globalAlpha=a*Math.sin(t*Math.PI); g.fillStyle=i%2?'#fff':'#bae6fd'; vlStar(g,x+(vlRnd(i+5)-.5)*90*z,y+(vlRnd(i+13)-.5)*H*1.2,(4+vlRnd(i)*4)*z,1.2*z,4,t*4); g.fill(); } }   // the foes gleam
  g.restore(); }

// 29. Gleaming Brass-and-Iron Rikers Warden Gates: { dropMs: 480, screenShakePx: 6, durationRounds: 2 }
// Draws on the member (P1_VFX_SELF): a tall brass-and-iron gate thunders down in front of the party (the foe side of the member) in dropMs, the gate and the ground shake by screenShakePx as it lands, the keys ring clangs, and one pip per round shows how long it stands.
const VL_GATES_MS=2200;
function vlGates(g,x,y,u,z,p){ p=vlP(p,{dropMs:480,screenShakePx:6,durationRounds:2}); const H=vlH(p,z), fy=y+H*.5+4*z, dm=vlClamp(+p.dropMs||480,200,900)/VL_GATES_MS, sk=vlClamp(+p.screenShakePx||6,0,14), rd=vlClamp(Math.round(+p.durationRounds)||2,1,3), a=vlFade(u,.2), dd=vlClamp(u/dm,0,1), land=u>=dm, since=Math.max(0,u-dm), shake=land?Math.round(Math.sin(since*VL_GATES_MS*.06)*sk*Math.max(0,1-since*VL_GATES_MS/360))*z/1.8:0, gx=x-42*z, gw=46*z, gh=H*1.5, top=fy-gh-(1-dd*dd)*(fy-gh+40*z); g.save(); g.globalAlpha=a; g.translate(shake,0); g.lineWidth=2*z; g.lineJoin='round';
  g.fillStyle='#374151'; for(let i=0;i<6;i++){ const bx=gx-gw/2+i*gw/5; vlBox(g,bx-2*z,top,4*z,gh,'#4b5563','#111827',1.6*z); vlPoly(g,[[bx-3.4*z,top],[bx,top-9*z],[bx+3.4*z,top]],'#9ca3af','#111827'); }   // the iron bars with spear tips
  vlBox(g,gx-gw/2-6*z,top+gh*.18,gw+12*z,7*z,'#b45309','#451a03',2*z); vlBox(g,gx-gw/2-6*z,top+gh*.66,gw+12*z,7*z,'#b45309','#451a03',2*z); vlBox(g,gx-gw/2-8*z,top-3*z,gw+16*z,6*z,'#d97706','#451a03',2*z);   // brass crossbars
  vlDisc(g,gx,top+gh*.45,7*z,'#f59e0b','#451a03'); g.strokeStyle='#451a03'; g.fillStyle='#451a03'; g.fillRect(gx-1*z,top+gh*.45-2*z,2*z,5*z);   // the lock
  if(land){ g.globalAlpha=a*Math.max(0,1-since*VL_GATES_MS/500); g.fillStyle='rgba(226,232,240,.8)'; for(let i=0;i<7;i++){ const t=since*VL_GATES_MS/500; vlDisc(g,gx+(i-3)*13*z*(1+t),fy-2*z-t*10*z*vlRnd(i),(4+t*8)*z,'rgba(203,213,225,.6)'); } if(since*VL_GATES_MS<260){ g.globalAlpha=a*(1-since*VL_GATES_MS/260); g.fillStyle='#fde047'; vlStar(g,gx,fy-6*z,22*z,4*z,8,0); g.fill(); } }   // dust and a clang flash
  g.restore(); g.save(); g.globalAlpha=a; if(land){ const ka=vlClamp(since*2.4,0,1); g.translate(x+6*z,y-H*.05); g.rotate(Math.sin(since*VL_GATES_MS*.02)*.18*(1-ka)); g.strokeStyle='#92400e'; g.lineWidth=2.4*z; g.beginPath(); g.arc(0,0,7*z,0,VL_TAU); g.stroke(); for(let k=0;k<3;k++){ g.fillStyle='#fbbf24'; g.fillRect(8*z+k*5*z,-2*z,3*z,9*z); } }   // the ring of brass keys
  g.restore(); g.save(); g.globalAlpha=a; vlPipRow(g,gx-5*z*(rd-1),fy+13*z,rd,z); g.restore(); }

// 30. Cattail Pier Pilings, Swells & Breaching Catch (NO BOAT): { fishTier: 'striper'|'leviathan', tallySpent: 0..4, showFoldingChair: true }
// Draws on the foe: Long Island Sound swells surge on the left, weathered pier pilings stand on the member's edge with a shore folding chair (showFoldingChair), and the catch breaches: a trophy striper leaps and arcs, or a whale-sized leviathan breaches behind the foe. Canon lock: there is no boat anywhere in it. tallySpent pips show the tally.
const VL_PIER_MS=2600;
function vlPier(g,x,y,u,z,p){ p=vlP(p,{fishTier:'striper',tallySpent:0,showFoldingChair:true}); const H=vlH(p,z), fy=y+H*.5+8*z, lev=p.fishTier==='leviathan', ts=vlClamp(Math.round(+p.tallySpent)||0,0,4), a=vlFade(u,.18), fr=vlFrom(p,x,y,z), tm=u*VL_PIER_MS/1000, sw=vlEase(vlClamp(u/.25,0,1)); g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round';
  for(let k=0;k<3;k++){ g.globalAlpha=a*(.55+k*.15)*sw; g.fillStyle=['#0c4a6e','#0369a1','#38bdf8'][k]; g.beginPath(); g.moveTo(-20*z,fy+10*z); for(let s=0;s<=16;s++){ const px=-20*z+s*(x+120*z+20*z)/16; g.lineTo(px,fy-(18+k*10)*z*sw-Math.sin(s*.9+tm*3.2+k*1.5)*(8+k*2)*z); } g.lineTo(x+120*z,fy+10*z); g.closePath(); g.fill(); }   // the swells surging on the left
  const bx=lev?x-30*z:x; if(u>.3){ const bu=vlClamp((u-.3)/.5,0,1); g.globalAlpha=a; if(lev){ const rise=Math.sin(bu*Math.PI), lx=bx-20*z, ly=fy-rise*H*1.3; g.save(); g.translate(lx,ly); g.rotate(-.25+bu*.5); g.fillStyle='#1e293b'; g.strokeStyle='#020617'; g.beginPath(); g.moveTo(-96*z,18*z); g.quadraticCurveTo(-60*z,-34*z,10*z,-30*z); g.quadraticCurveTo(70*z,-26*z,100*z,12*z); g.quadraticCurveTo(40*z,32*z,-96*z,18*z); g.closePath(); g.fill(); g.stroke(); g.fillStyle='#e2e8f0'; g.beginPath(); g.moveTo(-40*z,16*z); g.quadraticCurveTo(10*z,32*z,70*z,12*z); g.quadraticCurveTo(10*z,24*z,-40*z,16*z); g.fill(); vlPoly(g,[[-96*z,18*z],[-132*z,-8*z],[-116*z,30*z]],'#1e293b','#020617'); vlDisc(g,52*z,-8*z,3.2*z,'#fff','#020617'); g.restore();   // a whale-sized shape breaching
      for(let i=0;i<14;i++){ const t=vlClamp(bu*1.2-vlRnd(i)*.3,0,1); if(t<=0||t>=1) continue; g.globalAlpha=a*(1-t); vlDisc(g,lx+(vlRnd(i+4)-.5)*190*z,fy-t*70*z*(1+vlRnd(i)),(2.4+vlRnd(i+9)*3)*z,'#e0f2fe'); } }
    else { const fx0=x-90*z, fx1=x+10*z, fx=vlLerp(fx1,fx0,bu), fyy=fy-Math.sin(bu*Math.PI)*H*.95; g.save(); g.translate(fx,fyy); g.rotate(-(1-bu*2)*.8); g.fillStyle='#94a3b8'; g.strokeStyle='#1e293b'; g.beginPath(); g.ellipse(0,0,26*z,9*z,0,0,VL_TAU); g.fill(); g.stroke(); vlPoly(g,[[26*z,0],[38*z,-9*z],[38*z,9*z]],'#64748b','#1e293b'); g.strokeStyle='#1e293b'; g.lineWidth=1.6*z; for(let l=0;l<4;l++){ g.beginPath(); g.moveTo(-14*z+l*8*z,-6*z); g.lineTo(-14*z+l*8*z,6*z); g.stroke(); } vlDisc(g,-18*z,-2*z,2*z,'#fff','#000'); g.restore(); } }   // the striper leaps and arcs
  g.globalAlpha=a; for(let i=0;i<3;i++){ const px=fr.x+30*z-i*20*z; vlBox(g,px-5*z,fy-H*.55+i*4*z,10*z,H*.55+14*z-i*4*z,'#78716c','#292524',2*z); g.strokeStyle='#44403c'; g.lineWidth=1.2*z; g.beginPath(); g.moveTo(px-3*z,fy-H*.4); g.lineTo(px+3*z,fy-H*.3); g.stroke(); }   // weathered pilings
  if(p.showFoldingChair){ const cx=fr.x+54*z, cy=fy; g.strokeStyle='#334155'; g.lineWidth=2.4*z; g.beginPath(); g.moveTo(cx-10*z,cy); g.lineTo(cx+8*z,cy-22*z); g.moveTo(cx+10*z,cy); g.lineTo(cx-8*z,cy-22*z); g.moveTo(cx-10*z,cy-22*z); g.lineTo(cx-12*z,cy-44*z); g.stroke(); vlBox(g,cx-12*z,cy-26*z,24*z,5*z,'#2563eb','#1e293b',2*z); vlBox(g,cx-14*z,cy-50*z,8*z,24*z,'#2563eb','#1e293b',2*z); }   // the shore folding chair
  if(lev||ts>0){ vlPipRow(g,x-5*z*(Math.max(ts,1)-1),fy+14*z,Math.max(ts,lev?1:0),z); }
  g.restore(); }

// 31. Sentient Back-Garden Ghost Pepper: { coneWidthDeg: 42, instantBurnTicks: 2 }
// Draws on the member (P1_VFX_SELF): a ghost pepper with a face floats forward off the member's open palm, swells, and roars a cone of Sizzle fire left across the foes, coneWidthDeg wide; instantBurnTicks flame pips show the burn ticks it triggers.
const VL_PEPPER_MS=2300;
function vlPepper(g,x,y,u,z,p){ p=vlP(p,{coneWidthDeg:42,instantBurnTicks:2}); const H=vlH(p,z), a=vlFade(u,.18), fl=vlEase(vlClamp(u/.3,0,1)), px=x-14*z-fl*44*z, py=y-H*.15-fl*H*.22, sw=1+.25*vlClamp((u-.25)/.12,0,1), cw=vlClamp(+p.coneWidthDeg||42,15,80)*Math.PI/180, nt=vlClamp(Math.round(+p.instantBurnTicks)||2,0,4), tm=u*VL_PEPPER_MS/1000, foe=vlFoeOf(p,x,y,z); g.save(); g.globalAlpha=a; g.lineJoin='round'; g.lineWidth=2.2*z;
  g.fillStyle='#fde68a'; g.strokeStyle='#92400e'; vlBox(g,x-24*z,y+H*.1,30*z,7*z,'#fcd9b0','#92400e',3*z);   // the open palm
  if(u>.3){ const ru=vlClamp((u-.3)/.5,0,1), ang=Math.atan2(foe.y-py,foe.x-px), L=Math.hypot(foe.x-px,foe.y-py)+40*z, mx=px-12*z; for(let k=0;k<3;k++){ g.globalAlpha=a*(1-Math.max(0,(u-.82)/.18))*(.75-k*.14); g.fillStyle=['#dc2626','#f97316','#fde047'][k]; const sp=cw*(1-k*.28), len=L*vlEase(ru)*(1-k*.1); g.beginPath(); g.moveTo(mx,py); for(let s=0;s<=10;s++){ const q=s/10, an=ang-sp*.5+sp*q, r=len*(.92+.08*Math.sin(q*15+tm*18+k)); g.lineTo(mx+Math.cos(an)*r,py+Math.sin(an)*r); } g.closePath(); g.fill(); }   // the roaring cone
    for(let i=0;i<12;i++){ const t=vlClamp(ru*1.2-vlRnd(i)*.4,0,1); if(t<=0||t>=1) continue; const an=ang+(vlRnd(i+3)-.5)*cw*.8, r=L*t; g.globalAlpha=a*(1-t); vlDisc(g,mx+Math.cos(an)*r,py+Math.sin(an)*r,(3+vlRnd(i+9)*4)*z,i%2?'#fde047':'#fb923c'); }   // embers
    for(let i=0;i<nt;i++){ const t=vlClamp((ru-.5)*2-i*.25,0,1); if(t<=0) continue; g.globalAlpha=a*t*(1-Math.max(0,(u-.86)/.14)); vlPoly(g,[[foe.x-8*z+i*16*z,foe.y-(foe.h||90*z)*.7],[foe.x+i*16*z,foe.y-(foe.h||90*z)*.7-14*z],[foe.x+8*z+i*16*z,foe.y-(foe.h||90*z)*.7]],'#f97316','#7c2d12'); } }   // burn tick flames over the foe
  g.globalAlpha=a; g.save(); g.translate(px,py); g.scale(sw,sw); g.rotate(-.5); g.fillStyle='#dc2626'; g.strokeStyle='#450a0a'; g.beginPath(); g.moveTo(-6*z,-12*z); g.quadraticCurveTo(-20*z,2*z,-6*z,24*z); g.quadraticCurveTo(14*z,34*z,16*z,10*z); g.quadraticCurveTo(18*z,-8*z,8*z,-12*z); g.closePath(); g.fill(); g.stroke(); g.fillStyle='#166534'; g.strokeStyle='#052e16'; g.beginPath(); g.moveTo(-8*z,-12*z); g.lineTo(0,-24*z); g.lineTo(10*z,-12*z); g.closePath(); g.fill(); g.stroke();
  g.fillStyle='#fff'; vlDisc(g,-4*z,2*z,3.2*z,'#fff','#450a0a'); vlDisc(g,8*z,4*z,3.2*z,'#fff','#450a0a'); vlDisc(g,-5*z,3*z,1.4*z,'#111'); vlDisc(g,7*z,5*z,1.4*z,'#111'); g.strokeStyle='#450a0a'; g.lineWidth=2*z; g.beginPath(); g.moveTo(-9*z,-3*z); g.lineTo(-1*z,0); g.moveTo(11*z,-1*z); g.lineTo(5*z,1*z); g.stroke(); if(u>.3){ g.fillStyle='#450a0a'; g.beginPath(); g.ellipse(2*z,15*z,5*z,7*z*(.5+.5*Math.sin(tm*20)),0,0,VL_TAU); g.fill(); } g.restore();   // a ghost pepper with a face
  g.restore(); }

// 32. Leaning Museum-Sized Grand Terracotta Amphora: { hitsToAbsorb: 2, shardCount: 36, dualFlavor: ['Clobber','Razzle'] }
// Draws on the foe, in the gap between the formations: a giant amphora rises calmly and leans, absorbs hitsToAbsorb hits (a crack flash for each), then shatters outward across the foes in shardCount shards, half in each flavour of dualFlavor (orange Clobber, purple Razzle).
const VL_AMPH_MS=2900;
function vlAmphora(g,x,y,u,z,p){ p=vlP(p,{hitsToAbsorb:2,shardCount:36,dualFlavor:['Clobber','Razzle']}); const H=vlH(p,z), fy=y+H*.5+4*z, fr=vlFrom(p,x,y,z), mx=vlClamp((x+fr.x)/2,60*z,VL_W-60*z), hits=vlClamp(Math.round(+p.hitsToAbsorb)||2,1,4), ns=vlClamp(Math.round(+p.shardCount)||36,8,60), rise=vlEase(vlClamp(u/.24,0,1)), sh=u>=.62, su=vlClamp((u-.62)/.38,0,1), a=vlFade(u,.14), AH=H*1.9, fl=Array.isArray(p.dualFlavor)&&p.dualFlavor.length?p.dualFlavor:['Clobber','Razzle']; g.save(); g.lineWidth=2.4*z; g.lineJoin='round';
  if(!sh){ g.globalAlpha=a; g.save(); g.translate(mx,fy); g.rotate(-.1); g.translate(0,(1-rise)*AH*.6); const w=AH*.46;
    g.beginPath(); g.moveTo(-w*.28,-AH); g.quadraticCurveTo(-w*.34,-AH*.9,-w*.2,-AH*.82); g.quadraticCurveTo(-w*.62,-AH*.55,-w*.5,-AH*.3); g.quadraticCurveTo(-w*.4,-AH*.08,-w*.14,0); g.lineTo(w*.14,0); g.quadraticCurveTo(w*.4,-AH*.08,w*.5,-AH*.3); g.quadraticCurveTo(w*.62,-AH*.55,w*.2,-AH*.82); g.quadraticCurveTo(w*.34,-AH*.9,w*.28,-AH); g.closePath(); const tg=g.createLinearGradient(-w*.5,0,w*.5,0); tg.addColorStop(0,'#9a3412'); tg.addColorStop(.4,'#ea580c'); tg.addColorStop(1,'#7c2d12'); g.fillStyle=tg; g.strokeStyle='#431407'; g.fill(); g.stroke();   // the body
    g.strokeStyle='#431407'; g.lineWidth=2*z; for(const s of [-1,1]){ g.beginPath(); g.moveTo(s*w*.22,-AH*.88); g.bezierCurveTo(s*w*.95,-AH*.92,s*w*.85,-AH*.55,s*w*.5,-AH*.5); g.stroke(); } g.strokeStyle='#fed7aa'; g.lineWidth=2.4*z; g.beginPath(); g.moveTo(-w*.46,-AH*.5); g.lineTo(w*.46,-AH*.5); g.moveTo(-w*.42,-AH*.34); g.lineTo(w*.42,-AH*.34); g.stroke(); g.restore();
    for(let h=0;h<hits;h++){ const ht=vlClamp((u-.3-h*.13)/.1,0,1); if(ht<=0||ht>=1) continue; g.globalAlpha=a*(1-ht); g.strokeStyle='#fff'; g.lineWidth=3*z; g.beginPath(); g.moveTo(mx-24*z,fy-AH*.5-h*20*z); g.lineTo(mx-6*z,fy-AH*.55); g.lineTo(mx-18*z,fy-AH*.62+h*8*z); g.stroke(); vlStar(g,mx,fy-AH*.5,14*z*(1-ht*.5),3*z,6,h); g.fillStyle='#fde047'; g.fill(); } }   // a crack flash for each absorbed hit
  else { const FC={Clobber:'#ea580c',Razzle:'#a855f7',Sizzle:'#dc2626',Drench:'#0284c7'}, c0=FC[fl[0]]||'#ea580c', c1=FC[fl[1]||fl[0]]||'#a855f7'; for(let i=0;i<ns;i++){ const r1=vlRnd(i), t=vlClamp(su*1.25-r1*.2,0,1); if(t<=0) continue; const dir=Math.PI+(vlRnd(i+5)-.5)*1.2, d=(60+vlRnd(i+9)*260)*z*vlEase(t), sx=mx+Math.cos(dir)*d, sy=fy-AH*.45+Math.sin(dir)*d*.35+t*t*60*z, col=i%2?c1:c0, sz=(5+vlRnd(i+13)*9)*z; g.globalAlpha=a*(1-t*t); g.save(); g.translate(sx,sy); g.rotate(t*9+i); vlPoly(g,[[-sz,sz*.6],[sz*.2,-sz],[sz,sz*.5]],col,'#431407'); g.restore(); } }   // shards fly left over the foes
  if(sh&&su<.5){ g.globalAlpha=a*(1-su*2); g.fillStyle='#fde68a'; vlStar(g,mx,fy-AH*.45,40*z*(1+su),8*z,10,su); g.fill(); }
  g.restore(); }

// 33. Autonomous Waymo SUV & LA Metro Express Train: { vehicle: 'waymo_rescue'|'la_metro_express', lidarFlash: bool, ruckusGain: 20 }
// Draws on the foe, over its floor, right to left. waymo_rescue: a white SUV with a spinning lidar puck rolls in, a white lidar flash blinds the foes (lidarFlash), its door swings open and a green revive pillar rises at the ally's spot; a chip shows the Ruckus gain.
// la_metro_express: a gleaming LA Metro train rushes across on a rail that climbs steeply (Baxter Street), with speed lines. There is no motion on rails other than the train's own; both are car-free of any boat or other vehicle.
const vlTransitMs=p=>p&&p.vehicle==='la_metro_express'?1900:2300;
function vlTransit(g,x,y,u,z,p){ p=vlP(p,{vehicle:'waymo_rescue',lidarFlash:true,ruckusGain:20}); const H=vlH(p,z), fy=y+H*.5+8*z, a=vlFade(u,.15), tot=vlTransitMs(p), tm=u*tot/1000, metro=p.vehicle==='la_metro_express', fr=vlFrom(p,x,y,z); g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round';
  if(metro){ const su=vlSm(vlClamp(u/.9,0,1)), L=200*z, tx=VL_W+L*.6-(VL_W+L*1.3)*su, slope=.13, ty=fy-6*z-(tx-x)*slope*0; g.strokeStyle='#475569'; g.lineWidth=3*z; g.beginPath(); g.moveTo(-30*z,fy+8*z+slope*(-30*z)); g.lineTo(VL_W+30*z,fy+8*z-slope*30*z); g.stroke();   // the rail climbs a steep Baxter Street line
    for(let i=0;i<16;i++){ g.globalAlpha=a*.35*(1-su*.5); g.strokeStyle='#e2e8f0'; g.lineWidth=2*z; const ly=fy-vlRnd(i)*H*.9, lx=tx+L*.5+vlRnd(i+4)*180*z; g.beginPath(); g.moveTo(lx,ly); g.lineTo(lx+(50+vlRnd(i+9)*60)*z,ly); g.stroke(); }
    g.globalAlpha=a; g.save(); g.translate(tx,ty); g.rotate(-slope*.5); vlBox(g,-L/2,-50*z,L,46*z,'#e5e7eb','#475569',10*z); g.fillStyle='#dc2626'; g.fillRect(-L/2,-26*z,L,5*z); g.fillStyle='#0ea5e9'; g.fillRect(-L/2,-21*z,L,3*z);
    for(let i=0;i<7;i++){ vlBox(g,-L/2+14*z+i*(L-70*z)/6,-44*z,24*z,15*z,'#7dd3fc','#334155',3*z); } vlPoly(g,[[-L/2,-50*z],[-L/2-22*z,-30*z],[-L/2,-4*z]],'#cbd5e1','#475569'); vlDisc(g,-L/2-10*z,-22*z,4*z,'#fef08a','#a16207'); vlBox(g,-L*.12,-62*z,34*z,12*z,'#475569','#1e293b',3*z);
    for(const wx of [-.36,-.2,.2,.36]){ vlDisc(g,wx*L,-1*z,6*z,'#1e293b','#000'); } g.restore(); }   // the gleaming train
  else { const su=vlEase(vlClamp(u/.5,0,1)), L=118*z, cx=VL_W+L*.7-(VL_W+L*.7-(x+10*z))*su, s=L/110; g.save(); g.translate(cx,fy); g.lineWidth=2*z;
    vlBox(g,-55*s,-36*s,110*s,26*s,'#f8fafc','#64748b',9*s); vlPoly(g,[[-30*s,-36*s],[-18*s,-56*s],[24*s,-56*s],[40*s,-36*s]],'#e2e8f0','#64748b'); vlPoly(g,[[-24*s,-38*s],[-15*s,-52*s],[-2*s,-52*s],[-2*s,-38*s]],'#38bdf8'); vlPoly(g,[[2*s,-38*s],[2*s,-52*s],[20*s,-52*s],[32*s,-38*s]],'#38bdf8');
    vlDisc(g,-30*s,-12*s,10*s,'#0f172a','#000'); vlDisc(g,32*s,-12*s,10*s,'#0f172a','#000'); vlBox(g,-4*s,-66*s,12*s,10*s,'#334155','#0f172a',3*s); vlDisc(g,2*s,-66*s,2*s,'#4ade80');   // the white SUV with its roof puck
    if(su>=1){ const dop=vlEase(vlClamp((u-.5)/.15,0,1)); g.save(); g.translate(8*s,-34*s); g.rotate(-dop*1.1); vlBox(g,-2*s,0,2*s,0,'#fff'); vlPoly(g,[[0,0],[0,22*s],[26*s*Math.cos(dop*.4),22*s],[26*s*Math.cos(dop*.4),0]],'#f1f5f9','#64748b'); g.restore(); } g.restore();
    const sp=tm*7, cr=Math.cos(sp), sr=Math.sin(sp); if(p.lidarFlash&&su>=1){ const fu=vlClamp((u-.5)/.3,0,1); g.globalAlpha=a*(1-fu)*.8; const fg=g.createLinearGradient(cx,0,x-90*z,0); fg.addColorStop(0,'rgba(255,255,255,.9)'); fg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=fg; g.beginPath(); g.moveTo(cx-60*s,fy-40*s); g.lineTo(x-90*z,fy-H*1.1); g.lineTo(x-90*z,fy+10*z); g.closePath(); g.fill(); }   // the lidar flash
    g.globalAlpha=a; g.strokeStyle='rgba(74,222,128,.8)'; g.lineWidth=1.6*z; g.beginPath(); g.arc(cx+2*s,fy-62*s,(10+8*Math.abs(sr))*s,0,VL_TAU); g.stroke();
    if(u>.55){ const ru=vlClamp((u-.55)/.4,0,1), bx=Math.max(20*z,Math.min(VL_W-20*z,fr.x)), by=fy; g.globalAlpha=a*(1-Math.max(0,(ru-.7)/.3))*.75; const rg=g.createLinearGradient(0,by,0,by-H*1.6*ru); rg.addColorStop(0,'rgba(16,185,129,.8)'); rg.addColorStop(1,'rgba(52,211,153,0)'); g.fillStyle=rg; g.fillRect(bx-16*z,by-H*1.6*ru,32*z,H*1.6*ru); }   // the revive pillar
    if(u>.7){ g.globalAlpha=a*vlClamp((u-.7)/.12,0,1); vlText(g,'+'+Math.round(vlClamp(+p.ruckusGain||20,0,100))+' Ruckus',cx-10*z,fy-H*1.0,10*z,'#fde68a','#312e81'); } }
  g.restore(); }

// 34. Ornate Eighth Wooden Dining Chair: { seatHeightPx: 28, decreeBarks: 3 }
// Draws on the member (P1_VFX_SELF, Nara): an ornate wooden chair slides in under her from the right, seatHeightPx tall, and decreeBarks barks pop out of her in speech bubbles; a party cleanse sparkle rises and a small pull chevron points left (+20% pull).
const VL_CHAIR_MS=2200;
function vlChair(g,x,y,u,z,p){ p=vlP(p,{seatHeightPx:28,decreeBarks:3}); const H=vlH(p,z), fy=y+H*.5+3*z, sh=vlClamp(+p.seatHeightPx||28,16,44)*z, nb=vlClamp(Math.round(+p.decreeBarks)||3,1,5), a=vlFade(u,.2), sl=vlEase(vlClamp(u/.25,0,1)), cx=x+(1-sl)*180*z, tm=u*VL_CHAIR_MS/1000; g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round';
  g.fillStyle='rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(cx,fy+3*z,24*z,5*z,0,0,VL_TAU); g.fill();
  g.strokeStyle='#451a03'; g.fillStyle='#92400e'; for(const lx of [-18,18]){ vlBox(g,cx+lx*z-3*z,fy-sh,6*z,sh,'#7c2d12','#451a03',2*z); }   // carved legs
  vlBox(g,cx-24*z,fy-sh-7*z,48*z,8*z,'#b45309','#451a03',3*z); vlBox(g,cx-20*z,fy-sh-1*z,40*z,4*z,'#9a3412','#451a03',1*z);   // the seat with its cushion
  vlBox(g,cx-22*z,fy-sh-62*z,6*z,56*z,'#7c2d12','#451a03',2*z); vlBox(g,cx+16*z,fy-sh-62*z,6*z,56*z,'#7c2d12','#451a03',2*z); vlBox(g,cx-22*z,fy-sh-68*z,44*z,8*z,'#b45309','#451a03',3*z); for(let i=0;i<3;i++){ vlBox(g,cx-12*z+i*9*z,fy-sh-58*z,3*z,46*z,'#9a3412','#451a03',1*z); }   // the carved back
  vlDisc(g,cx,fy-sh-72*z,4*z,'#fbbf24','#92400e');
  for(let i=0;i<nb;i++){ const bt=vlClamp((u-.34-i*.14)/.1,0,1); if(bt<=0) continue; const k=vlBack(bt), fd=vlClamp((u-.34-i*.14-.12)/.14,0,1); g.globalAlpha=a*(1-fd); g.save(); g.translate(cx-24*z-i*20*z,fy-sh-H*.8-i*14*z); g.scale(k,k); vlBox(g,-17*z,-8*z,34*z,16*z,'#fff','#1e293b',7*z); vlPoly(g,[[4*z,7*z],[10*z,7*z],[12*z,14*z]],'#fff','#1e293b'); vlText(g,'WOOF!',0,0,8*z,'#7c2d12','#fff',2*z); g.restore(); }   // the decree barks
  if(u>.4){ g.globalAlpha=a; for(let i=0;i<6;i++){ const t=vlClamp(((u-.4)*1.2+vlRnd(i)*.5)%1,0,1); g.globalAlpha=a*Math.sin(t*Math.PI); g.fillStyle=i%2?'#fef08a':'#86efac'; vlStar(g,cx+(vlRnd(i+6)-.5)*70*z,fy-sh-t*H*1.2,3*z,1*z,4,t*5); g.fill(); } g.globalAlpha=a; vlChev(g,cx-44*z,fy-sh-24*z,5*z,'#14b8a6',true); vlChev(g,cx-54*z,fy-sh-24*z,5*z,'#14b8a6',true); }   // party cleanse sparkles and the pull chevrons
  g.restore(); }

// 35. Stadium Jumbotron Instant Replay Screen: { rewindAllyId, offenderEnemyId, rewindPct: .5 }
// Draws on the foe (the offender): a jumbotron lowers from above on cables and plays an instant replay of the last hit, its scrub bar rewinding rewindPct of the way back with a rewind glyph; a beam of racket rings runs from the screen to the foe, whose -25% Def penalty shows over it.
const VL_JUMBO_MS=2500;
function vlJumbo(g,x,y,u,z,p){ p=vlP(p,{rewindAllyId:'',offenderEnemyId:'',rewindPct:.5}); const H=vlH(p,z), a=vlFade(u,.18), dn=vlEase(vlClamp(u/.2,0,1)), rp=vlClamp(+p.rewindPct||.5,.1,1), sw=170*z, shh=96*z, sx=VL_W*.5, sy=-20*z+dn*(58*z+shh*.5), tm=u*VL_JUMBO_MS/1000; g.save(); g.globalAlpha=a; g.lineWidth=2.4*z; g.lineJoin='round';
  vlDim(g,.18*a*dn,'#0b1020'); g.strokeStyle='#64748b'; g.lineWidth=2*z; for(const s of [-1,1]){ g.beginPath(); g.moveTo(sx+s*sw*.36,-10*z); g.lineTo(sx+s*sw*.4,sy-shh*.5); g.stroke(); }   // cables
  vlBox(g,sx-sw/2-6*z,sy-shh/2-6*z,sw+12*z,shh+12*z,'#1f2937','#030712',8*z); vlBox(g,sx-sw/2,sy-shh/2,sw,shh,'#0f172a','#475569',4*z);
  const rw=u>.28&&u<.82, pr=rw?1-rp*vlEase(vlClamp((u-.28)/.45,0,1)):1; g.save(); g.beginPath(); g.rect(sx-sw/2,sy-shh/2,sw,shh); g.clip(); g.fillStyle=rw?'#312e81':'#1e3a8a'; g.fillRect(sx-sw/2,sy-shh/2,sw,shh);   // the screen
  const hx=sx-sw*.3+(sw*.5)*pr; vlDisc(g,sx-sw*.3,sy+8*z,10*z,'#fbbf24','#78350f'); vlBox(g,hx-6*z,sy-14*z,12*z,34*z,'#f43f5e','#7f1d1d',3*z); vlStar(g,hx+10*z,sy-6*z,10*z,3*z,6,tm*3); g.fillStyle='#fde047'; g.fill();   // a little replay of the hit
  if(rw){ g.globalAlpha=a*.25; g.fillStyle='#fff'; for(let i=0;i<6;i++){ g.fillRect(sx-sw/2,sy-shh/2+((i*17+tm*160)%shh),sw,2*z); } g.globalAlpha=a; } g.restore();   // VHS lines while rewinding
  vlBox(g,sx-sw/2+8*z,sy+shh/2-14*z,sw-16*z,5*z,'#334155','#000',2*z); vlBox(g,sx-sw/2+8*z,sy+shh/2-14*z,(sw-16*z)*pr,5*z,'#f43f5e',null,2*z);   // the scrub bar
  if(rw){ vlChev(g,sx-10*z,sy-shh/2+14*z,4*z,'#fff',true); vlChev(g,sx-2*z,sy-shh/2+14*z,4*z,'#fff',true); } vlText(g,rw?'REWIND':'REPLAY',sx+sw*.3,sy-shh/2+14*z,8*z,'#fde047','#1e1b4b',2*z);
  if(u>.55){ const bu=vlEase(vlClamp((u-.55)/.25,0,1)); for(let k=0;k<4;k++){ const q=(bu+k*.12)%1.2; if(q>1) continue; const bx=vlLerp(sx,x,q), by=vlLerp(sy+shh*.5,y,q); g.globalAlpha=a*(1-q)*.9; g.strokeStyle='#f43f5e'; g.lineWidth=3*z; g.beginPath(); g.ellipse(bx,by,(8+q*10)*z,(14+q*10)*z,Math.atan2(y-sy,x-sx),0,VL_TAU); g.stroke(); }   // the racket beam
    g.globalAlpha=a*vlClamp((u-.78)/.1,0,1); vlText(g,'-25% DEF',x,y-H*.62-14*z,10*z,'#fecdd3','#881337'); }
  g.restore(); }

// 36. 6'4" Michael Toddler Sprint & LivNews Chopper: { mode: 'michael_sprint'|'livnews_chopper', tickerText: 'BREAKING NEWS' }
// Draws on the foe, over the whole field. michael_sprint: a tall running man sprints right to left across the field (startle marks over the foes, -25% bar) while a covered dinner tray slides along the floor the other way to the party. livnews_chopper: a news helicopter sweeps across the top with twin searchlights that sweep the floor, and a ticker banner with tickerText scrolls along the bottom.
const VL_NEWS_MS=2600;
function vlNews(g,x,y,u,z,p){ p=vlP(p,{mode:'michael_sprint',tickerText:'BREAKING NEWS'}); const H=vlH(p,z), fy=y+H*.5+8*z, a=vlFade(u,.14), tm=u*VL_NEWS_MS/1000, chop=p.mode==='livnews_chopper', tt=String(p.tickerText||'BREAKING NEWS').slice(0,30); g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round'; g.lineCap='round';
  if(chop){ const hu=vlEase(vlClamp(u/.8,0,1)), hx=VL_W+60*z-(VL_W+160*z)*hu, hy=34*z+Math.sin(tm*4)*3*z, s=z/1.8; g.save(); g.translate(hx,hy); g.scale(s,s); vlBox(g,-34,-12,64,26,'#1d4ed8','#1e1b4b',12); vlBox(g,-30,-6,30,14,'#bae6fd','#1e1b4b',5); g.strokeStyle='#1e1b4b'; g.lineWidth=5; g.beginPath(); g.moveTo(30,-4); g.lineTo(70,-8); g.stroke(); vlPoly(g,[[66,-16],[76,-16],[74,0],[66,-2]],'#1d4ed8','#1e1b4b'); g.beginPath(); g.moveTo(-6,-12); g.lineTo(-6,-22); g.stroke(); g.strokeStyle='#334155'; g.lineWidth=3; g.beginPath(); g.moveTo(-50,-22); g.lineTo(38,-22); g.stroke(); g.globalAlpha=a*.45; g.fillStyle='#94a3b8'; g.beginPath(); g.ellipse(-6,-22,56,4+Math.abs(Math.sin(tm*40))*2,0,0,VL_TAU); g.fill(); g.globalAlpha=a; g.strokeStyle='#1e1b4b'; g.lineWidth=3; g.beginPath(); g.moveTo(-24,20); g.lineTo(20,20); g.stroke(); vlText(g,'LIV 7',-16,12,7,'#fff','#1e1b4b',1.4); g.restore();   // the helicopter
    for(const o of [-1,1]){ const tx=vlLerp(x-120*z,x+100*z,.5+.5*Math.sin(tm*2.2+o*1.2)), lg=g.createLinearGradient(hx,hy,tx,fy); lg.addColorStop(0,'rgba(254,249,195,.55)'); lg.addColorStop(1,'rgba(254,249,195,.08)'); g.globalAlpha=a; g.fillStyle=lg; g.beginPath(); g.moveTo(hx-10*z+o*8*z,hy+10*z); g.lineTo(tx-40*z,fy+4*z); g.lineTo(tx+40*z,fy+4*z); g.closePath(); g.fill(); g.fillStyle='rgba(255,255,230,.5)'; g.beginPath(); g.ellipse(tx,fy,42*z,8*z,0,0,VL_TAU); g.fill(); }   // twin searchlights
    const bu=vlClamp((u-.14)/.14,0,1); g.globalAlpha=a*bu; vlBox(g,-10*z,VL_HT-34*z,VL_W+20*z,24*z,'#b91c1c','#450a0a',0); vlBox(g,-10*z,VL_HT-34*z,70*z,24*z,'#fff','#450a0a',0); vlText(g,'LIV',25*z,VL_HT-22*z,11*z,'#b91c1c','#fff',2*z);
    g.save(); g.beginPath(); g.rect(60*z,VL_HT-34*z,VL_W,24*z); g.clip(); const tw=tt.length*8.2*z+60*z; for(let k=0;k<3;k++){ vlText(g,tt,60*z+tw*k+tw*.5-((tm*140*z)%tw),VL_HT-22*z,11*z,'#fff','#450a0a',2*z); } g.restore(); }   // the ticker
  else { const mu=vlSm(vlClamp(u/.7,0,1)), mx=VL_W+50*z-(VL_W+120*z)*mu, ph=tm*13, s=z/1.8; g.save(); g.translate(mx,fy); g.scale(s,s); g.strokeStyle='#1e293b'; g.lineWidth=6; const sw1=Math.sin(ph)*28, sw2=Math.sin(ph+Math.PI)*28; g.beginPath(); g.moveTo(0,-62); g.lineTo(-6+sw1*.7,-30); g.lineTo(-14+sw1,0); g.moveTo(0,-62); g.lineTo(-6+sw2*.7,-30); g.lineTo(-14+sw2,0); g.stroke(); g.strokeStyle='#2563eb'; g.lineWidth=14; g.beginPath(); g.moveTo(0,-70); g.lineTo(-8,-120); g.stroke(); g.strokeStyle='#fcd9b0'; g.lineWidth=5; g.beginPath(); g.moveTo(-6,-112); g.lineTo(-26,-90+Math.sin(ph)*14); g.moveTo(-6,-112); g.lineTo(12,-92+Math.sin(ph+Math.PI)*14); g.stroke(); vlDisc(g,-10,-134,13,'#fcd9b0','#1e293b'); g.fillStyle='#1e293b'; g.beginPath(); g.arc(-10,-140,13,Math.PI,VL_TAU); g.fill(); g.restore();   // a very tall man at a full sprint
    for(let i=0;i<8;i++){ g.globalAlpha=a*.4*(1-mu); g.strokeStyle='#e2e8f0'; g.beginPath(); g.moveTo(mx+30*z+i*8*z,fy-vlRnd(i)*H*1.3); g.lineTo(mx+60*z+i*8*z,fy-vlRnd(i)*H*1.3); g.stroke(); }
    if(mu>.55){ const su=vlClamp((mu-.55)/.45,0,1); g.globalAlpha=a*Math.sin(su*Math.PI); vlText(g,'!',x,y-H*.75-su*8*z,18*z,'#fde047','#7f1d1d'); vlText(g,'-25%',x,y-H*.75-24*z,9*z,'#fecaca','#7f1d1d',2*z); }   // the foes startle
    if(u>.3){ const tu=vlClamp((u-.3)/.55,0,1), tx=vlLerp(x+10*z,VL_W-70*z,vlEase(tu)); g.globalAlpha=a*(1-Math.max(0,(u-.9)/.1)); g.fillStyle='#e5e7eb'; g.strokeStyle='#475569'; g.beginPath(); g.ellipse(tx,fy-8*z,16*z,10*z,0,Math.PI,VL_TAU); g.fill(); g.stroke(); vlBox(g,tx-18*z,fy-8*z,36*z,3*z,'#94a3b8','#475569',1*z); vlDisc(g,tx,fy-19*z,2.4*z,'#cbd5e1'); for(let i=0;i<3;i++){ g.strokeStyle='rgba(226,232,240,.8)'; g.beginPath(); g.moveTo(tx-6*z+i*6*z,fy-22*z); g.quadraticCurveTo(tx-9*z+i*6*z,fy-30*z-Math.sin(tm*6+i)*3*z,tx-6*z+i*6*z,fy-38*z); g.stroke(); } } }   // hot dinner on a tray slides to the party
  g.restore(); }

// 37. Neon Gym Bleachers Pyro & 100% Family Ruckus Crest: { mode: 'gym_pyro'|'ruckus_50_link'|'ruckus_100_crest', composureCap: 4 }
// Draws on the foe, over the whole screen. gym_pyro: neon championship gym bleachers rise at the back with a cheering crowd, neon strips and pyro fountains. ruckus_50_link: a white flash and a glowing link bar between two rings (the Double Team). ruckus_100_crest: a storybook crest, a shield with an open book, a heart and composureCap stars over rays (Full Family Ruckus).
const vlGymMs=p=>p&&p.mode==='ruckus_50_link'?1400:p&&p.mode==='ruckus_100_crest'?2400:2200;
function vlGym(g,x,y,u,z,p){ p=vlP(p,{mode:'gym_pyro',composureCap:4}); const H=vlH(p,z), a=vlFade(u,.2), tot=vlGymMs(p), tm=u*tot/1000, m=p.mode, fr=vlFrom(p,x,y,z), cap=vlClamp(Math.round(+p.composureCap)||4,1,6); g.save(); g.globalAlpha=a; g.lineWidth=2.2*z; g.lineJoin='round';
  if(m==='ruckus_50_link'){ const fl=Math.max(0,1-u*4), lu=vlEase(vlClamp((u-.1)/.25,0,1)); g.globalAlpha=a*fl*.8; g.fillStyle='#fff'; g.fillRect(-60,-60,VL_W+120,VL_HT+120); g.globalAlpha=a; const x1=fr.x, y1=fr.y, x2=Math.max(40*z,x1-130*z), y2=y1-10*z; vlDisc(g,x1,y1,H*.52,'rgba(99,102,241,.2)','#6366f1'); vlDisc(g,x2,y2,H*.52,'rgba(99,102,241,.2)','#6366f1');
    g.strokeStyle='#a5b4fc'; g.lineWidth=8*z; g.beginPath(); g.moveTo(x1,y1); g.lineTo(vlLerp(x1,x2,lu),vlLerp(y1,y2,lu)); g.stroke(); g.strokeStyle='#fff'; g.lineWidth=3*z; g.stroke(); g.fillStyle='#fde047'; vlStar(g,vlLerp(x1,x2,.5*lu),vlLerp(y1,y2,.5*lu),12*z,3*z,4,tm*5); g.fill(); vlText(g,'50%',(x1+x2)/2,y1-H*.7,12*z,'#e0e7ff','#312e81'); }   // the link flash
  else if(m==='ruckus_100_crest'){ const cu=vlBack(vlClamp(u/.3,0,1)), cx=VL_W*.5, cy=VL_HT*.42, s=cu*z/1.8; vlDim(g,.3*a*cu,'#1e1b4b'); g.save(); g.translate(cx,cy); for(let i=0;i<14;i++){ g.rotate(VL_TAU/14); g.globalAlpha=a*.35*cu; g.fillStyle=i%2?'#fde68a':'#fbbf24'; g.beginPath(); g.moveTo(0,0); g.lineTo(-12*s,-150*s); g.lineTo(12*s,-150*s); g.closePath(); g.fill(); } g.restore();   // the rays
    g.save(); g.translate(cx,cy); g.scale(s,s); g.globalAlpha=a; g.lineWidth=4; g.beginPath(); g.moveTo(-50,-60); g.lineTo(50,-60); g.lineTo(50,10); g.quadraticCurveTo(50,52,0,72); g.quadraticCurveTo(-50,52,-50,10); g.closePath(); g.fillStyle='#4338ca'; g.strokeStyle='#fbbf24'; g.fill(); g.stroke();
    g.fillStyle='#fefce8'; g.strokeStyle='#92400e'; g.lineWidth=2.4; g.beginPath(); g.moveTo(0,-20); g.quadraticCurveTo(-18,-30,-34,-22); g.lineTo(-34,16); g.quadraticCurveTo(-18,8,0,18); g.quadraticCurveTo(18,8,34,16); g.lineTo(34,-22); g.quadraticCurveTo(18,-30,0,-20); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0,-20); g.lineTo(0,18); g.stroke();   // the open storybook
    g.fillStyle='#ef4444'; g.strokeStyle='#7f1d1d'; g.beginPath(); g.moveTo(0,-4); g.bezierCurveTo(-14,-18,-26,-2,0,14); g.bezierCurveTo(26,-2,14,-18,0,-4); g.closePath(); g.fill(); g.stroke();   // a heart
    for(let i=0;i<cap;i++){ const o=i-(cap-1)/2; g.fillStyle='#fde047'; g.strokeStyle='#92400e'; g.lineWidth=2; vlStar(g,o*21,-86+Math.abs(o)*5,10,4.2,5,0); g.fill(); g.stroke(); } g.restore();   // composureCap stars
    vlText(g,'FAMILY RUCKUS',cx,cy+90*s,17*z/1.8,'#fef3c7','#312e81'); }
  else { const ru=vlEase(vlClamp(u/.3,0,1)), by=VL_HT*.58; g.save(); g.globalAlpha=a*ru; for(let r=0;r<4;r++){ const ty=by-r*18*z+(1-ru)*60*z; vlBox(g,VL_W*.1+r*16*z,ty,VL_W*.8-r*32*z,16*z,r%2?'#1e1b4b':'#312e81','#a855f7',2*z); g.strokeStyle=['#22d3ee','#f472b6','#a3e635','#facc15'][r]; g.lineWidth=2.4*z; g.beginPath(); g.moveTo(VL_W*.1+r*16*z,ty+2*z); g.lineTo(VL_W*.9-r*16*z,ty+2*z); g.stroke();
      for(let i=0;i<12;i++){ const hx=VL_W*.14+r*16*z+i*(VL_W*.72-r*32*z)/11, jump=Math.max(0,Math.sin(tm*8+i*1.7+r))*5*z; vlDisc(g,hx,ty-3*z-jump,3.6*z,['#fbbf24','#f472b6','#38bdf8','#a3e635'][(i+r)%4],'#1e1b4b'); } } g.restore();   // neon bleachers and the crowd
    if(u>.22){ for(const fx of [VL_W*.16,VL_W*.84]){ for(let i=0;i<18;i++){ const t=vlClamp(((u-.22)*1.6+vlRnd(i+fx)*.5)%1,0,1), an=-Math.PI*.5+(vlRnd(i+3)-.5)*.9, d=t*(110+vlRnd(i)*60)*z; g.globalAlpha=a*(1-t); vlDisc(g,fx+Math.cos(an)*d*.7,by+10*z+Math.sin(an)*d-t*t*40*z,(2.4+vlRnd(i+9)*2)*z,i%2?'#fde047':'#fb923c'); } } }   // pyro fountains
  }
  g.restore(); }

Object.assign(P1_VFX,{setpiece_black_porsche_suv:vlPorsche,setpiece_delta_one_pod_doors:vlPod,setpiece_giant_sky_controller:vlSkyPad,setpiece_3tier_sparkler_cake:vlCake,setpiece_diamond_gold_dumpling:vlDumpling,
  setpiece_giant_easel_portrait:vlEasel,setpiece_broadway_spotlights:vlSpot,setpiece_sofa_cushion_fort:vlFort,setpiece_blanket_kingdom_castle:vlCastle,setpiece_mega_whoopee_cushion:vlWhoopee,
  setpiece_8seat_sunday_table:vlTable,setpiece_rising_full_moon:vlMoon,setpiece_50yr_dust_tsunami:vlTsunami,setpiece_rikers_iron_gates:vlGates,setpiece_cattail_pier_leviathan:vlPier,
  setpiece_sentient_ghost_pepper:vlPepper,setpiece_leaning_grand_amphora:vlAmphora,setpiece_waymo_and_la_metro:vlTransit,setpiece_eighth_dining_chair:vlChair,setpiece_stadium_jumbotron:vlJumbo,
  setpiece_michael_sprint_and_chopper:vlNews,setpiece_gym_bleachers_and_ruckus_crest:vlGym});
Object.assign(P1_VFX_MS,{setpiece_black_porsche_suv:vlPorscheMs,setpiece_delta_one_pod_doors:VL_POD_MS,setpiece_giant_sky_controller:VL_PAD_MS,setpiece_3tier_sparkler_cake:VL_CAKE_MS,setpiece_diamond_gold_dumpling:VL_DUMP_MS,
  setpiece_giant_easel_portrait:VL_EASEL_MS,setpiece_broadway_spotlights:VL_SPOT_MS,setpiece_sofa_cushion_fort:VL_FORT_MS,setpiece_blanket_kingdom_castle:VL_CASTLE_MS,setpiece_mega_whoopee_cushion:VL_WHOOPEE_MS,
  setpiece_8seat_sunday_table:VL_TABLE_MS,setpiece_rising_full_moon:vlMoonMs,setpiece_50yr_dust_tsunami:vlTideMs,setpiece_rikers_iron_gates:VL_GATES_MS,setpiece_cattail_pier_leviathan:VL_PIER_MS,
  setpiece_sentient_ghost_pepper:VL_PEPPER_MS,setpiece_leaning_grand_amphora:VL_AMPH_MS,setpiece_waymo_and_la_metro:vlTransitMs,setpiece_eighth_dining_chair:VL_CHAIR_MS,setpiece_stadium_jumbotron:VL_JUMBO_MS,
  setpiece_michael_sprint_and_chopper:VL_NEWS_MS,setpiece_gym_bleachers_and_ruckus_crest:vlGymMs});
// The set-pieces that draw on the member playing the clip, not on the foe.
for(const id of ['setpiece_delta_one_pod_doors','setpiece_giant_sky_controller','setpiece_3tier_sparkler_cake','setpiece_diamond_gold_dumpling','setpiece_giant_easel_portrait','setpiece_broadway_spotlights','setpiece_sofa_cushion_fort','setpiece_blanket_kingdom_castle','setpiece_8seat_sunday_table','setpiece_rising_full_moon','setpiece_rikers_iron_gates','setpiece_sentient_ghost_pepper','setpiece_eighth_dining_chair']) P1_VFX_SELF[id]=true;

// vfxfight1 (2026-11-26): each effect's layer, the library's own `layer` field (art-factory/aot-stage2c-vfx-library-v11.json). A real Battle 3 fight draws an effect at its layer's point in the draw order
// (engine/b3-vfx.js: ground_decal and behind_units under the units, unit_overlay over them, foreground_sweep over the field, screen_lighting last).
// tools/movebench/timing_test.py checks this table against the library file, so a layer changed there and not here fails the test.
for(const id of ['vfx_core_clobber_impact','vfx_core_detonation_pops','vfx_core_composure_break','vfx_core_heal_cleanse','vfx_core_shield_ward','vfx_core_timeline_chevrons','vfx_core_status_debuff_badges','setpiece_delta_one_pod_doors','setpiece_sofa_cushion_fort','setpiece_rikers_iron_gates','setpiece_leaning_grand_amphora']) P1_VFX_LAYER[id]='unit_overlay';
for(const id of ['vfx_core_sizzle_wave','vfx_core_drench_splash','vfx_core_razzle_beam_arc','vfx_core_racket_rings','proj_arc_single','proj_boomerang_return','proj_ally_handoff_party','setpiece_black_porsche_suv','setpiece_diamond_gold_dumpling','setpiece_50yr_dust_tsunami','setpiece_cattail_pier_leviathan','setpiece_sentient_ghost_pepper','setpiece_waymo_and_la_metro','setpiece_michael_sprint_and_chopper']) P1_VFX_LAYER[id]='foreground_sweep';
for(const id of ['proj_ground_hazard_mat','setpiece_giant_sky_controller','setpiece_mega_whoopee_cushion']) P1_VFX_LAYER[id]='ground_decal';
for(const id of ['setpiece_3tier_sparkler_cake','setpiece_giant_easel_portrait','setpiece_blanket_kingdom_castle','setpiece_8seat_sunday_table','setpiece_eighth_dining_chair']) P1_VFX_LAYER[id]='behind_units';
for(const id of ['setpiece_broadway_spotlights','setpiece_rising_full_moon','setpiece_stadium_jumbotron','setpiece_gym_bleachers_and_ruckus_crest']) P1_VFX_LAYER[id]='screen_lighting';

// movebench4: each effect's default `on` (where it lands when a move's spec says `auto`), kept with the effect that has it. The unit-sized effects land once on each target the move names, the heal and the shield on each
// ally it names; every other effect lands once on the move's target (or, in P1_VFX_SELF, on the member playing the move).
for(const id of ['vfx_core_clobber_impact','vfx_core_detonation_pops','vfx_core_composure_break','vfx_core_timeline_chevrons','vfx_core_status_debuff_badges']) P1_VFX_ON[id]='each_target';
for(const id of ['vfx_core_heal_cleanse','vfx_core_shield_ward']) P1_VFX_ON[id]='each_ally';
