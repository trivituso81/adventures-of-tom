# Flight makeover (Long Island <-> Los Angeles), prompts sent 2026-10-30

Tom has 12 prompt files (flight-01 to flight-12, source copies were in the session scratchpad; the prompt text follows the prop-sheet prompt format). He generates each image in his other AI and sends them back, often with no words. A batch of these images means "install the flight art".

## What the flight is today (engine/travel.js, all procedural pixel drawing)
- flightSteps: board (flat #141c1a screen) -> takeoff 4s -> map 8s -> landing 4.2s, then arriveLA or arriveHome.
- drawFlightSide(F,time): takeoff and landing, side view. inLA = (takeoff) !== west. Draws sky bands, sun, hills (parallax .2), skyline or houses (.45), field rows and runway (1.0), foreground bushes (1.6), plane, tire smoke. Plane heads left when west (mirrorRows). Plane position and tilt come from t.
- drawFlightMap(F,time): buildUSMap() paints a 160x100 map; proj() maps lon/lat; SPOT.le and SPOT.la are markers; curvePoint arcs the plane; clouds drift east. Plane is PLANE_TOP rotated along the arc.
- flightBox(vw,vh,talk) sizes the picture above the dialogue box. Sky and ground bands fill the whole stage.

## The 12 images
| # | File | Size | Used for |
|---|---|---|---|
| 1 | cabin window | 1024 sq | replaces the flat board screen |
| 2, 6 | sky LI, sky LA | 1024 sq, opaque, sun baked in at center | replace sky bands and sun |
| 3, 7 | skyline strips | 2048x512, transparent, seamless | replace hills and skyline layers (one parallax, ~.3) |
| 4, 8 | ground strips | 2048x640, opaque, seamless | replace field rows and runway (parallax 1.0); runway band is 8 to 40 percent down |
| 5, 9 | foreground strips | 2048x384, transparent, seamless, sparse | replace bushes (parallax 1.6) |
| 10 | plane side sheet | 3x3 cells of 512x320, nose right, transparent | 1 taxi, 2 rotate, 3 climb gear down, 4 climb gear up, 5 cruise, 6 descend, 7 approach, 8 flare, 9 landing roll with spoilers |
| 11 | map props | 4x4 cells of 256, 15 used | 1 to 3 plane top view (level, bank L, bank R), 4 contrail puff, 5 to 10 clouds, 11 home pin, 12 away pin, 13 path dot, 14 compass star, 15 tire smoke |
| 12 | US map | 1600x1000 opaque | replaces buildUSMap(); framed to match proj() (Pacific coast 5 percent in, Maine 95 percent, top 14 percent, bottom 94 percent) |

## Install plan
1. Measure each image (the AI will not follow sizes exactly). Cut sheets by gaps, key out magenta or soft fringe (same as tools/sprite-bake bake_foe.py and sheet.py slice_sheet). Crossfade the left and right edges of the strips if the seam shows.
2. Save as art/flight/<name>.webp. Preload in the same style as art/foes and engine/painted.js.
3. In engine/travel.js, draw the painted layer when its image has loaded; keep the current procedural drawing as the fallback until Tom approves on his phone. Scroll strips with the existing drift value. Pick plane frame from t: takeoff 1 (t<1.6), 2 (to 2.0), 3 (to 2.8), 4 after; landing 6 then 7, 8 at t about 2.2 to 2.6, 9 after touchdown. Keep tilt from the engine.
4. Retune proj() and SPOT to the painted map if the framing is off; swap square pins for pins 11 and 12.
5. Test: python3 tools/smoke.py plus a flight in both directions, portrait and landscape, screenshots at takeoff, map, landing.
6. Add a docs/CHANGES.md entry, bump ?v= tags, push to main (needs add_repo with access push).

Decisions made while writing the prompts: generic airliner with no airline markings (no brands); sun baked into the sky square at horizontal center so portrait and landscape crops both keep it; Canada and Mexico drawn as ocean to match the current look.
