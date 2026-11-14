// Chapter 7 art for the new storyline (claude/story-ch07.md, "New art needed", and the chapter 7 rows of section 6 of claude/story-build.md).
// Required by make-prompts.js (group "Chapter 7"). Tom 2026-11-14 (stage 1 of the chapter 7 build, assets first).
// Already built and NOT redone here (checked against data/art-prompts.json and art/raw/ on 2026-11-14):
//   The Stacks plate (room-stacks, art/stacks.webp: globe in the middle, a returns cart, Fiction, Nonfiction, Picture Books, the double doors),
//   the Hush Library room, Page's hero, walk and emotion sheets (npc-photo-page, npc-walk-page, npc-emotions-page), the Unread boss sheet
//   (enemy-unread, 6 frames) and its after-fight sheet (ending-unread: calm, delighted, closing, just a book), the Cliffhanger, Know-It-All
//   and Pop-Up Panic monster sheets, the S and H catalog cards (closeup-ch7-cards), the Reading Room doors (closeup-ch7-doors), the shared
//   block-cracking effect (ch6-block-crack), the plain coin (ch5-coin, ch6-coin-clean), the burnt flashbulb (ch1-flashbulb), three bulbs in
//   a row (ch3-flashbulbs-row), the gold tennis ball (ch6-gold-ball), Tom's phone showing TNB with the crock (ch6-phone-crock), Nara's
//   frames from chapters 2, 5 and 6 (catching the gold ball is ch6-nara-story-2), Rose's grin, Tom lifting Grace (ch5-tom-lifts-grace).
// Added beyond the table because the scenes show them (one line each): the WET FLOOR sign as its own object (it stays when the sheet comes
//   off), the block under the bedsheet as its own object, Grace's story frames (pointing at the chart, offering the bookmark, tugging
//   Tom's sleeve), Rose's story frames (ear on the shelf, hopping off the cart, opening the pop-up book, covering ears, whispering),
//   the ordinary Unread (closed and open at the bookmark), the phone photo for the flight west (Tom's sixth one in a row).
// Every prompt is self-contained (no fill-in fields). Per-character info comes from the attached approved pictures.
// Pictures that must match another approved picture attach it (art/raw/props/<id>-v1.png).
const ART = `ART STYLE
- Painted by hand in the style of the attached painting: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges. Gently simplified, storybook-like shapes.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no glossy plastic look.
- Family friendly for children aged 6 and up.`;

const LIGHT = 'Warm golden light from the upper left, soft shadow falling to the lower right.';
const HOUSE = 'The attached picture is the finished painting of Deedee and Boppy\'s house from "The Adventures of Tom", a family role-playing game. Take only how it is painted: hand-brushed, matte painted surfaces, rich warm color. Paint only what is described below.';
const GRANDS = ['art/grands.webp'];
const CH = 'art/raw/characters/', NP = 'art/raw/npcs/', EN = 'art/raw/enemies/';
const TOM = [CH + 'tom-hero-v2.png', CH + 'tom-walking-sheet-v3.png', CH + 'tom-battle-sheet-1-v1.png', CH + 'tom-battle-sheet-2-v1.png'];
const TNB = [CH + 'tnb-hero-v1.png', CH + 'tnb-walking-sheet-v2.png', CH + 'tnb-battle-sheet-1-v1.png', CH + 'tnb-battle-sheet-2-v1.png'];
const NARA = [CH + 'nara-hero-v1.png', CH + 'nara-walking-sheet-v2.png', CH + 'nara-battle-sheet-1-v1.png', CH + 'nara-battle-sheet-2-v1.png'];

// ONE object alone on a flat magenta background, so the game can cut it out.
function single(what, extra) {
  return `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGE
1) ${HOUSE}

PAINT THIS ONE OBJECT
${what}
- Exactly ONE object (or the one group described), alone, centered, large: it fills about 80 percent of the picture, with an even empty margin all round. Nothing else in the picture: no second copy, no background scenery.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the object. The game cuts the object out of this color.

${ART}
- ${LIGHT}
- ${extra || 'No people, no hands, no faces.'}
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

// The orange block of every chapter: same material, a new size and a new thing inside.
function block(size, inside, hang) {
  return single(`A hard, clear orange block, ${size}, glossy-clear but painted, like a stone of orange glass, with the same warm orange glow as a piece of amber candy. Inside it, ${inside} The thing inside is frozen and not moving, every detail visible. On one side, facing the viewer, is one small round dent, as if a bite had been taken out of the block. ${hang}`);
}

// The gold coin of every chapter: same coin, a new stamp.
function coin(stamp) {
  return single(`A small gold coin, seen face on and filling most of the picture. It has ${stamp} stamped in raised relief in the middle, and a rim around the edge. The gold is warm and shiny, painted with soft highlights and a deeper gold in the shadows. It lies flat, no stand, no shadow on a surface.`);
}

// One full-body pose of a character on magenta, from attached approved pictures.
function pose(who, refsText, what, extra) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one image, nothing else. Generate it now. Do not make a plan, a sheet or several poses.

ATTACHED IMAGES
${refsText}

PAINT THIS ONE POSE
${what}
Standing on a plain flat magenta #FF00FF background, nothing else in the picture, no text, no shadow on the ground.

${ART}
- ${LIGHT}
- Copy ${who} from the attached pictures as exactly as possible: the same face, age, body, head size compared to the body, hair, clothes, colors, painting style and level of detail.${extra ? '\n- ' + extra : ''}`;
}

// A sheet of 6 poses of one character: a grid of 3 columns by 2 rows, one figure per cell.
function sheet(who, refsText, rows, dog) {
  return `Draw ${who} in the attached pictures as one pose sheet for a family role-playing game.

${refsText}

Copy them as exactly as possible in every frame: the same ${dog ? 'dog' : 'person'}, face, age, body, head size compared to the body, ${dog ? 'brown curly coat, collar' : 'hair, clothes'}, colors, painting style, level of detail, viewing angle and figure size as the battle sheets. Only the pose and the object change.

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet or paws on the same ground line, each figure well inside its cell with clear magenta margin, nothing touching a cell edge. Held objects are painted in the same style as the character. No grid lines, numbers, text, effects or shadows.
${dog ? 'The character is a dog. She has paws, not hands, and wears nothing but her collar unless a frame says otherwise. Nothing is held except in her mouth.\n' : ''}
${rows}

Do not add frames, merge frames or repeat a pose. Family friendly.`;
}

const REF4 = n => `Picture 1 is the finished painting of ${n}. Picture 2 is the walking sheet. Pictures 3 and 4 are the battle sheets.`;

// A sheet of 6 poses of a boss in a 3 by 2 grid, copied from the approved sheet with named changes.
function bossSheet(name, changes) {
  return `IMAGE REQUEST: ONE SINGLE SHEET. Return exactly one image, nothing else. Generate it now.

ATTACHED IMAGES
1) The approved painting of ${name}, a boss of "The Adventures of Tom", a family role-playing game. Keep the same creature, shape, colors and painted finish.
2) The approved painting of Grump Hollow's Mudling, for the handbrushed finish only.

PAINT THIS SHEET
The same 6 poses as attachment 1, in the same 3 by 2 layout: top row poses 1 to 3, bottom row poses 4 to 6, each pose filling most of its cell, nothing overlapping, the creature facing right in every pose.
${changes}
Paint it like attachment 1: matte, thick visible brush strokes on the creature, canvas grain, crisp painted edges, no gloss, not a smooth digital render. Background: one flat, solid, even magenta #FF00FF with no texture, no brush strokes and no gradient, nothing else in the picture, no text.`;
}

// The same painted area with one change, from the installed or approved plate.
function area(what, change, layoutNote) {
  return `Create the actual environment painting for ${what} from The Adventures of Tom, a family role-playing game. Generate the image now. Do not make a plan, presentation, diagram or example sheet.

ATTACHED IMAGES (in this order)
1) the current painting of this place: use it for LAYOUT AND DETAILS. ${layoutNote} Keep the same camera, the same canvas size and aspect, and every path, building, prop, exit and open space in the same place and the same size.
2) the finished painting of Deedee and Boppy's house, the inspiration for how every picture in this game is painted. Match its hand-painted, hand-brushed look: visible brush strokes, matte painted surfaces, warm golden light from the upper left, soft painted shadows, rich warm color, a fine canvas grain. Take only how it is painted. Do not copy its room, furniture, objects, people or layout.

THE ONE CHANGE
${change}
Everything else stays exactly as in attachment 1, painted with the same care. No people, no animals, no text added anywhere.

OUTPUT
One standalone, edge-to-edge, full-frame painting. No border, title, labels, captions, grid, pins, UI, inset views, or white page.

${ART}
- ${LIGHT}`;
}

const GREY = 'The color is gone from this one patch: every surface inside it is painted in only grey and pale silver-grey, with no green, no brown and no color at all, but still in the same brushwork and the same light and shadow. The grey patch has one clean, sharp, circular edge all the way round, as if it was cut with scissors. Outside the circle everything keeps its normal rich color, and the color even looks a little stronger next to the grey.';


const PR = 'art/raw/props/';

// ONE object alone on magenta, matching an approved picture of the same family of objects (attachment 2).
function singleLike(what, likeText, extra) {
  return `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGES
1) ${HOUSE}
2) ${likeText}

PAINT THIS ONE OBJECT
${what}
- Exactly ONE object (or the one group described), alone, centered, large: it fills about 80 percent of the picture, with an even empty margin all round. Nothing else in the picture: no second copy, no background scenery.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the object. The game cuts the object out of this color.

${ART}
- ${LIGHT}
- ${extra || 'No people, no hands, no faces.'}
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

const BLOCKLIKE = 'The finished painting of an orange block from the same game. Paint the same hard, clear, glowing orange material, the same painted finish and the same small round dent. Only the size and what is inside change.';
const COINLIKE = 'The finished painting of a gold coin from the same game. Paint the same coin: the same gold, the same raised rim, the same soft highlights, the same size in the picture. Only the stamp changes.';

// A sheet of 6 poses of an ordinary creature or object, 3 columns by 2 rows, from an approved sheet.
function plainSheet(subject, refsText, rows) {
  return `Draw ${subject} as one pose sheet for a family role-playing game.

${refsText}

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, the ground line the same in every cell, each figure well inside its cell with clear magenta margin, nothing touching a cell edge, in profile or three-quarter view facing right unless a frame says otherwise. No grid lines, numbers, text, effects or shadows.

${rows}

Do not add frames, merge frames or repeat a pose. Paint it like the attached pictures: matte, visible brush strokes, canvas grain, crisp painted edges, no gloss, not a smooth digital render. Family friendly.`;
}

const SQUIRREL_REF = `Picture 1 is the approved painting of the Cheek Stuffer, a chubby cartoon squirrel with a big bushy tail, from "The Adventures of Tom". Paint a squirrel of the same kind, with the same painted finish. Picture 2 is the finished painting of Deedee and Boppy's house, for the handbrushed finish only.`;


const GRACE = [CH + 'grace-hero-v1.png', CH + 'grace-walking-sheet-v2.png', CH + 'grace-battle-sheet-1-v1.png', CH + 'grace-battle-sheet-2-v1.png'];
const ROSE = [CH + 'rose-hero-v1.png', CH + 'rose-walking-sheet-v2.png', CH + 'rose-battle-sheet-1-v1.png', CH + 'rose-battle-sheet-2-v1.png'];
const G = 'Chapter 7';

// A single object whose picture is not square (a long chart, a tall bookmark, a card).
function singleShape(what, likeText, shape, extra) {
  return (likeText ? singleLike(what, likeText, extra) : single(what, extra)).replace('exactly one square image', 'exactly one ' + shape + ' image');
}
// One character or one character with a prop, alone on magenta, sitting or kneeling or standing.
function poseOn(who, refsText, what, extra) {
  return pose(who, refsText, what, extra).replace('Standing on a plain flat magenta #FF00FF background', 'On a plain flat magenta #FF00FF background');
}
const UNREAD_REF = 'Picture 1 is the approved painting of the Unread, an ancient talking book from "The Adventures of Tom". Picture 2 is its calm sheet after the fight. Picture 3 is the painting of a Mudling, for the handbrushed finish only.';
const SPARKLE = 'a sparkly bedazzled bookmark made by a nine year old: a long narrow strip of pink card covered in rows of little plastic gems in pink, purple and gold, with glitter glue edges and a short pink ribbon at the top';

const entries = [
  // ---------------------------------------------------------------- the Stacks hall, the block, the sheet
  { id: 'ch7-stacks-grey', tab: 'Areas', title: 'Chapter 7: the Stacks hall with a circle of grey floor, a grey globe, grey shelf ends and grey books, the returns cart taken out (grey patch on the built plate)', ar: '4:3', refs: ['art/stacks.webp', 'art/grands.webp'], group: G,
    prompt: area('the Stacks under the Hush Library', `In the middle of the long hall, one circle about as wide as four shelves, holding the big globe on its stand, the floor round it and the ends of the nearest bookshelves with every book on them, has lost its color. ${GREY} The hall's rug, the globe's brass stand and the rolling ladder foot inside the circle are grey too. The returns cart that stands in the hall in attachment 1 is NOT painted here: leave an empty clear stretch of floor in front of the globe, at least as big as a small car, because the game places a large object there. Outside the circle the Stacks keep their normal rich color, and the wood and the warm lamps look a little stronger next to the grey.`, 'Keep the sign lettering exactly as in attachment 1 (FICTION, NONFICTION, PICTURE BOOKS), the shelves, the picture-book corner, the reading table, the doors and every other landmark.') },

  { id: 'ch7-orange-block', tab: 'Props', title: 'Chapter 7: the orange block, golf-cart-sized, a library returns cart tipped on two wheels with seven books in mid-air, a small round dent on the side (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch6-orange-block-v1.png']), group: G,
    prompt: singleLike(`A hard, clear orange block, as big as a golf cart, wider than it is tall and clearly bigger than the bathtub-sized block of the attached picture, glossy-clear but painted, like a stone of orange glass, with the same warm orange glow as a piece of amber candy. Inside it, frozen and not moving, every detail visible: a library returns cart with a wooden shelf and a metal frame, tipped up on two of its four wheels as if it just hit a bump, and above it seven books of different sizes and colors, frozen in the air in the middle of sliding off the cart, spread out and tilting. A small round dent, as if a bite had been taken out of the block, is on the side facing the viewer, about halfway up. The block stands alone with a flat bottom.`, BLOCKLIKE, 'No people, no hands, no faces.') },

  { id: 'ch7-block-sheet', tab: 'Props', title: 'Chapter 7: the golf-cart-sized orange block hidden under a white bedsheet (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch6-orange-block-v1.png']), group: G,
    prompt: singleLike(`A large plain white bedsheet thrown over a golf-cart-sized block, so that the shape of a big wide block shows under the cloth: a flat top, straight sides, soft folds and creases hanging down the sides, one corner of the sheet bunched up on top, the hem pooling and trailing onto the floor at the bottom. The cloth is a little crumpled and a bit dusty, in cool white with warm shadows, with a faint orange glow showing through the thinnest part at one corner, as if something orange is shining underneath. Nothing else.`, BLOCKLIKE, 'No people, no hands, no faces.') },

  { id: 'ch7-wet-floor-sign', tab: 'Props', title: 'Chapter 7: a yellow A-frame WET FLOOR sign (one object)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('A yellow plastic folding A-frame caution sign standing open on the floor, as librarians use, seen a little from the side. On the front face it has the words WET FLOOR painted in clean black capitals, spelled exactly WET FLOOR, with a small black picture of a person slipping above the words. The plastic is a little scuffed, and painted with soft highlights.', 'No people, no hands, no faces. The words WET FLOOR are the only words.') },

  { id: 'ch7-coin', tab: 'Props', title: 'Chapter 7 close-up: the gold coin with a library book cart stamp (one object, large)', ar: '1:1', refs: GRANDS.concat([PR + 'ch6-coin-clean-v1.png']), group: G,
    prompt: singleLike(`A small gold coin, seen face on and filling most of the picture. It has a library book cart stamped in raised relief in the middle: a little cart on four wheels with a handle and a short stack of books on top, drawn clearly, and a rim around the edge. The gold is warm and shiny, painted with soft highlights and a deeper gold in the shadows. It lies flat, no stand, no shadow on a surface.`, COINLIKE) },

  { id: 'ch7-cart-neat', tab: 'Props', title: 'Chapter 7: the library returns cart on four wheels with a neat stack of seven books (one object)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('A library returns cart on four small wheels: a wooden shelf in a painted metal frame with a push handle at one end, seen from the front corner at three-quarter angle. On top of it is one neat, straight stack of seven books of different sizes and colors, squared up like a tidy pile. The wood and metal are a little worn from years of use. Nothing falling, nothing crooked.') },

  { id: 'ch7-cart-rose', tab: 'Props', title: 'Chapter 7: the returns cart with Rose sitting on top of the stack of books, arms up, laughing (one object with one character)', ar: '1:1', refs: [CH + 'rose-hero-v1.png', CH + 'rose-walking-sheet-v2.png', 'art/grands.webp'], group: G,
    prompt: poseOn('Rose', 'Picture 1 is the finished painting of Rose, a six year old girl with a gap in her teeth. Picture 2 is her walking sheet. Picture 3 is the finished painting of the grandparents\' house, for the handbrushed finish only.',
      'A library returns cart on four small wheels (a wooden shelf in a painted metal frame with a push handle), seen from the front corner at three-quarter angle, with one neat stack of seven books of different sizes and colors on top of it, and Rose sitting on top of the stack, both arms thrown up in the air, her mouth wide open laughing and shouting, her legs kicking, a big happy face.',
      'Keep Rose\'s height, figure size and head size as in her walking sheet. The cart and the figure together are alone in the middle of the picture, filling most of it.') },

  // ---------------------------------------------------------------- Grace's chart
  { id: 'ch7-chart-rolled', tab: 'Props', title: 'Chapter 7: Grace\'s chart rolled up tight, tied with purple yarn (one object)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('A big roll of white paper, as long as a child\'s arm and as thick as a child\'s thigh, rolled up tight, made of six sheets taped end to end (the strips of clear tape show on the outside), tied in the middle with a loop of purple yarn in a bow. One end of the roll is open and shows a spiral of colored pencil drawings and a corner of a box drawn in pencil. A few small gold star stickers are stuck on the outside. The paper is a bit crinkled. The roll lies at a slight diagonal.') },

  { id: 'ch7-chart-unrolled', tab: 'Props', title: 'Chapter 7: Grace\'s chart unrolled flat, six sheets taped end to end, seen from above (one long object)', ar: '2:1', refs: GRANDS, group: G,
    prompt: singleShape('One very long strip of white paper made of six large sheets taped end to end with strips of clear tape across each join, lying flat and straight, seen from straight above so it fills the picture left to right, about six times as long as it is tall. It is a hand-drawn chart made by a nine year old: neat rows of boxes ruled in pencil, six full rows, each row drawn with small colored pencil pictures along it (a dragonfly, a lemon, a fish, a cowboy hat, a red kickball, a picnic basket), and a green check mark in each box, with a seventh row below them drawn faintly in grey pencil with no check marks yet, and a small KEY box in one corner with a gold star in it. The only words allowed are ROW 1 to ROW 7 down the left side in neat capitals, and the word KEY in the key box. A few gold star stickers are stuck on it here and there. The paper is a little crinkled at the taped joins.', null, 'wide', 'No people, no hands, no faces.') },

  { id: 'ch7-chart-table', tab: 'Props', title: 'Chapter 7: Grace\'s chart spread over a kitchen table, the corner of Boppy\'s plate of rhubarb crisp poking out from under it (one object)', ar: '3:2', refs: GRANDS, group: G,
    prompt: singleShape('A big hand-drawn chart on white paper, six sheets taped together, spread flat across a wooden kitchen table seen from a high three-quarter angle, so that the paper covers the whole table top and hangs over the edges. The chart is covered in neat pencil-ruled rows of small boxes with little colored pencil pictures and green check marks, and a few gold star stickers. At the lower right corner, the edge of the paper is lifted up a little and underneath it a white plate with a piece of rhubarb crisp (pink-red fruit under a golden crumb top) and a fork can be seen poking out, half hidden. The table top and the chart are the one object, cut off cleanly at the edges. No words.', null, 'wide', 'No people, no hands, no faces.') },

  { id: 'ch7-chart-corner', tab: 'Props', title: 'Chapter 7 close-up: the bottom corner of Grace\'s chart, with MY MEET. TATA COMES. written in pen (one object, large)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('The bottom right corner of a hand-drawn paper chart, seen from straight above and filling the whole picture: white paper, a few faint pencil box lines at the top left, and across the bottom, written in careful blue pen in a nine year old\'s neat handwriting and underlined twice, the words MY MEET. TATA COMES. spelled exactly like that. Next to the words, a tiny drawing in colored pencil of a girl in a purple leotard doing a cartwheel, and three little gold stars. The corner of the paper is a little curled. The only words are MY MEET. TATA COMES.', 'No people, no hands, no faces. The only words are MY MEET. TATA COMES.') },

  { id: 'ch7-bulbs-six', tab: 'Props', title: 'Chapter 7: six burnt-out flashbulbs in a neat row on a kitchen table (one group)', ar: '3:2', refs: GRANDS.concat([PR + 'ch3-flashbulbs-row-v1.png']), group: G,
    prompt: singleLike('Six burnt-out flashbulbs, the old glass kind with a metal base, lying side by side in a neat, evenly spaced row on a small piece of a wooden kitchen table with a checked cloth corner. They are all the same bulb, cracked and blackened on one side and clouded white on the other. The row is straight, as if somebody lined them up on purpose, three of them a little cleaner than the other three.', 'The finished painting of three burnt flashbulbs in a row on a kitchen table from the same game. Paint the same bulbs, the same table and cloth, the same painted finish. Only the number changes.') .replace('exactly one square image', 'exactly one wide image') },

  { id: 'ch7-bulbs-seven', tab: 'Props', title: 'Chapter 7: seven burnt-out flashbulbs in a neat row on a kitchen table (one group)', ar: '3:2', refs: GRANDS.concat([PR + 'ch3-flashbulbs-row-v1.png']), group: G,
    prompt: singleLike('Seven burnt-out flashbulbs, the old glass kind with a metal base, lying side by side in a neat, evenly spaced row on a small piece of a wooden kitchen table with a checked cloth corner. They are all the same bulb, cracked and blackened on one side and clouded white on the other. The row is straight, as if somebody lined them up on purpose, and the seventh bulb at the right end is a little dustier than the other six.', 'The finished painting of three burnt flashbulbs in a row on a kitchen table from the same game. Paint the same bulbs, the same table and cloth, the same painted finish. Only the number changes.') .replace('exactly one square image', 'exactly one wide image') },

  // ---------------------------------------------------------------- the books
  { id: 'ch7-bookmark', tab: 'Props', title: 'Chapter 7 close-up: Grace\'s bedazzled bookmark with its writing (one object, tall)', ar: '2:3', refs: GRANDS, group: G,
    prompt: singleShape(`${SPARKLE[0].toUpperCase() + SPARKLE.slice(1)}. It stands upright, filling the picture from top to bottom. Down the middle, written by hand in black marker between the rows of gems in a child's neat capitals, are the words THIS IS GRACE'S PAGE. DO NOT MOVE IT. THIS MEANS YOU, ROSE. spelled exactly like that, on three short lines (THIS IS GRACE'S PAGE. / DO NOT MOVE IT. / THIS MEANS YOU, ROSE.). A few of the gems are crooked, and one is slightly missing. The only words are the ones given.`, null, 'tall', 'No people, no hands, no faces. The only words are THIS IS GRACE\'S PAGE. DO NOT MOVE IT. THIS MEANS YOU, ROSE.') },

  { id: 'ch7-card-bulb', tab: 'Props', title: 'Chapter 7 close-up: the catalog card for the burnt bulb, with the bulb in a small envelope (one object)', ar: '3:2', refs: GRANDS, group: G,
    prompt: singleShape('An old cream-colored library catalog card lying flat, with a small brown paper envelope clipped to its left side with a paper clip, and in the envelope, visible through a torn flap, a burnt-out flashbulb, cracked and blackened. On the card a large letter B is typed at the top left, and under it two typed lines reading Bulb, burnt, origin unknown. spelled exactly like that, with a punched hole at the bottom of the card and a rubber stamp mark in faded purple ink. The card is a little yellowed and soft at the corners. The only words are B and Bulb, burnt, origin unknown.', null, 'wide', 'No people, no hands, no faces. The only words are B and Bulb, burnt, origin unknown.') },

  { id: 'ch7-books-ordinary', tab: 'Props', title: 'Chapter 7: three ordinary books after the whispering stops: a green novel lying flat, an encyclopedia volume, a pop-up book closed and open with a paper dragon (4 objects, 2 x 2)', ar: '1:1', refs: [PR + 'ch5-binder-closed-v1.png', EN + 'enemy-cliffhanger-v1.png', EN + 'enemy-knowitall-v1.png', EN + 'enemy-popup-v2.png', 'art/grands.webp'], group: G,
    prompt: `IMAGE REQUEST: ONE SINGLE SHEET OF FOUR OBJECTS. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) A finished painting of an ordinary thick book from the same game, for the painted finish only.
2) The Cliffhanger, a fat green novel that walks. 3) The Know-It-All, an encyclopedia volume that walks. 4) The Pop-Up Panic, a pop-up picture book that walks. Paint the same three books, with the same covers and colors, as completely ordinary books: no eyes, no faces, no legs, no arms, no teeth.

PAINT THIS SHEET
One image, a grid of 2 columns by 2 rows of equal cells on a flat solid magenta #FF00FF background, one object alone in each cell, each filling most of its cell with clear magenta margin, nothing touching a cell edge.
1. Top left: the fat green novel from picture 2, lying flat, closed, seen from a three-quarter angle, with a bookmark ribbon hanging out.
2. Top right: the thick encyclopedia volume from picture 3, standing upright with its spine toward the viewer at a three-quarter angle, with a plain gold label on the spine and no readable words.
3. Bottom left: the pop-up picture book from picture 4, lying flat and closed, with its colorful cover up.
4. Bottom right: the same pop-up picture book lying open flat, and from its pages a paper dragon in red and orange rises up, standing straight out of the page, with wide paper wings and a paper tail.

${ART}
- ${LIGHT}
- No people, no hands, no faces. No words or letters anywhere. No grid lines, numbers or shadows.` },

  { id: 'ch7-unread-ordinary', tab: 'Props', title: 'Chapter 7: the Unread as an ordinary old brown book, closed and open at a sparkly bookmark (2 objects, side by side)', ar: '3:2', refs: [EN + 'enemy-unread-v2.png', EN + 'ending-unread-v1.png', EN + 'enemy-mudling-v2.png'], group: G,
    prompt: `IMAGE REQUEST: ONE SINGLE SHEET OF TWO OBJECTS. Return exactly one image, nothing else. Generate it now.

ATTACHED IMAGES
${UNREAD_REF}
Paint the same book, the same old brown cracked leather with the same brass corners, as a completely ordinary book: no eyes, no face, no teeth, no runes glowing.

PAINT THIS SHEET
One image, 2 equal cells side by side on a flat solid magenta #FF00FF background, one object alone in each cell, filling most of its cell with clear magenta margin.
1. Left: the old brown book standing upright, closed, seen from the front at a slight angle. The cover is plain: no picture and no title, only the words VOLUME ONE embossed small in the middle in worn gold, spelled exactly VOLUME ONE. The corners are brass and a little dented, the edges of the pages yellowed.
2. Right: the same book lying open, seen from a three-quarter angle, the yellowed pages with soft grey blocks of tiny unreadable lines, and ${SPARKLE} sticking up out of the pages near the middle. 

Paint it like the attached pictures: matte, thick visible brush strokes, canvas grain, crisp painted edges, no gloss, not a smooth digital render. ${LIGHT} No people, no hands. The only words are VOLUME ONE.` },

  { id: 'ch7-unread-boss', tab: 'Enemies', title: 'Chapter 7: the Unread on its lectern: eye opening, gold edge between its pages, with Grace\'s bookmark, shrinking, ordinary (6 poses facing right)', ar: '3:2', refs: [EN + 'enemy-unread-v2.png', EN + 'ending-unread-v1.png', EN + 'enemy-mudling-v2.png'], group: G,
    prompt: plainSheet('the Unread, the oldest book in the library', UNREAD_REF + ' The cover has no title. The creature faces right in every pose and stays the same size in every cell except pose 5 and pose 6. Paint the same book: old cracked brown leather, brass corners, yellowed pages. It is a lonely, sad, patient old book, never fierce.',
`Row 1:
1. Sitting upright and closed, one big round eye on the cover just opening, the eyelid half raised, dust on its top.
2. A little open, the one eye wide and surprised, and between its pages at the top a thin edge of shiny gold, the rim of a coin, showing like a bookmark.
3. Open wide in a slow mournful pose as if speaking, the pages fanned a little, the eye wide and sad, the gold edge still showing between the pages.
Row 2:
4. The same open pose as 3, but now a sparkly bedazzled bookmark (a narrow pink strip covered in little gems and glitter with a pink ribbon) sticks up out of the pages in place of the gold, and the eye is soft and warm.
5. Shrinking: the same book at about half the size of the other cells, its cover losing its runes, the eye half closed and sleepy, the book gently closing.
6. An ordinary old brown book at the size of pose 5, closed, with no eye and no face at all, the sparkly bookmark sticking out of its top.`) },

  // ---------------------------------------------------------------- characters
  { id: 'ch7-tom-poses', tab: 'Characters', title: 'Chapter 7: Tom story frames (6 frames: pats the plane door, pulls off a bedsheet, carries the big book, holds it up high, arms wide with a small book, pushes the cart)', ar: '3:2', refs: TOM, group: G,
    prompt: sheet('Tom', REF4('Tom'),
`Row 1:
1. Standing in profile, facing right, with one hand resting flat and gently on a plain upright door frame edge at the right side of his cell (draw only a plain narrow metal door frame edge, no door, no plane), his head bowed a little with a grateful, loving smile, his eyes closed.
2. Leaning back with both arms stretched out behind and above him, pulling a big white bedsheet off something at the left of his cell (the sheet is held in both hands, one corner flung up behind him, the bunched cloth billowing), his face determined and curious.
3. Standing, carrying a huge old brown leather book as big as a suitcase in both arms against his chest, his arms wrapped around it, leaning back a little from the weight, his chin up over the top of the book, a polite, careful, proud face.
Row 2:
4. Standing and holding the same huge old brown book up high over his head with both arms stretched straight up, his head tilted back to look up at it, his knees slightly bent, a careful, caring face.
5. Standing facing the viewer, both arms still held wide apart out to the sides with one small ordinary old brown book held between his two hands in the middle, as if the book has just got much smaller, his eyes wide and a gentle, amazed smile.
6. Walking forward, facing right, pushing something in front of him with both hands on a plain handle bar at the right edge of his cell (draw only a plain painted metal handle bar, no cart), leaning into it a little, a cheerful face.`) },

  { id: 'ch7-grace-poses', tab: 'Characters', title: 'Chapter 7: Grace story frames (6 frames: coin at the hole, reading the open book, Gold Library Card, presenting the chart, offering the bookmark, tugging a sleeve)', ar: '3:2', refs: GRACE, group: G,
    prompt: sheet('Grace', REF4('Grace'),
`Row 1:
1. Standing in profile, facing right, one arm stretched out in front of her holding a small gold coin up at the level of her face, her thumb and finger pinching it, her other hand pressed against her chest, a serious, nervous, brave face, as if she does not want to do this.
2. Standing, holding a big old brown open book in both hands in front of her, her head bent to read it, her mouth open a little, as if reading aloud, bright and absorbed.
3. Standing, holding up a shiny rectangular gold library card high in one hand over her head, her other hand on her hip, a huge triumphant grin.
Row 2:
4. Standing, one arm stretched out to the side pointing with a pencil at something at the edge of her cell (nothing drawn there), her other hand holding a rolled sheet of paper under her arm, her chin up, bossy, in charge, a serious teacher face.
5. Standing, holding out one sparkly pink bedazzled bookmark covered in plastic gems in one outstretched hand toward the right, with a warm, proud, generous smile.
6. Leaning toward the left, one hand tugging at something at the left edge of her cell (a sleeve, nothing drawn there) and the other arm pointing urgently down and to the right, her eyes wide, her mouth open, whispering urgently.`) },

  { id: 'ch7-rose-poses', tab: 'Characters', title: 'Chapter 7: Rose story frames (6 frames: ear on the shelf, hops off shouting, opens the pop-up book, rolled up in a chart, covers ears, whispers)', ar: '3:2', refs: ROSE, group: G,
    prompt: sheet('Rose', REF4('Rose'),
`Row 1:
1. Standing in profile, facing right, on tiptoe with the side of her head and her ear pressed flat against a plain vertical edge at the right of her cell (draw only a plain flat painted wooden edge), her eyes wide and listening, her mouth in a round O.
2. Jumping down in the air with both arms thrown up and her legs spread, her mouth wide open yelling AAAH, her hair flying, a joyful, startled face.
3. Kneeling on the ground, bent forward over a big flat open picture book on the ground in front of her, both hands on its pages, her eyes huge, a delighted gasp.
Row 2:
4. Standing and rolled up inside a long tube of white paper, so that only her head and her two small feet stick out of the ends of the tube, the white paper wrapped round her body in a spiral, her face crossly surprised, her cheeks puffed.
5. Standing on tiptoe, both arms stretched up and out to the right with both hands flat as if clapping them over the ears of someone taller beside her (no one drawn), her own eyes squeezed shut, her face screwed up.
6. Standing, one hand cupped round her mouth, whispering loudly to the right, her eyes wide and sparkling, the other hand pointing at herself.`) },

  { id: 'ch7-ears-row', tab: 'Characters', title: 'Chapter 7: Tom, Rose and Grace in a huddle covering each other\'s ears (one group pose)', ar: '3:2', refs: [CH + 'tom-walking-sheet-v3.png', CH + 'rose-walking-sheet-v2.png', CH + 'grace-walking-sheet-v2.png', CH + 'tom-hero-v2.png'], group: G,
    prompt: poseOn('each of the three', 'Picture 1 is Tom\'s walking sheet (a tall grown man). Picture 2 is Rose\'s walking sheet (a six year old girl). Picture 3 is Grace\'s walking sheet (a nine year old girl). Picture 4 is the finished painting of Tom.',
      'The three of them standing shoulder to shoulder in a tight row, facing the viewer, all with their eyes squeezed shut and their mouths pressed in tight lines: Tom on the left, bent down at the knees and the waist, with both hands cupped over Rose\'s ears; Rose in the middle, on tiptoe, with both arms stretched out to the right with her hands flat over Grace\'s ears; Grace on the right, reaching up and across both hands over Tom\'s ears, so that all three are covering each other\'s ears in a circle.',
      'Keep the three heights correct: Tom is much taller than Grace, and Grace is taller than Rose. Keep each figure\'s head size as in their walking sheets. The three figures are close together, alone in the picture.') },

  { id: 'ch7-page-sheet', tab: 'Characters', title: 'Chapter 7: Page the librarian with a folded white bedsheet over one arm, tired and proud (one pose)', ar: '2:3', refs: [NP + 'npc-photo-page-v3.png', NP + 'npc-walk-page-v1.png'], group: G,
    prompt: pose('Page', 'Picture 1 is the finished painting of Page, the librarian, a woman with glasses. Picture 2 is her walking sheet.',
      'Page, standing and facing the viewer, a large white bedsheet folded neatly in a square over one forearm, her other hand holding the end of the fold, her shoulders a little tired and her chin up, a small proud, relieved smile, her glasses a little crooked, as if she has just finished a very long week.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  { id: 'ch7-boppy-door', tab: 'Characters', title: 'Chapter 7: Boppy standing in the library doorway looking carefully at the shelves, wary (one pose)', ar: '2:3', refs: [CH + 'boppy-hero-v2.png', CH + 'boppy-walking-sheet-v4.png'], group: G,
    prompt: pose('Boppy', 'Picture 1 is the finished painting of Boppy, an older man with a fishing hat. Picture 2 is his walking sheet.',
      'Boppy, standing very still and facing the viewer, his coat buttoned, his fishing hat on, one hand held up near his chest as if ready to stop, his head turned a little to look carefully and suspiciously to the side as if the shelves might say something about him, one eyebrow high, his lips pressed together tight.',
      'Keep his height, figure size and head size as in the walking sheet.') },

  { id: 'ch7-boppy-cookie', tab: 'Characters', title: 'Chapter 7: Boppy eating a cookie, pleased and sneaky (one pose)', ar: '2:3', refs: [CH + 'boppy-hero-v2.png', CH + 'boppy-walking-sheet-v4.png'], group: G,
    prompt: pose('Boppy', 'Picture 1 is the finished painting of Boppy, an older man with a fishing hat. Picture 2 is his walking sheet.',
      'Boppy, standing and facing the viewer, one hand holding a round cookie with one big bite taken out of it up to his mouth, his cheeks full and his eyes closed in bliss, the other hand at his coat pocket, a few crumbs on his coat, a happy, sneaky look, one gold tooth showing.',
      'Keep his height, figure size and head size as in the walking sheet.') },

  { id: 'ch7-nara-ball', tab: 'Characters', title: 'Chapter 7: Nara dropping the gold ball on the toe of Tom\'s shoe (one pose)', ar: '3:2', refs: NARA.concat([PR + 'ch6-gold-ball-v1.png']), group: G,
    prompt: pose('the dog Nara', 'Picture 1 is the finished painting of Nara, a brown curly dog. Picture 2 is her walking sheet. Pictures 3 and 4 are her battle sheets. Picture 5 is the gold-painted tennis ball.',
      'Nara, standing in profile facing right, her head lowered, her mouth open and the gold-painted tennis ball just dropping out of it and landing on the tip of a man\'s brown shoe at the right edge of the picture (draw only the toe of one plain brown shoe, nothing above it), her tail high and wagging, her eyes up and bright and hopeful, asking for one more throw.',
      'Keep her size and her collar as in the walking sheet.') .replace('Standing on a plain flat magenta', 'On a plain flat magenta') },

  { id: 'ch7-phone-girls', tab: 'Props', title: 'Chapter 7: Tom\'s phone showing a photo of Grace holding up the Gold Library Card with Rose on the returns cart behind her (the photo for the flight west)', ar: '1:1', refs: [CH + 'grace-hero-v1.png', CH + 'rose-hero-v1.png', PR + 'ch5-phone-rose-v1.png'], group: G,
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of Grace, a nine year old girl. 2) The painting of Rose, a six year old girl. 3) The finished painting of a phone showing a photo of the girls from the same game: paint the phone and the photo in the same way.

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo, in a library: Grace in front, grinning, holding a shiny gold library card up high in one hand, and behind her Rose sitting on top of a stack of books on a library cart, both arms thrown up, laughing, with the shelves of a library blurred behind them. Copy each girl's face, hair and colors from attachments 1 and 2 as exactly as possible. The phone is plain black with a thin frame. No hands.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the object. The game cuts the object out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },
];

module.exports = { entries };
