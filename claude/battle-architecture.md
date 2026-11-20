# The Adventures of Tom: architecture for the new battle system (2026-11-18)

Status: a design and a build plan. No engine code is written and nothing is pushed. Read against repo main e14f766 (build voicefilter1).

| Question | Answer |
|---|---|
| What this replaces | "Battle 2", the built battle (engine/battle2*.js, data/battle2-data.js, data/abilities.js). |
| What it implements | claude/battle-spec-v11.md and claude/bestiary-v11.md, with the settled calls in claude/battle-v11-decisions.md. |
| Code name | "Battle 3". Every new global starts with `B3` or `b3` and every new file with `b3-`. Fact: the game is classic scripts in one shared scope, so the prefix is what lets old and new load together. The player never sees the name. |
| The one big structural change | Rules first, pictures second. Battle 3 works out the whole result of an action at once and writes it down as a list of beats (hit, Prime, Detonation, pips, push). A separate layer then plays the beats. In battle 2 the animation itself applies the damage as it runs. |
| Why that change | (1) A video clip can show the hit on its marked impact frame without the rules depending on the clip. (2) The rules can run with no screen, so a script can play thousands of fights to check balance. (3) Tuning numbers never touches animation. |
| Words used below | Beat: one thing the player sees happen. Hook: a moment the rules announce (turn start, hit landed) that a Trait, Quirk or status can react to. Op: one small effect the engine knows how to do (deal damage, push, add a status). Seam: the place where two pieces of code meet. |

## 1. Gap table: spec v11 against battle 2

Verdicts: Reuse (works as is), Change (keep the piece, alter it), New (build), Delete (goes when battle 2 goes).

| # | System in spec v11 | What battle 2 has today (fact) | Verdict |
|---|---|---|---|
| 1 | Battle screen, 576 x 324 stage, backdrops, step queue | `drawBattle`, `BG_FILES`, `enqueue` in engine/battle.js and battle-draw.js | Reuse |
| 2 | Party and enemy drawing, painted sheets loaded per fight | `drawBattle` party loop, `b2DrawEnemies`, engine/painted.js | Reuse, through the same seam battle 2 uses (`battle.v2`; add `battle.v3`) |
| 3 | Move choreography | `ST.play`, `ST.keys`, `ST.fly`, RFX scenes, PROPART | Reuse, as one of three animation kinds |
| 4 | Video clips with an impact frame | engine/clips.js: one-shot clips, Battle Lab only (`B2.labClip`) | Change: any fight, plus looping and hold-last-frame kinds |
| 5 | Tick timeline, Recovery, 100-tick rounds, push and pull with halving | CTB: `ct` counters, wait = 1200 / (PEP + 30) x weight, no rounds, no pushes | New. The ribbon drawing is changed, not rebuilt |
| 6 | Pep 0 to 10, start 4, +2 on a Basic, refund cap +3 a round | VP 0 to 10, start 5, +2 every turn | Change |
| 7 | HP, Attack, Defense, Speed, Crit, Evasion | Six stats (HP, POW, GRIT, WARMTH, COOL, PEP) on straight lines level 1 to 50 | New stat table. Levels 1 to 50 kept |
| 8 | Damage formula, Skill Power tiers, caps | `b2Damage` with its own formula | New |
| 9 | 5 flavors plus Support, Pet Peeve 1.5x, Resist 0.65x | 6 elements, weak 1.5x, resist 0.5x | Change. Kinetic = Clobber, cozy = Sizzle, splash = Drench, sparkle = Razzle, chatter = Racket. Amber is deleted |
| 10 | 3 Primes, 6 Detonations | None | New |
| 11 | Composure pips, Break, Flustered | Boss "Stagger shields" (`b2ShieldHit`, `b2BreakShield`) | Delete the old, build new |
| 12 | Statuses, same-kind add and different-kind multiply, caps | `B2_STATUS`, about 70 rows, one additive pool, no caps | Change: new table, same idea |
| 13 | Shields that absorb HP, 40% cap | None (the old "shield" is a damage cut) | New |
| 14 | Front and Back rows on both sides, slots, adjacency | Enemies have rows (3 front, 2 back). The party has none | Change |
| 15 | Aggro weights, taunt, intercept | Tom's DEFEND redirect only | Change: made general |
| 16 | Enemies act from fixed act lists: telegraph, Mark, waits, counters, adds, phases | `acts` with `every`, plus 8 hand-written boss turn functions and per-chapter battle scripts (data/ch12-battle.js to ch20-battle.js) | Delete the old, build one act runner |
| 17 | 90 bestiary entries | `B2_FOES`, with many monsters' numbers worked out at run time from old data | New data. Ids, names and art stay |
| 18 | Formations (bestiary section 4) | `B2_FORMATIONS`, some of random size | Change to the fixed lists |
| 19 | 10 characters, 30 Vibes, 120 moves | 14 moves each in `B2_SKILLS` and `B8_KITS` | Delete the old, new data |
| 20 | Character Level by shared XP | `b6GainXp`, `b6Sync` (everyone catches up to Tom) | Reuse. XP amounts retuned in data |
| 21 | Vibe Mastery: VP, 5 ranks, Main, Pocket, 2 Quirk slots, Casual Mode | Stampcards, Polish Points, Remix Tickets, Loadouts | Delete the old, build new |
| 22 | 30 Traits, 60 Quirks | engine/battle2-traits.js, hand-written | Delete the old, rebuild as data plus hooks |
| 23 | No Kindness in battle | Warmth bars, likes, HEART, praise, "calm" wins, Kindness Scrapbook flags | Delete from battle. The boss ending scenes (engine/boss-finale.js) stay as the scene after 0 HP |
| 24 | Family Ruckus gauge, Dual Ruckus | HEART meter, 51 Tombo rows | See section 3 |
| 25 | KO, Pick-Me-Up, stand up at 1 HP after a win | KO and revive exist | Change |
| 26 | Command cross | Up ATTACK, right HEAL, left WARMTH, down BAG | Change to BASIC, SKILLS, RUCKUS, BAG |
| 27 | Tap to target, keyboard, gamepad | Built (`b2TargetAt`, `b2Key`, `b2Pad`) | Reuse, plus tap to preview |
| 28 | Rose Mode picture menus | engine/battle-pictures.js redraws the same buttons as pictures | Change: same button contract, new icons |
| 29 | Difficulty modes | `B7_DIFF` multiplies finished numbers | Reuse |
| 30 | Bag and running (the spec is silent, the bestiary lists drops and "no running") | BAG list, item steps, run steps | Reuse. Item effects re-described in data |
| 31 | Gear (the spec is silent) | Flat stat bonuses and Charm perks | Change: a mapping table in data |
| 32 | Victory card, coins, drops, level ups | `b7ShowCard`, `b2RewardsData` | Reuse, plus VP lines |
| 33 | Battle Lab | `B2_LAB`, title screen pages, SOLO, free resources | Reuse, plus a NEW BATTLE section |
| 34 | High-Five timing tap | Built: +15% and HEART | Delete. My call: the spec's damage model has no place for it and HEART is gone |
| 35 | Body states (hit reaction, dodge, KO fall, guard, stunned, low HP) | The audit found no party hit reaction and one shared enemy lunge | New, as a table in the play layer |
| 36 | A spoken line per attack | `LINES`, `say()`, baked clips | Reuse the mechanism. 120 moves need new lines |
| 37 | Saves | Slots plus autosave; every member's level, XP, gear and Stampcard | Change: add fields, remove none |
| 38 | Late joiners' VP pool, picking the 4 again in the last fight | None | New |
| 39 | Tests | smoke, kit_test, cross_test, fault_test (browser) | Reuse the pattern, plus a no-screen simulator |

## 2. Architecture

### 2.1 Modules and files

| Layer | File | Job | Data or code |
|---|---|---|---|
| Rules numbers | data/b3-rules.js | Every constant in spec sections 1 and 2: Recovery 80/100/120, power tiers, Pep, caps, Prime and Detonation tables, Composure cap, aggro weights, rank VP, Leans, Ruckus gains and costs, level stat table | Data |
| Statuses | data/b3-status.js | One row per status, buff, stance, mark and Prime | Data |
| Kits | data/b3-kit-tom.js ... b3-kit-olivia.js (10 files) | Per character: 3 Vibes, 12 moves, 3 Traits, 6 Quirks | Data |
| Enemies | data/b3-foes-ch01.js ... ch20.js, b3-foes-bonus.js | Stat lines, acts, formations, VP, boss mechanics | Data |
| Core | engine/b3-core.js | Fight state, units, start and end, stat maths with stacking and caps | Code, no drawing |
| Timeline | engine/b3-timeline.js | Tick clock, waits, round dividers, push, pull, forecast | Code, no drawing |
| Resolver | engine/b3-resolve.js | One action from cost to beats: targets, hits, damage, Primes, Detonations, Composure, Break | Code, no drawing |
| Ops | engine/b3-ops.js | The fixed list of effect ops | Code, no drawing |
| Hooks | engine/b3-hooks.js | The fixed list of moments, and running whatever data is attached to them | Code, no drawing |
| Enemy turn | engine/b3-foe.js | Picks and runs an act: telegraph, Mark, waits, counters, adds, phases | Code, no drawing |
| Ruckus | engine/b3-ruckus.js | Gauge, Mix detection, Double Team, Full Family Ruckus | Code, no drawing |
| One-offs | engine/b3-custom.js | Small named functions for kit lines and boss mechanics the ops cannot express. Their numbers still come from the data row | Code |
| Progress | engine/b3-progress.js | VP, ranks, overflow, loadouts, late joiners, save fields, migration | Code |
| Play layer | engine/b3-play.js | Turns beats into what the player sees: default animations, `ST.play` scripts, clips, body states, numbers | Code, drawing only |
| Screen | engine/b3-ui.js | Command cross, lists, turn bar, targeting, inspect, party cards | Code, drawing only |
| Rose Mode | engine/b3-pictures.js | Picture menus | Code, drawing only |
| Menu | engine/b3-menu.js | The Vibes screen in the pause menu | Code |
| Lab | data/b3-lab.js, engine/b3-lab.js | Battle Lab fights and the rank and loadout picker | Data and code |
| Check | tools/b3-sim.js (node), tools/b3_test.py (browser) | Plays fights with no screen; plays one fight on screen and saves frames | Tool |

Rule that makes the "no drawing" column true: the six rules files never touch the canvas, the page or a timer. That is what lets tools/b3-sim.js load them in node.

### 2.2 What is data and what is code

| To change this | Edit | Engine edit needed |
|---|---|---|
| Any number in the spec or bestiary (HP, power, Pep cost, percent, length, cap, VP) | A data file | No |
| A move's flavor, target, Recovery, Composure number, tags | Its kit row | No |
| What a move does, when it is built from existing ops | Its `effects` list | No |
| Which hook a Trait or Quirk listens to | Its row | No |
| An enemy's act list, conditions, waits, Pet Peeves, formation | Its foe row | No |
| A new kind of effect no op covers | A new op or a function in b3-custom.js | Yes, small |
| A new moment to react to | A new hook | Yes, small |

My estimate (not measured): about three quarters of the 210 kit lines (120 moves, 30 Traits, 60 Quirks) fit the ops below. The rest need a named function in b3-custom.js. Risk 1 in section 6 says how to measure it.

### 2.3 Data schemas

Shown as short samples. Field names are the design, values come from the spec.

| Schema | Sample | Notes |
|---|---|---|
| Vibe | `{id:'tom_flier', owner:'tom', name:'Frequent Flier', sig:1, lean:'guard', subtitles:['Sky Club Applicant','Diamond Medallion','Delta 360 VIP'], trait:'priority_boarding', basic:'lounge_pass_flex', skills:['zone_one_blockade','suite_door_slide','tarmac_porsche'], quirks:['upgrade_certificate','million_miler'], counter:null}` | `sig` 1 or 2 marks the default Main and Pocket. `counter` names a Portable Counter (Oven Temp, Reps, Tally) with its build rule, so it travels with a Pocket skill. |
| Skill | `{id:'controller_toss', vibe:'tom_gamer', slot:'s1', name:'Controller Toss', pep:2, flavor:['clobber'], power:'standard', hits:1, target:'foe', tags:[], composure:0, effects:[{op:'damage', bonus:{if:'tookHitSinceLastTurn', add:.40}}], line:'tom.controller_toss', anim:{kind:'default', shape:'throw'}, desc:'...'}` | `slot` is basic, s1, s2 or cap and sets the default Recovery and the rank that unlocks it. `power` is a tier name or a number. Two flavors are written `['drench','clobber']`. `anim.kind` is default, script or clip. |
| Trait and Quirk | `{id:'standing_ovation', on:'crit', who:'self', limit:null, effects:[{op:'pep', n:1},{op:'pull', n:15}]}` | `on` is a hook name. `limit:'round'` gives "1/round". Passive bonuses use `mods` like a status. |
| Status | `{id:'slow', name:'Slow', kind:'debuff', group:null, dur:{n:2, unit:'turn'}, mods:[{stat:'spd', kind:'speedDown', v:-.20}], flags:[], icon:'slow', weight:3}` | `kind`: buff, debuff, prime, stance, mark. `unit`: turn, round, hits or battle. `mods[].kind` is the stacking bucket: same kind adds, different kinds multiply. `flags`: skipTurn, blind, untargetable, pushImmune, lockPocket, taunt. `group:'mental'` for cleanses. `weight` picks the 3 icons shown. |
| Enemy | `{id:'bigone', name:'The Big One', ch:1, role:'boss', row:'front', hp:420, hp3:320, atk:28, def:17, spd:96, pips:6, peeves:['razzle','racket'], resists:[], start:['muffin_crown'], acts:[...], mechanics:[], drop:null, noRun:true, vp:30}` | Numbers are the bestiary's printed numbers. `hp3` or `hp4` is the other party size. A tool checks each line against the role and chapter tables and prints any that differ on purpose (Citation Slip). |
| Act | `{id:'swamp_chomp', name:'Swamp Chomp', flavor:['clobber'], power:1.5, recovery:120, hits:'marked', tags:['melee','charge_up'], effects:[], when:{}, after:'big_glare'}` | `hits`: one, all, two_random, two_adjacent, marked, fastest, attacker, self, foes, field. `when`: hpBelow, hpAbove, everyTurn, everyRound, once, waitRounds, phase, stance, notSameAllyTurns. `after` chains a telegraph to its follow-up. `grow:[2,3,'all']` for Wide Arms. Recovery 0 means a counter. |
| Boss mechanic | `{id:'still_frame', fn:'stillFrame', n:{pep:2, slowTurns:1}}` | The few rules too odd for acts (Still Frame, REDACTED stamp, the cache race, lens links, phase lines, picking the 4 again). One function each, numbers in the row. |
| Formation | `{id:'toad', ch:1, foes:[{id:'toad', row:'front'},{id:'skeeter', row:'back'}], vp:10}` | Slots are numbered left to right per side. Adjacent means neighbouring slot numbers. |
| Party seat | In the save: `row:'front'` or `'back'` per member | Default from the Main Vibe's Lean (Guard and Striker in Front, Support in Back, Tempo in Front). At least 1 in Front is enforced. |

The op list (code, fixed): damage, heal, shield, status, prime, cleanse, strip, steal, invert, push, pull, swapBar, place, pep, ruckus, composure, revive, counter (add or spend), ward (react when hit), intercept, mark, hazard (field effect for N rounds), grant (bonus action), aggro, taunt, pullForward, interrupt, detonateAll, splash, crack (battle-long Defense cut), later (fire after N turns), summon, row.

The hook list (code, fixed): battleStart, roundStart, turnStart, actionDeclared, beforeHit, afterHit, crit, dodge, primeApplied, detonation, pipsShaved, break, statusApplied, statusEnded, shieldBroken, shieldEnded, healed, cleansed, buffStripped, barMoved, intercept, counter, foeTelegraph, foeDoubleTurn, allyBelowHp, ko, revive, actionEnd, turnEnd, battleEnd.

### 2.4 Timeline and Recovery engine

| Piece | Design |
|---|---|
| Clock | One number, `clock`, in ticks, starting at 0. Every unit holds `wait`, the ticks until its turn. |
| Next turn | Take the smallest `wait`, subtract it from everyone, add it to `clock`. Ties: party before enemies, then slot order (battle 2's rule, kept). |
| After acting | `wait` = the move's Base Recovery x 100 / Speed, times any Recovery modifiers. Recovery 0 leaves `wait` alone. |
| Rounds | A divider sits at every multiple of 100 on `clock`. Crossing one fires `roundStart`: "1/round" counters reset, round-length effects count down, "every N rounds" acts become ready, halving counters clear. |
| Push and pull | Push adds ticks to a foe's `wait`. Pull subtracts from an ally's, never below 0. Each unit keeps a count of pushes (or pulls) taken this round and each one after the first is halved. A swap is one push and one pull of the gap, capped where the Skill says. |
| Flustered | Moved behind every unit due inside the next 100 ticks, pushes blocked, pips locked until its next turn ends. |
| Granted action | Resolved at once, in place, without touching the actor's or the receiver's `wait`. One per unit per round. |
| Forecast | The bar is worked out by running the same clock forward with every future action counted as Recovery 100. Highlighting a move re-runs it with that move's Recovery and its pushes and pulls, so the bar shows the result before the player commits. |
| Turn lengths | "2t" counts the carrier's own turns, at the end of each. "2 rounds" counts dividers. |

### 2.5 Pep, Composure, Prime and Detonate

| System | Design |
|---|---|
| Pep | Per character, 0 to 10, 4 at the start. One function, `b3Pep(unit, n, source)`, is the only way Pep changes. If `source` is not the unit's own Basic, it counts against the +3 a round refund cap. Costs pass through `b3Cost`, which applies discounts and the floor of 1. |
| Composure | Per Elite and Boss. Every action opens a small ledger per foe. Pet Peeve hit, Detonation, printed Composure numbers and helper feedback all write into the ledger. At the end of the action the ledger is paid out, capped at 3 (4 for a Full Family Ruckus). At 0 pips the Break runs. |
| Prime | A status of kind `prime` on the unit, 2 of its turns, with the time it was applied (for "oldest matching"). |
| Detonation | Before each flavor part of a hit lands, the resolver looks up (Prime held, flavor arriving) in the Detonation table in data. If one matches and this action has not yet detonated on that target, it consumes the Prime, runs that row's effect ops, gives +1 Pep through `b3Pep`, writes pips to the ledger, adds Ruckus, and skips applying this hit's own Prime. `detonateAll` lifts the one-per-target limit. |
| Two-flavor moves | Two half-power parts in order, each meeting Pet Peeve, Resist and the Detonation check on its own. |
| Mix | The Ruckus file remembers, per foe per round, which ally hit it with which flavor. A second ally with a different flavor is a Mix. Amy's Four-Tab Binder and the Red Pen's Strict Grading read the same record. |

### 2.6 Turn flow

| Step | Party turn | Enemy turn |
|---|---|---|
| 1 | `turnStart`: damage over time, regen, counters build, statuses that skip a turn | Same |
| 2 | Player picks BASIC, a Skill, a Ruckus, a bag item or Run, then targets | The act runner picks: (a) a forced act (a charged act now due, a Marked follow-up, a once-at-threshold act), else (b) an "every N" act that is ready, else (c) the next act in printed order that passes its `when` |
| 3 | Cost is paid, `actionDeclared` fires | A `charge_up` act only announces itself this turn and fires on the foe's next turn |
| 4 | Resolver builds the full result and the beat list. State is final here | Same. Targets by aggro weight, taunt, Mark or intercept |
| 5 | Play layer shows the beats. The screen's HP bars follow the beats, not the state, so nothing shows early | Same |
| 6 | `actionEnd`: Composure ledger paid, Break, KO checks, counter acts answer | Same |
| 7 | `turnEnd`: turn-length statuses count down, `wait` is set | Same |
| 8 | Win or lose check, then next turn | Same |

### 2.7 The play layer and the slot for video clips

| Piece | Design |
|---|---|
| Three animation kinds per move | `default`: built from the move's shape (strike, throw, cast, give, sweep) with frames every character already has, so all 120 moves work on day one with no art. `script`: a hand-made `ST.play` timeline, the format every current move uses. `clip`: an AI video clip. A move switches kind by changing `anim` in its data row. |
| The impact | Every kind ends up calling one function, `reveal(share)`, which shows that share of the beats. A script calls it where it used to call `landHit`. A clip calls it from `onImpact` on the marked impact frame. The rules do not wait on it. |
| Body states | One table, `B3_BODY[character][state]`, for the 11 core states in claude/battle-animation-states-v10.md (idle, low HP, guard, stunned, hit, dodge, KO, run, victory, give, cast). Each cell is either a painted frame key that exists today or a clip id. Replacing a frame with a clip is a data edit. |
| Loading | Only the clips for the 4 party members and their equipped moves load for a fight, and they are released with the other fight sheets (the rule engine/clips.js already follows). |
| Enemies | Painted sheets with engine motion, as the states doc recommends: a hold before the strike, a charge pose for telegraphs, a slump for Flustered. Clips for bosses later, through the same table. |

### 2.8 The screen

| Part | Design |
|---|---|
| Command cross | Up BASIC (fires the Main Vibe's Basic after a target). Right SKILLS (Main Vibe skills, then Pocket skills, then Pick-Me-Up when someone is down). Left RUCKUS (Double Team at 50%, Full Family Ruckus at 100%, grey with the reason when the next unit is not an ally). Down BAG (items, and RUN where the fight allows it). |
| Turn bar | The next 8 turns as faces, left to right, with a marked divider where a round ends. A ghost face shows where the actor lands for the highlighted move, and an arrow shows a push or pull on the target. Flustered and charging foes carry a badge. |
| Tap to preview | First tap on a move or a target shows the preview: Pep cost, flavor, PET PEEVE or RESIST on each foe, the Detonation it would set off, the pips it would take, and the bar result. Second tap confirms. With keys or a gamepad, moving the cursor previews and A confirms. |
| Targeting | Tap an enemy or its name, as built. Allies are tapped on their cards. Row and all-target moves light up everything they will hit. |
| Party cards | Face, HP, 10 Pep dots, the counter number on the portrait, at most 3 status icons (Prime, strongest debuff, strongest buff). Tap for the full list. |
| Enemy readout | HP bar, Composure pips, Pet Peeve and Resist icons once seen (all at once with Olivia's On The Record), the charging act's name and its Marked target. |
| Ruckus gauge | One shared bar where the HEART meter sits today, with notches at 50% and 100%. |
| Layout | Portrait first, landscape by the existing whole-stage rotation. The same DOM buttons serve touch, keys and gamepad, as in battle 2. |

### 2.9 Rose Mode

| Part | Design |
|---|---|
| Pictures | engine/b3-pictures.js draws the same buttons as pictures with at most one small word, the way engine/battle-pictures.js does now. New icons: 5 flavors, 3 Primes, Pep, pips, Ruckus. |
| Recommended move | One move carries a star. It is chosen by the same simple player the simulator uses, so there is one piece of code to keep right. |
| Loadouts | Automatic: Sig Vibes as Main and Pocket, newest Quirks equipped, the way Rose Mode auto-spends Stamp Points today. |
| Numbers | The existing mode multipliers (damage taken, monster HP) apply to finished numbers, unchanged. The emergency pie stays. |

## 3. Tombos, Director's Cuts and Family Finishes

| Thing | The call (recommendation) | Reason |
|---|---|---|
| Tombos as a rule (HEART cost, tiers, story-flag unlock of power) | Retired. Dual Ruckus replaces them. | The spec makes every pair work by one rule, and HEART no longer exists. Two combo systems side by side would need two meters and would break the bestiary's balance model. |
| The 22 Primary Tombo animations and their recorded lines | Kept as optional "named skins" for a Full Family Ruckus fired by Tom and that partner. The skin gives the name, the spoken line and the animation. The result is still the rule's: both top Skills. The story flag that unlocked the Tombo now unlocks the skin, so the story moments keep their reward. One skin per pair is live at a time: the newest unlocked. | The spec leaves exactly this slot open ("pairs that include Tom may later get their own name, line and animation"). It keeps Tom's recordings and the built animations in use at no balance cost, because a skin carries no numbers. |
| Which skins make the cut | Decided in a Move Lab review (Keep, Tweak, Replace per Tombo), stage 16. A Tombo whose picture is about hearts and Warmth and makes no sense on a damage combo is marked Replace. | Tom's standing rule for ability feedback. |
| The 25 Director's Cuts | Deleted with battle 2. | They are alternate cuts gated on level 30 and HEART, neither of which exists in the new rules. |
| The 4 Family Finishes | Deleted with battle 2. | They need 3 or 4 members. Dual Ruckus is pairs only, and the last boss is built around a pair's Full Family Ruckus. |
| When anything is deleted | Only at the last stage (the purge), after story fights have switched. Until then every Tombo keeps working in battle 2. | Nothing is lost early. Git history keeps the files after the purge. |

## 4. Migration plan

### 4.1 Old and new side by side

| Question | Answer |
|---|---|
| How both load | Battle 3's files are added to index.html after battle 2's. Prefixes keep them apart. The shared stage gets `battle.v3` next to `battle.v2`. |
| One door into a fight | `startBattle` (the function the map and the story both call) asks one switch which system runs this fight. |
| The switch | Three settings in ADMIN: OLD, BY CHAPTER, NEW. BY CHAPTER reads a list in data, `B3_STORY_CHAPTERS`. The setting lives on the phone, not in the save. |
| Battle Lab | A NEW BATTLE section sits beside the existing boss list from stage 1. The old Lab fights stay until the purge. |
| When story fights switch | Chapter by chapter, in order, each as its own stage: a chapter is added to the list only after every formation and the boss in it have passed in the Lab and the chapter test passes start to finish in portrait and landscape. Chapter 1 first, then 2 to 10 and the bonus. Chapters 11 to 20 switch as each is rebuilt to its locked script. |
| When battle 2 is deleted | When all 21 are on the list and Tom has played through. One purge stage removes the files, the lines, the voice clips nothing plays, and the docs, under the "purge completely" and "no unused voice" rules. |
| demo/ | Never touched. |

### 4.2 Saves and story flags

| Item | Plan |
|---|---|
| Rule | Add fields, remove none. An old save loads in the new build and a new save still loads if the switch is set back to OLD. |
| New per-member fields | `vibes:{main, pocket, quirks:[a,b], vp:{<vibe id>:n}}` and `row`. Missing fields are filled on load. |
| New shared field | The Ruckus gauge (0 to 100), stored where HEART is stored now. |
| Old fields (stamps, ranks, remix, loadouts, HEART, Tombo flags) | Kept and still saved. Battle 2 keeps reading them until the purge. After the purge they are ignored on load, not erased. |
| Level | Fact: battle 2 levels run lower than the bestiary expects (Lab level 13 at chapter 10 against bestiary level 25). On first load under battle 3 each member's level is raised to at least the bestiary's level for the furthest chapter reached, never lowered. XP per fight is retuned in data so a chapter pays about 2.5 levels. |
| VP for an existing save | Each member gets the spec's late-joiner treatment: a pool of 135 VP for each chapter finished, split two thirds to the first Sig Vibe and one third to the second, with overflow. Worked out once and stored. |
| Story flags | Untouched. Tombo unlock flags become skin unlocks (section 3). Kindness Scrapbook flags stay in the save and stop being written. |
| Gear | Stat bonuses pass through a mapping table in data (POW to Attack, GRIT to Defense, PEP to Speed, HP to HP). Perks with no v11 meaning are switched off in that table, not removed from items. |
| Autosave | Still after every real fight, as now. |

### 4.3 How the Battle Lab proves a stage

| Proof | What it is |
|---|---|
| Simulator | `node tools/b3-sim.js <fight> 200` plays the fight 200 times with no screen and prints rounds to win, knock-outs and any rule that threw. Runs in seconds. |
| Screen test | `python3 tools/b3_test.py <fight>` plays one Lab fight in a real browser, portrait and landscape, and saves a contact sheet of frames to look at. |
| Tom's check | He opens ADMIN, Battle Lab, NEW BATTLE, plays the named fight on his iPhone and reports. Each stage's handoff names the fight and what he should see. |
| Order | Nothing reaches a story fight before all three have passed for it. |

## 5. Staged build plan

Each stage is one conversation. "Lab fight" means a fight in ADMIN, Battle Lab, NEW BATTLE. Every stage ends with smoke passing, a CHANGES entry and bumped tags.

| # | Stage | Size | What Tom can do at the end | Test | Done when |
|---|---|---|---|---|---|
| 1 | Core loop. Rules files, tick timeline with Recovery and round dividers, turn bar, Pep, damage formula, flavors, Pet Peeve and Resist, the 3 Primes and 6 Detonations, win and lose, default animations, the new cross (RUCKUS and BAG grey), tap targeting. Tom, Grace, Rose and Deedee with each one's Basic from their first Sig Vibe plus two simple Skills (NeeDoh Stretch Pass, The Floor Is Lava!) | Large | Play Lab fight "NEW 1: TWO MUDLINGS" and "NEW 2: MUDLING AND SKEETER". Deedee's Windex Spritz then a Clobber hit sets off Hydro-Slip! and the foe visibly slides back on the bar | Simulator: 200 fights each, no errors. Screen test in both layouts | Both fights play to a win and a loss on screen; the bar matches the simulator's order; battle 2 fights still pass smoke |
| 2 | Statuses, modifier stacking and caps, shields, crits, evasion, KO and Pick-Me-Up, party rows, aggro, the hook bus, wards, counters, intercepts. Finish Skill 1 and Skill 2 of the four first Sig Vibes | Large | Lab fights against every chapter 1 normal formation except the Elite | Simulator on 4 formations; a unit test file for stacking and caps | Each formation ends in 2 to 4 rounds in the simulator; every status shows an icon and its full list on tap |
| 3 | Composure, Break and Flustered, telegraphs, Mark, interrupts, the full act runner (conditions, waits, counters, adds), Guard Stance, Mend | Large | Lab fights "LOG LUMP" and "THE BIG ONE" from the bestiary | Simulator; screen test of a Break and a cancelled telegraph | The Big One lands inside 5 to 7 rounds in the simulator with the chapter 1 party; Big Glare then Swamp Chomp can be taken by Tom or cancelled by Grace |
| 4 | Vibes: ranks, VP, overflow, Main, Pocket and Quirk slots, Leans, Portable Counters, the Vibes menu screen, the new save fields. No migration yet | Large | Open the pause menu, change Vibes, see it in a Lab fight. The Lab gets a rank picker | Save and load round trip test; old save loads | A battle 2 save loads with default Vibes; switching Main and Pocket changes the skill list |
| 5 | Traits, Quirks and Capstones for Tom, Grace, Rose and Deedee's two Sig Vibes each | Large | Lab fights at rank 5 with everything unlocked | Simulator at ranks 1, 3 and 5; one screen test per Capstone | All 8 Vibes complete; the list of kit lines that needed b3-custom.js is written down |
| 6 | Family Ruckus: gauge, Mix, Double Team, Full Family Ruckus | Medium | Fill the gauge and fire both in a Lab fight | Simulator checks the 4-pip cap and that the partner keeps their turn | Both spends work for any two allies next to each other on the bar |
| 7 | Preview and Rose Mode: tap to preview, inspect, the 3-icon rule, picture menus, the recommended move, keyboard and gamepad pass | Medium | Play a Lab fight in Rose Mode without reading | Screen test in Rose Mode, both layouts; cross test for every list | Every button reachable by touch, keys and gamepad |
| 8 | Play layer finish: body-state table, hit, dodge, KO and guard poses from existing frames, enemy hold before a strike, clip loading for any fight, Rose's strike clip playing through `reveal` | Medium | See Rose's video punch land its number on the impact frame in a NEW BATTLE fight | tools/clip_test.py extended; memory read on the iPhone | A move switches from default to clip by a data edit only |
| 9 | Kits: TNB, Nara, Boppy (two Sig Vibes each) | Large | Lab fights with the chapter 2 and 3 parties | Simulator | 6 Vibes complete |
| 10 | Kits: Amy, Justin, Olivia (two Sig Vibes each) | Large | Lab fights with any party of 4 | Simulator | 6 Vibes complete; all 10 characters playable |
| 11 | Bestiary chapters 2 to 4 with their bosses | Large | Lab fights for each formation and boss | Simulator report: rounds per fight against the bestiary's targets | Every fight inside its target or logged with a number to change |
| 12 | Bestiary chapters 5 to 7 | Large | Same | Same | Same |
| 13 | Bestiary chapters 8 to 10 and the bonus chapter | Large | Same | Same | Same |
| 14 | Balance pass on Part 1 from the simulator and Tom's Lab notes. Data only | Medium | Replay the fights that felt wrong | Simulator before and after | Every Part 1 boss at 5 to 7 rounds; no engine file changed |
| 15 | Story switch, chapter 1: the switch in ADMIN, level and VP migration, XP retune, victory card with VP, rewritten battle tips, chapter 1 on the list | Large | Play chapter 1 from Chapter Select on the new battle | Chapter 1 cases start to finish, both layouts; old save and new save load | Chapter 1 plays through; setting the switch to OLD still works on the same save |
| 16 | Tombo skins: Move Lab review of the 22 Primary Tombos, then wire the kept ones onto Full Family Ruckus | Medium | Mark Keep, Tweak or Replace in the Move Lab | Screen test per kept skin | Kept skins play with their recorded line |
| 17 | Story switch, chapters 2 to 5 | Large | Play them | Chapter tests | On the list |
| 18 | Story switch, chapters 6 to 10 and the bonus | Large | Play them | Chapter tests | On the list |
| 19 to 21 | Third Vibes, three or four characters per conversation, and Casual Mode | Large each | Lab fights | Simulator | All 30 Vibes complete |
| 22 | Part 2 bestiary, built inside each chapter's own story build (11 to 20), including helper links, the lenses, phase lines and picking the 4 again | One per chapter | Lab fight for that chapter | Simulator and chapter test | That chapter on the list |
| 23 | The purge: delete battle 2, Stampcards, Kindness in battle, Director's Cuts, Family Finishes, unused lines and clips, old Lab fights, old docs | Large | Nothing new to see; the game is smaller and loads faster | smoke, unused_voice (all checks 0), grep for `B2`, `b2` and `B8` returns nothing | No battle 2 file or reference left outside demo/ |

Stages 9 to 14 do not depend on 6 to 8 and can run in parallel conversations once stage 5 is in. Video clips are made on Tom's own schedule in the Art Library and drop in through the body-state table at any time after stage 8.

## 6. Risks and unknowns, ranked

| # | Risk or unknown | Why it matters | Cheapest way to find out |
|---|---|---|---|
| 1 | Too many kit lines do not fit the ops | If more than about a third need hand-written functions, "tuning without engine edits" is only half true and stages 5, 9, 10 and 19 to 21 grow | Before stage 2, sort all 210 lines into "ops" or "custom" in one table. One short conversation, no code |
| 2 | The shared drawing code is tangled with battle 2's state | Fact: battle-draw.js has 12 references to battle 2 and reads `battle.fx` timers that old moves set. If the seam is not clean, stage 1 grows | Stage 1 is the test. If drawing through `battle.v3` takes more than a small patch, stop and give Battle 3 its own party draw function |
| 3 | Story and scene files call battle 2 directly | Fact: data/scenes.js has 77 references, data/ch20-battle.js 84, engine/benchcall.js 44, engine/feel.js 68. Each chapter switch must replace its share | At the start of stage 15, list every reference in chapter 1's scenes by kind (start a fight, read a result, unlock a Tombo, tutorial) |
| 4 | Balance is paper only | The bestiary's boss HP rests on an "output factor" that is an estimate | The simulator, from stage 3 on. If real output differs, change the one factor and every boss HP follows |
| 5 | Spec gaps I filled with a call (table below) | Each is a guess at what Tom and the spec mean | Each is a number or a line in data. Tom corrects any in one sentence |
| 6 | The turn bar is hard to read on a phone in portrait | Pushes, pulls, dividers and ghosts all share one strip | Stage 1 sends Tom a screenshot of the bar before the rest of the screen is polished |
| 7 | Phone memory and load time with both systems and clips loaded | Fact: the title already waits on about 51 MB of scripts. Battle 3 data adds well under 1 MB, but four characters' clips are heavy (one strike clip is 784 KB) | Stage 8 measures one fight with four clip sets on the iPhone |
| 8 | 120 moves need spoken lines and recordings | Canon: every attack has its own line and Tom records them. New lines play through speech synthesis until baked | Each kit stage ends with the list of lines for the Voice Library. No line is added that nothing plays |
| 9 | Mixed progress while chapters switch one by one | A save can fight chapter 3 on the new rules and chapter 4 on the old | Levels and VP are floors worked out from the chapter reached, so either system always finds a sane party. Only Tom plays during the switch |
| 10 | The play layer's default animations look plain | 120 moves on shared default shapes until clips or scripts exist | Accepted for the Lab. The audit's Move Lab (Keep, Tweak, Replace) decides which moves get a script or a clip first |
| 11 | Push access for the build sessions | Fact: this session was refused push access to the repo and worked from a read-only copy. Stage 1 must push | The stage 1 prompt states Tom's permission. If it is refused twice, that session saves its work as a patch in the Project and tells Tom |

Spec gaps filled here (all recommendations, all in data so they change without engine edits):

| Gap | My call |
|---|---|
| Per-character base stats (the spec gives none) | One level table for everyone, taken from the bestiary's player columns. A per-character multiplier column exists and starts at 1.0. Identity comes from Vibes and Leans. |
| Where everyone starts on the bar | Party waits 50 x 100 / Speed, enemies 75 x 100 / Speed. A foe that "opens round 1" starts at 0. |
| A Speed change while a unit is waiting | It changes the next Recovery, not the wait already running. |
| The order an enemy picks acts in | Forced acts, then "every N" acts, then the printed list in order, skipping any that fail their condition. No randomness except target choice. |
| Low HP look | Under 25% HP, battle 2's rule. |
| Bag in battle | Kept on the cross. Items are re-described with the new statuses. |
| Running | Allowed in normal fights, never against a boss. |
| Gear | Stat bonuses mapped onto the four new stats. Perks with no new meaning are off. |
| High-Five | Dropped. |
| Party rows | Chosen in the Vibes menu, defaulted from the Lean. |

Data owed by the bestiary's own section 6, picked up in stages 11 and 22: explicit stat blocks for chapter 2's five regular enemies, and removing the Julian battle trigger.

## 7. The one question for Tom

None. Nothing in stages 1 to 22 is permanent: old and new run side by side, saves only gain fields, and the first deletion is the purge in stage 23. That stage asks Tom once, before it runs, to confirm the delete list (Director's Cuts, Family Finishes, any Tombo marked Replace, and their recordings).

Calls made here that Tom has not confirmed, so he can overrule any in a sentence: the Tombo call in section 3, dropping High-Five, keeping the bag and running, the gear mapping, one shared stat table for all characters, and switching story fights chapter by chapter.
