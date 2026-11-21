# Voice recast (2026-10-26)

## Status (26 Oct, 02:15): Ellie and Justin NEED A RE-BAKE (Long Island Fix sent to Tom)
- Tom heard no Long Island accent on Aunt Ellie. Cause: recast-build.js took the Justin/Ellie Voice Design briefs from data/dialog-cast.js
  BEFORE the desc edits, so ElevenLabs designed Ellie (5nPpmcfu7pDFPztXuQIJ) from "refined mid-Atlantic accent" and Justin
  (Pp9gl3BrnVq62dIWU2sx) from "slight country twang". The merge itself was fine: those clips are live in ch1, ch5 (Mr. Halverson), ch9, ch10.
- Fix sent: claude/li-fix.html (built by claude/li-fix-build.js from recast-template.html; test claude/lifixtest.py, mocked, passes).
  Two voices, 45 lines (Ellie 25, Justin 20), ~8,000 chars. Stronger briefs (thick old Long Island accent, dropped Rs, aw vowels) and
  every script bracket carries "Long Island accent" (Boppy's pattern). Own storage (aot-li-fix-v1, IndexedDB aot-li-fix). On saving a
  design it DELETES the wrong voice it replaces (and any voice it made earlier for that character), so no new slot is needed.
- Deedee and Amy are library/saved voices named "(Long Island)" (designed:false): not affected. Dolores keeps old Ellie rnhEc2YmD7cQEaA4v9MM.
- When recast.json arrives: node merge-one.js recast.json <live data> out1 ellie, then copy out1 over the live copies and run
  node merge-one.js recast.json <that data> out2 justin (ch1 and ch10 hold both voices, so CHAIN). Dry run on the mock export worked:
  ellie -> ch1, ch9, ch10; justin -> ch1, ch5, ch10. Then update data/dialog-cast.js justin/ellie desc to the li-fix briefs.
  Verify voicecheck.py + smoke.py; publish ch1, ch5, ch9, ch10 (+ dialog-cast.js) under 64 MB per call (split).

## Earlier
- v267/v268: Deedee (3atomJkX2UWSHPSg86Z0), Justin, Aunt Ellie merged; Dolores step done. Amy live v264 (R3ZxkaLekDWMqVjuSScJ), Grace v261
  (Ivy i4CzbCVWoqvD0P1QJCUL). Rose keeps Lulu Lolipop (ocZQ262SsZb9RIxcQBOj).
- ElevenLabs slots: account sits at 30/30. Library voices count as custom voices; each Voice Design save takes one. voice-slots.html frees slots.
- LESSON: any baker that designs a voice must read the brief from the edited source. Edit dialog-cast.js descs BEFORE building a baker.
