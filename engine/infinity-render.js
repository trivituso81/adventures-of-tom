'use strict';
// engine/infinity-render.js — The look of chapter 11 (Part 2 opens): Flight Zero's cabin (ground 'cabin': beige cabin
// wall with oval windows, blue-gray 'cabincarpet') and Terminal Infinity (ground 'inf': 'infwall' plum panels with a gold
// stripe, dusk-sky 'infwindow' with paused towns as glass domes, plum 'infcarpet', cream 'infmarble', the moving
// 'infwalk'). Terminal Infinity is Terminal Zero's big sister: always dusk, the departures board never changes.
// Props: cabinseat, cabinblanket, cabindoor, cabincart, infpodium, inffids, infseats, infplant, infgatesign, boardbench,
// infjet, infbigdoor, infdoor, infrope, infdesk, infcart.
// Also the minimap and the battle backdrops (wraps drawLEBattleBg). Wraps drawOutdoorTile, drawObject and buildMiniBase.
// Story state read here: flags ch11-boo (Rose is out from under the blanket), ch11-tear (the sky is tearing), ch11-closed
// (Long Island's dome has gone amber; C11b). Loaded after engine/terminal-render.js.
const LE_drawOutdoorTile_inf=drawOutdoorTile,LE_drawObject_inf=drawObject,LE_buildMiniBase_inf=buildMiniBase,LE_drawLEBattleBg_inf=drawLEBattleBg;
const INF_GROUNDS=['inf','cabin'];
const infGround=map=>{ const g=map&&map.style&&map.style.ground; return INF_GROUNDS.includes(g)?g:null; };
const infTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'infvoid';
const INF_FLOOR={infcarpet:['#3a2a5a','#38285a','#3c2c5e'],infmarble:['#e6dac0','#e2d6bc','#eadec4'],infwalk:['#3a3050','#362c4c','#3e3454'],
  cabincarpet:['#3c4a6a','#3a4868','#3e4c6c']};
const infFlag=k=>typeof STORY!=='undefined'&&STORY.mode==='full'&&!!flag(k);
const INF_SKY=['#241a50','#2e2062','#4a2a78','#7a3a88','#b0507a','#e07a5a','#f2b05a'];
// Paused towns: little glass domes on the horizon, every one warm and still. Gate 00 shows the two that are moving.
const INF_DOMES=[{cx:5.5,r:44,c:'#7ac08a',c2:'#bfe8c8'},{cx:14.5,r:44,c:'#f09a5a',c2:'#ffd9a8'}];   // Long Island, Los Angeles (tile centres)

function infFace(px,py,n,cabin) {
  if(cabin) {   // the cabin wall: beige panel, a seam, an oval window every third tile
    rect(px,py,T,T,'#d9d1c0'); rect(px,py,T,3,'#b8b0a0'); rect(px,py+T-5,T,5,'#a8a090'); rect(px,py+T-6,T,1,'#4a5a8a');
    return;
  }
  rect(px,py,T,T,'#3a2a50'); rect(px,py,T,4,'#241a38'); rect(px+2,py+6,T-4,T-16,'#46345e');
  rect(px,py+T-9,T,4,'#f2c75a'); rect(px,py+T-5,T,5,'#241a38');
  if(n%5===0) { rect(px+12,py+9,8,10,'#241a38'); rect(px+13,py+10,6,8,'#ffd9a0'); }   // a warm sconce
}
function infWindowSky(px,py,x,time,star) {
  const bh=Math.ceil((T-10)/INF_SKY.length);
  for(let k=0;k<INF_SKY.length;k++) rect(px,py+k*bh,T,bh+1,INF_SKY[k]);
  if(star&&hash(x,3)%2===0) rect(px+(hash(x,5)%26)+2,py+3+(hash(x,9)%8),1,1,'#fff1cb');
  if(star&&hash(x,13)%3===0) rect(px+(hash(x,17)%26)+2,py+8+(hash(x,19)%6),1,1,'#fff1cb');
}
function infDome(px,py,cx,r,maxH,col,col2) {   // a glass dome sitting on the horizon strip (py+T-10)
  const base=py+T-10;
  for(let i=0;i<T;i+=2) { const dx=px+i-cx; if(Math.abs(dx)>=r) continue; const hh=Math.max(2,Math.sqrt(1-(dx/r)*(dx/r))*maxH);
    rect(px+i,base-hh,2,hh,col); rect(px+i,base-hh,2,2,col2); if(Math.abs(dx)<r*.35) rect(px+i,base-hh+3,2,1,'#ffffff55'); }
}

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=infGround(currentMap);
  if(!g) return LE_drawOutdoorTile_inf(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y),cabin=g==='cabin';
  if(type==='infvoid'||type==='cabinvoid') { rect(px,py,T,T,'#0c0a16'); return; }
  if(type==='infwall'||type==='cabinwall') {
    if(INF_FLOOR[infTile(x,y+1)]) {
      infFace(px,py,n,cabin);
      if(cabin&&x%3===1) {   // oval window
        rect(px+4,py+5,T-8,T-17,'#2a2a38'); ellipse(px+T/2,py+T/2-5,9,6,'#2a2a38');
        const tear=infFlag('ch11-tear'),sky=tear?((Math.floor(time*10)+x)%3?'#c8f0ff':'#ff7ad8'):'#7ab0e0';
        ellipse(px+T/2,py+T/2-5,7.5,4.8,sky); if(!tear) { rect(px+9,py+T/2-7,9,2,'#f4f8ff'); rect(px+14,py+T/2-5,8,2,'#e4ecf4'); }
        else for(let k=0;k<5;k++) rect(px+7+((k*7+Math.floor(time*14))%18),py+T/2-8+k*2,5+k%3,1,'#14102c');
      }
      return;
    }
    rect(px,py,T,T,'#14102a'); rect(px,py+T-3,T,3,'#2a2244'); return;
  }
  if(type==='infwindow') {
    infWindowSky(px,py,x,time,true);
    rect(px,py+T-10,T,10,'#241a38'); rect(px,py+T-6,T,1,'#f2c75a');
    // paused towns on the far horizon: one every few tiles; Gate 00 has the two big ones that are still moving
    const big=currentMap.id==='gate00';
    if(big) for(const d of INF_DOMES) {
      const closed=d.cx<8&&infFlag('ch11-closed'); infDome(px,py,d.cx*T,d.r,T-13,closed?'#e0903a':d.c,closed?'#ffcf7a':d.c2);
    } else if(x%7===2) infDome(px,py,px+16,14,9,['#c09a7a','#8aa0c0','#c08aa0','#9ac09a'][Math.floor(x/7)%4],'#fff1cb');
    rect(px+T-2,py,2,T,'#46345e'); rect(px,py,T,2,'#46345e'); return;
  }
  const pal=INF_FLOOR[type]||INF_FLOOR.infcarpet;
  rect(px,py,T,T,pal[n%3]);
  if(type==='infcarpet') { if((x+y)%2===0) { rect(px+14,py+10,4,4,'#4e3a78'); rect(px+13,py+11,6,2,'#4e3a78'); rect(px+15,py+9,2,6,'#4e3a78'); } rect(px,py+T-1,T,1,'#2c1f48'); if((x+y)%4===0) rect(px+15,py+11,2,2,'#f2c75a'); }
  else if(type==='infmarble') { for(let k=0;k<3;k++) { const m=hash(x*5+k,y*3); rect(px+m%28,py+(m>>>5)%28,3,1,['#c9a27a','#a89ab8','#d4b08a'][k]); } rect(px,py,T,1,'#d8ccb0'); rect(px,py,1,T,'#d8ccb0'); }
  else if(type==='infwalk') {
    rect(px,py,T,3,'#241a38'); rect(px,py+T-3,T,3,'#241a38');
    const off=Math.floor(time*10)%8; for(let k=-8;k<T;k+=8) { rect(px+k+off,py+6,2,T-12,'#f2c75a50'); rect(px+k+off+2,py+8,2,T-16,'#f2c75a28'); }
  }
  else if(type==='cabincarpet') { if(n%3===0) rect(px+4+(n%20),py+6+((n>>>3)%18),3,2,'#4a5a82'); if(y%2===0) rect(px,py,T,1,'#344260'); }
};

// ---------- Props ----------
drawObject=function(o,time) {
  if(!infGround(currentMap)) return LE_drawObject_inf(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'cabinseat': {   // a lie-flat pod: headrest, cushion, little screen
      ellipse(cx,b-2,12,3,'#00000040'); rect(x+3,y-10,T-6,26,OUT); rect(x+4,y-9,T-8,24,'#5a6a8a'); rect(x+7,y-6,T-14,8,'#8a9ab8');
      rect(x+3,y+12,T-6,10,OUT); rect(x+4,y+13,T-8,8,'#7a8aa8'); rect(x+3,y+2,4,14,'#4a5a7a'); rect(x+T-7,y+2,4,14,'#4a5a7a');
      rect(x+10,y-5,12,6,'#14181f'); rect(x+11,y-4,10,4,'#3a6a9a'); rect(x+15,y-6,2,1,'#f2c75a'); return;
    }
    case 'cabinblanket': {   // a blanket lump with two little feet. Rose is under it until she shouts BOO.
      if(infFlag('ch11-boo')) { rect(x+3,y+10,T-6,12,OUT); rect(x+4,y+11,T-8,10,'#7a8aa8'); return; }
      const sway=Math.sin(time*7)*1.2;
      ellipse(cx,b-3,13,4,'#00000040'); ellipse(cx+sway*.3,y+12,12,10,OUT); ellipse(cx+sway*.3,y+12,11,9,'#e86a8a'); ellipse(cx+sway*.3-2,y+8,6,4,'#f08aa8');
      for(let k=0;k<4;k++) rect(x+6+k*6,y+8+k%2*4,3,1,'#c04a6a');
      rect(x+8,b-6,4,4,'#ffd8c0'); rect(x+T-12,b-6,4,4,'#ffd8c0'); return;
    }
    case 'cabindoor': {   // the cabin door at the back, jet bridge light beyond
      rect(x,y-22,T,T+20,OUT); rect(x+2,y-20,T-4,T+17,'#b8b0a0'); rect(x+5,y-16,T-10,T+9,'#f2e6b0'); rect(x+T/2-1,y-16,2,T+9,'#d8c880'); label('EXIT',x+T/2,y-23,'#c04a3a',1); return;
    }
    case 'cabincart': {
      ellipse(cx,b-2,13,3,'#00000040'); rect(x+3,y+2,T-6,22,OUT); rect(x+4,y+3,T-8,20,'#b8c0cc'); rect(x+4,y+3,T-8,4,'#e8eef4');
      rect(x+8,y-4,6,8,'#e85a4a'); rect(x+16,y-2,6,6,'#f2c75a'); rect(x+10,y+12,12,6,'#8a94a4'); ellipse(x+8,b-2,3,3,OUT); ellipse(x+T-8,b-2,3,3,OUT); return;
    }
    case 'infpodium': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x+4,y+2,w-8,24,OUT); rect(x+5,y+3,w-10,22,'#46345e'); rect(x+5,y+3,w-10,3,'#f2c75a');
      rect(cx-14,y-14,28,16,OUT); rect(cx-13,y-13,26,14,'#14102a'); label('GATE 00',cx,y-11,'#f2c75a',1); label('ON TIME',cx,y-5,'#6ac06a',1); return;
    }
    case 'inffids': {   // a departures board that never changes: ON TIME, ON TIME, ON TIME, ON TIME
      rect(cx-1,y+12,2,18,OUT); rect(x,y-20,w,34,OUT); rect(x+2,y-18,w-4,30,'#14102a');
      for(let r=0;r<4;r++) for(let k=0;k<Math.floor((w-10)/9);k++) { const lit=(Math.floor(time*2)+r*3+k)%23===0;
        rect(x+5+k*9,y-15+r*7,7,5,lit?'#fff1cb':(r===0?'#f2c75a':'#d8c8a0')); rect(x+5+k*9,y-13+r*7,7,1,'#14102a'); }
      return;
    }
    case 'infseats': {
      ellipse(cx,b-2,w/2,3,'#00000030'); rect(x+2,y+16,w-4,4,'#2a2244');
      for(let k=0;k<o.w;k++) { const sx=x+k*T+3; rect(sx,y-4,T-6,14,OUT); rect(sx+1,y-3,T-8,12,'#6a4a8a'); rect(sx,y+8,T-6,8,OUT); rect(sx+1,y+9,T-8,6,'#8a6aae'); }
      for(let k=0;k<=o.w;k++) rect(x+k*T-1,y+4,3,10,'#f2c75a'); return;
    }
    case 'boardbench': {   // Boarding Gate bench: gold-trimmed seats with a little sign. It swaps who is out front.
      ellipse(cx,b-2,w/2,3,'#00000030'); rect(x+2,y+16,w-4,4,'#2a2244');
      for(let k=0;k<o.w;k++) { const sx=x+k*T+3; rect(sx,y-4,T-6,14,OUT); rect(sx+1,y-3,T-8,12,'#d8a43a'); rect(sx,y+8,T-6,8,OUT); rect(sx+1,y+9,T-8,6,'#f2c75a'); }
      for(let k=0;k<=o.w;k++) rect(x+k*T-1,y+4,3,10,'#8a6a2a');
      rect(cx-9,y-18,18,10,OUT); rect(cx-8,y-17,16,8,'#14102a'); label('SWAP',cx,y-15,'#f2c75a',1);
      const gl=.5+.5*Math.sin(time*3); gfx.globalAlpha=.25+.2*gl; rect(x,y-5,w,22,'#ffd968'); gfx.globalAlpha=1; return;
    }
    case 'infplant': {
      ellipse(cx,b-3,9,3,'#00000040'); rect(cx-6,b-11,12,9,OUT); rect(cx-5,b-10,10,7,'#d8a43a');
      for(let k=0;k<6;k++) { const a=-2.8+k*.55; ellipse(cx+Math.cos(a)*7,b-15+Math.sin(a)*7,5,3,k%2?'#5aa06a':'#3f8a5a'); } ellipse(cx,b-20,4,4,'#6ab07a'); return;
    }
    case 'infgatesign': {   // a gate sign over a paused town: GATE 7, CHICAGO, PAUSED
      rect(x,y-20,w,30,OUT); rect(x+2,y-18,w-4,26,'#14102a'); rect(x+2,y-18,w-4,3,'#f2c75a');
      const gate=(o.name.match(/\d+/)||[''])[0]; label('GATE '+gate,x+w/2,y-12,'#f2c75a',1);
      label(String(o.city||'').toUpperCase(),x+w/2,y-5,'#fff1cb',1); label('PAUSED',x+w/2,y+2,Math.floor(time*2)%2?'#ffd968':'#e8a83a',1);
      rect(x+w/2-1,y+10,2,10,OUT); return;
    }
    case 'infjet': {
      rect(x,y-24,w,h+22,OUT); rect(x+2,y-22,w-4,h+19,'#8a7aa8'); rect(x+6,y-16,w-12,14,infFlag('ch11-arrive')&&!infFlag('ch11-met')?'#f2e6b0':'#241a48');
      rect(x+4,y+4,w-8,4,'#4a3a6a'); label('JET BRIDGE',cx,y-22,'#14102a',1); return;
    }
    case 'infbigdoor': {   // GATE INFINITY: the big door at the far end of the concourse
      rect(x,y-22,w,h+22,OUT); rect(x+2,y-20,w-4,h+19,'#3a2a50');
      rect(x+6,y-14,w-12,h+10,'#241a38'); rect(cx-1,y-14,2,h+10,'#f2c75a');
      const gl=.5+.5*Math.sin(time*2); ellipse(cx,y+h/2-6,12,12,'#f2c75a'); ellipse(cx,y+h/2-6,10,10,'#14102a');
      label('INF',cx,y+h/2-9,'#f2c75a',1); gfx.globalAlpha=.15+.12*gl; rect(x+6,y-14,w-12,h+10,'#ffd968'); gfx.globalAlpha=1;
      label('GATE INFINITY',cx,y-23,'#f2c75a',1); return;
    }
    case 'infdoor': {   // a smaller door with a sign (Lost and Found)
      rect(x,y-18,w,h+16,OUT); rect(x+2,y-16,w-4,h+13,'#6a5a48'); rect(x+5,y-12,w-10,h+4,'#8a7a60'); rect(cx-1,y-12,2,h+4,'#4a3a2a');
      rect(x+6,y-24,w-12,8,OUT); rect(x+7,y-23,w-14,6,'#f4f0e6'); label('L&F',cx,y-22,'#14102a',1); return;
    }
    case 'infrope': {
      rect(x+4,y+4,3,T-8,OUT); rect(x+T-7,y+4,3,T-8,OUT); ellipse(x+5,y+3,4,3,'#f2c75a'); ellipse(x+T-6,y+3,4,3,'#f2c75a');
      rect(x+6,y+10,T-12,3,'#c0443a'); rect(x+6,y+11,T-12,1,'#e8806a'); return;
    }
    case 'infdesk': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x,y+2,w,24,OUT); rect(x+1,y+3,w-2,22,'#46345e'); rect(x+1,y+3,w-2,4,'#f2c75a');
      rect(x+8,y-14,24,14,OUT); rect(x+9,y-13,22,12,'#14102a'); label('GATE AGENT',x+20,y-10,'#f2c75a',1); return;
    }
    case 'infcart': {
      ellipse(cx,b-2,10,3,'#00000040'); rect(x+4,y+10,T-8,12,OUT); rect(x+5,y+11,T-10,10,'#8a7aa8');
      rect(x+4,y-6,2,18,'#4a3a6a'); rect(x+4,y-8,10,2,'#4a3a6a'); ellipse(x+8,b-4,3,3,OUT); ellipse(x+T-8,b-4,3,3,OUT); rect(x+8,y+2,14,10,'#a8884a'); return;
    }
  }
  return LE_drawObject_inf(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!infGround(map)) return LE_buildMiniBase_inf(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={infwall:'#3a2a50',cabinwall:'#d9d1c0',infvoid:'#0c0a16',cabinvoid:'#0c0a16',infwindow:'#7a3a88'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(INF_FLOOR[t]&&INF_FLOOR[t][0])||'#6a6a80';
    b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.kind==='boardbench'||o.kind==='infbigdoor') { b.fillStyle='#f2c75a'; b.fillRect(o.x*2,o.y*2,o.w*2,o.h*2); }
  return c;
};

// ---------- Battle backdrops ----------
// Terminal Infinity: a long dusk window with paused towns, glass domes, the plum carpet and gold stripe. Flight Zero's
// cabin: the beige wall, oval windows, the blue-gray floor.
drawLEBattleBg=function(t) {
  const g=infGround(currentMap);
  if(!g) return LE_drawLEBattleBg_inf(t);
  if(g==='cabin') {
    rect(0,0,192,108,'#d9d1c0'); rect(0,0,192,6,'#b8b0a0');
    for(let k=0;k<4;k++) { const wx=14+k*46; rect(wx,14,30,22,'#2a2a38'); rect(wx+2,16,26,18,'#7ab0e0'); rect(wx+4,22,12,3,'#f4f8ff'); }
    rect(0,48,192,6,'#a8a090'); rect(0,54,192,54,'#3c4a6a');
    for(let k=0;k<5;k++) { const sx=8+k*38; rect(sx,40,26,22,'#5a6a8a'); rect(sx+3,43,20,10,'#8a9ab8'); }
    for(let k=0;k<30;k++) { const n=hash(k,41); rect(n%190,58+(n>>>8)%48,3,2,'#4a5a82'); }
    return true;
  }
  const bh=Math.ceil(46/INF_SKY.length);
  for(let k=0;k<INF_SKY.length;k++) rect(0,4+k*bh,192,bh+1,INF_SKY[k]);
  for(let k=0;k<26;k++) { const n=hash(k,13); rect(n%192,6+(n>>>8)%22,1,1,'#fff1cb'); }
  const tones=['#c09a7a','#8aa0c0','#c08aa0','#9ac09a'];
  for(let k=0;k<5;k++) { const cx=14+k*40+(hash(k,2)%12),r=10+hash(k,3)%8; for(let i=-r;i<=r;i++) { const hh=Math.sqrt(r*r-i*i)*.8; rect(cx+i,50-hh,1,hh,tones[k%4]); rect(cx+i,50-hh,1,1,'#fff1cb'); } }
  rect(0,46,192,12,'#241a38'); rect(0,56,192,2,'#f2c75a');
  for(let i=0;i<192;i+=32) rect(i,4,2,54,'#46345e'); rect(0,0,192,4,'#241a38');
  rect(0,58,192,8,'#3a2a50'); for(let k=0;k<8;k++) { const sx=6+k*24; rect(sx,56,18,8,'#d8a43a'); rect(sx,54,18,3,'#f2c75a'); }
  rect(0,66,192,42,'#3a2a5a'); rect(0,66,192,2,'#f2c75a');
  for(let k=0;k<40;k++) { const n=hash(k,31); rect(n%190,68+(n>>>8)%38,3,2,['#4e3a78','#f2c75a40','#6a4a9a','#2c1f48'][k%4]); }
  return true;
};
