// node tools/voice-library/merge-local.js <local-clips-export.json> <data dir> <outdir>
// Merges a Voice Library export ({clips:[{kind,voice,lineKind,text,mp3,t}]}) into the game. Writes only changed files under <outdir>/data.
// Battle: a new clip replaces every clip with the same text (any kind), then is added under its lineKind, into data/voice/<id>.js (Nara's stay in voice-clips.js).
// Dialogue: key 'voice|text' goes to the dialog-chN.js that already holds it, else dialog-ch28.js. Audio: silence trim, speaker/voice fx, Grace shrink, mono 32 kHz 48 kbps.
// Boppy battle clips are deepened (rubberband pitch 0.9, 128k 44100). If one text appears twice under the same line kind in the export, the newest (t) wins; the same text under two kinds keeps both. Needs ffmpeg with rubberband.
const fs=require('fs'),cp=require('child_process'),vm=require('vm');
const [IN,DATA,OUT]=process.argv.slice(2);
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
const J=JSON.parse(fs.readFileSync(IN,'utf8'));
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
const dst={},dt=new Set();
for(const c of clips.filter(c=>c.kind==='dialog')){
  const k=c.voice+'|'+c.text,f=home[k]||'dialog-ch28.js';const sp=(CAST.voices||{}).hasOwnProperty(c.voice)?c.voice:c.voice;
  const chain=[TRIM];const fx=fxFor(c.voice,c.speaker);if(fx)chain.push(fx);if(c.voice==='grace')chain.push(GRACE);
  let out;try{out=ff(c.mp3,chain.join(','),'32000','48k');}catch(e){console.log('WARNING fx failed',k);out=ff(c.mp3,TRIM,'32000','48k');}
  const had=k in D[f].clips;D[f].clips[k]=out;dt.add(f);const s=f+(had?' replaced':' added');dst[s]=(dst[s]||0)+1;
}
for(const f of dt){const {L,ci,clips:cl}=D[f];L[ci]='Object.assign(DIALOG_CLIPS.clips,'+JSON.stringify(cl)+');';fs.writeFileSync(OUT+'/data/voice/'+f,L.join('\n'));}
console.log(JSON.stringify({battle:rep,dialogue:dst}));
