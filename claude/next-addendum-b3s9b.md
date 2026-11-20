# Battle 3, stage 9: where it stands after b3s9b (2026-11-19)

Read with `claude/battle-build.md`. Where they differ, this file wins until the 9c session folds it into battle-build.md.

## What b3s9b did (fact; build `b3s9b`)

TNB is complete: Ceramicist and Longboarder (14 lines). Detail: docs/CHANGES.md "b3s9b", docs/BATTLE3.md "What stage 9b holds", docs/handoff/b3s9b.md. Tom was not asked to play; no note from him arrived.

| Piece | Fact |
|---|---|
| Kit file | `data/b3-kit-tnb.js` (cast row, both Vibes, Traits, Basics, Skills with plain `desc`, Capstones, Quirks). The recipe for a new character is this file plus a `data/b3-lab.js` row plus a `<script>` tag in index.html. |
| New rule pieces | clay shields (`clay`, `stone`, `glaze`) and Fired Glaze reflect; the Grand Amphora vessel hazard (soaks a monster's whole damaging act, bursts at 0 uses or round 4); `allyMods`; mod conditions `basic` and `shielded`; Skill field `rec`; `tgtAlly`; status flags `razzleDet` and `blockDebuff`; target `slowestAlly`; status `mult`; ops `vitrify`, `double`, `rebalance`; custom switches `wetClay`, `tapCard`. All in `engine/b3-custom.js`, `b3-ops.js`, `b3-core.js`, `b3-hooks.js`, `b3-resolve.js`. |
| Lab | NEW 7: TNB JOINS (LOG LUMP). Party Grace, Tom, TNB, Rose. |
| Tests | `node tools/b3-sim.js check` (1123, FAILS: []); `tools/b3-check-s9b.js`; `python3 tools/b3_test.py s9b s9ui s5c s7 new7` pass; frames `tools/shots/b3-s9b*.png`. Full `b3_test.py` takes over an hour: run chosen sections in the background and poll. |
| Gotchas | A beat with a numeric `g` and no `swing` is never shown; an act with no hits shows only `pre` (late) and `post` beats, so a vessel or other effect on a no-hit act must use `g:'post'`. An all-foe Skill takes target key `'*'` in tests. The `shieldBroken` event now passes `c`. |
| Not a regression | `unused_voice.py` check 4 lists 93 dialogue clips: identical on clean origin/main. |
| Not done on purpose | No pictures, clips or spoken lines for TNB (every Skill uses `anim:{kind:'default'}`). |

## For 9c

- Nara (Attached Pup, Guard Dog) and Boppy (The Dep, Pepper Boss): 28 lines, 6 need a function. Map each block of kit-ops rows to its Vibe from spec section 3, not from the row order.
- The late joiners' Vibe Point pool (spec section 1, 3.8): TNB, Nara and Boppy start from it. TNB's `vp` currently uses the normal start; 9c moves him onto the pool.
- Lab fights with the chapter 2 and 3 parties. Its `## b3s9c` heading ends stage 9.
- Calls go into battle-build.md's calls table, one row each. Every Skill needs a plain `desc`.
- Closing reply: "Nothing needed from you" (Milestone B is after stage 15).

## Prompt

| Part | Model | Effort | Prompt |
|---|---|---|---|
| 9c | Claude Sonnet 5.5 (row C) | high (6 of the 28 lines need a new function) | `Read claude/battle-build.md and claude/next-addendum-b3s9b.md, then build stage 9c (Nara and Boppy) of the new battle system. You have my full permission to access the repo.` |
