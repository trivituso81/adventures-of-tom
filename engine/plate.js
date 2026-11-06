'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp?v=square6',fgSrc:'art/town-fg.webp?v=square6',px:64,img:null,ready:false}, row:{src:'art/row.webp?v=row3',fgSrc:'art/row-fg.webp?v=row3',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp?v=hollow5',fgSrc:'art/hollow-fg.webp?v=hollow5',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08,fgSrc:'art/amyhouse-fg.webp?v=amyhouse3d'}, grands:{src:'art/grands.webp?v=20261030',px:78,img:null,ready:false,square:true,fgSrc:'art/grands-fg.webp?v=grands3d'}, elliehouse:{src:'art/elliehouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, library:{src:'art/library.webp?v=20261030',px:78,img:null,ready:false,square:true}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp?v=20261030',px:78,img:null,ready:false,square:true}, greenhouse:{src:'art/greenhouse.webp?v=20261030',px:78,img:null,ready:false,square:true}, shop:{src:'art/shop.webp?v=20261030',px:78,img:null,ready:false,square:true}, observatory:{src:'art/observatory.webp?v=20261030',px:78,img:null,ready:false,square:true}, post:{src:'art/post.webp?v=20261030',px:78,img:null,ready:false,square:true}, tea:{src:'art/tea.webp?v=20261030',px:78,img:null,ready:false,square:true}, jpark:{src:'art/jpark.webp?v=20261029',px:64,img:null,ready:false}, griffith:{src:'art/griffith.webp',px:64,img:null,ready:false}, taxi:{src:'art/taxi.webp?v=20261030',px:78,img:null,ready:false,square:true}, blvd:{src:'art/blvd.webp?v=20261031d',px:64,img:null,ready:false} };
PLATES.pier={src:'art/pier.webp?v=20261029',px:64,img:null,ready:false};
PLATES.studio={src:'art/studio.webp?v=20261029',px:64,img:null,ready:false};
PLATES.backlot={src:'art/backlot.webp?v=20261029',px:64,img:null,ready:false};
PLATES.stageset={src:'art/stageset.webp?v=20261029',px:64,img:null,ready:false};
PLATES.oakpark={src:'art/oakpark.webp?v=20261029',px:64,img:null,ready:false};
PLATES.stage7={src:'art/stage7.webp?v=20261029',px:64,img:null,ready:false};
PLATES.oak={src:'art/oak.webp?v=20261031',px:64,img:null,ready:false};
PLATES.crown={src:'art/crown.webp?v=20261029',px:64,img:null,ready:false};
PLATES.lofts={src:'art/lofts.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
PLATES.loftlobby={src:'art/loftlobby.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98};
// Tom's house: two painted rooms, the main floor (16 x 24 tiles) and the primary suite (16 x 15), both 64 art px per tile.
PLATES.tomhouse={src:'art/tomhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08,fgSrc:'art/tomhouse-fg.webp?v=tomhouse3d'};
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
// Painted maps load on demand (2026-11-01, `plate1`). The old code started all 77 paintings at boot: 41 MB of files and about 520 MB once the
// phone decodes them into pictures, which an iPhone cannot hold, so the first map came up late or not at all. Now: the map you are on loads
// first, then the maps you can walk into (its exits, house doors and the way back out), one at a time, and only the last PLATE_KEEP
// paintings stay in memory (about 100 MB). Anything else is dropped and loads again from the browser cache if you return.
const PLATE_KEEP=5, PLATE_TRIES=4;
const PLATE_RECENT=[];   // map ids, most recently focused first
// The maps one step away (exits, house doors, the way back out), outdoor ones first then nearest door, at most PLATE_AHEAD of them: the Square has 11 doors and
// loading every interior would bring back the memory problem. A farther door just loads when you walk in.
const PLATE_AHEAD=12;   // every door and edge on the map, nearest first. Rooms are small (1254 px square, about 6 MB decoded), so all of them are cheap to hold; the big outdoor paintings are only the 2 to 4 edge neighbours.
function plateNeighbours(map) {
  const best=new Map(), pl=typeof player!=='undefined'?player:null;
  if(map&&map.portals) for(const [k,q] of map.portals) {
    let id=null;
    if(q.kind==='enter'&&q.house) id=q.house.enterMap||q.house.id;
    else if(q.kind==='edge'&&q.to) id=q.to;
    else if(q.kind==='exit'&&q.house&&q.house.area) id=q.house.area;
    if(!id||!PLATES[id]||id===map.id) continue;
    const [x,y]=k.split(',').map(Number), d=(pl?Math.abs(pl.x-x)+Math.abs(pl.y-y):0)+(q.kind==='edge'?6:0);
    if(!best.has(id)||d<best.get(id)) best.set(id,d);
  }
  return [...best].sort((a,b)=>a[1]-b[1]).slice(0,PLATE_AHEAD).map(e=>e[0]);
}
// Called every frame from plateFor; does its work only when the map changes.
function plateFocus(map) {
  if(!map||plateFocus.id===map.id) return;
  plateFocus.id=map.id;
  const i=PLATE_RECENT.indexOf(map.id); if(i>=0) PLATE_RECENT.splice(i,1);
  PLATE_RECENT.unshift(map.id);
  plateFocus.queue=plateNeighbours(map);
  const keep=new Set([...PLATE_RECENT.slice(0,PLATE_KEEP),...plateFocus.queue]);
  for(const k in PLATES) if(!keep.has(k)) plateDrop(PLATES[k]);
}
function plateDrop(p) { if(!p.img&&!p.fgImg) return; p.img=null; p.ready=false; p.failed=false; p.tries=0; p.fgImg=null; }
// Load one queued neighbour at a time, and only once the current map's painting is on screen, so a neighbour never slows the map you are on.
function platePump(map) {
  const cur=map&&PLATES[map.id];
  if(cur&&!cur.ready&&!cur.failed) return;
  for(const k in PLATES) { const p=PLATES[k]; if(p.img&&!p.ready&&!p.failed) return; }
  const q=plateFocus.queue; if(!q) return;
  while(q.length) { const p=PLATES[q.shift()]; if(p&&!p.img&&!p.failed) { plateLoad(p); return; } }
}
function plateFor(map) {
  const p=map&&PLATES[map.id];
  if(!p) return null;
  plateFocus(map);
  plateLoad(p);
  platePump(map);
  return p.ready?p:null;
}
function plateLoad(p) {
  if(p.img||p.failed||performance.now()<(p.retryAt||0)) return;
  const im=new Image();
  p.img=im;
  const done=()=>{ if(p.img===im) p.ready=true; };
  im.onload=()=>{ if(im.decode) im.decode().then(done,done); else done(); };
  // A failed download (a dropped connection, a phone short of memory) tries again after a pause instead of giving up for the whole session.
  im.onerror=()=>{ if(p.img!==im) return; p.img=null; p.ready=false; p.tries=(p.tries||0)+1; if(p.tries>=PLATE_TRIES) p.failed=true; else p.retryAt=performance.now()+1000*p.tries; };
  im.src=p.src;
  if(p.fgSrc&&!p.fgImg) { p.fgImg=new Image(); p.fgImg.src=p.fgSrc; }
}
// True while a painted map's art is still loading (or waiting to retry): draw a plain backdrop, never the old tile version.
function plateHold(map) { const p=map&&PLATES[map.id]; return !!(p&&!p.ready&&!p.failed); }
// Boot: only the starting map. Neighbours follow once it is ready (platePump).
try { if(typeof currentMap!=='undefined') plateFocus(currentMap); } catch(e) {}
if(typeof currentMap!=='undefined'&&currentMap&&PLATES[currentMap.id]) plateLoad(PLATES[currentMap.id]);
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
function drawBreadyJar(cx,by,u,time,lift=0,alpha=1) {
  // Painted prop (art/props/tom/sourdough_starter_jar.webp, the same jar the Starter Splash move uses). cx, by = jar centre and base; u scales it.
  // lift = pixels the jar has risen off its spot, alpha = fade (the crown pickup, see crownJarShown).
  const im=PROPART.get('tom/sourdough_starter_jar');
  if(!(im.complete&&im.naturalWidth)) return;
  const h=50*u, w=h*im.naturalWidth/im.naturalHeight;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(60,40,20,'+(.30*(1-Math.min(1,lift/(40*u))*.6))+')'; ctx.beginPath(); ctx.ellipse(cx+1*u,by,w*.42,3.4*u,0,0,Math.PI*2); ctx.fill();
  ctx.imageSmoothingEnabled=true; if('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality='high';
  ctx.drawImage(im,cx-w/2,by-h+1*u-lift,w,h);
  ctx.restore();
}
// Chapter 6: Bready Mercury sits on the chest in the middle of the hoard in the Crown of the Oak (the painting has no jar) until Tom takes him
// (SCENES.ch6AfterBoss sets CROWN_JAR_T0 and the flag ch6-take; the jar then lifts and fades over CROWN_JAR_PICKUP seconds). ch6-take is 'pending'
// while that scene runs, so the jar stays through the Chairman's goodbye even though ch6-clear is already set. Saves from before this fix have
// ch6-clear and no ch6-take, so they never show it.
let CROWN_JAR_T0=0; const CROWN_JAR_PICKUP=.8;
function crownJarState() {
  if(typeof storyMatch!=='function'||!storyMatch({mode:'full',chapter:6})) return null;
  const take=STORY.flags['ch6-take'];
  if(take===true) { const k=(performance.now()-CROWN_JAR_T0)/1000/CROWN_JAR_PICKUP; return k<1?k:null; }
  return (take==='pending'||!STORY.flags['ch6-clear'])?0:null;
}
// Painted sign boards that the game letters live, so the spelling is always right and the letters stay sharp on a phone.
// The painting leaves each board blank (tools/row_signs.py). x, y, w, h = the board's writing face in art px (64 per tile);
// t = one or two lines; light = cream letters on a dark board (the green exit boards), otherwise dark ink on cream.
const PLATE_SIGNS={ town:[], // The Square's boards are painted with lettering now (docs/AREA_PAINTINGS.md)
row:[],   // Rivituso Row: every board and house sign is painted with its lettering (`row3`)
hollow:[]   // Grump Hollow: the exit board is painted with its lettering (`hollow5`); the old game-drawn wooden signs are gone
};
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
// Walk-behind (2026-10-30, Square first): zones are the painted pixels of tall things (exit boards and posts, tree canopies) in art px
// (64 per tile). base = art y where the thing stands on the ground. An actor whose feet are north of base (on screen: behind it) and whose
// body overlaps the zone gets that slice of the painting drawn over it again, so Tom walks behind the tree and under the board.
// Zones hold only the tall object, never the ground in front of it. rect: x,y,w,h. ellipse: cx,cy,rx,ry. polygon: pts [[x,y],...].
// A lamp post as three small shapes (head, pole, foot) so no paving is redrawn beside the pole. cx is the pole centre, y0 the top of the head, base the foot.
const BLVD_LAMP=(cx,y0,base)=>[{x:cx-20,y:y0,w:40,h:52,base},{x:cx-8,y:y0+50,w:16,h:Math.max(10,base-y0-80),base},{x:cx-22,y:base-34,w:44,h:34,base}];
const PLATE_BEHIND={// DOWNTOWN LA: the JEFFERSON PARK arch (board and both posts with their globe lamps), so Tom walks behind the posts and under the board.
blvd:[
  // Everything below is a cutout from art/blvd-fg.webp (tools/make_blvd_fg.py, pass 3: lamps, truck, marquee, gate, arch and awnings cut by
  // colour and GrabCut), so the rects can be loose: only the object's own pixels are drawn over Tom.
  // Jefferson Park arch: board and both posts with their globe lamps
  {x:800,y:1410,w:300,h:106,base:1568,fg:true},{x:754,y:1390,w:80,h:186,base:1568,fg:true},{x:1066,y:1390,w:80,h:186,base:1568,fg:true},
  // Griffith Park gate: board and both posts (Tom climbs the steps and disappears under the board)
  {x:32,y:236,w:186,h:96,base:340,fg:true},{x:0,y:224,w:70,h:144,base:340,fg:true},{x:186,y:208,w:66,h:146,base:340,fg:true},
  // shop awnings and the Starlite marquee (with its sunburst): anyone on the sidewalk or in a doorway is under them
  {x:250,y:566,w:237,h:37,base:690,fg:true},{x:580,y:535,w:225,h:47,base:690,fg:true},{x:909,y:406,w:358,h:206,base:690,fg:true},{x:1343,y:585,w:287,h:43,base:690,fg:true},
  {x:165,y:1240,w:297,h:60,base:1410,fg:true},{x:612,y:1238,w:283,h:62,base:1410,fg:true},{x:1488,y:1240,w:302,h:65,base:1410,fg:true},
  // taco truck: the sidewalk is behind it
  {x:708,y:641,w:256,h:145,base:780,fg:true},
  // the four south-row building faces, roof to door row (plain painting slices: the faces are solid). base 1000 so only row 14, the
  // walk behind the roofs, is covered; alley walkers (rows 15 to 20) and doorways are not.
  {x:145,y:905,w:367,h:503,base:1000},{x:598,y:905,w:324,h:503,base:1000},{x:960,y:898,w:410,h:510,base:1000},{x:1448,y:925,w:344,h:483,base:1000},
  // 12 lamp posts (six on the north curb, six in the plaza), head to foot
  {x:151,y:464,w:68,h:206,base:658,fg:true},{x:173,y:529,w:68,h:199,base:716,fg:true},{x:491,y:529,w:68,h:199,base:716,fg:true},{x:786,y:534,w:68,h:134,base:656,fg:true},{x:946,y:521,w:68,h:207,base:716,fg:true},{x:1241,y:536,w:68,h:192,base:716,fg:true},{x:88,y:1254,w:68,h:214,base:1456,fg:true},{x:450,y:1254,w:68,h:214,base:1456,fg:true},{x:553,y:1254,w:68,h:214,base:1456,fg:true},{x:958,y:1254,w:68,h:210,base:1452,fg:true},{x:1331,y:1264,w:68,h:200,base:1452,fg:true},{x:1798,y:1259,w:68,h:158,base:1452,fg:true},
  // cutouts from art/blvd-fg.webp (tools/make_blvd_fg.py): palms, bushes, planters in the plaza ...
  {x:0,y:1462,w:225,h:202,base:1652,fg:true},{x:235,y:1490,w:107,h:92,base:1580,fg:true},{x:412,y:1466,w:90,h:156,base:1620,fg:true},{x:488,y:1515,w:100,h:95,base:1608,fg:true},
  {x:660,y:1466,w:120,h:96,base:1562,fg:true},{x:632,y:1562,w:180,h:102,base:1664,fg:true},{x:1128,y:1466,w:92,h:96,base:1562,fg:true},{x:1116,y:1562,w:124,h:102,base:1664,fg:true},
  {x:1260,y:1495,w:104,h:95,base:1588,fg:true},{x:1408,y:1466,w:92,h:156,base:1620,fg:true},{x:1718,y:1560,w:74,h:82,base:1640,fg:true},{x:1768,y:1462,w:152,h:202,base:1652,fg:true},
  // pass 2: Metro canopy and bus shelter (cutouts), the screen-edge palms, and small curb props you can walk behind
  {x:1520,y:1488,w:172,h:112,base:1660,fg:true},{x:783,y:780,w:134,h:105,base:884,fg:true},{x:1836,y:690,w:84,h:320,base:1010,fg:true},{x:0,y:840,w:175,h:300,base:1140,fg:true},
  {x:745,y:822,w:34,h:70,base:892},{x:938,y:826,w:38,h:66,base:892},{x:1312,y:818,w:36,h:77,base:895},{x:1462,y:822,w:36,h:73,base:895},{x:1503,y:805,w:55,h:90,base:895},{x:1568,y:818,w:60,h:77,base:895},
  {x:664,y:845,w:26,h:37,base:884},{x:697,y:848,w:25,h:34,base:884},{x:512,y:848,w:20,h:34,base:884},
  // ... and the rooftops that stand over the south sidewalk: water tanks, roof gardens, the Grand Tower crown (everyone north of the south row is behind them)
  {x:236,y:832,w:81,h:118,base:1400,fg:true},{x:330,y:820,w:100,h:92,base:1400,fg:true},{x:635,y:860,w:85,h:52,base:1400,fg:true},{x:735,y:860,w:115,h:52,base:1400,fg:true},
  {x:1015,y:850,w:65,h:62,base:1400,fg:true},{x:1090,y:768,w:182,h:142,base:1400,fg:true},{x:1262,y:860,w:38,h:55,base:1400,fg:true},{x:1590,y:850,w:70,h:62,base:1400,fg:true},{x:1664,y:868,w:114,h:94,base:1400,fg:true}
] };
// THE STACKS: the hall props, cut out in art/stacks-fg.webp (tools/make_stacks_fg.py). Row 8 runs behind the globe, the book stacks, the cart,
// both lamp pedestals and both plants (their bases are row 9), so anyone standing on row 8 or 7 there is behind them. The globe is two zones: its
// upper half (base 520) only covers row 7, so Tom stays visible on row 8; the stand and lower half (base 636) cover row 8.
PLATE_BEHIND.town=[{x:0,y:0,w:238,h:347,base:347,fg:true},{x:263,y:0,w:244,h:98,base:98,fg:true},{x:534,y:0,w:214,h:111,base:111,fg:true},{x:772,y:0,w:1148,h:360,base:360,fg:true},{x:0,y:740,w:212,h:377,base:1117,fg:true},{x:1748,y:765,w:172,h:324,base:1089,fg:true},{x:1142,y:1415,w:477,h:249,base:1664,fg:true},{x:0,y:1418,w:434,h:246,base:1664,fg:true},{x:1620,y:1437,w:300,h:227,base:1664,fg:true},{x:63,y:0,w:413,h:453,base:453,fg:true},{x:566,y:11,w:389,h:389,base:400,fg:true},{x:958,y:17,w:404,h:397,base:414,fg:true},{x:1367,y:70,w:377,h:357,base:427,fg:true},{x:0,y:813,w:423,h:436,base:1249,fg:true},{x:993,y:846,w:405,h:360,base:1206,fg:true},{x:469,y:874,w:361,h:318,base:1192,fg:true},{x:1424,y:897,w:494,h:309,base:1206,fg:true},{x:387,y:9,w:218,h:401,base:410,fg:true},{x:28,y:384,w:61,h:301,base:685,fg:true},{x:1746,y:398,w:172,h:331,base:729,fg:true},{x:1340,y:570,w:61,h:277,base:847,fg:true},{x:377,y:585,w:57,h:258,base:843,fg:true},{x:749,y:1270,w:288,h:385,base:1655,fg:true},{x:986,y:438,w:124,h:121,base:559,fg:true},{x:95,y:459,w:81,h:149,base:608,fg:true},{x:1139,y:488,w:190,h:94,base:582,fg:true},{x:847,y:489,w:105,h:85,base:574,fg:true},{x:1486,y:516,w:86,h:99,base:615,fg:true},{x:563,y:531,w:240,h:256,base:787,fg:true},{x:386,y:669,w:174,h:153,base:822,fg:true},{x:930,y:697,w:203,h:140,base:837,fg:true},{x:1302,y:1217,w:97,h:185,base:1402,fg:true},{x:1051,y:1258,w:74,h:138,base:1396,fg:true},{x:1658,y:1271,w:216,h:166,base:1437,fg:true},{x:12,y:1285,w:150,h:155,base:1440,fg:true},{x:1437,y:1308,w:72,h:79,base:1387,fg:true},{x:243,y:1314,w:134,h:103,base:1417,fg:true}];
PLATE_BEHIND.stacks=[
  {x:743,y:470,w:126,h:72,base:520,fg:true},{x:743,y:540,w:126,h:101,base:636,fg:true},{x:743,y:569,w:41,h:84,base:650,fg:true},{x:856,y:544,w:53,h:89,base:632,fg:true},
  {x:696,y:468,w:55,h:201,base:666,fg:true},{x:653,y:516,w:50,h:133,base:648,fg:true},
  {x:1013,y:526,w:136,h:135,base:658,fg:true},{x:1171,y:471,w:58,h:200,base:666,fg:true},{x:1219,y:516,w:69,h:122,base:640,fg:true}
];
// SHOP COUNTERS (2026-10-31): Penny (shop) and Nickel (nickels) stand behind their counters. art/<room>-fg.webp (tools/make_counter_fg.py) holds only the
// painted counter, drawn over the shopkeeper so the top and front hide her legs. Rect zones in art px (64 per tile); base = the counter's front edge.
PLATE_BEHIND.shop=[{x:255,y:296,w:502,h:152,base:448,fg:true,front:true}];
PLATE_BEHIND.nickels=[{x:305,y:255,w:430,h:155,base:410,fg:true,front:true}];
// TOM'S KITCHEN ISLAND (2026-10-31, tomhouse3d): row 3 is the aisle behind the island. art/tomhouse-fg.webp (tools/make_tomhouse_fg.py) holds only the countertop,
// sink, limes and flowers; drawn over anyone standing on row 3 so the top hides their legs. Rect in art px (64 per tile): plate x 676 to 940, y 244 to 343.
// base 280 = the countertop's lower edge: row 3 (feet 256) is behind it, row 4 (feet 320) and the stools are in front.
PLATE_BEHIND.tomhouse=[{x:552,y:199,w:218,h:82,base:280,fg:true,jar:true}];
// AMY'S HOUSE (2026-11-01, amyhouse3d): art/amyhouse-fg.webp (tools/make_amyhouse_fg.py) holds the kitchen island top, the three north dining chairs and the living
// room sofa. Island top: row 3 aisle (feet 256) is behind it, row 4 stools in front. Chairs: row 5 (feet 384) walks behind the chair backs, row 6 does not. Sofa: the
// row 8 hall (feet 576) runs behind its back, row 9 (feet 640) is in front. Art px (64 per tile).
PLATE_BEHIND.amyhouse=[{x:606,y:224,w:310,h:58,base:280,fg:true},{x:703,y:364,w:162,h:32,base:420,fg:true},{x:195,y:556,w:190,h:54,base:630,fg:true}];
// DEEDEE AND BOPPY'S HOUSE (2026-11-01, grands3d): art/grands-fg.webp (tools/make_grands_fg.py) holds the cookie counter top with its pie, cake dome and muffins, the plaid
// sofa with pillows and arms, and the two ivy plants on the half-wall. Counter top: the cook's aisle (row 7, feet 512) is under it, so its legs are hidden; row 6 (feet 448)
// is behind the pie and the dome. Sofa: the aisle behind it (row 5, feet 384) and the sofa's north corner (10,4) are behind it, row 7 (feet 512) is in front. Ivies: row 10
// (feet 704) runs behind them. Art px (64 per tile); rects are the cutout's bounding boxes.
PLATE_BEHIND.grands=[{x:88,y:430,w:270,h:115,base:545,fg:true},{x:394,y:296,w:332,h:152,base:447,fg:true},{x:286,y:675,w:118,h:124,base:772,fg:true},{x:690,y:678,w:123,h:142,base:772,fg:true}];
// Rivituso Row (tools/make_row_fg.py, `row3`): 26 pieces of the new painting, cut per class (trees, posts and signs, roofs, props).
PLATE_BEHIND.row=[{x:423,y:0,w:453,h:213,base:213,fg:true},{x:789,y:8,w:268,h:249,base:257,fg:true},{x:236,y:6,w:517,h:286,base:292,fg:true},{x:542,y:188,w:157,h:117,base:305,fg:true},{x:1048,y:0,w:488,h:308,base:308,fg:true},{x:1103,y:362,w:210,h:73,base:435,fg:true},{x:355,y:424,w:118,h:70,base:494,fg:true},{x:823,y:56,w:616,h:490,base:546,fg:true},{x:0,y:0,w:317,h:579,base:579,fg:true},{x:95,y:519,w:125,h:100,base:619,fg:true},{x:62,y:389,w:41,h:272,base:661,fg:true},{x:223,y:505,w:487,h:234,base:739,fg:true},{x:431,y:728,w:53,h:50,base:778,fg:true},{x:518,y:850,w:132,h:88,base:938,fg:true},{x:1122,y:819,w:148,h:119,base:938,fg:true},{x:223,y:781,w:306,h:182,base:963,fg:true},{x:822,y:784,w:50,h:245,base:1029,fg:true},{x:0,y:789,w:100,h:242,base:1031,fg:true},{x:114,y:673,w:135,h:373,base:1046,fg:true},{x:637,y:698,w:184,h:402,base:1100,fg:true},{x:277,y:1029,w:104,h:102,base:1131,fg:true},{x:565,y:1050,w:78,h:119,base:1169,fg:true},{x:408,y:1052,w:74,h:118,base:1170,fg:true},{x:705,y:1089,w:287,h:265,base:1354,fg:true},{x:0,y:1043,w:427,h:365,base:1408,fg:true},{x:1133,y:855,w:403,h:553,base:1408,fg:true}];
// Grump Hollow v3 (tools/make_hollow_fg.py, `hollow5`): pieces cut from Tom's storybook painting along his four masks. Upright things (boulders, stump,
// benches, mushrooms, the arch board with its posts) are one zone each; foliage, cattails and the low fences are 48 px row strips with their own base.
PLATE_BEHIND.hollow=[{pts:[[958,143],[957,164],[964,170],[1015,179],[1072,173],[1071,192],[1077,196],[1145,199],[1177,196],[1181,192],[1177,163],[1169,154],[1148,142],[1120,141],[1092,153],[1089,131],[1079,108],[1052,91],[1024,90],[993,100],[969,122]],base:197,fg:true},{pts:[[974,219],[970,194],[955,177],[945,156],[924,142],[896,133],[853,136],[836,142],[813,170],[799,197],[795,214],[796,229],[801,232],[873,243],[918,242],[941,236],[961,236],[973,230]],base:241,fg:true},{pts:[[1228,226],[1228,232],[1236,236],[1275,237],[1282,245],[1324,249],[1365,243],[1365,224],[1359,213],[1349,203],[1332,197],[1315,197],[1300,206],[1291,196],[1263,193],[1249,200]],base:247,fg:true},{pts:[[755,269],[739,251],[711,249],[693,258],[685,271],[685,283],[709,290],[727,290],[754,284]],base:288,fg:true},{pts:[[542,285],[544,304],[577,312],[627,307],[635,299],[631,275],[618,263],[598,254],[569,255],[550,270]],base:310,fg:true},{pts:[[365,319],[365,369],[372,378],[391,382],[425,405],[445,412],[491,410],[501,406],[496,429],[501,434],[548,451],[543,453],[533,471],[533,481],[541,487],[592,500],[648,495],[662,489],[662,474],[651,451],[632,440],[612,436],[614,425],[610,412],[594,393],[551,381],[523,388],[525,369],[520,345],[506,324],[503,312],[489,295],[461,282],[435,277],[410,278],[388,288]],base:498,fg:true},{pts:[[712,501],[712,517],[754,534],[824,538],[842,533],[842,515],[829,481],[795,461],[767,461],[734,473]],base:536,fg:true},{pts:[[836,581],[836,591],[841,597],[868,604],[907,604],[922,596],[938,595],[944,591],[944,578],[937,562],[918,548],[901,544],[874,546],[857,553],[843,567]],base:602,fg:true},{pts:[[1496,676],[1471,657],[1440,663],[1429,673],[1414,677],[1393,694],[1369,745],[1362,741],[1345,742],[1326,759],[1326,765],[1330,771],[1344,773],[1353,782],[1376,779],[1382,782],[1385,791],[1396,791],[1402,777],[1464,764],[1482,740],[1494,736],[1499,730],[1499,684]],base:789,fg:true},{pts:[[287,744],[274,718],[258,710],[218,709],[166,718],[142,730],[109,759],[95,786],[95,811],[144,829],[164,843],[230,838],[248,828],[278,819],[286,802],[291,799],[294,785]],base:841,fg:true},{pts:[[1388,871],[1373,856],[1367,844],[1352,834],[1344,791],[1331,782],[1331,776],[1324,776],[1322,781],[1318,771],[1306,772],[1299,764],[1273,765],[1272,770],[1243,769],[1208,779],[1193,822],[1178,837],[1148,845],[1135,860],[1124,882],[1124,890],[1140,900],[1170,897],[1167,914],[1183,923],[1214,919],[1254,924],[1271,914],[1325,909],[1332,897],[1342,890],[1373,893],[1387,880]],base:922,fg:true},{pts:[[902,1036],[910,1048],[942,1059],[963,1075],[997,1080],[1053,1076],[1078,1065],[1115,1062],[1127,1057],[1153,1039],[1184,1029],[1191,1019],[1191,1005],[1181,962],[1172,950],[1163,924],[1154,914],[1121,896],[1091,889],[1072,879],[1035,876],[985,894],[959,912],[910,981],[903,1002]],base:1078,fg:true},{pts:[[213,1063],[200,1056],[177,1053],[164,1055],[140,1068],[123,1082],[116,1094],[116,1106],[123,1125],[150,1147],[197,1147],[224,1132],[227,1127],[227,1096],[223,1079]],base:1145,fg:true},{pts:[[964,1136],[950,1104],[932,1083],[873,1063],[852,1063],[829,1069],[792,1093],[755,1111],[732,1155],[726,1177],[726,1197],[751,1217],[771,1224],[822,1227],[840,1232],[866,1231],[910,1212],[942,1188],[957,1183],[965,1171]],base:1230,fg:true},{pts:[[819,1405],[1125,1407],[1144,1383],[1161,1374],[1165,1349],[1163,1313],[1149,1293],[1131,1283],[1122,1273],[1106,1266],[1074,1261],[1041,1261],[996,1245],[957,1243],[929,1249],[898,1265],[874,1291],[852,1330],[828,1361],[821,1381]],base:1408,fg:true},{pts:[[400,528],[353,512],[352,499],[357,494],[357,480],[348,471],[343,457],[326,456],[314,465],[298,461],[263,464],[258,460],[237,460],[218,467],[200,485],[188,484],[175,492],[176,534],[189,545],[189,556],[184,559],[184,576],[190,584],[183,613],[197,621],[207,621],[214,616],[217,603],[226,601],[230,635],[254,637],[264,629],[258,596],[266,595],[269,585],[321,568],[325,569],[326,576],[346,577],[356,556],[363,571],[363,588],[387,592],[395,588],[389,550],[400,543]],base:635,fg:true},{pts:[[1387,488],[1379,486],[1366,506],[1336,581],[1326,569],[1290,569],[1281,574],[1283,598],[1274,598],[1273,590],[1278,581],[1277,561],[1271,557],[1271,548],[1267,545],[1251,544],[1246,547],[1241,562],[1239,592],[1186,581],[1156,601],[1153,606],[1155,623],[1173,630],[1169,667],[1192,674],[1219,669],[1224,665],[1222,637],[1311,656],[1299,693],[1299,703],[1312,705],[1320,689],[1321,692],[1329,690],[1331,699],[1343,703],[1356,703],[1372,697],[1376,693],[1371,652],[1387,638],[1385,616],[1342,610],[1341,606],[1356,561],[1362,555],[1369,526],[1375,518],[1382,518],[1382,512],[1378,510],[1385,506]],base:703,fg:true},{pts:[[94,671],[93,684],[111,687],[114,692],[108,709],[100,713],[101,720],[156,725],[163,720],[163,710],[157,709],[156,705],[175,700],[175,690],[157,676],[150,676],[148,670],[130,656],[112,657]],base:724,fg:true},{pts:[[1326,759],[1329,770],[1348,773],[1347,777],[1338,778],[1339,791],[1349,795],[1370,795],[1384,805],[1405,801],[1408,788],[1400,780],[1423,771],[1422,758],[1397,744],[1384,745],[1377,750],[1362,741],[1346,741]],base:803,fg:true},{pts:[[265,866],[265,892],[257,899],[257,920],[267,929],[268,1012],[257,1066],[257,1202],[295,1202],[296,1198],[315,1199],[341,1190],[328,1109],[330,1052],[334,1035],[351,1022],[387,1017],[496,1019],[566,1026],[639,1040],[640,1181],[731,1181],[732,1161],[717,1151],[707,1153],[703,1135],[703,1078],[709,1006],[717,958],[727,950],[729,933],[722,925],[724,892],[705,874],[680,866],[665,866],[650,874],[649,904],[643,907],[639,919],[600,907],[534,898],[387,894],[350,901],[348,887],[342,883],[345,851],[325,842],[293,846]],base:1200,fg:true},{pts:[[0,0],[0,50],[1040,50],[1040,44],[1047,43],[1051,36],[1056,49],[1535,50],[1535,0]],base:48,fg:true},{pts:[[0,45],[0,98],[771,98],[776,89],[786,88],[793,98],[801,98],[805,93],[813,93],[818,98],[1013,98],[1026,93],[1052,98],[1197,98],[1206,87],[1210,91],[1209,98],[1382,98],[1396,83],[1404,98],[1535,98],[1535,45],[1064,45],[1059,59],[1044,54],[1041,45]],base:96,fg:true},{pts:[[0,93],[0,146],[655,146],[653,132],[666,137],[660,140],[660,146],[815,146],[814,136],[801,122],[789,121],[775,110],[771,93]],base:144,fg:true},{pts:[[813,97],[816,107],[825,108],[819,113],[819,120],[834,124],[835,134],[841,137],[842,144],[867,145],[887,139],[890,143],[902,141],[913,145],[931,135],[940,146],[968,146],[971,139],[974,146],[1001,146],[1004,143],[1004,112],[996,111],[989,125],[986,103],[1008,100],[1008,93],[818,93]],base:144,fg:true},{pts:[[1053,93],[1054,103],[1059,104],[1066,114],[1075,116],[1081,128],[1088,128],[1088,116],[1092,121],[1100,121],[1101,113],[1108,111],[1130,121],[1133,109],[1138,116],[1133,119],[1133,125],[1142,135],[1151,134],[1154,122],[1166,115],[1167,107],[1169,114],[1175,114],[1187,103],[1196,101],[1196,93]],base:133,fg:true},{pts:[[1207,107],[1216,108],[1219,104],[1224,118],[1232,117],[1235,109],[1240,114],[1247,114],[1253,105],[1254,116],[1249,122],[1244,146],[1367,146],[1367,140],[1359,130],[1359,120],[1389,146],[1535,146],[1535,93],[1404,93],[1402,111],[1384,104],[1379,93],[1209,93]],base:144,fg:true},{pts:[[0,194],[588,194],[593,190],[595,194],[714,194],[714,188],[702,179],[708,173],[721,182],[739,184],[741,174],[745,173],[753,180],[757,194],[815,194],[816,185],[811,184],[812,166],[824,161],[824,153],[815,141],[659,141],[657,145],[655,141],[0,141]],base:192,fg:true},{pts:[[932,191],[938,194],[1039,194],[1043,179],[1055,170],[1055,163],[1049,162],[1059,154],[1059,147],[1046,151],[1035,166],[1035,141],[1026,141],[1017,155],[1016,141],[1003,141],[1002,145],[1001,141],[972,141],[968,155],[967,141],[940,141],[943,151],[955,154],[950,156],[949,169],[943,162],[934,161],[934,169],[941,174],[947,186],[932,185]],base:192,fg:true},{pts:[[1174,188],[1174,194],[1535,194],[1535,141],[1389,141],[1390,151],[1377,159],[1369,150],[1367,141],[1243,141],[1204,174],[1182,180]],base:192,fg:true},{pts:[[0,189],[0,242],[301,242],[302,237],[312,242],[346,242],[340,228],[347,223],[350,210],[351,215],[360,214],[350,242],[592,242],[593,236],[605,233],[603,220],[593,213],[606,213],[611,203],[623,213],[634,213],[646,222],[665,219],[665,207],[669,205],[687,217],[698,217],[716,242],[739,242],[739,235],[731,226],[715,189],[595,189],[595,203],[586,200],[588,189]],base:240,fg:true},{pts:[[739,200],[739,210],[748,214],[747,224],[759,233],[759,242],[863,240],[863,234],[836,234],[843,229],[856,229],[855,222],[845,220],[850,215],[849,208],[843,208],[831,219],[839,204],[849,202],[848,195],[836,195],[831,200],[824,198],[824,189],[757,189],[760,209],[747,200]],base:240,fg:true},{pts:[[938,189],[958,233],[978,231],[979,236],[1016,238],[1019,234],[1023,238],[1038,238],[1042,215],[1047,225],[1054,225],[1052,209],[1045,204],[1052,195],[1052,189]],base:236,fg:true},{pts:[[1156,219],[1172,220],[1188,216],[1194,210],[1190,225],[1201,230],[1211,229],[1221,208],[1222,223],[1260,220],[1267,215],[1269,220],[1285,219],[1316,200],[1334,195],[1334,189],[1174,189],[1156,210]],base:228,fg:true},{pts:[[1289,235],[1289,242],[1310,242],[1313,234],[1320,230],[1325,236],[1331,236],[1341,227],[1351,226],[1346,242],[1373,242],[1376,237],[1378,242],[1535,242],[1535,189],[1342,189],[1340,194],[1326,196],[1307,210]],base:240,fg:true},{pts:[[0,237],[0,290],[543,290],[543,284],[536,276],[519,273],[506,263],[487,261],[479,252],[483,237],[350,237],[348,240],[346,237],[312,237],[303,243],[301,237]],base:288,fg:true},{pts:[[481,253],[488,253],[491,249],[502,252],[504,245],[508,250],[505,260],[514,261],[515,270],[527,266],[531,272],[567,273],[568,276],[574,276],[577,271],[597,271],[592,252],[603,253],[603,241],[593,237],[482,237]],base:274,fg:true},{pts:[[753,253],[755,256],[765,254],[766,272],[790,269],[794,273],[806,270],[821,273],[827,267],[829,273],[835,273],[839,248],[849,243],[849,237],[758,237]],base:271,fg:true},{pts:[[1346,237],[1346,249],[1359,246],[1368,262],[1368,268],[1357,263],[1364,290],[1397,290],[1393,268],[1386,268],[1386,278],[1381,275],[1372,246],[1373,237]],base:288,fg:true},{pts:[[1378,237],[1378,243],[1397,250],[1400,290],[1434,290],[1437,282],[1450,271],[1453,272],[1446,290],[1535,290],[1535,237]],base:288,fg:true},{pts:[[0,338],[373,338],[376,322],[403,297],[404,285],[0,285]],base:336,fg:true},{pts:[[405,285],[405,291],[411,297],[423,294],[432,297],[440,306],[450,307],[476,338],[525,338],[524,328],[528,326],[530,338],[553,338],[552,325],[555,321],[567,324],[576,338],[605,338],[605,332],[588,320],[576,302],[550,295],[543,285]],base:336,fg:true},{pts:[[1344,293],[1344,299],[1357,317],[1344,317],[1343,324],[1350,326],[1359,338],[1446,338],[1456,328],[1462,327],[1461,319],[1453,318],[1454,309],[1442,311],[1457,294],[1462,312],[1479,306],[1475,326],[1482,335],[1490,335],[1491,325],[1495,324],[1505,333],[1505,338],[1535,338],[1535,285],[1446,285],[1445,289],[1444,285],[1400,285],[1399,288],[1397,285],[1364,285],[1374,310],[1371,305],[1364,307],[1351,293]],base:336,fg:true},{pts:[[681,307],[673,308],[673,313],[666,318],[664,338],[682,337],[685,319],[681,315]],base:336,fg:true},{pts:[[0,333],[0,386],[384,386],[391,369],[390,358],[373,333]],base:384,fg:true},{pts:[[479,333],[483,355],[490,362],[488,378],[492,386],[524,386],[525,375],[526,386],[558,386],[562,375],[573,373],[571,363],[558,363],[567,341],[559,341],[553,333],[530,333],[529,337],[525,333]],base:384,fg:true},{pts:[[577,333],[582,352],[611,351],[611,342],[605,333]],base:351,fg:true},{pts:[[628,333],[632,362],[625,363],[625,372],[630,377],[630,386],[694,386],[696,382],[697,386],[706,386],[702,373],[707,362],[690,363],[702,347],[702,341],[694,341],[686,348],[674,366],[681,333],[664,333],[661,343],[654,342],[653,333]],base:384,fg:true},{pts:[[712,334],[706,348],[706,379],[709,386],[719,386],[722,344],[720,335]],base:384,fg:true},{pts:[[1360,358],[1365,368],[1371,368],[1374,348],[1375,365],[1384,362],[1397,365],[1403,360],[1406,366],[1414,366],[1418,360],[1436,360],[1444,333],[1359,333]],base:366,fg:true},{pts:[[1486,359],[1505,365],[1524,361],[1535,354],[1535,333],[1500,335],[1486,352]],base:363,fg:true},{pts:[[0,434],[302,434],[302,427],[292,414],[294,409],[299,414],[306,414],[309,402],[317,410],[323,410],[323,404],[328,402],[347,418],[357,419],[368,405],[370,409],[376,409],[377,394],[389,396],[389,389],[384,381],[0,381]],base:432,fg:true},{pts:[[492,381],[493,395],[501,401],[511,401],[514,407],[556,412],[558,381],[526,381],[525,385],[524,381]],base:411,fg:true},{pts:[[601,393],[601,401],[611,408],[610,415],[618,417],[614,434],[620,434],[623,427],[626,434],[760,434],[765,417],[759,417],[750,424],[758,384],[752,384],[740,406],[736,393],[741,381],[724,381],[720,390],[719,381],[709,381],[708,386],[706,381],[698,381],[695,390],[694,381],[619,381],[623,406],[608,393]],base:432,fg:true},{pts:[[931,392],[925,434],[944,434],[944,406],[938,392]],base:432,fg:true},{pts:[[908,410],[904,434],[921,434],[916,410]],base:432,fg:true},{pts:[[0,429],[0,482],[170,482],[174,476],[185,472],[186,464],[195,454],[216,460],[227,445],[234,454],[244,454],[249,443],[271,450],[273,440],[298,466],[321,467],[314,439],[304,429]],base:480,fg:true},{pts:[[626,429],[629,477],[635,482],[754,482],[756,461],[759,469],[767,469],[765,439],[760,429]],base:480,fg:true},{pts:[[906,429],[907,456],[913,469],[913,482],[970,481],[981,449],[970,451],[960,460],[964,431],[925,429],[928,443],[924,446],[921,429]],base:480,fg:true},{pts:[[1496,429],[1491,444],[1492,479],[1505,482],[1510,477],[1509,440],[1504,429]],base:480,fg:true},{pts:[[1530,433],[1523,433],[1515,447],[1512,482],[1530,482],[1533,460]],base:480,fg:true},{pts:[[0,477],[0,530],[167,530],[166,522],[158,516],[152,503],[160,489],[170,483],[170,477]],base:528,fg:true},{pts:[[648,477],[650,486],[659,489],[685,483],[685,477]],base:487,fg:true},{pts:[[696,477],[697,484],[717,489],[721,494],[732,494],[737,498],[753,496],[754,477]],base:496,fg:true},{pts:[[838,522],[861,518],[867,530],[972,530],[973,498],[986,483],[986,477],[974,477],[969,481],[968,477],[913,477],[910,480],[897,477],[897,488],[892,477],[884,477],[883,483],[878,477],[869,477],[874,490],[872,495],[863,477],[856,477],[863,510],[859,509],[855,499],[848,499],[849,510],[838,515]],base:528,fg:true},{pts:[[1470,479],[1470,487],[1466,491],[1467,530],[1535,530],[1535,480],[1512,477],[1512,484],[1506,485],[1505,477],[1496,477],[1495,491],[1488,477],[1481,477],[1481,488],[1477,479]],base:528,fg:true},{pts:[[1427,485],[1428,493],[1437,503],[1444,530],[1463,530],[1461,499],[1454,498],[1452,504],[1439,488]],base:528,fg:true},{pts:[[0,525],[0,578],[191,578],[185,563],[190,560],[191,549],[178,541],[178,533],[169,525]],base:576,fg:true},{pts:[[862,533],[870,564],[920,564],[936,572],[960,567],[963,541],[964,568],[977,571],[981,549],[994,534],[1006,537],[1005,528],[996,525],[983,528],[982,525],[868,525],[868,532]],base:570,fg:true},{pts:[[1409,535],[1409,542],[1424,540],[1437,549],[1446,578],[1535,578],[1535,525],[1484,525],[1483,528],[1482,525],[1467,525],[1466,533],[1463,525],[1445,525],[1446,540],[1429,531]],base:576,fg:true},{pts:[[1405,572],[1405,578],[1443,578],[1441,569],[1431,565],[1414,566]],base:576,fg:true},{pts:[[0,626],[166,626],[163,612],[175,611],[176,604],[182,602],[183,592],[188,596],[196,595],[196,579],[191,573],[0,573]],base:624,fg:true},{pts:[[1422,573],[1404,573],[1394,595],[1394,613],[1402,612],[1403,604],[1422,579]],base:611,fg:true},{pts:[[1431,573],[1443,606],[1444,626],[1535,626],[1535,573]],base:624,fg:true},{pts:[[0,621],[0,674],[102,674],[110,670],[113,660],[119,660],[139,674],[225,674],[225,668],[216,656],[181,641],[166,621]],base:672,fg:true},{pts:[[1444,621],[1443,648],[1464,656],[1453,664],[1452,674],[1535,674],[1535,621]],base:672,fg:true},{pts:[[0,669],[0,722],[102,722],[102,702],[97,688],[99,669]],base:720,fg:true},{pts:[[140,669],[143,684],[168,704],[183,706],[193,697],[193,687],[184,678],[183,669]],base:704,fg:true},{pts:[[184,669],[184,676],[215,696],[237,697],[236,684],[226,669]],base:697,fg:true},{pts:[[1420,709],[1420,718],[1425,722],[1535,722],[1535,669],[1447,670],[1443,682],[1431,690]],base:720,fg:true},{pts:[[0,717],[0,770],[111,770],[111,762],[98,757],[91,746],[101,731],[103,717]],base:768,fg:true},{pts:[[1414,725],[1413,747],[1420,748],[1424,744],[1432,749],[1434,755],[1442,755],[1445,760],[1431,764],[1431,770],[1535,770],[1535,717],[1424,717]],base:768,fg:true},{pts:[[0,765],[0,818],[227,818],[227,812],[216,808],[185,807],[186,801],[194,802],[195,795],[204,797],[202,785],[181,782],[169,788],[153,785],[152,774],[145,774],[138,765],[111,770],[110,765]],base:816,fg:true},{pts:[[1380,812],[1380,818],[1535,818],[1535,765],[1428,765],[1416,781],[1398,781]],base:816,fg:true},{pts:[[0,866],[206,866],[206,860],[196,853],[177,850],[183,849],[186,841],[188,846],[196,846],[198,833],[202,839],[209,839],[211,832],[215,835],[226,832],[230,839],[236,839],[238,835],[247,836],[247,830],[230,813],[0,813]],base:864,fg:true},{pts:[[1343,833],[1343,841],[1354,840],[1356,846],[1366,847],[1359,866],[1535,866],[1535,813],[1379,813],[1374,819],[1353,823]],base:864,fg:true},{pts:[[0,861],[0,914],[156,914],[158,902],[165,902],[172,892],[182,894],[186,886],[199,887],[203,882],[209,889],[217,888],[216,873],[206,861]],base:912,fg:true},{pts:[[1350,906],[1350,914],[1535,914],[1535,861],[1360,861],[1360,868],[1368,870],[1360,877],[1358,898]],base:912,fg:true},{pts:[[1361,883],[1343,882],[1327,894],[1316,894],[1313,903],[1296,907],[1296,914],[1338,914],[1339,909],[1347,909],[1347,895],[1361,890]],base:912,fg:true},{pts:[[0,962],[141,961],[141,951],[131,942],[143,942],[145,937],[148,941],[155,941],[156,933],[149,922],[162,919],[163,911],[0,909]],base:960,fg:true},{pts:[[1263,916],[1263,922],[1271,923],[1270,931],[1275,932],[1276,939],[1262,945],[1260,962],[1535,962],[1535,909],[1271,909]],base:960,fg:true},{pts:[[0,957],[0,1010],[160,1010],[160,1004],[152,993],[149,975],[133,971],[125,957]],base:1008,fg:true},{pts:[[1186,1004],[1186,1010],[1535,1010],[1535,957],[1256,957],[1226,967],[1221,973],[1203,973],[1188,989],[1188,997],[1194,998]],base:1008,fg:true},{pts:[[0,1058],[157,1058],[153,1032],[162,1034],[164,1030],[162,1007],[0,1005]],base:1056,fg:true},{pts:[[1179,1050],[1179,1058],[1535,1058],[1535,1005],[1216,1005],[1209,1021],[1209,1029],[1213,1031],[1199,1052],[1190,1048]],base:1056,fg:true},{pts:[[881,1025],[890,1024],[893,1028],[902,1025],[906,1031],[918,1031],[922,1037],[913,1046],[913,1055],[918,1058],[962,1058],[957,1034],[947,1023],[931,1014],[902,1011],[884,1015]],base:1056,fg:true},{pts:[[1013,1032],[1007,1028],[990,1028],[978,1033],[963,1049],[962,1058],[996,1058],[996,1052],[989,1047],[1001,1037],[1012,1039]],base:1056,fg:true},{pts:[[1059,1035],[1032,1032],[1019,1040],[1012,1040],[1003,1048],[1002,1058],[1042,1058],[1042,1053],[1049,1051],[1050,1042],[1059,1042]],base:1056,fg:true},{pts:[[0,1106],[110,1106],[110,1101],[117,1099],[115,1081],[135,1070],[136,1053],[0,1053]],base:1104,fg:true},{pts:[[893,1075],[893,1083],[906,1082],[910,1078],[911,1083],[918,1084],[918,1089],[925,1090],[918,1099],[918,1106],[1535,1106],[1535,1053],[1178,1053],[1177,1056],[1154,1053],[1143,1063],[1129,1060],[1128,1066],[1120,1069],[1105,1086],[1100,1075],[1084,1073],[1066,1059],[1047,1060],[1045,1069],[1052,1071],[1044,1074],[1040,1062],[1043,1053],[918,1053],[917,1059],[909,1060]],base:1104,fg:true},{pts:[[0,1101],[0,1154],[124,1154],[125,1138],[117,1128],[125,1127],[126,1120],[117,1113],[109,1112],[111,1101]],base:1152,fg:true},{pts:[[917,1101],[918,1111],[927,1110],[930,1114],[943,1112],[945,1122],[957,1118],[957,1136],[961,1143],[969,1144],[970,1154],[1535,1154],[1535,1101]],base:1152,fg:true},{pts:[[0,1149],[0,1202],[71,1202],[72,1198],[75,1202],[98,1202],[100,1197],[108,1202],[118,1202],[116,1184],[125,1183],[125,1176],[117,1168],[123,1166],[124,1149]],base:1200,fg:true},{pts:[[861,1188],[861,1201],[871,1198],[876,1202],[903,1202],[902,1191],[907,1192],[907,1202],[1136,1202],[1145,1195],[1154,1195],[1158,1200],[1173,1197],[1174,1202],[1535,1202],[1535,1149],[970,1149],[961,1156],[960,1163],[947,1161],[930,1171],[927,1165],[920,1165],[917,1168],[896,1167],[887,1170],[885,1175],[873,1173],[870,1181]],base:1200,fg:true},{pts:[[0,1197],[0,1250],[81,1250],[73,1197]],base:1248,fg:true},{pts:[[834,1238],[835,1246],[841,1246],[847,1239],[866,1240],[868,1246],[875,1246],[878,1242],[879,1249],[1535,1250],[1535,1197],[877,1197],[877,1204],[885,1209],[870,1209],[846,1219]],base:1248,fg:true},{pts:[[0,1245],[0,1298],[123,1298],[122,1290],[107,1279],[107,1270],[84,1262],[82,1245]],base:1296,fg:true},{pts:[[784,1292],[784,1298],[912,1298],[928,1281],[936,1279],[950,1283],[954,1278],[967,1278],[974,1272],[987,1271],[1001,1264],[1003,1269],[993,1277],[988,1287],[988,1294],[997,1298],[1011,1298],[1026,1290],[1042,1292],[1057,1281],[1083,1273],[1103,1280],[1095,1298],[1137,1298],[1144,1288],[1153,1283],[1169,1282],[1171,1288],[1178,1288],[1180,1283],[1183,1288],[1192,1286],[1192,1298],[1535,1298],[1535,1245],[887,1245],[876,1259],[879,1271],[872,1272],[872,1263],[865,1261],[865,1255],[846,1259],[841,1266],[821,1266],[812,1273],[810,1282],[794,1284]],base:1296,fg:true},{pts:[[0,1293],[0,1346],[214,1346],[214,1340],[201,1334],[189,1321],[182,1306],[158,1293]],base:1344,fg:true},{pts:[[760,1340],[760,1346],[948,1344],[944,1330],[932,1320],[921,1317],[919,1305],[906,1293],[782,1293],[778,1309],[798,1308],[811,1303],[805,1309],[805,1317],[793,1317],[772,1326]],base:1344,fg:true},{pts:[[1091,1310],[1099,1316],[1120,1314],[1135,1302],[1137,1293],[1095,1293]],base:1314,fg:true},{pts:[[1110,1336],[1110,1346],[1535,1346],[1535,1293],[1192,1293],[1185,1302],[1173,1307],[1169,1315],[1156,1325],[1151,1336],[1143,1332]],base:1344,fg:true},{pts:[[728,1340],[728,1346],[760,1346],[755,1333],[745,1336],[733,1333]],base:1344,fg:true},{pts:[[0,1341],[0,1394],[203,1394],[206,1386],[223,1380],[224,1366],[234,1369],[231,1352],[219,1341]],base:1392,fg:true},{pts:[[673,1378],[673,1387],[688,1384],[689,1389],[697,1387],[699,1394],[948,1394],[949,1389],[959,1388],[958,1379],[950,1372],[934,1366],[918,1368],[912,1362],[914,1355],[926,1354],[925,1341],[728,1341],[727,1345],[703,1341],[700,1344],[702,1353],[692,1357],[690,1363],[680,1368]],base:1392,fg:true},{pts:[[1087,1385],[1088,1394],[1109,1389],[1110,1394],[1535,1394],[1535,1341],[1108,1341],[1094,1354],[1095,1363],[1107,1364],[1092,1375]],base:1392,fg:true},{pts:[[0,1389],[0,1407],[207,1407],[207,1402],[195,1397],[191,1389]],base:1408,fg:true},{pts:[[691,1400],[691,1407],[955,1407],[955,1399],[948,1389],[699,1389]],base:1408,fg:true},{pts:[[1110,1389],[1110,1407],[1535,1407],[1535,1389]],base:1408,fg:true},{pts:[[408,893],[408,899],[530,903],[530,897],[502,894]],base:901,fg:true},{pts:[[645,1053],[637,1053],[634,1088],[612,1097],[610,1106],[645,1106]],base:1104,fg:true},{pts:[[262,1068],[244,1076],[241,1106],[262,1106]],base:1104,fg:true},{pts:[[262,1101],[241,1101],[232,1123],[199,1142],[178,1133],[156,1138],[152,1143],[152,1154],[262,1154]],base:1152,fg:true},{pts:[[609,1101],[610,1154],[645,1154],[645,1101]],base:1152,fg:true},{pts:[[66,1183],[66,1202],[262,1202],[262,1149],[152,1149],[151,1165],[117,1183],[98,1173],[82,1174]],base:1200,fg:true},{pts:[[610,1149],[608,1202],[743,1202],[743,1196],[731,1188],[731,1176],[646,1176],[645,1149]],base:1200,fg:true},{pts:[[787,1196],[787,1202],[828,1202],[828,1196],[815,1190],[801,1190]],base:1200,fg:true},{pts:[[71,1250],[200,1250],[199,1229],[236,1207],[239,1197],[154,1197],[154,1217],[120,1236],[117,1220],[149,1204],[149,1197],[66,1197]],base:1248,fg:true},{pts:[[245,1197],[245,1218],[267,1226],[298,1220],[295,1197]],base:1224,fg:true},{pts:[[598,1242],[603,1247],[632,1250],[652,1244],[655,1220],[682,1240],[682,1250],[740,1250],[740,1244],[727,1236],[728,1224],[777,1250],[826,1250],[835,1203],[829,1197],[786,1197],[784,1214],[781,1215],[759,1207],[746,1197],[608,1197]],base:1248,fg:true},{pts:[[71,1245],[71,1298],[124,1298],[122,1274],[154,1255],[157,1271],[176,1280],[191,1280],[204,1272],[200,1245]],base:1296,fg:true},{pts:[[680,1246],[676,1285],[686,1292],[700,1294],[719,1286],[723,1271],[766,1290],[768,1298],[819,1298],[826,1245],[777,1245],[773,1258],[743,1245]],base:1296,fg:true},{pts:[[70,1295],[68,1314],[87,1327],[107,1325],[125,1316],[124,1293]],base:1325,fg:true},{pts:[[768,1293],[762,1321],[775,1330],[797,1329],[817,1320],[818,1293]],base:1328,fg:true}];
let plateTime=0;   // last frame time, so the island zone can redraw Bready Mercury on top of its own cutout
function plateWalkBehind(map,plate) {
  const zones=map&&PLATE_BEHIND[map.id]; if(!zones||!plate||!plate.img) return;
  const s=T/64, list=[...map.npcs,...followers,player];
  let ctxDone=false, jarOver=false; const redraw=[];
  for(const z of zones) {
    if(z.pts&&!z.bb) z.bb=[Math.min(...z.pts.map(q=>q[0])),Math.min(...z.pts.map(q=>q[1])),Math.max(...z.pts.map(q=>q[0])),Math.max(...z.pts.map(q=>q[1]))];
    const x0=z.pts?z.bb[0]:z.cx!==undefined?z.cx-z.rx:z.x, x1=z.pts?z.bb[2]:z.cx!==undefined?z.cx+z.rx:z.x+z.w;
    const y0=z.pts?z.bb[1]:z.cy!==undefined?z.cy-z.ry:z.y, y1=z.pts?z.bb[3]:z.cy!==undefined?z.cy+z.ry:z.y+z.h;
    let hit=false;
    for(const a of list) {
      const p=position(a), fx=(p.x+.5)*64, fy=(p.y+1)*64;
      if(fy>z.base) continue;                       // feet south of the base: in front of it
      if(fx+36<x0||fx-36>x1||fy+4<y0||fy-130>y1) continue;   // body box (about 72 x 130 art px) misses the zone
      hit=true; break;
    }
    if(!hit) continue;
    if(!ctxDone) { ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctxDone=true; }
    ctx.save();
    ctx.beginPath();
    if(z.pts) { z.pts.forEach((q,i)=>i?ctx.lineTo(q[0]*s,q[1]*s):ctx.moveTo(q[0]*s,q[1]*s)); ctx.closePath(); }
    else if(z.cx!==undefined) ctx.ellipse(z.cx*s,z.cy*s,z.rx*s,z.ry*s,0,0,Math.PI*2); else ctx.rect(z.x*s,z.y*s,z.w*s,z.h*s);
    ctx.clip();
    if(z.fg) { if(!plate.fgImg) { plate.fgImg=new Image(); plate.fgImg.src=plate.fgSrc||'art/'+map.id+'-fg.webp?v=20261031f'; } if(plate.fgImg.complete&&plate.fgImg.naturalWidth) ctx.drawImage(plate.fgImg,0,0,map.w*T,map.h*T); }
    else ctx.drawImage(plate.img,0,0,map.w*T,map.h*T);
    ctx.restore();
    if(z.jar) jarOver=true;
    // front:true (shop counters): the painted counter is tall, so anyone standing in FRONT of it (feet south of the base) but with a body that
    // reaches up into the zone would be covered too. Tom 2026-11-01: the party was hidden by the counter. Draw those actors again on top.
    if(z.front) for(const a of list) {
      const p=position(a), fx=(p.x+.5)*64, fy=(p.y+1)*64;
      if(fy<=z.base||fx+36<x0||fx-36>x1||fy-130>y1) continue;
      if(!redraw.includes(a)) redraw.push(a);
    }
  }
  if(redraw.length) {
    redraw.sort((a,b)=>position(a).y-position(b).y);
    ctx.imageSmoothingEnabled=false;
    for(const a of redraw) { if(typeof drawActorSpaced==='function') drawActorSpaced(a); else drawActor(a); }
  }
  if(ctxDone) ctx.imageSmoothingEnabled=false;
  if(jarOver&&map.id==='tomhouse') drawHomeJar(plateTime);   // the jar stands on the island top, so it is in front of anyone behind the island
}
// Bready Mercury on Tom's kitchen island, except while the squirrels have him (chapter 6, until the Oak boss is beaten).
function drawHomeJar(time) {
  if(typeof storyMatch==='function'&&storyMatch({chapter:6,notFlag:'ch6-clear'})) return;
  drawBreadyJar(918*T/78.4,322*T/78.4,1.1*T/78.4,time);
}
function plateLive(map,time) {
  if(map&&PLATE_SIGNS[map.id]) drawPlateSigns(PLATE_SIGNS[map.id]);
  // Tom's kitchen island: Bready Mercury, except while the squirrels have him (chapter 6, until the Oak boss is beaten).
  if(map&&map.id==='tomhouse') { plateTime=time; drawHomeJar(time); }
  // The Crown of the Oak: Bready Mercury on the chest at the heart of the hoard (art px: centre x 672, base y 258; the jar stands about 62 px tall).
  if(map&&map.id==='crown') { const k=crownJarState(); if(k!==null) { const s=T/64; drawBreadyJar(672*s,258*s,1.24*s,time,k*34*s,1-k); } }
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
