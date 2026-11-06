# Emotions (Tom 2026-11-05 23:43)

Tom: "we need emotions character sheets for each character so they can later be programmed to respond to situations in the story. create a set of 8 core emotions that comprehensively cover the emotions found throughout the entire game and design a generic character sheet that can be used for any character."

Status: the 8 emotions and the sheet prompt are decided. Art Library entries `<id>-emotions` (Characters tab) are drafts. NOT built: the game does not show emotion art yet; no dialogue line carries an emotion yet.

## The 8 core emotions (frame order = sheet order)

| # | Key | Covers (every feeling in the game maps to one of these) | Where the game needs it |
|---|---|---|---|
| 1 | `happy` | joy, laughing, excited, relieved, silly, playful, sheepish | Rose's silliness, cheers after a fight, family jokes |
| 2 | `loving` | warmth, tenderness, kindness, gratitude, comfort, forgiving | Kindness and Warmth (the battle theme), hugs, "to the moon and back", every boss won over |
| 3 | `sad` | lonely, missing someone, hurt feelings, sorry, guilty, disappointed | every boss is an old lonely thing; apologies; goodbyes |
| 4 | `angry` | mad, grumpy, frustrated, annoyed, complaining, jealous | Grump Hollow foes, Boppy's aches, sibling squabbles, bosses before they soften |
| 5 | `scared` | afraid, nervous, worried, startled, shy | first monster sightings, the kids in danger, flights |
| 6 | `surprised` | shock, awe, wonder, confused, "wait, what?" | reveals, new places, a move that goes wrong |
| 7 | `proud` | confident, brave, determined, bossy, smug, show-off | Grace bossing, Tom's Seat 1A and gadgets, before a boss fight |
| 8 | `unimpressed` | dry, deadpan, sarcastic, skeptical, bored, fed up, "fine." | Tom's whole voice ("No touching, please."), Boppy's complaints, reacting to puns |

Why these 8: a word count over every scene and map file (data/scenes*.js, bonus-nine-scoops.js, maps-le.js) shows the game's feelings cluster as "fine." 66, mad 43, love 42, grump 41, thank 39, miss 38, laugh 29, hug 21, sad 16, proud 13, sorry 12, scared 11. Tired, dizzy and startled already exist as battle poses (battle sheet 2), so they are not dialogue emotions. Embarrassed appears once: use `happy` when laughing it off, `sad` when it hurts.

## The sheet (one per character)

- Art Library, Characters tab, entry `<id>-emotions`: 4 x 2 grid of square cells, ar 2:1, magenta background, the whole character head to feet, standing, facing the viewer in a slight three-quarter view, same figure size and ground line in every cell. Full body (Tom 23:57: the first hips-up version cut characters off at the waist, useless on the map). The feeling reads from the body on the map and in scenes; the face is cropped from the same painting for the dialogue box (as bake_portraits.py does from the hero). Row 1: happy, loving, sad, angry. Row 2: scared, surprised, proud, unimpressed.
- Reference: the character's hero picture only (art/raw/characters/<id>-hero-ref-v1.png).
- Prompt: tools/art-library/prompts/char-emotion-sheet.txt (generic, same text for every character; Nara uses the animal sentence).
- Entries exist for every character with a hero picture: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Aunt Ellie, Olivia, Nara (11). Michael and Jojo need a hero picture first.
- Approved sources save as art/raw/characters/<id>-emotions-v1.png. Bake (not written yet): cut by the frame order above.

## Plan for programming (not built)

A dialogue line gets an optional `mood:'<key>'` (one of the 8 keys). The speaker on the map switches to that full-body pose and the dialogue box shows the face cropped from it; no mood means no bust change. A scene step could set a resting mood per character. Write this against the first approved sheet.
