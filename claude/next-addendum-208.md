# next-addendum-208 (2026-11-05, updated after cabin install): flight work, read after claude/next.md

## DONE: the whole flight sequence (all pushed to main)
- Plane flies nose first everywhere (208 `flight5`, 211 `flight6`, 212 `flight7`): approved plane sheet paints the nose RIGHT; preview `mirrorX` bakes NOSE-LEFT; `fsPlane` uses `scale(-facing*s,s)`. Map plane uses the level sprite only (banking sprites are diagonal, unused).
- One-scene fix (217 `flight9`): LA skyline keyed with `floodGradient` and cut at `groundCutRow`; `FLIGHT_FOREGROUND=false` (foreground strips off).
- Plane sits higher on the road (wheel line 25 percent down the runway band).
- LE: new side-on skyline (v5) keyed like LA; ground-le top 14 percent cropped (`cropTop:.14`, the painted hangar row doubled the town), LE runway set by hand `[.279,.49]` in `prepare()`. Tom 15:16: "looks great".
- Cabin (233 `flight14`): Tom approved `cabin-v2` (premium Delta One suite), baked and installed; looked at in portrait and landscape. Not yet confirmed by Tom on the phone.
- 232: Art Library approve (art.html) now retries GitHub 5xx and shrinks pictures over 3.5 MB to 2048 px; Tom hit a GitHub 500 on the cabin save (cause not proven, a retry worked). `tools/art-library/test.py` already fails (waits for the removed `test-mudling` entry); fix or retire it if the Library is touched again.
- flight-preview.html loads engine/flight-art.js with its OWN hard-coded tag; tag_check.py and bump_tags.py do NOT cover it. Bump by hand every flight change (now `flight14`).
- Bake recipe: `python3 tools/serve.py` running, `python3 tools/sprite-bake/bake_flight_lib.py <ver>`, `python3 tools/art-library/bump_tags.py <TAG>`, preview tag by hand, `python3 tools/flight_test.py both`, look at tools/shots/flight-*.png, smoke `IDS=tom`, CHANGES, push.
- Lessons: flight_test only checks that phases play, so check nose vs travel direction on side view AND map, zoomed in. When Tom says two things clash, look at the whole layer stack in his screenshot, not only the layer last changed.

## Open questions for Tom
- Does the new cabin look right on the phone (and read well under the dialogue box)?
- CHANGES top is 233; next is 234. Rebases often conflict on CHANGES (and main.js, index.html tag lines): take upstream for the last two, keep all my entries once (watch for duplicates after a stash pop), renumber max+1, rerun bump_tags.
