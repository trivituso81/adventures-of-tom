# amyaccent1 (2026-11-12 18:00 to ~19:00, main 800b00d): Amy's accent is in every bracket of her Voice Library scripts. DONE, waiting on Tom's ears

Read with claude/next.md (not edited there so as not to clobber other sessions).

Tom 18:00: "why do some of amy's voices have a long island accent and others don't?" Tom 18:16: he sees no accent annotations on any Amy line in the Voice Library and does not want to spend credits re-recording all of her lines.

## Facts (cause)
- All 294 of Amy's baked clips (51 battle, 243 dialogue) are the current voice `AoT Amy (Kind)` (`HLSHrV3D7Gp6sEFcHNev`). 0 are left from the voice before the 10-27 recast (hashed against 43261fd8~1). Not an old-voice leftover.
- When each current clip was made: recast baker 10-27: 37 (9 battle, 28 dialogue), sent with NO accent words. Emphasis Baker 10-28: 4. By 10-31: 11. After 11-01: 242.
- The accent words were only her voice direction (`heavy Long Island accent`). `finalText` in voices.html added it invisibly at send time, to the FIRST bracket only. 230 of her 289 scripts have two or three brackets. Same failure Boppy and Justin had on 11-01.

## Fix (fact, DONE, pushed, tag amyaccent1, CHANGES "amyaccent1")
- `tools/voice-library/make-index.js`: one `ACCENT` table (Boppy and Justin: thick New York accent; Amy: heavy Long Island accent) plus `ACCENT_HAS`. It writes the accent at the start of every bracket of the index scripts and sets `accent` on the voice entry.
- `voices.html`: `accentAll` wraps `scriptOf`, so the accent is shown and sent in every bracket whatever the script's source (Tom's edit, ElevenLabs history, index). The Boppy-only patch in the history loader is purged.
- No clip, spoken line or game file changed. No credits used. No title stamp change (admin page only).
- Tested in a real browser at 390 x 844 with ElevenLabs blocked: all 289 Amy scripts carry the accent in every bracket, never twice; history and edited scripts too; Grace and Deedee unchanged; Boppy as before. Spoken words identical on all 289. smoke FAILS [], tag_check ok, unused_voice checks 1 to 5 clean.
- Canon note (also in docs/VOICE_LIBRARY.md): Amy joins the Boppy and Justin exception to the no-accent-words rule. Not yet copied into claude/canon-addendum.md; add this one line under Voice when that file is next edited: "2026-11-12 (Tom heard Amy's accent come and go): Amy joins the accent exception, `heavy Long Island accent` at the start of every bracket (`amyaccent1`)."

## Not verified
- Claude cannot hear clips. Which lines sound flat is not known. The 37 recast-baker clips are the most likely (list: hash buckets were computed in the session, not saved; recompute by hashing Amy's clips at 43261fd8 and comparing with main if Tom wants a "likely flat" filter in the Library).
- `tools/voice-library/test.py` times out clicking the disabled Clear button, with and without this change (pre-existing).
- `unused_voice.py` prints a trailing line `11 tnb ['tnb.wardrobe']` on main; not from this change, not looked into.

## Waiting on Tom
- Nothing in bulk. When an Amy line sounds flat, regenerate that one line in the Voice Library (the script box now shows the accent in every bracket) and send the export as usual (next.md "Phone clip exports").
- If regenerated takes STILL lose the accent: stop-loss applies. The likely cause is then the voice itself (`AoT Amy (Kind)` design), and the fix is a recast with a slot plan (30-voice limit), not more script words.
- Deedee and Aunt Ellie also have Long Island voices and an empty voice direction. Only act if Tom reports the same thing for them: add a row to `ACCENT` and `ACCENT_HAS`, rebuild the index.
