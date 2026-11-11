// Boss ending sheets for the Art Library (bossend2, Tom 2026-11-11: "propose a visually stunning ending for each boss, im glad to
// create additional animation frames"). One sheet per boss, tab Enemies, group "Boss endings", id ending-<monster id>. Spec: docs/BOSS_ENDINGS.md.
// Each sheet is NEW poses of the boss the game already shows, so the only pictures attached are the paint-finish picture every
// approved enemy sheet uses (enemy-mudling-v2) and that boss's own installed sheet. Pose 1 is always the calm version of the boss's
// stance, painted at the same size: the bake uses it as the size anchor for the whole sheet, and the after scene uses it while the boss talks.
// Rules that shaped the wording: no painted words (the game draws HERE, ON TIME, DELIVERED itself, and frames may be mirrored), no
// effects unless a pose names them (the game draws splashes, light and particles), nothing a held story item would cover (the game draws
// Deedee's tin, Boppy's jar, the coin, the boarding pass, the peel, the compact and the wings on an open hand).
// Merge into data/art-prompts.json with: node tools/art-library/ending-prompts.js --merge   (adds missing entries, refreshes the prompt of
// entries still in draft, never touches an approved one).
const fs = require('fs');
const FINISH = 'Paint and finish it like attachment 1: matte, thick visible brush strokes on the figure, canvas grain, crisp painted edges, no gloss, not a smooth digital render.';
const BG = 'Background: one flat, solid, even magenta #FF00FF with no texture, no brush strokes and no gradient, nothing else in the picture, no text.';
const MUD = 'art/raw/enemies/enemy-mudling-v2.png';
const sheet = f => 'art/raw/enemies/enemy-' + f;

// what: "the creature" or "the man"; poses: 6 (3 by 2) or 4 (2 by 2); extra: one optional sentence of likeness notes.
function build(name, what, poses, extra) {
  const six = poses.length === 6;
  const row = (a, b) => poses.slice(a, b).map((p, i) => (a + i + 1) + ' ' + p).join(' ');
  return `Paint a new sheet of ${name}, ${what} in attachment 2, as a handbrushed painting. Attachment 2 is the current painting of ${what === 'the man' ? 'him' : 'it'} in the game: paint the same ${what === 'the man' ? 'man' : 'creature'}, with the same shape, colors, materials and details, at the same size in each cell, in the same view, facing right. Do not repeat the poses of attachment 2. Paint ${poses.length} NEW poses in a ${six ? '3 by 2' : '2 by 2'} layout, one pose alone in each cell with clear magenta all around it and nothing crossing into another cell. These poses show the moment after the fight, when the anger has gone out: the mood is gentle, warm and a little funny, never fierce.${extra ? ' ' + extra : ''} Top row: ${row(0, six ? 3 : 2)} Bottom row: ${row(six ? 3 : 2, poses.length)} Paint only what each pose names: no glows, speed lines, sparkles or splashes unless a pose asks for them, and no letters, numbers or words anywhere. ${FINISH} ${BG}`;
}
const CALM = 'the same upright pose as the first pose of attachment 2, at exactly the same size, but calm:';

const BOSSES = [
  { id: 'bigone', file: 'bigone-v2.png', title: 'The Big One', what: 'the creature', poses: [
    `${CALM} sitting on its flat tail, the big eyes soft and half closed, the mouth shut in a small shy smile, the rusty pie tin still on its head.`,
    'a huge belly laugh: head thrown back, eyes squeezed shut, mouth wide open, both flippers on its round belly, a few water drops flying off.',
    'offering: leaning forward with both flippers held out together in front, palms up and empty, as if handing something over, a sheepish sideways smile.',
    'waving goodbye: half turned away, one flipper raised high in a wave, looking back over its shoulder with a warm smile.',
    'the belly flop: the whole body in mid air and stretched out flat, belly down, flippers spread wide, tail up, eyes wide with joy, the pie tin still on.',
    'only the top of its head above water: the rusty pie tin, the wet green weeds and the two big contented eyes, with one small ring of water around it and nothing below.'] },
  { id: 'bigshake', file: 'bigshake-v3.png', title: 'The Big Shake', what: 'the creature', extra: 'In every pose the cracks in the rock are dark and cool, with no orange glow and no flying sparks.', poses: [
    `${CALM} the heavy brow relaxed, the eyes soft, the mouth a flat gentle line, the loose rocks resting on its shoulders instead of flying.`,
    'touched: the eyes wide and round, the mouth a small surprised o, two or three pebbles hovering still beside its head.',
    'an enormous yawn: eyes shut tight, mouth open as wide as a cave, the loose rocks drooping.',
    'half sunk: the lower half of the body sunk into a low mound of loose dirt, the eyes sleepy and half shut, a small smile.',
    'nearly under: only the top of the head and the brow above the dirt, one eye closed and one eye peeking.',
    'a low rounded heap of the same rocks lying flush with the ground, no face at all, with one small white wildflower growing on top.'] },
  { id: 'irongill', file: 'irongill-v3.png', title: 'Old Iron-Gill', what: 'the creature', poses: [
    `${CALM} floating low in its patch of muddy water, the orange eyes soft, the wide mouth closed in a slight smile, the rope whiskers hanging loose.`,
    'giving something back: the head tilted up and the huge mouth open wide and empty, pushed forward, as if letting something slide out, the eyes kind.',
    'the leap, rising: the WHOLE fish out of the water for the first time, body and tail, arcing up and to the right, water streaming off the armored plates.',
    'the top of the leap: the whole fish level in mid air in clean side view, tail flicked up, whiskers streaming back, the eyes bright and joyful, a rim of gold light along its back.',
    'the dive: nose down and half under, the tail high in the air, a crown of splashing water around it.',
    'only the tail fin above a ring of ripples, tilted as if waving goodbye.'] },
  { id: 'directorscut', file: 'directorscut-v4.png', title: 'The Director’s Cut', what: 'the creature', poses: [
    `${CALM} the golden megaphone tipped slightly down on its wooden tripod, the eyes soft, the mouth closed in a small smile, the white gloves folded together.`,
    'moved: one glove pressed to the side of the horn like a hand on a heart, the eyes wide and shining, the mouth wobbling.',
    'a deep theatrical bow: the horn tipped far forward on the tripod, the eyes closed, one arm swept out wide to the side.',
    'calling it a wrap: standing tall, one glove cupped beside the horn and the other raised high, the eyes closed in a happy shout, no sound lines.',
    'hopping away: the three tripod legs folded together like one leg, the whole thing in mid hop off the ground, tilted forward, the arms swinging.',
    'rolling away: the megaphone lying on its side off the tripod and rolling like a wheel, the eyes dizzy and pleased, the folded tripod tucked under one arm.'] },
  { id: 'redpen', file: 'redpen-v3.png', title: 'The Red Pen', what: 'the creature', poses: [
    `${CALM} standing straight up on its gold nib, the red ink cape hanging still, the eyes soft, the white gloves clasped in front.`,
    'touched: the eyes wide and shining, one glove raised to its cap, the cape drooping.',
    'the flourish: one arm swept high overhead as if finishing a big stroke in the air, leaning into it with joy, the eyes closed in a smile, the cape swirling. Do not paint the stroke itself.',
    'clicked shut: the gold nib tucked away inside the barrel so the bottom end is smooth and round, the cape wrapped once around it like a scarf, the eyes content, the hands at its sides.',
    'the hop: shut as in pose 4, in mid hop off the ground and tilted forward, the cape fluttering behind.',
    'the last look: shut as in pose 4, landed and slightly squashed, turned to look back, one glove waving over its shoulder.'] },
  { id: 'chairman', file: 'chairman-v3.png', title: 'Chairman Cheeks', what: 'the creature', poses: [
    `${CALM} seated on the gilded red throne, the paws folded on his belly, the eyes soft behind the monocle, a small smile.`,
    'the gavel: standing up on the throne seat, banging a single acorn down on the armrest like a gavel, the chin lifted.',
    'the tie: standing on the ground with no throne in the cell, straightening his red tie with both paws, the top hat tipped forward, the robe slipping off his shoulders.',
    'the farewell: standing on the ground with no throne, lifting the top hat high in one paw, the bushy tail up, a gracious smile.',
    'the leap: in mid air with arms and legs spread wide like a flying squirrel, the red robe streaming behind like a cape, one paw holding the hat on.',
    'the empty throne alone, with nobody in it, the red robe with its white fur trim draped over one arm of the chair.'] },
  { id: 'unread', file: 'unread-v2.png', title: 'The Unread', what: 'the creature', extra: 'No pages fly loose in any pose.', poses: [
    `${CALM} the old leather book half closed, the eyes soft, the jagged page teeth closed into one gentle line, the pages lying flat.`,
    'delighted: wide open, the eyes huge and sparkling, the pages lifted on both sides like two raised arms.',
    'fanning: the pages spread in one full arc like a peacock tail, the eyes closed in happiness.',
    'closing: the covers three quarters shut, the eyes drowsy, a red ribbon bookmark hanging out of the bottom.',
    'closed and content: lying flat with the brass clasps fastened, the eyes closed and a small smile on the cover, the red ribbon bookmark hanging out.',
    'just a book: the same closed book lying flat with the clasps fastened and no face at all, a handsome old volume with the red ribbon bookmark.'] },
  { id: 'ironbelly', file: 'ironbelly-v2.png', title: 'Old Ironbelly', what: 'the creature', extra: 'In every pose the fire behind her grate is low and deep gold, never roaring orange, and no flames come out of her.', poses: [
    `${CALM} standing square on her short legs, the eyes soft, the grate mouth a gentle closed smile with a low gold glow behind it, one thin wisp of white smoke from the chimney.`,
    'astonished: the eyes wide, the grate a small open o, leaning back a little, both stubby arms up.',
    'looking up: the head tilted back, the eyes following something drifting up above her, the grate slightly open, the arms loose.',
    'settled: the eyes closed in deep contentment, the grate glowing warm gold, small round puffs of white smoke rising evenly.',
    'baking: proud, fists on hips, the grate shut tight with warm light at its seams, the chimney puffing merrily.',
    'giving: one arm held out forward with the hand open and empty, palm up, the eyes kind.'] },
  { id: 'mirrorball', file: 'mirrorball-v4.png', title: 'The Mirrorball', what: 'the creature', poses: [
    `${CALM} hanging still on her chain, the feather shawl settled, the eyes soft with a wistful smile.`,
    'touched: the eyes wide and wet, one feather hand lifted to her cheek.',
    'the slow turn: turned three quarters away, the eyes closed, the shawl trailing gently behind, the mirror facets catching soft light.',
    'letting go: both feather arms opened upward, the face tilted up, the eyes closed and serene, every facet bright.',
    'moonlit: the facets pale pearl instead of silver, the eyes half open, a peaceful smile, the feathers at rest.',
    'giving: one feather hand held out forward, open and empty, palm up, a fond smile.'] },
  { id: 'lastcall', file: 'lastcall-v1.png', title: 'The Last Call', what: 'the creature', extra: 'The dark face panel never shows teeth in these poses.', poses: [
    `${CALM} standing level on its jointed legs, the two glowing eyes soft and rounded, the mouth a small flat gentle line, every flap still.`,
    'answered: the eyes wide and round, the mouth a small open o, the two horns on top perked up.',
    'the ripple: the square flaps of the face caught in the middle of flipping over in a wave from top to bottom, the eyes half hidden by turning flaps, the body braced.',
    'the blank board: the face panel completely dark, flat and empty except for two small soft eyes near its top edge, the body standing proud.',
    'giving: one front arm stretched forward with the claw open and empty, palm up, the eyes kind.',
    'settled: the legs folded underneath so it sits low on the ground, the eyes closed in two happy arcs, the panel glowing warm.'] },
  { id: 'finalcall', file: 'finalcall-v1.png', title: 'FINAL CALL', what: 'the creature', extra: 'The screen shows only plain gold bars, never letters.', poses: [
    `${CALM} standing on its two booted legs, the eyes soft, the gold bars on the screen glowing steady, the bulb on its antenna a warm gold.`,
    'disbelief: leaning forward, the eyes huge, the antenna standing straight up.',
    'the ticket: a small cream paper ticket tucked into the top corner of its frame like a card in a hat band, the eyes rolled up to look at it, delighted.',
    'walking: in mid stride to the right, the ticket still tucked in its frame, the eyes forward and bright, the bulb shining.',
    'walking away, seen from behind: the plain back of the casing with a small vent, in mid stride, the antenna bobbing.',
    'the look back: seen from behind and twisted at the waist to look over its shoulder, one eye showing, the antenna tipped like a wave.'] },
  { id: 'gridlockprime', file: 'gridlockprime-v1.png', title: 'Gridlock Prime', what: 'the creature', extra: 'In every pose all three lamps of the traffic light on its roof glow green, and the daisy is still there.', poses: [
    `${CALM} parked and still, the windshield eyes soft, a small smile on the grille, no dust.`,
    'amazed: the eyes rolled up to stare at its own green lights, the grille open in wonder.',
    'signalling: one orange turn light glowing at its front corner, the eyes forward and eager, the wheels just starting to roll, a little dust.',
    'driving: clean side view at speed to the right, leaning forward, the eyes joyful, a trail of dust behind.',
    'driving away, seen from behind: the back of the bus with two red tail lights, the daisy bobbing on the roof.',
    'the goodbye: pulled up and looking back, one headlight closed in a wink, a wide grin on the grille.'] },
  { id: 'drillworm', file: 'drillworm-v1.png', title: 'the Dual-Coast Drill Worm', what: 'the creature', extra: 'The drill nose is still in every pose, with no spin lines and no flying dirt.', poses: [
    `${CALM} upright in its mound of dirt, the eyes soft, a small smile, the hard hat straight.`,
    'relief: the eyes closed in a long breath out, the whole body sagging, the hard hat tipped back.',
    'winding down: drooping forward with heavy eyelids, the tip of the drill resting on the dirt.',
    'looking up, sorry: the eyes turned up toward the ceiling, a sheepish wince.',
    'curling up: the long body bending round on the mound like a cat settling down, the eyes nearly shut.',
    'asleep: fully coiled in a ring, the hard hat pulled down over its eyes, the head lamp off, the drill tucked under its own tail.'] },
  { id: 'warden', file: 'warden-v2.png', title: 'Warden Boppy', what: 'the man', refs: ['docs/reference/boppy-face-v2.png', 'art/raw/characters/boppy-hero-v1.png'],
    extra: 'He is Boppy, a grandfather: paint his real face exactly as in attachment 3, a close-up of his face, and his everyday clothes, where they show, exactly as in attachment 4, his full figure. The helmet is open faced, so his whole face shows clearly in every pose that has him in it.', poses: [
    `${CALM} standing in the full gold armor with the halberd lowered at his side, blinking, a puzzled gentle face.`,
    'the gold starts to run: the crest of the helmet and the shoulder plates softening and dripping like warm candle wax, while he stares at his own dripping glove.',
    'half melted: the armor sagging and running down in long gold drips, the chest plate sliding low, his everyday clothes showing at the shoulders and arms, the halberd drooping like a soft candle.',
    'only the helmet left: his everyday clothes from the neck down, a shining pool of gold around his shoes, the gold helmet still on his head, one hand pressed to the small of his back with a wince.',
    'the pool of melted gold alone on the ground, round and shining, with nobody in the cell.',
    'the gold helmet alone, lying on its side, with nobody in the cell.'] },
  { id: 'hush9final', file: 'hush9final-v1.png', title: 'HUSH-9', what: 'the creature', extra: 'The white glove is never held up to its face in these poses.', poses: [
    `${CALM} the white glove lowered to its side, the blue screen eyes soft and round, the speaker grille quiet.`,
    'the crack: a small door open in its chest, the head tipped down to look in, a tiny gray chip inside split in two by one thin bright line.',
    'puzzled: the head tilted, one screen eye bigger than the other, one glove scratching its roof beside the siren.',
    'laughing: tipped back with both gloves on its belly, the screen eyes two happy arcs, the gold horn on top raised.',
    'seated: sitting on a plain wooden dining chair with its short legs dangling, the gloves on its knees, the eyes content.',
    'at dinner: seated on the same chair, holding a white plate in both gloves and looking down at it with wonder.'] },
  { id: 'marlowe16', file: 'marlowe16-v1.png', title: 'Marlowe', what: 'the man', extra: 'No amber or orange glow anywhere on him: both hands are ordinary hands.', poses: [
    `${CALM} standing spent, the clipboard hanging at his side, the eyes down.`,
    'the hand: holding one ordinary open hand up in front of his face and staring at it, lost.',
    'head down: the shoulders slumped and both arms hanging, the clipboard lying on the ground at his feet.',
    'kneeling: down on one knee with one hand flat on the ground, the head bowed.'] },
  { id: 'twinlens', file: 'twinlens-v1.png', title: 'the Archivist’s Twin Lenses', what: 'the creature', extra: 'The two round lenses are its eyes, one blue and one amber, and thin brass shutters work as its eyelids. No beams come out of them.', poses: [
    `${CALM} both lenses half covered by their brass shutters like heavy eyelids, the little red jewel between them dim.`,
    'the crack: one clean crack right across the amber lens with soft gold light leaking through it, the blue lens wide open in surprise.',
    'going dark: the shutter of the blue lens closing, the cracked amber lens dim.',
    'looking down: both lenses tilted down toward the floor, humble, the shutters low.',
    'looking up: both lenses tilted upward with the shutters open and soft, a small warm glow in the red jewel.',
    'asleep: both shutters fully closed like sleeping eyes, the antenna drooping, the jewel dark.'] },
  { id: 'censor', file: 'censor-v1.png', title: 'the Oblivion Censor', what: 'the man', extra: 'In attachment 2 a black covering hides his whole face. Under it he is a small, pale, tired clerk with kind sad eyes, gray stubble and ink stains on his cuffs.', poses: [
    `${CALM} the black covering still over his face, the arm with the ink brush lowered, the letters held loosely, the head tilted, the white eyes soft.`,
    'lowering the stamp: the covering still on, a wooden rubber stamp hanging in his lowered hand, the shoulders dropped.',
    'half shown: the black covering slid halfway to one side, showing half of the pale tired face and one human eye.',
    'shown: the whole tired face visible with a small weary smile, the cap crooked, the black covering hanging loose at his collar like an untied scarf.',
    'the pretzel: the face visible, holding one big soft pretzel carefully in both hands as if it were made of glass, the letters tucked under one arm.',
    'the stamp: the face visible, pressing the wooden rubber stamp down onto a paper napkin held flat on his other palm, the tip of his tongue showing in concentration. The napkin is blank.'] },
  { id: 'leviathan', file: 'leviathan-v1.png', title: 'the Chronos-Leviathan', what: 'the creature', extra: 'It never roars in these poses: the jaws are closed.', poses: [
    `${CALM} coiled as before with the head lowered, the eyes soft and sad, the hands of the clock on its chest still.`,
    'loosening: the two big shoulder gears lifted a little way off the body and hanging free beside it, the coils slack, the eyes closing.',
    'coming apart: the long body separated into its segments with clear gaps between them, each still in place, the head whole, a few small gears drifting just outside.',
    'nearly apart: only the head and the round clock face still joined, the rest a loose ring of separate gears and gold segments around them.',
    'the round clock face alone, with a few small gears close around it.',
    'six separate gold gears of different sizes, spaced well apart from each other, each one whole, and nothing else in the cell.'] },
  { id: 'julian', file: 'julian-v3.png', title: 'Julian Vance', what: 'the man', extra: 'He has no ray gun in any pose. In poses 1 to 5 he sits in the same worn green armchair, painted with him, seen from the same three-quarter view.', poses: [
    'seated in the armchair in his long black coat, the black hat held in both hands on his knees, the head bowed, the long gray hair falling forward.',
    'seated, the hat on one knee, both hands held up in front of him and plainly trembling, staring at them.',
    'seated in a soft knitted cardigan instead of the coat, a yellow tennis ball in his lap and a small plate of fruit crisp on the arm of the chair, the eyes down.',
    'the same as pose 3 with the head lifted, the eyes wet, the mouth a little open.',
    'the same as pose 3, letting go: the eyes closed in one long breath out, the shoulders dropped, the hands open on the arms of the chair, the gold pocket watch hanging from one open hand by its chain.',
    'standing beside the empty armchair in the cardigan, the hat in one hand, a small uncertain smile.'] },
  { id: 'brainfreeze', file: 'brainfreeze-v1.png', title: 'Brain Freeze', what: 'the creature', poses: [
    `${CALM} the ice fists lowered, the eyes soft, the mouth closed and small with no teeth showing.`,
    'the lid: the frosted lid on top lifted open with warm gold light and a little cold mist coming out, a neat row of colorful ice cream scoops just visible inside, the eyes looking up shyly.',
    'hopeful: both ice fists together under its chin, the eyes big and round, a tiny open smile.',
    'off to the party: in mid stride to the right with a clear block of ice tucked under one arm, a happy grin.'] },
];

const entries = BOSSES.map(b => ({
  id: 'ending-' + b.id, tab: 'Enemies', group: 'Boss endings',
  title: `${b.title.replace(/^the /, 'The ')}: ending sheet, ${b.poses.length} frames facing right (after the fight)`,
  ar: b.poses.length === 6 ? '3:2' : '1:1',
  refs: [MUD, sheet(b.file)].concat(b.refs || []),
  prompt: build(b.title, b.what, b.poses, b.extra),
}));

// Chapter 9: Tom and Deedee sway under the Mirrorball. Two people, so this one is a Characters sheet built from their own pictures.
entries.push({
  id: 'ending-sway-tom-deedee', tab: 'Characters', group: 'Boss endings',
  title: 'Tom and Deedee: slow dance under the Mirrorball, 4 frames (chapter 9 ending)',
  ar: '1:1',
  refs: ['art/raw/characters/tom-hero-v2.png', 'art/raw/characters/tom-walking-sheet-v3.png', 'art/raw/characters/deedee-hero-v1.png', 'art/raw/characters/deedee-walking-sheet-v2.png'],
  prompt: `Draw the two characters in the attached pictures together as one pose sheet.

Pictures 1 and 2 are Tom: the character and his walk sheet. Pictures 3 and 4 are Deedee, his mother: the character and her walk sheet. Copy both as exactly as possible in every frame: the same people, faces, ages, bodies, head size compared to the body, hair, clothes, colors, painting style, level of detail and figure size as the walk sheets in pictures 2 and 4. Tom is 5 feet 11 inches tall and Deedee is 5 feet 5 inches: keep that difference in every frame. Only the poses change.

One image, a grid of 2 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. Each cell holds the two of them together as one pair, the same size in every cell, feet on the same ground line, well inside the cell. They are seen from the front in a three-quarter view, the same angle as the frames of the walk sheets that face the viewer. No floor, no shadows, no props, no text.

The moment: a mother and her grown son slow dancing. It is tender and a little funny, because he mostly sways.

Row 1:
1. Deedee holds out one hand to him with a bright expectant smile. Tom looks at the hand, calm and a little reluctant, his arms at his sides.
2. The hold: her hand in his, his other hand lightly at her back, her other hand on his shoulder. Tom stands very straight and stiff. Deedee beams up at him.

Row 2:
3. The sway, leaning together to the left: the same hold, both of them tilted a little to the left, Deedee's eyes closed and smiling, Tom looking down at her with a small real smile.
4. The sway, leaning together to the right: the same hold, both tilted a little to the right, her cheek resting against his chest, his chin just above her hair, his eyes closed.

Deliver the image itself.`,
});

module.exports = { entries, BOSSES };

if (require.main === module && process.argv.includes('--merge')) {
  const P = 'data/art-prompts.json', doc = JSON.parse(fs.readFileSync(P, 'utf8'));
  let added = 0, refreshed = 0;
  for (const e of entries) {
    const old = doc.entries.find(x => x.id === e.id);
    if (!old) { doc.entries.push({ status: 'draft', versions: [], rejects: [], ...e }); added++; }
    else if (old.status === 'draft' && !(old.versions || []).length) { Object.assign(old, e); refreshed++; }
  }
  fs.writeFileSync(P, JSON.stringify(doc, null, 1) + '\n');
  console.log('ending-prompts: added ' + added + ', refreshed ' + refreshed + ', total ' + doc.entries.length);
}
