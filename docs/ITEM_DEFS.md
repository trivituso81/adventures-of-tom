# Item definitions (itemdef1, 2026-11-20)

Tom: "change every item banner ... so it reads like a JRPG item definition with four parts: item name and type, a short description of the item, its effect in battle, and its effect in story (key items, gifts, unlocks)."

Every ITEM GAINED banner (`itemBanner` in `engine/party-banner.js`) shows `itemDef(id)` from `data/item-defs.js`:

| Part | Where it comes from |
|---|---|
| Name | `items[id].name` |
| Type | Worked out from the item's fields: `keepsake` is Key Item, `slot` gives Signature Tool, Outfit, Keepsake Charm or Birthday Sash (plus ", Grace only" when `who` is set), heal, healAll, revive or vp is Recovery Item, dmg, confuse, atkDown or pep is Battle Item, a description that starts "Souvenir from" is Souvenir, no price and no sell is Key Item, the rest is Odds and Ends. `ITEM_TYPE[id]` overrides. |
| Description | `items[id].desc` (the same line the menus show) |
| In battle | Gear: "Wear it: " plus `bonusText`. Usable: "Use it: " or "Throw it: " plus `effectText`, and "Works outside fights too." when it can be used on the map. Otherwise a line by kind. `ITEM_BATTLE[id]` overrides. |
| In story | `ITEM_STORY[id]` for key items, gifts and unlocks; otherwise the line for its kind in `ITEM_STORY_KIND`. |

## A new item

- A key item (`keepsake: true`, or no price and no sell) or a gift (gear with no price, no sell and no shop tier) needs its `ITEM_STORY` line in the same change. `python3 tools/itemdef_test.py` fails without it.
- The story line says what the item means in the story (who gave it, what it opens, why to keep it) and does not repeat the description. Short, warm, funny, contractions, no em dashes. Say only what the built game shows.
- Everything else needs nothing: type and battle text follow its fields.

Tests: `python3 tools/itemdef_test.py`, `python3 tools/itembanner_test.py`.
