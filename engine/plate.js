'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp?v=square4',fgSrc:'art/town-fg.webp?v=square4',px:64,img:null,ready:false}, row:{src:'art/row.webp?v=row3',fgSrc:'art/row-fg.webp?v=row3',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp?v=20261030d',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08,fgSrc:'art/amyhouse-fg.webp?v=amyhouse3d'}, grands:{src:'art/grands.webp?v=20261030',px:78,img:null,ready:false,square:true,fgSrc:'art/grands-fg.webp?v=grands3d'}, elliehouse:{src:'art/elliehouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, library:{src:'art/library.webp?v=20261030',px:78,img:null,ready:false,square:true}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp?v=20261030',px:78,img:null,ready:false,square:true}, greenhouse:{src:'art/greenhouse.webp?v=20261030',px:78,img:null,ready:false,square:true}, shop:{src:'art/shop.webp?v=20261030',px:78,img:null,ready:false,square:true}, observatory:{src:'art/observatory.webp?v=20261030',px:78,img:null,ready:false,square:true}, post:{src:'art/post.webp?v=20261030',px:78,img:null,ready:false,square:true}, tea:{src:'art/tea.webp?v=20261030',px:78,img:null,ready:false,square:true}, jpark:{src:'art/jpark.webp?v=20261029',px:64,img:null,ready:false}, griffith:{src:'art/griffith.webp',px:64,img:null,ready:false}, taxi:{src:'art/taxi.webp?v=20261030',px:78,img:null,ready:false,square:true}, blvd:{src:'art/blvd.webp?v=20261031d',px:64,img:null,ready:false} };
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
// The painting leaves each board blank (tools/town_signs.py, tools/row_signs.py). x, y, w, h = the board's writing face in art px (64 per tile);
// t = one or two lines; light = cream letters on a dark board (the green exit boards), otherwise dark ink on cream.
const PLATE_SIGNS={ town:[], // The Square's boards are painted with lettering now (docs/AREA_PAINTINGS.md)
row:[],   // Rivituso Row: every board and house sign is painted with its lettering (`row3`)
// Grump Hollow (tools/hollow_signs.py): three wooden signs, then the south exit board
hollow:[
  {x:357,y:624,w:189,h:64,t:['GRUMP','HOLLOW']},
  {x:546,y:190,w:157,h:59,t:['NO','SWIMMING']},
  {x:901,y:629,w:183,h:65,t:['NOT A','FROG']},
  {x:574,y:1192,w:308,h:70,t:['THE SQUARE','SHOPS'],light:true}
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
// Walk-behind (2026-10-30, Square first): zones are the painted pixels of tall things (exit boards and posts, tree canopies) in art px
// (64 per tile). base = art y where the thing stands on the ground. An actor whose feet are north of base (on screen: behind it) and whose
// body overlaps the zone gets that slice of the painting drawn over it again, so Tom walks behind the tree and under the board.
// Zones hold only the tall object, never the ground in front of it. rect: x,y,w,h. ellipse: cx,cy,rx,ry. polygon: pts [[x,y],...].
// A lamp post as three small shapes (head, pole, foot) so no paving is redrawn beside the pole. cx is the pole centre, y0 the top of the head, base the foot.
const BLVD_LAMP=(cx,y0,base)=>[{x:cx-20,y:y0,w:40,h:52,base},{x:cx-8,y:y0+50,w:16,h:Math.max(10,base-y0-80),base},{x:cx-22,y:base-34,w:44,h:34,base}];
const PLATE_BEHIND={ town:[{x:981,y:22,w:402,h:354,base:376,fg:true},
  {x:338,y:349,w:32,h:63,base:412,fg:true},
  {x:1224,y:359,w:34,h:61,base:420,fg:true},
  {x:602,y:381,w:35,h:58,base:439,fg:true},
  {x:1461,y:390,w:28,h:61,base:451,fg:true},
  {x:1694,y:510,w:24,h:25,base:535,fg:true},
  {x:0,y:0,w:1125,h:539,base:539,fg:true},
  {x:694,y:532,w:125,h:141,base:673,fg:true},
  {x:1304,y:0,w:616,h:758,base:758,fg:true},
  {x:288,y:536,w:238,h:229,base:765,fg:true},
  {x:1072,y:537,w:326,h:233,base:770,fg:true},
  {x:1830,y:745,w:90,h:197,base:942,fg:true},
  {x:0,y:570,w:268,h:437,base:1007,fg:true},
  {x:1387,y:717,w:475,h:394,base:1111,fg:true},
  {x:929,y:833,w:408,h:308,base:1141,fg:true},
  {x:526,y:826,w:379,h:318,base:1144,fg:true},
  {x:47,y:808,w:425,h:370,base:1178,fg:true},
  {x:553,y:1111,w:41,h:73,base:1184,fg:true},
  {x:99,y:1109,w:39,h:76,base:1185,fg:true},
  {x:1451,y:1143,w:36,h:64,base:1207,fg:true},
  {x:1143,y:1154,w:39,h:62,base:1216,fg:true},
  {x:0,y:1106,w:83,h:162,base:1268,fg:true},
  {x:777,y:1395,w:342,h:259,base:1654,fg:true},
  {x:0,y:1363,w:582,h:301,base:1664,fg:true},
  {x:1246,y:1398,w:477,h:266,base:1664,fg:true},
  {x:1699,y:1368,w:221,h:296,base:1664,fg:true}]
,
// DOWNTOWN LA: the JEFFERSON PARK arch (board and both posts with their globe lamps), so Tom walks behind the posts and under the board.
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
