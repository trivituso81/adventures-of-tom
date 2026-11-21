# Boss scene staging: inventory and fix (stage1, 2026-11-09)

Tom (11-08 23:21): in any scene before or after a boss, the party spreads out so nobody overlaps, and everyone faces the right direction. Inventory first.

## Inventory (before the fix, measured on every dialogue page)
Overlap = two people in the same column within two rows (figures are about 0.6 tile wide, 2.4 tall). Wrong facing = facing away from the boss while it is in view.

| Group | Scenes | Overlap before | Facing wrong before | Cause |
|---|---|---|---|---|
| After scenes (all 22 bosses) | ch1 to ch10 AfterBoss, ch11 to ch20 After/Shatter/Calm, nsAfterBoss | 22 of 22 | 6 | The fight scene ends by putting every follower on Tom's tile; the after scene starts there |
| Lead-ins with no placements | ch1Pond, ch2Boss, ch11Vance, ch12Prime, ch13Worm, ch14Gate, ch16Open, ch17Vault, ch18Pinnacle, ch19Claim, ch20Heart | 11 of 11 | 5 | Walking line kept (often two on one tile), facing the walk direction |
| Retry and fight scenes | ch15Fight, ch16Fight, ch18Fight (+ ch17/19/20 fights, no dialogue) | 3 of 3 | 0 | Stacked after a lost fight |
| Lead-ins with hand placements | ch3Pool, ch5Boss, nsPond, nsPond2 | 4 of 4 | 0 | Rose (or Grace) placed one row straight in front of someone |
| Lead-ins with hand placements, fine | ch4, ch6, ch7, ch8, ch9, ch10 Boss, ch15Open | 0 | 0 | Already spread |

## Fix
- New scene step {gather:focus} in engine/story.js (Boss staging): spreads followers around Tom (side boss: zig-zag behind Tom; boss above or below: a row abreast), never same column within two rows, never in front of Tom, never on the boss, then everyone faces the boss once it is in view. {gather,check:true} before every later line re-spreads if someone is crowded and re-turns anyone facing away.
- BOSS_STAGE table lists all 47 scenes and whom they face. Scene placements, walks and turns are respected.
- Hand placements moved: ch3Pool (Rose 9,5, Grace 12,5), ch5Boss (Rose 11,6); Nine Scoops pond scenes use {gather:[19,11]}.

## Result
After: 0 of 47 scenes with overlap, 0 facing away (one page with Nara mid-step). Landscape spot check ch5, ch13 clean. Test: tools/boss_stage_test.py + tools/boss_stage_report.py (about 1 minute per chapter).
