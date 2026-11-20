# voicegen2 (2026-11-18 evening; main 8b886a3): the voice take job ran for every line and its clips are merged

READ THIS FIRST: voicegen2 is DONE. Do NOT run the `voice-gen` workflow again for "voicegen2" (the plan's old "Next: voicegen2" section and ORDER NOW -10 in claude/next.md still say it is next; they are stale).

| Fact | Result |
|---|---|
| Run | GitHub Action `voice-gen`, run 44460607061, `dry_run=false`, `limit=0`. About 12 minutes. |
| Lines tried | 253 (the 5 from voicegen1c were restored from branch `generated`, not remade) |
| Clips made | 251 (6 of those after one regenerate), 0 errors |
| Needs human (silent, no clip made) | 2: `michael|I've got it. Nobody get up.` and `washington|That'll be from her.` (failed the words check twice) |
| Characters sent | 28,620 |
| Credits | 162,843 to 175,506 of 600,000 (tier pro): **12,663 credits this run, about 0.44 per character sent** (voicegen1c's 5-line sample said 0.39; estimate was about 11,000) |
| Merge | All 14 `export-*.json` (256 clips: 251 + 5) merged per "Phone clip exports": dialog-ch1.js +73, dialog-ch2.js +6, dialog-ch6.js +3, dialog-ch8.js +174; 65 kept scripts written, 191 same. Index rebuilt: dialogue lines with no clip 258 to 2. |
| Checks | `unused_voice.py` unchanged (check 4 lists the same 93 older lines as before); `smoke.py` FAILS: []. |
| Pushed | main 8b886a3, build `voicegen2` (CHANGES entry written first, bump_tags run) |

## Not done / what is true now
- New clips are NOT loudness levelled (they sit at a different level from the same voice's older clips). Levelling needs a per-voice playback gain in the game (`dvPlay` does not know the speaker); report numbers are in `tools/voice-learn/results/gains.json`. A separate small build, only if Tom wants it.
- The 2 silent lines above: shorten or reword the script by hand only if Tom asks (a reword goes through `retext-lines.py`); the job will not retry them on its own (they are on `needs-human` in branch `generated`; the `retry_failed` input retries them).
- Nobody has listened to these takes. Whether each has the delivery Tom would pick cannot be learned with the tools tested (claude/voice-learning-plan.md). Record per round: lines he tunes afterwards and how many of Claude's words he keeps.
- Still unrecorded and not in the job: the 32 Washington old-voice lines (washvoice1) and Narrator lines with no clip beyond the job's list (narr1); lines in chapters whose scripts the index did not mark as needing a clip. The index now shows 2 dialogue lines with no clip.
- Voice files grew by about 123 KB of base64 per clip (about 31 MB total): load time and the service worker cache are bigger; mention to Tom only if loading comes up (Load time rule in CLAUDE.md: the on-demand mp3 change is post-build, only when he asks).
