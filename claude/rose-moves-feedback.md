# Rose moves: Tom's feedback (26 Oct 2026), to build next
Source: Tom's notes in the Rose Moves viewer (https://claude.ai/artifact/5NF32Nw7oNxotgx3cX562s, db collection rose-feedback) pasted into chat, copied here verbatim in meaning.
Files: data/battle2-data.js (B2_SKILLS.rose.o3), data/abilities.js (B8_KITS.rose names and desc), engine/rose-moves.js (Rm.* and overrides), engine/battle2-moves.js, engine/battle2-traits.js, data/lines.js (LINES.rose), data/rose-ride.js, engine/rose-ride.js.

| Move | Verdict | Tom's note | Build decision |
|---|---|---|---|
| Boop (basic) | tweak | Rose pokes the monster with her index finger | Replace the boop animation with a one-finger poke. Keep free cost and +1 VP. |
| RASPBERRY (sig) | tweak | Real raspberry sound instead of "nyah nyah nyah", plus a tongue animation | New synthesized raspberry (pbbbt) in engine/audio.js sfx; remove the nyah line; tongue sticks out in the animation. |
| Boo!! (A1) | no verdict, note given | No tiptoe. Rose vanishes in a poof, appears behind the monster, shouts "BOOOO!!" | Treat as tweak. Poof out, poof in behind the target, shout. Keep effect (delay + cheer). New line text, so re-bake. |
| Dress-Up Tiara (A2) | replace | Rebrand to an arts and crafts theme and animation, right for a 5 year old | New name, glue, glitter, crayons, paper crowns or similar. Keep slot, 3 VP and the grit_down effect unless Tom says otherwise. Canon says Rose is 6; Tom wrote 5, keep it very little-kid. |
| Giggle Storm (A3) | tweak | Rename to Tickle Storm | Rename everywhere (data, abilities, lines, desc). Re-bake its line. |
| Lamby Hug (A4) | tweak | Rose has 2 Lambys: Lamby (original, more worn and dirty) and Backup Lamby (newer). Both in this move | Show both. Draw Lamby scruffier than Backup Lamby. |
| Floor Is Lava! (A5) | keep | | No change. |
| Tea Party with Lamby (A6) | tweak | Include Backup Lamby in the team party | Add Backup Lamby at the table. |
| Lookout Lamby (B1) | replace | Replace with Lamby Boomerang, using Lamby and Backup Lamby | B1 becomes Lamby Boomerang with both Lambys. Keep the effect that leaves Rose on Tom's shoulders (Pounce and Shoulder Ride depend on it). |
| Piggyback Pounce (B2) | keep | | No change. |
| Bedtime Story (B3) | tweak | Include Backup Lamby | Add Backup Lamby. |
| Lamby Boomerang (B4) | replace | Entirely new attack: Rose calls for Ms. Cathy to attack with treats (baked goods, candy) | New move in B4. Working name Ms. Cathy's Snack Attack (rename if a better one appears). Ms. Cathy enters, throws treats. 5 VP, row attack, keep the slot's role unless a better fit. |
| Pillow Fort (B5) | tweak | Couch cushions, looks like a couch cushion fort | Redraw props as couch cushions stacked into a fort. |
| Operation Shoulder Mecha (B6) | keep | | No change. |

## New canon (Tom, 26 Oct)
- Lamby: Rose's original stuffed lamb, worn and dirty.
- Backup Lamby: Rose's second lamb, newer. Rose has both.
- Ms. Cathy: Rose's sitter, about 60, shoulder-length blonde hair, glasses. Needs overworld/battle art for the B4 move (battle sprite only is enough).

## Notes for the build
- Moved or renamed lines need a re-bake (clips only play when text matches LINES). Add them to status.md "Lines to bake".
- After the build, republish the viewer (see next.md) so Tom can review the new animations and leave feedback again. Clear or overwrite the old rose-feedback docs only after Tom reviews.
- Build in two or three batches and publish the viewer after each so Tom can react early. Test: smoke.py, kit_test.py rose, and the viewer's rvtest.py.

## Round 2 (Tom, 26 Oct, from viewer v3) and what was built (Rose viewer v4, IIFE prefix rg_ at the end of engine/rose-moves.js)
Kept as is: Boop, RASPBERRY, Tickle Storm, Floor Is Lava, Piggyback Pounce, Ms. Cathy's Snack Attack, Operation Shoulder Mecha.
| Move (key) | Tom's note | Built |
|---|---|---|
| Boo!! (boo) | Disappear from the party row, do not approach first | Kneels at home, SHHH, poofs out at home, poofs in behind the monster, BOOOO!!, poofs back home. Line unchanged. |
| Rainbow Unicorn Cut-Out (dress_up_tiara) | Replace macaroni: she draws and cuts out something with unicorns and rainbows | Draws a rainbow then a unicorn on paper, cuts it out with safety scissors, TA-DA!, it flies and sticks on the monster (GRIT down unchanged). Line "I drew you a unicorn on a rainbow! Snip snip!" |
| Lamby Hug (lamby_hug) | Lambs overlap; one in each hand. Line "A hug from Lamby AND Backup Lamby!" | Lamby left hand, Backup right hand, squeeze the monster from both sides with a gap. |
| Tea Party (teaparty_ult) | Line "Tea party! Lamby made the tea and Backup Lamby serves it!" | Backup Lamby's chair moved apart and it pours from a teapot. |
| Lamby Boomerang (lookout_lamby) | Throw both lambs from the back row | Rose stays at home, throws both in a loop through the monster and back, then hops onto Tom (ride kept). |
| Bedtime Story (bedtime_story) | Line "Bedtime story! Once upon a time, there was a Lamby. Then came Backup Lamby!" | Line only. |
| Pillow Fort (pillow_fort) | Fort must not overlap the party; above all of them | Cushion columns outside the left and right party edges, blanket roof above every head (3 and 4 members checked). |
All 4 new lines are silent until the all-voices bake (status.md "Lines to bake").

## Round 3 (Tom, 26 Oct, from viewer v4) and what was built (Rose viewer v5, IIFE prefix rh_)
| Move | Tom's note | Built |
|---|---|---|
| Floor Is Lava! | Rose clearly standing on a real couch cushion, lava underneath | Tan couch seat cushion seen from above at an angle (puffy top, piped front band, dent under her feet) floating in a bubbling lava pool that runs to the monsters. |
| Pillow Fort | Walls look like blocks, not cushions | Walls are upright puffy couch back cushions (bulging sides, piping, tufted buttons, creases, shading), throw pillows on the roof corners. |
