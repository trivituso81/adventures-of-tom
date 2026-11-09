// NPC walk sheets for the Art Library (tab NPCs): one entry `npc-walk-<id>` per townsperson, attaching that person's approved hero
// (the newest version of `npc-photo-<id>`) and nothing else (11-09 12:00: with Justin's sheet attached the generator drew Justins
// in the cells, and a prompt that names a picture 2 gets wrong poses without it). One generic prompt, no per-person words:
// the look comes from the attached hero, the poses from the words (same wording as claude/tom-walk-simple-prompt.txt, Tom's walk). Not in make-prompts.js: entries are appended to data/art-prompts.json as text
// (node tools/art-library/npc-walk-prompts.js --append), the same way as the Tombo split entries.
// Skipped: pip, moss, dot (approved walks already installed) and boomie (own sheet, BOOMIE_OW).
const fs = require('fs');
const SKIP = new Set(['pip', 'moss', 'dot', 'boomie']);
const PROMPT = `Draw the person in the attached picture as a walk sheet.

Keep the person exactly as in the picture: the same face, the same head size compared to the body, the same hair, clothes and shoes, and the same painting style. Do not change proportions from frame to frame. Hands empty: leave out anything the person holds, keep anything worn.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line, nothing touching a cell edge. No grid lines, numbers, text, shadows or other people.

Row 1, facing the viewer:
1. Standing still, feet together, arms at the sides.
2. Walking toward the viewer, one foot forward, the opposite arm swung forward.
3. Walking toward the viewer, the other foot forward, the opposite arm swung forward.

Row 2, seen from behind, the back of the head and the back of the clothes, no face visible:
4. Standing still, feet together, arms at the sides.
5. Walking away from the viewer, one foot forward, the opposite arm swung forward.
6. Walking away from the viewer, the other foot forward, the opposite arm swung forward.

Row 3, side view, the whole body turned sideways to the viewer, facing the same way in all three cells:
7. Standing still, feet together, arms at the sides.
8. Mid-stride, front leg out with the heel down, back leg behind with the heel up, the arms swung opposite to the legs.
9. Legs passing each other, the back foot lifted with the knee bent, the arms swung the other way.`;
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
