'use strict';
// engine/save-sync.js — Cloud copy of the saves in a PRIVATE GitHub gist, so they survive a deleted app or a new phone (Tom, 2026-11-09).
// One file in the gist (adventures-of-tom-saves.json) holds every slot in the same format as the BACK UP file (engine/save-backup.js).
// Every sync does the same three steps: read the cloud copy, keep whichever copy of each slot is newer (restoreFromText never lets an
// older save replace a newer one), then upload the merged result. So two phones never overwrite each other's newer saves.
// The GitHub token lives only in this phone's browser storage (like the Art Library token) and is never put into a save or backup file.
// The token needs the Gists permission (read and write). The gist is created private. There is no way to point this at another server.
// Loaded after engine/save-backup.js. Saves call syncQueue() (engine/followers.js saveGame); menus call syncTap, syncOff, syncOn.
const SYNC_TOKEN='aot-sync-token',SYNC_GIST='aot-sync-gist',SYNC_LAST='aot-sync-last',SYNC_ERR='aot-sync-err';
const SYNC_FILE='adventures-of-tom-saves.json',SYNC_DESC='The Adventures of Tom saves (private, written by the game)';
const SYNC_API='https://api.github.com';
const syncGet=k=>{ try { return localStorage.getItem(k)||''; } catch(e) { return ''; } };
const syncSet=(k,v)=>{ try { if(v) localStorage.setItem(k,v); else localStorage.removeItem(k); } catch(e) {} };
const syncOn=()=>!!syncGet(SYNC_TOKEN);
let syncChain=Promise.resolve(),syncTimer=0,syncWarned=false;

// One GitHub call. Throws an Error with .offline (no network) or .status (GitHub's answer) and a plain-words message.
async function syncFetch(method,path,body) {
  const text=body?JSON.stringify(body):undefined;
  let r;
  try {
    r=await fetch(SYNC_API+path,{method,cache:'no-store',keepalive:!!text&&text.length<60000,
      headers:Object.assign({Authorization:'Bearer '+syncGet(SYNC_TOKEN),Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},text?{'Content-Type':'application/json'}:{}),body:text});
  } catch(e) { const x=new Error('Couldn\'t reach GitHub. It will try again at the next save.'); x.offline=true; throw x; }
  if(!r.ok) {
    const x=new Error(r.status===401?'GitHub refused the token. Make a new one and paste it again.'
      :(r.status===403||r.status===404)?'GitHub won\'t let this token use gists. The token needs the Gists permission (read and write).'
      :'GitHub said '+r.status+'. It will try again at the next save.');
    x.status=r.status; x.auth=(r.status===401||r.status===403); throw x;
  }
  let json=null; try { json=await r.json(); } catch(e) {}
  return json;
}
async function syncFindGist() {
  const have=syncGet(SYNC_GIST); if(have) return have;
  for(let page=1;page<=5;page++) {
    const list=await syncFetch('GET','/gists?per_page=100&page='+page);
    if(!Array.isArray(list)||!list.length) break;
    const g=list.find(x=>x&&x.files&&x.files[SYNC_FILE]);
    if(g) { syncSet(SYNC_GIST,g.id); return g.id; }
    if(list.length<100) break;
  }
  return '';
}
async function syncRead(id) {
  const g=await syncFetch('GET','/gists/'+id), f=g&&g.files&&g.files[SYNC_FILE];
  if(!f) return '';
  if(f.truncated&&f.raw_url) { try { const r=await fetch(f.raw_url,{cache:'no-store'}); return r.ok?await r.text():''; } catch(e) { return ''; } }
  return f.content||'';
}
// Is any local slot newer than (or missing from) the cloud copy? Decides whether a quiet sync needs to upload.
function syncLocalNewer(cloudText) {
  let cs={}; try { cs=(JSON.parse(cloudText)||{}).slots||{}; } catch(e) {}
  return BACKUP_SLOT_IDS().some(s=>{ const raw=saveRaw(s); return raw&&saveWhen(raw)>saveWhen(cs[s]); });
}
// Read, merge into this phone, upload the merge. push=true uploads even if nothing here is newer (after a save).
async function syncRun(push) {
  let id=await syncFindGist(), cloud='',pulled=null;
  if(id) {
    try { cloud=await syncRead(id); } catch(e) { if(e.status===404) { syncSet(SYNC_GIST,''); id=''; } else throw e; }
    if(cloud) pulled=restoreFromText(cloud);
  }
  const text=backupText();
  if(!text) return {pulled,pushed:false};
  if(id&&!push&&!syncLocalNewer(cloud)) return {pulled,pushed:false};
  if(!id) { const g=await syncFetch('POST','/gists',{description:SYNC_DESC,public:false,files:{[SYNC_FILE]:{content:text}}}); if(g&&g.id) syncSet(SYNC_GIST,g.id); }
  else await syncFetch('PATCH','/gists/'+id,{files:{[SYNC_FILE]:{content:text}}});
  return {pulled,pushed:true};
}
// One sync at a time. Never throws: returns {pulled,pushed} or {err}. quiet = automatic (no messages except one warning for a bad token).
function syncNow(push,quiet) {
  if(!syncOn()) return Promise.resolve({err:'Cloud saves are off.'});
  syncChain=syncChain.then(async()=>{
    try {
      const r=await syncRun(push);
      syncSet(SYNC_LAST,String(Date.now())); syncSet(SYNC_ERR,'');
      if(quiet&&r.pulled&&r.pulled.restored&&typeof showToast==='function') showToast('Pulled '+r.pulled.restored+(r.pulled.restored===1?' newer save':' newer saves')+' from your cloud copy.',3.2);
      return r;
    } catch(e) {
      const msg=e&&e.message?e.message:'Cloud sync failed.';
      syncSet(SYNC_ERR,msg);
      if(quiet&&!e.offline&&!syncWarned&&typeof showToast==='function') { syncWarned=true; showToast('Cloud saves aren\'t working: '+msg+' Your saves are still on this phone.',5); }
      return {err:msg,auth:!!e.auth};
    }
  });
  return syncChain;
}
// Saves call this: upload about 5 seconds after the last save, so a burst of door saves is one upload.
function syncQueue() {
  if(!syncOn()) return;
  clearTimeout(syncTimer); syncTimer=setTimeout(()=>{ syncTimer=0; syncNow(true,true); },5000);
}
// The app is going to the background: upload now instead of waiting (the page may be frozen before a timer fires).
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&syncTimer) { clearTimeout(syncTimer); syncTimer=0; syncNow(true,true); } });
window.addEventListener('pagehide',()=>{ if(syncTimer) { clearTimeout(syncTimer); syncTimer=0; syncNow(true,true); } });

function syncSummary(r) {
  if(!r) return 'Cloud saves are off.';
  if(r.err) return r.err;
  const p=r.pulled;
  return 'Cloud saves are on.'
    +(p&&p.restored?' Pulled '+p.restored+(p.restored===1?' newer save':' newer saves')+' from the cloud copy.':'')
    +(r.pushed?' Your saves are uploaded.':' Nothing new to upload.');
}
function syncNoteLine() {
  if(!syncOn()) return '';
  const e=syncGet(SYNC_ERR),t=+syncGet(SYNC_LAST)||0;
  if(e) return 'Cloud copy problem: '+e;
  return t?'Also copied to your private GitHub gist ('+new Date(t).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+').':'Cloud copy is on.';
}
const syncButtonLabel=()=>syncOn()?'SYNC NOW':'CLOUD SETUP';
// Paste the token, connect, pull whatever the cloud already holds, upload this phone's saves. Must be called straight from a tap.
function syncSetup(done) {
  let t=''; try { t=(window.prompt('Paste your GitHub token (it needs the Gists permission). It stays on this phone.','')||'').trim(); } catch(e) { return done('This browser wouldn\'t open the paste box.'); }
  if(!t) return done('Nothing pasted. Cloud saves are still off.');
  syncSet(SYNC_TOKEN,t); syncSet(SYNC_GIST,''); syncSet(SYNC_ERR,''); syncWarned=false;
  syncNow(true,false).then(r=>{ if(r.auth||r.err&&r.err.indexOf('won\'t let')>=0) { syncSet(SYNC_TOKEN,''); done(r.err+' Cloud saves are off.'); } else done(syncSummary(r)); });
}
function syncTap(done) { if(syncOn()) syncNow(true,false).then(r=>done(syncSummary(r))); else syncSetup(done); }
function syncOff() { for(const k of [SYNC_TOKEN,SYNC_GIST,SYNC_LAST,SYNC_ERR]) syncSet(k,''); clearTimeout(syncTimer); syncTimer=0; }

// On launch: pull anything newer from the cloud (and upload anything here that is newer), quietly.
if(syncOn()) setTimeout(()=>syncNow(false,true),1500);
