# Tombo old-frame scan (2026-11-09 ~15:00, analysis only, no repo change; main at f2f6940)

Method (fact): each of the 50 Tombo ids (21 base, 25 Director's Cuts, 4 Family Finishes) was fired in a lab fight with a trace on the path draw site (engine/battle-draw.js, `P.fn` result) and on `tbf()`. A frame counts as NEW when it comes from `tbf`/`tbfm` (data/tombo-frames.js, art/tombo/*.webp). Cross-checked statically: which LIVE (last) `B2_TOMBO_ANIM.<id>` definition in engine/battle2-kind.js calls `tbf`.

## Result
| Group | Count | Status |
|---|---|---|
| Base Tombos (grace, rose, amy, deedee, boppy, tnb, nara x 1 to 3) | 21 | All play painted frames. Run-in and run-home use the old run frames by design. |
| Base, partial | rose3 | Tom's seated stretch (about 3.5 s to end) uses the old layered ride/headphones frame (`rideSkin('phones')`). Tom sheet frames 4 to 6 and Rose sheet frames 1, 2, 6 are never used. |
| Base, minor | rose2 | Rose's old `celeb` frame shows for a short moment at the end while she is not hidden (pair sheet drew both people the rest of the time). |
| Director's Cuts (`<id>_dc`) | 25 | ALL OLD. No `tbf` call in any live definition. Old stance, act, celeb, flip, kneel, hip, shrug frames from BATTLE_SPRITES. |
| Family Finishes ff1 to ff4 | 4 | ALL OLD. Same. |

## Art Library state (fact)
Only two DC related entries exist, both draft: `tombo-ff1-dc-objects`, `tombo-ff2-dc-objects` (object sheets, nothing generated). No person sheets exist for any DC or Family Finish, so there is nothing approved to install yet.

## Tooling kept in /home/claude/scan (not in repo): trace.py, trace2.py (ignores hidden units), setup.js.
