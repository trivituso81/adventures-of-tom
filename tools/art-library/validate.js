#!/usr/bin/env node
// Checks Art Library entries. Usage:
//   node tools/art-library/validate.js --module tools/art-library/room-prompts.js   (one module, files and art/raw chains checked)
//   node tools/art-library/validate.js                                              (everything in data/art-prompts.json)
// Exit code 1 and a list of problems when anything is wrong. Run from the repo root.
const fs = require('fs'), path = require('path');
const TABS = ['Characters', 'NPCs', 'Areas', 'Rooms', 'Props', 'Enemies', 'Battle', 'Title', 'Portraits', 'Flight'];
const ARS = ['3:4', '2:3', '1:1', '4:3', '3:2', '16:9', '9:16', '2:1'];
// Words that pull the generator toward pixel art. Negations ("NOT pixel art", "not 16-bit") are the approved wording and are allowed.
const BANNED = /\b(16[- ]bit|32[- ]bit|snes|super nintendo|final fantasy|chrono trigger|pixel[- ]?art|retro|sprites?)\b/gi;
const NEG = /\b(?:not|no|never|nor)\s+(?:an?\s+)?(?:pixel[- ]?art|16[- ]bit(?:\s+era)?(?:\s+tile\s+art)?|32[- ]bit|retro(?:\s+game\s+art)?|sprites?)\b/gi;
const SOFT = /\b(hurt|knocked|knock-?out|injur\w*|wound\w*|blood\w*|gore|gory)\b/gi;
// Old art that is no longer in the game (Tom 2026-11-11 "oldart1": every prompt references only the art the game uses now).
// The style key and its school-yard family, underpaintings of the old enemy sheets, the test Mudling, first heroes and walks that a newer
// approved hero or walk replaced, old front stands, Tom's first battle sheets, raw area paintings (the game draws the installed art/<plate>.webp).
const RAWC = 'art/raw/characters/';
const newestOf = (glob) => { try { return fs.readdirSync(RAWC).filter(n => glob.test(n)).length > 0; } catch (e) { return false; } };
function oldArt(r) {
  if (r === 'docs/reference/style_key_v1.png' || r.startsWith('docs/reference/underpaint/') || r === 'art/raw/enemies/test-one-mudling-stance-v1.png') return true;
  if (/^art\/raw\/characters\/tom-battle-sheet-[12]-v1\.png$/.test(r) || /-stand-front-v\d+\.png$/.test(r) || r === 'portraits/boomie.png') return true;
  if (/^art\/raw\/areas\/area-[a-z]+-v\d+\.png$/.test(r)) return true;
  let m = /^art\/raw\/characters\/([a-z]+)-hero-ref-v1\.png$/.exec(r);
  if (m) return newestOf(new RegExp('^' + m[1] + '-hero-v\\d+\\.png$'));
  m = /^art\/raw\/characters\/([a-z]+)-walk-sheet-v(\d+)\.png$/.exec(r);
  if (m) return newestOf(new RegExp('^' + m[1] + '-walking-sheet-v\\d+\\.png$')) || fs.readdirSync(RAWC).some(n => { const k = new RegExp('^' + m[1] + '-walk-sheet-v(\\d+)\\.png$').exec(n); return k && +k[1] > +m[2]; });
  return false;
}
const OLD_TEXT = /\bstyle key\b|\bunderpainting\b|school[- ]yard painting/i;
function check(entries, known, needGroup) {
  const bad = [], ids = new Set();
  const produced = new Set([...known, ...entries.map(e => e.id)]);
  for (const e of entries) {
    const w = m => bad.push(e.id + ': ' + m);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(e.id || '')) w('bad id');
    if (ids.has(e.id)) w('duplicate id'); ids.add(e.id);
    if (!TABS.includes(e.tab)) w('bad tab ' + e.tab);
    if (!e.title || e.title.length < 5) w('no title');
    if (!ARS.includes(e.ar)) w('bad ar ' + e.ar);
    if (needGroup && (typeof e.group !== 'string' || e.group.length < 3 || e.group.length > 40 || /[—–:|]/.test(e.group))) w('bad or missing group ' + JSON.stringify(e.group));
    if (!e.prompt || e.prompt.length < 40) w('prompt missing or too short');
    if (e.prompt && e.prompt.length > 14000) w('prompt very long (' + e.prompt.length + ')');
    if (!Array.isArray(e.refs)) w('refs not a list'); else {
      if (e.refs.length > 5) w('more than 5 refs');
      for (const r of e.refs) {
        const m = /^art\/raw\/([a-z]+)\/([a-z0-9-]+)-v\d+\.png$/.exec(r);
        if (m && !produced.has(m[2]) && m[1] === 'characters') continue;   // a picture Tom sends to Claude (hero, walk, battle sheets); art.html shows the entry blocked until it is there
        if (m && (produced.has(m[2]) || !fs.existsSync(r))) { if (!produced.has(m[2])) w('chained ref to unknown entry ' + r); if (m[1] !== (entries.concat([]).find(x => x.id === m[2]) || { tab: '' }).tab.toLowerCase() && entries.find(x => x.id === m[2])) w('chained ref folder does not match tab ' + r); }
        else if (!fs.existsSync(r)) w('missing ref file ' + r);
        if (oldArt(r)) w('old art no longer in the game: ' + r);
      }
    }
    if (e.bake) w('has a bake field (not allowed in the bulk load)');
    // "Final Fantasy IX" or "Final Fantasy 9" is the one allowed use of the style-name ban, in any prompt (Tom 2026-11-08). Other Final Fantasy titles stay banned.
    const t = (e.prompt || '').replace(NEG, ' ').replace(/Final Fantasy (IX|9)\b/gi, ' ');
    const b = t.match(BANNED); if (b) w('banned word: ' + [...new Set(b.map(x => x.toLowerCase()))].join(', '));
    const s = t.match(SOFT); if (s) w('soft word: ' + [...new Set(s.map(x => x.toLowerCase()))].join(', '));
    if (/[—–]/.test((e.prompt || '') + (e.title || ''))) w('em or en dash');
    if (OLD_TEXT.test(e.prompt || '')) w('prompt describes old art no longer in the game (style key, underpainting or school-yard painting)');
    if (/\{[a-zA-Z_]+\}|\[\[|TODO|FIXME|XXX|\$\{/.test(e.prompt || '')) w('fill-in field or leftover template text');
  }
  return bad;
}
const mi = process.argv.indexOf('--module');
let entries, known = new Set();
if (mi > 0) {
  entries = require(path.resolve(process.argv[mi + 1])).entries;
  if (fs.existsSync('data/art-prompts.json')) for (const e of JSON.parse(fs.readFileSync('data/art-prompts.json', 'utf8')).entries) known.add(e.id);
} else entries = JSON.parse(fs.readFileSync('data/art-prompts.json', 'utf8')).entries;
const bad = check(entries, known, mi <= 0);   // modules do not carry `group` (groups.js adds it in make-prompts.js), so only the built json is checked for it
const per = {}; for (const e of entries) per[e.tab] = (per[e.tab] || 0) + 1;
if (mi <= 0) { const gs = {}; for (const e of entries) (gs[e.tab] = gs[e.tab] || new Set()).add(e.group); console.log('groups per tab', JSON.stringify(Object.fromEntries(Object.entries(gs).map(([k, v]) => [k, v.size])))); }
console.log(entries.length + ' entries', JSON.stringify(per));
if (bad.length) { console.log(bad.length + ' problems:\n' + bad.slice(0, 80).join('\n')); process.exit(1); }
console.log('OK');
