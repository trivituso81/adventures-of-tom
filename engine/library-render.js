'use strict';
// engine/library-render.js — The look of chapter 7's Stacks under the Hush Library (ground 'stacks': bookcase walls
// 'bkwall' that show their shelves when there is floor below them, dark 'bkvoid', 'fiction' and 'nonfic' carpet, 'hallwood'
// boards, 'picrug' and the 'storyrug' in Picture Books, 'stairsup' back to the library) and the Reading Room (ground
// 'readroom': 'readwood' parquet, the red 'dais'). Props: bookcase, readdoors, stackglobe, bookcart, lamptable, stacksign,
// ladder, lowshelf, beanbag, storychair, puppettheater, lectern, and the stacksdoor in the library room. Also the minimap
// and the battle backdrops (wraps drawLEBattleBg from engine/school-render.js). Wraps drawOutdoorTile, drawObject and
// buildMiniBase. Loaded after engine/oak-render.js.
const LE_drawOutdoorTile_lib=drawOutdoorTile,LE_drawObject_lib=drawObject,LE_buildMiniBase_lib=buildMiniBase,LE_drawLEBattleBg_lib=drawLEBattleBg;
const LIB_GROUNDS=['stacks','readroom'];
const libGround=map=>{ const g=map&&map.style&&map.style.ground; return LIB_GROUNDS.includes(g)?g:null; };
const libTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'bkvoid';
const LIB_FLOOR={fiction:['#3f6a52','#3c664f','#436e56'],nonfic:['#3f5a8a','#3c5786','#435e8e'],hallwood:['#8a6440','#86603c','#8e6844'],
  picrug:['#e8c06a','#e4bc66','#ecc46e'],storyrug:['#d96a5a','#5a9ad9','#6ac06a'],readwood:['#7a5434','#765030','#7e5838'],dais:['#8a2a3a','#862636','#8e2e3e'],
  stairsup:['#9a7450','#96704c','#9e7854']};
const LIB_SPINES=['#8a2a3a','#2f4a8a','#3f8a5a','#c9a23a','#6a4a8a','#c96a3a','#2a6a6a','#e8dcb8'];
// A row of book spines, w wide and h tall, picked from the tile's hash so every shelf looks different.
function libSpines(x,y,w,h,n) {
  let k=0;
  for(let xx=x;xx<x+w-1;) { const bw=2+((n>>>(k%24))&1)+((n>>>((k+5)%24))&1),bh=h-((n>>>((k+3)%24))&3);
    rect(xx,y+h-bh,bw,bh,LIB_SPINES[(n+k*7)%LIB_SPINES.length]); rect(xx,y+h-bh+2,bw,1,'#00000030'); xx+=bw+((n>>>((k+9)%24))%5===0?2:0); k++; }
}
function libFace(px,py,n) {   // the front of a bookcase: dark frame, three shelves of books
  rect(px,py,T,T,'#3a2418'); rect(px,py,T,3,'#5a3a24');
  for(let r=0;r<3;r++) { const sy=py+4+r*9; rect(px+1,sy,T-2,8,'#1e120c'); libSpines(px+2,sy,T-3,8,hash(n,r)); rect(px,sy+8,T,1,'#6a4a2e'); }
}

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=libGround(currentMap);
  if(!g) return LE_drawOutdoorTile_lib(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='bkvoid') { rect(px,py,T,T,'#120c10'); return; }
  if(type==='bkwall') {
    const below=libTile(x,y+1);
    if(LIB_FLOOR[below]) { libFace(px,py,n); return; }
    rect(px,py,T,T,'#22160f'); rect(px,py,T,2,'#3a2418'); if(libTile(x,y-1)!=='bkwall') rect(px,py,T,4,'#4a3020');
    return;
  }
  const pal=LIB_FLOOR[type]||LIB_FLOOR.hallwood;
  rect(px,py,T,T,pal[n%3]);
  if(type==='hallwood'||type==='readwood'||type==='stairsup') {
    for(let k=0;k<T;k+=8) rect(px,py+k,T,1,shadeHex(pal[0],-22));
    rect(px+((y*13)%T),py,1,T,shadeHex(pal[0],-16));
    if(type==='readwood'&&(x+y)%2) rect(px+1,py+1,T-2,T-2,shadeHex(pal[0],8));
    if(type==='stairsup') { for(let k=0;k<4;k++) { rect(px+k*8,py,8,T,shadeHex(pal[0],k*10)); rect(px+k*8,py,1,T,'#4a3020'); } }
    if(n%9===0&&type==='hallwood') rect(px+6+(n%14),py+12,5,2,'#6a4a2e');
  } else if(type==='storyrug') {
    rect(px,py,T,T,pal[(x+y)%3]); rect(px+3,py+3,T-6,T-6,shadeHex(pal[(x+y)%3],18)); ellipse(px+16,py+16,4,4,'#fff1cb');
  } else if(type==='dais') {
    if(libTile(x,y+1)!=='dais') { rect(px,py+T-6,T,6,'#4a1420'); rect(px,py+T-6,T,2,'#c9a23a'); }
    if(n%4===0) rect(px+8+(n%12),py+10,2,2,'#a83a4a');
  } else {
    if(n%5===0) rect(px+6+(n%16),py+8+((n>>>3)%14),2,2,shadeHex(pal[0],-14));
    if(type==='picrug'&&n%3===0) ellipse(px+8+(n%16),py+8+((n>>>4)%16),2,2,['#d96a5a','#5a9ad9','#6ac06a','#c9b3e6'][n%4]);
  }
};

// ---------- Props ----------
function libLamp(cx,y,time,on=true) {   // a green banker's lamp
  rect(cx-1,y-2,2,8,'#c9a23a'); rect(cx-5,y+5,10,2,'#c9a23a');
  polygon([[cx-8,y-2],[cx+8,y-2],[cx+6,y-8],[cx-6,y-8]],OUT); polygon([[cx-7,y-3],[cx+7,y-3],[cx+5,y-7],[cx-5,y-7]],'#2f8a5a');
  if(on) { const f=.18+.06*Math.sin(time*3+cx); gfx.globalAlpha=f; ellipse(cx,y+8,16,7,'#fff1a8'); gfx.globalAlpha=1; rect(cx-5,y-2,10,1,'#fff1a8'); }
}
drawObject=function(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  if(o.kind==='stacksdoor') {   // the STAFF ONLY door in the library room (an ordinary room, so checked first)
    const open=typeof flag==='function'&&STORY.mode==='full'&&(STORY.chapter>7||(STORY.chapter===7&&flag('ch7-page')));
    rect(x+2,y-14,T-4,T+12,OUT); rect(x+4,y-12,T-8,T+9,open?'#1e120c':'#6a4a3a');
    if(open) { for(let k=0;k<4;k++) rect(x+5,y-8+k*8,T-10,2,'#4a3020'); }
    else { rect(x+6,y-10,T-12,T+5,'#7a5a48'); rect(x+T-11,y+4,3,3,'#c9a23a'); }
    rect(x+6,y-20,T-12,8,OUT); rect(x+7,y-19,T-14,6,'#f4f0e6'); label('SHH',cx,y-18,'#8a2a3a',1);
    return;
  }
  if(!libGround(currentMap)) return LE_drawObject_lib(o,time);
  switch(o.kind) {
    case 'bookcase': {
      const below=currentMap.objectAt.get(key(o.x,o.y+1)),top=!(below&&below.kind==='bookcase');
      if(!top) { rect(x,y,T,T,'#2a1a12'); rect(x,y,T,3,'#5a3a24'); rect(x+1,y+3,T-2,T-4,'#3a2418'); libSpines(x+2,y+14,T-3,10,n); return; }
      ellipse(cx,b-1,T/2,4,'#00000040');
      libFace(x,y-2,n); rect(x,b-3,T,3,'#2a1a12');
      return;
    }
    case 'readdoors': {
      rect(x,y-24,w,h+24,OUT); rect(x+2,y-22,w-4,h+21,'#5a2a2a');
      for(const dx of [x+4,cx+2]) { rect(dx,y-18,w/2-6,h+14,'#7a3a30'); rect(dx+3,y-14,w/2-12,10,'#8a4a3a'); rect(dx+3,y+2,w/2-12,10,'#8a4a3a'); }
      rect(cx-1,y-22,2,h+21,OUT);
      rect(cx-7,y-2,14,10,OUT); rect(cx-6,y-1,12,8,'#c9a23a'); rect(cx-3,y+2,6,2,'#8a6a1a');   // the catalog drawer lock
      rect(x+8,y-30,w-16,8,OUT); rect(x+9,y-29,w-18,6,'#e8dcb8'); label('READING ROOM',cx,y-28,'#5a2a2a',1);
      return;
    }
    case 'stackglobe': {
      ellipse(cx,b-3,9,3,'#00000040'); rect(cx-1,y+12,2,16,'#5a3a24'); rect(cx-6,b-5,12,3,'#5a3a24');
      ellipse(cx,y+6,10,10,OUT); ellipse(cx,y+6,9,9,'#3f7aa8'); ellipse(cx-3+Math.round(Math.sin(time*.5)*2),y+4,4,3,'#6ac06a'); ellipse(cx+4,y+9,3,2,'#6ac06a');
      return;
    }
    case 'bookcart': {
      ellipse(cx,b-2,14,3,'#00000040');
      rect(x+2,y+4,T-4,18,OUT); rect(x+3,y+5,T-6,16,'#6a4a2e'); libSpines(x+4,y-6,T-8,10,n); libSpines(x+4,y+6,T-8,7,n+3);
      for(const wx of [x+6,x+T-6]) { ellipse(wx,b-4,3,3,OUT); }
      return;
    }
    case 'lamptable': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+2,y+6,w-4,12,OUT); rect(x+3,y+7,w-6,10,'#6a4a2e'); rect(x+3,y+7,w-6,2,'#8a6440'); rect(x+5,y+18,3,10,OUT); rect(x+w-8,y+18,3,10,OUT);
      for(let k=0;k<o.w;k++) libLamp(x+16+k*T,y+2,time,(n+k)%3!==2||!(STORY.chapter===7&&!flag('ch7-clear')&&Math.floor(time*3+k)%5===0));
      return;
    }
    case 'stacksign': {
      rect(cx-1,y+6,2,22,OUT); rect(x+3,y-6,T-6,14,OUT); rect(x+4,y-5,T-8,12,'#e8dcb8'); label('SHH',cx,y-2,'#8a2a3a',1);
      return;
    }
    case 'ladder': {
      for(const lx of [x+6,x+T-8]) rect(lx,y-22,2,T+18,'#8a6440');
      for(let k=0;k<6;k++) rect(x+6,y-18+k*8,T-12,2,'#a88058');
      ellipse(x+7,b-3,3,3,OUT); ellipse(x+T-7,b-3,3,3,OUT);
      return;
    }
    case 'lowshelf': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+1,y+4,w-2,24,OUT); rect(x+2,y+5,w-4,22,'#d9a86a'); rect(x+3,y+7,w-6,9,'#5a3a24'); rect(x+3,y+17,w-6,9,'#5a3a24');
      libSpines(x+4,y+7,w-8,9,n); libSpines(x+4,y+17,w-8,9,n+1);
      return;
    }
    case 'beanbag': {
      ellipse(cx,b-3,13,4,'#00000040'); ellipse(cx,y+18,13,11,OUT); ellipse(cx,y+18,12,10,'#c96a9a'); ellipse(cx-3,y+14,5,4,'#e88ab8');
      return;
    }
    case 'storychair': {
      ellipse(cx,b-2,12,3,'#00000040');
      rect(x+5,y-12,T-10,26,OUT); rect(x+6,y-11,T-12,24,'#8a5a3a'); rect(x+8,y-9,T-16,10,'#c96a5a');
      rect(x+4,y+10,T-8,8,OUT); rect(x+5,y+11,T-10,6,'#a8744a'); polygon([[x+3,b-4],[x+T-3,b-4],[x+T-6,b-1],[x+6,b-1]],OUT);
      rect(x+T-4,y+12,8,10,OUT); libSpines(x+T-3,y+12,7,9,n);   // the basket of books
      return;
    }
    case 'puppettheater': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+4,y-26,w-8,52,OUT); rect(x+5,y-25,w-10,50,'#c94a3a'); rect(x+10,y-18,w-20,20,'#1e120c');
      rect(x+5,y-25,w-10,5,'#e8c84a'); for(let k=x+6;k<x+w-6;k+=6) rect(k,y-20,3,3,'#e8c84a');
      const bob=Math.round(Math.sin(time*2)*2); ellipse(x+22,y-6+bob,5,5,'#efbc8e'); ellipse(x+w-22,y-6-bob,5,5,'#9fd8ff');
      return;
    }
    case 'lectern': {
      ellipse(cx,b-2,14,3,'#00000040');
      polygon([[cx-12,y+2],[cx+12,y+2],[cx+8,b-2],[cx-8,b-2]],OUT); polygon([[cx-11,y+3],[cx+11,y+3],[cx+7,b-3],[cx-7,b-3]],'#c9a23a');
      rect(cx-16,y-4,32,6,OUT); rect(cx-15,y-3,30,4,'#e8c84a');
      if(typeof flag==='function'&&flag('ch7-clear')) { rect(cx-14,y-10,28,7,OUT); rect(cx-13,y-9,12,5,'#e8dcb8'); rect(cx+1,y-9,12,5,'#e8dcb8'); }
      return;
    }
  }
  return LE_drawObject_lib(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!libGround(map)) return LE_buildMiniBase_lib(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={bkwall:'#3a2418',bkvoid:'#120c10'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(LIB_FLOOR[t]&&LIB_FLOOR[t][0])||'#6a4a2e';
    b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.kind==='bookcase'||o.kind==='readdoors') { b.fillStyle=o.kind==='readdoors'?'#c9a23a':'#5a3a24'; b.fillRect(o.x*2,o.y*2,o.w*2,o.h*2); }
  return c;
};

// ---------- Battle backdrops ----------
// The Stacks (tall bookcases, green lamps, boards) or the Reading Room (an arched window, the red dais).
drawLEBattleBg=function(t) {
  const g=libGround(currentMap),lab=B2.active&&B2.labStacks;
  if(!g&&!lab) return LE_drawLEBattleBg_lib(t);
  const read=g==='readroom'||(lab&&B2.labRead);
  rect(0,0,192,108,read?'#1e1418':'#1e120c');
  if(read) {
    for(let i=0;i<192;i+=24) { rect(i,0,22,66,'#3a2418'); for(let r=0;r<5;r++) { rect(i+1,4+r*12,20,10,'#140c08'); libSpines(i+2,4+r*12,19,10,hash(i,r)); } }
    rect(76,4,40,50,'#140c10'); ellipse(96,18,20,16,'#140c10'); rect(78,10,36,44,'#2a3a6a'); ellipse(96,18,18,14,'#2a3a6a');
    rect(95,4,2,50,'#140c10'); rect(78,30,36,2,'#140c10');
    for(let k=0;k<6;k++) rect(82+((k*17)%30),14+((k*11)%30),1,1,'#fff1cb');
    rect(0,66,192,42,'#8a2a3a'); rect(0,66,192,3,'#c9a23a'); for(let i=72;i<108;i+=6) rect(0,i,192,1,'#7a2232');
  } else {
    for(let i=0;i<192;i+=32) { rect(i,0,30,66,'#3a2418'); rect(i,0,30,3,'#5a3a24'); for(let r=0;r<5;r++) { rect(i+2,5+r*12,26,10,'#140c08'); libSpines(i+3,5+r*12,25,10,hash(i+7,r)); rect(i,15+r*12,30,1,'#6a4a2e'); } }
    rect(0,66,192,42,'#8a6440'); for(let i=70;i<108;i+=6) rect(0,i,192,1,'#6a4a2e'); rect(0,66,192,2,'#a88058');
  }
  for(const lx of [30,162]) { const yy=read?62:60; rect(lx-14,yy+2,28,4,'#5a3a24'); const f=.16+.05*Math.sin(t*3+lx); gfx.globalAlpha=f; ellipse(lx,yy+4,22,8,'#fff1a8'); gfx.globalAlpha=1;
    polygon([[lx-7,yy-2],[lx+7,yy-2],[lx+5,yy-7],[lx-5,yy-7]],'#2f8a5a'); rect(lx-1,yy-2,2,4,'#c9a23a'); }
  // drifting whispers
  for(let k=0;k<5;k++) { const p=(t*.15+k*.2)%1; gfx.globalAlpha=Math.sin(p*Math.PI)*.5; label(k%2?'SHH':'PSST',20+((k*41)%150),56-p*40,'#c9b3e6',1); }
  gfx.globalAlpha=1;
  return true;
};
