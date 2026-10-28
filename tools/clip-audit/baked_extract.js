const fs=require('fs'),vm=require('vm');const R='/home/claude/adventures-of-tom/data/';
const ctx={console,DIALOG_CLIPS:{clips:{},voices:{}}};vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(f,'utf8').replace(/^\s*'use strict';/,'').replace(/\b(const|let) (\w+)=/g,'var $2='),ctx,{filename:f});
['voice-clips.js','dialog-cast.js'].forEach(f=>run(R+f));
for(const f of fs.readdirSync(R+'voice')) run(R+'voice/'+f);
const VC=ctx.VOICE_CLIPS,DC=ctx.DIALOG_CLIPS;
fs.writeFileSync('baked.json',JSON.stringify({voices:VC.voices,dvoices:DC.voices,cast:ctx.DIALOG_CAST}));
console.log(Object.keys(VC.voices).join(','),Object.keys(DC.voices).length);
