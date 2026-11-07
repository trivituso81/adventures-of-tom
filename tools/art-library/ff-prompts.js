// Family Finish member sheets (Tom 2026-11-07 queue; one solo 3 x 2 sheet per member, 10 in all: ff1 x4, ff2 x3, ff3 x3).
// Solo, not group, so no sheet has to hold three or four faces at once (the Tombo pairs drift). Beats come from the LIVE animations
// in engine/battle2-kind.js (ff1 ~2485, ff2 ~2604, ff3 ~2720); names from B2_TOMBOS in data/battle2-data.js. ff4 (whole party) has no member sheets.
// Each row: [ff id, finish name, member key, member name, six frames]. Copied into data/art-prompts.json by a node one-liner (never run make-prompts.js).
// Group names use a comma, not a colon (validate.js bans colons in group names).
const fs = require('fs');
const HEADER = fs.readFileSync(__dirname + '/prompts/char-ff-sheet.txt', 'utf8').trim();
const R = 'art/raw/characters/';

const FF = [
  ['ff1', "Sleepover at Tom's", 'tom', 'Tom', 'The girls\' first sleepover: Tom hands out snacks, flinches at a scary story, then cheers as the blanket fort grows into a castle.', [
    'Tom walks forward carrying a red and white striped popcorn bag in each hand, a calm dry smile.',
    'Tom tosses one popcorn bag underhand with a relaxed flick of the wrist, the other bag still in his other hand.',
    'Tom holds a popcorn bag out at arm\'s length, offering it, one eyebrow raised.',
    'Tom jolts back one step with wide eyes and his shoulders up, startled, the popcorn bag held tight to his chest.',
    'Tom laughs with his head tipped back, a hand on his stomach.',
    'Tom stands with one fist raised high in a cheer and a proud grin.',
  ]],
  ['ff1', "Sleepover at Tom's", 'tnb', 'TNB', 'TNB tells the scary story with a flashlight.', [
    'TNB walks forward holding a flashlight in one hand, relaxed, a sly grin.',
    'TNB crouches low and holds the flashlight under his chin, pointing up, with a spooky wide-eyed face.',
    'TNB leans forward with one hand cupped beside his mouth whispering, the flashlight still under his chin.',
    'TNB springs up with both arms thrown wide and his mouth open in a big BOO.',
    'TNB laughs with his head back, the flashlight in one hand pointing at the ground.',
    'TNB claps his hands together over his head, grinning.',
  ]],
  ['ff1', "Sleepover at Tom's", 'grace', 'Grace', 'Grace starts a dance party inside the blanket fort.', [
    'Grace stands with both hands on her hips, chin up, a bossy confident look.',
    'Grace dances with one arm stretched up high and one knee lifted, grinning.',
    'Grace spins in a twirl with both arms out, her hair flying.',
    'Grace jumps high in the air in a star jump with her arms and legs spread wide.',
    'Grace jolts back with both hands on her cheeks and her mouth open in surprise.',
    'Grace stands with both fists raised high and a huge grin.',
  ]],
  ['ff1', "Sleepover at Tom's", 'rose', 'Rose', 'Rose builds the blanket fort and hangs a sign on it.', [
    'Rose runs forward hugging a big fluffy pillow in both arms, a giggle on her face.',
    'Rose stretches up on tiptoe holding a quilt high over her head with both hands.',
    'Rose jumps in the air with both arms up, delighted.',
    'Rose stands with both hands on her hips, chin up, proudly looking at what she built.',
    'Rose leaps back with her hands on her cheeks and wide round eyes, startled.',
    'Rose jumps with both arms raised high, cheering.',
  ]],
  ['ff2', 'Run With Us, Mommy!', 'amy', 'Amy', 'Amy is weighed down, the girls pull her up, and she sprints free.', [
    'Amy kneels on one knee with one hand on her thigh and her head bowed, tired and out of breath.',
    'Amy lifts her head and looks up, a tired small smile starting; a gold star sticker is on her shoulder.',
    'Amy reaches out with both hands held open at her sides, a pink ribbon tied on one wrist.',
    'Amy rises up from the kneel, her arms still stretched out to both sides, eyes bright.',
    'Amy sprints forward in a full running stride, arms pumping, determined joy on her face.',
    'Amy breaks a yellow finish tape across her chest with both arms thrown high, laughing.',
  ]],
  ['ff2', 'Run With Us, Mommy!', 'grace', 'Grace', 'Grace sticks a gold star on Mom, counts her in and runs with her.', [
    'Grace runs forward fast with her arms pumping and a determined face.',
    'Grace holds up a gold star sticker on her fingertip, her other hand out in front of her.',
    'Grace holds up four fingers and counts out loud with her mouth open and her eyes bright.',
    'Grace reaches out with one hand open, ready to pull someone up, a big encouraging smile.',
    'Grace sprints in a full running stride, one hand held out to the side as if holding someone\'s hand.',
    'Grace stands with both arms thrown high in victory, a huge grin.',
  ]],
  ['ff2', 'Run With Us, Mommy!', 'rose', 'Rose', 'Rose ties her ribbon on Mom\'s wrist, hands her Lamby and runs with her.', [
    'Rose runs forward holding a pink ribbon in one hand and a small plush lamb Lamby in the other.',
    'Rose stands on tiptoe reaching up with the pink ribbon, tying it around something above her head, concentrating.',
    'Rose holds up her plush lamb Lamby with both hands, offering it, a sweet earnest smile.',
    'Rose reaches out with one hand open, a big happy smile, Lamby tucked under her other arm.',
    'Rose runs in a full little sprint with one hand held out to the side as if holding someone\'s hand, Lamby bouncing under her other arm.',
    'Rose jumps high with both arms up, Lamby in one fist, cheering.',
  ]],
  ['ff3', 'Fifty-One Years and Counting', 'deedee', 'Deedee', 'Deedee and Boppy hold hands across fifty-one years.', [
    'Deedee stands still with her chin up and one hand reaching out to the side, a tired but warm look.',
    'Deedee takes a hand held out to her side and smiles, her shoulders relaxing.',
    'Deedee sways in a slow dance step with her hand held out to the side, eyes closed, smiling.',
    'Deedee twirls in a slow turn with one arm raised, her hand held up as if holding a partner\'s hand.',
    'Deedee swings her arm forward with her hand held out in front, a bright proud face.',
    'Deedee stands with both arms open wide and a joyful, glowing smile.',
  ]],
  ['ff3', 'Fifty-One Years and Counting', 'boppy', 'Boppy', 'Boppy takes Deedee\'s hand and they swing their joined hands forward.', [
    'Boppy stands still with a stern squint and one hand held out to the side.',
    'Boppy closes his hand around a hand held out to his side and gives a small warm smile.',
    'Boppy sways in a slow, careful dance step, his hand held out to the side, a gentle grin.',
    'Boppy turns in a slow step with one arm raised, his hand held up as if leading a partner.',
    'Boppy swings his arm forward with his hand held out in front, a fierce proud face.',
    'Boppy stands with both arms open wide and a big satisfied grin.',
  ]],
  ['ff3', 'Fifty-One Years and Counting', 'tom', 'Tom', 'Tom frames Deedee and Boppy\'s picture behind them.', [
    'Tom stands holding up both hands with his thumbs and forefingers shaped into a rectangle frame, one eye squinting through it.',
    'Tom steps back one step with the finger frame still held up at eye level, tilting his head to line up the shot.',
    'Tom lowers the finger frame slightly and nods slowly, a soft pleased smile.',
    'Tom lifts the finger frame again and holds very still, calm and focused.',
    'Tom drops both hands to his sides and breaks into a warm grin.',
    'Tom stands with one fist raised high in a cheer, grinning.',
  ]],
];

function entry([ff, name, key, who, beat, frames]) {
  return {
    id: ff + '-' + key,
    tab: 'Characters',
    group: 'Finish, ' + name,
    title: 'Family Finish: ' + name + ' (' + who + ')',
    ar: '3:2',
    refs: [R + key + '-hero-ref-v1.png', R + key + '-battle-sheet-1-v1.png'],
    prompt: HEADER + '\n\nThe Family Finish: ' + name + '. ' + beat + '\n\nSix frames:\n' + frames.map((f, i) => (i + 1) + '. ' + f).join('\n'),
  };
}

module.exports = { entries: FF.map(entry) };
