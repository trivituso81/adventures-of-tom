# NPC hero art: audit, prompt fix, and the no-credit head fix (2026-11-09, main at 134e5f7; CHANGES "npcaudit1", "npchead1")

Read with claude/next.md and claude/next-addendum-npc-ff9.md. Addendum, not in next.md, because the Boppy fx session was rewriting next.md at the same time.

## State (fact)
- 56 `npc-photo-<id>` entries. Approved 54. Draft 2: Ryan, Dakota.
- 12 approved heroes are v3 = v2 with the head enlarged locally by `tools/art-library/npc_head.py` (no generation): Chet, Dash, Wes, Ray, Claudia, Kit, Bean, Luna, Sam, Juniper, Toni, Yesenia. v2 kept so Tom can compare. If he approves v3, purge v1 and v2 of those 12 (purge rule); if he prefers v2 for any, drop that v3.
- Approved as generated in round 2 and fine: Bun v2, Bernadette v1 (no hat), Alvarez v2, Beto v2.

## What happened (so nobody repeats it)
1. Round 1 (original prompts): 13 adults of 18 to 59 came out as children.
2. Round 2 (my GROWN-UP paragraph, about 70 words): adults came out 6 to 7 heads tall and too realistic, and three lost their hats (Kit, Luna, Dash). Faces were right.
3. Tom's rule (11-09): in image prompts, fewer words and less information give truer results. Generators get confused by detail. Do not add paragraphs to fix a miss.
4. Fix that worked, zero credits: keep the generated picture and correct proportions locally. Head share (hair top to chin over height) raised to about .25, cap k 1.75.

## npc_head.py
`python3 tools/art-library/npc_head.py '[["npc-photo-chet-v2.png",205]]' /tmp/sheet.jpg` from the repo root; output in /tmp/fix (env OUT). Each job needs the chin row in pixels (read it off a ruler crop of the picture; the 12 used are in the file's docstring). It warps rows above the chin about the neck with a 28 row taper, only the head's own connected shape and the neck columns, so hands and props beside the head stay as painted. Always look at the before and after sheet. Known small flaws: a slight notch where hair or collar meets the shoulder (Chet right shoulder, Sam hair ends).

## Prompt state
`details()` is now short: color words without hex codes, "An adult, not a child." for 18 to 59, "A young teenager." for 12 and up, "No words on the background.", face rule. Tom's template and the STYLE REMINDER block are untouched (he wrote and asked for them); the reminder is about 90 repeated words, which goes against his fewer-words rule. Recommended to Tom: let me cut it to one line. Not done without his OK.

## Ways to spend fewer credits (recommended to Tom 11-09)
- Fix locally instead of regenerating: proportions (npc_head.py), captions (paint out), clothing color (recolor), hats. Regenerate only for a wrong face or pose.
- One test picture before any batch after a prompt change.
- Walk sheets: generate with the approved hero attached as the reference, so the look is copied, not described.
- Dialog portraits: crop from the heroes, zero credits (cropper not built yet).

## Next
- Tom: look at the 12 v3 pictures; generate Ryan and Dakota (2 pictures). If they come out too tall, do not regenerate: run npc_head.py on them.
- Then build the NPC portrait cropper (claude/next-addendum-npc-ff9.md).
- Still mild, left approved: Page, Fern, Kowalski, Kenji, Kiki, Sage, Jordan, Daisy read a bit young; Marisol, Halverson, Skye, Boomie are a bit tall (npc_head.py can fix these four for free if Tom wants).
