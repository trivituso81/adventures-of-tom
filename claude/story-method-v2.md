# Story writing method v2 (standing, 2026-11-17). Replaces section 5 of claude/voice-studio.md and the steps in claude/story-writing-method.md.

Tom's goal: configure the voices once, approve one or two examples, then get witty, clear chapters without having to decide or mark every scene. He has said repeatedly that marking scene by scene is exhausting. Design everything so he reacts once per chapter.

## Hard rules for the writer
1. Never decide for Tom by asking. Make the call, say what it was, move on. Ask only about things that cannot be undone.
2. Voice Studio example lines, signature move examples and approved sample lines show a PATTERN, not text. Never copy or lightly reword one. Build each joke from the move's mechanism using this scene's own content. (Tom 2026-11-17: "I thought I was approving the style of humor, not the exact line.")
3. Every joke must work in the spoken words alone. Action lines may use only what the game already shows (claude/story-engine-capabilities.md). Anything else is tagged NEW ART with its cost.
4. A pun must make sense on its face. If a pun needs decoding, it is cut.
5. A line with no joke and no job is cut. Plain talk is fine only when it moves the scene or answers a line.
6. Tom's marks are never repaired one at a time. Each mark goes into claude/story-benchmark.md (and the character's config) so it cannot come back.

## The seven layers
| Layer | Where | Who keeps it |
|---|---|---|
| Voice configs | Voice Studio database | Claude |
| Exemplar bank (approved examples plus WHY each works) | claude/story-benchmark.md, section "Exemplars" | Claude |
| Benchmark (every Sounds right / Sounds wrong with reasons, plus failure patterns) | claude/story-benchmark.md | Claude |
| Engine capabilities | claude/story-engine-capabilities.md | Claude |
| Scene brief (what happens, the one funny thing) | claude/story-chNN-pitches.md | Claude, Tom says yes or notes once |
| Writing loop | below | Claude plus a separate reviewer agent |
| Tom's review | one finished chapter | Tom, marks only; unmarked counts as accepted |

## The writing loop (per chapter, no Tom input)
1. Read the pitches, the configs of every speaker and pair, the benchmark and the engine capabilities.
2. For every exchange write at least three candidate versions. Each joke is built from a named move's mechanism plus this scene's own content.
3. A SEPARATE reviewer agent (fresh context, never saw the drafting) scores every candidate line against: sense on first read, whether the joke works in words alone, speaker's Never rules and firm sliders, the pair rules, the benchmark right and wrong lines, copy-of-example check, jokes at most one in three. It picks the best candidate per slot or rejects all, naming the rule broken. Rejected slots are rewritten and re-judged until they pass.
4. Assemble the chapter (60 to 70 lines for chapters like chapter 1), add delivery notes and voice scripts in Tom's tagging style.
5. Only now Tom sees it: one review page, one pass. He sends marks. Claude puts every mark into the benchmark and configs, fixes in one pass, and republishes. Tom saying nothing means accepted.
6. If a draft draws more than about 15 marks, the benchmark or the scene brief was wrong. Fix that, do not patch lines.
7. On lock: save claude/story-chNN.md as LOCKED with a facts table, and update the benchmark with every right and wrong mark.

## What is still needed from Tom (one time, small)
- Reaction to the first finished chapter. Nothing else.
