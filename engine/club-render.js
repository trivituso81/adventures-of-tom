'use strict';
// engine/club-render.js — The look of chapter 9's Moon Club (ground 'club': navy and gold panelled 'clubwall' that
// shows its face when there is floor below it, dark 'clubvoid', 'coatrug', 'cardrug', black and white 'marble',
// 'ballwood' parquet, the lit 'dancefloor', 'clubstairs' down to the observatory) and the Dome (ground 'dome':
// 'domefloor' under the stars, the 'bandstand'). Props: clubdoors, mirrorstand, clubplaque, ropepost, clubpalm,
// coatcounter, coatrack, clubchair, cardtable, clubbar, jukebox, clubpiano, mirrorframe, bandchairs, domescope, and the
// little silver clubdoor in Luna's observatory. The moonbeam (clubBeam) is traced here and drawn by data/scenes.js.
// Also the minimap and the battle backdrops (wraps drawLEBattleBg). Wraps drawOutdoorTile, drawObject and
// buildMiniBase. Loaded after engine/barn-render.js.
const LE_drawOutdoorTile_club=drawOutdoorTile,LE_drawObject_club=drawObject,LE_buildMiniBase_club=buildMiniBase,LE_drawLEBattleBg_club=drawLEBattleBg;
const CLUB_GROUNDS=['club','dome'];
const clubGround=map=>{ const g=map&&map.style&&map.style.ground; return CLUB_GROUNDS.includes(g)?g:null; };
const clubTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'clubvoid';
const CLUB_FLOOR={coatrug:['#6a2438','#662034','#6e283c'],cardrug:['#2f5a46','#2b5642','#335e4a'],marble:['#e8e4dc','#2a2834','#e8e4dc'],
  ballwood:['#9a6a3a','#966636','#9e6e3e'],dancefloor:['#3a3050','#4a3a6a','#3a3050'],clubstairs:['#7a6a8a','#766686','#7e6e8e'],
  domefloor:['#1e2442','#1c2240','#202646'],bandstand:['#6a2438','#662034','#6e283c']};
const clubMoonBack=()=>typeof flag==='function'&&STORY.mode==='full'&&(STORY.chapter>9||!!flag('ch9-clear'));

function clubFace(px,py,n,dome) {   // navy panelling, a gold rail, a little wall sconce now and then
  rect(px,py,T,T,dome?'#141a34':'#24284a'); rect(px,py,T,4,dome?'#0c1024':'#14182e');
  rect(px+3,py+7,T-6,T-14,dome?'#1a2242':'#2e3460'); rect(px+3,py+7,T-6,1,'#3e4678');
  rect(px,py+T-6,T,2,'#c9a23a');
  if(n%4===0&&!dome) { rect(px+14,py+9,4,6,'#c9a23a'); ellipse(px+16,py+8,3,3,'#fff1a8'); }
}

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=clubGround(currentMap);
  if(!g) return LE_drawOutdoorTile_club(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='clubvoid') { rect(px,py,T,T,'#0c0c16'); return; }
  if(type==='clubwall') {
    if(CLUB_FLOOR[clubTile(x,y+1)]) { clubFace(px,py,n,g==='dome'); return; }
    rect(px,py,T,T,g==='dome'?'#0c1024':'#161a30'); rect(px,py+T-3,T,3,'#2a2e50');
    return;
  }
  const pal=CLUB_FLOOR[type]||CLUB_FLOOR.marble;
  if(type==='marble') { const d=(x+y)%2; rect(px,py,T,T,d?'#2a2834':'#e8e4dc'); rect(px+2,py+2,8,1,d?'#3a3846':'#ffffff'); if(n%7===0) rect(px+6+(n%14),py+10,6,1,d?'#4a4858':'#cfc8bc'); return; }
  if(type==='clubstairs') { for(let k=0;k<4;k++) { rect(px+k*8,py,8,T,shadeHex(pal[0],k*10)); rect(px+k*8,py,1,T,'#3a2e4a'); } return; }
  rect(px,py,T,T,pal[n%3]);
  if(type==='ballwood') { for(let k=0;k<T;k+=8) rect(px,py+k,T,1,'#7a4a24'); rect(px+((x+y)%2?8:20),py,1,T,'#7a4a24'); }
  else if(type==='dancefloor') {
    const lit=(Math.floor(time*2)+x*3+y*5)%7<2&&STORY.mode==='full'&&(STORY.chapter>9||!!flag('ch9-clear'));
    rect(px+1,py+1,T-2,T-2,lit?['#c96aa8','#6ab0e8','#e8c84a'][(x+y)%3]:pal[(x+y)%2?1:0]);
    rect(px+1,py+1,T-2,2,'#ffffff20');
  }
  else if(type==='domefloor') { if(n%5===0) rect(px+(n%28),py+((n>>>5)%28),1,1,n%3?'#fff1cb':'#9fd8ff'); }
  else if(type==='bandstand') {
    if(clubTile(x,y+1)!=='bandstand') { rect(px,py+T-6,T,6,'#3a1020'); rect(px,py+T-6,T,2,'#c9a23a'); }
    if(n%4===0) rect(px+8+(n%12),py+10,2,2,'#8a3a50');
  }
  else if(type==='coatrug'||type==='cardrug') { if(n%5===0) ellipse(px+8+(n%16),py+8+((n>>>4)%16),2,2,'#c9a23a50'); }
};

// ---------- The moonbeam ----------
// From the round window at the east end of the hall, west along row 11, bouncing off any mirror stand with its mirror
// back. '/' (rot 0) and '\' (rot 1). Ends at a wall, any other object, or the Dome doors (hit).
const clubMirrorBack=M=>typeof STORY!=='undefined'&&STORY.mode==='full'&&(STORY.chapter>9||flag(M.fight)===true);
const clubRot=M=>STORY.chapter>9&&flag('ch9-rot'+M.m)==null?1:(flag('ch9-rot'+M.m)===1?1:0);
function clubBeam(map=worlds.moonclub) {
  let x=CLUB_BEAM.x,y=CLUB_BEAM.y,dx=-1,dy=0;
  const pts=[[x+1,y+.5]];
  for(let k=0;k<90;k++) {
    if(!within(map,x,y)) { pts.push([x+.5-dx*.5,y+.5-dy*.5]); return {pts,hit:false}; }
    const o=map.objectAt.get(key(x,y));
    if(!o&&map.solid[y*map.w+x]) { pts.push([x+.5-dx*.5,y+.5-dy*.5]); return {pts,hit:false}; }
    if(o) {
      if(o.kind==='clubdoors') { pts.push([x+.5,y+.9]); return {pts,hit:true}; }
      const M=o.kind==='mirrorstand'&&CLUB_MIRRORS.find(m=>m.m===o.mirror);
      if(!M||!clubMirrorBack(M)) { pts.push([x+.5-dx*.5,y+.5-dy*.5]); return {pts,hit:false}; }
      pts.push([x+.5,y+.5]);
      if(clubRot(M)) { const t=dx; dx=dy; dy=t; } else { const t=dx; dx=-dy; dy=-t; }
    }
    if(map.tiles[y][x]==='marble'&&y===1&&(x===14||x===15)&&!o&&dy<0) { pts.push([x+.5,y+.5]); return {pts,hit:true}; }
    x+=dx; y+=dy;
  }
  return {pts,hit:false};
}

// ---------- Props ----------
function clubPalm(cx,b,time) {
  ellipse(cx,b-3,10,3,'#00000040'); rect(cx-6,b-10,12,8,OUT); rect(cx-5,b-9,10,6,'#c9a23a');
  for(let k=0;k<5;k++) { const a=-2.6+k*.55+Math.sin(time+k)*.05; polygon([[cx,b-12],[cx+Math.cos(a)*16,b-12+Math.sin(a)*16],[cx+Math.cos(a+.25)*12,b-12+Math.sin(a+.25)*12]],k%2?'#3f8a5a':'#2f6a4a'); }
}
drawObject=function(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  if(o.kind==='clubdoor') {   // the little silver door in Luna's observatory (an ordinary room, so checked first)
    const open=typeof flag==='function'&&STORY.mode==='full'&&(STORY.chapter>9||(STORY.chapter===9&&flag('ch9-luna')));
    rect(x+2,y-14,T-4,T+12,OUT); rect(x+4,y-12,T-8,T+9,open?'#141830':'#a8b0c8');
    if(open) { for(let k=0;k<4;k++) rect(x+5,y-8+k*8,T-10,2,'#3a3e60'); }
    else { rect(x+6,y-10,T-12,T+5,'#c9d0e0'); rect(x+T-11,y+4,3,3,'#c9a23a'); }
    ellipse(cx,y-17,6,6,OUT); ellipse(cx,y-17,5,5,'#f0d27a'); ellipse(cx+2,y-18,3,4,open?'#a8b0c8':'#c9a23a');
    return;
  }
  if(!clubGround(currentMap)) return LE_drawObject_club(o,time);
  switch(o.kind) {
    case 'clubdoors': {
      const lit=typeof clubBeam==='function'&&clubBeam().hit;
      rect(x,y-24,w,h+24,OUT); rect(x+2,y-22,w-4,h+21,'#8a90a8');
      for(const dx of [x+4,cx+2]) { rect(dx,y-18,w/2-6,h+14,'#b8c0d4'); rect(dx+3,y-14,w/2-12,10,'#d8dee8'); rect(dx+3,y+2,w/2-12,10,'#d8dee8'); }
      rect(cx-1,y-22,2,h+21,OUT);
      ellipse(cx,y+2,9,9,OUT); ellipse(cx,y+2,8,8,lit?'#fff8d8':'#3a3e60'); if(lit) { gfx.globalAlpha=.4+.2*Math.sin(time*5); ellipse(cx,y+2,16,16,'#fff1a8'); gfx.globalAlpha=1; }
      rect(x+10,y-30,w-20,8,OUT); rect(x+11,y-29,w-22,6,'#24284a'); label('THE DOME',cx,y-28,'#f0d27a',1);
      return;
    }
    case 'mirrorstand': {
      const M=CLUB_MIRRORS.find(m=>m.m===o.mirror),back=M&&clubMirrorBack(M);
      ellipse(cx,b-3,10,3,'#00000040'); rect(cx-6,b-6,12,4,OUT); rect(cx-5,b-5,10,2,'#c9a23a'); rect(cx-1,y+8,2,h-12,'#c9a23a');
      if(!back) { ellipse(cx,y+6,8,8,OUT); ellipse(cx,y+6,7,7,'#2a2e50'); label('?',cx,y+3,'#c9a23a',1); return; }
      const r=clubRot(M);
      gfx.save(); gfx.translate(cx,y+8); gfx.rotate(r?Math.PI/4:-Math.PI/4);
      rect(-13,-3,26,6,OUT); rect(-12,-2,24,4,'#dfe6f2'); rect(-12,-2,24,1,'#ffffff'); gfx.restore();
      return;
    }
    case 'clubplaque': rect(cx-1,y+8,2,20,OUT); rect(x+2,y-4,T-4,14,OUT); rect(x+3,y-3,T-6,12,'#c9a23a'); ellipse(cx,y+3,3,3,'#fff1cb'); return;
    case 'ropepost': {
      ellipse(cx,b-3,7,2,'#00000040'); rect(cx-5,b-5,10,3,OUT); rect(cx-1,y+4,3,h-8,'#c9a23a'); ellipse(cx,y+4,4,4,'#f0d27a');
      const dir=o.y===9?1:-1; rect(cx+2,y+10,4,3,'#a8203a'); return;
    }
    case 'clubpalm': clubPalm(cx,b,time); return;
    case 'coatcounter': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x,y+4,w,22,OUT); rect(x+1,y+5,w-2,20,'#6a3a24'); rect(x+1,y+5,w-2,4,'#c9a23a');
      ellipse(x+12,y+3,4,3,'#c9a23a'); rect(x+w-24,y,14,6,'#f4f0e6'); return;
    }
    case 'coatrack': {
      rect(x+2,y-14,2,T+10,'#c9a23a'); rect(x+w-4,y-14,2,T+10,'#c9a23a'); rect(x+2,y-14,w-4,2,'#f0d27a');
      for(let k=0;k<o.w*2;k++) { const hx=x+8+k*14,sw=Math.round(Math.sin(time*2+k)*1.5);
        rect(hx+sw,y-12,1,3,'#cfd2d8'); polygon([[hx+sw,y-9],[hx+sw-6,y-4],[hx+sw+6,y-4]],'#cfd2d8'); polygon([[hx+sw,y-8],[hx+sw-4,y-5],[hx+sw+4,y-5]],'#24284a'); }
      return;
    }
    case 'clubchair': ellipse(cx,b-2,10,3,'#00000040'); rect(x+6,y-6,T-12,20,OUT); rect(x+7,y-5,T-14,18,'#6a3a8a'); rect(x+5,y+12,T-10,8,OUT); rect(x+6,y+13,T-12,6,'#8a5aaa'); return;
    case 'cardtable': {
      ellipse(cx,b-2,w/2,5,'#00000040'); ellipse(cx,y+12,w/2-2,10,OUT); ellipse(cx,y+12,w/2-3,9,'#2f6a4a'); ellipse(cx,y+12,w/2-6,6,'#3f7a5a');
      for(let k=0;k<4;k++) rect(cx-14+k*7,y+9+(k%2)*2,5,7,'#f4f0e6'); rect(cx-1,y+21,3,8,OUT); return;
    }
    case 'clubbar': {
      rect(x,y-18,w,12,'#3a2418'); for(let k=0;k<5;k++) rect(x+6+k*18,y-16,4,9,['#6a2438','#3f8a5a','#c9a23a','#2f4a8a','#6a2438'][k]);
      rect(x,y+2,w,24,OUT); rect(x+1,y+3,w-2,22,'#4a2a1a'); rect(x+1,y+3,w-2,3,'#c9a23a'); return;
    }
    case 'jukebox': {
      ellipse(cx,b-2,12,3,'#00000040'); rect(x+3,y-14,T-6,T+10,OUT); ellipse(cx,y-12,13,8,OUT);
      const hue=['#e86aa8','#6ab0e8','#e8c84a','#6ac06a'][Math.floor(time*2)%4];
      rect(x+4,y-12,T-8,T+7,'#8a3a50'); ellipse(cx,y-12,12,7,hue); rect(x+7,y-2,T-14,10,'#1e1a2e'); for(let k=0;k<3;k++) rect(x+8,y+k*3-1,T-16,1,'#c9a23a');
      rect(x+6,y+12,T-12,6,hue); return;
    }
    case 'clubpiano': {
      ellipse(cx,b-2,w/2,4,'#00000040'); rect(x+2,y-10,w-4,30,OUT); rect(x+3,y-9,w-6,28,'#f4f0e6'); rect(x+5,y+6,w-10,6,'#ffffff');
      for(let k=x+6;k<x+w-6;k+=5) rect(k,y+6,2,4,'#2a2834'); rect(x+10,y-7,w-20,10,'#e8e0cc'); return;
    }
    case 'mirrorframe': {
      rect(x,y-22,w,h+18,OUT); rect(x+2,y-20,w-4,h+14,'#c9a23a'); rect(x+6,y-16,w-12,h+6,flag('ch9-ball')?'#24284a':'#3a3e60');
      if(!flag('ch9-ball')) { gfx.globalAlpha=.4; rect(x+8,y-14,6,h,'#dfe6f2'); gfx.globalAlpha=1; } return;
    }
    case 'bandchairs': {
      for(let k=0;k<o.w*2;k++) { const bx=x+6+k*14; rect(bx,y+4,10,12,OUT); rect(bx+1,y+5,8,10,'#6a3a24'); rect(bx+3,y-8,2,12,'#8a8a98'); rect(bx-1,y-10,10,4,'#dfe6f2'); }
      return;
    }
    case 'domescope': ellipse(cx,b-2,8,3,'#00000040'); rect(cx-1,y+10,2,18,OUT); polygon([[cx-4,y+12],[cx+10,y-10],[cx+14,y-6],[cx,y+16]],'#c9a23a'); return;
  }
  return LE_drawObject_club(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!clubGround(map)) return LE_buildMiniBase_club(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={clubwall:'#24284a',clubvoid:'#0c0c16',marble:'#cfc8bc'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(CLUB_FLOOR[t]&&CLUB_FLOOR[t][0])||'#6a6a80';
    b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.kind==='clubdoors'||o.kind==='mirrorstand') { b.fillStyle=o.kind==='clubdoors'?'#f0d27a':'#dfe6f2'; b.fillRect(o.x*2,o.y*2,o.w*2,o.h*2); }
  return c;
};

// ---------- Battle backdrops ----------
// The Moon Club: navy panels, gold sconces, a velvet rope, parquet. The Dome: a glass dome full of stars, the bandstand,
// light spots off the Mirrorball (and the moon, once she lets it go).
drawLEBattleBg=function(t) {
  const g=clubGround(currentMap),lab=B2.active&&B2.labClub;
  if(!g&&!lab) return LE_drawLEBattleBg_club(t);
  const dome=g==='dome'||(lab&&B2.labDome);
  if(dome) {
    rect(0,0,192,108,'#0c1024'); ellipse(96,70,120,90,'#141a38');
    for(let k=1;k<6;k++) { gfx.strokeStyle='#2a3260'; gfx.lineWidth=1; gfx.beginPath(); gfx.ellipse(96,70,k*22,k*16,0,Math.PI,0); gfx.stroke(); }
    for(let k=0;k<30;k++) { const n=hash(k,9); rect(n%192,(n>>>8)%60,1,1,(k+Math.floor(t*2))%9?'#fff1cb':'#9fd8ff'); }
    if(clubMoonBack()) { ellipse(150,18,10,10,'#fff8d8'); ellipse(147,16,3,3,'#e8e0c0'); }
    rect(0,66,192,42,'#6a2438'); rect(0,66,192,3,'#c9a23a'); for(let i=72;i<108;i+=6) rect(0,i,192,1,'#5a1c2e');
    for(let k=0;k<10;k++) { const a=t*.8+k*.63; gfx.globalAlpha=.35; ellipse(96+Math.cos(a)*80,50+Math.sin(a*1.3)*30,3,2,'#dfe6f2'); } gfx.globalAlpha=1;
    return true;
  }
  rect(0,0,192,108,'#24284a');
  for(let i=0;i<192;i+=24) { rect(i+3,6,18,52,'#2e3460'); rect(i+3,6,18,1,'#3e4678'); }
  rect(0,58,192,3,'#c9a23a');
  for(const sx of [36,96,156]) { rect(sx-2,20,4,8,'#c9a23a'); const f=.2+.05*Math.sin(t*3+sx); gfx.globalAlpha=f; ellipse(sx,22,14,10,'#fff1a8'); gfx.globalAlpha=1; ellipse(sx,19,3,3,'#fff1a8'); }
  for(const px of [20,172]) { rect(px-2,40,4,26,'#c9a23a'); ellipse(px,40,4,4,'#f0d27a'); }
  gfx.strokeStyle='#a8203a'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(22,44); gfx.quadraticCurveTo(96,62,170,44); gfx.stroke();
  rect(0,66,192,42,'#9a6a3a'); for(let i=70;i<108;i+=6) rect(0,i,192,1,'#7a4a24'); rect(0,66,192,2,'#c9a23a');
  return true;
};
