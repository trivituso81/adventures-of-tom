# Moon Club room plate: STOP-LOSS HIT 2026-11-07 00:56 (nothing installed)

## Goal (Tom)
One EMPTY-room painting of the Moon Club interior, 30 x 22 tiles (1920 x 1408). Tom bakes every object separately (mirror stands, coat counter and rail, card tables and chairs, palms, booths, hanging lamps, plaque, rope posts); Claude sizes and places them. Tom's order: work off his Final Fantasy IX room prompt and do NOT remove any style reference (the "no Final Fantasy" word ban is for character prompts only).

## What was tried
| Try | File | Result |
|---|---|---|
| Tom's original prompt (before this session) | his attachment | Correct layout (coat check top left, open Dome doors top center, card tables top right, parquet with compass star, left doorway), but full of loose furniture, three tall mirrors WITH glass, spotless and glossy. Canon wants empty brass stands, dust, matte floor. |
| v1 empty-room version | claude/moon-club-room-v1-prompt.txt (in Project) | A stage with steps and red curtains at the back, a curved wall of tall windows with the dome visible outside, a crescent medallion with swooping gold lanes in the floor, glossy floor with window light. No coat check, no left doorway, no card corner. |
| v2 (v1 + FIXED LAYOUT paragraph, one small window, compass star only, matte floor, no stage/steps exclusions) | sent to Tom as a file; NOT in the Project (project_write failed twice) | Same miss again: stage with steps and a moon-face arch, windows with the dome outside, crescent medallion with lanes, glossy floor, plus a foreground balustrade and staircase. |

## Why it fails (Claude's read, not proven)
1. The generator draws what the prompt names, even in a ban. v1 and v2 say theatrical, Dome, observatory, ballroom, dance floor, curtain, stage, steps, platform, dome beyond. Each one pulls the Dome-ballroom look (stage, glass, crescent medallion). v2's long "NO stage, NO steps" list made it worse. Same mechanism as the character-prompt word ban.
2. With every object removed there is nothing left to hold the layout, so the generator falls back to its default grand-hall composition.
3. Unknown: whether Tom ran these in the same generator chat that painted the Dome (context may steer it). Tom suspects Claude is confusing the generator; that is consistent with 1.

## What worked before
- Tom's first hub image (the original-prompt render with the right layout) is in the claude.ai chat of 2026-11-07 00:36; only Tom can attach it to the generator.
- Square kit2 (claude/square-kit2-02-review-message.txt) fixed paintings by image editing on the existing painting, correcting only what was wrong, not regenerating.
- The jpark / griffith / row `*-ffix-prompt.txt` prompts that worked describe the layout in positive terms with exact positions and few bans.

## Do next (decision, no questions to Tom)
1. Method change: FRESH generator chat, attach Tom's first hub image, short prompt (under 250 words, positive wording only) saying: repaint this exact room, same camera and layout, as an empty room. Keep the walls, arches, open Dome doors, left doorway, coat-check alcove, card-room corner, pillars and the compass-star parquet. Remove every loose object (list them once). Matte, dusty, faded. Keep the Final Fantasy IX painted-style sentence from Tom's prompt. Avoid the words stage, steps, platform, balustrade, dome view, theatrical, ballroom in the prompt.
2. Tell Tom to attach the image himself (say which file) before he presses Generate. Tell him the press cost (1).
3. Check the result against the layout list: coat-check alcove top left, open double doors top center with no view through them, card corner top right, open doorway in the left wall, no stage or stairs or foreground rail, matte floor, compass star (not crescent), two pillars at most, a plain pillar face for the plaque, one small window.
4. If it misses the same way twice again: stop and ask Tom for a hand-drawn layout sketch or to accept the first hub image and bake objects over it.
5. After a good plate: object prompts in this order: three EMPTY brass mirror stands (small, crescent top, no frame or glass), coat counter and rail, two card tables with chairs, palms, velvet booths, hanging lamps, plaque (text MEMBERS ARE ADMITTED BY MOONLIGHT), rope posts. Canon for the check: dialogue-scripts-ch9.json (three small brass stands, plaque, east window moonlight thread, coat for ticket seven, fifty years of dust).
