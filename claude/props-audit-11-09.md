# Props audit, 2026-11-09 (all 29 Props entries; corrected after Tom's ch04 report; fixes pushed at 87a5e7e)

CORRECTION: the first pass called find-ch04 OK. Wrong. Zoomed check: the three ON switch cells show levers still DOWN (same as OFF), and the dead rig (cell 7) has lit lamps. Now FIX. Totals: 23 OK (7 cut by identity), 6 need a redo.

Method: pulled each approved picture (art/raw/props/*-v1.png), keyed the background like tools/art-library/art_bake.py, looked at every sheet at full size against its list, zoomed suspect cells (including pose differences between paired cells).

## Facts for every picture
- All RGB PNGs, no transparency. Background crimson (about 205,5,100). Key with border flood-fill, tolerance 70; halo removal by tools/sprite-bake/bake_prop_sheets.py.
- Near-key colours (watch the rim): ch21, ch10 red hand, ch19 pink ribbon, trail-d, trail-c, trail-b, trail-hollow rhubarb.
- Corner numbers are unreliable: cut by what is drawn, never by number.
- Cut by identity: ch05, ch10, ch17, ch19, trail-b, trail-c, trail-d, trail-f.

## Fix status (pushed 87a5e7e, waiting on Tom to press Generate and approve in the Art Library)
| Entry | Defect | Fix entered |
|---|---|---|
| find-ch04 | levers down in ON cells 2/4/6, rig lamps lit in cell 7 | EDIT entry `prop-find-ch04-fix` (attaches approved sheet) |
| find-ch07 | padlock instead of card slots, cell 4 | EDIT entry `prop-find-ch07-fix` |
| find-ch08 | pulled lever same as upright, cell 6 | EDIT entry `prop-find-ch08-fix` |
| find-ch10 | 11 objects, no coin slots | sheet rewritten (strict), back to draft |
| find-ch11-13 | no wall or glass panel | sheet rewritten (strict), back to draft |
| find-ch19 | gold squishy tan x2, mailbox order | sheet rewritten (strict), back to draft |

## Per entry (unchanged findings)
| Entry | Verdict | Findings |
|---|---|---|
| find-ch03 | OK | 3 of 3. |
| find-ch04 | FIX | see above. Red box stripe and lamp near key colour. |
| find-ch05 | OK, identity | Extra closed fridge; open fridge in cell 9, plate in cell 10. Lettering correct. |
| find-ch06 | OK | 11 of 11. |
| find-ch07 | FIX cell 4 | see above. |
| find-ch08 | FIX cell 6 | see above. |
| find-ch09 | OK | 5 of 5. |
| find-ch10 | FIX | extras: clocks, pendant, second red hand; coin slots missing; garbled numerals. |
| find-ch11-13 | FIX cells 3 and 4 | doorway interior is background colour. |
| find-ch17 | OK, identity | Extra second snow globe; bases brown and grey, not glass. |
| find-ch19 | FIX cell 4 | see above. |
| find-ch20 | OK | 9 of 9. |
| find-ch21 | OK | 6 of 6, banner text correct. |
| trail-a | OK | 6 of 6; cell 5 whole fish (accept). |
| trail-b | OK, identity | 3 per row, cells 4, 8, 12 empty. |
| trail-c | OK, identity | Extra two-shard cluster; book stack shows two books. |
| trail-d | OK, one flaw | Ticket gibberish text, tiny at placement size. |
| trail-e | OK | 9 of 9; whole eyeglasses (accept). |
| trail-f | OK, identity | Sandal separate extra object (accept). |
| trail-hollow | OK | 9 of 9 in order; cells 6 and 7 nearly alike. |
| 9 gates | OK | All lettering exact. |

## Lesson
Paired on/off or up/down cells must be compared by pose, not by presence. Add that check to any future audit.

## Not checked
- Gate pictures against real opening size on each plate (at placement).
- Pixel alignment of shut/open and on/off pairs.
