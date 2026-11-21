# Voices matched to the art: Bean, Moss, Pip, Dot, Kit, Page (Tom 2026-11-12 16:12; main bc7e61a; CHANGES "voicefix1"; tag voicefix1)

Read with claude/next.md (not edited there so as not to clobber other sessions).

## Facts
- Art Library prompts (tools/art-library/npc-prompts.js): Bean woman 34 (5'5), Moss boy 9 (4'3), Pip boy 9 (4'1), Dot girl 9 (4'0), Kit woman 29, Page woman 38.
- Old voice descriptions (data/dialog-cast.js) were written from names alone: Bean man late 20s, Moss tall man 30s, Pip young woman 20s, Dot woman 40s, Kit man 30s, Page man 40s.
- Added voices `beanw`, `mosskid`, `pipkid`, `dotkid`, `kitw`, `pagew`; speakers Bean, Moss, Pip, Dot, Kit, Page use them. Old ids stay for walk-ons (Kevin, Mateo, Chet, Ryan, Mr. Delgado = bean; Ray, Dash, Don Beto = moss; Bev, Sam = pip; Priya, Dakota, Kiki = dot; Wes = page; Jordan = kit) so their baked clips still play.
- Smoke FAILS []; unused_voice.py all 0.

## Consequence (fact)
- Those six are SILENT in dialogue boxes until their new voices are designed and their lines baked (no clip under the new voice id). Old clips remain in data/voice/dialog-ch*.js until the new bake is merged.

## Waiting on Tom
- Design the 6 voices in the dialogue baker (voices.html), one test line each first (the `sample` in dialog-cast.js). Kids first: Moss. If ElevenLabs refuses to design a child voice, use a library voice for Pip, Moss, Dot (like Grace's Ivy).
- Then bake all lines for those six speakers and send voices.json for merge.

## Still open (not checked)
- Same name-only mismatch may exist for other walk-on voices (Luna, Fern, Oolong, Penny, Bun are women in art and voice: fine). Not audited: Reel, Pruitt, Delgado, Kowalski, Ike, Halverson, Bev, Sam, Ryan, Dakota, Wes, Jordan, Priya, Kiki against their art sex and age. Check with: tools/art-library/npc-prompts.js vs data/dialog-cast.js.
- tools/clip-audit/build.py has LOAN={'kit':'bean',...} (Kit borrows Bean's voice in that baker); revisit when baking Kit.
