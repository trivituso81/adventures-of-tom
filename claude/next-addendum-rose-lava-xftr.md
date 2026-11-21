# Rose, The Floor Is Lava!: stop-loss on Wan, next is Kling 4.0 (card c-anim-rose-lava-xftr, 2026-11-21)

Tom's notes: lava forms under her, she throws a couch cushion on it, hops on it and bounces. (Bouncing onto the enemies cannot happen in a clip that stays on one spot.)

## What was tried (all Wan 3.0 via fal, prompt v2/v3 tell the story right every time)
| Try | Start picture | Result |
|---|---|---|
| rev 1 (in the game now) | rose-hero | Baked and shipped earlier (wanch1); Tom's notes ask for the cushion story |
| rev 2 | rose-hero | Shrinks to 0.67x on the cushion; cushion flies in from outside the left edge |
| rev 3 (pad 0.8) | rose-hero | Shrinks to 0.79x; cushion from outside; lava runs off both sides |
| rev 4 (this session, $0.65) | rose-cushion (new, passes: same girl, faces left, cushion in both arms, flat magenta) | Story right and nothing enters from outside. FAILS: lava fills the whole frame width and touches both side edges in 81 of 150 pictures (same fault as rev 3); in the bounce her head is about 1.2x its start size (the camera pushes in), by eye and by the measure (scale 0.79 to 1.15); she turns toward the viewer and a collar appears; the clip ends with the cushion back in her arms |

## Why (a conclusion from the four tries)
Wan treats "lava on the floor" as a scene to fill and "bounce" as a reason to move the camera in. A smaller start picture (pad), a cushion already held, and the words "a small pool" did not change that. It is the model, not the prompt or the start picture.

## Next (one change: the model)
Kling 4.0 (`kling/v4/image-to-video`, $0.157 a second, 5 s = about $0.79) fixed Rose's Tackle after Wan missed it twice (wanch2). Make job `rose-lava-kling` like `rose-tackle` in `tools/art-library/wangen-jobs.json`, with the start picture `art/clips/start/rose-cushion.png` and `tools/art-library/prompts/wan-rose-lava-v3.txt` word for word. Check every picture against claude/video-battle-plan.md 4.4 plus: head size within 8% of the first picture, lava inside the frame, nothing entering from an edge. If it also misses on size or lava width, the lava is the problem: then make the clip WITHOUT lava (Rose tosses the cushion, hops on it, bounces twice; prompt has no lava) and have the game draw the lava as an effect under her (an effect, not a pose, so the No painted poses rule is not touched). Do not send a third Wan try.

Files kept: `art/clips/start/rose-cushion.png` (approved start picture), `tools/art-library/prompts/wan-rose-lava-v3.txt`, `hero-leftfacing-magenta-cushion-v1.txt`. The rev 4 video is on branch `wangen` (`rose-lava-r4.mp4`). The game still plays the old clip (data/clips/rose-lava.js, from rev 1): nothing was baked or changed. fal ledger after this session: $49.24 (cap input 50.1).
