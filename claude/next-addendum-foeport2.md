# foeport2 (2026-11-12 ~08:30, main cadb2bc): every talking monster has a dialogue portrait

- Tom 08:09: "all monsters need a portrait next to their dialogue".
- Fact: 36 of 86 monsters had none. foeport1 keyed the 51 portraits by the speaker name used in scenes (DIALOG_PORTRAIT_IDS); a map monster talking before its fight opens the box with its own display name (Bog Toad, Jet Lag, Dog-Ear...), which was not in the table.
- Fix: `setDialogPortrait(name,npc)` (engine/overworld.js) falls back to `foe_<npc.monster>` when the speaker is a map monster. 31 crops baked via `tools/sprite-bake/bake_foe_portraits.py` (`SPEAKERS`), keys added in engine/menu.js, tag foeport2.
- Left out on purpose: Warden Boppy (a person in costume, needs his own face), the Archivist (person).
- Tight crops, redo only if Tom says: toad, log, stickysap, shusher, dogear.
- Tested: Bog Toad, Jet Lag, Dog-Ear in a dialogue box at 390 x 844; smoke FAILS []. Not looked at in landscape or on a phone.
- Audit snippet: in the browser, loop `MONSTERS`, `DIALOG_PORTRAIT_IDS[name.toLowerCase()]`; every monster except warden should now resolve by id.
- New monster rule: add its id to `SPEAKERS` and to the key list in engine/menu.js, bake, look at the contact sheet.
