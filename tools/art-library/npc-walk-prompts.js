// NPC walk sheets for the Art Library (tab NPCs): one entry `npc-walk-<id>` per townsperson, attaching that person's approved hero
// (the newest version of `npc-photo-<id>`) plus Justin's walk sheet for layout only. One generic prompt, no per-person words:
// the look comes from the attached hero. Not in make-prompts.js: entries are appended to data/art-prompts.json as text
// (node tools/art-library/npc-walk-prompts.js --append), the same way as the Tombo split entries.
// Skipped: pip, moss, dot (approved walks already installed) and boomie (own sheet, BOOMIE_OW).
const fs = require('fs');
const SKIP = new Set(['pip', 'moss', 'dot', 'boomie']);
const LAYOUT = 'art/raw/characters/justin-walk-sheet-v1.png';
const PROMPT = `Paint a walking sheet of one person for a role-playing game.

Picture 1 is the finished painting of the character. Copy it exactly in every frame: the same person, face, hair, clothes, colors, painting style, level of detail and head size compared to the body. Picture 2 is the walking sheet of another character: copy only its layout, figure size and way of drawing walking steps, never the person.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except a lifted foot mid-step), each figure well inside its cell with clear magenta margin, nothing touching a cell edge. Hands empty: leave out anything the person holds, keep anything worn. No grid lines, numbers, text, effects or shadows. Clothing never uses magenta.

Row 1, facing the viewer:
1. Standing, feet together, arms at the sides, a calm easy expression.
2. A walking step, one foot forward, the opposite arm swinging forward.
3. The opposite step, the opposite arm swinging forward.

Row 2, seen from behind, walking away from the viewer, showing the full hair and the back of the outfit:
4. Standing, feet together.
5. A walking step, one foot forward, the opposite arm swinging forward.
6. The opposite step.

Row 3, in profile, facing the same way as the profile row of picture 2:
7. Standing, feet together.
8. A walking step, front heel down, back heel lifted, near arm back, far arm forward.
9. The passing step, back foot lifted with a bent knee, body a little higher.

Walks slowly and easily: small relaxed steps, arms swinging a little. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;
function build(art) {
  const out = [];
  for (const h of art.entries.filter(e => e.id.startsWith('npc-photo-'))) {
    const k = h.id.slice(10); if (SKIP.has(k)) continue;
    out.push({ status: 'draft', versions: [], rejects: [], id: 'npc-walk-' + k, tab: 'NPCs', title: h.title.split(':')[0] + ': walk sheet (hero attached)', ar: '1:1',
      refs: [h.versions[h.versions.length - 1].file, LAYOUT], prompt: PROMPT, group: h.group });
  }
  return out;
}
module.exports = { build, PROMPT };
if (require.main === module) {
  const f = 'data/art-prompts.json', txt = fs.readFileSync(f, 'utf8'), art = JSON.parse(txt);
  const have = new Set(art.entries.map(e => e.id)), add = build(art).filter(e => !have.has(e.id));
  console.log(add.length, 'new entries');
  if (process.argv.includes('--append')) {
    const tail = '\n  }\n ]\n}'; const body = txt.replace(/\n$/, '');
    if (!body.endsWith(tail)) throw new Error('unexpected json tail');
    const chunk = add.map(e => JSON.stringify(e, null, 1).split('\n').map(l => '  ' + l).join('\n')).join(',\n');
    fs.writeFileSync(f, body.slice(0, -'\n ]\n}'.length) + ',\n' + chunk + '\n ]\n}' + (txt.endsWith('\n') ? '\n' : ''));
  }
}
