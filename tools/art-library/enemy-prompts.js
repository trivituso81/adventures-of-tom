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
const TAIL = `Flat solid magenta #FF00FF background, nothing else in the picture, no text.`;
// Custom pose text for enemies whose four poses must be spelled out (Tom 11-05 16:10: the Soggy Sock came back with four near-identical poses).
const POSES = {
  irongill: `Top row: 1 standing heavy in the shallows, grim, whiskers drooping. 2 flinching, mouth open wide, whiskers flung back, water splashing up. 3 rearing up tall out of the water, head raised, one whisker lifted high. Bottom row: 4 attack wind-up, mouth open, whiskers lashing wildly around the head, a ball of water forming at the mouth. 5 the attack, a big jet of water spraying from the open mouth. 6 the follow-through, leaning low and forward after the spit, head tilted down, mouth still open and dripping, whiskers swinging, clearly different from pose 1.`,
  soggysock: `Top left: standing, drooping and weary, the top of the sock hanging over, mouth open. Top right: reeling from a hit, the whole sock bent far back and sideways, eyes squeezed shut, water flying off. Bottom left: attack wind-up, the sock stretched tall and twisted, the top raised high above its head, angry face, water dripping off. Bottom right: the attack, the top of the sock whipping forward and down in a big slap, angry face, water splashing out in front.`
};
function sheetShort(t, brushRef, id) {
  const m0 = MOVES[t.id], boss = m0.rank === 'BOSS', n = boss ? 6 : 4, cols = boss ? 3 : 2;
  const under = 'docs/reference/underpaint/' + t.id + '-grid.png';
  const has = fs.existsSync(under);
  const refs = has ? [KEY, under, brushRef] : [KEY, brushRef];
  const text = has
    ? `Repaint attachment 2 as a handbrushed painting. Keep the same ${n} poses in the same ${cols} by 2 layout, the same creature, shape and colors.${POSES[t.id] ? ' ' + POSES[t.id] : ''} Paint it like attachment 1 and finish it like attachment 3: matte, thick visible brush strokes, canvas grain, crisp painted edges, no gloss. Attachment 2 is only a blurry guide, so paint every edge and texture fresh and sharp. ${TAIL}`
    : `Paint ${m0.name}, ${t.look}, as a handbrushed painting in a ${cols} by 2 grid of ${n} poses facing right: stance, flinch, attack wind-up, attack landing${boss ? ', and two more attack frames' : ''}. Paint it like attachment 1 and finish it like attachment 2: matte, thick visible brush strokes, canvas grain, crisp painted edges, no gloss. ${TAIL}`;
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
