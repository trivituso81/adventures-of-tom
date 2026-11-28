# Battle 3 (the v11 battle system)

"Battle 3" is the code name of the new battle system. The player never sees the name. It is being built in stages beside the live battle ("battle 2", `docs/BATTLE_SYSTEM.md`) and replaces it only at the last stage. The design, the gap table and the 23-stage plan are in the Project: `claude/battle-architecture.md`. The rules are `claude/battle-spec-v11.md`, the enemies `claude/bestiary-v11.md`, the settled calls `claude/battle-v11-decisions.md`.

| Question | Answer |
|---|---|
| Where it is played today | ADMIN > BATTLE LAB > NEW BATTLE (first choice on every Lab page), and the story fights of chapters 1 to 10 (`B3_STORY.chapters`; switch ADMIN > Battle system > Story battles, default BY CHAPTER). Chapters 11 to 20 and the bonus chapter are not built; the Battle Guide lists them as PLANNED (docs/BATTLE_GUIDE.md). |
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
| Lab | `data/b3-lab.js`, `engine/b3-lab.js` | The NEW BATTLE fights and their list on the title screen. The MOVE LAB: TOM row and `engine/b3-movelab.js` are gone (movebench16): a move is reviewed and set in the Move Workbench (ADMIN > BATTLE GUIDE > Animations). `index.html?go=new&i=<fight>&move=<move id>` or `&act=<monster id>:<act id>` (the Battle Guide's In a fight button) starts that fight with the move used first: `b3LabFirstOpt` and `b3LabFirst` (`engine/b3-lab.js`) set `cfg.first` and the owner's Vibe and Rank, `b3FirstSet` and `b3FirstTurn` (`engine/b3-ui.js`) make the owner go first and use it once, `e.force` in `b3FoePick` (`engine/b3-foe.js`) does the same for a monster. Details in docs/BATTLE_GUIDE.md |
| Rules (no drawing) | `engine/b3-core.js`, `b3-progress.js`, `b3-timeline.js`, `b3-hooks.js`, `b3-ops.js`, `b3-custom.js`, `b3-resolve.js`, `b3-foe.js` | Fight state and stat maths, Vibe Mastery (Ranks, Vibe Points, loadouts and what a loadout gives a unit), the tick clock, hooks, effect ops, the one-off rules a kit line needs when data cannot say it (one so far: Twin-Lamb Relay), one action from cost to beats, the enemy turn |
| Where loadouts are kept | `engine/b3-menu.js` | The save's two fields per member, the Lab's book on the device, Vibe Points on a Lab win. The Vibes screen itself is the Vibes page of the menu (`engine/m2-vibes.js`, both doors; the Lab door is `m2OpenLab` with `M2.lab`); the old overlay was removed in menu4 |
| Play layer | `engine/b3-play.js` | Beats to pictures: default animations, numbers, the view the screen shows, Battle 3's own draw function |
| Preview and recommendation (no drawing) | `engine/b3-preview.js` | `b3Clone` (a safe copy of a fight), `b3Matchups`, `b3Preview` (a move played on a copy, nothing real changes, never rolls luck), `b3PreviewValue`, `b3Recommend` (the move that glows) |
| Rose Mode pictures | `engine/b3-pictures.js` | The icon set and the Vibes screen's pictures; reuses battle 2's `bp*` helpers. The deck's rows get their pictures in battleux3 (`b3RenderDeck` in `engine/b3-deck.js`) |
| Screen | `engine/b3-ui.js`, `engine/b3-deck.js`, `b3-deck.css`, `data/b3-ux-words.js` | `b3-ui.js`: start and end, the turn flow, turn bar. `b3-deck.js`: the one-level deck (first tap shows, second uses), the one-line tray and battle log, party cards, the full-list sheet, the aim, DETAILS, keys and gamepad. `b3-ux-words.js`: the reach, kind, size, forecast and Ruckus words, one small table each. A move's `short` line is its field in `data/b3-kit-*.js` |
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
| `startBattle(npc,opts)` | Wrapped by `engine/b3-story.js` (stage 15). The one door for story fights and map monsters: it routes to `b3sBegin` or to battle 2 by the switch. Result: `BT.result` is set by `b3sEnd`, so the story `battle` op and the flags read it unchanged. |
| `saveSnapshot`, `loadGame` | Wrapped by `engine/b3-story.js`: the save gains `b3:{v:1,ruckus}`. Nothing is removed from the save. |
| `engine/battle.js` `updateBattle` | Calls `b3Update(dt)` |
| `engine/battle-draw.js` `drawBattle` | Hands the frame to `b3Draw()`. Battle 3 draws its own party and enemies: battle 2's party drawing reads battle 2 state in a dozen places (architecture risk 2). |
| `engine/draw.js`, `engine/main.js` | Keys and gamepad go to `b3Key` and `b3Pad` |
| `engine/painted.js` `paintedWanted` | Loads the painted sheets a Battle 3 fight needs |
| `engine/splash.js` | NEW BATTLE on the Lab pages; `engine/b3-lab.js` adds the `lab3` list. The title screen's key handler stands aside while the Vibes screen is open (`B3V.open`). |
| `engine/m2-core.js`, `engine/m2-vibes.js` | The menu's Vibes tab (the save's book) and `m2OpenLab` (Battle Lab > NEW BATTLE > VIBES AND RANKS, the Lab's book, a Rank picker). |
| `engine/main.js` `pollGamepad` | Hands the gamepad to `m2Pad` while the Lab's Vibes page is open |
| `saveSnapshot`, `loadGame` | Wrapped at the top of `engine/b3-menu.js` (the way `engine/bench.js` wraps them): every member with a kit is saved with `vibes` ({main, pocket, quirks, vp}) and `row`; on load every member's loadout is rebuilt from the save, or fresh when the save has none. No old field is removed. |
| `localStorage` `aot-b3-lab` | The Battle Lab's book of loadouts (`b3LabBook`, `b3LabSave`, `b3LabReset`). Not part of any save. |
| `index.html` | `#b3-bar` and `#b3-app` (scene, tray, deck, party cards, sheet). `#battle.v3` is a CSS size container and `b3-deck.css` lays the screen out with `@container` queries, so portrait, landscape, the rotated stage and the Duo sizes follow the stage's own size. `#battle` carries both `v2` (the shared layout) and `v3` during a Battle 3 fight. |

Shared shell (b3s23a): `engine/bt-shell.js` holds what Battle 3 shares with the rest of the game, under bt names: the fight door `startBattle` (it asks `b3sStart` in `engine/b3-story.js`, then the old path through `BT.oldFight`), `BT.result` (how the last fight ended; the story's {battle} step reads it), `BT.lab`, `btMeter`, `BT_METER`, `btMeterTag`, `btBattleDef`, `btCanvasPt`, `btEsc`, `btPortrait`, `btThumb`, `btPurse`, and the Rose Mode picture helpers `bpOn`, `bpIcon`, `bpWord`. The turn bar uses the classes `.bt-tk`, `.bt-rib-lbl` and `.bt-int`. No `engine/b3-*.js` or `data/b3-*.js` file names a battle 2 value. Still borrowed from `engine/feel.js`: `.b7-tools`, `b7FoeHp`, `b7Taken`, `b7FoeSpeed`, `b7ToggleSpeed`, `B7.speed`.

## Testing

```
node tools/b3-sim.js check            # data check and rule tests: FAILS: []   (tools/smoke.py runs this too)
node tools/b3-sim.js new1 200         # 200 fights with the simple player: wins, rounds to win, knock-outs, errors
node tools/b3-sim.js new2 1 --seed=7 --log
node tools/b3-sim.js new6 300 --support=4   # every 4th action of each family member is a move that deals no damage, if they have one
python3 tools/b3_test.py              # every NEW BATTLE fight on screen, portrait and landscape; sheets in tools/shots/b3-*.png
python3 tools/b3_test.py s3           # only the stage 3 section (The Big One: pips, Mark, Break, adds), about 5 minutes
python3 tools/b3_test.py s4           # only the stage 4 section (the Vibes page from both doors, Ranks, the save fields), about 2 minutes
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

## What stage 15 holds: chapter 1's story switch (build `b3s15`)

### Chapter 1's battle 2 references, by kind (listed before any change, 2026-11-20)

Fact: every place chapter 1's scenes and map monsters touch battle 2. Lines are in `data/scenes.js` unless named. "Share" is what stage 15 replaces; everything else stays as it is.

| Kind | Where | What it does with battle 2 | Stage 15 |
|---|---|---|---|
| Start a fight | `SCENES.ch1Mudling` (line 312) | `{battle:'mudling',tut:'basics',count:3}`: three Mudlings in battle 2 | Routed. NEW plays the 3-Mudling fight (`mudling3`, 15 VP each) |
| Start a fight | `SCENES.ch1Pond` (354) and `bigOneRetry` (360 to 367, up to 8 nested `{battle:'bigone'}`) | The Big One, then on a loss heal and run it again | Routed. NEW plays `bigone` (new6) |
| Start a fight | Map monsters in Grump Hollow and the Square (mudling, skeeter, grump, toad, log), `engine/overworld.js:149` `startBattle(npc)` | Touching a monster | Routed (one door: `startBattle`) |
| Start a fight | Story `battle` op, `engine/story.js:333` | Calls `startBattle`, waits on `battle.active` | Wrapped: waits on the Battle 3 fight too |
| Read a result | Flags `battle:mudling` and `battle:bigone` (set by the story op from `BT.result`, and for bosses by the `b2End` wrapper, `engine/story.js` ~1531) | Read by `CH1_AFTER` (293), `bigOneRetry` `lost()`, trigger `ch1-after` (707), the boss pose code (726 to 731) | NEW writes the same flags from the Battle 3 result |
| Read a result | `{heal:true}` after a loss (293 to 295, 362) | Full HP for the party | Kept as is (Deedee's line plays, then full HP) |
| Read a result | `monsterFall(npc)` (`engine/world.js:200`) calls `storyMonsterFell` (807 to 812), which sets `ch1-beat:toad` and `ch1-beat:log` and moves the Hollow trail (`hollowTrailStage`) | A beaten map monster falls | NEW calls `monsterFall` on a win, so the trail still moves |
| Read a result | Rewards: `b2RewardsData` (XP, coins, drop, `b2WriteBack`) and `b7ShowCard` | Battle 2's victory card | NEW pays Vibe Points, XP and coins, and shows the same card with VP lines |
| Unlock a Tombo | Flags `tombo:rose1` (59), `tombo:grace1` (73), `tombo:deedee1` (286) | Unlock Double-Decker Airplane, Squishy Delivery, Wine and Gossip | Flags stay. Tombos are retired as a rule (Dual Ruckus, architecture section 3) and returned as skins in stage 16 (built, `b3s16`) |
| Unlock a Tombo | Toasts at lines 122 and 287 | Name battle 2 menu rows (HEAL, ATTACK) | Shown under OLD only. Under NEW they are skipped, since no Tombo row exists to find |
| Tutorial | `TUTORIALS.basics` and `TUTORIALS.bigone` (874 to 890), the `tut` option, `b2TutTip`, `b2TipAim`, `b7AfterRender` glow (`engine/story.js` ~1547 to 1577) | Tips about Warmth, RASPBERRY, HEART, Tombos, VP, Inspect, LOCK and DEFEND | Replaced for NEW by `B3_STORY.tips` (Pep, Basic, Skill, Preview, Ruckus, Inspect, row). OLD keeps these |

Shares stage 15 does not touch: chapters 2 to 20 (`ch2` onward, `data/ch20-battle.js`, `engine/benchcall.js`, `engine/boss-finale.js`), Battle Lab, and every battle 2 file. Under OLD the chapter plays exactly as before.

### What stage 15 builds (build `b3s15`)

| Part | Fact |
|---|---|
| The switch | ADMIN > Battle system > Story battles: OLD, BY CHAPTER (default), NEW. Kept on the phone (`localStorage` `aot-b3-story`). `B3_STORY.chapters` is `[1]`. OLD sends every story fight to battle 2 on the same save. The demo always uses battle 2. |
| Routing | `b3sPlan(npc,opts)` picks the Battle 3 fight for the monster (`B3_STORY.fights` for the 3-Mudling fight, else the bestiary formation for that monster id) or says "battle 2". A fight with no Battle 3 row goes to battle 2 in every mode. |
| Levels, HP | A level floor (`B3_STORY.levelFloor`) is applied only where Battle 3 plays and never lowers a level. HP carries: a unit starts at its saved share of Max HP (`hpShare`, at least 1), and on a win the share is written back (full on a level-up). A loss leaves everyone at 1 HP and Deedee's scene line plays as before. |
| Vibe Points | Story fights pay VP: 15 each for the 3 Mudlings, 10 for a formation, 30 for the Big One. The Main Vibe earns all of it, the Pocket half. Everyone earns, bench included. A save with progress gets a pool of 135 VP per chapter finished (two thirds to the first Sig Vibe, one third to the second). The migration is idempotent and runs on load, Chapter Select and a switch change. |
| Ruckus | The gauge carries between fights and is a save field (`b3:{v:1,ruckus}`). An old save loads at 0. |
| Victory card | `b7ShowCard` with a "+n VP" line per member and `RUCKUS n%` in the footer (no HEART). CONTINUE shows it before the fight closes (`cfg.beforeEnd`). |
| Late joiners | TNB, Nara and Boppy get a loadout when the story recruits them (`recruitJoin`) or the bench takes them (`benchAdd`). A stale empty record of an unrecruited late joiner is dropped on load. |
| Tips | `B3_STORY.tips`: Basic, Skills, Pet Peeves, support, Ruckus for the first fight; Composure pips, the crown, the Big Glare and the Ruckus for the Big One. Battle 3 words only. A tip shows once per fight, at the start of the turn it needs (`cfg.onTurn`). |
| No Warmth | No Warmth bar, WARMTH command or HEART line in any chapter 1 fight. The two Tombo toasts (`data/scenes.js`) show only under OLD; the Tombo flags stay. |

### Tests and numbers (stage 15)

| Command | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS: 2205, FAILS: [] (`tools/b3-check-s15.js` is the stage 15 share) |
| `python3 tools/b3_story_test.py` | 52 checks: the switch, routing in all three modes, a story fight end to end (tips, no Warmth, HP, VP, card, flags, save and load of the Ruckus), a loss, the boss flag, migration, late joiners, an old save, OLD on the same save, landscape |
| `python3 tools/ch1_b3_test.py` (`LAYOUT=landscape` too) | Chapter 1 from Chapter Select to the job scene on Battle 3, both layouts, every fight auto-played, the card seen, no page errors |
| XP | Fact: clearing Grump Hollow pays 36 (3 Mudlings) + 24 + 26 + 30 + 34 + 100 = 250 XP, which is 2.5 levels at 100 XP a level, so no number was changed. The required path alone (Mudlings and the Big One) pays 136. |
| Balance (fact) | A new save is at Rank 1 in chapter 1 and the plain player takes 7.83 rounds against the Big One at Rank 1 (5.78 at Rank 2); the target is 5 to 7. Left unchanged, for Milestone B to judge on the phone. |
| Not ported | Rose Mode's emergency muffin (`b7Pie`) has no Battle 3 form. |

## What stage 16 holds: Tombo skins on the Full Family Ruckus (build `b3s16`)

Facts (read from the code before building): battle 2 has 21 Primary Tombos (7 partners x 3 tiers), 4 Family Finishes (`ff1` to `ff4`) and Birthday Wish (`wish`, the bonus chapter), 26 in all (the "22 Primary Tombos" of older notes are the 21 Primaries plus Birthday Wish). Battle 3 plays no spoken lines of its own yet, so a skin is also the first place Battle 3 speaks.

| Part | What it is |
|---|---|
| The table | `data/b3-tombo-skins.js`, `B3_SKINS`: 26 rows `{id, name, pairs, flag, rank, lines}`. A skin carries no numbers: the result is still the rule's (both top Skills, `engine/b3-ruckus.js`, untouched). `id` and `flag` (`tombo:<id>`) are battle 2's, so every story flag keeps working. |
| Which is live | `engine/b3-skins.js` (play layer, reads story flags; the rules files never see it). For a pair of family members: the unlocked skin with the highest `rank` whose `pairs` hold exactly those two. Rank 1 to 3 is a Primary's tier, 4 is a Family Finish or Birthday Wish. A Primary's pair is Tom and the partner. A Family Finish or Birthday Wish belongs to the pairs who speak in it: Rose and TNB (`ff1`), Rose and Amy (`ff2`), Deedee and Boppy (`ff3`), Tom and Grace (`ff4`), Tom with Rose or Grace (`wish`). In a Battle Lab fight (`cfg.lab`) every skin counts as unlocked, as battle 2's Lab had every Tombo. No skin live: the plain Full Family Ruckus. |
| On screen | The tray row and the big word on the stage read the skin's name instead of "Full Family Ruckus" (the chip still says Family Ruckus, the cost row still says 100% RUCKUS). Only a Full Family Ruckus is skinned; Double Team never is. |
| Spoken lines | `b3SkinSay` plays the pair's recorded Tombo lines (`LINES[who][key]`, the same clips battle 2 plays, partner first, then Tom, 1.7 s apart) through `say()`. A line with no baked clip plays through speech synthesis as always. Nothing new was written or recorded. |
| Animation | None of its own (Tom, 2026-11-19: animation review is out of scope). The two moves play their own videos or the default animation, as any Full Family Ruckus does. |
| Toasts | The 11 "New Tombo" toasts of chapters 1 to 10 in `data/scenes.js` (chapters 2 to 5: five, chapters 6, 7 and 10: four, chapter 1: two more) and the bonus chapter's "Tombos ready" now have a Battle 3 version ("New Tombo skin: Wine and Gossip (Tom + Deedee). It shows when they fire a Full Family Ruckus."). The battle 2 versions still show under OLD. Birthday Wish gets a toast under Battle 3 when `tombo:wish` is set. |
| Not touched | Every battle 2 file and `data/battle2-data.js`. The Tombo flags. The Director's Cuts (deleted with battle 2 at stage 23, no skin). Tier 4 flags (`tombo:tnb4`, `tombo:nara4`) have no skin. |

Tests: `node tools/b3-sim.js check` (`tools/b3-check-s16.js`: the table matches battle 2's ids and flags, every line exists, the choosing rule on 14 cases, the toasts, the load order, no skin code in the rules files) and `python3 tools/b3_test.py s16` (a Lab fight in portrait and landscape: a pair with no skin keeps the plain name and says nothing, a Tom pair shows its skin on the row, the tray and the stage, and its two lines are spoken in order; the story flags and the Lab rule on the real page).

Purge (stage 23): `data/b3-tombo-skins.js` quotes every Tombo line key, so `tools/clip-audit/unused_voice.py` keeps those lines and clips after battle 2's animations are deleted. Do not purge them.

## What stage 17 holds: chapters 2 to 5's story switch (builds `b3s17a` to `b3s17`)

### Chapters 2 to 5's battle 2 references, by kind (listed before any change, 2026-11-21)

Fact: every place chapters 2 to 5's scenes and map monsters touch battle 2. Lines are in `data/scenes.js` unless named (ch2 442 to 901, ch3 902 to 1403, ch4 1404 to 1879, ch5 1880 to 2389). "Share" is what stage 17 replaces; everything else stays as it is.

| Kind | Where | What it does with battle 2 | Stage 17 |
|---|---|---|---|
| Start a fight | Ch2: `ch2Smog` 531 `{battle:()=>findMonster('smoglet'),tut:'ch2lawn',count:2}`, `ch2Flurry` 567 `tickets`, `ch2Coyote` 578 `coyote`, `ch2Boss` 619 `bigshake` | Story `battle` op starts battle 2 | Routed by the one door (`startBattle`). Two Smoglets is the `smoglet` formation |
| Start a fight | Ch3: `ch3Sock` 1077 `soggysock`, `ch3Tangle` 1090 `tangle`, `ch3Snag` 1118 `snag`, `ch3Pool` 1185 `irongill` | Same | Routed |
| Start a fight | Ch4: `ch4Crab` 1556 `cuecrab`, `ch4Clapper` 1569 `clapper`, `ch4Moth` 1583 `boommoth`, `ch4Boss` 1670 `directorscut` | Same | Routed |
| Start a fight | Ch5: `ch5Bell` 2070 `tardybell`, `ch5Glue` 2084 `glitterglue`, `ch5Dodge` 2105 `dodgeball`, `ch5Boss` 2156 `redpen` | Same | Routed |
| Start a fight | Map monsters: `LA_MONSTER_SPOTS` (smoglet, tickets, coyote, gridlock, tarblob, bigshake), `MARSH_MONSTER_SPOTS` and `SUNDIAL_MONSTER_SPOTS` (soggysock, bobber, tangle, snag, irongill), `BACKLOT_`, `STAGE7_`, `STAGESET_MONSTER_SPOTS` (cuecrab, clapper, boommoth, extra, fogwisp, directorscut), `SCHOOL_` and `CAFE_MONSTER_SPOTS` (popquiz, tardybell, glitterglue, dodgeball, redpen) in `data/*-monsters.js`; `engine/overworld.js:149` `startBattle(npc)` | Touching a monster | Routed (one door). Every one of these 22 ids has a Battle 3 formation (`B3_FORMATIONS`) |
| Read a result | Flags `battle:smoglet`, `battle:tickets`, `battle:coyote`, `battle:bigshake`, `battle:soggysock`, `battle:tangle`, `battle:snag`, `battle:irongill`, `battle:cuecrab`, `battle:clapper`, `battle:boommoth`, `battle:directorscut`, `battle:tardybell`, `battle:glitterglue`, `battle:dodgeball`, `battle:redpen`. Read by `CH2_LOST` (449), line 533, `CH3_AFTER` (1064), `CH4_AFTER` (1414), `CH5_AFTER` (1891), the retry blocks (1186, 1671, 2157) and the triggers `ch2-after`, `ch3-after`, `ch4-after`, `ch5-after` (701, 1278, 1762, 2264) | Set by the story op from `BT.result`, and for bosses by `b3sEnd` | Unchanged: Battle 3 already writes `BT.result` and the boss flag |
| Read a result | `{heal:true}` after a loss (449, 533, 1065, 1187, 1415, 1672, 1892, 2158) | Full HP for the party | Kept as is |
| Read a result | The Warmth result `flag('kind:<id>')` read by `ch3AfterBoss` (1198, Iron-Gill), `ch4AfterBoss` (1680, The Director's Cut), `ch5AfterBoss` (2166, The Red Pen) and `bossKind` (`engine/boss-finale.js` 66, 101, 173: the kind or plain face and effects of every boss finale). Battle 2 sets it in `b2RewardsData` (`engine/battle2.js:1472`) for a monster the Warmth bar sent home | Picks the kind ending or the "Fine. FINE." ending | **Replaced.** Battle 3 has no Warmth bar, so `b3sEnd` sets `kind:<boss id>` on every boss win and the kind ending plays, as chapter 1's after-boss scene always does (retired card c-gem-pillar-hp: kindness plays in the scene after a boss reaches 0 HP). The plain ending stays for OLD |
| Read a result | Rewards: `b2RewardsData` and `b7ShowCard` | Battle 2's victory card | Already done by `b3sAward` (stage 15): XP, coins, drop, Vibe Points, card |
| Unlock a Tombo | Flags `tombo:nara1` (501), `tombo:tnb1` (529), `tombo:boppy1` (1029), `tombo:amy1` (1925), `tombo:grace2` (2004) | Unlock Sit. Paw. Treat., Popcorn Jump, You Hold the Net, I Called It!, Uncle Spotter Toss | Flags stay. Tombos return as skins in stage 16 |
| Unlock a Tombo | Toasts at 502, 530, 1030, 1927, 2005 | Name battle 2 menu rows (▲ ATTACK, 50% HEART) | Shown under OLD only (`B3_CH_ON(n)`), as chapter 1's two were |
| Tutorial | `TUTORIALS` (`engine/story.js` 1543 to 1577: `b2TutTip`, `b2TipAim`, `b7AfterRender` glow): `ch2lawn` 874, `ch2flurry` 881, `ch2coyote` 884, `bigshake` 895, `ch3snag` 1381, `irongill` 1383, `ch3sock` 1389, `ch3tangle` 1395, `ch4crab` 1861, `ch4clapper` 1866, `ch4moth` 1869, `directorscut` 1872, `ch5bell` 2353, `ch5glue` 2359, `ch5dodge` 2362, `redpen` 2365 | Tips about Warmth, COMPLIMENT, PUPPY DOG EYES, HEART, Tombo rows, Aftershock, the clog, the glow | Replaced for Battle 3 by `B3_STORY.tips` under the same 16 keys. OLD keeps these |
| Tutorial | Spoken retry coaching after a loss: Boppy at 1188 ("or do our Tombo"), TNB at 1673 ("Popcorn Jump. Or just tell it GREAT TAKE. Three times."), Amy at 2159 ("somebody tell it that its handwriting is nice") | Tell the player to use a Tombo or to compliment the monster | Under Battle 3 each plays a new line that names real Battle 3 moves; the old line plays under OLD. The new lines have no recording yet (Voice Library, No clip yet) |
| Not a battle 2 reference | `{toast:'... Signature Tool ... WARMTH +7'}` (1721) and `WARMTH +6` (2207): an item stat shown in the menu; `bossFrame('bigshake','calm')` (634): a painted pose in a scene | Item stats and scene poses | Left alone (Warmth is a gear stat the menu still shows; the pose is a picture) |

Shares stage 17 does not touch: chapters 6 to 20 (`ch6` onward, `data/ch20-battle.js`, `engine/benchcall.js`), Battle Lab, and every battle 2 file. Under OLD chapters 2 to 5 play exactly as before.

### What stage 17 builds (builds `b3s17a` chapter 2, `b3s17b` chapter 3, `b3s17c` chapter 4, `b3s17` chapter 5)

| Part | What it does |
|---|---|
| Switch | `B3_STORY.chapters=[1,2,3,4,5]` (`data/b3-story.js`). BY CHAPTER plays chapters 1 to 5 on Battle 3, OLD plays them all on battle 2 on the same save, NEW is unchanged. `B3_CH_ON(n)` in `data/scenes.js` (was `B3_CH1_ON`) asks `b3sChapterOn(n)`. |
| Fights | The 16 scripted story fights and every map monster of chapters 2 to 5 already had formations (stage 11 and 12). One new row: `smoglet2` (two Smoglets, the chapter 2 lawn fight). Vibe Points per fight are the bestiary's: chapter 2 is 10 and 30 (boss), chapter 3 9 and 27, chapter 4 8 and 26, chapter 5 12 and 30. On the required path that is 60, 54, 50 and 66 Main Vibe Points per chapter. |
| Tips | `B3_STORY.tips`: one tip per family turn, once each, for 16 fights (`ch2lawn`, `ch2flurry`, `ch2coyote`, `bigshake`, `ch3sock`, `ch3tangle`, `ch3snag`, `irongill`, `ch4crab`, `ch4clapper`, `ch4moth`, `directorscut`, `ch5bell`, `ch5glue`, `ch5dodge`, `redpen`). They name Pet Peeves, Resists, the wind-up on screen and the answer to it (shield, interrupt, Break, Suite Door Slide, strip a buff, a Mix). No Warmth, HEART or Tombo word in any tip (checked by `tools/b3-check-s17.js`). Tips show only when the cross menu opens, never under `B3.cfg.auto`. |
| Kind ending | Battle 3 has no Warmth bar, so `b3sEnd` sets `kind:<boss>` on a boss win from chapter 2 on (`engine/b3-story.js`). Chapters 3 to 5's after-boss scenes and `bossKind` (`engine/boss-finale.js`) read it, so the kind ending plays as under battle 2. Chapter 1 is unchanged (Milestone B). |
| Tombo toasts | The five "New Tombo" toasts of chapters 2 to 5 show their battle 2 wording under OLD only; under Battle 3 they name the skin (stage 16). The Tombo flags stay. Tombos returned as skins in stage 16 (`b3s16`), and the five toasts have a Battle 3 version. |
| Scene lines | Three loss-retry coaching lines have a Battle 3 version under `B3_CH_ON(n)`: Boppy (chapter 3), TNB (chapter 4), Amy (chapter 5). The first line of each is the old text, so its recorded clip still plays. The new lines are not recorded: they play by speech synthesis and list under No clip yet in the Voice Library. OLD keeps the old lines. |
| Left alone | The Signature Tool toasts ("WARMTH +7", "WARMTH +6") are item stats. `bossFrame('bigshake','calm')` is a painted pose in a scene. |

### Stage 17 tests and numbers

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS 2668, FAILS [] (2205 before stage 17). `tools/b3-check-s17.js`: chapter list, every scripted fight has a formation and tips, every tips key is used, VP per chapter, tips use no battle 2 word, no em dash, at most 240 characters, Tombo toasts gated, the kind flag line exists. |
| Chapter tests | `tools/ch2_b3_test.py` to `tools/ch5_b3_test.py`, each from the Chapter Select jump to the chapter's last scene, portrait and landscape (`LAYOUT=landscape`), helpers in `tools/b3_chapter_lib.py`. Per fight: it ran on Battle 3, the victory card showed, no Warmth, WARMTH or HEART text on the fight screen, the fight's tips showed once each, Tom's Vibe Points equal the fight's VP plus half; per boss: `kind:<boss>` is set. Each run takes 8 to 14 minutes. |
| `tools/b3_story_test.py` | Expectations moved to chapter 6 for "not switched yet" (pool 675, a 450 and 225 split, level floor 14 at chapter 6). One step ("a save made on Battle 3 loads with the switch on Old") failed twice after a long run (the chapter 1 scene fight had not started after 30 seconds, an intro card was up) and passed on every run on its own. |
| `unused_voice.py` | 0 on all checks after each part. |
| Smoke | Fails only `board_sync_test` R5 (known, not from this stage). |

## What stage 18 holds: chapters 6 to 10's story switch (builds `b3s18a` to `b3s18e`; the bonus chapter waits)

### Chapters 6 to 10 and the bonus chapter's battle 2 references, by kind (listed before any change, 2026-11-21)

Fact: every place these chapters' scenes and map monsters touch battle 2. Lines are in `data/scenes.js` unless named (ch6 2396 to 3222, ch7 3223 to 3911, ch8 3912 to 4310, ch9 4311 to 4787, ch10 4788 on; the bonus chapter is `data/bonus-nine-scoops.js`). "Share" is what stage 18 replaces; everything else stays as it is.

| Kind | Where | What it does with battle 2 | Stage 18 |
|---|---|---|---|
| Start a fight | Ch6: 2582 `peanutgallery` (`ch6gallery`), 2600 `twigspy` (`ch6spy`), 2617 `cheekstuffer` (`ch6stuffer`), 2743 `chairman` (`chairman`) | Story `battle` op starts battle 2 | Routed by the one door (`startBattle`); each monster already had a formation |
| Start a fight | Ch7: 3501 `cliffhanger`, 3521 `knowitall`, 3542 `popup`, 3590 `unread` (keys `ch7cliff`, `ch7know`, `ch7pop`, `unread`) | Same | Routed |
| Start a fight | Ch8: 4002 `wetblanket`, 4015 `thedraft`, 4029 `pickyeater`, 4094 `ironbelly` (keys `ch8blanket`, `ch8draft`, `ch8picky`, `ironbelly`) | Same | Routed |
| Start a fight | Ch9: 4420 `coathanger`, 4438 `soreloser`, 4458 `wallflower`, 4511 `mirrorball` (keys `ch9coat`, `ch9cards`, `ch9ball`, `mirrorball`) | Same | Routed |
| Start a fight | Ch10: 4868 `longline`, 4883 `unclaimed`, 4899 `armresthog`, 4954 `lastcall` (keys `ch10sec`, `ch10bag`, `ch10lounge`, `lastcall`) | Same | Routed |
| Start a fight | Map monsters: `OAKPARK_`, `OAK_` and `CROWN_MONSTER_SPOTS` (ch6), `STACKS_` and `READROOM_` (ch7), `BARN_` and `BOILER_` (ch8), `CLUB_` and `DOME_` (ch9), `TERM_` and `GATE_MONSTER_SPOTS` (ch10) | Visible encounters start battle 2 | Routed; `tools/b3-check-s18.js` checks each spot list has a formation for every monster in it |
| Read a result | Flags `battle:chairman`, `battle:unread`, `battle:ironbelly`, `battle:mirrorball`, `battle:lastcall`, read by each boss's retry (`flag(...)!=='win'` then `{heal:true}`) | The story `battle` op sets the flag from `BT.result` (`engine/story.js` 335); bosses also by `b3sEnd` | Already set by `b3sEnd` (stage 15) |
| Read a result | `flag('kind:<boss>')` read by `ch6AfterBoss` (`kind:chairman`, three places), `ch7AfterBoss` (`kind:unread`), `ch8AfterBoss` (`kind:ironbelly`), `ch9AfterBoss` (`kind:mirrorball`), `ch10AfterBoss` (`kind:lastcall`) and `bossKind` (`engine/boss-finale.js`) | Battle 2 sets it when the Warmth bar sends a boss home | `b3sEnd` already sets `kind:<boss>` on a boss win from chapter 2 on (stage 17); the flag names equal the monster ids |
| Unlock a Tombo | Flags `tombo:tnb2` and `tombo:nara2` (ch6, Red Line Transfer and Tug of War), `tombo:deedee2` (ch7, Pick the Rhubarb), `tombo:rose2` and `tombo:amy2` (ch10, Seat 1A Stowaway and Wing Walk). Chapters 8 and 9 have none | Unlock Tombos | Flags stay. Tombos returned as skins in stage 16 (`b3s16`) |
| Unlock a Tombo | Toasts at 2466, 2499 (ch6), 3775 (ch7), 4857 (ch10) name battle 2 menu rows ("50% HEART") | Tell the player about a Tombo | Shown under OLD only (`B3_CH_ON(n)`) |
| Tutorial | `TUTORIALS` rows in `data/scenes.js` near each chapter's end (battle 2: Warmth, HEART, Tombo, elements named Splash, Cozy, Sparkle) | Per-fight tips | Replaced under Battle 3 by `B3_STORY.tips` (same keys) |
| Tutorial | Spoken retry coaching after a loss: TNB (ch6, "Three times should do it"), Grace (ch7, "Mystery, Chatter. Adventure, Kinetic ... Three times"), TNB (ch8, "Splash moves cool her down, Cozy moves stoke her up"), Deedee (ch9, "Ask her three times"), Amy (ch10, "Answer her three times") | Teach battle 2 (Warmth three times, element names, Kinetic) | Under Battle 3 each plays a new line naming what Battle 3 asks; the first line of each is the old text so its clip still plays |
| Not a battle 2 reference | `{toast:'... Signature Tool ... WARMTH +n'}` in chapters 6 to 10: an item stat shown in the menu | Item stats | Left alone |
| Switched (b3s18bonus) | Bonus chapter (`data/bonus-nine-scoops.js`, chapter 21): seven scripted fights (`nsGremlin`, `nsSlug`, `nsCone`, `nsBoss1`, `nsGarden`, `nsBoss2`, `nsBoss1b`) | Battle 3, with the scripted-fight seams of `engine/b3-script.js` | See "The bonus chapter is switched" below |

Shares stage 18 does not touch: chapters 11 to 20 (`engine/benchcall.js`, `data/ch20-battle.js`), Battle Lab and every battle 2 file. Under OLD chapters 6 to 10 play exactly as before.

### What stage 18 builds (builds `b3s18a` chapter 6, `b3s18b` chapter 7, `b3s18c` chapter 8, `b3s18d` chapter 9, `b3s18e` chapter 10)

| Part | What it does |
|---|---|
| Switch | `B3_STORY.chapters=[1,...,10]` (`data/b3-story.js`). BY CHAPTER plays chapters 1 to 10 on Battle 3, OLD plays them all on battle 2 on the same save, NEW is unchanged. |
| Fights | The 20 scripted story fights and every map monster of chapters 6 to 10 already had formations (stage 11 to 13). No new fight rows. Vibe Points per fight are the bestiary's: chapter 6 is 6 and 30 (boss), chapter 7 is 9 and 27, chapter 8 is 9 and 27, chapter 9 is 9 and 27, chapter 10 is 8 and 26. |
| Tips | `B3_STORY.tips`: one tip per family turn, once each, for 20 fights (`ch6gallery`, `ch6spy`, `ch6stuffer`, `chairman`, `ch7cliff`, `ch7know`, `ch7pop`, `unread`, `ch8blanket`, `ch8draft`, `ch8picky`, `ironbelly`, `ch9coat`, `ch9cards`, `ch9ball`, `mirrorball`, `ch10sec`, `ch10bag`, `ch10lounge`, `lastcall`). They name Pet Peeves, Resists, and the wind-up on screen (!!), with a condition so a tip about a status or wind-up shows only when it is on screen. At least two per fight, 240 characters at most, no battle 2 word, no em dash. |
| Kind ending | Unchanged from stage 17: `b3sEnd` sets `kind:<boss>` on a boss win; each of the five boss flags equals the monster id the after-boss scene reads. |
| Tombo toasts | The four "New Tombo" toasts of chapters 6, 7 and 10 show their battle 2 wording under OLD only; under Battle 3 they name the skin (stage 16). The Tombo flags stay. |
| Scene lines | Five loss-retry coaching lines have a Battle 3 version under `B3_CH_ON(n)`: TNB (ch6, ch8), Grace (ch7), Deedee (ch9), Amy (ch10). The first line of each is the old text, so its recorded clip still plays; the new lines are not recorded and play by speech synthesis (Voice Library, No clip yet). |
| Left alone | The Signature Tool toasts with a WARMTH number (item stats). |

### The bonus chapter is switched (builds `b3s18bonusa` and `b3s18bonus`)

Fact: the bonus chapter's Brain Freeze fights were bespoke battle 2 code (a midpoint that ends the fight with the result `flee` or `shell`, a second phase at half HP, adds, a frozen Rose). They are now data a fight carries, so the same fights run on Battle 3 and the scenes did not change. `OLD` still plays the chapter on battle 2 on the same save.

| Seam | Where | What it does |
|---|---|---|
| `cfg.setup` | `engine/b3-script.js`, `b3NewFight` calls `b3SetupStart` last; rows are `B3_STORY.setup[<scene step tut>]` in `data/b3-story.js` | One object a story fight carries: `foeHp`, `start`, `midpoint`, `adds` (below). The rules read it; no scene code. `vp` in a row is the story layer's (`b3sBegin` strips it and sets the plan's Vibe Points). |
| Scripted midpoint | `setup.midpoint {foe, at, hold, result, steps, word, line}` | `hold` is an HP floor under the monster (`hpFloor`, applied in `b3Hurt`), so he is never knocked out before the point. The first time he begins a turn at or below `at` of his Max HP (`b3ScriptTurn`, called first by `b3FoeTurn`), the `steps` play as `script` beats (a line and big word, a status on a family member, a Deep Freeze that takes a share of everyone's HP and never below `leave`) and `F.over` becomes `result` (`flee` or `shell`). The screen shows the scripted word and line; CONTINUE ends the fight with that result, and `b3sEnd` writes it to `BT.result` so the scene steps `BT.result==='flee'` and `'shell'` work unchanged. |
| Boss starting HP | `setup.foeHp {foe: share}` | Phase 2 starts Brain Freeze at half HP (his Frosted Lid and Deep Freeze are open from the first turn). |
| Adds on a timer | `setup.adds {foe, id, row, first, every, maxLive}` (`b3ScriptRound`, called by `b3RoundStart`) | From round 3, every third round, Sprinkle Gremlins arrive at the usual half HP and 0 pips, up to 2 alive, never into a full row. |
| Frozen status | `data/b3-status.js` `frozen`; flag `frozen` in `b3BeginTurn` | The holder loses every turn for its length (9 turns, the midpoint's Rose). Unlike a Stun it is not used up by one skipped turn. |
| Birthday Girl status | `data/b3-status.js` `birthday_girl`; `setup.start` (filled by `b3sBegin` when the Birthday Sash is on Grace) | Her first two turns: +75% Attack, +50% Defense, +25% crit, Skills cost 1 less Pep (battle 2's Warmth, Grit, Cool and Pep numbers have no Battle 3 twin; this is the Battle 3 reading). |
| Chapter 21 floors | `B3_STORY.bonus[21] = {level:5, finished:1}`, read by `b3sMigrate` | `levelFloor` ends at chapter 10 and the Vibe Point pool counts finished chapters, so chapter 21 would have started at level 25 with every Vibe at mastery. It starts at level 5 with one chapter's worth of points (Main 90, Pocket 45). |
| Vibe Points | `B3_STORY.setup[...].vp` | 15 for each of the four normal fights and 30 for the Brain Freeze win (the bestiary's 90 for the chapter, with four normal fights in the script); the flee and shell runs pay nothing. The Pocket Vibe earns half of each win, rounded up (Tom's total moves by 137). |
| Tips | `B3_STORY.tips.nsGremlin`, `nsSlug`, `nsCone`, `nsBoss1`, `nsGarden`, `nsBoss2`, `nsBoss1b` | One tip per family turn, once each. No Warmth, HEART, Tombo or ICE SHELL words. |
| Scenes | `data/bonus-nine-scoops.js` | `beginBonus` calls `b3sFresh()` and `b3sMigrate(21)`. The "Tombos ready" toast shows under OLD only. The phase 2 retry goal toast has a Battle 3 version (the lid and Sizzle). Battle 2's `b2CheckPhase`, `b2BossTurn` and the sash status stay for OLD. |

Balance (facts from the sim, `node tools/b3-sim.js check` and the chapter test): the party meets Brain Freeze's second phase at level 7 (it starts at 5 and the four earlier fights pay XP). With Rose Mode's recommended moves phase 2 is won about 1 in 30 at level 5, about half at level 6 and nearly always at level 7; the simple player wins 12 of 30 at 7.

Not carried over (Battle 3 has no bag and no Tombo rows): Boppy's Peppers as items ("Bag: Boppy's Pepper... burns through an ICE SHELL"), the Birthday Wish Tombo and Grace's Instax command, and the "break the ICE SHELL" rule; Battle 3's Frosted Lid and Panic Boil! take that job. The scene lines that name Birthday Wish stay as written (a spoken line is never reworded), so Tom hears "Birthday Wish is ready" with no such command on the screen. That is the one open design question of the chapter.

Tests: `node tools/b3-sim.js check` (`tools/b3-check-s18bonus.js`), `python3 tools/ns_b3_test.py` (portrait and landscape, from the BONUS start, every story fight auto-played on Battle 3, both scripted ends, the retry scene, the after-boss scene, the sash).

### Stage 18 tests and numbers

| Check | Result |
|---|---|
| `node tools/b3-sim.js check` | CHECKS 3271, FAILS [] (2668 after stage 17). `tools/b3-check-s18.js` (new): chapter order, every scripted fight of 6 to 10 has a formation and tips, every tips key is used, map monster lists have formations, VP per chapter, tips have no battle 2 word and no em dash. `tools/b3-check-s17.js` now covers chapters 2 to 5 only; its tip and toast checks run over every switched chapter. |
| Browser tests | Not run: Tom asked for no testing this stage ("id prefer not to test and just keep building until we are done"). `tools/ch6_b3_test.py` to `ch10_b3_test.py` were not written. `tools/smoke.py` was not run. `tools/b3_story_test.py` was edited but not run: its "not switched yet" cases moved from chapter 6 to chapter 11 (pool 1350 split 800 and 550, level floor 25). |
| `unused_voice.py` | 0 on checks 1, 3 and 4 after each part. |

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

| In (build `b3s13`, the bonus chapter; stage 13 is complete) | Waits for |
|---|---|
| Bonus chapter: `data/b3-foes-ch11bonus.js` (Sprinkle Gremlin, Slushie Slug, Cone Head, Brain Freeze), 4 formations (10 VP each, 30 for the boss), Lab fights NEW 63 to NEW 66 (Tom, Grace, Rose, level 12, the Square backdrop). | Balance of chapters 6 to 10 and the bonus (stage 14) |
| Brain Freeze as data: Frosted Lid below 50% HP, once (Guard Stance plus +15% Defense), Deep Freeze below 50% HP. Cone Head's Scoop Pass needs a hurt monster (`allyHurt`) and heals and shields the lowest other one (`lowestOtherAlly`). The Slushie Slug starts in Blue-Ice Glaze. 3 statuses (blue_ice, scoop_pass, frosted_lid), 1 condition, 1 target. | |

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
| The act runner: `when` with everyTurn, everyRound, waitRounds, once, hpBelow, hpAbove, stripped, has, lacks, notSameAllyTurns. `hits`: one, all, self, marked, attacker, two_random, two_adjacent (with `grow`), fastest, foes, field. `aim:'back'`. (Stage 22a added `front_back` and the `tradeRows` op: FINAL CALL's Gate Change.) | Phases and phase lines (chapter 20). Stance-swapping Pet Peeves (chapter 17). |
| Counter acts (`hits:'attacker'`): answer once per ally action, Recovery 0, not while Flustered. Tested with a test row; the first real one is Points Off (chapter 5). | |
| Adds (`summon` op): half HP, 0 pips, the arriving wait, 3 in Front and 2 in Back at most, letters and slots renumbered. On screen an add fades in between the caller and the family. Tested with a test row and a poke; the first real caller is Old Iron-Gill (chapter 3). | Helper links ("while it stands the boss takes X% less") and feedback (chapters 15 and 20; chapter 13 built them in stage 22 chapter 13, below). |
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
| Tests | `python3 tools/b3_test.py s8` (portrait and landscape: monster idle loops, the Basic of each member (Deedee's by clip), the Big One's acts, body states are videos, flustered, victory, load fallback). |

### Guard video, kind guard (wanproof, 2026-11-20)

A clip of kind `guard` (`bake_clip.py --kind guard --rise-end F --lower-start F`, fields `rise` and `lower`) is a guard made by a video model: `b3cGuardFrame` (engine/b3-clips.js) shows its first picture as the standing figure, plays the rise once when the guard goes up, loops the held stretch (pictures `rise` to `lower`-1) forward and back while `b3cGuarding` is true, takes a braced hit in the hold (the engine's 7 px nudge), and plays the lowering once when it comes down. Only in a fight that carries its own table, `B3C.over={F,map:{owner:{guard:id}}}`; (since wanch1 every family guard is a video in every fight). The one clip so far is Grace's Wan 3.0 guard `grace_guard`, in the Lab row PROOF: GRACE'S GUARD (VIDEO) (`b3LabGuardProof`). Test: `python3 -I tools/wanproof_test.py`. Plan: `claude/video-battle-plan.md` section 4.

### Family body states are videos only (wanch2a, 2026-11-21)

Rule (Tom, 2026-11-20, CLAUDE.md): NO PAINTED POSES IN BATTLE. Tom, Grace, Rose and Deedee are `B3_VIDEO_ONLY` (data/b3-clips.js, idea-tomgrace): every state is a video listed in `B3_BODY_CLIPS`, and a moment with no video of its own shows one of their videos (`b3cStandIn`, `b3cKoStandIn`, engine/b3-clips.js). The painted body states (`B3_BODY_PAINT`, `b3PaintState`, `B3_GUARD`, `b3GuardDraw`, the painted parts of `b3KoDraw`, `b3GetUp`, the painted hit, run, victory and fidget, the Lab row PAINTED STATES: CHAPTER 1 with its review panel `engine/pose-review.js` and `data/pose-review.json`, the board rule `poses_reviewed`) were purged in wanch2a. What is left: `B3_DODGE` and `b3Slide` (engine/b3-play.js), the slide a dodge with no video of its own gives the standing video; `b3KoDraw` for a fighter who is not video-only. A new video for a state replaces its stand-in by being listed in `B3_BODY_CLIPS` (or a move's kit row). Tests: `python3 -I tools/video_only_test.py`, `python3 -I tools/wanproof_test.py`, `python3 tools/b3_test.py s8`.

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


## What stage 14 holds (balance pass, build `b3s14`)

Data only. HP of eight bosses raised (before/after in `docs/CHANGES.md` "b3s14"); plain-player rounds (`node tools/b3-sim.js <fight> 100`): Big One 5.78, Big Shake 5.61, Old Iron-Gill 5.64, Director's Cut 5.71, Red Pen 5.81, Chairman Cheeks 6.32, Unread 5.12, Old Ironbelly 5.07, Mirrorball 5.92, Last Call 5.8, Brain Freeze 5.95. Normal fights and Elites unchanged (0.7 to 5.7 rounds). Open: re-measure with Vibes at Rank 2 and 5 (`--rank=5`).

### Stage 14 follow-up: bosses at Rank 2 and Rank 5 (`b3s14b`)

Plain player, 100 fights each, `node tools/b3-sim.js <fight> 100 --rank=<n>`; all won, 0 errors. No number was changed in this follow-up (data and engine untouched).

| Boss (fight) | Rank 2 rounds | Rank 5 rounds |
|---|---|---|
| The Big One (new6) | 5.78 | 5.11 |
| The Big Shake (new16) | 5.61 | 3.72 |
| Old Iron-Gill (new21) | 5.64 | 4.04 |
| The Director's Cut (new27) | 5.71 | 5.56 |
| The Red Pen (new32) | 5.81 | 5.34 |
| Chairman Cheeks (new38) | 6.32 | 5.91 |
| The Unread (new44) | 5.12 | 5.05 |
| Old Ironbelly (new50) | 5.07 | 4.98 |
| The Mirrorball (new56) | 5.92 | 5.49 |
| The Last Call (new62) | 5.80 | 5.22 |
| Brain Freeze (new66) | 5.95 | 5.94 |

Rank 2 is the Lab default and equals the shipped b3s14 table, so every boss is inside 5 to 7. At Rank 5 (Quirks open, Capstones sooner) the family is stronger and three bosses fall under 5: Big Shake 3.72, Iron-Gill 4.04, Old Ironbelly 4.98. Call made: not retuned. Raising their HP to fix Rank 5 would push the Rank 2 fights past 7 rounds, and the target is the plain player at the default rank. If Tom feels those two chapters are short at high Rank, the lever is HP on `B3_FOES.shake` and `B3_FOES.irongill` (a Rank-scaled boss HP would need an engine change, so it is a later decision).


## Gear (build `b3gear`, 2026-11-22)

Worn gear counts in a Battle 3 fight through one table, `B3_GEAR` in `data/b3-gear.js`. Items keep their old stats and perks.

| Item field | In the new battle |
|---|---|
| `stats.hp` | + Max HP, 1 for 1 |
| `stats.pow` | + Attack, 1 for 1 |
| `stats.grit` | + Defense, 1 for 1 |
| `stats.pep` | + Speed, 1 for 1 |
| `perk.stat.pow`, `grit`, `pep` | a mod of kind `gear` on Attack, Defense, Speed (multiplies with Leans, statuses and Quirks) |
| `stats.warmth`, `stats.cool`, `perk.stat.warmth`, `perk.stat.cool` | off: no such stats in the new battle |
| perks `crit`, `evade`, `regen`, `startVp`, `heart`, `coins`, `kind`, `immune` | off, a reason each in `B3_GEAR.off.perks` |

Where it is applied: `b3GearSum` (`engine/b3-core.js`) adds a member's worn items; `b3PartyUnit` adds the flat points to the level-line stats and pushes the percent mods; a story fight builds `cfg.gear` in `b3sBegin` (`engine/b3-story.js`). A fight with no `gear` is the bare fight (rule tests and the Lab). Test: `tools/b3-check-gear.js`. Simulator: `--gear=<chapter 1 to 5>`. Balance numbers: docs/CHANGES.md `b3gear`.

## What stage 19 holds (build `b3s19`, 2026-11-22)

The third Vibe of every character is built: ten new Vibes, 40 moves (4 each: a Basic and three Skills), 10 Traits and 20 Quirks, as rows in the ten `data/b3-kit-<id>.js` files. A character's third Vibe is the third entry of `B3_CAST[id].vibes` with `sig:0`.

| Character | Third Vibe | Lean |
|---|---|---|
| Tom | Star Baker | support |
| Grace | Stage Performer | see `data/b3-kit-grace.js` |
| Rose | Prankster | see `data/b3-kit-rose.js` |
| Amy | SuperMom | see `data/b3-kit-amy.js` |
| Deedee | Home Cook | see `data/b3-kit-deedee.js` |
| Boppy | Boat Angler | see `data/b3-kit-boppy.js` |
| TNB | Scream King | see `data/b3-kit-tnb.js` |
| Nara | Picky Princess | see `data/b3-kit-nara.js` |
| Justin | Armchair Ref | see `data/b3-kit-justin.js` |
| Olivia | News Anchor | see `data/b3-kit-olivia.js` |

| Item | Fact |
|---|---|
| Saves | No migration. The progression code walks `B3_CAST[id].vibes`, so an old save loads the third Vibe at 0 Vibe Points (`b3FixLoadout` repairs the loadout). New saves hold three `vp` entries. The Lab's fresh loadouts put every Vibe at Rank 2 (60 VP). Battle 2 files are untouched. |
| Four-party rule | The plan text "three or four characters per conversation" is a work split for the build sessions, not a game rule, and no document defines a rule for a fight. I did not invent one. What is built and tested: every one of the 40 moves works in a four-member party, and whole fights run in four-member parties (`tools/b3-check-s19.js` sections 2 and 3). |
| New statuses | airborne, poise, poise_echo, yellow_flag, flag_lock, under_review, sparklers, nose_boop, nose_swift, lamby_hide, embarrassed, shamed, iced_up, seatbelt, inside_voice, stuffed, stuffed_ward, tipsy, sunday_dinner, dinner_atk, dinner_def, dinner_spd, spooked, snubbed, puppy_eyes, plate_warm, high_standards, fuss, on_record, mic_in_face, stripped_defenses, ruckus_boost (`data/b3-status.js`). |
| New ops | `extend`, `swapGap`, `replay`, `invert`; options on old ops: shield `perCounter`, status `oneOf`, composure `ifBuffed`, row and push fire hooks (`rowMoved`, `barMoved` with `crossed`). |
| New conditions | Mods: skillId, pepAtLeast, attackerPips, has, attackerDebuffed, tgtWeak, attackerFast, jumped. Listeners: pushed, crossed, srcCrit, fromParty, tgtOther, hurtOver, orCrit, skillVibe, peeveHit, tgtWeak, cooldown. Targets: lowestPepAlly, lowestHpAlly, bossTargets. |
| One-offs | `engine/b3-custom.js`: encore, unmailed, tupperware, couch, scoop (end of `B3_CUSTOM`). |
| Tests | `node tools/b3-sim.js check` (4049, FAILS []; `tools/b3-check-s19.js` is new: all ten Vibes complete, all 40 moves in four-member parties, whole fights, an old save loads with 0 VP, per-character seams). `python3 tools/b3_test.py s4` FAILS [] (Vibe Point expectations now list the third Vibe). One Lab fight per Vibe (all ten open with the new Basic or Skill, no script error). |
| Battle Guide | The ten third Vibes are no longer planned: `data/guide-planned.json` rebuilt, `tools/battle_guide_test.py` updated, `data/guide-anims.json` rebuilt for the 40 new moves, and `tools/guide_planned.py` no longer drops chapters 11 to 20 because the bonus chapter 21 is in `B3_STORY.chapters`. |
| Waits | Stage 20 (Casual Mode, the Freelancer Vibe), card c-b3s20. |

## What stage 21 holds (build `b3s21`, 2026-11-22)

Card c-b3s21. Vibe Mastery was already built in stage 4; this stage makes it the only progression on Battle 3 and builds Casual Mode.

| Item | Built |
|---|---|
| One call that differs from the card text | The card said "Casual Mode as a difficulty option (feel.js)". The spec the card tells the session to read defines it as the Freelancer Vibe (`claude/battle-spec-v11.md` section 1, `claude/battle-architecture.md` rows 19 to 21, `claude/menuux-plan.md`), the reward for mastering all of a person's Vibes. No document gives a difficulty option that name or any numbers, and the three difficulty modes (Rose, Grace, Director) are unchanged in `B7_DIFF`. I built the spec's Casual Mode and added nothing to the difficulty menu. |
| Casual Mode rules | `engine/b3-progress.js`: `B3_FREELANCER`, `b3CasualOpen`, `b3Basics`, `b3SetMain` (in and out), `b3SetPocket(id,L,v,slot)` (slot 1 is the second Pocket), `b3SetBasic`, `b3KitFree`. Opens when every Vibe of that member is mastered (800 VP each). As Main: two Pocket slots, the Basic picked from the member's own three, all three Traits and each Vibe's Portable Counter, no Lean, Front row by default, Rank 5. No Skills of its own: every Skill comes through the two Pocket Vibes, so a Skill Lock covers them. It earns no Vibe Points (all of it is lost, as with any fully mastered member). It is not a row of `B3_VIBES`; `b3VibeOf` gives its stand-in where a Vibe's name or Lean is read. Rule numbers: `B3_RULES.casual` in `data/b3-rules.js`. |
| Loadout fields | Added `pocket2` and `basic` (both null outside Casual Mode). `b3FixLoadout` puts Casual Mode away when the Vibes are no longer all mastered (the Lab's Rank picker at 4 does this) and repairs equal Pocket slots and an unknown Basic. No field was removed. |
| Save fields | Added `vibes.pocket2` and `vibes.basic`, written only while a member is in Casual Mode. Nothing was deleted: `stamps`, `ranks`, `remix`, `loadouts` and every other old field still load and save, as the plan requires until stage 23 (`tools/b3_test.py` s4 still checks they stay). |
| In a fight | `engine/b3-core.js`: the unit carries `pocket2` and `traits`; the status list shows a CASUAL row (No Lean, the two Secondary Vibes) and all three Traits. `engine/b3-deck.js`: the SKILLS group heading names both Secondary Vibes. |
| The page | `engine/m2-vibes.js`: the Freelancer chip is locked ("Master all 3") until open, then a real tab tagged Casual Mode. Its page shows the pickers first (Basic action, Secondary Vibe 1 and 2) when it is the Primary Vibe, then the three Traits; before that it says what it gives and offers Make it Primary. Tapping any other Vibe twice goes back. `engine/m2-family.js` reads the name through `b3VibeOf`. |
| Stampcard, Polish Point and Remix Ticket paths cut from Battle 3 | `engine/b3-story.js`: `b3sGainFor` (XP and levels only) replaces `b2GainFor`, so a level-up pays no Stamp, Polish or Remix reward cards, and the victory card has no `stamp` note. `engine/progress.js`: `b6CardOn()` is false while a chapter runs on Battle 3, so Rose Mode's automatic Stamp Points on a level-up, the Stamp dot on the MENU button and the "Stamp Point to spend" line of the join banner (`engine/followers.js`) stand down. The Old Stampcard link on the Vibes page was already hidden on Battle 3. Battle 2 and OLD chapters run exactly as before on the same save. |
| Not touched | Battle 2 files, `engine/progress.js` Stampcard rules, the chapter-select jump `b6Prep` (it still auto-stamps so a jump into an OLD chapter has its Stamp Points), `demo/`. They go in stage 23. |
| Battle Guide | `B3_RULES.casual` makes the Guide drop the planned item "Casual Mode (Freelancer)". |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s21.js`: locked and open for all ten, the kit, switching and trading, no VP, whole fights in Casual Mode in three four-member parties, old saves, and a scan that no Stampcard, Polish or Remix code is left in the `b3-*` files); `python3 tools/b3_test.py s21` (the chip locked at Rank 4 and open at Rank 5, Make it Primary, the pickers, a Lab fight in Casual Mode, leaving it; portrait and landscape; frames in `tools/shots/b3-s21*.png`). |
| Waits | Stage 22 (Part 2 bestiary, Traits and Quirks), card c-b3s22. |

## What stage 22a holds (build `b3s22a`, 2026-11-22)

Card c-b3s22. Chapter 11 only (the card builds one chapter per conversation; chapters 12 to 20 each have their own card). Numbers are bestiary v11's printed numbers; the simulator put every chapter 11 fight inside its target with no HP change.

| Item | Built |
|---|---|
| Foes | `data/b3-foes-ch11.js`: Lost Luggage (Bruiser, Front, 638), Red-Eye (Hexer, Back, 472), the Standby Sprite (Elite, 4 pips, 999) and FINAL CALL (boss, 7 pips, 1670 for four, `hp3` 1250). Formations `lostluggage` and `redeye` (the same two foes: Lost Luggage in Front, Red-Eye behind it), `standbysprite` (the Elite with a Red-Eye behind it) and `finalcall`; Lab fights NEW 67 to 69 (level 27, the Infinity background). |
| FINAL CALL | Gate Change (picks 1 Front and 1 Back ally, pushes both 20 ticks, leaves itself Dazzled for 1 turn, and trades their rows), Rebooking Stampede (once at 60%: a wind-up that calls up to 2 Lost Luggage and gives every monster +20% Speed for 2 turns, then a party-wide floor sweep), Concourse Strobe Arc, Baggage Claim Avalanche, and below half HP ALL FLIGHTS CANCELLED (party-wide, takes a Pep, tires everyone). |
| Engine additions | `hits:'front_back'` (`engine/b3-foe.js`; with one row empty it falls back to two random allies) and the `tradeRows` op (`engine/b3-ops.js`; a `rowTrade` beat in `engine/b3-play.js` pops TO THE BACK and TO THE FRONT on both and re-renders the party cards). Four statuses in `data/b3-status.js`: rummaged, seat_seventeen, podium_counter, stampede. |
| Battle 2 FINAL CALL is not carried over | Its CANCELLED shield, the LET IT FLY kindness route and the in-fight BENCH CALL are gone on Battle 3 (no Kindness in battle). The bench swap is the gold Boarding Gate bench before the fight, as it already was. |
| The switch | `B3_STORY.chapters` and `levelFloor` include chapter 11 (floor 27); `tips` `ch11a` and `finalcall`. `data/scenes-p2.js`: three toasts and Amy's retry coaching have a `B3_CH_ON(11)` wording (the Sleepover toast names the skin and the Full Family Ruckus, not HEART; the bench toast names the gold bench; Amy's retry coaching names Rebooking Stampede and FINAL CALL's Pet Peeves, Razzle and Racket). Recorded lines are untouched. |
| Open design note | Some recorded pre-fight lines still say the board "calls" a person or that Tom walks them on. Those are baked, so they stay; they read fine against Gate Change but are not a rule. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22.js`: numbers, the Elite, Gate Change in all row cases, the Stampede with the cap, ALL FLIGHTS CANCELLED, tips, whole fights at Rank 2 in three parties); `python3 tools/ch11_b3_test.py` (portrait and landscape, `LAYOUT=landscape`): the house to the boss win on Battle 3, no Battle 2 word on screen (`tools/b3_chapter_lib.py`). Older checks that counted the switched chapters (`b3-check-s15` to `s18bonus`, `b3_story_test.py`, `battle_guide_test.py`) now include chapter 11; chapter 12 is the first one not switched. |
| Battle Guide | The four monsters leave the planned list by themselves; `data/guide-anims.json` rebuilt. |
| Waits | The 30 Traits and 60 Quirks (stage 22b, a separate push on this card; they are already data plus hooks from stages 5 to 21), then chapters 12 to 20, one card each. |

## What stage 22b holds (build `b3s22`, 2026-11-22)

Card c-b3s22, part b: the 30 Traits and 60 Quirks. Fact found by reading the code: they were already rebuilt as data plus hooks in stages 5, 9, 10 and 19 to 21 (`B3_TRAITS` and `B3_QUIRKS` in the `data/b3-kit-<id>.js` files and `data/b3-rules.js`, run by `engine/b3-core.js` and the files it calls). Nothing was rebuilt in this push; it adds the guard that proves it and writes down what stage 23 may delete.

| Item | Built |
|---|---|
| Guard | `tools/b3-check-s22.js` section 5 (run by `node tools/b3-sim.js check`): 30 Vibes, 30 Traits and 60 Quirks exist as data; none is a name only (`soon`) and none of the 90 Skills is still in `B3_SOON`; every Trait and Quirk carries a rule key (`on`, `listen`, `mods`, `counter`, `custom`, `allyMods`, `effects`, `viaVibe` or `shieldMods`); every Vibe names one Trait and two Quirks that exist. |
| Nothing leans on the old file | The same check reads `engine/battle2-traits.js`, takes its 28 top-level names (`b2TraitBegin`, `b2TraitHit`, ...) and fails if any `engine/b3-*.js` or `data/b3-*.js` file mentions one. None does, so stage 23 can delete the file and its `<script>` tag in `index.html` without touching Battle 3. |
| Not touched | `engine/battle2-traits.js` and its tag (battle 2 and OLD chapters still use it until stage 23). |
| Waits | Chapters 12 to 20 (cards c-b3s22ch12 to c-b3s22ch20), then stage 23. |

## What stage 22 chapter 13 holds (build `b3s22ch13`, 2026-11-22)

Card c-b3s22ch13. Chapter 13 only (the tunnel under the dome, then frozen Long Island). Numbers are bestiary v11's printed numbers; no HP, Attack or Defense was changed. The simulator (`--support=4`, Rank 2, Tom, Amy, TNB and Nara at level 32) puts the Drill Worm at 5.5 rounds and the Gold Knight at 6.7 (longest single fight 7.7), both inside the bestiary's 5 to 7; the Elite fight runs 2.9 rounds (the bestiary note says about 3; chapter 11's Elite also ran short and was left as printed).

| Item | Built |
|---|---|
| Foes | `data/b3-foes-ch13.js`: Hushling (Hexer, Back, 587), Signal Fault (Elite, Front, 1242, 4 pips), Turnstile Grump (Elite, Front, 1242, 4 pips), Wired Relay Hushling (helper, Back, 400), the Dual-Coast Drill Worm (mini-boss, 7 pips, 2070, `hp3` 1550) and The Gold Knight (boss, 7 pips, 2480, `hp3` 1860). Formations `hushling` and `turnstile` (one fight: Turnstile Grump in Front, Hushling in Back), `signalfault`, `drillworm` (with one Wired Relay Hushling in Back) and `goldknight` (alone). Vibe Points 7 for each normal fight, 18 and 30: the bestiary's 90. Lab fights NEW 71 to 73 (level 32, the `subtunnel` background). |
| Helper link (new engine rule) | A foe row's `helperLink:{id,reduce}` becomes a foe mod `reduce` with the new mod condition `allyStands` (`engine/b3-core.js`, `b3ModWhen`): while a living foe of that id stands on the same side, the owner takes `reduce` less damage. It stacks with a Guard Stance and obeys the 60% cap; it needs a fight in hand (`ctx.F`), so a number worked out without one shows no reduction. `b3CheckData` refuses a link to an id that is not a foe or a reduction over the cap. The Drill Worm: 25% less while a Wired Relay Hushling stands, however many stand. |
| Helper feedback (new target) | The Wired Relay Hushling's `onKo` hits the Boss on its own side: the new target `allyBoss` (`engine/b3-ops.js`, `b3Who`) takes 2 Composure pips and leaves it Dazzled for 2 turns. The pips go through the action ledger, so they count inside the 3-pip cap, and never touch HP. |
| The Drill Worm | Relay Call (once, at 50% HP: one more Wired Relay Hushling with its own printed 400 HP in Back), Tunnel Friction Spark (two allies Toasty for 2 turns, the Worm itself Toasty for 1; a Racket hit on the Toasty Worm sets off Panic Boil!), Full Bore Cave-In (below half HP, announced a turn ahead). Statuses `track_block_arm`, `locked_tripod`, `tap_out`, `deep_bore`, `raised_palm`, `gold_guard` in `data/b3-status.js`. |
| The Gold Knight | Nobody Rushes him above half HP (`custom:{boppySpeed:{above:.5}}`, the Boppy rule, now allowed on a foe row too); he resists Clobber and his Pet Peeves are Sizzle and Racket. Raised Palm, Slow Walk (blocks the fastest ally), Wide Arms (hits 2, then 3, then everyone: `grow`), Visor Heat (a wind-up that leaves everyone, himself included, Toasty, so Racket hits set off Panic Boil! and strip Gold Guard), Stand Still (Gold Guard and Mend), Gold Squeeze (a wind-up) and, below half HP, Helmet Hum (a wind-up). At 0 HP he drops to one knee; what follows is a scene. |
| The switch | `B3_STORY.chapters` has 13, `levelFloor` has 32 for it; tips `ch13` (the Drill Worm fight) and `goldknight`. `data/scenes-ch13.js`: the goal toast, the tip toast and Amy's retry coaching have a `B3_CH_ON(13)` wording (the helper link and the Hushling to knock out first, not Chatter, Kinetic or TAKE FIVE). Recorded lines are untouched. |
| Gaps found, not filled | (1) The Gold Knight has no scene in chapter 13 as built (the story ends the chapter with the Worm, then the melt and Boppy at the gate), so his fight is data plus the Lab only and his `goldknight` tips key waits for a scene that starts it (`tools/b3-check-s17.js` and `s18.js` allow that one key by name). (2) The bestiary's returning Part 1 monsters (Mudling, Skeeter and the rest in the frozen town) belong to chapter 14 in the built story, so they are chapter 14's card. (3) The Wired Relay Hushling and the Gold Knight have no battle art: they are drawn with the Hushling's and Warden Boppy's Battle 2 rows (`data/b3-foes-ch13.js`, last block) until the Art Library makes their sheets. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch13.js`: stat lines, formations, Vibe Points 90, every tunnel monster has a fight, the helper link on and off, with a Guard Stance and at the cap, relay feedback and the pip cap, Relay Call once, Tunnel Friction Spark, the Knight's push rule, Wide Arms growth, Visor Heat and Panic Boil!, Stand Still, Helmet Hum, whole fights); `python3 tools/ch13_b3_test.py` (portrait and `LAYOUT=landscape`): the cab stand to the melt on Battle 3, one tunnel fight and the Drill Worm boss, no Battle 2 word on screen. Older checks that counted the switched chapters (`b3-check-s15` to `s18bonus`, `b3_story_test.py`, `battle_guide_test.py`) now include chapter 13; chapter 14 is the first not switched (chapter 12 landed first, as `b3s22ch12`; this build is rebased on it). |
| Battle Guide | The six chapter 13 monsters leave the planned list by themselves; `data/guide-anims.json` rebuilt. |
| Layout | `engine/b3-play.js`: a foe that is the helper of a standing foe (`b3HelperOf`) stands in the gap between the boss and the family (`B3_GAP_SPOTS`), in front of the boss, instead of the Back slot, because a boss is drawn 2.5 times large and hid the Wired Relay Hushling. A second relay from Relay Call takes the other gap spot. Every other Back foe keeps its slot. |
| Waits | Chapters 14 to 20, then stage 23. |

## What stage 22 chapter 14 holds (build `b3s22ch14`, 2026-11-22)

Card c-b3s22ch14. Chapter 14 only (Long Island under the dome: Boppy's Gold Armor, and the Part 1 monsters that come back). Numbers are bestiary v11's printed numbers; no HP, Attack or Defense was changed. The simulator (`--support=4`, Rank 2, Tom, Grace, Rose and Amy at level 35) puts the Gold Armor at 7.3 rounds (aim 7, held to 6 to 8), the returning pairs at 2.8 to 3.0, the returning Elite packs at 3.2 to 5.1 and the six returning bosses at 2.8 to 4.8 (aim about 4, held to 2.5 to 5; they share ONE printed stat line, so the spread is their Part 1 acts).

| Item | Built |
|---|---|
| Boppy's Gold Armor | `data/b3-foes-ch14.js`: `warden`, boss, Front, 3160 HP (`hp3` 2370), Atk 148, Def 67, Spd 103, 8 pips, no running. It is the Gold Knight's seven motions under their real names (Back Behind the Line!, Walk Slower!, It Was THIS Big!, Pepper Breath, Resting My Eyes, Great Big Gold Hug, The 1970 Cross-Country Story below half HP). Nobody Rushes it above half HP (`boppySpeed`), it resists Clobber and can't stand Sizzle or Racket. The family's hits land on the armor, never on Boppy; nothing aims only at the adults and the girls can be hit and can go down. Two statuses, `back_behind` (-15% Attack, 1 turn) and `resting_eyes` (25% Guard Stance), are the only new rows. Formation `warden`, 30 Vibe Points. |
| The Part 1 monsters that come back | 34 rows made in the same file from the Part 1 rows (chapters 1, 3, 5, 7, 9 and 10), id plus `_r`, with the Part 1 acts, Pet Peeves, Resists, starting statuses and formations; only the stat line changes to the role's chapter 14 baseline (Swarmer 491, Skirmisher 604, Hexer 642, Bruiser 868, Elite 1359 with 4 pips, returning boss 1810 with 4 pips, `hp3` 1358). Old Iron-Gill calls a returning Soggy Sock. No drop. 34 formations, 5 Vibe Points a pack and 10 a boss. |
| Look | A returning row draws its Part 1 painting through `art`; regular ones 25% larger (`size`). New: `engine/b3-play.js` reads `size`; `engine/painted.js` asks for the sheet an `art` alias names. The cracked-armor art and the brighter palette are not built (Art Library). |
| Lab | NEW 74 (the armor) to NEW 86 (a returning pack per Long Island chapter and the six returning bosses), all level 35, Tom, Grace, Rose and Amy. |
| The switch | `B3_STORY.chapters` has 14, `levelFloor` has 35, tips `ch14`. `data/scenes-ch14.js`: the two goal toasts, the tip toast, Amy's gate and retry coaching and the Tombo skin toast have a `B3_CH_ON(14)` wording (the armor takes the hits, Pepper Breath and a Racket hit, not "do not hit him"). Recorded lines are untouched. |
| Gaps found, not filled | (1) The built chapter 14 places no Part 1 monster on a map, so the 34 returning fights are data plus the Lab only; Vibe Points add to the bestiary's 90 only when a scene card places four packs and four bosses. (2) The recorded pre-fight lines still say "don't hit him"; they are recorded, so they stay (the Battle 3 toast and Amy's new line say the true rule). (3) The cracked-armor art and the brighter palette are art work. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch14.js`); `python3 tools/ch14_b3_test.py` in portrait and landscape; `python3 tools/b3_story_test.py` (the first unswitched chapter is now 15, pool 1890, floor 35); `python3 tools/battle_guide_test.py` (the fake gain is the chapter 15 Windowsill Radio). |
| Battle Guide | The armor leaves the planned list by itself; `data/guide-anims.json` and `data/battle-lab-index.json` rebuilt. |
| Waits | Chapters 15 to 20, then stage 23. |

## What stage 22 chapter 15 holds (build `b3s22ch15`, 2026-11-22)

Card c-b3s22ch15. Chapter 15 only (the family dinner: HUSH-9 Final Form, the Windowsill Radio, with two speaker pods). Numbers are bestiary v11's printed numbers except one: the boss's HP. Printed 2490 (1870 with the Hush Chip at half) put the simulator (`--support=4`, Rank 2, Tom, Grace, Rose and Amy at level 37) at 4.2 rounds, under the aim of 5 (held to 5 to 7); 3300 (2478) gives 5.5 to 5.6 rounds (shortest 4.5 to 4.9, longest 6.1 to 6.6). Attack 163, Defense 71, Speed 118 and the pips are as printed. The numbers are provisional (chapters 15 to 20) and change only in the simulator.

| Item | Built |
|---|---|
| HUSH-9 Final Form | `data/b3-foes-ch15.js`: `hush9final`, boss, Front, 3300 HP (`hp3` 2478), 7 pips, no running, Racket and Clobber Pet Peeves, resists Razzle. Squelch Knob, Cabinet Thump, Mute Button (waits 2 rounds, locks Pocket Vibe Skills for 2 turns), Dead Air (charges, hits all), Dead Air Calls (once, below half, summons two pods) and Total Silence (below half, charges, hits all). The name on screen is the scene's name, HUSH-9 Final Form; the bestiary calls the entry the Windowsill Radio. |
| Speaker pods | `hushpod`, helper, Back, 366 HP, drawn with the Hushling art. Their three acts are the Hushling's. Feedback only (the bestiary prints no helper link): a pod that is knocked out takes 1 Composure pip off the radio and Dazzles it for 2 turns, inside the 3-pip cap of the action that did it. |
| Layout | New foe field `helpers` (a list of foe ids) is read by `b3HelperOf` in `engine/b3-play.js`, so the pods use the gap spots in front of a 2.5 times large boss. It is layout only; `b3CheckData` rejects an unknown id. |
| Look | A Battle 3 fight in chapter 15 is drawn on the dining room picture (`data/ch15-battle.js`; before, only Battle 2 asked for it). The pods wear the Hushling painting. |
| Lab | NEW 87 (the radio and two pods), level 37, Tom, Grace, Rose and Amy. |
| The switch | `B3_STORY.chapters` has 15, `levelFloor` has 37, tips `ch15` (pods, Pet Peeve, Mute Button, Dead Air, Total Silence). `data/scenes-ch15.js`: the opening toast, Amy's retry line and the Tombo skin toast have a `B3_CH_ON(15)` wording. Recorded lines untouched. The Battle 2 tip about BENCH CALL is not in the Battle 3 wording (there is no bench on Battle 3). |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch15.js`); `python3 tools/ch15_b3_test.py` portrait and landscape; `python3 tools/b3_story_test.py` (the first unswitched chapter is now 16, pool 2025, floor 37); `python3 tools/battle_guide_test.py` (the fake gain is the chapter 16 Grey Note); `python3 tools/smoke.py`; `python3 -I tools/clip-audit/unused_voice.py`. |
| Battle Guide | The radio and the pod leave the planned list by themselves; `data/guide-anims.json` and `data/battle-lab-index.json` rebuilt. |
| Waits | Chapters 16 to 20, then stage 23. |

## What stage 22 chapter 16 holds (build `b3s22ch16`, 2026-11-22)

Card c-b3s22ch16. Chapter 16 only (the town square: Marlowe, the bestiary's Square's Sign, with the Grey Notes, its Citation Slips). Numbers are bestiary v11's printed numbers except one: the boss's HP. Printed 2700 (2020 for three) with the wall coming back every third turn put the simulator (`--support=4`, Rank 2, Tom, Amy, TNB and Nara at level 40) at 18.75 rounds with 9 of 100 fights lost, against an aim of 5 to 7; the Grey Notes he keeps calling were most of that length (a boss alone, no wall, ran 5.87). With the wall used twice and 1300 HP (975 for three) it gives 6.68 rounds (5.83 to 7.10), 100 of 100 won. Attack, Defense, Speed and pips are the printed ones.

| Item | Built |
|---|---|
| Marlowe | `data/b3-foes-ch16.js`: `marlowe16`, boss, Front, 1300 HP (`hp3` 975), 8 pips, no running, Racket and Drench Pet Peeves, resists Clobber, `quietEnd`. Strike Through, Marginal Note (Racket, -1 Pep, -20% Attack), Brace Behind the Eclipse (twice: above half HP, then below half HP), Overexposure (charges, hits all, Blind and Slow) and Total Eclipse (below half, charges, floor sweep, hits all). Names follow the built scenes (Marlowe, Grey Note); the bestiary names are in the file header. |
| Grey Notes | `greynote` (Hexer, Back, 1000 HP, drops pretzels) for the two-note fight, `greynoteh` (helper, 404 HP, no drop, draws as a Grey Note) for the ones he calls. Stick (Blind), Flutter (Bleed), Fade (Fatigue and a stripped buff). No helper link or feedback: the bestiary prints neither. |
| The wall | `eclipse_wall` is a 2-turn Guard Stance at 30% less damage; `eclipse_plating` is +20% Defense; while the stance lasts, 15% of a hit whose flavor is not a Pet Peeve bounces back at the attacker (`bounce` op: plain damage, no Defense, shield first, never a knock-out). A Break, Panic Boil! or a stance-breaking Skill ends the stance. Each use calls Grey Notes up to the Back row's two places. |
| Quiet end | `quietEnd` makes `b3sAward` switch the sound off and title the card with dots, so the tragedy chapter has no fanfare on Battle 3; the aftermath scene turns sound back on. |
| Look | The fight is drawn on the pond picture (no Square battle picture exists yet; Battle 2 used it too). Grey Notes stand in the gap in front of the 2.5 times large boss (`helpers`). |
| Lab | NEW 88 (two Grey Notes) and NEW 89 (Marlowe), level 40, Tom, Amy, TNB and Nara. |
| The switch | `B3_STORY.chapters` has 16, `levelFloor` has 40, tips `ch16`. `data/scenes-ch16.js`: the opening toast and Amy's retry line have a `B3_CH_ON(16)` wording. Recorded lines untouched. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch16.js`); `python3 tools/ch16_b3_test.py` portrait and landscape; `python3 tools/b3_story_test.py` (the first unswitched chapter is now 17, pool 2160, floor 40); `python3 tools/battle_guide_test.py` (the fake gain is the chapter 17 Pause Sprite); `python3 tools/smoke.py`; `python3 -I tools/clip-audit/unused_voice.py`. |
| Battle Guide | Marlowe and the Grey Note leave the planned list by themselves; `data/guide-anims.json` and `data/battle-lab-index.json` rebuilt. |
| Waits | Chapters 17 to 20, then stage 23. |


## What stage 22 chapter 17 holds (build `b3s22ch17`, 2026-11-23)

Card c-b3s22ch17. Chapter 17 only (Julian's building in Los Angeles: the Pause Sprite, the Brass Desk Weight, the Curator and the Twin Lenses, bestiary entries 75 to 78). Numbers are bestiary v11's printed numbers except one: the boss's HP, printed 2,910 (2,180 for three) and now 3,800 (2,850). At the printed number the simulator (`--support=4`, Rank 2, Tom, Grace, Rose and Amy at level 42) won in 4.43 rounds, under the 5 to 7 a boss with a helper aims at; at 3,800 it averages 5.73 rounds over 24 fights and wins every time.

| Item | Built |
|---|---|
| Foes | `data/b3-foes-ch17.js`: `pausesprite` (Hexer, Back, 884 HP; Shutter Tap, Hold That Pose pushes 25 and Slows, Self-Timer Beep puts +20% Speed on a monster in Front), `paperweight` (Brass Desk Weight, Elite, 1,872 HP, 5 pips, starts in a 2-turn Guard Stance; Brass Roll, Magnifier Glare Blinds, Hold The Stack charges), `curator` (Elite, 1,872 HP, 5 pips, starts +25% Defense with a seal that blocks the first debuff; Label-Gun Tag, Frame Straighten, Do Not Touch The Proofs charges and locks a Pocket Vibe), `twinlens` (boss, Front, 8 pips, no running). The formations pay 5 Vibe Points, the boss 30. No fight with Julian Vance: the scenes only give him a voice. |
| Stances | A foe row with `stances` {key:{name,peeves,resists}} and `stance0`. `b3SetStance` copies the stance's Pet Peeves and Resists onto the unit (`u.peeves`, `u.resists`, which every rule already reads), `b3SwapStance` moves to the other one. `b3RoundStart` swaps every foe with stances at each round divider before anyone acts; the `stance` op (Rack Focus) swaps on the act; two swaps in one round cancel. It is the foe's own state, not a status, so a Break, Panic Boil!, a buff strip or a cleanse cannot take it away; Composure and Primes carry through a swap. `when:{stance:'blue'}` limits an act to one lens (Cold Safelight Blue, Enlarger Burn Orange). The card has a Lens row (`kind:'lens'`) and a `stance` beat announces each swap. |
| Cadence | The bestiary prints no order, so: printed order with `when` filters. Rack Focus, then the lens's own act, Long Exposure; Darkroom Call is a once act at half HP (a Curator joins in Front at half its HP, 0 pips, and the boss gains +20% Defense for 2 turns); Contact-Sheet Archive joins below half HP. |
| Statuses | `data/b3-status.js`: `heavy_brass_base`, `white_glove` and `glove_seal` (two rows so the +25% Defense stays after the seal is spent), `self_timer`, `label_tag`, `held_stack`, `rack_focus`, `darkroom_def`. |
| Look | Built sprites draw all four (the Brass Desk Weight is still the Battle 2 paperweight; the bestiary's snow-globe painting waits for the Art Library). |
| Lab | NEW 90 (Curator and Pause Sprite, Tom, Grace, Rose), NEW 91 (Brass Desk Weight, Tom, Amy, TNB, Nara), NEW 92 (the Twin Lenses, Tom, Grace, Rose, Amy), level 42. |
| The switch | `B3_STORY.chapters` has 17, `levelFloor` has 42, tips `ch17`. `data/scenes-ch17.js`: the Vault toast has a `B3_CH_ON(17)` wording. Recorded lines untouched. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch17.js`); `python3 tools/ch17_b3_test.py` portrait and landscape; `python3 tools/b3_story_test.py` (the first unswitched chapter is now 18, pool 2295, floor 42); `python3 tools/battle_guide_test.py` (the fake gain is the chapter 18 Studio Rig); `python3 tools/smoke.py`; `python3 -I tools/clip-audit/unused_voice.py`. |
| Battle Guide | The four foes leave the planned list by themselves; `data/guide-anims.json` and `data/battle-lab-index.json` rebuilt. |
| Waits | Chapters 18 to 20, then stage 23. Chapter 20's Blue and Orange Lens can reuse `stances` and `when:{stance}`. |

## What stage 22 chapter 19 holds (build `b3s22ch19`, 2026-11-23)

Card c-b3s22ch19. Chapter 19 only (the lost-mail office: Dead Letter, Rubber Stamp, the Brass Mail-Chute Courier and The Dead-Letter Censor, bestiary entries 80 to 83). Numbers are bestiary v11's printed numbers except one: the Censor's HP, printed 3,400 (2,550 for three) and now 2,300 (1,725). At the printed number the simulator (`node tools/b3-sim.js new97 24 --support=4`) gave 9.83 rounds against a target of 6 (accept 5 to 7); with REDACTED off the same HP gives 6.45, so the stamp is what lengthens it. At 2,300 it gives 6.22 and wins 24 of 24. The Elites give 2.7 and 2.8 rounds (target about 3) and the Courier fight 6.8 (the bestiary's own estimate in section 7), so none of those moved.

| Item | Built |
|---|---|
| Foes | `data/b3-foes-ch19.js`: `deadletter` and `rubberstamp` (Elites, Front, 2,142 HP, 5 pips), `mailcourier` (Elite stats, Back, 2,300 HP and 1,720 for three, no running, drawn with the built `rubberstamp` sprite until it has its own), `censor` (boss, Front, 2,300 HP and 1,725 for three, 8 pips, no running). Formations `deadletter` and `rubberstamp` (10 VP each, one Elite alone), `mailcourier` (Dead Letter Front, Courier Back, 20 VP), `censor` (30 VP). |
| REDACTED | `redact:{dmg:.5}` on a foe row. The foe keeps `stamp` (a flavor or null) and `dmgLog` (damage per flavor this round, from the party, never from a preview). At each round divider (`b3RoundStart`) from round 2 the stamp becomes the flavor with the most damage; a tie or no damage stamps nothing; the log starts again. `b3Hit` halves the stamped flavor's part, skips its Pet Peeve and Detonation pips, and a move whose every flavor is the stamped one takes no pips at all and costs its user 1 Pep when the action ends (never below 0, after a Basic's +2). A move with two flavors loses only the matching half. A Break (`b3Break`) clears it. It is the foe's own state, not a status. It shows as a carried row (REDACTED: flavor) and a `stamp` beat. The simple player scores a stamped flavor at half, so it rotates. |
| Wax-Seal Ward | Two statuses the Dead Letter starts with: `wax_ward` (+20% Defense) and `wax_seal` (flag `bounceDebuff`). In `b3PutStatus` a debuff from the other side does not land, the seal ends and the same debuff goes onto the sender. Composure loss and Primes still get through. |
| Wall Perch | `perch:true` on a foe row: `b3EffRow` keeps a Back unit Back with nobody in Front. New act condition `when:{row:'back'|'front'}` (`B3_FOE_WHEN`, `b3ActOk`) and `row:'swap'` on the `row` op. Cadence: Ricochet, Vent, Slam (wound up from the Back; lands it in Front), Whoosh (from the Front: swaps back, +20% Evasion). A Break pins it in Front. |
| Statuses | `wax_ward`, `wax_seal`, `ink_pad` (Guard Stance), `denied` (-20% Defense), `whoosh_eva`, `black_marker` (-20% Attack). |
| Lab | NEW 94 (Dead Letter), 95 (Rubber Stamp), 96 (Courier and a Dead Letter), 97 (the Censor), Grace, Rose, Amy and TNB, level 47. The Courier is Lab only: no scene or map places it (like chapter 13's Gold Knight). |
| The switch | `B3_STORY.chapters` has 19, `levelFloor` has 47 (length 20), tips `ch19`. `data/scenes-ch19.js`: a `B3_CH_ON(19)` toast before the Censor fight; a loss already heals the family and retries; recorded lines untouched. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch19.js`); `python3 tools/ch19_b3_test.py` portrait and landscape (`tools/night/tests.json`, `ch19_b3_test`); `python3 tools/b3_story_test.py` (the first unswitched chapter is now 20, pool 2565, floor 47); `python3 tools/battle_guide_test.py` (the planned Collector stands in for a still-planned monster). |
| Battle Guide | The four monsters leave the planned list by themselves; `data/guide-anims.json` rebuilt. |
| Waits | Chapter 20, then stage 23. |

## What stage 22 chapter 18 holds (build `b3s22ch18`, 2026-11-23)

Card c-b3s22ch18. Chapter 18 only (the studio on the top floor, floor 60 of the Glass Tower: The Studio Rig, bestiary entry 79). Numbers are bestiary v11's printed numbers except one: the boss's HP, printed 3,790 (2,840 for three) and now 6,200 (4,650). At the printed number the simulator (`node tools/b3-sim.js new93 24 --support=4`, Rank 2, Tom, Grace, Rose and Amy at level 45) won in 3.43 rounds, well under the 5 to 7 a boss with no helper aims at (target 6); at 6,200 it averages 5.88 rounds and wins 24 of 24. Atk, Def, Spd, pips, Pet Peeves and resists are as printed.

| Item | Built |
|---|---|
| Foe | `data/b3-foes-ch18.js`: `vance` (The Studio Rig, boss, Front, 8 pips, no running; Pet Peeves Clobber and Racket, resists Razzle). Acts: Tripod Sweep (Clobber 0.8x, one ally), Hot Bulb Pop (Sizzle 1.0x on two random allies, Toasty 2 turns), Spotlight Lock (no damage, Marks a Back-row ally, +20% Crit Rate for 1 turn), Big Flash (Razzle 1.5x on the Marked ally next turn, charged, Stun 1 turn), Backdrop Wall (once at half HP: 2-turn Guard Stance, +20% Attack, Toasty 2 turns on itself), Every Light On (Razzle 1.35x on all, charged, Fatigue 2 turns, below half HP). The foe id stays `vance` because the built scenes, the map monster and the Battle 2 fight call it that. |
| The lock | No new rules field. It is chapter 10's pattern (Boarding Group Nine, then GATE CLOSED): `aim:'back'`, `then`, `after`, the `mark` op and `hits:'marked'`. `stopByIntercept` (chapter 4's CUT!) makes Tom's Suite Door Slide take the flash and keeps the Stun off everyone; a shield that soaks the whole flash stops the Stun too; a Break or interrupt cancels it and drops the Mark. |
| Cadence | The bestiary prints none, so: printed order with `when` filters; Backdrop Wall is a once act at half HP, Every Light On joins below half HP. |
| Statuses | `data/b3-status.js`: `spotlight_lock` (buff, +20% crit), `backdrop_wall` (stance, 25% less damage), `backdrop_heat` (buff, +20% Attack). |
| Look | Battle 3 draws the rig with the built `vance` row (the long-coated man at the Loom) until the Art Library makes the rig painting; the bestiary says its look comes once its script settles. |
| Lab | NEW 93 (the Studio Rig, Tom, Grace, Rose, Amy, level 45). |
| The switch | `B3_STORY.chapters` has 18, `levelFloor` has 45 (length 19), tips `ch18`. `data/scenes-ch18.js`: the fight is a real fight on Battle 3, so only a win plays the after scene (`ch18Over`, also the trigger's `test` and Vance's A press); a loss heals the family and Amy says to go again. Battle 2 still ends the fight with `erased` and plays the after scene as before. The pinnacle toast has a `B3_CH_ON(18)` wording. Recorded lines untouched. |
| Pay | 90 Vibe Points, the chapter's whole pay, from the one fight. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch18.js`); `python3 tools/ch18_b3_test.py` portrait and landscape (`tools/night/tests.json`, `ch18_b3_test`); `python3 tools/b3_story_test.py` (the first unswitched chapter is now 19, pool 2430, floor 45); `python3 tools/battle_guide_test.py` (the fake gain is the chapter 19 Brass Mail-Chute Courier); `python3 tools/smoke.py`; `python3 -I tools/clip-audit/unused_voice.py`. |
| Battle Guide | The Studio Rig leaves the planned list by itself; `data/guide-anims.json` rebuilt. |
| Waits | Chapters 19 and 20, then stage 23. Chapter 19's Brass Mail-Chute Courier (Wall Perch, swaps rows every turn) and the Dead-Letter Censor's REDACTED stamp may need rules fields. |

## What stage 22 chapter 20 holds (build `b3s22ch20`, 2026-11-23)

Card c-b3s22ch20. Chapter 20 only (the studio again, the Forever Engine: Blue Lens and Orange Lens, The Collector; bestiary entries 84 to 86). No number changed: the Collector is 5,140 HP (3,860 for three) as printed. Evidence: simulator (`--support=4`, Rank 2, level 50, Tom, Grace, Rose and Amy with the bench picked by the simple player, 8 fights): 8.58 rounds on average, every fight won. The bestiary table aims at 7 and its text says "about 8.5 with its two lenses", so the check window is 6 to 9. Before the pick-four step was added to the simulator the same fight measured 7.55 rounds.

| Item | Built |
|---|---|
| Foes | `data/b3-foes-ch20.js`: `leviathan` (The Collector, boss, Front, 5,140 HP and 3,860 for three, Atk 219, Def 92, Spd 124, 8 pips, no running; the foe id stays `leviathan` because the map monster and the flags are named for it), `bluelens` and `orangelens` (helpers, Back, 500 HP, never attack, 0 pips). Formation `leviathan` (90 Vibe Points, `repick:true`). Julian Vance (entry 86) has no row: he is not a fight. |
| Phases | `phases:{lines:[.66,.31]}` on a foe row. `b3PhaseFloor` is the HP line; `b3Hurt` and the `hpLoss` op stop on it (damage past a line is lost) and mark `phaseDue`; at the end of that turn (`b3EndTurn`, then `b3PhaseCheck` in `engine/b3-last.js`) the phase goes up by one, party Still Frames are cleared, a charge the foe had started is lost, and the foe is the next to act (`wait` 0). A phase act is a once act with `when:{phase:n,once:true}` (act condition `phase`), so it comes first. |
| Helper links | `helperLinks:[{id,reduce,flavors?,untilPhase?}]` on the boss row; each living helper adds a damage-reduction mod (stacks, 60% cap). Blue Lens halves Sizzle and Razzle, Orange Lens cuts everything by a quarter; both end in phase 3 ("drops its resistances"). Feedback is the chapter 13 shape: a lens knocked out costs the Collector 2 pips and 5% of its Max HP (flat, stops on a phase line). Mods are rebuilt by `b3AllyModsRefresh` (also used when the four change). |
| Lens Set | Phase 2, once: the `summon` op puts both lenses in Back at 500 HP with 0 pips. |
| Still Frame | Phase 1 act on everyone (op `stillFrame`): each living family member is framed. Before the end of their next turn they must be moved on the bar or in the rows (a Pull, Push, row trade or granted action on them) or take part in a Mix or a Detonation (`b3FrameMove`, called from the timeline, the `row`, `grant` ops, the Ruckus Mix and the Detonation). Waiting does not count. A member who did neither loses 2 Pep (not below 0) and is Slowed for 1 turn (`b3FrameCheck`). |
| Countdown | Phase 3, once: a charge act (Recovery 200, which at Speed 124 is about 161 ticks, two round dividers) that refills the Collector's 8 pips (`refillPips`) and winds up The Biggest Picture (Razzle 3.0 on everyone, then -3 Pep and Slow 2 turns for all). `noInterrupt` on that act makes an interrupt Skill skip it; a Break loses the charge (the existing rule). Once only: the bestiary prints no repeat, so it does not come back after a Break. |
| The last fight | `endsFight:true` on the boss row: when it falls the fight is won and the lenses go dark (`b3KoCheck`). |
| Pick the four again | `reserve` on the fight (the bench). At each phase change `F.repick` is set and `b3Flow` stops at `engine/b3-repick.js`: a page of all eight (IN NOW, FRESH or BENCH, HP and Pep), tap four, CONTINUE. `b3Repick` (`engine/b3-last.js`): a newcomer arrives at full HP with 4 Pep, a returning member keeps the HP and Pep they left with and loses statuses; each takes the leaver's key, row and slot and joins the bar waiting 100 x 100 / Speed ticks; at least one stands in Front. The only place a party swap happens during a fight (spec 2.1). `b3RepickAuto` picks for the simple player and the Lab's auto fights (the four who have fought least, then the healthiest). Wiring: `B3.cfg.reserve`, `F.everIn` (everyone who fought). |
| The story | `b3sBegin` hands the fight the bench (`plan.repick`); `b3sAward` pays XP and counts the win for everyone in `F.everIn`, and `b3sEnd` writes HP back for them (a bench member who never came in keeps theirs). |
| Julian | `data/scenes-ch20.js`: on Battle 3 `ch20Shatter` ends with `SCENES.ch20Care()` (a short scene of the family each doing a kindness, then `battle:julian` win, so the Calm scene follows). Battle 2 keeps its seven acts of care. Julian's A press no longer starts a fight on Battle 3. |
| Statuses | `shutter_cut` (-25% Defense, 2 turns). |
| Lab | NEW 98: the Collector, Tom, Grace, Rose and Amy, bench Deedee, Boppy, TNB and Nara, level 50. |
| The switch | `B3_STORY.chapters` has 20 (and 21, the bonus), `levelFloor` has 50 (length 21), tips `ch20` (phases, Still Frame, lenses, Countdown). No chapter of the story is left on Battle 2. |
| Tests | `node tools/b3-sim.js check` (`tools/b3-check-s22ch20.js`); `python3 tools/ch20_b3_test.py` portrait and landscape (`tools/night/tests.json`, `ch20_b3_test`; it taps the pick page at both phase changes); `python3 tools/b3_story_test.py` (no unswitched chapter is left; the cases that used chapter 20 as "off" now say it is on, floor 50); `python3 tools/battle_guide_test.py` (every monster is built now, so the planned-monster cases are run on a copy of the planned list that keeps the Collector as a not-yet-built monster). |
| Battle Guide | `data/guide-planned.json`: the bestiary's single entry `lens` (the two lenses) now drops when `bluelens` exists (`BUILT_AS` in `tools/guide_planned.py`); `data/guide-anims.json` rebuilt. |
| Waits | Stage 23. |
