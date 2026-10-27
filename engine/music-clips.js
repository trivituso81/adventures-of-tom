'use strict';
// engine/music-clips.js — Baked music (ElevenLabs tracks in music/<id>.mp3). Plays a looping track per area, a battle
// track (boss track when a boss is in the fight), and a victory or defeat jingle. Tracks crossfade; loops crossfade
// into themselves (the tracks are not seamless). Ducks under speech. engine/music.js calls clipTick() every 40 ms from
// musicTick(): it returns undefined when no clip covers this moment (the synth song then plays), anything else when
// clips are in charge (including silence). A track that fails to load is skipped and the synth covers for it.
// MC_TRACKS: id -> [kind (l loop, j jingle), seconds]. Regenerate from music/manifest.json (claude/music-merge.py).
const MC_TRACKS={"title":["l",30.1],"battle":["l",75.1],"boss":["l",90.1],"victory":["j",5.1],"defeat":["j",9.6],"town":["l",60.1],"row":["l",59.7],"hollow":["l",60.1],"pier":["l",60.1],"reeds":["l",60.1],"sundial":["l",60.1],"schoolyard":["l",60.1],"school":["l",60.1],"cafetorium":["l",60.1],"stacks":["l",60.1],"readroom":["l",60.1],"moonclub":["l",60.1],"dome":["l",60.1],"terminal":["l",60.1],"gatezero":["l",75.1],"blvd":["l",60.1],"jpark":["l",60.1],"griffith":["l",60.1],"studio":["l",60.1],"backlot":["l",60.1],"stage7":["l",60.1],"stageset":["l",60.1],"oakpark":["l",60.1],"oak":["l",60.1],"crown":["l",60.1],"carbarn":["l",60.1],"boiler":["l",60.1]};
const MC={bufs:new Map(),loading:new Map(),failed:new Set(),cur:null,old:[],jingle:null,jingleDone:false,inBattle:false,
  duck:null,out:null,ducked:false,XF:2.5,MAXLOOPS:3,lastWant:undefined,log:[]};
const MC_IN=Float32Array.from({length:64},(_,i)=>Math.sin(i/63*Math.PI/2)),MC_OUT=Float32Array.from({length:64},(_,i)=>Math.cos(i/63*Math.PI/2));
const mcOk=id=>!!MC_TRACKS[id]&&!MC.failed.has(id);

function mcChain() {
  if(MC.out) return MC.out;
  const c=sound.ctx; if(!c) return null;
  MC.duck=c.createGain(); MC.out=c.createGain(); MC.out.gain.value=.8;
  MC.duck.connect(MC.out); MC.out.connect(sound.musicBus||sound.master);
  return MC.duck;
}

// ---------- Loading: fetch, decode, keep a few decoded loops (a 60 s stereo track is about 21 MB decoded) ----------
function mcLoad(id) {
  if(MC.bufs.has(id)||MC.loading.has(id)||MC.failed.has(id)||!MC_TRACKS[id]||!sound.ctx) return;
  const c=sound.ctx;
  const p=fetch('music/'+id+'.mp3').then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.arrayBuffer(); })
    .then(ab=>new Promise((res,rej)=>{ const o=c.decodeAudioData(ab,res,rej); if(o&&o.catch) o.catch(rej); }))
    .then(buf=>{ MC.bufs.set(id,{buf,t:performance.now()}); mcEvict(); })
    .catch(e=>{ MC.failed.add(id); MC.log.push('load '+id+': '+(e&&e.message||e)); })
    .then(()=>{ MC.loading.delete(id); });
  MC.loading.set(id,p);
}
function mcBuf(id) { const e=MC.bufs.get(id); if(e) e.t=performance.now(); return e&&e.buf; }
function mcEvict() {
  const inUse=new Set([MC.cur&&MC.cur.id,...MC.old.map(v=>v.id)]);
  const loops=[...MC.bufs].filter(([id])=>MC_TRACKS[id][0]==='l');
  loops.sort((a,b)=>a[1].t-b[1].t);
  while(loops.length>MC.MAXLOOPS) {
    const i=loops.findIndex(([id])=>!inUse.has(id)); if(i<0) break;
    MC.bufs.delete(loops[i][0]); loops.splice(i,1);
  }
}

// ---------- Voices ----------
function mcCopy(v,t) {
  const c=sound.ctx,src=c.createBufferSource(),g=c.createGain();
  src.buffer=v.buf; src.connect(g); g.connect(v.gain);
  const first=!v.copies.length;
  if(first) g.gain.setValueAtTime(1,t);
  else { g.gain.setValueAtTime(0,t); g.gain.setValueCurveAtTime(MC_IN,t,MC.XF); }
  if(v.copies.length) { const p=v.copies[v.copies.length-1]; p.g.gain.setValueAtTime(1,t); p.g.gain.setValueCurveAtTime(MC_OUT,t,MC.XF); try { p.src.stop(t+MC.XF+.05); } catch(e) {} }
  src.start(t);
  const cp={src,g,t};
  v.copies.push(cp);
  src.onended=()=>{ try { g.disconnect(); } catch(e) {} const i=v.copies.indexOf(cp); if(i>=0) v.copies.splice(i,1); };
  v.nextAt=t+v.buf.duration-MC.XF;
}
function mcStart(id,fade) {
  const c=sound.ctx,dest=mcChain(),buf=mcBuf(id); if(!dest||!buf) return null;
  const v={id,buf,loop:MC_TRACKS[id][0]==='l',gain:c.createGain(),copies:[],nextAt:0,dead:false},t=c.currentTime+.03;
  v.gain.connect(dest);
  v.gain.gain.setValueAtTime(0,t); v.gain.gain.linearRampToValueAtTime(1,t+Math.max(.02,fade));
  mcCopy(v,t);
  if(!v.loop) v.end=t+buf.duration;
  return v;
}
function mcFadeOut(v,fade) {
  if(!v||v.dead) return;
  v.dead=true;
  const c=sound.ctx,t=c.currentTime;
  v.gain.gain.cancelScheduledValues(t); v.gain.gain.setValueAtTime(v.gain.gain.value,t); v.gain.gain.linearRampToValueAtTime(0,t+fade);
  MC.old.push(v);
  setTimeout(()=>{ for(const cp of v.copies.slice()) { try { cp.src.stop(); } catch(e) {} } try { v.gain.disconnect(); } catch(e) {} const i=MC.old.indexOf(v); if(i>=0) MC.old.splice(i,1); },fade*1000+150);
}

// ---------- What should play ----------
function mcAreaTrack(m) {
  if(!m) return undefined;
  if(MC_TRACKS[m.id]&&m.id!=='battle'&&m.id!=='boss') return m.id;
  const h=typeof houseById!=='undefined'?houseById[m.id]:null;
  if(h&&h.area&&MC_TRACKS[h.area]) return h.area;
  return undefined;
}
function mcBossFight() { try { return B2.active&&B2.foes.some(f=>f.boss); } catch(e) { return false; } }

function clipWanted() {
  if(!sound.enabled||!music.on||document.hidden) return null;
  if(typeof intro!=='undefined'&&intro.active&&intro.flight) return null;
  const now=sound.ctx.currentTime;
  if(MC.jingle&&now<MC.jingle.end) return MC.jingle.id;
  if(battle.active) {
    if(MC.jingleDone) return null;                 // the fight is won or lost: stay quiet through the reward card
    const id=mcBossFight()&&mcOk('boss')?'boss':'battle';
    return mcOk(id)?id:undefined;
  }
  if(typeof splash!=='undefined'&&splash.active&&mcOk('title')) return 'title';   // title screen, chapter select, Battle Lab menu
  const a=mcAreaTrack(currentMap);
  return a&&mcOk(a)?a:undefined;
}

// Victory and defeat: play the baked jingle in place of the synth sting (returns false to let the sting play).
function mcJingle(id) {
  const c=sound.ctx;
  if(!c||!music.on||!sound.enabled||document.hidden||!mcOk(id)||!mcBuf(id)) return false;
  MC.jingle={id,end:c.currentTime+MC_TRACKS[id][1]+.25}; MC.jingleDone=true;
  return true;
}
{ const w=sfx.win,l=sfx.lose;
  sfx.win=function() { if(mcJingle('victory')) return; return w.apply(this,arguments); };
  sfx.lose=function() { if(mcJingle('defeat')) return; return l.apply(this,arguments); }; }

// ---------- Tick ----------
function clipTick() {
  const c=sound.ctx; if(!c) return undefined;
  if(battle.active!==MC.inBattle) { MC.inBattle=battle.active; if(battle.active) { MC.jingle=null; MC.jingleDone=false; } }
  const want=clipWanted();
  MC.lastWant=want;
  const cur=MC.cur;
  if(want===undefined) { if(cur) { mcFadeOut(cur,.8); MC.cur=null; } return undefined; }
  if(want===null) { if(cur) { mcFadeOut(cur,.8); MC.cur=null; } return true; }
  if(!cur||cur.id!==want||cur.dead) {
    if(!mcBuf(want)) { mcLoad(want); if(!MC.loading.has(want)&&MC.failed.has(want)) return undefined; return true; }
    const jingle=MC_TRACKS[want][0]==='j',fast=jingle||want==='battle'||want==='boss'||(cur&&(cur.id==='battle'||cur.id==='boss'));
    const fade=jingle?.05:fast?.45:1.3;
    if(cur) mcFadeOut(cur,jingle?.3:fast?.45:1.3);
    MC.cur=mcStart(want,fade);
  }
  const v=MC.cur;
  if(v) {
    if(v.loop) { while(c.currentTime>v.nextAt-.35) mcCopy(v,Math.max(v.nextAt,c.currentTime+.02)); }
    else if(c.currentTime>v.end+.1) { MC.cur=null; mcFadeOut(v,.05); }
  }
  // Warm the cache while idle: the jingles first (small), then the battle track.
  if(!battle.active&&!MC.loading.size) for(const id of ['victory','defeat','battle']) if(!MC.bufs.has(id)&&mcOk(id)) { mcLoad(id); break; }
  // Duck under spoken lines, same as the synth.
  const talking=c.currentTime<music.duckUntil||(typeof DV!=='undefined'&&DV.playing)||('speechSynthesis'in window&&speechSynthesis.speaking);
  if(MC.duck&&talking!==MC.ducked) { MC.ducked=talking; MC.duck.gain.setTargetAtTime(talking?.4:1,c.currentTime,talking?.05:.25); }
  return true;
}

if(window.__LE) Object.assign(window.__LE,{MC,MC_TRACKS,clipTick,clipWanted});
