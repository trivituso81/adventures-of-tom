# startpics1 (2026-11-22): start pictures for the rest of the cast

Card c-startpics. Facts, build and tests: docs/CHANGES.md "startpics1", docs/BATTLE_GUIDE.md "Start pictures".

How the first four were made (found, not remembered): the approved hero picture (`art/raw/characters/<who>-hero-vN.png`, 1024 x 1536) is the only reference of a Nano Banana 2.1 edit on fal (`tools/art-library/prompts/hero-leftfacing-magenta-v1.txt`): same character, facing left, flat magenta, whole figure in frame. Result `art/clips/start/<who>-hero.png` (848 x 1264). Wan 3.0 uses it as first and last frame (`wangen.fit_frame`). There was never a cutout step before the video; the key is applied to the finished video in the bake.

Next, for whoever takes it: Tom taps Make the start picture for each person in the Battle Guide (card t-startpics-try, about $0.90 for six). A picture that comes back with an error row says why (page shows it); fix by one change (usually the prompt file's wording for that person), never by a painted pose. Michael has no battle kit: add `start-michael` (he has only `michael-hero-ref-v1.png`) when he gets one. Mirrored pictures move anything carried on one side to the other side; Tom may reject a mirrored one that looks wrong.
