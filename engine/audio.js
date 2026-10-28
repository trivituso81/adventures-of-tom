'use strict';
// engine/audio.js — Layout mode, synthesized sound effects.
// ---------- Sound: synthesized effects plus spoken lines ----------
const sound={ctx:null,master:null,enabled:true,voices:[],unlocked:false};
try { sound.enabled=localStorage.getItem('le-sound')!=='off'; } catch(e) {}
// Volume levels 1 to 10 (10 = full). Music has its own bus; effects, voices and dialogue share sound.master.
sound.vol={music:10,fx:10};
try { for(const k of ['music','fx']) { const n=+localStorage.getItem('le-vol-'+k); if(n>=1&&n<=10) sound.vol[k]=Math.round(n); } } catch(e) {}
// Ears hear loudness on a curve, so each step sounds about as big as the last: 10 is 1, 5 is about .3, 1 is about .02.
const MUSIC_TRIM=.315; // music bus base gain: .45 reduced by 30% (2026-10-27)
const volGain=n=>Math.pow(Math.max(1,Math.min(10,n))/10,1.7);
function setVolume(kind,n) {
  if(!(kind in sound.vol)) return;
  sound.vol[kind]=Math.max(1,Math.min(10,Math.round(n)));
  try { localStorage.setItem('le-vol-'+kind,String(sound.vol[kind])); } catch(e) {}
  const bus=kind==='music'?sound.musicBus:sound.master;
  if(bus&&sound.ctx) { const t=sound.ctx.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setTargetAtTime((kind==='music'?MUSIC_TRIM:.45)*volGain(sound.vol[kind]),t,.03); }
}
// Portrait / landscape: 'auto' follows the device; a forced mode rotates the whole stage when the device disagrees.
const layout={mode:'auto',landscape:false,rotated:false};
try { layout.mode=localStorage.getItem('le-layout')||'auto'; } catch(e) {}
function applyLayout() {
  const deviceLandscape=window.innerWidth>window.innerHeight;
  layout.landscape=layout.mode==='auto'?deviceLandscape:layout.mode==='landscape';
  layout.rotated=layout.landscape!==deviceLandscape;
  document.documentElement.classList.toggle('landscape',layout.landscape);
  document.documentElement.classList.toggle('rotated',layout.rotated);
  for(const id of ['rotate-hud','rotate-menu']) { const b=document.getElementById(id); if(b) b.setAttribute('aria-label',layout.landscape?'Switch to portrait':'Switch to landscape'); }
  if(typeof resize==='function') resize();
}
function toggleLayout() {
  layout.mode=layout.landscape?'portrait':'landscape';
  try { localStorage.setItem('le-layout',layout.mode); } catch(e) {}
  applyLayout();
  if(typeof sfx!=='undefined') sfx.select();
}

function buildAudio() {
  sound.ctx=new (window.AudioContext||window.webkitAudioContext)();
  sound.master=sound.ctx.createGain();
  sound.master.gain.value=.45*volGain(sound.vol.fx);
  sound.master.connect(sound.ctx.destination);
  sound.musicBus=sound.ctx.createGain();
  sound.musicBus.gain.value=MUSIC_TRIM*volGain(sound.vol.music);
  sound.musicBus.connect(sound.ctx.destination);
}

function audio() {
  if(!sound.ctx) { try { buildAudio(); } catch(e) { return null; } }
  // iPhone Safari sets the state to 'interrupted' (not 'suspended') after switching apps, so wake it from any state but running.
  if(sound.ctx.state!=='running') wakeAudio();
  return sound.ctx;
}

// Wake the audio engine after an app switch, a call, or Siri. iOS only lets a stopped context restart from a touch.
function wakeAudio() {
  const c=sound.ctx; if(!c) return;
  try {
    const p=c.resume(); if(p&&p.catch) p.catch(()=>{});
    const b=c.createBuffer(1,1,22050),s=c.createBufferSource(); s.buffer=b; s.connect(c.destination); s.start(0);
  } catch(e) {}
}

// After an app switch iPhone Safari can leave the sound engine dead even though it reports 'running'. Waking it does not
// help, so on return we mark it stale and, on the very next tap (iOS only opens new audio from a tap), throw it away and
// build a fresh one. Decoded sound buffers belong to no engine, so the cached clips and tracks carry over; only the
// connections (buses, music voices) are rebuilt, and the music restarts by itself on the next tick.
sound.hiddenAt=0; sound.stale=false;
function rebuildAudio() {
  const old=sound.ctx; if(!old) return;
  sound.stale=false; sound.bad=0; sound.lastT=null; sound.wasRunning=false;
  try { if(typeof music!=='undefined') { music.eng=null; music.cur=null; music.ducked=false; music.duckUntil=0; music.session=null; } } catch(e) {}
  try { if(typeof MC!=='undefined') { MC.out=null; MC.duck=null; MC.cur=null; MC.old=[]; MC.ducked=false; MC.lastWant=undefined; MC.lvUntil=0; MC.loading.clear(); } } catch(e) {}
  try { if(typeof DV!=='undefined') { DV.src=null; DV.playing=false; DV.token=(DV.token||0)+1; } } catch(e) {}
  sound.ctx=null;
  try { buildAudio(); } catch(e) { sound.ctx=null; return; }
  wakeAudio();
  try { old.close(); } catch(e) {}
}
function onAppHidden() { sound.hiddenAt=performance.now(); }
function onAppBack() {
  const wasAway=sound.hiddenAt>0; sound.hiddenAt=0;
  if(!sound.ctx) return;
  wakeAudio();
  // Any return from the background: iOS may have killed the output even for a short switch, so rebuild on the next tap.
  if(wasAway) sound.stale=true;
}
// Watchdog: an engine that says 'running' but whose clock stands still is dead, and so is one that ran before and now
// stays stopped while the app is in front. Either way, rebuild on the next tap.
sound.lastT=null; sound.bad=0; sound.wasRunning=false;
setInterval(()=>{
  const c=sound.ctx; if(!c||document.hidden||sound.stale) { sound.lastT=null; return; }
  const running=c.state==='running';
  if(running&&sound.lastT!==null&&c.currentTime===sound.lastT) sound.bad++;
  else if(!running&&sound.wasRunning) sound.bad++;
  else sound.bad=0;
  if(running&&c.currentTime!==sound.lastT) sound.wasRunning=true;
  sound.lastT=c.currentTime;
  if(sound.bad>=2) { sound.stale=true; sound.bad=0; sound.lastT=null; }
},500);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) onAppHidden(); else onAppBack(); });
window.addEventListener('pagehide',onAppHidden);
document.addEventListener('freeze',onAppHidden);
document.addEventListener('resume',()=>{ if(!document.hidden) onAppBack(); });
window.addEventListener('pageshow',()=>{ if(!document.hidden) onAppBack(); });

function unlockAudio() {
  if(sound.stale) rebuildAudio();
  audio();
  if(sound.ctx&&sound.ctx.state!=='running') wakeAudio();
  if(!sound.unlocked&&'speechSynthesis'in window) {
    sound.unlocked=true;
    try {
      sound.voices=speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged=()=>{ sound.voices=speechSynthesis.getVoices(); };
      const u=new SpeechSynthesisUtterance(' ');
      u.volume=0;
      speechSynthesis.speak(u);
    } catch(e) {}
  }
}
for(const ev of ['touchstart','touchend','mousedown','keydown']) window.addEventListener(ev,unlockAudio,{passive:true,capture:true});

function tone(o) {
  const c=sound.enabled&&audio();
  if(!c) return;
  const {type='square',f0=440,f1=f0,dur=.15,vol=.25,delay=0,attack=.005,filter=null,q=1,sweep='exp'}=o;
  const t=c.currentTime+delay;
  const osc=c.createOscillator(),g=c.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(f0,t);
  if(f1!==f0) {
    if(sweep==='exp') osc.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    else osc.frequency.linearRampToValueAtTime(f1,t+dur);
  }
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+attack);
  g.gain.exponentialRampToValueAtTime(.001,t+dur);
  let node=osc;
  if(filter) {
    const f=c.createBiquadFilter();
    f.type='lowpass'; f.frequency.value=filter; f.Q.value=q;
    osc.connect(f); node=f;
  }
  node.connect(g); g.connect(sound.master);
  osc.start(t); osc.stop(t+dur+.05);
}

function noise(o) {
  const c=sound.enabled&&audio();
  if(!c) return;
  const {dur=.1,vol=.2,delay=0,f0=1200,f1=f0,type='bandpass',q=.8}=o;
  const t=c.currentTime+delay;
  const len=Math.ceil(c.sampleRate*dur);
  const buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
  const src=c.createBufferSource(); src.buffer=buf;
  const f=c.createBiquadFilter(); f.type=type; f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);
  if(f1!==f0) f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
  const g=c.createGain();
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.001,t+dur);
  src.connect(f); f.connect(g); g.connect(sound.master);
  src.start(t); src.stop(t+dur+.05);
}

const sfx={
  select(){ tone({type:'square',f0:880,f1:1100,dur:.06,vol:.12}); },
  move(){ tone({type:'square',f0:600,dur:.04,vol:.08}); },
  intro(){ tone({type:'square',f0:330,dur:.12,vol:.2}); tone({type:'square',f0:330,dur:.12,vol:.2,delay:.14}); tone({type:'square',f0:494,f1:660,dur:.35,vol:.2,delay:.3}); noise({dur:.4,vol:.08,delay:.3,f0:300,f1:3000}); },
  slash(){ noise({dur:.18,vol:.22,f0:3000,f1:600,type:'bandpass',q:1.2}); },
  hitEnemy(){ noise({dur:.09,vol:.3,f0:900,f1:200,type:'lowpass'}); tone({type:'square',f0:200,f1:60,dur:.14,vol:.28}); },
  hitParty(){ noise({dur:.08,vol:.25,f0:700,f1:150,type:'lowpass'}); tone({type:'triangle',f0:140,f1:45,dur:.2,vol:.32}); },
  guard(){ tone({type:'triangle',f0:520,f1:780,dur:.12,vol:.18}); tone({type:'triangle',f0:780,dur:.16,vol:.14,delay:.1}); },
  heal(){ [523,659,784,1047].forEach((f,i)=>tone({type:'sine',f0:f,dur:.22,vol:.18,delay:i*.07})); },
  dance(){ [523,659,784,659,523,659,784,1047].forEach((f,i)=>tone({type:'square',f0:f,dur:.11,vol:.13,delay:i*.11})); [0,.22,.44,.66].forEach(d=>noise({dur:.06,vol:.08,delay:d,f0:5000,f1:7000})); },
  charge(){ tone({type:'sawtooth',f0:120,f1:900,dur:.9,vol:.14,filter:1800,sweep:'exp'}); tone({type:'sine',f0:240,f1:1800,dur:.9,vol:.1,delay:.05}); noise({dur:.9,vol:.05,f0:600,f1:5000,type:'bandpass',q:.6}); },
  laser(){ tone({type:'square',f0:2400,f1:300,dur:.25,vol:.22}); noise({dur:.3,vol:.3,f0:4000,f1:400,type:'bandpass',q:.5}); tone({type:'sawtooth',f0:90,f1:40,dur:.5,vol:.3,delay:.2,filter:500}); noise({dur:.5,vol:.25,delay:.2,f0:1200,f1:120,type:'lowpass'}); },
  whoosh(){ [0,.22,.44].forEach(d=>noise({dur:.2,vol:.16,delay:d,f0:600,f1:2600,type:'bandpass',q:1})); },
  boop(){ tone({type:'sine',f0:520,f1:980,dur:.08,vol:.22}); tone({type:'sine',f0:980,f1:720,dur:.16,vol:.18,delay:.08}); tone({type:'triangle',f0:1400,dur:.06,vol:.08,delay:.05}); },
  combo(){ [660,660,440,440,520,780,300,900].forEach((f,i)=>tone({type:'square',f0:f,dur:.07,vol:.12,delay:i*.13})); },
  fireball(){ noise({dur:.5,vol:.22,f0:300,f1:3000,type:'bandpass',q:.8}); tone({type:'sawtooth',f0:120,f1:60,dur:.5,vol:.18,filter:900}); tone({type:'square',f0:900,f1:200,dur:.2,vol:.14,delay:.45}); },
  tetris(){ [880,784,698,659,587,523,494,440].forEach((f,i)=>tone({type:'square',f0:f,dur:.08,vol:.1,delay:.3+i*.07})); },
  lineClear(){ tone({type:'triangle',f0:140,f1:50,dur:.25,vol:.3}); noise({dur:.15,vol:.2,f0:800,f1:150,type:'lowpass'}); [1047,1319,1568,2093].forEach((f,i)=>tone({type:'square',f0:f,dur:.1,vol:.12,delay:.2+i*.06})); },
  jumpWhistle(){ tone({type:'sine',f0:500,f1:1900,dur:.6,vol:.14,sweep:'linear'}); },
  thud(){ tone({type:'triangle',f0:120,f1:40,dur:.3,vol:.34}); noise({dur:.2,vol:.25,f0:600,f1:120,type:'lowpass'}); },
  fanfare(){ [784,988,1175,1568].forEach((f,i)=>tone({type:'square',f0:f,dur:.12,vol:.14,delay:i*.1})); tone({type:'square',f0:1568,dur:.4,vol:.12,delay:.4}); },
  bonk(){ tone({type:'sine',f0:700,f1:180,dur:.14,vol:.26}); tone({type:'triangle',f0:260,dur:.2,vol:.14,delay:.06}); },
  splat(){ noise({dur:.35,vol:.3,f0:2500,f1:300,type:'bandpass',q:.5}); tone({type:'sine',f0:220,f1:70,dur:.3,vol:.2}); },
  levelChime(){ [1047,1319,1568,2093].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.18,vol:.16,delay:i*.09})); [1568,2093].forEach((f,i)=>tone({type:'square',f0:f,dur:.35,vol:.1,delay:.4+i*.12})); tone({type:'sine',f0:2637,dur:.6,vol:.1,delay:.55}); noise({dur:.6,vol:.05,delay:.4,f0:5000,f1:7000}); },
  slideWhistle(){ tone({type:'sine',f0:400,f1:1600,dur:.45,vol:.14,sweep:'linear'}); tone({type:'sine',f0:1600,f1:300,dur:.5,vol:.14,delay:.5,sweep:'linear'}); },
  boing(){ tone({type:'triangle',f0:180,f1:520,dur:.09,vol:.2}); tone({type:'triangle',f0:520,f1:240,dur:.22,vol:.16,delay:.09}); tone({type:'sine',f0:240,f1:300,dur:.12,vol:.1,delay:.3}); },
  raspberry(){ tone({type:'sawtooth',f0:95,f1:70,dur:.55,vol:.22,filter:700,q:2}); noise({dur:.55,vol:.16,f0:400,f1:250,type:'bandpass',q:.7}); [0,.08,.16,.24,.32,.4].forEach(d=>tone({type:'square',f0:60,f1:50,dur:.05,vol:.1,delay:d})); },
  giggle(){ [0,.09,.18,.27,.36].forEach((d,i)=>tone({type:'square',f0:900+i*120,f1:1300+i*120,dur:.07,vol:.1,delay:d})); },
  stun(){ tone({type:'sine',f0:300,f1:220,dur:.35,vol:.18,sweep:'linear'}); tone({type:'sine',f0:450,f1:330,dur:.35,vol:.12,delay:.05,sweep:'linear'}); },
  sulk(){ tone({type:'sawtooth',f0:160,f1:90,dur:.45,vol:.12,filter:500}); },
  run(){ [700,600,500,400].forEach((f,i)=>tone({type:'square',f0:f,dur:.07,vol:.1,delay:i*.07})); },
  blocked(){ tone({type:'square',f0:220,f1:160,dur:.2,vol:.18}); },
  vapor(){ noise({dur:1.3,vol:.18,f0:800,f1:4000,type:'bandpass',q:.5}); tone({type:'sine',f0:260,f1:900,dur:1.2,vol:.1}); },
  win(){ [392,523,659,784].forEach((f,i)=>tone({type:'square',f0:f,dur:.15,vol:.16,delay:i*.12})); tone({type:'square',f0:1047,dur:.55,vol:.16,delay:.5}); tone({type:'triangle',f0:523,dur:.55,vol:.1,delay:.5}); },
  lose(){ [330,311,294,277].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.4,vol:.16,delay:i*.3})); tone({type:'triangle',f0:262,f1:196,dur:1,vol:.14,delay:1.2}); },
  levelUp(){ [523,659,784,1047,1319].forEach((f,i)=>tone({type:'square',f0:f,dur:.12,vol:.14,delay:i*.08})); },
  grumpAttack(){ tone({type:'sawtooth',f0:70,f1:140,dur:.35,vol:.3,filter:400,q:4}); noise({dur:.3,vol:.14,f0:200,f1:900,type:'lowpass'}); tone({type:'sawtooth',f0:110,f1:60,dur:.25,vol:.2,delay:.3,filter:350}); },
  grumpHurt(){ tone({type:'sine',f0:330,f1:110,dur:.22,vol:.28}); noise({dur:.15,vol:.15,f0:1500,f1:300,type:'lowpass'}); tone({type:'sine',f0:180,f1:260,dur:.12,vol:.15,delay:.2}); },
  grumpTaunt(){ [90,120,90,150].forEach((f,i)=>tone({type:'sawtooth',f0:f,f1:f*1.3,dur:.14,vol:.16,delay:i*.13,filter:450,q:3})); },
  // Overworld and menu
  menuOpen(){ tone({type:'square',f0:660,f1:880,dur:.08,vol:.12}); tone({type:'square',f0:880,f1:1320,dur:.1,vol:.1,delay:.07}); },
  menuClose(){ tone({type:'square',f0:880,f1:660,dur:.08,vol:.12}); tone({type:'square',f0:660,f1:440,dur:.1,vol:.1,delay:.07}); },
  tab(){ tone({type:'square',f0:740,dur:.05,vol:.09}); },
  equip(){ tone({type:'square',f0:520,dur:.06,vol:.12}); tone({type:'triangle',f0:1040,f1:1560,dur:.18,vol:.14,delay:.06}); },
  unequip(){ tone({type:'square',f0:520,dur:.06,vol:.12}); tone({type:'triangle',f0:780,f1:520,dur:.16,vol:.12,delay:.06}); },
  nope(){ tone({type:'square',f0:200,f1:180,dur:.12,vol:.14}); tone({type:'square',f0:200,f1:160,dur:.14,vol:.14,delay:.13}); },
  coin(){ tone({type:'square',f0:988,dur:.07,vol:.12}); tone({type:'square',f0:1319,dur:.22,vol:.12,delay:.07}); tone({type:'triangle',f0:2637,dur:.12,vol:.05,delay:.07}); },
  sell(){ tone({type:'square',f0:1319,dur:.06,vol:.11}); tone({type:'square',f0:988,dur:.06,vol:.11,delay:.07}); tone({type:'square',f0:1319,dur:.18,vol:.11,delay:.14}); },
  pickup(){ [784,988,1319].forEach((f,i)=>tone({type:'square',f0:f,dur:.1,vol:.14,delay:i*.08})); tone({type:'triangle',f0:1568,dur:.3,vol:.12,delay:.26}); },
  talk(seed){ const f=380+(seed%7)*55; tone({type:'square',f0:f,f1:f*1.25,dur:.07,vol:.1}); tone({type:'square',f0:f*1.25,f1:f,dur:.07,vol:.08,delay:.08}); },
  text(seed){ const f=900+(seed%5)*120; tone({type:'square',f0:f,dur:.025,vol:.04}); },
  advance(){ tone({type:'square',f0:1000,f1:1300,dur:.05,vol:.08}); },
  look(){ tone({type:'triangle',f0:600,f1:900,dur:.09,vol:.1}); },
  travel(){ tone({type:'triangle',f0:440,f1:660,dur:.12,vol:.1}); tone({type:'triangle',f0:660,f1:880,dur:.16,vol:.08,delay:.1}); noise({dur:.25,vol:.05,f0:500,f1:1500,type:'bandpass',q:.8}); },
  doorIn(){ noise({dur:.18,vol:.12,f0:900,f1:300,type:'lowpass'}); tone({type:'triangle',f0:220,f1:110,dur:.2,vol:.18,delay:.05}); tone({type:'square',f0:330,f1:660,dur:.18,vol:.08,delay:.18}); },
  doorOut(){ tone({type:'square',f0:660,f1:330,dur:.16,vol:.08}); noise({dur:.2,vol:.12,f0:300,f1:1200,type:'lowpass',delay:.1}); tone({type:'triangle',f0:110,f1:180,dur:.18,vol:.14,delay:.14}); },
  fountain(){ [0,.09,.18,.27].forEach((d,i)=>noise({dur:.25,vol:.08,delay:d,f0:2500+i*600,f1:4000,type:'bandpass',q:2})); [659,784,988,1319,1568].forEach((f,i)=>tone({type:'sine',f0:f,dur:.3,vol:.14,delay:.2+i*.09})); },
  step(){ noise({dur:.04,vol:.035,f0:500,f1:250,type:'lowpass'}); },
  kiss(){ tone({type:'sine',f0:880,f1:1320,dur:.12,vol:.16}); tone({type:'sine',f0:1320,f1:1760,dur:.22,vol:.12,delay:.12}); [1568,1976,2349].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.18,vol:.07,delay:.3+i*.07})); },
  bump(){ tone({type:'triangle',f0:140,f1:80,dur:.1,vol:.14}); noise({dur:.05,vol:.06,f0:400,f1:200,type:'lowpass'}); },
  allDoors(){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone({type:'square',f0:f,dur:.14,vol:.14,delay:i*.11})); tone({type:'triangle',f0:1568,dur:.7,vol:.12,delay:.8}); },
  grumpDie(){ tone({type:'sawtooth',f0:200,f1:40,dur:1.2,vol:.22,filter:600}); [400,330,250,180].forEach((f,i)=>tone({type:'sine',f0:f,f1:f*.6,dur:.25,vol:.12,delay:i*.25})); }
};

