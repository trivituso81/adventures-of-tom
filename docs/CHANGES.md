## skipchain1 (2026-11-19): SKIP in chapter 1's opening now skips all of scene 1 (the opening and Grace's list)

- Tom (11-19 17:59): "the game is still incorrectly seeing scne 1 as two separate scenes - it should be one secne. when i hit skip it should skip until the whole thing is done".
- Cause: scene 1 is two scripts, the opening (title card to the squishy) and `SCENES.ch1Goal` (Grace's list, the walk, the party banners). SKIP ran the opening to its end, reset itself, and ch1Goal then started as a new scene with SKIP off.
- Fix: `beginOpening` (engine/story.js) marks the opening with `intro.chain='ch1Goal'`. When a skip finishes a scene with a chain, `engine/skip.js` remembers it (`cut.carry`, valid for 5 s) and its `playScene` wrapper starts that scene already skipped. Any other scene clears the carry, so a later scene is never skipped by accident. Skip still stops at a choice or a fight.
- Test: `python3 -I tools/skip_chain_test.py` starts a new game, presses SKIP in the opening, and passes when ch1Goal starts skipped and both scenes finish with no dialogue left open. It FAILS on the old skip.js ('ch1Goal ran with skip off') and prints FAILS: [] on the new one.

