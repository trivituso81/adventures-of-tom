# Chapter 7 build, stage 2 done (2026-11-14, build ch7s2, main 91ba047)

Read this together with claude/story-build.md (section 12) and claude/story-ch07.md. It overrides section 12's "Stage 2 is NEXT" and the Live cell in the board: STAGE 2 IS DONE AND PUSHED; STAGE 3 IS NEXT. (story-build.md was not rewritten in this session, to avoid overwriting edits from the other story and build conversations. The next chapter 7 session should fold this into section 12 when it rewrites that file.)

## What stage 2 built (scenes 0 to 2)
- Scene 0, goodbye and flight: engine/travel.js DEPARTURES[7] (new `script` field: TNB's lines, kiss, Nara and the gold ball, TNB's last line, both leave) and ARRIVALS[7] (`pat` and `noWelcome` flags: Tom pats the plane door, "Thank you. Lovely flying.", no built welcome, girls hidden until scene 1). engine/story.js: Sol's first cab line changed. The generic goodbye loop skips TNB and Nara when `d.script` runs.
- Scene 1, SCENES.ch7Arrive (data/scenes.js): girls run in holding the ends of a roll, whisper, chart unrolls, Rose rolls herself up, first goal is Deedee's house. Flag ch7-goal.
- Scene 2, SCENES.ch7Kitchen (new, trigger ch7-kitchen on map grands): six bulbs, chart over the table, pattern said out loud, everybody looks at Tom, row seven in pencil, corner note, meteor, pie crust. The ch7-page trigger now needs ch7-kitchen.
- New engine/scene-props.js: drawn STAND-INS and scene steps `{prop,kind,set}`, `{propTo,field,to,time}`, `{propsClear}`, `{note:[lines],time}`. Kinds: strip (chart), roseroll, ball, bulbs, charttable. Hooked from plateLive in engine/plate.js; cleared in resetStory.
- Tested: reaction_test frames of ch7Arrive and ch7Kitchen (portrait; landscape ran with no errors) and a full trip test (`!startTrip({name:'Sol'},'east')` from ch 6 with party tom, tnb, nara; 13 pages, ends in the Square). smoke FAILS: [].

## Stand-ins to replace once Tom approves the Library pictures
| Stand-in | Library entry |
|---|---|
| chart strip (rolled, unrolled) | ch7-chart-rolled, ch7-chart-unrolled |
| chart over the table, crisp | ch7-chart-table |
| paper note for the corner | ch7-chart-corner |
| Rose rolled up | ch7-rose-poses (rolled up) |
| gold ball | ch6-gold-ball |
| six bulbs | ch7-bulbs-six |
| Tom's door pat (he only faces the door and two thuds play) | ch7-tom-poses |
| Nara drops the ball (a small gold dot and her walk) | ch7-nara-ball |
| the junk drawer (Deedee just stands by the table) | none made |
| the phone photo on the flight (not shown; flight pages only) | ch7-phone-girls is for the flight WEST, ch6-phone-crock for this one (phone photo beat is "all chapters" work) |
Note: ch7-phone-girls was approved in the Library (commit 8635eef) before this session; nothing uses it yet.

## Known rough spots (honest list)
- Landscape was run but its frames were not looked at; look at ch7sqL and ch7kitL first thing in stage 3.
- Deedee and Boppy are placed on tiles beside the dining table; the kitchen has no junk drawer picture.
- Chart in the Square is long (about 10 tiles): at portrait zoom 1 its far end runs under the left edge.
- No Heart-Trace added in the kitchen (only the old grace-text trace in the Square).
- The scene 0 to 2 lines are word for word from story-ch07.md, so queued voice lines should match; unused_voice.py was NOT run this session.

## Stage 3 (next): library scenes 3 to 9
Page and the flash questions, the Stacks hall (ear-covering row, sheet and WET FLOOR sign, grey circle, quiet grey shelf), story time, the three wings with the troublemakers walking up, the door, the Reading Room, the fight, coin close-up, bookmark swap. Remove the long-coat lines, the checkout card and coinFind 5. Page's "a week ago" becomes "Monday night" (CHANGED line in scene 3). Test and push.
Prompt: "Read claude/story-build.md, claude/story-ch07.md and claude/next-addendum-ch7s2.md. Continue the chapter 7 build at stage 3."
Test recipe: cases in /tmp style: {"ch":7,"map":"town","scenes":["ch7Arrive"],"party":["tom","grace","rose"],"start":[24,22,"left"],"unflag":["ch7-goal"]} and the kitchen: map grands, start [8,13,"up"], flags {"ch7-goal":true}, unflag ["ch7-kitchen"]; `LATE=1 FIN=1 ROOT=$PWD python3 tools/reaction_test.py cases.json /tmp/out` (about 3 min per scene pair).
