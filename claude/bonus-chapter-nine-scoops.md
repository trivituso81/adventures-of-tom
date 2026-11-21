# Bonus Chapter: Nine Scoops (premise)

EXPANDED 2026-10-27 (v319) to the 80-minute version: two runs at the pond and five quests between them. The as-built order, the three
free birthday items and the Sash slot are in claude/nine-scoops-part2-status.md, which wins over the structure below where they differ
(the midpoint now ends with Brain Freeze winning and the family running; the printer beat happens on the second run; the party has
Grace's friends Pip, Moss and Dot plus Mr. Pistachio).

BUILT 2026-10-26, live in game v277 (data/bonus-nine-scoops.js; claude/status.md top entry has the as-built list). Differences from the premise below:
the shell phase ends the first fight (result 'shell') and the pond scene plays the printer beat on the overworld, then a second fight starts at
60% HP with HEART 75; BIRTHDAY WISH is 6.0x total (nine candle hits + the wish) with goof 1 round and heal 25%; INSTAX costs 4 VP; the creamery
is the Crumb Bakery renamed for the day (SCOOPS sign, frost, Mr. Pistachio in a cube); the ending happens inside Amy's house, not the porch; no
Instax slideshow at the card (future polish); the dice is rolled in the opening and at the pond (no Dice Unboxed reskin); extra lines
not_puppy, bigpuppy, badguy, rude. Test: claude/ns_test.py.

Standalone. Third entry on the title screen (BONUS), playable with no Part 1 or Part 2 save. Party is Tom, Grace and Rose only, fixed at level 5 with every move and their Chapter 1 Tombos (Dumpling Unboxed, Double-Decker Boop) unlocked, HEART at 0%. Nothing carries in or out. About 80 minutes.

## Tom's present (the key item)

Tom bought Grace an Instax Mini Link smartphone printer (the real gift). It rides in his bag, wrapped, from the first frame. He will not hand it over early ("Presents are after cake. That is the rule. I did not make the rule."). The wrapped box shows in the bag on his overworld sprite and in the Inspect panel as PRESENT (?). Rose asks what it is at every stop. He gives it to Grace at the pond, at the moment it is the only thing that can save the day (below). After that it is Grace's item: INSTAX in her battle menu, and it changes the ending and the Tombo.

## Grace's birthday squishies (the three new ones, replacing the dumpling)

| Squishy | Look | Who carries it | Bit |
|---|---|---|---|
| Big orange rubber duck | Head-sized, smooth, big round eyes, flat orange bill | Rose claims it on sight | Rose squeezes it and it quacks; she uses it for every Boo in this chapter (Boo gets a quack sound) |
| Fluffy purple highland cow | Shaggy magenta fur, tan nose, little black horns, sits like a toddler | Grace, under one arm the whole chapter | Grace names it Moo-rielle. Cone Heads try to steal it |
| Glitter dice | Chunky translucent pink cube full of holographic glitter, white pips | Grace, in her pocket | Grace rolls it before the big fights; it always lands on 9 ("It only does nines today.") Rolling it is how Dumpling Unboxed is re-skinned here: Dice Unboxed, same effect |

## Opening (mirrors Chapter 1, tuned for the birthday)

Same shape as the Chapter 1 opening: Sal's taxi pulls up on Rivituso Row, Tom climbs out and stretches, the girls come running. Differences:

| Chapter 1 beat | Nine Scoops beat |
|---|---|
| Tom: "Oof, I'm finally here! At least the 6 hours went by fast on Delta One!" | Tom: "Oof, I'm finally here! Six hours on Delta One and I did not miss the big day." A wrapped gift sticks out of his bag. Grace spots it; Tom: "After cake." |
| Grace: "TATA! You're BACK!" | Grace, wearing a paper crown, cow under one arm: "TATA! You came for my BIRTHDAY!" |
| "a hundred years" / "a hundred MILLION years" | Grace: "I have been nine for SIX hours." Rose: "I have been six for a hundred MILLION years." |
| Rose: "Tata, up! Up up up!" and the shoulder ride | Same, but Rose is hugging the orange duck, so Tom hoists duck and all. Tom: "Hello, Rose. Hello, duck. Please keep your arms, legs and bills inside the uncle at all times." |
| Grace shows the gold soup dumpling squishy | Grace shows her birthday squishies from Amy: "Tata, LOOK. A fluffy purple cow. Her name is Moo-rielle. And a GLITTER DICE." She rolls the dice on the sidewalk: 9. "It only does nines today." Rose, from Tom's shoulders, squeezes the duck: QUACK. "The duck is mine now." Tom: "That is the fluffiest cow I have ever seen. And I have seen a LOT of cows." |
| Goal: rhubarb crisp at Rivituso Row | Tom takes a selfie of the three of them by the cab, duck and cow in frame ("One for the fridge."). Then the plan: Sprinkle Street Creamery, the only shop on the island with dairy-free ice cream, where Tata ordered the Nine Scoop Sundae (nine dairy-free scoops, one per year, black and white cookie on top). Goal: The Square |

Amy and Justin are home setting up the party; Deedee is baking the cake; Boppy is "resting his knee." TNB texts a photo of a birthday bowl he threw on the wheel. Mentioned, not shown.

## Premise

The creamery is frozen solid from the inside. The owner, Mr. Pistachio, is stuck in an ice cube. The nine scoops are gone. The thief is BRAIN FREEZE, a grouchy walking chest freezer who hates birthdays because nobody came to his, and wants the whole town frozen so nothing ever melts and nothing ever changes (a small cousin of Project Stillness, no Julian Vance). He has hidden the scoops in three places.

Grace: "Stealing on a BIRTHDAY? Rude." Rose: "A bad guy! On a Saturday!" Tom: "We get the scoops, we get the sundae, we are home by four."

## Structure (first half; the second half is in claude/nine-scoops-part2-status.md)

| Stop | Scoops | Fight | Beat |
|---|---|---|---|
| Sprinkle Street Creamery (The Square) | 0 | 3 Sprinkle Gremlins (tutorial, one hit each) | Free Mr. Pistachio. Rose: "Is the present a puppy?" Tom: "It is not a puppy." |
| The Square fountain | 3: vanilla, strawberry, mint | Slushie Slug (high HP, melts and skips every third turn) | Rose sneaks up with the duck and Boos it (QUACK) off the scoops for a free round. Rose: "Is the present a BIGGER puppy?" |
| The Square (quest 1) | | | Amy phones: the invitations never went out. Hand three to Pip, Moss and Dot |
| Grump Hollow trail | 3: chocolate, cookie dough, coffee | 2 Cone Heads (one heals the other with a scoop until you knock the scoop away) | One Cone Head grabs Moo-rielle; getting her back is the fight's bonus goal. Grace films a pretend birthday vlog mid fight (Like and Subscribe gets a bonus). Brain Freeze watches from the trees: "Nobody filmed MY birthday." |
| The pond (run 1, the midpoint) | he takes the six back | Pond Grump cameo, then BRAIN FREEZE | Grace rolls the dice on the dock: 9. ICE SHELL at half HP, Rose frozen, Deep Freeze, the family runs |

## The pivotal point (pond, run 2, boss phase 1 to 2)

Phase 1: Brain Freeze fights normally. At half HP he slams his lid shut: ICE SHELL (no damage gets through, not even Tombos) and aims a Brain Freeze at Rose, who is spicy now (Boppy's pepper) and stays thawed. A scripted Grace line: "Tata, nothing WORKS." Brain Freeze: "Good. Nothing changes. Nobody leaves. Nobody grows up. Nobody forgets a birthday." Grace remembers Mr. Pistachio: the door is the soft part.

Tom reaches into the bag. "Okay. Presents are before cake. New rule." He hands Grace the wrapped box. She tears it open: an Instax printer. Grace gets it instantly: Brain Freeze does not want to freeze the world, he wants to keep a moment. She pairs it to Tom's phone (one tap, it is a cutscene), prints the morning selfie by the cab, and sticks the photo on his freezer door. "You don't have to freeze it. You just take a picture. See? It stays." Rose hangs Justin's light-up banner on him.

The warm photo melts the shell from the inside. ICE SHELL shatters, the HEART meter fills to 75% and BIRTHDAY WISH unlocks. Phase 2: Brain Freeze is Un-Grumping as he fights; Boppy's Peppers crack the shell.

Grace keeps the printer. INSTAX becomes her battle command for the rest of the chapter: snaps a photo of the enemy row (flash FX), prints it, enemies Goofed one round and +Warmth. Costs 4 VP.

Ending: Grace invites Brain Freeze to the party. He drips a little and comes, the photo still on his door. The sundae is built at Amy's house with the whole family, Pip, Moss, Dot and Mr. Pistachio; Deedee's cake beside it, Moo-rielle gets her own tiny scoop, everyone sings, Rose blows out Grace's candles by accident, Tom relights them. BONUS COMPLETE. Afterwards Penny has three free birthday things for Grace.

## Enemies

| Enemy | HP | Gimmick |
|---|---|---|
| Sprinkle Gremlin x3 | 20 | Teaches hitting a row (they come back in the garden, quest 3) |
| Slushie Slug | 300 | Melts every third turn and skips; Warmth makes it melt faster |
| Cone Head x2 | 120 each | Scoop Pass heals the other for 40; one holds Moo-rielle; Inspect shows the scoop and the cow as targets |
| Brain Freeze (boss) | 700, POW 20 | Phase 1 normal. At half HP: Ice Shell (immune). Run 1 ends the fight ('flee'); run 2 ends it for the printer scene ('shell'). Phase 2: 2 Cozy or Sparkle hits or a Tombo break the shell before the Deep Freeze |

## Tombo Triple: BIRTHDAY WISH

The first three-person Tombo. Tom joins the girls' birthday party in battle. Unlocked by the printer scene. Cost 75% HEART. Needs all three standing.

| Beat | Who | Animation | Spoken line |
|---|---|---|---|
| 1 | Rose | Peekaboo from behind the enemy, jumps up with the duck: QUACK | "BOO! Surprise party!" |
| 2 | Tom | Block Drop: a black and white cookie cake drops onto the enemy; Combo Fireball lights nine candles | "Nine candles. Hold still, please." |
| 3 | Grace | Rolls the glitter dice (9, naturally), then a handspring run and a Perfect 10 landing on the cake | "It's MY birthday, so I pick the move!" |
| 4 | All | Grace blows out the candles one per hit: nine hits at 0.5x to every enemy (candle smoke FX). Then the wish: white flash, confetti and burst FX, final hit 2.5x to every enemy. Enemies Goofed one round. Party heals 25% | Grace: "I wished for a bigger explosion." Rose: "It WORKED!" Tom: "That was a LOT of cake." |
| 5 | Grace | Snaps the wreckage with the Instax, Moo-rielle propped in the shot; a print slides out and spins to the camera as the closing card | "Printing. That one is going on the fridge." |

Total about 7x to every enemy plus the heal, the strongest Tombo in the game, fitting for a bonus. Chime: level-up chime three notes higher.

## Lines (data/lines.js, all live; tom.run_away and rose.spicy added 2026-10-27)

| Character | Kind | Line |
|---|---|---|
| Tom | arrive_bday | Oof, I'm finally here! Six hours on Delta One and I did not miss the big day. |
| Tom | present_rule | Presents are after cake. That is the rule. I did not make the rule. |
| Tom | present_give | Okay. Presents are before cake. New rule. |
| Tom | duck_ride | Hello, Rose. Hello, duck. Please keep your arms, legs and bills inside the uncle at all times. |
| Tom | bday_cow | That is the fluffiest cow I have ever seen. And I have seen a LOT of cows. |
| Tom | run_away | Grace. Grab Rose. We're LEAVING. |
| Tom | wish | Nine candles. Hold still, please. |
| Tom | wish_win | That was a LOT of cake. |
| Grace | arrive_bday | TATA! You came for my BIRTHDAY! |
| Grace | bday_nine | I have been nine for SIX hours. |
| Grace | bday_squish | Tata, LOOK. A fluffy purple cow. Her name is Moo-rielle. And a GLITTER DICE. |
| Grace | dice_nine | It only does nines today. |
| Grace | nothing_works | Tata, nothing WORKS. |
| Grace | photo_stays | You don't have to freeze it. You just take a picture. See? It stays. |
| Grace | instax | Say cheese. Or ice cream. |
| Grace | wish | It's MY birthday, so I pick the move! |
| Grace | wish_win | I wished for a bigger explosion. |
| Grace | wish_print | Printing. That one is going on the fridge. |
| Rose | bday_six | I have been six for a hundred MILLION years. |
| Rose | duck_mine | The duck is mine now. |
| Rose | puppy | Is the present a puppy? |
| Rose | thaw | I was in the MIDDLE of a boo. |
| Rose | spicy | Not this time! I ate a pepper. Half a pepper. |
| Rose | wish | BOO! Surprise party! |
| Rose | wish_win | It WORKED! |

Sound: a quack sfx in engine/audio.js, played on Rose's Boo and Peekaboo for this chapter.

## Canon (approved by building; see claude/canon-addendum.md)

- Grace's birthday is in October; this chapter is her ninth. Her ice cream and cake are always dairy free.
- Grace owns an Instax printer from her ninth birthday on; it can reappear in later chapters as her INSTAX command.
- Grace's squishies: Moo-rielle the purple highland cow and the pink glitter dice; the orange duck is Rose's now.
- Sprinkle Street Creamery and Mr. Pistachio exist in The Square. Brain Freeze is Mr. Pistachio's old freezer and now a friend.
- Bonus chapters: BONUS on the title screen, fixed party and level, no saves carried either way.
