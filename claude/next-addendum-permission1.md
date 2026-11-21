# permission1 (2026-11-20): why add_repo is refused and what to do

Handoff written under the stop-loss rule after two wrong fixes in one session. Read this before the first add_repo of a session.

## What happened
- Tom's prompt said "full repo access granted for this investigation" (no repo name). add_repo (owner trivituso81, repo adventures-of-tom, access push) was DENIED by the Claude Code auto mode classifier, reason "Unauthorized Access".
- claude/next.md says every prompt should end with "You have my full permission to access the repo." That sentence is not reliable: it is general, and the classifier does not count the Project instructions' standing sentence either.

## Finding (from the Claude Code docs, not tested on Tom's screen)
- The classifier allows an action when the user's message directly and specifically describes the exact action. General requests do not count. So the working sentence names the action and the repo: "Attach trivituso81/adventures-of-tom with push access (add_repo)."
- This session is a Claude Code CLOUD session. Cloud sessions do not read ~/.claude/settings.json or .claude/settings.local.json, so a personal allow rule or autoMode entry does nothing there. The classifier also ignores autoMode in a repo's .claude/settings.json. Only organization server-managed settings reach a cloud session.

## What failed (do not repeat)
1. Told Tom to add an allow rule and an autoMode entry in ~/.claude/settings.json: not read in cloud sessions.
2. Told Tom to switch the mode dropdown from Auto to Accept edits at claude.ai/code/<session>: the page Tom opened has no Mode option, so the guess about his screen was wrong.

## Next session should
- Not send Tom hunting through settings or UI he has not seen. Do not guess his screen.
- Have Tom paste the exact-action sentence above in his prompt (one line, no setup). If refused twice, follow next.md: tell Tom at once, finish and test, save the commit as a patch in this Project, stop.
- Only if Tom asks for a permanent fix: it needs an organization admin (server-managed settings at claude.ai/admin-settings/claude-code), which Claude cannot do for him.
