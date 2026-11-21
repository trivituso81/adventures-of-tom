# Director's Cut object sheets: spec (item 4, 2026-11-09)

Source of truth in the repo: `tools/art-library/tombo-split/dc-ff.js` (Family Finish DC rows, `objects:` lists) and `tools/art-library/tombo-split-prompts.js` (builds the entries, `objPrompt`). Prompt body: `tools/art-library/prompts/tombo-objects-sheet.txt`. Entry shape: `{id, tab:'Characters', group, title, ar:'4:3', refs:[STYLE], prompt}`, id `tombo-<ff>-dc-objects`.

## Status of the three Family Finish DC object sheets

| Finish | Entry id | Objects | Object names (reading order) | Status |
|---|---|---|---|---|
| Pottery Lesson (ff1 DC) | `tombo-ff1-dc-objects` | 7 | Wet clay lump, pottery wheel, low round stool, finished clay vase, collapsed clay pot, pink squishy, pink clay lump | Spec done. PILOT (see below) |
| Breakfast in Bed (ff2 DC) | `tombo-ff2-dc-objects` | 7 | Pancake stack, maple syrup bottle, empty syrup bottle, breakfast tray, frying pan, spatula, fork | Spec done. Waits for pilot |
| The Family Walk (ff3 DC) | none | 0 | none | Spec says no object sheet: the beat has no props. Nothing to generate |

Grace 3 DC (`grace3`): its object rows live in `dc-grace.js`, not checked in this pass. Check the rows there before writing its spec.

## Rules that apply to every object sheet

- Up to 12 objects per sheet (the template limit). The ff1 and ff2 DC sheets have 7 each.
- Cells are numbered in reading order, one object each.
- Ref image is the style key only (`docs/reference/style_key_v1.png`). No character refs on object sheets.
- Props only: no people, hands or faces. No text on objects (the Library's sheet prompt says so).
- Banned words in any prompt: left, right, 16-bit, 32-bit, SNES, Final Fantasy, pixel art, retro, sprite, hurt, KO, knocked, em dash, glow, spotlight, stage, star, ribbon, sign, scene.
- Painted look and frames as painted. Cut by cell after Tom approves the sheet (see `docs/PROP_ART.md`).

## Pilot

Pilot entry: `tombo-ff1-dc-objects` (7 objects, the most distinct shapes, no characters in it). One Generate press from Tom, then Tom approves or rejects. If he rejects, one wording change only; a second miss means stop and report (stop-loss).

Object sheets for ff2 DC wait until the pilot is approved.

## Open decisions (ours, not Tom's)

- ff3 DC gets no object sheet. Reason: its beat has no props. Change only if Tom asks.
