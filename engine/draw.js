'use strict';
// engine/draw.js — Main overworld draw, touch and keyboard input, menu wiring.
function draw(time) {
  const plate=plateFor(currentMap);
  const pk=plate?Math.min(3,Math.max(1,Math.ceil(window.devicePixelRatio||1))):1;
  plateSetK(pk);
  ctx.setTransform(pk,0,0,pk,0,0);
  rect(0,0,W,H,currentMap.outside?'#294c3e':'#30413c');

  for(let y=0;y<H;y+=48)
    for(let x=0;x<W;x+=48)
      rect(x+hash(x,y)%24,y+16,4,2,currentMap.outside?'#395943':'#3a4a42');

  ctx.save();
  ctx.translate(-Math.round(camera.x),-Math.round(camera.y));

  if(!currentMap.outside)
    rect(6,10,currentMap.w*T,currentMap.h*T,'#172e2a55');

  const x0=Math.max(0,Math.floor(camera.x/T)-2);
  const x1=Math.min(currentMap.w,Math.ceil((camera.x+W)/T)+2);
  const y0=Math.max(0,Math.floor(camera.y/T)-2);
  const y1=Math.min(currentMap.h,Math.ceil((camera.y+H)/T)+2);

  if(plate) {
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(plate.img,0,0,currentMap.w*T,currentMap.h*T);
    ctx.imageSmoothingEnabled=false;
  }
  for(let y=y0;y<y1;y++) {
    for(let x=x0;x<x1;x++) {
      if(plate) break;
      if(currentMap.outside)
        drawOutdoorTile(x,y,currentMap.tiles[y][x],time);
      else
        drawIndoorTile(x,y,currentMap.tiles[y][x]);
    }
  }

  if(!plate) for(const rug of currentMap.rugs) drawRug(rug);

  const items=(plate?currentMap.objects.filter(o=>!o.baked):currentMap.objects).map(o=>({
    kind:'object',value:o,depth:(o.y+o.h)*T
  }));

  if(currentMap.outside&&!plate) {
    for(const h of currentMap.houses)
      items.push({kind:'house',value:h,depth:(h.y+h.h)*T});
  }

  for(const a of [...currentMap.npcs,...followers,player])
    items.push({kind:'actor',value:a,depth:(position(a).y+1+(a.depthBias||0))*T+.2});

  items.sort((a,b)=>a.depth-b.depth);

  for(const item of items) {
    if(item.kind==='object') drawObject(item.value,time);
    else if(item.kind==='house') drawBuilding(item.value,time);
    else drawActor(item.value);
  }

  if(intro.active) drawIntroWorld(time); else { drawTarget(facingTarget()); if(typeof twDraw==='function') twDraw(time); }
  if(kiss) {
    const t=elapsedTime-kiss.start;
    if(t>2.6) kiss=null;
    else {
      const mx=Math.round(((player.x+kiss.npc.x)/2+.5)*T),my=Math.round(Math.min(player.y,kiss.npc.y)*T-20);
      const rise=Math.round(Math.min(1,t/1.6)*26),pulse=1+(Math.sin(t*9)>0?1:0);
      const alpha=t<2?1:1-(t-2)/.6;
      gfx.globalAlpha=alpha;
      drawHeart(mx,my-rise,pulse);
      if(t>.5) { drawHeart(mx-14,my-rise+10-Math.round((t-.5)*14),1); }
      if(t>.9) { drawHeart(mx+13,my-rise+14-Math.round((t-.9)*12),1); }
      gfx.globalAlpha=1;
    }
  }
  b7DrawMapFx(time);   // engine/feel.js: monster alerts, sleepy Zs, the instant-win confetti pop
  ctx.restore();

  if(transition)
    rect(0,0,W,H,'rgba(34,48,40,'+transition.alpha+')');
  if(intro.active) drawIntroScreen(time);

  drawMinimap(time);
}

function updateUI(now) {
  $('toast').classList.toggle('visible',now<toastUntil);

  if(dialog.active) {
    $('hint').hidden=true;
    $('action-label').textContent='CONTINUE';
    return;
  }
  if(intro.active) { $('hint').hidden=true; $('action-label').textContent='\u2026'; return; }

  const t=player.move?null:facingTarget();
  let hint=currentMap.outside
    ? (currentMap.hint||'Nine open doors. No errands. Just explore.')
    : 'Find the resident. Poke the furniture.';
  let caption='INTERACT';

  if(t) {
    if(t.kind==='npc'&&t.value.monster) {
      const resting=performance.now()<t.value.defeatedUntil;
      const md=monsterDef(t.value);
      hint=resting?'A \u00b7 '+cap(md.the)+' is resting':'A \u00b7 Challenge '+md.the+' ('+md.rank.toLowerCase()+')';
      caption=resting?'TALK':'FIGHT';
    } else if(t.kind==='npc'&&t.value.shopkeeper) {
      hint='A \u00b7 Shop with '+t.value.name+': buy and sell';
      caption='SHOP';
    } else if(t.kind==='npc') {
      hint='A \u00b7 Talk to '+t.value.name;
      caption='TALK';
    } else if(t.kind==='object'&&t.value.shop) {
      hint='A \u00b7 Shop at the counter: buy and sell';
      caption='SHOP';
    } else if(t.kind==='object') {
      hint='A \u00b7 Inspect '+t.value.name.toLowerCase();
      caption='LOOK';
    } else {
      hint=t.value.kind==='enter'
        ? 'Step inside '+t.value.house.name+(t.value.house.shop?' \u00b7 Buy and sell':'')
        : (t.value.kind==='edge' ? 'Walk on to '+(worlds[t.value.to]||town).name : 'Step onto the mat to go outside');
      caption=t.value.kind==='enter'?'ENTER':(t.value.kind==='edge'?'GO':'EXIT');
    }
  }

  $('hint').hidden=!t;
  if($('hint').textContent!==hint) $('hint').textContent=hint;
  if($('action-label').textContent!==caption)
    $('action-label').textContent=caption;
}

function refreshPad() {
  const dir=input.touchDir||input.padDir||input.mouseDir||moveInput();
  for(const el of dpad.querySelectorAll('.dir'))
    el.classList.toggle('active',el.dataset.dir===dir);
}

function padDirection(clientX,clientY) {
  const r=dpad.getBoundingClientRect();
  let dx=clientX-r.left-r.width/2;
  let dy=clientY-r.top-r.height/2;
  if(layout.rotated) { const sx=dx; dx=dy; dy=-sx; }

  if(Math.max(Math.abs(dx),Math.abs(dy))<11 ||
     Math.hypot(dx,dy)>r.width*1.15) return null;

  return Math.abs(dx)>Math.abs(dy)
    ? (dx<0?'left':'right')
    : (dy<0?'up':'down');
}

function findTouch(list,id) {
  for(let i=0;i<list.length;i++)
    if(list[i].identifier===id) return list[i];
  return null;
}

const nonPassive={passive:false};

// Track each control's touch independently so movement and A can be held together.
dpad.addEventListener('touchstart',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  if(input.touchId!==null) return;
  const t=e.changedTouches[0];
  if(!t) return;
  input.touchId=t.identifier;
  input.touchDir=padDirection(t.clientX,t.clientY);
  refreshPad();
},nonPassive);

window.addEventListener('touchmove',e=>{
  if(input.touchId!==null) {
    const t=findTouch(e.touches,input.touchId);
    if(t) {
      e.preventDefault();
      input.touchDir=padDirection(t.clientX,t.clientY);
      refreshPad();
    }
  }
  if(input.actionId!==null) e.preventDefault();
},nonPassive);

function endTouches(e) {
  let handled=false;

  if(input.touchId!==null&&findTouch(e.changedTouches,input.touchId)) {
    input.touchId=null;
    input.touchDir=null;
    refreshPad();
    handled=true;
  }

  if(input.actionId!==null&&findTouch(e.changedTouches,input.actionId)) {
    input.actionId=null;
    actionButton.classList.remove('pressed');
    handled=true;
  }

  if(handled) {
    e.preventDefault();
    lastTouchTime=performance.now();
  }
}

window.addEventListener('touchend',endTouches,nonPassive);
window.addEventListener('touchcancel',endTouches,nonPassive);

actionButton.addEventListener('touchstart',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  if(input.actionId!==null) return;
  const t=e.changedTouches[0];
  if(!t) return;
  input.actionId=t.identifier;
  actionButton.classList.add('pressed');
  pressAction();
},nonPassive);

actionButton.addEventListener('touchmove',e=>e.preventDefault(),nonPassive);

actionButton.addEventListener('click',()=>{
  if(performance.now()-lastTouchTime>500) pressAction();
});

actionButton.addEventListener('mousedown',e=>{
  if(e.button===0) {
    e.preventDefault();
    actionButton.classList.add('pressed');
  }
});

dpad.addEventListener('mousedown',e=>{
  if(e.button!==0||performance.now()-lastTouchTime<500) return;
  e.preventDefault();
  input.mouseDown=true;
  input.mouseDir=padDirection(e.clientX,e.clientY);
  refreshPad();
});

window.addEventListener('mousemove',e=>{
  if(input.mouseDown) {
    input.mouseDir=padDirection(e.clientX,e.clientY);
    refreshPad();
  }
});

window.addEventListener('mouseup',()=>{
  input.mouseDown=false;
  input.mouseDir=null;
  actionButton.classList.remove('pressed');
  refreshPad();
});

function dialogTap(e) {
  const b=e.target&&e.target.closest&&e.target.closest('.choice');
  if(b&&dialog.choice) { pickChoice(Number(b.dataset.i)); return; }
  advanceDialog();
}
$('dialog').addEventListener('touchstart',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  dialogTap(e);
},nonPassive);

$('dialog').addEventListener('click',e=>{
  if(performance.now()-lastTouchTime>500) dialogTap(e);
});

canvas.addEventListener('touchstart',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  if(dialog.active) advanceDialog();
},nonPassive);

canvas.addEventListener('click',()=>{
  if(performance.now()-lastTouchTime>500&&dialog.active) advanceDialog();
});

game.addEventListener('touchmove',e=>e.preventDefault(),nonPassive);
game.addEventListener('contextmenu',e=>e.preventDefault());

const keyboard={
  ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
  KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'
};

window.addEventListener('keydown',e=>{
  if(battle.active) { b2Key(e); return; }
  if(e.code==='KeyL'&&!e.repeat) { toggleLayout(); return; }
  if(shopOpen) {
    if(e.code==='Escape'||e.code==='KeyM') { e.preventDefault(); closeShop(); }
    else if(e.code==='ArrowRight'||e.code==='KeyD') { e.preventDefault(); shopCycle(1); }
    else if(e.code==='ArrowLeft'||e.code==='KeyA') { e.preventDefault(); shopCycle(-1); }
    return;
  }
  if(dialog.active&&dialog.choice&&!e.repeat) {
    if(e.code==='ArrowUp'||e.code==='ArrowLeft'||e.code==='KeyW'||e.code==='KeyA') { e.preventDefault(); moveChoice(-1); return; }
    if(e.code==='ArrowDown'||e.code==='ArrowRight'||e.code==='KeyS'||e.code==='KeyD') { e.preventDefault(); moveChoice(1); return; }
  }
  if(e.code==='KeyM'&&!e.repeat&&!dialog.active) {
    e.preventDefault();
    if(menuOpen) closeMenu(); else openMenu(true);
    return;
  }
  if(menuOpen) {
    menuKey(e);
    return;
  }

  const dir=keyboard[e.code];

  if(dir) {
    e.preventDefault();
    if(!input.keys.has(e.code)) input.keys.set(e.code,dir);
    refreshPad();
    return;
  }

  if(e.code==='Enter'||e.code==='Space') {
    e.preventDefault();
    if(!e.repeat) pressAction();
  }
});

window.addEventListener('keyup',e=>{
  if(keyboard[e.code]) {
    e.preventDefault();
    input.keys.delete(e.code);
    refreshPad();
  }
});

function clearInput() {
  input.keys.clear();
  input.touchId=null;
  input.touchDir=null;
  input.mouseDown=false;
  input.mouseDir=null;
  input.actionId=null;
  queuedAction=false;
  actionButton.classList.remove('pressed');
  refreshPad();
}

const menuButton=$('menu-button');
menuButton.addEventListener('touchstart',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  menuButton.classList.add('pressed');
},nonPassive);
menuButton.addEventListener('touchend',e=>{
  e.preventDefault();
  lastTouchTime=performance.now();
  menuButton.classList.remove('pressed');
  if(!dialog.active&&!transition) openMenu();
},nonPassive);
menuButton.addEventListener('click',()=>{
  if(performance.now()-lastTouchTime>500&&!dialog.active&&!transition) openMenu();
});
$('menu-back').addEventListener('click',()=>menuBack());
$('sound-toggle').addEventListener('click',()=>{ setSound(!sound.enabled); if(sound.enabled) sfx.select(); });
setSound(sound.enabled);
$('menu').addEventListener('click',e=>{ if(e.target===$('menu')) closeMenu(); });

window.addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) clearInput();
});

window.addEventListener('resize',applyLayout);
$('save-hud').addEventListener('click',()=>{ if(!dialog.active&&!transition) openSave(); });
$('rotate-menu').addEventListener('click',toggleLayout);
applyLayout();
if('ResizeObserver' in window)
  new ResizeObserver(resize).observe(game);

resize();
showToast('Tap the map to walk, or use the D-pad. A / Enter says hello.',5);

let previous=performance.now();

