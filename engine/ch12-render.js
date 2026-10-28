'use strict';
// engine/ch12-render.js — The look of chapter 12 (Part 2): Monochrome Marlowe greys out Jefferson Park, and the neighbors he
// catches are set in amber.
//   Grey block: while flag ch12-grey is on (and the map is Jefferson Park) the whole street fades to grey with a saturation
//   blend drawn over the world; it ramps in and out over about a second and a half. Cleared when Gridlock Prime is beaten.
//   Amber: any NPC with `amber` set (data/scenes-ch12.js STORY_WORLD) is drawn inside a block of amber glass on top of the grey,
//   so the frozen neighbors are the only warm thing left on the block. Indoors there is no grey, only the amber.
// Wraps b7DrawMapFx (the last world-space pass in draw()). Loaded after engine/story.js.
const LE_b7DrawMapFx_ch12=b7DrawMapFx;
let ch12Grey=0,ch12GreyLast=0;
function ch12Amber(n) {
  const p=position(n),cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2);
  ellipse(cx,base+1,17,5,'#2b2a2640');
  gfx.save();
  gfx.globalAlpha=.52; rect(cx-14,base-56,28,56,'#f2a92e');
  gfx.globalAlpha=.4; rect(cx-14,base-14,28,14,'#a8641a'); rect(cx-14,base-56,28,4,'#ffd27a');
  gfx.globalAlpha=.85; rect(cx-14,base-56,28,2,'#7a4a12'); rect(cx-14,base-2,28,2,'#7a4a12'); rect(cx-14,base-56,2,56,'#7a4a12'); rect(cx+12,base-56,2,56,'#7a4a12');
  gfx.globalAlpha=.9; rect(cx-10,base-50,3,34,'#fff3c4'); rect(cx-10,base-14,3,3,'#fff3c4'); rect(cx+6,base-46,2,10,'#fff3c4');
  gfx.restore();
}
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch12(time);
  const dt=Math.min(.1,Math.max(0,time-ch12GreyLast)); ch12GreyLast=time;
  const on=typeof STORY!=='undefined'&&STORY.mode==='full'&&STORY.chapter===12&&!!flag('ch12-grey')&&currentMap.id==='jpark';
  ch12Grey=on?Math.min(1,ch12Grey+dt*.7):Math.max(0,ch12Grey-dt*.7);
  if(ch12Grey>0) {
    gfx.save(); gfx.globalCompositeOperation='saturation'; gfx.globalAlpha=Math.min(.94,ch12Grey);
    rect(Math.round(camera.x)-8,Math.round(camera.y)-8,W+16,H+16,'#808080');
    gfx.restore();
    gfx.save(); gfx.globalAlpha=ch12Grey*.14; rect(Math.round(camera.x)-8,Math.round(camera.y)-8,W+16,H+16,'#4a5060'); gfx.restore();
  }
  for(const n of currentMap.npcs) if(n.amber&&!n.hidden) ch12Amber(n);
};
