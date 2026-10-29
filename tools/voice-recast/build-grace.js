// node tools/voice-recast/build-grace.js <out.html>   (run from the repo root)
// Builds the Grace Voice Baker from the live repo: Grace gets a new, real child-sounding voice (Voice Design or a pasted ID).
// Lines: every Grace battle line in data/lines.js plus every Grace dialogue line that already has a clip. Scripts (the [direction] text) for
// battle lines come from the current Ivy bake notes in data/voice-clips.js; dialogue lines get a default Grace direction.
// Merge the export with: node tools/voice-recast/merge-voice.js recast.json <data dir> <outdir> grace   (no shrink step: the new voice is already a kid).
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..')+'/', OUT=process.argv[2]||'grace-voice-baker.html';
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
eval(strip(fs.readFileSync(R+'data/lines.js','utf8'))+';global.L=LINES;');
eval(strip(fs.readFileSync(R+'data/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS');
const OLD=VC.voices.grace, OLDS=OLD.scripts||{};
const DEF='[bossy, bright, animated]';
const LINES_={grace:{}},SCRIPTS={},dlg={},lk=(k,t)=>'grace|'+k+'|'+t;
const seen=new Set();let nb=0,nd=0;
for(const k in L.grace) for(const t of L.grace[k]){ if(seen.has(t)) continue; seen.add(t);
  (LINES_.grace[k]=LINES_.grace[k]||[]).push(t); SCRIPTS[lk(k,t)]=OLDS[k+'|'+t]||(DEF+' '+t); nb++; }
const dl=[];
for(const f of fs.readdirSync(R+'data/voice')){ const m=/^dialog-ch(\d+)\.js$/.exec(f); if(!m) continue;
  global.DIALOG_CLIPS={clips:{},voices:{}}; eval(strip(fs.readFileSync(R+'data/voice/'+f,'utf8')));
  for(const key of Object.keys(DIALOG_CLIPS.clips)) if(key.startsWith('grace|')) dl.push({chapter:+m[1],text:key.slice(6)}); }
for(const d of dl.sort((a,b)=>a.chapter-b.chapter)){ const k='dlg-ch'+d.chapter; (LINES_.grace[k]=LINES_.grace[k]||[]).push(d.text);
  SCRIPTS[lk(k,d.text)]=DEF+' '+d.text; dlg[lk(k,d.text)]={chapter:d.chapter,speaker:'Grace'}; nd++; }
const CFG={grace:{
  accent:'', direction:'',
  stability:0.5, similarity:0.85, old_id:OLD.voice_id, old_name:OLD.name,
  desc:'A real nine-year-old American girl. A high, clear, slightly nasal child voice with the natural squeak and brightness of a kid that age, never a grown woman or a teenager imitating a child. Confident, a little bossy and very expressive, quick and bouncy when excited, crisp when she is giving orders, with a child\'s natural rhythm and small breaths between phrases. A gymnast and a would-be YouTuber, clear studio recording.',
  sample:'Hey guys, welcome back to my channel! Today I am doing a cartwheel, a round-off and a perfect ten. Ta-Ta, are you watching? Do not blink, because I am only doing it once. Okay, okay, twice.',
  dlg}};
let t=fs.readFileSync(__dirname+'/template.html','utf8');
const sub=(a,b)=>{ if(!t.includes(a)) throw new Error('template changed, missing: '+a.slice(0,50)); t=t.split(a).join(b); };
sub('<title>Deedee and Aunt Ellie Recast</title>','<title>Grace Voice Baker</title>');
sub('<span>Deedee and Aunt Ellie Recast</span>','<span>Grace Voice</span>');
sub("const NAMES={deedee:'Deedee',ellie:'Aunt Ellie'};","const NAMES={grace:'Grace'};");
sub("const ORDER=['deedee','ellie'];","const ORDER=['grace'];");
sub("'aot-deedee-ellie-v1'","'aot-grace-voice-v1'"); sub("char:'deedee'","char:'grace'");
sub("indexedDB.open('aot-deedee-ellie',1)","indexedDB.open('aot-grace-voice',1)"); sub("S.char='deedee'","S.char='grace'");
sub("(Long Island, '+BUILT+')","(picked '+BUILT+')");
const how=/<p style="margin-top:0"><b>1\.<\/b>[\s\S]*?<\/p>\s*<p><b>Directions<\/b>/;
if(!how.test(t)) throw new Error('how-to not found');
t=t.replace(how,()=>'<p style="margin-top:0"><b>Why:</b> Grace sounds like a grown woman. This page gives her a real child\'s voice and re-records her lines.</p><p><b>1.</b> Paste your API key. <b>2.</b> Press <b>Design 3 options</b>, play all three, press <b>Use this voice</b> on the one that sounds most like a real nine-year-old. None right? Press it again for 3 more, or paste a voice ID from the ElevenLabs library. <b>3.</b> Press <b>Generate all</b>. <b>4.</b> Listen. <b>Redo</b> any line that missed, then <b>Save recast.json</b> and send it to Claude.</p><p><b>Directions</b>');
sub('saving a new voice removes the old Deedee or Ellie voice for you','saving a new voice removes the old Ivy voice for you if your account is full');
// Library browser replaces Voice Design (ElevenLabs blocks designing child voices).
sub('<div class="win panel" id="voicePanel"></div>','<div class="win panel" id="libPanel"></div>\n    <div class="win panel" id="voicePanel"></div>');
t=t.replace(/h\+='<div class="row"><button class="btn" id="vdesign"[^\n]*\n/,()=>'\n');
sub("$('vdesign').onclick=","if($('vdesign'))$('vdesign').onclick=");
sub('Design 3 options, then Use this voice','search the library, then Use this voice');
t=t.replace(/<p style="margin-top:0"><b>Why:<\/b>[\s\S]*?<\/p><p><b>1\.<\/b>[\s\S]*?<\/p><p><b>Directions<\/b>/,()=>'<p style="margin-top:0"><b>Why:</b> Grace sounds like a grown woman. This page gives her a new voice from the ElevenLabs library and re-records her lines.</p><p><b>1.</b> Paste your API key. <b>2.</b> In <b>Pick Grace from the library</b>, search, play the previews, and press <b>Use this voice</b> on the one that sounds most like a real nine-year-old. <b>3.</b> Press <b>Generate all</b>. <b>4.</b> Listen. <b>Redo</b> any line that missed, then <b>Save recast.json</b> and send it to Claude.</p><p><b>Directions</b>');
t=t.replace('</script>\n</body>',()=>fs.readFileSync(__dirname+'/grace-library.js','utf8')+'</script>\n</body>');
t=t.replace(/  h\+='<div class="field"><label>Voice description[^\n]*\n/,()=>'');
t=t.replace(/  h\+='<div class="field"><label>Sample the options read[^\n]*\n/,()=>'');
sub("$('vdesc').oninput=e=>{c.desc=e.target.value;saveState();};$('vsample').oninput=e=>{c.sample=e.target.value;saveState();};","");
const J=v=>JSON.stringify(v).replace(/<\/script/gi,'<\\/script');
const put=(k,v)=>{ if(!t.includes(k)) throw new Error('missing '+k); t=t.split(k).join(v); };
put('/*__LINES__*/',J(LINES_)); put('/*__SCRIPTS__*/',J(SCRIPTS)); put('/*__CFG__*/',J(CFG)); put('/*__BUILT__*/',new Date().toISOString().slice(0,10));
fs.writeFileSync(OUT,t);
let chars=0; for(const k in SCRIPTS) chars+=SCRIPTS[k].length;
console.log('ok',(t.length/1e3).toFixed(0)+'KB','battle',nb,'dialogue',nd,'script chars',chars);
