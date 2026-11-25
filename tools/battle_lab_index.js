// Writes data/battle-lab-index.json: the names of every Battle Lab fight, for battle-lab.html (which loads no game code).
// Run: node tools/battle_lab_index.js         (add --check to fail when the file is out of date)
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),ctx={};vm.createContext(ctx);
for(const f of ['data/bt-tables.js','data/battle2-data.js','data/b3-lab.js']) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8').replace(/^'use strict';/,'')+';',ctx);
const out=vm.runInContext('JSON.stringify({b2:B2_LAB.map((L,i)=>({i,ch:L.ch,name:L.name,sub:L.sub,solo:!!L.solo})),b3:B3_LAB.map((L,i)=>({i,name:L.name,sub:L.sub}))},null,1)',ctx)+'\n';
const file=path.join(root,'data','battle-lab-index.json');
if(process.argv.includes('--check')) { const cur=fs.existsSync(file)?fs.readFileSync(file,'utf8'):''; if(cur!==out) { console.log('FAIL data/battle-lab-index.json is out of date: run node tools/battle_lab_index.js'); process.exit(1); } console.log('PASS battle-lab-index.json is current'); }
else { fs.writeFileSync(file,out); console.log('wrote',file); }
