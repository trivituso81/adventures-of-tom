# coinart2 (2026-11-14, main 1ff12ad): approved chapter 3 and 4 pose sheets installed. Newer than claude/next.md and next-addendum-coinart1.md.

## What was done (pushed; smoke FAILS [], tag_check ok; title stamp `build coinart2`)
- coinart1 NEXT item 1 DONE. New cutter tools/sprite-bake/story_ch4_frames.py (art/raw/characters sheets ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2, ch3-tom-net -> art/story/<set>.webp); bake_story_poses.py `STORY_STRIPS` makes sets under the member: `tomch4` (c4t_kneel, c4t_bulb, c4t_visitor, c4t_crew, c4t_cross, c4t_phone), `tnbch4` (c4b_pull, c4b_toss, c4b_steamer, c4b_shock, c4b_hat, c4b_thanks), `narach4a`/`narach4b` (c4n_*), `tomnet` (c3t_net). Set ids start with the cast prefix on purpose (lazy atlas load, PAINTED_CAST).
- Scenes wired with `{pose:'<who>',f:'<frame>',mid:'<who>'}` (clear = `{pose:'<who>'}`): ch3Hollow net (code-drawn net and flag ch3-netup PURGED), ch4Nara howl, ch4Arrive visitor lanyard, ch4Snack sit, ch4Fetch alert and tag, ch4Hat kneel, bulb, folded arms, table pull, ch4Boss TNB shocked, ch4AfterBoss toss and thank-you, ch4Backup hat, ch4End steamer, crew lanyard, phone.
- Details and unused frames: docs/CHANGES.md `coinart2`.

## NOT done
- Nara poses were not seen on screen mid-scene (one frame only); Tom kneeling, bulb and TNB's table pull not captured between pages; landscape, Duo, phone. Nara's two sheets bake at different factors (.79, .93): if a pose looks off next to her stand, give that set its own `h` in STORY_STRIPS and rebake (about 10 minutes, background; then `git checkout art/chars/pipemo-story.webp data/npc-poses.js`).
- Still stand-ins: the grey circle on Stage 7 (ch4-stage7-grey not returned); chapter 5 pieces; ch4-megaphone-normal waits until after chapter 6; Director's Cut ENDING sheet has no coin.
- coinart1 leftover: no fight against the Director's Cut or Iron Gill looked at on screen (Boop, Flashcard Flurry, pie tin, lock reticle on Iron Gill's hand-measured eye and mouth marks).

## NEXT SESSION
0. Tom's play report on chapters 2 to 4 first, if any.
1. Look at a fight against Iron Gill (chapter 3 boss) and the Director's Cut in portrait; check the moves land on eyes and mouth.
2. Update claude/story-build.md board (chapters 2, 3, 4 BUILT, waiting on Tom to play) and fold ch2build1, ch3build1, ch4build1, coinart1, coinart2 addenda into next.md, then delete those addenda.
