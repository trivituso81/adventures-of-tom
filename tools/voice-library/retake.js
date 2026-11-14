'use strict';
// node tools/voice-library/retake.js <scripts file> [<scripts file> ...]
// Puts every line of the given hand-written script files (tools/voice-library/scripts/*.json) that already has a baked dialogue
// clip into tools/voice-library/retake.json {note, at, since, hashes:{'voice|text': sha1 of the clip}}. make-index.js marks such a
// line rt:1 while its baked clip still has that hash, and the Voice Library lists it under Show > New direction until Tom records
// it again. Use it when directions are rewritten for lines that were already recorded (voicetags2, 2026-11-13: chapter 1).
// Run from the repo root, then: node tools/voice-library/make-index.js
const fs=require('fs'), vm=require('vm'), crypto=require('crypto');
const files=process.argv.slice(2); if(!files.length){ console.error('usage: retake.js <scripts file> ...'); process.exit(1); }
const norm=s=>String(s).replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
const sha=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
const ctx=vm.createContext({}); vm.runInContext('var DIALOG_CLIPS={clips:{},voices:{}};',ctx);
for(const f of fs.readdirSync('data/voice').filter(f=>/^dialog-ch\d+\.js$/.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})))
  vm.runInContext(fs.readFileSync('data/voice/'+f,'utf8'),ctx);
const C=vm.runInContext('DIALOG_CLIPS',ctx).clips;
const OUT='tools/voice-library/retake.json';
const J=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):{note:'Dialogue lines whose direction was rewritten after their clip was recorded and that Tom should record again. Made by retake.js. Key: voice|text; value: hash of the clip that was baked when the direction changed.',hashes:{}};
let n=0, no=0;
for(const f of files){ const j=JSON.parse(fs.readFileSync(f,'utf8')); for(const l of (j.lines||j)){ if(!l||!l.voice||!l.text) continue;
  const a=C[l.voice+'|'+l.text]; if(!a){ no++; continue; } J.hashes[l.voice+'|'+norm(l.text)]=sha(a); n++; } }
J.at=Date.now(); J.since=new Date(J.at).toISOString();
fs.writeFileSync(OUT,JSON.stringify(J,null,1)+'\n');
console.log('retake list:',n,'lines with a clip added,',no,'lines have no clip yet (they are already under No clip yet) ->',OUT);
