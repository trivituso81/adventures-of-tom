# clipgate2 (2026-11-19, main 226e28a): vision check built and replayed, pass bar NOT met (stop-loss), gate wired into clip-gen

Tom (11-19 15:09): "build clipgate2. Spend at most $2 of xAI credit, on the vision check only; make no videos." Spent $0.361 (153 calls). No video made. Detail: docs/CHANGES.md "clipgate2" and "clipgate2a".

## What exists now
| Piece | Fact |
|---|---|
| `tools/clip-gate/vision.py` | xAI chat model with image input (picked at run time: grok-4.20-0309-non-reasoning). Two images per clip (12 played pictures plus event pictures; start picture plus 8 head crops), a move card per KIND of move, a blind description first, a checklist JSON, majority of 3. Cap checked before every call; resumes without paying twice. |
| `.github/workflows/clip-gate.yml` | The key is a repo secret, so paid calls run here. Inputs group, ids, runs, cap, fresh, dry_run. Answers on branch `clipgate` (never merge). |
| `tools/clip-gate/vision-policy.json` | `hold` questions block approval; `advisory` ones are reported only. Hold: g_cover, d_back, k_dizzy, k_nohop, k_back, r_stride, v_big, h_stagger, i_blink, i_relaxed, p_same, p_parts. Advisory: n_name, n_nowave, p_noobj, m_blink_quick, m_pupils, m_animated, m_drops. |
| `tools/clip-gate/hold.py`, `gate.header_for` | Judge a fresh video the way the game will bake it (header_for equals the real baked headers). |
| `tools/art-library/clipgen.py --gate`, clip-gen input `gate` (default true) | A clip that fails is held on branch `clipgen` (report key `held`, video kept in state), not approved. |
| `tools/clip-gate/grab.py` | In-game frame grab in CHAPTER 1 REVIEW: drawn figure height in the stance, each clip picture, the stance after. |
| `replay_vision.py`, `vision-map.json` | Replay against Tom's notes. |

## Result
- Rejected flagged 34 of 44, approved flagged 1 of 23 (clip-grace-give: grows 1.17x in the game, feet 6% lower; Tom's call). Bar was 44 of 44 and at most 3 of 23. In-sample caveat: the hold policy was chosen after seeing the replay.
- Works (no alarm on approved clips): guard covers face and body, dodge goes back, dizzy before KO, run reads as a stride, victory big, same face and skin.
- Does NOT work: his invented moves (give, cast, blockade, tackle, lava, giddyup, squeeze, wet floor, scrub, lounge pass) and monster eyes. Not flagged: grump-idle, toad-idle, tom-give, tom-loungepass, tom-blockade, grace-cast, rose-cast, rose-tackle, rose-lava, deedee-run.
- Correction: the four hit clips DO show a grimace (his note says what the move should do). `review-ch1.json` fixed.
- tom-give "size pulses": not in the video and not in the stance-to-clip switch (drawn 143 / 141 / 142 px). Unexplained.
- `tools/art-library/clipgen_test.py` fails one check ("an approval on a main that moved keeps the other session's change") with and without this build.

## Stop-loss analysis
The vision model cannot know what Tom accepts for a move he invented; the approved give clips were flagged as hard as the rejected ones. Rewording questions will not fix that, so no third variant. The one different method worth trying, only if re-makes keep missing: show the model Tom's approved clips of the same kind as reference pictures. Do not build it before then.

## Next: clipch1fix (board card c-clipch1fix, now Up next; Opus 5.5, medium)
1. Bake fixes (free): loop stretch with a blink and `clip.pace`, no backward half for falling things, `clip.speed` 1.0 for moves except give.
2. Prompt edits by the smallest change from claude/clip-gate-plan.md section 3 (raise `promptRev`).
3. Re-make only drift or changed prompts through `clip-gen` with `gate` on; for invented moves Tom's CHAPTER 1 REVIEW is the check.
Prompt: "Read claude/clip-gate-plan.md (sections 3, 4.5 and 5) and claude/next-addendum-clipgen2.md, then build clipch1fix. You have my full permission to access the repo."

claude/next.md was not rewritten this session (it is over its size cap and was not re-read for a merge): its ORDER NOW -12 line still says clipch1fix waits on the gate; this file and board card c-clipch1fix win.
