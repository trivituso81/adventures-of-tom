// NPC walk sheets for the Art Library (tab NPCs): one entry `npc-walk-<id>` per townsperson, attaching that person's approved hero
// (the newest version of `npc-photo-<id>`) and nothing else (11-09 12:00: with Justin's sheet attached the generator drew Justins
// in the cells, and a prompt that names a picture 2 gets wrong poses without it). One generic prompt, no per-person words:
// the look comes from the attached hero, the poses from the words (same wording as claude/tom-walk-simple-prompt.txt, Tom's walk). Not in make-prompts.js: entries are appended to data/art-prompts.json as text
// (node tools/art-library/npc-walk-prompts.js --append), the same way as the Tombo split entries.
// Skipped: pip, moss, dot (approved walks already installed) and boomie (own sheet, BOOMIE_OW).
const fs = require('fs');
const SKIP = new Set(['pip', 'moss', 'dot', 'boomie']);
const { PROMPT } = require('./walk-prompt.js');   // Tom's one walk prompt (11-09 23:15)
function build(art) {
  const out = [];
  for (const h of art.entries.filter(e => e.id.startsWith('npc-photo-'))) {
    const k = h.id.slice(10); if (SKIP.has(k)) continue;
    out.push({ status: 'draft', versions: [], rejects: [], id: 'npc-walk-' + k, tab: 'NPCs', title: h.title.split(':')[0] + ': walk sheet (hero attached)', ar: '1:1',
      refs: [h.versions[h.versions.length - 1].file], prompt: PROMPT, group: h.group });
  }
  return out;
}
module.exports = { build, PROMPT };
// --refresh: rewrite prompt and refs of untouched drafts and of approved entries (status and versions stay; a regenerate then uses the current prompt).
if (require.main === module) {
  const f = 'data/art-prompts.json', txt = fs.readFileSync(f, 'utf8'), art = JSON.parse(txt);
  const have = new Set(art.entries.map(e => e.id)), add = build(art).filter(e => !have.has(e.id));
  console.log(add.length, 'new entries');
  if (process.argv.includes('--refresh')) {
    const want = new Map(build(art).map(e => [e.id, e])); let n = 0;
    for (const e of art.entries) { const w = want.get(e.id); if (w && (e.status === 'approved' || (e.status === 'draft' && !e.versions.length && !(e.rejects || []).length))) { e.prompt = w.prompt; e.refs = w.refs; n++; } }
    const out = JSON.stringify(art, null, 1); if (JSON.stringify(JSON.parse(txt), null, 1) !== txt.replace(/\n$/, '')) throw new Error('json does not round-trip');
    fs.writeFileSync(f, out + (txt.endsWith('\n') ? '\n' : '')); console.log(n, 'entries refreshed'); process.exit(0);
  }
  if (process.argv.includes('--append')) {
    const tail = '\n  }\n ]\n}'; const body = txt.replace(/\n$/, '');
    if (!body.endsWith(tail)) throw new Error('unexpected json tail');
    const chunk = add.map(e => JSON.stringify(e, null, 1).split('\n').map(l => '  ' + l).join('\n')).join(',\n');
    fs.writeFileSync(f, body.slice(0, -'\n ]\n}'.length) + ',\n' + chunk + '\n ]\n}' + (txt.endsWith('\n') ? '\n' : ''));
  }
}
