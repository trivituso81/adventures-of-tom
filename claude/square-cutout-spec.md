# The Square: cutout-optimized image spec v3 (written 2026-11-01)

Prompts: claude/square-pass1-prompt.txt (full scene, paste as is, NO attachment; Tom refuses style references) and claude/square-pass2-prompt.txt (clean ground plate, attach the approved pass 1 image). Tom's asks (11-01): cutouts for a 3D walk-behind effect (trees, lamp posts, building tops), a properly large fountain, a sign on every building in a different style per building. Supersedes claude/square-lettering.md and claude/area-prompts-v2.md section 6 for any NEW generation. Not installed. Existing art/town.webp stays until an image comes back.

## What changed from the installed Square
| Topic | Before | Now |
|---|---|---|
| Source | edit of attached painting | fresh image, no attachment; wording follows the Downtown LA prompt (golden hour, glowing windows, flat front facades, orthographic camera, crisp detail) |
| Fountain | 5x4 tile box, generator shrank it | box x 512 to 928, y 520 to 840 (about 410 px wide), three tiers, brightest object, 40 px clear ring, water tip y 520 |
| Signs | one lettering style, game-drawn then generator-drawn | 8 building signs, each its own material, shape, typeface; 3 exit boards share one green system |
| Layers | none | 9 layering rules: continuous ground, 40 px visible base behind tall objects, closed silhouettes, thin dark edge, 24 px separation, light low-contrast shadows |
| Clean plate | none | optional pass 2: same scene with trees, lamps, fountain, benches, props, exit boards, taxi removed |

## Sign table (spelling checked; v4: each building is also designed around its theme)
| # | Words | Building theme | Sign design and lettering |
|---|---|---|---|
| 1 | CRUMB / BAKERY | brick oven chimney, loaves, bread cart | giant bread peel, white icing, plump swirly cursive |
| 2 | HUSH / LIBRARY | stone tower, owl on roof | carved stone open book, gold-leaf thin Roman caps |
| 3 | SPROUT / HOUSE | glass greenhouse, giant watering can | living vines on iron trellis arch, organic letters |
| 4 | PENNY'S / POCKETS | red and gold emporium, giant brass coin | bulb marquee, circus wood-type |
| 5 | SNAIL / MAIL | snail-shell spiral roof, mail slot | perforated postage stamp, rubber-stamp typewriter |
| 6 | KETTLE / COTTAGE | steaming copper kettle on roof, teacup window | teacup-and-saucer sign, Victorian tea-tin cobalt |
| 7 | MOON / CLUB | brass dome observatory, telescope | brass crescent plaque, constellation Art Deco, circle Os |
| 8 | TAXI / CO. | 1950s garage, roof light box, taxi | chrome light-box, speedy italic block |
| 9 | GRUMP / HOLLOW (north exit) | green | carved rough wood |
| 10 | RIVITUSO / ROW (south exit) | green | enamel street-name on tall iron posts |
| 11 | SCHOOL (east exit, one line) | green | painted schoolhouse block caps |

Decision: east board reads SCHOOL (one line), as in v2, because the opening leaves little width; the game table says ELEMENTARY SCHOOL if a wider board is ever possible.

## Geometry (same canon as the installed plate)
Plate 1920 x 1664, 64 px tiles. Door centers x 288, 736, 1184, 1632. North door bottoms y 500, south y 1215. Buildings 320 px wide. Exits: north steps x 448 to 576, south street x 896 to 1024, east opening y 576 to 704. Lamps feet (500, 840) and (1130, 840). Three stand-alone plaza trees (90, 700), (1810, 790), (1400, 560).

## When the image comes back (install, no ask of Tom)
1. Standard checks in claude/square-redo.md install plan, plus: read all 11 words letter by letter; check no sign touches a door or awning; check fountain art stays near the box.
2. Set PLATE_SIGNS for map 'town' to [] (painted lettering); remove game-drawn lettering for town.
3. Re-derive the plate mask. Fountain block and object follow the new box (tiles x 9..13, y 8..12; check against the painting). Move the three signposts onto the new boards. Re-check bonus-nine-scoops fountain zone.
4. LAYER CUTOUTS (new, for the 3D effect): with the pass 2 ground plate, difference-key each occluder (tree canopies, lamp posts, fountain column and plume, awnings and roof edges, exit boards and posts) into transparent overlay sprites drawn after actors when the actor's feet y is less than the object's base y. Without pass 2, fill under cutouts from nearby cobble samples. Test walking behind a tree, a lamp and the fountain in portrait and landscape.
5. Standard tests, CHANGES entry, `?v=` bump, push.

## Status log
- 2026-11-01 16:28: Tom's generator returned a v6 render at 1347 x 1167 (15:13). All 11 words spelled right, eight unique buildings and signs, fountain about 410 px at plate scale. Needs: east exit opening wider and clearer, SCHOOL and RIVITUSO boards mounted higher (claude/square-edit1-prompt.txt), then pass 2 clean ground on the edited image. Generator output is 70 percent of the 1920 x 1664 plate: upscale at install. Door lines and rows sit lower than the spec (north doors near y 570, south doors near y 1470 at plate scale): re-derive the mask from the painting, do not trust the coordinates.
- 2026-11-01 16:57: Tom compared the fresh render with the installed Square (angled three-quarter view, big roofs, sandy paving) and rejected the fresh look: I had copied the Downtown LA flat-facade camera and saturated glow. DECISION: stop fresh generation. Use claude/square-edit-current-prompt.txt (EDIT THE ATTACHED the-square-current.png = art/town.webp 1920 x 1664) which keeps the current look and changes only unique building and sign designs, a larger fountain (460 px), higher exit boards with wider exits, and cutout-friendly ground. square-pass1, pass2 and edit1 prompts are superseded; pass 2 (clean ground) still applies after this edit is approved.
- 2026-11-01 17:00: Tom rejected edit prompts (they drift) and the fresh render. FINAL DECISION: ONE fresh generation, no attachment, claude/square-pass1-prompt.txt v7, rewritten to the installed Square's own look (angled three-quarter view with big tiled roofs, pale sandy flagstone paving, leafy natural greens, warm natural daylight) with the themed buildings, unique signs, 410 px fountain and cutout rules kept. Pass 2, edit1 and edit-current prompts are NOT to be used. Cutout layers are built from the single image in the sandbox (mask each occluder, fill the ground under it from nearby paving) and shown to Tom before install.
- 2026-11-01 17:15: v8 prompt (style and camera wording restored from the old square-redo prompts) also came back wrong ("same result every time"). STOP-LOSS: four fresh prompts (v5 to v8) and three edit prompts have all failed. Do NOT write a v9 in the same conversation. Analysis: (1) the Square and the other areas that Tom liked were made by attaching the current painting (docs show "EDIT THE ATTACHED IMAGE", art/town.webp as input); Tom now says edits never work and he will not attach a reference for a fresh image, so the one input that anchored the old look is gone; (2) this conversation's context is full of rejected looks and long prompts steering every new one; (3) I cannot see the renders except when Tom sends them, so each attempt is blind. RECOMMENDATION for the next session: start fresh, and ask Tom for ONE thing only: the exact generator prompt or settings (or a prior result) from an area he was happy with, so the Square prompt copies what worked; or have a different model (Opus) draft the prompt from claude/square-redo.md plus this spec. Until then keep the installed Square; nothing is installed.
