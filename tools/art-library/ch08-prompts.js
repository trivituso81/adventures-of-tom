// Chapter 8 art for the new storyline (claude/story-ch08.md, "New art needed", and the chapter 8 rows of section 6 of claude/story-build.md).
// Required by make-prompts.js (group "Chapter 8"). Tom 2026-11-14 (stage 1 of the chapter 8 build, assets first).
// Already built and NOT redone here (checked against data/art-prompts.json, art/raw/ and the plates on 2026-11-14):
//   the Jefferson Park plate with 2nd Avenue and the Car Barn gate (art/jpark.webp), Tom's house room (art/tomhouse.webp), the Car Barn
//   room WITH its turntable pit and bridge (art/carbarn.webp), the Boiler Room (art/boilerroom.webp), the Wet Blanket, The Draft and Picky
//   Eater sheets (enemy-wetblanket, enemy-thedraft, enemy-pickyeater: they are the Damp Blanket, the Draft and the Picky Lunchbox of the
//   script, the fight sprites do not change), the Old Ironbelly boss sheet and ending sheet (enemy-ironbelly-v2, ending-ironbelly-v1: a
//   round cast-iron stove with a belly and a firebox mouth, nothing in the art reads female, so "he" is a text change only), hero,
//   walking and emotion sheets for Mr. Washington, Bernadette, Miss Odette, Doña Carmen, Olivia, Michael and TNB, Miss Odette with a pot
//   and Doña Carmen with a towel (ch2-odette-pot, ch2-carmen-towel), Bernadette with the sandwich bag (ch6-bernadette-bag), the shared
//   block-cracking effect (ch6-block-crack), the plain coin (ch6-coin-clean), the burnt flashbulb (ch1-flashbulb), two cans of grape soda
//   (ch2-grape-soda), the gold tennis ball (ch6-gold-ball), the video call corner frame (ch6-videocall-frame), Grace's chart unrolled
//   (ch7-chart-unrolled), Tom's phone showing the girls for the flight west (ch7-phone-girls, the script says use it), Nara's frames
//   from chapters 2, 4, 5, 6 and 7 (asleep with the gold ball is in ch6-nara-story-2).
// Also NOT made, and why: the turntable still and turning (the built Car Barn plate already has the pit and bridge; the build turns the
//   bridge in code, flags ch8-tt), the Boiler Room door lettering (painted on the built plate), Tom carrying the salad spinner in battle
//   (script says overworld only unless cheap), Bernadette holding her clipboard (hero already holds it).
// Added beyond the table because the scenes show them (one line each): the pilot flame as a prop-sized walking sheet, Ironbelly's
//   frosted/warm/ordinary states in one sheet, the dough counter and the salad spinner, the three ordinary states of the troublemakers,
//   Bernadette's notice (lying on the grass), the rosebush in color, the call frames for Grace and Rose, Michael carrying everything.
// Every prompt is self-contained (no fill-in fields). Per-character info comes from the attached approved pictures.
// MISMATCH TO KNOW ABOUT: the plate art/jpark.webp has no house for Mr. Washington (the built map puts him at x8,y19 beside RIVITUSO).
//   The grey yard entry therefore paints a grey circle on the lawn at the lower left and adds the hose and porch steps inside it; the
//   build decides where the block stands.
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
const G = 'Chapter 8';

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


const JP = ['art/jpark.webp', 'art/grands.webp'];
const REF2 = n => `Picture 1 is the finished painting of ${n}. Picture 2 is the walking sheet.`;
const npcSheet = (who, refsText, rows) => sheet(who, refsText, rows).replace('as the battle sheets', 'as the walking sheet');
const BERN = [NP + 'npc-photo-bernadette-v2.png', NP + 'npc-walk-bernadette-v1.png'];
const WASH = [NP + 'npc-photo-washington-v2.png', NP + 'npc-walk-washington-v1.png'];
const ODET = NP + 'npc-photo-odette-v2.png', CARM = NP + 'npc-photo-carmen-v2.png';
const HERO_FLAME = 'a small living pilot flame, about the size of a pea-green apple: a teardrop of clear bright blue flame with a warmer yellow-white heart, two small round dark eyes in the blue and a tiny curved mouth, standing on two tiny stubby legs made of flame, with a thin soft glow round it. It is cute, calm and a little determined, never scary.';
const REFOVEN = 'Picture 1 is the approved painting of Old Ironbelly, a round cast-iron stove-oven with a big belly, a firebox mouth, a chimney with a puff of smoke and two round eyes, from "The Adventures of Tom". Picture 2 is his calm sheet after the fight. Picture 3 is the painting of a Mudling, for the handbrushed finish only.';

const entries = [
  // ---------------------------------------------------------------- the yard, the block, the notice
  { id: 'ch8-yard-grey', tab: 'Areas', title: 'Chapter 8: a front lawn on 2nd Avenue with a hose and three porch steps, all in grey inside a circle (grey patch on the built Jefferson Park plate)', ar: '4:3', refs: JP, group: G,
    prompt: area('Jefferson Park, the neighborhood with 2nd Avenue', `On the front lawn in the lower left of the picture, the one with the wooden bench and the flower beds beside the RIVITUSO house, one circle about as wide as a minivan and a half has lost its color. Inside the circle the lawn is bare grass with a garden hose coiled on it and, at the edge nearest the street, a small set of three wooden porch steps with a simple railing, all of it painted new. ${GREY} The bench, the flower beds and the RIVITUSO house stay outside the circle in full color. Leave the middle of the circle completely clear, at least the size of a minivan, because the game places a large object there.`, 'Keep every sign lettering exactly as in attachment 1 (DOWNTOWN, CREOLE, PUPUSAS, SKATE, JUICE, CAR BARN, NOVAK, ALVAREZ, RIVITUSO, WESTON, OLD OAK PARK), the road, every house, tree, lamp and mailbox exactly where they are.') },

  { id: 'ch8-potluck-day', tab: 'Areas', title: 'Chapter 8: 2nd Avenue at six o\'clock with long tables down the middle of the road, steaming dishes and folding chairs (potluck on the built plate)', ar: '4:3', refs: JP, group: G,
    prompt: area('Jefferson Park, the neighborhood with 2nd Avenue', `The road in the lower middle of the picture, between the OLD OAK PARK arch and the houses, has been closed for a neighborhood potluck. Three long tables with white paper cloths run down the middle of the road end to end, crowded with steaming dishes of every kind: a big pot of gumbo at the front, pupusas, a lasagna, salads, pies, bowls and many round loaves of bread in baskets, with wisps of steam rising. Folding chairs stand along both sides of the tables and a few are pushed back as if people have just stood up. Strings of small lamps are lit over the tables. The light is the warm gold of six o'clock. No people.`, 'Keep every sign lettering exactly as in attachment 1, every house, tree, lamp, mailbox and the arches exactly where they are. Only the road in the foreground changes.') },

  { id: 'ch8-potluck-night', tab: 'Areas', title: 'Chapter 8: 2nd Avenue at night after the potluck, tables bare, folding chairs half stacked, strings of lamps lit (night version of the potluck)', ar: '4:3', refs: JP, group: G,
    prompt: area('Jefferson Park, the neighborhood with 2nd Avenue', `It is night and the potluck is over. The road in the lower middle of the picture still has three long tables with white paper cloths down the middle, now nearly empty: a few bowls, crumpled napkins, one half-eaten pie. Folding chairs are half stacked in tall leaning piles at the edges and a few are still unfolded. Strings of small lamps over the tables glow warm gold against a deep blue night sky with a few stars, and the porch lights of the houses are lit. The whole picture is a dark blue night with warm pools of lamplight. No people.`, 'Keep every sign lettering exactly as in attachment 1, every house, tree, lamp, mailbox and the arches exactly where they are. Only the lighting and the road in the foreground change.') },

  { id: 'ch8-orange-block', tab: 'Props', title: 'Chapter 8: the orange block, minivan-sized, a whole rosebush inside with a paper notice taped to one stem, a round hole on the street side (one object)', ar: '1:1', refs: GRANDS.concat([PR + 'ch7-orange-block-v1.png']), group: G,
    prompt: singleLike(`A hard, clear orange block, as big as a minivan, long and wide and clearly bigger than the golf-cart-sized block of the attached picture, glossy-clear but painted, like a stone of orange glass, with the same warm orange glow as a piece of amber candy. Inside it, frozen and not moving, every detail visible: a whole red rosebush, full and round and a little overgrown, covered in red roses and green leaves, with thorny stems. A single sheet of white paper is taped to one stem near the front, hanging a little crooked, with small lines of printed text on it too small to read. One round hole, about the size of a coin slot big enough to push a gold coin into, is in the side facing the viewer, about halfway up, a clean circular hole, deeper than a dent. The block stands alone with a flat bottom.`, BLOCKLIKE.replace('the same small round dent', 'the same orange glass, but this block has a round coin-sized hole instead of a dent'), 'No people, no hands, no faces.') },

  { id: 'ch8-coin', tab: 'Props', title: 'Chapter 8 close-up: the gold coin with a rosebush stamp (one object, large)', ar: '1:1', refs: GRANDS.concat([PR + 'ch7-coin-v1.png']), group: G,
    prompt: singleLike(`A small gold coin, seen face on and filling most of the picture. It has a rosebush stamped in raised relief in the middle: a small round bush with a few five-petal roses and leaves on thin thorny stems, drawn clearly, and a rim around the edge. The gold is warm and shiny, painted with soft highlights and a deeper gold in the shadows. It lies flat, no stand, no shadow on a surface.`, COINLIKE) },

  { id: 'ch8-notice', tab: 'Props', title: 'Chapter 8: Bernadette\'s paper notice lying on the grass, with its printed words (one object)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('One sheet of white printer paper, a little creased, with a strip of clear tape still stuck to the top edge, lying flat on its back as if it just drifted down, seen from above at a slight angle. Printed on it in neat black capitals, spelled exactly: NOTICE at the top in large letters, below it TRIM TO REGULATION HEIGHT. in medium letters, and at the bottom, in small letters, THE WATCH. Nothing else is printed on it and there is no handwriting. No grass is painted: only the paper and a soft shadow under it.', 'No people, no hands, no faces.') },

  { id: 'ch8-rosebush', tab: 'Props', title: 'Chapter 8: the rosebush in full color, red roses and green leaves (one object, for after the block opens)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('A whole red rosebush, full and round and a little overgrown, about as wide as a minivan, covered in red roses in every stage from buds to open flowers, with deep green leaves and thorny stems, standing on a small flat patch of green grass. Painted in rich, bright, saturated color.') },

  // ---------------------------------------------------------------- the kitchen and the barn
  { id: 'ch8-dough-counter', tab: 'Props', title: 'Chapter 8: a kitchen counter crowded with bowls of rising dough under dish towels, two stockpots with dough rising over the rim, and a salad spinner (one group)', ar: '3:2', refs: GRANDS.concat([PR + 'ch2-loaf-whole-v1.png']), group: G,
    prompt: single('One long kitchen counter seen from the front at a slight angle, crowded edge to edge with rising bread dough: eleven mixing bowls of different sizes and colors (glass, ceramic, steel) each full of pale round dough humped up over the rim, some under checked dish towels, two tall steel stockpots with dough pushing up past the rim, and one clear plastic salad spinner with dough pressed up against its lid. A bag of flour with a scoop in it stands at one end. Everything is painted warm and cozy. The counter is cut out of the picture: just the top of the counter and what sits on it, with a flat bottom edge.', 'No people, no hands, no faces.') },

  { id: 'ch8-spinner', tab: 'Props', title: 'Chapter 8: a salad spinner full of pale bread dough pressed up against its clear lid (one object)', ar: '1:1', refs: GRANDS, group: G,
    prompt: single('A salad spinner: a round white plastic bowl with a clear dome lid and a small crank knob on top, packed with pale bread dough that presses up against the clear lid so you can see it, a little flour dusted on the outside of the bowl.') },

  { id: 'ch8-loaves', tab: 'Props', title: 'Chapter 8: a stack of forty golden-brown round loaves of bread in neat rows along a wall (one object)', ar: '3:2', refs: GRANDS.concat([PR + 'ch2-loaf-whole-v1.png']), group: G,
    prompt: singleLike('Forty round loaves of sourdough bread, golden brown with a crisp scored cross on top and a dusting of flour, stacked in four neat rows of ten on a long low wooden shelf, steam rising from the nearest ones, seen from the front at a slight angle. Each loaf the same size, painted with warm light on the crusts. The shelf is cut out of the picture with a flat bottom edge.', 'The finished painting of a round sourdough loaf from the same game. Paint the loaves in the same way: the same golden crust, the same scored top, the same painted finish.', 'No people, no hands, no faces.') },

  { id: 'ch8-barn-door', tab: 'Props', title: 'Chapter 8: the old Car Barn door, shut with a heavy rusty chain, and the same door with the chain hanging loose and one leaf open a hand\'s width (2 objects, side by side)', ar: '3:2', refs: ['art/carbarn.webp', 'art/grands.webp'], group: G,
    prompt: single('TWO objects side by side, the same on both sides apart from the chain. Left: a tall pair of old double wooden doors in a brick archway with dark green painted wood, tall iron strap hinges and a small round window high up in each leaf, shut tight with a heavy rusty chain wrapped twice across both handles and closed with one big old padlock. Right: exactly the same doors, the padlock open and hanging from one link, the chain slid loose and hanging down in loops, and one leaf of the doors open a hand\'s width showing a dark gap with a faint cold blue glow inside. The wood is weathered, the brick is soot-dark, and there is a little frost on the lower boards.', 'No people, no hands, no faces.').replace('Exactly ONE object (or the one group described)', 'Exactly TWO objects side by side, each large') },

  { id: 'ch8-blanket-states', tab: 'Props', title: 'Chapter 8: the Damp Blanket draped over a workbench with a small blue flame trapped under it, steaming, and the same blanket as an ordinary blanket on a hook (2 objects, side by side)', ar: '3:2', refs: [EN + 'enemy-wetblanket-v1.png', 'art/carbarn.webp', 'art/grands.webp'], group: G,
    prompt: singleLike('TWO objects side by side. Left: a small wooden workbench with a big wet grey-blue moving blanket draped over it, the soft folds hanging down to the floor on every side, and under the cloth a small blue flame glowing through the fabric from the middle of the bench top, steam curling up from the damp cloth. Right: the same blanket as an ordinary blanket, now dry and plain, hanging folded over a single iron wall hook, with no flame, no face and no steam.', 'The approved painting of the Wet Blanket monster, a blue-grey wet cloth. Paint the cloth in the same blue-grey, the same painted folds and the same finish. The blanket here has no face.', 'No people, no hands, no faces.').replace('Exactly ONE object (or the one group described)', 'Exactly TWO objects side by side, each large') },

  { id: 'ch8-draft-states', tab: 'Props', title: 'Chapter 8: a small blue flame leaning hard sideways on a windowsill, and an old window banging shut (2 objects, side by side)', ar: '3:2', refs: [EN + 'enemy-thedraft-v1.png', 'art/carbarn.webp', 'art/grands.webp'], group: G,
    prompt: singleLike('TWO objects side by side. Left: an old stone windowsill in a brick wall with one small blue pilot flame standing on it, bent almost flat sideways by an unseen wind, its tip streaming to the left, a few pale swirling wind lines around it. Right: a tall old iron-framed window of small glass panes, swung shut with a bang, the panes rattling, a few dust motes and small curved motion lines at its edge to show it just slammed.', 'The approved painting of the Draft monster, a swirl of pale blue wind. Paint the wind lines in the same pale blue and the same painted finish. Nothing here has a face.', 'No people, no hands, no faces.').replace('Exactly ONE object (or the one group described)', 'Exactly TWO objects side by side, each large') },

  { id: 'ch8-lunchbox-states', tab: 'Props', title: 'Chapter 8: a dented red metal lunchbox with a small blue flame glowing inside and its lid snapping, and the same lunchbox ordinary with its lid hanging open (2 objects, side by side)', ar: '3:2', refs: [EN + 'enemy-pickyeater-v1.png', 'art/grands.webp'], group: G,
    prompt: singleLike('TWO objects side by side. Left: an old dented red metal lunchbox with a silver handle and a silver latch, sitting on a bench, its lid open a crack and snapping, with a small blue flame glowing inside so a blue light spills out of the crack. Right: the same lunchbox, ordinary and empty, the lid hanging wide open, a plain empty inside, a crumb or two, no flame and no face.', 'The approved painting of the Picky Eater monster, a red metal lunchbox with arms and legs. Paint the same red lunchbox: the same red, the same silver handle and latch and the same painted finish. The lunchbox here has no face, no arms and no legs.', 'No people, no hands, no faces.').replace('Exactly ONE object (or the one group described)', 'Exactly TWO objects side by side, each large') },

  // ---------------------------------------------------------------- the video call
  { id: 'ch8-call-grace', tab: 'Props', title: 'Chapter 8: a video call frame of Grace in front of a wall-sized chart with a color key, with LOS ANGELES gone over in pen (one portrait screen picture)', ar: '2:3', refs: GRACE.slice(0, 2).concat([PR + 'ch7-chart-unrolled-v1.png', PR + 'ch6-videocall-frame-v1.png']), group: G,
    prompt: `IMAGE REQUEST: ONE SINGLE PICTURE. Return exactly one tall portrait image, nothing else. Generate it now.

ATTACHED IMAGES
1) The finished painting of Grace, a nine year old girl. 2) Her walking sheet. 3) Her chart, drawn flat. 4) The painted video call frame from the same game.

PAINT THIS ONE PICTURE
What a phone screen shows during a video call, filling the whole picture edge to edge, with no phone around it: Grace, from the waist up, close to the camera and facing it, in front of a bedroom wall completely covered by her chart. The chart is made of many sheets of paper taped edge to edge in rows of boxes joined by lines, with a COLOR KEY box in the top right corner with small colored squares, and on one box in the middle, the words LOS ANGELES written and gone over in thick black pen, spelled exactly LOS ANGELES. She holds a pencil behind her ear and a black pen in one hand, up beside her face, with a very pleased, triumphant, I-told-you-so grin. A warm bedroom lamp lights her from the left. No other words anywhere except small illegible scribbles on the chart.

${ART}
- Copy Grace from the attached pictures as exactly as possible: the same face, age, hair and clothes, the same painting style.
- The picture looks like a phone camera view, a little close and slightly from below.` },

  { id: 'ch8-call-rose', tab: 'Props', title: 'Chapter 8: a video call frame of Rose jumping up into the picture from below, mouth open yelling, hair flying (one portrait screen picture)', ar: '2:3', refs: ROSE.slice(0, 2).concat([PR + 'ch6-videocall-frame-v1.png']), group: G,
    prompt: `IMAGE REQUEST: ONE SINGLE PICTURE. Return exactly one tall portrait image, nothing else. Generate it now.

ATTACHED IMAGES
1) The finished painting of Rose, a six year old girl. 2) Her walking sheet. 3) The painted video call frame from the same game.

PAINT THIS ONE PICTURE
What a phone screen shows during a video call, filling the whole picture edge to edge, with no phone around it: Rose jumping up from the bottom of the picture straight into the camera, her face and shoulders huge and close, her arms thrown up and her hands like claws, her mouth wide open yelling, her eyes wide and sparkling, her hair flying up as if she just jumped, her gap-toothed grin showing. Behind her is the blurred edge of a wall covered in colored paper. Warm lamp light.

${ART}
- Copy Rose from the attached pictures as exactly as possible: the same face, age, hair and clothes, the same painting style.
- No words anywhere.` },

  // ---------------------------------------------------------------- the pilot flame and Old Ironbelly
  { id: 'ch8-flame-sheet', tab: 'Enemies', title: 'Chapter 8: the walking pilot flame (6 poses facing right: standing, two walking steps, hopping up, landing, leaning sideways)', ar: '3:2', refs: [EN + 'enemy-thedraft-v1.png', 'art/grands.webp'], group: G,
    prompt: plainSheet(HERO_FLAME, 'Picture 1 is the approved painting of the Draft, a swirl of pale blue wind, for the painted finish only. Picture 2 is the finished painting of Deedee and Boppy\'s house, for the handbrushed finish only.',
`Row 1:
1. Standing still, facing right, upright, calm, looking forward.
2. Walking, facing right, the left stubby leg forward, the flame leaning a little forward, glowing.
3. Walking, facing right, the right stubby leg forward, the flame leaning a little back.
Row 2:
4. Hopping, facing right, both legs tucked up, high in the air, the flame stretched tall and bright.
5. Landing, facing right, squashed down low with both legs bent, the flame wide and short.
6. Standing, facing right, the flame bent hard sideways to the right as if blown by a wind, the little eyes shut tight.`) },

  { id: 'ch8-ironbelly-sheet', tab: 'Enemies', title: 'Chapter 8: Old Ironbelly in his story states (6 poses facing right: frosted over with flames in his firebox and the coin on his door, frost cracking, glowing dull red, loaded with loaves, loaves out on the door shelf, an ordinary cold oven)', ar: '3:2', refs: [EN + 'enemy-ironbelly-v2.png', EN + 'ending-ironbelly-v1.png', EN + 'enemy-mudling-v2.png'], group: G,
    prompt: bossSheet('Old Ironbelly', `Paint the same round cast-iron oven, but keep him an old, proud, plain, male-looking workman of an oven: no eyelashes, no lipstick, no bow, nothing decorative. In these six poses the six cells are different states, all facing right:
1. Frosted over: his iron is covered in white frost and little icicles, his firebox mouth full of crowded small blue flames, a small gold coin stuck to the middle of his round door, his eyes narrowed and grumpy.
2. Frosted and cracking: the frost is breaking away in flakes at the top and sides, the flames in the firebox leaning toward the viewer, a flash of warm orange at the rim of the door, the coin still stuck to the door, his eyes surprised.
3. Glowing dull red: the frost gone, his whole body glowing a soft dull red-orange, a calm warm light in the firebox, three round loaves of bread sitting on a small iron shelf that has swung out under the door, the coin still stuck to the door, his eyes half closed, a gruff satisfied look.
4. Loading: his door swung wide open to show a bright glowing firebox, a long wooden bread peel with two round loaves on it going in, steam rising, his eyes wide and proud.
5. Working: his door open and a row of four round golden loaves sliding out onto the door shelf, steam rising, a bright orange glow, his eyes shut in concentration.
6. Ordinary and cold: the same body as an old cast-iron oven with no face, no eyes and no mouth, the door shut, dark and dull, the iron cool and matte, a thin curl of smoke from the chimney, a plain small iron shelf under the door.`) },

  // ---------------------------------------------------------------- characters
  { id: 'ch8-tom-poses', tab: 'Characters', title: 'Chapter 8: Tom story frames (6 frames: carries the salad spinner in both arms, holds out a coin, wraps a flashbulb in a dish towel, stacks folding chairs, holds his phone up high, looks at a photo on his phone)', ar: '3:2', refs: TOM, group: G,
    prompt: sheet('Tom', REF4('Tom'),
`Row 1:
1. Standing, facing the viewer, carrying a white plastic salad spinner with a clear lid in both arms against his chest, the lid full of pale dough, his chin tucked, a determined, slightly embarrassed face.
2. Standing in profile, facing right, one arm stretched out in front of him with his open palm up and a small gold coin held between his thumb and finger toward someone at the edge of his cell (nobody drawn), a calm, respectful, serious face.
3. Standing, facing the viewer, a small burnt-out round flashbulb in one hand and a folded checked dish towel in the other, wrapping the bulb carefully, his head bent over it, a careful, concentrating face.
Row 2:
4. Standing in profile, facing right, carrying a tall stack of five metal folding chairs held against his side with both arms, leaning a little to balance them, a tired but cheerful face.
5. Standing, facing the viewer, holding a smartphone up high at arm's length in one hand with the screen turned away to the right as if showing something to someone, his other hand pointing at it, a serious, urgent face.
6. Standing, facing the viewer, holding a smartphone in both hands in front of his chest and looking down at its screen with a quiet, soft, faraway expression, his shoulders a little low.`) },

  { id: 'ch8-tnb-poses', tab: 'Characters', title: 'Chapter 8: TNB story frames (6 frames: stops at the edge of the grey with one toe back, stares at the turntable, looks back at three little flames, carries a tower of bowls, sits on the counter with a grape soda, kneels to feed a motor)', ar: '3:2', refs: TNB, group: G,
    prompt: sheet('TNB', REF4('TNB'),
`Row 1:
1. Standing in profile, facing right, hands in his pockets, one foot stopped and his toe drawn back from a line on the ground in front of him (draw no line), his eyebrows raised, a calm, wary, I-am-not-doing-that look.
2. Standing, facing the viewer, hands loosely at his sides, his head tilted back and his mouth a little open, staring up in delighted wonder, as if looking at the best thing he has ever seen, his eyes shining.
3. Standing, turned a little to the left and looking down and back over his shoulder, a gentle amused smile, one hand held out low behind him with the fingers open as if letting small things follow him (draw nothing behind him).
Row 2:
4. Standing, facing the viewer, carrying a tall wobbling tower of nine colorful pottery bowls stacked in both arms up to his chin, peering round the side of the stack, a mellow, unbothered face.
5. Sitting on the edge of a counter, facing the viewer, one leg swinging, holding a can of grape soda in one hand, relaxed and easy, a slow smile, his eyes half closed (draw only a plain flat painted counter edge under him).
6. Kneeling on one knee in profile, facing right, one hand held forward at the level of his chest as if feeding something small into a machine at the edge of his cell (nothing drawn there), the other hand holding a small silver screwdriver, a focused, quiet, happy face.`) },

  { id: 'ch8-bernadette-poses', tab: 'Characters', title: 'Chapter 8: Bernadette story frames (6 frames: holds up a key on a ring, counts loaves with a pen, drinks a grape soda with her back turned, arms folded at a chain, points at the block, leans into a phone screen)', ar: '3:2', refs: BERN, group: G,
    prompt: npcSheet('Bernadette', REF2('Bernadette'),
`Row 1:
1. Standing, facing the viewer, holding up one big old iron key on a ring in her raised hand beside her face, her chin high, a stern, long-suffering, I-was-never-asked look.
2. Standing in profile, facing right, her clipboard held against her chest and a pen pointing out in her other hand, moving the pen along as if counting rows of something at the edge of her cell (nothing drawn there), her lips moving, her eyes narrowed.
3. Standing with her back turned to the viewer, her head turned a little to the right, a can of grape soda held up at her mouth, her clipboard under her other arm, caught mid sip.
Row 2:
4. Standing in profile, facing right, her arms folded tight with her clipboard under one elbow, her mouth in a flat line and one eyebrow raised, standing guard.
5. Standing in profile, facing right, one arm stretched out straight and pointing, the clipboard in the other hand, her mouth open mid-sentence, bossy and exact.
6. Leaning in toward the viewer from the left, her face large and close, one eyebrow raised and her lips pursed, her clipboard held up at the bottom of the cell, as if peering into a phone screen to inspect someone.`) },

  { id: 'ch8-washington-poses', tab: 'Characters', title: 'Chapter 8: Mr. Washington story frames (6 frames: angry and pointing at his roses, pushes a coin into a hole, reads a notice, bites a slice of bread, stands hands on hips, sighs with a hand on his forehead)', ar: '3:2', refs: WASH, group: G,
    prompt: npcSheet('Mr. Washington', REF2('Mr. Washington'),
`Row 1:
1. Standing in profile, facing right, one arm stretched out pointing straight ahead, the other fist on his hip, his mouth open, his eyebrows low, loudly angry about something at the edge of his cell (nothing drawn there).
2. Standing in profile, facing right, one arm stretched out in front of him with his thumb and finger pushing a small gold coin into a hole at the edge of his cell (nothing drawn there), his lips pressed together, his eyes narrowed, a doubtful, steady look.
3. Standing, facing the viewer, holding a white sheet of paper out in front of him in both hands at chest height and reading it with his glasses low on his nose, his eyebrows rising.
Row 2:
4. Standing, facing the viewer, one hand holding a thick slice of fresh bread up to his mouth with a big bite just taken, his eyes closed, his face gone still and soft.
5. Standing, facing the viewer, both fists on his hips, his chin up, a sour, put-upon, patient scowl.
6. Standing, facing the viewer, one hand flat on his forehead and his eyes closed, his head tilted back a little, a long-suffering sigh.`) },

  { id: 'ch8-cooks-poses', tab: 'Characters', title: 'Chapter 8: Miss Odette and Doña Carmen on the sidewalk holding spoons (6 frames: Odette 3, Carmen 3)', ar: '3:2', refs: [ODET, NP + 'npc-walk-odette-v1.png', CARM, NP + 'npc-walk-carmen-v1.png'], group: G,
    prompt: npcSheet('Miss Odette (the first three frames) and Doña Carmen (the last three frames)', 'Picture 1 is the finished painting of Miss Odette. Picture 2 is her walking sheet. Picture 3 is the finished painting of Doña Carmen. Picture 4 is her walking sheet.',
`Row 1, Miss Odette, always Odette's own face, age, body, hair and clothes:
1. Standing, facing the viewer, holding a big wooden spoon up in one hand like a scepter and the other hand on her hip, her mouth open scolding, a stern, warm, no-nonsense face.
2. Standing in profile, facing right, pointing the wooden spoon forward at someone at the edge of her cell (nobody drawn), her eyebrow high, a doubtful look.
3. Standing, facing the viewer, one hand holding the wooden spoon against her cheek, her eyes rolled up and her mouth a thin line, deeply unimpressed.
Row 2, Doña Carmen, always Carmen's own face, age, body, hair and clothes:
4. Standing, facing the viewer, holding a metal spatula up in one hand and her other fist on her hip, her chin up, a fierce, proud, offended face.
5. Standing in profile, facing right, her spatula held across her chest with both hands and her head tipped back, one eyebrow high, a skeptical look.
6. Standing, facing the viewer, one hand held out palm up and open, the spatula in the other, her face twisted in a mock-tragic grimace, as if mourning something cold.`) },

  { id: 'ch8-michael-carry', tab: 'Characters', title: 'Chapter 8: Michael carrying everything: a toddler girl on his hip, a small boy tucked under one arm, three dinner plates stacked on his other hand (one pose)', ar: '2:3', refs: [CH + 'michael-hero-ref-v1.png', CH + 'michael-walking-sheet-v1.png', CH + 'lachlan-ref-v1.png'], group: G,
    prompt: pose('Michael', 'Picture 1 is the finished painting of Michael, a calm dad. Picture 2 is his walking sheet. Picture 3 is a picture of his son Lachlan, a small boy.',
      'Michael, standing and facing the viewer, a toddler girl of about two with curly hair sitting on his left hip with one arm round his neck, a small boy of about five (the boy of picture 3) tucked sideways under his right arm like a parcel, his legs dangling, and on his right hand three white dinner plates balanced in a stack, with a few peas on the top plate. Michael is calm and a little amused, one eyebrow slightly raised, completely unbothered.',
      'Keep his height, figure size and head size as in the walking sheet. The two children are small and painted in the same style.') },

  { id: 'ch8-olivia-quote', tab: 'Characters', title: 'Chapter 8: Olivia with a phone held out like a microphone and a pleased, sharp smirk (one pose)', ar: '2:3', refs: [CH + 'olivia-hero-v1.png', CH + 'olivia-walking-sheet-v2.png'], group: G,
    prompt: pose('Olivia', 'Picture 1 is the finished painting of Olivia, a journalist and mom. Picture 2 is her walking sheet.',
      'Olivia, standing and facing the viewer, one arm held straight out toward the viewer with a smartphone in her hand held out flat like a microphone, her other hand on her hip, her chin up and one eyebrow raised, a sharp, delighted, caught-you smirk.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  { id: 'ch8-nara-story', tab: 'Characters', title: 'Chapter 8: Nara story frames (6 frames: jumps up on Tom, watches the flame go, looks up at Tom, looks pointedly away, sits very still by the loaves, under a table with half a loaf)', ar: '3:2', refs: NARA, group: G,
    prompt: sheet('Nara', REF4('Nara'),
`Row 1:
1. Standing on her hind legs facing right with both front paws up in the air against an invisible person at the edge of her cell (draw nobody), her tongue out and her tail a blur, wild with joy.
2. Standing in profile, facing right, her head low and turned to follow something small moving away along the ground at the edge of her cell (draw nothing there), her ears up, her eyes wide and still.
3. Sitting facing the viewer with her head tipped up and a little to the side, looking up at someone above her, a worried, searching, questioning face, one ear lifted.
Row 2:
4. Sitting in profile, facing right, her nose lifted and her head turned far away from the viewer, her eyes shut, very obviously not looking at something, her chin high.
5. Sitting very, very still, facing right, perfectly upright and stiff, her eyes fixed on something just beyond the edge of her cell (draw nothing there), a long string of drool hanging from her mouth, her tail flat on the ground.
6. Lying flat on her belly facing right, crouched low as if under a table, with half a round loaf of bread held in her mouth, her eyes looking sideways with guilty innocence, her ears back.`) },
];

// Wide and tall pictures say so in the request line.
for (const e of entries) {
  if (e.ar === '3:2') e.prompt = e.prompt.replace('exactly one square image', 'exactly one wide image');
  if (e.ar === '2:3') e.prompt = e.prompt.replace('exactly one square image', 'exactly one tall image');
}

module.exports = { entries };
