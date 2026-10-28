# Architecture

Static site. `index.html` holds the markup, all CSS (portrait and landscape layouts) and the `<script>` tags. Everything else is a classic script. There is no build step; edit a file, reload.

## Rules of the shared global scope

- Every file starts with `'use strict';` and declares top-level `const`/`function` that every later file can see.
- Load order is the order of the `<script>` tags in `index.html`. A file can only use things defined in files above it at load time. Code that runs later (in event handlers, frame loops) can use anything.
- Some files **wrap** earlier functions (for example `engine/dialog-voice.js` wraps `say`, `advanceDialog`). Wrappers must load after the thing they wrap. Do not reorder tags without checking for wrappers.
- Some files add to `window.__LE` (the debug handle) inside a `DOMContentLoaded` listener.
- Name clashes are silent. Before adding a top-level name, search the repo for it. Prefer a file-local IIFE `(function(){ ... })();` for new code, which is how all the move files and set pieces are built.

## Load order (index.html), grouped

| Group | Files | Notes |
|---|---|---|
| Monsters (data) | `data/monsters.js`, then one file per area: `la`, `marsh`, `backlot`, `school`, `oak`, `library`, `barn`, `club`, `terminal` | Each adds to the `MONSTERS` object and defines `*_MONSTER_SPOTS`. Later files reuse `padSprite` from `backlot-monsters.js`. |
| World | `data/maps-le.js`, `engine/world.js`, `data/party.js`, `data/maps-la.js`, `engine/la.js` | Maps as content, then map builders and dialogue state. |
| Menus and party | `engine/menu.js`, `engine/followers.js`, `engine/shop.js` | Pause menu, followers trailing Tom, recruiting, save/load, Penny's Pockets shop. |
| Audio and voice | `engine/audio.js`, `data/lines.js`, `data/voice-clips.js`, `data/voice/*.js`, `engine/speech.js` | Synth sfx, spoken battle lines, baked clips (stubs here), clip player. |
| Battle runtime and art | `engine/battle-state.js`, `data/battle-sprites.js`, `data/ko-sprites.js`, `engine/battle.js`, `engine/battle-draw.js`, `engine/recruit-fx.js`, `engine/stage.js` | Shared per-frame timers, drawing, props and scene effects, the `ST` choreography helpers. |
| Move animations | `engine/recruit-moves.js`, `tom-moves`, `grace-moves`, `rose-moves`, `tnb-moves`, `deedee-moves`, `boppy-moves`, `amy-moves` | Each file is a set of IIFEs, newest last. The latest assignment to a move key wins. |
| Battle system 2 (the live one) | `data/battle2-data.js`, `data/progress.js`, `data/abilities.js`, `engine/battle2.js`, `battle2-ui.js`, `battle2-moves.js`, `battle2-kind.js`, `battle2-traits.js`, `data/rose-ride.js`, `engine/rose-ride.js`, `engine/battle2-effects.js`, `engine/progress.js`, `engine/feel.js` | See `BATTLE_SYSTEM.md`. |
| Overworld | `engine/overworld.js`, `data/font.js`, `data/overworld-sprites.js`, `engine/tiles.js`, `data/villagers.js`, `data/recruit-rig.js`, `data/recruit-sprites.js`, `data/npc-sprites.js`, `engine/gear.js`, `data/tnb-battle.js`, `data/recruit-stances.js`, `data/nara.js` | Dialogue box, movement, camera, all the sprite data. |
| Renderers | `engine/town-render.js`, `la-render`, `marsh-render`, `backlot-render`, `school-render`, `oak-render`, `library-render`, `barn-render`, `club-render`, `terminal-render`, `infinity-render`, then `engine/draw.js` | One renderer per area look, then the main draw and input. |
| Story and flow | `engine/intro.js`, `travel.js`, `nara.js`, `story.js`, `bench.js`, `data/scenes.js`, `data/scenes-p2.js`, `data/scenes-ch12.js`, `engine/ch12-render.js`, `engine/splash.js`, `cloud-save.js`, `skip.js`, `chapter-select.js`, `data/dialog-cast.js`, `engine/dialog-voice.js`, `engine/main.js`, `engine/music.js`, `data/songs.js` | Title, flights between towns, the story engine, scenes, startup. |

## Content model

- **Two towns:** Long Island (`data/maps-le.js`) and Los Angeles (`data/maps-la.js`), reached by plane (`engine/travel.js`). Each chapter also adds sub-areas (marsh, backlot, school, park, library stacks, car barn, moon club, terminal) with their own renderer and monster file.
- **Story engine (`engine/story.js`):** `STORY` holds mode, chapter and flags. `CHAPTERS` has one entry per chapter with party rules (`lock`, `force`, `bar`, `allow`, `decline`). A cutscene is a list of plain steps defined in `data/scenes.js` and compiled by `playScene`. The vocabulary of steps is `SCENE_OPS`. Prefer extending data in `scenes.js` over writing new engine code.
- **Chapters built:** 1 The Soup Dumpling Protocol, 2 Smog on 2nd Avenue, 3 Paces and Peppers, 4 Backlot Bedlam, 5 Parent-Teacher Conference of Doom, 6 The Great Squirrel Conspiracy, 7 The Whispering Stacks, 8 Feast on Jefferson Park, 9 The Moon Club Invitation, 10 Boarding Group Zero. Chapters 11 to 20 are planned, not built. Chapter 0 is the frozen demo (also kept under `demo/` in the live artifact; not included here).
- **Party rules** are per chapter, not hardcoded in towns. Check `CHAPTERS` before changing who can join.
- **Sprites** are text pixel-rows with a palette (strings of single characters mapped to colors). Overworld sheets: `data/overworld-sprites.js`, `data/npc-sprites.js`. Battle poses: `data/battle-sprites.js`, `data/recruit-rig.js` (builds Amy, Deedee, Boppy, TNB with an IK limb rig), `data/tnb-battle.js`, `data/nara.js`.
- **Font:** a 3x5 pixel font in `data/font.js`. It has no lowercase, no slash, no curly apostrophe (use a straight `'`). It does have `. , : ? ! - + & ' %`. Check before putting a new character in on-screen text.

## Saves and storage

- Three slots plus autosave (every door and after every battle), key prefix `aot-save-` in `localStorage`. A continue prompt appears at startup. Settings keys: `aot-speed`, `aot-hf`, `aot-diff`, `aot-autospend`, `le-sound`, `le-music`, `le-layout`.
- `engine/cloud-save.js` also mirrors saves to the Claude artifact's private per-player store. **Outside claude.ai that store does not exist**, the file detects that and the game uses `localStorage` only. That is fine for local and GitHub Pages hosting. On a standalone host Safari does not wipe storage the way it can inside the artifact frame.
- Save format is versioned (`migrateSave` in `engine/story.js`). Never change the shape of saved state without a migration.

## Things hardcoded to the claude.ai artifact (leave alone unless Tom asks)

- `index.html`: the `#preview-note` fallback link points at the artifact URL.
- `engine/cloud-save.js`: the artifact `db` capability (see above).

## Hosting

Static files only. GitHub Pages from the repo root works. Tom keeps a Pages copy at `trivituso81/adventures-of-tom`. Needs `index.html` at the root and all paths relative (they are).
