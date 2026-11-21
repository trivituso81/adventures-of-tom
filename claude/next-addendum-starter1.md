# starter1 (2026-11-12 ~19:00, main ea9498c): chapter 2 "Feed the starter" scene did not start

- Tom 18:49: in Tom's house at the kitchen island, A on the starter jar gave only the island caption. Objective showed "Feed the starter" (so `ch2-nara` set, `ch2-starter` not).
- Fact (cause): TRIGGER `ch2-starter` (data/scenes.js) had `at:[7,9,8,12]`, a box in the front hall. Triggers only fire while Tom STANDS STILL inside the box (engine/story.js `storyTriggers`), so walking through without stopping never started the scene, and A fell through to the island object.
- Fix (done, pushed, smoke FAILS [], tag `starter1`): removed `at`. The scene walks Tom to (8,5) itself. New check in `tools/tomhouse_test.py` ("ch2Starter starts when Tom stops at the island"): fails without the fix, passes with it.
- Pattern to watch (fact): any other TRIGGER with an `at` box can be skipped by walking through. If Tom reports another "scene never started", check its `at` first.
- Tom's check: fresh chapter 2 save, enter the house and walk to the island; the scene should start when he stops. Title stamp `build starter1` or later.
- Not merged into claude/next.md (large file, other sessions edit it); the next session that rewrites next.md can fold this one section in.
