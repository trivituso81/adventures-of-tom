# next-addendum-tomstretch1.md (2026-11-12 ~18:40, main 7c48ded, CHANGES "tomstretch1"; Art Library entry only)

NEWEST item for next.md (merge this line into next.md at its next rewrite): Tom's stretch sheet is now in the Art Library under Characters > Tom.

- Tom 18:24: "add them in the Tom section" (after learning there was no Library entry for his stretch frames).
- Fact (DONE, pushed): new approved entry `tom-stretch-intro` (group Tom, 8 frames, 4 x 2, ar 2:1). Its version is Tom's own painted sheet `art/raw/characters/tom-stretch-intro-sheet-v1.png`; reference is `tom-hero-v2.png`; prompt is `claude/storybook-tom-stretch-sheet-prompt.txt`. Builder `tools/art-library/tomstretch-prompts.js`, added to the module list in make-prompts.js, spliced into data/art-prompts.json after `tom-battle-stance-2` (node round trip, 22 added lines, nothing else changed).
- Nothing in the game changed. The sheet was already baked by `bake_story_poses.py` (set `tom`, frames `st_stiff` to `st_fresh`) and plays in every arrival. The entry has no `bake` field on purpose: Generate or approve would not replace live art.
- Checked: `node tools/art-library/validate.js` OK (876 entries); art.html search "tom-stretch" shows it under Tom, 34 of 34 approved, 0 page errors; tag_check ok. `tools/smoke.py` not run (no engine, scene or data the game loads changed).
- Not done: the sheet's thumbnail did not show in the entry card when served locally (the card shows the reference picture and the path "Approved: art/raw/characters/tom-stretch-intro-sheet-v1.png"). The file serves 200. Not checked whether other approved entries show their picture locally; if Tom says the picture is missing on his phone, compare with `tom-hero` first.
- Waiting on Tom: look at ADMIN > ART LIBRARY, Characters, Tom, "Tom stretch sheet".
