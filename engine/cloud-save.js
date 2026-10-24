'use strict';
// engine/cloud-save.js — Keeps every save slot with the player's Claude account.
// Why: the game runs inside the Claude artifact frame, and Safari can wipe that frame's browser storage when the app
// closes. Each slot is also written to the artifact's private per-player store (db capability, data/users/<id>/).
// At startup the store is read once; for each slot the newer copy (by its `when` time) wins and fills SAVE_CACHE.
// Saves still go to browser storage too, so the game keeps working where the store is not available.
// Loaded after engine/splash.js (it wraps loadMenu and confirmNew from engine/intro.js).
const CLOUD={db:null,uid:null,settled:false,busy:{},next:{},waiters:[]};
const CLOUD_SLOTS=()=>SAVE_SLOTS.concat(typeof CLEAR_SLOTS!=='undefined'?CLEAR_SLOTS:[]);
const cloudOn=()=>!!CLOUD.db;
const cloudWhen=raw=>{ try { return (raw&&JSON.parse(raw).when)||0; } catch(e) { return 0; } };
const cloudDoc=slot=>CLOUD.db.collection('data/users/'+CLOUD.uid).doc('save-'+slot);

// One write at a time per slot; a newer save made while one is in flight goes next (only the latest is kept).
function cloudPut(slot,raw) {
  if(!CLOUD.settled) { CLOUD.next[slot]=raw; return false; }   // sent once startup sync finishes
  if(!CLOUD.db) return false;
  if(CLOUD.busy[slot]) { CLOUD.next[slot]=raw; return true; }
  CLOUD.busy[slot]=true;
  const write=(tries)=>cloudDoc(slot).set({slot,raw,when:cloudWhen(raw)}).catch(e=>{
    if(tries&&(!e||e.code==='unavailable'||e.code==='resource_exhausted')) return new Promise(r=>setTimeout(r,800+Math.random()*800)).then(()=>write(tries-1));
  });
  write(2).finally(()=>{
    CLOUD.busy[slot]=false;
    const n=CLOUD.next[slot]; delete CLOUD.next[slot];
    if(n!=null) cloudPut(slot,n);
  });
  return true;
}

function cloudSettle() {
  CLOUD.settled=true;
  const pending=CLOUD.next; CLOUD.next={};
  for(const slot in pending) cloudPut(slot,pending[slot]);
  for(const f of CLOUD.waiters.splice(0)) f();
  // Redraw anything that was showing save counts before the store answered.
  if(splash.active&&splash.mode&&SPLASH_MODES[splash.mode]) { const sel=splash.sel; splashSetMode(splash.mode); splash.sel=Math.min(sel,(splash.list||[]).length-1); splashMark(); }
  if(typeof menuOpen!=='undefined'&&menuOpen&&typeof renderMenu==='function') renderMenu();
}
// Wait for the startup read (at most a few seconds) before showing the load list.
function cloudReady(fn) { if(CLOUD.settled) { fn(); return; } let done=false; const go=()=>{ if(!done) { done=true; fn(); } }; CLOUD.waiters.push(go); setTimeout(go,4000); }

async function cloudStart() {
  try {
    if(typeof claude==='undefined'||!claude||typeof claude.use!=='function') return;
    const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
    if(!db||!user) return;
    const uid=await user.id(); if(!uid) return;
    CLOUD.db=db; CLOUD.uid=uid;
    const snap=await db.collection('data/users/'+uid).get();
    const remote={};
    for(const d of snap.docs) { const b=d.data(); if(b&&typeof b.slot==='string'&&typeof b.raw==='string') remote[b.slot]=b.raw; }
    for(const slot of CLOUD_SLOTS()) {
      const here=saveRaw(slot),there=remote[slot];
      const hw=cloudWhen(here),tw=cloudWhen(there);
      if(there&&tw>hw) { SAVE_CACHE[slot]=there; try { localStorage.setItem(SAVE_PREFIX+slot,there); } catch(e) {} }
      else if(here&&hw>tw&&!(slot in CLOUD.next)) CLOUD.next[slot]=here;   // this device has a newer copy: upload it
    }
  } catch(e) { if(!CLOUD.uid) CLOUD.db=null; }
  finally { cloudSettle(); }
}

// The load list and the new-game warning wait for the store, so saves made before Safari closed always show up.
{
  const LE_loadMenu_cloud=loadMenu,LE_confirmNew_cloud=confirmNew;
  loadMenu=function() { cloudReady(LE_loadMenu_cloud); };
  confirmNew=function() { cloudReady(LE_confirmNew_cloud); };
}
cloudStart();
