# Battle screen redesign: the proposal (battleux-plan, 2026-11-21)

Status: PROPOSED. Nothing in the game has changed. Tom decides on card t-battleux-decide (or in the chat of card c-battleux-plan). The build cards are made only after he approves.

Tom, 11-21 16:59, with a picture of the right strip on the Duo unfolded: "i think we need a total overhaul of the UX, especially for the lower half with actions. i think we need to take a step back and think about our battle system and compare the paradigm to similar paradigm in modern RPGs and then completely design the interactions from scratch. a few existing painpoints are the lack of clarity on what each skill does (the i icon isn't working well) without cluttering the space or creating extra taps (maybe a toggle to show/hide descriptions by default). the icons are also a bit confusing. im open to anything, but id like to see a proposal before moving forward." 17:01: "although the viewport i mentioned is most important, i want it to also work well in landscape on a desktop browser, duo folded, and standard iphone viewport".

| Where | What |
|---|---|
| The mock Tom taps | `battle-ux.html` on the site (ADMIN > Battle system > Battle screen redesign (proposal)). Under 1000 px wide or 700 px tall it opens as the mock itself, full screen; on a big screen it opens as the proposal page with the mock in a frame per screen size. `?frame=1` forces the mock, `?notes=1` the page. |
| Its source | `claude/battleux-mock/src/` (`app.css`, `app.js`, `view.*`, `shell.html`); build with `python3 -I claude/battleux-mock/src/build.py --split battle-ux`. The big pictures are in `battle-ux/`. |
| Drawings | `claude/battleux-mock/1-duo-unfolded.jpg` to `6-iphone-sideways.jpg`, and 1b (Details on), 1c (Ruckus ready), 1d (a family move). |
| Purge | When the new screen ships, delete `battle-ux.html`, `battle-ux/` and the Admin button in the same push. This plan and the mock source stay in `claude/`. |

The mock is not the game: real move names and descriptions (copied from `data/b3-kit-*.js` on 11-21), sample damage numbers, a still picture of the scene. Its CSS is the layout spec; its JS is not the implementation.

## 1. What is wrong today (measured at 951 x 648, the Duo unfolded, build of 11-21)

| # | Fact |
|---|---|
| 1 | Everything is in a strip 188 px wide (`--b2pw`). The scene is 763 x 429. Two bands of 763 x 72 px (above the turn bar, below the scene) are empty. `#b3-cmd` is 385 px tall and the cross in it is 168 px. |
| 2 | Four levels: cross (`B3.ui` cross), SKILLS list (skills), skill card (skill), target list (target). Reading and using a Skill: SKILLS, i, USE, target = 4 taps. |
| 3 | One Skill row does two things: the i (`[data-info]`) opens the card, the rest of the row uses the Skill. |
| 4 | The description shows only in the card, which hides the other Skills, at 179 px wide (4 to 5 lines). |
| 5 | The cross has 4 slots: BAG is always greyed, RUCKUS is greyed under 50%. The arrows are key hints on a touch screen. Pep is small text under the face. |
| 6 | Flavor pictures (emoji) have no words in the list; the Pocket picture is not explained; a monster's Pet Peeves show only in the preview box inside the card. |
| 7 | Targets are picked from a list of names in the strip. (Tapping a monster on the scene also works today, but nothing says so.) |

## 2. The paradigm, and what modern games with the same paradigm do

Battle 3 is a turn-order battle (ticks, pushes and pulls) with a build-and-spend resource (Pep), a break meter (Composure, Pet Peeves) and a team gauge (Family Ruckus). Closest relatives: Honkai: Star Rail, Octopath Traveler II, Clair Obscur: Expedition 33, and Final Fantasy X for the turn order. (From Claude's knowledge of those games, not looked up on 11-21.)

| Piece of our system | Games | What their screen does | What we take |
|---|---|---|---|
| Free Basic builds Pep, Skills spend it | Expedition 33 (AP), Star Rail (skill points), Octopath (BP) | Resource next to the moves, a price on every move, unaffordable moves dimmed | Pep bar on top of the moves with a forecast, price on every move, "needs N more Pep", +2 on the Basic |
| 5 to 7 moves from two Vibes | Pokémon, Expedition 33, Slay the Spire | No submenu for moves; text on the move or one press away | One flat list, Basic included; the highlighted move's full text always on screen; DETAILS for a line on every move |
| Touch first | Star Rail, Pokémon on phones | Tap to pick, tap again to confirm, tap an enemy to aim | The same, everywhere |
| Pet Peeves, Resists, Composure | Octopath, Star Rail, Persona 5 | Weakness drawn on the enemy; a move that hits it is marked in the list | Pet Peeve badges under each monster; PET PEEVE or RESISTS on the move |
| Turn bar with pushes and pulls | Final Fantasy X, Star Rail | The order previews before you commit | Already built (ghost face, arrows); shown as soon as a move is highlighted |
| Family Ruckus | Limit and Ultimate gauges, Persona 5 All-Out | Gauge always in view; the move appears when ready | Ruckus bar always in view; Double Team and Full Family Ruckus appear as gold moves |

## 3. The design

### 3.1 Five rules

1. **One level.** Everything the family member can do this turn is one list, "the deck": Ruckus moves when they can be used, the Basic, the Main Vibe's Skills, the Pocket Vibe's Skills under a labelled line, Pick-Me-Up while someone is knocked out, BAG when it exists. No cross, no Skills list, no skill card, no target list.
2. **First tap shows, second tap does.** A tap on a move highlights it. A tap on the highlighted move (its gold USE bar) uses it. No part of a move behaves differently from the rest. A move that cannot be used can still be highlighted and read; its USE bar says why.
3. **Aim on the scene.** A tap on a monster (or a family member's card or body) aims the highlighted move at it. It never uses the move. When a move is highlighted it is already aimed: at the monster with a Pet Peeve to it, else where this person last aimed this move, else the front monster; a heal at whoever is hurt most. A unit that cannot be the target shows its list in the strip instead (what is on it), and the aim does not change.
4. **One sentence.** The strip under the scene ("the tray") reads left to right: the move (flavor, kind, reach, name, price, full description), an arrow, the target (name, HP, Composure, Pet Peeves, statuses, what it is winding up) and the forecast (Pet Peeve, damage, pips, pushes, what it cancels, the member's next turn). While a move or a monster plays, the tray is the battle log (the old message box is gone).
5. **Every icon has its word.** A flavor is always picture, color and word together (on the move: the picture in the flavor's color plus the word under the name). A monster's Pet Peeves are flavor badges under its HP bar and named in the tray. Pocket is a labelled line, not a picture. Arrows and key names show only while a keyboard or gamepad is in use.

### 3.2 The DETAILS switch (Tom's "toggle to show/hide descriptions by default")

| | Off | On |
|---|---|---|
| Each move shows | name, flavor word, price, PET PEEVE or what it needs | the same plus one plain line (a new `short` field, 60 characters at most) |
| Full description | in the tray, for the highlighted move | the same |
| Default | phones, Duo | desktop (the strip is wide enough for all 7) |
| Where | top bar on sideways layouts; above the moves when upright | |
| Kept | on the device (`localStorage`), like the Battle Lab's settings | |

### 3.3 Parts of the screen

| Part | Holds | Notes |
|---|---|---|
| Turn bar | Faces in order, round divider, the ghost and push or pull marks, DETAILS, speed, EXIT, WIN NOW | 52 px on the Duo (was 75 plus an empty 72). Tools leave the scene. |
| Scene | The canvas, unchanged size | Over it: the aim marker, a PET PEEVE tag on the aimed monster, Pet Peeve badges under each monster's HP bar and pips |
| Party | One card per member: face, name, status chips (3 at most, as today), HP bar and number, Pep as 10 pips and a number | The member whose turn it is: blue card. An aimed member: green ring. Tap: aim a family move, else show their list in the tray |
| Deck header | Pep bar of the member whose turn it is, with the forecast (striped pips to be spent, green pips to be gained, "4 → 0"); the Ruckus bar with its 50% mark | |
| Deck | The moves | Highlighted move scrolls into view. Unaffordable moves are dimmed and say "needs N more Pep". A Capstone has a star before its name. |
| Tray | Rule 4 | On a phone held upright the description is cut at 2 lines; a tap on the tray opens it. On a phone on its side the tray is a caption on the sky with the short line. |

### 3.4 The four screens (numbers from the mock; "7 moves" is the most a member can have: Basic, 3 Main, 3 Pocket)

| Screen | Layout | Scene today, proposed | Moves without scrolling |
|---|---|---|---|
| Duo unfolded sideways, 951 x 648 | bar / scene / tray in the left column, party and deck in a right strip of 188 px | 763 x 429, same | 7 (Details on: 5) |
| Desktop, 1440 x 900 | the same; right strip `clamp(320px, 26vw, 400px)`; bigger type | 1080 x 608, 1066 x 599 | 7 with Details on |
| Duo folded upright, 466 x 657 | bar / scene / party row / tray / deck in 2 columns | 466 x 262, same | 6 |
| Duo folded sideways, 678 x 445 | the Duo unfolded layout, smaller | 502 x 282, 494 x 278 | 4 |
| iPhone upright, 393 x 852 | as Duo folded upright | 393 x 221, same | 7 |
| iPhone sideways, 852 x 393 | no band under the scene: tray is a caption over the top of the scene; party 2 x 2 | about the same | 4 |

The right strip's width follows one formula so any window works: `max(strip, 100vw - (100vh - bar - tray minimum) * 16 / 9)` (`--sidew` in `app.css`). The breakpoints are the `@media` blocks of `app.css`. The game also has its own rotated-stage mode on an upright iPhone and the Duo's `--ts` scale (docs/DUO.md): the build must fit the layout to those, not copy the mock's media queries blindly.

Known weak spots, said plainly: the two short sideways phone screens show 4 moves and scroll; long move names wrap to 2 or 3 lines in a 188 px strip; with Details on the Duo shows 5 moves.

### 3.5 Every state of today's screen, and where it goes

| Today (`B3.ui`) | Proposed |
|---|---|
| cross | The deck with the Basic highlighted (in Rose Mode: the recommended move, `b3Rec`) |
| skills, skill | Gone: the deck and the tray |
| target | Gone: the aim on the scene. Keyboard and gamepad: left and right step through the valid targets (`b3Options`) |
| ruckus | Gone: gold moves at the top of the deck from `b3RuckusPlan` when `P.ok` |
| info (tap a unit, I, pad Y) | The tray's right half for a unit that is not the target; the full list (more than fits) opens as a sheet over the tray. I and Y still open it for the member whose turn it is |
| A granted free Skill (`F.grant`) | The deck shows only what the grant allows, each marked FREE, under a line "FREE SKILL FOR <NAME>"; no way out of it, as today |
| done | The tray: the result line and a CONTINUE button; the deck is empty |
| busy (a move or monster playing) | The deck is dimmed; the tray is the log (`b3Say` lines go there) |
| First touch arms, second uses (phones today) | Rule 2 for everyone, mouse included (today a mouse click uses at once) |
| The message box (`b3Say`) | The tray. The turn tips of story fights (`onTurn`) show there too |
| WIN NOW, EXIT, speed | Top bar |

Keys: up and down move the highlight (W, S), left and right the aim (A, D), Enter or Space uses, 1 to 9 highlight a move, I the full list, Esc closes a sheet. Gamepad: D-pad the same, A uses, Y the list, B closes.

### 3.6 Data the build needs

| Need | Source |
|---|---|
| The one line per move (`short`) | New field on every `B3_SKILLS` row, written by hand, 60 characters at most, checked by the data check. The 28 lines of Tom, Grace, Rose and Deedee in `claude/battleux-mock/src/app.js` (field `s`) are first drafts. |
| Forecast | `b3Preview`, `b3Matchups` (engine/b3-preview.js), already built: Pet Peeve, Resist, Detonation, pips, Break, HP after, heals, shields, moves on the bar. The mock's "About N damage" needs `T.dmg`, which the preview already returns. |
| Reach words | From the move's `target` (`foe`, `all_foes`, `random_foes`, `ally`, `family`, `self`, `field`, `adjacent_allies`, `ally_pair`, `family_or_ko`): a small table of plain words. |
| A monster's wind-up | `intent` on the foe (the info list shows it today for an Elite or Boss) |
| Flavor symbols | Six flat symbols in the mock (`IC` in `app.js`), in the flavor colors of `B3_FLAVORS`. Rose Mode's pictures (`engine/b3-pictures.js`) are a separate set and stay. |

### 3.7 What does not change

Rules, numbers, moves, monsters, the simulator. The turn bar's content. Rose Mode's pictures and recommended move (they go on the new deck). Battle animations (out of scope by Tom's rule of 11-19). The old battle (battle 2) and its screen: the new layout is scoped to `#battle.v3`, because both share the `.b2-*` layout classes today.

## 4. Calls Claude made that Tom can overrule

| Call | Why | The other way |
|---|---|---|
| The Duo scene keeps its size; the strip stays 188 px | Tom, 11-11: make the left side as big as possible | 220 px strip: fewer wrapped names, scene 4% smaller |
| A tap on a monster aims and never fires | One meaning per gesture | A second tap on the aimed monster fires |
| The Basic is highlighted when a turn opens | The commonest turn is one tap | Nothing highlighted |
| `short` lines written by hand | A generated line reads like a formula | Generate from the move data |
| Six flat flavor symbols | Emoji are mixed styles and unreadable at 13 px | Keep the emoji, add the words |
| A mouse click follows rule 2 as well | One rule on every device | Mouse: hover shows, click uses (today) |

## 5. Build, after approval (cards are NOT made yet)

| Card | Does | Model, effort |
|---|---|---|
| battleux1 | The new screen for Battle 3 on all four screens: parts 3.3, rules 1 to 4, table 3.5, keys and gamepad. Purges the cross, the two lists, the card, the target list, `#b3-pv` in the panel, their CSS and the i icon. Rewrites the parts of `tools/b3_test.py` that drive them (the file plays every fight through the cross: 1,500 lines). Scoped to `#battle.v3`. May split into 1a (screen) and 1b (tests) if the session runs long. | Sonnet 5.5, high (row C: the design is written, the code path is not, several engine files) |
| battleux2 | The `short` line for every move of the 10 family members (about 120), the reach words and the forecast wording, in Tom's plain style | Opus 5.5, medium (row D: short lines Tom judges by taste) |
| battleux3 | On the scene: Pet Peeve badges, the aim marker and tag; the Pep forecast; Rose Mode pictures on the deck; removal of `battle-ux.html` and its button | Sonnet 5.5, medium (row B: steps written by battleux1) |
| Tom's play card | Three Battle Lab fights on the Duo unfolded and one on the iPhone, once, after battleux3 (looks and feel only; Claude tests every yes or no fact itself) | One card at the end |

Tests the build must pass: `node tools/b3-sim.js check` (rules untouched), `python3 tools/b3_test.py` rewritten for the deck, portrait and landscape; a new layout test at the six sizes of 3.4 that fails when the highlighted move is off screen, a move's name is cut, or the tray overflows; `python3 tools/smoke.py`.
