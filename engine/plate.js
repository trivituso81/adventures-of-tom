'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp',px:64,img:null,ready:false}, row:{src:'art/row.webp',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp',px:64,img:null,ready:false}, grands:{src:'art/grands.webp',px:64,img:null,ready:false}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp',px:64,img:null,ready:false} };
function plateFor(map) {
  const p=map&&PLATES[map.id];
  if(!p) return null;
  plateLoad(p);
  return p.ready?p:null;
}
function plateLoad(p) {
  if(p.img) return;
  p.img=new Image();
  const done=()=>{p.ready=true;};
  p.img.onload=()=>{ if(p.img.decode) p.img.decode().then(done,done); else done(); };
  p.img.onerror=()=>{p.failed=true;};
  p.img.src=p.src;
}
// True while a painted map's art is still loading: draw a plain backdrop, never the old tile version.
function plateHold(map) { const p=map&&PLATES[map.id]; return !!(p&&!p.ready&&!p.failed); }
// Start every plate loading at boot so it is decoded long before the player walks there.
for(const k in PLATES) plateLoad(PLATES[k]);
// Render the backing store at device resolution on plate maps so the painting stays sharp.
function plateSetK(want) {
  if(want===plateSetK.k) return;
  plateSetK.k=want;
  canvas.width=W*want; canvas.height=H*want;
  ctx.imageSmoothingEnabled=false;
}
plateSetK.k=1;
