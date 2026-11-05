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

function build(t) {
  const m0 = MOVES[t.id]; if (!m0) throw new Error('no moves for ' + t.id);
  const m = { ...m0, name: m0.name.replace(/sprite/i, 'Imp') }; // the word sprite pulls the generator toward pixel art
  const realName = m0.name;
  const boss = m.rank === 'BOSS';
  const likeRef = 'tools/sprite-bake/src/foe-' + t.id + '-v1.png';
  const hasLike = fs.existsSync(likeRef);
  const areaRef = AREA_PAINTING[t.area];
  if (areaRef && !fs.existsSync(areaRef)) throw new Error('missing area painting ' + areaRef);
  const refs = [KEY].concat(areaRef ? [areaRef] : [], hasLike ? [likeRef] : []);
  const likeNo = areaRef ? 3 : 2;
  const sig = m.acts.length ? m.acts[m.acts.length - 1] : 'its attack';
  const cell = boss ? 384 : 256, n = boss ? 6 : 4;
  const px = Math.round(t.inches * 5);
  const frames = boss
    ? ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK 1: the wind-up for its signature attack, ${sig}.`, 'ATTACK 2: the attack building, bigger and more intense.', 'ATTACK 3: the attack landing at full force.', 'ATTACK 4: the follow-through, settling back.']
    : ['STANCE: battle stance, idle and ready, weight settled.', 'FLINCH: startled by a hit, recoiling a little, eyes shut or squinting.', `ATTACK A: the wind-up for its signature attack, ${sig}.`, 'ATTACK B: the attack landing.'];
  const areaAtt = areaRef ? `2. The AREA PAINTING of ${AREAS[t.area]}: the place ${m.name} lives and fights. Use it for the creature's world: its color palette, the color of its light and shadows, the dense handbrushed paint texture and the mood. Paint ${m.name} as a resident of this same picture, by the same hand: the warm key light stays at the upper left as described below, tinted by the area's light on its lit side, with the area's shadow colors in its shaded side, and its materials (moss, wood, brick, brass, glass, mud, cloth) painted brush stroke by brush stroke the way this painting paints them. Do not copy this painting's layout, buildings or props into the sheet.` : '';
  const likeAtt = hasLike ? `${likeNo}. A LIKENESS picture of ${m.name} drawn in an older style. Use it for the creature's SHAPE, face, expression, colors and details ONLY. Do not copy how it is rendered: it is blocky and flat, and the new sheet must not be. Redraw ${m.name} from scratch, handbrushed and painted, keeping the same character.` : '';
  const att = [`1. The STYLE KEY, a finished painting of the family in a school yard. This is the painting style to match exactly: dense, jewel-toned painted texture, fine visible brushwork, deep saturated colors, warm light.`, areaAtt, likeAtt].filter(Boolean).join('\n');
  const text = `IMAGE REQUEST: ONE SINGLE ENEMY SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The battle sheet of the enemy ${m.name.toUpperCase()} (${boss ? 'a BOSS' : 'a regular enemy'}, level ${m.level}) for "The Adventures of Tom", a family role-playing game: ${n} poses of the same character in a single row. The game puts it in front of a painted background of ${AREAS[t.area]}, so its colors and handbrushed painted texture should feel at home there${areaRef ? ', painted in the same way as the area painting' : ''}, but it must still stand out clearly against it.

ATTACHED IMAGES (in this order)
${att}

${artNote(!!areaRef)}

${style(!!areaRef)}

THE CREATURE
${m.name.toUpperCase()}: ${t.look}. It is about ${t.inches} inches tall (${(t.inches / 12).toFixed(1).replace('.0', '')} feet), measured from its base or feet to the top of its highest point. For comparison, the smallest enemy in the game, the Mudling, is 16 inches tall.${boss ? ' It is a boss, so it is large, imposing and extra detailed, but still funny and friendly-scary.' : ''}

THE SHEET (strict)
- A single horizontal row of ${n} equal square cells, ${cell} x ${cell} pixels each, so the full image is ${cell * n} x ${cell} pixels. If your tool cannot make that exact shape, keep exactly ${n} cells in one row and make the image as wide as it allows.
- Exactly ${n} frames, one per cell, from left to right, in the numbered order below.
- ${m.name.toUpperCase()} FACES RIGHT in every frame (toward the right side of the image), as if facing the family on the right of a battle screen. Seen from the side or three quarters, slightly from above.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on the creature. No magenta glow, spill, tint or fringe on its edges. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Same scale in every cell: the standing creature is about ${px} pixels tall in its cell, and stays that size in every frame (a crouched or stretched pose may vary its height by at most 15 percent). Its base or feet rest on one horizontal line about 16 pixels above the cell bottom, with a small soft contact shadow directly under it. Center each pose in its cell with at least 10 percent margin; nothing touches a cell edge or overlaps a neighbour.
- Draw ONLY ${m.name.toUpperCase()}. No effects, motion lines, sparkles, other characters, props that are not part of it, text or word balloons.
- The same colors, details and level of painted detail in every frame.

THE ${n} FRAMES
${frames.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Family friendly for ages 6 and up. Keep the flinch frame comic, never grim.

NEVER substitute. Do not add extra frames, merge two frames or repeat a pose. If anything is unclear, draw ${m.name.toUpperCase()} in the pose described, facing right, with the shape and colors of the likeness${hasLike ? ' in attachment ' + likeNo : ' described above'}.`;
  return { id: 'enemy-' + t.id, tab: 'Enemies', title: `${realName}: ${boss ? 'boss ' : ''}sheet, ${n} frames facing right${hasLike ? '' : ' (no old likeness picture, built from the description)'}`, ar: '16:9', refs, prompt: text };
}
module.exports = { entries: TABLE.map(build) };
