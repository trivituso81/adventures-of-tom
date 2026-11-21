# Boss endings Step 2 (bossend2, 2026-11-11, main at 2ad9aa5)

Follows `claude/next-addendum-bossend1.md` (assessment and proposal). Tom said "go" at 13:11, then: Step 1 (boss stays on the map) is being handled by ANOTHER conversation. This session did Step 2's spec and prompts only. `claude/next.md` was NOT rewritten by this session (the Step 1 session owns it right now); add this file and `claude/boss-endings-spec.md` to its read list.

## Done and pushed
- 22 draft Art Library entries, group "Boss endings": tab Enemies `ending-<id>` x 21, tab Characters `ending-sway-tom-deedee`. Seen on art.html: "Boss endings, 0 of 21 approved", rows Ready.
- Builder `tools/art-library/ending-prompts.js` (`--merge` never touches an approved entry), listed in `make-prompts.js`.
- Full spec: `docs/BOSS_ENDINGS.md` in the repo, copy in the Project as `claude/boss-endings-spec.md`. It has the sheet rules, the one-time build pieces (baker ending mode, `_end` atlas, finale step, calm portrait, real-win test), frame names and the beat sheet per boss, kind and plain win, reuse check, and what was not checked.
- validate.js OK (812 entries), in_game.py --check ok, tag_check ok (no tag needed).

## Corrections to bossend1 (fact)
- Twin Lenses, Vance, Censor, Leviathan and Julian are `scripted:false` in the running game, so they fall after a real win like the others (was "probably").
- All 22 boss sheets were looked at. Changes to the proposal that followed: the Director's Cut has no beret; the Big One keeps his own rusty tin hat (only Deedee's tin moves); the Archivist is the lens machine itself; the Censor's "black bar" is a full black face covering; Gridlock Prime is a bus with a traffic light on its roof; HUSH-9 is the laughing "train".
- Every sheet is now six poses (Marlowe and Brain Freeze four), with pose 1 the calm stance as the size anchor. Tom's cost is one Generate per sheet, 22 in all.

## Next
1. Wait for Tom to approve `ending-bigone` (pilot). Then build chapter 1's ending per the spec, test with a real win in portrait and landscape, show Tom, push.
2. Then the rest in chapter order as sheets are approved.
3. Before building: read the Step 1 session's CHANGES entry and reuse its scene step.
4. If a sheet misses twice for the same reason, stop-loss: the likely fix is splitting it into two 2 by 2 sheets or attaching the boss's baked stance frame alone as a third reference.
