'use strict';
// engine/save-sync.js — Cloud copy of the saves in a PRIVATE GitHub gist, so they survive a deleted app or a new phone (Tom, 2026-11-09).
// One file in the gist (adventures-of-tom-saves.json). Format v2 (sync2, Tom 2026-11-12 "I'm not seeing all the saves from other devices"):
//   {app, v:2, when, devices:{<device id>:{label, when, slots:{<slot>:<save text>}}}}
// Every device (each phone, the home-screen app and Safari count separately: iOS gives them separate storage) writes ONLY its own
// section, so no device ever replaces another device's save. Before sync2 every device shared slot numbers and the newer slot won,
// which silently threw away the other device's save in that slot (always the autosave). A v1 file ({slots}) is read as the section
// "Earlier cloud copy" and kept until every save in it also sits in a device section.
// The Load page (engine/intro.js) and the Load tab (engine/menu.js) list this device's slots, then every other device's saves
// (syncOthers). Picking one copies it into a free slot here (syncTake) and loads it.
// The GitHub token lives only in this device's browser storage and is never put into a save or backup file. It needs the Gists permission.
// Loaded after engine/save-backup.js. Saves call syncQueue() (engine/followers.js saveGame); menus call syncTap, syncOff, syncPull, syncOthers, syncTake.
const SYNC_TOKEN='aot-sync-token',SYNC_GIST='aot-sync-gist',SYNC_LAST='aot-sync-last',SYNC_ERR='aot-sync-err';
const SYNC_DEV='aot-sync-device',SYNC_CACHE='aot-sync-cloud';
const SYNC_FILE='adventures-of-tom-saves.json',SYNC_DESC='The Adventures of Tom saves (private, written by the game)';
const SYNC_API='https://api.github.com',SYNC_LEGACY='legacy';
const syncGet=k=>{ try { return localStorage.getItem(k)||''; } catch(e) { return ''; } };
const syncSet=(k,v)=>{ try { if(v) localStorage.setItem(k,v); else localStorage.removeItem(k); } catch(e) {} };
const syncOn=()=>!!syncGet(SYNC_TOKEN);
let syncChain=Promise.resolve(),syncTimer=0,syncWarned=false,syncListed=false,syncPulledAt=0,syncBusy=false;

// This device's id (made once) and a plain name other devices show next to its saves.
function syncDeviceId() {
  let id=syncGet(SYNC_DEV);
  if(!id) { id='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); syncSet(SYNC_DEV,id); }
  return id;
}
function syncDeviceLabel() {
  const ua=navigator.userAgent||'',touch=(navigator.maxTouchPoints||0)>1;
  const kind=/iPhone/.test(ua)?'iPhone':/iPad/.test(ua)||(/Macintosh/.test(ua)&&touch)?'iPad':/Android/.test(ua)?'Android':/Macintosh/.test(ua)?'Mac':/Windows/.test(ua)?'Windows PC':'Computer';
  let app=false; try { app=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches; } catch(e) {}
  return kind+(app?' app':' browser');
}

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
// Every gist holding the saves file, oldest first. Once per visit (and at setup) the list is read again, so two devices that each
// made their own gist end up on the same (oldest) one, and the saves in the others are merged in.
async function syncFindGists() {
  const have=syncGet(SYNC_GIST);
  if(have&&syncListed) return [have];
  const found=[];
  for(let page=1;page<=5;page++) {
    const list=await syncFetch('GET','/gists?per_page=100&page='+page);
    if(!Array.isArray(list)||!list.length) break;
    for(const g of list) if(g&&g.files&&g.files[SYNC_FILE]) found.push(g);
    if(list.length<100) break;
  }
  syncListed=true;
  found.sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));
  const ids=found.map(g=>g.id);
  if(have&&!ids.includes(have)&&!found.length) ids.push(have);
  if(ids[0]) syncSet(SYNC_GIST,ids[0]); else syncSet(SYNC_GIST,'');
  return ids;
}
async function syncRead(id) {
  const g=await syncFetch('GET','/gists/'+id), f=g&&g.files&&g.files[SYNC_FILE];
  if(!f) return '';
  if(f.truncated&&f.raw_url) { try { const r=await fetch(f.raw_url,{cache:'no-store'}); return r.ok?await r.text():''; } catch(e) { return ''; } }
  return f.content||'';
}
// Cloud text (v1 or v2) to a devices map. Unreadable text gives {}.
function syncParse(text) {
  let o=null; try { o=JSON.parse(text); } catch(e) {}
  if(!o||o.app!==BACKUP_APP) return {};
  if(o.devices&&typeof o.devices==='object') return o.devices;
  if(o.slots&&typeof o.slots==='object') return {[SYNC_LEGACY]:{label:'Earlier cloud copy',when:o.when||0,slots:o.slots}};
  return {};
}
// Merge b into a: per device, the section written later wins.
function syncMergeDevices(a,b) {
  for(const [id,d] of Object.entries(b||{})) if(d&&d.slots&&(!a[id]||(d.when||0)>(a[id].when||0))) a[id]=d;
  return a;
}
function syncMySlots() {
  const slots={};
  for(const s of BACKUP_SLOT_IDS()) { const raw=saveRaw(s); if(raw) slots[s]=raw; }
  return slots;
}
const syncSame=(a,b)=>{ const ka=Object.keys(a||{}),kb=Object.keys(b||{}); return ka.length===kb.length&&ka.every(k=>a[k]===b[k]); };
// Drop the old shared section once every save in it is also in some device section.
function syncTidyLegacy(devs) {
  const L=devs[SYNC_LEGACY]; if(!L) return;
  const all=new Set(); for(const [id,d] of Object.entries(devs)) if(id!==SYNC_LEGACY) for(const r of Object.values(d.slots||{})) all.add(r);
  for(const [s,r] of Object.entries(L.slots||{})) if(all.has(r)) delete L.slots[s];
  if(!Object.keys(L.slots||{}).length) delete devs[SYNC_LEGACY];
}
function syncCacheSet(devs) { try { localStorage.setItem(SYNC_CACHE,JSON.stringify(devs)); } catch(e) {} }
function syncCacheGet() { try { return JSON.parse(localStorage.getItem(SYNC_CACHE)||'{}')||{}; } catch(e) { return {}; } }

// Read the cloud, keep it here for the Load lists, and upload this device's section when it changed (or always, push=true).
async function syncRun(push) {
  const ids=await syncFindGists(), me=syncDeviceId();
  let id=ids[0]||'', devs={};
  if(id) {
    try { devs=syncParse(await syncRead(id)); } catch(e) { if(e.status===404) { syncSet(SYNC_GIST,''); id=''; } else throw e; }
    for(const other of ids.slice(1)) { try { syncMergeDevices(devs,syncParse(await syncRead(other))); } catch(e) {} }
  }
  const mine=syncMySlots(), old=devs[me];
  const changed=!old||!syncSame(old.slots,mine)||ids.length>1||!!devs[SYNC_LEGACY];
  if(Object.keys(mine).length) devs[me]={label:syncDeviceLabel(),when:Date.now(),slots:mine};
  else delete devs[me];
  syncTidyLegacy(devs);
  syncCacheSet(devs);
  const others=Object.keys(devs).filter(k=>k!==me).length;
  if(!push&&!changed) return {pushed:false,others};
  if(!Object.keys(devs).length) return {pushed:false,others};
  const text=JSON.stringify({app:BACKUP_APP,v:2,when:Date.now(),devices:devs});
  if(!id) { const g=await syncFetch('POST','/gists',{description:SYNC_DESC,public:false,files:{[SYNC_FILE]:{content:text}}}); if(g&&g.id) syncSet(SYNC_GIST,g.id); }
  else await syncFetch('PATCH','/gists/'+id,{files:{[SYNC_FILE]:{content:text}}});
  return {pushed:true,others};
}
// One sync at a time. Never throws: returns {pushed,others} or {err}. quiet = automatic (no messages except one warning for a bad token).
function syncNow(push,quiet) {
  if(!syncOn()) return Promise.resolve({err:'Cloud saves are off.'});
  syncChain=syncChain.then(async()=>{
    syncBusy=true;
    try {
      const r=await syncRun(push);
      syncSet(SYNC_LAST,String(Date.now())); syncSet(SYNC_ERR,'');
      return r;
    } catch(e) {
      const msg=e&&e.message?e.message:'Cloud sync failed.';
      syncSet(SYNC_ERR,msg);
      if(quiet&&!e.offline&&!syncWarned&&typeof showToast==='function') { syncWarned=true; showToast('Cloud saves aren\'t working: '+msg+' Your saves are still on this phone.',5); }
      return {err:msg,auth:!!e.auth};
    } finally { syncBusy=false; syncPulledAt=Date.now(); setTimeout(syncRedraw,0); }   // an open Load list shows what came back
  });
  return syncChain;
}
// The Load lists call this when they open: read the cloud (at most every 15 s), then done(result) so the list can redraw.
// Returns false when nothing was started (cloud off or read moments ago).
function syncPull(done) {
  if(!syncOn()) return false;
  if(syncBusy) return true;                       // a read is already running; it redraws the list when it ends
  if(Date.now()-syncPulledAt<15000) return false;
  syncNow(false,true).then(r=>{ if(done&&done!==syncRedraw) done(r); });
  return true;
}
const syncChecking=()=>syncBusy;
// Saves call this: upload about 5 seconds after the last save, so a burst of door saves is one upload.
function syncQueue() {
  if(!syncOn()) return;
  clearTimeout(syncTimer); syncTimer=setTimeout(()=>{ syncTimer=0; syncNow(true,true); },5000);
}
// The app is going to the background: upload now instead of waiting (the page may be frozen before a timer fires).
// Coming back to the front: read the cloud again, so saves made meanwhile on another device show up.
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) { if(syncTimer) { clearTimeout(syncTimer); syncTimer=0; syncNow(true,true); } }
  else if(syncOn()) syncPull();
});
window.addEventListener('pagehide',()=>{ if(syncTimer) { clearTimeout(syncTimer); syncTimer=0; syncNow(true,true); } });

// Saves from other devices, newest first: [{dev,label,slot,raw,sv,when}]. Only game slots (not Part 1 clear data). A save that is
// already here, word for word, is not listed again.
function syncOthers() {
  if(!syncOn()) return [];
  const devs=syncCacheGet(), me=syncDeviceId(), here=new Set(SAVE_SLOTS.map(s=>saveRaw(s)).filter(Boolean)), out=[];
  for(const [dev,d] of Object.entries(devs)) {
    if(dev===me||!d||!d.slots) continue;
    for(const slot of SAVE_SLOTS) {
      const raw=d.slots[slot]; if(typeof raw!=='string'||here.has(raw)) continue;
      let sv=null; try { sv=JSON.parse(raw); } catch(e) {}
      if(!sv||!Array.isArray(sv.party)||typeof sv.map!=='string'||typeof sv.when!=='number') continue;
      out.push({dev,label:d.label||'Another device',slot,raw,sv,when:sv.when});
    }
  }
  return out.sort((a,b)=>b.when-a.when);
}
const syncOtherName=o=>o.label+' · '+(o.slot==='auto'?'Autosave':'Slot '+o.slot);
// Copy another device's save into a slot here and return that slot: the same number if it is free, else the first free numbered
// slot, else the oldest numbered slot. The copy is uploaded with this device's saves.
function syncTake(o) {
  const nums=SAVE_SLOTS.filter(s=>s!=='auto');
  let slot=(o.slot!=='auto'&&!saveRaw(o.slot))?o.slot:nums.find(s=>!saveRaw(s));
  if(!slot) slot=nums.slice().sort((a,b)=>saveWhen(saveRaw(a))-saveWhen(saveRaw(b)))[0];
  SAVE_CACHE[slot]=o.raw;
  try { localStorage.setItem(SAVE_PREFIX+slot,o.raw); } catch(e) { return null; }
  syncQueue();
  return slot;
}
// Redraw whichever Load list is open after a cloud read finishes.
function syncRedraw() {
  try {
    if(typeof splash!=='undefined'&&splash.active&&splash.mode==='ask'&&typeof SPLASH_MODES!=='undefined'&&SPLASH_MODES.ask&&SPLASH_MODES.ask.tab==='Load'&&typeof loadMenu==='function') { loadMenu(true); return; }
    if(typeof menuTab!=='undefined'&&menuTab==='saves'&&typeof menuOpen!=='undefined'&&menuOpen&&typeof renderMenu==='function') renderMenu();
  } catch(e) {}
}

function syncSummary(r) {
  if(!r) return 'Cloud saves are off.';
  if(r.err) return r.err;
  const n=syncOthers().length;
  return 'Cloud saves are on.'+(r.pushed?' This device\'s saves are uploaded.':' Nothing new to upload.')
    +(n?' '+n+(n===1?' save':' saves')+' from your other devices '+(n===1?'is':'are')+' on the Load list.':'');
}
function syncNoteLine() {
  if(!syncOn()) return '';
  const e=syncGet(SYNC_ERR),t=+syncGet(SYNC_LAST)||0;
  if(e) return 'Cloud copy problem: '+e;
  return t?'Also copied to your private GitHub gist ('+new Date(t).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+').':'Cloud copy is on.';
}
const syncButtonLabel=()=>syncOn()?'SYNC NOW':'CLOUD SETUP';
// Paste the token, connect, read whatever the cloud already holds, upload this device's saves. Must be called straight from a tap.
function syncSetup(done) {
  let t=''; try { t=(window.prompt('Paste your GitHub token (it needs the Gists permission). It stays on this phone.','')||'').trim(); } catch(e) { return done('This browser wouldn\'t open the paste box.'); }
  if(!t) return done('Nothing pasted. Cloud saves are still off.');
  syncSet(SYNC_TOKEN,t); syncSet(SYNC_GIST,''); syncSet(SYNC_ERR,''); syncWarned=false; syncListed=false;
  syncNow(true,false).then(r=>{ if(r.auth||r.err&&r.err.indexOf('won\'t let')>=0) { syncSet(SYNC_TOKEN,''); done(r.err+' Cloud saves are off.'); } else done(syncSummary(r)); });
}
function syncTap(done) { if(syncOn()) { syncListed=false; syncNow(true,false).then(r=>done(syncSummary(r))); } else syncSetup(done); }
function syncOff() { for(const k of [SYNC_TOKEN,SYNC_GIST,SYNC_LAST,SYNC_ERR,SYNC_CACHE]) syncSet(k,''); clearTimeout(syncTimer); syncTimer=0; syncPulledAt=0; }

// On launch: read the cloud (and upload this device's section if it changed), quietly, then redraw a Load list if one is open.
if(syncOn()) setTimeout(()=>{ if(!syncBusy&&Date.now()-syncPulledAt>15000) syncNow(false,true); },1500);
