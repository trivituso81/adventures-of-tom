'use strict';
// data/foes/use.js: installs the painted enemy sheets (data/foes/<id>-hires.js, art/foes/<id>.webp) into MONSTERS.
// Loaded after engine/painted.js (needs paintedAtlas and paintRows) and after data/enemy-facing.js (which mirrors the old rows).
// The painted sheets all face RIGHT already, so nothing here mirrors them. For each enemy:
//   sprite  = stance rows tagged with the painted stance (size, eyes, mouth and the ribbon thumbnail read these)
//   frames  = {hurt, attack:[...]} rows tagged with their painted frames; engine/battle2-ui.js picks one per moment
//   The old pixel enemies are gone (2026-11-05, Tom: no pixel fallback). Until a painted sheet has loaded, an enemy draws nothing.
(function() {
  if(typeof FOE_HIRES==='undefined') return;
  // Julian Vance in chapter 20 (id julian) is the same man in the same coat as chapter 18's (id vance): one painted sheet serves both.
  if(FOE_HIRES.vance&&!FOE_HIRES.julian) FOE_HIRES.julian=FOE_HIRES.vance;
  for(const id of Object.keys(FOE_HIRES)) {
    const H=FOE_HIRES[id],d=MONSTERS[id]; if(!d||d.painted) continue;   // d.painted: already installed (this file runs twice, see index.html)
    const aid='foe_'+id;
    paintedAtlas(aid,H.src,H.rects,H.k);
    const P=nm=>paintRows(H.rows[nm].slice(),aid,nm,false);
    d.sprite=P('stance'); d.pal=Object.assign({},H.pal);
    d.eyes=H.eyes.map(e=>e.slice()); d.mouth=H.mouth.slice();
    d.frames={hurt:P('hurt'),attack:H.frames.filter(n=>/^attack/.test(n)).map(P)};
    d.painted=true;
    if(d.flipBattle) d.flipBattle=false;   // the old pixel Brain Freeze faced left and was mirrored in battle; the painted sheets all face right
    if(id==='bigone') d.tinY=.1;   // the painted Big One already wears a rusty tin; Deedee's shiny one sits on it, not above it
  }
})();
