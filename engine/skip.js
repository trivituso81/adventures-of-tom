'use strict';
// engine/skip.js — Fast-forward and skip for cutscenes (anything that runs through intro.phase 'scene': story scenes,
// the opening, the flights).
// FAST  (button, gamepad B, keyboard F): the scene runs at 3x, text appears at once and pages turn on their own. Toggle.
// SKIP  (button, gamepad Start/Select, keyboard Esc): the scene runs to its end in one go, silently. Every step still
//       happens (flags, items, party changes), so skipping never breaks the story. It pauses at a choice (the player
//       picks) and stops at a story fight; both modes reset when a fight starts or the scene ends.
// Loaded after engine/splash.js, before engine/main.js.
const cut={ff:false,skip:false,hold:0,muteUntil:0,voiceMute:false};
function cutsceneOn() { return intro.active&&intro.phase==='scene'&&!battle.active; }
function cutReset() { cut.ff=false; cut.skip=false; cut.hold=0; cut.voiceMute=false; }
function cutFF() {
  if(!cutsceneOn()) return;
  cut.ff=!cut.ff; cut.hold=0; sfx.select();
  if(cut.ff) stopSpeech();
}
function cutSkip() {
  if(!cutsceneOn()||cut.skip) return;
  sfx.select(); cut.skip=true; stopSpeech();
}
function stopSpeech() { if('speechSynthesis'in window) { try { speechSynthesis.cancel(); } catch(e) {} } }
const cutMuted=()=>cut.skip||performance.now()<cut.muteUntil;

// Silence while skipping (and for a moment after, so delayed sounds from skipped steps do not all go off at once).
// Voices are also quiet in FAST mode, since pages turn faster than the lines can be spoken.
const LE_tone_cut=tone,LE_noise_cut=noise,LE_say_cut=say;
tone=function(o) { if(cutMuted()) return; return LE_tone_cut(o); };
noise=function(o) { if(cutMuted()) return; return LE_noise_cut(o); };
say=function(id,kind,delay=0,only=null,slice=null) {
  if(cutMuted()||(cut.ff&&cutsceneOn())) return;
  if(delay) { setTimeout(()=>{ if(!cutMuted()&&!(cut.ff&&cutsceneOn())) LE_say_cut(id,kind,0,only,slice); },delay*1000); return; }
  return LE_say_cut(id,kind,0,only,slice);
};

const onChoiceNow=()=>dialog.active&&dialog.choice&&dialog.index===dialog.lines.length-1;
function revealLine() { if(dialog.active&&dialog.shown<dialog.chars.length) advanceDialog(); }

const LE_updateIntro_cut=updateIntro;
updateIntro=function(dt) {
  if(!cutsceneOn()) { if(cut.ff||cut.skip) cutReset(); return LE_updateIntro_cut(dt); }
  if(cut.skip) {
    cut.muteUntil=performance.now()+1200;
    for(let i=0;i<600;i++) {
      if(!cutsceneOn()) break;
      if(dialog.active) {
        if(onChoiceNow()) { revealLine(); break; }   // the player picks; skipping carries on after
        revealLine(); advanceDialog();
        continue;
      }
      LE_updateIntro_cut(.1);
    }
    if(battle.active||!intro.active) cutReset();
    return;
  }
  if(cut.ff) {
    if(dialog.active&&!onChoiceNow()) {
      revealLine();
      if((cut.hold+=dt)>=.9) { cut.hold=0; advanceDialog(); }
    } else if(dialog.active) revealLine();
    else cut.hold=0;
    LE_updateIntro_cut(dt*3);
    if(battle.active) cutReset();
    return;
  }
  return LE_updateIntro_cut(dt);
};

// ---------- Buttons ----------
(function() {
  const wrap=document.createElement('div'); wrap.id='cut-ctrl'; wrap.hidden=true;
  wrap.innerHTML='<button id="cut-ff" type="button" aria-label="Fast forward the scene">FAST »</button>'+
                 '<button id="cut-skip" type="button" aria-label="Skip the scene">SKIP »|</button>';
  $('game').appendChild(wrap);
  const bind=(el,fn)=>{
    el.addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); lastTouchTime=performance.now(); fn(); },nonPassive);
    el.addEventListener('click',e=>{ e.stopPropagation(); if(performance.now()-lastTouchTime>500) fn(); });
  };
  bind($('cut-ff'),cutFF); bind($('cut-skip'),cutSkip);
})();
function refreshCutUI() {
  const on=cutsceneOn();
  const w=$('cut-ctrl'); if(w.hidden===on) w.hidden=!on;
  document.documentElement.classList.toggle('cutscene',on);
  $('cut-ff').classList.toggle('on',cut.ff);
  $('cut-skip').classList.toggle('on',cut.skip);
}
const LE_updateUI_cut=updateUI;
updateUI=function(now) { refreshCutUI(); return LE_updateUI_cut(now); };

window.addEventListener('keydown',e=>{
  if(!cutsceneOn()||e.repeat) return;
  if(e.code==='Escape') { e.preventDefault(); cutSkip(); }
  else if(e.code==='KeyF') { e.preventDefault(); cutFF(); }
});
