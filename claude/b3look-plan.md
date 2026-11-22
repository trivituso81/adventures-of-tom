# Battle screen: the new menu's look, and only what is needed (b3look-plan, 2026-11-22)

Card c-b3look, build b3look. Written before any code changed, from pictures of the menu (951 x 648 with ?duo=1, 393 x 852) and of a Battle Lab NEW BATTLE fight at the seven sizes of `tools/b3_layout_test.py`.

Tom (11-21 23:56): "use that design as inspiration to update the design of the battle system controls and all of the battle controls ... everything from colors to backgrounds to font styles ... remove any extraneous information ... a toggle at the top to show details, it should hide the details from like everything, literally ... really well organized and clearly laid out ... evaluate the labels versus the icons and what should be more prominent, like when we should be using color or not, and grouping similar pieces of information or keeping labels for icons near the labels and avoiding redundant information most of all".

Kept as approved (claude/battleux-plan.md): one list of moves, the first tap shows, the second tap uses, a tap on a monster aims; the layout grid and the scene's size at every screen size; every rule and number; battle 2.

## (a) The style, taken from the menu

The menu's variables are declared once in `m2.css` on `#m2, #b3-app` (one rule, so the battle screen reads the same values; nothing is copied). The two typefaces are the menu's `@font-face` rules in `m2.css`.

| Piece of the battle screen | Menu rule it comes from | What it looks like |
|---|---|---|
| Frame and turn bar background | `#m2` background `--dusk` | Plum dusk around the scene, like the menu's backdrop |
| Turn bar words and tools | `.m2-top` (`--cream` text on dusk), `.m2-x` (pill, `rgba(255,241,214,.14)`) | Cream words, pill buttons |
| Party, deck and tray surfaces | `.m2-page` (`--paper`, `--ink`), `.m2-page.r` fold shadow | Paper pages with plum ink; the strip has the book's gutter shadow on its left edge, the tray a soft top rule |
| Names, move names, numbers | `--disp` (Bricolage Grotesque) at 700 to 800, as `.m2-kh b`, `.m2-name` | Bold warm display type |
| Everything else | `--text` (Figtree), as `.m2-kr p`, `.m2-lab` | Plain text, nothing under 12.5 px on phones, no small caps |
| Group lines (Primary, Secondary, Combos) | `.m2-lab` with `--rule` | Soft 13 px label with a hairline |
| Move row | `.m2-br` (Bag row) and `.m2-kr` (kit row) | Row on the page, rule between rows; flavor circle `.m2-fl`; kind word `.m2-kh small`; price `.m2-kc` ("3 Pep") |
| Highlighted move | `.m2-br.sel` (`--lamp` fill, `#E0A02F` inset) | Lamplight fill |
| USE bar | `.m2-btn.on` (ink pill, cream text) | Ink pill, "Use", small "tap again" |
| Chips | `.m2-chip` (`--shade` pill, 12.5 px), `.m2-chip.good` | Pills; green for a good result, coral for a bad one |
| HP bars | `.m2-bar` (green, `.low` coral, `rgba(43,26,51,.15)` track) | Green bar, coral at a quarter or less |
| Pep pips | `.m2-bar` track, `--ink` | Ink pips; striped to be spent, green to be gained |
| Combos gauge | `.m2-gauge` (`--gold`, `--goldink` inset, ink mark at 50) | The menu's gauge |
| DETAILS switch | `.m2-tog` (green when on) | The menu's switch, labelled "Details" |
| Up member's card | `.m2-fc[aria-selected]` (ink ring) | Ink ring |
| Aimed member's card | `.m2-br.sel` | Lamplight fill (the same signal as the highlighted move: "what you picked") |
| Sheet (All details) | `.m2-sheet` (`--cream`, rules) | Cream sheet over the scene |
| CONTINUE | `.m2-btn.on` | Ink pill "Continue" |

## (b) Every piece of information, and the call

"Shows" counts the places the same fact appeared in the build of battleux2. Kind: L label (words or number), P picture, C color.

| Part | Fact | Shows | Kind | Call |
|---|---|---|---|---|
| Turn bar | Turn order, round divider, ghost of the actor's next turn, push and pull marks, Flustered and wind-up badges on faces | 1 | P | Keep (the home of every turn-order fact) |
| Turn bar | Tools: Details, speed, EXIT, WIN NOW | 1 | L | Keep, menu style |
| Tray | "Grace's next turn: after 5 others" | 2 (ghost on the bar) | L | Remove |
| Tray | "Moves up 7 on the turn bar", "Falls back N" | 2 (bar marks) | L | Remove |
| Scene | Monster HP bar | 2 (tray bar and "HP 610/610") | P | Keep on the scene; tray bar and number removed |
| Scene | Monster letter A, B | 1 | L | Keep |
| Scene | Composure pips | 2 (tray "6 of 6 Composure") | P | Keep on the scene; tray words removed |
| Scene | Wind-up "!! name" over the monster | 2 (tray chip "Winding up") | P+L | Keep on the scene (a threat you act on); tray chip removed |
| Scene | Monster statuses over its head (CROWN) | 2 (tray chips) | L | Behind DETAILS; tray chips removed. Flustered is left off (the stars and the bar's badge show it) |
| Scene | MARKED and NEXT TARGET over a family member | 3 (card chip, tray chip) | P+L | Remove from the scene and the tray; the party card's chip is the one place |
| Scene | White arrow over the member whose turn it is | 3 (bar, blue card) | P | Remove; the turn bar and the card's ring show it |
| Scene | Aim arrow over the aimed unit | 1 | P | Keep |
| Party card | Face, name | 1 | P+L | Keep |
| Party card | HP bar and current HP | 1 | P+L | Keep, number beside the bar; "/max" and a shield behind DETAILS |
| Party card | Pep pips and number | 2 for the up member (deck header) | P+L | Up member: none on the card (the deck header has it). Others: behind DETAILS |
| Party card | Status chips (3 at most), BACK, Portable Counter | 1 | L | Behind DETAILS |
| Party card | MARKED, NEXT TARGET | 1 (after the scene and tray copies go) | L+C | Keep, coral |
| Deck header | Up member's Pep with the forecast ("4 → 6") | 1 | P+L | Keep |
| Deck header | Combos gauge and percent | 1 | P+L | Keep, named Combos |
| Move row | Flavor picture with its word next to it, kind ("Racket basic", "Clobber skill") | 2 (tray chips) | P+L+C | Keep on the row, menu words; tray chips removed. The star before a Capstone becomes the word "capstone" |
| Move row | Price | 2 (tray "3 PEP") | L | Keep on the row; tray copy removed |
| Move row | Move name | 2 (tray title) | L | Keep on the row; tray title removed |
| Move row | PET PEEVE | 2 (tray "Pet Peeve +50%") | L+C | Merged: the highlighted move's tag says whether its aim hits a Pet Peeve; other rows say whether any monster has it as a Pet Peeve |
| Move row | "needs N more Pep", other reason it can't be used | 3 (row, USE bar, tray sentence) | L+C | The row says it; when highlighted, the USE bar says it; the tray sentence is removed |
| Move row | One plain line (`short`) | 2 for the highlighted move (tray text) | L | Behind DETAILS, never on the highlighted row (the tray says it) |
| Move row | Group lines "Primary", "Secondary", "Combos", "Anyone" | 2 (tray "POCKET VIBE") | L | Keep; the Vibe's name behind DETAILS; tray chip removed |
| Move row | USE bar | 1 | L | Keep |
| Tray, move half | What the move does | 1 | L | DETAILS off: the one plain line. On: the full description |
| Tray, move half | Size and reach ("Light hit", "One monster") | 2 (the aim marks and the target's name) | L | Size behind DETAILS; reach removed (the target half names who) |
| Tray, target half | Who is aimed at (face and name, or the group's name) | 1 | P+L | Keep |
| Tray, target half | Damage, knocks it out, BREAK, sets off, cancels, heal, shield, revive | 1 | L+C | Keep |
| Tray, target half | Composure lost, statuses the move leaves | 1 | L | Behind DETAILS |
| Tray, target half | The target's Pet Peeves | 1 | P+L | Behind DETAILS (battleux3 moves them to badges under each monster and takes them out of the tray) |
| Tray, target half | The target's statuses, Vibes, Back row, Marked | 2 (scene, card) | L | Remove |
| Tray, target half | "Tap a monster to aim at it." | 1 | L | Keep while the move can aim at more than one |
| Tray, a unit you tapped | Its name, why the move can't aim there, its statuses, All details | 1 | L | Keep (you asked to see it) |
| Sheet | Everything on one unit | 1 | L | Keep (opened on request) |
| End | "The family wins!" | 2 (YOU WIN! on the scene) | L | Remove; the tray keeps what the win paid and Continue |

## (c) What DETAILS off hides

| Part | Hidden with DETAILS off | Left (enough to choose and use a move) |
|---|---|---|
| Scene | Monster statuses over the head | HP bars, letters, Composure pips, wind-ups, the aim arrow |
| Party cards | Pep of members not up, status chips, BACK, Portable Counter, "/max" HP, shield | Face, name, HP bar and HP, MARKED and NEXT TARGET |
| Deck | Every row's one plain line, the Vibe names on the group lines | Name, flavor picture and word, kind, price, PET PEEVE, why it can't be used, USE |
| Tray | Full description (the one plain line shows instead), size, Composure lost, statuses left, the target's Pet Peeves | The one plain line, who is aimed at, damage or heal, knocks out, BREAK, sets off, cancels, the aim hint |

A unit tapped to look at, and the All details sheet, show everything either way: they are what the player asked to see. The switch is one saved setting with the menu's "Show skill descriptions" (`M2_DET_KEY`), as the menu plan asked; with nothing saved it is on for a wide desktop window and off elsewhere.

## (d) Label, picture, color

| Rule | Where it applies |
|---|---|
| A picture always has its word right next to it | Flavor circle and its word on the row; a face and a name on cards and in the tray; Composure pips are the only bare picture, and the All details sheet names them |
| The label is the prominent one when the player must read it to choose | Move names, prices, damage numbers, the target's name |
| The picture is the prominent one when it is read at a glance | HP bars, Pep pips, the Combos gauge, the turn bar's faces |
| Color only where the player acts on it | 1 flavor colors: which flavor (match a Pet Peeve). 2 green: good for you (HP, Pep gained, PET PEEVE, heal, revive, shield, cancels a wind-up). 3 coral: danger or can't (low HP, MARKED, resists, not enough Pep). 4 lamplight: what you picked (the highlighted move, the aimed card). 5 gold: Combos and a big result (knocks it out, BREAK, sets off). Everything else is ink |
| Like facts sit together | Pep and Combos in the deck header; what the move does in the tray's left half; what it does to the target in the right half; turn order only on the bar |

Words are the menu's (Tom on 11-22, card c-fix-menu4play-3): Combos for the gauge and the group, Double Team, Family Ruckus for the full one, Primary and Secondary for Main and Pocket. They live in `data/b3-ux-words.js`, still the one place for the battle screen's words.

## Built: b3look (2026-11-22)

Shipped as build b3look. The tables above are what was built. The battle screen now shares the menu's variables (declared once in m2.css), every fact appears once, and DETAILS hides details from the moves, strip, party cards and scene. Scene marks MARKED, NEXT TARGET and the white turn arrow were found to be repeats and are gone; the aim arrow stays. The Pep forecast sits in the deck header. Tests: b3-sim check (3863, FAILS []), b3_layout_test (every size), b3_test, smoke.
