// NPC prompts for the Art Library (tab NPCs). Required by make-prompts.js.
// One hero prompt per person, `npc-photo-<id>` (Final Fantasy IX style template plus details). Looks come from the live game palettes
// (scratchpad dump of LE_PALETTES / LA_PALETTES); roles, ages and heights are written below. Assumptions are flagged where they matter.

const fs = require('fs');
const path = require('path');
const DUMP = process.env.NPC_DUMP || '/tmp/claude-0/-home-claude/39197478-1f17-5382-8d0f-e8b30b410449/scratchpad/dump/npcs.json';
const SNAP = path.join(__dirname, 'prompts', 'npc-palettes.json');
let PAL;
if (fs.existsSync(DUMP)) { const d = JSON.parse(fs.readFileSync(DUMP, 'utf8')); PAL = { ...d.lepal, ...d.lapal }; }
else PAL = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

// ---- color words from hex ----
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const near = (h, table) => { const c = rgb(h); let best = null, bd = 1e9; for (const [n, x] of table) { const r = rgb(x); const d = (c[0] - r[0]) ** 2 + (c[1] - r[1]) ** 2 + (c[2] - r[2]) ** 2; if (d < bd) { bd = d; best = n; } } return best; };
const SKIN = [['very fair', '#f3d3b8'], ['fair', '#efbc8e'], ['light peach', '#e8b48e'], ['warm tan', '#d0a07a'], ['golden tan', '#c69878'], ['olive tan', '#c08a64'], ['medium brown', '#b8805c'], ['warm brown', '#9e7056'], ['rich brown', '#8a5a3c'], ['deep brown', '#6a4030'], ['very deep brown', '#4f3225'], ['pale grey-white', '#d8d4cc']];
const HAIR = [['black', '#2a2220'], ['very dark brown', '#3e3433'], ['dark brown', '#5a4030'], ['chestnut brown', '#754e3c'], ['light brown', '#925f42'], ['dark blond', '#b98a5a'], ['golden blond', '#e8c25a'], ['strawberry blond', '#c98a4a'], ['auburn red', '#a8452f'], ['bright red', '#c9463d'], ['silver grey', '#b7b3ad'], ['white', '#e8e4dc'], ['slate violet', '#626175'], ['teal', '#2f6f73'], ['light blond', '#e3dac2'], ['plum', '#5a3a5a']];
const CLOTH = [['black', '#1b1b1f'], ['charcoal', '#2c2c33'], ['dark grey', '#4a5868'], ['grey', '#9ea3ab'], ['off-white', '#f4f4f0'], ['cream', '#f4ecd2'], ['beige', '#d9c6a0'], ['tan', '#c9b89a'], ['olive brown', '#8a7a5a'], ['brown', '#8a6a48'], ['rust', '#c0613f'], ['red', '#c0392b'], ['coral pink', '#ca7c75'], ['hot pink', '#d65aa0'], ['rose pink', '#f08aa8'], ['orange', '#e2793a'], ['mustard yellow', '#e7b73e'], ['pale yellow', '#f2e2a0'], ['sage green', '#8ca275'], ['grass green', '#6fb35a'], ['forest green', '#3f6a3f'], ['teal', '#3a9ca0'], ['sky blue', '#9ccfd8'], ['cornflower blue', '#7394ae'], ['royal blue', '#2f6fb3'], ['navy', '#2f3a4a'], ['slate blue', '#4a5a8a'], ['lavender', '#a595b8'], ['purple', '#7a3a5a'], ['violet', '#9a7ad0'], ['plum', '#6a4f7a'], ['khaki', '#b2bf86'], ['steel grey-blue', '#63798c'], ['dusty blue', '#77748e'], ['denim blue', '#3f5a74'], ['slate grey', '#3f4650'], ['mint green', '#82a7aa'], ['burnt orange', '#c0613f']];
const cw = (h, t) => near(h, t);   // color words only (11-09: hex codes removed, fewer words)

// kind: 'adult' | 'child'. sex: m | f. Heights in feet and inches. look = palette key. over = optional palette override.
const N = {
  pip: { name: 'Pip', look: 'pip', sex: 'm', kind: 'child', age: 9, ft: `4'1"`, role: "one of Grace's friends from the Square, about her age", acc: 'holding a small smooth grey pet rock in both palms, a proud little grin' },
  moss: { name: 'Moss', look: 'moss', sex: 'm', kind: 'child', age: 9, ft: `4'3"`, role: "one of Grace's friends from the Square, about her age", acc: 'head tilted a little to one side, curious, one hand holding a small green leaf' },
  dot: { name: 'Dot', look: 'dot', sex: 'f', kind: 'child', age: 9, ft: `4'0"`, role: "one of Grace's friends from the Square, about her age", acc: 'counting on her fingers, a thoughtful half smile' },
  gus: { name: 'Gus', look: 'gus', sex: 'm', kind: 'adult', age: 72, ft: `5'6"`, role: 'a retired Rivituso Row neighbour who loves sitting', acc: 'a small folding camp stool tucked under one arm, a slightly stooped, easy posture' },
  bean: { name: 'Bean', look: 'bean', sex: 'f', kind: 'adult', age: 34, ft: `5'5"`, role: 'a cheerful Rivituso Row wanderer who is never quite lost', acc: 'a rolled-up paper map in one hand, a puzzled but happy smile' },
  reel: { name: 'Reel', look: 'reel', sex: 'm', kind: 'adult', age: 64, ft: `5'9"`, role: 'the bait shack owner at Cattail Pier', acc: 'a small tin bait bucket in one hand, a weathered, friendly squint' },
  pruitt: { name: 'Principal Pruitt', look: 'pruitt', sex: 'm', kind: 'adult', age: 62, ft: `5'9"`, role: 'the principal of Long Island Elementary, 31 years on the job', acc: 'a ring of keys clipped to the belt and one hand on the lapel, a calm, seen-it-all look' },
  delgado: { name: 'Mr. Delgado', look: 'delgado', sex: 'm', kind: 'adult', age: 40, ft: `5'8"`, role: "a parent at the school, Marco's dad", acc: 'one hand lifted in a friendly half wave, a visitor badge on his shirt' },
  kowalski: { name: 'Mrs. Kowalski', look: 'kowalski', sex: 'f', kind: 'adult', age: 48, ft: `5'4"`, role: 'the PTA president', acc: 'a plate of cookies in one hand and a laminated sheet under the other arm, a bright, organized smile' },
  ike: { name: 'Grandpa Ike', look: 'ike', sex: 'm', kind: 'adult', age: 78, ft: `5'5"`, role: "a grandfather visiting the school for his grandson", acc: 'a wooden cane in one hand, a proud, nostalgic smile, shoulders a little rounded' },
  halverson: { name: 'Mr. Halverson', look: 'halverson', sex: 'm', kind: 'adult', age: 41, ft: `5'10"`, role: 'a fourth grade teacher', acc: 'a coffee mug in one hand and a lanyard around his neck, a tired but wry look' },
  bun: { name: 'Bun', look: 'bun', sex: 'f', kind: 'adult', age: 36, ft: `5'4"`, role: 'the baker at Crumb Bakery', acc: 'holding a fresh loaf of bread in both hands, a warm, floury smile' },
  page: { name: 'Page', look: 'page', sex: 'f', kind: 'adult', age: 38, ft: `5'6"`, role: 'the librarian at The Hush Library', acc: 'a book held to her chest and one finger raised at chest height, asking for quiet with a gentle shushing look', glasses: true },
  fern: { name: 'Fern', look: 'fern', sex: 'f', kind: 'adult', age: 45, ft: `5'5"`, role: 'the gardener at Sprout House', acc: 'a small metal watering can in one hand, soil on her gardening gloves' },
  kit: { name: 'Kit', look: 'kit', sex: 'f', kind: 'adult', age: 29, ft: `5'7"`, role: 'the mail carrier at Snail Mail', acc: 'a brown paper parcel tied with string held under one arm, an unhurried, cheerful stance' },
  oolong: { name: 'Oolong', look: 'oolong', sex: 'f', kind: 'adult', age: 68, ft: `5'2"`, role: 'the owner of Kettle Cottage tea shop', acc: 'a small porcelain teacup and saucer held in both hands, a gossipy, twinkling smile' },
  luna: { name: 'Luna', look: 'luna', sex: 'f', kind: 'adult', age: 41, ft: `5'5"`, role: 'the astronomer at the Moon Club observatory', acc: 'a small brass telescope held in one hand, eyes bright with wonder' },
  penny: { name: 'Penny', look: 'penny', sex: 'f', kind: 'adult', age: 52, ft: `5'4"`, role: "the shopkeeper of Penny's Pockets", acc: 'a small drawstring pouch in one hand, a shrewd, friendly smile' },
  nickel: { name: 'Nickel', look: 'nickel', sex: 'f', kind: 'adult', age: 50, ft: `5'6"`, role: "the shopkeeper of Nickel's, Penny's partner", acc: 'one hand resting on a shop apron pocket, a confident, businesslike smile' },
  sal: { name: 'Sal', look: 'sal', sex: 'm', kind: 'adult', age: 50, ft: `5'8"`, role: 'the driver of the Long Island Taxi, cab seven', acc: 'a set of cab keys dangling from one finger, a relaxed, chatty look' },
  sol: { name: 'Sol', look: 'sol', sex: 'm', kind: 'adult', age: 52, ft: `5'7"`, role: "Sal's cousin, the one driver of Angel City Cab Company", acc: 'a pair of cab keys in one hand, a dry, knowing smile, family resemblance to Sal' },
  skye: { name: 'Skye', look: 'skye', sex: 'f', kind: 'adult', age: 24, ft: `5'6"`, role: 'a Downtown LA loft resident who films videos', acc: 'holding a phone low at her chest as if about to film, a bright, camera-ready smile' },
  chet: { name: 'Chet', look: 'chet', sex: 'm', kind: 'adult', age: 30, ft: `5'11"`, role: 'an actor who works as a car valet at a tower', acc: 'a set of car keys held up in one hand, a polished, hopeful, slightly dramatic pose' },
  wes: { name: 'Wes', look: 'wes', sex: 'm', kind: 'adult', age: 33, ft: `5'10"`, role: 'a screenwriter who lives in the lofts', acc: 'a laptop tucked under one arm and a pencil behind his ear, a distracted, thoughtful look' },
  boomie: { name: 'Boomie', look: 'boomie', sex: 'f', kind: 'adult', age: 44, ft: `5'6"`, role: "Tom's friend from Downtown LA, a gospel and soul singer about to go on tour (a human woman)", acc: 'one hand pressed to her heart and the other open wide, mid-song, a huge, kind smile', over: { skin: '#6a4030', hair: '#2a2220', shirt: '#e97c2e', pants: '#2a5286', hat: null } },
  bev: { name: 'Bev', look: 'bev', sex: 'f', kind: 'adult', age: 66, ft: `5'3"`, role: 'a tourist visiting from Ohio', acc: 'a camera on a strap around her neck and a folded tourist map in one hand, an excited smile' },
  priya: { name: 'Priya', look: 'priya', sex: 'f', kind: 'adult', age: 35, ft: `5'4"`, role: 'an office worker on the 34th floor of the Grand Tower', acc: 'a staff badge on a lanyard and a tablet held to her chest, a polite, slightly wistful look' },
  juniper: { name: 'Juniper', look: 'juniper', sex: 'f', kind: 'adult', age: 28, ft: `5'6"`, role: 'the barista at Golden Hour Coffee', acc: 'a paper coffee cup held out in one hand, a sunny, dreamy smile' },
  kenji: { name: 'Kenji', look: 'kenji', sex: 'm', kind: 'adult', age: 45, ft: `5'7"`, role: 'the chef at Ramen Ramen', acc: 'a steaming ramen bowl held in both hands, standing proud in a chef jacket' },
  sage: { name: 'Sage', look: 'sage', sex: 'f', kind: 'adult', age: 32, ft: `5'8"`, role: 'the owner of Very Green Juice', acc: 'a tall green juice in a glass held up in one hand, a serene, calm smile' },
  marguerite: { name: 'Marguerite', look: 'marguerite', sex: 'f', kind: 'adult', age: 66, ft: `5'5"`, role: 'the keeper of Backlot Wardrobe', acc: 'a measuring tape draped around her neck and a pincushion on one wrist, a sharp, kind look', glasses: true },
  dolores: { name: 'Dolores', look: 'dolores', sex: 'f', kind: 'adult', age: 60, ft: `5'4"`, role: 'the owner of the Starlite cinema', acc: 'a paper ticket held between two fingers, an elegant, proud stance' },
  dash: { name: 'Dash', look: 'dash', sex: 'm', kind: 'adult', age: 27, ft: `5'10"`, role: 'the clerk of the Board Room skate shop', acc: 'a skateboard held under one arm, a laid-back, easy slouch' },
  washington: { name: 'Mr. Washington', look: 'washington', sex: 'm', kind: 'adult', age: 77, ft: `5'9"`, role: 'a Jefferson Park neighbour who has lived on the same porch since 1979', acc: 'a coffee mug held in one hand, standing relaxed and content, a gentle, settled smile' },
  marisol: { name: 'Marisol', look: 'marisol', sex: 'f', kind: 'adult', age: 40, ft: `5'6"`, role: 'a Jefferson Park neighbour walking her dog', acc: 'holding the looped end of an empty dog leash in one hand, looking amused and a little distracted' },
  larry: { name: 'Larry', look: 'larry', sex: 'm', kind: 'adult', age: 55, ft: `5'9"`, role: 'a Jefferson Park neighbour who blows leaves', acc: 'a handheld leaf blower in one hand pointed at the ground, a cheerful, contented look' },
  bernadette: { name: 'Bernadette', look: 'bernadette', sex: 'f', kind: 'adult', age: 66, ft: `5'4"`, role: 'the Neighborhood Watch Captain of Old Oak Park for 19 years', acc: 'a small pair of binoculars hanging on her chest and a whistle on a cord, arms folded, a stern but fond look', over: { hat: null } },
  odette: { name: 'Miss Odette', look: 'odette', sex: 'f', kind: 'adult', age: 70, ft: `5'4"`, role: "the cook of Odette's Creole Kitchen", acc: 'a long wooden spoon held up like a scepter, a warm, welcoming, motherly smile' },
  carmen: { name: 'Doña Carmen', look: 'carmen', sex: 'f', kind: 'adult', age: 58, ft: `5'3"`, role: 'the owner of Pupuseria La Ceiba', acc: 'a plate of golden pupusas held out with both hands and a clean apron over her clothes, a big welcoming smile' },
  ray: { name: 'Ray', look: 'ray', sex: 'm', kind: 'adult', age: 45, ft: `5'11"`, role: 'the security guard at the Sunset Gold Studios gate', acc: 'a clipboard held against his chest, a firm but friendly stance, feet planted' },
  toni: { name: 'Toni', look: 'toni', sex: 'f', kind: 'adult', age: 38, ft: `5'6"`, role: 'the craft services cook at the film studio', acc: 'a tray of fresh bagels held out in front of her, an apron over her white shirt, a generous grin' },
  kiki: { name: 'Kiki', look: 'kiki', sex: 'f', kind: 'adult', age: 25, ft: `5'4"`, role: 'a production assistant on a film set', acc: 'a headset on her head and two radios clipped to her belt, wide-eyed and a bit frazzled' },
  dana: { name: 'Dana', look: 'dana', sex: 'f', kind: 'adult', age: 35, ft: `5'6"`, role: 'a first-time film director', acc: 'a small director viewfinder held up in one hand, a nervous, hopeful smile' },
  alvarez: { name: 'Mrs. Alvarez', look: 'alvarez', sex: 'f', kind: 'adult', age: 66, ft: `5'2"`, role: 'the matriarch of the Casa Alvarez household of ten', acc: 'one hand on her hip and the other holding a wooden spoon, a no-nonsense but loving expression' },
  beto: { name: 'Don Beto', look: 'beto', sex: 'm', kind: 'adult', age: 80, ft: `5'4"`, role: "the Alvarez family's grandfather, who loves his chair", acc: 'a small transistor radio held in one hand, a mellow, amused smile, standing a little stooped' },
  tony: { name: 'Tony', look: 'tony', sex: 'm', kind: 'adult', age: 42, ft: `5'8"`, role: 'a member of the Alvarez household, saving for a home with Yesenia', acc: 'arms crossed over his chest, a wry, tired-but-hopeful half smile' },
  yesenia: { name: 'Yesenia', look: 'yesenia', sex: 'f', kind: 'adult', age: 38, ft: `5'5"`, role: 'a member of the Alvarez household, Tony\'s partner and a busy mother', acc: 'one hand held up like a stop sign and the other on her hip, an alert, frazzled look' },
  claudia: { name: 'Claudia', look: 'claudia', sex: 'f', kind: 'adult', age: 27, ft: `5'4"`, role: 'a night shift nurse in the Alvarez household', acc: 'a stethoscope around her neck and a sleepy, kind smile, holding a travel pillow under one arm' },
  kevin: { name: 'Kevin', look: 'kevin', sex: 'm', kind: 'child', age: 11, ft: `4'8"`, role: 'a boy in the Alvarez household', acc: 'a sports water bottle in one hand and a comically resigned shrug' },
  daisy: { name: 'Daisy', look: 'daisy', sex: 'f', kind: 'child', age: 13, ft: `5'0"`, role: 'a girl in the Alvarez household who is making a documentary', acc: 'a small handheld video camera held low at her chest, a mischievous, serious-filmmaker smile' },
  mateo: { name: 'Mateo', look: 'mateo', sex: 'm', kind: 'child', age: 5, ft: `3'6"`, role: 'a little boy in the Alvarez household who loves trucks', acc: 'a toy dump truck held up high in both hands, mouth open in a delighted shout' },
  sofi: { name: 'Sofi', look: 'sofi', sex: 'f', kind: 'child', age: 4, ft: `3'3"`, role: 'the littlest girl in the Alvarez household, who pretends to be a dinosaur', acc: 'both hands curled like little dinosaur claws, a fierce, giggly roar face' },
  jordan: { name: 'Jordan', look: 'jordan', sex: 'm', kind: 'adult', age: 36, ft: `5'10"`, role: 'a house renovator who lives with Sam', acc: 'a tape measure clipped to his belt and a small hammer in one hand, a proud, handy stance' },
  sam: { name: 'Sam', look: 'sam', sex: 'f', kind: 'adult', age: 34, ft: `5'7"`, role: 'a house renovator who lives with Jordan and posts everything online', acc: 'a phone held up in one hand, a quick, delighted smile' },
  dakota: { name: 'Dakota', look: 'dakota', sex: 'f', kind: 'adult', age: 36, ft: `5'8"`, role: 'a homeowner restoring a 1912 house with Ryan', acc: 'a paintbrush held in one hand, a fond, determined smile' },
  ryan: { name: 'Ryan', look: 'ryan', sex: 'm', kind: 'adult', age: 38, ft: `5'11"`, role: 'a new father and homeowner, Dakota\'s partner', acc: 'one open hand held out low at waist height in a gentle keep-it-down gesture, well below the chin and away from the face, a baby monitor in the other hand, exhausted but happy' },
  vance: { name: 'Julian Vance', look: 'longcoat', sex: 'm', kind: 'adult', age: 58, ft: `6'1"`, role: 'the quiet, polite man in the long coat who paused the world at its happiest afternoon, never without his hat', acc: 'hands clasped loosely in front of him, a calm, courteous, faintly sad smile' },
  marlowe: { name: 'Monochrome Marlowe', look: 'marlowe', sex: 'm', kind: 'adult', age: 45, ft: `5'10"`, role: "Vance's fixer, who takes the color out of places, always carrying a clipboard that reads NOTES: LESS", acc: 'a clipboard held to his chest with NOTES: LESS written on it, a flat, tired, apologetic look', over: { shirt: '#9ea3ab', pants: '#2c2c33' } },
};

const BATCHES = [
  { title: 'Square and Pier wanderers', keys: ['pip', 'moss', 'dot', 'gus', 'bean', 'reel'], note: 'Pip, Moss, Dot are children; Pip and Moss boys, Dot a girl (genders and exact heights assumed)' },
  { title: 'Long Island Elementary people', keys: ['pruitt', 'delgado', 'kowalski', 'ike', 'halverson'], note: 'ages and heights assumed' },
  { title: 'Long Island shopkeepers', keys: ['bun', 'page', 'fern', 'kit', 'oolong', 'luna'], note: 'ages and heights assumed' },
  { title: 'Coin sellers and cab cousins', keys: ['penny', 'nickel', 'sal', 'sol'], note: 'ages and heights assumed' },
  { title: 'Downtown LA locals', keys: ['skye', 'chet', 'wes', 'boomie', 'bev', 'priya'], note: 'Boomie skin and clothes taken from her game sprite, ages and heights assumed' },
  { title: 'Downtown and Jefferson Park shopkeepers', keys: ['juniper', 'kenji', 'sage', 'marguerite', 'dolores', 'dash'], note: 'ages and heights assumed' },
  { title: 'Jefferson Park and Old Oak Park neighbours', keys: ['washington', 'marisol', 'larry', 'bernadette', 'odette', 'carmen'], note: 'ages and heights assumed' },
  { title: 'Studio gate crew', keys: ['ray', 'toni', 'kiki', 'dana'], note: 'ages and heights assumed' },
  { title: 'Casa Alvarez grown-ups', keys: ['alvarez', 'beto', 'tony', 'yesenia', 'claudia'], note: 'ages and heights assumed' },
  { title: 'Casa Alvarez kids', keys: ['kevin', 'daisy', 'mateo', 'sofi'], note: 'children; ages and heights assumed' },
  { title: 'Jordan and Sam, Dakota and Ryan', keys: ['jordan', 'sam', 'dakota', 'ryan'], note: 'ages and heights assumed' },
  { title: 'Vance and Marlowe', keys: ['vance', 'marlowe'], note: 'Tom 2026-11-10: every NPC needs a hero; ages and heights assumed, colors from the game palettes longcoat and marlowe' },
];


// Groups of 2 to 3 people from each batch (a batch of 6 is 3+3, 5 is 3+2, 4 is 2+2), so every person gets a big cell and one shared scale.
const GROUPS = [];
BATCHES.forEach((b, bi) => {
  const n = b.keys.length, sizes = n === 6 ? [3, 3] : n === 5 ? [3, 2] : n === 2 ? [2] : [2, 2];
  let at = 0;
  for (const sz of sizes) { const keys = b.keys.slice(at, at + sz); at += sz; GROUPS.push({ keys, batch: b.title, la: bi + 1 >= 5, id: keys.join('-') }); }
});

const entries = [];
// NPC hero prompts (Tom 2026-11-09 17:16): Tom's template below, word for word (the one that made the main heroes he is happy with),
// one short line naming the attached reference, then one "character details" line. Every entry attaches the human main heroes
// (5 of them, full size) as the style references. Hair styles were read off the earlier approved NPC pictures so each person keeps their look. Fewer words = truer pictures.
// The generator takes at most 5 reference pictures, each sent full size so the pencil lines and paper grain survive (a 7-hero lineup was
// shrunk to about 300 px a figure and came back clean and digital, Tom 11-09 17:43). Adults get the 5 adult heroes; children get Grace,
// Rose and 3 adults.
const HERO = id => `art/raw/characters/${id}-hero-ref-v1.png`;
const ADULT_REFS = ['tom', 'tnb', 'amy', 'deedee', 'boppy'].map(HERO);
const CHILD_REFS = ['grace', 'rose', 'tom', 'amy', 'deedee'].map(HERO);
const TEMPLATE = `Paint the person in the below description  as a new game character in the style of the hand-drawn character concept art of Final Fantasy IX: large head, small slender body, sturdy shoes, large gentle eyes, whimsical fairy-tale charm, but still matching the age of the character. try to find the key physical attributes of the face from the original photo and translate it to the art style.
Finish: illustrated painting with dark contour lines, chunky brushed shading in a few clear tones, rich warm colors, warm golden light from above.
Proportions: about 4 heads tall, simplified expressive face.
Pose: full body from hair to shoes, standing ready, facing the viewer, arms loose, both feet on the ground.
Plain pale cream background with a small soft shadow under the feet. Tall picture, 2:3.`;
const REFS_LINE = `The attached pictures are main characters of this game. Paint this new character by the same hand: sketchy pencil and ink lines, hatching, mottled colored-pencil shading, visible paper grain, same proportions and head size. Not clean digital art. Do not copy their faces, hair or clothes. Paint only the new character, alone.`;
const HS = {
  pip: 'short messy curls', moss: 'short and straight', dot: 'chin-length bob', gus: 'short fluffy wisps', bean: 'shoulder-length waves', reel: 'short and wispy',
  pruitt: 'short, neatly side-swept', delgado: 'short, thick and messy', kowalski: 'shoulder-length waves', ike: 'short and thin', halverson: 'short and tousled with a side part',
  bun: 'short curly bob', page: 'long and wavy', fern: 'chin-length wavy bob', kit: 'shoulder-length big curls', oolong: 'short curly bob', luna: 'long and wavy',
  penny: 'short curly bob', nickel: 'short choppy bob', sal: 'short and wavy', sol: 'short and neat', skye: 'long and wavy', chet: 'short, swept up and a little messy',
  wes: 'short and shaggy', boomie: 'big voluminous curls to the shoulders', bev: 'short and curly', priya: 'shoulder-length and straight', juniper: 'shoulder-length waves',
  kenji: 'short and neat', sage: 'wavy bob to the jaw', marguerite: 'short curls pinned up', dolores: 'curly updo', dash: 'short and messy', washington: 'close-cropped',
  marisol: 'long and wavy', larry: 'short and wavy', bernadette: 'big curly bob', odette: 'short curls', carmen: 'shoulder-length curls', ray: 'short, with a thin moustache and goatee',
  toni: 'long and curly', kiki: 'chin-length choppy bob', dana: 'short bob', alvarez: 'short curly bob', beto: 'short and thin', tony: 'short and messy',
  yesenia: 'shoulder-length messy waves', claudia: 'shoulder-length curls', kevin: 'short and spiky', daisy: 'chin-length messy bob', mateo: 'short and spiky',
  sofi: 'wild and messy to the shoulders', jordan: 'short and neat', sam: 'shoulder-length waves', dakota: 'shoulder-length waves', ryan: 'short and tousled',
  vance: 'short, dark and neatly combed back', marlowe: 'short, grey and flat',
};
const PERS = {
  pip: 'proud and playful', moss: 'curious and quiet', dot: 'thoughtful and precise', gus: 'easygoing and unhurried', bean: 'cheerful and never quite lost', reel: 'weathered and friendly',
  pruitt: 'calm and seen-it-all', delgado: 'friendly and warm', kowalski: 'bright and organized', ike: 'proud and nostalgic', halverson: 'tired but wry',
  bun: 'warm and welcoming', page: 'gentle and bookish', fern: 'patient and earthy', kit: 'unhurried and cheerful', oolong: 'gossipy and twinkly', luna: 'full of wonder',
  penny: 'shrewd and friendly', nickel: 'confident and businesslike', sal: 'relaxed and chatty', sol: 'dry and knowing', skye: 'bright and camera-ready', chet: 'hopeful and a little dramatic',
  wes: 'distracted and thoughtful', boomie: 'joyful and big-hearted', bev: 'excited and curious', priya: 'polite and a little wistful', juniper: 'sunny and dreamy',
  kenji: 'proud and focused', sage: 'serene and calm', marguerite: 'sharp but kind', dolores: 'elegant and proud', dash: 'laid-back', washington: 'gentle and content',
  marisol: 'amused and a little distracted', larry: 'cheerful and contented', bernadette: 'stern but fond', odette: 'warm and motherly', carmen: 'big-hearted and welcoming',
  ray: 'firm but friendly', toni: 'generous and grinning', kiki: 'wide-eyed and frazzled', dana: 'nervous but hopeful', alvarez: 'no-nonsense but loving',
  beto: 'mellow and amused', tony: 'wry, tired but hopeful', yesenia: 'alert and frazzled', claudia: 'sleepy and kind', kevin: 'comically resigned',
  daisy: 'mischievous and serious about her film', mateo: 'loud and delighted', sofi: 'fierce and giggly', jordan: 'proud and handy', sam: 'quick and delighted',
  dakota: 'fond and determined', ryan: 'exhausted but happy',
  vance: 'calm, courteous and quietly certain', marlowe: 'flat, tired and apologetic',
};
// Work clothes where the job has a look; everyone else gets plain clothes in their game colors.
const CS = { kenji: 'a white chef jacket and chef hat', bun: 'a baker apron and a puffy baker hat', ray: 'a navy security guard uniform and cap', claudia: 'nurse scrubs',
  toni: 'an apron over a white shirt', carmen: 'an apron over her clothes', marguerite: 'a measuring tape around the neck', kiki: 'a headset and radios on the belt', halverson: 'a teacher lanyard',
  vance: 'a long dark coat', marlowe: 'a plain grey suit jacket, so the whole outfit is grey' };
// Hats (Tom 2026-11-10): a hat appears only when it is a work hat (chef, baker and security cap in CS, plus the job hats below) or when it shows
// personality (5 percent of the 56 people = 3: Luna, Ike, Pip). The palette's `hat` colour supplies the colour; everyone not listed has no hat.
const HAT = {
  kit: 'postal cap', sal: 'driver flat cap', sol: 'driver flat cap', reel: 'weathered fishing hat', fern: 'wide straw sun hat', larry: 'work cap', odette: 'cook cap', toni: 'kitchen cap',   // job hats
  vance: 'brimmed hat he never takes off',   // story hat (canon: the man in the long coat never took his hat off), not a personality hat
  luna: 'floppy wide-brim hat with a small brass star pin', ike: 'tweed flat cap', pip: 'bucket hat worn a little crooked with a feather tucked in the band',   // personality hats
};
function details(c, k) {
  const p = { ...PAL[c.look], ...(c.over || {}) };
  const who = c.kind === 'child' ? (c.sex === 'f' ? 'girl' : 'boy') : (c.sex === 'f' ? 'woman' : 'man');
  const pants = p.pants === p.shirt ? 'matching trousers' : `${cw(p.pants, CLOTH)} trousers`;
  const cloth = [`${cw(p.shirt, CLOTH)} top`, pants, HAT[k] && p.hat ? `${/^[aeiou]/.test(cw(p.hat, CLOTH)) ? 'an' : 'a'} ${cw(p.hat, CLOTH)} ${HAT[k]}` : null, CS[k] || null, c.glasses ? 'round glasses' : null].filter(Boolean).join(', ');
  return `character details: ${c.name}, ${c.age}, ${who}, ${c.ft} tall, ${cw(p.skin, SKIN)} skin, ${p.hair ? cw(p.hair, HAIR) : 'no visible'} hair, hair style ${HS[k]}, clothing ${cloth}, personality ${PERS[k]}, ${c.role}.`;
}
for (const k of Object.keys(N)) {
  const c = N[k], la = GROUPS.find(g => g.keys.includes(k)).la;
  if (!HS[k] || !PERS[k]) throw new Error('missing hair style or personality: ' + k);
  entries.push({ id: 'npc-photo-' + k, tab: 'NPCs', group: la ? 'Los Angeles people' : 'Long Island people', title: `${c.name}: hero picture, Final Fantasy IX style, ${c.ft} (references: 5 main heroes)`, ar: '2:3', refs: (c.kind === 'child' ? CHILD_REFS : ADULT_REFS).slice(), prompt: TEMPLATE + '\n\n' + REFS_LINE + '\n\n' + details(c, k) });
}
module.exports = { entries, N, BATCHES, GROUPS, PAL, SKIN, HAIR, CLOTH, cw };
