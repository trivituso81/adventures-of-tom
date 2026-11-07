// Assigns each Art Library entry a `group`: the section it sits in inside its tab (art.html shows one collapsible header per group).
// Groups come from ids and titles, never from prompt text, so nothing here touches a prompt. Used by make-prompts.js; validate.js only checks the result.
// An entry that already carries its own `group` keeps it. The order of groups on screen is the order entries appear in data/art-prompts.json.
const fs = require('fs');

const PEOPLE = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy', olivia: 'Olivia', michael: 'Michael', jojo: 'Jojo', ellie: 'Aunt Ellie', nara: 'Nara' };
const PROP_GROUPS = { find: 'Dungeon finds', trail: 'Trail clues', gate: 'Story gates' };
const FOE_AREAS = {
  hollow: 'Grump Hollow', griffith: 'Griffith Park', marsh: 'Whispering Marsh', backlot: 'Studio Backlot', school: 'School', oak: 'Old Oak', library: 'Hush Library',
  barn: 'Car Barn', club: 'Moon Club', terminal: 'Terminal Zero', infinity: 'Terminal Infinity', blvd: 'Downtown boulevard', subrail: 'Sub-Rail', row: 'Rivituso Row',
  dinner: 'Dinner Table', square: 'The Square', tower: 'Glass Tower', loom: 'Chronos Loom', deadletter: 'Dead-Letter Office', core: 'Stillness Core', scoops: 'Nine Scoops'
};
const ROOM_GROUPS = {
  'Long Island shops and houses': ['bakery', 'library', 'greenhouse', 'post', 'tea', 'observatory', 'shop', 'taxi', 'amyhouse', 'grands', 'elliehouse'],
  'Los Angeles shops and homes': ['coffee', 'ramen', 'juicebar', 'nickels', 'wardrobe', 'cinema', 'boards', 'lacab', 'tomhouse', 'tomsuite', 'casa', 'loftlobby', 'lofts', 'tower', 'creole', 'pupuseria', 'jordansam', 'dakota'],
  'School': ['school', 'cafetorium'],
  'Library and Moon Club': ['stacks', 'readroom', 'moonclub', 'dome'],
  'Airport': ['terminal', 'gatezero', 'flightzero', 'gate00', 'concourse'],
  'Sub-Rail': ['subdepot', 'subtunnel', 'subchamber'],
  'Glass Tower': ['towerlobby', 'towerstairs', 'towershelves', 'towervault', 'towerpinnacle'],
  'Dead-Letter Office and memories': ['deadletter', 'memgrace', 'memrose', 'memamy', 'memtnb', 'stillcore', 'foreverheart'],
  'Old Oak': ['oak', 'crown'],
  'Studio and Car Barn': ['stage7', 'stageset', 'carbarn', 'boiler']
};
const ROOM_OF = {}; for (const [g, ids] of Object.entries(ROOM_GROUPS)) for (const id of ids) ROOM_OF['room-' + id] = g;
const LA_PLATES = new Set(['area-blvd', 'area-jpark', 'area-griffith', 'area-studio', 'area-backlot', 'area-oakpark']);
const FOE_TABLE = {};
try { for (const l of fs.readFileSync(__dirname + '/prompts/enemy-table.txt', 'utf8').trim().split('\n')) { const [id, area] = l.split('|'); if (id && area) FOE_TABLE['enemy-' + id] = area; } } catch (e) {}

function groupOf(e) {
  const fail = why => { throw new Error('groups.js: no group for ' + e.id + ' (' + why + ')'); };
  switch (e.tab) {
    case 'Characters': { const g = PEOPLE[e.id.split('-')[0]]; return g || fail('unknown person'); }
    case 'NPCs': { const n = +e.id.replace('npc-batch-', ''); return n >= 1 && n <= 4 ? 'Long Island' : n >= 5 ? 'Los Angeles' : fail('batch number'); }
    case 'Areas': {
      if (LA_PLATES.has(e.id)) return 'Los Angeles paintings';
      const g = String(e.title).split(':')[0].trim(); return g.length >= 3 && g.length <= 40 ? g : fail('title');
    }
    case 'Rooms': return ROOM_OF[e.id] || fail('room not in ROOM_GROUPS');
    case 'Props': { const g = PROP_GROUPS[e.id.split('-')[1]]; return g || fail('unknown prop group'); }
    case 'Enemies': { if (e.id === 'test-mudling' || e.id.startsWith('test-grid-') || e.id.startsWith('test-one-')) return 'Test card'; const a = FOE_TABLE[e.id]; return FOE_AREAS[a] || fail('area ' + a); }
    case 'Battle': return /\(NEW\b/.test(e.title) ? 'New backgrounds' : 'Repaints of live backgrounds';
    case 'Title': return 'Title and icon';
    case 'Portraits': return 'Menu portraits';
    case 'Flight': return 'Flight art';
  }
  return fail('unknown tab');
}
module.exports = { groupOf };
