'use strict';
// data/maps-ch20.js — Chapter 20 "The Forever Engine & The Open Sky": the Stillness Core behind the Pinnacle lift, and the Forever Engine at the heart of it.
//   stillcore     The Stillness Core (26 x 17): a round-feeling chamber of brass and glass behind the sky clock. Eight sealed doors, one for each member of the family:
//                 north row Tom, Grace, Rose, Amy; middle row Deedee, Boppy, TNB, Nara. The Engine lift is in the middle (sealed until all eight are open).
//                 South: the gate and a fenced causeway down to the lift back to the Vault. A bench (swaps who fights) and a coffee urn (restore point) on the west side.
//                 Painted (art/stillcore.webp): the north row is on shelves, reached by the pillars at cols 6 and 20 (see the plateMask comment below).
//   foreverheart  The Forever Engine (22 x 15): the heart of the Clockwork Moon, a column of turning gears. The Chronos-Leviathan coils round it (data/ch20-monsters.js).
//                 After it shatters, Julian Vance sits where it was (phase 2 of the fight). The lift down is the south door.
// Ground is 'glass' (the Glass Tower look: engine/ch17-render.js), with its own props, 'ce*' (engine/ch20-render.js). Helpers glRoom and planGlass are in data/maps-ch17.js.
// Scenes: data/scenes-ch20.js. Battle: data/ch20-battle.js. Loaded after data/maps-ch19.js.
const STILLCORE_PLAN=glRoom(26,17,'f',[[12,16],[13,16]]);
const FOREVERHEART_PLAN=glRoom(22,15,'f',[[10,14],[11,14]]);
// The eight doors of the Core: who, where (x,y; each is 3 wide, 2 tall), what the panel is, and what the puzzle asks (data/scenes-ch20.js CH20_DOORS has the rest).
const CH20_DOOR_AT=[
  {who:'tom',x:3,y:3},{who:'grace',x:7,y:3},{who:'rose',x:17,y:3},{who:'amy',x:21,y:3},
  {who:'deedee',x:3,y:7},{who:'boppy',x:7,y:7},{who:'tnb',x:17,y:7},{who:'nara',x:21,y:7}];
const CH20_DOOR_NAME={tom:'The Codebreaker door',grace:'The Beam door',rose:'The Crawlspace door',amy:'The Sprint door',
  deedee:'The Garden Bridge door',boppy:'The Heavy Lever door',tnb:'The Rail Splice door',nara:'The Scent Trail door'};
LE_AREAS.push(
  planMerge({id:'stillcore',name:'The Stillness Core',w:26,h:17,ground:'glass',
    tag:'Behind every stopped clock, one more gear. Eight doors. Eight ways in.',
    eyebrow:'THE CLOCKWORK MOON / THE STILLNESS CORE',
    hint:'Eight sealed doors, one for each of you. Each one opens to a different skill. The bench swaps who fights.',
    spawn:{x:13,y:14},
    exits:[[13,16,'towervault',10,3,'down','glfloor'],[14,16,'towervault',11,3,'down','glfloor']],
    // Painted plate (art/stillcore.webp, engine/plate.js). '#' blocks, '.' walks. The gate at the bottom opens onto a fenced causeway (cols 13 and 14)
    // up to the Engine lift on the central dais (cols 12 to 15, rows 10 and 11, talked to from row 12). Row 13 is the wide floor in front of the
    // dais; its two rail tiles (cols 12 and 15) are left open so the causeway joins the floor. The four lower doors (Deedee, Boppy, TNB, Nara) are talked
    // to from row 9. The four upper doors (Tom, Grace, Rose, Amy) sit on shelves: the shelf is row 5, reached by the stone pillars at cols 6 and 20
    // (rows 5 to 8), which are walkable like a ladder. Left side: coffee station (cols 2 and 3, rows 10 and 11), plant (cols 4 and 5, rows 11 and 12),
    // bench (cols 1 and 2, rows 12 and 13). Right side: the little white box (col 21, rows 12 and 13). The doors and the lift stay live (liveKinds)
    // so they can light up as doors open.
    liveKinds:['cedoor','celift'],
    plateMask:[
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '###.......#######.......##',
      '######.#############.#####',
      '######.#############.#####',
      '######.#############.#####',
      '###........######.......##',
      '####......########......##',
      '######...##########.....##',
      '###.##...####..####..#..##',
      '###..................#..##',
      '#############..###########',
      '#############..###########',
      '#############..###########']},
    planGlass(STILLCORE_PLAN),
    {objects:[
      ...CH20_DOOR_AT.map(d=>['cedoor',d.x,d.y,3,2,CH20_DOOR_NAME[d.who],'A round brass door, sealed. A small panel beside it has a keyhole shaped like somebody.',{who:d.who}]),
      ['celift',12,10,4,2,'The Engine lift','A lift to the heart of the Moon. Eight small lamps run round its frame. They are all dark. A plaque: THE FOREVER ENGINE. FAMILY ENTRANCE ONLY.'],
      ['glbench',1,12,2,2,'The Core bench','THE CORE BENCH. Who sits out, who comes up front?',{swapbench:true,benchName:'THE CORE BENCH'}],
      ['glvend',2,10,2,2,'Coffee machine','A big copper coffee urn, plugged into the wall of a moon. A sticky note says: FOR THE FAMILY. THE REST OF THE BUILDING CAN WAIT. Everyone is completely restored.',{restore:true,restoreText:'A hot, strong coffee. It tastes like a Sunday. Everyone is completely restored.'}],
      ['glplant',4,11,2,2,'Potted plant','A potted plant in a moon. It has grown a whole new leaf since the sky clock stopped. Nobody told it not to.'],
      ['glsign',21,12,1,2,'Little white box','A little white box bolted to the floor, humming. It has one slot, shaped a bit like a keyhole. A label says: SPARE MINUTES. The slot is empty.',{sign:'WHITE BOX'}]]}),
  planMerge({id:'foreverheart',name:'The Forever Engine',w:22,h:15,ground:'glass',
    tag:'The heart of the Clockwork Moon. A column of gears, and everything it was ever afraid of.',
    eyebrow:'THE CLOCKWORK MOON / THE FOREVER ENGINE',
    hint:'The Chronos-Leviathan coils round the Engine. Four barriers hold it up. A relay breaks each one.',
    spawn:{x:10,y:12},
    exits:[[10,14,'stillcore',13,15,'up','glfloor'],[11,14,'stillcore',14,15,'up','glfloor']],
    monsters:[...CH20_HEART_SPOTS,...CH20_JULIAN_SPOTS],
    // Painted plate (art/foreverheart.webp, engine/plate.js). '#' blocks, '.' walks. Only the round floor walks: rows 8 to 10 across the platform, row 7 along the
    // front of the Engine's base (cols 7 to 14, so you can stand under the Leviathan at 11,5 and Julian at 11,6), both plants (cols 3 to 4 and 17 to 18, rows 10 to 11)
    // blocked, the balustrade posts either side of the gate (cols 8 and 13, row 11) blocked, and the gate lane (cols 10 to 11, rows 12 to 14) walks to the lift
    // doors. The gears, clocks and Engine are walls, each with a tall object box that reaches row 7 so it can be touched from the floor below.
    plateMask:[
      '######################',
      '######################',
      '######################',
      '######################',
      '######################',
      '######################',
      '######################',
      '#######........#######',
      '###................###',
      '##..................##',
      '##.##............##.##',
      '#####...#....#...#####',
      '##########..##########',
      '##########..##########',
      '##########..##########']},
    planGlass(FOREVERHEART_PLAN),
    {objects:[
      ['ceengine',7,0,8,7,'The Forever Engine','A column of gears the height of a tower, every one of them in mesh with every other, all turning in sync. Every tooth is a minute somebody wanted to keep. At the very top, a single brass hand points at 4:59.'],
      ['cegear',4,5,3,3,'A very large gear','A gear, half as tall as the room. The teeth are sharp and polished. It is the first gear in the Moon, and it has never once been oiled.'],
      ['cegear',15,5,3,3,'A very large gear','A gear that turns the other way. Every tooth has a very small name scratched on it.'],
      ['glclock',2,0,2,8,'Engine clock','It says 4:59. The hand has not moved. Under it somebody has scratched, very small, MISSED IT.'],
      ['glclock',18,0,2,8,'Engine clock','It says 4:59. This one is ticking, very faintly, as if it has begun to remember how.'],
      ['glplant',3,10,2,2,'Potted plant','A plant, in the heart of a Moon. It is leaning toward the south door, toward the lift, toward the rest of you.'],
      ['glplant',17,10,2,2,'Potted plant','A plant, thriving, which should not be possible and which nobody is going to point out.']]})
);
