# Chapter 6 build, stage 4 handoff (2026-11-14, chapter 6 build conversation, stage 3 done and pushed as ch6s3)

Read this with claude/story-build.md (section 11), claude/story-ch06.md and claude/next-addendum-ch6stage3.md (stage 2 notes: block-break engine). It does not replace claude/next.md (next.md was NOT edited this session; add one line saying ch6s3 is pushed and stage 4 is next). The tracker Live cell for chapter 6 was not rewritten: treat this file as newer.

## Done in stage 3 (ch6s3, main 9c996bb)
- data/scenes.js: scenes ch6Arrive, ch6Kitchen, ch6Nara, ch6Park, ch6Gallery, ch6Spy, ch6Stuffer, ch6DigScene/Fetch/Door/Oak/Board/Ladder/Boss, ch6AfterBoss, ch6Discovery, ch6End, ch6Crock follow the locked script (scenes 1 to 15). Triggers added: ch6-discovery (map oakpark, flag ch6-clear, notFlag ch6-disc), ch6-end (jpark, ch6-disc, notFlag ch6-street), ch6-crock (tomhouse, ch6-street, notFlag ch6-done).
- Flags: ch6-oak-block (park scene, shows grey circle and block), ch6-disc, bb-oakpark (set by the break), bb-oakpark-run (set when the squirrels have run up the Oak), ch6-street, ch6-crock, ch6-done (end of chapter 6 at the moment, see below).
- engine/block-break.js: coin lying on the table before the break (`BB.pre`), `run` config + `{squirrelsrun:'oakpark'}` (freed squirrel and the Chairman run up the Old Oak), scripted monsters not stashed (`n.scripted`).
- New close-ups (data/closeup-ch6-reveal.js, tools/art-library/bake_story_ch6.py): acorn, corkboard, jar with coin, crusted coin, crock; crock prop art/props/tomhouse/ch6_crock.webp drawn on the kitchen island once ch6-crock is set (engine/plate.js). Flight photo before Tom's ch6 flight lines (engine/travel.js `photo`).
- Tested headless in portrait: Discovery (to completion, with the block break and the run up the Oak), AfterBoss, street, crock. Block-break test and smoke pass.

## NOT done (stage 3 gaps, do these first in stage 4)
1. Landscape play of the new scenes (only portrait was looked at). Frames for ch6Park (picnic table section) and ch6Kitchen were not looked at either.
2. Talk/emotion table rows for new and reworded cast lines: `python3 tools/talk-index.py --add`, fix each new row's `talk` by hand, `talk-apply.py`; emotion tsvs for new lines.
3. `unused_voice.py` check 4 lists 68 old dialogue clips (they predate this build; includes the old stage 4 scenes' lines). The old AfterBoss lines (taped coin with a clock face, "That makes four...", "Was that a pun?") are no longer played: purge per docs/PURGED_VOICE.md if the audit flags them.
4. The Chairman's finale and the Chairman at the picnic table were checked only through the Discovery scene (he is a scripted monster `monster:'chairman'`).
5. Stand-ins to tell Tom: Nara has no dig, lap, bow, growl or bucket frames (sound, hearts and walks stand in); `ch6-clear` still removes the five old blocks of chapters 2 to 5 at the start of AfterBoss (per-area flags are stage 4); Chairman leaves with a short hop and is hidden by `ch6-wrap`.

## Stage 4 plan: scenes 16 to 18 (lemon, hat, call) and the five other areas
- Harvest srcs ch6Lemon, ch6Hat, ch6Call belong here (queued voice lines, wire or remove). Library text of Grace moves here. `ch6-done` is currently set by ch6Crock; if the script puts the chapter end after scene 18, move it.
- Replace `ch6-clear` removal of the five old blocks with per-area done flags and `BB_SPOTS` entries (griffith, stage7, hollow, sundial, schoolyard) as planned in the stage 3 addendum (old drawers in engine/plate.js and amber-spots.js `show()` must also check the new done flags).
- Update claude/story-build.md section 11 Live cell and CHANGES entry; bump tags with a new build name.

## Prompt for the next session
"Read claude/story-build.md, claude/next-addendum-ch6stage4.md and claude/story-ch06.md. Continue the chapter 6 build at stage 4 (scenes 16 to 18)."
