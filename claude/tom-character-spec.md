# Tom: character spec (written 2026-10-31 from Tom's three photos and the brief "graphic tee, jeans and sneakers")

Status: spec and the three standard prompts are done. Nothing is installed. Tom runs the prompts (hero pose first) and drops the sheets back; then install per CHARACTER_PIPELINE section 6. This is a redo of the player character's art in the painted style, replacing his current overworld and battle sprites, so the existing kit in engine/tom-moves.js and data/abilities.js stays as is.

## Identity

| Field | Value |
|---|---|
| id, display name | `tom`, Tom (the girls say "Tata" in speech only) |
| Role in the story | Player character, "Uncle". Lives in the T&T house with TNB. Always in the party. |
| Photos used | 1 full body (lavender polo, gray jeans, white sneakers), 2 face close-ups (one with a pink bunk bed and a streamer behind, one in a navy zip hoodie at a desk) |
| Look: hair | Very short, tidy, dark brown with gray at the sides and temples, about half an inch on top. High rounded forehead, receding at the temples, thinning at the crown. |
| Look: face | Broad rounded oval, full cheeks, warm light olive skin with rosy cheeks, thick dark eyebrows, dark brown eyes with smile creases at the outer corners, medium straight nose slightly broad at the tip, wide easy smile showing the top teeth, medium ears close to the head. |
| Look: beard | Full short trimmed beard joined to the mustache. Dark brown on the mustache and upper cheeks, salt and pepper at the chin and jaw. |
| Look: build | Average height, solid and slightly stocky, broad shoulders, a soft middle. |
| Outfit (Tom's call) | Heather navy crew-neck t-shirt, untucked, with a chest print of a retro game controller (cream-gray body, plus-shaped D-pad, one red and one mustard yellow button) and a small red heart above it. No words or logos. Back plain navy. Washed charcoal-gray slim straight jeans (the gray from the polo photo) with a black braided belt. White low-top sneakers with a black side accent, no readable brand text. Smartwatch with a gray-green woven band on the left wrist. |
| Height | 200 px in the battle sheet (standing adult, canon). |
| Signature props | None in the standard sheets, hands empty. |
| Personality and posture | Dry, calm, wry. Default face: relaxed half smile, one eyebrow a touch higher. Stands loose and steady, a bodyguard when family is hit. |
| Moves (canon, unchanged) | Sky Laser, Combo Fireball, Block Drop; Cheat Code, Boss Rush, Speedrun, Final Boss. Special DEFEND: steps in front of whoever is attacked and says "No touching, please." Signature frame 16 is the DEFEND stance. |

## Photo disagreements
- Hair is cut shorter in the full body photo than in the close-ups. Close-ups decide: half an inch on top.
- The full body photo shows a lavender polo and a Nike swoosh on the sneakers. The polo is replaced by the graphic tee; the sneaker logo is turned into a plain black side accent so no brand shows.

## Calls I made
- Gray jeans kept from the photo (jeans color was not specified).
- Tee graphic: generic retro game controller plus heart, in cream, red and mustard on heather navy, to match Tom's video-game theme and warm palette. If he wants a different graphic, change only the Outfit bullet in the hero pose prompt.
- Watch kept because it is in the full body photo and is part of how he looks.
- Battle signature frame is DEFEND (his canon special).
