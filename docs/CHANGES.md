## t-lastnight (2026-11-22): Last night's Needs you lines now say what to do, not only the card's name

Tom (11-22): "The what to do doesn't tell me what to do". `tools/night/lastnight.py` (`_need`) now writes each Needs you line as the card title plus that card's own exact steps (cut at 260 characters, full steps on the card). Not done: the older `t-board_sync_test.py` crash on `c-board3` (archived card) is not from this change.

## startpics1 (2026-11-22): the Battle Guide can make the start picture for Amy, Boppy, Justin, Olivia, TNB and Nara, which turns on their video buttons

Card c-startpics. Tom: "I'm unable to generate any animations for characters who don't have that hero image in place, so I need that unblocked." Cause: a person's battle video starts from one picture of them facing left on flat magenta (`art/clips/start/<who>-hero.png`), and only Tom, Grace, Rose and Deedee had one, so the Guide said Cannot be made yet for everyone else. How the four were made, found in the repo: not a cutout. The approved hero picture is redrawn by Nano Banana 2.1 on fal (`start-<who>` job, prompt `hero-leftfacing-magenta-v1.txt`), then Wan 3.0 takes it as first and last frame; the cutout of the finished video happens later in the bake. Built: (1) `start-amy`, `start-boppy`, `start-justin`, `start-olivia`, `start-tnb`, `start-nara` jobs in `wangen-jobs.json` from the newest hero picture of each (Nara has her own prompt, `hero-leftfacing-magenta-dog-v1.txt`: standing on four paws); (2) `tools/art-library/startpic.py`: the wan-gen Action's `--requests` run now also handles `{startpic, take, at}` requests, makes the picture ($0.15), measures it (flat magenta, whole figure inside the frame, tall enough), has the xAI vision model look at which way it faces (three runs, majority) and mirrors it when it faces right, as Grace's was, and only then commits `art/clips/start/<who>-hero.png` and a rebuilt `data/guide-anims.json` to main; a picture that fails is kept on branch `wangen` and never published; (3) Battle Guide: an animation of a person with no start picture shows Make the start picture ($0.15, two taps) next to Cannot be made yet, and says plainly what happened; (4) `tools/guidegen/figrows.py` and `figrows.json`: the sprite height each person's clips are cut at (Amy 99.5, Boppy 66.8, Justin 93, Olivia 105, TNB 100, Nara 84; the four existing ones come out identical to the Art Library's), used by `build_map.js` when a person has no clip entry, because without it the Guide would still say a take cannot be cut. Not done: Michael has no battle kit or battle sprite, so he is not in the list; no picture was made (a session never pays; the first one is Tom's tap). Test: `python3 -I tools/art-library/startpic_test.py` (26 checks). Known, not mine: `tools/guidegen/build_map_test.py` had 5 failures before this build (4 remain: video provenance and job matching) and `tools/battle_guide_test.py` times out waiting for a Giddyup row in the plan view; both fail the same way on main without this change.


## guidestuck1 (2026-11-22): Battle Guide videos no longer stall at CHECKING, and a lost run no longer loses the paid videos

Card c-guidestuck1. Tom (06:53): "Creating animations within the battle guide seems to not be working at all. I requested these last night and I hung overnight and nothing happened." Cause (fact, from the run records): at 08:23 to 08:26 UTC he asked for 10 videos; GitHub dropped 9 waiting runs and the one that ran, wan-gen run 45002823299, made all 10 on fal (CHECKING marks 08:31 to 08:48), then its runner was lost during the Make the takes step ("The hosted runner lost communication with the server", 09:40, 72 minutes in; one take normally takes 40 seconds). The videos, the results file and the money ledger were still only on that runner, so nothing was kept and the Guide's status file stayed at checking forever. What the step did inside the 50 minutes cannot be read (GitHub keeps no log for a lost runner); the most likely cause is a look check to xAI that never came back (3 tries of 180 seconds each, per check, per video). Fixes: (1) `tools/guidegen/make_take.py` runs each video in its own process with a 7 minute limit; a hung or killed look check is dropped and the same video is made again with the measured checks only; if that fails too the take is recorded as failed with the reason, so the page says so and offers Generate again. (2) `wan-gen.yml` saves the results, videos and ledger to branch `wangen` right after Make it, before any check, and the takes step has a 40 minute limit with the keep steps still running after it. (3) `wangen.py` writes `guide-results.json` after every video, not once at the end. (4) `battle-guide.html` shows STALLED in red when a video has sat at IN LINE, MAKING or CHECKING for 90 minutes. Test: `tools/guidegen/take_test.py` T3b (a look check server that never answers; both takes still made, run finishes). Not changed: `tools/costs2_test.py` (balance estimates) and `tools/battle_guide_test.py` (Plan view, Giddyup row) already failed on main before this change.

## battleux3 (2026-11-22): the new battle screen shows each monster's Pet Peeves as badges under it, Rose Mode gets pictures on the new deck, and the proposal page is gone

- **Pet Peeve badges on the scene** (`b3PeeveBadges`, `engine/b3-play.js`): under each monster's HP bar and Composure pips, one pill per Pet Peeve, the flavor's color circle and its word (Razzle, Racket), colors read from the menu's variables in m2.css. Shown whether DETAILS is on or off. The tray no longer says the target's Pet Peeves (they were a detail there); the tapped-unit view still lists them because the player asked to see it. The HP meter is lifted 13 px for a monster standing at the bottom edge so the badge row fits.
- **Left out on purpose** (b3look found them to be repeats): the aim marker's PET PEEVE tag, MARKED and NEXT TARGET over a unit. The Pep forecast was already built in the deck header and is not added again.
- **Rose Mode on the new deck** (`engine/b3-deck.js`, `b3-deck.css`, words in `data/b3-ux-words.js`): each move shows its flavor as the emoji picture, its price as drops on the kind line (the number stays), and the recommended move (`b3Rec`) gets a star with the words "Try this" next to the existing gold glow. Nothing is added in normal modes. DETAILS off still hides the plain line.
- **Removed**: `battle-ux.html`, the `battle-ux/` pictures and the Battle screen redesign (proposal) button in Admin. `claude/battleux-plan.md` and `claude/battleux-mock/` stay. (`admin_hub_test.py` has two failures, "one link per fight" at 390 and 844 px, that were there before this build.)
- **Tests**: `tools/b3_layout_test.py` now checks, at every size and turn, that each live monster's badges are exactly its Pet Peeves (DETAILS on and off), the tray does not repeat them, and a Rose Mode pass (DETAILS off and on) that every move has a picture and drops, the recommended move is starred, and no detail shows. Frames: `tools/shots/b3-layout-<size>-f5.png` (badges under both Mudlings and The Big One) and `b3-layout-<size>-rose0.png` / `-rose1.png` (Rose deck).
## fix-menu4play-4 (2026-11-22): Party tab: name, level and green bar now sit above the HP, above the pictures

Card c-fix-menu4play-4, from t-menu4play. Tom: "On the party tab, you only moved the HP to the top that you were also supposed to move the character name and level which of course is what's supposed to be at the top above the HP". Fix 3 had moved only the HP. Each person's top line is now the name, then Level and the green bar, then HP, all above the pictures (`m2Page` in `engine/m2-family.js`, `.m2-hd` in `m2.css`). The cards under the pictures keep the Vibe name, stars and Front or Back row. Nothing else changed. The two pencil reports open on 2026-11-22 are about chapter 2 scenes, not this menu, and stay open.

## b3looka (2026-11-22): the new battle screen's styles and scripts now carry a new cache tag, so phones load the new look

Tom saw the old battle look after b3look. Cause: a push in the middle of a rebase put the b3look files on main before the tag bump, so `b3-deck.css`, `m2.css`, `engine/b3-deck.js`, `b3-play.js`, `b3-ui.js`, `b3-core.js`, `b3-ruckus.js`, `b3-menu.js`, `b3-skins.js`, `b3-story.js`, `m2-vibes.js` and the words file kept their old `?v=` tags and the phone's cache served the old files. Tags only; no code changed.

## b3look (2026-11-22): the new battle screen takes the new menu's look and shows every fact once; Details hides the details everywhere

Card c-b3look. Tom (11-21 23:56): use the new menu's design for all the battle controls, "everything from colors to backgrounds to font styles", remove extraneous information, a Details switch that hides the details "from like everything, literally", labels against icons, color only when it means something, like facts together, "avoiding redundant information most of all". Plan, inventory and rules: `claude/b3look-plan.md` (written before the code changed). New battle only; battle 2 is untouched; no rule or number changed (`node tools/b3-sim.js check`: 3587 checks before and after, FAILS []).

| What | Before | Now |
|---|---|---|
| Look | Navy panels, gold borders, serif and Trebuchet type, small caps | The menu's: plum dusk frame and turn bar, paper pages for the party, the moves and the strip under the scene, plum ink, Bricolage Grotesque and Figtree, pill chips, the menu's switch, an ink Use button. The colors are the menu's own variables, declared once in `m2.css` for both (`#m2, #battle.v3`) |
| Color | Many tints | Five meanings only: flavor colors, green good for you, coral danger or can't, lamplight what you picked (highlighted move, aimed card, aim arrow), gold for Combos and big results |
| Strip under the scene | Move name, price, flavor, kind, reach chips, why it can't be used, then the target's HP bar and number, Composure, statuses, Pet Peeves, Pet Peeve +50%, pushes, next turn | What the move does (one plain line; Details on: the full description and its size), then who it is aimed at and what it does there (damage, knocks out, BREAK, sets off, cancels, heals). Details on adds Composure lost, statuses it leaves and the target's Pet Peeves |
| Move rows | Name, price with a bolt, flavor picture, flavor word in caps, BASIC, PET PEEVE | Name, flavor circle with "Racket basic" or "Clobber skill" beside it (the menu's words), price as "3 Pep", Pet Peeve (for the highlighted move it now says whether the aim hits one). Details on: the one plain line on every row but the highlighted one |
| Party cards | Face, name, statuses, BACK, HP, Pep pips for everyone | Face, name, HP bar and HP, Marked or Next target. Details on: Pep (not for whoever is up: the Pep over the moves is theirs), statuses, Back, the counter, max HP and shield. Upright phones show the bar without the number (the cards are a quarter of the width) |
| Scene | Status words over monsters, MARKED and NEXT TARGET and a white turn arrow over family members | Status words over monsters with Details on only; nothing over family members but the aim arrow |
| End | "The family wins!" under YOU WIN!, moves still listed | Only what the win paid and Continue; no moves |
| Words | RUCKUS, Family Ruckus, Full Family Ruckus, Main, Pocket, DETAILS, USE, CONTINUE | Combos (gauge and group), Double Team, Family Ruckus, Primary, Secondary, Details, Use, Continue (Tom's words of 11-22 on the menu, card c-fix-menu4play-3). A Combo row says who it is with. The story tip and the victory card's foot say Combos |
| Details switch | Its own saved setting | One saved setting with the menu's skill description switch (`M2_DET_KEY`); nothing saved: on for a wide desktop window, off elsewhere |
| Victory card in story fights | Navy | Paper card on a dusk veil, the menu's type (shared markup with battle 2, so only the look changed, only under `#battle.v3`) |

- Purged: the battle screen's own color set (`--bx-*`), the reach words `B3_REACH`, the forecast words no longer said (next turn, pushes and pulls, Composure count, wind-up, low Pep sentence, Pocket chip), `b3NextText`, `bxUnitHead`, `bxUnitSub`, the old saved key `aot-ux-details`.
- `b3RuckusName` (the move's name the rules carry) now says Family Ruckus, and the reason lines say "The Combos gauge"; no number changed.
- Tests: `tools/b3_layout_test.py` now also fails when Details off shows any detail in the strip, the party or the moves, when the scene writes a monster status with Details off or MARKED or NEXT TARGET at all, when the strip repeats the move's name, flavor, an HP bar, a Pet Peeve, pushes, the next turn, Composure, a wind-up or a Mark, when the card of whoever is up repeats Pep, and when the end shows "wins" or moves. All seven sizes pass. `tools/b3_test.py` wording checks moved to the new words (the strip says what the move does instead of its name; Free Skill for Rose; Family Ruckus; the shared Details key).

Before and after, Duo unfolded (951 x 648) and iPhone upright (393 x 852), a Skill highlighted, Details off:

![Duo before](frames/b3look/duo-before.jpg) ![Duo after](frames/b3look/duo-after.jpg)

![iPhone before](frames/b3look/iphone-before.jpg) ![iPhone after](frames/b3look/iphone-after.jpg)

## wanstop-tom-blockade-r4 (2026-11-22): Tom's Zone One Blockade video (rev 4, first try) is accepted and put in the game

Card c-wanstop-tom-blockade-r4. Looked at both rev 4 videos' frames: Tom holds both arms out with open palms like a gate, shifts his weight to the left, holds, then lowers his arms back to the relaxed stance. The first try passed every measured check (height, feet, flat background, edges, last against first). The only miss was the strict look check p1 asking for a clear hip bump; the second try also touched the right edge once. Per wanpurpose1 (the move's purpose and theme are met) the first try was accepted and no new try started: baked with the job's own settings by `wanbake.bake` (`art/clips/tom-blockade.webp`, `data/clips/tom-blockade.js`), `zone_one_blockade` already plays `tom_blockade`. Nothing was generated or spent. The watch card `t-wanwatch-tom-blockade-0522` asks Tom to look.

## wanstop-tom-rose-giddyup-r1 (2026-11-22): Tom and Rose's Giddyup video (rev 2) starts smaller so Rose's leap clears the edge

Card c-wanstop-tom-rose-giddyup-r1. Looked at rev 1's frames: Rose hops onto Tom's shoulders, raises a fist, springs off and lands crouched in front of him, so the move reads. It failed two checks: feet 1.1 percent over the 1 percent limit at the landing, and the figure touched the edge in video frames 86 to 87 during her leap. Kept: prompt, start picture, bake, endpoint, seed. Changed one thing: `pad` 0.65 to 0.55 (job `tom-rose-giddyup`, rev 2) so the pair has more room. Next try started by `wgen` on t-pairmove1-gen. Nothing for Tom.

## b3s20 (2026-11-22): Character Level by shared XP on the new battle, with the chapter 5 to 10 XP amounts retuned in data

Card c-b3s20 (battle system stage 20). Fact: Battle 3 already pays and shares XP through the old code (`b3sAward` in `engine/b3-story.js` calls `b6BattleXp`, `b2GainFor` (which calls `b6GainXp`) and `b6Sync`, so everyone catches up to Tom after a fight), so no engine code changed. What was wrong was data: the 24 regular monsters of chapters 5 to 10 had no row in `B6_XP` and paid the flat fallback, so those chapters paid 204 to 230 XP a chapter against level floors that climb about 2.7 levels (270 XP) a chapter. Rows added in `data/progress.js`: chapter 5 monsters 20 each (260 XP a chapter), chapters 6 to 10 monsters 17 each (270 XP a chapter). Chapters 1 to 4 (about 300) and the bonus chapter were left alone. These monsters share the table with Battle 2, so the same fights pay the same there. Tests: `node tools/b3-sim.js check` 4049 FAILS []; `python3 tools/b3_test.py s4` FAILS []; `python3 tools/b3_story_test.py` FAILS [] (a fresh save and an old save load, chapter 1 plays). Not done: the roster was not looked at in portrait and landscape (no engine or screen change; the browser tool here could not render the Family page).

## b3s19 (2026-11-22): the third Vibe of each of the ten characters is in Battle 3 (40 new moves, 20 Quirks), and old saves load it at 0 Vibe Points
Card c-b3s19. Built: ten Vibes (Star Baker, Stage Performer, Prankster, SuperMom, Home Cook, Boat Angler, Scream King, Picky Princess, Armchair Ref, News Anchor) as rows in `data/b3-kit-*.js`, 32 statuses, ops extend, swapGap, replay, invert, and the engine seams they needed. No migration of old saves. Battle 2 untouched. The Battle Guide no longer lists them as planned (`guide-planned.json`, `guide-anims.json` rebuilt; `guide_planned.py` keeps chapters 11 to 20 listed). The plan's "four in a conversation" is not a game rule anywhere, so none was built; every move is tested in four-member parties. Tests: `node tools/b3-sim.js check` 4049 FAILS []; `python3 tools/b3_test.py s4` FAILS []; a Lab fight per Vibe; Vibes screen looked at in portrait and landscape. Facts: docs/BATTLE3.md "What stage 19 holds".

## b3s16 (2026-11-22): The Tombos are back in the new battle as named skins on the Full Family Ruckus

Card c-b3s16 (battle system stage 16). When two family members fire a Full Family Ruckus on Battle 3 and a Tombo skin is live for that pair, the tray row and the big word on the stage read the skin's name (Squishy Delivery, Wine and Gossip, Tom Cooks for Mom...) instead of "Full Family Ruckus", and the pair's recorded Tombo lines play. The result is unchanged (both top Skills); a skin carries no numbers and no animation of its own (the two moves play their own video or the default animation, as any Full Family Ruckus does). No animation review was asked of Tom (standing rule).

- `data/b3-tombo-skins.js` (new): 26 skins, the 21 Primary Tombos, the 4 Family Finishes and Birthday Wish, each with battle 2's id, its story flag (`tombo:<id>`), the pairs who fire it and the recorded lines it plays. `engine/b3-skins.js` (new, play layer): the live skin for a pair is the highest tier unlocked; in a Battle Lab fight every skin counts as unlocked. `engine/b3-play.js` (the `ruckusSpend` beat) and `engine/b3-deck.js` (the row's name) use it. The rules files and every battle 2 file are untouched.
- The 11 "New Tombo" toasts of chapters 1 to 10 and the bonus chapter's "Tombos ready" toast (hidden under Battle 3 since stage 15) now have a Battle 3 version that names the skin and says when it shows; Birthday Wish gets one when `tombo:wish` is set. The battle 2 versions still show under OLD.
- Calls made (full table in claude/battle-build.md "Calls made in stage 16"): all 26 kept (no Move Lab review); the card's "22 Primary Tombos" are 21 Primaries plus Birthday Wish; Family Finishes are live only for the pair who speak in them; TNB tier 2 is named Red Line Transfer and Amy tier 2 Ymamot Creation, matching their recordings; Boppy tier 1 uses Tom's `tombopier` line.
- Tested: `node tools/b3-sim.js check` (CHECKS 3863, FAILS [], the new `tools/b3-check-s16.js`: table against battle 2's ids and flags, every line exists, the choosing rule, the toasts, load order, no skin code in the rules files), `python3 tools/b3_test.py s16` (new: a Lab fight in portrait and landscape, a pair with no skin keeps the plain name, a Tom pair shows its skin on the row, the tray and the stage and speaks its two lines in order; looked at the frames in `tools/shots/b3-s16.png` and `b3-s16-land.png`).

## fix-menu4play-3 (2026-11-22): Menu: Party tab, name beside the bar, HP above the pictures, Primary and Secondary, tap twice to pick

Tom's report on t-menu4play: tab renamed Party; name level with the green bar and HP above the pictures; the Vibe name bigger; the gauge reads Combos with Double Team and Family Ruckus; the switch reads Show skill descriptions and, off, hides the whole description; Main and Pocket became Primary and Secondary; the mastered note is gone; tapping a Vibe once shows the +/- on Health, Attack, Defense and Speed, tapping it again makes it Primary.
## battleux2 (2026-11-21): every family move now has one plain line that says what it does

Card c-battleux2. Wrote a `short` line (60 characters at most) on all 80 family moves of the 10 members in `data/b3-kit-*.js`, plus Pick-Me-Up in `data/b3-rules.js`. The new battle screen shows it under each move when DETAILS is on, and in the strip on a phone held sideways (where the strip has room for one line instead of the full description). Rules and numbers did not change; these are not spoken lines, so nothing to bake.

- Started from the mock's drafts for Tom, Grace, Rose and Deedee: 7 kept word for word, 18 reworded to drop formulas (percent signs, "debuffs", "crit") or fix what they said ("burns" on moves that do not burn). Words used for a kid: "boosts" for buffs, "bad effects" for debuffs, "attack up close" for melee. Status and game words the screen already shows (Pep, Composure, Pet Peeve, Toasty, Dazzled, Drenched, Cadence, Reps) stay.
- `data/b3-ux-words.js`, words only: reach of a floor move "The monsters’ floor" is now "The whole floor" (Grand Amphora sits in front of the family, so the old words were wrong for it); "Composure -2 (4 of 6 left)" is now "Composure down 2, 4 left"; "Comes sooner by N on the turn bar" is now "Moves up N on the turn bar"; "Nothing to aim" is now "No aim needed"; "Not a target for this move" is now "This move can’t aim here"; the two Ruckus lines no longer say "+50% power" or "fire". I tried "Pet Peeve: 50% more", "Heals N HP" and "Shield of N" too: the longer chips made the strip overflow on the Duo (layout test, The Big One), so those three stay as they were.
- New data check: `node tools/b3-sim.js check` fails on a family move with no short line, one over 60 characters or one with an em dash (tested by breaking one line: it failed, then passed again).
- Tested: `node tools/b3-sim.js check` (3587 checks, FAILS []), `python3 tools/b3_layout_test.py` (all seven sizes; the Duo again after the chip fix), `python3 tools/b3_test.py` for fights new1 to new6 and the stage 3 and stage 7 sections (all pass; the full 66-fight run takes hours and was stopped there), `python3 tools/smoke.py`. Looked at the Duo unfolded with DETAILS on and off (two Mudlings, The Big One with Amy, Justin and Olivia) and the iPhone upright.
- Seen and left alone: on the iPhone upright the strip shows the first 2 lines of the full description (a tap on the strip opens the rest), as battleux1 built it.
- Also removed a leftover merge marker line (`>>>>>>> 15a84a83`) at the top of this file from an earlier push.

The full list:

**Tom** (draft: kept, changed, or new where the mock had none)

| Move | Line | Draft |
|---|---|---|
| Lounge Pass Flex | Light hit. Monsters aim at Tom more. | kept |
| Zone One Blockade | For 2 turns, Tom hip-checks any monster that hits him. | changed |
| Suite Door Slide | For 2 turns, Tom takes hits for the family beside him. | changed |
| Tarmac Porsche Transfer | Heavy hit on every monster. Then they all aim at Tom. | changed |
| Cartridge Blow | Light hit. Shows who the monster will attack next. | new |
| Controller Toss | Hit. Stronger if Tom just took a hit. | changed |
| Winged Shell Lock-On | Hit. If it attacks before Tom’s turn, the shell explodes. | kept |
| Konami Code | Heavy hit on every monster. Knocks 2 Composure off each. | changed |

**Grace** (draft: kept, changed, or new where the mock had none)

| Move | Line | Draft |
|---|---|---|
| Soup-Dumpling Squeeze | Light hit. The next family member to hit it gets 1 Pep. | changed |
| NeeDoh Stretch Pass | Pulls one family member up to act right after Grace. | kept |
| Crunchy Sugar-Cube Pop | Light hit. Stops the move it’s winding up, pushes it back. | changed |
| Colossal Diamond-Gold Dumpling | One family member uses a Skill right now, free. | kept |
| Glitter-Brush Flick | Light hit. Leaves the monster Dazzled. | new |
| Open-String Violin Screech | Hits every monster and makes them weaker for 2 turns. | changed |
| Bedazzle-Gun Glue Trap | For 2 rounds, monsters that move take a hit and wait longer. | changed |
| Masterpiece Portrait Makeover | Heavy hit. Razzle becomes its Pet Peeve. | kept |

**Rose** (draft: kept, changed, or new where the mock had none)

| Move | Line | Draft |
|---|---|---|
| Lamb-Tuck Ankle Tackle | Two quick hits on one monster. | kept |
| The Floor Is Lava! | Three hops onto random monsters. | kept |
| "Giddyup, Tata!" Launch | Powers up the next family member, then a heavy hit. | new |
| Double-Lamby Return-Cart Blitz | Six bounces onto random monsters. | changed |
| Pocket Pretzel & Pat | Light hit, then a tiny heal for whoever is hurt most. | new |
| Tattered Lamby Boomerang | Light hit now, two more next turn, and a small shield. | changed |
| Sofa-Cushion Citadel | Shields the whole family. Nobody gets pushed back. | changed |
| Kingdom of Ten-Thousand Blankets | Big heal for one family member, then a hit on every monster. | changed |

**Deedee** (draft: kept, changed, or new where the mock had none)

| Move | Line | Draft |
|---|---|---|
| Windex Spritz | Light hit. Leaves it Drenched, so it misses more. | changed |
| Wet-Floor Hazard | The next 2 monsters to attack up close slip and fall. | changed |
| "Hand Me My Glasses" Scrub | Scrubs off its boosts, then hits harder for each one. | new |
| Fifty-Year Dust Tsunami | Scrubs every monster clean, then a heavy wave Drenches all. | changed |
| "Little Pinch!" Syringe Poke | Light jab. For 1 turn, it takes big hits more often. | new |
| Deedee Makes It Better | Heals one family member and clears their bad effects. | changed |
| "Bring a Jacket!" Ward | Two family members heal each turn and survive one big hit. | new |
| To the Moon & Back | Revives or fully heals one, then hits every monster. | changed |

**TNB**

| Move | Line |
|---|---|
| Wheel-Thrown Lump | Light hit. Slows the monster down for 2 turns. |
| Center the Bowl | Clay shield on one family member. Clears Toasty and Bleed. |
| Three-AM Kiln Firing | Hits all monsters, leaves them Toasty, family gets stronger. |
| Grand Amphora Masterpiece | A big vase blocks 2 attacks, then smashes every monster. |
| Longboard Push & Carve | Light hit. TNB’s next turn comes a little sooner. |
| E-Bike Tag-Along | Powers up one family member and clears their bad effects. |
| Waymo Tailgate Rescue | Hits and blinds every monster, and helps one family member. |
| Baxter Hill Longboard Express | Heavy hit on every monster. Leaves them Dazzled. |

**Amy**

| Move | Line |
|---|---|
| Kettlebell Swing | Light hit. Builds a Rep, and Amy’s next turn comes sooner. |
| Burpee Blitz | Hit. With 3 Reps, Amy gets a bonus turn right away. |
| Pace-Partner Run | One family member keeps up with Amy’s speed for 2 turns. |
| Follow-Along Finale Burnout | Huge hit on every monster. Each Rep makes it stronger. |
| “Eyes on Me” Clap | Light hit. Knocks off one of its speed or dodge boosts. |
| Four-Tab Binder | Light hit. Two different flavors on it in a round earn Pep. |
| Gold-Star Sticker | One family member’s moves get stronger and can’t miss. |
| Classroom Lights-Out Reset | Heavy hit on every monster. Stops whole-family attacks. |

**Justin**

| Move | Line |
|---|---|
| Stud-Finder Beep & Knock | Light hit. Clobber hits do more to it for 1 turn. |
| Demo-Day Prybar | Rips off its shields, then hits it and the ones beside it. |
| Hang Fresh Drywall | A wall halves the next 2 hits on the family beside Justin. |
| Dropped-Screw Toolbox Punt | Huge hit. Double damage on a Flustered monster. |
| Voltage-Tester Poke | Light hit. Leaves the monster Dazzled. |
| “Don’t Touch the Copper!” Banner | Light hit. Links two monsters to lose Composure together. |
| Main Breaker Flip | Heavy hit. Stops its wind-up and knocks 1 Composure off. |
| Flashlight Block Rewire | Huge hit that jumps to every Wired or Drenched monster. |

**Boppy**

| Move | Line |
|---|---|
| Warden’s Nightstick Rap | Light hit. The monster hits softer on its next turn. |
| “Nobody Gets Past Me!” | For 2 turns, monsters must attack Boppy, and he’s tougher. |
| 1970 Cross-Country Story | Slows Boppy and one monster, and it has to aim at Boppy. |
| Warden’s Iron Gate | For 2 rounds, a gate softens attacks on the whole family. |
| Seeds of Trouble | Light hit. Leaves the monster Toasty. |
| “It’s Nothing, It’s Fine” Chomp | Boppy heals a little and his Sizzle hits get stronger. |
| 1989 Pickle-Jar Bomb | Hits every monster. Toasty ones burn twice as hard. |
| The Ghost One That Looks Back | Heavy hit on every monster. Their burns go off twice. |

**Olivia**

| Move | Line |
|---|---|
| Rusty Speed-Rope Snap | Light hit. Builds 1 Cadence. |
| Criss-Cross Double-Under | A flurry of hits, plus one more for each Cadence. |
| “Better Than Bobby!” Hype | Builds 1 Cadence, and Olivia’s next turn comes sooner. |
| Regional Championship Freestyle | Four fast hits, plus one more for each Cadence. |
| Baby-Wipe Swipe | Light hit on a monster, or a small heal for family. |
| Diaper-Bag Snack Drop | The whole family heals a little. Mom Prep makes it more. |
| Cool-Mist Humidifier | Drenches every monster and softens attacks on the family. |
| “Michael, Grab the Kids!” | Pushes every monster back and heals the family a little. |

**Nara**

| Move | Line |
|---|---|
| Startled Water-Bowl Flip | Light hit. Leaves the monster Drenched. |
| Jittery Shake-It-Off | Drenches every monster. Nara dodges more for 1 turn. |
| Vacuum-Cleaner Bolt! | Light hit on a row of monsters, then Nara hides behind Tom. |
| “Don’t Leave Me!” Meltdown | Heavy hit on every monster. Sets off Toasty and Dazzled. |
| Grip-Chicken Snap | Quick bite. Heals Nara if the monster has a bad effect. |
| Relentless Tug-of-War | Hit. The monster is weaker for 2 turns. |
| “No Take, Only Throw!” | Hit. Nara steals one of its boosts for herself. |
| Stunt-Double Squirrel Intercept | Three pounces that go right through shields. |

**Anyone**

| Move | Line |
|---|---|
| Pick-Me-Up | Gets a knocked-out family member back on their feet. |


## 2026-11-22 (3): Art Library bake, prop-gate-backlot-stage7-open (`artbake1587`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-backlot-stage7-open: background keyed from the corner colour rgb(209, 3, 87)
- prop-gate-backlot-stage7-open: `bake_gate_art.py backlot-stage7 open` ran from art/raw/props/prop-gate-backlot-stage7-open-v2.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.



## nightgreen (2026-11-22): every night test is off the known failures

Card c-nightgreen is done. All 12 rows of `tools/night/tests.json` that carried `known_fail` are fixed or retired (parts nightgreena to nightgreenm), and no row carries `known_fail` now (`python3 tools/night/manifest_check.py` ok). Nine tests were out of date, one game fault was fixed (a Carry-On spawn inside a bench in Terminal Zero), three already passed, one was deleted by the purge rule. The last one, `ch20_test`, took the longest: two test mistakes after the Leviathan fight (nightgreenm), and it now runs in under 4 minutes instead of 16. Notes: `claude/next-addendum-nightgreen.md`. This unblocks nightly refactoring (c-nightrefactor).

## nightgreenm (2026-11-22): the chapter 20 night test ends the Leviathan fight and now passes

Card c-nightgreen, last row. The test was wrong, the game was fine. After the four relays broke the four barriers, the test pressed the first skill row, and for Amy and Grace that skill does no damage, so the Leviathan sat at 5 HP and the fight ran out its 400 turns (6 minutes) still open. The test then forced `battle:leviathan` to win while the battle was still on, which is why the shatter scene never started. Measured with a temporary script that played only fight 1 and printed the flags, the scene and the dialog state every second (deleted). With the plain Attack (cross up, then the target) the Leviathan dies, the game sets `battle:leviathan` and `ch20-shatter` itself, plays the shatter scene (about 9 lines), and the Julian fight starts. No game change.
- `tools/ch20_test.py`: once no barrier is up, set the Leviathan to 5 HP and finish it with Attack.
- `tools/night/tests.json`: `known_fail` removed from `ch20_test`; `minutes` 10 to 5 (measured 223 s and 222 s, two runs in a row, down from about 16 minutes).
- Tested: `python3 -I tools/ch20_test.py` passes twice (all checks, including shatter scene to Julian, calm and epilogue to the end, game complete flag); `python3 tools/night/manifest_check.py` ok. Nothing in the game changed, so nothing to play on a phone.



## artwan2 (2026-11-21): Art Library pictures on WAN no longer fail on long prompts

- Tom: "The picture was not made: fal result said 422 ... at most 2000 characters." fal's WAN endpoints refuse a prompt over 2000 characters, and 418 of 1123 Art Library prompts are longer. The three gate pictures (prop-gate-town-school-open, prop-gate-backlot-stage7-open, prop-gate-jpark-barn-open) reached WAN try 3 and all failed this way.
- `wan_prompt` in tools/art-library/artgen.py: a prompt that fits goes word for word; a longer one loses only boilerplate (the xAI-only opening, the child-safety line, blank lines, section labels, the style word list the attached picture carries) and never the object description. A prompt that still cannot fit is not sent, not charged and not a failed try (`TooLong`); it is listed as skipped.
- Tested: python3 tools/art-library/artgen_test.py (new wan_prompt_test). The three gate prompts now measure 1990, 1849 and 1989 characters. Only 35 of the 418 long prompts fit; the other 383 (areas, rooms, big props) are too long for WAN and wait on xAI.
- Not fixed: the run also printed "could not save branch artgen: missing necessary objects" when it made nothing; the pictures are still kept as a workflow artifact.
- Not run for real: no picture was generated in this build.

## fix-pairmove1-gen-2 (2026-11-22): a dead video request no longer hangs Rose's Giddyup, Give it 4 more tries now makes a new try, and video cards say plainly what happened

Card c-fix-pairmove1-gen-2, for t-pairmove1-gen and t-movefun-gen. Tom on t-pairmove1-gen (22:04): "Hanging". Tom on t-movefun-gen (22:23): "See your message".

| What | Detail |
|---|---|
| Hanging, cause (fact) | Rose's Giddyup tap at 05:13 UTC reached fal.ai after its money ran out (403 "Exhausted balance"); the card history then said "1 made and checked, 0 passed, 0 stopped", which reads like something was made. The 05:23 tap was dropped by GitHub (one waiting run per group). wanqueue1, wanfeedback1 and Tom's fal top-up (t-fal-topup) landed after his report; since 06:20 UTC the video is being made inside run 44992845017 (it makes every card still asking after its own). |
| Hanging, second cause (fact) | The request sent at 05:16 UTC, just as fal ran out of money, never finished. Every later run picked it up again "with no new charge", waited 20 minutes and gave up: run 44992845017 did exactly that (06:20 to 06:40 UTC, "not ready after 20 minutes"). It would have hung on every tap. |
| Hanging, second fix | `wangen.py` `stale_pending` and `falq.py` `status`: a request still not COMPLETED an hour after it was sent is dropped (its ledger row is marked `dropped`) and a new one is sent in the same run. |
| Hanging, fix | `history_line` in `tools/art-library/wanbulk.py`: the history counts only videos actually made and names the rest ("already made, nothing sent: ...", "out of tries: ...", "tom-blockade not made: fal.ai (the video service) is out of money"). `.github/workflows/wan-gen.yml`: the run-failed step (`wan_runfail.py`) now also covers each card a run made because it was still asking, so a crash there leaves "failed: <reason>", never "Making 1 video..." forever. |
| See your message, cause (fact) | The card's yellow line said "tom-blockade ... it used its tries, see its card" and again "tom-blockade used its 4 tries; see its card" without naming the card, and kept saying it after Tom answered Give it 4 more tries. The head said "No video passed the checks yet ... being fixed by Claude" while Cube Pop and Wet-Floor were done and Blockade was out of tries (a Tom card). |
| See your message, fix | `board.html` `wanGaveupSay`, `wanHeldHead`: the line names the out-of-tries card by its title, says each video once, and after an answer says "you chose "Give it 4 more tries", so a new run makes it again by itself (nothing to tap)"; the head reads "2 of 3 videos are done. Out of tries: tom-blockade (you chose ...)". |
| Give it 4 more tries did nothing (fact) | Tom chose Give it 4 more tries on t-wangaveup-tom-blockade-r4 at 06:21 UTC; run 44993341855 then said "tom-blockade rev 4 already has a result (stopped): nothing sent", because the same rev cannot be made twice. |
| Give it 4 more tries, fix | `wanbulk.py` `pipeline`: a rev stopped before Tom's more-tries answer comes back as stopped, so the run adds the Sonnet stop card (auto-started) that changes one thing, raises rev and starts the next try, as the out-of-tries card promises. A second round at the same rev gets its own card id. |
| Started again | The last commit of this push is `board: wan generate t-pairmove1-gen` (Rose's Giddyup, within Tom's approved tap) with t-movefun-gen also asking, so Rose gets a fresh request and Blockade goes to its stop card. |
| Tests | `wanbulk_test.py` B15 (history line) and B16 (more tries), `wangen_test.py` W5b (stale request dropped and sent again), `board_wan_test.py` (out-of-tries line before and after an answer), portrait and landscape; the real board card looked at in both. |
| Pencil reports | `python3 tools/reports.py list`: none filed since 2026-11-22T06:04:54Z; nothing to mark done. |

## 2026-11-22 (2): Art Library bake, banner-leave-rose (`artbake1586`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- banner-leave-rose: `bake_party_banner.py ` ran from art/raw/characters/banner-leave-rose-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## 2026-11-22 (1): Art Library bake, banner-leave-grace, banner-join-rose (`artbake1583`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- banner-leave-grace: `bake_party_banner.py ` ran from art/raw/characters/banner-leave-grace-v1.png
- banner-join-rose: `bake_party_banner.py ` ran from art/raw/characters/banner-join-rose-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## fix-menu4play-2 (2026-11-22): the Family page seats all four people evenly clear of the crease, and the tab says Tom's Party

Card c-fix-menu4play-2 (fix from Tom's report on t-menu4play). Tom: "The family screen should have part members equally spaced apart. That means to not overlap with the crease that rose and Deedee should be shifted to the left in this case. Leaving dead space on the right side we will have to utilize in some new way. Also it should be Dallas's Party not family."
- Wide book (Duo, landscape, desktop): the right page now seats its people in the same width as the left page, packed to the left, so Rose and Deedee sit the same distance apart as Tom and Grace and stay clear of the crease. The dead space on the right of the line-up is left empty for now; what to put there is Tom's call (not done).
- The tab is now "Tom's Party" (`M2_TABS` in `engine/m2-core.js`). I read "Dallas's" as "Tom's" because "Dallas" appears nowhere in the game; if another name was meant, say it on the card.
- Tested: `python3 tools/m2_test.py` passes; frame `tools/shots/m2-duo.png`.


## fix-artgen3try-3 (2026-11-22): QA no longer holds a picture for "cut off at the edge" when nothing is cut off

Card c-fix-artgen3try-3, from Tom on t-artgen3try: "Failed qa". Read as: QA failed pictures that were fine. Fact: the card shows no auto-approve run since the last fix (`gen.mode` is still review, run of 2026-11-22T02:55), so what he saw was the old QA results ("8 of 16", "11 of 16" with a list of failed checks). I opened the stored JOIN pictures at full size: in both, every finger is fully inside the picture (the nearest fingertip is 8 to 10 px from the right or top edge of 1408 x 704). So the cut-off hands I called "a real fault" in fix-artgen3try-2 were not real; the QA question `f_crop` could not see a margin that small and said "cut off" to both.

| Change | Where |
|---|---|
| `f_crop` moves from hold to advisory (it still runs and still counts in the score, it no longer holds a picture on its own) | `tools/art-library/artqa-policy.json` |
| t-artgen3try: next step rewritten to say what to look at; history line | `data/board.json` |

- Kept: the JOIN and LEAVE prompts, the QA wording from fix-artgen3try-2, the 0.9 threshold, the other hold checks (`f_one`, `f_paint`, `f_text`, `f_bg`, `f_count`, `f_anat`).
- Not fixed, and why: QA also failed the JOIN pictures on lines that compare with the full-body reference (outfit, proportions). The fix-artgen3try-2 wording is untested on a new picture because QA needs the repo key, which a session does not have. If the next auto run still holds a fine picture on those lines, the next fix is to drop the reference lines from the score for cropped pictures, on that evidence.
- Tested: `artqa_test.py`, `artgen3_test.py`, `artgen3fix_test.py`, `artgen_test.py`, `board_artgen_test.py` all FAILS: []. No game screen changed, so no portrait or landscape frames apply.
- Pencil reports filed since 2026-11-22T04:17:40Z: none (the 19 open ones are older chapter 2 notes), so none were marked done.
- No paid run made. The auto run is Tom's tap.

## battleux1 (2026-11-21): the new Battle 3 screen: one list of moves, tap once to read and again to use, the strip under the scene says what will happen

Card c-battleux1. Builds the screen you approved in `claude/battleux-plan.md` (3.1 to 3.5, 3.7) for the new battle only; battle 2 is untouched and no rule or number changed (`node tools/b3-sim.js check`: 3329 checks, same as before).

| What | Where |
|---|---|
| One-level deck: every move in one list, first tap shows it in the strip, second tap uses it (a mouse is a tap too); recommended move highlighted; a free Skill shows "Free from <name>" | `engine/b3-deck.js`, `b3-deck.css` |
| Aim on the scene: a tap on a monster aims the highlighted move there; default aim is the Pet Peeve, then the last one aimed, then the front monster, and a heal goes to whoever is hurt most; a tap on a family card shows that member | `engine/b3-deck.js` (`b3AimDefault`, `b3TapUnit`) |
| The strip under the scene is one sentence plus what will happen; it becomes the battle log between turns and shows the win line and CONTINUE at the end | `b3RenderTray` |
| DETAILS switch in the turn bar (saved on the device as `aot-ux-details`; on by default on a desktop only) shows each move's one-line `short` when it has one | `b3Details`, `b3SetDetails` |
| Keys and gamepad: arrows and D-pad move, Enter or A uses, number keys highlight, I or Y opens the full list of a member, Esc or B goes back | `b3Key`, `b3Pad` |
| The words the screen adds (who a move reaches, what kind, how big, what the strip says, the two Ruckus moves) live in one small table each | `data/b3-ux-words.js` |
| Removed: the command cross, the SKILLS list, the skill card, the target list, the preview box and the i icon, with their styles and code | `engine/b3-ui.js`, `engine/b3-pictures.js`, `index.html` |
| Tests: the Battle 3 tests were rewritten for the deck; new layout test at the six sizes of plan 3.4 plus the rotated stage (fails when the highlighted move is off screen, a move name is cut or the strip overflows) | `tools/b3_test.py`, `tools/b3_layout_test.py <size>` |

- Found by the new layout test and fixed: on a folded Duo (portrait) the highlighted move could sit partly under the bottom edge, and on a folded Duo on its side the strip text ran 4 to 23 pixels past its box.
- Found while rewriting the tests and fixed: a tap right after using the keys rebuilt the rows under the finger and the tap did nothing.
- `tools/ch1_b3_test.py` fails at step "6 spot" on the build before this change too; not touched here.

## fix-ch2play (2026-11-22): chapter 2 loses more dull lines, the phone call is announced, and Griffith Park has a three-find trail to search

Card c-fix-ch2play (fix from Tom's report on t-ch2play). Tom: "tons of extraenous, boring, and unfunny dialog. you have more than an enough info based on the comedy engine we built to do this well. / also, the griffith park area is boring - there is nothing to search for like in chapter 1 grumps hallow - we need a similar idea for this". The pencil reports of 2026-11-21 18:00 to 18:07 (r-20261121-180018-jc8f, 180027-tyq4, 180035-bjdf, 180050-39xy, 180126-mdm1, 180230-crne, 180249-oy95, 180326-tsde, 180345-jvj8, 180408-h8ca, 180458-58c9, 180626-4eca, 180646-o5il, 180709-4jo0, 180718-y1a5) are all answered here.
- Cut (14 lines): loft, TNB "Then he knows where the muffins went" and Tom "He gave the pan back, so number three is closed", TNB "Nara's already on it" and Tom "Then we're her backup"; lemon tree, Tom "You liked the talking cloud" (rude) and TNB "The cloud made sense" (boring); boss, Tom "You're wearing the Observatory"; after the boss, Tom "How are you doing?", Mr. Shake "Nobody asks", TNB "Yeah. That's fair", Tom "May I?", TNB "Sour dough"; end, Tom "We were going to get bread", Odette "I have bread. Sit."
- Reworded (2, these two lines need a new recording): Tom to Doña Carmen "You said I cook well." (was "You told me I cook well."), Miss Odette "Both of you, back to my restaurant. This gumbo needs salt and you two need lunch." (was "Sit down, both of you...").
- Phone call: a Narrator line before Tom's text to Grace says Tom calls Grace on Long Island, so "reporting in" reads as a call (reports 180035, 180050).
- After the boss Tom and TNB turn to face Mr. Shake (report 180230).
- New: Nara's trail in Griffith Park. Three finds, each a `find` object in `data/maps-la.js` (a lens cap at the trailhead, a bent tripod on the east trail, a hiker's backpack up the switchback trail). A twinkle marks the next one (STORY_MAPFX in `data/scenes.js`); A on it gives a funny line and a hint to the next (a second page), the tripod gives Deedee's Cookie, the backpack a juice box (`find` hook in `engine/overworld.js`, flags ch2-find1 to ch2-find3, each once). Optional, nothing gates the story. Stand-in: the twinkle is code, no painted pictures yet.
- Not done: the Big Shake's size in battle (report r-20261121-180138-yorh, "all bosses should be HUGE"), the cutout of Jefferson Park (r-20261121-173628-97ha) and the slow start of the end scene (r-20261121-180541-ojxd) stay open reports. Not played on a phone.

## fix-menu4play (2026-11-22): on the Vibes page a person's name no longer wraps or gets cut off (Deedee)

Card c-fix-menu4play, from t-menu4play. Tom: "On the vibes screen Deedee name is cut off. I think you could slightly shift that area to the left but don't break the view".

| Change | Detail |
|---|---|
| Cause | The person's picture took 52% of the width, so the name box was narrow and `word-break:break-word` split Deedee into "Deede" and "e". |
| Fix | `m2.css`: the picture area is 44% (the name area moves left and gets wider), the name is 36 px instead of 40 and never breaks inside a word. |
| Test | `tools/m2_test.py` fails if any party member's name wraps or runs out of its box, and saves `tools/shots/m2-<size>-deedee-vibes.png`. All sizes pass. |

## wanfeedback1 (2026-11-21): every video card says in one plain line what its last run did, and a dropped tap says so

Card c-wanfeedback1. Tom (22:12): "why I repeatedly have to click regenerate in the board with zero feedback on what happened after the last generation". Cause: the result was only shown with the card opened, left out "already made" and "out of tries", showed raw errors, and a run that crashed or a tap GitHub dropped wrote nothing at all. Now (board.html `wanSummary`, `wanPlain`, `wanDropped`): a yellow line on the card, e.g. "Last run (9:55 PM): rose-cast: fal.ai (the video service) is out of money. Add credit at fal.ai/dashboard/billing, then tap Generate again."; a tap that has not started after 15 minutes says "never started: GitHub dropped the run. Tap Generate again." and the button works again; a run that ends without writing its result is marked failed with the error line by the new last step of the wan-gen job (tools/art-library/wan_runfail.py). Tests: wanbulk_test B14, board_wan_test.

## wanstop-grace-cubepop-r4 (2026-11-22): Grace's Crunchy Sugar-Cube Pop video (rev 4) is baked into the game by hand

Two tries of rev 4 failed only the look-checks (the pocket pickup and tuck are called not clear). I looked at the frames: she takes the blue cube, squeezes it once with both hands and tucks it back, and height, feet, flat background, edges and ends all pass. Tom chose "Bake the latest video as it is" on t-cubepop-checkdecide-r4, so I baked grace-cubepop-a2-r4.mp4 with the job's own settings (tools/art-library/wanbake.py, strike, every 3rd picture, 1.25x) into art/clips/grace-cubepop.webp and data/clips/grace-cubepop.js. The move already pointed at the clip, so no wiring changed. Nothing was generated and no money was spent; no new try was started (the fal balance was also out).

## wanqueue1 (2026-11-21): a video run also makes every other card still waiting; fal.ai is out of credit

Card c-wanqueue1. Tom (21:59): "that leaves me totally confused as to what happens next". Facts: every wan-gen run since 05:20 UTC stopped on fal "User is locked. Reason: Exhausted balance" (ledger $66.52); Rose's pair tap (05:23 UTC) was dropped because two cards asked at once and GitHub keeps one waiting run. Change: after its own card, a bulk run makes every other card whose wgen.want is still true (read from the newest main), so a dropped run no longer strands a tap. Tom card t-fal-topup.
## boardwedge1 (2026-11-22): board sync can no longer be stalled by a Tom card that blocks only finished work, or by merge-conflict markers in the board files

Card c-boardwedge1. Tom (11-21 21:13): "Yes" to a card that makes board-sync unable to stall.

| Change | Detail |
|---|---|
| Guard A (sync) | `r15_fyi` in `tools/board_sync.py`: an open Tom card that blocks no open Claude card (and is not waiting on a fix card) becomes `fyi: true` with one history line, so `board_check.py` never fails on "an open Tom card must block an open Claude card". |
| Guard B (push) | `tools/board_check.py` fails when `data/board.json`, `data/board-archive.json` or `board.html` has a line starting with seven less-than signs, seven equals signs alone, or seven greater-than signs and a space, and names the file and lines (also when the JSON no longer parses). Smoke runs it. |
| Workflow | `board-sync.yml` has a first step that names such markers in the run summary. |
| Tests | `tools/board_sync_test.py` (boardwedge1 A and B cases). |

## wanpurpose1 (2026-11-21): the video check judges the move's purpose, not every word; Deedee's Wet-Floor uses the take with the wet-floor sign

Card c-wanpurpose1. Tom (21:35): "this pattern has continued. I've now spent the most $10 trying to get the mop for DD. It's crazy" Tom (21:36): "it doesn't have to be perfect in every single way, but it does have to complete the overall purpose and theme". Fact: 13 Deedee Wet-Floor videos cost $9.63; the motion check judged 6 and rejected all 6, every time over details (the mop not coming from behind her back, two strokes instead of one); r9 and r10 were good by eye.

| Change | Detail |
|---|---|
| Motion check | `questions` in tools/art-library/wanqa.py asks ONE question about the move as a whole: does it show the main action well enough to be this battle move? Small differences (strokes, where a prop comes from, exact pose) do not count; no only for a missing or different action, a flip, spin, fall or turning away, or endless repeats. It replaces one strict yes or no per prompt sentence ("once and clearly... say no if it happens twice") |
| Stop sessions | A c-wanstop session that sees the purpose met by eye accepts the video (bake, wire, watch card) and starts no new try; only picture-breaking faults (edge, background, feet, a different person) always need a new try |
| Deedee | deedee-wetfloor-a2-r10 baked by hand and wired (string mop sweep, a yellow wet-floor sign set down, a finger wag, back to her stance); it replaces r9. No new video. Retired: t-wetfloor-check, c-wanstop-deedee-wetfloor-r10 |
| Video History | rebuilt (r10 shows as in the game) |

Tests: wanbulk_test B13, wangen_test, smoke.

## menu4 (2026-11-22): the new menu is the only menu and the old one is gone

Card c-menu4. Tom approved the redesign on t-menuux-decide (11-21 18:20). Nothing was run for money. Plan: claude/menuux-plan.md section 5.

| What | Detail |
|---|---|
| Switch | The ADMIN > MENU: OLD or NEW row, `?menu=new` and `?menu=old`, `m2On` and the saved `aot-menu` are gone. `openMenu` (declared in `engine/menu.js` so `travel.js` can wrap it) hands over to `m2OpenNew` (`engine/m2-core.js`) |
| Old menu purged | `engine/menu.js` lost the Party, Items, Gear, Status, Load, Options and Quit screens (`renderHome`, `renderGearTab`, `renderItemsTab`, `targetPicker`, `renderSaveTab`, `openQuit`, `renderQuit`, `levelBadge`, `charPic`, `portraitBox`, `gearPreview`, `gearDiff`, `diffChips` and the rest that only they used), `renderStatusTab` in `engine/progress.js`, `equipItem` and `unequipSlot` in `data/party.js`, and 199 lines of rules in `index.html` (about 16 KB: roster, gear, stat, vitals, level badge and `.b3v-*` Vibes overlay styles) |
| Kept | `PORTRAITS`, `drawPortrait`, the gear helpers the Vibes and Gear pages call (`gearOptions`, `bestFor`, `equipBest`, `autoGear`, `syncHeroHat`), `itemCat`, `fmtTime`, `menuZoom` (the shop), the map's Save pop-up (`openSave`, `renderSavePop`) and a small shell that draws only the Old Stampcard while a chapter runs on the old battle (`MENU_TABS` is now Menu and Stamps) |
| Vibes overlay | `engine/b3-menu.js` keeps its books, save and load wrappers and the Lab's book; the overlay (`B3V`, `b3vOpen` and 40 more functions) and its Rose Mode pictures (`b3pVibes`) are gone. Battle Lab > NEW BATTLE > VIBES AND RANKS now calls `m2OpenLab`: the Vibes page alone, on the Lab's own book, with a Rank picker (Every Vibe in the Battle Lab at Rank 1 to 5), no story pause, its own keys and gamepad |
| Small fixes on the way | Back on the Old Stampcard closes a pin or an open drawer first (the new frame skipped that), and leaving the Stampcard now autosaves quietly (it did not when it returned to the book) |
| Tests rewritten | `tools/m2_test.py` (no switch; the old names are gone; the Lab door), `tools/b3_test.py` s4 (the Lab door and the menu door on the new page), `tools/stampgrid_test.py` (opens the Stampcard through `m2OpenLegacy`), `buildlog_test.py`, `sync_test.py`, `recruit_justin_test.py`, `ch18_test.py`, `portrait_test.py` |
| Docs | CLAUDE.md Where things live, docs/DUO.md menus row, docs/ARCHITECTURE.md, docs/BATTLE3.md |

Not done or not changed: the shop still uses the old panel styles (`mwin`, `item-list`) and `menuZoom`; the old Stampcard stays until a chapter no longer runs on the old battle (Stampcard link on Vibes). The painted pictures on the Family page were not touched. Not tested on a real iPhone or the Duo: the five sizes are covered by `m2_test.py` in Chromium only.
## videohist2 (2026-11-22): Video History rebuilds itself after every video run

Card c-videohist-auto. The wan-gen Action has a new last step: after a run that made videos (not a dry run, not a run with nothing to make) it runs tools/videohist/publish.py, which clones main fresh (the workflow checkout is shallow and main may have moved during the run), rebuilds data/video-history.json and art/video-history/ from the wangen branch files with tools/videohist/build.py, commits only those two paths ("videohist: rebuilt after wan-gen run <id> [skip ci]") and pushes to main; a refused push fetches the new main, resets to it (main's copy of every other file) and rebuilds, up to 5 times. A run that changes nothing pushes nothing. The step is continue-on-error, so a failed rebuild never fails a video run. Test: tools/videohist/videohist_test.py H4 (a local bare repo with two made-up videos, one refused push, only the two history paths change). Not run for real: the first real rebuild happens with the next wan-gen run.

## videohist1 (2026-11-21): ADMIN > VIDEO HISTORY shows every battle video, whether it is in the game, and why the checks rejected the rest

Card c-videohist1. Tom (21:15): "Can I see a history of videos that were generated so I can see why you rejected them". New page videos.html (Admin, Battle system group): 113 videos made so far ($64.98), grouped by animation, newest first. Each shows a strip of 8 pictures (tap for full size), the date, the try number, the price and the video model, a chip (In the game 45, Rejected by the checks 15, Checked by eye only 53: made before the automatic checks), the reasons in plain words (the measured checks, and for the motion check the sentence it said no to with its own reason), and Watch the video (GitHub, branch wangen). "What Claude changed between tries" opens the job's notes. Data: data/video-history.json and art/video-history/*.webp from tools/videohist/build.py (reads branch wangen: the videos, the result files, the money ledger; in the game = named in a baked clip's stamp). Test: tools/videohist/videohist_test.py (night manifest g4). The page is rebuilt by hand for now; card c-videohist-auto makes the wan-gen Action rebuild it after every run.

## wanstop-tom-blockade-r3 (2026-11-22): Tom's Blockade shrinks the start picture to 80 percent so his right hand clears the edge

Card c-wanstop-tom-blockade-r3. Both r3 videos (frames on branch wangen) show the move: arms out with open palms, a weight shift to the left, a hold, a return to the stance. Measured fault in both: the right hand touches the right edge (video frames 29 to 33). One change: `pad` 0.8 on job tom-blockade, rev 4. Kept: prompt v3, Wan 3.0, start picture, seed 81, 720p, 5 s, bake, wire. Not changed: the look checks p1 to p3 said no on both videos although the pictures show the moves; if rev 4 passes the edge and still fails them, that is a check problem for Tom's watch card. Next try started by the board commit.

## wanstuck1b (2026-11-21): repair: the wanstuck1 push carried conflict markers in data/board.json and board.html; both restored from the newest main with the wanstuck1 card edits re-applied

Card c-wanstuck1. The board data and board page were broken for a few minutes after b3cdb22. board.html is main's copy (fix-pairmove1-gen's job list reload); data/board.json is main's copy plus the wanstuck1 card changes. board_check, board_wan_test and smoke pass.

## wanstuck1 (2026-11-21): video runs no longer get lost or stuck; Deedee's Wet-Floor has a string mop

Card c-wanstuck1. Tom (20:53): "Aaamaaand we're stuck yet again". Three causes, all fixed:

| Stuck | Cause | Fix |
|---|---|---|
| Deedee's card waited forever after a tap | wan-gen, art-gen and voice-gen set "one run at a time" on the whole workflow. Every push to main joins that group and GitHub keeps one waiting run per group, so an unrelated push (whose job is then skipped) cancelled the waiting paid run (run 44985447106, Tom's tap at 04:31 UTC) | The concurrency group moved onto the job in all three workflows, so a skipped job never takes the slot |
| "Give it 4 more tries" did nothing | Nothing read the answer, so the next run met the used-up count at once (run 44985280855: 0 made) | `more_tries` in wanbulk.py starts the job's count again from the answer time; the answer commit starts wan-gen on the job's card (`wan_card` on the out-of-tries card) |
| Rose's card said "Nothing to make" | The board page loaded the job list once; a page open since before pairmove1 had no tom-rose-giddyup | Fixed in parallel by fix-pairmove1-gen (the page re-reads the job list on every refresh); wanstuck1 keeps that version |

Deedee: the automatic loop made r8 and r9 (4 videos, $3.14) and stopped at its limit, as designed. By eye r9 is a brown string mop, two short sweeps beside her feet, put away, back to her stance; the look check failed it only on "once" and "from behind her back". Baked by hand (data/clips/deedee-wetfloor.js, already wired to wet_floor_hazard). Watch card t-wanstuck1-watch. Retired: t-wanmop1-gen, c-fix-wanmop1-gen, c-fix-pairmove1-gen; t-pairmove1-gen is back for one tap. Tests: wanbulk_test B12, board_wan_test (job list reload), wangen_test.

## fix-pairmove1-gen (2026-11-22): the board's video button no longer says Nothing to make for a card added after the page opened

Card c-fix-pairmove1-gen, for t-pairmove1-gen. Tom (11-21 20:31): "Says nothing to make migrant lei" (spoken; the same words as his earlier note on fix-wanstop-gen: "the button says nothing to make right now").

| What | Detail |
|---|---|
| Cause (fact) | `board.html` re-read the board from GitHub every minute, but read the video job list (`tools/art-library/wangen-jobs.json`) only once, from the site copy, when the page first opened. pairmove1 added the card and its job `tom-rose-giddyup` at 20:30; a board page open since before then got the card but not the job, counted 0 videos left, and showed "Nothing to make right now." Nothing was spent and no run was asked. |
| Fix | `loadWjobs` reads the job list again on every board reload, from GitHub (main) when the board is live (`ghFile`, the same read as the board, `ghBoard` now calls it), else the site copy. A job the list does not have yet is never counted as nothing to make: the card says "The job list has not caught up with this card yet" and the button "Getting the job list..." (disabled). The minute reload is skipped while a card is open, so an open card that names an unknown job asks for the list itself (`wjobsCatchUp`, at most every 20 seconds) and turns into Generate all 1 video when it arrives. |
| Test | New `python3 tools/board_wanstale_test.py` (serves a copy of the site whose job file lags, like GitHub Pages): S1 the card and job are pushed while the page is open, then the card says Generate all 1 video (about $0.79); S2 the card is there and the job file is behind, the button never says Nothing to make and the open card catches up by itself; portrait and landscape, no sideways scroll, no page errors. The page before this fix fails S1 and S2 with Tom's exact words "Nothing to make right now." Pictures /tmp/board/board-wanstale-s1-*.png, s2-*.png, s2b-*.png (looked at). `python3 tools/board_wan_test.py` passes. |
| Not this build | `python3 tools/board_test.py` stops at its Something is wrong step on the live board, with or without this change: its test report joins the open Tools fix card c-fix-artgen3try-3 instead of making c-fix-test2. Left for that card. |
| Pencil reports | `python3 tools/reports.py list`: none filed since 2026-11-22T04:31:47Z; nothing to mark done. |

## movefun2 (2026-11-22): the three flat family moves get one-sentence fixes and their videos are started

Card c-movefun-fix. Tom answered "Fix all of them" on t-movefun-pick. Each move changed one sentence of its prompt; everything else is kept. Nothing was run by this session; the `wan-gen` Action makes the videos (card t-movefun-gen, cap $9.60).

| Move | New prompt | The one change | Kept | Play speed |
|---|---|---|---|---|
| Tom, Zone One Blockade (`tom-blockade` rev 3) | wan-tom-blockade-v3.txt | The hip bump is its own sentence after the pose: "Then he bumps his hip to the left once." | Everything else, Wan 3.0, start picture, seed, 5 s | 1.5x (as before) |
| Grace, Crunchy Sugar-Cube Pop (`grace-cubepop` rev 4) | wan-grace-cubepop-v4.txt | The punch becomes "holds it up beside her ear and squeezes it once with both hands so it crunches and squishes out between her fingers" | The rest of the prompt, Wan 3.0, start picture, seed, 5 s | 1.25x (was 1.5x) |
| Deedee, Wet-Floor Hazard (`deedee-wetfloor` rev 10) | wan-deedee-wetfloor-v6.txt | Last sentence only: she sets a small yellow wet-floor sign beside her feet and wags one finger at it | The sweep sentence word for word, Kling 4.0, start picture, pad 0.55, feet limit | 1.25x (was 1.5x) |

`tom-blockade` and `grace-cubepop` now carry `bake` and `wire` copied from their clip files (Blockade: state, every 3, figure 99.3; Cube Pop: strike, every 3, figure 90 rows for Grace) so the Action bakes and wires them. Checks: `wanbake.check_spec` is clean for all three and `board_check.py` passes. `wanbulk_test.py`, `wangen_test.py` and `board_wan_test.py` could not run in this session's container (the same failures on the untouched repo: no fal client set up, no Playwright browser path), so they were not run.

## movefun1 (2026-11-22): which family move videos are fun; 3 flat ones listed for Tom to pick

Card c-movefun. Tom (11-21 20:02): "But what makes it giddy up Tata? These moves need to be fun." I made a contact sheet of each of the 10 family move videos (16 pictures plus the hit picture) and judged it against the move's name, description and the person. No prompt changed, no run started, no game file changed.

| Verdict | Moves |
|---|---|
| Fun (6) | Tom Lounge Pass Flex; Grace Soup-Dumpling Squeeze; Rose Lamb-Tuck Ankle Tackle, The Floor Is Lava!; Deedee Windex Spritz, Hand Me My Glasses Scrub |
| Flat (3) | Tom Zone One Blockade (only "stop" palms, no hip bump); Grace Crunchy Sugar-Cube Pop (a punch); Deedee Wet-Floor Hazard (one quick swipe, nothing says wet floor) |
| Wrong (1) | Rose Giddyup, Tata! (no Tom in it; already being remade by pairmove1) |

Length is not the cause: every move plays 2.1 to 3.4 s, and the two good signature moves are 2.8 s. Each flat move has one fix (one prompt sentence; Cube Pop and Wet-Floor also play at 1.25x). List and exact wording: claude/move-fun-review.md. Board: t-movefun-pick (Tom decides) blocks c-movefun-fix (Sonnet 5.5 medium, auto, build movefun2).
## menu3 (2026-11-22): the new menu has its Bag and System pages (still behind the MENU: NEW switch)

Card c-menu3. Tom approved the design on t-menuux-decide (11-21 18:20). Nothing a player sees changes until Tom picks `MENU: NEW` in ADMIN (or `index.html?menu=new`). Bag and System are pages of the book now; no tab opens today's Items or Load screens any more.

| Part | Where |
|---|---|
| Bag: All, Heal, Gear, Keepsakes (a Battle chip shows only when the bag holds a battle item), the list with painted pictures and counts, the item's page (what it does, You have N), Use it on: the family by health, most hurt first, the health each would end at, Use; Use on everyone for the picnic; Wear for a piece of gear. On a tall screen the page is a sheet that slides up (Back closes it first) | `engine/m2-bag.js` (`m2BagBody`, `m2BagDetail`, `m2UseRows`); rules `useFieldItem`, `equipTo` |
| System, left page: Autosave and the slots with Save and Load, each asking twice before anything is replaced (Replace it?, Load it?, Back cancels), saves from other devices, Back up, Restore, Cloud set-up, Sync now, Cloud off, the build label (opens the build history above the menu), Quit to title with its question | `m2SystemBody`, `m2SavesBlock`, `m2SaveRow`, `m2QuitAsk` |
| System, right page: Music, Voices and Sound effects (a slider you tap or drag, with minus and plus buttons for keys and the controller), Difficulty, Battle speed, Show what each skill does (the same saved setting as in fights), Turn the screen sideways (phones only), Less motion | `m2Options`, `m2BagWire` |
| Options only the old battle uses (High-five timing, Auto-stamp spends points, Win Now button) | show only while `b3sOn()` is false |

- Less motion (new, call): saved on the device as `aot-m2-calm`; it turns off the book opening, the page slide and the sheet. A tab change now slides the page (the style existed from menu1 but nothing used it).
- Turn the screen sideways (call): hidden on the unfolded Duo and iPads, where `toggleLayout` does nothing (the drawing showed it on the Duo; it would be a dead switch).
- Using an item, wearing, a volume or option change marks the menu for the autosave on close. Loading a save clears that mark first so the autosave is not overwritten by the game being replaced.
- Removed (purge rule): the Bag, System and Gear paths into today's screens (`m2OpenLegacy` now opens only Stamps), the `m2Soon` placeholder.
- Tests passing: `python3 tools/m2_test.py` (both pages at the five sizes: overflow, text under 12.5 px, targets under 44 px, em dashes; an item used on a hurt person, Wear from the Bag, Save here, Replace it, a save and load round trip, every option, the old-battle options, the quit question, the build label opening the history), `python3 tools/smoke.py`. Screens: `tools/shots/m2-<size>-bag.png`, `-bagitem.png`, `-system.png`, `-system-old.png`, `-quit.png`. Compared by eye with `claude/menuux-mock/shots/bag_*` and `system_*`.
- Not done: the switch to New for everyone and the purge of the old menu (card c-menu4). Not tested: a real cloud set-up, Back up's share sheet, Restore's file picker (they call the same functions as the old page).

## menu2 (2026-11-22): the new menu has its Vibes and Gear pages (still behind the MENU: NEW switch)

Card c-menu2. Tom approved the design on t-menuux-decide (11-21 18:20). Nothing a player sees changes until Tom picks `MENU: NEW` in ADMIN (or `index.html?menu=new`). The Vibes tab no longer opens the old Vibes overlay and the Gear tab no longer opens today's Gear screen in the new menu; both are pages of the book now.

| Part | Where |
|---|---|
| Shared header: faces of the party, a `+N bench` button that swaps the faces to the bench (bench members keep their Vibes and gear), swipe or L and R (Q and E) to change person, the person at their real height (one scale for the whole family), level and XP, Health, Attack, Defense and Speed | `engine/m2-vibes.js` (`m2Faces`, `m2Header`, `m2Stats`, `m2PersonLayout`) |
| Vibes: the person's Vibes as chips (stars, tag Main, Pocket or Not in use), a locked Freelancer chip (Master all 3), the chosen Vibe with subtitle, Lean in words, Vibe Point bar saying what the next Rank unlocks, the kit in Rank order (flavor symbol and word, Pep, full description, locked rows show their Rank, a New tag after a Rank-up), Make it Main and Make it Pocket, the line about where a mastered Vibe's points go, the Pick-Me-Up line | `engine/m2-vibes.js` (`m2VibesBody`, `m2Chips`, `m2VibeDetail`, `m2KitRow`) |
| Quirks: two slots on the left page, Choose a Quirk on the right (all of the person's Quirks by Vibe, locked ones with their Rank, picking one in the other slot trades them, Leave it empty) | `m2QuirkSlots`, `m2QuirkPick`; rules `b3SetQuirk` |
| Front row and Back row (Back is greyed with the reason for the last person in Front), a late joiner's point split with minus and plus (20 points a tap) and Lock it in | `m2RowCtl`, `m2PoolBlock`; rules `b3SetRow`, `b3PoolShift`, `b3PoolConfirm` |
| Gear: Tool, Outfit and Charm with the painted pictures (emoji until a picture exists), the effect in the new stats, the chosen slot's pieces in the bag with the change in green (also on the four numbers while you look at a piece), Wear, Take off, Best gear, a green arrow on a face when the bag holds something better | `m2GearBody`, `m2Effect`, `m2Diff`; rules `b3GearSum`, `data/b3-gear.js` |
| Old Stampcard: a link at the bottom of Vibes that opens today's Stamps screen while the chapter still runs on the old battle (`b3sOn()` false); Back returns to Vibes | `engine/m2-core.js` (`m2OpenLegacy('stamps')`) |
| A change made in the menu goes into the autosave when the menu closes (`M2.dirty`) and is copied to the Battle Lab's book (`b3LabFollow`), the same as the old Vibes screen did | `engine/m2-core.js` `m2CloseNew` |

- Numbers (fact): Health, Attack, Defense and Speed are worked out the way `b3PartyUnit` works them: the level line times the member's own factor, the Main Vibe's Lean, then worn gear (flat points added, percent perks multiplied in). A test checks the shown numbers against `m2Stats`.
- Gear in fights (fact): the card said fights do not count gear until card c-b3gear ships. c-b3gear shipped as `b3gear` (2026-11-22), so worn gear counts in a Battle 3 fight. Stats and perks the table switches off (Warmth, Cool, crit, evade and the others in `B3_GEAR.off`) show in the menu with the note "part of it is not used in fights".
- DETAILS setting (call): `battleux1` has not shipped, so its saved setting and flavor symbols did not exist yet. This build saves the switch as `aot-b3-details` (`m2Details`, default on; off shows each description's first sentence) and draws the six flat flavor symbols from the battle mock (`claude/battleux-mock/src/app.js` `IC`). The battle screen should read the same key and share the symbols when battleux1 lands.
- Freelancer (call): the fourth chip stays locked in every case. Casual Mode is battle stage 21; the chip opens then.
- Third Vibe: the chips follow `B3_CAST[id].vibes`; with a third Vibe the row has three chips and the locked chip joins a second row of the same grid (no other layout change).
- Removed (purge rule): the menu1 wrapper around `b3vRender` that cleared the New skill tag, and the Vibes tab's `b3vOpen('menu')` path. The old overlay stays for the Battle Lab door.
- Tests passing: `python3 tools/m2_test.py` (both pages at the five sizes: overflow, text under 12.5 px, targets under 44 px, em dashes; the later-game loadout with Ranks 5 and 4, 4 and 3, 3 and 3 and both Quirk slots in use; Make it Main, row refusal, Quirk chooser, details switch, a late joiner's split and Lock it in, bench faces, Wear, Take off, Best gear, keys), `python3 tools/smoke.py`, `python3 tools/b3_test.py s4`. Screens: `tools/shots/m2-<size>-vibes.png`, `-gear.png`, `-quirks.png`, `-pool.png`.
- Not done: Bag and System (card c-menu3), the switch to New for everyone and the purge of the old menu (c-menu4); no fight number changed.
## pairmove1 (2026-11-21): two-person battle videos; Rose's Giddyup will ride Tom's shoulders

Card c-pairmove1. Tom (20:02): "But what makes it giddy up Tata? These moves need to be fun." Tom (20:07): "it needs to be something where she jumps on the shoulders and then jumps off and says giddy up... the more the advanced move is that more acceptable is for to take longer."

| Part | What |
|---|---|
| Engine | A move row may carry `anim.pair = {with, clip}` (`b3cPair` in engine/b3-clips.js). When that member is in the party and standing and the clip exists, b3PlayMove draws the two-person video as the partner's body at the partner's spot, hides the mover (`away`), lands the hit as she springs off with a short arc to the monster, then both stand at home. Otherwise the move's own clip plays, as before |
| Giddyup | data/b3-kit-rose.js: `pair:{with:'tom',clip:'tom_rose_giddyup'}` next to the solo clip |
| Start picture | art/clips/start/tom-rose-pair.png: tom-hero.png and rose-hero.png, each whole and unaltered, side by side on magenta, Rose at her battle height (83 of Tom's 99 rows) so she keeps her size when the video starts |
| Video job | tom-rose-giddyup (Kling 4.0, 5 s, start picture only, pad 0.65, airborne, returns false, baked at 1x: a signature move may take longer). Prompt tools/art-library/prompts/wan-tom-rose-giddyup-v1.txt: she hops onto his shoulders, rides with a fist up, springs off and lands crouched in front of him |
| Canon | claude/canon-addendum.md (repo and Project): moves read as their name; two-person moves are one video; length follows the move |
| Cards | t-pairmove1-gen (Tom: Generate, at most $3.20); c-movefun (judge every family move video against its name) |

Test: tools/pairmove_test.py (P1 solo with no two-person clip, P2 a stand-in two-person clip plays at Tom's spot with Rose hidden and the hit lands, P3 Tom knocked out gives the solo clip, P4 asked for ahead). Pictures tools/shots/pairmove-solo.png, pairmove-pair.png.

## nightclean-1122 (2026-11-22): Night cleanup, bucket C: CLAUDE.md is 2.3 KB shorter

Bucket C (working agreement). Shortened two history-heavy sections of CLAUDE.md, "Load time" and "Clip quality gate": the sw1 and mem1 build stories and the clipch1fix details left (they stay in the entries above and in git history; sw1 details live in docs/WORKFLOW.md). Every standing rule, heading and quoted sentence of Tom's is kept: `python3 tools/night/rules_check.py` ok (26 headings, 19 leads, 59 quotes). CLAUDE.md 69,569 to 67,271 bytes; `claude/next.md` unchanged (44,187). No file under tools/ or art/ was deleted, so there is no reference grep.

## wanstop-deedee-wetfloor-r8 (2026-11-22): Deedee's Wet-Floor shrinks the start picture to 55 percent so the mop clears the left edge

Card c-wanstop-deedee-wetfloor-r8. The bulk run 44983183373 stopped r8 (the string mop). By eye both videos are right: a string mop with a floppy head comes from behind her back, one sweep, put away. Try 1 failed only bg (a pink floor shadow, 5.46 percent off colour); try 2 failed feet by 0.2 point (10.2 percent, 2 pictures) and the left edge in 6 pictures (frames 46 to 47, 70 to 73). One change, rev 9: `pad` 0.55 (was 0.65). Kept: prompt v5, Kling 4.0, start picture, 5 s, feet limit 0.10, bake, wire, the 4 tries and $3.20 budget (2 used). Next try starts with this push (`wgen` on t-wanmop1-gen).

## guideusefix2 (2026-11-22): Use this one now writes its build heading

Card c-guideuse-fix, follow-up to guideusefix1. Fact: the guide-use step "Name the build" called `use_take.py --changes` without `--state`, which the script required, so it exited with a usage error and no `docs/CHANGES.md` heading was written (seen in run 44982162678). `--state` is now needed only when taking requests. Tool fix; nothing to see on the phone.

## guideusefix1 (2026-11-22): Use this one in the Battle Guide never saves a video without putting it in the game

Card c-guideuse-fix. Cause (fact): guide-use run 44982162678 (Rose's Giddyup, 19:46) failed with `No such file or directory: 'ffprobe'`. The runner installed ffmpeg from imageio-ffmpeg, which has no ffprobe, so `recipe.probe_fps` raised before the clip was cut. The workflow ended the step with `|| true`, so the run still committed the video, the prompt file and the raised job rev. Changes: (1) `probe_fps` reads the frame rate from `ffmpeg -i` when ffprobe is missing; (2) the workflow installs ffmpeg with ffprobe by apt first; (3) `use_take.use` is all or nothing: a failed use puts every file back and removes the video and prompt it saved; (4) the workflow step no longer swallows the failure: the run ends red with an error naming it, other takes in the same run are still kept and published. Test: `tools/guidegen/take_test.py` T5 replays rose-giddyup (a Wan job with bake settings) with no ffprobe on the path, a baker failure that rolls back, and the clip files, script tag and wire. Not seen on the phone; nothing to see there.

## giddyupbake1 (2026-11-21): Rose's Giddyup plays the video Tom picked

Card c-giddyupbake1. Tom (19:52): "So it sounds like roses animation is wrong then?" By eye the take he chose in the Battle Guide at 19:46 is right for the move as designed (a raised hand, a crouch, one upright cannonball jump, a landing, back to her stance, no flip, inside the frame). But Use this one (guide-use run 44982162678, commit 22483dd) only saved the video (art/raw/clips/wan-rose-giddyup-v9.mp4); nothing cut or wired it, so the move still played the default animation. Cut by the job's bake settings (strike, step 2, 1.5x, 83 rows; the video is 30 fps) into data/clips/rose-giddyup.js and art/clips/rose-giddyup.webp, wired to giddyup_tata_launch in data/b3-kit-rose.js. The tool bug is card c-guideuse-fix (Sonnet, starts by itself).

## wanmop1 (2026-11-21): Deedee's Wet-Floor asks for a string mop, not a broom

Card c-wanmop1. Tom (19:48): "Deedee is using a broom not a mop." Right: the r7 video baked in wanauto1 drew a flat push-broom head. One change: deedee-wetfloor rev 8, prompt v5 = v4 with "a short mop" changed to "a short string mop with a floppy wet head"; everything else kept, fresh budget. Tom card t-wanmop1-gen holds the Generate button; the current clip stays until the new one passes and replaces it. Retired: t-giddyup-decide and c-giddyup-next (Tom picked a Giddyup take in the Battle Guide at 19:46), t-wanauto1-watch (answered).

## menu1 (2026-11-21): the new main menu's look and Family screen are built beside the old menu, behind a switch (default Old)

Card c-menu1. Tom approved the design on t-menuux-decide (11-21 18:20): "looks great now, just remove their heights and we can make the cards for this to be produced". Nothing a player sees changes until Tom picks New: ADMIN, then `MENU: OLD` (tap to flip to `MENU: NEW`, saved on the device as `aot-menu`), or `index.html?menu=new` for one visit.

**Head row (step 1, no head was resized).** `docs/menu-head-row.png` is every family member's hero painting, heads side by side at line-up scale (order Tom, TNB, Justin, Boppy, Amy, Deedee, Olivia, Grace, Rose, Nara); `docs/menu-line-up-all.png` is all ten standing on one floor line, heights from `data/heights.json`. What it shows (fact): Boppy's head is the biggest of the adults and Tom's and Justin's the smallest; Grace's and Rose's heads are close to the adults' in size, which is the Grace/Rose ratio of `docs/CHARACTER_PIPELINE.md` section 7. Left as painted. If Tom wants any head changed, that is a card of its own.

| Part | Where |
|---|---|
| Switch and open/close, keys, gamepad, tabs, top bar, backdrop still | `engine/m2-core.js` (wraps `openMenu`, `closeMenu`, `renderMenu`, `menuKey`, `menuPad`, `menuBack` and keeps the originals in `M2_orig`) |
| Family screen: line-up, plates, bench with Change, Family Ruckus gauge, New skill tag | `engine/m2-family.js` |
| Every style, all under `#m2` | `m2.css` |
| Hero pictures, paper divided to white, no cutout (10 people) | `tools/sprite-bake/bake_menu_heroes.py` -> `art/menu/<id>.webp` |
| Fonts, loaded when the menu first opens | `fonts/bricolage.woff2`, `fonts/figtree.woff2` |
| Test: five sizes (951 x 648 with ?duo=1, 393 x 852, 852 x 393, 466 x 657, 1280 x 720), overflow, text under 12.5 px, targets under 44 px, em dashes, height labels, Change (free slot, swap, not allowed in words), New skill tag, tabs, close, keys, Report pencil above the menu, default Old | `tools/m2_test.py` (screens `tools/shots/m2-*.png`; listed in `tools/night/tests.json`) |

- Layout (fact): wide screens (Duo unfolded, desktop, phone sideways) put the five tabs down the left edge with the gutter on the fold; tall screens (phone upright, Duo folded) put them along the bottom. Big screens scale the whole book with a transform, so measurements stay in layout pixels.
- Family (fact): one ppi for everyone from `WALK_SCALE[id].inches`, never typed; no height labels; the bench holds everyone recruited who is not in the party. Change: free slot uses `benchToParty`, a full party asks who sits out (`benchSwap`); when the story allows nobody to sit out the page says so in words.
- New skill tag: `m.m2new` is set when a Rank-up is awarded (wraps `b3AwardVp`), cleared when that person's Vibes page opens from the menu, saved in the save as `m2.newSkill`.
- Until their own cards ship, Vibes opens today's Vibes screen (`b3vOpen('menu')`), and Gear, Bag and System open today's Gear, Bag and Saves screens inside the old menu; Back returns to the book.
- Backdrop (fact): one still of the game picture, shrunk in steps and scaled up by the browser, drawn once when the menu opens, with a dusk wash over it. Nothing is blurred live.
- No em dashes in the menu's words or files; no text under 12.5 px (phone sideways shows "Lv 1" and "98/98" so everything fits at that size).
- Built notes for c-menu2 (Vibes and Gear): add a page by giving `m2Render` a body for the tab in `engine/m2-core.js` (`M2.tab`), put its styles in `m2.css` under `#m2`, and reuse `.m2-plate`, `.m2-chip`, `.m2-btn`; the old screens open through `m2OpenLegacy(tab)`.
- Tests passing: `python3 tools/m2_test.py`, `python3 tools/smoke.py`.
- Not done: no change to the old menu's code, no other tab built, nothing pushed to the Project.
## animplan1 (2026-11-22): the Battle Guide has a Plan view of every battle animation

Card c-animplan. Tom (2026-11-21 18:09): "there's no clarity on the plan, which animations we do and when". ADMIN > BATTLE GUIDE > Animations now opens with a PLAN: three counts (Making, Next, Done) and a list per group, one row per animation, tap a row to open its owner. Done: a baked video is in the game (82). Making: a job in `tools/art-library/wangen-jobs.json` with no baked video, or an open `c-wanstop-<job>` card; shows the job's rev (now: Rose's Giddyup, rev 8). Next: no video and no job (267). It reads the same data as the rest of the guide (`data/guide-anims.json`, the jobs file, the board), so it moves by itself. Test: `tools/battle_guide_test.py` (counts match the data, rose-giddyup is a Making row, portrait and landscape, screenshots `tools/shots/guide-plan-*.png`). Not looked at: the rest of battle_guide_test past the take-card check fails to start in this sandbox's Chromium (video decode), so only the new block and the first 325 lines were run.

## wanauto1 (2026-11-21): battle videos finish without Tom; Deedee's Wet-Floor is in the game

Card c-wanauto1. Tom (18:09): "why has it taken me all day to record like 4 animations? ... why has the card come to me like a dozen times?" Tom (18:11): yes to the Action spending up to $3.20 per animation and $15 a day without his tap. Tom (19:02): "Argh it happened again!!!!"

| Change | Detail |
|---|---|
| Re-roll | A miss is made once more at the same rev with every setting the same (an edge-only miss gets the smaller pad as before). wanbulk.py `pipeline` |
| Caps | `_bulk.auto` in wangen-jobs.json: 4 videos and $3.20 per job since its `auto_from`, $15 per UTC day, counted from the ledger (`budget`) |
| Automatic fix | A second miss adds `c-wanstop-<job>-r<rev>` as Sonnet 5.5 medium with `auto` and `start`; the session changes one thing and starts the next try itself (`wan_card`, last commit `board: wan generate <card>`). Out of tries: one Tom decide card `t-wangaveup-<job>-r<rev>` |
| One watch card | Passed videos join the open card marked `wanwatch` |
| Board job | Wakes when wan-gen ends (board-sync.yml `workflow_run`); R9 holds a fix card with `wan_card` from 11 pm to 3 am (night table) |
| Board page | Text says a Claude session fixes a stopped video and starts the next try by itself |
| Deedee Wet-Floor | r7 baked and wired by hand (data/clips/deedee-wetfloor.js, wet_floor_hazard in data/b3-kit-deedee.js). By eye every frame: a flat mop, one sweep beside her feet, put away, clean edges; the look check failed it only on "from behind her back". Bake settings from the job (deedee-windex's) |
| Rose Giddyup | Stop-loss: r5 somersault, r6 spin, r7 flip, r8 flip plus a hoop drawn for "circles one hand". No fifth wording fix; Tom decides on t-giddyup-decide (No jump recommended), which starts c-giddyup-next |
| Plan view | Card c-animplan (Sonnet, starts by itself): Done, Making, Next for every battle animation in the Battle Guide |

Retired: c-wanstop-rose-giddyup-r8, c-wanstop-deedee-wetfloor-r7, t-wanstop-gen. Tests: wanbulk_test (B9 to B11 new), wangen_test, board_wan_test, board_sync_test, board_check, clip_test, clip_kinds_test, video_only_test. Plan: claude/video-battle-plan.md 4.14.

## b3gear (2026-11-22): worn gear now counts in the new battle (card c-b3gear)

Fact: before this build no file under data/b3-*.js or engine/b3-*.js read a member's equipment, so a Tool, Outfit or Charm changed nothing in a new-battle fight. Now it does, by the battle plan's mapping (claude/battle-architecture.md, gap row 31). The mapping is the plan's own call and Tom has not confirmed it.

| Change | Where |
|---|---|
| The mapping table: POW to Attack, GRIT to Defense, PEP to Speed, HP to Max HP, one battle point per item point; percent perks on POW, GRIT or PEP become a `gear` mod on that stat; everything else is switched off with a reason | `data/b3-gear.js` (new, `B3_GEAR`), loaded in `index.html` |
| `b3GearSum` adds up worn items; `b3PartyUnit` applies `cfg.gear[id]`; story fights pass each member's worn items | `engine/b3-core.js`, `engine/b3-story.js`, `engine/b3-ui.js` |
| Rule tests (data complete for every item stat and perk, sums, a dressed fight against a bare one) and the simulator option `--gear=<chapter>` | `tools/b3-check-gear.js` (new), `tools/b3-sim.js` |

Simulator, 300 fights each, `--support=4`, the family wearing typical gear for that chapter (chapter 1: Notebook, Shirt, Walking Shoes; 2: Notebook, Sweater, Bandana Cap; 3: Driftwood, Hoodie, Bandana Cap; 4: Slate, Jacket, Hot Pepper; 5: Slate, Field Day Tee, Hot Pepper). Rounds to win, bare then with gear; every fight won, no errors.

| Fight | Bare | With gear | Party HP left |
|---|---|---|---|
| Chapter 1 boss, The Big One | 6.84 | 6.27 | 96% / 96% |
| Chapter 2 boss, The Big Shake | 6.16 | 5.81 | 96% / 96% |
| Chapter 3 boss, Old Iron-Gill | 5.66 | 5.47 | 100% / 99% |
| Chapter 4 boss, The Director's Cut | 6.68 | 5.49 | 68% / 86% |
| Chapter 5 boss, The Red Pen | 5.78 | **4.78** | 82% / 83% |
| Elites ch1, 2, 4, 5 (Log Lump, Tar Pit Blob, Cue Card Crab, Dodgeball Dread) | 3.32, 4.06, 5.26, 4.07 | 3.11, 4.05, 4.70, 3.44 | 95 to 83% / 95 to 96% |

The boss target is 5 to 7 rounds. Gear leaves chapters 1 to 4 inside it and puts the chapter 5 boss at 4.78, 0.22 under. Per the card, no monster was retuned: the numbers are on a card for Tom (t-b3gear-ch5).

Charms and perks that now do nothing in a new-battle fight (they still show in the menu): Cool and Warmth stats; perks crit, evade, regen (Lily Hat, Glue Stick, Bag Tag, Garden Hat, Heating Pad), startVp, heart, coins, kind, and the status immunities (Fishing Line, Windsock, Hall Pass, Reading Glasses, Warm Blanket, Coat Ticket, Priority Tag, Scarf, Boots). The full list with a reason each is in `B3_GEAR.off` and docs/BATTLE3.md "Gear".

## fix-menu1look (2026-11-22): the menu look card now waits for the menu build

Card c-fix-menu1look. Tom (11-22) on t-menu1look: "There is no menu in the admin". Fact: the new menu is not built yet (card c-menu1 is still In progress), so ADMIN has no Menu choice. The look card had opened early because c-menu1 did not list it in `blocks`. Fixed on the board only: c-menu1 now blocks t-menu1look, which waits and comes back when the build ships. No game code changed.

## fix-artgen3try-2 (2026-11-22): QA no longer faults cropped pictures, and the JOIN banners keep their hands inside the picture

Card c-fix-artgen3try-2, from Tom on t-artgen3try: "Fix bases on qa". Read as: fix the banners based on what QA flagged. Fact: the 4 test banners scored 14, 8, 11 and 16 of 16; looking at them, two flags were real (Grace's and Rose's JOIN banners have a hand cut off at the top or right edge) and two were QA's fault (it failed the waist-up LEAVE banner because the legs were not shown, and held JOIN pictures on shoes, pants and "proportions" of a full-body reference that a waist-up crop cannot show). Fact: the card's history shows the plain Generate button was tapped (`gen.mode` review), so nothing was auto-approved in that run.

| Change | Where |
|---|---|
| JOIN pose says both hands stay fully inside the picture with clear space above the fingers and by the right edge (9 people, not the dog) | `tools/art-library/partybanner-prompts.js`, `data/art-prompts.json` |
| f_crop and f_same allow a cut the prompt asks for (waist up); the requirement list is told to ask only about what stays in the picture and to compare with a reference in one question | `tools/art-library/artqa.py` |
| t-artgen3try: next step rewritten (auto-approve button, remakes only the two JOIN banners, the two LEAVE banners wait for Tom's look); history line | `data/board.json` |

- Kept: the four LEAVE results, the other prompt text, the hold list and the 0.9 threshold. LEAVE prompts are unchanged, so those two stay "already made and waiting"; QA is not re-run on them (it needs the repo key).
- Tested: `artqa_test.py`, `artgen3_test.py`, `artgen3fix_test.py`, `artgen_test.py`, `board_artgen_test.py` all FAILS: []. I looked at all four banners side by side. No game screen changed, so no portrait or landscape frames apply.
- Pencil reports filed since 2026-11-22T02:56:44Z: none (the 19 open ones are older chapter 2 notes).
- `tools/art-library/make-prompts.js` fails on main in `npc-prompts.js` (undefined colour), so the JOIN text was patched into `data/art-prompts.json` as well as the source file. Not mine; left alone.
- No paid run made. The first auto run on the two JOIN banners is Tom's tap.

## b3s18bonus (2026-11-21): the bonus chapter (Nine Scoops, chapter 21) plays on Battle 3 behind the same switch

Card c-b3s18bonus, part 2 of 2. Chapter 21 is on `B3_STORY.chapters`, so it follows the same switch as chapters 1 to 10 (BY CHAPTER and NEW run it on Battle 3, OLD keeps battle 2 on the same save). Scene dialogue is unchanged and no spoken line was added or reworded.
- Tips (`data/b3-story.js`): nsGremlin, nsSlug, nsCone, nsBoss1, nsGarden, nsBoss2 and nsBoss1b each have one-time family-turn tips (Deep Freeze is flagged as charging, Sizzle as Brain Freeze's pet peeve, Panic Boil! as the way to pop the Frosted Lid).
- `beginBonus` (`data/bonus-nine-scoops.js`): starts the chapter at level 5 with one chapter of Vibe Points (`b3sFresh`, then `b3sMigrate`), so the bonus chapter is not played at level 25.
- Toasts: the Tombos-ready toast shows only on battle 2 (Battle 3 has no Tombo command; Birthday Wish is a scene beat there), and the retry toast on Battle 3 says the boss starts at half HP and what beats it. No Warmth bar and no WARMTH command in these fights.
- Test: `tools/ns_b3_test.py` plays the whole chapter from the BONUS start in portrait and landscape through `tools/b3_chapter_lib.py` (`start(chapter, outdir, bonus=True)`). Result in both layouts: all eight fights on Battle 3 (gremlins, slug lost once then won on retry, gremlins, Brain Freeze flee at 45 to 48 percent, gremlins, Brain Freeze shell at 45 percent, Brain Freeze phase 2 won on the first try), the party at level 7 for the real boss, 137 Vibe Points paid (90 Main plus 47 Pocket), Grace wears the sash and starts as the Birthday Girl, no Warmth words on any fight screen.
- Checks: `tools/b3-check-s18bonus.js` section 8 (chapter 21 data and tips); s17 and s18 tips-key checks also read the bonus file. `node tools/b3-sim.js check`: 3554 checks, FAILS [].
- Fix found by the chapter test (`data/bonus-nine-scoops.js`, `nsBoss2` win branch): Brain Freeze is a spawned (scripted) monster, so `monsterFall` never gave it `bossAwait` and the world rule that clears a beaten boss (`bossSettleAll`) took it off the map the moment the fight scene ended, before `nsAfterBoss` walked it out; the walk step then failed on a missing actor every frame and the scene stalled until SKIP. The win branch now sets `bossAwait` on it. Found by rule check on `OLD` too (the removal does not depend on the battle system); the test now has no page errors.
- Second fix, found proving Milestone E's Take me there (`python3 tools/dashboard_test.py`): `beginBonus` lives inside the bonus file's closure, so the title screen's BONUS button and the dashboard's BONUS button (`typeof beginBonus==='function'`) never saw it and started chapter 1's opening instead. The file now sets `window.beginBonus`. `tools/dashboard_test.py` reads a jump to chapter B as chapter 21. Dashboard test: ALL PASS (298).
- Left alone on purpose: the scene lines that mention Tombos and the bag (Birthday Wish, Boppy's peppers) have no Battle 3 command and stay as story beats.

## fix-artgen3try (2026-11-22): the auto-approve test card now holds real pictures to try it on: Grace's and Rose's party banners

Card c-fix-artgen3try, from Tom on t-artgen3try: "i have no idea what this feature is or how i'm supposed to test it - it needs to be acompanied by an actual use case i can click thorugh". Fact: the card was handed over with no pictures on it, and the board shows the Generate buttons only on a card that holds pictures, so there was nothing to tap. Two more gaps on the path he would click: the card's Not this one opened the Art Library list (`art.html?open=`), where NOT THIS ONE is not offered, and the review viewer showed no picture for a QA-approved entry (the picture is in art/raw, not a result on the phone).

| Change | Where |
|---|---|
| t-artgen3try holds 4 real pictures the game needs (`done_when.art_approved`: banner-join-grace, banner-join-rose, banner-leave-grace, banner-leave-rose; Art Library link), a new title, and a next step that says in plain words what auto-approve is and the clicks from tap to seeing the banner in the game | `data/board.json` |
| Party banners have a bake hook: an approved banner (by Tom or by QA) is baked by the art-bake Action into `art/banners/` and `data/party-banners.js`, so it shows in the game with no session | `tools/sprite-bake/bake_party_banner.py` (new), `bake` on the 20 entries in `tools/art-library/partybanner-prompts.js` and `data/art-prompts.json` |
| The board's Not this one opens `art.html?review=<id>` | `board.html` |
| `?review=` also opens a picture QA approved, and the viewer shows that picture (from art/raw) with NOT THIS ONE | `art.html` (`reviewIds`, `rvDraw`) |
| New test; board_artgen_test checks the new link | `tools/art-library/artgen3fix_test.py`, `tools/board_artgen_test.py` |

- Tested: a stand-in banner approved as if by QA, baked through `art_bake.py` in a scratch copy: `join-grace.webp` made and the game showed it as the painting (banner_hold_test, portrait and landscape, FAILS: []). The board card shows both buttons, 4 pictures, about $0.20, in portrait and landscape. The viewer test fails 9 ways on the old code and passes on the new.
- Tests passing: `artgen3fix_test.py`, `artgen3_test.py`, `artgen_test.py`, `artgen_lib_test.py`, `board_artgen_test.py`, `cardlinks_test.py` (its unknown-id check waits only 1.2 s and failed once on timing, then passed twice), `board_check.py`, `validate.js`.
- Pencil reports filed since 2026-11-22T02:11:01Z: none about this (the 19 open ones are chapter 2 story and map notes, left open).
- No paid run made. The first auto-approve run is Tom's tap on t-artgen3try.

## board-menuux4 (2026-11-22): the new main menu is approved; its four build cards are on the board

Card t-menuux-decide. Tom (11-21 18:20): "looks great now, just remove their heights and we can make the cards for this to be produced". The height labels are removed from the Family line-up in the drawings and the plan (the family still stands at real relative heights). New cards: c-menu1 (the look and the Family screen, Sonnet 5.5 high, Tom starts it), c-menu2 (Vibes and Gear), c-menu3 (Bag and System) and c-menu4 (switch on, purge the old menu), each Sonnet 5.5 medium and starting by itself, with Tom's look cards t-menu1look and t-menu4play. The bake method for the hero pictures is saved as `claude/menuux-mock/gen/bake_heroes.py`. Also new: c-b3gear, because gear changes nothing in the new battle yet (no `b3-*` file reads equipment). Card c-menuux-cards is closed as not needed. Nothing in the game changed.

## board-menuux3 (2026-11-22): the menu proposal now covers the full v11 battle design, not only what is built

Card t-menuux-decide. Tom (11-21 18:14): "did you design this for only what is implemented or to incorporate the full vision of the v11 battle system". Fact: the first drawings were made from what is in the game (two Vibes each, four people). Redrawn: Vibes has three Vibe chips with Main, Pocket and Not in use, a locked Freelancer chip (Casual Mode), two Quirk slots, and a new drawing "Vibes later in the game" with the Quirk chooser and the mastery overflow line; Family shows all six on the bench with Change; the face switcher has a +6 button for the bench. `claude/menuux-plan.md` section 4 has a table of every v11 item, whether it is built, and where it is in the proposal. Drawings and plan only; nothing in the game changed.

## smokefix1 (2026-11-22): the smoke test passes again; two tests listed for the night run, three board checks no longer read today's board

Card c-smokefix1. `tools/hollow_spot_test.py` and `tools/voice-library/sparse_files_test.py` are rows in `tools/night/tests.json` now (the night manifest check failed without them). In `tools/board_sync_test.py` the R5 replay builds its own three stalled cards plus a backlog card and a done card (it expects exactly those three to fire), and the unstick and Last night checks use `fixed()`, the real board's themes, columns and lanes with only the cards the check names, so none of them depends on which cards are open today. No rule was weakened and no game file changed.

## fix-wanstop-gen (2026-11-21): the Generate videos button comes back after a stopped video is fixed, and the card says why nothing was made

Card c-fix-wanstop-gen, from Tom on t-wanstop-gen: "the button says nothing to make right now. but there is no video made". Fact: the run (44971778287) did make both videos and spent $1.58, but both failed their checks and were stopped, so nothing went into the game. The card then said "Every video of this card is made" and "Nothing to make right now", which read as if nothing had run. Second fault found while reproducing: the page counted a stopped job as finished by its name alone, so even after a fix session raised the job's rev the button would have stayed off.

| Change | Where |
|---|---|
| A stopped (or merged, passed, already) job counts as finished only at the rev it was made at; a raised rev lists it again. The rev comes from `run.revs`, else from the stop card id `c-wanstop-<job>-r<rev>` | `board.html` `wanRunRev`, `wanDone`, `wanLeft` |
| With nothing left and stopped jobs still at their rev: "No video passed the checks yet. Stopped by the checks and being fixed by Claude: <job> (card <id>)" and the button "Waiting for Claude to fix the stopped videos. This button comes back then." | `board.html` `wanStoppedOpen`, `wanHtml` |
| The run writes each job's rev (`wgen.run.revs`) | `tools/art-library/wanbulk.py` |
| New checks: stopped at the current rev waits; a raised rev (Tom's card exactly) shows Generate all 2 videos (about $1.57); `run.revs` below the job's rev lists the job again | `tools/board_wan_test.py` |

- Pencil reports filed since 2026-11-22T01:45:21Z: none about this (the 8 open ones are chapter 2 story notes, left open).
- Tests: `board_wan_test.py` (portrait and landscape, FAILS: []), `wanbulk_test.py`, `wangen_test.py` pass. `guidegen/build_map_test.py` fails "Lounge Pass Flex ..." on unchanged main too (tom-loungepass, not touched here).

## wanstop-rose-giddyup-r7 (2026-11-21): Rose's Giddyup asks for an upright cannonball, because the last one flipped upside down

Card c-wanstop-rose-giddyup-r7. The bulk run 44971778287 stopped r7 on bg and edge (look checks not run). By eye the hand circle is right now, but the cannonball became a backward somersault: upside down at video frame 54, arm flung out to the left on landing. Both misses are that flip: the background spread over the limit is in frame 54 only (23.8, every other frame under 15), and the left edge touches are frames 58 and 59. One change, rev 8: prompt `wan-rose-giddyup-v5.txt` = v4 with "a tight cannonball" changed to "a tight upright cannonball". Kept: every other word, Kling 4.0, the start picture, 720x1280, 5 s, pad 0.65, airborne, bake and wire.

## wanstop-deedee-wetfloor-r6 (2026-11-21): Deedee's Wet-Floor drops the line that kept the mop on the floor the whole time

Card c-wanstop-deedee-wetfloor-r6. The bulk run 44971778287 stopped r6 on the look checks p1 and p2; every measurement passed (the short sweep cleared both edges). By eye she still strokes back and forth 2 or 3 times (video frames 36 to 90), and the mop shows up at her side rather than from behind her back. One change, rev 7: prompt `wan-deedee-wetfloor-v4.txt` = v3 with ", the mop head staying on top of the floor the whole time" deleted. That clause asks for a long stretch of floor contact, which the repeated strokes fill; it was only there to keep the mop above her feet, which Tom said is fine and the feet limit 0.10 allows. "Behind her back" is kept: the mop has to leave the picture for the last picture to match the first, and her baked Windex and scrub use the same words. Kept: every other word, Kling 4.0, the start picture, 720x1280, 5 s, pad 0.65, feet limit 0.10, bake and wire.

## fix-dash3-try-2 (2026-11-22): a game page opened with ?duo= always follows how it is held

Tom, on t-dash3-try, after the first fix: "didnt work, its till rotated 90 degreesclockwise". The first fix set the frame's layout from the dashboard after the game loaded; it worked in my browser but depends on timing and on the dashboard page being the new one, and it left the game itself able to obey the saved rotate choice (`le-layout`). Fix: `applyLayout` in `engine/audio.js` now treats a page whose address has `?duo=1` or `?duo=0` (every dashboard screen size puts it there) like a tablet: always auto, whatever `le-layout` holds. `forceDuo` stays as the second guard. Checked in the browser with `le-layout` saved as landscape: the 466 x 657 frame comes up upright (no `rotated`, no `landscape`). If the game still shows sideways after this build, press Reload game in the strip first so the frame loads the new engine file.

## fix-dash3-try (2026-11-22): the dashboard's Duo folded, upright size stays upright

Tom, on t-dash3-try: "duo folded upright is the wrong orientation". Cause: a folded Duo is not a tablet, so the game follows the landscape choice saved by its own rotate button (`le-layout`, shared by every game tab in the browser) and sat sideways inside the upright 466 x 657 frame. Fix: at the four Duo sizes `forceDuo` in `dashboard.html` sets the game frame's `layout.mode` to auto (frame only, nothing saved), so the layout follows how the pane is held. `tools/dashboard_test.py` now saves a landscape choice, switches sizes and checks the folded upright frame is not rotated. Reproduced and checked in the browser at 466 x 657 before and after.
## reports-2026-11-21b (2026-11-22): every boss is drawn 2.5 times larger, the Old Oak Park barrier no longer sits under the party, and the chapter 2 clean-up is finished

Second part of card c-reports-13. Eighteen reports on build wanch5 (chapter 2); fix-ch2play (above) had already cut or reworded most of the lines, so this part closes the rest and answers each report.

| Report and Tom's note | Fix |
|---|---|
| r-20261121-180138-yorh: "why is he tiny? all bosses should be HUGE. he should be at least 2.5x larger" | `b3LayoutFoes` (`engine/b3-play.js`) draws every boss (`role: 'boss'`, not an add) 2.5 times the usual fit (`B3_BOSS_SIZE`); the Big One already was. Checked in the Battle Lab on all 11 bosses: 240 px wide (the Last Call 294), none off the screen. Rows with their own `size` in `B3_FOE_LOOK` keep it. |
| r-20261121-173628-97ha: "need a cut out for this so tom and party dont overlap it" | The Old Oak Park barrier picture (`jpark-oak`, `data/gate-art.js`) was 1.7 rows tall, so Tom in row 20 stood on its top. It is now one row tall (`fit .66`) and sits wholly under the party. |
| r-20261121-180326-tsde: "boring - he should say you should hear tom" | After the Big Shake's "You snore." TNB says "You should hear Tom." (new line, no recording yet). |
| r-20261121-180458-58c9: "dialog is too boring and drawn out" (TNB at the grey tree, A on the orange block) | The block's second look reads "It's not glass and it's not glaze. And I work with glaze." (`engine/amber-spots.js`; mood, reaction and talk tables moved with it; the old clip is purged). |
| r-20261121-180018-jc8f, 180027-tyq4, 180035-bjdf, 180050-39xy, 180126-mdm1, 180230-crne, 180249-oy95, 180345-jvj8, 180408-h8ca, 180626-4eca, 180646-o5il, 180709-4jo0, 180718-y1a5 | Already fixed in fix-ch2play (lines cut or reworded, the phone call announced, Tom and TNB face Mr. Shake); closed here after checking the scenes. |

Purged voice: the audit (`unused_voice.py` check 4) listed 27 dialogue clips that fix-ch2play's cuts and rewrites left behind; all removed (list in docs/PURGED_VOICE.md). Check 4 now reports 0.

Still open: r-20261121-180439-svqd ("this scene has to be triggered before they leave", at the grey tree after the boss) and r-20261121-180541-ojxd ("the cut scene took too long to start", chapter 2 end). Findings are on card c-reports-13. Not played on a phone.

## reports-2026-11-21 (2026-11-22): chapter 2 opening zoomed in and purple from the landing, the loft talk rewritten, Carmen gets a Tom reaction, two scene spots moved

Seven of the eight reports (all on build wanch5). The eighth stays open (see below).

| Report and Tom's note | Fix |
|---|---|
| r-20261121-172826-9r47: "should be zoomed in on Tom - this should be the case at the beginning of every chapter" | `arriveLA` (`engine/travel.js`) pushes the camera in on Tom (zoom 2) from the landing line and, like the Long Island arrival, hands the zoom to `SCENES.ch2Arrive`, which zooms out after its line. Chapters that arrive by the Long Island route already did this (ch3, ch7, ch9 arrival scenes). Chapters 4 to 6, 8 and 10 have no arrival scene and are not changed. |
| r-20261121-172850-q5km: "it should be purple as soon as the chapter begins ... after this comment he should immediately note the purple sky since TNB had texted him about it" | Downtown (`blvd`) is under the haze from the landing, not after the goal flag (`STORY_MAPFX`, `data/scenes.js`). New Tom line in `ch2Arrive`: "And there's the purple. TNB texted about it in the cab. It looks even better than it sounded." |
| r-20261121-173524-egdf: "the entire intro dialogue between Tom and TNB is not funny. Tom is rude and condescending ... are you using the humor engine?" | The loft scene (`SCENES.ch2Loft`) now uses the three-things list (mud ball, muffins, fish the size of a cab) from the approved sample `claude/story-ch02-sample-loft.md` (docs/humor-brief.md voice notes): Tom is warm and flustered instead of "go first, I can wait", TNB's deadpan answers carry the jokes. Spoken lines changed: they need a new voice bake. No humor engine tool exists in this repo; the lines were written to docs/humor-brief.md. |
| r-20261121-174051-vxq1: "Tom should have some sort of funny reaction to this" (Doña Carmen, "The pupusas are fine") | New NPC field `tomReply` (also as a `when` variant): Tom speaks after the NPC's lines (`engine/overworld.js`). Used on Carmen in the smog (`data/maps-la.js`). |
| r-20261121-174119-0522: "party is standing in a weird spot - NPC not relevant to cut scenes must move out of the way" | `ch2Odette` places Tom, TNB and Nara on the street (13 to 14, 8 to 9) before the scene. |
| r-20261121-174358-pwub: "the scene should happen further up, so they are not covered by the sign" | `ch2Flurry` first walks the party up to the clearing (12,13) when Tom is south of row 14. |
| r-20261121-173717-wjou: "the sky suddenly turns purple after talking to Nara, is this correct?" | Answer: yes by the script (Nara growls, smog rolls down 2nd Ave in `ch2Smog`). Downtown is now purple from the start, so only Jefferson Park turns at that moment. |
| r-20261121-173628-97ha: "need a cut out for this so tom and party dont overlap it" | Left open: no pin and nothing in the picture overlaps. Needs Tom to say which object. |

Not checked on a phone. Smoke ran: the remaining failures (board_sync_test, night manifest, heights) were failing before this build.

## board-menuux2 (2026-11-22): the menu proposal's skill rows name the flavor in words, like the approved battle screen

Card c-menuux-plan. The battle screen proposal Tom approved on 11-21 has the rule "every icon has its word"; the menu drawings showed a flavor as a coloured dot alone. Every skill row now reads "Racket basic", "Clobber skill" (drawings Vibes, Duo and phone; `claude/menuux-mock/gen/kit.py`), and `claude/menuux-plan.md` section 4 says how the dark battle panels and the paper menu sit together and which flavor symbols are the one set. Nothing in the game changed.

## menuux-plan (2026-11-22): a proposal for a new main menu, with drawings; nothing in the game changed

Card c-menuux-plan. Tom (11-21 17:28): "The main menu needs a complete overhaul - i originally wanted it like odl school JRPG style but im now finding it dated and hard to read. and im not sure its optimized for the new battle system." The proposal is `claude/menuux-plan.md`: what is wrong today (8 findings from screenshots of every screen), what the best menus do (Persona 3 Reload, Metaphor, Clair Obscur, Bayonetta Origins and others, with sources), the direction "Golden Hour" (the paused world goes to dusk, a paper sketchbook opens, the family stands in a line-up at real heights, five tabs instead of nine commands, Vibes as a first-class screen with every skill described), how it fits the new battle system, and a four-card build plan. Drawings: 13 artboards on a Design canvas and the same screens as pictures in `claude/menuux-mock/shots/`; their generator is `claude/menuux-mock/gen/`. The hero paintings are shown without cutouts (paper divided to white, drawn with the multiply blend). Tom decides on card t-menuux-decide; card c-menuux-cards then creates the build cards. Nothing in the game changed.

## board-battleux (2026-11-21): the battle screen redesign is approved; its three build cards and your play card are on the board

Tom approved the battle screen redesign as shown (card t-battleux-decide). No change to the plan or the mock. Nothing in the game changed.

| Card | Build | Model, effort | Waits on |
|---|---|---|---|
| Build the new battle screen (c-battleux1) | battleux1 | Sonnet 5.5, high (row C) | nothing |
| Write the one-line move descriptions (c-battleux2) | battleux2 | Opus 5.5, medium (row D) | c-battleux1 |
| Add the scene marks and remove the proposal page (c-battleux3) | battleux3 | Sonnet 5.5, medium (row B) | c-battleux2 |
| Play the new battle screen on the Duo and iPhone (t-battleuxplay) | | Tom, play, on the phone | c-battleux3 |

- The cards run in order because battleux2 writes words into tables battleux1 builds, and battleux3 hooks into both. `claude/battleux-plan.md` status is now APPROVED.

## takes-2026-11-22 (2026-11-22): 1 of Tom's new voice takes is in the game (Grace's I've been nine for SIX hours)

Merged from branch `takes` with `merge-local.js` (kept take of session 20261122T021219-429). It replaced the clip the line already had (dialog-ch22.js), so no new line and no unused voice; the kept script went into `zzzz-kept-takes.json`. NOT merged, left on the branch for Tom: TNB's "Huh. That'd tip the scales." (session 20261122T015924-pqq): the kept take says "A massive fish, huh? Sounds like he tipped the scales.", which differs from the screen line, and rewording a scene line is Tom's call. `unused_voice.py` could not run here (no Python playwright); the voice index rebuilds by the voice-index Action.

## takes-2026-11-21 (2026-11-22): 3 of Tom's new voice takes are in the game (Tom's Hello Rose, Deedee's Three, Tom's I do have news)

Merged from branch `takes` with `merge-local.js` (the kept takes of sessions 20261122T014818-vsj and 20261122T015428-cdp; 20261121T015156-llm held no kept take). All three replaced a clip the line already had (dialog-ch1.js 2, dialog-ch2.js 1), so no new line and no unused voice; the kept scripts went into the ch01 and ch02 story-directions files. NOT merged, left on the branch for Tom: Grace's "Nine wrappers. There were twelve..." (that line is no longer in any scene, so a clip would be unused voice) and Tom's "A FISH was wearing my mom's muffin pan" (the take says "A massive FISH ... as a crown", which differs from the screen line; rewording a scene line is Tom's call). `unused_voice.py` could not run here (no Python playwright); the voice index rebuilds by the voice-index Action.

## voicefast1 (2026-11-21): Voice Library takes arrive in about 30 seconds again, and a crashed job now says so

Tom: takes took over 2 minutes. Cause: `tools/art-library/artgen.py` now imports `falq.py` (the WAN fallback) and `tools/costlog.py` (costs2), but the `voice-take` and `music-gen` Actions check out only `artgen.py`, so both crashed with ModuleNotFoundError about 10 seconds after the request (runs 44971818231 and 44971930950), wrote no report, and the page waited with no answer. The key stays on GitHub; no page holds it.

| Change | Where |
|---|---|
| Sparse checkout now holds all of `tools/art-library/` and `tools/costlog.py` | `.github/workflows/voice-take.yml`, `music-gen.yml` |
| A fresh request is checked every 4 s for 4 minutes, then every 20 s (was 20 s) | `engine/voice-take.js` |
| A run that failed before writing its report is shown on the line within about 15 s, with the run link (was 8 hours) | `engine/voice-take.js` `crashedRun` |
| New test: each job's script starts from only its sparse files (fails on the old lists) | `tools/voice-library/sparse_files_test.py` |

- A working take is about 20 s in the Action plus up to 4 s of polling. It cannot be instant while GitHub makes it; a hosted proxy that holds the key would be, and needs an account of Tom's.
- Tests: `sparse_files_test.py`, `keysecrets3_test.py` pass. `voicetake_test.py` fails "two doubled takes then a clean one" on unmodified main too (not caused here).

## battleux-plan (2026-11-21): a proposal for a new battle screen, with a mock you can tap (nothing in the game changed)

Card c-battleux-plan. Tom (11-21 16:59): "i think we need a total overhaul of the UX, especially for the lower half with actions ... id like to see a proposal before moving forward." And 17:01: it must also work on a desktop browser, the Duo folded and a standard iPhone.

| What | Where |
|---|---|
| The proposal page and the mock | `battle-ux.html` (ADMIN > Battle system > Battle screen redesign (proposal)); pictures in `battle-ux/`. Under 1000 px wide or 700 px tall it opens as the mock itself. |
| The plan the build cards will read | `claude/battleux-plan.md` |
| Mock source and drawings of the six screen sizes | `claude/battleux-mock/` |

The design in one line: one flat list of moves, the first tap shows what a move does and what it will do to the target, the second tap does it; the words sit in a wide strip under the scene; DETAILS adds one line to every move. No game file changed except `admin.html` (one new button). Checked: the mock's taps, aim, use, Details, Ruckus and keys by script at the Duo size and on a desktop (FAILS: []), and a picture of each of the six sizes looked at. When the new screen ships, `battle-ux.html`, `battle-ux/` and the button are removed.

## wanstop-deedee-wetfloor-r5 (2026-11-21): Deedee's Wet-Floor asks for one short sweep instead of one wide sweep

Card c-wanstop-deedee-wetfloor-r5. The bulk run 44967949648 stopped r5 (edge, p1, p2). By eye she sweeps left, right, left, right, left (video frames 32 to 91) and the mop head reaches the left or right edge at each stroke end; the 23 edge frames are exactly those. One change, rev 6: prompt `wan-deedee-wetfloor-v3.txt` = v2 with "one wide sweep" changed to "one short sweep". Kept: everything else (Kling 4.0, start picture, 5 s, pad 0.65, feet limit 0.10, bake, wire). No video made in the session; Tom taps Generate on t-wanstop-gen. Plan: claude/video-battle-plan.md 4.14.

## wanstop-rose-giddyup-r6 (2026-11-21): Rose's Giddyup asks her to circle her hand instead of twirl

Card c-wanstop-rose-giddyup-r6. The bulk run 44967949648 stopped r6 on the look checks only (p1, p2; every measurement passed). By eye the jump is right (one, straight up, knees tucked, clean return), but "twirls one hand above her head" became a full body spin: her back is to the camera at video frames 32 to 42. One change, rev 7: prompt `wan-rose-giddyup-v4.txt` = v3 with "twirls one hand" changed to "circles one hand". Kept: everything else (Kling 4.0, start picture, 5 s, pad 0.65, airborne, bake, wire). data/guide-anims.json rebuilt for both jobs. New Tom card t-wanstop-gen holds both jobs (t-wanch5-gen is Done, so its button no longer shows). No video made in the session. Plan: claude/video-battle-plan.md 4.14.

## reports-2026-11-22b (2026-11-22): Boppy's fishing spot in chapter 1 (grey grass, orange block, bulb) now shows only after the Log is beaten

Report r-20261121-172017-kfe3 (change, build wanch5, Grump Hollow): "the block/bulb/gray grass shouldnt show up until after the log is defeated." While the family follows the wrappers (`ch1-trail`) the painted spot and its solid tile are hidden; they appear when scene `ch1Spot` plays (flag `ch1-spot`, which fires after the Log). `hollowSpotHidden` in `engine/plate.js` is read by `drawHollowSpot` and by the amber spot in `engine/amber-spots.js`. Later chapters, saves past the scene and non-story modes are unchanged. Test: `tools/hollow_spot_test.py` (passes). The full smoke run could not start here (no default browser), not run.

## reports-2026-11-22 (2026-11-22): in the chapter 1 mud scene Grace now jumps in first with "Tata, look! There's the mud blob holding the muffins!"

Report r-20261121-165412-a75h (dialogue, build wanch5, scene ch1Mudling): "before this, we need a line where Grace jumps up and says \"Tata, look! There's the mud blob holding the muffins!\"" The line is a new first step of `SCENES.ch1Mudling` (before Rose's "Hello, mud!"). Nothing else changed. It has no recording yet, so it shows under No clip yet in the Voice Library (the list rebuilds itself). `data/script-index.json` rebuilt, the two `ch1Mudling` rows of `docs/script-convos.tsv` moved one step down. `unused_voice.py` reports 0 for all four checks.

## wanch5 (2026-11-21): Rose's Giddyup and Deedee's Wet-Floor are ready for one Generate tap

Card c-wanch5. No video was made and nothing was spent in this session; the first paid bulk run is Tom's tap on t-wanch5-gen (cap $2 above the ledger of $53.815).

| Job | One change | Bake (copied from) | Wire |
|---|---|---|---|
| rose-giddyup rev 6 (Kling 4.0) | Prompt v3 = v2 with "leaps up and forward to the left once" changed to "leaps straight up once" (r5 tumbled forward into the left edge). Pad stays 0.65, `airborne` stays true | strike, fps 24, step 2, 1.5x, fig_rows 83, from rose-tackle (her other Kling strike at pad 0.65; data/clips/rose-giddyup.js does not exist yet) | giddyup_tata_launch in data/b3-kit-rose.js, shape strike |
| deedee-wetfloor rev 5 (Kling 4.0) | Pad 0.65 (was 0.8), prompt v2 unchanged, per Tom's Yes on t-wanch4-wetfloor. `limits: {feet: 0.10}` with a why: the free replay of r4 measured the mop head 122 px, 9.5 percent of the frame, below her feet row (the other 4.4 checks hold) | strike, fps 24, step 3, 1.5x, fig_rows 99.3, from deedee-windex (her other cast-shaped move; data/clips/deedee-wetfloor.js does not exist yet) | wet_floor_hazard in data/b3-kit-deedee.js, shape cast |

- data/guide-anims.json rebuilt (`node tools/guidegen/build_map.js`): the Battle Guide shows the new prompt and revs.
- With a $2 cap the two first tries (about $0.79 each) fit; an edge retry (another $0.79) would pass the cap and is left for the next tap.
- Tests: board_check, wanbulk_test (B8 run with the stored r4 videos; its Wet-Floor line now expects edge only, feet 9.5 percent inside the new 10 percent limit), board_wan_test. Plan: claude/video-battle-plan.md 4.13.

## wanbulk (2026-11-21): battle videos are made, checked and put in the game by one board button

Card c-wanbulk. Tom (14:51, during c-wanch4): "Why do we have to do an opus prompt for every individual animation? This seems wasteful of my Claude usage. Can we do a bulk generation ?" The Action now does what the Opus session did by eye and by hand: it measures every video, has a vision model check the motion and the person, makes the one known retry, stops at the second miss, and bakes and wires what passes. Nothing was made or paid for in this session.

| Part | What it is |
|---|---|
| Checks (`tools/art-library/wanqa.py`) | Plan 4.4 checks 3 to 5 as measurements: standing height first against last within 2 percent; the lowest row of the figure in every picture within 1 percent of the frame height of the first picture's (a jump: the first and last picture only, job flag `airborne`); the background far from the figure stays flat magenta; the figure never touches an edge; last picture against first under 3 of 255. Checks 1 and 2 as a vision checklist made the way `artqa.py` works: one question per sentence of the MOTION part of the job's prompt plus "same person", three runs, majority, an unsure or missing answer counts as no. A job may carry `returns: false` (ends in a held pose: a knock-out), `skip_checks` or `limits` (with a plain `why` on the job) |
| One retry (`wanbulk.py`) | A video that fails ONLY the edge check is made once more with the next smaller pad of `_bulk.pads` in the job file (none, 0.8, 0.65). Any other failure, or a second miss, STOPS the job: nothing is sent again at that rev, and one Claude card (`c-wanstop-<job>-r<rev>`, Opus 5.5, medium) carries the numbers and the look-check answers. The look checker is asked only when every measurement passed or only the edge failed (a video that already failed costs nothing more) |
| Bake and wire (`wanbake.py`) | A job that passes is baked by the `bake` settings stored on the job (`bake_clip.py`: kind, fps, step, speed, fig_rows; marks found the way `clipmarks.py` finds them) and wired from its `wire` field (a row of a kit or foe file, or `B3_BODY_CLIPS[owner][state]`), the data file is syntax-checked, and all the passed jobs of a run are one commit on main with a heading named `wanbulk-<card>-<run>` |
| The card | `wan: {jobs, cap}` and `wgen: {want, run}` on a Tom card (ask animations). `board.html`: Videos on this card lists the jobs left to make and the dollar estimate, two taps (the second saves `wgen` with the commit `board: wan generate <id>`); the `wan-gen` Action starts on that commit (or by hand with `card`), sets `want` false before any spend, runs `wangen.py --bulk --card <id>` and writes `wgen.run` (merged, retried, stopped, capped, unchecked, errors, build, spent) plus one Tom card (ask animations, fyi) that lists every new clip. The run cap is the card's `wan.cap` and never above `_bulk.cap` (20 dollars) in the job file; retries count; a job the cap would pass is left for the next tap |
| Safety | A video that cannot be checked (no `XAI_API_KEY`) is kept and checked again at the next tap with no new charge. A job whose bake cannot be done (no marks found) is reported on the card and does not stop the others. `board_check.py` checks the shape of `wan` (jobs exist in the job file, `bake` and `wire` are well formed, cap within `_bulk.cap`). `board_sync.py` counts `wgen` as a paid run (never started at night) |

What the checks say about the stored videos (measurements only, free; the job flags above applied): the two plan 4.10 cases fail the way the plan says (`rose-giddyup` r4: the edge check only; `deedee-wetfloor` r4: the feet check at 9.5 percent and the edge check). Of the 46 videos (the final rev of each job) on branch `wangen`, 12 pass every measurement as they are, 2 files are not readable, and 32 fail at least one (feet 23, edge 11, background 8, last against first 6, height 2): mostly the feet rule at 1 percent (Deedee's idle drifts 2.7 percent and Tom approved it) and the end rule for moves that do not return (victory, run). The thresholds are the plan's numbers and live in one table (`LIMITS` in `wanqa.py`); a job that is judged by its own looser number says so in `limits` with a `why`. Nothing was changed on the strength of this table.

Files: `tools/art-library/wanqa.py`, `wanbake.py`, `wanbulk.py` (new), `wangen.py` (`--bulk`, `--replay-checks`), `wangen-jobs.json` (`_bulk`, `airborne` on rose-giddyup, `returns: false` on the four knock-outs), `.github/workflows/wan-gen.yml`, `board.html`, `tools/board_check.py`, `tools/board_sync.py`. Tests: `python3 tools/art-library/wanbulk_test.py` (a stand-in fal that answers with real ffmpeg videos, the stand-in xAI, a local git remote; pass, edge retry, stop, cap, bake and wire into a copy of the real kit files, the cards, a second tap, no check key, the r4 replay), `python3 tools/art-library/wangen_test.py` (W1 to W13), `python3 tools/board_wan_test.py` (the card on the page, portrait and landscape). Not exercised in a session: a real fal call, the real `bump_tags.py` inside the Action (its own tests are `tag_check` and `buildlog_test`), and the full game smoke after a merge (the first bulk card's watch card is the check).
## nighttestsb (2026-11-21): first real night test run read; the runner no longer crashes on a folder; minutes measured and groups rebalanced

Card c-nighttests, part b. First real run (GitHub run 44942942208): 197 of 210 rows ran, 306 measured minutes. 4 groups finished in 41 to 79 minutes, g3 crashed on a folder inside `tools/shots` (fixed: only files are scanned), g1 (which holds `b3_test.py`) hit the 4 hour job limit and was cancelled, so 13 rows have no result yet. 79 rows failed on main (the baseline: the next nights compare with it and add a card only for a test that was passing); 11 of them hit the time limit.
- `tools/night/tests.json`: measured minutes written back (x1.2, at least 1; rows that timed out 5; `b3_test` 70) and the groups rebalanced (`seed.py --rebalance`): `b3_test` is in g1, about 85 estimated minutes in every group.
- `tools/night/run_tests.py`: the picture scan lists files only.
- Not done: the second real run (the next night does it at 3:23 am).

## wanch4 (2026-11-21): Rose's Giddyup missed again (a somersault into the left edge); Deedee's Wet-Floor goes to Tom as a question

Card c-wanch4. Tom's answer on t-wanch3-watch was All good with no note, so nothing changed on the Skeeter's Darting Bite.

| Video | One change | Result |
|---|---|---|
| Rose Giddyup | Kling r5, pad 0.65 (was 0.8), prompt `wan-rose-giddyup-v2.txt` unchanged | Missed: top edge now clear, but the jump turned into a forward somersault and her hair touches the left edge upside down (video frames 70 to 74). Edge miss twice in a row, so stop-loss: not baked, not wired. Next one change: "leaps straight up" (the prompt also asks for planted feet), card c-wanch5 |
| Deedee Wet-Floor | none: stop-loss from wanch3 | Decision card t-wanch4-wetfloor (pictures `claude/wanch4/wetfloor-r4.jpg`) |

Also: new card c-wanbulk (Tom 14:51: one Opus session per animation is wasteful; the Action will check and retry videos itself). Nothing in the game changed, nothing purged. Notes: claude/video-battle-plan.md 4.11. Spent: fal $0.785 (ledger $53.81). Tests: `wanproof_test.py` FAILS [], `video_only_test.py` FAILS [], `b3_test.py s8` FAILS [], smoke (portrait and landscape) passes except `board_sync_test` (R5 replay, unstick card, Last night: duplicate `t-lastnight`), which fails the same way on main's board without this change.

## anim-deedee-dodge-y4m3 (2026-11-21): Deedee's Dodge is a Wan 3.0 video now: she ducks straight down with both hands on her head and stands back up

Card c-anim-deedee-dodge-y4m3, Tom's note "Make". Wan 3.0 through the wan-gen Action, job `deedee-dodge` rev 5 (run 44958736507, $0.50; the run's cap was set to $75 by Tom).
- Kept: Rose's passed duck prompt word for word (`tools/art-library/prompts/wan-deedee-dodge-v4.txt`), start picture `art/clips/start/deedee-hero.png`, figure at 80% (pad 0.8), seed 81.
- Changed from the three earlier tries (the lean wording missed three times, arms off the frame): only the MOTION, to the duck.
- Checks (plan 4.4) on all 150 pictures: reads as a duck, hands on head; same girl; feet on one row (drop 0.2% of her height); standing height first against last 1.00; no picture touches an edge; background flat; back in her stance at the end.
- Baked `data/clips/deedee-dodge.js`, `art/clips/deedee-dodge.webp`, source `art/raw/clips/wan-deedee-dodge-v1.mp4` (frames 28 to 92, every 2, 1.5x, kind state, 99.3 rows). `B3_BODY_CLIPS.deedee.dodge = 'deedee_dodge'` (before, her dodge slid her idle video); `data/guide-anims.json` rebuilt.

## b3s18bonusa (2026-11-21): Battle 3 can run a scripted story fight (midpoint end, boss starting HP, adds, Frozen, the sash); the bonus chapter is not switched yet

Card c-b3s18bonus, part 1 of 2. Rules and data only: no scene changed and chapter 21 still plays on battle 2. The bonus chapter's Brain Freeze fights needed things a plain formation does not have, so they are now data a fight carries (`cfg.setup`), read by one new rules file, `engine/b3-script.js`. The story's rows are `B3_STORY.setup` in `data/b3-story.js`, keyed by the scene step's `tut`.
- Scripted midpoint (`setup.midpoint`): the first time Brain Freeze begins a turn at or below the HP point, its steps play (a line, a big word, a status on a family member, the Deep Freeze that takes a share of everyone's HP and never below `leave`) and the fight ends with the named result, `flee` (run 1) or `shell` (run 2), not win or lose. `hold` is an HP floor under the monster for the whole fight (`hpFloor`, applied in `b3Hurt`), so the point is reached and he is never knocked out first. The end screen says the scripted word and line; CONTINUE ends the fight with that result, and `b3sEnd` writes it to `B2.result` as `flee` or `shell` so the scene steps that read it work as they did on battle 2.
- Starting HP (`setup.foeHp`): phase 2 starts Brain Freeze at half HP (Frosted Lid and Deep Freeze are open to him from his first turn).
- Adds (`setup.adds`): from round 3, every third round, Sprinkle Gremlins skitter in from the freezer up to 2 at a time, at the usual half HP.
- Frozen (new status): the holder loses every turn for its length, then acts. Not used up like a Stun (`skipTurn`). Shown as FROZEN.
- Birthday Girl (new status, `setup.start`): Grace's Birthday Sash, +75% Attack, +50% Defense, +25% crit and Skills cost 1 less Pep for her first two turns. The story layer (`b3sBegin`) adds it when the sash is on Grace; the rules apply what they are given.
- Chapter 21 floors (`B3_STORY.bonus[21]`): the story's level floor table ends at chapter 10 and its Vibe Point pool counts finished chapters, so chapter 21 would have started at level 25 with every Vibe at mastery; it gets level 5 and a pool of one chapter's worth instead (`b3sMigrate`). Vibe Points paid: 15 for each of the four normal fights and 30 for the Brain Freeze win (90 in all, the bestiary's chapter total); the flee and shell runs pay nothing.
- Balance fact: Brain Freeze phase 2 wins about 1 in 30 at level 5, about half at level 6 and nearly always at level 7 with the recommended moves. The chapter's four earlier fights pay XP, so the party should reach him near level 7; the chapter test (part 2) reads the real level.
- Checks: `tools/b3-check-s18bonus.js` (58 checks: setup rows, the 90 VP total, the floor, both scripted ends on 12 seeds each, Rose frozen in run 1 and not in run 2, the HP floor, phase 2 start HP and adds, Frozen's length, the sash's numbers and length). `node tools/b3-sim.js check`: 3329 checks, FAILS [].

## board-nightgreen3 (2026-11-21): next.md no longer says the two clip tests fail

Card c-nightgreen. `claude/next.md` (repo and Project copy) listed `clip_review_test` and `clip_kinds_test` as failing before and after b3s8; both pass today (nightgreeni, nightgreenj). Nothing in the game changed.

## board-nightgreen2 (2026-11-21): nightgreen handoff 2, 11 of 12 tests fixed or retired, the last one is ch20_test

Card c-nightgreen. The card's title, next step and prompt now name the one test left (`ch20_test`), with Sonnet 5.5 at medium effort and a cheap way to reproduce written in `claude/next-addendum-nightgreen.md` (the nightgreenl push had lost these edits in a board.json merge). Nothing in the game changed.

## nightgreenl (2026-11-21): the chapter 20 test gets past the eight doors; it still fails after the Leviathan fight (notes written)

Card c-nightgreen, test `ch20_test` (`python3 tools/ch20_test.py`). Part fixed, the row keeps `known_fail`.
- Cause of the old failure from "door rose opens" on: the test teleports the player to each door, so the seven followers stay behind, and each door scene first walks the whole party to the player in single file (about 33 tiles, about 10 seconds). The test's key presses ran out before the first line. The game is right (a player's followers trail him). `tools/ch20_test.py` now calls `placeFollowers()` after each teleport, as the other tests do. The eight doors, the Core, the lift and the whole Leviathan fight (four relays) now pass.
- Still failing: "shatter scene to Julian", "calm and epilogue to the end", "game complete flag". Checked by hand: with chapter 20 set and the flags set, the game plays the shatter scene and starts the Julian fight in about 11 seconds, so the scene and the fight work. What differs after the real fight is not found yet.
- `tools/night/tests.json`: `ch20_test` `minutes` 2 to 20 (the whole test takes about 16 minutes, 960 seconds times 1.2), `known_fail` text now says where it stops. Nothing in the game changed.

## dash3 (2026-11-21): a play card can name the place to check, and the dashboard's Next for you takes you there with one click

Card c-dash3; plan section "dash3: Take me there", facts in docs/DASHBOARD.md "Take me there (dash3)". Tom's prompt had no notes on it, so there was nothing to apply first. The game's own files were not touched, apart from the build stamp.

| Part | Result |
|---|---|
| Card fields | A Tom card with ask play may carry `jump` (`{chapter: N}`, `{chapter: N, map, flags}` or `{fight: "new"|"lab", i}`) or `where: "phone"` (touch, sound timing or speed). `tools/board_check.py` holds the shape (a bad chapter, a fight `i` the lab index does not have, both chapter and fight, a phone card with a jump, `jump` on a card that is not a Tom play card). Rule in the board section of CLAUDE.md. |
| Strip | Next for you, from the board, as drawn: the first three open play cards with a jump (theme, Play and report, the build that hands it to you, Take me there). All four: column 3 above the keyboard help, stacked; Battle: column 4, side by side, and the keyboard help moved under the screen sizes. Read from `data/board.json` on the site every 60 seconds. |
| Board pane | Take me there on the card (list and details) only when the Board runs inside the dashboard; On your phone on a `where: "phone"` card everywhere. |
| What it does | `__DASH.take(jump)`: the chapter jump, test fight and fresh start the strip already used; for a map it waits until the chapter is up, then `__LE.go(map)` and `setFlag` for each flag. |
| Backfill | Open Tom play cards: t-guardwinplay `jump {fight: "new", i: 0}` (NEW 1: TWO MUDLINGS has Tom in the party; proven in the game); t-ch2play `where: "phone"` (the real voice takes and the gaps between lines are sound timing); t-dash3-try and t-dash4-try are checks of the dashboard itself and need neither. The six cards parked in the backlog were not touched. |
| Proof | `tools/dashboard_test.py` (298 checks pass) takes every open play card's jump from the real board and checks where the game lands, then a stand-in board with three jump cards and cards that must not be listed (phone, a fourth, waiting, parked) checks the strip, Take me there from the strip and from the Board pane, and the Board on its own. Screenshots: `tools/shots/dashboard-next-1328.png`, `dashboard-board-take-1328.png`. |
| Test fixes | The test counted 27 new test fights; `data/battle-lab-index.json` has 66 now, so the counts come from the file. Two waits named nothing (a header that had not updated yet, the old Battle Lab fight mark) and now wait for what they check. |

## staletests1 (2026-11-21): three tests that failed on main now follow the data that changed under them

Card c-stale-tests. In all three the code was right and the test assumed data that has since moved; no game file changed and no paid call was made.
- `tools/art-library/clipgen_test.py`: the kept video is named by the entry's own `promptRev` (`clip-tom-give-rev1.mp4` now, the test expected rev0), so the test reads the rev from the entry. Its "main moved" check used `clip-bigone-glare`, which is approved now (the code correctly leaves an approved entry alone), so it uses `clip-grace-squeeze`, which is still a draft.
- `tools/clip-gate/vision_test.py`: `clip-tom-guard` and `clip-tom-ko` left the Art Library when the painted family battle states were purged (WAN videos are not Library entries). It now uses `clip-tom-cast` (a person move, flagged on `p_same`, a question under `hold`), `clip-grump-idle` and `clip-toad-idle` (monsters, never flagged). The advisory check runs on its own stand-in server answering no only to `n_name`. The header check uses `clip-toad-idle` in place of the rejected cast clip, whose baked header is an older cut.
- `tools/voice-learn/voicegen_test.py`: the dry run counted exactly 258 lines; it now counts the lines with no clip from `data/voice-index.json` (18 today). The long-first-tag check picked a `tom` line with no clip, so it picks the voice of the first line that has one.

## anim-rose-lava-xftr (2026-11-21): Rose's The Floor Is Lava! is a new Kling video (cushion toss, hop, two bounces) and the game draws the lava under her

Card c-anim-rose-lava-xftr. Tom's note: "Lava starts to form beneath her. She throws down a couch cushion on top of the lava, and then she jumps on top of the couch cushion, and then jumps up and down a couple of times".

| Try | What | Result |
|---|---|---|
| Kling 4.0 with lava (job rose-lava-kling, $0.78) | Only the model changed from Wan rev 4: start picture rose-cushion, prompt wan-rose-lava-v3.txt word for word, pad 0.8, start frame only | Story right, size steady (0.97 to 1.07 apart from one spike at the toss). FAIL: the lava touched the left edge in 66 of 121 pictures (Wan rev 4: 81 of 150). Job removed; video on branch wangen |
| Kling 4.0, no lava (job rose-cushion-kling, $0.79) | The fallback the card named: the same job with the lava taken out of the prompt (tools/art-library/prompts/wan-rose-cushion-hop-v1.txt = v3 minus the lava) | PASS: nothing enters from an edge, no edge touched, head size within 8% by eye. Faults left: she turns toward the viewer while bouncing and ends slightly turned |

Spent $1.57 (Tom OK'd going $0.07 past the $1.50; the cap went to 52.55 because another session's run spent $1.72 on the shared ledger at the same time). fal ledger now $52.53.

- Baked from art/raw/clips/kling-rose-lava-v1.mp4: kind strike, frames 9 to 108 every 3rd, impact 48 (she lands on the cushion), 1.5x, --fig-rows 83, --fps 24 (Kling makes 24 pictures a second), --below 10.
- `tools/clip-bake/bake_clip.py --below ROWS`: the frame keeps that many rows under the feet line (the cushion lies lower than her feet; without it the cushion was cut off). Written as `below`; `engine/clips.js` puts it on the frame as `_below` and Battle 3 (`engine/b3-play.js`) lowers the frame by it; the mirror keeps it.
- `--ground lava:F0:F1:F2`: the game draws a lava pool under her from video frame 12, full at 42 (the cushion lands), gone at 100 (she hops off). New `engine/clip-ground.js` (`bclipGround`, sizes in `CLIP_GROUND`), drawn in a clip move under the fighter and in the Battle Guide player (it loads the file from the game page). An effect, not a pose.
- `tools/guidegen/build_map.js`: the Wan job named in a clip's "Baked from" stamp wins over the job named like the clip, so the Guide shows the prompt that made the clip now (rose-cushion-kling).
- Looked at: the Battle Guide player in portrait and landscape, and the move in a Battle 3 fight in portrait and landscape. Tests: b3_test s8 pass; battle_guide_test and build_map_test each have one failure that was there before this change (the test's own sample board; Lounge Pass Flex later tries).

## nightgreenk (2026-11-21): the chapter 17 test waits for the game instead of guessing times, and gets its real time limit

Card c-nightgreen, test `ch17_test` (`python3 tools/ch17_test.py`; last time it was killed at 170 seconds, with `minutes` 2 the night runner stops it at 4 minutes). The game is right: chapter 17 plays start to finish (cab stand, tower lobby, landing, six shelves, regroup, race, vault, Twin Lenses fight, after scene). The test was wrong in two ways, both of timing:
- Sol's opening scene sets `ch17-open` to `pending` about 0.4 seconds after the tap, but the test checked after a fixed 300 ms. It now waits up to 5 seconds for the flag.
- After the six shelves, the regroup at the hatch and the start of the race press A while the previous scene can still be playing on a slow browser (its flag is set before it ends), and `pressAction` ignores a press during a scene, so the whole second half failed on some runs ("back at the stairs", then every later check). A new `idle` wait (no dialog, no scene, no transition, no step) runs before those two presses.
- `tools/ch17_test.py` has the two changes. `tools/night/tests.json`: `known_fail` removed from `ch17_test`; `minutes` 2 to 5 (measured about 205 seconds times 1.2), so the runner's limit is 10 minutes. Passes twice in a row (206 and 205 seconds). Nothing in the game changed.

## hollowfencec (2026-11-21): a comment swallowed a line in the scene clear-out search, so monsters cleared out of a scene picture lost their route

Card c-hollowfence follow-up, no new card. Cause (fact): in `hollowfenceb` the new fence check on `stageShooOut`'s search line ended with a `//` comment that also swallowed `prev.set(k,c);` from the same line, so the search never recorded where it came from and the route back to the goal came out as one tile. Fix: `prev.set(k,c);` is back before the comment. Nothing else changed.

## battleguide2 (2026-11-21): the Battle Guide opens a real fight for any move or attack, and shows everything planned but not built, marked PLANNED

Card c-battleguide2. Tom's notes on the guide: none (his card Try the Battle Guide on the Duo: "all good"). Parts 2 to 4 of the card:

| Part | What changed |
|---|---|
| In a fight | A gold-outlined **In a fight** button beside Play on every family move and every monster attack opens `index.html?go=new&i=<fight>&move=<move>` or `&act=<monster>:<act>`: a Battle Lab fight on the new battle whose family holds the owner (or whose formation holds the monster), the owner at the Rank that unlocks the move, and the move used first, once; then the fight is Tom's. Game side: `b3LabFirstOpt` and `b3LabFirst` (`engine/b3-lab.js`), `splashGoTool` (`engine/splash.js`), `b3FirstSet` and `b3FirstTurn` (`engine/b3-ui.js`), `e.force` in `b3FoePick` (`engine/b3-foe.js`). No animation was built, tuned or judged. |
| Third Vibes | Each person's third Vibe is a dashed button after their two in the Family tab: name, titles, Lean, Trait, Basic, Skills and Quirks as `claude/battle-spec-v11.md` words them, PLANNED, no Play or fight button. |
| Everything else planned | 26 Part 2 monsters and bosses (chapters 11 to 20, `claude/bestiary-v11.md`) under their own PLANNED chapter headings in the Monsters tab; a Rules topic **What is coming** (stages 16, 19 to 21, 22 and 23 in order, which chapters play on the new battle, the BAG and Run, Tombo skins, Casual Mode, knocked-out members standing at 1 HP, gear, helper links, the Twin Lenses, phase lines, picking the four again); the cheat sheet says the BAG is planned; moves named in `B3_SOON` show as planned when there are any. Search has a **Planned** chip. |
| Where the list comes from | `python3 tools/guide_planned.py` reads the plan documents and writes `data/guide-planned.json` (hashes of the sources; `--check` says when one changed). Each item carries a `when` rule the page checks against the game's own `data/b3-*.js`, so a third Vibe, a monster, a chapter or a rule in the game makes the planned item vanish and the real one show by itself. What the list was built from, row by row: docs/BATTLE_GUIDE.md "Planned, not built yet". |

Also: `data/battle-lab-index.json` was stale (27 of the 66 fights; the Battle Lab page listed too few), regenerated with `node tools/battle_lab_index.js`. docs/BATTLE3.md "Where it is played today" said chapters 2 to 20 still use battle 2; it now says chapters 1 to 10 are on the new battle (`B3_STORY.chapters`). Tests: `tools/battle_guide_test.py` (new checks listed in docs/BATTLE_GUIDE.md "Test"), `b3_test.py new1`, `node tools/b3-sim.js check`; the guide test's stand-in board now drops the guide's note cards together with their Tom cards, so its two `board_check` checks pass again.
## nightgreenj (2026-11-21): the chapter clip review test is taken off the known failures: it already passes

Card c-nightgreen, test `clip_review_test` (`python3 tools/clip_review_test.py`; the list said "failing since b3s8"). Neither the test nor the game is wrong today: on current main it passes three times in a row (about 75 seconds each) in portrait and landscape: the review panel lists the three clips, PLAY and PLAY ALL draw them in order, only the clip that plays is loaded and it is let go afterwards, REDO saves a rejection with the note, and leaving the fight removes the panel. Whatever broke it at b3s8 was fixed by a later build.
- `tools/night/tests.json`: `known_fail` removed from `clip_review_test` (its `minutes` 5 already fits). Nothing in the game changed.

## wanch3 (2026-11-21): the Skeeter Swarm's Darting Bite is a video; Rose's Giddyup and Deedee's Wet-Floor missed again and are listed

Card c-wanch3. Tom's answer on t-wanch2-watch was All good with no note, so there was nothing to apply. One try each, one change each, checked by claude/video-battle-plan.md 4.4 (details in its section 4.10).

| Video | One change | Result |
|---|---|---|
| Skeeter Darting Bite | Wan 3.0 (job `skeeter-bite` r1) with the start picture as first and last frame, the Art Library entry's prompt word for word | Passed: one jab, the small mosquitoes stay, back to its start pose. `data/clips/skeeter-bite.js`, `art/clips/skeeter-bite.webp`, source `art/raw/clips/wan-skeeter-bite-v1.mp4`; `darting_bite` in data/b3-foes-ch01.js plays `skeeter_bite` |
| Rose Giddyup | Kling r4, prompt `wan-rose-giddyup-v2.txt` (second hop dropped) | Missed, new fault: one jump now, but her hair is cut at the top edge and her hand leaves the left edge. Next: pad 0.65 (card c-wanch4) |
| Deedee Wet-Floor | Kling r4, prompt `wan-deedee-wetfloor-v2.txt` ("beside her feet, level with them") | Missed the same way a third time (mop head 114 px below her feet row) and swept twice. Stop-loss on wording: c-wanch4 asks Tom first |

Nothing was replaced, so nothing was purged. `tools/guidegen/build_map.js`: a monster now gets its Wan job in the Battle Guide when that job made its clip (the guide shows the Wan prompt for the bite). Spent: fal $1.72 (ledger $50.96). Tests: `wanproof_test.py` FAILS [], `video_only_test.py` FAILS [], `b3_test.py s8`, `guidegen/build_map_test.py` (only its earlier Lounge Pass failure), `guidegen/take_test.py`, smoke (portrait and landscape).
## voices-t-ch1voices-334 (2026-11-21): 10 voice takes made from board card t-ch1voices and merged into the game

The voice-gen Action made the takes (voiceboard1, tools/voice-learn/voiceboard.py) and merged them with merge-local.js: 10 clips, 0 lines on needs-human (silent, not merged), about 0 credits. Nobody has listened to these takes yet; the card asks Tom to.

## nightgreeni (2026-11-21): the clip kinds test is taken off the known failures: it already passes

Card c-nightgreen, test `clip_kinds_test` (`python3 tools/clip_kinds_test.py`; the list said "failing since b3s8"). Neither the test nor the game is wrong today: on current main it passes three times in a row (about 65 seconds each): the Mudling idle loop runs forward then backward with no jump (21 of 21 pictures), and Rose's knock-out plays the state clip in order and holds the last picture (39 of 39 in portrait, 37 to 38 of 39 in landscape, inside the test's allowance). Whatever broke it at b3s8 was fixed by a later build.
- `tools/night/tests.json`: `known_fail` removed from `clip_kinds_test` (its `minutes` 2 already fits). Nothing in the game changed.

## hollowfenceb (2026-11-21): a story scene clearing monsters out of its picture can no longer put one inside the Grump Hollow fence

Card c-hollowfence (second cause; the first, monsters' home spot, shipped as hollowfence). Cause (fact): when a story scene starts, every ordinary monster in the picture is walked or placed on the nearest free tile outside it (`stageShooOut`, `engine/story.js`), and that search never looked at the Hollow's `monsterFence`, so a monster could end up east of x 13 by Boppy's fishing spot. Fix: the search skips fenced tiles for monsters. `tools/hollow_trail_test.py` has a new check that clears a monster out of a picture whose nearest exit is the fence (it failed before the fix, passes after).

## nightgreenh (2026-11-21): the old Art Library page test is deleted (it tested a pasted-key page that no longer exists)

Card c-nightgreen, test `art-library/test.py` (failed at the data counts, then at a click on the "Test card" group). The test was of something that is gone, so the purge rule deletes it. Facts: it counted 560 entries by tab and one-group tabs (the library has 1,123 entries and many groups now), checked that the Test card group sits alone, drove a pasted xAI key box (`#kx`, `#sx`, "Paste the xAI key") that keysecrets1 removed (GENERATE now asks an Action), and approved and rejected through the first version of the Review viewer. What covers the same ground today: `node tools/art-library/validate.js` (data rules, banned words, ref chains; fixed in nightgreena), `python3 tools/art-library/review_test.py` (the Review viewer), `keysecrets_test.py` and `keysecrets2_test.py` (requests to the Actions), `artgen_test.py`, `upload_test.py`.
- Deleted: `tools/art-library/test.py` (`stub.py` stays, five other tests use it). `tools/night/tests.json`: the `art-library__test` row is gone. `claude/build-plan.md`: the line that listed it as a test to run no longer does. Nothing in the game changed. Older addenda in `claude/` that name it are history and are left as written.

## nightgreeng (2026-11-21): the rooms test is taken off the known failures: it already passes

Card c-nightgreen, test `rooms_test` (`python3 tools/rooms_test.py`; the list said "tomsuite"). Neither the test nor the game was wrong: the test covers bakery, library, greenhouse, post and tea (not `tomsuite`), and on today's main all five rooms pass (plate drawn, square plate, every object and NPC reachable, the door leads out, the library staff door and the Stacks stairs), twice in a row, about 117 seconds each. The `known_fail` note was a guess carried from the b3s8 list.
- `tools/night/tests.json`: `known_fail` removed from `rooms_test`; `minutes` 2 to 3 (measured 117 seconds times 1.2, the rule `tools/night/report.py` uses), so the night runner's limit (twice `minutes`, at least 3) is 4 minutes. Nothing in the game changed.

## dash2 (2026-11-21): the Admin Dashboard has its strip under the game: a bar that says when a newer build is live, five screen sizes, chapter and test fight jumps, Story battles, Difficulty, Mute and Report

Card c-dash2. Tom answered the first try (t-dash1-try) with All good and no written note, so there was nothing to change from it. Only `dashboard.html` (and its docs and test) changed; the game's own files were not touched, apart from the build stamp every push carries. Plan section "dash2: the strip under the game", drawings in `claude/dashboard-mock/`; facts in docs/DASHBOARD.md "The strip under the game (dash2)".

| Part | Result |
|---|---|
| Newer build bar | Appears when the site's newest real build (housekeeping builds skipped) is newer than the game frame's `BUILD_TAG`; Reload game runs the game's own `splashReload()`. Never reloads by itself. |
| Screen sizes | Duo folded upright and sideways, Duo open sideways and upright, Desktop wide (switches to the Battle layout). The Duo layout is forced for the game frame only (`forceDuo`, never `le-duo`); the frame's address keeps the true `?duo=` after `go=` removes it, so the game's own RELOAD lays out right from the first frame. |
| Story battles, Difficulty | The same settings as admin.html and the Battle Lab (`aot-b3-story`, `aot-diff`); Difficulty uses the game's own `b7SetDiff`. |
| Chapters, test fights | Chapter 1 to 20 and BONUS use the game's `splashGo(chapterJump(n))` (from anywhere but the title the game starts fresh first); the five new test fights open `index.html?go=new&i=N`, Show all adds the old Battle Lab fights; the fight on screen is marked. |
| Mute, Report | Mute puts one gain node of the dashboard in front of each audio output of the game frame (and silences spoken lines), is not saved and holds through a reload; Report opens the game's pencil tab or says the Report tab is off. |
| Left for dash3 | The Next for you column. |

Test: `python3 tools/dashboard_test.py` (272 checks incl. every size at 3440 x 1328 and 3440 x 1440, a stand-in newer build, a chapter jump from the title and from mid-game, both kinds of test fight, Mute through a reload, Report on and off); `python3 tools/smoke.py`.
## costs2 (2026-11-21): AI Costs fills itself in: a daily balance read and every paying job writing what its run cost

Card c-costs2. Tom's notes on the first look (t-costs1look) were "all good", so nothing in the page's layout changed for them. Facts and the table of what each service lets a job read: docs/COSTS.md "How the page fills itself in".

| Part | Result |
|---|---|
| Daily balances | New Action `costs-sync` (`tools/costs_sync.py`, 06:23 Pacific) reads ElevenLabs credits left with the repo key. fal and xAI are read only when the repo has the keys their docs require (fal: an admin scope key `FAL_ADMIN_KEY`; xAI: a Management key and team id, `XAI_MANAGEMENT_KEY` and `XAI_TEAM_ID`); a service whose key is refused gets one dated note and a line under Needs a look. One row a day per service |
| Spend logging | New `tools/costlog.py`. art-gen (xAI and WAN, with the QA checks), clip-gen (videos and gate checks), the Battle Guide take step, clip-gate, voice-gen (credits, also the board's voice job), wan-gen and the QA replay append their run to `usage`. A repeat of one run writes nothing. It never touches a job's own checkout |
| The estimate | A balance read earlier less the dollar use logged after it ("About $X until the next read"). ElevenLabs use is shown as credits and never taken off dollars. The service page lists the newest 40 use rows, newest first |
| Data | `data/costs.json`: xAI gets `usage_logged_from` 2026-11-21, its two gaps are rewritten, ElevenLabs and fal key notes name the secrets |

Tests: new `tools/costs2_test.py` and `tools/costs_fixture.py` (stand-in git remotes and servers, no paid call), W12 in `wangen_test.py`, a credits check in `voicegen_test.py`, the xAI row in `artgen_test.py`. `costs_test.py` no longer hard-codes the fal estimate (jobs add use rows, so it is worked out from the file). Not caused by this build and failing the same way on main before it: `clipgen_test.py`, `vision_test.py`, and the 258-line check in `voicegen_test.py`. Run through with a stand-in: costlog, costs_sync, art-gen, wan-gen, voice-gen. Wiring checked only (the code path was not run with a stand-in): clip-gen, the take step, clip-gate vision, the QA replay. Nothing paid was run.

## nightgreenf (2026-11-21): the grandparents' house walk test follows the repainted room

Card c-nightgreen, test `grands_walk_test` (`python3 tools/grands_walk_test.py`; failed the sofa aisle, the furniture blocks, the loop walk and two dining table touches). The test was wrong and the game was right: the painting (checked with `tools/mask_overlay.py grands`) has the sofa ending at x11, the dining table at x13 to 15 and a free lane down x12 from the hall arch to the open floor, and the walk mask matches it. The test still had the old furniture tiles (a walkable sofa aisle behind the sofa, a dining table from x12).
- `tools/grands_walk_test.py`: the lanes are the east lane (x12, rows 3 to 7) in place of the sofa aisle; the blocks check expects the sofa, the floor behind it, the coffee table, the end table, the counter and the dining set (x13 to 15, plus (12,8) and (12,9)) closed; the key-press loop walks counter aisle, nook, east lane, arch and ends at (10,4) beside the TV; the dining table touches are made from (12,6) and (12,7); the three touches that stood on tiles nobody can reach now (behind the sofa) are made from reachable tiles, and every touch now also requires a walkable standing tile.
- `data/maps-le.js`: only the comment above the grands `plateMask` is rewritten to describe the room as painted (no behaviour change).
- `tools/night/tests.json`: `known_fail` removed from `grands_walk_test`. Passes twice in a row (about 80 seconds). Not done: the one-tile `noGo` list of the room still names a few tiles that are rock now; it blocks nothing.

## nightgreene (2026-11-21): the Griffith Park test follows the repainted trail map

## board-nightqa2 (2026-11-21): the night QA closed one more of your play cards, t-gem-bug01play, with pictures

Card c-night-qa, a second hand run after build nightqa (which another session had already shipped, so this push adds no code). Tom's play card t-gem-bug01play ("Lose to The Big One on purpose and check you are not stuck") is a yes or no fact, so it is closed with `machine.verdict` pass instead of waiting for Tom. Seen in a test browser in portrait, landscape and the Duo size (951x648): after a lost fight Deedee says "Up, up. Everybody up. Deedee will make it better.", the Big One fight starts again at once with no button pressed, and the third try (a win) runs the after-boss scene. Limit: the fight result was set the way the game sets it after a loss (`battle:bigone` = lose), the real fight screen was not played, and the browser is Chromium on a server, not the iPhone. Pictures: branch `night`, `qa/t-gem-bug01play/2026-11-21/`. Nothing else changed.

## hollowfence (2026-11-21): Grump Hollow monsters no longer slip past the boss fence after a story scene

- Cause (facts, measured by printing each monster's spot and home): a monster's `home` was set lazily on its first tick (`engine/feel.js` `b7MonsterTick`). The Mudling scene moves the other monsters around first (story staging), so Skeeter and Grump took their staged spot as home (for example Skeeter at 9,9 instead of 9,13). Wander and chase ranges are measured from home, so a displaced monster could stand or wander in places the fence test did not expect.
- Fix: `placeMonsters` (`engine/world.js`) sets `home` to the placed spot, so monsters walk back to their own spot after a scene. Nothing on the fence itself changed.
- Checked: `python3 tools/hollow_trail_test.py` 10 runs in a row.

## ch3lessons (2026-11-21): chapter 3's script cut by the chapter 1 and 2 lessons before it is built: 148 lines became 124 (24 cut, 4 rewritten, one orphan fixed), every voice script retagged
## board-ch1voices (2026-11-21): a board card makes chapter 1's 10 missing voices with one tap

Tom (13:08): after playing chapter 1, voices were still missing; he asked for a card that generates them all. Every chapter 1 line the game can show (scenes, NPC houses, the six monsters, the cab trip pools) was checked against the baked clips in a real browser: 10 dialogue lines have no clip (Tom x2, Deedee x3, Boppy, Grace, Rose, Sal, Aunt Ellie; 1,313 characters, about 578 credits). New Tom card `t-ch1voices` carries them as `voices`, so Generate all voices (voiceboard1) makes them. Not in the card: Deedee's 3 battle barks (the voice job makes dialogue lines only, and Battle 3 plays no spoken move lines). No credits spent; the first paid run is Tom's tap.

## reports-2026-11-21 (2026-11-21): the phone picture under TNB's text in the chapter 1 cab scene now stays up until the scene closes it

Card c-reports-10, report r-20261121-125831-qvon. Tom: "the car in phone image should still be displayed while TNB is talking".
- Cause (stated as likely: I could not replay Tom's exact tap, only the state it left): a picture kept up with `keep:true` could be closed by any tap, click or A press in the moment between the picture settling and TNB's line opening. His report shows the picture gone while the line was on screen.
- Fix: a kept picture closes only when the scene closes it (`closeupRevealEnd(true)` from `ch1RevealEnd`); `engine/closeup.js`, `data/closeup-ch1.js`.
- Checked: replayed `ch1Sunday` in the browser (tablet size with Duo, and phone landscape): picture shown under TNB's line; calling the close at every 50 ms before the line appeared did not close it; the scene ended and the picture closed. Not looked at: Firefox, python smoke.

## guardwin1 (2026-11-21): Tom now does the victory celebration when a fight is won while his guard is up, instead of staying in the guard pose
## nightqa (2026-11-21): the night QA exists: a standing card that sorts Tom's play cards each night, two detail lines on the board page, and the rule that stops yes or no checks reaching Tom

Card c-nightqa (plan claude/night-plan.md section 8). Built: the standing card `c-night-qa` (nightly, Sonnet 5.5 medium, prompt holds steps 2 to 4 and the limits word for word); the `machine` field shown in a card's details as "Checked by the night QA" (what was seen, picture links to branch `night` under `qa/`) or "Needs your eyes" (why), with cases in `tools/board_test.py`; the Last night card ends with "Limits of the night QA" (`tools/night/lastnight.py`); the nightqa1 rule in CLAUDE.md. First night, run by hand on the 4 oldest play cards: t-alvarezplay, t-ch2play, t-ch6play, t-gatezeroplay all sorted YOURS (looks, sound, motion, timing); none closed, none failed, no pictures because no check was a provable fact. Tests: board_check ok; night_test ok; board_test's new cases pass (the run stops later at an old `#bcopy` wait that also fails without this change here); board_sync_test R5 and smoke's heights check fail with and without this change.



