# Adventures of Tom: The Ability Revamp

**Complete implementation proposal and system review**  
**Source:** `ability-revamp-brief.md`, Parts A to I. The source supplies design canon and architecture, not the executable game, save schema, current animation code, or telemetry. All new names, values, staging, and balancing judgments below are proposals. Statements about existing rules refer to the brief, not a code audit.

## I1. Design summary

- Keep the battle architecture and all eight signature functions. Add **96 active path skills**, including **16 new Ultimates**.
- Give ordinary moves a specific little joke; give each Ultimate an independent cinematic idea, not a larger earlier attack.
- Differentiate Tombo jobs: Grace opens weaknesses, Rose disrupts, Amy supplies momentum, Deedee restores, Boppy manages enemy defenses, TNB shelters, and Nara finds what matters.
- Give every character five or six non-damaging kindness moves, with impacts as satisfying as attacks.
- Preserve chapter unlock events, the four barrier meanings, and the chapter-19 sacrifices.
- Keep normal effects within the active party. Verify reserve-guest eligibility for Family Finishes without adding CTB actors.
- Treat missing save IDs, story-party conflicts, and resource-event accounting as integration checks, not opportunities to invent facts.

### Stampcard numbers

**Six nodes per path. SP costs:** `1, 2, 2, 3, 3, 4`, totaling **15 per path**. **Income:** 2 starting SP, +1 every even character level, +1 per credited side quest. Baseline: `2 + floor(level / 2)`. Respec earns nothing.

**Gates:** `2, 6, 10, 16, 22, 26 / 40`. Either path's first Ultimate opens at 26; the other at 40. Capstone predicate: `level >= (other_path_complete ? 40 : 26)`. Respec validates both together.

| Level | Baseline SP | Sanity check, no quests |
|---|---:|---|
| 10 | 7 | Three preferred nodes plus one off-path node cost 6. |
| 20 | 12 | Four preferred nodes cost 8; bank for later gates. |
| 30 | 17 | Full path plus an early off-path node cost 16. |
| 40 | 22 | Second capstone gate opens; SP still limits completion. |
| 50 | 27 | Full path plus five other nodes cost 26. |

First Ultimate: **level 26 focused, level 28 with the recommended early off-path purchase**. Three side quests permit both paths at 50; eight permit both at 40. Auto-Stamp follows each listed route and banks points when the next node is gated or unaffordable.

### NEW EFFECT and status register

**NEW EFFECT 1, `warm(p,t)`:** fill p% of a regular monster's maximum Warmth, capped at full, with proposed x1.5 for an area-listed liked move and x1.15 for High-Five, each applied once. Confirm the unstated existing likes conversion before adopting these defaults.

**NEW STATUS 1, Close-Up (`closeup`):** double the next incoming damaging action, including all hits, then expire; unused, expire after two target turns, never stack, reject application while See Me is active, and clear when See Me is applied.

## I2. Character kits

### Shared implementation contract

These conventions make the proposed content unambiguous. They do not assert undocumented behavior in the current engine. Where an existing resolver is explicitly inherited, the builder must preserve it and run the corresponding I7 test.

**Table reading.** `Mult` is the total damage multiplier for the action, distributed evenly across `Hits`; a zero means no HP damage. A row or all-enemy multiplier applies to each selected enemy, not divided among enemies. A `multi` action distributes its stated number of hits across living enemies. A `splash` action deals the full total to the selected enemy and 60% to each neighbor under the existing adjacency resolver. Resolve minimum damage per hit using D3. Do not multiply a total by `Hits` a second time. Extra Rose hits remain the separate existing 100% + 40% trait sequence.

`POW` attacks use GRIT; `WARMTH` attacks use COOL. `hybrid` chooses the greater attacking stat and its corresponding defense, choosing POW on a tie. All ordinary `enemy` skills may reach the back row unless an explicit `front` restriction says otherwise. Effects execute after damage in their written order. A miss prevents that target's damage-linked effects; independent party or self effects still resolve. The existing accuracy, crit, resistance, row-capacity, and status-immunity handlers remain authoritative.

**Effect notation.** `t` means the selected recipient or enemy selection; `self` is the acting character; `party` means living active allies; `others` excludes the actor; `lowest` is the living active ally with the lowest HP percentage, breaking ties by battle-slot order. `if present(X)` means X is living and active. A target named in such a clause is not implicitly summoned from reserve. `partner` is the other Tombo participant. Repeated `each` clauses apply one existing op to each eligible unit, not a new op. `heal(.30,t)` restores 30% max HP plus caster WARMTH x 0.4, using the existing percentage-plus-WARMTH form in D6. Named-relative bonus heals explicitly marked `w=0` are flat percentages so the small relationship bonus stays small. Healing from a Tombo uses the participants' mean WARMTH; a Family Finish uses the mean WARMTH of its listed participants. Native regen and signature healing are unchanged. `revive(.25,party)` visits only knocked-out active allies. Heal living allies before reviving so revived allies do not receive both amounts. Cap HP and VP normally.

`st(name,N,t)` uses N of that recipient's own turns. Apply on action resolution; decrement at the end of a recipient turn, excluding the turn in which a self-status was just applied. One-shot statuses retain their existing consumption rules. The following data defaults apply to **new skill instances**, not to signature or trait handlers: ordinary stat Up/Down is 25% unless a value is written; Guard is 50% reduction; Nobody Gets Past is 40%; Grumbled is -30% POW/WARMTH; Evasive is 50% dodge; Dizzy is 25% miss; Hooked prevents evasion; Glitter Nails is +25 percentage points crit and 20% reflect; Kiln Glow is +25% WARMTH/COOL; Personal Best is +30% POW/WARMTH. `Wardrobe Fresh(.25)` revives once at 25% HP and grants debuff immunity for the remaining stated duration; it expires entirely when its auto-revive triggers. This Wardrobe Fresh parameterization requires an adapter if the existing implementation has fixed rather than configurable values. Do not change any other use of that status globally. The new Close-Up status is separate from the existing See Me, whose implementation is unchanged.

`ct(+q,t)` increases remaining ticks by fraction q; `ct(-q,t)` decreases them by q, using `max(1, floor(remainingTicks * (1 + q) + 0.5))`, where q is signed. It affects only the next scheduled turn, never creates a turn, and never resets the actor currently resolving. When a move advances its actor, apply to the newly scheduled post-action turn. Existing boss immunity or reduced-effect rules still apply. `interrupt(t)` cancels a cancellable telegraph, not a scripted phase transition. `shieldBreak(t)` affects ordinary breakable boss shields only, never a Resentment Barrier or a plot invulnerability. `row(front,t)` attempts the existing legal row transfer; a full row leaves the unit in place without canceling other effects. `steal(t,self)` takes at most one eligible buff, using the existing selection rule; if that resolver has no rule, this proposal selects the oldest applied eligible buff, breaking ties by registry key. `take(t)` takes a held item once; an empty holder yields nothing. `coins(legacy,t)` preserves the current coin theft quantity and exhaustion rule.

**Kind targets.** `Yes, K30` means a `warm(30,t)` branch exists. Ally support moves also accept one regular monster through the existing D10 target selector. Against that monster, replace all ally-directed benefits, including heal, revive, cure, costume, buff, VP, CTB advances, and named-relative bonuses, with this single Warmth packet; never heal its HP, give it VP, or equip it. Explicit enemy-control effects still apply on non-damaging enemy-control moves. Self-state and intrinsic trait events, such as mounting, pepper pips, baking crusts, and Tombo Miles, still resolve once. A direct warm op explicitly written into a Family Finish is not this alternate-target conversion; its separately written party effects still execute. A party support skill aimed kindly at a monster affects only that one monster, not the party too. An enemy-row kind move affects its listed enemy selection. None of the proposed damaging path skills is also a kind move. Bosses without a scripted Warmth rule ignore `warm`; the finale's signature-event handler takes precedence over this new conversion.

**Proc ownership.** Basics retain +1 VP and +5% HEART; their table entries declare the built-in rewards, not an extra second grant. All other HEART events use the existing resolver, not extra grants hidden in these tables. A listed `crust(1)` is the baking action's token event, not an additional token on top of an automatic baking event. The same rule applies to listed pepper `burn(1)`. Costs, status application, token grants, Miles, and secondary effects occur once per chosen action, not once per animation beat or cosmetic particle. Rose's trait duplicates the skill's damage hit sequence at 40% for the second sequence, not resource payments or one-shot secondary ops; verify this interpretation against the existing implementation before merge. Grace's heal/crit trend calculation and Tom's instant-skill consumption remain their existing trait handlers, with explicit verification required in I7.

**Signatures and presentation.** A signature row's `legacy(NAME)` means call the current signature resolver unchanged, including its target legality, duration, heal details, and boss exceptions. New keys are content-facing IDs, not a claim about current save IDs. Only its presentation is refreshed. High-Five occurs once at the marked beat. It scales the action's damage, numerical healing, or new Warmth packet by 1.15; it does not increase durations, resources, revive HP, or the number of shield breaks. Signature timing bonuses retain their existing handler. Reduced motion removes shake, flashes, and zoom without changing the timing window. At 2x, scale the visual times uniformly and preserve the existing input-assist timing policy.

**Story props.** After the chapter-19 sacrifices, Grace's squishy, Rose's ribbon, Amy's stopwatch, and TNB's first cup are shown only as visibly translucent remembered props where needed. Do not restore them to inventory or imply their sacrifice was undone. These battles are theatrical visualizations of canon traits, not new claims about real family history. Food visuals use a dairy-free portion for Amy. Nara receives only chicken jerky or plain homemade family food; even a pepper-themed support move shows her a plain portion, while Boppy tastes the pepper himself. No new food restriction or diet diagnosis is implied. Shared trait reactions, such as Counter-Roar, are standard overlays, not a reused central ability scene.


**Existing audio palette:** use the existing bonk or thud on Kinetic impact, a soft steam/ding on Cozy recovery, a water plip on Splash, a bright chime on Sparkle, and a rounded non-startling sound pulse on Chatter. These are cue assignments, not new sound assets. Every card's New assets field lists only assets that must be added; existing poses, props, and sounds may be reused as building blocks without reusing a whole move's core scene.

### Tom

The bodyguard who makes room for everyone, then takes the situation personally.

**Path A: Home Base.** Bread, practical comforts, and very firm boundaries.  
**Path B: Player One.** Study, systems, and the stubborn refusal to play alone.

**Auto-Stamp:** `A1, B1, A2, A3, A4, A5, A6, B2, B3, B4, B5, B6`.  
**Trait integration:** Diamond Medallion stays unchanged. The expensive capstones are attractive Mile redemptions; no path move manufactures Miles.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Controller Tap | `controller_tap` | REWORKED (Button Mash) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | standard | `vp(1,self); HEART +5%` | No |
| Signature | DEFEND | `defend` | REWORKED (DEFEND; animation only) | 1 | 0 | 1 | legacy | legacy | 0 | 0 | ally | legacy | `legacy(DEFEND): step in for ally; existing Bodyguarded/HEART/Mile rules` | Legacy only |
| A1 | Starter Inspection | `starter_inspection` | REWORKED (Starter Splash) | 2 | 1 | 2 | Splash | WARMTH | 1.35 | 1 | enemy | quick | `ct(+.10,t)` | No |
| A2 | Proofing Drawer | `proofing_drawer` | NEW | 6 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.30,t); cure(amber,t)` | Yes, K30 |
| A3 | Toast Negotiations | `toast_negotiations` | NEW | 10 | 2 | 4 | Cozy | WARMTH | 0 | 0 | party | standard | `heal(.18,party); if present(Deedee): crust(1)` | Yes, K25 |
| A4 | Warranty Void | `warranty_void` | NEW | 16 | 3 | 4 | Sparkle | WARMTH | 1.8 | 1 | enemy | standard | `interrupt(t)` | No |
| A5 | Crumb Barrier | `crumb_barrier` | NEW | 22 | 3 | 5 | Cozy | WARMTH | 1.5 | 1 | row | heavy | `st(guard,1,lowest)` | No |
| A6 | The House Is Awake | `house_awake` | NEW | 26 / 40 | 4 | 8 | Cozy | WARMTH | 0 | 0 | party | heavy | `heal(.45,party); cure(all,party); st(guard,2,party); vp(2,others)` | Yes, K60 |
| B1 | Five-Minute Review | `five_minute_review` | REWORKED (Flashcard Flurry) | 2 | 1 | 2 | Chatter | WARMTH | 0 | 0 | enemy | quick | `reveal(t); ct(+.20,t)` | Yes, K25 |
| B2 | D-Pad Detour | `dpad_detour` | NEW | 6 | 2 | 3 | Kinetic | POW | 1.3 | 1 | row | standard | `ct(+.15,t)` | No |
| B3 | Save Point Sandwich | `save_sandwich` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.30,t); vp(1,t)` | Yes, K30 |
| B4 | Radical Solutions | `radical_solutions` | REWORKED (Kanji Strike) | 16 | 3 | 4 | Sparkle | WARMTH | 2 | 1 | enemy | standard | `debuffBonus=.35` | No |
| B5 | Patch Notes | `patch_notes` | NEW | 22 | 3 | 6 | Sparkle | WARMTH | 1.1 | 1 | all | heavy | `interrupt(t)` | No |
| B6 | Player One Is Not Alone | `not_alone` | NEW | 26 / 40 | 4 | 9 | Sparkle | hybrid | 4 | 1 | enemy | heavy | `vp(1,others)` | No |


### Controller Tap (Basic, `controller_tap`)

Menu description: Give one enemy a very deliberate tap. Recover 1 VP.  
Spoken line: "One button. Entirely sufficient."  
Battle message: "Tom selects the obvious button."  
Why it is them: He knows games well enough not to mash every button.  
The joke: The smallest possible input gets an absurdly decisive click.

Animation beats:
1. Tom studies a tiny controller, perfectly still. (0.2 s)
2. His thumb clicks; one square button-shaped bonk lands on the target. (0.35 s)
3. He checks the controller as though completing routine maintenance. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: oversized square button / scene effects: none / sounds: none


### DEFEND (Signature, `defend`)

Menu description: Tom steps in front of an ally. No touching, please.  
Spoken line: "No touching, please."  
Battle message: "Tom establishes a boundary."  
Why it is them: Protecting people is his defining battle role.  
The joke: The boundary is delivered with the tone of a polite service request.

Animation beats:
1. Tom notices the lock-on and straightens one sleeve. (0.4 s)
2. He steps across the ally and presents one open stop-hand. (0.7 s)
3. A small NO TOUCHING placard settles beside his shoes. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: NO TOUCHING placard / scene effects: none / sounds: none


### Starter Inspection (A1, `starter_inspection`)

Menu description: Bready Mercury bubbles at one enemy. Push its next turn back a little.  
Spoken line: "Bready Mercury has NOTES."  
Battle message: "Bready Mercury objects to the temperature."  
Why it is them: Tom maintains a named sourdough starter.  
The joke: The starter appears to be conducting its own performance review.

Animation beats:
1. Tom lifts a jar labeled BREADY MERCURY to eye level. (0.4 s)
2. One indignant bubble expands, pops, and splats the selected enemy. (0.7 s)
3. Tom adds one tiny check mark to the jar label. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: labeled starter jar; inspection sticker / scene effects: none / sounds: none


### Proofing Drawer (A2, `proofing_drawer`)

Menu description: Give a friend a warm place to recover. Heal at least 30% HP and clear Amber-Stuck.  
Spoken line: "A proofing drawer. For emotional support."  
Battle message: "The warmth is carefully controlled."  
Why it is them: A baker understands patient, protected warmth.  
The joke: A serious appliance becomes the least glamorous spa imaginable.

Animation beats:
1. Tom opens a low wooden drawer lined with a folded cloth. (0.4 s)
2. A warm rectangular glow reaches the recipient as the drawer puffs like rising dough. (0.7 s)
3. The recipient smiles; Tom adjusts a tiny dial by one pixel. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: proofing drawer; one-pixel thermostat / scene effects: none / sounds: none


### Toast Negotiations (A3, `toast_negotiations`)

Menu description: Share homemade toast with the party. Deedee adds a Warm Crust when present.  
Spoken line: "Both halves are EXACTLY fair."  
Battle message: "Tom has measured the toast."  
Why it is them: His baking and competent fussing become practical family care.  
The joke: He negotiates equal toast portions with unnecessary precision.

Animation beats:
1. Tom places two uneven toast halves beside a ruler. (0.4 s)
2. He rotates one half until their silhouettes match; warm crumbs reach the recipients. (0.7 s)
3. A tiny FAIR label appears and the recipients beam. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: toast ruler; FAIR label / scene effects: none / sounds: none


### Warranty Void (A4, `warranty_void`)

Menu description: Pull the wrong tab on purpose. Hit one enemy and interrupt its wind-up.  
Spoken line: "That warranty was holding us BACK."  
Battle message: "The protective film was load-bearing."  
Why it is them: Tom loves gadgets and knows exactly which tab not to pull.  
The joke: The enemy apparently came with removable protective film.

Animation beats:
1. A bright peel-tab appears across the enemy telegraph icon. (0.4 s)
2. Tom pulls one long transparent strip; the icon collapses with a bright snap. (0.7 s)
3. He folds the film neatly instead of dropping it. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: giant peel-tab; folded protective film / scene effects: none / sounds: none


### Crumb Barrier (A5, `crumb_barrier`)

Menu description: Send a folding crust wall through an enemy row. Shield the most hurt friend.  
Spoken line: "The crumbs are STRUCTURAL."  
Battle message: "Bread meets the building code."  
Why it is them: He turns a domestic skill into protection.  
The joke: The apparently flimsy crumbs hold an immaculate right angle.

Animation beats:
1. Tom taps a neat line of bread crumbs with a measuring finger. (0.4 s)
2. They unfold into an accordion crust wall that bumps the chosen row. (0.7 s)
3. The final panel folds around the lowest-HP ally like a safety screen. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: accordion crust panels / scene effects: none / sounds: none


### The House Is Awake (A6, `house_awake`)

Menu description: Turn the lights on for everyone. Heal and protect the party, clear debuffs, and give others 2 VP.  
Spoken line: "The house is awake. You are COVERED."  
Battle message: "Someone left the light on."  
Why it is them: His gadgets, baking, and protective competence make home feel dependable.  
The joke: The grand reveal is a completely ordinary light switch.

Animation beats:
1. The stage becomes a dark, simple cutaway of an imagined house; Tom stands by one switch. (0.8 s)
2. Three tiny gadgets blink unhelpfully while a bread timer chirps. (1 s)
3. Tom ignores every gadget and flips the ordinary switch by hand. (1.3 s)
4. Warm windows illuminate the active allies in sequence; one large roof silhouette shelters them. (1.3 s)
5. He sets a small cooling loaf in the window and relaxes as hearts settle. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: cutaway house silhouette; ordinary light switch; cooling-rack loaf / scene effects: window-by-window lighting mask / sounds: none


### Five-Minute Review (B1, `five_minute_review`)

Menu description: Offer a tiny study break. Reveal one enemy and delay its next turn.  
Spoken line: "Five-minute review. This WILL be useful."  
Battle message: "The enemy considers the vocabulary."  
Why it is them: He practices Japanese with flashcards rather than vague magical incantations.  
The joke: The enemy unexpectedly takes the study session seriously.

Animation beats:
1. Tom opens three flashcards and points to a simple picture prompt. (0.4 s)
2. The target leans toward the answer side; a question mark turns into a weakness icon. (0.7 s)
3. Tom gives a small approving nod; the target looks pleased with its effort. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: picture-and-glyph review cards / scene effects: none / sounds: none


### D-Pad Detour (B2, `dpad_detour`)

Menu description: Send an enemy row along the long way around. Hit and delay them.  
Spoken line: "The D-pad says take the SCENIC route."  
Battle message: "The route has become needlessly complicated."  
Why it is them: Tom thinks in game controls and tidy solutions.  
The joke: A one-step journey becomes an elaborate grid walk.

Animation beats:
1. Four chunky direction arrows draw a small maze beneath the selected row. (0.4 s)
2. Tom presses right; the row follows a ridiculous zigzag and bumps its dead end. (0.7 s)
3. A tiny map pin labels the original spot HERE. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: four-arrow floor maze; HERE pin / scene effects: none / sounds: none


### Save Point Sandwich (B3, `save_sandwich`)

Menu description: Take a homemade sandwich break. Heal a friend and restore 1 VP.  
Spoken line: "Save first. Sandwich second. BOTH essential."  
Battle message: "Progress saved. Lunch secured."  
Why it is them: Classic JRPG habits and homemade bread are both genuine comforts.  
The joke: The impressive save crystal is actually folded lunch paper.

Animation beats:
1. A tiny save crystal rises over the recipient. (0.4 s)
2. Tom unfolds it into sandwich paper, revealing a thick homemade bread sandwich. (0.7 s)
3. The recipient takes a happy bite; a small SAVED check mark appears. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: crystal-shaped sandwich wrapper; SAVED check / scene effects: none / sounds: none


### Radical Solutions (B4, `radical_solutions`)

Menu description: Fit the pieces together for one bright hit. Deal more damage to a debuffed enemy.  
Spoken line: "A radical solution. Very LITERALLY."  
Battle message: "The pieces finally line up."  
Why it is them: He enjoys the precise building blocks of Japanese study.  
The joke: The enemy receives a meticulously assembled answer rather than a wild flourish.

Animation beats:
1. Three oversized study tiles rotate above Tom; use abstract glyph fragments, not a claimed translation. (0.4 s)
2. He slots the last tile into a luminous target outline that snaps shut around one enemy. (0.7 s)
3. Tom brushes one stray pixel back into alignment. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: interlocking study tiles; alignment pixel / scene effects: none / sounds: none


### Patch Notes (B5, `patch_notes`)

Menu description: Publish a very firm update. Hit every enemy and interrupt cancellable wind-ups.  
Spoken line: "Patch notes: touching has been REMOVED."  
Battle message: "The update addresses a known issue."  
Why it is them: His product-director precision and protective boundaries make an excellent deadpan pairing.  
The joke: The biggest warning on screen is a dry release note.

Animation beats:
1. A single PATCH NOTES sheet descends over the enemy side. (0.4 s)
2. Tom underlines TOUCHING: REMOVED; each active wind-up icon gets a large square strikeout. (0.7 s)
3. He folds the sheet into a neat pocket square. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: PATCH NOTES sheet; square strikeout stamps / scene effects: none / sounds: none


### Player One Is Not Alone (B6, `not_alone`)

Menu description: Plug everyone into one enormous act of solidarity. Strike one enemy and give friends 1 VP.  
Spoken line: "Player one is NOT alone!"  
Battle message: "There is always room for another controller."  
Why it is them: His love of games becomes a statement about protecting relationships.  
The joke: A supposedly single-player socket keeps revealing more ports.

Animation beats:
1. A huge 1 PLAYER menu closes around Tom and the selected enemy. (0.8 s)
2. He pulls a small multiport hub from his pocket; its first socket seems insufficient. (1 s)
3. The hub unfolds into eight ports, and toy avatar lights travel along bright controller cords. (1.3 s)
4. The cords weave a safety net below the party, then draw one giant pixel-heart bonk onto the target. (1.3 s)
5. The menu changes to TOGETHER; Tom settles the last loose cable out of the walkway. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: plug_in / props: eight-port controller hub; toy avatar lights; woven cord net / scene effects: cord-weaving path mask / sounds: none


### Grace

A spectacularly competent big sister who learns that attention is useful when it helps somebody.

**Path A: Little Director.** Squishy care, glitter confidence, and choosing the kinder take.  
**Path B: Acro-Star.** Exact counts, improbable balance, and rules for gravity.

**Auto-Stamp:** `A1, B1, A2, A3, A4, A5, A6, B2, B3, B4, B5, B6`.  
**Trait integration:** Trending Meter rewards rotating heals, control, and crit opportunities; no move changes the existing trend calculation.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Heel Click | `heel_click` | REWORKED (Cartwheel) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | quick | `vp(1,self); HEART +5%` | No |
| Signature | DANCE | `dance` | REWORKED (DANCE; animation only) | 1 | 0 | 3 | legacy | legacy | 0 | 0 | party | legacy | `legacy(DANCE): party heal 25%` | Legacy only |
| A1 | Dumpling Consult | `dumpling_consult` | REWORKED (Squishy Squeeze) | 2 | 1 | 3 | Sparkle | WARMTH | 0 | 0 | ally | standard | `heal(.35,t); cure(one,t)` | Yes, K30 |
| A2 | Glitter Check-In | `glitter_checkin` | REWORKED (Glitter Nails) | 6 | 2 | 4 | Sparkle | WARMTH | 0 | 0 | party | standard | `st(glitternails,2,party); if present(Rose): heal(.10,Rose,w=0)` | Yes, K25 |
| A3 | Ring-Light Rescue | `ringlight_rescue` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.20,t); cure(amber,t)` | Yes, K30 |
| A4 | Comment Moderation | `comment_moderation` | NEW | 16 | 3 | 4 | Chatter | WARMTH | 1.5 | 1 | enemy | standard | `st(shushed,1,t)` | No |
| A5 | Thumbnail Face | `thumbnail_face` | NEW | 22 | 3 | 5 | Sparkle | WARMTH | 1.4 | 1 | row | standard | `st(dizzy,2,t)` | No |
| A6 | Keep the Bloopers | `keep_bloopers` | NEW | 26 / 40 | 4 | 8 | Sparkle | WARMTH | 0 | 0 | party | heavy | `heal(.35,party); revive(.35,party); cure(mental,party)` | Yes, K60 |
| B1 | Eight-Count Reset | `eight_count` | REWORKED (Dance Battle) | 2 | 1 | 2 | Kinetic | POW | 1.3 | 1 | enemy | quick | `steal(t,self)` | No |
| B2 | Balance-Beam Borders | `beam_borders` | REWORKED (Beam Dismount) | 6 | 2 | 3 | Kinetic | POW | 1.4 | 1 | row | standard | `st(hooked,2,t)` | No |
| B3 | Warm-Up Lap | `warmup_lap` | NEW | 10 | 2 | 4 | Cozy | WARMTH | 0 | 0 | party | standard | `heal(.15,party); st(pepup,.15,2,party)` | Yes, K25 |
| B4 | Mat Patrol | `mat_patrol` | NEW | 16 | 3 | 4 | Kinetic | POW | 1.8 | 1 | enemy | standard | `interrupt(t); st(guard,1,lowest)` | No |
| B5 | Spotlight Shuffle | `spotlight_shuffle` | NEW | 22 | 3 | 5 | Sparkle | POW | 1.6 | 1 | row | standard | `crit=.25` | No |
| B6 | Gravity Needs Permission | `gravity_permission` | NEW | 26 / 40 | 4 | 9 | Kinetic | POW | 3.9 | 1 | enemy | heavy | `crit=.25; interrupt(t)` | No |


### Heel Click (Basic, `heel_click`)

Menu description: Click into position and tap one enemy. Recover 1 VP.  
Spoken line: "Heel click. Eyes here!"  
Battle message: "Grace finds her mark."  
Why it is them: She approaches even a basic move like a performance entrance.  
The joke: The enemy is treated as a badly positioned stage mark.

Animation beats:
1. Grace checks an imaginary audience and squares her shoulders. (0.2 s)
2. Her heels click; a small shoe-shaped tap pops the selected target. (0.35 s)
3. She freezes in an immaculate finishing pose. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: shoe-shaped impact mark / scene effects: none / sounds: none


### DANCE (Signature, `dance`)

Menu description: Lead a dance break that heals the party.  
Spoken line: "Dance break! Follow my count!"  
Battle message: "Grace makes room in the routine."  
Why it is them: She is a dancer who likes choreographing everyone.  
The joke: Her count briefly includes a very stern finger at a late dancer.

Animation beats:
1. Grace claps a clear four-count beside four floor marks. (0.4 s)
2. She twirls; each ally gets one simple matching footstep and a healing pulse. (0.7 s)
3. The final mark becomes a heart as everyone finishes together. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: four-count heart floor marks / scene effects: none / sounds: none


### Dumpling Consult (A1, `dumpling_consult`)

Menu description: Let a friend squeeze the precious dumpling. Heal at least 35% HP and remove one debuff.  
Spoken line: "The dumpling recommends a squeeze."  
Battle message: "The consultation is extremely sparkly."  
Why it is them: Her gold soup-dumpling squishy is a serious source of comfort.  
The joke: She presents the squishy as the senior expert in the room.

Animation beats:
1. Grace seats the gold dumpling on a tiny formal consultation cushion. (0.4 s)
2. The recipient squeezes it; its returning shape pushes a debuff icon away. (0.7 s)
3. Grace nods as though the dumpling gave excellent advice; the recipient smiles. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: consultation cushion; tiny appointment card / scene effects: none / sounds: none


### Glitter Check-In (A2, `glitter_checkin`)

Menu description: Give everyone glitter confidence. Raise crit chance, reflect a little damage, and check on Rose.  
Spoken line: "Glitter check-in. Rose gets first choice."  
Battle message: "Grace checks every hand twice."  
Why it is them: Her glitter nails and responsibility for Rose naturally belong together.  
The joke: She pretends color selection is an urgent tactical decision.

Animation beats:
1. Grace opens a fan of glitter color swatches like a tiny operations chart. (0.4 s)
2. She checks each ally off; bright nail-shaped shields catch the light. (0.7 s)
3. Rose, when present, gets the first swatch; all recipients give a happy hand wave. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: glitter swatch fan; checked hand icons / scene effects: none / sounds: none


### Ring-Light Rescue (A3, `ringlight_rescue`)

Menu description: Turn a cold ring light into a warm one. Heal a friend and clear Amber-Stuck.  
Spoken line: "Ring-light rescue. Warm setting, obviously."  
Battle message: "The lighting is much kinder now."  
Why it is them: She knows exactly how she wants her little production to look.  
The joke: The important lighting correction is emotional rather than cosmetic.

Animation beats:
1. Grace holds a ring light showing a cold blue dial. (0.4 s)
2. She clicks it to WARM; amber flakes loosen inside a clear orange circle. (0.7 s)
3. The recipient grins in the circle and Grace gives an approving hip pose. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: two-setting ring-light dial / scene effects: none / sounds: none


### Comment Moderation (A4, `comment_moderation`)

Menu description: Delete one rude contribution. Hit an enemy and block its Chatter briefly.  
Spoken line: "Comment moderation. That was not helpful."  
Battle message: "Grace removes the unhelpful comment."  
Why it is them: She narrates life like a channel and has strong opinions about its tone.  
The joke: An enemy discovers that being loud does not make its comment useful.

Animation beats:
1. A jagged rude-comment bubble appears beside the target. (0.4 s)
2. Grace pinches it into a little recycling square; the square snaps onto the enemy. (0.7 s)
3. A polite COMMENTS PAUSED card replaces the bubble. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: recyclable comment bubble; COMMENTS PAUSED card / scene effects: none / sounds: none


### Thumbnail Face (A5, `thumbnail_face`)

Menu description: Pull the most dramatic face on the screen. Hit and confuse an enemy row.  
Spoken line: "Thumbnail face. Bigger. Bigger. Perfect."  
Battle message: "The reaction is slightly larger than necessary."  
Why it is them: Her channel-style showmanship makes exaggerated reaction faces feel natural.  
The joke: The reaction frame is larger than the actual event.

Animation beats:
1. Grace makes a small surprised face inside a tiny rectangular frame. (0.4 s)
2. She stretches the frame until it bonks across the row, carrying an enormous pixel gasp. (0.7 s)
3. A tiny arrow labels the least impressive part of the scene WOW. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: stretchable reaction frame; WOW arrow / scene effects: none / sounds: none


### Keep the Bloopers (A6, `keep_bloopers`)

Menu description: Choose the imperfect takes where everyone belongs. Heal friends, revive fallen friends, and clear mental debuffs.  
Spoken line: "The bloopers are the best part!"  
Battle message: "Grace keeps the take with everybody in it."  
Why it is them: A responsible big sister can care more about people than a polished performance.  
The joke: Every supposedly ruined shot turns out to contain the best smile.

Animation beats:
1. A tall contact sheet unfurls with one comically awkward drawn snapshot of each active ally. (0.8 s)
2. Grace reaches toward a DELETE button while the crooked pictures wobble. (1 s)
3. She tears off the button instead and circles KEEP ALL in glitter pencil. (1.3 s)
4. The frames open like little doors; standing allies brighten and fallen allies hop back into their own frame. (1.3 s)
5. Grace adds her own extremely unflattering snapshot last and laughs with everyone. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: frame_present / props: awkward contact sheet; tear-off DELETE button; glitter pencil / scene effects: none / sounds: none


### Eight-Count Reset (B1, `eight_count`)

Menu description: Borrow one enemy buff with a perfectly timed step.  
Spoken line: "Eight-count reset. Your move is mine."  
Battle message: "Grace borrows the good part."  
Why it is them: She watches a routine closely and expects everyone to keep time.  
The joke: The enemy does the difficult setup and she takes the clean finish.

Animation beats:
1. Grace counts on her fingers while the target buff icon bobs off-beat. (0.4 s)
2. One exact side-step hooks the icon into her own finishing pose with a tap. (0.7 s)
3. She adds the missing eighth count with a pointed finger. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: eight-count stepping dots / scene effects: none / sounds: none


### Balance-Beam Borders (B2, `beam_borders`)

Menu description: Box an enemy row between balance beams. Hit them and stop their dodging.  
Spoken line: "Balance-beam borders. Stay in your lane."  
Battle message: "The available wiggle room is precisely zero."  
Why it is them: Her gymnastics confidence turns narrow footing into control.  
The joke: The enemies get the narrow part of the apparatus, not the gymnast.

Animation beats:
1. Two low balance beams slide into parallel lines around the chosen row. (0.4 s)
2. Grace lands one foot between them; both beams clap inward with a padded bonk. (0.7 s)
3. She balances comfortably while the targets cannot find room to sidestep. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: paired low balance beams / scene effects: none / sounds: none


### Warm-Up Lap (B3, `warmup_lap`)

Menu description: Lead a gentle warm-up. Heal the party a little and raise PEP by 15%.  
Spoken line: "Warm-up lap. Nobody skips the ankles."  
Battle message: "The warm-up has an unusually strict director."  
Why it is them: A gymnast and dancer knows a routine begins before the big trick.  
The joke: Her smallest ankle circle gets the most serious coaching.

Animation beats:
1. Grace draws a little looping route with one toe. (0.4 s)
2. The loop becomes a warm circle under the party as they perform simple ankle rolls. (0.7 s)
3. She inspects the final ankle, then smiles and waves everyone onward. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: ankle-loop floor arrows / scene effects: none / sounds: none


### Mat Patrol (B4, `mat_patrol`)

Menu description: Roll out a safety mat at exactly the wrong time for an enemy. Interrupt it and protect a friend.  
Spoken line: "Mat patrol. Safety first, surprise second."  
Battle message: "The landing has been professionally padded."  
Why it is them: She protects her little sister through the practical language of gymnastics.  
The joke: The safety equipment causes the enemy to abandon its dangerous idea.

Animation beats:
1. Grace notices the target wind-up and gives a quick coach clap. (0.4 s)
2. A tightly rolled mat unspools under its stance and cushions its startled drop. (0.7 s)
3. The spare padded end curls beside the most hurt ally. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: spiral safety mat / scene effects: none / sounds: none


### Spotlight Shuffle (B5, `spotlight_shuffle`)

Menu description: Shuffle the lights across an enemy row. These hits have extra crit chance.  
Spoken line: "Spotlight shuffle. Wrong mark, everybody."  
Battle message: "The enemies have missed their entrance."  
Why it is them: She loves staging and expects people to hit their marks.  
The joke: Every enemy follows the light to the wrong place.

Animation beats:
1. Three spotlight circles hop across the selected row like a shell game. (0.4 s)
2. Grace swaps their floor marks with one toe and the circles snap into bright impact squares. (0.7 s)
3. She remains perfectly centered in the one light that did not move. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: swappable spotlight floor marks / scene effects: none / sounds: none


### Gravity Needs Permission (B6, `gravity_permission`)

Menu description: Tell gravity to wait for its cue. Strike one enemy hard and stop its wind-up.  
Spoken line: "Gravity, wait for my cue!"  
Battle message: "Even gravity has to follow the count."  
Why it is them: Her gymnastics and cheerful bossiness turn into a perfectly specific fantasy.  
The joke: The intimidating force of nature waits nervously for a nine-year-old.

Animation beats:
1. A giant DOWN arrow hangs over a tiny balance point; Grace raises one commanding finger. (0.8 s)
2. She plants a controlled handstand while the target keeps checking the arrow. (1 s)
3. Grace rotates the arrow sideways; the enemy drifts into a large waiting crash cushion. (1.3 s)
4. On her exact clap the arrow returns DOWN and the cushion gives one spectacular spring-loaded bonk. (1.3 s)
5. Grace lands neatly, checks the arrow for obedience, and bows. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: controlled_handstand / props: rotating gravity arrow; giant spring cushion / scene effects: single-target gravity slide / sounds: none


### Rose

A travel-sized person whose pretend rules are surprisingly useful in a real crisis.

**Path A: Giggle Rules.** Playmates, royal inspections, and parties nobody gets left out of.  
**Path B: Pocket Kingdom.** Lamby, borrowed height, and making room for the entire world.

**Auto-Stamp:** `B1, A1, B2, B3, B4, B5, B6, A2, A3, A4, A5, A6`.  
**Trait integration:** Shoulder Ride retains its three-turn protection and 100% + 40% damage sequence. Lookout Lamby can establish it; no move requires Tom to exist in the active party.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Tiny Tap | `tiny_tap` | REWORKED (Boop) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | quick | `vp(1,self); HEART +5%` | No |
| Signature | SILLY | `silly` | REWORKED (SILLY; animation only) | 1 | 0 | 2 | legacy | legacy | 0 | 0 | enemy | legacy | `legacy(SILLY): goof(t); existing boss held-object exception` | Legacy only |
| A1 | Where Did I Go? | `where_did_i_go` | REWORKED (Peekaboo) | 2 | 1 | 2 | Chatter | WARMTH | 0 | 0 | enemy | quick | `ct(+.25,t)` | Yes, K25 |
| A2 | Royal Inspection | `royal_inspection` | NEW | 6 | 2 | 3 | Sparkle | WARMTH | 1.4 | 1 | enemy | standard | `st(gritdown,2,t)` | No |
| A3 | Giggle Echo | `giggle_echo` | NEW | 10 | 2 | 4 | Chatter | WARMTH | 1.2 | 3 | row | standard | `interrupt(t)` | No |
| A4 | Lamby's Appointment | `lamby_appointment` | NEW | 16 | 3 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.30,t); cure(mental,t)` | Yes, K30 |
| A5 | The Floor Is Jelly | `floor_is_jelly` | REWORKED (Twirl Tornado) | 22 | 3 | 5 | Kinetic | POW | 1.5 | 1 | row | standard | `st(dizzy,2,t)` | No |
| A6 | Your Pretend Birthday | `pretend_birthday` | NEW | 26 / 40 | 4 | 8 | Cozy | WARMTH | 0 | 0 | all | heavy | `goof(t); interrupt(t); st(guard,1,party)` | Yes, K45 |
| B1 | Lookout Lamby | `lookout_lamby` | REWORKED (Lamby Launch) | 2 | 1 | 2 | Kinetic | POW | 1.4 | 1 | enemy | standard | `if present(Tom): mount(3); else: st(guard,1,self)` | No |
| B2 | Ribbon Rescue | `ribbon_rescue` | NEW | 6 | 2 | 3 | Kinetic | POW | 1.5 | 1 | enemy | quick | `interrupt(t); ct(-.10,lowest)` | No |
| B3 | Lamby Fixes the Ending | `lamby_ending` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(amber,t)` | Yes, K30 |
| B4 | Pocket Princess | `pocket_princess` | NEW | 16 | 3 | 5 | Sparkle | WARMTH | 1.6 | 1 | row | standard | `st(cooldown,2,t)` | No |
| B5 | Princess Parasol | `princess_parasol` | NEW | 22 | 3 | 5 | Cozy | WARMTH | 0 | 0 | party | standard | `st(guard,1,party); cure(amber,party); if present(Tom): heal(.10,Tom,w=0)` | Yes, K30 |
| B6 | Travel-Size Kingdom | `travel_kingdom` | NEW | 26 / 40 | 4 | 9 | Kinetic | POW | 3.8 | 1 | enemy | heavy | `shieldBreak(t)` | No |


### Tiny Tap (Basic, `tiny_tap`)

Menu description: Give one enemy the smallest possible tap. Recover 1 VP.  
Spoken line: "Tiny tap. Huge importance."  
Battle message: "Rose considers this a major intervention."  
Why it is them: Her fearless playmate approach starts with a boop, not a battle stance.  
The joke: The tiny contact gets a very grand ceremonial pause.

Animation beats:
1. Rose measures a minuscule gap between finger and thumb. (0.2 s)
2. She taps the target once; a huge IMPORTANCE stamp flashes behind the tiny contact. (0.35 s)
3. She folds her arms as if the matter is settled. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: IMPORTANCE stamp / scene effects: none / sounds: none


### SILLY (Signature, `silly`)

Menu description: Blow a raspberry. A regular enemy loses its next turn.  
Spoken line: "One raspberry, extra silly!"  
Battle message: "Rose has made an excellent point."  
Why it is them: Raspberries and fearless silliness are explicitly her style.  
The joke: She prepares with the solemnity of an opera singer.

Animation beats:
1. Rose takes an extravagantly serious breath and plants her feet. (0.4 s)
2. She blows a raspberry; a wobbly tongue-shaped sound ring flops over the target. (0.7 s)
3. She giggles as the target wobbles into a visibly amused face. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: wobbly raspberry sound ring / scene effects: none / sounds: none


### Where Did I Go? (A1, `where_did_i_go`)

Menu description: Disappear behind two extremely small hands. Delay and cheer one enemy.  
Spoken line: "Where did I go? Nobody knows!"  
Battle message: "The disguise is completely transparent."  
Why it is them: She trusts the rules of a familiar silly game more than the obvious evidence.  
The joke: The enemy politely looks elsewhere despite seeing nearly all of her.

Animation beats:
1. Rose hides only her eyes behind two small hands. (0.4 s)
2. An enormous question mark makes the target turn the wrong way while she peeks. (0.7 s)
3. She reveals herself with a grin; the target gives a little relieved smile. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: oversized searching question mark / scene effects: none / sounds: none


### Royal Inspection (A2, `royal_inspection`)

Menu description: Inspect one enemy with princess authority. Hit it and lower GRIT.  
Spoken line: "Royal inspection. Your armor is too poky."  
Battle message: "The armor fails the princess test."  
Why it is them: Her love of dress-up turns ordinary objections into royal decrees.  
The joke: The inspection standard is whether armor would snag a princess dress.

Animation beats:
1. Rose adjusts a crooked tiara and lifts a soft toy scepter. (0.4 s)
2. She pokes one armor seam; a huge TOO POKY tag springs out with a bright bonk. (0.7 s)
3. She turns the tag over to reveal a small drawn heart. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: tiny_curtsey / props: TOO POKY garment tag; soft royal scepter / scene effects: none / sounds: none


### Giggle Echo (A3, `giggle_echo`)

Menu description: Send three little giggle echoes across a row. Interrupt their wind-ups.  
Spoken line: "Giggle echo! Again! Again!"  
Battle message: "The echo finds the joke even funnier."  
Why it is them: Her giggling becomes infectious instead of threatening.  
The joke: Each echo tries to out-giggle the previous one.

Animation beats:
1. Rose giggles into a paper cup held sideways like a tiny tunnel. (0.4 s)
2. Three numbered giggle bubbles rebound across the row, each slightly rounder than the last. (0.7 s)
3. The final bubble laughs itself into a harmless puff. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: echo cup; three numbered giggle bubbles / scene effects: none / sounds: none


### Lamby's Appointment (A4, `lamby_appointment`)

Menu description: Consult a very soft pretend doctor. Heal a friend and clear mental debuffs.  
Spoken line: "Lamby says your appointment is cuddles."  
Battle message: "The prescription is remarkably soft."  
Why it is them: She uses her beloved stuffed lamb to make a frightening situation manageable.  
The joke: Lamby has an impressive waiting room and no medical equipment.

Animation beats:
1. Rose seats Lamby behind a small APPOINTMENTS sign and produces an empty clipboard. (0.4 s)
2. She presses Lamby gently to the recipient while checking an oversized CUDDLES box. (0.7 s)
3. The recipient smiles and gets a tiny pretend appointment sticker. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: Lamby appointment sign; CUDDLES clipboard; appointment sticker / scene effects: none / sounds: none


### The Floor Is Jelly (A5, `floor_is_jelly`)

Menu description: Declare a very wobbly floor. Bounce an enemy row and make it Dizzy.  
Spoken line: "The floor is jelly. I just decided."  
Battle message: "The rule is new but immediately binding."  
Why it is them: She makes up games confidently enough that everyone else has to catch up.  
The joke: The enemies check the floor before realizing the rule has already started.

Animation beats:
1. Rose stamps once and draws a jelly-shaped outline under the selected row. (0.4 s)
2. The outlined floor gives one huge wobble, bouncing the targets into soft impact blobs. (0.7 s)
3. Rose tests one corner with a toe and gives it a satisfied pat. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: jelly floor outline; soft wobble blobs / scene effects: none / sounds: none


### Your Pretend Birthday (A6, `pretend_birthday`)

Menu description: Throw every enemy a pretend birthday. Cheer them, interrupt wind-ups, and protect friends for a turn.  
Spoken line: "Nobody gets skipped on pretend birthdays!"  
Battle message: "Rose has decided everybody gets a candle."  
Why it is them: She treats monsters as possible playmates and thinks being included should be simple.  
The joke: The enormous threatening gift contains party hats in exactly the wrong sizes.

Animation beats:
1. Rose notices the enemy side has no party hats and looks appalled. (0.8 s)
2. She drags out a suspiciously huge wrapped box with a six-shaped ribbon bow. (1 s)
3. The box opens to reveal a comically tiny pretend cake and an enormous stack of hats. (1.3 s)
4. One clear candle-blowing wave rolls across the enemies; hats land and protective heart confetti reaches the party. (1.3 s)
5. The enemies smile awkwardly while Rose distributes extra pretend slices with great fairness. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: giant wrapped hat box; tiny pretend cake; mismatched party hats / scene effects: single candle-blowing wave / sounds: none


### Lookout Lamby (B1, `lookout_lamby`)

Menu description: Lamby spots one enemy for a soft bonk. Rose rides on Tom when he is present.  
Spoken line: "Lamby, you are on lookout duty!"  
Battle message: "Lamby has spotted something extremely bonkable."  
Why it is them: Her stuffed lamb and love of Tom's shoulders naturally work together.  
The joke: The lookout uses a telescope backwards and is still entirely confident.

Animation beats:
1. Rose puts a tiny backwards telescope to Lamby's face. (0.4 s)
2. Lamby points with a soft hoof and a padded lookout pennant taps the selected enemy. (0.7 s)
3. If Tom is active he lifts Rose into place; otherwise she plants a small lookout cushion around herself. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: backwards toy telescope; padded lookout pennant; lookout cushion / scene effects: none / sounds: none


### Ribbon Rescue (B2, `ribbon_rescue`)

Menu description: Unroll a ribbon through a dangerous wind-up. Interrupt one enemy and help a hurt friend act sooner.  
Spoken line: "Ribbon rescue! Mind the fancy bit."  
Battle message: "The ribbon has become a safety feature."  
Why it is them: She turns a dress-up object into a practical rescue using child logic.  
The joke: The enemy stops its terrifying attack to avoid tangling a decorative bow.

Animation beats:
1. Rose rolls a ribbon spool along the ground toward the wind-up icon. (0.4 s)
2. A large bow ties itself around that icon and gently tugs it flat. (0.7 s)
3. The ribbon tip points the most hurt ally toward its next step. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: safety-bow ribbon spool / scene effects: none / sounds: none


### Lamby Fixes the Ending (B3, `lamby_ending`)

Menu description: Find the happy side of a pretend story. Heal a friend and clear Amber-Stuck.  
Spoken line: "Lamby says the book was upside down!"  
Battle message: "The happy ending was facing the wrong way."  
Why it is them: She trusts a beloved toy and a little pretend logic to make a scary situation manageable.  
The joke: The supposedly unhappy ending was an upside-down picture all along.

Animation beats:
1. Rose opens a little picture book showing a cold-looking frown; Lamby holds its ribbon bookmark. (0.4 s)
2. She guides Lamby's hoof to rotate the book; the frown becomes a warm smiling sun that loosens amber around the recipient. (0.7 s)
3. The recipient smiles back while Rose pats Lamby for the excellent literary advice. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: reversible picture-story book; Lamby bookmark / scene effects: none / sounds: none


### Pocket Princess (B4, `pocket_princess`)

Menu description: Open an impossibly small royal fan. Strike an enemy row and lower COOL.  
Spoken line: "Pocket princess. Please make a tiny entrance."  
Battle message: "The royal entrance exceeds its advertised size."  
Why it is them: She loves princess dress-up and insists that small does not mean unimportant.  
The joke: A pocket-sized fan contains a full row's worth of pomp.

Animation beats:
1. Rose pulls a minuscule folded fan from a pocket. (0.4 s)
2. The fan opens sideways into three enormous royal crests that gently clap across the row. (0.7 s)
3. She folds it back into the original impossibly small square. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: pocket fan with expanding royal crests / scene effects: none / sounds: none


### Princess Parasol (B5, `princess_parasol`)

Menu description: Open a pretend parasol with the warm side inside. Guard the party, clear Amber-Stuck, and give Tom a small warm rest.  
Spoken line: "Princess parasol. The sunshine goes underneath!"  
Battle message: "Rose puts the warm part where her friends are."  
Why it is them: Her princess dress-up logic puts comfort exactly where she thinks people need it.  
The joke: She insists the parasol is meant to bring sunshine in, not keep it out.

Animation beats:
1. Rose lifts a small lace-edged toy parasol with a painted sun on its outer surface. (0.4 s)
2. She turns it inside out; the painted sun warms the recipients beneath a clear protective outline. (0.7 s)
3. Tom, when active, gets the first tiny heart as Rose proudly invites everyone into the warm side. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: reversible princess parasol; painted-sun liner / scene effects: none / sounds: none


### Travel-Size Kingdom (B6, `travel_kingdom`)

Menu description: Open a whole pretend kingdom from one pocket. Bonk one enemy and break an ordinary shield.  
Spoken line: "Travel-size kingdom. Giant-size rules!"  
Battle message: "The kingdom was larger on the inside."  
Why it is them: Her travel-sized declaration and princess imagination become a single big joke.  
The joke: The enormous royal court is administered from a tiny pocket.

Animation beats:
1. Rose pats one suspiciously small pocket and produces a folded cardboard gate. (0.8 s)
2. The gate unfolds into a huge toy court, with Lamby seated as an utterly solemn witness. (1 s)
3. The target discovers its ordinary shield has become a tiny teacup on a toy stand. (1.3 s)
4. Rose taps a huge padded royal seal; the teacup-shield pops into harmless stars around one decisive bonk. (1.3 s)
5. She folds the entire court back into her pocket, leaving Lamby's tiny witness badge outside. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: pocket_reveal / props: folding toy court; teacup shield stand; padded royal seal; witness badge / scene effects: cardboard-court unfold / sounds: none


### Amy

A teacher and runner who is strongest when everyone shares the pace, including her.

**Path A: Head Teacher.** Useful feedback, humane breaks, and an orderly turn for everybody.  
**Path B: Marathon Mom.** Efficient effort, hydration, and a stopwatch that cannot keep up.

**Auto-Stamp:** `A1, B1, A2, A3, A4, A5, A6, B2, B3, B4, B5, B6`.  
**Trait integration:** Every action still builds Pace Setter toward +25% party PEP. The kit offers useful low-cost actions without changing the knockout reset.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Starting Step | `starting_step` | REWORKED (Sprint Tackle) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | quick | `vp(1,self); HEART +5%` | No |
| Signature | PEP TALK | `pep_talk` | REWORKED (PEP TALK; animation only) | 1 | 0 | 3 | legacy | legacy | 0 | 0 | others | legacy | `legacy(PEP TALK): others' next hit or heal +50%` | Legacy only |
| A1 | Margin Notes | `margin_notes` | REWORKED (Red Pen) | 2 | 1 | 2 | Sparkle | WARMTH | 1.35 | 1 | enemy | standard | `reveal(t); st(gritdown,2,t)` | No |
| A2 | Hall Pass Home | `hall_pass_home` | NEW | 6 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.20,t); cure(amber,t)` | Yes, K25 |
| A3 | Gold-Star Recess | `goldstar_recess` | NEW | 10 | 2 | 4 | Sparkle | WARMTH | 0 | 0 | party | standard | `heal(.20,party)` | Yes, K25 |
| A4 | Eyes Up Front | `eyes_up_front` | REWORKED (Pop Quiz) | 16 | 3 | 4 | Chatter | WARMTH | 0 | 0 | row | standard | `ct(+.20,t); interrupt(t)` | Yes, K25 |
| A5 | A Better Question | `better_question` | NEW | 22 | 3 | 5 | Sparkle | WARMTH | 1.8 | 1 | enemy | standard | `debuffBonus=.50; if present(Grace): heal(.05,Grace,w=0); if present(Rose): heal(.05,Rose,w=0)` | No |
| A6 | Everybody Gets a Turn | `everybody_turn` | NEW | 26 / 40 | 4 | 8 | Sparkle | WARMTH | 0 | 0 | party | heavy | `ct(-.45,party); st(personalbest,2,party); cure(mental,party)` | Yes, K55 |
| B1 | Lace, Then Race | `lace_then_race` | REWORKED (Burpee Blitz) | 2 | 1 | 2 | Kinetic | POW | 1.4 | 1 | enemy | quick | `crit=.15` | No |
| B2 | Hill Math | `hill_math` | REWORKED (Hill Repeats) | 6 | 2 | 4 | Kinetic | POW | 1.5 | 1 | splash | standard | `st(gritdown,.20,2,t)` | No |
| B3 | Water-Station Truce | `water_truce` | NEW | 10 | 2 | 3 | Splash | WARMTH | 0 | 0 | ally | standard | `heal(.30,t); vp(1,t)` | Yes, K30 |
| B4 | False Start | `false_start` | NEW | 16 | 3 | 4 | Kinetic | POW | 1.7 | 1 | enemy | quick | `interrupt(t); ct(+.15,t)` | No |
| B5 | Shakeout Mile | `shakeout_mile` | REWORKED (Marathon) | 22 | 3 | 5 | Cozy | WARMTH | 0 | 0 | party | standard | `st(pepup,2,party); cure(amber,party)` | Yes, K25 |
| B6 | The Stopwatch Can't Keep Up | `stopwatch_cant` | NEW | 26 / 40 | 4 | 9 | Kinetic | POW | 3.3 | 1 | all | heavy | `ct(-.20,self)` | No |


### Starting Step (Basic, `starting_step`)

Menu description: Take one sharp starting step into an enemy. Recover 1 VP.  
Spoken line: "Starting step. We are already moving."  
Battle message: "Amy does not waste the first second."  
Why it is them: She is a competitive runner even when a move is meant to be simple.  
The joke: Her casual first step looks suspiciously like race day.

Animation beats:
1. Amy checks one shoelace without stopping. (0.2 s)
2. One clean starting stride gives the target a shoulder-height padded bump. (0.35 s)
3. She is already jogging in place when the target notices. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: single starting-line tick / scene effects: none / sounds: none


### PEP TALK (Signature, `pep_talk`)

Menu description: Encourage everyone else. Their next hit or heal is stronger.  
Spoken line: "Pep talk. You can do hard things."  
Battle message: "Amy believes it before everybody else does."  
Why it is them: She is fiercely encouraging as both teacher and mother.  
The joke: Her own to-do list keeps unrolling behind the encouragement.

Animation beats:
1. Amy gathers the others with a firm coach clap. (0.4 s)
2. Her single confident point lights a next-action arrow over each recipient. (0.7 s)
3. She smiles, then discreetly steps on the end of her runaway to-do list. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: runaway to-do list; next-action arrows / scene effects: none / sounds: none


### Margin Notes (A1, `margin_notes`)

Menu description: Give one enemy very specific feedback. Reveal weaknesses and lower GRIT.  
Spoken line: "Margin notes. Show your working."  
Battle message: "The feedback is thorough and legible."  
Why it is them: Her red-pen teaching tools make precise criticism feel natural.  
The joke: The enemy's dramatic armor receives a surprisingly constructive annotation.

Animation beats:
1. Amy draws a neat red bracket beside one armor section. (0.4 s)
2. She adds a correction tick that snaps the armor seam into a visible weakness outline. (0.7 s)
3. A tiny PLEASE EXPLAIN note sticks to the least convincing piece. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: red margin bracket; PLEASE EXPLAIN note / scene effects: none / sounds: none


### Hall Pass Home (A2, `hall_pass_home`)

Menu description: Give a friend permission to leave the cold. Heal a little and clear Amber-Stuck.  
Spoken line: "Hall pass home. No freezing in the corridor."  
Battle message: "The pass includes a warm place to go."  
Why it is them: A teacher's practical permission becomes a way out of feeling trapped.  
The joke: The cold has apparently forgotten to sign the proper form.

Animation beats:
1. Amy presents a small HOME hall pass beside a narrow drawn doorway. (0.4 s)
2. The recipient steps through its warm light while amber falls behind the threshold. (0.7 s)
3. The pass gets a cheerful RETURN WHEN READY stamp. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: HOME hall pass; narrow warm doorway; RETURN WHEN READY stamp / scene effects: none / sounds: none


### Gold-Star Recess (A3, `goldstar_recess`)

Menu description: Call a proper recess. Heal the party and make taking a break feel earned.  
Spoken line: "Gold-star recess. Rest counts as good work."  
Battle message: "The assignment is to stop for a moment."  
Why it is them: She understands encouragement and needs permission to rest herself.  
The joke: The class earns a gold star for not doing another task.

Animation beats:
1. Amy draws a single empty box on a little task card. (0.4 s)
2. She stamps DONE over the empty box; gold-star paper pinwheels turn above the recipients. (0.7 s)
3. She takes the last pinwheel herself and the party smiles. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: empty-task card; gold-star pinwheels / scene effects: none / sounds: none


### Eyes Up Front (A4, `eyes_up_front`)

Menu description: Ask an enemy row to pay attention. Delay them and interrupt wind-ups.  
Spoken line: "Eyes up front. This part matters."  
Battle message: "The room suddenly remembers its manners."  
Why it is them: She can redirect a distracted room with very little wasted language.  
The joke: Even an elaborate monster wind-up pauses for teacher eye contact.

Animation beats:
1. Amy turns an ordinary classroom pointer toward the selected row. (0.4 s)
2. The pointer stops on an empty attention circle; every target looks there instead of winding up. (0.7 s)
3. She puts a friendly little star in the circle when they comply. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: empty attention circle; compliance star / scene effects: none / sounds: none


### A Better Question (A5, `better_question`)

Menu description: Challenge one enemy's bad assumption. Hit harder when it is debuffed and give the girls a little reassurance.  
Spoken line: "A better question: who needed your opinion?"  
Battle message: "Amy changes the question, not her standards."  
Why it is them: Her competitive edge and protectiveness become a sharp but family-sized comeback.  
The joke: The enemy prepared answers to the wrong question.

Animation beats:
1. Four multiple-choice answer tiles orbit the target. (0.4 s)
2. Amy flips the question card; all four tiles converge into one bright question-mark bonk. (0.7 s)
3. She gives Grace and Rose a quick reassuring nod when they are active. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: flippable question card; four answer tiles / scene effects: none / sounds: none


### Everybody Gets a Turn (A6, `everybody_turn`)

Menu description: Make a fair turn for every friend. Pull the party forward, lift POW and WARMTH, and clear mental debuffs.  
Spoken line: "Everybody gets a turn. Including me."  
Battle message: "Amy puts her own name on the list."  
Why it is them: Teaching, competition, and carrying too much meet in the decision to include herself.  
The joke: The last name on the carefully managed roster is the teacher's own.

Animation beats:
1. A towering class roster fills the background while Amy tries to hold too many task cards. (0.8 s)
2. She sets the cards down and writes each active ally's name into a clear turn box. (1 s)
3. A final empty box waits; Amy looks surprised, then writes AMY. (1.3 s)
4. The boxes become bright stepping tiles that pull the party's upcoming ribbon portraits forward together. (1.3 s)
5. Amy takes her own tile, exhales, and allows herself one satisfied fist pump. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: giant turn roster; name-box stepping tiles; task-card stack / scene effects: roster-to-ribbon transition / sounds: none


### Lace, Then Race (B1, `lace_then_race`)

Menu description: Tighten one lace and make one efficient hit. Gain extra crit chance.  
Spoken line: "Lace, then race. Loose ends lose seconds."  
Battle message: "The preparation takes less time than the hit."  
Why it is them: A runner's tiny rituals matter to somebody this competitive.  
The joke: The lace knot finishes just as the enemy realizes the race started.

Animation beats:
1. Amy pulls one shoelace into a crisp loop. (0.4 s)
2. She snaps the knot shut and the matching stride taps the enemy with a sharp kinetic ring. (0.7 s)
3. The knot receives a tiny approving check mark. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: oversized lace loop; knot check mark / scene effects: none / sounds: none


### Hill Math (B2, `hill_math`)

Menu description: Put the steep part under the enemy. Hit one target and its neighbors, lowering GRIT by 20%.  
Spoken line: "Hill math. The steep part is yours."  
Battle message: "Amy has distributed the elevation unfairly."  
Why it is them: Hill repeats and a teacher's sense of structure belong in the same joke.  
The joke: She gets the flat route after showing exactly where the hill should go.

Animation beats:
1. Amy draws one steep contour line on a tiny route card. (0.4 s)
2. The line lifts the selected enemy's footing into a triangular hill and rolls its neighbors gently outward. (0.7 s)
3. Amy points out the perfectly flat path beside it. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: contour route card; triangular pop-up hill / scene effects: none / sounds: none


### Water-Station Truce (B3, `water_truce`)

Menu description: Offer water and a real pause. Heal a friend and restore 1 VP.  
Spoken line: "Water-station truce. Drink first, compete later."  
Battle message: "Nobody has to win the water break."  
Why it is them: A runner knows hydration matters more than pride.  
The joke: Amy has to remind herself that this particular station is not a race.

Animation beats:
1. Amy sets out one plain water cup on a tiny race-station tray. (0.4 s)
2. She pushes the finish-line arrow away from the tray and hands over the cup. (0.7 s)
3. The recipient drinks happily while Amy deliberately turns her stopwatch face down. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: water-station tray; removable racing arrow / scene effects: none / sounds: none


### False Start (B4, `false_start`)

Menu description: Catch one enemy leaning too early. Hit it, interrupt its wind-up, and delay its turn.  
Spoken line: "False start. Back behind the line."  
Battle message: "The enemy is sent back to its starting block."  
Why it is them: Her competitive runner's eye catches a rushed start instantly.  
The joke: A towering monster is disqualified by a line barely wider than a shoelace.

Animation beats:
1. A small starting block appears beneath the target's wind-up stance. (0.4 s)
2. Amy slides the start line behind its foot; a padded block snaps it gently back. (0.7 s)
3. She points to the newly obvious line without saying anything else. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: sliding start line; padded starting block / scene effects: none / sounds: none


### Shakeout Mile (B5, `shakeout_mile`)

Menu description: Warm the party with an easy shakeout. Raise PEP and clear Amber-Stuck.  
Spoken line: "Shakeout mile. Easy means actually easy."  
Battle message: "Amy reluctantly demonstrates a sustainable pace."  
Why it is them: Her running warmth becomes a counter to the villain's frozen stillness.  
The joke: She has to physically pull her own pace arrow back toward EASY.

Animation beats:
1. Amy places a small pace slider between EASY and COMPETITIVE. (0.4 s)
2. She pushes it firmly to EASY; warm moving footprints loosen amber around the recipients. (0.7 s)
3. The footprints end in a relaxed stretch and smiling faces. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: EASY/COMPETITIVE pace slider; warm footprint loop / scene effects: none / sounds: none


### The Stopwatch Can't Keep Up (B6, `stopwatch_cant`)

Menu description: Outrun a stopwatch that has started running away. Strike every enemy and take your next turn sooner.  
Spoken line: "The stopwatch cannot keep up. That is new."  
Battle message: "Amy catches the clock, not the other way around."  
Why it is them: Her personal-best competitiveness becomes a joke about the measuring device losing.  
The joke: The stopwatch grows tiny legs and still cannot escape her split time.

Animation beats:
1. Amy checks her stopwatch; its digits rearrange into a very worried face. (0.8 s)
2. Two tiny legs emerge and the watch sprints across the enemy side. (1 s)
3. Amy catches up with visibly comfortable form while the digits trail behind like untied laces. (1.3 s)
4. She lifts the watch by its strap; the escaping digits collapse into one broad padded impact across the enemies. (1.3 s)
5. The watch displays NICE WORK and Amy looks almost disappointed by the lack of competition. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: runner_set / props: running stopwatch; trailing digit laces; NICE WORK display / scene effects: digit-collapse impact / sounds: none


### Deedee

Competent care with flour on its sleeves and absolutely no intention of slowing down.

**Path A: Registered Baker.** Nurse instincts, warm food, and care without visiting-hour limits.  
**Path B: Busy Bee.** Brisk movement, fresh air, and color that refuses to stay frozen.

**Auto-Stamp:** `A1, B1, A2, A3, A4, A5, A6, B2, B3, B4, B5, B6`.  
**Trait integration:** Only explicitly baking-tagged actions grant the listed Warm Crusts, once per action, capped at three. The existing free 20% snack remains unchanged and Nara can eat it.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Dish-Towel Flick | `dish_towel_flick` | REWORKED (Spit Shine) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | standard | `vp(1,self); HEART +5%` | No |
| Signature | MOON & BACK | `moon_back` | REWORKED (MOON & BACK; animation only) | 1 | 0 | 4 | legacy | legacy | 0 | 0 | party | legacy | `legacy(MOON & BACK): heal 40%; Tucked In` | Legacy only |
| A1 | Registered Nut, Reporting | `registered_nut` | REWORKED (Registered Nut) | 2 | 1 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.35,t); cure(one,t)` | Yes, K30 |
| A2 | Corner-Piece Privilege | `corner_piece` | REWORKED (Rhubarb Crisp) | 6 | 2 | 4 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.45,t); crust(1); tag=baking` | Yes, K35 |
| A3 | Pepper-Free Plate | `pepper_free_plate` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(amber,t); crust(1); tag=baking; if present(Boppy): heal(.10,Boppy,w=0)` | Yes, K30 |
| A4 | Rolling-Pin Rounds | `rolling_pin_rounds` | NEW | 16 | 3 | 4 | Kinetic | POW | 1.8 | 1 | enemy | standard | `interrupt(t)` | No |
| A5 | Oven Mitt Ultimatum | `oven_mitt_ultimatum` | NEW | 22 | 3 | 5 | Cozy | WARMTH | 1.6 | 1 | row | standard | `st(grumbled,2,t)` | No |
| A6 | Open Visiting Hours | `open_visiting` | NEW | 26 / 40 | 4 | 8 | Cozy | WARMTH | 0 | 0 | party | heavy | `heal(.45,party); cure(all,party); crust(3); tag=baking` | Yes, K60 |
| B1 | Brisk Means Brisk | `brisk_means_brisk` | REWORKED (Power Walk) | 2 | 1 | 2 | Kinetic | POW | 1.5 | 1 | enemy | quick | `none` | No |
| B2 | Garden Shower | `garden_shower` | NEW | 6 | 2 | 3 | Splash | WARMTH | 1.2 | 1 | row | standard | `ct(+.15,t)` | No |
| B3 | Windows Open | `windows_open` | NEW | 10 | 2 | 4 | Cozy | WARMTH | 0 | 0 | party | standard | `cure(mental,party); cure(amber,party); st(coolup,2,party)` | Yes, K25 |
| B4 | Spotless Record | `spotless_record` | NEW | 16 | 3 | 4 | Sparkle | WARMTH | 1.8 | 1 | enemy | standard | `steal(t,self)` | No |
| B5 | Take a Breather | `take_a_breather` | NEW | 22 | 3 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); vp(2,t)` | Yes, K30 |
| B6 | Everything Is Coming Up | `everything_coming_up` | NEW | 26 / 40 | 4 | 9 | Sparkle | WARMTH | 3.3 | 1 | all | heavy | `cure(amber,party)` | No |


### Dish-Towel Flick (Basic, `dish_towel_flick`)

Menu description: Flick one enemy with a clean dish towel. Recover 1 VP.  
Spoken line: "Dish-towel flick. You had a spot."  
Battle message: "The spot has been dealt with."  
Why it is them: She cleans constantly and spots a small mess immediately.  
The joke: The enormous enemy is treated like a single smudge on a countertop.

Animation beats:
1. Deedee notices a tiny dark pixel on the target. (0.2 s)
2. A short dish-towel flick removes the pixel with a crisp padded snap. (0.35 s)
3. She folds the towel into a precise square. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: folded dish-towel square / scene effects: none / sounds: none


### MOON & BACK (Signature, `moon_back`)

Menu description: Wrap the party in a loving group hug and tuck everyone in.  
Spoken line: "I love you to the moon and back."  
Battle message: "There is no shortened version of this love."  
Why it is them: This is her full, canonical phrase, not a generic spell.  
The joke: A little measuring line tries and fails to fit the distance on screen.

Animation beats:
1. Deedee opens her arms as a measuring line stretches toward a small moon. (0.4 s)
2. The line loops all the way back into a group-hug heart around the recipients. (0.7 s)
3. The line runs out of numbers; the party settles into a warm, happy glow. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: overlong moon measuring line / scene effects: none / sounds: none


### Registered Nut, Reporting (A1, `registered_nut`)

Menu description: Get a proper check-up from a very energetic nurse. Heal at least 35% HP and remove one debuff.  
Spoken line: "Registered nut, reporting. Let me see that."  
Battle message: "The bedside manner is brisk and affectionate."  
Why it is them: She is a retired registered nurse whom Tom calls a registered nut.  
The joke: Her badge has been lovingly corrected in tiny handwriting.

Animation beats:
1. Deedee straightens a nurse badge with NUT written on a removable sticker. (0.4 s)
2. She checks the recipient's wrist; a small pulse icon straightens into a healthy beat. (0.7 s)
3. She pats the recipient's hand and peels away the unhelpful debuff sticker. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: pulse_check / props: corrected nurse badge; pulse icon / scene effects: none / sounds: none


### Corner-Piece Privilege (A2, `corner_piece`)

Menu description: Offer the best corner of homemade rhubarb crisp. Heal a friend and add one Warm Crust.  
Spoken line: "Corner-piece privilege. I saved the good bit."  
Battle message: "Somehow everybody is her favorite."  
Why it is them: Rhubarb crisp is her signature bake.  
The joke: The pan appears to have more corners than geometry normally permits.

Animation beats:
1. Deedee angles a crisp pan to display one particularly golden corner. (0.4 s)
2. She lifts that corner onto a dish; the empty corner neatly folds into a fresh golden one. (0.7 s)
3. The recipient smiles over the dish while one crumb joins the Warm Crust tray. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: folding-corner crisp pan / scene effects: none / sounds: none


### Pepper-Free Plate (A3, `pepper_free_plate`)

Menu description: Offer a warm homemade bread bowl without peppers. Clear Amber-Stuck and add a Warm Crust; Boppy gets extra care.  
Spoken line: "Pepper-free plate. Your stomach gets a vote."  
Battle message: "The recipe has been adjusted without a fuss."  
Why it is them: A nurse and family cook notices what somebody actually needs.  
The joke: The pepper jar gets its own tiny NOT TODAY sign.

Animation beats:
1. Deedee slides a pepper jar behind a small NOT TODAY card. (0.4 s)
2. She presents a warm baked bread bowl; its steam loosens amber around the recipient. (0.7 s)
3. Boppy, when active, gets a small plain extra portion and an approving smile. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: NOT TODAY pepper card; plain bread bowl / scene effects: none / sounds: none


### Rolling-Pin Rounds (A4, `rolling_pin_rounds`)

Menu description: Make a quick round with the rolling pin. Hit one enemy and interrupt its wind-up.  
Spoken line: "Rolling-pin rounds. That needs flattening."  
Battle message: "The dangerous bit is now much flatter."  
Why it is them: Her baking tools and practical nurse efficiency share the same no-nonsense rhythm.  
The joke: The enemy's telegraph is treated like an uneven patch of pastry.

Animation beats:
1. Deedee checks the raised wind-up icon as if inspecting uneven dough. (0.4 s)
2. One rolling-pin pass flattens the icon with a dough-colored bonk on the target. (0.7 s)
3. She turns the flattened icon over, checks it, and sets it aside. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: flattened pastry telegraph / scene effects: none / sounds: none


### Oven Mitt Ultimatum (A5, `oven_mitt_ultimatum`)

Menu description: Clap the oven mitts once. Hit a row and reduce its POW and WARMTH.  
Spoken line: "Oven mitt ultimatum. Enough of that."  
Battle message: "Deedee has used the serious mitts."  
Why it is them: An energetic grandmother can stop nonsense without losing her warmth.  
The joke: The fluffy mitts look ridiculous until they clap with complete authority.

Animation beats:
1. Deedee slowly puts on two disproportionately fluffy oven mitts. (0.4 s)
2. She claps them once; a warm rectangular pressure wave taps the selected row. (0.7 s)
3. She hangs the mitts up neatly while the targets look chastened. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: oversized fluffy oven mitts / scene effects: none / sounds: none


### Open Visiting Hours (A6, `open_visiting`)

Menu description: Open a place where nobody has to recover alone. Heal the party, clear debuffs, and fill the Warm Crust tray.  
Spoken line: "Open visiting hours. Family does not clock out."  
Battle message: "The visiting hours have been permanently extended."  
Why it is them: Her nursing competence and family baking become a serious answer to isolation.  
The joke: The forbidding sign loses an argument to one very small handwritten correction.

Animation beats:
1. A pop-up care corridor appears with a large VISITING HOURS OVER sign and closed dividers. (0.8 s)
2. Deedee reads the sign, raises one eyebrow, and takes out a pencil. (1 s)
3. She crosses out OVER and writes ALWAYS; the dividers fold into ordinary bedside chairs. (1.3 s)
4. Warm light reaches every active ally as a fresh homemade bread tray rolls along the corridor and fills three crust slots. (1.3 s)
5. Deedee sits for exactly one contented beat, then notices a crooked chair and straightens it. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: pop-up care corridor; corrected visiting sign; bedside chairs; rolling bread tray / scene effects: divider-to-chair fold / sounds: none


### Brisk Means Brisk (B1, `brisk_means_brisk`)

Menu description: Take one very brisk pass through an enemy. Act again quickly.  
Spoken line: "Brisk means brisk. Keep your arms moving."  
Battle message: "The stroll has become an event."  
Why it is them: She power walks with real energy.  
The joke: A tiny SIGHTSEEING sign falls behind her almost immediately.

Animation beats:
1. Deedee begins with a perfectly respectable walking posture. (0.4 s)
2. Her brisk arm swing carries a little air-thump through the chosen enemy. (0.7 s)
3. A tiny SIGHTSEEING sign spins in her wake while she keeps walking. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: SIGHTSEEING sign / scene effects: none / sounds: none


### Garden Shower (B2, `garden_shower`)

Menu description: Water an enemy row rather more thoroughly than expected. Delay its next turns.  
Spoken line: "Garden shower. You looked a little wilted."  
Battle message: "The watering schedule was ambitious."  
Why it is them: Gardening turns a household routine into a battle tool.  
The joke: She carefully chooses the gentle shower setting before a very broad spray.

Animation beats:
1. Deedee checks a watering nozzle labeled GENTLE. (0.4 s)
2. A wide dotted shower sweeps once across the selected row, tipping the targets like wilted stems. (0.7 s)
3. She checks the nozzle again, apparently pleased with its restraint. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: GENTLE nozzle selector / scene effects: none / sounds: none


### Windows Open (B3, `windows_open`)

Menu description: Let warm fresh air in. Clear mental debuffs and Amber-Stuck, and raise COOL.  
Spoken line: "Windows open. This room needs a fresh start."  
Battle message: "The stale mood goes out first."  
Why it is them: Her cleaning and caregiving instincts both notice when a room feels wrong.  
The joke: The scariest mental-debuff icon leaves in a tiny dustpan-shaped draft.

Animation beats:
1. Deedee unlatches one freestanding window frame beside the party. (0.4 s)
2. Warm curtains billow inward while dark thought icons and amber flakes drift outward. (0.7 s)
3. The curtains settle into a small heart-shaped opening around smiling recipients. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: freestanding window frame; heart-gap curtains / scene effects: none / sounds: none


### Spotless Record (B4, `spotless_record`)

Menu description: Polish the shine from one enemy buff into a serving spoon. Hit the enemy and keep one eligible buff.  
Spoken line: "Spotless record. This spoon deserves the shine."  
Battle message: "The shine has found a cleaner home."  
Why it is them: Constant cleaning makes her notice which impressive effects are only surface shine.  
The joke: An enemy loses its glamorous power-up to a very ordinary serving spoon.

Animation beats:
1. Deedee holds a tarnished serving spoon so the target buff reflects in its bowl. (0.4 s)
2. One brisk polish gathers the reflection into a bright spot, tapping the target and transferring the shine to her apron. (0.7 s)
3. She checks her spotless reflection and sets the spoon neatly aside. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: tarnished serving spoon; captured shine reflection / scene effects: none / sounds: none


### Take a Breather (B5, `take_a_breather`)

Menu description: Help a friend take one proper breath. Heal at least 25% HP and restore 2 VP.  
Spoken line: "Take a breather. I will count with you."  
Battle message: "Deedee makes a little space to breathe."  
Why it is them: Her nursing care is practical and attentive, not just another serving of food.  
The joke: She gives an enormous hurried exhale the same patient counting as a small one.

Animation beats:
1. Deedee holds up one finger beside a small warm breathing circle. (0.4 s)
2. The circle expands once, then settles; the recipient follows its single calm rhythm. (0.7 s)
3. She lowers the finger and gives a reassuring hand pat as a heart rises. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: single-cycle breathing circle / scene effects: none / sounds: none


### Everything Is Coming Up (B6, `everything_coming_up`)

Menu description: Plant color in a frozen stage. Strike every enemy with a rising garden and thaw the party.  
Spoken line: "Everything is coming up. Even you lot."  
Battle message: "The garden declines to stay grey."  
Why it is them: Her gardening and unstoppable energy directly oppose a world that refuses to grow.  
The joke: A tiny seed packet produces an extremely well-organized uprising.

Animation beats:
1. The stage briefly becomes a flat grey tiled garden bed; Deedee kneels with one seed packet. (0.8 s)
2. She presses three seeds into neat gaps and pats the soil with enormous confidence. (1 s)
3. One tiny sprout appears, pauses, and reveals a root system already lifting every grey tile. (1.3 s)
4. Huge bright leaves spring open beneath the enemies in one broad padded launch while warm color reaches the party. (1.3 s)
5. Deedee places a small PLEASE WATER sign and brushes one speck of dirt from her sleeve. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: seed_press / props: three-seed packet; lifting garden tiles; PLEASE WATER sign / scene effects: root-to-color reveal / sounds: none


### Boppy

A formidable protector learning that staying beside people matters more than making them stay still.

**Path A: Patient Warden.** Fishing, boundaries, and a gate that can open safely.  
**Path B: Pepper Champion.** Home-grown heat and a story that began in 1970.

**Auto-Stamp:** `A1, B1, A2, A3, A4, A5, A6, B2, B3, B4, B5, B6`.  
**Trait integration:** Peppers and guarded hits build the existing three-pip Heartburn. Listed burn grants are the pepper event itself; the Counter-Roar trigger is not manually duplicated.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Cap Check | `cap_check` | REWORKED (Cap Swat) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | standard | `vp(1,self); HEART +5%` | No |
| Signature | GRUMBLE | `grumble` | REWORKED (GRUMBLE; animation only) | 1 | 0 | 2 | legacy | legacy | 0 | 0 | row | legacy | `legacy(GRUMBLE): enemy row Grumbled; draw attacks to self; Guard; Heartburn interaction` | Legacy only |
| A1 | Patient Angler | `patient_angler` | REWORKED (Cast Line) | 2 | 1 | 2 | Splash | POW | 1.4 | 1 | enemy | standard | `row(front,t); st(hooked,2,t)` | No |
| A2 | Recliner Reservation | `recliner_reservation` | REWORKED (Recliner Drop) | 6 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.30,t); st(guard,1,t); if present(Deedee): st(guard,1,Deedee)` | Yes, K30 |
| A3 | Headcount, Again | `headcount_again` | NEW | 10 | 2 | 3 | Chatter | WARMTH | 0 | 0 | row | standard | `reveal(t); ct(+.20,t)` | Yes, K25 |
| A4 | Closing Time | `closing_time` | NEW | 16 | 3 | 4 | Kinetic | POW | 1.8 | 1 | enemy | standard | `interrupt(t); st(hooked,1,t)` | No |
| A5 | Everybody Waits | `everybody_waits` | NEW | 22 | 3 | 5 | Chatter | WARMTH | 0 | 0 | party | standard | `st(nobodygetspast,2,party)` | Yes, K25 |
| A6 | The Gate Stays Open | `gate_stays_open` | NEW | 26 / 40 | 4 | 9 | Kinetic | POW | 3.6 | 1 | enemy | heavy | `st(guard,1,party); shieldBreak(t)` | No |
| B1 | One Pepper, Sensible Size | `sensible_pepper` | REWORKED (Pepper Breath) | 2 | 1 | 2 | Cozy | POW | 1.4 | 1 | enemy | standard | `burn(1); tag=pepper` | No |
| B2 | Seeds of Trouble | `seeds_of_trouble` | REWORKED (Hot Pepper) | 6 | 2 | 4 | Cozy | POW | 1.4 | 1 | row | standard | `burn(1); tag=pepper` | No |
| B3 | Mild for Company | `mild_for_company` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(amber,t); burn(1); tag=pepper` | Yes, K30 |
| B4 | In Nineteen Seventy | `nineteen_seventy` | REWORKED (Track Star Story) | 16 | 3 | 4 | Chatter | WARMTH | 0 | 0 | all | heavy | `ct(+.20,t)` | Yes, K25 |
| B5 | Jar-Lid Negotiations | `jar_lid_negotiations` | NEW | 22 | 3 | 5 | Kinetic | POW | 1.6 | 1 | splash | heavy | `shieldBreak(primary); st(guard,1,self)` | No |
| B6 | The Pepper Forecast | `pepper_forecast` | NEW | 26 / 40 | 4 | 9 | Cozy | POW | 3.3 | 1 | all | heavy | `burn(1); tag=pepper; st(grumbled,2,t)` | No |


### Cap Check (Basic, `cap_check`)

Menu description: Check one enemy with the brim of a cap. Recover 1 VP.  
Spoken line: "Cap check. Not past me."  
Battle message: "Boppy has noticed the attempted shortcut."  
Why it is them: The retired warden remains alert even when he looks unimpressed.  
The joke: The tiniest cap adjustment stops a very large trespass.

Animation beats:
1. Boppy appears to be only adjusting his cap. (0.2 s)
2. Its brim gives the selected target a small decisive sideways swat. (0.35 s)
3. He returns the cap to exactly the same angle. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: cap-angle tick / scene effects: none / sounds: none


### GRUMBLE (Signature, `grumble`)

Menu description: Grumble at an enemy row. Make it hit softer, draw its attacks, and guard.  
Spoken line: "Everybody walks too fast. Come over here."  
Battle message: "The complaint is also a defensive formation."  
Why it is them: His complaint about people walking too fast masks a protective instinct.  
The joke: He complains about the pace while putting himself in everybody's way.

Animation beats:
1. Boppy sits forward and points at a wildly overenthusiastic walking-speed arrow. (0.4 s)
2. His grumble compresses the arrow into a small stop sign as he braces in front. (0.7 s)
3. The targets face him; he keeps one guarded eye on his family. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: walking-speed arrow; compressed stop sign / scene effects: none / sounds: none


### Patient Angler (A1, `patient_angler`)

Menu description: Wait for the right tug. Pull an enemy toward the front when there is room and prevent dodging.  
Spoken line: "Patient angler. The fish can wait for me."  
Battle message: "The patience was a trap."  
Why it is them: He fishes and refuses to be hurried.  
The joke: The enemy grows impatient before the fisherman does.

Animation beats:
1. Boppy rests a fishing float on a perfectly still patch of water. (0.4 s)
2. The target impatiently nudges the float; a short line tug taps and draws it forward. (0.7 s)
3. Boppy reels exactly one click and goes still again. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: patient fishing float; single-click reel marker / scene effects: none / sounds: none


### Recliner Reservation (A2, `recliner_reservation`)

Menu description: Reserve a safe, comfortable seat for a friend. Heal and guard them; Deedee gets cover too.  
Spoken line: "Recliner reservation. I suppose you can have it."  
Battle message: "The best seat is grudgingly available."  
Why it is them: His prized recliner reveals affection when he offers it to someone else.  
The joke: He acts inconvenienced while already adjusting the footrest for the guest.

Animation beats:
1. Boppy lifts a RESERVED card from the recliner with exaggerated reluctance. (0.4 s)
2. The footrest unfolds around the recipient as a warm protective seat shape. (0.7 s)
3. He quietly adjusts the cushion until the recipient is smiling. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: RESERVED recliner card; adjustable guest cushion / scene effects: none / sounds: none


### Headcount, Again (A3, `headcount_again`)

Menu description: Count an enemy row twice. Reveal weaknesses and delay its next turns.  
Spoken line: "Headcount, again. Nobody move while I count."  
Battle message: "Boppy has included himself by mistake."  
Why it is them: A former Assistant Deputy Warden notices who is where.  
The joke: He restarts because his own pointing finger entered the count.

Animation beats:
1. Boppy points along the selected row as large counting dots appear above it. (0.4 s)
2. An extra dot appears over his own hand; the enemies pause while weakness icons replace their dots. (0.7 s)
3. He crosses out his own dot and gives the row a satisfied, surprisingly friendly nod. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: headcount dots; crossed-out extra dot / scene effects: none / sounds: none


### Closing Time (A4, `closing_time`)

Menu description: Close a padded barrier on a dangerous plan. Hit one enemy and interrupt its wind-up.  
Spoken line: "Closing time. That nonsense is closed."  
Battle message: "The plan has missed its opening hours."  
Why it is them: His authority comes from calmly controlling a boundary.  
The joke: The terrifying attack is stopped by a tiny CLOSED sign and a padded rail.

Animation beats:
1. Boppy checks a small clock-shaped CLOSED sign. (0.4 s)
2. A padded queue rail swings across the target's wind-up icon and bonks it shut. (0.7 s)
3. He tests the rail once, then folds his arms. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: CLOSED clock sign; padded queue rail / scene effects: none / sounds: none


### Everybody Waits (A5, `everybody_waits`)

Menu description: Ask the whole world to wait a moment. The party takes 40% less damage for two turns.  
Spoken line: "Everybody waits. My family goes first."  
Battle message: "The grumble has become a clear priority."  
Why it is them: Under the complaints is a powerful wish to keep his family safe.  
The joke: The official-looking queue ticket says FAMILY before any number appears.

Animation beats:
1. Boppy pulls one ticket from an absurdly small queue dispenser. (0.4 s)
2. The ticket unrolls into FAMILY FIRST across the party's protective front edge. (0.7 s)
3. He ushers the recipients behind it with a nearly invisible smile. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: FAMILY FIRST queue ticket / scene effects: none / sounds: none


### The Gate Stays Open (A6, `gate_stays_open`)

Menu description: Hold a gate open for everyone coming through. Strike one enemy, break an ordinary shield, and guard the party.  
Spoken line: "The gate stays open. I am right here."  
Battle message: "Keeping people safe does not mean keeping them still."  
Why it is them: His warden strength is redirected toward letting his family move forward safely.  
The joke: The massive mechanism yields to one small OPEN sign he has already prepared.

Animation beats:
1. An enormous locked turnstile rises between Boppy and the party's path forward. (0.8 s)
2. He takes out an OPEN sign instead of the expected lock. (1 s)
3. Boppy braces the heavy gate with one hand while bright footprints pass through its safe opening. (1.3 s)
4. He swings the excess gate panel outward into one padded impact on the selected enemy and its ordinary shield. (1.3 s)
5. The gate remains open behind him; he settles into an unhurried protective stance. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: gate_hold / props: oversized turnstile; prepared OPEN sign; safe footprint lane / scene effects: hinged gate safety sweep / sounds: none


### One Pepper, Sensible Size (B1, `sensible_pepper`)

Menu description: Try one supposedly sensible pepper. Hit an enemy and gain one Heartburn pip.  
Spoken line: "One pepper. Sensible size. Stomach may disagree."  
Battle message: "The pepper has its own opinion of sensible."  
Why it is them: He grows hot peppers and complains about his stomach.  
The joke: The smallest pepper produces the largest offended eyebrow.

Animation beats:
1. Boppy measures a very small pepper between two fingers. (0.4 s)
2. He tastes it; a little kettle-shaped heat puff pops directly against the target. (0.7 s)
3. He checks the remaining pepper with deep personal suspicion. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: tiny measured pepper; kettle-shaped heat puff / scene effects: none / sounds: none


### Seeds of Trouble (B2, `seeds_of_trouble`)

Menu description: Tap a pepper seed packet across a row. Deal Cozy damage and gain one Heartburn pip.  
Spoken line: "Seeds of trouble. I grew these myself."  
Battle message: "The crop is performing above expectations."  
Why it is them: His pride in home-grown peppers matters as much as the heat.  
The joke: He inspects the row as if judging a small agricultural success.

Animation beats:
1. Boppy shows off a seed packet with a proudly handwritten HOT label. (0.4 s)
2. One tap sends three warm seed-shaped sparks across the selected row. (0.7 s)
3. He shakes the packet, finds one remaining seed, and pockets it carefully. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: hand-labeled HOT seed packet / scene effects: none / sounds: none


### Mild for Company (B3, `mild_for_company`)

Menu description: Share a genuinely mild homemade pepper broth. Heal a friend, clear Amber-Stuck, and gain a Heartburn pip.  
Spoken line: "Mild for company. I checked this time."  
Battle message: "The warning label has been honestly adjusted."  
Why it is them: Offering a milder version shows care beneath his pepper bravado.  
The joke: He tests the tiniest spoonful with the expression of a safety inspector.

Animation beats:
1. Boppy turns a HOT label around to reveal MILD in careful handwriting. (0.4 s)
2. He tests a tiny spoon and passes warm broth to the recipient as amber melts. (0.7 s)
3. The recipient smiles; Boppy looks relieved that the label was accurate. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: reversible HOT/MILD label; tiny testing spoon / scene effects: none / sounds: none


### In Nineteen Seventy (B4, `nineteen_seventy`)

Menu description: Begin the college story in its proper year. Delay and gently cheer every enemy.  
Spoken line: "In nineteen seventy, before everybody walked so fast..."  
Battle message: "The introduction has several introductory remarks."  
Why it is them: He entered college in 1970 and loves telling his cross-country story.  
The joke: The year gets an enormous title card before the story itself begins.

Animation beats:
1. Boppy raises one finger and a huge 1970 title card settles over the enemy side. (0.4 s)
2. A second card labeled FIRST, SOME CONTEXT slides beneath it, making every target pause. (0.7 s)
3. A tiny listening chair appears beside each amused enemy while Boppy prepares another finger. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: 1970 title card; FIRST, SOME CONTEXT card; listening chairs / scene effects: none / sounds: none


### Jar-Lid Negotiations (B5, `jar_lid_negotiations`)

Menu description: Make a stuck lid reconsider. Hit a target and its neighbors, break its ordinary shield, and guard.  
Spoken line: "Jar-lid negotiations. I was being polite before."  
Battle message: "The lid accepts the revised terms."  
Why it is them: His quiet strength appears when a domestic nuisance refuses to cooperate.  
The joke: The apparently impossible opponent is a lid one pixel too tight.

Animation beats:
1. Boppy grips a stubborn jar whose lid mirrors the primary target's ordinary shield. (0.4 s)
2. One controlled twist pops the lid with a broad padded ring across the target and neighbors. (0.7 s)
3. He uses the freed lid as a small guard while pretending it was easy. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: shield-pattern jar lid / scene effects: none / sounds: none


### The Pepper Forecast (B6, `pepper_forecast`)

Menu description: Present an alarming home-grown heat forecast. Strike all enemies and soften their next attacks.  
Spoken line: "Pepper forecast. Unsettled around my stomach."  
Battle message: "The heat warning was locally sourced."  
Why it is them: His peppers, recliner viewing, and stomach complaints produce a highly personal forecast.  
The joke: The threatening weather front is traced back to one small pepper pot.

Animation beats:
1. A simple weather board appears beside Boppy's recliner, showing one suspicious warm front. (0.8 s)
2. He points solemnly at the front while a tiny stomach-shaped barometer rises. (1 s)
3. The board flips to reveal the entire forecast is coming from one home-grown pepper plant behind it. (1.3 s)
4. Boppy opens a small window in the board; one broad leaf-shaped warm front sweeps across all enemies. (1.3 s)
5. He closes the window, labels tomorrow SLIGHTLY MILDER, and looks unconvinced. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: pepper weather board; stomach barometer; small pepper pot; SLIGHTLY MILDER forecast / scene effects: board-flip heat-front reveal / sounds: none


### TNB

A calm fixer who makes frightening scenes safer and ordinary objects worth coming home to.

**Path A: On Set.** Continuity, practical horror, and the ending where everybody lives.  
**Path B: Kiln & Longboard.** Clay, useful repairs, and a beautiful refusal to stay still.

**Auto-Stamp:** `B1, A1, B2, B3, B4, B5, B6, A2, A3, A4, A5, A6`.  
**Trait integration:** WARDROBE and Quick Change keep the existing Action Hero, Cozy Cardigan, Final Girl cycle. Other support moves do not secretly advance the rack.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Clay Offcut | `clay_offcut` | REWORKED (Mug Toss) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | standard | `vp(1,self); HEART +5%` | No |
| Signature | WARDROBE | `wardrobe` | REWORKED (WARDROBE; animation only) | 1 | 0 | 4 | legacy | legacy | 0 | 0 | ally / allyko | legacy | `legacy(WARDROBE): existing heal or revive; rack(t)` | Legacy only |
| A1 | Quick Change | `quick_change` | REWORKED (Quick Change) | 2 | 1 | 2 | Sparkle | WARMTH | 0 | 0 | ally | quick | `cure(one,t); rack(t)` | Yes, K25 |
| A2 | Continuity Pins | `continuity_pins` | NEW | 6 | 2 | 3 | Sparkle | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); st(guard,1,t); if present(Tom): heal(.10,Tom,w=0)` | Yes, K30 |
| A3 | Lost-and-Found Warmth | `lost_found_warmth` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.20,t); cure(amber,t)` | Yes, K25 |
| A4 | Practical Effects | `practical_effects` | REWORKED (Jump Scare) | 16 | 3 | 4 | Sparkle | WARMTH | 1.6 | 1 | enemy | standard | `interrupt(t)` | No |
| A5 | Rush-Hour Racks | `rush_hour_racks` | NEW | 22 | 3 | 5 | Kinetic | POW | 1.5 | 1 | row | standard | `st(gritdown,2,t)` | No |
| A6 | Final Cut: Everybody Lives | `everybody_lives` | NEW | 26 / 40 | 4 | 9 | Sparkle | WARMTH | 0 | 0 | party | heavy | `cure(mental,party); st(wardrobefresh(.25),2,party)` | Yes, K60 |
| B1 | Clay Pigeon, Literally | `clay_pigeon` | NEW | 2 | 1 | 2 | Kinetic | hybrid | 1.4 | 1 | enemy | quick | `crit=.15` | No |
| B2 | Cone Six, Please | `cone_six` | REWORKED (passive Cone Six) | 6 | 2 | 4 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(amber,t); st(kilnglow,2,t)` | Yes, K25 |
| B3 | Curb Appeal | `curb_appeal` | REWORKED (Carve) | 10 | 2 | 4 | Kinetic | POW | 1.4 | 1 | row | quick | `ct(+.15,t)` | No |
| B4 | Fix the Wobble | `fix_wobble` | NEW | 16 | 3 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.20,t); vp(2,t)` | Yes, K30 |
| B5 | Kiln Door Policy | `kiln_door_policy` | REWORKED (Kiln Blast) | 22 | 3 | 6 | Cozy | WARMTH | 1.9 | 1 | enemy | heavy | `shieldBreak(t); interrupt(t)` | No |
| B6 | Earth, Thrown by Hand | `earth_thrown` | NEW | 26 / 40 | 4 | 9 | Cozy | WARMTH | 3.3 | 1 | all | heavy | `cure(amber,party)` | No |


### Clay Offcut (Basic, `clay_offcut`)

Menu description: Flick one harmless clay curl at an enemy. Recover 1 VP.  
Spoken line: "Clay offcut. Waste not, bonk not."  
Battle message: "The offcut has found a second career."  
Why it is them: A crafty potter can find a use for the smallest scrap.  
The joke: His pun is delivered with more confidence than it deserves.

Animation beats:
1. TNB notices one little curl of spare clay on his thumb. (0.2 s)
2. He flicks it into a soft spiral bonk against the selected enemy. (0.35 s)
3. The curl lands neatly in a tiny REUSE tray. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: clay curl; REUSE tray / scene effects: none / sounds: none


### WARDROBE (Signature, `wardrobe`)

Menu description: Help a friend recover and find their next costume. Can revive a fallen friend.  
Spoken line: "Wardrobe. Let us get you back in the scene."  
Battle message: "The next scene still needs this person."  
Why it is them: He handles costume racks and continuity on film sets.  
The joke: A huge dramatic entrance ends with him fixing one crooked collar.

Animation beats:
1. TNB rolls the familiar rack between the recipient and the stage lights. (0.4 s)
2. The correct next costume silhouette drops into place as the recipient heals or revives. (0.7 s)
3. He straightens one collar, gives a small nod, and rolls the rack neatly away. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: crooked-collar continuity marker / scene effects: none / sounds: none


### Quick Change (A1, `quick_change`)

Menu description: Clear one debuff and dress a friend in the next rack costume.  
Spoken line: "Quick change. Same person, better pockets."  
Battle message: "The pockets were the important improvement."  
Why it is them: Quick, practical costume changes are part of his real film-set world.  
The joke: The glamorous transformation is judged mostly by its storage space.

Animation beats:
1. TNB outlines the recipient with a single loop of measuring tape. (0.4 s)
2. The tape unzips like a paper silhouette; the next costume clicks into place and a debuff falls out. (0.7 s)
3. The recipient happily tests a new pocket while TNB gathers the tape. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: zip-open measuring-tape silhouette / scene effects: none / sounds: none


### Continuity Pins (A2, `continuity_pins`)

Menu description: Pin a friend safely back together. Heal and guard them, with a small extra check on Tom.  
Spoken line: "Continuity pins. You are staying in one piece."  
Battle message: "TNB checks the person before the costume."  
Why it is them: His continuity eye and affection for Tom make care look like quiet practical work.  
The joke: One dangling health-bar pixel receives the same attention as a crooked seam.

Animation beats:
1. TNB notices a loose thread-shaped segment beside the recipient's health icon. (0.4 s)
2. Two large safety-pin silhouettes fasten the loose segment into a warm protective outline. (0.7 s)
3. The recipient smiles; TNB sends Tom a tiny heart when he is active. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: health-bar thread; oversized safety-pin silhouettes / scene effects: none / sounds: none


### Lost-and-Found Warmth (A3, `lost_found_warmth`)

Menu description: Retrieve a warm scarf from an imaginary lost-and-found. Heal a friend and clear Amber-Stuck.  
Spoken line: "Lost warmth. Found scarf. Nice connection."  
Battle message: "The missing warmth has been turned in."  
Why it is them: His transit enthusiasm and wardrobe-runner organization make a tagged lost-property box feel specific.  
The joke: A very formal claim ticket retrieves something as abstract as feeling warm again.

Animation beats:
1. TNB checks a tiny claim ticket reading MISSING WARMTH against a deep lost-property box. (0.4 s)
2. He pulls out one absurdly long soft scarf; its final warm loop reaches the recipient and loosens amber. (0.7 s)
3. The recipient smiles while he stamps FOUND and folds the spare scarf length neatly into the box. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: MISSING WARMTH claim ticket; deep lost-property box; long soft scarf; FOUND stamp / scene effects: none / sounds: none


### Practical Effects (A4, `practical_effects`)

Menu description: Use a clearly fake horror effect at exactly the right moment. Hit and interrupt one enemy.  
Spoken line: "Practical effects. The string is part of the charm."  
Battle message: "The enemy saw the string and jumped anyway."  
Why it is them: A horror fan from the film-set world appreciates a good practical gag.  
The joke: The visible rigging makes the scare funnier without making it ineffective.

Animation beats:
1. TNB sets a tiny curtain beside the target's wind-up and leaves the pull-string conspicuously visible. (0.4 s)
2. He tugs once; a cardboard ghost springs sideways into the target with a bright padded startle. (0.7 s)
3. He gives the visible string an appreciative little nod. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: sideways cardboard ghost rig; conspicuous pull-string / scene effects: none / sounds: none


### Rush-Hour Racks (A5, `rush_hour_racks`)

Menu description: Navigate a crowded costume rack through an enemy row. Hit them and lower GRIT.  
Spoken line: "Rush-hour racks. Mind the sleeve gap."  
Battle message: "The rack is wider than its travel clearance."  
Why it is them: Costume logistics and transit announcements are both recognizably his world.  
The joke: An elegant maneuver is made difficult by one extremely long sleeve.

Animation beats:
1. TNB measures a rack's clearance through two floor arrows. (0.4 s)
2. One absurdly long sleeve catches the selected row in a soft sideways sweep. (0.7 s)
3. He folds the sleeve over the rail with the calm of somebody who expected this. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: oversized long-sleeve costume; rack-clearance arrows / scene effects: none / sounds: none


### Final Cut: Everybody Lives (A6, `everybody_lives`)

Menu description: Arrange soft costume stand-ins for the scary scene. Clear mental debuffs and give each friend one short-lived automatic revival.  
Spoken line: "Final cut. Everybody lives. Much better sequel potential."  
Battle message: "The originals remain safely in the scene."  
Why it is them: His wardrobe resourcefulness and affection for horror become a practical way to keep the whole cast safe.  
The joke: The grand dramatic danger lands on spare stuffed coats while the real people watch from one step back.

Animation beats:
1. A FINAL SCENE slate shows a threatening production diagram, not an actual enemy attack. (0.8 s)
2. TNB opens one nested costume form that unfolds into one soft stand-in for each active friend. (1 s)
3. He places the stand-ins on the danger marks and moves the actual friends one clear step behind them. (1.3 s)
4. A giant foam stage weight labeled DRAMA bounces harmlessly off the forms; alternate-ending protection icons settle around the real party. (1.3 s)
5. Every real friend waves from behind a stuffed coat while TNB writes ALL PRESENT on the slate. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: none / props: FINAL SCENE production diagram; nested soft costume stand-ins; DRAMA foam stage weight; ALL PRESENT slate / scene effects: stand-in demonstration and protection transfer / sounds: none


### Clay Pigeon, Literally (B1, `clay_pigeon`)

Menu description: Throw a tiny bird made of soft clay. Hit one enemy with extra crit chance.  
Spoken line: "Clay pigeon. Literally. I worked on that pun."  
Battle message: "The craftsmanship is better than the joke."  
Why it is them: Pottery and puns are both central to his humor.  
The joke: The carefully shaped pigeon is visibly unimpressed with its own name.

Animation beats:
1. TNB shapes one quick clay bird on his palm. (0.4 s)
2. The soft bird flaps exactly once before making a rounded bonk on the target. (0.7 s)
3. It reforms into an indignant little clay lump in his hand. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: soft clay pigeon with one-flap wing / scene effects: none / sounds: none


### Cone Six, Please (B2, `cone_six`)

Menu description: Set a careful warming glaze. Heal a friend, clear Amber-Stuck, and raise WARMTH and COOL.  
Spoken line: "Cone six, please. Cozy is a precise temperature."  
Battle message: "The warmth has been professionally considered."  
Why it is them: His pottery vocabulary makes careful warmth specific rather than generic.  
The joke: A tiny kiln cone bows as if accepting a very polite instruction.

Animation beats:
1. TNB sets a small cone indicator beside a warm protective glaze outline. (0.4 s)
2. The indicator bends; the glaze outline settles gently around the recipient and melts amber. (0.7 s)
3. The recipient smiles while the cone appears to take a tiny bow. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: bowing kiln-cone indicator; protective glaze outline / scene effects: none / sounds: none


### Curb Appeal (B3, `curb_appeal`)

Menu description: Carve along a very opinionated curb. Hit and delay an enemy row.  
Spoken line: "Curb appeal. Please appreciate the line."  
Battle message: "The line was beautiful and inconvenient."  
Why it is them: He longboards down steep streets and enjoys a low-stakes pun.  
The joke: The curb seems to admire the carve enough to follow it.

Animation beats:
1. TNB tilts his board toward a single painted curb line. (0.4 s)
2. The curb line peels up like a ribbon and sweeps once across the selected row. (0.7 s)
3. He rolls off calmly as the line lays itself perfectly flat again. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: peel-up curb line / scene effects: none / sounds: none


### Fix the Wobble (B4, `fix_wobble`)

Menu description: Find the little thing making a friend feel unsteady. Heal at least 20% HP and restore 2 VP.  
Spoken line: "Fix the wobble. Usually one small thing."  
Battle message: "The repair is smaller than the relief."  
Why it is them: He fixes things with a calm, practical eye.  
The joke: A tiny leveling wedge solves a stage-sized sense of instability.

Animation beats:
1. The recipient's small platform rocks on one visibly short corner. (0.4 s)
2. TNB slides a tiny clay wedge underneath; the whole platform settles with a warm click. (0.7 s)
3. The recipient smiles in relief while he pockets the spare wedge. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: wobbling support platform; tiny clay leveling wedge / scene effects: none / sounds: none


### Kiln Door Policy (B5, `kiln_door_policy`)

Menu description: Close the kiln door on a bad idea. Hit one enemy, break its ordinary shield, and interrupt its wind-up.  
Spoken line: "Kiln-door policy. Bad ideas cool off outside."  
Battle message: "The glaze stays. The shield does not."  
Why it is them: A potter's process has firm boundaries and useful heat.  
The joke: A terrifying shield comes out looking like a rejected test tile.

Animation beats:
1. TNB places a shield-shaped test tile in a small freestanding kiln doorway. (0.4 s)
2. The door closes with one warm flash; the target's shield cracks and wind-up icon drops. (0.7 s)
3. He removes the harmless rejected tile with tongs and labels it TRY AGAIN. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: shield-shaped test tile; TRY AGAIN glaze tag / scene effects: none / sounds: none


### Earth, Thrown by Hand (B6, `earth_thrown`)

Menu description: Throw a tiny world on the pottery wheel. Tip every enemy onto its saucer and thaw the party.  
Spoken line: "Well, well, well. Nice planet. Needs a handle."  
Battle message: "The world is handmade and still turning."  
Why it is them: His pottery transforms an ordinary useful object into an affectionate answer to a frozen world.  
The joke: The majestic planet is revealed to be a mug that needs one final practical adjustment.

Animation beats:
1. A tiny blue-grey world turns on TNB's pottery wheel under a quiet spotlight. (0.8 s)
2. He smooths its uneven surface while a frozen band around it begins to glow. (1 s)
3. He pulls one clay loop outward, revealing that the world is a handmade mug with a handle. (1.3 s)
4. The mug tips in one controlled motion, sliding the enemy-side toy silhouettes onto a padded saucer as warm light thaws the party. (1.3 s)
5. TNB sets the still-turning miniature safely on the wheel and wipes one clay thumbprint from its rim. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: wheel_hands / props: world-shaped clay mug; giant padded saucer; frozen glaze band / scene effects: planet-to-mug perspective reveal / sounds: none


### Nara

Forty pounds of play, selective taste, and an absolute refusal to abandon the pack.

**Path A: Goodest Girl.** Balls, motion, trades, and a deeply unreasonable emergency reserve.  
**Path B: Pack Heart.** Comfort, tiny puddles, and the enormous shape of feeling safe.

**Auto-Stamp:** `B1, A1, B2, B3, B4, B5, B6, A2, A3, A4, A5, A6`.  
**Trait integration:** Frantic retains +50% POW and +30% PEP while Tom is down. Food remains chicken jerky or homemade family food; comfort, non-food healing, and revives are not food items. Victory puddles stay tiny.

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Basic | Happy Hip Check | `happy_hip_check` | REWORKED (Jump Up) | 1 | 0 | 0 | Kinetic | POW | 1 | 1 | enemy | quick | `vp(1,self); HEART +5%; coins(legacy,t)` | No |
| Signature | PUPPY EYES | `puppy_eyes` | REWORKED (PUPPY EYES; animation only) | 1 | 0 | 2 | legacy | legacy | 0 | 0 | enemy | legacy | `legacy(PUPPY EYES): smit(t)` | Legacy only |
| A1 | Ball, Please | `ball_please` | REWORKED (Fetch) | 2 | 1 | 2 | Kinetic | POW | 1.5 | 1 | enemy | quick | `critAfterTom=1` | No |
| A2 | Five-Second Zoomies | `five_second_zoomies` | REWORKED (Zoomies) | 6 | 2 | 4 | Kinetic | POW | 1.6 | 4 | multi | quick | `st(pepup,.20,2,self)` | No |
| A3 | Trade You | `trade_you` | NEW | 10 | 2 | 3 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(amber,t)` | Yes, K30 |
| A4 | Keep-Away Rules | `keepaway_rules` | REWORKED (Tug of War) | 16 | 3 | 4 | Kinetic | POW | 1.6 | 1 | enemy | standard | `steal(t,self); interrupt(t)` | No |
| A5 | No Ball Left Behind | `no_ball_left` | NEW | 22 | 3 | 5 | Kinetic | POW | 1.5 | 1 | row | standard | `st(hooked,2,t)` | No |
| A6 | The Emergency Ball Reserve | `ball_reserve` | NEW | 26 / 40 | 4 | 9 | Kinetic | POW | 3.3 | 1 | all | heavy | `st(hooked,1,t)` | No |
| B1 | Paw on Your Shoe | `paw_on_shoe` | NEW | 2 | 1 | 2 | Cozy | WARMTH | 0 | 0 | ally | standard | `heal(.25,t); cure(mental,t)` | Yes, K30 |
| B2 | Shake It Off, Everyone | `shake_everyone` | REWORKED (Wet Dog Shake) | 6 | 2 | 4 | Splash | WARMTH | 0 | 0 | party | standard | `heal(.15,party); cure(one,party)` | Yes, K25 |
| B3 | Not Leaving | `not_leaving` | REWORKED (Lonely Howl) | 10 | 2 | 5 | Cozy | WARMTH | 0 | 0 | allyko | heavy | `revive(.25,t); if target(Tom): cure(all,Tom)` | Yes, K30 |
| B4 | Puddle Geography | `puddle_geography` | REWORKED (Happy Puddle) | 16 | 3 | 3 | Splash | POW | 1.3 | 1 | front | standard | `ct(+.20,t)` | No |
| B5 | Family Food Inspector | `food_inspector` | NEW | 22 | 3 | 5 | Cozy | WARMTH | 0 | 0 | party | standard | `heal(.18,party); cure(amber,party)` | Yes, K30 |
| B6 | Forty Pounds of Safe | `forty_pounds_safe` | NEW | 26 / 40 | 4 | 8 | Cozy | WARMTH | 0 | 0 | party | heavy | `st(guard,2,party); st(pepup,.30,2,party); cure(mental,party)` | Yes, K60 |


### Happy Hip Check (Basic, `happy_hip_check`)

Menu description: Bump one enemy with an enthusiastic hip. Recover 1 VP and use the existing coin-theft rule.  
Spoken line: "Woof!"  
Meaning (narration box, never spoken): She is very pleased to meet this obstacle.  
Battle message: "Nara brings her entire greeting."  
Why it is them: She is energetic and physically enthusiastic when greeting people.  
The joke: The greeting has more sideways momentum than the target expected.

Animation beats:
1. Nara plants her front paws and wags her whole rear half. (0.2 s)
2. One happy sideways hop nudges the target and shakes loose any eligible coins. (0.35 s)
3. She lands facing the wrong direction and immediately wags again. (0.35 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 0.9 s at 1x.

New assets: poses: none / props: sideways greeting motion arc / scene effects: none / sounds: none


### PUPPY EYES (Signature, `puppy_eyes`)

Menu description: Give one enemy the full look. A regular enemy is Smitten and skips its next turn.  
Spoken line: "Ruff?"  
Meaning (narration box, never spoken): Surely they could be friends instead.  
Battle message: "Nara has submitted a very persuasive expression."  
Why it is them: Her appeal is canine body language, not a human speech.  
The joke: The huge target tries to look away and fails immediately.

Animation beats:
1. Nara sits, tilts her head, and places both paws perfectly together. (0.4 s)
2. Her eye highlights grow into two simple bright squares as the target melts into a heart reaction. (0.7 s)
3. She gives one small hopeful tail wag; the target smiles helplessly. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: paired square eye highlights / scene effects: none / sounds: none


### Ball, Please (A1, `ball_please`)

Menu description: Bank a tennis ball into one enemy. Crit when Tom acted immediately before Nara.  
Spoken line: "Arf!"  
Meaning (narration box, never spoken): The important part is the next throw.  
Battle message: "Nara already knows where the ball will land."  
Why it is them: Fetch is her favorite activity and Tom's recent attention sharpens her excitement.  
The joke: She is waiting at the landing point before the target understands the bank shot.

Animation beats:
1. Nara drops a tennis ball against a tiny angled rebound board. (0.4 s)
2. One paw tap sends it into the target and directly toward her waiting mouth. (0.7 s)
3. She catches it, sits, and looks ready for the next turn immediately. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: small tennis-ball rebound board / scene effects: none / sounds: none


### Five-Second Zoomies (A2, `five_second_zoomies`)

Menu description: Visit four inconvenient places very quickly. Make four random hits and raise Nara's PEP by 20%.  
Spoken line: "Yip! Yip!"  
Meaning (narration box, never spoken): There were four places, so she went to all four.  
Battle message: "Nara has been everywhere on the map."  
Why it is them: Her energy is genuine and does not require a complicated motive.  
The joke: The route map updates a moment after she has already finished it.

Animation beats:
1. Four little checkpoint flags pop up around the enemy side. (0.4 s)
2. Nara streaks through four selected targets; all damage packets share the final flag's timing window. (0.7 s)
3. A delayed route line draws itself behind her while she pants happily at home. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: four zoomies checkpoint flags; delayed route line / scene effects: none / sounds: none


### Trade You (A3, `trade_you`)

Menu description: Offer a precious piece of chicken jerky. Heal a friend and clear Amber-Stuck.  
Spoken line: "Wuff?"  
Meaning (narration box, never spoken): This is her good food, and they can have some.  
Battle message: "Nara parts with the good stuff."  
Why it is them: Giving away one of the few foods she accepts is meaningful canine generosity.  
The joke: She checks twice that she really intends to surrender the jerky.

Animation beats:
1. Nara places a small packet labeled CHICKEN JERKY beside the recipient. (0.4 s)
2. She nudges out one piece; its warm glow loosens amber and restores the recipient. (0.7 s)
3. She almost noses it back, then sits proudly while the recipient smiles. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: CHICKEN JERKY packet / scene effects: none / sounds: none


### Keep-Away Rules (A4, `keepaway_rules`)

Menu description: Take a dangerous toy out of circulation. Hit, interrupt, and steal one eligible buff.  
Spoken line: "Grr-ruff!"  
Meaning (narration box, never spoken): They were playing too roughly with that.  
Battle message: "Nara does not approve of that game."  
Why it is them: Tugging and keep-away are familiar playful behaviors with useful battle consequences.  
The joke: The enemy's elaborate wind-up becomes a toy that cannot be trusted with the enemy.

Animation beats:
1. A knotted toy rope loops around the target's active wind-up or buff icon. (0.4 s)
2. Nara leans backward with determined paws; the icon pops free with a padded bonk. (0.7 s)
3. She sets the borrowed buff safely behind her and stands between it and the target. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: knotted keep-away rope / scene effects: none / sounds: none


### No Ball Left Behind (A5, `no_ball_left`)

Menu description: Check underneath the entire enemy row. Hit them and remove their room to dodge.  
Spoken line: "Arf! Wuff!"  
Meaning (narration box, never spoken): There is definitely a ball under there.  
Battle message: "Nara checks the place nobody else checked."  
Why it is them: A lost tennis ball is important enough to reorganize an entire room.  
The joke: The enemies discover they have been standing on the search area.

Animation beats:
1. Nara flattens herself to inspect a line beneath the selected row. (0.4 s)
2. She nudges a long under-sofa ball retriever across their feet, giving one broad padded sweep. (0.7 s)
3. The found ball rolls into view and she blocks every escape gap with focused paws. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: under-sofa ball retriever / scene effects: none / sounds: none


### The Emergency Ball Reserve (A6, `ball_reserve`)

Menu description: Open an imagined reserve of far too many tennis balls. Strike every enemy with one enormous rolling wave.  
Spoken line: "AWOO! Arf!"  
Meaning (narration box, never spoken): She was prepared for this exact ball emergency.  
Battle message: "One spare ball was apparently not enough."  
Why it is them: Her obsession with tennis balls supplies both the fantasy and the punchline.  
The joke: The ultimate secret resource is an absurd number of identical inexpensive toys.

Animation beats:
1. Nara discovers a single tennis ball sitting on a tiny trapdoor marked with a paw print. (0.8 s)
2. She lifts the ball and the door opens into a clearly dreamlike vault of stacked ball silhouettes. (1 s)
3. She places one paw on a red RELEASE button, pauses, and looks delighted by the responsibility. (1.3 s)
4. One readable rounded wave of balls rolls across the enemy side in a single broad impact. (1.3 s)
5. The dream vault vanishes; Nara carefully chooses the original ordinary ball from the pile. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: paw_button / props: dream ball-vault silhouette; paw-print trapdoor; RELEASE button; single ball-wave crest / scene effects: ball-vault dream reveal / sounds: none


### Paw on Your Shoe (B1, `paw_on_shoe`)

Menu description: Put one reassuring paw on a friend's shoe. Heal them and clear mental debuffs.  
Spoken line: "Huff. Ruff."  
Meaning (narration box, never spoken): They are not going anywhere alone.  
Battle message: "Nara makes sure the friend knows she is there."  
Why it is them: Her attachment expresses itself in small physical contact.  
The joke: She treats one firmly occupied shoe as a binding agreement to stay together.

Animation beats:
1. Nara looks at the recipient's worried thought icon. (0.4 s)
2. She places one paw squarely on their shoe; a warm paw-shaped pulse clears the thought. (0.7 s)
3. The recipient smiles and she leaves the paw in place for one extra beat. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: warm paw-shaped pulse / scene effects: none / sounds: none


### Shake It Off, Everyone (B2, `shake_everyone`)

Menu description: Give everybody a slightly damp reset. Heal a little and remove one debuff from each friend.  
Spoken line: "Brr-ruff!"  
Meaning (narration box, never spoken): Everyone looks better after a shake.  
Battle message: "The reset is more refreshing than requested."  
Why it is them: A wet-dog shake is a very recognizable sort of enthusiastic disruption.  
The joke: The party benefits while trying unsuccessfully to remain dry.

Animation beats:
1. Nara gives one warning shoulder twitch that nobody interprets in time. (0.4 s)
2. A single shake sends clean dotted droplets through the recipients and dislodges one debuff each. (0.7 s)
3. The recipients smile through the dampness while Nara looks exceptionally pleased. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: clean shake droplets with debuff hooks / scene effects: none / sounds: none


### Not Leaving (B3, `not_leaving`)

Menu description: Stay with a fallen friend until they rise at 25% HP. Tom also loses all debuffs.  
Spoken line: "Awoo... ruff!"  
Meaning (narration box, never spoken): She is staying right here until they get up.  
Battle message: "Nara has rejected being left behind."  
Why it is them: Her separation anxiety and attachment become determined, gentle rescue.  
The joke: Her completely practical solution is to refuse the premise that the friend is leaving.

Animation beats:
1. Nara plants both front paws beside the fallen recipient and nudges a limp hand once. (0.4 s)
2. She rests her nose against it until a tiny warm heartbeat appears and the friend revives. (0.7 s)
3. She leans her full weight into the upright friend, whose smile makes her tail start again. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: nose_press / props: nose-contact heartbeat / scene effects: none / sounds: none


### Puddle Geography (B4, `puddle_geography`)

Menu description: Make one tiny excited puddle. The front row takes a ridiculous detour and loses time.  
Spoken line: "Yip?"  
Meaning (narration box, never spoken): She does not understand why everyone took the long way.  
Battle message: "The puddle is tiny. The detour is not."  
Why it is them: She makes a tiny puddle when excited, not a dramatic flood.  
The joke: The front row treats three pixels of water like a major geographical feature.

Animation beats:
1. Nara gives a happy bounce and leaves a visibly tiny three-pixel puddle. (0.4 s)
2. The front row follows an absurd dotted detour around it and bumps a small detour sign. (0.7 s)
3. Nara looks back, puzzled by the amount of planning. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: three-pixel puddle; extravagant detour map; small detour sign / scene effects: none / sounds: none


### Family Food Inspector (B5, `food_inspector`)

Menu description: Approve a warm homemade meal for the family. Heal the party and clear Amber-Stuck.  
Spoken line: "Snff. Wuff!"  
Meaning (narration box, never spoken): Only the homemade one belongs at this table.  
Battle message: "The homemade option passes inspection."  
Why it is them: She is extremely picky and accepts homemade family food.  
The joke: The impressive catering display fails, while the plain family dish gets an immediate paw of approval.

Animation beats:
1. Two covered dishes appear: one fancy generic food prop and one labeled HOMEMADE. (0.4 s)
2. Nara sniffs, rejects the fancy dish, and stamps the homemade cover with a bright paw print. (0.7 s)
3. Warm steam reaches smiling recipients and Nara gets her own acceptable little portion. (0.5 s)

IMPACT: Beat 2. One High-Five sparkle window for the complete action. Total: 1.6 s at 1x.

New assets: poses: none / props: HOMEMADE dish cover; rejected fancy food prop; approval paw stamp / scene effects: none / sounds: none


### Forty Pounds of Safe (B6, `forty_pounds_safe`)

Menu description: Let one small dog cast an enormous safe shadow. Guard the party, raise PEP by 30%, and clear mental debuffs.  
Spoken line: "WOOF! Huff."  
Meaning (narration box, never spoken): Her people are here, and this is the safe side.  
Battle message: "The safe place weighs forty pounds."  
Why it is them: Her devotion makes the pack feel larger and safer than any single body.  
The joke: The enormous protective silhouette belongs to a dog who finishes by sitting on somebody's foot.

Animation beats:
1. Nara positions herself between the active party and an oversized threatening stage shadow. (0.8 s)
2. She looks back, counts her people with quick head turns, and plants all four paws. (1 s)
3. Her own shadow rises into a huge friendly dog outline with a clear open space beneath its chest. (1.3 s)
4. One solid paw-shaped light presses the threatening shadow flat while the party's protective icons settle inside the safe outline. (1.3 s)
5. The silhouette shrinks back to normal and Nara sits contentedly on the nearest friend's shoe as hearts rise. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5.2 s at 1x.

New assets: poses: four_paw_brace / props: friendly guardian-dog silhouette; flattened threat shadow; safe-space paw light / scene effects: shadow-sized shelter / sounds: none

## I3. Tombos and Family Finishes

### Shared combo contract

Every Tombo costs **0 VP**, spends the listed HEART before effects, and awards exactly **one Upgrade Mile** through the existing Tombo event. The initiator spends the current action; the partner keeps their scheduled turn. Both must be living, active, story-available, and otherwise permitted by the existing joint-action resolver. A wind-up, animation, or damage packet is not a second action. Default combo weight is **heavy**; Tom's already-earned instant-skill benefit does not make a HEART action free or consume itself on a Tombo. Confirm this distinction against the existing trait code.

Damage uses one packet at the listed multiplier. Its attacking stat is the arithmetic mean of the two participants' current indicated stats. For `hybrid`, average their POW values and separately average their WARMTH values, then select the greater average and its matching defense, choosing POW on a tie. This is a proposed combined-stat convention because D9 does not specify one. There is one High-Five window, not one per participant. Apply one chosen action's crit and status rules; do not add each participant's basic attack, Rose's path-skill extra sequence, or another move's animation. Positive trait events explicitly connected to participating in a joint action must be verified rather than guessed: in particular, whether Amy's guest participation counts for Pace Setter and whether Grace's does for Trending.

Tables put `stat=` in Effects because the requested combo table has no Stat column. A zero multiplier is intentional support or control of comparable encounter value, not an omitted attack. Non-damaging combos can mark a kind branch with `kindFoe=Kp`; it replaces ally-directed benefits exactly as in I2. Existing enemy-control effects and the Tombo's Mile event remain. Ordinary shields continue using their existing matching-element/Tombo rules; no generic Tombo or `shieldBreak` substitutes for the four exact Resentment identities.

**Family Finish participation:** initiate from an active, living listed participant. Every named participant must be story-available and not knocked out, but need not occupy an active battle slot. Reserve participants appear only as temporary visual guests; they do not gain turns, VP, damage exposure, status ticks, or new active slots. All party effects still affect only the current active party. Require an explicit all-participants eligibility check before enabling the command. This is the proposed realization of D9's three-or-more-person and all-eight Finishes, which cannot otherwise fit a four-slot encounter; verify support before implementation. Do not silently loosen Tombo active-party requirements to match this rule. Family Finishes cost 75% HEART, 0 VP, and one heavy action. They do not grant an Upgrade Mile merely because Tom appears; D7 only specifies DEFEND and Tombos.

Barrier effects are **story routing metadata**, not a general fifth shield-breaking effect. Resolve the matching barrier event at the impact beat even for a zero-damage Finish. During the final kindness phase, combos may only provide any party-side assistance the existing script permits. They contribute **zero** Julian signature-event progress and do not replace any of the eight required signature uses.


### Tom + Grace

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | One-Take Review | `tombo_grace_review` | Ch 1: Grace shows Tom her gold dumpling squishy | 25% | Sparkle | 2.1 | enemy | `stat=WARMTH; reveal(t); st(cooldown,2,t)` | Single-target WARMTH opening: reveal and reduce COOL |
| 2 | Trust the Spotter | `tombo_grace_spotter` | Ch 5: clearing the school before the Science & Dance Fair | 50% | Kinetic | 2.8 | row | `stat=POW; st(hooked,2,t); crit=.25` | Precision row offense: extra crit chance and dodge denial |
| 3 | No Props Needed | `tombo_grace_no_props` | Ch 19: Grace gives up her squishy to bring Tom back | 75% | Sparkle | 3.6 | enemy | `stat=WARMTH; st(closeup,2,t)` | One-target follow-up window: the next damaging action is doubled |


### One-Take Review (Tom + Grace, tier 1, `tombo_grace_review`)

Shared activity: Tom joins Grace in filming a solemnly overproduced review of her gold dumpling squishy.  
Menu description: Review the squishy together. Hit one enemy, reveal its weaknesses, and lower COOL.  
Battle message: "The review has identified a weak point."  
What Tom does: Holds the review card and tries to ask one practical question.  
What Grace does: Directs the review, demonstrates the squishy, and turns its gold reflection on the target.  
Spoken line, Tom: "One-take review. The production values are EXCESSIVE."  
Spoken line, Grace: "Ta-Ta, hold the review card higher."  
Animation beats:
1. A tiny review desk and a frame labeled ONE TAKE appear; Tom holds a comically detailed scorecard. (0.4 s)
2. Grace rotates the squishy under the frame, then rejects every score except SPARKLY. (0.7 s)
3. She and Tom tilt the scorecard together; one gold reflected rating stamp lands on the enemy and exposes its weak point. (0.9 s)
4. Grace gives a presenter smile while Tom discreetly throws away the unused pages. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: tiny review desk; SPARKLY scorecard; gold rating stamp / scene effects: none / sounds: none


Not a mashup because: They stage a new two-person review scene with a shared rating payoff; neither Unboxing nor Squishy Squeeze is performed.

### Trust the Spotter (Tom + Grace, tier 2, `tombo_grace_spotter`)

Shared activity: Tom spots Grace while she practices a deliberately overconfident gymnastics sequence.  
Menu description: Practice one perfectly supported landing. Strike a row with extra crit chance and stop its dodging.  
Battle message: "Trust makes the landing possible."  
What Tom does: Sets his feet, catches the planned landing, and redirects its momentum safely.  
What Grace does: Commits to the sequence and trusts that Tom will be exactly where she needs him.  
Spoken line, Tom: "Spotter ready. The confidence is CONSIDERABLE."  
Spoken line, Grace: "Trust the spotter. I already started."  
Animation beats:
1. Tom carefully checks one painted landing mark while Grace is visibly already in motion. (0.5 s)
2. Grace performs a compact aerial turn above his steady spotting hands, not a reused beam move. (0.8 s)
3. They complete one supported landing together; a precise line of floor-mark impacts crosses the chosen row. (1.3 s)
4. Grace holds up a perfect scorecard for Tom, who looks mildly surprised to be graded. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: partner_spot_catch / props: shared landing mark; spotter scorecard / scene effects: none / sounds: none


Not a mashup because: The central action is a trusting spotted landing with two coordinated bodies, not DEFEND followed by a solo gymnastics attack.

### No Props Needed (Tom + Grace, tier 3, `tombo_grace_no_props`)

Shared activity: Tom and Grace make a hand-shadow show without needing the treasured prop she gave away.  
Menu description: Make a show with empty hands. Strike one enemy and open it to one doubled follow-up action.  
Battle message: "The important part was never the prop."  
What Tom does: Shows his empty hands and joins hers to make the first shadow shape.  
What Grace does: Builds the shape with him, then chooses their joined hands over a perfect performance.  
Spoken line, Tom: "No props needed. You were ALWAYS the important part."  
Spoken line, Grace: "Ta-Ta, we can make the shape ourselves."  
Animation beats:
1. A small stage light illuminates Grace's visibly empty hands; there is no returned squishy. (0.6 s)
2. Tom opens his own empty hands beside hers and waits for her direction. (0.9 s)
3. Together their fingers make a funny dumpling-shaped shadow that wobbles into a much larger heart outline. (1.3 s)
4. The outline surrounds the selected enemy like an open performance frame, delivering one bright impact and exposing the next opening. (1.4 s)
5. They lower their hands without breaking contact; Grace smiles at Tom rather than the audience. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: joined_hand_shadow / props: hand-shadow screen; joined-hand dumpling silhouette; open heart frame / scene effects: shadow-shape morph / sounds: none


Not a mashup because: A shared hand-shadow performance is a new activity and new staging; the sacrificed squishy is neither cast as a skill nor restored.

### Tom + Rose

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Cloud Shape Safari | `tombo_rose_clouds` | Ch 1: Rose demands her first shoulder ride | 25% | Chatter | 0 | enemy | `stat=WARMTH; interrupt(t); ct(+.25,t); mount(3); kindFoe=K35` | Wind-up cancellation and Shoulder Ride setup |
| 2 | Blanket Customs | `tombo_rose_customs` | Ch 10: Rose stows away under Tom's business-class blanket | 50% | Cozy | 0 | party | `stat=WARMTH; st(evasive,2,party); cure(mental,Rose); mount(3); kindFoe=K50` | Party evasion rather than damage reduction |
| 3 | Left Ear, Right Here | `tombo_rose_headphones` | Ch 19: Rose listens to Tom's headphones in the dark to guide him home | 75% | Chatter | 0 | all | `stat=WARMTH; ct(+.40,t); interrupt(t); cure(mental,party); mount(3)` | Enemy-ribbon slowdown with party fear recovery |


### Cloud Shape Safari (Tom + Rose, tier 1, `tombo_rose_clouds`)

Shared activity: Tom carries Rose while they disagree very seriously about what a cloud looks like.  
Menu description: Look for shapes in the clouds. Cheer and interrupt one enemy, then keep Rose on Tom's shoulders.  
Battle message: "The cloud is definitely wearing Tom's hair."  
What Tom does: Walks slowly beneath one cloud and offers an overly literal interpretation.  
What Rose does: Points out the much more convincing pretend animal and invites the target to look.  
Spoken line, Tom: "Cloud safari. That is CLEARLY a spreadsheet."  
Spoken line, Rose: "Ta-Ta, it is a lamb wearing your head."  
Animation beats:
1. Tom and Rose look up from their new shoulder-ride position as one small cloud enters the stage. (0.4 s)
2. The cloud cycles once between a dull grid and a ridiculous lamb with Tom-shaped hair. (0.7 s)
3. Rose points decisively; the target abandons its wind-up to look, and a friendly cloud-heart lands beside its face. (0.9 s)
4. Tom accepts the verdict with a small nod while Rose remains safely mounted. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: grid/lamb cloud silhouette; Tom-hair cloud tuft / scene effects: none / sounds: none


Not a mashup because: Cloud-spotting, disagreement, and a shared visual punchline drive the entire scene; there is no DEFEND-hoist-and-Boop attack sequence.

### Blanket Customs (Tom + Rose, tier 2, `tombo_rose_customs`)

Shared activity: Tom and Rose play an absurdly quiet inspection game under an oversized airplane blanket.  
Menu description: Smuggle one very obvious giggle under a blanket. Give the party evasion and put Rose on Tom's shoulders.  
Battle message: "One completely ordinary blanket passenger."  
What Tom does: Maintains a formal passenger expression while pretending not to notice the moving blanket.  
What Rose does: Makes the blanket into a tiny walking passenger who repeatedly fails to look ordinary.  
Spoken line, Tom: "Blanket customs. One completely NORMAL passenger."  
Spoken line, Rose: "Ta-Ta, the blanket has no suspicious feet."  
Animation beats:
1. A simple business-class seat and blanket silhouette slide in, with Tom holding a small inspection card. (0.5 s)
2. Two unmistakable little feet tiptoe beneath the blanket while Tom solemnly checks NOT SUSPICIOUS. (0.8 s)
3. Rose pops the blanket into a broad harmless decoy silhouette; soft afterimages settle around the party. (1.3 s)
4. She peeks out laughing, then settles onto Tom's shoulders as the actual blanket folds away. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: none / props: business-class seat silhouette; NOT SUSPICIOUS inspection card; walking blanket decoy / scene effects: soft blanket afterimages / sounds: none


Not a mashup because: It is a new shared hiding-and-inspection game with decoy staging, not a sleep buff followed by a shoulder attack.

### Left Ear, Right Here (Tom + Rose, tier 3, `tombo_rose_headphones`)

Shared activity: Tom and Rose share the two sides of his headphones and follow one familiar sound toward each other.  
Menu description: Share one familiar sound in the dark. Delay all enemies, interrupt them, and clear mental debuffs from friends.  
Battle message: "Both sides of the sound have found home."  
What Tom does: Keeps one earcup in place and answers with a small reassuring tap.  
What Rose does: Listens, finds the other earcup in the dark, and closes the distance herself.  
Spoken line, Tom: "Left ear. Right here. I am RIGHT here."  
Spoken line, Rose: "Ta-Ta, I found your side of the sound."  
Animation beats:
1. The stage dims to two separate pools of headphone-shaped light, without removing either actor from battle. (0.6 s)
2. Rose listens to one earcup while Tom taps the other in a tiny steady pattern. (0.9 s)
3. Two visible sound arcs align; the darkness between them folds into a harmless strip of paper. (1.3 s)
4. The strip sweeps enemy wind-up icons back along the ribbon while a clear warm pulse lifts mental debuffs from the party. (1.4 s)
5. They share a relieved smile; Tom lifts Rose into the familiar safe shoulder position. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: none / props: paired headphone light pools; folded-darkness strip / scene effects: stereo arc alignment / sounds: none


Not a mashup because: The new scene is listening and locating one another through shared sound; it does not combine a solo howl, raspberry, or riding attack.

### Tom + Amy

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Two-Person Dismissal | `tombo_amy_dismissal` | Ch 5: Tom helps Amy defend her classroom | 25% | Sparkle | 0 | party | `stat=WARMTH; vp(2,party); cure(one,Amy); kindFoe=K35` | Party VP supply |
| 2 | Carry the Other Bag | `tombo_amy_other_bag` | Ch 10: Tom and Amy fight on the wing of the hijacked plane | 50% | Kinetic | 0 | party | `stat=POW; refill(Tom); refill(Amy); st(guard,1,party)` | Burst preparation: both participants refill VP |
| 3 | One Landing at a Time | `tombo_amy_landings` | Ch 17: scaling the 60-story Glass Tower side by side | 75% | Cozy | 0 | party | `stat=WARMTH; ct(-.55,party); st(pepup,2,party); cure(amber,party)` | Largest immediate party-ribbon advance |


### Two-Person Dismissal (Tom + Amy, tier 1, `tombo_amy_dismissal`)

Shared activity: Tom helps Amy finish the classroom clear-up so the day can actually end.  
Menu description: Finish the classroom together. Give the party 2 VP and remove one debuff from Amy.  
Battle message: "The teacher is allowed to leave, too."  
What Tom does: Stacks the last small chairs and refuses to add another task to the list.  
What Amy does: Closes the classroom checklist and lets the final bell mean finished.  
Spoken line, Tom: "Two-person dismissal. We are ACTUALLY done."  
Spoken line, Amy: "Dismissal includes the teacher. Apparently."  
Animation beats:
1. Amy's checklist unrolls toward a small pile of chairs while Tom quietly picks up the last two. (0.4 s)
2. They put the chairs and checklist away together; one empty checkbox keeps trying to escape. (0.7 s)
3. Amy closes the checklist on the final checkbox and Tom rings one little end-of-day bell; VP lights reach the recipients. (0.9 s)
4. Amy discovers both hands are free and looks pleasantly suspicious. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: escaping checklist box; last classroom chairs; end-of-day handbell / scene effects: none / sounds: none


Not a mashup because: Closing a classroom together is a complete shared action; no Pop Quiz, stopwatch attack, or generic simultaneous strike is used.

### Carry the Other Bag (Tom + Amy, tier 2, `tombo_amy_other_bag`)

Shared activity: Tom and Amy redistribute an impossibly awkward day's bags instead of insisting either person carry everything.  
Menu description: Share an awkward load. Refill Tom's and Amy's VP and briefly guard the party.  
Battle message: "Both handles are finally occupied."  
What Tom does: Takes one handle, tests its alarming weight, and stays beside Amy.  
What Amy does: Hands him the second handle and finally frees her balancing arm.  
Spoken line, Tom: "The other bag. Its weight is ENTIRELY reasonable."  
Spoken line, Amy: "Other bag, please. They are both heavy."  
Animation beats:
1. A simple wing-shaped platform establishes the chapter memory while two overloaded school-day bags lean toward Amy. (0.5 s)
2. Tom takes one bag; its handle stretches absurdly and Amy gives him an honest look. (0.8 s)
3. They lift together at matching height; two full VP gauges click into place and the level platform shelters the party. (1.3 s)
4. Amy uses her newly free hand to straighten Tom's sleeve while he pretends the bag is light. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: double_handle_lift / props: wing-shaped memory platform; stretching bag handles / scene effects: none / sounds: none


Not a mashup because: The entire scene is a two-person load-sharing lift with a balance payoff, not two running moves performed side by side.

### One Landing at a Time (Tom + Amy, tier 3, `tombo_amy_landings`)

Shared activity: Tom and Amy climb together by agreeing to reach the next landing, not by demanding sixty floors at once.  
Menu description: Reach one landing together, then the next. Advance the party's turns, raise PEP, and clear Amber-Stuck.  
Battle message: "The next step is a step they can share."  
What Tom does: Marks the next reachable landing and matches Amy's pace.  
What Amy does: Runs the manageable segment, then waits for the shared next step.  
Spoken line, Tom: "One landing. Then another. Sixty is just ADMIN."  
Spoken line, Amy: "One landing at a time. Stay beside me."  
Animation beats:
1. A tall 60-floor tower diagram threatens to fill the portrait stage; both look up. (0.6 s)
2. Tom folds the diagram until only the next landing is visible. (0.9 s)
3. Amy climbs to it, pauses with a hand extended, and Tom joins her; the folded map advances one clear section. (1.3 s)
4. Their shared footsteps become warm forward arrows under every active ally's ribbon portrait, thawing amber as they advance. (1.4 s)
5. The map briefly reveals the top reached through many small folds; both take the same unhurried breath. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: none / props: folding sixty-floor diagram; shared landing arrows / scene effects: folded-climb progression / sounds: none


Not a mashup because: Folding an overwhelming climb into mutually supported landings is the central new activity, not Hill Repeats plus a gadget move.

### Tom + Deedee

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Clean As You Go | `tombo_deedee_clean` | Ch 1: recovering Deedee's stolen pie tin | 25% | Splash | 0 | party | `stat=WARMTH; heal(.25,party); cure(one,party); kindFoe=K35` | Immediate group recovery plus one-debuff cleansing |
| 2 | Recipe in the Margins | `tombo_deedee_recipe` | Ch 7: exploring the vault beneath the library together; party-list conflict flagged in I7 | 50% | Cozy | 0 | party | `stat=WARMTH; st(tuckedin,3,party); crust(2); tag=baking; kindFoe=K50` | Sustained recovery with banked free snacks |
| 3 | The Door Stays Open | `tombo_deedee_open_door` | Ch 19: thawing Deedee from stone with the Jefferson Park feast | 75% | Cozy | 0 | party | `stat=WARMTH; heal(.60,party); revive(.35,party); cure(all,party); crust(3); tag=baking; kindFoe=K65` | Full recovery including fallen active allies |


### Clean As You Go (Tom + Deedee, tier 1, `tombo_deedee_clean`)

Shared activity: Tom and Deedee wash and dry the recovered pie tin together before starting anything else.  
Menu description: Wash and dry together. Heal the party and remove one debuff from each friend.  
Battle message: "The family is ready for a fresh start."  
What Tom does: Dries and stacks, trying to keep pace with the next clean dish.  
What Deedee does: Washes briskly and trusts Tom to catch the increasingly ambitious drying queue.  
Spoken line, Tom: "Clean as you go. The queue is GROWING."  
Spoken line, Deedee: "Clean as you go. Then we can begin."  
Animation beats:
1. Deedee dips the recovered tin into a little washing basin while Tom readies a drying towel. (0.4 s)
2. She passes one shining tin to him; its reflection produces a comic procession of imagined clean plates. (0.7 s)
3. They catch and stack the final plate together; one clean water ring clears a debuff and restores the recipients. (0.9 s)
4. The plates vanish back into the single tin, and both admire a job properly finished. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: pie-tin washing basin; reflected plate procession; drying stack / scene effects: none / sounds: none


Not a mashup because: The shared wash-dry-catch rhythm is the whole new scene; no Dutch Oven, crisp heal, or group-hug animation is performed.

### Recipe in the Margins (Tom + Deedee, tier 2, `tombo_deedee_recipe`)

Shared activity: Tom writes down Deedee's baking instructions while they test a small batch together.  
Menu description: Write down the recipe while testing a little batch. Tuck the party in and prepare two Warm Crusts.  
Battle message: "The secret ingredient has several handwritten notes."  
What Tom does: Tries to record an exact measurement and keeps enlarging the margin.  
What Deedee does: Shows him what enough actually looks like, then checks their little test bake.  
Spoken line, Tom: "Recipe in the margins. Define ENOUGH."  
Spoken line, Deedee: "Enough is enough. Leave room for my notes."  
Animation beats:
1. A blank recipe card lies between them on a small vault reading stand. (0.5 s)
2. Tom draws a precise measuring line; Deedee adds a much larger handwritten UNTIL RIGHT beside it. (0.8 s)
3. They fold the completed card into a tiny test-oven outline; warm baked corners rise into two crust tokens and a tucked-in glow. (1.3 s)
4. Tom unfolds the card to find one final note: MAKE MORE THAN YOU THINK. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: none / props: expanding-margin recipe card; vault reading stand; tiny recipe test-oven outline / scene effects: none / sounds: none


Not a mashup because: Co-writing and testing a family recipe creates one new activity; it is not Tom's bread attack followed by Deedee's existing meal.

### The Door Stays Open (Tom + Deedee, tier 3, `tombo_deedee_open_door`)

Shared activity: Tom and Deedee welcome the neighborhood in and keep passing a homemade meal through an open doorway.  
Menu description: Keep the door open for a homemade feast. Restore the party, revive fallen friends, and fill the crust tray.  
Battle message: "The warmth goes both ways through the doorway."  
What Tom does: Holds the door and makes sure every arriving dish has a place to land.  
What Deedee does: Receives the dishes, finishes a fresh tray, and sends generous portions back through the same doorway.  
Spoken line, Tom: "The door stays open. We have PLENTY of room."  
Spoken line, Deedee: "Come in. The good tray is just ready."  
Animation beats:
1. A cold closed doorway fills the stage, with Tom and Deedee on the warm side of its threshold. (0.6 s)
2. A single knock arrives; Tom opens the door and keeps his foot gently against it. (0.9 s)
3. Hands pass dishes through in a readable relay; optional tiny silhouettes represent Miss Odette, Dona Carmen, and Mr. Washington without extra battle actors. (1.3 s)
4. Deedee slides a fresh homemade tray through the relay; warm portions reach the living party, fallen allies revive, and three crusts settle on the tray. (1.4 s)
5. A dish returns carrying a little THANK YOU card; they leave the door visibly open as hearts drift toward both sides. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: none / props: open-door relay frame; homemade serving dishes; THANK YOU card; fresh baking tray / scene effects: threshold warmth relay / sounds: none


Not a mashup because: An open-door neighborhood serving relay is a single new relationship scene, not an oven attack and a separate Sunday Dinner cast.

### Tom + Boppy

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | You Hold the Net | `tombo_boppy_net` | Ch 3: fishing for Old Iron-Gill together at Cattail Pier | 25% | Splash | 2.2 | enemy | `stat=POW; row(front,t); st(hooked,2,t)` | Formation control: bring a target forward and prevent evasion |
| 2 | Untangle the Line | `tombo_boppy_untangle` | Ch 14: redeeming Boppy | 50% | Splash | 2.8 | enemy | `stat=POW; shieldBreak(t); steal(t,Boppy)` | Ordinary-shield removal plus theft of one enemy buff |
| 3 | One Tiny Taste | `tombo_boppy_taste` | Ch 19: Boppy wakes from stone sneezing at the pepper broth | 75% | Cozy | 3.5 | row | `stat=POW; st(gritdown,.35,3,t); each t: steal(t,Boppy); burn(1); tag=pepper` | Physical row breach: strong GRIT reduction and one buff removed per target |


### You Hold the Net (Tom + Boppy, tier 1, `tombo_boppy_net`)

Shared activity: Boppy teaches Tom how to hold the landing net without falling into the same water as the catch.  
Menu description: Learn the proper way to hold a landing net. Hit one enemy, pull it forward when possible, and stop its dodging.  
Battle message: "Tom has caught the correct end of the lesson."  
What Tom does: Holds the net with total confidence until its orientation becomes relevant.  
What Boppy does: Turns the net the right way, steadies Tom, and guides the shared scoop.  
Spoken line, Tom: "I have the net. Its orientation is NEGOTIABLE."  
Spoken line, Boppy: "You hold the net. The other way up."  
Animation beats:
1. A short pier edge appears; Tom holds the landing net confidently upside down. (0.4 s)
2. Boppy calmly rotates it without letting go of Tom's sleeve. (0.7 s)
3. They make one joint scoop beneath the chosen enemy, giving a soft water bonk and drawing it toward a legal front-row space. (0.9 s)
4. Tom checks the now-correct net while Boppy allows himself a very small grin. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: shared_net_scoop / props: upside-down landing net; short pier edge / scene effects: none / sounds: none


Not a mashup because: The comedy and result come from a shared landing-net lesson, not a cast-line skill followed by DEFEND or GRUMBLE.

### Untangle the Line (Tom + Boppy, tier 2, `tombo_boppy_untangle`)

Shared activity: Tom and Boppy patiently undo a fishing-line knot together instead of pulling against each other.  
Menu description: Work the knot loose together. Strike one enemy, break an ordinary shield, and take one eligible buff.  
Battle message: "Nobody needed to pull harder."  
What Tom does: Holds the loop open and waits for the step his dad points out.  
What Boppy does: Loosens one careful section and accepts help with the other end.  
Spoken line, Tom: "Untangle the line. Pulling harder was NOT the answer."  
Spoken line, Boppy: "Hold that loop. We can work this out."  
Animation beats:
1. A large fishing-line knot spans the space between them, mirroring the selected enemy's ordinary shield. (0.5 s)
2. Both start to pull, stop, and look at the knot rather than blaming each other. (0.8 s)
3. Tom holds one loop while Boppy releases the other; the knot pops open into a water-ring impact that breaks the shield and releases a buff. (1.3 s)
4. They reel the now-straight line onto one spool at an intentionally comfortable pace. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: none / props: shield-shaped fishing knot; shared untangled spool / scene effects: single knot-unravel path / sounds: none


Not a mashup because: A cooperative knot-solving scene supplies the mechanical unraveling; neither person performs an existing individual move.

### One Tiny Taste (Tom + Boppy, tier 3, `tombo_boppy_taste`)

Shared activity: Tom and Boppy taste a minuscule amount of pepper broth together and try not to admit how warm it is.  
Menu description: Try a tiny shared taste. Strike a row, lower its GRIT, and remove one eligible buff per enemy.  
Battle message: "The tiny taste has made a large impression."  
What Tom does: Measures a comically small spoonful and keeps his face perfectly professional.  
What Boppy does: Insists that the portion is barely worth mentioning, then loses the argument to a sneeze.  
Spoken line, Tom: "One tiny taste. That is a SIGNIFICANT pepper."  
Spoken line, Boppy: "Tiny taste. My stomach requested a smaller tiny."  
Animation beats:
1. Tom produces a spoon so small it needs a large pointer arrow to be visible. (0.6 s)
2. They each sample the broth and adopt identical expressions of deeply suspicious calm. (0.9 s)
3. Boppy's nose twitches; Tom offers a napkin exactly one beat too late. (1.3 s)
4. One broad pepper-shaped sneeze-ring sweeps the chosen row, peeling off armor stickers and eligible buff icons. (1.4 s)
5. They quietly set both spoons down and simultaneously choose the plain water. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: none / props: almost invisible tasting spoon; pointer arrow; late napkin; armor stickers / scene effects: none / sounds: none


Not a mashup because: The two-person tasting dare, matched restraint, and late napkin are a new scene; it is not Pepper Breath or a reused Counter-Roar cinematic.

### Tom + TNB

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Couch Commentary | `tombo_tnb_commentary` | Ch 2: clearing the smog from 2nd Ave together | 25% | Sparkle | 0 | party | `stat=WARMTH; st(gritup,2,party); st(coolup,2,party); kindFoe=K35` | Broad defensive-stat preparation |
| 2 | Transfer Together | `tombo_tnb_transfer` | Ch 6: riding the Metro tunnels | 50% | Cozy | 0 | party | `stat=WARMTH; cure(all,party); ct(-.25,Tom); ct(-.25,TNB); kindFoe=K50` | Full debuff cleansing with a two-person turn advance |
| 3 | One Cup, Two Coasts | `tombo_tnb_two_coasts` | Ch 19: TNB places his first hand-thrown cup on the altar to restore Tom | 75% | Sparkle | 3.5 | enemy | `stat=WARMTH; st(guard,2,party); cure(amber,party); barrier=distance` | Guaranteed party shelter and the Distance Barrier answer |


### Couch Commentary (Tom + TNB, tier 1, `tombo_tnb_commentary`)

Shared activity: Tom and TNB watch a horror scene together and calmly identify the bad decisions before they happen.  
Menu description: Watch the scary part together and notice the cardboard. Raise the party's GRIT and COOL.  
Battle message: "The door is less frightening from this side."  
What Tom does: Points out the obviously unsafe door and maintains that he is not concerned.  
What TNB does: Pauses on the visible prop hinge and explains the very reassuring cheap effect.  
Spoken line, Tom: "Couch commentary. That door is a TERRIBLE decision."  
Spoken line, TNB: "Well, well, well. The monster is mostly plywood."  
Animation beats:
1. A small couch and toy horror screen appear with a suspicious door on the screen. (0.4 s)
2. Tom points at the door while TNB points at the much more obvious cardboard hinge. (0.7 s)
3. They turn the screen slightly, revealing its harmless plywood back; sturdy frame-shaped defense icons reach the party. (0.9 s)
4. TNB gives Tom a quick kiss and a small heart while Tom continues to inspect the hinge. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: small couch; toy horror screen; exposed cardboard hinge / scene effects: none / sounds: none


Not a mashup because: Shared commentary that reveals a cheap movie prop is the entire activity; no pottery attack, baking move, or Jump Scare is cast.

### Transfer Together (Tom + TNB, tier 2, `tombo_tnb_transfer`)

Shared activity: TNB guides Tom through a confusing transit transfer while keeping one hand available for him.  
Menu description: Find the right transit connection together. Clear the party's debuffs and advance Tom's and TNB's turns.  
Battle message: "Nobody gets left on the other platform."  
What Tom does: Tries to reconcile a folded map, then trusts the person who knows the route.  
What TNB does: Finds the correct connection and waits at the gap rather than going ahead alone.  
Spoken line, Tom: "Transfer together. Your map is the CORRECT one."  
Spoken line, TNB: "This way. Same trip, better connection."  
Animation beats:
1. Tom opens a transit map that accidentally covers his entire face. (0.5 s)
2. TNB folds it to one clear connecting line and offers his free hand. (0.8 s)
3. They cross a small moving platform gap together; stuck debuff icons remain on the abandoned platform as a warm connection line reaches the party. (1.3 s)
4. Their two ribbon portraits advance and TNB adds a little heart to the map's destination. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: none / props: face-covering transit map; two-platform transfer gap; destination heart / scene effects: abandoned-debuff platform / sounds: none


Not a mashup because: Finding and crossing one transfer together is a new joint scene, not the old Next Stop animation with another move attached.

### One Cup, Two Coasts (Tom + TNB, tier 3, `tombo_tnb_two_coasts`)

Shared activity: Tom and TNB share the ordinary ritual of a warm drink even when the world insists on putting two coasts between them.  
Menu description: Share a warm drink across the distance. Strike one enemy, guard the party, and thaw Amber-Stuck.  
Battle message: "Two coasts. One shared place."  
What Tom does: Pours the drink and slides his hand toward the place where TNB's hand belongs.  
What TNB does: Steadies an ordinary cup, then takes Tom's hand instead of holding the object more tightly.  
Spoken line, Tom: "Two coasts. One place to COME HOME."  
Spoken line, TNB: "One cup. Plenty of room for us."  
Animation beats:
1. Two separated coast-shaped stage platforms appear, with one person on each and a black gap between them. (0.6 s)
2. The sacrificed first cup appears only as a translucent remembered outline above a new ordinary cup, never as a restored inventory object. (0.9 s)
3. Tom pours and TNB steadies; the warm steam traces one continuous bridge across the gap while their hands reach. (1.3 s)
4. Their hands meet over the cup; the steam bridge splits the Distance barrier image and forms a solid warm roof above the party. (1.4 s)
5. The platforms settle into one small shared tabletop; TNB gives Tom a kiss and a heart as the cup outline fades. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: hands_over_cup / props: two coast-shaped platforms; remembered first-cup outline; ordinary shared cup; steam bridge / scene effects: two-coasts-to-one-table transition / sounds: none


Not a mashup because: Sharing a drink and choosing each other across a visible gap is the new central activity; there is no kiln-plus-oven combination.

Resentment Barrier: **Distance**. The matching story event is emitted only at the marked impact.

### Tom + Nara

| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Which Hand? | `tombo_nara_which_hand` | Ch 2: Nara greets Tom on the 2nd Ave porch | 25% | Kinetic | 2.2 | enemy | `stat=POW; take(t)` | Held-item retrieval rather than buff theft |
| 2 | Walkies Detour | `tombo_nara_detour` | Ch 6: the underground tunnels | 50% | Kinetic | 3 | enemy | `stat=POW; interrupt(t); ct(+.20,t)` | Single-threat wind-up interruption with a strong hit |
| 3 | I Know You're There | `tombo_nara_there` | Ch 19: Nara tracks Tom's scent when the world forgets him | 75% | Sparkle | 4 | enemy | `stat=hybrid; pre: st(hooked,2,t); crit=1; reveal(t); cure(mental,party); barrier=fear` | Anti-evasion critical strike and the Fear Barrier answer |


### Which Hand? (Tom + Nara, tier 1, `tombo_nara_which_hand`)

Shared activity: Tom plays the hidden-ball guessing game and Nara notices a much more interesting concealed object nearby.  
Menu description: Play the hidden-ball guessing game. Strike one enemy and recover its held item when it has one.  
Battle message: "Nara has chosen the unadvertised third option."  
What Tom does: Presents two closed hands and assumes the rules of the game are obvious.  
What Nara does: Checks the hands, then finds the target's held item or the ball when there is no item.  
Spoken line, Tom: "Which hand? That was NOT an offered option."  
Spoken line, Nara: "Ruff! Arf!"  
Meaning (narration box, never spoken): The interesting thing was not in either hand.

Animation beats:
1. Tom crouches on a simple porch mark with two closed hands and an exaggeratedly neutral expression. (0.4 s)
2. Nara sniffs each hand once, then looks pointedly toward the chosen enemy. (0.7 s)
3. She noses the target with one padded bump and retrieves its held item if eligible; otherwise she reveals Tom's dropped tennis ball. (0.9 s)
4. Tom opens both empty hands, conceding the result, and Nara wags at the solved problem. (0.5 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 2.5 s at 1x.

New assets: poses: none / props: two-hand guessing markers; dropped-ball reveal / scene effects: none / sounds: none


Not a mashup because: A two-person guessing game is redirected by Nara's nose; no bread projectile or ordinary Fetch animation is used.

### Walkies Detour (Tom + Nara, tier 2, `tombo_nara_detour`)

Shared activity: Tom lets Nara choose the walking route through a tunnel and discovers she has gone around the dangerous part.  
Menu description: Follow Nara around the dangerous part. Hit, interrupt, and delay one enemy.  
Battle message: "The better route was on the loose end of the lead."  
What Tom does: Keeps hold of the loose lead, ducks carefully, and follows the unexpected route.  
What Nara does: Chooses a safe little side loop that leaves the enemy facing entirely the wrong way.  
Spoken line, Tom: "Walkies detour. I am following the EXPERT."  
Spoken line, Nara: "Yip! Ruff! Yip!"  
Animation beats:
1. One tunnel corner and a clear enemy wind-up cone appear; Tom unfolds a small walking-route card. (0.5 s)
2. Nara ignores the drawn route and takes a loose-lead side loop while Tom ducks after her. (0.8 s)
3. They emerge behind the target's wind-up; Tom closes a harmless padded route gate and Nara bumps its latch, canceling the attack with one impact. (1.3 s)
4. Tom turns the route card upside down, decides it looks better, and pockets it. (0.9 s)

IMPACT: Beat 3. One High-Five sparkle window for the complete action. Total: 3.5 s at 1x.

New assets: poses: none / props: tunnel corner; wind-up route cone; padded walking gate; loose lead / scene effects: none / sounds: none


Not a mashup because: Walking a dog through an unexpected safe route supplies the entire coordinated action, rather than a thrown object followed by a solo chase.

### I Know You're There (Tom + Nara, tier 3, `tombo_nara_there`)

Shared activity: Tom lets Nara find him in a remembered dark room where sight is unreliable but their familiar scent is not.  
Menu description: Let Nara find the familiar hand in the dark. Pin an elusive target, aim for a critical hit, and clear friends' mental debuffs.  
Battle message: "Nara knows exactly who is here."  
What Tom does: Stays in place, offers his hand, and trusts that she will reach it.  
What Nara does: Ignores misleading shadow shapes and follows the familiar scent all the way to him.  
Spoken line, Tom: "You found me. Of COURSE you found me."  
Spoken line, Nara: "Awoo! Wuff! Wuff!"  
Meaning (narration box, never spoken): She knows this person even when the room pretends otherwise.

Animation beats:
1. A clear theatrical darkness surrounds the still-present Tom; misleading empty coat shadows appear around the chosen target. (0.6 s)
2. Nara lowers her nose while one small familiar scent curl comes from Tom's offered hand. (0.9 s)
3. She passes the false shadows without hesitation and presses her nose firmly into his palm. (1.3 s)
4. The contact lights a continuous pawprint trail through the Fear barrier image; one bright impact pins the selected threat and clears the party's frightened thought icons. (1.4 s)
5. Tom crouches into her greeting; the room is ordinary again and her tail becomes a delighted blur. (0.8 s)

IMPACT: Beat 4. One High-Five sparkle window for the complete action. Total: 5 s at 1x.

New assets: poses: none / props: false empty-coat shadows; familiar scent curl; continuous warm pawprint trail / scene effects: false-shadow-to-ordinary-room reveal / sounds: none


Not a mashup because: Trusting recognition through scent is a new shared scene, not Fetch plus a howl or a resurrection shortcut; both participants were present throughout.

Resentment Barrier: **Fear**. The matching story event is emitted only at the marked impact.

### Family Finishes

| Name | Key | Participants | Unlock beat | HEART | Element | Mult | Target | Effects | Barrier |
|---|---|---|---|---|---|---|---|---|---|
| Four Corners, One Sheet | `family_four_corners` | Tom + TNB + Grace + Rose | Ch 11: the two sides of the family finally meet | 75% | Sparkle | 0 | all | `warm(45,t); goof(t); st(guard,1,party)` | None |
| No One Carries It All | `family_shared_load` | Amy + Grace + Rose | Ch 12: unlock the mother-and-daughters Finish; usable without Tom | 75% | Cozy | 0 | party | `refill(party); cure(all,party); ct(-.25,Amy); barrier=exhaustion` | Exhaustion |
| Pencil Us In | `family_pencil_us_in` | Deedee + Boppy + Tom | Ch 15: the eight-seat dinner-table chapter | 75% | Cozy | 0 | party | `heal(.35,party); st(tuckedin,3,party); cure(amber,party); barrier=aging` | Aging |
| The Extra Place | `family_extra_place` | Tom + Grace + Rose + Amy + Deedee + Boppy + TNB + Nara | Ch 20: all eight are reunited and the final Finish unlocks | 75% | Cozy | 0 | all | `warm(60,regular enemies); heal(.40,party); cure(all,party); vp(3,party); barrier=none` | None |


### Four Corners, One Sheet (Family Finish, `family_four_corners`)

Participants: Tom + TNB + Grace + Rose.  
Shared activity: Four people attempt to fold one fitted sheet and accidentally turn the task into a cooperative game.  
Menu description: Fold a fitted sheet together. Cheer and Goof enemies while briefly guarding friends.  
Battle message: "The sheet has accepted a reasonable compromise."  
Distinct role: Non-damaging crowd kindness with a short party safety window

What Tom does: Tries to identify the correct starting corner from a diagram.  
What TNB does: Finds the actual fabric corners and quietly untwists the problem.  
What Grace does: Assigns a corner to each person and conducts the count.  
What Rose does: Insists her corner is the most important and gives it an enthusiastic extra shake.  

Spoken line, Tom: "Four corners. The geometry is NOT cooperating."  
Spoken line, TNB: "One sheet. Let the corners meet."  
Spoken line, Grace: "My count. Nobody folds without my count."  
Spoken line, Rose: "My corner is doing the fancy part!"  

Animation beats:
1. An enormous fitted sheet lies in a lumpy heap while Tom unfolds an unnecessarily precise diagram. (0.8 s)
2. TNB extracts its four true corners; Grace points each person into a clear position. (1 s)
3. They raise the sheet together, and Rose's extra shake makes the center form a ridiculous smiling face. (1.2 s)
4. The enemies lean forward, curious rather than threatened, while the four carefully bring the corners together. (1.2 s)
5. The sheet pops into a tiny neat cube with one broad happy puff across the enemies and a protective soft outline around the party. (1.5 s)
6. Rose puts a GOOD ENOUGH sticker on the cube; everyone accepts the verdict with visible smiles. (0.8 s)

IMPACT: Beat 5. One High-Five sparkle window for the complete action. Total: 6.5 s at 1x.

New assets: poses: four_person_corner_hold / props: four-corner fitted sheet; overprecise folding diagram; GOOD ENOUGH sticker; folded sheet cube / scene effects: sheet-face-to-cube fold / sounds: none


Not a mashup because: All four manipulate one shared object through a new physical problem; none fires a signature or path move in sequence.

Resentment Barrier: **None**.  
Barrier behavior: no Resentment flag is changed, and no finale signature use is substituted.

### No One Carries It All (Family Finish, `family_shared_load`)

Participants: Amy + Grace + Rose.  
Shared activity: Amy and the girls sort the end-of-day load into small shared jobs instead of leaving all of it in Amy's hands.  
Menu description: Share small jobs with Amy. Refill the active party's VP, clear debuffs, and advance Amy's turn.  
Battle message: "Amy has one free hand."  
Distinct role: Full active-party VP reset and the Exhaustion Barrier answer

What Amy does: Sets the bag down, accepts age-appropriate help, and finally frees one hand.  
What Grace does: Sorts a small stack of classroom cards into a tidy light folder.  
What Rose does: Takes responsibility for one pencil and treats it as an essential assignment.  

Spoken line, Amy: "Three small jobs. Already lighter."  
Spoken line, Grace: "I organized the helping, obviously."  
Spoken line, Rose: "This pencil is the important bit!"  

Animation beats:
1. Amy stands under a looming bag-shaped EXHAUSTION silhouette, with both hands occupied. (0.8 s)
2. Grace makes three simple task pictures, not three equal adult-sized burdens. (1 s)
3. Rose chooses the pencil picture and lifts one very ordinary pencil with ceremonial care. (1.2 s)
4. Amy sets down the bag; Grace closes the small folder, and Amy discovers one hand is free. (1.2 s)
5. Three small task lights pull the bag-shaped barrier apart; full VP pips and clean-status light settle over the active party. (1.5 s)
6. Amy sits for one happy breath while the girls show their completed little jobs; nobody summons Tom. (0.8 s)

IMPACT: Beat 5. One High-Five sparkle window for the complete action. Total: 6.5 s at 1x.

New assets: poses: none / props: bag-shaped EXHAUSTION wall; three pictured task cards; small folder; very important pencil / scene effects: shared-task load separation / sounds: none


Not a mashup because: The shared activity is accepting and dividing manageable work, not PEP TALK followed by DANCE and SILLY.

Resentment Barrier: **Exhaustion**.  
How the animation shows it: Amy has a visibly free hand while three small task lights split the impossible bag-shaped wall.

Tom independence: Tom is not a required participant, target, guest, or state dependency.

### Pencil Us In (Family Finish, `family_pencil_us_in`)

Participants: Deedee + Boppy + Tom.  
Shared activity: Tom and his parents make an actual plan for the next family visit, leaving room for time to keep moving.  
Menu description: Make a real plan for the next visit. Heal, tuck in, and thaw the active party.  
Battle message: "There is room for another day."  
Distinct role: Long-fight recovery and the Aging Barrier answer

What Deedee does: Turns the page forward and immediately plans what she will bring.  
What Boppy does: Adds a walking-speed note and helps keep the new page open instead of returning to the old one.  
What Tom does: Holds the calendar steady and writes a real next-visit appointment rather than someday.  

Spoken line, Deedee: "Pencil us in. I will bring something."  
Spoken line, Boppy: "Next visit, we walk at my speed."  
Spoken line, Tom: "Next visit. On the calendar. Not SOMEDAY."  

Animation beats:
1. A large calendar is trapped beneath a rigid glass page labeled KEEP THIS DAY. (0.8 s)
2. Tom supports its spine while Deedee lifts the edge of the next blank page. (1 s)
3. Boppy briefly touches his old 1970 story card, then deliberately pockets it and takes the forward page corner instead. (1.2 s)
4. All three write NEXT VISIT on the new page; Boppy adds a tiny comfortable-pace footprint beside it. (1.2 s)
5. The calendar turns forward through the Aging barrier glass without making either parent younger; warm date squares heal and tuck in the party. (1.5 s)
6. The three remain their present ages, smiling over an open calendar with more unwritten pages. (0.8 s)

IMPACT: Beat 5. One High-Five sparkle window for the complete action. Total: 6.5 s at 1x.

New assets: poses: none / props: glass-covered calendar; NEXT VISIT pencil entry; comfortable-pace footprint; pocketed 1970 card / scene effects: forward-calendar glass split / sounds: none


Not a mashup because: Planning a future visit is a new shared activity; it is not a replay of the 1970 race, a group hug, or a bigger dinner spell.

Resentment Barrier: **Aging**.  
How the animation shows it: The calendar moves forward and the parents stay visibly their present ages as the glass breaks.

### The Extra Place (Family Finish, `family_extra_place`)

Participants: Tom + Grace + Rose + Amy + Deedee + Boppy + TNB + Nara.  
Shared activity: Everyone helps set one extra place for somebody who is not yet part of the gathering.  
Menu description: Set one extra place. Invite regular enemies to cheer up while healing and refreshing the active party.  
Battle message: "There is always room for one more."  
Distinct role: Late-game kindness clear plus active-party recovery; never a signature-phase shortcut

What Tom does: Pulls the table outward by one small extension instead of protecting it from newcomers.  
What Grace does: Makes a sparkly place card for the extra guest.  
What Rose does: Scoots a chair over and invites the monsters without hesitation.  
What Amy does: Shares the serving jobs rather than carrying them all herself.  
What Deedee does: Shows that the homemade, dairy-free shared dish already has enough portions.  
What Boppy does: Sets the extra chair at a comfortable distance and does not rush the guest.  
What TNB does: Levels the new place with a small handmade coaster and puts a heart beside Tom.  
What Nara does: Places a little floor mat beside the guest chair and waits hopefully.  

Spoken line, Tom: "Room for ONE more."  
Spoken line, Grace: "Sparkly seat, ready!"  
Spoken line, Rose: "Monsters sit here!"  
Spoken line, Amy: "Everybody helps serve."  
Spoken line, Deedee: "I made enough."  
Spoken line, Boppy: "Nobody rushes dinner."  
Spoken line, TNB: "An extra place."  
Spoken line, Nara: "Ruff! Wuff! Arf!"  
Meaning (narration box, never spoken): There is a floor place for the new friend, too.  

Animation beats:
1. The familiar eight-place gathering appears in a compact semicircle with one enemy-shaped empty space just outside it. (0.7 s)
2. Tom pulls out a short table extension while TNB steadies it with a handmade coaster and a tiny heart. (0.8 s)
3. Grace places a sparkly blank place card, and Rose visibly scoots her chair to make the opening larger. (0.9 s)
4. Amy hands out small serving jobs, and Deedee reveals a plain homemade dish with one extra portion already prepared. (0.9 s)
5. Boppy sets the guest chair down without hurry and steps back instead of blocking the entrance. (1 s)
6. Nara nudges a little floor mat beside the guest place, then sits with an expectant tail wag. (1 s)
7. All eight turn toward the open place at once; one broad warm invitation pulse reaches regular enemies while the active party recovers. (1.4 s)
8. The extra chair remains available rather than forcibly seating a boss; regular kind targets smile and any cheered ones wave goodbye. (0.9 s)

IMPACT: Beat 7. One High-Five sparkle window for the complete action. Total: 7.6 s at 1x.

New assets: poses: none / props: short table extension; blank sparkly place card; handmade leveling coaster; guest chair; little floor mat; extra homemade portion / scene effects: open-place invitation pulse / sounds: none


Not a mashup because: The action is collectively making a place for an outsider, not eight signatures combined; no barrier or final signature-event counter is bypassed.

Resentment Barrier: **None**.  
Barrier behavior: no Resentment flag is changed, and no finale signature use is substituted.
## I4. The four barrier breakers

| Barrier | Exact required combo key | Required cast | One unmistakable image | Routing rule |
|---|---|---|---|---|
| Distance | `tombo_tnb_two_coasts` | Tom + TNB | Two separated coasts become one shared tabletop when their hands meet above the steam bridge. | Unlock by the chapter-19 cup event; emit only `distance` at impact. |
| Aging | `family_pencil_us_in` | Deedee + Boppy + Tom | The calendar turns forward; both parents remain their present ages as the glass cracks. | Unlock in chapter 15; emit only `aging` at impact. |
| Exhaustion | `family_shared_load` | Amy + Grace + Rose | Amy has one visibly free hand while small shared jobs split the impossible bag-shaped wall. | Unlock in chapter 12; emit only `exhaustion`; never require Tom. |
| Fear | `tombo_nara_there` | Tom + Nara | Nara's nose reaches Tom's hand and a continuous warm pawprint trail splits the false shadows. | Unlock by the chapter-19 scent event; emit only `fear` at impact. |

Only these exact unlocked keys advance their respective barrier events. Any ordinary-shield op, any unrelated Tombo, an Ultimate, and The Extra Place all leave the four barrier flags unchanged. The two support Finishes break their matching barrier without needing an HP-damage packet. Misses, evasion, and elemental resistance must not prevent the matching scripted barrier event after an eligible, paid action has resolved. This exception applies to the story barrier event, not to ordinary damage or its secondary combat effects.

## I5. Old to new key map

### Source limitation: real legacy keys were not supplied

Part F supplies **display names, owners, and path positions**, not actual source-code or save identifiers. Therefore an honest literal old-key-to-new-key map cannot be completed from the attachment alone. The tables below are a complete **name-and-slot migration manifest for all 87 named existing entries**: 80 character entries and seven built tier-1 Tombos. The `Legacy key` column is deliberately `UNSUPPLIED`. The replacement IDs are exact proposed IDs. Do not turn an old display name into a guessed snake_case key and write it into saves.

A mapping means replacement content, not identical mechanics, rank, or ownership. In particular, old capstones do not automatically grant a new level-26 Ultimate. A passive marked removed is refunded rather than converted into a hidden passive. Signature handlers keep their actual existing IDs; the proposed IDs below may be aliases. Preserve story references to the real signature handlers, including the source's distinct MOON & BACK signature and To the Moon & Back old path move.


### Tom

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Button Mash | UNSUPPLIED | `controller_tap` |
| Signature | DEFEND | UNSUPPLIED | `defend` |
| Home Baker 1 | Starter Splash | UNSUPPLIED | `starter_inspection` |
| Home Baker 2 | Dutch Oven | UNSUPPLIED | `proofing_drawer` |
| Home Baker 3 | Unboxing | UNSUPPLIED | `warranty_void` |
| Home Baker 4 | Delta One | UNSUPPLIED | `house_awake` |
| Polyglot Gamer 1 | Flashcard Flurry | UNSUPPLIED | `five_minute_review` |
| Polyglot Gamer 2 | Kanji Strike | UNSUPPLIED | `radical_solutions` |
| Polyglot Gamer 3 | Study Streak | UNSUPPLIED | removed |
| Polyglot Gamer 4 | Final Boss | UNSUPPLIED | `not_alone` |


### Grace

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Cartwheel | UNSUPPLIED | `heel_click` |
| Signature | DANCE | UNSUPPLIED | `dance` |
| Influencer Cleric 1 | Squishy Squeeze | UNSUPPLIED | `dumpling_consult` |
| Influencer Cleric 2 | Glitter Nails | UNSUPPLIED | `glitter_checkin` |
| Influencer Cleric 3 | Runway Walk | UNSUPPLIED | `thumbnail_face` |
| Influencer Cleric 4 | Like and Subscribe | UNSUPPLIED | `keep_bloopers` |
| Acro-Star 1 | Dance Battle | UNSUPPLIED | `eight_count` |
| Acro-Star 2 | Beam Dismount | UNSUPPLIED | `beam_borders` |
| Acro-Star 3 | Stick the Landing | UNSUPPLIED | removed |
| Acro-Star 4 | Perfect 10 | UNSUPPLIED | `gravity_permission` |


### Rose

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Boop | UNSUPPLIED | `tiny_tap` |
| Signature | SILLY | UNSUPPLIED | `silly` |
| Giggle Gremlin 1 | Peekaboo | UNSUPPLIED | `where_did_i_go` |
| Giggle Gremlin 2 | Twirl Tornado | UNSUPPLIED | `floor_is_jelly` |
| Giggle Gremlin 3 | Dress-Up Day | UNSUPPLIED | `royal_inspection` |
| Giggle Gremlin 4 | Monster Under the Bed | UNSUPPLIED | `pretend_birthday` |
| Piggyback Kid 1 | Lamby Launch | UNSUPPLIED | `lookout_lamby` |
| Piggyback Kid 2 | Piggyback Pounce | UNSUPPLIED | `pocket_princess` |
| Piggyback Kid 3 | Big Kid Now | UNSUPPLIED | removed |
| Piggyback Kid 4 | Lamby Stampede | UNSUPPLIED | `travel_kingdom` |


### Amy

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Sprint Tackle | UNSUPPLIED | `starting_step` |
| Signature | PEP TALK | UNSUPPLIED | `pep_talk` |
| Head Teacher 1 | Red Pen | UNSUPPLIED | `margin_notes` |
| Head Teacher 2 | Pop Quiz | UNSUPPLIED | `eyes_up_front` |
| Head Teacher 3 | Lesson Plan | UNSUPPLIED | removed |
| Head Teacher 4 | Personal Best | UNSUPPLIED | `everybody_turn` |
| Marathon Mom 1 | Burpee Blitz | UNSUPPLIED | `lace_then_race` |
| Marathon Mom 2 | Hill Repeats | UNSUPPLIED | `hill_math` |
| Marathon Mom 3 | Marathon | UNSUPPLIED | `shakeout_mile` |
| Marathon Mom 4 | Finish Line | UNSUPPLIED | `stopwatch_cant` |


### Deedee

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Spit Shine | UNSUPPLIED | `dish_towel_flick` |
| Signature | MOON & BACK | UNSUPPLIED | `moon_back` |
| Registered Baker 1 | Registered Nut | UNSUPPLIED | `registered_nut` |
| Registered Baker 2 | Rhubarb Crisp | UNSUPPLIED | `corner_piece` |
| Registered Baker 3 | Wet Floor | UNSUPPLIED | `windows_open` |
| Registered Baker 4 | Sunday Dinner | UNSUPPLIED | `open_visiting` |
| Busy Bee 1 | Power Walk | UNSUPPLIED | `brisk_means_brisk` |
| Busy Bee 2 | Wine O'Clock | UNSUPPLIED | removed |
| Busy Bee 3 | Garden Fresh | UNSUPPLIED | removed |
| Busy Bee 4 | To the Moon & Back | UNSUPPLIED | `everything_coming_up` |


### Boppy

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Cap Swat | UNSUPPLIED | `cap_check` |
| Signature | GRUMBLE | UNSUPPLIED | `grumble` |
| Rikers Warden 1 | Cast Line | UNSUPPLIED | `patient_angler` |
| Rikers Warden 2 | Recliner Drop | UNSUPPLIED | `recliner_reservation` |
| Rikers Warden 3 | Big Catch | UNSUPPLIED | `closing_time` |
| Rikers Warden 4 | The One That Got Away | UNSUPPLIED | `gate_stays_open` |
| Pepper Champion 1 | Pepper Breath | UNSUPPLIED | `sensible_pepper` |
| Pepper Champion 2 | Hot Pepper | UNSUPPLIED | `seeds_of_trouble` |
| Pepper Champion 3 | Track Star Story | UNSUPPLIED | `nineteen_seventy` |
| Pepper Champion 4 | Ghost Pepper | UNSUPPLIED | `pepper_forecast` |


### TNB

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Mug Toss | UNSUPPLIED | `clay_offcut` |
| Signature | WARDROBE | UNSUPPLIED | `wardrobe` |
| Set Costumer 1 | Quick Change | UNSUPPLIED | `quick_change` |
| Set Costumer 2 | Next Stop | UNSUPPLIED | `lost_found_warmth` |
| Set Costumer 3 | Jump Scare | UNSUPPLIED | `practical_effects` |
| Set Costumer 4 | That's a Wrap | UNSUPPLIED | `everybody_lives` |
| Kiln & Longboard 1 | Carve | UNSUPPLIED | `curb_appeal` |
| Kiln & Longboard 2 | Kiln Blast | UNSUPPLIED | `kiln_door_policy` |
| Kiln & Longboard 3 | Cone Six | UNSUPPLIED | `cone_six` |
| Kiln & Longboard 4 | Bomb the Hill | UNSUPPLIED | `earth_thrown` |


### Nara

| Old slot | Old display name from Part F | Legacy key | Proposed replacement key |
|---|---|---|---|
| Basic | Jump Up | UNSUPPLIED | `happy_hip_check` |
| Signature | PUPPY EYES | UNSUPPLIED | `puppy_eyes` |
| Goodest Girl 1 | Fetch | UNSUPPLIED | `ball_please` |
| Goodest Girl 2 | Zoomies | UNSUPPLIED | `five_second_zoomies` |
| Goodest Girl 3 | Tug of War | UNSUPPLIED | `keepaway_rules` |
| Goodest Girl 4 | SQUIRREL! | UNSUPPLIED | `ball_reserve` |
| Pack Heart 1 | Happy Puddle | UNSUPPLIED | `puddle_geography` |
| Pack Heart 2 | Wet Dog Shake | UNSUPPLIED | `shake_everyone` |
| Pack Heart 3 | Pack Instinct | UNSUPPLIED | removed |
| Pack Heart 4 | Lonely Howl | UNSUPPLIED | `not_leaving` |


### Built tier-1 Tombos

| Partner | Old display name from Part F9 | Legacy key | Replacement key |
|---|---|---|---|
| Grace | Dumpling Unboxed | UNSUPPLIED | `tombo_grace_review` |
| Rose | Double-Decker Boop | UNSUPPLIED | `tombo_rose_clouds` |
| Deedee | Sourdough & Rhubarb | UNSUPPLIED | `tombo_deedee_clean` |
| TNB | Glaze & Bake | UNSUPPLIED | `tombo_tnb_commentary` |
| Nara | Boule Fetch | UNSUPPLIED | `tombo_nara_which_hand` |
| Boppy | Quiet on the Pier | UNSUPPLIED | `tombo_boppy_net` |
| Amy | On Your Marks | UNSUPPLIED | `tombo_amy_dismissal` |


### Required migration procedure

1. Export the actual move registry with owner, exact key, display name, old path, old node index, voice key, animation key, and story references. Resolve each row above by owner plus old slot, then assert exactly one match. Halt safely on zero or multiple matches and retain the untouched save.
2. Version the migration and make it idempotent. Retain a pre-migration save backup. Keep chapter flags, levels, XP, inventory, relationships, and Tombo unlock events; never infer story completion from level or a skill purchase.
3. Clear old path stamps and refund their recorded old costs. Recompute total entitlement as `2 + floor(level / 2) + verified_side_quest_credits + legitimate_existing_grants`. If the quest ledger is absent, infer only from a validated legacy entitlement and spent-SP record; never erase unexplained legitimate SP. Reconstruct a legal new allocation from the player's preferred path using the new gates, or leave the fully refunded points for the existing free respec/Auto-Stamp interface. Never auto-own a mapped locked skill.
4. Replace old ability and voice references through the resolved map. A removed ID cannot remain in a command grid, tutorial, cached selection, battle-state serialization, tooltip, enemy like list, or event script. Do not reuse an old animation ID as a new move's core merely to simplify migration.
5. Preserve every built tier-1 Tombo's story-unlocked flag under its replacement key. Tier-2 and tier-3 existing keys, if any exist outside Part F, must be exported separately; none can be guessed from this brief. Keep the E3 event identity as the source of truth for all new tiers.
6. Update each area's five kindness likes by **semantic eligibility**, not blind key substitution. Many old attacks now map to non-kind attacks, and removed passives are not valid likes. Require five distinct existing `kindFoe`-eligible keys per area, and verify that the chapter's available cast has at least one reachable liked move. Prefer several reachable likes across both path choices. Do not fill the list with locked Ultimates or a character absent from that chapter.
7. Preserve the eight finale signature event IDs and explicitly bind the four new barrier keys in I4. Reload the migrated save twice and confirm that no SP, items, unlocks, or trait counters are awarded a second time.

## I6. Self-check

These checks apply to the written proposal. They are not claims that the existing executable has been audited or playtested.

| # | Yes / No | Proof or precise limitation |
|---|---|---|
| 1 | Yes | Eight characters x two paths x six active nodes = 96 path skills; there are no passive-only nodes. |
| 2 | Yes | All 12 path nodes per character are NEW or REWORKED, exceeding the required two-thirds threshold. |
| 3 | Yes | All 21 Tombos, four Family Finishes, and 16 capstones are NEW, with an independently specified central scene rather than calls to old move animations. |
| 4 | No | Whole-game nonduplication cannot be verified from a brief without the existing animation code; the 137 proposed cards have separately authored central actions, but the old-game comparison remains a release check. |
| 5 | Yes | Each character has five or six non-damaging kindFoe path moves, excluding signatures and combos; the audit table below lists the counts. |
| 6 | Yes | Every kit has at least two single-target attacks, two multi-target attacks, support/control, trait use, and a named family-member interaction. |
| 7 | Yes | All 137 abilities have a unique spoken line; every participant line is at most 12 words, and the document contains no em-dash character. |
| 8 | Yes | The girls' spoken address uses the required hyphenated family name; menus, descriptions, and battle messages call him Tom. |
| 9 | Yes | Nara's vocal lines contain only canine vocalizations; every interpretation is explicitly a narration box, not dialogue. |
| 10 | Yes | Boppy's physical complaints concern his stomach, and his pace complaints concern people walking too fast. |
| 11 | Yes | All eight signature names remain exact, and every signature delegates mechanics to its unchanged legacy handler. |
| 12 | Yes | One new effect, warm, and one new status, Close-Up, are introduced; both have numerical rules, well below 12 additions. |

| Character | Active path nodes | Single-target attacks | Multi-target attacks | kindFoe path moves | Support/control path moves |
|---|---|---|---|---|---|
| Tom | 12 | 4 | 3 | 5 | 10 |
| Grace | 12 | 4 | 3 | 5 | 11 |
| Rose | 12 | 4 | 3 | 5 | 12 |
| Amy | 12 | 4 | 2 | 6 | 10 |
| Deedee | 12 | 3 | 3 | 6 | 10 |
| Boppy | 12 | 4 | 3 | 5 | 10 |
| TNB | 12 | 3 | 3 | 6 | 10 |
| Nara | 12 | 2 | 4 | 6 | 11 |

Support/control counts may overlap damage counts, as H1 permits. Kind counts exclude all signatures and combos.

### Boss-tool and relationship coverage

| Character | Interrupt tools | Party-wide recovery or mitigation | Amber answer | Examples that reach back row | Specific family interaction |
|---|---|---|---|---|---|
| Tom | A4 / B5 | A3 / A6 | A2 / A6 | A1, A4, B4, B6 | A3 adds a crust only with Deedee |
| Grace | B4 | DANCE / A6 / B3 | A3 | A4, B1, B4, B6 | A2 gives Rose a small extra heal |
| Rose | A3 / B2 / A6 | B5 | B3 / B5 | A2, B1, B2, B6 | B1 mounts only when Tom is present; B5 warms Tom |
| Amy | A4 / B4 | A3 / A6 | A2 / B5 | A1, A5, B1, B4 | A5 reassures Grace and Rose separately |
| Deedee | A4 | MOON & BACK / A6 | A3 / B3 / B6 | A4, B1, B4 | A3 gives Boppy an extra plain portion |
| Boppy | A4 | GRUMBLE / A5 / A6 | B3 | A1, A4, A6, B1 | A2 also guards Deedee when she is active |
| TNB | A4 / B5 | A6 | A3 / B2 / B6 | A4, B1, B5 | A2 adds a small heal for active Tom |
| Nara | A4 | B2 / B5 / B6 | A3 / B5 | A1, A4 | A1 reacts to Tom acting; B3 cleanses revived Tom |

Every kit has non-Chatter attack and support options. For ordinary shields, all kits offer multiple offensive elements and their existing joint-action route; Rose, Boppy, and TNB additionally have explicit shieldBreak in their paths. This is categorical coverage, not a claim that one character can independently break every possible elemental shield. Actual chapter gates and enemy shield requirements still require the I7 encounter tests.

## I7. Evaluation of the system overall

This section answers the additional request to evaluate the system. **Evidence boundary:** this is a design review of the supplied brief and the proposal above. There has been no access to combat code, enemy data, actual chapter levels, save files, device performance, or player behavior. Mathematical examples below are deductions from the stated rules, not measured game results.

### 7.1 Overall verdict

**Keep the architecture. Its strongest feature is that ordinary family behavior is the combat language, and that same language resolves the story. The principal risk is not a shortage of mechanics. It is the interaction of generous resource generation, free partner participation, turn manipulation, and a much larger active move set.**

The battle system has a coherent emotional center. DEFEND is not merely a tank command: it becomes Tom's defining sacrifice. A dance, a raspberry, a grumble, and a dog's attention are not decorative jokes: the ending needs them. Kindness has a persistent battle representation rather than being a dialogue choice bolted onto combat. That alignment is worth protecting more than any individual damage number. These judgments follow the relationship between Parts C, D10, and E, not a comparison with unexamined games.

| Dimension | Assessment | What would change the assessment |
|---|---|---|
| Character and story integration | Strong on paper | Verify that the final signature scenes preserve their original meaning and target routing. |
| Tactical foundation | Promising | Confirm that move weight, weaknesses, protection, and control each create meaningful decisions in actual encounters. |
| Resource economy | High-priority uncertainty | Trace every HEART/VP/trait event and rule out refund or instant-turn loops. |
| Progression | Numerically coherent under this proposal | Check quest-SP distribution, returning-character levels, and real chapter encounter XP. |
| One-thumb readability | At risk as content grows | Test the 12-skill menu with the family's actual phones and the intended child players. |
| Implementation readiness | Complete content proposal, incomplete integration evidence | Resolve real save IDs, status parameter support, actor eligibility, and the source's story-party conflicts. |

There is no responsible numerical fun score without playing it. The appropriate next decision is a narrow implementation-and-playtest slice, not a replacement battle architecture.

### 7.2 The resource economy needs an event audit before tuning damage

#### VP already makes Ultimates fairly accessible

D2 says a character starts at 5 VP and gains 2 at the start of each turn. If the first turn receives that grant, the first decision starts at 7 VP. Thus a 7-VP Ultimate would be immediately usable once unlocked. After one basic, the character has 8 VP, and the next turn begins at the cap of 10. The 8- and 9-VP Ultimates in this proposal therefore require only one initial basic in that simple case. This is accessible, but it is not a long resource puzzle. Confirm the first-turn timing rather than assuming the grant is delayed.

In steady state, a basic contributes +3 VP across its turn: +2 at turn start and +1 after the basic. A turn spent on a skill costing C contributes `2 - C`. Two basics and one 8-VP Ultimate sum to `3 + 3 + 2 - 8 = 0`, before cap waste or external gains. A 9-VP Ultimate needs an average of seven basics per three casts without help, or a simple repeating pattern with three basics between casts and some surplus. Meanwhile, a 2-VP skill is resource-neutral indefinitely. These are useful accessibility properties, but ordinary 3- to 6-VP skills need situational value beyond merely being smaller damage.

Tom's free instant skill, Warm Crust free actions, Amy's pace, and VP-support moves all sit on top of this baseline. Do not price every Ultimate as though the caster must painstakingly bank nine points from zero. In particular, no proposed VP-paid move refills its own caster to 10; a self-refilling VP Ultimate could erase its intended cost.

#### HEART might be a budget or might be a positive-feedback machine

The source lists +15% for heals, buffs, and DEFEND; +15% for weakness hits; +5% for a High-Five; and +10% when an ally is hurt. It does not state whether those are per action, per recipient, per hit, per category, or sometimes per packet. This is the most important missing combat detail.

Consider a 25% Tombo containing a heal and a buff. If those each grant 15% once, it refunds 30% before any timing or weakness bonus and is already net-positive. If a party heal grants 15% for each of four recipients, the heal alone refunds 60%. A damaging weakness hit plus High-Five can return 20%, making a 25% Tombo nearly free even without a heal. These are conditional examples, not claims that the current engine actually implements all those grants together.

Free partner participation makes the issue larger: D9 preserves the partner's own upcoming turn. A nearly free Tombo can replace a normal attack while supplying another actor's contribution and one of Tom's three Miles. Three such uses can then lead to a free instant skill. A content expansion cannot safely assume these systems are independent.

**Required trace:** log action ID, initiator, guests, VP before/after, HEART spent, every HEART event and reason, Mile change, trait events, scheduled ticks, and final state. Test full-health heals, fully refreshed buffs, a four-target heal, a four-hit weakness move, reflection, regen, a Shoulder Ride sequence, free crust consumption, an auto-revive, and a Tombo whose effect cheers multiple monsters.

**Recommendation, not an unannounced rules change:** if the implementation awards the same event repeatedly per recipient or packet, seek approval for event-level normalization before increasing costs. The brief locks the HEART architecture; this document does not secretly change its +15/+10/+5 rules. Balance the new content against the verified behavior first. If the existing behavior genuinely permits unlimited positive loops, label that a system decision rather than disguising a fix inside unrelated ability data.

### 7.3 Turn economy and control can matter more than multipliers

The stated CTB formula is `floor(1200 / (PEP + 30) * weight)`.

| PEP | Quick 0.7 | Standard 1.0 | Heavy 1.3 |
|---:|---:|---:|---:|
| 20 | 16 ticks | 24 ticks | 31 ticks |
| 50 | 10 ticks | 15 ticks | 19 ticks |
| 80 | 7 ticks | 10 ticks | 14 ticks |
| 99 | 6 ticks | 9 ticks | 12 ticks |

A quick 1.5-multiplier move has a nominal multiplier-per-weight ratio of about 2.14, above a standard 2.0-multiplier move's ratio of 2.0, before VP, defenses, or floor effects. Thus quick is a real power property, not just a snappier animation. The fast characters also earn VP and action-based HEART more often.

Amy's +25% party PEP at full Pace Setter and Nara's +30% PEP while Tom is down amplify this. The source does not define additive versus multiplicative PEP stacking or whether buffs recalculate already-scheduled ticks. Preserve the actual rules and test them. Do not accidentally update the current ribbon and the next scheduling calculation twice for the same PEP change.

The cheapest hard-control loop deserves a dedicated test. SILLY and PUPPY EYES each cost 2 VP, matching the +2 turn-start income. Against a susceptible opponent, a faster actor may be able to renew turn denial indefinitely. SILLY's boss held-object exception is stated, but an equivalent universal PUPPY EYES boss exception is not. Do not assume one exists. Distinguish a boss dropping its held wind-up object, a cancellable telegraph ending, a delayed turn, and a skipped turn in both code and UI.

The proposal therefore favors soft CTB delays for many ordinary control moves and uses a named, one-action Close-Up rather than quietly redefining See Me. It does not remove the locked signature functions. If encounter immunity rules or diminishing returns are needed, that requires a separate system or enemy-content decision, not an undocumented ability revision.

### 7.4 Damage stacking is attractive but can obscure why a boss vanished

At attacking stat 50 and matching defense 50, D3's pre-multiplier term is `50 * 2.5 - 50 * 1.2 = 65`. A 4.0 Ultimate therefore deals 260 before elemental and timing effects. Weakness makes it 390; High-Five makes it 448.5. A +50% next-action boost and the proposed x2 Close-Up bring it to 1,345.5 before rounding and before any critical multiplier. Rose's separate 40% echo can further change her own skill results.

This is a satisfying adult optimization opportunity, not automatically a defect. Enemy HP, boss phase thresholds, crit rules, and damage caps are absent, so the brief does not establish whether those numbers are too high. The risk is an opaque multiplicative stack that feels random to a child and skips the adult's interesting boss phase.

Keep separate log fields for base damage, multiplier, weakness, crit, High-Five, boost, vulnerability, and Rose's extra sequence. Use the aggregate-multiplier convention consistently so Nara's four hits do not accidentally become four full 1.6 attacks. Check that ordinary shield counters are intentionally decremented per action or per hit. A visually multi-hit skill should not accidentally erase a numbered shield merely because its animation was split into more packets.

For important phases, test whether an earned large hit is allowed to cross the threshold and what happens to the phase event. Any scripted floor belongs to that encounter's explicit rules. Do not add a hidden global boss damage cap to compensate for one spectacular combo.

### 7.5 Kindness is a real system, but its incentives need to remain legible

D10 gives a regular monster both HP and Warmth, and a kindness win grants +50% coins and +20% HEART. That is a meaningful reward, not just a different defeat animation. The proposal deliberately makes its kind path moves non-damaging so a player cannot accidentally knock out the monster they were trying to cheer up.

Under the proposed normalization, K30 takes four unassisted casts to fill an empty bar. With the proposed x1.5 area-like multiplier, it takes three. With both that like bonus and a High-Five, it becomes 51.75 per cast and takes two. These are design arithmetic, not measurements of current behavior. If the existing likes formula differs, retain its meaning and retune the K values rather than layering another bonus on top.

There are two opposing risks. If kindness is consistently much slower, children may learn that the game's stated moral is the inefficient option. If it is consistently faster and grants more money plus HEART, it may dominate every regular encounter and make attack kits feel ornamental. The desirable result is a readable tradeoff based on a monster's likes, current bars, immediate threat, and available cast.

A three-monster kindness clear returns 60% HEART under the stated per-monster reward. A five-monster clear returns 100%. That can legitimately celebrate a successful encounter; do not mistake every post-win full gauge for an exploit. But repeated summons, reappearing monsters, or repeatable held-item rewards must not permit duplicate payout for the same defeated entity. Check the existing spawn and reward identities.

The five-move likes list per area is now a content-maintenance obligation. With rotating story parties and sequential paths, a list of five correct IDs can still be useless if every move belongs to an absent character or a level-40 capstone. Validate likes against chapter availability and a low-SP build. Inspect should make the cheer-up route understandable without requiring knowledge of this document.

### 7.6 Progression works arithmetically; chapter pacing is still unverified

The proposed baseline entitlement of 27 SP at level 50 buys one 15-SP path and the first five nodes of the other for 11 more. That meets the requested endpoint without mandatory quests. It also leaves the optional last Ultimate as a clear reward for three credited side quests. A focused first Ultimate at 26, or Auto-Stamp at 28, follows directly from the costs and income.

The conditional level-40 second capstone protects against an early side-quest sweep unlocking both Ultimates at 26, while allowing either path to be the preferred first path. This is an intentional new level-gate predicate, permitted by the requested progression redesign, and must be displayed clearly: FIRST ULTIMATE: 26; OTHER ULTIMATE: 40. Do not hide the condition until the player has committed points.

What cannot be inferred is the chapter where level 26 occurs. The brief gives 100 XP per level, but not encounter XP, encounter frequency, quest-SP distribution, join levels, or reserve XP behavior. Boppy and Deedee also have significant story absences. If returning characters do not catch up, their late-story scenes could unlock a beautifully designed kit they are too underleveled to use. Check the actual leveling and return logic rather than solving the problem by silently granting late nodes.

Free respec is valuable here. Auto-Stamp should explain the next purchase and bank points when necessary. Respec must not reset story props, farm quest SP, duplicate Warm Crusts, or make two capstones legal below 40. The migration must preserve earned progress even when an old passive no longer has a one-to-one active replacement.

### 7.7 Story and actor availability contain release-blocking ambiguities

| Priority | Source issue | Precise integration requirement |
|---|---|---|
| P0 | E3 places Deedee's tier-2 unlock in the chapter-7 vault, but E1's built chapter-7 party is Tom, Grace, Rose. | Preserve the vault unlock event. Verify whether Deedee already appears as a scene-only guest; if not, obtain a deliberate story staging decision. Do not move the unlock to a different chapter or claim she was already playable. |
| P0 | Chapter 14 lists Tom, Amy, Grace, Rose, yet requires Deedee's MOON & BACK to finish Boppy's redemption. | Verify the scripted guest entry or closing-scene handoff. A scene-only Deedee entrance is a possible implementation choice, not a fact supplied by the brief. Her final required signature cannot be replaced by a new heal. |
| P0 | All-eight Family Finish versus a four-member encounter. | Implement or verify the reserve-guest contract in I3 without creating extra CTB actors. Test injured and knocked-out reserves, not just a full-health showcase. |
| P0 | Tom is removed in chapter 18, but several traits and moves reference him. | Clear or safely end Shoulder Ride on story removal; hide Tombos, reject absent Tom as a revive target, and distinguish story absence from a combat knockout. Not Leaving must not bypass his chapter-19 restoration. |
| P0 | Four barriers use exact combos, including two zero-damage Finishes. | Route by exact paid action ID and barrier tag, not by damage, element alone, generic shieldBreak, or a substring in a display name. |
| P1 | Chapter 12 says any four of six after chapter 11 says seven are together. | Identify which six are selectable and confirm Amy, Grace, and Rose are available for the intended unlock. Do not invent the excluded character. |
| P1 | The chapter-19 gifts remain part of earlier move imagery. | Use the specified remembered-prop render variants without restoring inventory or creating an extra sacrifice event. |

The finale's resource pacing also needs attention. Four 75% barrier-breakers require 300% HEART in total. Even entering with the maximum 100%, at least another 200% must be generated during the sequence, including any returns from the combos themselves. Test the actual time and decisions needed to earn that amount. The climax should not become repeated full-health healing solely to buy mandatory story animations.

Finally, the second phase must accept all eight original signatures on Julian through its existing special targeting logic. DEFEND and GRUMBLE are not ordinary heals, WARDROBE is not ordinarily an enemy costume selector, and several signatures normally target a party. Do not assume the generic `kindFoe` adapter is sufficient. Verify each exact signature event, its visible emotional response, how Tag Swap exposes absent active members, and how duplicates are handled. The brief requires all eight; the exact ordering and counter implementation are not supplied. This proposal preserves that requirement rather than inventing a replacement final-boss algorithm.

### 7.8 More active skills is both the reward and the usability cost

Path nodes increase from 64 to 96, a 50% increase. Part F contains seven passive nodes, so the count of active path moves rises from 57 to 96, about 68%. That is a more substantial choice and animation increase than merely adding two buttons to each path.

This draft also gives most attacks a secondary tactical effect. That richness is a tuning risk in its own right: if testing shows too many status icons or unclear choices, trim secondary effects before adding still more systems.

Keep the existing command cross. Within its skill grid, use stable path order, visible VP, a clear element icon, an explicit kind-target icon, and a distinguishable Ultimate treatment. Long names may wrap to two lines; do not shrink the entire grid until children can no longer read it. Preserve the selected row when backing out, and make the legal target preview obvious before commitment. These are presentation recommendations within the existing commands, not a new radial menu or resource.

The cards use a single focal action per beat, mute-readable jokes, brief ordinary moves, and longer capstones. That is appropriate to the specified phone stage, but readability is not proven by a screenplay. Render the smallest silhouettes and longest labels on an actual portrait phone. In particular, prove that the one-pixel joke in a prop is not carrying essential gameplay information. The High-Five sparkle should not be hidden by a full-screen flash or the player's thumb.

For the eight-person Finish, keep each spoken contribution very short and show one caption at a time; the invitation must still read with no captions or sound. At 2x, the combat timing and text legibility need separate testing. Do not assume halving every animation duration also makes a child able to read twice as fast. Use the game's existing timing-assist policy and present all written lines in the move description or a suitable existing text view where available; adding a new history viewer would be a separate UI task, not an assumed feature.

### 7.9 Implementation order and acceptance tests

Implement a vertical slice before authoring every expensive new pose: Tom's two ordinary kindness options and one Ultimate, one completely new tier-1 Tombo, the mother-and-daughters Finish, and the four barrier event bindings using temporary art. This exercises ordinary skills, a free partner, a no-Tom Finish, reserve guests, and a zero-damage barrier break. Then expand character by character with the same effect interpreter.

| Test | Required evidence before release |
|---|---|
| Content inventory | Exactly eight basics, eight unchanged-mechanics signatures, 96 active path nodes, 21 distinct Tombos, four Finishes, and 16 capstones. Every new key resolves. |
| Damage packets | One-hit and four-hit versions with the same total multiplier agree except for documented per-hit rules, minimum-damage floors, and explicit effects. |
| HEART accounting | A trace identifies every grant. Multi-hit, multi-recipient, reflection, regen, free snacks, and joint actions do not accidentally create duplicate events. |
| VP and instant actions | No new VP-paid skill directly refills itself to 10. Diamond Medallion is consumed exactly once, and instant resolution cannot recursively create an unlimited sequence of turn-start grants. |
| Trait preservation | Existing Miles, Trending, Shoulder Ride, Pace Setter, crusts, Heartburn, rack rotation, and Nara conditions retain their intended state transitions. Guest-action semantics are explicitly tested. |
| Status lifecycle | Guard, Evasive, Close-Up, Wardrobe Fresh, and interrupts expire or consume at their defined events. A multi-hit action consumes Close-Up only after the action, not on its first tiny hit. |
| Ordinary shields | Elemental hits, multi-hit counters, Tombo eligibility, and explicit shieldBreak behave consistently. None alters a Resentment barrier unless its exact binding matches. |
| Four barrier events | Each right combo removes only its matching barrier; every wrong combo fails cleanly without silently removing another. The support Finishes work with zero damage. |
| Final signature phase | All eight exact signature events are recognized with legal targets and attainable participants; no new Ultimate or all-eight Finish bypasses the requirement. |
| Story absences | Chapter 7, 12, 14, 16, 18, and 19 fixtures contain the correct actors and safely disable unavailable relationships. |
| Kindness | No kind path branch damages monster HP, equips it, revives it, or grants it VP. Liked moves are reachable; rewards are paid once per departing entity. |
| SP and saves | Baseline SP totals match 7/12/17/22/27 at levels 10/20/30/40/50. A second migration adds nothing. Two capstones cannot survive a respec below 40. |
| Phone and child usability | A child can find a legal useful skill, identify a kind target, and recognize the main joke at 1x with sound off; test rather than infer success. |
| Animation originality | Compare each proposed core scene to the actual old animation registry, which was not supplied. Rework any unnoticed collision before accepting self-check 4 as Yes. |

**Ship criterion:** the content count is not the release gate. The release gate is a functioning story path, a stable event economy, legal saved progression, and battles where the extra choices are worth making. The proposed content can support that result; only an implementation trace and hands-on play can establish that it has done so.
