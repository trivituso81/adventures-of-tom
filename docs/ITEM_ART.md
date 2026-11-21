# Item pictures (itembannerart1, 2026-11-20)

Report r-20261120-142626-w74f, "missing art for all item banners". The ITEM GAINED banner (`itemBanner` in `engine/party-banner.js`) shows one painted picture per item.

| Part | Where |
|---|---|
| Picture notes for all 288 items (id, name, what to paint), first in the order of the items table, new items at the end | `tools/art-library/itemart-items.json` |
| 18 sheet entries `prop-item-01` to `prop-item-18` (Art Library > Props > Item pictures), 16 items each, flat magenta background | `tools/art-library/itemart-prompts.js` (`node tools/art-library/itemart-prompts.js` adds or refreshes them in `data/art-prompts.json`; approved prompts are never reworded) |
| Cutting an approved sheet into `art/items/<id>.webp` and rewriting the list | `tools/sprite-bake/bake_item_sheet.py` (run by the art-bake Action from the entry's `bake` field; by hand with `<sheet> <id>...`, add `--check` for a contact sheet in `tools/shots/`) |
| The list of items that have a picture, and its cache tag | `data/item-art.js` (`ITEM_ART`, `ITEM_ART_V`) |
| Drawing it | ring on the right of the banner, `.pb-icon` in `index.html`; `pbItemIcon` in `engine/party-banner.js` |

An item that is not in `ITEM_ART`, or whose file fails to load, shows its emoji (`items[id].icon`), which the menus, shops and bag still use.

## A new item needs a picture

Add the item to `items` as usual, then add its row (id, name, what to paint) at the END of `itemart-items.json`. The file keeps its own order on purpose: the 18 sheets are 16-item slices of it, and inserting a row in the middle would move items between sheets whose prompts are already approved. Rows past item 288 make sheet 19 (and so on) when `node tools/art-library/itemart-prompts.js` runs. `python3 tools/itemart_test.py` fails until every item in the game has a note.

## A miss on one cell

The bake stops when a cell is empty and names the item. For a wrong picture in a cell, make a redo sheet entry holding only the missed items (the pattern of the Dungeon finds EDIT sheets in `dungeonfind-prompts.js`), with a `bake` that names their ids.

Tests: `python3 tools/itemart_test.py`, `python3 tools/itembanner_test.py`.
