'use strict';
// engine/painted.js — Painted (bitmap) sprites that ride on top of the game's row-string sprites.
//
// The game's logic (hand points, Rose's seat, bruises, mirrors, outfit keys) reads row strings. A painted character keeps
// those rows (a small, quantized copy of the painting at the same size) and tags each rows array with `_paint`:
//     rows._paint = {a:'tomBattle', f:'idle', flip:false}
// drawSprite (data/battle-sprites.js) sees the tag and draws the painted frame instead of the rows, scaled to the same
// box. While the atlas is still loading, or if it fails, the rows are drawn as before, so nothing breaks.
// mirrorRows (engine/tiles.js) keeps the tag and toggles `flip`, so every mirrored frame stays painted.
//
// Atlas: one image of equally sized frames at K times the rows' resolution. Battle sheets are K = 3 (Boppy 4) since sharp1
// (2026-11-05, Tom: the party looked blurry in battle; K = 2 was stretched up to 1.45x on a phone). See tools/sprite-bake/hires.py.
// ART_V: cache tag for every painted atlas image (2026-11-01, heads1: all adult battle heads re-baked).
const ART_V='hugv2';
const PAINTED={};
// Cast ids that own painted sheets (paintedOwners, below). Longer prefixes first: tomride before tom.
const PAINTED_CAST=['tomride','tom','grace','rose','tnb','amy','deedee','boppy','nara','justin','olivia','jojo','michael','ellie'];
// Memory (mem1, 2026-11-03): enemy sheets and battle sheets are no longer all loaded at boot. An older iPad ran hot and slow
// after 30 to 60 minutes because every enemy and battle picture, and a canvas copy of every painted frame ever drawn, stayed
// in memory. Overworld sheets (ids ending in Ow, townsfolk) still load at boot. The rest are "lazy": paintedTick (below)
// loads what the party, the current map's monsters and the current fight need, and releases the rest once unused.
function paintedLazy(id) { return /^foe_/.test(id)||/^tbo_/.test(id)||/emoStory$/.test(id)||(!/Ow$/.test(id)&&paintedOwners(id).length>0); }
function paintedAtlas(id,src,rects,k,tintFn) {
  const a={id,rects,k,tintFn,img:null,ready:false,failed:false,src:src+(src.includes('?')?'':'?v='+ART_V),users:new Set(),used:0};   // atlases carry no version of their own; bump ART_V whenever a baked .webp changes
  a.lazy=paintedLazy(id);
  PAINTED[id]=a;
  if(!a.lazy) paintedLoad(a);
  return a;
}
function paintedLoad(a) {
  if(a.img||a.failed) return;
  const im=new Image(); a.img=im; a.ready=false;
  im.onload=()=>{ if(a.img===im) a.ready=true; };
  im.onerror=()=>{ if(a.img===im) { a.failed=true; a.img=null; } };
  im.src=a.src;
}
// Drop the picture and every canvas copy of its frames; the next draw (or paintedTick) loads it again.
function paintedRelease(a) {
  if(!a.img) return;
  const im=a.img; im.onload=im.onerror=null; a.img=null; a.ready=false;
  try { im.src=''; } catch(e) {}
  for(const rows of a.users) { if(rows._pc) for(const c of rows._pc.values()) paintedDrop(c); delete rows._pc; }
  a.users.clear();
}
// Canvas copies of frames (one per frame, flip, flash and outfit colour) are capped at PAINTED_PX_CAP pixels in total (sharp1):
// the sharper battle sheets make each copy 2.25x bigger, and iPhone Safari blanks canvases once their total memory runs out.
// The copy used longest ago goes first; it is simply made again from the atlas if that frame is drawn later.
const PAINTED_PX_CAP=24e6,PAINTED_LRU=new Map(); let paintedPx=0;
function paintedDrop(c) { const e=PAINTED_LRU.get(c); if(!e) return; PAINTED_LRU.delete(c); paintedPx-=c.width*c.height; e[0].delete(e[1]); c.width=c.height=0; }
function paintedKeep(c,cache,key) {
  PAINTED_LRU.set(c,[cache,key]); paintedPx+=c.width*c.height;
  for(const old of PAINTED_LRU.keys()) { if(paintedPx<=PAINTED_PX_CAP||old===c) break; paintedDrop(old); }
}
function paintRows(rows,atlas,frame,flip) { rows._paint={a:atlas,f:frame,flip:!!flip}; return rows; }
// Recolour the dark shirt pixels of a painted frame to an outfit colour, keeping the painted shading.
// mode: 'coral' picks a coral tunic (Rose). tintFn(r,g,b) -> brightness factor for a garment pixel, or 0 to leave it alone (Grace's violet). Default: Tom's dark tee.
function paintedTintPixels(g,w,h,rowRange,k,hex,mode,tintFn) {
  const y0=Math.max(0,Math.floor(rowRange[0]*k)),y1=Math.min(h-1,Math.ceil((rowRange[1]+1)*k));
  if(y1<=y0) return;
  const cr=parseInt(hex.slice(1,3),16),cg=parseInt(hex.slice(3,5),16),cb=parseInt(hex.slice(5,7),16);
  const im=g.getImageData(0,y0,w,y1-y0),d=im.data;
  for(let i=0;i<d.length;i+=4) {
    if(d[i+3]<8) continue;
    const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b);
    let f;
    if(tintFn) { f=tintFn(r,gg,b); if(!f) continue; }
    else if(mode==='coral') {                                // a coral tunic (Rose): strongly red over green, not skin
      if(r<150||r-gg<90||gg-b>34) continue;
      f=((r*.3+gg*.59+b*.11)/255)/.6; if(f>1.2) f=1.2; if(f<.5) f=.5;
    } else {
    if(mx>120||r<b-14) continue;                         // not dark and warm: skin, jeans, logo, hair highlights
    const lum=(r*.3+gg*.59+b*.11)/255;
    f=.32+lum*3.6; if(f>1.12) f=1.12;
    }
    d[i]=Math.min(255,cr*f); d[i+1]=Math.min(255,cg*f); d[i+2]=Math.min(255,cb*f);
  }
  g.putImageData(im,0,y0);
}
// The painted frame for these rows at the current outfit tint and flash, cached per rows array. Null if not ready.
function paintedCanvas(rows,flash) {
  const p=rows._paint; if(!p) return null;
  const A=typeof p.a==='string'?PAINTED[p.a]:p.a; if(!A) return null;
  A.used=performance.now();
  if(!A.ready) { paintedLoad(A); return null; }
  const R=A.rects[p.f]; if(!R) return null;
  const t=activeTint;
  const key=(p.flip?'f':'n')+(flash?'F':'')+(t&&!flash?(t.rows.join(',')+t.color):'');
  const cache=rows._pc||(rows._pc=new Map()); A.users.add(rows);
  let c=cache.get(key); if(c) { const e=PAINTED_LRU.get(c); if(e) { PAINTED_LRU.delete(c); PAINTED_LRU.set(c,e); } return c; }
  c=document.createElement('canvas'); c.width=R[2]; c.height=R[3];
  const g=c.getContext('2d');
  if(p.flip) { g.translate(R[2],0); g.scale(-1,1); }
  g.drawImage(A.img,R[0],R[1],R[2],R[3],0,0,R[2],R[3]);
  g.setTransform(1,0,0,1,0,0);
  if(flash) { g.globalCompositeOperation='source-in'; g.fillStyle='#fff8e6'; g.fillRect(0,0,R[2],R[3]); g.globalCompositeOperation='source-over'; }
  else if(t&&t.rows) paintedTintPixels(g,R[2],R[3],A.tintFrac?[A.tintFrac[0]*R[3]/A.k,A.tintFrac[1]*R[3]/A.k]:t.rows,A.k,t.color,A.tintMode,A.tintFn);
  cache.set(key,c); paintedKeep(c,cache,key);
  return c;
}
// Draw painted rows at x,y at the given scale (box = rows size x scale). Returns false if it cannot (caller draws the rows).
function drawPainted(rows,x,y,scale,flash,alpha) {
  const c=paintedCanvas(rows,flash); if(!c) return false;
  const W=rows[0].length*scale,H=rows.length*scale;
  const prevA=gfx.globalAlpha,sm=gfx.imageSmoothingEnabled,q=gfx.imageSmoothingQuality;
  gfx.globalAlpha=alpha; gfx.imageSmoothingEnabled=true; gfx.imageSmoothingQuality='high';
  gfx.drawImage(c,Math.round(x),Math.round(y),Math.round(W),Math.round(H));
  gfx.globalAlpha=prevA; gfx.imageSmoothingEnabled=sm; gfx.imageSmoothingQuality=q;
  return true;
}

// ---------- Which lazy sheets to keep (mem1) ----------
// Owner of an atlas id: the party member or foe it belongs to. Tom-with-Rose-on-his-shoulders belongs to both.
function paintedOwners(id) {
  if(/^foe_/.test(id)) return [id];
  if(/^tbo_/.test(id)) return ['tbo:'+id.split('_')[1]];   // Tombo frames (engine/tombo-frames.js): wanted while a fight has that partner
  for(const c of PAINTED_CAST) if(id.startsWith(c)) return c==='tomride'?['tom','rose']:[c];
  if(/emoStory$/.test(id)) return ['emo:'+id];   // a townsperson's mood poses (npcemo7): loaded by storyPosesLoad when a line shows one, released after 20 idle seconds
  return [];
}
// The foes a monster on the map can bring into a fight (its formation).
function paintedFormation(mid) {
  const out=new Set([mid]);
  try { const F=typeof B2_FORMATIONS!=='undefined'&&B2_FORMATIONS[mid]; const f=typeof F==='function'?F():F; if(f) for(const x of f) out.add(x[0]); } catch(e) {}
  return out;
}
function paintedWanted() {
  const want=new Set();
  try { for(const m of party) if(m&&m.id) want.add(m.id); } catch(e) {}
  try { if(B2.active) { for(const u of B2.party) { want.add(u.id); want.add('tbo:'+u.id); } for(const f of B2.foes) want.add('foe_'+f.id); } } catch(e) {}
  try { for(const n of (currentMap&&currentMap.npcs)||[]) if(n.monster) for(const id of paintedFormation(n.monster)) want.add('foe_'+id); } catch(e) {}
  return want;
}
// Loads what is wanted. Releases a lazy sheet only when it is not wanted, not in a fight, and not drawn for 20 seconds
// (a cutscene can draw someone outside the party; that sheet then stays until the scene has moved on).
const PAINTED_IDLE=20000;
function paintedTick() {
  const want=paintedWanted(),now=performance.now(),fight=typeof battle!=='undefined'&&battle.active;
  for(const id in PAINTED) {
    const a=PAINTED[id]; if(!a.lazy) continue;
    const need=paintedOwners(id).some(o=>want.has(o));
    if(need) paintedLoad(a);
    else if(a.img&&!fight&&now-a.used>PAINTED_IDLE) paintedRelease(a);
  }
}
// True once every sheet the current fight needs has loaded (or failed, which falls back to the old rows).
function paintedFightReady() {
  const want=paintedWanted();
  for(const id in PAINTED) { const a=PAINTED[id]; if(a.lazy&&paintedOwners(id).some(o=>want.has(o))&&!a.ready&&!a.failed) return false; }
  return true;
}
setInterval(()=>{ try { paintedTick(); } catch(e) {} },1500);
