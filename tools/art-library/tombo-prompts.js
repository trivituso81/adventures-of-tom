// Tombo sheets: Tom + one partner, one 3 x 2 picture per Tombo (Tom 2026-11-06; spec claude/next-addendum-tombo-art.md).
// Beats come from the LIVE animations in engine/battle2-kind.js (the comment block above each B2_TOMBO_ANIM.<id>), not from claude/battle-design.md,
// which is out of date (its names and beats differ from the game). Names are the live names in B2_TOMBOS (data/battle2-data.js).
// Each row: [id, live name, partner key, partner name, what Tom does, what the partner does, six frames].
// Slice 1: the three Tom + Grace Tombos. Slice 2: the three Tom + Rose Tombos. Slice 4: the three Tom + Deedee Tombos. Slice 3: the three Tom + Amy Tombos (amy2 and amy3 are childhood flashbacks, so those sheets draw little Tom and little Amy). Rows for the other 12 Tombos are added in the same shape, one partner per push.
// Entries are copied into data/art-prompts.json by a node one-liner that keeps every other entry untouched (never run make-prompts.js: it rewrites hand edits).
// Groups use a comma, not a colon, because validate.js bans colons in group names.
const fs = require('fs');
const HEADER = fs.readFileSync(__dirname + '/prompts/char-tombo-sheet.txt', 'utf8').trim();
const R = 'art/raw/characters/';

const TOMBOS = [
  ['grace1', 'Squishy Delivery', 'grace', 'Grace',
    'sighs, shrugs and says fine, then cheers when the squishy lands',
    'begs with clasped hands, hops, gasps at the gift and squeals at the landing',
    [
      'Grace stands facing Tom with her hands clasped under her chin, a pleading puppy-eyed face with one tear on her cheek; Tom stands with his arms folded.',
      'Grace drops to her knees with her clasped hands held up; Tom looks down at her with a long sigh.',
      'Tom shrugs with both palms up and a fine, then look; Grace bounces up off her knees with her arms raised.',
      'Grace gasps with both hands on her cheeks and looks up with wide eyes; Tom watches her with a small smile.',
      'Grace squeals and hops with both fists up; Tom raises one fist in a cheer.',
      'Tom and Grace stand side by side; Grace holds a pink glittery cube squishy with a small happy face, and both are grinning.',
    ]],
  ['grace2', 'Uncle Spotter Toss', 'grace', 'Grace',
    'claps chalk off his hands, laces his fingers low into a stirrup and heaves Grace straight up, then high-fives her',
    'takes two running steps, lands in his laced hands, flips twice and sticks a landing with arms out',
    [
      'Tom stands in a coach\'s stance and claps chalk off his hands; Grace is ready in a running start, eyes forward, a determined grin.',
      'Tom laces his fingers low into a stirrup; Grace takes two running steps toward him.',
      'Grace\'s foot lands in Tom\'s laced hands; Tom heaves her straight up with both arms reaching high.',
      'Grace is high in the air, tucked into a flip with her arms and legs spread wide; Tom\'s arms are still raised.',
      'Grace lands feet first in a stick landing with her arms out; Tom runs up with his palm open for a high five.',
      'Tom and Grace high-five; Grace is grinning and Tom is beaming.',
    ]],
  ['grace3', 'The Golden Dumpling Wish', 'grace', 'Grace',
    'wishes far too loudly, gets squished flat, then peels himself up off the ground laughing',
    'holds up the golden wish dumpling, which wakes with a grumpy genie face, and then bursts into a shower of tiny dumplings',
    [
      'Grace holds a large golden soup dumpling up in both hands; Tom stands beside her with cupped hands, ready to make a wish.',
      'The golden dumpling has a grumpy genie face with eyes and a mouth; Tom leans in and shouts a loud wish.',
      'Tom is squashed flat as a pancake on the ground with his arms spread wide and his eyes wide; Grace claps both hands over her mouth.',
      'Grace jumps back with her arms up as the golden dumpling splits open above her.',
      'Tom peels himself up off the ground with his arms waving, grinning; Grace laughs with her hands on her tummy.',
      'Tom and Grace in a big group hug; Grace is up on her toes and Tom is bending down, both laughing.',
    ]],
  ['rose1', 'Double-Decker Airplane', 'rose', 'Rose',
    'hoists Rose up onto his shoulders, both of them in aviator goggles, then sprints in a wide banking loop with his arms out like wings',
    'rides on his shoulders with her arms out as the top wing, then leans all the way down to boop a monster\'s nose with one finger',
    [
      'Tom crouches low with both hands up; Rose climbs onto his shoulders, both of them wearing aviator goggles, Rose grinning.',
      'Tom runs forward with his arms spread wide like a biplane wing; Rose on his shoulders spreads her arms out too.',
      'Tom banks hard through a wide loop with a white contrail streaming behind him; Rose holds on tight with both hands.',
      'Tom skids to a stop in front of a monster with his arms still spread; Rose is bright with excitement.',
      'Rose leans far down toward the monster and boops its nose with one finger; Tom holds very still.',
      'Tom and Rose on his shoulders, both in goggles, pointing up at the sky with one hand each.',
    ]],
  ['rose2', 'Seat 1A Stowaway', 'rose', 'Rose',
    'wheels a blue carry-on suitcase toward the monsters, whistling very casually, then wheels it back home with Rose riding on top',
    'hides inside the suitcase, pops out with a shout and her plush lamb Lamby held high, then blows a giant raspberry',
    [
      'Tom stands holding a blue carry-on suitcase by its handle, whistling with his other hand in his pocket; only Rose\'s pink sneakers stick out of the open end.',
      'Tom wheels the suitcase toward a group of monsters, very casual; the monsters lean in close to the case.',
      'The suitcase wiggles with the pink sneakers poking out; Tom glances at it and shrugs.',
      'Rose pops out of the suitcase high in the air with Lamby held up high, shouting BOO; Tom jumps back with his hands up.',
      'Rose lands on top of the suitcase and blows a giant raspberry; the monsters are dizzy with little stars around their heads, and Tom grins.',
      'Tom wheels the suitcase home with Rose riding on top, her arms up and a big grin on her face.',
    ]],
  ['rose3', 'Headphones in the Dark', 'rose', 'Rose',
    'follows a glowing gold sound ribbon through the dark to Rose, lifts her onto his shoulders, then reaches up to press PLAY together',
    'sits in the dark wearing Tom\'s big silver headphones with little music notes floating out of them, rides on his shoulders, then throws her arms up when the music starts',
    [
      'A dark stage lit only by Rose in Tom\'s big silver headphones; little music notes float out of the headphones.',
      'A gold sound ribbon reaches across the dark from Rose toward Tom; Tom stands in the dark, following it with his eyes.',
      'Tom walks along the glowing ribbon to Rose and lifts her up onto his shoulders; her headphones are still on.',
      'Tom and Rose reach up and press PLAY together; the dark lifts as a gold sound wave sweeps across the stage.',
      'Giant music notes rain down from above; Rose waves both arms and Tom pumps one fist.',
      'Tom and Rose on his shoulders, headphones on, both grinning in the bright light.',
    ]],
  ['amy1', 'I Called It!', 'amy', 'Amy',
    'lunges for the same spot as Amy, bickers nose to nose, loses a rock paper scissors tie, then charges shoulder to shoulder with her and ends tired and amused',
    'lunges, points at herself, bickers, ties at rock paper scissors, charges, then pumps both fists and declares herself the winner',
    [
      'Tom and Amy both lunge toward the same spot with their arms stretched out, scowling at each other.',
      'Tom and Amy stand nose to nose; Tom points a thumb at his own chest and Amy points a finger at her own chest.',
      'Tom and Amy face each other, each shaking a fist in the air, ready for rock paper scissors.',
      'Tom and Amy both hold out a closed fist at the same time and stare at each other with flat, unimpressed faces.',
      'Tom and Amy sprint forward together, shoulder to shoulder, leaning into the run with their arms pumping.',
      'Amy pumps both fists in the air with a huge grin; Tom stands beside her with his arms folded and a tired smile.',
    ]],
  ['amy2', 'Ymamot Creation', 'amy', 'Amy',
    'as little Tom, as tall as Grace, with a full head of hair, a yellow striped tee, denim shorts and red sneakers, adds ketchup, cereal and mustard to a mixing bowl, names the mess, then slings it',
    'as little Amy, as tall as Rose, with pigtails tied with bows and a teal dress, adds pickles, a lemon and a sock to the bowl, announces the name proudly, then slings it',
    [
      'A flashback. Little Tom and little Amy stand on either side of a kitchen counter with a big mixing bowl between them, both looking up at it with wide eyes.',
      'Little Tom tips a bottle of ketchup over the bowl; little Amy drops in a pickle, holding her nose.',
      'Little Tom pours cereal into the bowl; little Amy squeezes a whole lemon over it, her face scrunched.',
      'Little Amy drops in one gym sock and stirs with a wooden spoon, proud; little Tom stirs with a second spoon.',
      'Little Amy points at the bowl with her chin up, announcing its name; little Tom stands with his fists on his hips.',
      'Little Tom and little Amy hold the bowl together at their shoulders and swing it back, both laughing, ready to sling it.',
    ]],
  ['amy3', 'Knock It Off!', 'amy', 'Amy',
    'as little Tom, as tall as Grace, with a full head of hair, a yellow striped tee, denim shorts and red sneakers, sulks on a purple couch, bickers over the good spot, swings cushions, then freezes at their mother\'s voice',
    'as little Amy, as tall as Rose, with pigtails tied with bows and a teal dress, glares from the couch, bickers, swings cushions and freezes at their mother\'s voice',
    [
      'A flashback. Little Tom and little Amy sit at opposite ends of a purple couch with their arms crossed, each glaring at the other.',
      'Little Tom points at the middle cushion with a tattling frown; little Amy points at it too, scowling.',
      'Little Amy raises a cushion high over her head; little Tom ducks, with his arms over his head.',
      'Little Tom swings a pillow with both hands in a big arc; little Amy ducks and the pillow sweeps over her head.',
      'Little Tom and little Amy both swing cushions at the same moment and spin, tumbling off balance with their feet in the air.',
      'Little Tom and little Amy freeze in place, wide-eyed, each holding a cushion mid-swing, looking toward a doorway.',
    ]],
  ['deedee1', 'Wine and Gossip', 'deedee', 'Deedee',
    'sits at a small bistro table with a glass of wine, clinks, leans in to whisper, gasps with a hand on his chest and ends up holding a warm pan of rhubarb crisp',
    'sits across from him with her own glass, clinks, whispers behind her hand, points, gasps, then brings out a pan of rhubarb crisp with a proud smile',
    [
      'Tom and Deedee sit on either side of a small round bistro table, each holding a glass of red wine, both sitting up straight.',
      'Tom and Deedee clink their wine glasses over the middle of the table, both smiling.',
      'Tom and Deedee lean in toward each other over the table; Deedee whispers behind her hand and Tom tilts his head to listen.',
      'Tom and Deedee both turn to look at the same spot off in the distance with slow, wide eyes; Deedee points one finger.',
      'Tom and Deedee gasp together, each with a hand pressed to the chest and a mouth open in a big O.',
      'Deedee holds up a golden baking pan of rhubarb crisp with oven mitts, beaming; Tom raises his glass beside her with a pleased grin.',
    ]],
  ['deedee2', 'Pick the Rhubarb', 'deedee', 'Deedee',
    'grabs a giant leafy rhubarb stalk with both hands, pulls until it will not budge, then gets yanked off his feet and lands sitting on the ground',
    'points at the stalk with hands on her hips, grabs Tom around the waist from behind, heaves with him, lands sitting, then takes the stalk and tosses golden pie tins',
    [
      'Deedee stands in a garden bed with her hands on her hips and points at a giant leafy rhubarb stalk with her chin up; Tom stands beside it, looking at the stalk.',
      'Tom grips the rhubarb stalk with both hands and leans back with his feet planted, straining; Deedee watches with her arms folded.',
      'Tom stands with the stalk in his hands and a flat, tired look on his face; Deedee steps in behind him and wraps both arms around his waist.',
      'Tom and Deedee lean far back in a line, both pulling on the stalk with their teeth gritted and their eyes squeezed shut.',
      'Tom and Deedee sit on the ground in a heap with dirt flying around them; Tom holds the stalk with a mass of dangling roots at its base.',
      'Deedee stands holding two golden lattice-crust pies in tins and tosses one in the air, grinning; Tom sits on the ground and watches, impressed.',
    ]],
  ['deedee3', 'Tom Cooks for Mom', 'deedee', 'Deedee',
    'lifts a blue cloth off a loaf of sourdough on a white kitchen counter, waves the loaf under her nose, then winces when she says it needs salt',
    'takes a bite and thinks, says it needs salt, spots the crumbs on the counter, grabs a straw broom and sweeps with big strokes',
    [
      'Tom stands behind a white kitchen counter and lifts a blue cloth off a round loaf of sourdough with a proud grin; Deedee stands on the other side with her hands clasped.',
      'Tom holds the loaf out and waves it under Deedee\'s nose; Deedee leans in and sniffs with her eyes closed.',
      'Deedee takes a bite of the bread and chews with a thoughtful look, her eyebrows raised; Tom watches with his hands clasped, hopeful.',
      'Deedee shakes her head and says it needs salt, holding the bread up between two fingers; Tom winces with his shoulders slumped.',
      'Deedee points at the crumbs on the counter with a stern face; Tom takes one step back with his palms raised.',
      'Deedee swings a straw broom in a big sweeping stroke with her feet planted; Tom stands behind her with a stunned look.',
    ]],
];

function entry([id, name, partner, pname, tomDo, partnerDo, frames]) {
  return {
    id: 'tombo-' + id,
    tab: 'Characters',
    group: 'Tombos, Tom + ' + pname,
    title: 'Tombo: ' + name + ' (Tom + ' + pname + ')',
    ar: '3:2',
    // Rose rides on Tom in rose1 and rose3 (and ff1), so those get the fifth picture: Tom carrying a passenger.
    refs: [R + 'tom-hero-ref-v1.png', R + partner + '-hero-ref-v1.png', R + 'tom-battle-sheet-1-v1.png', R + partner + '-battle-sheet-1-v1.png',
      ...(['rose1', 'rose3'].includes(id) ? [R + 'tomride-poses-v2.png'] : [])],
    prompt: HEADER + '\n\nThe Tombo: ' + name + '. Tom ' + tomDo + '. ' + pname + ' ' + partnerDo + '.\n\nSix frames:\n' + frames.map((f, i) => (i + 1) + '. ' + f).join('\n'),
  };
}

module.exports = { entries: TOMBOS.map(entry) };
