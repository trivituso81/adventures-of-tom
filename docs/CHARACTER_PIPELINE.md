# New character and ability pose sheets: the standard recipe (standing rule, 2026-10-31)

Tom should never have to rewrite an image prompt. This doc holds the requirements and the prompt templates. When he gives a photo of a new character, Claude builds the spec and the whole prompt pack from this doc. When he asks for ability poses, Claude uses the ability rules below. Tom pastes the prompts into his external image AI and drops the returned sheets back into a conversation.

## 1. Trigger

| Tom does | Claude does |
|---|---|
| Sends a photo of a person (new character), with or without a name | Section 2 (spec), then section 3 (the three standard sheets). Sends the prompts as files plus the spec in a short table. |
| Asks for poses for an ability or a new move | Section 4 (ability sheet rules). One prompt per move. |
| Drops returned sheets, often with no words | Section 6 (install). Never ask him to unpack, rename or resize anything. |

Claude makes the calls (grid size, pose lists, move beats) and says in one line which calls were made. Ask Tom only when a choice is expensive to redo, for example a character's outfit when the photo is unclear.

## 2. Character spec (Claude writes this from the photo)

Save as Project doc `claude/<id>-character-spec.md` and tell Tom the key rows in a table. Fields:

| Field | What goes in it |
|---|---|
| id, display name | lower case id used in file names and keys (for example `justin`), name as the game shows it |
| Role in the story | who they are to Tom, party slot or NPC, which town (check `docs/CANON.md` first; it wins over the photo for story facts) |
| Look (from the photo) | hair color and style, face shape, skin tone, facial hair, glasses, eye color, build, the usual outfit with colors, shoes, any worn item (cap, jewelry, watch). Written so an image AI can match it exactly. |
| Height | in battle-sheet pixels: standing adult about 200 px; Grace about 150 px, Rose about 120 px; Justin is the tallest adult (about 230 px). Pick from canon, say which. |
| Signature props | what they hold or carry in every frame (none by default; hands empty in the standard sheets) |
| Personality and posture | how they stand, how they move, a facial default (for example grumpy, calm, bossy). This drives idle, hurt and cheer poses. |
| Moves | basic move, special, path skills (names, one line each). Take them from canon; propose new ones from the person's real hobbies and job. |

If a photo shows more than one person, ask which one.

## 3. The three standard sheets (every new character gets all three)

All three share these rules. Put them in every prompt.

- Style: hand-painted 16-bit JRPG sprite look (Final Fantasy VI, Chrono Trigger) with a caricature feel, no thick outlines. If Tom attaches a reference in a different style, the reference wins.
- The attached reference (the hero pose, section 3A) shows the character. Draw EXACTLY like it in every frame: same face, hair, clothes, colors, proportions, art style, level of detail.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere in the character. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Grid of equal square cells, filled left to right, top to bottom, in the numbered order. Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour. The AI will not hit the sizes exactly; the install step cuts by gaps.
- Same scale in every cell. Feet on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY the character. Hands empty unless a pose lists a prop. No effects, shadows, dust, motion lines, sparkles, props, other people, text or word balloons (effects are added in the game).
- Closing line: "NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw the character in the pose described."
- Family friendly for ages 6 and up.

### 3A. Hero pose (the standard reference): ONE large picture

- One single image, one character, no grid. Portrait orientation (about 1024 x 1536; the biggest size the tool offers).
- Full body, head to feet in frame, standing neutral and relaxed, body turned a little (three-quarter) toward the viewer, face clear and readable, hands empty at the sides, feet flat.
- The highest detail of the set. This image is the reference Tom attaches to every other prompt, and the menu portrait (`portraits/<id>.png`, 64 x 64) is cut from the head.
- Background magenta as above.
- Needs the photo attached.

### 3B. Walking sheet (story mode, overworld): 3 x 3

1 cell = 256 px, sheet 768 x 768. Classic top-down field view, slightly from above. Standing height as in the spec (about 180 px for an adult). Frame order (keys in brackets):

1. DOWN STAND [ow_down_stand]: facing the viewer, feet together, arms at sides.
2. DOWN STEP A [ow_down_stepA]: foot on the viewer's right steps forward, arm on the viewer's left swings forward.
3. DOWN STEP B [ow_down_stepB]: mirror of 2.
4. UP STAND [ow_up_stand]: seen from behind.
5. UP STEP A [ow_up_stepA]: seen from behind, foot on the viewer's left steps away from us, arm on the viewer's right swings forward.
6. UP STEP B [ow_up_stepB]: mirror of 5.
7. SIDE STAND [ow_side_stand]: profile facing LEFT, feet together.
8. SIDE STEP A [ow_side_stepA]: profile left, front leg forward heel down, back leg trailing heel lifted, near arm back, far arm forward.
9. SIDE STEP B [ow_side_stepB]: profile left, passing moment of the stride, back foot lifted with a bent knee, body slightly higher.

Walk rules: arms swing opposite to the legs; the two STEP frames of a row mirror each other; STAND is neutral. Rows: 1 down, 2 up, 3 side. The game mirrors the side row for walking right.

### 3C. Standard battle sheet: 4 x 4

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
| Props | A prop held across several frames is painted into the sheet and listed in the prompt ("holds a sledgehammer in every frame"). Thrown props, sparks, lightning, dust, flashes and screen effects are never painted in the sheet; the game draws them. |
| Facing | LEFT in every frame, except a frame that must face RIGHT (walking back, turning to a friend); list those. |

### Ability sheet grid

4 columns, 256 px cells, rows as needed: 4 poses = 4 x 1 (1024 x 256); 5 to 8 poses = 4 x 2 (1024 x 512). Unused cells stay empty magenta with no number. Poses are numbered in play order.

### Ability prompt template

```
IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game with a classic 16-bit JRPG feel (Final Fantasy VI, Chrono Trigger) and hand-painted character sprites. The character is [NAME], [one line of personality]. The attached image is the reference for [NAME]. Draw [him/her] EXACTLY like the reference in every frame: same face, hair, clothes, colors, proportions, art style, level of detail.

THE MOVE
"[MOVE NAME]": [two or three sentences: what happens, in the order it happens, with the humor].
[PROP BLOCK if any: what the prop is, its colors, that it appears in frames X to Y, identical every time. Nothing else is allowed in the frame.]

THE SHEET (strict)
- A grid of 4 columns by [R] rows of square cells, 256 x 256 pixels each, so the full image is [W] x [H]. If your tool offers a different size, keep exactly 4 columns and [R] rows.
- Exactly [N] frames, one per cell, filled left to right, top to bottom, in the numbered order below. Unused cells stay completely empty magenta, with no number.
- [shared rules from section 3: scale, margin, baseline, facing LEFT except frames listed, magenta background, draw only the character, no effects]

THE [N] FRAMES (each clearly different from the others)
1. [KEY] ANTICIPATION: [exact body, arms, legs, face, prop].
2. ...
[k]. [KEY] HIT: [the peak pose; say "this is the frame the move lands on"].
...

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw [NAME] in the pose described.
```

Frame keys use a short move prefix (for example `pm_` for Portrait Mode). Save the prompt as Project doc `claude/<id>-<move>-prompt.md` with a "Build notes (when the images return)" block first: frame keys in order, which frame is the HIT, which frames face right, painted props, the planned sequence and the spoken lines. Existing examples: `claude/grace-portrait-mode-prompt.md`, `claude/tom-anc-prompt.md`, `claude/boppy-character-sheets-prompt.md`, `claude/justin-fresh-fit-suit-prompt.txt`.

## 5. What Claude hands Tom

1. A short table: id, display name, the spec rows he might want to correct, height, move list.
2. The prompt files, one per sheet: hero pose, walk, battle (three standard), then one per ability if abilities were asked for. Sent as files so he can download; copies saved in the Project.
3. One line on the calls made (for example "I gave Maya a 190 px height and a cap in every frame").
4. Which order to run them in: hero pose first (it becomes the reference for all the others), then the rest.

## 6. When the sheets come back

Same pattern as `docs/JUSTIN_ABILITIES.md` and `docs/ENEMY_SHEETS.md`:

1. Match each image by content to its sheet; check each cell against the numbered list; count cells. A missing or wrong cell is a one-line note, install the rest.
2. Save sources under `tools/sprite-bake/src/<id>-<sheet>-v1.png`.
3. Cut cells by magenta gaps with `slice_sheet` in `tools/sprite-bake/sheet.py` (never fixed pixel positions). Bake with a script copied from `bake_boppy.py` plus `bake_boppy_extra.py` (or `bake_justin_battle.py` for painted sheets). Look at the contact sheet in `tools/shots/`.
4. Wire into the party data and the walk and battle sprite sets; moves go in `engine/<id>-moves.js` using the queue primitives in `docs/BATTLE_SYSTEM.md`.
5. Ability timing: authored hold times can run longer than real time because the Justin file scales every move by 0.66 at the bottom of `engine/justin-moves.js` (a new character file should do the same, with long-hold moves excluded). Hold the HIT frame; keep the move to about 2 to 3 seconds.
6. Bump the atlas cache string (`AV` in the bake script) and the matching `?v=` tag in `index.html` together whenever frame sizes change.
7. Test: `python3 tools/kit_test.py <id> --speed2`, `IDS=<id> python3 tools/smoke.py`, `python3 tools/smoke.py`; look at every contact sheet in portrait and landscape. Push to `main`. Tell Tom in a few lines what landed and what to look for on the phone.
8. Spoken lines: add to `data/lines.js` and `tools/bake-page/pending.json`; they play through speech synthesis until a voice bake. Never reword a baked line.
