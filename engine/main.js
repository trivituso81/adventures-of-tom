'use strict';
// engine/main.js — Gamepad, frame loop, input handlers, startup.
// ---------- Controller: any standard gamepad (Xbox, PlayStation, MFi) ----------
const gp={prev:{},dir:null};
function pollGamepad() {
  const pads=navigator.getGamepads?navigator.getGamepads():[];
  let g=null; for(const p of pads) if(p&&p.connected) { g=p; break; }
  if(!g) { if(input.padDir) { input.padDir=null; refreshPad(); } gp.dir=null; return; }
  const ax=g.axes[0]||0,ay=g.axes[1]||0,b=i=>!!(g.buttons[i]&&g.buttons[i].pressed);
  let dir=null;
  if(b(12)||ay<-.5) dir='up'; else if(b(13)||ay>.5) dir='down'; else if(b(14)||ax<-.5) dir='left'; else if(b(15)||ax>.5) dir='right';
  const edge=i=>{ const now=b(i),was=!!gp.prev[i]; gp.prev[i]=now; return now&&!was; };
  const A=edge(0),B=edge(1),Y=edge(3),START=edge(9),SEL=edge(8),L=edge(4),R1=edge(5),L2=edge(6),R2=edge(7);
  const dirEdge=dir!==gp.dir; gp.dir=dir;
  const back=dir==='up'||dir==='left';
  if(L) toggleLayout();
  if(splash.active) { input.padDir=null; splashPad(dir,dirEdge,A,B); return; }
  if(battle.active) {
    input.padDir=null;
    b2Pad(dir,dirEdge,A,B);
    if(R1) b7ToggleSpeed(); if(Y) b7ToggleAuto();   // engine/feel.js: 1x / 2x and Smart Repeat
    return;
  }
  // Cutscenes: B toggles FAST, Start or Select skips (engine/skip.js).
  if(cutsceneOn()&&(B||START||SEL)) { input.padDir=null; if(B) cutFF(); else cutSkip(); return; }
  if(shopOpen) { input.padDir=null; if(B||START||Y) closeShop(); else if(dirEdge&&(dir==='left'||dir==='right')) shopCycle(dir==='right'?1:-1); return; }
  if(menuOpen) { input.padDir=null; menuPad({dir,dirEdge,A,B,START,Y,prev:L2,next:R1||R2}); return; }
  if(dialog.active) {
    input.padDir=null;
    if(dialog.choice&&dirEdge&&dir) moveChoice(back?-1:1);
    if(A) advanceDialog();
    return;
  }
  if((START||Y)&&!transition) { input.padDir=null; openMenu(true); return; }
  if(input.padDir!==dir) { input.padDir=dir; refreshPad(); }
  if(A) pressAction();
}

function frame(now) {
  const dt=Math.min(.05,Math.max(0,(now-previous)/1000));
  previous=now;
  elapsedTime+=dt;
  if(!intro.active&&!splash.active) playTime+=dt;
  // Every stage is guarded on its own: an error in one frame must never stop the loop (a stopped loop is a frozen game),
  // and an error in drawing must not stop the game logic. See gameFault (data/battle-sprites.js).
  try { pollGamepad(); } catch(err) { gameFault('pad',err); }
  if(battle.active) {
    try { updateBattle(dt*b7Speed()); } catch(err) { gameFault('battle update',err); }   // 2x battle speed (engine/feel.js)
    try { drawBattle(); } catch(err) { gameFault('battle draw',err); }
  } else {
    try { update(dt); updateCamera(dt); } catch(err) { gameFault('update',err); }
    try { draw(elapsedTime); } catch(err) { gameFault('draw',err); }
    try { updateUI(now); } catch(err) { gameFault('ui',err); }
  }
  try { refreshCutUI(); } catch(err) { gameFault('cutscene ui',err); }
  document.documentElement.classList.add('js-running');
  requestAnimationFrame(frame);
}

window.__LE={intro,splash,startSplash,splashPick,startTitle,beginOpening,get coins(){return coins;},set coins(v){coins=v;},openShop,closeShop,items,party,battle,bag,sfx,say,sound,town,player,followers,startBattle,openDialog,toggleLayout,layout,RECRUITS,recruitJoin,recruitLeave,offerRecruit,dialog,pickChoice,saveGame,loadGame,readSave,ATTACKS,B2,B2_SKILLS,B2_TOMBOS,B2_FOES,b2Start,b2Lab,b2Do,b2Dir,b2A,b2Back,b2Forecast,b2Damage,b2TargetOptions,B2_LAB,BATTLE_SPRITES,get map(){return currentMap;},worlds,findGrump,findMonster,allMonsters,MONSTERS,go:(id)=>{ const m=worlds[id]; if(!m) return false; currentMap=m; player.x=m.spawn.x; player.y=m.spawn.y; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; return true; },refresh:()=>b2Render()};
requestAnimationFrame(frame);
startSplash();

// Coming back to the app after it sat in the background for a while shows the title screen,
// exactly like a fresh launch (iOS resumes home-screen apps instead of reloading them).
// Detected by a time gap, not one event: iOS freezes timers while the app is away, so a tick
// that arrives 60s+ late means the app was away. Checked on every resume-type event too.
// Not during a battle or cutscene, so nothing in progress is lost. Autosave still covers the rest.
(function(){
  let last=Date.now(), done=false;
  function check() {
    const now=Date.now(), away=now-last; last=now;
    if(done||away<60000||splash.active||battle.active||cutsceneOn()) return;
    done=true; location.reload();
  }
  setInterval(check,1000);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) check(); });
  window.addEventListener('pageshow',check);
  window.addEventListener('focus',check);
})();

// Build stamp on the title screen so we can tell which version a phone is running.
(function(){
  const sp=document.getElementById('splash'); if(!sp) return;
  const d=document.createElement('div');
  d.textContent='build jojo2';
  d.style.cssText='position:absolute;left:8px;bottom:4px;font:10px monospace;color:#fff;opacity:.45;pointer-events:none;z-index:50';
  sp.appendChild(d);
})();
