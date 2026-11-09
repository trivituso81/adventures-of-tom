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
function litPos(s){ const out=[]; const re=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g; let m;
  while((m=re.exec(s))){ const raw=m[1]!=null?m[1]:m[2]!=null?m[2]:m[3]; out.push({t:raw.replace(/\\u([0-9a-fA-F]{4})/g,(a,h)=>String.fromCharCode(parseInt(h,16))).replace(/\\(.)/g,'$1'),i:m.index}); }
  return out; }
const segs=[], titles={}, textPos={};   // textPos: norm(text) -> {n,i} first place in the story (chapter, offset inside that chapter's source)
const seePos=(k,n,i)=>{ const p=textPos[k]; if(!p||n<p.n||(n===p.n&&i<p.i)) textPos[k]={n,i}; };
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
    for(const {t,i:li} of litPos(s.slice(st,i))){ const k=norm(t); (textCh[k]=textCh[k]||new Set()).add(n); textWho[k]=textWho[k]||m[1]; seePos(k,n,st+li); }
  }
  for(const {t,i:li} of litPos(s)){ const k=norm(t); if(k.length>12&&!textCh[k]) (textCh[k]=new Set()).add(n); if(k.length>12) seePos(k,n,li); }
}
// Lines spoken by battle code are battle; greet, join, praise and intro lines are dialogue (same rule as the Voice Baker).
const DIALOG_KIND=/^(greet|join|praise|intro.*|nara_no_jump)$/;

// ---------- scripts ----------
const BS=fs.existsSync('tools/voice-library/battle-scripts.json')?JSON.parse(fs.readFileSync('tools/voice-library/battle-scripts.json','utf8')):{};
// Rewritten battle directions ('voice|text' -> script) from merge-directions.py: they replace stock tags that did not fit the move or the moment.
const BO=fs.existsSync('tools/voice-library/battle-overrides.json')?JSON.parse(fs.readFileSync('tools/voice-library/battle-overrides.json','utf8')):{};
const DS={}, DCTX={}, DCH={};
const SD='tools/voice-library/scripts';
const SFILES=[];
for(const d of ['docs',SD]) if(fs.existsSync(d)) fs.readdirSync(d).filter(f=>d===SD?f.endsWith('.json'):/^dialogue-scripts-.*\.json$/.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).forEach(f=>SFILES.push(d+'/'+f));
for(const sf of SFILES){
  const j=JSON.parse(fs.readFileSync(sf,'utf8')); const list=Array.isArray(j)?j:(j.lines||[]);
  for(const it of list){ if(!it||it.voice==null||!it.text||!it.script) continue; const k=it.voice+'|'+norm(it.text);
    DS[k]=it.script; if(it.ctx) DCTX[k]=it.ctx; if(j.chapter) DCH[k]=j.chapter; }
}
// Fallback direction for a line with no written script (a brand-new line). Written scripts always win (scripts/*.json).
// Never "natural, conversational": it says nothing. Start from who is speaking and what the punctuation and caps say, so the
// first take is at least in character; the Library marks these lines "plain direction" so they get a real script when Claude next
// writes directions (tools/voice-library/merge-directions.py).
const BASE={tom:'dry, calm',grace:'bright, bossy',rose:'small, earnest, silly',amy:'brisk, coach voice',deedee:'warm, steady',boppy:'playful, joking',tnb:'easy, amused',justin:'direct, serious',sal:'quick, friendly'};
function plain(voice,text){
  const t=text.replace(/\bTa-?ta\b/gi,m=>m===m.toUpperCase()?'TAH TAH':'Tah Tah');
  const d=[]; if(BASE[voice]) d.push(BASE[voice]);
  const caps=/\b[A-Z]{3,}\b/.test(t.replace(/\bTAH TAH\b/g,''));
  const mood=/^\W*\.\.\./.test(t)?'trailing off':/\?\s*$/.test(t)?(caps?'incredulous':'asking'):/!\s*$/.test(t)?(caps?'emphatic, loud':'bright, energetic'):caps?'emphasizing':'';
  if(mood) d.push(mood); else if(!d.length) d.push('matter-of-fact');
  return '['+d.join(', ')+'] '+t;
}

// ---------- voices ----------
const NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',nara:'Nara',justin:'Justin'};
const voices={};
function vset(kind,id,v){ if(!v) return; const st=v.settings||{};
  voices[kind+'|'+id]={voice_id:v.voice_id||'',model:v.model||'eleven_v4',stability:st.stability!=null?st.stability:.5,similarity:st.similarity_boost!=null?st.similarity_boost:.85,direction:v.direction||'',
    sfx:!!v.sfx,prompt_influence:v.prompt_influence||.5,...(st.speed!=null?{speed:st.speed}:{})}; }
for(const ch in BC.voices) vset('battle',ch,BC.voices[ch]);
for(const id in DC.voices) vset('dialog',id,DC.voices[id]);
// A character with battle lines but no battle voice yet (Justin, 2026-10-31) uses the same voice as his dialogue.
for(const ch in LINES) if(!voices['battle|'+ch]&&DC.voices[ch]) vset('battle',ch,Object.assign({},DC.voices[ch],ch==='justin'?{direction:'thick New York accent'}:{}));
// Boppy and Justin always carry "thick New York accent" (Tom, 2026-11-01 20:34: the clips lose the accent without it).
// The baked takes that kept the accent repeated it at the start of EVERY [bracket] ("[thick New York accent, hissing] ..."), so the
// accent is written into every bracket of every Boppy and Justin script (end of this file), and the voice direction carries it too.
// Tom 21:08: Boppy is sweet, fun-loving, a joker and a complainer (no "gruff", no "gravelly"; scripts say so). Tom 21:25: Boppy then
// sounded too high, so his voice direction is "thick New York accent, deep voice" and his similarity is back at the voice entry's 1.0
// (0.75 made him higher); merges deepen his clips again (pitch 0.9). Justin is direct and serious (no "warm").
// Deedee recast (Tom, 2026-11-02): new ElevenLabs voice from recast-deedee.html. Baked data keeps the old id, so it is overridden here, as for Boppy.
// No voice direction at all (89 put a 20-word one here and takes doubled and tripled the phrase, see CHANGES 90): each line's own short tags carry the acting.
for(const k of ['battle|deedee','dialog|deedee']){ const v=voices[k]; if(!v) continue;
  v.voice_id='nh4f8rul91SCFqbXpyM0'; v.direction=''; }
// Narrator (Tom, 2026-11-03): narration boxes use Mr. Washington's ElevenLabs voice (no free voice slot), until a baked file carries its own.
if(!voices['dialog|narrator']&&voices['dialog|washington']) voices['dialog|narrator']=Object.assign({},voices['dialog|washington']);
// Narrator delivery (Tom, 2026-11-03): theatrical storyteller, lively pace, not slow. Same voice id; only the direction changes.
if(voices['dialog|narrator']) voices['dialog|narrator'].direction='theatrical storyteller, lively pace';
if(voices['dialog|narrator']) voices['dialog|narrator'].speed=1.15; // ElevenLabs speaking rate (0.7 to 1.2); Tom: the narrator spoke too slowly in the preview
// The Mirrorball (Tom 11-08): Dolores' voice no longer exists on ElevenLabs (404), so she reuses an existing lady voice (no new
// slot). fallback_ids: voices.html tries the next id when ElevenLabs answers 404 (voice deleted), so one missing voice never blocks a bake.
// Tom 11-09: exaggerated, over the top, almost cartoonish fancy lady: stability 0 (most expressive) and a campy direction on every line.
// ignore_history: voices.html uses the written scripts, not the annotations of her older (elegant) takes in the ElevenLabs history.
{ const LADY=['oolong','odette','luna','penny','carmen'].map(k=>voices['dialog|'+k]&&voices['dialog|'+k].voice_id).filter(Boolean);
  const ids=[...new Set(LADY)];
  if(ids.length){
    voices['dialog|mirrorball']=Object.assign({},voices['dialog|oolong']||{},{voice_id:ids[0],fallback_ids:ids.slice(1),stability:0,ignore_history:true,direction:'over-the-top cartoon grande dame, hugely exaggerated posh accent, swooping theatrical pitch, campy and dramatic'});
    if(voices['dialog|dolores']) voices['dialog|dolores'].fallback_ids=ids;   // Dolores' own id is gone too
  } }
for(const id of ['boppy','justin']) for(const k of ['battle|'+id,'dialog|'+id]){ const v=voices[k]; if(!v) continue;
  v.direction=id==='boppy'?'thick New York accent, deep voice':'thick New York accent'; }
const vname=id=>id[0]==='?'?id.slice(1):(NAMES[id]||(CAST.voices[id]&&CAST.voices[id].name)||id);
// Merge effects: battle clips only deepen Boppy (tools/battle-baker/merge.js); dialogue adds speaker or voice fx, Boppy, Grace shrink (tools/clip-audit/merge.py).
const fxOf=(voice,speaker,battle)=>battle?voice==='boppy':!!((speaker&&CAST.speakerFx&&CAST.speakerFx[speaker])||voice==='boppy'||voice==='grace'||(CAST.voices[voice]&&CAST.voices[voice].fx));

// ---------- items ----------
const files=[], fidx=f=>{ let i=files.indexOf(f); if(i<0){ files.push(f); i=files.length-1; } return i; };
const items=[];
const ORDER=['tom','grace','rose','amy','deedee','boppy','tnb','justin','nara'];
for(const ch of ORDER){ const L=LINES[ch]; if(!L) continue;
  const byText=new Map();
  for(const kind in L) for(const t of L[kind]){ if(!byText.has(t)) byText.set(t,[]); const a=byText.get(t); if(!a.includes(kind)) a.push(kind); }
  const clips=BC.clips[ch]||{};
  for(const [t,kinds] of byText){
    let has=false; for(const k in clips) if((clips[k]||[]).some(x=>x&&x.text===t)) { has=true; break; }
    const ks=[...(textCh[norm(t)]||[])].sort((a,b)=>a-b);
    const it={t:'b',v:ch,k:kinds,x:t,ty:kinds.every(k=>DIALOG_KIND.test(k))?'d':'b',c:ks,w:kinds.join(', '),f:has?fidx(bfile[ch]||'data/voice-clips.js'):-1};
    if(ch==='nara'){ const pr=(BC.voices.nara||{}).prompts||{}; const p=kinds.map(k=>pr[k+'|'+t]).find(Boolean); it.p=p?p.p:'Friendly medium-size dog, happy excited barks.'; it.d=p?p.d:2; }
    else it.s=BO[ch+'|'+t]||kinds.map(k=>BS[ch+'|'+k+'|'+t]).find(Boolean)||plain(ch,t);
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
// DIALOG_CAST are listed too (they cannot be voiced until Claude casts one); Nara's boxes are narration, read by the Narrator (Tom 11-06; DIALOG_CAST 'Nara':'narrator').
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
  const it={t:'d',v:v||('?'+l.speaker),x:t,ty:'d',c:ks,w:where,f:-1,sp:l.speaker,s:DS[(v||'')+'|'+n]||DS['?'+l.speaker+'|'+n]||DS['|'+n]||plain(v||'',t)};
  if(!DS[(v||'')+'|'+n]&&!DS['?'+l.speaker+'|'+n]&&!DS['|'+n]) it.auto=1;
  if(!v){ it.nv=1; nNoVoice++; }
  if(v&&fxOf(v,l.speaker)) it.fx=1;
  items.push(it); nNo++;
}
for(const it of items) if(it.v[0]==='?'){ /* listed under the speaker's own name */ }
// Scripts carry no accent words (Tom, 2026-11-01: tags describe the voice only). Boppy and Justin are the exception, and their
// accent comes from the voice direction set above ("thick New York accent", Tom 2026-11-01 20:34), not from the scripts.
// ---------- which ability or combo a battle line belongs to (Tom, 2026-10-31) ----------
// Every battle line whose kind is an ability key, a Tombo, a Director's Cut or a Family Finish gets it.mv = [[type, name, with]]
// so the Voice Library can say, on the row itself, which move the clip belongs to. Names come from data/abilities.js (B8_KITS)
// and data/battle2-data.js (B2_TOMBOS), never typed here. Kinds like hurt, low, ko, win have no move and get no label.
const mctx={console,window:{}}; vm.createContext(mctx);
for(const f of ['data/progress.js','data/abilities.js','data/battle2-data.js']) vm.runInContext(src(f),mctx,{filename:f});
const KITS=vm.runInContext('B8_KITS',mctx), TOMBOS=vm.runInContext('B2_TOMBOS',mctx);
const TB={}; for(const t of TOMBOS) TB[t.id]=t;
const ABIL={}, PLAY={};   // ABIL[char][key] = {name,slot,rx,base}; PLAY[char][legacy play kind] = same as the Primary of that slot
for(const ch in KITS){ ABIL[ch]={}; PLAY[ch]={};
  for(const slot in KITS[ch]){ const e=KITS[ch][slot]; if(!e||!e.p) continue;
    const base={name:e.p.name,slot,rx:false}; ABIL[ch][e.p.key]=base; if(e.play) PLAY[ch][e.play]=base;
    if(e.r&&e.r.key) ABIL[ch][e.r.key]={name:e.r.name,slot,rx:true,base:e.p.name}; } }
// Deedee's old 'basic' lines (smudge, spit shine) belong to the Spit Shine Remix, not to Dish-Towel Flick (which says only its own line).
if(PLAY.deedee&&ABIL.deedee&&ABIL.deedee.rx_spitshine) PLAY.deedee.basic=ABIL.deedee.rx_spitshine;
// Older move names that are still spoken: the move file lists its first-generation moves in slot order (basic, A1 to A5, B1 to B5),
// and tom-moves.js (Round 3 note) names the renames. Each old kind belongs to the slot it was written for, so it takes that
// slot's current name.
const SLOT_ALIAS={
  tom:{controller_tap:'basic',starter_inspection:'A1',proofing_drawer:'A2',crumb_shot:'A2',toast_negotiations:'A3',mint_unboxing:'A3',warranty_void:'A4',crumb_barrier:'A5',window_seat:'A5',five_minute_review:'B1',dpad_detour:'B2',save_sandwich:'B3',radical_solutions:'B4',patch_notes:'B5',block:'sig'},
  boppy:{cap_check:'basic',closing_time:'A4',sensible_pepper:'B1',jar_lid_negotiations:'B5',roar:'sig'},
  tnb:{clay_offcut:'basic',lost_found_warmth:'A3',practical_effects:'A4',clay_pigeon:'B1'}};
const bySlot=(ch,slot)=>{ const e=slot&&KITS[ch]&&KITS[ch][slot]; return e&&e.p?{name:e.p.name,slot,rx:false}:null; };
// A Remix move whose spoken kind is its own name (beam_dismount = Beam Dismount) is that Remix.
const RXSLUG={}; for(const ch in KITS) for(const slot in KITS[ch]){ const e=KITS[ch][slot]; if(e&&e.r&&e.r.key){ RXSLUG[ch+'|'+e.r.name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')]={name:e.r.name,slot,rx:true,base:e.p.name}; } }
const LEGACY_PARTNER={decker:'rose',fetch:'nara',pier:'boppy'};
const PARTNERS='grace|rose|amy|deedee|boppy|tnb|nara';
const slotType=(slot,rx)=>(rx?'Remix ':'')+(slot==='basic'?'Basic move':slot==='sig'?'Signature':/6$/.test(slot)?'Ultimate':'Ability');
function comboOf(id){ const t=TB[id]; if(!t) return null;
  const who=t.who==='all'?'whole family':Array.isArray(t.who)?t.who.map(w=>NAMES[w]||w).join(', '):t.partner?'Tom + '+(NAMES[t.partner]||t.partner):'';
  const type=t.tier==='ff'?(t.dc?"Family Finish, Director's Cut":'Family Finish'):t.dc?"Director's Cut, Tombo "+t.tier:'Tombo '+t.tier;
  return [type,t.name,who]; }
function moveOf(v,k){
  let m;
  if((m=k.match(/^tombo([23])?$/))&&TB[v+(m[1]||1)]) return comboOf(v+(m[1]||1));
  if((m=k.match(/^dc([123])$/))&&TB[v+m[1]+'_dc']) return comboOf(v+m[1]+'_dc');
  if((m=k.match(/^(ff|dcff)([1-4])$/))) return comboOf('ff'+m[2]+(m[1]==='dcff'?'_dc':''));
  if((m=k.match(new RegExp('^tombo('+PARTNERS+'|decker|fetch|pier)([23])?$')))){ const p=LEGACY_PARTNER[m[1]]||m[1]; return comboOf(p+(m[2]||1)); }
  if((m=k.match(new RegExp('^dc('+PARTNERS+')([123])(ow)?$')))) return comboOf(m[1]+m[2]+'_dc');
  if(k==='ymamot') return comboOf('amy2');                       // Grace's line inside Amy and Tom's Ymamot Creation
  if(k==='foot_tap_tap') return ['Ability','Foot Tap','Justin'];  // spoken by the girls inside Justin's Foot Tap
  const A=ABIL[v]||{}, P=PLAY[v]||{};
  let a=A[k]||P[k]||bySlot(v,SLOT_ALIAS[v]&&SLOT_ALIAS[v][k])||RXSLUG[v+'|'+k];
  if(!a){ let best=''; for(const key in A) if(k.startsWith(key+'_')&&key.length>best.length) best=key; if(best) a=A[best]; }   // Justin: loose_wire_spot belongs to loose_wire
  if(!a&&/_ult$/.test(k)) return null;
  return a?[slotType(a.slot,a.rx),a.name,a.rx?'Remix of '+a.base:'']:null;
}
const unresolved=new Map();
for(const it of items){ if(it.t!=='b'||it.ty!=='b') continue;
  const mv=[]; for(const k of it.k){ const r=moveOf(it.v,k); if(r){ if(!mv.some(x=>x[0]===r[0]&&x[1]===r[1])) mv.push(r); } else if(!/^(hurt|low|ko|win|attack|flashback|introshout|tombo[23]?|dc[123]|basic)$/.test(k)) unresolved.set(it.v+'.'+k,1); }
  if(mv.length) it.mv=mv; }
console.log('lines labelled with a move:',items.filter(x=>x.mv).length,'| kinds with no move found:',[...unresolved.keys()].join(' ')||'none');
// Old voice (tools/voice-library/old-voice.js): a line of a recast voice whose baked clip is still the pre-recast audio gets ov:1.
// The Library lists it under Show > Old voice until a new take is merged (the hash then no longer matches).
const OLDV=fs.existsSync('tools/voice-library/old-voice.json')?JSON.parse(fs.readFileSync('tools/voice-library/old-voice.json','utf8')):{};
const recast={}; for(const v in OLDV) recast[v]=OLDV[v].at;
{ const sha=s=>require('crypto').createHash('sha1').update(s).digest('hex').slice(0,16);
  const H={}; for(const v in OLDV) H[v]=new Set(OLDV[v].hashes);
  for(const it of items){ const h=H[it.v]; if(!h||it.f<0) continue;
    if(it.t==='d'){ const a=DC.clips[it.v+'|'+it.x]; if(a&&h.has(sha(a))) it.ov=1; }
    else { const C=BC.clips[it.v]||{}; for(const k in C) if((C[k]||[]).some(c=>c&&c.text===it.x&&c.mp3&&h.has(sha(c.mp3)))){ it.ov=1; break; } } }
  for(const v in OLDV) console.log('old voice still baked:',v,items.filter(x=>x.v===v&&x.ov).length,'lines'); }
// Story order (Tom 2026-11-06): chapter first, then where the line first occurs in that chapter's scene source. Lines tied to no chapter
// go last, in their old order. A line with the same speaker and words as an earlier one in story order is flagged dup (listed once,
// at its first appearance); nothing is deleted from the game, the clips or this index.
{ const keyOf=it=>it.v+'|'+norm(it.x);
  const rank=it=>{ const c0=it.c.length?Math.min(...it.c):999; const p=textPos[norm(it.x)]; return [c0,p&&p.n===c0?p.i:1e9]; };
  const order=items.map((it,j)=>({it,j,r:rank(it)})).sort((a,b)=>a.r[0]-b.r[0]||a.r[1]-b.r[1]||a.j-b.j);
  const seen=new Set(); let nd=0, any=0;
  order.forEach((o,k)=>{ o.it.o=k; const key=keyOf(o.it); if(seen.has(key)){ o.it.dup=1; nd++; } else seen.add(key); if(o.r[0]===999) any++; });
  console.log('story order: total',items.length,'| listed after dedup',items.length-nd,'| duplicates dropped',nd,'| no chapter (Anywhere)',any); }
items.forEach((it,i)=>it.i=i);
// Rewritten after the bake (tools/voice-library/rewritten.json): the Library must show the new written direction for these lines,
// not the direction read back from Tom's ElevenLabs history (which is the one the old clip was made with).
{ const RW=fs.existsSync('tools/voice-library/rewritten.json')?new Set(JSON.parse(fs.readFileSync('tools/voice-library/rewritten.json','utf8')).keys):new Set();
  let n=0; for(const it of items) if(it.t==='d'&&RW.has(it.v+'|'+norm(it.x))){ it.rw=1; n++; }
  console.log('rewritten after bake (history ignored):',n,'of',RW.size); }
console.log('dialogue lines with no clip:',nNo,'('+nNoVoice+' have no voice cast yet)');
const who={}; for(const it of items){ const k=it.v; who[k]=who[k]||{id:k,name:vname(k),n:0,family:!!NAMES[k]}; who[k].n++; }
// Show the accent: write it at the start of EVERY [bracket] of every Boppy and Justin script, the way the baked takes had it
// (finalText skips parts a script already has).
for(const it of items) if(it.s&&(it.v==='boppy'||it.v==='justin')){
  it.s=it.s.replace(/\[([^\]]*)\]/g,(m,t)=>/new york/i.test(t)?m:'[thick New York accent'+(t.trim()?', '+t.trim():'')+']');
  if(!/^\s*\[/.test(it.s)) it.s='[thick New York accent] '+it.s; }
const out={made:new Date().toISOString().slice(0,10),files,voices,recast,who:Object.values(who).sort((a,b)=>(b.family-a.family)||(ORDER.indexOf(a.id)-ORDER.indexOf(b.id))||a.name.localeCompare(b.name)),
  chapters:Object.keys(titles).map(Number).sort((a,b)=>a-b).map(n=>({n,title:titles[n]})),items};
fs.writeFileSync('data/voice-index.json',JSON.stringify(out));
const nb=items.filter(x=>x.t==='b').length, nd=items.length-nb, auto=items.filter(x=>x.auto).length;
console.log('wrote data/voice-index.json:',items.length,'lines ('+nb+' battle, '+nd+' dialogue;',auto,'dialogue lines with a plain direction),',
  Object.keys(voices).length,'voices,',(fs.statSync('data/voice-index.json').size/1024).toFixed(0)+' KB');
