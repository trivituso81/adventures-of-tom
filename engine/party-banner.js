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
const PB_MIN=800;    // ms a banner ignores dismissal after it appears (itemdefplay: longer than the 350 ms fade-in, so a late press can never close it half faded)
const PB_GAP=400;    // ms between one dismiss and the next banner
const pbQueue=[];
let pbBusy=false, pbShown=false, pbAt=0, pbTimer=0;
const PB_NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',justin:'Justin',olivia:'Olivia',nara:'Nara'};
function pbEl() {
  let w=document.getElementById('party-banner'); if(w) return w;
  w=document.createElement('div'); w.id='party-banner'; w.setAttribute('role','status'); w.setAttribute('aria-live','polite');
  w.innerHTML='<div class="pb-card"><img class="pb-art" alt=""><img class="pb-face" alt=""><div class="pb-words"><div class="pb-line"></div><div class="pb-note"></div></div>'+
    '<div class="pb-item"><div class="pb-head"><span class="pb-tag">ITEM GAINED</span><span class="pb-page"></span></div><div class="pb-tile"></div>'+
    '<div class="pb-title"><div class="pb-name"></div><div class="pb-type"></div></div><div class="pb-desc"></div>'+
    '<dl class="pb-rows"><dt>IN BATTLE</dt><dd class="pb-battle"></dd><dt>IN STORY</dt><dd class="pb-story"></dd></dl><div class="pb-inote"></div><div class="pb-ihint"></div></div>'+
    '<div class="pb-quest"><div class="pb-head"><span class="pb-qtag"></span><span class="pb-qch"></span></div><div class="pb-seal" aria-hidden="true">!</div>'+
    '<div class="pb-qtitle"></div><div class="pb-qdesc"></div><ul class="pb-qparts"></ul><div class="pb-qnote"></div>'+
    '<div class="pb-qwhere">Your quest is in the tracker at the top left.</div><div class="pb-ihint">Tap or press A to continue</div></div></div>'+
    '<div class="pb-hint">Tap or press A to continue</div>';
  (document.getElementById('game')||document.body).appendChild(w);
  return w;
}
// Original jingles (not any game's tune): join is a bright rising flourish that lands on a held chord; leave falls gently and settles.
const pbSound={
  join(){ [523,659,784,1047].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.14,vol:.15,delay:i*.08}));
    [784,988,1175,1568].forEach((f,i)=>tone({type:'square',f0:f,dur:.12,vol:.06,delay:.34+i*.06}));
    [1047,1319,1568].forEach(f=>tone({type:'triangle',f0:f,dur:.9,vol:.12,delay:.62}));
    tone({type:'sine',f0:2093,dur:.9,vol:.07,delay:.62}); noise({dur:.5,vol:.035,delay:.62,f0:5000,f1:7500}); },
  // itembanner1: a short original two-step sparkle that lands on a bright chord (shorter than join)
  item(){ [698,880,1175].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.12,vol:.14,delay:i*.07}));
    [1397,1760].forEach(f=>tone({type:'triangle',f0:f,dur:.6,vol:.1,delay:.24}));
    tone({type:'sine',f0:2349,dur:.6,vol:.06,delay:.24}); noise({dur:.3,vol:.03,delay:.24,f0:5500,f1:8000}); },
  // questbanner1: an original three-note horn call that rises and rings out (between item and join in length)
  quest(){ [392,523,659].forEach((f,i)=>tone({type:'square',f0:f,dur:.13,vol:.06,delay:i*.11}));
    [392,523,659].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.16,vol:.13,delay:i*.11}));
    [784,988,1175].forEach(f=>tone({type:'triangle',f0:f,dur:.85,vol:.11,delay:.36}));
    tone({type:'sine',f0:1568,dur:.85,vol:.05,delay:.36}); noise({dur:.35,vol:.03,delay:.36,f0:4500,f1:7000}); },
  leave(){ [784,659,523].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.22,vol:.13,delay:i*.16}));
    [392,523,659].forEach(f=>tone({type:'sine',f0:f,dur:.9,vol:.09,delay:.5})); }
};
function partyBanner(id,kind='join',note='') {
  if(!PB_NAMES[id]) return;
  pbQueue.push({id,kind,note});
  if(!pbBusy) pbNext();
}
// itembanner1 (Tom 2026-11-20): "anytime a item is retrieved through conversation with a character or through defeating a character by any means,
// basically similar to the banner that we get when people join and leave the party, we need a banner ... for that item gained."
// itemBanner(ids,note): one ITEM GAINED banner in the same queue as the party banners, held until dismissed, with a jingle; several items from one
// source share one banner. note is the source's line (the monster's drop line, the auto-gear note). It waits while a fight is on screen.
// itemdef1 (Tom 2026-11-20): the banner reads like a JRPG item definition: picture, name and type, a short description, IN BATTLE and IN STORY
// (itemDef in data/item-defs.js). Several items from one source are pages of the same banner: tap or A turns to the next item, the last one closes it.
function itemBanner(ids,note='') {
  ids=(Array.isArray(ids)?ids:[ids]).filter(id=>typeof items!=='undefined'&&items[id]);
  if(!ids.length) return;
  const go=()=>{ if(typeof battle!=='undefined'&&battle.active) { setTimeout(go,500); return; } pbQueue.push({kind:'item',ids,note}); if(!pbBusy) pbNext(); };
  go();
}
// questbanner1 (Tom 2026-11-27): "After a new quest is given, display a new quest interstitial similar to the item, new chapter, or party join/leave interstitial."
// questBanner(q): one NEW QUEST (or SIDE QUEST) banner in the same queue, held until dismissed, with its own jingle. q = {title, desc, parts:[labels], note, side, ch}.
// Called by storySetGoal (engine/story.js) when the story gives a new goal, and by Aunt Ellie's bet (data/ellie-quests.js). It waits while a fight or a
// chapter card is on screen (the wait is outside the queue, so the card is never held). A newer story goal replaces one that is still waiting or queued.
let pbQuestWait=null;
function questBanner(q) {
  if(!q||!q.title) return;
  if(!q.side) {
    const queued=pbQueue.find(b=>b.kind==='quest'&&!b.q.side);
    if(queued) { queued.q=q; return; }
    if(pbQuestWait) { pbQuestWait.q=q; return; }
  }
  const job={q};
  if(!q.side) pbQuestWait=job;
  const go=()=>{
    const busy=(typeof battle!=='undefined'&&battle.active)||(typeof intro!=='undefined'&&intro.card);
    if(busy) { setTimeout(go,400); return; }
    if(pbQuestWait===job) pbQuestWait=null;
    pbQueue.push({kind:'quest',q:job.q}); if(!pbBusy) pbNext();
  };
  go();
}
// itembannerart1 (report r-20261120-142626-w74f, "missing art for all item banners"): the banner shows the item's painted picture (art/items/<id>.webp, listed in
// data/item-art.js once its Art Library sheet is approved and baked) and keeps the item's emoji only for an item with no picture yet or whose file fails to load.
function pbItemEmoji(id) { const e=document.createElement('span'); e.className='pb-emoji'; e.textContent=items[id].icon; return e; }
function pbItemIcon(id) {
  if(typeof ITEM_ART==='undefined'||!ITEM_ART.includes(id)) return pbItemEmoji(id);
  const im=document.createElement('img'); im.alt=''; im.className='pb-pic'; im.dataset.item=id;
  im.onerror=()=>im.replaceWith(pbItemEmoji(id));
  im.src='art/items/'+id+'.webp?v='+ITEM_ART_V;
  return im;
}
let pbItem=null;   // the item banner on screen: {pages:[[id,count]...], at, note}
function pbItemPage() {
  const w=pbEl(),[id,n]=pbItem.pages[pbItem.at],last=pbItem.at===pbItem.pages.length-1;
  const d=typeof itemDef==='function'?itemDef(id):{name:items[id].name,type:'',desc:items[id].desc||'',battle:'',story:''};
  w.querySelector('.pb-tile').replaceChildren(pbItemIcon(id));
  w.querySelector('.pb-name').textContent=d.name+(n>1?' x'+n:'');
  w.querySelector('.pb-type').textContent=d.type;
  w.querySelector('.pb-desc').textContent=d.desc;
  w.querySelector('.pb-battle').textContent=d.battle;
  w.querySelector('.pb-story').textContent=d.story;
  w.querySelector('.pb-page').textContent=pbItem.pages.length>1?(pbItem.at+1)+' of '+pbItem.pages.length:'';
  w.querySelector('.pb-inote').textContent=pbItem.at===0?pbItem.note:'';
  w.querySelector('.pb-ihint').textContent=last?'Tap or press A to continue':'Tap or press A for the next item';
  pbAt=performance.now();
}
function pbNext() {
  const b=pbQueue.shift(); if(!b) { pbBusy=false; return; }
  pbBusy=true;
  if(b.kind==='item') {
    const w=pbEl(); w.classList.remove('painted','leave','quest','side'); w.classList.add('item');
    w.querySelector('.pb-art').removeAttribute('src'); w.querySelector('.pb-face').removeAttribute('src');
    const n=new Map(); b.ids.forEach(id=>n.set(id,(n.get(id)||0)+1));
    pbItem={pages:[...n.entries()],at:0,note:b.note||''};
    pbItemPage();
    w.classList.remove('out'); void w.offsetWidth; w.classList.add('on');
    pbShown=true; pbAt=performance.now();
    if(typeof clearInput==='function') clearInput();
    try { pbSound.item(); } catch(e) {}
    return;
  }
  if(b.kind==='quest') {
    pbItem=null;
    const w=pbEl(),q=b.q; w.classList.remove('painted','leave','item'); w.classList.add('quest'); w.classList.toggle('side',!!q.side);
    w.querySelector('.pb-art').removeAttribute('src'); w.querySelector('.pb-face').removeAttribute('src');
    w.querySelector('.pb-qtag').textContent=q.side?'SIDE QUEST':'NEW QUEST';
    w.querySelector('.pb-qch').textContent=q.ch?'Chapter '+q.ch:'';
    w.querySelector('.pb-qtitle').textContent=q.title;
    w.querySelector('.pb-qdesc').textContent=q.desc||'';
    const ul=w.querySelector('.pb-qparts'); ul.replaceChildren(...(q.parts||[]).map(t=>{ const li=document.createElement('li'); li.textContent=t; return li; }));
    w.querySelector('.pb-qnote').textContent=q.note||'';
    w.querySelector('.pb-qwhere').hidden=!!q.side;
    w.classList.remove('out'); void w.offsetWidth; w.classList.add('on');
    pbShown=true; pbAt=performance.now();
    if(typeof clearInput==='function') clearInput();
    try { pbSound.quest(); } catch(e) {}
    return;
  }
  pbItem=null;
  const w=pbEl(),name=PB_NAMES[b.id],key=b.kind+'-'+b.id;
  w.classList.remove('item','quest','side');
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
  if(pbItem&&pbItem.at<pbItem.pages.length-1) {   // itemdef1: the next item of the same banner
    pbItem.at++; pbItemPage();
    try { if(typeof sfx!=='undefined'&&sfx.select) sfx.select(); } catch(e) {}
    if(typeof clearInput==='function') clearInput();
    return true;
  }
  pbShown=false; pbItem=null;
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
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{itemBanner,questBanner,itemDef:typeof itemDef==='function'?itemDef:null,partyBanner,partyBannerBusy,partyBannerHeld,partyBannerDismiss,pbQueue}); });
