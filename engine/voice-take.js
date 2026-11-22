'use strict';
// engine/voice-take.js (keysecrets3): how the Voice Library (voices.html) and the Script Editor (script.html, engine/script-voice.js) get ElevenLabs takes.
// No page holds an ElevenLabs key any more. A button builds a request, VT.ask commits it to data/voice-requests.json on main ("voice: take <n> ..."), the
// `voice-take` Action (tools/voice-library/voicetake.py, repo secret ELEVENLABS_API_KEY) makes the takes and keeps them on branch `voicetake`, and VT polls that
// branch every 20 s: a take arrives at the page's handler, a failure arrives with ElevenLabs' own reason. A recording for speech to speech is put on branch
// `voicein` first (the Action deletes it from there after use). The page needs only the GitHub token the Art Library holds (localStorage 'aot-gh-token').
// A request: {rid, at, kind:'tts'|'sfx'|'sts'|'history', line, ...what the page sent to ElevenLabs before (voice_id, fallback_ids, text, model, stability,
// similarity, speed, seed, tries | secs, influence | audio, mime), label, script}. A page puts its own bookkeeping under `_ctx` (kept here, never sent).
// Test overrides: ?gh=<base of the GitHub API>, ?voicetake=<base url of branch voicetake's files>, ?poll=<seconds>.
const VT=(function(){
  const Q=new URLSearchParams(location.search);
  const OWNER='trivituso81', REPO='adventures-of-tom', TOKEN='aot-gh-token', REQ='data/voice-requests.json', PEND='aot-voice-pending', EXPIRE=8*3600000;
  const LS={get(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}},set(k,v){try{localStorage.setItem(k,v);return true;}catch(e){return false;}}};
  const GH=()=>(Q.get('gh')||'https://api.github.com').replace(/\/+$/,'');
  const OVER=()=>Q.get('voicetake')?Q.get('voicetake').replace(/\/+$/,'')+'/':'';
  const POLL_MS=(+Q.get('poll')>0?+Q.get('poll'):20)*1000;
  // voicefast1: a take is made in about 20 s, so a fresh request is checked every 4 s for its first 4 minutes, then every 20 s (?poll= still sets one fixed pace for tests).
  const FAST_MS=Q.get('poll')?POLL_MS:4000, FAST_FOR=4*60000;
  const pace=()=>{ const P=pend(); return P.length&&Date.now()-Math.min.apply(null,P.map(p=>p.at))<FAST_FOR?FAST_MS:POLL_MS; };
  const NOTOKEN='Takes are made on GitHub, and the GitHub token is how this page asks. Paste the token once in ADMIN > ART LIBRARY > Setup, then try again.';
  const textToB64=s=>{const u=new TextEncoder().encode(s);let b='';for(let i=0;i<u.length;i+=0x8000)b+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(b);};
  const b64ToText=c=>{const bin=atob(String(c).replace(/\s/g,'')),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder().decode(u);};
  const blobB64=blob=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(String(f.result).split(',')[1]||'');f.onerror=()=>rej(new Error('Could not read the recording.'));f.readAsDataURL(blob);});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function gh(method,path,body){
    const tok=LS.get(TOKEN); if(!tok) throw new Error(NOTOKEN);
    let r; try{ r=await fetch(GH()+'/repos/'+OWNER+'/'+REPO+path,{method,cache:'no-store',headers:Object.assign({Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined}); }
    catch(e){ throw new Error('The browser could not reach GitHub. Check the network and try again.'); }
    // bigboard1: the contents API leaves `content` empty over 1 MB, which read as an empty file; read the blob by id instead (works to 100 MB).
    const txt=await r.text(); let j=null; try{ j=JSON.parse(txt); }catch(e){}
    if(method==='GET'&&r.ok&&j&&!Array.isArray(j)&&j.sha&&!(j.content||'').replace(/\s/g,'')){ try{ const bb=await fetch(GH()+'/repos/'+OWNER+'/'+REPO+'/git/blobs/'+j.sha+'?t='+Date.now(),{cache:'no-store',headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json'}}); if(bb.ok) j.content=(await bb.json()).content||''; }catch(e){} }
    return {status:r.status,ok:r.ok,json:j,text:txt.split(tok).join('[token]').slice(0,200)};
  }
  const fail=(g,what)=>new Error(g.status===401||g.status===403?'GitHub refused the token while '+what+' ('+g.status+'). The token needs "Contents: Read and write" on the game repository.':'GitHub said '+g.status+' while '+what+': '+g.text);
  async function ensureBranch(name){   // made once, from an empty history, if it is not there yet
    let g=await gh('GET','/git/ref/heads/'+name); if(g.ok) return; if(g.status!==404) throw fail(g,'looking for branch '+name);
    const need=(x,w)=>{ if(!x.ok) throw fail(x,w); return x.json; };
    const blob=need(await gh('POST','/git/blobs',{content:'Recordings for speech to speech (keysecrets3). Deleted after use. Never merged into main.\n',encoding:'utf-8'}),'making branch '+name);
    const tree=need(await gh('POST','/git/trees',{tree:[{path:'README.md',mode:'100644',type:'blob',sha:blob.sha}]}),'making branch '+name);
    const com=need(await gh('POST','/git/commits',{message:name+' branch: start',tree:tree.sha,parents:[]}),'making branch '+name);
    g=await gh('POST','/git/refs',{ref:'refs/heads/'+name,sha:com.sha}); if(!g.ok&&g.status!==422) throw fail(g,'making branch '+name);
  }
  async function putFile(branch,path,blob,msg){
    const content=await blobB64(blob); let last='';
    for(let i=0;i<5;i++){ if(i) await sleep(1000*i);
      const w=await gh('PUT','/contents/'+path,{message:msg,content,branch}); if(w.ok||w.status===422) return;
      if(w.status!==409) throw fail(w,'sending the recording'); last=w.status+': '+w.text; }
    throw new Error('GitHub was busy while sending the recording. Try again. ('+last.slice(0,100)+')');
  }
  // One commit changes the request file: fn(doc) edits {requests, cancel}. Retried when the file moved under us.
  async function changeQueue(msg,fn){
    let last='';
    for(let i=0;i<6;i++){ if(i) await sleep(1500*i);
      const g=await gh('GET','/contents/'+REQ+'?ref=main&t='+Date.now()); let doc={requests:[],cancel:[]},sha;
      if(g.ok){ try{ doc=JSON.parse(b64ToText(g.json.content||'')||'{}'); }catch(e){ doc={}; } sha=g.json.sha; } else if(g.status!==404) throw fail(g,'reading the request list');
      doc.requests=doc.requests||[]; doc.cancel=doc.cancel||[]; fn(doc);
      const body={message:msg,content:textToB64(JSON.stringify(doc,null,1)+'\n'),branch:'main'}; if(sha) body.sha=sha;
      const w=await gh('PUT','/contents/'+REQ,body); if(w.ok) return; if(w.status!==409&&w.status!==422) throw fail(w,'sending the request'); last=w.status+': '+w.text; }
    throw new Error('The request list kept changing under us. Try again in a minute. (GitHub said '+last.slice(0,120)+')');
  }
  const pend=()=>{ try{ return (JSON.parse(LS.get(PEND)||'[]')||[]).filter(p=>p&&p.rid); }catch(e){ return []; } };
  const setPend=a=>LS.set(PEND,JSON.stringify(a));
  let POLL=0; const handlers={};
  // Asks for every request in the list in ONE commit. Returns the requests with their rid. Throws with a plain sentence.
  async function ask(page,reqs){
    if(!LS.get(TOKEN)) throw new Error(NOTOKEN);
    const at=Date.now(), made=[];
    reqs.forEach((r,i)=>{ r.at=at; r.rid='r'+(at+i)+'-'+Math.random().toString(36).slice(2,5); });
    const rec=reqs.filter(r=>r._blob);
    if(rec.length){ await ensureBranch('voicein');
      for(const r of rec){ const ext=/mp4/.test(r._blob.type)?'mp4':/ogg/.test(r._blob.type)?'ogg':'webm'; r.audio='in/'+r.rid+'.'+ext; r.mime=r._blob.type||'audio/mp4'; await putFile('voicein',r.audio,r._blob,'voicein: recording '+r.rid+' [skip ci]'); } }
    const clean=reqs.map(r=>{ const c={}; for(const k in r) if(k!=='_blob'&&k!=='_ctx') c[k]=r[k]; return c; });
    const ids=new Set(clean.map(r=>r.rid));
    await changeQueue('voice: take '+clean.length+' ('+clean[0].kind+(clean.length>1?' and more':'')+')',d=>{ d.requests=d.requests.filter(x=>!ids.has(x.rid)).concat(clean); });
    setPend(pend().concat(reqs.map(r=>({rid:r.rid,at:r.at,page,kind:r.kind,line:r.line,ctx:r._ctx||null}))));
    schedule(Math.min(pace(),FAST_MS));
    return clean;
  }
  // Stop: the job looks at "cancel" before every line it has not made yet and answers each one with "stopped by you" (the requests stay in the list so every line gets its answer). What it already made still arrives.
  async function stop(rids){ if(!LS.get(TOKEN)) throw new Error(NOTOKEN); const s=new Set(rids); await changeQueue('voice: stop '+rids.length,d=>{ d.cancel=[...new Set(d.cancel.concat(rids))]; }); }
  async function fetchFile(file){
    const o=OVER();
    if(o){ const r=await fetch(o+file+'?t='+Date.now(),{cache:'no-store'}); if(!r.ok) throw new Error('the file answered '+r.status); return r.arrayBuffer(); }
    // through the API with the token first (never cached); raw.githubusercontent.com keeps a file up to 5 minutes and is only the fallback
    const tok=LS.get(TOKEN);
    if(tok){ try{ const ab=new AbortController(), tm=setTimeout(()=>ab.abort(),30000); const r=await fetch(GH()+'/repos/'+OWNER+'/'+REPO+'/contents/'+file+'?ref=voicetake&t='+Date.now(),{cache:'no-store',signal:ab.signal,headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github.raw+json','X-GitHub-Api-Version':'2022-11-28'}}); clearTimeout(tm); if(r.ok) return r.arrayBuffer(); }catch(e){} }
    const r=await fetch('https://raw.githubusercontent.com/'+OWNER+'/'+REPO+'/voicetake/'+file+'?t='+Date.now(),{cache:'no-store'}); if(!r.ok) throw new Error('the file answered '+r.status); return r.arrayBuffer();
  }
  async function readJSON(file){ try{ return JSON.parse(new TextDecoder().decode(await fetchFile(file))); }catch(e){ return null; } }
  const clock=()=>new Date().toLocaleTimeString();
  // voicefast1: a run that crashed before it wrote its report leaves nothing on branch voicetake. Ask GitHub for the newest voice-take runs and say so at once.
  async function crashedRun(p,rep){
    try{ const g=await gh('GET','/actions/workflows/voice-take.yml/runs?per_page=8&event=push&t='+Date.now()); if(!g.ok||!g.json) return null;
      const st=rep&&rep.started?Date.parse(rep.started):0;
      return (g.json.workflow_runs||[]).find(r=>r.conclusion==='failure'&&Date.parse(r.created_at)>=p.at-15000&&!(st>=Date.parse(r.created_at)))||null; }catch(e){ return null; }
  }
  function schedule(ms){ if(!POLL) POLL=setTimeout(pollNow,ms); }
  async function pollNow(){
    POLL=0; const P=pend(); if(!P.length) return;
    const idx=await readJSON('index.json'), rep=await readJSON('voicetake-report.json'), started=rep&&rep.started?Date.parse(rep.started):NaN;
    for(const p of P){
      const h=handlers[p.page]; if(!h) continue;   // another page's request: that page answers it
      const take=idx&&(idx.takes||[]).find(x=>x.rid===p.rid);
      const bad=idx&&(idx.failed||[]).find(x=>x.rid===p.rid);
      const mins=Math.max(0,Math.round((Date.now()-p.at)/60000));
      let why='';
      if(take||bad){}
      else if(Date.now()-p.at>EXPIRE) why='GitHub gave no answer in 8 hours. Ask again.';
      else if(rep&&started===started&&started>=p.at+120000&&!(rep.asked||[]).includes(p.rid)) why='The job ended before it reached this one. Ask again.';
      else if(Date.now()-p.at>15000){ const cr=await crashedRun(p,rep); if(cr) why='The GitHub job stopped with an error before it made anything, so no take was made ('+cr.html_url+'). Ask again once it is fixed.'; }
      if(!take&&!bad&&!why){ if(h.wait) h.wait(p,'Asked '+mins+' min ago. GitHub is still making it'+(rep?'':' (this phone could not read the job report just now; it tries again)')+'; this line updates by itself (checked '+clock()+').'); continue; }
      setPend(pend().filter(x=>x.rid!==p.rid));   // off the waiting list BEFORE the page redraws, or the redraw still sees it waiting
      if(take){ try{ const buf=await fetchFile(take.file); await h.take(p,buf,take); }catch(e){ h.fail(p,'The take was made but this page could not keep it: '+String(e.message||e)); } }
      else h.fail(p,bad?bad.why:why);
    }
    if(pend().some(p=>handlers[p.page])) schedule(pace());
  }
  // A page says what to do with an answer: h.take(p, ArrayBuffer, info), h.fail(p, why), h.wait(p, text). Requests asked earlier are picked up again.
  function watch(page,h){ handlers[page]=h; if(pend().some(p=>p.page===page)) schedule(2000); }
  return {ask,stop,watch,pend:page=>pend().filter(p=>!page||p.page===page),NOTOKEN,hasToken:()=>!!LS.get(TOKEN),b64:buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}};
})();
