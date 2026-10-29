'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp',px:64,img:null,ready:false}, row:{src:'art/row.webp',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp',px:64,img:null,ready:false}, grands:{src:'art/grands.webp',px:64,img:null,ready:false}, elliehouse:{src:'art/elliehouse.webp',px:64,img:null,ready:false}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, library:{src:'art/library.webp',px:64,img:null,ready:false}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp',px:64,img:null,ready:false}, greenhouse:{src:'art/greenhouse.webp',px:64,img:null,ready:false}, shop:{src:'art/shop.webp',px:64,img:null,ready:false}, observatory:{src:'art/observatory.webp',px:64,img:null,ready:false}, post:{src:'art/post.webp',px:64,img:null,ready:false}, tea:{src:'art/tea.webp',px:64,img:null,ready:false}, jpark:{src:'art/jpark.webp?v=20261029',px:64,img:null,ready:false}, griffith:{src:'art/griffith.webp',px:64,img:null,ready:false}, taxi:{src:'art/taxi.webp',px:64,img:null,ready:false}, blvd:{src:'art/blvd.webp',px:64,img:null,ready:false} };
PLATES.pier={src:'art/pier.webp?v=20261029',px:64,img:null,ready:false};
PLATES.studio={src:'art/studio.webp?v=20261029',px:64,img:null,ready:false};
PLATES.backlot={src:'art/backlot.webp?v=20261029',px:64,img:null,ready:false};
PLATES.stageset={src:'art/stageset.webp?v=20261029',px:64,img:null,ready:false};
PLATES.lofts={src:'art/lofts.webp',px:64,img:null,ready:false};
PLATES.loftlobby={src:'art/loftlobby.webp',px:64,img:null,ready:false};
// Tom's house: two painted rooms, the main floor (16 x 24 tiles) and the primary suite (16 x 15), both 64 art px per tile.
PLATES.tomhouse={src:'art/tomhouse.webp',px:64,img:null,ready:false,actorScale:1.98};
PLATES.tomsuite={src:'art/tomsuite.webp',px:64,img:null,ready:false,actorScale:1.98};
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

// Interiors: the painted rooms are drawn at furniture scale, so the cast is drawn bigger inside them than on the streets
// (a counter or a sofa should come up to a character's waist, not their knees). Measured from the Taxi desk, Amy's island and sofa,
// the bakery counter and the dining chairs: adults wanted about 1.8x their street size, then Tom asked for 10% more: 1.98x. Feet stay on the same tile, the sprite grows upward.
const INTERIOR_ACTOR_SCALE=1.98;
for(const id of ['bakery','library','greenhouse','shop','observatory','post','tea','taxi','amyhouse','grands','elliehouse','loftlobby','lofts']) PLATES[id].actorScale=INTERIOR_ACTOR_SCALE;
// Outdoor maps (the streets, parks and yards): Tom asked for 20% bigger.
const OUTDOOR_ACTOR_SCALE=1.2;
function actorK() {
  if(!currentMap) return 1;
  const p=PLATES[currentMap.id];
  if(p&&p.actorScale&&!currentMap.outside) return p.actorScale;
  return currentMap.outside?OUTDOOR_ACTOR_SCALE:1;
}
