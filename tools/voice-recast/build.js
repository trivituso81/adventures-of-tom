// node tools/voice-recast/build.js <out.html>
// Builds the Deedee and Aunt Ellie Recast Baker from the live repo (run from the repo root).
// Lines: every battle line in data/lines.js for Deedee, plus the dialogue lines in dialogue-lines.json (the lines either character
// speaks in the current game text). Briefs and directions are below: edit them HERE, then rebuild.
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..')+'/', OUT=process.argv[2]||'deedee-ellie-recast.html';
const strip=s=>s.replace(/^\s*['"]use strict['"];/,'');
eval(strip(fs.readFileSync(R+'data/lines.js','utf8'))+';global.L=LINES;');
const DL=JSON.parse(fs.readFileSync(__dirname+'/dialogue-lines.json','utf8'));
global.DIALOG_CLIPS={clips:{},voices:{}};
eval(strip(fs.readFileSync(R+'data/dialog-cast.js','utf8'))+';global.CAST=DIALOG_CAST');
eval(strip(fs.readFileSync(R+'data/voice-clips.js','utf8'))+';global.VC=VOICE_CLIPS');
for(const f of fs.readdirSync(R+'data/voice')) if(/^dialog-ch\d+\.js$/.test(f)) eval(strip(fs.readFileSync(R+'data/voice/'+f,'utf8')));

const CFG={
  deedee:{
    accent:'warm Long Island accent',
    direction:'smiling, affectionate, bright and youthful, never stern',
    stability:0.5, similarity:0.85,
    old_id:VC.voices.deedee.voice_id, old_name:VC.voices.deedee.name,
    desc:'A woman in her seventies who sounds about fifty-five. A warm, bright, smiling voice with a rich, sunny tone: soft, affectionate and full of laughter, never raspy, breathy, thin or wobbly. A friendly Long Island New York accent. A retired nurse and doting grandma who hugs first and gives orders second: loving, cheerful, gently teasing, a little goofy. Clean studio recording.',
    sample:'There is my Tommy! Come here, come here, let me look at you. The rhubarb crisp is cooling on the counter and the floors are just mopped, so shoes off, honey. Grace, Rose, Deedee loves you to the moon and back. Say it back to me. Louder!'
  },
  ellie:{
    accent:'thick old Long Island accent',
    direction:'dry, grand, unimpressed',
    stability:0.5, similarity:0.85,
    old_id:DIALOG_CLIPS.voices.ellie.voice_id, old_name:DIALOG_CLIPS.voices.ellie.name,
    desc:'A very elderly woman in her nineties with a thick, unmistakable old Long Island New York accent, the kind you hear in Nassau County: dropped Rs, long drawn-out aw vowels (cawfee, tawk, dawter), a little nasal and gravelly, a touch of Brooklyn in the corners. Definitely not British, not mid-Atlantic, not posh, no refined or transatlantic accent at all. A glamorous, sharp-tongued old Long Island dame in gold jewelry and a fur collar: dry, theatrical, unimpressed, slow and deliberate, every line a bon mot. Clean studio recording.',
    sample:'Tom, sit down, I want to talk to you. Your mother put the coffee on, and nobody calls their aunt anymore. I have been to Paris eleven times, darling. Long Island is charming, like a hat you wear once. Never apologize for being early, dressing up, or leaving a bad party.'
  }
};

// ---- directions. Deedee: warm and loving first, firm only with a smile. ----
const DEEDEE_KIND={
  praise:'[coaxing, smiling, warm]',join:'[bright, warm, upbeat]',greet:'[delighted, arms open]',basic:'[fond, playful]',walk:'[cheerful, upbeat power-walker]',
  nurse:'[kind, cheerful nurse]',mop:'[playful, house-proud, laughing]',crisp:'[proud, warm, a little worried for you]',wine:'[cheeky, bright laugh]',dinner:'[calling across the house, warm and joyful]',
  moonshot:'[building, loving, then shouting with joy]',dish_towel_flick:'[playful, teasing, fond]',registered_nut:'[cheerful nurse, caring]',corner_piece:'[warm, conspiratorial, smiling]',
  oven_mitt_ultimatum:'[gentle, amused, a little mock-stern]',brisk_means_brisk:'[encouraging coach, cheerful]',garden_shower:'[gentle, teasing, kind]',wet_floor:'[playful, house-proud, laughing]',
  rise_and_shine:'[bright, sunny morning voice]',beanie_master:'[surprised, delighted]',beanie_master_open:'[proud, grand, announcing like a superhero, laughing]',grandma_squeeze:'[loving, arms wide, delighted]',
  sunday_ult:'[calling across the house, joyful and warm]',moon_ult:'[building, then shouting with joy]',tombo:'[scandalized, delighted gossip]',dc1:'[encouraging, fond, cheerful]',dc2:'[proud, delighted with herself]',
  dc3:'[hostess, happy and flustered, fond]',tombo2:'[gardener, encouraging shout, laughing]',tombo3:'[tasting, then amused and indignant]',ff3:'[tender, sincere, a little teary]',hug:'[warm, arms wide, bright]',moon_back:'[warm, arms wide, bright]',
  hurt:'[startled, then kind and wry]',low:'[winded, laughing at herself, fanning herself]',ko:'[sleepy, gentle, not worried]',win:'[overjoyed, proud, tearing up]',dcff3:'[cheerful, power-walking, teasing]'
};
const DEEDEE_DLG=[ // [regex on the line, direction]; first match wins; default is warm and natural
 [/^There's my Tommy/,'[delighted, arms open]'],[/^And my girls/,'[beaming, gathering them in]'],[/skin and bones/,'[fond, doting] '],[/GOOD tin/,'[outraged about the tin, a little funny]'],
 [/^Up, up/,'[tender, loving nurse]'],[/Good as new/,'[satisfied, smiling]'],[/^Crumbs!/,'[spotting a clue, bright]'],[/^Good job, girls/,'[warm praise]'],[/^Everybody okay/,'[caring, quick nurse check]'],
 [/^Hugs for everyone/,'[warm, loving]'],[/^Oh\. Oh, Tommy/,'[hushed, moved]'],[/FILTHY/,'[appalled, laughing]'],[/^Oh, sweetheart/,'[kind, gentle, understanding]'],
 [/^Fifty-two years/,'[touched, smiling, to the room]'],[/goosebumps/,'[thrilled, giddy]'],[/Nobody has to turn off/,'[kind, reassuring, warm promise]'],[/Dance with your mother/,'[loving, playful, not a request]'],
 [/^Then sway/,'[amused, loving]'],[/Somebody who knew you would come/,'[soft, realizing, touched]'],[/THERE they are/,'[overjoyed, emotional, then funny]'],[/^To the moon and BACK/,'[tender, sincere, to the whole table]'],
 [/I love you all to the moon/,'[tender, loving]'],[/^Back already/,'[delighted, looking him over]'],[/Making a friend/,'[proud, teasing her husband]'],[/sore loser/,'[affectionate teasing]'],
 [/^Tommy! There you are/,'[excited, flustered, bright]'],[/^Did he\.$/,'[knowing, amused]'],[/^Nobody believes/,'[fond, teasing]'],[/pretend not to be/,'[warm, knowing, fond of Ellie]'],
 [/^Honey, show her/,'[gentle, warm]'],[/^Admit three/,'[thrilled, counting it out]'],[/wearing the tie/,'[sweet, gently insistent]'],[/hedge/,'[concerned, then laughing at herself]'],
 [/purple velvet|Purple velvet/,'[recognizing it, hushed, certain]'],[/Ellie\. There was a BALL/,'[bursting to tell her, bright, warm]'],[/envelope/,'[surprised, flustered, laughing at herself]'],
 [/Everybody sit\. Everybody/,'[hostess running the table, fond, fast, laughing]'],[/Rhubarb crisp in the oven/,'[cheerful, running the house with love]'],[/Say it back/,'[loving, then playful, coaxing]'],
 [/bruise/,'[doting, sharp-eyed, teasing]'],[/Nurse's orders/,'[cheeky, warm]'],[/corner/,'[playfully firm, then giving in with a smile]'],[/Sunday dinner is at five/,'[cheerful, house rule, smiling]'],
 [/Shoes OFF/,'[playful, house-proud, not angry]'],[/Boppy says he/,'[dry, fond, a wife\'s report]'],[/frost something/,'[inviting, bright]']
];
const ELLIE_DLG=[
 [/Boppy says his stomach/,'[dry, deadpan, reporting]'],[/Grace, darling/,'[grand, delighted, then a pause for effect]'],[/^Wisdom is/,'[slow, wise, pronouncing]'],[/Never apologize/,'[grand, pronouncing]'],
 [/good heart/,'[stern, fond, looking him over]'],[/good scarf/,'[dry, matter-of-fact]'],[/too much/,'[wry, grand, unbothered]'],[/staying with me/,'[amused, conspiratorial]'],
 [/Moon Club\. I haven't/,'[quiet, distant, wistful]'],[/Was there a ball/,'[curious, imperious, leaning in]'],[/last dance\. I was in a hurry/,'[dry, remembering, wry]'],[/fit me since 1972/,'[grand, generous, dry]'],
 [/Sit\. Tell me about the airport/,'[imperious, commanding, delighted]'],[/winning\. I'm also cheating/,'[smug, amused]'],[/Keep it warm for me/,'[dry, wry, fond]'],[/Stand up straight/,'[approving, dry]'],
 [/rhubarb crisp/,'[dry, amused]'],[/Paris eleven times/,'[grand, languid, deadpan]'],[/Deedee has an aunt/,'[imperious, dry]'],[/everyone else is a little dull/,'[sly, grand]'],
 [/everything\. The last dance/,'[wistful, grand, remembering]'],[/Purple velvet\. I was/,'[offhand, quiet]'],[/Ticket seven\.$/,'[softly, moved, surprised]'],[/^Go\. Dance/,'[grand, generous, warm]'],[/never went back for it/,'[quiet, wistful, dry]']
];
function cueFor(voice,kind,text){
  if(voice==='deedee'){ if(!/^dlg/.test(kind)) return DEEDEE_KIND[kind]||'[warm, natural]'; for(const [re,c] of DEEDEE_DLG) if(re.test(text)) return c.trim(); return '[warm, natural]'; }
  for(const [re,c] of ELLIE_DLG) if(re.test(text)) return c; return '[dry, grand]';
}
const LINES={deedee:{},ellie:{}},SCRIPTS={},dlg={deedee:{},ellie:{}};
const lk=(v,k,t)=>v+'|'+k+'|'+t;
const seen=new Set(); let nb=0,nd=0;
for(const k in L.deedee) for(const t of L.deedee[k]){ if(seen.has(t)) continue; seen.add(t); (LINES.deedee[k]=LINES.deedee[k]||[]).push(t); SCRIPTS[lk('deedee',k,t)]=cueFor('deedee',k,t)+' '+t; nb++; }
const NAME={deedee:'Deedee',ellie:'Aunt Ellie'};
for(const d of DL.slice().sort((a,b)=>a.chapter-b.chapter)){ const k='dlg-ch'+d.chapter; (LINES[d.voice][k]=LINES[d.voice][k]||[]).push(d.text);
  SCRIPTS[lk(d.voice,k,d.text)]=cueFor(d.voice,k,d.text)+' '+d.text; dlg[d.voice][lk(d.voice,k,d.text)]={chapter:d.chapter,speaker:NAME[d.voice]}; nd++; }
for(const v in CFG) CFG[v].dlg=dlg[v];
let t=fs.readFileSync(__dirname+'/template.html','utf8');
const J=v=>JSON.stringify(v).replace(/<\/script/gi,'<\\/script');
const put=(k,v)=>{ if(!t.includes(k)) throw new Error('missing '+k); t=t.split(k).join(v); };
put('/*__LINES__*/',J(LINES)); put('/*__SCRIPTS__*/',J(SCRIPTS)); put('/*__CFG__*/',J(CFG)); put('/*__BUILT__*/',new Date().toISOString().slice(0,10));
fs.writeFileSync(OUT,t);
let chars=0; for(const k in SCRIPTS) chars+=SCRIPTS[k].length;
console.log('ok',(t.length/1e3).toFixed(0)+'KB','battle',nb,'dialogue',nd,'deedee dlg',Object.keys(dlg.deedee).length,'ellie dlg',Object.keys(dlg.ellie).length,'script chars (before accent)',chars);
