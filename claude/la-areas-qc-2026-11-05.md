# Los Angeles area paintings: check of the six approved Library pictures (2026-11-05)

Scope (Tom's ask, after the Hollow check): all approved Los Angeles area paintings. Six: Downtown (blvd), Jefferson Park (jpark), Griffith Park, Studio Gate (studio), The Backlot (backlot), Old Oak Park (oakpark). None is installed yet; the game still shows the old paintings. No LA stencils or cutout layers exist yet.

Method: each raw picture (art/raw/areas/area-<id>-v1.png) was read against its own prompt (art-prompts.json) and docs/AREA_PAINTINGS.md. Each was cropped to its plate shape (centered), scaled to plate size, and drawn with the CURRENT map's walk mask, exit tiles, door tiles, tap objects and NPCs. Then the six plates were swapped in temporarily on a local copy (nothing committed or pushed, files restored, working copy clean) and played at 393 x 852 at doors and exits. Zoomed every odd piece of text.

## Verdicts
| Area | Verdict | Why |
|---|---|---|
| Downtown LA | PASS | Crop 13 percent (68 px top, 69 bottom) loses nothing needed. All 8 door markers land on painted doors. Exits fit (Griffith steps, Jefferson arch, Studio road). |
| Jefferson Park | REDO | Plate is 5:4 (1920 x 1536), picture is 1:1. A centered crop takes 102 px off the top and removes the whole DOWNTOWN arch, so the north exit has no board. Both boards need about 865 px of height, the crop leaves 819. No crop can keep both. |
| Griffith Park | PASS with notes | Three required words correct. Exit board is a proper two-post arch. |
| Studio Gate | PASS after one retouch | Four required words correct. Garbled writing on the clapperboard at lower right (reads like FIR...NUR). |
| The Backlot | PASS after one retouch | Five required words correct. Small green sign at lower left reads MASET GALIK with an arrow: gibberish, and a freestanding sign. |
| Old Oak Park | PASS with notes | Three required words correct. Exits fit. |

## Words check (letter by letter)
Correct: COFFEE, RAMEN, STARLITE, CABS, WARDROBE, LOFTS, GRAND, SHOP, GRIFFITH PARK, JEFFERSON PARK, STUDIO (blvd); CREOLE, PUPUSAS, SKATE, JUICE, 3468, 2732, ALVAREZ, 2740, CAR BARN (jpark); DOWNTOWN, GRIFFITH PARK, TAR (griffith); SUNSET GOLD / STUDIOS, BACKLOT, SNACKS, DOWNTOWN (studio); STAGE 7, SALOON, DELI, STUDIO GATE (backlot); JEFFERSON PARK, GARDEN, DOG PARK (oakpark).
Not on the lists: METRO (blvd, matches the existing Metro stairs object at (25,25), keep); MASET GALIK (backlot, remove); clapperboard writing (studio, blank); a second small 3468 plate beside Tom's house door (jpark, harmless); chalkboard A-frame and two pictograph notice boards in Oak Park (no real words, harmless).
DELI is cut by the right edge (backlot) but reads.

## Install-time wiring found (none done)
| Map | Fix |
|---|---|
| jpark | After the redo. Current CAR BARN exit rows 9 to 10 sit about two rows south of the painted road (rows 7 to 8). |
| studio | North exit tiles (10,0),(11,0) are about four tiles left of the painted BACKLOT arch (opening tiles 14 to 18). Move them, and move the backlot arrival from studio (10,1),(11,1) to match. |
| griffith | Exit tiles (10,21),(11,21) cover the left post and half the trail. Painted opening is tiles 11 to 13. |
| blvd | Road runs to the left edge, funicular and station at top right, Metro stairs: block the first two in the mask, keep Metro. STUDIO board is a single-post arrow sign, not a two-post board (legible, keep). |
| griffith, studio, oakpark | A trail or road looks open at an edge that is not an exit (griffith right trail and top ridge, studio bottom road, oakpark narrow path between the oak trunks at the top). Block in the mask and tell Tom. |
| all | Clear PLATE_SIGNS for each map (the game's old lettering drew a second JEFFERSON PARK board over the new painting in the test), re-derive every plateMask, re-place tap objects, bump tags. |

## Scale and quality notes
- In game Tom is about one door tall in Downtown, Jefferson Park, Studio and Backlot. Griffith and Oak Park props are bigger (picnic tables about 3 tiles long) but read fine, as in Hollow.
- Griffith and Oak Park exit boards: board bottom is about Tom's head height at game scale, same as Hollow. Downtown and Backlot boards sit clearly above head height.
- Raw sources are 1024 px (1152 x 864 for the two 4:3 ones), so plates are scaled 1.9x (Downtown, Jefferson), 1.6x (Oak Park), 1.5x (Griffith), 1.3x (Studio, Backlot). Same generator limit as the Long Island areas.

## Recommended calls
1. Jefferson Park: set its Library entry to 4:3 and generate again (4:3 only trims 6 percent of the width for a 5:4 plate). The other three square pictures lose 8 to 15 percent of height, which is fine.
2. Backlot and Studio: retouch the stray sign and the clapperboard writing at install (same method as the Square fountain composite) instead of regenerating.
3. Install the other five together when Tom says "install these areas". Nothing was changed or pushed in this check.
