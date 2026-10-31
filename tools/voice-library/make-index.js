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
const sceneCh={};
for(const {n,s} of segs) for(const m of s.matchAll(/SCENES\.(\w+)\s*=/g)) sceneCh[m[1]]=sceneCh[m[1]]||n;
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
const SFILES=[];
for(const d of ['docs',SD]) if(fs.existsSync(d)) fs.readdirSync(d).filter(f=>d===SD?f.endsWith('.json'):/^dialogue-scripts-.*\.json$/.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).forEach(f=>SFILES.push(d+'/'+f));
for(const sf of SFILES){
  const j=JSON.parse(fs.readFileSync(sf,'utf8')); const list=Array.isArray(j)?j:(j.lines||[]);
  for(const it of list){ if(!it||!it.voice||!it.text||!it.script) continue; const k=it.voice+'|'+norm(it.text);
    DS[k]=it.script; if(it.ctx) DCTX[k]=it.ctx; if(j.chapter) DCH[k]=j.chapter; }
}
function plain(voice,text){
  const d=[]; if(voice==='boppy'||voice==='justin') d.push('thick New York accent');
  d.push(/!/.test(text)?'animated':/\?/.test(text)?'curious':'natural, conversational');
  return '['+d.join(', ')+'] '+text.replace(/\bTa-?ta\b/gi,m=>m===m.toUpperCase()?'TAH TAH':'Tah Tah');
}

// ---------- voices ----------
const NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',nara:'Nara',justin:'Justin'};
const voices={};
function vset(kind,id,v){ if(!v) return; const st=v.settings||{};
  voices[kind+'|'+id]={voice_id:v.voice_id||'',model:v.model||'eleven_v4',stability:st.stability!=null?st.stability:.5,similarity:st.similarity_boost!=null?st.similarity_boost:.85,direction:v.direction||'',
    sfx:!!v.sfx,prompt_influence:v.prompt_influence||.5}; }
for(const ch in BC.voices) vset('battle',ch,BC.voices[ch]);
for(const id in DC.voices) vset('dialog',id,DC.voices[id]);
// A character with battle lines but no battle voice yet (Justin, 2026-10-31) uses the same voice as his dialogue.
for(const ch in LINES) if(!voices['battle|'+ch]&&DC.voices[ch]) vset('battle',ch,Object.assign({},DC.voices[ch],ch==='justin'?{direction:'thick New York accent'}:{}));
const vname=id=>id[0]==='?'?id.slice(1):(NAMES[id]||(CAST.voices[id]&&CAST.voices[id].name)||id);
// Merge effects: battle clips only deepen Boppy (tools/battle-baker/merge.js); dialogue adds speaker or voice fx, Boppy, Grace shrink (tools/clip-audit/merge.py).
const fxOf=(voice,speaker,battle)=>battle?voice==='boppy':!!((speaker&&CAST.speakerFx&&CAST.speakerFx[speaker])||voice==='boppy'||voice==='grace'||(CAST.voices[voice]&&CAST.voices[voice].fx));

// ---------- items ----------
const files=[], fidx=f=>{ let i=files.indexOf(f); if(i<0){ files.push(f); i=files.length-1; } return i; };
const items=[];
const ORDER=['tom','grace','rose','amy','deedee','boppy','tnb','justin','nara'];
// Scripts for lines not yet baked can also come from the Bake page list (tools/bake-page/pending.json: {voice,kind:'battle',text,script}).
const PS={}; if(fs.existsSync('tools/bake-page/pending.json')){ const pj=JSON.parse(fs.readFileSync('tools/bake-page/pending.json','utf8')); for(const it of (Array.isArray(pj)?pj:pj.items||[])) if(it.kind==='battle'&&it.voice&&it.text&&it.script) PS[it.voice+'|'+it.text]=it.script; }
for(const ch of ORDER){ const L=LINES[ch]; if(!L) continue;
  const byText=new Map();
  for(const kind in L) for(const t of L[kind]){ if(!byText.has(t)) byText.set(t,[]); const a=byText.get(t); if(!a.includes(kind)) a.push(kind); }
  const clips=BC.clips[ch]||{};
  for(const [t,kinds] of byText){
    let has=false; for(const k in clips) if((clips[k]||[]).some(x=>x&&x.text===t)) { has=true; break; }
    const ks=[...(textCh[norm(t)]||[])].sort((a,b)=>a-b);
    const it={t:'b',v:ch,k:kinds,x:t,ty:kinds.every(k=>DIALOG_KIND.test(k))?'d':'b',c:ks,w:kinds.join(', '),f:has?fidx(bfile[ch]||'data/voice-clips.js'):-1};
    if(ch==='nara'){ const pr=(BC.voices.nara||{}).prompts||{}; const p=kinds.map(k=>pr[k+'|'+t]).find(Boolean); it.p=p?p.p:'Friendly medium-size dog, happy excited barks.'; it.d=p?p.d:2; }
    else it.s=PS[ch+'|'+t]||kinds.map(k=>BS[ch+'|'+k+'|'+t]).find(Boolean)||plain(ch,t);
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
// Dialogue the game shows that has no clip yet (tools/voice-library/harvest.json from harvest.py). Speakers with no voice in
// DIALOG_CAST are listed too (they cannot be voiced until Claude casts one); Nara's dialogue is her bark sound, not a voice.
run('data/contraction-alias.js'); const CO=vm.runInContext('CONTRACT_OLD',ctx);
const MONCH={'monsters.js':1,'la-monsters.js':2,'marsh-monsters.js':3,'backlot-monsters.js':4,'school-monsters.js':5,'oak-monsters.js':6,'library-monsters.js':7,'barn-monsters.js':8,'club-monsters.js':9,'terminal-monsters.js':10,'p2-monsters.js':11};
const monCh={};
for(const f of fs.readdirSync('data').filter(f=>/monsters\.js$/.test(f))){ const m=f.match(/^ch(\d+)-monsters\.js$/); const n=m?+m[1]:MONCH[f]; if(!n) continue;
  for(const x of fs.readFileSync('data/'+f,'utf8').matchAll(/^\s{2}(\w+):\{/gm)) monCh[x[1]]=monCh[x[1]]||n; }
const H=fs.existsSync('tools/voice-library/harvest.json')?JSON.parse(fs.readFileSync('tools/voice-library/harvest.json','utf8')).lines:[];
const seenKey=new Set(items.map(it=>(it.t==='b'?'b|':'d|')+it.v+'|'+it.x));
const btext={}; for(const ch in BC.clips){ btext[ch]=new Set(); for(const k in BC.clips[ch]) for(const c of BC.clips[ch][k]||[]) if(c&&c.text) btext[ch].add(c.text); }
let nNo=0, nNoVoice=0;
for(const l of H){
  if(l.speaker==='Nara') continue;
  const v=CAST.speakers[String(l.speaker).trim()]||null, t=l.text;
  if(!t||!t.trim()) continue;
  const key=v?v+'|'+t:'?'+l.speaker+'|'+t;
  if(v&&(DC.clips[key]||(CO[t]&&DC.clips[v+'|'+CO[t]]))) continue;            // has a dialogue clip
  if(v&&btext[v]&&btext[v].has(t)) continue;                                 // the scene plays the battle clip with these words
  if(seenKey.has('d|'+(v||'?'+l.speaker)+'|'+t)) continue; seenKey.add('d|'+(v||'?'+l.speaker)+'|'+t);
  const n=norm(t), src=l.src||'', parts=src.split(':');
  let ks=[...(textCh[n]||[])].sort((a,b)=>a-b);
  if(parts[0]==='scene'&&sceneCh[parts[1]]) ks=[sceneCh[parts[1]]];
  if(!ks.length&&parts[0]==='monster'&&monCh[parts[1]]) ks=[monCh[parts[1]]];
  if(!ks.length&&DCH[(v||'')+'|'+n]) ks=[DCH[(v||'')+'|'+n]];
  const where=DCTX[(v||'')+'|'+n]||(parts[0]==='scene'?'Scene '+parts[1]:parts[0]==='npc'?'Talking to '+l.speaker+(l.map?' ('+l.map+')':''):parts[0]==='monster'?'Monster talk':parts[0]);
  const it={t:'d',v:v||('?'+l.speaker),x:t,ty:'d',c:ks,w:where,f:-1,sp:l.speaker,s:DS[(v||'')+'|'+n]||plain(v||'',t)};
  if(!DS[(v||'')+'|'+n]) it.auto=1;
  if(!v){ it.nv=1; nNoVoice++; }
  if(v&&fxOf(v,l.speaker)) it.fx=1;
  items.push(it); nNo++;
}
for(const it of items) if(it.v[0]==='?'){ /* listed under the speaker's own name */ }
// Every Justin script, battle and dialogue, carries the accent (Tom, 2026-10-31).
const ACC='thick New York accent';
for(const it of items) if(it.v==='justin'&&it.s){ const m=it.s.match(/^\[([^\]]*)\]\s*([\s\S]*)$/); it.s=m?(m[1].toLowerCase().includes(ACC.toLowerCase())?it.s:'['+ACC+', '+m[1]+'] '+m[2]):'['+ACC+'] '+it.s; }
items.forEach((it,i)=>it.i=i);
console.log('dialogue lines with no clip:',nNo,'('+nNoVoice+' have no voice cast yet)');
const who={}; for(const it of items){ const k=it.v; who[k]=who[k]||{id:k,name:vname(k),n:0,family:!!NAMES[k]}; who[k].n++; }
const out={made:new Date().toISOString().slice(0,10),files,voices,who:Object.values(who).sort((a,b)=>(b.family-a.family)||(ORDER.indexOf(a.id)-ORDER.indexOf(b.id))||a.name.localeCompare(b.name)),
  chapters:Object.keys(titles).map(Number).sort((a,b)=>a-b).map(n=>({n,title:titles[n]})),items};
fs.writeFileSync('data/voice-index.json',JSON.stringify(out));
const nb=items.filter(x=>x.t==='b').length, nd=items.length-nb, auto=items.filter(x=>x.auto).length;
console.log('wrote data/voice-index.json:',items.length,'lines ('+nb+' battle, '+nd+' dialogue;',auto,'dialogue lines with a plain direction),',
  Object.keys(voices).length,'voices,',(fs.statSync('data/voice-index.json').size/1024).toFixed(0)+' KB');
