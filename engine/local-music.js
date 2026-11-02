'use strict';
// engine/local-music.js — Music takes made on this device in the Music Library (title screen > ADMIN > MUSIC LIBRARY).
// music.html keeps every take in this browser's IndexedDB 'aot-music-library':
//   store 'takes': {key:'<trackId>|<n>', trackId, n, mp3 (Blob), prompt, len, model, dur, date}
//   store 'use':   {trackId, key}  one row per track whose take Tom picked; no row means "Built into the game"
// mcFetch (engine/music-clips.js) asks lmTake(id) before it goes to the network, so a take marked Use plays like any other
// track on this phone. A phone take plays raw (no loudness match, no silence trim), so it can sit louder or softer than the
// built-in tracks until Claude merges it into the repo. Nothing here touches the mp3 files in music/.
// Loaded after engine/music-clips.js (mcFetch looks lmTake up when it runs).
const LOCALMUSIC={use:new Map(),ready:false,error:null};

const lmDb=new Promise(res=>{
  try {
    const q=indexedDB.open('aot-music-library',1);
    q.onupgradeneeded=()=>{ try { const d=q.result;
      if(!d.objectStoreNames.contains('takes')) d.createObjectStore('takes',{keyPath:'key'});
      if(!d.objectStoreNames.contains('use')) d.createObjectStore('use',{keyPath:'trackId'}); } catch(e) {} };
    q.onerror=()=>{ LOCALMUSIC.error='open failed'; res(null); };
    q.onblocked=()=>{ LOCALMUSIC.error='open blocked'; res(null); };
    q.onsuccess=()=>res(q.result);
  } catch(e) { LOCALMUSIC.error=String(e); res(null); }
});
const lmReady=lmDb.then(db=>new Promise(res=>{
  if(!db||!db.objectStoreNames.contains('use')) { LOCALMUSIC.ready=true; return res(); }
  try {
    const q=db.transaction('use').objectStore('use').getAll();
    q.onsuccess=()=>{ for(const r of q.result||[]) if(r&&r.trackId&&r.key) LOCALMUSIC.use.set(r.trackId,r.key); LOCALMUSIC.ready=true; res(); };
    q.onerror=()=>{ LOCALMUSIC.error='read failed'; LOCALMUSIC.ready=true; res(); };
  } catch(e) { LOCALMUSIC.error=String(e); LOCALMUSIC.ready=true; res(); }
}));

// Resolves to the take's bytes (ArrayBuffer) when Tom picked a phone take for this track, otherwise null.
function lmTake(id) {
  return lmReady.then(()=>{
    const key=LOCALMUSIC.use.get(id); if(!key) return null;
    return lmDb.then(db=>new Promise(res=>{
      try {
        const q=db.transaction('takes').objectStore('takes').get(key);
        q.onsuccess=()=>{ const r=q.result; if(!r||!r.mp3) return res(null); const b=r.mp3; res(b.arrayBuffer?b.arrayBuffer().catch(()=>null):null); };
        q.onerror=()=>res(null);
      } catch(e) { res(null); }
    }));
  });
}
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{LOCALMUSIC,lmTake}); });
