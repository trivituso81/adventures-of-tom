# Battle 3, stage 9: where it stands after b3s9a (2026-11-19)

Read with `claude/battle-build.md`. Where they differ, this file wins until the next stage session folds it into battle-build.md (that session's job: add rows 9a, 9b, 9c to the stage board and rewrite "Next conversation").

## What b3s9a did (fact, main 95cb1d9)

Tom played the new battle and sent notes instead of milestone A steps: "I don't like the skill description at the top above the character bars. When tapping a skill it should hide the other skills, show all the information about that skill, then 2 buttons one Back and the other Use. On the view that lists the skills, the clobber support etc should be changed to an icon. The pep used should be more prominent." Built and pushed as b3s9a. Detail: docs/CHANGES.md "b3s9a", docs/handoff/b3s9a.md.

| Piece | Fact |
|---|---|
| SKILLS list | Name, flavor pictures (`b3FlavorIcons`, `B3_FLAV_IC`; Support is the hugging face), Pocket backpack, Pep pill (`b3CostPill`). No preview box. |
| Skill card | `B3.ui==='skill'`. Name, Pep pill, flavor pictures with names and kind, the full `desc`, why it cannot be used, the preview, BACK and USE (`[data-use]`). USE goes to targets; Back from targets returns to the card. Rose Mode: `b3pSkill`. |
| Message line | Never shows a Skill description now (SKILLS, card, target list). |
| Tests | `python3 tools/b3_test.py s9ui` new; the whole file passes. `skill()` opens the card, so one more Enter is USE; `pick_row()` presses Enter twice. |
| Not a regression | `tools/board_sync_test.py` fails "board_check --push refuses a build whose card has no after" because its fixture card c-board3 is Done on the live board. Not caused by b3s9a. |

Milestone A: Tom played and his notes were the UI ones above. No note on pace, the turn bar or Rose Mode was given; treat those calls as standing.

## Stage 9 is split in three (call made in b3s9a)

| Part | Card | What | Why this size |
|---|---|---|---|
| 9a | c-b3s9 | The skill card (done) | Tom's notes first |
| 9b | c-b3s9b | TNB: Ceramicist and Longboarder complete (kit-ops rows 127 to 140: 2 Traits, 2 Basics, 4 Skills, 2 Capstones, 4 Quirks). 6 CUSTOM lines: Wet Clay to Stoneware, Three-AM Kiln Firing, Grand Amphora Masterpiece, Kintsugi Gold Seam, Waymo Tailgate Rescue, Baxter Hill Longboard Express. A Lab fight with TNB in the party (the chapter 2 party). | kit-ops: "give TNB his own conversation" |
| 9c | c-b3s9c | Nara (Attached Pup and Guard Dog) and Boppy (The Dep and Pepper Boss): 28 lines, 6 CUSTOM (Nara's 4 and Boppy's 2 that sit in those four Vibes; kit-ops' CUSTOM list names them, check each against its Vibe in the spec). The late joiners' Vibe Point pool (spec section 1). Lab fights with the chapter 2 and 3 parties. Its `## b3s9c` heading ends stage 9. | 28 lines, 6 CUSTOM |

Check before building: kit-ops lists each character's three Vibes as three blocks of 7 rows, but does not label which block is which Vibe. Map each block to its Vibe from the spec section 3, not from the row order (the Sig Vibes are in kit-ops' last paragraph).

## For every kit part (9b, 9c)

- Every new Skill needs a full plain sentence in `desc`: the skill card now shows it as the only explanation.
- Read before building: `docs/BATTLE3.md`, `docs/handoff/b3s8.md` and `b3s9a.md`, the spec section 3 lines for the character, kit-ops rows, bestiary only if a Lab fight needs a new formation.
- New characters need body-clip rows in `data/b3-clips.js` or they use the painted poses (fine for now; no clips exist for them).
- Calls go into battle-build.md's "Calls made that Tom has not confirmed" table, one row each.
- Between milestones the closing reply says "Nothing needed from you" (battle-build.md "When Tom tests"). Milestone B is after stage 15.

## Prompts (also on the board cards)

| Part | Model | Effort | Prompt |
|---|---|---|---|
| 9b | Claude Sonnet 5.5 (row C: a build whose custom functions are designed in the session) | high (6 of the 14 lines need a new function worked out from the spec) | `Read claude/battle-build.md and claude/next-addendum-b3s9a.md, then build stage 9b (TNB) of the new battle system. You have my full permission to access the repo.` |
| 9c | Claude Sonnet 5.5 (row C) | high (6 of the 28 lines need a new function) | `Read claude/battle-build.md and claude/next-addendum-b3s9a.md, then build stage 9c (Nara and Boppy) of the new battle system. You have my full permission to access the repo.` |

If a part fails twice the same way: handoff rules step 4 (effort up one step first; then Claude Opus 5.5).
