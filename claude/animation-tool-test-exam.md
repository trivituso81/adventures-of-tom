# Animation tool test: STATE AFTER THE BOOP ENTRY WAS BUILT (build clipboop1, commit ea0e4ea, 2026-11-18 11:45; newest file of the thread)

Background (still binding): `claude/animation-tool-test-rose-results.md` (goal, Tom's direction, game facts). Clip counts: `claude/battle-animation-states-v10.md`. Closing lines of every session follow `claude/handoff-rules.md` (what next, before you paste, model, effort level, prompt).

Prompt Tom pastes next time: **"Read claude/animation-tool-test-exam.md and continue the animation tool test. You have my full permission to access the repo."** (told to Tom on 11-18 11:50 with: Claude Fable 5.2, effort high; before pasting he generates, marks and approves the Boop video in the Art Library and watches it in the Battle Lab.)
Tom does not want options. Make the call, ask for at most one thing. His steps are in the Art Library only (Generate, mark, Approve) and the Battle Lab (watch).

## NEWEST: clipboop1 (2026-11-18 11:45). Waiting on Tom: the Boop video
| Thing | Fact |
|---|---|
| What a Boop is (canon, read this session) | docs/CANON.md: "Boop is her free move and Tom loves it." `Rm.boopShow` (`engine/rose-moves.js`): she marches up, ONE finger poke on the nose on tiptoe, scrunched laugh, proud hands on hips; messages "Pointer finger out." and "Boop. One finger. Right on the nose."; spoken line `boop:['Boop!']`. Her six painted Boop frames (`ab_boop_1` to `_6` in `art/chars/rose-poses.webp`, looked at this session): pointing with one arm out, leaning in, up on tiptoe with the finger forward, the boop, eyes scrunched laughing, hands on hips. Gingham dress, empty hands, same as the clip's start picture. |
| New Library entry | `clip-rose-boop` (clip id `rose-boop`), title "Rose: Boop (one finger on the nose) video clip", model LITE, 3 s, 480p, kind strike, step 3, speed 1.5, start `art/clips/start/rose.png`. First row under Rose on the Clips tab; status Ready; about $0.07. No video made yet. |
| Its motion text (`BOOP` in `clip-prompts.js`) | "MOTION: A ONE-FINGER BOOP ON THE NOSE. Start in the relaxed stance of the attached picture. She grins, lifts one hand and points its index finger straight ahead, the way she is facing, with the other fingers curled into her palm. She leans forward, rises up on her tiptoes and reaches that arm all the way out, straight and level at the height of her own nose, until the fingertip gives one tiny gentle tap on the air in front of her, the way a child boops a friend on the nose. Her mouth opens to say "boop". She holds the finger out for a moment. Then she pulls the hand back, stands tall with both hands on her hips and scrunches her eyes shut in a proud giggle. Her feet stay on the same spot the whole time and both hands are empty." Written to Tom's prompt rules: names only what should appear (the word chop is not in it), nothing about speed, no words for the two sides in the motion text. The shared `LOOK` block is unchanged (it still says "turned to the left"; it passed four videos). |
| Wired ahead of the video | `RM.rose.boop` (`engine/battle2-moves.js`) and `Rm.boopClip` (`engine/rose-moves.js`) play `rose_boop` when `BCLIPS.rose_boop` exists, else the old `rose_strike` chop. With the real clip the messages are the painted move's ("Pointer finger out.", "Boop. One finger. Right on the nose."). So when Tom approves, the art-bake Action cuts the clip, adds its script tag, and Battle Lab > CLIP TEST: ROSE > Boop plays it with no further session. Rehearsed with a stand-in clip named `rose_boop` (a copy of the chop data, not committed): the fight switched to it, hit on the marked frame, portrait and landscape. |
| Old chop entry | Retitled "OLD TEST: Rose strike (a chop, not Boop)". Still plays in the Lab until the Boop clip exists. |
| What Tom was told to do | Library: Clips tab > Rose > Boop row > GENERATE VIDEO > REVIEW > START (standing still, just before she lifts her hand), HIT (finger fully stretched out), END (hands on hips, giggling) > APPROVE. Then about 5 minutes later Battle Lab > CLIP TEST: ROSE > ATTACK > Boop. If the video is not a one-finger boop: REJECT with a note. |
| Not checked | The publish run for ea0e4ea finished with success, but the live site could not be opened from the session (the shell cannot reach github.io and the page fetch needed an approval nobody answered). |

Tom's verdicts that stand (11-18 11:10, on clippace1):
| Thing | Tom | Meaning |
|---|---|---|
| Mudling idle | "the muddling animation looks PERFECT now!" | APPROVED. Do not touch `mudling-idle`. Its recipe is the default for every monster idle: calm stretch of under 1 s, body at 0.3x, blink at 1x, forward then backward. |
| Rose's nap | "Rose looks great" (08:50) | APPROVED. |
| Rose's strike clip | "this cannot be Rose's final boop animation because she's karate chopping not booping. but if that's not relevant yet that's ok" | Answered by clipboop1 (above). |
| Level of fine tuning | He asked if it was appropriate; told yes for one test monster, because it produced reusable defaults; not per monster in the 150 clip pass. | Apply defaults, tune only what he flags. |

Per-part pace (clippace1): `bake_clip.py --pace F:STEP:SPEED[,...]`; on an entry `clip.pace: [[second, step, speed], ...]` (step written for a 30 a second video); `art_bake.bake_clip` passes it on. `mudling-idle`: video frames 36 to 53 every picture at 0.3x, frames 54 to 56 at 1x, cycle 5.25 s, 21 pictures, 365 KB; entry `step: 1, speed: .3, pace: [[2.25, 1, 1]]`; marks first 1.5, last 2.333. The Library review has no control for `pace` (entry field only).

## NEXT SESSION (one task, depends on what Tom did)
Check first: `ls data/clips/rose-boop.js art/raw/clips/clip-rose-boop-*` and the entry's `status`, `versions` and `rejects` in `data/art-prompts.json`.

A. Boop approved and baked (the expected case):
1. Look at the video's frames yourself (`art/raw/clips/clip-rose-boop-v1.mp4`, ffmpeg to pictures): is it one finger, does the style hold, any smeared picture, does `reach` in `data/clips/rose-boop.js` sit on the fingertip. Run `python3 tools/clip_test.py` (it follows `rose_boop` on its own) and look at `tools/shots/clip-portrait.png`: fingertip on the monster's nose at the hit.
2. Purge the chop (Purge rule), in one push: entries `clip-rose-strike`, `clip-rose-strike-lite`, `clip-rose-strike-2s` from `clip-prompts.js` and `data/art-prompts.json` (the upsert does not delete: remove them from the JSON too); `art/raw/clips/clip-rose-strike*`; `art/clips/rose-strike.webp`; `data/clips/rose-strike.js` and its tag in index.html; the `rose_strike` halves of `RM.rose.boop` and `Rm.boopClip` ("She winds up."); the `STRIKE` text if no entry uses it; `rose_strike` in `tools/clip_kinds_test.py` (line 35) and `tools/clip_test.py`; the `clip-rose-strike` ids used all through `tools/art-library/clip_lib_test.py` (move that test onto `clip-rose-boop`); the Lab fight's sub text in `data/battle2-data.js` ("the old chop until..."). Grep for `rose-strike` and `rose_strike`: zero outside docs/CHANGES.md and build history.
3. Then the open engine work below, or whatever Tom said about the Boop.

B. Boop rejected, or Tom says it is wrong: read his reject note (`rejects` on the entry). One corrected full prompt (no edit request), push, same Library steps. STOP-LOSS: if the second video misses the same way, stop and say so; the likely causes are the lite model (try `G15` once, 25 cents) or 3 s being too short for point, tap and giggle (drop the hands-on-hips ending before lengthening).

C. Nothing generated yet: nothing to build on the Boop. Do the open engine work.

Open engine work before clips leave the Lab: the `B2.labClip` gate (`bclipWanted`, `bclipFor`, `RM.rose.boop`), per-frame cropping of the atlas (strike sheet is 2112 x 3440), hurt and attack pictures for a monster whose idle is a clip (painted frames are used today, so the look switches for a moment). Before wiring many moves read docs/BATTLE3.md (see "Not asked of Tom yet").

Files to read: `claude/handoff-rules.md`, repo `CLAUDE.md`, `engine/clips.js`, `tools/art-library/clip-prompts.js`, `tools/art-library/art_bake.py` (`bake_clip`), `tools/clip-bake/bake_clip.py`, `engine/rose-moves.js` (`Rm.boopClip`), `tools/clip_test.py`. Every push needs a CHANGES heading and `python3 tools/art-library/bump_tags.py <TAG> --base origin/main` (once per build name). Other sessions and the Action push often (calib2 landed in the middle of this session): fetch and rebase right before pushing. On the rebase: CHANGES.md new entry on top (the file's old text contains the words `<<<<<<<` and `>>>>>>>` on purpose at one old entry, so check for markers at the start of a line only); `data/build-history.js` take upstream then `python3 tools/build_history.py add <TAG>`; index.html and `engine/main.js` take this build's tag. bump_tags does NOT move the `engine/art-clips.js?v=` tag inside `art.html`: change it by hand when that file changes.

**SPEED history (Tom):** 11-17: 1.5x too slow, 2x "still too slow", asked for 3x, then asked for a control. 11-18: approved the strike twice at 1.5x. If he says it feels slow, the remaining time is the run-in (900 ms) and run-home (700 ms) in `Rm.boopClip`, not the clip. Tell the video model nothing about speed.

## EARLIER TODAY
| Build | What |
|---|---|
| clipboop1 (ea0e4ea, 11:40) | Boop entry, wiring ahead of the video, old entry retitled. `clip-prompts.js` now inserts a new entry where it is written in the file (before the next existing entry), not at the end of the list. `tools/clip_test.py` follows whichever clip Boop plays. `tools/clip_kinds_test.py`: the "loop jumped" check failed about every second run on the unchanged build (a screenshot stalls the test browser longer than the Mudling's 125 ms blink); it now ignores looks more than 120 ms apart. |
| clippace1 (5e9dda1, 11:10) | Tom on cliploop1: "body motions can be slowed more, but the eyes opening and closing could be faster". Per-part pace built; Mudling recut. |
| cliploop1 (97dbcc1, 09:05) | Tom on clipkinds1: "too much movement, and at the end of the animation when it loops, their eyes transition in a strange way. it's like it's not referencing the image for both animation start and end". He was right: the video model gets the first picture only. Loops now play forward, then backward (`bclipLoopFrame(C,ms)`, period 2 x `C.dur`); the dissolve and `--blend` are removed. Monster idle prompt asks for very small, slow motion, arms staying put, mouth as painted. |
| clipkinds1 (e815b64, 08:25) | Clip kinds `strike`, `loop`, `state`; `bclipFor`; clips `mudling-idle` and `rose-sleep` cut by Claude from Tom's approved study videos; Battle Lab fight CLIP TEST: SLEEPY ROSE; Library review with START and END only for loop and state. |

Study video results (Tom approved all four at 07:56; real `.mp4` files in `art/raw/clips/`, 640 x 480, 24 pictures a second):
| Study video | Result | Call |
|---|---|---|
| `clip-rose-strike-lite` (cheap model, 7 cents) | Style holds. No floor shadow. No smeared in-between picture (the full model has one at frame 34). Stands still for the first 1.1 s (trimmed by START). | **Lite is the default model for new entries.** Full model is the second try. One sample only. |
| `clip-rose-strike-2s` | Lost the shout: she laughs with closed eyes. Frame 21 is colour-smeared. | **Attacks stay 3 s.** |
| `clip-rose-sleep` | PASS. Lying on her side by frame 70 of 97, bow unchanged. | Grok can do this state; no Wan needed. |
| `clip-mudling-idle` | Base on row 406 in all 73 frames. Frames 0 to 35 and 58 to 72 move a lot; 36 to 57 is calm, blink at 54 to 57. | Calm stretch, forward then backward, paced. |

What exists (all tested, pushed):
| Piece | Fact |
|---|---|
| Clip kinds | `clip.kind` on the entry, `--kind` in `bake_clip.py`, `kind` in `data/clips/<id>.js`: `strike` (default; START, HIT, END), `loop` (idle; START, END; played forward then backward), `state` (plays once, last picture held; START, END). `clip.k` is atlas pixels per row (8 for a monster, default 4). |
| Engine | `bclipFor(owner,kind)` in `engine/clips.js`. Loop: `b2FoeFrame` (`engine/battle2-ui.js`) returns `bclipLoopFrame` when the monster is not winding up, attacking or hit; each monster offset by `idx*900` ms; no breathing stretch on clip frames (`rows._clip`). State: `drawBattle` (`engine/battle-draw.js`) plays it from `fx.koAt` instead of `drawKnockedOut`. Both only when `B2.labClip`. |
| Clips in the game | `rose-strike` (37 pictures; a karate chop, Lab fallback until `rose-boop` exists), `rose-sleep` (39 pictures, 2.2 s at 1.5x, 711 KB; marks 0 to 3.167 s), `mudling-idle`. `rose-boop`: not made yet. |
| Battle Lab | CLIP TEST: ROSE (Boop plays `rose_boop`, else the chop; has a Mudling too). CLIP TEST: SLEEPY ROSE (lab field `nap:'rose'`, `bclipLabNap`: Rose goes down 3 s in through `b2PartyDown`, never on her own turn; two Mudlings). `tools/clip_test.py` finds the first fight with `L.clip`, so CLIP TEST: ROSE must stay before the nap fight in `B2_LAB`. |
| Library | Clips tab: Rose (5 entries: Boop, OLD TEST strike, two TEST study entries, the nap), Monsters (1). Review of a loop or state entry shows START and END only, own help line (`#cliphelp`); `decide()` and `art_bake.bake_clip` accept two marks. With the GitHub token set the Library reads the prompt list live from GitHub, so a pushed entry shows without waiting for the site to publish. |
| Tests | `python3 tools/clip_kinds_test.py`, `tools/art-library/clip_lib_test.py` (66 checks, six clip entries), `tools/clip_test.py`, `tools/smoke.py`: all pass on clipboop1. |

Not asked of Tom yet:
- Whether the battlefield preview in the Library works on iPhone Safari (SVG filter path unconfirmed).
- Whether the nap should replace the dizzy-stars knocked-out drawing in the real game (canon question, not decided).
- Lite was judged on one strike. Its hold on a monster or a lying-down state is untested. The Boop is its second sample.
- A new battle system ("Battle 3", `docs/BATTLE3.md`, Battle Lab > NEW BATTLE) is being built by other sessions. Clips are wired to the current battle (`B2`) only. Before wiring many moves, read docs/BATTLE3.md and decide where clips should plug in; ask Tom one question if the answer changes the work.

## HOW IT IS BUILT
| Piece | Where | Fact |
|---|---|---|
| Tab | ADMIN > ART LIBRARY > Clips (`art.html`, code in `engine/art-clips.js`) | An entry with a `clip` field is a video entry. The row title drops the group name ("Rose: "). |
| Entries | `tools/art-library/clip-prompts.js`, run with node | Upserts into `data/art-prompts.json` (new entries land in file order; nothing is ever deleted by it). clip fields: id, owner, start, model, res, dur, figRows, step, speed, pace, kind, k, test. Shared text: `LOOK` (people), `LOOK_FOE` (monsters), `BOOP`, `STRIKE`, `END(seconds)`. Models: `G15`, `LITE`. |
| Start picture | `python3 tools/clip-bake/make_start.py <owner or foe id>` writes `art/clips/start/<id>.png` | Person: battle idle frame on flat magenta, 960 x 720, figure 60 percent of the height, middle at 55 percent, feet at 85 percent (Rose 83 rows). Monster: 70 percent, centred, keeps the sheet's facing. |
| Generate | `clipGenerate` | POST `/v1/videos/generations` {model, prompt, image:{url: data address}, duration, resolution}, then GET `/v1/videos/<request_id>` every 5 s until `video.url`. Request id kept in localStorage `aot-clip-pending` so a closed page never pays twice. The API accepted the name `grok-imagine-video-1.5-lite`. |
| Review | `clipRvDraw`, `clipBf` | Frame slider, frame step buttons, SPEED row, marks by kind (START, HIT, END), ON THE BATTLEFIELD loop. Study videos (`test: true`) hide marks and speed. |
| Approve | `decide()` in art.html, `clipApproveFile` | Commits `.mp4`, `.json` address (the usual case: `vidgen.x.ai` blocks page reads), or `.json` pointer to the saved copy on a re-approve. Several approves within seconds cancel each other's Action runs; the last run bakes them all (seen 11-18, worked). |
| Bake | `bake_clip` in `tools/art-library/art_bake.py`; Action `art-bake.yml` | Downloads the address, saves the `.mp4`; study videos stop here. Otherwise marks to frame numbers by the real frame rate, `clip.step` scaled from 30 a second, runs `tools/clip-bake/bake_clip.py`, adds the script tag to index.html for a new clip. `reach` is the leftmost point of the figure on the HIT picture (the fingertip for a Boop). `gh workflow run art-bake -R trivituso81/adventures-of-tom --ref main -f files=<path>` rebakes named files. |
| Engine | `engine/clips.js` (`bclipDefine`, `ST.clip`, `bclipFor`, `bclipLoopFrame`, `bclipLabNap`), `Rm.boopClip` in `engine/rose-moves.js` | Clip pictures load per fight (`bclipWanted`: owners in the party or among the foes), never at boot. While both `rose_strike` and `rose_boop` exist, both atlases load in a Lab fight with Rose. |

Known rough edges: Grok's full model paints a dark floor shadow under the lunge (`key()` removes it) and one smeared in-between frame; lite did neither. Library version numbers read one lower than the file number (harmless). `tools/art-library/test.py` (the old Library test) fails on stale counts since before clipgen1. In a two-Mudling formation the back Mudling's health bar crosses the front one's sprout (formation layout, older than the clips).

## PRICES (xAI, 2026-11-17)
- `grok-imagine-video-1.5-lite`: $0.02 / s at 480p. A 3 s clip is about 7 cents; about $11 for the 150 clip first pass. DEFAULT.
- `grok-imagine-video-1.5`: $0.08 / s at 480p, $0.14 at 720p, $0.25 at 1080p, plus $0.01 per input picture. A 3 s 480p clip is about $0.25; about $38 for 150.
- End frame exists only in reference mode (`last_frame`, capped at 720p). Not used: forward then backward play makes it unnecessary for idles.

## THE CALL
- Grok lite first, Grok full second, Wan 3.0 third (not on the xAI API: Sorceress by hand plus `bake_clip.py`). The lying-down state no longer needs Wan.
- 480p, 3 s for attacks; 4 s for the lie-down. Creatures at 70 percent of the frame, baked at k 8.
- Monster idle defaults: the approved Mudling recipe.
- An attack prompt must name the move's real gesture, taken from canon and the move's painted frames (look at them first), in plain body words. A generic "strike" comes back as a chop. Name only what should appear; say nothing about speed.
- A new clip is wired before its video exists (the move checks `BCLIPS.<id>`), so Tom's approval puts it in the Lab with no session in between.
- Style question is CLOSED (heroes are coloured pencil and ink in the repo; do not raise it again unless Tom does).

## EXAM RESULTS (2026-11-17, one sample per cell, made in Sorceress from hero paintings)
| Shot | Wan 3.0 | Grok Imagine Video 1.5 |
|---|---|---|
| 1 Rose strike | PASS | PASS in the Library as a pipeline test (a karate chop, not Boop). Lite: PASS, cleaner. Real Boop: entry built 11-18, video pending. |
| 2 Rose swings Lamby | FAIL (second lamb appears) | PASS on the prop; lamb and arms leave the frame |
| 3 Sleepy flop | PASS | Sorceress: PARTIAL. Library retry `clip-rose-sleep`: PASS, Tom: "looks great". IN THE LAB. |
| 4 Mudling idle | PASS | Sorceress: body lifts once. Library retry `clip-mudling-idle`, calm paced stretch: Tom: "PERFECT". IN THE LAB. |
| 5 Big One attack | FAIL (body morphs, props vanish, splash) | PASS |
| 6 Cut-in | PASS, more epic | PASS, smaller |

## Repo facts
- Enemy atlases are `art/foes/<id>.webp`, cut by `rects` in `data/foes/<id>-hires.js` (Mudling k 8.773, stance 44 x 44.6 rows). Lamby prop: `art/props/rose/lamby.webp`.
- Rose battle idle: `art/chars/rose-battle.webp` rect 0,0,300,264 (k 3); the standing figure is 83 rows tall. Her ability frames (`ab_*`) are in `art/chars/rose-poses.webp` (atlas `btp` in `data/rose-hires.js`).
- Clone: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1`, about 1 minute. `add_repo` with push access works when Tom says he gives permission. `gh` works for Action runs and logs. The test browser must be installed each session: `python3 -m playwright install chromium`. The site's publish run takes about 4.5 minutes after a push.

## Files (claude/anim-test/)
Prompts: `exam-2a`, `exam-2b`, `exam-3`, `exam-4b`, `exam-5`, `exam-6a`, `exam-6b` (all v1), `anim-test-2-strike-v4.txt`. Scripts: `make_creature_start.py`, `exam_review.py`, `key_magenta.py`, `clip_to_frames.py`, `make_magenta_start.py`, `measure_clip.py` (the repo tools replace these for game use).
