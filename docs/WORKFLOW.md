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
4. Commit and push to `main` when the smoke test passes (it includes the tag check, see below). The live site follows in about 4 minutes (see "How main reaches the phone" below); check the live URL before telling Tom it is done.
5. If the change was built or tested on the artifact first: pull every artifact file (Artifact read `paths`, at most 64 MB per call; re-read anything fetched before the version changed), strip the wrapper from `index.html`, copy them over the repo, run the smoke tests, then step 4. Keep the artifact in step by publishing the same files to the SAME link (`url`, `index.html` as the page, changed files in `files`; re-list first in case another session published). The artifact is a copy, so never leave it ahead of `main`.
6. Tell Tom in a few sentences what changed and what to look for on his phone.
7. Rewrite `claude/next.md` (under 40 lines) before ending.

## How main reaches the phone (pubfast1, 2026-11-18)

Facts measured on 2026-11-18 (1,105 publishes, 11-11 to 11-18):

- One publish takes about 3.7 minutes: check out the repo 76 s, bundle and upload 82 s, GitHub's own deploy 64 s. All three grow with the size of the site, and the site is the whole repo: 2.17 GB, of which `art/raw` (the approved source pictures the Art Library reads) is 1.3 GB and grows with every APPROVE.
- GitHub's limit for a published site is 1 GB and for a deploy 10 minutes. Every publish log already carries the warning "Uploaded artifact size of 2172386739 bytes exceeds the allowed size of 1 GB. Deployment might fail."
- GitHub's built-in publish ("pages build and deployment") cancels the publish in progress whenever a new push lands. On busy days 60 to 90 percent of publishes were cancelled, so a push waited 7 minutes typically and 15 to 44 minutes at worst.

What is in place:

- `.github/workflows/publish.yml` publishes `main` itself: one publish at a time, never cancelled, the newest waiting push next. It also runs after `art-bake` (that job's own push cannot start a workflow). Expected wait: about 4 to 5 minutes typical, under 7 at worst.
- It is switched on by one repo setting, Settings > Pages > Source = "GitHub Actions" (only Tom can change it). Until then its `check` job sees "legacy" and stops, and the built-in publish carries on. Setting it back to "Deploy from a branch" undoes the switch.
- `gh run list --workflow publish.yml --limit 5` shows the last publishes; a manual run with `dry_run` builds the bundle without putting it live.
- Left off the site: `tools/sprite-bake/src` (244 MB, no page reads it). Add a folder to the `sparse-checkout` list in publish.yml only after proving no page loads from it: `art.html`, `portraits.html` and `flight-preview.html` read `art/raw` from the site today.

Not done yet (build `pubfast2`, plan in the Project doc `claude/next-addendum-pubfast1.md`): take `art/raw` off the site so a publish drops to about 1.5 minutes and the site gets under 1 GB.

## Cache tags and the service worker (since `sw1`, 2026-11-02)

`sw.js` keeps every file whose address carries `?v=` and never asks the server about it again, so **a changed file must move its tag in the same push**: the `?v=` on its `<script>` tag in `index.html`, its literal `path?v=TAG` in `engine/` or `data/` (plates in `engine/plate.js`, portraits in `engine/menu.js`), or the folder-wide constant (`ART_V` for `art/chars` and `art/foes`, `BG_V` for `bgs/`, `V` in `engine/prop-art.js`, `v` in `data/flight-art.js`). `python3 tools/smoke.py` runs `tools/tag_check.py` and fails when a modified file's tag did not move since `origin/main`; also bump the tag of any script you edited while moving a constant. Files with no tag (184 scripts, `data/voice/dialog-ch*.js`, `music/`, `art/welcome.webp`) need nothing: the worker asks the server whether they changed. `python3 tools/sw_test.py` tests the worker itself (about 90 s). Last resort when something stays stale on a phone: change `SW_VER` in `sw.js`. `?nosw` on the address runs the game without the worker. Pages (`index.html`) are always fetched from the network.

## Voice files

Identical in the repo and the artifact. Never edit them by hand. Merge a `voices.json` only when Tom sends one (Project doc `claude/voice-baking.md`), commit to `main`, and publish the same voice files to the artifact. Reworded spoken lines silence their clips; log them in `docs/CHANGES.md` under "Lines to bake".

## Definition of done

Smoke test passes, screenshots looked at, pushed to `main`, live GitHub Pages URL checked, no new console errors, no save-format change without a migration, and a short plain summary for Tom.

## Change log

`docs/CHANGES.md`, newest first.
