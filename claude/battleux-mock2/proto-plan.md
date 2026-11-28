# Battle screen prototype: the plan (board-b3proto-plan, 2026-11-27)

Tom, 11-27 19:45: "Can you plan for a super lightweight prototype to see how I like it and why issues I find?"

Purpose: let Tom hold the two things he wants kept (the moves beside the character whose turn it is, and controls that lie over the scene) on his Duo, before the full proposal (card c-b3story) is drawn. It tests feel, not rules. Card: c-b3proto, build name b3proto. Tom's card: t-b3proto-try.

## 1. What it is

One page, `battle-proto.html`, with a button under ADMIN > Battle system ("Battle screen prototype"). It is a fake fight: no battle engine, no rules, no saved game. Names, Pep prices, flavors and the one-line descriptions are read from `data/b3-kit-grace.js`, `-tom.js`, `-rose.js`, `-deedee.js`; damage numbers are fixed.

| Part | In the prototype |
|---|---|
| Scene | The pond backdrop, The Big One, and Grace, Tom, Rose and Deedee as still pictures (`art/clips/start/*-hero.png`, `bigone.png`). Stills are for this page only and never go into a fight. |
| Turns | Grace, Tom, Deedee, Rose, then round again. Nobody is knocked out and the fight never ends. |
| The bar | Section 7 row 1 of assessment.md: the acting member steps toward the monster, the bar opens on that side at shoulder height with a tail, and slides from the last member's spot. One list: the Basic first, Primary moves, a line "Secondary: <Vibe>", its moves. No tabs. |
| Picking | First tap opens the row (its one line and a gold Use button). Second tap on Use uses it. The Basic is open when the turn starts. |
| Using | The bar folds away (150 ms), one caption line names the move, the monster shakes, HP and Pep change, the next member's bar opens. |
| The monster | One full plate on the aimed monster (name, HP, Composure pips, Pet Peeves with flavor pictures); the forecast (damage, Pet Peeve, the pip that will go) sits on the plate, not on the body. With five monsters the other four show the small strip; a tap aims. |
| Around it | Party row along the bottom (face, name, HP bar, Pep number), a turn bar, the Combo bar. They update but do nothing when tapped. |
| Look | Solid paper panels with a dark edge and shadow, in CSS. No painted frames yet. |
| Try chip | A small corner chip with three switches: Monsters 1 or 5, Background pond, night or indoor, Details on or off. |
| Notes | A Note button: Tom types what he sees; the page keeps each note with the state it was written in (whose turn, the switches, the screen size). Copy my notes puts them all on the clipboard for the card. |

Screens: the Duo unfolded held sideways (951 x 648) and desktop. Other sideways screens get whatever falls out. An upright screen shows "Turn the phone sideways".

## 2. What it leaves out on purpose

Real rules and damage, statuses, wind-ups and marks, using a Combo, knock-outs, free Skills, Rose Mode, the end of a fight, keys and gamepad, the upright phone, painted frames, videos. These belong to c-b3story.

## 3. Checks the session does itself (Tom is not QA)

| # | Check |
|---|---|
| 1 | Screenshots looked at, at 951 x 648 and 1440 x 900: the bar open on each of the four members, a row open, five monsters, night, indoor. |
| 2 | `python3 tools/b3proto_test.py`: no text under 12.5 px, every row and button at least 44 px, the open bar inside the screen, the bar never over a monster or a family member's face, the list fits without scrolling at 951 x 648, a full round of four turns plays. |
| 3 | `python3 tools/admin_hub_test.py`, `python3 tools/smoke.py`. |

## 4. What Tom is asked to judge (on the card)

1. Does the bar beside the character feel right as it moves from one member to the next?
2. Is anything you want to see covered, with one monster and with five?
3. Can you read it and tap it comfortably on the Duo?
4. Is first tap, then Use, clear?
5. When the bar folds away during a move, does that feel right, or do you lose your place?

All good unblocks c-b3story. Something is wrong with his notes makes a fix card for the prototype (Sonnet 5.5 medium, starts by itself), and the card comes back to him.

## 5. Purge rule

`battle-proto.html`, `tools/b3proto_test.py` and the ADMIN button are deleted by the build that ships the real screen, or as soon as Tom says the prototype is not needed. c-b3story's proposal session reads Tom's notes on t-b3proto-try first.

## Built (b3proto, 2026-11-27)

Built as sections 1 to 3 say: `battle-proto.html`, the ADMIN > Battle system button "Battle screen prototype", `tools/b3proto_test.py` (all pass at 951 x 648 and 1440 x 900), screenshots looked at in `tools/shots/b3proto-*.png`. No battle, rule or engine file changed; the page loads only `data/b3-rules.js`, the four `data/b3-kit-*.js` files and `data/b3-foes-ch01.js` (data, no engine), and the test fails if an `engine/` file is requested.

What is real and what is fixed: move names, Pep prices, flavors, the one-line description and the full description come from the kit files; the monsters' names, HP, Composure and Pet Peeves come from `B3_FOES`. Fixed on purpose: damage by the size word (light 14, standard 22, heavy 34, capstone 48, 1.5x on a Pet Peeve, none for a move with power 0), Pep (start 4, Basic +2, a Skill costs its price, never above 10), Combo +12% a move, party HP. A monster under 20% HP is topped up between turns, so the fight never ends.

Calls made (each is a choice the plan did not settle):

| # | Call |
|---|---|
| 1 | Section 7 of assessment.md is not in the repo (the file ends at section 6; docs/CHANGES.md says board-b3story3 added it). Built from this plan's section 1 and assessment section 6 (Tom's two fixed points). Card c-b3proto had no note from Tom on it. |
| 2 | The party stands as a queue on the right: the acting member steps forward to the front spot, the others wait behind in turn order, the member who just acted goes to the back and the bar slides in from that spot. This keeps the bar clear of every other member's face on every turn. Prototype only: it is not a proposal for the game's party layout, which is unchanged (Tom, 11-27 22:41). The small monster boxes for 5 monsters are the same kind of shortcut. |
| 3 | Seven rows: the Basic, the Primary Vibe's three Skills (its capstone included), a line "Secondary: <Vibe>", the Secondary Vibe's three Skills. A closed row is 44 px: a flavor picture, the name, a Pet Peeve tag, the Pep price. The flavor word and kind ("Clobber basic") show on the open row. This is what lets the list fit without scrolling at 951 x 648. |
| 4 | Details Off: the open row shows its one line, the plate shows the damage ring and the Pet Peeve tag. Details On: also the move's full description and hit count on the row, and the plate adds Composure, push and cancel tags. |
| 5 | Night is the pond with a dark blue wash. Indoor is `bgs/06-library-reading-room.webp`. |
| 6 | The still pictures are cut from `art/clips/start/*.png` (magenta keyed out) into `art/proto/`, for this page only. Family figures are drawn in proportion to their real heights. |
| 7 | A move Grace cannot pay for is dimmed and its Use button reads "Need N Pep" and is disabled. |
| 8 | Notes are kept on the phone (`b3proto-notes`) with the state they were written in; Clear needs a second tap. |
| 9 | Not mine: `tools/admin_hub_test.py` fails 2 checks ("one link per fight", at 390 and 844 px) with and without my change; it counts every `a.btn` against the number of Lab fights plus 1, which the admin page outgrew earlier. `tools/night/tests.json` got a `b3proto_test` row, which smoke requires. |
