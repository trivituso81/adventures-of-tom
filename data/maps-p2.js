'use strict';
// data/maps-p2.js — Part 2 maps (chapter 11 on). Same spec format as data/maps-le.js (planMerge, pools, tiles, objects).
// Chapter 11, "The Layover Between Worlds":
//   flightzero  Flight Zero's cabin (ground 'cabin'). Seat 1A. Walkable so the girls and Amy can walk in on Tom.
//   gate00      Terminal Infinity, Gate 00 (ground 'inf'): the arrival gate, one huge dusk window with two glass domes
//               (Long Island, green; Los Angeles, orange). The way on is the door on the right.
//   concourse   Terminal Infinity, the Endless Concourse (ground 'inf'): Gate 1 Boston to Gate 9 Miami, every one PAUSED.
//               A checkpoint wall splits it in two (the Standby Sprite holds the gap); the jet bridge (top right) is where
//               TNB and Nara arrive; Boarding Gate benches swap who is out front; Gate Infinity is the big door at the far end.
// Plan characters: 'W' wall, 'X' dark, 'V' window, 'i' carpet, 'q' marble, 'm' moving walkway, 'D' doorway (marble), 'c' cabin carpet.
// Renderer: engine/infinity-render.js. Monsters: data/p2-monsters.js. Scenes: data/scenes-p2.js. Loaded after data/maps-le.js.
const INF_TILES={i:'infcarpet',q:'infmarble',m:'infwalk',D:'infmarble',c:'cabincarpet'};
function planInf(plan,wall,win) {
  const walls=[],wins=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='V') wins.push([x,y]);
    else if(INF_TILES[c]) (floors[INF_TILES[c]]=floors[INF_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:wall,cells:walls},...(wins.length?[{tile:'infwindow',cells:wins}]:[])],objects:[]};
}
// The Endless Concourse, 40 x 14. Checkpoint wall at x=23 with a two-tile gap (y 6 and 7); doorways at the west end.
const CONCOURSE_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<14;y++) {
    let r='';
    for(let x=0;x<40;x++) {
      let c;
      if(y===13) c='W';
      else if(y===0) c=(x===0||x===39)?'W':'V';
      else if(x===0) c=(y===6||y===7)?'D':'W';
      else if(x===39) c='W';
      else if(x===23&&y!==6&&y!==7) c='W';
      else if(y<=2||y>=11) c='i';
      else if((y===6||y===7)&&((x>=12&&x<=21)||(x>=25&&x<=34))) c='m';
      else c='q';
      r+=c;
    }
    rows.push(r);
  }
  return rows;
})();
const GATE00_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<14;y++) {
    if(y===0) { rows.push('WVVVVVVVVVVVVVVVVVVW'); continue; }
    if(y===13) { rows.push('WWWWWWWWWWWWWWWWWWWW'); continue; }
    rows.push('Wiiiiiiiqqqqiiiiiii'+((y===6||y===7)?'D':'W'));
  }
  return rows;
})();
const CABIN_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<7;y++) {
    if(y===0||y===6) { rows.push('W'.repeat(19)); continue; }
    rows.push('W'+'c'.repeat(17)+'W');
  }
  return rows;
})();
const P2_GATES=[
  [3,1,'Boston','A baseball game, paused. The ball is in the air. A man in the second row has both hands out, ready to catch it. He’s been ready for a very long time.'],
  [8,3,'Denver','A ski lodge, paused. A mug of cocoa halfway to a mouth. Somebody laughing so hard the marshmallows are mid-bounce.'],
  [13,5,'Seattle','A ferry deck, paused. A seagull stuck mid-flap with a fry in its beak. Everybody on board is pointing at it and smiling.'],
  [22,7,'Chicago','A street festival, paused. One very large balloon dog, and a child reaching up for it. Her fingers are an inch away.'],
  [27,9,'Miami','A beach, paused. A volleyball at the top of its arc. Four people watching it with their mouths open. Nobody ever lands.']];
LE_AREAS.push(
  planMerge({id:'flightzero',name:'Flight Zero',w:19,h:7,ground:'cabin',
    tag:'Delta One, Seat 1A. The overhead bins are full of somebody else’s weather.',
    eyebrow:'FLIGHT ZERO / DELTA ONE / SEAT 1A',
    hint:'Seat 1A is at the back left. Something is under that blanket.',
    spawn:{x:3,y:3},exits:[],
    // Painted plate (art/flightzero.webp, engine/plate.js). '#' blocks, '.' walks. Only the blue aisle walks (rows 3 and 4): the
    // window wall, the five back pods, the five front pods and their nightstands, both galleys, the cabin door and the drinks cart block.
    plateMask:[
      '###################',
      '###################',
      '###################',
      '#..........##....##',
      '#.................#',
      '###################',
      '###################']},
    planInf(CABIN_PLAN,'cabinwall'),
    {objects:[
      ['cabinseat',2,1,3,2,'Pod seat','A lie-flat pod. It has a little screen, a little lamp, and a little menu that says WHEREVER.'],
      ['cabinseat',5,1,3,2,'Pod seat','A lie-flat pod. It has a little screen, a little lamp, and a little menu that says WHEREVER.'],
      ['cabinseat',8,1,2,2,'Pod seat','A lie-flat pod. It has a little screen, a little lamp, and a little menu that says WHEREVER.'],
      ['cabinseat',10,1,3,2,'Pod seat','A lie-flat pod. It has a little screen, a little lamp, and a little menu that says WHEREVER.'],
      ['cabinseat',13,1,3,2,'Pod seat','A lie-flat pod. It has a little screen, a little lamp, and a little menu that says WHEREVER.'],
      ['cabinseat',2,5,3,2,'Pod seat','A lie-flat pod. Somebody has been in it. The lamp is still warm.'],
      ['cabinseat',5,5,1,2,'Pod seat','A lie-flat pod. The menu says WHEREVER. The seatbelt sign says WHENEVER.'],
      ['cabinblanket',6,5,1,1,'Blanket','A fleece blanket on a pod seat. It is breathing. It is, very quietly, giggling.'],
      ['cabinseat',7,5,1,2,'Pod seat','A lie-flat pod. The menu says WHEREVER. The seatbelt sign says WHENEVER.'],
      ['cabinseat',8,5,3,2,'Pod seat','A lie-flat pod. The menu says WHEREVER. The seatbelt sign says WHENEVER.'],
      ['cabinseat',11,5,3,2,'Pod seat','A lie-flat pod. The menu says WHEREVER. The seatbelt sign says WHENEVER.'],
      ['cabinseat',15,5,3,2,'Pod seat','A lie-flat pod. The menu says WHEREVER. The seatbelt sign says WHENEVER.'],
      ['cabincart',11,3,2,1,'Service cart','A drinks cart. A little card on top: SORRY. WE ARE OUT OF PRETZELS. WE HAVE BEEN OUT OF PRETZELS SINCE 1989.'],
      ['cabindoor',17,3,1,1,'Cabin door','The door to the jet bridge. Warm gold light under the seam. Somebody is shouting out there.']]}),
  planMerge({id:'gate00',name:'Gate 00',w:20,h:14,ground:'inf',
    tag:'Terminal Infinity. It is always dusk. Every flight is ON TIME.',
    eyebrow:'TERMINAL INFINITY / GATE 00',
    hint:'The doorway on the right leads to the Endless Concourse.',
    spawn:{x:9,y:11},
    exits:[[19,6,'concourse',1,7,'right','infmarble'],[19,7,'concourse',1,8,'right','infmarble']],
    // Painted plate (art/gate00.webp, engine/plate.js). '#' blocks, '.' walks. Window wall, podium and its two posts, the four bench rows
    // with their lamp tables, the luggage cart, the left plant, the bottom-right plant, the right console and both rails block.
    // The marble aisle, the carpet and the marble doorway on the right (tiles 19,6 and 19,7) walk.
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '####################',
      '#########...#.######',
      '########..........#.',
      '##..................',
      '##.................#',
      '#######.......######',
      '..##...............#',
      '###..............###',
      '########.........###',
      '####################']},
    planInf(GATE00_PLAN,'infwall'),
    {objects:[
      ['infpodium',9,4,4,1,'Gate 00 podium','AREA 55, GATE 00. FLIGHT: ANY. TO: WHEREVER. STATUS: ON TIME. A sticky note on the counter: BACK IN FIVE MINUTES. It is dated tomorrow.'],
      ['inffids',2,5,1,2,'Departure board','DEPARTURES. Every flight: ON TIME. Every gate: PAUSED. Every town on the list is marked PAUSED, except two. Those two are blinking.'],
      ['infseats',4,5,4,2,'Gate seats','Four seats facing the window. Perfect for looking at two little glass towns and wondering which one has the bakery.'],
      ['infseats',14,5,3,1,'Gate seats','Four seats. Rose has taken the one by the window. The window is eleven feet away. She says it counts.'],
      ['infseats',14,9,4,1,'Gate seats','Four seats. A tiny pilot hat on one of them. It is exactly Rose’s size, and it is not Rose’s.'],
      ['infseats',2,9,5,1,'Gate seats','Four seats. Amy stretches her calves on one. Tom pretends not to know her.'],
      ['infmat',2,10,2,1,'Yoga mat','A rolled-up blue yoga mat and a green thermos, still cold. Somebody was stretching here a minute ago. Amy says it was not her. Her calves say it was.'],
      ['infcart',0,8,2,2,'Luggage cart','A cart stacked with old trunks. One tag says WHEREVER. The tag under it says NOT MY BAG. Same handwriting.'],
      ['infplant',1,6,1,2,'Plant','A potted ficus. Somebody has put a tiny boarding pass in the pot. It says WHEREVER.'],
      ['infplant',17,11,2,2,'Plant','A potted ficus. Its leaf tag says: WATER ME. IN THE GOOD PART.']]}),
  planMerge({id:'concourse',name:'The Endless Concourse',w:40,h:14,ground:'inf',wild:true,
    tag:'Gates 1 to 9, every one of them PAUSED. The moving walkway is moving. Nothing else is.',
    eyebrow:'TERMINAL INFINITY / THE ENDLESS CONCOURSE',
    hint:'Gate 00 is behind you. Keep going east, to the big door at the far end.',
    spawn:{x:1,y:8},
    exits:[[0,7,'gate00',18,7,'left','infmarble'],[0,8,'gate00',18,7,'left','infmarble']],
    monsters:P2_CONCOURSE_SPOTS,
    // Painted plate (art/concourse.webp, engine/plate.js). '#' blocks, '.' walks. Blocked: the window wall and every back-wall bench,
    // board and plant (row 4 and up), both moving walkways, the checkpoint wall (steep upper piece, the arch and the long lower
    // diagonal), the bins, the three lower-left benches, the Lost and Found door, the lower-right benches and plants.
    // The way through the checkpoint is the one-tile lane at x 23 (rows 5 to 9) under the arch: the Standby Sprite stands in it. The far-right
    // strip (x 39, rows 5 to 9) walks round the end of the right moving walkway to the east half.
    plateMask:[
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '##.................###..................',
      '##..................###.###############.',
      '....###############..##.###############.',
      '....###############..##.##..............',
      '#.......................###.............',
      '#...............##........#..###########',
      '##.#######.###########....#..###########',
      '##.#...###.##.....#..#....##...........#',
      '########################################']},
    planInf(CONCOURSE_PLAN,'infwall'),
    {objects:[
      ...P2_GATES.map(([x,n,city,text])=>['infgatesign',x,4,1,1,'Gate '+n,'GATE '+n+'. '+city.toUpperCase()+'. STATUS: PAUSED. Through the little window: '+text,{city}]),
      ['boardbench',4,11,3,1,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['boardbench',19,11,2,1,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['boardbench',34,10,3,2,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['infrope',22,8,1,1,'Checkpoint rope','A velvet rope. A little sign hangs from it: THIS LANE IS CLOSED. THE OTHER LANE IS ALSO CLOSED. PLEASE USE THE OTHER OTHER LANE.'],
      ['infdesk',17,4,2,1,'Standby desk','STANDBY LIST. A very long list. Number 17 has been circled in red since 1998. Number 18 is somebody else’s problem.'],
      ['infdoor',16,10,2,2,'Lost and Found','LOST AND FOUND. A sign hangs on the door: BACK IN FIVE MINUTES. It is dated a very long time ago, and it is not wrong.',{lostfound:true}],
      ['infjet',32,3,3,2,'Jet bridge window','A window onto a jet bridge. Gate 00 is behind you; this one is for people arriving from somewhere else.'],
      ['infbigdoor',37,3,2,2,'Gate Infinity','GATE INFINITY. A tall door with a gold clock face in it and no hands. A card on the door: NOW BOARDING. NOT YET.',{gateinfinity:true}],
      ['infplant',1,4,1,2,'Plant','A gold potted ficus. A moving walkway has been going past it for years. It feels very behind.'],
      ['infplant',1,11,1,2,'Plant','A gold potted ficus with a tiny hat. Somebody dressed it. Nobody has claimed it.'],
      ['infplant',11,11,2,2,'Plant','A gold potted ficus. Somebody tied a tiny boarding pass to it. It says WHEREVER.'],
      ['infplant',37,10,2,2,'Plant','A gold potted ficus. A paper sign in the pot: PLEASE DO NOT WATER. IT IS ALREADY TOMORROW.'],
      ['infcart',8,11,2,2,'Luggage cart','A luggage cart stacked with bags that all have the same tag. The tag says ?.'],
      ['infseats',23,4,3,1,'Gate seats','Three seats. A newspaper on one. THE FRONT PAGE: NOTHING HAS HAPPENED. A SECOND PAGE: IT WAS A VERY NICE DAY.'],
      ['infseats',13,11,2,1,'Gate seats','Three seats. Somebody has left a boarding pass on one. It is for yesterday’s flight to tomorrow.'],
      ['infseats',30,10,3,2,'Gate seats','Three seats. A folded newspaper on one. Today’s date is blank. So is tomorrow’s.']]})
);
