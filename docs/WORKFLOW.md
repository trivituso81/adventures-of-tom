# Workflow: how this repo relates to the live game

## The facts

- Tom plays the game from an iPhone home-screen shortcut that points at a claude.ai **artifact** link. That artifact is the live game and, today, the canonical copy. It also holds the baked voices, which are not in this repo.
- This repo is a **working copy of the source** (everything except voice audio and the frozen `demo/` folder). It was exported from artifact version `1792983007-0e46` (v252) on 25 Oct 2026.
- Tom also keeps a GitHub Pages copy at `trivituso81/adventures-of-tom`. A GitHub Pages build of this repo is silent (no voices) and saves to the browser only.

## The rule that prevents lost work

Two copies can drift. Until Tom says this repo is the new source of truth:

1. Work on a branch, never directly on `main`.
2. Keep every commit small and about one thing, with a message Tom can read ("Rebuild Grace's Cartwheel: two wheels, new poses").
3. When you finish, list the **exact files you changed** in your summary. Those are the files that must be carried back into the live artifact.
4. Do not reformat, reorder or rename files you are not changing. Whole-file formatting changes make carrying changes back impossible.
5. Never change a spoken line without recording it (see `docs/VOICE.md`).

## How Tom checks your work

- On his phone, from a GitHub Pages or preview URL of your branch if one exists. If none exists, he will be sent a link from the live artifact after the changes are carried back.
- He reports what he sees in plain words ("the cartwheel looks like a wheel now", "Rose is hidden behind Tom"). Treat each report as a bug report; reproduce it with `tools/kit_test.py` or `tools/smoke.py` before fixing.

## Definition of done

- `python3 tools/smoke.py` exits 0 and you looked at the screenshots in `tools/shots/` (they are git-ignored).
- For a move or scene you changed: `kit_test.py` for that character, frames looked at, portrait and landscape.
- No new console errors. No change to save format without a migration.
- Summary to Tom: what changed, what to look for on the phone, files changed. Three to six sentences, table if it helps.

## Change log

Keep a running log in `docs/CHANGES.md`, newest first: date, one line per change, files touched, and a "Lines to bake" list for any new or reworded spoken line.
