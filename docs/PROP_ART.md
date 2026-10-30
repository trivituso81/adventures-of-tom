# Painted battle props

Every prop the Primary battle moves draw now exists as a painted image (202 props, 7 characters). Source sheets and the list of which cell is which prop: `tools/sprite-bake/src/props/` (README there). The cut images are `art/props/<character>/<slug>.webp` (transparent, trimmed, max side 160). Slugs come from `tools/sprite-bake/src/props/props.json` (character, number, slug, name, same order as the prompt lists).

## Re-cutting

`python3 tools/sprite-bake/bake_prop_sheets.py [--check]` rebuilds every image. It finds each prop from the ink (the AI sheets are not an exact grid), drops the corner numbers and halos, and `--check` writes one contact sheet per character to `tools/shots/props-<char>.png`. A new or redone sheet: save the PNG in `src/props/`, add it to `SHEETS` in the script (sheet file, character, cell to item number), re-run, look at the contact sheet.

## Using a painted prop in a move (hook, not a new system)

`engine/prop-art.js` defines `PROPART`. Inside any existing draw helper, paint first and fall through to the drawn version:

```js
if(PROPART.draw('amy/kettlebell',0,-5,{h:44})) { gfx.restore(); return; }
```

Options: `h` or `w` (stage units), `rot`, `flip`, `sx`, `sy`. It returns false until the image has loaded (images load on first request, plus a preload list at the bottom of the file), so the drawn pixel version is the fallback and nothing breaks if a file is missing. `PROPART.hits` counts draws; `python3 tools/kit_test.py <id> --only=<key>` prints `PAINTED_PROPS={...}` so you can prove a move really drew the painted prop.

## Wired so far (2026-10-30 trial, one move per character)

| Character | Move (key) | Prop | Hook |
|---|---|---|---|
| Tom | Noise-Canceling (noise_canceling) | headphones | `phones()` in tom-moves.js |
| Grace | Squishy Squeeze (squishy_squeeze) | gold dumpling squishy | `dumpling()` in grace-moves.js |
| Rose | Lamby Hug and every move that shows Lamby held or flying | Lamby, Backup Lamby | `plush()` in rose-moves.js (`o.drawn` forces the drawn one; Tom's hair is drawn onto it in battle2-kind.js) |
| Amy | Kettlebell Swing (kettlebell_swing) | kettlebell | `bell()` in amy-moves.js |
| Deedee | Corner Piece (corner_piece) | crisp pan | `bigPan()` and `crispDish()` in deedee-moves.js (the painted pan has its cut corner painted in, so the corner no longer regrows) |
| Boppy | Pepper Breath (pepper_breath) | cayenne pepper | `cayenne()` in boppy-moves.js (other pepper colours stay drawn) |
| TNB | Mug Toss (mug_toss) | stoneware mug (has a steam wisp and the 2ND tag) | `mug()` in tnb-moves.js |

Tom's Delta One family (Seat 1A, Boarding Group Zero, Delta One) and all Tombos, Director's Cuts and Family Finishes (see `tools/tombo_props_map.json`, test with `tools/tombo_test.py`) are also wired.

Every character's painted props are now wired except the leftovers listed in docs/CHANGES.md (2026-10-30, rest of the cast). Rose's 24 are all wired (Primary and Option 3 moves, Tombos, Family Finishes).

Also hooked but not drawn by a current Primary move (kept as harmless fallbacks): Tom's sourdough jar and boule, TNB's top hat, Grace's squishy in older throws.

## Next

Hook the rest one helper at a time (most moves draw props in their own local helper, so each is a small edit like the ones above). Remix moves have no animation code of their own yet. Note: Tom's retro console is close to a real console but has differences Tom is happy with (decided 2026-10-30).
