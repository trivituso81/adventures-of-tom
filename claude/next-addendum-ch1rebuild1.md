# ch1rebuild1 (2026-11-17, main 7a0f5b6): chapter 1 rebuilt to the locked script

Detail for the next session. The repo entry is the first `## ch1rebuild1` heading in docs/CHANGES.md.

UPDATE 2026-11-17 19:40, ch1tags1 (main 33f803f): 10 chapter 1 voice scripts were retagged against Gemini's ElevenLabs v4 research. Read claude/next-addendum-ch1tags1.md before touching any chapter 1 voice script. The repo script file wins over the "Voice scripts" section of claude/story-ch01-draft2.md.

## What was built
Scenes (data/scenes.js): ch1Goal, ch1Amy, ch1Ellie, ch1Theft, ch1Mudling, ch1Spot, ch1Pond, ch1AfterBoss (BOO scene), ch1End, ch1Job (8a, Row door), ch1Sunday (8b, Square). 11 new triggers (ch1-goal, ch1-amy, ch1-ellie, ch1-theft, ch1-t1, ch1-spot, ch1-pond, ch1-after, ch1-end, ch1-job, ch1-sunday). 95 locked lines word for word. Squishy beat and the 7 intro lines untouched.

## Engine changes
- engine/battle2.js: `startBattle` takes `opts.count` (3 Mudlings in one fight); pan strings reworded.
- engine/story.js: `battle` op passes `count`; `storySpawn` takes `sheet` and `kin`.
- engine/boss-finale.js: `bossSettle` returns false for bigone (the fish stays gone after the BOO scene). BOSS_FINALE.bigone data and art `ending-bigone` are now unused.
- engine/scene-props.js: `SPK.muffinpan` and `SPK.papers` (code stand-ins). STORY_PROPS `pan` and `muffins`, `STORY_CROWN` returns pan.
- Removed: rhubarb crumb trail (plate.js, prop-art.js, art/props/hollow/trail_*.webp, tools/crumbs_test.py, bake_hollow_crumbs.py).

## Voice and data
- Directions: tools/voice-library/scripts/ch01-story-directions.json holds the 95 scripts: 85 verbatim from the locked file, 10 retagged by ch1tags1 (see the update above). 42 of the locked scripts break the v4 tag rules in apply-scripts.py (descriptor over two words, three descriptors in one tag, body words like "pointing" or "yelp"). Kept as locked; if Voice Studio needs them rewritten, that is a separate decision.
- Purged: 1 clip, `tom|I'm trying, Rose. Please don't tell Grace I lost to a marble.` Other old lines had no clips. unused_voice.py reported 0 on all checks at the time (ch1tags1 later saw 93 on check 4: see its addendum).
- tools/voice-library/harvest.json was NOT replaced by a fresh harvest.py run (a fresh run drops lines other sessions queued). It was patched: committed file, minus the 95 old ch1 lines, plus the new ones.
- Emotion: 95 rows in docs/emotion-index-lines.tsv (The Big One and Mudling set to none: not portrait speakers). `emotion-apply.py $(seq 1 21)` stops on 56 pre-existing MISSING rows (ch2 to ch10), so data/emotion-moods.js was generated with the check made non-fatal on a temp copy and the diff was confirmed to touch chapter 1 keys only. docs/emotion-reactions.tsv and docs/talk-lines.tsv were edited as text (a csv rewrite breaks the quoting of rows with quotes).
- Talk: 88 new rows in docs/talk-lines.tsv, `talk-apply.py` run. NOT `talk-index.py --add` for the whole file (it adds 558 rows for other chapters).
- Listener reactions for the 95 new lines are NOT written (docs/emotion-reactions.tsv has no ch1 rows for them). Characters show no listener moods in chapter 1 until rows are added.
- Script Editor: docs/script-convos.tsv ch1 rows rewritten (16 conversations with purposes); build.py reports 0 to fix.
- Art Library: 11 entries added to group "Chapter 1" in data/art-prompts.json by hand (make-prompts.js still fails in the sandbox: npc-prompts.js). validate.js fails on `clip-rose-strike: bad tab Clips`: pre-existing from the clip work on main, not this build.

## Stand-ins and known wrong
- The Big One's painted sheet has a baked tin cap; the muffin pan is drawn over it in code and comes off in the BOO scene, but the baked cap stays. Replace with the Library entry ch1-bigone-green-pan (the locked script says bright green; the game fish is blue).
- Heist frames still show a pie tin; the battle UI still draws the old tin ellipse; townsfolk and Ellie quest lines still say "pie tin" (Tom said to leave them).
- Muffin pan, muffins, papers, Mudling holding muffins, Grace's list, Amy's window, Ellie's open door, Rose on shoulders, cab shot, phone on seat: code stand-ins or no picture. Rose stands beside Tom (not on his shoulders) in scene 1.
- Pan prop in the BOO scene draws as a small grey strip at the bottom of the frame: check the arc on a phone.

## Test notes
- Harness cases are in claude/ch01-cases.json (reaction_test.py format). Start the three-page `ch1Reveal` scenes with a leading `!SCENE_OPS.ch1Reveal=o=>S.call(()=>{})` because the harness cannot press A on a close-up. Run boss, end/job, sunday one at a time; the whole set in one call times out.
- Frames looked at in portrait only. Landscape frames of ch1Theft, ch1Mudling (three Mudling placement), ch1Pond and ch1Sunday still to look at.
- tools/smoke.py: FAILS: [] before and after the rebase.

## For Tom's phone play
Play from chapter select, chapter 1. Look for: Boppy at the table, Aunt Ellie at her door, the three Mudlings, the BOO scene, the pan flying off, the lap around the Square and the chapter card. Record the 95 lines (Voice Library chapter 1, Show > No clip yet): Grace 20, Tom 18, Rose 16, Deedee 14, Boppy 10, Aunt Ellie 7, Big One 6, Amy 2, Mudling 1, TNB 1.
