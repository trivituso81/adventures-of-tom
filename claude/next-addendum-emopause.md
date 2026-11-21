# Emotion poses (Tom 2026-11-09; emopause1 6d5dd69, emopause2 26cfbe0)

## emopause2 (Tom 12:37): TNB, Grace, Rose back on, sized by face
- Tom: "TNB, Grace and Rose's proportions look good. the emotional states just need to be sized up according to head shape compared to their standing pose baseline."
- `EMO_HEAD` in tools/sprite-bake/bake_story_poses.py: one factor per character for all 8 moods, no per-frame shrink (match_standing skipped). Strip px per standing px at matched FACE size: TNB 1.20, Grace 1.10, Rose 1.30. Method: standing frame laid over happy, proud, unimpressed faces at several sizes, aligned at the eyes (/tmp/pair.py style). Do NOT measure top of hair to chin: mood hair is fuller, first try came out 27% too big for the girls.
- Result in game rows: Grace 40.6 stand vs 37.8 to 39.1; Rose 36.6 vs 35.3 to 36.2; TNB 44.9 vs 38 to 39 (shorter body under the same face).
- `EMO_POSE_PAUSED` now: tom, amy, deedee, olivia, justin.

## Tom and Amy: the reference picture is the problem (fact, compared side by side)
- Tom (12:37): Tom's body "completely different", generator will not stay true to the reference; Amy's skin color and face not consistent with the walk/stand.
- The `tom-emotions` and `amy-emotions` entries attach `<id>-hero-ref-v1.png`. The game draws the walk, cut from `<id>-walk-sheet-v1.png`, which does NOT match the hero: Tom's hero is stockier with hairy arms, navy shirt, grey jeans, bigger head; his walk is slim. Amy's walk face (big round eyes, freckles) and skin differ from her hero. The emotion sheets follow the hero, so they can never match the walk.
- Second cause: prompt v2 is about 3,800 characters of style and proportion words. Tom's working recipe (walk, 11-04): short, positions only, the picture carries the look; words override the picture.
- RECOMMENDED, waiting on Tom's go (prompts are agreed in chat before any Library change): (1) refs = the front standing cell (cell 1, top left third) of `<id>-walk-sheet-v1.png`, saved as `art/raw/characters/<id>-stand-front-v1.png` (a plain crop, no edit); (2) a short prompt in the walk-recipe style (draft in the chat 11-09 12:37 session, also below). Same 4 x 2 grid and pose order, so emotion_frames.py and the cutter stay unchanged. Tom first, then Amy. If Tom approves the method, offer it for Deedee, Olivia, Justin too (also still paused).

### Draft short prompt (Tom has not approved yet)
Draw the person in the attached picture as an emotion sheet.

Keep them exactly as they are in the picture: the same face, skin, the same head size compared to the body, the same hair, clothes and shoes, and the same painting style. Only the pose and the face change. Do not change the proportions from cell to cell.

One image, a grid of 4 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One full-body figure per cell, facing the viewer, the same size in every cell, feet on the same ground line, nothing touching a cell edge. No grid lines, numbers, text or shadows.

Row 1:
1. Happy: up on the toes, hands clasped at the chest, eyes crinkled, a big open smile.
2. Loving: head tilted, both hands flat over the heart, a soft closed smile.
3. Sad: shoulders dropped, head lowered, hands held together at the waist, mouth turned down.
4. Angry: feet planted wide, arms crossed tight, eyebrows pulled down, a tight frown.

Row 2:
5. Scared: knees bent, fists up under the chin, eyes wide, mouth stretched open.
6. Surprised: one foot stepped back, open hands beside the face, eyebrows high, mouth a tall O.
7. Proud: chest out, chin up, fists on the hips, a one-sided smile.
8. Unimpressed: weight on one leg, one hand on the hip, eyelids half lowered, mouth a flat line.

## Install of any new approved emotion sheet
- claude/next-addendum-emoredo.md steps, plus: remove the id from `EMO_POSE_PAUSED`, add the id to `EMO_HEAD` with its face-matched factor (overlay method above), rebake story poses, contact sheet stand next to 8 moods at one scale, bump tags (EMO_V by hand if faces change).
