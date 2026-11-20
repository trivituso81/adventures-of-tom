# Animation tool test: Nara results (2026-11-17 12:40), addendum to claude/animation-tool-test.md

Clips: Kling 3.0 Omni, 3 s, 776 x 1184, 24 fps, 73 frames, cream start and end frame (Nara sitting, facing the viewer; hero picture is the pencil look). Prompts: `claude/anim-test/anim-test-nara-1-idle-v2.txt` and `-2-strike-v2.txt` (rewritten for a SITTING dog).
Rose hero picture received (standing, three-quarter, yellow gingham dress, red bow, pink sneakers). Rose clips not run yet (uses the Tom v2 prompts 1 and 2).

| Clip | Verdict | Evidence |
|---|---|---|
| Nara idle | Pass with one flaw | Figure height 1157 to 1159 px, head width spread 0.4 percent, first vs last frame 1.96 of 255 (loops), background constant, style and fur color constant. Flaw: around frames 24 to 40 a dark fur blob appears at the left rear of the dog (probably the far hind leg or tail moving). Look at it once more before calling it clean. |
| Nara pounce | Mixed | Starts and ends exactly on the picture (first vs last 2.36, loops). Bow and hop read well. Flaws: in the fast frames (about 24 to 48) the dog is motion-blurred, darker and smoother (loses pencil lines), the frame fills the head close to the camera, and the tail and ears smear. The head width metric (75.7 percent) is invalid there: the dog moves toward the camera, so the head genuinely grows (perspective), not a morph. |

Tool note: the script measure_clip.py reads head width from the top 20 percent of the figure; it is not meaningful when the dog leaves its stance.
Next: Rose idle and strike (needs credits answer from Tom), cutout test of the Nara idle from cream, decide how to handle the pounce (move toward the camera is a perspective change; ask for a sideways hop in place or a stronger lock on size).
