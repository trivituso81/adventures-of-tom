# Addendum 2026-11-05 19:20 (overrides the "browser ran old files" claim in next.md)

Fact: Tom's incognito screenshot at 19:05 showed the NEW painted Mudlings (same sprout, same face as art/foes/mudling.webp), drawn blocky. Cause: the battle canvas is 576 x 324 and was upscaled with CSS `image-rendering:pixelated`. Another session fixed the CSS (CHANGES 267, 3c87c66, Pages built e59dd56 at 19:03 local). Current main renders smooth painted enemies in portrait and landscape (checked with /tmp/s/fight.py style screenshots).

Open: the smooth scaling is still a 576 x 324 canvas, so enemies are softer than their 400 px source. If Tom says they look soft or small after reloading: next lever is a higher-resolution battle canvas (backing store 1152 x 648 with scale 2; touches battle-state.js, battle-draw.js, battle2-kind.js darkC canvases at 576 x 324, tom-moves.js glitch). Say the risk first; do not start without his word.

Tom's rule this session: no pixel fallback for enemies (done, foepaint2). Do not tell him "your browser is stale" again without checking what the picture actually shows.
