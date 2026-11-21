# Walking heads (current: `walkhead4`, CHANGES 346, pushed 2026-11-06). REPLACES the walkhead1 to 3 HEAD_FIX notes; ignore the old method text in next.md.

## What Tom wants (07:16 and 07:26)
Tom is the model. Every ADULT's face height (top of hair, cap or spike to chin) equals Tom's, scaled uniformly (width follows height). Faces exactly the same height, head may include hair. Grace and Rose keep walkhead3 (+15 percent).

## Method (fact)
- `tools/sprite-bake/walk_sheet_frames.py`: `TOM_HEAD_ROWS` = 104*42/391 = 11.17 on-screen rows. `WALK_MATCH[id] = (chin_px, total_rows, engine_k)` for tnb, justin, boppy, deedee, amy, olivia, ellie; `GROW` for grace (100, 1.15), rose (102, 1.15). `build(id, fix=True)` warps the head with `kidhead.grow_head` and records `BODY_ROWS_PER_PX[id]` so the body keeps the real total height; each bake_<id>.py sets `fo = BODY_ROWS_PER_PX[id]*KW`.
- On-screen rows = bake px x engine draw scale `OW.<id>.k` (Tom 1, TNB .92, Amy .925, Deedee .922, Boppy .922, Justin .849, Olivia .914, Ellie .853, Grace .758, Rose .676). `SPLASH_H` in engine/splash.js sizes the welcome figures by real height (rose 185).
- Rebake ONLY the walk atlas: `python3 tools/sprite-bake/walk_splice.py <ids>` on a clean tree (keeps art/chars/<id>-ow.webp, restores the rest, splices the `ow` data into data/<id>-hires.js; walk-only files Olivia and Ellie are written whole). A plain bake overwrites the hires battle atlases. Never `git checkout art/chars` after baking.
- Chin px (measured on 6x gridded renders): tnb 118, justin 123 (spikes; hair mass top about 113), boppy 154 (maybe about 150), deedee 114, amy 95, olivia 100, ellie 125. Head factors: TNB .852, Justin .709, Boppy .633, Deedee .992, Amy 1.279, Olivia 1.211, Ellie .935. Body scale: Boppy +17, Justin +10, TNB +5, Amy and Olivia about -5 percent.

## State
Smoke FAILS: [], tag_check ok, welcome screen portrait looked at. Not inspected: landscape welcome, back and side frames one by one. Visual check: within about 5 percent of Tom; Amy and Olivia may read slightly short (long hair hides the chin). Tune by changing that id's chin px in WALK_MATCH and rerunning walk_splice.

## Width to height of the head including hair (measured on the fixed front stand frames, 2026-11-06)
Tom .88, Justin .83, Boppy .94, Deedee 1.07, Ellie 1.09, Olivia 1.12, TNB 1.29, Amy 1.36. Tom and Justin are narrow; TNB and Amy are wide mostly from hair volume. Equalising widths would need a non-uniform warp: Tom's decision, not done.
