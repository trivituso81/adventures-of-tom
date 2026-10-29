'use strict';
// data/townsfolk-hires-use.js: overworld sprites for Pip, Moss, Dot, Gus, Bean, Reel and Principal Pruitt, from their painted walk sheets
// (data/townsfolk-hires.js, art/chars/<id>-ow.webp). Loads right after data/npc-sprites.js and data/ellie-hires-use.js.
// Reel, Pruitt, Halverson, Ike, Delgado and Kowalski replace their OW sets (the old traced ones). Pip, Moss, Dot, Gus, Bean, Page and Bun are keyed by NAME (TOWN_PAINTED, read in drawActor):
// their look keys pip, dot, gus, bean, bun, kit and oolong are also borrowed as stand-in bodies for Deedee, Boppy, Amy and Justin in story scenes,
// so only an actor really named Pip, Moss, Dot, Gus or Bean gets the painted art. Set TOWNSFOLK_HIRES_OFF=true (before this file) to keep the old ones.
var TOWN_PAINTED={};
(function() {
  if(typeof TOWNSFOLK_HIRES==='undefined'||(typeof TOWNSFOLK_HIRES_OFF!=='undefined'&&TOWNSFOLK_HIRES_OFF)) return;
  const make=id=>{
    const D=TOWNSFOLK_HIRES[id],at='tf_'+id;
    paintedAtlas(at,D.src,D.rects,D.k);
    // The sheets draw everyone facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
    const mk=(d,flip)=>['stand','step1','step2'].map(n=>{
      const rows=D[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),at,d+'_'+n,flip); });
    const set={pal:D.pal,down:mk('down'),up:mk('up'),side:mk('left',true)};
    set.left=set.side.map(mirrorRows);
    return set;
  };
  OW.reel=make('reel');
  OW.pruitt=make('pruitt');
  for(const id of ['halverson','ike','delgado','kowalski']) OW[id]=make(id);   // school staff and visitors: their look keys are used by no one else
  for(const [name,id] of [['Pip','pip'],['Moss','moss'],['Dot','dot'],['Gus','gus'],['Bean','bean'],['Page','page'],['Bun','bun'],['Sal','sal'],['Kit','kit'],['Luna','luna'],['Penny','penny'],['Oolong','oolong'],['Fern','fern']]) {
    OW['tf_'+id]=make(id);
    TOWN_PAINTED[name]={look:id,set:'tf_'+id};
  }
})();
