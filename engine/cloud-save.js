'use strict';
// engine/cloud-save.js — Keeps every save slot with the player's signed-in account.
// The account is the player's claude.ai login (Tom signs in to claude.ai with Google). Each slot is written to the
// artifact's private per-player store (db capability, data/users/<id>/): only that account can read it, on any device.
// At startup the store is read once; for each slot the newer copy (by its `when` time) wins and fills SAVE_CACHE.
// Saves still go to browser storage too, so the game keeps working where the account is not reachable.
// CLOUD.state says which case this visit is in ('checking', 'on', 'off'), CLOUD.why says why it is off, and
// CLOUD.who holds the account's name and email for the save screens (cloudAccountLine, cloudShort).
// Loaded after engine/splash.js (it wraps loadMenu and confirmNew from engine/intro.js).
const CLOUD={db:null,uid:null,settled:false,busy:{},next:{},waiters:[],state:'checking',why:'',who:null,failed:0};
const CLOUD_SLOTS=()=>SAVE_SLOTS.concat(typeof CLEAR_SLOTS!=='undefined'?CLEAR_SLOTS:[]);
const cloudOn=()=>!!CLOUD.db&&CLOUD.state==='on';
const cloudWhen=raw=>{ try { return (raw&&JSON.parse(raw).when)||0; } catch(e) { return 0; } };
const cloudDoc=slot=>CLOUD.db.collection('data/users/'+CLOUD.uid).doc('save-'+slot);

// Plain-language account status for the save screens.
const CLOUD_WHY={
  outside:'The game was opened outside claude.ai, so it cannot see your account.',
  signedout:'You are not signed in to claude.ai here.',
  noaccess:'This copy of the game cannot reach your account.',
  error:'Your account did not answer. Saves will sync the next time it does.',
  write:'Your last save could not reach your account.'
};
function cloudWho() {
  const w=CLOUD.who; if(!w) return 'your account';
  return String(w.email||w.name||'your account').replace(/[<>&"]/g,'');   // the title screen builds its list as HTML
}
function cloudAccountLine() {
  if(CLOUD.state==='checking') return 'Checking your account...';
  if(cloudOn()) return 'Signed in as '+cloudWho()+'. Slots 1 to 3 and the autosave are kept with this account on every device.';
  return 'Saves are on this device only. '+(CLOUD_WHY[CLOUD.why]||'')+(CLOUD.why==='outside'||CLOUD.why==='signedout'?' Open the game from claude.ai while signed in to keep them with your account.':'');
}
function cloudShort() {
  if(CLOUD.state==='checking') return 'Checking your account.';
  return cloudOn()?'Kept with '+cloudWho()+'.':'On this device only.';
}
function cloudOff(why) { CLOUD.state='off'; CLOUD.why=why; }

// One write at a time per slot; a newer save made while one is in flight goes next (only the latest is kept).
function cloudPut(slot,raw) {
  if(!CLOUD.settled) { CLOUD.next[slot]=raw; return false; }   // sent once startup sync finishes
  if(!CLOUD.db) return false;
  if(CLOUD.busy[slot]) { CLOUD.next[slot]=raw; return true; }
  CLOUD.busy[slot]=true;
  const write=(tries)=>cloudDoc(slot).set({slot,raw,when:cloudWhen(raw)}).then(()=>{
    if(CLOUD.state!=='on'&&CLOUD.db) { CLOUD.state='on'; CLOUD.why=''; cloudRedraw(); }
  },e=>{
    if(tries&&(!e||e.code==='unavailable'||e.code==='resource_exhausted')) return new Promise(r=>setTimeout(r,800+Math.random()*800)).then(()=>write(tries-1));
    // A signed-in viewer who still cannot write (view-only sharing, revoked access) stays on this device.
    if(e&&(e.code==='invalid_argument'||e.code==='revoked'||e.code==='not_granted')) { cloudOff('noaccess'); CLOUD.db=null; }
    else cloudOff('write');
    cloudRedraw();
  });
  write(2).finally(()=>{
    CLOUD.busy[slot]=false;
    const n=CLOUD.next[slot]; delete CLOUD.next[slot];
    if(n!=null) cloudPut(slot,n);
  });
  return true;
}

// Redraw anything that shows save counts or the account line.
function cloudRedraw() {
  try {
    if(splash.active&&splash.mode&&SPLASH_MODES[splash.mode]) { const sel=splash.sel; splashSetMode(splash.mode); splash.sel=Math.min(sel,(splash.list||[]).length-1); splashMark(); }
    if(typeof menuOpen!=='undefined'&&menuOpen) {
      if(typeof menuSaving!=='undefined'&&menuSaving&&typeof renderSavePop==='function') renderSavePop();
      else if(typeof renderMenu==='function') renderMenu();
    }
  } catch(e) {}
}
function cloudSettle() {
  CLOUD.settled=true;
  const pending=CLOUD.next; CLOUD.next={};
  for(const slot in pending) cloudPut(slot,pending[slot]);
  for(const f of CLOUD.waiters.splice(0)) f();
  cloudRedraw();
}
// Wait for the startup read (at most a few seconds) before showing the load list.
function cloudReady(fn) { if(CLOUD.settled) { fn(); return; } let done=false; const go=()=>{ if(!done) { done=true; fn(); } }; CLOUD.waiters.push(go); setTimeout(go,4000); }

// Read every slot from the account and merge with this device (newer copy wins).
async function cloudPull() {
  const snap=await CLOUD.db.collection('data/users/'+CLOUD.uid).get();
  const remote={};
  for(const d of snap.docs) { const b=d.data(); if(b&&typeof b.slot==='string'&&typeof b.raw==='string') remote[b.slot]=b.raw; }
  for(const slot of CLOUD_SLOTS()) {
    const here=saveRaw(slot),there=remote[slot];
    const hw=cloudWhen(here),tw=cloudWhen(there);
    if(there&&tw>hw) { SAVE_CACHE[slot]=there; try { localStorage.setItem(SAVE_PREFIX+slot,there); } catch(e) {} }
    else if(here&&hw>tw&&!(slot in CLOUD.next)) CLOUD.next[slot]=here;   // this device has a newer copy: upload it
  }
}

async function cloudStart() {
  try {
    if(typeof claude==='undefined'||!claude||typeof claude.use!=='function') { cloudOff('outside'); return; }
    const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
    // Served as a page of its own (not inside the claude.ai viewer), every capability answers null.
    if(!db||!user) { cloudOff(window.top===window?'outside':'signedout'); return; }
    const me=await user.me();
    const uid=me&&me.id; if(!uid) { cloudOff('signedout'); return; }
    CLOUD.db=db; CLOUD.uid=uid; CLOUD.who={name:me.name||'',email:me.email||''};
    try { await cloudPull(); }
    catch(e) { await new Promise(r=>setTimeout(r,1500)); await cloudPull(); }   // one retry for a slow first answer
    CLOUD.state='on'; CLOUD.why='';
  } catch(e) {
    // The account answered who you are but not your saves: keep trying to write, so the next save syncs.
    if(CLOUD.uid) cloudOff('error'); else { CLOUD.db=null; cloudOff('noaccess'); }
  }
  finally { cloudSettle(); }
}

// The load list and the new-game warning wait for the store, so saves made before Safari closed always show up.
{
  const LE_loadMenu_cloud=loadMenu,LE_confirmNew_cloud=confirmNew;
  loadMenu=function() { cloudReady(LE_loadMenu_cloud); };
  confirmNew=function() { cloudReady(LE_confirmNew_cloud); };
}
cloudStart();
