# Battle screen, the storybook look: the proposal (b3story, 2026-11-27)

Card c-b3story, build b3story. A proposal, not a build: no rule, number or engine file of the battle changed.

**Read the last section first: "Exact to the mockup" (b3storyx, 2026-11-28).** Tom rejected the first mock on 11-27 23:28 ("It looks nothing like the mockup"). Sections 1 to 10 below describe that first mock and its reasoning; the mock on the site is now the one the last section describes, and that section wins where they differ. Card t-b3story-decide and the first c-b3story1 were retired; Tom decides on t-b3storyx-decide.

Inputs: Tom's mockup `claude/battleux-mock2/tom-mockup-2026-11-27.jpg`, the assessment `claude/battleux-mock2/assessment.md` (sections 1 to 7; section 7 had been wiped from the file by an unrelated push at 19:04 and was restored from git in this session's first push), the approved screen `claude/battleux-plan.md` (11-21) and `claude/b3look-plan.md` (11-22). Tom's prototype card t-b3proto-try had no note and no answer when this session started (21:45), so nothing from the prototype overrules section 7 here. Tom, 22:52 (the card's prompt again, with one rule added): "Where the party and the monsters stand stays exactly as in the game's current battle screen: read engine/b3-play.js and the Battle Lab NEW BATTLE to see it first and draw the proposal on that arrangement. The prototype's queue of family members and its small monster boxes were shortcuts of the prototype, not proposals, and are not to be copied." The mock was redrawn on the game's arrangement before anything was pushed (section 1, first row).

| Where | What |
|---|---|
| The mock Tom taps | `battle-story.html` on the site: ADMIN > Battle system > Battle screen: storybook proposal. On a phone it opens as the mock, full screen; on a screen at least 1000 x 700 it opens as a page with the mock in a frame at each real screen size (Duo unfolded sideways first) and a list of states. `?frame=1` forces the mock; `&st=<state>&det=1&rose=1&bg=night` open a state with switches. |
| Its source | `claude/battleux-mock2/src/` (`app.css`, `app.js`, `shell.html`, `view.*`, and since b3storyx `cut_ui.py` and `ui.css` for the painted frames in `battle-story/ui/`); build with `python3 -I claude/battleux-mock2/src/build.py`. Still pictures: `battle-story/`, cut by `python3 -I claude/battleux-mock2/src/cut.py` from `art/clips/start/` (for this page only; stills are never drawn in a fight). The font file `battle-story/fraunces.woff2` (SIL Open Font License, copy beside it). |
| Real data | The page loads the game's own `data/b3-rules.js`, `b3-status.js`, `b3-kit-grace/tom/rose/deedee/tnb/nara.js`, `b3-foes-ch01.js` and `b3-ux-words.js`: every move name, price, flavor, short line, description, status and monster is the game's. Damage, heals and the turn order are sample numbers. |
| Check | `python3 tools/b3story_test.py` (row in `tools/night/tests.json`): every state at the six sizes; fails when the highlighted move is off the screen or hidden in the list's scroll, a name is cut, text is under 12.5 px on a phone-sized screen, a tap target is under 44 px, the bar covers a monster's face (not checked on short sideways screens, weak spot 2), a waiting family member, the plate, Combos, the party row, the turn bar or the tools, the bar is not beside the family, a panel leaves the screen, or the page errors. It plays Grace, Tom, a monster, Deedee in a row and checks contrast on four backgrounds. Shots: `tools/shots/b3story-*.png`. |
| Purge rule | The build card that ships the real screen (c-b3story3) deletes `battle-story.html`, `battle-story/` (with `battle-story/ui/` and `compare-exact.jpg`), `tools/b3story_test.py` and its tests.json row, and the ADMIN button, in the same push; also the prototype (`battle-proto.html`, `art/proto/`, `tools/b3proto_test.py`, its row and button), as `claude/battleux-mock2/proto-plan.md` section 5 asks. If Tom answers "Change something first" and then drops the redesign, the same files go in that session. This plan and the mock source stay in `claude/`. |

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

## Exact to the mockup (b3storyx, 2026-11-28; this section wins over sections 1 to 10 where they differ)

Card c-b3story-exact, build b3storyx. Tom, 11-27 23:28, on the mock that build b3story made: "It looks nothing like the mockup. ... identify a way to mock this exactly as it is in the mockup. You just have to tap the ability a second time after it's focused to execute it." Still a proposal: no rule, number or engine file of the battle changed. Tom decides on card t-b3storyx-decide, which blocks the build card c-b3story1.

What was compared: Tom's mockup (`claude/battleux-mock2/tom-mockup-2026-11-27.jpg`, and at the Duo's width `tom-mockup-at-duo-width-951.jpg`) against the b3story mock at 951 x 648, state "Aimed at one monster" (his two screenshots of 11-27 23:29). The side by side picture of the result is `claude/battleux-mock2/compare-exact.jpg` (a copy is on the site: `battle-story/compare-exact.jpg`).

Fact about the two shapes: the mockup is a 4:3 picture, 951 x 713 at the Duo's width; the Duo unfolded sideways is 951 x 648. The 65 px that do not fit are sky. Rule used: the turn bar and the tools keep their distance from the top of the screen; everything else keeps its distance from the bottom. In the tables below, "On the Duo" is the mockup's own measurement moved by that rule, and nothing else.

How to read a position: left, top, right, bottom in screen px at 951 wide. "Kept from the picture" names the edges that must stay within 12 px of the "On the Duo" column (all, or l, t, r, b, cx for the centre across). The test reads this table: every edge within 12 px of "Now", and every kept edge within 12 px of "On the Duo".

### E1. Where each thing is and how big (measured in px)

| # | Thing | In the mockup (951 x 713) | On the Duo (951 x 648) | b3story had | Now | Kept from the picture | Why any difference from the picture |
|---|---|---|---|---|---|---|---|
| P1 | Turn bar: the scroll | 12,13,525,77 | 12,13,525,77 | 16,11,449,57 | 12,13,525,77 | all | |
| P2 | Turn bar: the big face of who is up | 30,15,90,75 | 30,15,90,75 | 36,10,84,58 | 30,15,90,75 | all | |
| P3 | Turn bar: the red Round ribbon | 282,17,331,81 | 282,17,331,81 | not drawn in this state | 281,17,331,81 | all | |
| P4 | Turn bar: the big face where the acting member lands | 442,15,502,75 | 442,15,502,75 | 347,15,385,53 (small, dashed) | 439,15,499,75 | all | |
| P5 | Tools: the 1x tag | 766,19,798,44 | 766,19,798,44 | 831,6,881,50 | 724,17,762,47 | t, b | The three tags are 1.2 times bigger for 13.5 px words. The row keeps its right end at 929, so this tag sits 42 px further left. |
| P6 | Tools: the Details tag | 806,19,884,44 | 806,19,884,44 | 706,6,824,50 | 773,17,877,47 | t, r, b | Same reason; its left end is 33 px further left. |
| P7 | Tools: the Exit tag | 892,19,929,44 | 892,19,929,44 | 888,6,943,50 | 885,17,929,47 | all | |
| P8 | The name over the list (Grace) | 459,193,544,222 | 459,128,544,157 | 371,60,465,90 (a brown ribbon) | 404,130,509,164 | t, b | It starts where the list starts, and the list is wider (P12). |
| P9 | The Basic card (tilted 2.8 degrees) | 455,235,684,296 | 455,170,684,231 | 387,100,603,163 (the first row of the list) | 395,171,681,235 | t, r, b | 1.25 times wider, as the list. |
| P10 | The BASIC ATTACK plaque | 520,229,617,254 | 520,164,617,189 | a small Basic tab on the row | 475,164,603,192 | t, b | Centred on the wider card; capitals at 12.5 px. |
| P11 | The tab with the Vibe's name | 468,314,584,337 | 468,249,584,272 | none | 407,240,558,264 | t, b | Starts where the list starts; 13.5 px words. |
| P12 | The list's frame | 456,329,683,517 | 456,264,683,452 | 377,72,613,570 (one tall bar) | 396,260,680,481 | t, r | 284 wide instead of 227 and 221 tall instead of 188: rows of 44 px with 13.5 px names and 12.5 px small words need it. It grows to the left and down; the right edge stays at the family, the top stays. |
| P13 | The first row of the list | 468,346,666,384 | 468,281,666,319 | 387,165,603,209 | 408,266,668,312 | r, b | 46 tall (the picture's is 38). |
| P14 | The gold banner (the piece as cut, tails included) | 438,380,697,434 | 438,315,697,369 | 375,213,615,390 (a box with Use inside) | 378,310,698,371 | t, r, b | Wider with the list. |
| P15 | The note with the move's one line | 472,427,664,460 | 472,362,664,395 | inside the gold box | 412,366,664,412 | t, r | Two lines of 13 px. |
| P16 | The Big One | 48,195,385,512 | 48,130,385,447 | 86,93,475,475 | 52,130,376,447 | all | The game's own picture of it has a slightly different outline. |
| P17 | The damage ring on the monster | 181,341,261,421 | 181,276,261,356 | 288,513,344,569 (on the plate) | 170,266,270,366 | all | Same centre; 1.2 times bigger so the word under the number is 12.5 px. |
| P18 | The first chip beside the ring | 237,394,320,413 | 237,329,320,348 | a tag on the plate | 239,333,358,355 | l, t, b | 12.5 px capitals. |
| P19 | The monster's plate | 119,531,328,622 | 119,466,328,557 | 8,490,358,639 | 96,466,351,590 | t, cx | 1.22 times wider (12.5 px words), and one line taller: the statuses the monster carries (Muffin-Tin Crown). |
| P20 | The Combo plaque | 585,551,714,579 | 585,486,714,514 | 627,66,943,112 (a box at the top right) | 592,483,708,515 | all | |
| P21 | The Combo gauge (the piece as cut, with its 7 px clear edge) | 440,552,860,616 | 440,487,860,551 | 748,74,929,88 (a thin track) | 440,487,860,551 | all | |
| P22 | The 50% mark under the gauge | 546,606,640,628 | 546,541,640,563 | words in the box | 508,541,661,564 | t, b, cx | 12.5 px capitals, and the game's name Double Team. |
| P23 | The 100% mark under the gauge | 657,607,790,628 | 657,542,790,563 | words in the box | 666,541,838,564 | l, t, b | 12.5 px capitals. |
| P24 | Grace's card (raised: her turn) | 434,637,528,688 | 434,572,528,623 | 364,576,542,640 | 430,570,534,631 | all | |
| P25 | Tom's card | 538,648,637,695 | 538,583,637,630 | 548,576,675,640 | 540,576,644,637 | all | |
| P26 | Rose's card | 648,648,748,695 | 648,583,748,630 | 682,576,809,640 | 650,576,754,637 | all | |
| P27 | Deedee's card | 758,648,858,695 | 758,583,858,630 | 815,576,943,640 | 760,576,864,637 | all | |
| P28 | The Pep pill under the acting card | 443,686,520,703 | 443,621,520,638 | none (5 to 1 inside the card) | 442,628,522,647 | all | |
| P29 | Grace | 682,328,748,497 | 682,263,748,432 | 618,238,700,436 | 680,263,750,432 | all | |
| P30 | Tom | 735,343,802,525 | 735,278,802,460 | 700,262,777,479 | 735,278,801,460 | all | |
| P31 | Rose | 810,414,850,540 | 810,349,850,475 | 766,374,818,523 | 808,349,852,475 | all | |
| P32 | Deedee | 850,397,908,566 | 850,332,908,501 | 808,354,883,562 | 849,332,909,501 | all | |

### E2. The look: frames, fonts, colors, ribbons, the banner, the ring

A nine-slice is one small picture of a frame cut into nine parts: the four corners keep their size, the four edges and the middle stretch, so one painted frame fits any box.

| # | Part | b3story had | The mockup shows | Now |
|---|---|---|---|---|
| L1 | Frames | One parchment panel drawn in CSS on everything: ink edge, double gold rule, brass diamonds | Each thing in its own painted frame | Each frame is cut out of the mockup picture and stretched as a nine-slice, with live text on top (table E4) |
| L2 | Turn bar | A box with two bars at its ends; faces 38 and 48; the landing face small and dashed; the words "pushed back" | A paper scroll with rolled ends; faces 38 and 60 in a gold ring; the red stitched Round ribbon; a dashed arrow to a big landing face | As the mockup. The bar ends at the landing face when it lies past the ribbon. A pushed monster's face moves back with a coral ring and no words (the chip on the monster says it) |
| L3 | Tools | Three boxes 44 tall: Details, 1x, Exit | Three small tags hanging on strings from the top edge: 1x, Details, Exit; a dark switch with a gold knob | As the mockup; each tag's painted part is 30 tall inside a 44 px tap area |
| L4 | The name | Cream letters on a brown ribbon, Fraunces 19 px | Big gold serif letters with a brown outline, straight on the scene, about 33 px | Fraunces 34 px, gold from light to deep, brown outline and shadow. The one place words sit on the scene, as in the picture; the outline carries it on any background |
| L5 | The Basic | The first row of the list with a tab "Basic" | Its own card over the list, tilted, with a BASIC ATTACK plaque and a green +2 PEP pill hanging over its right end | As the mockup |
| L6 | The list | One bar from top to bottom of the lane with a tail and a shade behind it | A maroon framed panel, the Vibe's name on a tab, three rows in view | As the mockup. No tail, no shade. The second Vibe's moves follow in the same list under a line; "More below" sits on the bottom edge |
| L7 | A row | Name, and under it the flavor word, the Pet Peeve tag and the price | Picture, name, price pill at the top right; under the name the flavor word and kind, then the Pet Peeve tag | As the mockup |
| L8 | The highlighted move | A gold box with notched ends that grows to 177 px tall with the line and the ink Use pill inside | A gold ribbon banner with folded tails, as tall as one row, hanging over both sides of the frame; the line on a paper note under it | As the mockup. No Use pill |
| L9 | A move that costs too much | Purple price pill, dimmed, "needs 2 more Pep" on a fourth line | Coral price pill, dimmed | Coral pill, dimmed, and "needs 2 more Pep" in place of the kind line |
| L10 | The forecast | A dark ring on the plate, tags under it | On the monster: a dark disc in two gold rings with four gold points, and dark chips with a gold edge beside it | As the mockup, on any monster at least 190 px tall. A small monster keeps the ring on its plate (the ring would hide it) |
| L11 | The plate | A wide panel in the bottom left corner, Fraunces name, letter in an ink disc | A gold filigree plate centred under the monster: crest, bold name, HP bar, coins, Pet Peeves as outlined chips | As the mockup. The crest holds the monster's letter. Pet Peeves are outlined purple chips that keep their flavor picture |
| L12 | Combos | A small box at the top right: "Combos 30%", a thin track | A wide ornate gauge over the party cards with a crown, a plaque "COMBO 65%", two marks under it, the reached one lit | As the mockup. The lit mark is how a Combo is used (E3) |
| L13 | Party cards | The acting card 178 wide with an ink ring, the others 127; Fraunces names; Pep only on the acting card | Four equal cards, the face in a gold ring on the corner, name, HP, Pep coins on every card; the acting card raised with a pill under it | As the mockup: 104 wide each, 10 Pep coins on every card, the pill shows the highlighted move's result ("4 → 0 Pep") |
| L14 | Fonts | Fraunces for every name, heading and number; Figtree for the rest | A serif only for the name over the list; a bold sans everywhere else | Fraunces for the name over the list (and the end panel's title); Figtree for everything else: names 800, moves 700 at 13.5 px, small words 500 at 12.5 px |
| L15 | Colors | Parchment #F7EDD3, ink #2B1A10, plum pills, gold #F2B632 | Warmer parchment, maroon frame, deeper gold, dark brown chips | Parchment rgb(238,221,186) sampled from the picture; maroon and gold come with the cut frames; price pill plum #6D4470, coral #B4503F, green #2F7D4A with a gold edge; chips #5B4630 with edge #C9A35F and words #F6E2AD |
| L16 | Where everyone stands | The game's 576 x 324 field: the family in a diagonal, The Big One drawn 2.5 times | The Big One fills the left third; the family stands in a row on the right | From the picture (P16, P29 to P32). Nobody steps forward and there is no ring under the acting member: the name over the list, the raised card and the big face say who is up |
| L17 | Aim marks | A gold arrow over and a ring under the aimed monster, always | None (one monster) | Arrow and ring only when more than one monster stands |

### E3. The interaction

| Tap | What happens |
|---|---|
| A move that is not highlighted | It becomes the gold banner, its one line shows on the note under it, the forecast moves to it. Nothing is used |
| The highlighted move (the banner, its note, or the Basic card when it is highlighted) | It is used. There is no Use button anywhere (the test fails if one exists) |
| A monster | Aims at it |
| A lit mark under the Combo gauge | Highlights that Combo: the mark gets a dark ring and the Combo shows as the banner at the top of the list with who it is with. A second tap on the mark or the banner uses it |
| Keys | Up and down move the highlight, left and right step the aim, Enter uses |

### E4. The pieces cut from the mockup, and what the Art Library would make later

Cut by `python3 -I claude/battleux-mock2/src/cut_ui.py` (pillow, numpy, OpenCV; no outside image tool) into `battle-story/ui/`, with the painted words painted out; the rules are in `claude/battleux-mock2/src/ui.css`. For this mock only. Each piece in the left column would later be one Art Library entry, painted flat, without words, on a plain background, with its corners kept clear for a nine-slice.

| # | Piece cut from the picture | File | Used for |
|---|---|---|---|
| 1 | The scroll: two rolled ends and the paper band | scroll.webp | Turn bar |
| 2 | The red stitched ribbon | ribbon.webp | Round marker |
| 3 | A hanging tag, and its string | tag.webp, string.webp | Tools |
| 4 | The Basic card's frame | basic.webp | Basic card |
| 5 | The plaque | plaque.webp | BASIC ATTACK |
| 6 | The maroon list frame | panel.webp | The list, the end panel, All details |
| 7 | The gold banner with folded tails | banner.webp | The highlighted move |
| 8 | The gold filigree plate | plate.webp | The monster's plate |
| 9 | The Combo plaque with its curls | comboplaque.webp | COMBO 65% |
| 10 | The gauge: ornate left end, dark channel, crown | gauge.webp | Combo bar |
| 11 | The gold fill | fill.webp | Combo bar |

Drawn in the page for now (CSS or SVG), and painted later as Art Library entries too: the damage ring (the picture's own ring is half under its chips), the crest, the Composure coin (full and empty), the Pep coin (kept, spent, gained), the gold face ring, the Vibe tab, the row's thin frame, the paper note, the party card, the dark and lit chips, the price pills, the switch.

### E5. The rules that were kept, and where the picture could not be matched without breaking one

| Rule | Kept? | One line |
|---|---|---|
| Text at least 12.5 px on a phone | Kept at 951 x 648 and on every smaller size | The picture's small words are 9 to 11.5 px at the Duo's width, so the list, the plate, the tags, the chips and the cards are bigger than in the picture (the "Why" column of E1). On a screen a little narrower than 951 (Firefox on the Duo shows 867 x 669) the whole design is shown scaled down to fit, so 12.5 px words measure 11.4 px there: scaling keeps the picture's arrangement, the other way lays the list over the monster's forecast |
| Tap targets of 44 px | Kept | The tags and the Combo marks are painted smaller than 44 px, as in the picture; their tap area is 44 px or more |
| Every picture with its word | Kept | The picture's two picture-only tabs are not drawn, the crest holds the monster's letter, the dumpling picture is the Support flavor picture with its word. The crown on the gauge is part of the gauge's painting, not a button |
| No tabs hiding moves | Kept | The picture's three tabs would hide four of Grace's seven moves. One tab names the Primary Vibe; the Secondary Vibe's moves follow in the same list |
| Every fact shown once | Kept | Not copied from the picture: "(+2 PEP)" a second time in the pill, "115 / 115 HP" (max HP stays behind Details), "pushes foe back 30%" beside "30% PUSH" |
| The game's words | Kept | Composure for the picture's "Shield" (a shield is another thing in the rules), "damage" for "Dmg", "Pushed back" for "30% PUSH" (a push halves when repeated, so a fixed number would be wrong), "Double Team" for "DOUBLE!", 10 Pep coins for the picture's 8 and 4 |

Not from the picture because the game's art is the game's: The Big One and the family are the game's own still pictures (for this page only), the backdrop is the game's pond, the faces are cut from those stills.

### E6. Calls Claude made that Tom can overrule

| # | Call | The other way |
|---|---|---|
| X1 | A turn opens with the Basic highlighted (as approved 11-21), so one tap on the Basic uses it | A turn opens with nothing highlighted: every move takes two taps |
| X2 | No words "tap again" on the screen, as in the picture | A small hint on the note under the banner |
| X3 | A Combo is used from its lit mark under the gauge (the picture lights "50% DOUBLE!" at 65%); it is not a row of the list until it is highlighted | Combos as the first rows of the list, as b3story |
| X4 | The forecast ring sits on the monster only when the monster is at least 190 px tall | Always on the monster |
| X5 | The plate keeps what b3story put on it and the picture lacks: the HP number and the statuses by name (Muffin-Tin Crown changes what you pick) | The picture's four lines only |
| X6 | With two to five monsters they share The Big One's ground: Front row nearer the family, Back row behind on the left, a small parchment plate under each; the full plate moves under the turn bar if monsters stand on its place | Another arrangement (the picture draws one monster) |
| X7 | The 65 px that the Duo lacks are taken from the sky | Squeezing the whole picture (everything 9% smaller) |
| X8 | While a move plays, the caption sits where the list was, low, above the Combo bar | At the top |
| X9 | "More below" sits on the list's bottom edge | An arrow |

### E7. The other sizes, the states, the check

| Thing | Fact |
|---|---|
| States | All 18 are kept (the list on the page). "As in Tom's mockup: aimed at one monster" is the picture's own state; the page opens on it. Combos 65% and 100% now show the lit marks |
| Desktop (1440 x 900) and any bigger screen | The same design scaled up as one piece; extra width goes between the monsters and the list, extra height to the sky |
| Short sideways screens (Duo folded 678 x 445, iPhone 852 x 393) | The same pieces, packed tighter: scene smaller, the list between the monsters and the family, the plate over the monster's feet, the Combo bar as a parchment box left of the cards. Weak spot as before: the plate and the list cover part of a boss |
| Upright (466 x 657, 393 x 852) | The scene on top, then the plate, the cards, the Combo box, and the list docked under them with the name beside the Basic card |
| Check | `python3 tools/b3story_test.py`: everything it checked before, plus every row of E1 at 951 x 648 read from this table (12 px), no Use button in any state, first tap highlights, second tap uses, one tap uses the pre-highlighted Basic, a tap on a lit Combo mark, a tap on a monster aims |
| Build | `python3 -I claude/battleux-mock2/src/cut_ui.py` (only when a frame changes), then `python3 -I claude/battleux-mock2/src/build.py` |

### E8. Cards (these replace section 10)

| Card | Does | Model, effort |
|---|---|---|
| t-b3storyx-decide | Tom looks at the mock beside his mockup and picks: build it in the game with these frames, make the frames in the Art Library first, or change something first | Tom (decide) |
| c-b3story1 (rewritten) | Builds this version into the game's new battle (Battle 3 only): the arrangement of E1 at 951 x 648 and its scaled and packed forms, the look of E2, the taps of E3; purges the old deck and tray; rewrites `tools/b3_layout_test.py` with this plan's checks. Where the party and the monsters stand in a fight changes to the picture's arrangement (E1 P16, P29 to P32), which is the one thing here that touches `engine/b3-play.js` | Sonnet 5.5, high (row C) |
| c-b3story2 | Scene marks, Rose Mode, keys; retires t-battleuxplay; the purge rule at the top of this plan, which now also covers `battle-story/ui/`, `battle-story/compare-exact.jpg`, `cut_ui.py` and `ui.css` if the game has its own copies of the frames | Sonnet 5.5, medium (row B) |
| t-b3storyplay | Tom plays three fights on the Duo and one on the iPhone, after c-b3story2 | Tom (play) |
