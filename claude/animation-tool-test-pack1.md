# Animation tool test: CLOSED (2026-11-18 18:10). Read claude/animation-chapter-plan.md instead

Tom (18:06): "can't we just do all of chapter 1 at once? im tired of testing after every one." The one-clip-at-a-time test is over. All clip work now goes chapter by chapter per `claude/animation-chapter-plan.md` (next build: clipbatch1). Do not ask Tom to generate or watch any single clip.

## Facts kept from this thread (still true)

| Thing | Fact |
|---|---|
| Approved and baked clips | `rose_boop` (strike), `rose_sleep` (state), `mudling_idle` (loop) |
| Entries made, never generated (no cost spent) | `clip-rose-ko` (clipko1), `clip-grump-idle`, `clip-toad-idle`, `clip-log-idle`, `clip-bigone-idle` (clipfoes1, main a617fa5). They roll into the chapter 1 batch |
| Prompt pattern | `BOOP_APPROVED` in `tools/art-library/clip-prompts.js` (never reword); a person clip edits its MOTION part only; a monster idle edits only the sentences naming its own parts in the Mudling entry |
| `--calm` | `bake_clip.py --calm SECONDS` (kind loop) keeps the stretch with least body motion; entries carry `clip.calm: .875`; on the Mudling video it lands on frames 37 to 57 (hand pick 36 to 56). It cannot find a blink, so new loops have no `pace` |
| Memory | about 10 MB per baked clip in phone memory: load a move's clip when picked, keep only idle loops loaded (repo `docs/BATTLE3.md`, "Clips: facts for stage 8") |
| Where clips plug into the new battle | Stage 8 of `claude/battle-build.md`, owned by that thread; this work does not edit `engine/b3-*.js` |

## Rebake commands (repo root, `R=art/raw/clips`; reproduce the repo's clips exactly)
`python3 tools/clip-bake/bake_clip.py $R/clip-rose-boop-v1.mp4 rose-boop rose --first 0 --last 72 --step 2 --impact 34 --fig-rows 83 --speed 1.5 --fps 24 --kind strike --k 4 --tag <TAG>`; `... clip-rose-sleep-v1.mp4 rose-sleep rose --first 0 --last 76 --step 2 --impact -1 --fig-rows 83 --speed 1.5 --fps 24 --kind state --k 4 --tag <TAG>`; `... clip-mudling-idle-v1.mp4 mudling-idle mudling --first 36 --last 56 --step 1 --impact -1 --fig-rows 44.6 --speed 0.3 --fps 24 --kind loop --k 8 --pace 54:1:1 --tag <TAG>`

## Repo facts
- Clone `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1` after `add_repo` (push). `python3 -m playwright install chromium` each session.
- Tests: `tools/clip_test.py`, `tools/clip_kinds_test.py`, `tools/art-library/clip_lib_test.py` (its entry list check must be updated for every new clip entry), `tools/smoke.py`.
- Push: CHANGES heading, commit, `git fetch --depth=50 origin main`, `git rebase --onto origin/main <commit before yours>` (a conflicting stamp commit: `git rebase --skip`, rerun bump_tags), `bump_tags.py <TAG> --base origin/main`, `git -c push.negotiate=true push origin HEAD:main`.
- If `clip_lib_test.py` crashes midway: `pkill -f "http.server 8813"; pkill -f art-library/stub.py`.
