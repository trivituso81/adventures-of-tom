'use strict';
// node tools/voice-library/old-voice.js <voice> <commit before the recast> <recast time ISO>
// Records which baked clips of a recast voice are still in its OLD voice, so the Voice Library can show them under
// Show > Old voice. It hashes every clip of that voice as it was at <commit> (git show) and writes
// tools/voice-library/old-voice.json {voice:{at, commit, hashes:[sha1 of the base64 mp3]}}. make-index.js marks a line
// `ov:1` while its current baked clip still has one of those hashes, so merging a new take clears it by itself.
// Example (Deedee recast, Tom 2026-11-02 12:45): node tools/voice-library/old-voice.js deedee e32e89f 2026-11-02T12:45:00-08:00
const fs=require('fs'), cp=require('child_process'), crypto=require('crypto');
const [VOICE,COMMIT,AT]=process.argv.slice(2);
if(!VOICE||!COMMIT||!AT){ console.error('usage: old-voice.js <voice> <commit> <recast ISO time>'); process.exit(1); }
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
const sha=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
const show=f=>{ try{ return cp.execFileSync('git',['show',COMMIT+':'+f],{maxBuffer:1<<30}).toString(); }catch(e){ return null; } };
const files=cp.execFileSync('git',['ls-tree','--name-only',COMMIT,'data/voice/']).toString().split('\n').filter(Boolean);
const hashes=new Set();
const bsrc=show('data/voice/'+VOICE+'.js');
if(bsrc){ global.VOICE_CLIPS={clips:{}}; eval(strip(bsrc)); const C=VOICE_CLIPS.clips[VOICE]||{};
  for(const k in C) for(const c of C[k]||[]) if(c&&c.mp3) hashes.add(sha(c.mp3)); }
const vc=show('data/voice-clips.js');
if(vc){ global.VOICE_CLIPS={clips:{}}; eval(strip(vc)); const C=(VOICE_CLIPS.clips||{})[VOICE]||{};
  for(const k in C) for(const c of C[k]||[]) if(c&&c.mp3) hashes.add(sha(c.mp3)); }
for(const f of files.filter(f=>/dialog-ch\d+\.js$/.test(f))){ const src=show(f); if(!src) continue;
  global.DIALOG_CLIPS={clips:{},voices:{}}; eval(strip(src));
  for(const k in DIALOG_CLIPS.clips) if(k.startsWith(VOICE+'|')) hashes.add(sha(DIALOG_CLIPS.clips[k])); }
const OUT='tools/voice-library/old-voice.json';
const J=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):{};
J[VOICE]={at:new Date(AT).getTime(),since:AT,commit:COMMIT,hashes:[...hashes].sort()};
fs.writeFileSync(OUT,JSON.stringify(J,null,1)+'\n');
console.log(VOICE,'old clips hashed:',hashes.size,'->',OUT);
