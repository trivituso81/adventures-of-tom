// NPC walk sheets for the Art Library (tab NPCs). Required by make-prompts.js.
// One entry per NPC: a 3 x 3 walk sheet (down, up, side; stand and two steps), the same recipe as Tom's walk sheet (tom-walk-sheet).
// The reference is the NPC group cut (npc-cut-<keys>, step 2, approve it first); the prompt names the position from the left. Looks, ages and heights come from npc-prompts.js.
// Proportions follow docs/CHARACTER_PIPELINE.md section 7: adults share one head size (about one fifth of the figure), children follow Grace and Rose (a little over one quarter).
const { N, GROUPS, STYLE_RULE, lookOf, ordinal, REF_KEY, REF_CHART } = require('./npc-prompts.js');

const ART = `ART STYLE
- Illustrated whimsical realism: a full-body storybook caricature of a real-looking person, painted by hand in the style of attachments 1 and 2, with dense painted texture, fine visible brushwork, deep saturated jewel colors and crisp detail on hair strands, fabric folds and shoe edges.
- Warm golden light from the upper left, a soft warm rim light. Clean, crisp edges.
- Painted, realistic. NOT pixel art, NOT 16-bit.`;

function proportions(c) {
  return c.kind === 'child'
    ? `PROPORTIONS (strict)
- ${c.name} is a child: an oversized head a little over one quarter of the full body height, a small body, small hands and small feet, exactly as the child is drawn in attachment 2. Large expressive eyes and a warm, slightly exaggerated expression.
- The head is exactly as large, compared with the body, as it is in attachment 1, in every frame.`
    : `PROPORTIONS (strict)
- ${c.name} is an adult: an oversized head about one fifth of the full body height, as large relative to the body as the adults in attachment 2, a slim, full-length body with realistic proportions below the head, small hands and small feet. Large expressive eyes and a warm, slightly exaggerated expression.
- The head is exactly as large, compared with the body, as it is in attachment 1, in every frame.`;
}

function walk(k, g, pos) {
  const c = N[k];
  const him = c.sex === 'f' ? 'her' : 'his';
  const px = c.kind === 'child' ? 150 : 180;
    const n = g.keys.length, who = n === 2 ? 'two people' : 'three people';
  const where = pos === 1 ? 'the first person from the left' : pos === 2 ? 'the second person from the left' : 'the third person from the left';
  return `IMAGE REQUEST: ONE SINGLE CHARACTER WALK SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Walking frames of ${c.name} for "The Adventures of Tom", a family role-playing game: nine frames in a 3 by 3 grid, used to walk ${c.name} around a town. ${c.name} is ${c.role}.

ATTACHED IMAGES (in this order)
1. A finished painting of ${who} standing side by side in a row on a flat magenta background. ${c.name} is ${where}. Draw ONLY ${c.name} and ignore the other ${n === 2 ? 'person' : 'people'}. This is the ONLY source for ${him} face, hair, build, outfit, colors, painted texture and brushwork: draw ${c.name} EXACTLY like this person in every frame, with the same face, hair, clothes, colors, proportions, painted style and level of detail. Keep the face as faithful to this picture as it is there, in every frame, including from the side and from behind where hair and ears show. The magenta is the background to use here too.
2. The STYLE KEY, a finished painting of the family in a school yard. It shows how this game paints people and how it draws ${c.kind === 'child' ? 'a child' : 'an adult'}. Match its dense, jewel-toned painted texture and fine visible brushwork on skin, hair, fabric and shoes. Do not copy any of its people.
3. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text.

${STYLE_RULE}

${ART}

${proportions(c)}

${c.name.toUpperCase()}'S LOOK (same as attachment 1)
${lookOf(c)} Hands empty in every frame. Never invent a new accessory, hairstyle or color. For the back view, extend the outfit plainly and consistently with the front; the hair falls as it does in the front view.

THE SHEET (strict)
- A grid of 3 columns by 3 rows of equal square cells, 256 x 256 pixels each, so the full image is 768 x 768. If your tool offers a different size, keep exactly 3 columns and 3 rows of equal square cells.
- Exactly 9 frames, one per cell, filled left to right, top to bottom, in the numbered order below.
- Camera: a character turnaround at about chest height, full body, straight on for the front and back rows and a true side profile for the third row. No top-down angle.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on ${c.name}. No magenta glow, spill, tint or fringe on the edges or hair strands. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour.
- Same scale in every cell. The standing figure is about ${px} pixels tall in its cell, from the top of the head to the soles of the shoes. Feet on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY ${c.name}. Hands empty. No effects, shadows, dust, motion lines, sparkles, props, other people, text or word balloons.
- Same head size, same hair volume and same outfit in every frame.
- Arms swing opposite to the legs. The two STEP frames of a row mirror each other. STAND frames are neutral.

THE 9 FRAMES (each clearly different from the others)
1. DOWN STAND: facing the viewer, feet together, arms at ${him} sides, a warm natural smile.
2. DOWN STEP A: facing the viewer, the foot on the viewer's right steps forward, the arm on the viewer's left swings forward.
3. DOWN STEP B: mirror of 2.
4. UP STAND: seen from behind, feet together, arms at ${him} sides. The back of ${him} head, the hair and the back of the outfit are fully visible.
5. UP STEP A: seen from behind, the foot on the viewer's left steps away from us, the arm on the viewer's right swings forward.
6. UP STEP B: mirror of 5.
7. SIDE STAND: true profile facing LEFT, feet together, arms at ${him} sides.
8. SIDE STEP A: profile facing left, front leg forward with the heel down, back leg trailing with the heel lifted, near arm back, far arm forward.
9. SIDE STEP B: profile facing left, the passing moment of the stride, back foot lifted with a bent knee, body slightly higher.

Family friendly for ages 6 and up.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw ${c.name} in the pose described, with the face, hair and outfit exactly as in attachment 1 and the head size exactly as in attachment 1.`;
}

const entries = [];
for (const g of GROUPS) {
  const grp = g.la ? 'Walk sheets, Los Angeles' : 'Walk sheets, Long Island';
  g.keys.forEach((k, i) => {
    const c = N[k];
    entries.push({
      id: 'npc-walk-' + k, tab: 'NPCs', group: grp,
      title: `${c.name}: walk sheet 3 x 3, ${c.ft} (needs ${g.keys.map(x => N[x].name).join(', ')} step 2 approved)`,
      ar: '1:1', refs: [`art/raw/npcs/${g.cutId}-v1.png`, REF_KEY, REF_CHART], prompt: walk(k, g, i + 1),
    });
  });
}
module.exports = { entries };
