// Chapter 6 art for the new storyline (claude/story-ch06.md, "New art needed", and the chapter 6 rows of section 6 of claude/story-build.md).
// Required by make-prompts.js (group "Chapter 6"). Tom 2026-11-14 (stage 1 of the chapter 6 build, assets first).
// Already built and NOT redone here (checked against data/art-prompts.json and art/ on 2026-11-14):
//   Old Oak Park plate (area-oakpark, art/oakpark.webp: picnic lawn bottom left), the Chairman's sheets (enemy-chairman and ending-chairman,
//   throne, top hat, monocle, red tie), the Peanut Gallery, Twig Spy and Cheek Stuffer monster sheets, the Old Oak rooms (room-oak, room-crown),
//   Bernadette's hero, walk and emotion sheets, the megaphone as a normal megaphone (ch4-megaphone-normal), the hill as a normal hill
//   (ch2-bigshake-normal), Nara carrying a coin (ch2-nara-coin-mouth), Nara's growl, dig, drop and catch frames (ch2-nara-story-2),
//   Nara leaning on a leg and the big sigh (ch5-nara-story), Nara's puddle, the flashbulb (ch1-flashbulb), Tom's phone showing the girls
//   (ch2-phone-girls, ch5-phone-rose), Soundstage 7, Sundial Hollow and the kickball field in color (the built plates: the grey versions are
//   patches on them, so colour back = no patch), the pond in color.
// Added beyond the table because the scenes show them (one line each): the loose acorn with an X carved in it (scene 2), a single lemon
//   (scene 16), Lachlan's gold tennis ball (scenes 15 and 18), Nara's play bow, head tilt and sniffing frames (scene 4), the squirrels' corkboard
//   (nothing built: the old Corkboard lines were narration), a dragonfly flying, a splashing fish, the kickball and the sneaker as loose props.
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

const entries = [
  // ---------------------------------------------------------------- Old Oak Park, the picnic tables
  { id: 'ch6-picnic-grey', tab: 'Areas', title: 'Chapter 6: Old Oak Park with a circle of grey grass, three grey picnic tables and grey birthday streamers (grey patch on the built plate)', ar: '1:1', refs: ['art/oakpark.webp', 'art/grands.webp'], group: 'Chapter 6',
    prompt: area('Old Oak Park', `On the picnic lawn at the lower left of the park, one circle about the size of a house, holding all three picnic tables and the grass and benches round them, has lost its color. ${GREY} The red-checked blanket, the plates and the picnic basket on the lawn are inside the circle and are grey too. Between the corners of the tables, strings of birthday streamers and paper bunting hang slack, and a plain birthday cake with candles stands on the middle table: all of it, inside the circle, painted grey. The far end of the last table (the one lowest and closest to the viewer) is bare and clear, with nothing on it, because a large object will be placed there by the game. Outside the circle the park keeps its normal rich color, and the greens look a little stronger next to the grey. Nothing in the sky above it.`, 'Keep the Old Oak, the playground, the community garden, the dog park, the paths, the lamps, the signs and every exit.') },

  { id: 'ch6-orange-block', tab: 'Props', title: 'Chapter 6: the orange block, bathtub-sized, an open picnic basket and a squirrel halfway into it, a small round dent low on the side (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch5-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`A hard, clear orange block, as big as a bathtub, wider than it is tall, bigger than the washing-machine-sized block of the attached picture, glossy-clear but painted, like a stone of orange glass, with the same warm orange glow as a piece of amber candy. Inside it, frozen and not moving, every detail visible: a wicker picnic basket with its lid thrown open, and an ordinary brown squirrel half way into the basket, head and front paws inside, back legs kicking in the air behind it, and its bushy tail straight up. A small round dent, as if a bite had been taken out of the block, is low on the side facing the viewer, near the bottom edge. The block stands alone with a flat bottom, as if it sits on a table.`, BLOCKLIKE, 'No people, no hands, no faces except the squirrel\'s.') },

  { id: 'ch6-block-crack', tab: 'Props', title: 'Chapter 6: an orange block cracking with gold lines and falling apart, 6 stages (effect, used by every block from here on)', ar: '3:2', refs: GRANDS.concat([PR + 'ch5-orange-block-v1.png']), group: 'Chapter 6',
    prompt: `Draw one effect sheet for a family role-playing game: the stages of a hard orange block cracking and falling apart.

ATTACHED IMAGES
1) ${HOUSE}
2) ${BLOCKLIKE}

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. In every cell the same plain block as attachment 2, with NOTHING inside it (an empty clear orange block), the same size, the same position in the cell and the same bottom line, well inside the cell with clear magenta margin. No grid lines, numbers, text or shadows.
Row 1:
1. The block whole, with a single thin bright gold crack starting at the small round dent and running a short way across the face.
2. Gold cracks spreading from the dent across the whole front of the block like a spider web, glowing, the block still in one piece.
3. The block still in one piece but covered in a web of glowing gold cracks, a thin line of gold light leaking out along every crack.
Row 2:
4. The block splitting into about eight big pieces, with thin gold gaps between them, the pieces just starting to move apart.
5. The pieces drifting apart in the air, about twelve pieces, smaller, turning, the edges glowing gold, some already a little see-through.
6. A scatter of small chips and dust specks of orange and gold where the block was, nearly gone, fading, the last specks glittering.
Paint it like attachment 2: the same orange material, matte painted, crisp painted edges, not a smooth digital render. Family friendly.` },

  // ---------------------------------------------------------------- the coin, the jar, the crock
  { id: 'ch6-coin-clean', tab: 'Props', title: 'Chapter 6 close-up: the gold coin with a picnic basket stamp, clean (one object, large)', ar: '1:1', refs: GRANDS.concat([PR + 'ch5-coin-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`A small gold coin, seen face on and filling most of the picture. It has a picnic basket with an open lid stamped in raised relief in the middle, the weave of the wicker visible, and a rim around the edge. The gold is warm and shiny, painted with soft highlights and a deeper gold in the shadows. It lies flat, no stand, no shadow on a surface.`, COINLIKE) },

  { id: 'ch6-coin-crusted', tab: 'Props', title: 'Chapter 6 close-up: the same picnic basket coin crusted with dried sourdough starter (one object, large)', ar: '1:1', refs: GRANDS.concat([PR + 'ch5-coin-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`A small gold coin, seen face on and filling most of the picture, with a picnic basket stamped in raised relief in the middle and a rim around the edge. Dried sourdough starter has crusted over it: a pale, cracked, flaky cream-grey crust, like dried paste, covering about a third of the coin in uneven blotches, with a few thin drips dried down the face. Through the clean parts the gold is warm and shiny, and the basket stamp can still be seen. It lies flat, no stand, no shadow on a surface.`, COINLIKE) },

  { id: 'ch6-jar-coin', tab: 'Props', title: 'Chapter 6: Tom\'s sourdough starter jar, seen from slightly below, with a gold coin glued to the bottom by dried starter (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`A tall, round glass jar with a metal screw lid, about half full of bubbly cream-colored sourdough starter, with a few dried streaks of starter running down the outside. The jar is tipped slightly toward the viewer and seen from a little below, so the flat bottom of the jar is visible, and stuck to the middle of the bottom is a small gold coin, glued on by dried, flaky, cream-colored starter that has crusted round its edge. The coin has a tiny picnic basket stamped on it. The glass is clear and painted, with soft warm highlights.`) },

  { id: 'ch6-crock-empty', tab: 'Props', title: 'Chapter 6: the glazed crock for Bready Mercury, BREADY MERCURY painted on it, a small gold crown, empty (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`A big, round, hand-thrown stoneware crock with a wide mouth and two small handles, glazed in a deep glossy blue-grey with an uneven pooled glaze at the rim, made by a potter, not a factory: slightly wobbly, with fingertip ridges. On the front, in neat hand-painted cream-colored capital letters, are the words BREADY MERCURY, and above the words is a small painted gold crown. It is empty: the open mouth shows only the plain pale clay inside. It stands on a flat bottom.`) },

  { id: 'ch6-crock-full', tab: 'Props', title: 'Chapter 6: the same crock with Bready Mercury inside, starter bubbling up to just below the rim (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`A big, round, hand-thrown stoneware crock with a wide mouth and two small handles, glazed in a deep glossy blue-grey with an uneven pooled glaze at the rim, made by a potter: slightly wobbly, with fingertip ridges. On the front, in neat hand-painted cream-colored capital letters, are the words BREADY MERCURY, and above the words is a small painted gold crown. It is filled with sourdough starter: a soft, cream-colored, bubbly dome rising up just below the rim, with a few bubbles popping on the top and one little drip down the inside. It stands on a flat bottom.`) },

  { id: 'ch6-phone-crock', tab: 'Props', title: 'Chapter 6: Tom\'s phone showing a photo of TNB holding the crock (shown on the flight east; one object)', ar: '1:1', refs: [CH + 'tnb-hero-v1.png', 'art/grands.webp'], group: 'Chapter 6',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of TNB, a grown man. 2) ${HOUSE}

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo: TNB from the waist up, grinning proudly, holding up a big round glazed blue-grey stoneware crock with both hands in front of him, a small gold crown painted on the front of the crock. Copy his face, hair and colors from attachment 1 as exactly as possible. The phone is plain black with a thin frame. No hands outside the photo.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient. The game cuts the phone out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  // ---------------------------------------------------------------- loose props the scenes show
  { id: 'ch6-acorn-x', tab: 'Props', title: 'Chapter 6: an acorn with a tiny X carved in it, the squirrels\' calling card (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`One ordinary acorn, still in its rough little cap, lying on its side. Carved neatly into the smooth brown shell, facing the viewer, is a small, clear X, as if cut with a tiny knife, the cut showing pale wood.`) },

  { id: 'ch6-gold-ball', tab: 'Props', title: 'Chapter 6: a tennis ball painted gold by a six year old, with brush streaks and drips (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`An ordinary tennis ball, with its curved seam line, painted all over with shiny gold paint by a small child: the brush strokes are thick and uneven, there are a few little drips down the side, the felt shows through in a thin patch, and one small bit near the seam was missed and is still yellow-green. Warm, cheerful and a bit messy.`) },

  { id: 'ch6-lemon', tab: 'Props', title: 'Chapter 6: one bright yellow lemon with its short green stem and two leaves (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch2-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`One bright yellow lemon, whole, with its short green stem and two glossy green leaves, as it looks when it has just dropped off a branch. Painted the same way as the lemon in the attached orange block, but with no block: the lemon alone.`, 'The finished painting of an orange block with a lemon frozen inside it. Paint the same lemon: the same yellow, the same stem and leaves, the same painted finish.') },

  { id: 'ch6-lemon-tree-color', tab: 'Props', title: 'Chapter 6: the small lemon tree in full color, green leaves, no lemons, on a round patch of ordinary dirt (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch2-lemon-tree-grey-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The same small young lemon tree, exactly the same shape, branches, size and view, standing in the same round patch of dirt, but now in full, rich, healthy color: green leaves with warm light on them, a brown trunk, and warm brown earth in the round patch, which now has a soft natural edge fading into the ground instead of a sharp cut edge. One low branch on the sunny side is bare, with a small snapped stub where the lemon used to hang. The tree has no lemons on it.`, 'The finished painting of the same lemon tree painted in grey. Keep the same tree, branches, size and view exactly, and paint it in full color.') },

  { id: 'ch6-hat-stand', tab: 'Props', title: 'Chapter 6: the brown leather cowboy hat on its small wooden hat stand, no block (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch4-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The brown leather cowboy hat on its small wooden hat stand, exactly as in the attached picture, the brim slightly curled, but with no block around it: just the hat on its stand, resting on a flat bottom, in warm natural color.`, 'The finished painting of an orange block with a brown leather cowboy hat on a small wooden hat stand frozen inside. Paint the same hat on the same stand, the same leather, the same curl of the brim, with no block.') },

  { id: 'ch6-dragonfly', tab: 'Props', title: 'Chapter 6: the dragonfly flying free, wings out, seen from the side (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch1-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The same dragonfly as in the attached picture, flying free, seen from the side, its four clear wings spread and slightly blurred at the tips as if beating, every vein of the wings still visible, its long jeweled body and big eyes bright, its tail curled up a little. No block around it.`, 'The finished painting of an orange block with a dragonfly frozen inside it. Paint the same dragonfly: the same body color, the same wings, with no block.') },

  { id: 'ch6-fish-splash', tab: 'Props', title: 'Chapter 6: the fish landing in the water with a huge splash, a tall crown of water and drops (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch3-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The same fish as in the attached picture, just landing back in the water belly first at the end of its jump, its tail still up in the air, and under it a huge splash: a tall wide crown of water thrown up around it, with big drops flying out to every side and a ring of ripples at the bottom. Painted with clear blue water, white foam and warm light on the drops, no pond, no shore, only the fish and the splash.`, 'The finished painting of an orange block with a fish frozen in the middle of a jump. Paint the same fish: the same shape, the same colors.') },

  { id: 'ch6-kickball', tab: 'Props', title: 'Chapter 6: a bright red rubber kickball, a little squashed as it bounces (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch5-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The same bright red rubber kickball as in the attached picture, with its pebbled surface and its soft white highlight, seen just after hitting the ground, squashed a very little flat at the bottom, with a few little puffs of dust under it. No block.`, 'The finished painting of an orange block with a red kickball and a white sneaker frozen inside it. Paint the same red kickball, with no block.') },

  { id: 'ch6-sneaker', tab: 'Props', title: 'Chapter 6: one child\'s white sneaker with its laces undone, lying on its side (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch5-orange-block-v1.png']), group: 'Chapter 6',
    prompt: singleLike(`The same child's white sneaker as in the attached picture, with its laces undone and loose, now lying on its side on the ground, a little scuffed, its sole showing. No block.`, 'The finished painting of an orange block with a red kickball and a white sneaker frozen inside it. Paint the same white child\'s sneaker, with no block.') },

  { id: 'ch6-twig-plain', tab: 'Props', title: 'Chapter 6: a plain stick lying on garden soil, no binoculars (one object, the Twig Spy as an ordinary stick)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`One plain, ordinary brown stick, about as long as a forearm, with a couple of small knots and one short broken twig, lying slanted across a small patch of dark garden soil. No face, no binoculars, no glow: just a stick.`) },

  { id: 'ch6-corkboard', tab: 'Props', title: 'Chapter 6: the squirrels\' war room corkboard, red string, a map, a drawing of Nara, the jar circled, a sad picnic table in one corner (one painting)', ar: '3:2', refs: GRANDS, group: 'Chapter 6',
    prompt: `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one image, nothing else. Generate it now. Do not make a plan or a sheet.

ATTACHED IMAGE
1) ${HOUSE}

PAINT THIS ONE PICTURE
A big, wide corkboard filling the whole picture, hung inside a hollow tree, lit warmly from one side. Pinned to it with tiny acorn-shaped pins and joined with red string running from picture to picture, drawn the way a squirrel would draw: scratchy, in charcoal and crayon.
- Top middle, a banner: a strip of leaf with the words OPERATION BIG BREAD scratched on it.
- Center: a drawing of a tall round glass jar of sourdough starter, circled three times in thick red crayon, the red string from every other picture leading to it.
- Left: a map of a street of little houses with a red X on every porch.
- Right: a childlike charcoal drawing of a big curly dog, with the words THREAT LEVEL: VERY HIGH under it.
- Lower left: a small page that reads BY ORDER OF THE CHAIRMAN. WINTER IS COMING. HOARD EVERYTHING.
- Lower right corner: a small drawing of a picnic table with one sad face drawn on it, and under it the words AGENT CRUMB. STILL IN THE ORANGE THING. DAY THREE.
- Bottom middle: a rope ladder sketched beside a bucket, with the words SUPPLY LINE. ROPE LADDER. SEE BUCKET, PANTRY.
Keep every word short, large and clearly legible, painted letter by letter. No people.

${ART}
- ${LIGHT}` },

  { id: 'ch6-videocall-frame', tab: 'Props', title: 'Chapter 6: the small video call picture of Tom and TNB on the porch, for the corner of the screen (one painting)', ar: '1:1', refs: [CH + 'tom-hero-v2.png', CH + 'tnb-hero-v1.png', 'art/grands.webp'], group: 'Chapter 6',
    prompt: `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now. Do not make a plan or a sheet.

ATTACHED IMAGES
1) The finished painting of Tom, a grown man. 2) The finished painting of TNB, a grown man. 3) ${HOUSE}

PAINT THIS ONE PICTURE
A small cozy picture, as if seen on a phone camera held at arm's length: Tom and TNB sitting close together side by side on the front steps of their porch in the evening, shoulder to shoulder, both leaning toward the viewer and smiling, Tom a little wide-eyed, TNB relaxed, a porch rail and warm porch light behind them, a jacaranda tree with purple flowers at the edge. Fill the whole square, with no border or frame. Copy both men's faces, ages, bodies, hair, clothes and colors from attachments 1 and 2 as exactly as possible, with the same painting style and level of detail.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  // ---------------------------------------------------------------- creatures
  { id: 'ch6-squirrel-ordinary', tab: 'Enemies', title: 'Chapter 6: an ordinary squirrel (Agent Crumb and the others): sheet, 6 frames (dive, sandwich, sit, run up a trunk, full cheeks, look back)', ar: '3:2', refs: [EN + 'enemy-cheekstuffer-v1.png', 'art/grands.webp'], group: 'Chapter 6',
    prompt: plainSheet('one ordinary, normal-sized, grey-brown squirrel (not red, not giant, no clothes, no tie, no glow)', SQUIRREL_REF,
`Row 1:
1. Diving head first, front paws stretched out ahead of it, back legs kicking in the air behind it, its bushy tail straight up, as if diving into a basket.
2. Sitting back on its haunches with a little square of sandwich held in its mouth, looking surprised, blinking, its tail curled up behind it.
3. Sitting upright and still, front paws folded on its chest, tail curled up behind it, looking straight ahead.
Row 2:
4. Running straight up a tree trunk, seen from the side with the trunk drawn as one plain vertical bark column on the left edge of its cell, paws gripping the bark, tail trailing, in a hurry.
5. Sitting up with both cheeks stuffed round and full of food, its eyes big, holding a paw up to its mouth.
6. Perched on a branch, looking back down over its shoulder, its tail flicking up in a curl, calm.`) },

  { id: 'ch6-chairman-shrink', tab: 'Enemies', title: 'Chapter 6: Chairman Cheeks standing, then shrinking into an ordinary squirrel, the tie falling off: sheet, 6 frames facing right', ar: '3:2', refs: [EN + 'enemy-chairman-v3.png', EN + 'enemy-cheekstuffer-v1.png', 'art/grands.webp'], group: 'Chapter 6',
    prompt: plainSheet('Chairman Cheeks, a giant red squirrel, shrinking back into an ordinary squirrel', `Picture 1 is the approved painting of Chairman Cheeks in the game: keep his red fur, his round belly, his big bushy tail, his face and his red tie. Picture 2 is the Cheek Stuffer, for the painted finish of an ordinary squirrel. Picture 3 is the finished painting of Deedee and Boppy's house, for the handbrushed finish only.

In every cell there is NO throne, no robe, no top hat and no monocle: he stands on the ground wearing only his red tie, on a plain flat ground line. The six poses are the same character at six stages, so that the game can shrink him from the first to the last.`,
`Row 1:
1. Standing very tall and proud on his hind legs, one paw raised high in a grand speech, mouth open wide, chin up, the red tie neat. Far too red.
2. The same pose, but the red of his fur is fading toward a normal brown, his paw halfway down, his eyes starting to look uncertain, the tie beginning to look too big for his neck.
3. Smaller, a plain ordinary grey-brown squirrel with only a little orange left in his fur, mouth still open mid-sentence and a startled look, the tie hanging loose and sliding down.
Row 2:
4. A small, plain, ordinary grey-brown squirrel, sitting up, mouth open in one tiny squeak, eyes wide, the red tie dropping off his neck and falling in the air beside him.
5. The same ordinary squirrel standing on all fours, looking up and a little confused, tail low, the tie lying on the ground beside him.
6. The ordinary squirrel running away to the right, tail high and streaming, away from the viewer's attention, no tie.`) },

  { id: 'ch6-ribbon', tab: 'Props', title: 'Chapter 6: a scrap of red birthday ribbon, tied in a tiny loose tie shape, lying on a wooden table (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 6',
    prompt: single(`A short scrap of shiny red birthday ribbon, a hand's width long, lying loosely in a small curled shape, one end still folded into a little knot as if it had been a tiny tie, the cut ends a little frayed. It lies flat on a patch of plain weathered wooden plank, painted brown with visible grain, which is part of the object.`) },

  { id: 'ch6-peanut-normal', tab: 'Enemies', title: 'Chapter 6: the Peanut Gallery as an ordinary peanut shell with two baby squirrels: sheet, 6 frames facing right', ar: '3:2', refs: [EN + 'enemy-peanutgallery-v1.png', 'art/grands.webp'], group: 'Chapter 6',
    prompt: plainSheet('an ordinary peanut shell and two baby squirrels (the Peanut Gallery turned back to normal)', `Picture 1 is the approved painting of the Peanut Gallery, a giant peanut shell with two squirrels, from "The Adventures of Tom". Paint the same two baby squirrels, small and cute, with the same fur and the same painted finish, but with no glow, no boo faces, no big eyes and no mouths open in a shout, and the shell is an ordinary peanut shell, as big as a trash can in the game, with no face. Picture 2 is the finished painting of Deedee and Boppy's house, for the handbrushed finish only.`,
`Row 1:
1. The ordinary peanut shell lying on its side on the ground, the two baby squirrels curled up asleep inside it, their little tails sticking out.
2. The same shell, with the two baby squirrels waking up and peeking out of the opening, blinking, sleepy and confused.
3. The two baby squirrels climbing out of the shell onto the ground, one behind the other.
Row 2:
4. The two baby squirrels standing side by side on the ground, looking up at something tall, tails curled.
5. The two baby squirrels scampering away to the right, tails up, together.
6. The empty peanut shell alone, lying on the ground, cracked open a little, nothing in it.`) },

  // ---------------------------------------------------------------- people and Nara
  { id: 'ch6-bernadette-bag', tab: 'NPCs', title: 'Chapter 6: Bernadette holding up a sandwich bag with a burnt flashbulb in it, official, a clipboard under her other arm (one pose)', ar: '2:3', refs: [NP + 'npc-photo-bernadette-v2.png', NP + 'npc-walk-bernadette-v1.png'], group: 'Chapter 6',
    prompt: pose('Bernadette', 'Picture 1 is the finished painting of Bernadette, the Neighborhood Watch Captain. Picture 2 is her walking sheet.',
      'Bernadette, standing and facing the viewer, one arm held up and out in front of her, holding up a clear plastic sandwich bag with one burnt-out, blackened glass flashbulb inside it, a handwritten label stuck on the bag, her chin raised and her expression stern, proud and official, as if presenting evidence in court. A clipboard is tucked under her other arm.',
      'Keep her height, figure size and head size as in the walking sheet. The label on the bag has only a few short unreadable pen scribbles, no real words.') },

  { id: 'ch6-tnb-dirt', tab: 'Characters', title: 'Chapter 6: TNB covered in dirt from head to toe, standing patiently, a clump on his head (one pose)', ar: '2:3', refs: TNB, group: 'Chapter 6',
    prompt: pose('TNB', REF4('TNB'),
      'TNB, standing and facing the viewer, covered in dirt: brown soil on his hair, his shoulders, his chest and his legs, a little clump of earth sitting on top of his head, a smear on one cheek, his arms out slightly from his sides. He is unbothered and amused, with a calm, wry, half smile, as if this happens all the time.',
      'Keep his figure size and head size as in the walking sheet. The dirt is brown soil in clumps and smears over his clothes, painted in the same style as the rest.') },

  { id: 'ch6-rose-coin', tab: 'Characters', title: 'Chapter 6: Rose holding the gold coin in both hands in front of her, reluctant (one pose)', ar: '2:3', refs: [CH + 'rose-hero-v1.png', CH + 'rose-walking-sheet-v2.png'], group: 'Chapter 6',
    prompt: pose('Rose', 'Picture 1 is the finished painting of Rose, a six year old girl. Picture 2 is her walking sheet.',
      'Rose, standing and facing the viewer, holding a small round gold coin in both hands against her chest, looking down at it with her lower lip pushed out and her eyes a little wet, as if she does not want to give it up. A small gap shows where her top front tooth is missing.',
      'Keep her height, figure size and head size as in the walking sheet. The coin is plain gold with no picture.') },

  { id: 'ch6-boppy-rod', tab: 'Characters', title: 'Chapter 6: Boppy reaching up with his fishing rod, tapping something high above him, a gold coin held in the other hand (one pose)', ar: '2:3', refs: [CH + 'boppy-hero-v2.png', CH + 'boppy-walking-sheet-v4.png'], group: 'Chapter 6',
    prompt: pose('Boppy', 'Picture 1 is the finished painting of Boppy, an older man with a fishing hat. Picture 2 is his walking sheet.',
      'Boppy, standing and facing the viewer, one arm stretched straight up holding a fishing rod pointing high above his head, the tip of the rod up at the top of the picture, his chin tilted up and a big gold-toothed grin, his fishing hat on, the other hand held out low in front holding a small gold coin up to the light.',
      'Keep his height, figure size and head size as in the walking sheet. The coin is plain gold with no picture.') },

  { id: 'ch6-boppy-soaked', tab: 'Characters', title: 'Chapter 6: Boppy soaked from head to toe after a huge splash, water dripping from his hat, blinking (one pose)', ar: '2:3', refs: [CH + 'boppy-hero-v2.png', CH + 'boppy-walking-sheet-v4.png'], group: 'Chapter 6',
    prompt: pose('Boppy', 'Picture 1 is the finished painting of Boppy, an older man with a fishing hat. Picture 2 is his walking sheet.',
      'Boppy, standing and facing the viewer, completely soaked: his clothes dark and clinging, his fishing hat sagging, water dripping off the brim of his hat, his nose, his fingers and his elbows, a puddle at his feet, his hair stuck down flat, both hands out a little from his sides, his eyes blinking and a rueful, amused half smile, one gold tooth showing, a single small water drop on his cheek.',
      'Keep his height, figure size and head size as in the walking sheet.') },

  { id: 'ch6-amy-catch', tab: 'Characters', title: 'Chapter 6: Amy catching a red kickball in both hands, bright and competitive (one pose)', ar: '2:3', refs: [CH + 'amy-hero-v2.png', CH + 'amy-walking-sheet-v3.png'], group: 'Chapter 6',
    prompt: pose('Amy', 'Picture 1 is the finished painting of Amy, a woman in her thirties. Picture 2 is her walking sheet.',
      'Amy, standing and facing the viewer with one knee bent, both arms out in front of her, catching a bright red rubber kickball with both hands against her chest, a quick, delighted, competitive grin, her eyes bright, as if she has just made the best catch of the game.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  { id: 'ch6-nara-story-1', tab: 'Characters', title: 'Chapter 6: Nara story frames 1 (6 frames: take the coin from a hand, paws on the table dropping the coin, sit and stare at the empty spot, catch the lemon, sour face, asleep on the gold ball)', ar: '3:2', refs: NARA, group: 'Chapter 6',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Standing in profile, facing right, her head stretched forward and up toward a hand held out to the right of the cell (no hand drawn), her mouth just closing very gently around a small gold coin held at the edge of the cell, her eyes soft.
2. Standing up on her back legs with both front paws resting on the edge of a table at the right edge of her cell (draw only a plain wooden plank edge, no table), her head over it, her mouth open and a small round gold coin dropping out of it onto the plank, her tail high.
3. Sitting upright, facing right, her head tilted slightly to one side, her eyes fixed on a small empty spot on the ground in front of her, her ears up, a little forlorn.
Row 2:
4. Leaping slightly off the ground, mouth open wide, catching a whole yellow lemon in the air in front of her face, her ears flying.
5. Standing in profile with a whole yellow lemon on the ground at her paws and the worst sour face: her eyes squeezed shut, her lips curled, her tongue stuck out, her whole face scrunched.
6. Lying curled up fast asleep with her head resting on a shiny gold-painted tennis ball held between her front paws, her eyes closed, a small smile.`, true) },

  { id: 'ch6-nara-story-2', tab: 'Characters', title: 'Chapter 6: Nara story frames 2 (6 frames: growl up at a tree, dig with dirt flying, in the bucket, catch the gold ball, play bow, head tilt)', ar: '3:2', refs: NARA, group: 'Chapter 6',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Standing stiff, all four paws planted, her head thrown back and her nose pointing straight up, her fur raised along her back, her lips lifted in a low growl, staring at something far above her.
2. Digging hard with both front paws, a spray of brown dirt flying out behind her, her ears flopping, a big mound of earth building up behind her, her tail wagging.
3. Sitting in a plain wooden bucket, so that only her head, chest and front paws show over the rim of the bucket, her ears flopped and a brave, serious look, her whole body pressed down into it.
Row 2:
4. Leaping high into the air, both front paws curled up, her mouth wide open, catching a shiny gold-painted tennis ball in the air, her ears flying.
5. A play bow: her front legs stretched flat out in front of her, her chest down on the ground, her rear high in the air and her tail up and wagging, her face bright and happy, looking forward.
6. Sitting, her head tilted far to one side, her ears one up and one down, her eyes wide and puzzled, as if she cannot work something out.`, true) },
];

module.exports = { entries };
