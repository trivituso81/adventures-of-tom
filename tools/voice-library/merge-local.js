// node tools/voice-library/merge-local.js <export.json[,export2.json,...]> <data dir> <outdir> [--retext=<map.json>]
// Merges a Voice Library export ({clips:[{kind,voice,lineKind,text,mp3,script,takeId,t}]}) into the game. Writes only changed files under <outdir>.
// Several exports: give them comma separated, oldest first; where two hold the same line the newest take (t) wins.
// Battle: a new clip replaces every clip with the same text (any kind), then is added under its lineKind, into data/voice/<id>.js (Nara's stay in voice-clips.js).
// Dialogue: key 'voice|text' goes to the dialog-chN.js that already holds it, else to its own chapter's file (chapters 1 to 10, from data/voice-index.json), else dialog-ch29.js (ch28 is near GitHub's 100 MB limit). Audio: silence trim, speaker/voice fx, Grace shrink, mono 32 kHz 48 kbps.
// Boppy battle clips are deepened (rubberband pitch 0.9, 128k 44100). If one text appears twice under the same line kind in the export, the newest (t) wins; the same text under two kinds keeps both. Needs ffmpeg with rubberband.
// --retext (calib2): Tom rewords lines while he tunes takes, so the export's text is the OLD screen text. The map {"voice|old text":"new screen text"}
// re-keys those dialogue clips to the new words (the scene, tsv and script files must already hold the new text).
// Kept scripts (calib2): each dialogue take's `script` (the exact text Tom sent to ElevenLabs for the take he kept) is written, unchanged, into the
// script file make-index.js reads LAST for that line (tools/voice-library/scripts/*.json, name order), or into scripts/zzzz-kept-takes.json when no
// file holds the line. Output goes to <outdir>/tools/voice-library/scripts/. Copy with: cp -r <outdir>/data/. data/ ; cp -r <outdir>/tools/. tools/
const fs=require('fs'),cp=require('child_process'),vm=require('vm');
const ARGS=process.argv.slice(2),RT=(ARGS.find(a=>a.startsWith('--retext='))||'').slice(9);
const [IN,DATA,OUT]=ARGS.filter(a=>!a.startsWith('--'));
const FAM=['tom','grace','rose','amy','deedee','boppy','tnb','justin','olivia'];
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
const ctx={console,DIALOG_CLIPS:{clips:{},voices:{}}};vm.createContext(ctx);
const run=f=>vm.runInContext(strip(fs.readFileSync(f,'utf8')).replace(/\b(const|let) (\w+)=/g,'var $2='),ctx,{filename:f});
run(DATA+'/voice-clips.js');run(DATA+'/dialog-cast.js');
const VC=ctx.VOICE_CLIPS;for(const ch of FAM){VC.clips[ch]=VC.clips[ch]||{};}
const files=fs.readdirSync(DATA+'/voice');
for(const ch of FAM){ if(files.includes(ch+'.js')) run(DATA+'/voice/'+ch+'.js'); }
const FX=Object.fromEntries([...fs.readFileSync(__dirname+'/../clip-audit/voice-merge-dialog.js','utf8').matchAll(/(\w+):'([^']*)'/g)].map(m=>[m[1],m[2]]));
const CAST=ctx.DIALOG_CAST||{};const SFX=CAST.speakerFx||{};
const TRIM='silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse';
const GRACE='asetrate=32000*1.18,aresample=32000,rubberband=pitch='+(1/1.18)+':tempo='+(1/1.18)+':formant=preserved,rubberband=pitch=1.06';
const tmp=fs.mkdtempSync('/tmp/ml-');
const ff=(b64,af,sr,br)=>{fs.writeFileSync(tmp+'/i.mp3',Buffer.from(b64,'base64'));
  cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',tmp+'/i.mp3','-af',af,'-ac','1','-ar',sr,'-c:a','libmp3lame','-b:a',br,tmp+'/o.mp3']);
  return fs.readFileSync(tmp+'/o.mp3').toString('base64');};
const fxFor=(v,sp)=>{const sf=SFX[sp];if(sf)return FX[sf];if(v==='boppy')return FX.boppy;const f=((CAST.voices||{})[v]||{}).fx;return f?FX[f]:null;};
const J={clips:[]};for(const f of IN.split(',')){const j=JSON.parse(fs.readFileSync(f,'utf8'));console.log('read',f.split('/').pop(),'made',j.made,'clips',j.clips.length);J.clips.push(...j.clips);}
const RETEXT=RT?JSON.parse(fs.readFileSync(RT,'utf8')):{};let nRt=0;
for(const c of J.clips){const nt=c.kind==='dialog'&&RETEXT[c.voice+'|'+c.text];if(nt){c.oldText=c.text;c.text=nt;nRt++;}}
if(RT)console.log('retext: '+nRt+' clips re-keyed to new words');
const best={};for(const c of J.clips){const k=c.kind+'|'+c.voice+'|'+(c.kind==='battle'?c.lineKind:'')+'|'+c.text;if(!best[k]||(c.t||0)>(best[k].t||0))best[k]=c;}
const clips=Object.values(best);console.log('export',J.clips.length,'unique',clips.length);
fs.mkdirSync(OUT+'/data/voice',{recursive:true});
const rep={},touched=new Set();
const battle=clips.filter(c=>c.kind==='battle'),wasIn=new Map();
// Pass 1: remove every old clip with the same words (any kind). Pass 2: add. Two passes so one text recorded under two kinds (quiz and pop_quiz) keeps both.
for(const c of battle){
  const ch=c.voice,C=VC.clips[ch]=VC.clips[ch]||{};
  let removed=0;for(const k in C){const b=C[k].length;C[k]=C[k].filter(x=>!(x&&x.text===c.text));removed+=b-C[k].length;if(!C[k].length)delete C[k];}
  if(removed)wasIn.set(ch+'|'+c.text,true);
}
for(const c of battle){
  const ch=c.voice,C=VC.clips[ch]=VC.clips[ch]||{};rep[ch]=rep[ch]||{replaced:0,added:0};
  wasIn.get(ch+'|'+c.text)?rep[ch].replaced++:rep[ch].added++;
  (C[c.lineKind]=C[c.lineKind]||[]).push({text:c.text,mp3:ch==='boppy'?ff(c.mp3,'rubberband=pitch=0.9','44100','128k'):c.mp3,model:'eleven_v4'});touched.add(ch);
}
const HEAD="'use strict';\n// data/voice-clips.js — Baked ElevenLabs clips: voice settings and Nara's barks. Each character's clips are in data/voice/<id>.js.\n// Regenerate with the Voice Baker and merge (claude/voice-baking.md); do not hand-edit.\n";
const core={clips:{},voices:VC.voices};for(const ch in VC.clips)if(!FAM.includes(ch))core.clips[ch]=VC.clips[ch];
fs.writeFileSync(OUT+'/data/voice-clips.js',HEAD+'const VOICE_CLIPS='+JSON.stringify(core)+';\n');
for(const ch of FAM)if(touched.has(ch))fs.writeFileSync(OUT+'/data/voice/'+ch+'.js',"'use strict';\n// data/voice/"+ch+".js — "+ch+"'s baked clips (loaded after data/voice-clips.js). Merge from the Voice Baker; do not hand-edit.\nVOICE_CLIPS.clips."+ch+'='+JSON.stringify(VC.clips[ch])+';\n');
// dialogue
const chap=files.filter(f=>/^dialog-ch\d+\.js$/.test(f));const D={},home={};
const load=f=>{const L=fs.readFileSync(DATA+'/voice/'+f,'utf8').split('\n');const ci=L.findIndex(l=>l.startsWith('Object.assign(DIALOG_CLIPS.clips,'));
  return {L,ci,clips:JSON.parse(L[ci].slice('Object.assign(DIALOG_CLIPS.clips,'.length,-2))};};
for(const f of chap){D[f]=load(f);for(const k in D[f].clips)home[k]=f;}
// A NEW line goes to its own chapter's file (calib2): data/voice-index.json knows each line's chapters, and the game loads dialog-ch1.js to
// dialog-ch10.js early and dialog-ch29.js last, after the 95 MB dialog-ch28.js. Rebuild the index (make-index.js) BEFORE merging reworded lines.
const chOf={};try{for(const it of JSON.parse(fs.readFileSync(DATA+'/voice-index.json','utf8')).items)if(it.t==='d'&&it.c&&it.c.length){const n=Math.min(...it.c);if(n>=1&&n<=10&&chap.includes('dialog-ch'+n+'.js'))chOf[it.v+'|'+it.x]='dialog-ch'+n+'.js';}}catch(e){console.log('WARNING no voice index: new lines go to dialog-ch29.js');}
const dst={},dt=new Set();
for(const c of clips.filter(c=>c.kind==='dialog')){
  const k=c.voice+'|'+c.text,f=home[k]||chOf[k]||'dialog-ch29.js';const sp=(CAST.voices||{}).hasOwnProperty(c.voice)?c.voice:c.voice;
  const chain=[TRIM];const fx=fxFor(c.voice,c.speaker);if(fx)chain.push(fx);if(c.voice==='grace')chain.push(GRACE);
  let out;try{out=ff(c.mp3,chain.join(','),'32000','48k');}catch(e){console.log('WARNING fx failed',k);out=ff(c.mp3,TRIM,'32000','48k');}
  const had=k in D[f].clips;D[f].clips[k]=out;dt.add(f);const s=f+(had?' replaced':' added');dst[s]=(dst[s]||0)+1;
}
for(const f of dt){const {L,ci,clips:cl}=D[f];L[ci]='Object.assign(DIALOG_CLIPS.clips,'+JSON.stringify(cl)+');';fs.writeFileSync(OUT+'/data/voice/'+f,L.join('\n'));}
// Ledger for the Voice Library's "Not in game yet" filter: fingerprint (first 16 hex of SHA-1 of the export's mp3 text, the same
// text the phone stores) of every clip this run processed. Clips the caller filtered out of the export are not added.
{const crypto=require('crypto'),LF=DATA+'/merged-takes.json';let H=new Set();try{H=new Set(JSON.parse(fs.readFileSync(LF,'utf8')).hashes);}catch(e){}
 for(const c of clips)H.add(crypto.createHash('sha1').update(c.mp3).digest('hex').slice(0,16));
 fs.writeFileSync(OUT+'/data/merged-takes.json',JSON.stringify({note:'Fingerprints of phone clips merged into the game (tools/voice-library/merge-local.js). Read by voices.html.',hashes:[...H].sort()})+'\n');}
// Kept scripts: the take's own script is the record of how Tom tagged the line he kept. '(recording)' is his own voice, no script.
{const SD=__dirname+'/scripts',norm=s=>String(s).replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
 const sfiles=fs.readdirSync(SD).filter(f=>f.endsWith('.json')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 const where={},cache={};   // 'voice|norm text' -> last file that holds it
 for(const f of sfiles){const raw=fs.readFileSync(SD+'/'+f,'utf8');let j;try{j=JSON.parse(raw);}catch(e){continue;}
  const rt=JSON.stringify(j,null,1)===raw.replace(/\n+$/,'');cache[f]={j,rt};
  for(const it of (Array.isArray(j)?j:(j.lines||[])))if(it&&it.voice!=null&&it.text&&it.script)where[it.voice+'|'+norm(it.text)]=f;}
 const KEPT='zzzz-kept-takes.json';const sdirty=new Set(),srep={written:0,same:0,appended:0,skipped:[]};
 for(const c of clips.filter(c=>c.kind==='dialog')){
  if(!c.script||c.script==='(recording)'){srep.skipped.push(c.voice+'|'+c.text.slice(0,40));continue;}
  const k=c.voice+'|'+norm(c.text);let f=where[k];
  if(f&&!cache[f].rt)f=null;   // a file that does not round-trip through JSON.stringify (zz-v4-overrides.json) is never rewritten here: the kept-takes file wins over it anyway
  if(!f){f=KEPT;if(!cache[f])cache[f]={j:{note:'Scripts of takes Tom kept, for lines no chapter script file holds (merge-local.js). Loads last, so it wins.',lines:[]},rt:true};
   const L=cache[f].j.lines;let e=L.find(x=>x.voice===c.voice&&norm(x.text)===norm(c.text));
   if(!e){e={voice:c.voice,text:c.text,script:''};L.push(e);srep.appended++;}
   if(e.script!==c.script){e.script=c.script;e.takeId=c.takeId;sdirty.add(f);srep.written++;}else srep.same++;continue;}
  const j=cache[f].j;for(const it of (Array.isArray(j)?j:j.lines))if(it&&it.voice===c.voice&&it.text&&norm(it.text)===norm(c.text)){
   if(it.script!==c.script){it.script=c.script;it.takeId=c.takeId;sdirty.add(f);srep.written++;}else srep.same++;}
 }
 if(sdirty.size)fs.mkdirSync(OUT+'/tools/voice-library/scripts',{recursive:true});
 for(const f of sdirty)fs.writeFileSync(OUT+'/tools/voice-library/scripts/'+f,JSON.stringify(cache[f].j,null,1)+'\n');
 console.log('kept scripts:',JSON.stringify(srep),'files',[...sdirty].join(', ')||'none');}
console.log(JSON.stringify({battle:rep,dialogue:dst}));
