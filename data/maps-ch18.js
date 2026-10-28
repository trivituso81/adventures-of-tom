'use strict';
// data/maps-ch18.js — Chapter 18 "No Touching, Please.": the top of the Glass Tower.
//   towerpinnacle  The Chronos Loom Chamber (floor 60): a round-feeling room of glass and gold thread, with the Chronos Loom against the north wall.
//                  Julian Vance waits in front of it (the boss, data/ch18-monsters.js). The lift down is the south door.
// Uses the glass helpers from data/maps-ch17.js (glRoom, planGlass). Renderer: engine/ch18-render.js. Scenes: data/scenes-ch18.js. Loaded after data/maps-ch17.js.
const TOWERPINNACLE_PLAN=glRoom(22,15,'f',[[10,14],[11,14]]);
LE_AREAS.push(
  planMerge({id:'towerpinnacle',name:'The Chronos Loom',w:22,h:15,ground:'glass',
    tag:'Floor 60. The top of the world, and a loom the size of a house.',
    eyebrow:'THE GLASS TOWER / THE PINNACLE · FLOOR 60',
    hint:'The Loom is at the north wall. So is Mr. Vance.',
    spawn:{x:10,y:12},
    exits:[[10,14,'towervault',10,3,'down','glfloor'],[11,14,'towervault',11,3,'down','glfloor']],
    monsters:CH18_PINNACLE_SPOTS},
    planGlass(TOWERPINNACLE_PLAN),
    {objects:[
      ['glloom',5,2,12,3,'The Chronos Loom','A loom the size of a house. Thousands of gold threads run from it up through the ceiling, and every thread hums. Woven into the cloth, very small: a pierogi festival, a ferry, a wedding, a little league game. All of them paused. All of them warm.'],
      ['glclock',3,1,2,1,'Pinnacle clock','It says 4:59. The second hand is stuck one tick before the minute, like it is holding its breath.'],
      ['glclock',17,1,2,1,'Pinnacle clock','It says 4:59. This one is a little warmer than the others, and nobody can say why.'],
      ['glcase',2,6,2,2,'Display case','A glass case with a tiny table set for eight. There is a pie in the middle, a dog bed under it, and an empty chair at the end with a small thermos on the seat. A plaque: THE FAMILY OF THE ANCHOR. HELD, WITH LOVE.'],
      ['glcase',18,6,2,2,'Display case','A glass case with a tiny yellow raincoat on a tiny hook beside a tiny front door. The hook is the right height for somebody small. The plaque says one word: WAITING.'],
      ['glplant',2,11,1,1,'Potted plant','A potted plant. It is the only thing in this room that has grown at all. Nobody has said so out loud.'],
      ['glplant',19,11,1,1,'Potted plant','A potted plant, in the sunlight. Its newest leaf has come out of the pot sideways, as if it was trying to see through the glass.']]})
);
