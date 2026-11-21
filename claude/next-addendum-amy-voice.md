# Amy re-recorded dialogue: MERGED 2026-11-06 (CHANGES 413, `amyvoice1`, push 83be040)

- Fact: Tom's export `local-clips-export_4__1.json` (2,045 clips, all voices). Amy: 200 dialogue clips, all already in the game. 43 had new audio (ch5 19, ch25 16, ch28 8); 157 matched byte for byte and were left alone. Nothing added, no battle clips, `voice-clips.js` and the voice index unchanged. Tests: unused_voice 0, tag_check ok, smoke FAILS [].
- The other 1,845 clips in that export (Tom, Deedee, TNB, Rose, Grace, Boppy, monsters, etc.) were NOT merged. If Tom says "merge the rest", filter by voice and compare by clip first (many are probably already in).
- Open for Tom: five Amy takes were recorded from a script that differs in words from the on-screen line. The game plays by on-screen text, so the audio says the script words:
  - ch5 text from Justin: on screen "Save me a cookie", audio "Save me some casserole".
  - ch5 "Did we save a cookie for Dad?": audio "Did we save some casserole for Daddy?".
  - ch5 "The sign-up sheet is in there": audio adds "must be".
  - ch5 "You were the good uncle tonight": audio "a good uncle".
  - Punctuation-only differences (Tom!!!!, Up! Everybody!, curly quotes) are harmless.
  Fix is Tom's call: change the on-screen line to match the audio (then the clip key changes, so re-key the clip) or re-take the audio. Do nothing until he says.
- Process note: merge-local.js re-serialises every touched file; compare each clip against HEAD and copy only files with changed clips (here dialog-ch5, ch25, ch28). `bump_tags.py <TAG> --base origin/main` was needed because `dialog-ch28.js` is loaded with a `?v=` tag.
