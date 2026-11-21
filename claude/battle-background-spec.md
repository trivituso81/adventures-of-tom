LITTLE ELSEWHERE: BATTLE BACKGROUND SPEC
Written 2026-10-31. Covers all 29 battle backgrounds (18 repaints and 11 new pictures for places that had none).

1. WHAT THIS IS
Every battle background is repainted in the newer, richer painted style, a touch muted so characters stand out, and rebuilt on one shared stage layout so the party and enemies always look like they stand ON the ground. Each picture has its own prompt file in the prompts folder. Every prompt already contains all the rules below, so each one can be pasted into an image generator on its own.

2. HOW TO USE IT (Tom)
1. Open a prompt .txt, copy everything below the line, paste it into the image generator, ask for 16:9 at 1920 x 1080.
2. Keep the generator's results. Send them all back in one go (a zip or a batch of images, usually with no words). I will identify each by what it shows, fix size and install them.
3. Do NOT attach the two guide images to the generator. They are only for me to check results against (the generator would paint the lines).
4. If a result breaks a rule (for example a floating-looking floor), tell me which picture. I will either fix it in code or write a one-line redo for that picture.

3. DELIVERY FORMAT
- 1920 x 1080 PNG (16:9). I shrink it to exactly 576 x 324 with Lanczos and save bgs/<name>.png.
- Painted to all edges, no border, vignette or watermark.
- The in-game stage is 192 x 108 units drawn at 3x, so every picture ends up 576 x 324 pixels, one picture pixel per screen pixel.
- Detail must survive a 3.3x shrink: nothing finer than about 8 px in the painting.

4. STAGE GEOMETRY (measured from the game code, engine/battle-state.js and engine/battle2-ui.js)
| Item | Game canvas 576 x 324 | Painting 1920 x 1080 |
| --- | --- | --- |
| Canvas (scale factor 3.333) | 576 x 324 | 1920 x 1080 |
| Horizon, where floor starts | y 177 | y 590 (55% down) |
| Party feet, 4 members | (417,240) (450,267) (483,294) (516,318) | (1390,800) (1500,890) (1610,980) (1720,1060) |
| Party feet, 3 members | (426,252) (471,282) (516,312) | (1420,840) (1570,940) (1720,1040) |
| Enemy feet, 1 in front | (168,264) | (560,880) |
| Enemy feet, 2 in front | (184,224) (156,302) | (613,747) (520,1007) |
| Enemy feet, 3 in front | (188,218) (158,262) (188,306) | (627,727) (527,873) (627,1020) |
| Enemy feet, back row | (84,236) or (92,214) (70,268) | (280,787) or (307,713) (233,893) |
| Boss plus helpers | boss x 100 to 168, y 264; helpers (272,266) (294,302) | boss x 333 to 560, y 880; helpers (907,887) (980,1007) |
| All feet land inside | x 70 to 540, y 214 to 318 | x 233 to 1800, y 713 to 1060 |
| Party body height | up to about 125 | up to about 415 (heads reach y 385) |
| Enemy body height | 60 to 100, bosses up to 150 | 200 to 330, bosses up to 500 |
| Calm bands (heads and bodies) | x 45 to 315 and x 400 to 535, y 100 to 177 | x 150 to 1050 and x 1340 to 1780, y 330 to 590 |
| Quiet strip and corner | y 0 to 30; x 450 to 576, y 0 to 57 | y 0 to 100; x 1500 to 1920, y 0 to 190 |

The party stands on a diagonal in the right third (front member at the top, last member at the bottom right). Enemies stand in the left half in a front row, with a back row further left. Characters are big: roughly the height of the lower half of the screen.

5. HORIZON AND GROUND (the rule that stops floating)
- One horizontal horizon line at y 590 of 1080 (55% from the top). Everything above it is wall or scenery, everything below it is floor.
- The floor is one flat, matte, mid-tone surface to all three edges (left, right, bottom). Nothing stands on it, crosses it or is painted on it.
- The floor is 40 to 65% brightness and the same left to right (plus or minus 10% from horizon to bottom). The game draws its own soft dark ellipse under every character; it is only visible on a mid-tone matte floor.
- No rails, steps, water edges, ladders, rugs, tables, pipes, cables, markings or reflections below y 590. Every prop sits at or above the horizon.
- Parallel projection: verticals vertical, horizontals horizontal, no vanishing point. That way a character looks the same on the ground at any x or y.

6. STYLE
- 16-bit era storybook style grown up into rich painted detail, hand-painted brush texture, warm believable light (the same family as the area paintings).
- A touch muted: saturation about 20% lower than natural, contrast compressed (darks no darker than about 15% brightness, lights no brighter than about 92%), no neon, no pure white or black.
- Richest detail in the upper band, quieter toward the floor. No people, no creatures, no text (exceptions: TONIGHT! in the cafetorium and STAGE 7 on the backlot).

7. ZONES
| Zone (1920 x 1080) | What goes there |
| --- | --- |
| y 0 to 100, and x 1500 to 1920 down to y 190 | Quiet. Low detail. The 1x and AUTO buttons, boss bars and banners are drawn here. |
| y 100 to 330, full width | Richest detail and the brightest lights. Landmarks near the horizontal center. |
| y 330 to 590, x 150 to 1050 and x 1340 to 1780 | Calm bands: mid-tone, low contrast, no bright spots, no strong lights. Characters' bodies overlap here. |
| y 330 to 590, x 1050 to 1340 | The center gap that attacks travel through. Scenery allowed but keep it soft. |
| y 590 to 1080, full width | Floor only. Flat, matte, mid-tone, nothing on it. |

8. WHAT WAS WRONG IN THE CURRENT PICTURES
| What I saw in the 18 current pictures | Why characters look like they float | Rule that fixes it |
| --- | --- | --- |
| Glossy floors with reflections and light streaks (classroom, cafetorium, reading room, soundstage, terminal, gate) | A mirror floor has no anchor point, so a flat blob shadow looks pasted on top | Ground rules 2, 3 and 6: matte, even, no reflections or light pools |
| Floor starts too low or has a gradient to dark (stacks, club, dome, barn) | Back-row enemies stand on the wall base, not the floor | Horizon at y 590 for every picture, floor tone flat left to right |
| Water edge, rails, ties, steps, ladders, tables and bookstacks inside the foot zone (pond, car barn, subway, oak crown, library, dinner table) | Feet sit on top of the prop instead of on the ground | Ground rule 5: no props below the horizon |
| Painted ground marks (manhole in Griffith Park) | Reads as a place to stand, and enemies ignore it | Ground rule 6 |
| Dark floors (boiler room, club) | The game's own soft contact shadow cannot be seen on dark floor | Floor 40 to 65% brightness |

9. ACCEPTANCE CHECKLIST (I run this on every picture before installing)
1. Size and aspect: 16:9, scales to 576 x 324 with no crop beyond 3%.
2. Horizon within 25 px of y 590 and straight across.
3. Floor clean: no props, no gradient to dark, no reflections, no markings, brightness 40 to 65%.
4. Calm bands: no pure white, no near-black, no bright spots behind where characters stand.
5. Top strip and top-right corner quiet.
6. Real test: render the picture in the game with a 4-member party and 1, 2 and 3 enemies (and a boss), look at the frames at phone size in portrait and landscape, and confirm every character's feet sit on floor, with the game's contact shadow visible.
7. Text check: only TONIGHT! and STAGE 7, spelled exactly.
A picture that fails 1 to 5 gets a redo note; one that only fails 6 may be fixed in code (for example a small floor-tone adjustment).

10. THE 29 PICTURES
| Picture | Type | Game key | Used by |
| --- | --- | --- | --- |
| 01-pond-town | repaint | (same key as now) | Pond Grump fights, every Long Island outdoor map and house interior (the default picture), Battle Lab. |
| 02-griffith-park | repaint | (same key as now) | Downtown LA, Jefferson Park and Griffith Park maps (every LA outdoor map without its own picture), LA Battle Lab. |
| 03-school-classroom | repaint | (same key as now) | Long Island Elementary school and school yard maps, school Battle Lab flag. |
| 04-school-cafetorium | repaint | (same key as now) | Cafetorium map, school show scenes. |
| 05-library-stacks | repaint | (same key as now) | Library stacks map, stacks Battle Lab flag. |
| 06-library-reading-room | repaint | (same key as now) | Library reading room map, reading room Battle Lab flag. |
| 07-moon-club | repaint | (same key as now) | Moon Club map, club Battle Lab flag. |
| 08-moon-club-dome | repaint | (same key as now) | Moon Club dome map, dome Battle Lab flag. |
| 09-car-barn | repaint | (same key as now) | Car Barn map in Los Angeles, barn Battle Lab flag. |
| 10-boiler-room | repaint | (same key as now) | Boiler room map in Los Angeles, boiler Battle Lab flag. |
| 11-terminal-zero | repaint | (same key as now) | Terminal Zero map, term Battle Lab flag. |
| 12-gate-zero | repaint | (same key as now) | Gate Zero map, gate Battle Lab flag. |
| 13-studio-backlot | repaint | (same key as now) | Studio and Backlot maps in Los Angeles, lot Battle Lab flag. |
| 14-soundstage | repaint | (same key as now) | Stage 7 and Stage Set maps, stage Battle Lab flag. |
| 15-oak-park | repaint | (same key as now) | Oak Park map in Los Angeles, oak Battle Lab flag. |
| 16-inside-the-oak | repaint | (same key as now) | Oak interior map, oak Battle Lab flag. |
| 17-oak-crown-canopy | repaint | (same key as now) | Oak crown map, canopy Battle Lab flag. |
| 18-dinner-table | repaint | (same key as now) | Final fight against Hush9 (boss flag hush9final), set in the dining room. |
| 19-glass-tower | new | tower | towerlobby and towerstairs (chapter 17). |
| 20-glass-tower-shelves | new | towerarch | towershelves (chapter 17). |
| 21-glass-tower-vault | new | vault | towervault (chapter 17). |
| 22-glass-tower-pinnacle | new | pinnacle | towerpinnacle (chapter 18). |
| 23a-forever-engine | new | engine | stillcore and foreverheart (chapter 20), before the calm flag ch20-julian is set. |
| 23b-forever-engine-calm | new | engine_calm | stillcore and foreverheart (chapter 20), once the calm flag ch20-julian is set. |
| 24-sorting-hall | new | sorting | deadletter, memgrace, memrose, memamy, memtnb (chapter 19). |
| 25-subway-tunnel | new | subway | subdepot and subtunnel (chapter 13). |
| 26-subway-chamber | new | chamber | subchamber (chapter 13). |
| 27-terminal-infinity | new | infinity | gate00 and concourse (chapter 11). |
| 28-flight-zero-cabin | new | cabin | flightzero (chapter 11). |

11. INSTALL NOTES (for Claude, next session; Tom can skip)
- Repaints: save as bgs/NN-name.png at exactly 576 x 324 (Lanczos). Bump the ?v= on engine/battle-draw.js, CHANGES entry, tests, then push.
- New pictures: add to BG_FILES in engine/battle-draw.js (keys in the table) and extend battleBgKey by map id: towerlobby and towerstairs to 'tower', towershelves to 'towerarch', towervault to 'vault', towerpinnacle to 'pinnacle', stillcore and foreverheart to 'engine' (or 'engine_calm' when flag ch20-julian is set), the dead ground maps (deadletter, memgrace, memrose, memamy, memtnb) to 'sorting', subdepot and subtunnel to 'subway', subchamber to 'chamber', gate00 and concourse to 'infinity', flightzero to 'cabin'. The glass-tower early return in drawBattleBackdrop (glGround) must be removed or the new pictures never show. The code-drawn drawLEBattleBg backdrops stay as the loading fallback.
- The Pinnacle's animated gold threads and the Forever Engine's gears are drawn in code over the code backdrop today; with a picture they are simply part of the painting. Keep the drifting-mote overlay (b7DrawMapFx) as it is.
- Long Island outdoor maps and house interiors still share 01-pond-town, and LA outdoor maps share 02-griffith-park. Giving each Long Island area its own picture is a later step; ask Tom first.
- Tools: tools/guides in this zip are drawn from the same numbers as section 4.
