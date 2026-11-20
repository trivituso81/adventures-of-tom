# follow1 (2026-11-19): followers lag behind Tom in free walking

Repo detail: docs/CHANGES.md "follow1". Board card c-follow1 (Tom's phone check: t-follow1play, fyi).

## Report

Tom: party followers lag behind Tom during free walking in chapter 1 and then catch up.

## Cause (confirmed, not assumed)

`hiddenSpot` (engine/followers.js, added in cutpolish3 for Rose vanishing behind the kitchen half-wall) makes a follower skip its step when its next spot is behind a painted cutout (`huddleHidden`, from `PLATE_BEHIND`). `movePlayer` ran it in every map and every state. The Square has dozens of cutout zones, so followers froze all the time and ran to catch up once past them. Same walk, A/B: with `hiddenSpot` on, 51 freezes and followers up to 8.06 tiles off their spot in the walking line (1.8 s over 2 tiles); with it forced off, 0 freezes and a worst gap of 1.0 tile. `followersWhereTheyStand` (cutpolish1) was not involved: it runs once at the end of a scene.

## Fix

`hiddenSpot` returns false unless `intro.active` (a scene is running). The kitchen case is a scene, so it still holds there; the theft run of cut_natural_test still passes (no Rose hidden).

## Test

`python3 -I tools/cut_natural_test.py <out> free` (also part of the default modes; `LAYOUT=landscape`). Autopilot replaces `moveInput`, so it walks through the real `movePlayer`, `update` and the portal transition: 52 tiles from (8,6) in the Square to the bottom edge (13,25), then down the Row to (14,19), Rose walking (no `ride` flag). Records every frame; fails when a follower is more than 2 tiles from its spot in the walking line for more than 0.5 s, when fewer than 30 tiles were walked, or when a scene or page error interrupts. With the fix: worst gap 1.0 tile, portrait and landscape. Row goal is (14,19), not (13,19): an NPC can sit on (13,19).

## Known, not touched

`python3 tools/board_sync_test.py` (run by smoke) fails on main before and after this build: its check "board_check --push refuses a build whose card has no after" removes `after` from c-board3, which is Done now, so nothing fires. Fix by building the test card inside the test instead of using c-board3.
