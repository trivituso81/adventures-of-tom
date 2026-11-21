# Voice Baker v2: build instructions

Requested by Tom 2026-10-31. Goal: find and rebake any line by battle, chapter and character, and edit the text itself.

## Source and build
- Template: claude/voice-baker-template.html. Build script: claude/voice-baker-build.js (`node voice-baker-build.js <folder with lines.js, voice-clips.js and voice/> <scripts.json> <out.html>`). Read data/lines.js, data/voice-clips.js and data/voice/*.js from the game repo (or the artifact) into that folder first.
- Output: voice-baker.html, sent to Tom to open in desktop Chrome (mic and API need Chrome).
- Keep every existing placeholder (/*__LINES__*/, /*__CLIPS__*/, /*__VOICES__*/, /*__SCRIPTS__*/, /*__BUILT__*/) so the build script still works. Add no new placeholders unless the build script is updated too.
- Keep the storage keys (aot-baker-v2, IndexedDB aot-baker) so Tom's kept takes survive. Add a new version flag (v16) for any one-time reset.

## 1. Battle / dialogue split
- Battle kinds: move keys (anything in data/party.js ATTACKS for that character), hurt, low, ko, win, special, block, defend, pep, tombo*, dance, silly, hug, grumble.
- Dialogue: everything else (greet, join, praise, intro*, scene lines).
- Show it as a chip filter: Battle, Dialogue (multi-select, either or both).

## 2. Chapter filter
- Derive chapter for each line by scanning data/scenes.js: a line belongs to the chapter of the scene that speaks it (match on speaker and text).
- A line in more than one chapter shows under each, with a "shared" tag.
- Lines spoken in no scene show as "no chapter" (battle lines usually).
- Build the map in build time: add a `CHAPTERS` object to the template data, produced by voice-baker-build.js (new scan step). Do not compute it in the browser.

## 3. Multi-select filters
- Character: multi-select chips (ORDER list). Default: one character (current behavior). "All" chip clears others.
- Chapter: multi-select chips, numbered in game order, plus "no chapter".
- Type: Battle, Dialogue (multi-select).
- Status: keep the existing four (Needs new voice, Not baked, All, Has kept), single select.
- Search box stays. Filters combine with AND across groups, OR within a group.
- Show the active filter count and a "Clear" button.

## 4. Select and rebake
- Checkbox on each card. "Select all visible" and "Clear selection" above the list.
- "Rebake selected (N)" button: runs one take per selected line through the existing generate() path, 3 at a time, with the same retry on 429. Respects the Generate all confirm (shows count and characters).
- A rebake keeps the new take as kept and un-ticks the old one (existing behavior). Old takes stay playable.
- Stop button works the same as Generate all.

## 5. Editable game text
- The game text above each script becomes an editable textarea.
- Save edits in S.lineText[key] keyed by the original line key. The saved voices.json gets a `lineText` map: {"ch|kind|original": "new text"}.
- The clip is saved under the NEW text. Show a warning on the card: "Game text changed. The game only plays this clip after data/lines.js is updated to match. Export shows the change."
- Export: add `lineText` to voices.json. Tom then has to ask Claude to apply the text change to data/lines.js before the clip plays. Do not auto-apply it.
- A "Revert text" button restores the original.
- Keep the emphasis and brackets in the script box (separate from game text), as now.

## 6. Test before sending
- Open the built file in headless Chromium (CHROMIUM path as in next.md), check: filters show the right counts, select-all selects visible only, rebake of 2 lines makes 2 takes, edited text shows the warning, export downloads voices.json containing lineText.
- Screenshot the list and the filter bar, look at them, then send voice-baker.html to Tom.

## 7. Out of scope
- No change to the game engine. No change to speech.js matching.
- No auto-edit of data/lines.js.
- Nara stays on the sound effects path; her cards keep the sound description box, and rebake works the same way.
