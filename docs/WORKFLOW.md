# Workflow: Claude runs this repo

## Roles

- **Tom** directs and plays. He does not code, review code, or run commands.
- **Claude** does everything else: edits, tests, commits, pushes, publishes.

## Where things live

| Thing | Home |
|---|---|
| Working copy of the game (what Tom reviews) | The claude.ai artifact below |
| Published copy, code history and docs | This repo, branch `main`, updated only when Tom asks |
| The playable game Tom opens on his phone | A claude.ai artifact, link `https://claude.ai/artifact/HzHh5DBHsbnyNrAvEFZ4V1`. The link must never change. |
| Baked voice audio (about 170 MB) | The artifact; copied to the repo on each push. |
| Playable on GitHub Pages | https://trivituso81.github.io/adventures-of-tom/ (serves `main`, voiced) |
| Session handoff | The Project doc `claude/next.md` |

## Routine for every change

1. Clone the repo (shallow). Read `claude/next.md` in the Project, then only the files the task needs.
2. Make the change. Small commits, one subject each, readable messages.
3. `python3 tools/smoke.py` must exit 0; for a move, `python3 tools/kit_test.py <id> --only=<key> --speed2`. Look at the screenshots in `tools/shots/` (git-ignored), portrait and landscape.
4. Publish to the artifact: pass the SAME link as `url`, `index.html` as the page, and only the changed files in `files`. Files not passed are kept. Re-list the artifact files first in case another session published.
5. Only when Tom asks: pull every artifact file (Artifact read `paths`, at most 64 MB per call; re-read anything fetched before the version changed), copy them over the repo, run the smoke tests, commit and push to `main`. GitHub Pages updates itself within a minute or two.
6. Tell Tom in a few sentences what changed and what to look for on his phone.
7. Rewrite `claude/next.md` (under 40 lines) before ending.

## Voice files

Identical in the repo and the artifact. Never edit them by hand. Merge a `voices.json` only when Tom sends one (Project doc `claude/voice-baking.md`), commit to `main`, and publish the same voice files to the artifact. Reworded spoken lines silence their clips; log them in `docs/CHANGES.md` under "Lines to bake".

## Definition of done

Smoke test passes, screenshots looked at, pushed to `main`, published to the artifact, no new console errors, no save-format change without a migration, and a short plain summary for Tom.

## Change log

`docs/CHANGES.md`, newest first.
