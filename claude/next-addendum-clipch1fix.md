# clipch1fix (2026-11-19, main 2e0743d): chapter 1 clip bake fixes and prompt edits from Tom's review notes. Nothing generated, nothing spent

Build 2 of claude/clip-gate-plan.md section 5. Repo doc: docs/CHANGES.md "clipch1fix".

## What changed

| Piece | Fact |
|---|---|
| Idle loops | People's idles (Tom, Grace, Rose, Deedee) and the Grump, Toad and Log idles: `step 2, speed 1`, no `calm`: the whole marked stretch plays at 1x, so the video's own blink plays at real speed. About 13 to 16 MB in phone memory each (step 1 was 25 MB, and Tom's did not fit a WebP). Guards keep `calm .875`, 0.3x (the held braced pose). Mudling and Big One idles (approved) unchanged |
| `wrap` | New clip field. bake_clip.py `--wrap` (art_bake passes `clip.wrap`), `D.wrap` in data/clips, engine/clips.js `bclipLoopFrame` / `bclipLoopLen` play it forward only; END becomes the picture of the last 40% nearest the first (`wrap_end`). gate.py `played`, `header_for`, `baked_header` know it. Used by the Grump and the Toad |
| Speed | Cast x4, Lounge Pass, Wet-Floor: 1x (was 1.5x). Give stays 1.5x |
| Prompts | Smallest edit per note, MOTION only (list in docs/CHANGES.md). Hit clips use the head without "feet planted" (they stumble half a step back) |
| `REMAKE` | List in clip-prompts.js: drift-only rejects made again with the same prompt (promptRev raised once above the rejection): grace-victory, grace-cubepop, grace-squeeze |
| Whitespace | clip-prompts.js no longer treats the same words with other outer whitespace as a rewrite (it had raised promptRev on 17 approved monster clips) |
| Log Lump idle | Bake fault only: the same video re-cut locally with art_bake.bake_clip, approved again as version 2 (`from: clipch1fix`). Gate passes it |
| Queue | Chapter 1: 67 clips, 43 to make now, 24 approved, 0 redo waiting. Estimate $3.37 (`python3 -I tools/art-library/clipgen.py --dry-run`) |

## Tried and dropped

An automatic blink finder (eye band followed through the head sway, local base, quickest closing paced to 0.25 s). On the real videos it found the Big One's blink but missed Deedee's real 3-picture blink (frames 20 to 22) and fired on head moves. The existing chapter 1 idles had slow blinks anyway (Tom 0.83 s, Rose 0.96 s), so the real fix is the prompt ("blinks once, quickly") plus the 1x whole stretch. Do not rebuild it unless a remade idle shows a quick blink being missed.

## For the next session (clipch1remake)

- Start: `gh api repos/trivituso81/adventures-of-tom/actions/workflows/clip-gen.yml/dispatches -f ref=main -f 'inputs[dry_run]=false' -f 'inputs[cap]=5'` (gate defaults to true). It makes only the 43; check the report on branch `clipgen` for held clips.
- Look at the baked frames of the remade idles (blink present and quick?), the Grump and Toad (forward-only loop, small jump at the wrap), and every held clip.
- Then a Tom card: ADMIN > BATTLE LAB > CHAPTER 1 REVIEW (both fights), the remade clips only, REDO with notes; `done_when {"clips_reviewed": "Chapter 1"}`, ask `animations`, blocking the next Claude card.
- Tests: tools/clip-gate/gate_test.py, vision_test.py, grab_test.py, replay.py --cache (exits 0; lists the Log idle as "missed" because it is fixed). clip_kinds_test, clip_review_test and smoke's board_sync_test "no after" case fail before and after clipch1fix (pre-existing).
