# cutfront1 (2026-11-14, main 8739032): painted cutouts no longer cover people standing in front of them

Tom 08:40, screenshot of chapter 1 `ch1Grump` in Grump Hollow, landscape: "In almost every cut scene in the game, when the character is near a cut out element on the screen, it overlaps them." The bench drew over Boppy's head and the person to his left.

Cause (fact): `plateWalkBehind` (engine/plate.js) redraws a painted slice of a `PLATE_BEHIND` zone when ANYONE stands behind it (feet north of the zone's `base`). The slice then covered everyone whose body reached into it, including people standing in front of it. Only zones with `front:true` (shop counters, nickels, Moon Club walls) redrew the people in front, unclipped. In cutscenes the party stands in tight groups, so one walker behind a bench, tree or board pulled the slice over the rest.

Fix: one depth pass in `plateWalkBehind`.
- Hit zones are found as before (someone behind it, body box overlaps).
- The hit zones (key = `base`) and every actor whose feet are south of the highest hit base (key = feet y) are sorted; an actor exactly on a base sorts before the zone (behind it).
- Drawn back to front: a zone draws its slice; an actor is drawn again once per already drawn zone it is in front of and near, clipped to that zone's shape. Pixels outside the slices never change, so no doubled shadows.
- Reach box: people 110 art px each side, 420 up (or 1.15 x bodyH in rooms); monsters 420 and 900 (bosses at `monScale`). Too wide only costs a clipped redraw.
- The old `front:true` redraw block is removed. The `front` flag still matters to the staging test in engine/story.js (`hid`, line about 526), so the five `front:true` flags stay.
- Unchanged: the live-props pass and the Bready Mercury jar redraw after it.

Tested: `reaction_test.py` `ch1Grump` (map hollow, party tom grace rose deedee, flags `ch1-t2`, unflag `ch1-tuts`) from [6,9,"up"] and [5,8,"up"], before (git stash) and after: before, the bench covered Grace's and Tom's bodies; after, both whole and Deedee behind the bench still behind it. `ch9Club` Moon Club: everyone whole. `ch2Starter`: Tom behind the island still hidden by it, jar on top. Smoke FAILS [].

NOT done: landscape frames, Duo, a phone, the full scene scan. If Tom still sees a cut-off person: get the map and the people's tiles, check the zone's `base` (a base drawn too far south makes someone "behind" who looks in front; fix the base in that `PLATE_BEHIND` entry, never print engine/plate.js lines 240 to 275 whole).
