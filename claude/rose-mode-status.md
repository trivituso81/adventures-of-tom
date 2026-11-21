# Rose Mode picture UI: status (2026-10-27, live v314, 1793103181-cf1d)
Spec: claude/rose-picture-ui.md. Built and published to the game link.

## What shipped (files)
- data/battle-icons.js (new, about 190 pixel pictures). Icon DSL (16x16, ops r c p l L d H S X D M x z, palette letters, auto outline); BI_ART keyed 'char.movekey' (8 chars x 14 moves), tombo ids (51), item ids (48 battle-usable), plus m_* markers, e_* elements, x_* cross icons. biIcon(id,'grey') for locked.
- engine/battle-pictures.js (new, loads after engine/feel.js): wraps b2RenderCmd. When b7Diff().pictures is true it draws the picture cross, moves grid, Tombo list, bag, target list and inspect list with the SAME classes and data attributes as the text UI (.b2-x[data-d], .b2-btn[data-i], .b2-back[data-back], .b2-mid[data-insp]), so touch, keyboard, gamepad, tap-to-target and the gold .rec glow are unchanged.
- engine/feel.js: pictures:true on B7_DIFF.rose only. Grace and Director Mode keep the text UI.
- index.html: CSS block "Rose Mode picture menus" before the .rec rule, plus two script tags after engine/feel.js.

## Mapping
| Cross | Picture | Word |
|---|---|---|
| Up | open hand and sparkle | MOVES (VP drops count) |
| Left | two hearts | TOMBO (HEART %) |
| Middle | magnifier | LOOK |
| Right | the signature move's own icon | first word of its name, VP drops |
| Down | bag with heart | BAG |
Markers: open hand = FREE (basic move or Diamond); blue drops = VP cost; 1 to 3 fists + BIG / BIGGER / BIGGEST by damage multiplier (under 1.45, under 2.1, above); green plus heart = heals; hand on shoulder = helps a friend; swirl = confuses / weakens; pink heart = kindness (warm); three figures = hits a row or everyone, green figures = whole party; element icons; grey lock when VP is short or Shushed. Tombo hearts = ceil(cost/25). Targets show portraits and enemy sprites with HP bars; Look shows enemy HP, pink Warmth bar and revealed weaknesses.

## Tests run
Rose and Grace Mode, all 8 characters' lists open without errors (chk.py), every skill, Tombo and battle item has an icon (0 missing), portrait and landscape screenshots, Grace Mode shows zero pictures. NOT yet run: kit_test.py, rosetest.py, smoke.py (not in this session's build; run them next time), and Tom has not played it on the iPhone.

## Known
- Landscape icons are scaled by CSS (24 px cross, 34 px grid); check on the phone.
- Words under moves are the first word of the move name (e.g. WELCOME, DUMPLING); swap to a short-label map if Tom dislikes any.
- Rebuild the icon file: tools icons/core.js + art_*.js concatenated (art_base, art_fam, art_fix, art_grace, art_items, art_tnb, art_tombo, art_tom order). Source is also readable inside data/battle-icons.js itself.
