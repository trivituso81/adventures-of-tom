# Build instruction: Debi and Angelo (queued 2026-11-06, Tom: "Add it to build instruction")

Canon (also in claude/canon-addendum-2026-11-06.md): when Boppy talks straight to Deedee he calls her "Debi". When Deedee talks straight to Boppy she calls him "Angelo". Everywhere else (narration, menus, other characters talking about them) they stay Deedee and Boppy.

## Rules for every session from now on
- Any NEW dialogue where Boppy addresses Deedee or Deedee addresses Boppy uses Debi and Angelo. This includes chapter scenes, revisit pools, battle lines and Tombo lines (Fifty-One Years & Counting, Nobody Gets Past Us).
- Never edit a baked line. Where an existing baked line should use the name, add a NEW line next to it and switch the scene to the new one. The old clip stays in data/voice-clips.js unused.
- No em dashes, contractions in all dialogue, as always. New lines are unvoiced until Tom records them in the Voice Library.

## Sweep (one session, starts only when Tom names it: "do the Debi and Angelo sweep")
1. Search data/scenes*.js, data/lines.js, data/maps-le.js, engine/boppy-moves.js, engine/deedee-moves.js and docs/dialogue-scripts-ch*.json for lines where one of them speaks directly to the other (look for "Deedee" or "Dee" said by Boppy, "Boppy" or "honey" said by Deedee, and the 51 years scenes in chapters 3, 9, 10, 14, 15, 16, 19, 20 and Nine Scoops).
2. Show Tom a dense table first: scene, speaker, current line, proposed new line, baked or unbaked. Unbaked lines are edited in place; baked lines get a new line added.
3. Apply after Tom approves. Keep the glasses and gas running gags intact.
4. Tests: chapter-select jump to each touched chapter, portrait and landscape frames of each changed scene, then push with a docs/CHANGES.md entry and tag bump.

Read this file from claude/next.md when the sweep is named. Until then it is a standing writing rule only.
