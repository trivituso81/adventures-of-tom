// Characters tab (Tom 2026-11-05 23:24 and 23:46): one 3 x 2 sheet per ability. Every ability sheet attaches the hero picture,
// the walk sheet and both battle sheets. Tom sends all four pictures to Claude (no Library entries make them); Claude saves them as
// art/raw/characters/<id>-hero-ref-v1.png, <id>-walk-sheet-v1.png, <id>-battle-sheet-1-v1.png, <id>-battle-sheet-2-v1.png.
// art.html shows an ability blocked until its pictures exist.
// Ability frames follow the beats of the real animation in engine/<id>-moves.js (Primary kit, data/abilities.js B8_KITS).
// Shared text: prompts/char-ability-sheet.txt (no left/right words).
const fs = require('fs');
const P = f => fs.readFileSync(__dirname + '/prompts/' + f, 'utf8').trim();
const R = 'art/raw/characters/';

// [move key, move name, row 1 frames, row 2 frames]
const ABILITIES = {
  tom: [
    ['button_mash', 'Disconnected Controller', [
      'Holding a black wireless game controller in both hands at chest height, thumbs on the buttons, calm face.',
      'The same, pressing one button hard, staring down at the controller, eyebrows raised, mouth flat.',
      'Holding the controller out at arm\'s length in one hand, frowning at it, unimpressed.'], [
      'Wind-up: the controller in one hand pulled back behind the shoulder, weight on the back leg, eyes narrowed.',
      'Throw: the arm swung fully forward, the controller just leaving the open fingers, front knee bent.',
      'Empty hands, brushing one palm against the other, a dry satisfied look.']],
    ['defend', 'DEFEND', [
      'Stepping forward quickly, the front foot landing, one arm rising.',
      'Planted, one arm straight out with the palm flat in a calm stop gesture, the other arm held back sheltering someone behind him, firm calm face.',
      'The same stop gesture, chin up, eyes half closed, mouth slightly open, politely saying "no touching, please."'], [
      'Braced: knees bent, both forearms raised in front, shoulders squared, eyes squinting.',
      'Rocked back a little, feet still planted, one palm still out, unbothered face.',
      'Standing tall again, straightening the front of his shirt with both hands, a small dry smile.']],
    ['starter_splash', 'Starter Splash', [
      'Walking, a big glass jar of bubbly sourdough starter hugged in both arms against his chest, proud.',
      'Standing, holding the jar out at arm\'s length in both hands, the lid lifting, eyebrows raised in alarm.',
      'Twisting the lid off with one hand, the jar tipped forward in the other, leaning back.'], [
      'The open jar held out low in both hands and tipped forward, mouth open in a shout.',
      'The jar upright in one hand, the other hand screwing the lid back on, satisfied.',
      'Hugging the closed jar, patting it fondly with one hand, eyes closed, a warm smile.']],
    ['sourdough_snob', 'Sourdough Snob', [
      'Holding a round golden sourdough loaf up in both hands, presenting it proudly.',
      'Tearing the loaf in two with both hands, focused.',
      'Holding out a thick slice of bread on one flat palm, offering it forward, a kind smile.'], [
      'A long thin pointer in one hand pointing upward, the other hand raised with one finger up, mouth open mid lecture, eyebrows raised.',
      'Tapping the pointer on a small chart board held in the other hand, earnest.',
      'Holding the loaf close to his face, studying the crust with narrowed eyes, very serious.']],
    ['overpriced_gadget', 'Retail Therapy', [
      'Kneeling on one knee, both hands resting on top of a large matte-black box on the ground in front of him, excited eyes.',
      'Still kneeling, lifting the lid off the box slowly with both hands, mouth open in awe.',
      'Standing, holding a small sleek silver gadget up high in both hands, a big joyful grin.'], [
      'Holding a very long paper receipt in both hands, the paper hanging to the floor and piled at his feet, reading it.',
      'The same receipt held up close to his eyes, eyebrows raised, lips pressed together.',
      'The receipt folded under one arm, eyes closed, a slow calm nod.']],
    ['noise_canceling', 'Noise-Canceling', [
      'Walking forward calmly, large black over-ear headphones held in one hand at his side, flat face.',
      'Standing, holding the headphones open with both hands above his head, about to put them on.',
      'Headphones on his ears, both hands pressing the ear cups, eyes closing.'], [
      'Headphones on, one finger pressing a button on an ear cup, the other hand raised with the palm out.',
      'Headphones on, arms folded, eyes closed, a peaceful tiny smile, standing perfectly still.',
      'Headphones on, head tilted back slightly, eyes closed, blissful, one hand resting on an ear cup.']],
    ['seat_1a', 'Seat 1A, Peasants', [
      'Standing tall, a boarding pass held up beside his face, chin raised, smug.',
      'Pressing one button on a small remote held out in one hand, eyebrows raised, unbothered.',
      'One arm raised high with the hand closed, pulling something down, the remote in the other hand.'], [
      'A thick plush white duvet held spread in both arms, stepping forward.',
      'Leaning forward, smoothing the duvet down with both hands, a gentle caring face.',
      'Standing straight, hands clasped in front, a polite flight attendant smile.']],
    ['delta_ult', 'Boarding Group Zero', [
      'Tapping a phone held up in one hand, chin raised, proud.',
      'One arm swept out wide and low, palm open, welcoming someone forward, a grand smile.',
      'Standing relaxed, a sleep mask pushed up on his forehead, arms stretched overhead.'], [
      'Lying back almost flat, propped on one elbow, the sleep mask over his eyes, blissful.',
      'One arm pointing straight forward, the other fist on the hip, a bold look.',
      'Holding out a rolled white towel with silver tongs in one hand, a gracious smile.']],
    ['flashcard_flurry', 'Flashcard Flurry', [
      'A thick deck of white flashcards in one hand, fanning it with the other thumb, focused.',
      'Holding up a single flashcard at arm\'s length, eyebrows raised, quizzing.',
      'Flicking a card forward with a snap of the wrist, the deck in the other hand.'], [
      'Flicking another card with the other hand, body turned, mid-throw.',
      'Both arms flung forward, several cards leaving his fingers.',
      'Squaring the deck between both hands, a satisfied teacher look.']],
    ['konami_code', 'Konami Code', [
      'Rubbing his hands together, eyes wide with excitement, a huge grin.',
      'Hopping forward, the front foot stomping down, knees bent, arms out for balance.',
      'Hopping back, the back foot stomping down, arms swinging.'], [
      'One foot stomping, the other leg lifted high, both arms up.',
      'Jumping straight up, both knees tucked, both fists raised.',
      'Landing in a crouch with one fist punched up high, mouth open in a triumphant shout.']],
    ['skincare_10', '10-Step Skincare', [
      'One hand raised flat, palm forward, in a pause gesture, serious face.',
      'A small tray of skincare bottles and jars balanced flat on one hand, the other hand picking up a bottle.',
      'Patting his cheeks with both hands, eyes closed, calm.'], [
      'Holding a white face mask dotted with glowing red lights up to his face with both hands.',
      'Wearing the glowing red-light mask over his face, arms folded, standing still and patient.',
      'The mask lifted up onto his forehead, fingertips touching one cheek, a refreshed glowing smile.']],
    ['kanji_strike', 'Kanji Strike', [
      'Walking, a very large calligraphy brush carried over one shoulder like a pole, calm.',
      'The brush held upright in both hands in front of him, eyes closed, focusing.',
      'Sweeping the brush in a big level stroke, body turned, arms extended.'], [
      'Bringing the brush down in a big downward stroke, front knee bent, leaning in.',
      'The brush raised high on a diagonal above him for the last stroke, mouth open in a shout.',
      'Flicking the brush to the side with one hand to shake off the ink, the other hand on the hip, cool look.']],
    ['know_it_all', 'Know-It-All', [
      'Arms folded, eyebrows raised, a skeptical squint.',
      'One index finger raised high, mouth open, an "um, actually" face.',
      'Leaning forward, the raised finger wagging, eyes half closed, smug.'], [
      'A big red rubber stamp held high in one hand, about to stamp.',
      'Slamming the stamp forward and down at arm\'s length, front knee bent, determined.',
      'Blowing on the stamp held up beside his face, a satisfied smirk.']],
    ['cart_ult', 'Cartridge Tilt', [
      'Looking straight out at the viewer, a flat unimpressed face, head tilted, mid head shake.',
      'Reaching straight up high with both arms, fingers spread, up on his toes.',
      'A large grey game cartridge held in both hands in front of his face, blowing into its bottom edge, cheeks puffed.'], [
      'Pushing the cartridge down with both hands, leaning into it hard, teeth gritted.',
      'The whole body leaning hard to one side, both arms pushing, tilting something huge.',
      'Landing on both feet from a small hop, brushing one palm against the other, a dry satisfied look.']],
  ],
};

const GROUP = { tom: 'Tom' };
const entries = [];
for (const id of Object.keys(ABILITIES)) {
  const who = GROUP[id], hero = R + id + '-hero-ref-v1.png', walk = R + id + '-walk-sheet-v1.png';
  const b1 = R + id + '-battle-sheet-1-v1.png', b2 = R + id + '-battle-sheet-2-v1.png';
  for (const [key, name, r1, r2] of ABILITIES[id]) {
    const n = (a, o) => a.map((t, i) => (i + 1 + o) + '. ' + t).join('\n');
    entries.push({ id: id + '-ab-' + key.replace(/_/g, '-'), tab: 'Characters', group: who, title: who + ' ability: ' + name + ' (6 frames; needs your two battle sheets)', ar: '3:2', refs: [hero, walk, b1, b2],
      prompt: P('char-ability-sheet.txt') + '\n\nThe move: ' + name + '.\n\nRow 1:\n' + n(r1, 0) + '\n\nRow 2:\n' + n(r2, 3) });
  }
}
// Emotion sheets (Tom 2026-11-05 23:43, docs/EMOTIONS.md): one 4 x 2 full-body sheet per character with a hero picture,
// the 8 core emotions in order happy, loving, sad, angry, scared, surprised, proud, unimpressed. Ref: hero only.
const EMOTION_CAST = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy', ellie: 'Aunt Ellie', olivia: 'Olivia', nara: 'Nara' };
for (const [id, who] of Object.entries(EMOTION_CAST)) {
  const dog = id === 'nara';   // Nara: her own prompt, dog body language (Tom 2026-11-06 00:09)
  entries.push({ id: id + '-emotions', tab: 'Characters', group: who, title: who + (dog ? ' emotion sheet: 8 feelings, dog body language' : ' emotion sheet: 8 feelings, full body') + ' (happy, loving, sad, angry, scared, surprised, proud, unimpressed)', ar: '2:1', refs: [R + id + '-hero-ref-v1.png'], prompt: P(dog ? 'dog-emotion-sheet.txt' : 'char-emotion-sheet.txt') });
}
module.exports = { entries };
