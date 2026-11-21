# heights1 (BUILT and pushed 2026-11-11, main 0e32785)

Tom's order: a main character's on-screen height must always follow from the head size set in HEAD SIZES and the real height, with Tom as the baseline. Then: Olivia 5'8, Ellie 5'2, Boppy 5'7; and the Head Row red line on the bottom of every chin.

## Canon heights (also in data/heights.json, the only place they are typed)
Tom 5'11, TNB 5'10, Justin 6'4, Michael 6'4, Olivia 5'8, Boppy 5'7, Jojo 5'6, Amy 5'5, Deedee 5'5, Aunt Ellie 5'2, Grace 4'2, Rose 3'4.

## What exists now
| Piece | File |
|---|---|
| Heights table | data/heights.json |
| Generated draw scales | data/walk-scale.js (python3 tools/sprite-bake/heights.py write) |
| Bake rules | tools/sprite-bake/walk_sheet_frames.py (figure_rows, draw_k, tom_head_rows) |
| Test | tools/heights_test.py (smoke runs --fast) |
| True chin lines for HEAD SIZES | tools/sprite-bake/chin_lines.json, read with chin_ruler.py |
| Before and after picture | tools/shots/heights1-lineup.png |

## Open with Tom
1. Adult heads are visibly unequal now that the chin lines are honest. Source fix = move the bake's chin anchors to chin_lines.json values and rebake every adult and townsperson. Only on his word.
2. Battle heights use their own scale; Olivia's battle size still assumes 5'5.
3. Welcome screen heights not touched.

Full handoff: claude/next.md. Change log: docs/CHANGES.md (heights1). Recipe: docs/CHARACTER_PIPELINE.md section 7.
