# listen1: install the approved listening poses (card c-listen1-install)

Built in idea-implementlisteni (2026-11-20, card c-idea-implementlisteni). Tom's words: "implement listening/thinking poses (should be generated and approved in art library) for all chapter 1 talking interactions, including cut scenes."

## What is already live (no art needed)

- `engine/emotions.js` `emoListen`: while a chapter 1 line shows, people near the speaker who are not talking stand in `tk_listen` or `tk_think`, as `docs/listen-lines.tsv` says (built into `data/listen-types.js` by `python3 tools/listen-apply.py`). Reactions (`docs/emotion-reactions.tsv`) win. Held 0.6 s between scene lines (`emoHold` is a list now). Press-A chats: only Tom and his followers listen.
- `tk_think` is baked for the whole cast (report c5no), so think lines already show it. `tk_listen` frames do not exist yet, so listen lines show the plain stance until this install.
- The install code is written and switched off until the pictures exist: `talk_frames.py` appends `listen` after `think` (`SINGLES`), `bake_story_poses.py` names the frames by which pictures exist (`_talk_names`) and adds Sal's set `salls` when `art/story/salls.webp` exists, `report_singles.py` adds the strip `salls` when `sal-listen` is approved, `bake_talkpose_faces.py` divides the strip by 6 when a listen picture exists (no face is cut from it).
- Tested: with no listen picture `talk_frames.py tom grace` rewrote `art/talk/*.webp` byte for byte; with a stand-in picture it wrote 6 frames and `_talk_names` gave `tk_listen` last.

## Art Library entries (tab Characters, each in its person's own section since listengroup1, 2026-11-26)

`tom-listen`, `grace-listen`, `rose-listen`, `deedee-listen`, `boppy-listen`, `ellie-listen`, and since listengroup1 `tnb-listen`, `amy-listen`, `justin-listen` (drafts until Tom generates and approves them; installing `tk_listen` for those three is a later step). The old `sal-listen` has no entry (`tools/art-library/listen-prompts.js`). The prompt is the approved `<id>-think` prompt (`pose()` in `ch2fix-prompts.js`, same references) with only the pose sentence changed. (Before listengroup1 Amy and TNB had none because they never listen in chapter 1; Tom asked for every main character to have one.) A rejected entry: change only what Tom's note names (repo CLAUDE.md "Fix a miss with the smallest change").

## Install steps (after Tom approves; Sonnet 5.5, medium)

1. `git pull`. List the approved ones: `ls art/raw/characters/*-listen-v*.png`. Install only those; a missing one keeps the plain stance.
2. `CHECK=/tmp/listen.png python3 tools/sprite-bake/talk_frames.py tom grace rose deedee boppy ellie` (only the approved ids). Look at the sheet: the sixth figure stands as tall as the first two and its head matches theirs. If a head is clearly off, say so and stop (do not invent a factor).
3. If `sal-listen` is approved: `CHECK=/tmp/sal.png python3 tools/sprite-bake/report_singles.py salls`, look at it.
4. `nohup python3 tools/sprite-bake/bake_story_poses.py > /tmp/sp.log 2>&1 &` (about 11 minutes). Afterwards keep only the changed sets of these people and `salls`: a full run also rewrites palette rows of nine NPC sets and the `pipemo` atlas with no art change; put those back from `origin/main` (CHANGES reports-2026-11-19c "Rebake drift").
5. Facing: look at each `tk_listen` frame and add one row per person to `docs/pose-facing.tsv` (`<id>	tk_listen	l|r|f`: the screen side the face is turned to; the prompt asked for left, the generator may not obey). `python3 tools/pose-facing-apply.py`, then `python3 tools/pose-facing-apply.py --check`.
6. Test: `LATE=1 python3 tools/reaction_test.py tools/listen_cases.json /tmp/lt` then `python3 tools/listen_report.py /tmp/lt/result.json --standin` (with the real frames baked, `--standin` expects `tk_listen` on listen lines). 0 misses. Look at the late frames of `l1-theft`, `l1-mud-spot`, `l1-opening` (Sal) and one landscape case (`"layout":"landscape"` in a copy of a case).
7. `python3 tools/smoke.py`, CHANGES heading `## listen1 (...)`, `python3 tools/art-library/bump_tags.py listen1 --base origin/main`, push. The card's `after` is the Tom play card `t-listen1-play`.

## Not done in idea-implementlisteni

- Tom while he carries Rose (the opening to Aunt Ellie's) keeps his ride picture: there is no "listening while carrying Rose" painting.
- Monsters and Nara never listen.
- Chapters 2 and later: `LISTEN_CHAPTERS` is `[1]` in `tools/listen-apply.py`.
- `node tools/art-library/make-prompts.js` fails on main before this build (`npc-prompts.js`: no palette for `boomie` and `vance` in `prompts/npc-palettes.json`), so the 7 entries were inserted into `data/art-prompts.json` with the same merge rule. A later full rebuild includes them (`listen-prompts` is in the module list).
