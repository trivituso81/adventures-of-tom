# Script Editor: build plan (approved by Tom 2026-11-14, written against main bb65c51)

Tom: "Go on exactly what you've proposed. I approve it and I like it." Then added: an easy way to copy the whole script, or any part of a chapter, to paste into another AI.

## 1. Why this exists

Tom has rejected many dialogue drafts as not funny. He wants irreverent, cheeky, goofy humor with small puns, not sitcom or children's show humor. He cannot describe that reliably in chat, but he can write it. The Script Editor makes him the final writer of any line he cares about, and turns his rewrites into the guide every writing session learns from.

## 2. What Tom approved

| Piece | Decision |
|---|---|
| Where | A new admin page, SCRIPT EDITOR (script.html), listed under ADMIN next to the Voice Library. The Voice Library stays as it is: it is the flat list for bulk recording. Both pages show the same lines. |
| Unit | One scene is one container. Chapters list their scenes in story order. |
| Stage picture | Top of each scene: a picture of the real map with everyone in the scene where they stand and the way they face. Read only in version 1. |
| Play | A Play button runs the real scene in the real game engine with Tom's edits applied. No imitation player. |
| Line edits | Reword, add, remove, reorder, change the speaker, turn a line into a silent beat (a pause with no words). |
| Expressions | Per line: pick the speaker's mood or talking pose from the actual pose pictures. Per listener: pick the reaction and the word it happens on. |
| Timing | Pause before a line, pause after a line, and the cue word for each reaction. |
| Voice on each line | Clip status (recorded, no clip yet, old voice), play, and the Voice Library's record and Use it controls. Changing the words of a recorded line shows: "Changing this silences the recording." Edited lines are read by speech synthesis until recorded. |
| Copy | See section 4. |
| His edits teach the writers | See section 6. |
| Later (version 2, only when Tom asks) | Moving people and changing facing from the stage picture; battle attack lines and press-A townsfolk chats; pasting a script back in from another AI. |

## 3. How the game stores dialogue today (facts the build depends on)

| Fact | Where | What it means for the editor |
|---|---|---|
| Scenes are code, not plain data: 136 scenes in data/scenes.js plus data/scenes-p2.js, data/scenes-ch12.js to scenes-ch20.js, data/bonus-nine-scoops.js, close-up files. A scene is a list of steps: `{talk:'Tom',lines:[...]}`, `{walk}`, `{place}`, `{face}`, `{wait}`, `{call:()=>...}`, `{around}`, `{spawn}`, `{all:[...]}` | data/ | The editor must not rewrite these files from the phone. It reads a generated index and writes an edits file. |
| A line's mood is keyed by `Speaker|exact text` | docs/emotion-index-lines.tsv, generated data/emotion-moods.js | Rewording a line must carry its mood to the new text. |
| A line's talking pose is keyed the same way | docs/talk-lines.tsv, generated data/talk-types.js | Same. |
| Listener reactions are rows with speaker, text, listener, mood and a cue word (`at`) | docs/emotion-reactions.tsv, generated data/emotion-reactions.js | This is the "timing of the expression" Tom asked for. |
| A voice clip's key is `voice|text` | data/voice/dialog-ch*.js, data/voice-index.json | A reworded line has no clip. Old clip is purged by the apply step, never by the phone. |
| Phone takes live in the browser (IndexedDB) and play at once on that phone | voices.html | Reuse the same store so a take made in the Script Editor shows in the Voice Library. |
| Admin pages save straight to the repo with a GitHub token Tom pasted on his device | heads.html, portraits.html, engine/splash-edit.js | Same method for "Send to Claude". |
| Scenes can be started directly | `window.__LE.playScene`, `chapterJump`, tools/reaction_test.py case format | Play uses this. The stage picture is baked with this. |

## 4. Copy (Tom's addition)

| Where the button is | What it copies |
|---|---|
| Chapter header | The whole chapter |
| Scene header | That scene |
| After tapping Select and ticking scenes or lines | Only what is ticked |
| Top of the page | The whole game (also offered as a text file through the share sheet, because it is long) |

Format: plain text a person or another AI can read with no key. Chapter title, scene title, one line saying where it is and who is there, then `SPEAKER: line`. Things that happen on screen are one short bracketed action line in plain words (for example `[Two Smoglets drift onto the street.]`). A switch chooses "words only" or "with expressions and pauses". Tom's unsent edits are included, so the copy matches what he sees. Copy goes to the clipboard; the share sheet is the fallback.

## 5. Build design

### 5.1 Files

| File | What it is |
|---|---|
| tools/script-index/build.js (new) | Loads the game headless, walks every scene and writes data/script-index.json: chapter, scene id, scene title, map, cast present, and ordered steps. Each step has a stable id, its kind, and for talk steps the speaker, text, mood, talk type, reactions and clip key. Each non-talk step gets a plain words description. Functions (`call`) are described from a hand-written table docs/script-actions.tsv keyed by scene and step; a missing row reads "[something happens]" and is listed by the tool so it gets filled in. |
| tools/script-index/stage.py (new) | Bakes one stage picture per scene (and a new one whenever people move a lot inside a scene) using the reaction_test.py harness, with small name tags and facing arrows. Saved under art/script-stage/. |
| script.html (new) | The page. Phone first, portrait and landscape, 44 px targets, same look and filter habits as voices.html. Chapter list, scene containers, line rows, Select mode, Copy, Play, Send to Claude. |
| engine/script-edits.js (new) | The overlay. Before a scene plays, applies edits to its step list: reworded text, removed steps, inserted talk steps, new order, changed speaker, pauses, and mood, talk pose and reaction overrides. Reads two sources: data/script-edits.json (sent edits, in the repo) and the phone's own draft (localStorage `aot-script-draft`), draft on top. Mood, talk and reaction lookups for an edited line use the override, else the original line's values. |
| data/script-edits.json (new) | Edits Tom has sent that a Claude session has not folded in yet. Empty after each apply. |
| tools/script-index/apply.py (new) | The fold-in step run by Claude: rewrites the scene source for each edit, moves the tsv rows to the new text, runs the generators, purges clips whose words no longer exist (purge_unused.js with a spec; this is the standing rule for reworded lines, not an archive), harvests new lines into the Voice Library, appends to docs/tom-edits.tsv, empties data/script-edits.json. |
| docs/tom-edits.tsv (new) | Section 6. |
| docs/SCRIPT_EDITOR.md (new) | How it works and the apply procedure. |

### 5.2 Rules

- Edits never touch a step that is not a talk step, except to move talk steps around it. Walks, camera and effects stay where they are; a talk step moved past one keeps the action in place.
- An inserted line needs a speaker who is in the scene. The picker lists the cast present first.
- Reordering uses up and down buttons, not drag (drag fights scrolling on a phone).
- Every edited line shows a mark and an Undo back to the game's version. A scene header shows how many unsent edits it holds.
- Play opens the game on that scene with the right map, party, flags and start tile. These come from a per-scene recipe in data/script-index.json. Recipes that cannot be worked out by the tool are written by hand, starting from the cases in claude/next.md and tools/*cases.json. A scene with no working recipe says so on its Play button; it does not fail silently.
- Send to Claude writes data/script-edits.json to main with Tom's token (merge with what is there, never replace). Without a token it shares the file.
- After Tom sends, the command for any session is "Apply my script edits": run tools/script-index/apply.py, look at each edited scene's frames, test, push, and tell Tom which lines now wait for a recording.
- The no-em-dash and contraction rules are checked on save, with a plain warning, not a block.
- Other sessions (chapters 6, 7, 8 builds) keep adding scenes. build.js runs in the push procedure after any scene change so the editor never lags. Add this to claude/next.md and CLAUDE.md when the build lands.

### 5.3 Order of work (all of it lands before Tom is asked to test; his standing rule is build the whole thing first)

| Step | Scope | Check |
|---|---|---|
| 1 | build.js, script-index.json, action descriptions for chapters 1 to 8 and Nine Scoops, generic text for the rest | Every talk line in every scene file appears once, in order; count matches the Voice Library's story lines |
| 2 | script.html read view: chapters, scenes, lines, stage pictures, clip status and play, Copy at all four levels | Portrait, landscape, desktop screenshots; paste a copied chapter and read it |
| 3 | engine/script-edits.js and the edit controls for words, add, remove, order, speaker, silent beat, pauses; Play | Edit ch2Starter three ways, Play, frames show the edits; game with no edits is unchanged (smoke) |
| 4 | Expression and reaction pickers with pose pictures; cue word picker (tap the word in the line) | A changed mood and a changed cue word show in LATE=1 frames |
| 5 | Record and Use it on a line (shared store with voices.html) | A take made here shows in the Voice Library and plays in the game |
| 6 | Send to Claude, apply.py, docs/tom-edits.tsv, docs/SCRIPT_EDITOR.md, ADMIN entry, admin music script tag | Round trip on a test branch: send three edits, apply, source and tsvs changed, generators clean, unused_voice.py shows nothing new |

Stop-loss applies as always. The risky parts are Play recipes for self-staged scenes and reordering lines around `{all}` and `{call}` steps: reproduce with reaction_test.py before changing engine/story.js.

## 6. Tom's edits become the humor guide

- apply.py appends every reworded, added or removed line to docs/tom-edits.tsv: date, chapter, scene, speaker, before, after, and the two lines around it for context.
- A readable copy is kept in this Project as claude/tom-line-edits.md, newest first, rewritten on each apply.
- Every story writing session reads claude/tom-line-edits.md before writing a line, together with claude/dialogue-voice-sheet and the locked chapters. Add that sentence to the writing prompts in claude/story-build.md when the first edits arrive.
- These pairs, with his hand-tuned chapter 2 voice lines, are the official record of his humor.

## 7. What changes in how Tom and the sessions work

| Before | After |
|---|---|
| Writing sessions polish humor until Tom approves | Writing sessions draft for plot, clarity and character, with their best humor. Tom punches up only the lines that bother him, in the editor. |
| Tom records a chapter as soon as it is built | Words first, voice second. Tom edits a chapter in the Script Editor, sends it, and records after the apply. |
| Chapters 7 and 8 have about 400 lines waiting to be recorded | On hold until the editor is live and Tom has been through those chapters. Chapter 7 and 8 art is not affected. |

## 8. Prompt for the build conversation

"Read claude/script-editor-plan.md and the repo's CLAUDE.md. Build the Script Editor, all six steps, then tell me exactly how to test it."
