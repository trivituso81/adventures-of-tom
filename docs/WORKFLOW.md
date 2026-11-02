# Workflow: Claude runs this repo

## Roles

- **Tom** directs and plays. He does not code, review code, or run commands.
- **Claude** does everything else: edits, tests, commits, pushes, publishes.

## Where things live

| Thing | Home |
|---|---|
| The live app (what Tom plays and reviews on his phone) | GitHub Pages, https://trivituso81.github.io/adventures-of-tom/ (serves `main`, voiced) |
| Code history and docs | This repo, branch `main` |
| Scratch copy for building and testing | The claude.ai artifact, link `https://claude.ai/artifact/HzHh5DBHsbnyNrAvEFZ4V1`. Not what Tom plays. The link must never change. |
| Baked voice audio (about 170 MB) | This repo (`data/voice/`, `data/voice-clips.js`); the artifact holds a copy. |
| Session handoff | The Project doc `claude/next.md` |

## Routine for every change

1. Clone the repo (shallow). Read `claude/next.md` in the Project, then only the files the task needs.
2. Make the change. Small commits, one subject each, readable messages.
3. `python3 tools/smoke.py` must exit 0; for a move, `python3 tools/kit_test.py <id> --only=<key> --speed2`. Look at the screenshots in `tools/shots/` (git-ignored), portrait and landscape.
4. Commit and push to `main` when the smoke test passes (it includes the tag check, see below). GitHub Pages updates itself within a minute or two; check the live URL before telling Tom it is done.
5. If the change was built or tested on the artifact first: pull every artifact file (Artifact read `paths`, at most 64 MB per call; re-read anything fetched before the version changed), strip the wrapper from `index.html`, copy them over the repo, run the smoke tests, then step 4. Keep the artifact in step by publishing the same files to the SAME link (`url`, `index.html` as the page, changed files in `files`; re-list first in case another session published). The artifact is a copy, so never leave it ahead of `main`.
6. Tell Tom in a few sentences what changed and what to look for on his phone.
7. Rewrite `claude/next.md` (under 40 lines) before ending.

## Cache tags and the service worker (since `sw1`, 2026-11-02)

`sw.js` keeps every file whose address carries `?v=` and never asks the server about it again, so **a changed file must move its tag in the same push**: the `?v=` on its `<script>` tag in `index.html`, its literal `path?v=TAG` in `engine/` or `data/` (plates in `engine/plate.js`, portraits in `engine/menu.js`), or the folder-wide constant (`ART_V` for `art/chars` and `art/foes`, `BG_V` for `bgs/`, `V` in `engine/prop-art.js`, `v` in `data/flight-art.js`). `python3 tools/smoke.py` runs `tools/tag_check.py` and fails when a modified file's tag did not move since `origin/main`; also bump the tag of any script you edited while moving a constant. Files with no tag (184 scripts, `data/voice/dialog-ch*.js`, `music/`, `art/welcome.webp`) need nothing: the worker asks the server whether they changed. `python3 tools/sw_test.py` tests the worker itself (about 90 s). Last resort when something stays stale on a phone: change `SW_VER` in `sw.js`. `?nosw` on the address runs the game without the worker. Pages (`index.html`) are always fetched from the network.

## Voice files

Identical in the repo and the artifact. Never edit them by hand. Merge a `voices.json` only when Tom sends one (Project doc `claude/voice-baking.md`), commit to `main`, and publish the same voice files to the artifact. Reworded spoken lines silence their clips; log them in `docs/CHANGES.md` under "Lines to bake".

## Definition of done

Smoke test passes, screenshots looked at, pushed to `main`, live GitHub Pages URL checked, no new console errors, no save-format change without a migration, and a short plain summary for Tom.

## Change log

`docs/CHANGES.md`, newest first.
