# NPC emotion sheet prompts in the Art Library (Tom 2026-11-10 10:42; main at f569252; CHANGES "npcemo5"; json and tools only, no tag)

Read with claude/next.md (not edited there so as not to clobber other sessions).

## Facts
- 60 draft entries added to data/art-prompts.json (0 lines removed, validate.js OK): `npc-emotions-<id>` (tab NPCs) for all 58 townspeople with a hero entry, `michael-emotions` and `jojo-emotions` (tab Characters).
- One generic prompt: tools/art-library/prompts/npc-emotion-sheet.txt (main-cast emotion prompt with technique and color blocks made style-neutral; 4 x 2 magenta grid, same 8 moods and order, so tools/sprite-bake/emotion_frames.py can cut them).
- Reference = newest APPROVED hero picture. Attached now (19): pip moss dot gus bean reel pruitt delgado kowalski ike halverson bun page fern oolong penny nickel michael jojo. The other 41 have no ref and "WAIT: hero not approved yet" in the title.
- Builder: `node tools/art-library/npc-emotion-prompts.js [--append|--refresh]`. NEVER run make-prompts.js. After Tom approves more heroes: run `--refresh` (untouched drafts only: attaches the hero, drops WAIT), check the diff has only those entries, validate.js, push.
- Pre-existing on main: review_test.py fails "GENERATE sits near the top of the open card" (same before and after).

## Waiting on Tom
- Generate the 19 ready sheets (Pip first as the test): compare the head count and surface with the hero. If heads come out big or the surface is clean digital, that is a miss: after a second miss on the same point STOP (stop-loss) and recommend attaching the NPC walk-sheet front stand crop instead (as Tom and Amy, prompts/char-emotion-sheet-walk.txt).
- Approve more NPC heroes so the other 41 can be refreshed.

## Install later (not ordered)
Cut with emotion_frames.py (add the ids), then faces and map poses like the 10 cast (walkinst1: EMO_HEAD factor per person, walk stand height as the size reference). The tags in docs/npc-emotion-lines.tsv are keyed by speaker name; Vance covers "Julian Vance" and "Long coat".
