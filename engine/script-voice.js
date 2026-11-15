'use strict';
// engine/script-voice.js: the Voice section of a line in the Script Editor (script.html, Script Editor step 5).
// It uses the same two stores as the Voice Library (voices.html), so a take made here shows there and plays in the game:
//   IndexedDB 'aot-local-clips' store 'clips'  the clip each line uses (row id = dialog|<voice>||<exact text>; engine/local-clips.js reads it)
//   IndexedDB 'aot-voice-library' store 'takes' every take made (line key d|<voice>|<exact text>)
// Make a take = ElevenLabs text to speech from the line's direction (key aot-el-key, set once in the Voice Library). Record my read = Tom's own voice
// turned into the character's voice (speech to speech). USE IT puts a take in the game for that exact wording.
const VOICE={busy:{},err:{},rec:{},takes:{},local:{},VI:null,ldb:null,tdb:null,booted:null,playing:null,files:{}};
const VKEY='aot-el-key';
const vApiKey=()=>{ try{ return localStorage.getItem(VKEY)||''; }catch(e){ return ''; } };
function vIdb(name,store){ return new Promise(res=>{ try{ const r=indexedDB.open(name,1); r.onupgradeneeded=()=>{ try{ r.result.createObjectStore(store,{keyPath:'id'}); }catch(e){} }; r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); }catch(e){ res(null); } }); }
function vTx(db,st,fn){ return new Promise((res,rej)=>{ if(!db) return rej(new Error('This browser would not let me save clips.')); try{ const t=db.transaction(st,'readwrite'); fn(t.objectStore(st)); t.oncomplete=()=>res(); t.onerror=()=>rej(t.error||new Error('Save failed')); t.onabort=()=>rej(t.error||new Error('Save failed')); }catch(e){ rej(e); } }); }
function vGet(db,st,id){ return new Promise(res=>{ if(!db) return res(null); try{ const q=db.transaction(st).objectStore(st).get(id); q.onsuccess=()=>res(q.result||null); q.onerror=()=>res(null); }catch(e){ res(null); } }); }
function vSlimAll(db,st){ return new Promise(res=>{ const out=[]; if(!db) return res(out);
  const step=last=>{ let q; try{ q=db.transaction(st).objectStore(st).getAll(last===null?null:IDBKeyRange.lowerBound(last,true),25); }catch(e){ return res(out); }
    q.onsuccess=()=>{ const rows=q.result||[]; for(const r of rows){ const m={}; for(const k in r) if(k!=='mp3') m[k]=r[k]; out.push(m); } if(rows.length<25) return res(out); step(rows[rows.length-1].id); }; q.onerror=()=>res(out); };
  step(null); }); }
VOICE.boot=function(){
  if(VOICE.booted) return VOICE.booted;
  VOICE.booted=(async()=>{
    [VOICE.ldb,VOICE.tdb]=await Promise.all([vIdb('aot-local-clips','clips'),vIdb('aot-voice-library','takes')]);
    for(const r of await vSlimAll(VOICE.ldb,'clips')) VOICE.local[r.id]=r;
    for(const t of await vSlimAll(VOICE.tdb,'takes')) (VOICE.takes[t.line]||(VOICE.takes[t.line]=[])).push(t);
    try{ const r=await fetch('data/voice-index.json?'+Date.now(),{cache:'no-store'}); if(r.ok) VOICE.VI=await r.json(); }catch(e){}
    if(typeof render==='function') render();
  })();
  return VOICE.booted;
};
const vVid=(who)=>(typeof IX!=='undefined'&&IX.speakers&&IX.speakers[who])||null;
const vRowId=(vid,text)=>['dialog',vid,'',text].join('|');
const vLine=(vid,text)=>'d|'+vid+'|'+text;
// what the line says right now (edited wording and speaker included) and which voice reads it
function vCur(id,o,ln,e){ const who=o.talk, text=o.lines[0]; return {who,text,vid:vVid(who)||(ln&&ln.vid)||null}; }
function vScript(cur,ln){ // the words ElevenLabs reads: the direction tag of the game's line if it has one, else a plain one from the voice settings
  const v=VOICE.VI&&cur.vid&&VOICE.VI.voices['dialog|'+cur.vid]||{};
  let tag=''; const m=ln&&ln.s&&ln.s.match(/^\s*\[([^\]]*)\]/); if(m) tag=m[1]; else if(v.direction) tag=String(v.direction).replace(/^\[|\]$/g,'');
  if(ln&&ln.s&&ln.t===cur.text) return ln.s;
  return (tag?'['+tag+'] ':'')+cur.text;
}
VOICE.panel=function(key,id,o,ln,e,isIns){
  VOICE.boot();
  const cur=vCur(id,o,ln,e); const bk=id+'|'+key;
  const row=cur.vid&&VOICE.local[vRowId(cur.vid,cur.text)];
  const takes=cur.vid?(VOICE.takes[vLine(cur.vid,cur.text)]||[]).slice().sort((a,b)=>a.t-b.t):[];
  const changed=isIns||(ln&&(ln.t!==cur.text||ln.who!==cur.who));
  let status; if(!cur.vid) status='<span class="err">'+esc(cur.who)+' has no voice chosen yet. Ask Claude to cast one.</span>';
  else if(row) status='<span class="ok">A take made on this phone is in use.</span>';
  else if(!changed&&ln&&ln.status==='clip') status='<span class="ok">Recorded (the game\'s clip).</span>';
  else if(!changed&&ln&&ln.status==='old') status='<span class="warn">Old voice: re-record to update it.</span>';
  else status='<span class="warn">No clip yet. The game reads it with speech synthesis until one is recorded.</span>';
  const busy=VOICE.busy[bk], err=VOICE.err[bk], rec=VOICE.rec[bk];
  let h='<h4>Voice</h4><div class="hint">'+status+'</div>';
  h+='<div class="pr"><button class="small" data-vplay="'+esc(bk)+'">Play</button>'
    +'<button class="small" data-vtake="'+esc(bk)+'"'+(busy||!cur.vid?' disabled':'')+'>Make a take</button>'
    +'<button class="small '+(rec?'rec':'')+'" data-vrec="'+esc(bk)+'"'+((busy&&!rec)||!cur.vid?' disabled':'')+'>'+(rec?'Stop and use my read':'Record my read')+'</button></div>';
  if(busy) h+='<div class="hint">'+esc(busy)+'</div>';
  if(err) h+='<div class="err">'+esc(err)+'</div>';
  if(!vApiKey()) h+='<div class="hint">To make takes, paste the ElevenLabs key once in the Voice Library (it is shared with this page).</div>';
  if(takes.length) h+='<div class="hint">Takes for these exact words:</div>'+takes.map((t,i)=>'<div class="pr"><span class="tag">'+esc(t.label||'take')+' '+(i+1)+(row&&row.takeId===t.id?' (in use)':'')+'</span><button class="small ghost" data-vplay="'+esc(bk)+'|'+esc(t.id)+'">Play</button>'+(row&&row.takeId===t.id?'':'<button class="small ghost" data-vuse="'+esc(bk)+'|'+esc(t.id)+'">Use it</button>')+'</div>').join('');
  if(row) h+='<div class="pr"><button class="small ghost" data-vgame="'+esc(bk)+'">Go back to the game\'s clip</button></div>';
  return h;
};
// ---------- audio ----------
const vAud=new Audio();
function vPlayB64(b64){ try{ vAud.pause(); vAud.src=b64.startsWith('data:')?b64:'data:audio/mpeg;base64,'+b64; vAud.currentTime=0; const p=vAud.play(); if(p&&p.catch) p.catch(()=>toast('This phone would not play that. Tap Play again.')); }catch(e){ toast('Could not play it.'); } }
function vLoadFile(f){ if(VOICE.files[f]) return VOICE.files[f]; VOICE.files[f]=new Promise(res=>{ const s=document.createElement('script'); s.src=f+'?'+Date.now(); s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s); }); return VOICE.files[f]; }
window.DIALOG_CLIPS=window.DIALOG_CLIPS||{clips:{},voices:{}};
async function vBuiltIn(cur,ln){ // the game's own clip for the unchanged line
  if(!ln||ln.t!==cur.text||ln.f==null||!IX.files) return null; const f=IX.files[ln.f]; if(!f) return null; await vLoadFile(f);
  return window.DIALOG_CLIPS.clips[cur.vid+'|'+cur.text]||null;
}
// ---------- making takes ----------
function vErr(r){ return r.text().then(t=>{ let m=t; try{ const j=JSON.parse(t); const d=j.detail; m=d&&typeof d==='object'?(d.message||d.status||JSON.stringify(d)):(d||t); }catch(e){} return new Error('ElevenLabs '+r.status+(r.status===401?' (the API key was not accepted)':r.status===402||r.status===403?' (check the ElevenLabs plan and credits)':'')+': '+String(m).slice(0,140)); }); }
const vB64=buf=>{ const u=new Uint8Array(buf); let s=''; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); };
async function vWithVoice(v,call){ const ids=[v.voice_id,...(v.fallback_ids||[]).filter(x=>x&&x!==v.voice_id)]; let r; for(const id of ids){ r=await call(id); if(r.status!==404) return r; } return r; }
async function vTts(v,text){
  const body={text,model_id:v.model||'eleven_v4',voice_settings:{stability:+v.stability,similarity_boost:+v.similarity,...(v.speed!=null?{speed:+v.speed}:{})}};
  const r=await vWithVoice(v,id=>fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(id)+'?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':vApiKey(),'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)}));
  if(!r.ok) throw await vErr(r); return vB64(await r.arrayBuffer());
}
async function vSts(v,blob){
  const f=new FormData(); f.append('audio',blob,'take.'+(blob.type.includes('mp4')?'mp4':blob.type.includes('ogg')?'ogg':'webm')); f.append('model_id','eleven_english_sts_v2');
  f.append('voice_settings',JSON.stringify({stability:+v.stability,similarity_boost:+v.similarity})); f.append('remove_background_noise','true');
  const r=await vWithVoice(v,id=>fetch('https://api.elevenlabs.io/v1/speech-to-speech/'+encodeURIComponent(id)+'?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':vApiKey()},body:f}));
  if(!r.ok) throw await vErr(r); return vB64(await r.arrayBuffer());
}
async function vUse(cur,take,mp3){
  const mp=mp3||take.mp3||(await vGet(VOICE.tdb,'takes',take.id)||{}).mp3; if(!mp) throw new Error('That take is no longer saved on this phone.');
  const row={id:vRowId(cur.vid,cur.text),kind:'dialog',voice:cur.vid,lineKind:'',text:cur.text,mp3:mp,script:take.script,takeId:take.id,t:Date.now()};
  await vTx(VOICE.ldb,'clips',s=>s.put(row)); const m={}; for(const k in row) if(k!=='mp3') m[k]=row[k]; VOICE.local[row.id]=m;
}
async function vAdd(cur,mp3,label,script){
  const t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),line:vLine(cur.vid,cur.text),mp3,label,script,t:Date.now()};
  await vTx(VOICE.tdb,'takes',s=>s.put(t)); const m={}; for(const k in t) if(k!=='mp3') m[k]=t[k]; (VOICE.takes[t.line]||(VOICE.takes[t.line]=[])).push(m); await vUse(cur,t,mp3);
}
function vResolve(bk){ // bk = sceneId|Speaker|text[|takeId]; the current wording comes from the shown scene
  const i=bk.indexOf('|'); const id=bk.slice(0,i); let rest=bk.slice(i+1); let takeId=null;
  const m=rest.match(/\|(t[a-z0-9]{6,})$/); if(m){ takeId=m[1]; rest=rest.slice(0,m.index); }
  const ref=rest; const rows=flat(view(id),0,[]); const r=rows.find(x=>x.o&&x.o.refs&&x.o.refs[0]===ref); if(!r) return null;
  const ln=lineOf(id,ref); const cur={who:r.o.talk,text:r.o.lines[0],vid:vVid(r.o.talk)||(ln&&ln.vid)||null};
  return {id,ref,ln,cur,takeId,bk:id+'|'+ref};
}
document.addEventListener('click',async ev=>{
  const t=ev.target.closest('[data-vplay],[data-vtake],[data-vrec],[data-vuse],[data-vgame]'); if(!t) return;
  const d=t.dataset, bk=d.vplay||d.vtake||d.vrec||d.vuse||d.vgame; const R=vResolve(bk); if(!R||!R.cur.vid) return;
  const cur=R.cur, ln=R.ln, key=R.bk; await VOICE.boot();
  if(d.vplay!==undefined){
    if(R.takeId){ const tk=await vGet(VOICE.tdb,'takes',R.takeId); if(tk&&tk.mp3) vPlayB64(tk.mp3); return; }
    const row=await vGet(VOICE.ldb,'clips',vRowId(cur.vid,cur.text)); if(row&&row.mp3){ vPlayB64(row.mp3); return; }
    const b=await vBuiltIn(cur,ln); if(b){ vPlayB64(b); return; }
    toast('No clip yet for these words.'); return; }
  if(d.vuse!==undefined){ try{ await vUse(cur,{id:R.takeId,script:''}); toast('That take is now what the game plays for these words.'); }catch(e){ VOICE.err[key]=e.message||String(e); } render(); return; }
  if(d.vgame!==undefined){ try{ await vTx(VOICE.ldb,'clips',s=>s.delete(vRowId(cur.vid,cur.text))); delete VOICE.local[vRowId(cur.vid,cur.text)]; }catch(e){ VOICE.err[key]=e.message||String(e); } render(); return; }
  if(!vApiKey()){ toast('Paste your ElevenLabs key in the Voice Library first.'); return; }
  const v=VOICE.VI&&VOICE.VI.voices['dialog|'+cur.vid]; if(!v||!v.voice_id){ VOICE.err[key]='This voice has no ElevenLabs voice ID.'; render(); return; }
  if(d.vtake!==undefined){
    delete VOICE.err[key]; VOICE.busy[key]='Making a take...'; render();
    try{ const script=vScript(cur,ln); const mp3=await vTts(v,script); await vAdd(cur,mp3,'new take',script); }catch(e){ VOICE.err[key]=e.message||String(e); }
    delete VOICE.busy[key]; render(); return; }
  if(d.vrec!==undefined){
    if(VOICE.rec[key]){ VOICE.rec[key].stop(); return; }
    const setSession=ty=>{ if(navigator.audioSession){ try{ navigator.audioSession.type=ty; }catch(e){} } };
    setSession('play-and-record');
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}});
      const mr=new MediaRecorder(stream),chunks=[];
      mr.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
      mr.onstop=async()=>{ stream.getTracks().forEach(x=>x.stop()); setSession('auto'); delete VOICE.rec[key]; const blob=new Blob(chunks,{type:mr.mimeType||'audio/mp4'});
        VOICE.busy[key]='Turning your read into '+cur.who+'\u2019s voice...'; render();
        try{ const mp3=await vSts(v,blob); await vAdd(cur,mp3,'my read','(recording)'); delete VOICE.err[key]; }catch(e){ VOICE.err[key]=e.message||String(e); }
        delete VOICE.busy[key]; render(); };
      VOICE.rec[key]=mr; mr.start(); delete VOICE.err[key]; render();
    }catch(e){ setSession('auto'); VOICE.err[key]='The microphone is not available: '+(e.message||e)+'. Allow the microphone for this app and try again.'; render(); }
  }
});
