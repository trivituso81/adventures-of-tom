'use strict';
// Chapter 4 close-up: the three junction boxes (Tom 2026-11-12; plan claude/closeup-plan.md Row 8; the "switch" variant of LEVER mode in engine/closeup.js, closeupSwitch).
// Art: parts cut from the approved Art Library sheet prop-find-ch04-parts (v2) by tools/art-library/bake_closeup_ch4.py into art/closeup/ch4-*.webp.
// There is no painted plate: the box sits on a code-drawn dark wall. Switch sits over the upper hole, lamp over the lower hole (shares of the box picture).
// Sizes (w, h) are the baked picture pixels. `scale` multiplies the part against the box picture size (box drawn at `boxW` of the plate width).
CLOSEUP_DEFS.ch4={
  id:'ch4', ready:true, v:'closeup10', kind:'switch',
  box:{img:{blue:'art/closeup/ch4-box-blue.webp',amber:'art/closeup/ch4-box-amber.webp',red:'art/closeup/ch4-box-red.webp'}, w:176, h:214, boxW:.5, cy:.56},
  holeSw:[.415,.258], holeLamp:[.415,.735],
  sw:{up:{img:'art/closeup/ch4-sw-up.webp',w:149,h:218,anchor:[.47,.74]}, down:{img:'art/closeup/ch4-sw-down.webp',w:127,h:187,anchor:[.49,.22]}, scale:.6},
  lamp:{off:'art/closeup/ch4-lamp-off.webp', on:{blue:'art/closeup/ch4-lamp-blue.webp',amber:'art/closeup/ch4-lamp-amber.webp',red:'art/closeup/ch4-lamp-red.webp'}, w:117, h:117, anchor:[.5,.48], scale:.62,
        glow:{blue:'#4aa8ff',amber:'#ffb43a',red:'#ff4a3a'}},
  caption:'JUNCTION BOX', pullLabel:'A  THROW'
};
