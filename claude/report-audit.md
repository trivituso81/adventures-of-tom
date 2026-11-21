# Report audit (2026-11-15)

Why Tom plays and does not see his reports addressed. Every report filed since report1 (77, all on 2026-11-14), checked against docs/CHANGES.md and the live code on main 8f1ed28. Tom's phone was on the newest build for every report, so caching is not the cause.

## Causes

| # | Cause | Reports | What Tom sees |
|---|---|---|---|
| A | Fix lives only in a Voice Library direction. Nothing changes until Tom re-records. Report was closed anyway. | 9 | Same old voice |
| B | Words rewritten, old clip purged. New words show, but the line plays the fill-in voice until recorded. Closed. | 19 | New text, wrong or missing voice |
| C | Closed without checking his exact case (could not reproduce, or checked by numbers not by eye). | 6 | Possibly the same problem |
| D | Still open: 7 wait on Art Library pictures (group Report fixes), 1 never worked (Iron Gil). | 8 | Nothing changed |
| E | Fixed in code and still in the live code (spot-checked). | 34 | Should be fixed |

Also not live though discussed as done: Pose Editor sizes (posefaces2: only the dialogue faces changed; the figures on the map are not resized yet, that is the apply build). Script Editor edits reach the game only through "Apply my script edits".

## Rule from now on (fixes cause A to C)

- A report is closed only when the change is visible in the game with no action from Tom.
- A report whose fix waits on Tom (record a line, generate or approve art) stays open, marked WAITING with the exact Library step.
- A report that could not be reproduced, or was checked only by numbers, stays open and is named in the reply.
- Every Fix the backlog reply ends with two lists: what Tom will see now, and what he will not see until he does a named step.

## Ledger

### D OPEN

| Report | Ch | Scene | Tom's note (start) | Status |
|---|---|---|---|---|
| 7v5z | 1 | ch1Theft | For this line in particular, we need to create a special frame that can be used in both the dialog and in the  | waiting on Art Library |
| mxvd | 1 | ch1Theft | We need new frames for this art because it doesn't match the style of the game for the monster, I mean for the | waiting on Art Library |
| 1a2w | 1 | ch1Theft | In this pose for Bapi, his mustache is missing | waiting on Art Library |
| c5no | 1 | ch1Spot | We need poses in the game that are like when the character is thinking or examining something that another cha | waiting on Art Library |
| nre4 | 1 | ch1Spot | In addition to having separate images that maybe we will need for the grass and the light bulb and the cube, I | waiting on Art Library |
| g4gl | 2 |  | I think in chapter 2 we need a special animation frame for every single NPC who's in this like dazed state, wh | waiting on Art Library |
| jykk | 2 | ch2Lemon | We need images of whenever a person finds a flashbulb, whether it's in chapters 124567 whenever we need a dedi | waiting on Art Library |
| 95v4 | 3 | ch3Pier | Iron Gil is overlapping the pier. He needs to be purely on the water all the way to the right, and if some of  | Iron Gil: never worked |

### A VOICE ONLY

| Report | Ch | Scene | Tom's note (start) | Status |
|---|---|---|---|---|
| 9h7v | 1 |  | Needs to be re-recorded. It doesn't sound like a child and it sounds very slow | waiting on re-record: Moss and Dot speed |
| kuq6 | 1 |  | If it's possible, can we give her a Chinese accent? Currently she has a British accent. | waiting on re-record: Oolong accent |
| kviv | 1 |  | This dialog is just not coming off funny. I think he needs to speak faster in general. and we need tagging on  | waiting on re-record: Gus faster, funnier tags |
| e931 | 2 |  | For some reason, she's pronouncing Tom like tomb, and I think it's because it's in all capitals, so I guess wi | waiting on re-record: "Tom" said like "tomb" |
| ux5f | 2 | ch2Carmen | Arman and everybody else who is in a day is because of the purple haze should be saying it in a tonal voice th | waiting on re-record: dazed sing-song voices |
| z688 | 2 | ch2Porch | TNB in general through this chapter, but anytime he speaks, he needs a much more like mellow and nonchalant ki | waiting on re-record: TNB mellow voice (79 ch2 lines) |
| 6knk | 2 |  | She's still pronouncing Tom like tomb, and it's still in SO this was never fixed in the last round of updates | waiting on re-record: Boomie still says "tomb" |
| hb2d | 2 | ch2Boss | Right now he just says the word rumble like it's just a normal sentence. It should be like elongated and drawn | waiting on re-record: drawn-out RUMBLE |
| y2ct | 2 | ch2Boss | He says this so, I don't know. I feel like there's no voice annotations being used. I need to check, but Tom h | waiting on re-record: Tom acting tags (14 lines) |

### B REWORDED

| Report | Ch | Scene | Tom's note (start) | Status |
|---|---|---|---|---|
| dd0j | 1 | ch1Theft | She should say something funnier, like instead of it's the brand's thing I've ever seen, like something like i | waiting on recording of the new line |
| u7mr | 1 | ch1Spot | The dialog both doesn't make sense and is not funny | waiting on recording of the new line |
| rd99 | 2 | ch2Loft | I feel like this dialog shouldn't happen until after they exit the loft, because how could they see the sky wh | waiting on recording of the new line |
| gyx4 | 2 | ch2Carmen | This is weird because there is no animation where he goes behind the counter and gets them, and I don't think  | waiting on recording of the new line |
| ivwx | 2 |  | Whether the player talks to Carmen first or Miss Odette first after the conversation, there should be some dia | waiting on recording of the new line |
| 44zb | 2 | ch2Lemon | Pulling off a hole makes absolutely no sense. This needs to be rewritten and this applies to anywhere in the g | waiting on recording of the new line |
| ysg4 | 1 | ch1Theft | This dialog is not really that funny, and I feel like it could be spoofing something off of Bobby, or it could | waiting on recording of the new line |
| 2kx7 | 1 | ch1Theft | Remove the comma after Tom in both the text and for a new | waiting on recording of the new line |
| fs0m | 1 | ch1Theft | Instead, she should just say oh no!that my mudblob is stealing DD's crisp! And she should be a little bit scar | waiting on recording of the new line |
| xcmh | 1 | ch1Theft | DD should not say a what climbed in my window. She should say what in goodness sake was that? and she should b | waiting on recording of the new line |
| jbp3 | 1 | ch1Theft | Since the mud blob has left at this point, Rose should say use the past tense | waiting on recording of the new line |
| nilm | 1 | ch1Theft | Grace shouldn't say fancy poop, she should say a sneaky poop. And she should be obviously like very immaturely | waiting on recording of the new line |
| tjpw | 1 | ch1Mudling | In the previous land, when DD says so we can follow the trail, it sounds like she's saying that the mud blob i | waiting on recording of the new line |
| y9u1 | 2 | ch2Loft | I don't get this line. Change it to something wittier or funnier, or just something that makes sense | waiting on recording of the new line |
| ppze | 2 | ch2Loft | I don't understand the sentence. Tom lives in Jefferson Park, so and that's where the starter is, so how could | waiting on recording of the new line |
| dvvp | 2 | ch2Starter | This is a bad pun because dough doesn't rhyme with now. needs to be changed | waiting on recording of the new line |
| mgjd | 2 | ch2Smog | This line doesn't flow well with the previous line | waiting on recording of the new line |
| mrck | 2 | ch2Lemon | I don't understand. lost at what, and what are they trying? This dialog needs to be changed. Doesn't make sens | waiting on recording of the new line |
| jhu3 | 2 | ch2Boss | When everything gets stuck, nothing moves, nothing changes, it's very strange, abstract language | waiting on recording of the new line |

### C UNVERIFIED

| Report | Ch | Scene | Tom's note (start) | Status |
|---|---|---|---|---|
| a0r8 | 1 |  | NBC is facing the wrong way | facing at Dot: ch1fix1 could not tell from the picture; closed under the general change |
| kyzo | 1 |  | Tom is standing too close to Sal | Sal spacing: log says not checked by eye |
| es1t | 2 | ch2Smog | Another example of an NPC facing the wrong way | facing: backlog2 could not reproduce; closed later under a general facing change |
| fmss | 2 | ch2Smog | Smog enemies are facing the wrong way | smog facing: same |
| 4dlv | 2 | ch2Source | For some reason, the dog is not standing next to them. This is another example of the party spreading out in w | Nara beside Tom: backlog2 said leave open until you replay; closed anyway |
| 2mrs | 2 | ch2End | We need an actual animation here where she hits him with the towel. It would be hilarious | towel hit: checked by positions only, not by looking |

### E FIXED IN CODE

| Report | Ch | Scene | Tom's note (start) | Status |
|---|---|---|---|---|
| r0ib | 1 | ch1Theft | Talking frames should also always update the portrait image in the dialog box that should be a cropped version | fixed |
| wlbn | 1 | ch1Theft | Up until this line, Bobby should be at the very back of the house, facing to the right, seemingly doing someth | fixed |
| 9dh8 | 1 | ch1Mudling | The muddling should be positioned more to the right and facing to the left | fixed |
| si36 | 1 |  | The player should be able to interact with any of the crumb trails, including this big piece in front of Tom | fixed |
| sybk | 1 | ch1Skeeter | In a position like this, DD should be standing next to Tom, and if there was a monster in her way or an enemy  | fixed |
| rysi | 1 | ch1Grump | Enemy is facing the wrong way | fixed |
| 06hx | 1 |  | I need an option, and maybe it only appears when selecting the difficulty and choosing like an admin mode, but | fixed |
| 8n6x | 1 | ch1Pond | The big one is appearing on the land, but his graphic has water in it, so it looks strange and unnatural I thi | fixed |
| 62ho | 1 |  | After defeating the big one and coming back to the area, he appears again as a character that you can beat, an | fixed |
| 2guu | 2 | ch2Starter | The starter jar is too big. It should be at least 25% smaller | fixed |
| 2lln | 2 | ch2Flurry | When entering Griffith Park, you can't see the monster because he's like way down at the bottom of the screen | fixed |
| l1cq | 2 | ch2Coyote | Another strange positioning issue, and we have a limitation, of course, because not all of the monster frames  | fixed |
| n7ws | 2 | ch2AfterBoss | Is that a pipe overlaying the enemy? Why does it look like a someone drew it in Microsoft Paint? Shouldn't the | fixed |
| oed4 | 2 | ch2AfterBoss | The dialog portrait for the monster should match his new state after defeating him | fixed |
| w82d | 2 | ch2AfterBoss | The whole sneezing animation is missing | fixed |
| 281i | 2 | ch2AfterBoss | I think there needs to be a final state of the hill where it just merges into and just disappears into the hil | fixed |
| vht4 | 2 | ch2End | Bad positioning, maybe they do it in the middle of the street because right now Miss Odette and Arman are bloc | fixed |
| utr2 | 6 |  | When the block breaks, there's nothing left behind. In other words, the squirrel and the basket are gone | fixed |
| 4sgz | 1 | ch1Theft | I think the prompt needs to be more specific here. I know originally you had put years, but when you did the,  | fixed |
| vqel | 1 | ch1Theft | At the beginning of the scene, Bobby is by the front door and then he just speeds off to the back of the room, | fixed |
| 54vk | 1 | ch1Theft | The characters are not showing in the portrait in the bottom left a close-up of their talking corresponding ta | fixed |
| m2a0 | 1 | ch1Spot | I'm not seeing any of the new graphics | fixed |
| 230r | 2 |  | Should be zoomed in on Tom, look at the beginning of chapter 1 | fixed |
| lnkb | 2 | ch2Loft | Head size needs to be amplified in all of the talking poses, just like it is for the walking | fixed |
| 64qv | 2 | ch2Sky | Why is TNB's crop in the portrait for the dialog so strange? It's cutting off his face | fixed |
| smrp | 2 | ch2Sky | This emotion state is size down too much for TNB and he's facing the wrong way | fixed |
| ak0n | 2 | ch2Sky | Maura does not immediately interact with Tom when he approaches the house it only happens when entering the ho | fixed |
| 5qyh | 2 | ch2Porch | The portrait crops all need to be like this for Tom, at least, but really it should be everybody the very top  | fixed |
| ywn0 | 2 |  | She's facing the wrong way | fixed |
| casc | 2 | ch2Starter | The animation when entering the house is very like jarring, it kind of wobbles back and forth, and the charact | fixed |
| ex1k | 2 | ch2Starter | TNB is facing the wrong way yet again | fixed |
| 9078 | 2 | ch2Smog | The smog is still behind the post, maybe Mr Washington needs to have moved away as the smog approaches. They c | fixed |
| r3vz | 2 | ch2Lemon | The base of the tree, like the mound, should be smaller because right now it's so big it's overlapping with so | fixed |
| 1v7s | 2 | ch2Boss | Tom keeps facing the wrong way | fixed |

## Next session (prompt: "Read claude/report-audit.md, then fix the backlog.")

1. Put the four rules above into docs/REPORTS.md, CLAUDE.md and claude/next.md ORDER NOW -4 (re-read next.md right before writing and merge).
2. Add `python3 tools/reports.py wait <id> "<what Tom must do>"`: keeps the report in `inbox` with a `waiting` field; `list` prints WAITING reports in their own block after the open ones.
3. Restore the 15 reports in A and C to `inbox` from git history (their json and jpg are in the commits that added them on `inbox`). Mark the 9 A reports `wait` (re-record, with the exact Voice Library filter). Re-check the 6 C reports by reproducing each from its own json and LOOKING at portrait and landscape frames; close only those that look right.
4. Work 95v4 (Iron Gil overlaps the pier, ch3Pier): never touched by any session.
5. The 7 art reports stay WAITING on the Art Library group "Report fixes" (install table: claude/next-addendum-ch2fix1.md).
6. Any report Tom files about something in E is a real regression: reproduce it first, then find which later build undid it (git log -S on the fix).
