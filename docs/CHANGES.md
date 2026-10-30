## 2026-10-30: Battle prop sheets, Rose sheet 2 of 2 (source only)
- Saved `tools/sprite-bake/src/props/rose-sheet2-of-2.png`. All 12 props match the prompt list. Rose is now complete (25 of 25). Not wired into the game.

## 2026-10-30: Battle prop sheets, Rose sheet 1 of 2 (source only)
- Saved `tools/sprite-bake/src/props/rose-sheet1-of-2.png`. All 13 props match the prompt list. Not wired into the game.
## 2026-10-30: Painted Chapter 14 and 15 bosses
- Tom sent ch14monsters.zip: Warden Boppy (chapter 14 boss, id `warden`) and HUSH-9 Final Form (chapter 15 boss, id `hush9final`). Both show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- New bake flag `--cuts x1,x2,...` forces the column between each pair of frames, for sheets whose frames overlap in x with no clean gap (the Warden's swoosh and the HUSH-9 sound waves reach into the next frame).
- Known small flaws in the source art: Warden attack2 has a stray halberd tip at its left edge and a speck under the stance; Warden attack4 has a thin sliver of attack3's flash at its left edge; HUSH-9 attack3 has its left foot slightly clipped. A corrected sheet would fix them.
- Tests: `tools/foes_test.py warden,hush9final` 0 fails; `tools/smoke.py` FAILS: [].
## 2026-10-30: Square painted rooms, batch 3 (Aunt Ellie's House, Golden Hour Coffee, Ramen Ramen, Very Green Juice, Nickel's)
- Tom sent rooms3.zip (01_Aunt_Ellies_House, 02_Golden_Hour_Coffee, 03_Ramen_Ramen, 04_Very_Green_Juice, 05_Nickels). Matched to ids `elliehouse`, `coffee`, `ramen`, `juicebar`, `nickels`. All five are 1254 px squares, full bleed, no people or text, standard gate-gap layout. Installed as 16 x 16, `square:true`, actors at 1.98 (x1.2 boost).
- Exits: Ellie, Ramen use the 3-tile gap (x7 to x9: door (8,15), door2 (7,15), doors (9,15)); Coffee, Juice, Nickel's the usual x6 to x9. Spawn (8,14).
- Residents stand on the floor in front of their counters (Juniper (8,6), Kenji (7,6), Sage (8,7), Ellie (7,8)); Nickel stays hidden at (12,6) and the shop still opens from the counter. Objects re-placed to the paintings; Dropped as unreachable: Ellie's lamp table and dining table, Coffee's none, Ramen's lucky bamboo, Juice's wheatgrass and supplement shelf. Their lines are gone.
- Tests: `rooms_test.py` on all five 0 fails; old per-room tests (coffee, ellie, juicebar, nickels, ramen) deleted (hard-coded to the old layouts); `tap_test` covers the five; smoke, camera_clamp, ch12, ch15 0 fails. Shopkeeper and resident dialogue opened by hand in each room.

## 2026-10-30: Battle prop sheets, Grace's sheet (source only)
- Saved Grace's returned sheet as `tools/sprite-bake/src/props/grace-sheet1-of-1.png`. All 15 props match the prompt list. Not wired into the game.

## 2026-10-30: Battle prop sheets, Tom's first two (source only)
- Tom ran the image AI on the first prop prompts. Saved the two returned sheets under `tools/sprite-bake/src/props/` with a README saying which cells are right. 30 of Tom's 31 props are usable; the retro console is still to redo.
- Not wired into the game. No code change.
## 2026-10-30: Tom's House (square paintings: main floor and primary suite)
- Tom sent tomshouse.zip: "Cozy Dusk Home and Garden Cutaway" (whole ground floor with the garden path) and "Cozy Isometric Bedroom Suite Retreat". Installed as `tomhouse` and `tomsuite`, both 16 x 16, `square:true`, 1254 px, actors at 1.08 scale (x1.2 interior boost), same call as Amy's House.
- Main floor: exit is the garden path (7 to 8, 15), spawn (8,14); the doorway at the top middle (7,1) leads to the suite. Walkable: the front hall, the open floor between the dining rug and the sofa (x6 to x8), the hall to the suite. Kitchen, living room corner and the TV wall are dressing only (the island and sofa block every way in). Objects kept: wet bar, island (Bready Mercury text and the ch6 variant), dining table, rubber plant, The couch (still the chapter 12 bench menu). Dropped (unreachable): fridge, range, counter, photo wall, console table, coffee table, big TV, PS5, TV console, pouf, corner plant. Their lines are gone.
- Suite: the white door on the left wall (3,7) is the way back (spawn (3,8)); the bathroom is entered through the open wooden door (x5). Shower and bed keep the full restore behavior. Closet is dressing only (a plant blocks it), so the two closet objects and the closet shelves are gone.
- Scenes: ch2Starter and ch6Kitchen now stand Tom at (8,5) beside the island (TNB at (7,5)); triggers ch2-starter and ch12-house use zone [7,9,8,12]. Bready jar redrawn in `engine/plate.js` at the new island spot.
- Tests: `rooms_test.py tomhouse tomsuite` 0 fails; `tools/tomhouse_test.py` rewritten (doorway both ways, garden path to 2nd Ave, ch2Starter and ch6Kitchen); bready_test, smoke, camera_clamp, tap_test, ch12, ch15 0 fails.

## 2026-10-30: Slimmer dialogue box, part 2 (portrait height)
- Part 1 only removed the divider and hint; the box stayed tall. Portrait now shrinks the box itself: face 89 to 56 px, text 18 to 16 px, AUTO and the page count sit in the text column beside the face instead of in a row below it, less top and bottom padding (half the home-bar inset). Box is about 87 px plus the home-bar inset, down from about 197 px on Tom's phone.
- CSS only (`index.html`, "Slim dialogue box" block). Landscape and the splash panel unchanged.

## 2026-10-30: Slimmer dialogue box
- Removed the divider line and the "Tap here or A / Enter to continue" hint from the dialogue box. AUTO and the page count now sit right under the text. Portrait top and bottom padding trimmed, and the portrait face moved up with it. Portrait box is about 52 px shorter (197 to 145 px with a portrait face); landscape box is tighter too.
- CSS only, in `index.html` after the landscape dialogue rules. The hint element still exists but is hidden, so `engine/overworld.js` is untouched. The camera and area changes are untouched (`engine/intro.js` reads the box height, so it just gets more room). The splash panel keeps its own footer.
## 2026-10-30: Painted Chapter 13 enemies
- Tom sent ch13monsters.zip with three sheets: Dual-Coast Drill Worm (boss, id `drillworm`), Hushling, Turnstile Grump (id `turnstile`). All three show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- Signal Fault (`signalfault`) was NOT in the zip (its note says the PNG was not available), so it still uses its old sprite. Needs a sheet from Tom.
- Hushling's sheet had a white streak and specks between its last two frames; blanked in the saved source.
- Known flaw in the source art: Drill Worm attack1 has its drill tip clipped at the right edge (the next frame's dirt cloud overlaps it). A corrected sheet would fix it.
- Tests: `tools/foes_test.py hushling,turnstile,drillworm` 0 fails; `tools/smoke.py` FAILS: [].

## 2026-10-30: Painted Chapter 11 and 12 enemies
- Tom sent ch11_12monsters.zip. Installed lostluggage, redeye, standbysprite, finalcall (chapter 11 boss) and gridlockprime (chapter 12 boss). All five show painted in a test fight; old sprites kept as fallback until Tom approves on his phone.
- New bake flag `--cut-y N` forces where the first row of frames ends, for sheets whose lone second-row stance is not auto-detected (redeye, gridlockprime, both 385).
- Known small flaws in the source art: finalcall attack4 has its left foot slightly clipped, gridlockprime attack4 has its left edge slightly clipped (the neighbouring frame's effects overlap). A corrected sheet would fix both.
- Tests: `tools/foes_test.py` on all five, 0 fails; `tools/smoke.py` FAILS: [].
## 2026-10-30: Amy's House (square painting, whole ground floor)
- Tom sent amyshouse.zip: a ground-floor cutaway (garden border, blue front door at the bottom) and a second-floor image. Call made: the ground floor is the `amyhouse` plate; the second floor is NOT wired (the house is one level, see docs/ROOM_PAINTINGS.md), so the girls' rooms and the primary bedroom upstairs are not reachable. The image is a floor plan, not the usual front-half-wall room, so the exit is the garden path: door (9,15), door2 (8,15), spawn (9,14), the front door painted at (9,12).
- 16 x 16, `square:true`, 1254 px. Actors drawn at 1.08 scale (x1.2 interior boost = about 1.3 on screen; plate.js), not the 1.98 of the other rooms, because a whole house in one painting is drawn smaller. Walkable: hall (x9) to the cross hall (row 8), the stair hall (x3) to the study and bath, the corridor (x7) to the bedroom, and x10 up to the kitchen. Living room and reading nook are dressing only (furniture blocks every way in).
- Justin stands in the bedroom pocket (8,4), Amy under the dining table (13,9). Objects: family photos, Amy's desk, the bed, kitchen island. Dropped Grace's bed, Rose's bed and the toy box (upstairs or unreachable); their lines are gone. Girls at home (travel.js) now stand at (11,8) and (6,8). Nine Scoops `nsBanner` and `nsEnd` re-placed along the cross hall and kitchen row.
- Tests: `rooms_test.py amyhouse` 0 fails (47 reachable tiles); new `tools/amy_scenes_test.py` plays both scenes with nobody on a blocked tile; smoke, camera_clamp, tap_test, justin_test 0 fails.

## 2026-10-30: Square painted rooms, batch 2 (Moon Club, Penny's Pockets, Taxi Co., Deedee and Boppy's House)
- Tom sent rooms2.zip (01_Moon_Club, 02_Pennys_Pockets, 03_Long_Island_Taxi_Co, 04_Deedee_and_Boppys_House). Matched to ids `observatory` (Luna's Moon Club room in the Square, not the `moonclub` dance hall), `shop`, `taxi`, `grands`. The README says a fifth image was not available; nothing else arrived. All four are square, full bleed, 1254 px (under the 1500 px target, installed anyway).
- All four are 16 x 16 with the usual gate gap and `square:true`. New plateMask, objects and NPC spots in `data/maps-le.js`. Observatory: gap x7 to x8, little silver door at (12,5) (reached from (12,6)); the Moon Club stairs now return to (12,6). Shop: Penny stands in front of the counter at (8,7) because the painting has no floor behind it.
- Deedee and Boppy's house: the sofa stands in the middle of the room, so the TV, recliner and pepper plant are touched from the floor in front of the sofa (their objects reach down to it). Dropped the Photo wall prop (nothing in the painting can be reached): its line is gone ("Tom at six. Amy at four. Boppy in his college track singlet..."). Added a Dining table prop. All story scenes that place people in the house moved by (+2,+3): ch1 Theft and End, ch3 Fishing and End, Nine Scoops thaw, ch15 open, and the chapter 11 and 15 start spots (now 8,10).
- Tests: `tools/rooms_test.py observatory shop taxi grands` 0 fails; old observatory, shop and taxi tests deleted (hard-coded to old layouts); `tap_test` covers the new rooms; ch11, ch15 tests, smoke, camera_clamp 0 fails; ch1Theft, ch1End, ch3End, ch9Letter played in the house with nobody left on a solid tile. Not yet seen on Tom's phone.

## 2026-10-30: Square painted rooms, batch 1 (Crumb Bakery, Hush Library, Sprout House, Snail Mail, Kettle Cottage)
- Tom sent rooms1.zip (01_Crumb_Bakery, 02_The_Hush_Library, 03_Sprout_House, 04_Snail_Mail, 05_Kettle_Cottage; matched by name and by looking: bakery, library, greenhouse, post, tea). All five are square, full bleed, no people or text. They are 1254 px, under the 1500 px target; installed anyway (quality 88 webp, `?v=20261030`).
- Engine: first square rooms, so `resize()` in `engine/overworld.js` got a square-plate branch (`PLATES[id].square`): scale = max(width/mapW, height/mapH). Portrait shows the painting's full height and the middle ~46% of its width, landscape its full width and middle ~46% of its height; the camera follows Tom. The painting is drawn stretched to the map, so any N x N grid works.
- Grid: all five are 16 x 16 tiles (the notes said 23 x 23 for the library; 16 keeps the characters the same size against the furniture in every room, since the painter drew every room at the same scale). Door gap is x6 to x9 at the bottom; exit tiles are the bottom row x6 to x9, spawn (8,14).
- Rewrote the five room specs in `data/maps-le.js` (plateMask, objects, NPC spots). Library staff door is now (12,4) and the Stacks stairs return to (12,5). Nine Scoops scenes in the bakery moved Mr. Pistachio to (7,5) and the gremlins to (5,8) and (11,8) in `data/bonus-nine-scoops.js`.
- Tests: new `tools/rooms_test.py` (plate drawn, every object and NPC reachable, door leads out, library staff door and Stacks stairs round trip, portrait and landscape shots in `tools/shots/room-*`). It replaces the old per-room tests (bakery, greenhouse, library, post, tea), which were hard-coded to the old layouts. `tools/tap_test.py` now also covers the four new rooms; `tools/smoke.py` FAILS: []. `tools/reach_test.py` 218 fails, same as before this change.
- Camera: square rooms use the same safe-band scroll as the outdoor maps (Tom's tile never sits under the title bar or controls; a soft backdrop of the painting shows in those bands next to an edge). `tools/camera_clamp_test.py` treats square rooms like outdoor maps. Look for on the phone: the five rooms, portrait and landscape, walking to the door and to each prop. Not yet seen on Tom's phone.

## 2026-10-30: Outdoor maps fill the screen in portrait and landscape
- Tom: outdoor areas should be big enough that no dead space shows on an iPhone in portrait or landscape, one area for both layouts, with the area's edges anchored to the matching screen sides. Houses are fitted separately and are untouched.
- Finding: every outdoor map is a single painting with an invisible tile grid, so it cannot be grown with trees or water tiles; growing one means a bigger painting. All 45 outdoor maps were smaller than the largest phone canvas (440 x 956 and 956 x 440 CSS px) on at least one axis, which is where the flat green came from.
- What changed (code only, no art): outdoor painted maps now zoom just enough to cover the screen in the current layout (`outdoorCover` in `engine/overworld.js`, 1.0x to 2.25x; the painting is sharp up to 2.0x). Sideways the camera stops at the map edge, so the painting meets the screen edge. Near the top or bottom edge the camera scrolls a little past the map, only into the title bar and controls bands, so Tom is never walking under the controls; that strip shows a soft darkened version of the painting (`plateBackdrop` in `engine/draw.js`) instead of flat green.
- Result: 38 of 45 maps are fully covered at every phone size tested (iPhone SE, 15 and Pro Max sizes, both layouts). 7 hit the zoom cap and still show a soft backdrop on some phones: flightzero, subdepot, subtunnel and the four memory rooms (memamy, memgrace, memrose, memtnb). They need bigger paintings. Sizes and painting rules: `docs/MAP_SIZES.md`.
- Visible change on the phone: in portrait the maps are zoomed in (town 1.15x, ballroom and gates up to 2.1x), so characters look bigger and you see a narrower slice of the map. Landscape changes least (town, school, concourse, jpark stay at 1.0x).
- Tests: `tools/camera_clamp_test.py` now checks coverage and the safe band at eight phone sizes (it fails on the old code; checked). `tools/tap_test.py` now picks tap targets inside the safe band; the blvd (27,23) target it used to pick sits under the on-screen D-pad, which is why it failed in landscape before. Tap test 28 OK, smoke FAILS: [], per-map tests for jpark, blvd, griffith, backlot, concourse, dome, carbarn, deadletter, dakota pass (jpark failed once on a cold first run, then 5 of 5 clean).
- Cache tags `cover1` on `engine/overworld.js` and `engine/draw.js`. No spoken lines changed. Not yet seen on Tom's phone.
## 2026-10-30: Painted Chapter 10 enemies
- Tom sent chapter10_monster_sprites_1.zip. Installed painted frames for Carry-On, Jet Lag, The Unclaimed, The Armrest Hog and the boss The Last Call (four attack frames). All face right.
- Carry-On's source had a stray white vertical streak; removed from the saved source before baking. Not installed: The Long Line (no image in the zip; id `longline`).
- Test: `tools/foes_test.py` on all five, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 9 enemies
- Tom sent ch9_monster.zip. Installed painted frames for Velvet Rope, Stuffed Shirt, The Hanger-On (id `coathanger`), The Sore Loser and the boss The Mirrorball (four attack frames). All face right.
- Not installed: The Wallflower (no image in the zip; id `wallflower`).
- Stuffed Shirt is tall (78 rows), like the Soggy Sock. Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 8 enemies
- Tom sent chapter8_monster_sprites.zip. Installed painted frames for The Draft, The Picky Eater, Wet Blanket and the boss Old Ironbelly (four attack frames). All face right.
- Not installed: Lukewarm and Leftover (images missing from the zip; ids `lukewarm`, `leftover`). A second variant of The Draft was mentioned but not included.
- Test: `tools/foes_test.py` on all four, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 7 enemies
- Tom sent chapter7_monster_sprites_and_prompts.zip. Installed painted frames for The Cliffhanger, Pop-Up Panic and the boss The Unread (four attack frames).
- Not installed: the file named Know-It-All_sprite_sheet.png actually shows a red tasseled bookmark ghost (the Shusher design), not the navy encyclopedia in the Know-It-All prompt, so `knowitall` keeps its old art. Shusher_idle.png is a lone stance (Shusher is already installed from chapter 6). Dog-Ear's image is missing from the zip.
- Test: `tools/foes_test.py` on all three, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 6 enemies
- Tom sent ch6_monsters.zip. Installed painted frames for Peanut Gallery, Shusher, Sticky Sap, Twig Spy and the boss Chairman Cheeks (id `chairman`, four attack frames). Second-row lone stances ignored; all face right.
- `bake_foe.py`: `--trim-edges` now takes an optional pixel width (default 2; above 2 it also uses undilated pieces). `--by-pieces N` also exists but is unused (it did not help here).
- Known flaw: in the source sheet the Chairman's acorn volley overlaps the next frame, so attack3 has one clipped acorn at its right edge and attack4 has one stray acorn at its left. Small; a corrected sheet would fix it.
- Not installed: Acorn Agent (image missing from the zip again; id `acornagent`).
- Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 5 school enemies
- Tom sent chapter5_monster_sprites.zip. Installed painted frames for Pop Quiz, Tardy Bell, Glitter Glue, Dodgeball Dread and the boss The Red Pen (four attack frames). All five sheets face right, so nothing is mirrored (the F on Pop Quiz reads correctly).
- Baked with `tools/sprite-bake/bake_foe.py` (Red Pen with `--trim-edges`); script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Test: `tools/foes_test.py` on all five, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 4 backlot enemies
- Tom sent ch4_monsters.zip. Installed painted frames for Boom Mic Moth, Clapper Snapper, Cue Card Crab, Fog Wisp and the boss The Director's Cut (four attack frames). Fog Wisp now faces right like the others.
- `bake_foe.py` gained `--trim-edges` (drops slivers of a neighbour frame's burst effects; used for the Director's Cut). Script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Not installed: Extra Extra (image missing from the zip) and a pizza monster concept image (three poses on a gradient background, no matching enemy in the game, not a sheet).
- Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Rose Mode Boop icon is a pointing finger
- Tom: in Rose Mode the Boop icon should be a pointer finger (a boop is a poke).
- Was the nose emoji. `tools/build_bp_emoji.py` MAP `rose.boop` is now the pointing-up finger (U+1F446), `data/battle-emoji.js` regenerated (regen of the old map reproduced the old file byte for byte first, so only Boop changed). The Nose Boop move (`rx_boop`) has no picture of its own and is untouched.
- Cache tag `?v=boop1` on `data/battle-emoji.js` in `index.html`. Checked headless in Rose Mode: Boop tile shows the finger, no console errors; smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 3 marsh enemies
- Tom sent five sheets (ch3_monsters.zip): Soggy Sock, Bobber, Tangle, Snag and the boss Old Iron-Gill. All five now use the painted frames in battle (stance, hurt, attack frames; Iron-Gill has four attack frames).
- Baked with `tools/sprite-bake/bake_foe.py` (new `--extra-ok` flag, and a frame named `extra` is cut and dropped; the Sock sheet has a spare 5th stance and its two attack frames touch). Script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Test: `tools/foes_test.py` on all five (painted, atlas ready, frames drawn, no page errors), contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.
- Note: the Sock is tall and narrow (77 rows high), so it stands taller than the other regulars.

## 2026-10-30: RELOAD button on the welcome page
- Tom: the iPhone home-screen app has no refresh button and sometimes holds on to old files, and he cannot clear the cache from inside the app.
- New small RELOAD button (refresh icon) on the welcome page, left of ADMIN, same outline style, portrait and landscape (`engine/splash.js` `splashReload`, CSS in `index.html`; the launch row is now a wrapping flex row, landscape stays on one row).
- Tap: it re-downloads the page and every script (the big baked voice files are skipped, they rarely change) with `cache:'reload'`, then reloads on a fresh `?r=` address. Saves live in the site's localStorage, so they are kept (checked headless). An 8 second timer reloads anyway if a download hangs.
- Test: headless portrait and landscape screenshots, click RELOAD lands on `?r=`, localStorage survives, no console errors; smoke FAILS: []. Cache tag `welcome7` on splash.js. Not yet seen on Tom's phone.
- Not done: a build number on the title screen (offered earlier, not asked for yet).

## 2026-10-30: Home-screen icon shows Tom much bigger
- Tom: make Tom more prominent in the iPhone icon.
- New `icon-v6.png` (180x180): the painted icon cropped in tight around Tom's face, scenery kept as backdrop. `index.html` now points at it (new filename so iOS does not serve the cached icon). No code or spoken lines changed.
- Limit: the only source is the 180px painted icon, so the crop is slightly soft. A larger painting of Tom would be sharper.
## 2026-10-30: Walking paths follow the painted paths
- Tom: many places show a clear painted path that the character cannot walk.
- Town: had no walk mask and invisible legacy tree and fence objects blocking painted paths. Rebuilt a `plateMask` for the town (data/maps-le.js), removed the legacy tree and fence lists, re-seated benches, planters and the shop sign on the painting, and added `noGo` so villagers never plug the doors and the east neck.
- Other maps: about 200 tiles opened across 8 map files (maps-le, la, p2, ch13, ch17, ch18, ch19, ch20), reviewed one by one against the paintings (oak plank bridge, moon club floor and carpet, stacks aisles, sundial and pier paths, tower and gate floors). Low-confidence tiles (props, void edges) were left closed.
- `tools/reach_test.py all` checks every plate map for unreachable exits and NPC plugs. Interactive objects (taxi, counters, shelves and similar) that overreach their art were left alone. Known: the tap test on blvd (27,23) already failed before this change.
- smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone (close and reopen the app).

## 2026-10-30: Old Oak door no longer gets stuck when the last scrap scene is cut short
- Tom: no way to knock at the old oak tree, stuck in the game.
- Cause: `ch6-scraps` is only set at the end of the third dig scene (`ch6DigScene`). If that scene was cut short (app closed, old save), all three `ch6-dig-*` flags exist but `ch6-scraps` does not, so the door said "We have 3 of 3 scraps" forever and never offered a knock.
- Fix: `ch6Knock` (data/scenes.js) sets `ch6-scraps` itself when all three digs are recorded, and opens with a recap (TAP TAP, SCRATCH, CHITTER). Repro and fix checked headless; smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone.

## 2026-10-30: Rose Mode spends stamps and polish, and wears the best gear, by itself
- Tom: Rose cannot pick stamps and polish, so level ups must apply Auto-Stamp automatically; best gear must go on whenever a new item arrives (gift, win, purchase) or a character joins.
- Rose Mode only (Grace and Director Mode unchanged). `engine/progress.js`: `roseAuto()` is true when `B7.diff==='rose'`; `b6GainXp` and `b6Sync` run `b6AutoStamp(m,true)` after every level up (stamps, Polish ranks, Remix unlocks; `force` ignores the OPTIONS "spend" switch). Members who catch up while away are covered by `b6Sync`.
- `engine/menu.js`: `autoGear(list)` equips `bestFor` in every slot and returns toast sentences ("Grace wears the Hoodie."). Called from `grantItem` (data/party.js, covers story gifts and souvenirs), `buyItem` (shop), both battle drop paths (engine/battle2.js, engine/feel.js), `recruitJoin` (engine/followers.js, also silent story joins) and `chapterJump`.
- Catch-up: switching to Rose Mode (`b7SetDiff`) and loading a save in Rose Mode spend whatever is waiting and dress everyone.
- Test: Grace Mode level up leaves points unspent and gifts in the pocket; Rose Mode spends all Polish Points and stamps the route, wears gifted and bought gear, and Amy joins wearing her best set. Smoke FAILS: []. Cache tag `rose1` on the 8 changed scripts. Not yet seen on Tom's phone.

## 2026-10-30: Jojo (TNB's sister) painted, in the overworld, and in Round with Jojo
- Tom sent a painted sheet made from his photo of her: 12 walk frames (down, up, left, right) and 8 disc golf poses (run, x-step, reach-back, release, follow-through, two cheers, high-five).
- `tools/sprite-bake/bake_jojo.py` (source `tools/sprite-bake/src/jojo-sheet-v1.png`) slices and bakes it: `art/chars/jojo-ow.webp`, `art/chars/jojo-bt.webp`, `data/jojo-hires.js` (generated). The head is enlarged by hand (1.5 front and back, 1.4 side) to the family proportion; the auto-sizer reads her chin too high.
- `data/jojo-hires-use.js` (new, after Justin's): `OW.jojo` (the sheet's right-facing row is 'side', left is its mirror) and `JOJO_BT.draw` / `JOJO_BT.drawOw`, which draw the painted battle and walk frames and mirror them to face the wanted way.
- Overworld: Jojo is an NPC in TNB's Loft (`data/maps-la.js`, map `lofts`, 8,6; wanders like the other NPCs), four first-visit lines that say she is TNB's sister and one that mentions Sunday disc golf, four revisit lines. Her lines have no baked voice (silent until baked).
- Battle: Round with Jojo (TNB B3, unchanged numbers and name) now draws her painted frames in `SC.t6_jojo` (`engine/tnb-moves.js`): walks in, reach-back while she lines it up, x-step, release at the throw, follow-through, a hop at CHAINS, a high-five, walks out. The drawn stand-in stays as the fallback while the art loads. The disc now leaves her hand; the on-screen line at the end says "slow high-five" instead of "thumbs up"; NICE sits above her head.
- Test: `tools/jojo_test.py` (new, 0 fails), `tools/loft_test.py` 0 fails, `kit_test tnb --only=round_with_jojo` at 1x and 2x 0 fails, smoke FAILS: []. Cache tags `jojo1` on maps-la.js, tnb-moves.js and the two new scripts. Not yet seen on Tom's phone.
- Not done: Jojo has no portrait for the dialogue box and no recorded voice; the 'run' and 'celebrate 1' battle frames are baked but unused (room for a "Fore!" call-in).

## 2026-10-30: Stamps screen rows slimmed down and enlarged
- Tom: remove extra info (Primary, the Remix description line, A1), make the remaining text bigger, and fold Polish and Remix into the check on the left instead of separate buttons.
- Rows now show: name, LV, VP, element, description. Gone: the PRIMARY/REMIX tag, the "Remix: ..." line, the A1 slot code, the BASIC/SIGNATURE tag. Text sizes up (title 14 to 17, description 11 to 13, tags 9 to 11).
- The circle on the left is the main button: tap to STAMP (shows the SP cost), and once stamped a cyan "+" badge means tap to POLISH. UNDO, REMIX and SWAP are small buttons beside the move name. Remix is not folded into the circle: it is rare (Lv 28+) and spends a ticket, so it keeps a small confirm button.
- `b8Row` in `engine/progress.js`, `.sc-*` styles in `index.html`; cache tag `progress.js?v=stamps2`. Smoke FAILS: []. Not yet seen on Tom's phone.


## 2026-10-29: Dizzy stars over knocked-out characters line up with the new sprites and get the painted star style
- Tom: "in chapter 2 when people have stars over their head it's not aligning correctly because we changed the character sprites, and the star style should match the updated style of the game." The stars are the dizzy ring over a character at 0 HP (`koDizzy` in `engine/battle-draw.js`, used in every fight). It found the head as "the top six rows of the sprite", which was right for the old kneeling pose and wrong for the new painted KO poses (lying on the back, head to one side), so the ring floated off to the side or above the feet.
- Fix: new `KO_HEAD` table in `engine/battle-draw.js` with the measured head position of each painted KO pose (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara), as [column, top row] on the sprite as authored; the family are mirrored in the fight and Nara is not, and the code accounts for that. A pose with no entry still falls back to the old top-rows guess. A NEW KO POSE NEEDS ITS HEAD ADDED TO `KO_HEAD`.
- Style: the blocky 5x5 pixel stars are now smooth five-point gold stars with the game's dark round outline (`OUT`), a light-to-amber gradient, a white glint, a slow spin, a soft glow under the ring, and an occasional twinkle. Same orbit and timing as before, back stars smaller and dimmer.
- Cache tag bumped (`battle-draw.js?v=kostar1`).
- Checked: each of the eight characters knocked out alone, close-up before and after (stars now ring the head for all eight); smoke FAILS: []. Not yet seen on Tom's phone. If a ring sits too high or low on one character, change that character's row in `KO_HEAD`.
## 2026-10-29: Casa Alvarez opened up (23 to 42 walkable tiles)
- Tom: the Casa Alvarez grid should be about 3x as navigable. Result is 1.8x: the painted plate is mostly furniture and closed rooms, and the walk mask can only use floor that is drawn.
- `plateMask` in `data/maps-la.js` (map `casa`): added the bunk room (row 2, x 9 to 12, through the gap past the kitchen desk), the foyer's second column (8,7), and the front yard strip (row 10) on both sides of the steps, reached through (5,9) and (8,9). Exits stay at (6,10) and (7,10).
- Kevin moved from the dining room to the bunk room (11,2) so the crowd spreads out. New inspect object: Bunk bed (10,1, 3 wide).
- Still closed because the painting has no doorway: laundry, bath, back hall, bedroom. Reaching 3x needs a new plate with wider floor or painted doorways there.
- Test: `tools/casa_test.py` 0 fails (new checks for bunk, yard, foyer column); smoke FAILS: []; townsfolk and ch12 tests 0 fails. Cache tag `maps-la.js?v=casa2`. Not yet seen on Tom's phone.

## 2026-10-29: Bready Mercury on Tom's kitchen island
- Tom: Bready Mercury should be visible in the game world, e.g. sitting on the counter, using the starter move art as the reference. The painted house plate had an empty island.
- Done (draw only): `drawBreadyJar` in `engine/plate.js`, called from `plateLive` for map `tomhouse`. Same jar as the starter moves (glass, cream starter that bubbles, gold lid, MERCURY label with a tiny face and mustache), plus a small crown. Sits left of the sink, drawn over the painting and under the actors.
- Story gating: hidden only in chapter 6 until `ch6-clear` (the squirrels have him), back from the Oak boss on and in every other chapter. The island's inspect text follows it (`when` variant in `data/maps-la.js`): empty round spot in the flour and tiny footprints while he is gone, Bready by the sink otherwise.
- Cache tags bumped (`plate.js?v=bready1`, `maps-la.js?v=bready1`). Test: new `tools/bready_test.py` 0 fails; smoke FAILS: []. Zoom in `tools/shots/bready-zoom.png`. Not yet seen on Tom's phone. To move or resize, change the two numbers in the `plateLive` call (position 606, 499 and scale 1.2).
- Not done: other places Bready could appear (the ch8 bakery rack, Tom's Long Island side). The Oak crown already shows the jar on the hoard.

## 2026-10-29: Enemy hurt frame holds longer
- Tom: the enemy's damage frame flashed too quickly. The hurt frame only showed while the hit's shake or flash timer ran (about 0.35 s for most hits), and the white flash lasted 0.16 s.
- Fix in `engine/battle2-ui.js` (`b2FoeFrame`, `B2_HURT_HOLD` = 700 ms): once a hit starts, the hurt frame is held for at least 0.7 s, for every move, since it is decided in one place. White flash on a plain hit raised from 0.16 s to 0.3 s (`engine/battle2.js`, `engine/battle2-traits.js`). Party member flash unchanged.
- Checked: hurt frame measured on a painted Grump, last hurt frame at 710 ms, idle at 727 ms (was about 350 ms); smoke FAILS: []. Not yet seen on Tom's phone. To tune, change `B2_HURT_HOLD`.

## 2026-10-29: More distance when Tom talks to someone
- Tom: "when approaching a character and talking to them, there should be a bit more distance between them. Currently they are almost touching." Tom and a neighbor stand on adjacent tiles and the painted figures are drawn wider than a tile (1.2x outdoors, 1.98x in rooms), so they touched.
- Fix (draw only): `talkGapFrame` and `drawActorSpaced` in `engine/town-render.js`, called from the actor loop in `engine/draw.js`. While Tom faces a neighbor, or is in a dialogue with one, Tom and the neighbor are eased 9 px apart sideways or 11 px apart up and down (more, because tall figures overlap that way). Tom's followers move with him so nobody is crowded from behind. It eases in and out in about a quarter second. Tiles, collision and interaction are untouched. Monsters and the TNB kiss get no gap (the kiss lean stays as it was).
- Cache tags bumped (`town-render.js?v=gap1`, `draw.js?v=gap1`) so the phone reloads them.
- Tests: new `tools/talkgap_test.py` (all four approach directions, held during dialogue, eases back to zero, tiles unchanged, no page errors) 0 fails; smoke FAILS: []. Zoomed before/after in `tools/shots/talkgap-compare.png`. Not yet seen on Tom's phone. If it is still too close, raise `TALK_GAP_X` and `TALK_GAP_Y`.
## 2026-10-29: Chapter 1 intro, Tom no longer shrinks when he stretches
- Cause: the painted stretch frames (`TOM_STRETCH`, art/chars/tom-stretch.webp) are the same body size as his walk frames (k 3, about 42 rows), but `drawStretchPainted` and the old pixel fallback in `engine/intro.js` drew them at scale 1 while the walk sprite is drawn at `actorK()` (1.2 on outdoor maps such as the opening Square). So Tom dropped to 83% height as soon as the stretch began and grew back after.
- Fix: both stretch drawers now use `actorK()*(OW.tom.k||1)` for the sprite, shadow, bob and the `~` puffs.
- Checked: before/after frames of all poses against the walk sprite after the stretch (same height); smoke FAILS: [].

## 2026-10-30: Justin on the welcome screen
- `SPLASH_SPOTS` in `engine/splash.js` gets Justin (x 630, feet 1150, h 330): he stands just behind Amy and Deedee, listed second (after Nara) so everyone else draws over him, which leaves his head and shoulders showing above the row. He is the tallest figure on the page. Portrait only (landscape shows the title only). No spoken lines changed.
## 2026-10-29: Painted Justin (overworld)
- Tom sent Justin's walk sheet (3 rows of 4, magenta) with the word "Justin" and then: head to body ratio like TNB and Boppy, a bit taller than everyone (6'5" in real life). Installed as the painted overworld set `OW.justin` (replaces the old traced set; the ch5 map NPC and the ch10 ending spawn both use `sheet:'justin'`).
- `tools/sprite-bake/bake_justin.py` (copy of bake_ellie.py) writes `art/chars/justin-ow.webp` and `data/justin-hires.js`; `data/justin-hires-use.js` wires it (tags added in `index.html` after ellie-hires-use). The sheet's head was 26 percent of his height, so the baker solves a head factor per view (front 2.07, back 2.27, side 1.80) to put hair-to-chin at 0.42 of the figure front and back and 0.40 in profile (TNB 0.433, Boppy 0.40), tapered below the chin. Pink hair-tip halo pulled out (`despill_pink`).
- Height: 53 rows (Tom, TNB, Boppy, Amy 42; Michael 50), so he is the tallest in town. Body not widened. Canon updated (docs/CANON.md).
- Tests: new `tools/justin_test.py` (taller than Michael and Tom, shows in the Gregori house in all four facings, shots `tools/shots/justin-*.png`) 0 fails; smoke FAILS: []. Not yet played on Tom's phone. No battle sheet yet (Justin is not a party member).
## 2026-10-29: Painted plate for the Finish Line (chapter 19, Amy's memory room)
- The Finish Line (map id `memamy`, 16 x 11 tiles at 64 px, `art/memamy.webp` from `68_memamy_final.png` and `68_memamy_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` (`engine/plate.js`); the room is a planMerge area so the cast draws at 1.2x. `plateMask` in `data/maps-ch19.js` is the walk map: the red track rows 4 to 6 (cols 1 to 13), row 7 cols 6 to 13, a strip behind the pedestal on rows 2 and 3 (cols 9 to 12), the stone apron and rug (cols 7 and 8, rows 8 and 9). Blocked: the back wall, bleachers (cols 1 to 6, rows 2 to 3), the pedestal (7 to 8, row 3), the top tape pole (13, rows 2 to 3), the finish tape and its pole (cols 14 to 15, rows 3 to 7), the plants and bricks along the bottom wall, the left railing and crates.
- Objects re-laid, text unchanged: bleachers (1,2) 6x2, race clock (10,0) 4x2 (hangs on the wall, touched from row 2), cones (4,5) and (10,5), hurdle (6,5) 2x2, finish tape (14,3) 1x5. Pages moved onto the painted pages: amy1 (3,4), amy2 (8,6), amy3 (11,3). Keepsake pedestal (8,3). Pages and the pedestal stay live (`liveKinds`) so they dim and fill. The door is now two tiles, (7,10) and (8,10), both to the hub (20,4); the hub's Amy door still lands you at (8,9).
- Tests: new `tools/memamy_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop, page and the pedestal, both door tiles walk out by key, a room walk, shots `tools/shots/memamy-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; the painted pages keep their painted glow after they are read; Tom has not checked it on his phone. With this, all four memory rooms are painted.
## 2026-10-29: Painted plate for the Forever Engine (chapter 20 finale)
- The Forever Engine (map id `foreverheart`, 22 x 15 tiles at 64 px, `art/foreverheart.webp` from `foreverheart_final.png` and `foreverheart_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` with `actorScale` 1.98 (area maps count as outside, so it is ignored there). Spawn (10,12) and both lift exits (10,14) and (11,14) unchanged.
- `plateMask` in `data/maps-ch20.js`: only the round floor walks (rows 8 to 10 across, row 7 along the front of the Engine base so you can stand under the Leviathan at (11,5) and Julian at (11,6)), plants and gate posts block, the gate lane (cols 10 to 11, rows 12 to 14) walks to the lift doors.
- Objects re-laid, text unchanged: Engine (7,0) 8x7, gears (4,5) and (15,5) 3x3, clocks (2,0) and (18,0) 2x8 (tall boxes so they are touchable from row 8), plants (3,10) and (17,10) 2x2. No live props; the painting is static (the old "runs warm once Julian is calm" glow on the tile Engine is not drawn on the plate).
- Tests: new `tools/foreverheart_test.py` (objects touchable, spawn and both lift doors walkable, A opens all eight props, both lift doors by keys, held-key edge walks, shots `tools/shots/foreverheart-*.png`). smoke FAILS: []; ch20_test FAILS [].
## 2026-10-29: Painted plate for the Dead-Letter Office (chapter 19 hub)
- The Dead-Letter Office (map id `deadletter`, 26 x 17 tiles at 64 px, `art/deadletter.webp`, entry in `PLATES`) now uses Tom's painting (files `deadletter_final.png` and `deadletter_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the strip under the doors (row 4), lanes round both belt ends (column 2 and column 23), the open floor (rows 7 to 12) and the gate opening and stairs (columns 12 and 13, rows 13 to 16). Blocked: the back wall, the gear boxes, the parcel table, the bucket and parcel stacks by the benches, the crates along both side walls, the railings and planters.
- The four memory doors moved from the corners to the painted north wall, left to right Rose (amber, clock), Grace (blue, hand), Amy (green, runner), TNB (pink, vase). Each door is two portal tiles on row 3: Rose (2,3)(3,3), Grace (5,3)(6,3), Amy (19,3)(20,3), TNB (22,3)(23,3); you arrive from a room on row 4 under its door, facing down. `CH19_ROOMS` door and back fields updated; the four memory rooms' exits land on the new arrival tiles. Spawn stays (12,14); the Censor still rises at (12,9).
- Objects re-laid, text unchanged: Claim Desk (10,5) 6x2, belts (4,5) 6x1 and (16,5) 7x1, sacks (6,7) and (18,7) 2x2, ledger stand (15,9) 1x2, benches (6,9) 4x1 and (16,9) 5x1, big stamp (24,5) 2x4, lamps (8,3) and (17,3) touched from row 4. Two hub monster spots moved off the railings: (5,14) to (4,11), (20,14) to (21,11).
- Tests: new `tools/deadletter_test.py` (objects touchable, spawn, Censor spot, bell tile and all four arrivals walkable, A opens every prop, all four doors and the stairs by keys, both lanes by keys, shots `tools/shots/deadletter-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; on row 4 the party stands close over the back edge of each belt; Tom has not checked it on his phone.
## 2026-10-29: Painted plate for the Stillness Core (chapter 20)
- The Stillness Core (map id `stillcore`, 26 x 17 tiles at 64 px, `art/stillcore.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (files `stillcore_final_1.png` and `stillcore_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch20.js` is the walk map. The gate at the bottom opens onto a fenced causeway (cols 13 and 14) up to the Engine lift on the central dais; row 13 is the wide floor in front of the dais, and its two rail tiles (cols 12 and 15) are left open so the causeway joins the floor (the painting fences it off with no way round).
- Exit and arrival tiles moved to the painted gate: exits (13,16) and (14,16) (were 12,16 and 13,16), spawn and the Vault lift arrival (13,14) (was 12,14), the Forever Engine's return exits land at (13,15) and (14,15). `data/scenes-ch20.js` places Tom at (13,14) in both places.
- Doors re-laid to the painting (3 x 2 touch boxes, same names and puzzles): upper row Tom (3,3), Grace (7,3), Rose (17,3), Amy (21,3); lower row Deedee (3,7), Boppy (7,7), TNB (17,7), Nara (21,7). The lower doors are touched from row 9. The upper doors sit on shelves with no stairs painted, so the shelf (row 5) is reached by the stone pillars at cols 6 and 20 (rows 5 to 8), which walk like a ladder. Lift (12,10) 4 x 2, touched from (13,12) or (14,12). Coffee urn (2,10), plant (4,11), bench (1,12).
- Doors and the lift are live over the painting (`liveKinds: ['cedoor','celift']`): `engine/ch20-render.js` draws only what changes, a glow in the member's colour over an open door, and on the lift dais eight lamps (one per open door) plus a gold glow once all eight are open. The old code-drawn brass doors are gone on this map.
- Removed (painted, out of reach): the two wall gears and the Core clock objects, so their prop text is gone. Added one prop for the painted little white box at (21,12): "Little white box" (SPARE MINUTES, an empty slot). Prop text, not spoken; no clips affected.
- Tests: new `tools/stillcore_test.py` (every object touchable, arrival and exit tiles walkable, A opens all eight doors, the lift, coffee, plant, bench and box, both pillar climbs and the causeway walk by real keys, the gate returns to the Vault, doors and lift light up, portrait and landscape shots `tools/shots/stillcore-*.png`) 0 fails; `tools/ch20_test.py` and `tools/smoke.py` see the log below. Known roughness: the open-door glow is a round disc over an arched door; the pillar "ladder" has no ladder drawn on it; the minimap still draws the old tile look.
## 2026-10-29: Painted plate for the Shoulder Hall (chapter 19, Rose's memory room)
- The Shoulder Hall (map id `memrose`, 16 x 11 tiles at 64 px, `art/memrose.webp` from `memrose_final.png` and `memrose_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` (`engine/plate.js`); the room is a planMerge area so the cast draws at 1.2x. A `plateMask` in `data/maps-ch19.js` is the walk map: the carpet rows 3 to 9, cols 1 to 14. Blocked: the back wall (rows 0 to 2, the two tall lamps and a new candle stand talked to from row 3), the step stool (5,5), the ribbon coil (2,5) 3x2, the pillow fort (9,4) 5x3 with its roof at (11..13,3), the coat rack (14,2) 1x5, col 0 and col 15. The doorway is both posts' gap: exits at (7,10) and (8,10) to the Dead-Letter Office.
- Objects re-laid to the painting: lamps (4,1) and (10,1), coat rack (14,2), ribbon (2,5), stool (5,5), fort (9,4), new prop `candle` (7,1) ("Candle stand", one new line, not spoken). The three pages sit on the painted pages: rose1 (5,3), rose2 (10,7), rose3 (5,8) (were 2,4 / 12,7 / 6,8). The keepsake pedestal moved from (8,3) to (7,5), the open middle of the carpet, so row 3 stays a through lane to the east lamp. Pages and pedestal stay live over the painting (`liveKinds:['dlmem','dlkeep']`) because they change when read and when the keepsake goes down.
- Tests: new `tools/memrose_test.py` (every object touchable, ch19 stand tiles walkable, A opens every prop, both door tiles walk out with real keys, row 3 walk, portrait and landscape shots `tools/shots/memrose-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; a player standing at (10,3) overlaps the fort roof; the painted pages stay faintly visible under a read (dimmed) page.
## 2026-10-29: Painted plate for the Kiln Room (chapter 19, TNB's memory room)
- The Kiln Room (map id `memtnb`, 16 x 11 tiles at 64 px, `art/memtnb.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (files `memtnb_final.png` and `memtnb_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the open floor between the kiln and the wheel, the strip in front of the cup shelf (row 2), the lane down to the door rug. Blocked: the two wall rows, the kiln and its control panel, the barrels, the clay bags, the workbench and bucket, the flower table on the left, the big jar on the right, the railings.
- The door is now the rug at the bottom of the stairs: exit (6,10), spawn (6,9) (was 8,10 and 8,9). The hub's east door lands at (6,9).
- Objects re-laid onto the painting: kiln (2,2) 3x3; shelf of cups (6,1) 4x1 (touched from row 2); clay bags (10,2) 2x2 (touched from 9,2); wheel (10,4) 2x2; stool (9,5); tool rack moved from the floor to the right wall and bench (12,3) 3x3 (touched from 12,6 facing up); keepsake pedestal (7,3) on the painted glowing stand; pages at (1,5) on the left crate, (6,2) by the shelf, (14,6) on the right stand. The pages and the pedestal are `liveKinds` so they dim when read and show the cup once placed.
- Two page descriptions and the tool rack's opening words changed to match the painting (prop text, not spoken; no clips affected): tnb2 "A page on the little stand by the jars...", tnb3 "A page propped against the shelf...", tools "Over the bench, ribs, loops and wire...".
- Tests: new `tools/memtnb_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop and page and the pedestal, walking down the rug returns to the hub, the hub door lands on the rug, shots `tools/shots/memtnb-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: the painted pages keep their painted glow after they are read (only the live page sprite dims); minimap still draws the old tile look.
## 2026-10-29: Painted plate for the Loom Chamber (chapter 18)
- The Loom Chamber (map id `towerpinnacle`, 22 x 15 tiles at 64 px, `art/towerpinnacle.webp`, entry in `PLATES`) now uses Tom's painting (files `towerpinnacle_final.png` and `towerpinnacle_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch18.js` is the walk map: the floor in front of the Loom (rows 6 to 10, between the two display cases), the full-width band on row 9, and a narrow way between the balustrades through the gate to the lift stairs (rows 11 to 14, x 8 to 13 then 9 to 12). Blocked: the Loom and its gears, both clocks and the side platforms, both display cases, both plants, the balustrades, the glass walls.
- Objects re-laid as touch boxes: Loom [6,1,10,5] (touch from row 6), clocks [3,1,3,5] and [16,1,3,5] (touch from (5,6) and (16,6) facing up), cases [2,6,3,3] and [17,6,3,3], plants [1,10,3,3] and [18,10,3,3]. Spawn (10,12) and the lift exits (10,14), (11,14) unchanged. Vance's spot moved from (10,5) to (10,6) so he stands on the floor at the Loom's rail.
- Tests: new `tools/towerpinnacle_test.py` (objects touchable, spawn, exits and Vance's spot walkable, plate live, A opens every prop, row 9 walks end to end by keys, the Loom blocks, walking down through the gate reaches the vault, portrait and landscape shots `tools/shots/towerpinnacle-*.png`) 0 fails; `tools/ch18_test.py` 0 fails; `tools/smoke.py` 0 fails. No spoken line changed. Known roughness: minimap still draws the old tile look.

## 2026-10-29: Four story characters painted (Marlowe, HUSH-9, Mr. Pistachio, Julian Vance)
- Sheets `tools/sprite-bake/src/{marlowe,hush9,pistachio,vance}-walk-v1.png` added to `CAST` (heights 43, 40, 40, 42). Names from Tom's file-names screenshot (HUSH-9 Subway Car, mrpistacchio, monochromemarlow, julianvance).
- Marlowe, HUSH-9 and Mr. Pistachio are spawned by scenes (`storySpawn`), not placed on maps, so `TOWN_PAINTED` matches them by name AND the look they are spawned with (`marlowe`, `hush9`, `bun`). Mr. Pistachio is spawned with the stand-in look `bun` (ice cream bonus), so Bun keeps her own art. `tools/townsfolk_test.py` now also spawns these three in Casa Alvarez and checks they draw painted.
- Julian Vance is registered as `OW.vance` only. He has no walking appearance in any scene yet (battle monster and a voice in the camera), so nothing in the game shows him until a scene spawns him with that set.
- Checks: `tools/townsfolk_test.py` 0 fails, smoke 0 fails.
## 2026-10-29: Painted plate for the Gym Floor (chapter 19, Grace's memory room)
- The Gym Floor (map id `memgrace`, 16 x 11 tiles at 64 px, `art/memgrace.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (`memgrace_final.png` and `memgrace_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the floor is rows 2 to 8 between the left bench and the bleachers; the beam blocks row 4 from col 3 to col 11, walked round at col 2 or col 12; the entrance mat is row 9 cols 6 to 9 down to the door at (8,10).
- Objects re-laid to the painting: beam (3,4) 9x1; scoreboard (6,1) 4x1, touched from row 2; chalk cart (1,3) beside the bench, touched from (2,3) facing left; folding chair (14,5) 2x2, touched from (13,6); trophy shelf (11,1) 3x1; pages at (5,2), (12,6), (2,7); keepsake pedestal (10,2) on the painted brass stand, touched from (10,3). Pages and pedestal are `liveKinds`, drawn over the painting so they dim and glow with the story.
- One object description reworded because the page moved: grace2 was "tucked against the foot of the beam", now "tucked in by the bleachers". Not a spoken line, no clip affected.
- Tests: new `tools/memgrace_test.py` (objects touchable, stand tiles below each page and the pedestal walkable, A opens every prop, the door exit by key, the walk round the beam by keys, portrait and landscape shots `tools/shots/memgrace-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; Tom has not checked it on his phone; the other three memory rooms (memrose, memamy, memtnb) are still tiled.

## 2026-10-29: Painted plate for the Shelf Hall (chapter 17)
- The Shelf Hall (map id `towershelves`, 28 x 14 tiles at 64 px, `art/towershelves.webp`, entry in `PLATES`) now uses Tom's painting (files `towershelves_final.png` and `towershelves_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch17.js` is the walk map: one long aisle along row 5 in front of the three north cases, and a wider strip (rows 6 to 8) with three benches. Blocked: the wall, all six cases, both small cases, the lift, the coffee cabinet, the vault door, the benches, lamps and plants, and everything south of row 8.
- Shelves re-laid to the painted cases: `CH17_SHELVES` is now `[x,y,w,h]` (was `[x,y]`, always 4 x 2): shelf 1 (3,2) 5x3, shelf 2 (9,2) 6x3, shelf 3 (16,2) 5x3, shelf 4 (2,9) 7x4, shelf 5 (10,9) 7x4, shelf 6 (18,9) 7x4. North shelves are touched from row 5 facing up, south shelves from row 8 facing down. The gold light column in `engine/ch17-render.js` now rises from the middle of each case.
- Other objects moved to the painting: the way back to the stairs is the round vault door on the west wall (0,4) 1x2, reached from (1,5), and the party now arrives at (1,5) from the stairwell hatch (was (1,6)); the express lift (25,2) 3x3; the coffee machine (23,3) 2x2; the two small cases (1,6) 3x3 and (25,6) 2x3. Spawn moved from (2,6) to (2,5).
- Two lines of flavor text had no reachable home on the painting (the wall clock and the hall sign are above the cases), so they now live on two of three new velvet benches (6,7), (11,7) and (17,7): the clock line "THIS IS FINE", and the hall sign's PLEASE DO NOT TOUCH text. The third bench has a new line. No spoken lines changed, no clips affected.
- Tests: new `tools/towershelves_test.py` (objects touchable, spawn, arrival and monster spots walkable, A opens every prop, the whole aisle walks end to end by keys, portrait and landscape shots `tools/shots/towershelves-*.png`) 0 fails; `tools/subdepot_test.py` and `tools/smoke.py` 0 fails. In `tools/ch17_test.py` the six-shelf smash loop uses the new footprints and all six smash. The later steps of ch17_test (back at the stairs onward) were already failing before this change, on an unmodified checkout, so they are not caused by it. Known roughness: minimap still draws the old tile look; the monsters (Curators, Paperweights, a Pause Sprite) roam in the aisle and can stand in row 5.

## 2026-10-29: Under the Amber is painted (chapter 13 cavern)
- Tom's painting of the chamber at the end of the Sub-Rail (`art/subchamber.webp`, 1664 x 896, 26 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). He sent the final plus grid pair (`subchamber_final.png`, `subchamber_grid.png`).
- `data/maps-ch13.js`: new `plateMask` for `subchamber` (rock walls, the amber wall, the two rubble piles on the north wall, the left pile, the barrel pile, the lower-right pile and both tripod lamps block; the rails, the open floor and the tunnel mouth walk). Objects re-laid onto the painted piles and lamps, text unchanged. The way back to the tunnel is now the painted tunnel mouth (exits at 1,3 and 2,3, top left); the painted tunnel's east doors (34,2 and 35,2) land at (3,4) and (3,5), and the tunnel mouth returns to (33,3). Spawn (3,4). The Drill Worm stays at (12,6).
- The painted amber wall is further right than the old tile wall, so the coin melt moved: the glass doorway is tiles (21,5) and (22,5) (was 20,6 and 20,7). `data/scenes-ch13.js` (positions only, no spoken lines changed): Nickel arrives from the tunnel mouth along the rails; Sal and Penny stand behind the glass at (22,4) and (21,4) and walk out through the doorway to (18,7) and (18,6) (the two swapped sides). `storyWorld` reopens the new doorway tiles.
- `engine/ch13-render.js` `ch13PlatePainted` (replaces the old tint rectangle on the painted map): until the melt, a veil of the painting is laid back over the glass so Sal and Penny read as behind it; gold runs down the glass during the melt, then the doorway glows softly and stays lit.
- The exit-tile wall bug (pools laid over exits made the Sub-Rail exits solid) was fixed in `engine/world.js` `buildArea` by a parallel session in the same hour; that version is kept. The chamber's exits also walk through its `plateMask`.
- Tests: new `tools/subchamber_test.py` (objects touchable, tunnel mouth and worm spot connected, tunnel round trip, doorway blocked until melt, the melt scene with Sal and Penny walking out, shots `tools/shots/subchamber-*.png`) 0 fails; `ch13_test.py`, `gate00_test.py`, `blvd_test.py`, `bg_test.py`, `ch11_test.py`, `smoke.py` 0 fails.
- Known roughness: the minimap still draws the old tile look; the pocket behind the glass is only painted, not walkable.
## 2026-10-29: Painted plate for the Tower Stairwell (chapter 17)
- The Stairwell (map id `towerstairs`, 18 x 42 tiles at 64 px, `art/towerstairs.webp`, entry in `PLATES`) now uses Tom's painting (files `towerstairs_final.png` and `towerstairs_grid.png`, sent with no text, so treated as "install this plate"). `plateMask` in `data/maps-ch17.js` is the walk map: eight one-row-deep landings (floors 2, 12, 15, 18, 21, 24, 27, 30) joined by the painted flights. Floors 2, 12 and 15 have no visible flights in the art, so the far right column (x 16) walks as the connection between them.
- Floor numbers follow the painting: 2, 12, 15, 18, 21, 24, 27, 30 (were 2, 6, 10, 14, 18, 22, 26, 30). Sign texts were carried over to the new numbers; coffee machines are now on floors 2, 12, 18 and 24 (were 10, 18, 26), so there are four restore points. New prop: the open wall safe on floor 12 (`glsafe`, new text). The brass plate text on floor 30 is merged into the floor 30 sign.
- Moved: lobby door arrival (4,39) and (5,39); exits (2,39) and (3,39) (the painted door); spawn (4,39); the hatch is now (14,2), the sealed door (10,2) 3x1; the landing scene area is [2,3,14,3]; the girls wait at (4,3) and (6,3); returning from the Shelf Hall arrives at (13,3). Stair monsters re-spotted: (10,39), (9,34), (9,29), (10,23), (7,19), (6,13), (6,8). `tools/ch17_test.py` coordinates updated. No spoken line changed.
- Tests: new `tools/towerstairs_test.py` (objects touchable, all landings and monster spots connected from the door, A opens every prop, lobby door and east door by real keys, right column walk, portrait and landscape shots `tools/shots/towerstairs-*.png`) 0 fails; `tools/smoke.py` 0 fails. `tools/ch17_test.py` fails from "back at the stairs" onward, same as before this change (pre-existing, not yet investigated).
## 2026-10-29: The Glass Tower lobby is painted (chapter 17, map `towerlobby`)
- Tom's painting of the lobby (`art/towerlobby.webp`, 1408 x 896, 22 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). Used the final plus grid pair (`towerlobby_final.png`, `towerlobby_grid.png`); the baked art is the grid-free final.
- `data/maps-ch17.js`: new `plateMask` for `towerlobby`. Rows 0 to 4 (window wall, back wall, desk, coffee cabinet, back planters), the lift wall on the left diagonal, both lounge benches, the corner planters and lanterns, and the glass fence block. The floor, both rugs, the gate doors (x 8 to 12, rows 11 to 13) and the east door mat walk.
- Exits: the east stair door is now tiles 21,7 and 21,8 (was 21,8 and 21,9); both stairwell doors land at 20,8 (was 20,8 and 20,9, which is now planter). South gate exits and spawn (10,11) unchanged.
- Objects re-laid to the painting (wall pieces are touched from the floor row below them): coffee machine (6,4) restore point, floor directory (7,4), desk (8,4), clock (10,4), desk (12,4), frames (15,4) 3x1, plants (5,4) (14,4) (4,11) (17,11), benches (1,7) 3x3 and (17,8) 3x2 plus (18,7), three lift doors (1,6) (2,5) (3,4), stairs sign (20,6). Object text is unchanged except two: the clock and the second desk (new line: pen cup, guest book, empty chair, signatures timed 4:59). Hint now says "through the east door". No spoken lines changed.
- Test: new `tools/towerlobby_test.py` (every object touchable, stand tiles connected, text opens, desk blocks, walk up from the gate, east door to the stairwell, both stairwell doors return to walkable floor, south doors to the boulevard, portrait and landscape shots). smoke, blvd, gate00, loftlobby tests 0 fails.
- Known, pre-existing (same 11 failures on the code before this change): `tools/ch17_test.py` fails from "back at the stairs" onward (Shelf Hall to Vault part of the script). Not touched.

## 2026-10-29: Eight more painted townsfolk, Los Angeles (Ryan, Dakota, Sam, Jordan, Dona Carmen, Miss Odette, Priya, Sofi)
- Sheets `tools/sprite-bake/src/{ryan,dakota,sam,jordan,carmen,odette,priya,sofi}-walk-v1.png` added to `CAST` (heights 42, 37, 38, 43, 38, 36, 39, 36). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`. All matched BY NAME (`TOWN_PAINTED`); the look keys for Dona Carmen and Miss Odette are `carmen` and `odette`.
- Checks: `tools/townsfolk_test.py` (55 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Painted plate for the Vault (chapter 17)
- The Vault (map id `towervault`, floor 59, 22 x 14 tiles at 64 px, `art/towervault.webp`, entry in `PLATES`) now uses Tom's painting (files `towervault_final.png` and `towervault_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch17.js` is the walk map: a ring round the snow globe (row 3 in front of the lift, side lanes at columns 7 and 14, the row 9 apron, the wide row 10 in front of the cases), the stairs carpet down to the lobby, and a lane down the east wall (column 20) that leads to the coffee table behind the north-east case.
- Objects re-laid to the painting: snow globe (8,5) 6x4, Pinnacle lift (10,1) 2x2, cases (3,3) 4x3, (2,6) 4x4, (15,3) 3x3, (16,6) 4x4, Archive bench (3,11) 4x1, coffee machine (17,2) 2x1, freight lift sign (18,11) 2x2. Object text unchanged. The Twin Lenses still hover at (10,4) over the globe and are talked to from (10,3); the lift arrival tiles (10,3) and (11,3) are unchanged. No scenes or spoken lines changed.
- Tests: new `tools/towervault_test.py` (every object touchable, stand and arrival tiles walkable, A opens every prop, the stairs exit works, the east lane reaches the coffee machine, portrait and landscape shots `tools/shots/towervault-*.png`) 0 fails; smoke, `ch17_test`, `ch18_test` 0 fails. Known roughness: the minimap still draws the old glass tile look; characters draw at the outdoor scale (1.2x); the coffee lane brushes the east lamp pillar.

## 2026-10-29: Painted plate for the Sub-Rail Depot (chapter 13)
- Sub-Rail Depot (map id `subdepot`, 24 x 12 tiles at 64 px, `art/subdepot.webp`, entry in `PLATES`) now uses Tom's painting (files `subdepot_final.png` and `subdepot_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch13.js` is the walk map: the upper platform (rows 3 and 4), the lower platform (rows 8 to 10) and the track bed between them (rows 5 to 8, which walks like the old rails did). Blocked: the wall and stairs, Sol's desk and cabinets, both benches, the handcar, both piles of mail crates, the fence and lamp post at the far right, and the pit under the lower platform.
- Exits moved to the painting: the stairs up to the boulevard are now (1,4) and (2,4) (were the west edge), the tunnel mouth is (23,3) and (23,4) (were (23,7) and (23,8)). The tunnel's west exits now arrive at (22,3) and (22,4) on the platform. Spawn moved from (4,5) to (4,4).
- Objects re-laid to the painting: console (5,3) 4x1, route map (9,2), station sign (13,2), coffee machine (17,2) 2x1, work lamp (20,2), upper bench (14,3), handcar (12,5) 3x2, lower bench (14,8) 4x2, mail crates (1,9) 5x2 and (7,9) 4x2. Object text is unchanged.
- Story tiles moved off the track bed onto the platform: the chapter 13 opening now puts the party at (8,4) (was (8,5)), "GO DOWN" from the boulevard arrives at (3,4) (was (3,5)), and Nickel's walk in and out of the depot turns up to row 4 for his last three steps (`data/scenes-ch13.js`). No spoken lines changed.
- Tests: new `tools/subdepot_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop, both exits work by walking, the track bed crosses, portrait and landscape shots `tools/shots/subdepot-*.png`) 0 fails; `tools/ch13_test.py` and `tools/smoke.py` 0 fails. Known roughness: the minimap still draws the old tile look; characters draw at the outdoor scale (1.2x) like Flight Zero, because area maps count as outside.

## 2026-10-29: Rose hops off Tom's shoulders before a Tombo
- When Rose is riding Tom (Shoulder Ride) and any Tombo or Tom Family Finish starts, `b2Dismount()` in `engine/battle2-kind.js` ends the ride, plays a short hop from his shoulders back to her place in the line (about 0.6 s), shows a message, refreshes the RIDE badge, and only then does the normal step-out and animation begin. No effect when she is not riding. No spoken lines changed.
- Checked in headless Chromium: Tom + Rose (Double-Decker Airplane) and Tom + Grace (Squishy Delivery), portrait and landscape, ride ends, no page errors; frames looked at. Smoke 0 fails.

## 2026-10-29: Loading screen replaces the "The game did not load" card
- Cause: a 12 second watchdog in `index.html` showed the error card whenever the game had not started yet. The game loads 196 scripts (about 122 MB of baked voice), so a slow first load passed 12 s and the card stayed on screen even after the game booted.
- New `#boot` loading screen (navy, gold flower, moving bar, "Loading the town...") covers the stage immediately and fades out on the first frame (`js-running`). After 15 s it adds a "still going" line. The retry screen shows only if a game file fails to download (8 s grace) or 90 s pass with no start. It no longer links to the claude.ai artifact.
- Checked in headless Chromium: normal boot, 20 s delayed script (no error at 12 s, clears on boot), blocked `main.js` (retry shows). Smoke 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Mateo, Daisy, Kevin, Claudia, Yesenia, Tony)
- Sheets `tools/sprite-bake/src/{mateo,daisy,kevin,claudia,yesenia,tony}-walk-v1.png` added to `CAST` (heights 36, 38, 40, 38, 38, 38). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`. All matched BY NAME (`TOWN_PAINTED`). Tom's screenshot also listed "Magenta Teen Character Turnaround", not selected and not sent, so skipped.
- Checks: `tools/townsfolk_test.py` (47 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Fix: a beaten monster on a one-tile path no longer walls off the route (Whispering Marsh softlock)
- Bug (Tom): in the Whispering Marsh the monsters on the boardwalk blocked the only path, so the game was stuck for good. Cause: map monsters are solid NPCs and the marsh route is one tile wide in places (Bobber at 16,12 on the long boardwalk, Tangle in the neck at 10,8). Winning only puts the monster to sleep ("resting", 25 s, `defeatedUntil`) on the same tile, still solid, and it wakes and fights again, so Tom could never pass. From the entry platform only 15 of 50 walkable tiles were reachable.
- Fix: `engine/battle-draw.js` `canOccupy` now lets Tom and the party walk through a monster that is resting (`restingPassable`). An awake monster is still solid and still fights on touch. The tile map, spots and story scenes are unchanged.
- Same bug existed in 20 maps with monsters on narrow paths (worst: carbarn 24 of 111 tiles reachable, concourse 242/405, backlot 47/86, reeds 15/50); all are covered by the same rule.
- Test: new `tools/marsh_test.py` (awake monster blocks; dozing one is walked through, party follows; whole marsh route reachable; lists the maps a solid monster cuts). Marsh, pier, jpark, boards, oak, carbarn tests and smoke: 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Don Beto, Sol, Dash, Dolores, Marguerite, Nickel)
- Sheets `tools/sprite-bake/src/{beto,sol,dash,dolores,marguerite,nickel}-walk-v1.png` added to `CAST` (heights 42, 40, 40, 38, 38, 38). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`.
- All six matched BY NAME (`TOWN_PAINTED`) because `VILLAGERS` has entries for these looks. Nickel is a hidden shopkeeper, so the painted set is not visible in his shop.
- Checks: `tools/townsfolk_test.py` (41 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Painted plate for Flight Zero's cabin (chapter 11)
- Flight Zero (map id `flightzero`, 19 x 7 tiles at 64 px, `art/flightzero.webp`, entry in `PLATES`) now uses Tom's painting. A `plateMask` in `data/maps-p2.js` is the walk map: only the blue aisle (rows 3 and 4, x 1 to 17) walks. The window wall, the five back pods, the five front pods with their nightstands, both galleys, the cabin door and the drinks cart (x 11 and 12, row 3) block.
- Objects re-laid to the painting: back pods (2,1) 3x2, (5,1) 3x2, (8,1) 2x2, (10,1) 3x2, (13,1) 3x2; front pods (2,5), (8,5), (11,5), (15,5) 3x2, Rose's pod as seat (5,5), blanket (6,5), seat (7,5); cart (11,3) 2x1; door (17,3). Object text is unchanged.
- Spawn moved from (3,2) to (3,3), the aisle in front of Tom's back-left pod (the old tile is inside the painted pod). Changed in the map spec and the opening step in `data/scenes-p2.js`. The cabin scene stand tiles (Tom 6,4; girls 6,5 and 7,5; Amy 17,4) are unchanged and the scene plays through.
- Tests: new `tools/flightzero_test.py` (objects touchable, stand tiles walkable, A opens every pod, the cart and the door, the aisle walks end to end, portrait and landscape shots); `tools/ch11_test.py`, `tools/ch11b_test.py` and `tools/smoke.py` pass. Known roughness: the "sky tears pink" effect in the windows (`ch11-tear`) was drawn by the old tile look and is not shown on the painting; the minimap still draws the old tile look. No spoken lines changed.

## 2026-10-29: The Endless Concourse is painted (Terminal Infinity, chapter 11)
- Tom's painting of the Concourse (`art/concourse.webp`, 2560 x 896, 40 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). Sent as `concourse_final.png` plus `concourse_grid.png` with no text; treated as "install this plate".
- `data/maps-p2.js`: new `plateMask` for `concourse`. Blocked: the window wall and everything on the back wall (benches, boards, plants), both moving walkways (they are painted glass and no longer walk), the checkpoint wall (steep upper piece, arch, long lower diagonal), bins, the lower benches, the Lost and Found door, the lower-right benches and plants. Walks: the back carpet strip (row 5), the marble hall, the lower carpet, and the far-right strip (x 39, rows 5 to 9), which is the only way round the end of the right walkway.
- The checkpoint is now a one-tile lane at x 23, rows 5 to 9, under the painted arch. The Standby Sprite (23,6) fills it. The velvet rope object moved to (22,8) beside the lane.
- Objects re-laid onto the painting: five gate signs on the departure boards (Boston 3, Denver 8, Seattle 13, Chicago 22, Miami 27; row 4, touched from the carpet), Standby desk (17,4), three Boarding Gate swap benches (4,11), (19,11), (34,10), Lost and Found door (16,10) 2x2, jet bridge window (32,3) 3x2 (was a door), Gate Infinity (37,3) 2x2, four plants, luggage cart (8,11), three seat objects (two new lines: boarding pass for yesterday's flight to tomorrow; a folded newspaper with a blank date).
- West exits moved to (0,7) and (0,8), spawn to (1,8), and Gate 00's east exits now land at (1,7) and (1,8), because a painted bin sits on (1,6). Lost Luggage at (9,4) moved to (9,5) and the one at (27,5) to (27,9), because row 5 is a one-tile strip between the back wall and the right walkway. TNB and Nara arrive at (35,5) and (36,5) (the jet bridge is a painting now), and Julian Vance steps out of the Gate Infinity door at (37,4) and walks to (36,5) (`data/scenes-p2.js`).
- Tests: new `tools/concourse_test.py` (objects touchable, lane and all stands connected, sign text opens, west door and Gate 00 east doorway land on floor, real key-press walk up the lane and east, portrait and landscape shots) 0 fails. Updated stand tiles in `tools/ch11_test.py`, `tools/ch11b_test.py` and `tools/gate00_test.py` for the moved doors; `ch11_test`, `ch11b_test`, `gate00_test`, `reach_test.py concourse gate00` and `smoke.py` pass. No spoken lines changed (object text only).
- Known roughness: the moving walkways no longer carry anyone; the departure boards and wall plants are painted on the wall and are touched from the carpet below; minimap still draws the old tile look.
## 2026-10-29: Gate 00 is painted (Terminal Infinity, chapter 11)
- Tom's painting of Gate 00 (`art/gate00.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). He sent two pairs; the final plus grid pair (`gate00_final.png`, `gate00_grid.png`) was used because it is the one with the tile grid. Two grid-less alternate paintings were not used (one of them has a departures board listing Long Island, Los Angeles, Somewhere Else, A Little Later, Much Farther; it could be a later variant).
- `data/maps-p2.js`: new `plateMask` for `gate00` (window wall, podium and its posts, four benches and lamp tables, luggage cart, two plants, right console and the rails block; the marble aisle, carpet and the east doorway walk). Objects re-laid onto the painting: podium (text now starts "AREA 55, GATE 00", matching the painted sign), departure board, four bench rows, two plants, plus two new ones (yoga mat with thermos, luggage cart with WHEREVER and NOT MY BAG tags). Spawn (9,11) and the east exits (19,6) and (19,7) to the Endless Concourse are unchanged. The Concourse's west doors now both return to (18,7), because (18,6) is a painted pillar base.
- `engine/plate.js` `plateLive` (called from `engine/draw.js` after the plate): after `ch11-closed` the Long Island dome (left window) is tinted amber over the painting, as it was on the tile version.
- Tests: new `tools/gate00_test.py` (objects touchable, spawn to doorway connected, podium text opens, east doorway to the Concourse and back lands on floor, amber dome, portrait and landscape shots in `tools/shots/gate00-*.png`) 0 fails; `tools/reach_test.py gate00 concourse` 0 fails; `ch11_test.py`, `ch11b_test.py` and `smoke.py` 0 fails. No spoken lines changed (object text only).
- Known roughness: the departure board and the wall plants are painted on the wall and cannot be walked up to; the board is touched from the floor below it.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Sage, Kenji, Juniper, Bernadette, Dana, Kiki)
- Sheets `tools/sprite-bake/src/{sage,kenji,juniper,bernadette,dana,kiki}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 38, 44, 38, 42, 41, 40). Files arrived as "image.png"; Tom's names screenshot gave the names and the sheets were matched to the NPCs by hair, clothes and job (palettes in `data/maps-la.js`).
- Sage, Kenji and Juniper are matched BY NAME (`TOWN_PAINTED`) because `VILLAGERS` has entries for those looks and wins over a plain `OW` set (first try showed the old pixel art in the shops). Bernadette, Dana and Kiki replace `OW.bernadette`, `OW.dana`, `OW.kiki` directly.
- Checks: `tools/townsfolk_test.py` (35 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Four more painted townsfolk (Toni, Ray, Larry, Marisol)
- Sheets `tools/sprite-bake/src/{toni,ray,larry,marisol}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 39, 44, 44, 38). Tom sent six files; "Muscular Security Guard Turnaround Sheet" is identical to Ray's and "Gardener Character Walk-Cycle Sheet" to Larry's (checked by hash), so only four were baked.
- Toni and Ray replace `OW.toni` and `OW.ray` directly (Sunset Gold Studios crew). Larry and Marisol are matched by name (`TOWN_PAINTED`) because the looks larry and marisol are the base bodies of Michael and Olivia in the LA houses.
- Checks: `tools/townsfolk_test.py` (29 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Mr. Washington, Bev, Boomie, Wes, Chet, Skye)
- Sheets `tools/sprite-bake/src/{washington,bev,boomie,wes,chet,skye}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 44, 38, 42, 42, 44, 38). Names given by Tom in attachment order (the files arrived as "image.png", pasted rather than attached).
- Mr. Washington, Bev, Wes, Chet and Skye are matched BY NAME (`TOWN_PAINTED`). Boomie is a sheet actor (look `skye`, `sheet:'boomie'`), so `OW.boomie` is replaced directly in `data/townsfolk-hires-use.js`; her old `BOOMIE_OW` set stays in `data/npc-sprites.js` as the fallback.
- Checks: `tools/townsfolk_test.py` (25 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk (Sal, Kit, Luna, Penny, Oolong, Fern)
- Sheets `tools/sprite-bake/src/{sal,kit,luna,penny,oolong,fern}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 44, 45, 38, 38, 37, 41) and matched BY NAME in `data/townsfolk-hires-use.js` (`TOWN_PAINTED`): the looks kit (TNB's stand-in body in LA) and oolong (Aunt Ellie's) are shared.
- These six arrived as "image.png", so the characters were matched by the town's own data, not file names: Kit is the mail carrier at the Post, Sal the taxi driver, and Penny, Luna, Oolong and Fern match the villagers' hair and clothing colours in `data/villagers.js`. Confirm with Tom; a wrong match is a one-line swap in `CAST`.
- Checks: `tools/townsfolk_test.py` (19 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk (Page, Bun, Mr. Halverson, Grandpa Ike, Mr. Delgado, Mrs. Kowalski)
- Sheets `tools/sprite-bake/src/{page,bun,halverson,ike,delgado,kowalski}-walk-v1.png` added to `CAST` in `tools/sprite-bake/bake_townsfolk.py` (standing heights: Page 43, Bun 41, Halverson 43, Ike 42, Delgado 44, Kowalski 41). The file "Teacher's Apron Walk Cycle Sprite Sheet" is Mrs. Kowalski (the PTA president, the only school character left).
- Halverson, Ike, Delgado and Kowalski replace their `OW` sets in `data/townsfolk-hires-use.js`. Page and Bun are matched by name (`TOWN_PAINTED`), because the look `bun` is the stand-in body for Mr. Pistachio in the Nine Scoops scenes.
- Kowalski's sheet has rows 2 and 3 touching, so the baker now splits such a sheet at its emptiest line and cuts each part separately.
- Checks: `tools/townsfolk_test.py` (13 characters) 0 fails, smoke, ch5_school_test, bg_test, bakery_test 0 fails.

## 2026-10-29: Painted townsfolk (Pip, Moss, Dot, Gus, Bean, Reel, Principal Pruitt)
- Seven painted walk sheets (3 rows of 4: down, up, left; magenta) saved as `tools/sprite-bake/src/<id>-walk-v1.png` and baked by new `python3 tools/sprite-bake/bake_townsfolk.py` into `art/chars/<id>-ow.webp` (3x) and `data/townsfolk-hires.js` (generated, never hand-edit). Same recipe as Ellie, no head enlargement (the heads are already caricature size). Standing heights in rows: Pip 38, Dot 41, Reel 40, Gus 43, Pruitt 43, Bean 46, Moss 48 (the old villagers were 40 to 43).
- `data/townsfolk-hires-use.js` (loads after `data/ellie-hires-use.js`): Reel and Pruitt replace `OW.reel` and `OW.pruitt`. Pip, Moss, Dot, Gus and Bean are matched BY NAME (`TOWN_PAINTED`, read in `drawActor`, `engine/town-render.js`) because the look keys pip, gus, dot and bean are also stand-in bodies for Deedee, Boppy, Amy and Justin in story scenes; those stand-ins keep the old villager art. `TOWNSFOLK_HIRES_OFF=true` restores the old sprites.
- Checks: new `tools/townsfolk_test.py` 0 fails (sets registered and painted, each character found and drawn on its map, no page errors), smoke, bg_test, pier_test 0 fails.
- Known: Deedee, Boppy, Amy and Justin still use the old villager bodies in the story scenes that borrow the looks pip, gus, dot and bean. Battle and portraits for these seven are unchanged (overworld only).

## 2026-10-29: Dakota and Ryan's Place (inside) is painted (Area 53, map id `dakota`)
- New `art/dakota.webp` (Tom's painting, 768 x 640 = 12 x 10 tiles at 64 px) registered as `PLATES.dakota` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,9) and spawn (6,8) unchanged; the second entry tile (5,9) is also a door (`doors:[[5,9]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in rows 3 to 6 (wide at the top, narrowing past the front rooms) and the entry lane (x 5 and 6, rows 7 to 9) between the two posts. Row 2 is all furniture (dining table, bookshelf, crib, monstera), the armchair and pouf fill the left, the dresser and the roof edge close the right; the stool, shoe bench and both front alcoves are painted and blocked.
- Objects re-laid to the painting: Hudson's crib (7,1,3,2), Dining table (2,1,3,2), Book shelf (5,1,2,2), Monstera (10,2,1,3), new Green armchair (1,3,2,2), new Leather pouf (3,4), new Shoe bench (7,8,2,1). Dakota moved from (4,6), now blocked, to (4,4); Ryan from (8,5) to (8,4). Their lines are NOT changed (clips still match).
- New object text (not voiced, no re-bake): Green armchair, Leather pouf, Shoe bench. The three original object texts are unchanged.
- Checks: new `tools/dakota_test.py` 0 fails (objects touchable, no cut-off floor, both neighbors answer, walls hold, both entry tiles exit to Jefferson Park), smoke, bg_test, nickels_test, boards_test, jpark_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the posts. The dresser at the right wall is painted but has no object (no walkable tile touches it). jpark_test "door enters boards" failed once in a full run and passed on rerun (a wandering monster, not this change).

## 2026-10-29: Angel City Cab Co. (inside) is painted (Area 45, map id `lacab`)
- New `art/lacab.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.lacab` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged; the whole doormat (x 4 to 6, rows 7 and 8) walks and all three bottom tiles exit to the boulevard (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the lane in front of the dispatch desk (row 4, x 2 to 8) and the open floor below it (rows 5 and 6, x 3 to 8). Desk, both sofas, magazine table, water cooler, lost and found, the plants and the front ledge are painted and blocked.
- Objects re-laid: Dispatch desk (3,3,5,1), Water cooler (8,2,1,2) (new), Lost and found (9,3,2,2), Green sofa (9,5,2,2) (new), Red leather sofa (0,3,2,2) (new), Magazine table (1,5,2,2) (new). The wall-only objects (Key board, Driver of the month photo, Waiting room palm) are gone because nothing can reach them; their lines moved into the desk (map and key board), lost and found (photo) and magazine table (palm). Unvoiced text only.
- Sol stays at (5,5), lines unchanged. The chapter 13 to 16 scenes park Grace and Rose in this room: their tiles moved from (2,5) and (3,7), now blocked, to (3,5) and (4,6) in `data/scenes-ch13.js`; their lines are unchanged. Tom's arrival tile (7,6) in chapter select is still open floor.
- Checks: new `tools/lacab_test.py` 0 fails (objects touchable, Sol talks, girls' tiles walk, walls hold, all three mat tiles exit to the boulevard), smoke 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the ledge.

## 2026-10-29: Pupuseria La Ceiba (inside) is painted (Area 51, map id `pupuseria`)
- New `art/pupuseria.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.pupuseria` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the centre aisle (x 4 to 6, rows 4 to 6) and a one-tile lane at x 5 (rows 7 and 8) over the mat. The comal counter, family table, both right tables, the planters, the rails and the walls are painted and blocked.
- Doña Carmen stays visible at (5,4) with `roam:0` (the painting has no cook); her lines are NOT changed, so clips still match.
- Objects re-laid: The comal (3,2,5,2), Family table (1,4,3,2), new Window table (7,4,2,1) and Corner table (7,5,3,2) with new unvoiced text, Loroco plant (3,6). The Volcano photo object is gone (the painted volcano hangs on a wall nobody can reach); its line "A volcano outside San Salvador at sunrise. Carmen points at it every time someone looks." is no longer in the game.
- Checks: new `tools/pupuseria_test.py` 0 fails (objects touchable, Carmen answers, counter answers, door walked to Jefferson Park), smoke, bg_test, jpark_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and rail.

## 2026-10-29: Odette's Creole Kitchen (inside) is painted (Area 50, map id `creole`)
- New `art/creole.webp` (Tom's painting, 768 x 576 = 12 x 9 tiles at 64 px) registered as `PLATES.creole` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,8) and spawn (6,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): a ring of floor around the family table (row 3 x 4 to 6, column x 6, rows 5 and 6 on the left and right of the table), the west nook (2,5) and (2,6), and the doormat lane (x 5 and 6, rows 7 and 8). The pastry case and kitchen, all three tables, the dark booths, the right wall alcove, the front bench and plants stay blocked. The back right corner (rug and wooden door) is cut off by the yellow table, so it is blocked too.
- Miss Odette moved from (6,4) to (4,3) with `roam:0`, in front of the pastry case, so she never blocks the one-tile column at x 6. Her lines and the smog and clear variants are NOT changed (clips still play).
- Objects re-laid: Pastry case (3,2,5,1), Gingham table (1,3), Family table (3,4), Yellow table (7,3), Green sideboard (1,5), Pepper plant (1,6), Dark booth (8,5,1,3), two Door plants (4,7) and (7,7). The old "Corner table" (church fan from 1987) and "Boulevard photo" (1958) are gone as objects: both are painted in the unreachable right wall area. Their lines are no longer in the game; reuse them if a later object fits.
- Object text reworded or added (not voiced, no re-bake): Gingham table, Family table, Yellow table, Green sideboard, Dark booth, both Door plants; Pepper plant text unchanged.
- Checks: new `tools/creole_test.py` 0 fails (objects touchable, no cut-off floor, Odette answers, tables, booth and walls hold, door walked to Jefferson Park), smoke, jpark_test, bg_test, boards_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the chair backs and the door plants.

## 2026-10-29: Casa Alvarez (inside) is painted (Area 47, map id `casa`)
- art/casa.webp (896 x 704, 14 x 11 tiles at 64 px), PLATES.casa (actorScale 1.98), plateMask and door/spawn in data/maps-la.js. Door (7,10) and (6,10), spawn (7,9).
- The painting shows no doorway into the west rooms (laundry, bath, bedroom) or the bunk room, so they are scenery. Walkable: front lane at x 7, the kitchen and dining room, and the living room along row 6 (x 9 to 12).
- Objects re-laid, all touchable: Kitchen island, Stove, Fridge (new), Dining table (new), Family wall, Big TV, Green sofa (new), Toy pile, Coat hooks (new), Shoe shelf (new). The old Bunk bed and Baby Lupita's crib objects are gone with their rooms (no room in the painting to touch them from).
- NPCs moved off blocked tiles, spoken lines unchanged: Don Beto (12,6) in the wicker chair, Tony (5,5), Yesenia (8,2), Kevin (5,4), Daisy (4,4), Mateo (6,6), Sofi (8,5). Mrs. Alvarez (7,5) and Claudia (10,6) stay.
- tools/casa_test.py (0 fails), smoke, jpark_test, ch12_test 0 fails.
- Known: no foreground layer, so characters draw over the furniture. Kevin's bunk bed lines are now spoken away from the bunk bed; the sofa and TV rooms carry the scene.

## 2026-10-29: Jordan and Sam's Place (inside) is painted (Area 52, map id `jordansam`)
- New `art/jordansam.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.jordansam` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the espresso bar and the aisle beside the sofa (row 3, x 5 to 8; x 5 down rows 2 to 6), the front floor (row 5, x 2 to 5), the sunny tiles by the entry (4,6) (5,6), and a one-tile lane at x 5 (rows 7 and 8) over the doormat. The sofa, coffee table, pouf, dining table and chairs, kitchen, olive tree, slat divider, both side tables, planter ledge and the right wall are painted and blocked.
- Objects re-laid on painted things: Boucle couch (2,2) 3 x 2, Coffee table (2,4), Leather pouf (4,4) (new), Slat divider (5,0) (new), Olive tree (6,1) 1 x 2 (moved), Espresso bar (7,2), Mug shelf (9,2) (new), Dining table (6,4) 3 x 3 (new), Side table (1,5) (new), Window planter (2,6) (new). The old "Before and after" photo object is gone (the frames hang over the sofa where nothing can touch them); its line now lives in the couch text.
- Residents: Jordan moved from (4,5) to (4,6) and no longer wanders (the old spot blocked the aisle to the sofa side). Sam moved from (7,5), now the dining table, to (7,3) in front of the espresso bar and still wanders. Neither one's lines changed, so no clip is affected.
- Reworded or new object text (not voiced, no re-bake): couch (adds the before and after frames), coffee table, pouf, slat divider, mug shelf (TNB line), dining table, side table, planter. Espresso bar and olive tree keep the old jokes (olive tree: "In a big planter").
- Checks: new `tools/jordansam_test.py` 0 fails (objects touchable, no cut-off floor, both residents talk, walls hold, lane walked to Jefferson Park), smoke, bg_test, jpark_test, nickels_test, boards_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the ledge. The hallway door behind the slat divider is scenery only.

## 2026-10-29: carbarn_test fixed (test only, no game change)
- `tools/carbarn_test.py` failed "west arch leads to Jefferson Park" and "east rails lead to the Boiler Room" because a wandering monster (Lukewarm waits at the west arch) started a fight on arrival, which froze the walk. The exits and walk map were fine. The test now ends any fight and clears monsters near the player before each exit walk. 0 fails.

## 2026-10-29: The Starlite (inside) is painted (Area 43, map id `cinema`)
- New `art/starlite.webp` (Tom's painting, 832 x 704 = 13 x 11 tiles at 64 px) registered as `PLATES.cinema` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,10) and spawn (6,9) unchanged.
- Walk map (`plateMask` in `data/maps-la.js`): the center aisle (x6, rows 4 to 10), the front strip across the seat rows (row 7, x1 to 9), the velvet-rope nook (8,8), and the red-carpet stairs (x5 and x6, rows 8 to 10) as the way out. Stage, both seat blocks, the concession bar, ticket desk, fern and brass posts are painted and blocked.
- Objects re-laid: The big screen (4,2,5,2), Row F (1,5,5,2), Row G (7,4,4,3), Concessions (10,5,3,4), new Ticket desk (0,8) and Lobby fern (2,8) and Velvet rope (8,9). Dolores moved from (6,3), now stage, to (3,7); her lines are NOT changed (clips still match).
- Object text reworded or added (not voiced, no re-bake): Row F ("three" coats), Row G (plaid blanket), Concessions (prices), Ticket desk, Lobby fern, Velvet rope.
- Checks: new `tools/starlite_test.py` 0 fails (objects touchable, Dolores answers, concessions answer, stairs lead to the boulevard), smoke, blvd_test, bg_test, ramen_test 0 fails. Portrait and landscape shots looked at.

## 2026-10-29: The Board Room (inside) is painted (Area 44, map id `boards`)
- New `art/boards.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.boards` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged; the whole doormat (x 4 to 6, rows 7 and 8) walks and all three bottom tiles exit to Jefferson Park (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the front floor (rows 5 and 6, x 2 to 6), the lane in front of the counter (row 4, x 2 to 8) and the sunlit tile past the counter's right end (8,3). The deck and longboard walls, the grip tape counter, wheel wall, bench, the board and wheel rack and the cactus are painted and blocked.
- Objects re-laid: Grip tape counter (2,3,6,1), Wheel wall (0,2,2,3) (new), Bench (0,5,2,2) (new), Longboard rack (7,5,4,2) (new), Cactus (9,2,2,2). The two wall objects (deck wall, longboard wall) are gone because the counter blocks the way to them; the cat deck line moved into the counter text. Dash moved to (3,6) on the left rug and no longer wanders (the old spot blocked the door lane); his three lines are unchanged, so clips still match.
- Reworded or new object text (not voiced, no re-bake): counter (adds the cat deck), Wheel wall, Bench, Longboard rack (the green wheels bin labeled TNB, a nod to Dash's line).
- Checks: new `tools/boards_test.py` 0 fails (objects touchable, Dash talks, bench/counter/rack block, all three mat tiles exit), smoke, bg_test, jpark_test, juicebar_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and rail.

## 2026-10-29: The Grand Tower (inside) is painted (Area 49, map id `tower`)
- New `art/tower.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.tower` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the boulevard door at (18,20) still works.
- Walk map (`plateMask` in `data/maps-la.js`): rows 0 and 1 are the window wall; open floor through the middle (rows 2 to 6), a one-tile lane at x 5 (rows 6 to 8) between the planters. Blocked: sofa (cols 1 to 3), standing desk (7 and 8), two stone pillars, TV unit (col 1), kitchen island and stools (cols 2 to 4, rows 5 and 6), dining set (6 and 7), armchair and corner nook (right side).
- Objects re-laid to the painting: Gray couch, Standing desk, The TV (now the whole unit down the left wall), Fiddle-leaf fig, plus new Kitchen island, Dining table, Armchair and Corner nook. Unvoiced text only: four new prop lines. Priya moved to (6,2) by her desk; her lines are unchanged.
- Checks: new `tools/tower_test.py` 0 fails (objects touchable, no cut-off floor, Priya talks, walls hold, door walked to the boulevard), smoke, bg_test, blvd_test, shop_test, nickels_test 0 fails. Portrait and landscape shots looked at. ch17_test did not finish inside the 280 s timeout here; the chapter 17 Glass Tower does not use this map.
- Known: no foreground layer, so characters draw over the front planters and pillars. The (8,5) tile sits just in front of the nook plant.

## 2026-10-29: Nickel's (inside) is painted (Area 41, map id `nickels`)
- New `art/nickels.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.nickels` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the boulevard door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in front of the counter (rows 5 and 6), one tile beside the snack shelf (8,4), and a one-tile lane at x 5 (rows 6 to 8) between the door posts over the mat. The counter, sweater wall, window, helmet shelf, crates, ball display, cactus and the right wall stay blocked.
- Nickel is painted into the plate, so her sprite is `hidden:true` at (5,2) behind the counter. A on the counter (any tile x 4 to 7, row 5) still opens the shop through the shop flag on the counter object.
- Objects re-laid to the painting: Shop counter (4,3) 4 x 2, Snack shelf (8,1) 2 x 3, Battle bin (1,4) 2 x 2, new Ball display (3,4), new Shop fern (1,6), Shop cactus (9,4) 1 x 3. Unvoiced text only: two new lines (Ball display, Shop fern). The old Gear shelf is gone as an object (the sweater wall is not reachable on the painted floor); its line "Sweaters nobody in LA needs, and sunglasses everybody does." is no longer in the game.
- Checks: new `tools/nickels_test.py` 0 fails (objects touchable, no cut-off floor, shop opens from every counter tile, walls hold, door walked to the boulevard), smoke, bg_test, blvd_test, shop_test, ramen_test, juicebar_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the cactus and the front ledge. The painted keeper looks different from the old Nickel sprite (teal hair); the painting is canon.

## 2026-10-29: Backlot Wardrobe (inside) is painted (Area 42, map id `wardrobe`)
- New `art/wardrobe.webp` (Tom's painting, 768 x 640 = 12 x 10 tiles at 64 px) registered as `PLATES.wardrobe` (`?v=20261029`, interior actor scale 1.98). Map size unchanged. Door (6,9) and spawn (6,8) unchanged; both purple carpet tiles (x 5 and 6, row 9) now exit to the Boulevard (`doors:[[5,9]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in the middle (rows 4 to 7), the small floor tongue at (5,3), the sunny floor under the desk's right end (x 2 to 4, rows 7 and 8), the alcove by the prop plant (x 8 and 9, rows 7 and 8), and the carpet. The western rack, call sheet wall, space rack, desk, shoe shelf and mannequin, prop plant, hat case and trunks, and both gate posts are blocked.
- Objects re-laid to the painting: Rack A Westerns (1,1,4,3), Rack B Space (8,1,3,3), Continuity desk (0,4,4,3), Call sheet (6,2,2,2), Prop plant (9,5,2,2), new Hat case (10,7,2,2). Marguerite stays at (6,5). Her lines are NOT changed (clips still match).
- Reworded (object text, not voiced, no re-bake): Rack A "Forty cowboy hats" is now a shelf of hats, fringe and a lasso (the painting has about ten hats); the Call sheet now reads the painted schedule (8 AM crew call, horse stand-in at 3) instead of "5 AM, forty extras". Prop plant ("four movies") and the desk scarf joke kept, since the painting shows both. New line: Hat case.
- Checks: new `tools/wardrobe_test.py` 0 fails (objects touchable, no walkable islands, Marguerite and the desk answer, carpet walked to the boulevard), smoke, bg_test, blvd_test, reach_test, shop_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the front ledge and gate posts.

## 2026-10-29: Very Green Juice (inside) is painted
- New `art/juicebar.webp` (Tom's painting, area 40, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.juicebar` with the interior actor scale. Map `juicebar` keeps its size. Door (5,8) and spawn (5,7) unchanged; the whole doormat between the gate posts (x 4 to 6, rows 7 and 8) now walks and all three bottom tiles are exits to Jefferson Park (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the counter, the open floor right of the counter (8,3), the sunny left side down to the herb table. Counter and blender wall, wheatgrass beds, herb table, big fern and the supplement shelf are painted and blocked.
- Objects re-laid: Juice bar counter (3,3,5,1), Wheatgrass beds (1,2,2,4), new Herb table (1,6) with one new unvoiced line, Fern (8,2), Supplement shelf (9,3,2,4). Sage moved behind the counter to (5,2), where the painting's keeper stands; her lines are NOT changed (clips still match).
- Engine: a counter object with `across:true` lets A talk to whoever stands directly behind it (`facingTarget` in `engine/battle-draw.js`), so Sage can be talked to across the counter. Only the juice bar counter uses it.
- Checks: new `tools/juicebar_test.py` 0 fails (objects touchable, Sage across the counter, all three mat tiles exit, walls hold), smoke, bg_test, jpark_test, taxi_test, shop_test 0 fails. Portrait and landscape shots looked at.



## 2026-10-29: Ramen Ramen is painted (Area 39, map id `ramen`)
- New `art/ramen.webp` (Tom's painting, 768 x 576 = 12 x 9 tiles at 64 px) registered as `PLATES.ramen` (`?v=20261029`, interior actor scale 1.98). Map size unchanged; the old tile-drawn shop is gone.
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the counter (rows 4 and 5), the rug alcove at (2,3), and the two tiles under the noren curtain (x 5 and 6, rows 6 to 8) as the way out. The counter and stools, kitchen, sake shelf, bamboo pot, lantern step, corner booth and both front fences are blocked.
- Objects re-laid to the painting: counter (3,2) 5 wide, sake shelf (8,2), corner table (9,4), bamboo (1,3), new Lantern step (0,5). Kenji stays at (5,4) and wanders the front floor.
- Reworded (object text, not voiced, no re-bake): counter "Twelve stools" is now "Five stools" (the painting has five); bamboo text now mentions the egg painted on the pot and "the rest for luck" (the painting shows more than three stalks). New line: Lantern step.
- Checks: new `tools/ramen_test.py` 0 fails (objects touchable, Kenji and counter talk, door walked to the boulevard), smoke, bg_test, jpark_test, blvd_test 0 fails. Portrait and landscape shots looked at.
- Known: `tools/carbarn_test.py` fails its two walk-out checks (west arch to Jefferson Park, east rails to the Boiler Room) on a clean checkout too, so it predates this change. No foreground layer, so characters draw over the front fence.

## 2026-10-29: Golden Hour Coffee is painted (Area 38, map id `coffee`)
- New `art/coffee.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.coffee` (`?v=20261029`). Same size as the old room, so the Boulevard door and the exit are unchanged: door (5,8), arrival (5,7).
- Walk map (`plateMask`): the floor in front of the counter (row 3, x 4 to 6), the middle floor (rows 4 and 5), and the entry lane over the mosaic mat (x 4 to 6, rows 6 to 8). The back counter, pastry case, left laptop table, right window table and book table, and the plants and low walls at the front are painted and blocked.
- Objects re-laid on painted things: Espresso bar (4,2), Pastry case (7,2) (new), Monstera (3,2), Laptop table (0,3) (its text now also reads the wall sign SAME SCRIPT, DIFFERENT YEAR), Window table (8,3), Book table (8,5) (new, replaces the old second table). Juniper stands in front of the counter (5,3). None of the new text is spoken, so no clip is affected. Juniper's three lines are unchanged.
- Checks: new `tools/coffee_test.py` 0 fails (objects touchable, Juniper on a walkable tile and talks, door walked with a real key), smoke, bg_test, blvd_test and reach_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the plants and low walls at the front; the left rug, the right armchair and the bookshelf are scenery only.

## 2026-10-29: Inside the Old Oak is painted
- New `art/oak.webp` (Tom's painting, 1536 x 1280 = 24 x 20 tiles at 64 px) registered as `PLATES.oak` (`?v=20261029`). Map `oak` keeps its size; the tile-drawn bark, branches and pits are gone (the spec no longer uses `oakPlan`).
- Walk map (`plateMask` in `data/maps-la.js`): the entry stairs (x 11 and 12, rows 17 to 19), the lower floor (tea table, stove and rug on the left, the table and rug on the right), the long walkway and stairs up the right side to the pantry, the pantry walkway and pulley deck, the middle rope bridge (row 6) across to the war room ramp, and the war room lane (row 5) in front of the war table. The top bridge (row 1) and the middle bridge (row 3) are cut off until the ladder is down.
- The way up is now a rope ladder in column 12 (rows 2, 4 and 5 are the gap; `ladder` cells in the oak spec). `ch6LowerLadder` opens them, and the ladder is drawn live over the painting in `STORY_MAPFX` (fades where the party is climbing). Exits unchanged: stairs (11,19) and (12,19) to Old Oak Park, top (11,0) and (12,0) to the crown; crown drops land on (11,1) and (12,1).
- The dark vignette is softer (it was a near blackout on the old tile look). The "light down the hollow" strip is gone (the painting has its own).
- Objects re-laid to the painting: filing cabinets (1,3), corkboard (3,3) (still starts the board scene), war room desk (6,3), firefly jar (2,10), stump table (6,11), bucket (17,4) (the pulley deck; still the ladder trigger), pantry shelves (19,4) and (21,5), doormat sign (13,17). Dropped (not reachable, now scenery): the two floor mushrooms, the second firefly jar, the acorn pile, the tally-mark bark walls. Monsters re-spotted: (4,13), (19,14), (5,5), (19,8).
- Spoken lines NOT changed: the ladder scene still says the rope ladder unrolls "all the way to the floor" (it now ends at the war room bridge), and `ch6Oak` still says "war room on the left, pantry on the right" (still true). Only the hint text was reworded (not voiced).
- Checks: new `tools/oak_test.py` 0 fails (objects touchable, ladder gap holds then opens, corkboard and bucket and ladder scene run, stairs and climb walked with real keys), smoke 0 fails, bg_test 0 fails, reach_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the bridge rails and the pantry barrels. The war room is one lane deep (the table, desks and filing cabinets are blocked).

## 2026-10-29: The Crown of the Oak is painted (Area 35, map id `crown`)
- New `art/crown.webp` (Tom's painting, 1280 x 1024 = 20 x 16 tiles at 64 px) registered as `PLATES.crown` (`?v=20261029`). Same size as the old map, so nothing was resized. The old pit corners (`pools`) are gone.
- Walk map (`plateMask`): the plank floor (rows 5 to 10), the rope bridge down (x 9 and 10, rows 10 to 15), the two lookout decks with their stairs (left x 2 to 5, rows 4 to 5; right x 15 to 17), and a small floor tongue on the right (x 14 and 15, row 10). The hoard, crates, trunk and leaves are painted and blocked.
- Exits unchanged: bridge bottom (9,15) and (10,15) to the Old Oak (11,1) and (12,1). Spawn (9,14). Boss scene tiles unchanged and walkable: Tom (9,7), TNB (8,7), Nara (10,7). Chairman Cheeks still sits at (9,4), on the painted chest at the front of the hoard.
- Objects re-laid on painted things: hoard (11,4), JANUARY crate (6,5), FEBRUARY crate (13,5), MARCH pile (5,7), and the two lookout posts are now the painted telescopes (2,3) and (17,3), reached from the decks. Same jokes; the lookout text now names a telescope. None of this is spoken, so no clip is affected.
- Not changed: the battle backdrop for the crown (`bgs/17-oak-crown-canopy.png`) is still the old pixel one.
- Checks: new `tools/crown_test.py` 0 fails (objects touchable, decks and exits reachable, bridge walked with a real key, boss scene runs to the Chairman battle), smoke, bg_test and reach_test 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Old Oak Park is painted
- New `art/oakpark.webp` (Tom's painting, 1664 x 1408 = 26 x 22 tiles at 64 px, same size as the old map) registered as `PLATES.oakpark` (`?v=20261029`). No map resize, so every exit and arrival tile is unchanged: south gate (12,21) (13,21) to 2nd Ave, little door (12,4) (13,4) to the Old Oak, arrivals (12,20) (13,20) and (12,5) (13,5).
- Walk map (`plateMask`): the Old Oak steps and door, the dirt paths round the central planter (blocked) into two lanes, the playground sand, the picnic lawn, the dog park (in through the bone gate), the garden's front dirt, and the south corridor. Garden beds and stepping stones are painted and blocked.
- Objects re-laid on painted things: Old Oak roots (14,4), Little door (12,4), slide, play fort, swings, climbing dome, two trash cans, Watch board (16,5), Tomato bed, Herb bed, three picnic tables, grill, drinking fountain (10,16), dog fence, dog bench, water bowl, agility hoop, park sign (13,11). Dropped: scarecrow and squash bed (not in the painting, or unreachable). The three dig mounds moved to (7,9) sandbox, (21,5) garden, (8,17) picnic lawn and are drawn live (`liveKinds`).
- Monster spots moved off painted props: acorn agents (11,9) (17,16) (20,12), Peanut Gallery (5,7), Twig Spy (20,6), Cheek Stuffer (4,18).
- Checks: new `tools/oakpark_test.py` 0 fails (objects touchable, no walkable islands, exits reachable, south gate and little door walked with real keys), smoke, bg_test, stage7_test, backlot_test 0 fails, portrait and landscape frames looked at.
- Known roughness: no foreground layer (characters draw over tree leaves); the bollards at the south gate and the lamp posts are walk-through.

## 2026-10-29: The Boiler Room is painted
- New `art/boilerroom.webp` (Tom's painting, 1280 x 896 = 20 x 14 tiles at 64 px) registered as `PLATES.boiler` (`?v=20261029`). Map size unchanged. The room is now a plain spec with a `plateMask` (no more `barnPlan`, so the old hearth tiles are gone; `barnPlan` is no longer used by any room).
- Walk map: the west arch (exits (0,7) and (0,8) to the Car Barn, arriving at (28,14) and (28,15) there), the lit walkway down past the coal cart, and the open stone floor out to the coal bin, the bread rack and the baker's bench. The boiler and its control platform, the pipes, and the south wall of crates are blocked.
- Objects re-laid on painted props: Old boiler, Coal bin, Coal cart (was Coal scuttle), Bread rack, Peel rack (the tool rack by the oven), Baker's bench (new, bowl, mug and dough tub), Ash pan (the floor barrel), Stacked crates (new). The ch8-clear texts are unchanged.
- Old Ironbelly now stands at (8,5) on the floor in front of the boiler (was (9,3) on the old hearth). The chapter 8 boss scene positions (Tom (9,7), TNB (8,7), Nara (10,7)) are all painted floor and unchanged. The firelight glow moved to the boiler (6.5, 4). Hint text no longer says "up on the hearth".
- Checks: new `tools/boilerroom_test.py` 0 fails (objects touchable, Ironbelly and scene tiles walkable, west arch walked, boss scene reaches the fight with real keys), smoke, bg_test, carbarn_test 0 fails; portrait and landscape frames looked at. Known roughness: no foreground layer (characters draw over the platform rail and pipes), the oven door on the east wall is scenery only (the bread-in-the-oven moment is still the Bread rack).

## 2026-10-29: Division Nine Car Barn is painted
- New `art/carbarn.webp` (Tom's painting, 1920 x 1344 = 30 x 21 tiles at 64 px) registered as `PLATES.carbarn` (`?v=20261029`). Map size unchanged. The map is now a plain spec with a `plateMask` (no more `barnPlan` for this room; the Boiler Room still uses it).
- Walk map: west arch (exit to Jefferson Park at (0,9) and (0,10)), the Paint Shop floor, the hall above the pit, the rails strip up to the Machine Shop, the east floor to Track 4 (exits (29,14) and (29,15) to the Boiler Room, which now arrives at (28,14) and (28,15)), the turntable control platform and the steel stairs down to the Lunchroom. The Lunchroom is only reached by the platform and stairs (the painting walls it off from the hall).
- The painted bridge is one fixed diagonal catwalk. Its 13 cells (`BARN_TT.h`) stay blocked until the lever turns the turntable east, as before; the painting does not visibly swing. The spoken "bridge swings round" lines are unchanged.
- Objects re-laid on painted props: Car 9, drying rack (with the ice-skinned paint cans text), paint cart, sawhorses, workbench, wheel truck, lathe, dispatch board, crew bench, time clock, three lunch tables (clean spot with the Nara plate is the table by the stairs), turntable motor (control boxes), lever (green post by the east pit rim), coal cart, Track 4 sign, lunch pail (by the sign). Dropped as unreachable scenery: lockers, menu board, snack machine, Track 1 sign, oil cans, second lunch-table end.
- Monster spots and the drifting pilot lights moved onto painted floor. `tools/carbarn_test.py` added (objects touchable, exits and stairs reachable, bridge gate, west and east exits walked).
- Checks: carbarn_test, smoke, bg_test, jpark_test 0 fails; portrait and landscape shots looked at. Known roughness: no foreground layer (characters draw over pillars), (8,10) sits on a pillar base, the Lunchroom aisles are tight because the tables fill the room.

## 2026-10-29: Soundstage 7 is painted
- New `art/stage7.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered as `PLATES.stage7` (`?v=20261029`). Map `stage7` resized from 26 x 22 to 24 x 18 to match. The catwalk and pit layout is gone; the painting is an open stage floor.
- Walk map (`plateMask`): the open floor between the wardrobe department (left) and the video village and camera gear (right), the stairs up to the set (x 14 to 16, rows 3 to 5), the desk walkway (row 6), and the south loading gate (x 9 and 10, rows 13 to 16). The wardrobe department is sealed behind its racks and tables, so Rack 1, Rack 4, the sewing table and the fitting mirror are dropped (not reachable, now scenery). Rack 3 is the big painted rack (5,8).
- Exits: south gate (9,16) and (10,16) to the Backlot (14,1) and (15,1); the stairs (15,3) and (16,3) to the Stage Set (10,12) and (11,12). Backlot arrivals are (9,15) and (10,15); Stage Set arrivals are (15,4) and (16,4).
- The raised catwalk is now a gate on the stairs (`gates`, cond chapter 4 and not `ch4-rig`, look barrier). It opens when the rig is fixed; `ch4LowerCatwalk` only sets `catwalkDown`. Spoken scene lines are unchanged (they still say catwalk). Goal toasts reworded (not voiced): "middle of the floor", "up the stairs".
- Light rig puzzle kept: light rig (11,8) and spike tape RACK 2 (8,9) and the three junction boxes (red 6,11, blue 21,15, amber 13,12) are drawn live over the painting (`liveKinds`). Fog drifts over the right side (x 16 to 23). Monsters: fogwisp (19,6) and (13,13), extra (10,10).
- Objects re-laid on painted things: road cases (9,6) and (17,10), video village (19,4), camera dolly (15,8), two fog machines (21,6) and (16,7), stage sign (12,12). `tools/stage7_test.py` added.
- Checks: `tools/stage7_test.py` 0 fails (objects touchable, exits reachable, gate holds then opens, south gate walked), stageset_test, studio_test, bg_test and smoke 0 fails, portrait and landscape shots looked at (dark and lit).

## 2026-10-29: The Backlot is painted
- New `art/backlot.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered in `engine/plate.js` as `PLATES.backlot` (`?v=20261029`). The map shrank from 30 x 24 (old tile look) to 24 x 18 to match the painting.
- Walk map (`plateMask` in `data/maps-la.js`): the studio gate lot and plaza at the bottom, the road north to the Stage 7 door (x 12 and 13), the Western dirt strip (row 6, with a corridor on row 5 that joins the road), and the New York sidewalk (rows 5 and 6, right). The gate arm is treated as raised. The jungle set, tent, flats, scaffolds, truck and the lower right are scenery. The studio `border` is open along row 17 so the bottom lot walks.
- Exits: Stage 7 door at (12,2) and (13,2) to `stage7` (12,20) (13,20); studio gate at (9,17) and (10,17) to `studio` (10,1) (11,1). Studio north passage now arrives at (9,16) and (10,16); `stage7` exits arrive at (12,3) and (13,3). Spawn (10,16). The Stage 7 door gate (closed until `ch4-sets`) moved to row 2.
- Objects re-laid to the painting: Saloon (2,2), General store (6,2), fire hydrant (15,6) (the hydrant in Nara's fetch scene), Subway entrance (16,4), camera dolly (11,9), equipment cases (4,10), guard booth (5,12), golf cart (14,12), studio sign (0,13). Dropped: bank, diner, hat shop, brownstone, deli, laundromat, trough, hitching post, cacti, picture car, green screen, dumpster, newsstand, C-stands (none are in the painting).
- Story: the painting has no Main Street, so the three sets are now the Western street (Clapper Snapper, top left), New York (Boom Mic Moth, top right) and the jungle set (Cue Card Crab, in the plaza). Triggers: `ch4-main` at [9,9,13,13], `ch4-west` at [0,5,9,7], `ch4-ny` at [12,3,15,6]. `ch4Fetch` sends Nara to the hydrant at (14,6). Monster spots: crab (12,10), clapper (3,6), moth (14,5), two extras. Only the goal toast was reworded (not spoken).
- NOT changed (spoken, baked): three lines still say "Main Street" (`ch4Fetch` TNB line, Tom's "Then we clear the sets" line, and "Main Street is clear" in `ch4Crab`) and the `ch4Fetch` direction line says "Western street on the right, New York down on the left". They no longer match the painting. Rewording them needs a re-bake of `data/voice/dialog-ch4.js` lines.
- Checks: new `tools/backlot_test.py` 0 fails (objects touchable, exits reachable, scene tiles walkable, south gate and Stage 7 door walked with real keys), `tools/studio_test.py` 0 fails, smoke 0 fails, reach_test 0 fails, bg_test 0 fails; fetch scene and all three set zones start their scene and battle. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over tree leaves, the tent and the camera dolly. The Western corridor on row 5 passes through a bush.

## 2026-10-29: The Stage Set is painted
- New `art/stageset.webp` (Tom's painting, 1280 x 896 = 20 x 14 tiles at 64 px) registered as `PLATES.stageset` (`?v=20261029`). Map `stageset` resized from 20 x 16 to 20 x 14 to match the painting.
- Walk map (`plateMask`): the compass floor, the stairs to the director's platform (x 10 and 11, rows 4 and 5) and the entry ramp (x 9 to 11, rows 12 and 13). Castle ruins, scaffolds, camera crane, crates and lights are painted and blocked.
- Exits: ramp row 13 (x 9 to 11) to Soundstage 7 (12,1) and (13,1). Soundstage 7's catwalk exits now arrive at the set's (10,12) and (11,12). Spawn (10,12). Boss scene tiles unchanged and walkable: Tom (10,9), TNB (9,9), Nara (11,9), Director's Cut (10,4).
- Objects re-laid: painted backdrop (10,3), Rack 2 (9,4, beside the stairs; the painting has no costume rack, so it is an unpainted touch point), camera crane (16,7), director's chair (16,8), lantern post (8,11), prop crates (7,9), light stand (15,9). Couch and set lamp dropped (not in the painting).
- Checks: `tools/stageset_test.py` 0 fails, smoke 0 fails, bg_test 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Deedee rebaked, all 164 lines (loops fixed)
- Tom reported repeated words and phrases in Deedee's clips. Speech recognition over her old clips found 78 of 141 checked looping the line 3 to 10 times. New Deedee Rebake Baker (Project claude/deedee-rebake-*) transcribes every take and retries until clean. Tom sent deedee-rebake.json (164 clips, baker flagged none, voice AoT Deedee (picked 2026-10-28), id 9UrcxKDUU0pvcnFhdfTU, stability 0.5, similarity 0.85).
- Independent audit (sherpa-onnx Whisper base.en): 0 loops, 159 match the screen text, 5 flagged only by digits or recognizer quirks. Two worth a listen: "Keep up, honey! Arms at ninety!" (heard an extra "Can you") and "...So they are. Don't say anything." (heard "So they're so they are").
- Merged with tools/voice-recast/merge-voice.js: 44 battle clips replaced in data/voice/deedee.js, 120 dialogue clips replaced across dialog-ch1, 2, 3, 5, 9, 10, 22, 24, 25, 26, 27, 28; battle voice entry now the picked voice (battle and dialogue use one voice). Smoke 0 fails.

## 2026-10-29: Studio Gate is painted
- New `art/studio.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered in `engine/plate.js` as `PLATES.studio` (`?v=20261029`). The procedural lot look is gone for this map.
- Walk map (`plateMask` in `data/maps-la.js`): the road north (x 10 and 11), the lot in front of the gate, the walkway in front of the three trailers (row 7), the street and sidewalk at the west entrance, and the lower street. Gate wall, booth, trailers, craft tent, lights, carts and cases block.
- Exits follow Tom's grid: Western Entrance is the west edge, rows 9 to 12 (to the boulevard at 28,12 and 28,13); North Passage is the top, x 10 and 11 (to the Backlot, unchanged). Tom marked x 9 to 12 for the north passage, but the painted road is only two tiles wide there, so the exit is x 10 and 11. Boulevard arrivals into the studio are now (1,10) and (1,11); spawn is (1,10).
- Objects re-laid to the painting: guard booth (5,7), three trailers (14,4) (18,4) (22,4), craft services (15,9), lamp banner as the studio sign (2,13), studio lights (10,14), apple box (12,14), two cones. Dropped (not reachable, now scenery): golf cart, director's chair, lot sign, C-stands, the second apple box. NPCs: Ray (4,9), Toni (14,8), Kiki (8,11), Dana (6,12). Story scenes use `routeBeside`, so no scene tiles changed.
- Checks: `tools/studio_test.py` 0 fails (objects touchable, exits reachable, west and north exits walked with real keys), smoke 0 fails, bg_test 0 fails, portrait and landscape shots looked at. `tools/blvd_test.py` studio step now stands at (1,10); its "door lofts opens its building" failure was already there.
- Known roughness: the west entrance cells (x 0, rows 9 to 12) sit under painted tree leaves, as drawn in Tom's grid. No foreground layer yet, so characters draw over trees and the tent peak.

## 2026-10-29: Downtown LA has a new painted plate
- `art/blvd.webp` (1920 x 1664, 30 x 26 tiles) replaced with Tom's new golden-hour painting. Same eight buildings, new positions: the Griffith Park arch and steps are top left, the Jefferson Park arch and steps are bottom centre, the Metro is bottom right.
- Doors now at coffee (7,7), ramen (12,7), Starlite (18,8), Nickel's (24,8), wardrobe (4,18), loft (11,19), tower (18,19), cab (24,20). `plateMask` retraced from the painting. The west road exit is gone; Griffith Park is up the steps at (3,3) and (4,3), and the chapter 2 trail barrier moved there. Jefferson Park exits are the four tiles under the arch (12..15,25); jpark and griffith arrivals updated. The chapter 13 subfloor now comes up at the Metro (21,24).
- Props: hot dog cart removed (not in the new painting); taco truck, bus bench, Metro and cab object boxes re-placed. `tools/blvd_test.py` updated for the new tiles. smoke.py FAILS: [], blvd, griffith, jpark, loftlobby, reach and ch17 tests pass. No spoken lines changed.

## 2026-10-29: Cattail Pier is painted
- New `art/pier.webp` (Tom's painting, 1536 x 1408 = 24 x 22 tiles at 64 px) registered in `engine/plate.js` as `PLATES.pier` (`?v=20261029` busts phone caches). Before this the pier drew with the generic pond tile look.
- Walk map (`plateMask` in `data/maps-le.js`): dirt road from the north gate (x 11 to 13) and the west edge (rows 5 and 6), the bait shack front, the boardwalk (x 12 and 13), the platform (rows 10 to 12). Water, reeds, trees and rocks block.
- Objects re-laid to the painting: bait shack (17,1) 5x4, pier sign (14,3), Boppy's bench (7,3), tackle box (10,11). Reel stands at (19,5) in front of the shack. The rowboat object is gone (it floats in unreachable water). The old cattail objects and tree list are gone.
- Story: in `ch3Pier` Rose now stands at (13,12) on the platform (was (12,13), now water). Trigger zone and the other positions are unchanged.
- Checks: `tools/pier_test.py` 0 fails (objects touchable, scene tiles walkable, walk down the boardwalk, west exit enters the marsh), `tools/smoke.py` 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Jefferson Park repaint (themed shops, one label per house)
- `art/jpark.webp` is replaced with Tom's revised painting (same 1920 x 1536 at 64 px, upscaled from the 1402 x 1122 source). Same street, paths, camera and building positions, so the `plateMask`, doors, exits and objects are unchanged.
- Shops are exaggerated to read as what they sell: Odette's Creole Kitchen (Mardi Gras awning, giant crawfish, brass horn, CREOLE KITCHEN sign), Pupuseria La Ceiba (giant pupusa on the roof, PUPUSERIA sign), Board Room (skateboard on the roof, boards in the window, BOARD ROOM sign), Very Green Juice (giant green smoothie, VERY GREEN JUICE sign).
- Houses: exactly one label each (TOM'S HOUSE, JORDAN & SAM'S, CASA ALVAREZ, DAKOTA & RYAN'S); the duplicate labels are gone. Tom's house shows 3468.
- `PLATES.jpark.src` gets `?v=20261029` so phones that cached the old painting load the new one.
- Checks: `tools/jpark_test.py` 0 fails (all eight doors enter, every object touchable), `tools/smoke.py` 0 fails, portrait and landscape shots looked at.
- Known roughness: the sign text is painted, so the in-game names (Odette's Creole Kitchen, Pupuseria La Ceiba) show only in the HUD and dialogue. Door tiles sit on the landing in front of each painted door, as before.

## 2026-10-29: Chapter, load and new-game prompts use the welcome page
- Picking a chapter, LOAD, PART 2 or the bonus on the welcome page used to cut to the town with the old pixel logo and a dialogue box. The prompt now stays on the welcome page: same painted logo, same gold-framed panel and serif menu buttons (START CHAPTER 2 / BACK, the load list, the new-game warning).
- New `titleAsk(name,text,options)` in `engine/splash.js` (same arguments as `openChoice`; falls back to it if there is no welcome page). `splashGo` no longer fades to the town first; it fades out only when the pick starts a game without a prompt (`splashFade`). New `ask` mode in `SPLASH_MODES`, a `.sp-text` line in the panel, Esc/B runs the prompt's BACK. Callers switched: `engine/intro.js` (confirmNew, loadMenu), `engine/story.js` (confirmPart2), `engine/chapter-select.js` (confirmChapter), `data/bonus-nine-scoops.js` (confirmBonus). smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: Tom's House is now two painted rooms (replaces the tall top-down plate)
- Tom did not like the top-down plate, so the house is rebuilt from two 3/4 oblique paintings in the same style as the other houses. The hall wing (laundry, office, jetted bath, guest bath, storage, guest bedroom), the decks and the yard are gone for now.
- Main floor, map `tomhouse` (16 x 24 tiles, `art/tomhouse.webp` 1024 x 1536): wet bar, dining, kitchen with island, living room. The front door is three tiles wide at (3,18) (4,18) (5,18); spawn (4,17). The open doorway at the top middle (7,3) is an edge portal to the suite.
- Primary suite, new map `tomsuite` (16 x 15, `art/tomsuite.webp` 1024 x 960, the source painting scaled down): bedroom with the bed (restores the party), glass shower (restores), bath, two walk-in closets, window bench. Door at (7,12) and (8,12) leads back to the main floor (7,4). `houseById.tomsuite` in `engine/la.js` borrows the house record so the minimap and name lookups work; it is not a street door.
- `makeRoom` (engine/world.js) gained `doors` (extra front-door tiles) and `edges` (a doorway to another room of the same house). Both rooms use `PLATES` actor scale 1.98 like the other interiors.
- Scenes: `ch2-starter` and `ch12-house` trigger anywhere on the main floor (`at:[2,5,13,17]`); `ch2Starter` and `ch6Kitchen` walk Tom to (8,8) beside the island, TNB at (7,8) (Tom now faces the island to the right). `tools/tomhouse_test.py` rewritten for the two rooms; smoke and the Chapter 12 test pass. No spoken lines changed.
- Not done: walk-behind layer; the old hall rooms (a new painting would bring them back as another room via `edges`).

## 2026-10-29: Lobby elevator is a call button
- The brass elevator doors in `loftlobby` are scenery now. The call button beside them (object at 7,2, stand at 7,3 facing up) asks "Go up to TNB's loft?" with Enter TNB's / Not now. Yes rides to `lofts` at (6,8). New object field `ride:[map,x,y,facing]` (with optional `ridePrompt`) handled in `engine/overworld.js` (`pressAction`), reusable for any lift or door that should ask first.
- Test: `tools/loftlobby_test.py` covers the prompt, Not now, and Enter TNB's. smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: TNB's loft is painted (map `lofts`)
- `art/lofts.webp` (768 x 640, 12 x 10 tiles) is the loft plate, registered in `engine/plate.js` with the interior actor scale. `plateMask` in `data/maps-la.js` is traced from the painting; the loft is entered from the lobby elevator (arrive 6,8) and its door (6,9) is the elevator back down.
- Objects re-placed on the painted furniture, same names and jokes: kiln (2,1), garment rack (4,1), pottery shelf (8,1), wheel (1,3), longboard wall (8,4), horror couch (1,6). New: coffee table (5,4) and side tables (4,6). TNB stays at (6,5).
- `ch2Loft` scene: TNB now stands at (6,5) and Tom walks to (6,6), because the coffee table sits on the old spot.
- Test: `tools/loft_test.py` (every object touchable, TNB on floor, door to the lobby, ch2 greeting). smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: Lobby of TNB's building (map `loftlobby`)
- New painted room `art/loftlobby.webp` (768 x 640, 12 x 10 tiles, registered in `engine/plate.js` with the interior actor scale). Spring Street's LOFTS door now opens on the lobby (spawn inside the gate at 6,8); the street gate is the exit (6,9 and 5,9). The brass elevator doors (5,1 and 6,1) go up to TNB's loft (`lofts`, arrive at 6,8). The loft's door is now the elevator back down (arrive at the lobby doors, 5,3), not the street.
- Engine hooks: `house.enterMap` (battle-draw.js `switchMap`), `houseById.loftlobby` alias to the LOFTS house (engine/la.js, so minimap, music and exit work; the door count is unchanged), room specs `exitTo` and `portals` plus `name` (engine/world.js).
- Lobby objects: mailboxes, package desk, leather sofa, monstera; all touchable. Chapter scenes that start in `lofts` (ch2Loft, ch12Loft) now start when the party steps out of the elevator.
- Test: `tools/loftlobby_test.py` (street door, lobby, elevator, loft, back, street). No spoken lines changed.

## 2026-10-29: Indoor party spacing 25% tighter
- `movePlayer` in `engine/followers.js`: inside houses and shops the gap between party members is now 1.5 tiles (was 2). Outdoors stays 1 tile. Fractional gaps are interpolated along Tom's trail, so followers can stand between tiles. Checked by walking Tom in a house (gaps 1.5, 1.5) and outside (1, 1). No spoken lines changed.

## 2026-10-29: Tom's House is painted (Area 46, map id `tomhouse`)
- `art/tomhouse.webp` (1216 x 2752, 64 art px per tile) is the painted plate; `PLATES.tomhouse` in `engine/plate.js` (characters drawn at 1.5x). The painting came from Tom's image AI using the corrections list in `docs/area46/`; it matched the 19 x 43 shape, so the map size did not change.
- The old tile plan is gone. `plateMask` in `data/maps-la.js` is now traced from the painting (the old walkmap no longer matches the art: the hall lobby, doors, bath and closet positions all differ). All 210 walkable tiles and all 38 objects are reachable from the front door (checked by flood fill, then walked with real key presses through every door).
- Objects were re-placed on the painted furniture, same names and same flavor text. Dropped (their tiles are scenery now): lemon tree, back hedge tree, shrubs, yard tree, deck planter, flax and the welcome mat. The deck chairs, photo wall, nightstands, plants and the rest stay.
- Art patch: the painted office closet has no exit, so the office was sealed. One doorway was cut into the office east wall (art x 600-634, y 1350-1404 at full size, a floor strip pasted over the wall) so the office opens onto the hall at tile (9,21). The real plan has the office entered through its closet.
- Scenery only (not walkable): north deck, west lawn, back yard and the front porch. The deck furniture closes the deck in the middle, so the yard cannot be reached from the south deck.
- Scenes moved to the new kitchen: `ch2-starter` and `ch12-house` trigger anywhere on the main floor (`at:[4,28,15,37]`); `ch2Starter` and `ch6Kitchen` walk Tom to (14,31) beside the island, TNB at (15,31). Both checked in a headless run.
- Not done: walk-behind (a character passing behind a tall prop is still drawn on top); there is no foreground layer yet. No spoken lines changed.

## 2026-10-29: Nara on the welcome screen sits behind Grace
- `SPLASH_SPOTS` in `engine/splash.js`: Nara moved from the bottom left to behind Grace at the foot of the stairs (x 240, feet 1020, h 104) and listed first so every family member draws over her. Everyone on the welcome art is also 10% bigger (`SPLASH_ALL=1.1`, feet stay planted). No spoken lines changed.

## 2026-10-29: Aunt Ellie's house is painted
- Her interior (map `elliehouse`) now uses Tom's painting (`art/elliehouse.webp`, 768x640 like the other room plates). Registered in `engine/plate.js` with the interior actor scale. Walk map (`plateMask`) follows the furniture; exit at the bottom stairs back to Rivituso Row.
- Examine objects re-laid to the painting: writing cabinet (orchid joke kept), kettle, green sofa, lamp table (1968 ship photo), tea table (good china note kept), dining table, side table, umbrella stand, vanity (wardrobe joke kept). The old hat shelf and desk jokes: hat shelf dropped (no hat boxes in the painting).
- Ellie's spoken lines are unchanged, so every baked clip still plays. The hutch, photo wall, armchair, basket, shoe rack and right sideboard are painted but not reachable.
- Tests: `tools/ellie_test.py` (new) passes; `tools/smoke.py` FAILS: []. `tools/tea_test.py` 'walked up from the door' is flaky (passes and fails on identical code).

## 2026-10-29: TNB sized exactly like Tom, plus 24 extra painted poses
- TNB's head-to-body ratio and height now match Tom's (per-frame head solve in `bake_tnb.py`: 44.5 percent of battle height, 43.3 front, 41.7 side; 100 battle rows, 42 overworld rows).
- 24 new poses from two extra sheets (battle actions, story scenes), same baker. Mug Toss now plays painted pull, wind-up and release frames (the drawn mug is skipped while a painted pose holds its own). Slasher Scare uses the dodge pose. point, aim, spread, hip, clap, carry, shrug are painted; story poses sit, toast, sitR, hug, whisper plus new wave, talk, laugh are painted. Saved but not yet used in a move: heave, crouch.
- Known roughness: small sleeve slivers beside the head on a few frames (windup, strike, leap, win, kneel, crouchlook).
- No spoken lines changed.

## 2026-10-29: Grace's cartwheel and gymnastics poses are painted
- New pose sheets `tools/sprite-bake/src/grace-poses-a1.png` (lunge, star, handstand, land, knee lift, front kick, floor split, bridge, dance, balance, bow) and `grace-poses-a2.png` (tuck, leap, salute, dance, balance, bow), baked by `python3 tools/sprite-bake/bake_grace_poses.py` into `art/chars/grace-wheel.webp` (16 frames, 260 px, hip at the centre of each frame; the hip is the leggings centre nearest the leotard) and `data/grace-wheel-hires.js` (generated).
- `data/grace-wheel-use.js` swaps the picture only: `GRACE_WHEEL.frame` and `.mirror` now return a painted 130 x 130 frame (drawn at scale 1, the same 130 px box as the old 65-row frames at scale 2); the hip path, planted hand or foot and rotation maths in `data/grace-wheel.js` are unchanged. Tweens between two model poses show the nearer painted pose. Used by Cartwheel's showpiece, Judge Grace (Tom and Grace), and the round-off combos. Set `GRACE_WHEEL_HIRES_OFF=true` to get the pixel frames back.
- This also fixes the pixel cartwheel frames drawing at half size since the painted Grace went in (her sprite scale is now 1, the frames were built for 2).
- Not wired yet: `GRACE_WHEEL.painted(name)` also holds handstand, leap, salute, dance, balance, bow, split and bridge for other moves (Handstand Contest, Split Leap, Olympic salute, DANCE). They are hip-centred, not feet-aligned like the battle frames.
- `sheet.py` gained `split_erode` (figures that nearly touch are separated by eroding, then each pixel goes to its nearest figure).

## 2026-10-28: Painted Grace (battle, knocked out, overworld)
- Grace now comes from her painted sheets (`tools/sprite-bake/src/grace-battle-v2.png`, `grace-walk-v2.png`, hero `grace-hero-v2.png`), baked by `python3 tools/sprite-bake/bake_grace.py` into `art/chars/grace-battle.webp`, `grace-ko.webp`, `grace-ow.webp` and `data/grace-hires.js` (generated). `data/grace-hires-use.js` swaps her in (set `GRACE_HIRES_OFF=true` to get the old pixel Grace back). Battle idle is 80 rows at scale 1 (old: 40 rows at 2, same height); overworld stands 38 rows (old 43 x .88).
- Her violet leotard is close to the magenta background, so `sheet.py` has a `robust=True` cut (distance to the real background colour; interior pixels untouched; only the rim and pink hair strands are cleaned). Tom's bake still uses the old cut.
- The bake paints in what the sheet avoids: a black eye on the kneel pose (low HP) and a dizzy spiral on the knocked-out pose. The startled pose is the hurt pose as drawn. A `beg` frame (kneel without the bruise) feeds the Squishy Delivery begging pose.
- Outfit colours: `engine/painted.js` atlases take an optional tint function; Grace's picks the violet pixels only (Tom's default is unchanged). `drawSprite` now honours a per-frame palette (`rows._pal`).
- Known roughness: her bespoke cartwheel poses (`data/grace-wheel.js`, used by Cartwheel's showpiece, Grace's Tombo move and her round-off combos) are still built from the old pixel body and keep the old palette, so they look pixel-style mid-move; the Olympic leotard colour swap does not show on the painted body; windup, leap, hurt and cast poses are baked but not wired yet (Track B, same as Tom).

## 2026-10-28: Painted Rose (battle, kneel, KO, overworld)
- Baked from Tom's Rose sheets with `tools/sprite-bake/bake_rose.py`; `data/rose-hires.js` is generated, `data/rose-hires-use.js` swaps her in (`ROSE_HIRES_OFF=true` falls back to the old pixel Rose). Battle is 72 rows at scale 1 (Tom is 100); overworld 35 rows. Raspberry mouth point is `{col:34,row:20}`.
- Black eye is painted onto the kneel frame by the baker (the sheets avoid injury wording). KO is the napping pose as drawn. Startled is used as hurt.
- Outfit recolour: `painted.js` has a `coral` tint mode (picks the coral tunic by hue, keeps shading); Rose's atlases use it. `gear.js` takes her garment keys from the baked meta.
- Shoulder ride (`data/rose-ride.js`) is still the old pixel Rose, kept on her old palette (`ROSE_RIDE_PAL`). Painted ride art is still to do.
- No spoken lines changed.

## 2026-10-28: Tom's House rebuilt from the real floor plan (Area 46, map id `tomhouse`)
- New 19 x 43 map (was 16 x 35), 2.5 ft per tile, one tile walls, laid out from the architectural plan. Specs and reasoning in `docs/area46/` (geometry review, walkmap, JSON, art corrections list for the future painting). Drawn with the game's own tiles for now; a painted plate (1216 x 2752) can replace it later.
- Rooms: back yard, rear deck and west lawn; primary bath, wardrobe and bedroom; laundry, pantry, central hall; office (entered through its closet); jetted-tub bath; guest bedroom with its own bath and east storage; open kitchen, dining and living room; entry.
- Front door is a double door (two exit tiles at 5,38 and 6,38); spawn is 5,37. Exterior house door on Jefferson Park is unchanged.
- Assumed doors (plan shows none): guest bedroom, jetted bath, pantry; backyard linked to the deck by three tiles. See the review doc.
- All 40 original objects kept with their text, re-placed; 8 new props (shrubs, sideboard, cabinets, primary toilet) with short new text. Bed and shower still restore. Guest bath fixtures re-laid so each is touchable.
- New `tools/tomhouse_test.py` (all floor reachable, every object touchable, both door tiles exit to Jefferson Park, 14 shots).
- Not reworded: no spoken lines changed. No walk-behind layer yet (engine has none for tile rooms).

## 2026-10-29: Downtown LA south exit is wider
- The crosswalk exit from Downtown LA (`blvd`) to Jefferson Park (`jpark`) is now 4 tiles wide (x 14 to 17 on the bottom row) instead of 2. Walk map only, the painting is untouched.
- `blvd`: exits and border openings added at (16,25) and (17,25); tile (14,23) opened so Tom can step onto the crosswalk from the street. `jpark`: the top of the map (rows 0 to 5) is 4 wide at x 14 to 17, with matching exits at (16,0) and (17,0), so the passage lines up both ways.
- Tested: tools/reach_test.py, blvd_test.py, jpark_test.py, smoke.py, and a key-press walk through every tile both directions.

## 2026-10-28: Painted plate for Downtown LA (the boulevard, map id `blvd`)
- Downtown LA now uses Tom's painting (`art/blvd.webp`, 1920 x 1664, 30 x 26 tiles at 64 px, entry in `PLATES`). The clean version was used; the grid image was only a guide. A `plateMask` in `data/maps-la.js` is the walk map. Spawn is now (26,22), on the pad in front of the Cab Co. door.
- The painting is drawn in perspective, so the street slopes down to the right and the lower buildings sit lower than the grid markers. Doors were moved onto the painted doors by shifting the building rows: Coffee (4,7), Ramen (11,7), Starlite (18,7) unchanged; Nickel's (24,8), Wardrobe (4,18), TNB's Loft (10,19), Grand Tower (18,20), Cab Co. (26,21). Every door is entered from the sidewalk pad in front of it.
- The painting has no street at the top edge and the right-hand wall blocks rows 9 and 10, so two exits moved onto roads that are painted: the Griffith Park trail now leaves west along the main road (0,9) and (0,10) (the smog barrier moved with it), and the studio road leaves east at (29,12) and (29,13) past the crosswalk (the closed-set barrier moved too). Jefferson Park is still the south crosswalk (14,25) and (15,25). Arrival tiles in Griffith, the studio and Jefferson Park were updated to match. The area hint now names all three.
- Walkable: both sidewalks, the main road, the crosswalks, the west street down the left edge (the only way round to the south sidewalk, one tile wide), the sidewalks in front of the lower shops and the south plaza. Blocked: every building, the rooftops, palms, lamp bases, the taco truck, the bus shelter, the taxi, the Metro stairs, the hot dog cart, the bench. Thin lamp poles and the signpost by the corridor stay walkable.
- Objects re-laid onto the painting: taco truck (21,11 3x3), hot dog cart (5,8 2x1), bus bench (24,12 2x2), Metro stairs (19,23 3x2), Cab 8 on the painted taxi (23,22 3x1), shop sign by Nickel's door (23,8), Bird of paradise on the painted pots (22,8), DTLA banner notice (28,14), south signpost (15,23), trail signpost (2,9). The old palm and lamp objects are gone (the mask blocks the painted ones). Chet moved to (9,11) and Wes to (9,21). NPCs never stand on the one-tile corridors (`noGo`), so nobody can plug a door.
- Other chapters that land on the boulevard were re-pointed: chapter 4 TNB waits at (21,22) by the Metro; the chapter 13 sub-rail return lands at (20,22) in front of the stairs; chapter 17 lobby exits land at (12,9) and (14,9), the opening starts at (14,9), and the Glass Tower front is drawn on the sidewalk (13,8 4x1) between Ramen Ramen and the Starlite.
- New `tools/blvd_test.py` (objects touchable, NPCs on floor, arrival tiles walkable, all eight doors open the right building from the pad and bring Tom back, south, west and east exits both ways, A on the props, portrait and landscape shots in `tools/shots/blvd-*.png`). `tools/ch17_test.py` now stands at (14,9) for the tower front. `tools/reach_test.py blvd` 0 fails, `tools/smoke.py`, `tools/ch13_test.py`, `tools/ch17_test.py` no fails.
- Known roughness: the minimap still draws the old tile look; the chapter 17 Glass Tower front is drawn live over the painted sidewalk and rooftops until that chapter gets its own painting; the west street uses a planter bed as a walkway at (1,12); the small cypress and trash cans are walk-through.
- Not reworded: no spoken lines changed. Object names changed only for the signpost ('Trail signpost'); object text is unchanged.

## 2026-10-28: Painted plate for Long Island Taxi Co.
- The taxi office (map id `taxi`, 11 x 9 tiles) now uses Tom's painting (`art/taxi.webp`, 704 x 576 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,8) and spawn (5,7) are unchanged; the one-tile aisle between the two gate posts (x 5, rows 7 and 8) is the way out.
- Walkable: the rug and floor in front of the desk (x 2 to 7, row 5), the wide strip below it (row 6), and the front row either side of the posts. Blocked: the whole back wall and dispatch desk (rows 0 to 4), left plant and chair, lost and found table, umbrella stand, gate posts.
- Objects re-laid to the painting (the grid markers were the old positions): Key board (2,0) 1x5, Dispatch desk (3,0) 3x5 (radio, map, mug), Driver of the month (6,0) 4x5 (photo, clock, phone, file cabinet), Lost and found (8,5) 2x1 on the painted table, Waiting room plant (0,5) 2x2, new Umbrella stand (10,5) 1x2. The wall items are not reachable on their own, so each object is a tall strip that runs from the wall down to the desk front and is touched from row 5.
- Sal is now `roam:0` (stays on the rug at (5,5)). He used to wander, and the aisle between the posts is one tile wide, so he could have trapped Tom inside.
- New object text (not voiced): Umbrella stand. No spoken lines changed.
- New `tools/taxi_test.py` (copied from tea_test.py; Sal's dialogue can fly the party to LA, so the test reloads the room after it). `tools/reach_test.py taxi` 0 fails, `tools/smoke.py` no fails, `tools/tea_test.py` still passes.
- Known roughness: the minimap still draws the old tile look; the file cabinet and coat rack have no line of their own.

## 2026-10-28: Painted plate for Griffith Park
- Griffith Park (map id `griffith`, 24 x 22 tiles) now uses Tom's painting (`art/griffith.webp`, 1536 x 1408 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-la.js` is the walk map. Tom sent only the grid and final images; the grid markers were the OLD positions and the painting did not follow them, so everything was re-laid onto the painted features.
- Walkable: the main trail up the middle (bottom exit to the steps, trailhead sign, lookout bench, fault rock, up past the tar pit), the ridge trail at the top (x 12 to 16, row 3), the east trail (rows 11 to 12), the west slope toward the Observatory hill (x 2 to 7, rows 6 to 10) and the shore path under the south tar pit (rows 17 to 18). Both tar pits are blocked.
- Exits moved to (10,21) and (11,21) (the painted trail is there, the old 7 and 8 were cactus); the Boulevard exits now land at (10,20) and (11,20). Spawn (11,19).
- Objects: Trailhead sign (13,13) 2x1, Tar warning (14,6), Lookout bench (16,15) 2x1, Fault marker (13,10) 3x1 on the painted rock, and the Observatory text now lives on the Lookout rock (17,3) 2x1 because the dome cannot be reached on foot. The Hiking bench is gone (no bench is painted there). Object text for the Lookout rock changed; not voiced.
- Monster spots re-laid: Smoglet (9,17), Ticket Flurry (20,12), Canyon Coyote (13,8), Gridlock (15,3), Tar Pit Blob (5,8), The Big Shake (3,6) on the west slope. Story triggers are unchanged (the boss fires when the party enters x 1 to 8, rows 1 to 7, which the west slope reaches at row 7). Chapter 2 smog pipes redrawn at the painted Observatory base (5.4, 2.1) and (6.9, 2.1).
- New `tools/griffith_test.py` (objects touchable, every monster on a reachable tile, walking up the trail and out the south exit to the Boulevard, shots in `tools/shots/griffith-*.png`). `tools/smoke.py` 0 fails.
- Known roughness: the minimap still draws the old tile look; the Observatory itself is scenery only; the chapter 2 boss walk (west slope) and the pipe positions have not been looked at on the phone.
- Jefferson Park (map id `jpark`, 30 x 24 tiles) now uses Tom's painting (`art/jpark.webp`, 1920 x 1536 at 64 px, entry in `PLATES`). Used the clean version (`27_jpark_final.png`). A `plateMask` in `data/maps-la.js` is the walk map: street, N-S path (x14,15), sidewalks, house walkways. Street trees, hedges and yards are blocked by the mask, so the old tree, fence and wall objects were removed. Spawn, edge exits and scripted drop-in tiles (4,19), (7,19), (28,10), (14,22) are unchanged. Doors re-laid onto the painting: the four shops now enter from the landing (y6, was y7; Odette's door x5, La Ceiba x10), Tom's house door moved to x3 (the painted stairs). Larry moved from the old tree yard to (8,6). Objects re-laid onto painted things: Front garden (2,15), Front yard (17,15), Drought garden (24,15), Street sign (16,6), plaque (13,18), Jefferson Boulevard sign (17,7), Bus bench (21,5), 2nd Ave signs (2,19) and (28,19). Parked cars block tiles; the juice bar exit tile overlaps the car roof edge. New `tools/jpark_test.py`.

## 2026-10-28: Painted plate for the Post (Snail Mail)
- The Post interior (map id `post`, 10 x 12 tiles) now uses Tom's painting (`art/post.webp`, 640 x 768 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,11) and spawn (5,10) are unchanged; the steps (x 4 and 5, rows 10 and 11) are the way out.
- Walkable: the floor in front of the counter and down the blue runner (x 3 to 6, rows 5 to 8), the aisle past the counter's right end (6,3), (6,4), (7,4), row 9 along the bottom, and the steps. Blocked: sorting counter and back wall, pigeonhole shelf and parcel scale, the big stamp desk with its chair and stool, the left plant and window sill, the stair railings.
- Objects re-laid to the painting: Post boxes now on the pigeonhole shelf (5,0) 2x3, touched from (6,3) (the wall cabinet behind the counter is not reachable); Sorting counter (1,3) 5x2; Stamp desk (7,5) 3x3 on the painted desk; Office plant (0,5) 3x4 on the big plant; new Parcel basket (8,9) 2x1. Kit now stands at (7,4) beside the counter's right end. Walls entries removed (the mask replaces them).
- New object text (not voiced): Parcel basket. No spoken lines changed.
- New `tools/post_test.py` (objects touchable, Kit on floor, A opens dialogue at every prop and at Kit, walking up from the steps and back out to the Square, portrait and landscape shots in `tools/shots/post-*.png`). `tools/reach_test.py post` 0 fails, `tools/smoke.py` no fails, `tools/greenhouse_test.py` still passes.
- Known roughness: the minimap still draws the old tile look; the wall cabinet behind the counter has no line of its own.

## 2026-10-28: Painted plate for Luna's observatory (Moon Club entrance)
- Luna's observatory (room id `observatory`, 13 x 12 tiles, shown in the HUD as "Moon Club") now uses Tom's painting (`art/observatory.webp`, 832 x 768 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,11) and spawn (6,10) are unchanged. The old `walls` list is gone.
- Walkable: the moon rug and floor in the middle, the strip under the bookshelf (x 5 to 10, row 4), the door rug (10,3), the left aisle (x 3 to 4, row 5 and 8), and the stairs (x 6, rows 9 to 11, one tile wide). Blocked: telescope platform and ladder, left cabinets and the desk with its chair, bookshelf and scroll barrel, star chart and globe cabinet, crates, front railing and planters.
- Objects re-laid to the painting: telescope (3,2) 3x2, research desk (1,6) 3x2, space books (6,2) 4x2 (shelf plus scroll barrel), star chart (10,5) 3x3 on the Lost Sock board, new Supply crates (8,8) 3x2 (kind `toybox`), silver club door (10,2) 1x1. Luna stays at (5,6) on the rug.
- The Moon Club stairs (`moonclub` exit) now arrive on the door rug (10,3) instead of (11,2). The door is touched from (10,3) facing up. The painted door does not show open or closed; the story text still does.
- New `tools/observatory_test.py` (objects touchable, Luna on floor, A opens dialogue at every prop including the club door, door rug walkable, walk up the stairs and back out to the Square, portrait and landscape shots). `tools/reach_test.py observatory` 0 fails, `tools/moonclub_test.py` 0 fails, `tools/smoke.py` no fails.
- New object text (not voiced): Supply crates. No spoken lines changed.
- Known roughness: the minimap still draws the old tile look; the painted door is always drawn closed.

## 2026-10-28: Painted plate for Penny's Pockets (the shop)
- Penny's Pockets (map id `shop`, 11 x 9 tiles) now uses Tom's painting (`art/shop.webp`, 704 x 576 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,8) and spawn (5,7) are unchanged; the rail across the front has one gap, so the doorway is one tile wide.
- Objects re-laid onto the painted furniture: counter unchanged (3,3,5,1, Penny stays at (5,2) behind it); gear shelf and snack shelf now 2 x 2 (each touchable from the floor row below); battle bin now (0,5,2,2) with its barrel; shop plant now (9,5,1,2).
- New `tools/shop_test.py`: every object touchable, A opens a dialogue at each prop, the counter opens the shop from x3, x5 and x7, Penny behind the counter, bin and counter block walking, doorway returns to the Square, portrait and landscape shots in `tools/shots/shop-*.png`. `tools/reach_test.py shop` 0 fails, `tools/smoke.py` no fails.

## 2026-10-28: Painted plate for the Hush Library
- The Hush Library (map id `library`) now uses Tom's painting (`art/library.webp`, 1280 x 1088, 20 x 17 tiles at 64 px, entry in `PLATES`). The room grew from 13 x 11 to 20 x 17.
- Reading the grid image: blue (10,16) street door, green (10,14) arrival spot, purple (10,11) Page, orange (17,2) staff door. The teal dot (16,13) sits on the low wall, so it was not used.
- Street door is now two tiles (9,16) and (10,16); `makeRoom` gained `door2` and `spawn` options. The staff door is at (16,4) 2 wide and the Stacks stairs now arrive at (17,5).
- Objects re-laid onto the painting: serious books (2,3), less serious books (11,3), reading desk (3,11), cactus table (17,11), plus a new Reading table on the rug (8,7) with one new unvoiced line. Page roams 2 tiles.
- New `tools/library_test.py`: every object touchable, no walkable island, Page answers, staff door to the Stacks, street door to town, portrait and landscape shots.
- Known roughness: minimap still draws the old tile look. Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Kettle Cottage (the tea room)
- Kettle Cottage (map id `tea`, 12 x 9 tiles) now uses Tom's painting (`art/tea.webp`, 768 x 576, 64 px per tile, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,8) and spawn (6,7) are unchanged.
- The grid image's markers were the old object positions, and the painting did not follow them (the biscuit table is two tiles further right, the counter is longer). Objects were re-laid onto the painted furniture: Tea for two (2,3 2x2), Biscuit table (9,3 2x2), Mint plant (1,5, the big left planter), the kettle counter (5,1 5x2). Oolong still starts at (5,3).
- New `tools/tea_test.py`: objects touchable, Oolong on floor, A opens dialogue at every prop, walking down the door gap returns to the Square, portrait and landscape shots in `tools/shots/tea-*.png`. `tools/reach_test.py tea` 0 fails, `tools/smoke.py` no fails.

## 2026-10-28: Painted plate for Sprout House (the greenhouse)
- Sprout House (map id `greenhouse`, the Square's greenhouse interior) now uses Tom's painting (`art/greenhouse.webp`, 768 x 640, 12 x 10 tiles at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,9) and spawn (6,8) are unchanged.
- Walkable: the strip in front of the beds, the aisle either side of the barrel plant, the green rug, the arch (x 5 and 6, rows 8 and 9). Blocked: the glass wall, back bench, both potting beds, the barrel plant, the plant stool and hose on the left, the gardening shelf and plants on the right, the hedges and gate posts at the bottom.
- Objects re-laid to the painting: The Steves (1,2) 4x2, the other Steves (7,2) 4x2, Assistant Steve on the plant stool (2,5) 1x2, gardening shelf (8,6) 3x2. All touched from the floor in front. Fern stays at (7,5). Object text unchanged.
- New `tools/greenhouse_test.py`: objects touchable, Fern on floor, A opens dialogue at every prop, walking down the arch returns to the Square, portrait and landscape shots in `tools/shots/greenhouse-*.png`. `tools/reach_test.py greenhouse` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the minimap still draws the old tile look; the barrel plant in the middle has no line of its own yet.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Crumb Bakery
- The Crumb Bakery interior (room id `bakery`, 11 x 10 tiles) now uses Tom's painting (`art/bakery.webp`, 704 x 640 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,9) and spawn (5,8) are unchanged.
- Walkable: the rug and checker floor (x 2 to 9, rows 4 to 7), the nook beside the work table (3,3), and the doorway and mat (5 and 6, row 8). Blocked: oven and work table, bread counter, window benches, fern, dresser, roll basket, half wall.
- Objects re-laid: oven (1,2) 2x2 on the work table, bread display (4,2) 5x2, new Window benches (1,4) 1x2, recipe shelf (10,3) 1x4 on the dresser, flour fern (0,6) 2x2, new Roll basket (10,7). All touched from the floor in front. Bun stays at (4,5) on the rug.
- New `tools/bakery_test.py` (objects touchable, Bun on floor, walk up from the door and back out, A opens the counter text, portrait and landscape shots). `tools/reach_test.py bakery` 0 fails, `tools/smoke.py` no fails.
- New object text (not voiced): Window benches, Roll basket. No spoken lines changed.

## 2026-10-28: Painted plate for Terminal Zero (chapter 10)
- Terminal Zero (map id `terminal`) now uses Tom's painting (`art/terminal.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). Used the clean version (`Terminal_Zero_Area_14_1920x1408_v2.png`, signs left blank); the lettered version was not used. The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- The painting is centred, so the doors moved: curb doors are now (14,21) and (15,21) (spawn (15,20); Sal's cab and the ch10 intro arrive at (15,19)), Gate Zero doors (14,1) and (15,1); Gate Zero sends the party back to (14,2) and (15,2).
- Gate clock stays drawn on top of the painting (`liveKinds:['gateclock']`) because its hands, coin slots and glow change with the story; it sits on the top edge of the painted gate doors. The dim lamp-light effect before the clocks start still runs over the painting.
- Objects re-laid onto the painting: scanner (3,3), X-ray (4,4, 3x2), bins (8,4, 2x2), belt posts (1,6) and (5,6), departure board (13,7, 4x2), benches (4,8) and (18,8), direction signs (left (1,7), right (26,7), new text), carousel (19,3, 8x4), lost and found (27,3), luggage cart on the red cabinet (29,5), lounge couch (1,15), armchairs (4,15) and (7,16), snack bar (1,13), amenity cabinet (10,12), check-in counter (17,14, 8x1), photo booth (28,12), plants (11,7), (18,7), (12,12), Kevin (28,16). The painting has no moving walkway or "you are here" directory, so the directory became the two direction signs.
- Monsters moved onto floor: Long Line (10,4), Jet Lags (9,6) and (6,17), Carry-Ons (6,10), (24,9) and (27,6), Unclaimed (27,5), Armrest Hog (6,15). Wing triggers: Security [1,1,11,6], Baggage Claim [18,1,28,6], Lounge [1,14,13,17].
- The plants beside the departure board are walkable so the corridor has a way round the board; the lounge opens from the corridor along rows 15 and 16.
- New `tools/terminal_test.py`: every object touchable, every monster and trigger on reachable floor, both pairs of doors reachable, Gate Zero return lands on floor, portrait and landscape shots in `tools/shots/terminal-*.png`. `tools/reach_test.py terminal gatezero` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the minimap still draws the old tile look; the Baggage Claim wing is a small nook at the right because the painted carousel fills the room; the two armchairs by the lounge entrance and the plants by the board are walk-through.
- Not reworded: no spoken lines changed (object text for the two direction signs and the couch is new or edited, none of it voiced).

## 2026-10-28: Painted plate for the Dome (top of the Moon Club, chapter 9)
- The Dome (map id `dome`) now uses Tom's painting (`art/dome.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- Walk map: the dance floor (rows 5 to 9, narrowing to rows 10 and 11) and the carpet up from the stairs (x 9 and 10, rows 12 and 13). The stage, both rails, the corner tables and the two big palms block. Exits (9,13) and (10,13) and spawn (9,12) are unchanged, so the Moon Club doors still land correctly.
- Objects re-laid to the painting: left band chairs and music stands (4,3, 3x2), drum kit (10,3, 2x2), telescope (17,3, 2x2; was (17,7)), left palm (6,11, 2x2), right palm (12,11, 2x2). All are touched from the dance floor in front of them.
- The Mirrorball now hovers at (9,5) over the dance floor (was (9,3), which is now behind the painted piano). The chapter 9 boss scene positions (Tom 9,7, Deedee 8,7, Boppy 10,7) are on open floor and unchanged. The fight glow in `data/scenes.js` follows the new height, and the old dark wash over the Dome is skipped on the painting.
- New `tools/dome_test.py`: objects touchable, Mirrorball and boss stand tiles on reachable floor, A opens dialogue at every prop from a real key press, walking down the carpet with the arrow key returns to the Moon Club, portrait and landscape shots in `tools/shots/dome-*.png`. `tools/reach_test.py dome moonclub` 0 fails, `tools/moonclub_test.py` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the painting always shows the full moon in the glass (top right), but the story has the moon missing until the Mirrorball is beaten, and the telescope line says "no moon at all". Hiding it needs a second painting without the moon; erasing it in code also erased the glass bar across it. The minimap still draws the old tile look.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Gate Zero (chapter 10)
- Gate Zero (map id `gatezero`, the last room of Terminal Zero) now uses Tom's painting (`art/gatezero.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Spawn (9,12) and the exit down to Terminal Zero ((9,13), (10,13)) are unchanged.
- Walkable: the red carpet aisle, the stone floor, the strip in front of the window (row 4, x 7 to 15) and the walkway at the bottom. Blocked: the window wall, the podium, the jet bridge door, the four bench rows, the two potted plants and the gate posts.
- Objects re-laid to the painting: podium (4,3) 3x2, jet door (14,1) 2x3 (touch it from the strip in front, row 4), benches (3,5) 5x2, (12,5) 5x2, (1,8) 6x2, (13,8) 6x2, plants now on the painted pots (1,10) and (17,10), 2x2. Object text is unchanged.
- The Last Call now stands at (9,4) (was (9,3), which is window wall now); challenge it from (9,5). Boss scene stand tiles (9,7), (8,7), (10,7), (11,7) are open floor; played the intro scene on the painting.
- The old drawn plane in the window is skipped on the plate (`data/scenes.js`). The plane is part of the painting, so after the chapter 10 boss the plane no longer flies away.
- Tests: new `tools/gatezero_test.py` (objects touchable, stand tiles walkable, key presses up the aisle and out to Terminal Zero, portrait and landscape shots); `tools/reach_test.py gatezero terminal` 0 fails; smoke no fails. Known roughness: the minimap still draws the old tile look. No spoken lines changed.

## 2026-10-28: New painted Tom (overworld and battle)
- Tom now comes from his painted character sheet (`tools/sprite-bake/src/tom-sheet.png`), baked by `python3 tools/sprite-bake/bake_tom.py` into `data/tom-hires.js` (generated, never hand-edit). `data/tom-hires-use.js` swaps it in for the old pixel Tom: `BATTLE_SPRITES.tom` (about 100 rows at scale 1, was 40 rows at 2.6), `TOM_OW` (44 rows, same size as before) and `KO_SPRITES.tom`. Same palette-key and row-string format as everyone else, so outfits, combo moves, Rose's shoulder ride and flashes all keep working. Set `TOM_HIRES_OFF=true` before `data/tom-hires-use.js` to get the old Tom back.
- `drawSprite` (data/battle-sprites.js) draws any sprite of 60 or more rows through an offscreen canvas cache (`bigSpriteCanvas`, keyed by frame, palette, scale, flash, outfit tint, kneel cut), so more detail costs one `drawImage`. The old small sprites are untouched.
- Outfit recolour for Tom (`GARMENT` in engine/gear.js) now reads the keys and rows the baker found (`TOM_HIRES.meta`). Known roughness: a few dark shirt highlights on the far shoulder keep their colour, and the chin can pick up a trace of tint.
- Low health now shows the painted kneel with the black eye (the old bruise overlay is skipped for `sp.hires`). Defend guard uses the painted bodyguard pose (`sp.defend`). KO uses the painted lying pose at 0.8 scale.
- Painted poses baked but not wired yet: `windup`, `leap`, `hurtPose`, `castPose` (on `BATTLE_SPRITES.tom`), plus six face expressions in the sheet.
- Tests: `tools/smoke.py` (tnb,nara and grace,rose) FAILS [], `tools/kit_test.py tom --speed2` all moves ran with their lines, frames looked at. Outfit tint, low HP, KO, Rose ride and the town overworld looked at in screenshots.
- Not reworded: no spoken lines changed.

## 2026-10-28: Tom is now truly painted (bitmap sprites)
- Tom is drawn from his two new painted pose sheets (caricature, no outlines): `tools/sprite-bake/src/tom-battle-v2.png` and `tom-walk-v2.png`, baked by `bake_tom.py` into `art/chars/tom-battle.webp` (2x), `tom-ko.webp` (2x), `tom-ow.webp` (3x) and `data/tom-hires.js`.
- New `engine/painted.js`: rows tagged `_paint` draw their painted frame (flip, flash and outfit recolour supported); rows are the fallback while the image loads. `drawSprite` has the fast path; `mirrorRows` (engine/tiles.js) keeps the tag and toggles `flip`. `garmentTint` now also returns `color`, used to recolour the painted shirt.
- Same row geometry as before, so Rose's ride, hand points, hurt, KO, defend and outfits all still work. `TOM_HIRES_OFF=true` restores the old Tom.
- New `tools/sprite-bake/sheet.py` slices magenta sheets with soft alpha and despill. Still not wired: windup, leap, hurt flinch and cast poses; overworld Rose ride on the new Tom is unchecked.
- Tests: smoke and kit_test tom, frames looked at. No spoken lines changed.

## 2026-10-29: Starter Splash and Popcorn Jump use painted poses
- `tools/sprite-bake/src/tom-poses-v2.png` (12 poses) baked into `art/chars/tom-poses.webp` with the first set: `carry, raise, lidpop, splash, goo, proud` (Starter Splash) and `bowlsit, spook, scream, bowlthrow, cower, frozen` (movie night, terrified). The jar and popcorn bowl are painted into the poses.
- Starter Splash (engine/tom-moves.js): carry, raise, lid pop, splash, goo, proud; the drawn jar (`tv_jar`) is skipped while painted poses are on.
- Popcorn Jump (`B2_TOMBO_ANIM.tnb1`, engine/battle2-kind.js): Tom sits with his painted bowl, is spooked, screams mid-jump while the game's bowl flies, cowers, then stands proud for the kiss. The drawn lap bowl is skipped. `bowlthrow` and `frozen` are baked but not used yet.
- `tools/sprite-bake/sheet.py` now merges loose debris (flying popcorn) into the nearest figure. Script versions bumped to `?v=tom4`.

## 2026-10-29: Painted controller for Press Start
- `tools/sprite-bake/src/prop-controller.png` baked by new `tools/sprite-bake/bake_props.py` to `art/chars/prop-controller.webp` (levelled, 200 px wide). `ctl()` in engine/tom-moves.js draws it (wind-up, throw, falling); the old drawn controller is the fallback until it loads.

## 2026-10-29: Tom's arrival stretch (painted)
- `tools/sprite-bake/src/tom-stretch-v1.png` (8 front-facing poses) baked to `art/chars/tom-stretch.webp`; `TOM_STRETCH` (data/tom-hires-use.js) holds them: tired, start, full, side, crack, neck, exhale, fresh.
- `engine/intro.js`: the cab-line stretch now plays all of them over 5.2 s (`drawStretchPainted`), with a second exhale sound; the old drawn-arms version remains as the fallback when `TOM_HIRES_OFF` is set.

## 2026-10-29: Tom's custom battle poses and a front-facing walk
- New walk sheet: Tom's head faces straight at the camera when he walks toward you (`tom-walk-v2.png` replaced).
- New pose sheet `tools/sprite-bake/src/tom-poses-v1.png` (12 poses) baked to `art/chars/tom-poses.webp` (own canvas, so Tom's idle box and Rose's shoulder ride are unchanged). On `BATTLE_SPRITES.tom` as `hold, annoyed, tw_windup, tw_follow, lift, fling, unbox, flick, brush, limit, startled, direct`; use them as `f:'hold'` in a move's `ST.keys`.
- Wired so far: Press Start (`button_mash`: hold, annoyed, wind-up, throw). The `hold` pose has a painted controller, so the game's own controller is skipped until the "UGH" beat. Not wired yet: lift (Dutch Oven), fling (Starter Splash), unbox, flick (Flashcard Flurry), brush (Kanji Strike), limit (Final Boss), startled, direct.
- Outfit recolour on these poses uses fixed torso fractions (rough).

## 2026-10-28: Painted plate for the Moon Club
- The Moon Club hall (map id `moonclub`, chapter 9) now uses Tom's painting (`art/moonclub.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map. The Dome (upstairs) is not painted yet.
- The painting has no walls between the hall and the Coat Check and Card Room tops, so the rooms are tighter than the old plan: Coat Check floor is the rug strip (row 5, x 3 to 9) reached through the painted carved door (5 and 6, rows 6 to 8, opened in the wall); the Card Room is the strip x 17 to 18 plus row 5 (x 18 to 21) beside the tables. The Ballroom is the painted dance floor, entered through the gap in the rail at the top (x 12 to 18).
- Dome doors: now on row 2 (the foot of the painted doors). Exits are (14,2) and (15,2); the Dome sends Tom back to (14,3) and (15,3). `ch9OpenDoors` (data/scenes.js) opens whatever row the doors object is on. The moonbeam path (row 11 from the east, column 21, row 9, column 15) is unchanged and kept walkable in the mask so painted props never cut it off; tested: it still reaches the doors with all three mirrors back and turned.
- Mirror stands stay drawn on top of the painting (new spec field `liveKinds`, `buildArea` in engine/world.js) because the puzzle shows which are back and which way they lean. Every other prop is baked into the painting.
- Objects re-laid onto the painting: coat rail (5,3) and counter (7,3) on the desk, rope posts (3,4) and (9,4), velvet chair (10,4), plaque (21,8, reached from (22,9)), palms (10,8), (8,11), (8,19), (22,14), card tables (19,3) and (22,5), bar (18,2, the sideboard; the long painted bar is out of reach), monocle chair on the sofa (24,9), piano (10,13), jukebox (19,13), gold frame (23,15).
- Monsters moved onto floor: Hanger-On (8,5), Sore Loser (20,5), Stuffed Shirt (18,5) and (19,16), Wallflower (11,17); the two Velvet Ropes stay in the hall.
- New `tools/moonclub_test.py`: every object touchable from the spawn, every monster on reachable floor, beam hits the doors, doors open, portrait and landscape shots in `tools/shots/moonclub-*.png`. `tools/reach_test.py moonclub dome` and `tools/smoke.py` pass.
- Known roughness: the minimap still draws the old tile look; the east round window glows at the far right edge; where the beam and painted props overlap (palm at (19,9), mirror stands) the player walks in front of them; the right-hand strip (x 28) is a dead-end nook.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Stacks (under the Hush Library)
- The Stacks (map id `stacks`, chapter 7) now use Tom's painting (`art/stacks.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map. The generated wall-of-bookcase objects are gone (`planStacks(plan,true)` skips them); four bookcase objects now sit on painted shelf fronts beside the aisles.
- Walk map: the green runner from the Reading Room doors (14,1) and (15,1) down to the hall; the hall is rows 8 to 10 with a front lane on row 7 that joins the Fiction aisle (x 5 and 6, left) and the Nonfiction aisle (x 26, right); a gap (x 14 to 16) leads down to Picture Books; the story rug area, the rocking chair pocket and the star rug pocket are all reachable. Exit to the library stays (0,10), spawn (1,10); the Reading Room exits still land on (14,2) and (15,2).
- Objects re-laid to the painting: globe (12,8, 2x2), returns cart (16,8, 2x3), reading table (27,6, 2x2), Stacks sign on the signpost (20,8), rolling ladder (27,3), low shelves (8,19) and (19,19), story time chair = the rocking chair (7,15, 3x2), puppet theater (23,13, 3x3), beanbag (23,16, 2x2); Fiction bookcases (4,6) and (7,6), Nonfiction bookcases (25,3) and (25,5).
- Monsters moved onto open floor: Shushers (8,10) and (21,9) unchanged; Dog-Ears (6,6) and (26,5); Cliffhanger (6,4); Know-It-All (26,3); Pop-Up Panic (16,17). The three wing triggers (Fiction [1,1,12,7], Nonfiction [17,1,28,7], Picture Books [8,13,21,19]) are unchanged and all contain open floor. Because the front lane (row 7) is now walkable, walking along it at x 12 or less (or x 17 or more) is what starts the Fiction or Nonfiction scene.
- Known roughness: the aisles are single file (the Fiction and Nonfiction aisles are 1 to 2 tiles wide, and the monsters stand in them); the painted left entrance is a post and lamp, so (0,10) and (1,10) walk through it; the minimap still draws the old tile look.
- Tests: new `tools/stacks_test.py` (objects touchable, monsters and triggers on reachable floor, left exit to the library, Reading Room doors shut then open and lead up); `tools/reach_test.py stacks library readroom` 0 fails; `tools/smoke.py` no fails; looked at portrait and landscape shots (`tools/shots/stacks-*.png`).
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Reading Room (chapter 7)
- The Reading Room (map id `readroom`, under the Hush Library) now uses Tom's painting (`art/readroom.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- Walkable: the dais carpet (row 2, x 8 to 11), the painted steps (row 3, x 7 to 12), the floor, and the gate (9,12) to (10,13), which still leads down to the Stacks. Spawn (9,12) is unchanged. The balustrades, the four reading tables, the globe, the lectern and the gate posts and lamps block.
- Objects re-laid to cover each painted table so they can be touched from any open side: top left (2,6) 5x3, top right (13,6) 6x3, bottom left (1,9) 5x3, bottom right (14,9) 6x3 (Tom's pink markers sit inside these). Globe stays at (17,5) (reach it from (16,5) or (17,6)); lectern stays at (9,5). Object text is unchanged.
- Chapter 7 boss scene needed no edits: Tom (9,7), Grace (8,7), Rose (10,7) are on open floor and the Unread stands on the dais steps at (9,3); fight it from (9,4). Watched the scene play on the painting.
- Tests: new `tools/readroom_test.py` (objects touchable, boss stand tiles walkable, real key presses up the aisle and out the gate to the Stacks, portrait and landscape shots in `tools/shots/readroom-*.png`); `tools/reach_test.py readroom stacks` 0 fails; smoke no fails; `tools/ch5_school_test.py` still clean.
- Known roughness: the minimap still draws the old tile look. Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Cafetorium
- The Cafetorium (map id `cafetorium`, chapter 5) now uses Tom's painting (`art/cafetorium.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map.
- Door: the school exit moved onto the painted double doors at (1,5), step up from the spawn (1,6); it leads to the hallway at (27,9). The trash can at (0,6) and (0,7) now blocks. The school sends Tom to (1,6) and (1,7).
- Stage: one walkable row (y 2) reached by the two painted side stairs ((3,2) to (3,4) on the left, (16,2) to (16,4) on the right). The podium (10,2) splits the stage; the Red Pen now stands at (9,2) beside it (was (9,3)); stand at (8,2) to challenge it.
- Objects re-laid to the painting: the four lunch tables are now on the painted tabletops (3,7), (12,7), (2,10), (12,10), reached from the open aisle at y 9 or from y 12. Milk cooler (18,6) reached from (18,7) or (17,6). Cafetorium sign on the painted easel at (18,11), reached from (18,12).
- Chapter 5 stand positions (Tom 9,6, Grace 8,6, Amy 10,6, Rose 9,7, Pruitt 12,6) are all on open floor. No scene edits.
- Tests: smoke no fails; `tools/reach_test.py cafetorium school` 0 fails; every object and the Red Pen reachable from the spawn; walked the left stairs onto the stage and out the door with real key presses; looked at portrait and landscape.
- Known roughness: the minimap still draws the old tile look. Not reworded: no spoken lines changed.

# Change log (newest first)

## 2026-10-28: Painted plate for Long Island Elementary (map id `school`, the hallway and its rooms)
- The school hallway now uses Tom's painting (`art/school.webp`, 30 x 18 tiles at 64 px, entry in `PLATES`). The ASCII plan is replaced by a `plateMask` in `data/maps-le.js`. Tom's marker overlay (stars, bars, circles, arrows, triangles) set where each object goes; the 30 x 18 grid is 54 px per tile on his 1619 x 971 image.
- Objects re-laid to the painting: easels (1,1) and (7,1), art table (2,4), drying rack (8,4), piano (11,1), drums (14,1), xylophone (11,4), music stand (15,3), bleachers (19,1), hoop (23,1), gym mats (19,4), ball cart (27,4), rope (28,2), water fountain (1,8), bulletin board (9,8), trophy case (17,8), sign-up table (25,8), lost and found (27,11), fridge (1,12), coffee counter (3,13), copier (9,12), staff table (4,14), staff couch (6,15).
- Hallway clocks are hot spots on the wall base under each painted clock: Art (5,8), Music (15,8), Gym (23,8). Stand below one and press A. Chapter 5 clock logic is unchanged.
- Doors: front doors are now (14,17) and (15,17) (spawn (14,15); the schoolyard exits land on (14,16) and (15,16)). The Cafetorium exits are the painted double doors at the east end (tiles 27 and 28, row 8), not the map edge. `ch5OpenCafe` (data/scenes.js) now removes the locked-door object and adds those two exits once the clocks are set; before that they are solid. The Cafetorium exits back land on (27,9) and (28,9).
- Rooms: Art room pocket is row 5 plus (5,4) (6,4) and the easel nook; Music is rows 3 to 5 around the piano and drums; the Gym is rows 2 to 5. Room triggers moved to Art [1,3,8,5], Music [10,3,17,5], Gym [19,2,28,5]. Monsters: Tardy Bell (5,4), Glitter Glue (14,4), Dodgeball Dread (24,4); Pop Quiz (8,10) and (19,9) unchanged. NPCs: Mrs. Kowalski (20,11), Grandpa Ike (22,11), Mr. Halverson (10,14).
- Known roughness: the painted staff room has no door. Two gaps were opened in its north wall (x 2 and x 7) so the fridge, counter, copier and couch can be reached; the player walks through painted wall there. If Tom wants a painted door, re-aim those two columns. Painted furniture (table, couch, bookcase) blocks movement; the gym and staff room are tighter than the old open plan. The minimap still draws the old tile look.
- Tests: `python3 tools/ch5_school_test.py` (new: objects touchable, triggers and NPCs on reachable floor, doors shut then open, exits), `tools/reach_test.py school` and `schoolyard` (0 fails), `tools/smoke.py` passing. Shots in `tools/shots/school-*.png`.
- Not reworded: no spoken lines changed.

## 2026-10-28: Old area art no longer flashes before the painted version
- Bug: walking into a Long Island area showed the old tile drawing for about a second, then the painted art. Cause: `engine/plate.js` only started loading a painted plate the first time you entered its map, and `engine/draw.js` drew tiles until it finished.
- Fix: every plate now starts loading and decoding at boot. If one is still loading, `draw.js` shows a plain backdrop (`plateHold`) instead of tiles, houses, objects or actors. A plate that fails to load falls back to tiles.
- Tested with the art slowed 8 s: plain backdrop, then painting, never tiles. smoke and reach_test pass.

## 2026-10-28: Rivituso Row, path to Aunt Ellie's house and the south side
- Bug: the only way to Ellie's door (11,15), the south path and the Pier exit was a one-tile corridor along row 16 (x6 to x14), and Gus stood in it at (7,16), so the south could not be reached. The east garden loop also dead-ended at (20,16).
- Fix: the plateMask row 16 now runs x6 to x21, joining the west path and the east loop to Ellie's plaza (two ways in). New spec field `noGo` (`buildArea` in `engine/world.js`): tiles NPCs never wander onto; Row uses it for the whole plaza strip. Gus now starts by the bench at (4,11). The Pier signpost moved from (15,16) to (15,17) so it no longer sits on the opened path.
- New `tools/reach_test.py [mapId ...]`: flood fill over the real collision grid; fails if any door or exit is cut off, blocked by an NPC's starting tile, or can be cut off by any single wandering NPC. Row, Square and Hollow pass. The Marsh exit to the Sundial reports unreachable on purpose (old reeds until chapter 3).
- The Pier path (Row south exit) is still gated until chapter 3 (Boppy takes everyone fishing); that is design, not a bug.

## 2026-10-28: Grace has a new voice (Gretchen)
- Tom picked "AoT Grace (Gretchen)" (id JVVJ6VsnUPJAdfGmEBGP, ElevenLabs library) in the Grace baker and sent recast.json. Merged with `merge-voice.js ... grace`: all 50 battle lines (60 clips counting alternates in data/voice/grace.js) and all 160 story lines replaced, none added. Every LINES.grace text has a clip. No shrink step (new voice is already a kid); do not run shrink-voice.js on Grace again.
- The six chapter files with no Grace clips (dialog-ch2, 4, 6, 8, 23, 28) still named Ivy in their voice metadata; that entry was updated to Gretchen so the last-loaded file cannot undo it. Ivy is no longer used anywhere.
- Median pitch of her clips about 320 Hz (Amy about 280, Rose about 430). `IDS=grace,rose python3 tools/smoke.py`: FAILS []. No spoken text changed. Largest voice file 14.4 MB.
- Any new Grace clip from now on goes straight in with merge-voice.js, in this voice.

## 2026-10-28: Grace voice baker (new child voice)
- Tom heard Grace as a grown woman. Pitch and voice-size shifts of her current Ivy clips (3 rounds, up to +5 semitones) all sounded mechanical or cartoonish, and calm or long lines stayed adult. Decision: replace the voice, not process it.
- New `tools/voice-recast/build-grace.js` builds `grace-voice-baker.html` (searches the ElevenLabs Voice Library or takes a pasted voice ID, then re-records her 50 battle and 160 story lines with the existing scripts). `tools/voice-recast/test_grace_baker.py` tests it with ElevenLabs mocked (includes the delete-Ivy path when the account is full). Export merges with `node tools/voice-recast/merge-voice.js recast.json data <outdir> grace`. Do NOT run shrink-voice.js on the new clips.
- `tools/voice-recast/template.html`: an empty accent no longer adds a blank entry to the bracket direction. No game files or spoken lines changed.
- ElevenLabs returned 403 (safety block) when Voice Design was asked for a nine-year-old girl. Do not reword around it: Grace is picked from the Voice Library instead (`tools/voice-recast/grace-library.js`, built into the baker; adding the voice deletes Ivy if the account is full). The library calls are tested with mocks only, not against the live API.

## 2026-10-28: More monsters now face right
- Tom saw many monsters still looking left. `data/enemy-facing.js` now also mirrors Gridlock, Tardy Bell, Lukewarm, Smoglet, Shusher, Stuffed Shirt and Unclaimed (they were drawn turned left). Eyes and mouth are mirrored with the art, so every move still aims correctly.
- Monsters with writing on them (Standby Sprite, Pop Quiz, Grey Note, Know-It-All) are left alone on purpose so the letters do not read backwards.
- Tests: `tools/smoke.py` no fails; looked at the mirrored sprites on a contact sheet. No spoken lines changed.

## 2026-10-28: Painted plate for Sundial Hollow
- Sundial Hollow (map id `sundial`, chapter 3) now uses Tom's painting (`art/sundial.webp`, 22 x 20 tiles at 64 px, entry in `PLATES`). The ASCII plan is replaced by a `plateMask` in `data/maps-le.js`.
- Objects re-laid to the painting: sundial (11,12, 2x2; stand at 11 or 12,14), mossy sign (8,15), Pool marker (14,6), stone bench (3,13, 4x2). Monster spots moved onto dry land: Bobber (17,12), Tangle (5,16), Soggy Sock (14,16); Iron-Gill stays at (10,3) in the pond. The coin scene now walks Tom to (11,14).
- Spillway: the painting's water band is rows 8 and 9 with one stepping-stone crossing at x 13. It stays blocked until the coin is out of the sundial, then `ch3DrainSpillway` opens only `drainOpen` ([13,8],[13,9]). The painted water does not change. Boss trigger at the north bank still works (tested).
- Known roughness: the minimap still draws the old tile look.

## 2026-10-28: Painted plates for Amy's house and Deedee and Boppy's house
- The Gregori house (map id `amyhouse`) and the Rivituso house (`grands`) now use Tom's painted interiors (`art/amyhouse.webp`, `art/grands.webp`, 768 x 640, 64 px per tile). Interiors can now carry a `plateMask` like the outdoor areas (`makeRoom` in `engine/world.js` applies it); the room's old `walls` list is gone.
- Both rooms are re-laid to the painting: objects moved to what is painted (recliner, TV and sofa, baking island, photo wall, beds, toy chest, kitchen island), each reachable from the door. Notes: Boppy's pepper plant interaction sits on the painted lamp-table plant (the big painted pepper plant is behind the sofa and cannot be reached); the TV object covers the TV and sofa; the Grace and Rose bed interactions are reached from the rug strip in front of the beds.
- Cutscene stand positions moved off painted furniture: Deedee (5,6) in chapter 3 and Nine Scoops, the Nine Scoops party guests along Amy's back strip.
- Chapter 15: the long dinner table is now at x 4 to 8, y 5 to 6 (dragged into the middle of the painted living room). New seats: Deedee (3,5), Nara (3,4), TNB (5,4), Amy (6,4), Rose (7,4), Grace (5,7), Tom (7,7), Boppy (8,7); (6,7) stays free for HUSH-9. `tools/ch15_test.py` updated and passing.
- Tests: smoke, `tools/ch15_test.py` all ok; reach check (every object and NPC reachable from the door) in both rooms.
- Not reworded: no spoken lines changed. Known roughness: the rocking chair, side table and round dining table block movement but have no interaction.

## 2026-10-28: Tap to walk, Squishy Delivery, enemy facing (synced from the artifact scratch copy)
- Tap to walk (`engine/tapwalk.js`): tap the floor, an NPC, an object or a door and Tom walks there, followers trailing. Any key, stick, dialogue, menu, battle or cutscene cancels it. Toast text updated.
- Enemies now all face right (`data/enemy-facing.js` mirrors the left-facing sprites once at load). Bosses with helpers draw 1.5x, boss on the left, helpers in front.
- Squishy Delivery (Grace and Tom Tombo) uses the version with Grace kneeling to beg (`BATTLE_SPRITES.grace.beg`).
- Cheer fix: Amy, Boppy, Deedee, TNB victory and level-up cheer now draws. Small Rose pixel fix.
- Reworded spoken lines (need re-bake only if the baked clip text differs; both full clips are already baked): `grace.tombo` is 'Ta-Ta, I need a new squishy! Pleeease!' and `tom.tombograce` is 'Fine. One squishy. Just one.' `CLIP_PARTS` emptied.

## 2026-10-28: Painted plates for four Long Island areas
- The Square, Rivituso Row, Grump Hollow and the Whispering Marsh (map id `reeds`) now use Tom's painted art (`art/*.webp`, drawn by `engine/plate.js`). The tile grid stays underneath as the invisible walk map. Row, Hollow and Marsh have a `plateMask` in `data/maps-le.js` ('#' blocks, '.' walks); doors, exits and spec objects stay as they were, spec objects are no longer drawn (flag `baked`), runtime props still are.
- Rivituso Row is re-laid to the painting: Gregori (7,3), Rivituso (18,7 door), Aunt Ellie's house (id `elliehouse`, now at 9,11). Exits to the Square, Pier, Hollow and Marsh moved; chapter 1, 3, 9, 13, 14 and Nine Scoops coordinates remapped. Tests: `tools/ch14_test.py` stand positions updated.
- Marsh: one long route (east platform, long boardwalk, zigzag, dirt path to the old reeds). The old reeds now block (3..4, 1..2). The south-west dirt path in the painting is not walkable.
- Known roughness: minimaps still draw the old tile look; the painted Square fountain and notice board differ slightly from the sprites.
- Not reworded: no spoken lines changed.

## 2026-10-28: Part 2, Chapter 17 "Ascent of the Glass Tower"
- Talk to Sol at the Angel City cab stand after chapter 16 to start chapter 17. Grace and Rose rejoin. Julian Vance's 60-story Glass Tower stands on the Downtown boulevard (doors in the alley between Ramen Ramen and The Starlite).
- New dungeon, four maps: the Lobby, the Stairwell (floors 2 to 30, Stillness guards, coffee restore points), the Shelf Hall, the Vault. Glass, gold and a golden-hour skyline; new battle backdrop.
- Two strike teams of three: Tom, Grace, Rose climb the stairs; Tom, Amy, TNB, Nara work the Shelf Hall. The service hatch on landing 30 swaps the teams (the waiting team holds the landing or sits on the bench).
- Six shelves, each a tiny town paused on its happiest afternoon. Smashing one lets the moment finish (the pierogi bite, the firework, the last ferry). Six of six drops the locks.
- Amy and Tom race floors 31 to 59 (screen overlay, photo finish). Unlocks the Tombo Sixty-Story Sibling Pace (amy3).
- The Archivist's Twin Lenses (level 25, `twinlens`): Shake-style boss. Long Exposure on everyone every third turn (telegraphed), Curators and an amber lens below half HP (2 Kinetic or Sparkle hits or a Tombo break it, otherwise Total Archive). No kind route. Fight party: Tom, Grace, Rose, Amy; TNB and Nara on the bench.
- New monsters: Pausesprite, Paperweight, Curator. Chapter select has chapter 17 (level 22 start, chselSeventeen).
- Files: see docs/C17-DONE.md. Tests: tools/ch17_test.py all ok; smoke, bg_test, ch11 to ch16 re-run.
- Lines to bake: docs/dialogue-scripts-ch17.json (90 lines; the Archivist and Vance need cast entries). No existing spoken line was reworded. Chapter 16's end toast changed (it told Tom chapter 17 was still being built).

## 2026-10-28: Contraction Fix Baker dialogue merged (255 clips) and Deedee's new dialogue voice
- Tom sent dialogue-pending.json: 255 clips (Deedee 120 in her new picked voice "AoT Deedee (picked 2026-10-28)", id 9UrcxKDUU0pvcnFhdfTU; plus the 135 contraction re-bakes). Merged with tools/clip-audit/merge.py: each clip to the file that holds its key (or the file its removed clip came from); 3 new lines to the new data/voice/dialog-ch28.js (listed last in DIALOG_CAST.files, also carries the updated voice settings). Silence trim, cast and speaker effects (Boppy 0.9, monsters), Grace shrink once. Largest file 14.6 MB.
- Audit of the 135 re-bakes (speech recognition): 130 say exactly the screen text. 5 still read the long form, so their screen text now matches the audio (no re-bake): "Why is everybody walking...", "Why did I ever flip them?", "Somebody up there is playing music", "Why is my jar in the middle...", "Something down here is collecting them."
- Result: chapters 1 to 10 and Nine Scoops have no dialogue line without a clip (re-harvest: only Part 2 lines remain, 612). Dialogue clips 2118 to 2256.
- Still to come from Tom: voices.json from the baker's Battle tab (57 lines: Deedee's 44 in the new voice, TNB's 8 new moves, 5 contraction fixes). Until then Deedee's battle lines play her previous voice.
- Tests: tools/smoke.py FAILS: []; harvest page load with all 18 dialogue files, no page errors.


## 2026-10-28: Part 2, Chapter 16 "The Amber Eclipse"
- Walking into the Square after chapter 15 starts chapter 16: the family photograph. Marlowe at a box camera, Vance's voice, the lens charging, the amber beam at Grace and Rose, Deedee and Boppy stepping in front (arms locked, "Fifty-one years." / "...And counting.") and turning to stone. Vance "helps with Marlowe's notes". Grace takes Rose and runs for Cab 7.
- Marlowe Transformed (level 23, `marlowe16`): Shake-style boss for Tom, Amy, TNB and Nara. Overexposure on everyone every third turn (telegraphed), Grey Notes and an eclipse shield below half HP (2 Chatter, Splash or Kinetic hits or a Tombo break it, otherwise Total Eclipse). No kind route.
- No victory fanfare: no jingle, no cheers, no level-up chime (sound is off from the win to the end of the aftermath); only a short wind sound. Then the glass comes down and Long Island is sealed in a snow globe that Vance reels up. The chapter ends at the Angel City cab stand.
- New screen effects (beam, grey wash, flash, snow globe), new map objects: stone statue of Deedee and Boppy, Vance's camera on a tripod. Deedee and Boppy are absent from their house once they are stone.
- Chapter select has chapter 16 (level 21 start, chselSixteen). Chapter 16 party rules: Tom, Amy, TNB, Nara.
- Files: see docs/C16-DONE.md. Tests: tools/ch16_test.py all ok; smoke, bg_test, ch11 to ch15 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch16.json (84 lines; Vance needs a new voice cast entry). No existing spoken line was reworded.

## 2026-10-28: Amy less bossy in Part 2
- Tom: "why is Amy so bossy". Cause: Part 2 scenes (ch11 to 14, written after the Amy rewrite) used her as the drill voice for every fight tip ("Up, everybody. Walk it off.", "Positions.") and slipped back to "thirty-one third graders" (canon: Special Ed, her room of twelve).
- Rewrote 10 unrecorded Amy lines (no clips lost): fight tips are now "Everybody okay? Good. ..." and "Here's the plan. ..."; "please" on the colors; "I teach kids for a living". Files: data/scenes-p2.js, scenes-ch12.js, scenes-ch13.js, scenes-ch14.js.
- Left as is (recorded, approved in the rewrite): "Up! Everybody up! Walk it off. Hydrate. We go again." Known slip, recorded: travel stay "thirty second-graders at eight".
- (Baker) Contraction Fix Baker v5 adds a Deedee voice picker (Tom wants to choose her voice): plays 3 clips of her current voice, designs 3 options from the recast brief (editable), Use this voice saves it to ElevenLabs (if the account is full it offers to delete the old Deedee voice; recorded lines keep playing), or paste a library voice ID. All 164 Deedee lines and the saved voices.json / dialogue-pending.json use the picked voice; takes made with another voice stop counting. Merge: her new voice_id rides in both files.
- (Baker v6) Tom: every designed Deedee option sounded like a muffled phone line. Cause: Voice Design at guidance 5 with a niche prompt (age plus regional accent) trades audio quality for prompt accuracy (ElevenLabs docs). Fix: prompt now opens with "Perfect audio quality, studio-quality recording", guidance 3 (slider), quality 0.9, 192 kbps with fallback, "seventies" dropped from the brief, optional "start from her current voice" (reference audio). Added Voice Library search (real recorded voices, default New York, female, old) with Use this voice (adds it to the account; same slot-free flow).
- Rule for new Amy lines: calm, specific, warm with the girls; competitive only at Tom, the clock, herself (claude/amy-dialogue-review.md).
- Tests: smoke, ch12, ch13, ch14 FAILS: []; ch11 test ran clean.

## 2026-10-28: Part 2, Chapter 15 "The Eight-Seat Dinner Table"
- Walking into the Rivituso house after chapter 14 starts chapter 15: all eight sit at a long dinner table (a table object that exists only while the chapter is live). Deedee and Nara's crust, TNB and Boppy's pepper contest, a toast, and then HUSH-9 Final Form crashes dinner.
- HUSH-9 Final Form (level 21, `hush9final`): Shake-style boss. Dead Air on everyone every third turn (telegraphed), Hushlings and a hush chip below half HP (2 Chatter or Kinetic hits or a Tombo break it, otherwise Total Silence). Kind route: PULL UP A CHAIR x3. BENCH CALL swaps the fourth slot with any of Deedee, Boppy, TNB or Nara (the fight gets all four as reserves).
- New dining room battle picture bgs/18-dinner-table.png, used while HUSH-9 Final Form is in the fight.
- Rewards: HUSH-9's Chip keepsake, and Family Finish ff3 Fifty-One Years & Counting (Deedee, Boppy, Tom) unlocks. Chapter select has chapter 15 (level 20 start, chselFifteen).
- Files: see docs/C15-DONE.md. Tests: tools/ch15_test.py all ok; smoke, bg_test, ch11, ch11b, ch12, ch13, ch14 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch15.json (79 dialogue lines and 14 PULL UP A CHAIR battle lines). No existing spoken line was reworded.

## 2026-10-28: Part 2, Chapter 14 "The Rikers Wall of Rivituso Row"
- Chapter 13's ending now flows into chapter 14 on Rivituso Row. TNB and Nara stay to hold the breach; Grace and Rose rejoin (party: Tom, Amy, Grace, Rose). Deedee stands on the porch in amber, looping a rhubarb crisp; Rose eating it breaks the loop (amber is warmth that got stuck). The neighbors on the Row (Gus, Bean) are in amber until the chapter ends.
- Warden Boppy (level 20, `warden`): cannot be beaten. Every hit makes the gold armor hum brighter (heals him, costs Warmth, "ARMOR UP"). DEFEND (Tom) warms him, favorites are PEP TALK, DANCE, SILLY and ff2, and ▼ Bag, MAKE HIM LAUGH (3 jokes) is the Un-Grump route. His calm waits for Deedee's call from the porch ("ROBERT."), whose MOON & BACK heals the party 60%; she calls at the latest on his fourth turn. Gate Slam on everyone every third turn (telegraphed), otherwise gentle numbers.
- After: the plate melts, "I just didn't want to get too old to keep you all safe." / "You big nut. We keep each other safe." Unlocks the Tombo **Nobody Gets Past Us** (`boppy2`) and the Warden's Bucket keepsake. Boppy and Deedee go back inside; the Row thaws.
- Chapter select has chapter 14 (`chselFourteen`). Chapter 13's armored Boppy now stays on the Row through chapter 14 (`data/scenes-ch13.js`); the chapter 13 "chapter 14 is coming" toasts were removed.
- Files: see docs/C14-DONE.md. Tests: tools/ch14_test.py all ok; smoke, ch11, ch11b, ch12, ch13 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch14.json (101 dialogue lines and the 8 MAKE HIM LAUGH battle lines; Boppy and Deedee use their existing voices). No existing spoken line was reworded.

## 2026-10-28: New battle backgrounds (17 pictures)
- Tom's new pixel-art backdrops replace the code-drawn ones in battle: 17 PNGs (576x324, opaque) in `bgs/`, named `01-pond-town` to `17-oak-crown-canopy`. `engine/battle-draw.js` now has `BG_FILES`, `battleBgKey()` (picks the picture from the map's ground, or the Battle Lab `B2.lab*` flags) and `drawBattleBackdrop(t)`.
- Map to picture: pond = every Long Island map without its own look (town, row, hollow, marsh, pier, sundial); griffith = Griffith Park plus Downtown and Jefferson Park; classroom = school and schoolyard; cafe; stacks; readroom; club; dome; barn; boiler; term; gate; lot = Studio Gate and Backlot; stage = Soundstage 7 and Stage Set; park; oak; canopy.
- The old code-drawn backdrops stay in `engine/*-render.js` and the pond code as a fallback only while a picture is still loading.
- Lost on purpose: the small animations (clock hand, lamp flicker, fireflies, drifting SHH) and the story-state variants (Moon in the Dome, warm Car Barn, Flight 0 leaving Gate Zero). Pictures are static.
- New test: `python3 tools/bg_test.py` jumps to every battle map, starts a real battle and saves `tools/shots/bg-<map>.png`.

## 2026-10-28: Popcorn Jump couch no longer overlaps Tom and TNB
- The couch's rolled arms were drawn in front of Tom and TNB and covered parts of their bodies (Tom's left fist). All couch pieces now draw behind them (`engine/battle2-kind.js`, `couchBack` plus `couchFront` in the back scene).

## 2026-10-28: TNB existing-move feedback (Existing Moves Lab)
- Mug Toss: smaller mug (scale 3.2 to 2.0) with a detailed redraw (speckled clay, glaze drips, rim and inside, handle, sticker, foot ring).
- WARDROBE: detailed rack (steel tubes, slat shelf with shoes and a hat, casters, marquee sign with bulbs) and five costume pieces on wood hangers (blazer, dress, hoodie, striped shirt, trench coat). The costume that drops on the friend is the detailed blazer.
- Dad-Joke Pottery replaced by **Throw Down** (key `dadjoke_pottery` to `throw_down`, same numbers: 2 VP, hybrid, 1.4x, +15% crit): a detailed electric pottery wheel, he throws a bowl, the wheel runs away, the bowl flies off and lands on the enemy's head, then the pun.
- Kept: Metro Tap Card, Slasher Jump Scare, Kiln Door Policy, Baxter Street Bomb. Tombos untouched.
- Lines to bake: `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (replaces the dadjoke_pottery clay pigeon line; its old clip is dead).

## 2026-10-28: Part 2, Chapter 12 "Welcome to Jefferson Park, Girls"
- Gate Infinity now starts the chapter (LA opens). Jefferson Park: Tom's house (Bready Mercury, photo wall), TNB's Loft (Rose's bowl, Amy and TNB bond), Monochrome Marlowe greys the block and sets neighbors in amber, Doña Carmen thawed by a warm pupusa, Casa Alvarez thawed by Amy's laps (unlocks Tombo ff2 Run With Us, Mommy!), boss Gridlock Prime, colour returns, Marlowe hints at Long Island, Green Light keepsake.
- New couches and benches (Tom's couch, Parkway bench) swap the front party. Chapter select now has chapter 12.
- Files: see docs/C12-DONE.md. Tests: tools/ch12_test.py all ok; smoke, ch11, ch11b re-run.
- All new dialogue is unvoiced until baked (docs/dialogue-scripts-ch12.json).

## 2026-10-28: Part 2, Chapter 11 second half (C11b): Lost and Found, Julian Vance, FINAL CALL, the ending
- Lost and Found (concourse door, optional): the Lost Luggage lore, the ledger (UNCLAIMED 4,017,311, CLAIMED 0), a gold-ink card "FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH." Rewards: the Gold Clock Tag keepsake and Airplane Pretzels.
- Gate Infinity: Julian Vance (the man in the long coat) explains the pause, offers everyone "the good part, forever", Tom says no, Vance makes the last announcement and FINAL CALL unfolds beside the door.
- FINAL CALL boss (level 15, `finalcall`): a departures board on robot legs. Reuses the Last Call rules (`b2BossOpen`, `b2CallTurn`, `b2CheckPhase`): it calls one person per turn, GATE CLOSED if they do not act, Tom can DEFEND. Below half HP two Lost Luggage roll in and it braces for CANCELLED (2 Kinetic or Sparkle hits, or any Tombo). Kind route: ▼ Bag, LET IT FLY x3.
- New move BENCH CALL (`engine/benchcall.js`): ▼ Bag in the FINAL CALL fight. Costs the caller's turn; the fourth member (not Tom, Grace or Rose) steps out and someone from the bench steps in and acts almost at once. Anyone who steps out can be called back.
- Ending: coin number nine, the board flaps, Gate 00 shows LONG ISLAND: CLOSED (the dome goes amber), Amy calls Deedee and it rings and rings, CHAPTER 11 COMPLETE, autosave, a toast that chapter 12 is still being built. Gate Infinity afterwards: LOS ANGELES: NOW BOARDING.
- Files: `data/scenes-p2.js`, `data/p2-monsters.js`, `data/p2-battle.js`, `engine/battle2.js` (finalcall branches, `B2_FINAL`, `B2_FLY_LINES`), `engine/benchcall.js` (new), `index.html`, `tools/ch11b_test.py` (new).
- All new C11b dialogue and the FINAL CALL kindness lines are unvoiced until Tom bakes them (`docs/dialogue-scripts-ch11.json` lists them).
- Tests: `tools/ch11b_test.py` (Lost and Found, Vance, boss with a BENCH CALL swap, win, ending, amber dome; no faults), `tools/ch11_test.py`, `tools/smoke.py` FAILS: [].

## 2026-10-28: voice clips that said the long form of an on-screen contraction
- Tom: clips still say "she is" where the screen says "she's" (Olivia's leaf line). Cause: the 2026-10-27 contraction re-record keyed clips under the contracted text, but ElevenLabs read the old, uncontracted scripts.
- Audit: all 991 clips whose text has a contraction were transcribed with speech recognition (Whisper base.en, offline) and compared word by word. 132 clips said the long form (131 dialogue, 1 battle). Tools and method: `tools/clip-audit/README.md`.
- Wording bugs from the contraction pass fixed in game text (24 lines): "X'll not" became "X won't", "X'd not" became "X wouldn't", "I've seven gold coins" became "I have seven", "Whoever it's has" became "Whoever it is has", "She won't let's open it" / "She let's hold it" became "let us".
- 138 clips removed (the 132 plus 6 whose wording changed), so those lines are silent until re-baked, per the exact-match rule. Dialogue clips 2253 to 2118; battle clips tom 2, tnb 1.
- Re-bake: `Contraction-Fix-Baker.html` (135 dialogue, 3 battle lines). Every script is the original hand-written one (all 138 recovered, every tag kept); only the words that differ by a contraction were changed. Merge: dialogue with `voice-merge-dialog.js` (each clip goes back to the chapter file it came from; Grace shrink and Boppy deepen as usual), battle with `voice-merge.js`.
- Tests: `tools/smoke.py` FAILS: []; page load with all voice files, no page errors; Olivia's leaf line has no clip, untouched lines still play.
- Same baker now also re-recasts Deedee (Tom: keep every emphasis): all 164 Deedee lines (44 battle, 120 dialogue). 130 use the original hand-written scripts (mostly the 2026-10-26 Deedee re-voice files), 34 that never had one got new hand-written directions; every on-screen CAPS word is in the script; banned frail words stripped from tags; "warm Long Island accent" goes inside every bracket and her direction leads the first. Voice: the current Deedee voice (AoT Deedee, Long Island, 2026-10-28).
- Chapter 8 check (Tom heard missing clips): of 120 chapter 8 scene pages, 86 have clips, 17 are Nara or objects (silent by design), and the other 16 plus 9 Jefferson Park NPC lines are the contraction-fix removals, all already in the baker. Added 10 battle lines that never had a clip (TNB's 8 revamp moves incl. coffee_run, tom.tombograce "Fine.", grace.tombo short line) with hand-written directions (`tools/clip-audit/extra-battle.json`). Harvest tool: `tools/clip-audit/harvest.py` + `miss.py` (every unrecorded line, tagged by chapter). Part 2 chapters 11 to 14 have about 480 unrecorded lines; not in this baker.

## 2026-10-28: Part 2, Chapter 11 "The Layover Between Worlds", first half (C11a)
- Part 2 now opens for real: the Rivituso house morning (Deedee's crisp, Boppy's gold card, the boarding pass buzzing), then Flight Zero's cabin (Rose and Grace stowaway, Amy sprints in, the sky tears), then Terminal Infinity.
- New places: Flight Zero (`flightzero`), Gate 00 (`gate00`, two glass domes for Long Island and Los Angeles), the Endless Concourse (`concourse`, Gates 1 Boston to 9 Miami, all paused).
- New monsters: Lost Luggage, Red-Eye, Standby Sprite (a story fight at the checkpoint; WAIT LIST pushes someone down the turn ribbon).
- TNB and Nara arrive by the jet bridge. Unlocks the Sleepover at Tom's Tombo (`tombo:ff1`; Tom, TNB, Grace, Rose in front).
- New system, the bench (`engine/bench.js`): the fighting party stays 4. Anyone else along waits on the bench and walks with the party. Gold Boarding Gate benches swap who is out front. The bench rides along in saves.
- Gate Infinity and the Lost and Found stop at "Chapter 11 continues in the next update" (C11b: Lost and Found, Julian Vance, FINAL CALL boss, ending).
- Files: `data/p2-monsters.js`, `data/p2-battle.js`, `data/maps-p2.js`, `data/scenes-p2.js`, `engine/infinity-render.js`, `engine/bench.js`, `engine/story.js`, `engine/chapter-select.js`, `index.html`, `tools/ch11_test.py`. Load order: p2-monsters after terminal-monsters, maps-p2 after maps-le, p2-battle after battle2-data, infinity-render after terminal-render, bench after story, scenes-p2 after scenes.
- Tests: `tools/ch11_test.py` plays the chapter jump, cabin, arrival, concourse, Standby Sprite fight, TNB and Nara scene, bench swap, save and load.

## 2026-10-28: Aunt Ellie gets her own house on Rivituso Row; TNB revamp closed
- Tom approved the four reworked TNB moves (Foraged at Dawn, Tasting Menu, Just Around the Bend, Coffee Run). The TNB revamp is closed.
- Aunt Ellie moved out of the Rivituso house into a new house of her own on Rivituso Row (map id `elliehouse`, top left, purple roof, label ELLIE). Her room has a hat shelf, writing desk, wardrobe, tea tray, orchid and umbrella stand, all with Ellie jokes. Her spoken lines are unchanged, so every baked clip still plays.
- Chapters 9 and 10 still happen at the Rivituso house: while `ELLIE_VISIT` matches (chapter 9 from the invitation until the chapter ends; chapter 10 from the boss win until Sunday dinner), her house copy is `away` and a visiting copy stands in the Rivituso house. Outside the story the visiting copy is hidden (`syncAwayNpcs()` now also runs once at load in `data/scenes.js`).
- Row map: tag now says three houses; the community garden and corner sign moved to just below the road (two trees removed to make room); the family notice sign gained "Opinions at Ellie's".
- Known mismatch: Dot's lines still count "ten doors" (spoken, baked). Adding a house makes it eleven; fixing it needs a re-bake, so it is left until Tom asks.
- Files: `data/maps-le.js`, `data/scenes.js`, `docs/CANON.md`. Tests: `tools/smoke.py` FAILS: []; Ellie placement checked in demo, chapter 1, 9 (before, during, after) and 10 (before, during, after); screenshots of the Row (portrait and landscape) and her room.

## 2026-10-28: TNB move tweaks from Tom's Move Lab feedback
- Foraged at Dawn: gold-rimmed fine-china plate, glossy pea, herb-oil swoosh, microgreens, flower, glint.
- Tasting Menu: banquet tables (linen drape, gold trim, candle, rose vase); the pea courses are now plated food (seared scallop, beet rose, chocolate dome with gold leaf).
- Just Around the Bend: the trail now climbs a clear LA hill (Observatory on top, Hollywood sign, downtown skyline, palms, chaparral).
- Status: Green replaced by Coffee Run (key `coffee_run`, same numbers: 3 VP, ally, heals 20% + 2 VP, kind on a monster). Files: `engine/tnb-moves.js`, `data/battle2-data.js`, `data/abilities.js`, `data/lines.js`, `data/battle-icons.js`, `docs/MOVE_KEYS.md`, `docs/CANON.md`.
- Lines to bake: `tnb.coffee_run: "Coffee run. I got you the usual."`.

## 2026-10-27: purged dialogue audio for lines that were since replaced
- Tom asked for unused, replaced dialogue to be purged. Audit method: every baked clip's exact text was checked against every string the game source can still produce (plain strings, templates, `{n}`-style placeholders, concatenations). Scenes and `LINES` categories were also checked: every scene is still started somewhere and every `LINES` category is still used, so the dead material was audio only.
- Removed 139 clips whose text no longer exists anywhere: 87 battle clips (amy 12, boppy 15, deedee 3, grace 4, rose 17, tnb 19, tom 16, nara 1) and 52 dialogue clips (dialog-ch1 to ch8, ch10, ch21 to ch23). They were old audio for lines since reworded or contracted (for example "Good job, babies." became "Good job, girls.", old rose pogo and tickle shouts, Amy's "Thirty second-graders" lines). The 7 tnb clips are the old lines of the seven moves the TNB revamp just replaced (quick_change, continuity_pins, rush_hour_racks, wrap_ult, cone_six, curb_appeal, fix_wobble). Also removed 9 matching bake-script notes in `voices.*.scripts` of `data/voice-clips.js`.
- Result: battle clips 550 to 463, dialogue clips 2305 to 2253 (about 8 MB of audio). 0 live clips lost (every surviving clip is byte-identical to before); 0 orphans remain on re-audit.
- Kept on purpose: monster "Round {n}." lines and other templated dialogue (looks unmatched in a plain text search but is live), and `demo/` (reachable from the title screen).
- Not removed: lines that are live but now have no clip (reworded, waiting on Tom's re-bake). Those are silent, not dead.
- Tests: `tools/smoke.py` (tnb,nara) and `IDS=grace,rose` FAILS: []; page load with all voice files: no page errors, no 4xx, clip counts 463 and 2253.

## 2026-10-27: TNB ability revamp (seven moves, same numbers)
- Tom's direction: rebalance TNB's kit away from wardrobe toward horror, longboarding, pottery plus three new themes (PM in training, Michelin-star service, hiking) and one move for his sister Jojo (disc golf). Effects unchanged; only names and animations.
- Replaced (old key -> new key, `data/abilities.js` p cards, `data/battle2-data.js` o3 rows, `data/lines.js`, `data/battle-icons.js`): quick_change -> foraged_at_dawn (Foraged at Dawn), continuity_pins -> dont_split_up (Don't Split Up), rush_hour_racks -> scope_creep (Scope Creep), wrap_ult -> tasting_ult (Tasting Menu), cone_six -> around_the_bend (Just Around the Bend), curb_appeal -> round_with_jojo (Round with Jojo), fix_wobble -> status_green (Status: Green). Kept: Mug Toss, WARDROBE, Metro Tap Card, Slasher Jump Scare, Dad-Joke Pottery, Kiln Door Policy, Baxter Street Bomb.
- Animations: new IIFE `t6_` at the end of `engine/tnb-moves.js`; every move ends under 5 s. The seven new spoken lines have no baked clips yet (synth voice until a bake).
- Lesson: a scene's `s.t` starts at `-delay`, so any absolute move-ms timings inside a scene must be shifted by its creation time plus delay (the Gantt chart and the bubble words were late or invisible until this was fixed). `ST.group` has no `mid`; use `(top+base)/2`.

## 2026-10-27: Ymamot Creation timing, and the game can no longer freeze on one error
- Tom reported a freeze after Ymamot Creation (Tom + Amy) and off animation and voice timing. The freeze could not be reproduced in Chromium (all 58 monster types, the real fight with victory card, 8 turns after, 4x slower CPU), so it is treated as an iPhone-only fault and the engine was made fault-proof instead (below).
- Timing bug found: Amy's clip is 5.1 s and Tom's is 4.2 s, but the scene gave them about 1 s each, so they overlapped each other and ran past the end of the move. The scene is now timed to the speech inside the clips: ingredients fly on Amy's words (ketchup, pickles, cereal, sock), the title card lands on "Ymamot Creation!", Tom's line starts 160 ms after Amy finishes, the sling and SPLAT land on "We were six". Spans that wait on a voice scale with battle speed, so it also holds at 2x (measured within 10 ms at 1x and 2x). Both clips are preloaded at the first step. Messages moved to match. No lines were reworded, so no re-bake.
- Fail-safe: `nextStep` no longer stalls the whole move when a step throws; `RFX.draw` drops a scene that throws; `frame()` and the AUTO dialogue loop guard every stage so an error cannot stop the loop. New `gameFault()` shows "Hiccup in <where>: <message>" for 4 s and records `window.__faults`.
- New tools: `tools/speech_windows.py` (speech start and end inside a baked clip), `tools/fault_test.py` (fault injection).

## 2026-10-27: repo brought up to v335; GitHub is now the live app
- Decision (Tom): the GitHub Pages site is the real app; the claude.ai artifact means nothing to him. CLAUDE.md rule 8 and docs/WORKFLOW.md rewritten: finished work goes to `main`, the artifact is a scratch copy.
- Every changed file copied from artifact version `1793146014-5ae2` (v335): 59 files changed, 22 added. `index.html` had its wrapper stripped; `demo/` untouched (already identical).
- Brings the live site the new title screen (START NEW / LOAD / small ADMIN, Part / chapter lists under START NEW, BONUS under it), Rose Mode picture menus (`engine/battle-pictures.js`, `data/battle-icons.js`), the Amy, Deedee, Boppy and TNB pose files, `data/kid-sprites.js`, the Nine Scoops and level-up music (`music/ns_*.mp3`, `music/levelup.mp3`), and the contraction re-record (dialogue voice files `data/voice/dialog-ch1..8, 21..27`; 2305 dialogue clips).
- Voice files in the artifact are the source of truth for this push: dialogue clips now live in `dialog-ch25.js` to `dialog-ch27.js` (old copies were removed from `dialog-ch1..8, 21..24`), and `data/voice/<character>.js` hold the re-recorded battle clips.
- Tests: `tools/smoke.py` (tnb,nara) FAILS: []; title screen checked in portrait and landscape (START NEW / LOAD / ADMIN, then PART 1 / PART 2 / BONUS / BACK); all 24 voice files load with no 4xx and no page errors.

## 2026-10-27: repo brought up to live v1793076136-c38f, plus the title theme
- Every changed file copied from the live artifact (43 files). `index.html` had its artifact wrapper stripped. `demo/` and the unchanged voice files untouched.
- New since the last push: baked music (31 tracks in `music/<id>.mp3`, played by `engine/music-clips.js`; the synth song is the fallback), tap an enemy to target it (`engine/battle2-ui.js`), dialogue AUTO (`engine/dialog-auto.js`, T key), `data/contraction-alias.js`, and edits to abilities, battle2-data, lines, maps, scenes, story, travel, tom-moves and the monster files.
- `data/voice/grace.js` lost one stale clip (`cartwheel`, "Cartwheel! Watch my toes, Ta-Ta!"); the line was reworded in `data/lines.js`, so that clip no longer matched anything.
- Title Theme added: `music/title.mp3` (30 s loop, 96 kbps, -20 LUFS, from Tom's music.json). `MC_TRACKS` has `title`; `clipWanted()` returns it while `splash.active` (title, chapter select, Battle Lab menu) and no fight is on. Tested: loads, plays on the title screen, hands over to the battle track in a fight.
- Picked up from a later artifact version (`1793076136-c38f`): Rose Mode opens dialogue with AUTO on (`engine/dialog-auto.js`) and Pockets-screen null guards for unknown item ids (`engine/menu.js`).
- Not in the track list yet: flight, level-up jingle, Nine Scoops bonus chapter.

## 2026-10-26: repo brought up to live v280
- Every changed file copied from the live artifact, version `1793064753-9a63` (v280). 23 files changed; `demo/` untouched (frozen). index.html had its artifact wrapper stripped as before. Smoke test passes (grace,rose); title screen checked.
- New since v266: Nine Scoops bonus chapter 21 (data/bonus-nine-scoops.js, data/voice/dialog-ch21.js, BONUS button on the title screen), voice merges (tom, grace, rose, boppy, tnb), and edits to abilities, battle2, story, travel, intro, menu, splash, grace and rose moves.

## 2026-10-26: repo brought up to live v266
- Every file copied from the live artifact, version `1792993371-6dc3` (v266), voices and `demo/` included. Smoke tests pass (tnb,nara and grace,rose).
- Since v252: account saves (cloud-save.js), Grace's Cartwheel rebuild (data/grace-wheel.js, new), menu and dialog box layout, skill button labels, volume slider, Tom/TNB line edits, and the voice recast so far (Grace = Ivy, Amy Long Island accent, Boppy pitched up one semitone). Rose keeps her voice.
- Workflow change: the artifact is now the working copy; push to `main` only when Tom asks (CLAUDE.md rule 8, WORKFLOW.md steps 4 and 5).

## 2026-10-25: repo brought up to live v252 with full voices
- Real voice files added to the repo (identical to the artifact), so GitHub Pages plays the full game. Pages URL: https://trivituso81.github.io/adventures-of-tom/
- Source exported from the live artifact, version `1792983007-0e46` (v252). Voice audio and `demo/` left out (see `docs/VOICE.md`).
- v252 (last live change): difficulty retune. `B7_DIFF` in `engine/feel.js` and `b2FoeUnit`/`b2Delay` in `engine/battle2.js`. Rose mode: monsters hit x0.5, monster HP x0.75. Grace mode unchanged. Director mode: hits x1.6, monster HP x1.3, monster turns x1.25 faster, plus shield, Tombo and snack rules. If Tom says Grace mode is too easy, change the base monster POW in `data/battle2-data.js`, not the modes.
- v251: all 25 Director's Cut voice lines baked and live.
- v250: `rose.dc1` is now "No! It's Lamby!".
- Director's Cuts built so far: all tier 1 and tier 2, plus `grace3_dc` (Shadow Squishy) and `rose3_dc` (Lamby Night-Light). Still to build: `amy3_dc`, `deedee3_dc`, `boppy3_dc`, `tnb3_dc`, `nara3_dc`, then the four Family Finish Director's Cuts.
- All 21 Tombos and all four Family Finishes are animated.

## Lines to bake

- `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (new; replaces `tnb.dadjoke_pottery`).
- `tnb.coffee_run: "Coffee run. I got you the usual."` (new).

Add any new or reworded spoken line here as `character.kind: "text"` (and the old text if reworded).

## Known gaps

- Barrier events not built: Distance (`tnb3`), Fear (`nara3`), Exhaustion (`ff2`), Aging (`ff3`).
- Remix versions of abilities, and "Polish rank 2" flourishes, are not built.
- Tier 3 Tombos and Family Finishes have no story unlock flag yet (chapters 11 to 20 do not exist); they play in the Battle Lab only (`B2.tombos='all'`).
- Cosmetic: some status pops crowd Ultimate words at the heal moment. Stale comments in `engine/battle2-traits.js` line 13 and `engine/battle2.js` line 609.
- `data/lines.js` `nara.low` second line "Whimper. Tom?" contains a word (Nara only barks). Left alone because changing it needs a re-bake.
- First launch on a phone may be slow with all voices loaded; in the live artifact the answer is to fetch clips on demand. Not relevant to the silent build in this repo.

- C11b follow-up: Rose Mode picture UI now has a BENCH CALL icon (BI_ART x_bench, bpBag branch), so the bag row shows a bench picture instead of crashing.

## Chapter 13 (Sub-Rail)
Lines to bake: all dialogue in data/scenes-ch13.js (listed in docs/dialogue-scripts-ch13.json), plus B2_BREAK_LINES in data/ch13-battle.js and the Drill Worm and Hushling battle lines. Speakers HUSH-9 and Drill Worm need a voice mapping in data/dialog-cast.js first.

## Chapter 18 (2026-10-28)
Reworded spoken lines (need re-bake; update dialogue-scripts-ch2/ch6/ch8.json first):
- Olivia (revisit): "Michael! Isla is near the curb. Okay. Never mind. Thank you, babe."
- Michael (first visit): "Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now."
- Michael (revisit): "I heard Olivia say Michael. Whatever it is, I'm on it. Isla, that is not a snack."
- Michael (revisit 2): "Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence."
- Nara chapter 6 scene line: "Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right."
- Olivia chapter 8: "...Michael is guarding it with his life."
- Michael chapter 8: "Cold lasagna, one diaper bag, and Isla eating the tablecloth. We're thriving."
Engine: battle backdrop for glass-tower maps now uses the code-drawn tower (also fixes ch17); intro.whiteout added for a white flash fade.
Not ported from the artifact on purpose: its contraction edits to Mr. Washington, ttlever and other ch8 lines.

## Chapter 19 (2026-10-28)
No existing spoken lines were reworded. New dialogue is unbaked: docs/dialogue-scripts-ch19.json. New speakers needing cast entries in data/dialog-cast.js: Oblivion Censor, Dead-Letter Office (narration), Mrs. Alvarez, Floor 59 (narration); Vance, the Archivist and Floor 60 are still owed from ch16 to ch18.
Engine: engine/benchcall.js now gives BENCH CALL reserves in the Twin Lenses fight (ch17 promised it but had none) and the Censor fight. tomBack() benches Amy/TNB/Nara if Tom's return makes five. SOLO_SKIN lets a map draw the player as one member (memory rooms). Nara's Frantic state also applies with no Tom in the party.
Known: Censor balance checked by script only (tune B2_FOES.censor in data/ch19-battle.js).

## Chapter 20 (2026-10-28)
No existing spoken lines were reworded. New dialogue is unbaked. New speakers needing cast entries in data/dialog-cast.js: Stillness Core and Forever Engine (narrator), Vance (reused), Oblivion Censor, Sal, Sol, Nara. Spoken battle lines for the relays and the seven care acts reuse existing keys. Older owed: 7 Michael/Olivia re-bakes, Vance, Archivist, Floor 60/59, Mrs. Alvarez, Dead-Letter Office.
Engine: BENCH CALL now works in the Leviathan and Julian fights (B2_BENCH_FIGHTS), near free in Julian's.
Known: Dot says "ten doors" (should be eleven); ch15 QUIET glyphs; ch17_test pre-existing failure; ch18 flaky roster check.

## Rose extra poses and painted shoulder ride
- 12 new painted battle poses (boop, boopBack, raspberry, boo, tiara, hug, balance, lookout, throwWind, throwRel, sitStory, sitTea) baked from Sheet A into `art/chars/rose-battle-x.webp`; wired into Boop, Silly, Boo!!, Lamby Hug, Bedtime Story, Floor Is Lava, Lookout Lamby.
- Painted shoulder ride (battle and overworld) replaces the old pixel ride; seat anchors in `tools/sprite-bake/rose-ride-anchors.json`.
- Overworld extras (crouch, jump, wave, hold) baked into `ROSE_OW.extra`; no scene uses them yet. Tiara, tiara-free Macaroni Crown, sitTea and throw poses for Ms. Cathy are unused so far.

## Rose Boop: painted jab
- Boop now uses three painted frames (jab0 wind-up, jab1 extended index finger, jab2 recoil) from `tools/sprite-bake/src/rose-jab-v2.png`, lunging so the fingertip lands on the enemy's nose at the hit. The old drawn-on arm (`rf_poke`) is no longer used by Boop.

## Grace sheet B poses (2026-10-29)
Painted frames for her level-5 moves (src tools/sprite-bake/src/grace-poses-b.png, baked by bake_grace_poses.py into art/chars/grace-wheel.webp): hs_flip, hs_land, aerial, db_tuck, db_stick, p10. Handspring, Beam Dismount and Perfect 10 now draw them (engine/battle-draw.js, gw()); `aerial` is baked but not wired yet. Perfect 10 ends on the p10 pose (fx.p10).

## Squishy Delivery painted begging sequence (2026-10-29)
Sheet C (tools/sprite-bake/src/grace-poses-c.png) baked into the wheel atlas: sq_kneel, sq_hop, sq_pout, sq_gasp, sq_squeal, sq_joy. B2_TOMBO_ANIM.grace1 (engine/battle2-kind.js, GQ helper) plays kneel, hop, pout, kneel, gasp at the gift box, squeal on the landing, then a happy bounce. Falls back to the old kneel and celebrate frames if the painted set is missing.

## Sub-Rail tunnel painted plate (2026-10-29)
- Map `subtunnel` (The Transcontinental Sub-Rail, ch13) is now a painted plate: art/subtunnel.webp (36 x 12 tiles at 64 px, cropped from subtunnel_final.png, which came padded with 6 blank tiles each side), PLATES entry, plateMask and objects in data/maps-ch13.js. Tom sent two pairs; used the one with the grid.
- The map shrank from 48 to 36 wide to fit the art. West door (tiles 0,2 / 1,2) to the Depot, east door (34,2 / 35,2) to Under the Amber; Depot now lands at (2,3), the chamber lands at (33,3). Spawn (3,3). Monster spots moved onto the new floor (data/ch13-monsters.js).
- Walk: top platform, track bed, ledge, lower walkway, both stairs. The four cars block (upper two one row, lower two two rows), the wall face blocks. Objects re-laid: 5 mile signs on the lit wall panels, 4 cars, 2 coffee machines (red at 15, green at 23, the green one keeps the "last coffee" text), 2 cable bundles, 5 rubble piles (new: green flag pile, "CLAIMED FOR SOMEWHERE ELSE"), 2 lamps. The old "pointing east" lamp text now reads as a post lamp at the platform edge.
- Fix (engine/world.js buildArea): on ground 'sub' maps the wall pool covered the exit tiles, so the Depot east exit and Chamber west exit could not be walked into. Exits are re-opened after the pools.
- Test: tools/subtunnel_test.py (0 fails). ch13_test positions moved to row 10. Smoke, ch13, gate00, bg tests 0 fails.

## Painted enemies: Mudling, Skeeter Swarm, Pond Grump, Bog Toad, Log Lump, The Big One (2026-10-29)
- Six painted enemy sheets (tools/sprite-bake/src/foe-<id>-v1.png) baked by the new tools/sprite-bake/bake_foe.py into art/foes/<id>.webp and data/foes/<id>-hires.js, installed by data/foes/use.js (script tags added after nara-hires-use.js). Old rows kept as MONSTERS.<id>.sprite0.
- Battle: engine/battle2-ui.js b2FoeFrame shows the hurt frame when hit or dying and the attack frames in order during a lunge (2 for regulars, 4 for the Big One). New painted enemies reuse the same path.
- Test: tools/foes_test.py (0 fails); smoke 0 fails.

## Painted enemies, batch 2: Big Shake, Tar Pit Blob, Gridlock, Canyon Coyote, Ticket Flurry, Smoglet (2026-10-29)
- Same pipeline as batch 1 (bake_foe.py, data/foes/use.js). Big Shake is a boss (6 frames). New in bake_foe.py: thin gap second-row detection, DROP_GREY for stray specks (Tar Pit Blob). tools/foes_test.py now covers all 12 (0 fails); smoke 0 fails.


## Schoolyard painted plate (2026-10-29)
- Map `schoolyard` (Long Island Elementary, ch5) is now a painted plate: art/schoolyard.webp (24 x 18 tiles at 64 px, from 07_schoolyard_final.png), PLATES entry, plateMask in data/maps-le.js. The old paths and tiles lists are gone.
- Doors: the front doors are the exits at (11,3) and (12,3); the school's doors now land on the porch at (11,4) and (12,4). West edge (0,8) and (0,9) to the Square is unchanged. The playground gate is (17,9).
- Objects re-laid on the art: pillars (10,4) and (13,4) carry the two school wing lines, flagpole (9,5), school sign (15,5), bike rack (4,5), pickup bench (7,7), slide (20,7), swings (21,9), Minivan (2,10), Hatchback (5,10), Sedan (2,13), Snail stone (14,8, was Front walk sign), new Fence bench (19,12). Pruitt now stands at (12,9), Mr. Delgado at (8,14).
- Reworded game text (no clips depend on these): Swings now reads "Two swings. The left one squeaks..." and absorbs the tetherball line (the tetherball object is gone, the art has no reachable pole); the sign is now "Snail stone"; new Fence bench line.
- Chapter 5 ending moved to the aisle behind the minivan: Tom (6,12), Amy (5,12), Grace (7,12), Rose (6,13); the long coat appears at (7,16). Night glow moved to the doors.
- Route into the parking aisle is one tile wide at (9,10), (9,11), (8,11), (8,12), or around the island.
- Test: tools/schoolyard_test.py (0 fails). Smoke, ch5_school_test, bg_test 0 fails.

## 2026-10-29: Battle Voice Baker
- New tools/battle-baker/ (build.py, tpl_head.html, tpl_body.js, handscripts.txt, dump.js, merge.js, test.py, README.md). One page, tab per character, preview current clip, make new take, save only ticked lines. No game files changed.

## Justin smaller head (2026-10-30)
- Tom: Justin's head was proportionally as big as everyone else's, which on a 53 row body made it too big (20.7 rows vs Tom 16). bake_justin.py defaults are now --ratio 0.33 and --ratio-side 0.315 (head about 17 rows, only slightly bigger than Tom's). Rebaked art/chars/justin-ow.webp and data/justin-hires.js; atlas src carries ?v=head2 and the two Justin script tags in index.html carry ?v=head2 so cached copies are not mixed.
- Body height unchanged (53 rows, still taller than Michael 50 and Tom 42). tools/justin_test.py 0 fails, smoke 0 fails. The welcome screen cast and the Gregori house both use this same sheet.

## 2026-10-30: Everyone inside painted rooms 20% bigger
- Tom: now that the interiors are enlarged, the characters looked too small. One multiplier, `INTERIOR_ACTOR_BOOST` 1.2 in `engine/plate.js` `actorK()`, so inside any painted room the effective scale is 1.98 x 1.2 = 2.376. Every painted figure draws through `actorK()` (Tom, Grace, Rose, the recruits, family, and all townspeople), so NPCs are covered by the same change. Streets (1.2) unchanged.
- The talk gap (`talkGapFrame`, engine/town-render.js) widens indoors by the same ratio so bigger figures still do not touch. The heart over a kiss and the talk arrow already followed `actorK()`.
- Not scaled: the blocky fallback figures (`drawNpc`), which only appear outdoors, and monsters (they use `mscale`).
- Tests: `tools/rooms_test.py bakery grands` 0 fails and looked at portrait frames; `tools/smoke.py` FAILS: []. `amyhouse` and `tomhouse` "square plate" check fails before and after (pre-existing: not square plates).
