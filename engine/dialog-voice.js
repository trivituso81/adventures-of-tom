'use strict';
// engine/dialog-voice.js — Spoken dialogue boxes. Every page of a dialogue box (scenes, NPCs, monsters, shopkeepers) plays
// the baked clip for its speaker's voice and exact text, if there is one (data/dialog-cast.js; clips in DIALOG_CLIPS from
// data/voice/dialog-ch<N>.js). Lines without a clip stay silent, as before, so unbaked chapters are unchanged.
// - A scene's own voice entry (a battle line from data/lines.js) yields to the dialogue clip on the same page.
// - A family greet bark said right before a dialogue box opens is dropped when the box's first page has its own clip.
// - The clip stops when the page turns, the box closes, a cutscene is fast-forwarded or skipped, or sound goes off.
// - While a clip plays, the typewriter blips are quiet.
// Clip files load after startup, one after another, so they never slow the title screen.
// Loaded after engine/chapter-select.js (wraps say, stopSpeech, loadDialogLine, advanceDialog, pickChoice, S.talk).
const DV={src:null,token:0,cache:new Map(),page:-1,playing:false,pendingSay:[]};

function dvVoiceOf(name) { return DIALOG_CAST.speakers[String(name||'').trim()]||null; }
function dvClip(name,text) {
  const v=dvVoiceOf(name); if(!v||typeof text!=='string') return null;
  return DIALOG_CLIPS.clips[v+'|'+text]||(typeof CONTRACT_OLD!=='undefined'&&CONTRACT_OLD[text]&&DIALOG_CLIPS.clips[v+'|'+CONTRACT_OLD[text]])||null;
}
function dvStop() {
  DV.token++; DV.playing=false;
  if(DV.src) { try { DV.src.onended=null; DV.src.stop(); } catch(e) {} DV.src=null; }
}
function dvMuted() {
  if(!sound.enabled) return true;
  if(typeof cutMuted==='function'&&cutMuted()) return true;
  if(typeof cut!=='undefined'&&cut.ff&&cutsceneOn()) return true;
  return false;
}
// Decode once, then play through the game's master bus.
function dvPlay(b64) {
  dvStop();
  const c=audio(); if(!c) return;
  const tok=DV.token;
  DV.playing=true;
  const go=buf=>{
    if(tok!==DV.token||dvMuted()) { if(tok===DV.token) DV.playing=false; return; }
    const src=c.createBufferSource(); src.buffer=buf; src.connect(sound.master);
    src.onended=()=>{ if(DV.src===src) { DV.src=null; DV.playing=false; } };
    DV.src=src; src.start();
  };
  if(DV.cache.has(b64)) { go(DV.cache.get(b64)); return; }
  try {
    const bin=atob(b64),u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
    c.decodeAudioData(u.buffer).then(buf=>{ DV.cache.set(b64,buf); go(buf); }).catch(()=>{ if(tok===DV.token) DV.playing=false; });
  } catch(e) { DV.playing=false; }
}

// Overworld barks (say) wait one tick, so a dialogue box opened in the same moment can claim the voice first.
const LE_say_dv=say;
say=function(id,kind,delay=0,only=null,slice=null) {
  if(battle.active||(typeof cutsceneOn==='function'&&cutsceneOn())) return LE_say_dv(id,kind,delay,only,slice);
  const h=setTimeout(()=>{ DV.pendingSay=DV.pendingSay.filter(x=>x!==h); LE_say_dv(id,kind,delay,only,slice); },0);
  DV.pendingSay.push(h);
};
function dvDropPendingSay() { for(const h of DV.pendingSay) clearTimeout(h); DV.pendingSay=[]; }

// Each page: play its clip (or stop the last one).
const LE_loadDialogLine_dv=loadDialogLine;
loadDialogLine=function() {
  LE_loadDialogLine_dv();
  const clip=dvClip(dialog.name,dialog.lines[dialog.index]);
  DV.page=clip?dialog.index:-1;
  if(!clip) { dvStop(); return; }
  if(dialog.index===0) dvDropPendingSay();
  if(dvMuted()) { dvStop(); return; }
  dvPlay(clip);
};
const LE_advanceDialog_dv=advanceDialog;
advanceDialog=function() { LE_advanceDialog_dv(); if(!dialog.active) dvStop(); };
const LE_pickChoice_dv=pickChoice;
pickChoice=function(i) { dvStop(); return LE_pickChoice_dv(i); };
const LE_stopSpeech_dv=stopSpeech;
stopSpeech=function() { dvStop(); return LE_stopSpeech_dv(); };
const LE_setSound_dv=setSound;
setSound=function(on) { if(!on) dvStop(); return LE_setSound_dv(on); };
// Quiet typewriter while someone is speaking.
const LE_sfxText_dv=sfx.text;
sfx.text=function(...a) { if(DV.playing) return; return LE_sfxText_dv.apply(this,a); };

// Scene talk steps: a page with its own dialogue clip does not also play the scene's battle-line voice.
const LE_talk_dv=S.talk;
S.talk=function(name,lines,voice) {
  const st=LE_talk_dv(name,lines,voice);
  const speak=st.speak;
  st.speak=function() { if(DV.page===dialog.index&&dialog.active) { this.i=dialog.index; return; } return speak.call(this); };
  return st;
};

// The shop's greeting note (Penny's hello lines) is spoken too.
if(typeof openShop==='function') {
  const LE_openShop_dv=openShop;
  openShop=function(note) {
    const was=shopOpen; LE_openShop_dv(note);
    if(!was&&shopOpen&&typeof shopNote==='string') { const n=currentMap.npcs.find(x=>x.shopkeeper); const c=n&&dvClip(n.name,shopNote); if(c&&!dvMuted()) dvPlay(c); }
  };
  const LE_closeShop_dv=closeShop;
  closeShop=function() { dvStop(); return LE_closeShop_dv(); };
}

// Load the chapter clip files after startup, one at a time. A missing file is skipped quietly.
function dvLoadFiles() {
  const list=(DIALOG_CAST.files||[]).slice();
  const next=()=>{
    const f=list.shift(); if(!f) return;
    const s=document.createElement('script'); s.src=f; s.async=true;
    s.onload=s.onerror=()=>setTimeout(next,50);
    document.body.appendChild(s);
  };
  next();
}
if(document.readyState==='complete') setTimeout(dvLoadFiles,400);
else addEventListener('load',()=>setTimeout(dvLoadFiles,400));
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{DV,dvClip,dvVoiceOf,DIALOG_CAST,DIALOG_CLIPS}); });
