// Prop sheet prompts for the Art Library (tab Props). Required by make-prompts.js.
// One entry = one 4 x 4 sheet (at most 15 props). Props come from tools/sprite-bake/src/props/props.json.
// Each character's list is split into the fewest sheets of at most 15, balanced sizes, list order kept; cell numbers restart at 1 per sheet.
// Only the style key is attached (the old pixel-style prop sheets must not be attached).
const fs = require('fs');
const path = require('path');
const PROPS = JSON.parse(fs.readFileSync(path.join(__dirname, '../sprite-bake/src/props/props.json'), 'utf8'));
const REF_KEY = 'docs/reference/style_key_v1.png';

const ORDER = ['tom', 'grace', 'rose', 'amy', 'deedee', 'boppy', 'tnb', 'tombo', 'nara', 'justin'];
const LABEL = { tom: 'Tom', grace: 'Grace', rose: 'Rose', amy: 'Amy', deedee: 'Deedee', boppy: 'Boppy', tnb: 'TNB', tombo: 'Tombo', nara: 'Nara', justin: 'Justin' };

// Short plain descriptions where the bare name is not enough or is ambiguous. Keyed by slug (per character where slugs repeat).
const DESC = {
  gadget: 'a small handheld electronic gadget with a screen and two buttons',
  max_gadget_box: 'a sleek shipping box for a gadget, with a printed gadget picture and the word MAX on it',
  glyph_tiles: 'a small set of square stone tiles, each with a different bold painted symbol',
  question_tile: 'one square tile with a big question mark',
  false_stamp: 'a rubber stamp with a red inked impression that says FALSE',
  retro_console: 'a boxy home video game console in cream and grey with a cartridge slot on top, a power button and a short cable',
  game_cartridge: 'a chunky grey game cartridge with a colorful label',
  easel_chart: 'a flip chart on a wooden easel with a simple painted bar chart',
  giant_floor_controller: 'a huge game controller lying flat like a floor mat, with big round buttons',
  airline_suite_door: 'a sleek private cabin door in deep navy with a brass handle',
  gate_0_door: 'a door with a large number 0 sign above it',
  moon: 'a glowing crescent moon',
  hanging_rail: 'a wooden rail with hooks for hanging kitchen things',
  crisp_pan: 'a baking pan of golden brown crisp with one corner piece cut out',
  scoville_meter: 'a round dial gauge that reads pepper heat, with a needle and a red zone',
  turbo_fan: 'a sleek tabletop fan with a round cage and three blades',
  last_train_subway_car: 'one subway car with lit windows, seen from the side',
  red_line_subway_train: 'a short red subway train seen from the side',
  gold_transfer_card: 'a gold transit transfer card',
  card_reader: 'a small transit card reader with a screen and a glowing slot',
  light_rail_train: 'a light-rail train car seen from the side',
  slasher_standee: 'a cardboard standee of a masked horror movie villain, goofy rather than scary',
  clay_pigeon: 'an orange clay disc for target shooting, like a flying saucer',
  kiln_cone: 'a tiny slender clay cone used in a pottery kiln',
  slip_bucket: 'a bucket of creamy clay slip',
  disc_golf_basket: 'a disc golf basket on a pole with hanging chains',
  gantt_board: 'a whiteboard with a colorful project timeline chart of horizontal bars',
  squirrel_peek: 'a chubby grey squirrel peeking over the top edge',
  squirrel_run: 'a chubby grey squirrel running',
  squirrel_tip_hat: 'a chubby grey squirrel tipping a tiny hat',
  squirrel_on_branch: 'a chubby grey squirrel sitting on an oak branch',
  face_eyes_open: 'a happy dog face with large, warm, human-looking eyes, open',
  face_eyes_closed: 'a happy dog face with the same human-looking eyes, closed in bliss',
  happy_puddle: 'a puddle of water with a smiling face',
  homemade_stamp: 'a rubber stamp mark that says HOMEMADE',
  wall_intact: 'a plain basement wall section of painted drywall, undamaged',
  drywall_sheet: 'a standing sheet of drywall with four screws in it',
  drywall_sheet_leaning: 'a sheet of drywall leaning at an angle',
  drywall_square_patched: 'a square of drywall with a neat patch',
  splintered_stud: 'a splintered wooden wall stud',
  dust_puff: 'a soft puff of grey dust',
  couch: 'a comfortable family living room couch',
  tv_off: 'a wide flat-screen TV, switched off, dark screen',
  tv_basketball: 'a wide flat-screen TV showing a basketball game',
  tv_football: 'a wide flat-screen TV showing a football game',
  plaster_chunk: 'a chunk of plaster with a few loose crumbs',
  giant_8_bit_music_note: 'a giant music note in a bold, blocky, chunky shape',
  ymamot_creation_sign: 'a hand-lettered sign that says YMAMOT CREATION',
  mom_placard: 'a small placard that says MOM',
  rooftop_ledge: 'a short section of rooftop edge wall in concrete',
  new_york_skyline: 'a row of skyscrapers forming a New York skyline',
  gold_picture_frame: 'an empty ornate gold picture frame',
  amber_hourglass: 'an hourglass filled with glowing amber sand',
  wall_of_clocks: 'a section of wall covered with many different clocks',
  film_reel_screen: 'a small movie screen with a film reel beside it',
  cream_eight_seat_table: 'a long cream dining table with eight place settings',
  red_striped_family_table: 'a family dining table with a red striped tablecloth',
  lie_flat_pod: 'a lie-flat airline seat pod with a pillow and blanket',
  airliner: 'a passenger airliner seen from the side',
  stethoscope: 'a nurse stethoscope',
  rn_badge: 'a nurse ID badge on a clip that reads RN',
  kiss_mark: 'a red lipstick kiss mark',
  hot_mild_sign: 'a hand-lettered sign that says HOT MILD',
  family_first_ticket: 'a paper ticket that says FAMILY FIRST',
  reserved_card: 'a folded table card that says RESERVED',
  walking_speed_sign: 'a small road sign with a walking speed limit',
  jail_cell_door: 'a barred jail cell door, friendly looking',
  password_sign: 'a hand-drawn sign that says PASSWORD?',
  hill_with_flag: 'a small grassy hill with a flag on top',
  ear_rings: 'a few curved sound rings radiating outward',
  screech_burst: 'a jagged burst shape with a bold screech lettering',
  sketch_burst: 'a burst of rough pencil sketch marks',
  gem_hopper: 'a wooden funnel hopper filled with gems',
};
const NAME_FIX = { 'Giant 8-Bit Music Note': 'Giant blocky music note', 'Retro console': 'Home video game console' };

function split(list) {
  const s = Math.ceil(list.length / 15);
  const base = Math.floor(list.length / s), extra = list.length % s;
  const out = []; let i = 0;
  for (let k = 0; k < s; k++) { const n = base + (k < extra ? 1 : 0); out.push(list.slice(i, i + n)); i += n; }
  return out;
}
const lc = s => s.charAt(0).toLowerCase() + s.slice(1);
function line(cell, p) {
  const [, slug, rawName] = p;
  const name = NAME_FIX[rawName] || rawName;
  const d = DESC[slug];
  const caps = (rawName.match(/\b[A-Z][A-Z0-9?-]*(?: [A-Z0-9][A-Z0-9?-]*)*\b/g) || []).filter(w => w.length > 2 && /[A-Z]{2}/.test(w) && !/^(LIKE|RN|BQ)$/.test(w) || false);
  const letter = caps.length && !(d && /says|reads|word/.test(d)) ? ` The lettering on it reads exactly "${caps[0]}".` : '';
  return `${cell}. ${name.toUpperCase()}: ${d ? d.charAt(0).toUpperCase() + d.slice(1) : 'painted as one clear, recognizable object, exactly as the name says, with no extra items'}.${letter}`;
}

const ART = `ART STYLE
- Every object is painted by hand in the style of the attached style key: dense painted texture, fine visible brushwork, deep saturated jewel colors, crisp clean edges, clear readable shapes. Gently simplified, storybook-like shapes.
- Warm golden key light from the upper left. Shadow on the lower right of each form, and at most a tiny soft contact shadow under each object, no cast shadow on a floor, no ground plane.
- No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette, no glossy plastic look.`;

function sheet(label, items) {
  const n = items.length;
  const list = items.map((p, i) => line(i + 1, p)).join('\n');
  return `IMAGE REQUEST: ONE SINGLE PROP SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game. This is the sheet for ${label}: it holds ${n} standalone battle props that will be cut out and used in animations.

ATTACHED IMAGES (in this order)
1. The STYLE KEY, a finished painting of the family in a school yard. Match how it paints: dense painted texture, fine visible brushwork, deep saturated colors, warm light. Do not copy any person, building or scene from it. Paint only the props listed below.

${ART}
- Three-quarter view from slightly above for every object. All objects share one lighting direction and one level of detail. Fun, friendly, a little silly. Family friendly for children aged 6 and up.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024 pixels. If your tool offers a different size, keep exactly 4 columns and 4 rows and use the largest size available.
- Exactly ${n} objects, one per cell, filled left to right, top to bottom, in the order of the numbered list below. The final cells (numbers ${n + 1} to 16) must stay completely empty and transparent, with no number.
- Each object is drawn complete, centered in its own cell, fully inside it, with at least 12 percent empty margin on every side. Nothing touches or crosses a cell edge. Nothing overlaps a neighbouring cell.
- Scale every object to fill about 70 to 80 percent of its cell, regardless of its real-world size. Small things are enlarged to the same footprint.
- Background: fully transparent (PNG with alpha). No grid lines, no borders, no frames, no cell backgrounds, no checkerboard pattern. If your tool cannot output transparency, fill the entire background with one flat solid color, pure magenta #FF00FF, and use no magenta anywhere inside the objects.
- In the top-left corner of every filled cell, put a small plain white number (with a thin dark outline) matching the list number. These numbers are a guide only and will be cropped off. Do not put any other labels, captions or titles on the sheet. The only text allowed is the text that is part of the prop itself, spelled exactly as given in the list.

HARD RULES
- THE LIST IS COMPLETE AND DELIBERATE. Draw exactly the ${n} objects described, one per numbered cell. NEVER substitute, swap in or add other objects, even ones that seem more typical, more common or related to the same theme. If a description is unusual, draw it as written. Every cell must match its numbered description.
- Props only. No people, no characters, no hands, no faces on anything unless the list says the object has a face. No creatures except the ones listed.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, sparkle bursts, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a wisp of steam, a drip, a glint) are fine.
- Do not skip, merge or reorder any item.

THE ${n} OBJECTS (cell number: name, what to draw)
${list}`;
}

const entries = [];
for (const id of ORDER) {
  const list = PROPS[id];
  if (!list) throw new Error('missing character ' + id);
  const sheets = split(list);
  sheets.forEach((items, k) => {
    const first = items[0][0], last = items[items.length - 1][0];
    entries.push({
      id: `prop-${id}-${k + 1}`, tab: 'Props',
      title: `${LABEL[id]} props, sheet ${k + 1} of ${sheets.length} (items ${first} to ${last})`,
      ar: '1:1', refs: [REF_KEY],
      prompt: sheet(`${LABEL[id]}, items ${first} to ${last}`, items),
    });
  });
}
module.exports = { entries };
