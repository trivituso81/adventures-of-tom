# Emotion sheet redo (Tom 2026-11-09 10:07, main at 7c05e2a, CHANGES "emoredo1"; Art Library only, nothing in the game changed)

## Fact
- Tom's Nov 9 audit: only Boppy and Nara match their hero paintings; Tom, TNB, Deedee, Grace, Olivia, Amy, Rose fail (head size, color drift), Justin close.
- Measured (ruler, by eye): heroes are 3.2 to 4.2 heads tall (head share top of hair to chin over full height .24 to .31: Tom .29, Amy .24, Justin .31, Olivia .25, Grace .28, Rose .27). Failing sheets about 2.8 heads (Tom .36, Grace .37), brighter and more orange than the heroes, ink hatching lost, magenta tint on edges.
- `tools/art-library/prompts/char-emotion-sheet.txt` v2: HEAD AND BODY PROPORTION (count head heights in the hero and keep that count; about 3.5, between 3 and 4; no big-head sticker look), PAINTING TECHNIQUE (brown ink line work, pen hatching, light watercolor wash, paper grain), COLORS (copy hero colors, no warming or saturating, magenta is only a backdrop), no ground shadow, final self-check. Grid, cell order and the 8 poses unchanged, so `emotion_frames.py` and data/emotions.js need no change.
- Back to draft, title ends "redo: match the hero head size, colors and hatch texture": tom, tnb, deedee, grace, olivia, amy, rose, justin `-emotions` (8 Generate presses; earlier versions stay in each entry). Boppy and Ellie carry the new prompt text but stay approved. Nara keeps her own prompt. Builder mirror: `EMOTION_REDO` in tools/art-library/char-prompts.js. Rebuild changed exactly those 10 entries (checked by id); validator OK; tag check ok.

## Recommended to Tom
- Generate Tom first and compare his head row with the hero before running the other seven.
- If heads still come out big with v2: do NOT write a third wording (stop-loss). Next lever is taller portrait cells (changes the entry `ar` and the cutter), or attaching Boppy's approved v2 sheet as a proportion example.

## Install, after Tom approves each new sheet (Boppy v2 recipe, claude/next-addendum-boppy-emotion.md)
1. Save as the next `art/raw/characters/<id>-emotions-vN.png` (older versions stay: approved sources are exempt from purge).
2. `python3 tools/sprite-bake/emotion_frames.py <id>` (point it at the new version), `CHECK=/tmp/f.png python3 tools/sprite-bake/bake_emotion_faces.py <id>`, look at the head row next to the hero portrait.
3. Rebake story poses (`python3 -I tools/sprite-bake/bake_story_poses.py`). Its `match_standing` head shrink may no longer be needed for that id: compare head share before and after.
4. Purge what is replaced, bump `EMO_V` by hand plus ART_V (bump_tags misses EMO_V), smoke, CHANGES, push.

## Doc conflict (not changed)
- STYLE BLOCK v2 in docs/CHARACTER_PIPELINE.md says the head is about one third of full height; approved heroes are about one quarter. The emotion prompt follows the heroes. Fix the doc only if Tom asks.

## Local tooling note
- In a sparse or blobless clone without art/, make-prompts.js and validate.js fail on missing files. Run them with fs.existsSync patched to also accept paths listed by `git ls-files`. Never run `git ls-tree -l` in a blobless clone (it downloads every blob).
