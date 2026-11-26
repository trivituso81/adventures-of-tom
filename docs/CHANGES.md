## rosestage1a (2026-11-26): the Battle Guide shows what is done for each move, from the three manifests and the effect library

`tools/guidegen/manifest_crosswalk.py` writes `data/guide-manifest.json`: the 123 moves of the Stage 2A manifests tied to the game's moves (121 matched, the two team moves Double Team and Full Family Ruckus have no game skill) and to the 37 library effects. The Guide's move sheet has a What is done block (staging row, video wired, contact and hit stop, effects, sound effects, manifest motion text). Style prefix and negative prompt of the manifests are left out on purpose (pipeline lock). Contact, effects and sound read Not yet everywhere: nothing in the engine reads them and there are no sound files. Test: `python3 -I tools/guide_manifest_test.py`; `movestage_test.py` still passes.

## rosestage1 (2026-11-26): Rose's twelve moves have staging rows, so Generate works for them

Tom: "Waits for staging... Its staging row is not written yet" and "why dont i get the button to create the animation". Only Tom's eight moves had rows (`data/b3-stage.js`). Added the twelve rows for Rose's three Vibes (Sugar Rush, Cozy Rosie, Prankster), each on the ladder of `claude/move-staging-plan.md` section 3 (Basic accents only, Skill 1 one stage element, Skill 2 a bigger or lasting one, Capstone a 6 to 8 s set piece), with marks taken from the manifest beats (`art-factory/aot-stage2-pass*-manifest-24fps.json`). Giddyup keeps its approved paired clip. Eleven new body prompts (`wan-rose-*-v1.txt`, Rose's own idle prompt as the pattern, Lamby is her one held prop, nothing from behind her back; the tackle gets a new body because the old one brings Lamby out from behind her back), eight prop pictures (`stage-rose-*-v1.txt`) and their jobs in `wangen-jobs.json`. `tools/guidegen/build_map.js`: a move whose row makes a new body (keep false) now uses the row's own job and clip, even when an older clip of that move was made by another job (rose_lava). `tools/movestage_test.py` reads each person's own idle prompt as the pattern (it only knew Tom's); `tools/battle_guide_test.py` no longer pins Giddyup as a Making row. Not done: the Move Lab only loads Tom (card c-movelab-rose); the Backup Lamby ambush (the counter clip) and the Warmth Wave are not staged; the other 108 family moves still wait for rows. Tests: `movestage_test.py` (211 ok), `movestage_lab_test.py`, `wangen_test.py`, `wanbulk_test.py`, `purge_test.py` pass; `battle_guide_test.py` has the failures it already had on main (page vs data count, live queue wording, plan counts, the guide loading the engine).
## guideuse-45795371400 (2026-11-26): Dodge (tom), Victory (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Dodge (`body:tom:dodge`, rev 3): Wan job tom-dodge is now rev 3 (prompt file tools/art-library/prompts/wan-tom-dodge-v3.txt); clip tom_dodge cut (55 pictures, 0 to 108 step 2); B3_BODY_CLIPS.tom.dodge = tom_dodge (was 'tom_dodge')
- Victory (`body:rose:victory`, rev 2): Wan job rose-victory is now rev 2 (prompt file tools/art-library/prompts/wan-rose-victory-v2.txt); clip rose_victory cut (67 pictures, 0 to 132 step 2); B3_BODY_CLIPS.rose.victory = rose_victory (was 'rose_victory')
- start picture of olivia is now in `art/clips/start/olivia-hero.png` (you uploaded it; used exactly as painted)

## guideuse-45793298334 (2026-11-26): Idle (standing and breathing) (tnb), Guard (tnb), Getting hit (tnb), Idle (standing and breathing) (amy) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Idle (standing and breathing) (`body:tnb:idle`, rev 3): Wan job tnb-idle is now rev 3 (prompt file tools/art-library/prompts/wan-tnb-idle-v3.txt); clip tnb_idle cut (50 pictures, 0 to 147 step 3, loop wrap); B3_BODY_CLIPS.tnb.idle = tnb_idle (was 'tnb_idle')
- Guard (`body:tnb:guard`, rev 2): Wan job tnb-guard is now rev 2 (prompt file tools/art-library/prompts/wan-tnb-guard-v2.txt); clip tnb_guard cut (67 pictures, 0 to 132 step 2, hold 40, lowering 108); script tag added to index.html; B3_BODY_CLIPS.tnb.guard = tnb_guard (was 'tnb_guard')
- Getting hit (`body:tnb:hit`, rev 1): Wan job tnb-hit is now rev 1 (prompt file tools/art-library/prompts/wan-tnb-hit-v1.txt); clip tnb_hit cut (48 pictures, 0 to 94 step 2, 1.5x); script tag added to index.html; B3_BODY_CLIPS.tnb.hit = tnb_hit
- Idle (standing and breathing) (`body:amy:idle`, rev 1): Wan job amy-idle is now rev 1 (prompt file tools/art-library/prompts/wan-amy-idle-v1.txt); clip amy_idle cut (50 pictures, 0 to 147 step 3, loop wrap); script tag added to index.html; B3_BODY_CLIPS.amy.idle = amy_idle (new owner row)

## tomframes (2026-11-26): Tom's new walking, feelings, talking and listening pictures are in the game

Card c-tomframes. Tom's words: "implement tom's new walking, emotions, and listening frames." Not seen on the phone yet.
- Sheets installed for Tom only: `tom-walking-sheet-v4`, `tom-emotions-v8`, `tom-talk-v3` (all uploaded 2026-11-26) and the approved `tom-listen-v1` (the listening pose is the sixth talking frame, `tk_listen`, cut from the same strip). Nothing of anyone else changed.
- Walking: rebaked with `walk_splice.py tom` and `heights.py write` (draw scale unchanged, Tom stays the 42 row baseline). The new sheet has a pale pink glow in the gaps between his arms and body that the keyer kept as figure, so `walk_sheet_frames.py` removes pale pink blocks of 30 pixels or more for that sheet only (`GLOW_SHEETS`).
- Talking: the new 2 x 2 sheet paints the ask and answer heads above the half-way line, and the old even split sliced the top of their hair. `talk_frames.py` now splits Tom's sheet in the empty band between the rows (`GAP_SPLIT`, Tom only; the others keep the even split their art was made with).
- Feelings, talking and listening poses rebaked with `emotion_frames.py`, `talk_frames.py`, `bake_story_poses.py`, then the dialogue faces (`bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py`). Other people's pose sets the full story bake rewrote with no art change were put back from main (Rebake drift, reports-2026-11-19c).
- Cache tags: `EMO_V`, `TALK_V`, `TALKPOSE_V` and Tom's emotion strip are `tomframes`.
- Facing rows of Tom's frames (`docs/pose-facing.tsv`) looked at again on the new pictures: every frame still turns the way its row says, no row changed.
- Tom's earlier Pose Editor lines were set on the old sheets, so the new sheets have none yet: they are baked as painted with the standing head rule. Lining them in ADMIN > POSE EDITOR is optional and would size each pose to his height.
- Not changed: the other nine people's talking strips may have the same sliced heads from the even split (Grace's ask and answer hair touches the top edge). Left alone because their art is approved as baked.
## guideuse-45791800597 (2026-11-26): Cast (rose), Victory (tom), Running in (tom), Cast (tom) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Cast (`body:rose:cast`, rev 4): Wan job rose-cast is now rev 4 (prompt file tools/art-library/prompts/wan-rose-cast-v4.txt); clip rose_cast cut (71 pictures, 0 to 140 step 2); B3_BODY_CLIPS.rose.cast = rose_cast (was 'rose_cast')
- Victory (`body:tom:victory`, rev 2): Wan job tom-victory is now rev 2 (prompt file tools/art-library/prompts/wan-tom-victory-v2.txt); clip tom_victory cut (75 pictures, 0 to 148 step 2); B3_BODY_CLIPS.tom.victory = tom_victory (was 'tom_victory')
- Running in (`body:tom:run`, rev 2): Wan job tom-run is now rev 2 (prompt file tools/art-library/prompts/wan-tom-run-v2.txt); clip tom_run cut (75 pictures, 0 to 148 step 2, loop wrap); B3_BODY_CLIPS.tom.run = tom_run (was 'tom_run')
- Cast (`body:tom:cast`, rev 4): Wan job tom-cast is now rev 4 (prompt file tools/art-library/prompts/wan-tom-cast-v4.txt); clip tom_cast cut (70 pictures, 0 to 138 step 2); B3_BODY_CLIPS.tom.cast = tom_cast (was 'tom_cast')

## guideuse-45790051267 (2026-11-26): Giving (support moves) (rose), Running in (rose), Knocked out (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Giving (support moves) (`body:rose:give`, rev 2): Wan job rose-give is now rev 2 (prompt file tools/art-library/prompts/wan-rose-give-v2.txt); clip rose_give cut (52 pictures, 0 to 102 step 2); B3_BODY_CLIPS.rose.give = rose_give (was 'rose_give')
- Running in (`body:rose:run`, rev 2): Wan job rose-run is now rev 2 (prompt file tools/art-library/prompts/wan-rose-run-v2.txt); clip rose_run cut (75 pictures, 0 to 148 step 2, loop wrap); B3_BODY_CLIPS.rose.run = rose_run (was 'rose_run')
- Knocked out (`body:rose:ko`, rev 3): Wan job rose-ko is now rev 3 (prompt file tools/art-library/prompts/wan-rose-ko-v3.txt); clip rose_ko cut (75 pictures, 0 to 148 step 2, 1.5x); B3_BODY_CLIPS.rose.ko = rose_ko (was 'rose_ko')

## guideuse-45789372779 (2026-11-26): Getting hit (rose), Dodge (rose), Guard (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Getting hit (`body:rose:hit`, rev 6): Wan job rose-hit is now rev 6 (prompt file tools/art-library/prompts/wan-rose-hit-v6.txt); clip rose_hit cut (55 pictures, 0 to 108 step 2, 1.5x); B3_BODY_CLIPS.rose.hit = rose_hit (was 'rose_hit')
- Dodge (`body:rose:dodge`, rev 4): Wan job rose-dodge is now rev 4 (prompt file tools/art-library/prompts/wan-rose-dodge-v4.txt); clip rose_dodge cut (58 pictures, 0 to 114 step 2); B3_BODY_CLIPS.rose.dodge = rose_dodge (was 'rose_dodge')
- Guard (`body:rose:guard`, rev 2): Wan job rose-guard is now rev 2 (prompt file tools/art-library/prompts/wan-rose-guard-v2.txt); clip rose_guard cut (65 pictures, 0 to 128 step 2, hold 36, lowering 120); B3_BODY_CLIPS.rose.guard = rose_guard (was 'rose_guard')

## guideuse-45787096926 (2026-11-26): Idle (standing and breathing) (rose), Guard (tom) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Idle (standing and breathing) (`body:rose:idle`, rev 2): Wan job rose-idle is now rev 2 (prompt file tools/art-library/prompts/wan-rose-idle-v2.txt); clip rose_idle cut (50 pictures, 0 to 147 step 3, loop wrap); B3_BODY_CLIPS.rose.idle = rose_idle (was 'rose_idle')
- Guard (`body:tom:guard`, rev 2): Wan job tom-guard is now rev 2 (prompt file tools/art-library/prompts/wan-tom-guard-v2.txt); clip tom_guard cut (65 pictures, 0 to 128 step 2, hold 32, lowering 106); B3_BODY_CLIPS.tom.guard = tom_guard (was 'tom_guard')
- start picture of tnb is now in `art/clips/start/tnb-hero.png` (you uploaded it; used exactly as painted)

## tomportrait1 (2026-11-26): Tom's face in the status screen, turn order, battle panels and Battle Guide is now cropped from his new painting

Card c-tomportrait1. Tom sent his new painting (the retro controller shirt, short beard) and asked for it to be his portrait. It is saved as `art/raw/characters/tom-hero-v3.png`; the face crop is square 465 px from (279, 28) in `data/portrait-crops.json`, the same zoom as everyone else, and `portraits/tom.png` is rebaked. Not seen on the phone yet. Dialogue faces still come from the emotion and walking sheets, not this crop.

## guideedit1 (2026-11-26): the Battle Guide lets you edit an animation's prompt by hand before you make the video

Card c-guide-editprompt. Tom (11-26): "in the battle guide i need the ability to edit the prompts for animations before i generate." Not seen on the phone yet.
- `battle-guide.html`: under Prompt, Edit this prompt opens a box with the prompt a new video would use; Save prompt keeps it (this browser), Cancel closes it, Reset to original brings the approved text back. Every Make this video, Retry and Make all missing poses already used the kept prompt, so the queue row carries the edit.
- Warns (second tap keeps) when an edit adds a word that pulls toward the wrong look (pixel art, 16-bit, sprite, gouache, green screen); refuses an empty prompt.
- Checked on a phone-width screen: open, edit, save, reload (still there), warning, empty, reset. The `guideedit1` checks are in `tools/battle_guide_test.py`; the full Guide suite already stops earlier on live queue data (a fal out-of-credit row), the same with and without this change.

