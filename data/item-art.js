'use strict';
// Item pictures (itembannerart1, Tom's report r-20261120-142626-w74f "missing art for all item banners"): one painted picture per item, art/items/<id>.webp.
// The pictures are made on 18 sheets in the Art Library (tab Props, group Item pictures; tools/art-library/itemart-prompts.js); approving a sheet bakes each item
// with tools/sprite-bake/bake_item_sheet.py. The ITEM GAINED banner (engine/party-banner.js) shows the picture for an item listed here and the item's emoji for any other.
const ITEM_ART_V='itemart1';
// Items that have a baked picture (bake_item_sheet.py rewrites this line; never edit by hand). The game asks for no other file.
const ITEM_ART=[];
