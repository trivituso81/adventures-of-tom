# Portrait Crop Tool: build spec (Tom 2026-11-06 07:51)

Tom's ask: for every main playable character, pick the character, then zoom and pan their hero image inside the portrait frame, save the crop, and get it back to Claude as data points (no image needed).

## Scope
- Characters: Tom, TNB, Grace, Rose, Amy, Deedee, Boppy, Nara (the eight party members). Not Justin, Olivia, Jojo, Michael, Ellie.
- Tool only changes which part of the hero image the portrait shows. No new art, no Generate presses.

## Facts to verify first (from claude/next.md; check in the repo before building)
- Portraits are cut by `tools/sprite-bake/bake_portraits.py` from each character's hero reference (`art/raw/characters/<id>-hero-ref-v1.png`) using a hard-coded rectangle `FACE[<id>]` = x, y, w, h in hero-image pixels (Tom's is 455, 589, 286, 467). Nara uses a `NARA` square.
- Mood faces for dialogue (`tools/sprite-bake/bake_emotion_faces.py`, 88 files in portraits/emo/) are zoomed from the portrait. Find out whether they derive from `FACE` or from the baked portrait, and make them follow the new crop.
- Party cards, the dialogue box and the menu use the baked portrait: find every place that has its own aspect ratio or round mask, so the tool can show what each one will see.

## Build
| Part | Decision |
|---|---|
| Where | New admin page `portraits.html`, same look and linking as areas.html and voices.html (ADMIN). Phone first, portrait and landscape. |
| Controls | Character chips across the top. One frame at the exact portrait aspect, hero image behind it. Drag to pan, pinch or wheel or slider to zoom, double-tap to reset. Aspect is locked and the crop cannot leave the image. |
| Preview | Under the frame, the same crop at the real in-game sizes: dialogue box portrait and party card (with its mask), so Tom judges the crop as the game shows it. |
| Heads | Offer a "head row" view: all eight current crops side by side at one size, so adult faces can be compared (canon rule: all adult faces the same size; children follow Grace and Rose). |
| Data | `data/portrait-crops.json`: `{ "<id>": {"x":n,"y":n,"w":n,"h":n} }` in hero-image pixels, the same rectangle format as `FACE`. Only characters Tom saved have an entry. |
| Save | SAVE writes the character's entry through the same GitHub commit path art.html uses for Library approvals (rebase-aware, never overwrite another character's entry). If that path is unavailable: EXPORT button copies the whole JSON to the clipboard and downloads it, and Tom pastes it to Claude. Either way what comes back is just the numbers. |
| Bake | `bake_portraits.py` reads the json first and falls back to `FACE` for any character with no entry. Rebake portraits, rebake mood faces from the same crop, bump the portrait and emotion tags (`bump_tags.py`), CHANGES entry. |
| Purge | After the json holds all eight, remove the old hard-coded `FACE`/`NARA` numbers and any code path they fed (standing purge rule). |

## Tests
- Tool: `node --check`; load the page, switch all eight characters, pan and zoom at both orientations, save, reload, crop persists; screenshots at 393x852 and 852x393.
- Bake: a character with no json entry bakes byte-identical to now (compare decoded pixels). A character with an entry matches the saved rectangle.
- Game: look at the dialogue portrait and party card for all eight, portrait and landscape; `python3 tools/smoke.py` FAILS: [], unused_voice 0.

## Rules
- Make the calls; ask Tom nothing unless a choice is irreversible. No em dashes in anything he reads. Final line to Tom: where the page is and what to do ("open Portraits, pick each character, Save").
