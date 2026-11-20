# Battle system revamp: proposal (v3, 2026-11-14, NOT approved to build, nothing built)

Status: Tom said he likes the system (2026-11-14) and asked for Justin and Olivia, specialized lanes, a buff and debuff system, and a balance check. This version adds all four. No game file has changed. Every number is a starting value to tune in a playable pilot.

Explorable version: the claude.ai artifact "Battle Revamp Explorer" (tabs: Overview, Ability levels, Build a character, Boosts and troubles, Elements, Tombos, Balance check, Leveling pace). This page is the written record. Ability names in the Explorer's build tab are placeholders, mostly existing moves.

## 1. The proposal in one screen

| Today (fact) | Proposed (recommendation) |
|---|---|
| Two fixed paths per character, six moves each, bought in order. Later moves are stronger but are unrelated ideas. | 12 abilities per character. Each ability is one idea that grows through 8 levels. Buy any ability, in any order. |
| Three progression currencies (Stamp Points, Polish Points, Remix Tickets), two versions of every move, loadouts, Mastery. | One currency: Stamps. Each ability is its own 8-stamp card. |
| Warmth bar on every monster and a second "Kindness" way to win. | Removed entirely. Monsters have HP only. |
| A hidden special rule per character (Upgrade Miles, Trending Meter, Heartburn and so on). | Removed. Each lane has one plain title perk. |
| Roles are implied by stats. | Three lanes per character. A lane is a job. Where you spend sets a title and its perk. |
| About 35 status effects with one-off rules. | Six boosts and six troubles, same icons on both sides, three sizes. |
| Six elements with a "this beats that" chart, weaknesses hidden. | Five elements, no chart. Each monster shows one weakness and one thing it shrugs off. |
| 21 Tombos, fixed power, unlocked by story. | Same story unlocks. Each Tombo gains 5 levels from one shared family pool. |
| Party hits level 50 by about chapter 13 (Tom's playthrough, Director Mode). | Cap stays 50. Leveling slows so 50 arrives in chapter 20. |

Kept as is: turn order ribbon, the four-way command cross, formations of four, VP (points spent to use an ability), the HEART meter (pays for Tombos), difficulty modes, High-Five timing.

Playable roster covered: Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara, Justin, Olivia (10). Ilan joins the same system when his abilities are designed.

## 2. Abilities: 12 per character, 8 levels each

Rule: an ability never turns into a different idea. Level 8 is the same joke as level 1, told as big as it can be told.

| Ability level | Stamps | Needs character level | Power vs level 1 | What changes |
|---|---|---|---|---|
| 1 | 1 | when the ability appears | x1.0 | Form 1 art. The plain version. |
| 2 | 1 | 4 | x1.15 | Bigger on screen. |
| 3 | 2 | 8 | x1.3 | Bigger again, more hits or sparks. |
| 4 | 2 | 13 | x1.6 | **Form 2: new painted art, plus an added effect.** |
| 5 | 3 | 18 | x1.8 | Bigger. |
| 6 | 4 | 24 | x2.0 | A second added effect. |
| 7 | 6 | 31 | x2.3 | Screen shake, camera push, the works. |
| 8 | 9 | 38 | x3.5 | **Form 3: the finale. New art, hits wider, devastating.** |

- Total to max one ability: 28 Stamps.
- New abilities appear as the character levels: 3 at the start, then one at levels 3, 6, 9, 12, 15, 18, 22, 26 and 30.
- VP cost rises with the form (about 2, 4, 7). You can cast an earlier form to save VP.
- You bring 6 abilities into a fight (plus the free basic move). An Auto button picks for kids.
- Free respec outside battle.
- Visuals: every level looks bigger, but only levels 1, 4 and 8 get new painted art. Levels between are scaled up by the engine.

Example ladders (illustrations, full 8 levels in the Explorer): Boppy's Big Fish, Tom's No Touching Please, Rose's Boop, Deedee's Rhubarb Crisp.

## 3. Stamps and leveling pace

| Source | Stamps |
|---|---|
| Start | 3 |
| Every level-up | 2 |
| Every boss beaten | 1 |
| Total at level 50 with 20 bosses | 121 (maxing all 12 abilities would cost 336) |

| Build | Result with about 120 Stamps |
|---|---|
| Specialist | 2 abilities at level 8, 4 at level 6, 2 at level 4 |
| Three finales | 3 at level 8, 4 at level 5, nothing else |
| Generalist | All 12 at level 5, three of them at 6, no finale |

Leveling pace (decided 2026-11-14): fact, Tom reached level 50 by about chapter 13. Today every level costs a flat 100 XP while later monsters pay more (likely cause, confirm in code). Proposed: XP per level rises so the pace is about 2.5 levels a chapter and level 50 arrives in chapter 20. Cap stays 50.

| End of chapter | Level | Stamps | What opens around here |
|---|---|---|---|
| 5 | 13 | 32 | First Form 2 (ability level 4) |
| 10 | 25 | 61 | Ability level 6 |
| 15 | 38 | 92 | First finale (ability level 8) |
| 20 | 50 | 121 | A second finale |

## 4. Boosts and troubles (the buff and debuff system)

A boost is a temporary help on the family. A trouble is a temporary problem on a monster. Monsters use the same twelve on the family.

| Boost | Does | Trouble | Does |
|---|---|---|---|
| Pumped Up | Hits harder | Grumbled | Hits weaker |
| Tucked In | Takes less damage | Rattled | Takes more damage |
| Peppy | Acts sooner | Soaked | Acts later |
| Snacking | Heals a little every turn | Spicy | Loses a little HP every turn |
| Dialed In | More critical hits | Goofed | Loses its next turn |
| Fresh Outfit | Blocks the next trouble | Called Out | Has to attack whoever called it out |

| Rule | Detail |
|---|---|
| Sizes | Small, medium, large: 10%, 20%, 30%. Size comes from the ability's form, so leveling an ability grows its boost or trouble. |
| Length | 3 turns of whoever has it. |
| Stacking | Different ones stack. The same one never stacks: bigger replaces smaller, timer restarts. |
| Limit | 3 boosts and 3 troubles on any one fighter. |
| Bosses | Troubles land at half size. Goofed pushes a boss back in the turn order and never removes its turn. |
| No turn-locking | After a monster is Goofed it cannot be Goofed again for its next 2 turns. |
| Clearing | Some abilities cure troubles on the family; some strip boosts off monsters. |
| Elements | Each element leans to one trouble: Cozy to Spicy, Splash to Soaked, Loud to Grumbled, Sparkle to Rattled. Bonk pushes monsters back. |

## 5. Lanes: each one is a job

Each character's 12 abilities sit in three lanes of four. All four abilities in a lane do the same kind of thing and use the same boosts or troubles. The lane holding at least 45% of spent Stamps (and at least 20 Stamps) sets the title on the character card and turns on that title's perk.

| Who (lean) | Title | Job | Signature effects | Title perk |
|---|---|---|---|---|
| Tom (defender) | Designated Adult | Protector: takes the hits meant for others | Tucked In, Called Out | Takes 15% less damage |
| | Player One | Combo hitter: each hit sets up the next | Rattled, Dialed In | Critical hits come more often |
| | Bread Winner | Feeder: steady healing and VP for the team | Snacking, Pumped Up | Everyone starts a fight with 1 extra VP |
| Grace (big single hits) | Perfect 10 | Finisher: one huge critical hit | Dialed In | Critical hits land 25% harder |
| | Bedazzler | Weakener: hits groups, leaves them fragile | Rattled, strips boosts | Her troubles last 1 turn longer |
| | Boss of Everyone | Captain: hands out turns and boosts | Pumped Up, Peppy | Her boosts last 1 turn longer |
| Rose (trickster) | Goofball | Turn thief: monsters lose turns | Goofed, Grumbled | Goofed lands more often |
| | Jumping Bean | Multi-hitter: lots of small hits | Peppy, Dialed In | One extra hit on multi-hit abilities |
| | Cozy Rosie | Shielder: wraps the family up | Tucked In, Snacking | Her shields also heal a little |
| Amy (speed) | Personal Best | Speedster: more turns than anyone | Peppy | Always acts first in a fight |
| | Gold Star | Coach: strongest boosts for one person | Pumped Up, Dialed In, Fresh Outfit | Single-person boosts are one size larger |
| | SuperMom | Guardian: saves whoever is in trouble | Tucked In, cures, Grumbled | Heals 20% more on anyone under half HP |
| Deedee (healer) | Registered Nut | Medic: cures and gets people back up | Cures, revives, Fresh Outfit | Revived people come back with more HP |
| | Head Baker | Healer: the biggest heals in the game | Snacking, Pumped Up | Heals are 15% stronger |
| | Clean Sweep | Cleaner: wipes boosts off monsters | Soaked, strips boosts | Stripping a boost also does damage |
| Boppy (bruiser) | Big Fish | Heavy hitter: one target, then a row, then everyone | Soaked | 20% more damage to Soaked monsters |
| | Hot Stuff | Burner: damage that keeps going | Spicy, Rattled | Spicy lasts 1 turn longer |
| | The Warden | Wall: makes monsters attack him | Called Out, Grumbled, Tucked In | 15% more HP |
| TNB (support) | Kiln It | Builder: clay shields and heat | Tucked In, Spicy | Shields soak up 20% more |
| | Costume Department | Outfitter: boosts and second chances | Fresh Outfit, Pumped Up, revives | Fresh Outfit blocks two troubles |
| | Scream King | Scarer: frightened monsters fight badly | Grumbled, Goofed, Soaked | Grumbled monsters take 10% more damage |
| Nara (fast attacker) | Goodest Girl | Chaser: runs one monster down | Rattled | Steals coins or an item more often |
| | Zoomies | Blur: fast, hard to hit, splashy | Peppy, Soaked | Dodges 15% of single hits |
| | Puppy Eyes | Charmer: monsters forget to attack | Goofed, Grumbled | Her Goofed lasts through the rest period |
| Justin (heavy hitter) | Live Wire | Shocker (electrician): big hits that stun | Goofed, Rattled | 15% more damage to a monster that just lost a turn |
| | Armchair Ref | Heckler (yells at the game): loud group hits that shove monsters back | Grumbled, Called Out | Monsters he shoves go back further |
| | Basement Boss | Wrecker (basement renovation): breaks shields, walls off the family | Tucked In, strips boosts | Boss shields break one hit sooner |
| Olivia (trouble maker) | Breaking News | Exposer (journalist): finds the weak spot | Rattled, reveals weakness | Weaknesses show the first time you meet a monster |
| | Snack Mom | Party healer: something for everyone | Snacking, cures, Tucked In | Party heals also cure one trouble |
| | Better Than Bobby | Show-off (former jump rope champ): many hits, boosts herself | Pumped Up, Dialed In | 5% more damage per boost on her |

Placeholder lane contents for the two new people, from their existing kits: Justin: Live Wire (Loose Wire, Wire Nuts, Breaker Flip, one new), Armchair Ref (Bad Call, Giant Sneeze, Foot Tap, one new), Basement Boss (Demo Day, DRYWALL, Fresh Fit, one new). Olivia: Breaking News (Fact Check, LivNews Live, Inverted Pyramid, Is This Real?), Snack Mom (SNACK BAG, Story Time, Marine Layer, LACHLAN, NO!), Better Than Bobby (Double Under, MICHAEL!, Better Than Bobby, one new).

Each character's signature move becomes one of their 12 abilities and is owned free at level 1, because the story uses them.

## 6. Elements

| Element | Plain meaning | Who mostly has it |
|---|---|---|
| Bonk (today: Kinetic) | Physical hits | Tom, Grace, Amy, Nara, Justin, Olivia |
| Cozy | Heat: ovens, peppers, kiln | Deedee, Boppy, TNB, Tom |
| Splash | Water | Boppy, Deedee, Nara |
| Sparkle | Glitter, light and sparks | Grace, Tom, Justin |
| Loud (today: Chatter) | Sound: raspberries, singing, screams, yelling | Rose, Amy, TNB, Justin, Olivia |
| Amber | Villain only | Enemies |

- No "beats" chart. Each monster has one weakness and one thing it shrugs off, shown as icons after the first fight with that kind of monster.
- A weak hit does 50% more and pushes the monster back in the turn order. A shrugged-off hit does half.
- Stats are not tied to elements. The stat called WARMTH is renamed CHARM.

## 7. Tombos

| Question | Answer |
|---|---|
| How do you get one? | A story moment, as today. |
| How does it get stronger? | 5 levels each, costing 1, 2, 3, 4, 6 Family Points. New painted art at levels 1 and 5. |
| Where do Family Points come from? | One shared pool. Every battle won fills a Family bar; a full bar is 1 point; bosses give 2. Nothing comes out of anyone's Stamps. |
| How many can you max? | About a quarter of the combos by the end. |
| What pays for one in battle? | The HEART meter, with two fill rules instead of seven: every party action fills it a little, a weak hit fills it more. |

## 8. Balance check (on paper only)

| Risk | Finding | Rule that handles it |
|---|---|---|
| Stamps | 121 at the end against 336 to max one person. | No change needed. |
| One hit stacking everything | Large boost, large trouble and a weak hit multiply to x2.5 on top of a finale's x3.5. | Sizes capped at 30%. Troubles halved on bosses: ceiling x2.2. |
| Monsters never getting a turn | Rose, Nara and Justin can each take turns away. | Goofed has a 2-turn rest. Bosses are only pushed back. |
| Endless extra turns | Speed boosts plus extra-turn abilities could loop. | Peppy tops out at 30%. One extra turn per person per round. |
| Best healer is also best hitter | Fact today: Deedee tops damage at several tiers while being the main healer. | Her lanes compete for the same Stamps; Clean Sweep is tuned as the lowest damage lane. |
| Cheap title perks | A perk could be grabbed with a few early Stamps. | Title needs 20 Stamps in the lane and 45% of everything spent. |
| Late joiners | Justin, Olivia, later Ilan. | Join at Tom's level with all Stamps unspent, plus Auto. |

| Job | Long Island side | Los Angeles side |
|---|---|---|
| Protect | Tom, Boppy, Justin, Rose | Tom, TNB |
| Heal | Deedee, Amy, Rose, Tom | Olivia, Tom |
| Cure and revive | Deedee | TNB, Olivia |
| Big single hits | Grace, Boppy, Justin | Nara |
| Group hits | Grace, Boppy, Justin, Deedee | TNB, Nara |
| Boosts | Amy, Grace, Tom | TNB, Tom |
| Troubles | Rose, Grace, Justin | TNB, Olivia, Nara |
| Speed and turns | Amy | Nara |

Thinnest spot: Los Angeles has one big single hitter (Nara). Olivia's Better Than Bobby lane and Ilan should fill it. Not checkable on paper: monster HP and real fight length. The pilot decides those.

## 9. What this costs and breaks

| Item | Fact or estimate |
|---|---|
| Art | Estimate: 360 ability sheets (10 people x 12 abilities x 3 forms) plus about 50 combo sheets. Existing animations stand in as Form 1 where the ability survives. |
| Voice | One spoken line per form, not per level (up to 360 lines). Existing recorded lines reused where the ability survives. |
| Story | The old designs for the chapter 14 Boppy fight and the chapter 20 finale lean on kindness moves aimed at a boss. They become one-off scripted fights. |
| Saves | Old saves keep items and story progress. Stamps are refunded. Levels are recalculated on the slower curve from total XP earned. |
| Other work in flight | Chapter writing and chapter builds are not touched. This runs as a separate track in the Battle Lab until Tom approves a pilot. |

## 10. Order of work

| Step | What | Who |
|---|---|---|
| 1 | Full ability sheets for Tom and Rose: 12 abilities each, names, lanes, the 8-level ladder with boosts and troubles per form, the three forms, plus their Tombos. A readable page. | Claude writes, Tom reviews |
| 2 | Playable pilot in the Battle Lab: Tom and Rose under the new rules, with a Move Lab (Keep / Tweak / Replace). Placeholder visuals from existing animations. | Claude |
| 3 | Tom plays the pilot. Rules are locked or changed. | Tom |
| 4 | Sheets for the other eight characters, then all art prompts into the Art Library at once. | Claude, then Tom generates |
| 5 | Monsters re-tuned, XP curve slowed, old systems purged, saves migrated, chapters re-tested. | Claude |

Open call for Tom: three painted forms per ability (levels 1, 4, 8) instead of eight.
