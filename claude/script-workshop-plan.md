# Script Editor: conversations and Workshop (build plan, approved by Tom 2026-11-15)

Tom asked: "How can we make the script editor separate out conversations for easy review and workshopping with AI". He approved the proposal below with "Go". Build tag: scriptconvo1. Builds on scripted1 and scripted2 (claude/next-addendum-scripted1.md, docs/SCRIPT_EDITOR.md in the repo). This plan was written from the Project notes, not from the live code: read script.html, engine/script-edits.js and tools/script-index/ first and adjust file details to what is really there.

## 1. Why

| Problem today | Fix |
|---|---|
| The smallest unit is a scene. One scene often holds several exchanges split by walks, fights or arrivals, so there is no natural piece to review or hand to an AI. | A conversation layer inside each scene. |
| Tom cannot see what he has been through and what is left. | A review status per conversation, with a filter. |
| Copy is one way. An AI's rewrite has to be retyped line by line. | A Workshop packet with numbered lines and a fixed reply format, and Paste back with Accept or Reject per line. |
| Claude sessions cannot offer alternates inside the editor. | Suggestions: the same Accept or Reject rows, filled by a session. |

## 2. What Tom approved

| Piece | Decision |
|---|---|
| Conversations | Each scene is split automatically into conversations. Each has a short title and a one-line purpose (what the exchange has to do in the story). Wrong splits are fixed by Claude in a table and by Tom with Merge and Split buttons. |
| Review status | Not reviewed, Needs work, Workshopping, Locked. A filter shows only what is left. Chapter and scene headers show counts. |
| Note | One note box per conversation, in Tom's words. It travels in the Workshop packet and in Send to Claude. |
| Workshop | A button on each conversation copies a packet another AI can use with no other context. |
| Paste back | Tom pastes the AI's reply. The editor matches by line number and shows before and after per line with Accept or Reject. Accepted lines become normal edits. |
| Claude route | Send to Claude carries every Needs work conversation and its note. A session writes two or three alternates per flagged line. They appear in the editor as suggestions. |

## 3. Conversations

### 3.1 How a scene is split (tools/script-index, in the index build)

A new conversation starts at the first talk step of the scene and after any of these:

| Break | Detail |
|---|---|
| A fight | Any step that starts a battle. |
| A move to another map or room | Map change steps. |
| The group talking changes | The next run of talk steps shares no speaker with the last three speakers. |
| Someone who speaks arrives or leaves | A spawn, walk-on or walk-off of a character who has lines on either side. |
| A long silence | A wait or a run of non-talk steps that the action table describes as a major event (a reveal, a close-up, a clearout). |

Rules: a conversation shorter than two talk lines joins the one before it (or after it, if it is first). Non-talk steps stay inside whichever conversation they fall in and show as the bracketed action lines the editor already has. A scene with one exchange is one conversation and looks the same as today.

### 3.2 Identity and overrides

- Conversation id: scene id plus the stable id of its first talk step. It does not change when lines are reworded.
- docs/script-convos.tsv (new, hand-correctable): scene, first step id, title, purpose, plot line ids, forced split or forced merge. The index build applies it on top of the automatic split. A row whose step no longer exists is listed by the tool, never dropped silently.
- Tom's Merge (join with the one above) and Split (start a new conversation at this line) are saved in the phone draft, sent with Send to Claude, and written into docs/script-convos.tsv by the apply step.

### 3.3 Titles and purposes

- Automatic title: who is talking and where, in plain words ("Tom and Boppy at the dock").
- Purpose: written by Claude by hand in docs/script-convos.tsv for chapters 1 to 8 and Nine Scoops in this build, from the chapter story files (claude/story-ch01.md to story-ch08.md). Other chapters read "Purpose not written yet" and are listed by the tool. Tom can edit a title or purpose in the editor.
- Plot lines: lines that carry a fact the story needs (a name, a clue, a goal). Marked by Claude in the same table for the same chapters. Shown with a small pin. The packet tells the AI their meaning must stay.

## 4. Review status and notes

| Status | Meaning | Set by |
|---|---|---|
| Not reviewed | Default. | |
| Needs work | Tom wants it better. Travels with Send to Claude. | Tom |
| Workshopping | A packet was copied or suggestions are waiting. | Automatic, Tom can change it |
| Locked | Tom is happy. Writing sessions and suggestion sessions must not change these lines. Tom can still edit them himself. | Tom |

- Stored in the phone draft (localStorage `aot-script-draft`) and, after Send to Claude, in data/script-review.json (new, in the repo, merged and never replaced, same method as data/script-edits.json).
- Filter chips at the top of the page: All, Not reviewed, Needs work, Workshopping, Locked, Has suggestions.
- Rule for every writing session (add to claude/story-build.md and the repo CLAUDE.md): before changing a line in a built scene, check data/script-review.json. Locked lines change only when Tom says so in chat.

## 5. Workshop packet

Button on each conversation header. Select mode can tick several conversations and make one packet. Copies to the clipboard, share sheet as fallback.

Contents, in order, plain text:

| Part | Source |
|---|---|
| Packet code | For example `W ch2Starter 2`. Lets Paste back find the conversation. |
| What this is and what is wanted | Fixed text: a family game, the lines are spoken aloud, punch up the humor, keep it short. |
| Humor brief | docs/humor-brief.md (new), written once from claude/dialogue-voice-sheet, docs/CANON.md and section 1 of claude/script-editor-plan.md: irreverent, cheeky, goofy, small puns, not sitcom, not children's show; jokes come from character; a real kid only says what a real kid would know. |
| Tom's own rewrites | The newest before and after pairs from docs/tom-edits.tsv, up to 20, pairs from the same speakers first. Empty until the first apply: the part is left out, not faked. |
| Who is speaking | One line per speaker in this conversation, from docs/CANON.md (TNB: mellow, no capitals energy, puns, caring). |
| Where we are | Chapter title, scene title, place, who is present, the purpose line. |
| Lead-in | The last three lines before the conversation, marked "context, do not change". |
| The conversation | `L1 SPEAKER: line`, numbered per packet. Action lines in brackets, not numbered. Plot lines marked `(plot: keep the meaning)`. Recorded lines are not marked: the AI does not need that. |
| Tom's note | As typed. |
| Rules | No em dashes. Contractions. No new characters. Same number of lines unless a cut or an added line is clearly better. Keep each line near its current length. |
| Reply format | Exact, with an example. See 5.1. |

The build makes the humor brief, speaker lines and Tom's pairs available to the page as data/script-brief.json (generated by the index build).

### 5.1 Reply format the packet asks for

```
W ch2Starter 2
L3: new words
L5: [cut]
L6+: TNB: an added line after L6
L8 option 1: first choice
L8 option 2: second choice
```

Only changed lines are returned. Unchanged lines are left out.

## 6. Paste back

- A Paste back button at the top of the page and on each conversation. Tom pastes the whole reply.
- The reader is forgiving: it ignores markdown marks, quote marks, bullets, a repeated speaker name after the line number, and any chat text around the lines. It needs the packet code or an open conversation to know where the lines go.
- Each matched line shows as a suggestion row under the game's line: before, after, Accept, Reject. Options show as a short list, tap one to accept. Accept all and Reject all sit on the conversation header.
- Accept turns the suggestion into a normal edit (reword, remove or insert), so Undo, Play, the recorded-clip warning and Send to Claude behave exactly as they do today.
- Stale check: the packet stores a short fingerprint of each numbered line in the draft. If a line changed after the packet was copied, its suggestion shows "This line changed since you copied it" and still lets Tom accept.
- Lines the reader cannot place are shown in a plain "Could not place these" list with a Copy button. Nothing is dropped silently.
- Checks on every suggestion: em dash and missing contraction warning, added-line speaker must be in the scene (else the picker opens).

## 7. Suggestions from a Claude session

- data/script-suggestions.json (new): keyed by step id, up to three options each, with the date and a one-line reason. The editor reads it and shows the same suggestion rows as Paste back. Accepted or rejected ones are removed from the file on the next Send to Claude.
- Tom's command in chat: "Workshop my flagged conversations". The session reads data/script-review.json (Needs work plus notes), claude/tom-line-edits.md, claude/dialogue-voice-sheet and the chapter's story file, writes options into data/script-suggestions.json, sets those conversations to Workshopping, pushes, and tells Tom how many conversations have suggestions waiting. It changes no scene source and no voice file.
- Stop-loss for humor: if Tom rejects every option in a conversation twice, the session stops offering options there and says so. Tom writes that one himself.
- "Apply my script edits" is unchanged, and now also writes merge and split choices, titles, purposes and statuses to their files.

## 8. Rules

- Suggestions and Paste back never touch a step that is not a talk step.
- Nothing in this build changes how scenes play when Tom has made no edits (smoke proves it).
- Copy at chapter, scene and whole-game level stays, and now prints conversation titles as sub-headings.
- Phone first, portrait and landscape, 44 px targets. Up and down buttons, no drag.
- The index build stays in the push procedure after any scene change. A new scene gets its purposes and plot lines in docs/script-convos.tsv in the same push.

## 9. Order of work (all of it lands before Tom is asked to test)

| Step | Scope | Check |
|---|---|---|
| 1 | Split rules in the index build, docs/script-convos.tsv, automatic titles. Look at the split of every scene in chapters 1 and 2 by reading it and correct the table. | Every talk line is in exactly one conversation, in order. Line count equals the count before this build. |
| 2 | Purposes and plot lines for chapters 1 to 8 and Nine Scoops. | The tool lists no missing purpose for those chapters. |
| 3 | script.html: conversation containers inside scenes, title and purpose edit, Merge, Split, status, note, filter chips, header counts. | Portrait, landscape and desktop screenshots of ch2Starter and one long scene. |
| 4 | docs/humor-brief.md, data/script-brief.json, the Workshop packet. | Paste a real packet into a fresh AI chat with no other context and confirm the reply comes back in the format. |
| 5 | Paste back, suggestion rows, stale check, "Could not place these". | Test with five replies: clean, wrapped in markdown, with chat text around it, with a cut and an added line, with one changed line. Accepted lines play in Play. |
| 6 | data/script-review.json, data/script-suggestions.json, Send to Claude carrying statuses and notes, apply step updates, docs/SCRIPT_EDITOR.md, the Locked rule in claude/story-build.md and CLAUDE.md. | Round trip on a test branch: flag two conversations, send, write suggestions, see them on the page, accept one, send, apply. |
| 7 | New test tools/script_convo_test.py (split counts, packet build, the five Paste back cases), smoke, tags, docs/CHANGES.md, push. Write claude/next-addendum-scriptconvo1.md and add one line to claude/next.md. | FAILS: [] |

Risky parts: the automatic split in scenes where talk and action are tightly mixed (chapter 1 intro, boss endings), and matching pasted lines when an AI ignores the format. Stop-loss applies: two failed attempts at the same thing, stop and report.

## 10. Tom's test (the build conversation hands him this, corrected to what was built)

1. ADMIN > SCRIPT EDITOR > Chapter 2 > ch2Starter. The scene shows its conversations, each with a title and a purpose.
2. Set one to Needs work and type a note. Tap the Needs work chip at the top: only that one shows.
3. Tap Workshop. Paste into any AI. Copy its reply.
4. Tap Paste back and paste. Accept one line, reject one. Tap Play.
5. Send to Claude. In chat: "Workshop my flagged conversations". Reopen the editor later and look for the suggestions.
6. Lock a conversation he likes.

## 11. Prompt for the build conversation

"Read claude/script-workshop-plan.md, claude/next-addendum-scripted1.md and the repo's CLAUDE.md and docs/SCRIPT_EDITOR.md. Build conversations and Workshop in the Script Editor, all seven steps, then tell me exactly how to test it."
