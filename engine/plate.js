'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp',px:64,img:null,ready:false}, row:{src:'art/row.webp',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp',px:64,img:null,ready:false} };
function plateFor(map) {
  const p=map&&PLATES[map.id];
  if(!p) return null;
  if(!p.img) { p.img=new Image(); p.img.onload=()=>{p.ready=true;}; p.img.src=p.src; }
  return p.ready?p:null;
}
// Render the backing store at device resolution on plate maps so the painting stays sharp.
function plateSetK(want) {
  if(want===plateSetK.k) return;
  plateSetK.k=want;
  canvas.width=W*want; canvas.height=H*want;
  ctx.imageSmoothingEnabled=false;
}
plateSetK.k=1;
