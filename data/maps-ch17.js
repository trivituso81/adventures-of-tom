'use strict';
// data/maps-ch17.js — Chapter 17 maps: Julian Vance's 60-story Glass Tower in Downtown LA ("the Tower of Stillness"). Same spec format as
// data/maps-ch13.js (planMerge, pools, tiles, objects, exits). Loaded after data/maps-ch13.js, before engine/world.js builds the areas.
//   towerlobby    The Lobby (floor 1): polished glass, a reception desk, a wall of framed happy afternoons. Doors: out to the boulevard (south),
//                 the stairwell (east).
//   towerstairs   The Stairwell (floors 2 to 30): a tall switchback, eight landings, a Stillness guard on each of seven. Landing 30 has a sealed door
//                 and a service hatch to the Shelf Hall.
//   towershelves  The Shelf Hall (floors 30 and 31): the Archivist's collection. Six smashable shelves, each a town that was paused on its
//                 happiest afternoon (scene ch17Smash). West: the hatch back to the stairs. East: the express lift.
//   towervault    The Vault (floor 59): the Archivist's own room. The snow globe of Long Island sits on a plinth under the Twin Lenses.
// Plan characters: 'W' glass wall, 'f' polished floor, 's' stair treads, 'c' archive carpet.
// Renderer: engine/ch17-render.js. Monsters: data/ch17-monsters.js. Scenes: data/scenes-ch17.js.
const GL_TILES={f:'glfloor',s:'glstair',c:'glcarpet'};
function planGlass(plan) {
  const walls=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(GL_TILES[c]) (floors[GL_TILES[c]]=floors[GL_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:walls.length?[{tile:'glwall',cells:walls}]:[],objects:[]};
}
// A room: walls round the edge (rows 0 and 1 are the glass wall you look out of), floor everywhere else; `cut` cells are floor on the border (the doors).
function glRoom(w,h,floor,cut=[]) {
  const rows=[];
  for(let y=0;y<h;y++) { let r='';
    for(let x=0;x<w;x++) r+=(y<2||y>=h-1||x===0||x===w-1)&&!cut.some(([a,b])=>a===x&&b===y)?'W':floor;
    rows.push(r); }
  return rows;
}
const TOWERLOBBY_PLAN=glRoom(22,14,'f',[[10,13],[11,13],[21,8],[21,9]]);
// The stairwell, 18 x 42: eight landings (3 rows tall, x 1 to 16) with two-row flights between them. The flights alternate right, left, right...
// Landing k sits at y0=38-5k (k=0 at the bottom, k=7 at the top = floor 30). The flight into landing k is at rows y0+3 and y0+4.
const TOWERSTAIRS_PLAN=(()=>{
  const g=Array.from({length:42},()=>Array(18).fill('W'));
  for(let k=0;k<8;k++) { const y0=38-5*k;
    for(let y=y0;y<y0+3;y++) for(let x=1;x<=16;x++) g[y][x]='f';
    if(k>=1) { const xs=k%2?[15,16]:[1,2]; for(const y of [y0+3,y0+4]) for(const x of xs) g[y][x]='s'; } }
  for(const y of [39,40]) g[y][0]='f';   // the door from the lobby
  return g.map(r=>r.join(''));
})();
const TOWERSHELVES_PLAN=glRoom(28,14,'c',[]).map((r,y)=>y>=12?'W'.repeat(28):r);
const TOWERVAULT_PLAN=glRoom(22,14,'f',[[10,13],[11,13]]);
// The six shelves in the Shelf Hall, in order: north wall left, middle, right; south wall left, middle, right.
const CH17_SHELVES=[[3,2],[11,2],[19,2],[3,10],[11,10],[19,10]];
const CH17_TOWNS=[
  {id:0,town:'Dunmore, PA',moment:'the Pierogi Festival, 1993, 2:14 PM',look:'A diorama of a church parking lot under a banner that says PIEROGI FEST. A tiny man holds one tiny pierogi up to his tiny mouth. He has been about to take the bite for a very long time.'},
  {id:1,town:'Tallulah Falls',moment:'the Fourth of July, 4:59 PM',look:'A tiny town green with a tiny crowd on blankets, all looking up. One firework hangs at the top of its arc, lit, not going off. A plaque says: ALMOST.'},
  {id:2,town:'Cedar Hollow',moment:'the Little League final, bottom of the ninth',look:'A tiny ball field. A ball is in the air over left field, and nine tiny kids and one tiny dad are looking at it with their mouths open. Nobody has blinked since the spring.'},
  {id:3,town:'Port Gilly',moment:'the last ferry, 6:00 PM',look:'A tiny dock and a tiny ferry with its gangway still down. A tiny woman is running down the pier with a suitcase. She has been running for eleven years. She will not make it. That was the whole point.'},
  {id:4,town:'Hickory Bend',moment:'the County Fair pie judging',look:'A tiny tent and a long table of tiny pies. A tiny judge holds a tiny fork over the winner. A tiny baker in the front row is biting her knuckle, hoping.'},
  {id:5,town:'Lower Brightwater',moment:'a wedding, right before the kiss',look:'A tiny barn with tiny lights. Two tiny people lean in toward each other and stop. A tiny flower girl is sticking out her tongue at the camera.'}];
const CH17_SHELF_NAMES=['Shelf 1 · Dunmore','Shelf 2 · Tallulah Falls','Shelf 3 · Cedar Hollow','Shelf 4 · Port Gilly','Shelf 5 · Hickory Bend','Shelf 6 · Lower Brightwater'];
LE_AREAS.push(
  planMerge({id:'towerlobby',name:'The Glass Tower',w:22,h:14,ground:'glass',
    tag:'Sixty floors of glass. Every clock in the lobby says 4:59.',
    eyebrow:'LOS ANGELES / THE GLASS TOWER · FLOOR 1',
    hint:'The stairs are on the east side. The lifts are out of order. Everything is out of order. Nothing is moving.',
    spawn:{x:10,y:11},
    exits:[[10,13,'blvd',12,9,'down','glfloor'],[11,13,'blvd',14,9,'down','glfloor'],[21,8,'towerstairs',1,39,'right','glfloor'],[21,9,'towerstairs',1,40,'right','glfloor']]},
    planGlass(TOWERLOBBY_PLAN),
    {objects:[
      ['gldesk',8,4,6,1,'Reception desk','A long glass reception desk. A nameplate says WELCOME. A second nameplate says WELCOME BACK. A third says YOU WERE NEVER HERE.'],
      ['gldir',3,2,3,1,'Floor directory','FLOOR DIRECTORY. 1 LOBBY. 2 TO 29 STILLNESS. 30 TO 36 ARCHIVE. 37 TO 58 MORE ARCHIVE. 59 THE VAULT. 60 MR. VANCE. A smaller line, handwritten: IF YOU CAN READ THIS, YOU ARE HERE ON PURPOSE.'],
      ['glframes',15,2,5,1,'Happy afternoons','A wall of framed photographs, every one of a different town at its happiest moment. Nobody in any of them is looking at the camera. Everybody is looking at something just out of frame, smiling. There is a gap in the wall the size of one more frame.'],
      ['glclock',10,1,2,1,'Lobby clock','A big round clock above the desk. It says 4:59. The second hand is vibrating in place, like it is trying very hard.'],
      ['glvend',12,2,1,1,'Coffee machine','A coffee machine in the lobby. A card on it says: ON PAUSE. Somebody has crossed out PAUSE and written BREW. Everyone is completely restored.',{restore:true,restoreText:'A hot cup of coffee in a building where nothing else is warm. Everyone is completely restored.'}],
      ['glplant',2,5,1,1,'Potted plant','A plant in a glass pot. It has not grown an inch. It is the healthiest plant you have ever seen, and it looks terrified.'],
      ['glplant',19,5,1,1,'Potted plant','A plant. A tiny tag says: DO NOT WATER. DO NOT TOUCH. DO NOT NOTICE IT HAS BEEN THE SAME SIZE SINCE 2009.'],
      ['glplant',2,10,1,1,'Potted plant','A potted plant. A single leaf is beginning to move. It is moving so slowly that it takes a moment to be sure.'],
      ['glplant',19,10,1,1,'Potted plant','A potted fern. Somebody has put a sticky note on it that says THRIVING. It is a lie, and it is a very polite lie.'],
      ['glbench',4,9,3,1,'Lobby bench','A glass bench. It is warm. Somebody was just sitting here. Nobody was just sitting here.'],
      ['glbench',15,9,3,1,'Lobby bench','A glass bench. A visitor badge sits on the seat. It says GUEST, and under that, FOREVER.'],
      ['glelev',1,6,1,3,'Lifts','THE LIFTS. OUT OF SERVICE. A sign over the call button: STILLNESS LOCK ENGAGED. A smaller sign: WE ARE SORRY FOR ANY CONVENIENCE.'],
      ['glsign',19,7,2,1,'Stairs sign','STAIRS. FLOORS 2 TO 30. The arrow points east, to a door. Somebody has taped a note to it: ONLY 28 FLIGHTS.',{sign:'STAIRS'}]]}),
  planMerge({id:'towerstairs',name:'The Stairwell',w:18,h:42,ground:'glass',wild:true,
    tag:'Twenty-eight flights. The railing is cold. The numbers on the doors count up, and nothing else does.',
    eyebrow:'THE GLASS TOWER / THE STAIRWELL · FLOORS 2 TO 30',
    hint:'Climb. The flights switch back, left and right. The coffee machines are restore points. Landing 30 is the top.',
    spawn:{x:2,y:39},
    exits:[[0,39,'towerlobby',20,8,'left','glfloor'],[0,40,'towerlobby',20,9,'left','glfloor']],
    monsters:CH17_STAIR_SPOTS},
    planGlass(TOWERSTAIRS_PLAN),
    {objects:[
      ['glsign',8,37,2,1,'Floor sign','FLOOR 2. STILLNESS. A tiny sign under it: PLEASE DO NOT RUN. A smaller sign under that: PLEASE DO NOT WALK. A third one: PLEASE.',{sign:'FLOOR 2'}],
      ['glsign',8,32,2,1,'Floor sign','FLOOR 6. Somebody has scratched into the paint with a coin: I WAS HERE FOR A SECOND. THEN IT WAS 1993.',{sign:'FLOOR 6'}],
      ['glsign',8,27,2,1,'Floor sign','FLOOR 10. A faded poster on the door shows a smiling family in front of a lake. Their shadows point in different directions.',{sign:'FLOOR 10'}],
      ['glvend',12,27,1,1,'Coffee machine','A coffee machine bolted to the stairwell wall at landing 10. A sticky note: UNPAUSE ME. Everyone is completely restored.',{restore:true,restoreText:'Hot coffee on a landing. Everyone is completely restored, and a little annoyed it works.'}],
      ['glsign',8,22,2,1,'Floor sign','FLOOR 14. A tally of scratches on the wall in groups of five. They stop at forty-one. Somebody has written under it: NOBODY LASTED.',{sign:'FLOOR 14'}],
      ['glsign',8,17,2,1,'Floor sign','FLOOR 18. A framed notice: THE BUILDING WILL BE CLOSED FOR A MOMENT. THANK YOU FOR YOUR PATIENCE. The date on it has been smudged out.',{sign:'FLOOR 18'}],
      ['glvend',12,17,1,1,'Coffee machine','A coffee machine on landing 18. The button says COFFEE. It has been pressed a great many times by someone who needed it.',{restore:true,restoreText:'Hot coffee at the halfway point. Everyone is completely restored.'}],
      ['glsign',8,12,2,1,'Floor sign','FLOOR 22. Pinned to the door: a child’s drawing of a sun with a face. Underneath, in careful capitals: THIS IS THE LAST ONE.',{sign:'FLOOR 22'}],
      ['glsign',8,7,2,1,'Floor sign','FLOOR 26. The numbers on the door are very slightly too tall. They have been getting taller. The building is trying to get out.',{sign:'FLOOR 26'}],
      ['glvend',12,7,1,1,'Coffee machine','The last coffee machine before landing 30. A sticky note: GO. YOU’RE ALMOST THERE. I BELIEVE IN YOU. Everyone is completely restored.',{restore:true,restoreText:'The last hot coffee before the seal. Everyone is completely restored.'}],
      ['glsealdoor',8,2,2,1,'Sealed door','A heavy glass door with a gold lock the size of a dinner plate. Above it, a counter: LOCKS ENGAGED 6 OF 6. Under that, in tiny type: FLOORS 31 AND UP ARE NOT CURRENTLY AVAILABLE.'],
      ['glhatch',2,2,2,1,'Service hatch','A square service hatch in the wall, with a wheel and a sticker: STAFF ONLY. A second sticker, in marker: HE IS OBVIOUSLY STAFF.'],
      ['glsign',13,2,3,1,'Floor sign','FLOOR 30. ARCHIVE LEVEL. A brass plate: THE COLLECTION IS ON THE OTHER SIDE. PLEASE DO NOT TOUCH IT.',{sign:'FLOOR 30'}]]}),
  planMerge({id:'towershelves',name:'The Shelf Hall',w:28,h:14,ground:'glass',wild:true,
    tag:'Six shelves, and on each one a whole town that was paused on its happiest afternoon.',
    eyebrow:'THE GLASS TOWER / THE ARCHIVE · FLOORS 30 TO 31',
    hint:'Smash the shelves. Every shelf you smash lets a town go on with its afternoon. The coffee machine is a restore point.',
    spawn:{x:2,y:6},
    monsters:CH17_SHELF_SPOTS},
    planGlass(TOWERSHELVES_PLAN),
    {objects:[
      ...CH17_SHELVES.map(([x,y],i)=>['towershelf',x,y,4,2,CH17_SHELF_NAMES[i],CH17_TOWNS[i].look,{shelf:i}]),
      ['glhatch',0,6,1,2,'Service hatch','The hatch back to the stairwell, on the landing at floor 30. The wheel is warm from where somebody leaned on it.'],
      ['glelev',27,5,1,3,'Express lift','THE EXPRESS LIFT. A tiny panel over the button says FLOORS 31 TO 59. A second line says STILLNESS LOCK: ENGAGED.'],
      ['glvend',14,2,1,1,'Coffee machine','A coffee machine in the Archive. A sticky note: THE EXHIBITS DO NOT NEED COFFEE. THE VISITORS MIGHT. Everyone is completely restored.',{restore:true,restoreText:'Hot coffee in the one room in the building where everything is on a shelf. Everyone is completely restored.'}],
      ['glsign',8,1,3,1,'Hall sign','THE ARCHIVE, LEVEL ONE. THE COLLECTION. PLEASE DO NOT TOUCH. PLEASE DO NOT BREATHE ON THE EXHIBITS. PLEASE DO NOT BE LOUD ABOUT THE DUST.',{sign:'THE ARCHIVE'}],
      ['glcase',1,4,1,2,'Display case','A little glass case with a tiny cardboard sign: NOT YET ARCHIVED. It is empty. It has been cleaned very recently, in case.'],
      ['glcase',26,9,1,2,'Display case','A little glass case. Inside it, a tiny paper tag on a tiny string: THE NEXT ONE.'],
      ['glclock',18,1,2,1,'Archive clock','A big clock. It says 4:59. Under it somebody has written, in very small capitals: THIS IS FINE.']]}),
  planMerge({id:'towervault',name:'The Vault',w:22,h:14,ground:'glass',
    tag:'Floor 59. One plinth, one snow globe, one very big lens.',
    eyebrow:'THE GLASS TOWER / THE VAULT · FLOOR 59',
    hint:'The lift to the top is at the north wall. The bench swaps who fights. The coffee machine is a restore point.',
    spawn:{x:10,y:11},
    exits:[[10,13,'towerlobby',10,11,'up','glfloor'],[11,13,'towerlobby',11,11,'up','glfloor']],
    monsters:CH17_VAULT_SPOTS},
    planGlass(TOWERVAULT_PLAN),
    {objects:[
      ['glplinth',9,6,4,2,'The snow globe','A snow globe the size of a beach ball on a glass plinth. Inside it is the Square, very small. The fountain, the library, the camera on its tripod, and two stone figures holding each other up. The snow is falling on them. A little amber light crawls along their joined hands.'],
      ['glelev',9,1,4,1,'Pinnacle lift','A gold lift door, floor to ceiling, with no call button at all. A small brass plate says: FLOOR 60. BY INVITATION.'],
      ['glcase',2,4,2,2,'Display case','A glass case of tiny diorama towns, all lit from inside, all so happy. The little plaque says: SIXTY-ONE TOWNS. ONE COAST. ONE FAMILY.'],
      ['glcase',2,8,2,2,'Display case','A glass case. Inside, a tiny armchair, a tiny cup of tea, a tiny dog on the rug. Nobody is in the chair. The tea is still warm.'],
      ['glcase',18,4,2,2,'Display case','A glass case. A tiny kitchen with a tiny pie in the window. It has been cooling for years. Somebody is a little hungry.'],
      ['glcase',18,8,2,2,'Display case','A glass case. A tiny brass plaque: THE FAMILY OF THE ANCHOR. UNDERNEATH, A SMALLER PLAQUE: RESERVED.'],
      ['glbench',4,11,3,1,'The Archive bench','THE ARCHIVE BENCH. Who sits out, who comes up front?',{swapbench:true,benchName:'THE ARCHIVE BENCH'}],
      ['glvend',16,2,1,1,'Coffee machine','A coffee machine in the Vault. The button has been taped over. Somebody has peeled the tape back, very neatly, with one finger. Everyone is completely restored.',{restore:true,restoreText:'A last hot coffee before the Lenses. Everyone is completely restored.'}],
      ['glsign',16,12,3,1,'Freight lift sign','FREIGHT LIFT TO THE LOBBY. A hand-lettered note: ONLY GO DOWN IF YOU ARE LEAVING. ALL OTHER DIRECTIONS ARE UP.',{sign:'FREIGHT LIFT'}]]})
);
