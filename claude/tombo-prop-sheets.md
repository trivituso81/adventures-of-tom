# Tombo prop sheets (started 2026-10-30, COMPLETE 2026-10-30)

The 202 painted props (claude/prop-sheets.md) cover each character's own moves only. The Tombos (two-character combos), Family Finishes and Director's Cuts draw 138 more distinct props. All 138 are now painted and cut: art/props/tombo/<slug>.webp (cutter reports "tombo painted 138 of 138").

How the list was made: four read-only passes over the LAST definition of each B2_TOMBO_ANIM.<id> in engine/battle2-kind.js (48 ids: grace, rose, amy, deedee, boppy, tnb, nara 1 to 3 plus _dc, ff1 to ff4 plus _dc). Props already among the 202 are reused, not repainted. Left out on purpose: shadow silhouettes, gold thread, ice wall, tower cutaway. The item list in order is in the repo: tools/sprite-bake/src/props/props.json, group "tombo" (numbers 1 to 138). Which Tombo uses which prop is not saved; re-derive from B2_TOMBO_ANIM if needed.

## Sheets
| Sheet | State |
|---|---|
| 1 to 10 of 10 | All saved and cut in tools/sprite-bake/src/props/ (see its README for per-sheet notes) |
| Redo 1 of 2 | Judge's Desk, Carry-On Suitcase, Pink Blanket Lump, Pink Sneakers, Gold Tiara, Bodyguard Sunglasses and Earpiece, Italy Wall Map: 7 of 7 cut (ee581c7) |
| Redo 2 of 2 | Palm Tree, New York Skyline, Drinking Glass, Hanging Pendant Lamp, Sourdough Bite, Nurse Cap, Red Striped Family Table: 7 of 7 cut (d5a33f8) |

Pattern that worked: invented props crept in after about cell 8 of 14, so misses were collected into two redo sheets of 7.

## Next
Wiring the painted Tombo props into the Tombo animations (PROPART.draw pattern, ids like 'tombo/gift_box', see docs/PROP_ART.md). Not started. Wait for Tom to confirm he likes the seven trial moves first.
Notes: tnb2 is named "Measure Twice" in data but animates the Red Line subway.
