'use strict';
// engine/music.js — SNES-style music. Instruments are small samples generated once at startup (the SNES played
// recorded samples, not raw waveforms), pitched by playback rate, sent through an echo like the SNES's, then
// softened by a gentle low-pass. Songs (data/songs.js) are note lists per channel, compiled by defineSong().
// musicTick() decides which song fits the moment (area, battle, cutscene) and crossfades to it.
const music={on:true,eng:null,cur:null,want:null,duckUntil:0,ducked:false,session:null};
try { music.on=localStorage.getItem('le-music')!=='off'; } catch(e) {}
const SONGS={};

// ---------- Notes ----------
const NOTE_OFS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function noteMidi(s) {
  const m=/^([A-G])(#|b)?(-?\d)$/.exec(s);
  if(!m) throw new Error('bad note '+s);
  return 12*(+m[3]+1)+NOTE_OFS[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
}
// "A4/6 G4/2 -/4 F3+A3+C4/16 v.7": note or chord / length in 16th steps, '-' rest, vN sets velocity.
function parseNotes(str,start=0) {
  const out=[]; let step=start,vel=1;
  for(const tok of str.trim().split(/\s+/)) {
    if(!tok) continue;
    if(tok[0]==='v') { vel=parseFloat(tok.slice(1)); continue; }
    const [n,l]=tok.split('/'); const len=+l;
    if(!(len>0)) throw new Error('bad length '+tok);
    if(n!=='-') out.push({step,len,vel,midi:n==='x'?null:n.split('+').map(noteMidi)});
    step+=len;
  }
  out.end=step;
  return out;
}

// ---------- Instruments (generated samples) ----------
function genInstruments(c) {
  const SR=32000;
  let seed=1234567;
  const rnd=()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296*2-1; };
  const lpA=fc=>1-Math.exp(-2*Math.PI*fc/SR);
  const mk=(data,o)=>{
    let pk=0; for(const v of data) pk=Math.max(pk,Math.abs(v));
    const b=c.createBuffer(1,data.length,SR),d=b.getChannelData(0);
    for(let i=0;i<data.length;i++) d[i]=data[i]/(pk||1);
    const r=Object.assign({buf:b},o);
    if(o.f) r.midi=69+12*Math.log2(o.f/440);
    if(o.loop) { r.ls=o.loop[0]/SR; r.le=o.loop[1]/SR; }
    return r;
  };
  const TAU=Math.PI*2,I={};
  // Sustained tones: the loop holds a whole number of periods, so it loops without a click.
  const sustained=(P,harm,attack,breath,periods)=>{
    const att=P*Math.ceil(attack*SR/P),n=att+P*periods,d=new Float32Array(n);
    let lp=0; const a=lpA(2600);
    for(let i=0;i<n;i++) {
      const ph=TAU*i/P; let v=0;
      for(let h=0;h<harm.length;h++) if(harm[h]) v+=harm[h]*Math.sin(ph*(h+1));
      if(i<att) { lp+=a*(rnd()-lp); v=v*Math.min(1,i/(att*.7))+breath*lp*Math.pow(1-i/att,2); }
      d[i]=v;
    }
    return {d,loop:[att,n]};
  };
  { const P=61,s=sustained(P,[1,.22,.07,.02],.07,.9,200);
    I.flute=mk(s.d,{f:SR/P,loop:s.loop,a:.035,r:.14,gain:.30,vib:12}); }
  { const P=61,s=sustained(P,[1,.05,.38,0,.18,0,.1,0,.05],.05,.5,200);
    I.reed=mk(s.d,{f:SR/P,loop:s.loop,a:.025,r:.12,gain:.27,vib:10}); }
  { // String ensemble: three detuned voices, each a soft band-limited saw, each completing whole cycles in the loop.
    const P=122,k=120,L=P*k,d=new Float32Array(L);
    for(const n of [k-1,k,k+1]) for(let h=1;h<=16;h++) {
      const amp=(1/h)*Math.exp(-h/5),ph0=(rnd()+1)*Math.PI;
      for(let i=0;i<L;i++) d[i]+=amp*Math.sin(TAU*h*n*i/L+ph0);
    }
    I.strings=mk(d,{f:SR/P,loop:[0,L],a:.32,r:.45,gain:.13});
  }
  { // Harp: plucked string (Karplus-Strong).
    const P=61,n=Math.ceil(2.4*SR),d=new Float32Array(n),buf=new Float32Array(P);
    let lp=0; const a=lpA(5000);
    for(let i=0;i<P;i++) { lp+=a*(rnd()-lp); buf[i]=lp; }
    let j=0;
    for(let i=0;i<n;i++) { const x=buf[j],y=buf[(j+1)%P]; d[i]=x; buf[j]=.9985*(x+y)/2; j=(j+1)%P; }
    I.harp=mk(d,{f:SR/(P+.5),a:.002,r:.3,gain:.34});
  }
  { // Fingered bass.
    const P=244,n=Math.ceil(1.8*SR),d=new Float32Array(n);
    for(let i=0;i<n;i++) {
      const t=i/SR,ph=TAU*i/P;
      d[i]=Math.min(1,t/.003)*(Math.sin(ph)*Math.exp(-t*1.4)+.4*Math.sin(2*ph)*Math.exp(-t*4)+.15*Math.sin(3*ph)*Math.exp(-t*9))+.08*rnd()*Math.exp(-t*80);
    }
    I.bass=mk(d,{f:SR/P,a:.004,r:.07,gain:.3});
  }
  { // Glockenspiel bell (FM).
    const P=61,n=Math.ceil(2.2*SR),d=new Float32Array(n);
    for(let i=0;i<n;i++) {
      const t=i/SR,ph=TAU*i/P,idx=1.6*Math.exp(-t*4)+.15;
      d[i]=Math.sin(ph+idx*Math.sin(ph*3.5))*Math.exp(-t*2.4)+.25*Math.sin(ph*4)*Math.exp(-t*7);
    }
    I.bell=mk(d,{f:SR/P,a:.002,r:.5,gain:.2});
  }
  // Drums (unpitched).
  { const n=Math.ceil(.35*SR),d=new Float32Array(n); let ph=0;
    for(let i=0;i<n;i++) { const t=i/SR; ph+=TAU*(46+110*Math.exp(-t*30))/SR; d[i]=Math.sin(ph)*Math.exp(-t*9)+.3*rnd()*Math.exp(-t*400); }
    I.kick=mk(d,{a:0,r:.05,gain:.36}); }
  { const n=Math.ceil(.3*SR),d=new Float32Array(n); let lo=0,hi=0; const a1=lpA(5200),a2=lpA(900);
    for(let i=0;i<n;i++) { const t=i/SR,x=rnd(); lo+=a1*(x-lo); hi+=a2*(lo-hi); d[i]=(lo-hi)*Math.min(1,t/.006)*Math.exp(-t*13)+.25*Math.sin(TAU*190*t)*Math.exp(-t*30); }
    I.brush=mk(d,{a:0,r:.05,gain:.26}); }
  { const n=Math.ceil(.09*SR),d=new Float32Array(n); let lo=0; const a=lpA(6000);
    for(let i=0;i<n;i++) { const t=i/SR,x=rnd(); lo+=a*(x-lo); d[i]=(x-lo)*Math.exp(-t*65); }
    I.hat=mk(d,{a:0,r:.02,gain:.12}); }
  { const n=Math.ceil(.12*SR),d=new Float32Array(n); let lo=0; const a=lpA(4000);
    for(let i=0;i<n;i++) { const t=i/SR,x=rnd(); lo+=a*(x-lo); d[i]=(x-lo)*Math.min(1,t/.018)*Math.exp(-t*32); }
    I.shaker=mk(d,{a:0,r:.02,gain:.09}); }
  return I;
}

// ---------- Engine: a context, its instruments, the echo and the output chain ----------
function makeMusicEngine(c,dest) {
  const E={c,inst:genInstruments(c)};
  E.out=c.createGain(); E.out.connect(dest);
  E.soft=c.createBiquadFilter(); E.soft.type='lowpass'; E.soft.frequency.value=11000; E.soft.Q.value=.5; E.soft.connect(E.out);
  // Echo: delay with filtered feedback, like the SNES echo buffer.
  E.echoIn=c.createGain();
  E.delay=c.createDelay(1); E.delay.delayTime.value=.27;
  E.fbFilt=c.createBiquadFilter(); E.fbFilt.type='lowpass'; E.fbFilt.frequency.value=2400;
  E.fb=c.createGain(); E.fb.gain.value=.36;
  E.wet=c.createGain(); E.wet.gain.value=.32;
  E.echoIn.connect(E.delay); E.delay.connect(E.fbFilt); E.fbFilt.connect(E.fb); E.fb.connect(E.delay);
  E.fbFilt.connect(E.wet); E.wet.connect(E.soft);
  return E;
}

// One playing song: its gain (for fades), a panner and echo send per channel, the sources still sounding.
function songGraph(E,song,t0) {
  const c=E.c,G={song,gain:c.createGain(),send:c.createGain(),ch:{},srcs:new Set()};
  G.gain.gain.value=1; G.gain.connect(E.soft);
  G.send.connect(E.echoIn);
  if(song.echo) { E.delay.delayTime.setValueAtTime(song.echo.time,t0); E.fb.gain.setValueAtTime(song.echo.fb,t0); E.wet.gain.setValueAtTime(song.echo.wet,t0); }
  for(const k in song.channels) {
    const ch=song.channels[k],pan=c.createStereoPanner?c.createStereoPanner():c.createGain();
    if(pan.pan) pan.pan.value=ch.pan||0;
    const v=c.createGain(); v.gain.value=ch.vol==null?1:ch.vol;
    v.connect(pan); pan.connect(G.gain);
    const s=c.createGain(); s.gain.value=ch.send||0; pan.connect(s); s.connect(G.send);
    G.ch[k]={v};
  }
  return G;
}

function playNote(E,G,chKey,ev,t,stepDur) {
  const c=E.c,ch=G.song.channels[chKey],I=E.inst[ch.inst];
  if(!I) return;
  const dur=Math.max(.04,ev.len*stepDur*(ch.legato||.92));
  for(const m of (ev.midi||[null])) {
    const src=c.createBufferSource(); src.buffer=I.buf;
    if(I.ls!=null) { src.loop=true; src.loopStart=I.ls; src.loopEnd=I.le; }
    if(m!=null&&I.midi!=null) src.playbackRate.value=Math.pow(2,(m-I.midi)/12);
    const g=c.createGain(),peak=I.gain*ev.vel*(ch.vel||1)/(ev.midi&&ev.midi.length>1?Math.sqrt(ev.midi.length):1);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(peak,t+Math.max(.001,I.a));
    g.gain.setValueAtTime(peak,t+dur);
    g.gain.exponentialRampToValueAtTime(.0005,t+dur+I.r);
    src.connect(g); g.connect(G.ch[chKey].v);
    if(I.vib&&dur>.35&&src.detune) {
      const lfo=c.createOscillator(),lg=c.createGain(); lfo.frequency.value=5.2;
      lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(0,t+.18); lg.gain.linearRampToValueAtTime(I.vib,t+.5);
      lfo.connect(lg); lg.connect(src.detune); lfo.start(t); lfo.stop(t+dur+I.r+.05);
    }
    src.start(t); src.stop(t+dur+I.r+.05);
    G.srcs.add(src); src.onended=()=>G.srcs.delete(src);
  }
}

// Schedule every event of one step at time t.
function playStep(E,G,step,t) {
  const song=G.song,sd=60/song.bpm/4;
  for(const [k,ev] of song.at[step]||[]) {
    const swing=(ev.step%4===2)?song.swing*sd:0;
    playNote(E,G,k,ev,t+swing,sd);
  }
}

// ---------- Songs ----------
// channels: {key:{inst,pan,send,vol,vel,legato,notes:[events]}}; bars of 16 steps; loops back to `loop` (a bar).
function defineSong(id,def) {
  const len=def.bars*16,at=Array.from({length:len},()=>[]);
  for(const k in def.channels) {
    const ch=def.channels[k];
    for(const ev of ch.notes) if(ev.step<len) at[ev.step].push([k,ev]);
  }
  SONGS[id]=Object.assign({swing:0,loop:0,echo:{time:.27,fb:.36,wet:.32}},def,{len,at});
  return SONGS[id];
}

// ---------- Live playback ----------
function musicEngine() {
  if(music.eng) return music.eng;
  const c=sound.ctx; if(!c) return null;
  const duck=c.createGain(),vol=c.createGain();
  vol.gain.value=.31; duck.connect(vol); vol.connect(sound.master);
  music.eng=makeMusicEngine(c,duck); music.eng.duck=duck;
  return music.eng;
}

function musicStart(id) {
  const E=musicEngine(); if(!E) return;
  musicStop(.9);
  const song=SONGS[id]; if(!song) return;
  const c=E.c,t0=c.currentTime+.08,G=songGraph(E,song,t0);
  G.gain.gain.setValueAtTime(0,t0); G.gain.gain.linearRampToValueAtTime(1,t0+.5);
  G.id=id; G.step=0; G.next=t0;
  music.cur=G;
}

function musicStop(fade=.8) {
  const G=music.cur; if(!G) return;
  music.cur=null;
  const c=music.eng.c,t=c.currentTime;
  G.gain.gain.cancelScheduledValues(t); G.gain.gain.setValueAtTime(G.gain.gain.value,t); G.gain.gain.linearRampToValueAtTime(0,t+fade);
  G.send.gain.setValueAtTime(1,t); G.send.gain.linearRampToValueAtTime(0,t+fade);
  setTimeout(()=>{ for(const s of G.srcs) { try { s.stop(); } catch(e) {} } G.gain.disconnect(); G.send.disconnect(); },fade*1000+120);
}

// Which song fits right now. null means silence.
function musicWanted() {
  if(!sound.enabled||!music.on||document.hidden) return null;
  if(typeof intro!=='undefined'&&intro.active&&intro.flight) return null;
  if(battle.active) return null;
  if(regionOf(currentMap)==='le'&&currentMap.id!=='hollow') return 'town';
  return null;
}

function musicTick() {
  const c=sound.ctx;
  if(!c||c.state!=='running') return;
  // iOS: let music play even with the ring/silent switch on silent.
  const sess=music.on&&sound.enabled?'playback':'auto';
  if(navigator.audioSession&&music.session!==sess) { try { navigator.audioSession.type=sess; music.session=sess; } catch(e) {} }
  const want=musicWanted();
  if(want!==(music.cur&&music.cur.id)) { if(want) musicStart(want); else musicStop(); }
  const G=music.cur;
  if(G) {
    const song=G.song,sd=60/song.bpm/4;
    if(G.next<c.currentTime-.5) G.next=c.currentTime+.05; // fell behind (tab was busy): skip ahead
    while(G.next<c.currentTime+.3) {
      playStep(music.eng,G,G.step,G.next);
      G.next+=sd; G.step++;
      if(G.step>=song.len) G.step=song.loop*16;
    }
  }
  // Duck under spoken lines.
  const talking=c.currentTime<music.duckUntil||('speechSynthesis'in window&&speechSynthesis.speaking);
  if(music.eng&&talking!==music.ducked) {
    music.ducked=talking;
    music.eng.duck.gain.setTargetAtTime(talking?.4:1,c.currentTime,talking?.05:.25);
  }
}
setInterval(musicTick,40);

// Baked clips: duck for the clip's length (estimated from its size: 128 kbps MP3).
const playClipPlain=playClip;
playClip=function(cl,part) {
  const ok=playClipPlain(cl,part);
  if(ok&&sound.ctx) {
    const secs=part?(part.to-part.from):cl.mp3.length*.75*8/128000;
    music.duckUntil=Math.max(music.duckUntil,sound.ctx.currentTime+secs+.15);
  }
  return ok;
};

function setMusic(on) {
  music.on=on;
  try { localStorage.setItem('le-music',on?'on':'off'); } catch(e) {}
  const b=$('music-toggle');
  if(b) { b.classList.toggle('off',!on); b.setAttribute('aria-label',on?'Music on. Tap to turn off':'Music off. Tap to turn on'); }
}
if($('music-toggle')) $('music-toggle').addEventListener('click',()=>{ setMusic(!music.on); sfx.select(); });
setMusic(music.on);

// Render a song offline to a stereo buffer (for previews and tests).
function musicRender(id,seconds) {
  const SR=44100,oc=new OfflineAudioContext(2,Math.ceil(SR*seconds),SR);
  const E=makeMusicEngine(oc,oc.destination),song=SONGS[id],G=songGraph(E,song,0),sd=60/song.bpm/4;
  let t=.05,step=0;
  while(t<seconds) { playStep(E,G,step,t); t+=sd; step++; if(step>=song.len) step=song.loop*16; }
  return oc.startRendering();
}

if(window.__LE) Object.assign(window.__LE,{music,SONGS,musicRender,setMusic});
