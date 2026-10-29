'use strict';
// engine/tapwalk.js: Tap to walk. Tap (or click) anywhere on the map and the party walks there.
//   floor / grass / path   walk to that tile
//   person or monster      walk up, stop on the tile right before them, face them and talk (or fight)
//   object with text       walk up, stop right before it, face it and use it (shop counter, fountain, signs...)
//   other solid things     walk to the nearest reachable tile and stop (nothing happens)
//   house, door, mat, edge walk onto the door (or the edge opening), so the usual door transition runs
// Any D-pad, key or stick input cancels the walk at once, and so does a dialogue, a menu, a battle or a cutscene.
// Taps move Tom with movePlayer (engine/followers.js), so Grace, Rose and the rest trail behind as usual.
// Hooks: update() in engine/overworld.js calls twGuard (cancel when something takes over), twCancel (stick or key input)
// and twStep (take the next step when no key is held); draw() in engine/draw.js calls twDraw (the target brackets).
// Loaded after engine/dialog-auto.js, before engine/main.js.
const TW={I:null,tap:null,mdown:null};

// Free roaming: nothing else has the screen.
function twFree() {
  return !dialog.active&&!transition&&!menuOpen&&!shopOpen&&!battle.active&&!intro.active
    &&!(typeof splash!=='undefined'&&splash.active)
    &&!(typeof cutsceneOn==='function'&&cutsceneOn());
}
function twCancel() { TW.I=null; }
function twGuard() { if(TW.I&&(!twFree()||TW.I.map!==currentMap)) TW.I=null; }

// ---------- Screen to map ----------
// The stage can be rotated 90 degrees (landscape on a portrait phone), so work from the canvas centre and undo the rotation
// the same way padDirection does (engine/draw.js).
function twWorld(clientX,clientY) {
  const r=canvas.getBoundingClientRect(),lw=canvas.offsetWidth||r.width,lh=canvas.offsetHeight||r.height;
  if(!lw||!lh) return null;
  let lx,ly;
  if(layout.rotated) { const cx=r.left+r.width/2,cy=r.top+r.height/2; lx=lw/2+(clientY-cy); ly=lh/2-(clientX-cx); }
  else { lx=(clientX-r.left)*(lw/r.width); ly=(clientY-r.top)*(lh/r.height); }
  if(lx<0||ly<0||lx>=lw||ly>=lh) return null;
  return {x:lx*canvas.width/lw+Math.round(camera.x),y:ly*canvas.height/lh+Math.round(camera.y)};
}

// ---------- What was tapped ----------
// Actors are tall, so test the drawn body (a box above the feet), not just the tile they stand on.
function twActorAt(wx,wy) {
  let best=null,bestY=-1e9;
  const list=currentMap.npcs.concat(followers);
  for(const a of list) {
    if(a.hidden||a===player) continue;
    const p=position(a),feet=(p.y+1)*T;
    let h=48,half=T/2+2;
    if(a.monster) { const d=monsterDef(a),s=a.mscale||1; h=d.sprite.length*s; half=Math.max(half,d.sprite[0].length*s/2+2); }
    const cx=(p.x+.5)*T;
    if(wx>=cx-half&&wx<=cx+half&&wy>=feet-h&&wy<=feet&&feet>bestY) { best=a; bestY=feet; }
  }
  return best;
}
function twHouseAt(tx,ty) {
  for(const h of currentMap.houses||[]) if(tx>=h.x&&tx<h.x+h.w&&ty>=h.y&&ty<h.y+h.h) return h;
  return null;
}
// An interactable object is one facingTarget would offer (it has text).
const twUsable=o=>!!(o&&o.text);

// The distance map from the player (forward) over tiles the player may stand on. Portals other than `goalKey` are walls:
// stepping on a door or an edge opening leaves the map, so the walk only does that when the door is the goal.
function twPassable(x,y,goalKey) {
  if(!within(currentMap,x,y)||!canOccupy(currentMap,x,y,player)) return false;
  return !currentMap.portals.has(key(x,y))||key(x,y)===goalKey;
}
function twFlood(sources,goalKey) {
  const m=currentMap,w=m.w,n=w*m.h,dist=new Int16Array(n).fill(-1),q=new Int16Array(n);
  let h=0,t=0;
  for(const s of sources) { const i=s.y*w+s.x; if(dist[i]===-1) { dist[i]=0; q[t++]=i; } }
  while(h<t) {
    const at=q[h++],x=at%w,y=(at/w)|0;
    for(const nm of directionNames) {
      const d=DIR[nm],nx=x+d.x,ny=y+d.y;
      if(!twPassable(nx,ny,goalKey)) continue;
      const i=ny*w+nx; if(dist[i]!==-1) continue;
      dist[i]=dist[at]+1; q[t++]=i;
    }
  }
  return dist;
}

// Turn a tap into an intent: {kind:'tile'|'npc'|'object', map, mark:{x,y}, ...}. null when the tap means nothing.
function twResolve(wx,wy) {
  const m=currentMap,tx=Math.floor(wx/T),ty=Math.floor(wy/T);
  if(!within(m,tx,ty)) return null;
  const actor=twActorAt(wx,wy);
  if(actor) return {kind:'npc',map:m,npc:actor,mark:{x:actor.x,y:actor.y}};
  if(tx===player.x&&ty===player.y) return null;
  const portal=m.portals.get(key(tx,ty));
  if(portal) return {kind:'tile',map:m,x:tx,y:ty,goalKey:key(tx,ty),mark:{x:tx,y:ty}};
  const house=twHouseAt(tx,ty);
  if(house&&house.door) return {kind:'tile',map:m,x:house.door.x,y:house.door.y,goalKey:key(house.door.x,house.door.y),mark:{x:house.door.x,y:house.door.y}};
  const o=m.objectAt.get(key(tx,ty));
  if(twUsable(o)) return {kind:'object',map:m,obj:o,cell:{x:tx,y:ty},mark:{x:tx,y:ty}};
  if(walkable(m,tx,ty)) return {kind:'tile',map:m,x:tx,y:ty,goalKey:null,mark:{x:tx,y:ty}};
  // A tall prop or a wall above a usable object: the top of a shelf is part of the shelf.
  const below=m.objectAt.get(key(tx,ty+1));
  if(!o&&twUsable(below)) return {kind:'object',map:m,obj:below,cell:{x:tx,y:ty+1},mark:{x:tx,y:ty+1}};
  // Anything else solid: walk to the nearest tile you can reach and stop there.
  return {kind:'near',map:m,x:tx,y:ty,mark:{x:tx,y:ty}};
}

// ---------- Planning ----------
function twAdjacent(ax,ay,bx,by) { return Math.abs(ax-bx)+Math.abs(ay-by)===1; }
// Tiles to stand on for an intent (before the flood).
function twStandTiles(I) {
  const out=[];
  const around=(cx,cy)=>{ for(const nm of directionNames) { const d=DIR[nm],x=cx+d.x,y=cy+d.y; if((x===player.x&&y===player.y)||twPassable(x,y,null)) out.push({x,y}); } };
  if(I.kind==='npc') around(I.npc.x,I.npc.y);
  else if(I.kind==='object') { const o=I.obj; for(let y=o.y;y<o.y+o.h;y++) for(let x=o.x;x<o.x+o.w;x++) around(x,y); }
  return out;
}
// The nearest tile to (x,y) the player can reach (for taps on trees, walls and water).
function twNearest(x,y) {
  const from=twFlood([{x:player.x,y:player.y}],null);
  let best=null,bd=1e9,bs=1e9;
  for(let yy=0;yy<currentMap.h;yy++) for(let xx=0;xx<currentMap.w;xx++) {
    const s=from[yy*currentMap.w+xx]; if(s<0) continue;
    const d=Math.abs(xx-x)+Math.abs(yy-y);
    if(d<bd||(d===bd&&s<bs)) { best={x:xx,y:yy}; bd=d; bs=s; }
  }
  return best;
}

function twTapAt(clientX,clientY) {
  if(!twFree()) return;
  const w=twWorld(clientX,clientY); if(!w) return;
  const I=twResolve(w.x,w.y);
  if(!I) return;
  if(I.kind==='near') {
    const g=twNearest(I.x,I.y);
    if(!g||(g.x===player.x&&g.y===player.y)) { sfx.nope(); return; }
    I.kind='tile'; I.x=g.x; I.y=g.y; I.goalKey=null; I.mark={x:g.x,y:g.y};
  }
  if(I.kind==='tile'&&!twPassable(I.x,I.y,I.goalKey)) {
    // Someone is standing there: walk up next to the spot instead.
    const g=twNearest(I.x,I.y);
    if(!g||(g.x===player.x&&g.y===player.y)) { sfx.nope(); return; }
    I.x=g.x; I.y=g.y; I.goalKey=null;
  }
  I.age=0; I.hold=0; I.stuck=0; I.dir=null;
  TW.I=I;
  sfx.select();
}

// One step of the walk. Called by update() each time Tom is standing still and no key is held.
function twStep(dt) {
  const I=TW.I; if(!I) return;
  if(!twFree()||I.map!==currentMap) { TW.I=null; return; }
  I.age+=dt;
  if(I.age>25) { TW.I=null; return; }
  if(I.hold>0) { I.hold-=dt; return; }

  let sources;
  if(I.kind==='tile') {
    if(player.x===I.x&&player.y===I.y) { TW.I=null; return; }
    sources=[{x:I.x,y:I.y}];
  } else if(I.kind==='npc') {
    const n=I.npc;
    if(n.hidden||!(currentMap.npcs.includes(n)||followers.includes(n))) { TW.I=null; return; }
    if(twAdjacent(player.x,player.y,n.x,n.y)) {
      if(n.move||n.held) { I.hold=.1; return; }   // let them finish their step
      return twInteract(directionTo(n.x-player.x,n.y-player.y));
    }
    sources=twStandTiles(I);
  } else {
    const o=I.obj;
    for(const nm of [...new Set([directionTo(I.cell.x-player.x,I.cell.y-player.y),...directionNames])]) {
      const d=DIR[nm];
      if(currentMap.objectAt.get(key(player.x+d.x,player.y+d.y))===o) return twInteract(nm);
    }
    sources=twStandTiles(I);
  }

  const dist=twFlood(sources,I.goalKey||null),here=dist[player.y*currentMap.w+player.x];
  if(here<0) {
    // Blocked right now (a person in the way): wait a moment, then give up.
    if(++I.stuck>8) { TW.I=null; sfx.nope(); showToast('Can’t get there.',1.4); return; }
    I.hold=.25; return;
  }
  // Take the neighbour that is one closer, going straight on when that is still a way in (few turns, no zigzag).
  const goal=I.kind==='tile'?{x:I.x,y:I.y}:(I.kind==='npc'?{x:I.npc.x,y:I.npc.y}:I.cell);
  const dx=goal.x-player.x,dy=goal.y-player.y;
  const pref=[];
  if(I.dir) pref.push(I.dir);
  const lead=Math.abs(dx)>=Math.abs(dy)?[dx<0?'left':'right',dy<0?'up':'down']:[dy<0?'up':'down',dx<0?'left':'right'];
  pref.push(...lead,...directionNames);
  for(const nm of pref) {
    const d=DIR[nm],nx=player.x+d.x,ny=player.y+d.y;
    if(!within(currentMap,nx,ny)||dist[ny*currentMap.w+nx]!==here-1) continue;
    if(movePlayer(nm)) { I.dir=nm; I.stuck=0; sfx.step(); return; }
  }
  I.hold=.12;
  if(++I.stuck>8) { TW.I=null; sfx.nope(); }
}

function twInteract(dir) {
  TW.I=null;
  player.facing=dir;
  pressAction();
}

// ---------- The target marker ----------
function twDraw(time) {
  const I=TW.I; if(!I||I.map!==currentMap||dialog.active||transition) return;
  const x=I.mark.x*T,y=I.mark.y*T,o=Math.round(2+Math.sin(time*9)*1.5),L=8;
  const cs=[[x+o,y+o,1,1],[x+T-o,y+o,-1,1],[x+o,y+T-o,1,-1],[x+T-o,y+T-o,-1,-1]];
  for(const pass of [OUT,'#fff1cb']) {
    const g=pass===OUT?1:0;
    for(const [sx,sy,fx,fy] of cs) {
      const ax=fx>0?sx:sx-L,ay=fy>0?sy:sy-L,bx=fx>0?sx:sx-2,by=fy>0?sy:sy-2;
      rect(ax-g,by-g,L+2*g,2+2*g,pass); rect(bx-g,ay-g,2+2*g,L+2*g,pass);
    }
  }
}

// ---------- Input ----------
// Touch: a tap is a short touch that does not travel. Mouse: a click. Both are ignored when the touch began while a dialogue
// (or anything else) had the screen, so the tap that closes a dialogue box never also starts a walk.
const twFind=(list,id)=>{ for(let i=0;i<list.length;i++) if(list[i].identifier===id) return list[i]; return null; };
game.addEventListener('touchstart',e=>{
  if(e.target!==canvas) return;
  const t=e.changedTouches[0]; if(!t) return;
  TW.tap=e.touches.length>1?null:{id:t.identifier,x:t.clientX,y:t.clientY,t:performance.now(),free:twFree()};
},{capture:true,passive:true});
game.addEventListener('touchmove',e=>{
  const s=TW.tap; if(!s) return;
  const t=twFind(e.changedTouches,s.id);
  if(t&&Math.hypot(t.clientX-s.x,t.clientY-s.y)>14) TW.tap=null;
},{capture:true,passive:true});
game.addEventListener('touchend',e=>{
  const s=TW.tap; if(!s) return;
  const t=twFind(e.changedTouches,s.id); if(!t) return;
  TW.tap=null;
  if(s.free&&performance.now()-s.t<700) twTapAt(t.clientX,t.clientY);
},{capture:true,passive:true});
game.addEventListener('touchcancel',()=>{ TW.tap=null; },{capture:true,passive:true});
game.addEventListener('mousedown',e=>{
  if(e.target!==canvas||e.button!==0||performance.now()-lastTouchTime<500) return;
  TW.mdown={x:e.clientX,y:e.clientY,free:twFree()};
},true);
canvas.addEventListener('click',e=>{
  const s=TW.mdown; TW.mdown=null;
  if(!s||!s.free||performance.now()-lastTouchTime<500) return;
  if(Math.hypot(e.clientX-s.x,e.clientY-s.y)<=10) twTapAt(e.clientX,e.clientY);
});
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{TW,twTapAt,twWorld,twResolve,twStep}); });
