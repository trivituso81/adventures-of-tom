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
// Atlas: one image of equally sized frames at K times the rows' resolution (K = 2 in battle, 3 on the overworld).
const PAINTED={};
function paintedAtlas(id,src,rects,k) {
  const a={id,rects,k,img:new Image(),ready:false,failed:false};
  a.img.onload=()=>{ a.ready=true; };
  a.img.onerror=()=>{ a.failed=true; };
  a.img.src=src;
  PAINTED[id]=a;
  return a;
}
function paintRows(rows,atlas,frame,flip) { rows._paint={a:atlas,f:frame,flip:!!flip}; return rows; }
// Recolour the dark shirt pixels of a painted frame to an outfit colour, keeping the painted shading.
function paintedTintPixels(g,w,h,rowRange,k,hex,mode) {
  const y0=Math.max(0,Math.floor(rowRange[0]*k)),y1=Math.min(h-1,Math.ceil((rowRange[1]+1)*k));
  if(y1<=y0) return;
  const cr=parseInt(hex.slice(1,3),16),cg=parseInt(hex.slice(3,5),16),cb=parseInt(hex.slice(5,7),16);
  const im=g.getImageData(0,y0,w,y1-y0),d=im.data;
  for(let i=0;i<d.length;i+=4) {
    if(d[i+3]<8) continue;
    const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b);
    let f;
    if(mode==='coral') {                                // a coral tunic (Rose): strongly red over green, not skin
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
  const A=typeof p.a==='string'?PAINTED[p.a]:p.a; if(!A||!A.ready) return null;
  const R=A.rects[p.f]; if(!R) return null;
  const t=activeTint;
  const key=(p.flip?'f':'n')+(flash?'F':'')+(t&&!flash?(t.rows.join(',')+t.color):'');
  const cache=rows._pc||(rows._pc=new Map());
  let c=cache.get(key); if(c) return c;
  c=document.createElement('canvas'); c.width=R[2]; c.height=R[3];
  const g=c.getContext('2d');
  if(p.flip) { g.translate(R[2],0); g.scale(-1,1); }
  g.drawImage(A.img,R[0],R[1],R[2],R[3],0,0,R[2],R[3]);
  g.setTransform(1,0,0,1,0,0);
  if(flash) { g.globalCompositeOperation='source-in'; g.fillStyle='#fff8e6'; g.fillRect(0,0,R[2],R[3]); g.globalCompositeOperation='source-over'; }
  else if(t&&t.rows) paintedTintPixels(g,R[2],R[3],t.rows,A.k,t.color,A.tintMode);
  cache.set(key,c);
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
