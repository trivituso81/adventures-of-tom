# Missing Baker tools (built 2026-10-27, rebuilt against game v332 the same evening)

Finds every spoken line with no baked clip, then builds one baker HTML. Files are stored as claude/missing-*.

Pipeline (work dir /home/claude/bk; /home/claude/build and /home/claude/vdir/data/voice point at a full copy of the live game):
1. Pull the game files (Artifact read, paths) into the build dir, including every data/voice/*.js.
2. node extract.js -> baked.json (clip keys, voices, cast).
3. python3 harvest_all.py -> harvest.json (headless Playwright reads every scene, NPC, recruit, departure, arrival, monster line from the live build).
4. python3 diff.py -> miss.json (dialogue lines whose "voice|text" has no clip) and bmiss.json (data/lines.js LINES entries with no clip of that exact text for that character). No alias fallback.
5. python3 build.py -> out/Missing-Baker.html. Dialogue tab from miss.json; Battle tab from bmiss.json with auto scripts (replaced the old Family Lab tab: 16 of those 18 lines were merged in v332). Declines skipped; deleted voices (bun, fern, kenji, kit, dolores) are tag rebake and read in loaned voices (penny, luna, justin, bean, ellie). Auto scripts: BASE voice tags, Tah Tah spelling, TNB well-well-well speed-up, Boppy thick New York accent.
6. NODE_PATH=$(npm root -g) node t.js (mocked ElevenLabs): all lines made, both exports download.

Template: tpl_head.html + tpl_body.js (storage keys aot-missing-baker-v2, aot-missing-voices-v2, IndexedDB aot-missing; takes from an earlier build carry over by item id).
Exports: dialogue-pending.json (merge with voice-merge-dialog.js) and voices.json (merge with voice-merge.js, KEEP_LIVE_VOICES=1).
Not scanned: strings hard-coded in engine/*.js, templated "{n}" lines (62), unmapped speakers (Nara, objects: silent by design).
v332 run: 149 dialogue lines (139 new, 10 rebake) plus 3 battle lines (tom.tombograce3, tom.run_away, rose.spicy). Sent to Tom 2026-10-27.
