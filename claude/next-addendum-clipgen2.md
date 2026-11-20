# clipgen2 (2026-11-19, main e8357f6 and 297bc74): a GitHub Action makes, marks, approves and bakes the chapter's battle videos. Chapter 1 is DONE: 67 of 67 clips approved and cut, $5.34

Build 3 of `claude/animation-chapter-plan.md`. Repo doc: docs/CHANGES.md "clipgen2" and "clipgen2b".

## What exists now

| Piece | Fact |
|---|---|
| Workflow | `.github/workflows/clip-gen.yml`, manual only. Inputs: `group` (default `Chapter 1`), `ids` (only these entries), `limit`, `cap` (default 8, dollars), `dry_run` (default true). Secret `XAI_API_KEY` (Tom set it; it works). Start: `gh api repos/trivituso81/adventures-of-tom/actions/workflows/clip-gen.yml/dispatches -f ref=main -f 'inputs[dry_run]=false' -f 'inputs[cap]=8'` |
| Script | `tools/art-library/clipgen.py`: picks the group's entries with a `clip` that are not approved (a rejected one only when `promptRev` > the rejection's `rev`), sends prompt + start picture the way `clipMake` does, 3 at a time, spend checked before each send, saves each video the moment it downloads, approves it (exactly what `decide('ok')` writes: `art/raw/clips/<id>-v<k>.mp4`, `status approved`, `versions` entry `{n,file,date,from:'clipgen',at,marks}`), one commit per clip, rebases against a moving main |
| Marks | `tools/art-library/clipmarks.py`, a port of `clipAutoMarks`. Same marks as the browser within 1 frame on 7 stand-in videos x 3 kinds. A video that barely moves is not approved: it is held on branch `clipgen` and listed in the report (never happened in the real run) |
| State | Branch `clipgen` (never merge it): `state.json` (requests sent and not finished, held videos), `clipgen-report.json`. Each run restores it first |
| Bake | The job's last step dispatches `art-bake` (workflow_dispatch; art-bake's bot guard now allows dispatch). A bake started by hand now also starts `publish` at its end (clipgen2b: GitHub sent no workflow_run to publish for a bake started with the Actions token, so nothing was published after the first run) |
| Test | `python3 tools/art-library/clipgen_test.py` (about 2 minutes; `parity` or `gen` alone; needs ffmpeg and playwright with CHROMIUM) |

## The real run (all times 11-19 UTC)

| Step | Result |
|---|---|
| Dry run on GitHub | 66 clips, $5.34, ffmpeg installed on the runner (version 8.0.1: the script uses `-fps_mode passthrough`, falls back to `-vsync 0`) |
| 3 chosen clips (`ids`: clip-rose-ko, clip-tom-loungepass, clip-mudling-bump) | 20 s to make, all approved, $0.21. Looked at the raw videos and the baked frames: magenta gone; Rose falls and stays lying (the KO wording works: no filter trouble); Tom's card comes out from behind his back and goes back; Mudling lunges and settles |
| The other 63 | 11 minutes, 63 approved, 0 need Tom, 0 failed, $5.13 |
| Bake | 66 clips cut (about 17 minutes), none failed; `data/clips` and `art/clips` hold all 67 with the Mudling idle |
| Total | $5.34 of xAI credit. No retries were needed |

## What clipch1fix needs to know

- Tom's REDO notes are rejections in `data/art-prompts.json` on main (`rejects[-1].note`, `from:'review'`). Smallest change to that entry's MOTION in `CH1` (`tools/art-library/clip-prompts.js`), run `node tools/art-library/clip-prompts.js` (raises `promptRev`), tests, push, then run the clip-gen Action with `dry_run=false` (it makes only entries whose `promptRev` moved; use `ids` to be sure). A remade clip gets approved as a new version (`-v2`) and baked by the dispatched art-bake; the baked clip files are replaced.
- Marks are automatic and only judged by Tom's eye in the review. Marks seen in the run: strikes have the hit at 1.0 to 2.5 s; every state and loop ends at the last moving picture plus half a second (many reach 3.0 s, the end of the video). If Tom says a hit lands late or a clip is cut off, the marks are the first suspect: compare `versions[-1].marks` with the video (`clipmarks.py <mp4> <kind>`), and the cheapest fix is a one-clip hand mark in the Library's REVIEW, not a rewrite of the prompt.
- Things the review may show (not seen yet): Tom's Lounge Pass hit is at 2.2 s of 3.0 (the card held up high counts as the farthest reach); props that pop in or stay; the Deedee and Grace move clips; the Big One's belly-flop and slips.
- The Action approves with `from: 'clipgen'`: the Library's chips show no "approved" mark on such a result (it keys on `from` = `v<n>`). The entry itself reads approved.

## Not done, on purpose

- Nothing was merged from `clipgen` and nothing reads it but the Action.
- The Library's GENERATE CHAPTER button is unchanged and still works for later chapters and single redos.
- The Action does not retry a clip xAI refuses or fails (it lists it in the report). None did.

## Next

Tom (step 4): RELOAD on the title once the publish finishes (`gh run list --workflow publish.yml`), ADMIN > BATTLE LAB > CHAPTER 1 REVIEW and CHAPTER 1 REVIEW: THE BIG ONE, PLAY ALL, REDO with a note on what looks wrong. Then build 5, clipch1fix (prompt in `claude/animation-chapter-plan.md`).
