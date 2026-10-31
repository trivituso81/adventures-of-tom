'use strict';
// engine/local-clips.js — Voice clips baked on this device with bake.html (title screen > ADMIN > BAKE VOICES).
// bake.html keeps each clip in this browser's IndexedDB ('aot-local-clips', store 'clips'); this file reads them at startup and
// adds them to the game's clip tables, so a line baked on the phone plays like any other baked line:
//   dialogue clips (kind 'dialog'): looked up by dvClip(speaker, text), exactly like DIALOG_CLIPS (data/voice/dialog-ch*.js)
//   battle clips (kind 'battle'):   added to VOICE_CLIPS.clips[character][lineKind] (engine/speech.js say())
// A phone clip wins over a built-in clip with the same words. Nothing here touches the baked data files in the repo.
// Loaded after engine/dialog-voice.js (wraps dvClip).
const LOCALCLIPS={dialog:new Map(),battle:0,ready:false,error:null};

function lcApply(rows) {
  for(const r of rows) {
    if(!r||!r.mp3||!r.text) continue;
    if(r.kind==='dialog') {
      LOCALCLIPS.dialog.set(r.voice+'|'+r.text,r.mp3);
      if(typeof DIALOG_CLIPS!=='undefined'&&!DIALOG_CLIPS.clips[r.voice+'|'+r.text]) DIALOG_CLIPS.clips[r.voice+'|'+r.text]=r.mp3;
    } else if(r.kind==='battle'&&r.lineKind&&typeof VOICE_CLIPS!=='undefined') {
      const all=VOICE_CLIPS.clips[r.voice]||(VOICE_CLIPS.clips[r.voice]={});
      const arr=all[r.lineKind]||(all[r.lineKind]=[]);
      const entry={text:r.text,mp3:r.mp3,local:true};
      const i=arr.findIndex(c=>c&&c.text===r.text);
      if(i>=0) arr[i]=entry; else arr.push(entry);
      LOCALCLIPS.battle++;
    }
  }
}

// A phone clip beats a built-in clip with the same words.
if(typeof dvClip==='function') {
  const LE_dvClip_lc=dvClip;
  dvClip=function(name,text) {
    const v=typeof dvVoiceOf==='function'?dvVoiceOf(name):null;
    if(v&&typeof text==='string'&&LOCALCLIPS.dialog.size) { const l=LOCALCLIPS.dialog.get(v+'|'+text); if(l) return l; }
    return LE_dvClip_lc(name,text);
  };
}

function lcLoad() {
  try {
    const req=indexedDB.open('aot-local-clips',1);
    req.onupgradeneeded=()=>{ try { req.result.createObjectStore('clips',{keyPath:'id'}); } catch(e) {} };
    req.onerror=()=>{ LOCALCLIPS.error='open failed'; };
    req.onsuccess=()=>{
      try {
        const db=req.result;
        if(!db.objectStoreNames.contains('clips')) { LOCALCLIPS.ready=true; db.close(); return; }
        const q=db.transaction('clips').objectStore('clips').getAll();
        q.onsuccess=()=>{ lcApply(q.result||[]); LOCALCLIPS.ready=true; db.close(); };
        q.onerror=()=>{ LOCALCLIPS.error='read failed'; db.close(); };
      } catch(e) { LOCALCLIPS.error=String(e); }
    };
  } catch(e) { LOCALCLIPS.error=String(e); }
}
lcLoad();
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{LOCALCLIPS,lcApply}); });
