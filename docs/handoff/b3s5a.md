# Handoff: b3s5a (Battle 3, stage 5a of 23), 2026-11-18

Plan: `claude/battle-architecture.md` in the Project (sections 2 and 5). Tracker: `claude/battle-build.md` (it holds the rule for when Tom tests: only at four milestones, the first after stage 8). Repo doc: `docs/BATTLE3.md`. Kit lines sorted into ops or custom: `claude/battle-kit-ops.md` (5b's lines: 8 to 14 Tom, 29 to 35 Grace, 57 to 63 Rose, 85 to 91 Deedee).

## What stage 5a left

| Item | State |
|---|---|
| The four first Sig Vibes | Complete: Frequent Flier, Squishy Collector, Sugar Rush, Neat Freak. 4 Traits, 8 Quirks, 4 Grand Capstones written; none of their rows is `soon` and none of their Skills is in `B3_SOON`. |
| The four second Sig Vibes | As stage 4 left them: Basics, three Skill 1s; 4 Traits and 8 Quirks `soon:true`; 9 Skills are names in `B3_SOON`: Rose's Skill 1 (Tattered Lamby Boomerang), the four Skill 2s and the four Capstones. |
| One-off rules | `engine/b3-custom.js` (new, a rules file, loaded by the simulator): Twin-Lamb Relay. Its comment says what a "rider" is and names the three seams that call it. |
| Granted action | `grant` op, `F.grant`, `b3GrantSkills`, the free branch of `b3Act`. Screen: `b3AfterAct` and `b3Granted` in `engine/b3-ui.js`. Simulator: the `while(F.grant)` loop in `play`. |
| Family Ruckus | Only the number: `F.ruckus`, the `ruckus` op, a `ruckus` beat the screen stores and does not draw. |
| Rule tests | `node tools/b3-sim.js check`: CHECKS: 685, FAILS: []. Stage 5a's groups are 82 to 100 in `tools/b3-check-s5.js`. |
| Screen test | `python3 tools/b3_test.py s5` (about 3 minutes); the whole file is about 35 minutes now. |
| Tom's phone check | Not asked for (the tracker's rule). |

## Things stage 5b should know

- A row's shape: `on` + listener fields + `effects`; or `listen:[...]`; plus `mods`, `counter`, `custom`. Copy the nearest row of 5a: Upgrade Certificate (a counter, a mod that counts and spends it), Million-Miler Status (two listeners, one a quiet answer), Spotless Floor (a condition and a once-a-round limit), Ultra-Rare Limited Edition (a mod on the move's Recovery).
- Conditions are short lists in code. A listener's: `B3_LISTEN_IF` and `b3ListenOk` (`engine/b3-hooks.js`). A mod's: `B3_MOD_WHEN` and `b3ModWhen` (`engine/b3-core.js`). A damage bonus's: `B3_CONDS` and `b3Cond` (`engine/b3-resolve.js`). The data check fails a row that names one that is not there. 5b will need at least: a mod `when` for "the target has a Pet Peeve hit or a Prime" (Gamer's Intuition), "holder has a Rose shield" (Mint-Condition Backup), a cost mod (New Game Plus, First-Ring Pickup: `b3Cost` has no mods yet), a `later` op (Tattered Lamby Boomerang, Kingdom of Ten-Thousand Blankets), `cooldown` on a Skill (Sofa-Cushion Citadel, "Bring a Jacket!" Ward), statuses that last longer when Grace puts them on (Permanent Marker), immunity flags (Warm Beats Cold), a shield from overheal (Forty Years a Nurse), survive-at-1-HP (the Ward).
- A mod with `when` only counts where a ctx is passed: in `b3Hit` (damage dealt and taken) and in `b3MoveRec`. `b3Stat`, `b3Evasion`, the tick damage and the splash pass none. A new place that should honour conditional mods has to pass one.
- `per:{counter, spend:true}` marks the counter in `c.spend` the moment the mod is used in a hit; `b3SpendCounters` empties it when the action (or the answer) ends. A counter that should not be spent leaves `spend` out.
- `show:true` makes a `passive` beat; the screen pops the name over the holder and writes "<Name>: <Trait or Quirk>." in the log. Use it where nothing else on screen would say why a number moved. A reaction (`react:true`) already announces itself.
- The `counter` hook now fires before the answer's ledger is paid and carries `c`. The `intercept` event changed shape (src is the attacker, tgt who stepped in, `for` the protected one).
- The free action leaves `F.acting` null, sets no wait, counts no turn, fires no `turnEnd` (so Sensory Satisfying is not judged after it) and does fire `actionDeclared` and `actionEnd`. `b3Next` closes a grant nobody took.
- Cartridge Blow's second half is still open (custom line 9). Double Coat is custom line 35.
- The simple player: a free Skill, all-monster moves, taunts are scored. Still no score for a shield or a buff on an ally: 5b's Sofa-Cushion Citadel, "Bring a Jacket!" Ward and Kingdom of Ten-Thousand Blankets need one or the simulator will never use them.
- `tools/b3-check-s4.js` group 68 looks for a Skill that is still only a name in Gamer Geek; when 5b writes Winged Shell Lock-On and Konami Code that part skips itself.
- The stage 2 and 3 sections of the screen test still run on bare units (`plain`), so nothing here moved them. The six hand-played fights use real loadouts at Rank 2: Traits are on in them now (Tom's GUARD chip at the start, SATISFYING on whoever follows Grace).
- Spoken lines: still none for any Battle 3 move (`line:null`), 24 moves waiting, Pick-Me-Up included (architecture risk 8).

## Still owed from the architecture's risk table

| Risk | Owed |
|---|---|
| 1 | Closed in the sorting doc; 5a's one custom line took about 30 lines of code and three seams, as estimated. |
| 4 | Balance is still paper: Rank 5 with Quirks takes The Big One to 3.64 rounds against a 5 to 7 target (table in `docs/BATTLE3.md`). Stage 14 owns it. |
| 6 | Tom's verdict on the turn bar in portrait (milestone A). |
| 8 | Lines for the built moves (24 now). |
