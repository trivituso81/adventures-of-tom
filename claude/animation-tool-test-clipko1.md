# Animation tool test, addendum: Rose KO test entry built (clipko1, main 5981c7e, 2026-11-18 17:10)

Newest file for the KO question. Background: `claude/battle-animation-list-ch1-v11.md` section 7 row 3 (the plan), `claude/animation-tool-test-pack1.md` (state of the clip thread), `claude/animation-tool-test-boop2.md` (the approved Boop prompt and the smallest-change rule).

| Thing | Fact |
|---|---|
| Entry | `clip-rose-ko` (Clips > Rose, second row), clip id `rose-ko`, LITE model, 3 s, 480p, kind `state` (START and END, last picture held), step 2, speed 1.5, start `art/clips/start/rose.png`. About $0.07. No video made. |
| Prompt | `KO_TEST` in `tools/art-library/clip-prompts.js` = `BOOP_APPROVED` up to "MOTION:", then: "MOTION: KNOCKED OUT / From her starting relaxed stance, she wobbles once, sits down hard on the same spot, and tips over onto her back with her arms out to the sides and her eyes closed, knocked out. Without getting up, she stays lying flat on her back and remains completely still in that pose for the rest of the clip." 143 words. Kept: WHAT THIS IS, CAMERA AND BACKGROUND unchanged. |
| Fallback (only if the generator refuses or softens it, tried once) | The same text with ", knocked out" removed. Change only that. |
| Engine | `bclipFor` (`engine/clips.js`): a `<owner>_ko` clip is that person's out-of-the-fight clip, ahead of the nap. Until `rose_ko` is approved and baked nothing changes. Once baked, Battle Lab > CLIP TEST: SLEEPY ROSE plays the KO, not the nap (the Lab label still says SLEEPY: relabel when clips are next worked on, list row 4). |
| Validator | `validate.js` warns `soft word: knocked` and `banned word: sprite` on `clip-rose-ko`: both deliberate. |
| Tests | clip_lib_test (now expects four clip entries), clip_test, clip_kinds_test, smoke: all FAILS []. |

## What Tom does (his marks)
ADMIN > ART LIBRARY > Clips > Rose > "Rose: knocked out (TEST...)" > GENERATE VIDEO > REVIEW > START (standing, just before the wobble) and END (lying still on her back) > APPROVE. If refused, softened or wrong: REJECT with a note.

## Next session (only after Tom generates)
- Approved: watch the bake land, check Battle Lab > CLIP TEST: SLEEPY ROSE plays it, record "the words pass" in the list's row 3, then the plan for KO clips of the other three.
- Refused or softened: apply the fallback (one change), push, Tom generates once more. A second miss: stop-loss.
