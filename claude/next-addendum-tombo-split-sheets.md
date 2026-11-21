# TOMBO ART v2: one sheet per person plus one object sheet per Tombo (Tom 2026-11-07 01:45)

Tom: "Tombo image generation didn't work. I think every tombo needs a sheet for each character in it plus another sheet for all the objects. Add it to the build instructions and do it in much bigger batches than you did with the old tombo sheets."

Status: SPEC ONLY. Build nothing until this is the next task in claude/next.md (it is queued as TS). Art Library entries only: no game files, no tag bump, no Generate presses (Claude never presses). This supersedes the "two people in one picture" call in claude/next-addendum-tombo-art.md and the pair-sheet rules in claude/next-addendum-tombo-pure-poses.md. Their lessons about plain poses still hold.

## The call (Claude)
Pair sheets fail because one picture has to hold two bodies, their contact, and their props. Splitting those three jobs removes the failure. Every Tombo becomes three pictures:

| Picture | Holds | Never holds |
|---|---|---|
| Tom sheet | Tom alone, 6 frames of Tom's column of the Tombo | the partner, any object, furniture, scenery, effects, text |
| Partner sheet | the partner alone, 6 frames of the partner's column | Tom, any object, furniture, scenery, effects, text |
| Object sheet | every standalone object the Tombo's animation draws, each on its own | people, hands, bodies, scenery, text on anything unless the prop is a sign by design |

The engine already stages each person and each prop separately (PROPART.draw), so nothing is lost. Hands in the person sheets grip empty air; the game puts the object there.

## Rules for the person sheets
- One person per picture. Header `tools/art-library/prompts/char-tombo-solo-sheet.txt` (new), patterned on char-ability-sheet.txt: painted look, real height, 3 x 2 grid, 6 frames, flat magenta, one ground line, same head size every frame, full body uncropped, no effects, no text, no left or right words.
- No objects at all, not even held ones. A pose that needs a prop is drawn as a mime: "both hands cupped in front of the chest as if carrying something, nothing in them". Worn clothing from the reference stays.
- Seated frames: draw a low squat or sitting on the ground, no chair, no bench, no table. The engine puts the seat under them. If the generator adds a seat twice, stop-loss.
- Rose rides Tom (rose1, rose2, rose3, ff1 and their DC): Tom's sheet may show Rose on his shoulders (fifth ref `tomride-poses-v2.png`); Rose's own sheet shows only frames where she is off Tom (standing, jumping, arms up). Nara: dog wording, no hands, tail and ears carry feeling.
- Refs (cap 5): that person's hero, walk sheet, battle sheet 1, battle sheet 2 where they exist. Amy refs: whatever exists now (she has battle sheets since 391; check). Tom refs: the NEW hero and the NEW battle stance sheets (`tom-battle-stance-1-v2.png`, `-2-v1.png`), not the old battle sheet 1 (this also closes open item 6b b).
- Heights: Tom 5'11, TNB 5'10, Justin 6'4, Boppy 5'7, Amy and Deedee 5'5, Grace 4'2, Rose 3'4, Nara a medium dog. Little Tom in amy2: small boy, smooth hairless face.

## Rules for the object sheets
- New header `tools/art-library/prompts/tombo-objects-sheet.txt`, copied in shape from claude/moon-club-objects-sheet-prompt.txt (the one Tom liked: one paragraph of rules, then a numbered list, each object described in plain words, "stands alone with wide empty magenta space", "crisp clean silhouette with its full base visible", "no floor, no shadow, no ground", "not pixel art, not 16-bit", "deliver the image itself").
- Grid: 4 columns x 3 rows, 12 cells maximum. Fewer objects: leave the other cells empty magenta. More than 12 distinct objects: second sheet `-objects-2`. Each object large in its cell (generators ignore small sizes).
- Style ref: `style_key_v1.png` only (no characters attached). Painted, soft shading, warm golden light from the upper left.
- Objects come from the LIVE code: the last definition of `B2_TOMBO_ANIM.<id>` in engine/battle2-kind.js, plus the prop kinds it draws. Do NOT use claude/battle-design.md "Complete Tombo Table" (stale). The old 138 prop names (`tools/sprite-bake/src/props/props.json`, group tombo) are a checklist only: they were painted in the old style and are replaced by these sheets when installed (retiring them is a later job, mention to Tom once).
- Dedupe: an object used by several Tombos is painted on the first sheet that needs it; later sheets list it as "reuses <name> from <entry id>" in the entry note only (not in the prompt) and the engine reuses the cut.
- Left out on purpose (stay drawn in code): bursts, flashes, confetti, shadows, glows, ice walls, cutaways, gold thread.
- Words that pull the generator off course stay out of every object description: scene, room, background, spotlight, glow, stage, table setting words that imply a place. Describe the object, nothing around it.

## Entries and counts (verify against the repo first; ids must not exist)
| Group | Existing | New or changed |
|---|---|---|
| Primary Tombos, 21 | 7 approved pairs stay: grace1, grace2, grace3, rose1, rose2, amy1, deedee1. 14 unapproved pairs: rose3, amy2, amy3, deedee2, deedee3, boppy1 to 3, tnb1 to 3, nara1 to 3 | 14 x (`-tom`, `-<partner>`) = 28; objects for all 21 = 21 (`tombo-<id>-objects`). Total 49 |
| Pair entries that failed | the 14 unapproved pairs | keep, set status `superseded` (see validate.js for allowed status words; if none exists, leave as draft and add a note) |
| Family Finish, ff1 to ff3 | 10 member sheets (422), some with held props | rewrite those 10 prompts to the person-sheet rules (no objects); add 3 object sheets `tombo-ff1-objects`, `-ff2-`, `-ff3-`. ff4 not in this pass |
| Director's Cut, 21 | 21 pair entries + 10 member entries (425) | 21 x 3 = 63 new (`tombo-<id>-dc-tom`, `-dc-<partner>`, `-dc-objects`); pairs superseded; 10 member entries rewritten; 3 object sheets `tombo-ffN-dc-objects` |
| Total | | about 118 new entries plus 20 rewritten. Press cost to Tom: 1 per entry |

The 7 approved pairs get an object sheet only. Reason: they worked, and redoing them costs 14 presses for no gain. If Tom wants them split too, it is 14 more entries (his call).

Ids: `tombo-<id>-tom`, `tombo-<id>-<partner>` (partner word as in the Tombo's group: grace, rose, amy, deedee, boppy, tnb, nara), `tombo-<id>-objects`. Group names: "Tombos, Tom + <partner>" stays (max 40 characters, no colon, no ampersand). Titles: "Tombo: <live name> (Tom)", "(<partner>)", "(objects)". Tab Characters for people, Props for objects if the Props tab takes `ar:'4:3'` entries (check groups.js; otherwise Characters). Entry fields as before: `{status:'draft', id, tab, group, title, ar, refs, prompt}`; person sheets `ar:'3:2'`, object sheets `ar:'4:3'`.

## BATCHING (Tom: much bigger batches)
The old work was seven slices of 3 to 7 entries, one push each. New plan, two pushes total:

| Push | Contents | How |
|---|---|---|
| 1 | every Primary entry (49) + ff member rewrites (10) + ff object sheets (3) = 62 entries | one fork per partner (7 forks: grace, rose, amy, deedee, boppy, tnb, nara), each reading its three `B2_TOMBO_ANIM` ids and writing rows into its own module file; Claude merges, runs validators once, one json splice, one CHANGES entry, one push |
| 2 | every Director's Cut entry (63 + 10 rewrites + 3 objects = 76) | same fork-per-partner method, after push 1 lands (DC rows reuse push 1's headers) |

Before pushing, print one row per entry (id, refs count, prompt length, banned-word scan) for all of it in one table and read the whole scan once. Banned-word scan on every prompt: left, right, 16-bit, 32-bit, SNES, Final Fantasy, pixel art, retro, sprite, hurt, KO, knocked, em dash, glow, spotlight, stage, star, ribbon, sign, scene (object sheets may name a sign only if the prop IS a sign).

## Recommended press order (tell Tom the cost BEFORE he presses; Claude never presses)
1. Test pair, 2 presses: `tombo-boppy1-tom` (a person sheet that failed as a pair) and `tombo-grace1-objects` (the first object sheet). If either drifts twice, stop-loss: do not send a third variant; say what is wrong and recommend the specific change.
2. If both look right, the rest are his order. Suggest by partner: all of one partner's sheets together so the set can be judged side by side.

## After approval (later session, NOT now)
Approved is not installed. Install per partner like the ability installs: cut frames (person sheets) and objects (object sheets, key out #FF00FF, crimson drift needs a keying step, trim, save `art/props/tombo/<slug>.webp`), replace that Tombo's staging in B2_TOMBO_ANIM, purge old drawing code and old prop files (grep 0), `tombo_test.py <id>`, portrait and landscape frames, smoke, tag_check, CHANGES.

## Final line to Tom after the push
"Every Tombo now has a Tom sheet, a partner sheet and an object sheet (118 new entries; the 7 approved pairs only got object sheets). Start with two presses: tombo-boppy1-tom and tombo-grace1-objects. If those look right, press the rest in any order."
