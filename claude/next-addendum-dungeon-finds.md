# Dungeon finds (Tom 11-06 02:36), pushed as `dfind1`, CHANGES 335 in the repo

- Tom asked: list every object the party has to find in each chapter dungeon, then make overlay art so they are easy to spot. Fact: 92 objects, chapters 3 to 11, 13, 17, 19, 20 and Nine Scoops. Chapters 1, 2, 12, 14, 15, 16, 18 have none.
- Table with map ids, flags and tiles: docs/DUNGEON_FINDS.md in the repo. Prompt text: tools/art-library/dungeonfind-prompts.js (13 sheets, ids `prop-find-<chapter>`, Art Library tab Props, group "Dungeon finds", data/art-prompts.json 524 entries, Props 47).
- State: all 13 sheets are drafts. Tom presses Generate (13 presses, about $0.04 each plus $0.01 per reference) and approves. NOTHING is installed or wired.
- When approved sheets come back: cut them like the battle props (tools/sprite-bake/bake_prop_sheets.py pattern, art/props/find/), draw them as overlays at the tile in each map's object list, and purge the code drawings they replace (liveKinds: ch4 jbox, lightrig, tapemark; ch6 mound; ch9 mirrorstand; ch10 gateclock; ch19 dlmem, dlkeep; ch20 cedoor, celift). Objects baked into a plate need that spot painted out when the plate is next redone.
- Designed from the object name only (no existing look): ch20 doors, ch17 shelf towns, ch19 keepsakes. Tom's eye decides.
