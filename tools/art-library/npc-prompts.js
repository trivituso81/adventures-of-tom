// NPC prompts for the Art Library (tab NPCs). Required by make-prompts.js.
// Two-step method (the one that worked for Grace, CHANGES 99 to 104; replaces the 3 x 2 lineups of 11-05, which came out smooth and cartoon, not in the style key): per group of 2 to 3 NPCs,
//   npc-scene-<keys>  step 1, the group painted INSIDE the school yard painting (gets the dense brushwork), 4:3
//   npc-cut-<keys>    step 2, the same picture with everything but the people replaced by flat magenta, 4:3
// then npc-walk-prompts.js builds one walk sheet per person from the cut. Looks come from the live game palettes
// (scratchpad dump of LE_PALETTES / LA_PALETTES); roles, ages and heights are written below. Assumptions are flagged in the title where they matter.
const fs = require('fs');
const path = require('path');
const DUMP = process.env.NPC_DUMP || '/tmp/claude-0/-home-claude/39197478-1f17-5382-8d0f-e8b30b410449/scratchpad/dump/npcs.json';
const SNAP = path.join(__dirname, 'prompts', 'npc-palettes.json');
let PAL;
if (fs.existsSync(DUMP)) { const d = JSON.parse(fs.readFileSync(DUMP, 'utf8')); PAL = { ...d.lepal, ...d.lapal }; }
else PAL = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

const REF_KEY = 'docs/reference/style_key_v1.png';
const REF_CHART = 'docs/reference/height_chart_v1.png';
// Approved take per group (Tom's pick), used when a later step chains off it. Default is v1.
const APPROVED_TAKE = { 'pip-moss-dot': { scene: 3, cut: 2 } };
const REF_YARD = 'docs/reference/school_style_ref.png';

// Painted cast references (Tom 2026-11-06, replaces the old style key on every NPC entry): finished paintings of party members in the
// NPC's age band. Bands: children (Grace, Rose), adults (Tom, Amy, then TNB, Justin), older adults 60 and up (Deedee, Boppy). Sex picks the
// first adult or older sheet. Scene entries attach hero poses, walk entries attach walk sheets. Reference cap is 5 pictures per entry
// (validate.js), so with the base picture and the height chart there are 3 cast slots for a scene group and 2 for a single walk sheet.
const CAST_NAME = { grace: 'Grace', rose: 'Rose', tom: 'Tom', amy: 'Amy', tnb: 'TNB', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy' };
function castFor(people, kind, slots) {
  const bandOf = c => c.kind === 'child' ? 'child' : c.age >= 60 ? 'older' : 'adult';
  const lists = [];
  const sexes = b => ['m', 'f'].filter(x => people.some(c => bandOf(c) === b && c.sex === x));
  if (people.some(c => bandOf(c) === 'child')) lists.push(['grace', 'rose']);
  if (people.some(c => bandOf(c) === 'older')) lists.push(sexes('older').map(x => x === 'f' ? 'deedee' : 'boppy').concat(['deedee', 'boppy']));
  if (people.some(c => bandOf(c) === 'adult')) lists.push(sexes('adult').map(x => x === 'f' ? 'amy' : 'tom').concat(['amy', 'tom', 'tnb', 'justin']));
  const out = [];
  for (let r = 0; out.length < slots && r < 6; r++) for (const l of lists) { const id = l[r]; if (id && !out.includes(id) && out.length < slots) out.push(id); }
  return { ids: out, refs: out.map(id => `art/raw/characters/${id}-${kind === 'hero' ? 'hero-ref' : 'walk-sheet'}-v1.png`) };
}
const range = (from, n) => n === 1 ? `${from}` : `${from} to ${from + n - 1}`;
const castList = ids => ids.map(i => CAST_NAME[i]).reduce((a, x, i, arr) => a + (i === 0 ? '' : i === arr.length - 1 ? ' and ' : ', ') + x, '');

// ---- color words from hex ----
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const near = (h, table) => { const c = rgb(h); let best = null, bd = 1e9; for (const [n, x] of table) { const r = rgb(x); const d = (c[0] - r[0]) ** 2 + (c[1] - r[1]) ** 2 + (c[2] - r[2]) ** 2; if (d < bd) { bd = d; best = n; } } return best; };
const SKIN = [['very fair', '#f3d3b8'], ['fair', '#efbc8e'], ['light peach', '#e8b48e'], ['warm tan', '#d0a07a'], ['golden tan', '#c69878'], ['olive tan', '#c08a64'], ['medium brown', '#b8805c'], ['warm brown', '#9e7056'], ['rich brown', '#8a5a3c'], ['deep brown', '#6a4030'], ['very deep brown', '#4f3225'], ['pale grey-white', '#d8d4cc']];
const HAIR = [['black', '#2a2220'], ['very dark brown', '#3e3433'], ['dark brown', '#5a4030'], ['chestnut brown', '#754e3c'], ['light brown', '#925f42'], ['dark blond', '#b98a5a'], ['golden blond', '#e8c25a'], ['strawberry blond', '#c98a4a'], ['auburn red', '#a8452f'], ['bright red', '#c9463d'], ['silver grey', '#b7b3ad'], ['white', '#e8e4dc'], ['slate violet', '#626175'], ['teal', '#2f6f73'], ['light blond', '#e3dac2'], ['plum', '#5a3a5a']];
const CLOTH = [['black', '#1b1b1f'], ['charcoal', '#2c2c33'], ['dark grey', '#4a5868'], ['grey', '#9ea3ab'], ['off-white', '#f4f4f0'], ['cream', '#f4ecd2'], ['beige', '#d9c6a0'], ['tan', '#c9b89a'], ['olive brown', '#8a7a5a'], ['brown', '#8a6a48'], ['rust', '#c0613f'], ['red', '#c0392b'], ['coral pink', '#ca7c75'], ['hot pink', '#d65aa0'], ['rose pink', '#f08aa8'], ['orange', '#e2793a'], ['mustard yellow', '#e7b73e'], ['pale yellow', '#f2e2a0'], ['sage green', '#8ca275'], ['grass green', '#6fb35a'], ['forest green', '#3f6a3f'], ['teal', '#3a9ca0'], ['sky blue', '#9ccfd8'], ['cornflower blue', '#7394ae'], ['royal blue', '#2f6fb3'], ['navy', '#2f3a4a'], ['slate blue', '#4a5a8a'], ['lavender', '#a595b8'], ['purple', '#7a3a5a'], ['violet', '#9a7ad0'], ['plum', '#6a4f7a'], ['khaki', '#b2bf86'], ['steel grey-blue', '#63798c'], ['dusty blue', '#77748e'], ['denim blue', '#3f5a74'], ['slate grey', '#3f4650'], ['mint green', '#82a7aa'], ['burnt orange', '#c0613f']];
const cw = (h, t) => `${near(h, t)} (${h})`;

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
  sol: { name: 'Sol', look: 'sol', sex: 'm', kind: 'adult', age: 52, ft: `5'7"`, role: "Sal's cousin, the one driver of Angel City Cab Co.", acc: 'a pair of cab keys in one hand, a dry, knowing smile, family resemblance to Sal' },
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
  bernadette: { name: 'Bernadette', look: 'bernadette', sex: 'f', kind: 'adult', age: 66, ft: `5'4"`, role: 'the Neighborhood Watch Captain of Old Oak Park for 19 years', acc: 'a small pair of binoculars hanging on her chest and a whistle on a cord, arms folded, a stern but fond look' },
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
  ryan: { name: 'Ryan', look: 'ryan', sex: 'm', kind: 'adult', age: 38, ft: `5'11"`, role: 'a new father and homeowner, Dakota\'s partner', acc: 'one finger raised at chest height to ask for quiet, a baby monitor in the other hand, exhausted but happy' },
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
];


// Groups of 2 to 3 people from each batch (a batch of 6 is 3+3, 5 is 3+2, 4 is 2+2), so every person gets a big cell and one shared scale.
const GROUPS = [];
BATCHES.forEach((b, bi) => {
  const n = b.keys.length, sizes = n === 6 ? [3, 3] : n === 5 ? [3, 2] : [2, 2];
  let at = 0;
  for (const sz of sizes) { const keys = b.keys.slice(at, at + sz); at += sz; GROUPS.push({ keys, batch: b.title, la: bi + 1 >= 5, id: keys.join('-') }); }
});

const styleRule = rng => `STYLE RULE (the most important instruction)
Every person looks painted by the same hand as attachment 1 and the cast paintings (attachment${rng.includes('to') ? 's' : ''} ${rng}): dense painted texture, fine visible brushwork, deep saturated colors, crisp detail on hair strands, fabric folds and shoe edges. Skin, hair and fabric are matte and textured like paint on canvas, and fabric keeps the woven texture of attachment 1. Faces are realistic caricature faces like the faces in the cast paintings, with real skin texture and individual character.`;

function proportions(g) {  // the cast paintings are of the same age band as the people painted
  const kids = g.keys.some(k => N[k].kind === 'child'), adults = g.keys.some(k => N[k].kind !== 'child');
  const lines = ['PROPORTIONS (strict)'];
  if (adults) lines.push('- Every adult has an oversized head about one fifth of the full body height, as large relative to the body as the adults in the cast paintings, a slim, full-length body with realistic proportions below the head, small hands and small feet, large expressive eyes and a warm, slightly exaggerated expression. All adults have the SAME head size relative to their bodies.');
  if (kids) lines.push('- Every child has an oversized head a little over one quarter of the full body height, a small body, small hands and small feet, exactly as the children are drawn in the cast paintings.');
  lines.push('- The head size in the cast paintings wins over any number in this section.');
  lines.push('- Heights follow the real heights below and the height chart: a taller person stands visibly taller than a shorter one and a child stands clearly shorter than the adults. Heights are measured from the soles of the shoes to the top of the head.');
  return lines.join('\n');
}

function lookOf(c) {
  const p = { ...PAL[c.look], ...(c.over || {}) };
  const who = c.kind === 'child' ? (c.sex === 'f' ? 'girl' : 'boy') : (c.sex === 'f' ? 'woman' : 'man');
  const hair = p.hair ? `${cw(p.hair, HAIR)} hair` : 'no hair visible';
  const hat = p.hat ? `a hat or cap in ${cw(p.hat, CLOTH)}` : 'no hat';
  const pants = p.pants === p.shirt ? 'matching trousers in the same color' : `trousers in ${cw(p.pants, CLOTH)}`;
  const old = c.age >= 60 ? ' Older: a softer, more lined face and a slightly gentler posture.' : '';
  const glasses = c.glasses ? ' Round glasses.' : ' No glasses.';
  return `${c.name.toUpperCase()}: a ${c.age} year old ${who}, ${c.role}. Real height ${c.ft}. Skin ${cw(p.skin, SKIN)}. ${hair[0].toUpperCase() + hair.slice(1)}. Outfit: a top in ${cw(p.shirt, CLOTH)}, ${pants}, plain simple shoes; ${hat}.${glasses}${old}`;
}

const names = g => g.keys.map(k => N[k].name);
const ordinal = ['first', 'second', 'third'];

function scene(g) {
  const n = g.keys.length, word = n === 2 ? 'two' : 'three';
  const cast = castFor(g.keys.map(k => N[k]), 'hero', 3), rng = range(2, cast.ids.length), chartNo = 2 + cast.ids.length;
  const list = g.keys.map((k, i) => `${i + 1}. ${lookOf(N[k])}`).join('\n');
  const heights = g.keys.map(k => `${N[k].name} is ${N[k].ft}`).join(', ');
  return `IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.

WHAT THIS IS
A painting of ${word} townsfolk standing together in the school yard, for "The Adventures of Tom", a family role-playing game. They are painted INSIDE the school yard scene, in the same sitting by the same artist, so that they have exactly the same painted texture as the scene around them. Each is a distinct individual with their own face, build and style.

ATTACHED IMAGES (in this order)
1. The school yard painting. This is the BACKGROUND and the STYLE TO MATCH. Keep the school building, paths, signs, lamps, parking area and playground exactly as painted, same framing, nothing removed. Match its dense, jewel-toned painted texture, its fine visible brushwork, its deep saturated colors, its warm lamplight and its level of detail in the people.
${rng}. PAINTED CAST: finished full-body paintings of ${castList(cast.ids)}, the family in this game, ${cast.ids.length === 1 ? 'a person' : 'people'} of about the same age as the people you are painting. Match how they paint people, their faces, hair, clothes and shoes, and the head size and body proportions. Do not copy any of their people, faces or outfits.
${chartNo}. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text.

${styleRule(rng)}

${proportions(g)}

THE SCENE
Use the school yard painting as the whole background. The ${word} people below are the only people in the picture. They stand side by side in one straight row across the wide paved walkway in the middle of the picture, in the numbered order below from left to right, all at the same distance from the camera, with their feet on one line on the paving, evenly spaced with clear space between them. Nobody overlaps a neighbour. Each is large in the frame, full body from the top of the hair to the soles of the shoes, so that the face, hair, fabric weave and shoes can be seen in fine detail, while the school yard stays recognizable behind them. Each stands neutral and relaxed, body turned a little (three quarter) toward the viewer, a warm natural smile, face clear and readable, hands empty and relaxed at the sides, both feet flat and fully visible. Each casts a soft shadow on the paving. They are lit by the SAME light as the background: warm orange lamplight from the nearby lamp posts and the school windows, cool blue-violet dusk sky light as fill, with warm rim light on hair and shoulders.
Heights: ${heights}.

THE ${n} PEOPLE (left to right)
${list}
Keep the outfit exactly as given: every color. Never invent a new accessory, hairstyle or color.

NEVER substitute. Draw exactly these ${word} people, in this order, with exactly the colors and heights given. Do not add other people, do not swap faces, do not invent other clothes. No text, no labels, no captions, no speech balloons. Family friendly for ages 6 and up. If anything is unclear, draw each person standing relaxed and smiling in the school yard as described.`;
}

function cut(g) {
  const n = g.keys.length, word = n === 2 ? 'two' : 'three';
  return `IMAGE REQUEST: ONE SINGLE EDIT. Return exactly one image, nothing else.

The attached picture is a finished painting of ${word} people standing in a school yard. Keep the ${word} people EXACTLY as painted: do not redraw, repaint, restyle, sharpen or smooth anything about them. Keep every face, hair strand, piece of clothing, pair of shoes, pose, size, position, color, the lighting and the visible painted brushwork and texture exactly as they are, pixel for pixel in feel.

Change ONLY the background: replace everything that is not one of the ${word} people (the school, the paving, the sky, the lamps, the planters, every shadow on the ground) with one flat solid pure magenta #FF00FF filling the whole rest of the image. No ground, no shadow, no gradient, no border, no text, no labels.

No magenta on the people. No magenta glow, spill, tint or fringe on the edges or hair strands. Keep the edges clean and crisp. Draw nothing new and no one else.`;
}

const entries = [];
// Old two-step method (group scene, then cut) is kept ONLY for the approved Pip, Moss and Dot group, whose approved art is installed.
for (const g of GROUPS.filter(x => x.id === 'pip-moss-dot')) {
  const grp = g.la ? 'Los Angeles people' : 'Long Island people', nm = names(g).join(', ');
  g.sceneId = 'npc-scene-' + g.id; g.cutId = 'npc-cut-' + g.id;
  entries.push({ id: g.sceneId, tab: 'NPCs', group: grp, title: `${nm}: step 1, painted in the school yard (${g.batch})`, ar: '4:3', refs: [REF_YARD, ...castFor(g.keys.map(k => N[k]), 'hero', 3).refs, REF_CHART], prompt: scene(g) });
  entries.push({ id: g.cutId, tab: 'NPCs', group: grp, title: `${nm}: step 2, cut out on magenta (needs step 1 approved)`, ar: '4:3', refs: [`art/raw/npcs/${g.sceneId}-v${(APPROVED_TAKE[g.id]||{}).scene||1}.png`], prompt: cut(g) });
}

// Photo to character (Tom 2026-11-08 23:11): every NPC has one prompt, the fixed Final Fantasy IX style template below (verbatim, Tom's words)
// plus a DETAILS block with that person's look and personality. Never edit the template text; change only the details.
const FF9_TEMPLATE = `PHOTO TO CHARACTER: FINAL FANTASY IX STYLE
Attach: one photo of one person.

Paint the person in the attached photo  as a new game character in the style of the hand-drawn character concept art of Final Fantasy IX: large head, small slender body, sturdy shoes, large gentle eyes, whimsical fairy-tale charm, but still matching the age of the character. try to find the key physical attributes of the face from the original photo and translate it to the art style.
Finish: illustrated painting with dark contour lines, chunky brushed shading in a few clear tones, rich warm colors, warm golden light from above.
Keep this person's hair, face shape, age, build, skin tone, and the same garments and colors.
Proportions: about 4 heads tall, simplified expressive face.
Pose: full body from hair to shoes, standing ready, facing the viewer, arms loose, both feet on the ground.
Plain pale cream background with a small soft shadow under the feet. Tall picture, 2:3.`;
// Tom 2026-11-08 23:55: repeat "Final Fantasy IX" and "hand drawn" as many times as possible. The template above stays verbatim; this block only reinforces it.
const FF9_REMINDER = c => `STYLE REMINDER: this is a hand drawn Final Fantasy IX character. Draw ${c.name} as hand drawn Final Fantasy IX concept art, not a photo, not a 3D render, not pixel art. Hand drawn Final Fantasy IX linework with dark contour lines. Hand drawn Final Fantasy IX chunky brushed shading. Hand drawn Final Fantasy IX proportions: large head, small slender body, sturdy shoes, large gentle eyes, whimsical fairy-tale charm. Every part of ${c.name}, the face, the hair, the clothes and the shoes, is hand drawn in the Final Fantasy IX style. Final Fantasy IX, hand drawn, full body, standing ready.`;
function details(c) {
  const p = { ...PAL[c.look], ...(c.over || {}) };
  const who = c.kind === 'child' ? (c.sex === 'f' ? 'girl' : 'boy') : (c.sex === 'f' ? 'woman' : 'man');
  const hair = p.hair ? `${cw(p.hair, HAIR)} hair` : 'no hair visible';
  const hat = p.hat ? `a hat or cap in ${cw(p.hat, CLOTH)}` : 'no hat';
  const pants = p.pants === p.shirt ? 'matching trousers in the same color' : `trousers in ${cw(p.pants, CLOTH)}`;
  const old = c.age >= 60 ? ' Older: a softer, more lined face and a slightly gentler posture.' : '';
  const glasses = c.glasses ? 'Round glasses.' : 'No glasses.';
  return `HAND DRAWN FINAL FANTASY IX CHARACTER: ${c.name.toUpperCase()}, a ${c.age} year old ${who}, ${c.role}. Real height ${c.ft}.
Hand drawn Final Fantasy IX appearance: skin ${cw(p.skin, SKIN)}. ${hair[0].toUpperCase() + hair.slice(1)}. Outfit: a top in ${cw(p.shirt, CLOTH)}, ${pants}, sturdy simple shoes; ${hat}. ${glasses}${old}
Hand drawn Final Fantasy IX personality and expression: ${c.acc}.

PORTRAIT USE: this full body picture is also cropped to make ${c.name}'s dialog portrait. Keep the head large and near the top of the picture, and keep the whole face, both eyes and the mouth fully visible, with no hand, prop or hat brim covering any part of the face.

${FF9_REMINDER(c)}`;
}
for (const k of Object.keys(N)) {
  const c = N[k], la = GROUPS.find(g => g.keys.includes(k)).la;
  entries.push({ id: 'npc-photo-' + k, tab: 'NPCs', group: la ? 'Los Angeles people' : 'Long Island people', title: `${c.name}: hero picture, Final Fantasy IX style, ${c.ft} (also the source of the dialog portrait)`, ar: '2:3', refs: [], prompt: FF9_TEMPLATE + '\n\n' + details(c) });
}
module.exports = { APPROVED_TAKE, entries, N, BATCHES, GROUPS, PAL, SKIN, HAIR, CLOTH, cw, REF_KEY, REF_CHART, styleRule, castFor, castList, range, lookOf, ordinal };
