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
  [9,3,'Denver','A ski lodge, paused. A mug of cocoa halfway to a mouth. Somebody laughing so hard the marshmallows are mid-bounce.'],
  [15,5,'Seattle','A ferry deck, paused. A seagull stuck mid-flap with a fry in its beak. Everybody on board is pointing at it and smiling.'],
  [27,7,'Chicago','A street festival, paused. One very large balloon dog, and a child reaching up for it. Her fingers are an inch away.'],
  [31,9,'Miami','A beach, paused. A volleyball at the top of its arc. Four people watching it with their mouths open. Nobody ever lands.']];
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
    exits:[[19,6,'concourse',1,6,'right','infmarble'],[19,7,'concourse',1,7,'right','infmarble']]},
    planInf(GATE00_PLAN,'infwall'),
    {objects:[
      ['infpodium',8,2,3,1,'Gate 00 podium','GATE 00. FLIGHT: ANY. TO: WHEREVER. STATUS: ON TIME. A sticky note on the counter: BACK IN FIVE MINUTES. It is dated tomorrow.'],
      ['inffids',2,2,4,1,'Departure board','DEPARTURES. Every flight: ON TIME. Every gate: PAUSED. Every town on the list is marked PAUSED, except two. Those two are blinking.'],
      ['infseats',2,6,4,1,'Gate seats','Four seats facing the window. Perfect for looking at two little glass towns and wondering which one has the bakery.'],
      ['infseats',14,4,4,1,'Gate seats','Four seats. Rose has taken the one by the window. The window is eleven feet away. She says it counts.'],
      ['infseats',14,9,4,1,'Gate seats','Four seats. A tiny pilot hat on one of them. It is exactly Rose’s size, and it is not Rose’s.'],
      ['infseats',2,9,4,1,'Gate seats','Four seats. Amy stretches her calves on one. Tom pretends not to know her.'],
      ['infplant',1,12,1,1,'Plant','A gold potted ficus. It has been in bloom for a very long time. It has no idea what season it is.'],
      ['infplant',18,12,1,1,'Plant','A gold potted ficus. Its leaf tag says: WATER ME. IN THE GOOD PART.'],
      ['infplant',1,1,1,1,'Plant','A gold potted ficus. Somebody has put a tiny boarding pass in the pot. It says WHEREVER.']]}),
  planMerge({id:'concourse',name:'The Endless Concourse',w:40,h:14,ground:'inf',wild:true,
    tag:'Gates 1 to 9, every one of them PAUSED. The moving walkway is moving. Nothing else is.',
    eyebrow:'TERMINAL INFINITY / THE ENDLESS CONCOURSE',
    hint:'Gate 00 is behind you. Keep going east, to the big door at the far end.',
    spawn:{x:1,y:6},
    exits:[[0,6,'gate00',18,6,'left','infmarble'],[0,7,'gate00',18,7,'left','infmarble']],
    monsters:P2_CONCOURSE_SPOTS},
    planInf(CONCOURSE_PLAN,'infwall'),
    {objects:[
      ...P2_GATES.map(([x,n,city,text])=>['infgatesign',x,1,3,1,'Gate '+n,'GATE '+n+'. '+city.toUpperCase()+'. STATUS: PAUSED. Through the little window: '+text,{city}]),
      ['boardbench',6,11,2,1,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['boardbench',19,11,2,1,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['boardbench',31,11,2,1,'Boarding Gate bench','BOARDING GATE. A gold bench with a sign: SWAP. Sit here and the whole party can change who is out front.',{swapbench:true}],
      ['infrope',23,7,1,1,'Checkpoint rope','A velvet rope. A little sign hangs from it: THIS LANE IS CLOSED. THE OTHER LANE IS ALSO CLOSED. PLEASE USE THE OTHER OTHER LANE.'],
      ['infdesk',20,4,3,1,'Standby desk','STANDBY LIST. A very long list. Number 17 has been circled in red since 1998. Number 18 is somebody else’s problem.'],
      ['infdoor',14,12,2,1,'Lost and Found','LOST AND FOUND. A sign hangs on the door: BACK IN FIVE MINUTES. It is dated a very long time ago, and it is not wrong.',{lostfound:true}],
      ['infjet',35,1,2,1,'Jet bridge door','A jet bridge door. Gate 00 is behind you; this one is for people arriving from somewhere else.'],
      ['infbigdoor',37,5,2,3,'Gate Infinity','GATE INFINITY. A tall door with a gold clock face in it and no hands. A card on the door: NOW BOARDING. NOT YET.',{gateinfinity:true}],
      ['infplant',1,1,1,1,'Plant','A gold potted ficus. A moving walkway has been going past it for years. It feels very behind.'],
      ['infplant',1,12,1,1,'Plant','A gold potted ficus with a tiny hat. Somebody dressed it. Nobody has claimed it.'],
      ['infplant',38,12,1,1,'Plant','A gold potted ficus. A paper sign in the pot: PLEASE DO NOT WATER. IT IS ALREADY TOMORROW.'],
      ['infcart',10,9,1,1,'Luggage cart','A luggage cart stacked with bags that all have the same tag. The tag says ?.'],
      ['infseats',28,2,3,1,'Gate seats','Three seats. A newspaper on one. THE FRONT PAGE: NOTHING HAS HAPPENED. A SECOND PAGE: IT WAS A VERY NICE DAY.']]})
);
