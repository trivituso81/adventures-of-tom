'use strict';
// engine/world.js — Map builders, the town and interiors, dialogue state.

const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
let gfx = ctx; // drawing helpers target this; swapped to the battle canvas during fights
const mini = $('minimap'), mctx = mini.getContext('2d');
const game = $('game'), dpad = $('dpad'), actionButton = $('action');
const T = 32;
const DIR = {
  up:{x:0,y:-1},
  down:{x:0,y:1},
  left:{x:-1,y:0},
  right:{x:1,y:0}
};
const directionNames = Object.keys(DIR);
const key = (x,y) => x + ',' + y;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const hash = (x,y) => {
  let n = Math.imul(x+71,374761393) ^ Math.imul(y+137,668265263);
  n = Math.imul(n ^ (n>>>13),1274126177);
  return (n ^ (n>>>16)) >>> 0;
};
const pick = items => items[Math.floor(Math.random()*items.length)];
const visited = new Set();

// Buildings and NPC colors are content: data/maps-le.js (Long Island) and data/maps-la.js (Los Angeles, added by engine/la.js).
const houses = LE_HOUSES.slice();
const houseById = Object.fromEntries(houses.map(h => [h.id,h]));
const palettes = Object.assign({},LE_PALETTES);

function makeMap(id,name,w,h,outside,style={}) {
  return {
    id,name,w,h,outside,style,
    tiles:Array.from({length:h},()=>Array(w).fill(outside?'grass':'floor')),
    solid:new Uint8Array(w*h),
    objects:[],
    objectAt:new Map(),
    npcs:[],
    portals:new Map(),
    npcNoGo:new Set(),
    rugs:[],
    wanderSpots:[]
  };
}

function within(map,x,y) {
  return x>=0 && y>=0 && x<map.w && y<map.h;
}

function tile(map,x,y,type,solid=false) {
  if(!within(map,x,y)) return;
  map.tiles[y][x]=type;
  map.solid[y*map.w+x]=solid?1:0;
}

function object(map,kind,x,y,w=1,h=1,name='',text='',extra={}) {
  const o={kind,x,y,w,h,name,text,...extra};
  map.objects.push(o);
  for(let yy=y;yy<y+h;yy++) {
    for(let xx=x;xx<x+w;xx++) {
      if(within(map,xx,yy)) {
        map.solid[yy*map.w+xx]=1;
        map.objectAt.set(key(xx,yy),o);
      }
    }
  }
  return o;
}

function actor(name,x,y,palette,lines,isPlayer=false) {
  return {
    name,x,y,facing:'down',
    palette:palettes[palette],paletteName:palette,
    lines,isPlayer,
    move:null,
    walkClock:0,
    path:[],
    idle:.5+Math.random()*1.8,
    roam:isPlayer?0:9,
    duration:isPlayer?.14:.8
  };
}

function walkable(map,x,y) {
  return within(map,x,y) && map.solid[y*map.w+x]===0;
}

function finishMap(map) {
  for(const o of map.objects) o.baked=true;
  for(let y=0;y<map.h;y++) {
    for(let x=0;x<map.w;x++) {
      if(walkable(map,x,y) && !map.npcNoGo.has(key(x,y)) &&
         (!map.outside || map.tiles[y][x]==='path')) {
        map.wanderSpots.push({x,y});
      }
    }
  }
}

// ---------- Building maps from content specs (data/maps-le.js, data/maps-la.js; the spec format is documented there) ----------
function border(map,openings,kind='tree') {
  const open=new Set(openings.map(([x,y])=>key(x,y)));
  for(let x=0;x<map.w;x++) for(const y of [0,map.h-1]) if(!open.has(key(x,y))) object(map,kind,x,y);
  for(let y=1;y<map.h-1;y++) for(const x of [0,map.w-1]) if(!open.has(key(x,y))) object(map,kind,x,y);
}
function placeHouse(map,h,pathEnd) {
  h.door={x:h.x+Math.floor(h.w/2),y:h.y+h.h-1};
  h.area=map.id;
  for(let y=h.y;y<h.y+h.h;y++) for(let x=h.x;x<h.x+h.w;x++) tile(map,x,y,'building',true);
  tile(map,h.door.x,h.door.y,'door');
  for(let y=h.door.y+1;y<=pathEnd;y++) tile(map,h.door.x,y,'path');
  map.portals.set(key(h.door.x,h.door.y),{kind:'enter',house:h});
  map.npcNoGo.add(key(h.door.x,h.door.y));
  map.npcNoGo.add(key(h.door.x,h.door.y+1));
  map.houses.push(h);
}
// An opening on the map edge: stepping onto it carries the party to another area.
function opening(map,x,y,to,spawn,facing,ground='path') {
  tile(map,x,y,ground);
  map.portals.set(key(x,y),{kind:'edge',to,spawn,facing});
  map.npcNoGo.add(key(x,y));
  map.npcNoGo.add(key(x+DIR[facing].x*-1,y+DIR[facing].y*-1));
}
function paths(map,list,type='path') { for(const [x0,y0,x1,y1] of list) for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) tile(map,x,y,type); }
// One object entry: [kind,x,y,w,h,name,text,extra] or a group {kind,at:[[x,y],...],name,text,extra}.
function placeObjects(map,list) {
  for(const o of list||[]) {
    if(Array.isArray(o)) object(map,...o);
    else for(const [x,y] of o.at) object(map,o.kind,x,y,o.w||1,o.h||1,o.name||'',o.text||'',o.extra||{});
  }
}
// NPC spec {name,x,y,look,lines,...rest}; rest (when, revisit, flags like grandma or driver) is copied onto the actor.
function npcFromSpec(s,inRoom) {
  const {name,x,y,look,lines,...rest}=s;
  const n=actor(name,x,y,look,lines||[]);
  if(inRoom) { n.roam=3; n.duration=.9; }
  Object.assign(n,rest);
  return n;
}
function placeMonsters(map,spots) {
  for(const [id,x,y] of spots||[]) {
    const d=MONSTERS[id];
    const mon=actor(d.name,x,y,'moss',[]);
    if(d.owScale) mon.mscale=d.owScale;   // a monster drawn smaller on the map (Acorn Agent)
    mon.monster=id; mon.roam=0; mon.tier=0; mon.maxHp=d.hp; mon.defeatedUntil=0;
    map.npcs.push(mon);
  }
}
function applyPlateMask(map,mask){ for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++){ const k=key(x,y); if(map.portals.has(k)){map.solid[y*map.w+x]=0;continue;} if(map.objectAt.has(k)) continue; map.solid[y*map.w+x]=((mask[y]||'')[x]||'#')==='#'?1:0; } }

function buildArea(spec) {
  const map=makeMap(spec.id,spec.name,spec.w,spec.h,true,spec.ground?{ground:spec.ground}:{});
  map.houses=[];
  if(spec.region) map.region=spec.region;
  for(const k of ['tag','eyebrow','hint','wild']) if(spec[k]!==undefined) map[k]=spec[k];
  map.spawn={...spec.spawn};
  map.spec=spec;
  paths(map,spec.paths||[]);
  for(const t of spec.tiles||[]) paths(map,t.rects,t.tile);
  if(spec.plateMask) spec.plateMask.forEach((row,y)=>{ for(let x=0;x<row.length;x++) if(row[x]!=='#') tile(map,x,y,'path'); });
  if(spec.houseRoad!=null) {
    const road=spec.houseRoad;
    for(const h of houses.filter(h=>h.area===spec.id)) placeHouse(map,h,Array.isArray(road)?(h.y<10?road[0]:road[1]):road);
  }
  if(spec.border) border(map,spec.border.open||[],spec.border.kind);
  for(const [x,y,to,sx,sy,facing,ground] of spec.exits||[]) opening(map,x,y,to,{x:sx,y:sy},facing,ground);
  for(const p of spec.pools||[]) {
    const own=new Set(p.cells.map(([x,y])=>key(x,y)));
    for(const [x,y] of p.cells) tile(map,x,y,p.tile,true);
    if(p.shore) for(const [x,y] of p.cells) for(const d of Object.values(DIR)) {
      const nx=x+d.x,ny=y+d.y;
      if(within(map,nx,ny)&&!own.has(key(nx,ny))&&map.tiles[ny][nx]==='grass') tile(map,nx,ny,p.shore);
    }
  }
  // Sub-Rail maps lay their wall pool after the exits, which walls the exits shut: re-open them so they can be walked into.
  if(spec.ground==='sub') for(const [x,y,,,,,ground] of spec.exits||[]) tile(map,x,y,ground||'path');
  for(const p of spec.patches||[]) for(const [x,y] of p.cells) if(within(map,x,y)&&map.tiles[y][x]==='grass') tile(map,x,y,p.tile);
  placeObjects(map,spec.objects);
  for(const s of spec.npcs||[]) map.npcs.push(npcFromSpec(s,false));
  placeMonsters(map,spec.monsters);
  if(spec.plateMask) applyPlateMask(map,spec.plateMask);
  for(const [x,y] of spec.noGo||[]) map.npcNoGo.add(key(x,y));   // tiles NPCs never wander onto (keeps chokepoints clear)
  finishMap(map);
  for(const o of map.objects) if((spec.liveKinds||[]).includes(o.kind)) o.baked=false;   // props still drawn on a painted plate (puzzle pieces)
  return map;
}

function findGrump() { return findMonster('grump'); }
function findMonster(id) { for(const m of Object.values(worlds)) { const g=m.npcs.find(n=>n.monster===id); if(g) return g; } return null; }
function allMonsters() { const out=[]; for(const m of Object.values(worlds)) for(const n of m.npcs) if(n.monster) out.push(n); return out; }

function makeRoom(spec) {
  const house=houseById[spec.id];
  const map=makeMap(spec.id,house.name,spec.w,spec.h,false,spec.style);
  map.spec=spec;
  if(spec.name) map.name=spec.name;

  for(let y=0;y<map.h;y++)
    for(let x=0;x<map.w;x++)
      if(x===0||y===0||x===map.w-1||y===map.h-1)
        tile(map,x,y,'wall',true);

  for(const [x,y] of spec.walls||[]) tile(map,x,y,'wall',true);
  // Optional ASCII floor plan: '#' is a wall, anything else is floor.
  if(spec.plan) spec.plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) if(row[x]==='#') tile(map,x,y,'wall',true); });

  const dx=spec.door?spec.door[0]:Math.floor(map.w/2),dy=spec.door?spec.door[1]:map.h-1;
  tile(map,dx,dy,'exit');
  map.spawn={x:dx,y:dy-1};
  map.portals.set(key(dx,dy),{kind:'exit',house});
  map.npcNoGo.add(key(dx,dy));
  map.npcNoGo.add(key(dx,dy-1));
  if(spec.door2) { const [ex,ey]=spec.door2; tile(map,ex,ey,'exit'); map.portals.set(key(ex,ey),{kind:'exit',house}); map.npcNoGo.add(key(ex,ey)); map.npcNoGo.add(key(ex,ey-1)); }
  // exitTo: [map,x,y,facing] sends the door to another room instead of the street (the loft's door is the elevator back to the lobby).
  if(spec.exitTo) { const [to,sx,sy,f]=spec.exitTo; for(const d of [[dx,dy],spec.door2]) if(d) map.portals.set(key(d[0],d[1]),{kind:'edge',to,spawn:{x:sx,y:sy},facing:f}); }
  // portals: [[x,y,map,spawnX,spawnY,facing]] extra doorways inside the room (the lobby's elevator).
  for(const [px,py,to,sx,sy,f] of spec.portals||[]) opening(map,px,py,to,{x:sx,y:sy},f,'floor');
  // More front-door tiles (a wide double door): spec.doors:[[x,y],...].
  for(const [ex,ey] of spec.doors||[]) { tile(map,ex,ey,'exit'); map.portals.set(key(ex,ey),{kind:'exit',house}); map.npcNoGo.add(key(ex,ey)); map.npcNoGo.add(key(ex,ey-1)); }
  // Doorways to another room of the same house: spec.edges:[{at:[x,y],to:mapId,spawn:{x,y},facing}] (replaces an exit on that tile).
  for(const e of spec.edges||[]) { const [ex,ey]=e.at; tile(map,ex,ey,'exit'); map.portals.set(key(ex,ey),{kind:'edge',to:e.to,spawn:e.spawn,facing:e.facing}); map.npcNoGo.add(key(ex,ey)); }
  if(spec.spawn) map.spawn={...spec.spawn};
  map.rugs.push({x:spec.rug[0],y:spec.rug[1],w:spec.rug[2],h:spec.rug[3]});

  placeObjects(map,spec.objects);
  for(const s of spec.npcs||[]) map.npcs.push(npcFromSpec(s,true));
  if(spec.plateMask) applyPlateMask(map,spec.plateMask);   // painted plate: the mask is the walk map

  finishMap(map);
  if(house.region==='la') map.region='la';
  if(spec.zones) map.zones=spec.zones;
  if(spec.rugs) map.rugs.push(...spec.rugs);
  return map;
}

// ---------- Dialogue that changes with the story ----------
// npcs and objects can carry `when`: [{chapter, from, until, mode, flag, notFlag, test, <field>:value}, ...]. The first
// variant that matches the story right now and names the field wins; otherwise the spec's own field is used.
function storyMatch(c) {
  const S=(typeof STORY!=='undefined')?STORY:{mode:'demo',chapter:0,flags:{}};
  const ch=S.chapter;
  if(c.chapter!=null && (Array.isArray(c.chapter)?(ch<c.chapter[0]||ch>c.chapter[1]):ch!==c.chapter)) return false;
  if(c.from!=null && ch<c.from) return false;
  if(c.until!=null && ch>c.until) return false;
  if(c.mode && S.mode!==c.mode) return false;
  if(c.flag) {
    if(typeof c.flag==='object'&&!Array.isArray(c.flag)) { for(const k in c.flag) if(S.flags[k]!==c.flag[k]) return false; }
    else for(const f of [].concat(c.flag)) if(!S.flags[f]) return false;
  }
  if(c.notFlag) for(const f of [].concat(c.notFlag)) if(S.flags[f]) return false;
  if(c.test && !c.test(S)) return false;
  return true;
}
function storyVariant(o,field) {
  if(o&&o.when) for(const w of o.when) if(w[field]!==undefined&&storyMatch(w)) return w[field];
  return o?o[field]:undefined;
}
// What an NPC says right now (their first-visit lines unless a `when` variant applies). Returns a fresh array.
function npcLines(n,field='lines') { const v=storyVariant(n,field); return Array.isArray(v)?v.slice():(v==null?[]:[v]); }

const worlds={};
for(const spec of LE_AREAS) worlds[spec.id]=buildArea(spec);
const town=worlds.town;
for(const spec of LE_ROOMS) worlds[spec.id]=makeRoom(spec);

let currentMap=town;
const player=actor('You',11,10,'player',[],true);
let queuedAction=false,transition=null,allVisited=false;
let W=1,H=1,scale=2,safeTop=40,safeBottom=85;
const camera={x:0,y:0,snap:true};
const input={
  keys:new Map(),
  touchId:null,
  touchDir:null,
  padDir:null,
  mouseDown:false,
  mouseDir:null,
  actionId:null
};
const dialog={
  choice:null,
  lastDir:null,
  active:false,
  name:'',
  lines:[],
  index:0,
  chars:[],
  shown:0,
  elapsed:0,
  delay:.025,
  npc:null
};
let toastUntil=0,lastTouchTime=-10000,elapsedTime=0,lastBump=0;
let kiss=null; // {npc,start} while Tom and TNB greet

function showToast(text,seconds=2.8) {
  $('toast').textContent=text;
  toastUntil=performance.now()+seconds*1000;
}

