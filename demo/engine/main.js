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
    if(battle.state!=='command') return;
    const cmds=[...document.querySelectorAll('.battle-cmd')]; if(!cmds.length) return;
    if(dirEdge&&dir) { battle.sel=(battle.sel+(back?cmds.length-1:1))%cmds.length; highlightCommand(); sfx.move(); }
    if(A) cmds[battle.sel].click();
    if(B) { const bk=cmds.find(c=>c.textContent==='BACK'); if(bk) bk.click(); }
    return;
  }
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
  pollGamepad();
  if(battle.active) {
    updateBattle(dt);
    drawBattle();
  } else {
    update(dt);
    updateCamera(dt);
    draw(elapsedTime);
    updateUI(now);
  }
  document.documentElement.classList.add('js-running');
  requestAnimationFrame(frame);
}

window.__LE={intro,splash,startSplash,splashPick,startTitle,beginOpening,get coins(){return coins;},set coins(v){coins=v;},openShop,closeShop,items,party,battle,bag,sfx,say,sound,town,player,followers,startBattle,openDialog,toggleLayout,layout,RECRUITS,recruitJoin,recruitLeave,offerRecruit,dialog,pickChoice,saveGame,loadGame,readSave,cmdAttack,cmdPep,cmdHug,cmdGrumble,ATTACKS,BATTLE_SPRITES,get map(){return currentMap;},worlds,findGrump,findMonster,allMonsters,MONSTERS,go:(id)=>{ const m=worlds[id]; if(!m) return false; currentMap=m; player.x=m.spawn.x; player.y=m.spawn.y; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; return true; },refresh:()=>refreshBattleStatus()};
requestAnimationFrame(frame);
startSplash();
