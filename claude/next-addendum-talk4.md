# talk4 (2026-11-14, main 216c1c0, tag talk4): all ten talking sheets installed from their newest versions. DONE and pushed, waiting on Tom's phone check.

Read with claude/next.md. This supersedes ORDER NOW item 0 (Amy, Justin, Aunt Ellie, Olivia talking sheets: DONE, do not redo) and the "talk3" waiting line (all ten people now have talking poses).

- Tom 15:09: "updates to each characters talking sheets, make sure you're using all the latest."
- Fact: the newest sheets are 2 x 2 grids (tell, point / ask, answer), not one row of four: tom v2, tnb v2, grace v2, rose v2, deedee v4, boppy v3, amy v1, justin v1, ellie v1, olivia v1. talk_frames.py `cut()` now detects the layout (width under 1.5 x height = 2 x 2). A future sheet in either layout works.
- Recut and rebaked all ten (`talk_frames.py`, `bake_story_poses.py`, then `git checkout art/chars/pipemo-story.webp data/npc-poses.js`). Contact sheet looked at: clean figures, all four poses per person.
- docs/pose-facing.tsv: all 40 `tk_` rows re-judged by looking at the heads (old rows were for earlier art, e.g. Boppy's point was marked l, now r). Rule used: l, r, f is the way the painted face turns; every pointing pose turns right.
- Tests: smoke FAILS [], tag_check ok, `pose-facing-apply.py --check` ok (600 frames).
- NOT done: no talking pose looked at live on the map (the ch12Marlowe frames I rendered showed walking poses on those pages), no landscape, no phone. Sizes use the same rule as talk3 (Telling figure = overworld stand height); if one looks too big or small, give that set its own factor in bake_story_poses.py.
- Next check (Tom's phone or `reaction_test.py` with `LATE=1`): a plain-line scene with Amy, Justin, Aunt Ellie or Olivia talking; a person facing away from the speaker means a wrong `lean` row for that frame.
