# scriptconvo1 (2026-11-15, main 8f1ed28): Script Editor conversations and Workshop, all seven steps of claude/script-workshop-plan.md

Repo doc: docs/SCRIPT_EDITOR.md ("Conversations and Workshop"). Test: `python3 tools/script_convo_test.py /tmp/sc` (FAILS [] on main 8f1ed28, about 3 min). Old test `tools/script_editor_test.py` still FAILS [].

## Tom's test (exact)
1. Title screen > ADMIN > SCRIPT EDITOR > Chapter 2 > Starter. One box: "Tom and TNB at Tom's House" with its purpose. Chapter 1 > Theft shows three boxes.
2. Tap "Not reviewed" on a box, pick Needs work. Tap Note, type, Save. Tap the Needs work chip at the top: only that box shows.
3. Tap Workshop (copies the packet). Paste into any AI chat. Copy its whole reply.
4. Tap Paste back, paste, Place the lines. Accept one, Reject one. Tap Play: the accepted line plays (computer voice).
5. Send to Claude. In a new chat: "Workshop my flagged conversations". Reopen the editor later: suggestions show under the lines, with Accept and Reject.
6. Tap the status of a box you like and pick Locked.

## What is built
| Piece | Where |
|---|---|
| Automatic split (392 conversations in 221 scenes, 3,402 lines unchanged) | tools/script-index/convos.py, run by build.py; walk.js now records map moves, fades, waits, arrivals |
| Hand rows: 215 purposes (ch 1 to 8, Nine Scoops), plot lines, ch1 and ch2 splits read and corrected | docs/script-convos.tsv (scene, step, check, title, purpose, plot, force) |
| Page: conversation boxes, status, note, filter chips, counts, Merge, Split, Workshop, Paste back, suggestion rows | script.html |
| Packet brief and speaker notes | docs/humor-brief.md -> data/script-brief.json (build.py) |
| Review and suggestions files (empty now) | data/script-review.json, data/script-suggestions.json |
| Session tool for "Workshop my flagged conversations" | tools/script-index/workshop.py (list, write, prune, merge-send) |
| Apply folds Merge, Split, titles, purposes into the tsv | apply.py calls `convos.py apply-review` |

## Decisions (one line each)
- Suggestions are keyed by the line ref (`scene|Speaker|exact text`), not the step path: it is the key the editor and edits already use, and a reworded line makes the suggestion stale anyway.
- Conversation id is `scene:step path`; a tsv row also stores the first words of its line, so a shifted path is found again and reported.
- "Group changes" rule is stricter than the plan (next four talk steps share no speaker with the last four, and the conversation has four already): the plan's looser version cut short exchanges into pieces.
- With no GitHub token, Send shares one script-send.json; `workshop.py merge-send` splits it.
- The Locked rule went into the repo CLAUDE.md and docs/SCRIPT_EDITOR.md. claude/story-build.md was NOT rewritten (60 KB, edited by other sessions); a writing session reads CLAUDE.md anyway.
- TNB's speaker note says "never shouts (no ALL-CAPS, no exclamation marks; normal sentence capitals)": the first fresh-AI test lowercased his line from "no capitals".

## Known gaps
- Purposes for chapters 9 to 20 are not written ("Purpose not written yet", listed by `convos.py report`).
- docs/tom-edits.tsv is still empty, so packets have no "Tom's own rewrites" part until the first apply.
- A Split in the middle of one talk step or at an added line stays in data/script-review.json for a person (apply-review lists it).
- Nothing seen on Tom's phone.

## Rule for later builds
Any scene change: `python3 tools/script-index/build.py`; fix any stale row it prints; a new scene gets its purposes and plot lines in docs/script-convos.tsv in the same push.
