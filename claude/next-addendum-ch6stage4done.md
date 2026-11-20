# Chapter 6 build, stage 4 done (2026-11-14, chapter 6 build conversation, pushed as ch6s4, main f572c76)

Newer than claude/next-addendum-ch6stage4.md. The tracker (claude/story-build.md) Live cell and section 11 were NOT rewritten: treat this file as newer.

## Done
- Scenes 16 to 18: ch6Lemon (griffith), ch6Hat (stage7), ch6Call (video call from Tom's porch on jpark, three Long Island scenes: hollow, sundial, schoolyard; engine/video-call.js). Chapter end is after scene 18 (flag ch6-done).
- The `ch6-clear` removal of the old blocks is gone. BB_SPOTS in engine/block-break.js for griffith, stage7, hollow, sundial, schoolyard; done flags bb-<id>. Old props draw over the grey circle during a break (`bbUnderDraw` in engine/plate.js).
- Baked: tools/art-library/bake_story_ch6b.py (colour tree, hat stand, fish splash, sneaker). Code-drawn stand-ins: lemon, dragonfly, kickball, megaphone. Nara has no catch or sour-face frames (a hop stands in).
- 68 dead dialogue clips purged (tools/clip-audit/purge-ch6s4.json). unused_voice.py checks 1 to 5 all 0 now. `OD_JSON=<path>` dumps check 4 keys in full.
- Test: `python3 tools/ch6return_test.py /tmp/ret [lemon|hat|call]` (portrait and landscape, frames and contact sheets). Block-break test and smoke pass.

## Not done
- Talk and emotion rows for new lines (`talk-index.py --add`, hand-fix `talk`, `talk-apply.py`, emotion tsvs).
- Landscape/frames of ch6Park picnic section and ch6Kitchen; Chairman finale at the picnic table.
- Positions guessed and only seen in headless frames: megaphone path in ch6Hat, family placement in the call, Rose's two-handed coin pose.
- Tom has not played it on the phone.

## Next
Wait for Tom's phone report on chapter 6. Then the leftovers above. Chapter 7 has its own conversation.
