// tools/bake-page/make-list.js: builds data/bake-list.json for bake.html.
// Source: tools/bake-page/pending.json (hand-kept list of lines that need a clip: id, kind 'dialog' or 'battle', voice, lineKind, text, where, script).
// Voice settings (voice id, model, stability, direction) are read from the baked files so they always match the rest of the game.
// Run from the repo root:  node tools/bake-page/make-list.js
const fs=require('fs'),vm=require('vm');
const ctx={console};vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(f,'utf8').replace(/^'use strict';/,'')+'\n',ctx,{filename:f});
run('data/voice-clips.js');
for(const c of ['tom','grace','rose','amy','deedee','boppy','tnb']) run('data/voice/'+c+'.js');
vm.runInContext('var DIALOG_CLIPS={clips:{},voices:{},scripts:{}};',ctx);
for(const f of fs.readdirSync('data/voice').filter(f=>/^dialog-ch/.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))) run('data/voice/'+f);
const BV=vm.runInContext('VOICE_CLIPS',ctx).voices, DV=vm.runInContext('DIALOG_CLIPS',ctx).voices;
const items=JSON.parse(fs.readFileSync('tools/bake-page/pending.json','utf8'));
const voices={};
for(const it of items){
  const key=it.kind+'|'+it.voice, src=(it.kind==='dialog'?DV:BV)[it.voice];
  if(!src||!src.voice_id) throw new Error('no voice settings for '+key);
  voices[key]={voice_id:src.voice_id,model:src.model||'eleven_v4',stability:src.settings.stability,similarity:src.settings.similarity_boost,direction:src.direction||''};
}
const out={made:new Date().toISOString().slice(0,10),voices,items};
fs.writeFileSync('data/bake-list.json',JSON.stringify(out));
console.log('wrote data/bake-list.json:',items.length,'lines,',Object.keys(voices).length,'voices');
