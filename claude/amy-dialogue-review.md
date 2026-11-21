# Amy dialogue review: Special Education teacher rewrite

Status: PROPOSAL for Tom's review. Nothing built. Approved rows get applied next session.

## The shift in one line

Current Amy: a coach who grades. Punchlines come from being stern, fast and right. Proposed Amy: a Special Ed teacher who runs. She is patient and specific with kids, redirects instead of scolds, celebrates small wins, and keeps the competitive fire pointed at herself, the clock and Tom (never at the girls).

## Voice rules for the rewrite

| Rule | Keep doing | Stop doing |
|---|---|---|
| Praise is specific | "Gold stars. Both of you." | Generic "good job" |
| Redirect, do not scold | "Inside voices, please. I will wait." | Threats, detention, "see me after class" |
| Break it down, countdown | "Three more. Then water." | Barked drill-sergeant orders at the girls |
| Name the feeling | "That one is big. You can be mad and still line up." | Mocking a hurt ("second graders hit harder") |
| Reset after a loss | "Walk it off. We go again." (keep) | Blame |
| Competitive, self-aimed | Against Tom, the clock, her own PR | Against the kids, or crowing over losers |
| Teacher voice is calm, not loud | Firm, low, short sentences | Yelling at monsters as a joke |

## Canon decision (recommendation, needs your yes)

Amy is Long Island Elementary's Special Education teacher: a resource room, kids pulled from every grade. This keeps "thirty parents", "Amy has every key" and "Amy knows every kid in the building" working, and it is why Principal Pruitt leans on her. What changes: anything that says "second grade" or "thirty second-graders" becomes "my room" or "my kids". Class size: twelve.

## A. Battle lines (data/lines.js, key `amy`)

Every row here has a baked ElevenLabs clip. Changed lines go silent until you re-bake. Priority tells you which are worth the re-bake.

| Key | Current | Issue | Proposed | Priority |
|---|---|---|---|---|
| join | Need a fourth? I'm fast, I'm loud, and I brought a whistle! | "loud" is the old Amy | Need a fourth? I am fast, I am patient, and I brought snacks. | High |
| greet 1 | Grace! Rose! Did you stretch? | fine | keep | Keep |
| greet 2 | Tom, I ran eight miles before you woke up. | fine, sibling | keep | Keep |
| greet 3 | Race you to the fountain. No? Then I win. | fine, playful | keep | Keep |
| basic 1 | Coming through! Hydrate later! | fine | keep | Keep |
| basic 2 | Heads up! Mom has a record to set! | fine | keep | Keep |
| burpee / burpee_blitz | Five burpees! Four! Three! You're next! | "You're next" aimed at a kid | Five burpees. Four. Three. Breathe. You can do hard things. | Med |
| finish | I see the finish line. It's you. | fine | keep | Keep |
| redpen / red_pen | F. F. And see me after class. | punitive, the opposite of her | I circled what you did well. Now the rest. | High |
| hills / hill_repeats | Hill repeats! Up the slime, down the slime! | fine | keep | Keep |
| quiz / pop_quiz | Pop quiz! Eyes on your own puddle! | gotcha energy | Surprise quiz! Do not panic. You know this. Take your time. | High |
| marathon | Twenty-six point two! Straight through the slime! | fine | keep | Keep |
| pb | New personal best! Write it down, Tom! | fine | keep | Keep |
| pep / pep_talk 1 | Thirty seconds! Give me everything you've got! | drill sergeant | Look at me. Breathe. You have done this before. Go. | High |
| pep / pep_talk 2 | Eyes up, team! Stretching is over! | fine | keep | Keep |
| kettlebell_swing | Kettlebell swing! Hips, not back! | fine | keep | Keep |
| hot_lunch_tray | Hot lunch! Soup first, then recess. | fine, first/then is very SpEd | keep | Keep |
| goldstar_recess | Gold-star recess. Rest counts as good work. | perfect | keep | Keep |
| inside_voices | Inside voices, please. I will wait. | perfect | keep | Keep |
| oat_milk_please | No dairy, thank you. Oat milk, please! | fine | keep | Keep |
| false_start | False start. Back behind the line. | fine, calm | keep | Keep |
| negative_split | Negative split! The second half is FASTER! | fine | keep | Keep |
| detention_ult | Nobody leaves this room until that chalkboard is spotless! | detention is punishment | Nobody leaves this room until every single one of you knows how good you are. | High |
| marathon_ult | Right on Hereford, left on Boylston! Sprint to the tape! | fine | keep | Keep |
| hurt 1 | Ow! Second graders hit harder than that! | mocks the enemy, dated grade | Ow. Okay. I am okay. Deep breath. | High |
| hurt 2 | Hey! That's a time penalty! | fine | keep | Keep |
| low | Walking it off. Walking it off. | fine | keep | Keep |
| ko | Time. Out. Somebody hydrate me. | fine | keep | Keep |
| win 1 | That's how this family does it! | fine | keep | Keep |
| win 2 | Faster than Tom. As usual. | fine, sibling | keep | Keep |
| tombo | I called it! Get your own monster! | fine | keep | Keep |
| dc1 | Field day! Eggs on spoons! GO! | fine | keep | Keep |
| dc2 | Three more! Squeeze! Don't you DARE quit! | yelling | Three more. I am right here. You are not quitting on me. | Med |
| dc3 | Shortcuts don't COUNT, Tom! | fine | keep | Keep |
| tombo2 | Hold the rope, Tom! I'm taking the outside lane! | fine | keep | Keep |
| tombo3 | Sixty floors, Tom! Don't you dare drop behind my pace! | fine | keep | Keep |
| ff2 | My girls. Okay, hands together! Nobody stops the three of us! | fine | keep | Keep |
| praise 1 | Neatest handwriting in the building. And I check. | fine | keep | Keep |
| praise 2 | Your margins are immaculate. Gold star. | fine | keep | Keep |
| praise (boarding) 1 | Here! Gregori, party of four. We are always first in line. | fine | keep | Keep |
| praise (boarding) 2 | Present. I have never missed a connection in my life. | fine | keep | Keep |

New lines to add (no clip yet, so no re-bake cost):

| Key | Proposed | Why |
|---|---|---|
| hurt 3 | That was a lot. I am going to count to three. | the SpEd self-regulation beat |
| win 3 | Everybody did their job. I saw every bit of it. | specific, warm |
| praise 3 | You waited your turn. That is the hardest thing there is. Gold star. | praise for the invisible skill |

## B. Amy at home (data/maps-le.js, amyhouse NPC)

Voiced via dialog clips; same re-bake rule.

| Slot | Current | Issue | Proposed |
|---|---|---|---|
| lines 1 | Grace! Rose! Did you stretch before all this adventuring? | fine | keep |
| lines 2 | Tom, I ran eight miles before you woke up. Just stating facts. | fine | keep |
| lines 3 | Justin is rewiring the hallway. Again. He says hi from the ladder. | fine | keep |
| ch5-done 1 | Thirty conferences. Zero tears. Well. One. Mine. In the minivan. | fine | keep |
| ch5-done 2 | Tom. Thank you for coming. You are the good uncle. By a lot. | fine | keep |
| revisit 1 | Race you to the fountain. No? Then I win. | fine | keep |
| revisit 2 | Thirty second-graders and none of them as wild as you two. Which I love. | grade and count | Twelve kids in my room, and not one of them as wild as you two. Which I love. |
| revisit 3 | Rose, where are your shoes? Oh. Good. | fine | keep |
| revisit 4 | Grace, be nice to the slime. Then beat it. Those are the two rules. | fine | keep |
| revisit 5 | Tom, if they come back faster than me, we need to talk. | fine | keep |
| revisit 6 | Justin says the hallway light is almost done. It has been almost done since June. | fine | keep |
| revisit 7 | Did Boppy give you that cap? Do not let him near the pond. | fine | keep |
| new revisit 8 | One of my kids read a whole page out loud today. First time. I cried in the supply closet. | the job, shown not told |
| new revisit 9 | Rose. Big feelings are allowed. Throwing Lamby is not. Come here. | redirect in action |
| new revisit 10 | Grace, you do not have to be the best at it. You have to be the one who keeps going. Okay, now be the best at it. | mom + competitor in one breath |

## C. Story decline lines (engine/story.js)

| Chapter | Current | Proposed |
|---|---|---|
| 3 | Thirty spelling tests and a 5K in the morning. Take your mother. She has more energy than all of us. | Twelve reading plans and a 5K in the morning. Take your mother. She has more energy than all of us. |
| 4 | Thirty science fair projects to grade. Thirty. Take Dad fishing. He has been asking since you landed. | Science fair tomorrow and three of my kids are presenting. Take Dad fishing. He has been asking since you landed. |
| 6 | Report cards. Thirty of them. Take the girls. They both have library cards. I made sure. | Progress reports. Every one of them takes an hour, and every one deserves it. Take the girls. They both have library cards. I made sure. |
| 9 | Report cards AND a 10K on Saturday. Go. Take Mom and Dad. Make Dad wear the tie. | keep |

## D. Chapter 5 and 10 scenes (data/scenes.js)

Most of chapter 5 already plays her as patient and competent. Only these move.

| Line | Current | Issue | Proposed |
|---|---|---|---|
| 1376 | Everybody is coming. I have a clipboard, and I am not afraid to use it. | fine | keep |
| 1407 | That one says four. That one says nine. That one is going BACKWARDS. I teach time, Tom. This is personal. | fine | keep |
| 1414 | Girls. That is excellent detective work. Gold stars. Both of you. | perfect | keep |
| 1514 | I have used a thousand pens like you. Put the sheet down. Now. | threat | I am going to count to three, and you are going to put the sheet down. One. |
| 1519 | Up. Everybody. Walk it off. / Tom, when it says SEE ME, step in front of them. Grace, Squishy anyone it circles. And somebody tell it its handwriting is nice. Three times. | good | keep |
| 1542 (narration) | For two hours, Amy talks to thirty parents. Grace hands out cookies... | fine | keep |
| 3366 | ...Every clock in our house stopped at twelve. The microwave. The oven. My running watch. My RUNNING WATCH, Tom. | fine | keep |
| 3406 | I do not wait in lines. I pass people in lines. Politely. Then not politely. | a little mean | I do not wait in lines. I move to the front, and I say thank you to every single person on the way. |
| 3503 | Hey. Nobody cancelled you. You just needed a crowd. Look. You have a crowd. | perfect, this is the new Amy already | keep |

## E. Object text and signs that mention her class

| File:line | Current | Proposed |
|---|---|---|
| maps-le.js:425 | MRS. GREGORI'S SECOND GRADE: OUR HEROES. Thirty crayon drawings. Eleven of them are Amy running. | MRS. GREGORI'S ROOM: OUR HEROES. Twelve crayon drawings. Nine of them are Amy running. |
| maps-le.js:380 (Pruitt) | ...Come to Field Day, Tom. Amy runs the relay. Amy always runs the relay. | keep |
| party.js goldstar item | From Amy's classroom stash. Everyone stands up straighter. | keep |
| party.js a_redpen | Grading at all times. Even monsters. | Circles the good parts first. Even on monsters. |
| party.js juice | From the bottom of Amy's bag. | From the bottom of Amy's bag. There is always one more. |

## F. Move names (optional, phase 2)

These move names fight the new Amy. Renaming touches party.js, abilities.js, battle2-kind, legacy maps and tombos, so it is a separate session.

| Key | Current name | Suggested | Note |
|---|---|---|---|
| red_pen / redpen | Red Pen | Green Pen | SpEd teachers famously grade in green; mechanic unchanged (reveal weakness) |
| pop_quiz / quiz | Pop Quiz | Surprise Quiz | same mechanic, softer |
| detention_ult | Detention Forever | Nobody Leaves | ultimate keeps its "stay in the room" image, loses the punishment |

## Build cost summary

| Scope | Rows | Re-bake needed |
|---|---|---|
| High-priority battle lines | 7 | yes, 7 clips |
| Medium battle lines | 2 | yes |
| New battle lines | 3 | yes, new |
| House lines | 1 change, 3 new | yes |
| Story decline | 3 | depends on whether those are voiced |
| Scenes | 2 | yes, 2 clips |
| Object text | 3 | no (unvoiced) |
| Move renames | 3 | no, but wide code touch |
