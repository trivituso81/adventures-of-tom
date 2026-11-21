# Boppy moves: Tom's feedback (26 Oct 2026), to build next
Source: Tom's verdicts after watching the Boppy Moves viewer (https://claude.ai/artifact/81ANK5cmF8ioMsfZ8B1FZA, db collection boppy-feedback), pasted into chat.
Files: engine/boppy-moves.js (RECRUIT_MOVES.boppy.*; the "Option 3 Ultimates" IIFE at the end holds the b5_ ultimates; later IIFEs win), data/battle2-data.js (B2_SKILLS.boppy.o3), data/abilities.js (B8_KITS.boppy), data/lines.js (LINES.boppy), data/recruit-sprites.js and data/battle-sprites.js (Boppy battle sprites), engine/audio.js (sfx).

| Move | Verdict | Tom's note | Build decision |
|---|---|---|---|
| Cap Swat (basic) | tweak | The cap doesn't look like a cap once he takes it off, and it looks even stranger when it enlarges. Also improve the quality of the top of his head that is revealed when the cap is off. | Redraw the swatted cap as a clear baseball cap: crown, curved brim, button on top, panel seams, and his cap colors, readable at its small size and at its enlarged size (redraw at the larger size, do not just scale the small sprite). Redraw the bare head under the cap: shaped scalp with thinning hair, a natural hairline and light shading, not a flat blob. Numbers, line and VP gain unchanged. |
| GRUMBLE (sig) | keep | | No change. |
| Patient Angler (A1) | keep | | No change. |
| Recliner Reservation (A2) | keep | | No change. |
| Headcount, Again (A3) | keep | | No change. |
| Lockdown (A4) | keep | | No change. |
| Everybody Waits (A5) | no verdict | Tom wrote the line he wants: Boppy says "Everybody slow down. My family goes first!" | Treat as a line change only, animation and numbers unchanged. Replace the spoken line with "Everybody slow down. My family goes first!" (old: "Everybody waits. My family goes first."). Keep the move key. The new line is silent until baked: add to status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json. |
| The One That Got Away (A6, ult) | keep | | No change. |
| Pepper Breath (B1) | keep | | No change. |
| Seeds of Trouble (B2) | keep | | No change. |
| Mild for Company (B3) | keep | | No change. |
| In Nineteen Seventy (B4) | keep | | No change. |
| Five-Alarm Jar (B5) | keep | | No change. |
| Van Cortlandt Park '70 (B6, ult) | tweak | During the flashback he is young again with dark hair, no mustache, cap off, full head of hair, and in a track tank top and shorts. | In the sepia 1970 flashback scene, draw young Boppy: dark full head of hair, clean-shaven (no mustache), no cap, a running tank top and short running shorts, runner's pose through the laps and the tape break. He returns to his normal look when the flashback ends. Use a separate young-Boppy sprite set, not a recolor of the current one. Numbers (huge hit, turns knocked back 80%, Heartburn maxed, Personal Best 2 turns) and line unchanged. |

## Notes for the build
- Three moves change: Cap Swat (art), Van Cortlandt Park '70 (young-Boppy art), Everybody Waits (line only). Do not touch the 11 keeps.
- Cap Swat art and the young-Boppy sprite can share the new bare-head work: draw the head once and reuse where it fits.
- The new Everybody Waits line goes in status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json (no em dashes); the old clip stops playing until re-baked.
- After the build, republish the Boppy viewer (source /home/claude/dv-src: boppy-viewer.js, build_b.py, bv_test.py, files_b.json) with a fresh collection (boppy-feedback2). Do not publish the game link until Tom approves.
- Test: smoke.py, kit_test.py boppy, bv_test.py in portrait and landscape; look at frames for the cap, the bare head, and the young Boppy flashback.
