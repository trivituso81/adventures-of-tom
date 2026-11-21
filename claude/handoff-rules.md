# How every next-session prompt is given to Tom (standing rules)

Read this before writing the closing lines of any session. RE-READ IT RIGHT BEFORE WRITING EVERY PROMPT, even if it was read at the start of the session: other sessions change it during the day (2026-11-18: the logic below was added at 15:35, and a session that had read the 11:08 version at its start kept handing out Fable High and then Opus Medium without applying it; Tom, 16:22: "why do you refuse to size the job? ive already asked you to do this").

Tom, 2026-11-18 11:08: "you must ALWAYS tell me the effort level whenever you give me a prompt, no exceptions. along with prmpt to paste, you need to tell me what i need to do BEFORE i execute the prompt - ALWAYS"

Tom, 2026-11-18 15:13, after a long calib3 reply that did contain the steps, mixed in with tables and findings: "all of that an no clear instruction of what to do before the next prompt". A list he has to dig for counts as missing.

Every time a prompt to paste is given, in any reply, it comes with all five of these, in this order:

| # | Item | Notes |
|---|---|---|
| 1 | What the next session will do | Two lines (Project instructions). |
| 2 | Before you paste | A numbered list of everything Tom must do first: files to attach (named), things to record or export, things not to delete, settings to change. If there is nothing, write "Nothing to do first." Never leave this out. |
| 3 | Model | The recommended Claude model, by name, chosen by the logic in the last section, with the row letter and a reason of a few words. |
| 4 | Effort level | The recommended effort setting (low, medium, high, xhigh or max), chosen by the same logic, as its own decision. No exceptions. |
| 5 | The exact prompt to paste | In a code block, complete, nothing for Tom to fill in. |

A prompt given without the before-steps or the effort level is an error, even when the prompt is repeated from an earlier reply. A model or effort copied forward from an earlier prompt, instead of worked out from the logic below for this task, is also an error.

## Where notes go (projclean1, 2026-11-21; applies to every session)

The claude.ai Project filled to 97% (card c-projclean), so every working doc now lives in the repo's claude/ folder (index: claude/INDEX.md, rebuilt with `python3 tools/claude_index.py`). The repo copy is the original. The Project keeps only four mirrors: claude/handoff-rules.md, claude/next.md, claude/canon-addendum.md, claude/build-plan.md; a session that changes one writes the same text in both places. Never create a new Project doc: handoffs, addenda, plans and prompts go in the repo's claude/ folder in the same push as the work. To find an old note, grep the claude/ folder or read INDEX.md.

## The board (Tom, 2026-11-19 10:05; built as board1, made automatic by board2 the same day; applies to every session)

Tom's words: "a kanban style board that i can refer to at anytime ... lanes for you, me, and each external dependencies ... greater clarity on all the different items in flux so i can understand the status and ensure im not a blocker or that a thread dropped". And, 15:31: "I want to create a seamless flow where cards are on the board and moved automatically and there are easy ways for me to initiate next steps with you. The issue is I'm losing track of all the conversations we have going in parallel". It is ADMIN > BOARD in the game (`board.html`), data in `data/board.json` in the repo. Facts, fields and tests: claude/next-addendum-board1.md and claude/next-addendum-board2.md. Design: claude/board-plan.md and claude/board2-plan.md. claude/pending-my-action.md is retired: do not add rows there.

**The board follows the repo (board2).** The GitHub job `board-sync` (tools/board_sync.py) moves cards from what happened: Tom's Art Library approvals, a `## <tag>` heading in docs/CHANGES.md, a finished blocker, a running Action, a new report. Tom never moves a card and the page has no "Move to". A session's part is small and fixed:

1. **First push of the session: `board: start <card id>`** (a commit whose subject starts with those words, changing the card to In progress is done by the job from the commit; the commit's `Claude-Session:` line becomes the card's chat link). Do it before any work, so the Conversations strip shows the chat from minute one. If the request is a new item, add the card in that first push (lane, theme, tag, next step, and for Claude work the full prompt).
2. **Every Claude card has a `tag`**: the build name its session will push. The `## <tag>` heading in docs/CHANGES.md closes the card; `<tag>` plus one letter (clipgate2a for clipgate2) marks a part shipped and leaves it In progress. `bump_tags.py` stops a push whose build is on no card.
3. **End of session:** write the result into the card's `next` and history, add or rewrite the next card with its full prompt (no `<` blank for Tom to fill in; the board check refuses it), then tell Tom in two lines what happens next and where. The job does the moving.
4. **A stale card you find is yours to retire**: move it to Done with a history line saying why, and say so in the reply. Do not wait for Tom to say so.
5. A Tom card that blocks a Claude card lists that card in `blocks` AND names it in its `next` in plain words. A Tom card that finishes by approving pictures carries `done_when {"art_approved":[entry ids]}` so the job closes it.

**Check every request against the board (Tom, 2026-11-19 12:42: "for any conversation i initiate, check against the board to see if it's an update or change to an existing item, or a new item needs to be added"). Also in the repo CLAUDE.md.**

- Start of EVERY session, whatever Tom opens with (a task, a report, feedback, a question): read `data/board.json` (from the clone, or https://raw.githubusercontent.com/trivituso81/adventures-of-tom/main/data/board.json when no clone is needed) and decide which one his request is. Say it in the first line of the reply: "Board: updates card <title>", "Board: new card <title>" or "Board: no change".
  - **Update or change to an existing card**: more work on it, feedback on it, it is finished, or it is no longer wanted. Change that card (rewrite `next`, add a history line quoting his words, retire it when unwanted). If the request makes other cards obsolete, retire them too.
  - **A new item**: work that will outlast this reply (a build, a fix, something Tom must do or decide). Add the card in the same push, complete.
  - **No change**: a question, a lookup, a one-off answer.
- If Tom has clearly finished a card (he sent the file, made the decision, said he played it), move it to Done; if unsure, ask in one line.
- A session that does not otherwise push (a planning chat) still pushes the board change alone, build tag `board-<short>`. Re-read the file right before writing and merge: other sessions, the job and Tom's phone edit it. Run `python3 tools/board_check.py` before pushing.
- A card Tom must act on: lane Tom. It names the exact screen path in `next` ("ADMIN > BATTLE LAB > CHAPTER 1 REVIEW, PLAY ALL, REDO with notes"), one action per card, and which file goes back to which chat. Tom's buttons are "I did this" (with an optional note for the next session), "Claude takes this" (his one line becomes a Claude card) and "Not needed".
- A card the next session does: lane Claude, with `prompt` filled in exactly as this file's five items require (what, before steps, model with row letter, effort with reason, the prompt text, ending "Attach trivituso81/adventures-of-tom with push access (add_repo)."). If it waits on Tom, column Waiting, `waiting_on: "tom"`, and Tom's card blocks it.
- An external service (xAI, ElevenLabs, GitHub, or a new lane added to `lanes`): the job puts a card there while a run is going and removes it when the run succeeds; a failed run becomes a Claude card in Waiting. A session adds one by hand only for a wait the job cannot see (out of credit).
- **Build name on Play and report cards (buildname1, 2026-11-20; Tom: "for items that require Play and report, include the Build name the change is included in").** The board page shows `Build <name>` on a Tom card with ask play, in the card preview and at the bottom of the details sheet. The name is the `tag` of the Claude card whose `after` is that card (newest shipped wins, so a fix's build replaces the first one); a Tom play card with no Claude card pointing at it can carry a `build` field. Nothing for a session to do beyond setting `after`. Test: `python3 tools/board_build_test.py`.
- Themes: only the nine in the file's `themes` list (Voice Clips, Battle Animations, Battle System, Areas, Characters, Story and Dialogue, Game Shell, Tools, Project Ops). Do not invent one; use the closest and tell Tom in one line.
- Identify the chat: the first push sets `chat.url` (the job copies it from the commit); set `chat.opening` to the first words of Tom's opening message in quotes. If no session link is in context, leave `url` blank and say so in the history line.
- Last line of the closing reply, always: "Theme: <theme>. Pending your action: yes." (a card is in Tom's lane) or "Theme: <theme>. Pending your action: no."
- Write cards in plain words, one action per card.
- A Tom card that sends Tom to the Art, Voice or Music Library carries `links: [{to: "art"|"voice"|"music", ids: [...], label}]` (art: entry ids; voice: line keys or one `{chapter, show}`; music: track ids; a card with `done_when.art_approved` needs none for art). The board page makes them buttons that open that exact entry; `board_check.py` refuses a card that names a Library with no link. The "ADMIN > ..." words stay in `next`.
- **New card (newcard1, 2026-11-20; Tom: "create a new card on my own that then creates a Claude prompt with the appropriate model and effort level. Automate as much as possible").** `+ New card` on the board: Tom types one idea (a screenshot is optional) and the page makes a Claude card by itself: the name, the theme, the model and effort by the logic at the end of this file (`sizeIdea` in `board.html`), the full prompt, id `c-idea-...`, tag `idea-...`, his words in `idea.words` and the history. A size START can run (Sonnet 5.5, medium) starts by itself unless he unticks it; any other size shows Copy prompt with the model and effort. He can change theme, model and effort in the form; a change is saved as "your choice on the board". The page only reads his words, so the session that takes an idea card checks first: (1) the size, against this file's logic (clearly a different model: rewrite the card's prompt, push, tell Tom in two lines, stop); (2) the open cards (already covered: move his words to that card, retire the idea card); (3) then rewrites the title and next step in plain words and does the work. **When the tables below change, change `sizeIdea` and the `SIZES` list in `tools/board_newcard_test.py` in the same push.** Test: `python3 tools/board_newcard_test.py`.

## The night shift (night1, 2026-11-21)

Between 11 pm and 3 am Los Angeles time the board job starts queued cards on Sonnet 5.5 medium by itself (rule R14 in `tools/board_sync.py`; at most `night.max` = 5 a night, one at a time, standing `nightly` cards first, then fix cards made by a night test, then the oldest queued card). A card is never started at night when it is in the backlog, has `night: false`, waits on an open card, is a paid run, or is not Sonnet 5.5 medium (taste work is Opus, so it never runs at night). A standing card never goes to Done: its builds are named `<tag>-<mmdd>`, the heading in docs/CHANGES.md returns it to Up next, and a run with nothing to do pushes only `night: ran <card id>`. Tom reads one card each morning, Last night (`t-lastnight`, ask setup, fyi). Switch: the Night shift ON or OFF chip on the board page. Plan: `claude/night-plan.md`; CLAUDE.md section "Night runs".

## A session that stops without shipping (attn1, 2026-11-20)

If a session stops without shipping its card, its last push must do one of two things: move the card to Queued behind a Tom card it creates (one action, with its ask), or write a history line containing "ended without shipping" with the reason. The board job rescues a card that goes quiet anyway (one automatic Sonnet 5.5 medium session per card, 4 a day, then a "Stuck twice" card for Tom): claude/attn-plan.md, claude/next-addendum-attn1.md. `tools/board_check.py` cannot see this rule, so the rescue is the backstop.

## How the before-steps are written (added 2026-11-18 15:13)

- They sit near the top of the reply, right under the one line saying what was done, under their own heading "Before you paste". Nothing else is in that list.
- One action per step: the screen, the button, what he should see. Only steps the next session needs. A check that is nice to have (listen to a line, look at a scene) goes in a separate short list marked optional, after the prompt.
- No scope he has to work out ("tune the next scene"). Say where to start and where the list is ("Show > No clip yet, from the top").
- The whole reply stays short. Findings, tables of results and reasons go in the repo's claude/ notes and docs/CHANGES.md, with at most a few lines in chat. If the reply needs scrolling to reach the steps, it is too long.

## THE MODEL AND EFFORT LOGIC (Tom, 2026-11-18 15:35, corrected 15:37; use it for every prompt)

Tom, 15:32, after a file cleanup was handed off with "Claude Fable 5.2, effort high": "why does this task require claude fable high effort (very expensive)?" It did not; the line had been copied forward.
Tom, 15:35: "you may have cuased me to use all my fable credits in one day. you need to remember that even thought i am an ultra user that i need my fable credits to last all week and that i should only use them when the tas is required. you need to now give me the full lgoic that you will use every time you give a prompt that detemrines which model and effort to use"
Tom, 15:37, on a first version that paired Opus and Fable with high effort in every case: "why are opus and fable only used with High effort". There was no reason. Model and effort are two separate choices.

Models, least to most expensive: Claude Haiku 5.5, Claude Sonnet 5.5, Claude Opus 5.5, Claude Fable 5.2. The logic uses that order only; nobody in a session has measured the exact credit cost of each model or effort level on Tom's plan.

**Step 1. The model: what KIND of work is it. Go through the rows from A down and stop at the FIRST one that fits.**

| Row | The next task is... | Examples in this project | Model |
|---|---|---|---|
| A | A question or a lookup. Nothing in the game or the repo changes. | "What does this doc say", a status summary, explaining a build | Haiku 5.5 |
| B | Carrying out steps that are already written down, with tests or a checklist to catch mistakes. | Purging replaced files, installing an enemy sheet, room or area paintings by their doc, installing approved Library pictures with an existing bake script, applying his script edits, merging voice takes, the next phase of a written plan, a backlog report with a clear cause | Sonnet 5.5 |
| C | A build or a fix where the steps are NOT written yet: the session must work out the cause or the design itself. | A new Library or admin tool feature, a bug with an unknown cause, a change that crosses several engine files | Sonnet 5.5 |
| D | Work Tom judges by taste, where a miss costs him review time or generation money. | Game dialogue and humor, voice tags, a prompt for a picture or video generator, a character's voice or art direction | Opus 5.5 |
| E | Fable only. One of the three conditions in step 2 must be true. | See step 2 | Fable 5.2 |

**Step 2. Fable 5.2 (row E) is recommended only when one of these is true, and the reply says which:**
1. The same task already failed on Opus 5.5, and it failed on quality or reasoning, not on a missing input from Tom. (The stop-loss rule's "a different model".)
2. It is a foundation that is expensive to undo for the whole game: the battle system's rules, the story's structure across chapters, an architecture decision other work will be built on.
3. Tom asks for Fable.
If none is true, the answer is not Fable, however hard the task feels.

**Step 3. The effort: how BIG and how UNCERTAIN is it. Chosen separately from the model; the same table for every model, Opus and Fable included. Medium is the default.**

| Effort | When | Examples |
|---|---|---|
| low | A lookup, or one known edit | Row A; changing one number or one line whose place is known |
| medium | The steps are known, OR the piece is small | All of row B. A few lines of dialogue fixed from his notes, one generator prompt edited from a version that worked, the tags of one scene (Opus, medium). A small follow-up to a foundation already decided (Fable, medium). |
| high | Something large has to be worked out with nothing written to follow | An unknown-cause bug, a new tool designed and built in one session (Sonnet, high). A whole chapter or scene written from scratch (Opus, high). A new rules spec or the story's structure (Fable, high). |
| xhigh, max | Never recommended, unless Tom asks, or a high attempt failed on a pure reasoning problem. Say so in the reply. | |

**Step 4. Move up only on evidence, and one dial at a time.** If a session fails the task: first raise the effort one step on the same model when the miss looks like too little thought; raise the model one step when the miss is about quality or judgement. Never start higher "to be safe", and never raise both at once.

**Step 5. Keep each conversation to one task and start a new conversation for the next one.** A long conversation costs more for every message on any model, because the whole conversation is read again each time. When a conversation has run long, say so and hand off, even mid-thread.

**Step 6. Say it in the reply:** the row letter and the reason in a few words for the model, and the reason for the effort, for example "Model: Claude Sonnet 5.5 (row B: written steps, tests catch mistakes). Effort: medium (steps are known)".

**Evidence log (add a line when a model or effort choice is proved right or wrong, so the tables are corrected by results):**
- 2026-11-18: Fable 5.2 at high wrote three Boop video prompts that all missed, by overcorrecting each time; a Gemini-written prompt worked. A stronger model and more effort do not fix a process mistake. Generator prompts stay in row D with the rule "Fix a miss with the smallest change" (repo CLAUDE.md).
- 2026-11-18 16:22: the roofnpc/partybanner session handed off "install approved banners plus chapter 1 leftovers" as Fable High, then Opus Medium, without re-reading this file (it had the 11:08 version). By the logic it is row B (bake script exists, leftovers have written approaches in claude/next-addendum-roofnpc.md, tests catch mistakes): Sonnet 5.5, medium. Fix: re-read this file before every prompt (top of the file).
