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
| Tom | tom-emotions-v4.png (v3 plus the unimpressed cell replaced by Tom's own picture) | 202 x 348 |
| TNB | tnb-emotions-v1.png | 267 x 423 |
| Grace | grace-emotions-v1.png | 251 x 432 |
| Rose | rose-emotions-v1.png | 235 x 425 |
| Justin | justin-emotions-v1.png | 273 x 430 |
| Deedee | deedee-emotions-v1.png | 247 x 432 |
| Boppy | boppy-emotions-v2.png | 210 x 338 |
| Aunt Ellie | ellie-emotions-v1.png | 254 x 426 |
| Olivia | olivia-emotions-v1.png | 244 x 425 |
| Amy | amy-emotions-v1.png | 263 x 426 |
| Nara | nara-emotions-v1.png (dog prompt; frames are wider, she sits and lies down) | 413 x 414 |
| Michael, Jojo | need a hero picture first | |

- Adding a character later: save the sheet as art/raw/characters/<id>-emotions-v1.png, run the cutter with that id (it merges into the index), approve the Library entry.
- Size in the game: frames are drawn scaled so the figure matches that character's real height next to Tom (docs/MAP_SIZES.md, NEXT TASK CAST SIZE), never at sheet size.

## Listener reactions (react1, Tom 2026-11-12)

Tom: "currently, emotion states are just flagged on a character based on their dialogue lines. i also want every other character in the conversation, whether it's Tom when talking to NPCs, or group conversations in cut scenes. inventory every possible scenario and tag other characters who should have a reaction for a given dialogue."

Status: TAGGED; chapter 1 scene lines WIRED as a pilot (react2, `tools/reaction-apply.py 1`); other chapters and kinds not wired. `docs/emotion-reactions.tsv` holds 9,852 reactions on 3,094 dialogue lines (one row per line and listener). Readable copy `docs/REACTION_INDEX.md`; check and rebuild `python3 tools/reaction-index.py`. The game does not load it.

Timing (reacttime1, Tom 2026-11-13): a reaction row may end with an `at` value, the exact words of the line that cause the reaction; the listener reacts when the line reaches the end of those words (clip clock, or typewriter when silent). Empty = at the start of the line. Chapters 1 and 2 are on and fully cued (`python3 tools/reaction-apply.py 1 2`). When tagging a new line always give the cue words. Test: tools/reaction_timing_test.py.

### Every place a dialogue box appears

| # | Scenario | Lines | Tagged | Who can react |
|---|---|---|---|---|
| 1 | Story scenes, chapters 1 to 20 and Nine Scoops: cast lines, townsfolk lines, monster and boss lines, narration boxes (Nara, rooms, objects) | 2,338 | 2,319 | everyone in the scene who has a mood pose |
| 2 | Talking to a person on a map (first visit, revisit, hug, chapter variants) | 373 | 373 | Tom and whoever is walking with him |
| 3 | Recruit ask, yes, no, swap, and follower chatter | 46 | 46 | Tom and the party |
| 4 | Penny and Nickel shop lines | 66 | 66 | Tom and the party |
| 5 | Cab drivers Sal and Sol | 36 | 36 | Tom, the girls (Sal), TNB and Nara (Sol) |
| 6 | Airport trips: goodbyes at the cab, who stays behind, arrivals, welcome home | 220 | 166 | Tom, Grace, Rose, TNB, Nara. The 54 untagged are Tom alone on the plane or at the kerb |
| 7 | Chapter 19 memories and keepsakes, chapter 20 doors | 59 | 59 | the family present |
| 8 | Aunt Ellie's bets | 29 | 29 | Tom, Grace, Rose |

### Not tagged, and why

| Scenario | About | Why |
|---|---|---|
| Lines whose words are built while the game runs (chapter 6 dig finds, 7 catalog card, 8 pilot light, 9 mirror, 10 clock hand, 17 smash, chapter 19 "you set down" line, chapter 20 door questions and wrong answers, two Tom narration lines at the end of chapter 16) | 30 | no fixed text to key a tag on; tag them by scene step when wiring |
| Monsters talking on a map before a fight (chapters 1 to 20; the four Nine Scoops ones are tagged) | 161 | next pass; the party's reaction is nearly always the same two or three moods |
| Signs, objects and room descriptions outside story scenes | not counted | nobody is speaking |
| Battle lines | all | battles use battle poses, not emotion poses |
| Mr. Pistachio, Lachlan, Isla, monsters and bosses as listeners | 7 tags dropped | no emotion sheet |

### Tagging rules used (first pass; Tom corrects)

- The speaker never reacts to their own line (their mood is in the two speaker files).
- A listener is tagged when the line would change their face: spoken to by name, a joke, a scare, a reveal, praise, affection, bad news. Kids react bigger and more often than adults.
- Tom is dry: unimpressed at nonsense and bragging, loving for family warmth. With TNB he reads warm (happy or loving); unimpressed only for a pun he then forgives.
- A tag is safe to leave on someone who is not there: the game will only pose people who are visible in that scene.
- Scenarios 1 to 5 were tagged line by line. Scenarios 6 to 8 were tagged by rule (who speaks to whom) with single-line corrections.
- 20 lines appear in two places with different reactions (for example a line reused in a later chapter): the wiring must key those by scene.

### Wiring plan (not built; recommended next)

1. `tools/reaction-apply.py` builds `data/emotion-reactions.js` from the tsv: `EMOTION_REACTIONS['<speaker>|<text>'] = [['grace','happy'], ...]`, with a `|<scene>` key for the 20 clashes, and a chapter switch like `EMO_CHAPTERS`.
2. `engine/emotions.js` `emoApply`: after the speaker's mood, look the line up and give each visible listener the full-body pose `em_<mood>` (same `scenePose` mechanism, marked so `emoClear` removes all of them). A listener who already holds a story pose, rides Tom's shoulders or is hidden is skipped. The dialogue box keeps showing only the speaker's face.
3. Pilot on chapter 1 only, show Tom, then switch on the rest in the same batches as the speaker moods.
4. Risk to judge in the pilot: with three or four people changing pose on almost every line the screen may look busy. If so, thin the tsv (for example drop the plain "happy" reactions) rather than change the engine.

## Plan for programming (not built)

A dialogue line gets an optional `mood:'<key>'` (one of the 8 keys). The speaker on the map switches to that full-body pose and the dialogue box shows the face cropped from it; no mood means no bust change. A scene step could set a resting mood per character. Write this against the first approved sheet.

Mood poses face the camera only (pieface2, then close1, 2026-11-12): a full-body mood pose (`em_*`) is drawn only when the person already faces the camera (`down`, `emoFrontOk` in engine/emotions.js); otherwise they keep the normal sprite, turned toward the people they talk with or the thing they react to. This holds for every mood, speakers and listeners. The mood face in the dialogue box always shows. To show a mood toward the side, side-facing poses would be needed (Art Library).
