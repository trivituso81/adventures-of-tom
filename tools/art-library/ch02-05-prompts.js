// Chapters 2 to 5 art for the new storyline (claude/story-ch02.md to story-ch05.md, sections "New art needed"). Required by make-prompts.js
// (groups "Chapter 2" to "Chapter 5"). Tom 2026-11-13: "build in the admin capability to be including the new frames and art and voices
// that we need for the newly rewritten chapters 2 through 5."
// Already built and NOT redone here (checked against data/art-prompts.json 2026-11-13): the boss sheets enemy-bigshake, enemy-irongill,
// enemy-directorscut and enemy-redpen (new sheets below copy them), the Snag with its boot (enemy-snag), the sign-up sheet monster
// (data/school-monsters.js), Boppy's pepper jar (boppy-fx-five-alarm-jar objects), Boppy's folding chair, the NPC heroes and walk sheets for
// Odette, Carmen, Pruitt, Delgado, Kowalski and Vance, Nara's hero, walk and battle sheets, the happy puddle (nara-ab-happy-puddle).
// NOT written, needs Tom first: Clara (Grace's classmate; a real height in feet and inches is required before any prompt).
// Every prompt is self-contained (no fill-in fields). Per-character info comes from the attached approved pictures.

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

const entries = [
  // ---------------------------------------------------------------- Chapter 2: Smog on 2nd Avenue
  { id: 'ch2-lemon-tree-grey', tab: 'Props', title: 'Chapter 2: the small grey lemon tree and the round patch of grey dirt under it (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: single(`A small young lemon tree, about as tall as a grown person, seen from slightly above, standing in a round patch of dirt. The trunk, every leaf, and the round patch of dirt under it are painted in only grey and pale silver-grey, with no green, no brown and no yellow, as if from an old black and white movie. The dirt patch is a clean circle with one sharp edge. One low branch on the sunny side is bare and ready to hold a fruit that is NOT painted here. The tree has no lemons on it.`) },

  { id: 'ch2-orange-block', tab: 'Props', title: 'Chapter 2: the orange block, grapefruit-sized, a lemon inside, a small round dent (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: block('the size of a grapefruit', 'one bright yellow lemon, whole, with its short green stem and two leaves, is frozen as if hanging on its branch.', 'The block is shown alone, with a small snapped stub of branch coming out of its top.') },

  { id: 'ch2-coin', tab: 'Props', title: 'Chapter 2 close-up: the gold coin with a lemon stamp (one object, large)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: coin('a lemon with one leaf') },

  { id: 'ch2-loaf-whole', tab: 'Props', title: 'Chapter 2: a perfectly round sourdough loaf, whole (the bread bowl; one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: single(`A perfectly round sourdough loaf, whole, like a bowl turned upside down, seen from a slight angle above. A golden-brown crust with a few lightly scored lines, flour dusting, a crisp painted crust and a faint spiral on top, as if it had been shaped on a pottery wheel. The circle is perfect.`) },

  { id: 'ch2-loaf-torn', tab: 'Props', title: 'Chapter 2: the same round sourdough loaf with the top torn off, a hole in the top (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: single(`A perfectly round sourdough loaf like a bowl, seen from a slight angle above, with a ragged torn-off round hole in the top, as if someone tore off the lid. Through the hole you can see the soft pale crumb inside. The rest of the crust is golden brown with flour dusting. The torn-off piece is NOT in the picture.`) },

  { id: 'ch2-grape-soda', tab: 'Props', title: 'Chapter 2: two cans of grape soda standing side by side (one group)', ar: '1:1', refs: GRANDS, group: 'Chapter 2',
    prompt: single(`Two cans of grape soda, standing upright side by side and touching, slightly angled. Deep purple cans with a pale lavender band, a painted bunch of grapes on each can, and a little condensation. The pull tabs are shut.`, 'No people, no hands, no faces. The only words allowed are the two letters GRAPE painted on each can.') },

  { id: 'ch2-phone-girls', tab: 'Props', title: 'Chapter 2: Tom\'s phone showing a photo of Grace and Rose (shown on every flight west; one object)', ar: '1:1', refs: [CH + 'grace-hero-v1.png', CH + 'rose-hero-v1.png', 'art/grands.webp'], group: 'Chapter 2',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of Grace, a nine year old girl. 2) The painting of Rose, a six year old girl. 3) ${HOUSE}

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo: Grace and Rose standing close together outdoors, cheek to cheek, both laughing, shown from the chest up. Copy each girl's face, hair and colors from attachments 1 and 2 as exactly as possible. The phone is plain black with a thin frame. No hands.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient. The game cuts the phone out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  { id: 'ch2-phone-tnb', tab: 'Props', title: 'Chapter 2: Tom\'s phone showing a photo of TNB (shown on every flight east; one object)', ar: '1:1', refs: [CH + 'tnb-hero-v1.png', 'art/grands.webp'], group: 'Chapter 2',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of TNB, a grown man. 2) ${HOUSE}

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo: TNB from the chest up, smiling warmly at the viewer, holding up one hand in a small wave. Copy his face, hair and colors from attachment 1 as exactly as possible. The phone is plain black with a thin frame. No hands outside the photo.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient. The game cuts the phone out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  { id: 'ch2-nara-coin-mouth', tab: 'Characters', title: 'Chapter 2: Nara carrying a small gold coin in her mouth, proud (one pose; reused in chapter 6)', ar: '1:1', refs: NARA, group: 'Chapter 2',
    prompt: pose('Nara', 'Picture 1 is the finished painting of Nara, a brown curly dog. Picture 2 is her walking sheet. Pictures 3 and 4 are her battle sheets.',
      'Nara, standing in profile, facing right, in the same view as the profile frames of her walking sheet. A small round gold coin is held gently between her front teeth, sticking out at the side of her mouth. Her head is up, her ears are up and her tail is high and wagging: very proud.',
      'She is a dog, with paws and no hands. The coin is plain gold with no picture and no words.') },

  { id: 'ch2-nara-story-1', tab: 'Characters', title: 'Chapter 2: Nara story frames 1 (6 frames; replace narration boxes: sit and wiggle, paw slap, lick, whine, sneeze, lean)', ar: '3:2', refs: NARA, group: 'Chapter 2',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Sitting upright, her whole body wiggling with joy, her tail a happy blur, mouth open in a smile.
2. Sitting, one front paw lifted high and slapping down toward the viewer, very pleased with herself.
3. Standing tall on her hind legs, head tilted up, tongue out, licking upward, eyes closed with joy.
Row 2:
4. Standing at a front window sill, head low and looking out, ears flat, tail down, a worried whine.
5. Mid-sneeze, eyes squeezed shut, head jerked forward, a tiny puff of air.
6. Standing and leaning her whole side sideways against something to her left, eyes soft and happy, her body pressed flat against it.`, true) },

  { id: 'ch2-nara-story-2', tab: 'Characters', title: 'Chapter 2: Nara story frames 2 (6 frames: fur up and guarding, dig, drop, bark and look back, catch a coin, drop it and back up)', ar: '3:2', refs: NARA, group: 'Chapter 2',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Planted wide on all four paws, the fur standing straight up along her back, lips lifted in a serious growl.
2. Digging hard with both front paws, dirt flying behind her, ears flopping.
3. Standing with her mouth open and a small round gold coin just falling out of it toward the ground.
Row 2:
4. Mid-bark, her head turned back over her shoulder, looking behind her to check that someone saw.
5. Leaping slightly off the ground, catching a small round gold coin in her open mouth, eyes wide.
6. Backing away with her rear in the air, her front down in a play bow, tail wagging hard, a small round gold coin lying on the ground in front of her.`, true) },

  { id: 'ch2-bigshake-sneeze', tab: 'Enemies', title: 'The Big Shake sneezing out the coin: sheet, 6 frames facing right (chapter 2)', ar: '3:2', refs: [EN + 'enemy-bigshake-v3.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 2',
    prompt: bossSheet('The Big Shake, the living hill that is the boss of Griffith Park',
`The same creature, but with these changes in the six poses: top row: 1 looming and grumbling, with ONE of the observatory pipes on its side visibly rattling and shaking, small motion marks around that pipe only. 2 recoiling from a hit, stone chips flying, the rattling pipe still shaking. 3 its eyes squeezed shut and its mouth open, head tilted back, about to sneeze. Bottom row: 4 the sneeze, a small round gold coin shooting out of that one pipe in a puff of purple smoke. 5 sheepish afterward, eyes open wide, a little puff of smoke trailing from the pipe. 6 settling back down gently onto the ground, eyes soft, content. Paint the purple smoke as the same purple as before. No other changes.`) },

  { id: 'ch2-bigshake-normal', tab: 'Areas', title: 'The hill under the Observatory as a normal hill, no eyes, no smog (for the return after chapter 6, can wait)', ar: '3:2', refs: ['art/griffith.webp', 'art/grands.webp'], group: 'Chapter 2',
    prompt: area('Griffith Park', 'Under the Observatory, the hill is an ordinary grassy hill. It has no eyes, no face, no cracked stone, no orbiting rocks and no pipes pumping anything. The sky is a clear ordinary blue and there is no purple smog anywhere. Everything else stays the same.', 'Keep the Observatory, the terrace, the trail and the rocks.') },

  { id: 'ch2-odette-pot', tab: 'NPCs', title: 'Chapter 2: Miss Odette holding a big gumbo pot with both hands, walking, smiling (one pose)', ar: '2:3', refs: [NP + 'npc-photo-odette-v2.png', NP + 'npc-walk-odette-v1.png'], group: 'Chapter 2',
    prompt: pose('Miss Odette', 'Picture 1 is the finished painting of Miss Odette. Picture 2 is her walking sheet.',
      'Miss Odette, standing and facing the viewer, carrying a big steaming black iron gumbo pot against her stomach with both hands, her chin up, a warm, bossy, loving smile, as if she is about to tell someone to sit down.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  { id: 'ch2-carmen-towel', tab: 'NPCs', title: 'Chapter 2: Doña Carmen with a folded kitchen towel raised in one hand like a paddle, stern (one pose)', ar: '2:3', refs: [NP + 'npc-photo-carmen-v2.png', NP + 'npc-walk-carmen-v1.png'], group: 'Chapter 2',
    prompt: pose('Doña Carmen', 'Picture 1 is the finished painting of Doña Carmen. Picture 2 is her walking sheet.',
      'Doña Carmen, standing and facing the viewer, one hand on her hip, the other raised with a folded striped kitchen towel held like a paddle, ready to swat. A stern face, one eyebrow up, with the smallest hint of a smile at the corner of her mouth. In her other hand, a plate of golden pupusas.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  // ---------------------------------------------------------------- Chapter 3: Old Iron-Gill
  { id: 'ch3-hollow-grey', tab: 'Areas', title: 'Chapter 3: Sundial Hollow with all color gone in a circle: grey reeds, sundial and water, a clean edge (grey version of the built plate)', ar: '1:1', refs: ['art/sundial.webp', 'art/grands.webp'], group: 'Chapter 3',
    prompt: area('Area 06, Sundial Hollow', `The whole clearing of the hollow, the reeds around the water, the stone sundial, the standing stones and the water of the pool, is now inside one large circle that has lost all its color. ${GREY} The water inside the circle is grey and still, flat as slate. Outside the circle, the marsh is painted far too green and rich. The mossy boardwalk coming in stays in its normal color up to the circle's edge. Nothing is floating above the water in this painting (the frozen fish is a separate picture).`, 'Keep the sundial, the pool, the boardwalk and the exits.') },

  { id: 'ch3-orange-block', tab: 'Props', title: 'Chapter 3: the orange block, watermelon-sized, a fish in mid-jump inside, a small round dent (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 3',
    prompt: block('the size of a watermelon', 'one silver-green fish with a whiskered face is frozen in the middle of a jump, curved like a smile, mouth open, water droplets frozen around it.', 'The block is shown alone, hanging in the air with nothing under it or holding it.') },

  { id: 'ch3-coin', tab: 'Props', title: 'Chapter 3 close-up: the gold coin with a jumping fish stamp (one object, large)', ar: '1:1', refs: GRANDS, group: 'Chapter 3',
    prompt: coin('a fish jumping in an arc, with three small water drops') },

  { id: 'ch3-flashbulbs-row', tab: 'Props', title: 'Chapter 3: three burnt-out flashbulbs lined up in a row on a kitchen table (one group)', ar: '3:2', refs: GRANDS, group: 'Chapter 3',
    prompt: single(`Three burnt-out flashbulbs, the old glass kind with a metal base, lying side by side in a neat row on a small piece of a wooden kitchen table with a checked cloth corner. They are the same bulb, cracked and blackened on one side and clouded white on the other. The row is neat and evenly spaced, as if somebody lined them up on purpose.`) },

  { id: 'ch3-irongill-coin', tab: 'Enemies', title: 'Old Iron-Gill with a gold coin caught in its mustache: sheet, 6 frames facing right (chapter 3)', ar: '3:2', refs: [EN + 'enemy-irongill-v3.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 3',
    prompt: bossSheet('Old Iron-Gill, the giant mustached fish boss of the Whispering Marsh',
`The same creature and poses, but in EVERY pose one small gold coin with a fish stamp is caught in the tangle of its mustache on the left side of its face, small and clearly visible, in the same place in every pose. In pose 6, the last pose, the coin is hanging loose, about to fall. No other changes.`) },

  { id: 'ch3-whisker-perch-normal', tab: 'Enemies', title: 'The Whisker Perch as a normal-sized pond fish with whiskers: sheet, 6 frames facing right (for the return after chapter 6, can wait)', ar: '3:2', refs: [EN + 'enemy-irongill-v3.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 3',
    prompt: bossSheet('Old Iron-Gill, the giant mustached fish boss of the Whispering Marsh',
`THE NEW SHEET IS A NORMAL-SIZED POND FISH, not a giant: in every pose it is about as long as a grown person's forearm, an ordinary, calm perch with a few cat-like whiskers (not a big mustache). Top row: 1 hanging calmly in the water, mouth closed. 2 turning with a small splash. 3 blowing one small bubble. Bottom row: 4 a happy wiggle, tail flick. 5 a small gulp. 6 swimming away, tail sweeping. No glowing eyes, no coin, no spray.`) },

  { id: 'ch3-boppy-hat-coin', tab: 'Props', title: 'Chapter 3: Boppy\'s old fishing hat with a gold coin tucked in the hatband (one object)', ar: '1:1', refs: [CH + 'boppy-hero-v2.png', 'art/grands.webp'], group: 'Chapter 3',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of Boppy, a grandfather who always wears one old fishing hat. Copy his hat from this picture exactly: the same shape, colors, fabric and wear. 2) ${HOUSE}

PAINT THIS ONE OBJECT
Boppy's fishing hat alone, seen from the front and slightly above, upright, filling about 80 percent of the picture. Tucked into the hatband on the front is one small gold coin with a jumping fish stamp, half showing, shining. Two old fishing lures hang from the band as well. No head, no hands.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient and no magenta in the hat.

${ART}
- ${LIGHT}
- No words, letters or numbers.` },

  { id: 'ch3-tom-net', tab: 'Characters', title: 'Chapter 3: Tom holding a big fishing net up over his head with both hands, looking up (one pose)', ar: '2:3', refs: TOM, group: 'Chapter 3',
    prompt: pose('Tom', REF4('Tom'),
      'Tom, standing, looking up with a patient, ready face, holding a big fishing net with a long wooden pole straight up over his head with both hands, the hoop of the net high above him and slightly tilted. He has a tackle box hanging from one wrist.',
      'The net is painted in the same style as Tom. Keep his height and head size as in his walking sheet.') },

  // ---------------------------------------------------------------- Chapter 4: Backlot Bedlam
  { id: 'ch4-stage7-grey', tab: 'Rooms', title: 'Chapter 4: Soundstage 7 with a circle of the floor that has lost its color: grey floor, tape marks, wardrobe table, wheel tracks (grey patch on the built plate)', ar: '4:3', refs: ['art/stage7.webp', 'art/grands.webp'], group: 'Chapter 4',
    prompt: area('Soundstage 7', `In the middle of the floor, in front of the stairs to the stage set, is one large circle where rack two used to stand. ${GREY} Inside the circle are the grey floor boards, the grey colored-tape marks on the floor, and one grey wardrobe table with nothing on it. Four straight wheel tracks lead out of the circle across the floor toward the stairs. The tracks are grey inside the circle and fade to normal color outside. The work lights are on and bright. There is no rack, no people and nothing on the table.`, 'Keep the room layout, the stairs, the catwalk and the stage set.') },

  { id: 'ch4-orange-block', tab: 'Props', title: 'Chapter 4: the orange block, beach-ball-sized, a cowboy hat on a wooden hat stand inside, a small round dent (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 4',
    prompt: block('the size of a beach ball', 'a brown leather cowboy hat sits on a small wooden hat stand, frozen, the brim slightly curled.', 'The block is shown alone, hanging in the air with nothing under it. The same picture is used when it sits on a table and when it hangs after the table is pulled away.') },

  { id: 'ch4-coin', tab: 'Props', title: 'Chapter 4 close-up: the gold coin with a cowboy hat stamp (one object, large)', ar: '1:1', refs: GRANDS, group: 'Chapter 4',
    prompt: coin('a cowboy hat') },

  { id: 'ch4-lanyard-visitor', tab: 'Props', title: 'Chapter 4: the laminated VISITOR lanyard (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 4',
    prompt: single(`A laminated visitor badge on a blue lanyard cord, laid flat and seen from above, the cord curving in a loop above the badge. The badge is a white card in a shiny clear plastic laminate with a visible sealed edge. At the top of the badge, in bold dark letters, the word VISITOR. Below it a plain handwritten line for a name, left blank. A tiny painted smiley in one corner.`, 'No people, no hands, no faces. The only words allowed are VISITOR.') },

  { id: 'ch4-lanyard-crew', tab: 'Props', title: 'Chapter 4: the CREW badge on a lanyard (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 4',
    prompt: single(`A film crew badge on a black lanyard cord, laid flat and seen from above, the cord curving in a loop above the badge. The badge is a glossy golden-yellow card with the word CREW in bold dark capital letters, and a small clapperboard drawn under the word.`, 'No people, no hands, no faces. The only words allowed are CREW.') },

  { id: 'ch4-badge-stunt-double', tab: 'Props', title: 'Chapter 4: a small STUNT DOUBLE badge clipped to a dog collar (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 4',
    prompt: single(`A small rectangular badge with a metal clip, seen straight on, white with a red border, and in bold dark capital letters on two lines: STUNT DOUBLE. A tiny painted horse silhouette under the words.`, 'No people, no hands, no faces. The only words allowed are STUNT DOUBLE.') },

  { id: 'ch4-phone-tnb-prize', tab: 'Props', title: 'Chapter 4: Tom\'s phone showing TNB holding up a gold coin and a gold steamer (shown on the flight east; one object)', ar: '1:1', refs: [CH + 'tnb-hero-v1.png', 'art/grands.webp'], group: 'Chapter 4',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of TNB, a grown man. 2) ${HOUSE}

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo: TNB from the waist up, grinning proudly, holding a small gold coin up in his right hand and a gold-plated clothes steamer up in his left hand. Copy his face, hair and colors from attachment 1 as exactly as possible. The phone is plain black with a thin frame.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient. The game cuts the phone out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  { id: 'ch4-directorscut-coin', tab: 'Enemies', title: 'The Director’s Cut with the gold coin pinned to its beret: sheet, 6 frames facing right (chapter 4)', ar: '3:2', refs: [EN + 'enemy-directorscut-v4.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 4',
    prompt: bossSheet('The Director’s Cut, the giant red megaphone in a beret that is the boss of Studio Backlot',
`The same creature and poses, but in EVERY pose one small gold coin with a cowboy hat stamp is pinned to the front of its beret, small and clearly visible, in the same place in every pose, shining like an award. In pose 6, the last pose, the coin is loose and tipping off the beret. No other changes.`) },

  { id: 'ch4-megaphone-normal', tab: 'Enemies', title: 'The megaphone as a normal megaphone with a beret: sheet, 6 frames facing right (for the return after chapter 6, can wait)', ar: '3:2', refs: [EN + 'enemy-directorscut-v4.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 4',
    prompt: bossSheet('The Director’s Cut, the giant red megaphone in a beret that is the boss of Studio Backlot',
`THE NEW SHEET IS A NORMAL-SIZED MEGAPHONE, not a giant: in every pose it is about as long as a grown person's forearm, an ordinary red hand megaphone with a small beret, resting or tilting on a shelf, with no face, no glowing, no coin. Six simple resting poses: 1 upright, 2 tilting left, 3 tilting right, 4 lying on its side, 5 upright with the beret slipping, 6 leaning on a wall.`) },

  { id: 'ch4-tom-poses', tab: 'Characters', title: 'Chapter 4: Tom story frames (6 frames: on his knees under a table, flashbulb found, VISITOR lanyard, two lanyards, spotting, typing)', ar: '3:2', refs: TOM, group: 'Chapter 4',
    prompt: sheet('Tom', REF4('Tom'),
`Row 1:
1. On his knees on the floor, bent down low, looking under a table with a worried, curious face (no table drawn).
2. Standing up, holding one burnt-out flashbulb up between two fingers, a knowing face.
3. Standing, holding a laminated lanyard badge out proudly in both hands on the cord around his neck, beaming, mouth open in delight.
Row 2:
4. Standing with two lanyard cords around his neck, one badge in each hand held up, thrilled.
5. Standing with his arms crossed over his chest and a firm, calm face, planted.
6. Standing with his phone held in both hands, typing with his thumbs and reading, a small smile.`) },

  { id: 'ch4-tnb-poses', tab: 'Characters', title: 'Chapter 4: TNB story frames (6 frames: pulling the table, catching the coin, coin and steamer, shocked, backup hat, thank-you speech)', ar: '3:2', refs: TNB, group: 'Chapter 4',
    prompt: sheet('TNB', REF4('TNB'),
`Row 1:
1. Leaning back and pulling hard on the edge of a table with both hands, feet braced (no table drawn), a determined face.
2. Catching a small gold coin one-handed in front of him, eyes wide, mouth open in surprise.
3. Grinning proudly, holding a small gold coin up in his right hand and a gold-plated clothes steamer up in his left hand.
Row 2:
4. Both hands pressed to his cheeks, eyes wide, mouth open, shocked and rattled.
5. Holding a brown cowboy hat out to the side in one hand, the other hand on his hip, calm and pleased.
6. One hand pressed to his heart, the other hand holding a small gold coin against his chest, eyes wet and happy, as if giving a thank-you speech.`) },

  { id: 'ch4-nara-story-1', tab: 'Characters', title: 'Chapter 4: Nara story frames 1 (6 frames: howl, run, nose on the table, gentle take, gulp, ears up)', ar: '3:2', refs: NARA, group: 'Chapter 4',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Standing with her head thrown back, mouth open in a long happy howl.
2. Running flat out, all four paws off the ground, ears flying back, tongue out.
3. Standing with her chin and nose resting on the edge of a table at nose height (no table drawn), eyes wide, looking up hopefully.
Row 2:
4. Standing very still and taking a small piece of food gently from just in front of her nose, with very soft lips, eyes soft.
5. Head tipped up, gulping the food down whole, eyes wide and startled.
6. Standing with both ears straight up, alert, her head turned toward something in the distance.`, true) },

  { id: 'ch4-nara-story-2', tab: 'Characters', title: 'Chapter 4: Nara story frames 2 (6 frames: bolt, hydrant, drop the tag, small serious growl, stare at the coin, lean)', ar: '3:2', refs: NARA, group: 'Chapter 4',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Launching forward off her back paws in a sudden bolt, ears pinned back, eyes locked ahead.
2. Standing with her nose on a small red fire hydrant (no hydrant drawn bigger than her shoulder height), tail high and thrilled.
3. Standing proudly, having just dropped a small damp piece of paper tag on the ground in front of her, tail high.
Row 2:
4. Planted on all four paws with her head low, giving a small, very serious growl, lips barely lifted.
5. Sitting, staring straight at something small and shiny at her eye level, tail sweeping the ground behind her.
6. Standing and leaning her whole side against something to her left, eyes soft and happy, her body pressed flat against it.`, true) },

  // ---------------------------------------------------------------- Chapter 5: Parent-Teacher Conference of Doom
  { id: 'ch5-field-grey', tab: 'Areas', title: 'Chapter 5: the kickball field with a circle of grey grass and grey second base, six orange cones round it (grey patch on the built schoolyard plate, day)', ar: '4:3', refs: ['art/schoolyard.webp', 'art/grands.webp'], group: 'Chapter 5',
    prompt: area('Long Island Elementary (the schoolyard)', `On the kickball field beside the school, in the middle of the infield, is one circle about the size of a bus where the color is gone. ${GREY} Second base, the white square, and the chalk line running through the circle are painted grey inside the circle. Six bright orange safety cones stand evenly spaced in a ring just outside the grey circle. Nothing is in the sky above it.`, 'Keep the school, the doors, the benches, the parking lot, the playground, the paths and every exit.') },

  { id: 'ch5-field-grey-night', tab: 'Areas', title: 'Chapter 5: the same kickball field at night, the grey circle and the cones under the lights of the school (night version)', ar: '4:3', refs: ['art/schoolyard.webp', 'art/grands.webp'], group: 'Chapter 5',
    prompt: area('Long Island Elementary (the schoolyard), at night', `It is a calm night. The sky is deep blue with a few stars. The school's windows and the lamps along the paths glow warm yellow and give soft pools of light. On the kickball field, in the middle of the infield, is one circle about the size of a bus where the color is gone. ${GREY} Second base and the chalk line in the circle are grey. Six bright orange safety cones stand evenly spaced in a ring just outside the grey circle, lit by the lamps. Nothing is in the sky above it.`, 'Keep the school, the doors, the benches, the parking lot, the playground, the paths and every exit.') },

  { id: 'ch5-orange-block', tab: 'Props', title: 'Chapter 5: the orange block, washing-machine-sized, a red kickball and one sneaker inside, a small round dent (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: block('as big as a washing machine, much bigger than a beach ball', 'a bright red rubber kickball is frozen in the air, and beside it one child\'s white sneaker with its laces flying, as if the sneaker flew off in the middle of a kick.', 'The block is shown alone, hanging in the air with nothing under it. The small round dent is under the sneaker.') },

  { id: 'ch5-coin', tab: 'Props', title: 'Chapter 5 close-up: the gold coin with a kickball stamp (one object, large)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: coin('a kickball with a curved seam and three small motion lines') },

  { id: 'ch5-redpen-coin', tab: 'Enemies', title: 'The Red Pen with the gold coin under its pocket clip: sheet, 6 frames facing right (chapter 5)', ar: '3:2', refs: [EN + 'enemy-redpen-v3.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 5',
    prompt: bossSheet('The Red Pen, the giant red pen in glasses that is the boss of the school',
`The same creature and poses, but in EVERY pose one small gold coin with a kickball stamp is tucked under its pocket clip, small and clearly visible, in the same place in every pose, shining like a gold star. In pose 6, the last pose, the coin is loose and sliding out of the clip. No other changes.`) },

  { id: 'ch5-redpen-normal', tab: 'Enemies', title: 'The Red Pen as a normal red pen: sheet, 6 frames facing right (for the return after chapter 6, can wait)', ar: '3:2', refs: [EN + 'enemy-redpen-v3.png', EN + 'enemy-mudling-v2.png'], group: 'Chapter 5',
    prompt: bossSheet('The Red Pen, the giant red pen in glasses that is the boss of the school',
`THE NEW SHEET IS A NORMAL-SIZED RED PEN, not a giant: in every pose it is an ordinary red ballpoint pen with a pocket clip, as long as a grown person's hand, with no face, no glasses, no glow and no coin. Six simple poses: 1 lying flat, 2 upright in a cup, 3 lying at an angle, 4 clicked open with the tip out, 5 clicked shut, 6 rolling slightly.`) },

  { id: 'ch5-binder-closed', tab: 'Props', title: 'Chapter 5: the thick binder with color-coded tabs, closed, TOM on the spine (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`A thick three-inch ring binder, closed, standing upright and seen slightly from the side so the spine shows. The cover is deep navy blue. Four color-coded tabs in red, yellow, green and blue stick out from the right edge, in a staggered row. On the spine, in clean white capital letters, the name TOM.`, 'No people, no hands, no faces. The only words allowed are TOM.') },

  { id: 'ch5-binder-open', tab: 'Props', title: 'Chapter 5: the same binder open at tab three, with four color-coded tabs (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`A thick three-inch ring binder lying open, seen from above at a slight angle, a navy cover. It is open at the third tab, the green one. Four color-coded tabs in red, yellow, green and blue stick out of the right side in a staggered row. The open pages are neat typed lists with small checkboxes and no readable words, just lines. The green tab on the page is slightly crooked.`, 'No people, no hands, no faces. No readable words.') },

  { id: 'ch5-coffees', tab: 'Props', title: 'Chapter 5: two iced coffees in clear plastic cups with straws (one group)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`Two iced coffees standing side by side and touching, in tall clear plastic cups with domed lids and striped paper straws. Dark coffee with a swirl of cream and plenty of ice cubes, drops of condensation on the cups.`) },

  { id: 'ch5-clipboard-coin', tab: 'Props', title: 'Chapter 5: Amy\'s clipboard with a gold coin under the clip and a sign-up sheet held on it (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`A teacher's clipboard, seen straight on, upright, with a sheet of lined paper held under the metal clip. The sheet has a column of neat handwriting-like lines (no readable words) and every line has a small green check. Under the clip, tucked in beside the paper, one small gold coin with a kickball stamp shining.`, 'No people, no hands, no faces. No readable words.') },

  { id: 'ch5-gummy-note', tab: 'Props', title: 'Chapter 5: a big bag of gummy worms with a folded handwritten note tucked under its tie (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`A big clear plastic bag full of colorful gummy worms in red, orange, green and yellow, tied at the top with a ribbon. A small folded note is tucked under the ribbon, the handwriting on the visible part just soft pencil lines with a small drawn heart (no readable words).`, 'No people, no hands, no faces. No readable words.') },

  { id: 'ch5-backpack', tab: 'Props', title: 'Chapter 5: a small child\'s backpack (one object)', ar: '1:1', refs: GRANDS, group: 'Chapter 5',
    prompt: single(`A small child's school backpack, standing upright, seen from the front and slightly to the side. Teal blue with a yellow front pocket, two shoulder straps, a little worn at the corners, a small keychain star hanging from the zipper.`) },

  { id: 'ch5-phone-rose', tab: 'Props', title: 'Chapter 5: Tom\'s phone showing Rose\'s gap-toothed grin next to Grace (shown on the flight west; one object)', ar: '1:1', refs: [CH + 'grace-hero-v1.png', CH + 'rose-hero-v1.png', 'art/grands.webp'], group: 'Chapter 5',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The painting of Grace, a nine year old girl. 2) The painting of Rose, a six year old girl. 3) ${HOUSE}

PAINT THIS ONE OBJECT
A modern smartphone, seen straight on, upright, filling about 80 percent of the picture. The whole screen is one painted photo: Rose, on the left, grinning wide with a gap where her top front tooth is missing, and Grace beside her smiling, both from the chest up, cheek to cheek. Copy each girl's face, hair and colors from attachments 1 and 2 as exactly as possible. The phone is plain black with a thin frame.
Background: one flat solid pure magenta #FF00FF, edge to edge, with no gradient. The game cuts the phone out of this color.

${ART}
- ${LIGHT}
- No words, letters or numbers anywhere.` },

  { id: 'ch5-kowalski-cookies', tab: 'NPCs', title: 'Chapter 5: Mrs. Kowalski holding a tray of cookies, standing, a worried polite smile (one pose)', ar: '2:3', refs: [NP + 'npc-photo-kowalski-v4.png', NP + 'npc-walk-kowalski-v2.png'], group: 'Chapter 5',
    prompt: pose('Mrs. Kowalski', 'Picture 1 is the finished painting of Mrs. Kowalski. Picture 2 is her walking sheet.',
      'Mrs. Kowalski, standing and facing the viewer, holding a big tray of cookies in front of her with both hands. A polite, worried smile, her brows a little pinched, as if she has been waiting a long time.',
      'Keep her height, figure size and head size as in the walking sheet.') },

  { id: 'ch5-delgado-happy-tears', tab: 'NPCs', title: 'Chapter 5: Mr. Delgado crying happy tears, a tissue in one hand and a cookie in the other (one pose)', ar: '2:3', refs: [NP + 'npc-photo-delgado-v5.png', NP + 'npc-walk-delgado-v2.png'], group: 'Chapter 5',
    prompt: pose('Mr. Delgado', 'Picture 1 is the finished painting of Mr. Delgado. Picture 2 is his walking sheet.',
      'Mr. Delgado, standing and facing the viewer, tears running down his cheeks and a big, trembling, happy smile, a crumpled tissue in one hand dabbing at his eye and a cookie held in the other hand.',
      'Keep his height, figure size and head size as in the walking sheet.') },

  { id: 'ch5-tom-poses', tab: 'Characters', title: 'Chapter 5: Tom story frames (6 frames: hugging the binder, binder over his head, flipping pages, reading aloud, VISITOR sticker, pointing at himself)', ar: '3:2', refs: TOM, group: 'Chapter 5',
    prompt: sheet('Tom', REF4('Tom'),
`Row 1:
1. Hugging a thick closed binder to his chest with both arms, beaming, thrilled.
2. Standing with a thick open binder held flat over his head with both hands, looking up at it, serious and ready.
3. Holding a thick open binder in front of him in one hand and flipping a page with the other, brow furrowed, searching.
Row 2:
4. Holding a thick open binder in front of him with both hands and reading aloud, mouth open, one eyebrow raised, solemn.
5. Standing with a small white rectangular sticker on his shirt at the chest, looking down at it and pointing at it with one finger, pleased.
6. Standing with one hand on his chest, proud, chin up, eyes closed, about to make a very good pun.`) },

  { id: 'ch5-tom-lifts-grace', tab: 'Characters', title: 'Chapter 5: Tom lifting Grace up under her arms so she can look at something high (one group pose)', ar: '2:3', refs: [CH + 'tom-hero-v2.png', CH + 'tom-walking-sheet-v3.png', CH + 'grace-hero-v1.png', CH + 'grace-walking-sheet-v2.png'], group: 'Chapter 5',
    prompt: `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one image, nothing else. Generate it now. Do not make a plan, a sheet or several poses.

ATTACHED IMAGES
1) The finished painting of Tom, a tall grown man. 2) His walking sheet. 3) The finished painting of Grace, a nine year old girl. 4) Her walking sheet.

PAINT THIS ONE POSE
Tom, standing with his feet apart, holding Grace up under her arms with both hands, her feet dangling a foot above the ground. Grace is high up and leaning forward, her face turned up to look at something above them and her hands held carefully behind her back, not touching anything, a serious, eager look. Tom is looking up at her with a calm, ready face. Both are seen from the side, facing right. Keep Grace's size correct compared to Tom: she is a child about half his height.
Standing on a plain flat magenta #FF00FF background, nothing else in the picture, no text, no shadow on the ground.

${ART}
- ${LIGHT}
- Copy Tom and Grace from the attached pictures as exactly as possible: the same faces, ages, bodies, head sizes compared to their bodies, hair, clothes, colors, painting style and level of detail.` },

  { id: 'ch5-rose-grin', tab: 'Characters', title: 'Chapter 5: Rose grinning wide with a gap where her top front tooth was, close-up of head and shoulders (one picture)', ar: '1:1', refs: [CH + 'rose-hero-v1.png', CH + 'rose-walking-sheet-v2.png'], group: 'Chapter 5',
    prompt: `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The finished painting of Rose, a six year old girl. 2) Her walking sheet.

PAINT THIS ONE PICTURE
A close-up of Rose from the shoulders up, filling the square, facing the viewer, grinning as wide as she can with her mouth open. In the top row of her teeth, in the front, there is one clear gap where a tooth has just fallen out. Her eyes are bright and proud and a little smug. Copy her face, hair and colors from attachment 1 as exactly as possible.
Background: one flat solid pure magenta #FF00FF, edge to edge, nothing else in the picture, no text.

${ART}
- ${LIGHT}` },

  { id: 'ch5-nara-story', tab: 'Characters', title: 'Chapter 5: Nara story frames (6 frames: sit on his feet, big sigh, lean on a leg, porch guard, watch the taxi go, happy wag)', ar: '3:2', refs: NARA, group: 'Chapter 5',
    prompt: sheet('the dog Nara', REF4('Nara, a brown curly dog'),
`Row 1:
1. Sitting down very firmly on a pair of shoes at her feet (no shoes drawn, her rear low and her paws together), looking up with big stubborn eyes.
2. Standing with her head and shoulders sagging, eyes closed, a huge sigh, her whole chest deflating.
3. Walking slowly and leaning her whole side against something to her right, eyes soft and a little sad, her body pressed flat against it.
Row 2:
4. Sitting upright and proud like a guard, chest out, ears up, looking straight ahead.
5. Sitting with her head turned to one side, ears drooping, watching something drive away.
6. Standing with her head up and her mouth open in a happy smile, her tail sweeping, relieved.`, true) },
];

module.exports = { entries };
