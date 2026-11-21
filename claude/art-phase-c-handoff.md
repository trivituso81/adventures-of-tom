# Art Library, Phase C handoff (2026-11-03, written by the session that loaded the party entries; read this BEFORE claude/next.md's Art sections, which are stale)

CORRECTIONS to claude/next.md (last rewritten 11-02): the Music Library is BUILT and Tom says it works (music.html, tools/music-library/); Phase C step 1 (height chart, docs/reference/height_chart_v1.png) is DONE (CHANGES (95)); Grace's hero, walk and battle entries exist (CHANGES (97) to (105)); iPad mode `tab1` is live (CHANGES (106)); the repo head after this session is 9f8eba1 (CHANGES (107)), stamp `build tab1`.

STATE
- data/art-prompts.json has 34 entries: test-mudling (Enemies) plus 33 in Characters: Grace (hero, hero-scene, hero-cut, walk, battle) and, for tom, tnb, rose, amy, justin, deedee, boppy: `<id>-hero-scene`, `<id>-hero-cut`, `<id>-walk`, `<id>-battle`. Built by `node tools/art-library/make-prompts.js` from tools/art-library/party-prompts.js (one CAST row per person) and the Grace prompt files in tools/art-library/prompts/.
- Nothing past Grace's hero has been generated. Method per character: scene (painted inside the school yard) -> cut (magenta) -> walk and battle (both use the approved cut as master). Chained refs point at art/raw/characters/<id>-hero-scene-v1.png and -hero-cut-v1.png (where APPROVE commits). Bake wiring (`bake` field) is NOT set on any party entry: an approval only stores art; replacing live art is a separate step per character (CHARACTER_PIPELINE section 6, bake_<id>.py, bump ART_V).
- Why the scene method: Grace's direct hero prompt on xAI came out smooth three times (CHANGES (98), (99)); the painted look came from painting her inside the school yard. Whether xAI keeps it on a scene prompt is UNTESTED (Grace's scene was made in Tom's other image AI).

NOT DONE, needs Tom or a decision
- No real height on record, so no entries: Olivia, Michael, Lachlan, Isla, Jojo (only "5'6" in notes), Aunt Ellie. Nara is a dog (own prompt, no height chart entry). Ask in ONE line.
- NPC (batch sheets of 4 to 6), monster, area, room and prop entries: tabs are empty. Monsters: 60+ foe sources exist in tools/sprite-bake/src/foe-*-v1.png (old look); use docs/ENEMY_SHEETS.md for frames and the style key for look. Areas still unpainted/uninstalled: Hollow, Pier, Marsh, Sundial, school yard (claude/li-areas/).
- deedee-hero.png is RGBA (transparent); if xAI rejects it, flatten on magenta. Justin's likeness ref is justin-idle-v1.png (battle stance).
- Rose head share .27 and Mudling 16 in are chart assumptions (CHANGES (95)).

NEXT (one task): Tom runs GENERATE in ADMIN > ART LIBRARY, Characters tab, in this order, one character at a time: `<id>-hero-scene` -> approve -> `<id>-hero-cut` -> approve -> walk -> battle. Stop-loss: two misses for the same reason on any entry = stop, say what is wrong, change method (not wording). After each approved cut, compare head share to the key (adults about .21, kids .25) before the sheets. Then bake per CHARACTER_PIPELINE section 6.
Tests: `python3 tools/art-library/test.py`, `python3 tools/art-library/bake_test.py`, `python3 tools/tag_check.py`, `python3 tools/smoke.py` for any game change.
