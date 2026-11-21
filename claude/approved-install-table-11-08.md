# Approved Art Library entries: install table (2026-11-08, main at ddabfb0)

Counted from data/art-prompts.json: 860 entries, 609 approved, 210 draft, 4 rejected, 37 with no status.

## Verified (checked with the candidate rules in tools/art-library/in_game.py)

| Kind | Approved | Game file present and named in code | Not installed |
|---|---|---|---|
| room-* | 11 | 11 | 0 |
| portrait-* | 0 | - | - |
| npc-walk-* | 1 | 1 | 0 |
| battle-stance (Tom, family, Justin, Deedee etc.) | 15 | 13 | 2 (jojo-battle-stance-1 and -2: art/chars/jojo-battle.webp is missing; the repo has art/chars/jojo-bt.webp instead) |

## Not verifiable with the current tools (no install check exists)

| Kind | Approved | Note |
|---|---|---|
| ab-* (ability sheets, Tom, Grace, Rose, Deedee, TNB, Nara, Boppy, Amy, Olivia, Justin) | 134 | Installed state depends on each move in engine/*-moves.js. No checker. |
| fx-* (effect sheets) | 131 | No cutter exists for Amy or Boppy fx (see next.md ORDER NOW 3). |
| tombo-* (Tombo sheets) | 121 | Drawn from tools/tombo_props_map.json and tools/sprite-bake/. Partly installed (see next.md Live state). |
| area-* (outdoor plates) | 23 | Checked by the area install steps in docs/AREA_PAINTINGS.md, not by a tool. |
| other (characters, enemies, flight, title, NPCs, tests) | 173 | Mixed. Not checked. |

## Next step
Write a checker for the ab, fx, tombo and area kinds (per-group file and code reference), then install the approved items that are missing.

## Open items found this session
- Jojo battle stance (approved, not installed): the sheet file name in the Library does not match the file in art/chars/. Decide with Tom whether this sheet installs now (approved) or waits for the Jojo kit step.
