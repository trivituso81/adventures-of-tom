'use strict';
// Chapter 8 close-up: the turntable lever (Tom 2026-11-12; plan claude/closeup-plan.md Row 7; LEVER mode in engine/closeup.js).
// Art (Art Library closeup-ch8-lever and closeup-ch8-lever-arm, baked by tools/art-library/bake_closeup_ch8.py):
//   art/closeup/ch8-lever.webp (the iron floor plate, curved slot, brass stops, hub; no arm), art/closeup/ch8-arm.webp (the arm alone, transparent).
// ch8Lever (data/scenes.js) opens it with {to:'east'|'north'}: east is the right-hand brass stop, north the left-hand one. The tip rests on a stop; the arm
// picture is drawn leaning 6.07 degrees clockwise of straight up (`lean`). Hub and tip are shares of the arm picture, from the bake.
CLOSEUP_DEFS.ch8={
  id:'ch8', ready:true, v:'closeup9', bg:'art/closeup/ch8-lever.webp',
  pivot:{x:.505,y:.749},
  arm:{img:'art/closeup/ch8-arm.webp', w:247, h:928, hub:[.4534,.847], tip:.0119, lean:6.07, len:.36},
  pos:{north:-43, east:86},
  lamp:{x:.07,y:.06,r:.16},
  caption:'TURNTABLE LEVER', pullLabel:'A  PULL', doneCaption:'CLANK.'
};
