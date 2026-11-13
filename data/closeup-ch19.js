'use strict';
// Chapter 19 close-up: each keepsake is set on the Dead-Letter Office pedestal (Tom 2026-11-12; plan claude/closeup-plan.md Row 2; closeupPlaceDef in engine/closeup.js).
// Art (Art Library closeup-ch19-pedestal and closeup-ch19-keepsakes, baked by tools/art-library/bake_closeup_ch19.py):
//   art/closeup/ch19-pedestal.webp (square plate, one dent in the middle), ch19-grace|rose|amy|tnb.webp (384 px keepsakes)
// SCENES.ch19Keep (data/scenes-ch19.js) plays {closeupWatch:'ch19-<who>'} after "You set down <item>", before the put line, flag and after text.
// The dent is at (.50,.42) of the plate (measured on the approved picture); if the plate is rebaked check that point.
const CH19_PLACE={
  grace:{color:'#ffd24a',size:.27,start:'THE PEDESTAL IS WAITING. THE SQUISHY.',end:'THE PEDESTAL LIGHTS GOLD'},
  rose:{color:'#ff8fb4',size:.30,start:'THE PEDESTAL IS WAITING. THE RIBBON.',end:'THE PEDESTAL HUMS PINK'},
  amy:{color:'#bfe6ff',size:.26,start:'THE PEDESTAL IS WAITING. THE STOPWATCH.',end:'THE STOPWATCH TICKS'},
  tnb:{color:'#ffb347',size:.27,start:'THE PEDESTAL IS WAITING. THE FIRST CUP.',end:'THE CUP FILLS WARM',seam:true}};
Object.keys(CH19_PLACE).forEach(w=>{ const p=CH19_PLACE[w];
  CLOSEUP_DEFS['ch19-'+w]=closeupPlaceDef({id:'ch19-'+w,v:'closeup4',bg:'art/closeup/ch19-pedestal.webp',item:'art/closeup/ch19-'+w+'.webp',dent:{x:.50,y:.42},size:p.size,color:p.color,seam:p.seam,startCaption:p.start,endCaption:p.end}); });
