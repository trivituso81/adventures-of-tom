# Script Editor (script.html)

Tom's tool for editing the words of every scene. Open it from the title screen: ADMIN > SCRIPT EDITOR. Plan: `claude/script-editor-plan.md` (Project), approved 2026-11-14.

## What it does

- One container per scene (grouped by chapter), a stage picture on top (read only, `art/script-stage/<scene>.webp`).
- Per line: reword, remove, add a line or a silent beat, reorder (up and down), change speaker, pause before and after, mood, talking pose, reactions (listener, mood, tap the cue word), voice status, play, record, "Use it".
- Play runs the real scene in the real engine with the edits applied (`engine/script-edits.js`, `sePlayBoot`). The editor page and the game share one function, `seApply`, so what the page shows is what the game plays.
- Copy at four levels (chapter, scene, ticked scenes via Select, whole game), words only or with expressions and pauses.
- Send to Claude writes `data/script-edits.json` to `main` with Tom's GitHub token (`aot-gh-token`); with no token it shares the file instead.

## Moving parts

| Piece | File |
|---|---|
| Editor page | `script.html`, `engine/script-voice.js` (voice panel, same stores as voices.html) |
| Overlay on scenes (edits keyed by speaker plus exact text, `#2` for a repeat) | `engine/script-edits.js` (draft in localStorage `aot-script-draft`, sent edits in `data/script-edits.json`) |
| Index of every scene and line | `data/script-index.json`, built by `python3 tools/script-index/build.py` (runs `walk.js` in the page) |
| Stage pictures | `python3 tools/script-index/stage.py [sceneId ...]` |
| Hand-written action text for staging steps | `docs/script-actions.tsv` |
| Optional hand-fixed Play recipes | `docs/script-recipes.json` |
| Apply step | `python3 tools/script-index/apply.py` |
| Humor guide | `docs/tom-edits.tsv` and `claude/tom-line-edits.md` (Project) |
| Test | `python3 tools/script_editor_test.py`, `python3 tools/script_play_test.py` (Play for every recipe scene) |

## Whenever a scene changes

Run `python3 tools/script-index/build.py` and commit `data/script-index.json`. Run `stage.py <id>` for a scene whose first spoken moment changed. Scenes with no map recipe (`from:'none'` in the index) show "no working Play recipe yet": add a recipe to `docs/script-recipes.json` (`map`, optional `flags`, `unflag`, `party`, `start`, `lose:true` to leave a fight unwon so its try-again lines play), then test it with `python3 tools/script_play_test.py /tmp/sp <id>`. All 221 scenes have a recipe as of scripted2.

## "Apply my script edits"

1. `git pull`, read `data/script-edits.json`.
2. `python3 tools/script-index/apply.py --dry`, then without `--dry`. It rewrites plain `{talk:'X',lines:[...]}` steps in the scene source (reword, remove, add, reorder, speaker, pauses as `{wait:n}`), moves rows in `docs/emotion-index-lines.tsv`, `docs/talk-lines.tsv`, `docs/emotion-reactions.tsv`, patches `data/emotion-moods.js` in place (emotion-apply.py cannot run clean while queued chapter 7 rows exist), runs reaction-apply and talk-apply, purges clips whose text or speaker no longer exists, refreshes the Voice Library index, appends to `docs/tom-edits.tsv`, and empties the edits file.
3. A scene it prints as MANUAL (lines built from variables or templates, or a line moved across a conditional) is left in `data/script-edits.json`. Fold those edits in by hand, then remove that scene from the file.
4. Edits to lines that carry the mood tables for reaction chapters other than 1 and 2 are applied to the tsv only; check `reaction-apply.py` output.
5. `python3 tools/script-index/build.py`, `python3 tools/clip-audit/unused_voice.py` (all four checks 0), `python3 tools/smoke.py`, `python3 tools/script_editor_test.py`. Look at each edited scene (Play it, or the frames from the test).
6. Add the CHANGES entry (list the reworded lines, quote Tom's words), bump tags, push, rewrite `claude/tom-line-edits.md` (newest first), record the purged clips in `docs/PURGED_VOICE.md`.
7. Tell Tom which lines now wait for a recording. Until then an edited or added line is read by speech synthesis (`SE.edited` in `engine/script-edits.js`).

## Writing new lines

Read `claude/tom-line-edits.md` (and `docs/tom-edits.tsv`) first. Tom's rewrites are the humor guide: what he cuts, what he adds, how short he makes a line.
