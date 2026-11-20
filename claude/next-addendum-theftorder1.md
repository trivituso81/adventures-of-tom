# theftorder1 (2026-11-13 19:13, main 50be095, build theftorder1): chapter 1 kitchen order fixes

- Tom 19:13: (1) the door frame height picture must show after Grace talks about it, not before; (2) while the mud blob steals the pie only Rose's line plays, the rest of the reaction comes after it has left.
- Done in `SCENES.ch1Theft` (data/scenes.js): `{ch1Reveal:'doorframe'}` now follows Grace's "Tata, look at the door" line (Rose's "Mine's the low one" comes after the picture). Deedee "A WHAT climbed", Rose "It has EYES", Deedee "Forty years", Grace "brownest thing" moved to after the blob despawns and the three are back up, before Tom's "That was UNCALLED for!". Text unchanged, so no clip is silenced, no index rebuild needed.
- Tested: scene played through in tools/reaction_test.py (a temporary copy that presses Enter to close the reveal; the stock harness stalls 90 s at any `ch1Reveal` because it only advances dialogue). Page order correct, no errors. smoke FAILS [], tag_check ok, closeup_ch1_test ok, unused_voice 0.
- NOT looked at: landscape, Duo, a phone.
- Note for next.md: the Project copy of next.md is older than the repo (it lacks ch1build1, ch1fix1, voice3, hugface1 entries from other sessions); whoever rewrites it next should merge from docs/CHANGES.md.
