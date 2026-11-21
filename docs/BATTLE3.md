# Battle 3 (the v11 battle system)

"Battle 3" is the code name of the new battle system. The player never sees the name. It is being built in stages beside the live battle ("battle 2", `docs/BATTLE_SYSTEM.md`) and replaces it only at the last stage. The design, the gap table and the 23-stage plan are in the Project: `claude/battle-architecture.md`. The rules are `claude/battle-spec-v11.md`, the enemies `claude/bestiary-v11.md`, the settled calls `claude/battle-v11-decisions.md`.

| Question | Answer |
|---|---|
| Where it is played today | ADMIN > BATTLE LAB > NEW BATTLE (first choice on every Lab page). Story fights still use battle 2. |
| Naming | Every Battle 3 global starts with `B3` or `b3`, every file with `b3-`. The game is classic scripts in one shared scope, so the prefix is what lets old and new load together. |
| The one structural rule | Rules first, pictures second. The rules work out the whole result of an action and return a list of beats. The play layer shows the beats. The rules never wait for an animation. |
| Stages built so far | Stage 1, the core loop (build `b3s1`). Stage 2 (build `b3s2`): statuses, caps, shields, healing, knock-outs and Pick-Me-Up, rows, aggro, the hook bus, wards, intercepts, hazards. Stage 3 (build `b3s3`): Composure pips, Break and Flustered, Marks, the full enemy act runner, counter acts, adds, the chapter 1 Elite and boss. Stage 4 (build `b3s4`): Vibes. Ranks and Vibe Points, Main and Pocket Vibe, two Quirk slots, Stat Leans, Portable Counters, the Vibes screen (pause menu and Battle Lab), the save fields, the Lab's Rank picker. Stage 5a (build `b3s5a`): the Traits, both Quirks and the Grand Capstones of the four first Sig Vibes (Frequent Flier, Squishy Collector, Sugar Rush, Neat Freak), with the free Skill (a granted action), taunts, the Family Ruckus count and the first one-off rule. Stage 5b (build `b3s5b`): Tom's Gamer Geek and Grace's Craft Artist complete (2 Skill 2s, 2 Capstones, 2 Traits, 4 Quirks, Cartridge Blow's foresee, Double Coat). Stage 6 (build `b3s6`): the Family Ruckus (gauge gains, Double Team, Full Family Ruckus, the RUCKUS button). Stage 5c (build `b3s5c`): Rose's Cozy Rosie and Deedee's Registered Nut complete (the `later` op, Skill `cooldown`, immunity, shield from overheal, survive at 1 HP, shield mods). All eight Sig Vibes are done. Stage 9b (build `b3s9b`): TNB's Ceramicist and Longboarder complete (clay shields, the Grand Amphora vessel, six pieces of new rule). What is in and what is not: the tables at the end. |
| Where the player sets Vibes | Pause menu > VIBES (the save's loadouts), and ADMIN > BATTLE LAB > NEW BATTLE > VIBES AND RANKS (the Lab's loadouts, kept on the device, with a Rank picker). It is one screen, `engine/b3-menu.js`. |

## Files

| Layer | File | Job |
|---|---|---|
| Rule numbers | `data/b3-rules.js` | Every number in spec sections 1 and 2, the flavors, the Detonation table, the level stat table |
| Statuses | `data/b3-status.js` | One row per status, buff, stance, mark and Prime (`B3_STATUS`), and the hazards (`B3_HAZARDS`) |
| Kits | `data/b3-kit-<id>.js` | Per character: the cast row (which Vibes), Vibe rows, move rows, the name and sentence of every Trait and Quirk, and `B3_SOON` names for Skills not written yet |
| Enemies | `data/b3-foes-ch<NN>.js` | Stat lines, acts, formations |
| Lab | `data/b3-lab.js`, `engine/b3-lab.js` | The NEW BATTLE fights and their list on the title screen |
| Rules (no drawing) | `engine/b3-core.js`, `b3-progress.js`, `b3-timeline.js`, `b3-hooks.js`, `b3-ops.js`, `b3-custom.js`, `b3-resolve.js`, `b3-foe.js` | Fight state and stat maths, Vibe Mastery (Ranks, Vibe Points, loadouts and what a loadout gives a unit), the tick clock, hooks, effect ops, the one-off rules a kit line needs when data cannot say it (one so far: Twin-Lamb Relay), one action from cost to beats, the enemy turn |
| Vibes screen and where loadouts are kept | `engine/b3-menu.js` | The Vibes screen (both doors), the save's two fields per member, the Lab's book on the device, Vibe Points on a Lab win |
| Play layer | `engine/b3-play.js` | Beats to pictures: default animations, numbers, the view the screen shows, Battle 3's own draw function |
| Preview and recommendation (no drawing) | `engine/b3-preview.js` | `b3Clone` (a safe copy of a fight), `b3Matchups`, `b3Preview` (a move played on a copy, nothing real changes, never rolls luck), `b3PreviewValue`, `b3Recommend` (the move that glows) |
| Rose Mode pictures | `engine/b3-pictures.js` | Pictures for the cross, the lists, the info list, the preview box and the Vibes screen; reuses battle 2's `bp*` helpers and CSS. Words versions stay in `b3-ui.js` and are used when Rose Mode is off |
| Screen | `engine/b3-ui.js` | Start and end, the turn flow, turn bar, party cards, command cross, lists, targeting, input |
| Check | `tools/b3-sim.js` (node), `tools/b3-check-s2.js`, `tools/b3-check-s3.js`, `tools/b3-check-s4.js`, `tools/b3-check-s5.js`, `tools/b3-check-s9b.js`, `tools/b3_test.py` (browser) | Fights with no screen and the rule tests (stage 1's groups in `b3-sim.js`, one file per stage after that; `check` runs them all); fights and the Vibes screen on screen with contact sheets |

The eight rules files never touch the canvas, the page, a timer, battle 2 or the game's own party and monster objects. `tools/b3-sim.js` loads them into an empty sandbox, so a rules file that reaches for any of those fails there.

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
| A Trait or a Quirk | Its row in `B3_TRAITS` or `B3_QUIRKS` (in the kit file). Every one has `id`, `vibe`, `name` and `desc` (the Vibes screen shows them); one whose rule is not written carries `soon:true` (the second Sig Vibes, until stage 5b). A working row is any mix of: one listener (`on`, the listener fields at the top of `engine/b3-hooks.js`, `effects`), several listeners (`listen:[{on, ...}, ...]`), `mods` (next row), a counter of its own (`counter:{id, name, max}`), and a one-off rule (`custom:'<name>'`, numbers in `n`). `show:true` on a listener makes the screen name the Trait or Quirk over its holder when it goes off. A unit carries its Main Vibe's Trait and its two equipped Quirks. | No |
| When a listener goes off | Its fields: `carrier` (the holder must be the event's `source` or `target`), `from:'foe'`, `by:'otherAlly'`, `tags`, `limit` (`action`, `round`, `battle`), and the conditions `ids` (the Prime or status the event is about), `flavor`, `multiHit` (a move that hits more than once), `landed:N` (the action has landed N hits), `targetPrime:'<prime>'` (the target carries it, or this action set it off). `react:true` runs the effects as the holder's own small action after the action that set it off; `quiet:true` says that answer is not a counterattack. | Yes, small, for a new condition (`b3ListenOk`, and its name in `B3_LISTEN_IF`) |
| A bonus or a cut that only counts sometimes | A mod with `when`, on a status row or in a Trait's or Quirk's `mods`: `{stat, kind, v, when:{...}}`. Built conditions (`B3_MOD_WHEN` in `engine/b3-core.js`): `flavor`, `notBasic`, `by:'otherAlly'`, `steppingIn:<share of HP>`, `allySkill`. `per:{counter:'<id>', spend:true}` counts `v` once per point of a counter and empties it when that action ends. The stat `moveRec` changes the Base Recovery of the move being used (`b3MoveRec`). | Yes, small, for a new condition (`b3ModWhen`) |
| A free Skill for someone (a granted action) | An effect `{op:'grant', maxPep, free:true, to:'target'}`. The rules open the door in `F.grant`; the screen (`b3AfterAct` in `engine/b3-ui.js`) or the simulator asks that member to pick and calls `b3Act` for them, which then sets no wait and counts no turn. One per member per round (`B3_RULES.grantedPerRound`). | No |
| A taunt ("locks aggro") | A status row with `flags:['taunt']` and an effect `{op:'taunt', id:'<that status>', to:'self'}` | No |
| The Family Ruckus gauge | `F.ruckus` (0 to 100; `cfg.ruckus` is what a fight starts with). The `ruckus` op adds to it. Gains, spends and the screen are stage 6 (`engine/b3-ruckus.js`; the RUCKUS button is the bar; the Lab keeps it in localStorage `aot-b3-ruckus`; a saved game keeps it from stage 15). | No |
| A Quirk that gives the whole family a mod | `allyMods:[{stat, kind, v, when}]` on the Quirk row (Coaster Policy); every family member carries them from the fight's start |
| A mod that counts only for a Basic, or only while the holder has a shield | `when:{basic:true}` or `when:{shielded:true}` |
| A Skill with its own Base Recovery | `rec:<ticks>` on the Skill row (Longboard Push & Carve, 72); `b3MoveRec` uses it instead of the slot's number |
| A shield that is clay, a vessel on the family's floor | The shield op's `clay:true`; a hazard row with `vessel:true` (`engine/b3-custom.js`) |
| A hazard of the family's own | `side:'own'` on the hazard row (it lays on the side of whoever sets it down); a family strip never clears one |
| A kit line data cannot say | A named function in `engine/b3-custom.js`, its name in `B3_CUSTOM`, switched on by `custom:'<name>'` on the Trait or Quirk row with its numbers in `n`. Say in the file's comment exactly what it does and which seams call it. | Yes |
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
python3 tools/b3_test.py s7           # only the stage 7 section (Rose Mode: pictures, preview, the star, keys and pad, the Vibes screen; portrait then landscape), about 3 minutes
python3 tools/b3_test.py s6           # only the stage 6 section (RUCKUS button fill, the list, Double Team, Full), about 2 minutes
python3 tools/b3_test.py s5c          # only the stage 5c section (Cozy Rosie and Registered Nut on The Big One, FORT, JACKET, LAMBY OUT), about 2 minutes
python3 tools/b3_test.py s5b          # only the stage 5b section (Gamer Geek and Craft Artist on The Big One, NEXT TARGET, BUZZING, GLUE), about 2 minutes
python3 tools/b3_test.py s5           # only the stage 5a section (Rank 5 on The Big One: the four Capstones, the free Skill, Traits and Quirks), about 3 minutes
node tools/b3-sim.js new6 300 --rank=1            # every Vibe at Rank 1 (left out: 2, the Rank the Lab starts at)
node tools/b3-sim.js new6 300 --swap=tom,rose     # those members fight with their second Sig Vibe as Main (--swap=all: everyone)
node tools/b3-sim.js new6 300 --rank=5            # the simulator fills both Quirk slots with what the Rank unlocks and is written (--quirks=none: empty slots)
node tools/b3-sim.js new6 300 --rank=5 --rec          # the recommended-move player (b3Recommend) plays instead of the simple player
node tools/b3-sim.js new4 300 --rank=5 --foehp=3  # triple monster HP: long enough for the simple player to bank Pep for every Capstone
```

The rule tests of stages 1 to 3 run with `plain:true` (the wrappers at the top of `check()` in `tools/b3-sim.js` and of the two older check files), so their numbers are what they were before Leans and Pocket Vibes existed. `tools/b3-check-s4.js` tests real loadouts. A later stage's file should use real loadouts too.

The screen test starts every fight from the Lab's fresh loadouts (`b3LabReset()` inside `start()`), so Vibe Points won by one test fight never change the next; the simulator's `cfgFor` builds the same loadouts, which is why the two still agree turn for turn.

The simple player attacks whenever attacking scores higher, which is nearly always. The bestiary's boss HP model (its section 1.6) assumes about one action in four is a support move, so a boss is measured both ways: plain, and with `--support=4`.

`tools/b3_test.py` plays each fight by hand through the real screen (keys and taps), checks that Windex Spritz then a Clobber hit shows Hydro-Slip!, compares the on-screen turn order with the simulator for the same seed, plays a fight to the lose screen, and checks a battle 2 fight still owns its screen afterwards. On the Pond Grump fight it also runs the stage 2 moves (section 5 in the file's header): there it aims the monsters with pokes (a test taunt, `actIx`) so every run shows a slip, a ward's answer, an intercept, an interrupt and a revive. On The Big One it also runs the stage 3 section (section 6 in the file's header): it pokes the boss into Big Glare at Rose three times and answers it three ways (Tom's Suite Door Slide takes the bite, Crunchy Sugar-Cube Pop cancels it, a Break cancels it), tops the boss's pips up between family turns so a Break only comes when the test wants one, and calls two Mudlings and a Skeeter Swarm in as adds. All six fights take about 25 minutes; one fight: `python3 tools/b3_test.py new3`. Look at the sheets before pushing.

Gotcha for any test that drives the SKILLS list with the keys: move the mouse off the list first (`pg.mouse.move(2,2)`). A mouse left resting over a row moves the cursor to that row every time the list is redrawn.

## What stage 9b holds, and what waits

| In (build `b3s9b`) | Waits for |
|---|---|
| TNB complete: `data/b3-kit-tnb.js` (cast row, Ceramicist and Longboarder, 2 Traits, 2 Basics, 4 Skills, 2 Capstones, 4 Quirks, each Skill with a full plain `desc` for its card), rows `wet_clay`, `kiln_glow`, `gold_seam`, `fresh_ride`, `e_bike` in `data/b3-status.js` and the vessel hazard `amphora`. Lab fight `new7` (TNB in Deedee's place, Log Lump). `tools/b3-check-s9b.js` (115 checks) and `python3 tools/b3_test.py s9b`. | His Vibe Points start (the late joiners' pool) and Nara and Boppy: stage 9c. |
| Clay shields: the shield op's `clay:true` (`b3AddShield` fills `sh.clay`, `sh.stone`). Wet Clay to Stoneware (`custom:'wetClay'`): a stone clay shield soaks Clobber at 1.2 times its size (`b3ShieldPower`); a Sizzle hit fires it into Fired Glaze (`b3ClaySizzle`) which throws 30% of what it soaks back (`b3GlazeReflect`, plain Sizzle damage, never reflects again). The `vitrify` op (Three-AM Kiln Firing) fires every clay shield on the family, Trait or not. | |
| Grand Amphora: hazard `amphora` (`vessel:true`, laid on the family's floor, `side:'party'`). `b3VesselTake` (called from `b3DamageOp` when a monster's damaging act begins) soaks the whole act and its rider statuses; `b3VesselBurst` queues TNB's answer as a reaction (heavy Clobber and Razzle on every monster, 2 pips each); `b3VesselExpire` does the same when the 4th round ends; `b3VesselOwnerKo` removes it with a knocked-out maker. `strip kind:'hazard'` only clears hazards the other side laid. | |
| New rule seams: `allyMods` on a Quirk (mods given to every family member as the fight begins, `b3KitPassives`, `b3NewFight`); mod conditions `basic` and `shielded` (`B3_MOD_WHEN`); a Skill's own Base Recovery `rec` (`b3MoveRec`); listener field `tgtAlly` (`B3_LISTEN_IF`); the `shieldBroken` event now carries `c`, so `limit:'actionTarget'` works on it; the status flags `razzleDet` (a hit of a flavor with no Detonation of its own on that Prime sets off the Razzle one: `b3FindDetonation(t,flavor,attacker)`) and `blockDebuff` (`b3PutStatus`); target `slowestAlly` (`b3Who`); a carried status may have `mult` (a doubled buff, `b3Mods`); ops `vitrify`, `double` (`b3DoubleBuff`), `rebalance` (`b3Rebalance`). | |
| New beats: `vesselSoak`, `vitrify`, `rebalance`, and `hazardEnd` with `why` 'burst' or 'ko' (documented at the top of `engine/b3-resolve.js`). A vessel's beats are in the `post` group because the act has no hits to hang them on. | A picture for the vase and the clay shield (Battle Animations theme, not a battle stage). |

Calls made in stage 9b (none confirmed by Tom): Center the Bowl can be aimed at TNB himself; the Kiln Firing, Waymo flash and Baxter Hill waves are standard, standard and heavy at the all-monsters share (the spec prints no tier for the first two); Kiln Glow, Fresh Ride and the e-bike last the common 2 turns; the Amphora counts a monster's whole act as one hit however many it strikes or aims at, bursts when the last hit is soaked or the 4th round ends, and goes away without bursting if TNB is knocked out; Coaster Policy is +15% on every hit of any flavor for any family member holding any shield, counted as its own damage bonus kind; Kintsugi Gold Seam heals once per action for each member and lets a hit of a flavor that has no Detonation of its own on that Prime (Racket or Drench on a Drenched monster) set off Short Circuit!; Longboard Push & Carve prints its Base Recovery as 72 (the spec's "-10%") and Carving Momentum takes another 10% off a Basic; the "slowest ally" of TAP-Card Transfer is the lowest Speed stat, pulled 15 ticks up once a round at the start of TNB's turn; the TAP-Card extra turn applies to every buff TNB puts on, his own included; Baxter Hill doubles the E-Bike (a second doubling changes nothing) and sets it to at least 2 turns; "scanning stats" on the Longboarder Basic is a picture only until Olivia's Scan (stage 10).

## What stage 13 holds, and what waits

| In (build `b3s13a`, chapter 8) | Waits for |
|---|---|
| Chapter 8: `data/b3-foes-ch08.js` (Lukewarm, Leftover, Wet Blanket, The Draft, The Picky Eater, Old Ironbelly), 6 formations (9 VP each, 27 for the boss), Lab fights NEW 45 to NEW 50 (Tom, TNB, Nara, level 19). | Chapters 9 and 10 and the bonus chapter (`b3s13b`, `b3s13c`, `b3s13`), balance (stage 14) |
| Old Ironbelly as data: BROIL and Full Furnace (Toasty on the family and itself; Full Furnace below 50% HP, plus the `full_furnace` buff), Hot Coal and BROIL fire TNB's clay shields. | |
| New seams: strip kind `shieldOrBuff`; `b3Who` targets `frontAllies`, `firstTarget`; 5 statuses (crosswind, tin_lid, why_bother, it_touched, full_furnace). | |

| In (build `b3s13b`, chapter 9) | Waits for |
|---|---|
| Chapter 9: `data/b3-foes-ch09.js` (Velvet Rope, Stuffed Shirt, The Hanger-On, The Sore Loser, The Wallflower, The Mirrorball), 6 formations (9 VP each, 27 for the boss), Lab fights NEW 51 to NEW 56 (Tom, Grace, Rose, Deedee, level 22, the dome). | Chapter 10 and the bonus chapter (`b3s13c`, `b3s13`) |
| The Mirrorball as data: Facet Spin (start), Facet Dazzle and Spotlight Solo leave her Dazzled, LAST DANCE below 50% HP. Members Only (`frontAllies`), Fifty-Two Pickup (`firstTarget`) and "Cheater!" (`foeTaunt`). 6 statuses (members_only, hmph, gauche, cheater, wall_hug, facet_spin). | |

| In (build `b3s13c`, chapter 10) | Waits for |
|---|---|
| Chapter 10: `data/b3-foes-ch10.js` (Carry-On, Jet Lag, The Long Line, The Unclaimed, The Armrest Hog, The Last Call), 6 formations (8 VP each, 26 for the boss), Lab fights NEW 57 to NEW 62 (Tom, Grace, Rose, Amy, level 25, the terminal). | The bonus chapter (`b3s13`) |
| The Last Call as data: Boarding Group Nine then GATE CLOSED (the Big Glare and Swamp Chomp pattern: `then`, `after`, `hits:'marked'`), FINAL BOARDING below 50% HP. 4 statuses (bin_drop, middle_seat, both_armrests, boarding_group). | |

## What stage 12 holds, and what waits

| In (build `b3s12`, chapter 7; stage 12 is complete) | Waits for |
|---|---|
| Chapter 7: `data/b3-foes-ch07.js` (Shusher, Dog-Ear, The Cliffhanger, The Know-It-All, Pop-Up Panic, The Unread), 6 formations (9 VP each, 27 for the boss), Lab fights NEW 39 to NEW 44 (Tom, Grace, Rose, Boppy, level 17). | Chapters 8 to 10 and the bonus chapter (stage 13), balance (stage 14) |
| The Unread as data: Bookmark Ribbon (`bookmark_guard` stance and `bookmark_mend`, once per stance), THE END (`the_end`, below 50% HP, Slow and a 35-tick push on `unshielded`). 8 statuses (coiled_spring, corner_fold, actually, well_technically, hush_hour, jump_scare, bookmark_guard, bookmark_mend). | |

| In (build `b3s12b`, chapter 6) | Waits for |
|---|---|
| Chapter 6: `data/b3-foes-ch06.js` (Acorn Agent, Sticky Sap, Peanut Gallery, Twig Spy, Cheek Stuffer, Acorn Cache, Chairman Cheeks), 6 formations (6 VP each, 30 for the boss), Lab fights NEW 33 to NEW 38 (Tom, TNB, Nara, level 14). | Chapter 7 (`b3s12`) |
| Chairman Cheeks as data: Stash for Winter (`stash_for_winter` when `noAllyId:'acorncache'` and `everyRound:3`; `stash_eat` when `allyId:'acorncache'` and `allyAge:2`), Acorn Cache `onKo` feedback, The Big Stash below 50%. | |
| New seams: conditions `noAllyId`, `allyAge`; targets `randomFrontAlly`, `unshielded`; ops `eat`, `hpLoss`; foe field `onKo`; 7 statuses. | |

| In (build `b3s12a`, chapter 5) | Waits for |
|---|---|
| Chapter 5: `data/b3-foes-ch05.js` (Pop Quiz, Tardy Bell, Glitter Glue, Dodgeball Dread, The Red Pen), 5 formations (12 VP each, 30 for the boss), Lab fights NEW 28 to NEW 32 (Tom, Grace, Rose, Amy, level 12). | Chapters 8 to 10 and the bonus chapter (stage 13). |
| The Red Pen as data: Strict Grading (`strict_grading_first` once at 55% HP, then `strict_grading` every 3rd turn; the act field `starts` links the two counts), the stance status `strict_grading` (30% less damage, ends on a Mix through its own `on:{mix}`, on a Break or a stance strip), the counter act Points Off (`when:{has:'strict_grading'}`), Final Grade (party-wide, so Lights-Out Reset blocks it), SEE ME. | |
| New seams: act field `starts`; flag `foeTaunt` (SEE ME, read in `b3Options`); 7 statuses (gym_bounce, trick_question, picked_last, margin_note, see_me, strict_grading, points_off). | |

## What stage 11 holds, and what waits

| In (build `b3s11`) | Waits for |
|---|---|
| Chapters 2 to 4: `data/b3-foes-ch02.js` (Smoglet, Ticket Flurry, Canyon Coyote, Gridlock, Tar Pit Blob, The Big Shake), `data/b3-foes-ch03.js` (Soggy Sock, Bobber, Tangle, Snag, Old Iron-Gill), `data/b3-foes-ch04.js` (Extra Extra, Boom Mic Moth, Clapper Snapper, Fog Wisp, Cue Card Crab, The Director's Cut), with 17 formations (`vp` per fight, 8 to 10 normal, 26 to 30 boss). Boss HP by party size (`hp3`, `hp4`). | Chapters 5 to 10 and the bonus chapter (stages 12 and 13). |
| Boss mechanics as data: Big Shake's Aftershock and Faultline Guard (below 50% it braces, then Big Rumble); Iron-Gill's dive (`inlet_submerge` every 3rd turn, a second dive once below 50%, each Deep Dive naming its own wind-up in `after`), its `surfaces` flag and the called Soggy Sock (`summon ifNoFront`); the Director's ACTION! (adds, pull, Action Speed) and CUT! (`stopByIntercept`). | Spooked (a way for CUT! to miss) and the Boppy Boat Angler answer (Boppy's third Vibe). |
| New seams: foe flag `surfaces`; act flag `stopByIntercept`; op `row`; summon `ifNoFront`; targets `otherAllies`, `randomOtherAlly`; Skill Lock (`skillLock`, read in `b3CanUse`, blocks only `pocketSkills`); 14 statuses (paper_swirl, choppy_bob, rafter_hover, stage_mist, asphalt_crust, sunken_timber, posterboard_shell, faultline_guard, faultline_mend, pack_howl, action_speed, hooked, studio_notes, skill_lock). | |
| Play layer: the `row` beat (a monster moves to a free spot of its new row). | |
| Lab: NEW 11 to NEW 27 (one fight per formation and boss). | |

Calls made in stage 11 (none confirmed by Tom) are rows in `claude/battle-build.md` "Calls made that Tom has not confirmed".

## What stage 10 holds, and what waits

| In (build `b3s10`) | Waits for |
|---|---|
| Amy, Justin and Olivia complete: `data/b3-kit-amy.js` (Fitness Queen, Classroom Boss), `data/b3-kit-justin.js` (Basement Boss, Live Wire), `data/b3-kit-olivia.js` (Rope Champ, Working Mom): 2 Traits, 2 Basics, 4 Skills, 2 Capstones and 4 Quirks each (42 lines), every Skill with a plain `desc`. | Justin's Armchair Ref and Olivia's News Anchor (still `B3_SOON`). |
| Portable Counters: Reps (Fitness Queen, max 4) and Cadence (Rope Champ, max 3, reset by a Support turn unless Muscle Memory) and Mom Prep (Working Mom, max 3). A counter row can now carry `extra` listeners (`b3KitPassives`), a Skill's `needCounter:{id,min}` gates an effect, `hitsBy{counter,base,per,max,grow}` sets a hit count, and `per:{buffs,max}` scales a mod by buffs held. | |
| New hooks `mix` (a Family Ruckus Mix check, with `mixHot`) and `counterFull`; new listener conditions `notBasic`, `supportTurn`, `partySkill`, `lacksCustom`, `everyOwnTurn`, `tgtGuarded`, `tgtHasStatus`, `tgtPrimeAny`, `tgtDebuffedBy`; new limit `roundAll` (once a round across every carrier). `foeDoubleTurn` fires when a monster acts twice before the family does (Detention). | |
| New ops `refresh` (set the family's buffs back to full length) and `prybar` (Demo-Day Prybar, `engine/b3-custom.js`). Op changes: `strip` takes `stat`, `cleanse` takes `minor`, `heal` takes `perCounter`, `pull` takes `next` (the next turn comes sooner), `grant` takes `basic`, `splash` takes `of:'dealt'`, `interrupt` takes `aoeOnly`. New targets `either` (monster or family member, with `allyEffects`), `otherFoes`, `otherFoesLive`, `targetNeighbor`, `linked`, `randomAlly`. | |
| Status flags `paceRun` (the Speed is held at the moment it was set, `b3Stat` override), `trueAim`, `guaranteeCrit`, `noAoe`, `noPassives`, `blockDebuff`; 17 new statuses in `data/b3-status.js`. A mod `when` can read `skillFlavor`, `oncePerRound`, `supportSkill`, `tagsAny`. | |
| Lab: NEW 10 (Tom, Amy, Justin, Olivia against The Big One). | |

Calls made in stage 10 (none confirmed by Tom) are rows in `claude/battle-build.md` "Calls made that Tom has not confirmed".

## What stage 9c holds, and what waits

| In (build `b3s9c`) | Waits for |
|---|---|
| Nara and Boppy complete: `data/b3-kit-nara.js` (Attached Pup, Guard Dog) and `data/b3-kit-boppy.js` (The Dep, Pepper Boss): 2 Traits, 2 Basics, 4 Skills, 2 Capstones and 4 Quirks each (28 lines), every Skill with a plain `desc`. Cast rows carry `late:true` (so does TNB's). | Pictures and clips: every Skill uses `anim:{kind:'default'}`. |
| New ops: `steal` (take the heaviest buff that is not `noSteal`, keep its turns), `tick` (run a status's ticks now), `upgrade` (swap a status for a stronger one), `treasure`, `goldBall`. New targets and fields: `foe_row` (one option per occupied row, 70% share), a Skill's `detonatesAll` and `pierce`, mod condition `aoe`, effect conditions `stolen`, `notStolen`, `targetDebuffed`, listener conditions `pushed`, `byAlly`, `tgtBoss`, and the `thorns` answer. | Stage 10 uses none of these by name. |
| Status flags `lockAim` (monsters prefer the putter over a taunt) and `noSteal` (Muffin Crown). 13 new statuses in `data/b3-status.js`. | |
| One-offs in `engine/b3-custom.js`: `boppySpeed`, `goldTeeth`, `mailbox`, `hoseFlinched`, `nervous`, `shins`. Evasion takes the Nervous Vibrations bonus (`b3Evasion(u,wide)`); Attack takes the Shins bonus (`b3Stat`). | |
| The late joiners' Vibe Point pool (`engine/b3-progress.js`, `engine/b3-menu.js`): a cast row with `late:true` starts from the largest total any one member holds (`b3PoolSize`), split evenly; the Vibes screen shows VIBE POINT POOL with a move-20 button per Vibe and LOCK IT IN (`b3PoolShift`, `b3PoolConfirm`); the pool rides in the save (`vibes.pool`). A record from before the pool counts as already split. TNB uses it too. | The story switch (stage 15) decides when a save first creates a late joiner. |
| Lab: NEW 8 (Tom, TNB, Nara against Toad and Skeeter) and NEW 9 (Tom, Grace, Rose, Boppy against The Big One). | |

Calls made in stage 9c (none confirmed by Tom) are rows in `claude/battle-build.md` "Calls made that Tom has not confirmed".

## What stage 7 holds, and what waits

| In (build `b3s7`) | Waits for |
|---|---|
| `engine/b3-preview.js`: `b3Preview(F,u,id,key)` plays a move on `b3Clone(F)` with `F.preview` set (`b3Rand` returns .999 and a hit never rolls a crit, so the numbers are exact and never show luck) and reads the beats: damage per monster, Pet Peeve, Resist, Detonation, pips, Break, pushes and pulls, heals, shields, adds, KOs, revives, interrupts, Ruckus gauge, and the turn bar afterwards. `b3Matchups` is the cheap version for a move not yet aimed. | Spoken lines (none). |
| Skill card (b3s9a, Tom's note): a tap on a Skill opens its card (B3.ui 'skill': name, big Pep pill, flavor pictures, the description, the preview, BACK and USE). The SKILLS list shows only name, flavor pictures and the Pep pill. Tap to preview: in RUCKUS and the target list the first touch arms a row and shows its preview box, the second touch uses it. A mouse still previews on hover and uses on click; keys move the cursor and Enter uses. A tapped party card or monster opens the info list; the gamepad's Y opens it too (I on the keyboard). The turn bar shows the actor's ghost and the pushed or pulled faces. | |
| `b3Recommend(F,u)`: tries every usable move on every target (and the two Ruckus spends) through `b3Preview` and scores the outcome (`B3_REC`: damage, a kill, Detonation, Break, pips, heals, shields, revive, interrupt, buffs, a Basic's free Pep). One button glows with a star, the cursor starts on it, and the message line says why. Only when `b7Diff().recommend` is on (Rose Mode). `tools/b3-sim.js --rec` plays with it. | Tuning from Tom's play at the first milestone. |
| Rose Mode pictures (`b7Diff().pictures`): the cross, the SKILLS, RUCKUS and target lists, the info list and the preview box are pictures (3-icon rule: at most flavor icons, Pep drops and one effect icon on a row), with the star and glow on the recommended one. | A hand-drawn icon set in place of the emoji and pixel icons. |
| Rose Mode automatic loadouts: `b3RoseLoadout` (in `b3-progress.js`) gives every member the two Sig Vibes as Main and Pocket and the two newest written Quirks their Ranks have opened. `b3Start` applies it to each fight when pictures are on; the saved book is never rewritten. The Vibes screen shows the same pictures and a line saying Rose Mode picks. | The story switch (stage 15). |

Test sandbox rows for this stage are named `t7_*` in `tools/b3-check-s7.js` (groups 135 to 138) and deleted at the end.

Calls made in stage 7 (none confirmed by Tom): a preview never shows a miss or a crit; the first touch arms and the second confirms in SKILLS, RUCKUS and targets (a mouse uses hover and click); the recommender scores previews and is not the simple player (the simple player is untouched); the recommended Basic says "Free, and it builds Pep."; gamepad Y opens the info list; "newest written Quirks" means the last two of the pool.

## What stage 6 holds, and what waits

| In (build `b3s6`) | Waits for |
|---|---|
| Gauge gains in `b3-resolve.js` (Mix +5 once per monster per round, Detonation +8, extra hit +1, Break +15 to a party actor) through `b3RuckusAdd` and `b3RuckusMix`. Numbers are `B3_RULES.ruckus` in `data/b3-rules.js`. | The gauge in a saved game (stage 15). |
| `engine/b3-ruckus.js`: `b3RuckusPlan` (who, cost, refusals), `b3Ruckus` (plays the spend as one action with two `act` beats, the second marked `part2`), `b3AutoRuckus` for the simple player. | Story fights using it (they use the old battle until the switch-over). |
| Screen: RUCKUS fills as the gauge, a list for the two spends, a foe picker when a move needs one, `ruckus`, `mix` and `ruckusSpend` beats in `b3-play.js` (the pair plays as two moves back to back). | Spoken lines for the spends (none yet). |

Calls made in stage 6 (none confirmed by Tom): Gamer's Intuition's +5 is extra on top of the Detonation's 8; a Mix counts once per monster per round; Double Team Basics give no +2 Pep; cooldowns are ignored by the spends; the Break +15 goes only when a party member caused it; the partner keeps their wait and their turn; the player picks one monster when any move in the spend is aimed at one; persistence is in the Lab only; the simple player spends Full at 100 and Double Team only when it could only Basic.

## What stage 5c holds, and what waits

| In (build `b3s5c`) | Waits for |
|---|---|
| Rose, Cozy Rosie. Well-Loved Original (+1 Pep every 2nd round). Mint-Condition Backup (holders of her shields take 20% fewer crits). Emergency Stuffy Swap (a shield of hers breaks: light Clobber on the breaker, once a round). Tattered Lamby Boomerang (2 Pep, light throw, `lamby_stuck`, tackle and 10% self shield at her next turn). Sofa-Cushion Citadel (3 Pep, cooldown 3, 25% shield on all, `pillow_fort` pushImmune). Kingdom of Ten-Thousand Blankets (5 Pep, heal 60%, cleanse, `blanket_castle`, heavy Sizzle wave at her next turn). | Lines for the new moves (`line:null`) |
| Deedee, Registered Nut. Forty Years a Nurse (half the overheal becomes a shield, cap 25%). First-Ring Pickup (-1 Pep on one ally under half). Warm Beats Cold (immune to Stun and Slow, a cleanse heals her 10%). "Bring a Jacket!" Ward (4 Pep, cooldown 3, `jacket`: regen 7%, one survive at 1 HP). To the Moon & Back (6 Pep, revive 80% or heal to full, heavy Sizzle wave, 2 pips). | |
| General pieces: op `later` (`F.later`, run by `b3RunLater` after `turnStart`); Skill `cooldown` (`u.cd`); `u.immune`; status flag `survive`; `u.shieldMods`; mod `tgtBelow`; `b3Cost(F,u,S,O)` target-aware; listener `every`, `shieldBy:'holder'`; targets `ally_pair`, `family_or_ko`; `to:'foes'`; effect `when` `revived`/`notRevived`; `B3_CUSTOM.cleanBill` (now three keys). | |

Simulator, 100 fights each, Rank 5 (`node tools/b3-sim.js new6 100 --rank=5`): The Big One 3.19 rounds with the Lab's default Vibes, 2.57 with `--swap=all`. All won, no errors. The simple player does not use the second-Vibe Skills much in short fights (its score has no value for a shield or buff on a monster it kills fast); the simulator check only needs it to use some of them over 90 longer fights (`--foehp=3`).

Calls made in stage 5c (none confirmed by Tom): the Boomerang's tackle is a standard hit in two halves with the 10% shield bundled to it; Citadel's pushImmune lasts 3 turns; Mint-Condition counts shields from Rose only; Emergency Stuffy Swap goes to the monster that broke the shield, once a round; Forty Years shields only a living target and only from Deedee's heals; First-Ring discounts only a Skill aimed at one family member and the menu shows the cheapest price; the Jacket's survive is used up by one save, the regen stays; To the Moon heals a living target to full and does not also heal a revived one; the Kingdom wave and To the Moon wave are heavy at the all-monsters share.

## What stage 5b holds, and what waits

| In (build `b3s5b`) | Waits for |
|---|---|
| Tom, Gamer Geek. Gamer's Intuition (+20% on a Pet Peeve flavor or a Primed monster, one bonus; +5 Ruckus points per Detonation). Elixir Hoarder (6 Pep or more at turn start: BUZZING, 15% Speed and Crit Rate until his next turn begins). New Game Plus (after a Detonation or counter, once a round: his next Skill of 4 Pep or less costs 2 less, floor 1). Winged Shell Lock-On (4 Pep: standard Clobber hit; the shell makes the monster's next attack draw a standard Razzle hit from Tom, then it is gone; ends at his next turn). Konami Code (6 Pep: heavy Razzle on every monster, +15% Crit Rate per Prime on the target). Cartridge Blow's foresee (single-target strikes show their aim and lock it). | The Ruckus gauge on screen and what it buys (stage 6) |
| Grace, Craft Artist. Creative Mess (when she Primes or debuffs a monster, 25% of the action's damage to it splashes on the monsters beside it, once per action per monster). Permanent Marker (+1 turn on a Prime she applies). Double Coat (a Basic that follows two Basics adds a second flavor's pip; any other move resets the count). Bedazzle-Gun Glue Trap (4 Pep: a pad catching every non-wind-up act for 2 rounds: light Sizzle then Razzle chip, then Fatigue). Masterpiece Portrait Makeover (5 Pep: heavy Razzle, then Razzle Weakness for 2 turns). | Rose's and Deedee's second Vibes (5c) |
| General pieces: duration `srcBegin`; `answer:'putter'`; `peeve` on a status; listener fields `pepAtLeast`, `kinds`, `tgtFoe`, `attacks`, `limitKey`, `limit:'actionTarget'`; mod conditions `peeveOrPrime` and `skillPep`; cost mods in `b3Cost`; `critPerPrime`; `primeTurns`; ops `foresee` and splash `of:'dealt'`; hazards with `any:true`. | The rest of the "OPS+" list |
| Foresee: a foe's `aimLock` and `intent {act,name,aim,kind}`; `b3Foresee` writes them, `b3FoePick(F,e,peek)` picks without acting, `b3FoeTargets` honors the lock, `b3IntentRefresh` keeps the display in step; cleared at the foe's turn end, a knock-out, a taunt or a different act. Screen: NEXT TARGET chip (`b3-nx`) and a yellow arrow over the aimed member. | Wind-ups and multi-target acts show no aim; stage 7 may add one |
| One-off: `B3_CUSTOM.doubleCoat` and `b3DoubleCoat` in `engine/b3-custom.js` (now two keys: `twinLambRelay`, `doubleCoat`). | |

Simulator, 300 fights each, Tom's Gamer Geek and Grace's Craft Artist as Main at Rank 5, Quirks filled (`node tools/b3-sim.js <fight> 300 --rank=5 --swap=tom,grace`):

| Fight | Rounds to win | With `--support=4` |
|---|---|---|
| Two Mudlings | 0.5 | 0.5 |
| Mudling and Skeeter Swarm | 0.5 | 1.06 |
| Pond Grump and Mudling | 1.23 | 1.23 |
| Bog Toad and Skeeter Swarm | 0.81 | 1.84 |
| Log Lump and Skeeter Swarm | 2.24 | 3.02 |
| The Big One | 3.05 | 3.25 |

Every fight was won with no knock-outs and no errors; the family ends with 95% to 100% of its HP. For the balance pass (stage 14): these Vibes end chapter 1 fights quicker than the first Vibes did in the 5a table (The Big One 3.64 rounds at Rank 5), because the 5 and 6 Pep Capstones hit every monster at once. The first Vibes as Main now give The Big One 3.19 at Rank 5 (3.64 in 5a); I did not isolate the cause (the Lab party's Pocket Vibes now carry finished Skills). Nothing was retuned.

Calls made in stage 5b (all in data or one line of rules; none confirmed by Tom): Winged Shell's free Razzle slam is Tom's own standard hit when the monster attacks (a wind-up turn does not trigger it); Konami Code's "rainbow-invincible" is a picture only, not a rule; Gamer's Intuition's Ruckus half is a flat 5 gauge points per Detonation (base gains are stage 6), and its +20% is one bonus whether the target has a Peeve hit, a Prime, or both; Makeover's damage is dealt before Razzle Weakness lands; Glue Trap catches every act that is not a wind-up, its chip is light Sizzle then Razzle (half each), Fatigue stands in for +20% Recovery, and Grace as the pad's owner can detonate, Prime and trigger Creative Mess with it; Creative Mess splashes 25% of the damage the action dealt to that monster (a standard hit's worth if none), once per action per monster across Prime and debuff, and marks such as Squished are not debuffs; Elixir Hoarder is judged at turn start and lasts until his next turn begins; New Game Plus lasts through his next turn, once a round shared by Detonation and counter triggers, Skills of 4 Pep or less, Capstones excluded; Double Coat counts Basics, and any other flavor, two-flavor or Support move resets the chain; Cartridge Blow shows aim only for single-target strikes and locks it unless a taunt, a knock-out or a different act intervenes.

## What stage 5a holds, and what waits

| In (build `b3s5a`) | Waits for |
|---|---|
| Tom, Frequent Flier. Priority Boarding (Guard Stance from the start until his second turn ends; a hit he takes for someone at half HP or less lands 20% weaker, on top of Suite Door Slide's 35%). Upgrade Certificate (1 stamp per enemy action he steps in for, 3 at most, the number on his portrait; his next Clobber hit that is not a Basic cashes them for 20% each, a Blockade hip-check included). Million-Miler Status (a hip-check takes 1 more pip; stepping in takes 1 pip as his own small answer; each pulls him 10 ticks). Tarmac Porsche Transfer (5 Pep: heavy Racket on every monster, 1 buff off each one hit, High Beams: a taunt on Tom for 2 turns). | Gamer Geek's Trait, Quirks, Skill 2 and Capstone, and Cartridge Blow's second half (stage 5b) |
| Grace, Squishy Collector. Sensory Satisfying (if family is next on the bar as her turn ends, their next turn deals 15% more damage and heals 15% more). Slow-Rise Memory Foam (she moves anyone on the bar, a Hydro-Slip! she sets off included: 15% Evasion until her next turn begins). Ultra-Rare Limited Edition (30% less Recovery after a Skill aimed at a family member). Colossal Diamond-Gold Dumpling (6 Pep: one family member takes a Skill of 4 Pep or less at once, free, in place; 1 Pep each; once a round per member). | Craft Artist's Trait, Quirks, Skill 2 and Capstone (5b; Double Coat is a one-off) |
| Rose, Sugar Rush. Bouncy Physics (+2% Family Ruckus per hit of a multi-hit move). Twin-Lamb Relay (the one-off: a rider someone left on a monster for the next hit, such as Spit Shine, is held for the later hits of her multi-hit moves at 40%). "It's OUR Longboard Now" (3 hits landed in one action: 25% Speed until her next turn begins). Double-Lamby Return-Cart Blitz (6 Pep: six ricochets on random monsters, capstone power shared; on a Flustered monster +10% for the 1st hit up to +60% for the 6th). | Cozy Rosie's Skills, Trait, Quirks and Capstone (5b). The gauge on screen and what it buys (stage 6). |
| Deedee, Neat Freak. Spotless Floor (once a round her shave on a Drenched monster takes 1 more pip, inside the 3-pip cap; a Drenched this action set off counts, and so does a slip on her wet floor). Car-Crumb Vacuum (she strips a buff, a stance or a hazard: the family gets 15% Attack for 1 turn, once per action). Spit Shine (a monster she leaves Drenched takes 30% more from the next Clobber hit by someone else). Fifty-Year Dust Tsunami (5 Pep: every buff off every monster and the family's floor cleared, then a heavy Drench wave on them all). | Registered Nut's Skill 2, Trait, Quirks and Capstone (5b) |
| General pieces: listener conditions (`ids`, `flavor`, `multiHit`, `landed`, `targetPrime`), `listen` (several listeners on one row), `quiet`, `show`; mods with `when` and `per` on statuses, Traits and Quirks; `moveRec`; effect targets `nextIfAlly`; a damage bonus that grows per hit (`grow`); a strip that clears a floor (`kind:'hazard'`); the ledger is paid in passes so a Trait can answer a shave. Events now carry the action (`c`), so "once per action" works for every hook. The `intercept` event is {src: the attacker, tgt: who stepped in, for: who they stepped in for}. | The rest of the "OPS+" pieces in `claude/battle-kit-ops.md` (`either`, `extend`, `refresh`, `tick`, `pierce`, `cooldown`...): each arrives with the first kit line that needs it |
| Ops built now: taunt, grant, ruckus | steal, invert, swapBar, ward as its own op, aggro, pullForward, detonateAll, later, row |
| The granted action: `F.grant`, `b3GrantSkills`, a free `b3Act` that sets no wait and counts no turn; on screen the SKILLS list opens for that member headed FREE SKILL FOR <NAME>, with no Back, and the bar shows them first with no ghost | Amy's Burpee Blitz mini-turn (stage 10) uses the same door |
| Screen: the list a tap opens names the Trait and the equipped Quirks; a Trait or Quirk whose row says `show` is named over its holder as it goes off (Upgrade Certificate, Million-Miler Status, Spotless Floor); FREE SKILL!; the ghost on the turn bar follows a Quirk that shortens the highlighted move | Preview of what a Trait or Quirk would add to a move (stage 7) |
| The simple player scores a free Skill for someone, a move on every monster (buffs it strips, a floor it clears, pips), and a taunt | |

Simulator, 300 fights each with the simple player, level 2 party, first Sig Vibe as Main. From Rank 3 the simulator fills the Quirk slots (Quirk A at Rank 3, both at Rank 5):

| Fight | Stage 4, Rank 2 (no Traits) | Rank 1 | Rank 2 | Rank 3 | Rank 4 | Rank 5 |
|---|---|---|---|---|---|---|
| Two Mudlings | 1.19 rounds | 1.26 | 1.19 | 1.19 | 1.19 | 1.19 |
| Mudling and Skeeter Swarm | 1.28 | 1.65 | 1.23 | 1.20 | 1.20 | 1.20 |
| Pond Grump and Mudling | 1.89 | 2.00 | 1.83 | 1.83 | 1.83 | 1.82 |
| Bog Toad and Skeeter Swarm | 2.13 | 2.45 | 2.03 | 2.03 | 2.03 | 1.88 |
| Log Lump and Skeeter Swarm | 3.07 (3.16 with `--support=4`) | 3.61 | 3.01 (3.13) | 3.04 | 3.04 | 3.04 (3.04) |
| The Big One | 4.25 (5.04) | 5.24 | 4.23 (4.96) | 4.08 | 3.89 | 3.64 (4.59) |

Every fight was won with no knock-outs and no errors; the family ends with 91% to 99% of its HP. Facts for the balance pass (stage 14): at Rank 2 the Traits change chapter 1 by 5% at most. Rank 5 with both Quirks takes The Big One from 4.23 rounds to 3.64 (4.14 with the Quirk slots empty). At chapter 1's monster HP the simple player only ever banks the Pep for one Capstone, Tom's Tarmac Porsche Transfer on the boss (once a fight); with triple monster HP (`--foehp=3`) it uses all four and takes free Skills, with no errors in 1,800 fights. Nothing was retuned.

Calls made in stage 5a (all in data or one line of rules; none confirmed by Tom): Priority Boarding's Guard Stance lasts until Tom's second turn ends, so it covers the monsters' first attacks; its 20% adds to Suite Door Slide's 35% (the 60% cap still holds); a Certificate is stamped per enemy action he steps in for, a miss included; a Zone One Blockade hip-check cashes Certificates like a Clobber Skill on his own turn, and a Clobber Basic never does; Million-Miler's pip for stepping in is Tom's own small answer with its own 3-pip cap, so a monster that hits a covered neighbour with the Blockade up can lose 3 pips to the two answers together; Tarmac Porsche Transfer takes 1 buff off each monster it hits and its taunt lasts 2 turns; "skill potency" (Sensory Satisfying) is damage dealt and heals and shields given, and it is judged by who is next on the bar as Grace's turn ends (a free Skill she grants is not "next on the bar"); a free Skill is a Skill, never the Basic and never a Capstone, and a status someone puts on themselves during it starts counting at the end of their next real turn; Slow-Rise Memory Foam counts every push, pull and pass Grace causes; Ultra-Rare Limited Edition counts Pick-Me-Up; Double-Lamby Return-Cart Blitz has capstone power shared by six hits on random monsters and its Flustered bonus goes by the hit's place in the move; "It's OUR Longboard Now" lasts until Rose's next turn begins, so it shortens exactly the wait she is starting; Twin-Lamb Relay's "enchantments" are riders (a status another family member left that the next hit uses up), an effect that cannot be split (Squished's 1 Pep) does not repeat, and it counts her Basic too; Bouncy Physics counts hits that land; Spotless Floor counts a Drenched this same action set off, and a slip on her wet floor; Car-Crumb Vacuum counts a stance her Panic Boil! knocks off; Spit Shine is its own 2-turn mark and stays if someone else sets the Drenched off with another flavor; Fifty-Year Dust Tsunami scrubs before it hits and is heavy power (the spec prints no tier; Tarmac, the other 5 Pep Capstone, prints heavy), and it does not leave a monster Drenched whose Toasty it set off (spec 2.5 wins over the kit line).

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
| Default animations by shape (strike, cast, throw, give), hit and knock-out looks from existing frames, win and lose; stage 8: monster body-state clips; the family's body states are painted poses (clipposes), video clip moves, the Big One's clip acts and held wind-ups | Spoken lines for the new moves (none exist yet); the victory card and rewards (stage 15) |

Pace: `B3_TEMPO` in `engine/b3-play.js` stretches every default move animation (2 since `b3tempo1`: Tom found the first build about 2x too fast).

Calls made in stage 1 (all in data, all changeable without engine edits): a multi-hit move's power is the whole move's power shared by its hits; an enemy's announce turn uses Base Recovery 80; "every 3rd turn" starts counting again after the act fires; a status put on yourself during your own turn does not count that turn; a turn's wait is set before its statuses count down, so a 2-turn Slow slows two Recoveries; Short Circuit!'s splash is 40% of the hit that set it off; NeeDoh Stretch Pass puts the ally at the very front of the bar; Buzz Cloud comes up only after Jitterflight was stripped, not when it runs out.

## Clips in Battle 3 (built in `b3s8`, 2026-11-19)

Files: `data/b3-clips.js` (`B3_BODY_CLIPS`: owner then state to clip id), `engine/b3-clips.js` (loading, memory, body-state frames, clip move helpers). Play layer hooks are in `engine/b3-play.js`; the act beat in `b3-resolve.js` and `b3-foe.js` carries `anim`, telegraph beats carry `wind`.

| Thing | Rule |
|---|---|
| A move plays from a clip | Data only: `anim:{kind:'clip',clip:'<id>'[,at:share]}` on the move row (party) or foe act. Remove the field and the default animation plays again. |
| When the hit shows | On the clip's own impact frame (`impact` in `data/clips/<id>.js`), through the battle clock, so rules and picture cannot drift. A clip with no impact (state kind) lands at `at` of its length (default .5). Several hits are spaced .35 s. Measured: 0 to 17 ms off the impact frame. |
| Party strike clips | The character first crosses to the monster (`C.reach` places the fist or spray at its near side), plays the clip, then runs home on the mirrored run clip. Foe clips play in place. |
| Foe wind-up | `wind:'<clip>'` holds that clip's last picture while the foe is charged up. |
| Body states | `B3_BODY_CLIPS[owner]`: monsters idle, hit, slip, die, flustered; the family keep only Rose's victory and the three approved gives (clipposes, 2026-11-19). Every other family body state is a painted pose moved by the game (next section). A missing state falls back to the existing painted pose. |
| Memory | Only idle loops stay loaded for the whole fight. Other clips are warmed just before use (`b3cWarmBeats`, `b3cWant`, kept 4.5 s) and `paintedTick` releases them 3 s after last use. Peak in a boss fight: 14 to 16 clips. |
| A clip that is not ready | The move waits up to 2.5 s for it (`B3C.waitMax`), then plays its default animation. The hit still lands. |
| Pace | `B3_TEMPO` does not stretch clips. |
| Clips wired | Deedee: Windex Spritz (her Basic). Mudling: bump, throw. The Big One: glare, tail slap, chomp, belly flop, polish. (Tom's Lounge Pass and Blockade, Grace's Squeeze and Cube Pop, Rose's Tackle, Lava and Giddyup, Deedee's Wet-Floor and Scrub, and every family cast, play the default animation since clipposes; their Library entries are rejected, "never reviewed by Tom".) |
| Tests | `python3 tools/b3_test.py s8` (portrait and landscape: monster idle loops, the Basic of each member (Deedee's by clip), the Big One's acts, painted states present, flustered, victory, load fallback). |

### Guard video, kind guard (wanproof, 2026-11-20)

A clip of kind `guard` (`bake_clip.py --kind guard --rise-end F --lower-start F`, fields `rise` and `lower`) is a guard made by a video model: `b3cGuardFrame` (engine/b3-clips.js) shows its first picture as the standing figure, plays the rise once when the guard goes up, loops the held stretch (pictures `rise` to `lower`-1) forward and back while `b3cGuarding` is true, takes a braced hit in the hold (the engine's 7 px nudge), and plays the lowering once when it comes down. Only in a fight that carries its own table, `B3C.over={F,map:{owner:{guard:id}}}`; there `b3PaintState` returns null for that owner's guard and idle (no painted guard, no fidget, no code breath). The one clip so far is Grace's Wan 3.0 guard `grace_guard`, in the Lab row PROOF: GRACE'S GUARD (VIDEO) (`b3LabGuardProof`). Test: `python3 -I tools/wanproof_test.py`. Plan: `claude/video-battle-plan.md` section 4.

### Painted body states (clipposes, 2026-11-19; the clip reset, `claude/clip-reset-plan.md`)

SUPERSEDED BY RULE (Tom, 2026-11-20): NO PAINTED POSES IN BATTLE (CLAUDE.md). This section describes what the Lab still shows until each state's video exists; do not add to it or tune it. Plan: `claude/video-battle-plan.md`.

wanch1 (2026-11-20): the family's body states are Wan 3.0 videos in `B3_BODY_CLIPS` (idle loops with the breathing in them, guard videos of kind `guard` in every fight, hit, ko, victory, run). What is still painted after wanch1 is only what `B3_BODY_PAINT` still lists (dodge for all four; Rose's ko and Deedee's ko and victory until their remakes pass), and the Lab row below shows only those rows. A fighter with an idle video gets no code breath. Test of the videos: `python3 -I tools/wanproof_test.py` (W1 to W5 per fighter).

`B3_BODY_PAINT[owner][state]` in `data/b3-clips.js` for Tom, Grace, Rose and Deedee: a state drawn from a painted battle frame (`f`, and `f2` for a second picture) at its own size `s` about the feet, with `h` its measured height share. No video, nothing generated. Code: `B3_PAINT`, `b3PaintState`, `b3KoDraw`, `b3GetUp`, `b3GuardDraw` and the draw lines in `b3DrawMember` (`engine/b3-play.js`). +x is away from the monsters.

| State | Pictures | Motion |
|---|---|---|
| idle | idle, with idle2 as a fidget | breath; every 5 to 7 s idle2 fades in for .5 s (.07 s fade) |
| guard | defend | dip, settle, hold with a breath; braced hit pushes 7 px |
| hit | hurtPose | slide +10 over .12 s, hold .2 s, home over .25 s, flash .08 s, no shake |
| dodge | windup | slide +14 with a 6 high hop over .14 s, hold .1 s, home over .2 s |
| ko | hurtPose .3 s, kneel .3 s (three stars), then the knocked-out picture | get up (revive, stand up) plays it backwards in .8 s |
| victory | celeb and leap | swap every .28 s, 16 high hop (Rose keeps her video) |
| run | run pair, runFlip on the way home | swap every .11 s in place of the leap picture |

Rules: a pose is never warped; only `s` (so the head matches the standing head) and `h` live in the table. Head rows: `tools/shots/paintstate-headrows.png`. Test: `python3 -I tools/paint_state_test.py` (feet on the ground line, size, slide distances, ko and get up, victory, run, then the Lab row, both layouts). Lab: NEW BATTLE > PAINTED STATES: CHAPTER 1 (`b3LabPaintedStates`, `engine/b3-lab.js`) plays every state on every fighter in turn. fix-clipposes-2: after each state the run holds on a review panel (`engine/pose-review.js`: WATCH AGAIN, optional note, REJECT, APPROVE, STOP) at 1x; each answer is saved to `data/pose-review.json` on main (`runs.ch1.expect` and `answers` keyed `fighter.state`), and the board rule `done_when.poses_reviewed` closes Tom's card when every state is answered and hands his rejections and notes to the card that applies them.

## Clips: facts from the animation test (build `clippack1`, 2026-11-18)

Background for the section above. The "battle 2 only" row below is now answered by `b3cWanted` (called from `bclipWanted` when `B3.active`).

Three approved clips exist and play only in battle 2's Battle Lab clip fights (`B2.labClip`): `rose_boop` (strike), `rose_sleep` (state: out of the fight), `mudling_idle` (loop). The animation thread adds no more battle 2 wiring; clips enter this system here, through `B3_BODY` and a move's `anim` (architecture 2.7).

| Fact | Detail |
|---|---|
| What is reusable as it stands | `engine/clips.js`: `bclipDefine`, `BCLIPS`, `bclipFrameAt`, `bclipLoopFrame` (forward, then backward), `bclipReady`. A clip frame is an ordinary painted frame (`drawSprite` draws it at the owner's own scale), tagged `rows._clip`, with its feet in `rows._ft`. |
| What is battle 2 only | `bclipWanted`, `bclipFor`, `bclipShowFrame` and `RFX.ST.clip` all check `B2`. Battle 3 needs its own "which clips does this fight want" (the `paintedWanted` line for B3 in `engine/painted.js` is the place). |
| Memory, measured | One clip is about 10 MB in phone memory (Boop 11.5, nap 9.7, Mudling idle 10.1) since frames are trimmed and packed. Loading every clip of 4 party members and their equipped moves (about 60) would be about 600 MB: a phone cannot hold that. Load a move's clip when the move is picked and release it after the action; keep only the idle loops loaded for the whole fight. |
| Frame copies | `paintedCanvas` keeps a full-frame canvas copy of each drawn frame, capped at 24 million pixels in all (`PAINTED_PX_CAP`); one clip frame is about 160 thousand pixels, so about 4 clips fill the cap and older copies are remade when drawn again. |
| A monster whose idle is a clip | Its hurt and attack pictures are still the painted frames, so the look switches for a moment (seen in battle 2's Lab). Either hold the clip's current picture with the engine's shake and flash, or give that monster an attack clip. Not decided. |

