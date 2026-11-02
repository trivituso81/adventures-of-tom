// Purge unused voice data. Usage (repo root): node tools/clip-audit/purge_unused.js <spec.json> [--apply]
// spec = { deadKinds: { id: [kind, ...] }, orphanClips: [ {id, k, text} ], orphanDialog: [ 'voice|exact text', ... ] }
// orphanDialog removes dialogue clips from data/voice/dialog-ch*.js (keys are 'voice|exact text'); unused_voice.py check 4 lists them,
// but it skips any clip whose first 40 characters still appear in an old reference copy under tools/, so read the old text by hand too.
// Removes (a) every clip under a dead kind, (b) every orphan clip (kind+text), (c) the matching bake-script notes in
// data/voice-clips.js voices.<id>.scripts. Checks each file round-trips byte for byte before touching it, so every
// surviving clip is unchanged. Without --apply it only counts. Lines in data/lines.js are edited separately.
const fs=require('fs');
const spec=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),apply=process.argv.includes('--apply');
const dead=spec.deadKinds||{}, orph=new Set((spec.orphanClips||[]).map(o=>o.id+'|'+o.k+'|'+o.text));
let removed=0,bytes=0; const report=[];
function purgeClips(id,clips){ for(const k of Object.keys(clips)){
  const keep=[]; for(const c of clips[k]){ const kill=(dead[id]||[]).includes(k)||orph.has(id+'|'+k+'|'+(c&&c.text));
    if(kill){ removed++; bytes+=(c.mp3||'').length*.75; report.push(id+'.'+k+': '+c.text); } else keep.push(c); }
  if(keep.length) clips[k]=keep; else delete clips[k]; } }
// per-character files
for(const id of fs.readdirSync('data/voice').filter(f=>/^[a-z]+\.js$/.test(f)).map(f=>f.slice(0,-3))){
  const p='data/voice/'+id+'.js', s=fs.readFileSync(p,'utf8'), pre='VOICE_CLIPS.clips.'+id+'=', i=s.indexOf(pre);
  if(i<0) continue; const a=i+pre.length, b=s.lastIndexOf('};'), json=s.slice(a,b+1), obj=JSON.parse(json);
  if(JSON.stringify(obj)!==json) throw new Error('round-trip mismatch '+p);
  purgeClips(id,obj); if(apply) fs.writeFileSync(p,s.slice(0,a)+JSON.stringify(obj)+s.slice(b+1)); }
// settings file (Nara and bake notes)
{ const p='data/voice-clips.js', s=fs.readFileSync(p,'utf8'), a=s.indexOf('{',s.indexOf('const VOICE_CLIPS=')), b=s.lastIndexOf('};'), json=s.slice(a,b+1), obj=JSON.parse(json);
  if(JSON.stringify(obj)!==json) throw new Error('round-trip mismatch '+p);
  for(const id of Object.keys(obj.clips)) purgeClips(id,obj.clips[id]);
  let notes=0; for(const key of Object.keys(obj.voices||{})){ const v=obj.voices[key], sc=v&&v.scripts; if(!sc) continue; const id=key.replace(/^battle\|/,'');
    for(const sk of Object.keys(sc)){ const j=sk.indexOf('|'), k=sk.slice(0,j), t=sk.slice(j+1);
      if((dead[id]||[]).includes(k)||orph.has(id+'|'+k+'|'+t)){ delete sc[sk]; notes++; } } }
  console.log('bake-script notes removed:',notes);
  if(apply) fs.writeFileSync(p,s.slice(0,a)+JSON.stringify(obj)+s.slice(b+1)); }
// dialogue clips (data/voice/dialog-ch*.js: Object.assign(DIALOG_CLIPS.clips,{"voice|text":"mp3",...});)
{ const od=new Set(spec.orphanDialog||[]); let dn=0;
  if(od.size) for(const f of fs.readdirSync('data/voice').filter(f=>/^dialog-ch\d+\.js$/.test(f))){
    const p='data/voice/'+f, s=fs.readFileSync(p,'utf8'), pre='Object.assign(DIALOG_CLIPS.clips,', i=s.indexOf(pre); if(i<0) continue;
    const a=i+pre.length, b=s.indexOf('});',a), json=s.slice(a,b+1), obj=JSON.parse(json); // the first statement only: a second Object.assign(DIALOG_CLIPS.voices,...) follows it
    if(JSON.stringify(obj)!==json) throw new Error('round-trip mismatch '+p);
    let hit=0; for(const k of Object.keys(obj)) if(od.has(k)){ bytes+=(obj[k]||'').length*.75; report.push('dialog '+f+': '+k); delete obj[k]; hit++; }
    if(hit){ dn+=hit; if(apply) fs.writeFileSync(p,s.slice(0,a)+JSON.stringify(obj)+s.slice(b+1)); } }
  removed+=dn; console.log('dialogue clips removed:',dn,'of',od.size); }
console.log((apply?'REMOVED ':'WOULD REMOVE ')+removed+' clips, about '+Math.round(bytes/1024)+' KB'); console.log(report.join('\n'));
