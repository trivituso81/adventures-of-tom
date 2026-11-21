# voiceboard1 (2026-11-21): Generate all N voices from the board

| Fact | Detail |
|---|---|
| Card fields | A Tom card with `ask: voice` and `voices` (list of `voice|exact text`) or `voice_chapter` (a number) shows Generate all N voices (about X credits, 0.44 per character) in `board.html` (`voicesHtml`, `vgenTap`, `loadVidx`). Two taps. The second saves `vgen` on the card with the commit `board: vgen <card id>`. |
| Job | `.github/workflows/voice-gen.yml` runs on that push (or by hand with input `card`; dry_run true by default; input `chapter` limits the plain job; `max_chars` caps characters per run, 12000 for a card). It runs `tools/voice-learn/voiceboard.py`: makes the takes with `voicegen.py --lines-file`, keeps them on branch `generated`, merges them with `merge-local.js`, runs `rebuild.py` and `unused_voice.py`, writes the CHANGES entry, runs `bump_tags.py voices-<card>-<run number>` and pushes to main (redone on the newest main up to 4 times). |
| Card result | `vgen.run` = state, made, failed, needs_human (not merged), credits, chars, build, note; the card's `next` becomes: listen in ADMIN > VOICE LIBRARY, All good or Something is wrong. |
| First card | `t-ch2voices` (voice_chapter 2; 90 lines with no clip on 2026-11-21, about 3,400 credits), waiting on `t-ch2play`. |
| Not true yet | The paid run has never happened: the first one is Tom's tap. The retry against a moved main is not covered by the test. A push made with GITHUB_TOKEN does not start `voice-index`, so the job rebuilds the list itself. |
| Test | `python3 tools/voiceboard_test.py` (page in portrait and landscape, job against the stand-in ElevenLabs and a copy of the repo). |
