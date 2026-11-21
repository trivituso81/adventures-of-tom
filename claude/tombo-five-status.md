# Tombo five changes: status (2026-10-27, game NOT published, live stays v319)

What Tom asked: "implement everything pending". Only the five Tombo changes from claude/tombo-moves-feedback.md needed no input from him.

## Built on the live v319 base (local /home/claude/live2, not published)
Saved as a unified diff against live v319: claude/tombo5-live-base.patch (files: engine/battle2-kind.js, data/battle2-data.js, data/lines.js, data/abilities.js, engine/battle2-ui.js, data/scenes.js, data/bonus-nine-scoops.js). Apply with `patch -p0` after checking sha256 of the live files.
- grace1 Squishy Delivery (replaces Hi Guys, Welcome Back; scenes.js and bonus-nine-scoops.js mentions renamed).
- grace1_dc Smash That Like Button as a duet: Grace flanks the button, 3-2-1 countdown, Tom copies a beat late, four fists on the dome, HIGH FIVE.
- grace2_dc Judge Grace: Tom face-plants and says OW (new line key tom.dcgrace2ow), Grace does one flowing combo with a hurdle over Tom.
- grace3 now The Golden Dumpling Wish (was Bedazzle Everything on live): grumpy genie dumpling, "WISH GRANTED... PROBABLY", Tom squashed flat, mini dumpling rain bonks every monster and one drops into the fallen friend. Numbers and effects unchanged. Renamed in battle2-data.js and abilities.js.
- rose2_dc: tiara placed from the sprite's real head top; the gold triangle at Rose's chin was the actor arrow, now hidden while animations run (battle2-ui.js).
- New lines (silent until baked): grace.tombo, tom.tombograce, grace.tombo3, tom.tombograce3, tom.dcgrace2ow.

## Tests
tprobe (party tom,grace,rose and tom,grace,rose,amy; 3 and 2 monsters; portrait and landscape) for all five: no page errors, all finish. Frames checked. smoke.py and kit_test.py are stale or were not copied locally, so they were not run.

## Found late
The Tombo viewer (VrMAWiv4Q8RZhF4CeAg2Lo) already carried these five changes on its older base (built in an earlier session, collection tombo-feedback3). The live-base port above is the version to merge into the game when Tom approves. The viewer was not republished.
Open: "OW!" reads like "OH!" in the 3x5 font (W glyph looks like H).
