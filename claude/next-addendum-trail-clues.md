# Trail clues (Tom 2026-11-06 07:39), pushed as `trail1`, CHANGES after 347

Fact: where the player only has to find an enemy, boss or trigger and no object leads there, Tom wants a trail of 3 clue objects. Clue 1 far from the target (ch1: upper left), the next clue appears once the previous one is investigated, clue 3 points at the target.

Built: 6 draft Art Library sheets, tab Props, group "Trail clues", ids prop-trail-a to f (json 530 entries, Props 53). Module tools/art-library/trail-prompts.js (reuses `sheet` exported from dungeonfind-prompts.js). Cost to Tom: 6 Generate presses.
- a: ch1 crumbs (rhubarb crisp, The Big One), ch2 tar (The Big Shake), ch3 wet clues (Snag, Iron-Gill)
- b: ch4 film (backlot), ch5 red ink (Red Pen), ch6 acorns (Chairman Cheeks)
- c: ch7 pages (The Unread), ch8 embers (Old Ironbelly), ch9 mirror glints (Mirrorball)
- d: ch10 travel (Last Call), ch11 bell and clock (FINAL CALL), ch12 traffic (Gridlock Prime)
- e: ch13 rock dust (Drill Worm), ch17 lenses (Twin Lenses), ch19 censor marks (Oblivion Censor)
- f: ch20 tide (Leviathan), Nine Scoops frost (freeze trail)
No trail: ch14 to 16 and 18 (scripted targets: porch, HUSH-9 etc.). Themes are inferred from boss names and intros.

Not built: the code. Needs per clue a flag, the next clue drawn only after the previous is pressed, a STORY_MAPFX glow on the current clue, and clue positions per map (clue 1 far from the boss). Install after Tom approves a sheet, one chapter per push, same method as dungeon finds (docs/DUNGEON_FINDS.md, "Trail clues").
