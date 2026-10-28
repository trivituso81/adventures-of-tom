// node tools/voice-recast/merge-voice.js <recast.json> <live data dir> <outdir> <voice: deedee|ellie>
// Merges ONE voice from the Deedee and Aunt Ellie Recast Baker export, leaving every other voice untouched.
// Deedee: battle clips (data/voice/deedee.js + voices entry in data/voice-clips.js) and her dialogue clips.
// Ellie: dialogue clips only. Each new clip replaces the same voice|text key in the chapter file that already holds it.
// Dialogue clips are processed like voice-merge-dialog.js (silence trimmed, mono 32 kHz 48 kbps). Needs ffmpeg.
// Writes only changed files under <outdir>/data. Copy them over the repo, then run smoke.
const fs=require('fs'),cp=require('child_process');
const [IN,DATA,OUT,VOICE]=process.argv.slice(2);
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
const J=JSON.parse(fs.readFileSync(IN,'utf8'));
fs.mkdirSync(OUT+'/data/voice',{recursive:true});
const tmp=fs.mkdtempSync('/tmp/mv-');
const ff=(af,sr,br,b64)=>{fs.writeFileSync(tmp+'/i.mp3',Buffer.from(b64,'base64'));
  cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',tmp+'/i.mp3',...(af?['-af',af]:[]),'-ac','1','-ar',sr,'-c:a','libmp3lame','-b:a',br,tmp+'/o.mp3']);
  return fs.readFileSync(tmp+'/o.mp3').toString('base64');};
const out={battle:{replaced:0,added:0},dialogue:{}};
const FAM=['tom','grace','rose','amy','deedee','boppy','tnb'];
const bc=(J.clips||{})[VOICE];
if(FAM.includes(VOICE)&&bc){
  eval(strip(fs.readFileSync(DATA+'/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS;');
  eval(strip(fs.readFileSync(DATA+'/voice/'+VOICE+'.js','utf8')).replace('VOICE_CLIPS.','VC.'));
  const C=VC.clips[VOICE]=VC.clips[VOICE]||{};
  for(const kind in bc) for(const nc of bc[kind]){
    let removed=0; for(const k in C){const b=C[k].length;C[k]=C[k].filter(x=>!(x&&x.text===nc.text));removed+=b-C[k].length;if(!C[k].length)delete C[k];}
    removed?out.battle.replaced++:out.battle.added++; (C[kind]=C[kind]||[]).push({text:nc.text,mp3:nc.mp3,model:nc.model||'eleven_v4'});
  }
  const v=Object.assign({},J.voices[VOICE]); delete v.pick; delete v.desc; VC.voices[VOICE]=v;
  const core={clips:{},voices:VC.voices}; for(const ch in VC.clips) if(!FAM.includes(ch)) core.clips[ch]=VC.clips[ch];
  fs.writeFileSync(OUT+'/data/voice-clips.js',"'use strict';\n// data/voice-clips.js — Baked ElevenLabs clips: voice settings and Nara's barks. Each character's clips are in data/voice/<id>.js.\n// Regenerate with the Voice Baker and merge (claude/voice-baking.md); do not hand-edit.\nconst VOICE_CLIPS="+JSON.stringify(core)+";\n");
  fs.writeFileSync(OUT+'/data/voice/'+VOICE+'.js',"'use strict';\n// data/voice/"+VOICE+".js — "+VOICE+"'s baked clips (loaded after data/voice-clips.js). Merge from the Voice Baker; do not hand-edit.\nVOICE_CLIPS.clips."+VOICE+"="+JSON.stringify(C)+";\n");
}
const TRIM='silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse';
const dclips=((J.dialog&&J.dialog.clips)||[]).filter(c=>c.voice===VOICE&&c.mp3&&c.text);
if(dclips.length){
  const files={};
  for(const f of fs.readdirSync(DATA+'/voice')){ const m=/^dialog-ch(\d+)\.js$/.exec(f); if(!m) continue;
    global.DIALOG_CLIPS={clips:{},voices:{}}; eval(strip(fs.readFileSync(DATA+'/voice/'+f,'utf8')));
    files[+m[1]]={clips:DIALOG_CLIPS.clips,voices:DIALOG_CLIPS.voices,touched:false}; }
  const home=k=>{ for(const n in files) if(files[n].clips[k]) return +n; return 0; };
  const newV=J.voices[VOICE]||(J.dialog.voices||{})[VOICE];
  for(const c of dclips){ const k=c.voice+'|'+c.text, n=home(k)||c.chapter; const F=files[n]; if(!F){console.log('no chapter file for',n);continue;}
    out.dialogue[n]=out.dialogue[n]||{replaced:0,added:0}; F.clips[k]?out.dialogue[n].replaced++:out.dialogue[n].added++;
    F.clips[k]=ff(TRIM,'32000','48k',c.mp3); F.touched=true; }
  for(const n in files){ const F=files[n]; if(!F.touched) continue;
    if(newV&&newV.voice_id) F.voices[VOICE]=Object.assign({model:'eleven_v4',direction:'',designed:false},F.voices[VOICE]||{},{voice_id:newV.voice_id,name:newV.name,settings:newV.settings,designed:!!newV.designed});
    const f=OUT+'/data/voice/dialog-ch'+n+'.js';
    fs.writeFileSync(f,"'use strict';\n// data/voice/dialog-ch"+n+".js — Chapter "+n+" spoken dialogue clips, keyed 'voice|exact text' (data/dialog-cast.js). Built from the\n// Chapter Voice Baker with claude/voice-merge-dialog.js; do not hand-edit.\nObject.assign(DIALOG_CLIPS.clips,"+JSON.stringify(F.clips)+");\nObject.assign(DIALOG_CLIPS.voices,"+JSON.stringify(F.voices)+");\n");
    out.dialogue[n].MB=(fs.statSync(f).size/1e6).toFixed(2); }
}
console.log(VOICE,JSON.stringify(out));
for(const f of fs.readdirSync(OUT+'/data/voice')) console.log(' ',f,(fs.statSync(OUT+'/data/voice/'+f).size/1e6).toFixed(2)+'MB');
