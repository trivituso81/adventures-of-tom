# Chapter 1 verification run: task brief for an AI tester

Written 2026-11-21 from the board (`data/board.json`) of trivituso81/adventures-of-tom. Newest build when written: `voicepurge221`.

## 0. Your task in one paragraph

You are a QA tester for **The Adventures of Tom**, a story RPG that runs in a web browser. Play **Chapter 1 from a new game to the end of the flight to Los Angeles**, in one continuous run, and check the **14 test cards** below at the exact points where they come up. For every card, give a verdict (PASS, FAIL, BLOCKED or CANNOT JUDGE) with evidence. You only observe and report. You change nothing outside the game. The person who reads your report (Tom, the game's director) will act on it card by card, so every verdict must stand on its own without him replaying anything.

## 1. Rules (read before you start)

| # | Rule |
|---|---|
| R1 | **Report what you see, not what you expect.** If the screen does not show the expected result, it is a FAIL, even if it is close. Quote on-screen text exactly, character for character, including capital letters and punctuation. |
| R2 | **One verdict per card**, from this list only: PASS (every expected item seen), FAIL (at least one expected item is wrong or missing), BLOCKED (you could not reach the moment; say why), CANNOT JUDGE (you reached it but could not see clearly; say what was in the way). |
| R3 | **Evidence for every card**: at least one screenshot at the moment named in the card, plus a one-line description of what the screenshot shows. For FAIL, describe exactly what was different from the expected result. |
| R4 | **Do not press** the in-game pencil REPORT tab, anything on ADMIN > BOARD, or any Generate, Approve or Reject button anywhere. Do not open the Art, Voice or Music Library. They cost real money or change the live game. |
| R5 | **Do not judge battle animations** (how attacks, hits or poses look). Judge only whether fights work, are readable and are fun (card M-B). A fight that freezes or never ends IS a bug: report it. |
| R6 | Things that are **not bugs** (decided by Tom, do not report them): Rose rides on Tom's shoulders from the start until she hops down inside Deedee's kitchen; the "Grace joined" and "Rose joined" banners come one after the other, never combined; the game spells "grey"; Tom's line about bosses hitting in a pattern is intended; Sunday Dinner and Sunday Roast Spread are two different moves; Grace and Rose call Tom "Tata" in speech, menus say Tom; lines without a recorded voice play in a synthetic voice. |
| R7 | **Anything else you notice** that looks broken (stuck movement, text cut off, wrong speaker name, a person walking on a roof, a softlock, a scene that skips) goes in section 7 "Other issues", with the same evidence rules. Do not let it stop the run. |
| R8 | If you get stuck for more than 5 minutes, write down where and what you tried, then use the top left Save button's LOAD (or the welcome screen LOAD and the autosave) to get back to the last good point. Mark the affected cards BLOCKED only if you truly cannot reach them. |
| R9 | Work in **portrait** unless a card says landscape. Switch with the keyboard key **L** or the rotate button; switch back to portrait after each landscape check. |

## 2. Setup

| Step | Do this | You should see |
|---|---|---|
| S1 | Open https://trivituso81.github.io/adventures-of-tom/ in Chrome. Set the window or device emulation to a phone in portrait, about 390 x 844. | The welcome screen with the family lined up. |
| S2 | Press **RELOAD** (left of ADMIN on the welcome screen) and wait for the page to come back. | "Reloading the game. Your saves are kept." then the welcome screen again. |
| S3 | Read the **build chip** at the top left of the welcome screen and write down its name and time exactly. | A name that is `b3s15` or newer (for example `voicepurge221`). If it says something older than b3s15, do RELOAD once more; if still older, stop and report it. |
| S4 | Press **START NEW**. In the top bar pick **MEDIUM**. Tap **CH 1**. | The chapter 1 opening plays (taxi arrival in the Square on Long Island). |

**Controls.** Keyboard: arrow keys or WASD to walk, **Enter** = A (talk, inspect, advance text), **M** = menu, **L** = portrait or landscape. Mouse: click on the map to walk there; click a person or object to walk to it and use it; click the on-screen A button and D-pad. The **!** button at the top left opens the quest log (current goal). The top left also has the **Menu** and **Save** buttons.

**Saves.** Before every card marked "save first", press Save and use a fresh slot, so you can LOAD and repeat that moment (needed for portrait plus landscape checks).

## 3. The route through Chapter 1 (where each card comes up)

Follow this order. The card IDs in the right column are the checks you do at that point (full steps in section 4).

| Stop | Where | What happens | Cards to check here |
|---|---|---|---|
| 1 | Welcome screen | Build chip | M-B (step 1) |
| 2 | The Square (start) | Opening, then Grace reads her list (numbers one to three), a close-up of the list, then the goal: Deedee and Boppy's house, south through the Rivituso Row arch. | C12 (Square part) |
| 3 | Rivituso Row | Amy calls down from her upstairs window. Optional: Aunt Ellie's door (bottom left of the Row) plays a short scene. | C12 (Row part) |
| 4 | Deedee and Boppy's House (on the Row) | **Save first, outside the door.** The muffin theft: Deedee, Boppy at the table, the Big Mudling hops in, knocks everyone, takes the twelve-cup pan off the kitchen island, runs out. Deedee joins. | C9, C3, then C6 after the scene |
| 5 | Grump Hollow (north of the Square) | Rose talks to three Mudlings at the gate; one fight with three Mudlings. | C1 leg 1, M-B fights |
| 6 | Grump Hollow, top left | The Bog Toad on the path. Fight. | C1 leg 2, C11 (item banner) |
| 7 | Grump Hollow, middle | The Log Lump. Fight. | C1 leg 3, C11 |
| 8 | Grump Hollow, anywhere | Skeeter Swarm and Pond Grump (optional fights). | C1 (negative check), C11 |
| 9 | Grump Hollow, east (Boppy's fishing spot) | Walking east starts the spot scene (grey grass, orange cube with a dragonfly, Deedee finds a burnt flashbulb, a splash), then the pond scene and the boss fight with **The Big One**, then the after-boss scene (Rose's BOO, the pan flies off, the Dragonfly Coin). | C10, C4 (during the after-boss scene), M-B (Big One length) |
| 10 | Grump Hollow, after the boss | Free to walk again. | C5, C7, C10 (part 2 already seen in stop 9) |
| 11 | Deedee and Boppy's House | Home scene: Boppy's gold teeth close-up, Tom says it's time to head back to LA. Goal: "it's Sunday. Head out the front door..." | C8, C11 (cookie from Deedee) |
| 12 | Rivituso Row | Grace gives Tom a job and her second best pencil. Goal: Cab 7 at the Square, talk to Sal. | M-B ends here |
| 13 | The Square, Long Island Taxi Co. | Talk to Sal, tap TO THE AIRPORT. TNB's text on the phone, the Chapter 1 card, the flight, landing in Los Angeles. | C2 |
| 14 | Optional, after the run | Admin Battle Lab fights. | A1 (appendix, only if time allows) |

## 4. The cards

Each card below is a real card on Tom's board. "Board card" is its id, "Build" is the build that made the change you are checking.

---

### C1. Play the Grump Hollow wrapper trail
Board card `t-hollowtrail-play` · Build `fix-hollowtrail-play-2` · Area: Grump Hollow

Background: after three specific fights, a short trail of muffin wrappers on the ground shows where to go next. Tom has rejected this three times (wrappers scattered everywhere, too many per trail, too small, invisible), so check the count, the place and the size carefully.

Steps:
1. Win the three-Mudling fight at the Grump Hollow gate (stop 5).
2. Right after it, read Grace's line and look at the ground. Screenshot the whole visible map. Walk along the trail and screenshot again near its end.
3. Go to the top left corner and beat the **Bog Toad** (the toad on the path). Repeat step 2.
4. Go to the middle of the clearing and beat the **Log Lump**. Repeat step 2.
5. Fight the **Skeeter Swarm** and the **Pond Grump** if you meet them. After each, look again.

Expected (all must be true):
- [ ] After the Mudling fight Grace says exactly: `3 wrappers, let's follow them!`
- [ ] Exactly **4** wrappers lie in a line from the gate to the **top left corner** (where the Bog Toad is). No other wrappers anywhere on the map.
- [ ] After the Bog Toad: Grace says the same line again; **4 new** wrappers lead to the **Log Lump in the middle**. The first leg's wrappers are no longer shown.
- [ ] After the Log Lump: Grace says the same line again; **4 new** wrappers lead **east** to **Boppy's fishing spot**. The earlier legs are no longer shown.
- [ ] Each wrapper is clearly visible against the ground (not cream on cream) and is small next to a person (Tom rejected wrappers "half the size of the characters"), but big enough to spot at a glance.
- [ ] The Skeeter Swarm and the Pond Grump fights change nothing: no line from Grace, no new wrappers.
- [ ] The goal popups match: after leg 1 "Goal: follow the muffin wrappers up to the top left corner...", then "...to the middle of the clearing, to the Log Lump.", then "...east, around the pond, to Boppy's fishing spot."

Report per leg: number of wrappers counted, where they start and end, Grace's exact words.

---

### C2. Check chapter 1 ends in the flight
Board card `t-ch1flight` · Build `fix-ch1flight` · Area: the Square, Long Island Taxi Co.

Background: Tom found that after TNB's text the girls and Deedee had a goodbye conversation. He wants it to go straight from the cab and TNB's text to the airplane.

Steps:
1. After stop 12, walk into the Square and into Long Island Taxi Co. Talk to **Sal**.
2. Read the choice box and tap **TO THE AIRPORT**.
3. Watch without pressing anything except to advance text. Screenshot each stage.

Expected (all must be true, in this order):
- [ ] Sal's box reads `Tom! Cab seven is at your service. Where to?` with the choices TO THE AIRPORT and JUST VISITING.
- [ ] Sal answers `Los Angeles? You got it.`
- [ ] The screen fades; a picture of a phone lighting up on the cab seat appears, and it **stays on screen while** TNB's text is shown: `hey babe. safe flight. the smog over 2nd ave turned purple this morning. it'll probably blow over.`
- [ ] Then the **Chapter 1** card (chapter complete).
- [ ] Then the flight plays straight on: seat, takeoff, map, landing.
- [ ] **No** dialogue from Grace, Rose or Deedee (no goodbyes) anywhere between TNB's text and the landing. No stop or walk in the Square.
- [ ] You land in **Los Angeles** (chapter 2 begins).

---

### C3. Look at Boppy's cap when he turns left
Board card `t-qa-bug12c-play` · Build `qa-bug12c` · Area: Deedee and Boppy's kitchen (stop 4)

Steps:
1. During the theft scene, watch Boppy. He sits with his back turned until he says `...Wait, where'd the muffins go?`, then turns left.
2. Screenshot Boppy every time he faces left, and any time he looks shocked or points.

Expected:
- [ ] Whenever Boppy faces left, the lettering on his cap reads **Paso Robles** the right way round (readable left to right, not mirrored).
- [ ] The same when he is shocked or pointing.
- [ ] Note any frame where he briefly goes blocky or blurry as a talk starts (that was a related report; it goes in section 7 if seen).

---

### C4. Check the buttons are gone during cutscenes
Board card `t-qa-bug08play` · Build `qa-bug08` · Area: Grump Hollow, after-boss scene (stop 9)

Steps:
1. From the moment the Big One fight is won until the after-boss scene ends (Deedee picks up the empty pan and the goal "Take the pan home to Rivituso Row." shows), watch the screen edges between every line.
2. Screenshot at least three moments mid-scene, including one between two lines, and one just after the scene ends.

Expected:
- [ ] Between lines, no **HOLD + SLIDE** label flashes (that is the on-screen D-pad hint).
- [ ] The top left **!**, **Menu** and **Save** buttons are **not** on screen at any time during the scene.
- [ ] They **come back** once the scene ends and you can walk again.

---

### C5. Check the orange cube after the boss
Board card `t-qa-coh06play` · Build `qa-coh06` · Area: Grump Hollow, by the pond (stop 10)

Steps:
1. After the after-boss scene, walk back to the orange cube (with the dragonfly inside) on the grey patch by the pond.
2. Face it and press A. Read every box until it closes.

Expected:
- [ ] Only **one** box, spoken by **Tom**, reading exactly: `Still stuck. The fish got the pan out, but the cube won't budge.`
- [ ] No other speaker (no Rose, no frog or Tom portrait flashing under another name) and no second box.

---

### C6. Check the Menu button near the Cookie counter
Board card `t-bug12play` · Build `qa-bug12` · Area: Deedee and Boppy's House

Steps:
1. Inside Deedee and Boppy's House with free movement (right after the theft scene ends is fine; or at stop 11), stand a few steps away from the **Cookie counter** (left side of the kitchen, the counter with a cookie jar labeled DO NOT).
2. Click (tap) the Cookie counter so Tom starts walking to it, and **before he arrives** click the **Menu** button at the top left.
3. Close the menu. Repeat once more with the **Save** button instead of Menu.

Expected:
- [ ] The Menu opens.
- [ ] The counter is **not** inspected (no "A cookie jar labeled DO NOT..." box appears, before or after the menu).
- [ ] Tom stops walking toward the counter.
- [ ] Same result with the Save button.

---

### C7. Check the Inspect prompt at Boppy's pond
Board card `t-qa-txt04-play` · Build `qa-txt04` · Area: Grump Hollow, Boppy's fishing spot (stop 10)

Steps:
1. Walk up to Boppy's fishing spot (the folding chair, east end of the pond) until the prompt appears at the bottom of the screen. Screenshot it.
2. Find any other inspectable thing whose name starts with "the" (anywhere in chapter 1) and screenshot its prompt.

Expected:
- [ ] The prompt reads `A · Inspect Boppy's fishing spot` with a capital **B** (it used to say "boppy's").
- [ ] A name that starts with "the" still shows a lowercase "the" (`A · Inspect the ...`).
- [ ] Pressing A shows: `A folding chair with a thermos on the seat, a bucket, one bass. Boppy will tell you it was two feet long. It was not.`

---

### C8. Check the quest log after the trip home
Board card `t-qa-bug01play` · Build `qa-bug01` · Area: Deedee and Boppy's House (stop 11)

Steps:
1. Play the home scene to its end (Tom: "Alright, time for me to head back to LA. Let's head to Sal's!").
2. Tap the **!** button. Screenshot.

Expected:
- [ ] The quest log reads `It's Sunday. Head out the front door. Cab 7 is waiting at the Square.`
- [ ] It does **not** start with "Go to" (the old bug read "Go to it's Sunday...").
- [ ] While you are at it, open ! once at every other stop and write down its exact text; any line starting "Go to" followed by a full sentence goes in section 7.

---

### C9. Look at the muffin pan when you walk into Deedee's house
Board card `t-qa-coh07play` · Build `qa-coh07` · Area: Deedee and Boppy's House (stop 4)

Steps:
1. **Save first**, outside the house door, in portrait.
2. Walk in. Screenshot the kitchen island the moment the room appears, **before Deedee speaks**.
3. Watch the scene to the moment the Mudling takes the pan. Screenshot just before and just after.
4. LOAD the save, switch to **landscape** (L), walk in again, repeat steps 2 and 3. Then switch back to portrait and let the scene finish normally (you may LOAD again and replay it in portrait to continue the run).

Expected, in portrait **and** landscape:
- [ ] The **twelve-cup** muffin pan (twelve muffins) is on the kitchen island from the first frame, before any dialogue.
- [ ] The Mudling hops onto the island and lifts that same pan; the pan leaves the island when it is over the Mudling's head, and a few crumbs are left.
- [ ] After the theft no pan or muffins stay drawn on the island.
- [ ] In landscape, Deedee's head and the island are not cut off by the screen edge.

---

### C10. Look at Boppy's folding chair at the pond
Board card `t-qa-coh03play` · Build `qa-coh03` · Area: Grump Hollow, east end (stop 9 and 10)

Steps:
1. When you first reach Boppy's fishing spot (end of the third wrapper leg), screenshot the spot before the scene starts, and again after the boss when you can walk freely. Zoom your screenshot in if you can.
2. In the after-boss scene, read the Big One's lines.

Expected:
- [ ] A **grey metal folding chair** stands where a wooden bench used to be. **No bench** remains.
- [ ] Boppy's **thermos is on the chair seat**, his **bucket is on the ground to the left** of the chair, his **fishing rod leans on the chair back**.
- [ ] The pond edge behind the chair looks like water and mud (no leftover bench shape or smear).
- [ ] The chair does not look pasted on, too dark or too small next to the people. If it does, say which of those three.
- [ ] In the after-boss scene the Big One still says `The man in the folding chair. Will he be back?`

---

### C11. Read a few item banners
Board card `t-itemdefplay` · Build `itemdef1` · Area: anywhere you get an item

Background: when you get an item, an ITEM GAINED banner appears. Monsters that drop items in chapter 1: Bog Toad (lily pad hat, always), Log Lump (bark slab, always), Pond Grump (soggy green hoodie, always), Mudling (mud pie, sometimes), Skeeter Swarm (honey, sometimes), The Big One (Boppy's lure, always). The Dragonfly Coin is given in the after-boss scene. Deedee gives a **Cookie** when you talk to her as a townsperson (at stop 11 in her kitchen, or wherever she stands; she heals the party too).

Steps:
1. Read at least **five** different banners, including one KEY ITEM (Dragonfly Coin) and the Cookie. Screenshot each.
2. Turn on **landscape** for one banner and screenshot it. Back to portrait.

Expected, for every banner:
- [ ] The item's **picture in a square at the top left** (in landscape: the picture on the **left**).
- [ ] The item **name** with a **brown type chip** next to it (RECOVERY ITEM, KEY ITEM, and so on).
- [ ] The **description in italics**.
- [ ] Then an **IN BATTLE** section and an **IN STORY** section.
- [ ] `Tap or press A to continue` **inside** the card.
- [ ] Text reads well: no line cut off, nothing overlapping, no placeholder text. For each banner write the item name and say whether each line is clear and whether the jokes land (Tom asked: "Something is wrong if any line is wrong, unclear or not funny (say which item)"). Copy any line you flag word for word.

---

### C12. Look for people on roofs in the Square and the Row
Board card `t-qa-bug03-look` · Build `qa-bug03` · Area: the Square and Rivituso Row (stops 2 and 3, and again at 12 and 13)

Steps:
1. When you have free movement in the Square, stand still where you can see the SNAIL MAIL sign and KETTLE COTTAGE and watch the walking townspeople for **one full minute**. Take a screenshot every 15 seconds.
2. Do the same on Rivituso Row where you can see **Aunt Ellie's House**, for one minute.

Expected:
- [ ] Nobody walks onto the **SNAIL MAIL** sign.
- [ ] Nobody walks onto **KETTLE COTTAGE's roof**.
- [ ] Nobody walks onto the edge of **Aunt Ellie's House**.
- [ ] Note any other person standing on a roof, sign, wall or in water (section 7).

---

### M-B. Milestone B: play chapter 1 on the new battle system
Board card `t-milestoneb` · Build `b3s15` · Area: the whole chapter (this card is a judgment call, not a pass or fail)

Background: chapter 1's fights now run on a new battle system. Tom wants a player's view of the **mechanics only**: not the animations. Claude's next battle stage (c-b3s17) waits on these notes.

Steps:
1. Step 1 is setup S3: confirm the build chip is b3s15 or newer.
2. Play every chapter 1 fight normally, without grinding. For each fight write: the enemies, the number of rounds (one round = everyone on the turn bar has acted once), whether anyone was knocked out, and how long it took in minutes.
3. Look at the battle screen in portrait in every fight, and in **landscape** in at least one normal fight and once during the Big One.
4. Count the **rounds of The Big One** precisely. If you lose, note it and count the retry separately.

Answer each question with a rating from 1 (bad) to 5 (great) and two or three sentences of reasons with specific examples:
| # | Question |
|---|---|
| Q1 | Are the fights fun? Is there a real choice each turn, or is the best move always the same? |
| Q2 | Is the pace right? Any fight that drags, or any wait between turns that feels long? |
| Q3 | Can you read the screen in portrait and in landscape: HP, the turn bar (who acts next), the command menu, damage numbers, status effects? Name anything hard to read or overlapping. |
| Q4 | The Big One: how many rounds did it take? (Designed for 5 to 7 rounds at Rank 1; measured at 7.83.) Did it feel too long? |
| Q5 | Do the family's moves feel like them (Tom calm and game-themed, Grace bright and bossy, Rose silly, Deedee the caring nurse and baker)? Name any move that feels off for its character. |
| Q6 | Did the first fight teach you what you needed (the "basics" tutorial)? Anything confusing? |
| Q7 | Any bug in battle: a turn that never comes, a menu that will not close, a number that makes no sense, a fight that does not end. |

---

### A1 (appendix, optional). Watch the chapter 1 fights in videos
Board card `t-wanch1-watch` · Build `wanch1` · Area: ADMIN > BATTLE LAB (not part of the story run)

Only do this after the story run, if you still have time. This is an animation check, so rule R5 does not apply here.

Steps:
1. Back on the welcome screen press **ADMIN**, then **BATTLE LAB**, then **NEW BATTLE**.
2. Play **NEW 1** (TWO MUDLINGS) to the end, then **NEW 2** to **NEW 6** the same way (about 2 minutes each).

Expected:
- [ ] The family stand, breathe, guard, get hit, fall, cheer and run as **video** (smooth motion), not as still paintings.
- [ ] The Grump, Toad, Log and Skeeter **attack as video**.
- [ ] **Dodge** and **cast** are still the old painted poses: this is on purpose. Do not report it.
- [ ] Per fight, note any clip that jumps, slides off its spot, changes size suddenly, flickers, or shows a background colour (magenta) around a figure.

## 5. Out of scope

Do not test or report on: the Art Library, Voice Library or Music Library cards (pictures and voices Tom approves himself), Project setup cards, chapter 2 and later (stop when you land in Los Angeles), the quality of recorded voices, and animation quality in story fights (rule R5).

## 6. Report format (return exactly this)

### 6.1 Run metadata
| Field | Value |
|---|---|
| Date and time of the run | |
| Build chip (name and time, exact) | |
| Browser and viewport size | |
| Difficulty | MEDIUM |
| Reached the end (landed in Los Angeles)? | yes / no (where it stopped) |
| Total play time | |

### 6.2 Verdicts (one row per card, in this order)
| Card | Board card | Verdict | What I saw (one or two lines, exact text quoted) | Screenshots |
|---|---|---|---|---|
| C1 | t-hollowtrail-play | | Leg 1: n wrappers, from ... to ...; Leg 2: ...; Leg 3: ...; Grace's words: "..." | |
| C2 | t-ch1flight | | | |
| C3 | t-qa-bug12c-play | | | |
| C4 | t-qa-bug08play | | | |
| C5 | t-qa-coh06play | | | |
| C6 | t-bug12play | | | |
| C7 | t-qa-txt04-play | | | |
| C8 | t-qa-bug01play | | | |
| C9 | t-qa-coh07play | | portrait: ...; landscape: ... | |
| C10 | t-qa-coh03play | | | |
| C11 | t-itemdefplay | | items read: ... | |
| C12 | t-qa-bug03-look | | | |
| M-B | t-milestoneb | (ratings) | Q1 n/5 ... Q7 | |
| A1 | t-wanch1-watch | or NOT RUN | | |

For every FAIL, add under the table: the card, the exact expected item that failed (copy the checkbox line), what you saw instead, and the screenshot name.

### 6.3 Milestone B fight log
| # | Fight (enemies) | Where | Rounds | Knock-outs | Minutes | Notes |
|---|---|---|---|---|---|---|

### 6.4 Quest log texts seen
| Stop | Exact ! text |
|---|---|

## 7. Other issues

| ID | Severity (P0 softlock or crash, P1 wrong or broken, P2 cosmetic) | Where (map and moment) | What I saw | Screenshot |
|---|---|---|---|---|
| X-01 | | | | |

Keep each issue to one observed fact. Do not suggest code fixes.
