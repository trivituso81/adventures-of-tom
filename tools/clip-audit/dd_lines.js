const fs=require('fs'),R='/home/claude/adventures-of-tom/';
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
const vm=require('vm');const ctx={DIALOG_CLIPS:{clips:{},voices:{}}};vm.createContext(ctx);
const run=f=>vm.runInContext(strip(fs.readFileSync(f,'utf8')).replace(/\b(const|let) (\w+)=/g,'var $2='),ctx);
run(R+'data/lines.js');run(R+'data/voice-clips.js');
for(const f of fs.readdirSync(R+'data/voice')) if(/^dialog/.test(f)||f==='deedee.js') run(R+'data/voice/'+f);
const L=ctx.LINES,VC=ctx.VOICE_CLIPS,DIALOG_CLIPS=ctx.DIALOG_CLIPS;
const src=[...fs.readdirSync(R+'data').map(f=>'data/'+f),...fs.readdirSync(R+'engine').map(f=>'engine/'+f)].filter(f=>f.endsWith('.js')&&!/voice/.test(f)).map(f=>fs.readFileSync(R+f,'utf8')).join('\n');
const has=t=>[t,t.replace(/'/g,"\\'"),t.replace(/"/g,'\\"')].some(x=>src.includes(x));
const battle=[];const seen=new Set();
for(const k in L.deedee) for(const t of L.deedee[k]){ if(seen.has(t))continue; seen.add(t); battle.push({kind:k,text:t,baked:!!Object.values(VC.clips.deedee||{}).flat().find(c=>c&&c.text===t)}); }
const dl={};
for(const d of JSON.parse(fs.readFileSync(R+'tools/voice-recast/dialogue-lines.json'))) if(d.voice==='deedee') dl[d.text]={text:d.text,chapter:d.chapter,src:'recast'};
for(const k in DIALOG_CLIPS.clips) if(k.startsWith('deedee|')){const t=k.slice(7); if(has(t)&&!dl[t]) dl[t]={text:t,src:'clip'};}
const c11=JSON.parse(fs.readFileSync(R+'docs/dialogue-scripts-ch11.json'));
for(const d of (c11.lines||c11)) if(d.voice==='deedee'&&!dl[d.text]) dl[d.text]={text:d.text,chapter:11,src:'ch11',script:d.script};
for(const t in dl) dl[t].baked=!!DIALOG_CLIPS.clips['deedee|'+t], dl[t].ingame=has(t);
const D=Object.values(dl);
fs.writeFileSync('/home/claude/bk/dd-lines.json',JSON.stringify({battle,dialog:D},null,1));
console.log('battle',battle.length,'baked',battle.filter(b=>b.baked).length,'| dialog',D.length,'baked',D.filter(d=>d.baked).length,'not in game text',D.filter(d=>!d.ingame).map(d=>d.text.slice(0,50)));
console.log('voice of baked deedee clips:',VC.voices.deedee.name);
