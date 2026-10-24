'use strict';
// engine/la-render.js — The Los Angeles look: sidewalks, asphalt, dry hills, tar, LA buildings and props.
// Wraps the town renderer: anything not LA falls through to the original functions in engine/town-render.js.

const LE_drawOutdoorTile=drawOutdoorTile,LE_drawBuilding=drawBuilding,LE_drawObject=drawObject,LE_buildMiniBase=buildMiniBase;

// ---------- Ground ----------
function laPathAt(x,y) { return within(currentMap,x,y)&&['path','door'].includes(currentMap.tiles[y][x]); }
drawOutdoorTile=function(x,y,type,time) {
  const g=currentMap.style&&currentMap.style.ground;
  if(!g) return LE_drawOutdoorTile(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='tar') { drawTar(px,py,n,time,x,y); return; }
  if(type==='road') { drawAsphalt(px,py,n,x,y,'road'); return; }
  if(g==='city') {
    if(type==='path') { drawAsphalt(px,py,n,x,y,'path'); return; }
    drawSidewalk(px,py,n,'#d9d2c4','#c3bba9'); return;
  }
  if(g==='lawn') {
    if(type==='path'||type==='door') { drawSidewalk(px,py,n,'#ddd6c8','#c4bcab'); return; }
    rect(px,py,T,T,['#9cb26c','#a0b670','#98ae68','#a4b974'][n%4]);
    const gx=px+4+(n%12),gy=py+6+((n>>>4)%12);
    rect(gx,gy,1,3,'#7f9858'); rect(gx+2,gy+1,1,3,'#7f9858'); rect(gx+1,gy-1,1,2,'#bccb8a');
    if(n%9===0) { rect(px+8+(n%14),py+20,3,2,'#b496e0'); rect(px+9+(n%14),py+19,1,1,'#d7c4f2'); } // jacaranda petals
    if(n%13===0) { rect(px+20,py+8,2,2,'#e9d46a'); }
    return;
  }
  // dry: golden hills, dirt trails, darker dirt by the tar
  if(type==='path'||type==='door') {
    const l=laPathAt(x-1,y),r=laPathAt(x+1,y),u=laPathAt(x,y-1),d=laPathAt(x,y+1);
    rect(px,py,T,T,['#c9b27a','#c4ad74','#ccb67e','#c2ab72'][n%4]);
    const il=l?0:3,ir=r?0:3,iu=u?0:3,id=d?0:3;
    rect(px+il,py+iu,T-il-ir,T-iu-id,'#c49a68');
    if(!u) rect(px+il,py+iu,T-il-ir,1,'#d8b483');
    if(!d) rect(px+il,py+T-id-2,T-il-ir,2,'#a9825a');
    if(n%3===0) rect(px+9,py+13,3,2,'#a9825a');
    if(n%4===0) rect(px+22,py+7,2,2,'#e0c094');
    return;
  }
  if(type==='mud') {
    rect(px,py,T,T,['#a8865c','#a48258','#ac8a60','#a07e55'][n%4]);
    rect(px+4+(n%9),py+6+((n>>>4)%9),9,3,'#8a6a48');
    if(n%3===0) rect(px+18,py+20,5,2,'#5a4230');
    return;
  }
  rect(px,py,T,T,['#c9b27a','#c4ad74','#ccb67e','#c2ab72'][n%4]);
  const gx=px+4+(n%12),gy=py+6+((n>>>4)%12);
  rect(gx,gy,1,4,'#a8915c'); rect(gx+2,gy+1,1,3,'#a8915c'); rect(gx+1,gy-2,1,3,'#e2cf98');
  const g2x=px+18+((n>>>8)%9),g2y=py+18+((n>>>12)%8);
  rect(g2x,g2y,1,3,'#9a8452'); rect(g2x+2,g2y+1,1,2,'#e2cf98');
  if(n%7===0) { rect(px+8+(n%14),py+24,3,2,'#9a8f80'); rect(px+8+(n%14),py+24,3,1,'#b8ad9c'); }
  if(n%11===0) { rect(px+22,py+10,2,2,'#e9a44a'); rect(px+23,py+9,1,1,'#f6c46a'); } // poppies
};
function drawSidewalk(px,py,n,base,seam) {
  rect(px,py,T,T,base);
  rect(px,py,T,1,seam); rect(px,py,1,T,seam); rect(px+16,py,1,T,seam+'99');
  rect(px+1,py+1,T-2,1,'#ffffff30');
  if(n%5===0) rect(px+6+(n%16),py+8+((n>>>4)%14),3,2,'#b9b1a0');
  if(n%17===0) { rect(px+20,py+20,4,3,'#8e877a66'); }
}
function drawAsphalt(px,py,n,x,y,kind) {
  const laPathAt=(xx,yy)=>within(currentMap,xx,yy)&&(kind==='road'?currentMap.tiles[yy][xx]==='road':['path','door'].includes(currentMap.tiles[yy][xx]));
  rect(px,py,T,T,['#5d5d63','#5a5a60','#606066','#57575d'][n%4]);
  if(n%2===0) rect(px+((n>>>3)%28),py+((n>>>7)%28),2,1,'#6e6e74');
  if(n%3===0) rect(px+((n>>>5)%26),py+((n>>>9)%26),1,1,'#48484e');
  const l=laPathAt(x-1,y),r=laPathAt(x+1,y),u=laPathAt(x,y-1),d=laPathAt(x,y+1);
  // Curbs where the street meets the sidewalk.
  if(!u) { rect(px,py,T,3,'#e9e3d6'); rect(px,py+3,T,1,'#3e3e44'); }
  if(!d) { rect(px,py+T-3,T,3,'#b9b2a2'); rect(px,py+T-4,T,1,'#3e3e44'); }
  if(!l) { rect(px,py,3,T,'#e2dccf'); rect(px+3,py,1,T,'#3e3e44'); }
  if(!r) { rect(px+T-3,py,3,T,'#c4bdae'); rect(px+T-4,py,1,T,'#3e3e44'); }
  // Lane dashes down the middle of two-wide streets.
  if(!u&&d&&l&&r) for(let i=2;i<T;i+=16) rect(px+i,py+T-1,9,2,'#e8c84a');
  if(!l&&r&&u&&d) for(let i=2;i<T;i+=16) rect(px+T-1,py+i,2,9,'#e8c84a');
}
function drawTar(px,py,n,time,x,y) {
  const is=(xx,yy)=>within(currentMap,xx,yy)&&currentMap.tiles[yy][xx]==='tar';
  rect(px,py,T,T,'#2d2734');
  if(!is(x,y-1)) { rect(px,py,T,3,'#1d1822'); rect(px,py+3,T,2,'#5b5268'); }
  if(!is(x,y+1)) rect(px,py+T-3,T,3,'#1d1822');
  if(!is(x-1,y)) rect(px,py,3,T,'#1d1822');
  if(!is(x+1,y)) rect(px+T-3,py,3,T,'#1d1822');
  const ph=(time*.7+(n%10)/10)%1;
  if(n%3===0) { const r=2+ph*4; gfx.globalAlpha=1-ph; ellipse(px+10+(n%12),py+16,r,r*.7,'#5b5268'); gfx.globalAlpha=1; }
  rect(px+6+(n%9),py+10,6,1,'#4a4258'); rect(px+16,py+22,8,1,'#3b3446');
  if(n%5===0) rect(px+20,py+8,2,1,'#a9a2c2');
}
// ---------- Buildings ----------
drawBuilding=function(h,time) {
  if(h.region!=='la') return LE_drawBuilding(h,time);
  const x=h.x*T,y=h.y*T,w=h.w*T,bottom=(h.y+h.h)*T,cx=x+w/2;
  rect(x+6,bottom-4,w-4,10,'#2b2a2633');
  const up=upperPx(h);
  if(up) { gfx.globalAlpha=behindUpper(h,up)?.35:1; drawUpper(h,x,y,w,cx,up,time); gfx.globalAlpha=1; }
  if(h.style==='tom') drawTomHouse(h,x,y,w,bottom,cx,time);
  else if(h.style==='craftsman') drawCraftsman(h,x,y,w,bottom,cx,time);
  else if(h.style==='tower') drawTowerBase(h,x,y,w,bottom,cx,time);
  else if(h.style==='bungalow') drawBungalow(h,x,y,w,bottom,cx);
  else if(h.style==='spanish') drawSpanish(h,x,y,w,bottom,cx);
  else if(h.style==='modern') drawModern(h,x,y,w,bottom,cx);
  else drawStore(h,x,y,w,bottom,cx,time);
  if(visited.has(h.id)) {
    rect(x+w-20,y+40,2,22,'#f4e0a3');
    rect(x+w-19,y+40,14,10,OUT); rect(x+w-18,y+41,12,8,'#f2d178'); rect(x+w-16,y+43,8,4,'#fff6c8');
  }
};
function stuccoWall(x,top,w,bottom,col) {
  rect(x+4,top,w-8,bottom-top,OUT);
  rect(x+6,top+2,w-12,bottom-top-4,col);
  rect(x+6,top+2,w-12,3,'#ffffff40');
  rect(x+w-10,top+2,4,bottom-top-4,'#00000014');
  rect(x+4,bottom-6,w-8,4,'#00000022');
}
function glassDoor(cx,dy,frame) {
  rect(cx-17,dy-6,34,38,OUT);
  rect(cx-15,dy-4,30,34,frame);
  rect(cx-12,dy-1,24,31,'#7fa8b4');
  rect(cx-12,dy-1,24,4,'#b9d8e0'); rect(cx-9,dy+5,3,18,'#d8eef2'); rect(cx-1,dy-1,2,31,frame);
  rect(cx+3,dy+14,4,2,'#e8c84a');
}
function woodDoor(cx,dy,col) {
  rect(cx-16,dy-6,32,38,OUT);
  rect(cx-14,dy-4,28,34,col);
  rect(cx-10,dy,20,12,shadeHex(col,-24)); rect(cx-10,dy+16,20,12,shadeHex(col,-24));
  rect(cx-8,dy+2,6,8,'#f2e6b0'); rect(cx+2,dy+2,6,8,'#f2e6b0');
  rect(cx+7,dy+15,2,3,'#e8c84a');
}
function laSign(text,cx,y,bg,ink,sc=2) {
  const sw=text.length*4*sc+16;
  rect(cx-sw/2-2,y-2,sw+4,5*sc+12,OUT);
  rect(cx-sw/2,y,sw,5*sc+8,bg);
  rect(cx-sw/2,y,sw,1,'#ffffff40');
  label(text,cx,y+4,ink,sc);
}
function shopIcon(kind,x,y,time) {
  if(kind==='cup') { rect(x-4,y-1,8,9,OUT); rect(x-3,y,6,7,'#fff6dc'); rect(x+3,y+2,3,3,OUT); rect(x+4,y+3,1,1,'#fff6dc'); rect(x-2,y-5+Math.floor(time*2)%2,1,3,'#fff6dc'); rect(x+1,y-6,1,3,'#fff6dc'); }
  else if(kind==='lantern') { for(const dx of [-6,6]) { rect(x+dx-3,y-2,6,10,OUT); rect(x+dx-2,y-1,4,8,'#e8584a'); rect(x+dx-2,y+1,4,1,'#b9483f'); rect(x+dx-1,y-3,2,1,'#2c2c33'); } }
  else if(kind==='leaf') { ellipse(x,y+3,5,3,OUT); ellipse(x,y+3,4,2,'#6fb35a'); rect(x-4,y+3,8,1,'#3f7a3a'); }
  else if(kind==='hanger') { rect(x-1,y-3,2,3,OUT); polygon([[x,y],[x-7,y+6],[x+7,y+6]],OUT); polygon([[x,y+2],[x-5,y+5],[x+5,y+5]],'#e3c6f0'); }
  else if(kind==='board') { rect(x-8,y+1,16,4,OUT); rect(x-7,y+2,14,2,'#f2a05a'); rect(x-5,y+5,2,2,OUT); rect(x+3,y+5,2,2,OUT); }
}
function drawStore(h,x,y,w,bottom,cx,time) {
  const top=y+44;
  // Parapet and flat roof, or a stone belt course when there are floors above.
  if(h.floors) { rect(x+2,y+38,w-4,8,OUT); rect(x+4,y+39,w-8,6,h.stone||h.roof); }
  else { rect(x+2,y+30,w-4,16,OUT); rect(x+4,y+32,w-8,12,h.roof); rect(x+4,y+32,w-8,2,'#ffffff40'); }
  if(h.style==='strip') { rect(cx-34,y+20,68,12,OUT); rect(cx-32,y+22,64,10,h.roof); rect(cx-32,y+22,64,2,'#ffffff40'); }
  if(h.taxi) for(let i=0;i<(w-12)/6;i++) for(let r=0;r<2;r++) rect(x+6+i*6,y+34+r*5,6,5,(i+r)%2?'#2c2c33':'#f2c75a');
  stuccoWall(x,top,w,bottom,h.wall);
  if(h.style==='cinema') { drawCinemaFront(h,x,y,w,bottom,cx,time); return; }
  // Sign band.
  if(h.shop) {
    const signW=h.label.length*8+44,sx=cx-signW/2;
    rect(sx-3,y+52,signW+6,24,OUT); rect(sx-1,y+54,signW+2,20,'#c98a1e'); rect(sx+1,y+56,signW-2,16,'#163f42');
    drawCoin(sx+12,y+64,7,time,false); label(h.label,cx+10,y+60,'#ffd968',2);
    const roof=h.floors?y+46-h.floors*34-12:y+30,bob=Math.round(Math.sin(time*3)*3),by=roof-18+bob;
    ellipse(cx,roof,9,3,'#2b2a2640'); drawCoin(cx,by,13,time,true);
  } else if(h.taxi) {
    laSign(h.label,cx,y+54,'#2c2c33','#ffd24a',2);
    const ly=h.floors?y+46-h.floors*34-26:y+16;
    rect(cx-17,ly,34,13,OUT); rect(cx-15,ly+2,30,9,'#f2c75a'); rect(cx-15,ly+2,30,2,'#fff1b0'); label('CAB',cx,ly+4,'#2c2c33',1);
    if(Math.floor(time*1.5)%2) { rect(cx-21,ly+3,3,3,'#fff6c8'); rect(cx+18,ly+3,3,3,'#fff6c8'); }
  } else {
    laSign(h.label,cx,y+54,h.sign,h.ink,2);
    if(h.icon) shopIcon(h.icon,cx-(h.label.length*4+18),y+59,time);
  }
  // Awning.
  for(let i=0;i<7;i++) {
    const sx=x+12+i*20,a=i%2===0;
    rect(sx,y+80,20,12,a?h.awning:h.awning2);
    rect(sx,y+90,20,2,shadeHex(a?h.awning:h.awning2,-30));
    ellipse(sx+10,y+92,10,4,a?h.awning:h.awning2);
  }
  rect(x+10,y+78,w-20,2,OUT);
  // Display windows either side of the door.
  for(const wx of [x+12,x+w-58]) {
    rect(wx-2,y+100,48,40,OUT); rect(wx,y+102,44,36,'#6f7f86'); rect(wx+2,y+104,40,32,'#8fb4be');
    rect(wx+2,y+104,40,6,'#b9d8e0'); rect(wx+6,y+112,3,18,'#d8eef2'); rect(wx+12,y+110,2,10,'#d8eef2');
    rect(wx+2,y+128,40,8,shadeHex(h.wall,-30));
    if(h.icon==='hanger') { for(let k=0;k<4;k++) { rect(wx+6+k*10,y+116,6,12,['#d65aa0','#4e81a3','#e8c84a','#6a4f7a'][k]); } }
    else if(h.icon==='board') { for(let k=0;k<3;k++) { rect(wx+8+k*12,y+108,6,24,OUT); rect(wx+9+k*12,y+109,4,22,['#f2a05a','#5aa05a','#4a78c2'][k]); } }
    else if(h.icon==='cup'||h.icon==='leaf') { for(let k=0;k<3;k++) { rect(wx+8+k*12,y+122,8,8,OUT); rect(wx+9+k*12,y+123,6,6,h.icon==='leaf'?'#8ac46a':'#c98a4a'); } }
    else if(h.icon==='lantern') { rect(wx+4,y+106,36,10,'#f4ecd2'); label('RAMEN',wx+22,y+108,'#b9483f',1); }
  }
  glassDoor(cx,h.door.y*T,'#3a3f46');
  if(h.style==='strip') stripExtras(h,x,y,w,cx,time);
}
function drawCinemaFront(h,x,y,w,bottom,cx,time) {
  // Vertical blade sign.
  rect(cx-12,y-24,24,74,OUT); rect(cx-10,y-22,20,70,'#a8453a'); rect(cx-10,y-22,20,2,'#d8705a');
  const word='STAR';
  for(let i=0;i<word.length;i++) label(word[i],cx,y-16+i*14,Math.floor(time*2+i)%4===0?'#fff6c8':'#ffd968',2);
  // Marquee with chasing bulbs.
  rect(x+6,y+66,w-12,30,OUT); rect(x+8,y+68,w-16,26,'#2c2c33');
  label(h.label,cx,y+74,'#ffd968',2);
  label('DOUBLE FEATURE',cx,y+87,'#fff1cb',1);
  for(let i=0;i<(w-16)/8;i++) { const on=(i+Math.floor(time*6))%3===0; rect(x+10+i*8,y+69,3,2,on?'#fff6c8':'#8a7a4a'); rect(x+10+i*8,y+91,3,2,on?'#8a7a4a':'#fff6c8'); }
  // Poster boxes.
  for(const [k,wx] of [[0,x+16],[1,x+w-46]]) {
    rect(wx-2,y+102,32,40,OUT); rect(wx,y+104,28,36,'#e8c84a');
    rect(wx+2,y+106,24,32,k?'#3a2a4a':'#2a3a4a'); ellipse(wx+14,y+120,7,8,k?'#e8584a':'#9cd0e0'); rect(wx+4,y+132,20,2,'#fff1cb');
  }
  glassDoor(cx,h.door.y*T,'#a8453a');
}
function drawBungalow(h,x,y,w,bottom,cx) {
  const top=y+70;
  stuccoWall(x,top,w,bottom,h.wall);
  for(let yy=top+10;yy<bottom-8;yy+=6) rect(x+6,yy,w-12,1,'#00000014'); // clapboard
  // Low wide gable with deep eaves.
  polygon([[x-10,top+4],[cx,y+26],[x+w+10,top+4]],OUT);
  polygon([[x-6,top+1],[cx,y+30],[x+w+6,top+1]],h.roof);
  polygon([[x+14,top-2],[cx,y+40],[x+w-14,top-2]],shadeHex(h.roof,18));
  rect(cx-14,y+48,28,14,OUT); rect(cx-12,y+50,24,10,h.trim); for(let i=0;i<4;i++) rect(cx-10+i*6,y+50,1,10,'#00000022');
  rect(x-10,top+2,w+20,5,OUT); rect(x-8,top+3,w+16,2,h.trim);
  // Porch: roof beam and tapered columns.
  rect(x+14,y+94,w-28,8,OUT); rect(x+16,y+95,w-32,5,h.trim);
  for(const px of [x+22,x+w-30]) { polygon([[px,y+102],[px+8,y+102],[px+10,bottom-6],[px-2,bottom-6]],OUT); rect(px+1,y+102,6,bottom-y-110,h.trim); rect(px-2,bottom-14,12,8,'#8a7a6a'); }
  for(const wx of [x+40,x+w-62]) { rect(wx-2,y+110,24,22,OUT); rect(wx,y+112,20,18,'#e8d9a0'); rect(wx+9,y+112,2,18,h.trim); rect(wx,y+120,20,2,h.trim); }
  laSign(h.label,cx,y+80,h.trim,'#3f4a3a',1);
  woodDoor(cx,h.door.y*T,'#7a5536');
  rect(cx-24,bottom-2,48,4,'#bdb6a8');
}
function drawSpanish(h,x,y,w,bottom,cx) {
  const top=y+62;
  stuccoWall(x,top,w,bottom,h.wall);
  // Red clay tile roof: rows of rounded tiles.
  rect(x-6,y+34,w+12,32,OUT);
  for(let r=0;r<4;r++) for(let i=0;i<(w+8)/10;i++) {
    const tx=x-4+i*10+(r%2?5:0),ty=y+36+r*7;
    if(tx>x+w+2) continue;
    rect(tx,ty,9,8,h.roof); rect(tx,ty,2,8,shadeHex(h.roof,22)); rect(tx+7,ty,2,8,shadeHex(h.roof,-28));
  }
  rect(x-6,y+64,w+12,3,shadeHex(h.roof,-40));
  // Arched windows with iron grilles.
  for(const wx of [x+20,x+w-46]) {
    ellipse(wx+13,y+92,14,12,OUT); rect(wx-1,y+92,28,30,OUT);
    ellipse(wx+13,y+92,12,10,'#3a3f46'); rect(wx+1,y+92,24,28,'#3a3f46');
    for(let k=0;k<4;k++) rect(wx+4+k*6,y+84,1,36,'#1d1a1c');
    rect(wx-3,y+122,32,4,h.trim);
  }
  rect(cx-20,y+70,40,12,OUT); rect(cx-18,y+72,36,8,'#f4ead8');
  for(let i=0;i<6;i++) rect(cx-16+i*6,y+73,4,6,['#2f6fb3','#e8c84a','#c0613f'][i%3]); // painted tiles
  laSign(h.label,cx,y+128,'#f4ead8','#6a4a3a',1);
  // Arched door.
  const dy=h.door.y*T;
  ellipse(cx,dy+2,16,10,OUT); rect(cx-16,dy+2,32,30,OUT);
  ellipse(cx,dy+2,14,8,'#6a3f2a'); rect(cx-14,dy+2,28,28,'#6a3f2a');
  for(let k=0;k<4;k++) rect(cx-11+k*7,dy-4,1,34,'#4a2a1a');
  rect(cx+8,dy+14,2,3,'#e8c84a');
}
function drawModern(h,x,y,w,bottom,cx) {
  const top=y+50;
  stuccoWall(x,top,w,bottom,h.wall);
  rect(x,y+40,w,12,OUT); rect(x+2,y+42,w-4,8,h.roof);
  // Upper volume in dark panel, wood slats on one side.
  rect(x+8,top+6,w-16,40,OUT); rect(x+10,top+8,w-20,36,h.roof);
  rect(x+14,top+12,w*.55,24,'#8fb4be'); rect(x+14,top+12,w*.55,4,'#b9d8e0');
  for(let i=0;i<8;i++) rect(x+w-46+i*4,top+10,2,32,'#b98a5a');
  rect(x+20,y+112,40,22,OUT); rect(x+22,y+114,36,18,'#8fb4be'); rect(x+22,y+114,36,3,'#b9d8e0');
  rect(x+w-60,y+112,40,22,OUT); rect(x+w-58,y+114,36,18,'#8fb4be'); rect(x+w-58,y+114,36,3,'#b9d8e0');
  laSign(h.label,cx,y+100,h.roof,h.trim,1);
  woodDoor(cx,h.door.y*T,'#b98a5a');
}

// ---------- Downtown: stories above the storefront, the glass tower ----------
// Upper floors rise above the building's footprint. When Tom walks behind them they turn see-through.
function upperPx(h) { return h.style==='tower'?196:(h.floors?h.floors*34:0); }
function behindUpper(h,up) {
  const p=position(player),topRow=(h.y*T+46-up)/T;
  return p.x>h.x-.7&&p.x<h.x+h.w-.3&&p.y+1>topRow&&p.y<h.y+.5;
}
function drawUpper(h,x,y,w,cx,up,time) {
  const base=y+46,top=base-up,n=hash(h.x,h.y);
  if(h.style==='tower') {
    const sx=x+12,sw=w-24;
    rect(sx-2,top-2,sw+4,up+2,OUT); rect(sx,top,sw,up,'#5f8fb4');
    for(let yy=top+5;yy<base;yy+=9) rect(sx,yy,sw,1,'#3f5a74');
    for(let xx=sx+9;xx<sx+sw;xx+=12) rect(xx,top,1,up,'#4a7090');
    rect(sx+6,top,10,up,'#9cc6e099'); rect(sx+22,top,4,up,'#b9daf099'); rect(sx+sw-14,top,8,up,'#3f5a7466');
    for(let k=0;k<10;k++) { const hk=hash(k,n); rect(sx+2+(hk%(sw-10)),top+6+((hk>>>6)%(up-12)),6,4,'#f6d27a'); }
    rect(sx-8,top-12,sw+16,12,OUT); rect(sx-6,top-10,sw+12,8,h.stone); label(h.label,cx,top-9,'#3f5a74',1);
    rect(cx-1,top-30,2,18,OUT);
    if(Math.floor(time*1.2)%2) rect(cx-2,top-33,4,4,'#e8584a');
    return;
  }
  if(h.style==='loft') {
    rect(x+2,top-4,w-4,up+6,OUT); rect(x+4,top-2,w-8,up+4,h.wall);
    for(let yy=top;yy<base;yy+=4) { rect(x+4,yy,w-8,1,shadeHex(h.wall,-24)); for(let xx=x+6+((yy/4)%2?4:0);xx<x+w-6;xx+=8) rect(xx,yy+1,1,3,shadeHex(h.wall,-24)); }
    rect(x,top-8,w,6,OUT); rect(x+2,top-7,w-4,4,shadeHex(h.wall,-30));
    if(h.ghost) { rect(x+12,top+3,w-24,13,'#f4ecd222'); label(h.ghost,cx,top+7,'#f4ecd2aa',1); }
    for(let f=0;f<h.floors;f++) for(let i=0;i<3;i++) {
      const wx=x+14+i*46,wy=top+22+f*34;
      rect(wx-1,wy-1,36,26,OUT); rect(wx,wy,34,24,(hash(i,f+n)%4)?'#5a7480':'#f2d48a');
      for(let k=1;k<3;k++) rect(wx+k*11,wy,1,24,'#2b2a26'); rect(wx,wy+11,34,1,'#2b2a26');
      rect(wx-2,wy+24,38,3,h.stone);
    }
    // Water tank on the roof.
    const tx=x+w-46,ty=top-34;
    for(const lx of [tx+3,tx+19]) rect(lx,ty+20,2,14,'#3a3f46');
    rect(tx,ty+4,24,18,OUT); rect(tx+1,ty+5,22,16,'#8a6a4a'); for(let k=0;k<3;k++) rect(tx+1,ty+8+k*5,22,1,'#5a4230');
    polygon([[tx-2,ty+5],[tx+12,ty-4],[tx+26,ty+5]],OUT); polygon([[tx,ty+4],[tx+12,ty-2],[tx+24,ty+4]],'#6a5040');
    drawFireEscape(x+6,top,base,h.floors);
    return;
  }
  // Deco / Beaux-Arts stone facade with a cornice (also the cinema and the cab office).
  rect(x+2,top-4,w-4,up+6,OUT); rect(x+4,top-2,w-8,up+4,h.wall);
  rect(x+4,top-2,w-8,3,'#ffffff30');
  for(const px of [x+8,x+w-12]) rect(px,top,4,up,h.stone);
  for(let f=0;f<h.floors;f++) for(let i=0;i<4;i++) {
    const wx=x+16+i*34,wy=top+8+f*34;
    rect(wx-1,wy-1,22,25,OUT); rect(wx,wy,20,23,(hash(i+3,f+n)%5)?'#5a7a8a':'#f2d48a'); rect(wx,wy,20,7,'#9cc0cc'); rect(wx+9,wy,2,23,'#2b2a26');
    rect(wx-3,wy+23,26,3,h.stone);
    if(f===0) { rect(wx-1,wy-5,22,4,h.stone); }
  }
  rect(x-4,top-14,w+8,12,OUT); rect(x-2,top-12,w+4,8,h.stone); rect(x-2,top-12,w+4,2,'#ffffff50');
  for(let xx=x;xx<x+w;xx+=7) rect(xx,top-4,4,3,h.stone);
  if(h.fire) drawFireEscape(x+w-44,top,base,h.floors);
}
function drawFireEscape(fx,top,base,floors) {
  for(let f=0;f<floors;f++) {
    const py=top+30+f*34;
    rect(fx,py,36,2,'#1d1a1c'); rect(fx,py-8,36,1,'#1d1a1c');
    for(let k=0;k<=36;k+=6) rect(fx+k,py-8,1,8,'#1d1a1c');
    for(let k=0;k<12;k++) rect(fx+6+k*2,py-1-k*2.6,2,1,'#1d1a1c');
  }
}
// The tower's lobby: a glass podium.
function drawTowerBase(h,x,y,w,bottom,cx,time) {
  const top=y+44;
  rect(x+2,top,w-4,bottom-top,OUT); rect(x+4,top+2,w-8,bottom-top-4,'#7fa8c4');
  for(let xx=x+12;xx<x+w-8;xx+=16) rect(xx,top+2,2,bottom-top-4,'#3f5a74');
  rect(x+4,top+2,w-8,8,h.stone); rect(x+4,top+40,w-8,3,h.stone);
  rect(x+10,top+46,40,30,'#b9daf0aa'); rect(x+w-50,top+46,40,30,'#b9daf0aa');
  laSign(h.label,cx,top+18,'#3f5a74','#f4ecd2',2);
  for(const px of [x+8,x+w-20]) { rect(px,bottom-22,12,18,OUT); rect(px+1,bottom-21,10,16,'#8a7a6a'); ellipse(px+6,bottom-26,7,6,'#4f8a4a'); }
  glassDoor(cx,h.door.y*T,'#3f5a74');
}

// ---------- Jefferson Boulevard storefront extras ----------
function stripExtras(h,x,y,w,cx,time) {
  if(h.mural) {
    rect(x+6,y+50,26,26,OUT); rect(x+7,y+51,24,24,'#f2a05a'); rect(x+7,y+63,24,12,'#c94a3a'); ellipse(x+19,y+63,7,6,'#ffd968');
    rect(x+w-32,y+50,26,26,OUT); rect(x+w-31,y+51,24,24,'#5aa0c4'); ellipse(x+w-19,y+66,8,6,'#4f8a4a'); rect(x+w-20,y+55,2,8,'#e8584a');
  }
  if(h.grille) {
    const wx=x+12; rect(wx-2,y+100,48,16,OUT); rect(wx,y+102,44,12,'#9aa0a8'); for(let k=0;k<3;k++) rect(wx,y+104+k*4,44,1,'#6a6f78');
  }
  if(Math.floor(time*1.6)%2) { rect(x+w-48,y+108,26,9,'#1d1a1c'); label('OPEN',x+w-35,y+110,'#ff6a8a',1); }
}

// ---------- Jefferson Park craftsman bungalows (1905 to 1920) ----------
// cond: renovated (fresh two-tone paint, porch light, flower boxes), kept (older, tidy), rundown (faded peeling paint,
// sagging porch beam, a tarp and a dish on the roof, window bars, a screen door).
function drawCraftsman(h,x,y,w,bottom,cx,time) {
  const run=h.cond==='rundown',flip=h.cond==='flip',crowded=h.cond==='crowded',fresh=flip||h.cond==='renovated',n=hash(h.x,h.y),top=y+70,wall=h.wall,trim=h.trim;
  rect(x+4,top,w-8,bottom-top,OUT); rect(x+6,top+2,w-12,bottom-top-4,wall);
  for(let yy=top+6;yy<bottom-6;yy+=5) rect(x+6,yy,w-12,1,shadeHex(wall,-18));
  if(run) for(let k=0;k<8;k++) { const px=x+10+((n>>>(k*3))%(w-34)),py=top+8+((n>>>(k*2+5))%(bottom-top-36)); rect(px,py,8+(k%3)*4,3+(k%2)*2,'#d8d2bc'); rect(px+2,py+1,4,1,'#ebe6d4'); }
  // Low, wide front gable with deep eaves.
  polygon([[x-14,top+8],[cx,y+24],[x+w+14,top+8]],OUT);
  polygon([[x-10,top+5],[cx,y+28],[x+w+10,top+5]],h.roof);
  polygon([[x+12,top+2],[cx,y+40],[x+w-12,top+2]],shadeHex(wall,run?-8:14));
  for(let r=0;r<5;r++) { const yy=y+44+r*6,half=Math.max(0,(yy-(y+40))*((w/2-12)/(top+2-(y+40)))); for(let xx=cx-half+3;xx<cx+half-4;xx+=5) rect(xx,yy,3,4,shadeHex(wall,r%2?-4:-20)); }
  rect(cx-10,y+48,20,13,OUT); rect(cx-9,y+49,18,11,trim); for(let i=0;i<4;i++) rect(cx-9,y+50+i*3,18,1,shadeHex(trim,-60));
  for(let i=0;i<=14;i++) { const t=i/14,lx=x-10+(cx-(x-10))*t,ly=top+5+((y+28)-(top+5))*t,rx=2*cx-lx;
    rect(lx-2,ly,4,4,trim); rect(rx-2,ly,4,4,trim); if(i%2===0) { rect(lx-1,ly+4,2,4,OUT); rect(rx-1,ly+4,2,4,OUT); } }
  if(run) {
    polygon([[x+14,top+2],[x+42,y+46],[x+54,y+54],[x+26,top+8]],'#3f6fb3'); rect(x+30,y+60,2,2,'#2a4a80');
    ellipse(x+w-34,y+52,7,5,OUT); ellipse(x+w-34,y+52,6,4,'#d8d8d0'); rect(x+w-35,y+56,2,8,'#5a5a5a');
  } else if(fresh) {
    for(let i=0;i<3;i++) rect(x+w-30+i*6,top-4,2,6,'#e8e4dc'); // new vent caps
  }
  // Porch: beam over the full front, tapered columns on river-rock piers.
  const beamY=y+100,sag=run?5:0;
  for(let xx=x+8;xx<x+w-8;xx+=2) { const dy=Math.round(sag*Math.sin(Math.PI*(xx-x-8)/(w-16))); rect(xx,beamY+dy,2,10,OUT); rect(xx,beamY+1+dy,2,7,trim); }
  rect(x+10,beamY+10,w-20,bottom-26-beamY-10,'#00000018');
  for(const px of [x+14,x+w-34]) {
    rect(px-3,bottom-28,26,26,OUT); rect(px-2,bottom-27,24,24,'#8a8478');
    for(let i=0;i<6;i++) { const k=hash(px+i,y); ellipse(px+3+(i%3)*7,bottom-21+Math.floor(i/3)*9,4,3,['#a8a294','#b9b2a2','#7a746a'][k%3]); }
    polygon([[px+3,beamY+10],[px+17,beamY+10],[px+20,bottom-28],[px,bottom-28]],OUT);
    polygon([[px+5,beamY+10],[px+15,beamY+10],[px+18,bottom-29],[px+2,bottom-29]],trim);
  }
  // Windows: three-over-one sashes on each side of the door.
  for(const [k,wx] of [[0,x+40],[1,x+w-68]]) {
    rect(wx-2,y+112,32,28,OUT); rect(wx,y+114,28,24,run?'#4a5a5a':'#e8d9a0');
    rect(wx,y+122,28,2,trim); for(let i=1;i<3;i++) rect(wx+i*9,y+114,1,8,trim);
    if(run&&k===0) for(let i=0;i<5;i++) rect(wx+3+i*5,y+114,1,24,'#1d1a1c');
    if(run&&k===1) rect(wx+14,y+124,14,14,'#6a6f6a99');
    if(flip) { rect(wx-2,y+112,32,2,'#1d1a1c'); rect(wx-2,y+112,2,28,'#1d1a1c'); rect(wx+28,y+112,2,28,'#1d1a1c'); rect(wx,y+122,28,2,'#1d1a1c'); rect(wx+13,y+114,2,24,'#1d1a1c'); }
    else if(h.cond==='renovated') { rect(wx-2,y+140,32,5,'#7a5536'); for(let i=0;i<5;i++) rect(wx+2+i*6,y+137,3,3,['#e8584a','#f2d43a','#d65aa0'][i%3]); }
  }
  // Door: painted and glazed, or behind an old screen door.
  const dy=h.door.y*T;
  rect(cx-14,dy-4,28,36,OUT); rect(cx-12,dy-2,24,34,h.doorColor);
  rect(cx-8,dy+2,16,9,'#f2e6b0'); rect(cx-8,dy+6,16,1,shadeHex(h.doorColor,-40));
  if(run) { gfx.globalAlpha=.55; rect(cx-12,dy-2,24,34,'#8a8f88'); gfx.globalAlpha=1; for(let i=0;i<8;i++) rect(cx-12,dy+i*4,24,1,'#5a5f5a'); }
  rect(cx+7,dy+15,2,3,'#e8c84a');
  rect(cx-18,bottom-4,36,4,'#a8a294');
  laSign(h.label,cx,beamY-14,trim,parseInt(trim.slice(1,3),16)<100?'#f4f4f0':'#3f4a3a',1);
  if(flip) {
    // Edison string lights along the porch, a big agave, modern house numbers.
    for(let xx=x+14;xx<x+w-14;xx+=10) { const sg=Math.round(Math.sin((xx-x)/12)*2); rect(xx,beamY+12+sg,1,2,'#1d1a1c'); rect(xx-1,beamY+14+sg,3,3,Math.floor(time*2+xx)%5?'#f6d27a':'#fff1b0'); }
    for(const [dx,dy] of [[-6,-12],[-3,-17],[0,-20],[3,-17],[6,-12]]) polygon([[cx+30,bottom-8],[cx+30+dx-1,bottom+dy],[cx+30+dx+2,bottom+dy]],'#6f9a8a');
    rect(cx+24,bottom-8,13,8,'#8a8f98');
  }
  if(crowded) {
    // A clothesline across the porch, a bike on the pier, a stroller by the steps.
    rect(x+14,beamY+16,w-28,1,'#5a5a5a');
    const cols=['#e8584a','#4a78c2','#f2d43a','#d65aa0','#6fb35a','#f4f0e6','#9a7ad0'];
    for(let i=0;i<9;i++) { const cxx=x+18+i*13; rect(cxx,beamY+17,(i%3===1)?6:9,(i%2)?10:7,cols[i%cols.length]); }
    ellipse(x+w-18,bottom-10,6,6,OUT); ellipse(x+w-18,bottom-10,4,4,'#c94a3a'); ellipse(x+w-34,bottom-10,6,6,OUT); ellipse(x+w-34,bottom-10,4,4,'#c94a3a'); rect(x+w-34,bottom-16,16,2,'#4a78c2');
    rect(cx-30,bottom-14,12,8,OUT); rect(cx-29,bottom-13,10,6,'#3f8a8a'); ellipse(cx-28,bottom-5,2,2,OUT); ellipse(cx-20,bottom-5,2,2,OUT);
    rect(cx-14,bottom-6,4,3,'#f2d43a'); rect(cx+12,bottom-7,5,3,'#e8584a');
  }
  if(fresh&&!flip) { rect(cx+16,dy+2,4,6,'#f6d27a'); gfx.globalAlpha=.25; ellipse(cx+18,dy+5,10,10,'#ffe8a0'); gfx.globalAlpha=1; }
}

// ---------- Tom's house, 3468 2nd Ave (from his photos) ----------
// Greige stucco craftsman: a front porch gable with exposed rafters, a center beam and knee braces, square stucco
// columns with cream caps, a natural wood door with sidelights, a teal-framed window with plantation shutters on the
// right under the lower main roof, a chimney, wide concrete steps.
function drawTomHouse(h,x,y,w,bottom,cx,time) {
  const top=y+70,wall=h.wall,trim=h.trim,shade=shadeHex(wall,-26);
  // Chimney and the low main roof behind the porch gable.
  rect(x+w-42,y+22,16,34,OUT); rect(x+w-40,y+24,12,32,wall); rect(x+w-43,y+20,18,5,'#5a5a5e');
  polygon([[x-6,top+6],[x+14,y+46],[x+w-14,y+46],[x+w+6,top+6]],OUT);
  polygon([[x-3,top+4],[x+16,y+49],[x+w-16,y+49],[x+w+3,top+4]],h.roof);
  for(let yy=y+54;yy<top;yy+=6) rect(x+4,yy,w-8,1,'#5e5e62');
  // Stucco body.
  rect(x+4,top,w-8,bottom-top,OUT); rect(x+6,top+2,w-12,bottom-top-4,wall);
  for(let k=0;k<40;k++) { const n=hash(k,h.x*7+h.y); rect(x+8+(n%(w-18)),top+6+((n>>>8)%(bottom-top-14)),1,1,shadeHex(wall,(n%2)?10:-12)); }
  rect(x+6,top+2,w-12,3,'#ffffff30');
  // Right window: cream frame, teal sash, a row of small lites on top, white plantation shutters.
  const wx=x+w-46,wy=y+102;
  rect(wx-3,wy-3,38,32,OUT); rect(wx-2,wy-2,36,30,trim); rect(wx,wy,32,26,'#5f8a7a');
  rect(wx+2,wy+2,28,6,'#9cc0b8'); for(let i=1;i<4;i++) rect(wx+2+i*7,wy+2,1,6,'#5f8a7a');
  rect(wx+2,wy+10,28,14,'#f2efe6'); for(let i=0;i<5;i++) rect(wx+2,wy+11+i*3,28,1,'#c9c4b8'); rect(wx+15,wy+10,2,14,'#5f8a7a');
  // Porch gable, centered a little left of the door, over the porch.
  const gx=cx-12,gw=64,peak=y+28,base=y+84;
  polygon([[gx-gw-8,base+3],[gx,peak-5],[gx+gw+8,base+3]],OUT);
  polygon([[gx-gw-5,base+1],[gx,peak-2],[gx+gw+5,base+1]],h.roof);
  for(let i=0;i<=40;i++) { const t=i/40,lx=gx-gw-2+(gw+2)*t,ly=base+(peak+3-base)*t; rect(Math.round(lx)-1,Math.round(ly)-1,3,3,trim); rect(Math.round(2*gx-lx)-1,Math.round(ly)-1,3,3,trim); }
  polygon([[gx-gw+6,base-1],[gx,peak+10],[gx+gw-6,base-1]],shadeHex(wall,6));
  for(let i=1;i<12;i++) { const t=i/12,lx=gx-gw+(gw)*t,ly=base+(peak-base)*t; rect(Math.round(lx)-1,Math.round(ly)+5,2,5,OUT); rect(Math.round(2*gx-lx)-1,Math.round(ly)+5,2,5,OUT); }
  rect(gx-3,peak+12,6,base-peak-12,OUT); rect(gx-2,peak+12,4,base-peak-12,trim); // center beam
  for(const s of [-1,1]) { const bx=gx+s*(gw-10); polygon([[bx,base-2],[bx+s*2,base-2],[bx+s*14,base-22],[bx+s*12,base-22]],OUT); rect(bx-2,base-26,4,26,trim); }
  ellipse(gx,peak+30,3,3,'#e8e8e4'); rect(gx-1,peak+30,2,3,OUT); // little security camera
  // Porch: beam, recessed shadow, square stucco columns with cream caps.
  rect(gx-gw-2,base,gw*2+4,10,OUT); rect(gx-gw,base+1,gw*2,7,trim);
  rect(gx-gw+10,base+10,gw*2-20,bottom-base-34,shade);
  for(const px of [gx-gw+4,gx+gw-18]) {
    rect(px-1,base+10,16,bottom-base-34,OUT); rect(px,base+10,14,bottom-base-34,wall); rect(px+10,base+10,4,bottom-base-34,shadeHex(wall,-12));
    rect(px-3,bottom-26,20,6,OUT); rect(px-2,bottom-25,18,4,trim);
    rect(px-2,bottom-22,18,20,OUT); rect(px-1,bottom-21,16,18,wall);
  }
  // Address on the porch wall.
  label('3468',gx-30,y+104,'#2b2a26',1);
  // Natural wood front door with sidelights and divided lites on top (drawn big, like the real one).
  const dy=h.door.y*T;
  rect(cx-29,dy-25,58,57,OUT); rect(cx-28,dy-24,56,55,'#f2efe6');
  for(const sx of [cx-27,cx+19]) { rect(sx,dy-23,8,53,'#b9783a'); rect(sx+1,dy-21,6,16,'#d8e4e0'); rect(sx+1,dy-3,6,31,'#a86a30'); rect(sx+2,dy-20,1,13,'#ffffff80'); }
  rect(cx-18,dy-23,36,53,'#c98a44'); rect(cx-18,dy-23,36,2,'#e0a868'); rect(cx+15,dy-21,3,51,'#b9783a');
  rect(cx-14,dy-19,28,13,'#d8e4e0'); rect(cx-14,dy-13,28,1,'#a86a30'); for(const lx of [-7,0,7]) rect(cx+lx,dy-19,1,13,'#a86a30'); rect(cx-13,dy-18,1,4,'#ffffff90');
  for(let k=0;k<4;k++) { rect(cx-14,dy-1+k*8,28,1,'#a86a30'); rect(cx-14,dy+k*8,28,1,'#dca060'); }
  rect(cx+10,dy+8,3,6,'#2b2a26'); rect(cx+10,dy+8,1,2,'#f6d27a');
  rect(cx-7,dy-33,14,6,'#2b2a26'); rect(cx-5,dy-31,10,2,'#f6d27a');
  // Wide concrete steps.
  for(let k=0;k<3;k++) { rect(cx-31+k*2,bottom-4-k*4,62-k*4,4,OUT); rect(cx-30+k*2,bottom-3-k*4,60-k*4,3,['#d8d6d0','#cfcdc6','#c6c4bc'][k]); }
}

// ---------- Rooms with zones (different floors and walls in one room) and colored rugs ----------
const LE_drawIndoorTile=drawIndoorTile,LE_drawRug=drawRug;
drawIndoorTile=function(x,y,type) {
  const zs=currentMap.zones;
  if(zs) for(const z of zs) if(x>=z.x&&y>=z.y&&x<z.x+z.w&&y<z.y+z.h) {
    const st=currentMap.style; currentMap.style=Object.assign({},st,z);
    try { LE_drawIndoorTile(x,y,type); } finally { currentMap.style=st; }
    if(z.pattern==='grass'&&type!=='wall') {
      // Lawn: tufts of grass instead of floorboards.
      const px=x*T,py=y*T,n=hash(x,y);
      for(let i=0;i<6;i++) { const gx=px+((n>>>(i*3))%28)+2,gy=py+((n>>>(i*2+5))%26)+3; rect(gx,gy,1,3,'#4f7a3e'); rect(gx+2,gy+1,1,2,'#8cbc6a'); }
    }
    return;
  }
  LE_drawIndoorTile(x,y,type);
};
drawRug=function(r) {
  if(currentMap.id==='tomhouse'&&!r.color) {
    // The dining rug from the photo: white with navy chevron stripes.
    LE_drawRug(r);
    const x=r.x*T+8,y=r.y*T+10,w=r.w*T-16,h=r.h*T-20;
    for(let yy=y+4;yy<y+h-2;yy+=7) for(let xx=x+2;xx<x+w-4;xx+=2) { const k=Math.abs(((xx-x)%40)-20)/4; rect(xx,yy+k,2,1,'#3f4a6a'); }
    return;
  }
  if(!r.color) return LE_drawRug(r);
  const st=currentMap.style; currentMap.style=Object.assign({},st,{rug:r.color});
  try { LE_drawRug(r); } finally { currentMap.style=st; }
};

// Indoor props for Tom's house.
function drawTomProp(o,x,y,w,h,b,cx,time) {
  if(o.kind==='couch'&&currentMap.id==='tomhouse') {
    rect(x+1,y-9,w-2,h+9,OUT); rect(x+2,y-8,w-4,h+7,'#6f747c'); rect(x+4,y-6,w-8,10,'#878c94'); rect(x+4,y-6,w-8,1,'#a0a5ac');
    for(let i=6;i<w-6;i+=30) { rect(x+i,y+4,28,12,'#7c8189'); rect(x+i,y+4,28,1,'#959aa2'); }
    rect(x+2,y-8,5,h+7,'#5f646c'); rect(x+w-7,y-8,5,h+7,'#5f646c'); rect(x+12,y-2,10,7,'#c9a476'); rect(x+w-24,y-2,10,7,'#3f4a6a');
    return true;
  }
  switch(o.kind) {
    case 'bigtv':
      rect(x+2,y-14,w-4,h+6,OUT); rect(x+4,y-12,w-8,h+2,'#1d1f26');
      rect(x+6,y-10,w-12,h-2,'#2f4a8a'); rect(x+10,y-6,30,10,'#f4ecd2'); rect(x+12,y-4,26,6,'#3a5aa8');
      label('FF IV',x+w-30,y-2,'#ffd968',1); rect(x+w/2-10,b-8,20,4,'#2b2a26'); rect(x+6,b-4,w-12,4,'#5a4a3a');
      return true;
    case 'dining': {
      rect(x+10,y+2,w-20,h-8,OUT);
      for(const [px,py] of [[x+16,y],[x+40,y],[x+64,y],[x+88,y],[x+16,b-14],[x+40,b-14],[x+64,b-14],[x+88,b-14]]) { if(px>x+w-20) continue; rect(px,py,16,14,OUT); rect(px+1,py+1,14,12,'#a8aab0'); rect(px+1,py+1,14,3,'#c4c6cc'); }
      rect(x+12,y+12,w-24,h-28,OUT); rect(x+13,y+13,w-26,h-30,'#7a4a2a'); rect(x+13,y+13,w-26,3,'#9a6a40');
      rect(cx-14,y+20,28,8,'#2b2a26'); rect(cx-8,y+17,4,6,'#d8e4e0');
      // Globe chandelier hanging over the table.
      rect(cx-1,y-30,2,22,'#5a4a3a'); for(const [dx,dy] of [[-14,-10],[14,-10],[-8,-4],[8,-4],[0,-14],[0,-2]]) { ellipse(cx+dx,y+dy-8,5,5,OUT); ellipse(cx+dx,y+dy-8,4,4,'#f8f6f0'); }
      return true;
    }
    case 'gallery': {
      for(const [dx,dy,ww,hh,c] of [[2,-18,12,10,'#8a6a4a'],[18,-20,14,12,'#2b2a26'],[36,-16,10,10,'#8a6a4a'],[6,-4,24,10,'#5a3a2a'],[34,-2,10,10,'#2b2a26']]) {
        rect(x+dx,y+dy,ww,hh,c); rect(x+dx+1,y+dy+1,ww-2,hh-2,c==='#5a3a2a'?'#4f7a6a':'#e8e4dc'); if(c==='#5a3a2a') rect(x+dx+4,y+dy+3,ww-8,3,'#c9a476');
      }
      return true;
    }
    case 'wetbar':
      rect(x,y-30,w,h+28,'#5f7898'); rect(x,y-30,w,2,'#7a90ac');
      rect(x+4,y-26,14,24,OUT); rect(x+5,y-25,12,22,'#f4f4f2'); rect(x+6,y-24,10,20,'#cfe0e8'); for(let k=0;k<3;k++) rect(x+6,y-18+k*6,10,1,'#f4f4f2');
      rect(x+24,y-16,w-28,3,'#6a4a2a'); for(let k=0;k<7;k++) rect(x+26+k*5,y-24+(k%3),3,8-(k%3),['#4a78c2','#8a5a2a','#e8e4dc','#3f6a3f','#c94a3a'][k%5]);
      rect(x+1,y+2,w-2,6,'#f2f2f0'); rect(x+1,y+2,w-2,1,'#ffffff'); for(let k=0;k<3;k++) rect(x+8+k*10,y+4,6,1,'#c9c4b8');
      rect(x+1,y+8,w/2-2,h-10,OUT); rect(x+2,y+9,w/2-4,h-12,'#f4f4f2'); rect(x+8,y+14,8,1,'#2b2a26');
      rect(x+w/2,y+8,w/2-1,h-10,OUT); rect(x+w/2+1,y+9,w/2-3,h-12,'#2b2a26'); for(let k=0;k<4;k++) rect(x+w/2+3,y+12+k*4,w/2-7,1,'#c9a476');
      return true;
    case 'island':
      rect(x+1,y+4,w-2,h-4,OUT); rect(x+2,y+12,w-4,h-14,'#f4f4f2'); for(let i=8;i<w-4;i+=16) rect(x+i,y+14,1,h-18,'#c9c4b8');
      rect(x,y,w,12,OUT); rect(x+1,y+1,w-2,10,'#f2f2f0'); rect(x+8,y+4,20,1,'#c9c4b8'); rect(x+40,y+7,26,1,'#d4d0c8');
      rect(x+12,y-6,8,8,OUT); rect(x+13,y-5,6,6,'#f4ecd2'); rect(x+14,y-3,4,2,'#e8d8a8');
      return true;
    case 'kitchen':
      rect(x,y-6,w,h+6,OUT); rect(x+1,y-5,w-2,h+4,'#f4f4f2');
      for(let k=0;k<h/T;k++) { rect(x+2,y+k*T,w-4,1,'#c9c4b8'); rect(x+4,y+k*T+14,2,6,'#2b2a26'); }
      rect(x+2,y+T+4,w-4,22,'#3a3f46'); for(const dy of [8,18]) { ellipse(x+10,y+T+dy,4,3,'#1d1a1c'); ellipse(x+22,y+T+dy,4,3,'#1d1a1c'); }
      rect(x+2,y+3*T-4,w-4,T,'#c9ccd2'); rect(x+4,y+3*T+2,2,10,'#6a6f78');
      return true;
    case 'tombed':
      rect(x+2,y-12,w-4,16,OUT); rect(x+3,y-11,w-6,14,'#ece6d6'); rect(x+3,y-11,w-6,2,'#f8f4ea');
      rect(x+2,y+4,w-4,h-6,OUT); rect(x+3,y+5,w-6,h-8,'#f8f8f6'); rect(x+3,y+h-10,w-6,7,'#ece6d6');
      rect(x+10,y+6,26,10,'#ffffff'); rect(x+w-36,y+6,26,10,'#ffffff'); rect(x+3,y+20,w-6,2,'#e4e2dc');
      return true;
    case 'nightstand':
      rect(x+5,y+4,22,22,OUT); rect(x+6,y+5,20,20,'#c9a476'); rect(x+6,y+5,20,4,'#f2f2f0'); rect(x+8,y+12,16,1,'#8a6a4a'); rect(x+8,y+18,16,1,'#8a6a4a');
      rect(x+12,y-2,6,6,'#f6d27a');
      return true;
    case 'closet':
      rect(x+2,y-10,w-4,h+8,OUT); rect(x+3,y-9,w-6,h+6,'#f4f4f2'); rect(x+6,y-6,w-12,h,'#2b2a26');
      for(let k=0;k<5;k++) rect(x+7+k*3,y-4,2,h*0.5,['#1d1a1c','#2b2a26','#3f4650','#1d1a1c','#5a5a5e'][k]);
      return true;
    case 'tub':
      ellipse(cx,b-10,w/2-4,12,OUT); ellipse(cx,b-11,w/2-6,10,'#f8f8f6'); ellipse(cx,b-14,w/2-12,5,'#dfe8ee');
      if(o.jets) for(const dx of [-26,-10,6,22]) { rect(cx+dx,b-15+((Math.floor(time*6)+dx)&1),2,2,'#ffffff'); rect(cx+dx-1,b-13,4,1,'#b8d0dc'); }
      rect(x+w-14,y-6,2,14,'#b98a4a'); rect(x+w-18,y-6,6,2,'#b98a4a');
      return true;
    case 'toilet':
      rect(cx-8,y+2,16,10,OUT); rect(cx-7,y+3,14,8,'#f8f8f6');
      ellipse(cx,y+18,9,8,OUT); ellipse(cx,y+18,8,7,'#f8f8f6'); ellipse(cx,y+18,4,3,'#dfe8ee');
      return true;
    case 'shower':
      rect(x,y-12,w,h+10,'#1d2024'); for(let k=0;k<4;k++) rect(x,y-12+k*16,w,1,'#2e3236');
      rect(cx-8,y-10,16,3,'#9a9a9e'); for(let k=0;k<6;k++) rect(cx-7+k*3,y-6+((Math.floor(time*8)+k)%4)*6,1,4,'#cfe0e8');
      gfx.globalAlpha=.25; rect(x+2,y-12,w-4,h+10,'#dfeef4'); gfx.globalAlpha=1; rect(x+2,y-12,1,h+10,'#e8f4f8');
      return true;
    case 'sink':
      rect(cx-11,y+4,22,12,OUT); rect(cx-10,y+5,20,10,'#f8f8f6'); ellipse(cx,y+10,7,3,'#dfe8ee');
      rect(cx-1,y,2,6,'#9a9a9e'); rect(cx-1,y,5,2,'#9a9a9e'); rect(cx-3,y+16,6,12,OUT); rect(cx-2,y+16,4,11,'#eceae4');
      return true;
    case 'laundry':
      for(const k of [0,1]) { const lx=x+k*T+2;
        rect(lx,y-8,T-4,h+6,OUT); rect(lx+1,y-7,T-6,h+4,'#f4f4f2'); rect(lx+1,y-7,T-6,6,'#dcdde0'); rect(lx+3,y-5,4,2,k?'#6ac06a':'#4a78c2');
        ellipse(lx+(T-4)/2,y+11,9,9,OUT); ellipse(lx+(T-4)/2,y+11,8,8,'#9aa8b4'); ellipse(lx+(T-4)/2,y+11,5,5,k?'#c9c4b8':'#7a9ac4'); }
      return true;
    case 'workdesk':
      rect(x+2,y+4,w-4,10,OUT); rect(x+3,y+5,w-6,8,'#c9a476'); rect(x+3,y+5,w-6,2,'#dcbc8e'); rect(x+5,b-18,3,16,OUT); rect(x+w-8,b-18,3,16,OUT);
      for(const mx of [x+8,x+w/2+2]) { rect(mx,y-14,w/2-10,14,OUT); rect(mx+1,y-13,w/2-12,12,'#2f4a8a'); rect(mx+3,y-11,w/2-18,2,'#cfe0e8'); rect(mx+3,y-7,w/2-22,1,'#cfe0e8'); }
      rect(cx-8,y+7,16,3,'#2b2a26'); rect(x+w-12,y,6,6,'#f4f4f2'); rect(cx-6,b-12,12,10,OUT); rect(cx-5,b-11,10,8,'#3f4650');
      return true;
    case 'guestbed':
      rect(x+2,y-12,w-4,14,OUT); rect(x+3,y-11,w-6,12,'#8a5a3a'); rect(x+3,y-11,w-6,2,'#a87a50');
      rect(x+2,y+2,w-4,h-4,OUT); rect(x+3,y+3,w-6,h-6,'#f8f8f6'); rect(x+8,y+5,18,9,'#ffffff'); rect(x+w-26,y+5,18,9,'#ffffff');
      rect(x+3,y+h-18,w-6,12,'#a83a32'); rect(x+3,y+h-18,w-6,2,'#c9564a'); rect(x+2,b-4,w-4,3,'#5a3a2a');
      return true;
    case 'coffeetable':
      ellipse(cx,y+16,24,11,OUT); ellipse(cx,y+15,23,10,'#c9a476'); ellipse(cx,y+13,20,7,'#d8b486');
      rect(cx-14,y+10,10,4,'#2b2a26'); rect(cx+4,y+9,8,6,OUT); rect(cx+5,y+10,6,4,'#4a78c2');
      return true;
    case 'vanity':
      rect(x,y+4,w,h-4,OUT); rect(x+1,y+10,w-2,h-12,'#a87a4a'); for(let i=24;i<w;i+=24) rect(x+i,y+10,1,h-12,'#7a5a3a');
      rect(x,y,w,12,OUT); rect(x+1,y+1,w-2,10,'#f2f2f0'); rect(x+20,y+3,22,6,'#e4e8ec');
      rect(x+30,y-6,2,8,'#b98a4a'); rect(x+30,y-6,6,2,'#b98a4a'); rect(x+w-20,y-6,4,7,'#e8d8a8'); rect(x+w-19,y-12,1,6,'#2b2a26');
      return true;
  }
  return false;
}

// ---------- Props ----------
drawObject=function(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2;
  if(drawTomProp(o,x,y,w,h,b,cx,time)) return;
  switch(o.kind) {
    case 'flax': {
      ellipse(cx,b-6,15,6,'#5a3a2a'); ellipse(cx,b-7,13,4,'#6a4a32');
      const n=hash(o.x,o.y),cols=[['#7a2a3a','#a8485a'],['#8a3a2a','#c9604a'],['#6a8a3a','#a8c05a']][n%3];
      for(let k=0;k<9;k++) { const a=-Math.PI/2+(k-4)*.32,len=16+(k%3)*5; for(let t=0;t<len;t+=2) rect(cx+Math.cos(a)*t*.7-1,b-8+Math.sin(a)*t,2,3,cols[k%2]); }
      if(n%2) { for(let k=0;k<5;k++) { const a=-Math.PI/2+(k-2)*.5; for(let t=0;t<12;t+=2) rect(cx+10+Math.cos(a)*t*.6,b-6+Math.sin(a)*t,2,2,'#5f8a5a'); } }
      return;
    }
    case 'streetsign': {
      ellipse(cx,b-2,6,2,'#2b2a2630');
      rect(cx-2,b-58,4,56,OUT); rect(cx-1,b-57,2,54,'#8a8f98');
      rect(cx-24,b-66,48,12,OUT); rect(cx-23,b-65,46,10,'#2f7a4a'); rect(cx-22,b-64,44,1,'#f4f4f0'); rect(cx-22,b-57,44,1,'#f4f4f0');
      label('2ND AVE',cx,b-63,'#f4f4f0',1);
      return;
    }
    case 'citywall': {
      const n=hash(o.x,o.y),hg=44+n%44,col=['#b9a48a','#9a7a6a','#c9b8a0','#8a8f98','#a0523a'][n%5];
      rect(x,b-hg,T,hg,OUT); rect(x+1,b-hg+2,T-2,hg-2,col); rect(x+1,b-hg+2,T-2,3,shadeHex(col,24));
      for(let yy=b-hg+10;yy<b-8;yy+=12) for(let xx=x+5;xx<x+T-6;xx+=10) rect(xx,yy,5,7,(hash(xx,yy)%5)?'#4a5a6a':'#f6d27a');
      rect(x+1,b-6,T-2,6,shadeHex(col,-30));
      return;
    }
    case 'cart': {
      ellipse(cx,b-3,12,4,'#2b2a2630');
      rect(cx-12,b-20,24,14,OUT); rect(cx-11,b-19,22,12,'#c0c4ca'); rect(cx-11,b-19,22,3,'#e8eaee');
      rect(cx-6,b-24,12,4,'#8a5a3a'); rect(cx-4,b-26,3,2,'#e8584a'); rect(cx+1,b-26,3,2,'#e8c84a');
      rect(cx-1,b-44,2,24,'#3a3f46'); polygon([[cx-16,b-40],[cx,b-50],[cx+16,b-40]],OUT); polygon([[cx-14,b-41],[cx,b-48],[cx+14,b-41]],'#e8584a');
      for(const wx of [cx-8,cx+8]) { ellipse(wx,b-5,4,4,OUT); ellipse(wx,b-5,2,2,'#5a5a60'); }
      if(Math.floor(time*2)%2) rect(cx-3,b-30,2,4,'#ffffff70');
      return;
    }
    case 'metro': {
      rect(x+2,y+4,w-4,h-6,OUT); rect(x+4,y+6,w-8,h-10,'#3a3f46');
      for(let i=0;i<4;i++) rect(x+6,y+8+i*5,w-12,2,'#6a727c');
      rect(x+2,y+2,w-4,3,'#a9adb5'); rect(x+2,y+2,3,h-4,'#a9adb5'); rect(x+w-5,y+2,3,h-4,'#a9adb5');
      rect(x+w-8,y-34,4,38,OUT); rect(x+w-7,y-33,2,36,'#6a727c');
      rect(x+w-24,y-46,36,14,OUT); rect(x+w-23,y-45,34,12,'#1d2430'); label('METRO',x+w-6,y-42,'#e8c84a',1);
      return;
    }
    case 'slatfence': {
      rect(x,y+8,T,22,OUT); for(let i=0;i<5;i++) { rect(x,y+9+i*4,T,3,i%2?'#b98a5a':'#c89a68'); }
      rect(x,y+9,T,1,'#e0b88a'); rect(x+15,y+8,2,22,'#5a4a3a');
      return;
    }
    case 'chainlink': {
      rect(x,y+8,T,2,'#8a8f98'); rect(x+1,y+6,3,24,'#6a6f78');
      for(let yy=y+10;yy<y+28;yy+=4) for(let xx=x;xx<x+T;xx+=4) { rect(xx+((yy/4)%2?2:0),yy,1,1,'#a9adb5'); }
      if(hash(o.x,o.y)%2) rect(x+18,y+20,6,4,'#c9b8a088');
      return;
    }
    case 'stonewall': {
      rect(x,y+14,T,16,OUT); rect(x+1,y+15,T-2,14,'#8a8478');
      for(let i=0;i<6;i++) { const n=hash(o.x*7+i,o.y); ellipse(x+4+(i%3)*10+(n%4),y+19+Math.floor(i/3)*6,5,3,['#a8a294','#9a9488','#b9b2a2','#7a746a'][n%4]); }
      rect(x,y+13,T,3,'#c4bcab');
      return;
    }
    case 'palm': {
      ellipse(cx,b-4,12,4,'#2b2a2630');
      const lean=(hash(o.x,o.y)%3)-1;
      for(let i=0;i<9;i++) { const yy=b-8-i*8,xx=cx-3+Math.round(lean*i*.6); rect(xx-1,yy-1,8,10,OUT); rect(xx,yy,6,8,i%2?'#a88a5e':'#b99a6a'); rect(xx,yy+6,6,1,'#7d6544'); }
      const tx=cx+Math.round(lean*5.4),ty=b-80;
      const sway=Math.sin(time*1.2+o.x)*1.5;
      for(const [dx,dy,len] of [[-1,0,22],[1,0,22],[-1,-.6,16],[1,-.6,16],[-.4,.5,16],[.4,.5,16],[0,-1,10]]) {
        for(let k=0;k<len;k+=2) { const fx=tx+dx*k+(dx?sway:0),fy=ty+dy*k+k*k*.035*(dy>=0?1:.3); rect(fx-2,fy-2,5,5,OUT); }
      }
      for(const [dx,dy,len] of [[-1,0,22],[1,0,22],[-1,-.6,16],[1,-.6,16],[-.4,.5,16],[.4,.5,16],[0,-1,10]]) {
        for(let k=0;k<len;k+=2) { const fx=tx+dx*k+(dx?sway:0),fy=ty+dy*k+k*k*.035*(dy>=0?1:.3); rect(fx-1,fy-1,3,3,k%4?'#5f9a52':'#4c8445'); }
      }
      rect(tx-3,ty,3,3,'#6a4a2a'); rect(tx+1,ty+1,3,3,'#6a4a2a');
      return;
    }
    case 'lamp': {
      ellipse(cx,b-3,8,3,'#2b2a2630');
      rect(cx-3,b-60,6,58,OUT); rect(cx-2,b-59,4,56,'#4a5058'); rect(cx-2,b-59,1,56,'#6a727c');
      rect(cx-6,b-8,12,6,OUT); rect(cx-5,b-7,10,4,'#4a5058');
      rect(cx-2,b-64,16,5,OUT); rect(cx+8,b-62,10,8,OUT); rect(cx+9,b-61,8,4,'#4a5058'); rect(cx+10,b-57,6,2,'#fff1b0');
      return;
    }
    case 'hedge': {
      rect(x,y+4,T,T-4,OUT); rect(x+1,y+5,T-2,T-7,'#3f6a45'); rect(x+1,y+5,T-2,6,'#5a8a55');
      for(let i=0;i<5;i++) rect(x+3+((hash(o.x,o.y)+i*7)%24),y+12+(i*5)%14,3,2,'#6aa064');
      rect(x+1,b-4,T-2,2,'#2f4f35');
      return;
    }
    case 'jacaranda': case 'lemontree': case 'oak': {
      const pal=o.kind==='jacaranda'?['#8a6ac4','#a688da','#7458b0','#c4aef0']:(o.kind==='lemontree'?['#4f8a4a','#67a35a','#3f7040','#8cc070']:['#7d8a5a','#929e6a','#68744a','#aab47e']);
      ellipse(cx,b-4,16,6,'#2b2a2638');
      rect(cx-5,b-26,10,24,OUT); rect(cx-4,b-24,8,22,'#7d6552'); rect(cx-2,b-22,2,16,'#9a806a');
      ellipse(cx,b-44,25,20,OUT); ellipse(cx,b-44,23,18,pal[0]); ellipse(cx-8,b-50,12,10,pal[1]); ellipse(cx+9,b-40,11,9,pal[0]); ellipse(cx-6,b-34,12,7,pal[2]); ellipse(cx+4,b-54,8,6,pal[3]);
      if(o.kind==='lemontree') for(const [lx,ly] of [[-10,-44],[6,-50],[10,-36],[-4,-36],[0,-56]]) { rect(cx+lx-2,b+ly-2,5,5,OUT); rect(cx+lx-1,b+ly-1,3,3,'#f2d43a'); }
      if(o.kind==='jacaranda') for(let i=0;i<5;i++) rect(cx-14+((hash(o.x,o.y)>>>i)%28),b-2-(i%2)*3,2,2,'#b496e0');
      return;
    }
    case 'scrub': {
      ellipse(cx,b-3,14,4,'#2b2a2630');
      ellipse(cx-6,b-12,10,9,OUT); ellipse(cx+7,b-11,9,8,OUT); ellipse(cx,b-18,9,9,OUT);
      ellipse(cx-6,b-12,9,8,'#7d8a5a'); ellipse(cx+7,b-11,8,7,'#6f7d50'); ellipse(cx,b-18,8,8,'#8e9a68');
      rect(cx-3,b-22,3,2,'#aab47e'); if(hash(o.x,o.y)%3===0) { rect(cx+5,b-16,2,2,'#e9a44a'); rect(cx-8,b-10,2,2,'#f4e0a3'); }
      return;
    }
    case 'rock': {
      ellipse(cx,b-3,14,4,'#2b2a2630');
      polygon([[cx-14,b-2],[cx-12,b-14],[cx-4,b-22],[cx+8,b-20],[cx+14,b-10],[cx+13,b-2]],OUT);
      polygon([[cx-12,b-3],[cx-10,b-13],[cx-3,b-20],[cx+7,b-18],[cx+12,b-10],[cx+11,b-3]],'#a39a88');
      polygon([[cx-10,b-12],[cx-3,b-19],[cx+5,b-17],[cx,b-11]],'#c2b9a6');
      rect(cx+2,b-8,6,1,'#7d7464');
      return;
    }
    case 'dome': {
      ellipse(cx,b-2,w/2,6,'#2b2a2633');
      rect(x+4,b-34,w-8,32,OUT); rect(x+6,b-32,w-12,28,'#e8e4dc'); for(let i=0;i<5;i++) rect(x+12+i*16,b-26,6,14,'#8a8f98');
      ellipse(cx,b-34,30,28,OUT); ellipse(cx,b-34,28,26,'#f2f0ea'); ellipse(cx-8,b-42,10,10,'#ffffff');
      rect(cx-3,b-60,6,26,'#5a6070'); rect(x+6,b-36,w-12,4,'#b98a5a');
      for(const dx of [-40,40]) { ellipse(cx+dx,b-30,10,9,OUT); ellipse(cx+dx,b-30,8,7,'#e8e4dc'); }
      return;
    }
    case 'tacotruck': {
      ellipse(cx,b-2,w/2,5,'#2b2a2640');
      rect(x+2,b-40,w-4,34,OUT); rect(x+4,b-38,w-8,30,'#f4f0e6'); rect(x+4,b-38,w-8,3,'#ffffff');
      rect(x+4,b-14,w-8,6,'#2fa39a');
      rect(x+w-20,b-34,14,14,OUT); rect(x+w-19,b-33,12,12,'#9cd0e0');
      rect(x+10,b-34,30,14,OUT); rect(x+11,b-33,28,12,'#3a3f46'); rect(x+12,b-30,6,6,'#e8c84a'); rect(x+20,b-29,8,4,'#e8584a');
      rect(x+8,b-38,34,4,'#e8584a'); for(let i=0;i<4;i++) rect(x+10+i*9,b-38,4,4,'#f4f0e6');
      laSign('TACOS',cx-6,b-50,'#e8584a','#fff6dc',1);
      for(const wx of [x+12,x+w-14]) { ellipse(wx,b-6,6,6,OUT); ellipse(wx,b-6,4,4,'#3a3a40'); }
      if(Math.floor(time*2)%2) { rect(x+20,b-46,2,4,'#ffffff80'); rect(x+26,b-48,2,5,'#ffffff60'); }
      return;
    }
    case 'lacab': {
      drawTaxiCab(x,y,w,time);
      rect(cx-3,b-14,6,7,'#f2c044'); label('8',cx,b-13,'#2c2c33',1);
      return;
    }
    case 'rack': {
      rect(x+2,y-14,4,h+14,OUT); rect(x+w-6,y-14,4,h+14,OUT); rect(x+2,y-16,w-4,4,OUT); rect(x+3,y-15,w-6,2,'#a9adb5');
      const cols=['#d65aa0','#4e81a3','#e8c84a','#6a4f7a','#c9463d','#5aa05a','#f2a05a'];
      for(let i=0;i<Math.floor((w-14)/8);i++) { const gx=x+8+i*8; rect(gx,y-12,7,22,OUT); rect(gx+1,y-11,5,20,cols[(i+o.x)%cols.length]); rect(gx+1,y-11,5,2,'#ffffff40'); }
      return;
    }
    case 'screen': {
      rect(x-2,y-10,w+4,h+8,OUT); rect(x,y-8,w,h+4,'#f4f0e6'); rect(x,y-8,w,3,'#ffffff');
      rect(x-12,y-14,14,h+16,'#8a2a2a'); rect(x+w-2,y-14,14,h+16,'#8a2a2a');
      for(let i=0;i<3;i++) { rect(x-10+i*4,y-14,1,h+16,'#6a1a1a'); rect(x+w+i*4,y-14,1,h+16,'#6a1a1a'); }
      rect(x-14,y-16,w+28,4,'#d9a43a');
      return;
    }
    case 'boardwall': {
      rect(x+1,y-12,w-2,h+10,OUT); rect(x+2,y-11,w-4,h+8,'#8a7a6a');
      const cols=['#f2a05a','#5aa05a','#4a78c2','#e8584a','#e8c84a'];
      for(let i=0;i<Math.floor((w-8)/12);i++) { const bx=x+6+i*12; rect(bx,y-10,9,h+4,OUT); rect(bx+1,y-9,7,h+2,cols[(i+o.x)%cols.length]); rect(bx+3,y-6,3,3,'#fff6dc'); }
      return;
    }
    case 'wheel': {
      ellipse(cx,b-4,13,4,'#00000022');
      rect(cx-10,b-16,20,14,OUT); rect(cx-9,b-15,18,12,'#8a8f98');
      ellipse(cx,b-17,13,5,OUT); ellipse(cx,b-17,12,4,'#b9bdc4');
      ellipse(cx,b-21,6,5,OUT); ellipse(cx,b-21,5,4,'#c08a64'); rect(cx-2,b-24,2,1,'#d8a884');
      return;
    }
    case 'planter':
      if(o.dry) {
        rect(x+1,b-21,w-2,21,OUT); rect(x+2,b-20,w-4,19,'#c9a27a'); rect(x+6,b-16,w-12,12,'#d8b48a');
        rect(x+3,b-24,w-6,6,OUT); rect(x+4,b-23,w-8,4,'#8a7a5a');
        for(let i=10;i<w-6;i+=14) { for(const [dx,dy] of [[-6,-14],[-3,-20],[0,-24],[3,-20],[6,-14]]) { polygon([[x+i,b-22],[x+i+dx-1,b+dy-4],[x+i+dx+2,b+dy-4]],OUT); polygon([[x+i,b-22],[x+i+dx,b+dy-3],[x+i+dx+1,b+dy-3]],'#7aa88a'); } }
        return;
      }
  }
  LE_drawObject(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  const g=map.style&&map.style.ground;
  if(!g) return LE_buildMiniBase(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2;
  const b=c.getContext('2d');
  const col={city:{base:'#cfc8ba',path:'#6a6a70',solid:'#6f8f5a'},lawn:{base:'#9db36e',path:'#ddd6c8',solid:'#6f5a9a'},dry:{base:'#c9b27a',path:'#9a7a52',solid:'#7d8a5a'}}[g];
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=t==='road'?'#6a6a70':t==='tar'?'#2a2430':(t==='mud'?'#8a6a4a':(t==='path'||t==='door'?col.path:(map.solid[y*map.w+x]?col.solid:col.base)));
    b.fillRect(x*2,y*2,2,2);
  }
  for(const h of map.houses) { b.fillStyle=h.roof; b.fillRect(h.x*2,h.y*2,h.w*2,h.h*2); }
  return c;
};

// ---------- Battle backdrop for Griffith Park ----------
function drawLABattleBg(t) {
  const sky=['#e98a5a','#ef9c62','#f2ae6c','#f4c07a','#f6d08a','#f8dc98'];
  for(let i=0;i<6;i++) rect(0,i*11,192,11,sky[i]);
  ellipse(150,58,14,14,'#fbe6a8'); ellipse(150,58,11,11,'#fff2c4');
  // Hills, with the observatory on the far ridge.
  polygon([[0,66],[0,48],[30,40],[60,46],[96,34],[130,44],[160,38],[192,46],[192,66]],'#8a5a6a');
  polygon([[0,66],[0,56],[40,50],[80,58],[120,50],[160,56],[192,52],[192,66]],'#a8706a');
  ellipse(98,33,6,5,'#f2f0ea'); rect(92,33,12,3,'#e8e4dc'); rect(97,27,2,4,'#5a6070');
  rect(0,66,192,42,'#c9b27a'); rect(0,66,192,2,'#e2cf98');
  for(let i=0;i<40;i++) { const n=hash(i,9); rect(n%192,70+(n>>>8)%34,1,2,'#a8915c'); }
  ellipse(44,92,30,8,'#231e29'); ellipse(44,91,26,6,'#2d2734');
  const ph=(t*.8)%1; gfx.globalAlpha=1-ph; ellipse(36+ph*2,90,2+ph*3,1+ph*2,'#5b5268'); gfx.globalAlpha=1;
  for(const [x,y] of [[10,48],[176,44],[160,52]]) {
    rect(x-1,y,3,18,'#6a4a3a');
    for(const [dx,dy] of [[-7,1],[7,1],[-5,-2],[5,-2],[0,-4]]) { rect(x+dx-2,y+dy,5,3,'#3f6a45'); rect(x+Math.round(dx/2)-1,y+Math.round(dy/2),3,2,'#3f6a45'); }
  }
}
