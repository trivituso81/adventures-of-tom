# How chapters are written and reviewed with Tom (method, from 2026-11-16)

This is the method that got chapter 1 locked on 2026-11-16 after fixing lines one at a time in chat failed. Every story-writing session reads this file first. It beats the review steps in claude/story-build.md section 2A where they differ.

## Read, and only these

1. This file.
2. claude/voice-humor-brief-gemini.md: Tom's own dials and notes for all 12 characters. Write each line from the speaker's entry here first.
3. claude/story-ch01.md: the locked chapter 1. It is the voice model for the quick style, and its facts table is canon.
4. claude/story-thread.md: the approved story.
5. The locked story file for the chapter you are writing (claude/story-chNN.md), for STORY FACTS ONLY: what happens, the block, the coin, the boss. Its dialogue is in an older, sweeter, longer voice. Do not carry its lines over.
6. The live game's lines for that chapter, from the repo trivituso81/adventures-of-tom (data/scenes.js, SCENES.chN...; engine/travel.js for flight and cab lines).

Corrections to the Gemini brief, ruled by Tom: Boppy is a retired Rikers assistant deputy warden who fishes, not a boat fisherman. Bernadette stays the Neighborhood Watch captain who calls Tom "3468"; clothes and status digs may be added, no weight jokes. Real names (Angelo, Debi) never go in game text. Battle design is a separate thread: do not raise it.

## The steps

1. START FROM THE GAME. Read the built lines for the chapter. Keep every built line that still fits the story and still does its job. Change only what the new story needs or what is weak. Tom rated the built chapter 1 opening above a brand-new one. A new line has to beat the built line, not just differ from it.
2. Write the chapter short. Chapter 1 is 58 lines. A scene moves on as soon as its job is done.
3. Check every exchange against the four tests and the lessons below BEFORE Tom sees anything.
4. Publish the script as a review page (see "The review page") and tell Tom it is ready. Do not paste a long script in chat and do not ask him to fix lines in chat.
5. Tom marks lines on the page and pastes one block of feedback. Revise the whole chapter in ONE pass against all the marks, republish the page with only the changed lines flagged, and reply with a short table: his mark, what it is now.
6. Repeat until he says lock. Then save claude/story-chNN.md as LOCKED, add any new lessons to this file, and give him the prompt for the next chapter.

Expect one marking round, sometimes a short second one. Chapter 1 took three because the lessons below did not exist yet.

## The four tests (every exchange)

1. FLOW: each line answers the line before it. A question always gets an answer from someone. A greeting gets answered before anything else. A line that starts a new subject needs a lead-in the player just saw or heard.
2. TRUE TO THE MOMENT: fear sounds like fear, shock like shock. A frightened six-year-old screams for a grown-up. A line has to be true at the moment it is said.
3. FUNNY FROM CHARACTER: at least one line in the exchange is funny because of who says it. No line explains its own joke. No joke that needs working out.
4. SHORT: nothing said twice. Nothing said that the action already shows. No fixed line cap.

## Rules for revising

- Never repair one line alone. Rewrite the exchange around it and re-run the four tests.
- A note from Tom is one more constraint on the same target. It is never a new direction and never a new blanket rule. Going "from one extreme to another" is the failure he named.
- Lines he tags Love it are locked. Lines he leaves unmarked in the current version are not to be touched. A line he left unmarked in an earlier version is safe to restore.
- When he says a line "was fine, just written poorly", keep the idea and fix the wording. Do not swap in a new prop or a new joke.
- When a punchline fails twice, cut it. End the scene on the last good line or on an action. Short and clear beats a forced joke.

## Lessons from Tom's marks on chapter 1

| What he marked | The lesson |
|---|---|
| Opening lines about cab logistics: Not funny, Wrong for the moment | A scene never opens on logistics |
| A brand-new opening with a jump scare: "too jarring" | Chapter openings ease in. Check what the game already does |
| Half of all marks were Doesn't follow | See test 1. This is the most common failure |
| The trimmed washer line, "guard the washers", purple specks, "This one you can keep", "Tata lost to a marble": Unclear | No prop, callback or reference he would have to ask about. A callback to a word another character used six lines earlier does not land |
| The muffins-versus-tin jokes, three versions | Do not make a joke out of which thing the family is chasing. It confused him every time |
| "There are THREE of them", "I can count, Tom", "I said nobody tell him", "I leave for ONE weekend": Not how they talk | No repeated-phrase panic, no curt put-down between Tom and his mother, no scolding "I said" from Deedee, no sitcom exasperation from Tom |
| "I'm down HERE", "Don't tell him I asked", "Stay out of the draft, mister", "I'm not." : Not funny | A plain statement, a coy line or a one-word comeback is not a joke |
| Rose lending Backup Lamby; Rose shouting "MINE!" | Rose would never give up her Lambies, even to lend one. She is polite and cute and thanks people. She never grabs |
| Rose saying "The mud has EYES!" when scared | When she is frightened she screams for Deedee. She does not make an observation |
| The toaster line that mentioned Boppy's late mother | NEVER invent a relative, living or dead, for a joke. That was Tom's real grandmother and it hurt |
| "Sal, how fast does cab seven go?" | A closing line must make sense on its face. If it does not build anticipation or get a laugh, end on the hook alone |
| "soup" in the squishy's name | It is the Sparkling Diamond Gold Dumpling Squishy |
| What he loved | "BOO!", "GAH! Rose! I almost fainted into Sal's hedge.", "Up, Tata! Up up up!", "Full hedge ambush. I never stood a chance.", "Give back Deedee's muffins!". Short, physical, said in the moment, one clear image. Kids demanding things. Tom laughing at himself |
| What he approved with a "Yes!" | Boppy: "Why are you three on the floor?" then "That wasn't Rose?". Boppy seeing the monster and still missing it |

## Saved for chapter 3 (Tom's return to Long Island)

Tom said the hedge ambush would work better there. Four of these he tagged Love it:
- Tom: Ahh, Long Island. The one place nothing ever surprises me.
- Rose: BOO!
- Tom: GAH! Rose! I almost fainted into Sal's hedge.
- Grace: She's been in that hedge since breakfast. Thank you for screaming.
- Rose: Up, Tata! Up up up!
- Tom (text, to Amy): Full hedge ambush. I never stood a chance.

Also owed to chapter 3: Boppy's "Tom. You stay in front of those girls." (a plant for chapter 13).

## The review page

- Chapter 1's page is the claude.ai artifact "Chapter 1 Script Review", slug c1b20d24-a5dd-40a2-b94c-2e391cd42d3b. Read its HTML with the artifact tools and publish a NEW artifact for each chapter from the same page, changing the title, the script array, the storage key and the feedback header.
- The script is one JS array: scenes, each a list of [speaker, text, flag]. Speaker "*" is an action line. Flags: "N" shows a New line badge (lines changed since his last marks), "L" shows You loved this, "B" shows In the game now.
- His tags: Love it, Not funny, Too long, Unclear, Doesn't follow, Not how they talk, Wrong for the moment, Too sweet, Cut it. He can also type his own version and a note per line, a note per scene and one overall.
- He presses Copy my feedback and pastes one block into chat. Line ids look like S3-L4 (scene 3, fourth spoken line) and S3-A2 (second action line).
- On each republish, clear the old "N" flags, flag only what changed, and bump the storage key so old marks clear.

## Owed to the tracker (claude/story-build.md was NOT rewritten on 2026-11-16)

The next session that rewrites story-build.md should merge these in:
- Board, chapter 1: Script column becomes "LOCKED 2026-11-16 19:35 (rewrite from Tom's Gemini workshop, 58 lines)". The Live column's queued assets (section 9) are for the older script: the 43 voice lines no longer fit.
- The top of section 5 and section 2A: point to this file as the method. Chapter 8 was the voice model for wit; chapter 1 is the model for pace and for how Tom reviews.
- Chapters 2 to 8 were locked before this method and before the chapter 1 changes (apple muffins and the muffin pan in place of the crisp and the tin; a weekend visit; no long-coat lines; the fish is won by Rose's BOO). Each is rewritten with this method when Tom asks for it, in order.
- Section 8: add the rulings listed under "Read" above, and "2026-11-16: chapter 1 opens with the built lines; the hedge ambush moves to chapter 3".
