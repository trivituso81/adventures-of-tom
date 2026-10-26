# Workflow: Claude runs this repo

## Roles

- **Tom** directs and plays. He does not code, review code, or run commands.
- **Claude** does everything else: edits, tests, commits, pushes, publishes.

## Where things live

| Thing | Home |
|---|---|
| All code and docs | This repo, branch `main` (source of truth) |
| The playable game Tom opens on his phone | A claude.ai artifact, link `https://claude.ai/artifact/HzHh5DBHsbnyNrAvEFZ4V1`. The link must never change. |
| Baked voice audio (about 170 MB) | The artifact only. The repo holds an older partial snapshot of the per-character files and none of the dialogue clips. |
| Session handoff | The Project doc `claude/next.md` |

## Routine for every change

1. Clone the repo (shallow). Read `claude/next.md` in the Project, then only the files the task needs.
2. Make the change. Small commits, one subject each, readable messages.
3. `python3 tools/smoke.py` must exit 0; for a move, `python3 tools/kit_test.py <id> --only=<key> --speed2`. Look at the screenshots in `tools/shots/` (git-ignored), portrait and landscape.
4. Push to `main`.
5. Publish to the artifact: pass the SAME link as `url`, `index.html` as the page, and only the changed non-voice files in `files`. Files not passed are kept. Re-list the artifact files first in case another session published.
6. Tell Tom in a few sentences what changed and what to look for on his phone.
7. Rewrite `claude/next.md` (under 40 lines) before ending.

## Voice files

Never edit, regenerate or publish `data/voice-clips.js` or `data/voice/*.js` from the repo. They change only when Tom sends a `voices.json`, merged from the live artifact copies (see the Project doc `claude/voice-baking.md`). Reworded spoken lines silence their clips; log them in `docs/CHANGES.md` under "Lines to bake".

## Definition of done

Smoke test passes, screenshots looked at, pushed to `main`, published to the artifact, no new console errors, no save-format change without a migration, and a short plain summary for Tom.

## Change log

`docs/CHANGES.md`, newest first.
