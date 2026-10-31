'use strict';
// engine/plate.js — Painted "plate" scenes (32-bit look). A plate replaces the tile/house/object
// drawing for one map; the tile grid stays as the invisible logic layer (collision, doors, exits, NPCs).
const PLATES={ town:{src:'art/town.webp?v=20261030c',px:64,img:null,ready:false}, row:{src:'art/row.webp?v=20261030c',px:64,img:null,ready:false}, hollow:{src:'art/hollow.webp?v=20261030d',px:64,img:null,ready:false}, reeds:{src:'art/reeds.webp',px:64,img:null,ready:false}, amyhouse:{src:'art/amyhouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.08}, grands:{src:'art/grands.webp?v=20261030',px:78,img:null,ready:false,square:true}, elliehouse:{src:'art/elliehouse.webp?v=20261030',px:78,img:null,ready:false,square:true,actorScale:1.98}, sundial:{src:'art/sundial.webp',px:64,img:null,ready:false}, school:{src:'art/school.webp',px:64,img:null,ready:false}, cafetorium:{src:'art/cafetorium.webp',px:64,img:null,ready:false}, readroom:{src:'art/readroom.webp',px:64,img:null,ready:false}, stacks:{src:'art/stacks.webp',px:64,img:null,ready:false}, moonclub:{src:'art/moonclub.webp',px:64,img:null,ready:false}, dome:{src:'art/dome.webp',px:64,img:null,ready:false}, gatezero:{src:'art/gatezero.webp',px:64,img:null,ready:false}, library:{src:'art/library.webp?v=20261030',px:78,img:null,ready:false,square:true}, terminal:{src:'art/terminal.webp',px:64,img:null,ready:false}, bakery:{src:'art/bakery.webp?v=20261030',px:78,img:null,ready:false,square:true}, greenhouse:{src:'art/greenhouse.webp?v=20261030',px:78,img:null,ready:false,square:true}, shop:{src:'art/shop.webp?v=20261030',px:78,img:null,ready:false,square:true}, observatory:{src:'art/observatory.webp?v=20261030',px:78,img:null,ready:false,square:true}, post:{src:'art/post.webp?v=20261030',px:78,img:null,ready:false,square:true}, tea:{src:'art/tea.webp?v=20261030',px:78,img:null,ready:false,square:true}, jpark:{src:'art/jpark.webp?v=20261029',px:64,img:null,ready:false}, griffith:{src:'art/griffith.webp',px:64,img:null,ready:false}, taxi:{src:'art/taxi.webp?v=20261030',px:78,img:null,ready:false,square:true}, blvd:{src:'art/blvd.webp?v=20261031a',px:64,img:null,ready:false} };
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
// Rivituso Row (tools/row_signs.py): three house boards, then the north and south exit boards
row:[
  {x:490,y:240,w:216,h:72,t:['GREGORI','HOUSE']},
  {x:1078,y:290,w:216,h:72,t:['RIVITUSO','HOUSE']},
  {x:640,y:777,w:216,h:72,t:['AUNT ELLIE','HOUSE']},
  {x:736,y:40,w:232,h:72,t:['THE SQUARE','SHOPS'],light:true},
  {x:660,y:1226,w:282,h:72,t:['CATTAIL','PIER'],light:true}
],
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
const PLATE_BEHIND={ town:[
  // GRUMP HOLLOW exit board and its posts (north steps)
  {x:440,y:28,w:152,h:72,base:112},{x:418,y:4,w:28,h:108,base:112},{x:582,y:4,w:30,h:108,base:112},
  // RIVITUSO ROW exit board and its posts (south street)
  {x:850,y:1362,w:186,h:70,base:1525},{x:818,y:1336,w:30,h:190,base:1525},{x:1038,y:1336,w:30,h:190,base:1525},
  // lamp posts in the plaza (head, pole, foot as separate shapes so no cobbles are redrawn beside the pole)
  {x:175,y:566,w:42,h:62,base:730},{x:189,y:626,w:18,h:72,base:730},{x:176,y:694,w:46,h:38,base:730},
  {x:1554,y:596,w:42,h:56,base:772},{x:1568,y:650,w:16,h:78,base:772},{x:1550,y:726,w:52,h:46,base:772},
  // Taxi Co. roof edge and side wall, which hang over the alley beside Moon Club (alley column 22)
  {pts:[[1434,944],[1470,926],[1560,880],[1560,1080],[1478,1080],[1470,1000]],base:1285},
  // roof tips and chimneys of the four south shops, so anyone standing on the walkway just north of them is behind the roof (feet row 13)
  {pts:[[118,932],[118,923],[172,923],[200,918],[302,850],[458,920],[458,932]],base:940},{x:168,y:874,w:42,h:56,base:940},          // Snail Mail
  {pts:[[572,975],[572,936],[642,922],[700,904],[760,882],[800,896],[890,938],[890,975]],base:940},{x:592,y:868,w:50,h:108,base:940}, // Kettle Cottage
  {pts:[[1030,940],[1030,934],[1095,908],[1177,864],[1323,931],[1323,945]],base:940},{cx:1254,cy:910,rx:50,ry:58,base:940},         // Moon Club roof and gold sphere
  {pts:[[1432,960],[1432,954],[1500,924],[1540,902],[1600,906],[1750,912],[1754,932],[1754,960]],base:940},{x:1500,y:874,w:40,h:54,base:940}, // Taxi Co.
  // tree canopies: plaza east, between the south shops and the two big trees at the bottom
  {cx:1700,cy:690,rx:92,ry:74,base:800},
  // fountain top: upper bowl and the jets above it (ground behind it, row 9, is walkable)
  {cx:866,cy:632,rx:88,ry:46,base:700},{x:830,y:548,w:72,h:56,base:700},
  {cx:490,cy:902,rx:75,ry:64,base:975},
  {cx:1377,cy:905,rx:78,ry:66,base:985},
  {cx:467,cy:1395,rx:190,ry:115,base:1592},
  {cx:1407,cy:1408,rx:205,ry:120,base:1600}
],
// DOWNTOWN LA: the JEFFERSON PARK arch (board and both posts with their globe lamps), so Tom walks behind the posts and under the board.
blvd:[
  // Jefferson Park arch: board and both posts with their globe lamps
  {x:812,y:1420,w:274,h:90,base:1568},{x:766,y:1402,w:56,h:170,base:1568},{x:1078,y:1402,w:56,h:170,base:1568},
  // Griffith Park gate: board and both posts (Tom climbs the steps and disappears under the board)
  {x:46,y:248,w:158,h:72,base:340},{x:14,y:238,w:44,h:128,base:340},{x:198,y:222,w:40,h:130,base:340},
  // shop awnings and the Starlite marquee: anyone on the sidewalk or in a doorway is under them
  {x:250,y:546,w:236,h:58,base:690},{x:551,y:546,w:254,h:56,base:690},{x:923,y:494,w:330,h:104,base:690},{x:1336,y:548,w:312,h:56,base:690},
  // taco truck: the sidewalk is behind it
  {pts:[[722,712],[748,692],[760,672],[790,664],[810,658],[900,657],[935,661],[943,670],[946,700],[949,745],[941,766],[900,769],[780,769],[740,765],[725,752],[722,735]],base:780},
  // sidewalk lamps (head, pole, foot) on the north curb
  ...BLVD_LAMP(185,478,658),...BLVD_LAMP(207,543,716),...BLVD_LAMP(537,543,716),...BLVD_LAMP(817,548,656),...BLVD_LAMP(980,535,716),...BLVD_LAMP(1275,557,716),
  // plaza lamps in front of the south row
  ...BLVD_LAMP(120,1268,1456),...BLVD_LAMP(483,1268,1456),...BLVD_LAMP(587,1268,1456),...BLVD_LAMP(1002,1268,1452),...BLVD_LAMP(1368,1278,1452),...BLVD_LAMP(1868,1273,1452),
  // cutouts from art/blvd-fg.webp (tools/make_blvd_fg.py): palms, bushes, planters in the plaza ...
  {x:0,y:1462,w:225,h:202,base:1652,fg:true},{x:235,y:1490,w:107,h:92,base:1580,fg:true},{x:412,y:1466,w:90,h:156,base:1620,fg:true},{x:488,y:1515,w:100,h:95,base:1608,fg:true},
  {x:660,y:1466,w:120,h:96,base:1562,fg:true},{x:632,y:1562,w:180,h:102,base:1664,fg:true},{x:1128,y:1466,w:92,h:96,base:1562,fg:true},{x:1116,y:1562,w:124,h:102,base:1664,fg:true},
  {x:1260,y:1495,w:104,h:95,base:1588,fg:true},{x:1408,y:1466,w:92,h:156,base:1620,fg:true},{x:1718,y:1560,w:74,h:82,base:1640,fg:true},{x:1768,y:1462,w:152,h:202,base:1652,fg:true},
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
function plateWalkBehind(map,plate) {
  const zones=map&&PLATE_BEHIND[map.id]; if(!zones||!plate||!plate.img) return;
  const s=T/64, list=[...map.npcs,...followers,player];
  let ctxDone=false;
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
    if(z.fg) { if(!plate.fgImg) { plate.fgImg=new Image(); plate.fgImg.src=plate.fgSrc||'art/'+map.id+'-fg.webp?v=20261031b'; } if(plate.fgImg.complete&&plate.fgImg.naturalWidth) ctx.drawImage(plate.fgImg,0,0,map.w*T,map.h*T); }
    else ctx.drawImage(plate.img,0,0,map.w*T,map.h*T);
    ctx.restore();
  }
  if(ctxDone) ctx.imageSmoothingEnabled=false;
}
function plateLive(map,time) {
  if(map&&PLATE_SIGNS[map.id]) drawPlateSigns(PLATE_SIGNS[map.id]);
  // Tom's kitchen island: Bready Mercury, except while the squirrels have him (chapter 6, until the Oak boss is beaten).
  if(map&&map.id==='tomhouse'&&!(typeof storyMatch==='function'&&storyMatch({chapter:6,notFlag:'ch6-clear'}))) drawBreadyJar(918*T/78.4,322*T/78.4,1.1*T/78.4,time);
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
