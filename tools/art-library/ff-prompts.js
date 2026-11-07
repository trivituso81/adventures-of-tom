// Family Finish member sheets (Tom 2026-11-07). Rewritten 2026-11-07 for the split-sheet rules (no objects in a person sheet; objects live on
// `tombo-ff<N>-objects`). Rows and builder: tombo-split/ff.js and tombo-split-prompts.js. This module lists the 10 member entries only
// (ff1 x4, ff2 x3, ff3 x3); the three object sheets are built by the same rows. Copied into data/art-prompts.json by a node one-liner (never run make-prompts.js).
const { finishEntries } = require('./tombo-split-prompts.js');
const rows = require('./tombo-split/ff.js');
module.exports = { entries: [].concat(...rows.map(r => finishEntries(r, false))).filter(e => !e.id.endsWith('-objects')) };
