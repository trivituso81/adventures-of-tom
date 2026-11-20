# clipbatch1 (2026-11-18, main 8ed471e): GENERATE CHAPTER, automatic marks, CHAPTER 1 REVIEW

Build 1 of `claude/animation-chapter-plan.md`. Tool only. Nothing was generated, no xAI call was made, nothing was spent. Detail: docs/CHANGES.md "clipbatch1" and the new paragraph in the repo CLAUDE.md under "Battle clip videos".

## What exists now

| Piece | Where | Fact |
|---|---|---|
| GENERATE CHAPTER bar | Library > Clips, any group named exactly `Chapter <n>` (`clipChapterGroup`), code `engine/art-clips.js` (`clipBatchBar`, `clipBatchStart`) | Counts what is left and the cost, refuses up front if the batch passes the spend cap, makes the not-yet-made entries 3 at a time (`CLIP_PAR`), STOP finishes the ones in flight. A result already waiting is not made again; a pending xAI request id (localStorage `aot-clip-pending`) is picked up again after a page close |
| One-video body | `clipMake(id, say)` | The old GENERATE VIDEO code. The button and the batch both call it |
| Automatic marks | `clipAutoMarks(blob, kind)` | Browser side: 30 fps, 128 px canvas, magenta removed by the corner colour, motion vs the first picture. START = first picture, END = last moving picture + 15 frames, HIT = farthest figure pixels outside the start outline. Loops: first and last picture (the baker's `calm` picks the stretch). A video that barely moves returns null: the entry is not approved and is named in the summary for Tom's REVIEW |
| Auto approve | `decide(kind, key, btn, auto)` in `art.html` | No two-tap confirm; `clipDecideSerial` sends decisions one at a time |
| Redo rule | `clipRedoReady(e)` | A rejection records `rev` = the entry's `promptRev`. The batch makes a rejected entry again only when `promptRev` is above that rev (a redo is never paid twice for the same prompt). clipch1fix must therefore raise `promptRev` when it rewrites a prompt |
| Bake catch-up | `tools/art-library/art_bake.py` `stale_clips`, stamp `// Baked from:` in `data/clips/<id>.js` (`bake_clip.py --stamp`) | Every art-bake run also cuts any approved clip the game has no file for or an older approval of; one failing clip is named and skipped |
| CHAPTER 1 REVIEW | Battle Lab (`data/battle2-data.js`: `review:'Chapter 1'`), `engine/clip-review.js`, `bclipShowFrame` in `engine/clips.js` | Real fight (Tom, Grace, Rose, Deedee vs Mudling, Pond Grump, Bog Toad, Log Lump; second fight THE BIG ONE). Panel: PLAY, PLAY ALL, REDO with a note (GitHub contents API with the Library's token; saves `{date,note,from:'review',at,rev}`, status rejected). Reads entries of group `Chapter 1` that have a `clip` and are not `clip.test` |
| Removed | CLIP TEST: MONSTERS, THE BIG ONE, SLEEPY ROSE; `bclipLabNap` and the lab `nap` field | CLIP TEST: ROSE stays (impact timing inside Rose's real move). This is the fix for list row 4 in `claude/battle-animation-list-ch1-v11.md` (that file itself was not edited; row 4 is resolved by this) |
| Tests | `python3 tools/art-library/clip_batch_test.py`, `python3 tools/clip_review_test.py`, plus the updated `clip_lib_test.py`, `clip_test.py`, `clip_kinds_test.py` | All pass; smoke FAILS: [] |

## What clipch1 must know

- Entries must be in the Clips tab with group exactly `Chapter 1` (the bar and the review only look at that name). clipfoes1's four idle entries and `clip-mudling-idle` move into it.
- Kinds the batch and review understand: `strike` (START, HIT, END), `loop`, `state`. The plan's one-shot clips with no impact (Hit, Dodge, Victory, Give, Cast, Get up) have no kind of their own: file them as `state` (held last picture) or `strike`, or add a kind. Review plays a one-shot once, then holds its last picture 0.5 s (state: 1.5 s).
- Entries made so far use the full model for the idle loops (`grok-imagine-video-1.5`, about $0.25 each), not lite. New entries should use `LITE` and keep the Boop pattern.
- A prompt that says STILL makes the test stub send a motionless video (`STUB_VIDEO_STILL`), and `STUB_GROUP='id1,id2=Chapter 1'` puts stub entries in a chapter group.
- Not tested: marks on a real Grok video (only VP9 stand-ins that reach out and come back). The first real chapter run is that test; a wrong mark shows up in the review as a REDO. If marks are often wrong, tune `clipAutoMarks` (threshold `max(peak*.12,.004)`, hold 15 frames).
- Clips are still not wired into Battle 3 fights.

## Decisions made without Tom (one line each)

- 3 videos at once, not strictly one at a time (the cap is checked before each send).
- The review plays each clip in place in a real fight, not through the move timeline.
- Two review fights: four small monsters, and The Big One.
- The nap (Sleep status) is shown nowhere now; `clip-rose-sleep` stays in the Library.
