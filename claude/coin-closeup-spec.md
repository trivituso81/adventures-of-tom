# Coin close-up screen: assessment and build spec (2026-11-12, Tom approved the direction 12:54)

Merge a pointer to this file into claude/next.md at the next rewrite.

## What Tom asked (2026-11-12 12:09)
"In chapter 10 a dedicated screen with a closeup of inserting those coins. It should be beautiful and detailed. I'd also like to do this with other chapters where there are similar situations." He then pasted the build prompt into a new chat, so the direction is approved. Build chapter 10 first as the pilot.

## This is NOT a Gate Zero doors fix
- It is a new feature. It is not a fourth variant of gatedoor1/2/3 and the stop-loss rule on the doors does not block it.
- It replaces what happens AFTER the coin trigger fires (the text menus), not the trigger itself. The trigger stays `ch10Gate` (data/scenes.js ~3877), called from A (`LE_pressAction_ch10`) and from walking into the doors (engine/story.js ~784, gatedoor3).
- Do not ask Tom for the title stamp or the PA answer before building. Test with flags set (`ch10-term`, `ch10-sec`, `ch10-bag`, `ch10-lounge`). If Tom later reports the doors still offer nothing on his phone, that is the separate gatedoor3 question in claude/next.md.

## Chapter 10 today (fact, read from main at 9a2989d)
| Item | Today |
|---|---|
| Entry | `ch10Gate(o)`: with all 3 hands, `openChoice` with PUT THE COINS IN / NOT YET |
| The puzzle | `ch10Slot(i)`: seven `openChoice` menus on the walking map, 3 text options each, right answer is `CH10_COINS[i]` |
| Coin order | `CH10_COINS`: THE SUNDIAL, THE STEAMER, THE SIGN-UP SHEET, BREADY'S JAR, THE 1952 BOOK, THE 1963 OVEN, THE MIRRORBALL |
| Wrong pick | flag `ch10-fails` +1, sfx.nope, "CLUNK. The coins rattle back out into Tom's hand." plus Grace's hint (`CH10_HINTS`, 2 lines) |
| After the 7th | `playScene('ch10Door')` (data/scenes.js ~3699): sets `ch10-door`, text "The seventh coin clicks into its slot...", `ch10OpenDoors()` |
| The coins | Never drawn anywhere. docs/DUNGEON_FINDS.md: "told in dialogue, no map object" |
| The clock | Small code-drawn object over the doors (engine/terminal-render.js, `termHand`) |
| Close-up engine | None exists. Nearest full-screen painted things: engine/flight-art.js (flight scene), `intro.showcase` (Grace's squishy), chapter cards |

## What to build (chapter 10 pilot)
| Part | Design |
|---|---|
| Engine piece | One reusable close-up screen (new file, for example engine/closeup.js): full-screen painted background, painted parts placed over it, tap or D-pad plus A to pick, small code animations, then returns to the map. Later chapters supply only art and a short script |
| Background | The Gate Zero clock face, close: three still hands, seven empty slots round the face, one empty slot in the middle (it stays empty; that sets up Part 2). One square painting that serves portrait and landscape, like the room paintings |
| Coins | Seven painted gold coins in a tray at the bottom, each stamped with its source (sundial, steamer, sign-up sheet, jar, 1952 book, 1963 oven, Mirrorball). The player picks the coin itself, not a text label. Coin names may show as a small caption on focus |
| Right coin | Travels to the next slot going round, clicks in, glints; clock gives one tick sound |
| Wrong coin | All placed coins rattle back to the tray; Grace's existing hint lines play; `ch10-fails` still counts |
| Seventh coin | Hands shiver, CLUNK, fade back to the map, then the existing `ch10Door` scene runs unchanged |
| Leaving early | B or a NOT YET button returns to the map with nothing placed |
| Controls | Touch, on-screen D-pad and A, keyboard, gamepad |
| Voice | No baked line is edited. Any new line is added as a new line |

## Art needed from Tom (write the prompts as Art Library entries; images only in the Art Library)
| Entry | Content |
|---|---|
| Clock face plate | Square painting, painted realistic style, warm golden light from the upper left, empty slots, hands as separate parts if they must shiver |
| Coin parts sheet | Seven coins, each alone and large in its own cell, plus one empty-slot and one filled-slot glint if needed |
- Known risk (fact): the ch10 gate clock failed twice in the generator as a multi-state sheet (2026-11-09, see docs/DUNGEON_FINDS.md "Parts sheets"). Use the parts method from the start: each part alone and big in a cell, composed in code. Check the prompts that made `prop-find-ch10-parts` before writing new ones.
- Until the art is approved, the screen can run on placeholder shapes for testing only. Do not push placeholders as final art.

## Quality bar
Look at the screen in portrait (390 x 844), landscape and Duo (951 x 648); play all seven coins right, one wrong pick, and leaving early; then chapter 10 start to finish from the chapter-select jump. `tools/gatezero_test.py` and smoke must pass. CHANGES entry and tag bump on push.

## Other chapters (recommendation, ranked from scene code and docs/DUNGEON_FINDS.md, not from playing each). Build only when Tom names them.
| Tier | Ch | Moment | Why |
|---|---|---|---|
| Strong | 3 to 9 | Each gold coin when it is found | Players must know the coins by sight for the chapter 10 screen to work |
| Strong | 13 | Eleven coins melt the amber doorway to gold (`ch13-melted`) | Direct echo of chapter 10 |
| Strong | 19 | Placing the four keepsakes on their pedestals (`ks-<who>`) | Emotional peak, small detailed objects |
| Strong | 17 | The snow globe on the plinth in the Vault | The whole town in glass, now only text |
| Good | 7 | Spelling SHH with catalog cards on the Reading Room doors | Same put-things-in-slots shape |
| Good | 9 | Turning the mirrors so the moonbeam hits the silver door | Clear visual result |
| Good | 5 | Setting three clocks to 7:00 | Hands on an object |
| Good | 4, 8 | Junction boxes in color order; turntable lever | Works, lower emotional weight |
| Skip | Various | Optional joke picks (staff fridge, jukebox, photo booth); chapter 20's eight doors | Quick gags or too many repeats |

Suggested order after the pilot: coin finds in chapters 3 to 9, then 13, then 19 and 17.
