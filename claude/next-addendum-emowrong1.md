# emowrong1 (2026-11-13, main 0408b36, tag emowrong1): Moss and Pip mood faces and poses now show the right kids. DONE and pushed, waiting on Tom's phone check.

Read with claude/next.md (not edited there so as not to clobber other sessions).

- Tom 12:34: talking to Moss and Pip, the emotion frames were another character.
- Fact: the approved v1 sheets `npc-emotions-moss` and `npc-emotions-pip` drew other people (Moss: teal hair, maroon pants; Pip: blond, purple sweater) while their heroes and walk sheets are Moss = brown hair, green shirt, brown pants; Pip = yellow cap, red shirt, grey pants. Library refs were right; the generator ignored them. Dot's sheet matches.
- Tom regenerated and approved v2 for both (12:41). Rebaked: `emotion_frames.py moss pip`, `bake_emotion_faces.py moss pip`, `bake_story_poses.py` (only Moss and Pip files changed), `EMO_V` = emowrong1. Smoke FAILS [], tag_check ok. Looked at: contact sheet of the 16 new faces beside the plain talk faces. NOT looked at: the live dialogue box (the test harness caught the box mid-fade twice), landscape, a phone.
- Pip head size: Tom said at 12:42 he changed it. Not on main when this ran (data/head-requests.json empty; head_tweak.json has pip 1.36, kids 1.3, used as is). If he saves it in ADMIN > HEAD SIZES, run `python3 tools/sprite-bake/head_adjust.py apply-requests` on a clean tree, then the follow-up bakes in CLAUDE.md "One head multiplier", bump `EMO_V` and `TALK_V`.
- NOT checked by eye (crude colour score flagged them): boomie, skye, dana, sam, reel, luna. Marlowe is grey on purpose. Compare each NPC's mood-face row with its walk sheet before assuming a miss.
