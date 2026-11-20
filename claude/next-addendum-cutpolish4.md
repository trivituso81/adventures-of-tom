# cutpolish4 (2026-11-19): cutscene polish phase 4 (the kitchen heist)

Plan: claude/cutscene-polish-plan.md section 3, phase 4. Repo detail: docs/CHANGES.md "cutpolish4". Next is phase 5 (movement and listeners, card c-cutpolish5) and, once Tom approves a picture, cutpolish4b (the empty counter).

## What was built

| Piece | Where | Fact |
|---|---|---|
| Entrance | data/scenes.js ch1Theft | Mudling spawned on the door tile (8,15), pose mh_charge, fade 0.15 s, walks (8,14) to (8,11) at 0.15 s a tile with the door bang. Spot and wind-up beats kept. The ooze frames are no longer used in the entrance. |
| Timed camera | engine/story.js `cam` | `{cam:[x,y],time:.26}` is a step that pans the held camera point from where it is now to the target, cubic ease out. Without `time` it is the old instant set. Used as `{cam:[6,9],time:.26}` before the grab. |
| Knock targets | ch1Theft | Tom (8.6,8.6), Grace (9.8,9.4), Rose (7.2,9.6). Looked at in portrait: all visible and clear of scenery. |
| Shock | ch1Theft | Deedee and Boppy keep em_surprised through reach and grab, Deedee em_angry on mh_hug, both cleared right before Deedee's "That thing took my good twelve-cup pan!". |
| Props | engine/scene-props.js | `SPK.mudprints` (three prints from tile x,y, fade over 4 s of real time from `t0`) and `SPK.crumbs`. Cleared by `scenePropsClear` at scene end. |
| Library entry | tools/art-library/ch01-prompts.js, data/art-prompts.json | `ch1-kitchen-empty-island`, group Chapter 1, tab Props, draft. Attached picture art/grands.webp, asks for the same kitchen with the three muffin plates removed from the island. |
| Script index | docs/script-convos.tsv | ch1Theft row 50 became 51. |

## NOT done: the empty counter (audit 4e)

Two attempts made the patch by code and both were smeared: (1) per-row wood colour taken from bare wood either side of the plates and stretched across, with noise (horizontal streaks, patch reached over the floor); (2) OpenCV xphoto frequency selective inpainting over ellipse masks (green smear). Stop-loss rule: no third try. The picture goes through the Art Library.

### What cutpolish4b does once Tom approves `ch1-kitchen-empty-island`

1. Look at the approved picture against art/grands.webp. If the generator changed anything outside the island, crop only the island box.
2. Island box on the 1254 px kitchen picture: x 192, y 556, w 222, h 94 (plus a few px for the plate shadows; keep the cake plate's lower right rim, x 222 to 317, y 556 to 607, which lies inside that box: take the crop from the approved picture with the cake plate pixels from the old one if they differ). Save as a webp under art/props/ with alpha only where the plates were.
3. Draw it in both layers: the base plate (engine/plate.js `plateLive` area, under people) and the cutout layer (zone draw, engine/plate.js about line 327, inside the clip, right after the fg image is drawn). Scale is map.w*T / 1254. Do not print engine/plate.js lines 240 to 275.
4. Show it when the theft has happened: story flag `ch1-theft` is set at the START of ch1Theft, so use a flag test plus a step that sets a new flag at `mh_grab` (for example `ch1-empty`), and stop showing it when the pan comes back (`ch1-tin` scene, ch1End) or at ch1-home. A save loaded after the theft then shows the empty counter and any other chapter shows the plates.
5. Test: `python3 -I tools/cut_natural_test.py /tmp/cn theft` portrait and landscape; look at frames after the grab.

## Other leftovers

- The painted muffin pan prop (`ch1-muffin-pan`) is still the code stand-in `SPK.muffinpan`; the plan said the painted one replaces it once approved.
- `data/mudling-heist.js` is not rebaked (waits on the approved muffin heist sheet, group Report fixes).
- Boppy is off screen in portrait during the grab (the camera shows the island on the left); only Deedee's shock is visible there. Boppy's held shock shows again when the camera releases.
- Footprints use `performance.now()`, so a SKIP shows them fading by real time.

## Test

`python3 -I tools/cut_natural_test.py /tmp/cn open row theft` and again with `LAYOUT=landscape`. Frames are samples about every 4 s; for a closer look at the heist add a `reaction_test.py` case for ch1Theft.
