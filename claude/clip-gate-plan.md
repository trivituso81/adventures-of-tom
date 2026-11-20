# Clip quality gate (clipgate1 built 2026-11-19; clipgate2 built 2026-11-19, main 226e28a). This file wins over the clipch1fix lines in claude/animation-chapter-plan.md where they differ

Tom (11-19 14:27): "Build an automatic quality gate for battle clips before any re-make: measured frame checks first, replayed against Tom's 47 notes, then plan the vision-model check. Do not generate or spend anything until the gate flags the clips he rejected."

STATUS: sections 1 to 3 as built in clipgate1. Section 4 (vision) is BUILT (clipgate2); results in 4.5. Section 5 order updated. Hand-over: claude/next-addendum-clipgate2.md.

## 1. Measured part (clipgate1, built)
`tools/clip-gate/measure.py` (keys out magenta, per picture size against the start picture, feet, lean, eye band, motion), `gate.py` (judges the clip AS THE GAME PLAYS IT from the `data/clips/<id>.js` header; checks size, feet, edge, still, blink_none, blink_slow, pose_drift, hit_no_stumble, dodge_forward, hop, ko_forward; family clips face left so forward is -x), `review-ch1.json` (Tom's 45 notes on 44 clips, sorted by hand), `replay.py`, `gate_test.py`. Measured replay: 27 of 44 rejected flagged; 1 of 23 approved flagged (clip-grace-give, grows to 1.23x in the video).

## 2. Why the clips missed (hand-judged from prompts, bake headers and measurements)
| Cause | Clips | Free fix |
|---|---|---|
| Bake: idle and guard loops keep only the calmest 0.875 s (`clip.calm`), which by design is the stretch WITHOUT the blink, played at 0.3x and forward then back | log-idle, tom, rose, deedee idle (no blink in the kept stretch), grump and toad (0.3x blink), toad drops and grump pupils (the backward half), tom-guard "size pulses" | Pick the loop stretch by rule: start and end on the start pose, include one blink, play the blink at 1x or faster with `clip.pace` (approved Mudling idle does this), forward only when something falls or turns |
| Bake: moves and states play at 1.5x | tom-cast, tom-loungepass, deedee-wetfloor, grace, rose, deedee cast ("should be longer") | `clip.speed` 1.0; leave give at 1.5x |
| Prompt asked for it | hit x4 (flinch in place; he wants a stumble back), run x4 (high knees), KO x3 (no dizzy face), guard x4 (forearms in front of chest), idles ("blinks once" draws a 0.8 to 1 s blink), tom-victory, deedee-victory, rose-lava, rose-giddyup, deedee-scrub, tom-loungepass, blockade, tackle, squeeze, give, cast | Prompt edits by the smallest change (repo CLAUDE.md), from his note and the move's meaning in docs/BATTLE3.md and data/b3-kit-<id>.js |
| Generator drift | size and feet: tom-guard, tom-dodge, tom-victory, tom-cast, grace-idle, grace-guard, grace-cubepop, grace-squeeze, grace-victory, deedee-cast, deedee-dodge; prop into the ground: deedee-wetfloor; dodge forward x4; deedee-ko falls forward; rose-ko hops; deedee-scrub glasses; deedee-victory yellow palms | Re-make, gated |

## 3. The vision check (design as built)
Judges only what the measured checks cannot: faces, what a pose reads as, parts and objects, monster eyes, small physics. Per clip two images (12 played pictures including the backward half plus event pictures on mid grey with game times; start picture plus 8 head crops), a move card per KIND of move (never the clip's own note), a blind one-sentence description, then a JSON checklist; majority of 3. Model chosen at run time from `/v1/language-models`: cheapest with image input, non-reasoning (grok-4.20-0309-non-reasoning). The key is a repo secret, so paid calls run in the `clip-gate` Action (answers on branch `clipgate`). `vision-policy.json`: `hold` questions block approval, `advisory` ones are reported only. The `clip-gen` Action runs the whole gate on each fresh video (input `gate`, `--gate`) and holds a failing clip on branch `clipgen` instead of approving it.

## 4.5 clipgate2 results (replay on the 67 clips of Chapter 1, 3 runs, 153 calls, $0.361)
| Measure | Result | Bar |
|---|---|---|
| Rejected clips flagged (measured plus hold questions) | 34 of 44 (measured alone 27) | 44 of 44, NOT met |
| Approved clips flagged | 1 of 23 (grace-give: grows 1.17x in the game, feet 6% lower; Tom's call) | at most 3, met |
| Look faults answered "no" by the matching question | guard, dodge_back, dizzy KO, run, victory, same face: yes; invented moves and monster eyes: no | 80% each, NOT met |

- Not flagged: grump-idle, toad-idle, tom-give, tom-loungepass, tom-blockade, grace-cast, rose-cast, rose-tackle, rose-lava, deedee-run ("same comment as Tom").
- Cross-check of what it can see: dodge_back 4 of 4, hit_back 3 of 4, hop 0 of 1, ko_back 0 of 1, pose_drift 1 of 1; all four hit clips DO show a grimace (the earlier hand sorting of that note was wrong, corrected in `review-ch1.json`).
- tom-give "his size pulses": not in the video and not in the game. In-game grab: stance 143 px, clip 141 px, stance after 142 px. The grab does catch real changes (grace-give 1.17x, tom-victory 1.15x and pops back).
- In-sample caveat: the hold policy was chosen after seeing the replay.
- STOP-LOSS: the 1-run and 3-run replays missed the same way. The model cannot know what Tom accepts for moves he invented (it flagged the approved give clips and the approved Windex as hard as the rejected ones; monster blink-speed flagged the approved Mudling and Big One idles as hard as the Grump). No rewording of the questions will change that. Those questions stay advisory. For his invented moves (give, cast, blockade, tackle, lava, giddyup, squeeze, wet floor, scrub, lounge pass) his CHAPTER 1 REVIEW of the re-made clip is the check. The only different method worth trying, and only if re-makes keep missing: show the model Tom's approved clips of the same kind as references.
- `tools/art-library/clipgen_test.py` fails one check ("an approval on a main that moved keeps the other session's change") with and without clipgate2 (pre-existing).

## 5. Order from here
| # | Build | What | Spend |
|---|---|---|---|
| 1 | clipgate2 | DONE (this file, 4.5) | $0.36 |
| 2 | clipch1fix | Bake fixes first (loop stretch with a blink, pace, no backward half for falling things, speed 1.0 for moves except give), re-bake; then prompt edits from section 2 by the smallest change, `promptRev` raised | none |
| 3 | clip-gen run, `ids` only | Re-make only clips whose fault is generator drift or whose prompt changed; the gate runs on each (input `gate`, default true) | about $0.08 a clip |
| 4 | Tom | CHAPTER 1 REVIEW of the remade clips only | |

## 6. Tests
- `python3 -I tools/clip-gate/gate_test.py`, `vision_test.py` (stand-in xAI server), `grab_test.py`: FAILS: []
- `python3 -I tools/clip-gate/replay.py --cache /tmp/cg` (about 3 min the first time; exits 0)
- `python3 -I tools/clip-gate/replay_vision.py <vision.json>` (vision.json from branch `clipgate`)
