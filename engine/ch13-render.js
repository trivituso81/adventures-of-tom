'use strict';
// engine/ch13-render.js — The look of chapter 13 (Part 2): the Transcontinental Sub-Rail, the tunnel Sal and Sol bored under the Layover.
//   Ground 'sub': 'subwall' (tiled concrete with a safety stripe and a work light), 'subrock' (raw rock with an amber glow), 'subfloor' (a
//   concrete platform with a yellow tactile edge), 'subtrack' (rails and ties on gravel), 'subdirt' (cave floor), 'subamber' (a pane of Long
//   Island's dome seen from below), 'subgold' (molten gold where the coins melted a doorway), 'subvoid'.
//   Props: subconsole, submap, subsign, subvend, subcrate, subbench, subhandcar, sublamp, subtrain, subcable, subrubble.
//   Map effects (wraps b7DrawMapFx): the amber plate tints the pocket behind it until the coins melt it (flag ch13-melt: gold runs down the
//   glass for about three seconds); HUSH-9 (an NPC with `hush`) gives off pale rings and a SHH; Warden Boppy (an NPC with `armor`) wears gold plate
//   and a slow aura. Also the minimap, the battle backdrops, and the baked-music mapping for the three new maps.
// Story state read here: flags ch13-melt (the plate is melting), ch13-melted (the doorway is open), ch13-worm (the Worm is up).
// Wraps drawOutdoorTile, drawObject, buildMiniBase, drawLEBattleBg, b7DrawMapFx and mcAreaTrack. Loaded after engine/ch12-render.js.
const LE_drawOutdoorTile_ch13=drawOutdoorTile,LE_drawObject_ch13=drawObject,LE_buildMiniBase_ch13=buildMiniBase,LE_drawLEBattleBg_ch13=drawLEBattleBg,
  LE_b7DrawMapFx_ch13=b7DrawMapFx;
let LE_mcAreaTrack_ch13=null;   // engine/music-clips.js loads later; wrapped on DOMContentLoaded
const subGround=map=>!!(map&&map.style&&map.style.ground==='sub');
const subTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'subvoid';
const subFlag=k=>typeof STORY!=='undefined'&&STORY.mode==='full'&&!!flag(k);
const SUB_FLOOR={subfloor:['#8a8d96','#868992','#8e919a'],subtrack:['#4a4540','#46413c','#4e4944'],subdirt:['#6a5848','#665444','#6e5c4c'],subgold:['#ffd24a','#ffc93a','#ffdc66']};
const SUB_NAMES=['subwall','subrock','subamber','subvoid'];
addEventListener('DOMContentLoaded',()=>{
  if(typeof mcAreaTrack!=='function'||LE_mcAreaTrack_ch13) return;
  LE_mcAreaTrack_ch13=mcAreaTrack;
  mcAreaTrack=function(m) {
    if(m&&['subdepot','subtunnel','subchamber'].includes(m.id)) return 'terminal';
    return LE_mcAreaTrack_ch13(m);
  };
});

// ---------- Ground ----------
function subWallFace(px,py,n) {   // a tiled tunnel wall: dark concrete above, a cream tile band, a yellow safety stripe, a work light now and then
  rect(px,py,T,T,'#3a3d48'); rect(px,py,T,5,'#262833');
  rect(px,py+8,T,16,'#cfc8b0'); for(let k=0;k<4;k++) rect(px+k*8,py+8,1,16,'#a8a28c'); rect(px,py+15,T,1,'#a8a28c'); rect(px,py+22,T,1,'#a8a28c');
  rect(px,py+8,T,2,'#e8e2cc'); rect(px,py+24,T,3,'#e8c040'); rect(px,py+27,T,5,'#262833');
  if(n%5===0) { rect(px+12,py+3,8,5,'#262833'); rect(px+13,py+4,6,3,'#ffd9a0'); }
}
function subRockFace(px,py,n) {
  rect(px,py,T,T,'#5a4c42'); rect(px,py,T,4,'#3a2f28');
  for(let k=0;k<5;k++) { const m=hash(px+k,py*3+n); rect(px+m%26,py+4+(m>>>4)%20,5,3,k%2?'#6e5e52':'#4a3e36'); }
  rect(px,py+T-5,T,5,'#3a2f28'); if(n%4===0) rect(px+6+(n%16),py+10,2,10,'#f09a4a60');
}
drawOutdoorTile=function(x,y,type,time) {
  if(!subGround(currentMap)) return LE_drawOutdoorTile_ch13(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='subvoid') { rect(px,py,T,T,'#0c0a10'); return; }
  if(type==='subwall') {
    if(SUB_FLOOR[subTile(x,y+1)]) { subWallFace(px,py,n); return; }
    rect(px,py,T,T,'#1c1e26'); rect(px,py+T-3,T,3,'#2a2c38'); return;
  }
  if(type==='subrock') {
    if(SUB_FLOOR[subTile(x,y+1)]||subTile(x,y+1)==='subamber') { subRockFace(px,py,n); return; }
    rect(px,py,T,T,'#2a211c'); for(let k=0;k<3;k++) { const m=hash(x*3+k,y); rect(px+m%26,py+(m>>>5)%26,4,3,'#3a2f28'); } return;
  }
  if(type==='subamber') {
    const gl=.5+.5*Math.sin(time*1.6+y*.7);
    rect(px,py,T,T,'#c27a1c'); rect(px+2,py,T-4,T,'#f2a92e'); rect(px+6,py,6,T,'#ffcf6a'); rect(px+T-8,py,2,T,'#fff0b0');
    for(let k=0;k<3;k++) { const m=hash(x*7+k,y*5); rect(px+4+m%22,py+2+(m>>>4)%24,2,2,'#ffe9a0'); }
    gfx.globalAlpha=.12+.1*gl; rect(px,py,T,T,'#fff1c0'); gfx.globalAlpha=1;
    rect(px,py,2,T,'#7a4a12'); rect(px+T-2,py,2,T,'#7a4a12'); if(subTile(x,y-1)!=='subamber') rect(px,py,T,3,'#7a4a12'); if(subTile(x,y+1)!=='subamber') rect(px,py+T-3,T,3,'#7a4a12');
    return;
  }
  const pal=SUB_FLOOR[type]||SUB_FLOOR.subfloor;
  rect(px,py,T,T,pal[n%3]);
  if(type==='subfloor') {
    if(n%3===0) rect(px+4+(n%20),py+6+((n>>>3)%18),3,2,'#9a9da6'); if(n%5===0) rect(px+10+(n%12),py+14,2,2,'#767982');
    rect(px,py+T-1,T,1,'#7a7d86');
    if(subTile(x,y+1)==='subtrack') { rect(px,py+T-6,T,6,'#e8c040'); for(let k=0;k<T;k+=4) rect(px+k,py+T-6,2,6,'#c8a030'); }
    if(subTile(x,y-1)==='subtrack') { rect(px,py,T,6,'#e8c040'); for(let k=0;k<T;k+=4) rect(px+k,py,2,6,'#c8a030'); }
  } else if(type==='subtrack') {
    for(let k=0;k<5;k++) { const m=hash(x*5+k,y*3); rect(px+m%28,py+(m>>>5)%28,3,2,k%2?'#5e5852':'#3a3632'); }
    rect(px+4,py,5,T,'#5a3f2a'); rect(px+20,py,5,T,'#5a3f2a'); rect(px+4,py,5,2,'#7a5a3a'); rect(px+20,py,5,2,'#7a5a3a');
    rect(px,py+8,T,3,'#2a2d36'); rect(px,py+8,T,1,'#c8d0dc'); rect(px,py+21,T,3,'#2a2d36'); rect(px,py+21,T,1,'#c8d0dc');
  } else if(type==='subdirt') {
    if(n%3===0) rect(px+4+(n%20),py+6+((n>>>3)%18),4,2,'#7e6a58'); if(n%4===0) rect(px+8+(n%16),py+16,3,2,'#564636'); rect(px,py+T-1,T,1,'#5a4838');
  } else if(type==='subgold') {
    const gl=.5+.5*Math.sin(time*3+x+y); gfx.globalAlpha=.3+.25*gl; rect(px,py,T,T,'#fff0a0'); gfx.globalAlpha=1;
    for(let k=0;k<3;k++) rect(px+4+((k*9+Math.floor(time*8))%22),py+4+k*8,6,2,'#ffe27a');
  }
};

// ---------- Props ----------
drawObject=function(o,time) {
  if(!subGround(currentMap)) return LE_drawObject_ch13(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'subconsole': {   // Sol's dispatch desk: a radio, a switchboard, an antenna
      ellipse(cx,b-2,w/2,4,'#00000040'); rect(x,y+2,w,24,OUT); rect(x+1,y+3,w-2,22,'#5a4a3a'); rect(x+1,y+3,w-2,4,'#7a6448');
      rect(x+6,y-16,34,20,OUT); rect(x+7,y-15,32,18,'#3a3f4c'); rect(x+10,y-12,10,8,'#14102a'); rect(x+11,y-11,8,6,Math.floor(time*3)%2?'#6ac06a':'#3a8a4a');
      ellipse(x+30,y-6,4,4,'#c8d0dc'); ellipse(x+30,y-6,2,2,'#4a4f5c'); rect(x+36,y-30,2,14,OUT); rect(x+35,y-33,4,4,'#d9503f');
      for(let k=0;k<5;k++) { rect(x+w-44+k*7,y+8,4,10,OUT); rect(x+w-43+k*7,y+9,2,8,k%2?'#f2c75a':'#d9503f'); }
      label('DISPATCH',cx,y-22,'#f2c75a',1); return;
    }
    case 'submap': {   // a route map on a board: a red line most of the way
      rect(x,y-20,w,34,OUT); rect(x+2,y-18,w-4,30,'#e8e2cc'); rect(x+2,y-18,w-4,3,'#b8b09a');
      rect(x+8,y-4,w-16,3,'#c8453a'); rect(x+8,y-4,w-34,3,'#c8453a'); ellipse(x+10,y-2,3,3,'#3a3f4c'); ellipse(cx,y-2,3,3,'#3a3f4c'); ellipse(x+w-10,y-2,3,3,'#3a3f4c');
      rect(x+w-18,y-12,7,1,'#d9503f'); rect(x+w-15,y-15,1,7,'#d9503f'); label('SUB-RAIL',cx,y-17,'#3a3f4c',1); return;
    }
    case 'subsign': {   // a hanging station or mile sign: a dark blue panel with white lettering
      rect(x,y-20,w,28,OUT); rect(x+2,y-18,w-4,24,'#243a68'); rect(x+2,y-18,w-4,3,'#f4f0e6');
      label(String(o.sign||'SUB-RAIL'),cx,y-11,'#f4f0e6',1); label('SUB-RAIL',cx,y-3,'#9ab0e0',1); rect(x+6,y+8,2,6,OUT); rect(x+w-8,y+8,2,6,OUT); return;
    }
    case 'subvend': {   // a coffee machine: glowing front, one button
      ellipse(cx,b-2,12,3,'#00000040'); rect(x+3,y-18,T-6,44,OUT); rect(x+4,y-17,T-8,42,'#a83a32'); rect(x+4,y-17,T-8,3,'#d9695a');
      rect(x+7,y-12,T-14,18,'#14102a'); rect(x+8,y-11,T-16,16,Math.floor(time*2)%2?'#ffd9a0':'#f2c780'); label('COFFEE',cx,y-8,'#6a3a1a',1);
      rect(x+9,y+9,T-18,4,'#f4f0e6'); rect(x+11,y+15,T-22,6,'#14102a'); return;
    }
    case 'subcrate': {   // mail crates: stacked boxes and a canvas sack, every one tied shut
      ellipse(cx,b-2,w/2,3,'#00000030');
      for(let k=0;k<o.w;k++) { const sx=x+k*T+3; rect(sx,y+6,T-6,20,OUT); rect(sx+1,y+7,T-8,18,'#a8884a'); rect(sx+1,y+7,T-8,3,'#c8a86a'); rect(sx+T/2-4,y+12,2,12,'#8a6a2a'); rect(sx+4,y+16,T-14,2,'#8a6a2a'); }
      rect(x+8,y-3,T-6,12,OUT); rect(x+9,y-2,T-8,10,'#e4dcc0'); rect(x+9,y+4,T-8,2,'#b8b098'); label('MAIL',x+T/2+6,y-1,'#6a5a3a',1); return;
    }
    case 'subbench': {   // a platform bench: wood slats on iron legs
      ellipse(cx,b-2,w/2,3,'#00000030'); rect(x+3,y+14,3,10,OUT); rect(x+w-6,y+14,3,10,OUT);
      rect(x+2,y+6,w-4,10,OUT); rect(x+3,y+7,w-6,8,'#8a6a4a'); for(let k=x+10;k<x+w-8;k+=10) rect(k,y+7,1,8,'#5a3f2a');
      rect(x+2,y-4,w-4,8,OUT); rect(x+3,y-3,w-6,6,'#9a7a5a'); return;
    }
    case 'subhandcar': {   // a handcar on the rails: a flat deck, a pump handle, a horn
      ellipse(cx,b-2,w/2,3,'#00000040'); rect(x+3,y+14,w-6,8,OUT); rect(x+4,y+15,w-8,6,'#a8453a'); rect(x+4,y+15,w-8,2,'#d9695a');
      ellipse(x+10,b-3,5,5,OUT); ellipse(x+10,b-3,3,3,'#c8d0dc'); ellipse(x+w-10,b-3,5,5,OUT); ellipse(x+w-10,b-3,3,3,'#c8d0dc');
      rect(cx-1,y-6,3,22,OUT); rect(cx-10,y-8,22,3,OUT); rect(cx-9,y-7,20,1,'#c8d0dc'); rect(x+w-14,y+6,8,6,'#f2c75a'); return;
    }
    case 'sublamp': {   // a tripod work lamp
      ellipse(cx,b-2,10,3,'#00000040'); rect(cx-1,y+4,3,20,OUT); rect(cx-8,b-4,16,2,OUT); rect(cx-8,y+14,3,12,OUT); rect(cx+6,y+14,3,12,OUT);
      rect(cx-7,y-8,14,12,OUT); rect(cx-6,y-7,12,10,'#e8e4dc'); rect(cx-5,y-6,10,8,Math.floor(time*6)%11?'#fff1c0':'#ffe08a');
      gfx.globalAlpha=.16; ellipse(cx,y+10,26,22,'#ffe9a0'); gfx.globalAlpha=1; return;
    }
    case 'subtrain': {   // a stalled commuter car on the rails: a long silver body, windows, doors, a dim light
      ellipse(cx,b-3,w/2,5,'#00000050'); rect(x+2,y+2,w-4,h-8,OUT); rect(x+3,y+3,w-6,h-10,'#aab2c0'); rect(x+3,y+3,w-6,5,'#d8dee8');
      rect(x+3,y+h-17,w-6,6,'#5a6a8a'); rect(x+3,y+h-12,w-6,2,'#e8c040');
      for(let k=0;k<Math.floor((w-10)/22);k++) { const wx=x+10+k*22; rect(wx,y+10,16,14,OUT); rect(wx+1,y+11,14,12,(Math.floor(time*2)+k+n)%7===0?'#ffe9a0':'#2a3048'); rect(wx+1,y+11,14,2,'#4a5878'); }
      rect(x+w/2-10,y+8,2,h-20,OUT); rect(x+w/2+8,y+8,2,h-20,OUT);
      ellipse(x+14,b-6,5,5,OUT); ellipse(x+w-14,b-6,5,5,OUT); return;
    }
    case 'subcable': {   // a bundle of cables laid along the wall: grey, red, yellow, blue
      for(let k=0;k<o.w;k++) { const sx=x+k*T; rect(sx,y+8,T,4,'#2a2d36'); rect(sx,y+13,T,4,'#d9503f'); rect(sx,y+18,T,3,'#e8c040'); rect(sx,y+22,T,3,'#4a78c2'); rect(sx+8,y+6,3,20,'#14131a'); }
      return;
    }
    case 'subrubble': {   // a pile of rock
      ellipse(cx,b-3,13,4,'#00000040'); ellipse(cx,b-9,12,8,OUT); ellipse(cx,b-9,11,7,'#6a5a4c'); ellipse(cx-3,b-12,6,4,'#8a7a6a');
      ellipse(cx+7,b-6,6,5,OUT); ellipse(cx+7,b-6,5,4,'#5a4c40'); ellipse(cx-8,b-5,5,4,'#7a6a5c'); return;
    }
  }
  return LE_drawObject_ch13(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!subGround(map)) return LE_buildMiniBase_ch13(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={subwall:'#3a3d48',subrock:'#5a4c42',subamber:'#f2a92e',subvoid:'#0c0a10'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x]; b.fillStyle=col[t]||(SUB_FLOOR[t]&&SUB_FLOOR[t][0])||'#6a6a80'; b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.restore) { b.fillStyle='#f2c75a'; b.fillRect(o.x*2,o.y*2,2,2); }
  return c;
};

// ---------- Battle backdrops ----------
// The tunnel: a tiled wall, a work light, the platform and two rails running away. The chamber: raw rock, a wall of amber glowing on the right.
drawLEBattleBg=function(t) {
  if(!subGround(currentMap)) return LE_drawLEBattleBg_ch13(t);
  const cave=currentMap.id==='subchamber';
  if(cave) {
    rect(0,0,192,108,'#2a211c'); rect(0,0,192,40,'#3a2f28');
    for(let k=0;k<40;k++) { const n=hash(k,23); rect(n%190,2+(n>>>8)%42,6,3,['#4a3e36','#5a4c42','#34291f'][k%3]); }
    rect(150,6,38,60,'#c27a1c'); rect(152,6,34,60,'#f2a92e'); rect(158,6,8,60,'#ffcf6a'); rect(150,6,38,2,'#7a4a12'); rect(150,64,38,2,'#7a4a12');
    for(let k=0;k<6;k++) { const n=hash(k,29); rect(154+n%28,10+(n>>>6)%50,2,2,'#ffe9a0'); }
    gfx.globalAlpha=.1+.06*Math.sin(t*1.6); rect(130,0,62,70,'#ffcf6a'); gfx.globalAlpha=1;
    rect(0,66,192,42,'#6a5848'); rect(0,66,192,2,'#564636');
    for(let k=0;k<36;k++) { const n=hash(k,31); rect(n%190,68+(n>>>8)%38,4,2,['#7e6a58','#564636','#8a7664'][k%3]); }
    for(const y of [74,92]) { rect(0,y,150,3,'#2a2d36'); rect(0,y,150,1,'#c8d0dc'); } for(let k=0;k<150;k+=14) rect(k,72,6,34,'#5a3f2a');
    return true;
  }
  rect(0,0,192,108,'#3a3d48'); rect(0,0,192,6,'#262833');
  rect(0,10,192,38,'#cfc8b0'); for(let k=0;k<192;k+=12) rect(k,10,1,38,'#a8a28c'); rect(0,24,192,1,'#a8a28c'); rect(0,36,192,1,'#a8a28c'); rect(0,10,192,2,'#e8e2cc');
  rect(0,48,192,5,'#e8c040'); rect(0,53,192,6,'#262833');
  for(let k=0;k<4;k++) { const lx=14+k*50; rect(lx,2,22,8,'#262833'); rect(lx+2,4,18,4,Math.floor(t*6+k)%13?'#ffe9a0':'#d8c080'); gfx.globalAlpha=.08; rect(lx-8,10,38,40,'#ffe9a0'); gfx.globalAlpha=1; }
  rect(0,59,192,49,'#8a8d96'); rect(0,59,192,3,'#e8c040');
  for(let k=0;k<30;k++) { const n=hash(k,37); rect(n%190,64+(n>>>8)%42,3,2,'#9a9da6'); }
  for(const y of [74,92]) { rect(0,y,192,4,'#2a2d36'); rect(0,y,192,1,'#c8d0dc'); }
  for(let k=0;k<192;k+=16) rect(k,70,7,30,'#5a3f2a');
  return true;
};

// ---------- Map effects ----------
// The amber plate and its pocket (chamber), HUSH-9's rings (an NPC with `hush`), Boppy's gold plate (an NPC with `armor`).
let ch13MeltT=-1,ch13MeltSeen=false,ch13Last=0;
function ch13Plate(time,melt) {
  const x0=20*T,y0=3*T,w=5*T,h=8*T;   // the plate, plus the pocket behind it
  gfx.save();
  gfx.globalAlpha=(1-melt)*.34; rect(x0,y0,w,h,'#f2a92e');
  gfx.globalAlpha=(1-melt)*.2; for(let k=0;k<5;k++) rect(x0+k*T+((Math.floor(time*3)+k)%5)*3,y0,3,h,'#fff1c0');
  gfx.restore();
  if(melt>0) {   // gold runs down the glass, then the doorway glows
    gfx.save();
    for(let k=0;k<9;k++) { const run=Math.max(0,Math.min(1,melt*1.6-k*.06)),len=Math.round(run*(h-T*2)),gx=x0+4+k*3.4;
      gfx.globalAlpha=.9*(1-Math.max(0,melt-.7)/.3); rect(gx,y0+T*3,3,len,k%2?'#ffd24a':'#ffe27a'); }
    gfx.globalAlpha=Math.min(.5,melt*.6); rect(x0,y0+T*3,T,T*2,'#fff0a0');
    gfx.restore();
  }
}
function ch13Hush(n,time) {
  const p=position(n),cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2);
  gfx.save();
  for(let k=0;k<3;k++) { const u=((time*.5)+k/3)%1; gfx.globalAlpha=(1-u)*.5; const r=14+u*54;
    for(let a=0;a<28;a++) { const ang=a/28*Math.PI*2; rect(Math.round(cx+Math.cos(ang)*r),Math.round(base-24+Math.sin(ang)*r*.55),2,2,'#c4c9d2'); } }
  gfx.globalAlpha=.9; label('SHH',cx,base-72,'#f4f0e6',1); label('SHH',cx+1,base-71,'#2a2d36',1);
  gfx.restore();
}
function ch13Armor(n,time) {
  const p=position(n),cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2),gl=.5+.5*Math.sin(time*2.2);
  gfx.save();
  gfx.globalAlpha=.16+.1*gl; ellipse(cx,base-26,30,42,'#ffd24a');
  gfx.globalAlpha=.55+.15*gl; rect(cx-11,base-38,22,16,'#e8b83a'); rect(cx-11,base-38,22,3,'#fff0a0'); rect(cx-1,base-38,2,16,'#a8781a');   // breastplate
  rect(cx-16,base-42,8,7,'#e8b83a'); rect(cx+8,base-42,8,7,'#e8b83a'); rect(cx-16,base-42,8,2,'#fff0a0'); rect(cx+8,base-42,8,2,'#fff0a0');      // pauldrons
  rect(cx-10,base-60,20,6,'#e8b83a'); rect(cx-10,base-60,20,2,'#fff0a0'); rect(cx-1,base-62,2,6,'#a8781a');                                         // helmet crown
  rect(cx-9,base-20,8,10,'#e8b83a'); rect(cx+1,base-20,8,10,'#e8b83a');                                                                          // greaves
  gfx.globalAlpha=.9; rect(cx-3,base-32,6,3,'#fff0a0');                                                                                              // the hum
  gfx.restore();
}
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch13(time);
  const dt=Math.min(.1,Math.max(0,time-ch13Last)); ch13Last=time;
  if(typeof STORY==='undefined'||STORY.mode!=='full') return;
  if(currentMap.id==='subchamber') {
    const melted=!!flag('ch13-melted');
    if(flag('ch13-melt')&&!ch13MeltSeen) { ch13MeltSeen=true; ch13MeltT=0; }
    if(!flag('ch13-melt')) { ch13MeltSeen=false; ch13MeltT=-1; }
    if(ch13MeltT>=0) ch13MeltT=Math.min(3,ch13MeltT+dt);
    const melt=melted?1:ch13MeltT>=0?ch13MeltT/3:0;
    if(melt<1) ch13Plate(time,melt);
  }
  for(const n of currentMap.npcs) { if(n.hidden) continue; if(n.hush) ch13Hush(n,time); if(n.armor) ch13Armor(n,time); }
};
