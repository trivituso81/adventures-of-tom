# Chapter 12 amber explanation: delta after Phase 1 (2026-11-12 21:25, tag `amberclear1`)

Tom built Phase 1 of claude/dialogue-build-instructions.md from the 314-row set BEFORE the chapter 12 amber lines were added (the set is now 329 rows). This file is only the difference: 9 lines to change and 10 lines to add, all in data/scenes-ch12.js (scenes ch12Marlowe, ch12Carmen, ch12Alvarez, ch12After). Machine copy: `claude/dialogue-ch12-amber-delta.json`.

Why (Tom 21:17): people are suddenly in amber and nobody says what amber is. Much more explanation needed.

## Lines to change

Match the text in the game now. Four lines were already reworded in Phase 1 (the column shows that wording); if a line still has its original wording, the json gives it in `original`.

| Scene | Who | In the game now | Change to |
|---|---|---|---|
| ch12Marlowe | Tom | He's draining the color out of the whole block. And he did something worse. Look at Mr. Washington. He's frozen solid. | He's draining the color out of the whole block. And he did something worse. Look at Mr. Washington. He's not moving. |
| ch12Marlowe | TNB | He's trapped in amber. Amber is warmth that got stuck. Doña Carmen's is right there, and the Alvarez house is down 2nd. They might be frozen too. | When that man took the color and the music, the warm part of the day had nowhere to go. So it set hard, right around him. That's what amber is: warmth that got stuck. |
| ch12Marlowe | Tom | We check on the neighbors first. | Doña Carmen's is right there, and the Alvarez house is down 2nd. If it happened to him, it happened to them. We check on the neighbors first. |
| ch12Carmen | Tom | She's frozen in amber, right in the middle of a sentence. | She's in amber too, frozen right in the middle of a sentence. |
| ch12Carmen | TNB | Amber is just warmth that got stuck. You don’t break it. You give it somewhere to go. | It's warm, same as Mr. Washington's. I don't think we can break it, and I don't think we should. If amber is warmth that got stuck, we have to give the warmth somewhere to go. |
| ch12Carmen | Amy | Warmth. We’re good at warmth. Everybody find the warmest thing in the room. | Warmth. We're good at warmth. Something warm from outside the amber might get it flowing again. Everybody find the warmest thing in the room. |
| ch12Carmen | Tom | You were amber for a little while. | You were frozen in amber for a little while. A man in a grey suit took the color off the block, and all the warmth set hard around you. Your own pupusa got it moving again. |
| ch12Alvarez | Tom | Okay. The whole family is frozen in amber. Marlowe's grey got in through the front door. | Okay. The whole family is frozen in amber, same as Doña Carmen. Marlowe's grey got in through the front door. |
| ch12Alvarez | Amy | Heat is just movement. When the girls can’t sleep, we run. Nobody stays stuck when they’re moving. | Save the pupusas for when they wake up. Warmth isn't only food. Heat is just movement. When the girls can't sleep, we run. Nobody stays stuck next to somebody who's moving. |

## Lines to add

Add each right after the line shown (matched by its original wording; that line may itself be reworded above or in Phase 1). Several lines after the same line go in the order listed.

| Scene | Who | Add after | New line |
|---|---|---|---|
| ch12Marlowe | Rose | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | He's inside something. It's see-through and yellow, like the honey bear. |
| ch12Marlowe | Grace | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | It's the same color the Long Island gate turned, Tata. That's amber. It's what the bugs are stuck in, in my rock book. |
| ch12Marlowe | TNB | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | It's hard like glass, but it's warm. Babe, it's as warm as a mug right out of the kiln. |
| ch12Marlowe | Tom | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | He's all right in there. He's just stopped, right in the middle of one second. |
| ch12Marlowe | Amy | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | This is what Vance told us he does. He stops people at a nice moment so that nothing ever changes. This is what it looks like up close. |
| ch12Marlowe | Tom | We check on the neighbors first. | And if amber is warmth that got stuck, maybe we can get it moving again. |
| ch12Carmen | TNB | I was what? I had a whole sentence. I lost the sentence. It was a good sentence. | So that's the rule. You can't crack amber. You warm it up with something the person loves. |
| ch12Alvarez | TNB | ...Okay. That one can stay. | Pupusas next door, laps in here. Anything warm enough gets the amber moving. Good to know. I have a feeling we're going to need it. |
| ch12After | Grace | Long Island is under glass. So we go under the glass. Or around it. | The Long Island gate turned amber, Tata. Is Deedee stuck like Doña Carmen was? |
| ch12After | Tom | Long Island is under glass. So we go under the glass. Or around it. | Maybe. And if she is, we know how to fix it now. We bring her something warm. |

## Steps

1. Clone main, read CLAUDE.md. Confirm Phase 1 is on main (docs/CHANGES.md entry `dialogclear1`; grep data/scenes-ch12.js for "frozen in amber"). If Phase 1 is NOT there, stop and tell Tom.
2. Apply the table. Keep the file's curly apostrophes. New lines by a different speaker are new `{talk:...}` steps.
3. Staging: the five new lines at Mr. Washington need him on screen (`{cam}`) with the family facing him; TNB steps next to him for the touch line.
4. Voice: the 9 changed lines go silent, the 10 new ones have no clip. If Phase 1 clips for the four already-reworded lines were recorded and merged, they are now unused: `python3 tools/clip-audit/unused_voice.py`, purge, note in docs/PURGED_VOICE.md. Rebuild the voice index so all 19 show under No clip yet. Update emotion tag rows for the changed lines.
5. Play chapter 12 from the chapter-select jump through the Alvarez house and the ending, portrait and landscape. Smoke, bump tags, CHANGES entry `amberclear1` with the 19 lines to bake, push.
6. Add the amber canon line (item 9 in claude/dialogue-build-instructions.md) to docs/CANON.md and claude/canon-addendum.md if Phase 1 did not. Merge an `amberclear1` section into claude/next.md.
7. Tell Tom: 19 chapter 12 lines to record, per voice.