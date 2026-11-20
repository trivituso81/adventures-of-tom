# The Adventures of Tom: new battle system, build tracker

Started 2026-11-18. The plan is `claude/battle-architecture.md` (sections 2 and 5 are the design and the 23 stages). This file says where the build stands. Where it and the architecture's "Status" line disagree, this file wins: code exists and is pushed.

| Question | Answer |
|---|---|
| Code name | "Battle 3" (the player never sees it). Files `data/b3-*.js`, `engine/b3-*.js`. |
| Where Tom plays it | ADMIN > BATTLE LAB > pick a difficulty > NEW BATTLE. Story fights still use the old battle. |
| Where Vibes are set | Pause menu > VIBES (the save's), and NEW BATTLE > VIBES AND RANKS (the Lab's, kept on the phone, with a Rank picker). One screen. |
| Repo docs | `docs/BATTLE3.md` (files, how to change things, tests, what waits). Handoff notes per stage: `docs/handoff/<tag>.md`. |
| Rules it implements | `claude/battle-spec-v11.md`, `claude/bestiary-v11.md`, `claude/battle-v11-decisions.md`. |
| Kit lines as data or code | `claude/battle-kit-ops.md` (all 210 lines sorted, 2026-11-18). Read it before any kit stage (9, 10, 19 to 21). |
| Read before a stage | This file, the architecture's row for that stage (section 5), `docs/BATTLE3.md`, the newest `docs/handoff/b3s*.md`, and only the spec and bestiary sections the stage builds. |

## When Tom tests (standing rule, Tom 2026-11-18 13:44)

Tom: testing after every stage is "very time consuming". He does NOT test after each stage. He tests at the four milestones below and nowhere else. This replaces the architecture's "Tom's check" after every stage (its section 4.3).

| Milestone | After stage | What exists then | What only Tom can judge | His time |
|---|---|---|---|---|
| A | 8 | The whole system with four characters: Vibes menu, Traits, Quirks, Capstones, Family Ruckus, tap to preview, Rose Mode, the first video attack, the chapter 1 boss | Is it fun, can he read the screen and the turn bar, is the pace right, do the moves feel like the family | About 30 minutes |
| B | 15 | All ten characters, every Part 1 monster, the balance pass, and chapter 1's story fights on the new battle | Does chapter 1 play right from Chapter Select; do fights run too long or too short | About 30 minutes |
| C | 16 | The 22 old Tombos in a Move Lab | Keep, Tweak or Replace for each (his answers are the work) | About 20 minutes |
| D | Before 23 | Everything, with all story fights switched | One play-through, then yes or no on the delete list | His own pace |

Rules for every stage's session:

- Between milestones the closing reply says "Nothing needed from you" and gives the next prompt. It does not list phone steps, does not ask him to play, and does not ask about the turn bar.
- What replaces his check between milestones: the rule tests, the simulator, and the screen test with frames looked at in portrait and landscape. A stage that cannot pass those does not push.
- If Tom plays anyway and sends notes, they are handled first, as always.
- A stage that hits something only he can decide and that is expensive to redo asks one short question at once. It does not wait for a milestone.
- Why not wait until the end: stages 9 to 13 build the other six characters (48 more moves) and the rest of Part 1's monsters (57 more) on top of how stage 8 feels. A note like his first one (attacks 2x too fast) is one number at milestone A and a rework across all of that later.

## Stage board

| # | Stage | State | Build | What Tom can do |
|---|---|---|---|---|
| 1 | Core loop | Pushed 2026-11-18 | `b3s1`, main b6798f4 | NEW 1: TWO MUDLINGS and NEW 2: MUDLING AND SKEETER. Windex Spritz then a Clobber hit sets off Hydro-Slip! and the monster's face slides back on the turn bar. |
| 1b | Pace fix after Tom's first play: default move animations take twice as long (`B3_TEMPO` = 2 in `engine/b3-play.js`) | Pushed 2026-11-18 | `b3tempo1`, main 3e190f3 | Same two fights, attacks at half the speed |
| 2 | Statuses, caps, shields, healing, KO and Pick-Me-Up, party rows, aggro, the hook bus, wards, counters, intercepts, hazards, interrupts; Skill 1 and Skill 2 of the four first Sig Vibes | Pushed 2026-11-18 | `b3s2`, main eeec494 | Four fights (NEW 3: POND GRUMP AND MUDLING and NEW 4: BOG TOAD AND SKEETER are new). Two Skills each under SKILLS, Pick-Me-Up when someone is down, tap anyone to see what is on them. |
| 3 | Composure pips, Break and Flustered, Marks, wind-ups that are also acts, the full act runner (conditions, waits, target kinds, counter acts, adds), Guard Stance and Mend on enemies, boss HP by party size | Pushed 2026-11-18 | `b3s3`, main 074bd0b | Six fights (NEW 5: LOG LUMP and NEW 6: THE BIG ONE are new). Gold pips under the Elite and the boss; BREAK! when they run out; MARKED on whoever The Big One glares at; Tom's Suite Door Slide takes the bite, Grace's Crunchy Sugar-Cube Pop or a Break cancels it. |
| 4 | Vibes: Ranks, Vibe Points, overflow, Main and Pocket Vibe, two Quirk slots, Stat Leans, rows, Portable Counters, the Vibes screen, the save fields (no migration yet), the Lab's Rank picker; the second Sig Vibes as rows with their Basics and three Skill 1s | Pushed 2026-11-18 | `b3s4`, main 409fa20 | Pause menu > VIBES, or NEW BATTLE > VIBES AND RANKS: trade Main and Pocket, pick Quirks (from Rank 3), FRONT or BACK, and in the Lab set every Vibe to Rank 1 to 5. A Lab fight then uses it and a win pays Vibe Points. |
| 5a | Traits, Quirks and Capstones of the four FIRST Sig Vibes (Frequent Flier, Squishy Collector, Sugar Rush, Neat Freak): 4 Traits, 8 Quirks, 4 Capstones. General pieces: the free Skill (a granted action), taunts, the Family Ruckus count, conditions on listeners and mods, the first one-off rule (Twin-Lamb Relay) | Pushed 2026-11-18 | `b3s5a`, main 70a41db | NEW BATTLE > VIBES AND RANKS > Rank 4 or 5, pick Quirks, then any fight: the four Capstones in SKILLS, Grace's Dumpling opens a FREE SKILL list for whoever she picks, and a tap on anyone lists their Trait and Quirks |
| 5b | Tom's Gamer Geek and Grace's Craft Artist: 2 Skill 2s, 2 Capstones, 2 Traits, 4 Quirks, and the second half of Cartridge Blow (foresee). General pieces: `srcBegin` durations, answers for the putter, a status that adds a Pet Peeve, new listener and mod conditions, cost mods, Crit Rate per Prime, the foresee op and the aim lock, hazards that catch every act; one one-off (Double Coat) | Pushed 2026-11-18 | `b3s5b`, main cfc119e | Those two Vibes complete: Rank 4 or 5 on NEW BATTLE > VIBES AND RANKS with Gamer Geek or Craft Artist as Main; in a fight Cartridge Blow shows a yellow NEXT TARGET arrow over who the monster will hit next, Bedazzle-Gun Glue Trap leaves a GLUE pad |
| 5c | Rose's Cozy Rosie and Deedee's Registered Nut: Rose's Skill 1 and Skill 2, Deedee's Skill 2, 2 Capstones, 2 Traits, 4 Quirks. General pieces: the `later` op, Skill `cooldown`, `immune`, shield from overheal (`cleanBill`, the third one-off), the `survive` status flag, `shieldMods`, `tgtBelow` cost mods, listener fields `every` and `shieldBy`, targets `ally_pair` and `family_or_ko`, `to:'foes'`, effect conditions `revived` and `notRevived`; beats `survive` and `immune` on screen | Pushed 2026-11-18 | `b3s5c`, main afced5f | All 8 Sig Vibes complete (none shows SOON): in a fight Sofa-Cushion Citadel shows FORT on all four, the Ward shows JACKET on two, the Boomerang leaves LAMBY OUT on the monster |
| 6 | Family Ruckus: gauge gains (Mix +5, Detonation +8, extra hit +1, Break +15), the RUCKUS button as the gauge, Double Team (50), Full Family Ruckus (100), the pair played as one action with two moves, the gauge kept between Lab fights, a simple-player rule | Pushed 2026-11-19 | `b3s6`, main 75e657c | Any Lab fight: RUCKUS fills in gold as the family hits, lights at 50, and opens a list with DOUBLE TEAM and FULL FAMILY RUCKUS naming the partner. Both play as two moves back to back. |
| 7 | Preview and Rose Mode: `engine/b3-preview.js` (a move played on a copy of the fight: exact numbers, never a crit or a miss), tap to preview (first touch arms a row, second confirms; mouse hover previews, keys move the cursor), the info list on gamepad Y, the recommended move (`b3Recommend`: a glowing button with a star, the cursor starts on it, a short reason), `engine/b3-pictures.js` (picture menus for the cross, SKILLS, RUCKUS, targets, info and the preview box; the Vibes screen as pictures), Rose Mode's automatic loadouts (`b3RoseLoadout`) | Pushed 2026-11-19 | `b3s7`, main aefd6b6 | Nothing is asked. If he plays anyway: switch to Rose Mode in settings, then any Lab fight shows picture menus and one starred move; a first tap on a Skill row previews it, a second tap uses it. |
| 8 | Clips in Battle 3: `data/b3-clips.js` (body-state clips per owner), `engine/b3-clips.js` (load on demand, release, frames), clip moves (`anim:{kind:'clip',clip}` on a move row or foe act, hit on the clip's impact frame), The Big One's glare, tail slap, chomp, belly flop and polish as clips, wind-up held picture (`wind`), hit, dodge, KO, guard, flustered and victory clips, fallback to the default animation. Milestone A follows. | Pushed 2026-11-19 | `b3s8`, main 0fe7510 | MILESTONE A: see Tom's steps in the closing reply of the b3s8 session (about 30 minutes: NEW BATTLE > NEW 6: THE BIG ONE and NEW 1, then a Rose Mode fight; judge fun, turn bar, pace, family feel). |
| 9a | Tom's notes on the SKILLS list: a tap on a Skill opens its card (hides the other Skills, shows everything about it, BACK and USE); flavor pictures and a big Pep pill in the list | Pushed 2026-11-19 | `b3s9a`, main 95cb1d9 | Nothing is asked. |
| 9b | TNB complete: Ceramicist and Longboarder (2 Traits, 2 Basics, 4 Skills, 2 Capstones, 4 Quirks). New seams: clay shields and Fired Glaze, the Grand Amphora vessel, `allyMods`, the `basic` and `shielded` conditions, a Skill's own `rec`, `tgtAlly`, the `razzleDet` and `blockDebuff` flags, `slowestAlly`, the `vitrify`, `double` and `rebalance` ops. Lab fight NEW 7 (TNB in Deedee's place). | Pushed 2026-11-19 | `b3s9b` | Nothing is asked. If he plays anyway: NEW BATTLE > NEW 7: TNB JOINS; VIBES AND RANKS to make Longboarder TNB's Main. |
| 9c | Nara (Attached Pup, Guard Dog) and Boppy (The Dep, Pepper Boss) Sig Vibes (28 lines), the late joiners' Vibe Point pool (TNB moved onto it), Lab fights NEW 8 and NEW 9. Ends stage 9. | Pushed 2026-11-20 | `b3s9c` | Nothing is asked. |
| 10 | Amy (Fitness Queen, Classroom Boss), Justin (Basement Boss, Live Wire) and Olivia (Rope Champ, Working Mom) Sig Vibes (42 lines), Lab fight NEW 10 (Tom, Amy, Justin, Olivia). All 10 characters now have both Sig Vibes | Pushed 2026-11-20 | `b3s10` | Nothing is asked. |
| 11 | Bestiary chapters 2 to 4 with their bosses: 15 regular monsters, The Big Shake, Old Iron-Gill, The Director's Cut, 17 formations, chapter 2's explicit stat blocks, Lab fights NEW 11 to NEW 27. New seams: `surfaces`, `stopByIntercept`, op `row`, summon `ifNoFront`, Skill Lock, 14 statuses | Pushed 2026-11-20 | `b3s11` | Nothing is asked. |
| 12 | Bestiary chapters 5 to 7 (architecture section 5) | Not started (card c-b3s12) | `b3s12` | |
| 13 to 23 | See architecture section 5 | Not started | | |

## Stage 11 results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1549, FAILS: []. 195 more than stage 10, in `tools/b3-check-s11.js`: the bestiary rows and their numbers, `hp3` and `hp4`, formation VP, the 17 Lab fights, the 14 statuses, the Skill Lock gate, Iron-Gill's dive, surfacing, called sock and 50% dive, Big Shake's Faultline Guard pick, Scene One, ACTION!, CUT! (stun, intercept soak, Blind miss, interrupt), Pack Howl, Brown Haze, Pea Souper. |
| Simulator, 100 fights each, plain player | `new11` to `new27`: all won, 0 errors. Rounds to win: normal fights 0.7 to 3.5 (Tar Pit Blob 3.5, Snag 3.0), Big Shake 4.7, Old Iron-Gill 4.1, The Director's Cut 4.4, Cue Card Crab 4.7. Bosses are under the bestiary's 5 to 7 target, as chapter 1's Big One already was (3.5); HP kept as the bestiary prints it. Stage 14 owns balance. |
| `python3 tools/b3_test.py s11` | FAILS: [] (portrait then landscape): Iron-Gill dives and surfaces on screen, the called Soggy Sock, the Director's ACTION! and CUT!, Big Shake's guard, Boom Moth's Skill Lock, Clapper's Scene One. Frames looked at: `tools/shots/b3-s11.png`, `b3-s11-land.png`, `b3-s11-dive-portrait.png`, `b3-s11-surface-portrait.png`. |
| Bugs found on the way | A Toasty ending mid-loop crashed `b3EndTurn` (the status loop now skips a status that is not turn-counted). |
| `unused_voice.py` | No line or clip added. |
| Tom's phone | Not played, not asked for. |

## Stage 10 results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1354, FAILS: []. 172 more than stage 9c, in `tools/b3-check-s10.js`: every one of the six Vibes complete with plain descriptions, then each line of Fitness Queen, Classroom Boss, Basement Boss, Live Wire, Rope Champ and Working Mom played and its numbers checked. Two older checks edited (`b3-check-s4.js`: Amy has a kit now, so the unkitted example is Michael; `b3-check-s5.js`: the one-off key list gained `muscleMemory`). |
| Simulator | `new10` 200 fights: 200 won, 0 lost, 0 errors, 3.1 rounds, 97% party HP left (also `--rec` 3.3 rounds, `--swap=amy,justin,olivia` 3.2, `--rank=5` 2.6, all won). The simple player rarely picks Support Skills, so support lines are tested by hand in the check file, not by these runs. |
| `python3 tools/b3_test.py s10` | FAILS: [] (portrait then landscape): the party stands as Tom, Amy, Justin and Olivia, each one's Main and Pocket are the two Sig Vibes, each turn's list names the Trait, each Skill is in the SKILLS list and plays, and a self-grant does not say "Free from Amy". Frames looked at: `tools/shots/b3-s10.png`, `b3-s10-land.png`, `b3-s10-amy-portrait.png`, `b3-s10-justin-portrait.png`, `b3-s10-olivia-portrait.png`. |
| Older stage tests | s4, s5c, s7, s9b, s9c, s9ui: see the b3s10 entry in docs/CHANGES.md. One stale save-field assertion in s4 was updated (Amy, Justin and Olivia now have the fields). |
| `unused_voice.py` | Check 4 lists the same 39 dialogue clips with and without this work. No line or clip added. |
| Tom's phone | Not played, not asked for. |

## Stage 9c results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1178, FAILS: []. 55 more than stage 9b, in `tools/b3-check-s9c.js`: both newcomers' Vibes complete with plain descriptions, the six one-offs and five new ops exist, the pool (size, even split, one shift, lock), each Skill plays, `foe_row` offers rows. Two older checks were edited: the unbuilt-op test now uses `invert` (since `steal` is built), and the B3_CUSTOM key list holds the six new keys. |
| Simulator | `new8` and `new9`, 200 fights each: 200 won, 0 errors, 2.8 and 3.7 rounds. |
| `python3 tools/b3_test.py s9c` | FAILS: [] (portrait then landscape): the chapter 2 and 3 parties stand as named, Nara's list names her Trait, a row Skill offers rows, Boppy's turn plays, the Vibes screen shows the pool and LOCK IT IN hides it. Frames looked at: `tools/shots/b3-s9c-boppy-portrait.png`, `b3-s9c-pool-portrait.png`. |
| `unused_voice.py` | Check 4 lists the same 39 dialogue clips with and without this work. No line or clip added. |
| Older tests brought up to date | `python3 tools/b3_test.py s4` had gone stale when TNB, then Boppy and Nara, got kits (it expected four tabs and four fields, and the NEW BATTLE list is longer): its expectations now name all seven, and it passes. s9b, s9ui, s5c and s7 pass unchanged. `tools/smoke.py` passes. |
| Tom's phone | Not played, not asked for. |

## Stage 9b results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1123, FAILS: []. 115 more than stage 8, in `tools/b3-check-s9b.js`: both Vibes complete, each of the 14 lines by its numbers (clay shield size, Clobber soak 1.2x, Sizzle fires it, 30% reflect, Kiln Firing glazes with the Trait off too, Coaster Policy 15%, Kintsugi once per action and the Razzle Detonation, the vase soaks two whole acts then bursts, bursts after 4 rounds, goes with a knocked-out maker, a family strip leaves it, Carving Momentum, Fresh Ride blocks one debuff, Waymo revive or HP share, TAP-Card extra turn and the 15-tick pull once a round, Baxter Hill doubling, No Car No Tickets), previews on the new moves, the simple player's score for the vase, six whole fights. `tools/b3-check-s5.js` now expects the five one-off switches. |
| Simulator | `new7` (TNB in Deedee's place), 200 fights each with Ceramicist as Main and with `--swap=tnb`: 200 won, 0 errors, 2.4 to 2.7 rounds. With `--rec`: 100 of 100 won, 0 errors, Center the Bowl, Kiln Firing, Waymo and E-Bike all used. The simple player never casts the two Capstones at chapter 1 length (fights end first); they are covered by the rule tests. |
| `python3 tools/b3_test.py s9b s9ui` | FAILS: [] on the build rebased onto the SKILLS-list redesign (portrait then landscape): TNB stands third, his list names Trait and Quirks, Center the Bowl, Kiln Firing, the Amphora (soaks a monster's act whole in the log), E-Bike, Waymo (shares HP) and Baxter Hill all play through the real menus. Frames looked at: `tools/shots/b3-s9b.png`, `b3-s9b-land.png`, `b3-s9b-bowl-portrait.png`, `b3-s9b-amphora-portrait.png`. A first run found the vase's beats were in a group the screen never shows (an act with no hits); moved to `post`. |
| `unused_voice.py` | Check 4 still lists the same 93 dialogue clips as clean `origin/main`. No line or clip added. |
| Found on the way | `docs/CHANGES.md` had been truncated by skipchain1 and was already restored on main (4f4b8eb). |
| Tom's phone | Not played, not asked for. |

## Stage 8 results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1008, FAILS: []. Stage 8 changed no rule: the `anim` and `wind` fields are data on a move row or an act and the act and telegraph beats carry them. |
| `python3 tools/b3_test.py s8` (new, about 6 minutes, portrait then landscape) | FAILS: []. Idle loops of every fighter loaded when a fight opens and drawn from the clip; Tom, Grace, Rose and Deedee each play their Basic or Skill from a clip and the hit shows 0 to 17 ms after the clip's impact frame (measured on the battle clock); The Big One's Glare, Chomp, Polish, Belly-Flop and Tail Slap are played from their clips; hit, guard, knock-out, flustered and victory clips are drawn; peak of 14 to 16 clip pictures held (about 150 MB) in a boss fight; a clip that cannot load makes the move wait 2.5 s, then play the default animation, and the hit still lands. Frames looked at: `tools/shots/b3-s8.png`, `b3-s8-land.png`, `b3-s8-rose-move.png`, `b3-s8-end-portrait.png`. |
| Whole `python3 tools/b3_test.py` | FAILS: [] end to end, on the build before the rebase. |
| `tools/smoke.py` | FAILS: [] after the last rebase; tags bumped for 13 files. |
| `tools/clip_test.py` | FAILS: [] (the battle 2 clip test still passes). |
| `tools/clip_kinds_test.py`, `tools/clip_review_test.py` | Both FAIL ("sleep clip ran 0 to 30, wanted 0 to 38"; "before any PLAY only the Mudling idle loop is loaded"). Both fail the same way on `aefd6b6` without this build's changes, so they were failing before stage 8. Not fixed. |
| `unused_voice.py` | Unchanged: check 4 lists the same 93 dialogue clips as before. No line or clip added. |
| Two test changes worth knowing | A clip move lands its hit later than a default move (it waits for the clip, up to 2.5 s): the stage 2 wet-floor check now polls for the hazard; the stage 5a Bouncy Physics check sets the Ruckus gauge to 40 first (it was capped at 100). |
| Tom's phone | Not played. This is the first message that gives him test steps (milestone A). |

## Stage 7 results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 1008, FAILS: []. 48 more than stage 6. New groups 135 to 138 are in `tools/b3-check-s7.js`: a copy of a fight plays exactly like the fight (218 moves identical across 10 seeds in the first run), a preview leaves the fight as it was, Pet Peeve and Resist and Detonation (Hydro-Slip!, its push and the turn bar after) and pips and Break and heals and a revive and a Full Ruckus and a refusal in a preview, the recommended move is always legal, never changes the fight and is stable, it revives a knocked-out member, heals a member at 30 of 400, takes the free hit that sets off a Detonation, names the Ruckus when the gauge is full, picks the free Basic when there is no Skill, stops The Big One's wind-up (8 seeds), and wins 60 whole fights with every Capstone used, then Rose Mode's loadouts (Sig Vibes, newest written Quirks, a valid loadout, the book not changed). |
| Simulator with `--rec`, `--rank=5` | new1, new3, new5, new6: 60 of 60 won each, 0 errors, 98 to 100% party HP left. The 60 fights in the rule test use at least three of the four first Capstones. |
| `python3 tools/b3_test.py s7` | Passes in portrait and landscape (about 3 minutes): the cross is pictures with one glowing button and a star; SKILLS, target and RUCKUS rows are pictures; the preview box shows pictures only; a first touch (a real `pointerType:touch`) arms the row without using it, a second uses it; Esc goes back; the info list opens with I and with the pad's Y; the pad walks the lists; following the star plays a turn; one glow on every cross for ten turns; each member starts with the automatic loadout and the Lab book is not rewritten; the Vibes screen is pictures with a Rose Mode line and nothing spills sideways. s3, s4, s5, s5b, s5c, s6 all still pass. The whole file was not run end to end. Frames looked at: `tools/shots/b3-s7.png`, `b3-s7-land.png`, `b3-s7-vibes-portrait.png` (a first run showed the star, the effect icon and the preview box icons at full row size; fixed by giving the wrapper an explicit pixel size and bounding `#b3-pv` images). |
| Bugs found on the way | The preview showed a crit in one run (the crit roll ignored `F.preview`): fixed in `b3-resolve.js`. A render used a constant before it was defined (`pm` in the turn bar): fixed. |
| `tools/smoke.py`, `tag_check.py` | Pass (FAILS: []) after the last rebase; tags bumped for every changed script (`b3-core`, `b3-progress`, `b3-resolve`, `main`, `b3-ui`, `b3-menu`, the two new files). |
| `unused_voice.py` | Check 4 still lists 93 dialogue clips; the same 93 on a clean `origin/main` before this build. No line or clip added. |
| Tom's phone | Not played, and not asked for: see "When Tom tests". |

## Stage 6 results (facts)

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 960, FAILS: []. 76 more than stage 5c. The new groups (127 to 134) are in `tools/b3-check-s6.js`: numbers and the starting gauge, Mix rules, Detonation, extra-hit and Break gains, plan refusals, Double Team (cost, no Pep gain, two acts, a Detonation by the pair, +50% power, group numbers, the partner keeps their wait and turn), Full Family Ruckus (Capstones, the 4-pip cap, Rank 2 gives Skill 2), beats and gauge values, the simple player (100 fights, plus Big One at 60%). Stage 5 and 5b checks changed where the new gains changed a number (Bouncy Physics 5, 13, 15, 17; Gamer's Intuition 13 with a trait +5 on top of the 8; Grace's Detonation gives 8 plus a Mix 5 and ends at 26). |
| Done when (architecture): the simulator checks the 4-pip cap and that the partner keeps their turn | Both are checked in `tools/b3-check-s6.js` (Composure cap 4 on a Full; the partner's wait and turn untouched after a Double Team). |
| Simulator, 300 fights each, Rank 5, `--foehp=3` | `--swap=tom,grace`: 300 won, 0 lost, 0 errors, 8.79 rounds, 93% party HP left. `--swap=all`: 300 won, 0 errors, 9.69 rounds, 91% HP left. Every Capstone is still used in both (Rose's `double_lamby_return_cart_blitz` and `masterpiece_portrait_makeover` among them). With `--ruckus` on `new6` (the simple player spends the gauge): 100 of 100 won, 0 errors. |
| Simple player | Spends Full at 100% and Double Team only when it could otherwise only Basic. No score for single-target `later` effects was added. |
| `python3 tools/b3_test.py` | New `s6` (about 2 minutes, portrait and landscape): fresh fight shows RUCKUS 0% greyed, a tap on it explains the gauge, 100% lights and fills the button, the list shows DOUBLE TEAM 50% and FULL FAMILY RUCKUS 100%, Esc goes back to the cross, Double Team and Full both play and are named in the log, the gauge is stored when leaving the Lab. `s4`, `s5`, `s5b` and `s5c` all pass. The full file was not run end to end. Frames looked at (`tools/shots/b3-s6.png` and `b3-s6-land.png`): the gold fill, the list with the partner named, both spends playing. |
| `tools/smoke.py`, `tag_check.py` | Pass (FAILS: []) before the push; tags bumped for every changed script. |
| `unused_voice.py` | No change: check 4 still lists 93 dialogue clips from before. No line or clip added. |
| Tom's phone | Not played, and not asked for: see "When Tom tests". |

Earlier stages' results (5a to 5c) are in `docs/BATTLE3.md` ("What stage 5a/5b/5c holds") and `docs/handoff/b3s5a.md`, `b3s5b.md`, `b3s5c.md`. Facts worth keeping for the balance pass (stage 14): at Rank 2 the Traits change chapter 1 by 5% at most; at Rank 5 with both Quirks the first Vibes give The Big One 3.19 rounds (5b to 5c) and 2.57 with `--swap=all`; target for the boss is 5 to 7. Nothing was retuned. Stage 6's Ruckus gains did not lengthen or shorten the fights enough to matter in the simulator (the simple player seldom spends the gauge). Stage 4's results are in `docs/BATTLE3.md` and `docs/handoff/b3s4.md`; stage 3's in `docs/BATTLE3.md` and `docs/handoff/b3s3.md`.

## Calls made that Tom has not confirmed

All are numbers or rows in data, or one line of rules, so each changes without a rebuild. Tom sees them in play at milestone A; no stage asks him about them before that.

| Stage | Call | The other option |
|---|---|---|
| 9b | Center the Bowl can be aimed at TNB himself. | Allies other than TNB only. |
| 9b | Kiln Firing and the Waymo flash are standard, Baxter Hill's wave is heavy, at the all-monsters share (the spec prints no tier for the first two). | Light or heavy for the first two. |
| 9b | Kiln Glow, Fresh Ride and the e-bike last the common 2 turns. | 1 or 3 turns. |
| 9b | The Grand Amphora counts a monster's whole act as one hit however many it strikes or aims at, bursts when the last hit is soaked or the 4th round ends, and goes away without bursting if TNB is knocked out. | Each strike soaked one by one; it bursts when TNB falls. |
| 9b | Coaster Policy is +15% on every hit of any flavor for any family member holding any shield, counted as its own damage bonus kind. | Only TNB's hits; added to other bonuses. |
| 9b | Kintsugi Gold Seam heals once per action per member and lets a hit of a flavor with no Detonation of its own on that Prime (Racket or Drench on a Drenched monster) set off Short Circuit!. | Heals every hit; only Razzle hits set it off. |
| 9b | Longboard Push & Carve prints its Base Recovery as 72 (the spec's "-10%"); Carving Momentum takes another 10% off a Basic. | Recovery 80 and one 10% cut. |
| 9b | TAP-Card Transfer: the slowest ally is the lowest Speed stat, pulled 15 ticks up once a round at the start of TNB's turn; the extra turn applies to every buff TNB puts on, his own included. | Slowest by the turn bar; his own buffs excluded. |
| 9b | Baxter Hill doubles the E-Bike (a second doubling changes nothing) and sets it to at least 2 turns. | Doubles again each time. |
| 9b | "Scanning stats" on the Longboarder Basic is a picture only until Olivia's Scan (stage 10). | A rule now. |
| 9c | Boppy's counter ward is light Racket; the Iron Gate's thorns are light Clobber, answered by Boppy; the Gate is a round-long status on all allies, not a hazard. | A hazard on the family's floor. |
| 9c | The Mailbox copies the flavor and status riders of Boppy's last s1, s2 or Capstone Skill (a Basic does not count). | Any last move. |
| 9c | Gold Teeth works after a jacket's survive and counts toward the Pep refund cap. | Instead of a jacket. |
| 10 | | Reps (Fitness Queen) builds +1 on each of Amy's non-Basic actions, plus 1 from each Basic and from Burpee Blitz as written; they persist through a knock-out. | Reset at a knock-out; a different build rule. |
| 10 | | Kettlebell Swing's Base Recovery is 60; Burpee Blitz's mini turn is a paid, counted action (it can add another Rep). | Other Recovery; a free uncounted mini turn. |
| 10 | | Pace-Partner Run only raises Speed (a held number set when the status goes on); Follow-Along Finale Burnout spends Reps for +25% each and pierces shields. | A Speed that keeps following Amy's buffs. |
| 10 | | Detention, Gold-Star Sticker, Drywall (3 turns at most), Squared Up, Wired and the other stage 10 statuses last 2 turns unless data/b3-status.js says otherwise. | 1 or 3 turns. |
| 10 | | Four-Tab Binder and the Copper Banner are light Racket and light Razzle hits; Lights-Out Reset is heavy and also cancels a wound-up all-family act. | Other tiers. |
| 10 | | Gold-Star's true aim does not beat Blind. Demo-Day Prybar counts a stance as 25% of the hit when it blasts the neighbour. Toolbox Punt is double damage on a Flustered monster. | Beating Blind; another blast share. |
| 10 | | High-Def (Load-Bearing Swing) means Defense at least equal to Justin's own base Defense. | A fixed number. |
| 10 | | Cadence resets on any Support turn of Olivia's (also from Working Mom in the Pocket); Muscle Memory switches that off. Criss-Cross and Regional Freestyle add 15% power per hit past the second. | Reset only on a Support Skill with no attack. |
| 10 | | Nap-Window Efficiency is 20% less Recovery on Support Skills. Baby-Wipe Swipe on a family member clears one minor debuff (weight 4 or less) and heals 10%; it is offered on every monster and every family member, Olivia too. A Ruckus Baby-Wipe is only used on a monster. | Other numbers; a Ruckus ally pick. |
| 10 | | Childproofed Locks picks a random family member, Olivia included, once per action. | Never Olivia. |
| 11 | Faultline Guard is cast whenever The Big Shake is below 50% and not already braced (the rotation picks it); Big Rumble follows. | Cast once, at the first turn below 50%. |
| 11 | ACTION! pulls every monster 25 ticks, the Director included, and adds 1 to 2 Extra Extras in front. | Only the adds move. |
| 11 | Clapper Snapper's Scene One pulls a dice-picked other monster 15 ticks, once. | Always the nearest to act. |
| 11 | Iron-Gill surfaces after its Deep Dive, or at its next turn if a Break cancelled the dive; its dive below 50% is a second act with its own Deep Dive. | One dive act for both. |
| 11 | CUT! only misses by Blind, an intercept or an interrupt (Spooked is not built). With an intercept the interceptor takes the damage but the stun and push do not land (`stopByIntercept`). | The stun lands on the Marked family member anyway. |
| 11 | "Opens round 1" is a `once` act on the monster's first turn, not a wait of 0. | Starts at 0 on the bar. |
| 11 | Chapter 2 has 5 normal formations (the bestiary's VP table counts 6 fights). The Boat Angler answer to Iron-Gill's dive waits for Boppy's third Vibe. | A sixth formation; a stand-in answer now. |
| 11 | Skill Lock on a family member blocks only the Pocket Vibe Skills (Boom Mic Moth's Mic Feedback, 1 turn). | Blocks all Skills. |
| 9c | "Chip" for the stomach Attack bonus means a monster's Sizzle hit or Spiced Up; burn ticks do not trigger it. | Burn ticks too. |
| 9c | Five-Alarm Burn is a second tick status that ends with Toasty; Toasty stays, so Detonations still see it. | It replaces Toasty. |
| 9c | Pickle Jar Bomb is standard at the all-monsters share; The Ghost One is heavy at that share plus 2 Sizzle ticks. No Reach for Water counts only Boppy's own Steam Clouds. | Light or standard; any Steam Cloud. |
| 9c | Nara's Basic is a single-target light Drench hit; Shake-It-Off drenches with no damage; Vacuum Bolt is light on a row at the 70% share; Meltdown is heavy, two flavors, and sets off every Detonation that matches. Shins counts positive Speed mods only, not the Lean. | Basic on all; Shake-It-Off with damage; Shins counts the Lean. |
| 9c | "Twice" in Locked On the Gold Ball means two Nara actions in a row. My Toy adds 20% Clobber taken from the whole family and a free light chase bite when the monster is pushed. | Two hits in one action. |
| 9c | "Debuffed" excludes a Prime on its own. Muffin Crown cannot be stolen, so No Take, Only Throw falls back to +35% Attack. Treasure table: Pep Bone (2 Pep to the lowest-Pep member), Squeaky Toy (light Racket on a random monster), Chicken Strip (heal 15% to the lowest-HP member). | A Prime counts; a crown can be stolen; other treasures. |
| 9c | Stunt-Double is capstone tier, 3 hits, and `pierce` skips shields and evasion only. | Pierce also Defense. |
| 9c | The late joiners' pool is the largest total any one member holds (a late joiner's own pool counts); it starts split evenly; one shift is 20 VP; the player locks it once; only built Vibes count. A save from before the pool counts as already split. The Lab's start is the even split at Rank 2, the same as every Lab start so far. | A free slider with any step; a pool of the Lab's total only. |
| 8 | A move plays from its clip when the clip is loaded; it waits up to 2.5 s (`B3C.waitMax`) for the clip and then plays the default animation. | Never wait (default at once); or wait longer. |
| 8 | The hit shows on the clip's own impact frame (a state clip with no impact lands at half its length, `at` changes it). Several hits are 0.35 s apart. | Hits spread evenly across the clip. |
| 8 | Clips are not slowed by `B3_TEMPO` (a clip is already a fixed length video). | Stretch clips by the same tempo. |
| 8 | Only idle loops stay loaded all fight; every other clip is loaded just before it is used, kept 4.5 s and released 3 s after its last picture. | Keep more loaded (more memory, fewer waits). |
| 8 | Party strike clips cross to the monster, play there, and run home on a mirrored run clip; monster clips play in place. | The clip plays where the character stands. |
| 8 | Moves wired to clips: Tom Lounge Pass and Blockade; Grace Squeeze and Cube Pop; Rose Tackle, Lava and Giddyup; Deedee Windex, Wet-Floor and Dust Tsunami; Mudling bump and throw; the five Big One acts. Every other move keeps its default animation. | Wire more or fewer. |
| 7 | A preview never shows a miss or a crit (it plays the move with luck switched off). | Show the chance of a crit in the box. |
| 7 | In SKILLS, RUCKUS and the target list a touch is two taps: the first previews, the second uses. A mouse previews on hover and uses on click. | One tap uses it, with the preview only on the info list. |
| 7 | The recommended move is its own picker built on previews (`B3_REC` weights in `engine/b3-preview.js`), not the simple player; the simple player is unchanged. It only runs in a difficulty with `recommend` (Rose Mode). | Reuse the simple player's scores. |
| 7 | The recommended Basic says "Free, and it builds Pep." and a hit with nothing special says "A strong hit right now." | No sentence unless something special happens. |
| 7 | Rose Mode's three-icon rule: a row has a flavor picture or two, Pep drops, and at most one effect icon; names stay as one short word. | Pictures only, no words. |
| 7 | Gamepad Y opens the info list (the I key does the same). | Y does something else. |
| 7 | Rose Mode picks the loadout at fight start: the two Sig Vibes as Main and Pocket and the last two written Quirks the Ranks have opened (the pool runs Vibe by Vibe, rung by rung). The player's own book is not changed, so Grace Mode keeps their picks. | Use the book as picked; pick Quirks by what suits the fight. |
| 6 | Gamer's Intuition's +5 Ruckus per Detonation is EXTRA, on top of the Detonation's own +8 (so a Detonation by Tom gives 13). | The trait's 5 is part of the 8 (the gain stays 8). |
| 6 | A Mix gives +5 once per monster per round (the second different flavor on that monster in the round). | Every flavor change; once per action. |
| 6 | A Double Team's Basics give no +2 Pep (it costs 0 Pep and gives none). | Each Basic gives its normal Pep. |
| 6 | Cooldowns are ignored by both spends (Full uses a Skill with a cooldown even while it is cooling, and does not start one). | Respect and start the cooldown. |
| 6 | The Break +15 goes only when a party member's action caused the Break (a ward's answer or a slip on a family hazard counts as that member). | Any Break, a monster's own included. |
| 6 | The partner keeps their own wait and their coming turn after a Double Team or Full (they act in the pair but are not charged a turn). The first member's turn ends with the wait of the move they used. | The partner pays half a turn. |
| 6 | When any move in a spend is aimed at one monster, the player picks one monster for both (Double Team's Basics always are). A Full whose Skills are all-monster moves asks nothing. | Each partner picks their own. |
| 6 | Full Family Ruckus uses each member's highest-slot Main Vibe Skill (s1 < s2 < Capstone), never a Pocket Vibe Skill and never Pick-Me-Up. | Include the Pocket Vibe; the most damaging one. |
| 6 | The gauge is kept between Lab fights on the phone (localStorage `aot-b3-ruckus`). A saved game keeps its own at stage 15. | Reset to 0 every fight. |
| 6 | The simple player spends Full at 100% and Double Team only when it could otherwise only Basic. | Spend at 50% always. |
| 5c | Tattered Lamby Boomerang: a light Clobber throw now; when Rose's next turn begins a standard tackle in two halves and a 10% self shield (the mark `lamby_stuck` ends then, or if she is knocked out; a dead target is replaced by a random live monster). | The tackle at once; no shield. |
| 5c | Sofa-Cushion Citadel: 25% shield on all four and no pushes for 3 turns (`pillow_fort`), 3 Pep, 3 round cooldown counted in rounds. | 2 turns; cooldown by Rose's turns. |
| 5c | Mint-Condition Backup: -20% crit taken for whoever holds a shield of Rose's (any amount) and only while it stands. | Any shield; a flat Crit Rate cut. |
| 5c | Emergency Stuffy Swap: a shield of Rose's that breaks (on any holder, Rose too) brings a light Clobber hit on the monster that broke it, once a round. | Once per fight; the hit goes to a random monster. |
| 5c | Kingdom of Ten-Thousand Blankets: heals 60% and cleanses one family member (picked), and `blanket_castle` stands until her next turn begins, when a heavy Sizzle wave at the all-monsters share hits every monster. | Wave now; castle with its own effect. |
| 5c | Forty Years a Nurse: half of the healing past full HP becomes Deedee's shield, 25% of Max HP at most; a knocked-out target makes none, and Rose's heals make none. | A flat share; any healer. |
| 5c | First-Ring Pickup: -1 Pep (never under 1) on a Skill aimed at ONE family member who is up and under 50% (exactly half is not under). The menu shows the cheapest price she could pay. A two-member Skill (the Ward) is not discounted. | Counts for the pair; the price shown only after picking. |
| 5c | Warm Beats Cold: Stun and Slow never land on Deedee (an `immune` beat is shown); cleansing anyone, herself too, heals her 10% of her Max HP. | Only mental cleanses; 10% of the target's HP. |
| 5c | "Bring a Jacket!" Ward: two family members (the pick and whoever is hurt most), 4 Pep, 3 round cooldown; `jacket` is 7% regen per turn for 3 turns and the first knock-out is held at 1 HP once (the regen stays). | One member; a heal on use. |
| 5c | To the Moon & Back: 6 Pep, any family member can be picked. A knocked-out member comes back at 80% and is not healed further; a living one is healed to full; then a heavy Sizzle wave on all monsters and 2 pips off each. | Revive at full; heal and wave on the same turn as now. |
| 5b | Winged Shell Lock-On's free Razzle slam is Tom's own standard hit when the monster attacks. A wind-up turn does not trigger it; the shell ends at Tom's next turn if the monster did not attack. | The shell also answers a wind-up; or it lasts until the monster attacks. |
| 5b | Konami Code's "rainbow-invincible" is a picture only. | A rule (a brief invulnerability). |
| 5b | Gamer's Intuition: the +20% is one bonus whether the target has a Peeve hit, a Prime or both. (The Ruckus half was settled in stage 6, first row above.) | The two bonuses add. |
| 5b | Masterpiece Portrait Makeover deals its heavy Razzle hit first, then Razzle Weakness lands (so the hit is not a Peeve hit). | Weakness first, so the hit counts as a Peeve. |
| 5b | Bedazzle-Gun Glue Trap catches every act that is not a wind-up for 2 rounds; chip is light Sizzle then Razzle (half each) and Fatigue stands in for +20% Recovery. Grace as the pad's owner can detonate, Prime and trigger Creative Mess with it. | Only tagged acts; a separate +20% Recovery rule. |
| 5b | Creative Mess splashes 25% of the damage the action dealt to that monster (a standard hit's worth if none), once per action per monster across Prime and debuff. Marks (Squished) are not debuffs. | A fixed standard-hit share; marks count. |
| 5b | Elixir Hoarder is judged at turn start and lasts until his next turn begins. | Judged at turn end; one turn shorter. |
| 5b | New Game Plus lasts through his next turn, once a round shared by Detonation and counter triggers; Skills of 4 Pep or less, floor 1, Capstones excluded. | Separate once-a-round counts; applies to the next Skill only. |
| 5b | Double Coat counts Basics; any other flavor, two-flavor or Support move resets the chain. | Only a different flavor resets. |
| 5b | Cartridge Blow shows aim only for single-target strikes and locks it unless a taunt, a knock-out or a different act intervenes; a wind-up shows no aim. | Show aim on wind-ups and multi-target acts too. |
| 5a | Priority Boarding's Guard Stance lasts until Tom's second turn ends, so it covers the monsters' first attacks. | Until his first turn ends (before most monsters have moved). |
| 5a | Priority Boarding's 20% adds to Suite Door Slide's 35% (the 60% cap still holds). | It multiplies (48% together). |
| 5a | Upgrade Certificate: one stamp per enemy action Tom steps in for, a miss included. A Zone One Blockade hip-check cashes Certificates like a Clobber Skill on his own turn. A Clobber Basic never does. | Only a Clobber Skill on his own turn (then Frequent Flier alone could never cash them). |
| 5a | Million-Miler Status: stepping in takes 1 pip as Tom's own small answer after the monster's action, with its own 3-pip cap. With the Blockade up as well, one monster action can cost it 3 pips across the two answers. | The pip counts inside the monster's own action; or stepping in takes no pip unless something else already did. |
| 5a | Tarmac Porsche Transfer takes 1 buff off each monster it hits; its taunt lasts 2 turns. | 1 buff in all; 1 turn. |
| 5a | Sensory Satisfying: "skill potency" is damage dealt and heals and shields given. It goes to whoever is next on the bar as Grace's turn ends, if family, for their next turn. A free Skill Grace grants does not count as "next on the bar". | Damage only; the granted family member counts. |
| 5a | Colossal Diamond-Gold Dumpling: the free Skill is a Skill of 4 Pep or less, never the Basic and never a Capstone. Someone with no such Skill to use, or who already had a free action this round, cannot be chosen. The player must pick (no skipping). | The Basic allowed; a skip button. |
| 5a | During a free Skill nothing on that member counts down, and a status they put on themselves starts counting at the end of their next real turn. | It counts as if cast on their own turn (one turn longer). |
| 5a | Slow-Rise Memory Foam counts every push, pull and pass Grace causes, a Hydro-Slip! she sets off included. | Only her Skills that move someone. |
| 5a | Ultra-Rare Limited Edition counts any Skill aimed at a family member, Pick-Me-Up included. | Only Squishy Collector's own Skills. |
| 5a | Double-Lamby Return-Cart Blitz: capstone power shared by six hits on random monsters. On a Flustered monster the bonus goes by the hit's place in the move (1st +10%, 6th +60%). | Six hits on one chosen monster; the bonus counts only hits that landed on a Flustered one. |
| 5a | "It's OUR Longboard Now" lasts until Rose's next turn begins, so it shortens exactly the wait she is starting. | Until her next turn ends (two shorter waits). |
| 5a | Twin-Lamb Relay: an "enchantment" is a rider, a bonus another family member left on a monster for the next hit (today: Spit Shine, Squished). Rose's multi-hit moves keep it for their later hits at 40%. An effect that cannot be split (Squished's 1 Pep) does not repeat. Her Basic counts. | Wait for real weapon enchantments (Tom's Cake, TNB's Kintsugi) and do nothing until then. |
| 5a | Bouncy Physics counts hits that land (a dodge adds nothing). | Every swing. |
| 5a | Spotless Floor: "a Drenched foe" includes one whose Drenched this same action set off (her Scrub is a Hydro-Slip!, which uses the Drenched up first), and a slip on her wet floor is her shave. The extra pip is inside the 3-pip cap. | Only a monster still Drenched after the hit (then her own Clobber Skills never get it). |
| 5a | Car-Crumb Vacuum goes off once per action, and counts a stance her Panic Boil! knocks off. | Once per buff stripped; buffs only. |
| 5a | Spit Shine is its own mark for 2 of the monster's turns. It stays if someone else sets the Drenched off with another flavor, and only a Clobber hit by someone other than Deedee uses it. | It ends with the Drenched. |
| 5a | Fifty-Year Dust Tsunami scrubs first, then hits for heavy power (the spec prints no tier; Tarmac, the other 5 Pep Capstone, prints heavy). It does not leave a monster Drenched whose Toasty it set off (spec 2.5 wins over the kit line). | Capstone tier; always Drenched. |
| 5a | A Trait or Quirk is named over its holder as it goes off only where nothing else on screen says why a number moved (Upgrade Certificate, Million-Miler Status, Spotless Floor). | Name every one every time. |
| 5a | Stage 5b was split again (5b: Tom and Grace's second Vibes; 5c: Rose and Deedee's): the sessions run on a cheaper model, so each gets a smaller piece. | One conversation for all four. |
| 4 | The Battle Lab keeps its own Vibes on the phone and starts every Vibe at Rank 2. A Lab win pays Vibe Points. | The Lab reads the newest save; no Vibe Points in the Lab. |
| 4 | What is set on the pause menu's Vibes screen is copied to the Lab (Main, Pocket, row; not Vibe Points). | The two never touch. |
| 4 | The pause menu's Vibes screen lists the party, not the bench. | Everyone recruited. |
| 4 | The Pocket Vibe's half of an odd Vibe Point number rounds up. What is left over when a Vibe reaches mastery spills to the lowest unmastered Vibe (fewest points; first listed on a tie). | Round down; the leftover is lost. |
| 4 | A Trait or Quirk whose rule is not written yet shows on the Vibes screen with its sentence, marked SOON. | Hidden until it works. |
| 4 | A row the player picked stays picked when the Main Vibe changes. Until they pick, the row follows the Main Vibe's Lean (Support in Back). | Always by Lean. |
| 4 | Pocket Pretzel & Pat's pretzel can go to Rose herself when she is the one hurt most. | Never herself. |
| 4 | Deedee Makes It Better heals 20% of Max HP, can be used on herself, and its +20% Attack lasts 2 turns. | A small heal (10%); allies only. |
| 4 | Controller Toss counts a hit a shield soaked whole, and a hit Tom took for someone, as "took or blocked a hit". A burn tick does not count. | Only HP actually lost. |
| 4 | Cartridge Blow was only the light Racket hit in stage 4; its "shows the enemy's next target" half was built in 5b. | (done) |
| 4 | Someone in the Back row is drawn 14 pixels further from the monsters and shows BACK on their card. | No change in the picture. |
| 4 | Stage 5 was split into conversations (5a, 5b, 5c): 37 kit lines is more than any stage so far carried. | One conversation. |
| 3 | Big Glare is the wind-up turn of Swamp Chomp: the glare lands and Marks on one turn, the bite comes on the next. | Big Glare itself announced a turn earlier (4 turns for the pair). |
| 3 | With nobody in the Back row, Big Glare picks its target like any attack. The Lab party all stand in Front by default (their Vibes' Leans), so it can Mark anyone, Tom included. | Put one family member in Back for the Lab fight so the glare always goes there. |
| 3 | The Mark stays on the one the glare was aimed at even when Tom stepped in for the glare; a taunt does not move the bite off the Marked one. | The Mark follows whoever took the glare. |
| 3 | A ward's answer (Zone One Blockade) and a slip on the wet floor each have their own 3-pip cap. | They share the cap of the action they answer. |
| 3 | Burn and Bleed ticks never take a pip, even in a Pet Peeve flavor. A splash (Short Circuit!) in a Pet Peeve flavor does. | Ticks take one too. |
| 3 | A Flustered foe goes behind "every unit waiting inside the next 100 ticks", and the one who just Broke it counts with the wait their move gives them. | Only those already waiting count. |
| 3 | Pips show empty while it is Flustered and refill as its next turn begins. | Refill at once (still locked). |
| 3 | A Break that comes on the foe's own turn before it acts (a slip takes its last pip) costs it that act. | It still acts. |
| 3 | A once-in-the-fight act that is cancelled does not come back. "Below 50% HP" includes exactly 50%. | It is tried again. |
| 3 | The Muffin-Tin Crown is one buff: its +15% Attack and its Mend 3% come off together. Its Mend can lift The Big One back over half HP, which delays Muddy Belly-Flop. | Two buffs. |
| 3 | A Stun on a Flustered Elite is spent without costing the turn it is owed ("a foe always gets that turn"). | The Stun waits for the turn after. |
| 3 | A counter act lands on the attacker even behind Tom's Suite Door Slide. | Tom takes it. |
| 3 | An add on screen stands between the caller and the family, drawn small. 3 monsters in Front and 2 in Back at most. | Behind or beside the caller. |
| 2 | Zone One Blockade answers with a standard Clobber hit, once per enemy action. | A light hit. |
| 2 | A ward's answer or a wet-floor fall can set off a Detonation like any other hit (and pays its +1 Pep). | Only a turn's own move can. |
| 2 | Suite Door Slide covers the family standing next to Tom when he uses it. In the Lab the family stands Grace, Tom, Rose, Deedee, so that is Grace and Rose. | Tom first in line (then only one neighbour). |
| 2 | Crunchy Sugar-Cube Pop is a light Racket hit: the spec names no damage, and the cancel and the 30-tick push are what the 4 Pep buys. | Standard hit. |
| 2 | "Giddyup, Tata!" Launch: the ally who gets +20% Attack is the next family member due on the turn bar, for 2 turns. The hit is Sizzle first, then Clobber, heavy in total, and leaves Toasty. | The player picks the ally; or always Tom. |
| 2 | Wet-Floor Hazard catches monsters using an act tagged melee; the fall is a light Clobber hit; the floor dries after 3 rounds if nobody slips. It deals nothing when laid. | "Physical" meaning any Clobber act; no time limit. |
| 2 | "Hand Me My Glasses" Scrub: the +25% per buff is added to its own Clobber hit. | A separate Drench hit for the bonus. |
| 2 | A two-flavor move leaves only its first flavor's Prime (how spec 2.5 reads). | Both flavors' Primes. |
| 2 | Pick-Me-Up: the revived member rejoins the turn bar 100 ticks out (the spec's rule for someone arriving). A Skill with only one possible target fires without asking who. | Acts sooner; always ask. |
| 1 | A multi-hit move's power is the whole move's power, shared by its hits. | Each hit at the full tier. |
| 1 | An enemy's announce turn (the wind-up) uses Base Recovery 80. | The act's own Recovery. |
| 1 | "Every 3rd turn" starts counting again after the act fires. | Counting straight through. |
| 1 | A status you put on yourself on your own turn does not count that turn. | It counts. |
| 1 | A turn's wait is set before its statuses count down, so a 2-turn Slow slows two Recoveries. | Count down first. |
| 1 | NeeDoh Stretch Pass puts the ally at the very front of the turn bar. | Right after Grace's next turn. |
| 1 | Short Circuit! splashes 40% of the hit that set it off. | 40% of a standard hit. |
| 1 | Buzz Cloud comes up only after Jitterflight was stripped, not when it runs out. | Whenever it is missing. |
| 1 to 8 | No Battle 3 move has a spoken line yet (33 moves, Pick-Me-Up included; the two Ruckus spends have none either, only on-screen words). | Write and wire lines now. |

## Owed

| Item | When |
|---|---|
| Tom's verdict on the turn bar in portrait (architecture risk 6) | Milestone A. Fact: he played `b3s1` and his only note was the attack speed. If the bar is hard to read, the fix is in the screen file only (`engine/b3-ui.js`), not the rules. |
| Tom's verdict on Rose Mode: the picture menus, the star and the recommended move (stage 7 calls) | Milestone A. Tuning is `B3_REC` in `engine/b3-preview.js` and CSS in `index.html` (`.b3p-*`, `.b3-pv*`). |
| Tom's verdict on the video attacks: pace of the clip moves, waits for a clip to load, how the crossing to the monster looks (stage 8 calls) | Milestone A. Tuning: `anim.at` on a move or act, `B3C.waitMax` and `B3C_KEEP` in `engine/b3-clips.js`, rows in `data/b3-clips.js`. |
| Two battle 2 clip tests fail the same way before and after stage 8: `tools/clip_kinds_test.py` (sleep clip ran 0 to 30, wanted 0 to 38) and `tools/clip_review_test.py` (before any PLAY only the Mudling idle loop is loaded) | The animation thread owns them; battle 2 is untouched by stage 8 except `bclipWanted` and the release rule in `engine/painted.js` (both only change when Battle 3 is active). |
| Clips for the other kit moves and the remaining monsters (only the moves named in the stage 8 calls and the chapter 1 monsters have them) | The kit stages (9, 10, 19 to 21) and the chapter animation plan (`claude/animation-chapter-plan.md`). A new move gets a clip by adding `anim:{kind:'clip',clip}` to its row. |
| Spoken lines for the built moves and the two spends, for the Voice Library (architecture risk 8) | With the kit stages; none added yet |
| Fight lengths: every chapter 1 fight is under its target with Leans, Pocket Skills, Traits and Quirks (5a to 5c results); The Big One's bite (stage 3) | The balance pass, stage 14. Tom will feel it first at milestone A. |
| The Ruckus gauge in a saved game (a save field, and the story fight starting with the saved value) | Stage 15. Until then the Lab keeps it on the phone only. |
| Story fights paying Vibe Points, the victory card, level and VP migration for existing saves | Stage 15 |
| A save first creating a late joiner's loadout when the story recruits them (the pool is built; the Lab and the pause menu use it) | Stage 15 |
| Chapter 1 story fights win by HP only: no Warmth bar, no WARMTH command, no "likes" list; kindness plays in the scene after a boss reaches 0 HP (Gemini chapter 1 report, row 1.2 "Win Condition & Enemy Bars", retired card c-gem-pillar-hp). Battle 3 already has none of these; battle 2 still shows them (`engine/battle2-ui.js`). Stage 15's chapter test checks no Warmth bar or WARMTH command appears in any chapter 1 fight, and no chapter 1 scene step reads a Warmth result (risk 3's reference list). | Stage 15 (chapter 1 switch); stage 23 deletes Kindness in battle |
| The simple player (`b3Auto`) rarely picks the second-Vibe shield and ally-buff Skills in short fights; fine for tests. Rose Mode's recommended move no longer uses it (stage 7 built `b3Recommend`) | Stage 14 only if the balance pass needs the simple player to match |
| Rose Mode icons are battle 2's emoji and pixel pictures plus a few new ones (`engine/b3-pictures.js`); a drawn set is not planned | Only if Tom asks |
| Tom's Cake and TNB's Kintsugi enchantments (Twin-Lamb Relay waits on them) | The stages that build those characters |
| Done 2026-11-18: the 210 kit lines sorted (`claude/battle-kit-ops.md`): 152 plain data, 33 data after one of 11 small general additions, 25 need their own function (12 of those in stage 9, 6 of them TNB's) | |

## Next conversation (stage 12)

Follows `claude/handoff-rules.md` (re-read right before writing the next version). Facts for stage 11 are in `claude/next-addendum-b3s11.md`; where it and this file differ, it wins until stage 12 folds it in.

| # | Item | |
|---|---|---|
| 1 | What it will do | Builds stage 12: the bestiary for chapters 5 to 7 with their bosses (`claude/bestiary-v11.md`, architecture section 5), and Lab fights for each formation and boss. Its `## b3s12` heading ends stage 12. |
| 2 | Before you paste | Nothing to do first. Milestone B is after stage 15. |
| 3 | Model | Claude Sonnet 5.5 (row C: the steps for the new boss mechanics are not written; the recipe from stage 11 is). |
| 4 | Effort level | High (three bosses with their own rules, nothing written to follow for those). |
| 5 | Prompt | `Read claude/battle-build.md and claude/next-addendum-b3s11.md, then build stage 12 (bestiary chapters 5 to 7 with their bosses) of the new battle system. You have my full permission to access the repo. Board card c-b3s12. Read its history first: my notes and answers are there. Your first push is the commit board: start c-b3s12 (it moves this card to In progress and links your conversation).` |

If a session fails stage 12 the same way twice (stop-loss), handoff rules step 4: effort up one step first, then Claude Opus 5.5.

Facts the next session needs (more in `docs/handoff/b3s11.md`):

- A boss mechanic is first tried as data (acts, `when`, `then` and `after`, status rows, effects ops); stage 11 needed only five small seams (see `docs/BATTLE3.md` "What stage 11 holds").
- Every wind-up act names its own follow-up in `after`; a boss with two dive or charge thresholds needs two copies of the follow-up.
- `b3Who` target keys from a monster's view: `foes` is the family, `allies` is every monster including itself, `otherAllies` excludes itself.
- A browser test that pokes a boss's HP to a threshold must raise its max HP too, or the boss dies in one round (`s11_run` in `tools/b3_test.py`).
- A Break can cancel a dive or a charge, so a screen test asserts on either act name.
- `console.error` is stubbed inside the sim vm: throw to see an error.
- Clips: unchanged from stage 8 (`docs/BATTLE3.md` "Clips in Battle 3"); chapter 2 to 4 monsters have none and use default animations.

Each stage ends by updating the stage board above, writing `docs/handoff/<tag>.md` in the repo, and updating item -8 in `claude/next.md`.
