# Tom ability frames: quality check and rebake list (2026-11-06, QC only, nothing changed in the repo)

Method: viewed all 14 source sheets (art/raw/characters/tom-ab-*) against tom-hero-ref-v1.png, then the 84 baked frames in art/chars/tom-poses.webp. Checked: face and hair match, shirt print, feet, props, baked effects, cutout fringe (no magenta found in any frame). Head size judged by eye only; Tom judges the head row.

## Rebake (Art Library regenerate, then re-cut with ability_frames.py and rebake with bake_tom_walk_v4.py)
| Priority | Move (sheet) | Problem | Fix in the new prompt |
|---|---|---|---|
| 1 | Button Mash (`tom-ab-button-mash-v2`) | Frames 1 to 3: legs end at the cell edge, no shoes. Frames 2 to 6: shirt has no NES controller print or stripes (only frame 1 has it) | Full body with both shoes in every frame, shirt print and stripes visible in every frame (hold the controller low or to the side so it does not cover the print) |
| 2 | 10-Step Skincare (`tom-ab-skincare-10-v1`) | Six waist-up busts. The cutter grafts the battle idle legs under them: visible seam at the hips, jeans too wide for the torso. Glow and sparkles painted into frames 4 to 6; frame 2 has a bottle hanging below the pump hand | Regenerate as full-body frames at battle scale (no busts), glows and sparkles left to the game |
| 3 | Flashcard Flurry (`tom-ab-flashcard-flurry-v1`) | Frame 5: five thrown cards painted around him (thrown props are drawn by the game). Frame 4: shirt print garbled | Cards only while held, none in the air; print intact in every frame |

## Fix without a full rebake, or regenerate if cheap
| Move | Problem |
|---|---|
| Kanji Strike (`tom-ab-kanji-strike-v2`) | Frame 6 has a painted ink splash and drops; frame 3 has a sparkle on his forehead. Brush stays; ink and sparkle should come from the game |
| Know-It-All (`tom-ab-know-it-all-v1`) | Frame 6 has painted puff clouds beside the stamp and head |
| Defend (`tom-ab-defend-v1`) | Frame 1: small pale blob at the fingertip (clean in the cutter). Frame 3 bubble is already dropped by the cutter |

## Passed
Starter Splash, Sourdough Snob, Overpriced Gadget (gadget in frame 3 reads small, optional), Noise Canceling, Seat 1A, Delta Ult (tongs and towel are a design call, not a defect), Konami Code, Cart Ult.

## Next session
Rebake in order 1, 2, 3 (3 Generate presses; one Library entry each, 1 press per sheet), show Tom each sheet before installing, then re-cut and rebake. Stop-loss applies if a sheet misses the same way twice.
