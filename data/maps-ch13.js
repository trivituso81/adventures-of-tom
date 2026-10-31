'use strict';
// data/maps-ch13.js — Chapter 13 maps: the Transcontinental Sub-Rail, the tunnel Sal and Sol bored under the Layover. Same spec format as
// data/maps-p2.js (planMerge, pools, tiles, objects, exits). Loaded after data/maps-p2.js, before engine/world.js builds the areas.
//   subdepot    Sub-Rail Depot (ground 'sub'): the platform under Downtown LA, behind the Metro stairs. Sol's dispatch desk, a coffee machine,
//               eleven years of smuggled letters. The west edge climbs back to the boulevard; the tracks run east into the tunnel.
//   subtunnel   The Transcontinental Sub-Rail: a long dark tunnel, 36 wide, painted (art/subtunnel.webp), with stalled train cars, mile signs, rubble and Friction Sprites.
//               HUSH-9 debuts halfway along (scene ch13Hush).
//   subchamber  Under the Amber: a cavern at the end of the bore. The Dual-Coast Drill Worm drills at a wall of amber (Long Island's dome seen
//               from below). Painted plate (art/subchamber.webp): the tunnel mouth is top left, the amber wall runs down the right. Behind the glass
//               (top right) is a little pocket where Sal and Penny wait. Boss scene ch13Worm; the coin melt is ch13After (the glass doorway is tiles 21,5 and 22,5).
// Plan characters: 'W' concrete wall, 'R' rock, 'A' amber, 'f' platform, 't' track, 'd' cave floor, 'g' molten gold.
// Renderer: engine/ch13-render.js. Monsters: data/ch13-monsters.js. Scenes: data/scenes-ch13.js.
const SUB_TILES={f:'subfloor',t:'subtrack',d:'subdirt',g:'subgold'};
function planSub(plan,wall) {
  const walls=[],rocks=[],ambers=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='R') rocks.push([x,y]); else if(c==='A') ambers.push([x,y]);
    else if(SUB_TILES[c]) (floors[SUB_TILES[c]]=floors[SUB_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),
    pools:[...(walls.length?[{tile:wall||'subwall',cells:walls}]:[]),...(rocks.length?[{tile:'subrock',cells:rocks}]:[]),...(ambers.length?[{tile:'subamber',cells:ambers}]:[])],objects:[]};
}
const SUBDEPOT_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<12;y++) { let r=''; for(let x=0;x<24;x++) r+=(y<2||y===11||x===0||x===23)?'W':(y===7||y===8)?'t':'f'; rows.push(r); }
  return rows;
})();
const SUBTUNNEL_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<12;y++) { let r=''; for(let x=0;x<36;x++) r+=(y<2||y>=10||x===0||x===35)?'W':(y>=4&&y<=7)?'t':'f'; rows.push(r); }
  return rows;
})();
// The chamber, 26 x 14: the cave is x 1 to 19; the amber plate is x 20 (y 3 to 10); the pocket behind it is x 21 to 24 (y 4 to 9).
const SUBCHAMBER_PLAN=(()=>{
  const rows=[];
  for(let y=0;y<14;y++) { let r='';
    for(let x=0;x<26;x++) {
      let c='R';
      if(y>=2&&y<=11&&x>=1&&x<=19) c=(y===6||y===7)&&x<=9?'t':'d';
      else if(x===20&&y>=3&&y<=10) c='A';
      else if(x>=21&&x<=24&&y>=4&&y<=9) c='d';
      r+=c; }
    rows.push(r); }
  return rows;
})();
const SUB_MILE_TEXT=['MILE 0. LOS ANGELES UNION. THE TUNNEL IS FORTY FEET LONG. THE SIGN SAYS 2,450 MILES. DO NOT QUESTION THE SIGN.',
  'MILE 600. THE DESERT. YOU CANNOT SEE IT. IT IS STILL THERE. IT SENDS ITS REGARDS.',
  'MILE 1,250. HALFWAY. YOU ARE HERE. SOMEBODY HAS ADDED IN MARKER: AND SO IS EVERYBODY ELSE.',
  'MILE 1,800. THE SEA OF CLOUDS. NOBODY KNOWS WHERE THAT IS EITHER. IT IS VERY SOFT.',
  'MILE 2,450. LONG ISLAND. THE LONG WAY. A SECOND SIGN, SMALLER: PLEASE MIND THE WORM.'];
LE_AREAS.push(
  planMerge({id:'subdepot',name:'Sub-Rail Depot',w:24,h:12,ground:'sub',
    tag:'Sal and Sol’s Network. Eleven years of letters, one platform, no schedule.',
    eyebrow:'LOS ANGELES / SUB-RAIL DEPOT',
    hint:'The tracks run east into the tunnel. Sol’s coffee machine fixes everybody.',
    spawn:{x:4,y:4},
    // The stairs up to the boulevard are bottom left (x 1 and 2, row 4); the tunnel mouth is top right (x 23, rows 3 and 4).
    exits:[[1,4,'blvd',24,22,'down','subfloor'],[2,4,'blvd',24,22,'down','subfloor'],
           [23,3,'subtunnel',2,3,'right','subfloor'],[23,4,'subtunnel',2,3,'right','subfloor']],
    // Painted plate (art/subdepot.webp, engine/plate.js). '#' blocks, '.' walks. The upper platform (rows 3 and 4) and the lower platform
    // (rows 8 to 10) are joined by the track bed between them (rows 5 to 8), which walks like the old rails did. Blocked: the wall and
    // stairs, Sol's desk and cabinets, both benches, the handcar, both piles of mail crates, the fence and lamp post at the far right,
    // and the pit under the lower platform (row 11).
    plateMask:[
      '########################',
      '########################',
      '########################',
      '##########....###.......',
      '#.......................',
      '#...........###........#',
      '#...........###........#',
      '#...................####',
      '#.............####...###',
      '######.####...####...###',
      '######.####.############',
      '########################']},
    planSub(SUBDEPOT_PLAN),
    {objects:[
      ['subconsole',5,3,4,1,'Dispatch console','A big radio, a bigger switchboard, and a sign in Sol’s handwriting: SAL + SOL DISPATCH. NO COUSINS WERE HARMED IN THE MAKING OF THIS NETWORK.'],
      ['submap',9,2,3,1,'Route map','TRANSCONTINENTAL SUB-RAIL. LOS ANGELES, THE LAYOVER, LONG ISLAND. A fat red line runs most of the way. Near the end somebody drew an X in marker. Under it: THE WORM IS HERE.'],
      ['subsign',13,2,3,1,'Station sign','LOS ANGELES UNION. SUB-RAIL PLATFORM 1. A smaller line underneath: SERVICE TO EVERYWHERE, EVENTUALLY.',{sign:'LA UNION'}],
      ['subvend',17,2,2,1,'Coffee machine','Sol’s coffee machine. It has one button. The button says COFFEE. Everyone is completely restored.',{restore:true,restoreText:'A thermos of Sol’s coffee, and a donut nobody ordered. Everyone is completely restored.'}],
      ['subcrate',1,9,5,2,'Mail crates','Eleven years of letters, all forwarded by cab trunk. One bag says RETURN TO SENDER. The sender is Tom. He says he knows.'],
      ['subcrate',7,9,4,2,'Mail crates','Letters from Snail Mail to Los Angeles. A tag says: DO NOT OPEN. A smaller tag says: WE DID NOT OPEN THEM. NOT ONCE.'],
      ['subbench',14,8,4,2,'Platform bench','A bench with a plaque: IN LOVING MEMORY OF THE FIRST SIX CABS. A second plaque: WE DO NOT TALK ABOUT THE FIRST SIX CABS.'],
      ['subbench',14,3,3,1,'Platform bench','A bench. Somebody has left a half-eaten sandwich on it, very neatly, for later.'],
      ['subhandcar',12,5,3,2,'Handcar','A little handcar with a pump handle. A tag: CAB 7.5. IT IS NOT A CAB. IT HAS A HORN.'],
      ['sublamp',20,2,1,1,'Work lamp','A tripod work lamp, on. It lights up the tunnel mouth and not one inch farther.']]}),
  planMerge({id:'subtunnel',name:'The Transcontinental Sub-Rail',w:36,h:12,ground:'sub',wild:true,
    tag:'Forty feet long. Two thousand four hundred and fifty miles. Do not question the sign.',
    eyebrow:'THE SUB-RAIL / UNDER THE LAYOVER',
    hint:'Follow the tunnel east to the far door. Stalled cars block the tracks, so use the platforms. The coffee machines are restore points.',
    spawn:{x:3,y:3},
    exits:[[0,2,'subdepot',22,3,'left','subfloor'],[1,2,'subdepot',22,4,'left','subfloor'],
           [34,2,'subchamber',3,4,'right','subfloor'],[35,2,'subchamber',3,5,'right','subfloor']],
    // Painted plate (art/subtunnel.webp, engine/plate.js, 36 x 12 tiles). '#' blocks, '.' walks. The wall and its decor (rows 0 to 2), the track
    // ends, the four stalled cars (the foot line of a tile has to sit in front of the car, so the upper cars block one row, the lower two block two),
    // the generator box, the ledge lamp, and the wall face under the ledge block. Walk: top platform (row 3), the track bed (rows 4 to 6),
    // the ledge (row 7), the lower walkway (row 10), both stairs, and the two tunnel doors (tiles 0,2 / 1,2 west, 34,2 / 35,2 east).
    plateMask:[
      '####################################',
      '####################################',
      '..################################..',
      '....................................',
      '##..######..........######........##',
      '#........########.........##########',
      '#........########.........##########',
      '.....#.............#................',
      '#..###############################.#',
      '##..#############################..#',
      '##................................##',
      '####################################'],
    monsters:CH13_TUNNEL_SPOTS},
    planSub(SUBTUNNEL_PLAN),
    {objects:[
      ['subsign',3,2,3,1,'Mile sign',SUB_MILE_TEXT[0],{sign:'MILE 0'}],
      ['subsign',10,2,3,1,'Mile sign',SUB_MILE_TEXT[1],{sign:'MILE 600'}],
      ['subsign',17,2,3,1,'Mile sign',SUB_MILE_TEXT[2],{sign:'MILE 1,250'}],
      ['subsign',24,2,3,1,'Mile sign',SUB_MILE_TEXT[3],{sign:'MILE 1,800'}],
      ['subsign',30,2,2,1,'Mile sign',SUB_MILE_TEXT[4],{sign:'MILE 2,450'}],
      ['subtrain',4,4,6,1,'Stalled car','A commuter car, dark, stopped dead on the rails. Every seat is empty. A newspaper on one says IT WAS A VERY NICE DAY. It is yesterday’s.'],
      ['subtrain',9,5,8,2,'Stalled car','A silver car with the doors open. A little sign inside: PLEASE DO NOT STAND IN THE DOORWAY. There is a very small stone in the doorway, standing.'],
      ['subtrain',20,4,6,1,'Stalled car','A car with its lights flickering. The route display says NEXT STOP: AND THEN WHAT. A coffee cup rolls back and forth on the floor. Nobody is rolling it.'],
      ['subtrain',26,5,8,2,'Stalled car','The last car. Its headlight points east, at the dark, at a very particular spot. Somebody has hung a hard hat on the coupler.'],
      ['subvend',15,9,1,1,'Coffee machine','A coffee machine somebody bolted to the wall. A sticky note on it: SAL WAS HERE. SOL WAS HERE FIRST. Everyone is completely restored.',{restore:true,restoreText:'Hot coffee, in a tunnel, under the sea of clouds. Everyone is completely restored.'}],
      ['subvend',23,9,1,1,'Coffee machine','The last coffee machine before the chamber. A sticky note: IF YOU CAN READ THIS, DRINK UP. Everyone is completely restored.',{restore:true,restoreText:'The last coffee before the Worm. Everyone is completely restored.'}],
      ['subcable',6,2,3,1,'Cable bundle','A fat bundle of cables running the whole length of the tunnel. Taped to it, in Sol’s handwriting: THE NETWORK. DO NOT CUT. DO NOT SIT ON.'],
      ['subcable',27,9,3,1,'Cable bundle','A fat bundle of cables. A note: THIS ONE IS SAL’S. IT GOES UNDER THE DOME. IT IS THE ONLY THING THAT DOES.'],
      ['subrubble',10,9,2,1,'Rubble','A pile of rock. Somebody has stacked three of them very carefully and drawn a smiley face on the top one.'],
      ['subrubble',13,2,2,1,'Rubble','A pile of rock from the cave-in. A tiny paper flag in the middle: CLAIMED FOR LOS ANGELES.'],
      ['subrubble',27,2,2,1,'Rubble','A pile of rock. Another tiny paper flag, a little further on: CLAIMED FOR LONG ISLAND.'],
      ['subrubble',32,2,2,1,'Rubble','A pile of rock. Between the two flags, a third one: LET’S NOT FIGHT ABOUT THIS.'],
      ['subrubble',25,9,2,1,'Rubble','A pile of rock with a tiny green paper flag: CLAIMED FOR SOMEWHERE ELSE. Nobody has asked where that is.'],
      ['sublamp',30,9,1,1,'Work lamp','A tripod work lamp, on. A little battery light blinks at the base. Good for another eleven years, probably.'],
      ['sublamp',19,7,1,1,'Work lamp','A lamp on a post, lit. The light stops at the edge of the platform. The dark below does not give an inch.']
]}),
  planMerge({id:'subchamber',name:'Under the Amber',w:26,h:14,ground:'sub',wild:true,
    tag:'A cavern at the end of the bore. A wall of amber the size of a house. The sound of something that will not stop.',
    eyebrow:'THE SUB-RAIL / UNDER THE AMBER',
    hint:'The amber is Long Island’s dome, seen from below. The Drill Worm has been digging at it for years.',
    spawn:{x:3,y:4},
    // The way back is the tunnel mouth, top left, where the rails come out (tiles 1,3 and 2,3).
    exits:[[1,3,'subtunnel',33,3,'left','subfloor'],[2,3,'subtunnel',33,3,'left','subfloor']],
    // Painted plate (art/subchamber.webp, engine/plate.js). '#' blocks, '.' walks. Rock walls all round, the amber wall (it blocks until the
    // coins melt the doorway at 21,5 and 22,5), the two rubble piles on the north wall, the left pile, the barrel pile, the lower-right pile
    // and its crate, both tripod lamps. The rails, the open floor and the tunnel mouth walk.
    plateMask:[
      '##########################',
      '##########################',
      '##########################',
      '#..####...###.############',
      '##............###..#######',
      '##..................######',
      '##.....................###',
      '#####....................#',
      '#####................#####',
      '###..................#####',
      '####...............#######',
      '#######......#.....#######',
      '###############.##########',
      '##########################'],
    monsters:CH13_CHAMBER_SPOTS},
    planSub(SUBCHAMBER_PLAN),
    {objects:[
      ['subrubble',10,3,3,1,'Rubble','A pile of rock. A little hand-lettered sign: WORM CROSSING.'],
      ['subrubble',19,10,4,2,'Rubble','A pile of rock. A tiny pickaxe is stuck in the top of it, like a flag.'],
      ['subrubble',14,3,3,2,'Rubble','A pile of rock. It is very warm. It is the nearest thing to a pile of rock that is also a campfire.'],
      ['subrubble',1,7,4,2,'Rubble','A pile of rock. A hard hat balances on top. The initials inside say S.'],
      ['subrubble',21,8,3,2,'Rubble','A pile of rock. Somebody has written in the dust: HELLO? and underneath it, in different writing: HELLO!!!'],
      ['sublamp',6,3,1,1,'Work lamp','A tripod work lamp. It lights the whole cave a tired orange.'],
      ['sublamp',24,8,1,1,'Work lamp','A tripod work lamp. It is pointed straight at the amber, because the amber is the only interesting thing in the cave.']]})
);
