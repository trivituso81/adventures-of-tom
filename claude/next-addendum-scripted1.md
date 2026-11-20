# scripted1 (2026-11-14, main e828028): Script Editor built, all six steps. scripted2 (main fc25073): Play works for every scene

Repo doc: docs/SCRIPT_EDITOR.md. Plan: claude/script-editor-plan.md.

## Tom's test (exact)
1. Title screen > ADMIN > SCRIPT EDITOR. Chapter 2 > ch2Starter.
2. Tap a line, reword it, Done. Try up, down, remove, Undo. Open More: mood and talking pose, + Reaction (tap the word for the cue), pauses, + line, + silent beat.
3. Tap Play: the real scene plays with the edits; BACK TO SCRIPT EDITOR returns. Reworded or added lines are read by speech synthesis until recorded.
4. Copy (scene, chapter, whole game, Select), Send to Claude (n). Then in chat: "Apply my script edits".

## scripted2 (2026-11-14): Play recipes for the 52 scenes that had none
- `docs/script-recipes.json` now holds a map (plus flags, unflag, `lose`) for all 52. The index shows 0 scenes with "no working Play recipe yet".
- Recipe key `lose:true` (engine/script-edits.js): Play does not win the fight, so the try-again lines play. Used by ch17Fight, ch19Fight, ch20Fight1, ch20Fight2. Every other fight is still won at once.
- Test: `python3 tools/script_play_test.py /tmp/sp [ids]` (about 8 min for all 52, run with nohup): plays each scene like PLAY and checks its first listed line; FAILS: [] for all 52 on main fc25073. Maps were chosen from where the game starts each scene; Tom has not looked at them on his phone.
- A new scene started from code (not a map trigger) needs an entry in docs/script-recipes.json, then `build.py` and the play test.

## Known gaps
- 62 scenes have no stage picture (no spoken dialogue on a reachable frame): the picture hides itself.
- apply.py rewrites only plain {talk:'X',lines:[...]} steps; others are listed MANUAL and stay in data/script-edits.json.
- build.js in the plan is walk.js (in page) plus build.py (driver).
- emotion-apply.py is blocked by queued ch7 rows: apply.py patches data/emotion-moods.js in place. `talk-index.py --add` is NOT run by apply.py (it adds 465 rows of pre-existing drift): new talk rows are added by apply.py itself.
- Apply was round-tripped on a sample edit and reverted; a first real "Apply my script edits" should look at the diff carefully.

## Rule for later builds
Run `python3 tools/script-index/build.py` and commit data/script-index.json whenever a scene changes (also stage.py <id> for a new scene).
