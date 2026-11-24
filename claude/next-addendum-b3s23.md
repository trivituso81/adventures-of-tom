# Stage 23 (the purge): why it is five cards, and what each one does

Written 2026-11-23 by the session that took card c-b3s23. Gate checks passed: chapters 1 to 21 are on `B3_STORY.chapters`, cards c-b3s22ch12 to c-b3s22ch20 are Done, and Tom's answer on t-b3s23-confirm is "Yes, delete battle 2 and its leftovers as the plan lists". Nothing was deleted in that session: the purge as one change would have left the live game broken, so it is split into slices that each leave the game runnable and tested.

## Facts found (measured on main at c5f8831)

| Fact | Number |
|---|---|
| Battle 2 code files | engine/battle2.js 102 KB, battle2-ui.js 65 KB, battle2-kind.js 625 KB, battle2-moves.js 12 KB, battle2-traits.js 14 KB, battle2-effects.js 11 KB, data/battle2-data.js 162 KB (about 1 MB) |
| Lines mentioning B2, b2 or B8 (code, outside demo/ and binaries) | about 3,000 in 266 files |
| Non-battle-2 files in engine/ and data/ that call battle 2 names | 51 (data/ch12 to ch20-battle.js, data/p2-battle.js, data/bonus-nine-scoops.js, data/scenes*.js, engine/feel.js, benchcall.js, story.js, main.js, battle-pictures.js, battle-draw.js, progress.js, the character *-moves.js files, party.js, abilities.js, lines.js and more) |
| Tool files mentioning b2, B2 or battle2 | 216 under tools/ |
| Battle 3 files that really read a battle 2 name | b2Esc, b2Thumb, b2Portrait, b2CanvasPt, b2Meter, b2MeterTag, B2_METER, b2BattleDef, b2Purse, `startBattle` (the one door, b3-story.js), `B2.result`, `B2_TOMBOS` (ids only, b3-tombo-skins.js), and the drawing code in engine/battle-draw.js (`b2DrawEnemies`, `b2RideOrder` and others) |
| Names that look shared but are not | `heart`, `word`, `home`, `stand`, `star`, `path` and similar are common words that matched; they are not battle 2 |
| Baseline | `python3 tools/smoke.py` already fails one check on main before any change: board_sync_test "board4: board_check accepts a Tom card waiting on its fix". It is not from this work; note it, do not fix it here |

The grep rule of the architecture ("`B2`, `b2` and `B8` return nothing outside demo/") also catches base64 inside images and binaries. Run it as `git grep -I` (text files only) and exclude `demo/`, `docs/CHANGES.md`, `docs/PURGED_VOICE.md`, `data/board*.json`, `data/build-archive/` and `data/build-history.js` (history is not code). Say in the final history line exactly which paths were excluded.

## The slices (each is a card; each ends green: `node tools/b3-sim.js check`, `python3 tools/b3_test.py`, `python3 tools/b3_story_test.py`, `python3 tools/smoke.py`, `python3 -I tools/clip-audit/unused_voice.py`)

| Slice | Card | What it does | Leaves the game |
|---|---|---|---|
| 23a | c-b3s23a | Give Battle 3 its own shell. New `engine/bt-shell.js` holds what Battle 3 really borrows (the list above) under neutral `bt` names; every b3-*.js file, battle-draw.js and the story door call the new names; `B2.result` becomes `BT.result`. Nothing is deleted. | Battle 2 still present, Battle 3 no longer reads any battle 2 name |
| 23b | c-b3s23b | Move the tables other systems borrow (`B2_STATS`, `B2_STAT_KEYS`, `B2_SKILLS` readers in data/party.js, progress.js, abilities.js, lines.js, battle sprites and emoji tables, `B2_TOMBOS` ids in b3-tombo-skins.js) to Battle 3 or neutral homes. Old save fields (stamps, ranks, HEART, Tombo flags) are ignored on load, never erased. | Battle 2 still present, only used by the Old path |
| 23c | c-b3s23c | Remove the Old path from the story: every `B3_CH_ON(n)` and switch branch becomes the Battle 3 line alone, the BY CHAPTER switch and the OLD choice in ADMIN go, the old fight data (data/ch12 to ch20-battle.js, p2-battle.js, ch14-battle.js and the rest, bonus-nine-scoops.js Old fights, data/ch20-battle.js, engine/benchcall.js, engine/feel.js old battle parts, ch20-render.js), the old Lab fights and the `b2Lab` screen. Scenes keep recorded lines untouched. | Every chapter and the bonus play on Battle 3 only; battle2*.js still loaded but unused |
| 23d | c-b3s23d | Delete the Battle 2 engine and its leftovers: engine/battle2*.js, data/battle2-data.js, the old per-character move animations (`engine/*-moves.js`, nara.js, boppy and the rest), Stampcards (the shell in engine/progress.js, the old pages), Kindness in battle (Warmth, likes, HEART, praise, calm wins, Kindness Scrapbook flags; the boss ending scenes in engine/boss-finale.js stay as the scene after 0 HP), Director's Cuts, Family Finishes, Tombo rows and their animations, then the script tags in index.html. | No battle 2 code in the game |
| 23e | c-b3s23e | Voice and files: delete unused lines and clips (`unused_voice.py` all 0, `purge_unused.js`, record in docs/PURGED_VOICE.md), then the tests, tools, Art Library prompts, docs and `claude/` notes that only describe battle 2; final greps; look at Chapter Select in portrait and landscape; write the result on this card and on c-b3s23; end the battle system card series with a Tom Milestone card (the whole game on Battle 3, ask play). | Done |

Order is fixed: a, b, c, d, e. A slice that finds its work already done by an earlier one says so and moves on.

## Rules that apply to every slice

- Purge completely (CLAUDE.md): in the same change remove the files, the code that drew or loaded the old thing, stale comments, tags, and notes; grep the old names and confirm zero references in what the slice removed. Git keeps copies.
- Frozen `demo/` is never edited.
- Never edit a recorded voice line; only purge clips nothing plays.
- Never delete files under Tom's saved-data list (`data/welcome-layout.json`, `data/pose-requests.json`, `data/script-edits.json`, `data/script-review.json`, `data/portrait-frame.json`) or `art/raw/`.
- Animation is out of scope (claude/battle-scope.md): the purge deletes old animation code, it does not build or review any.
- Bump tags and add a docs/CHANGES.md heading with the build tag on every push.
- Notes from the chapter 20 build that still hold: new Battle 3 files `engine/b3-last.js` and `engine/b3-repick.js` stay; `tools/battle_guide_test.py` serves a fixture that keeps the Collector planned (rule names a made-up id `zzcollector`): keep it, or retire the planned-monster cases if the guide is touched. SCENES.ch20Fight2 and the Julian A-press fight in data/scenes-ch20.js are Old path (slice 23c); `SCENES.ch20Care` and `B3_CH_ON(20)` become the only version.
- Verify by running the page, not by grep alone: load `index.html` over `python3 tools/serve.py` in headless Chromium, collect console errors and `pageerror`, and fail on any `ReferenceError`. Use `tools/smoke.py` plus the chapter tests (`tools/ch11_b3_test.py` to `ch20_b3_test.py`, the bonus test) in portrait and landscape.

## Tom's decision

Already given: yes, delete as the plan lists (t-b3s23-confirm, 2026-11-22). No new question for Tom until the Milestone card at the end.
