'use strict';
// data/maps-ch20.js — Chapter 20 "The Forever Engine & The Open Sky": the Stillness Core behind the Pinnacle lift, and the Forever Engine at the heart of it.
//   stillcore     The Stillness Core (26 x 17): a round-feeling chamber of brass and glass behind the sky clock. Eight sealed doors, one for each member of the family:
//                 north row Tom, Grace, Rose, Amy; middle row Deedee, Boppy, TNB, Nara. The Engine lift is in the middle (sealed until all eight are open).
//                 South: the lift back down to the Vault. A bench (swaps who fights) and a coffee machine (restore point) by the south wall.
//   foreverheart  The Forever Engine (22 x 15): the heart of the Clockwork Moon, a column of turning gears. The Chronos-Leviathan coils round it (data/ch20-monsters.js).
//                 After it shatters, Julian Vance sits where it was (phase 2 of the fight). The lift down is the south door.
// Ground is 'glass' (the Glass Tower look: engine/ch17-render.js), with its own props, 'ce*' (engine/ch20-render.js). Helpers glRoom and planGlass are in data/maps-ch17.js.
// Scenes: data/scenes-ch20.js. Battle: data/ch20-battle.js. Loaded after data/maps-ch19.js.
const STILLCORE_PLAN=glRoom(26,17,'f',[[12,16],[13,16]]);
const FOREVERHEART_PLAN=glRoom(22,15,'f',[[10,14],[11,14]]);
// The eight doors of the Core: who, where (x,y; each is 3 wide, 2 tall), what the panel is, and what the puzzle asks (data/scenes-ch20.js CH20_DOORS has the rest).
const CH20_DOOR_AT=[
  {who:'tom',x:2,y:2},{who:'grace',x:8,y:2},{who:'rose',x:15,y:2},{who:'amy',x:21,y:2},
  {who:'deedee',x:2,y:8},{who:'boppy',x:8,y:8},{who:'tnb',x:15,y:8},{who:'nara',x:21,y:8}];
const CH20_DOOR_NAME={tom:'The Codebreaker door',grace:'The Beam door',rose:'The Crawlspace door',amy:'The Sprint door',
  deedee:'The Garden Bridge door',boppy:'The Heavy Lever door',tnb:'The Rail Splice door',nara:'The Scent Trail door'};
LE_AREAS.push(
  planMerge({id:'stillcore',name:'The Stillness Core',w:26,h:17,ground:'glass',
    tag:'Behind every stopped clock, one more gear. Eight doors. Eight ways in.',
    eyebrow:'THE CLOCKWORK MOON / THE STILLNESS CORE',
    hint:'Eight sealed doors, one for each of you. Each one opens to a different skill. The bench swaps who fights.',
    spawn:{x:12,y:14},
    exits:[[12,16,'towervault',10,3,'down','glfloor'],[13,16,'towervault',11,3,'down','glfloor']]},
    planGlass(STILLCORE_PLAN),
    {objects:[
      ...CH20_DOOR_AT.map(d=>['cedoor',d.x,d.y,3,2,CH20_DOOR_NAME[d.who],'A round brass door, sealed. A small panel beside it has a keyhole shaped like somebody.',{who:d.who}]),
      ['celift',10,11,6,3,'The Engine lift','A lift to the heart of the Moon. Eight small lamps run round its frame. They are all dark. A plaque: THE FOREVER ENGINE. FAMILY ENTRANCE ONLY.'],
      ['cegear',1,5,2,2,'A very large gear','A gear as tall as a person, turning very slowly. It goes through one tooth every second, and then, exactly on the minute, waits.'],
      ['cegear',23,5,2,2,'A very large gear','A gear the size of a bus tire. It is turning backwards. Nobody seems to mind.'],
      ['glclock',11,2,4,1,'Core clock','A big clock. It says 4:59. The second hand is leaning forward as far as it can, like a runner at a line.'],
      ['glbench',2,14,3,1,'The Core bench','THE CORE BENCH. Who sits out, who comes up front?',{swapbench:true,benchName:'THE CORE BENCH'}],
      ['glvend',21,14,1,1,'Coffee machine','A coffee machine, plugged into the wall of a moon. A sticky note says: FOR THE FAMILY. THE REST OF THE BUILDING CAN WAIT. Everyone is completely restored.',{restore:true,restoreText:'A hot, strong coffee. It tastes like a Sunday. Everyone is completely restored.'}],
      ['glplant',6,14,1,1,'Potted plant','A potted plant in a moon. It has grown a whole new leaf since the sky clock stopped. Nobody told it not to.']]}),
  planMerge({id:'foreverheart',name:'The Forever Engine',w:22,h:15,ground:'glass',
    tag:'The heart of the Clockwork Moon. A column of gears, and everything it was ever afraid of.',
    eyebrow:'THE CLOCKWORK MOON / THE FOREVER ENGINE',
    hint:'The Chronos-Leviathan coils round the Engine. Four barriers hold it up. A relay breaks each one.',
    spawn:{x:10,y:12},
    exits:[[10,14,'stillcore',12,15,'up','glfloor'],[11,14,'stillcore',13,15,'up','glfloor']],
    monsters:[...CH20_HEART_SPOTS,...CH20_JULIAN_SPOTS]},
    planGlass(FOREVERHEART_PLAN),
    {objects:[
      ['ceengine',7,2,8,5,'The Forever Engine','A column of gears the height of a tower, every one of them in mesh with every other, all turning in sync. Every tooth is a minute somebody wanted to keep. At the very top, a single brass hand points at 4:59.'],
      ['cegear',2,4,2,2,'A very large gear','A gear, half as tall as the room. The teeth are sharp and polished. It is the first gear in the Moon, and it has never once been oiled.'],
      ['cegear',18,4,2,2,'A very large gear','A gear that turns the other way. Every tooth has a very small name scratched on it.'],
      ['glclock',3,1,2,1,'Engine clock','It says 4:59. The hand has not moved. Under it somebody has scratched, very small, MISSED IT.'],
      ['glclock',17,1,2,1,'Engine clock','It says 4:59. This one is ticking, very faintly, as if it has begun to remember how.'],
      ['glplant',2,11,1,1,'Potted plant','A plant, in the heart of a Moon. It is leaning toward the south door, toward the lift, toward the rest of you.'],
      ['glplant',19,11,1,1,'Potted plant','A plant, thriving, which should not be possible and which nobody is going to point out.']]})
);
