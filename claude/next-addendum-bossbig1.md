# bossbig1 (2026-11-13, main 01379aa): map bosses face the party and are drawn at 2x Tom's height

Tom 06:50 (chapter 13 Drill Worm, landscape): the boss faced away from the party and was smaller than Tom. "I thought we said all the bosses would be substantially larger than the main characters."

## Facts
- Painted enemy sheets all face RIGHT. The map drew every monster unflipped, so with the party on the left every boss looked away.
- Bosses were drawn at a scene-set `mscale` (1.15 to 1.6) of a small sprite, about 0.7x Tom's drawn height (Worm 57 px, Tom 84 px outdoors).

## What changed (engine/town-render.js, plus callers)
- `isMapBoss(a)`: the monster has a `boss` field in `B2_FOES`.
- `monScale(a)`: max(scene `mscale`, ratio x Tom's drawn height at the boss's feet row / sprite rows). `BOSS_TOM_RATIO=2.0`, `BOSS_TOM_RATIO_PERSON=1.6` for `BOSS_PERSON` (vance, julian). Replaces `a.mscale||1` in the draw, `stageBox` (engine/story.js), engine/tapwalk.js and engine/boss-finale.js (finale height). Scene `mscale` values are only a floor for bosses now (Big Mudling and other non-boss story monsters still use them).
- `bossFacing(a,rows)`: mirrors the stance toward the side Tom is on (0.5 tile dead zone, `a._bossFaceLeft`); skipped while a scene pose or finale pose sets its own direction. Ordinary monsters are unchanged (still face right).
- `stageClearSpot(B,boss)` (engine/story.js): with a boss, picks the free tile nearest the boss's left edge (cost term 1.2 x distance from the edge). Fixes ch3 pond, where the thin strip below the bigger fish left Rose hidden behind Tom.

## Tested
- `boss_stage_test.py` on all 25 cases, `boss_stage_report.py`: zero overlap pages except ch12 Gridlock Prime (ch12Prime 7 pages tom/rose, ch12After 2 pages grace/rose; the bus now spans most of the one-screen street; old code 0). ch16Fight 1 facing page (old code had an overlap on the same page).
- Looked at: ch13 portrait and landscape, ch1, ch3, ch8, ch10, ch12, ch14 frames.
- smoke FAILS [], tag_check ok.

## NOT done
- Landscape beyond ch13. Duo. A phone.
- ch12 Gridlock Prime: Rose beside or behind Grace or Tom on some pages (street too narrow for the bus at 2x). Options: lower `BOSS_TOM_RATIO` for that boss only (a per-id table), or hand-stage `ch12Prime` and `ch12After`.
- Portrait: a 2x boss often sits off the top of the screen during dialogue (the cutscene camera frames the party). If Tom wants the boss in view, the camera framing (`stageFrame`, engine/story.js) needs to include the boss box.
- Sizes are a guess at "substantially larger": 2.0x Tom (1.6x for Vance and Julian). If Tom says too big or small, change the two constants.
