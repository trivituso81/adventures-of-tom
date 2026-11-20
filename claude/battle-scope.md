# Battle system scope: battle animations are NOT part of it (Tom, 2026-11-19 17:01)

Tom: reviewing battle animations is out of scope for the battle system. He handles it as a separate task. There is no direct dependency between the mechanics and the animations.

## The rule for every battle system session (stages 9 to 23, balance, story switches)

| Question | Answer |
|---|---|
| Do you ask Tom to review, judge or approve a battle animation or clip? | No. Not at a milestone, not in a closing reply, not on a card. |
| Do you wait on an animation or clip to finish a stage? | No. A move uses the default animation (`anim:{kind:'default'}`) until an animation task changes its row. |
| Do you build, wire, tune or fix clips or animation timing as part of a stage? | No. Only keep the seam working (below). |
| What does Tom judge at Milestones A, B, C and D? | Mechanics only: is it fun, is the pace right, can he read the screen and turn bar, do fights run too long or short, do the kits feel like the family. |
| Where do animation notes go? | The animation thread: Battle Animations theme on the board, Chapter Review in Battle Lab, `claude/animation-chapter-plan.md`. A battle session that receives an animation note files it as a card in that theme and does not act on it. |

## Why it holds (fact, from claude/battle-architecture.md section 2.7)

Battle 3 works out the whole result of an action first and writes it as beats. The play layer shows the beats afterward. A clip only calls `reveal(share)` on its impact frame; the rules never wait on it. A move changes from default to script to clip by editing its `anim` data row. So animation work never changes a rule, and a rule change never breaks an animation.

## What stays in battle system scope (the seam)

- The `anim` and `wind` fields on a move or act row exist and default sensibly. A new move gets `anim:{kind:'default',shape:...}`.
- Hits land with or without the clip (the 2.5 second fallback to the default animation stays).
- The rule tests, the simulator and the screen tests still pass. Screen tests that look at frames check that the screen is readable, not that an animation is good.
- A kit stage lists the spoken lines for the Voice Library (that is voice, not animation).

## What this changes in the other docs

- claude/battle-build.md, Milestone A: ignore "the video attacks" and "the first video attack" as things for Tom to judge. The stage 8 call rows on clip pace, clip waits and the crossing to the monster, and the Owed rows on clips, now belong to the animation thread.
- Stage 8's clip hookup stays built. Nothing is removed.
