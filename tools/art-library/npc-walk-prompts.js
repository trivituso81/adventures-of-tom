// NPC walk sheets for the Art Library (tab NPCs): one entry `npc-walk-<id>` per townsperson, attaching that person's approved hero
// (the newest version of `npc-photo-<id>`) and nothing else (11-09 12:00: with Justin's sheet attached the generator drew Justins
// in the cells, and a prompt that names a picture 2 gets wrong poses without it). One generic prompt, no per-person words:
// the look comes from the attached hero, the poses from the words (same wording as claude/tom-walk-simple-prompt.txt, Tom's walk). Not in make-prompts.js: entries are appended to data/art-prompts.json as text
// (node tools/art-library/npc-walk-prompts.js --append), the same way as the Tombo split entries.
// Skipped: boomie (own sheet, BOOMIE_OW). Pip, Moss and Dot have entries since 2026-11-10 (Tom: their walk sheets were missing from the Library; the installed walks stay until a new one is approved).
const fs = require('fs');
const SKIP = new Set(['boomie']);
const { PROMPT } = require('./walk-prompt.js');   // Tom's one walk prompt (11-09 23:15)
// Gus only (Tom 11-10 06:52: his walk sheet v5 was still wrong and the prompt confuses the generator). What the v4 picture got wrong with Tom's prompt:
// the back row was drawn turned sideways (three-quarter view), the side row faced right, and the background came out crimson. This version uses short plain sentences, one idea each,
// says what the camera sees in each row, and says "the nose points to the left edge" for the side row. No left or right feet or arms (the generator mixes them up).
const GUS_PROMPT = `Draw the person in the attached picture as a walk sheet.

The same person in all nine cells: same face, same hat, same clothes, same shoes, same painting style, same size. Whole body in every cell, from the hat to the shoes. Hands empty.

One image. A grid of 3 columns and 3 rows of equal square cells. Flat solid magenta #FF00FF background. No text, no lines, no shadows. Nothing touches the edge of a cell.

Top row: the person faces the camera.
1. Standing still, feet together, arms down at the sides.
2. Walking toward the camera, one foot forward, the opposite arm forward.
3. Walking toward the camera, the other foot forward, the opposite arm forward.

Middle row: the person has their back to the camera and walks straight away from it. The body is square to the camera, not turned. We see only the back of the hat, the back of the head, the back of the shirt, the back of the pants and the heels. No face. No side view.
4. Standing still, feet together, arms down at the sides.
5. Walking away, one foot forward, the opposite arm forward.
6. Walking away, the other foot forward, the opposite arm forward.

Bottom row: the person is seen from the side. The nose and the toes point to the left edge of the cell in all three cells.
7. Standing still, feet together, arms down at the sides.
8. Walking, the front foot reaches forward with the heel down, the back foot is behind with the heel up, the arms swing opposite to the legs.
9. Walking, one foot is flat under the body, the other foot is lifted with the knee bent, the arms swing the other way.`;
function build(art) {
  const out = [];
  for (const h of art.entries.filter(e => e.id.startsWith('npc-photo-'))) {
    const k = h.id.slice(10); if (SKIP.has(k) || !h.versions.length) continue;   // no walk entry until the hero has a picture to attach
    out.push({ status: 'draft', versions: [], rejects: [], id: 'npc-walk-' + k, tab: 'NPCs', title: h.title.split(':')[0] + ': walk sheet (hero attached)', ar: '1:1',
      refs: [h.versions[h.versions.length - 1].file], prompt: k === 'gus' ? GUS_PROMPT : PROMPT, group: h.group });
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
