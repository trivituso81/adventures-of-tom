// Enemies tab: one sheet per enemy (86), painted look. Data: prompts/enemy-table.txt (id|area|height in inches|look) and prompts/enemy-moves.json (from the live game).
// Regular enemy = 4 frames (stance, flinch, attack A, attack B), boss = 6 frames. One row, facing RIGHT, flat magenta background.
// Likeness ref = the old drawing tools/sprite-bake/src/foe-<id>-v1.png when it exists (shape, colors and face only, never its rendering).
const fs = require('fs');
const TABLE = fs.readFileSync(__dirname + '/prompts/enemy-table.txt', 'utf8').trim().split('\n').map(l => { const [id, area, inches, look] = l.split('|'); return { id, area, inches: +inches, look }; });
const MOVES = JSON.parse(fs.readFileSync(__dirname + '/prompts/enemy-moves.json', 'utf8'));
const KEY = 'docs/reference/style_key_v1.png';
const AREAS = {
  hollow: 'a sunlit pond ringed by reeds with big leafy trees', griffith: 'a dusty golden hillside park with scrub oaks', marsh: 'a misty marsh of cattails and dark still water',
  backlot: 'a film-studio backlot with fake storefronts and lighting rigs', school: 'a night-time elementary school classroom', oak: 'a huge old oak tree in a dusty park',
  library: 'tall wooden library shelves under warm hanging lamps', barn: 'a cold brick streetcar barn with rails in the floor', club: 'a faded 1971 supper club with velvet booths and brass',
  terminal: 'an empty 1980s airport terminal at dusk', infinity: 'an airport concourse frozen at dusk with warm gate lights', blvd: 'a Los Angeles boulevard drained to grey with every light stuck on red',
  subrail: 'a hand-dug subway tunnel with tiled walls and strung work lights', row: 'a family street under an amber dome with a glowing gold gate', dinner: 'a warm family dining room with a long table and lamplight',
  square: 'a village square under a black eclipse with an amber ring', tower: 'a cold glass office tower with grey shelves and pale amber light', loom: 'a vast dark glass chamber around a loom of glowing gold threads',
  deadletter: 'an underground mail sorting hall with conveyor belts and wooden pigeonholes', core: 'a clockwork heart of gold gears and stopped clocks', scoops: 'a cheerful pastel ice cream parlor'
};
// The painting of each area (installed plate), attached to the enemy sheet so the creature is painted into the same world: palette, light and handbrushed texture.
// scoops has no area painting yet, so those four sheets carry the style key only.
const AREA_PAINTING = {
  hollow: 'art/hollow.webp', marsh: 'art/reeds.webp', griffith: 'art/griffith.webp', backlot: 'art/backlot.webp', school: 'art/school.webp', oak: 'art/oak.webp',
  library: 'art/library.webp', barn: 'art/carbarn.webp', club: 'art/moonclub.webp', terminal: 'art/terminal.webp', infinity: 'art/concourse.webp', blvd: 'art/blvd.webp',
  subrail: 'art/subtunnel.webp', row: 'art/row.webp', dinner: 'art/grands.webp', square: 'art/town.webp', tower: 'art/tower.webp', loom: 'art/towervault.webp',
  deadletter: 'art/deadletter.webp', core: 'art/stillcore.webp'
};
const style = hasArea => `ART STYLE
- A whimsical storybook illustration of a creature, painted by hand with real brushes in a rich, dense, jewel-toned style, exactly like the illustrated school-yard painting of the style key${hasArea ? ' and the area painting' : ''}. Up close it looks like an oil or gouache painting on canvas: visible individual brush strokes that follow the shape of every form, layered paint, fine painted texture, small hand-made variations of color from one stroke to the next, and a faint canvas grain. Gently simplified shapes. Friendly-scary, funny and full of personality, never grim. This is a game for a family with a 6 and a 9 year old.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp, painterly edges with fine detail, formed where one brush stroke meets the next. No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.`;
const artNote = hasArea => `STYLE RULE (the most important instruction)
Every frame must look handbrushed and painted by the same hand as the attached paintings: dense painted texture, visible brush strokes that follow the form, layered paint, fine detail, deep saturated colors, crisp painterly edges. Every surface of the creature (skin, fur, moss, wood, metal, cloth, glass) is painted with brush strokes, never airbrushed smooth, never glossy plastic, never a 3D render. ${hasArea ? 'The creature is painted into the same world as the area painting, by the same hand, so a viewer cannot tell the creature and the area were painted by different artists.' : 'The creature is painted by the same hand as the style key, so it could sit inside that picture without looking like a different artist made it.'}`;

function build(t, grid, brushRef, real) {
  const m0 = MOVES[t.id]; if (!m0) throw new Error('no moves for ' + t.id);
  const m = { ...m0, name: m0.name.replace(/sprite/i, 'Imp') }; // the word sprite pulls the generator toward pixel art
  const realName = m0.name;
  const boss = m.rank === 'BOSS';
  const underRef = 'docs/reference/underpaint/' + t.id + (grid ? '-grid' : '') + '.png';   // soft de-pixelated copy of the old sheet (tools/art-library/make_underpaint.py); preferred, because the generator copies a sharp pixel sheet back
  const hasUnder = fs.existsSync(underRef);
  const likeRef = hasUnder ? underRef : 'tools/sprite-bake/src/foe-' + t.id + '-v1.png';
  const hasLike = fs.existsSync(likeRef);
  const areaRef = AREA_PAINTING[t.area];
  if (areaRef && !fs.existsSync(areaRef)) throw new Error('missing area painting ' + areaRef);
  const refs = [KEY].concat(areaRef ? [areaRef] : [], hasLike ? [likeRef] : [], brushRef ? [brushRef] : []);
  const likeNo = areaRef ? 3 : 2;
  const brushNo = likeNo + (hasLike ? 1 : 0);
  const brushAtt = brushRef ? `${brushNo}. A FINISHED picture of a different creature, painted in exactly the surface finish wanted for this sheet: matte, with visible brush strokes, ridges of paint, layered color and a canvas grain. Use it ONLY for how the paint looks (the matte finish, the brushwork, the sharpness of the edges). Do not copy its creature, pose or layout: the creature, poses and layout come only from ${hasLike ? 'attachment ' + likeNo : 'the description below'}.` : '';
  const sig = m.acts.length ? m.acts[m.acts.length - 1] : 'its attack';
  const n = boss ? 6 : 4, cols = grid ? (boss ? 3 : 2) : n, rows = grid ? 2 : 1;
  const cell = grid ? 512 : (boss ? 384 : 256);
  const px = grid ? Math.round(cell * 0.8) : Math.round(t.inches * 5);
  const frames = boss
    ? ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK 1: the wind-up for its signature attack, ${sig}.`, 'ATTACK 2: the attack building, bigger and more intense.', 'ATTACK 3: the attack landing at full force.', 'ATTACK 4: the follow-through, settling back.']
    : ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK A: the wind-up for its signature attack, ${sig}.`, 'ATTACK B: the attack landing.'];
  const areaAtt = areaRef ? `2. The AREA PAINTING of ${AREAS[t.area]}: the place ${m.name} lives and fights. Use it for the creature's world: its color palette, the color of its light and shadows, the dense handbrushed paint texture and the mood. Paint ${m.name} as a resident of this same picture, by the same hand: the warm key light stays at the upper left as described below, tinted by the area's light on its lit side, with the area's shadow colors in its shaded side, and its materials (moss, wood, brick, brass, glass, mud, cloth) painted brush stroke by brush stroke the way this painting paints them. Do not copy this painting's layout, buildings or props into the sheet.` : '';
  const underAtt = `${likeNo}. A soft COLOR UNDERPAINTING of this whole sheet: the same ${n} poses of ${m.name}, in the same order and in the same positions, blurred on purpose, like a painter's first block-in of color. It fixes each pose's shape, position, size, colors, face and expression, and nothing else. Paint the finished picture over it: repaint every pose in place, with the same layout, the same poses and the same character, and add the fine detail and brushwork the underpainting does not have, such as individual brush strokes, painted texture, highlights, crisp painterly edges and small painted details in the face and surfaces. The finished sheet is sharp, high resolution and richly detailed. Nothing from the underpainting is kept as it is: every edge, texture and highlight is freshly painted.`;
  const likeAtt = hasUnder ? underAtt : hasLike ? `${likeNo}. A LIKENESS picture of ${m.name} drawn in an older style. Use it for the creature's SHAPE, face, expression, colors and details ONLY. Do not copy how it is rendered: it is blocky and flat, and the new sheet must not be. Redraw ${m.name} from scratch, handbrushed and painted, keeping the same character.` : '';
  const att = [`1. The STYLE KEY, a finished painting of the family in a school yard. This is the painting style to match exactly: dense, jewel-toned painted texture, fine visible brushwork, deep saturated colors, warm light.`, areaAtt, likeAtt, brushAtt].filter(Boolean).join('\n');
  const text = `IMAGE REQUEST: ONE SINGLE ENEMY SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The battle sheet of the enemy ${m.name.toUpperCase()} (${boss ? 'a BOSS' : 'a regular enemy'}, level ${m.level}) for "The Adventures of Tom", a family role-playing game: ${n} poses of the same character in ${grid ? 'a grid' : 'a single row'}. The game puts it in front of a painted background of ${AREAS[t.area]}, so its colors and handbrushed painted texture should feel at home there${areaRef ? ', painted in the same way as the area painting' : ''}, but it must still stand out clearly against it.

ATTACHED IMAGES (in this order)
${att}

${artNote(!!areaRef)}

${brushRef ? MATTE + '\n\n' : ''}${style(!!areaRef)}

THE CREATURE
${m.name.toUpperCase()}: ${t.look}. It is about ${t.inches} inches tall (${(t.inches / 12).toFixed(1).replace('.0', '')} feet), measured from its base or feet to the top of its highest point. For comparison, the smallest enemy in the game, the Mudling, is 16 inches tall.${boss ? ' It is a boss, so it is large, imposing and extra detailed, but still funny and friendly-scary.' : ''}

THE SHEET (strict)
- ${grid ? `A single image holding a grid of ${n} equal square cells, ${cols} columns by ${rows} rows, each cell ${cell} x ${cell} pixels, so the full image is ${cell * cols} x ${cell * rows} pixels. ${hasUnder ? 'The layout is exactly the layout of the underpainting.' : 'The cells are filled in reading order.'} If your tool cannot make that exact size, keep the same ${cols} by ${rows} grid and make the image as large as it allows.` : `A single horizontal row of ${n} equal square cells, ${cell} x ${cell} pixels each, so the full image is ${cell * n} x ${cell} pixels. If your tool cannot make that exact shape, keep exactly ${n} cells in one row and make the image as wide as it allows.`}
- Exactly ${n} frames, one per cell, ${grid ? 'in reading order (left to right along the top row, then left to right along the bottom row)' : 'from left to right'}, in the numbered order below.
- ${m.name.toUpperCase()} FACES RIGHT in every frame (toward the right side of the image), as if facing the family on the right of a battle screen. Seen from the side or three quarters, slightly from above.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on the creature. No magenta glow, spill, tint or fringe on its edges. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- ${grid ? `${hasUnder ? 'Same scale in every cell, exactly the scale and position of the figures in the underpainting, which already fills each cell as much as its widest pose allows. In every cell the feet or base rest on the same horizontal line as in the underpainting' : `Same scale in every cell: the standing creature fills about 80 percent of the cell height, and stays that size in every frame. In every cell the feet or base rest on one horizontal line about 8 percent above the cell bottom`}, with a small soft contact shadow directly under it. Nothing touches a cell edge or overlaps a neighbour.` : `Same scale in every cell: the standing creature is about ${px} pixels tall in its cell, and stays that size in every frame (a crouched or stretched pose may vary its height by at most 15 percent). Its base or feet rest on one horizontal line about 16 pixels above the cell bottom, with a small soft contact shadow directly under it. Center each pose in its cell with at least 10 percent margin; nothing touches a cell edge or overlaps a neighbour.`}
- Draw ONLY ${m.name.toUpperCase()}. No effects, motion lines, sparkles, other characters, props that are not part of it, text or word balloons.
- The same colors, details and level of painted detail in every frame.

THE ${n} FRAMES
${frames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Family friendly for ages 6 and up. Keep the flinch frame comic, never grim.

NEVER substitute. Do not add extra frames, merge two frames or repeat a pose. If anything is unclear, draw ${m.name.toUpperCase()} in the pose described, facing right, with the shape and colors of the likeness${hasLike ? ' in attachment ' + likeNo : ' described above'}.`;
  return { id: real ? 'enemy-' + t.id : (grid ? 'test-grid-' : 'enemy-') + t.id + (brushRef ? '-matte' : ''), tab: 'Enemies', title: grid && !real ? `Library test: ${realName} as a ${cols} x ${rows} grid, ${brushRef ? 'matte and handbrushed finish copied from an approved picture' : 'repainted over a soft underpainting'}` : `${realName}: ${boss ? 'boss ' : ''}sheet, ${n} frames facing right${hasLike ? '' : ' (no old likeness picture, built from the description)'}`, ar: grid ? (boss ? '3:2' : '1:1') : '16:9', refs, prompt: text };
}

// ONE pose per picture (11-05 14:55, Tom: more handbrushed, matte not glossy, resolution high enough for an iPad in landscape).
// The generator caps a picture at about one megapixel, so only one creature per picture lets it fill the frame (about 850 px tall).
// Reference = soft underpainting of that single frame (docs/reference/underpaint/<id>-f<k>.png, tools/art-library/make_underpaint.py --single).
const MATTE = `SURFACE AND BRUSHWORK (the most important instruction)
Every surface is matte, like dry oil paint or gouache on canvas. Light is shown by broad, soft highlights built from visible brush strokes with dry-brush texture along their edges. Brush strokes are clearly visible everywhere and vary in size: broad strokes for the large forms, short flicks for texture, thick ridges of paint on the lit side of every form. Color is built in layers, so warm and cool tones show through each other. Edges are painted crisp with a small brush. A fine canvas weave grain lies over the whole picture. NOT glossy, NOT wet-looking, NOT plastic, NOT airbrushed, NOT a 3D render.`;
const BRUSH_REF = 'art/raw/enemies/test-one-mudling-stance-v1.png';   // approved finish reference (Tom 11-05 15:14)
function buildOne(id, k, chain) {
  const t = TABLE.find(x => x.id === id); if (!t) throw new Error('no enemy ' + id);
  const m0 = MOVES[id]; const m = { ...m0, name: m0.name.replace(/sprite/i, 'Imp') };
  const boss = m.rank === 'BOSS', n = boss ? 6 : 4;
  const sig = m.acts.length ? m.acts[m.acts.length - 1] : 'its attack';
  const frames = boss
    ? ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK 1: the wind-up for its signature attack, ${sig}.`, 'ATTACK 2: the attack building, bigger and more intense.', 'ATTACK 3: the attack landing at full force.', 'ATTACK 4: the follow-through, settling back.']
    : ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK A: the wind-up for its signature attack, ${sig}.`, 'ATTACK B: the attack landing.'];
  const pose = frames[k - 1];
  const under = 'docs/reference/underpaint/' + id + '-f' + k + '.png';
  if (!fs.existsSync(under)) throw new Error('missing ' + under);
  const areaRef = AREA_PAINTING[t.area];
  const refs = [KEY].concat(areaRef ? [areaRef] : [], [under], chain ? [chain] : []);
  let no = 1;
  const att = [`${no++}. The STYLE KEY, a finished painting of the family in a school yard. This is the painting style to match: dense, jewel-toned painted texture, fine visible brushwork, deep saturated colors, warm light.`];
  if (areaRef) att.push(`${no++}. The AREA PAINTING of ${AREAS[t.area]}: the place ${m.name} lives and fights. Use it for the creature's world: its color palette, the color of its light and shadows, the dense handbrushed paint texture and the mood. Paint ${m.name} as a resident of this same picture, by the same hand. Do not copy this painting's layout, buildings or props.`);
  att.push(`${no++}. A soft COLOR UNDERPAINTING of this one pose of ${m.name}, blurred on purpose, like a painter's first block-in of color. It fixes the pose, the shape, the proportions, the colors, the face and the expression, and nothing else. Paint the finished picture over it: the same creature in the same pose, with the same placement, enlarged to fill the picture, with all the fine detail and brushwork the underpainting does not have. Nothing from the underpainting is kept as it is: every edge, texture and highlight is freshly painted, sharp and clear.`);
  if (chain) att.push(`${no++}. The FINISHED picture of the same creature in its stance. Use it for the exact colors, the painted textures, the brush style and the details of ${m.name}, so this pose is clearly the same creature painted by the same hand. Only the pose is different.`);
  const text = `IMAGE REQUEST: ONE SINGLE ENEMY PICTURE. Return exactly one image, nothing else.

WHAT THIS IS
One pose of the enemy ${m.name.toUpperCase()} (${boss ? 'a BOSS' : 'a regular enemy'}, level ${m.level}) for "The Adventures of Tom", a family role-playing game. The game shows it large, in front of a painted background of ${AREAS[t.area]}, on phones and on tablets held sideways, so it must be sharp, detailed and clear at full size.

ATTACHED IMAGES (in this order)
${att.join('\n')}

${MATTE}

${style(!!areaRef)}

THE CREATURE
${m.name.toUpperCase()}: ${t.look}.${boss ? ' It is a boss, so it is large, imposing and extra detailed, but still funny and friendly-scary.' : ''}

THE POSE
${pose}

THE PICTURE (strict)
- One square image, 1024 x 1024 pixels. If your tool cannot make that exact size, keep it square and make it as large as it allows.
- ${m.name.toUpperCase()} FACES RIGHT, seen from the side or three quarters, slightly from above, exactly as in the underpainting.
- The creature is as large as it can be: it fills about 85 percent of the picture height or width, whichever is larger, with an empty margin of at least 6 percent on every side. Its base or feet rest on one horizontal line about 8 percent above the bottom edge, with a small soft contact shadow directly under it.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on the creature, no magenta glow, spill, tint or fringe on its edges.
- Draw ONLY ${m.name.toUpperCase()}, with nothing else in the picture.
- Every detail is painted at full resolution: crisp edges, fine texture, small details in the eyes, mouth and surfaces.

Family friendly for ages 6 and up. Keep the flinch comic, never grim.`;
  return { id: 'test-one-' + id + '-' + (k === 1 ? 'stance' : 'pose' + k), tab: 'Enemies', title: `Library test: ${m0.name}, ${pose.split(':')[0].toLowerCase()} pose alone, matte and handbrushed${chain ? ' (approve the stance test first)' : ''}`, ar: '1:1', refs, prompt: text };
}

// SHORT PROMPT (Tom 11-05 15:49: it worked great after his tweak "handbrushed painting"; applies to every enemy). Long prompts misdirected the generator.
const TAIL = `Background: one flat, solid, even magenta #FF00FF with no texture, no brush strokes and no gradient, nothing else in the picture, no text.`;
// Custom pose text for enemies whose four poses must be spelled out (Tom 11-05 16:10: the Soggy Sock came back with four near-identical poses).
// Enemies Tom wants redrawn richer than the old pixel design (Tom 11-05 16:45: Old Ironbelly should be much more detailed, beautiful and dramatic as a boss). Replaces the first sentence of the prompt.
const LEAD = {
  mirrorball: `Repaint attachment 2 as a grand, richly detailed handbrushed boss painting. Keep the same creature, a huge glittering silver mirrorball with a grinning face in its facets, a swooping purple and cream feathered shawl and a hanging chain, but make it far more detailed, beautiful and dramatic: hundreds of shining mirror facets reflecting colored light, glamorous layered feathers, sparkling jewels and glitter, a regal diva presence, rich colored stage light.`,
  ironbelly: `Repaint attachment 2 as a grand, richly detailed handbrushed boss painting. Keep the same creature, a cast-iron pot-bellied stove with a glowing grate mouth, round gauge eyes, stubby legs and a smoking chimney, but make it far more detailed, beautiful and dramatic: heavy riveted iron plates, embossed scrollwork, deep rust and soot, glowing cracks, a roaring fire behind a menacing grate mouth, bright firelight playing on the iron.`
};
const FLAIR = {
  ironbelly: `heavy riveted iron plates, embossed scrollwork, deep rust and soot, cracks glowing orange, a roaring fire behind a menacing grate mouth`,
  mirrorball: `hundreds of small mirror facets built from dabs of silver and lilac, layered feathers painted stroke by stroke, beaded jewels, a regal diva presence, colored stage light`,
  bigone: `scales and fins painted in rich blue and teal, wet dripping water, huge luminous startled eyes, and a TINY pie tin, only one sixth of its height and much smaller than in attachment 2, perched on the crown like a little hat. It is a giant, nearly as tall as a grown man, and it fills most of each cell`,
  bigshake: `layered cracked stone with glowing orange fissures, mossy crags, orbiting rocks trailing sparks, dust and heat shimmer, dramatic rim light`,
  irongill: `rusty riveted iron plates in deep detail, long whiskers like bronze cables, wet skin, small glowing gold eyes, murky water with mist and dramatic marsh light`,
  directorscut: `golden brass with dents, a carved wooden tripod, a furious expressive face in the bell, film-set spotlights and light beams`,
  redpen: `a red barrel and gold nib, a long red cape in flowing folds, a pool of ink with splashes, dramatic red light`,
  chairman: `a luxurious red velvet throne with carved gold, a fur-trimmed robe, a monocle, an individually painted bushy tail, warm candlelight`,
  unread: `an ancient cracked leather cover with brass corners and embossed runes, yellowed torn pages curling like tentacles, drifting dust motes, ghostly purple light`,
  lastcall: `hundreds of individually painted split-flap tiles with tiny letters, rusty brass spider legs, glowing amber light from the board, steam and sparks, grimy industrial detail`,
  finalcall: `navy enamel with gold trim, a glowing screen of rows of yellow flap text, chunky riveted robot legs, a glowing red antenna, crisp rim light`,
  gridlockprime: `red metal with chrome trim, glowing yellow lights, steam from the grille, a flowering traffic-light post, strong headlight beams`,
  drillworm: `wet rubbery skin, a spinning two-tone drill bit, flying rock and gravel, a gritty pit glowing with orange and green minerals, a scuffed yellow hard hat`,
  warden: `golden plate armor with engraved filigree and a warm glow, a raised visor showing his face, a long halberd with a bright blade, dramatic backlight`,
  hush9final: `silver metal with rivets and glowing cyan lines, a red light and a bright yellow siren, glowing cyan eyes, a speaker grille mouth, streaks of light and steam`,
  marlowe16: `a finely tailored grey suit, a glowing amber glass fist with cracks of light running up the suit, cold grey light against warm amber glow, a stern expressive face`,
  twinlens: `a brass gantry with intricate gear rings, two huge glowing lens-eyes, one ice blue and one amber, with glass reflections, a red gem, dust motes and crossing light beams`,
  vance: `long wavy gray hair falling past the collar under the hat, a gaunt lined face, a long black coat with gold buttons in rich folds, a wide-brimmed hat shadowing a pale grim face, a gold pocket watch and brass ray gun, cold moonlight with a sharp rim light`,
  censor: `a long black suit with razor creases, a black redaction bar for a face with two glowing white eyes, a striped collar, a fat dripping black marker, flying stamped envelopes, noir light`,
  leviathan: `gold clockwork scales built from chunky dabs of ochre, yellow and brown paint with thick impasto and visible stroke direction on every scale, gear teeth and a large clock face painted in bold brush strokes, big gold gears with rough painted edges, a dark painted void behind the coils, warm golden light`,
  julian: `a long black coat in soft folds, a hat, a gentle softened face, warm golden light, a gold pocket watch, a brass ray gun held loosely`,
  brainfreeze: `translucent frosted ice with deep blue refractions, a skirt of icicles, crystal fists, swirling frost mist, a blue latch, cold sparkles, dramatic cold light`,
};
const POSES = {
  bigone: `Top row: 1 sitting upright on its flat tail, huge startled eyes, big and imposing. 2 rocked back from a hit, eyes squeezed shut, water spraying. 3 puffing itself up even bigger, eyes bulging. Bottom row: 4 attack wind-up for Big Glare, leaning in with a furious stare. 5 the attack, the biggest glare, brows low, glowing eyes, mouth set, water streaming off it. 6 the follow-through, slumping forward with a heavy sigh, the tail sweeping low, clearly different from pose 1.`,
  bigshake: `Top row: 1 looming, small rocks orbiting. 2 recoiling from a hit, stone chips flying. 3 rumbling and shaking, the cracks glowing brighter. Bottom row: 4 attack wind-up, lifting off the ground, rocks gathering above. 5 the attack, boulders crashing down in a huge burst of dust. 6 the follow-through, settling heavily, dust clouds billowing and rocks tumbling away, clearly different from pose 1.`,
  directorscut: `Top row: 1 standing on the tripod, shouting. 2 thrown back, the tripod wobbling. 3 pointing a stubby finger furiously. Bottom row: 4 attack wind-up, leaning back with the bell drawn wide. 5 the attack, a megaphone blast with rings of shockwave. 6 the follow-through, leaning far forward, the bell smoking, the tripod skidding, clearly different from pose 1.`,
  redpen: `Top row: 1 standing tall, the cape billowing. 2 the hit: slammed backward, the whole pen bent hard into a curve, eyes squeezed shut, mouth wide in a shout of pain, the nib bent, the cape blown up over its head, a huge burst of red ink spraying out of the barrel. 3 pointing the nib like a sword. Bottom row: 4 attack wind-up, the nib drawn back, the cape wrapped around. 5 the attack, a slashing strike leaving a big red ink streak. 6 the follow-through, crouched low after the slash, ink dripping from the nib, the cape settling, clearly different from pose 1.`,
  chairman: `The whole throne is in every one of the six poses, the same size, on the same ground line, with its carved gold feet resting on the ground, and the squirrel never leaves it. Top row: 1 seated smugly on the throne. 2 thrown back in the throne, the robe flying. 3 rising from the throne, one paw raised in a grand speech. Bottom row: 4 attack wind-up, cheeks puffed out huge. 5 the attack, hurling a volley of acorns. 6 the follow-through, still seated in the throne but leaning far forward over its arm, the tail swept up behind the throne, acorns scattering, clearly different from pose 1.`,
  unread: `Top row: 1 hovering open, the face glaring from the page. 2 reeling from a hit, pages scattering. 3 the pages rearing up like tentacles. Bottom row: 4 attack wind-up, the cover opening wide, pages rising. 5 the attack, the cover slamming shut in a burst of dust. 6 the follow-through, pages trailing, a finger pressed to lips in a shush, dust drifting, clearly different from pose 1.`,
  lastcall: `Top row: 1 standing on its spider legs, eyes squinting. 2 recoiling from a hit, flaps flying loose. 3 rearing up, showing its teeth. Bottom row: 4 attack wind-up, legs crouched, flaps rippling. 5 the attack, lunging forward, flaps whipping out. 6 the follow-through, skidding forward, flaps clattering, clearly different from pose 1.`,
  finalcall: `Top row: 1 standing on its robot legs, the screen calm. 2 rocked back from a hit, the screen flickering. 3 the screen glaring, the antenna sparking. Bottom row: 4 attack wind-up, leaning back, the flaps rattling. 5 the attack, a flurry of flaps whipping out. 6 the follow-through, stomping forward, the screen flashing DELAYED, clearly different from pose 1.`,
  gridlockprime: `Top row: 1 parked and idling, steam from the grille. 2 reeling from a hit, dented, the bumper rattling. 3 revving, wheels smoking. Bottom row: 4 attack wind-up, backing up low, lights flashing. 5 the attack, charging forward with a honk shockwave. 6 the follow-through, skidding sideways, smoke and skid marks, lights blazing, clearly different from pose 1.`,
  drillworm: `Top row: 1 rising from the pit. 2 recoiling from a hit, the hard hat flung loose, gravel flying. 3 rearing up high, the drill spinning. Bottom row: 4 attack wind-up, coiling down into the pit, the drill whirring. 5 the attack, bursting up with the drill spraying gravel. 6 the follow-through, leaning out over the rim, gravel raining, the drill slowing, clearly different from pose 1.`,
  warden: `Top row: 1 standing square and heavy, the halberd planted. 2 rocked back from a hit, the armor ringing. 3 raising the halberd high. Bottom row: 4 attack wind-up, the shoulder lowered for a charge. 5 the attack, a shoulder check slamming forward with a golden shockwave. 6 the follow-through, planting the halberd, standing firm and glowing, clearly different from pose 1.`,
  hush9final: `Top row: 1 standing, a white glove raised in a shush. 2 reeling from a hit, sparks flying. 3 the siren flaring, eyes glowing. Bottom row: 4 attack wind-up, leaning back, the speaker grille glowing. 5 the attack, rings of silence blasting from the grille. 6 the follow-through, rolling forward on its legs, light trails behind, clearly different from pose 1.`,
  marlowe16: `Top row: 1 standing with the clipboard, scowling. 2 reeling from a hit, amber cracks flaring. 3 raising the amber fist. Bottom row: 4 attack wind-up, drawing the fist back, the amber glow growing. 5 the attack, slamming the amber fist forward, amber light bursting and color draining away. 6 the follow-through, leaning forward, the fist smoking, cracked amber trails, clearly different from pose 1.`,
  twinlens: `Top row: 1 standing, both lenses calm. 2 recoiling from a hit, the lenses flickering. 3 both lenses locking on. Bottom row: 4 attack wind-up, the gear rings spinning, the lenses glowing brighter. 5 the attack, twin beams of blue and amber blasting. 6 the follow-through, the gears slowing, the light fading, the lenses refocusing, clearly different from pose 1.`,
  vance: `Top row: 1 standing tall. 2 stumbling back from a hit, the hat tilting. 3 raising the ray gun. Bottom row: 4 attack wind-up, aiming, the gun glowing. 5 the attack, firing a bright ray. 6 the follow-through, lowering the gun, smoke curling, the coat swirling, clearly different from pose 1.`,
  censor: `Top row: 1 standing very tall, the marker raised. 2 reeling from a hit, the redaction bar glitching. 3 stamping a returned envelope. Bottom row: 4 attack wind-up, the marker sweeping back. 5 the attack, a huge black bar slashing across the air. 6 the follow-through, envelopes flying back, bowing low, clearly different from pose 1.`,
  leviathan: `Top row: 1 coiled, the head raised. 2 recoiling from a hit, gears sparking. 3 the head rearing high. Bottom row: 4 attack wind-up, coiling back, the gears spinning faster. 5 the attack, the tail sweeping and the jaws biting forward. 6 the follow-through, uncoiling low, the gears slowing, clearly different from pose 1.`,
  julian: `Top row: 1 standing, the gun at his side, tired and soft. 2 flinching back, the hat tilting. 3 looking down at the pocket watch. Bottom row: 4 attack wind-up, slowly raising the ray gun, hesitating. 5 the attack, a warm burst of amber glass from the ray gun. 6 the follow-through, lowering the gun, looking away, the coat swirling, clearly different from pose 1.`,
  brainfreeze: `Top row: 1 standing, furious. 2 reeling from a hit, ice chips flying. 3 raising the crystal fists. Bottom row: 4 attack wind-up, inhaling, frost gathering at the lid. 5 the attack, a blast of frost breath. 6 the follow-through, slamming an icy fist down, frost spreading, clearly different from pose 1.`,
  mirrorball: `Top row: 1 hanging proud and glamorous, shawl swirling, a sly grin. 2 rocked back from a hit, one eye squeezed shut, feathers and sparkles flying. 3 striking a diva pose, one arm of feathers flung high, chin raised. Bottom row: 4 attack wind-up, spinning on its chain, the shawl whirling around it in a swirling ribbon. 5 the attack, a bright burst of light beams and mirror shards blasting out of its facets. 6 the follow-through, swinging low on the chain with arms spread wide, shimmering trails behind it, clearly different from pose 1.`,
  ironbelly: `Top row: 1 standing tall and imposing, flames flickering in the grate, smoke rising. 2 rocked back from a hit, chimney bent, eyes shut, sparks and soot flying. 3 rearing up, belly glowing red hot, glaring, smoke venting from the chimney. Bottom row: 4 attack wind-up, hunched, steam and soot bursting from its sides, belly white hot. 5 the attack, a huge blast of fire roaring from the mouth. 6 the follow-through, leaning forward and heaving, embers and smoke trailing, grate mouth glowing, clearly different from pose 1.`,
  acorncache: `Top left: sitting half buried in the leaves, shy, peeking out from under its cap. Top right: flinching, eyes squeezed shut, leaves and bits of acorn flying off. Bottom left: attack wind-up, squashed down low into the leaves, cap pressed down, cheeks puffed, determined face. Bottom right: the attack, the whole acorn leaping out of the leaves toward the right, high in the air, cap tilted back, fierce face, leaves and acorns scattering below it.`,
  irongill: `Top row: 1 standing heavy in the shallows, grim, whiskers drooping. 2 flinching, mouth open wide, whiskers flung back, water splashing up. 3 rearing up tall out of the water, head raised, one whisker lifted high. Bottom row: 4 attack wind-up, mouth open, whiskers lashing wildly around the head, a ball of water forming at the mouth. 5 the attack, a big jet of water spraying from the open mouth. 6 the follow-through, leaning low and forward after the spit, head tilted down, mouth still open and dripping, whiskers swinging, clearly different from pose 1.`,
  soggysock: `Top left: standing, drooping and weary, the top of the sock hanging over, mouth open. Top right: reeling from a hit, the whole sock bent far back and sideways, eyes squeezed shut, water flying off. Bottom left: attack wind-up, the sock stretched tall and twisted, the top raised high above its head, angry face, water dripping off. Bottom right: the attack, the top of the sock whipping forward and down in a big slap, angry face, water splashing out in front.`
};
function sheetShort(t, brushRef, id) {
  const m0 = MOVES[t.id], boss = m0.rank === 'BOSS', n = boss ? 6 : 4, cols = boss ? 3 : 2;
  const under = 'docs/reference/underpaint/' + t.id + '-grid.png';
  const has = fs.existsSync(under);
  const refs = has ? [KEY, under, brushRef] : [KEY, brushRef];
  const LIKENESS = { warden: [['docs/reference/boppy-face.png', 'tools/sprite-bake/src/boppy-hero.png'], "Paint Boppy's real face exactly as in attachment 4, a close-up of his face (and attachment 5, the full figure): the same weathered tan skin with deep smile lines and crow's feet, brown eyes, thick white-gray bushy mustache, white eyebrows, gray sideburns, long nose, warm closed-mouth smile. The helmet is open-faced with nothing covering his face, so his whole face shows clearly, large, at the same likeness and detail as attachment 4"] };
  if (LIKENESS[t.id]) refs.push(...LIKENESS[t.id][0]);
  if (t.id === 'julian') {
    const R = ['art/grands.webp'];
    const tx = `Paint one picture: a sheet of six full-figure poses of the same man, JULIAN VANCE, in a 3 by 2 grid (top row poses 1 to 3, bottom row poses 4 to 6), each pose facing right, as a hand-painted oil painting. Attachment 1 is a finished handbrushed painting of a room, shown ONLY so you copy its brushwork: thick visible brush strokes, layered paint, canvas grain, warm golden light, matte, crisp painted edges. Do not paint any room, floor, furniture or props from it.

THE MAN AND HIS PROPORTIONS (a painted caricature): a tall, thin man, 70 inches tall. Realistic face and realistic clothes, but a hugely oversized head, about 35 percent of his total height from the top of the hair to the chin (a little more than one third, so the body below the chin is only about 65 percent), set on a slim neck, narrow sloping shoulders, a slim torso, long thin legs, small hands and small feet. Like a caricature portrait of a real person: a big expressive realistic head on a slim body, never a big-eyed cartoon, never pixel art.
HIS FACE AND LOOK: a pale, lined, tired face with deep-set sad eyes and a gentle softened expression, long wavy gray hair falling past his collar under a black wide-brimmed hat that is never off. A long black wool coat with a standing collar and gold buttons falling to his knees, black waistcoat, white shirt, a red tie, a gold pocket watch on a chain, black boots. A brass ray gun with a glass barrel, held loosely. Warm gold light from the upper left, a soft gold rim light.

THE SIX POSES (same man, same scale, the same ground line under his boots in every pose, the whole figure from hat to boots visible and centered in its cell with a wide margin, nothing touching a cell edge):
1 STANCE: standing relaxed and tired, weight on one leg, the gun hanging at his right side, the other hand at his waist, head tipped slightly down, a sad half smile.
2 FLINCH: thrown back from a hit, the whole body leaning away, the hat tilting off his head, coat flaring, eyes squeezed shut, mouth open, the gun arm flung out.
3 LOOKING AT THE WATCH: standing still, holding the gold pocket watch open in his palm at chest height, head bowed over it, shoulders slumped, the gun hanging low.
4 WIND-UP: slowly raising the ray gun with both hands, one knee bent, hesitating, brows drawn together, the coat swinging behind him.
5 THE ATTACK: arm fully extended, firing the ray gun forward, the coat blown back, a warm burst of amber glass spraying from the muzzle, his face pained and reluctant.
6 FOLLOW-THROUGH: turning half away with the gun lowered to his side, head turned to look away, eyes downcast, the long coat swirling around his legs, clearly different from pose 1.

PAINTING: every surface painted with thick visible brush strokes that follow the form (wool coat, hair, skin, brass, boots), matte, canvas grain, no gloss, not a smooth digital render, not photorealistic, not pixel art, not a 3D render, no outlines. Background: one flat, solid, even magenta #FF00FF with no texture, no brush strokes, no gradient and no shadow tint, nothing else in the picture, no text, no labels.`;
    return { id, tab: 'Enemies', title: null, ar: '3:2', refs: R, prompt: tx };
  }
  const text = has
    ? `Repaint attachment 2 as a handbrushed painting. Keep the same ${n} poses in the same ${cols} by 2 layout, the same creature, shape and colors.${LIKENESS[t.id] ? ' ' + LIKENESS[t.id][1] + '.' : ''}${FLAIR[t.id] ? ' Make the forms grander and more dramatic, with more detail painted in the shapes: ' + FLAIR[t.id] + '.' : ''}${POSES[t.id] ? ' ' + POSES[t.id] : ''} Paint it like attachment 1 and finish it like attachment 3: matte, thick visible brush strokes on the creature, canvas grain, crisp painted edges, no gloss, not a smooth digital render. Attachment 2 is only a blurry guide, so paint every edge and texture fresh and sharp. ${TAIL}`
    : `Paint ${m0.name}, ${t.look}, as a handbrushed painting${FLAIR[t.id] ? ', grander and more dramatic, with more detail painted in the shapes: ' + FLAIR[t.id] + ',' : ','} in a ${cols} by 2 grid of ${n} poses facing right.${POSES[t.id] ? ' ' + POSES[t.id] : ' Poses: stance, flinch, attack wind-up, attack landing' + (boss ? ', and two more attack frames' : '') + '.'} Paint it like attachment 1 and finish it like attachment 2: matte, thick visible brush strokes on the creature, canvas grain, crisp painted edges, no gloss, not a smooth digital render. ${TAIL}`;
  return { id, tab: 'Enemies', title: null, ar: boss ? '3:2' : '1:1', refs, prompt: text };
}
function gridShort(id, brushRef) {
  const t = TABLE.find(x => x.id === id); const e = sheetShort(t, brushRef, 'test-grid-' + id + '-short');
  e.title = `Library test: ${MOVES[id].name} as a grid, short prompt`; return e;
}
function realSheet(t) {
  const m0 = MOVES[t.id], boss = m0.rank === 'BOSS', n = boss ? 6 : 4;
  const e = sheetShort(t, BRUSH_REF, 'enemy-' + t.id);
  e.title = `${m0.name}: ${boss ? 'boss ' : ''}sheet, ${n} frames facing right${fs.existsSync('docs/reference/underpaint/' + t.id + '-grid.png') ? '' : ' (no old likeness picture, built from the description)'}`; return e;
}
module.exports = { buildOne, entries: TABLE.map(t => realSheet(t)), gridShort,
  gridTest: (id, brushRef) => build(TABLE.find(t => t.id === id), true, brushRef) };
