'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp?v=20261030b',px:64,img:null,ready:false}, row:{src:'art/row.webp',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08}, grands:{src:'art/grands.webp?v=20261030',px:78,img:null,ready:false,square:true}, elliehouse:{src:'art/elliehouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, library:{src:'art/library.webp?v=20261030',px:78,img:null,ready:false,square:true}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp?v=20261030',px:78,img:null,ready:false,square:true}, greenhouse:{src:'art/greenhouse.webp?v=20261030',px:78,img:null,ready:false,square:true}, shop:{src:'art/shop.webp?v=20261030',px:78,img:null,ready:false,square:true}, observatory:{src:'art/observatory.webp?v=20261030',px:78,img:null,ready:false,square:true}, post:{src:'art/post.webp?v=20261030',px:78,img:null,ready:false,square:true}, tea:{src:'art/tea.webp?v=20261030',px:78,img:null,ready:false,square:true}, jpark:{src:'art/jpark.webp?v=20261029',px:64,img:null,ready:false}, griffith:{src:'art/griffith.webp',px:64,img:null,ready:false}, taxi:{src:'art/taxi.webp?v=20261030',px:78,img:null,ready:false,square:true}, blvd:{src:'art/blvd.webp',px:64,img:null,ready:false} };
PLATES.pier={src:'art/pier.webp?v=20261029',px:64,img:null,ready:false};
PLATES.studio={src:'art/studio.webp?v=20261029',px:64,img:null,ready:false};
PLATES.backlot={src:'art/backlot.webp?v=20261029',px:64,img:null,ready:false};
PLATES.stageset={src:'art/stageset.webp?v=20261029',px:64,img:null,ready:false};
PLATES.oakpark={src:'art/oakpark.webp?v=20261029',px:64,img:null,ready:false};
PLATES.stage7={src:'art/stage7.webp?v=20261029',px:64,img:null,ready:false};
PLATES.oak={src:'art/oak.webp?v=20261029',px:64,img:null,ready:false};
PLATES.crown={src:'art/crown.webp?v=20261029',px:64,img:null,ready:false};
PLATES.lofts={src:'art/lofts.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.loftlobby={src:'art/loftlobby.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
// Tom's house: two painted rooms, the main floor (16 x 24 tiles) and the primary suite (16 x 15), both 64 art px per tile.
PLATES.tomhouse={src:'art/tomhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08};
PLATES.carbarn={src:'art/carbarn.webp?v=20261029',px:64,img:null,ready:false};
PLATES.coffee={src:'art/coffee.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.boiler={src:'art/boilerroom.webp?v=20261029',px:64,img:null,ready:false};
PLATES.ramen={src:'art/ramen.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.tomsuite={src:'art/tomsuite.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08};
PLATES.juicebar={src:'art/juicebar.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.cinema={src:'art/starlite.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.boards={src:'art/boards.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.lacab={src:'art/lacab.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.nickels={src:'art/nickels.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.pupuseria={src:'art/pupuseria.webp?v=20261030b',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.wardrobe={src:'art/wardrobe.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.creole={src:'art/creole.webp?v=20261030b',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.casa={src:'art/casa.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.jordansam={src:'art/jordansam.webp?v=20261030b',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.tower={src:'art/tower.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.gate00={src:'art/gate00.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.towerlobby={src:'art/towerlobby.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.subtunnel={src:'art/subtunnel.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.subchamber={src:'art/subchamber.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.dakota={src:'art/dakota.webp?v=20261030b',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.concourse={src:'art/concourse.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.flightzero={src:'art/flightzero.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.towerstairs={src:'art/towerstairs.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.subdepot={src:'art/subdepot.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.towervault={src:'art/towervault.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.memrose={src:'art/memrose.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.memtnb={src:'art/memtnb.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.memamy={src:'art/memamy.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.memgrace={src:'art/memgrace.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.towershelves={src:'art/towershelves.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.towerpinnacle={src:'art/towerpinnacle.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.deadletter={src:'art/deadletter.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.schoolyard={src:'art/schoolyard.webp?v=20261029',px:64,img:null,ready:false};
PLATES.foreverheart={src:'art/foreverheart.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
PLATES.stillcore={src:'art/stillcore.webp?v=20261029',px:64,img:null,ready:false,actorScale:1.98};
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
for(const id of ['bakery','library','greenhouse','shop','observatory','post','tea','taxi','grands','elliehouse','juicebar']) PLATES[id].actorScale=INTERIOR_ACTOR_SCALE;
// Tom (2026-10-30): after the interiors were enlarged to fill the phone screen, everyone inside is 20% bigger again. One multiplier
// here covers the family, the followers and every townsperson, since they all draw through actorK().
const INTERIOR_ACTOR_BOOST=1.2;
// Outdoor maps (the streets, parks and yards): Tom asked for 20% bigger.
const OUTDOOR_ACTOR_SCALE=1.2;
function actorK() {
  if(!currentMap) return 1;
  const p=PLATES[currentMap.id];
  if(p&&p.actorScale&&!currentMap.outside) return p.actorScale*INTERIOR_ACTOR_BOOST;
  return currentMap.outside?OUTDOOR_ACTOR_SCALE:1;
}

// Live touches drawn over a painting. Gate 00: after chapter 11 the Long Island dome (left window) goes amber, as it did on the tile version.
// Bready Mercury, Tom's sourdough starter, sitting on the kitchen island in Tom's house. Painted live over the plate (the painting has an empty counter).
// Same jar as the starter moves: glass, cream starter, gold lid, a MERCURY label (here with a tiny face and mustache), plus a crown. cx, by = jar centre and base in map px.
function drawBreadyJar(cx,by,u,time) {
  const R=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+x*u,by+y*u,w*u,h*u); };
  const OUT='#2b2a26', top=-19+1.2*Math.sin(time*1.3);
  ctx.save();
  ctx.fillStyle='rgba(60,40,20,.30)'; ctx.beginPath(); ctx.ellipse(cx+2*u,by+1*u,17*u,3.6*u,0,0,Math.PI*2); ctx.fill();
  R(-14,-31,28,32,OUT); R(-13,-30,26,30,'#cfe6ee');
  R(-13,top,26,-top,'#efe3c8'); R(-13,top-1,26,1,'#fff8e8');
  for(let k=0;k<4;k++) { const t=(time*.45+k*.27)%1, bx=-9+k*6, byy=-2+t*(top+3); ctx.globalAlpha=t>.8?(1-t)*5:1; R(bx,byy,2,2,'#fff8e8'); }
  ctx.globalAlpha=1;
  R(-11,-28,2,22,'rgba(255,255,255,.55)');
  R(-14,-38,28,7,OUT); R(-13,-37,26,5,'#c9a03e'); R(-11,-37,22,1,'#e6c46a');
  R(-6,-43,12,5,OUT); R(-5,-42,10,3,'#e8b923'); R(-5,-45,2,3,'#e8b923'); R(-1,-46,2,4,'#e8b923'); R(3,-45,2,3,'#e8b923');
  R(-9,-15,18,10,OUT); R(-8,-14,16,8,'#f6efdc'); R(-5,-12,2,2,OUT); R(3,-12,2,2,OUT); R(-5,-8,10,2,OUT); R(-6,-7,2,1,OUT); R(4,-7,2,1,OUT);
  ctx.restore();
}
// Painted sign boards that the game letters live, so the spelling is always right and the letters stay sharp on a phone.
// The painting leaves each board blank (tools/town_signs.py). x, y, w, h = the board's writing face in art px (64 per tile);
// t = one or two lines; light = cream letters on a dark board (the green exit boards), otherwise dark ink on cream.
const PLATE_SIGNS={ town:[
  {x:135,y:303,w:216,h:72,t:['CRUMB','BAKERY']},
  {x:629,y:295,w:216,h:72,t:['HUSH','LIBRARY']},
  {x:1075,y:304,w:216,h:72,t:['SPROUT','HOUSE']},
  {x:1450,y:304,w:216,h:72,t:["PENNY'S",'POCKETS']},
  {x:127,y:1035,w:216,h:72,t:['SNAIL','MAIL']},
  {x:638,y:1035,w:216,h:72,t:['KETTLE','COTTAGE']},
  {x:1089,y:1037,w:216,h:72,t:['MOON','CLUB']},
  {x:1517,y:1037,w:216,h:72,t:['TAXI','CO.']},
  // exits: north steps to Grump Hollow, south street to Rivituso Row, east opening to the school
  {x:455,y:33,w:204,h:60,t:['GRUMP','HOLLOW'],light:true},
  {x:868,y:1376,w:192,h:62,t:['RIVITUSO','ROW'],light:true},
  {x:1783,y:445,w:123,h:55,t:['SCHOOL'],light:true}
] };
function drawPlateSigns(list) {
  const s=T/64;
  ctx.save();
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const b of list) {
    const n=b.t.length, fw=b.w*s, fh=b.h*s, cx=(b.x+b.w/2)*s, cy=(b.y+b.h/2)*s, lh=fh/n;
    let size=lh*.86;
    const font=z=>'bold '+z+'px Georgia, "Times New Roman", serif';
    ctx.font=font(size);
    let wide=0; for(const l of b.t) wide=Math.max(wide,ctx.measureText(l).width);
    if(wide>fw*.9) { size*=fw*.9/wide; ctx.font=font(size); }
    b.t.forEach((l,i)=>{
      const y=cy+(i-(n-1)/2)*lh+size*.05, d=Math.max(.5,size*.045);
      ctx.fillStyle=b.light?'#10241a':'#fff7de'; ctx.fillText(l,cx,y+d);
      ctx.fillStyle=b.light?'#f6ecc8':'#3b2a1a'; ctx.fillText(l,cx,y);
    });
  }
  ctx.restore();
}
function plateLive(map,time) {
  if(map&&PLATE_SIGNS[map.id]) drawPlateSigns(PLATE_SIGNS[map.id]);
  // Tom's kitchen island: Bready Mercury, except while the squirrels have him (chapter 6, until the Oak boss is beaten).
  if(map&&map.id==='tomhouse'&&!(typeof storyMatch==='function'&&storyMatch({chapter:6,notFlag:'ch6-clear'}))) drawBreadyJar(918*T/78.4,322*T/78.4,1.1*T/78.4,time);
  if(!map||map.id!=='gate00'||typeof infFlag!=='function'||!infFlag('ch11-closed')) return;
  const s=T/64, cx=478*s, cy=98*s, r=96*s;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx,cy+6*s,92*s,66*s,0,0,Math.PI*2); ctx.clip();
  const g=ctx.createRadialGradient(cx,cy,4*s,cx,cy,r);
  g.addColorStop(0,'rgba(255,170,64,.78)'); g.addColorStop(.7,'rgba(238,132,38,.66)'); g.addColorStop(1,'rgba(214,110,30,.40)');
  ctx.globalAlpha=.92+.08*Math.sin(time*2.2);
  ctx.fillStyle=g; ctx.fillRect(cx-r,cy-r,r*2,r*2);
  ctx.restore();
}
