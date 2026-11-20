# The muffin theft scene redo (chapter 1, Deedee's kitchen, scene `ch1Theft`)

Written 2026-11-19 from Tom's screen recording of the live scene (19:25) and his words:
"the monster animation looks out of place (differnet art style), he is holding a crisp instead of the muffins, the muffins are displayed on the counter after he takes them, and the dialogue of them falling is strange and doesnt feel natural (eg, why are they talking so much on the floor). we need a complete redo of this scene so that it hilarious!"

This file is the whole plan. Two build cards use it: `c-heistart` (part A) and `c-heist1` (part B). Nothing in the game was changed by the session that wrote it.

## 1. What is wrong, and the cause of each (all checked in the repo, not guessed)

| Tom saw | Cause | Evidence |
|---|---|---|
| The monster looks like a different art style | The scene draws the old heist sheet `art/foes/mudling-heist.webp` (16 `mh_` frames): glossy cartoon, thick outlines, flat. The battle Mudling Tom approved later (`art/raw/enemies/enemy-mudling-v2.png`, in the game as `art/foes/mudling.webp`) is matte and handbrushed. The heist sheet was never repainted after the matte rule of 11-05. | The two sheets side by side |
| It holds a crisp, not the muffins | The crisp dish is painted into the old sheet's frames `mh_grab`, `mh_hug`, `mh_glance`, `mh_scurry_a`, `mh_scurry_b`, `mh_giggle`, `mh_sneak`. The sheet was made for the old rhubarb crisp story. The chapter 1 teardown kept it as a stand-in ("the tin is a stand-in for the twelve-cup pan until new art is approved") and no new art was ever asked for. fix-ch1art2 then removed the Library entry "Mudling with muffins", saying the Mudling already holds the painted pan. That is true only in Grump Hollow (`STORY_PROPS.muffins`), not in the kitchen. | The sheet, `tools/sprite-bake/bake_mudling_heist.py` |
| The muffins stay on the counter after it takes them | A code bug. The scene step is `{prop:'muffinpan',hide:true}`. `compileScene` (engine/story.js) picks the first operation name it finds in a step, and `hide` (hide an ACTOR, engine/story.js) is listed before `prop` (engine/scene-props.js). So the step tries to hide an actor called `true` and does nothing. The pan prop is never hidden. The same step in the Grump Hollow scene (Deedee picks up the empty pan) has the same bug. Three fix builds (fix-cutpolish4b, -2, -3) moved the pan around the table and each wrote "the grab already hides it" without looking at a frame after the grab. | `Object.keys(SCENE_OPS).find(k=>k in st)`; the pan is on the island in every frame of Tom's recording, to the end |
| The floor talk is strange | Three things. (1) The lines play after the thief has left, one slow box at a time, while all three lie flat, so the family chats on the floor with nothing happening. (2) "GAH! I'm on the floor. Grace, is that your elbow or mine?" is a joke line said at the moment a real person would only yell. (3) Rose is drawn lying down but the script has her scramble behind Tom. | Recording 14 s to 24 s: ten seconds on the floor |
| Not funny | The scene's joke is in the locked words: Boppy tells a story about a man stealing bread while a real theft happens behind him, notices nothing, and only minds that the mud got a muffin first. The build throws it away: Boppy turns and gasps (`em_surprised`), Deedee hops to the couch and stands with her arms crossed while her pan is taken, the Mudling grabs from two tiles away from the island, and the theft runs in silence. Boppy's Voice Studio entry says "He would probably not even notice a monster in the room." | Recording 10 s to 14 s |

Stop-loss note: the pan has now missed three fixes in a row. The cause was not the pan's position. Do not move the pan again.

## 2. The call

Redo the middle of the scene (door bang to the door slam) as watched action, fix the bug, repaint the monster. Keep the opening four lines and the closing six: Tom approved them, they are recorded, and his notes name none of them.

| Part | Kept | Changed |
|---|---|---|
| Opening (Deedee, Tom, Deedee, Boppy starts his story) | All four lines and clips, the walk in, Rose hopping down | Nothing |
| The theft | The bang, the mud coming in the door, the knockdown, the mud prints and crumbs | New monster sheet, new staging (section 4), Boppy never turns, Deedee stands her ground, the pan really leaves the counter |
| The floor | Rose's scream (clip kept) | It plays while they fall. Tom's floor line is cut. Everyone is back on their feet before the next line |
| Closing (Deedee's pan line to "Tom, you heard her.") | All six lines and clips | Boppy turns around only on "Where'd the muffins go?" |

## 3. The script

★ new line, ✎ changed line, no mark = kept word for word.

- Deedee: There he is! Come here. Let me look at you. I missed that face. Now sit, you're having a muffin.
- Tom: Hi, Mom. I missed yours too. Is that the cinnamon topping? I've been thinking about that topping since we flew over Kansas.
- Deedee: Twelve of them, and all twelve are still there. I've been standing between that pan and your father since six this morning.
- Boppy: In my own kitchen! Tom, back at Rikers I had a key to every door in the place, and here I can't get near a muffin. You know, one time a fella tried to walk out of the mess hall with a whole loaf of bread under his hat...

[BANG. The screen door flies open. Boppy does not turn around. A ball of mud rolls in and bowls Tom, Grace and Rose over like pins.]

- Rose: AHHH! DEEDEE! (plays as they fall)

[The ball stops at the island and stands up into the Mudling. It looks up at the pan. It looks at Deedee. Deedee looks at it.]

- ★ Deedee: Excuse me! I just washed that floor.

[The Mudling stretches up, lifts the whole pan over its head and sneaks out the long way: right behind Boppy's chair. Tom and the girls get up while it goes. Boppy's line plays over the sneak.]

- ★ Boppy: ...so I say to him, "Nice hat." He says, "Thank you." And the hat is steaming.

[The door slams.]

- ✎ Grace: Tata, get UP, it's getting away! (was: "It's mine! Tata, get UP, it's getting away!" The first two words answered the cut elbow line.)
- ★ Tom: I'm up. I've been here four minutes.
- Deedee: That thing took my good twelve-cup pan! I don't even put that pan in the DISHWASHER.
- Boppy: ...and I only caught him because the hat kept getting taller. Where'd the muffins go?
- Deedee: A ball of mud came through the door and took them. Pan and all.
- Boppy: The mud gets a muffin and I don't?
- Deedee: Girls, sneakers. Tom, hold the door. Hubby, you stay right there. When we get them back, the first one's yours.
- Boppy: The first one. Tom, you heard her.

Cut: Tom's "GAH! I'm on the floor. Grace, is that your elbow or mine?" (line, clip, mood row, gap row, talk row: purge all of it).

Why each new line (so a later fix edits, and does not start over):

| Line | Built from | The joke in the words alone |
|---|---|---|
| Deedee: "Excuse me! I just washed that floor." | Deedee loves cleaning; firm, practical | A monster is in her kitchen and her first complaint is the floor. It also sets up her pan line: the floor, then the pan, never the monster |
| Boppy: "...so I say to him, 'Nice hat.' He says, 'Thank you.' And the hat is steaming." | Boppy's move "misses the obvious thing and tells a story from back in the day"; warm run-on | Fresh bread under a hat. It bridges his two recorded halves ("under his hat..." and "...the hat kept getting taller") so the story never stops for the theft |
| Tom: "I'm up. I've been here four minutes." | Tom dry and calm, flatter the more rattled he is | He answers Grace, then states the whole situation in six words |

Voice scripts for the four new or changed clips (Tom's tagging style: voice only, tags where the tone turns):

- Deedee: [sharp, offended] Excuse me! [flat, slower] I just WASHED that floor.
- Boppy: [storytelling, enjoying himself] ...so I say to him, "Nice hat." [mild, casual] He says, "Thank you." [punchline, delighted] And the hat is STEAMING.
- Grace: [urgent, bossy] Tata, get UP, it's getting AWAY!
- Tom: [flat, winded] I'm up. [punchline, dry] I've been here four minutes.

## 4. Staging (part B builds this; tile numbers are today's and get checked in frames)

| Beat | What the player sees | Engine notes |
|---|---|---|
| 1. Bang | Door sound. Tom and the girls turn. Boppy keeps facing the table. Camera moves in on the island and the door side | Boppy gets NO `em_surprised` anywhere in the scene |
| 2. Strike | The mud ball (new frame `mh_ball`, spun by code as it rolls) comes up the hall fast and goes through the three of them. They fall one after another, a quarter second apart. A bowling strike sound if one exists, else the existing bonk and thud | `knock` as today. Rose's "AHHH! DEEDEE!" starts on the first hit. Check whether a `talk` step can run inside `{all:[...]}` beside movement; if it cannot, show the box at the hit and let the fall play under it |
| 3. Stand-off | The ball stops ONE tile from the island, pops up into the Mudling (`mh_look`), looks up at the pan, turns to Deedee. Deedee stays by the island facing it, `em_angry`. Half a second of nothing | Deedee does not hop away. Her new line plays here |
| 4. The lift | `mh_reach` (stretched tall), then `mh_hold`: the pan is over its head. On that same frame the pan prop leaves the counter (the fixed hide). Crumbs appear | The pan in its hands is painted into the new sheet, so nothing is drawn on top |
| 5. The sneak | `mh_sneak_a` and `mh_sneak_b` alternating, slow, along the back of Boppy's chair, then quick to the door. Boppy's steaming hat line plays over it. Tom, Rose and Grace get up during the sneak (`getup`), Rose behind Tom | If a line cannot play over movement: the Mudling freezes mid-sneak behind Boppy for the line, then runs |
| 6. Slam | Door sound, Mudling gone, mud prints fade. Camera back | |
| 7. Words | Grace, Tom, Deedee standing. Boppy finishes his story still facing the table and turns around on "Where'd the muffins go?" | From here the scene is as built |

Nobody speaks while lying down except Rose's scream during the fall.

## 5. The new monster sheet (part A adds the Library entry; Tom generates and approves)

Art Library entry `ch1-mudling-heist2`, tab Enemies, group Chapter 1, shape 3:2. Attachments: `art/raw/enemies/enemy-mudling-v2.png` and the approved muffin pan picture (entry `ch1-muffin-pan`, `art/raw/props/ch1-muffin-pan-v1.png`). Follow the pattern of `ch2-bigshake-sneeze` in `tools/art-library/ch02-05-prompts.js` for the entry's fields, and the Library's rules: short, each thing once, name only what should appear, no "left" or "right", say "two eyes".

Prompt text:

```
IMAGE REQUEST: ONE SINGLE SHEET. Return exactly one image, nothing else. Generate it now.

ATTACHED IMAGES
1) The approved painting of the Mudling. Copy this creature as closely as possible: the same shape, colors, face with two eyes, leaf sprout and matte handbrushed finish.
2) The approved painting of a twelve-cup muffin pan full of muffins. Copy it as closely as possible wherever the pan appears.

PAINT THIS SHEET
Six poses of the Mudling in a 3 by 2 layout on a flat magenta background (#FF00FF). Each pose fills most of its cell, nothing overlapping, the creature facing the same way as in attachment 1 in every pose.
Top row: 1 curled into a tight round ball of mud, the leaf sprout sticking out of the top. 2 standing, head tipped back, looking up with wide eyes and an open mouth. 3 stretched tall and thin, both arms reaching straight up.
Bottom row: 4 standing proud, holding the muffin pan flat above its head with both arms, a big smug grin. 5 the same, pan above its head, sneaking, body leaning forward. 6 the same, pan above its head, sneaking, body leaning back.
```

Frame names for the bake: `mh_ball`, `mh_look`, `mh_reach`, `mh_hold`, `mh_sneak_a`, `mh_sneak_b`.

## 6. Part A (card c-heistart): the bug and the Library entry

1. Fix the hide bug at its cause: in `compileScene`, a step that has `prop` runs the `prop` operation (or give the hide its own name, `{propHide:'muffinpan'}`, and change both uses: `ch1Theft` and the Grump Hollow pan pickup). Grep `data/` for every other step that carries two operation names and list what you find in docs/CHANGES.md.
2. Add a check to `tools/cut_natural_test.py` (or the nearest scene test): after the grab in `ch1Theft`, `SCENE_PROPS.muffinpan.show` is false. Look at a frame after the grab in portrait and landscape (`tools/scene_frames.py`): the island is bare.
3. Add the Library entry of section 5 with the prompt as written (`node` the prompts file the way the other chapter files are built; run the Library tests).
4. Change nothing else in the scene. Push as `heistart`. Tom's card `t-heistart` (already on the board, it blocks `c-heist1`) tells him where to press.

## 7. Part B (card c-heist1): the scene

Starts when Tom has approved `ch1-mudling-heist2`.

1. Bake the approved sheet (`tools/sprite-bake/bake_mudling_heist.py`, six new names, matte sheet keyed on magenta). Size the Mudling against the family at the kitchen's zoom: look at it beside Rose before going on.
2. Purge the old sheet completely: the 16 old frame names, the old picture, old comments ("pie-heist"), and grep for `mh_` names that no longer exist.
3. Rebuild `ch1Theft` between Boppy's first line and Deedee's pan line to sections 3 and 4. Lines go in word for word. Do not write or reword dialogue; if a line does not fit a beat, leave the beat simpler and say so on the card.
4. Voice: add the four voice scripts of section 3 to the Voice Library the way chapter 1's lines were added; purge Tom's cut line and Grace's old wording; `python3 tools/clip-audit/unused_voice.py` must report 0. New lines play through speech synthesis until their clips exist. Put the clips on the board the way the current voice flow does (a Tom card with ask voice, or the voice-gen run), and name the count per speaker.
5. Mood, talk, gap and Script Editor rows for the new lines (`python3 tools/script-index/build.py`, docs/script-convos.tsv). Gaps: Deedee's floor line `snap` after the stand-off, Tom's line `snap` after Grace.
6. Watch it: `tools/scene_frames.py` for `ch1Theft` in portrait and landscape, every beat of section 4, then the chapter from chapter select through the kitchen. Checklist to look at in the frames before pushing: the monster matches the battle Mudling's finish; muffins in its hands from the lift to the door; island bare from the lift on; Boppy's back to the theft until his last question; nobody lying down during a line except Rose's scream; the Mudling touches the island when it lifts.
7. Smoke, tag check, CHANGES heading `heist1`, push. The card's `after` is a Tom card with ask play, made in the same push: "Chapter select > Chapter 1, jump to the theft scene in Deedee's kitchen", with the six things of step 6 as what he should see.

If a step misses twice, stop (stop-loss rule in the Project instructions), write why on the card, and move it to Stuck.
