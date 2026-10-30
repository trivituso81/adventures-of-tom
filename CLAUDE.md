# CLAUDE.md: The Adventures of Tom

Read this first. It is the working agreement for Claude in this repo. Claude runs this repo end to end for Tom.

## What this is

A 16-bit JRPG starring Tom's real family, written as plain browser JavaScript (no framework, no bundler, no npm build).
Chapters 1 to 10 are built (the story bible plans 20 chapters in two Parts). It runs as a static site on GitHub Pages, played from an iPhone home-screen app.
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
4. **Do not hand-edit generated or baked data.** `data/voice-clips.js` and `data/voice/*.js` hold the baked audio (full set, see `docs/VOICE.md`). Change them only when Tom sends a `voices.json` and asks for a merge.
5. **Changing a spoken line silences it.** Baked clips play only when the clip text exactly matches the line in `data/lines.js` or the dialogue text. If you reword a line, say so; it needs a re-bake. Prefer not to reword spoken lines unless asked.
6. **Canon is in `docs/CANON.md`.** Characters, voice and tone, and what is decided. Read it before writing any dialogue, move or scene.
7. **Reuse the battle animation primitives** before inventing new systems (`docs/BATTLE_SYSTEM.md`).
8. **This repo is the live app.** Tom plays https://trivituso81.github.io/adventures-of-tom/ from his iPhone home screen (decided 2026-10-27: "the actual app is on GitHub"). Every finished change goes to `main` (which updates GitHub Pages). The claude.ai artifact is only a scratch copy for building and testing; it means nothing to Tom, so never tell him something is "live" because it is on the artifact. Read `docs/WORKFLOW.md` for the exact routine.

## Enemy sprite sheets (standing rule, 2026-10-29)

Tom may drop a PNG enemy sprite sheet into any conversation, often with no words. That means "install this enemy". Follow `docs/ENEMY_SHEETS.md`: identify the enemy id, bake the sheet (tools/sprite-bake), wire the painted frames, test a fight against it, push, and log it in that doc's table.

## Room paintings (standing rule, 2026-10-30)

Tom is redoing every interior as one square painting per room that fills the iPhone screen in portrait and landscape. He may drop a zip of these paintings into any conversation, often with no words. That means "install these rooms". Follow `docs/ROOM_PAINTINGS.md`: check each image against the art requirements (square, full bleed, no people or text), convert to `art/<id>.webp`, update PLATES, grid size, walk maps, doors, residents and props, test portrait and landscape with screenshots, push to `main`, and tell Tom which rooms are live and which need a redo. Never ask him to unpack or resize anything.

## Long Island area paintings (standing rule, 2026-10-30)

Tom is redoing every Long Island outdoor area (Square, Rivituso Row, Grump Hollow, Cattail Pier, Whispering Marsh, Sundial Hollow, the school yard) one at a time. **Do not install them one by one.** When all are finished he will upload the pictures (a zip or a batch, often with no words). That means "install these areas". Follow `docs/AREA_PAINTINGS.md`: identify each picture, scale to the plate size, check every painted word letter by letter, check no sign overlaps a door, re-derive each walk mask (`python3 tools/mask_overlay.py <id>`), close dead-end paths, fix exits, objects and scene coordinates, restore the Square's large fountain if the new painting reverted it, test portrait and landscape with screenshots, push to `main`, and tell Tom which areas are live and which need a redo. The generator paints the sign lettering; the game does not draw words on boards any more. Never ask him to unpack or resize anything.

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
| How big a map painting must be, how outdoor maps zoom to fill the phone screen | `docs/MAP_SIZES.md` |

## Debug handle

`window.__LE` exposes the engine to tests and to you in the browser console (`__LE.b2Start`, `__LE.B2`, `__LE.go(mapId)`, `__LE.setFlag`, `__LE.chapterJump`). Extend it in `engine/main.js` or at the end of the file that owns the thing.
