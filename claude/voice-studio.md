# Voice Studio and the from-scratch chapter method (current as of 2026-11-17 13:35)

START HERE for any story-writing session. THE METHOD NOW LIVES IN claude/story-method-v2.md (standing, written 2026-11-17 after Tom said he cannot review every scene). Read it, claude/story-benchmark.md (every mark Tom has given, as a test), and claude/story-engine-capabilities.md (what action lines may show; verify against the repo). Section 5 below is the OLD process and is replaced by story-method-v2.md; the rest of this file is still correct reference.

Tom's rules (2026-11-17): chapter 1 was repurposed from the game. Every chapter after it is written from scratch, using only the story milestones of the old chapter. No old dialogue and no game lines carry over. Recorded clips do not matter: he re-records. He does not want to decide or mark scene by scene; he reacts once per finished chapter. The Voice Studio example lines and approved samples show a STYLE, never exact text: do not copy them. Every joke must work in the spoken words alone, and action lines may only use what the game already shows. Never ask Tom to choose; make the call.

## 1. Where the voices live
- claude.ai artifact "Voice Studio", slug 5b10727d-815c-473e-9bd4-38498079edde. Three views: Cast, Pairs, Whole show. Tom uses Claude in Firefox on his computer, not the Claude app.
- The live settings are in the artifact's database. Read them with the artifact tools (db_list / db_get) on that slug: collection `voices` (one document per character), collection `pairs`, document `config/global`. The database is the source of truth.
- Snapshot of everything as Tom left it on 2026-11-17 12:55: claude/voice-studio-settings-2026-11-17.md (four parts). Use it when the database tools are not available, and re-read the database when they are.
- To change a document with db_write: read it first, pass its version, and use merge so his other fields are untouched. Tell him to reload the page afterward, because an open page saves its own copy of the whole document.
- Tom's audition is approved in the database as of 2026-11-17 20:59 UTC.

## 2. What a character's settings contain
Who they are, background, how they are funny in one sentence, a blend of up to three fictional references with percents, SIGNATURE MOVES, 8 humor sliders and 8 talking sliders (0 to 10), how they act in five moods, running bits each with a frequency, words used and never used, Always and Never rules, inside jokes, lines pinned Sounds right and Sounds wrong, and six approved sample lines. Signature moves record how a line is built mechanically; build from that mechanism, not from the move's example line. Pairs hold how two people are together, who sets up and who gets the laugh, teasing and affection sliders, what never happens between them, and pinned exchanges.

## 3. State of the cast on 2026-11-17
Tom (approved), TNB, Grace, Rose, Amy, Deedee, Boppy, Justin, Olivia, Aunt Ellie, Nara, Bernadette all have entries; Grace, Rose and Amy have no moves yet. Pairs set: Deedee and Boppy, Grace and Rose, Tom and Amy, Tom and Bernadette, Tom and Deedee, Tom and Grace, Tom and Rose, Tom and TNB. Near-duplicate moves exist for Deedee, Nara and Bernadette: treat each pair as ONE move. Where a line is in both the approved set and the wrong list, the wrong mark wins. Speakers in chapter 2 with no voice entry yet: Mr. Washington, Miss Odette, Doña Carmen, the Big Shake, the Smoglet, the Ticket Flurry, the Canyon Coyote. Proposed entries are in claude/story-ch02-pitches.md; Tom said yes to the pitches on 2026-11-17, add the entries to the Voice Studio.

## 4. How a line is written from the settings (still valid as the reviewer's checklist)
1. Filter: the speaker's Never and Always rules, words never used, the pair's Never rules, the whole-show rules.
2. Firm rules: any slider at 0 to 2 or 8 to 10 is a rule.
3. Situation: the matching mood entry decides what the person does.
4. SENSE FIRST. Every sentence describes something that can literally happen and is understood at once.
5. Most lines are plain talk. At most one line in three is a joke, built from one of the speaker's moves, one move per line.
6. A pun must read as a normal, sensible sentence to someone who misses the pun.
7. No invented props or events beyond one small thing the moment needs.
8. A pet name or catchphrase at most once per person in a scene, unless Catchphrases is 8 or more.
9. Pair settings decide who sets up and who gets the laugh.
10. Running bits are counted per chapter against their frequency.
11. The line must sit beside pinned right lines and unlike pinned wrong lines (claude/story-benchmark.md).
12. Every line gets a delivery note and a voice script in Tom's tagging style: bracket tags inside the sentence where tone changes, capitals on the stressed word, a [punchline] tag where the joke lands, voice qualities only, never physical actions. Model: tools/voice-library/scripts/ch02-story-directions.json. TNB's brackets always carry mellow, laid-back, low-key, with no capitals and no exclamation marks.

## 5. (replaced) How a chapter gets written
See claude/story-method-v2.md. Summary: pitches (done for chapter 2) then a writing loop with three or more candidates per exchange, judged by a separate reviewer agent against the benchmark, then ONE review page for Tom per chapter; unmarked counts as accepted; every mark goes into the benchmark and configs. Review page format: claude/story-writing-method.md, "The review page" (chapter 1's page is artifact c1b20d24-a5dd-40a2-b94c-2e391cd42d3b).

## 6. Chapter 2 status
Pitches approved by Tom 2026-11-17 (claude/story-ch02-pitches.md): 10 scenes. Sample scene (the loft) is written and reviewed: claude/story-ch02-sample-loft.md, version 4. Next: write scenes 1 and 3 to 10 with the v2 loop, publish one review page, Tom reacts once. The older drafts and the artifact d2924d13-7cd1-4c82-98d1-adb74a6f2ee2 are dead.

Chapter 2 milestones to keep: Tom flies back to Los Angeles after the weekend (chapter 1 ended on TNB's text about weird purple smog over 2nd Ave). He and TNB reunite. Nara has been left with them. Purple smog comes down onto 2nd Avenue and the neighbors get stuck repeating themselves. Smog creatures appear and talk, the first monster TNB has seen. They follow the smog up Griffith Park, find a grey lemon tree with one lemon in a hard orange block, a small round dent in it and a burnt flashbulb, the same as the dragonfly at the pond. The hill under the Observatory has woken up after a flash that morning: the Big Shake. It is lonely and is won over with kindness. It gives up a gold coin with a lemon on it, which Tom keeps. The smog clears and the neighbors are themselves again. The lemon stays in its block. Nobody connects the coin to the block yet.

Tom's dial-way-back list still applies: the 2,475-mile correction, SkyMiles, sourdough and Bready Mercury appear rarely.
