# Battle 3 (the v11 battle system)

"Battle 3" is the code name of the new battle system. The player never sees the name. It is being built in stages beside the live battle ("battle 2", `docs/BATTLE_SYSTEM.md`) and replaces it only at the last stage. The design, the gap table and the 23-stage plan are in the Project: `claude/battle-architecture.md`. The rules are `claude/battle-spec-v11.md`, the enemies `claude/bestiary-v11.md`, the settled calls `claude/battle-v11-decisions.md`.

| Question | Answer |
|---|---|
| Where it is played today | ADMIN > BATTLE LAB > NEW BATTLE (first choice on every Lab page). Story fights still use battle 2. |
| Naming | Every Battle 3 global starts with `B3` or `b3`, every file with `b3-`. The game is classic scripts in one shared scope, so the prefix is what lets old and new load together. |
| The one structural rule | Rules first, pictures second. The rules work out the whole result of an action and return a list of beats. The play layer shows the beats. The rules never wait for an animation. |
| Stages built so far | Stage 1, the core loop (build `b3s1`). Stage 2 (build `b3s2`): statuses, caps, shields, healing, knock-outs and Pick-Me-Up, rows, aggro, the hook bus, wards, intercepts, hazards. Stage 3 (build `b3s3`): Composure pips, Break and Flustered, Marks, the full enemy act runner, counter acts, adds, the chapter 1 Elite and boss. Stage 4 (build `b3s4`): Vibes. Ranks and Vibe Points, Main and Pocket Vibe, two Quirk slots, Stat Leans, Portable Counters, the Vibes screen (pause menu and Battle Lab), the save fields, the Lab's Rank picker. What is in and what is not: the tables at the end. |
| Where the player sets Vibes | Pause menu > VIBES (the save's loadouts), and ADMIN > BATTLE LAB > NEW BATTLE > VIBES AND RANKS (the Lab's loadouts, kept on the device, with a Rank picker). It is one screen, `engine/b3-menu.js`. |

## Files

| Layer | File | Job |
|---|---|---|
| Rule numbers | `data/b3-rules.js` | Every number in spec sections 1 and 2, the flavors, the Detonation table, the level stat table |
| Statuses | `data/b3-status.js` | One row per status, buff, stance, mark and Prime (`B3_STATUS`), and the hazards (`B3_HAZARDS`) |
| Kits | `data/b3-kit-<id>.js` | Per character: the cast row (which Vibes), Vibe rows, move rows, the name and sentence of every Trait and Quirk, and `B3_SOON` names for Skills not written yet |
| Enemies | `data/b3-foes-ch<NN>.js` | Stat lines, acts, formations |
| Lab | `data/b3-lab.js`, `engine/b3-lab.js` | The NEW BATTLE fights and their list on the title screen |
| Rules (no drawing) | `engine/b3-core.js`, `b3-progress.js`, `b3-timeline.js`, `b3-hooks.js`, `b3-ops.js`, `b3-resolve.js`, `b3-foe.js` | Fight state and stat maths, Vibe Mastery (Ranks, Vibe Points, loadouts and what a loadout gives a unit), the tick clock, hooks, effect ops, one action from cost to beats, the enemy turn |
| Vibes screen and where loadouts are kept | `engine/b3-menu.js` | The Vibes screen (both doors), the save's two fields per member, the Lab's book on the device, Vibe Points on a Lab win |
| Play layer | `engine/b3-play.js` | Beats to pictures: default animations, numbers, the view the screen shows, Battle 3's own draw function |
| Screen | `engine/b3-ui.js` | Start and end, the turn flow, turn bar, party cards, command cross, lists, targeting, input |
| Check | `tools/b3-sim.js` (node), `tools/b3-check-s2.js`, `tools/b3-check-s3.js`, `tools/b3-check-s4.js`, `tools/b3_test.py` (browser) | Fights with no screen and the rule tests (stage 1's groups in `b3-sim.js`, one file per stage after that; `check` runs them all); fights and the Vibes screen on screen with contact sheets |

The seven rules files never touch the canvas, the page, a timer, battle 2 or the game's own party and monster objects. `tools/b3-sim.js` loads them into an empty sandbox, so a rules file that reaches for any of those fails there.

## Changing things

| To change | Edit | Engine edit |
|---|---|---|
| Any number (HP, power, Pep cost, percent, length, cap) | A `data/b3-*.js` row | No |
| What a move does, when existing ops cover it | Its `effects` list | No |
| An enemy's acts, Pet Peeves, Composure pips, formation | Its row in `data/b3-foes-ch<NN>.js`. Every act field (`hits`, `when`, `aim`, `then`, `after`, `grow`) is listed at the top of `data/b3-foes-ch01.js`; the order a foe picks in is at the top of `engine/b3-foe.js`. | No |
| A wind-up that is itself an act and Marks its target (Big Glare) | The wind-up row gets `then:'<follow-up id>'` and `effects:[{op:'mark'}]`; the follow-up row gets `after:'<wind-up id>'` and `hits:'marked'` | No |
| A counter act (it answers whoever hit the foe) | An act row with `hits:'attacker'`, `recovery:0` and a `when` (for example `{has:'<its stance>'}`) | No |
| A monster that calls adds | An act with `hits:'field'` and `effects:[{op:'summon',id,row,n}]`. An add has half its entry's HP and no pips (`B3_RULES.add`). | No |
| How many pips an action can take, how hard Flustered hits | `B3_RULES.composure` | No |
| A new kind of effect | A new op in `engine/b3-ops.js` (the full list is `B3_OP_LIST`; an op in the list with no function throws "not built yet") | Yes, small |
| A new moment to react to | `B3_HOOKS` in `engine/b3-hooks.js` | Yes, small |
| What a status or a hazard says in the list the player opens by tapping a unit | Its `desc` (and `short`, `color`) in `data/b3-status.js`. The data check fails a status with no `desc`. | No |
| A ward (an answer when hit) | A status row with `on:{afterHit:{carrier:'target', from:'foe', tags:[...], limit:'action', react:true, effects:[...]}}` | No |
| Who steps in for whom | A status row with `intercept:{reduce}`; the `intercept` op puts it on the allies | No |
| A Trait or a Quirk | Its row in `B3_TRAITS` or `B3_QUIRKS` (in the kit file). Every one has `id`, `vibe`, `name` and `desc` already (the Vibes screen shows them) and carries `soon:true`. To make one work: write `on` (a hook name), the listener fields at the top of `engine/b3-hooks.js` and `effects`, and delete `soon`. A unit carries its Main Vibe's Trait and its two equipped Quirks. | No |
| The VP a Rank needs, what each Rank unlocks, the Pocket Vibe's share of VP, the Rank the Lab starts at | `rankVp`, `rankUnlock`, `subtitleRank`, `pocketVp`, `labRank` in `data/b3-rules.js` | No |
| A Lean's bonus, or the row a Lean stands in by default | `leans` and `rowByLean` in `data/b3-rules.js` (the words the screen shows: `B3_LEANS`) | No |
| A new Vibe | A row in `B3_VIBES` (fields at the top of `data/b3-kit-tom.js`; `sig` 1 and 2 are the Main and Pocket on joining), its id in the owner's `B3_CAST[id].vibes`, rows for its Trait and two Quirks, a row for its Basic, and for each of its three Skills either a row in `B3_SKILLS` or a name in `B3_SOON`. The data check fails a Skill that is in both or in neither. | No |
| A Skill that was only a name becomes real | Write its `B3_SKILLS` row (its `slot` must be `s1`, `s2` or `cap` by its place in the Vibe's `skills`) and delete its line from `B3_SOON` | No |
| A Portable Counter (Oven Temp, Reps, Tally) | On the Vibe row: `counter:{id, name, max, on:'<hook>', n, carrier...}` (the listener fields of `engine/b3-hooks.js`: when it goes up). On each Skill that reads it: `counter:'<id>'`. A damage bonus that reads it: `bonus:{counter:'<id>', add:.10}`. It builds while the Vibe is Main, and while it is Pocket if a Skill that reads it is unlocked. | No |
| A condition for a move's damage bonus, or for one of its effects | `bonus:{if:'tookHit', add}` or `{if:'targetHas', ids, add}` (`B3_CONDS` in `engine/b3-resolve.js`); an effect with `when:'cleansed'` or `when:'stripped'` runs only if an earlier effect of the same move cleared something (`B3_EFFECT_WHEN` in `engine/b3-ops.js`) | Yes, small, for a new one |

An action's beats come in this order: `pre` (cost, set-up), one group per hit (`g` is the hit number), `post` (this is where `pips` and `break` land: Composure is paid once, when the action's own effects are done), then one group per reaction (`g` is `r0`, `r1`...: a ward's answer, played after the move that set it off), then `end` (what the turn's end wrote: statuses and shields running out, the new wait, the fight ending). A hazard's slip comes before the enemy's `act` beat.

A family member's loadout is one plain record, `{main, pocket, quirks:[a, b], vp:{<vibe id>: points}, row}` (`engine/b3-progress.js`). The Rank is worked out from the VP, never stored. `row` is `'front'`, `'back'` or `null` (by the Main Vibe's Lean). `b3FixLoadout(id, anything)` returns a valid one, which is how an old save, a broken save and a member whose kit arrived later all get fresh loadouts. A fight is given `loadouts:{<member id>: loadout}`; a member left out gets a fresh one with every Vibe at `rank` (1 when that is left out too). `b3Kit(id, loadout)` is what the unit gets: the Main Vibe's Trait, Basic, unlocked Skills and Lean, the Pocket Vibe's unlocked Skills, the two Quirks. `plain:true` in the cfg is for the rule tests of stages 1 to 3 only: the bare unit they were written against (first Vibe, Skill 1 and Skill 2, no Lean, no Pocket Vibe, no Trait).

A fight is one plain object `F` from `b3NewFight(cfg)`. `b3Next(F)` moves the clock to the next turn, `b3Act(F,unit,skillId,targetKey)` and `b3FoeTurn(F,unit)` resolve an action. Each returns beats (the list at the top of `engine/b3-resolve.js`). Random numbers come from the fight's seed, so the same seed replays the same fight in the simulator and on screen.

## Where it meets the rest of the game

| Place | What |
|---|---|
| `battle.v3` | Set while a Battle 3 fight runs (`battle.v2` is battle 2's). |
| `engine/battle.js` `updateBattle` | Calls `b3Update(dt)` |
| `engine/battle-draw.js` `drawBattle` | Hands the frame to `b3Draw()`. Battle 3 draws its own party and enemies: battle 2's party drawing reads battle 2 state in a dozen places (architecture risk 2). |
| `engine/draw.js`, `engine/main.js` | Keys and gamepad go to `b3Key` and `b3Pad` |
| `engine/painted.js` `paintedWanted` | Loads the painted sheets a Battle 3 fight needs |
| `engine/splash.js` | NEW BATTLE on the Lab pages; `engine/b3-lab.js` adds the `lab3` list. The title screen's key handler stands aside while the Vibes screen is open (`B3V.open`). |
| `engine/menu.js` | The pause menu's VIBES command. It is not a tab: it calls `b3vOpen('menu')`, which opens the Vibes screen over the menu. |
| `engine/main.js` `pollGamepad` | Hands the gamepad to `b3vPad` while the Vibes screen is open |
| `saveSnapshot`, `loadGame` | Wrapped at the top of `engine/b3-menu.js` (the way `engine/bench.js` wraps them): every member with a kit is saved with `vibes` ({main, pocket, quirks, vp}) and `row`; on load every member's loadout is rebuilt from the save, or fresh when the save has none. No old field is removed. |
| `localStorage` `aot-b3-lab` | The Battle Lab's book of loadouts (`b3LabBook`, `b3LabSave`, `b3LabReset`). Not part of any save. |
| `index.html` | `#b3-bar` and `#b3-ui`, with the same layout classes as battle 2 (`.b2-ribbon`, `.b2-ui`, `.b2-party`, `.b2-cmd`), so portrait, landscape and tablet sizes are shared. `#battle` carries both `v2` (the shared layout) and `v3` during a Battle 3 fight. |

Helpers Battle 3 borrows from battle 2 files (the purge stage must move or rename them, not delete them): `b2Meter`, `B2_METER`, `b2MeterTag`, `b2BattleDef`, `b2CanvasPt`, `b2Esc`, `b2Portrait`, `b2Thumb`, the `.b2-*` layout classes and `.b7-tools`, `b7FoeHp`, `b7Taken`, `b7FoeSpeed`, `b7ToggleSpeed`, `B7.speed`.

## Testing

```
node tools/b3-sim.js check            # data check and rule tests: FAILS: []   (tools/smoke.py runs this too)
node tools/b3-sim.js new1 200         # 200 fights with the simple player: wins, rounds to win, knock-outs, errors
node tools/b3-sim.js new2 1 --seed=7 --log
node tools/b3-sim.js new6 300 --support=4   # every 4th action of each family member is a move that deals no damage, if they have one
python3 tools/b3_test.py              # every NEW BATTLE fight on screen, portrait and landscape; sheets in tools/shots/b3-*.png
python3 tools/b3_test.py s3           # only the stage 3 section (The Big One: pips, Mark, Break, adds), about 5 minutes
python3 tools/b3_test.py s4           # only the stage 4 section (the Vibes screen from both doors, Ranks, the save fields), about 2 minutes
node tools/b3-sim.js new6 300 --rank=1            # every Vibe at Rank 1 (left out: 2, the Rank the Lab starts at)
node tools/b3-sim.js new6 300 --swap=tom,rose     # those members fight with their second Sig Vibe as Main (--swap=all: everyone)
```

The rule tests of stages 1 to 3 run with `plain:true` (the wrappers at the top of `check()` in `tools/b3-sim.js` and of the two older check files), so their numbers are what they were before Leans and Pocket Vibes existed. `tools/b3-check-s4.js` tests real loadouts. A later stage's file should use real loadouts too.

The screen test starts every fight from the Lab's fresh loadouts (`b3LabReset()` inside `start()`), so Vibe Points won by one test fight never change the next; the simulator's `cfgFor` builds the same loadouts, which is why the two still agree turn for turn.

The simple player attacks whenever attacking scores higher, which is nearly always. The bestiary's boss HP model (its section 1.6) assumes about one action in four is a support move, so a boss is measured both ways: plain, and with `--support=4`.

`tools/b3_test.py` plays each fight by hand through the real screen (keys and taps), checks that Windex Spritz then a Clobber hit shows Hydro-Slip!, compares the on-screen turn order with the simulator for the same seed, plays a fight to the lose screen, and checks a battle 2 fight still owns its screen afterwards. On the Pond Grump fight it also runs the stage 2 moves (section 5 in the file's header): there it aims the monsters with pokes (a test taunt, `actIx`) so every run shows a slip, a ward's answer, an intercept, an interrupt and a revive. On The Big One it also runs the stage 3 section (section 6 in the file's header): it pokes the boss into Big Glare at Rose three times and answers it three ways (Tom's Suite Door Slide takes the bite, Crunchy Sugar-Cube Pop cancels it, a Break cancels it), tops the boss's pips up between family turns so a Break only comes when the test wants one, and calls two Mudlings and a Skeeter Swarm in as adds. All six fights take about 25 minutes; one fight: `python3 tools/b3_test.py new3`. Look at the sheets before pushing.

Gotcha for any test that drives the SKILLS list with the keys: move the mouse off the list first (`pg.mouse.move(2,2)`). A mouse left resting over a row moves the cursor to that row every time the list is redrawn.

## What stage 4 holds, and what waits

| In (build `b3s4`) | Waits for |
|---|---|
| Ranks 1 to 5 from Vibe Points (0, 60, 220, 450, 800). Rank 1: Trait, Basic, Skill 1. Rank 2: Skill 2. Rank 3: Quirk A. Rank 4: the Grand Capstone. Rank 5: Quirk B. Three Subtitles, changing at Ranks 3 and 5. | Casual Mode (stages 19 to 21) |
| Vibe Points after a fight (`b3AwardVp`, `b3AwardAll`): the Main Vibe earns all of it, the Pocket Vibe half (rounded up), everyone earns. Overflow: a mastered Vibe's share, and what is left over when a Vibe reaches mastery, go to that member's lowest unmastered Vibe; with all mastered it is lost. | Story fights paying VP, the victory card (stage 15). Late joiners' VP pool (first late joiner: stage 9). The spec's "scale VP per fight so a chapter pays about 90" (stage 15). |
| The four slots: Main Vibe, Pocket Vibe, two Quirks from any of that member's own Vibes. Picking the Pocket Vibe as Main trades the two. A Quirk picked for the other slot moves there, or trades. | Rose Mode's automatic loadouts (stage 7) |
| What the slots give in a fight: the Main Vibe's Basic, Trait, unlocked Skills and Lean; the Pocket Vibe's unlocked Skills (listed after the Main Vibe's, tagged POCKET in the SKILLS list). | A third Vibe per character (stages 19 to 21). The screen and the rules already handle three; a test Vibe proves it. |
| Stat Leans, Main Vibe only: Guard +15% Max HP and Defense, Striker +15% Attack, Tempo +15% Speed, Support +15% heals and shields given. A Lean is its own kind of bonus, so it multiplies with buffs. | |
| Rows the player chooses (FRONT or BACK on the Vibes screen; by Lean when not chosen; at least one in Front). The battle shows BACK on the card and stands that member a little further from the monsters. | |
| Portable Counters: the mechanism (a Vibe's `counter` rule, carried by the Main Vibe, and by the Pocket Vibe when a Skill that reads it is unlocked; a damage bonus that reads it; its name in the list a tap opens; its number on the portrait). Tested with a test Vibe. | The first real one: Amy's Reps (stage 10). Tom's Oven Temp is in his third Vibe. |
| The second Sig Vibes as rows (Gamer Geek, Craft Artist, Cozy Rosie, Registered Nut), their four Basics, and three Skill 1s: Controller Toss, Open-String Violin Screech, Deedee Makes It Better. | Rose's Tattered Lamby Boomerang (it needs the `later` op and a call on when the free tackle lands), all four Skill 2s, the eight Capstones, and making the 8 Traits and 16 Quirks work (stage 5). Cartridge Blow's "shows the enemy's next target" (a custom line, stage 5). |
| Names and sentences for the 8 Traits and 16 Quirks of these eight Vibes (`soon:true`: shown on the Vibes screen, not working yet) and `B3_SOON` names for the 13 Skills with no row yet. | |
| New small general pieces: target kind `family` (anyone in the family, the user included), effect target `lowestAlly`, the condition `tookHit`, an effect's `when`, a unit's own `mods`. | |
| The Vibes screen: family tabs, one card per Vibe (role, Rank stars, Subtitle, Lean, VP bar, the ladder of what each Rank unlocks with a tap to read any of it), MAKE MAIN and MAKE POCKET, the two Quirk slots with a picker, FRONT and BACK. Touch, keys, gamepad. Portrait is one column, landscape two. | Rose Mode pictures for it (stage 7) |
| Saves: two new fields per member, `vibes` and `row`. Old saves load with fresh loadouts; nothing is removed. | Level and VP migration for existing saves (stage 15) |
| The Battle Lab: its own loadouts on the device, a Rank picker (every Vibe of all four at Rank 1 to 5), Vibe Points paid on a win and said on the win screen. A change made on the pause menu's screen is copied to the Lab (Main, Pocket, row), so the pause menu drives Lab fights too. | |

Simulator, 300 fights each with the simple player, level 2 party of Grace, Tom, Rose and Deedee with fresh loadouts at Rank 2 (first Sig Vibe as Main, second in the Pocket), against stage 3's numbers for the bare units:

| Fight | Stage 3 (no Leans, no Pocket) | Stage 4, Rank 2 | Rank 1 | Second Sig Vibes as Main |
|---|---|---|---|---|
| Two Mudlings | 1.85 rounds | 1.19 | 1.26 | 1.15 |
| Mudling and Skeeter Swarm | 1.90 | 1.28 | 1.67 | 1.19 |
| Pond Grump and Mudling | 2.60 | 1.89 | 2.03 | 1.90 |
| Bog Toad and Skeeter Swarm | 2.25 | 2.13 | 2.51 | 1.56 |
| Log Lump and Skeeter Swarm | 3.28 (3.78 with `--support=4`) | 3.07 (3.16) | 3.71 | 2.81 |
| The Big One | 4.89 (5.64) | 4.25 (5.04) | 5.38 | 3.84 |

Every fight was won with no knock-outs and no errors; the family ends with 92% to 99% of its HP. Facts for the balance pass (stage 14): Leans and Pocket Skills make the chapter 1 fights 5% to 35% shorter, and The Big One now sits under its 5 to 7 round target unless a quarter of the actions are support. Grace's Open-String Violin Screech does much of it: Racket is a Pet Peeve of the Mudling, the Skeeter Swarm and The Big One, and the Screech hits every monster for 3 Pep (735 uses in 300 boss fights, more than any other Skill). Nothing was changed: enemy HP belongs to the balance pass.

Calls made in stage 4 (all in data or one line of rules; none confirmed by Tom): half of an odd VP number rounds up for the Pocket Vibe; "lowest unmastered Vibe" is the one with the fewest VP (the first listed on a tie); VP left over when a Vibe reaches mastery spills to the lowest unmastered Vibe too; the Lab starts at Rank 2 and a Lab win pays VP; a choice made on the pause menu's Vibes screen is copied to the Lab; the pause menu lists the party only (not the bench); Pocket Pretzel & Pat can feed Rose herself; Deedee Makes It Better is the standard heal (20%), can be used on herself, and its Attack bonus lasts 2 turns; Controller Toss counts a hit a shield soaked whole and a hit taken for someone else as "took or blocked", and not a burn tick; Cartridge Blow is only the hit for now; a Trait or Quirk that is not written yet is shown with its sentence and marked SOON rather than hidden; the Back row is drawn 14 pixels further from the monsters.

## What stage 3 holds, and what waits

| In (build `b3s3`) | Waits for |
|---|---|
| Composure (spec 2.7): a ledger per foe per action. A Pet Peeve hit is 1 pip per action, a Detonation takes its row's pips, a printed number (`composure` on a Skill, the `composure` op) is added. Paid once at the end of the action, 3 pips at most (`c.pipCap` 4 for a Full Family Ruckus). | Family Ruckus itself (stage 6). Pips a boss loses when a helper is knocked out (chapters 6, 13, 15, 20). |
| Break: the foe is Flustered (`flustered` status, 35% more damage, no pushes, until its next turn begins). It loses a wound-up act, its Mark and any stance, and goes behind every unit due inside the next 100 ticks. Pips refill as its next turn begins and stay locked until that turn ends. That turn cannot be lost to a Stun. | The +15% Ruckus for a Break (stage 6). Traits and Quirks that listen to `pipsShaved` and `break` (stage 5 on): the hooks fire now. |
| Wind-ups: a `charge_up` act is announced one turn and fires the next (stage 1). New: an act with `then` is itself the wind-up (Big Glare lands, Marks, and Swamp Chomp fires next turn). | The last boss's count that only a Break stops (chapter 20). |
| Mark (bestiary 1.1): on the foe (`mark` = the ally's key), not a status. Ends when the follow-up fires or is cancelled; an intercept redirects the follow-up; a hidden Marked ally makes it miss; a knocked-out one sends it to a new target. | |
| The act runner: `when` with everyTurn, everyRound, waitRounds, once, hpBelow, hpAbove, stripped, has, lacks, notSameAllyTurns. `hits`: one, all, self, marked, attacker, two_random, two_adjacent (with `grow`), fastest, foes, field. `aim:'back'`. | Phases and phase lines (chapter 20). Stance-swapping Pet Peeves (chapter 17). Enemy acts that trade the family's rows (chapter 11). |
| Counter acts (`hits:'attacker'`): answer once per ally action, Recovery 0, not while Flustered. Tested with a test row; the first real one is Points Off (chapter 5). | |
| Adds (`summon` op): half HP, 0 pips, the arriving wait, 3 in Front and 2 in Back at most, letters and slots renumbered. On screen an add fades in between the caller and the family. Tested with a test row and a poke; the first real caller is Old Iron-Gill (chapter 3). | Helper links ("while it stands the boss takes X% less") and feedback (chapters 13, 15, 20). |
| Boss HP by party size (`hp3`, `hp4` on the foe row) | |
| Log Lump and The Big One, formations `log` and `bigone`, Lab fights NEW 5 and NEW 6. Statuses `mossy_brace`, `muffin_crown`. | |
| Screen: pips under an Elite's or a Boss's HP meter; BREAK!, the slumped monster with stars, its tipped face and BREAK badge on the turn bar; MARKED over the family member and on their card; Composure, the wind-up and the Mark in the lists a tap opens; pips in the target list | Pet Peeve and Resist icons once seen, preview of the pips a move would take (stage 7) |
| Ops built now: mark, summon (and composure pays out) | steal, invert, swapBar, ruckus, ward as its own op, grant, aggro, taunt, pullForward, detonateAll, later, row |
| The simple player values pips, the pip that Breaks, and stepping in for a Marked neighbour. `b3Auto(F,u,only)` can be narrowed to some moves. | |

Simulator, 300 fights each, level 2 party of Grace, Tom, Rose and Deedee: Log Lump with a Skeeter Swarm 3.28 rounds (3.78 with `--support=4`), 0.57 Breaks a fight. The Big One 4.89 rounds (5.64 with `--support=4`), 1 Break a fight, about 10 pips shaved. All won, no knock-outs, the family ends with 86% to 91% of its HP. The stage's target for The Big One was 5 to 7 rounds: it is met with support moves and missed by 0.1 without them. Nothing was changed: the bestiary's model gives 6 rounds by assuming a quarter of actions are support, and enemy HP belongs to the balance pass (stage 14). For that pass: 462 HP (10% more) gives 5.24 rounds attacking only, and The Big One gets only about 5 turns in the whole fight (Speed 96, long Recoveries, Drenched and pushes on top).

Calls made in stage 3 (all in data or one line of rules; none confirmed by Tom): a ward's answer and a slip on the wet floor each have their own 3-pip cap (an answer is not part of the action it answers); burn and Bleed ticks never take a pip; a splash in a Pet Peeve flavor counts as a Pet Peeve hit; the fall-back on a Break counts the breaker's own coming wait among "every unit waiting inside the next 100 ticks"; pips show empty while Flustered and refill as its next turn begins; a Break that comes on the foe's own turn before it acts (a slip) costs it that act; Big Glare is the wind-up turn of Swamp Chomp (glare one turn, bite the next), not an act announced a turn earlier; with nobody in the Back row Big Glare picks by aggro, and the Lab party all stand in Front (their Vibes' Leans); the Mark stays on the one the glare was aimed at even when Tom stepped in for the glare, and a taunt does not move the bite off them; a once-in-the-fight act that is cancelled does not come back; a counter act is not redirected by Suite Door Slide; "below 50% HP" includes exactly 50%; the Muffin-Tin Crown is one buff (its Attack and its Mend come off together), and its Mend can lift The Big One back over half HP, which delays Muddy Belly-Flop; a Stun on a Flustered Elite is spent without costing the turn it is owed.

## What stage 2 holds, and what waits

| In (build `b3s2`) | Waits for |
|---|---|
| Statuses: Stun (a lost turn, or 30 ticks on a Boss), Bleed, Mend, plus the kit rows; every row has a sentence for the player | The enemy-only statuses of chapters 2 on (each arrives with its chapter) |
| Shields: soak before HP, 40% of Max HP in total, 3 turns, a fully soaked enemy hit leaves no status. Healing by share of Max HP, `healGiven`. | A kit Skill that gives a shield or a heal (none in the four first Sig Vibes' Skill 1 and 2). The ops are tested with test rows. |
| Knock-out, Pick-Me-Up (4 Pep, 25% HP, back on the bar 100 ticks out), standing up at 1 HP after a win | |
| Party rows (default by Lean, `rows` in the fight's cfg, at least 1 in Front), Back row weighs 60, taunt flag, untargetable flag | A way for the player to choose rows (the Vibes menu, stage 4). Enemy Taunt on a family member (chapter 5). |
| The hook bus: statuses and passives listen, with `limit` (action, round, battle) and reactions that run after the action | The Trait and Quirk rows themselves (stage 5) |
| Wards (Zone One Blockade), intercepts (Suite Door Slide, +1 Pep per enemy action), hazards (Wet-Floor Hazard), interrupts (Crunchy Sugar-Cube Pop) | |
| Ops built: damage (also with its own power, for answers and falls), status, prime, intercept, strip (n or all), cleanse, heal, shield, revive, push, pull, place, pep, interrupt, hazard, counter, crack, composure, splash | See the stage 3 table |
| Skill 1 and Skill 2 of Frequent Flier, Squishy Collector, Sugar Rush and Neat Freak | Their Capstones, Traits and Quirks (stage 5) |
| Pond Grump and Bog Toad, formations `grump` and `toad`, Lab fights NEW 3 and NEW 4 | |
| The full list on tap: a party card or a monster, while the cross or the SKILLS list is up (keys: I, up and down, Esc) | Preview, Pet Peeves in the list, gamepad for the list (stage 7) |
| The simple player scores wards, hazards, intercepts, interrupts and revives in "damage worth" | |

Simulator, 300 fights each with the simple player, level 2 party: two Mudlings 1.85 rounds, Mudling and Skeeter Swarm 1.90, Pond Grump and Mudling 2.60, Bog Toad and Skeeter Swarm 2.25. The stage's target was 2 to 4. The first two are just under it with the bestiary's printed HP (its own model, section 1.6, gives 1.6 and 1.9 for them); nothing was changed, the balance pass (stage 14) owns enemy HP.

Calls made in stage 2 (all in data): Zone One Blockade's answer is a standard Clobber hit, once per enemy action; an answer or a fall can set off a Detonation like any hit; Suite Door Slide covers the neighbours Tom has when he uses it, for 2 of their turns; Crunchy Sugar-Cube Pop is a light hit; "Giddyup, Tata!" Launch is Sizzle then Clobber, heavy in total, and the ally who gets +20% Attack (2 turns) is the next family member due on the bar; Wet-Floor Hazard catches acts tagged melee, its fall is a light Clobber hit, and it dries after 3 rounds; the Scrub's +25% per buff is added to its own Clobber hit; a two-flavor move leaves only its first flavor's Prime (spec 2.5, enforced now); a revived member waits 100 x 100 / Speed ticks; Pick-Me-Up uses a Skill's Recovery; the Lab party stands Grace, Tom, Rose, Deedee so Tom has two neighbours.

## What stage 1 holds, and what waits

| In (build `b3s1`) | Waits for |
|---|---|
| Tick timeline, Recovery, 100-tick rounds, push, pull and place with halving, the forecast | Granted actions (stage 5) |
| Pep 0 to 10, start 4, Basic +2, the +3 a round refund cap | Cost discounts (stage 5) |
| Damage formula, power tiers, the all-foes 70% rule, Pet Peeve and Resist, crits, Evasion, accuracy penalties, Back row | Shields, healing, the full caps test file (stage 2) |
| The 3 Primes and the 6 Detonations (rule tests set off every one) | Ruckus gains (stage 6) |
| Statuses with same-kind-adds and different-kinds-multiply, 13 rows | The rest of the status table, the 3-icon full list on tap (stage 2) |
| Enemy turn: printed-order cycle, "every Nth turn", charge_up telegraphs, aim by aggro weight | Phases (chapter 20) |
| Tom, Grace, Rose, Deedee: the Basic of their first Sig Vibe; NeeDoh Stretch Pass; The Floor Is Lava! | Stat Leans and ranks (stage 4), Traits and Quirks (stage 5), everything else in the kits |
| Mudling and Skeeter Swarm, formations `mudling` and `skeeter` | |
| Turn bar with round dividers, a ghost for the highlighted move and sliding faces; party cards with 10 Pep dots; the new cross (RUCKUS and BAG greyed); tap an enemy or a party card to aim; keys and gamepad | Preview, inspect, Rose Mode pictures (stage 7) |
| Default animations by shape (strike, cast, throw, give), hit and knock-out looks from existing frames, win and lose | Body-state table finished, clips, enemy hold (stage 8); spoken lines for the new moves (none exist yet); the victory card and rewards (stage 15) |

Pace: `B3_TEMPO` in `engine/b3-play.js` stretches every default move animation (2 since `b3tempo1`: Tom found the first build about 2x too fast).

Calls made in stage 1 (all in data, all changeable without engine edits): a multi-hit move's power is the whole move's power shared by its hits; an enemy's announce turn uses Base Recovery 80; "every 3rd turn" starts counting again after the act fires; a status put on yourself during your own turn does not count that turn; a turn's wait is set before its statuses count down, so a 2-turn Slow slows two Recoveries; Short Circuit!'s splash is 40% of the hit that set it off; NeeDoh Stretch Pass puts the ally at the very front of the bar; Buzz Cloud comes up only after Jitterflight was stripped, not when it runs out.

## Clips: facts for stage 8 (from the animation test, build `clippack1`, 2026-11-18)

Three approved clips exist and play only in battle 2's Battle Lab clip fights (`B2.labClip`): `rose_boop` (strike), `rose_sleep` (state: out of the fight), `mudling_idle` (loop). The animation thread adds no more battle 2 wiring; clips enter this system here, through `B3_BODY` and a move's `anim` (architecture 2.7).

| Fact | Detail |
|---|---|
| What is reusable as it stands | `engine/clips.js`: `bclipDefine`, `BCLIPS`, `bclipFrameAt`, `bclipLoopFrame` (forward, then backward), `bclipReady`. A clip frame is an ordinary painted frame (`drawSprite` draws it at the owner's own scale), tagged `rows._clip`, with its feet in `rows._ft`. |
| What is battle 2 only | `bclipWanted`, `bclipFor`, `bclipLabNap` and `RFX.ST.clip` all check `B2`. Battle 3 needs its own "which clips does this fight want" (the `paintedWanted` line for B3 in `engine/painted.js` is the place). |
| Memory, measured | One clip is about 10 MB in phone memory (Boop 11.5, nap 9.7, Mudling idle 10.1) since frames are trimmed and packed. Loading every clip of 4 party members and their equipped moves (about 60) would be about 600 MB: a phone cannot hold that. Load a move's clip when the move is picked and release it after the action; keep only the idle loops loaded for the whole fight. |
| Frame copies | `paintedCanvas` keeps a full-frame canvas copy of each drawn frame, capped at 24 million pixels in all (`PAINTED_PX_CAP`); one clip frame is about 160 thousand pixels, so about 4 clips fill the cap and older copies are remade when drawn again. |
| A monster whose idle is a clip | Its hurt and attack pictures are still the painted frames, so the look switches for a moment (seen in battle 2's Lab). Either hold the clip's current picture with the engine's shake and flash, or give that monster an attack clip. Not decided. |

