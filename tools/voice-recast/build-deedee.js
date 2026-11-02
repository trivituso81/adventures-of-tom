// node tools/voice-recast/build-deedee.js   (run from the repo root)
// Builds recast-deedee.html at the repo root: a lean page to redesign Deedee's ElevenLabs voice, delete the old one
// (account limit is 30 custom voices) and show the new voice id. Brief and sample come from tools/voice-recast/build.js CFG.deedee.
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..')+'/';
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
global.DIALOG_CLIPS={clips:{},voices:{}};
eval(strip(fs.readFileSync(R+'data/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS');
for(const f of fs.readdirSync(R+'data/voice')) if(/^dialog-ch\d+\.js$/.test(f)) eval(strip(fs.readFileSync(R+'data/voice/'+f,'utf8')));
const b=fs.readFileSync(__dirname+'/build.js','utf8');
const desc=(b.match(/deedee:\{[\s\S]*?desc:'((?:[^'\\]|\\.)*)'/)||[])[1];
const sample=(b.match(/deedee:\{[\s\S]*?sample:'((?:[^'\\]|\\.)*)'/)||[])[1];
if(!desc||!sample) throw new Error('could not read Deedee desc/sample from build.js');
const ids=[...new Set([...Object.values(VC.voices||{}),...Object.values(DIALOG_CLIPS.voices||{})].map(v=>v&&v.voice_id).filter(Boolean))];
const J=v=>JSON.stringify(v).replace(/<\/script/gi,'<\\/script');
let t=fs.readFileSync(__dirname+'/recast-deedee.src.html','utf8');
const put=(k,v)=>{ if(!t.includes(k)) throw new Error('missing '+k); t=t.split(k).join(v); };
put('/*__CUR__*/',J({voice_id:VC.voices.deedee.voice_id,name:VC.voices.deedee.name}));
put('/*__GAME_IDS__*/',J(ids)); put('/*__DESC__*/',J(desc.replace(/\\'/g,"'"))); put('/*__SAMPLE__*/',J(sample.replace(/\\'/g,"'")));
put('/*__BUILT__*/',new Date().toISOString().slice(0,10));
fs.writeFileSync(R+'recast-deedee.html',t);
console.log('ok',(t.length/1e3).toFixed(1)+'KB','current',VC.voices.deedee.voice_id,'game voice ids',ids.length);
