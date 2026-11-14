'use strict';
// node tools/voice-library/rekey-voice.js <spec.json> [--apply]
// Moves baked dialogue clips from one voice key to another without touching the audio, for a speaker who gets a voice key of her own
// while some of her old-voice clips must keep playing (bern1, 2026-11-14: Bernadette left the shared `penny` key; her seven potluck
// lines keep their old audio until that chapter is rewritten). spec = { from:'penny', to:'bernadette', since:'<ISO time of the recast>',
// texts:['exact line text', ...] }. Each 'from|text' key in data/voice/dialog-ch*.js becomes 'to|text' in the same file, same place,
// same bytes. The moved clips are recorded in tools/voice-library/old-voice.json under <to>, so the Voice Library lists the lines under
// Show > Old voice until a new take replaces them (make-index.js marks a line ov:1 while its baked clip still has one of those hashes).
// Every file is checked to round-trip byte for byte before it is written. Without --apply it only counts.
const fs=require('fs'), crypto=require('crypto');
const spec=JSON.parse(fs.readFileSync(process.argv[2],'utf8')), apply=process.argv.includes('--apply');
const sha=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
const want=new Set(spec.texts.map(t=>spec.from+'|'+t)), found=new Set(), hashes=new Set();
for(const f of fs.readdirSync('data/voice').filter(f=>/^dialog-ch\d+\.js$/.test(f))){
  const p='data/voice/'+f, s=fs.readFileSync(p,'utf8'), pre='Object.assign(DIALOG_CLIPS.clips,', i=s.indexOf(pre); if(i<0) continue;
  const a=i+pre.length, b=s.indexOf('});',a), json=s.slice(a,b+1), obj=JSON.parse(json);
  if(JSON.stringify(obj)!==json) throw new Error('round-trip mismatch '+p);
  const out={}; let hit=0;
  for(const k of Object.keys(obj)){
    if(want.has(k)){ const nk=spec.to+k.slice(spec.from.length); if(nk in obj) throw new Error('target key exists: '+nk);
      out[nk]=obj[k]; hashes.add(sha(obj[k])); found.add(k); hit++; console.log(f+': '+k+'  ->  '+spec.to+'|...'); }
    else out[k]=obj[k]; }
  if(hit&&apply) fs.writeFileSync(p,s.slice(0,a)+JSON.stringify(out)+s.slice(b+1)); }
const missing=[...want].filter(k=>!found.has(k));
if(missing.length){ console.error('NOT FOUND:\n'+missing.join('\n')); process.exit(1); }
if(apply){ const OUT='tools/voice-library/old-voice.json', J=JSON.parse(fs.readFileSync(OUT,'utf8'));
  const old=new Set((J[spec.to]&&J[spec.to].hashes)||[]); for(const h of hashes) old.add(h);
  J[spec.to]={at:new Date(spec.since).getTime(),since:spec.since,commit:spec.commit||'',hashes:[...old].sort()};
  fs.writeFileSync(OUT,JSON.stringify(J,null,1)+'\n'); }
console.log((apply?'MOVED ':'WOULD MOVE ')+found.size+' clips from '+spec.from+' to '+spec.to);
