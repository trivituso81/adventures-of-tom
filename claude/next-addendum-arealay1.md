# next addendum, 2026-11-11 15:45 local, updated ~17:45: Art Library stencil (cutout layer) entries for Los Angeles areas and the airport maps (CHANGES arealay1 main 83040fb, aircut1 main 76f2190). Read with claude/next.md; folds into it at the next rewrite.

## Airport maps: DONE in airport1 (main 9fb15ab)
- Tom (15:24) asked for cutout prompts for the airport maps (16 Library entries in Rooms > Airport: `room-terminal-cut1..4`, `room-gatezero-cut1..3`, `room-flightzero-cut1..3`, `room-gate00-cut1..3`, `room-concourse-cut1..3`), approved them with five new paintings, and at 15:52 said to install. Installed: details, stencil verdicts and tools are in claude/next-addendum-airport1.md.
- If Tom regenerates and approves a new airport painting, rerun `tools/make_airport_plates.py` and `tools/make_airport_fg.py` for that map and redo its walk map.

## Still open from this thread
- Known risk (fact, from the Square CHANGES 177 and now the airport): the generator often returns a rearranged sheet or a redrawn picture instead of a tracing in place. Check every stencil by drawing its outline over the painting before using it; when it does not line up, cut that piece from the painting with a hand box or outline (tools/make_airport_fg.py is the model).
- Open question Tom has not answered (asked 15:18): move the 33 big story maps (Airport, School, Library and Moon Club, Sub-Rail, Glass Tower, Dead-Letter, Old Oak, Studio and Car Barn groups) from the Rooms tab to Areas? Do nothing until he says. He calls these maps "areas"; the other 28 of them have no stencil entries yet, add them on his word using `ROOM_STENCILS` in tools/art-library/room-prompts.js.

## arealay1 (earlier, 15:05)
- Tom: "check for any missing Areas in the art library and add them." Check (fact): all 74 game maps have a Library painting entry (13 in Areas, 61 in Rooms). Missing and added: 22 draft stencils for the six Los Angeles areas (`area-blvd-cut1..4`, `area-jpark-cut1..4`, `area-griffith-cut1..3`, `area-studio-cut1..4`, `area-backlot-cut1..4`, `area-oakpark-cut1..3`). Closes AL-LA in claude/build-plan.md (its status line still says queued).
- Decisions (Claude): Downtown LA got stencils too. Each LA area is its own group; 'Los Angeles paintings' and `LA_PLATES` are gone.
- OPEN: Studio Gate, The Backlot and Old Oak Park have approved paintings (`art/raw/areas/area-<id>-v1.png`) that are NOT installed, so their stencils would cut from the old picture. Install first (docs/AREA_PAINTINGS.md; claude/la-areas-qc-2026-11-05.md: retouch the Studio clapperboard writing and the Backlot MASET GALIK sign), then generate stencils. Downtown, Jefferson Park and Griffith Park already have layers in the game.
- Noted, not changed: the Jefferson Park painting entry title says 1920 x 1536 but the installed map is 30 x 22 tiles (1920 x 1408).

## Tools and tests
- `node tools/art-library/validate.js` OK; `python3 -I tools/art-library/in_game.py --check` ok (68). in_game.py never flags an id ending `-cutN`. Do NOT run make-prompts.js on the real json: patch data/art-prompts.json by hand and mirror in the module (`LA_STENCILS` in area-prompts.js, `ROOM_STENCILS` in room-prompts.js).
- The local server (`python3 tools/serve.py`) dies between Bash calls here; start it with nohup in the same call as the test.
