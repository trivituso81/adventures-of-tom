'use strict';
// engine/dialog-auto.js: AUTO for dialogue boxes.
// A small AUTO button sits in the dialogue footer. While it is ON, every dialogue page (NPCs, scenes, monsters, signs)
// moves on by itself, so nobody has to tap the box to read the next line.
// - Pages with a spoken clip: waits for the clip to finish, then a short beat.
// - Pages without one: waits a read time that grows with the length of the line.
// - Never answers a yes/no prompt: when choices are showing, AUTO holds and the player picks.
// - Tapping the box (or A / Enter) still moves on immediately, and the timer restarts on the next page.
// - The setting is remembered between visits. Keyboard: T toggles it. Gamepad: X toggles it.
// Loaded after engine/dialog-voice.js (uses DV and dvMuted from there) and before engine/main.js.
const DA={on:false,t:0,last:performance.now(),padX:false};
try { DA.on=localStorage.getItem('le-dialog-auto')==='on'; } catch(e) {}

function daSync() {
  const b=$('dialog-auto'); if(!b) return;
  b.textContent=DA.on?'AUTO ON':'AUTO OFF';
  b.classList.toggle('on',DA.on);
  b.setAttribute('aria-pressed',DA.on?'true':'false');
}
// Rose Mode (engine/feel.js): every conversation opens with AUTO ON, since Rose cannot read yet. The button still
// turns it off for that one conversation; the saved setting belongs to Grace and Director Modes and is left alone.
const daRose=()=>typeof B7!=='undefined'&&B7.diff==='rose';
function setDialogAuto(on,quiet) {
  DA.on=!!on; DA.t=0;
  if(!daRose()) { try { localStorage.setItem('le-dialog-auto',DA.on?'on':'off'); } catch(e) {} }
  daSync();
  if(!quiet&&typeof sfx!=='undefined') sfx.select();
}
const LE_openDialog_da=openDialog;
openDialog=function(name,lines,npc) {
  const r=LE_openDialog_da(name,lines,npc);
  let want=true;
  if(!daRose()) { want=false; try { want=localStorage.getItem('le-dialog-auto')==='on'; } catch(e) {} }   // the saved setting
  if(DA.on!==want) { DA.on=want; DA.t=0; daSync(); }
  return r;
};

// Seconds to hold once the page's text is fully shown (and any spoken clip has ended).
function daWait() {
  if(DV.page===dialog.index&&!dvMuted()) return .65;
  return Math.max(1.4,Math.min(5,.8+dialog.chars.length*.032));
}
function daReady() {
  return dialog.active&&!document.hidden&&!transition&&!menuOpen&&!shopOpen&&!battle.active
    &&dialog.shown>=dialog.chars.length
    &&!(dialog.choice&&onChoicePage());
}

// A new page starts its own clock.
const LE_loadDialogLine_da=loadDialogLine;
loadDialogLine=function() { DA.t=0; return LE_loadDialogLine_da(); };

function daPad() {
  const pads=navigator.getGamepads?navigator.getGamepads():[];
  let g=null; for(const p of pads) if(p&&p.connected) { g=p; break; }
  const now=!!(g&&g.buttons[2]&&g.buttons[2].pressed);
  if(now&&!DA.padX&&dialog.active) setDialogAuto(!DA.on);
  DA.padX=now;
}
function daTick(now) {
  const dt=Math.min(.25,Math.max(0,(now-DA.last)/1000)); DA.last=now;
  daPad();
  if(DA.on&&daReady()) {
    if(DV.playing) DA.t=0;                       // a clip is still talking: wait for it
    else { DA.t+=dt; if(DA.t>=daWait()) { DA.t=0; advanceDialog(); } }
  } else DA.t=0;
  requestAnimationFrame(daTick);
}

const daBtn=$('dialog-auto');
if(daBtn) {
  // The button lives inside the tappable dialogue box, so its taps must not also advance the page.
  daBtn.addEventListener('touchstart',e=>{
    e.preventDefault(); e.stopPropagation();
    lastTouchTime=performance.now();
    setDialogAuto(!DA.on);
  },nonPassive);
  daBtn.addEventListener('click',e=>{
    e.stopPropagation();
    if(performance.now()-lastTouchTime>500) setDialogAuto(!DA.on);
    daBtn.blur();                                // keep Enter / Space for advancing, not for this button
  });
}
window.addEventListener('keydown',e=>{
  if(e.code==='KeyT'&&!e.repeat&&dialog.active&&!battle.active&&!menuOpen&&!shopOpen) { e.preventDefault(); setDialogAuto(!DA.on); }
});
daSync();
requestAnimationFrame(daTick);
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{DA,setDialogAuto,daWait}); });
