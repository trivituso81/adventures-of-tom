# NPC hero prompts on Tom's template, main heroes as references (Tom 2026-11-09; main at 0fd58e1, published; CHANGES "npcref1", "npcref2", no tag)

Read with claude/next.md. Supersedes the prompt parts of claude/next-addendum-npc-ff9.md and claude/npc-art-audit-11-09.md.

## Facts (current, npcref2)
- All 56 `npc-photo-<id>` entries: prompt = Tom's template word for word (starts "Paint the person in the below description"), one reference line, then one `character details:` line (name, age, gender, height, skin, hair color, hair style, clothing, personality, job). Tables in tools/art-library/npc-prompts.js: `HS` hair styles (read off the earlier approved NPC pictures), `PERS`, `CS` work clothes.
- Refs (generator max 5, sent full size): adults Tom, TNB, Amy, Deedee, Boppy hero-ref pictures; children Grace, Rose, Tom, Amy, Deedee.
- Reference line names the finish: sketchy pencil and ink lines, hatching, mottled colored-pencil shading, visible paper grain, not clean digital art; do not copy faces, hair or clothes; only the new character.
- All 56 draft. The heroes were NOT made in the Art Library (no entry), so there is no earlier hero prompt to copy.
- Publishing note: the Art Library reads prompts and checks refs from the live site. GitHub Pages publishing gets cancelled by each new push and once timed out (11-09 17:20 to 17:36). After a push, wait for `gh run list --workflow pages-build-deployment` to show success on a commit that includes yours before telling Tom to Generate.

## History (so nobody repeats it)
1. npcref1: one 4867 px lineup picture of all 7 heroes as the only ref. Result (Pip, Moss, Gus, Bean, Reel, Pruitt, Delgado, Kowalski, approved by Tom then flagged): clean digital, flat fills, no pencil texture. Tom 17:43: "not hand drawn enough like the reference images". Cause (my reading): generator saw each hero at about 300 px; cutout removed paper grain. Lineup and its builder purged.
2. npcref2: the current state above. Those 8 reopened to draft.

## Waiting on Tom
- Tom 17:45: Pip is the test (not Page). Generate Pip and compare with the heroes. If still clean and digital, that is the SECOND miss of the same kind: STOP-LOSS. Do not reword again. Likely real cause then: the Library's generator itself (the heroes came from Tom's outside generator from photos). Recommend a different Library method: attach ONE hero full size plus an approved NPC that Tom rates as hand drawn enough, or ask Tom for one sample he likes; do not suggest an outside AI (CLAUDE.md rule).

## Then
- Portrait cropper for approved NPC heroes (claude/next-addendum-npc-ff9.md, NOT built yet). If adults come out too tall, use npc_head.py rather than regenerating.
