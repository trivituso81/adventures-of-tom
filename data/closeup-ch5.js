'use strict';
// Chapter 5 close-up: setting the hallway clock to seven (Tom 2026-11-12; plan claude/closeup-plan.md Row 6; DIAL mode in engine/closeup.js).
// Art (Art Library closeup-ch5-clock and closeup-ch5-hands, baked by tools/art-library/bake_closeup_ch5.py):
//   art/closeup/ch5-clock.webp (square plate: the face, no hands), ch5-hour.webp and ch5-minute.webp (the two hands, transparent, pivot at the hub).
// The hands turn about the pivot; the four times are the ones the old text menu offered. Only 7:00 is right.
// Wrong times keep Amy's three "Seven" lines (ch5Clock in data/scenes.js). One plate serves all three clocks.
// Geometry from the bake: pivot = the brass hub in the face; hand hubs and tips are shares of each hand picture; len is tip to hub as a share of the plate.
CLOSEUP_DEFS.ch5={
  id:'ch5', ready:true, v:'closeup8', bg:'art/closeup/ch5-clock.webp', start:0, answer:1,
  pivot:{x:.503,y:.477},
  hands:[
    {img:'art/closeup/ch5-hour.webp',   w:45, h:206, hub:[.481,.890], tip:.0146, len:.24},
    {img:'art/closeup/ch5-minute.webp', w:43, h:223, hub:[.487,.899], tip:.0135, len:.36}],
  times:[
    {label:'6:30',  deg:[195,180]},
    {label:'7:00',  deg:[210,0]},
    {label:'7:45',  deg:[232.5,270]},
    {label:'12:00', deg:[0,0]}],
  caption:label=>'Set it to what time?  ·  '+label
};
