LONG ISLAND AREAS 03 TO 07: PROMPT PACK (written 2026-11-02)

The Square (01) and Rivituso Row (02) are done. This pack covers the five remaining Long Island outdoor areas. Each area has two files:
- NN_area_painting.txt: the one fresh prompt that makes the area painting.
- NN_area_cutouts.txt: four stencil prompts for walk-behind pieces, sent later in the same chat.

| # | Area | Painting size | Exits (exit board words) |
|---|---|---|---|
| 03 | Grump Hollow | 1536 x 1408 | bottom: LONG ISLAND / SQUARE |
| 04 | Cattail Pier | 1536 x 1408 | top: RIVITUSO / ROW, left: WHISPERING / MARSH |
| 05 | Whispering Marsh | 1664 x 1472 | right: CATTAIL / PIER, top left: SUNDIAL / HOLLOW |
| 06 | Sundial Hollow | 1408 x 1280 | bottom: WHISPERING / MARSH |
| 07 | Long Island Elementary (schoolyard) | 1536 x 1152 | left: LONG ISLAND / SQUARE |

STEPS FOR EACH AREA
1. Open a NEW image generator chat for that area. Attach nothing. Paste the whole painting file.
2. Send the result to Claude. Claude checks the spelling of every sign, the exit boards, the paths and the size, then sends you two review images: the walk map with tile IDs (A1 style) and the cutout plan.
3. Give tile feedback ("C9 green, Q15 red") until the walk map is right.
4. Only then paste the four stencil prompts from the cutouts file into the SAME generator chat, one at a time. Claude may adjust them to match what was actually painted; use Claude's version if it sends one.
5. If a render misses: Claude writes a corrected full prompt and you run it in a NEW chat. Never ask the generator to edit a painting. Stencils are the only exception, because they are used only to know where to cut and never appear in the game.

RULES BUILT INTO EVERY PROMPT
- Look: the polished hand-painted style of the approved Square and Row, golden light from the upper left, three-quarter camera.
- Walkable: every exit connects to every landmark by wide paths; nothing walls off a route; buildings stand free with a path around them.
- Signs: the generator designs and letters every sign itself, in the place's own theme. Freestanding signs exist only as exit boards, hung high on two tall posts, set back from the picture edge so they are not drawn low.
- Words that lead to the Square read LONG ISLAND / SQUARE.
- No collectibles or interactive items painted in (chests, coins, keys, switches). The game draws those on top later. Anything that changes during the story (water that drains, gates that open) is painted in its open, empty state and the game adds the changing part.
- Cutout friendly: ground continues under and behind every tall object, every tall object shows its base, crisp edges.
- No people, no monsters (monsters are game characters), no extra words.
