// node tools/battle-baker/merge.js <voices.json> <live data dir> <outdir>
// Merges a Battle Voice Baker export (only the lines Tom ticked) into the game's battle voice files, any number of characters at once.
// A new clip replaces every existing clip with the same text (in any kind), then is added under its kind.
// Boppy's new clips are deepened (rubberband pitch 0.9, mp3 128k mono 44100), his standing rule. Scripts and Nara prompts are merged, never replaced.
// Writes only changed files under <outdir>/data. Copy them over the repo, then run tools/smoke.py. Needs ffmpeg.
const fs=require('fs'),cp=require('child_process');
const [IN,DATA,OUT]=process.argv.slice(2);
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
const J=JSON.parse(fs.readFileSync(IN,'utf8'));
const FAM=['tom','grace','rose','amy','deedee','boppy','tnb','justin'];
fs.mkdirSync(OUT+'/data/voice',{recursive:true});
eval(strip(fs.readFileSync(DATA+'/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS;');
for(const ch of FAM) eval(strip(fs.readFileSync(DATA+'/voice/'+ch+'.js','utf8')).replace('VOICE_CLIPS.','VC.'));
const tmp=fs.mkdtempSync('/tmp/bvb-');
function deepen(b64){
  fs.writeFileSync(tmp+'/i.mp3',Buffer.from(b64,'base64'));
  try{ cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',tmp+'/i.mp3','-af','rubberband=pitch=0.9','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','128k',tmp+'/o.mp3']); return fs.readFileSync(tmp+'/o.mp3').toString('base64'); }
  catch(e){ console.log('WARNING: could not deepen a Boppy clip (ffmpeg rubberband missing); left as generated'); return b64; }
}
const rep={}, touched=new Set();
for(const ch in (J.clips||{})){
  const C=VC.clips[ch]=VC.clips[ch]||{}; rep[ch]={replaced:0,added:0};
  for(const kind in J.clips[ch]) for(const nc of J.clips[ch][kind]){
    let removed=0; for(const k in C){const b=C[k].length;C[k]=C[k].filter(x=>!(x&&x.text===nc.text));removed+=b-C[k].length;if(!C[k].length)delete C[k];}
    removed?rep[ch].replaced++:rep[ch].added++;
    const e={text:nc.text,mp3:ch==='boppy'?deepen(nc.mp3):nc.mp3}; if(nc.model) e.model=nc.model;
    (C[kind]=C[kind]||[]).push(e);
  }
  const nv=Object.assign({},(J.voices||{})[ch]||{}); delete nv.pick; delete nv.desc;
  const old=VC.voices[ch]||{};
  nv.scripts=Object.assign({},old.scripts,nv.scripts);
  if(ch==='nara') nv.prompts=Object.assign({},old.prompts,nv.prompts);
  VC.voices[ch]=Object.assign({},old,nv); touched.add(ch);
}
const core={clips:{},voices:VC.voices}; for(const ch in VC.clips) if(!FAM.includes(ch)) core.clips[ch]=VC.clips[ch];
const HEAD="'use strict';\n// data/voice-clips.js — Baked ElevenLabs clips: voice settings and Nara's barks. Each character's clips are in data/voice/<id>.js.\n// Regenerate with the Voice Baker and merge (claude/voice-baking.md); do not hand-edit.\n";
fs.writeFileSync(OUT+'/data/voice-clips.js',HEAD+'const VOICE_CLIPS='+JSON.stringify(core)+';\n');
for(const ch of FAM) if(touched.has(ch)) fs.writeFileSync(OUT+'/data/voice/'+ch+'.js',"'use strict';\n// data/voice/"+ch+".js — "+ch+"'s baked clips (loaded after data/voice-clips.js). Merge from the Voice Baker; do not hand-edit.\nVOICE_CLIPS.clips."+ch+'='+JSON.stringify(VC.clips[ch])+';\n');
console.log(JSON.stringify(rep));
