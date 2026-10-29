## 2026-10-29: Nara on the welcome screen sits behind Grace
- `SPLASH_SPOTS` in `engine/splash.js`: Nara moved from the bottom left to behind Grace at the foot of the stairs (x 262, feet 1066, h 104) and listed first so every family member draws over her. No spoken lines changed.

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
