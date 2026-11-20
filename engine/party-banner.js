'use strict';
// engine/party-banner.js: the JOIN and LEAVE banners (partybanner1, Tom 2026-11-18 15:42 and 15:43).
// "we need art for whenever any character joins the party ... they should never be combined. if multiple people join the party at once, each
// banner should be displayed sequentially (not at the same time) there should also be a sound that plays when a character joins the party,
// like in final fantasy" and "we also need the same thing for when someone leaves the party".
// partyBanner(id,'join'|'leave',note): queues one banner per person; they show one after another, each with its jingle, each held until dismissed (bannerhold1). The painting is
// art/banners/<kind>-<id>.webp once its Art Library entry (group "Party banners", banner-<kind>-<id>) is approved and baked
// (tools/art-library/bake_partybanners.py writes the files and data/party-banners.js); until then a stand-in ribbon with the person's
// talk face is shown. The words are always the game's own (the paintings have none).
// bannerhold1 (Tom 2026-11-19): a banner HOLDS the game. While one is on screen nothing else can be done: the world, scenes and dialogue wait, every
// key, tap and pad button is swallowed, until the player dismisses it (tap, A, Enter, Space, Escape, any gamepad A or B). Queued banners each need
// their own dismiss. PB_MIN keeps the press that ended the line before it from dismissing the banner by accident.
const PB_MIN=450;    // ms a banner ignores dismissal after it appears
const PB_GAP=400;    // ms between one dismiss and the next banner
const pbQueue=[];
let pbBusy=false, pbShown=false, pbAt=0, pbTimer=0;
const PB_NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',justin:'Justin',olivia:'Olivia',nara:'Nara'};
function pbEl() {
  let w=document.getElementById('party-banner'); if(w) return w;
  w=document.createElement('div'); w.id='party-banner'; w.setAttribute('role','status'); w.setAttribute('aria-live','polite');
  w.innerHTML='<div class="pb-card"><img class="pb-art" alt=""><img class="pb-face" alt=""><div class="pb-words"><div class="pb-line"></div><div class="pb-note"></div></div></div><div class="pb-hint">Tap or press A to continue</div>';
  (document.getElementById('game')||document.body).appendChild(w);
  return w;
}
// Original jingles (not any game's tune): join is a bright rising flourish that lands on a held chord; leave falls gently and settles.
const pbSound={
  join(){ [523,659,784,1047].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.14,vol:.15,delay:i*.08}));
    [784,988,1175,1568].forEach((f,i)=>tone({type:'square',f0:f,dur:.12,vol:.06,delay:.34+i*.06}));
    [1047,1319,1568].forEach(f=>tone({type:'triangle',f0:f,dur:.9,vol:.12,delay:.62}));
    tone({type:'sine',f0:2093,dur:.9,vol:.07,delay:.62}); noise({dur:.5,vol:.035,delay:.62,f0:5000,f1:7500}); },
  leave(){ [784,659,523].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.22,vol:.13,delay:i*.16}));
    [392,523,659].forEach(f=>tone({type:'sine',f0:f,dur:.9,vol:.09,delay:.5})); }
};
function partyBanner(id,kind='join',note='') {
  if(!PB_NAMES[id]) return;
  pbQueue.push({id,kind,note});
  if(!pbBusy) pbNext();
}
function pbNext() {
  const b=pbQueue.shift(); if(!b) { pbBusy=false; return; }
  pbBusy=true;
  const w=pbEl(),name=PB_NAMES[b.id],key=b.kind+'-'+b.id;
  const has=typeof PARTY_BANNERS!=='undefined'&&PARTY_BANNERS.includes(key);
  const art=w.querySelector('.pb-art'),face=w.querySelector('.pb-face');
  w.classList.toggle('painted',has);
  if(has) { art.src='art/banners/'+key+'.webp?v='+(typeof PARTY_BANNERS_V!=='undefined'?PARTY_BANNERS_V:'1'); face.removeAttribute('src'); }
  else { art.removeAttribute('src'); const f=typeof dialogPortraitSrc==='function'?dialogPortraitSrc(b.id):'portraits/talk/'+b.id+'.webp'; if(f) face.src=f; else face.removeAttribute('src'); }
  w.querySelector('.pb-line').textContent=b.kind==='join'?name+' joined the party!':name+' left the party.';
  w.querySelector('.pb-note').textContent=b.note||'';
  w.classList.toggle('leave',b.kind==='leave');
  w.classList.remove('out'); void w.offsetWidth; w.classList.add('on');
  pbShown=true; pbAt=performance.now();
  if(typeof clearInput==='function') clearInput();   // nothing held down from before keeps walking after the banner
  try { pbSound[b.kind](); } catch(e) {}
}
// Dismiss the banner on screen (ignored in its first PB_MIN ms). The next queued banner follows after PB_GAP; with none queued the game is free at once.
function partyBannerDismiss() {
  if(!pbShown||performance.now()-pbAt<PB_MIN) return false;
  pbShown=false;
  const w=pbEl(); w.classList.add('out'); w.classList.remove('on');
  try { if(typeof sfx!=='undefined'&&sfx.select) sfx.select(); } catch(e) {}
  if(typeof clearInput==='function') clearInput();
  if(pbQueue.length) { clearTimeout(pbTimer); pbTimer=setTimeout(pbNext,PB_GAP); } else pbBusy=false;
  return true;
}
function partyBannerBusy() { return pbBusy||pbQueue.length>0; }
function partyBannerHeld() { return pbBusy||pbShown||pbQueue.length>0; }   // true from the first banner to the last dismiss: the game is on hold
// Swallow every input while a banner holds the game (capture phase on window, so nothing underneath ever sees it).
(function(){
  const stop=e=>{ e.stopImmediatePropagation(); if(e.cancelable) e.preventDefault(); };
  const OK={Enter:1,Space:1,Escape:1,KeyZ:1,KeyX:1};
  window.addEventListener('keydown',e=>{ if(!partyBannerHeld()) return; stop(e); if(OK[e.code]&&!e.repeat) partyBannerDismiss(); },true);
  window.addEventListener('keypress',e=>{ if(partyBannerHeld()) stop(e); },true);
  for(const t of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchmove','contextmenu']) window.addEventListener(t,e=>{ if(partyBannerHeld()) stop(e); },{capture:true,passive:false});
  for(const t of ['touchend','click']) window.addEventListener(t,e=>{ if(!partyBannerHeld()) return; stop(e); partyBannerDismiss(); },{capture:true,passive:false});
})();
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{partyBanner,partyBannerBusy,partyBannerHeld,partyBannerDismiss,pbQueue}); });
