#!/usr/bin/env node
// tools/movebench/export_game.js (movebench3): prints, as JSON on stdout, the game tables the Move Workbench spec is written from: the family moves and their vibes, the monsters and their acts,
// the staging rows, the body clips, the Pass-1 review rows and the baked clip ids. The game's own files are loaded the way tools/guidegen/build_map.js loads them.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = rd('index.html');
const files = [...html.matchAll(/<script[^>]+src="(data\/b3-[^"?]+\.js)/g)].map(m => m[1]);
const ctx = vm.createContext({ Math, JSON, Object, Array, String, Number, Error, console: { log() {}, error() {} } });
for (const f of files) vm.runInContext(rd(f), ctx, { filename: f });
vm.runInContext(rd('data/pass1-meta.js'), ctx, { filename: 'data/pass1-meta.js' });
const g = n => JSON.parse(vm.runInContext('JSON.stringify(typeof ' + n + '!=="undefined"?' + n + ':null)', ctx));
const clips = fs.readdirSync(path.join(ROOT, 'data', 'clips')).filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, '')).sort();
process.stdout.write(JSON.stringify({ SKILLS: g('B3_SKILLS'), VIBES: g('B3_VIBES'), FOES: g('B3_FOES'), STAGE: g('B3_STAGE'), BODY_CLIPS: g('B3_BODY_CLIPS'), PASS1: g('PASS1_META'), CLIPS: clips }));
