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
  const t=lastBackup();
  return 'Saves are kept on this phone. '+(t?'Last backup: '+new Date(t).toLocaleDateString()+'.':'No backup yet. Tap BACK UP to keep a copy off this phone.');
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

// Returns {restored,kept,bad}: restored slots were written, kept slots already had a newer copy, bad entries were unreadable.
function restoreFromText(text) {
  let obj; try { obj=JSON.parse(text); } catch(e) { return null; }
  if(!obj||obj.app!==BACKUP_APP||!obj.slots||typeof obj.slots!=='object') return null;
  const res={restored:0,kept:0,bad:0};
  for(const s of BACKUP_SLOT_IDS()) {
    const raw=obj.slots[s]; if(raw==null) continue;
    let sv=null; try { sv=JSON.parse(raw); } catch(e) {}
    if(typeof raw!=='string'||!sv||!Array.isArray(sv.party)||typeof sv.map!=='string'||typeof sv.when!=='number') { res.bad++; continue; }
    if(saveWhen(saveRaw(s))>=sv.when) { res.kept++; continue; }
    SAVE_CACHE[s]=raw;
    try { localStorage.setItem(SAVE_PREFIX+s,raw); } catch(e) { res.bad++; continue; }
    res.restored++;
  }
  return res;
}
function restoreSummary(r) {
  if(!r) return 'That file isn\'t a saves backup from this game.';
  if(!r.restored&&!r.kept&&!r.bad) return 'That backup has no saves in it.';
  return (r.restored?'Restored '+r.restored+(r.restored===1?' save':' saves')+'.':'Nothing restored.')
    +(r.kept?' '+r.kept+(r.kept===1?' save here was':' saves here were')+' newer, so '+(r.kept===1?'it was':'they were')+' kept.':'')
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
  if(backupTipShown) return; const t=lastBackup();
  if(t&&Date.now()-t<14*864e5) return;
  backupTipShown=true; setTimeout(()=>showToast('Tip: BACK UP on the Load page keeps a copy off this phone.',3.6),1900);
}
