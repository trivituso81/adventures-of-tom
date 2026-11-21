# Per-chapter arrivals (Tom approved 26 Oct 23:16). BUILT AND LIVE 2026-10-27 (v283, 1793072531-5df0)

Done: engine/travel.js only. ARRIVALS keyed by the chapter the flight lands in (4 to 9); arrivalNow(dir) returns it when STORY.mode is 'full' and ch<STORY.chapter>-done is set (west flights land in even chapters, east in odd). startTrip passes it through flightSteps(dir,talk,arr) to arriveLA(arr) / arriveHome(arr). Chapters 2 and 3 and the demo fall back to the old lines and the long LA toast; later LA landings toast "Welcome back to Los Angeles." The 22 lines below are silent until baked: claude/dialogue-scripts-arrivals.json (dialogue baker shape). chapterJump (chapter-select.js) calls arriveLA()/arriveHome() with no argument, so it keeps the default lines (test tool).

Problem it solved: departures vary by chapter since v269, but arriveLA() and arriveHome() played the same lines every flight.

## Lines (contractions per the 26 Oct rule; straight apostrophes to match travel.js)
| Ch | Arrive | Speaker | Line |
|---|---|---|---|
| 4 | LA | Tom | Downtown LA. Seventy-two and sunny. I didn't have to check. |
| 4 | LA | Tom | Six hours, no fish, and a pepper to find for Boppy. In that order. |
| 5 | Home | Tom | Long Island. Quiet. Thursday is conference night. It won't stay quiet. |
| 5 | Home | Grace | Tata! You're BACK! That's TWO times! |
| 5 | Home | Grace | Mom made you a binder. It has TABS. |
| 5 | Home | Rose | Did you bring the snacks? Tata. The SNACKS. |
| 5 | Home | Tom | TNB packed them. Check my bag. Carefully. He also packed a note. |
| 5 | Home | Rose | I'm checking NOW. |
| 6 | LA | Tom | Downtown LA. Five hours and fifty-one minutes. Amy will want the number. |
| 6 | LA | Tom | ...Is that a squirrel on the cab? That's a squirrel on the cab. |
| 7 | Home | Tom | Long Island. Quiet. Library quiet. That's a different kind. |
| 7 | Home | Grace | Tata! THREE times! The library's still whispering. I SAID so. In a text. |
| 7 | Home | Rose | It said my name. It said ROSE. Then it said shhh. |
| 7 | Home | Tom | Then we go find out what it wants. After a sandwich. |
| 7 | Home | Grace | I'm bringing a flashlight. And a pencil. For notes. |
| 8 | LA | Tom | Downtown LA. It smells like somebody's grill. Everybody's grill. |
| 8 | LA | Tom | TNB says bring an empty stomach and forty bread pans. I've got the stomach. |
| 9 | Home | Tom | Long Island. No moon tonight. Somebody's going to make that my problem. |
| 9 | Home | Grace | Tata! FOUR! I have a chart now. You're on it. |
| 9 | Home | Rose | Deedee has your letter. She hasn't opened it. She's LOOKED at it. A lot. |
| 9 | Home | Tom | A wax seal with a clock on it. I'd look at it a lot too. |
| 9 | Home | Rose | I named the seal Flippers. |

Order within a homecoming: Tom's landing line, TATA!!! run and hug, then the welcome pages as listed. The TATA!!! shout, run, hugStep() and autosave still play every time.
