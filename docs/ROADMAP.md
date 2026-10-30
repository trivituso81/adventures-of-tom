# Roadmap (Tom's vision)

Do not start any of this without a direction from Tom. This is context so your changes do not paint the project into a corner.

| Area | Vision |
|---|---|
| Story | About 40 hours, classic SNES JRPG with a sudden modern twist, shocking twists, tragedy later undone, betrayal, growing bonds. Characters come and go from the party like Final Fantasy IV. Chapters 1 to 10 are built; the bible plans 20 in two Parts. |
| Parts | Two Parts on the title screen. Part 2 is greyed out until Part 1 is complete and starts only from a Part 1 end-game save, everything carried over. |
| World | Multiple towns, each with sub-areas; dungeons; bosses; a world map. Today: Long Island and Los Angeles plus one sub-area per chapter. |
| Content as data | Maps, dialogue and scenes should be content files so a new town or chapter is data, not engine code. Today scenes are already data (`data/scenes.js`, `SCENE_OPS`); maps are partly data (`data/maps-*.js`). |
| Systems | Quest and flag system (flags exist in `STORY.flags`), enemy roster growth, deeper battle depth (status effects, multiple enemies, turn order exist already). |
| Combos | Tombos (Tom plus one), Family Finishes (3 or 4), Director's Cuts. Unlocked from meaningful story beats. Story unlock flags for tier 3 and finishes wait for chapters 11 to 20. |
| Voice | ElevenLabs v4, baked by Tom at the end of ability work. Controller play with no sound latency. |
| Platform | Phone first (portrait) with a landscape toggle. Possibly a packaged native app later. Saves must stay forward compatible. |
| Design principle | Kindness and love destroy evil and hatred. Monsters are Friction Sprites: ordinary annoyances. Abilities come from each person's real interests. |

## Longer-term fixes worth doing when Tom asks

- Make `engine/cloud-save.js` conditional so a standalone host has no claude.ai dependencies.
- Split `engine/battle2-kind.js` (400 KB) by tier or by set piece if editing it becomes slow. Mind the load order and the IIFE-local helper names.
- Stream voice clips on demand (asset files) instead of base64 inside scripts, once the game is hosted standalone.
