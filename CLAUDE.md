# CLAUDE.md: The Adventures of Tom

Read this first. It is the working agreement for Claude in this repo. Claude runs this repo end to end for Tom.

## What this is

A JRPG starring Tom's real family, with hand-painted realistic caricature characters (the "32-bit realistic" look; the old 16-bit pixel style is retired for characters), written as plain browser JavaScript (no framework, no bundler, no npm build).
Chapters 1 to 10 are built (the story bible plans 20 chapters in two Parts). It runs as a static site on GitHub Pages, played from an iPhone home-screen app.
Title: **The Adventures of Tom**. Home towns: Long Island and Los Angeles. (Older files and docs still say "Little Elsewhere"; that was the demo town name.)

## The person you are working for

Tom is a product director. He designs and directs; he does **not** code and does not want to read code.

- You do all the technical work. Never ask him to run a command, edit a file, or choose between implementation options.
- Make the call, say in one line which call you made. Ask a question only when a choice cannot be undone or is expensive to redo, and then ask one short question.
- He plays on an iPhone (portrait first) and reports what he sees. Report back in a few plain sentences. Dense tables beat prose. No flourish.
- Define any technical term you must use. Say whether you are stating a fact, recommending, or asking for a decision.
- No em dashes in anything you write for him or put in the game.

## How every reply to Tom is shaped (standing rule, Tom 2026-11-12 19:19)

Tom: "I would love for your first statement to me to be what you actually did... Explicitness is essential." Every reply that follows work has two parts, in this order:

1. **First line: what I did.** One plain statement of the action taken, in the past tense: "I installed...", "I implemented...", "I created a plan for...", "I tested... and it passed/failed". Say what was pushed (commit and tag) or that nothing was pushed. Say what was NOT done or not looked at.
2. **Right below it: what Tom must do next, as exact steps.** Name the place and the action: "Open Admin > Art Library, find the entry `tomride-night`, press Generate, then Approve", or "Paste this into the next conversation: <exact line>". If he has nothing to do, say "Nothing needed from you" and give the exact prompt that starts the next session. Never "let me know", never a list of options, never vague ("check it on your phone"): say which screen, which button, what he should see.

Then only what he needs to judge the work (decisions I made, one line each). The two-line handoff and next prompt at the end of a session stay as before.

## Hard rules

1. **Everything is a classic script in one shared global scope.** No ES modules, no import/export, no bundler. Files load in the order of the `<script>` tags in `index.html`. A new file must be added to `index.html` at the right point. See `docs/ARCHITECTURE.md` for the load order and what each group depends on.
2. **Keep the game runnable at every commit.** Run `python3 tools/smoke.py` before you finish. Look at the screenshots it writes to `tools/shots/`. A change you did not look at is not done.
3. **Phone first.** Portrait is the main layout; landscape is a toggle that rotates the whole stage. Keep both working. Controls: on-screen D-pad and A button, keyboard (arrows or WASD, Enter, M, L), any standard gamepad.
4. **Do not hand-edit generated or baked data.** `data/voice-clips.js` and `data/voice/*.js` hold the baked audio (full set, see `docs/VOICE.md`). Change them only when Tom sends a `voices.json` and asks for a merge, or to purge unused clips (see No unused voice).
5. **Changing a spoken line silences it.** Baked clips play only when the clip text exactly matches the line in `data/lines.js` or the dialogue text. If you reword a line, say so; it needs a re-bake. Prefer not to reword spoken lines unless asked.
6. **Canon is in `docs/CANON.md`.** Characters, voice and tone, and what is decided. Read it before writing any dialogue, move or scene.
7. **Reuse the battle animation primitives** before inventing new systems (`docs/BATTLE_SYSTEM.md`).
8. **This repo is the live app.** Tom plays https://trivituso81.github.io/adventures-of-tom/ from his iPhone home screen (decided 2026-10-27: "the actual app is on GitHub"). Every finished change goes to `main` (which updates GitHub Pages). The claude.ai artifact is only a scratch copy for building and testing; it means nothing to Tom, so never tell him something is "live" because it is on the artifact. Read `docs/WORKFLOW.md` for the exact routine.

## Images only in the Art Library (standing rule, 2026-11-03)

Tom (11-02, and again 11-03 14:49 with "ALWAYS"): he creates images only in the Art Library (he presses Generate, then Approve or Reject). Never plan on, suggest or write prompts for him to run in any outside image AI, not even as a fallback after repeated misses. When the Library keeps missing, the options are a different Library method (a reference picture, a different entry shape) or an input he supplies into the Library. Older notes that mention his outside AI are history.

## Purge replaced files completely (standing rule, Tom 2026-11-05)

Tom (11-05 18:40): "remember from now on to purge old files completely after replacing them." When a new picture, sheet, sound, script or data file replaces an old one, remove everything the old one left behind in the same change: the old files, the code that drew or loaded the old thing (fallbacks, wrappers, helper functions, constants), stale comments, tag or cache entries, and Project or doc notes that describe it. Then grep for the old names and ids and confirm zero references. Git history keeps the old copy, so deleting is safe. Do not keep an old version "as a fallback" unless Tom asks. Frozen `demo/` is the one exception (never edited). Approved sources in `art/raw/` stay: the Art Library reads them.

## Head sizes (Tom, 2026-11-05: the no head resizing rule of 2026-11-03 is LIFTED)

Tom (11-05): "Let's undo the no head resizing rule." `docs/CHARACTER_PIPELINE.md` section 7 (heads, heights, widths by age) is in force again, including the head row and the head tools (`kidhead.py` `grow_head`, `headwarp.py`). Head share is top of hair to chin over full height: about .21 to .22 for adults, about .25 for Grace and the style key's kids (Rose follows her ratio to Grace), and the older baked kid art uses .373 walking and .43 battle until a character is regenerated. Still true: a head row is shown to Tom before and after, the body keeps its size, and nothing is re-baked unless Tom asks for that character in that conversation (lifting the rule changed no art).

## One head multiplier across all states (standing rule, Tom 2026-11-12)

Tom (11-12 08:37): "i just want the head sizes to be amplified with the same multiplier across all states." The HEAD SIZES factor (`tools/sprite-bake/head_tweak.json`) applies to the walk, the talk face, the 8 mood poses and the mood faces. After any `head_adjust.py apply` or `apply-requests`, also run `emotion_frames.py <ids>`, `bake_emotion_faces.py <ids>`, `bake_story_poses.py` (about 11 minutes, run in the background), `bake_talk_faces.py <ids>`, bump `EMO_V` and `TALK_V`. Mechanism and the `hg` field: docs/CHANGES.md "headmood1". In the mood frames the head grows about each frame's own measured chin row (`tools/sprite-bake/emotion_chin.py`, `emotion_chin.json`, docs/CHANGES.md "headchin1"); after a rebake look at `CHECK=/tmp/chin.png python3 tools/sprite-bake/emotion_chin.py <ids>` and correct a wrong line with `FIX`.

## Real heights (standing rule, Tom 2026-11-11)

Tom (11-11 12:23): "main character height should always be a factor of the head size set in the head sizes function, and their hardcoded heights using a character like Tom as a baseline." A real height is typed in ONE place, `data/heights.json`. Tom is the baseline (42 rows, 5'11); everyone's standing walk figure is drawn at 42 x inches / 71 at any head size. Adults' heads are Tom's head times their own HEAD SIZES factor, so changing Tom's head moves all adults. The game's draw scales are generated (`python3 tools/sprite-bake/heights.py write` into `data/walk-scale.js`); never type a `set.k` or `OW.<id>.k` for a main character. `python3 tools/heights_test.py` must pass (smoke runs it). Details and the change recipe: `docs/CHARACTER_PIPELINE.md` section 7, "Real heights in the overworld".

## Tom's painted frames are used as painted (standing rule, 2026-11-05)

Tom (11-05 08:13): "Remember these rules going forward because in the next build instructions I will provide Grace's new walking and standing frames." When Tom supplies painted walking or standing frames for a character, the bake uses them exactly as painted: no head or body resizing, no flipping or substituting a frame, his own standing paintings are the stand frames, and his painted second steps are used. A frame that cannot be used as painted (a repeated cell, a wrong direction) is named to Tom in plain words, with the reason, before or when it is changed. This overrides the head share targets in `docs/CHARACTER_PIPELINE.md` section 7 for any frame Tom painted or supplied. Before changing any bake, rebake once with no change and confirm it reproduces the repo files byte for byte. Show Tom the frames (stand next to steps, and a head row) before pushing. Tom's walk is the model: `tools/sprite-bake/bake_tom_walk_v4.py`, CHANGES 183.

## Dialogue faces never use hero paintings (standing rule, Tom 2026-11-11)

Tom (11-11 06:47): hero paintings appear only in the main menus (status screen) and battle menus (Tombos, turn order). Dialogue always uses the character's emotion sheet (mood lines, `portraits/emo/`, `bake_emotion_faces.py`) or walking sheet (no-mood lines, `portraits/talk/`, `bake_talk_faces.py`), cropped and centred to the dialogue box. A new speaker gets a talk face in the same change (add the id, rebake, look at the contact sheet). Never point a dialogue portrait at a hero crop.

## Monster dialogue portraits (standing rule, Tom 2026-11-06)

Every monster that speaks in a dialogue box gets a portrait: a zoomed-in crop of its face, taken from the stance frame of its painted enemy sheet. Monsters that never speak need none. The list of speakers is `docs/MONSTER_PORTRAITS.md`; the baker is `tools/sprite-bake/bake_foe_portraits.py` (add the id to `SPEAKERS`, and to the `foe_` key list in `engine/menu.js` and the speaker name in `DIALOG_PORTRAIT_IDS` in `engine/overworld.js`). When you write a new line for a monster, or install a new monster sheet for a speaker, add its portrait in the same change and look at the contact sheet before pushing. People who are villains (Vance, Marlowe) are not monsters: they need a painted face of their own, not a boss crop.

## Enemy sprite sheets (standing rule, 2026-10-29)

Tom may drop a PNG enemy sprite sheet into any conversation, often with no words. That means "install this enemy". Follow `docs/ENEMY_SHEETS.md`: identify the enemy id, bake the sheet (tools/sprite-bake), wire the painted frames, test a fight against it, push, and log it in that doc's table.

## Room paintings (standing rule, 2026-10-30)

Tom is redoing every interior as one square painting per room that fills the iPhone screen in portrait and landscape. He may drop a zip of these paintings into any conversation, often with no words. That means "install these rooms". Follow `docs/ROOM_PAINTINGS.md`: check each image against the art requirements (square, full bleed, no people or text), convert to `art/<id>.webp`, update PLATES, grid size, walk maps, doors, residents and props, test portrait and landscape with screenshots, push to `main`, and tell Tom which rooms are live and which need a redo. Never ask him to unpack or resize anything.

## Long Island area paintings (standing rule, 2026-10-30)

Tom is redoing every Long Island outdoor area (Square, Rivituso Row, Grump Hollow, Cattail Pier, Whispering Marsh, Sundial Hollow, the school yard) one at a time. **Do not install them one by one.** When all are finished he will upload the pictures (a zip or a batch, often with no words). That means "install these areas". Follow `docs/AREA_PAINTINGS.md`: identify each picture, scale to the plate size, check every painted word letter by letter, check no sign overlaps a door, re-derive each walk mask (`python3 tools/mask_overlay.py <id>`), close dead-end paths, fix exits, objects and scene coordinates, restore the Square's large fountain if the new painting reverted it, test portrait and landscape with screenshots, push to `main`, and tell Tom which areas are live and which need a redo. The generator paints the sign lettering; the game does not draw words on boards any more. Never ask him to unpack or resize anything.

## Justin's ability sheets (standing rule, 2026-10-31)

Justin (Amy's husband) is becoming a party member. Tom will drop a zip of his painted battle and ability animation sheets into a conversation, often with no words. That means "install Justin with his kit". Follow `docs/JUSTIN_ABILITIES.md`: it holds the approved kit (moves, MP, lines, special), the frame keys for every sheet, and the install steps (bake, party data, `engine/justin-moves.js`, recruiting at GREGORI, tests, push). Never ask him to unpack, rename or resize anything.

## New characters and ability pose sheets (standing rule, 2026-10-31)

When Tom gives photos of a new character, or asks for poses for an ability, do not ask him to describe the image prompt requirements and never make him rewrite them. **Real height in feet and inches is required before anything else; ask if it is missing.** Show Tom a head row so he can judge face sizes against the cast, and match the head to its age target (see Head sizes above). Follow `docs/CHARACTER_PIPELINE.md`: write the character spec from the photo, then the three standard prompts (ONE large full-body hero pose, a 3 x 3 walking sheet, a 4 x 4 standard battle sheet), and for any ability a sheet of **4 to 7 poses only** (keep the critical frames, no walking in or out, no prep or aftermath filler, about 2 spoken lines, painted props only when held, effects left to the game). Send the prompts as files, hero pose first. When the sheets come back, install them per section 6 of that doc.

## No unused voice (standing rule, 2026-11-01)

Tom has asked repeatedly: voice lines and clips the full game never plays must not exist in this repo. Every line in `data/lines.js` and every baked clip shows up in the Voice Library and bake lists and can cost him ElevenLabs credits. So:

- Never add a line that nothing plays. Every new line is wired to a move, scene or dialogue in the same change. If an animation drops a line, delete the line in the same change.
- Before every push that touches `data/lines.js`, a move animation, a scene or any voice file, run `python3 tools/clip-audit/unused_voice.py`. It must report 0 for all four checks. Fix anything it finds (`node tools/clip-audit/purge_unused.js <spec> --apply`, remove the lines from `data/lines.js`, rebuild the index with `python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js`, bump `?v=`).
- Record what you removed in `docs/PURGED_VOICE.md` and `docs/CHANGES.md`. Git history keeps the audio, so deleting is safe. This is the one exception to hard rule 4: purging unused clips does not need a `voices.json`.
- Lines that are live but have no clip yet are not dead. They are the bake list.

## ElevenLabs voice limit (standing fact, 2026-11-02)

Tom's ElevenLabs account is **maxed out at 30 custom voices** (voices added from the library count too, and every Voice Design save takes one). Never plan a new or recast voice without a slot plan: delete the voice it replaces first, or ask Tom which unused voice to delete. For Deedee use `recast-deedee.html` (built by `node tools/voice-recast/build-deedee.js`); it deletes the old voice for him and shows the new voice id. When Tom sends the id, set the new id in the Deedee override in `tools/voice-library/make-index.js` (never in the baked `data/voice-clips.js`), rebuild the Voice Library index, and note it in `docs/CHANGES.md`. Other recast bakers in `tools/voice-recast/` follow the same delete-old-voice rule.

## Load time (standing rule, 2026-11-02)

Fact: the title screen waits for 51.5 MB of blocking scripts (306 `<script>` tags), 37 MB of which is voice audio stored as base64 text in `data/voice/*.js` and ~10 MB baked sprite data; after the title, the chapter voice files (`data/voice/dialog-ch*.js`, about 94 MB, mostly untagged) and the art load on demand, about 230 MB in all. Before `sw1` there was no service worker, so an iPhone home-screen app re-downloaded it all whenever Safari dropped its cache. Tom (11-02 10:20) decided:

- **DONE in `sw1` (2026-11-02): service worker `sw.js` at the repo root, registered at the end of `index.html`.** `?v=` files are cache-first; `index.html` always comes from the network; files with no tag (184 scripts, the chapter voice files, music) are used from the saved copy only after the server answers 304 to If-None-Match or If-Modified-Since; `cache:'reload'` (the RELOAD button) goes to the network and refreshes the copy. CORRECTION to the plan: not every file carried a `?v=` tag (184 scripts and the chapter voice files had none), which is why the untagged path asks the server instead of trusting the cache. `tools/tag_check.py` (run by `tools/smoke.py`) fails when a modified file's tag, or the folder constant that tags it (`ART_V`, `BG_V`, prop `V`, flight `v`), did not move since `origin/main`; `tools/sw_test.py` tests the worker (second load: 0 tagged files reach the server, untagged ones get 304, a bumped tag downloads, offline start works). Details: docs/WORKFLOW.md "Cache tags and the service worker". Last resort for a stale phone: change `SW_VER` in `sw.js`.
- **DONE in `mem1` (2026-11-03, Tom approved): memory for long sessions.** Battle and enemy painted sheets load on demand and are released when unused (`paintedTick` in `engine/painted.js`; overworld sheets still load at boot). Decoded voice clips are capped (`lruSet` in `engine/speech.js`). A new painted atlas whose id starts with a cast prefix (PAINTED_CAST) or `foe_` is lazy automatically; give a new cast member's prefix to PAINTED_CAST. Details: docs/CHANGES.md (118).
- **POST-BUILD ONLY. Do not start these until Tom asks for them by name**, however slow loading looks: (1) voice clips as real `.mp3` files fetched on demand instead of base64 in JS, (2) a loading bar on the title screen, (3) sprite data loaded per party member and per area instead of at boot. Mention them at most once per session if loading comes up, then leave them alone.

## Build label and build history (standing rule, Tom 2026-11-14)

Tom (11-14 08:53) tells builds apart by the build label: a chip at the top left of the welcome screen and a Build box in the menu, each showing the build name and the time it was made. Tapping either opens BUILD HISTORY (`engine/build-history.js`), one day at a time, today first. Every push gets its own build name and its own entry: write the build's heading in `docs/CHANGES.md` first (`## <tag> (<date>): <one plain line>`, it becomes the line Tom reads), then run `python3 tools/art-library/bump_tags.py <TAG> --base origin/main`, which sets the stamp and calls `tools/build_history.py add <TAG>` (time now). Never reuse a build name and never push without a new one. Never hand-edit `data/build-history.js`; on a rebase conflict take upstream and run `python3 tools/build_history.py add <TAG>` again. Smoke fails when the stamp's build is not the newest entry. Test: `python3 tools/buildlog_test.py`.

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
| Music tracks, their prompts, makes and merges | `tools/music-library/tracks.json` (prompts), `music.html` (ADMIN > MUSIC LIBRARY), `docs/MUSIC_LIBRARY.md`, `engine/music-clips.js` (what plays where) |
| How big a map painting must be, how outdoor maps zoom to fill the phone screen | `docs/MAP_SIZES.md` |

## Debug handle

`window.__LE` exposes the engine to tests and to you in the browser console (`__LE.b2Start`, `__LE.B2`, `__LE.go(mapId)`, `__LE.setFlag`, `__LE.chapterJump`). Extend it in `engine/main.js` or at the end of the file that owns the thing.
