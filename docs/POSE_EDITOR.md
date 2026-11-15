# Pose Editor: the rules in force (this file wins over claude/pose-editor-plan.md and claude/pose-editor-poseedit2.md in the Project)

Page: `poses.html` (ADMIN > POSE EDITOR). Manifest: `python3 tools/pose-editor/manifest.py`. Test: `python3 tools/pose_editor_test.py`. Tom's saves: `data/pose-requests.json` on main (never overwrite with an older copy).

## Sizing rule (Tom 2026-11-14 21:55, word for word in docs/CHANGES.md `poseedit4`)
"Based on me setting the chin and the top of the head, you should be able to make all of the head sizes equal and then place them on the body and then each body needs to be set to the exact height of the character. Can't deviate, so you're gonna have to as a result of the height calculation end up shrinking the body accordingly."

For every pose Tom has checked (walking, feelings, talking; later sets the same):
1. HEAD: the distance from his top line to his chin line becomes the person's head size = Tom's front standing head x the person's head target (adults 100 percent, Grace and Rose their own share). Same in every pose.
2. HEIGHT: the pose is exactly the person's real height. Hair above the top line is taken from the person's front standing pose (same in every pose). The body (chin line to the bottom of the picture) is shrunk or stretched to fill what is left: `f = (R/S - hair/S - h x (chin - top + 6)) / (feet - chin - 6)` (poses.html `bodyOf`; 6 = half the 12 px neck taper).
3. No per-set shared body size any more (that was `poseedit2` and made poses taller than the person). The only frames that share a size are walking steps, which follow their standing frame so the walk does not pulse.
4. Crouched or bowed poses are stretched to full height by this rule. That is what Tom asked for. If one looks wrong he uses the Whole pose slider on that pose (`sAdj`); do not add an exception in code.

## Page behaviour
- Two lines per pose (top of skull, chin). Moving a line, an arrow nudge or a size slider marks the pose checked (`ok:true`). LINES ARE RIGHT is for proposals that are already right. Only checked poses are applied.
- Sliders: Picture zoom (view only), Whole pose (`sAdj`), Head only (`hAdj`). `fAdj` (body only) exists in older saves and is still honoured.
- A two-finger pinch on the picture is ignored on purpose.
- Result picture: the standing guide is always drawn at the rule size, so its dashed lines are where every resized head must sit.

## Dialogue faces follow the lines (Tom 2026-11-14 22:08, `posefaces1`)
- Every dialogue face (plain talk face from the front standing pose, the 8 feelings faces, the 4 talking-pose faces) of a pose where Tom has set his own lines is cut by those lines: the top-of-head line sits at `top` and the chin line at `chin` of the square, centred on the skull. Module `tools/pose-editor/pose_faces.py`; hooks in `bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py` (`PF.has`, `PF.face`).
- The master setting is `data/portrait-frame.json` (`{"top": 0.13, "chin": 0.86}`). Tom changes it in POSE EDITOR > EVERYONE > Portrait frame; that saves `portrait:{top,chin}` in the request file, which wins in the bake. When applying, copy it into `data/portrait-frame.json`.
- A pose Tom has not lined keeps the old framing (his lines are used even when the pose is not checked; my proposals are never used for faces: they are too rough).
- "Apply my pose sizes" therefore ALSO means: rebake the faces of everyone in the request file: `bake_emotion_faces.py <ids>`, `bake_talk_faces.py <ids>`, `bake_talkpose_faces.py <ids>`, look at the CHECK sheets, bump `EMO_V` (engine/emotions.js) and `TALK_V` (engine/overworld.js). This part needs no other bake and can be done before the pose sizes themselves are baked.
- Saved hero crops were deleted on Tom's order (`data/portrait-crops.json` is `{}`), so menu and battle portraits (`portraits/<id>.png`, from the hero paintings) are back to `bake_portraits.py` FACE framing. Hero paintings have no Pose Editor lines yet. RECOMMENDED NEXT (say it to Tom, do not build unasked): add each hero painting to the Pose Editor as a "Menu portrait" pose with the same two lines, cut `portraits/<id>.png` with `pose_faces`, then retire PORTRAIT CROPS (`portraits.html`, `data/portrait-crops*.json`).
- Watch: Tom's own front standing pose has TOP at 0.6 px (set in his first save, before the pinch fix) while his other poses have TOP near 6 to 13 px. That makes his plain talk face bigger than his feelings faces AND makes his standing head, the measure for everyone, about 15 percent taller. Ask him to look at that one line.

## Not built yet
Applying the saved sizes in the bakes. Method notes: claude/pose-editor-poseedit2.md "NEXT: the apply build" (use this file's rule 2 and 3 for the body, per pose).
