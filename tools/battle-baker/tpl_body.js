const BUILT=DATA.built;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const QS=new URLSearchParams(location.search);
// Where the CURRENT game clips are read from (the live repo, always the newest main). ?base=URL/ overrides it for tests.
const BASE=(QS.get('base')||'https://raw.githubusercontent.com/trivituso81/adventures-of-tom/main/').replace(/\/?$/,'/');
const CHARS=DATA.chars, CH=Object.fromEntries(CHARS.map(c=>[c.id,c]));
const ITEMS=[]; for(const c of CHARS) for(const it of c.items) ITEMS.push(Object.assign({},it,{ch:c.id}));
const BYID=new Map(ITEMS.map(i=>[i.id,i]));
const ofChar=ch=>ITEMS.filter(i=>i.ch===ch);
const TAG_CHIPS=['[excited]','[shouting]','[whispers]','[sighs]','[laughs]','[giggles]','[exasperated]','[deadpan]','[playful]','[proud]','[warm]','[grumbling]','[slowly]','[rushed]','[beat]'];
const STORE='aot-bvb-v1';
let S={tab:CHARS[0].id,filter:'all',kind:'all',search:'',limit:60,scripts:{},prompts:{},durs:{},voice:{}};
try{const s=JSON.parse(localStorage.getItem(STORE)||'null'); if(s) S=Object.assign(S,s);}catch(e){}
if(!CH[S.tab]) S.tab=CHARS[0].id;
function saveState(){try{localStorage.setItem(STORE,JSON.stringify(S));}catch(e){}}
try{$('key').value=localStorage.getItem('aot-baker-key')||'';}catch(e){}
$('key').addEventListener('input',()=>{try{localStorage.setItem('aot-baker-key',$('key').value.trim());}catch(e){}});
const apiKey=()=>$('key').value.trim();
const need=()=>{ if(!apiKey()) throw new Error('Paste your ElevenLabs API key at the top first.'); };

// ---------- per-line helpers ----------
const scriptFor=it=>S.scripts[it.id]!=null?S.scripts[it.id]:it.script;
const promptFor=it=>S.prompts[it.id]!=null?S.prompts[it.id]:it.prompt;
const durFor=it=>S.durs[it.id]!=null?S.durs[it.id]:it.dur;
const vcfg=ch=>Object.assign({},CH[ch].voice,S.voice[ch]||{});
// What ElevenLabs actually reads: the script, with the character's voice direction and accent in the first bracket (never twice).
function finalText(it){
  const c=CH[it.ch], v=vcfg(it.ch), d=(v.direction||'').trim().replace(/^\[|\]$/g,'');
  const sc=scriptFor(it).trim().replace(/’/g,"'"), m=sc.match(/^\[([^\]]*)\]/), have=m?m[1]:'';
  const parts=[]; if(d&&!have.toLowerCase().includes(d.toLowerCase())) parts.push(d); if(c.accent&&!/accent/i.test(have)) parts.push(c.accent);
  if(!parts.length) return sc;
  if(m) return '['+parts.concat(have.trim()?[have.trim()]:[]).join(', ')+']'+sc.slice(m[0].length);
  return '['+parts.join(', ')+'] '+sc;
}
// A take far longer than the words need usually means the voice looped. Same calibration as the Deedee rebake.
function expectedSec(text){ const w=text.replace(/\[[^\]]*\]/g,' ').split(/\s+/).filter(Boolean).length, s=(text.match(/[.!?]+/g)||[]).length||1; return 0.42*w+0.2*s; }
const tooLong=(sec,text)=>sec>expectedSec(text)*1.45+0.8;

// ---------- current game clips (read from the live repo, one character at a time) ----------
const CUR={};
function parseCur(ch,txt){
  const m=/VOICE_CLIPS(\.clips\.\w+)?\s*=\s*/.exec(txt); if(!m) throw new Error('Not a voice clips file.');
  const o=JSON.parse(txt.slice(m.index+m[0].length,txt.lastIndexOf('}')+1));
  const clips=ch==='nara'?((o.clips||{}).nara||{}):o, by=new Map(); let n=0;
  for(const k in clips) for(const c of clips[k]) if(c&&c.text&&c.mp3){ by.set(c.text,c.mp3); n++; }
  CUR[ch]={state:'ok',by,n};
}
async function loadCur(ch,force){
  if(CUR[ch]&&(CUR[ch].state==='loading'||(CUR[ch].state==='ok'&&!force))) return;
  CUR[ch]={state:'loading'}; paintStatus();
  try{
    const r=await fetch(BASE+(ch==='nara'?'data/voice-clips.js':'data/voice/'+ch+'.js'),{cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status); parseCur(ch,await r.text());
  }catch(e){ CUR[ch]={state:'err',err:e.message||String(e)}; }
  const y=window.scrollY; render(); window.scrollTo(0,y);
}
const curMp3=it=>{ const c=CUR[it.ch]; return c&&c.state==='ok'?c.by.get(it.text):null; };
function statusHtml(ch){
  const c=CUR[ch]||{state:'idle'};
  if(c.state==='loading') return '<span class="busy">Loading the voices that are in the game now...</span>';
  if(c.state==='ok') return '<span class="hint">Current game voices loaded ('+c.n+' clips).</span>';
  if(c.state==='err') return '<span class="err">Could not load the current clips ('+esc(c.err)+').</span> <button class="btn small" data-act="retrycur">Try again</button> <label class="btn small" style="display:inline-block">Or pick the file <input type="file" accept=".js" data-act="curfile" style="display:none"></label><span class="hint"> (the game\'s data/voice folder, file '+(ch==='nara'?'voice-clips.js':ch+'.js')+')</span>';
  return '';
}
function paintStatus(){ const el=$('curstat'); if(el) el.innerHTML=statusHtml(S.tab); }

// ---------- takes (kept in this browser, survive a reload) ----------
let db=null; const TAKES=new Map();
function openDB(){return new Promise(res=>{try{const r=indexedDB.open('aot-bvb',1);r.onupgradeneeded=()=>r.result.createObjectStore('takes',{keyPath:'id'});r.onsuccess=()=>{db=r.result;res();};r.onerror=()=>res();}catch(e){res();}});}
const dbPut=t=>{try{if(db) db.transaction('takes','readwrite').objectStore('takes').put(t);}catch(e){}};
const dbDel=id=>{try{if(db) db.transaction('takes','readwrite').objectStore('takes').delete(id);}catch(e){}};
const dbAll=()=>new Promise(res=>{if(!db) return res([]);try{const r=db.transaction('takes').objectStore('takes').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([]);}catch(e){res([]);}});
const takesFor=id=>[...TAKES.values()].filter(t=>t.item===id).sort((a,b)=>a.t-b.t);
const keptTake=it=>takesFor(it.id).find(t=>t.keep);
const keptCount=ch=>[...TAKES.values()].filter(t=>t.keep&&BYID.has(t.item)&&(!ch||BYID.get(t.item).ch===ch)).length;

// ---------- audio ----------
let playing=null;
function stopPlay(){if(playing){playing.a.pause();playing.btn&&playing.btn.classList.remove('on');playing=null;}}
function playSrc(src,btn){const same=playing&&playing.btn===btn;stopPlay();if(same)return;const a=new Audio(src);playing={a,btn};btn&&btn.classList.add('on');a.onended=()=>{if(playing&&playing.a===a){btn&&btn.classList.remove('on');playing=null;}};a.play().catch(()=>{});}
const mp3Src=b=>'data:audio/mpeg;base64,'+b;
function b64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
const mp3Sec=b=>Math.round(b.length*0.75*8/128000*10)/10;   // 128 kbps from ElevenLabs
async function apiErr(r){let t='';try{t=await r.text();const j=JSON.parse(t);const d=j.detail;if(d&&typeof d==='object'&&!Array.isArray(d))t=d.message||d.status||JSON.stringify(d);else if(Array.isArray(d))t=d.map(x=>x.msg).join('; ');else if(d)t=String(d);}catch(e){} return new Error('ElevenLabs '+r.status+': '+String(t).slice(0,240));}
const retry=async(fn,tries=4)=>{for(let k=0;;k++){try{return await fn();}catch(e){const m=e&&e.message||String(e);if(k<tries-1&&/ 429| 409|too many|concurrent|in progress/i.test(m)){await new Promise(r=>setTimeout(r,window.__FAST?5:2500*(k+1)));continue;}throw e;}}};
async function tts(v,text){
  need(); if(!v.voice_id) throw new Error('This voice has no ID. Open Voice settings and paste one.');
  const url='https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(v.voice_id)+'?output_format=mp3_44100_128';
  const body={text,model_id:v.model||'eleven_v4',voice_settings:{stability:+v.stability,similarity_boost:+v.similarity},seed:Math.floor(Math.random()*4294967295)};
  const send=()=>fetch(url,{method:'POST',headers:{'xi-api-key':apiKey(),'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)});
  let r=await send();
  if(!r.ok&&(r.status===400||r.status===422)){ const e=await apiErr(r); if(/seed/i.test(e.message)){ delete body.seed; r=await send(); } else throw e; }
  if(!r.ok) throw await apiErr(r);
  return b64(await r.arrayBuffer());
}
async function sfx(c,prompt,dur){
  need();
  const body={text:prompt,duration_seconds:Math.min(30,Math.max(0.5,+dur||2)),prompt_influence:c.influence!=null?c.influence:0.5,model_id:c.sfxModel||'eleven_text_to_sound_v2'};
  const r=await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':apiKey(),'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)});
  if(!r.ok) throw await apiErr(r);
  return b64(await r.arrayBuffer());
}

// ---------- screen ----------
const busy={},errs={};
const sentHtml=it=>CH[it.ch].sfx?'':'Sent: '+esc(finalText(it)).replace(/\[([^\]]*)\]/g,'<b>[$1]</b>');
const SRCTXT={baked:'script from the last bake',hand:'hand-written direction',auto:'automatic direction'};
function filtered(){
  const q=S.search.trim().toLowerCase();
  return ofChar(S.tab).filter(it=>{
    if(S.filter==='kept'&&!keptTake(it)) return false;
    if(S.filter==='noclip'&&it.has) return false;
    if(S.kind!=='all'&&!it.kinds.includes(S.kind)) return false;
    if(q&&!(it.text+' '+it.kinds.join(' ')).toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderTabs(){
  $('tabs').innerHTML=CHARS.map(c=>{const k=keptCount(c.id);return '<div class="tab'+(S.tab===c.id?' on':'')+'" data-tab="'+c.id+'">'+esc(c.name)+(k?'<span class="c">'+k+' to save</span>':'')+'</div>';}).join('');
  const k=keptCount(); $('progress').innerHTML=k?'<b>'+k+'</b> line'+(k===1?'':'s')+' ready to save':'Nothing chosen yet';
  $('save').textContent=k?'Save '+k+' changed line'+(k===1?'':'s'):'Save changes';
}
function render(){
  renderTabs();
  const c=CH[S.tab], all=ofChar(S.tab), v=vcfg(S.tab);
  const nk=all.filter(keptTake).length, nn=all.filter(i=>!i.has).length;
  let h='<div class="win panel"><h2>'+esc(c.name)+' battle voice</h2><div class="note">';
  h+='Press <b>Current</b> to hear the clip that is in the game now. Press <b>Make a new take</b> to try another one; you can edit the direction first. Tick <b>Use this one</b> on any take you like. <b>Save</b> writes only the lines you ticked, nothing else changes.';
  if(c.id==='boppy') h+=' New Boppy takes are pitched down two semitones when they are merged into the game (his standing rule), so they sound a little higher here.';
  if(c.id==='deedee') h+=' If a take is much longer than the words need, it is flagged: Deedee sometimes repeats a phrase. Listen before you tick it.';
  h+='</div><div id="curstat" class="row" style="margin-top:6px">'+statusHtml(S.tab)+'</div>';
  if(c.sfx){
    h+='<details style="margin-top:8px"><summary>Sound settings</summary><div class="vgrid"><div class="field"><label>How closely to follow the prompt (0 to 1)</label><input type="number" step="0.1" min="0" max="1" data-act="influence" value="'+esc(c.influence)+'"></div></div></details>';
  } else {
    h+='<details style="margin-top:8px"><summary>Voice settings (used for every new take here)</summary><div class="vgrid">';
    h+='<div class="field"><label>Voice ID</label><input type="text" data-act="vid" value="'+esc(v.voice_id)+'"></div>';
    h+='<div class="field"><label>Voice name</label><input type="text" data-act="vname" value="'+esc(v.name)+'"></div>';
    h+='<div class="field"><label>Stability (0 creative, 1 steady)</label><input type="number" step="0.05" min="0" max="1" data-act="vstab" value="'+esc(v.stability)+'"></div>';
    h+='<div class="field"><label>Similarity (0 to 1)</label><input type="number" step="0.05" min="0" max="1" data-act="vsim" value="'+esc(v.similarity)+'"></div>';
    h+='<div class="field" style="grid-column:1/-1"><label>Voice direction added to every script</label><input type="text" data-act="vdir" value="'+esc(v.direction)+'"></div>';
    h+='</div><div class="hint">Changing the voice ID changes how every new take for '+esc(c.name)+' sounds, so old and new takes will not match. Leave it unless you mean it.</div></details>';
  }
  h+='<div class="row" style="margin-top:10px"><div class="seg" id="filter">'+[['all','All lines ('+all.length+')'],['kept','Chosen to save ('+nk+')'],['noclip','No clip yet ('+nn+')']].map(o=>'<button data-f="'+o[0]+'"'+(S.filter===o[0]?' class="on"':'')+'>'+o[1]+'</button>').join('')+'</div>';
  const kinds=[...new Set(all.flatMap(i=>i.kinds))];
  h+='<select id="ksel"><option value="all">Every move</option>'+kinds.map(k=>'<option value="'+esc(k)+'"'+(S.kind===k?' selected':'')+'>'+esc(k)+'</option>').join('')+'</select>';
  h+='<input type="text" id="search" placeholder="Search" value="'+esc(S.search)+'" style="min-width:150px"><div class="grow"></div><button class="btn" id="genAll">'+(BULK?'Stop':'Make a take for every line shown')+'</button><span id="bulkMsg" class="busy">'+esc(BULKMSG)+'</span></div><div id="bulkErr"></div></div>';
  const L=filtered(), shown=L.slice(0,S.limit);
  h+='<div id="list">'; if(!L.length) h+='<div class="win empty">Nothing here. Pick another filter.</div>';
  let last=''; for(const it of shown){ const g=it.kinds[0]; if(g!==last){h+='<div class="kindhead">'+esc(g)+'</div>';last=g;} h+=cardHtml(it); }
  if(L.length>shown.length) h+='<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" id="more">Show '+Math.min(60,L.length-shown.length)+' more ('+(L.length-shown.length)+' hidden)</button></div>';
  $('wrap').innerHTML=h+'</div>';
}
function cardHtml(it){
  const takes=takesFor(it.id), kept=takes.some(t=>t.keep), k=esc(it.id), c=CH[it.ch], mp=curMp3(it), cs=(CUR[it.ch]||{}).state;
  let h='<div class="win card'+(kept?' keptcard':'')+'" data-id="'+k+'"><div class="top"><span class="game">'+esc(it.text)+'</span>';
  if(!it.has) h+='<span class="tag none">no clip yet</span>';
  h+='<span class="tag src">'+esc(c.sfx?(it.src==='baked'?'sound prompt from the last bake':'new sound prompt'):SRCTXT[it.src])+'</span>';
  if(it.kinds.length>1) h+='<span class="tag src">also used for '+esc(it.kinds.slice(1).join(', '))+'</span>';
  if(kept) h+='<span class="tag kept">will be saved</span>'; h+='</div>';
  h+='<div class="row"><span class="cur"><button class="play" data-act="cur" data-id="'+k+'"'+(mp?'':' disabled')+' title="Play the clip in the game now">&#9654;</button><span class="lbl hint">'+(mp?'Current':(cs==='loading'?'Loading...':(it.has?'Current (not loaded)':'No current clip')))+'</span></span></div>';
  if(c.sfx){
    h+='<div class="row"><div class="field grow" style="margin:0"><label>Sound prompt (what ElevenLabs makes)</label><textarea data-act="prompt" data-id="'+k+'" rows="2">'+esc(promptFor(it))+'</textarea></div><div class="field" style="margin:0;width:90px"><label>Seconds</label><input type="number" step="0.1" min="0.5" max="30" data-act="dur" data-id="'+k+'" value="'+esc(durFor(it))+'"></div></div>';
  } else {
    h+='<div><div class="hint">Direction and script (what ElevenLabs reads)</div><textarea data-act="script" data-id="'+k+'" rows="2">'+esc(scriptFor(it))+'</textarea></div>';
    h+='<div class="chips">'+TAG_CHIPS.map(t=>'<span class="chip" data-act="chip" data-id="'+k+'" data-t="'+esc(t)+'">'+esc(t)+'</span>').join('')+'<span class="chip" data-act="reset" data-id="'+k+'">reset to original</span></div>';
    h+='<div class="sent" data-sent="'+k+'">'+sentHtml(it)+'</div>';
  }
  h+='<div class="row"><button class="btn" data-act="gen" data-id="'+k+'"'+(busy[it.id]?' disabled':'')+'>'+(takes.length?'Make another take':'Make a new take')+'</button>';
  if(busy[it.id]) h+='<span class="busy">'+esc(busy[it.id])+'</span>';
  if(errs[it.id]) h+='<span class="err">'+esc(errs[it.id].message)+'</span>';
  return h+'</div>'+takesHtml(takes,it)+'</div>';
}
function takesHtml(takes,it){
  if(!takes.length) return '';
  return '<div class="takes">'+takes.map((t,i)=>'<div class="take'+(t.keep?' keep':'')+'"><button class="play" data-act="play" data-tid="'+t.id+'">&#9654;</button><label class="row" style="gap:4px"><input type="checkbox" data-act="keep" data-tid="'+t.id+'"'+(t.keep?' checked':'')+'><span class="lbl">Use this one'+(t.dur?' ('+t.dur+' s)':'')+'</span></label>'+(t.dur&&!CH[it.ch].sfx&&tooLong(t.dur,it.text)?'<span class="tag warn" title="Much longer than the words need. It may repeat.">long</span>':'')+'<button class="x" data-act="del" data-tid="'+t.id+'" title="Delete take">&#10005;</button></div>').join('')+'</div>';
}
function refreshCard(id){ const it=BYID.get(id), el=document.querySelector('.card[data-id="'+CSS.escape(id)+'"]'); if(it&&el){ const d=document.createElement('div'); d.innerHTML=cardHtml(it); el.replaceWith(d.firstChild); } renderTabs(); }
function updateSent(it){ const el=document.querySelector('[data-sent="'+CSS.escape(it.id)+'"]'); if(el) el.innerHTML=sentHtml(it); }

// ---------- making takes ----------
async function generate(it){
  if(busy[it.id]) return false;
  delete errs[it.id]; busy[it.id]='Making a take...'; refreshCard(it.id);
  let ok=false;
  try{
    const c=CH[it.ch]; let mp3,sent,extra={};
    if(c.sfx){ const p=promptFor(it), d=durFor(it); mp3=await retry(()=>sfx(c,p,d)); sent=p; extra={prompt:p,dur_req:+d}; }
    else { const v=vcfg(it.ch); sent=finalText(it); mp3=await retry(()=>tts(v,sent)); extra={model:v.model||'eleven_v4',voice_id:v.voice_id}; }
    const t=Object.assign({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),item:it.id,mp3,keep:false,sent,t:Date.now(),dur:mp3Sec(mp3)},extra);
    TAKES.set(t.id,t); dbPut(t); ok=true;
  }catch(e){ errs[it.id]={message:e.message||String(e)}; }
  delete busy[it.id]; refreshCard(it.id); return ok;
}
let BULK=null, BULKMSG='';
async function genAll(){
  if(BULK){ BULK.stop=true; return; }
  if(!apiKey()){ alert('Paste your ElevenLabs API key at the top first.'); return; }
  const L=filtered().filter(i=>!takesFor(i.id).length);
  if(!L.length){ alert('Every line shown already has a take.'); return; }
  const chars=L.reduce((n,l)=>n+(CH[l.ch].sfx?0:finalText(l).length),0);
  if(!confirm('Make one take for '+L.length+' lines'+(chars?' (about '+chars.toLocaleString()+' characters of ElevenLabs credit)':'')+'? Nothing is saved until you tick the ones you like.')) return;
  BULK={stop:false}; render();
  let i=0,done=0,fail=0,firstErr='';
  const setMsg=s=>{ BULKMSG=s; const el=$('bulkMsg'); if(el) el.textContent=s; };
  const step=()=>setMsg(done+' of '+L.length+' made'+(fail?' · '+fail+' failed':''));
  step();
  const worker=async()=>{ while(!BULK.stop&&i<L.length){ const l=L[i++]; if(await generate(l)) done++; else { fail++; if(!firstErr) firstErr=(errs[l.id]||{}).message||''; } step(); } };
  await Promise.all(Array.from({length:3},worker));
  const stopped=BULK.stop; BULK=null; BULKMSG=done+' of '+L.length+' made'+(stopped?' · stopped':' · finished. Listen, then tick the ones you like.'); render();
  if(firstErr){ const hint=/Failed to fetch|NetworkError|Load failed/i.test(firstErr)?' The page could not reach ElevenLabs: open this file in Chrome or Safari on your computer, not in a preview.':/ 401|invalid_api_key/i.test(firstErr)?' The API key was not accepted: paste it again at the top.':/quota|credits|insufficient/i.test(firstErr)?' The ElevenLabs account is out of credits. Takes already made are kept.':/ 403|permission/i.test(firstErr)?' The API key lacks permission for this. Edit the key in ElevenLabs and allow Text to Speech and Sound Effects.':''; $('bulkErr').innerHTML='<div class="err" style="margin-top:6px"><b>Why some failed:</b>'+esc(hint)+' ElevenLabs said: '+esc(firstErr)+'</div>'; }
}

// ---------- events ----------
document.addEventListener('click',e=>{
  const tb=e.target.closest('.tab'); if(tb){ S.tab=tb.dataset.tab; S.filter='all'; S.kind='all'; S.search=''; S.limit=60; saveState(); render(); loadCur(S.tab); window.scrollTo(0,0); return; }
  const f=e.target.closest('#filter button'); if(f){ S.filter=f.dataset.f; S.limit=60; saveState(); render(); return; }
  if(e.target.id==='more'){ S.limit+=60; render(); return; }
  if(e.target.id==='genAll'){ genAll(); return; }
  if(e.target.id==='save'){ save(); return; }
  const b=e.target.closest('[data-act]'); if(!b) return;
  const act=b.dataset.act, it=b.dataset.id&&BYID.get(b.dataset.id), tk=b.dataset.tid&&TAKES.get(b.dataset.tid);
  if(act==='retrycur'){ loadCur(S.tab,true); return; }
  if(act==='cur'&&it){ const m=curMp3(it); if(m) playSrc(mp3Src(m),b); }
  else if(act==='gen'&&it) generate(it);
  else if(act==='play'&&tk) playSrc(mp3Src(tk.mp3),b);
  else if(act==='del'&&tk){ TAKES.delete(tk.id); dbDel(tk.id); refreshCard(tk.item); }
  else if(act==='chip'&&it){ const ta=document.querySelector('textarea[data-act="script"][data-id="'+CSS.escape(it.id)+'"]'); const t=b.dataset.t,s=ta.value; const m=s.match(/^\[([^\]]*)\]\s*/); const v=m?'['+m[1]+', '+t.slice(1,-1)+'] '+s.slice(m[0].length):t+' '+s; ta.value=v; S.scripts[it.id]=v; saveState(); updateSent(it); }
  else if(act==='reset'&&it){ delete S.scripts[it.id]; saveState(); refreshCard(it.id); }
});
document.addEventListener('change',async e=>{
  const t=e.target, a=t.dataset.act;
  if(a==='keep'){ const tk=TAKES.get(t.dataset.tid); if(!tk) return; if(t.checked) for(const x of takesFor(tk.item)) if(x.keep&&x.id!==tk.id){x.keep=false;dbPut(x);} tk.keep=t.checked; dbPut(tk); refreshCard(tk.item); }
  else if(a==='curfile'){ const f=t.files&&t.files[0]; if(!f) return; try{ parseCur(S.tab,await f.text()); }catch(err){ CUR[S.tab]={state:'err',err:err.message}; } render(); }
  else if(t.id==='ksel'){ S.kind=t.value; S.limit=60; saveState(); render(); }
});
document.addEventListener('input',e=>{
  const t=e.target, a=t.dataset.act, it=t.dataset.id&&BYID.get(t.dataset.id);
  if(t.id==='search'){ S.search=t.value; S.limit=60; saveState(); clearTimeout(window.__st); window.__st=setTimeout(()=>{ const pos=t.selectionStart; render(); const n=$('search'); if(n){ n.focus(); try{n.setSelectionRange(pos,pos);}catch(e){} } },250); return; }
  if(a==='script'&&it){ S.scripts[it.id]=t.value; saveState(); updateSent(it); }
  else if(a==='prompt'&&it){ S.prompts[it.id]=t.value; saveState(); }
  else if(a==='dur'&&it){ S.durs[it.id]=t.value; saveState(); }
  else if(a==='influence'){ CH[S.tab].influence=+t.value; }
  else if(['vid','vname','vstab','vsim','vdir'].includes(a)){ const key={vid:'voice_id',vname:'name',vstab:'stability',vsim:'similarity',vdir:'direction'}[a]; (S.voice[S.tab]=S.voice[S.tab]||{})[key]=t.value; saveState(); }
});

// ---------- save: only the lines you ticked ----------
function download(name,obj){ const blob=new Blob([JSON.stringify(obj)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function buildExport(){
  const kept=[...TAKES.values()].filter(t=>t.keep&&BYID.has(t.item));
  const clips={}, voices={};
  for(const t of kept){
    const it=BYID.get(t.item), ch=it.ch, c=CH[ch];
    if(!voices[ch]){
      voices[ch]=JSON.parse(JSON.stringify(DATA.voicesLive[ch]||{}));                      // everything already saved stays
      if(!c.sfx){ const v=vcfg(ch); voices[ch].voice_id=v.voice_id; voices[ch].name=v.name; voices[ch].model=v.model||'eleven_v4'; voices[ch].settings={stability:+v.stability,similarity_boost:+v.similarity}; voices[ch].direction=v.direction; }
      else voices[ch].prompt_influence=c.influence;
    }
    const entry={text:it.text,mp3:t.mp3}; if(!c.sfx) entry.model=t.model||'eleven_v4';
    ((clips[ch]=clips[ch]||{})[it.kind]=clips[ch][it.kind]||[]).push(entry);
    if(c.sfx) (voices[ch].prompts=voices[ch].prompts||{})[it.kind+'|'+it.text]={p:t.prompt,d:t.dur_req};
    else (voices[ch].scripts=voices[ch].scripts||{})[it.kind+'|'+it.text]=t.sent;
  }
  return {kept:kept.length,out:{built:BUILT,source:'battle-voice-baker',clips,voices}};
}
function save(){
  const r=buildExport();
  if(!r.kept){ alert('Nothing chosen yet. Make a take, then tick "Use this one" on the ones you like.'); return; }
  download('voices.json',r.out);
}

openDB().then(dbAll).then(all=>{ for(const t of all) TAKES.set(t.id,t); render(); loadCur(S.tab); });
window.__BVB={S,ITEMS,TAKES,CUR,generate,genAll,render,buildExport,finalText,loadCur};
</script>
</body>
</html>
