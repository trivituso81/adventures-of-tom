# Battle screen, storybook mockup: assessment (board-b3story, 2026-11-27)

Tom, 11-27 16:02, with one picture: "Assess this mockup of a revision to the battle UI. What edge cases or use cases is it missing? What problems might it have."

| File | What |
|---|---|
| `claude/battleux-mock2/tom-mockup-2026-11-27.jpg` | His picture, full size (2388 x 1792, a 4:3 picture). Grace's turn against The Big One, Crunchy Sugar-Cube Pop highlighted. |
| `claude/battleux-mock2/tom-mockup-at-duo-width-951.jpg` | The same picture scaled to the Duo unfolded width (951 px), for judging text size. |
| `claude/battleux-plan.md`, `claude/b3look-plan.md` | The screen that is built today (approved 11-21, restyled to the menu's look 11-22). |

Nothing in the game changed. This note is the input for card c-b3story (the proposal).

Checked against: `data/b3-rules.js`, `data/b3-kit-*.js` (120 family moves), `data/b3-foes-ch01.js` (The Big One), `data/b3-status.js` (about 200 statuses), `engine/b3-deck.js`, and the two plans above.

## 1. What the mockup adds that today's screen does not have

| # | Idea | Why it is worth keeping |
|---|---|---|
| 1 | The result of the move is shown on the aimed monster (damage, Pet Peeve, push) | The eye is already on the monster; today the same facts sit in the tray at the bottom |
| 2 | Each monster has its own plate: name, HP bar, pips, Pet Peeves | One home per monster, next to it |
| 3 | The Combo bar is wide, with both marks named (50% Double, 100% Family Ruckus) | Today's gauge is a thin bar in the strip header |
| 4 | The party sits in one row along the bottom | Frees the right strip |
| 5 | The Basic is set apart with its +2 Pep | The commonest turn reads at a glance |
| 6 | A painted storybook frame that matches the painted scene | Today's screen is plum and paper, flat |

## 2. Problems in what is drawn (facts, checked against the rules)

| # | Problem | Fact |
|---|---|---|
| 1 | Two moves look picked at once | Crunchy Sugar-Cube Pop (4 Pep) is highlighted, but Grace's card says "4 to 6 (+2 Pep)", which is the Basic's result. With Crunchy it is 4 to 0. The Basic card sits outside the list in its own frame. |
| 2 | No way to use the move is drawn | Today: first tap shows, second tap on the gold Use bar uses. The mockup has no Use control and no "tap again". |
| 3 | Three Vibe tabs, two with no words | A family member brings 2 Vibes to a fight (Primary and Secondary), 7 moves at most. Grace owns 3 Vibes (Squishy Collector, Craft Artist, Stage Performer), so the third tab is either wrong or unexplained. |
| 4 | Tabs hide moves | Against The Big One (Pet Peeves Razzle and Racket) Grace's Craft Artist moves Open-String Violin Screech (Racket) and Masterpiece Portrait Makeover (Razzle) would be behind the palette tab. The 11-21 redesign removed hidden lists on purpose (rule 1: one level). |
| 5 | The same fact several times (Tom, 11-21: "avoiding redundant information most of all") | +2 Pep: 3 times (Basic badge, "4 to 6", "(+2 PEP)"). Pet Peeve: 4 times (row tag, "1.5x PET PEEVE", the plate, "Racket skill" beside "Racket"). The 30% push: twice (chip and description). Grace: 4 times (title, turn bar twice, card). Max HP on every card (b3look put it behind Details). |
| 6 | Pep pips do not match the rule | Pep goes 0 to 10, starting at 4. Grace's card has 8 pips (5 gold, 3 green, which is not "4 to 6" either), the others 4. Four of four lit reads as full when it is 4 of 10. |
| 7 | "Shield" is the wrong word for the monster's pips | The game calls them Composure. Shield is a different real thing (a family member's shield, 40% cap). One pip glows and nothing says why (a Pet Peeve hit takes 1 pip, so it may be the pip this move removes). |
| 8 | Pictures with no word | The gold dragonfly coin on the monster, the crest on its plate, the crown at the end of the Combo bar, the two tab pictures, the dumpling on Colossal Diamond-Gold Dumpling (the other rows show the flavor; its flavor is Support). Tom, 11-21: keep an icon's label next to it. |
| 9 | Pet Peeves on the plate are plain purple words | The rows show a flavor picture, the plate shows a word, both in one color, so they cannot be matched at a glance. |
| 10 | The turn bar lost what the rules lean on | No ghost of where Grace lands after this move (a Basic waits 80, a Skill 100, a Capstone 120), no slide of the monster for the push, no wind-up or Flustered badge on a face. The two Grace faces with a dashed arrow are not explained. |
| 11 | "30%" is the move's text, not the result | A push is 30 ticks of a 100 tick round and halves on each further push in the same round (30, then 15). The chip must come from the preview. |
| 12 | The dimmed move does not say why | Today: "needs 2 more Pep". |
| 13 | The damage ring sits on the monster's body | On The Big One it covers the belly; on a small monster (Mudling) it would cover all of it. |
| 14 | The Big One's own state is missing | It starts with Muffin-Tin Crown (attack up, heals each turn). The hat is painted but no status shows. |

## 3. Layout and build problems

| # | Problem | Fact |
|---|---|---|
| 1 | The move panel lies over the middle of the scene (Tom wants this kept: section 6) | A side shows up to 3 monsters in Front and 2 in Back, and the family runs across the middle to attack. The panel covers about a quarter of the width and nearly half the height. To solve, not to remove: what it covers with five monsters, and whether it hides while a move plays. |
| 2 | The family is squeezed into the right quarter and overlaps | Grace and Tom overlap in the picture. Tapping a family member's body to aim a heal would be unreliable. |
| 3 | Text is too small at real size | Scaled to the Duo unfolded (951 px wide): move names about 11 px; "Support skill", "115 / 115 HP", Pep and the Pet Peeve chips about 9 to 10 px. The floor set in b3look is 12.5 px. |
| 4 | One shape only | The picture is 4:3. The four real screens are the Duo unfolded sideways (951 x 648), desktop, the Duo folded, and the iPhone upright (393 x 852) and sideways (852 x 393). At iPhone sideways height the whole picture is 523 px wide. An upright phone needs its own arrangement and none is drawn. |
| 5 | Tap sizes | On the Duo a move row is about 36 px tall and a tab about 28 px. The usual floor is 44 px. |
| 6 | Long names | A row fits about 22 letters; "Colossal Diamond-Gold Dumpling" already wraps. Longest names: "Kingdom of Ten-Thousand Blankets", "Regional Championship Freestyle", "Don't Touch the Copper!" Banner. |
| 7 | The frames are a painting, the words are live | Names, numbers and 120 moves change, so text must be real text over frames that stretch. Each ornate piece (scroll, plate, banner, ribbon, gauge) is either CSS or a painted piece from the Art Library cut to stretch. |
| 8 | Light panels on a bright scene | Cream cards over sand and grass, a gold "Grace" title over sky, a dimmed row on cream: low contrast, and worse on other backgrounds (night, indoor). |
| 9 | It is a third look | On 11-22 the battle screen took the menu's look at Tom's request (b3look). This look differs from the menu again, so either the battle screen stands apart or the menu follows. |

## 4. Cases the game has that the mockup does not draw

| # | Case | Fact |
|---|---|---|
| 1 | More than one monster | Up to 5 (3 Front, 2 Back). One plate is about a fifth of the width. Back row needs a mark (it takes 20% less single-target Clobber). |
| 2 | Moves that do not aim at one monster | Of 120 family moves, 59 aim at one monster. The rest: every monster 20, self 14, one family member 5, the whole family 5, a row 3, the floor 3 (Glue Trap), either side 3, pairs and neighbours 4, random monsters 2, revive 2. The result-on-the-monster idea covers only the first kind. |
| 3 | Aiming at a family member | No aimed state on a card or a body; no heal or shield forecast. |
| 4 | Statuses | About 200 in the data. Monsters and family carry several at once (Drenched, Dazzled, Squished, Marked). No place on the plate, the cards or the scene. |
| 5 | A monster winding up | Big Glare marks a family member, Swamp Chomp lands next turn. Crunchy Sugar-Cube Pop exists to cancel it, and the mockup has no wind-up mark and no MARKED or NEXT TARGET on the family. |
| 6 | Break and other big results | Flustered at 0 pips (35% more damage), "knocks it out", "sets off", "cancels", Resists (the opposite of a Pet Peeve). |
| 7 | Using a Combo | At 65% a Double Team is already available, but no Double Team move is drawn. Where do Double Team and Family Ruckus appear, and who is the partner? |
| 8 | Someone knocked out | The card's look, Pick-Me-Up appearing for everyone, aiming a revive at someone with no standing body. |
| 9 | A free Skill | Colossal Diamond-Gold Dumpling (in the mockup) gives another member a free Skill right now: the list then shows only what is allowed, marked FREE. |
| 10 | While a move or a monster plays | No place for the battle text or a story fight's turn tips (today: the tray). |
| 11 | The end of a fight | What the win paid, and Continue. |
| 12 | Details on | The switch is drawn off. What does on add, and where? Also the "All details" sheet when a unit is tapped. |
| 13 | Rose Mode | Picture menus and the recommended move. |
| 14 | Other parties | Three members (Tom, TNB, Nara the dog), ten family members in all, bosses with 7 pips, Skill Lock. |
| 15 | Keys and gamepad, desktop | The highlight, stepping the aim, the key hints. |

## 5. The call

Recommendation: do not build from the picture as it is. Keep the six ideas of section 1 and the approved rules of 11-21 (one list, first tap shows and second tap uses, a tap on a monster aims, every picture has its word, every fact once), and draw the storybook look as a tappable mock at the four real screens with every case of section 4, as the first redesign did. Card c-b3story holds that step.

## 6. Tom's answer (11-27 17:03): what must stay

Tom: "one thing that I really do like is the actions appearing kind of like to the left of the character, and that sort of more of a dynamic bar. It reminds me of Expedition 33. And I like to keep that in some way, shape, or form. I like that most of the UI is overlay and not pushing the screen up or down or to the side".

| Fixed point | What it means for the proposal |
|---|---|
| The moves appear beside the character whose turn it is, as a dynamic bar (his reference: Clair Obscur: Expedition 33) | The list is anchored to the acting family member and moves with the turn. It does not go back into a side strip or a band under the scene. Section 1 gains this as idea 7. |
| Most of the controls lie over the scene | The scene keeps the whole screen; nothing pushes it up, down or to the side. Idea 8. |

This overrules the reading of section 3 row 1 as a reason to move the panel. What is left to solve inside the two points: where the bar sits for each family member and near an edge, what it covers with five monsters, hiding while a move plays, contrast on any background, text and tap sizes at real screens, and the upright phone. Section 2's rows (two moves picked, no Use, tabs that hide moves, repeats, wrong words) are unchanged by this.
