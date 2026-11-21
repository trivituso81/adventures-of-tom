# next addendum: Square fix (READ BEFORE next.md NEXT TASK 0)

## State (11-05 20:15)
- Approved pictures (Tom approved some only so I could see them): area-square v7; `area-square-fix` v1 (art/raw/areas/area-square-fix-v1.png: library two arched doors, Kettle one lettered sign, extra SCHOOL board at top between Sprout House and Penny's Pockets, exit boards same height) and fix v2 (library one door plus odd beige annex, Kettle sign has NO lettering). fix3 (archways) was worse (two SCHOOL arches in the plaza, right-edge board gone): card and png purged (CHANGES 282).
- Tom 20:10 found the cause: the board wording confused the generator. Faults: "above rooftops" vs "as high as the eaves" contradict; "higher" plus "same spots" reads as move-up-the-picture vs stay-put; "nearby shops" (no shop near an edge board); edit 3 of 3 gets dropped.
- NOW: `area-square-fix4` card (CHANGES 282, `sqfix5`): attaches fix v1, one subject: every post twice as long, boards unchanged, human-scale check ("a grown man can walk under the board without ducking"), plus delete the extra top SCHOOL board (shops named by look). One press. Waiting for Tom. Tom must reload the Library page after each push; a card whose ref was approved minutes ago shows "blocked" until Pages publishes it (about 2 minutes).
- Live Square is still v3 (`square5`). Nothing installed.

## Lessons for prompts here
- One subject per edit. No contradictions. No relative words ("higher", "nearby") in a top-down scene: use proportions ("twice as long") and human scale. Name buildings by look as well as name.

## If fix4 misses
- Ask Tom: is the problem the look in the picture, or characters overlapping boards in the game? Game fix = install fix v1 with the extra board erased (paste fix v2 pixels at the same spot, aligned 0,0, feathered) and put the three boards on the walk-behind layer (template tools/make_hollow_fg.py); Rivituso Row can also be raised about 44 px in pixels. Show a before/after first.

## Install like square5 (after approval)
art/town.webp from the approved picture (trim 88 px off the left of the 4:3 image, scale to 1920 x 1664; check the trim does not cut Crumb Bakery), walk map doors (library doors open into the library), exits (Grump Hollow top, School right, Rivituso Row bottom), tag bump, CHANGES, smoke, purge v3 leftovers and unused area-square-fix* cards and pngs per the purge rule.
