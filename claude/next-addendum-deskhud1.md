# deskhud1 (2026-11-18, main 379cd39): desktop battle HUD

Tom asked (13:42 and 13:43): on a desktop browser the battle turn bar 2.5x bigger, party status stacked one per row with full width of the right bar, each tile about 3x taller, bigger type across the whole right panel.

- CSS only: one `<style>` block in index.html marked `deskhud1`, after the last style block. Scope: `html.landscape:not(.tablet):not(.duo) #battle.v2` inside `@media(min-width:1100px) and (min-height:560px)`, plus a tighter `max-height:860px` variant. Phones, iPad and Duo are untouched.
- Values: turn bar faces 55 px (current 65), panel width clamp(320px,25vw,420px), party 1 column with 70 px faces and 24 px names, larger type for message, cross, lists, HEART and the status list (.b3-inf*). Canvas reserves 96 px for the bar (`(100cqh - 96px)`).
- Applies to Battle 3 and the old battle (shared .b2-* classes).
- Tested by screenshot (tools not committed; a 40-line Playwright script that calls `b3Lab(2,{seed:7})` then `b3OpenInfo(B3.F.party[1].key)`) at 1550x900, 1280x720, phone landscape 844x390. smoke FAILS: [].
- Not verified: status chips on the party tiles (test statuses added with `b3AddStatus` did not show on the tiles; the status list did). Look once in a real fight after Skills such as Zone One Blockade.
- If Tom wants it bigger or smaller: the numbers are all in that one block.
