# Chapter 1 teardown list (2026-11-17 evening). Nothing in the game has been changed yet.

Script going in: claude/story-ch01-draft2.md, word for word (95 lines plus the 7 recorded intro lines). The build writes and rewords no dialogue. Where the engine cannot play a direction, the default below is a proposal for Tom, not a script change.

## 1. Built scene, what replaces it

| Built scene (data/scenes.js) | Replaced by (locked script) | Map and trigger |
|---|---|---|
| opening (intro, 7 recorded lines, then the squishy beat: Grace intro3 and intro4, Tom intro3, Rose intro4) | Scene 1 starts right after "inside the uncle at all times". The squishy beat is not in the locked script | town, after the opening |
| ch1Goal (rhubarb crisp, Tombo toast, goal toast) | Scene 1: Grace's list in the Square, Rose turns Tom toward Rivituso Row | town |
| none | Scene 2: Amy's text from her house (GREGORI), Grace "number four since the mailbox" | row, near amyhouse |
| none | Scene 2b (optional, approved): Aunt Ellie at her door | row, at elliehouse |
| ch1Theft (rhubarb crisp, tin, 14 Deedee/Boppy lines, Mudling heist, Deedee joins) | Scene 3: twelve muffins, Boppy's bread story, mud ball takes the pan, Deedee, Tom and the girls run out | grands |
| ch1Mudling, ch1Skeeter, ch1Grump (three tutorial fights: Mudling, Skeeter Swarm, Pond Grump) | Scene 4: three Mudlings holding muffins, Rose's please, ONE fight of three Mudlings, nine muffin papers | hollow |
| ch1Spot (marble, Rose and Tom pull, bulb) | Scene 5: Grace's clue list, Tom pulls and fails, Deedee lifts the bulb with a tissue | hollow |
| ch1Pond (thief hands the tin to the Big One) | Scene 6: the Big One already wears the pan, Deedee walks to the water, boss fight, Rose BOO after the fight, coin | hollow |
| ch1AfterBoss (tin back, coin, kind or not branch) | Scene 6 ending (one path, no branch) | hollow |
| ch1End (half a crisp, lure, gold teeth, card 1) | Scene 7: Boppy and the coin, gold teeth, the fish got three muffins, Deedee bakes twelve more | grands |
| none (chapter 1 had no goodbye) | Scene 8: Grace's job and pencil, the long way around the Square, cab 7, TNB's text on the seat | grands door, town |

## 2. Things the engine cannot play, with my default (Tom answers only where marked ASK)

| Direction in the script | Engine today | Default I will build unless Tom says otherwise |
|---|---|---|
| ASK: the squishy beat after the recorded intro (4 recorded clips, unlocks the Squishy Delivery Tombo) | Built and recorded, but the locked script goes straight to Grace's paper | Keep it as built, since those 4 clips are recorded and the script says the intro is unchanged. If Tom wants it cut, the 4 clips are purged and Squishy Delivery unlocks at Grace's list instead |
| Three tutorial fights become one fight of three Mudlings | Tutorials 'basics', 'dance', 'defend' hang on the three old fights | One Mudling fight carries 'basics'. The 'dance' and 'defend' hints fire inside the Big One fight when their conditions are true. Skeeter Swarm and Pond Grump scenes are removed. Their lines go too |
| Rose turns Tom by the ears | No frame | Rose stays on his shoulders (ride pose), Tom turns and walks toward the Row |
| Grace walks beside them, writing | No writing frame | Grace walks beside them, no writing frame |
| Amy waves from the window with an iced coffee | No figure in a window, no coffee prop | Amy stands outside her door facing the street, a small code-drawn iced coffee in her hand (stand-in) |
| Amy's and TNB's texts | Verify how chapters 4 and 5 show a text (spoken box with the sender's face) | Same method as those chapters |
| Aunt Ellie opens the door | Her interior, her sheet and her talk and mood poses all exist. No door-opening frame | She appears at her door tile and speaks. Grace "sighs and erases" is a short pause |
| ASK: Ellie scene 2b, if Tom would rather it sit after Amy's | Fixed order in the script: Amy, Ellie, Deedee | Order as written |
| Mud ball rolls in, knocks three flat, takes the pan, Deedee's pan | Painted heist frames (mh_*) already hold the old pie tin | Same frames and knockdown. The tin is a stand-in for the twelve-cup pan until new art is approved |
| Screen door BANG | Door sound exists | Sound plus the mud entering the same doorway |
| Tom sets his bag down, two new pencil marks | Door frame close-up exists (ch1Reveal 'doorframe') | Use the close-up as the silent action |
| Three Mudlings holding muffins in both hands | Mudling sprite holds nothing | Muffins as small code-drawn props (stand-in) |
| Nine muffin papers left in the reeds | No prop | Code-drawn papers (stand-in) |
| Boss: the pan on its head, "bright green fish the size of a cab", coin in its lip | Built boss wears the tin as a crown (flag ch1-crown). Art Library entry ch1-bigone-lure-coin is the sheet for the coin in its lip | Pan stand-in on the crown. Check the Art Library approval of ch1-bigone-lure-coin first. A green recolour of the built boss is a separate art request, not a script change |
| ASK: the fight ends and THEN Rose says BOO (the built win is "make it laugh", with a kind-win and a non-kind branch) | One scene, one path in the locked script | Run the fight, then play the scripted BOO scene for both a kind win and a plain win, and say so in the build note |
| Deedee tucks the flashbulb into the kitchen drawer | Flag ch1-bulb exists, no drawer | Set the flag, play the pickup sound, no drawer art |
| Boppy holds the coin to the window and taps a tooth | Coin and grin close-ups exist | Grin close-up as built |
| Tom walks around the Square twice with Rose | Ride pose and walking exist | Scripted walk loop, ride pose |
| Cab 7 pulls away, Tom waves out the back window, phone lights up on the seat | No cab-drives-away shot, no phone-on-seat prop | Stand-in: cab fades out, then TNB's text plays as a text box. Needs Tom's call later if he wants a real shot |
| Tombos: Deedee's (Wine and Gossip) and Grace's Squishy Delivery unlock inside removed lines | Unlock flags live in ch1Theft and the opening | Deedee's unlocks when she runs out with them in scene 3. Toast text unchanged |

## 3. What is removed

- Rhubarb crisp, the tin, the "twenty years ago I'd have caught that thing before it got to the fence" and the 2006 lure (the lure item, its drop from the Big One, and the key item text), the Skeeter Swarm and Pond Grump scenes and their lines, the crumb trail art that shows rhubarb crumbs (stays only if it reads as muffin crumbs on the path; I will look at it).
- The old recorded chapter 1 clips that no scene plays after the swap (the 43 lines queued in ch1assets, plus the old Gus and Boppy clips). They are purged in the same push, per the no-unused-voice rule, and Tom is told which lines to record.

## 4. Voice lines Tom records when the build is pushed

95 new lines. Grace 20, Tom 18, Rose 16, Deedee 14, Boppy 10, Aunt Ellie 7, the Big One 6, Amy 2, Mudling 1, TNB 1. The 7 intro lines stay recorded. TNB is written at Energy 3 (Tom's request); the Voice Studio database still says 1.

## 5. New art and entries to check before building

Art Library group "Chapter 1": check what Tom approved. Likely new asks: the pan (replacing the tin), the green Big One with the pan, twelve muffins in a pan, a muffin paper, Mudling holding muffins, a small iced coffee. Aunt Ellie's house interior, her sheet, talk poses and mood poses already exist.

## 6. Order of work after Tom answers

1. Read repo CLAUDE.md and claude/next.md. Look at the built frames of the opening, ch1Theft and ch1Pond.
2. Add scenes 1, 2, 2b and triggers, then 3, then 4 (one fight), 5, 6, 7, 8. Delete the replaced scenes, flags, triggers, lure item and Skeeter/Grump scripts and grep for zero references.
3. New lines into the voice library with directions from the voice scripts section, harvest, make-index, talk and emotion rows, Script Editor check.
4. Run the chapter from chapter select, portrait and landscape, look at every scene's frames. smoke.py, tag check, CHANGES entry, push.
