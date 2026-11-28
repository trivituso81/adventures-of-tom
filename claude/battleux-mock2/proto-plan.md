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
