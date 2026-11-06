# Emotions (Tom 2026-11-05 23:43)

Tom: "we need emotions character sheets for each character so they can later be programmed to respond to situations in the story. create a set of 8 core emotions that comprehensively cover the emotions found throughout the entire game and design a generic character sheet that can be used for any character."

Status (2026-11-06 00:03): 9 sheets painted by Tom and indexed (below). Amy done 00:09, Nara 00:19: all 11 characters with a hero painting are indexed; Michael and Jojo need a hero picture first. NOT built: the game does not show emotion art yet; no story moment is chosen yet (Tom: "dont yet determine those moments yet, just index them").

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
- Prompt: tools/art-library/prompts/char-emotion-sheet.txt (generic, same text for every person). Nara has her own: tools/art-library/prompts/dog-emotion-sheet.txt (ears, tail, posture; sitting and lying poses allowed).
- Entries exist for every character with a hero picture: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Aunt Ellie, Olivia, Nara (11). Michael and Jojo need a hero picture first.
- Approved sources: art/raw/characters/<id>-emotions-v1.png.

## Dialogue index (fact, `emo6`)

- docs/EMOTION_INDEX.md: every cast line in chapters 1 to 20 and Nine Scoops tagged with one of the 8 moods (1,713 lines; 113 plain information lines left out), by chapter, as Character | Emotion | Dialogue. docs/emotion-index-lines.tsv: the same tags for all 1,826 lines with file and source line, for wiring `mood:` later. First-pass tags; Tom corrects. Nothing in the game reads them yet.

## Index (fact, `emo3`)

- Cutter: `python3 tools/sprite-bake/emotion_frames.py [ids]` (no ids = every sheet; `CHECK=/tmp/x.png` writes a contact sheet). Figures used as painted, at sheet resolution, no resize or flip. It drops one generator smudge (a pale pink blob on top of Olivia's hair in Happy).
- Output per character: art/emotions/<id>.webp, one row of 8 equal frames in the mood order, feet on the frame's bottom edge, figure centered.
- Index: data/emotions.js, `EMOTIONS` (the 8 keys in order) and `EMOTION_ART[id] = {src, fw, fh, frames:{<mood>:[x,y,w,h]}}`. Not loaded by index.html yet (no moment uses it); add the script tag and a loader with the first moment.
- Look up a pose: `EMOTION_ART.grace.frames.sad` gives the rectangle of Grace's Sad figure in art/emotions/grace.webp.

| Character | Sheet | Frame size (px) |
|---|---|---|
| Tom | tom-emotions-v1.png | 272 x 418 |
| TNB | tnb-emotions-v1.png | 267 x 423 |
| Grace | grace-emotions-v1.png | 251 x 432 |
| Rose | rose-emotions-v1.png | 235 x 425 |
| Justin | justin-emotions-v1.png | 273 x 430 |
| Deedee | deedee-emotions-v1.png | 247 x 432 |
| Boppy | boppy-emotions-v1.png | 268 x 426 |
| Aunt Ellie | ellie-emotions-v1.png | 254 x 426 |
| Olivia | olivia-emotions-v1.png | 244 x 425 |
| Amy | amy-emotions-v1.png | 263 x 426 |
| Nara | nara-emotions-v1.png (dog prompt; frames are wider, she sits and lies down) | 413 x 414 |
| Michael, Jojo | need a hero picture first | |

- Adding a character later: save the sheet as art/raw/characters/<id>-emotions-v1.png, run the cutter with that id (it merges into the index), approve the Library entry.
- Size in the game: frames are drawn scaled so the figure matches that character's real height next to Tom (docs/MAP_SIZES.md, NEXT TASK CAST SIZE), never at sheet size.

## Plan for programming (not built)

A dialogue line gets an optional `mood:'<key>'` (one of the 8 keys). The speaker on the map switches to that full-body pose and the dialogue box shows the face cropped from it; no mood means no bust change. A scene step could set a resting mood per character. Write this against the first approved sheet.
