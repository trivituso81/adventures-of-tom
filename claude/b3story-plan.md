# Battle screen, the storybook look: the proposal (b3story, 2026-11-27)

Card c-b3story, build b3story. A proposal, not a build: no rule, number or engine file of the battle changed. Tom decides on card t-b3story-decide; that card blocks the first build card.

Inputs: Tom's mockup `claude/battleux-mock2/tom-mockup-2026-11-27.jpg`, the assessment `claude/battleux-mock2/assessment.md` (sections 1 to 7; section 7 had been wiped from the file by an unrelated push at 19:04 and was restored from git in this session's first push), the approved screen `claude/battleux-plan.md` (11-21) and `claude/b3look-plan.md` (11-22). Tom's prototype card t-b3proto-try had no note and no answer when this session started (21:45), so nothing from the prototype overrules section 7 here. Tom, 22:52 (the card's prompt again, with one rule added): "Where the party and the monsters stand stays exactly as in the game's current battle screen: read engine/b3-play.js and the Battle Lab NEW BATTLE to see it first and draw the proposal on that arrangement. The prototype's queue of family members and its small monster boxes were shortcuts of the prototype, not proposals, and are not to be copied." The mock was redrawn on the game's arrangement before anything was pushed (section 1, first row).

| Where | What |
|---|---|
| The mock Tom taps | `battle-story.html` on the site: ADMIN > Battle system > Battle screen: storybook proposal. On a phone it opens as the mock, full screen; on a screen at least 1000 x 700 it opens as a page with the mock in a frame at each real screen size (Duo unfolded sideways first) and a list of states. `?frame=1` forces the mock; `&st=<state>&det=1&rose=1&bg=night` open a state with switches. |
| Its source | `claude/battleux-mock2/src/` (`app.css`, `app.js`, `shell.html`, `view.*`); build with `python3 -I claude/battleux-mock2/src/build.py`. Still pictures: `battle-story/`, cut by `python3 -I claude/battleux-mock2/src/cut.py` from `art/clips/start/` (for this page only; stills are never drawn in a fight). The font file `battle-story/fraunces.woff2` (SIL Open Font License, copy beside it). |
| Real data | The page loads the game's own `data/b3-rules.js`, `b3-status.js`, `b3-kit-grace/tom/rose/deedee/tnb/nara.js`, `b3-foes-ch01.js` and `b3-ux-words.js`: every move name, price, flavor, short line, description, status and monster is the game's. Damage, heals and the turn order are sample numbers. |
| Check | `python3 tools/b3story_test.py` (row in `tools/night/tests.json`): every state at the six sizes; fails when the highlighted move is off the screen or hidden in the list's scroll, a name is cut, text is under 12.5 px on a phone-sized screen, a tap target is under 44 px, the bar covers a monster's face (not checked on short sideways screens, weak spot 2), a waiting family member, the plate, Combos, the party row, the turn bar or the tools, the bar is not beside the family, a panel leaves the screen, or the page errors. It plays Grace, Tom, a monster, Deedee in a row and checks contrast on four backgrounds. Shots: `tools/shots/b3story-*.png`. |
| Purge rule | The build card that ships the real screen (c-b3story3) deletes `battle-story.html`, `battle-story/`, `tools/b3story_test.py` and its tests.json row, and the ADMIN button, in the same push; also the prototype (`battle-proto.html`, `art/proto/`, `tools/b3proto_test.py`, its row and button), as `claude/battleux-mock2/proto-plan.md` section 5 asks. If Tom answers "Change something first" and then drops the redesign, the same files go in that session. This plan and the mock source stay in `claude/`. |

## 1. What the screen is

The scene keeps the whole screen; every control lies over it (Tom, 11-27 17:03). On an upright phone only, the list docks under the scene (section 7 row 6).

| Part | Where (sideways screens) | Holds |
|---|---|---|
| The field | The game's own 576 x 324 battle field (engine/b3-play.js, engine/battle-state.js), as large as it fits between the screen's top and the party row, standing on the party row so every foot stays in view; the backdrop fills the whole screen behind it | The family on BATTLE_POS: a diagonal from up-left (slot 0) to down-right (the last slot), a Back row member 14 further right. The monsters on b3LayoutFoes's spots: the Front row in a column near the middle (x 158 to 188), the Back row in a column behind it on the left (x 70 to 92), a boss drawn 2.5 times. Sizes from the game's frames. Nobody moves except the acting member's one step. |
| Turn bar | Top left, a paper scroll with rolled ends | Faces in turn order, the red Round ribbon, the ghost of where the acting member lands after the highlighted move (dashed face), "pushed back" beside a monster the move pushes, "!" on a monster winding up, "F" on a Flustered one |
| Tools | Top right, three hanging paper tags | Details switch, speed (1x, 2x), Exit |
| Monster strips | Under each monster's feet, as the game's meters are today | Each monster except the aimed one: letter, name, HP bar, Composure pips; Pet Peeves (flavor picture and word) when 3 or fewer monsters stand (with 4 or 5 they are on the plate when aimed, and the rows' Pet Peeve tags say which moves hit them). |
| Plate | Bottom left; top left under the turn bar when a monster stands in the bottom-left corner (a 3-monster Front row) | The aimed monster: letter, name, HP, Composure (the pips this move takes pulse), statuses by name, Pet Peeves, Resists, Back row; the forecast ring (damage) and tags (1.5x Pet Peeve, Knocks it out, BREAK!, Cancels Swamp Chomp; Details adds Composure lost and statuses left). For a move on every monster it sums up ("15 to 23 each, Pet Peeve on 2 of 5") and each strip shows its own number. |
| The bar | Left of the family group (the monsters' side), level with the acting member's shoulders, its tail pointing at them; in the lane between the monsters and the family | The member's name on a ribbon (Details adds the Primary Vibe), then one list: Combos moves when offered, Pick-Me-Up while someone is knocked out, the Basic (own frame and a "Basic" tab), the Primary Skills, a line "Secondary: <Vibe>", the Secondary Skills. Each row: flavor picture, name, under it the flavor word and kind, the Pet Peeve tag and the price. The highlighted row becomes a gold banner with its one line (Details: the full description) and the ink Use pill ("tap again"). A move that cannot be used says why ("needs 2 more Pep"). |
| Family | The game's diagonal (the field row above) | The acting member takes one step toward the monsters and stands on a pale ring; the aimed member gets a gold ring and an arrow; a knocked-out member lies down, grey |
| Combos | Under the tools, over the sky above the family (desktop: in the top line; short screens: the left end of the party row) | "Combos 65%", a gold gauge with a notch at 50, "50% Double Team" and "100% Family Ruckus" under it |
| Party row | Bottom, from the lane to the right edge | One card each: face, name, HP bar and HP. The acting member's card is wider, ringed in ink, and holds the Pep: 10 pips (ink kept, striped spent, green gained) and "4 → 6". The aimed member's card is lamplit with the forecast above it ("+26 HP", "Clears Drenched", "+29 shield"). MARKED, NEXT TARGET and Knocked out show on the card always. |
| Caption | Low in the lane, above the party row, only while a move or a monster plays | One line: "Grace uses Crunchy Sugar-Cube Pop!" and a second small line with the result |
| End | A panel in the middle | "You win!", XP, each member's Vibe points, what was found, Continue |
| All details | A sheet over the lane | Opened by tapping a family card that cannot be aimed at, or the plate of a monster the move cannot aim at |

The moving part, in order: a turn opens, the member takes one step toward the monsters, the bar slides in from where the last member stood and opens with the Basic highlighted (Rose Mode: the recommended move). Tap a row: it opens and its aim is set (a monster with that Pet Peeve, else the last aimed, else the front one; a heal goes to whoever is hurt most). Tap a monster or a card: aims. Tap Use: the bar folds in 150 ms, the caption shows, the move plays, numbers pop, and the next member's turn opens. Monster turns play with the bar away.

## 2. Section 7, drawn: what was kept and what the drawing changed

| # | Section 7 said | Drawn | Kept or changed, and why |
|---|---|---|---|
| 1 | The acting member takes one step toward the monsters; the bar opens on that side at shoulder height with a tail, slides from the last member's spot, clamped 12 px inside; above them if no room | Built on the game's diagonal: the step (16 field units), the tail at the shoulder (Nara's at her head), the slide from the last member | Changed one thing: the bar opens left of the whole family group, not right beside the acting member. In the game's diagonal every member but slot 0 has others to their left, so a bar right beside Tom, Rose or Deedee would lie over the family; the group's left edge is the first free line. There is no room above anyone (the diagonal fills the right side top to bottom), so the "above" fallback is not used. |
| 2 | An empty lane of at least 22% for a bar of 210 to 240 px; a full plate for the aimed monster, a strip under the others; the ring moves to the plate | Built | Changed what the game's arrangement forces. The lane is what the game leaves: from the right edge of the monsters (and their strips) to the family group's left edge. With five monsters it is about 280 px on the Duo and the bar fits. With a boss drawn 2.5 times it is about 165 px, so the bar (236 px at least, or names wrap to three lines) lies over the boss's right edge (The Big One's lure and coin), never its face; the test checks the face. The full plate has one home, bottom left, moving to top left only when the Front row fills that corner; under the aimed monster it would cover its neighbours in the game's column. |
| 3 | The bar folds away on Use (150 ms), stays away through the move and monster turns, opens beside the next member; one caption line low on the scene; party row, turn bar, Combo bar stay | Built as written | Kept. The caption sits in the lane, above the party row. |
| 4 | No text on the scene; solid paper, ink edge, shadow; a ribbon behind the name; a 15% shade behind the open bar | Built | Kept. Checked on the pond, a night scene (Moon Club dome), a dark indoor scene (library) and a bright one (classroom): see section 7. |
| 5 | 44 px rows, 15 px names, nothing under 12.5 px; a row shows flavor picture and word, name, price; only the highlighted row opens; party cards with Pep pips only for the member up | Built | Changed the row's shape: the flavor word and the price sit on a second line under the name (with the Pet Peeve tag), because on one line at 15 px nearly every name wrapped. In the lane the game leaves, the Duo shows the open move and 4 or 5 more; "More below" marks the rest and the open move always stays in view (tested). |
| 6 | Upright: the list docks as a sheet under the scene, the party row between; sideways iPhone keeps the overlay with 4 rows and scrolls | Built last | Kept, with the plate and the Combos gauge also between the scene and the sheet, and the scene cut to 2:1 instead of 16:9 so the sheet gets 25 px more. iPhone upright: party cards 2 x 2 (four in a row cut "Deedee"). Sideways iPhone shows the open move plus 2 rows (the open move is as tall as two rows), not 4: the plan says so as a weak spot. |
| Finding | Two moves picked; no Use; tabs; repeats; "Shield" | Built | Kept, one change: no "Primary" line. The name ribbon heads the Primary moves and "Secondary: Craft Artist" is the one divider, as section 7 drew it; Details adds the Primary Vibe's name to the ribbon. |

## 3. Every row of the assessment's sections 2, 3 and 4

Section 2 (problems in what is drawn):

| # | Problem | Solution in the mock |
|---|---|---|
| 1 | Two moves look picked | One list, one gold banner; the Pep forecast on the acting card follows it (Crunchy: "5 → 1") |
| 2 | No way to use | Use pill in the open row, "tap again"; Enter on a keyboard |
| 3 | Three Vibe tabs | No tabs; two Vibes, as the game brings them |
| 4 | Tabs hide moves | All 7 in one list (Open-String Violin Screech and Masterpiece Portrait Makeover in view, tagged Pet Peeve against The Big One) |
| 5 | The same fact several times | Pet Peeve: row tag and plate. Pep change: acting card. Push: turn bar. Name: ribbon and card. Max HP: Details only |
| 6 | Pep pips wrong | 10 pips, ink, striped and green, with the number |
| 7 | "Shield" | Composure; the pips this move takes pulse |
| 8 | Pictures with no word | Every flavor picture has its word; Pet Peeves are picture and word chips; the crest, the crown and the tab pictures are gone. Turn bar faces stay pictures (b3look: read at a glance) |
| 9 | Pet Peeves plain purple | Chips in the flavor's own color with its picture, the same picture as the rows |
| 10 | The turn bar lost its marks | Ghost, "pushed back", "!" and "F" badges |
| 11 | "30%" | The push shows as the monster's face moving back on the turn bar, no percent |
| 12 | Dimmed move without a reason | "needs 2 more Pep" on the row; the Use pill says it when highlighted |
| 13 | Ring on the body | Ring on the plate |
| 14 | The Big One's own state | Statuses named on the plate always (Muffin-Tin Crown); Details adds turns left |

Section 3 (layout and build):

| # | Problem | Solution |
|---|---|---|
| 1 | Panel over the scene | Kept as Tom asked; the lane (section 2 row 2) keeps it off every monster, tested |
| 2 | Family squeezed | The family stands as the game stands it (its diagonal, bigger than in the mockup); the bar opens left of the group; aiming at family works on the cards (always clear) and on bodies |
| 3 | Text too small | 12.5 px floor, tested at five phone sizes |
| 4 | One shape | Six real sizes drawn and tested |
| 5 | Tap sizes | 44 px, tested (rows, strips, cards, tools, Use) |
| 6 | Long names | Wrap to two lines, never cut, tested ("Kingdom of Ten-Thousand Blankets", "Stunt-Double Squirrel Intercept") |
| 7 | Painted frames vs live text | CSS frames, live text; painted pieces listed in section 6 |
| 8 | Light panels on bright scenes | Solid panels, ink edges, shadow, the shade; measured (section 7) |
| 9 | A third look | Storybook for the battle screen only; section 5 says what the menu would need |

Section 4 (cases the game has):

| # | Case | Mock state | Solution |
|---|---|---|---|
| 1 | More than one monster | Five monsters | 3 Front, 2 Back; strips; "Back row" on the plate |
| 2 | Moves that do not aim at one monster | Every monster; floor | Every monster: every strip ringed with its own damage, the plate sums up. Random: strips ringed dashed, the plate says how many hops. Floor: the monsters' ground glows with "Wet-Floor Hazard goes here". Self, the whole family, neighbours and pairs light the cards they reach |
| 3 | Aiming at a family member | One family member | Lamplit card, ring and arrow on the body, forecast over the card |
| 4 | Statuses | Statuses | Plate: always by name. Strips and cards: with Details on. MARKED, NEXT TARGET, Knocked out: always on cards |
| 5 | A monster winding up | Winding up, Rose marked | Red "Winding up: Swamp Chomp" over The Big One, "!" on its face in the turn bar, MARKED on Rose's card; Crunchy's forecast says "Cancels Swamp Chomp" |
| 6 | Break and big results | Statuses (Log Lump Flustered) | "Flustered: takes 35% more" in place of the pips, stars over it, "F" on the turn bar; BREAK!, Knocks it out, Cancels, Resists as plate tags |
| 7 | Using a Combo | Combos 65%, 100% | "Combos" group at the top: Double Team at 50, Family Ruckus at 100, each "With <the next family member on the turn bar>" and its price in Combos |
| 8 | Someone knocked out | Rose knocked out | Grey card "Knocked out", body lying; Pick-Me-Up under "Anyone" for everyone, aimed at her card; "Back on their feet" over it |
| 9 | A free Skill | A free Skill | Only the allowed Skills (4 Pep or less) under "Free from Grace", each marked Free; no way out, as today |
| 10 | While a move plays | A move playing | Bar away, caption in the lane, damage pops on the monster |
| 11 | The end | End of the fight | "You win!" panel and Continue |
| 12 | Details on | Details switch | Section 4 |
| 13 | Rose Mode | Rose Mode switch | Picture (the game's emoji set) beside the word on every row, "Try this" on the recommended move, which opens highlighted |
| 14 | Other parties | A party of three with Nara | Tom, TNB, Nara; the bar sits beside Nara with its tail at her head. Bosses with 7 pips fit the pip row. Skill Lock is not drawn: it would replace the row's price with a coral "Locked" |
| 15 | Keys and gamepad | Any state, desktop | Up and down move the highlight, left and right step the aim, Enter uses; after a key the Use pill says "Enter" and a key line shows at the foot of the bar |

## 4. The Details switch

| Part | Off | On adds |
|---|---|---|
| Bar | Name, flavor word and kind, price, Pet Peeve tag, why it cannot be used; the open row's one line | Every row's one line; the open row's full description; the Primary Vibe on the ribbon |
| Plate | Name, HP, Composure, statuses by name, Pet Peeves, damage, the big tags | Max HP, turns left on each status, Composure lost, statuses the move leaves |
| Strips | Name, HP, pips, Pet Peeves | Statuses |
| Cards | Face, name, HP bar and HP; Pep on the acting card; MARKED, NEXT TARGET | Max HP, Pep of the others, statuses, "Back" for a Back row member |

## 5. If the menu follows (Tom's call; the menu keeps its look in this proposal)

| Menu part (m2.css) | Today | To follow the storybook look |
|---|---|---|
| Backdrop | Plum dusk | A painted book cover or the current scene, dimmed |
| Pages | Flat paper (`--paper`) | Parchment with the ink edge and double gold rule (`.pn` of app.css) |
| Type | Bricolage Grotesque display, Figtree text | Fraunces display, Figtree text |
| Selected row | Lamplight fill | Gold banner with notched ends |
| Tabs (Family, Vibes, Gear, Bag, System) | Pills | Ribbon bookmarks |
| Gauges | `.m2-gauge` | The Combos gauge (dark channel, gold fill) |
| Chips, buttons, switch | Pills, ink pill, green switch | Unchanged |
| Work | | One CSS change in the shared variables plus the font file; no layout change |

## 6. Painted pieces that would come from the Art Library (none made)

The mock draws every frame in CSS and that is the recommendation. If Tom later wants painted frames, these are the pieces, each one Art Library entry (never an outside image tool), cut to stretch (nine-slice: corners kept, edges repeated):

| # | Piece | Used by |
|---|---|---|
| 1 | Parchment panel with ink edge and double gold rule, nine-slice | Bar, plate, strips, cards, tools, end panel, sheet |
| 2 | Rolled scroll ends, a pair | Turn bar |
| 3 | Red Round ribbon with a swallowtail | Turn bar |
| 4 | Brown name ribbon with notched ends | The bar's header |
| 5 | Gold highlight banner with notched ends, stretchable middle | The open row |
| 6 | Combos gauge: dark wood channel with gold end caps and the 50 notch, plus the gold fill | Combos |
| 7 | Small brass corner diamonds | Panel corners |
| 8 | Gold face medallion ring | Turn bar faces, card faces |
| 9 | Gold aim arrow and the ground ring | Scene |
| 10 | Composure coin, full and empty | Plate, strips |
| 11 | Six flavor badges (Clobber, Sizzle, Drench, Razzle, Racket, Support) in the flavor colors | Rows, Pet Peeve chips |
| 12 | Red wind-up banner | Scene |
| 13 | Hanging string and tag for the tools | Tools |

## 7. Contrast (measured by the test)

| Check | Result |
|---|---|
| Ink #2B1A10 on parchment #F7EDD3 | 14.3:1 |
| Dimmed row text (ink at 60% on parchment) | 4.2:1 |
| Panel edges against the scene, 4 px outside every panel: pond, night, dark indoor, bright indoor, with 1 and 5 monsters, Duo and desktop | every sample at least 2.2:1 against the parchment or the ink edge (0 misses in 16 screens, 298 to 486 samples each) |
| Text straight on the scene | None (damage pops have an ink outline) |

## 8. Calls Claude made that Tom can overrule

| # | Call | The other way |
|---|---|---|
| 1 | The bar opens left of the whole family group, level with the acting member, its tail pointing at them; the acting member takes one step | Right beside the acting member (it would lie over the members to their left) |
| 2 | The aimed monster's full plate has one home, bottom left (top left when the Front row fills that corner); the others keep strips | The plate under the aimed monster |
| 3 | The bar is 236 to 290 px on the Duo, 340 on desktop, and may lie over a boss's edge (never its face) | 210 to 240 px, three-line names |
| 4 | Strips under each monster as the game's meters; with 4 or 5 monsters no Pet Peeve line on the strips | Pet Peeves on every strip (taller strips over the monster below) |
| 5 | Flavor word, Pet Peeve tag and price on a second line under the name | One line, more names wrap |
| 6 | Use is an ink pill beside the open row's line ("tap again"); in a narrow bar it gets its own line | A full-width gold bar |
| 7 | The Combos gauge sits under the tools, over the sky above the family (desktop: the top line), so the party row stands clear and the family's feet show | Above the cards as in the mockup (covers Rose's and Deedee's feet) |
| 8 | Short screens put the Combos gauge at the left end of the party row | Above the cards |
| 9 | The caption sits low in the lane | At the top under the turn bar |
| 10 | Fraunces (free font, SIL OFL) for names, headings and numbers; Figtree for the rest | The menu's Bricolage Grotesque |
| 11 | Monster statuses are named on the plate with Details off (b3look had them behind Details; The Big One's healing crown changes what you pick) | Behind Details, as 11-22 |
| 12 | The open row shows its one line (b3look kept it off the highlighted row because the tray said it; there is no tray now) | |
| 13 | No "Primary" line; the name ribbon heads the list | A "Primary" line (costs a row on the Duo) |
| 14 | Monster letters A to E on strips and the plate (on the scene for short and upright screens) | No letters |
| 15 | Upright: scene 2:1, then plate, party row, Combos, the list as a sheet; iPhone upright cards 2 x 2 | 16:9 scene |
| 16 | Rose Mode opens with the recommended move highlighted | The Basic |
| 17 | End panel title "You win!" (said once, on the panel) | |
| 18 | Tapping a family card that cannot be aimed at opens All details | Nothing happens |
| 19 | The game's field stands on the party row and fills the width it can (centred); the backdrop fills the whole screen | The field pinned to the screen's bottom (the party row would cover the lower members' legs) |
| 20 | Short sideways screens keep the bar left of the family even with a boss, so it covers part of the boss, face included | Open the bar on the family's far side on short screens (it then sits right of the acting member) |

## 9. Weak spots, said plainly

| # | Fact |
|---|---|
| 1 | With a boss (drawn 2.5 times by the game) the lane on the Duo is about 165 px, so the bar lies over the boss's right edge: on The Big One its lure and coin. Its face stays clear (tested). |
| 2 | On short sideways screens (Duo folded 678 x 445, iPhone 852 x 393) the field is small: the bar covers part of a boss, its face included, and shows the open move plus 1 or 2 rows; the rest scroll with "More below". Call 20 is the other way. |
| 3 | With five monsters the game stands them in two columns; a strip under one lies over the head of the one below it, as the game's meters do today. The monsters are about 100 px tall on the Duo. |
| 4 | The family stands in an overlapping diagonal; aiming at a body can pick the wrong one, so the cards are the sure way. |
| 5 | Details on lengthens every row: the list scrolls on every phone size. |
| 6 | Upright, the field in a 2:1 scene is small (The Big One about 110 px tall on the iPhone). |

## 10. Build cards (made in this push; models by claude/handoff-rules.md)

| Card | Does | Model, effort |
|---|---|---|
| t-b3story-decide | Tom picks: build as shown, build and make the menu follow, or change something first | Tom (decide) |
| c-b3story1 | The storybook screen in the game, Battle 3 only (`#battle.v3`): the overlay layout of section 1 at every size (container queries like b3-deck.css), the bar left of the family group at the acting member's shoulder, the acting member's one step (the scene draws it), the plate home, strips, turn bar marks, Combos, party row, caption, end panel, All details, the upright sheet; the look in CSS with Fraunces in `fonts/`; new words into `data/b3-ux-words.js`. Purges the old deck and tray layout. Rewrites `tools/b3_layout_test.py` with this plan's checks and the parts of `tools/b3_test.py` that drive the deck. May split into 1a (sideways) and 1b (upright and tests). | Sonnet 5.5, high (row C: the design is written, the code path is not, several engine files) |
| c-b3story2 | Scene marks and switches: aim ring and arrow, floor glow and label, wind-up banner, Flustered stars, letters on short screens, Rose Mode pictures and Try this, keys; retires card t-battleuxplay (the screen it tested is gone); the purge rule at the top of this plan (the mock, the prototype, their tests and buttons) | Sonnet 5.5, medium (row B: steps written by c-b3story1) |
| c-b3story-menu | Only if Tom picks the menu: section 5's table | Sonnet 5.5, medium (row B: one CSS table and a font) |
| t-b3storyplay | Tom plays three Battle Lab fights on the Duo and one on the iPhone, after c-b3story2 (look and feel only) | Tom (play) |

Not changed by any of them: where the party and the monsters stand (the game's field), rules, numbers, moves, monsters, the simulator, battle 2, battle animations (Tom's rule of 11-19).
