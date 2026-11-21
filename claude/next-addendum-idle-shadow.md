# Addendum to next.md: battle idle shadows (`idle2`, 2026-11-05 evening)

Merge into next.md "Live state" and "DONE 11-05" next time it is rewritten, then delete this file.

- Tom (19:16): shadows bounced with characters waiting for their turn; wants shadows fixed, everyone grounded, bounce much subtler. `idle1` (CHANGES 273) failed: it lifted figures 1 canvas unit (the canvas is drawn at 2x, so 2+ screen px) off a fixed shadow, so they floated; the shadow was also centred on the frame middle, 3 units below the feet. Tom 19:24 (desktop incognito): still floating, bounce still too much.
- `idle2` (fact): no vertical movement at idle. Party (engine/battle-draw.js `breath`) and enemies (engine/battle2-ui.js `breath`) get a 0.8 percent height stretch anchored at the feet, slow (sin t*1.7). Shadows come from `feetOf(rows)` (battle-draw.js): centred on the frame's feet, sized to the feet, 1 unit up. Enemy shadow at `f.py-1`. Moves, hops, lunges, KO breathing unchanged.
- Painted idle frames have 0 rows of padding under the feet (measured for Tom and Rose), so base is the feet.
- If still too much: lower the 0.008 factor in both files, or set it 0. Tags `idle2` (battle-draw.js, battle2-ui.js, main.js; stamp `build idle2`).
- Tested: 4 person party vs Grump and Mudling at 1211 x 744 desktop, no errors. Full smoke not run.
