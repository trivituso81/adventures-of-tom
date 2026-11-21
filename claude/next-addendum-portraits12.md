# portraits12 (2026-11-11 10:30, main bf19904): Justin, Olivia, Michael, Ellie added to portraits.html

Read with claude/next.md (not merged into it; small).

- Tom 10:13: "add justin, olivia, michael, ellie to portrait crops". portraits.html now has 12 chips (IDS and NAMES). Justin (hero v2), Olivia and Ellie already had measured FACE crops in bake_portraits.py. Michael is new: `FACE['michael']` = (410, 505, 225, 370), measured on `michael-hero-ref-v1.png` (the dad in the family group).
- Rebake: `bake_portraits.py` writes `portraits/michael.png` (new); all other portraits byte for byte unchanged. `data/portrait-crops-base.json` gained Michael.
- Fact: Michael's default crop shows a sliver of his daughter's bow and son's hair at the edges. Tom can tighten it in the page and Save. Michael's portrait is not used by any game screen yet.
- Page tested at 393 x 852 (12 chips, Michael loads, no errors). Untagged page, no tag bump.
- CLAUDE.md "Dialogue faces never use hero paintings" still holds: these crops are for status and battle menus only.
