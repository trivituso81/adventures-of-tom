# backlog1 (2026-11-14, main 92ffc4f): Tom's first Fix the backlog, 19 chapter 1 reports from build ch5build1 (iPad landscape)

Full record with Tom's quotes and report ids: docs/CHANGES.md `backlog1`. Run `python3 tools/reports.py list` for what is still open.

## Closed (fixed and pushed)
- 62ho beaten boss never returns (bossSettle in engine/boss-finale.js, monstersReturn in engine/world.js); 8n6x Big One moved out of the water ([18,8], camera [16,9]); sybk and rysi Deedee beside Tom, monsters in the way walk off (stageRoute), monsters face the party; 9dh8 Mudling right and facing left; si36 every crumb tile answers A (AMBER_SPOTS ch1-crumbs-a/b/c); 06hx WIN NOW option (Options card, #b7-skip, tools/winnow_test.py); dd0j and u7mr two lines reworded (need re-record, old clips purged).

## Still open, what each needs
- wlbn Boppy staging: code is pushed (back of the house [12,4] facing right, walks to [10,8]) but the test frames did not reach his line, so it was NOT looked at. Check with a reaction_test case on ch1Theft that reaches Boppy's page (ch1Theft, map grands, party tom grace rose, start [8,12,"up"]). Then close it.
- kuq6 Oolong accent: ACCENT in tools/voice-library/make-index.js now has oolong 'warm Chinese accent'. Tom must regenerate her lines in the Voice Library and export. Then close.
- 9h7v Moss does not sound like a child and is slow: Tom re-records Moss (Voice Library).
- Art Library art needed: 7v5z Deedee glasses-on-head frame (dialog and screen), mxvd Mudling frames in game style, 1a2w Boppy pose with mustache, nre4 one combined picture for grass, bulb and marble in ch1Spot; plus Dot happy front-facing pose (needs a turned painting) and Tom's marble group.
- c5no thinking and examining poses across the game: not started. Needs a scan of scenes for those moments, tags, then Art Library entries.
- r0ib talking poses should also drive the dialog portrait crop: not started (possibly sizable; the standing rule says dialogue faces use emotion or walking sheets, so talking sheets would need their own cropped faces, bake_talk_faces.py).
- Also still open from the list (not reviewed in this session): kviv Tom faster and funnier tags, a0r8 Dot line, and any later reports.
- unused_voice.py check 4 lists 51 clips that were already on origin/main before backlog1 (not mine).
