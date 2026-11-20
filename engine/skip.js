'use strict';
// engine/skip.js — Fast-forward and skip for cutscenes (anything that runs through intro.phase 'scene': story scenes,
// the opening, the flights).
// FAST  (button, gamepad B, keyboard F): the scene runs at 3x, text appears at once and pages turn on their own. Toggle.
// SKIP  (button, gamepad Start/Select, keyboard Esc): the scene runs to its end in one go, silently. Every step still
//       happens (flags, items, party changes), so skipping never breaks the story. It pauses at a choice (the player
//       picks) and stops at a story fight; both modes reset when a fight starts or the scene ends.
// Loaded after engine/splash.js, before engine/main.js.
const cut={ff:false,skip:false,hold:0,muteUntil:0,voiceMute:false,carry:null};
// Scene 1 of chapter 1 is two scripts (the opening, then Grace's list, ch1Goal) that Tom sees as one scene (Tom 2026-11-19: "when i hit skip it
// should skip until the whole thing is done"). A scene that sets `intro.chain` to the id of the scene that follows it (beginOpening, engine/story.js)
// hands a SKIP on: the next scene starts already skipped.
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

// A scene that starts while a carry is waiting is skipped from its first step; any other scene clears the carry.
const LE_playScene_cut=playScene;
playScene=function(script,opts) {
  const carried=cut.carry&&script===cut.carry&&performance.now()-cut.carryAt<5000;
  cut.carry=null;
  const r=LE_playScene_cut(script,opts);
  intro.chain=null;
  if(carried&&cutsceneOn()) { cut.skip=true; cut.muteUntil=performance.now()+1200; }
  return r;
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
      if(intro.chain) { cut.carry=intro.chain; cut.carryAt=performance.now(); }
      if(dialog.active) {
        if(onChoiceNow()) { revealLine(); break; }   // the player picks; skipping carries on after
        revealLine(); advanceDialog();
        continue;
      }
      LE_updateIntro_cut(.1);
    }
    if(battle.active||!intro.active) { const c=battle.active?null:cut.carry; cutReset(); cut.carry=c; }   // the next scene of the chain starts skipped
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
  cutWatchdog(dt);
  return LE_updateIntro_cut(dt);
};
// Stalled-step guard (roofnpc1, Gemini audit 2026-11-18: FAST and SKIP stayed up after a scene and Tom could not walk). A scene step that
// is not waiting on the player (no dialogue, choice, fight, close-up, report or map change) and has not finished in 40 seconds is dropped,
// so the scene carries on and ends instead of freezing the game. Nothing in a scene legitimately runs that long without one of those.
const cutWatch={cur:null,t:0};
function cutWatchdog(dt) {
  if(intro.cur!==cutWatch.cur) { cutWatch.cur=intro.cur; cutWatch.t=0; return; }
  if(!intro.cur||dialog.active||battle.active||(typeof closeup!=='undefined'&&closeup.active)||(typeof brp!=='undefined'&&brp.open)||(typeof transition!=='undefined'&&transition)) { cutWatch.t=0; return; }
  if((cutWatch.t+=dt)<40) return;
  console.warn('scene step stalled for 40 s, moving on',intro.sid);
  intro.cur=null; cutWatch.cur=null; cutWatch.t=0;
}

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
// FAST and SKIP come up a moment after a scene starts, so they never sit over the title page while it fades (roofnpc1, Gemini audit).
let cutShownAt=0,cutLiveEnd=-1e9,cutClassUntil=0;
function refreshCutUI() {
  const live=cutsceneOn(),now=performance.now();
  if(!live) { if(cutShownAt) cutLiveEnd=now; cutShownAt=0; } else if(!cutShownAt) cutShownAt=now-(now-cutLiveEnd<1500?1e4:0);   // scene straight after a scene: no flicker
  const on=live&&now-cutShownAt>900&&!(typeof closeup!=='undefined'&&closeup.active)&&!intro.showcase&&!intro.card;   // not over a close-up picture (roofnpc2), the squishy showcase or a chapter card (cutpolish1)
  const w=$('cut-ctrl'); if(w.hidden===on) w.hidden=!on;
  if(live) cutClassUntil=now+250;   // the cutscene class (arrows, minimap, A button hidden) lingers 250 ms so nothing blinks between two scenes
  const root=document.documentElement;
  root.classList.toggle('cutscene',live||now<cutClassUntil);
  root.classList.toggle('talking',live&&dialog.active);   // the A button is shown only while a box is open (CONTINUE)
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
