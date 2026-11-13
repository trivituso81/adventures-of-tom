// Tom's arrival stretch sheet (Tom 2026-11-12 18:24: "add them in the Tom section"). Group "Tom" in the Characters tab, one entry.
// Required by make-prompts.js. The picture already exists and is installed: art/raw/characters/tom-stretch-intro-sheet-v1.png (8 frames, 4 x 2),
// baked by tools/sprite-bake/bake_story_poses.py (set `tom`, frames st_stiff to st_fresh) and played in every arrival (CHANGES 43 and 402).
// The entry is stored approved with that file as its version; the prompt is the Project doc claude/storybook-tom-stretch-sheet-prompt.txt with Tom's hero as picture 1.
const R = 'art/raw/characters/';
const entries = [{
  id: 'tom-stretch-intro', tab: 'Characters', group: 'Tom',
  title: 'Tom stretch sheet: 8 frames, 4 x 2 (the arrival stretch, stiff to refreshed; your painted sheet, already in the game)',
  ar: '2:1', refs: [R + 'tom-hero-v2.png'],
  prompt: `Draw the man in the attached picture as a stretching animation sheet.

Copy the attached picture as exactly as possible in every frame: the same person, face, body, head size compared to the body, hair, clothes, colors, linework, painting style and level of detail. Only the pose changes. Do not add, remove or redesign anything.

One image, a grid of 4 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line, nothing touching a cell edge. Hands empty. No grid lines, numbers, text, effects or shadows.

In every frame the body and face point straight at the viewer. The frames play in order as one smooth stretch.

Row 1:
1. Stiff. Standing, feet together. Shoulders slumped forward, arms hanging straight down. Head tilted slightly to one side, eyelids half closed, mouth closed.
2. Arms rising. Feet apart at hip width. Both arms raised out to the sides to shoulder height, palms up, elbows straight. Chest lifting, eyes closing.
3. Big reach and yawn. Both arms straight up above the head, fingers interlaced, palms facing the sky. Back slightly arched, chin up, up on the toes. Eyes shut, mouth wide open in a yawn.
4. Side bend left. Feet apart. The arm on the viewer's right curved up and over the head, the upper body bent sideways toward the viewer's left. The other hand resting on the hip. Eyes closed, a relieved smile.

Row 2:
5. Side bend right. The mirror of frame 4: the arm on the viewer's left curved up and over the head, the upper body bent sideways toward the viewer's right, the other hand on the hip. Eyes closed, a relieved smile.
6. Push forward. Standing straight, feet apart. Both arms stretched straight out in front at chest height, fingers interlaced, palms turned outward toward the viewer. Eyes squeezed shut, a small satisfied wince.
7. Exhale. Arms dropped loosely at the sides, shoulders lowered. Cheeks puffed out, lips pushed forward blowing out a big breath. Eyes closed.
8. Refreshed. Standing tall, feet apart at hip width, shoulders back, chest open. Arms relaxed at the sides. Eyes open and bright, a small easy smile.`,
}];
module.exports = { entries };
