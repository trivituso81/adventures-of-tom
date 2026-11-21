# next-addendum-introride1.md (2026-11-12 ~23:10 PT, main 3fcd019, CHANGES "introride1", tag introride1)

NEWEST item for next.md (replaces claude/next-addendum-introlib1.md, which said tomride-intro was waiting on Tom).

- Done (pushed): the opening's six ride frames (`tr_kneel`..`tr_sit`) now come from Tom's approved `art/raw/characters/tomride-intro-v1.png` (set `tomride`, 3 x 2, h 53.9, bake_story_poses.py). `tomride-poses-v2.png` stays only for battle ride frames (bake_tomride.py).
- Done: Tom's kneel picture (sent in chat) is `art/raw/characters/tom-greeting-kneel-v1.png`, frame `hg_kneel` of set `hug`, new approved Library entry `tom-greeting-kneel` (group Tom). `hugHearStep` (engine/intro.js): hear, delight, crouch, kneel held while the girls run in. Mirrored once (picture faces right, girls come from the left).
- Tested: smoke FAILS [], tag_check ok, `reaction_test.py` opening portrait and landscape no errors, portrait frames viewed. NOT played on a phone, not tested in arrivals or Nine Scoops.
- Watch: kneel figure slightly larger than the squat before it. If Tom dislikes the order (kneel after crouch), options are replace the crouch with the kneel or drop one: edit SEQ in `hugHearStep`.
- Still open: Grace's squishy intro sheet (`grace-squishy-intro-sheet-v1.png`) has no Library entry; the group hug frames still show Tom squatting (approved sheet).
