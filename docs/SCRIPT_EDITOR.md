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
