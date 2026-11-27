// Battle stage object pictures for the Art Library (tab Props, group "Battle stage"). Required by make-prompts.js. movebench10 (claude/movebench-plan.md e.2).
// Tom adds an object to a step of a move in the Move Workbench and types what it is in his own words ("a yellow folding WET FLOOR sign"). The workbench keeps those words in the move's spec
// (data/moves/<slug>.json, stage.objects.<owner>/<name>.words, in the draft or the live part). This file turns every such object into ONE Art Library entry, `stage-<owner>-<name>`, whose prompt is
// Tom's words inside the fixed asset pattern of claude/move-staging-plan.md section 5 (what it is, the game's painted look, side view facing left, centred with a margin, flat magenta background, no people,
// no hands, no text unless the words give lettering). No model writes the prompt and nothing is generated: Tom presses Generate and Approve in the Library, and the art-bake Action cuts the picture
// (art_bake.py, stage entries -> tools/clip-bake/bake_stage.py) to data/stage/<owner>-<name>.js. An object with no `words` (the 15 that sessions made with the wan-gen jobs) gets no entry here.
// Run directly (node tools/art-library/stage-prompts.js [--root DIR]) to add or refresh only these entries in data/art-prompts.json: approved status, versions and rejects are kept, an approved
// prompt is never reworded, a rejected entry whose words changed goes back to draft. Nothing is removed (an entry stays for the Library's history).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const KEY = /^[a-z0-9]+\/[a-z0-9]+$/, ENTRY = /^stage-[a-z0-9]+-[a-z0-9]+$/;

// Tom's words as one sentence: no quotes round the whole thing, a capital first letter, one full stop. Lettering he wants painted is a quoted text or a run of capital letters (WET FLOOR).
const clean = w => String(w || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
const sentence = w => { const c = clean(w); return c ? c[0].toUpperCase() + c.slice(1) + '.' : ''; };
function lettering(w) {
  const t = clean(w), q = /["“]([^"”]{1,40})["”]/.exec(t);
  if (q) return q[1].trim();
  const m = t.match(/\b[A-Z][A-Z0-9'&!-]{2,}(?:\s+[A-Z][A-Z0-9'&!-]{2,})*/g);   // capitals of three letters or more, together
  return m ? m.join(' ').slice(0, 40) : '';
}
function prompt(o) {
  const L = lettering(o.words);
  return `ONE PICTURE OF ONE OBJECT FOR A GAME.

${sentence(o.words)} Drawn in a hand-drawn colored pencil and ink illustration style with soft shading and warm golden light from the upper left, no thick outlines, not pixel art.

Seen from the side, facing left, standing on its own. The whole object is centered with a wide empty margin on every side. Flat, solid pure magenta background (#FF00FF) with no shadow, no floor and nothing else in the picture.

No people, no hands, no logos or badges, ${L ? `no other words. The lettering reads exactly: ${L}. It is painted by you, spelled exactly as given, big, clear and easy to read.` : 'no text, letters or numbers anywhere.'}
`;
}

// Every object of every spec file that has Tom's words: {key, entry, name, words, owner}. The draft is newer than the live part, so it wins.
function collect(root) {
  const dir = path.join(root || ROOT, 'data', 'moves'), out = {};
  let files = []; try { files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').sort(); } catch (e) { return []; }
  for (const f of files) {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    for (const part of [d.live, d.draft]) {
      const objs = part && part.stage && part.stage.objects; if (!objs || typeof objs !== 'object') continue;
      for (const [key, o] of Object.entries(objs)) {
        if (!o || typeof o !== 'object' || !KEY.test(key) || !clean(o.words) || !ENTRY.test(String(o.entry || ''))) continue;
        out[o.entry] = { key, entry: o.entry, name: String(o.name || key.split('/')[1]), words: clean(o.words), owner: key.split('/')[0], kind: 'prop', bg: 'magenta', move: d.id };
      }
    }
  }
  return Object.values(out);
}
const entryOf = o => ({
  id: o.entry, tab: 'Props', group: 'Battle stage', title: `Battle stage object: ${o.name} (${o.owner}, ${String(o.move || '').replace(/^move:/, '').replace(/_/g, ' ')})`,
  ar: '1:1', refs: [], prompt: prompt(o), stage: { key: o.key, kind: 'prop', bg: 'magenta', px: 384 },
});
const entries = collect(ROOT).map(entryOf);

if (require.main === module) {
  const a = process.argv.slice(2), root = a.includes('--root') ? path.resolve(a[a.indexOf('--root') + 1]) : ROOT;
  const out = path.join(root, 'data', 'art-prompts.json'), doc = JSON.parse(fs.readFileSync(out, 'utf8'));
  const changed = [], list = collect(root).map(entryOf);
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
    n.group = 'Battle stage';
    const j = doc.entries.map(x => x.group === 'Battle stage').lastIndexOf(true);
    doc.entries.splice(j >= 0 ? j + 1 : doc.entries.length, 0, n); changed.push(e.id + ' (new)');
  }
  if (changed.length) fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('stage entries:', list.length, changed.length ? '\n  ' + changed.join('\n  ') : '(no change)');
}
module.exports = { entries, collect, entryOf, prompt, lettering, sentence };
