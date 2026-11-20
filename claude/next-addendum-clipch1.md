# clipch1 (2026-11-18, main e40c823): all chapter 1 battle clip entries are in the Art Library

Build 2 of `claude/animation-chapter-plan.md`. Prompts and entries only. Nothing generated, no xAI call, nothing spent. Detail: docs/CHANGES.md "clipch1" in the repo.

## What exists now

| Piece | Fact |
|---|---|
| Group `Chapter 1` (Clips tab) | 67 entries, 66 to make, 1 approved (Mudling idle). The real Library bar reads "GENERATE CHAPTER 1, 66 to make, 1 of 67 approved. About $5.34". Nothing blocked |
| New entries (61) | `CH1` block in `tools/art-library/clip-prompts.js`. Tom, Grace, Rose, Deedee: idle (loop), guard (loop), hit, dodge, ko (Rose's is the old `clip-rose-ko`), run (loop), victory, give, cast. Own moves: tom loungepass, blockade; grace squeeze, cubepop; rose tackle, lava, giddyup; deedee windex, wetfloor, scrub. Mudling: bump, throw, windup, hit, slip, defeated. Big One: glare, tailslap, chomp, flopwindup, bellyflop, polish, hit, slip, flustered, defeated. Ids are `clip-<owner>-<key>` |
| Moved in | `clip-rose-ko` (title lost "TEST", prompt unchanged), `clip-mudling-idle`, `clip-grump-idle`, `clip-toad-idle`, `clip-log-idle`, `clip-bigone-idle` (these four keep the full model, about $0.25 each) |
| Start pictures | `art/clips/start/tom.png`, `grace.png`, `deedee.png` (make_start.py; fig rows 99, 90, 99.3) |
| Engine | Lab fights can name the clips they load (`clips:[...]` in `data/battle2-data.js`, `B2.labClips`, `bclipWanted`). CLIP TEST: ROSE names rose_boop, rose_ko, rose_sleep, mudling_idle, so it never loads the 30 other clips of its party |
| Tests | clip_batch_test (stub moves the real chapter's other entries out of the test group), clip_review_test, clip_lib_test (expects the 61 entries), clip_test, clip_kinds_test, smoke: all pass |

## How the prompts are built (what clipch1fix edits)

- People: `BOOP_APPROVED` up to `MOTION:` (`BOOP_HEAD`), then the entry's MOTION. Forced edits outside MOTION, by `PHEAD(he, off)`: "her" to "his" in two places for Tom; `off` (hop, cannonball, Rose's victory jump, run) swaps "with her feet planted on the exact same spot" for "on the exact same spot".
- Monsters: `FOE_ONCE` (LOOK_FOE without "looping") or `FOE_FREE` (also without "never lifts off it, hops or slides", for slip, defeated, Flustered, belly-flop) + MOTION + `END(3)`. The Big One's MOTION carries one sentence: crown stays on, lure and coin stay in its hands (`%P`).
- MOTION: two sentences, gesture named once with its count, held end pose. No left or right in MOTION ("forward" = toward the foe). Props come out from behind the back and go back there. No effects.
- Kinds: strike (step 3, 1.5x) for attacks; state (step 2, 1.5x) for one-shots with no impact (hit, dodge, give, cast end back in the starting stance); idle and guard loops: step 1, 0.3x, calm .875 (clipfoes1 numbers); run: loop, step 2, 1x, no calm.

## Decisions made without Tom (one line each)

- Get up is not made: the list's first try is the KO clip played backwards (a video cannot start lying down from the standing start picture). Needs a reverse-play field in the engine when clips are wired into Battle 3.
- "Giddyup, Tata!" climb picture is not made: the painted tomride battle frames (`data/tomride-hires.js`) already show Rose on Tom's shoulders.
- Skeeter Swarm gets no clip: nine small bodies, no one subject; it stays on its painted sheet and is not in the chapter 1 story.
- Props are drawn by the video model (out from behind the back), not by the engine over an empty hand: an overlay cannot follow a moving hand.
- Lamby is not in Rose's Ankle Tackle clip (no Lamby start picture; a model-invented lamb would not match Lamby). The pose keeps one arm tucked where Lamby goes.
- Deedee's Scrub ends with the glasses still on (the joke of the move); the hand-off to the idle drops them.
- Each character's victory follows their canon: Tom a calm thumbs up, Grace arms up in a V, Rose a silly jump, Deedee a warm clap.
- All 61 new entries are on the lite model, 3 s, 480p.

## Risks the review will show (not tested)

- KO wording on all four (Rose's test was never run; the batch is the test). Fallback per entry: drop ", knocked out", raise promptRev.
- Props appearing from behind the back may pop in or stay. Grace's and Rose's turns (none in this pass), the belly-flop and the slips (monsters leaving their base line).
- Automatic marks on real Grok videos (tested only on stand-ins).

## CHANGED 2026-11-19 07:13: Tom asked for the videos to be made for him, like the voice job

Tom: "Is there any way you could generate all the videos for me like how you did with voice clips when I listed the eleven labs key in GitHub secrets?" Answer given: yes. New build **clipgen2** (a GitHub Action) comes BEFORE his review; he no longer presses GENERATE CHAPTER 1 (the button stays for later chapters and single redos).

What clipgen2 builds (facts checked 11-19 on main e40c823, design is a recommendation):

| Piece | Plan |
|---|---|
| Workflow | `.github/workflows/clip-gen.yml`, manual only (`workflow_dispatch`, inputs `group` default `Chapter 1`, `limit` default 0 = all, `dry_run`). Secret `XAI_API_KEY` (Tom adds it). Copy the shape of `voice-gen.yml` (one at a time, preflight before the first paid call, never hide a failed command behind a pipe; the runner has NO ffmpeg: `sudo apt-get install -y ffmpeg`) |
| Script | `tools/art-library/clipgen.py`: for each entry of the group with a `clip` and no approved version (and, for a rejected one, only when `promptRev` > the rejection's `rev`, the rule of `clipRedoReady`): send prompt + start picture to xAI exactly as `clipMake` in `engine/art-clips.js` does (same model, duration, resolution, request shape), poll, download. 3 at a time. Check the spend before each send against a cap input (default $8). A paid video is never thrown away: save it before any later step can fail |
| Marks | Python port of `clipAutoMarks` (30 fps, 128 px, magenta keyed by the corner colour, motion vs the first picture, START first, END last moving + 15 frames, HIT farthest figure pixels outside the start outline, loops first and last; threshold `max(peak*.12,.004)`). Test it against the browser version on the clipbatch1 VP9 stand-ins: same marks within 1 frame. A video that barely moves is NOT approved: listed in the report for Tom |
| Approve | Write exactly what `decide(...,'ok',auto)` in `art.html` writes: the video as `art/raw/clips/<id>-v<k>.<ext>` (what `clipApproveFile` makes) and the entry's `status:'approved'` plus a `versions` entry `{n,file,date,from,at,marks}` in `data/art-prompts.json` (indent=1, ensure_ascii=False). One commit per batch of results, pushed with rebase retries |
| Bake | A push made with the Action's own token does NOT start other workflows: after its commits the job starts `art-bake.yml` itself (workflow_dispatch through the API, which is allowed), or runs `art_bake.py`'s clip cut inline. `stale_clips` catches anything missed |
| Report | `clipgen-report.json` on the run (made, approved, still, failed, money spent), and a short summary in the job log |
| Tests | Stand-in xAI server (reuse `tools/art-library/stub.py`'s xAI part), dry run, marks parity test; then ONE real run with limit 3, LOOK at the 3 baked clips (frames), then limit 0 for the rest |

Before pasting the clipgen2 prompt Tom adds the repo secret `XAI_API_KEY` (github.com/trivituso81/adventures-of-tom > Settings > Secrets and variables > Actions > New repository secret). Pasting the prompt is his go-ahead for about $5.34 of xAI credit (plus retries of clips that fail to download). Model Claude Sonnet 5.5 (row C: new tool, the steps are not written, tests catch mistakes), effort high (a new tool built and run in one session, with a port that must match the browser exactly and money spent).

## Next

clipgen2 (above), then Tom: Battle Lab > CHAPTER 1 REVIEW and CHAPTER 1 REVIEW: THE BIG ONE, PLAY ALL, REDO with notes. Then clipch1fix: for each REDO note, the smallest change to that entry's MOTION in `CH1` (or its kind/step/speed if the note is about timing), run `node tools/art-library/clip-prompts.js` (it raises promptRev), test, push, then run the clip-gen Action again (it remakes only entries whose promptRev moved). Rejections are read from `data/art-prompts.json` on main (`rejects[-1].note`, `from:'review'`).
