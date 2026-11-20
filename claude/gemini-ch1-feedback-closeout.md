# The Adventures of Tom: what happened to your chapter 1 test report

For: Gemini (the chapter 1 tester)
From: Tom, with Claude
Date: 2026-11-20

## Why I'm sending this

Your chapter 1 report was split into one card per issue on the project board. 19 of those cards have now been closed as "Not needed". This note gives the reason for each one, so you know where your picture of the game is out of date before your next review.

The short version: you tested an older build (`board-ch1review`) and judged its battles against the **v10** battle spec. Since then, three things changed.

1. **The battle system moved on to v11, built as a separate engine ("Battle 3").** Chapter 1's story fights still run the old engine ("battle 2") until chapter 1 switches over. The old engine is being replaced, not fixed, so its gaps against the spec don't get repaired on their own.
2. **The chapter 1 script was rewritten and locked** (2026-11-16, with Tom's own cuts after that). Several "locked targets" in your report came from an earlier script draft, and some contradict Tom's decisions.
3. **Other work already fixed a number of your bugs** before their cards were picked up.

## 1. What is out of date in your model of the game

### Battle system

| Your assumption | Current fact |
|---|---|
| The v10 spec is the target | The **v11** spec is the target. Where v10 and v11 differ, v11 wins. |
| The fights you played are the new system | The fights you played are **battle 2**, the old engine. The new engine (**Battle 3**) is built in stages and playable only in ADMIN > BATTLE LAB > NEW BATTLE. |
| Chapter 1 battle gaps should be fixed in the live fights | Battle 2 is being replaced, not fixed. Chapter 1's story fights move to Battle 3 at **stage 15** of a 23-stage build. Stage 23 deletes the old Kindness features from battle. |
| Warmth bars, praise commands and "calm" wins should be removed | Battle 3 never had them. A fight ends at 0 HP, and the kindness plays in the scene after the boss. |
| Pep, Flavors, Primes, Detonations, Composure, Family Ruckus, Vibe Mastery and Signature Vibes need to be built | All are **already built** in Battle 3 (stages 1 to 6, stage 9b for TNB). |
| Composure is 4 to 8 pips | Pips are set per enemy in the v11 bestiary. In chapter 1, normal monsters have 0, the Elite (Log Lump) 4, and the boss (The Big One) 6. |
| Family Ruckus pairs any adjacent ally | It pairs two family members who are **next to each other on the turn bar**. Double Team (50) gives both a +50% Basic. Full Family Ruckus (100) fires both partners' top Main Vibe Skill for free. |
| Rose rides Tom's shoulders in battle | In Battle 3, Rose is her own fighter. **Battle animations are outside the scope of these reviews**: Tom handles them as a separate task, so animation notes don't become battle fixes. |

### Story and canon (chapter 1 script, locked 2026-11-16)

| Your assumption | Current fact |
|---|---|
| The Big One is a bog turtle | The Big One is **Boppy's fish of twenty years**: a normal fish until a flash that morning. It asks after Boppy. Tom confirmed the turtle "was not his decision". |
| Boppy has a boat and makes a boat promise | Boppy is a retired Rikers warden who fishes, and **"not a boat fisherman"**. |
| Grace's door frame height marks should come back | Tom **cut** that beat on 2026-11-19. |
| Rose's BOO scare opens chapter 1 | The scare was **moved to chapter 3**. Chapter 1 now opens inside the taxi office with Sal, then plays the TATA greeting, crouch and hug unchanged. |
| Location toasts need fixing (for example "Cookies at Deedee's") | Location toasts **are no longer shown** in the game. |
| Boppy should lose the fishing rod indoors | Tom decided the rod and creel are Boppy's look. He has them **at all times**. |
| Grace's fingerprints and pencil lines need fixing | That was **old dialogue**. The current script doesn't have it. |
| Deedee's moods after the muffin theft need fixing | The muffin heist scene is **being rewritten**, so notes on the old version don't apply. |

## 2. Every closed card and why

| Card | Your finding | Why it was closed |
|---|---|---|
| BUG-02 | AUTO resets to ON; a tap skips unfinished text | Already works. Turning AUTO off is saved, and a tap during typing shows the full text, then closes on a second tap. Only Rose Mode turns AUTO on, by design, and your build may have had Rose Mode on. |
| BUG-03 | Closing a banner also walks Tom across the map | Already fixed. |
| BUG-04 | Rose's shoulder sprite glitches in Grump Hollow fights | Battle animations are outside the scope of these reviews. Rose stands as her own fighter in Battle 3. |
| BUG-07 | The stolen muffin pan stays on the kitchen island | Already fixed. |
| BUG-11 | Boppy reacts to the Mudling he should miss | Already fixed. |
| CANON-02 | Rose jumps out to scare Tom outside the taxi office | Moved to chapter 3. The chapter 1 greeting (TATA, crouch, hug) stays as is. |
| CANON-03 | Rebuild The Big One as a bog turtle; cut the lure and chair | Goes against Tom's canon: the Big One stays Boppy's fish, and the folding chair at the pond is in the locked script. |
| CANON-05 | Grace's squeeze warning, pen not pencil, fingerprints | Based on old dialogue. |
| CANON-06 | Tom walks solo to the taxi; no Rose carry in Grump Hollow | Battle animations are outside the scope of these reviews. |
| CANON-07 | Restore height marks, washer, Gas-X, burnt-bulb drawer, boat promise | Based on an old script version. Two items also go against Tom's decisions: the height marks were cut, and Boppy has no boat. |
| CANON-09 | "Cookies at Deedee's" caption; Amy's check-in | Location toasts are no longer shown. |
| CANON-10 | Keep TNB's smog line and the "51 years" line | You marked it a keeper. Closed because there's nothing to fix. |
| POLISH-03 | Boppy's kitchen portrait without fishing gear | Tom decided Boppy keeps his rod and creel at all times. |
| POLISH-05 | Deedee's moods right after the muffin theft | The muffin heist scene is being rewritten. |
| Battle 1.2: Win Condition and Enemy Bars | HP only, no Warmth bar | Battle 3 already wins by HP only. Chapter 1 switches at stage 15, and stage 23 removes Kindness from battle. |
| Battle 1.2: Action Economy | Pep (starts at 4) replaces VP | Already the v11 rule and built in Battle 3: Pep 0 to 10, start 4, +2 on a Basic, refunds capped at 3 a round. The VP meter is battle 2. |
| Battle 1.2: Elements, Primes and Break | Flavors, Primes, Detonations, Composure | Built in Battle 3: 5 Flavors plus Support, 3 Primes, the Detonation table, Composure pips with Break and Flustered. Sparkle, Chatter and STAGGER are battle 2. |
| Battle 1.2: Party Meter and Combos | Family Ruckus replaces HEART | Ruckus is built in Battle 3. HEART is deleted at stage 23, and the old Tombos are reviewed separately in a Move Lab. |
| Battle 1.2: Level-Up and Vibe Progression | Character Level plus Vibe Mastery | Built in Battle 3: Level 1 to 50, Ranks 1 to 5, Main and Pocket Vibe (the Pocket Vibe earns half). Story fights start paying Vibe Points at stage 15. The third Vibe per character comes in stages 19 to 21. |
| Battle 1.2: Character Kits | Full Signature Loadouts, Rose standing | Built in Battle 3: all eight Signature Vibes for Tom, Grace, Rose and Deedee, front and back rows, and Rose as her own fighter. |

## 3. What was accepted and fixed (for context)

These findings were right, and they're fixed in the game: the softlock after losing to The Big One (BUG-01), blank portraits (BUG-05), the quest log "Go to" prefix (BUG-06), Amy's House opening early (BUG-08), the flat plate drawn over The Big One's pan hat (BUG-09), cut-off battle text and overlapping banners (BUG-10), the chapter opening inside the taxi office (CANON-01, in Tom's own version), "camera" removed at the flashbulb (CANON-04), the ";)" in the opening line (POLISH-01), "centre" to "center" (POLISH-02), and Tom's boss line rewritten as real advice (POLISH-06). One more is still open: purging Rhubarb Crisp from the game.

## 4. For your next review

1. Test the **current** build (check the build label at the top left of the welcome screen) and say which build you played.
2. Judge battles against the **v11** spec, and judge the new system only in ADMIN > BATTLE LAB > NEW BATTLE. Story fights stay on the old engine until each chapter switches.
3. Use the **locked chapter script** and Tom's decisions as canon, not earlier drafts. Tom's decisions win over any "locked target" in a report.
4. Leave battle animations out. They're reviewed separately.
