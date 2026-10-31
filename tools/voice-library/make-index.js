// tools/voice-library/make-index.js: builds data/voice-index.json for voices.html (title screen > ADMIN > VOICE LIBRARY).
// Lists every spoken line that has (or should have) a clip, without audio:
//   battle lines:   every LINES entry (data/lines.js), one item per character and text (kinds that share the words are listed
//                   together), with the file that holds its current clip (data/voice-clips.js or data/voice/<id>.js).
//   dialogue lines: every DIALOG_CLIPS key ('voice|text') from data/voice/dialog-ch*.js, with the file whose copy wins
//                   (DIALOG_CAST.files order), the on-screen speaker and chapter (scanned from data/scenes*.js).
// Scripts (what ElevenLabs reads): battle from tools/voice-library/battle-scripts.json (hand-written, made by battle-scripts.py),
// dialogue from tools/voice-library/scripts/*.json (hand-written chapter scripts: {lines:[{voice,text,script,ctx,speaker}]}),
// else a plain direction. Voice settings come from the baked files, so they always match the rest of the game.
// Run from the repo root:  python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js
const fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={console};vm.createContext(ctx);
const src=f=>fs.readFileSync(f,'utf8').replace(/^\s*'use strict';/,'')+'\n';
const run=f=>vm.runInContext(src(f),ctx,{filename:f});
run('data/lines.js'); run('data/dialog-cast.js');
const LINES=vm.runInContext('LINES',ctx), CAST=vm.runInContext('DIALOG_CAST',ctx);
// Battle clips: base file, then the per-character files (each replaces VOICE_CLIPS.clips[id]).
run('data/voice-clips.js');
const bfile={}; // ch -> file holding its clips
for(const ch of Object.keys(vm.runInContext('VOICE_CLIPS.clips',ctx))) bfile[ch]='data/voice-clips.js';
for(const f of fs.readdirSync('data/voice').filter(f=>!/^dialog-/.test(f))){ run('data/voice/'+f); bfile[f.replace(/\.js$/,'')]='data/voice/'+f; }
const BC=vm.runInContext('VOICE_CLIPS',ctx);
// Dialogue clips: load in the game's order; a later file's copy wins.
vm.runInContext('DIALOG_CLIPS.clips={};DIALOG_CLIPS.voices={};',ctx);
const dfile={};
const dfiles=CAST.files.slice();
for(const f of fs.readdirSync('data/voice').filter(f=>/^dialog-ch/.test(f))) if(!dfiles.includes('data/voice/'+f)) dfiles.push('data/voice/'+f);
for(const f of dfiles){ if(!fs.existsSync(f)) continue;
  vm.runInContext('var __b=new Set(Object.entries(DIALOG_CLIPS.clips).map(e=>e[0]+"\u0000"+e[1].length));',ctx); run(f);
  const C=vm.runInContext('DIALOG_CLIPS.clips',ctx), before=vm.runInContext('__b',ctx);
  for(const k in C) if(!before.has(k+'\u0000'+C[k].length)) dfile[k]=f; }
const DC=vm.runInContext('DIALOG_CLIPS',ctx);

// ---------- chapters and speakers from the scene files ----------
const norm=s=>String(s).replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
function literals(s){ const out=[]; const re=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g; let m;
  while((m=re.exec(s))){ const raw=m[1]!=null?m[1]:m[2]!=null?m[2]:m[3]; out.push(raw.replace(/\\u([0-9a-fA-F]{4})/g,(a,h)=>String.fromCharCode(parseInt(h,16))).replace(/\\(.)/g,'$1')); }
  return out; }
const segs=[], titles={};
for(const f of fs.readdirSync('data').filter(f=>/^scenes.*\.js$/.test(f)||f==='bonus-nine-scoops.js')){
  const s=fs.readFileSync('data/'+f,'utf8');
  if(f==='scenes.js'){ const heads=[...s.matchAll(/^\/\/ CHAPTER (\d+): ([^\n(.]+)/gm)];
    heads.forEach((h,i)=>{ titles[+h[1]]=h[2].trim(); segs.push({n:+h[1],s:s.slice(i?h.index:0,i+1<heads.length?heads[i+1].index:s.length)}); }); }
  else { const m=f.match(/^scenes-ch(\d+)\.js$/); const n=m?+m[1]:f==='scenes-p2.js'?11:f==='bonus-nine-scoops.js'?21:null; if(n==null) continue;
    const t=s.match(/Chapter \d+ "([^"]+)"/); if(t) titles[n]=t[1]; if(n===21) titles[21]=titles[21]||'Nine Scoops (bonus)'; segs.push({n,s}); }
}
const textCh={}, textWho={};   // norm(text) -> [chapters], -> speaker shown
for(const {n,s} of segs){
  for(const m of s.matchAll(/talk:\s*'([^']+)'\s*,\s*lines:\s*\[/g)){
    let i=m.index+m[0].length, depth=1, q=null; const st=i;
    for(;i<s.length&&depth;i++){ const c=s[i]; if(q){ if(c==='\\') i++; else if(c===q) q=null; } else if(c==='\''||c==='"'||c==='`') q=c; else if(c==='[') depth++; else if(c===']') depth--; }
    for(const t of literals(s.slice(st,i))){ const k=norm(t); (textCh[k]=textCh[k]||new Set()).add(n); textWho[k]=textWho[k]||m[1]; }
  }
  for(const t of literals(s)){ const k=norm(t); if(k.length>12&&!textCh[k]) (textCh[k]=new Set()).add(n); }
}
// Lines spoken by battle code are battle; greet, join, praise and intro lines are dialogue (same rule as the Voice Baker).
const DIALOG_KIND=/^(greet|join|praise|intro.*|nara_no_jump)$/;

// ---------- scripts ----------
const BS=fs.existsSync('tools/voice-library/battle-scripts.json')?JSON.parse(fs.readFileSync('tools/voice-library/battle-scripts.json','utf8')):{};
const DS={}, DCTX={}, DCH={};
const SD='tools/voice-library/scripts';
if(fs.existsSync(SD)) for(const f of fs.readdirSync(SD).filter(f=>f.endsWith('.json')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))){
  const j=JSON.parse(fs.readFileSync(SD+'/'+f,'utf8')); const list=Array.isArray(j)?j:(j.lines||[]);
  for(const it of list){ if(!it||!it.voice||!it.text||!it.script) continue; const k=it.voice+'|'+norm(it.text);
    DS[k]=it.script; if(it.ctx) DCTX[k]=it.ctx; if(j.chapter) DCH[k]=j.chapter; }
}
function plain(voice,text){
  const d=[]; if(voice==='boppy') d.push('thick New York accent');
  d.push(/!/.test(text)?'animated':/\?/.test(text)?'curious':'natural, conversational');
  return '['+d.join(', ')+'] '+text.replace(/\bTa-?ta\b/gi,m=>m===m.toUpperCase()?'TAH TAH':'Tah Tah');
}

// ---------- voices ----------
const NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',nara:'Nara'};
const voices={};
function vset(kind,id,v){ if(!v) return; const st=v.settings||{};
  voices[kind+'|'+id]={voice_id:v.voice_id||'',model:v.model||'eleven_v4',stability:st.stability!=null?st.stability:.5,similarity:st.similarity_boost!=null?st.similarity_boost:.85,direction:v.direction||'',
    sfx:!!v.sfx,prompt_influence:v.prompt_influence||.5}; }
for(const ch in BC.voices) vset('battle',ch,BC.voices[ch]);
for(const id in DC.voices) vset('dialog',id,DC.voices[id]);
const vname=id=>NAMES[id]||(CAST.voices[id]&&CAST.voices[id].name)||id;
// Merge effects: battle clips only deepen Boppy (tools/battle-baker/merge.js); dialogue adds speaker or voice fx, Boppy, Grace shrink (tools/clip-audit/merge.py).
const fxOf=(voice,speaker,battle)=>battle?voice==='boppy':!!((speaker&&CAST.speakerFx&&CAST.speakerFx[speaker])||voice==='boppy'||voice==='grace'||(CAST.voices[voice]&&CAST.voices[voice].fx));

// ---------- items ----------
const files=[], fidx=f=>{ let i=files.indexOf(f); if(i<0){ files.push(f); i=files.length-1; } return i; };
const items=[];
const ORDER=['tom','grace','rose','amy','deedee','boppy','tnb','nara'];
for(const ch of ORDER){ const L=LINES[ch]; if(!L) continue;
  const byText=new Map();
  for(const kind in L) for(const t of L[kind]){ if(!byText.has(t)) byText.set(t,[]); const a=byText.get(t); if(!a.includes(kind)) a.push(kind); }
  const clips=BC.clips[ch]||{};
  for(const [t,kinds] of byText){
    let has=false; for(const k in clips) if((clips[k]||[]).some(x=>x&&x.text===t)) { has=true; break; }
    const ks=[...(textCh[norm(t)]||[])].sort((a,b)=>a-b);
    const it={t:'b',v:ch,k:kinds,x:t,ty:kinds.every(k=>DIALOG_KIND.test(k))?'d':'b',c:ks,w:kinds.join(', '),f:has?fidx(bfile[ch]||'data/voice-clips.js'):-1};
    if(ch==='nara'){ const pr=(BC.voices.nara||{}).prompts||{}; const p=kinds.map(k=>pr[k+'|'+t]).find(Boolean); it.p=p?p.p:'Friendly medium-size dog, happy excited barks.'; it.d=p?p.d:2; }
    else it.s=kinds.map(k=>BS[ch+'|'+k+'|'+t]).find(Boolean)||plain(ch,t);
    if(fxOf(ch,null,true)) it.fx=1;
    items.push(it);
  }
}
for(const key of Object.keys(DC.clips)){
  const i=key.indexOf('|'), v=key.slice(0,i), t=key.slice(i+1), n=norm(t);
  const fm=(dfile[key]||'').match(/dialog-ch(\d+)\.js$/), fn=fm?+fm[1]:null;
  let ks=[...(textCh[n]||[])].sort((a,b)=>a-b);
  if(!ks.length&&DCH[v+'|'+n]) ks=[DCH[v+'|'+n]];
  if(!ks.length&&fn!=null&&(fn<=20||fn===21)) ks=[fn];
  const speaker=textWho[n]||null;
  const it={t:'d',v,x:t,ty:'d',c:ks,w:DCTX[v+'|'+n]||(speaker&&speaker!==vname(v)?speaker:''),f:fidx(dfile[key]),s:DS[v+'|'+n]||plain(v,t)};
  if(speaker) it.sp=speaker;
  if(!DS[v+'|'+n]) it.auto=1;
  if(fxOf(v,speaker)) it.fx=1;
  items.push(it);
}
items.forEach((it,i)=>it.i=i);
const who={}; for(const it of items){ const k=it.v; who[k]=who[k]||{id:k,name:vname(k),n:0,family:!!NAMES[k]}; who[k].n++; }
const out={made:new Date().toISOString().slice(0,10),files,voices,who:Object.values(who).sort((a,b)=>(b.family-a.family)||(ORDER.indexOf(a.id)-ORDER.indexOf(b.id))||a.name.localeCompare(b.name)),
  chapters:Object.keys(titles).map(Number).sort((a,b)=>a-b).map(n=>({n,title:titles[n]})),items};
fs.writeFileSync('data/voice-index.json',JSON.stringify(out));
const nb=items.filter(x=>x.t==='b').length, nd=items.length-nb, auto=items.filter(x=>x.auto).length;
console.log('wrote data/voice-index.json:',items.length,'lines ('+nb+' battle, '+nd+' dialogue;',auto,'dialogue lines with a plain direction),',
  Object.keys(voices).length,'voices,',(fs.statSync('data/voice-index.json').size/1024).toFixed(0)+' KB');
