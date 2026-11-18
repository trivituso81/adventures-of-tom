// Chapter 1 art for the new storyline (claude/story-ch01.md, section "New art needed"). Required by make-prompts.js (group "Chapter 1").
// Tom 2026-11-13: "add every new image chapter 1 needs to the art library as prompts ... then stop."
// Already built and NOT redone here: the folding chair (art/props/boppy/folding_chair.webp), the crumb trail (prop-trail-hollow),
// the Big One's approved sheet (enemy-bigone-v2, with the tiny pie tin), Boppy's hero and emotion sheets.
// Every prompt is self-contained (no fill-in fields). Per-character info comes from the attached approved pictures.

const ART = `ART STYLE
- Painted by hand in the style of the attached painting: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges. Gently simplified, storybook-like shapes.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no glossy plastic look.
- Family friendly for children aged 6 and up.`;

const LIGHT = 'Warm golden light from the upper left, soft shadow falling to the lower right.';
const HOUSE = 'The attached picture is the finished painting of Deedee and Boppy\'s house from "The Adventures of Tom", a family role-playing game. Take only how it is painted: hand-brushed, matte painted surfaces, rich warm color. Paint only what is described below.';

// One square painting, close and straight on, filling the picture (a close-up screen background).
function plate(what) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet, a diagram or several states.

ATTACHED IMAGE
1) ${HOUSE}

PAINT THIS ONE PICTURE
${what} It is a close-up, straight-on picture that fills the whole square.

${ART}
- ${LIGHT}
- No people, no hands, no faces.
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

// ONE object alone on a flat magenta background, so the game can cut it out.
function single(what) {
  return `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGE
1) ${HOUSE}

PAINT THIS ONE OBJECT
${what}
- Exactly ONE object, alone, centered, large: it fills about 80 percent of the picture, with an even empty margin all round. Nothing else in the picture: no second copy, no background scenery.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the object. The game cuts the object out of this color.

${ART}
- ${LIGHT}
- No people, no hands, no faces.
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

// A sheet of 6 poses of the Big One in a 3 by 2 grid, copied from the approved sheet.
function bigOneSheet(poses, extra) {
  return `IMAGE REQUEST: ONE SINGLE SHEET. Return exactly one image, nothing else. Generate it now.

ATTACHED IMAGES
1) The approved painting of The Big One, the giant pond fish boss of "The Adventures of Tom", a family role-playing game. Keep the same creature, shape, colors and painted finish.
2) The approved painting of Grump Hollow's Mudling, for the handbrushed finish only.

PAINT THIS SHEET
The same 6 poses as attachment 1, in the same 3 by 2 layout: top row poses 1 to 3, bottom row poses 4 to 6, each pose filling most of its cell, nothing overlapping.
${poses}
${extra}
Paint it like attachment 1: matte, thick visible brush strokes on the creature, canvas grain, crisp painted edges, no gloss, not a smooth digital render. Background: one flat, solid, even magenta #FF00FF with no texture, no brush strokes and no gradient, nothing else in the picture, no text.`;
}

// 2026-11-17 rebuild stand-ins (docs/CHANGES.md ch1rebuild1): a close square scene that may hold the people named in the description.
function sceneWith(what, ref) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet, a diagram or several states.

ATTACHED IMAGE
1) ${ref || HOUSE}

PAINT THIS ONE PICTURE
${what} It is a close-up picture that fills the whole square.

${ART}
- ${LIGHT}
- Paint only the people and things named above. Faces look like the attached approved character paintings: oversized head, slim body.
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

const entries = [
  { id: 'ch1-doorframe', tab: 'Props', title: 'Chapter 1 close-up: the kitchen door frame with pencil height marks (one square painting)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: plate(`The inside of Deedee's kitchen door frame, painted white wood, close up, seen straight on. A painted tape-measure ruler with inch numbers runs up the left side of the frame. Family height marks are drawn on the frame in RED MARKER, a short line for each measuring, with the name and the age written by hand in the same red marker, right up against the ruler (for example GRACE 6, ROSE 4). Ages only: no calendar years anywhere. The marks are unevenly spaced, the way a real family does it, not a neat grid, and the handwriting is a little wobbly and slanted. ROSE has four marks at ages 3, 4, 5 and 6 (low on the frame; the ROSE 6 mark is the highest ROSE mark and is about as high as a six year old). GRACE has marks at ages 5, 6, 7 and 8, and the GRACE 5 mark is LOWER on the frame than the ROSE 6 mark. Near the top of Grace's marks are FOUR OR FIVE separate GRACE 9 marks bunched very close together, a few millimetres apart, because she was measured again and again today. The GRACE 9 marks are the highest marks on the frame, nothing is above them. Real painted wood grain, the paint chipped a little at the edges, warm kitchen light on the frame. No people. Nothing else on the wall.`) },

  { id: 'ch1-orange-block', tab: 'Props', title: 'Chapter 1: the orange block, plum-sized, a dragonfly inside, a small round dent in one side (one object)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: single(`A hard, clear orange block, the size of a plum, glossy-clear but painted, like a stone of orange glass. Inside it, a dragonfly is frozen with its wings wide open and not moving, every vein of the wings visible. On one side, facing the viewer, is one small round dent, as if a bite had been taken out of the block.`) },

  // v2 (amberspot1, Tom 2026-11-14): v1 was a dense, cool grey mound with a hard rim and read as pasted on. v2 copies the loose grass tufts of
  // the Grump Hollow plate itself (attached), low and sparse with earth between, only the colour taken out, with a soft contact shadow.
  { id: 'ch1-grey-patch', tab: 'Props', title: 'Chapter 1: the grey grass patch v2, low loose tufts like the Hollow plate, colour drained (one object)', ar: '1:1', refs: ['art/hollow.webp'], group: 'Chapter 1',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGE
1) The attached picture is the finished painting of Grump Hollow, a pond in the woods, from \"The Adventures of Tom\", a family role-playing game. Look closely at the small loose tufts of grass growing out of the brown dirt path beside the pond. Paint a patch of exactly that grass, with exactly that brushwork and that light. Do not paint the pond, the path, trees or anything else from the picture.

PAINT THIS ONE OBJECT
A small, low, uneven patch of wild grass growing out of a little bit of bare earth, seen from the same high, angled view as the attached painting, so it lies flat on the ground and is about twice as wide as it is tall. The grass is loose and sparse: a few separate soft tufts of short blades of different heights leaning in different directions, with earth showing between them, painted with the same quick, loose strokes as the grass tufts in the attached painting. It is NOT a dense mound, NOT a carpet, NOT a rug, NOT a cushion.
- Every bit of it, blades and earth, has had all its colour drained out: soft warm greys, like a black and white photo of the same grass. No green and no brown, but keep all the painted light and shade: light warm grey on the tops of the blades lit from the upper left, deeper grey in the gaps and on the lower right.
- The outline is irregular and natural, a few blades poking out past the edge, and the earth at the edge fades softly to nothing, so it sits naturally on a dirt path. One soft, faint grey shadow under it to the lower right. No hard rim, no cut border, no raised edge.
- Exactly ONE patch, alone, centered, large: it fills about 80 percent of the width of the picture, with an even empty margin all round. Nothing else in the picture: no second copy, no background scenery.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the patch. The game cuts the patch out of this color.

${ART}
- ${LIGHT}
- No people, no hands, no faces.
- No words, letters or numbers anywhere.` },

  { id: 'ch1-coin', tab: 'Props', title: 'Chapter 1 close-up: the gold coin with a dragonfly stamp (one object, large)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: single(`A small gold coin, seen face on and filling most of the picture. It has a raised dragonfly stamped in the middle, wings spread, and a rim around the edge. The gold is warm and shiny, painted with soft highlights and a deeper gold in the shadows. It lies flat, no stand, no shadow on a surface.`) },

  { id: 'ch1-flashbulb', tab: 'Props', title: 'Chapter 1: a burnt-out flashbulb (one object, shared by every chapter)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: single(`A burnt-out flashbulb, the old glass kind with a metal base. The glass is cracked and blackened on one side and clouded white on the other, with no light in it. The metal base is dull and dark. It is shown upright, alone.`) },

  { id: 'ch1-bigone-lure-coin', tab: 'Enemies', title: 'The Big One with the lure and the gold coin stuck in its lip: sheet, 6 frames facing right (chapter 1)', ar: '3:2', refs: ['art/raw/enemies/enemy-bigone-v2.png'], group: 'Chapter 1',
    prompt: bigOneSheet(`Top row: 1 sitting upright on its flat tail, huge startled eyes. 2 rocked back from a hit, eyes squeezed shut, water spraying. 3 puffing itself up, eyes bulging. Bottom row: 4 wind-up, leaning in with a furious stare. 5 the attack, brows low, glowing eyes, water streaming off it. 6 slumping forward with a heavy sigh.`,
      `IN EVERY POSE: stuck in its lower lip, a small old fishing lure with a faded red and white body and rusty hooks, and beside it a small gold coin with a dragonfly stamp. Both small and clearly visible, in the same place in every pose. Keep the tiny pie tin perched on the crown, one sixth of the fish's height.`) },

  { id: 'ch1-bigone-normal', tab: 'Enemies', title: 'The Big One as a normal-sized pond fish: sheet, 6 frames facing right (for the return after chapter 6)', ar: '3:2', refs: ['art/raw/enemies/enemy-bigone-v2.png'], group: 'Chapter 1',
    prompt: bigOneSheet(`Top row: 1 hanging calmly in the water, a plain green fish, mouth closed. 2 turning, a small splash. 3 blowing one small bubble. Bottom row: 4 a happy wiggle, tail flick. 5 a small open-mouthed gulp. 6 swimming away, tail sweeping low.`,
      `THIS IS A NORMAL-SIZED POND FISH, not a giant: in every pose it is about as long as a grown person's forearm, ordinary and calm. NO tin on its head, NO lure, NO coin, NO water spraying, NO glowing eyes. Same green and blue scales as attachment 1 but painted quieter.`) },

  { id: 'ch1-boppy-grin', tab: 'Characters', title: 'Boppy grinning, gold fillings showing (one full-body pose; reused in chapters 3, 13 and 14)', ar: '2:3', refs: ['art/raw/characters/boppy-hero-v2.png', 'art/raw/characters/boppy-emotions-v6.png'], group: 'Chapter 1',
    prompt: `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one image, nothing else. Generate it now. Do not make a plan, a sheet or several poses.

ATTACHED IMAGES
1) The approved full-body hero painting of Boppy from "The Adventures of Tom", a family role-playing game. Keep his face, build, clothes and cap exactly as in attachment 1. Paint this new pose from him.
2) The approved emotion sheet of Boppy, for the happy expression only.

PAINT THIS ONE POSE
Boppy, a grandfather in his sixties, standing full body, facing the viewer. He is grinning wide with his mouth open, and his back teeth show gold fillings that shine the same gold as a coin. One hand is raised near his cheek with one finger touching a back tooth, proud of it. Warm, delighted, a little mischievous. Standing on a plain flat magenta background, nothing else in the picture, no text.

${ART}
- ${LIGHT}
- The gold fillings must be clearly visible in the grin.`,
  },

  // ---- Rebuild stand-ins (Tom 2026-11-17: "Put the stand-ins on the Art Library list so I can replace them later."). The game draws a code stand-in for each until a picture is approved. ----
  { id: 'ch1-muffin-pan', tab: 'Props', title: 'Chapter 1: Deedee\'s good twelve-cup muffin pan holding twelve apple muffins with cinnamon topping (one object)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: single('A heavy, well-loved silver twelve-cup muffin pan in a 4 by 3 grid, seen from a slightly raised front angle. Every cup holds one golden apple muffin with a cinnamon-sugar topping and a paper liner. A little steam rises. The pan has a few old baked-on stains and a small worn dent on one corner, the look of a pan used for thirty years.') },
  { id: 'ch1-muffin-pan-empty', tab: 'Props', title: 'Chapter 1: the same twelve-cup muffin pan, empty, with a little pond mud on it (one object)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: single('The same heavy silver twelve-cup muffin pan in a 4 by 3 grid, seen from a slightly raised front angle, completely empty: twelve clean empty cups. A few smears of pond mud on the rim and a small green water weed stuck to one corner. The same worn dent on one corner and old baked-on stains.') },
  { id: 'ch1-muffin-papers', tab: 'Props', title: 'Chapter 1: nine crumpled paper muffin liners scattered on muddy ground (one object group)', ar: '1:1', refs: ['art/hollow.webp'], group: 'Chapter 1',
    prompt: single('Nine crumpled paper muffin liners, cream and pale brown, scattered loosely in a small group, a few crumbs in them and a little mud on some. Exactly nine liners, easy to count, none overlapping.') },
  { id: 'ch1-mudling-muffins', tab: 'Enemies', title: 'Chapter 1: a Mudling holding muffins in both hands (one creature, large)', ar: '1:1', refs: ['art/raw/enemies/enemy-mudling-v2.png'], group: 'Chapter 1',
    prompt: sceneWith('The approved Mudling from attachment 1, the same creature, shape, colors and painted finish, standing facing the viewer on a flat solid magenta #FF00FF background edge to edge, holding three apple muffins in each hand, a muffin in its mouth with the cheeks full, looking pleased with itself. No scenery. Exactly one creature.', 'The approved painting of the Mudling, a small ball of living mud from Grump Hollow in "The Adventures of Tom". Keep the same creature, shape, colors and painted finish.') },
  { id: 'ch1-bigone-green-pan', tab: 'Enemies', title: 'The Big One bright green, a muffin pan on its head like a crown, no lure: sheet, 6 frames facing right (chapter 1 rebuild)', ar: '3:2', refs: ['art/raw/enemies/enemy-bigone-v2.png'], group: 'Chapter 1',
    prompt: bigOneSheet('Poses 1 to 3: sitting half out of the water, grumpy, then proud, then roaring. Poses 4 to 6: sulking low in the shallows, startled with the pan flying off its head, laughing with its mouth wide open.', 'Change from attachment 1: the fish is a BRIGHT GREEN, the size of a cab, and a silver twelve-cup muffin pan sits on its head like a crown in poses 1 to 4 and 6. A small gold coin glints in its lip. No fishing lure, no tin.') },
  { id: 'ch1-grace-list', tab: 'Props', title: 'Chapter 1 close-up: Grace\'s numbered list on notebook paper, held in two small hands (one square painting)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: sceneWith('Two small child hands hold up a sheet of lined notebook paper with a neat numbered list in pencil: the numbers 1 to 4 down the left, each followed by a short line of scribbled pencil writing that is not readable, number 3 crossed out and rewritten. A pencil is tucked behind a finger. The paper fills most of the picture. No faces.') },
  { id: 'ch1-amy-window', tab: 'Props', title: 'Chapter 1: Amy at her house window holding an iced coffee, waving (one square painting)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: sceneWith('A cozy suburban house window with white trim and flower boxes, seen from the street. Behind the glass, Amy, a woman with a warm smile, shoulder-length hair and a running jacket, holds a tall iced coffee in one hand and waves with the other. Soft curtains frame her.') },
  { id: 'ch1-ellie-door', tab: 'Props', title: 'Chapter 1: Aunt Ellie\'s front door open, a spotless white hall behind it (one square painting)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: sceneWith('An elegant front door standing open on Aunt Ellie\'s house. Behind it a spotless white hallway where everything is in its place, a runner rug and a polished side table with one vase. Aunt Ellie, a tall woman in a pressed cardigan with a cool, composed look and one raised eyebrow, stands in the doorway.') },
  { id: 'ch1-rose-shoulders', tab: 'Characters', title: 'Chapter 1: Rose sitting on Tom\'s shoulders, hands on his ears (one full-body pose)', ar: '2:3', refs: ['art/raw/characters/boppy-hero-v2.png'], group: 'Chapter 1',
    prompt: sceneWith('Tom, a tall man with a shaved head and a dry calm look, stands facing the viewer with Rose, a six year old girl, sitting on his shoulders, both small hands holding his ears, grinning. Flat solid magenta #FF00FF background edge to edge, nothing else in the picture.') },
  { id: 'ch1-cab-pulls-away', tab: 'Props', title: 'Chapter 1: Cab 7 pulling away down a Long Island street, Tom waving out the back window (one square painting)', ar: '1:1', refs: ['art/town.webp'], group: 'Chapter 1',
    prompt: sceneWith('A yellow taxi with the number 7 on its roof sign pulls away from the viewer down a sunny Long Island street, seen from behind. A man\'s arm and shaved head show in the back window, waving. Painted storefronts and trees line the street.', 'The finished painting of the Square from "The Adventures of Tom", a family role-playing game. Take only how it is painted: hand-brushed, matte painted surfaces, rich warm color.') },
  { id: 'ch1-phone-on-seat', tab: 'Props', title: 'Chapter 1 close-up: a phone lighting up on a taxi back seat (one square painting)', ar: '1:1', refs: ['art/grands.webp'], group: 'Chapter 1',
    prompt: plate('A smartphone lying face up on a worn taxi back seat, its screen lit and glowing with a new message that is not readable. A jacket sleeve rests beside it. A purple-grey haze shows through the window beyond.') },
];

module.exports = { entries };
