# New characters and ability pose sheets: the standard recipe (standing rule, 2026-10-31; art style and proportions rules 2026-11-01)

Tom should never have to rewrite an image prompt. This doc holds the requirements and the prompt templates. When he gives photos of a new character, Claude builds the spec and the whole prompt pack from this doc. When he asks for ability poses, Claude uses the ability rules below. Tom pastes the prompts into his external image AI and drops the returned sheets back into a conversation.

The character art style is now ILLUSTRATED WHIMSICAL REALISM (Tom, 2026-11-02; STYLE BLOCK v2 in section 0). The earlier realistic caricature look Tom called "32-bit realistic" (approved on Amy) is retired for new art, and the 16-bit pixel style stays retired. Character prompts never contain the words "16-bit", "32-bit", "SNES", "Super Nintendo", "Final Fantasy", "Chrono Trigger", "pixel art", "retro" or "sprite": those words pull an image AI toward pixel art. The game shrinks and bakes the painted sheets itself (section 6).

Section 7 (heads, heights, widths) is mandatory for every new adult or child. **Real height in feet and inches is required input: do not write the spec, the prompts or a bake until Tom has given it.**

## 0. Art style: STYLE BLOCK v2 and PHOTO FIDELITY BLOCK

Scope: character prompts (hero pose, walk, battle, ability). Props, enemies and backgrounds keep their own docs (`docs/PROP_ART.md`, `docs/ENEMY_SHEETS.md`, `docs/AREA_PAINTINGS.md`, `docs/ROOM_PAINTINGS.md`). Older prompt files in the Project written in 16-bit wording must be regenerated from this doc before they are re-run; copy their structure, never their style lines.

### STYLE BLOCK v2 (Tom, 2026-11-02; paste verbatim into every prompt for a party member, NPC or monster)

Tom's direction: "illustrated whimsical realism", one look for the party, the townspeople and the monsters, matching the painted school yard (docs/reference/school_style_ref.png, chosen by Tom 2026-11-02 as THE style reference; the Square and house interiors may be redrawn to match). Every prompt also attaches the style key image (`claude/style-key-prompt.txt` makes it) once Tom has approved it.

```
ART STYLE
- A whimsical storybook illustration of a real person, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork, like the illustrated school-yard painting it lives next to. Gently simplified shapes. Slightly stylized features that keep a clear likeness. Clothing prints and patterns are drawn in clear detail so every motif is readable.
- Caricature proportions: an oversized head about one third of the full body height, a slim body, small hands and small feet, large expressive eyes and a warm, slightly exaggerated expression. The face keeps a clear likeness of the real person in the photo.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges with fine detail. No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.
```

For a child, replace the second bullet's first sentence with: "Caricature proportions for a child: an oversized head a little under half of the full body height, a small body, small hands and small feet." (Section 7 sets the exact head share in the bake; the prompt only has to get close.)

For an invented NPC or a monster there is no photo: replace "of a real person" with "of a [short description]" and drop the likeness sentences. Enemies keep `docs/ENEMY_SHEETS.md` for frames and grids but take this block for style.

### Old STYLE BLOCK, retired 2026-11-02, do not use

Kept only so old prompt files can be recognised. It said "semi-realistic painterly rendering", "glossy highlights on skin and hair" and "finely painted hair strands". Any prompt file that contains those words is the old look: regenerate it from the block above before it is run.

### PHOTO FIDELITY BLOCK (paste verbatim into the hero pose prompt, and into every other prompt that has photos attached)

```
PHOTO FIDELITY
- The attached photos show the real person: [N] full body photo(s) and [M] face close-up(s). Use every one of them.
- The FACE must be a faithful likeness of the face close-ups: the exact face shape, jawline, cheeks, forehead, nose shape and size, lip shape, smile and teeth, eyebrows (shape, thickness, spacing), eye shape, eye color and eye spacing, freckles, moles, dimples, skin tone, and any glasses or facial hair. Exaggerate only the head size and the expression, never the individual features. Do not beautify, slim, age up or age down the face, and do not turn it into a generic face.
- The HAIR must match the photos exactly: color (including any highlights, roots or gray), length, parting, volume, texture and how it falls.
- The BODY must match the full body photos: height impression, build, shoulder width, arm and leg proportions, posture. Caricature only by enlarging the head and shrinking the hands and feet slightly.
- The OUTFIT, shoes, jewelry and accessories must match the photos exactly: every color, print, pattern, trim, seam, button and logo. Do not simplify or invent clothing details.
- If a full body photo and a close-up disagree (lighting, color cast, angle), the close-up decides the face and the full body photo decides the body and outfit.
- If something is not visible in any photo (the back of the outfit, the shoes), extend it plausibly and consistently with what is visible. Never invent a new accessory, hairstyle or color.
- Do not copy the photo background, shadows or lighting color cast. Only the person.
```

## 1. Trigger

| Tom does | Claude does |
|---|---|
| Sends photos of a person (new character), usually full body shots plus face close-ups, with or without a name | Check the real height is known (section 7). If not, ask for it in one line and wait. Then section 2 (spec, written from ALL the photos), then section 3 (the three standard sheets). Sends the prompts as files plus the spec in a short table, and says which photos to attach to which prompt. |
| Asks for poses for an ability or a new move | Section 4 (ability sheet rules). One prompt per move. |
| Drops returned sheets, often with no words | Section 6 (install). Never ask him to unpack, rename or resize anything. |

Claude makes the calls (grid size, pose lists, move beats) and says in one line which calls were made. Ask Tom only when a choice is expensive to redo, for example a character's outfit when the photo is unclear.

## 2. Character spec (Claude writes this from the photo)

Save as Project doc `claude/<id>-character-spec.md` and tell Tom the key rows in a table. Fields:

| Field | What goes in it |
|---|---|
| id, display name | lower case id used in file names and keys (for example `justin`), name as the game shows it |
| Role in the story | who they are to Tom, party slot or NPC, which town (check `docs/CANON.md` first; it wins over the photo for story facts) |
| Adult or child | decides which section 7 rules apply |
| Look (from the photos) | hair color and style, face shape, skin tone, facial hair, glasses, eye color, build, the usual outfit with colors and any print or pattern, shoes, any worn item (cap, jewelry, watch). Written so an image AI can match it exactly. |
| Real height | REQUIRED, in feet and inches, from Tom (never guessed, never taken from a photo). Section 7 turns it into battle pixels, walk rows and a welcome-screen height. |
| Signature props | what they hold or carry in every frame (none by default; hands empty in the standard sheets) |
| Personality and posture | how they stand, how they move, a facial default (for example grumpy, calm, bossy). This drives idle, hurt and cheer poses. |
| Moves | basic move, special, path skills (names, one line each). Take them from canon; propose new ones from the person's real hobbies and job. |

Read every photo before writing the spec. Take the face rows (face shape, eyes, brows, nose, lips, smile, skin tone, freckles) from the close-ups, and the build and outfit rows from the full body photos. Write measurable details ("wide-set hazel eyes, thick straight brows, small upturned nose") instead of "pretty face". Note anything the photos disagree on in one line.

If a photo shows more than one person, ask which one.

## 3. The three standard sheets (every new character gets all three)

BUILD ORDER (Tom, 2026-11-03): walking poses for ALL characters come first. Every character gets an approved hero pose and an approved walk before anyone gets a battle sheet, ability sheet or any other pose. The hero pose stays step one because the walk copies it. Do not write, offer or install battle or ability poses for anyone until every character's walk is done.

All three share these rules. Put them in every prompt.

- Style: STYLE BLOCK v2 from section 0, pasted verbatim, plus the approved style key image attached. If Tom attaches a reference in a different style, the reference wins.
- The attached reference (the hero pose, section 3A) shows the character. Draw EXACTLY like it in every frame: same face, hair, clothes, prints, colors, proportions, art style, level of detail. Also attach the best face close-up photo to the walk and battle prompts, with this line: "The attached photo is a close-up of the real person's face. Keep the face as faithful to it as the hero pose is, in every frame, including from the side and from behind where hair and ears show."
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere in the character. No magenta glow, spill, tint or fringe on the character's edges or hair strands. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Grid of equal square cells, filled left to right, top to bottom, in the numbered order. Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour. The AI will not hit the sizes exactly; the install step cuts by gaps.
- Same scale in every cell. Feet on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY the character. Hands empty unless a pose lists a prop. No effects, shadows, dust, motion lines, sparkles, props, other people, text or word balloons (effects are added in the game).
- Same head size, same hair volume and same outfit in every frame. The head is never redrawn smaller or larger from frame to frame.
- Closing line: "NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw the character in the pose described."
- Family friendly for ages 6 and up.

### 3A. Hero pose (the standard reference): ONE large picture

- One single image, one character, no grid. Portrait orientation (about 1024 x 1536; the biggest size the tool offers).
- Full body, head to feet in frame, standing neutral and relaxed, body turned a little (three-quarter) toward the viewer, a warm natural smile, face clear and readable, hands empty and relaxed at the sides, feet flat and visible.
- The highest detail of the set: hair strands, skin, fabric prints, shoes. This image is the reference Tom attaches to every other prompt. (Menu portraits are separate square paintings Tom supplies, cropped to `portraits/<id>.png` at 128 x 128; a bake never overwrites them, see section 6.)
- Background magenta as above.
- Needs ALL the photos attached (full body and face close-ups), with the PHOTO FIDELITY BLOCK pasted in. This is the only sheet built straight from photos, so it carries the likeness for everything after it.
- After it returns, Claude compares it to the photos (face first, then hair, build, outfit) and lists any drift in one line. If the face does not look like the close-ups, redo this sheet before running any other.

### 3B. Walking sheet (story mode, overworld): 3 x 3

1 cell = 256 px, sheet 768 x 768 (the AI usually returns a larger square; the install step handles it). Camera: a character turnaround at about chest height, full body, straight on for the front and back rows and a true side profile for the third row, no top-down angle. Standing figure about 180 px tall in the cell for an adult, about 150 px for a child. Frame order (keys in brackets):

1. DOWN STAND [ow_down_stand]: facing the viewer, feet together, arms at sides.
2. DOWN STEP A [ow_down_stepA]: foot on the viewer's right steps forward, arm on the viewer's left swings forward.
3. DOWN STEP B [ow_down_stepB]: mirror of 2.
4. UP STAND [ow_up_stand]: seen from behind.
5. UP STEP A [ow_up_stepA]: seen from behind, foot on the viewer's left steps away from us, arm on the viewer's right swings forward.
6. UP STEP B [ow_up_stepB]: mirror of 5.
7. SIDE STAND [ow_side_stand]: profile facing LEFT, feet together.
8. SIDE STEP A [ow_side_stepA]: profile left, front leg forward heel down, back leg trailing heel lifted, near arm back, far arm forward.
9. SIDE STEP B [ow_side_stepB]: profile left, passing moment of the stride, back foot lifted with a bent knee, body slightly higher.

Walk rules: arms swing opposite to the legs; the two STEP frames of a row mirror each other; STAND is neutral. Rows: 1 down, 2 up, 3 side. The game mirrors the side row for walking right. The back view shows the full hair and the back of the outfit with its print.

### 3C. Standard battle sheet: 4 x 4

UPDATE 2026-11-05 (CHANGES 290, 291): Tom sends Claude each character's hero picture, walk sheet and two battle sheets; Claude saves them as art/raw/characters/<id>-hero-ref-v1.png, <id>-walk-sheet-v1.png, <id>-battle-sheet-1-v1.png, <id>-battle-sheet-2-v1.png. The Art Library Characters tab holds only one 3 x 2 sheet per ability (prompts/char-ability-sheet.txt + frames in tools/art-library/char-prompts.js), attaching those four pictures; it shows blocked until they exist. The 16 frame list below is the older recipe.

1 cell = 256 px, sheet 1024 x 1024. Character FACES LEFT in every frame (side or three-quarter view from slightly above, a party member facing an enemy on the left). Frame order (keys in brackets):

1. IDLE A [bt_idleA]: battle stance, feet shoulder width apart, knees slightly bent, hands loose, the character's default expression aimed at the enemy.
2. IDLE B [bt_idleB]: same stance a moment later, chest risen with a breath, a small personality gesture.
3. WALK A [bt_walkA]: striding left, near foot forward, opposite arm swinging.
4. WALK B [bt_walkB]: the opposite step.
5. HIP [bt_hip]: standing, hands on hips, chin lifted, confident or impatient (match the personality).
6. ACT [bt_act]: right arm extended to the left, presenting or offering, a small proud expression.
7. WIND-UP [bt_wind]: body twisted away from the enemy, arm cocked back, weight on the back leg, eyes narrowed.
8. SWING [bt_swing]: follow-through, lunging far forward to the left, arm at full extension, front knee bent, mouth open in a shout.
9. SPREAD [bt_spread]: feet planted, both arms flung wide, chest out, chin up, announcing something.
10. GUARD [bt_guard]: crouched low, forearms crossed in front of chest and face, chin tucked.
11. HURT [bt_hurt]: flinching, body knocked back and leaning right, head thrown back, eyes squeezed shut, one foot lifted.
12. LOW HEALTH [bt_low]: kneeling on one knee, hand on knee, head hanging, a black eye around the visible eye, tired grimace.
13. KNOCKED OUT [bt_ko]: down on hands and knees facing left, head bowed, eyes shut, a black eye, rounded back, defeated slump.
14. CHEER A [bt_cheerA]: victory, one fist pumped high, other hand on hip, big grin.
15. CHEER B [bt_cheerB]: both fists overhead, laughing, heels lifted.
16. SIGNATURE [bt_sig]: the character's own personality pose from the spec (Boppy's was GRUMBLE: bent forward, hand on belly, palm up complaining). Claude writes this one from the spec.

The standard set already covers idle, walk, hurt, low health, KO and cheer, so ability sheets never repeat those.

## 4. Ability pose sheets: the poses rule (Tom, 2026-10-31)

Why: Justin's first kit had 14 to 16 poses per move against 4 to 7 for everyone else, with long prep and aftermath, and it felt busy and distracting. Tom approved cutting every move to 4 to 7 poses and said "make sure you don't throw away the frames that are critical to the ability". Every new ability follows this from the start.

| Rule | Detail |
|---|---|
| Count | 4 to 7 distinct poses per ability. Never more than 7. Move shorter than 4 only for a one-gesture basic move (3 is allowed there, Loose Wire has 3). |
| Keep the critical frames | The pose that makes the move readable (the one thing a player would remember), the peak or impact pose, and the shortest anticipation that sets it up. If a frame is the reason the move is funny or clear, it stays. |
| Cut the rest | No walking in or out (the standard walk and run frames cover that). No fiddling, checking, looking around, wiping, shrugging, smirking or tidy-up frames after the hit. No near-duplicate poses: hold a pose longer in the game instead of drawing a second copy. |
| Shape of a typical move | 1 anticipation, 1 to 3 action or build poses, 1 peak or impact (the HIT frame), 0 or 1 reaction or finish. |
| Long holds | A signature frame can be held a long time in the game (Giant Sneeze's sneeze 0.8 s, Foot Tap's scream 1.1 s). Say in the prompt which pose is the HIT frame; the game holds it. |
| Spoken lines | About 2 per move (one at the setup, one at the peak). Each line is written for its pose. Line text stays exact once baked. |
| Length in game | About 2 to 3 seconds at normal speed. |
| Props | A prop held across several frames is painted into the sheet in the same painted style and listed in the prompt ("holds a sledgehammer in every frame"). Thrown props, sparks, lightning, dust, flashes and screen effects are never painted in the sheet; the game draws them. |
| Facing | LEFT in every frame, except a frame that must face RIGHT (walking back, turning to a friend); list those. |

### Ability sheet grid

4 columns, 256 px cells, rows as needed: 4 poses = 4 x 1 (1024 x 256); 5 to 8 poses = 4 x 2 (1024 x 512). Unused cells stay empty magenta with no number. Poses are numbered in play order.

### Ability prompt template

```
IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game. The character is [NAME], [one line of personality]. The attached image is the reference for [NAME]. Draw [him/her] EXACTLY like the reference in every frame: same face, hair, clothes, prints, colors, proportions, art style, level of detail.

[STYLE BLOCK from section 0, pasted verbatim]

THE MOVE
"[MOVE NAME]": [two or three sentences: what happens, in the order it happens, with the humor].
[PROP BLOCK if any: what the prop is, its colors, that it appears in frames X to Y, identical every time. Nothing else is allowed in the frame.]

THE SHEET (strict)
- A grid of 4 columns by [R] rows of square cells, 256 x 256 pixels each, so the full image is [W] x [H]. If your tool offers a different size, keep exactly 4 columns and [R] rows.
- Exactly [N] frames, one per cell, filled left to right, top to bottom, in the numbered order below. Unused cells stay completely empty magenta, with no number.
- [shared rules from section 3: scale, margin, baseline, same head size in every frame, facing LEFT except frames listed, magenta background with no spill on edges, draw only the character, no effects]

THE [N] FRAMES (each clearly different from the others)
1. [KEY] ANTICIPATION: [exact body, arms, legs, face, prop].
2. ...
[k]. [KEY] HIT: [the peak pose; say "this is the frame the move lands on"].
...

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw [NAME] in the pose described.
```

Frame keys use a short move prefix (for example `pm_` for Portrait Mode). Save the prompt as Project doc `claude/<id>-<move>-prompt.md` with a "Build notes (when the images return)" block first: frame keys in order, which frame is the HIT, which frames face right, painted props, the planned sequence and the spoken lines. Existing examples (older ones use 16-bit wording: copy their structure, not their style lines): `claude/grace-portrait-mode-prompt.md`, `claude/tom-anc-prompt.md`, `claude/boppy-character-sheets-prompt.md`, `claude/justin-fresh-fit-suit-prompt.txt`.

## 5. What Claude hands Tom

1. A short table: id, display name, the spec rows he might want to correct, height, move list.
2. The prompt files, one per sheet: hero pose, walk, battle (three standard), then one per ability if abilities were asked for. Sent as files so he can download; copies saved in the Project.
3. One line on the calls made (for example "Maya is 5\'4\", so 129 battle px; cap in every frame").
4. Which order to run them in: hero pose first (it becomes the reference for all the others), then the walk. Battle and ability sheets wait until every character's walk is approved (build order, section 3).

## 6. When the sheets come back

Same pattern as `docs/JUSTIN_ABILITIES.md` and `docs/ENEMY_SHEETS.md`:

1. Match each image by content to its sheet; check each cell against the numbered list; count cells. A missing or wrong cell is a one-line note, install the rest. Also check that the head size, hair and outfit print stay consistent across cells; a drifting head is a redo for that sheet.
2. Save sources under `tools/sprite-bake/src/<id>-<sheet>-v1.png`.
3. Cut cells by magenta gaps with `slice_sheet` in `tools/sprite-bake/sheet.py` (never fixed pixel positions). Painted sheets are keyed from magenta with edge cleanup (no pink fringe on hair), then baked with a script copied from `bake_olivia.py` (walk) and `bake_olivia_battle.py` (battle and ability sheets, blob-detected with `by_position=True`); they already include the section 7 head step. Look at the contact sheet in `tools/shots/`.
4. Apply section 7 for height and width in the bake and in `BATTLE_SIZE` before wiring anything else. Match the head to its age target (section 7) and show Tom the head row before and after (Tom lifted the 11-03 no head resizing rule on 11-05).
5. Wire into the party data and the walk and battle sprite sets; moves go in `engine/<id>-moves.js` using the queue primitives in `docs/BATTLE_SYSTEM.md`.
6. Ability timing: authored hold times can run longer than real time because the Justin file scales every move by 0.66 at the bottom of `engine/justin-moves.js` (a new character file should do the same, with long-hold moves excluded). Hold the HIT frame; keep the move to about 2 to 3 seconds.
7. Cache: atlas image addresses in the generated data carry NO `?v=` tag; `engine/painted.js` adds `?v=ART_V` to every atlas without one. Bump `ART_V` whenever any baked .webp changes, and bump each changed script's `?v=` tag in `index.html`. A hard-coded tag on an atlas address keeps old art on Tom's phone (it hid Tom's new head on 2026-11-01). Bakes never overwrite `portraits/<id>.png` unless run with `PORTRAIT=1`.
8. Test: `python3 tools/kit_test.py <id> --speed2`, `IDS=<id> python3 tools/smoke.py`, `python3 tools/smoke.py`; look at every contact sheet in portrait and landscape. Push to `main`. Tell Tom in a few lines what landed and what to look for on the phone.
9. Spoken lines: add to `data/lines.js` (and a script in `tools/voice-library/battle-overrides.json`); they play through speech synthesis until a voice bake. Never reword a baked line.

**Sharper battle sheets (`sharp1`, 2026-11-05):** after baking or rebaking any battle or ability sheet, run the character through `tools/sprite-bake/hires.py` and `hires_install.py` (tools/sprite-bake/README.md, "Sharper battle sheets"). The bake scripts alone write K 2 sheets, which look blurry on a phone.

## 7. Proportions: heads, heights, widths (Tom, 2026-11-01; mandatory for every new adult or child)

**STYLE KEY v1 APPROVED (Tom, 2026-11-02 11:54): `docs/reference/style_key_v1.png` is THE style key.** For all art regenerated in the new style, head share (top of hair to chin over full height) is about **0.21 to 0.22 for adults and about 0.25 for Grace** (a 6 year old follows Rose's ratio to Grace's, measure it from the first approved Rose hero pose). Attach the key to every character, NPC and monster prompt. The tables below describe the OLD baked art (0.37 walking, 0.43 battle for kids, adult head rows) and stay in force only until a character is regenerated; when Phase C replaces a character, set that character's `*_HEAD_RATIO` from the approved new hero pose after a head row, not from these tables. Real heights stay mandatory. Known scale slips in the key itself (do not copy them): Amy is drawn about 98% of Tom (real 92%), the shopkeeper is shorter than Amy (should be taller), the Mudling's top sits above Grace's knee. Phase C fixes this with a height chart reference image.

**Real height is required.** Before any spec, prompt or bake, Tom must give the person's real height in feet and inches. If it is missing, ask one short question and wait. Never guess it and never read it off a photo.

### Adults

| Rule | How |
|---|---|
| Faces all look the same size | Every adult's face reads as the same size as everyone else's. Hair, hats and baldness do not count; the face does. Tom's eye is the judge: numbers only guide, because the paintings differ in proportion (wide-set eyes, short chins, wide faces, big smiles). |
| How to match a new adult's head | Build a HEAD ROW: each adult's head cut at its real on-screen size, chins on one red line (walk frames at welcome-screen scale; battle idles at in-game scale). Compare the new person to Amy, Deedee and Justin. Grow or shrink ONLY the head, about the chin (`tools/sprite-bake/kidhead.py` `grow_head`, or the bake's own head warp); the body stays the same size. Show Tom the head row before and after. A bald head reads bigger, so a bald adult sits a little under the others. A cap hides the forehead: estimate the face from eye line to chin, never from the brim. |
| Battle height | Whole figure (top of hair or cap to feet) = real height x 2.01 battle px per inch (Justin 6'4" = 153 px). Set with `BATTLE_SIZE` (data/battle-size.js, or the character's own use file). |
| Welcome screen (if they appear there) | Body from chin to feet = 208 px x height / 76 in (Justin's), hair and caps sit on top. `SPLASH_SPOTS` h in engine/splash.js is the total height; set it so the body comes out right. |
| Walk sprite | 42 to 45 rows for adults up to about 6 ft; 53 to 54 rows for 6'2" and over (Justin, Michael). |
| Shoulders | Men's shoulders match Justin's (Tom and TNB were matched to him). Others stay as painted unless Tom asks. Tool: `body_width` in tools/sprite-bake/headwarp.py (`fade=(f0, f1)` narrows only the upper body). |

### Children

| Rule | How |
|---|---|
| Head share | Top of head to chin divided by total height = **0.43 in battle, 0.373 walking** (the Tom and TNB average), same as Grace and Rose. Grow the head only with `kidhead.factor(target, current_share)` and `grow_head`; the body keeps its size and the figure grows by the head. |
| Height | Real height required. Kids are drawn larger than the adult scale on purpose so they read well (Tom approved Grace and Rose as they are). Rose is 75% of Grace in battle. Place a new child between Rose and Grace by real height in battle px and walk rows; outside that range, ask Tom. |

### Carried children (Michael with Lachlan and Isla; Tom, 2026-11-01, reinstalled as painted 2026-11-06)

Michael (6'4", same as Justin) carries his kids Lachlan (4) and Isla (1) in every frame. Rule: his whole figure follows his real height (walk 53 bake rows like Justin, top of cap to feet, drawn at k .8483 = 44.96 rows next to Tom's 42). Since `michaelwalk3` (Tom's approved Art Library sheet `michael-walk-sheet` v3, art/raw/characters/michael-walk-sheet-v3.png) the nine figures are used exactly as painted: `tools/sprite-bake/bake_michael.py` cuts them with walk_sheet_frames.grid, applies one scale to all nine, and writes art/chars/michael-ow.webp and data/michael-hires.js (`OW_K` 7). No head growing, no flipping (the engine mirrors left for side). The 2026-11-01 version grew the three heads as layers (Lachlan to Grace's head, Isla to Rose's); that code and its sheet src/michael-walk-v1.png are gone. Tom's painting has darker outlines than the rest of the cast; they are used as painted.

### Current reference values (after `olivia8` and `jojoart1`)

| Character | Real height | Battle px (top to feet) | Walk rows | Welcome px (top to feet) |
|---|---|---|---|---|
| Justin | 6'4" | 153 | 54 | 330 |
| Tom | 5'11" | 142 | 43 | 308 |
| TNB | 5'10" | 141 | 44 | 309 |
| Boppy | 5'7" | 133 | 43 | 284 |
| Amy | 5'5" | 131 | 43 | 282 |
| Deedee | 5'5" | 131 | 43 | 278 |
| Olivia | 5'8" (Tom 2026-11-11) | 130 (battle not re-sized in heights1) | 42 | not on it |
| Jojo | 5'6" | 133 | 42 | not on it |
| Aunt Ellie | 5'2" (Tom 2026-11-11) | never in battle | 43 | not on it |
| Michael (carrying Lachlan and Isla) | 6'4" | never in battle | 53 (painted as is, `michaelwalk3`; cap top to feet, drawn at k .8483 = 44.96 rows) | not on it |
| Grace | 4'2" | 126 | 39 | 230 |
| Rose | 3'4" | 95 (75% of Grace, Tom 11-06) | 37 | 205 |

### Real heights in the overworld (heights1, Tom 2026-11-11)

Tom: "main character height should always be a factor of the head size set in the head sizes function, and their hardcoded heights using a character like Tom as a baseline."

| Thing | Where | Rule |
|---|---|---|
| Real height | `data/heights.json` (inches) | The ONE place a main character's height is typed. Townsfolk: `ft` in `tools/art-library/npc-prompts.js`. |
| On-screen height | `walk_sheet_frames.figure_rows(id)` | Tom's 42 rows x inches / 71, top of hair or cap to feet. A head factor never changes it (adults, kids, Tom, townsfolk alike). |
| Head | `walk_sheet_frames.tom_head_rows()` | Adults: Tom's head as currently baked x the character's HEAD SIZES factor. A factor on Tom moves every adult (head_adjust.py rebakes them all). Tom, Grace, Rose, Nara: painted head x their factor. |
| Draw scale (`OW.<id>.k`) | `data/walk-scale.js`, GENERATED by `python3 tools/sprite-bake/heights.py write` | Measured from the baked walk art, so the figure is exact whatever the bake rounded. Never type a `set.k` for a main character. |
| Test | `python3 tools/heights_test.py` (smoke runs `--fast`) | Fails when anyone is more than 1 percent off their real height, when walk-scale.js is stale, or when a draw scale is typed by hand. |
| Changing a height | edit heights.json, `walk_splice.py <id>` (adults), `heights.py write`, `bake_talk_faces.py <id>`, `bake_story_poses.py` (one `EMO_HEAD` nudge), `head_adjust.py manifest`, heights_test | Kids and Tom need no rebake for a height change (the draw scale alone does it). |
| Chin lines on the HEAD SIZES page | `tools/sprite-bake/chin_lines.json`, read with `chin_ruler.py` | The Head Row puts the TRUE bottom of each chin on the red line. A reading belongs to one sheet file; after a new walk sheet, `manifest` warns and the chin must be read again. The bake's own head anchors (`WALK_MATCH`, `PLAIN`, `townsfolk_common.CHIN`) are older eye readings that sit above the true chin for most people; they were NOT changed (that would resize every head). |

Not rebaked in heights1 (not asked): TNB, Justin, Amy, Deedee, Ellie, Jojo walks. Their draw scales moved by under half a percent to the exact value. A no-change rebake of those six now differs from the repo by a fraction of a pixel (the bake takes its scale from heights.json instead of a typed number); that is expected the first time each is rebaked.

### Where the knobs live

Head size adjuster (headadj1, headadj2): Tom's screen is ADMIN > HEAD SIZES (`heads.html`); it saves requests to `data/head-requests.json` and Claude runs `python3 tools/sprite-bake/head_adjust.py apply-requests` (or `show|apply|reset` by hand). A factor goes through `HEAD_TWEAK` (head_tweak.json, read by `walk_sheet_frames.py`). Run `head_adjust.py manifest` after any new walk sheet. Not yet covered: Jojo, Michael, townsfolk.

`BATTLE_SIZE` (data/battle-size.js; `BATTLE_SIZE.olivia` in data/olivia-battle-use.js); `SPLASH_SPOTS`, `TITLE_TOM_H`, `SPLASH_ALL`, `SPLASH_BACK` (engine/splash.js); `BATTLE_HEAD_RATIO`, `WALK_HEAD_RATIO` (bake_amy, bake_deedee, bake_boppy, bake_amy_extra); `TARGET_BT`, `TARGET_OW`, `TARGET_OWL`, `BODY_W`, `BODY_FADE`, `BODY_KX` (bake_tnb); `FACE_GROW`, `FACE_GROW_W`, `BODY_W`, `HEAD_BOX`, `REGION` (bake_tom); `BODY_W` (bake_boppy); `PEP_GROW` (bake_boppy_extra); `--ratio`, `--ratio-side` (bake_justin, walk); `HEAD_K`, `CHIN_SHARE` (bake_olivia_battle); `WALK_HEAD_K`, `WALK_CHIN` (bake_olivia); `S_BT`, `S_OW` (bake_grace, bake_rose); `--ow-h`, `--ratio`, `--ratio-side`, `CHIN_FIX` (bake_jojo, overworld only; its battle atlas is bake_jojo_stance); hand and eye bands `HR` (amy, deedee, boppy -hires-battle.js). The full history of each change is in docs/CHANGES.md (`heads1` to `heads6`, `body1`, `width1` to `width3`, `kids1`, `faces7`, `olivia8`).
