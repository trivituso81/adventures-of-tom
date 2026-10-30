# Map sizes and screen coverage

Every outdoor map is one painting (`art/<map>.webp`, 64 art px per tile) drawn at tile size T = 32, so 2.0x is the painting's native sharpness.
The phone shows a canvas of up to 440 x 956 (portrait) or 956 x 440 (landscape) CSS px. A painting smaller than that leaves flat space around it.

## What the engine does now (2026-10-30)

- **Zoom to cover.** `outdoorCover` (engine/overworld.js) zooms an outdoor painted map just enough that the painting covers the whole screen in the current layout (never below 1.0, never above `OUTDOOR_COVER_CAP` = 2.25). One painting serves both orientations; the zoom differs per layout.
- **Edges flush.** The camera stops at the map edges sideways, so the painting meets the screen edge. Mid-map the whole screen is painting.
- **Safe band.** Next to the top or bottom edge the camera scrolls a little past the map, only into the title bar and controls bands, so Tom's tile is never under the controls (top 82 px, bottom 170 px in portrait; 57 and 106 in landscape). That strip shows `plateBackdrop` (engine/draw.js): the painting shrunk, stretched and darkened.
- **Cap.** A map that would need more than 2.25x keeps 2.25x and shows the same soft backdrop around the painting on some phones.
- Rooms and houses (maps with `outside: false`) are not touched; they keep their own fit.
- `python3 tools/camera_clamp_test.py` checks all of this at eight phone sizes and lists the capped maps.

## Maps that need a bigger painting

These stay at the zoom cap on the largest phones, so some soft backdrop shows around them (worst case in portrait):

| Map | Painting now (tiles) | Zoom portrait | Zoom landscape |
|---|---|---|---|
| flightzero | 19 x 7 | 2.25 | 1.96 |
| memamy | 16 x 11 | 2.25 | 1.87 |
| memgrace | 16 x 11 | 2.25 | 1.87 |
| memrose | 16 x 11 | 2.25 | 1.87 |
| memtnb | 16 x 11 | 2.25 | 1.87 |
| subdepot | 24 x 12 | 2.25 | 1.24 |
| subtunnel | 36 x 12 | 2.25 | 1.15 |

Minimum that removes the backdrop at the 2.25x cap: 14 tiles on each side (flightzero 19 x 14, memory rooms 16 x 14, subdepot 24 x 14, subtunnel 36 x 14).
The size that needs no zoom at all, and so keeps the world at its drawn scale on every phone: **30 x 30 tiles (1920 x 1920 art px)**, a square large enough for both orientations.

## Painting rules for any new or repainted outdoor map

- At least 30 x 30 tiles if the map should look the same in both layouts with no zoom (smaller is fine, the engine zooms up to 2.25x).
- Keep the walkable area at least 6 tiles in from the bottom edge and 3 tiles in from the top edge (at zoom 1), with scenery (trees, water, walls) beyond it. That art sits under the controls and the title bar, so nothing you can walk on is hidden.
- Sideways the painting meets the screen edge, so no margin is needed there.

## Zoom the engine applies to the other outdoor maps (largest phone)

| Map | Tiles | Zoom portrait | Zoom landscape |
|---|---|---|---|
| boiler | 20 x 14 | 2.13 | 1.49 |
| cafetorium | 20 x 14 | 2.13 | 1.49 |
| concourse | 40 x 14 | 2.13 | 1.00 |
| dome | 20 x 14 | 2.13 | 1.49 |
| gate00 | 20 x 14 | 2.13 | 1.49 |
| gatezero | 20 x 14 | 2.13 | 1.49 |
| readroom | 20 x 14 | 2.13 | 1.49 |
| stageset | 20 x 14 | 2.13 | 1.49 |
| subchamber | 26 x 14 | 2.13 | 1.15 |
| towerlobby | 22 x 14 | 2.13 | 1.36 |
| towershelves | 28 x 14 | 2.13 | 1.07 |
| towervault | 22 x 14 | 2.13 | 1.36 |
| foreverheart | 22 x 15 | 1.99 | 1.36 |
| towerpinnacle | 22 x 15 | 1.99 | 1.36 |
| crown | 20 x 16 | 1.87 | 1.49 |
| deadletter | 26 x 17 | 1.76 | 1.15 |
| stillcore | 26 x 17 | 1.76 | 1.15 |
| backlot | 24 x 18 | 1.66 | 1.24 |
| school | 30 x 18 | 1.66 | 1.00 |
| schoolyard | 24 x 18 | 1.66 | 1.24 |
| stage7 | 24 x 18 | 1.66 | 1.24 |
| studio | 24 x 18 | 1.66 | 1.24 |
| towerstairs | 18 x 42 | 1.00 | 1.66 |
| oak | 24 x 20 | 1.49 | 1.24 |
| sundial | 22 x 20 | 1.49 | 1.36 |
| carbarn | 30 x 21 | 1.42 | 1.00 |
| griffith | 24 x 22 | 1.36 | 1.24 |
| hollow | 24 x 22 | 1.36 | 1.24 |
| moonclub | 30 x 22 | 1.36 | 1.00 |
| oakpark | 26 x 22 | 1.36 | 1.15 |
| pier | 24 x 22 | 1.36 | 1.24 |
| row | 24 x 22 | 1.36 | 1.24 |
| stacks | 30 x 22 | 1.36 | 1.00 |
| terminal | 30 x 22 | 1.36 | 1.00 |
| reeds | 26 x 23 | 1.30 | 1.15 |
| jpark | 30 x 24 | 1.24 | 1.00 |
| blvd | 30 x 26 | 1.15 | 1.00 |
| town | 30 x 26 | 1.15 | 1.00 |
