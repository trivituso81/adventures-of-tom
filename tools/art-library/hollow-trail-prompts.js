// Grump Hollow muffin wrapper trail (hollowtrail1, Tom 2026-11-20, reports r-20261120-140805-mhzt, r-20261120-141016-j0za, r-20261120-141209-58bx):
// "we should just rebake the entire area for each variation of muffin papers scattered". Four paintings of the Hollow, each the installed
// painting with the nine wrappers painted along one leg of the trail (data/scenes.js HOLLOW_TRAIL_STAGES says which leg shows when).
// fix-hollowtrail1-pics: the attached picture is the plate's painting with the nine wrappers already pasted at the right size and spot
// (tools/art-library/hollow_trail_guide.py); asked in words the generator painted them bench sized and in a block. The layout stays; the bake (tools/sprite-bake/bake_hollow_trail.py) lines the
// result up with the plate and keeps only the strip along that leg, so the walk map, exits and cutouts never move.
// Required by area-prompts.js (make-prompts.js). Run directly (node tools/art-library/hollow-trail-prompts.js) to add or refresh only these
// entries in data/art-prompts.json without rebuilding the rest.
const fs = require('fs');
const P = n => fs.readFileSync(__dirname + '/prompts/areas/' + n + '.txt', 'utf8').trim();
const LEG = ['up the stone path into the clearing', 'to the top left corner by the old bench', 'to the middle of the clearing', 'east to Boppy\'s fishing spot'];
const entries = [1, 2, 3, 4].map(n => ({
  id: 'area-hollow-trail' + n, tab: 'Areas', group: 'Grump Hollow',
  title: 'Grump Hollow, muffin wrapper trail ' + n + ' of 4: nine wrappers ' + LEG[n - 1] + ' (attach the listed picture)',
  ar: '1:1', refs: ['art/raw/areas/hollow-trail' + n + '-guide.png'], prompt: P('hollow-trail' + n),
  bake: { script: 'bake_hollow_trail.py', args: [String(n)], src: 'tools/sprite-bake/src/hollow-trail' + n + '.png' },
}));
if (require.main === module) {
  const out = 'data/art-prompts.json', txt = fs.readFileSync(out, 'utf8'), doc = JSON.parse(txt);
  for (const e of entries) {
    const i = doc.entries.findIndex(x => x.id === e.id), old = i >= 0 ? doc.entries[i] : null;
    const n = { status: old ? old.status : 'draft', versions: old ? old.versions || [] : [], rejects: old ? old.rejects || [] : [], ...e };
    if (old) {
      if (old.prompt && old.prompt.trim() === n.prompt.trim()) n.prompt = old.prompt;
      const rev = (old.promptRev || 0) + (old.prompt !== n.prompt ? 1 : 0); if (rev) n.promptRev = rev;   // the Library drops an older edit saved on Tom's device
      if (old.prompt !== n.prompt && old.status === 'rejected') n.status = 'draft';
      doc.entries[i] = n; continue;
    }
    const at = doc.entries.findIndex(x => x.id === 'area-hollow');
    let j = at + 1; while (j < doc.entries.length && /^area-hollow-/.test(doc.entries[j].id)) j++;
    doc.entries.splice(at >= 0 ? j : doc.entries.length, 0, n);
  }
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('hollow trail entries in', out + ':', entries.map(e => e.id).join(', '));
}
module.exports = { entries };
