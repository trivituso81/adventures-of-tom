# Stampcard revamp (approved by Tom, 2026-11-01; drawer detail added 15:14)

Replace the long-scroll Stampcard (menu STAMPS tab) with a one-screen grid plus a detail drawer. Saves untouched. One data change: an `effect` field per move (see Drawer content).

## Why
Today: 14 full rows, about six phone screens; header fills most of the first screen; comparing two moves needs scrolling. Goal: browse and compare without scrolling, act from one place.

## Layout (portrait)
1. Strip (one line): title and name, LV badge small, `17 SP · 14 PP · 2 TK`, small AUTO and RESPEC buttons. From level 27 add `L1 / L2` loadout switch in the strip. Footer help text removed; a `?` on the SP count shows the point rules as a toast.
2. Core row: two chips, Basic and Signature (purple, the current core colour).
3. Grid: two columns, Path A (gold) left, Path B (blue) right, column headers are the path names. Six chips each, one per slot in order A1 to A6, B1 to B6. Whole grid fits one screen (chips about 44 px tall).
4. Drawer: pinned under the grid, shows the selected move only.

Chip = name on line 1, one fact line on line 2. Fact line by state:
| State (b6NodeState) | Chip look | Fact line |
|---|---|---|
| stamped | filled path colour, check mark | `VP · element · +` (Polish rank tag) |
| next | gold 2 px outline, pulses | `N SP to stamp · VP` |
| sp (not enough SP) | plain | `N SP · VP` |
| level (gated) | dim, lock icon | `Lv N` |
| soon (no move built) | dim | `Soon` |
| Ultimate (A6, B6) | star icon | as above |

## Drawer content (Tom, 15:14)
Order top to bottom:
1. Name, Primary / Remix toggle (Remix side dim and labelled `Ticket` when not unlocked).
2. Tag row: `LV n`, `n VP`, element tag(s), Polish tag. Every tag is tappable and opens a one-line tooltip under the row explaining what that attribute means (reuse the existing tipOn mechanism and texts: level gate, VP cost, element with B2_ELEM_WHAT and the +50% weakness note, Polish rank). Tap again or tap another tag to change or close.
3. STORY block: the flavour text only (what the character does). Normal ink colour, italic.
4. EFFECT block: labelled `EFFECT`, what the move does in game terms, one or two short lines. Visibly separate from STORY (its own label and a hairline above).
5. Action button row (below).

Keyword colouring inside EFFECT: effect words get a distinct colour by kind, applied by a small highlighter that wraps matched words in a span (whole words, case-insensitive, no new copy):
| Kind | Words | Colour |
|---|---|---|
| Damage | damage, hit, hits, strike, bonk, crit | the existing danger red (#c8553d) |
| Heal | heal, heals, revive, recover, restore, cure, clear | green (use the HP bar green) |
| Buff | up, boost, +N%, guard, shield, speed up | gold (var(--gold)) |
| Debuff and status | down, slow, interrupt, push back, confuse, stun, and every B2_STATUS name (Amber-Stuck etc.) | the status's own `color` from B2_STATUS, otherwise purple (#b9a6e8) |
| Element names | Cozy, Kinetic, Sparkle etc. | B2_ELEMS[e].color |
Status and element words in EFFECT are also tappable with the same tooltip (status: its B2_STATUS text or a one-line fallback; element: as in the tag row).

Data: add `effect` next to `desc` for every move in data/abilities.js (both p and r versions), one line in game terms, e.g. `effect:"Heal one ally 30%. Clear Amber-Stuck."`. Then trim the matching sentence out of `desc` so STORY is pure flavour. Fallback for any move not yet migrated: show the last sentence of `desc` as EFFECT and the rest as STORY. No em dashes.

Action button: ONE button chosen by state: STAMP (next), POLISH (stamped and polish available), UNDO (stamped, no polish available), REMIX (b8CanRemix, with the existing USE TICKET? confirm), SWAP (Remix unlocked). Second small button: PIN TO COMPARE.

Compare: PIN holds the current move in the left half of the drawer; the next chip tapped fills the right half with the same layout (tags, STORY collapsed to one line, EFFECT in full) so VP, element and effect line up. Tap PIN again or press B to clear.

## Navigation
- Tap a chip to select; the drawer updates, no scroll.
- Keyboard and gamepad: grid is a cursor grid, rows = core, A1/B1 ... A6/B6; left/right switch column, up/down move rows. A = action button, B = clear pin, then close drawer, then back to tabs. L/R shoulder = Primary/Remix toggle. Use menuKeyNav and menuFocusNext as the other tabs do.
- Landscape: grid left, drawer right, no vertical drawer.
- Rose Mode (roseAuto): grid read-only, drawer has no buttons, same layout.
- noBattle members keep the coming-soon card.

## Files
- engine/progress.js: rewrite renderStampsTab and b8Row (keep all b6*/b8* logic functions as they are); add the EFFECT highlighter and the desc/effect fallback split.
- data/abilities.js: `effect` field for every move, `desc` trimmed to flavour.
- index.html: replace the `.sc-*` CSS block (around lines 861 to 920) with grid, chip, drawer, STORY/EFFECT and keyword styles, portrait and landscape.
- engine/menu.js: key-nav additions for the grid; menuLeaveStamps unchanged.

## Test
`python3 tools/smoke.py`; plus a Playwright run that sets Tom to level 30 (`b6SetTotal(tom,2900); b6Sync(); b6RefreshAll(); openMenu(); setMenuTab('stamps')`), taps a next chip, stamps, polishes, pins and compares, taps a tag and a status word for the tooltip, and screenshots portrait and landscape. Also check level 1 (nothing stamped) and level 50 (Mastery), and one other character (Grace) so the highlighter is checked on a second kit. Look at every frame before pushing.
