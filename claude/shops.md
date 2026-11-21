# Shops: tiers (canon, live since v293, 2026-10-27)

Pointer: the big doc's Economy section still describes the base shelves. This file adds the tier layer on top. Search it when touching shops.

## Rules
- Gear and supplies unlock in three tiers when a chapter is cleared: tier 1 at flag `ch3-clear` (chapter 4), tier 2 at `ch6-clear` (chapter 7), tier 3 at `ch9-clear` (chapter 10). Constants: SHOP_TIER_GATES=[3,6,9] in data/party.js.
- Tier rows sit above the base shelf, newest tier first. The base shelf never goes away. Both Penny's Pockets (Little Elsewhere) and Nickel's (LA) sell them.
- Prices: base price x2 / x3 / x4 (SHOP_TIER_MULT).
- Per member: a Tool, an Outfit and a Charm per tier (SHOP_TIER_GEAR). Ids look like tom_tool1, grace_out2, rose_chm3.
- Outfit stats: tier 1 HP 24 grit 4 cool 3; tier 2 HP 30 grit 4 cool 4; tier 3 HP 36 grit 5 cool 5. Tools: power profile pow 5/6/7 warmth 4/5/6; warm profile pow 3/4/5 warmth 6/7/8. Tier gear sits just under story-reward gear.
- Charm perks by member: crit (Tom, Grace), evade (Rose, TNB), pep (Amy, Nara), regen (Deedee, Boppy).
- Supplies per tier: Bandage 1-3 (heal 140/200/280), Picnic 1-3 (healAll 70/100/140), Popper 1-3 (dmg 150/190/240). Coins 30/45/60, 52/78/104, 44/66/88.
- Boppy's Golden Reel (`b_goldreel`): Tool, pow 5 warmth 6, 90 coins, unlocks with tier 1. Uses `shopPrice` not `price`, so it cannot be sold (shows KEEP).
- NEW tags: tier rows show a NEW badge and the tab gets a dot until the shop closes; seen state is flag `shopseen:<id>`.
- Penny and Nickel each have a tier line (`fresh[3]`, `tierTab`) shown when new stock arrives.

## Files
data/party.js (SHOP_TIER_*), engine/shop.js (shopStockFor, shopMarkSeen, NEW badges), data/maps-la.js (NICKEL lines), index.html (.shop-new CSS).

## Test
`BUILD=/home/claude/live2 python3 -I /home/claude/tools/shoptest.py` (copy: claude/shoptest.py).
