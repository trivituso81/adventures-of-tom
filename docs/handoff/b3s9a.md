# Handoff: b3s9a (Battle 3, stage 9 part a), 2026-11-19

Tom's testing notes on the SKILLS list, handled before the stage 9 kits. Stage 9 is split: b3s9b TNB, b3s9c Nara and Boppy plus the late joiners' pool.

| Item | State |
|---|---|
| SKILLS list | Name, flavor pictures (`B3_FLAV_IC`, `b3FlavorIcons`), Pocket backpack, Pep pill (`b3CostPill`). No preview box in the list. |
| Skill card | `B3.ui==='skill'`, index in `B3.sel`. `b3Pick` in 'skills' opens it; in 'skill' it calls `b3Choose`. `[data-use]` is USE. `b3Back` from 'skill' goes to 'skills'; a target list opened from the card goes back to the card (`B3.prevUi`). Rose Mode: `b3pSkill` in `engine/b3-pictures.js`. |
| Message line | No Skill description in SKILLS, the card or the target list. |
| Tests | `python3 tools/b3_test.py s9ui`; `skill()` in `tools/b3_test.py` now opens the card (press Enter once more to USE); `pick_row()` presses Enter twice. |

For a new kit stage: every new Skill shows in the card with its `desc`, so write a full plain sentence there.
