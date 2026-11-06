// Amy (Tom's sister, 5'5", adult) ability and object sheets. Tom 2026-11-06 12:19: "make all of Amy's ability sheets".
// Her hero, walk sheet and two battle sheets (Tom supplied the battle sheets 2026-11-06 12:31) are the refs of every ability sheet.
// 14 moves = the p-key of each slot in data/abilities.js amy: block. No left/right words, no hurt wording, no weapons.
const R = 'art/raw/characters/';

const abilityHead = `Draw the character in the attached pictures as one battle move sheet.

Picture 1 is the character, Amy. Picture 2 is her walk sheet. Pictures 3 and 4 are her battle sheets. Copy them as exactly as possible in every frame: the same person, face, age, body, head size compared to the body, long brown hair, rust-colored tiered dress, cream sneakers, colors, painting style, level of detail, viewing angle and figure size as pictures 3 and 4. Only the pose and the object in the hands change.

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except when she is in the air), each figure well inside its cell, nothing touching a cell edge. Held objects are painted in the same style as the character. Draw only her, no other people. The dress and everything held stay clearly away from magenta and pink.

In every frame she faces the same way as in pictures 3 and 4, in the same three-quarter view, unless a frame says she looks at the viewer.`;

const fxHead = `Paint the objects and effects for one battle move as one sheet.

The attached picture is the character's sheet for this move. Copy every object she holds in it exactly: the same shape, colors, details, size compared to her hands, painting style and light. Paint every new object and effect in that same painted style.

One image, a grid of 4 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One item per cell, in the order of the list, filled row by row. Each item is centered, fills about 75 percent of its cell, and has clear magenta all around it; nothing touches a cell edge. Wide items fill the cell width, tall items fill the cell height. Cells with no item stay plain magenta.

No person, no hands, no body parts. No numbers, labels or captions. No words except lettering an item asks for.

Warm golden light from the upper left, soft painted shading, crisp clean edges, no thick black outlines, no cast shadow, no floor. Painted and realistic, not pixel art. Effects (splashes, glows, sparkles, smoke, ink, light) are painted as solid shapes with crisp edges, never faint haze, and never use magenta or pink.`;

// [slug, name, row1 (3), row2 (3), fx items]
const MOVES = [
  ['kettlebell-swing', 'Kettlebell Swing', [
    'Standing with her feet wide apart, both hands holding a big cast-iron kettlebell low between her knees, a focused stare.',
    'Swinging the kettlebell forward and up, both arms straight, leaning back a little, jaw set.',
    'The kettlebell at the top of its swing at shoulder height, both arms straight out, a fierce competitive grin.'], [
    'Letting the kettlebell drop back between her legs, hips pushed back, eyes straight ahead.',
    'Heaving the kettlebell forward with a strong step, mouth open in a short shout, eyes narrowed.',
    'Standing tall with the kettlebell hanging from one hand, a satisfied smirk.'], [
    'A big black cast-iron kettlebell with a thick handle, seen from the front.',
    'The same kettlebell tilted at an angle, as if swinging through the air.',
    'A curved white swoosh, the path of a heavy swing (wide).',
    'A big jagged impact burst, yellow and white.',
    'A small puff of grey dust.']],
  ['pep-talk', 'PEP TALK', [
    'Standing and clapping her hands together once in front of her chest, a big encouraging smile.',
    'One fist pumped up beside her shoulder, the other hand open and pointing forward, mouth open in a cheer.',
    'Both arms thrown wide open, chest out, a huge warm grin.'], [
    'Pointing straight ahead at someone with one arm, a proud determined face.',
    'Giving two thumbs up, one eye closed in a big wink.',
    'Both hands cupped around her mouth, leaning forward, cheering loudly.'], [
    'A bright golden starburst with soft rays.',
    'A wide ring of warm orange energy (wide).',
    'Three small golden sparkles rising upward (tall).',
    'A bold orange upward arrow, a boost.',
    'A set of curved sound wave arcs, loud and wide (wide).']],
  ['red-pen', 'Green Pen', [
    'Standing with a big green felt-tip pen in one hand and the other hand on her hip, tilting her head, studying something ahead.',
    'Pulling the cap off the green pen with her other hand, eyes narrowed in concentration.',
    'Drawing a big sweeping circle in the air with the pen, arm stretched out wide, focused.'], [
    'Tapping the pen firmly forward as if marking a page, eyebrows raised, very teacherly.',
    'Pointing the pen forward like a wand, a warm approving smile.',
    'Clicking the cap back on the pen, nodding, pleased.'], [
    'A big green felt-tip pen with the cap off, seen from the side (wide).',
    'The green pen cap, seen from the side.',
    'A big hand-drawn green circle, a thick marker loop (wide).',
    'A bold green check mark.',
    'A shiny gold foil star sticker.',
    'A small splatter of green ink dots.']],
  ['hot-lunch-tray', 'Hot Lunch Tray', [
    'Standing with a blue cafeteria tray held in both hands at waist height, a steaming bowl of soup on it, a careful focused look.',
    'Stepping forward holding the tray perfectly level, eyes on the bowl.',
    'Bending slightly and offering the tray forward with both arms, a gentle smile.'], [
    'Holding the tray in one hand and straightening the spoon on it with the other, a nurturing look.',
    'Holding the tray out, head tilted, mouth a little open as if saying eat up, kind eyes.',
    'Standing tall with the tray held at her side, a proud warm smile.'], [
    'A blue cafeteria tray with a steaming bowl of tomato soup, a spoon and a small roll, seen from the front (wide).',
    'A bowl of steaming tomato soup, seen from the front.',
    'A shiny metal spoon.',
    'A cluster of three curling steam shapes, solid and crisp (tall).',
    'A ring of soft golden light (wide).',
    'A small golden sparkle.']],
  ['goldstar-recess', 'Gold-Star Recess', [
    'Standing with a silver whistle on a red cord held up to her lips, cheeks puffed, eyes bright.',
    'One arm flung up high, the whistle dropped on its cord, eyes closed, a big grin.',
    'Both arms opened wide as if letting everyone run free, joyful.'], [
    'Peeling a gold foil star sticker off a sheet with her fingertips, delighted.',
    'Holding a gold star sticker out in front of her between two fingers, a warm smile.',
    'Holding the sheet of stickers up high with a proud, glowing smile.']
    , [
    'A silver whistle on a red cord.',
    'A big shiny gold foil star sticker.',
    'A sheet of shiny gold foil star stickers, a few peeled off.',
    'A small bouncy red rubber playground ball.',
    'A ring of soft golden light (wide).',
    'A small cluster of golden sparkles.',
    'A set of curved sound wave arcs (wide).']],
  ['inside-voices', 'Inside Voices!', [
    'Standing with one hand reaching up toward a light switch above her head, eyes on the room.',
    'Flicking the switch with one quick finger, a calm teacher face.',
    'Raising one hand high with the palm open, waiting, eyebrows raised.'], [
    'Clapping her hands together sharply in front of her chest, mouth closed, a stern look.',
    'One finger held to her lips, eyes wide, leaning forward in a shush.',
    'Standing with her hands folded in front of her, serene, one eyebrow raised.'], [
    'A white wall light switch plate with the switch up.',
    'The same white light switch plate with the switch down.',
    'A wide ring of pale blue shock lines (wide).',
    'A small white clap burst, crisp rays.',
    'A big round hush ring of soft blue light (wide).',
    'A small gold twinkle star.']],
  ['pop-quiz', 'Surprise Quiz', [
    'Standing with a stack of stapled test packets held against her chest, a crisp level stare.',
    'Flicking one packet out of the stack with her fingertips, a small smirk.',
    'Winding up with the packet held high in one hand, one eyebrow arched.'], [
    'Slamming the packet forward with a decisive swing, body turning, mouth open as if saying pencils up.',
    'Holding a yellow pencil out in one hand and pointing at the packet with the other, stern.',
    'Arms folded with the packet tucked under one arm, a small knowing smile.'], [
    'A stack of stapled white test packets, seen from the front.',
    'A single stapled test packet with a plain white cover, seen from the front.',
    'A yellow pencil with a pink eraser, seen from the side (wide).',
    'A flurry of loose white papers flying (wide).',
    'A white paper with a big A+ circled in green ink.',
    'A big jagged impact burst, yellow and white.']],
  ['detention-ult', 'Nobody Leaves', [
    'Standing with a brass school hand bell held down in one hand, the other hand lifted, calm.',
    'Ringing the hand bell high above her head, one arm stretched up, a serious face.',
    'Pointing one arm straight ahead at the room, the other hand on her hip, a hard teacher stare.'], [
    'Planted wide with both arms spread out as if blocking a doorway, chin lifted.',
    'Writing on a clipboard held in one hand, head down, eyes looking up at the viewer over it, flat and unimpressed.',
    'Arms folded, one foot tapping, a tight satisfied smile.'], [
    'A brass school hand bell with a wooden handle, seen from the side.',
    'A clipboard with a few papers and a yellow sticky note, seen from the front.',
    'A yellow sticky note with the words SEE ME written in neat black handwriting.',
    'A big closed wooden classroom door with a small window, seen from the front (tall).',
    'A round school wall clock showing a quarter past three.',
    'A wide ring of golden shock lines (wide).',
    'A set of curved sound wave arcs (wide).',
    'A small gold twinkle star.']],
  ['burpee-blitz', 'Burpee Blitz', [
    'Standing with her hands on her hips and her shoulders back, a sharp competitor stare.',
    'Crouched down with both palms flat on the ground, knees bent, focused.',
    'In a straight plank with her arms straight and her head up, jaw clenched.'], [
    'Hopping both feet in toward her hands into a deep squat, eyes forward.',
    'Leaping straight up with both arms stretched overhead, hair flying, a big shout.',
    'Landing with one fist pumped and a competitive grin.'], [
    'A wide ring of grey dust puffs (wide).',
    'A big jagged impact burst, yellow and white.',
    'Three short white speed lines (tall).',
    'A small golden spark burst.',
    'A small gust of grey dust.']],
  ['hill-repeats', 'Hill Repeats', [
    'Standing at the bottom of a slope leaning forward, hands loose, determined.',
    'Sprinting uphill leaning far forward, arms pumping, mouth set.',
    'Reaching the top of the hill with one fist raised high, taking a quick breath.'], [
    'Turning around at the top, bouncing on her toes, eyes sharp.',
    'Sprinting back down with long strides, arms out for balance, hair streaming back.',
    'Standing bent over with her hands on her knees, panting, a grin on her face.'], [
    'A steep grey asphalt hill slope seen from the side, with a white painted centre line (wide).',
    'A yellow diamond road sign with a black steep hill icon on a short post.',
    'A small orange traffic cone.',
    'A wide trail of dust puffs (wide).',
    'A small burst of impact stars.']],
  ['oat-milk-please', 'Almond Milk, Please', [
    'Standing with one palm held up in a polite no-thank-you gesture, eyes on something off to the side, a polite smile.',
    'Shaking her head with a small smile, both hands raised in a polite wave-off.',
    'Pulling an iced latte in a clear plastic cup with a green straw out from behind her back, pleased.'], [
    'Holding the iced latte out in one hand toward someone, a warm caring smile.',
    'Taking a small sip through the straw, eyes closed, content.',
    'Raising the latte high in a toast, a bright smile.'], [
    'A tall clear plastic cup of iced almond milk latte with a green straw and ice, seen from the front (tall).',
    'A closed cardboard pizza box with a red stripe, seen from the front.',
    'A white and blue cardboard milk carton, seen from the front.',
    'A small foil energy gel packet.',
    'A ring of soft green light (wide).',
    'A small golden sparkle.']],
  ['false-start', 'False Start', [
    'Standing tall with a stopwatch in one hand and a silver whistle in the other, watching something ahead.',
    'Raising the whistle to her lips, eyes narrowing at something ahead.',
    'Blowing the whistle, cheeks puffed, the other hand thrust out with the palm forward in a stop sign.'], [
    'Stepping forward and pointing straight ahead, one stern raised eyebrow, caught you.',
    'Arms folded across her chest, a smug raised eyebrow, the stopwatch held in one hand.',
    'Clicking the stopwatch with her thumb, a smug small grin.'], [
    'A round silver stopwatch with a black face and a red button, seen from the front.',
    'A silver whistle on a red cord.',
    'A white painted starting line stripe on a red running track (wide).',
    'A small red flag on a short pole.',
    'A set of curved sound wave arcs (wide).',
    'A big jagged impact burst, yellow and white.',
    'A small puff of grey dust.']],
  ['negative-split', 'Negative Split', [
    'Standing in an easy relaxed running pose, calm pace, breathing steady, a small smile.',
    'Jogging with small easy steps, arms swinging evenly, eyes ahead, steady.',
    'Running faster with longer strides, leaning forward.'], [
    'Running faster still, arms pumping hard, determined.',
    'Sprinting flat out, hair streaming straight back, fierce focus.',
    'Slowing to a stop with both fists raised above her head, a triumphant smile.']
    , [
    'A round silver stopwatch with a black face and a red button, seen from the front.',
    'A pale golden speed streak, a long swoosh (wide).',
    'A wide trail of dust puffs (wide).',
    'A short blue arrow and a longer orange arrow side by side, both pointing the same way (wide).',
    'A ring of warm orange glow (wide).',
    'A small golden sparkle.']],
  ['marathon-ult', 'Boston Qualifier', [
    'Standing with a paper race bib pinned to the front of her dress, both hands on her thighs, a hard focused look.',
    'Running steadily with arms pumping, eyes on something far ahead.',
    'Running while reaching one arm back with an open hand and looking back over her shoulder, calling someone on.'], [
    'Running with a big yell, one fist raised, hair streaming back.',
    'Breaking through a finish tape with her chest out and both arms thrown wide, mouth open in joy.',
    'Standing with a silver foil blanket over her shoulders and a gold medal on a ribbon around her neck, a tired happy smile, giving a thumbs up.']
    , [
    'A white finish tape stretched across, with a small pole at each end (wide).',
    'A paper race bib with the number 26.2 in big black numbers.',
    'A big gold medal on a blue ribbon.',
    'A crinkled silver foil blanket.',
    'A big finish line banner arch with the word FINISH in bold letters (wide).',
    'A burst of colorful paper confetti (wide).',
    'A round silver stopwatch with a black face and a red button, seen from the front.',
    'A ring of golden light (wide).']],
];

const entries = [];
const fmt = (a, o) => a.map((t, i) => (i + 1 + o) + '. ' + t).join('\n');
for (const [slug, name, r1, r2, fx] of MOVES) {
  entries.push({ id: 'amy-ab-' + slug, tab: 'Characters', group: 'Amy', title: 'Amy ability: ' + name + ' (6 frames; needs your two battle sheets)', ar: '3:2',
    refs: [R + 'amy-hero-ref-v1.png', R + 'amy-walk-sheet-v1.png', R + 'amy-battle-sheet-1-v1.png', R + 'amy-battle-sheet-2-v1.png'],
    prompt: abilityHead + '\n\nThe move: ' + name + '.\n\nRow 1:\n' + fmt(r1, 0) + '\n\nRow 2:\n' + fmt(r2, 3) });
  entries.push({ id: 'amy-fx-' + slug, tab: 'Characters', group: 'Amy', title: 'Amy objects and effects: ' + name + ' (' + fx.length + ' items; attaches the approved ' + name + ' sheet)', ar: '4:3',
    refs: [R + 'amy-ab-' + slug + '-v1.png'],
    prompt: fxHead + '\n\nThe move: ' + name + '.\n\nItems:\n' + fx.map((t, i) => (i + 1) + '. ' + t).join('\n') });
}
module.exports = { entries };
