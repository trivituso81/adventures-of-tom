# Justin: ability kit and animation sheets (approved 2026-10-31)

Tom will drop a zip of Justin's painted animation sheets into a conversation, often with no words. That means "install Justin as a party member with this kit". This doc is the whole spec. Justin has overworld walk art already (`art/raw/characters/justin-walk-sheet-v1.png`, baked by `tools/sprite-bake/bake_justin.py`); he has no battle art, moves, lines or party entry yet.

## Canon (decided 2026-10-31)

- Justin is Amy's husband and the girls' dad: electrician, watches sports and yells at the screen, is refinishing the basement, dresses in designer clothes, extremely sensitive feet. 6'5", the tallest person in the game.
- Recruiting: he is usually at work. He is found at home (GREGORI) on the couch watching the game, and joins as a fourth option for the fourth slot alongside Amy, Deedee and Boppy, with the same yes/no and swap-out prompts. Chapter availability follows `CHAPTERS` in `engine/story.js`; add him to the same lists as Amy.
- Interface and messages say Justin. Nobody calls him Dad in menus.

## Kit and speech (lines cut to the animation beats 2026-10-31; emotive scripts in tools/voice-library/battle-overrides.json, every one tagged thick New York accent)

| Slot | Key | Move | MP | Beats in order and what he says (exact ms live in engine/justin-moves.js) |
|---|---|---|---|---|
| Basic | loose_wire | Loose Wire | 0 | spots it "Who left THIS here?" / holds out the copper "Loose wire. Not my problem any more." / after it bites him "Ow. Okay. A little bit my problem." |
| Start | wire_nuts | Wire Nuts | 3 | digging "Wire nuts! Never have enough of these." / "Yellow!" / "Red!" / overhand "And BLUE!" / nod "Color coded." |
| Start | bad_call | Bad Call | 4 | on the couch "He was IN." / up and pointing "ARE YOU KIDDING ME WITH THAT CALL?" / "WHO IS PAYING YOU?!" / sits "Unbelievable." |
| Start | fresh_fit | Fresh Fit (strides in everyday clothes, snaps, swaps into an emerald green suit with a flash, poses, shades off for the dazzle hit, wink strut) | 5 | "Clear the runway." / "Collar. Cuff. Shades." / pose "This shirt cost more than your pond." / strut "You're welcome." |
| Lv 2 | demo_day | Demo Day | 6 | "Demo day! Wall's coming down!" / looks up "Nobody liked this wall." / "ONE!" / "TWO!" / wipe "Open floor plan." |
| Lv 3 | breaker_flip | Breaker Flip | 7 | "Which one of you is it." / "There you are." / "Breaker's off." / whispered "Three. Two. One." / "Breaker's... on." / salute "Licensed and insured." |
| Lv 4 | giant_sneeze | Giant Sneeze | 8 | twitch "Hang on. Hang on." / build "Ah... ah... ah..." / "AH CHOOOOO!" / "Excuse me." |
| Lv 5 | foot_tap | Foot Tap | 10 | "Nobody touch anything." / "Rosie. No." / Rose (Grace if Rose is down) "Tap." / spread-arms scream frame, held 1.1 s, the hit lands on it "OUCH!!!!!!" / "MY FOOT! WHO TOUCHED MY FOOT?!" / hopping "IT WAS SO LIGHT!" / "I'm fine. I'm FINE." |
| Special | drywall | DRYWALL | 0 | "Everybody behind me." / stands it "Drywall's up." / drill "Four screws." / knocks "Solid." / thumbs up "Let it dry." Party damage halved until each friend's next turn. |

Other lines: join "Halftime. I have a minute. Let's go.", greet "Hold this. No, the other end.", hurt "Not the jacket!", low "Somebody turn the game back on.", ko "Tell the basement I loved it.", win "And THAT is how you close out a game."

Extra beat keys live in `data/lines.js` under `LINES.justin` (`<move>_<beat>`), plus `LINES.rose.foot_tap_tap` and `LINES.grace.foot_tap_tap`. Timing lives in `engine/justin-moves.js`. All of them are unbaked. They are in the Voice Library (`data/voice-index.json`, `node tools/voice-library/make-index.js`), both using his dialogue voice (AoT Justin, Long Island) with the direction thick New York accent until a battle voice is baked. No em dashes in any of it.

## The ability frames (installed 2026-11-06, `justinab1`)

His nine moves play the painted Art Library sheets `art/raw/characters/justin-ab-<move>-v1.png` (the old zip of ten 4 x 4 sheets is retired and purged). `tools/sprite-bake/ability_frames_justin.py` cuts them (each frame is the ink piece in its cell; the breaker sheet is cut by rows because its panels reach across the grid) and sizes each sheet to his battle 'ready' pose; `tools/sprite-bake/bake_justin_ab.py` writes `art/chars/justin-ab.webp` and `data/justin-ab.js`. Frames are sprite keys `ab_<short>_<n>` (n counts cells row by row from 1) plus an `R` copy facing right. Core stances still come from `data/justin-battle-hires.js` (his two battle sheets).

| Move | Short | Grid | Frames used (n) |
|---|---|---|---|
| Loose Wire | wire | 3 x 2 | 1 to 6 (wire painted in his hands) |
| Wire Nuts | nuts | 3 x 2 | 1 to 6 (nuts in hand painted; thrown nuts are props) |
| Bad Call | call | 3 x 2 | 1 to 3 on the painted couch, 4 point, 5 arms out, 6 huff; the wide TV is a prop |
| Fresh Fit | fit | 4 x 2 | 1 to 8, all in the blue suit (the everyday-clothes half is his stock idle and run) |
| Demo Day | demo | 3 x 2 | 1 to 6 (sledgehammer and wall rubble painted) |
| Breaker Flip | breaker | 3 x 3 | 1, 2, 5, 6, 7, 8, 9 (panel painted in 1, 2, 6, 8) |
| Giant Sneeze | sneeze | 3 x 2 | 1 to 6 |
| Foot Tap | foot | 3 x 3 | 1 to 7 |
| DRYWALL | dry | 3 x 2 | 1 to 6 (sheet and drill painted; the sheet left standing in front of the party is a prop) |

Props come from the approved `justin-fx-*` sheets (`tools/sprite-bake/bake_justin_fx.py`): wire nuts (orange, yellow, blue), standing drywall sheet, brick chunk, rubble, dust puff. The six move sheets (Loose Wire, Bad Call, Fresh Fit, Breaker Flip, Giant Sneeze, Foot Tap) are cut and wired as `lw_`, `bc_`, `ff_`, `bf_`, `gs_`, `ft_` pictures (jzfx1, `jz_art` in engine/justin-moves.js); each drawn effect stays as the fallback. Do not add PROPART copies of anything painted into the frames (wire, nuts in hand, sunglasses, sledgehammer, panel, drill, couch).

## Install steps (follow the Boppy pattern; he is the closest kit)

1. DONE (ability sheets now come from the Art Library, see The ability frames above).
2. DONE: `bake_justin_battle.py` (core stances and KO) and `bake_justin_ab.py` (ability frames).
3. Party data: add `justin` to `data/party.js` (stats on Amy's curve, slightly more HP, slightly less speed), `data/abilities.js` (the kit table above, standard cost ladder), `data/progress.js` level unlocks at 2, 3, 4, 5, and `data/lines.js` (move keys plus hurt, low, ko, win, special). Portrait: `portraits/justin.png` cut from ju_idleA like the others.
4. Moves: new file `engine/justin-moves.js`, loaded right after `engine/boppy-moves.js` in `index.html`. Build every move from the queue primitives in `docs/BATTLE_SYSTEM.md` (`ST.keys` and `ST.play` for frame runs, `battle.fx` for the spark, dazzle flash, lightning, wall chunks and the dark screen, `battle.props` for thrown wire nuts). Giant Sneeze: knockback slide on the enemy sprite plus `enemyStunned = 1` and a new `sfx.sneeze` in `engine/audio.js` (long, loud, pitched down). Foot Tap: move Rose's sprite to his foot with her walk frames, one tiny toe tap, then his frames; fall back to Grace when Rose is KO. DRYWALL: a `battle.guard` style flag halving party damage for one enemy round, the drywall drawn in front of the formation from dw_set's prop rect.
5. Recruiting: ALREADY DONE (2026-10-31, `justin1`, see docs/CHANGES.md). Justin is a recruitable fourth-slot member: `justin` in `data/party.js`, `RECRUIT_TALK.justin` in `engine/followers.js`, the `dad:true` flag on his NPC in the Gregori house (`data/maps-le.js`) read in `engine/overworld.js`, and `canBeHere`/`justinStays` in `engine/story.js` (any chapter on Long Island except chapter 5 and 10 before their scenes and the Nine Scoops bonus; chapters 13, 14, 16 have no free seat). Test it with `python3 tools/recruit_justin_test.py`. He is a PLACEHOLDER until the kit exists: `noBattle:true` on `justin` keeps him out of fights (`startBattle` in `engine/battle2.js`), out of battle XP (`b7InstantWin` in `engine/feel.js`), and gives him no Stamp Points or stat pages (`b6SpLeft`, `b6Stampable`, `renderStatusTab`, `renderStampsTab` in `engine/progress.js` each have a `noBattle` branch); he is not in `ALL_MEMBERS` (`data/party.js`), so no shared XP, no saved level or Stampcard. When the kit lands: (a) give `justin` real stats on Amy's curve and the B2/B6 tables, add him to `ALL_MEMBERS`, `B6_STARTER`, `PORTRAITS` (`engine/menu.js`) and the `drawPortrait` source map; (b) delete the four `noBattle` branches above and the `noBattle` flag; (c) save and load already handle him as a party member (`allMembers` in `loadGame`), but members are saved by `ALL_MEMBERS`, so check old saves still load; (d) the four `justin-recruit-*` lines still need a voice bake (Voice Library); (e) re-run `tools/recruit_justin_test.py` and update its "sits fights out" check. Placement is open: Tom's note says Justin on the couch with the game on in GREGORI; today he stands in the hallway at (8,4), moving him is a one-line change to his NPC `x,y` in `data/maps-le.js` (check the plate mask first).
6. Test: `python3 tools/kit_test.py justin --speed2` (every move, look at every contact sheet in `tools/shots/`), `IDS=justin python3 tools/smoke.py`, then a real fight with him in slot 4, portrait and landscape. Check: he is taller than everyone, Foot Tap's tapper walks and returns, the sneeze knockback and skipped enemy turn, the drywall halves damage for exactly one round.
7. Commit (`feat(justin): party member, kit and painted sheets`), push to main, tell Tom in a few lines what landed, which sheets had problems, and that the spoken lines need a voice bake (new character, no clips yet: speech synthesis fallback plays until then).


Note (2026-11-01): the sub-lines in the table above that the animations never say (Yellow!/Red!/And BLUE!, WHO IS PAYING YOU?!, Unbelievable., Collar. Cuff. Shades., You're welcome., Nobody liked this wall., ONE!, TWO!, Which one of you is it., There you are., Three. Two. One., Licensed and insured., Hang on. Hang on., Excuse me., Rosie. No., OUCH!!!!!!, IT WAS SO LIGHT!, I'm fine. I'm FINE., Four screws., Solid., Let it dry., Ow. Okay. A little bit my problem.) were purged from `data/lines.js` and the voice files. See `docs/PURGED_VOICE.md`. If a future animation says one, add it back in the same change.
