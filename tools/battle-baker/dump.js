// node tools/battle-baker/dump.js [repoRoot] > dump.json
// Reads the live game files and prints what the Battle Voice Baker needs:
//   lines    LINES from data/lines.js (every spoken battle line per character and kind)
//   voices   VOICE_CLIPS.voices (voice ids, settings, saved scripts, Nara's sound prompts)
//   clips    for each character: which texts have a baked clip, and under which kinds (no audio)
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = (process.argv[2] || path.resolve(__dirname, '../..')) + '/';
const ctx = {}; vm.createContext(ctx);
const strip = s => s.replace(/^\s*['"]use strict['"];/, '');
vm.runInContext(strip(fs.readFileSync(R + 'data/voice-clips.js', 'utf8')).replace('const VOICE_CLIPS=', 'var VOICE_CLIPS='), ctx);
const CH = ['tom', 'grace', 'rose', 'amy', 'deedee', 'boppy', 'tnb'];
for (const c of CH) vm.runInContext(fs.readFileSync(R + 'data/voice/' + c + '.js', 'utf8'), ctx);
vm.runInContext(strip(fs.readFileSync(R + 'data/lines.js', 'utf8')).replace('const VOICE=', 'var VOICE=').replace('const LINES=', 'var LINES=').replace('const CLIP_PARTS=', 'var CLIP_PARTS='), ctx);
const V = ctx.VOICE_CLIPS, out = { lines: {}, voices: {}, clips: {} };
for (const ch of [...CH, 'nara']) {
  out.lines[ch] = ctx.LINES[ch] || {};
  out.voices[ch] = V.voices[ch] || {};
  out.clips[ch] = {};
  for (const k in (V.clips[ch] || {})) for (const c of V.clips[ch][k]) if (c && c.text) (out.clips[ch][c.text] = out.clips[ch][c.text] || []).push(k);
}
process.stdout.write(JSON.stringify(out));
