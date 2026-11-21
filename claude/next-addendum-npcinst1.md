# NPC walks and hero portraits (npcinst1 c43dcd4, npcinst2 5889583, npcinst3 e31d56f; CHANGES "npcinst1" to "npcinst3")

Read with claude/next.md (not edited there: it is 40 KB and Project docs have no partial edit; fold in at the next rewrite).

## NPC SIZE: SOLVED in npcinst3 (Tom 11-10 13:02 "not sized properly", 14:04 "still small", 14:06 phone screenshots)
- Real cause (fact): the named cast gets an extra draw boost, `owHouseParty` in engine/town-render.js (x1.296 on streets, x1.6 in painted rooms) for sets in `OW_CAST_SIZED`. NPCs never got it, so they drew at about 77 percent (street) or 62 percent (rooms) of Tom's scale. Baking changes (npcinst1, npcinst2) could not fix that. My earlier diagnosis (cast not sized by real height) was WRONG: the cast IS real height via `set.k` (drawn rows: Tom 44 incl. padding, Grace 34.1, Rose 25.7, Amy 38.9, TNB 43.2, Justin 46.7, Boppy 40.6).
- Fix: painted townsfolk sets get `set.town=true` (data/townsfolk-hires-use.js `make`); `owHouseParty` treats them like the cast. Bake rule in tools/sprite-bake/bake_townsfolk.py: adults 42 x inches / 71 content rows with Tom's head height (`TOM_HEAD_ROWS`); kids (Pip, Moss, Dot) 32.6 x inches / 50 rows with Grace's head (`KID_HEAD_ROWS` 9.2). `CHIN[id]` = chin line as share of the front stand frame (read by eye, +/- 2 percent; bigger = smaller head).
- Looked at: Dot on the Square and Penny in her shop (portrait). NOT on a phone. Pixel villagers (drawNpc, `villagerSet`) are untouched and now smaller than the painted ones.
- Stop-loss note: two misses in a row happened on size before the cause was found. If Tom still says small, FIRST compare drawn rows of `OW[id]` x `owBoost` against a cast member in a test page (`tf_<id>` sets), do not rebake on a guess.

## Facts
- Another session pushed in parallel: side-row fix (`SIDE_FACES_RIGHT` replaces `SIDE_SWAP`; the Library sheets face LEFT and are used as drawn) and portrait zoom change (npcport2, tag npcface1). npcinst3 was rebased onto both and the townsfolk were rebaked on the merged baker. Pull and rebake from the merged `bake_townsfolk.py`; always run WITHOUT --only.
- Long Island NPCs (non-family) per data/maps-le.js: Bean, Bun, Dot, Fern, Ike, Gus, Kit, Luna, Moss, Delgado, Halverson, Kowalski, Oolong, Page, Penny, Pip, Pruitt, Reel, Sal. All have approved hero and walk, all installed. The other townspeople (about 35) live on Los Angeles maps and have DRAFT heroes and no generated walk sheets; Nickel and Sol (LA) installed because approved. Vance and Marlowe have no hero.
- Pip (v2), Moss (v1), Dot (v1) walk from their Library sheets since npcinst2; `tools/sprite-bake/src/{pip,moss,dot}-walk-v1.png` are now unused and not purged.
- Hero portraits (21): `tools/sprite-bake/bake_npc_portraits.py` -> portraits/npc/<id>.webp, wired as `npc_<id>` (engine/menu.js) and speaker names in DIALOG_PORTRAIT_IDS (engine/overworld.js). The other session changed the crop (npcport2).
- Open: scene speaker names that differ from map NPC names get no portrait; add the name to DIALOG_PORTRAIT_IDS.

## Next session
Waiting on Tom's phone check of NPC size (street and rooms). Adding more NPCs: LIBRARY_WALK, `CHIN` (ruler read), IDS in bake_npc_portraits.py, bake, bump tags, push.
