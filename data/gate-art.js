'use strict';
// Gate art registry (gatelayer1, Tom 2026-11-20): every entrance the story closes is a painted picture on its own layer, one picture for the
// locked state and (for doors and gates that swing or lift) one for the open state. The pictures are made in the Art Library (tab Props,
// group Story gates; tools/art-library/gate-prompts.js builds one entry per site and state, the approval bakes art/gates/<site>-<state>.webp
// with tools/sprite-bake/bake_gate_art.py). The game draws them in engine/gate-art.js.
//   map     the map the site is on (an overworld plate; dungeons and building interiors have no gates of this kind)
//   rect    [x, y, w, h] in tiles (fractions allowed, taken from the painting with tools/gate_art_test.py --grid): the picture is centred on the rectangle, as wide as w tiles times `fit`, and stands on its bottom edge
//           (`dy` moves it down by that many tiles). Taller pictures grow upward from there.
//   fill    true: the picture is stretched to exactly the rectangle (a door that replaces the painted doorway); otherwise it keeps its shape
//   states  'locked' always; 'open' only where a door or gate opens. A site with no 'open' picture shows only the plate once unlocked.
//   tune    optional per-state {fit, dy} where the open picture needs a different size or drop than the locked one
// A gate in a map spec points at its site with `art: '<site>'` (data/maps-le.js, data/maps-la.js, data/bonus-nine-scoops.js). The picture shows
// locked while any gate that names the site still matches its `cond`, and open once none does. It is drawn in the actors' depth order, behind
// everyone standing on or south of the rectangle, so it never covers a character. Test: python3 tools/gate_art_test.py
const GATE_V='gatelayer1';
// Pictures baked so far (bake_gate_art.py rewrites this line; the game asks for no other file, so a picture still waiting in the Art Library is never fetched).
const GATE_HAVE=['backlot-stage7-locked','backlot-stage7-open','blvd-studio-locked','blvd-studio-open','blvd-trail-locked','jpark-barn-locked','jpark-barn-open','jpark-oak-locked','row-amyhouse-locked','row-amyhouse-open','row-pier-locked','stage7-catwalk-locked','town-hollow-locked','town-school-locked','town-school-open'];
const GATE_ART={
  'town-hollow':     {map:'town',     rect:[7,3,2,2],         fit:1.15, states:['locked']},
  'town-school':     {map:'town',     rect:[27.85,8,1.55,1.7], fit:.66,   states:['locked','open']},   // under the SCHOOL sign, between its posts (Tom 11-20 report 5nwp)
  'row-pier':        {map:'row',      rect:[12,20,3,1],       fit:1.05, states:['locked']},
  'row-amyhouse':    {map:'row',      rect:[5.94,4.45,1.78,2.14], fill:true, states:['locked','open']},   // exactly the stone arch (fix-gatelayer-pics-2)
  'blvd-trail':      {map:'blvd',     rect:[1.9,2,2.2,1.5],   fit:1.2,  states:['locked']},
  'blvd-studio':     {map:'blvd',     rect:[26.9,6.8,2.4,1],  states:['locked','open']},
  'jpark-oak':       {map:'jpark',    rect:[13,21,4,1],       fit:1.1,  states:['locked']},
  'jpark-barn':      {map:'jpark',    rect:[28,10,2,2],       states:['locked','open']},
  'backlot-stage7':  {map:'backlot',  rect:[11.65,2.2,2.7,2.1], states:['locked','open']},
  'stage7-catwalk':  {map:'stage7',   rect:[15.3,3,2,1.6],    states:['locked']},
};
if(typeof module!=='undefined') module.exports={GATE_ART,GATE_V,GATE_HAVE};
