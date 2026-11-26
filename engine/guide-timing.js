'use strict';
// engine/guide-timing.js (guidetime1, 2026-11-26): the engine step that reads the contact moment (contactSec) and the hit stop (hitStopFrames)
// of every move from data/guide-manifest.json (tools/guidegen/manifest_crosswalk.py writes it from the Stage 2A manifests).
// The numbers become the same meta rows engine/pass1-vfx.js already plays (impact_ms, hit_stop_frames, vfx), so the hit lands on the manifest's
// contact time, the picture holds for the manifest's frames, and the move's Stage 2C library effects draw on it.
// A clip that already has a row in data/pass1-meta.js keeps that row: those numbers were measured on the baked video (pass1_meta.py), the
// manifest's are the plan. gtMeta() answers null until the file has loaded and for a clip the manifest does not name, and p1Meta() then
// answers null as before: everything stays a no-op, nothing here can stop a fight.
const GT={by:null,loaded:false,n:0};
// Build the rows from the parsed manifest. A move with no usable contactSec (a number, 0 or more) is left out.
function gtUse(doc){
  const by={}; let n=0;
  for(const m of (doc&&doc.moves)||[]){
    const c=m&&m.contactSec, h=m&&m.hitStopFrames;
    if(!m||!m.manifestId||typeof c!=='number'||!isFinite(c)||c<0) continue;
    by[m.manifestId]={impact_ms:Math.round(c*1000),hit_stop_frames:(typeof h==='number'&&isFinite(h)&&h>0)?Math.round(h):0,screen_shake_px:0,approach:false,vfx:(m.libraryAssets||[]).slice(),from:'manifest'};
    if(m.effectParams&&typeof m.effectParams==='object') by[m.manifestId].fxp=m.effectParams;   // which mode of a set-piece this move draws (the crosswalk's EFFECT_PARAMS)
    n++;
  }
  GT.by=by; GT.n=n; GT.loaded=true; return n;
}
// key: a clip id as pass1-vfx.js keys it (pf-justin-bb-basic, or the manifest id justin-bb-basic).
function gtMeta(key){ return GT.by?GT.by[String(key).replace(/_/g,'-').replace(/^pf-/,'')]||null:null; }
// Read the file once, in the background. No ?v= on the address: the service worker serves its saved copy only after the server says it is unchanged.
function gtLoad(url){
  if(typeof fetch!=='function') return Promise.resolve(0);
  return fetch(url||'data/guide-manifest.json').then(r=>r.ok?r.json():null).then(j=>j?gtUse(j):0).catch(()=>0);
}
if(typeof location!=='undefined'&&typeof document!=='undefined') gtLoad();
