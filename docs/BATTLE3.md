# Battle 3 (the v11 battle system)

"Battle 3" is the code name of the new battle system. The player never sees the name. It is being built in stages beside the live battle ("battle 2", `docs/BATTLE_SYSTEM.md`) and replaces it only at the last stage. The design, the gap table and the 23-stage plan are in the Project: `claude/battle-architecture.md`. The rules are `claude/battle-spec-v11.md`, the enemies `claude/bestiary-v11.md`, the settled calls `claude/battle-v11-decisions.md`.

| Question | Answer |
|---|---|
| Where it is played today | ADMIN > BATTLE LAB > NEW BATTLE (first choice on every Lab page). Story fights still use battle 2. |
| Naming | Every Battle 3 global starts with `B3` or `b3`, every file with `b3-`. The game is classic scripts in one shared scope, so the prefix is what lets old and new load together. |
| The one structural rule | Rules first, pictures second. The rules work out the whole result of an action and return a list of beats. The play layer shows the beats. The rules never wait for an animation. |
| Stages built so far | Stage 1, the core loop (build `b3s1`), and stage 2 (build `b3s2`): statuses, caps, shields, healing, knock-outs and Pick-Me-Up, rows, aggro, the hook bus, wards, intercepts, hazards. What is in and what is not: the tables at the end. |

## Files

| Layer | File | Job |
|---|---|---|
| Rule numbers | `data/b3-rules.js` | Every number in spec sections 1 and 2, the flavors, the Detonation table, the level stat table |
| Statuses | `data/b3-status.js` | One row per status, buff, stance, mark and Prime (`B3_STATUS`), and the hazards (`B3_HAZARDS`) |
| Kits | `data/b3-kit-<id>.js` | Per character: Vibe rows and move rows |
| Enemies | `data/b3-foes-ch<NN>.js` | Stat lines, acts, formations |
| Lab | `data/b3-lab.js`, `engine/b3-lab.js` | The NEW BATTLE fights and their list on the title screen |
| Rules (no drawing) | `engine/b3-core.js`, `b3-timeline.js`, `b3-hooks.js`, `b3-ops.js`, `b3-resolve.js`, `b3-foe.js` | Fight state and stat maths, the tick clock, hooks, effect ops, one action from cost to beats, the enemy turn |
| Play layer | `engine/b3-play.js` | Beats to pictures: default animations, numbers, the view the screen shows, Battle 3's own draw function |
| Screen | `engine/b3-ui.js` | Start and end, the turn flow, turn bar, party cards, command cross, lists, targeting, input |
| Check | `tools/b3-sim.js` (node), `tools/b3-check-s2.js`, `tools/b3_test.py` (browser) | Fights with no screen and the rule tests (stage 1's groups in `b3-sim.js`, stage 2's in `b3-check-s2.js`; `check` runs both); fights on screen with contact sheets |

The six rules files never touch the canvas, the page, a timer, battle 2 or the game's own party and monster objects. `tools/b3-sim.js` loads them into an empty sandbox, so a rules file that reaches for any of those fails there.

## Changing things

| To change | Edit | Engine edit |
|---|---|---|
| Any number (HP, power, Pep cost, percent, length, cap) | A `data/b3-*.js` row | No |
| What a move does, when existing ops cover it | Its `effects` list | No |
| An enemy's acts, Pet Peeves, formation | Its row in `data/b3-foes-ch<NN>.js` | No |
| A new kind of effect | A new op in `engine/b3-ops.js` (the full list is `B3_OP_LIST`; an op in the list with no function throws "not built yet") | Yes, small |
| A new moment to react to | `B3_HOOKS` in `engine/b3-hooks.js` | Yes, small |
| What a status or a hazard says in the list the player opens by tapping a unit | Its `desc` (and `short`, `color`) in `data/b3-status.js`. The data check fails a status with no `desc`. | No |
| A ward (an answer when hit) | A status row with `on:{afterHit:{carrier:'target', from:'foe', tags:[...], limit:'action', react:true, effects:[...]}}` | No |
| Who steps in for whom | A status row with `intercept:{reduce}`; the `intercept` op puts it on the allies | No |
| A Trait or a Quirk | A row in `B3_TRAITS` or `B3_QUIRKS` with `on` (a hook name) and the listener fields at the top of `engine/b3-hooks.js`. A party unit picks up the rows its Vibe names. None are written yet (stage 5). | No |

An action's beats come in this order: `pre` (cost, set-up), one group per hit (`g` is the hit number), `post`, then one group per reaction (`g` is `r0`, `r1`...: a ward's answer, played after the move that set it off), then `end` (what the turn's end wrote: statuses and shields running out, the new wait, the fight ending). A hazard's slip comes before the enemy's `act` beat.

A fight is one plain object `F` from `b3NewFight(cfg)`. `b3Next(F)` moves the clock to the next turn, `b3Act(F,unit,skillId,targetKey)` and `b3FoeTurn(F,unit)` resolve an action. Each returns beats (the list at the top of `engine/b3-resolve.js`). Random numbers come from the fight's seed, so the same seed replays the same fight in the simulator and on screen.

## Where it meets the rest of the game

| Place | What |
|---|---|
| `battle.v3` | Set while a Battle 3 fight runs (`battle.v2` is battle 2's). |
| `engine/battle.js` `updateBattle` | Calls `b3Update(dt)` |
| `engine/battle-draw.js` `drawBattle` | Hands the frame to `b3Draw()`. Battle 3 draws its own party and enemies: battle 2's party drawing reads battle 2 state in a dozen places (architecture risk 2). |
| `engine/draw.js`, `engine/main.js` | Keys and gamepad go to `b3Key` and `b3Pad` |
| `engine/painted.js` `paintedWanted` | Loads the painted sheets a Battle 3 fight needs |
| `engine/splash.js` | NEW BATTLE on the Lab pages; `engine/b3-lab.js` adds the `lab3` list |
| `index.html` | `#b3-bar` and `#b3-ui`, with the same layout classes as battle 2 (`.b2-ribbon`, `.b2-ui`, `.b2-party`, `.b2-cmd`), so portrait, landscape and tablet sizes are shared. `#battle` carries both `v2` (the shared layout) and `v3` during a Battle 3 fight. |

Helpers Battle 3 borrows from battle 2 files (the purge stage must move or rename them, not delete them): `b2Meter`, `B2_METER`, `b2MeterTag`, `b2BattleDef`, `b2CanvasPt`, `b2Esc`, `b2Portrait`, `b2Thumb`, the `.b2-*` layout classes and `.b7-tools`, `b7FoeHp`, `b7Taken`, `b7FoeSpeed`, `b7ToggleSpeed`, `B7.speed`.

## Testing

```
node tools/b3-sim.js check            # data check and rule tests: FAILS: []   (tools/smoke.py runs this too)
node tools/b3-sim.js new1 200         # 200 fights with the simple player: wins, rounds to win, knock-outs, errors
node tools/b3-sim.js new2 1 --seed=7 --log
python3 tools/b3_test.py              # every NEW BATTLE fight on screen, portrait and landscape; sheets in tools/shots/b3-*.png
```

`tools/b3_test.py` plays each fight by hand through the real screen (keys and taps), checks that Windex Spritz then a Clobber hit shows Hydro-Slip!, compares the on-screen turn order with the simulator for the same seed, plays a fight to the lose screen, and checks a battle 2 fight still owns its screen afterwards. On the Pond Grump fight it also runs the stage 2 moves (section 5 in the file's header): there it aims the monsters with pokes (a test taunt, `actIx`) so every run shows a slip, a ward's answer, an intercept, an interrupt and a revive. All four fights take about 12 minutes; one fight: `python3 tools/b3_test.py new3`. Look at the sheets before pushing.

Gotcha for any test that drives the SKILLS list with the keys: move the mouse off the list first (`pg.mouse.move(2,2)`). A mouse left resting over a row moves the cursor to that row every time the list is redrawn.

## What stage 2 holds, and what waits

| In (build `b3s2`) | Waits for |
|---|---|
| Statuses: Stun (a lost turn, or 30 ticks on a Boss), Bleed, Mend, plus the kit rows; every row has a sentence for the player | The enemy-only statuses of chapters 2 on (each arrives with its chapter) |
| Shields: soak before HP, 40% of Max HP in total, 3 turns, a fully soaked enemy hit leaves no status. Healing by share of Max HP, `healGiven`. | A kit Skill that gives a shield or a heal (none in the four first Sig Vibes' Skill 1 and 2). The ops are tested with test rows. |
| Knock-out, Pick-Me-Up (4 Pep, 25% HP, back on the bar 100 ticks out), standing up at 1 HP after a win | |
| Party rows (default by Lean, `rows` in the fight's cfg, at least 1 in Front), Back row weighs 60, taunt flag, untargetable flag | A way for the player to choose rows (the Vibes menu, stage 4). Enemy Taunt on a family member (chapter 5). |
| The hook bus: statuses and passives listen, with `limit` (action, round, battle) and reactions that run after the action | The Trait and Quirk rows themselves (stage 5) |
| Wards (Zone One Blockade), intercepts (Suite Door Slide, +1 Pep per enemy action), hazards (Wet-Floor Hazard), interrupts (Crunchy Sugar-Cube Pop) | Composure: the `composure` op only writes into the action's ledger; stage 3 pays it out. Marks. |
| Ops built: damage (also with its own power, for answers and falls), status, prime, intercept, strip (n or all), cleanse, heal, shield, revive, push, pull, place, pep, interrupt, hazard, counter, crack, composure (ledger only), splash | steal, invert, swapBar, ruckus, ward as its own op (a status row does the job), mark, grant, aggro, taunt, pullForward, detonateAll, later, summon, row |
| Skill 1 and Skill 2 of Frequent Flier, Squishy Collector, Sugar Rush and Neat Freak | Their Capstones, Traits and Quirks (stage 5) |
| Pond Grump and Bog Toad, formations `grump` and `toad`, Lab fights NEW 3 and NEW 4 | Log Lump and The Big One (stage 3) |
| The full list on tap: a party card or a monster, while the cross or the SKILLS list is up (keys: I, up and down, Esc) | Preview, Pet Peeves in the list, gamepad for the list (stage 7) |
| The simple player scores wards, hazards, intercepts, interrupts and revives in "damage worth" | |

Simulator, 300 fights each with the simple player, level 2 party: two Mudlings 1.85 rounds, Mudling and Skeeter Swarm 1.90, Pond Grump and Mudling 2.60, Bog Toad and Skeeter Swarm 2.25. The stage's target was 2 to 4. The first two are just under it with the bestiary's printed HP (its own model, section 1.6, gives 1.6 and 1.9 for them); nothing was changed, the balance pass (stage 14) owns enemy HP.

Calls made in stage 2 (all in data): Zone One Blockade's answer is a standard Clobber hit, once per enemy action; an answer or a fall can set off a Detonation like any hit; Suite Door Slide covers the neighbours Tom has when he uses it, for 2 of their turns; Crunchy Sugar-Cube Pop is a light hit; "Giddyup, Tata!" Launch is Sizzle then Clobber, heavy in total, and the ally who gets +20% Attack (2 turns) is the next family member due on the bar; Wet-Floor Hazard catches acts tagged melee, its fall is a light Clobber hit, and it dries after 3 rounds; the Scrub's +25% per buff is added to its own Clobber hit; a two-flavor move leaves only its first flavor's Prime (spec 2.5, enforced now); a revived member waits 100 x 100 / Speed ticks; Pick-Me-Up uses a Skill's Recovery; the Lab party stands Grace, Tom, Rose, Deedee so Tom has two neighbours.

## What stage 1 holds, and what waits

| In (build `b3s1`) | Waits for |
|---|---|
| Tick timeline, Recovery, 100-tick rounds, push, pull and place with halving, the forecast | Flustered (stage 3), granted actions (stage 5) |
| Pep 0 to 10, start 4, Basic +2, the +3 a round refund cap | Cost discounts (stage 5) |
| Damage formula, power tiers, the all-foes 70% rule, Pet Peeve and Resist, crits, Evasion, accuracy penalties, Back row | Shields, healing, the full caps test file (stage 2) |
| The 3 Primes and the 6 Detonations (rule tests set off every one) | Composure pips (stage 3), Ruckus gains (stage 6) |
| Statuses with same-kind-adds and different-kinds-multiply, 13 rows | The rest of the status table, the 3-icon full list on tap (stage 2) |
| Enemy turn: printed-order cycle, "every Nth turn", charge_up telegraphs, aim by aggro weight | Marks, waits in rounds, counters, adds, phases, interrupts (stage 3) |
| Tom, Grace, Rose, Deedee: the Basic of their first Sig Vibe; NeeDoh Stretch Pass; The Floor Is Lava! | Stat Leans and ranks (stage 4), Traits and Quirks (stage 5), everything else in the kits |
| Mudling and Skeeter Swarm, formations `mudling` and `skeeter` | The rest of chapter 1 (stages 2 and 3) |
| Turn bar with round dividers, a ghost for the highlighted move and sliding faces; party cards with 10 Pep dots; the new cross (RUCKUS and BAG greyed); tap an enemy or a party card to aim; keys and gamepad | Preview, inspect, Rose Mode pictures (stage 7) |
| Default animations by shape (strike, cast, throw, give), hit and knock-out looks from existing frames, win and lose | Body-state table finished, clips, enemy hold (stage 8); spoken lines for the new moves (none exist yet); the victory card and rewards (stage 15) |

Pace: `B3_TEMPO` in `engine/b3-play.js` stretches every default move animation (2 since `b3tempo1`: Tom found the first build about 2x too fast).

Calls made in stage 1 (all in data, all changeable without engine edits): a multi-hit move's power is the whole move's power shared by its hits; an enemy's announce turn uses Base Recovery 80; "every 3rd turn" starts counting again after the act fires; a status put on yourself during your own turn does not count that turn; a turn's wait is set before its statuses count down, so a 2-turn Slow slows two Recoveries; Short Circuit!'s splash is 40% of the hit that set it off; NeeDoh Stretch Pass puts the ally at the very front of the bar; Buzz Cloud comes up only after Jitterflight was stripped, not when it runs out.
