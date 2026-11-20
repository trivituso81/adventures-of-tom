# board3 (2026-11-19, pushed as board3): facts for sessions

Plan: claude/board3-plan.md and claude/board2-plan.md section 8. Repo CLAUDE.md has the short rules. These are the rules that ADD to claude/handoff-rules.md section "The board" (that file was not edited in this session; read this addendum with it).

## Rules for every session
1. Read the card you work on AND the Tom cards that blocked it (data/board.json): his `note`, `answer` and the history lines are his feedback. He never goes back to the conversation that made a card.
2. Every Tom card has `ask`: play, pictures, animations, voice, script, decide, setup. Decide cards: `choices` (2 to 4, first ends "(Recommended)") and one `leads` line per choice. `fyi: true` if the card blocks nothing. `paste` holds text he copies (the setup card uses it).
3. The card you ship needs `after`: a Tom card id (created in the same push, with its ask) or "nothing for Tom: <next Claude card id or end>". `board_check.py --push <tag>` stops without it (tags starting `board-` are exempt).
4. A session that ends without shipping writes one history line saying why and moves the card to Stuck with what it waits on.
5. `auto: true` only on Sonnet 5.5 medium cards (the check enforces it). Such a card starts by itself when Tom's tap unblocks it.

## What the job does now (tools/board_sync.py)
- R1 also copies `answer`; R10 makes a Claude card "Handle Tom's note on ..." when a Tom card that blocks nothing is finished with a note.
- R2 `done_when {"clips_reviewed":"Chapter N"}`: all clips of the group approved or rejected, at least one reject with `from: review` since the card was created, and 20 minutes since the last one. An all-fine review: Tom taps I did this.
- R8 quiet after 6 hours. Workflow also runs hourly.
- R9 start: `start: true` on a card makes the job POST the card id to the Claude task's /fire address (secrets CLAUDE_TASK_SONNET_MEDIUM_URL and _TOKEN; header anthropic-beta experimental-cc-routine-2026-04-01), set `chat.url` from `claude_code_session_url`, move the card to In progress. `routines[].enabled` in data/board.json is set by the job from whether the secrets exist. Answers are cached in /tmp/board-fired.json so a retried push does not start a card twice.

## Not proven yet (card c-starttest, starts by itself after Tom's setup card t-startsetup)
1. A started run may not read the Project docs. 2. It must push to main with no person approving. 3. The job must reach /fire. If any fails twice: stop-loss; fallback is Copy prompt (already there for every card).

## The fixed prompt saved in the Claude task
It is the `paste` field of card t-startsetup in data/board.json.
