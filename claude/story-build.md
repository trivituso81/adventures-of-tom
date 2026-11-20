# Story build tracker: the new storyline, chapter by chapter

Started 2026-11-13 13:42 on Tom's instruction. Last rewritten 2026-11-14 17:50 by the chapter 8 writing session (writing parts only: this paragraph, section 2A steps 1 and 2, the board rows for chapters 8 and up, the chapter 8 line under "Changes owed", section 5, the chapter 8 rows in section 6, section 7, section 8 and the chapter 8 column of section 10; the build parts, section 2B, section 9, section 11 and section 12, are untouched). Since then the chapter 7 test session (build ch7t1) changed only the chapter 7 Live cell and section 12. Before that: the chapter 7 build conversation added section 12 and changed the chapter 7 Live cell at 2026-11-14 14:15, the chapter 7 writing session (2026-11-14 14:10), the chapter 6 build conversation added section 11 and changed the chapter 6 Live cell at 2026-11-14 10:58, the chapter 6 writing session (2026-11-14 10:50), the chapter 5 writing session (2026-11-13 18:30) and the chapter 1 assets step. This is the one file every story session reads first and rewrites last. It replaces claude/next-addendum-story1.md, story2.md and story3.md. It does not replace claude/next.md, which belongs to the build sessions and holds the test commands and the push procedure.

Tom's prompt for every story session: "Read claude/story-build.md and follow it."

THE VOICE CHANGED ON 2026-11-14 (Tom 16:19 to 17:10, chapter 8). The writing of chapters 1 to 7 had become "sickeningly heartwarming ... like it's meant for like a children's show". Chapter 8 was rejected, restarted from a blank slate, and locked in a wittier, more adult voice. From chapter 9 on, claude/story-ch08.md is the voice model, and the older chapters are not. Read the top of section 5 before writing anything.

WRITING AND BUILDING NOW RUN IN PARALLEL (Tom 2026-11-13 17:25: "Ignore the hold on chapter 5: I am writing and building in parallel now"). One conversation builds the locked chapters in order (section 2B, the Live column). A separate conversation writes the next chapter (section 2A, the Script column). Each one re-reads this file right before saving it and changes only its own parts: a writing session touches the Script column and the writing parts listed above, a build session touches the Live column, section 2B and section 9. Tom's prompt for a writing session: "Read claude/story-build.md. Do a writing session (section 2A) for chapter N, starting with one short beat for my yes."

CHAPTER 6 IS BUILT IN ITS OWN CONVERSATION, IN STAGES (Tom 2026-11-14 10:38, when he locked chapter 6: "what I need is two different prompts that I'm gonna execute in parallel. One of them is to implement everything that we need for chapter 6, which I know needs to happen in stages, and then the next is for you to write chapter 7"). This is on top of the chapter 1 build conversation, which carries on as before. Tom's prompt for it: "Read claude/story-build.md and claude/story-ch06.md. Start the chapter 6 build (section 2B), in the stages listed in the tracker, beginning with the assets-first step." The stages, each one finished and reported to Tom before the next starts:
1. ASSETS FIRST, as written below: every new picture in the chapter 6 rows of section 6 into the art library (group "Chapter 6"), checking the built art first, and every NEW and CHANGED line of claude/story-ch06.md into the voice library with a written direction. Stop and tell Tom where both are and how many of each.
2. The reusable block-breaking work, which chapter 6 needs first and every later chapter reuses: coin roll and click, coin close-up, gold cracks, the block falling apart, the color ring spreading across the map, the boss and monsters shrinking back, encounters switched off in a freed area. Show it to Tom on the picnic table before building the rest.
3. Chapter 6 scenes 0 to 15: dialogue, narration turned into actions, the park scene at the picnic tables, the coin on the jar, THE DISCOVERY, the gold ball and the crock. Test and push. Tom plays it.
4. The return, scenes 16 to 18: the lemon, the hat, and the call home with the three Long Island scenes. These scenes show the blocks of chapters 1 to 5. Those chapters are not built in their new form yet, so this stage uses each chapter's block, coin and grey-patch art from that chapter's rows in section 6 (chapter 1's are already in the art library, section 9) and says plainly which of them are stand-ins. It does not rebuild chapters 1 to 5.
A chapter 6 build session touches only the chapter 6 Live cell, and adds its own section (section 11, "Chapter 6 assets and build") at the end of this file. It does not edit section 9.

FOR THE BUILD CONVERSATION, the next step is unchanged: THE NEXT BUILD SESSION IS A BUILD-AND-PLAY SESSION. See section 1 (the 17:05 change) and section 2B. Chapter 1 is at the assets stage (section 9): the art and clips are in the libraries, waiting for Tom to generate, approve and record them and send the clips back. Then the chapter 1 build (section 2B) starts with the real art and voices.

ASSETS FIRST (Tom 17:08, this beats the stand-in art wording in section 2B): before building a chapter, the session (1) adds every new image that chapter needs to the art library as ready-to-use prompts, following the repo's art docs (docs/PROP_ART.md, docs/CHARACTER_PIPELINE.md, docs/ENEMY_SHEETS.md, docs/AREA_PAINTINGS.md) and the chapter's rows in section 6, checking the built art first so nothing is asked for twice, and (2) adds every NEW and CHANGED line of that chapter to the voice library as clips to record (claude/voice-sheet.md and the repo's voice baker procedure), keeping Tom's baker annotations. Then it stops and tells Tom in a few plain sentences where to find both and how many of each there are. Tom generates and approves the art and records the clips, and returns them to that same conversation. Only then does it build the chapter with the real art and voices, test it, and push it. Use a stand-in only for something Tom has not returned, and say which.

## 1. The process Tom asked for

His words at 13:42, tidied:
1. Write out the new storyline one chapter at a time, in a new conversation per chapter, in order from chapter 1 to chapter 20.
2. Each chapter gets the dialogue, what happens (the actions), and the emotions of the key moments.
3. Tom reviews the chapter, asks for changes, and then locks it. Only then does the next chapter start.
4. When all 20 are locked, Claude rebuilds the game to match. Tom generates the new art at the same time.
5. Nothing is built in the game before step 4.

CHANGED BY TOM 2026-11-13 17:05, when he locked chapter 4: "what I would like to do is start playing these chapters basically one by one to give feedback before we start rewriting future chapters because the humor and dialog really only are going to make sense once they're in live action."

So steps 4 and 5 above are replaced by this:
- Writing stops at chapter 4. Chapter 5 is not written until Tom has played the locked chapters and given feedback. (SUPERSEDED 17:25, see below.)
- The four locked chapters go into the live game one at a time, in order (1, 2, 3, 4). One chapter per session. Tom plays each on his phone and gives feedback before the next one is built.
- What he says while playing is the real test of the voice. It can reopen a locked chapter. Fix the game and the chapter file together, and turn every general note into a rule in section 5 so chapters 5 to 20 are written right the first time.
- After chapter 4 has been played and settled, ask Tom one thing: carry on writing chapter 5, or keep the write-then-play rhythm chapter by chapter. Lead: write one, build one, play one.

CHANGED BY TOM 2026-11-13 17:25: writing and building run in parallel, in separate conversations. The hold on chapter 5 is lifted. Chapter 5 was written and locked the same evening (18:14). Writing carries on with chapter 6 whenever Tom opens a writing session. Feedback from playing can still reopen any locked chapter, including ones written ahead.

CHANGED BY TOM 2026-11-14 10:38: chapter 6 was locked, and Tom asked for it to be built in stages in its own conversation while chapter 7 is written (see the note at the top). Chapters no longer have to be built strictly in order.

CHANGED BY TOM 2026-11-14 17:01: when a chapter's dialogue is not working, he would sooner start it over in a fresh conversation, from a brief that holds no dialogue at all, than keep revising. Chapter 8 was done that way (claude/story-ch08-brief.md) and it worked. Use that file as the pattern for a brief if it is needed again.

A new conversation per chapter is the default. If Tom asks to keep going in the same conversation, keep going (he did for chapters 1 to 2 and for 2 to 3).

## 2. What one session does

### 2A. A writing session (a chapter marked NEXT or DRAFT in the Script column)

1. Read this file, then claude/story-thread.md (the approved story, canon), then claude/story-ch08.md in full. CHAPTER 8 IS THE VOICE MODEL from 2026-11-14 on (see the top of section 5). Do NOT read claude/story-ch01.md to story-ch07.md for voice: their dialogue is sweeter than Tom now wants, and reading it pulls the writing back there (that is what sank the first chapter 8 draft). The facts you need from them are in section 7. The only earlier scenes worth opening are for mechanics, not voice: chapter 6 scenes 14 to 18 (what the player watches when a block breaks) and chapter 7 scenes 9 and 10 (a boss that is told what the coin does, and a block opened on purpose). Never open claude/story-ch08-rejected.md or claude/story-ch08-handoff.md. (claude/next-addendum-dialogue4.md has the first approved sample scene, with Amy. Read it when Amy is in the chapter, for who she is, not for tone.)
2. Find the one chapter marked NEXT or DRAFT in the board below. Find out what is built for it today, for the STORY FACTS ONLY (places, maps, fights, puzzles, who is there). Do not carry built lines over: every line is written new unless Tom says otherwise, and he is fine re-recording (2026-11-14).
   - THE BUILT TEXT IS IN THE REPO, NOT IN THE PROJECT JSON. Clone trivituso81/adventures-of-tom (add_repo with read access, `git clone --depth 1`; if add_repo is refused, a plain read-only `git clone --depth 1 https://github.com/trivituso81/adventures-of-tom.git` worked on 2026-11-13 and 2026-11-14) and read the chapter's scenes in data/scenes.js (SCENES.chNName, one array per scene, in story order). Goodbye, flight and landing lines are in engine/travel.js (DEPARTURES and ARRIVALS, keyed by chapter). The cab driver's "chapter is over" lines are in engine/story.js (search the flag chN-sal or chN-sol). Object and NPC text is in data/maps-le.js, and boss fight messages are in engine/battle2.js and data/battle2-data.js. The claude/dialogue-scripts-chN.json files are stale (most were deleted on 2026-11-14). Check any line you quote against the repo.
   - Chapters 11 to 20: also the repo's docs/CNN-DONE.md and the "Built today" column of claude/part2-remap.md. Ignore that file's "New version" column.
   - claude/canon-addendum.md "Characters and tone" for running gags and voice rules, plus the waiting lines in section 8 of this file, which are canon too.
3. FIRST write one short beat (8 to 14 lines, the first scene with the chapter's main pair) and show Tom only that. When he says yes, write the whole chapter in that voice and save it as claude/story-chNN.md with the status DRAFT.
4. Show Tom the chapter in chat. CHANGED BY TOM 2026-11-13 18:02: he cannot read every line of a whole chapter. Do NOT paste the full dialogue. Show him, in this order: (a) one short paragraph of what happens; (b) a humor assessment: your own score, a table of the techniques used with one example line each and how well each works, where it falls short, and what you would do to improve it; (c) the calls you made and the real-life details you invented; (d) a short numbered list of the places where you need his direction on tone or things to avoid. The full script is in the chapter file for when he wants it. Mark any lines you do quote with a star (★) for new and a pencil (✎) for changed.
5. Revise one objection at a time. Save each revision to the same file. In chat, show only the lines that changed.
6. When Tom says it is locked: set the file's status to LOCKED with the date and time, update the board, add the chapter's canon lines to section 8 (or straight into claude/canon-addendum.md if you are rewriting that file), and add the chapter's rows to the lists in section 6. Also add the chapter's column to the joke tally in section 10 (Tom 18:23).
7. Rewrite this file (re-read it first and merge, changing only the writing parts). End by telling Tom in two lines what the next session will do, and the prompt above.

If Tom changes something that affects an already locked chapter, do not edit that chapter silently. Add a line under "Changes owed to locked chapters" in section 4 and tell him.

### 2B. A build-and-play session (a chapter marked NEXT in the Live column). New 17:05.

The goal is that Tom can play one locked chapter start to finish on his phone and hear the new dialogue in place. It is a playable draft for judging humor and flow, not the final rebuild.

1. Read this file and the one chapter file (claude/story-chNN.md). Then read claude/next.md for the test commands and the push procedure, and the repo's CLAUDE.md. Get the repo with add_repo (access push) and `git clone --depth 1`. Other sessions push often: fetch and rebase before pushing.
2. Build exactly what the chapter file says, in this order of importance:
   - Every line of dialogue: NEW lines added, CHANGED lines replaced, REMOVED lines gone. A recorded voice clip must never play under changed words: changed and new lines use speech synthesis until Tom records them. Never edit a baked clip.
   - Every narration box in the chapter replaced by the action it describes, using sprites and movement that already exist (walk, face, hop, bark, hearts, puddle). Where a new animation frame is needed and does not exist yet, show the action with existing frames and a short pause. Do not put the narration box back.
   - The new scenes (the orange block, the grey patch, the flashbulb, the coin) with the art from the art library once Tom has approved it (section 9 lists it). Use a stand-in only for a picture Tom has not returned, and say which. Stand-ins are made in code or from existing props, painted-style and clearly readable on a phone.
   - Removed story pieces (the man in the long coat, old coin finds, the sundial puzzle and so on) taken out so nothing contradicts the new lines.
3. Do not build the "all chapters" engine work in section 6 yet (block-breaking, shrink-back, the return after chapter 6) unless the chapter being built needs it. Chapters 1 to 4 do not.
4. Test the chapter start to finish from the chapter-select jump, in portrait and landscape, with the commands in claude/next.md. Look at the frames of every new scene. Only then push to main, bump the `?v=` tags and ART_V if art or scripts changed, and add a docs/CHANGES.md entry. (A whole-chapter driver exists for chapter 7: tools/ch7_test.py. Copy it for other chapters.)
5. Tell Tom in a few plain sentences: the chapter is live, how to jump to it, which things are stand-in art, and which lines are in a computer voice. Ask him to play it and say what is not funny, not clear or not him.
6. Take his feedback one objection at a time. Fix the game and the chapter file together (the file stays the record of the script). Add each general lesson to section 5.
7. When he is happy, mark the chapter PLAYED in the Live column, set the next chapter to NEXT, and rewrite this file. Add what the next session needs to claude/next.md too if a build session would otherwise undo this work (re-read it and merge).

## 3. Format of a chapter file (claude/story-chNN.md)

- Header: chapter number and title, status (DRAFT or LOCKED with date), one paragraph in plain words on what happens and what the family knows by the end.
- Then each scene in order:
  - Where and who is there.
  - What happens: the actions, in order, as things the player sees.
  - How people feel: one or two sentences.
  - Dialogue: every story line in full, speaker first. In the file, mark each line KEEP (unchanged from the live game), CHANGED (shows the old line) or NEW. Recorded clips go silent on CHANGED lines until Tom re-records.
  - NO NARRATION LINES (Tom 16:23). Anything the old game told in a narration box (Nara, the kettle, the reeds, the sundial) is written as an action line in square brackets that the player watches. New animation frames are made for these later and go on the art list. If narration held speech, that speech becomes a spoken line.
- Fights: who the monsters and the boss are, why they woke up, what the boss wants, how kindness wins it over, where the coin is, and the boss's lines.
- The block: what is frozen, where the grey patch and the flashbulb are, and how it gets unfrozen.
- Not written out in full: NPC small talk and battle barks, unless the new story changes them. List those as "also changes".
- End of file: what changes from the built chapter (with line counts by voice), new art needed, new engine work needed.

No em dashes anywhere. Dialogue uses contractions. The family never says "amber", they say "orange block" or their own words (Rose: "marble", "gumball machine").

## 4. Board

| Ch | File | Script | Live in the game |
|---|---|---|---|
| 1 | claude/story-ch01.md | LOCKED 2026-11-13 14:27 | NEXT to build. Assets added 2026-11-13 (section 9). Waiting on Tom's art and clips |
| 2 | claude/story-ch02.md | LOCKED 2026-11-13 16:25 (revision 3) | waits for chapter 1 |
| 3 | claude/story-ch03.md | LOCKED 2026-11-13 16:40 (revision 1) | waits |
| 4 | claude/story-ch04.md | LOCKED 2026-11-13 17:05 (revision 1) | waits |
| 5 | claude/story-ch05.md | LOCKED 2026-11-13 18:14 (revision 3) | waits |
| 6 | claude/story-ch06.md | LOCKED 2026-11-14 10:38 (no changes during review) | Its own build conversation, in four stages (note at the top). Stage 1 (assets first) DONE and pushed 2026-11-14 10:58 as ch6assets1: 33 art entries and 179 voice lines queued (section 11). Waiting on Tom's art and clips. Stage 2 is NEXT |
| 7 | claude/story-ch07.md | LOCKED 2026-11-14 13:43 (no changes during review) | BUILT AND TESTED: all four stages pushed (ch7assets1, ch7s2, ch7s3, ch7s4), then played start to finish from the chapter-select jump in portrait and landscape and fixed (ch7t1, 2026-11-14, section 12). READY FOR TOM TO PLAY. Stand-in art and computer voices until his art and clips come back |
| 8 | claude/story-ch08.md | LOCKED 2026-11-14 17:40 (blank-slate rewrite from claude/story-ch08-brief.md, 178 lines, all new; two lines changed in review). The first draft is in claude/story-ch08-rejected.md and must not be read | Not started. Its own build conversation, in stages, assets first. The chapter was written without reading the built text, so every built chapter 8 story line comes out |
| 9 | claude/story-ch09.md | NEXT to write (leads in section 7) | |
| 10 to 20 | claude/story-chNN.md | not started | |

After 20: decide with Tom whether the bonus chapter Nine Scoops needs any change (lead: none, it stands alone).

Changes owed to locked chapters:
- Chapter 1, 2026-11-13 14:40, DONE and Tom told: kept lines corrected to the live game's wording.
- Chapter 1, 2026-11-13 16:23 and 16:39: checked against the no-narration rule and the Deary and hubby rule. It has no narration lines and neither word. Nothing owed.
- Chapter 1 was locked before the voice rules of 16:13 to 16:39 existed (Tom never the judge, puns, Deedee sharp, Boppy fun loving). Tom has not asked for a change. When building it, do not rewrite it, but tell Tom this once so he listens for it while playing.
- Chapters 1 to 5, 2026-11-14: nothing owed by chapter 6. It reuses their blocks, coins and lines ("I paid for those.", "Put the table back.", "Gold is for keeping") without changing them. One check for the chapter 1 build: chapter 6 has Boppy say "Gold is for keeping. Fish are for jumping." If "Gold is for keeping" is not in the locked chapter 1 after all, tell the next writing session.
- Chapters 1 to 6, 2026-11-14: nothing owed by chapter 7. It uses their sizes (plum, grapefruit, watermelon, beach ball, washing machine, bathtub), their places and "It's a gumball machine" without changing them.
- Chapters 1 to 7, 2026-11-14 17:40, OWED AND NOT YET DECIDED BY TOM: the voice changed with chapter 8 (less heartwarming, more adult wit, nobody counts puns). Chapters 5 and 6 have people counting puns out loud (Amy in 5, "Babe! That's seven!" in 6), and all seven are in the sweeter voice. Tom has not asked for them to be rewritten. Do not edit them. When he plays one and says it is too sweet, that is the moment to offer the blank-slate method for that chapter (section 1, the 17:01 change). The chapter 8 writing session told Tom this at lock.

## 5. How to talk to Tom about story, and how to write the dialogue

READ THIS FIRST: THE VOICE TOM WANTS NOW (2026-11-14, chapter 8). Everything lower in this section that is dated before 2026-11-14 16:19 describes what he approved at the time, and the facts about the people still hold. The TONE of those chapters is no longer the target. His words:
- 16:19: "I just don't want them to be keeping track of the puns anymore. I think it's getting played out."
- 16:41: "this is like too heartwarming. Everything in here is getting sickeningly heartwarming and like it's meant for like a children's show. Where's the jabs? Where's the humor? Where's the adult like smirking like wink wink nudge nudge"
- 2026-11-12 and 13, on the whole game: it reads like an elementary school children's TV program. He wants it more sophisticated and a little edgy, really funny and especially witty (a chuckle or a smirk, not an eye-roll), still readable by a child with nothing inappropriate. The funniness comes from the characters' personalities. Humor does not need incompetence or negative family banter.
- 17:01: when insults and winks were bolted onto the sweet draft, he rejected that too and asked for a blank-slate rewrite.
- 17:10, on the new opening beat: "Yes! That was great. and it made me laugh, and it was just well written"

What the new voice is, as rules:
- Sophisticated, witty, a little edgy. Adults should smirk. A child can still read all of it.
- NOT HEARTWARMING BY DEFAULT. At most one sincere moment in a chapter, short and earned. No moral, no lesson, no speech. In chapter 8 it is two lines (Mr. Washington recognizes his father's bread).
- Friendly shots between adults who like each other. Never cruel, nobody humiliated.
- NOBODY STATES HOW THEY FEEL ABOUT SOMEONE. It shows in what they do. (The opening beat failed twice on one line: first TNB complained about Bernadette out loud, "I can't stand it", then he flatly agreed with her. What worked: he says "Great note, Bernadette," does not move the bowls, and opens a soda while she waits.)
- NUANCE (Tom 17:09: "You've gone to two different extremes here. Isn't there something more nuanced? Your writing overall needs to be more nuanced."). When a line can be read as either a complaint or agreement, it is the wrong line. Find the thing the real person would do.
- EVERY JOKE SAYS WHAT IT MEANS. Tom did not understand "That's the worst thing about her." If a line needs working out, cut it or say it plainly.
- TOM ADDS TO TNB'S BITS AND NEVER SHUTS THEM DOWN. "Bernadette doesn't have a basement" read as dismissive. "She doesn't have a basement. She has that shed with the two padlocks." joins in.
- TNB IS EASY-GOING, NOT A COMPLAINER. Bernadette's rudeness slides off him. Tom is the one she gets to, and only mildly. TNB has a little bit of a stoner vibe that is never said out loud. Writing him as just a nice guy misses him.
- Wit comes from who is talking. Not from invented gag devices that need explaining, not from a layer of insults added on top, not from lines built to sound wise.
- Puns are allowed but must not carry a chapter, and NOBODY COUNTS THEM anymore. Chapter 8 has one, and the joke is that it is literally true (a wet blanket).
- New territory that worked in chapter 8: neighborhood politics (a notice taped to a rosebush that "still applies" after a day inside a block, a seating diagram everyone ignored, "The Watch would like to thank the Watch"), jokes a grown-up catches and a child does not (the Draft talks like a landlord, "tell Bernadette it's a tasting menu", "No comment." "That's a quote."), a grump who explains that she is not being nice ("I'm not being friendly. She keeps records, and I respect records."), and a monster with a working man's grievance (the oven thinks the coin is his pension).
- Bernadette may make an exception for Grace (Tom 17:38), and she says out loud why, so nobody mistakes it for warmth.

How chapter 8 was written, because it is the method that worked: a fresh conversation read only a brief with no dialogue in it (claude/story-ch08-brief.md: Tom's words, the rules, who the people are, the story points, the joke tally) and the story thread. It read no earlier script and no built line. One beat first, fixed three times on a single exchange with Tom, then the whole chapter. The writer scored it 7 out of 10 and named the weak spots (the plane scene has no joke, the Damp Blanket is the thinnest of the three troublemakers, the block-opening scene is mostly functional, Rose has three lines). Tom locked it with two line changes.

Talking to Tom:
- Plain full sentences, as a story in order. Shorthand tables and short whole-arc summaries both failed.
- He reads on his phone. He CANNOT read every line of a chapter (Tom 18:02). Give him a short summary, a humor assessment, the calls and inventions, and your questions (section 2A step 4). When a revision changes lines, show only those lines, speaker first, with ★ and ✎ marks.
- He liked the humor assessment format: a score, the techniques with examples, your own honest weak spots, and a few direct questions. Honest self-criticism got faster and better direction from him than a full script did.
- Never use shorthand built up inside a session. Say "frozen inside a hard orange block" and "unfreeze".
- He rejects anything that is an idea and not a thing you can see. For every beat: what does the player watch happen, and how would a child say it.
- He has not played Part 2. Say what each built thing is, in plain words.
- Do not give him lists of open items or options. Make the call, say it is your recommendation, and say whether he needs to do anything.
- He builds on a proposal one objection at a time. Answer that objection, fix what it breaks, restate.
- If he pushes back on something that is not in the approved story, check story-thread.md before defending it.
- If a question can be answered from the Project docs, look it up and do not ask him (Tom 17:38, on whether the Moon Club is still in the story: "you have access to the full story, so you should be able to check that").
- He likes big, shocking turns in the Final Fantasy tradition. When a chapter has one, play it at full size.
- He corrects from real life: what his family actually says and would never say. Take these as canon at once and look for where else they apply. Tell him which real-life details you invented so he can correct them.
- WHEN HE TELLS YOU A REAL FAMILY JOKE, USE ONLY WHAT HE SAID. Do not fill in the rest (18:10 and 18:13: the Christmas tree joke was written wrong twice because details were invented around it). If a piece is missing, write the line without it.
- He picks who says a line by character. The youngest sees it first.
- "Cozy Rosie" only when someone is talking to Rose. In the third person she is Rose.
- He judges humor by playing it (17:05). Reading a script gets a "pretty happy". The real yes or no comes on the phone.

What went wrong before (chapter 2 revisions 1 and 2, both rejected): Tom was written as the straight man who repeats back what someone did in disbelief, which reads as condescending. That voice is baked into the cast table ("Dry, calm") and into the live game's Tom lines, so any session that reads the built lines first drifts back to it. The jokes were understatement with no punchline. The speech was clipped. Both drafts were whole chapters shown in a voice he had not approved.

What went wrong in the first chapter 8 draft (rejected 2026-11-14, the writer's own analysis): invented gag devices that took long lines to explain; a tender beat added to almost every scene, so the whole chapter read sweet; lines written to sound wise that mean nothing when read literally (Tom on a boss line built like a slogan: "doesn't make sense. That's not a thing"); when told it was too sweet, the fix was bolted on (a character insulting people, one wink joke) and not written from the people; and puns carried too much of the load. Three opening beats in a row were "not funny", partly because they tried to reuse built lines.

THE HISTORY BELOW (chapters 2 to 7) is kept for the facts about the people and for what Tom has said about them. Do not imitate its model lines for tone.

What worked at the time (chapters 2 to 7, locked; the beats of 3, 4, 5, 6 and 7 approved first time): one short beat first, approved, then the chapter. Model lines: Tom correcting "three thousand miles" to "two thousand four hundred and seventy-five" (and Deedee's "Tom. Not now."); "I'd have flown here for zero miles"; TNB's "it's pretty grape"; the pottery-wheel bread bowl; Tom wanting to be hit with the towel; "They fed me twice." "Twice! You must be starving!"; the Whisker Perch getting bigger every time Boppy tells it; "Then it won't hurt to hold the net."; "I paid for those teeth."; running jokes that pay off at the end of the chapter.

From chapter 4 (Tom on the beat, 16:49: "its good but it can be funnier with a few puns in there"): TNB gets several real puns per chapter ("That's a flying fish!", "hats off to whoever did this. No, really. I can't get the hat off.", "I'm on a hot steam streak", "I always keep one under my hat"). One prop Tom is thrilled by can run through a whole chapter and pay off at the end (the laminated VISITOR lanyard, Nara's STUNT DOUBLE badge, "I have a lanyard!", "Could you hold my lanyard?", "I have TWO lanyards!"). Tom confirmed he would be excited about a lanyard. TNB saying Tom's number right ("He said the right number!") is the loving version of the miles joke. (SUPERSEDED IN PART 2026-11-14: puns are no longer wanted in number, see the top of this section.)

From chapter 5 (Tom on the beat, 17:31: "this is actually wonderful. This might've been your best job yet, because of the very reasons that you gave"): what he liked was the binder as the running prop ("It has TABS!", "Tab four says 'Ask Tom.' I wrote it in pen."), Tom's judging line removed, and the reasons for each call stated in a short table. Model lines for Tom and Amy: "You can't call it from California!"; "Was that a pun? Did TNB teach you that?" "I'm filling in for him while he's in Los Angeles."; Amy counting Tom's puns ("Six. I'm telling TNB." "He'll be so proud."); "Mom calls me her favorite son every single time I walk in the door!" "That's because you're her ONLY son, Tom."

From chapter 6 (Tom on the beat, 2026-11-14 10:28: "Yes, it's really funny. I like it." On the whole chapter, 10:38: "I'm fine with every decision you made."): the beat that worked was Tom and TNB joking with each other in the middle of a crisis about something they both love. Model lines: "Which song did you sing him?" "'I Want to Bake Free.'" "And now he HAS!"; "It isn't breaking and entering. It's baking and entering."; "Don't make me laugh. This is all very jarring." "Babe! That's seven!"; the Twig Spy giving away the name of the operation; Tom apologizing to the boss for lying to a squirrel; the boss shrinking in the middle of a speech ("Squeak."); "And THAT is why you put the table back."; "Gold is for keeping. Fish are for jumping." The writer scored it 7 out of 10 and told Tom the weak spots (a middle made mostly of built lines, five unfreezing beats in a row, a dozen puns). He accepted it as written and will judge it by playing. He did not answer the four tone questions one by one (Tom watching the Long Island blocks open on a phone; the boss losing its voice; the crock; Rose giving up her treasure quickly): treat all four as approved and listen for them when he plays.

From chapter 7 (Tom on the beat, 2026-11-14 11:13: "Yes, good job. Make sure to really persist this humor and dialog and wittiness and character personalities. Don't just lightly do it like really do the same good job that you've done in this excerpt." On the whole chapter, 13:43: "everything is fine, let's proceed"): the beat that worked was a book telling a true and harmless secret about Tom (he thanks the airplane), Tom being proud of it, Grace correcting him ("Tata, that's not how airplanes work. They can't hear you."), and Rose topping it ("I say thank you to the bathtub." "See? Rose gets it."). What that beat does, and every later chapter should do: every person in the scene gets a line that only that person would say, in three or four lines. Other model lines: "Your crisp is under California, Boppy. Don't move. I'm presenting."; "The star means 'Boppy says it was bigger.' It's in the key."; "It's not me! I have boarding passes!"; "That's not eating. That's a tray."; "I saw that." "The books didn't."; "THIS IS GRACE'S PAGE. DO NOT MOVE IT. THIS MEANS YOU, ROSE."; and the payoff of the opening joke at the saddest moment ("Thank you, sir." "Tata, he can't hear you anymore." "Neither can the airplane."). HIS STANDING INSTRUCTION FROM THIS CHAPTER: the whole chapter must be as funny and as full of personality as the beat, not a lighter version of it. Check each scene against the beat before showing him the chapter. The writer scored chapter 7 at 8 out of 10 and told Tom the weak spots (a long kitchen scene that carries explaining, three book fights made mostly of built lines, four conditions that run long, TNB only in the goodbye). He accepted it as written. He did not answer the three tone questions one by one (the family briefly suspecting Tom; Deedee's pie crust secret; the book choosing to go quiet): treat all three as approved and listen for them when he plays.

RULES:
- TOM IS NEVER THE JUDGE. He does not repeat back what someone did, roll his eyes, or act annoyed at family or TNB. When someone does something odd, Tom is delighted, joins in, tops it, or is the one who looks silly.
- THE JOKE IS ON TOM'S OWN OBSESSIONS: Delta SkyMiles and Delta One, exact numbers, rules and alarms, being early, badges and lanyards, binders with tabs, his sourdough starter Bready Mercury, and being polite to things that cannot hear him ("Excuse me, Mr. Sock.", thanking the airplane). Under it all he is afraid of missing things on whichever coast he is not on.
- TOM CAN MAKE PUNS HIMSELF (Tom 18:07). NOBODY COUNTS PUNS (Tom 2026-11-14 16:19).
- TNB: super chill, go with the flow, sweet drinks (grape soda), pottery, horror movies, trains and buses and the Metro, wardrobe work, fixes things. He believes Tom at once. He is rattled only by the orange blocks. He does not complain about people.
- Tom and TNB: never a joke where one implies the other matters less than something else, or is unreliable. They do not say "I love you".
- THE ONE PERSON TOM AND TNB ARE BOTH A LITTLE ANNOYED BY IS BERNADETTE, and it shows in what they do, never in a complaint.
- BERNADETTE: Neighborhood Watch captain for nineteen years. Bossy, short-fused, takes everything personally, never thanked and never lets it go. Never uses names: Tom is "3468", TNB is "the Other Tom", Nara is "the dog", Grace is "the niece". Usually right. Rude, never cruel.
- TOM AND AMY (Tom 18:07): they compete only lightly and occasionally, not constantly. They like to chat about reality shows and musicals. Amy only drinks iced coffee. Amy's loud singing is fair game. Their real running joke: the family Christmas tree has an ornament with Tom's picture and one with Amy's, and the picture at the front belongs to whoever they joke is Mom's favorite that year (no turns). A reference to how they treated Halloween candy as kids is fine.
- DEEDEE (Tom 16:31): loving and kind, and also sharp, direct and no nonsense. She gives orders, makes rules and feeds people. She calls Boppy "hubby" once in a while.
- BOPPY (Tom 16:31): fun loving, a joker, thrilled by monsters, proud of his fish and his gold teeth. He calls Deedee "Deary" once in a while, never "Dee". Nobody doubts his health.
- GRACE (from chapter 7): bright and bossy, and funny because she is right. She presents, grades herself ("I'm giving myself half a point"), writes in pencil until she is proved right and then goes over it in pen, keeps a key for her chart, and loves rules and conditions.
- ROSE (from chapter 7): loud, has no secrets because she tells everybody everything, and takes every chance to ride, jump on or shout at something.
- USE WHAT TOM TELLS YOU ABOUT REAL PEOPLE, and when he names a joke he can see, write that joke.
- A JOKE NEEDS A PUNCHLINE A CHILD COULD REPEAT, OR A TURN AN ADULT SMIRKS AT. No "vibe" lines, no line whose point is that it is odd, no line that only sounds clever.
- A KID SAYING SOMETHING PLAINLY IS NOT A JOKE BY ITSELF (Tom 18:07: "that wasn't funny"). Sweet kid lines ("I saved you the hole", "Moss needs that shoe") were cut. A kid line needs a real punchline or a sight gag (Rose poking a gummy worm through the gap in her teeth; "Now there are TWO of them").
- QUIET SCENES ARE ALLOWED WHEN THE STORY NEEDS THEM (Tom 18:07 agreed): Clara and her dad are played straight, with no joke.
- CLARITY AND SHOCK FIRST. Someone says plainly what they see and is shocked. The joke comes after.
- TALK LIKE PEOPLE. Full sentences. No clipped fragments, no made-up shorthand, no "got her stuck". Read every line aloud: would it mean anything said to a real person?
- NO REPEATED SENTENCE SHAPE. Never the pair "He didn't X. He always X." more than once in a chapter.
- EVERY LINE FOLLOWS FROM WHAT THE PLAYER JUST SAW. If a line reacts to something, that thing is shown first. This applies to built lines too.
- KEEP SCENES SHORT. The player loses interest when dialogue goes on and on.
- REAL PLACES MUST SOUND REAL TO A LOCAL. Tom did not recognize "the A Line" or "the B Line". "The Metro" is fine.
- EVERY SCENE NEEDS COMEDY OR INTRIGUE, not just information.
- NOBODY HAS A NAME FOR THE MONSTERS. "Friction Sprites" and "Sprite" are gone from story lines. People say "grumpy things", "those things", or what the thing is.
- Built lines are not kept by default from chapter 8 on. Every line is written new unless Tom says otherwise. He is fine re-recording. Tell him how many lines need recording.
- WHEN A BLOCK BREAKS (from chapter 6 on): nobody speaks from the click until the color has finished coming back. The player watches it. The boss and the monsters turn back into ordinary things and cannot talk afterwards. One small sad line about that is allowed, never a speech.
- THE BOSS IS TOLD (from chapter 7 on): once the family knows what a coin does, they do not take it from a boss that does not know. Tom makes sure it is told. How the boss answers must be different in every chapter. Used so far: cut off in the middle of a speech by accident (6), chose it calmly with conditions (7), insulted to learn the coin is not his pension and decides to finish on a last shift (8).
- STOP-LOSS: two rejections for the same reason means stop, analyze, and change the method. Do not send a third variant.

## 6. Lists that grow as chapters lock (the input to the rebuild and to Tom's art work)

### New art needed
| Ch | What | Kind |
|---|---|---|
| all | Gold coin stamped with a picture, one design per block | prop |
| all | Orange block with a round dent, burnt flashbulb, grey patch | prop |
| all | Tom's phone showing a photo of Grace and Rose, and one showing TNB (every flight) | prop |
| late | Julian Vance, Clara | character (heights needed from Tom before any prompt). NOTE: both now appear in chapter 5, see the chapter 5 rows |
| 13, 14 | Boppy as the gold knight: helmet shut, helmet open, armor cracking. Check the built armor art first. | character |
| 1 | Kitchen door frame with pencil height marks, close-up | prop (section 9: ch1-doorframe) |
| 1 | Orange block, plum-sized, dragonfly inside, round dent; hand-sized grey grass patch | prop (section 9: ch1-orange-block, ch1-grey-patch) |
| 1 | Boppy's folding chair at the pond | ALREADY BUILT (art/props/boppy/folding_chair.webp), nothing to make |
| 1 | Gold coin with dragonfly stamp, close-up | prop (section 9: ch1-coin) |
| 1 | The Big One with coin and lure in its lip (check the built sheet first); the Big One as a normal fish | enemy (section 9: ch1-bigone-lure-coin, ch1-bigone-normal) |
| 1 | Boppy grinning with gold fillings showing (reused in 3, 6, 13 and 14) | character (section 9: ch1-boppy-grin) |
| 2 | Small lemon tree, all grey, with the grey circle of dirt | prop or painted into the Griffith Park plate |
| 2 | Orange block, grapefruit-sized, lemon inside, round dent, hanging on the branch | prop |
| 2 | Gold coin with lemon stamp, close-up | prop |
| 2 | A perfectly round sourdough loaf, whole and with the top torn off (the bread bowl) | prop |
| 2 | Two cans of grape soda | prop |
| 2 | The Big Shake with one pipe rattling, and the coin shooting out (check the built sheet first); the hill as a normal hill | enemy, area |
| 2 | Nara carrying a coin in her mouth (reused in chapter 6) | character |
| 2 | Nara action frames, replacing narration: sit and wiggle, paw slap, lick, whine at window, sneeze, press against leg, fur up and guarding, dig and drop, bark and look back, catch a coin, lean and puddle | character |
| 2 | Miss Odette holding a gumbo pot, Doña Carmen holding a towel, both on the street (check the built sheets first) | character |
| 3 | Sundial Hollow with all color gone: grey reeds, grey sundial, grey water, clean circular edge | area (grey version of the built plate) |
| 3 | Orange block, watermelon-sized, fish in mid-jump inside, round dent, hanging in the air | prop |
| 3 | Gold coin with a jumping fish stamp, close-up | prop |
| 3 | Old Iron-Gill with the coin caught in its mustache (check the built sheet first); the Whisker Perch as a normal fish with whiskers | enemy |
| 3 | Boppy's fishing hat with the gold coin in the hatband; Boppy's pepper jar in his hand and in the fish's mouth | character, prop |
| 3 | Tom holding the big net up over his head | character |
| 3 | Three burnt flashbulbs in a row on Deedee's table | prop |
| 4 | Soundstage 7 floor with a grey circle: grey floor, grey tape marks, grey wardrobe table, four wheel tracks leading to the stairs | area (grey patch on the built plate) |
| 4 | Orange block, beach-ball-sized, cowboy hat on a wooden hat stand inside, round dent; on the table, and hanging in the air with the table pulled away | prop |
| 4 | Gold coin with a cowboy hat stamp, close-up | prop |
| 4 | The Director's Cut with the gold coin pinned to its beret (check the built sheet first); the megaphone as a normal megaphone | enemy |
| 4 | Tom with a VISITOR lanyard, and with two lanyards; TNB with his lanyard; Nara with a badge on her collar | character |
| 4 | Tom on his knees looking under a table; TNB pulling the table; TNB catching the coin; TNB holding up the coin and the gold steamer | character |
| 4 | A second cowboy hat in TNB's hand | prop |
| 4 | Tom's phone showing TNB with coin and steamer (the photo for the next flight east) | prop |
| 4 | Nara action frames, replacing narration: howl and three laps, nose on the snack table, gentle take then gulp, ears up and bolt, hydrant, drop the tag, small serious growl, sit and stare at the coin | character |
| 5 | Kickball field with a grey circle: grey grass, grey second base, clean edge, six orange cones around it; a night version | area (grey patch on the built schoolyard plate) |
| 5 | Orange block, washing-machine-sized, red kickball and one sneaker with flying laces inside, round dent underneath, hanging in the air | prop |
| 5 | Gold coin with a kickball stamp, close-up | prop |
| 5 | The Red Pen with the gold coin under its pocket clip (check the built sheet first); the pen as a normal red pen | enemy |
| 5 | Clara (Grace's age, backpack, sitting and standing); the man in the long coat walking and holding a child's backpack (check the built "vance" sheet first) | character (heights needed from Tom before any prompt) |
| 5 | Mrs. Kowalski holding a tray of cookies; Mr. Delgado crying with a tissue and a cookie (check the built sheets first) | character |
| 5 | The binder with color-coded tabs, closed and open, with TOM on the spine; two iced coffees; bag of gummy worms and TNB's note | prop |
| 5 | Tom with a VISITOR sticker on his shirt; Tom holding the binder, and holding it open over his head; Tom lifting Grace | character |
| 5 | Rose's gap-toothed grin with a gummy worm poked through the gap, close-up | character |
| 5 | Amy's clipboard with the gold coin under the clip and the sign-up sheet on it; the sign-up sheet walking on little paper legs (check the built art first) | prop |
| 5 | Tom's phone showing Grace and Rose, with Rose's gap-toothed grin (the photo for the next flight west) | prop |
| 5 | Nara action frames, replacing narration: sitting on Tom's feet, the big sigh, leaning on TNB | character |
| 6 | Old Oak Park picnic area with a grey circle: grey grass, three grey tables, grey streamers, clean edge | area (grey patch on the built plate) |
| 6 | Orange block, bathtub-sized, open picnic basket and a squirrel halfway into it, round dent low on the side | prop |
| 6 | The block cracking with gold lines, and falling apart (shared by every block from here on) | effect |
| 6 | Gold coin with a picnic basket stamp: clean, and crusted with dried starter; close-up | prop |
| 6 | An ordinary squirrel: diving, with a sandwich, sitting, running up a trunk (Agent Crumb, and the Chairman after he shrinks) | character |
| 6 | Chairman Cheeks shrinking; a scrap of red ribbon on the table (check the built sheet first) | enemy |
| 6 | The Peanut Gallery as a peanut shell with two baby squirrels; the Twig Spy as a plain stick; the Cheek Stuffer as an ordinary squirrel | enemy |
| 6 | Bernadette holding up a sandwich bag with a burnt flashbulb in it | character |
| 6 | The jar with a gold coin stuck to the bottom | prop |
| 6 | Nara: taking the coin from Tom's hand, front paws on the picnic table, dropping the coin, sitting and looking at the empty spot, catching a lemon and the sour face, catching the gold ball, asleep on the gold ball | character |
| 6 | Nara action frames, replacing narration: growling up at a tree, digging with dirt flying, in the bucket | character |
| 6 | TNB covered in dirt | character |
| 6 | The squirrels' corkboard with the picnic table and a sad face in one corner (check the built painting first) | prop |
| 6 | The crock: glazed, BREADY MERCURY, a small gold crown; empty and full | prop |
| 6 | The lemon tree in color with the lemon gone; the cowboy hat on its stand on the table with no block; Soundstage 7 floor in color; a normal megaphone on a shelf | area, prop |
| 6 | Video call frame: a small picture of Tom and TNB on the porch for the corner of the screen | interface |
| 6 | The pond patch, Sundial Hollow and the kickball field back in color; the dragonfly flying; the fish splashing down; Boppy soaked; the kickball bouncing; the sneaker on second base | area, prop, character |
| 6 | Rose holding the coin in both hands; Boppy reaching up with his rod; Amy catching the kickball | character |
| 6 | Tom's phone showing TNB holding the crock (the photo for the next flight east) | prop |
| 7 | The Stacks hall with a grey circle: grey floor, grey globe, grey shelf ends and grey books, clean edge | area (grey patch on the built plate) |
| 7 | Orange block, golf-cart-sized, returns cart tipped on two wheels inside it with seven books in mid-air, round dent on the side; the same block under a white bedsheet; a yellow WET FLOOR sign | prop |
| 7 | Gold coin with a book cart stamp, close-up | prop |
| 7 | The returns cart on four wheels with a neat stack of seven books; the same with Rose sitting on it | prop, character |
| 7 | Grace's chart: rolled up, unrolled across the Square (six sheets taped end to end), laid over Deedee's table, and a close-up of the bottom corner ("MY MEET. TATA COMES."); Rose rolled up in the end of it | prop, character |
| 7 | Six burnt flashbulbs in a row on Deedee's table, and seven; Boppy's plate of crisp half under the chart | prop |
| 7 | Tom patting the door frame of the plane; Tom, Rose and Grace in a row covering each other's ears | character |
| 7 | Tom pulling a bedsheet off; Tom carrying the big book in both arms; Tom holding it up high; Tom with his arms wide holding a small book; Tom pushing the cart | character |
| 7 | The Unread with a gold edge showing between its pages; with Grace's sparkly bookmark; shrinking (check the built sheet first) | enemy |
| 7 | The Unread as an ordinary old brown book, closed and open at a sparkly bookmark; Grace's bedazzled bookmark, close-up, with its writing | prop |
| 7 | The Cliffhanger as an ordinary green novel lying flat; the Know-It-All as an ordinary encyclopedia volume on a shelf; the Pop-Up Panic as a closed pop-up book, and open with a paper dragon | enemy, prop |
| 7 | Grace holding the coin at the round hole; Grace holding the open book; Grace holding up the Gold Library Card | character |
| 7 | Page with a folded bedsheet over one arm; the catalog card for the bulb, with the bulb in a small envelope | character, prop |
| 7 | Boppy in the library doorway; Boppy eating a cookie; Nara dropping the gold ball on Tom's shoe (check the chapter 6 frames first) | character |
| 8 | Mr. Washington's front yard with a grey patch: grey lawn, grey hose, grey porch steps, clean edge | area (grey patch on the built 2nd Avenue plate) |
| 8 | Orange block, minivan-sized, the whole rosebush inside with a paper notice taped to one stem, round hole on the street side | prop |
| 8 | Gold coin with a rosebush stamp, close-up | prop |
| 8 | The rosebush back in color; Bernadette's notice lying on the grass, and in Mr. Washington's hand | area, prop |
| 8 | A walking pilot flame: small, blue, with a hop and a walk (climbing out of a stove, going through a dog door, marching in a line, following TNB, going home) | character or effect |
| 8 | Tom's kitchen with dough rising in every bowl, two stockpots and the salad spinner; TNB sitting on the counter with a grape soda | room dressing, character |
| 8 | Tom carrying the salad spinner (overworld; battle only if cheap); Tom holding out a coin; Tom wrapping a bulb in a dish towel; Tom stacking folding chairs | character |
| 8 | TNB standing at the edge of the grey; TNB staring at the turntable; TNB with three flames behind him; TNB carrying a tower of bowls | character |
| 8 | Bernadette with her clipboard; holding a key on a ring; counting loaves with a pen; drinking a grape soda with her back turned (check the built sheet first) | character |
| 8 | Mr. Washington pushing a coin into the block; reading the notice; biting a slice of bread (check the built sheet first) | character |
| 8 | Miss Odette and Doña Carmen on the sidewalk holding spoons (check the chapter 2 frames first) | character |
| 8 | Grace's wall chart seen on a video call, with its color key and LOS ANGELES gone over in pen; Rose jumping up into the frame | interface, character |
| 8 | The Car Barn door with its chain, and unchained (check the built plate first) | prop |
| 8 | The Damp Blanket over the workbench with a flame under it, and as an ordinary blanket on a hook; the Draft's leaning flame on a windowsill and a window banging shut; the Picky Lunchbox with a flame inside, and as an ordinary dented lunchbox with its lid open (check the built sheets first) | enemy, prop |
| 8 | The turntable still, and turning, with its track lined up with the BOILER ROOM door | area or effect |
| 8 | Old Ironbelly frosted over with every flame in his firebox and the coin on his door; glowing dull red with three loaves on the door shelf; as an ordinary cold oven (check the built sheet first. The built art may read as female: the oven is "he") | enemy |
| 8 | A stack of forty loaves along the Boiler Room wall, and on the potluck table | prop |
| 8 | The potluck: tables down the middle of 2nd Avenue, steaming dishes, folding chairs; a night version with chairs half stacked | area |
| 8 | Olivia at the table; Michael with Isla on his hip, Lachlan under one arm and three plates (check the built sheets first) | character |
| 8 | Nara action frames: jumping on Tom at the door, watching the flame leave and then looking at Tom, looking away, sitting very still beside the loaves, under the table with half a loaf, asleep on the porch with the gold ball (check the chapter 6 frames first) | character |
| 8 | Tom's phone showing Grace and Rose (the photo for the flight west): use ch7-phone-girls | ALREADY IN THE LIBRARY, nothing to make |

### Rebuild work
| Ch | What | Size |
|---|---|---|
| all | Block-breaking and color-return animation, boss and monster shrink-back, encounters off in a freed area | see story-thread.md section 10. BUILT FIRST IN CHAPTER 6 (stage 2 of the chapter 6 build) |
| all | Search every family line for "Rosie" alone and make it "Cozy Rosie" | small |
| all | Search every Boppy line for "Dee" and make it "Deary" or drop the name (2 in the live story scenes) | small |
| all | Hold back NPC lines that treat monsters as ordinary until that chapter's first monster has appeared | small |
| all | Replace every narration box with an on-screen action | medium |
| all | Phone photo beat on flights, west and east | small |
| all | Search TNB and Tom lines for starter-over-TNB jokes ("starter", "jar", "bonus") and remove them | small |
| all | Search all text the player can read for "Sprite" and "amber" (the Stage 7 junction box is labelled amber) | small |
| 13, 14 | First knight fight, helmet reveal at the dent, Part 1 Long Island monsters and bosses switched back on until the dome breaks, armor-breaking animation | medium |
| 1 | Door frame close-up beat; new fishing spot scene with pull-and-fail; coin close-up and coin in Rose's key items; Boppy's gold-teeth grin; 41 new lines, 2 changed, 2 removed | small |
| 2 | Smog seen through the kitchen window; Smoglet coughs in Tom's face; new lemon tree scene; Tom flips the pupusas; the hill's sneeze, coin bounce and Nara fetch; lemon coin in Tom's key items; Miss Odette and Doña Carmen walk onto 2nd Avenue and the towel smack; 95 new lines, 20 reworded, 2 removed | medium |
| 3 | Junk drawer and bulbs on Deedee's table; kettle whistle as an action; remove the sundial coin, shadow swing, spillway drain and old-coin item, and open the way to the Deep Pool after the hollow scene; new hollow scene (grey clearing, block in the air, rod poke, Tom under it with the net); coin shaken from the mustache, coin on Boppy's hat and in his key items; walk back through the hollow; 64 new lines, 17 reworded (Boppy 9), about 11 removed | medium |
| 4 | Lanyard handed over at the cab stand and badge on Nara; new scene on the Stage 7 floor after the light rig (grey circle shown by the lights, Tom under the table, table slides out and back while the block stays in the air, offstage "CUT!"); coin on the beret, tossed to TNB, coin close-up and coin in TNB's key items; remove the coin and note on the steamer; megaphone exit as an action; backup hat beat; crew badges, phone buzz, Tom reads Amy's text, photo of TNB; 77 new lines (Tom 34, TNB 35), 17 reworded (Tom 9, TNB 6), 5 removed, 11 narration boxes turned into actions | medium |
| 5 | Tooth and note beats on landing; binder and iced coffees in the Square; Clara and Mrs. Kowalski on the bench, the long-coat man walks in, takes the backpack, pauses facing the field and leaves with Clara; VISITOR sticker; new kickball field scene (cones, grey circle, block in the air, Tom holds the binder over his head, Tom lifts Grace, Tom walks to second base) with the Uncle Spotter Toss unlock moved here; monster entrances shown before anyone reacts; Amy's piano note and the duet; coin under the pen's clip, set on Amy's clipboard, coin close-up and kickball coin in Amy's key items; remove the taped coin (coinFind 3); pen straightens the tab and exits as an action; the sheet walks back to the clipboard; conference night as a short played scene with Mr. Delgado; remove the long-coat man from the parking lot and add the walk past the field at night; 122 new lines (Tom 51, Amy 39), 13 reworded (Amy 6), 15 removed (Tom 9), 6 narration boxes turned into actions | medium |
| 6 | Tom reads TNB's text aloud; kitchen scene with flour footprints and the acorn; park scene extended to the picnic tables (grey circle, block, Nara's bark, bow and sit, Bernadette's bag); lookouts shown before their first line; corkboard read aloud; coin on the jar bottom, coin close-up, Nara takes it, the Chairman walks out with the party; THE DISCOVERY (coin drop and roll, click, crack, block falls apart, color ring across the map, boss and monster shrink-back, encounters off); gold ball thrown on 2nd Avenue; kitchen scene with the crock; two short return scenes in Los Angeles (lemon, hat); the call home with a video call frame and three short Long Island scenes without the player; all six coins removed from key items and six areas set to normal; remove coinFind 4 and the long-coat lines; Grace's library text becomes her spoken line; about 153 new lines (Tom 57, TNB 49, Bernadette 9, Deedee 8), about 23 reworded (Tom 11, TNB 8), 8 removed, about 20 narration boxes turned into actions | large |
| 7 | Goodbye and flight rewritten, Nara's gold ball throw, Tom pats the plane door, the built welcome at the cab removed; the chart unrolls across the Square and Rose rolls herself up in it; new scene in Deedee's kitchen (six bulbs in a row, the chart over the table, everybody turns to look at Tom, the chart corner close-up) and the first goal after the Square becomes Deedee's house; Stacks scene extended into the hall (the ear-covering row, the sheet and WET FLOOR sign, the sheet pulled off, the grey circle, Rose at the quiet grey shelf); each troublemaker shown walking up before its first line; door narration turned into actions; gold edge between the boss's pages; remove coinFind 5, the checkout card and the long-coat lines; coin close-up, Tom's hand on Grace's shoulder, the bookmark swap, Tom lifts the book; new hall scene where Grace opens the block (reuses the chapter 6 block-breaking work, with the cart dropping, seven books landing, the cart rolling into Tom and the book shrinking in his arms), whispering switched off shelf by shelf; Rose rides the cart, Tom reads the last page of the green novel, Rose opens the pop-up book; Deedee and Boppy walk into the library, the seventh bulb and its card, Tom reads TNB's text aloud; object and NPC text changes; about 207 new lines (Grace 54, Tom 48, Rose 28, the Unread 20, Deedee 19, Page 15, Boppy 11), about 25 reworded (Tom 15), 18 removed (Tom 8, Grace 6), about 9 narration boxes turned into actions | large |
| 8 | EVERY built chapter 8 story line comes out (the script was written without reading them): goodbye, flight, landing and cab lines, the scenes, the three troublemakers, the boss, the ending. Out for good: the man in the long coat visiting the oven and paying it, the clock-face coin, the list of earlier coin finds, the clock on the Moon Club seal, any pun on browned bread, and every "she" for the oven. New: Grace's text on the plane; the kitchen full of rising dough; the rosebush block on 2nd Avenue with the notice inside it, the grey yard and the bulb; TNB will not step onto the grey; Bernadette's report (8:42, white sedan, the plate, the long coat, "a raccoon"); the video call with the wall chart, Bernadette in the frame and Rose jumping in; the pilot flame climbs out of the stove and leaves by the dog door; flames marching down the boulevard and under the barn door; Bernadette unlocks the chain and stays outside; each troublemaker shown before its first line and its flame following TNB afterwards (up to three followers); the turntable started with three flames; the boss scene before the fight, three fight lines (one after each bake), the pension talk, forty loaves baked on screen, the coin taken from the door; Mr. Washington opens the block (reuses the block-breaking work; flames go home down the whole street, the barn windows go dark, the notice falls); the bulb picked up; the potluck with one line spoken by four neighbors together; Bernadette's grape soda; the night scene with four texts. Barn encounters off after the block opens. Battle barks for the four barn monsters are owed new lines at build time. 178 new lines (Tom 48, TNB 35, Bernadette 22, Old Ironbelly 17, Mr. Washington 12, Grace 11), no kept or reworded lines | large |

## 7. Carry-over and leads (not decisions)

Where things stand in the story after chapters 1 to 8 (all locked):
- THE FAMILY KNOWS HOW TO BREAK A BLOCK, AND THEY KNOW IT IS A PATTERN. Each coin is the piece that came out of its own block. Put it back in the round hole and the block cracks and falls apart, the color comes back, and everything that woke up there turns back into what it was and can no longer talk. Grace said the pattern out loud at Deedee's table (chapter 7, scene 2). Every row of her chart has the same six boxes: a flash, a grey patch, an orange block, a round hole, a burnt bulb, and something that woke up holding a gold coin. Every block is bigger than the one before. The eighth was the size of a minivan.
- IT GOES BACK AND FORTH between Long Island and Los Angeles. Grace called row eight for Los Angeles, was right, and went over it in pen. Row nine is Long Island.
- A PERSON IS DOING IT, AND SOMEBODY SAW HIM (chapter 8). Bernadette watched from her window: 8:42 in the morning, a white rental sedan with an airport lot sticker, parked across Mr. Washington's driveway for four minutes. One man, in a long coat in the heat. "He pointed something at the roses, there was a flash, and when I could see again, there was that." She has the license plate. Nobody has said "camera", nobody knows his name, and nobody has connected him to the father at Grace's school. Grace's conclusion, by text at the end of chapter 8: he rented a car AT THE AIRPORT, so he flies back and forth. "Like you." Tom read that twice and said nothing about it. What nobody has done yet: anything with the plate. That is open for chapters 9 and 10.
- HE MISSED TOM BY FIFTEEN MINUTES. Bernadette: "You'd have seen him yourself if you were ever home." Tom did not answer. It is the thread of Tom missing things, played without comment.
- A thing that woke up can carry a coin somewhere else. A pilot flame picked the rosebush coin up off the sidewalk and ran it to the oven in the Car Barn (Bernadette: "I wrote it down as a raccoon. I know it wasn't a raccoon."). So the boss does not have to be standing next to the block.
- Eight blocks are open and eight coins are used up: the picnic basket (by accident), the lemon (Tom), the cowboy hat (TNB), the dragonfly (Rose), the fish (Boppy), the kickball (Amy), the book cart (Grace) and the rosebush (Mr. Washington, because it is his rosebush). Nobody in the family is holding a coin.
- No monsters are left in Old Oak Park, Griffith Park, the Backlot, the pond, the marsh, the school, the library Stacks or the Car Barn. The Big One, the Big Shake, Old Iron-Gill, the Director's Cut, the Red Pen, Chairman Cheeks, the Unread and Old Ironbelly are an ordinary fish, hill, fish, megaphone, pen, squirrel, book and oven. On Long Island these come back in chapters 13 and 14.
- OLD IRONBELLY (chapter 8) is a cast-iron oven from 1912 in the old streetcar barn at the end of Jefferson Boulevard. He is "he". He baked for the night crews for fifty years and was shut off and chained up in 1963 without a word from anyone. He woke up cold, took every pilot flame on the block, and still could not get warm with nothing to bake. He thought the gold coin was his pension, sixty years late. Tom told him the truth. He was insulted ("the first gold through that door belongs to a shrub"), asked what time the potluck was, baked the forty loaves as a last shift, and gave up the coin: "Shut my door on the way out. I'd like to cool down slowly." He predicted somebody would take credit for the bread, and Bernadette did.
- THE UNREAD CHOSE (chapter 7). It is the oldest book in the Hush Library, never opened since 1952, with no title on its cover (only VOLUME ONE) and a dragon in chapter one. Tom told it what the coin does, it already knew, and it would sooner be read than talk: "A book isn't supposed to talk. A book is supposed to be READ." Grace gave it her bedazzled bookmark ("THIS IS GRACE'S PAGE. DO NOT MOVE IT. THIS MEANS YOU, ROSE."), which is at page twelve. Grace reads it out loud at story time on Saturdays, and Rose is always the dragon. When it comes back in chapters 13 and 14 it is a friend with Grace's bookmark in it.
- Tom watched one block open in person at last in chapter 7 ("I saw it. All of it, from right here. Not on a phone."), and a second in chapter 8, on his own street.
- The seventh bulb was filed in the Hush Library card catalog under B ("Bulb, burnt, origin unknown") and is checked out on Grace's Gold Library Card, which has no late fees, ever.
- TNB is keeping Tom's Saturday deal with the squirrel while Tom is away (chapter 6).
- THE 2ND AVENUE NEIGHBORS, who are frozen on this street in chapter 12 when the man comes back to this same rosebush: Mr. Washington (bought his house in 1979, tells the 1979 story, his father drove the night streetcar out of the Car Barn and brought home a loaf every morning; he knew the bread), Bernadette (nineteen years as Watch captain, the key nobody asked for, the notice she taped to the roses at 5:30 that morning, the seating diagram everyone ignored, "The Watch would like to thank the Watch"), Miss Odette and Doña Carmen (who scold Tom because he is standing there, and moved the table), Olivia (sharp, wants a quote) and Michael (carrying both children and three plates: "I've got it. Nobody get up."). They needle each other and finish Mr. Washington's story for him.
- BERNADETTE AND GRACE have met by video call and took to each other at once. Bernadette has explained that it is not friendliness: "She keeps records, and I respect records." Grace has her number.
- TNB and Bernadette: she told him his bowls were too close together. He said "Great note, Bernadette," did not move them, and opened a soda. At the end she is seen drinking one of his grape sodas with her back turned, and she "thinks I moved the bowls".
- Flashbulbs: Deedee has seven in her junk drawer and the eighth is wrapped in a dish towel in Tom's bag. Bernadette wanted it logged first.
- THE HOOK TO CHAPTER 9: Deedee texted that a fancy letter came for Tom from the Moon Club, which has been locked since 1971. She did not open it. She held it up to the lamp, and there is a piano on it. Tom flies back the next day with a loaf for his mother.
- Boppy's meteor story is seeded (chapter 7, scene 2): "The night the meteor came down. Big as a Buick." Deedee: "It was a pebble. It went through the roof of Penny's shop." Nobody thinks it matters. Do not explain it. It pays off in chapter 13.
- Deedee's rule (nobody in the family goes anywhere alone) still stands.
- Grace's gymnastics meet is written at the bottom of her chart: "MY MEET. TATA COMES." Tom: "I'll be there." "I know. It's in pen." It is still owed in a later Long Island chapter.
- Nara has her gold ball and sleeps on Tom's porch. She stole one of the forty loaves. Olivia says she owes her a couch.
- Bready Mercury lives in the crock TNB made. TNB started the forty loaves without Tom because the starter was climbing out of the crock at five in the morning.
- NOBODY COUNTS PUNS ANYMORE (Tom 2026-11-14 16:19). The old count (Tom on eight, TNB's nine in one day, Amy counting) is not carried forward and nobody mentions it.
- Clara and her father have been seen once (chapter 5, the schoolyard): she waits on the bench, he is forty minutes late, and he looks across at the kickball field on the way out. Nobody connects him to anything. He is not named. He is next seen with a camera in chapter 10. Off screen, he comes back to each of his tests, finds them open and unharmed, and believes they melted by themselves (story-thread.md section 3). The player does not see that until chapter 18.
- Planted for chapters 13 and 14: Boppy's gold teeth, "Gold is for keeping" and "Fish are for jumping", "You stay in front of those girls", the 1970 story and "Can you still run that fast?", both big fish liking him, and the meteor and Penny's roof.
- The thread of Tom missing things: the door frame marks (chapter 1), Rose's tooth (chapter 5), the kiln (chapter 6), the three Long Island blocks seen through a phone (chapter 6), and now the man himself, by fifteen minutes (chapter 8). Chapter 7 is the one time he was there. The meet is still owed.
- Running bits that exist and MAY come back, sparingly (the tally in section 10 says most of them are overused): 2,475 miles and the SkyMiles Tom will not spend, Tom thanking the airplane, Bready Mercury, Tom's schedules and tabs, Boppy's fish getting bigger and the star in Grace's key, TNB fixing things, Tom's binder (tab four holds a copy of Grace's chart), whose picture goes on the front of the Christmas tree, Deedee's pie crust, TNB's horror-movie logic, Bernadette's clipboard and log, Nara's gold ball, Grace's pencil and pen. From chapter 8: the salad spinner, "Great note, Bernadette", Bernadette's shed with two padlocks (never explained, leave it that way), "I wrote it down as a raccoon".
- Invented and not yet confirmed by Tom from real life: the 412,000 miles, Miss Odette's "Sit down, you're too skinny!", Doña Carmen's towel, TNB's gummy worms, Boppy's boot lost in 1988, "It was windy" for the 1997 cast, "I paid for those teeth.", thirty-six thousand feet, grape as TNB's favorite color, "four hundred lights", TNB never having won anything, Tom setting two alarms for everything, Amy not sharing her Halloween candy, what is behind each binder tab, Moss as the kicker, the tooth fairy's two dollars, the tooth coming out in an apple on a Tuesday, Deedee calling Amy four times, Clara's pickup time of five thirty. From chapter 6: "I Want to Bake Free", TNB going out for grape soda, the crock with a crown and the kiln on a Thursday, Tom loving to watch the kiln opened, Bernadette's times and her sandwich bag, Agent Crumb, the birthday party at the picnic tables, nine days for TNB's award, 9,900 miles for the lemon coin, Amy giving out forty gold stars a week, "Gold is for keeping. Fish are for jumping." From chapter 7: Tom thanking the airplane, Rose thanking the bathtub, "That's not eating. That's a tray.", Tom keeping every boarding pass, Tom cleaning up at his own birthday party, Deedee having a pie crust secret, Deedee vacuuming the car, Tom arguing with his cookbooks, Rose eating cookie dough and jumping on Boppy's chair, Grace's bedazzled bookmark and what it says, volume two checked out in 1998, Page's WET FLOOR sign. From chapter 8 (shown to Tom at lock, none struck): dough in the salad spinner and stockpots, Bernadette's 7 a.m. visit, Bernadette counting the folding chairs at Mr. Washington's birthday, her shed with two padlocks, her "trim to regulation height" notice and her seating diagram, Tom's dog door that Nara never uses, Tom's first landlord blaming the old building, TNB fixing a zipper with a paper clip on set, Nara owing Olivia a couch, "thirty-eight thousand dollars, and the porch was already crooked", Miss Odette's gumbo, the piano on the Moon Club letter.

Leads for building chapter 1 (the build conversation): see section 9.

Leads for building chapter 6 (its own build conversation): the four stages in the note at the top, section 11, and the art and engine tables at the end of claude/story-ch06.md.

Leads for building chapter 7 (its own build conversation, stage 1 done): section 12. The art and engine tables are at the end of claude/story-ch07.md.

Leads for building chapter 8 (its own build conversation, not started): the art and engine tables at the end of claude/story-ch08.md and the chapter 8 rows in section 6. Tom's prompt for it: "Read claude/story-build.md and claude/story-ch08.md. Start the chapter 8 build (section 2B) in its own conversation, in stages, beginning with the assets-first step." Things that build must know: (1) the script was written without looking at the built chapter, so the build session has to map each scene onto the built maps (SCENES.ch8*, the Car Barn map, the Boiler Room, 2nd Avenue) and remove every built story line; (2) the oven is "he" and the recorded voice is male, so check the built boss art and text for "she"; (3) the built fight (bake three times) is kept, with three new lines, one after each bake; (4) the block-breaking work is already on main; (5) all 178 lines need recording.

Leads for chapter 9, the next chapter to write:
- USE THE BLANK-SLATE METHOD THAT WORKED FOR CHAPTER 8. Read this file, the story thread and claude/story-ch08.md (the voice model). Read the built chapter 9 for facts only (step 2 of section 2A) and write every line new.
- Long Island, the Moon Club. Facts found on 2026-11-14 from the Project docs (check them against the repo): the built chapter 9 is the Moon Club, map id `moonclub`, a members' club that has been locked since its last dance in 1971. It has a coat check, a card room and a ballroom, a white grand piano, a jukebox, a brass plaque (MEMBERS ARE ADMITTED BY MOONLIGHT), three brass stands whose mirrors are missing, and Dome doors opened by bouncing a moonbeam off the three mirrors. Built monsters include the Hanger-On (coat check) and the Wallflower (ballroom). The built boss is the Mirrorball, who was danced under every full moon until 1971. In the built fight Deedee is there, and kindness is asking the Mirrorball to dance three times.
- OUT OF THE BUILT CHAPTER 9 FOR GOOD: the gentleman in the long coat giving the Mirrorball a coin and writing the invitation himself, the little gold clock on the seal and on any coin, and "the same little gold clock as my coins". So WHO SENT THE LETTER is an open question the chapter has to answer plainly, with something the player can see (lead: the club itself, or the thing that woke up, sent it; nothing in the approved story says Julian writes to Tom).
- The block: a piano (story-thread.md section 5). It must be bigger than a minivan, so lead: the white grand piano with its bench, and something caught with it. Check the built club for where the piano stands.
- THE STEP THE FAMILY TAKES IN CHAPTERS 8 TO 10: they are looking for whoever is doing this. They now have a description (one man, long coat, rental car from the airport), a license plate, and Grace's conclusion that he flies back and forth. Chapter 9 should move that forward by one visible thing. Nobody says "camera" before chapter 10, when he is seen with one around his neck at the airport. Check story-thread.md section 6 before adding any clue.
- Grace is in person in this chapter, with the chart. Row nine is hers to predict. Bernadette's plate should reach the chart.
- The built chapter gives Deedee a big part (the plaque, the fight). She is sharp and direct. Boppy has the mirrors ("I didn't drive a car for forty years without learning about mirrors" is a built line: do not reuse the wording). Tom brings Deedee the eighth bulb and a loaf.
- THE BOSS IS TOLD, and its answer must be new. Used so far: cut off mid-speech (6), calm with conditions (7), insulted and then a last shift (8).
- Reach for joke types that are light in the tally (section 10): reality shows and musicals (5 uses in eight chapters, and a ballroom is the place for them), Boppy's tall tales, scoldings. Go easy on someone counting or writing things down, running gags that pay off at the end, callbacks, exact numbers and kid sight gags. No more than one or two puns.
- NOT HEARTWARMING BY DEFAULT. One sincere moment at most. This chapter has Deedee, Boppy, the girls and a lonely ballroom, so it will pull hard toward sweet. Do not let it.

## 8. Canon lines waiting to be copied into claude/canon-addendum.md

Not yet copied: the sessions of 2026-11-13 16:25 to 2026-11-14 17:50 did not rewrite canon-addendum.md, because it has to be rewritten whole and these lines are read from here by every story session anyway. Treat them as canon. Copy them, one dated line each, the next time that file is rewritten:
- 2026-11-13 16:25 (Tom): chapter 2 of the new storyline is LOCKED (claude/story-ch02.md, revision 3). New in it: Tom tells TNB about the pond and TNB believes him at once; the grey lemon tree with a lemon in an orange block below the Observatory; the Big Shake woke up after a flash that morning; TNB naps on that hill and is the only one who ever stayed; the hill sneezes out the lemon coin and Tom keeps it; the man in the long coat is gone from this chapter.
- 2026-11-13 16:13 (Tom approved): the model for Tom's humor is his own obsessions. He corrects "three thousand miles" to "two thousand four hundred and seventy-five" every time, and hoards SkyMiles for "something really special" (the count, 412,000, is invented).
- 2026-11-13 16:25: TNB fed Bready Mercury while Tom was away, sings it Queen puns ("Another One Bites the Crust", Tom answers "Don't Stop Me Dough!"), and shaped a loaf on his pottery wheel as a bread bowl. The starter is something they share.
- 2026-11-13 16:25: neighbors' habits (invented, Tom has not corrected them): Miss Odette tells TNB "Sit down, you're too skinny!", Doña Carmen smacks anyone who goes behind her counter with a towel, Mr. Washington's 1979 story ends with gumbo.
- 2026-11-13 16:21 (Tom): when dialogue is shown in chat, new lines are marked ★ and changed lines ✎, always.
- 2026-11-13 16:23 (Tom): no narration lines where an action can show it. Narration becomes an on-screen action, and new animation frames are made for it later.
- 2026-11-13 16:31 (Tom): Deedee is loving and kind but also sharp, direct and no nonsense. Boppy is fun loving.
- 2026-11-13 16:39 (Tom): Boppy calls Deedee "Deary" and she calls him "hubby", only once in a while, not constantly. Built Boppy lines that say "Dee" are owed a change. Their real names are Debi and Angelo; Tom did not ask for those in the game.
- 2026-11-13 16:40 (Tom): chapter 3 of the new storyline is LOCKED (claude/story-ch03.md). New in it: the Whisker Perch and Old Iron-Gill are one fish, bigger than Boppy ever claimed, and it woke up after a flash that morning; Sundial Hollow has lost its color and a fish is frozen in the middle of a jump, hanging in the air in an orange block; the stopped sundial, the coin under its pointer, the draining spillway and the kettle's long-coat gossip are removed; Boppy gets the fish coin and keeps it in his hatband; Deedee keeps all three flashbulbs and rules that nobody in the family goes anywhere alone.
- 2026-11-13 16:49 (Tom): TNB's lines should have a few real puns. Tom would be excited about a lanyard.
- 2026-11-13 17:05 (Tom): chapter 4 of the new storyline is LOCKED (claude/story-ch04.md). New in it: TNB gives Tom a laminated VISITOR lanyard to keep Deedee's rule, and Nara a STUNT DOUBLE badge; the trouble at Sunset Gold Studios began with a huge flash in Soundstage 7; the movie's cowboy hat is frozen on its stand in a beach-ball-sized orange block on TNB's wardrobe table, in a grey circle of floor, and stays hanging in the air when the table is pulled away; the megaphone (the Director's Cut) woke up after the flash and wears the gold coin as its first award, then gives it to TNB for best costumes; a backup hat saves the shoot; the man in the long coat, his payment and the "Paid in full" note are gone from this chapter; nobody calls the monsters "Sprites".
- 2026-11-13 17:05 (Tom): the locked chapters are built into the live game one at a time and played by Tom before any further chapter is written, because the humor and dialogue only make sense in live action. This replaces "nothing is built until all 20 are locked".
- 2026-11-13 17:25 (Tom): writing and building now run in parallel, in separate conversations. This replaces the 17:05 hold on writing.
- 2026-11-13 17:31 (Tom): Amy only drinks iced coffee, never hot coffee.
- 2026-11-13 18:02 (Tom): he cannot read every line of a chapter. Show him a summary, a humor assessment and questions, and after that only the lines that changed.
- 2026-11-13 18:07 (Tom): Tom and Amy compete only lightly and occasionally. They like to chat about reality shows and musicals. Amy's loud singing is fair game. Tom can make puns himself. A kid stating something plainly is not a joke by itself. Clara and her dad are played quiet and straight.
- 2026-11-13 18:07, 18:10 and 18:13 (Tom): real running joke between Tom and Amy: the Christmas tree has ornaments that are pictures of Tom and of Amy, and the picture at the front belongs to whoever they joke is Mom's favorite that year. There are no turns. A reference to how they treated Halloween candy as kids is fine too.
- 2026-11-13 18:14 (Tom): chapter 5 of the new storyline is LOCKED (claude/story-ch05.md, revision 3). New in it: Rose's tooth came out while Tom was away; Amy gives Tom a binder with tabs and his name on the spine; the trouble at the school began with a huge flash on the playground at recess, and Grace was there; a kickball and Moss's sneaker are frozen in a washing-machine-sized orange block hanging over a grey circle of the kickball field, with six cones around it; Clara (Grace's classmate) and her father in the long coat are seen for the first time, as a late pickup, and nobody connects him to anything; the Red Pen is Amy's own red pen, woke up after the flash, and gives its one "gold star" (the kickball coin) to Amy; the man in the long coat's payment, the coin taped to the sign-up sheet and the parking-lot stare are gone; "the Gregori Rule" is now "the Rivituso Rule"; Tom makes six puns and Amy counts them for TNB.
- 2026-11-13 18:23 (Tom): keep a count of how often each type of joke is used, chapter by chapter (section 10 of this file). Some types are already heavy. Do not rebalance now. When all the chapters are written, change some so the types are spread more evenly.
- 2026-11-14 10:38 (Tom): chapter 6 of the new storyline is LOCKED (claude/story-ch06.md, no changes during review). New in it: the trouble on 2nd Avenue began with a flash in Old Oak Park on a Sunday morning; a picnic basket and an ordinary squirrel are frozen in a bathtub-sized orange block on the last picnic table, in a grey circle; Bernadette bagged the burnt flashbulb as evidence; the squirrels call the frozen squirrel Agent Crumb and cannot get him out; Chairman Cheeks woke up after the flash, and the man in the long coat, his payment and the coin taped to the jar lid are gone; the picnic basket coin was glued to the bottom of the jar by the starter, Nara took it because it smelled like bread, dropped it on the picnic table to have it thrown, and it rolled into the round hole; the block broke, the color came back, and the Chairman and every squirrel thing in the park turned back into ordinary squirrels, a peanut shell and a stick, unable to talk; Lachlan's gold-painted tennis ball is the gold Nara is allowed to fetch; TNB made a glazed crock with a crown for Bready Mercury while Tom was on Long Island.
- 2026-11-14 10:38 (Tom): the return to chapters 1 to 5 is the end of chapter 6. Tom and TNB open the lemon and the cowboy hat in person, and TNB gives up his only award gladly. Tom calls home, and Deedee takes the whole family to the pond, Sundial Hollow and the kickball field, where Rose, Boppy and Amy each put their own coin back while Tom watches on a video call. Rose: "It's a GUMBALL MACHINE! You put the coin in and the bug comes out!" Boppy: "Gold is for keeping. Fish are for jumping." All six coins are used up.
- 2026-11-14 10:38 (Tom): something that woke up cannot talk after its block is broken. The first time is Chairman Cheeks, in the middle of a speech. It is played small.
- 2026-11-14 10:38 (Tom): chapter 6 is built in its own conversation, in stages, in parallel with writing chapter 7. Chapters no longer have to be built strictly in order.
- 2026-11-14 11:13 (Tom): the whole chapter has to keep the humor, wit and character personalities of the approved beat at full strength, not a lighter version of it.
- 2026-11-14 13:43 (Tom): chapter 7 of the new storyline is LOCKED (claude/story-ch07.md, no changes during review). New in it: Tom thanks the airplane every time he gets off, and a book tells the whole Square; the whispering in the Hush Library began with a flash in the Stacks on Monday night; Page's returns cart and seven books in the middle of falling off it are frozen in a golf-cart-sized orange block in the hall of the Stacks, in a grey circle where the books do not whisper, and Page hid it under a bedsheet with a WET FLOOR sign and filed the burnt bulb in the card catalog under B; Grace says the pattern out loud at Deedee's table with six bulbs in a row ("It's not six strange things. It's ONE strange thing, six times."), notices that the places go back and forth between Long Island and Los Angeles like Tom, and fills in row seven before anyone has seen it; the Unread woke up after the flash, has no title on its cover and does not know what it is about, and the man in the long coat, the 1952 checkout card and the clock-face coin are gone; the book cart coin is the Unread's first bookmark; Tom tells the Unread what the coin does, it already knows and chooses to be read, Grace swaps the coin for her bedazzled bookmark, Tom carries the book out to watch, and Grace opens the block; Grace reads the book aloud on Saturdays; Deedee has seven bulbs; Grace says row eight will be in Los Angeles.
- 2026-11-14 13:43 (Tom): Boppy's meteor story is first told in chapter 7 ("Big as a Buick." "It was a pebble. It went through the roof of Penny's shop."), as a tall tale nobody takes seriously.
- 2026-11-14 13:43 (Tom): once the family knows what a coin does, the boss is told before it gives the coin up, and Tom is the one who makes sure of it.
- 2026-11-14 16:19 (Tom): nobody keeps count of puns anymore. "I think it's getting played out."
- 2026-11-14 16:41 (Tom): the writing had become too heartwarming, "like it's meant for like a children's show". He wants jabs, humor and adult wit that a child can still read. Not heartwarming by default: at most one sincere moment in a chapter.
- 2026-11-14 17:01 (Tom): when a chapter's dialogue is not working, he would sooner start it over in a fresh conversation, from a brief with no dialogue in it, than keep revising. Every line is written new and he is fine re-recording.
- 2026-11-14 17:07 to 17:10 (Tom): TNB is easy-going and nonchalant and does not call people out. Nobody states how they feel about someone; it shows in what they do. Tom wants more nuance than a complaint or flat agreement. Tom never shuts down one of TNB's bits; he adds to it. Approved model: "Great note, Bernadette." "How long did she wait?" "It was a long soda."
- 2026-11-14 17:38 (Tom): Bernadette may make an exception for Grace, and she says out loud why, so nobody takes it for niceness ("She keeps records, and I respect records."). The Moon Club is still in the story.
- 2026-11-14 17:40 (Tom): chapter 8 of the new storyline is LOCKED (claude/story-ch08.md, a blank-slate rewrite, 178 lines, all new). New in it: it is potluck day on 2nd Avenue and Tom and TNB owe Bernadette forty loaves by six; at 8:42 that morning, fifteen minutes before Tom's cab, a man in a long coat got out of a white rental sedan with an airport lot sticker and froze Mr. Washington's whole rosebush in a minivan-sized orange block, with Bernadette's "trim to regulation height" notice taped inside it; Bernadette saw it from her window and has the license plate; a woken pilot flame carried the rosebush coin to the old Car Barn; Tom called Grace before touching anything, Grace went over LOS ANGELES in pen, TNB saw the chart for the first time, and Bernadette and Grace took to each other; every pilot flame on the block walked out of its stove and into the Car Barn, chained since 1963, which Bernadette unlocked with a key nobody had ever asked her for; a Damp Blanket, a Draft and a Picky Lunchbox each held a flame, and TNB started the turntable with the three of them; Old Ironbelly, a 1912 oven who is "he", woke up cold, took the flames, and believed the coin was his pension; Tom told him what it does, and he baked the forty loaves as a last shift and gave it up; Mr. Washington opened the block himself; at the potluck Bernadette thanked the Watch for arranging the bread and Mr. Washington knew the loaf his father used to bring home; Tom has the eighth bulb for Deedee; Deedee texted that a letter came for Tom from the Moon Club, locked since 1971, with a piano on it; Grace texted that the man must fly back and forth, "Like you."
- 2026-11-14 17:40: the man in the long coat visiting the oven and paying it, the clock-face coin, the list of earlier coin finds, the clock on the Moon Club letter's seal and the oven as "she" are gone from chapter 8.

## 9. Chapter 1 assets (2026-11-13, the assets-first step)

Status: ASSETS ADDED, NOT BUILT. Nothing is pushed. The changes sit in the working copy of trivituso81/adventures-of-tom (uncommitted) and are committed with the chapter 1 build.

Art library (ADMIN > ART LIBRARY, group "Chapter 1", 8 entries, all draft). Prompts are in tools/art-library/ch01-prompts.js, spliced into data/art-prompts.json:
| Entry id | What | Needed when |
|---|---|---|
| ch1-doorframe | Kitchen door frame, pencil height marks, close-up | chapter 1 build |
| ch1-orange-block | Plum-sized orange block, dragonfly inside, round dent | chapter 1 build |
| ch1-grey-patch | Hand-sized grey grass patch, clean edge | chapter 1 build |
| ch1-coin | Gold coin with dragonfly stamp, close-up | chapter 1 build |
| ch1-flashbulb | Burnt flashbulb (shared by every chapter) | chapter 1 build |
| ch1-bigone-lure-coin | The Big One, 6 poses, lure and coin in its lip, tiny pie tin kept | chapter 1 build |
| ch1-bigone-normal | The Big One as a normal-sized pond fish, 6 poses | the return after chapter 6, can wait |
| ch1-boppy-grin | Boppy grinning, gold fillings showing | chapter 1 build (reused in 3, 13, 14) |
Already built and not redone: Boppy's folding chair (art/props/boppy/folding_chair.webp), the crumb trail, the approved Big One sheet (enemy-bigone-v2).

Voice library (ADMIN > VOICE LIBRARY, Chapter 1, Show > No clip yet): 43 lines, all dialogue. 41 are NEW (Tom 6, Deedee 8, Grace 8, Rose 9, Boppy 6, The Big One 4). 2 are CHANGED (Tom "Then nobody goes near the water. Stay close."; Deedee "Tom, you stand in front of whoever it stares at. Cozy Rosie, make it laugh. Then we try again."). Each has a written direction in tools/voice-library/scripts/ch01-story-directions.json. The 43 lines are also listed in tools/voice-library/harvest.json (src scene:ch1Theft, ch1Mudling, ch1Skeeter, ch1Grump, ch1Pond, ch1AfterBoss, ch1End). A later harvest.py run drops them until the build wires them into the scenes.
- Rule conflict, on purpose: the standing "no unused voice" rule says a line must not be in the library before a scene plays it. Tom asked for the clips now, so they are in the library before the build. The chapter 1 build must wire all 43 into the scenes in the same change, or it must remove them.
- The two removed Boppy lines (the long-coat lines) and the two replaced clips are purged in the chapter 1 build.

Decisions made in this step (one line each):
- The Big One as a normal fish is listed as needed but can wait for the return after chapter 6 (Tom can skip it now).
- The folding chair is not made again.
- The Big One lure-and-coin sheet is a new sheet from the approved one, not an edit of it.

Chapter 1 build, when Tom returns the art and clips: the build uses the approved pictures from the library (each approved file is read from art/raw/ and cut as its entry requires), the recorded clips for the 41 new and 2 changed lines, and stand-ins only for what he has not returned.

What Tom does now:
1. Open ADMIN > ART LIBRARY, filter to the group "Chapter 1", press Generate on ch1-doorframe, ch1-orange-block, ch1-grey-patch, ch1-coin, ch1-flashbulb, ch1-bigone-lure-coin and ch1-boppy-grin, then Approve each one you like. Skip ch1-bigone-normal until chapter 6 is being built.
2. Open ADMIN > VOICE LIBRARY, filter Chapter 1 and Show > No clip yet. Record all 43 lines (Takes, New take or Record my voice). Keep the directions in the brackets. Then Export pending and send the file back in this same conversation.
3. Tell Tom in two lines: the next session builds chapter 1 with the approved art and the recorded clips, and the exact prompt to paste: "Read claude/story-build.md and follow it."

Files changed in this step: tools/art-library/ch01-prompts.js (new), tools/art-library/make-prompts.js (module added), data/art-prompts.json (8 entries), tools/voice-library/scripts/ch01-story-directions.json (new), tools/voice-library/harvest.json (43 lines), data/voice-index.json (rebuilt). claude/next.md was not rewritten in this step; its ORDER NOW list belongs to the older build work and is unchanged.

## 10. Joke tally (Tom 2026-11-13 18:23). A writing part: every writing session adds its chapter's column at lock.

Tom: "we need to keep count of how often certain types of jokes are getting used, because I already feel like we're getting really heavy on certain types of jokes and probably need to change some of them once we're done so that they're distributed more evenly throughout."

How to use it:
- At lock, count the chapter's jokes by type and fill in its column. Count from the locked chapter file, new and kept lines together, because the player hears both. Add a new row when a new type appears.
- Do NOT rebalance while writing (Tom: "we'll deal with it at the end"). The one thing to do now: when you start a chapter, look at the heavy rows and reach for a different type first where the scene allows it.
- At the end (all 20 locked), go through the heavy rows with Tom and swap some for other types so they are spread evenly. That is a pass over the chapter files, and it changes recorded lines, so do it before the last voice recording.
- If a build session changes a joke while Tom plays a chapter, it corrects that chapter's column.

First count, 2026-11-13, made from the five locked chapter files. Chapter 6, chapter 7 and chapter 8 added 2026-11-14. Approximate: one count per joke beat, not per line.

| Joke type | Ch 1 | Ch 2 | Ch 3 | Ch 4 | Ch 5 | Ch 6 | Ch 7 | Ch 8 | Total | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| Puns and wordplay | 0 | 5 | 0 | 8 | 6 | 12 | 2 | 1 | 34 | HEAVY, and Tom said on 2026-11-14 that they are played out and nobody counts them. Chapter 8 has one, and it is literally true (a wet blanket) |
| Tom thrilled by an office-type prop (lanyard, badge, sticker, binder, tabs) | 0 | 0 | 0 | 9 | 11 | 0 | 1 | 1 | 22 | HEAVY. Chapter 8: only the schedule with tabs |
| Exact numbers (2,475 miles, SkyMiles, grams, two alarms, "exactly seven") | 0 | 9 | 1 | 4 | 3 | 5 | 2 | 3 | 27 | HEAVY in chapter 2. Chapter 8: fifteen hours of oven and nine to do it in, loaf thirty-one, 8:42. No mile count |
| Tom is polite to a monster or object ("Excuse me, Mr. Sock") | 0 | 2 | 2 | 2 | 1 | 4 | 5 | 2 | 18 | Chapter 8: "You're the one who's polite to things", "Thank you for the bread." |
| Tom: "That was UNCALLED for!" | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 6 | Built catchphrase. Not in chapter 8 |
| "This is a professional environment" and its versions | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 3 | |
| Tom loses to the block, or does something useless under it (pulling, the net, the binder over his head) | 1 | 1 | 1 | 1 | 1 | 0 | 1 | 0 | 6 | Chapter 8 gave the block to TNB: he will not step onto the grey |
| Tom predicts the round hole and the bulb | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 2 | |
| The boss hands over its gold thing as a present or prize | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 4 | HEAVY in shape: fish, fish, megaphone, pen. Chapter 8 is the opposite: the boss is insulted that the gold is not his |
| The boss is a lonely thing nobody ever praised or visited | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 8 | The story spine. Chapter 8 plays it as a grievance: laid off without a word, and annoyed about it, not sad |
| A running prop or gag that pays off at the end of the chapter | 0 | 2 | 2 | 2 | 2 | 4 | 7 | 5 | 24 | HEAVY. Chapter 8: the bowls, the grape soda, the salad spinner, "Somebody always did", Bernadette counting |
| Someone counts or writes it down (Grace's notebook, TNB's forty costumes, Amy counting puns) | 0 | 1 | 4 | 2 | 4 | 5 | 7 | 5 | 28 | HEAVY. Chapter 8: the plate, the raccoon, the pen on the chart, counting loaves, logging the bulb. It now belongs to Bernadette and Grace: keep it away from everyone else |
| Family or neighbor teasing | 2 | 0 | 4 | 0 | 5 | 4 | 5 | 9 | 29 | What Tom asked for on 2026-11-14. Chapter 8: the neighbors on each other all through the potluck, the cooks on Tom, Bernadette on everyone |
| Stomach, gas and pepper jokes (Deedee and Boppy) | 3 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 8 | Built lines mostly |
| Boppy's tall tales and old years (1970, 1988, 1994, 1997) | 2 | 0 | 6 | 0 | 0 | 1 | 2 | 1 | 12 | Chapter 8: sixty loaves in one morning, by text ("He has never baked.") |
| Gold teeth | 2 | 0 | 3 | 0 | 1 | 2 | 0 | 0 | 8 | Planted on purpose for chapters 13 and 14 |
| Wanting to be scolded, or a scolding that comes back | 0 | 4 | 1 | 0 | 0 | 0 | 1 | 4 | 10 | Chapter 8: Miss Odette, Doña Carmen, "Don't be smart, Other Tom", and the oven grading the loaves |
| Nara physical comedy (puddle, slap, hydrant, sigh) | 0 | 6 | 0 | 7 | 1 | 9 | 1 | 3 | 27 | HEAVY. Chapter 8 kept it to three: the jumping, looking away, the stolen loaf |
| A kid's punchline or sight gag (Rose and Grace) | 5 | 0 | 5 | 0 | 5 | 2 | 10 | 2 | 29 | Chapter 8: "Why didn't he jump?", "I need a new color for fire." |
| "That's not how X works" (Grace) | 0 | 0 | 0 | 0 | 2 | 1 | 3 | 0 | 6 | |
| Reality shows and musicals (Tom and Amy) | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 5 | LIGHT. Room to use |
| Callback to an earlier chapter's joke | 0 | 0 | 3 | 4 | 4 | 8 | 5 | 1 | 25 | HEAVY. Chapter 8 has one (the golf cart) and was better for it |
| TNB's horror-movie logic ("this is how they all start", "the second act") | 0 | 0 | 0 | 0 | 0 | 4 | 1 | 5 | 10 | Chapter 8: the basement, the thing that is just waiting, the detective's wall, the chain, reading BOILER ROOM out loud. That is his full share for a while |
| A monster gives itself away or takes itself very seriously (the spy, the Chairman's orders) | 0 | 0 | 0 | 0 | 0 | 5 | 4 | 5 | 14 | Chapter 8: the blanket against fun, the Draft denying it exists, the lunchbox asking for whoever packed it, the oven's pension |
| Someone is cut off in the middle of a big speech | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | The shrink. Do not repeat it |
| Something tells a true secret about a family member | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 8 | Belongs to the library. Not carried into chapter 8 |
| Adult wit: neighborhood politics, irony, a line a grown-up catches and a child does not | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 7 | NEW ROW, and what Tom asked for on 2026-11-14. Chapter 8: the tasting menu, "It was a long soda", the notice that still applies, the Draft as a landlord, "No comment." "That's a quote.", the diagram and the moved table, "The Watch would like to thank the Watch". Earlier chapters were not recounted for this row |

What already looks heavy (the writer's read, for the end pass, not a decision):
1. Tom thrilled by an office-type prop: 22, almost all in two chapters.
2. Exact numbers, mostly the miles correction.
3. The boss gives its gold thing away as a gift or a prize: four of eight chapters have the same shape. From chapter 7 on the boss has to give up the coin every time, so the way it happens must differ chapter by chapter.
4. Tom predicting the hole and the bulb, and Tom under the block, will happen in every chapter unless later chapters give those beats to someone else. Chapters 6, 7 and 8 did.
5. Puns: 34, twelve of them in chapter 6. The writer told Tom three or four of chapter 6's are weak ("pulled her weight", "earth tones", "no zest"). First candidates for the end pass. With Tom's 2026-11-14 note, the pun-counting lines in chapters 5 and 6 are candidates too.
6. Nara physical comedy: 27. She is in every Los Angeles chapter.
7. Someone counting or writing it down (28), callbacks (25), kid sight gags (29) and running gags that pay off at the end (24) are the four biggest rows. Grace's chart and Bernadette's clipboard will keep feeding the first one.
8. New after chapter 8: the sweetness itself is not a row, but it is the thing Tom noticed. Chapters 1 to 7 have a tender beat in most scenes. If he asks for an end pass, that is its first job.

## 11. Chapter 6 assets and build (2026-11-14, the chapter 6 build conversation)

Status: STAGE 1 (ASSETS FIRST) DONE AND PUSHED to main as build ch6assets1 (2026-11-14 10:55, commit 280afbf). Nothing in the game itself changed. Stages 2, 3 and 4 are not started.

Art library (ADMIN > ART LIBRARY, group "Chapter 6", 33 entries, all draft). Prompts are in tools/art-library/ch06-prompts.js, registered in make-prompts.js and spliced into data/art-prompts.json (998 entries in all, validate.js OK). Entry ids: ch6-picnic-grey, ch6-orange-block, ch6-block-crack, ch6-coin-clean, ch6-coin-crusted, ch6-jar-coin, ch6-crock-empty, ch6-crock-full, ch6-phone-crock, ch6-acorn-x, ch6-gold-ball, ch6-lemon, ch6-lemon-tree-color, ch6-hat-stand, ch6-dragonfly, ch6-fish-splash, ch6-kickball, ch6-sneaker, ch6-twig-plain, ch6-corkboard, ch6-videocall-frame, ch6-squirrel-ordinary, ch6-chairman-shrink, ch6-ribbon, ch6-peanut-normal, ch6-bernadette-bag, ch6-tnb-dirt, ch6-rose-coin, ch6-boppy-rod, ch6-boppy-soaked, ch6-amy-catch, ch6-nara-story-1, ch6-nara-story-2.
- Already built and NOT asked for again: the Old Oak Park plate with the picnic lawn, the Chairman sheet, the three lookout sheets (Peanut Gallery, Twig Spy, Cheek Stuffer), Bernadette, Nara's frames from chapters 2 and 5, the megaphone and hill normals, and the colour plates behind the grey patches.
- Entries added beyond the section 6 table: the acorn X, the gold ball, the sneaker, the kickball, the lemon, the hat stand, the dragonfly, the fish splash, the plain twig (several of these are small props the return scenes need).
- Where a picture must match approved art, the entry attaches that approved file as a reference (blocks and coins match each other, the crock matches the phone photo, the ordinary squirrel matches the Chairman).
- Mismatch to know about: the built Chairman art has a throne, robe, top hat and monocle. The locked story has no throne and a ribbon tie. The shrink sheet (ch6-chairman-shrink) leaves the throne and robe out. Stage 3 decides what the live Chairman wears.

Voice library (ADMIN > VOICE LIBRARY, Chapter 6, Show > No clip yet): 179 lines with a written direction each, in tools/voice-library/scripts/ch06-story-directions.json and listed in harvest.json (src scene:ch6..., travel:ch6:flight). 155 NEW, 24 reworded. By voice: Tom and TNB carry most; Deedee, Boppy, Amy, Grace, Rose, Olivia, Bernadette (voice penny), Chairman Cheeks (bigone), Twig Spy (skeeter) and Cheek Stuffer (mudling) have the rest. Two Chairman alternates for a win by hitting are in. "Tiny voice" (the door squirrel) uses the Cheek Stuffer voice (mudling) because the ElevenLabs account is at its 30 voice limit. A hand count of the story file's NEW and CHANGED lines came to 179; the story file's own tally said about 153 new and about 23 reworded, so a few lines the writer counted as KEEP got a fresh direction too. Directions follow Tom's tag model: one tag per clause, [punchline] before the pun, a CAPS stress word, Deedee brackets carry "warm Long Island accent", Amy and Boppy accents are added by the index builder.
- Rule conflict, on purpose (same as chapter 1): the "no unused voice" rule says a line must not be in the library before a scene plays it. Tom asked for the clips first, so they are in the library before the build. The stage 3 and 4 build must wire all 179 into scenes in the same change, or remove the ones it does not use. A harvest.py run before then would drop them.
- unused_voice.py: unchanged by this step (check 4 stays at 51, all from earlier work).

What Tom does now:
1. Open ADMIN > ART LIBRARY, filter to the group "Chapter 6", press Generate on each entry, then Approve each one you like. Start with ch6-orange-block, ch6-coin-clean and ch6-picnic-grey (the picnic table work in stage 2 needs those).
2. Open ADMIN > VOICE LIBRARY, filter Chapter 6 and Show > No clip yet. Record the lines (Takes, New take or Record my voice), keeping the bracket directions. Then Export pending and send the file back in this same conversation.
3. Or tell the chapter 6 build conversation to go on with stand-ins (stage 2, the block-breaking work, can start without the pictures).

Next session (stage 2): build the reusable block-breaking work (coin roll and click, gold cracks, block falling apart, colour ring across the map, boss and monster shrinking back, encounters off in a freed area) and show it to Tom on the picnic table. Prompt: "Read claude/story-build.md and claude/story-ch06.md. Continue the chapter 6 build at stage 2."

Files changed in this step: tools/art-library/ch06-prompts.js (new), tools/art-library/make-prompts.js, data/art-prompts.json, tools/voice-library/scripts/ch06-story-directions.json (new), tools/voice-library/harvest.json, data/voice-index.json (rebuilt), docs/CHANGES.md, data/build-history.js, engine/main.js and index.html (build tag only).

## 12. Chapter 7 assets and build (2026-11-14, the chapter 7 build conversation)

Written by the chapter 7 build conversation. It touches only the chapter 7 Live cell in the board and this section. Rewritten 2026-11-14 by the chapter 7 test session (build ch7t1), which folded in claude/next-addendum-ch7s2.md, ch7s3.md and ch7s4.md (those three are now history).

Status: ALL FOUR STAGES BUILT AND PUSHED, AND THE CHAPTER IS TESTED START TO FINISH (build ch7t1, main 4a42093). Chapter 7 is playable from the chapter-select jump. Tom has not played it yet. Every new line plays in the computer voice until Tom records it, and most new pictures are stand-ins until he approves the Library entries.

### What is built (one line per stage)
| Build | What |
|---|---|
| ch7assets1 | 27 Art Library entries (group "Chapter 7") and 232 voice lines queued, listed below |
| ch7s2 | Scene 0 (DEPARTURES[7] script: TNB, the kiss, Nara and the gold ball; ARRIVALS[7]: Tom pats the plane door, no built welcome), scene 1 SCENES.ch7Arrive (the chart unrolls, Rose rolls up in it), scene 2 SCENES.ch7Kitchen (six bulbs, chart over the table, everybody looks at Tom, the meteor, the pie crust). engine/scene-props.js draws the chart, bulbs and Rose-roll stand-ins |
| ch7s3 | Scenes 3 to 9: ch7Page (Grace questions Page box by box), ch7Stacks (whispers, ear-covering row with the approved ch7-ears-row picture, the hall: sheet, WET FLOOR sign, block, round hole, quiet grey shelf), story time, three wings, the door ("A dry old voice"), the Unread (VOLUME ONE, gold edge), ch7AfterBoss (coin close-up, Tom's warning, the four conditions, the bookmark swap). Long coat, checkout card and coinFind 5 removed |
| ch7s4 | Scene 10 SCENES.ch7Hall (Tom carries the book, Grace puts the coin in, the cart drops onto four wheels, seven books land, the cart rolls into Tom's shins, the book shrinks in his arms, whispers stop shelf by shelf, Rose rides the cart, volume two, the pop-up dragon) and scene 11 ch7End (Deedee and Boppy walk in as quiet bench guests, the cookie, the seventh bulb and its card, TNB's text as spoken lines). Encounters off in the Stacks after the break |
| ch7t1 | The full test and the fixes below |

### Tested in ch7t1
- New `tools/ch7_test.py` (`LAYOUT=portrait` or `landscape`, output folder as argument) plays the chapter through its own triggers from `chapterJump(7)`: taxi landing, the Square, walking into Deedee's house and the library, the STAFF ONLY door, the three wings with real fights (won quickly), the catalog close-up solved by clicking the cards, the Reading Room doors, the boss, the coin reveal, back down to the hall, the block break, up to the library, the end card. It saves every dialogue page and contact sheets of 12. About 7 minutes per orientation.
- Portrait and landscape: FAILS [], no page errors, Grace gets the Gold Library Card, Deedee and Boppy leave after, no monster left awake in the Stacks or the Reading Room. Every scene's frames were looked at in both orientations. smoke FAILS: [] on the merged main.
- NOT covered by the jump and not played in ch7t1: scene 0 (the goodbye at the LA cab stand and the flight; ch7s2 tested it with a trip test) and the optional story time in Picture Books.

### Fixed in ch7t1 (what Tom would have seen)
| Where | Was wrong | Now |
|---|---|---|
| Chapter-select jump | Played the generic taxi welcome, so the girls ran up twice and Tom never patted the plane | The jump plays the chapter's own landing (ARRIVALS[n], engine/chapter-select.js). Also changes the jumps for chapters 4, 5, 6, 8 and 9 to their real landings |
| The Square | The unrolled chart was hidden under the dialogue box | Camera tile moved down; a held camera may slide past the bottom of an outdoor map (engine/overworld.js) |
| Page, and the ending | Page walked up beside Tom and pushed Grace up behind the low shelf | The three are placed three rows below Page. In the ending Deedee walks in past them and Boppy stops at the front |
| The Stacks | Three monsters were walked into the hall and walled the party off: Tom and Grace never reached the block | The Stacks monsters hold still for the scene. Tom stands one tile left so the WET FLOOR sign is not drawn over him |
| After the boss | The party stood left of the dais, off the phone screen, for the whole scene | Placed in front of the lectern with the camera on them; Tom turns to Grace when he stops her |
| The hall | Grace never moved (the only way round to the hole was blocked by Page and Tom) and the coin rolled in from the far side | Grace walks first, Page stands one tile right, stray monsters are moved off, everyone holds still for the break. Grace stands in front of the block facing it, and the coin starts at her feet |
| Deedee's kitchen | In landscape the chart and Boppy were cut off at the right edge | Camera moved right |

### Stand-ins (need Tom's Art Library approvals)
Chart strip, chart over the table and the corner note (ch7-chart-rolled, -unrolled, -table, -corner); Rose rolled up and Rose's story frames (ch7-rose-poses); six and seven bulbs (ch7-bulbs-six, -seven); Tom's door pat, pulling the sheet, carrying and holding up the book (ch7-tom-poses: today the ordinary sprite and two thuds); Grace at the hole, offering the bookmark, holding the card (ch7-grace-poses); Nara dropping the ball (ch7-nara-ball); the grey Stacks (ch7-stacks-grey: today the plate greyed in a circle); Boppy in the doorway and with the cookie (ch7-boppy-door, -cookie); the ordinary Know-It-All, Shusher and Dog-Ear pictures after the break (ord_know is a hue stand-in). Approved and in use: ch7-ears-row, ch7-coin, ch7-orange-block, the sheet and sign, the neat cart and the cart with Rose. Deedee's junk drawer has no picture at all.

### Known small gaps (not fixed, my call: none blocks play)
- Grace's line in the ending is "NO late fees. EVER." in the game and "NO LATE FEES. EVER." in the script; same words, different capitals. She does not hold up the card (no frame yet).
- In the hall a held Shusher can stand at the right edge of the picture during the break; it turns into an ordinary book with the others when the ring passes.

### Assets queued in ch7assets1 (unchanged)
Art Library, group "Chapter 7", 27 entries (tools/art-library/ch07-prompts.js): ch7-stacks-grey, ch7-orange-block, ch7-block-sheet, ch7-wet-floor-sign, ch7-coin, ch7-cart-neat, ch7-cart-rose, ch7-chart-rolled, ch7-chart-unrolled, ch7-chart-table, ch7-chart-corner, ch7-bulbs-six, ch7-bulbs-seven, ch7-card-bulb, ch7-bookmark, ch7-books-ordinary, ch7-unread-ordinary, ch7-unread-boss, ch7-tom-poses, ch7-grace-poses, ch7-rose-poses, ch7-ears-row, ch7-page-sheet, ch7-boppy-door, ch7-boppy-cookie, ch7-nara-ball, ch7-phone-girls. Voice Library, chapter 7: 232 lines with directions (tools/voice-library/scripts/ch07-story-directions.json), all now played by a scene. Voices: Page pagew, Whispers page, the Unread and "A dry old voice" log, Cliffhanger bigone, Know-It-All grump, Sol sal, "A picture book" mudling (the ElevenLabs account is full at 30).

### What Tom does now
1. On the phone: Menu > Chapter Select > Chapter 7 > START CHAPTER 7. Play it to the end card. Say what is not funny, not clear or not him, one thing at a time.
2. Art Library, group "Chapter 7": press Generate, then Approve, starting with ch7-tom-poses, ch7-grace-poses, ch7-chart-unrolled and ch7-bulbs-six (the stand-ins seen most).
3. Voice Library, Chapter 7, Show > No clip yet: record, Export pending, send the file to the chapter 7 conversation.

### Next chapter 7 session
Take Tom's play feedback one objection at a time (section 2B steps 6 and 7), fixing the game and claude/story-ch07.md together; install approved Library art in place of the stand-ins; merge his clip export. Retest with `python3 tools/ch7_test.py` and `LAYOUT=landscape python3 tools/ch7_test.py` before every push. When Tom is happy, mark chapter 7 PLAYED in the board. Prompt: "Read claude/story-build.md section 12 and claude/story-ch07.md. Chapter 7 play feedback: <what Tom saw>."
