# Project cleanup plan (2026-11-14, written by the housekeeping session)

## STATUS (2026-11-14 13:50): ALL DONE. Project about 1.27 MB of 2,000,000 bytes (target was under 1,500,000). No archive branch was needed.
Tom's decisions (2026-11-14 12:41, and full approval again 12:52) and what was done:
1. Old scripts, templates and patches (.py, .js, .html, .patch, .js.txt): DELETED without archiving, 66 docs. Done.
2. Image prompts (*-prompt.txt, *-prompts.txt, square-kit*, li-areas/*, moon-club-*, storybook-*, move-*-sheet-prompt.txt, *-prompt.md): KEPT in the Project, not deleted. Tom wants them preserved because the stop-loss rule relies on them. If the Project fills up again, archive these to branch `archive` (project/claude/<name>) first, push, verify with `git ls-remote origin archive`, then delete.
3. Voice and dialogue script JSON: checked against the repo (data/voice-index.json is built from tools/voice-library/scripts/directions-20261101.json, the v4 rewrite of all dialogue, plus recast1, zz-v4-overrides, docs/dialogue-scripts-ch11..19.json, battle-scripts.json, battle-overrides.json). The old pre-v4 files were DELETED as covered, including the last two (dialogue-scripts-arrivals.json, voice-baker-scripts-familylab.json, deleted 13:45 after Tom's go-ahead). Checked by structure and one sample, not line by line.
   - KEPT (not covered or not voice): dialogue-ch12-amber-delta.json, dialogue-clarity-rewrite.json, voice-tag-samples.json (Nov 2026 rewrites), music-scripts.json (music prompts), 46_tomhouse_geometry.json.
4. next.md condensed from about 45,000 to under 20,000 bytes (19,953). Finished builds are one line pointing to docs/CHANGES.md and the addenda; ORDER NOW, symptom pointers, Waiting on Tom, standing rules, tests and push procedure kept. Some long test recipes (room entries, amber spot cases, close-up test list) were dropped from it: they are still in docs/CHANGES.md or the test files themselves. Standing rules were NOT yet moved to the repo CLAUDE.md (needs a push; do it when a session has push access).
5. Everything else: not archived, because the size target is met. Still in the Project: all next-addendum-*.md, notes and the KEEP list below.

Earlier deletes (verified on main): claude/voicetags1/ch01 to ch05 story-directions.json, claude/patch-amberspot1.patch.

Lessons (do not repeat): helper agents do NOT get the Projects tool; only the main session can project_read. project_read returns text inline for every doc, so copying a doc out means the session re-writing it with Write (about the doc's size in tokens; roughly 40 to 60 docs per session). Push access: add_repo with access push works once Tom approves it in the chat.

## If the Project fills up again (at 1,500,000 bytes, run this before anything else)
1. Delete only what is covered elsewhere (the repo) or has no value, with Tom's OK.
2. Archive the rest: orphan branch `archive` in trivituso81/adventures-of-tom (never served, never merged), folder project/claude/<name>. Batches of about 30: project_read, Write to a local folder, git commit, `git -c push.negotiate=true push origin archive`, confirm with `git ls-remote origin archive`, then project_delete that batch. Biggest docs first.
3. After the first archive push, add the line to the repo CLAUDE.md and claude/next.md: "Old Project docs live on branch `archive` under project/. Read with `git fetch origin archive --depth 1; git show FETCH_HEAD:project/claude/<name>`."

## KEEP in the Project (the working set)
next.md, build-plan.md, canon-addendum.md, status.md, story-thread.md, story-build.md, story-build-ch02-05-assets.md, story-ch01.md to the newest story-chNN.md, part2-remap.md, voice-sheet.md, voice-rules.md, admin-ux-plan.md, closeup-plan.md, dc-objects-spec.md, this file, all image prompts (Tom's decision), and the addenda next.md names: voicetags1, facing1, cutfront1, cutstage1, close1, near1, item1, bossbig1, amber3, amberclear1, ch10vance1, introlib1, pets1, react2, clipfix1.

## Rule from now on
- A session's handoff note goes in the repo (docs/handoff/<tag>.md), not in the Project. The Project holds only the KEEP list.
- next.md stays under 20,000 bytes: finished builds move to docs/CHANGES.md, standing rules move to the repo CLAUDE.md.
- At 1,500,000 bytes, the session that notices runs the section above before doing anything else.
