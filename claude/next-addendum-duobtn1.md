# duobtn1 (2026-11-12 ~21:10 PT, main 59cfe9b): Duo sideways buttons moved beside A

- Tom's report: on the iPhone Duo sideways, the quest (!), menu and save buttons in the top left were out of thumb reach.
- Fact (pushed; smoke FAILS []): in `html.duo.landscape` (index.html, Duo block) `#hud-btns` sits at the bottom, starting just right of A (left 127 x `--ts`, bottom 20 x `--ts`), each button A's size (46 x `--ts`), 8 x `--ts` apart. `#hud` was widened to the full stage (left 0, padding-left keeps the DOORS counter where it was). The quest text panel (`#objective`) opens upward. Phone landscape, iPad, portrait and Duo upright are untouched.
- Tested in Chromium at 951 x 648 with `?duo=1`: A x 91 to 148, quest 158 to 216, menu 226 to 283, save 293 to 350, all y 566 to 623; panel opens above; no page errors. Frames viewed. Not seen on the Duo.
- If Tom says they are too big, too close to A or in the way: the `html.duo.landscape #hud-btns` rules (index.html, search `duobtn1`). The Duo crease is at x about 475; the buttons end at x 350.
- Note for next.md: add this line under "Waiting on Tom": play the overworld on the Duo sideways and check the three buttons sit right of A and the quest panel opens above them.
