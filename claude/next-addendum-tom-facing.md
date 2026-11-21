# Tom battle stance facing fix (11-06 17:19, CHANGES 414, `tomface1`, push b256f97)

NEWEST item for next.md section 6b (merge this line into next.md at the next rewrite: next.md itself was not rewritten this session).

- Tom: "new battle stance he's facing the wrong way."
- Fact: `tom-battle-stance-1-v2.png` is painted facing screen-right (ready, breath, offer, wind, lunge, guard). Sheet 2 (`tom-battle-stance-2-v1.png`) faces left. Battles need screen-left.
- Fix: `MIRROR = {'tom': {'battle-sheet-1'}}` in `tools/sprite-bake/battle_sheet_frames.py` mirrors all of sheet 1 for Tom, rebaked `tom-battle.webp`, `tom-poses.webp`, `data/tom-hires.js` (KO atlas unchanged). Hand and watch side swap with the mirror (the one exception to "painted as painted"; the reason is direction).
- Checks: contact sheet all slots face left, kit_test tom FAILS [], smoke FAILS [], tag_check ok.
- The 14 `tom-ab-*` ability sheets were made with refs that include stance sheet 1 facing right; if ability frames also face right on the phone, the cause is those ability sheets, not the stance.
- Same trap for other characters: before installing any `<id>-battle-stance-1/2`, check which way each sheet faces on the contact sheet; add the id to `MIRROR` for the sheet that faces right.
- Watch on the phone: Tom's stance in every battle faces the monsters; hip/spread frames now have watch on the other wrist.
