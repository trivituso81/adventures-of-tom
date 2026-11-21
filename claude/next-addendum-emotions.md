## NEXT TASK EMOTIONS (Tom 11-05 23:43 to 11-06 00:44; `emo1` to `emo6`): SHEETS AND DIALOGUE INDEXED; WIRING QUEUED IN 8 BATCHES
- 8 emotions (docs/EMOTIONS.md, Project copy claude/emotions.md): happy, loving, sad, angry, scared, surprised, proud, unimpressed. Sheet = full body 4 x 2 (emo2; Tom rejected the hips-up version: "cut the character off at the waist"). Nara has her own prompt tools/art-library/prompts/dog-emotion-sheet.txt (emo4).
- DONE: 11 sheets painted by Tom, saved art/raw/characters/<id>-emotions-v1.png, Library entries approved: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Ellie, Olivia, Nara. Cut with tools/sprite-bake/emotion_frames.py into art/emotions/<id>.webp; index data/emotions.js (`EMOTION_ART[id].frames[mood]`). Nara paints dark brown (hero near black), used as painted.
- DIALOGUE INDEX (`emo6`, CHANGES 309): docs/EMOTION_INDEX.md (by chapter, Character | Emotion | Dialogue, 1,713 lines) and docs/emotion-index-lines.tsv (all 1,826 cast lines: chapter, file, source line at 6d16382, character, mood, text; `none` = no readable feeling). Story scenes only (talk blocks plus the [name, line] tables in ch16 ch16Say, ch19 CH19_MEM/CH19_KEEP, ch20 CH20_DOORS). Michael and Jojo skipped (no sheet).
- Michael and Jojo need a hero picture first. When a sheet arrives: save it, run the cutter with that id, approve the entry, push.

## WIRING PLAN (Tom 11-06 00:44: "add these to the build instructions to do them in batches as you best recommend")
Order: after NEXT TASK RIDE. One batch per session or per commit; push each batch; never start the next batch before the previous one is pushed and smoke is clean. Costs Tom 0 Generate presses.

### Decisions (made, recommended to Tom)
- Moods live in ONE data file, not in the scene scripts: data/emotion-moods.js, `EMOTION_MOODS = {'<Speaker>|<exact line text>': '<mood>'}` built from the tsv by a new tool tools/emotion-apply.py (rows with `none` left out). The talk step looks each line up at the moment it shows. Why: no edits to 12 scene files that other sessions change all day, no risk to spoken line text (voice clips match text exactly, CLAUDE.md rule 5), and Tom's corrections are one-word edits in one file. Key by speaker plus text, never by source line number (line numbers already moved since 6d16382). Same text twice in a chapter with the same mood is fine; if the same speaker and text carry two different moods, tool fails loudly and the second gets a `|<chapter>` key.
- A chapter switch, `EMO_CHAPTERS` (set of chapter numbers plus 'ns' for Nine Scoops) in data/emotion-moods.js, turns a batch on. Lines in chapters not yet switched on behave exactly as today.
- What a mood does while its line is on screen: (1) DIALOGUE BOX: the portrait becomes that character's face in that mood, cropped from the emotion frame at the same zoom as `heroport2` (eye line .52, `SIDE` 410 x face size); (2) MAP: if the speaker is a visible scene actor or follower, it is drawn with the full-body emotion frame in place of its walk stand, sized so its standing height equals its walk stand rows (Tom 42, Grace 39, Rose 35, Deedee 41.7, Boppy 41.7, Ellie 43, Amy 41.7, Justin 53, Olivia 42, TNB 45, Nara 31), feet on the same spot, as painted (no warp, no flip); the pose clears when the line advances or the next line has no mood. A storypose (`{pose:...}`) already set on that actor wins over the mood. Riding Rose (seat) and hidden actors get the portrait only.
- Nara's lines are narration about her: she gets the map pose and her face, as with any speaker.
- Map chatter (data/maps-le.js, maps-la.js NPC talk) and battle barks are NOT in scope.

### Batches
| # | Scope | Cast lines (tagged) | Notes |
|---|---|---|---|
| 0 | ENGINE + CHAPTER 1 PILOT | ch1: 57 | Build everything below, switch on ch1 only, show Tom, then STOP and ask ONE line: "Play the chapter 1 opening and the pie chase: do the faces and poses read right?" Do not start batch 1 until he answers or says continue. |
| 1 | Chapters 2 to 4 | 213 | LA arrival, Boppy fishing, backlot. |
| 2 | Chapters 5 to 7 | 232 | school, squirrels, library. |
| 3 | Chapters 8 to 10 | 235 | Part 1 complete after this. |
| 4 | Chapters 11 to 13 | 314 | first Part 2 group. |
| 5 | Chapters 14 to 17 | 287 | heaviest sad, scared lines (Boppy armor, the eclipse): check those frames closest. |
| 6 | Chapters 18 to 20 | 225 | needs the [name, line] tables: ch16 ch16Say, ch19 CH19_MEM and CH19_KEEP, ch20 CH20_DOORS all go through SCENE_OPS.talk, check that each actually reaches the lookup. |
| 7 | Nine Scoops | 150 | chapter 21, BONUS from the title screen. |

### Batch 0 build steps
1. tools/sprite-bake/bake_emotion_faces.py [ids] (`CHECK=` contact sheet): measure pupils and chin per mood frame on a 20 px grid (`FACE[id][mood]`, as bake_portraits.py does for heroes; Nara framed on eye and snout), write art/emotions/<id>-faces.webp (8 squares 256 x 256 in mood order) and the rects into data/emotions.js. Show Tom a head row: his hero portrait next to the 8 mood faces, all characters, before wiring.
2. data/emotions.js and data/emotion-moods.js into index.html after data/story-poses-use.js (check docs/ARCHITECTURE.md load order); art loads lazily (PAINTED_CAST style, released when unused) so boot size does not grow.
3. engine: in S.talk (engine/story.js, `talk:o=>S.talk(...)` near line 279) look up `EMOTION_MOODS` per line when its chapter is in `EMO_CHAPTERS`; pass the mood to setDialogPortrait (engine/overworld.js) and set `actor.emoPose` for the map draw (beside scenePoseDraw in engine/story.js / town-render.js); clear on advance and when the scene ends or is skipped (SKIP must leave no pose behind).
4. tools/emotion-apply.py <batch chapters>: regenerate data/emotion-moods.js from docs/emotion-index-lines.tsv, assert every tagged row of those chapters is found in the current scene files (speaker plus exact text); print the count found vs expected; zero missing before commit. Then add the chapters to `EMO_CHAPTERS`.
5. `__LE` hook to read the current mood for tests.

### Every batch: tests before push
- `python3 tools/emotion-apply.py <chapters>` reports 0 missing.
- `__LE.chapterJump(<n>)` and play each switched-on chapter start to finish (project rule), plus `SCENE=<id> MAP=<map> CH=<n> python3 tools/scene_frames.py` on at least 3 scenes per chapter with mood changes; look at portrait AND landscape, check: face matches the line, pose feet on the ground at walk height, pose clears, no pose left after SKIP.
- `node --check` changed engine files, `python3 tools/tag_check.py`, `python3 tools/smoke.py` FAILS: [], `python3 tools/clip-audit/unused_voice.py` 0 (no line text changes, so it must stay 0).
- Bump tags (index.html `?v=` for the two data files, the engine files, ART_V or a folder constant for art/emotions), CHANGES entry `emoN`, push, then ONE line to Tom: which chapters now show emotions.

### Tom's corrections
- When Tom says a line reads wrong ("Grace in chapter 7 should be proud"), change that row's mood in docs/emotion-index-lines.tsv AND regenerate data/emotion-moods.js with the tool (the tsv is the source; never hand-edit the js), regenerate docs/EMOTION_INDEX.md, push.
