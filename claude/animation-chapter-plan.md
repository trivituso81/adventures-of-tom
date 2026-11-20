# Battle animations chapter by chapter (Tom, 2026-11-18 17:22). This file wins over every older animation-test file

Tom: "i dont want to test anything else. im tired of testing each animation one by one. let's do it chapter by chapter"

STATUS (2026-11-19 15:40 PT): builds 1, 2 and 3 are DONE and Tom's review (step 4) is DONE: he sent 44 of the 67 clips back with 45 notes (REDO notes in data/art-prompts.json, rejects `from:'review'`). Then Tom (11-19 14:27): "Build an automatic quality gate for battle clips before any re-make ... Do not generate or spend anything until the gate flags the clips he rejected." clipgate1 (main 69f0647) built the measured part of the gate and replayed it against his notes: it flags 27 of the 44, every measurable fault in his own words but one, and 1 of the 23 approved. It also found that many notes come from the bake settings (loops keep the calmest 0.875 s at 0.3x forward and back; moves play at 1.5x) and from what the prompts asked, so re-making first would repeat them. **NEXT is clipgate2 (the vision check), NOT clipch1fix.** Plan, findings and order: `claude/clip-gate-plan.md` (wins over the clipch1fix lines below).

## What this changes

| Before | Now |
|---|---|
| One clip at a time: Claude writes one entry, Tom generates it, marks START, HIT and END, approves it, watches it in the Lab | All the clips a chapter needs are made as one batch by the clip-gen Action (or the Library's GENERATE CHAPTER button). Tom watches the chapter's fights once and flags only what looks wrong |
| Tests before the real work | No more tests. The KO entry and the prop risk were covered inside the chapter 1 batch: Rose's KO works, the card prop comes from behind the back and goes back |
| Tom marks START, HIT and END by hand on every video | Claude sets the marks automatically from the video (browser version and the Action's Python port agree within 1 frame); Tom never marks |
| Every made clip is approved | (from clipgate2) every made clip passes the clip gate first, measured plus vision; a failing clip is held, not approved |

## The chapter 1 batch (what is in it)

Pass 1 of `claude/battle-animation-list-ch1-v11.md` section 6, as built by clipch1: core 9 for Tom, Grace, Rose and Deedee (Get up is the KO played backwards, not a video), the 10 own clips of the Vibes Battle 3 has, Mudling 6 states, The Big One 10 states, the five monster idles, Rose's KO `clip-rose-ko`. The Rose-on-shoulders picture is the existing tomride battle art. 67 entries; after Tom's review 23 approved, 44 rejected.

## Builds, in order (one conversation each)

| # | Build | What | Model and effort | Status |
|---|---|---|---|---|
| 1 | clipbatch1 (tool) | GENERATE CHAPTER button, automatic marks, auto approve, CHAPTER 1 REVIEW with REDO in Battle Lab, bake catch-up | Sonnet 5.5, high | DONE, main 8ed471e |
| 2 | clipch1 (prompts) | All chapter 1 entries in `clip-prompts.js`, each an edit of `BOOP_APPROVED`'s MOTION part only, group "Chapter 1", model LITE | Opus 5.5, high | DONE, main e40c823 |
| 3 | clipgen2 (tool, then the real run) | GitHub Action `clip-gen`: makes every not-yet-made clip of a group on xAI, sets the marks, approves them, starts the bake and the publish | Sonnet 5.5, high | DONE, main e8357f6 and 297bc74; chapter 1 run done, $5.34 |
| 4 | Tom | CHAPTER 1 REVIEW once (both fights), REDO on what looks wrong | | DONE: 44 sent back, 45 notes |
| 4a | clipgate1 | Measured quality gate, replayed against his notes (`tools/clip-gate/`) | Opus 5.5 | DONE, main 69f0647 |
| 4b | clipgate2 | Vision check, replay to the pass bar, gate wired into clip-gen (hold, not approve) | Sonnet 5.5, medium | NEXT (claude/clip-gate-plan.md section 4) |
| 5 | clipch1fix | Bake fixes first (free), then each REDO note fixed with the smallest prompt change (raise `promptRev`), then the clip-gen Action remakes only those (`ids`), every clip through the gate | Opus 5.5, medium | after 4b |

Then chapter 2 the same way, with only the clips chapter 2 adds (entries first, as clipch1 did, then the Action), gated.

Prompt for build 4b: "Read claude/clip-gate-plan.md, then build clipgate2. Spend at most $2 of xAI credit, on the vision check only; make no videos. You have my full permission to access the repo."

Prompt for build 5 (after 4b): "Read claude/clip-gate-plan.md and claude/next-addendum-clipgen2.md, then build clipch1fix. You have my full permission to access the repo."
