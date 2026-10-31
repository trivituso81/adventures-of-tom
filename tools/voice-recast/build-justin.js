// node tools/voice-recast/build-justin.js [out.html]   (run from the repo root; default recast-justin.html, the page ADMIN > RECAST JUSTIN opens)
// Builds the Justin Recast Baker: a new deeper voice with a thick New York accent (Voice Design), then every Justin line re-recorded
// with its own hand-written direction. Tom (2026-10-31, 14:56): the first voice had no accent and every dialogue line read "natural".
// Lines: every justin battle line in data/lines.js, his dialogue lines that have a clip (data/voice/dialog-ch*.js) and the recruit
// talk on the bake list. The page puts the accent into EVERY bracket, so the scripts below carry only the emotion.
// Merge the export with: node tools/voice-recast/merge-voice.js recast.json data out1 justin
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..')+'/', OUT=process.argv[2]||'recast-justin.html';
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
eval(strip(fs.readFileSync(R+'data/lines.js','utf8'))+';global.L=LINES;');
eval(strip(fs.readFileSync(R+'data/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS');
const OLD=VC.voices.justin||{};
const bakeScripts={}; // the hand-written battle directions, minus the accent (the page adds it)
for(const it of JSON.parse(fs.readFileSync(R+'tools/bake-page/pending.json','utf8'))) if(it.voice==='justin') bakeScripts[it.kind+'|'+it.text]=it.script;
for(const k in OLD.scripts||{}) bakeScripts['battle|'+k.slice(k.indexOf('|')+1)]=OLD.scripts[k];
const noAcc=s=>s.replace(/\[\s*thick New York accent,?\s*/i,'[').replace(/\[\s*\]\s*/,'');

// ---- dialogue directions: [regex on the line, direction]; first match wins ----
const DLG=[
 [/^Amy says I never sit down/,'[dry, deadpan, a little proud of the story, grim on the last two words]'],
 [/^Big game tonight/,'[grinning, hyped, then mock-serious on the crying part]'],
 [/^Conference night is over/,'[exhausted teacher, slumping, deadpan relief]'],
 [/^Deedee’s plate\?|^Deedee's plate\?/,'[perking up, reverent, like describing a holiday]'],
 [/^Don't tell Gary\. Gary eats/,'[conspiratorial whisper, then flat disapproval of Gary]'],
 [/^Every country song/,'[easy, amused, singing the last three words a little]'],
 [/^Fixed the porch light/,'[casual brag, counting on fingers, smug on the last two words]'],
 [/^Grace, Rose, come here/,'[goofy proud dad, calling them over, quick quiz voice, then sending them off with a clap]'],
 [/^Grace, you were amazing/,'[beaming dad, warm, then puzzled and a little grossed out]'],
 [/^Halverson\. Fourth grade/,'[low, hiding, conspiratorial, a tired teacher who has read the contract]'],
 [/^Hey, everybody\. The lights/,'[cheerful, relieved, a little sheepish about the bread]'],
 [/^Hold this\. No, the other end\. It's the OTHER banner/,'[hands full, impatient, then sharp warning about the copper]'],
 [/^If you're hungry, the fridge/,'[warning, deadpan, like a safety briefing]'],
 [/^It lights up\. Every letter/,'[proud, a little offended at the question, fond on Gracie]'],
 [/^Long Island born/,'[shrugging, amused at himself, matter of fact]'],
 [/^Rewiring the hallway/,'[busy, cheerful, husband who knows the rules]'],
 [/^The banner's done/,'[satisfied, then hands full and impatient, sharp on the copper]'],
 [/^Those two girls are the best thing/,'[soft, sincere, then a proud joke about the deck]'],
 [/^Tom\. Hey\. Hold this/,'[friendly greeting mid-task, hands full, quick warning]'],
 [/^Watch your step, Tom/,'[calm heads-up, then sheepish, it has been on the list a while]'],
 [/^Take some for the road/,'[generous, then a conspiratorial whisper]'],
 [/^It's store-bought\.$/,'[flat confession, a little guilty]'],
 [/^Every conference night\. Twelve years/,'[tired teacher, counting the years, dry on Gary]'],
 [/^Heading out\? I can come/,'[easygoing, eager, goofy proud dad, deadpan on the strong opinion]'],
 [/^Great\. Let me grab my jacket/,'[warm, cheerful, a little distracted, firm on the ladder]'],
 [/^No problem\. The hallway light/,'[easygoing, dry, a little rueful, it has been June for a while]'],
 [/^Somebody has to tag out/,'[relaxed, amused, no hard feelings]']
];
const cue=t=>{ for(const [re,c] of DLG) if(re.test(t)) return c; return '[easygoing, warm, a little distracted]'; };

const LINES_={justin:{}},SCRIPTS={},dlg={},lk=(k,t)=>'justin|'+k+'|'+t;
const seen=new Set(); let nb=0,nd=0;
for(const k in L.justin) for(const t of L.justin[k]){ if(seen.has(t)) continue; seen.add(t);
  (LINES_.justin[k]=LINES_.justin[k]||[]).push(t); SCRIPTS[lk(k,t)]=noAcc(bakeScripts['battle|'+t]||('[easygoing dad] '+t)); nb++; }
// dialogue: every justin clip in the chapter files, plus the recruit talk from the bake list
const dl=[], dseen=new Set();
for(const f of fs.readdirSync(R+'data/voice')){ const m=/^dialog-ch(\d+)\.js$/.exec(f); if(!m) continue;
  global.DIALOG_CLIPS={clips:{},voices:{}}; eval(strip(fs.readFileSync(R+'data/voice/'+f,'utf8')));
  for(const key of Object.keys(DIALOG_CLIPS.clips)) if(key.startsWith('justin|')&&!dseen.has(key)){ dseen.add(key); dl.push({chapter:+m[1]<=20?+m[1]:1,text:key.slice(7)}); } }
for(const it of JSON.parse(fs.readFileSync(R+'tools/bake-page/pending.json','utf8'))) if(it.voice==='justin'&&it.kind==='dialog'&&!dseen.has('justin|'+it.text)){ dseen.add('justin|'+it.text); dl.push({chapter:1,text:it.text}); }
for(const d of dl){ const k='dlg-ch'+d.chapter; (LINES_.justin[k]=LINES_.justin[k]||[]).push(d.text);
  SCRIPTS[lk(k,d.text)]=cue(d.text)+' '+d.text; dlg[lk(k,d.text)]={chapter:d.chapter,speaker:/Halverson|staff room|conference night|Gary|store-bought/i.test(d.text)?'Mr. Halverson':'Justin'}; nd++; }

const CFG={justin:{
  accent:'thick New York accent, Long Island, dropped Rs, long aw vowels',
  direction:'deep relaxed voice',
  stability:0.5, similarity:0.85,
  old_id:'', old_name:OLD.name||'AoT Justin (Long Island)',   // old_id blank on purpose: Kenji shares the old voice, never delete it
  desc:'A man in his early forties with a deep, relaxed, slightly gravelly chest voice and a thick, unmistakable Long Island New York accent, the kind you hear in Nassau County: dropped Rs (fathah, togethah), long drawn-out aw vowels (cawfee, tawk, dawg, cawl), a little nasal, fast and casual. Definitely not Southern, not country, not Midwestern, no twang at all. An electrician and goofy proud dad who yells at the TV during the game, easygoing and warm, quick to laugh at himself, dry when he complains. Clean studio recording.',
  sample:'Hold this. No, the other end. Don\'t touch the copper. Amy says I never sit down. I sat down once. It was a playoff game. We lost. Are you kidding me with that call? Grace, Rose, come here. Who\'s Daddy\'s favorite? Both. Correct. Go get \'em.',
  dlg}};

let t=fs.readFileSync(__dirname+'/template.html','utf8');
const sub=(a,b)=>{ if(!t.includes(a)) throw new Error('template changed, missing: '+a.slice(0,50)); t=t.split(a).join(b); };
sub('<title>Deedee and Aunt Ellie Recast</title>','<title>Justin Recast</title>');
sub('<span>Deedee and Aunt Ellie Recast</span>','<span>Justin Recast</span>');
sub("const NAMES={deedee:'Deedee',ellie:'Aunt Ellie'};","const NAMES={justin:'Justin'};");
sub("const ORDER=['deedee','ellie'];","const ORDER=['justin'];");
sub("'aot-deedee-ellie-v1'","'aot-justin-recast-v1'"); sub("char:'deedee'","char:'justin'");
sub("indexedDB.open('aot-deedee-ellie',1)","indexedDB.open('aot-justin-recast',1)"); sub("S.char='deedee'","S.char='justin'");
const how=/<p style="margin-top:0"><b>1\.<\/b>[\s\S]*?<\/p>\s*<p><b>Directions<\/b>/;
if(!how.test(t)) throw new Error('how-to not found');
t=t.replace(how,()=>'<p style="margin-top:0"><b>Why:</b> Justin has no New York accent and his voice is too light. This page designs a deeper Long Island voice and re-records every line with its own direction.</p><p><b>1.</b> Paste your API key. <b>2.</b> Press <b>Design 3 options</b>, play all three, press <b>Use this voice</b> on the one with the thickest accent (none right? press it again for 3 more, or edit the description first). <b>3.</b> Press <b>Bake all</b> and keep the screen on. <b>4.</b> Play through, re-take any line, then <b>Export</b> and send me the file.</p><p><b>Directions</b>');
sub('saving a new voice removes the old Deedee or Ellie voice for you','the old Justin voice is kept (Kenji uses it too)');

// ---- lives in the game: ADMIN > RECAST JUSTIN opens recast-justin.html inside the app (phone), so share the key with the
// bake page and the Voice Library, share the export through the phone's share sheet, and give it a way back to the game.
sub("try{$('key').value=localStorage.getItem('aot-baker-key')||'';}catch(e){}","try{$('key').value=localStorage.getItem('aot-el-key')||localStorage.getItem('aot-baker-key')||'';}catch(e){}");
sub("$('key').addEventListener('input',()=>{try{localStorage.setItem('aot-baker-key',$('key').value.trim());}catch(e){}});","$('key').addEventListener('input',()=>{try{localStorage.setItem('aot-el-key',$('key').value.trim());}catch(e){}});");
sub("const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='recast.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);",
    "(async()=>{ try{ const file=new File([blob],'recast.json',{type:'application/json'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'Justin recast'}); return; } }catch(e){} const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='recast.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000); })();");
sub('<h1>Adventures of Tom <span>Justin Recast</span></h1>','<a class="btn" href="index.html" style="text-decoration:none">&#8249; Game</a><h1>Adventures of Tom <span>Justin Recast</span></h1>');
sub(' Search the library above, or paste a voice ID below.',' Press Design 3 options above, or paste a voice ID below.');
const J=v=>JSON.stringify(v).replace(/<\/script/gi,'<\\/script');
const put=(k,v)=>{ if(!t.includes(k)) throw new Error('missing '+k); t=t.split(k).join(v); };
put('/*__LINES__*/',J(LINES_)); put('/*__SCRIPTS__*/',J(SCRIPTS)); put('/*__CFG__*/',J(CFG)); put('/*__BUILT__*/',new Date().toISOString().slice(0,10));
fs.writeFileSync(OUT,t);
const plain=Object.values(SCRIPTS).filter(s=>/^\[(easygoing dad|natural)/.test(s)).length;
console.log('ok',(t.length/1e3).toFixed(0)+'KB','battle',nb,'dialogue',nd,'plain directions left',plain);
