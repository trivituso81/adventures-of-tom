'use strict';
// engine/backlot-render.js — The look of chapter 4's Sunset Gold Studios: the lot (ground 'lot'), the Backlot
// ('backlot') and Soundstage 7 plus its stage set ('stage', with 'catwalk' and 'pit' tiles). Props: studiowall, booth,
// trailer, crafty, golfcart, dirchair, cstand, applebox, facade, western, trough, hitch, cactus, nywall, hydrant,
// dumpster, newsstand, propcar, greenscreen, flat, tapemark, sewing, mirror, fogmachine, lightrig, jbox, roadcase,
// setwall, couch, setlamp, camera. Also the minimap colors and the battle backdrops for these maps.
// Wraps drawOutdoorTile, drawObject, buildMiniBase and drawLABattleBg. Loaded after engine/marsh-render.js.
const LE_drawOutdoorTile_lot=drawOutdoorTile,LE_drawObject_lot=drawObject,LE_buildMiniBase_lot=buildMiniBase,LE_drawLABattleBg_lot=drawLABattleBg;
const STUDIO_GROUNDS=['lot','backlot','stage'];
const studioGround=map=>{ const g=map&&map.style&&map.style.ground; return STUDIO_GROUNDS.includes(g)?g:null; };
const tileIs=(x,y,t)=>within(currentMap,x,y)&&currentMap.tiles[y][x]===t;

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=studioGround(currentMap);
  if(!g) return LE_drawOutdoorTile_lot(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='pit') {
    // A dark drop under the catwalks. The top edge catches a little light.
    rect(px,py,T,T,'#0d0e13');
    if(!tileIs(x,y-1,'pit')&&!tileIs(x,y-1,'catwalk')) { rect(px,py,T,4,'#2a2c36'); rect(px,py+4,T,2,'#1a1b22'); }
    if(n%7===0) rect(px+6+(n%18),py+12+((n>>>5)%12),1,1,'#3a3d4a');
    return;
  }
  if(type==='catwalk') {
    rect(px,py,T,T,'#0d0e13');
    const L=tileIs(x-1,y,'catwalk'),R=tileIs(x+1,y,'catwalk');
    const x0=L?0:2,x1=R?T:T-2;
    rect(px+x0,py,x1-x0,T,'#3a3f48');
    for(let k=2;k<T;k+=4) rect(px+x0,py+k,x1-x0,1,'#262a31');
    for(let k=x0+2;k<x1;k+=4) rect(px+k,py,1,T,'#2f343c');
    if(!L) { rect(px,py,3,T,'#8a8f98'); rect(px,py+4,3,1,'#c9ced6'); }
    if(!R) { rect(px+T-3,py,3,T,'#8a8f98'); rect(px+T-3,py+4,3,1,'#c9ced6'); }
    return;
  }
  if(g==='lot') {
    if(type==='path'||type==='door') {
      rect(px,py,T,T,['#55565c','#525359','#58595f','#4f5056'][n%4]);
      if(n%3===0) rect(px+((n>>>3)%28),py+((n>>>7)%28),2,1,'#64656b');
      if(!tileIs(x,y-1,'path')) { rect(px,py,T,3,'#d9d2c4'); rect(px,py+3,T,1,'#3e3e44'); }
      if(!tileIs(x,y+1,'path')) { rect(px,py+T-3,T,3,'#b9b2a2'); }
      if(tileIs(x,y-1,'path')&&tileIs(x,y+1,'path')&&!tileIs(x-1,y,'path')) rect(px+T-2,py+4,2,10,'#e8c84a');
      return;
    }
    rect(px,py,T,T,['#cfc6b4','#cbc2b0','#d3cab8','#c8bfad'][n%4]);
    rect(px,py,T,1,'#b8af9c'); rect(px,py,1,T,'#b8af9c');
    if(n%9===0) rect(px+8+(n%14),py+10+((n>>>4)%12),5,2,'#b4ab98');
    if(n%23===0) { rect(px+10,py+14,10,2,'#e8c84a'); }   // a stray paint mark
    return;
  }
  if(g==='backlot') {
    if(type==='path'||type==='door') {
      rect(px,py,T,T,['#c09a6a','#bb9566','#c49e6e','#b89262'][n%4]);
      const u=tileIs(x,y-1,'path'),d=tileIs(x,y+1,'path');
      if(!u) rect(px,py,T,2,'#d8b483'); if(!d) rect(px,py+T-2,T,2,'#9a7a52');
      if(n%3===0) rect(px+6+(n%18),py+12,4,2,'#a8845a');
      if(n%5===0) { rect(px+20,py+6,6,1,'#8a6a48'); rect(px+4,py+22,5,1,'#8a6a48'); }   // tire tracks
      return;
    }
    rect(px,py,T,T,['#d2b88a','#cdb385','#d6bc8e','#c9af82'][n%4]);
    const gx=px+4+(n%12),gy=py+6+((n>>>4)%12);
    rect(gx,gy,2,1,'#b89a6a'); rect(gx+9,gy+7,3,1,'#b89a6a');
    if(n%13===0) { rect(px+12,py+16,8,1,'#f2f0ea'); rect(px+12,py+16,1,5,'#f2f0ea'); }   // a chalk mark
    if(n%17===0) { rect(px+8,py+8,4,4,'#e8584a'); rect(px+9,py+9,2,2,'#f48a7a'); }         // a spike tape X
    return;
  }
  // stage: dark sealed concrete, with tape marks
  rect(px,py,T,T,['#3a3b42','#38393f','#3c3d44','#36373d'][n%4]);
  rect(px,py,T,1,'#2e2f35'); rect(px,py,1,T,'#2e2f35');
  if(n%11===0) { rect(px+6,py+10,8,2,'#e8c84a'); rect(px+6,py+10,2,8,'#e8c84a'); }
  if(n%19===0) rect(px+14+(n%8),py+20,6,2,'#9fd8ff');
  if(type==='path'||type==='door') { rect(px+2,py+2,T-4,T-4,'#45464e'); }
};

// ---------- Props ----------
function lotSign(text,cx,y,bg,ink,sc=1) {
  const w=(text.length*4-1)*sc+8;
  rect(cx-w/2-1,y-1,w+2,5*sc+6,OUT); rect(cx-w/2,y,w,5*sc+4,bg); label(text,cx,y+2,ink,sc);
}
drawObject=function(o,time) {
  if(!studioGround(currentMap)&&!['studiowall'].includes(o.kind)) return LE_drawObject_lot(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'studiowall': {
      // A row of big beige soundstage walls, with a stage number painted every few tiles.
      const stage=currentMap.style&&currentMap.style.ground==='stage';
      const hg=stage?46:58,col=stage?'#2a2b31':['#e0d2b4','#dccdae','#e4d6b8'][n%3];
      rect(x,b-hg,T,hg,OUT); rect(x+1,b-hg+2,T-2,hg-2,col);
      if(stage) { rect(x+1,b-hg+2,T-2,3,'#3a3b42'); for(let yy=b-hg+12;yy<b-6;yy+=10) rect(x+4,yy,T-8,1,'#24252a'); }
      else { rect(x+1,b-hg+2,T-2,4,'#f2e8d2'); rect(x+1,b-10,T-2,10,'#b8a98a'); if(n%5===0) label(String(3+n%9),x+16,b-hg+16,'#8a7a5a',3); }
      return;
    }
    case 'booth': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      rect(x+2,y-20,w-4,h+18,OUT); rect(x+3,y-19,w-6,h+16,'#e8e2d0');
      rect(x+6,y-12,w-12,18,OUT); rect(x+7,y-11,w-14,16,'#9fd0e0'); rect(x+7,y-11,w-14,3,'#d8f0f4');
      rect(x-1,y-26,w+2,8,OUT); rect(x,y-25,w,6,'#2f3a4a');
      lotSign('SECURITY',cx,y+12,'#2f3a4a','#fff1cb');
      // The gate arm, striped, sticking out over the road.
      rect(x+w-2,y+h-18,4,16,OUT); for(let k=0;k<10;k++) rect(x+w+k*6,y+h-16,6,4,k%2?'#fff1cb':'#c8553d');
      return;
    }
    case 'trailer': {
      ellipse(cx,b-1,w/2,5,'#2b2a2640');
      rect(x+2,y-10,w-4,h+4,OUT); rect(x+3,y-9,w-6,h+2,'#f2f0ea'); rect(x+3,y-9,w-6,3,'#ffffff');
      rect(x+3,y+h-14,w-6,4,o.col||'#8a6aa0');
      rect(x+10,y-2,12,h-10,OUT); rect(x+11,y-1,10,h-12,'#c9ced6'); rect(x+19,y+12,2,2,'#5a5a60');
      for(let k=0;k<2;k++) { rect(x+32+k*30,y,20,12,OUT); rect(x+33+k*30,y+1,18,10,'#9cc4d8'); }
      rect(x+8,b-8,8,6,OUT); rect(x+9,b-7,6,4,'#8a8f98');   // steps
      for(const wx of [x+28,x+w-24]) { ellipse(wx,b-4,6,6,OUT); ellipse(wx,b-4,3,3,'#5a5a60'); }
      lotSign(o.trailer||'',cx+12,y-6,'#2c2c33',o.col?'#fff1cb':'#e3c6f0');
      return;
    }
    case 'crafty': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      rect(x,y+6,w,10,OUT); rect(x+1,y+7,w-2,8,'#f4f4f0');   // tablecloth
      rect(x+1,y+15,w-2,10,'#e8e2d0'); for(let k=0;k<w-2;k+=8) rect(x+1+k,y+15,4,10,'#e2593a');
      rect(x+4,y+24,3,6,OUT); rect(x+w-7,y+24,3,6,OUT);
      // Snacks: bagels, a licorice bowl, a coffee urn, cheese sticks, a roast chicken under a dome.
      for(let k=0;k<3;k++) { ellipse(x+12+k*7,y+4,4,3,'#c98a4a'); ellipse(x+12+k*7,y+4,1,1,'#f4f4f0'); }
      ellipse(x+44,y+4,8,4,OUT); ellipse(x+44,y+3,7,3,'#d94a3a'); for(let k=0;k<4;k++) rect(x+38+k*3,y-2,1,5,'#a8323a');
      rect(x+60,y-14,12,20,OUT); rect(x+61,y-13,10,18,'#a9adb5'); rect(x+62,y-12,3,16,'#d8dce2'); rect(x+72,y-4,3,2,OUT);
      ellipse(x+w-22,y+2,11,7,OUT); ellipse(x+w-22,y+1,10,6,'#d8f0f4'); ellipse(x+w-22,y+3,6,3,'#c98a4a'); rect(x+w-23,y-6,2,2,OUT);
      lotSign('CRAFTY',cx,y-22,'#2fa39a','#fff6dc');
      return;
    }
    case 'golfcart': {
      ellipse(cx,b-2,w/2,5,'#2b2a2640');
      rect(x+6,y-14,4,24,OUT); rect(x+w-10,y-14,4,24,OUT); rect(x+2,y-18,w-4,6,OUT); rect(x+3,y-17,w-6,4,'#f2f0ea');
      rect(x+2,y+8,w-4,14,OUT); rect(x+3,y+9,w-6,12,'#f2f0ea'); rect(x+12,y+2,22,8,OUT); rect(x+13,y+3,20,6,'#2fa39a');
      for(const wx of [x+12,x+w-12]) { ellipse(wx,b-5,5,5,OUT); ellipse(wx,b-5,2,2,'#5a5a60'); }
      return;
    }
    case 'dirchair': {
      ellipse(cx,b-2,10,3,'#2b2a2633');
      rect(cx-10,y+4,2,26,OUT); rect(cx+8,y+4,2,26,OUT);
      for(let k=0;k<4;k++) rect(cx-10+k*5,y+14+k*3,4,2,'#7a5a3a');
      rect(cx-10,y-6,20,10,OUT); rect(cx-9,y-5,18,8,o.y>8?'#2c2c33':'#6a4f7a'); label('DIR',cx,y-3,'#fff1cb',1);
      rect(cx-10,y+12,20,4,OUT); rect(cx-9,y+13,18,2,'#2c2c33');
      return;
    }
    case 'cstand': {
      ellipse(cx,b-3,10,3,'#2b2a2633');
      for(const dx of [-10,0,10]) rect(cx-1+dx*.6,b-6,2,4,OUT);
      rect(cx-11,b-6,22,2,OUT); rect(cx-1,b-50,3,46,OUT); rect(cx,b-49,1,44,'#a9adb5');
      rect(cx+1,b-46,16,2,OUT); rect(cx+12,b-56,14,12,OUT); rect(cx+13,b-55,12,10,'#1b1b1f');
      return;
    }
    case 'applebox': {
      ellipse(cx,b-2,12,3,'#2b2a2633');
      rect(cx-12,b-14,24,12,OUT); rect(cx-11,b-13,22,10,'#c9a06a'); rect(cx-7,b-10,14,3,'#5a3a2a');
      return;
    }
    case 'facade': case 'western': case 'nywall': {
      // A false front: tall painted wall with a door and windows; scaffolding shows at the sides.
      const top=y-40,col=o.col||'#c9b48a';
      ellipse(cx,b-1,w/2,5,'#2b2a2633');
      rect(x+1,top,w-2,b-top,OUT); rect(x+2,top+1,w-4,b-top-2,col);
      if(o.kind==='nywall') {
        for(let yy=top+3;yy<b-4;yy+=5) for(let xx=x+2+((yy/5)%2?4:0);xx<x+w-4;xx+=9) rect(xx,yy,8,4,shadeHex(col,(hash(xx,yy)%3-1)*10));
        for(let fy=top+8;fy<b-30;fy+=24) { rect(x+10,fy,w-20,2,'#2b2a26'); for(let k=x+12;k<x+w-12;k+=6) rect(k,fy+2,1,6,'#2b2a26'); }   // fire escape
        for(let k=0;k<2;k++) { rect(x+12+k*(w-36),top+12,12,14,OUT); rect(x+13+k*(w-36),top+13,10,12,hash(k,o.x)%2?'#f6d27a':'#4a5a6a'); }
      } else if(o.kind==='western') {
        rect(x-2,top-6,w+4,10,OUT); rect(x-1,top-5,w+2,8,shadeHex(col,-20));   // the tall false-front top
        for(let k=top+6;k<b-4;k+=6) rect(x+2,k,w-4,1,shadeHex(col,-24));
        rect(x,b-34,w,4,OUT); rect(x+1,b-33,w-2,2,'#6a4a2a');   // porch roof
        for(const px2 of [x+4,x+w-8]) rect(px2,b-30,3,28,OUT);
      } else {
        rect(x+2,top+1,w-4,8,o.trim||'#7a5a3a');
        rect(x+8,top+16,w-16,18,OUT); rect(x+9,top+17,w-18,16,'#9cc4d8'); rect(x+9,top+17,w-18,4,'#d8f0f4');
        rect(x+2,b-34,w-4,6,o.trim||'#7a5a3a'); for(let k=x+2;k<x+w-2;k+=8) rect(k,b-34,4,6,'#fff1cb');   // awning
      }
      rect(cx-8,b-26,16,24,OUT); rect(cx-7,b-25,14,23,o.kind==='western'?'#5a3a22':'#4a3a32');
      if(o.kind==='western') { rect(cx-7,b-20,6,12,'#8a6a48'); rect(cx+1,b-20,6,12,'#8a6a48'); }
      if(o.sign) lotSign(o.sign,cx,top+(o.kind==='western'?-4:2),o.kind==='nywall'?'#2c2c33':'#fff1cb',o.kind==='nywall'?'#ffd968':'#3d2b26',o.sign.length>5?1:2);
      rect(x-1,top+6,2,b-top-8,'#8a8f98'); rect(x+w-1,top+6,2,b-top-8,'#8a8f98');   // scaffold poles
      return;
    }
    case 'trough': {
      ellipse(cx,b-2,w/2-2,4,'#2b2a2633');
      rect(x+4,y+10,w-8,16,OUT); rect(x+5,y+11,w-10,14,'#8a6a48'); rect(x+7,y+12,w-14,4,'#c9a06a');
      rect(cx-6,y+12,6,2,'#2b2a26'); rect(cx+1,y+12,6,2,'#2b2a26');   // the sunglasses
      return;
    }
    case 'hitch': {
      rect(x+6,y+8,4,22,OUT); rect(x+w-10,y+8,4,22,OUT); rect(x+4,y+8,w-8,5,OUT); rect(x+5,y+9,w-10,3,'#8a6a48');
      return;
    }
    case 'cactus': {
      ellipse(cx,b-3,10,3,'#2b2a2633');
      rect(cx-5,b-40,10,38,OUT); rect(cx-4,b-39,8,36,'#5f9a52'); rect(cx-2,b-38,2,34,'#7fba6a');
      rect(cx-14,b-30,10,6,OUT); rect(cx-14,b-40,6,14,OUT); rect(cx-13,b-39,4,12,'#5f9a52'); rect(cx-13,b-29,9,4,'#5f9a52');
      rect(cx+4,b-24,10,6,OUT); rect(cx+8,b-34,6,14,OUT); rect(cx+9,b-33,4,12,'#5f9a52'); rect(cx+4,b-23,9,4,'#5f9a52');
      return;
    }
    case 'hydrant': {
      ellipse(cx,b-3,9,3,'#2b2a2633');
      rect(cx-6,b-22,12,20,OUT); rect(cx-5,b-21,10,18,'#d94a3a'); rect(cx-3,b-20,3,16,'#f48a7a');
      rect(cx-8,b-6,16,4,OUT); rect(cx-7,b-5,14,2,'#a8323a'); rect(cx-9,b-16,18,5,OUT); rect(cx-8,b-15,16,3,'#d94a3a');
      ellipse(cx,b-23,6,4,OUT); ellipse(cx,b-23,5,3,'#e8584a');
      return;
    }
    case 'dumpster': {
      ellipse(cx,b-2,w/2-2,4,'#2b2a2640');
      rect(x+2,y+2,w-4,24,OUT); rect(x+3,y+3,w-6,22,'#3f6a45'); rect(x+3,y+3,w-6,4,'#5a8a55'); rect(x,y,w,5,OUT);
      return;
    }
    case 'newsstand': {
      ellipse(cx,b-2,w/2-2,4,'#2b2a2640');
      rect(x+2,y-12,w-4,38,OUT); rect(x+3,y-11,w-6,36,'#3a5a3a'); rect(x+6,y-6,w-12,14,'#f4f0e6');
      for(let k=0;k<4;k++) rect(x+8+k*12,y-3,9,9,['#e8584a','#f4f0e6','#e8c84a','#9cc4d8'][k]);
      lotSign('NEWS',cx,y-18,'#2c2c33','#ffd968');
      return;
    }
    case 'propcar': {
      ellipse(cx,b-2,w/2,5,'#2b2a2640');
      rect(x+2,y-4,w-4,26,OUT); rect(x+3,y-3,w-6,24,'#e8c84a'); rect(x+3,y+12,w-6,3,'#2c2c33');
      for(let k=0;k<6;k++) rect(x+6+k*14,y+12,6,3,k%2?'#e8c84a':'#2c2c33');
      rect(x+18,y-16,w-36,14,OUT); rect(x+19,y-15,w-38,12,'#9cc4d8'); rect(cx-8,y-22,16,6,OUT); rect(cx-7,y-21,14,4,'#f4f0e6'); label('TAXI',cx,y-21,'#2c2c33',1);
      for(const wx of [x+16,x+w-16]) { ellipse(wx,b-6,7,7,OUT); ellipse(wx,b-6,3,3,'#8a8f98'); }
      return;
    }
    case 'greenscreen': {
      rect(x+2,y-30,w-4,h+26,OUT); rect(x+3,y-29,w-6,h+24,'#3fb04a'); rect(x+3,y-29,w-6,3,'#6fd07a');
      for(let k=0;k<5;k++) rect(x+12+((n>>>k)%(w-24)),y-20+k*12,3,3,'#2b8a3a');
      rect(x+4,b-4,4,4,OUT); rect(x+w-8,b-4,4,4,OUT);
      return;
    }
    case 'flat': {
      // A theater flat seen from behind: plywood with a wooden brace.
      rect(x,y-24,T,T+22,OUT); rect(x+1,y-23,T-2,T+20,'#5a4a3a'); rect(x+1,y-23,T-2,3,'#7a6a52');
      rect(x+4,y-18,2,T+12,'#3a2e22'); rect(x+T-6,y-18,2,T+12,'#3a2e22'); rect(x+4,y-2,T-8,2,'#3a2e22');
      return;
    }
    case 'tapemark': {
      rect(x+4,y+8,w-8,2,'#d8ff8a'); rect(x+4,y+h-10,w-8,2,'#d8ff8a'); rect(x+4,y+8,2,h-16,'#d8ff8a'); rect(x+w-6,y+8,2,h-16,'#d8ff8a');
      label('RACK 2',cx,y+13,'#d8ff8a',1);
      return;
    }
    case 'sewing': {
      ellipse(cx,b-2,w/2-2,4,'#2b2a2640');
      rect(x+2,y+6,w-4,8,OUT); rect(x+3,y+7,w-6,6,'#c9a06a'); rect(x+6,y+14,3,14,OUT); rect(x+w-9,y+14,3,14,OUT);
      rect(x+14,y-10,22,16,OUT); rect(x+15,y-9,20,14,'#f4f4f0'); rect(x+28,y-4,3,10,'#2c2c33'); ellipse(x+46,y+2,5,4,'#e2593a'); rect(x+46,y-2,1,3,'#5f9a52');
      return;
    }
    case 'mirror': {
      rect(x+4,y-26,T-8,T+22,OUT); rect(x+6,y-24,T-12,T+18,'#c9e0ea'); rect(x+8,y-22,4,T+12,'#eef6fa');
      for(let k=0;k<5;k++) { rect(x+2,y-22+k*10,3,3,'#ffe08a'); rect(x+T-5,y-22+k*10,3,3,'#ffe08a'); }
      return;
    }
    case 'fogmachine': {
      ellipse(cx,b-2,w/2-2,4,'#00000040');
      rect(x+4,y+6,w-8,20,OUT); rect(x+5,y+7,w-10,18,'#2c2c33'); rect(x+8,y+10,6,4,Math.floor(time*3)%2?'#e8584a':'#6a2a2a');
      rect(x+w-8,y+12,6,8,OUT); rect(x+w-7,y+13,4,6,'#5a5a60');
      for(let k=0;k<3;k++) { const ph=(time*.8+k/3)%1; gfx.globalAlpha=(1-ph)*.7; ellipse(x+w+ph*30,y+16-ph*10,4+ph*10,3+ph*6,'#eef2f6'); }
      gfx.globalAlpha=1;
      return;
    }
    case 'lightrig': {
      // A truss with three big lights, gelled blue, amber and red. Dark until the rig is fixed.
      const on=typeof flag==='function'&&flag('ch4-rig');
      rect(x-6,y-40,4,68,OUT); rect(x+w+2,y-40,4,68,OUT); rect(x-6,y-44,w+12,6,OUT); rect(x-5,y-43,w+10,4,'#8a8f98');
      for(let k=0;k<w+8;k+=6) rect(x-4+k,y-41,1,2,'#3a3f48');
      ['#4a78c2','#e8a43a','#d94a3a'].forEach((c,k)=>{ const lx=x+6+k*18;
        rect(lx-6,y-38,14,14,OUT); rect(lx-5,y-37,12,12,on?c:shadeHex(c,-80)); if(on) rect(lx-3,y-35,4,4,'#ffffff');
        rect(lx,y-24,2,6,OUT); });
      // A cable off the back, with a gaffer-tape patch once TNB has fixed it.
      rect(x+w,y+20,8,3,OUT); if(on) rect(x+w+1,y+18,6,7,'#8a8f98'); else if(Math.floor(time*4)%3===0) rect(x+w+6,y+16,3,3,'#ffe08a');
      return;
    }
    case 'jbox': {
      const on=typeof ch4BoxOn==='function'&&ch4BoxOn(o.jbox);
      const col={red:'#d94a3a',blue:'#4a78c2',amber:'#e8a43a'}[o.jbox]||'#8a8f98';
      ellipse(cx,b-2,10,3,'#00000040');
      rect(cx-10,y-8,20,34,OUT); rect(cx-9,y-7,18,32,'#5a5f68'); rect(cx-9,y-7,18,5,col);
      rect(cx-4,y+4,8,14,OUT); rect(cx-3,on?y+5:y+11,6,6,on?'#9be39a':'#c9ced6');
      rect(cx-6,y+20,12,3,on?col:'#2c2c33');
      return;
    }
    case 'roadcase': {
      ellipse(cx,b-2,w/2-2,4,'#00000040');
      rect(x+2,y+2,w-4,24,OUT); rect(x+3,y+3,w-6,22,'#2c2c33'); rect(x+3,y+3,w-6,2,'#4a4f58');
      for(const cx2 of [x+6,x+w-10]) rect(cx2,y+5,4,18,'#8a8f98');
      rect(x+20,y+8,10,8,'#e8c84a'); rect(x+34,y+12,12,6,'#e2593a');
      return;
    }
    case 'setwall': {
      rect(x,y-30,w,h+30,OUT); rect(x+1,y-29,w-2,h+28,'#c9b48a'); rect(x+1,y-29,w-2,6,'#e0cfa8');
      for(let k=x+8;k<x+w-8;k+=36) rect(k,y-20,1,h+18,'#b8a378');
      rect(x+40,y-20,60,40,OUT); rect(x+41,y-19,58,38,'#f2a05a'); rect(x+41,y+4,58,15,'#d96a4a'); ellipse(x+70,y+4,10,10,'#ffd968'); rect(x+69,y-19,2,38,OUT); rect(x+41,y,58,2,OUT);
      rect(x+w-120,y-22,70,48,OUT); for(let r=0;r<4;r++) for(let k=0;k<9;k++) rect(x+w-118+k*7,y-20+r*12,6,10,['#c9463d','#4e81a3','#e8c84a','#6a4f7a','#5aa05a'][(k+r)%5]);
      ellipse(x+w-30,y-8,10,10,OUT); ellipse(x+w-30,y-8,8,8,'#f4f0e6'); rect(x+w-31,y-14,2,7,OUT); rect(x+w-30,y-9,5,2,OUT);
      return;
    }
    case 'couch': {
      ellipse(cx,b-2,w/2,5,'#00000040');
      rect(x+2,y-8,w-4,30,OUT); rect(x+3,y-7,w-6,12,'#a8453a'); rect(x+3,y+5,w-6,14,'#c0613f');
      rect(x,y-2,8,22,OUT); rect(x+w-8,y-2,8,22,OUT);
      return;
    }
    case 'setlamp': {
      rect(cx-8,y+12,16,14,OUT); rect(cx-7,y+13,14,12,'#8a6a48'); rect(cx-1,y-4,2,16,OUT);
      polygon([[cx-10,y-4],[cx-6,y-16],[cx+6,y-16],[cx+10,y-4]],OUT); polygon([[cx-8,y-5],[cx-5,y-15],[cx+5,y-15],[cx+8,y-5]],'#f4e6c0');
      return;
    }
    case 'camera': {
      ellipse(cx,b-2,w/2,5,'#00000040');
      rect(x+4,y+16,w-8,10,OUT); rect(x+5,y+17,w-10,8,'#4a4f58'); for(const wx of [x+8,x+w-10]) { ellipse(wx,b-3,4,4,OUT); }
      rect(cx-2,y-2,4,18,OUT); rect(cx-16,y-20,32,18,OUT); rect(cx-15,y-19,30,16,'#2c2c33'); rect(cx+14,y-16,10,10,OUT); rect(cx+15,y-15,8,8,'#5a6a7a');
      ellipse(cx-6,y-24,7,7,OUT); ellipse(cx+6,y-24,7,7,OUT); ellipse(cx-6,y-24,5,5,'#4a4f58'); ellipse(cx+6,y-24,5,5,'#4a4f58');
      if(Math.floor(time*2)%2) rect(cx-12,y-16,3,3,'#e8584a');
      return;
    }
  }
  return LE_drawObject_lot(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  const g=studioGround(map);
  if(!g) return LE_buildMiniBase_lot(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2;
  const b=c.getContext('2d');
  const col={lot:{base:'#cfc6b4',path:'#55565c',solid:'#8a7a5a'},backlot:{base:'#d2b88a',path:'#a8845a',solid:'#7a5a3a'},stage:{base:'#3a3b42',path:'#45464e',solid:'#1b1b1f'}}[g];
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=t==='catwalk'?'#8a8f98':t==='pit'?'#0d0e13':(t==='path'||t==='door'?col.path:(map.solid[y*map.w+x]?col.solid:col.base));
    b.fillRect(x*2,y*2,2,2);
  }
  return c;
};

// ---------- Battle backdrops ----------
// The lot and the Backlot: a hot blue sky over soundstage roofs and a painted New York. Inside: a dark stage under lights.
function drawStudioBattleBg(t,inside) {
  if(inside) {
    rect(0,0,192,108,'#14151a');
    for(let i=0;i<5;i++) { const lx=20+i*38; rect(lx-5,4,10,6,'#2c2c33'); gfx.globalAlpha=.14+.04*Math.sin(t*1.5+i); polygon([[lx-4,10],[lx+4,10],[lx+22,70],[lx-22,70]],'#fff1cb'); gfx.globalAlpha=1; rect(lx-3,8,6,2,['#4a78c2','#e8a43a','#d94a3a','#fff1cb','#9be39a'][i]); }
    rect(0,2,192,2,'#4a4f58');
    rect(0,66,192,42,'#3a3b42'); rect(0,66,192,2,'#5a5b62');
    for(let i=0;i<8;i++) { const n=hash(i,41); rect(n%180,72+(n>>>8)%30,10,2,'#e8c84a'); }
    rect(150,40,30,26,'#2a2b31'); rect(152,42,26,22,'#c9b48a'); rect(160,46,10,8,'#f2a05a');   // a flat from the set
    gfx.globalAlpha=.18; for(let i=0;i<4;i++) ellipse((t*12+i*60)%240-24,74+i*6,30,6,'#eef2f6'); gfx.globalAlpha=1;
    return;
  }
  const sky=['#6fb4e8','#7bbcea','#88c4ec','#96ccee','#a6d4f0','#b6dcf2'];
  for(let i=0;i<6;i++) rect(0,i*11,192,11,sky[i]);
  ellipse(30,16,9,9,'#fff6c0');
  for(const [x,w,hh] of [[0,46,30],[48,40,24],[150,42,32]]) { rect(x,66-hh,w,hh,'#e0d2b4'); rect(x,66-hh,w,3,'#f2e8d2'); label(String(3+x%7),x+w/2,66-hh+8,'#b8a98a',2); }
  for(let x=92;x<148;x+=9) { const hh=14+hash(x,3)%20; rect(x,66-hh,8,hh,'#8a5a4a'); rect(x+2,66-hh+4,2,2,'#f6d27a'); }
  rect(0,66,192,42,'#d2b88a'); rect(0,66,192,2,'#e8cfa2');
  for(let i=0;i<30;i++) { const n=hash(i,13); rect(n%192,70+(n>>>8)%34,3,1,'#b89a6a'); }
  rect(20,84,12,2,'#e8584a'); rect(25,80,2,10,'#e8584a');
}
drawLABattleBg=function(t) {
  const g=studioGround(currentMap),lab=B2.active&&B2.labStudio;
  if(!g&&!lab) return LE_drawLABattleBg_lot(t);
  drawStudioBattleBg(t,g==='stage');
};
