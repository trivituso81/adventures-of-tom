'use strict';
// data/maps-ch19.js — Chapter 19 "The Unsent Dead-Letter Office": the sorting hall under Second Avenue where everything nobody could deliver ends up, and the four
// memory rooms off it. Same spec format as data/maps-ch17.js (planMerge, pools, tiles, objects, exits). Loaded after data/maps-ch18.js.
//   deadletter  The Dead-Letter Office (hub, 26 x 17): pigeonholes, conveyor belts, the Claim Desk in the middle (four keepsake niches, one empty chair).
//               South: the chute up to Tom's mailbox on Second Avenue. Doors: Grace (north-west), Rose (north-east), Amy (west), TNB (east).
//               The Oblivion Censor waits at the desk (data/ch19-monsters.js) until all four keepsakes are down.
//   memgrace    The Gym Floor     (blue mats, a balance beam, a folding chair)          you play it as Grace.
//   memrose     The Shoulder Hall (pink carpet, tall lamps, a very small yellow coat)   you play it as Rose.
//   memamy      The Finish Line   (red track, bleachers, a stopwatch podium)            you play it as Amy.
//   memtnb      The Kiln Room     (brick, a kiln, a wheel, a shelf of cups)             you play it as TNB.
// Plan characters: 'W' wall, 'f' slate floor, 'r' runner, 'm' mat, 'p' pink carpet, 't' track, 'k' brick.
// Props are all one kind, 'dlprop' ({sub} picks the drawing), plus 'dlmem' (a memory fragment: flag mem-<id>), 'dlkeep' (a keepsake pedestal: flag ks-<who>) and
// 'dlaltar' (the Claim Desk). Renderer: engine/ch19-render.js. Scenes: data/scenes-ch19.js. Monsters: data/ch19-monsters.js.
const DL_TILES={f:'dlfloor',r:'dlrunner',m:'dlmat',p:'dlpink',t:'dltrack',k:'dlbrick'};
function planDead(plan) {
  const walls=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(DL_TILES[c]) (floors[DL_TILES[c]]=floors[DL_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:walls.length?[{tile:'dlwall',cells:walls}]:[],objects:[]};
}
function dlRoom(w,h,floor,cut=[]) {   // rows 0 and 1 are the wall you look at; `cut` cells are floor on the border (the doors)
  const rows=[];
  for(let y=0;y<h;y++) { let r='';
    for(let x=0;x<w;x++) r+=(y<2||y>=h-1||x===0||x===w-1)&&!cut.some(([a,b])=>a===x&&b===y)?'W':floor;
    rows.push(r); }
  return rows;
}
const DL_P=(sub,x,y,w,h,name,text)=>['dlprop',x,y,w,h,name,text,{sub}];
const DL_M=(id,x,y,name,text)=>['dlmem',x,y,1,1,name,text,{mem:id}];
const DL_K=(who,x,y)=>['dlkeep',x,y,1,1,'Keepsake pedestal','A small brass pedestal with a dent in the top the size of something that mattered.',{keep:who}];

// The hub: the Claim Desk's runner down the middle, belts either side.
const DEADLETTER_PLAN=(()=>{
  const g=dlRoom(26,17,'f',[[12,16],[13,16],[4,1],[21,1],[0,9],[25,9]]).map(r=>r.split(''));
  for(let y=2;y<16;y++) for(const x of [11,12,13,14]) g[y][x]='r';
  return g.map(r=>r.join(''));
})();
const MEMGRACE_PLAN=dlRoom(16,11,'m',[[8,10]]);
const MEMROSE_PLAN=dlRoom(16,11,'p',[[8,10]]);
const MEMAMY_PLAN=dlRoom(16,11,'t',[[8,10]]);
const MEMTNB_PLAN=dlRoom(16,11,'k',[[8,10]]);
// The four rooms in story order: where their door is in the hub, and who you play.
const CH19_ROOMS=[
  {id:'grace',map:'memgrace',door:[4,1],back:[4,2,'down'],who:'Grace',frags:3},
  {id:'rose',map:'memrose',door:[21,1],back:[21,2,'down'],who:'Rose',frags:3},
  {id:'amy',map:'memamy',door:[0,9],back:[1,9,'right'],who:'Amy',frags:3},
  {id:'tnb',map:'memtnb',door:[25,9],back:[24,9,'left'],who:'TNB',frags:3}];

LE_AREAS.push(
  planMerge({id:'deadletter',name:'The Dead-Letter Office',w:26,h:17,ground:'dead',
    tag:'Everything nobody could deliver, sorted by who gave up.',
    eyebrow:'UNDER 2ND AVE / THE DEAD-LETTER OFFICE',
    hint:'Four doors. Four people who will not forget him. The Claim Desk is in the middle.',
    spawn:{x:12,y:14},
    exits:[[12,16,'jpark',7,19,'down','dlfloor'],[13,16,'jpark',7,19,'down','dlfloor'],
      [4,1,'memgrace',8,9,'up','dldoor'],[21,1,'memrose',8,9,'up','dldoor'],[0,9,'memamy',8,9,'up','dldoor'],[25,9,'memtnb',8,9,'up','dldoor']],
    monsters:[...CH19_HUB_SPOTS,...CH19_CENSOR_SPOTS]},
    planDead(DEADLETTER_PLAN),
    {objects:[
      ['dlaltar',10,5,6,3,'The Claim Desk','A long oak counter with a brass bell and a ledger. Four small brass niches in the front, all empty. Behind it, one wooden chair pushed back from the desk, as if someone has just stood up. A thermos sits on the seat. It is warm.'],
      DL_P('belt',2,5,6,1,'Conveyor belt','A conveyor belt of envelopes, shuffling past. Every one is stamped RETURN TO SENDER. None of them has anywhere to go back to.'),
      DL_P('belt',18,5,6,1,'Conveyor belt','This belt carries postcards. Wish you were here, wish you were here, wish you were here. Nobody is.'),
      DL_P('sack',2,8,1,1,'Mail sack','A canvas sack stuffed with birthday cards that arrived four years late. The top one says: BELATED, BUT YOU WERE ON MY MIND.'),
      DL_P('sack',23,11,1,1,'Mail sack','A sack of thank-you notes. Nobody ever opened the ones addressed to a person who left the party early.'),
      DL_P('ledger',12,12,2,1,'The Unclaimed','A big ledger on a stand. UNCLAIMED, VOL. 4,017,312. You turn to the page for Second Avenue. Where a name should be there is a clean white rectangle, exactly the size of one. It is still a little damp.'),
      DL_P('bench',4,12,3,1,'Waiting bench','A long wooden bench with a ticket machine. NOW SERVING: NOBODY. The machine has printed one ticket, and it is stuck halfway out.'),
      DL_P('bench',19,12,3,1,'Waiting bench','A bench. On the end is a pretzel, a little bit squished, wrapped in a napkin. It has a tag: HELD FOR PICKUP. Rose would know whose it is.'),
      DL_P('stamp',22,2,2,2,'The big stamp','A stamp the size of a washing machine. RETURN TO SENDER, in red. It comes down by itself every few minutes, thump, on nothing at all.'),
      DL_P('lamp',8,2,1,1,'Hanging lamp','A green banker\'s lamp on a long cord. Every lamp in the Office is lit. Nobody here has ever turned one off.'),
      DL_P('lamp',17,2,1,1,'Hanging lamp','A banker\'s lamp. The shade is cracked, and the light inside is a very faint gold.')]},
  ),
  planMerge({id:'memgrace',name:'The Gym Floor',w:16,h:11,ground:'dead',
    tag:'Grace\'s room. Somebody always came early.',
    eyebrow:'THE DEAD-LETTER OFFICE / GRACE',
    hint:'Find three memories. Then put something down.',
    spawn:{x:8,y:9},
    exits:[[8,10,'deadletter',4,2,'down','dldoor']]},
    planDead(MEMGRACE_PLAN),
    {objects:[
      DL_P('beam',3,5,8,1,'Balance beam','A competition balance beam, four inches wide, on tall legs. There are chalk handprints along the whole length. Some of them are very small.'),
      DL_P('score',6,2,4,1,'Scoreboard','HOME 9.725. VISITOR: NOBODY. The scoreboard has been waiting for a score that is allowed to be ten.'),
      DL_P('chalk',1,3,1,1,'Chalk bucket','A bucket of chalk. Grace says chalk is a feeling, not a substance.'),
      DL_P('chair',13,7,1,1,'Folding chair','A metal folding chair at the very front of the bleachers, on the aisle. A thermos is on the seat. The chair is exactly one hour early.'),
      DL_P('trophy',12,2,3,1,'Trophy shelf','A shelf of tiny trophies. They are all participation trophies. Each of them says GREAT JOB in a different, slightly worried font.'),
      DL_M('grace1',2,4,'A bright page','A bright blue page, floating at about the height of a nine-year-old.'),
      DL_M('grace2',7,7,'A bright page','A page, a little warmer than the rest, tucked against the foot of the beam.'),
      DL_M('grace3',13,4,'A bright page','A page that crackles faintly, like a program being folded very small.'),
      DL_K('grace',8,3)]}),
  planMerge({id:'memrose',name:'The Shoulder Hall',w:16,h:11,ground:'dead',
    tag:'Rose\'s room. The ceiling is much closer up here.',
    eyebrow:'THE DEAD-LETTER OFFICE / ROSE',
    hint:'Find three memories. Then put something down.',
    spawn:{x:8,y:9},
    exits:[[8,10,'deadletter',21,2,'down','dldoor']]},
    planDead(MEMROSE_PLAN),
    {objects:[
      DL_P('lamp',3,2,1,2,'Tall lamp','A hall lamp that is much too tall. Everything in this hallway was built for people who are not six.'),
      DL_P('lamp',11,2,1,2,'Tall lamp','Another tall lamp. The light from it comes down in a slow circle on the carpet, like a spotlight waiting for somebody to stand in it.'),
      DL_P('rack',13,3,1,2,'Coat rack','A coat rack with exactly one coat on it: a small yellow raincoat on a very low hook. The hook is at Rose height. Everything else is at Tom height.'),
      DL_P('ribbon',2,7,2,1,'A coil of ribbon','A big coil of pink ribbon, a little frayed at one end, as if it had been tied around something and then very carefully untied.'),
      DL_P('stool',5,6,1,1,'Step stool','A step stool with two steps. Rose has never once needed it. Somebody always just lifted her.'),
      DL_P('fort',9,6,3,2,'Pillow fort','A pillow fort with a blanket roof and a sign: ONLY TATA AND LAMBY. There is a Lamby-shaped dent in the cushion.'),
      DL_M('rose1',2,4,'A pink page','A pink page, at shoulder height, bobbing slightly.'),
      DL_M('rose2',12,7,'A pink page','A page that smells like a hallway at bedtime.'),
      DL_M('rose3',6,8,'A pink page','A page, lying flat on the carpet, as if someone laid it down on purpose.'),
      DL_K('rose',8,3)]}),
  planMerge({id:'memamy',name:'The Finish Line',w:16,h:11,ground:'dead',
    tag:'Amy\'s room. Somebody has to cross it first.',
    eyebrow:'THE DEAD-LETTER OFFICE / AMY',
    hint:'Find three memories. Then put something down.',
    spawn:{x:8,y:9},
    exits:[[8,10,'deadletter',1,9,'right','dldoor']]},
    planDead(MEMAMY_PLAN),
    {objects:[
      DL_P('bleacher',1,2,6,2,'Bleachers','Aluminum bleachers. Somebody has taped a sign across the second row: RESERVED FOR TOM. NO, THE OTHER TOM. THE GOOD ONE.'),
      DL_P('tape',14,3,1,5,'Finish tape','A finish tape, stretched across the last lane and still unbroken. Whoever ran this one is very, very close.'),
      DL_P('clock',9,2,3,1,'Race clock','A big race clock. It says 0:00.0 and has said so for a long time. It is not stopped. It is waiting.'),
      DL_P('cone',4,7,1,1,'Traffic cone','An orange cone. Amy says cones are just people who have not found their pace yet.'),
      DL_P('cone',11,6,1,1,'Traffic cone','A cone with a tiny paper flag on top that says LAP 3. Underneath, in a different pen: you are doing great, Ames.'),
      DL_P('hurdle',6,8,2,1,'Hurdle','A hurdle. It has been knocked down, set back up, and knocked down again, a lot, by two different people.'),
      DL_M('amy1',3,5,'An orange page','An orange page, snapping in a wind that is not in this room.'),
      DL_M('amy2',8,8,'An orange page','A page held down by a small, cold paperweight shaped like a thumb.'),
      DL_M('amy3',12,3,'An orange page','A page that is still faintly out of breath.'),
      DL_K('amy',8,4)]}),
  planMerge({id:'memtnb',name:'The Kiln Room',w:16,h:11,ground:'dead',
    tag:'TNB\'s room. It is warm in here, and quiet, and smells like a clay studio.',
    eyebrow:'THE DEAD-LETTER OFFICE / TNB',
    hint:'Find three memories. Then put something down.',
    spawn:{x:8,y:9},
    exits:[[8,10,'deadletter',24,9,'left','dldoor']]},
    planDead(MEMTNB_PLAN),
    {objects:[
      DL_P('kiln',2,2,3,3,'The kiln','A big electric kiln with a brick lid. The little window shows a cup glowing deep orange. It is Cone Six, and nothing has gone wrong with it yet.'),
      DL_P('wheel',11,5,2,2,'The wheel','A pottery wheel. The splash pan is full of slip. Two sets of fingerprints in the clay, one set very careful and one set very much not.'),
      DL_P('shelf',6,2,4,1,'Shelf of cups','A shelf of cups. Each one is a little lopsided in the same way. The handles are all a bit too big. All of them are for the same hand.'),
      DL_P('clay',13,3,1,2,'Bags of clay','Bags of clay, labeled in handwriting that is not TNB\'s: DO NOT EAT. SERIOUSLY. THIS MEANS YOU, NARA.'),
      DL_P('stool',9,6,1,1,'Stool','A potter\'s stool. It has two seats worth of wear on it, side by side, and a coffee ring that is exactly Tom\'s.'),
      DL_P('tools',4,8,2,1,'Tool rack','Ribs, loops and wire, hung in order. One is labeled in pen: THIS ONE IS FOR FIXING THINGS. THE REST ARE FOR MAKING THINGS. BOTH ARE LOVE.'),
      DL_M('tnb1',4,6,'A warm page','A page, warm to the touch, a little dusty with clay.'),
      DL_M('tnb2',12,8,'A warm page','A page tucked under the corner of the wheel, where somebody would find it if they got down low.'),
      DL_M('tnb3',8,5,'A warm page','A page propped against the kiln, like it is drying.'),
      DL_K('tnb',8,4)]})
);
