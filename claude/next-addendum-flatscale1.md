# Flat room scale (flatscale1, main at d1141a7; CHANGES "flatscale1")

Read with claude/next.md; fold into it at the next rewrite.

- Tom 11-10 17:01: people must not change size walking up and down; the paintings are flat, not perspective.
- Fact: the row-based scaling came from roomscale1 (11-07, Tom's own "size characters per room" order), rooms only. Outdoors was always one constant.
- Change: `roomPxPerFoot(sc,yArt)` in engine/plate.js returns the average of the room's `front` and `back` px per foot at every row (also used by `bodyH` walk-behind and story.js gather). `ROOM_SCALE` numbers kept; to resize a whole room change its two numbers (they are averaged).
- Call made: the middle value, not the front value. If Tom says a room is now too big or small, change that room's two numbers together.
- Tests: tools/room_scale_test.py (grands, shop, casa, tomhouse: front vs back within 5 percent), smoke FAILS []. Not on a phone.
- Waiting on Tom: phone check of a few rooms; ones that were strongly perspective (grands, library, cinema, greenhouse) changed most.
