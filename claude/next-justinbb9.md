# justinbb9: Justin production clip, stopped by the stop-loss rule (2026-11-25)

Order: one transparent .webm for justin-bb-basic, 3.5 to 4.0 s, Kling v3 Pro from start.png only, QA gates, push preview.html. Spend cap lifted by Tom (CAP in run.py is now a $60 runaway guard; $3.68 spent in total over 9 renders).

## Done
- Gate 1: the old start.png had a pastel green background (127,218,99). Replaced by a copy with exact #00FF00 (0,255,0) everywhere, including pockets between arm and torso. Old file kept in sandbox-justin-test/attempt8_start/. Face, outfit and proportions untouched (same picture, background only).
- run.py now uses Tom's exact Kling prompt and negative prompt, duration 5.
- Roll 1 (run 45726920428, saved in attempt9/raw.mp4, contact sheet attempt9/roll1-sheet.png): FAILED Gate 2.

## Why roll 1 failed
1. Kling returned a 3.04 s clip even with duration "5", so a 3.5 to 4.0 s final is impossible from it.
2. Kling turned the background pastel green (125,215,96) although the start frame was exactly (0,255,0). "Key out only #00FF00" cannot work on any Kling output; it needs a dominance key like key.py.
3. After about 1 s he squares up to the camera and his expression turns to a scowl (the negative prompt "angry face" and "turning right" were ignored), the stud finder drops to his hip and the hammer is swung out at arm's length instead of a rap, and he never settles back into the start stance.

## Same miss twice
Attempt 8 (long style prompt) and roll 1 (Tom's short prompt) are different prompts with the same failure: he rotates toward camera, the face changes, the props do not stay where the prompt puts them. The prompt is not the lever, so a third Kling roll from one image would be the same bet. Stop-loss rule applied: no third roll.

## Next session should
- Keep Kling v3 Pro, image-to-video from start.png only. Change implementation, one thing at a time: cfg_scale (default 0.5, now 0.85), duration (ask for 6 s, the 5 s ask came back 3.04 s), key by green dominance (key.py) because the output green drifts.
- Keep the 8-frame checkerboard QA (frames at (i+0.5)/8 of the duration).
