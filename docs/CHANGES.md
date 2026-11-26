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

