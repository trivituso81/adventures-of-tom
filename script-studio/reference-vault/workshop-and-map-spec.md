# Workshop and Map Spec

Built by tools/script-studio/sync_vault.py from claude/script-workshop-plan.md, docs/SCRIPT_EDITOR.md and docs/MAP_SIZES.md.

---

<!-- source: claude/script-workshop-plan.md -->

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

---

<!-- source: docs/SCRIPT_EDITOR.md -->

# Script Editor (script.html)

Tom's tool for editing the words of every scene. Open it from the title screen: ADMIN > SCRIPT EDITOR. Plan: `claude/script-editor-plan.md` (Project), approved 2026-11-14.

## What it does

- One container per scene (grouped by chapter), a stage picture on top (read only, `art/script-stage/<scene>.webp`).
- Per line: reword, remove, add a line or a silent beat, reorder (up and down), change speaker, pause before and after, mood, talking pose, reactions (listener, mood, tap the cue word), voice status, play, record, "Use it".
- Play runs the real scene in the real engine with the edits applied (`engine/script-edits.js`, `sePlayBoot`). The editor page and the game share one function, `seApply`, so what the page shows is what the game plays.
- Copy at four levels (chapter, scene, ticked scenes via Select, whole game), words only or with expressions and pauses.
- Send to Claude writes `data/script-edits.json` to `main` with Tom's GitHub token (`aot-gh-token`), plus `data/script-review.json` and `data/script-suggestions.json` when conversations changed (below); with no token it shares one file, `script-send.json`, instead (`python3 tools/script-index/workshop.py merge-send <file>` splits it into the three files).
- Conversations, review status, notes, Workshop packets, Paste back and Claude suggestions (build scriptconvo1, below).

## Moving parts

| Piece | File |
|---|---|
| Editor page | `script.html`, `engine/script-voice.js` (voice panel, same stores as voices.html) |
| Overlay on scenes (edits keyed by speaker plus exact text, `#2` for a repeat) | `engine/script-edits.js` (draft in localStorage `aot-script-draft`, sent edits in `data/script-edits.json`) |
| Index of every scene and line | `data/script-index.json`, built by `python3 tools/script-index/build.py` (runs `walk.js` in the page) |
| Stage pictures | `python3 tools/script-index/stage.py [sceneId ...]` |
| Hand-written action text for staging steps | `docs/script-actions.tsv` |
| Optional hand-fixed Play recipes | `docs/script-recipes.json` |
| Apply step | `python3 tools/script-index/apply.py` |
| Humor guide | `docs/tom-edits.tsv` and `claude/tom-line-edits.md` (Project) |
| Test | `python3 tools/script_editor_test.py`, `python3 tools/script_play_test.py` (Play for every recipe scene) |

## Conversations and Workshop (scriptconvo1, plan: claude/script-workshop-plan.md in the Project)

| Piece | How it works | File |
|---|---|---|
| Split | The index build cuts every scene into conversations: a new one at the first talk step and after a fight, a move to another map, a fade out, a title card, a close-up or reveal, a wait of 2 seconds or more, a speaker arriving or leaving, or a change of who is talking (the next four talk steps share no speaker with the last four). Never inside an if/otherwise branch. Fewer than two talk lines joins the one before. | `tools/script-index/convos.py` (imported by build.py) |
| Hand corrections, titles, purposes, plot lines | One row per conversation start: scene, step path, check (first words of its first line, so a row survives a step path shift), title (blank = automatic "Tom and TNB at Tom's House"), purpose, plot ("Speaker: first words" ; ...), force (split or merge). Purposes and plot lines are written for chapters 1 to 8 and Nine Scoops. A new scene gets its rows in the same push. `python3 tools/script-index/convos.py report` lists stale rows, plot lines not found and missing purposes; `dump <chapter>` prints a chapter's conversations. | `docs/script-convos.tsv` |
| Conversation id | `<scene>:<step path of its first talk step>`; Tom's own Split: `<scene>:u:<line ref>`. | |
| Review status and note | Not reviewed, Needs work, Workshopping, Locked; one note per conversation. Filter chips at the top; chapter and scene headers show counts. Copying a packet or pasting suggestions sets Workshopping. | draft `aot-script-draft` (`review`, `cv`), then `data/script-review.json` `{convos:{cid:{st,note,title,purpose}}, splits:{scene:{split,merge}}, resolved:{'scene\|ref':{v,cid,d}}}`, merged, never replaced |
| Workshop packet | Code (`W ch2Starter 1`, or `W set N` for ticked conversations), fixed ask, humor brief, Tom's newest rewrites (`docs/tom-edits.tsv`, left out while empty), one line per speaker, chapter, scene, place, present, purpose, three lead-in lines, numbered lines (`L1 TOM: ...`, plot lines marked), Tom's note, rules, reply format. Locked conversations are left out. | `docs/humor-brief.md` -> `data/script-brief.json` (build.py) |
| Paste back | Reads `L3: words`, `L5: [cut]`, `L6+: TNB: words`, `L8 option 2: words`; ignores markdown, bullets, quotes, a repeated speaker and chat text. Needs the packet code or the conversation's own Paste back. Shows before and after with Accept and Reject; a line changed since the copy says so; lines it cannot place are listed with Copy. Accept makes a normal edit (Undo, Play, Send work as before). | draft `packets`, `sugg` |
| Claude suggestions | Up to three options per line, keyed `<scene>\|<Speaker>\|<exact text>` (the line ref), with `from` (the text when written), `reason`, `date`. Answered ones leave the file on the next Send and are kept in `resolved`. | `data/script-suggestions.json` |
| Test | `python3 tools/script_convo_test.py /tmp/sc` (index split, page, packet, the five Paste back cases, Play, round trip with GitHub mocked). `tools/script_convo_reply.txt` is a real reply from a fresh AI chat. | |

### "Workshop my flagged conversations" (Tom says this in chat)

1. `git pull`. `python3 tools/script-index/workshop.py list` prints every Needs work conversation, its purpose, Tom's note and its lines with their keys. A STOP-LOSS line means Tom rejected every option there twice: offer nothing more there and tell him he writes that one himself.
2. Read `claude/tom-line-edits.md`, `claude/voice-sheet.md`, `docs/humor-brief.md` and the chapter's story file (`claude/story-chNN.md`).
3. Write two or three options for each flagged line into a json file (`{"<key>":{"opts":[...],"reason":"one line"}}`), then `python3 tools/script-index/workshop.py write <file>`. It refuses Locked conversations, non-talk lines and em dashes, and sets the conversations to Workshopping.
4. Change no scene source and no voice file. Commit `data/script-suggestions.json` and `data/script-review.json`, CHANGES entry, bump tags, push. Tell Tom how many conversations have suggestions waiting.

### Locked lines (standing rule)

Before changing a line in a built scene, check `data/script-review.json`: a line in a conversation with `st: lock` changes only when Tom says so in chat. Tom can still edit locked lines himself in the editor.

## Whenever a scene changes

Run `python3 tools/script-index/build.py` and commit `data/script-index.json` (it also writes `data/script-brief.json` and prints conversation problems: fix any stale `docs/script-convos.tsv` row, and give a new scene its purposes and plot lines). Run `stage.py <id>` for a scene whose first spoken moment changed. Scenes with no map recipe (`from:'none'` in the index) show "no working Play recipe yet": add a recipe to `docs/script-recipes.json` (`map`, optional `flags`, `unflag`, `party`, `start`, `lose:true` to leave a fight unwon so its try-again lines play), then test it with `python3 tools/script_play_test.py /tmp/sp <id>`. All 221 scenes have a recipe as of scripted2.

## "Apply my script edits"

1. `git pull`, read `data/script-edits.json` (and `data/script-review.json` for Tom's Merge, Split, titles and purposes).
2. `python3 tools/script-index/apply.py --dry`, then without `--dry`. It first folds Tom's Merge, Split, titles and purposes into `docs/script-convos.tsv` (`convos.py apply-review`; statuses and notes stay in the review file), then rewrites plain `{talk:'X',lines:[...]}` steps in the scene source (reword, remove, add, reorder, speaker, pauses as `{wait:n}`), moves rows in `docs/emotion-index-lines.tsv`, `docs/talk-lines.tsv`, `docs/emotion-reactions.tsv`, patches `data/emotion-moods.js` in place (emotion-apply.py cannot run clean while queued chapter 7 rows exist), runs reaction-apply and talk-apply, purges clips whose text or speaker no longer exists, refreshes the Voice Library index, appends to `docs/tom-edits.tsv`, and empties the edits file.
3. A scene it prints as MANUAL (lines built from variables or templates, or a line moved across a conditional) is left in `data/script-edits.json`. Fold those edits in by hand, then remove that scene from the file.
4. Edits to lines that carry the mood tables for reaction chapters other than 1 and 2 are applied to the tsv only; check `reaction-apply.py` output.
5. `python3 tools/script-index/build.py`, `python3 tools/clip-audit/unused_voice.py` (all four checks 0), `python3 tools/smoke.py`, `python3 tools/script_editor_test.py`. Look at each edited scene (Play it, or the frames from the test).
6. Add the CHANGES entry (list the reworded lines, quote Tom's words), bump tags, push, rewrite `claude/tom-line-edits.md` (newest first), record the purged clips in `docs/PURGED_VOICE.md`.
7. Tell Tom which lines now wait for a recording. Until then an edited or added line is read by speech synthesis (`SE.edited` in `engine/script-edits.js`).

## Writing new lines

Read `claude/tom-line-edits.md` (and `docs/tom-edits.tsv`) first. Tom's rewrites are the humor guide: what he cuts, what he adds, how short he makes a line.

---

<!-- source: docs/MAP_SIZES.md -->

# Map sizes and screen coverage

Every outdoor map is one painting (`art/<map>.webp`, 64 art px per tile) drawn at tile size T = 32, so 2.0x is the painting's native sharpness.
The phone shows a canvas of up to 440 x 956 (portrait) or 956 x 440 (landscape) CSS px. A painting smaller than that leaves flat space around it.

## What the engine does now (2026-10-30)

- **Zoom to cover.** `outdoorCover` (engine/overworld.js) zooms an outdoor painted map just enough that the painting covers the whole screen in the current layout (never below 1.0, never above `OUTDOOR_COVER_CAP` = 2.25). One painting serves both orientations; the zoom differs per layout.
- **Edges flush.** The camera stops at the map edges sideways, so the painting meets the screen edge. Mid-map the whole screen is painting.
- **Edges stop flush.** The camera stops at every edge (sides, top and bottom): the painting meets the screen on all four sides and Tom keeps walking when it stops panning (Tom's call, 2026-10-30). So on the last rows next to the top edge (title bar, top 82 px in portrait, 57 in landscape) or the bottom edge (controls, bottom 170 px in portrait, 106 in landscape) he can end up partly behind them. Square painted rooms differ: they scroll a little past the edge to keep him clear (docs/ROOM_PAINTINGS.md).
- **Cap.** A map that would need more than 2.25x keeps 2.25x and shows a soft backdrop (`plateBackdrop` in engine/draw.js: the painting shrunk, stretched and darkened) around the painting on some phones.
- Rooms and houses (maps with `outside: false`) are not touched; they keep their own fit.
- `python3 tools/camera_clamp_test.py` checks all of this at eight phone sizes and lists the capped maps.

## Maps that need a bigger painting

These stay at the zoom cap on the largest phones, so some soft backdrop shows around them (worst case in portrait):

| Map | Painting now (tiles) | Zoom portrait | Zoom landscape |
|---|---|---|---|
| flightzero | 19 x 11 | 2.25 | 1.57 |
| memamy | 16 x 11 | 2.25 | 1.87 |
| memgrace | 16 x 11 | 2.25 | 1.87 |
| memrose | 16 x 11 | 2.25 | 1.87 |
| memtnb | 16 x 11 | 2.25 | 1.87 |
| subdepot | 24 x 12 | 2.25 | 1.24 |
| subtunnel | 36 x 12 | 2.25 | 1.15 |

Minimum that removes the backdrop at the 2.25x cap: 14 tiles on each side (flightzero 19 x 14, it is 19 x 11 since airport1, memory rooms 16 x 14, subdepot 24 x 14, subtunnel 36 x 14).
The size that needs no zoom at all, and so keeps the world at its drawn scale on every phone: **30 x 30 tiles (1920 x 1920 art px)**, a square large enough for both orientations.

## Painting rules for any new or repainted outdoor map

- At least 30 x 30 tiles if the map should look the same in both layouts with no zoom (smaller is fine, the engine zooms up to 2.25x).
- Keep the walkable area at least 6 tiles in from the bottom edge and 3 tiles in from the top edge (at zoom 1), with scenery (trees, water, walls) beyond it. That art sits under the controls and the title bar, so nothing you can walk on is hidden. Exits on the bottom or top row are the ones that suffer today: Tom walks behind the controls to use them.
- Sideways the painting meets the screen edge, so no margin is needed there.

## Zoom the engine applies to the other outdoor maps (largest phone)

| Map | Tiles | Zoom portrait | Zoom landscape |
|---|---|---|---|
| boiler | 20 x 14 | 2.13 | 1.49 |
| cafetorium | 20 x 14 | 2.13 | 1.49 |
| concourse | 40 x 22 | 1.36 | 1.00 |
| dome | 20 x 14 | 2.13 | 1.49 |
| gate00 | 20 x 14 | 2.13 | 1.49 |
| gatezero | 20 x 14 | 2.13 | 1.49 |
| readroom | 20 x 14 | 2.13 | 1.49 |
| stageset | 20 x 14 | 2.13 | 1.49 |
| subchamber | 26 x 14 | 2.13 | 1.15 |
| towerlobby | 22 x 14 | 2.13 | 1.36 |
| towershelves | 28 x 14 | 2.13 | 1.07 |
| towervault | 22 x 14 | 2.13 | 1.36 |
| foreverheart | 22 x 15 | 1.99 | 1.36 |
| towerpinnacle | 22 x 15 | 1.99 | 1.36 |
| crown | 20 x 16 | 1.87 | 1.49 |
| deadletter | 26 x 17 | 1.76 | 1.15 |
| stillcore | 26 x 17 | 1.76 | 1.15 |
| backlot | 24 x 18 | 1.66 | 1.24 |
| school | 30 x 18 | 1.66 | 1.00 |
| schoolyard | 24 x 18 | 1.66 | 1.24 |
| stage7 | 24 x 18 | 1.66 | 1.24 |
| studio | 24 x 18 | 1.66 | 1.24 |
| towerstairs | 18 x 42 | 1.00 | 1.66 |
| oak | 24 x 20 | 1.49 | 1.24 |
| sundial | 22 x 20 | 1.49 | 1.36 |
| carbarn | 30 x 21 | 1.42 | 1.00 |
| griffith | 24 x 22 | 1.36 | 1.24 |
| hollow | 24 x 22 | 1.36 | 1.24 |
| moonclub | 30 x 22 | 1.36 | 1.00 |
| oakpark | 26 x 22 | 1.36 | 1.15 |
| pier | 24 x 22 | 1.36 | 1.24 |
| row | 24 x 22 | 1.36 | 1.24 |
| stacks | 30 x 22 | 1.36 | 1.00 |
| terminal | 30 x 22 | 1.36 | 1.00 |
| reeds | 26 x 23 | 1.30 | 1.15 |
| jpark | 30 x 24 | 1.24 | 1.00 |
| blvd | 30 x 26 | 1.15 | 1.00 |
| town | 30 x 26 | 1.15 | 1.00 |
