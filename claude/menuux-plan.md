# Main menu redesign: the proposal (menuux-plan, 2026-11-21)

Card c-menuux-plan. Status: PROPOSAL. Nothing in the game changed. The build starts only after Tom approves (card t-menuux-decide, or his word in the chat).

Tom (11-21 17:28): "The main menu needs a complete overhaul - i originally wanted it like odl school JRPG style but im now finding it dated and hard to read. and im not sure its optimized for the new battle system. can you research best in class menus (eg, Person 3 Reload; just one example) that perfectly suits the needs of the game. it also should be strikingly beautiful and in theme with the design of the game.im open to anything, but id like to see a proposal before moving forward. once approved, id ask you to create the corresponding cards to kick off the work with the appropriate models."

| Where | What |
|---|---|
| The drawings Tom looks at | Design canvas "The Adventures of Tom: main menu redesign proposal", https://claude.ai/artifact/RGQDGbWRCFL3awXe7rmChm (14 artboards; press Play on Family and the tabs move between screens) |
| The same drawings in the repo | `claude/menuux-mock/shots/*.jpg` (one per screen, plus `sheet-duo.jpg` and `sheet-phone.jpg`) |
| The source of the drawings | `claude/menuux-mock/gen/kit.py` (colours, type, every component), `boards.py` (the screens), `render.py` and `shot.py` (test pages and screenshots), `export_canvas.py` (the canvas files). `python3 claude/menuux-mock/gen/render.py && python3 claude/menuux-mock/gen/shot.py family_duo` |
| Pictures and fonts the drawings use | `claude/menuux-mock/img/`, `claude/menuux-mock/fonts/` |

## 1. What is wrong with the menu today (fact, from screenshots of every screen at 393 x 852 and 951 x 648)

| # | Finding | Where |
|---|---|---|
| 1 | Every box has the same navy fill and gold double border, so nothing stands out. The eye gets no first place to land. | All screens |
| 2 | Body text is 9 to 11 px small caps in grey on navy. | Status, Gear, Items, Vibes |
| 3 | The nine commands sit in a left column that takes a quarter of a phone's width on every screen, which squeezes the content ("Lucky Red Sweater" wraps to two lines; the Wear button fights the text). | Phone upright |
| 4 | The menu is built for the old battle: a Stamps tab, "2 SP" on every party row, six old stats (POW, GRIT, WARMTH, COOL, PEP), a Trait that talks about Tombos, a High-Five option. | Party, Status, Stamps, Options |
| 5 | The new battle's build screen (Vibes) is a separate overlay with its own look, 14 tiny rows, and "Tap anything to read what it does". What a skill does is hidden behind a tap, the same complaint Tom made about the battle screen. | Vibes |
| 6 | The party screen does not show what the new battle needs at a glance: Main Vibe, Rank, front or back row, the Family Ruckus gauge. | Party |
| 7 | The painted item pictures (`art/items/`) are not used; items show emoji. The portraits' cream paper looks pasted onto navy. | Items, Gear, all portraits |
| 8 | The menu hides the painted world completely. Nothing on screen says "this game". | All screens |

## 2. What the best menus do, and what applies here

| Game | What it does | What we take | Source |
|---|---|---|---|
| Persona 3 Reload | The menu is a picture of the game's theme (the hero sinking through water, one blue), and each screen has its own composition. | One idea that only this game can own, one identity colour set, big character art on the home screen. | automaton-media.com/en/news/20240207-26873 ; famitsu.com/news/202311/29325647.html |
| Persona series, Metaphor: ReFantazio (Atlus) | UI is treated as first-rate design work; every screen is designed on its own and must stay simple and usable. Metaphor's lead says the UI should connect the player to the world, not sit outside it. | The menu shows where you are (the paused scene stays behind it) and uses the game's own paper and paintings. | gamesradar.com (Hashino on Atlus UI; Koji Ise GDC 2025 talk); pushsquare.com/news/2024/10 |
| Metaphor: ReFantazio | Players reported discomfort from menus with many constantly moving parts; the designer said options for this are needed. | Motion only when a page opens or changes. Nothing loops. A Less motion switch. | pcgamer.com (Ise on accessibility) |
| Clair Obscur: Expedition 33 | Praised for looks, took Persona 5 as its UI model, and was still criticised for confusing menus. | Beauty does not excuse a menu that is hard to read: labels on every icon, words over symbols. | automaton-media.com (Broche on Persona 5); pcgamesn.com review |
| Bayonetta Origins | Every screen is a page of a picture book; decoration kept minimal, margins do the separating, item icons drawn from the game's art. | One sheet of paper per screen, rules and margins instead of boxes, the painted item pictures as the icons. | platinumgames.com/official-blog/article/13347 |
| Theatrhythm Final Bar Line | The party screen is drawn as an object from the game's world (sheet music). | The party screen is a family line-up, drawn the way the characters are drawn. | square-enix-games.com/news/theatrhythm-final-bar-line-style |
| Phone-first RPGs (Honkai: Star Rail and others) | A handful of destinations, a character switcher, large touch targets. | Five tabs, a face switcher, every target 44 px or more. | General practice |

The common thread: the best menus are not decorated lists. They pick one idea from the game itself, give the characters the stage, and stay plain to read.

## 3. The proposal: "Golden Hour"

One sentence: pausing turns the world to dusk and opens the sketchbook the family is drawn in.

| Piece | Decision (recommendation, all changeable) | Why |
|---|---|---|
| Behind the menu | The paused game picture, softened and washed plum to rose (the title screen's sky). | The menu always shows where you are; costs nothing to make (one still of the canvas when the menu opens). |
| The surface | Warm paper, the same colour the family's paintings are on (`#FCE6C3`, measured from the hero paintings: about `#FDE2B8`). Dark plum ink for text (`#2B1A33`). | The paintings stop looking like stickers. Dark text on a light page is the easiest thing to read on a phone. Contrast: ink on paper 13 to 1, the softer grey 7 to 1. |
| The signature | The Family screen is a line-up of the hero paintings on one floor line at their REAL heights (from `data/heights.json`), with a pencil tick and the height at each head, like marks on a door frame. | Nobody else's game has this. The real heights are already a rule of this game. |
| No cutouts | The paintings are not cut out. A bake divides each painting by its own paper so the paper becomes pure white, and the menu draws it with the "multiply" blend on the page. Hair wisps and pencil edges survive untouched. | Tom's rule about bad cutouts. Proved on seven paintings in the drawings. |
| The fold | On the Duo unfolded each screen is a two-page spread and the fold is the book's gutter (x 475 of 951): who or what on the left page, the detail on the right. No text crosses the fold. | The Duo is the main screen, and it is a book. |
| Navigation | Five tabs with a picture AND a word: Family, Vibes, Gear, Bag, System. Index tabs down the left edge when the screen is wide (Duo, desktop, phone sideways), along the bottom edge when it is tall (phone upright, Duo folded). | Nine commands become five. The content gets the full width on a phone. Thumbs reach the tabs. |
| What went where | Party becomes Family. Status folds into the header of Vibes and Gear (name, level, four numbers). Items becomes Bag. Load, Options and Quit become System (Save is there too). Stamps leaves (section 4). | Fewer places, nothing lost. |
| Selection | A lamplight-yellow fill (`#FFCF6E`) on the chosen row, and a marker stroke under the chosen name. No gold borders. | One clear signal instead of a border on everything. |
| Colour | Plum dusk `#2A1A3E`, paper `#FCE6C3`, ink `#2B1A33`, lamplight `#F5A623` and `#FFCF6E`, jacaranda `#6243A8` (the Pocket Vibe), green `#22774F` (health, better), coral `#C23A22` (low health). The five damage flavors keep the battle's colours. | All taken from the title painting, the logo and the Downtown LA plate. |
| Type | Bricolage Grotesque (names, titles, numbers) and Figtree (everything else), both free, shipped as two font files in the repo. Nothing under 12.5 px. No small caps. | A bold warm face close to the logo's lettering, and a plain text face. The first try (Atkinson Hyperlegible) was dropped because its slashed zero looked wrong in "50" and "100". |
| Motion | The book opens once (about 0.2 s); a tab change slides the page; a chosen thing lifts. Nothing moves while you read. Less motion switch in Options. | Section 2, Metaphor. Also keeps to the no-breathing rule's spirit. |
| Icons | Never alone. Every icon has its word next to it. The item pictures are the painted ones from `art/items/`. | Tom on the battle screen: "the icons are also a bit confusing". |

### The screens

| Screen | Left page (or top, on a phone) | Right page (or below) |
|---|---|---|
| Family | The line-up. Under each person: name, level, health bar and numbers, Main Vibe with Rank stars, Front row or Back row, and a "New skill to try" tag after a Rank-up. Who is waiting at home. | The other two people, and the Family Ruckus gauge with its 50 and 100 marks. Top bar on every screen: place, the next thing to do, coins, play time, Back to the game. |
| Vibes | Faces of the four in the party plus a +6 button for the bench (swipe or L and R), the person, level and XP, Health, Attack, Defense, Speed, Front or Back row, "Show what each skill does" switch, the two Quirk slots. | The person's three Vibes as three chips, each with its stars and its tag (Main, Pocket, Not in use); a fourth chip, Freelancer, stays locked until all three are mastered. Tap a chip to read that Vibe below: name, subtitle, Lean in words, VP bar that says what the next Rank unlocks, then the kit in Rank order, each row with its flavor in words, its Pep cost and one or two lines of what it does; locked rows show the Rank that opens them. A Vibe that is not Main shows Make it Main and Make it Pocket. Tapping a Quirk slot turns the right page into Choose a Quirk: all six, by Vibe, locked ones with the Rank they need. |
| Gear | The same header. The four numbers show the change in green while you look at a piece. A green arrow on a face means the bag holds something better for them. | Tool, Outfit, Charm with the painted picture and the effect in the new stats. The chosen slot opens the pieces in the bag that fit, each with "how much better" and Wear. Best gear button. |
| Bag | All, Heal, Gear, Keepsakes, then the list with painted pictures and counts. | The chosen item large, what it does, and Use it on: the family with health bars, most hurt first, the health they would end at, Use. On a phone this is a sheet that slides up. |
| System | Autosave and three slots (Save, Load), Back up, Restore, the build label (opens the build history), Quit to title. | Music, Voices, Sound effects, Difficulty, Battle speed, Show what each skill does, Turn the screen sideways, Less motion. |

Sizes drawn: Duo unfolded 951 x 648 (all five screens, plus Vibes later in the game), phone upright 393 x 852 (all five), phone sideways 852 x 393 (Family). Duo folded (466 x 657) uses the phone upright layout; desktop and the Admin Dashboard pane use the Duo layout with a centred gutter. The top 50 px of the phone drawings are left empty for the real status bar.

## 4. How it fits the new battle system (v11, "Battle 3")

| The new battle has | Today's menu | Proposed |
|---|---|---|
| Main and Pocket Vibe, Ranks, Vibe Points | A separate overlay | Tab 2, and on every Family plate |
| A kit unlocked by Rank (Trait, Basic, 2 Skills, Capstone, 2 Quirks) | 14 unexplained rows | One list in Rank order, described, with what the next Rank unlocks |
| Pep costs and five damage flavors | Pep as tiny text, no flavor | Flavor dot and Pep on every skill row. The row is one component meant to be shared with the battle screen redesign (card c-battleux-plan), with one switch for descriptions in both places |
| Front and back rows | Hidden in the overlay | On the Family plate and one control in Vibes |
| Four stats from the level table (Health, Attack, Defense, Speed) plus the Lean | Six old stats | Four big numbers; the Lean said in words |
| Family Ruckus gauge that carries between fights | Not shown | On Family |
| Gear mapped to the new stats (architecture row 31: POW to Attack, GRIT to Defense, PEP to Speed) | Old stat names | Effects written in the new stats |
| Stampcards (deleted at the purge, stage 23) | A tab and SP on every row | Not in the new menu. While a chapter still runs on the old battle, an "Old Stampcard" link shows at the bottom of Vibes; the purge removes it |

### The full v11 design, not only what is built (added 11-21 after Tom asked)

Fact: the first drawings were made from what is in the game today (two Vibes each, four people, no Quirk choice). The spec (`claude/battle-spec-v11.md`) has more. The drawings and this plan now cover it:

| In the v11 spec | Built today | In the proposal |
|---|---|---|
| 3 Vibes per person, 30 in all, all open from the day they join | 2 per person; the third comes in battle stages 19 to 21 | Three Vibe chips (drawn with Tom's Star Baker). The layout does not change when the third Vibes arrive. |
| Main and Pocket | Yes | A tag on the chip. Reading a Vibe that is not Main offers Make it Main and Make it Pocket. |
| 2 Quirk slots, any two of the person's six Quirks | Yes, for the Quirks written so far | Two slots on the left page; Choose a Quirk on the right (drawn: "Vibes later in the game"). |
| Mastery and overflow (a mastered Vibe's points go to the lowest one) | Yes | One line under the chips says where the points go (drawn). |
| Casual Mode, "Freelancer": after all three are mastered, two Pocket slots, a Basic of your choice, all three Traits | No (stage 21) | The fourth chip, locked with "Master all 3" (drawn). Open, it is the Main chip, two other chips carry Pocket, and the kit list gains a Basic row with Change and three Trait rows. Not drawn open. |
| A late joiner splits a pool of Vibe Points once across three Vibes | Yes (`b3PoolShift`, `b3PoolConfirm`) | The first time their Vibes page opens, the three chips carry minus and plus (20 points a tap) and Lock it in. Not drawn. |
| 4 in the party out of 10, the bench earns XP and Vibe Points, swaps outside battle only | The bench exists; swaps happen at set places in the story | Family shows everyone on the bench with Change (drawn). Change, tap a bench face, tap who sits out. Someone the story holds in or out says so in words. The +6 button on Vibes and Gear reaches the bench, so their builds and gear can be kept up. The swap itself is not drawn. |
| Rows: any split, at least 1 in Front | Yes | The Front and Back control; for the last person in front, Back is greyed with the reason. |
| Portable Counters (Oven Temp, Reps, Whopper Tally) | Yes | Named in the Trait and Skill text. |
| Pick-Me-Up for everyone | Yes | A line under the kit. |
| Family Ruckus kept between fights; Double Team at 50, Full Family Ruckus at 100 | Yes | On Family, with both marks. |
| Level 1 to 50, XP shared by all ten | Yes | The header of Vibes and Gear, and every Family plate. |

Outside the menu's scope and unchanged by it: fights, Pet Peeves, Composure, Primes and Detonations (the battle screen and the Battle Guide show those).

### The battle screen proposal Tom approved the same day (claude/battleux-plan.md, cards c-battleux1 to 3)

| Point | The battle screen | This menu | Call |
|---|---|---|---|
| Surface | Dark navy panels around the bright fight scene, serif names (today's look, kept) | Paper pages, two new typefaces | Keep both. A dark frame is right around a bright scene; a menu is a page you read. After menu1 is approved in the hand, one small card carries the two typefaces and the lamplight accent into the battle panels so the two read as one game. Not before, so battleux1 is not disturbed. |
| Flavors | Rule 5: picture, colour and word together | The same: "Racket basic", "Clobber skill" beside every dot | menu2 uses the battle mock's six flat symbols (`IC` in `claude/battleux-mock/src/app.js`), not the stand-in symbols in these drawings. One set for the game. |
| What a move does | A `short` line per move (battleux2 writes them), full text in the detail panel, a DETAILS switch | The full `desc` on every row (there is room), one switch | One saved setting drives both switches. |

Open point for the battle system, not the menu: Charms whose perk raised WARMTH or COOL (Moon Beanie, Straw Sunhat) have no meaning in the new stats. The menu shows whatever the gear mapping table says.

## 5. The build, after approval (cards to create; one conversation each)

The new menu is built beside the old one behind a switch (ADMIN > Menu: new or old), the way the new battle was, so the game is playable after every push. The old menu is purged in the last stage.

| Card | What it builds | Model and effort (claude/handoff-rules.md) | Tom's part after |
|---|---|---|---|
| c-menu1 (tag menu1) | The look and the Family screen: fonts in the repo, colours and components as CSS, the paused-scene backdrop, the book and its tabs for wide and tall screens, the top bar, the hero bake (`tools/sprite-bake/bake_menu_heroes.py`, paper to white, for all ten family members, Nara included), the line-up at real heights, the bench with Change (swap a bench member in, with the story's locks said in words), keys, gamepad and touch. A head row of the line-up goes to Tom. | Sonnet 5.5 (row C: a build whose code is not written; the look is fully specified by `claude/menuux-mock/gen/kit.py`). Effort high (a new screen system worked out in one session). | One look on the real Duo and phone, about 3 minutes: does it feel right in the hand. This is the only taste check before the rest is built. |
| c-menu2 (tag menu2) | Vibes and Gear: the shared header and switcher with the bench button, the three Vibe chips and the locked Freelancer chip, the Vibe pages on the real loadout functions (`b3SetMain`, `b3SetPocket`, `b3vRow`, the Quirk chooser, the late joiner's pool), the overflow line, the skill row, Gear with live changes through the gear mapping table, Best gear. Reads `claude/battleux-plan.md` first if it exists, so the skill row and the flavor icons are the same in the menu and in a fight. | Sonnet 5.5 (row C). Effort high. | None (tests and frames; folded into the final look). |
| c-menu3 (tag menu3) | Bag and System: the list, the detail, Use it on, the phone sheet; saves, options, build label, quit; Rose Mode; Less motion. | Sonnet 5.5 (row B: the patterns exist after menu1 and menu2). Effort medium. | None. |
| c-menu4 (tag menu4) | Switch the new menu on for everyone and purge the old one: old render functions and CSS in `engine/menu.js`, the Vibes overlay's own screen in `engine/b3-menu.js` (its save code stays), the admin switch, tests. | Sonnet 5.5 (row B: the purge rule and tests are written). Effort medium. Can run on the night shift. | Play the whole menu once on the phone, about 10 minutes. |

Not in this proposal (each would be its own card, after the menu is approved in the hand): the typefaces and accent carried into the battle panels (table in section 4), the shop (it shares the menu's code and look, so it is the natural next one), the title menu, the dialogue box, the save pop-up on the map. The battle screen has its own proposal (c-battleux-plan); the two should agree on colours, type, the skill row and the flavor icons.

## 6. Known risks and open points

| # | Point | Plan |
|---|---|---|
| 1 | Head sizes in the line-up. The hero paintings have bigger heads than the walking art, and they differ from person to person (Deedee's head is larger than Tom's in the drawing). Tom's rule: adult faces the same size. | menu1 shows Tom a head row of the line-up before anything else. A painting that breaks the rule is regenerated in the Art Library (his tap), never resized by hand. |
| 2 | The paper bake on a painting with very light clothes (white sneakers, the yellow dress) turns the lightest strokes into paper. | That is correct on paper (the stroke was paper-coloured). The bake's two numbers (how close to paper counts as paper, how far from ink) are in one place; menu1 looks at all ten. |
| 3 | The blurred backdrop on an old phone. | One still is taken when the menu opens and blurred once; nothing is blurred live. |
| 4 | Two fonts add about 0.2 MB to the first load. | Loaded with the menu's first open, not at the title. |
| 5 | The canvas drawings could not be opened and looked at from the session that made them (the type's rule). The same markup was rendered and checked as plain pages; those are the shots in the repo. | If an artboard looks broken on the canvas, the shots are the reference. |
