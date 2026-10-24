'use strict';
// engine/marsh-render.js — The look of chapter 3's Cattail Pier and Whispering Marsh: 'boards' tiles (a wooden pier or
// boardwalk over water), and the objects cattail, reedwall, shack (Reel's bait shack), rowboat, tacklebox and sundial.
// Wraps drawOutdoorTile, drawObject and buildMiniBase (after engine/la-render.js). Loaded after engine/la-render.js.
const LE_drawOutdoorTile_marsh=drawOutdoorTile,LE_drawObject_marsh=drawObject,LE_buildMiniBase_marsh=buildMiniBase;
const isBoards=(x,y)=>within(currentMap,x,y)&&currentMap.tiles[y][x]==='boards';

drawOutdoorTile=function(x,y,type,time) {
  if(type!=='boards') return LE_drawOutdoorTile_marsh(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  // Water underneath, then planks. Planks run across the way people walk: a north-south pier gets crosswise planks.
  rect(px,py,T,T,'#6f9a98'); rect(px,py+2,T,T-4,'#82b3b1');
  const L=isBoards(x-1,y),R=isBoards(x+1,y),U=isBoards(x,y-1),D=isBoards(x,y+1);
  const ns=(U||D)&&!(L||R)||((U||D)&&(L||R)&&!(L&&R));
  const x0=L?0:3,x1=R?T:T-3,y0=U?0:3,y1=D?T:T-3;
  rect(px+x0,py+y0,x1-x0,y1-y0,'#5a4430');
  if(ns) for(let k=0;k<4;k++) { const yy=py+y0+1+k*8; if(yy+6>py+y1) break;
    rect(px+x0+1,yy,x1-x0-2,6,['#b08a5a','#a8814f','#b8925f','#a07a4c'][(n+k)%4]); rect(px+x0+1,yy,x1-x0-2,1,'#cfae7c');
    rect(px+x0+4,yy+2,1,1,'#5a4430'); rect(px+x1-6,yy+2,1,1,'#5a4430'); }
  else for(let k=0;k<4;k++) { const xx=px+x0+1+k*8; if(xx+6>px+x1) break;
    rect(xx,py+y0+1,6,y1-y0-2,['#b08a5a','#a8814f','#b8925f','#a07a4c'][(n+k)%4]); rect(xx,py+y0+1,1,y1-y0-2,'#cfae7c');
    rect(xx+2,py+y0+4,1,1,'#5a4430'); rect(xx+2,py+y1-6,1,1,'#5a4430'); }
  // Posts at the open ends, and a little ripple where the water meets them.
  if(!L) { rect(px+1,py+y0+2,4,6,OUT); rect(px+2,py+y0+3,2,4,'#7d6040'); }
  if(!R) { rect(px+T-5,py+y1-8,4,6,OUT); rect(px+T-4,py+y1-7,2,4,'#7d6040'); }
  const ph=(Math.floor(time*2)+n)%4;
  if(!D) rect(px+6+ph,py+T-2,8,1,'#c0dccb');
};

drawObject=function(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  if(o.kind==='cattail'||o.kind==='reedwall') {
    const tall=o.kind==='reedwall',sway=Math.sin(time*1.6+n%7)*2;
    const stems=tall?7:4;
    if(!tall) ellipse(cx,b-3,12,4,'#34533b38');
    for(let k=0;k<stems;k++) {
      const sx=x+4+((n>>>(k*3))%(T-8)),hh=(tall?44:26)+((n>>>(k*2))%10),top=b-hh,lean=sway*(k%2?1:.6);
      rect(Math.round(sx+lean*.5),top,2,hh,OUT); rect(Math.round(sx+lean*.5),top+1,1,hh-2,tall?'#6f8f4c':'#7aa05a');
      if(!tall||k%2===0) { rect(Math.round(sx+lean)-1,top-8,4,9,OUT); rect(Math.round(sx+lean),top-7,2,7,'#7a4a2a'); rect(Math.round(sx+lean),top-7,1,3,'#9a6a3a'); }
      // a leaf
      rect(Math.round(sx+lean*.3)-3,top+hh*.5,3,1,'#5f8a4d');
    }
    if(tall) { rect(x,b-8,T,8,'#5a7a42'); for(let k=0;k<T;k+=4) rect(x+k,b-12-(k*7+n)%6,2,8,'#6f8f4c'); }
    return;
  }
  if(o.kind==='shack') {
    ellipse(cx,b-2,w/2,6,'#34533b38');
    rect(x+2,y-18,w-4,h+16,OUT); rect(x+3,y-17,w-6,h+14,'#8a6a48');
    for(let k=y-15;k<b-2;k+=6) rect(x+3,k,w-6,1,'#6f5338');
    rect(x-4,y-26,w+8,12,OUT); rect(x-3,y-25,w+6,10,'#5f7d5a'); rect(x-3,y-25,w+6,2,'#7fa07a');
    rect(cx-20,y-10,40,12,OUT); rect(cx-19,y-9,38,10,'#efe0b8'); label('BAIT',cx,y-7,'#7a3a3a');
    rect(x+8,y+12,16,b-y-14,OUT); rect(x+9,y+13,14,b-y-16,'#5a4430'); rect(x+20,y+24,2,2,'#e0c070');
    rect(x+w-26,y+12,16,12,OUT); rect(x+w-25,y+13,14,10,'#9fd0d8'); rect(x+w-25,y+13,14,2,'#d8f0f4');
    rect(x+w-14,b-12,10,10,OUT); rect(x+w-13,b-11,8,8,'#4f7d9a'); label('W',x+w-9,b-9,'#d8f0f4');
    return;
  }
  if(o.kind==='rowboat') {
    const bob=Math.round(Math.sin(time*1.4)*1.5);
    ellipse(cx,b-8+bob,w/2-2,9,OUT); ellipse(cx,b-9+bob,w/2-4,7,'#b4553f'); ellipse(cx,b-10+bob,w/2-8,4,'#7a4a2a');
    rect(cx-2,b-14+bob,4,8,'#c9a27a'); rect(x+4,b-12+bob,1,6,'#efe0b8');
    return;
  }
  if(o.kind==='tacklebox') {
    ellipse(cx,b-3,12,4,'#34533b38');
    rect(x+4,y+12,24,14,OUT); rect(x+5,y+13,22,12,'#4f7d6a'); rect(x+5,y+13,22,3,'#6f9f8a');
    rect(x+12,y+8,8,6,OUT); rect(x+13,y+9,6,3,'#2b3a33'); rect(x+15,y+18,2,3,'#e0c070');
    return;
  }
  if(o.kind==='sundial') {
    // A mossy stone pillar with a round dial on top. Its shadow points at the wrong hour until the coin is out (ch3-coin).
    const fixed=typeof flag==='function'&&flag('ch3-coin');
    ellipse(cx,b-3,26,6,'#34533b38');
    rect(cx-10,y+4,20,h-6,OUT); rect(cx-9,y+5,18,h-8,'#a9aa98'); rect(cx-9,y+5,4,h-8,'#c2c3b0'); rect(cx-3,y+12,6,2,'#6f8f4c');
    rect(cx-14,b-6,28,5,OUT); rect(cx-13,b-5,26,3,'#8f907e');
    ellipse(cx,y+2,25,10,OUT); ellipse(cx,y+1,24,9,'#c9c9b4'); ellipse(cx,y,21,7,'#e0dfc8');
    for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; rect(Math.round(cx+Math.cos(a)*17)-1,Math.round(y+Math.sin(a)*5.5),2,1,'#7a7a68'); }
    rect(cx-8,y-2,3,2,'#6f8f4c'); rect(cx+9,y+3,4,2,'#6f8f4c');
    // The gnomon and its shadow.
    for(let k=0;k<7;k++) rect(cx-1+Math.round(k*.6),y-10+k,2,1,OUT);
    rect(cx-1,y-10,2,10,OUT); rect(cx,y-9,1,8,'#9a9a86');
    const ang=fixed?2.2:-0.5;
    for(let k=2;k<16;k++) rect(Math.round(cx+Math.cos(ang)*k),Math.round(y+1+Math.sin(ang)*k*.35),1,1,'#5a5a4a');
    if(!fixed) { const tw=(Math.floor(time*3)%5)===0; rect(cx-3,y-6,5,5,OUT); rect(cx-2,y-5,3,3,'#f2c94c'); rect(cx-2,y-5,1,1,'#fff6c0'); if(tw) { rect(cx+3,y-9,1,3,'#fff6c0'); rect(cx+2,y-8,3,1,'#fff6c0'); } }
    return;
  }
  return LE_drawObject_marsh(o,time);
};

buildMiniBase=function(map) {
  const c=LE_buildMiniBase_marsh(map);
  if(!map.tiles.some(r=>r.includes('boards'))) return c;
  const b=c.getContext('2d'); b.fillStyle='#b08a5a';
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) if(map.tiles[y][x]==='boards') b.fillRect(x*2,y*2,2,2);
  return c;
};
