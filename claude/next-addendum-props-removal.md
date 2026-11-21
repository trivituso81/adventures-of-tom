# Props removal from the Art Library (Tom 2026-11-06 11:44): QUEUED LAST, build nothing until Tom says

Tom's question: is the Props section in the Art Library obsolete now that props are covered in the Characters section (the `<id>-fx-<move>` entries for the new art)? If so, remove that functionality, and add the job LAST in the queue unless Tom says something else goes first.

## Finding (fact, checked 2026-11-06 against data/art-prompts.json, 657 entries)
The Props tab (53 entries) holds two different things:
- OBSOLETE, 34 entries: character prop sheets `prop-<owner>-<n>` (tom 3, grace 3, rose 2, amy 3, deedee 2, boppy 3, tnb 4, tombo 10, nara 2, justin 2). All are drafts with 0 versions (nothing generated or approved), so removing them loses no art. Their job (painted props for each move) is now done by the 118 `-fx-` entries in Characters (tom, grace, rose, deedee, tnb, nara, boppy 14 each; olivia 11; justin 9). Amy fx is queued separately (item 2i).
- STILL NEEDED, 19 entries: `prop-find-*` (13 Dungeon finds sheets) and `prop-trail-*` (6 Trail clues sheets). These are map overlay objects, not character props, and no Characters entry covers them (queue item 4, docs/DUNGEON_FINDS.md). The Props tab stays, with only these two groups.

## What to do when Tom releases it (decision made: remove only the 34, keep the tab)
1. Rebase first. Edit data/art-prompts.json directly (`{'entries': [...]}`, `json.dumps(d, indent=1, ensure_ascii=False) + '\n'`): delete the 34 `prop-<owner>-<n>` entries; assert the other entries are unchanged and the count is 657 - 34 = 623 (re-count first, other sessions add entries). Re-check each of the 34 is still draft with 0 versions; if Tom approved or generated any by then, stop and ask one line.
2. Delete tools/art-library/prop-prompts.js and remove 'prop-prompts' from the module list in make-prompts.js (line 22). Remove `PROP_OWNERS` and the owner lookup in groups.js (`case 'Props'` must return 'Dungeon finds' or 'Trail clues' by id prefix instead). Mirror in validate.js if it checks Props groups. Update tools/art-library/test.py EXPECT counts (Props 53 to 19, Props groups 12 to 2).
3. art.html: the Props tab and TABS list stay. Check no UI code names the removed character groups (grep `PROP_OWNERS`, `props,` and the group names Tom, Grace... under Props).
4. Docs and notes: remove or rewrite the Props paragraphs in docs/PROP_ART.md that describe the Library prop sheets; add a docs/CHANGES.md entry; note in claude/canon-addendum if useful. Grep the removed ids and names for 0 hits (Purge rule).
5. DO NOT touch in this job: the in-game prop renderer (`engine/prop-art.js`, `PROPART`, art/props/*.webp, `tools/sprite-bake/bake_prop_sheets.py`, props.json, tools/sprite-bake/src/props/). The live game still draws baked props for moves not yet installed with painted frames. Retiring those is a separate job after every character is installed; mention it to Tom once, do not start it.
6. Tests: `node tools/art-library/validate.js`, `python3 tools/art-library/test.py` (pre-existing count failures noted), `python3 tools/tag_check.py`. Art Library json is untagged. Push per the procedure in next.md. No Generate cost.
