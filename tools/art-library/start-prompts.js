// Battle start pictures made for ONE move, for the Art Library (tab Characters, group "Battle start pictures"). Required by make-prompts.js. movebench13 (claude/movebench-plan.md b.2 start, e.2).
// Tom says in the Move Workbench which ONE thing his person holds in a move and what is worn (data/moves/<slug>.json, start.held and start.worn, in the draft or the live part) and presses
// Make the start picture. This file turns every spec with start.picture "own" into ONE Art Library entry, `start-<who>-<move>`, whose prompt is a fixed edit instruction with his words in it.
// No model writes the prompt and nothing is generated here: Tom presses Generate and Approve in the Library; the art-bake Action then runs tools/movebench/ownstart.py (the Direct-Hero
// rule: scripts/benchmark_run.py register_edit, lock_hero_pixels and gate1_measured, unchanged) and writes art/clips/start/<who>-<move>.png. The reference picture of the entry is the person's
// standard start picture on exact grey (art/raw/startref/<who>-grey.png, made by ownstart.py when the entry is added). Only the hand band of the answer is used, so the head, the face and the
// body proportions stay the standard picture's own pixels.
// Run directly (node tools/art-library/start-prompts.js [--root DIR]) to add or refresh only these entries in data/art-prompts.json: approved status, versions and rejects are kept, an approved
// prompt is never reworded, a rejected entry whose words changed goes back to draft. Nothing is removed.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const ENTRY = /^start-([a-z0-9]+)-([a-z0-9-]+)$/;

const clean = w => String(w || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
const sentence = w => { const c = clean(w); return c ? c[0].toUpperCase() + c.slice(1) + '.' : ''; };
function prompt(s) {
  const held = clean(s.held), worn = (s.worn || []).filter(x => clean(x.what));
  const handLine = held
    ? `Put ${held} in one hand, held low at hip height, as ONE held thing. The other hand is empty and relaxed at the side.`
    : 'Both hands are empty and relaxed at the sides.';
  const wornLines = worn.map(x => `Clip ${clean(x.what)} ${clean(x.where) || 'flat on the clothes'}, worn flat and NOT held in any hand.`).join(' ');
  return `EDIT THIS PICTURE.

Change ONLY the hands and what they hold, and add the worn things named below. Every other pixel stays exactly as it is: do not change the face, the expression, the hair, the head size, the body proportions, the clothes, the colors, the line work or the position of the figure.

${handLine}${wornLines ? '\n\n' + wornLines : ''}

Nothing else is held or carried, and no second copy of anything appears anywhere in the picture. Keep the flat solid grey background exactly as it is, with no shadow, scenery, effects or text.
`;
}

// Every spec file with an own start picture that holds or wears something: {entry, who, move, held, worn}. The draft is newer than the live part, so it wins.
function collect(root) {
  const dir = path.join(root || ROOT, 'data', 'moves'), out = {};
  let files = []; try { files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').sort(); } catch (e) { return []; }
  for (const f of files) {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const part = d.draft && d.draft.start ? d.draft : d.live;
    const s = part && part.start; if (!s || s.picture !== 'own') continue;
    const m = ENTRY.exec(String(s.entry || '')); if (!m) continue;
    if (!clean(s.held) && !(s.worn || []).some(x => clean(x.what))) continue;
    out[s.entry] = { entry: s.entry, who: m[1], slug: m[2], move: d.id, held: clean(s.held), worn: (s.worn || []).map(x => ({ what: clean(x.what), where: clean(x.where) })).slice(0, 3) };
  }
  return Object.values(out);
}
// The picture shape of the reference (a PNG's header), so the generator is asked for the nearest shape.
function arOf(root, who) {
  try {
    const b = fs.readFileSync(path.join(root || ROOT, 'art', 'raw', 'startref', who + '-grey.png')); const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    return Math.abs(w / h - 2 / 3) < Math.abs(w / h - 9 / 16) ? '2:3' : '9:16';
  } catch (e) { return '2:3'; }
}
const entryOf = (o, root) => ({
  id: o.entry, tab: 'Characters', group: 'Battle start pictures', title: `Battle start picture: ${o.who}, ${String(o.move || '').replace(/^move:/, '').replace(/_/g, ' ')} (the hand band only)`,
  ar: arOf(root, o.who), refs: [`art/raw/startref/${o.who}-grey.png`], prompt: prompt(o), startpic: { who: o.who, slug: o.slug, move: o.move, bg: 'grey' },
});
const entries = collect(ROOT).map(o => entryOf(o, ROOT));

if (require.main === module) {
  const a = process.argv.slice(2), root = a.includes('--root') ? path.resolve(a[a.indexOf('--root') + 1]) : ROOT;
  const out = path.join(root, 'data', 'art-prompts.json'), doc = JSON.parse(fs.readFileSync(out, 'utf8'));
  const changed = [], list = collect(root).map(o => entryOf(o, root));
  for (const e of list) {
    const i = doc.entries.findIndex(x => x.id === e.id), old = i >= 0 ? doc.entries[i] : null;
    const n = { status: old ? old.status : 'draft', versions: old ? old.versions || [] : [], rejects: old ? old.rejects || [] : [], ...e };
    if (old) {
      if (old.group) n.group = old.group;
      if (old.promptRev) n.promptRev = old.promptRev;
      if (old.prompt && old.prompt.trim() === n.prompt.trim()) n.prompt = old.prompt;
      else if (old.status === 'approved') { n.prompt = old.prompt; changed.push(e.id + ' (approved: prompt kept)'); }
      else { n.promptRev = (old.promptRev || 0) + 1; if (old.status === 'rejected') n.status = 'draft'; changed.push(e.id + ' (prompt changed)'); }
      if (JSON.stringify(old) === JSON.stringify(n)) continue;
      doc.entries[i] = n; continue;
    }
    n.group = 'Battle start pictures';
    const j = doc.entries.map(x => x.group === 'Battle start pictures').lastIndexOf(true);
    doc.entries.splice(j >= 0 ? j + 1 : doc.entries.length, 0, n); changed.push(e.id + ' (new)');
  }
  if (changed.length) fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('start entries:', list.length, changed.length ? '\n  ' + changed.join('\n  ') : '(no change)');
}
module.exports = { entries, collect, entryOf, prompt, arOf };
