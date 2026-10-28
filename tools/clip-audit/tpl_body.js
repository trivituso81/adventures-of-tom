const BUILT=DATA.built;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TAG_CHIPS=['[excited]','[shouting]','[whispers]','[sighs]','[laughs]','[giggles]','[exasperated]','[deadpan]','[playful]','[proud]','[warm]','[grumbling]','[slowly]','[rushed]','[beat]'];
const TABS=[{id:'dialog',name:'Dialogue lines',type:'d'},{id:'battle',name:'Battle lines',type:'b'}];
const ITEMS=[];
for(const x of DATA.dialog) ITEMS.push(Object.assign({},x,{type:'d',id:'d:'+x.key}));
for(const x of DATA.battle) ITEMS.push(Object.assign({},x,{type:'b',id:'b:'+x.key,voice:x.ch,speaker:x.ch==='tnb'?'TNB':x.ch[0].toUpperCase()+x.ch.slice(1),ctx:x.kind}));
const BYID=new Map(ITEMS.map(i=>[i.id,i]));
const ofType=t=>ITEMS.filter(i=>i.type===t);
const STORE='aot-cfix-baker-v1', VSTORE='aot-missing-voices-v2';
let S={tab:'dialog',filter:{b:'todo',d:'todo'},voice:'all',search:'',limit:40,scripts:{},dvoices:{}};
try{const s=JSON.parse(localStorage.getItem(STORE)||'null'); if(s) S=Object.assign(S,s);}catch(e){}
let SHARED={}; try{SHARED=JSON.parse(localStorage.getItem(VSTORE)||'{}')||{};}catch(e){}
S.dvoices=SHARED;
function saveState(){try{localStorage.setItem(STORE,JSON.stringify(Object.assign({},S,{dvoices:{}})));localStorage.setItem(VSTORE,JSON.stringify(SHARED));}catch(e){}}
try{$('key').value=localStorage.getItem('aot-baker-key')||'';}catch(e){}
$('key').addEventListener('input',()=>{try{localStorage.setItem('aot-baker-key',$('key').value.trim());}catch(e){}});
const apiKey=()=>$('key').value.trim();
const need=()=>{ if(!apiKey()) throw new Error('Paste your ElevenLabs API key at the top first.'); };
const FAMILY=['tom','grace','rose','amy','deedee','boppy','tnb'];
const isFam=v=>FAMILY.includes(v);
const vName=v=>DATA.vnames[v]||v;
function dcfg(v){
  if(!S.dvoices[v]){
    if(isFam(v)){ const sv=DATA.fam[v]||{},st=sv.settings||{}; S.dvoices[v]={voice_id:sv.voice_id||'',name:sv.name||'',stability:st.stability!=null?st.stability:0.5,similarity:st.similarity_boost!=null?st.similarity_boost:0.85,direction:sv.direction||''}; }
    else { const c=DATA.castVoices[v]||{},d=DATA.designed[v]||{}; S.dvoices[v]={voice_id:d.voice_id||'',name:d.name||'',stability:c.stability!=null?c.stability:0.5,similarity:0.8,direction:'',desc:c.desc||'',sample:c.sample||''}; }
  }
  if(isFam(v)){ const sv=DATA.fam[v]; if(sv&&sv.voice_id&&S.dvoices[v].voice_id!==sv.voice_id){ S.dvoices[v].voice_id=sv.voice_id; S.dvoices[v].name=sv.name||''; } }
  else { const d=DATA.designed[v]; if(d&&d.voice_id&&!S.dvoices[v].voice_id){ S.dvoices[v].voice_id=d.voice_id; S.dvoices[v].name=d.name||''; } }
  return S.dvoices[v];
}
function bcfg(ch){ const v=DATA.voicesLive[ch]||{},st=v.settings||{}; return {voice_id:v.voice_id||'',stability:st.stability!=null?st.stability:0.5,similarity:st.similarity_boost!=null?st.similarity_boost:0.85,direction:v.direction||''}; }
const cfgOf=it=>it.type==='b'?bcfg(it.ch):dcfg(it.voice);
const scriptFor=it=>S.scripts[it.id]!=null?S.scripts[it.id]:it.script;
function finalText(it){
  const d=(cfgOf(it).direction||'').trim().replace(/^\[|\]$/g,''),sc=scriptFor(it).trim();
  if(!d) return sc; const m=sc.match(/^\[([^\]]*)\]\s*/); return m?'['+d+', '+m[1]+'] '+sc.slice(m[0].length):'['+d+'] '+sc;
}
let db=null; const TAKES=new Map();
function openDB(){return new Promise(res=>{try{const r=indexedDB.open('aot-cfix',1);r.onupgradeneeded=()=>r.result.createObjectStore('takes',{keyPath:'id'});r.onsuccess=()=>{db=r.result;res();};r.onerror=()=>res();}catch(e){res();}});}
function dbPut(t){try{if(db) db.transaction('takes','readwrite').objectStore('takes').put(t);}catch(e){}}
function dbDel(id){try{if(db) db.transaction('takes','readwrite').objectStore('takes').delete(id);}catch(e){}}
function dbAll(){return new Promise(res=>{if(!db) return res([]);try{const r=db.transaction('takes').objectStore('takes').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([]);}catch(e){res([]);}});}
const takesFor=id=>[...TAKES.values()].filter(t=>t.item===id).sort((a,b)=>a.t-b.t);
const hasKept=it=>takesFor(it.id).some(t=>t.keep);
const todo=it=>!hasKept(it);
let playing=null;
function stopPlay(){if(playing){playing.a.pause();playing.btn&&playing.btn.classList.remove('on');playing=null;}}
function playSrc(src,btn){const same=playing&&playing.btn===btn;stopPlay();if(same)return;const a=new Audio(src);playing={a,btn};btn&&btn.classList.add('on');a.onended=()=>{if(playing&&playing.a===a){btn&&btn.classList.remove('on');playing=null;}};a.play().catch(()=>{});}
function b64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
async function apiErr(r){let t='';try{t=await r.text();const j=JSON.parse(t);const d=j.detail;if(d&&typeof d==='object'&&!Array.isArray(d))t=d.message||d.status||JSON.stringify(d);else if(Array.isArray(d))t=d.map(x=>x.msg).join('; ');else if(d)t=String(d);}catch(e){} return new Error('ElevenLabs '+r.status+': '+String(t).slice(0,240));}
async function tts(c,text){
  need(); if(!c.voice_id) throw new Error('This voice has no ID yet. Cast it first.');
  const url='https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(c.voice_id)+'?output_format=mp3_44100_128';
  const body={text,model_id:'eleven_v4',voice_settings:{stability:+c.stability,similarity_boost:+c.similarity},seed:Math.floor(Math.random()*4294967295)};
  const send=()=>fetch(url,{method:'POST',headers:{'xi-api-key':apiKey(),'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)});
  let r=await send();
  if(!r.ok&&(r.status===400||r.status===422)){ const e=await apiErr(r); if(/seed/i.test(e.message)){ delete body.seed; r=await send(); } else throw e; }
  if(!r.ok) throw await apiErr(r);
  return b64(await r.arrayBuffer());
}
const retry=async(fn,tries=4)=>{for(let k=0;;k++){try{return await fn();}catch(e){const m=e&&e.message||String(e);if(k<tries-1&&/ 429| 409|too many|concurrent|in progress/i.test(m)){await new Promise(r=>setTimeout(r,window.__FAST?5:2500*(k+1)));continue;}throw e;}}};

const busy={},errs={};
const sentHtml=it=>'Sent: '+esc(finalText(it)).replace(/\[([^\]]*)\]/g,'<b>[$1]</b>');
function filtered(type){
  const q=S.search.trim().toLowerCase(), f=S.filter[type];
  return ofType(type).filter(it=>{
    if(f==='todo'&&!todo(it)) return false;
    if(f==='kept'&&!hasKept(it)) return false;
    if(S.voice!=='all'&&it.voice!==S.voice) return false;
    if(q&&!((it.text||'')+' '+(it.speaker||'')+' '+(it.ctx||'')).toLowerCase().includes(q)) return false;
    return true;
  });
}
function counts(type){ const L=ofType(type); return {all:L.length,todo:L.filter(todo).length}; }
function renderTabs(){
  $('tabs').innerHTML=TABS.map(t=>{const c=counts(t.type);if(!c.all)return '';return '<div class="tab'+(S.tab===t.id?' on':'')+'" data-tab="'+t.id+'">'+t.name+(c.todo?'<span class="c">'+c.todo+' to do</span>':'<span class="c ok">done</span>')+'</div>';}).join('');
  const k=[...TAKES.values()].filter(x=>x.keep&&BYID.has(x.item)).length;
  $('progress').innerHTML='<b>'+k+'</b> of '+ITEMS.length+' made';
}
function render(){
  if(!ofType(TABS.find(t=>t.id===S.tab).type).length) S.tab=TABS.find(t=>ofType(t.type).length).id;
  renderTabs();
  const tab=TABS.find(t=>t.id===S.tab), type=tab.type, c=counts(type), f=S.filter[type];
  let h='<div class="win panel"><h2>'+tab.name+'</h2><div class="note">';
  h+='These lines show a contraction on screen (she\'s, I\'m, don\'t) but their recording says the long form (she is, I am, do not), because the last re-record read old scripts. Each card shows what the old clip says. The scripts below now match the screen word for word. ';
  h+=type==='d'?'Save as <b>dialogue-pending.json</b> and send it to Claude.':'Save as <b>voices.json</b> and send it to Claude.';
  h+=' ('+c.todo+' left)</div><div class="row" style="margin-top:10px"><button class="btn gold" id="doAll">'+(BULK&&BULK.type===type?'Stop':'Make everything shown below')+'</button>';
  h+='<button class="btn" id="saveTab">'+(type==='b'?'Save voices.json':'Save dialogue-pending.json')+'</button><span id="bulkMsg" class="busy">'+esc(BULKMSG[type]||'')+'</span></div><div id="bulkErr"></div></div>';
  const opts=[['todo','To do ('+c.todo+')'],['all','All lines ('+c.all+')'],['kept','Kept takes']];
  h+='<div class="win panel"><div class="row"><div class="seg" id="filter">'+opts.map(o=>'<button data-f="'+o[0]+'"'+(f===o[0]?' class="on"':'')+'>'+o[1]+'</button>').join('')+'</div>';
  const vs=[...new Set(ofType(type).map(i=>i.voice))]; h+='<select id="vsel"><option value="all">Every voice</option>'+vs.map(v=>'<option value="'+v+'"'+(S.voice===v?' selected':'')+'>'+esc(type==='d'?vName(v):v)+' ('+ofType(type).filter(i=>i.voice===v&&todo(i)).length+' to do)</option>').join('')+'</select>';
  h+='<input type="text" id="search" placeholder="Search" value="'+esc(S.search)+'" style="min-width:160px"></div></div>';
  const L=filtered(type), shown=L.slice(0,S.limit);
  h+='<div id="list">';
  if(!L.length) h+='<div class="win empty">Nothing here. Pick another filter, or save your file.</div>';
  let last=''; for(const it of shown){ const g=type==='d'?vName(it.voice):it.ch+' · '+it.kind; if(g!==last){h+='<div class="kindhead">'+esc(g)+'</div>';last=g;} h+=cardHtml(it); }
  if(L.length>shown.length) h+='<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" id="more">Show '+Math.min(60,L.length-shown.length)+' more ('+(L.length-shown.length)+' hidden)</button></div>';
  h+='</div>';
  $('wrap').innerHTML=h;
}
function cardHtml(it){
  const takes=takesFor(it.id), kept=takes.some(t=>t.keep), k=esc(it.id);
  let h='<div class="win card" data-id="'+k+'"><div class="top"><span class="who">'+esc(it.speaker)+'</span><span class="game">'+esc(it.text)+'</span><span class="tag rebake">re-bake</span>'+(kept?'<span class="tag kept">kept</span>':'')+'</div>';
  if(it.note) h+='<div class="after">'+esc(it.note)+'</div>';
  h+='<div><div class="hint">Script (what ElevenLabs reads)</div><textarea data-act="script" data-id="'+k+'" rows="2">'+esc(scriptFor(it))+'</textarea></div>';
  h+='<div class="chips">'+TAG_CHIPS.map(t=>'<span class="chip" data-act="chip" data-id="'+k+'" data-t="'+esc(t)+'">'+esc(t)+'</span>').join('')+'<span class="chip" data-act="reset" data-id="'+k+'">reset</span></div>';
  h+='<div class="sent" data-sent="'+k+'">'+sentHtml(it)+'</div><div class="row"><button class="btn" data-act="gen" data-id="'+k+'"'+(busy[it.id]?' disabled':'')+'>'+(takes.length?'Redo':'Generate')+'</button>';
  if(busy[it.id]) h+='<span class="busy">'+esc(busy[it.id])+'</span>';
  if(errs[it.id]) h+='<span class="err">'+esc(errs[it.id].message)+'</span>';
  h+='</div>'+takesHtml(takes)+'</div>'; return h;
}
function takesHtml(takes){
  if(!takes.length) return '';
  return '<div class="takes">'+takes.map((t,i)=>'<div class="take'+(t.keep?' keep':'')+'"><button class="play" data-act="play" data-tid="'+t.id+'">&#9654;</button><label class="row" style="gap:4px"><input type="checkbox" data-act="keep" data-tid="'+t.id+'"'+(t.keep?' checked':'')+'><span class="lbl">Take '+(i+1)+'</span></label><button class="x" data-act="del" data-tid="'+t.id+'" title="Delete take">&#10005;</button></div>').join('')+'</div>';
}
function refreshCard(id){ const it=BYID.get(id), el=document.querySelector('.card[data-id="'+CSS.escape(id)+'"]'); if(it&&el){ const d=document.createElement('div'); d.innerHTML=cardHtml(it); el.replaceWith(d.firstChild); } renderTabs(); }
async function generate(it){
  if(busy[it.id]) return false;
  delete errs[it.id]; busy[it.id]='Generating...'; refreshCard(it.id);
  let ok=false;
  try{
    const sent=finalText(it); const mp3=await retry(()=>tts(cfgOf(it),sent));
    for(const x of takesFor(it.id)) if(x.keep){x.keep=false;dbPut(x);}
    const t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),item:it.id,type:it.type,mp3,keep:true,sent,t:Date.now(),model:'eleven_v4'};
    TAKES.set(t.id,t); dbPut(t); ok=true;
  }catch(e){ errs[it.id]={message:e.message||String(e)}; }
  delete busy[it.id]; refreshCard(it.id); return ok;
}
let BULK=null; const BULKMSG={};
async function doAll(){
  const type=TABS.find(t=>t.id===S.tab).type;
  if(BULK){ BULK.stop=true; return; }
  if(!apiKey()){ alert('Paste your ElevenLabs API key at the top first.'); return; }
  const L=filtered(type).filter(todo);
  if(!L.length){ alert('Nothing left to make in this view.'); return; }
  const noid=[...new Set(L.filter(l=>!cfgOf(l).voice_id).map(l=>vName(l.voice)))];
  if(noid.length){ alert('These voices have no voice ID: '+noid.join(', ')); return; }
  const chars=L.reduce((n,l)=>n+finalText(l).length,0);
  if(!confirm('Make one take of '+L.length+' lines (about '+chars.toLocaleString()+' characters of credit)? Each take is kept automatically; you can Redo any after.')) return;
  BULK={stop:false,type}; render();
  const setMsg=s=>{ BULKMSG[type]=s; const el=$('bulkMsg'); if(el) el.textContent=s; };
  const go=L; let i=0,done=0,fail=0,firstErr='';
  const step=()=>setMsg(done+' of '+go.length+' made'+(fail?' · '+fail+' failed':''));
  step();
  const worker=async()=>{ while(!BULK.stop&&i<go.length){ const l=go[i++]; if(await generate(l)) done++; else { fail++; if(!firstErr) firstErr=(errs[l.id]||{}).message||''; } step(); } };
  await Promise.all(Array.from({length:3},worker));
  const stopped=BULK.stop; BULK=null;
  setMsg(BULKMSG[type]+(stopped?' · stopped':' · finished. Listen, Redo any you dislike, then save.'));
  render();
  if(firstErr){ const hint=/Failed to fetch|NetworkError|Load failed/i.test(firstErr)?' The page could not reach ElevenLabs: open this file in Chrome or Safari on your computer, not in a preview.':/ 401|invalid_api_key/i.test(firstErr)?' The API key was not accepted: paste it again at the top.':/quota|credits|insufficient/i.test(firstErr)?' The ElevenLabs account is out of credits. Takes already made are kept.':/ 403|permission/i.test(firstErr)?' The API key lacks permission for this. Edit the key in ElevenLabs and allow it.':''; $('bulkErr').innerHTML='<div class="err" style="margin-top:6px"><b>Why some failed:</b>'+esc(hint)+' ElevenLabs said: '+esc(firstErr)+'</div>'; }
}
document.addEventListener('click',e=>{
  const tb=e.target.closest('.tab'); if(tb){ S.tab=tb.dataset.tab; S.voice='all'; S.limit=40; saveState(); render(); window.scrollTo(0,0); return; }
  const f=e.target.closest('#filter button'); if(f){ const type=TABS.find(t=>t.id===S.tab).type; S.filter[type]=f.dataset.f; S.limit=40; saveState(); render(); return; }
  if(e.target.id==='more'){ S.limit+=60; render(); return; }
  if(e.target.id==='doAll'){ doAll(); return; }
  if(e.target.id==='saveTab'){ save(); return; }
  const b=e.target.closest('[data-act]'); if(!b) return;
  const act=b.dataset.act, it=b.dataset.id&&BYID.get(b.dataset.id), tk=b.dataset.tid&&TAKES.get(b.dataset.tid);
  if(act==='gen'&&it) generate(it);
  else if(act==='play'&&tk) playSrc('data:audio/mpeg;base64,'+tk.mp3,b);
  else if(act==='del'&&tk){ TAKES.delete(tk.id); dbDel(tk.id); refreshCard(tk.item); }
  else if(act==='chip'&&it){ const ta=document.querySelector('textarea[data-act="script"][data-id="'+CSS.escape(it.id)+'"]'); const t=b.dataset.t,s=ta.value; const m=s.match(/^\[([^\]]*)\]\s*/); const v=m?'['+m[1]+', '+t.slice(1,-1)+'] '+s.slice(m[0].length):t+' '+s; ta.value=v; S.scripts[it.id]=v; saveState(); updateSent(it); }
  else if(act==='reset'&&it){ delete S.scripts[it.id]; saveState(); refreshCard(it.id); }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.act==='keep'){ const tk=TAKES.get(t.dataset.tid); if(!tk) return; if(t.checked) for(const x of takesFor(tk.item)) if(x.keep&&x.id!==tk.id){x.keep=false;dbPut(x);} tk.keep=t.checked; dbPut(tk); refreshCard(tk.item); }
  else if(t.id==='vsel'){ S.voice=t.value; S.limit=40; saveState(); render(); }
});
function updateSent(it){ const el=document.querySelector('[data-sent="'+CSS.escape(it.id)+'"]'); if(el) el.innerHTML=sentHtml(it); }
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='search'){ S.search=t.value; S.limit=40; saveState(); clearTimeout(window.__st); window.__st=setTimeout(()=>{ const pos=t.selectionStart; render(); const n=$('search'); if(n){ n.focus(); try{n.setSelectionRange(pos,pos);}catch(e){} } },250); return; }
  const it=t.dataset.id&&BYID.get(t.dataset.id); if(!it) return;
  if(t.dataset.act==='script'){ S.scripts[it.id]=t.value; saveState(); updateSent(it); }
});
function download(name,obj){ const blob=new Blob([JSON.stringify(obj)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function save(){
  const type=TABS.find(t=>t.id===S.tab).type;
  const kept=[...TAKES.values()].filter(t=>t.keep&&t.type===type&&BYID.has(t.item));
  if(!kept.length){ alert('Keep at least one take in this tab first.'); return; }
  if(type==='b'){
    const clips={}, voices=JSON.parse(JSON.stringify(DATA.voicesLive));
    for(const t of kept){ const it=BYID.get(t.item); ((clips[it.ch]=clips[it.ch]||{})[it.kind]=clips[it.ch][it.kind]||[]).push({text:it.text,mp3:t.mp3,model:t.model||'eleven_v4'});
      const v=voices[it.ch]=voices[it.ch]||{}; (v.scripts=v.scripts||{})[it.kind+'|'+it.text]=scriptFor(it); }
    download('voices.json',{built:BUILT,clips,voices});
  } else {
    const voices={}, scripts={};
    for(const t of kept){ const it=BYID.get(t.item); const c=dcfg(it.voice); if(c.voice_id) voices[it.voice]={voice_id:c.voice_id,name:c.name,model:'eleven_v4',settings:{stability:+c.stability,similarity_boost:+c.similarity},direction:c.direction,designed:!isFam(it.voice),desc:isFam(it.voice)?undefined:c.desc}; scripts[it.key]=scriptFor(it); }
    const clips=kept.map(t=>{const it=BYID.get(t.item);return {voice:it.voice,speaker:it.speaker,text:it.text,mp3:t.mp3,model:t.model||'eleven_v4'};});
    download('dialogue-pending.json',{chapter:0,built:BUILT,voices,scripts,clips});
  }
}
openDB().then(dbAll).then(all=>{ for(const t of all) TAKES.set(t.id,t); render(); });
window.__PB={S,ITEMS,TAKES,generate,doAll,render};
</script>
</body>
</html>
