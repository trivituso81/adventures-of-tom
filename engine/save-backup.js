'use strict';
// engine/save-backup.js — A second copy of the saves, kept outside the phone's browser storage.
// Saves live in this phone's browser storage (SAVE_CACHE and localStorage, engine/followers.js). If the home-screen icon is removed or
// iOS clears site data, they go with it. So: (1) the game asks the browser to keep its storage (navigator.storage.persist), and
// (2) BACK UP writes every slot into one small file the player keeps in Files or iCloud, and RESTORE reads it back.
// Restore keeps, slot by slot, whichever copy is newer, so it can never replace a newer save with an older one.
// Loaded after engine/splash.js. Menus call saveNoteLine, doBackup and pickRestore.
const BACKUP_KEY='aot-last-backup',BACKUP_APP='adventures-of-tom';
const BACKUP_SLOT_IDS=()=>SAVE_SLOTS.concat(typeof CLEAR_SLOTS!=='undefined'?CLEAR_SLOTS:[]);
const saveWhen=raw=>{ try { return (raw&&JSON.parse(raw).when)||0; } catch(e) { return 0; } };
const lastBackup=()=>{ try { return +localStorage.getItem(BACKUP_KEY)||0; } catch(e) { return 0; } };

// Ask the browser not to throw the saves away. Safari decides on its own; asking costs nothing.
try { if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{}); } catch(e) {}

function saveNoteLine() {
  const t=lastBackup(),c=typeof syncNoteLine==='function'?syncNoteLine():'';
  return 'Saves are kept on this phone. '+(c||'Cloud saves are off: tap CLOUD SETUP on the Load page.')+' '+(t?'Last file backup: '+new Date(t).toLocaleDateString()+'.':'No file backup yet.');
}

function backupText() {
  const slots={};
  for(const s of BACKUP_SLOT_IDS()) { const raw=saveRaw(s); if(raw) slots[s]=raw; }
  return Object.keys(slots).length?JSON.stringify({app:BACKUP_APP,v:1,when:Date.now(),slots}):null;
}
// Share sheet first (Save to Files), plain download as the fallback. Returns a promise of true when a file was handed over.
async function doBackup() {
  const text=backupText();
  if(!text) { showToast('Nothing to back up yet. Save first.',2.4); return false; }
  const d=new Date(),pad=n=>String(n).padStart(2,'0');
  const name='adventures-of-tom-saves-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'.json';
  try {
    const file=new File([text],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})) {
      await navigator.share({files:[file],title:'The Adventures of Tom saves'});
    } else {
      const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:'application/json'})); a.download=name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    }
  } catch(e) { if(e&&e.name==='AbortError') return false; showToast('Couldn\'t make the backup file.',2.6); return false; }
  try { localStorage.setItem(BACKUP_KEY,String(Date.now())); } catch(e) {}
  showToast('Backup made. Keep the file in Files or iCloud.',3);
  return true;
}

// Never replaces a save (slotless1, Tom 2026-11-12). Per save in the file: already here word for word = kept; its slot is empty here =
// written there; its slot holds a different save = written to a free numbered slot (a new one if needed). Part 1 clear data keeps
// its own clear slots the same way. Returns {restored,kept,moved,bad}.
function restoreFromText(text) {
  let obj; try { obj=JSON.parse(text); } catch(e) { return null; }
  if(!obj||obj.app!==BACKUP_APP||!obj.slots||typeof obj.slots!=='object') return null;
  const res={restored:0,kept:0,moved:0,bad:0};
  const here=new Set(BACKUP_SLOT_IDS().map(s=>saveRaw(s)).filter(Boolean));
  for(const s of Object.keys(obj.slots)) {
    const raw=obj.slots[s];
    let sv=null; try { sv=JSON.parse(raw); } catch(e) {}
    if(typeof raw!=='string'||!sv||!Array.isArray(sv.party)||typeof sv.map!=='string'||typeof sv.when!=='number') { res.bad++; continue; }
    if(here.has(raw)) { res.kept++; continue; }
    const clear=/^clear-\d+$/.test(s);
    if(clear&&typeof clearSlotAdd==='function') clearSlotAdd(s);
    if(!clear&&s!=='auto'&&!/^\d+$/.test(s)) { res.bad++; continue; }
    let to=s;
    if(clear) { if(saveRaw(s)) to=clearSlotFree(); }
    else if(saveRaw(s)) to=saveSlotFree();
    if(saveRaw(to)) { res.bad++; continue; }
    if(!clear) saveSlotAdd(to);
    SAVE_CACHE[to]=raw;
    try { localStorage.setItem(SAVE_PREFIX+to,raw); } catch(e) { delete SAVE_CACHE[to]; res.bad++; continue; }
    here.add(raw); res.restored++; if(to!==s) res.moved++;
  }
  return res;
}
function restoreSummary(r) {
  if(!r) return 'That file isn\'t a saves backup from this game.';
  if(!r.restored&&!r.kept&&!r.bad) return 'That backup has no saves in it.';
  return (r.restored?'Restored '+r.restored+(r.restored===1?' save':' saves')+'.':'Nothing restored.')
    +(r.moved?' '+r.moved+(r.moved===1?' went to a new slot':' went to new slots')+' so nothing here was replaced.':'')
    +(r.kept?' '+r.kept+(r.kept===1?' was already here.':' were already here.'):'')
    +(r.bad?' '+r.bad+' could not be read.':'');
}
// Opens the phone's file picker, then calls done(summaryText, result). Must be called straight from a tap.
function pickRestore(done) {
  let inp=document.getElementById('restore-file');
  if(!inp) { inp=document.createElement('input'); inp.type='file'; inp.id='restore-file'; inp.accept='.json,application/json'; inp.hidden=true; document.body.appendChild(inp); }
  inp.value='';
  inp.onchange=async()=>{
    const f=inp.files&&inp.files[0]; if(!f) return;
    let text=''; try { text=await f.text(); } catch(e) {}
    const r=restoreFromText(text);
    done(restoreSummary(r),r);
  };
  inp.click();
}

// Autosave whenever the app goes to the background, so nothing since the last door or battle is lost when iOS puts the game away.
// Skipped on the title, in an opening scene, in a battle, during a cutscene or while a door transition runs (a half-way state).
function hiddenAutosave() {
  try {
    if(typeof splash!=='undefined'&&splash.active) return;
    if(typeof intro!=='undefined'&&intro.active) return;
    if(typeof battle!=='undefined'&&battle.active) return;
    if(typeof cutsceneOn==='function'&&cutsceneOn()) return;
    if(typeof transition!=='undefined'&&transition) return;
    saveGame('auto',true);
  } catch(e) {}
}
document.addEventListener('visibilitychange',()=>{ if(document.hidden) hiddenAutosave(); });
window.addEventListener('pagehide',hiddenAutosave);

// Once per visit, after a manual save, remind the player about the backup when there has never been one or the last is over 14 days old.
let backupTipShown=false;
function backupTip() {
  if(backupTipShown) return; if(typeof syncOn==='function'&&syncOn()) return; const t=lastBackup();
  if(t&&Date.now()-t<14*864e5) return;
  backupTipShown=true; setTimeout(()=>showToast('Tip: BACK UP on the Load page keeps a copy off this phone.',3.6),1900);
}
