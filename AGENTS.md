# AGENTS.md: The Adventures of Tom

Read this first. It is the working agreement for any AI agent (Cursor or otherwise) in this repo.

## What this is

A 16-bit JRPG starring Tom's real family, written as plain browser JavaScript (no framework, no bundler, no npm build).
Chapters 1 to 10 are built (the story bible plans 20 chapters in two Parts). It runs as a static site, played on an iPhone home-screen shortcut.
Title: **The Adventures of Tom**. Home towns: Long Island and Los Angeles. (Older files and docs still say "Little Elsewhere"; that was the demo town name.)

## The person you are working for

Tom is a product director. He designs and directs; he does **not** code and does not want to read code.

- You do all the technical work. Never ask him to run a command, edit a file, or choose between implementation options.
- Make the call, say in one line which call you made. Ask a question only when a choice cannot be undone or is expensive to redo, and then ask one short question.
- He plays on an iPhone (portrait first) and reports what he sees. Report back in a few plain sentences. Dense tables beat prose. No flourish.
- Define any technical term you must use. Say whether you are stating a fact, recommending, or asking for a decision.
- No em dashes in anything you write for him or put in the game.

## Hard rules

1. **Everything is a classic script in one shared global scope.** No ES modules, no import/export, no bundler. Files load in the order of the `<script>` tags in `index.html`. A new file must be added to `index.html` at the right point. See `docs/ARCHITECTURE.md` for the load order and what each group depends on.
2. **Keep the game runnable at every commit.** Run `python3 tools/smoke.py` before you finish. Look at the screenshots it writes to `tools/shots/`. A change you did not look at is not done.
3. **Phone first.** Portrait is the main layout; landscape is a toggle that rotates the whole stage. Keep both working. Controls: on-screen D-pad and A button, keyboard (arrows or WASD, Enter, M, L), any standard gamepad.
4. **Do not hand-edit generated or baked data.** `data/voice-clips.js` and `data/voice/*.js` hold baked audio (an older partial snapshot in this repo, see `docs/VOICE.md`). Never modify them unless Tom sends a `voices.json` and asks for a merge.
5. **Changing a spoken line silences it.** Baked clips play only when the clip text exactly matches the line in `data/lines.js` or the dialogue text. If you reword a line, say so; it needs a re-bake. Prefer not to reword spoken lines unless asked.
6. **Canon is in `docs/CANON.md`.** Characters, voice and tone, and what is decided. Read it before writing any dialogue, move or scene.
7. **Reuse the battle animation primitives** before inventing new systems (`docs/BATTLE_SYSTEM.md`).
8. **The live game is a Claude artifact; this repo is a working copy.** Read `docs/WORKFLOW.md` before you change anything that Tom will expect to see on his phone.

## How to work

1. Read only the files the task needs. The repo is large (`engine/battle2-kind.js` alone is 400 KB). Use search to find the section; do not open whole files.
2. Make the change.
3. `python3 tools/smoke.py` (default characters), or `IDS=grace,rose python3 tools/smoke.py` for a specific character. For a move you touched: `python3 tools/kit_test.py <id> --only=<move_key> --speed2` and look at the contact sheet in `tools/shots/`.
4. Check portrait and landscape (smoke does both) for anything visual.
5. Summarise in a few sentences what changed and what Tom should look for on his phone.

## Setup (once per environment)

```
pip install playwright pillow
python3 -m playwright install chromium
python3 tools/serve.py        # http://localhost:8000/index.html
```

The game must be served over http. Opening `index.html` as a file will not work.

## Where things live

| Want to change | Look in |
|---|---|
| A cutscene or story beat | `data/scenes.js` (steps documented at `SCENE_OPS` in `engine/story.js`) |
| A map, building, room, NPC, NPC dialogue | `data/maps-le.js` (Long Island), `data/maps-la.js` (Los Angeles) |
| A monster (stats, lines, sprite) | `data/*-monsters.js` (one file per area), numbers in `data/battle2-data.js` |
| A character's attack animation | `engine/<name>-moves.js` (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB), `engine/nara.js` |
| A Tombo or Family Finish or Director's Cut (two-character combo) | `data/battle2-data.js` (numbers), `engine/battle2-kind.js` (animation) |
| Spoken battle lines | `data/lines.js` |
| Spoken dialogue speakers and voices | `data/dialog-cast.js` |
| Difficulty modes | `B7_DIFF` in `engine/feel.js` |
| Stats, items, party members | `data/party.js`, `data/abilities.js`, `data/progress.js` |
| Menus | `engine/menu.js`, `engine/progress.js`, `engine/shop.js` |

## Debug handle

`window.__LE` exposes the engine to tests and to you in the browser console (`__LE.b2Start`, `__LE.B2`, `__LE.go(mapId)`, `__LE.setFlag`, `__LE.chapterJump`). Extend it in `engine/main.js` or at the end of the file that owns the thing.
