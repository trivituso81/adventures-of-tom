'use strict';
// engine/b3-menu.js — Battle 3: the Vibes screen, and where loadouts are kept (spec section 1).
// The rules for ranks, Vibe Points and the four slots are in engine/b3-progress.js (no page, no saves). This file is the page side.
//
// Two books of loadouts (a loadout is {main, pocket, quirks, vp, row}; a book is one per family member):
//   THE SAVE'S: on each family member object as `m.vibes`. It rides along in every save as two fields per member, `vibes`
//               ({main, pocket, quirks, vp}) and `row`. A save from before these fields existed loads with fresh loadouts.
//               Story fights still use the old battle, so this book earns no Vibe Points yet (that is the stage 15 switch).
//   THE LAB'S:  kept on this device (localStorage 'aot-b3-lab'), because the Battle Lab runs from the title screen with no save
//               loaded. NEW BATTLE fights use it, a Lab win pays Vibe Points into it, and its screen has a Rank picker.
//               A change made on the pause menu's Vibes screen is copied to it (Main, Pocket, row), so what Tom picks in the
//               pause menu is what a Lab fight uses.
// One screen, two doors: the pause menu's VIBES command (b3vOpen('menu')) and NEW BATTLE > VIBES AND RANKS (b3vOpen('lab')).
// It is its own layer over whatever opened it, with its own keys and gamepad: arrows move, Enter or A picks, Esc or B goes
// back, Q and E (L2 and R1) change the family member.

// ---------- The save's book ----------
const b3Member=id=>ALL_MEMBERS().find(m=>m.id===id)||null;
// A family member's loadout, made valid for this build. null for someone whose kit is not built yet.
function b3MemberLoadout(m) {
  if(!m||!b3HasKit(m.id)) return null;
  m.vibes=b3FixLoadout(m.id,m.vibes);
  return m.vibes;
}
const LE_saveSnapshot_b3=saveSnapshot;
saveSnapshot=function() {
  const s=LE_saveSnapshot_b3();
  for(const sm of (s.members||[])) {
    const m=b3Member(sm.id),L=b3MemberLoadout(m)||(m&&m.vibes)||null;   // someone with no kit yet keeps whatever their save held
    if(L) { sm.vibes={main:L.main,pocket:L.pocket,quirks:(L.quirks||[]).slice(),vp:Object.assign({},L.vp)}; sm.row=L.row||null; }
  }
  return s;
};
const LE_loadGame_b3=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot),ok=LE_loadGame_b3(slot);
  if(ok&&sv) b3VibesFromSave(sv);
  return ok;
};
// Every member's loadout from a save. A member the save says nothing about (an old save) gets a fresh one.
function b3VibesFromSave(sv) {
  for(const m of ALL_MEMBERS()) {
    const sm=(sv.members||[]).find(x=>x.id===m.id);
    m.vibes=sm&&sm.vibes&&typeof sm.vibes==='object'?Object.assign({},sm.vibes,{row:sm.row||null}):null;
    b3MemberLoadout(m);
  }
}

// ---------- The Lab's book ----------
const B3_LAB_KEY='aot-b3-lab';
let b3LabStore=null;
function b3LabBook() {
  if(b3LabStore) return b3LabStore;
  let raw=null; try { raw=JSON.parse(localStorage.getItem(B3_LAB_KEY)||'null'); } catch(e) {}
  const book={},had=raw&&raw.book&&typeof raw.book==='object'?raw.book:{};
  for(const id in B3_CAST) if(b3HasKit(id)) book[id]=had[id]?b3FixLoadout(id,had[id]):b3NewLoadout(id,B3_RULES.labRank);
  return b3LabStore=book;
}
function b3LabSave() { try { localStorage.setItem(B3_LAB_KEY,JSON.stringify({v:1,book:b3LabBook()})); } catch(e) {} }
// Back to how the Lab starts: fresh loadouts with every Vibe at `rank` (the Lab's starting Rank when left out). Tests call it
// before a fight so that Vibe Points won earlier never change what a fight starts with.
function b3LabReset(rank) { b3LabStore={}; for(const id in B3_CAST) if(b3HasKit(id)) b3LabStore[id]=b3NewLoadout(id,rank||B3_RULES.labRank); b3LabSave(); return b3LabStore; }
// The Rank the Lab's Vibes are at, when they all share one (the Rank picker lights that button); 0 when they differ.
function b3LabRank() {
  const B=b3LabBook(),rs=new Set(); for(const id in B) for(const v of B3_CAST[id].vibes) rs.add(b3VibeRank(B[id],v));
  return rs.size===1?[...rs][0]:0;
}
// A win in the Lab pays the formation's Vibe Points to everyone in the Lab's book. Returns the line for the win screen.
function b3LabAward(vp) {
  if(!(vp>0)) return '';
  const B=b3LabBook(),R=b3AwardAll(B,vp),ups=[];
  for(const id in R) for(const r of R[id].ranks) ups.push(B3_VIBES[r.vibe].name+' '+r.to);
  b3LabSave();
  return '+'+vp+' Vibe Points (Pocket Vibes +'+Math.round(vp*B3_RULES.pocketVp)+').'+(ups.length?' Rank up: '+ups.join(', ')+'.':'');
}
// What the pause menu's screen changes is copied here: the Vibes and the row, not the Vibe Points (the Lab has its own Ranks).
function b3LabFollow(id,L) {
  const B=b3LabBook(); if(!B[id]) return;
  B[id]=b3FixLoadout(id,Object.assign({},B[id],{main:L.main,pocket:L.pocket,row:L.row}));
  b3LabSave();
}

// ---------- The screen ----------
const B3V={open:false,door:null,ids:[],sel:0,pick:null,say:'',keys:false,dirty:false,focus:null};
const b3vEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function b3vBox() {
  let box=document.getElementById('b3-vibes'); if(box) return box;
  box=el('div','b3v'); box.id='b3-vibes'; box.hidden=true;
  box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Vibes');
  box.innerHTML='<div class="b3v-panel mwin" tabindex="-1"><div class="b3v-head"></div><div class="b3v-who" role="tablist" aria-label="Family member"></div>'+
    '<div class="b3v-body"></div><div class="b3v-say" aria-live="polite"></div></div>';
  document.getElementById('stage').appendChild(box);   // beside the pause menu and the battle, so it turns with the stage and sits over both doors
  box.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') B3V.keys=false; });
  // The line at the bottom follows the cursor: whatever button has the focus, or the mouse over it, says what it is.
  const tell=e=>{ const b=e.target.closest&&e.target.closest('[data-say]'); if(b) b3vSay(b.dataset.say,true); };
  box.addEventListener('focusin',tell); box.addEventListener('mouseover',tell);
  return box;
}
// Who the screen is about, and whose book it edits.
function b3vLoadout(id) { return B3V.door==='lab'?b3LabBook()[id]||null:b3MemberLoadout(b3Member(id)); }
function b3vName(id) { return (B3_CAST[id]&&B3_CAST[id].name)||((b3Member(id)||{}).name)||id; }
function b3vOpen(door) {
  if(B3V.open) return;
  B3V.door=door==='lab'?'lab':'menu';
  // The Lab: the four who fight there, in family order. The pause menu: the party, in its order.
  B3V.ids=B3V.door==='lab'?ALL_MEMBERS().map(m=>m.id).filter(id=>b3HasKit(id)&&B3_LAB.some(L=>L.party.includes(id))):party.map(m=>m.id);
  if(!B3V.ids.length) return;
  Object.assign(B3V,{open:true,sel:B3V.door==='menu'&&typeof menuChar!=='undefined'?Math.min(menuChar,B3V.ids.length-1):0,pick:null,say:'',dirty:false,focus:null,
    keys:B3V.door==='menu'&&typeof menuKeyNav!=='undefined'&&menuKeyNav});
  if(typeof sfx!=='undefined') sfx.menuOpen();
  const box=b3vBox(); box.hidden=false;
  if(typeof menuZoom==='function') box.style.zoom=menuZoom()>1?menuZ.toFixed(3):'';
  b3vRender();
  if(B3V.keys) b3vFocusFirst(); else box.querySelector('.b3v-panel').focus({preventScroll:true});
}
function b3vClose() {
  if(!B3V.open) return;
  B3V.open=false; B3V.pick=null;
  b3vBox().hidden=true;
  if(typeof sfx!=='undefined') sfx.menuClose();
  if(B3V.door==='lab') { splashSetMode('lab3',Math.max(0,(splash.list||[]).findIndex(c=>c.vibes))); return; }
  // The pause menu: the change goes into the autosave, the way a Stampcard change does.
  if(B3V.dirty&&typeof saveGame==='function') saveGame('auto',true);
  if(typeof menuOpen!=='undefined'&&menuOpen) { menuFocusNext=B3V.keys?'cmd-vibes':null; menuKeyNav=B3V.keys; renderMenu(); if(!B3V.keys) $('menu-panel').focus({preventScroll:true}); }
}
function b3vSay(text,quiet) { B3V.say=text||''; const s=document.querySelector('#b3-vibes .b3v-say'); if(s) s.textContent=B3V.say; if(!quiet&&typeof sfx!=='undefined') sfx.select(); }
// A change was made: keep it (the Lab's book on the device at once; the save's with the next autosave) and redraw.
function b3vChanged(id,text,top) {
  const L=b3vLoadout(id);
  if(B3V.door==='lab') b3LabSave(); else { B3V.dirty=true; b3LabFollow(id,L); }
  B3V.say=text||''; if(typeof sfx!=='undefined') sfx.select();
  b3vRender();
  if(top) { const bd=document.querySelector('#b3-vibes .b3v-body'); if(bd) bd.scrollTop=0; }   // the cards changed places: show the new Main Vibe
}
function b3vNope(text) { B3V.say=text; if(typeof sfx!=='undefined') sfx.nope(); const s=document.querySelector('#b3-vibes .b3v-say'); if(s) s.textContent=text; }

// ---------- What each button does ----------
function b3vMain(id,v) { const L=b3vLoadout(id),V=B3_VIBES[v]; if(b3SetMain(id,L,v)) b3vChanged(id,V.name+' is now '+b3vName(id)+'’s Main Vibe: its Trait, its Basic, its Skills and its '+B3_LEANS[V.lean].name+' Lean.',true); }
function b3vPocket(id,v) { const L=b3vLoadout(id),V=B3_VIBES[v]; if(b3SetPocket(id,L,v)) b3vChanged(id,V.name+' is now '+b3vName(id)+'’s Pocket Vibe: it adds its Skills.',true); }
function b3vRow(id,row) {
  const L=b3vLoadout(id); if(b3RowOf(L)===row) return;
  // At least one of the family stands in Front (spec 2.1).
  if(row==='back'&&!B3V.ids.some(o=>o!==id&&b3vLoadout(o)&&b3RowOf(b3vLoadout(o))==='front')) { b3vNope('Someone has to stand in Front. Move another family member to the Front first.'); return; }
  b3SetRow(L,row);   // a row the player picked stays picked, whatever Vibe becomes Main later
  b3vChanged(id,b3vName(id)+' now stands in '+(row==='back'?'Back. Monsters aim there less often, and a Clobber hit aimed at one person lands 20% weaker.':'Front.'));
}
function b3vQuirk(id,slot,q) {
  const L=b3vLoadout(id); B3V.pick=null;
  if(b3SetQuirk(id,L,slot,q)) b3vChanged(id,q?B3_QUIRKS[q].name+' is in Quirk slot '+(slot+1)+'.':'Quirk slot '+(slot+1)+' is empty.'); else b3vRender();
}
function b3vRankAll(rank) {
  const B=b3LabBook(); for(const id in B) b3SetRank(id,B[id],rank);
  b3LabSave(); B3V.say='Every Vibe in the Battle Lab is now Rank '+rank+'.'; if(typeof sfx!=='undefined') sfx.select(); b3vRender();
}
function b3vWho(i) { if(i===B3V.sel) return; B3V.sel=i; B3V.pick=null; B3V.say=''; if(typeof sfx!=='undefined') sfx.tab(); B3V.focus='who-'+i; b3vRender(); const b=document.querySelector('#b3-vibes .b3v-body'); if(b) b.scrollTop=0; }
function b3vCycle(d) { const n=B3V.ids.length; if(n>1) b3vWho((B3V.sel+d+n)%n); }
function b3vBack() { if(B3V.pick!=null) { const k='quirk-'+B3V.pick; B3V.pick=null; B3V.focus=k; if(typeof sfx!=='undefined') sfx.tab(); b3vRender(); } else b3vClose(); }

// ---------- Drawing ----------
const b3vStars=rank=>Array.from({length:b3MaxRank()},(_,i)=>'<i'+(i<rank?' class="on"':'')+'>★</i>').join('');
// The sentence the bottom line says about one row of a Vibe's ladder.
function b3vRowSay(r,V,role) {
  const lock=r.open?'':' Unlocks at Rank '+r.rank+' ('+B3_RULES.rankVp[r.rank-1]+' Vibe Points).';
  if(r.kind==='trait') { const T=B3_TRAITS[r.id]; return 'Trait. '+T.desc+(role==='main'?'':' A Trait works only while its Vibe is the Main Vibe.')+(r.built?'':' Not working in this build yet.'); }
  if(r.kind==='quirk') { const Q=B3_QUIRKS[r.id]; return 'Quirk. '+Q.desc+lock+(r.built?'':' Not working in this build yet.'); }
  const S=B3_SKILLS[r.id];
  if(!S) return (r.kind==='cap'?'Grand Capstone. ':'Skill. ')+'Not in this build yet.'+lock;
  if(r.kind==='basic') return 'Basic Action, free, gives 2 Pep. '+S.desc+(role==='main'?'':' A Basic comes only from the Main Vibe.');
  return (r.kind==='cap'?'Grand Capstone, ':'Skill, ')+S.pep+' Pep. '+S.desc+lock;
}
function b3vCard(id,L,V) {
  const rank=b3VibeRank(L,V.id),vp=L.vp[V.id]||0,role=L.main===V.id?'main':L.pocket===V.id?'pocket':'none',T=B3_RULES.rankVp,M=b3MasterVp();
  const card=el('div','b3v-card '+role),ln=B3_LEANS[V.lean];
  const next=rank<b3MaxRank()?T[rank]:M,from=T[rank-1],frac=rank>=b3MaxRank()?1:(vp-from)/(next-from);
  card.appendChild(el('div','b3v-ct','<span class="b3v-role">'+(role==='main'?'MAIN VIBE':role==='pocket'?'POCKET VIBE':'NOT EQUIPPED')+'</span><b>'+b3vEsc(V.name)+'</b>'+
    '<span class="b3v-stars" aria-label="Rank '+rank+' of '+b3MaxRank()+'">'+b3vStars(rank)+'</span>'));
  card.appendChild(el('div','b3v-sub','<em>'+b3vEsc(b3Subtitle(V,rank))+'</em><span>'+ln.name+' Lean: '+ln.desc+(role==='main'?'':' (as Main Vibe)')+'</span>'));
  card.appendChild(el('div','b3v-vp','<span>RANK '+rank+'</span><span class="b3v-bar"><i style="width:'+Math.round(Math.max(0,Math.min(1,frac))*100)+'%"></i></span><span>'+
    (rank>=b3MaxRank()?'MASTERED':vp+' / '+next+' VP')+'</span>'));
  const list=el('div','b3v-ladder');
  for(const r of b3Ladder(V,rank)) {
    // As Pocket Vibe only the Skills count; with the Vibe not equipped nothing does.
    const live=r.open&&r.built&&(role==='main'?true:role==='pocket'?(r.kind==='skill'||r.kind==='cap'):false);
    const S=B3_SKILLS[r.id],tag=r.kind==='trait'?'TRAIT':r.kind==='basic'?'BASIC':r.kind==='cap'?'CAPSTONE':r.kind==='quirk'?'QUIRK '+r.slot.toUpperCase():'SKILL';
    const note=!r.open?'RANK '+r.rank:!r.built?'SOON':r.kind==='quirk'?(L.quirks.includes(r.id)?'EQUIPPED':''):(S&&S.pep?S.pep+' PEP':'');
    const b=btn('b3v-row'+(live?' live':'')+(r.open?'':' locked')+(r.built?'':' soon'),'row-'+V.id+'-'+r.id,
      '<i>'+r.rank+'</i><small>'+tag+'</small><span>'+b3vEsc(r.name)+'</span>'+(note?'<em>'+note+'</em>':''),()=>b3vSay(b3vRowSay(r,V,role)));
    b.dataset.say=b3vRowSay(r,V,role);
    list.appendChild(b);
  }
  card.appendChild(list);
  const acts=el('div','b3v-acts');
  const mb=btn('b3v-act'+(role==='main'?' on':''),'main-'+V.id,role==='main'?'MAIN VIBE':'MAKE MAIN',()=>role==='main'?b3vSay(V.name+' is already the Main Vibe.'):b3vMain(id,V.id));
  mb.dataset.say=role==='main'?V.name+' is the Main Vibe: its Trait, its Basic, its Skills and its Lean are in use.':'Make '+V.name+' the Main Vibe: its Trait, its Basic, its Skills and its Lean.'+(role==='pocket'?' The two Vibes trade places.':'');
  const pb=btn('b3v-act'+(role==='pocket'?' on':''),'pocket-'+V.id,role==='pocket'?'POCKET VIBE':'MAKE POCKET',()=>role==='pocket'?b3vSay(V.name+' is already the Pocket Vibe.'):b3vPocket(id,V.id));
  pb.dataset.say=role==='pocket'?V.name+' is the Pocket Vibe: it adds its Skills. It earns half the Vibe Points of a fight.':'Make '+V.name+' the Pocket Vibe: it adds its Skills, not its Basic or its Trait.'+(role==='main'?' The two Vibes trade places.':'');
  acts.appendChild(mb); acts.appendChild(pb); card.appendChild(acts);
  return card;
}
function b3vRender() {
  const box=b3vBox(),id=B3V.ids[B3V.sel],L=b3vLoadout(id),lab=B3V.door==='lab';
  const ae=document.activeElement,keep=B3V.focus||(B3V.keys&&ae&&box.contains(ae)&&ae.dataset?ae.dataset.k:null); B3V.focus=null;
  const body=box.querySelector('.b3v-body'),top=body.scrollTop;
  // Head: the title, where these Vibes are used, CLOSE.
  const head=box.querySelector('.b3v-head'); head.innerHTML='';
  head.appendChild(el('div','b3v-title','<b>VIBES</b><span>'+(lab?'Battle Lab. Used in every NEW BATTLE fight.':'Story fights still use the old battle. For now these are used in ADMIN, BATTLE LAB, NEW BATTLE.')+'</span>'));
  const cb=btn('b3v-close','close','CLOSE',b3vClose); cb.dataset.say='Close the Vibes screen.'; head.appendChild(cb);
  // Family tabs.
  const who=box.querySelector('.b3v-who'); who.innerHTML='';
  B3V.ids.forEach((mid,i)=>{
    const img=typeof b2Portrait==='function'?b2Portrait(mid):'',Lm=b3vLoadout(mid);
    const b=btn('b3v-tab'+(i===B3V.sel?' active':''),'who-'+i,(img?'<img alt="" src="'+img+'">':'')+'<span>'+b3vEsc(b3vName(mid).toUpperCase())+'</span>',()=>b3vWho(i));
    b.setAttribute('role','tab'); b.setAttribute('aria-selected',i===B3V.sel);
    b.dataset.say=Lm?b3vName(mid)+': '+B3_VIBES[Lm.main].name+(Lm.pocket?' with '+B3_VIBES[Lm.pocket].name+' in the Pocket.':'.'):b3vName(mid)+'’s Vibes are not in this build yet.';
    who.appendChild(b);
  });
  body.innerHTML='';
  if(lab) {
    // The Lab's Rank picker: every Vibe of everyone at one Rank.
    const cur=b3LabRank(),row=el('div','b3v-rank','<span>RANK FOR EVERY VIBE</span>');
    for(let r=1;r<=b3MaxRank();r++) { const b=btn('b3v-rk'+(r===cur?' on':''),'rank-'+r,String(r),()=>b3vRankAll(r));
      b.setAttribute('aria-label','Rank '+r); b.dataset.say='Set every Vibe of all four to Rank '+r+' ('+B3_RULES.rankVp[r-1]+' Vibe Points). Lab wins add Vibe Points on top.'; row.appendChild(b); }
    body.appendChild(row);
  }
  if(!L) body.appendChild(el('div','b3v-none',b3vEsc(b3vName(id))+'’s Vibes are not in this build yet. They arrive with a later build of the new battle.'));
  else if(B3V.pick!=null) {
    // Choosing a Quirk for one slot.
    const slot=B3V.pick,pool=b3QuirkPool(id,L),wrap=el('div','b3v-pick');
    wrap.appendChild(el('div','b3v-h','QUIRK SLOT '+(slot+1)+': PICK ONE'));
    for(const q of pool) { const Q=B3_QUIRKS[q],at=L.quirks.indexOf(q);
      const b=btn('b3v-q'+(at===slot?' on':''),'pick-'+q,'<b>'+b3vEsc(Q.name)+'</b><small>'+b3vEsc(B3_VIBES[Q.vibe].name)+(at===slot?' · in this slot':at>=0?' · in slot '+(at+1)+', picking it trades the two':'')+(Q.soon?' · not working yet':'')+'</small><span>'+b3vEsc(Q.desc)+'</span>',()=>b3vQuirk(id,slot,q));
      b.dataset.say=Q.desc; wrap.appendChild(b); }
    const e=btn('b3v-q empty','pick-empty','<b>EMPTY</b><span>Leave this slot empty.</span>',()=>b3vQuirk(id,slot,null)); e.dataset.say='Leave Quirk slot '+(slot+1)+' empty.'; wrap.appendChild(e);
    const bk=btn('b3v-q back','pick-back','<b>BACK</b>',b3vBack); bk.dataset.say='Back to '+b3vName(id)+'’s Vibes.'; wrap.appendChild(bk);
    body.appendChild(wrap);
  } else {
    const cards=el('div','b3v-cards');
    // The Main Vibe first, then the Pocket Vibe, then any Vibe that is not equipped.
    const order=B3_CAST[id].vibes.slice().sort((a,b)=>(a===L.main?0:a===L.pocket?1:2)-(b===L.main?0:b===L.pocket?1:2));
    for(const v of order) cards.appendChild(b3vCard(id,L,B3_VIBES[v]));
    body.appendChild(cards);
    // Quirk slots.
    const pool=b3QuirkPool(id,L),qs=el('div','b3v-sec');
    qs.appendChild(el('div','b3v-h','QUIRKS'+(pool.length?'':' <small>The first one unlocks when a Vibe reaches Rank '+B3_RULES.rankUnlock.quirkA+'.</small>')));
    const qrow=el('div','b3v-slots');
    L.quirks.forEach((q,i)=>{ const Q=q&&B3_QUIRKS[q];
      const b=btn('b3v-slot'+(Q?' on':''),'quirk-'+i,'<small>SLOT '+(i+1)+'</small><b>'+(Q?b3vEsc(Q.name):'Empty')+'</b>',()=>{
        if(!pool.length) { b3vNope('No Quirk is unlocked yet. The first one comes when a Vibe reaches Rank '+B3_RULES.rankUnlock.quirkA+' ('+B3_RULES.rankVp[B3_RULES.rankUnlock.quirkA-1]+' Vibe Points).'); return; }
        B3V.pick=i; B3V.focus=q?'pick-'+q:'pick-'+pool[0]; B3V.say='Pick a Quirk for slot '+(i+1)+'. Any Quirk '+b3vName(id)+' has unlocked, from any of their Vibes.'; if(typeof sfx!=='undefined') sfx.select(); b3vRender(); const bd=document.querySelector('#b3-vibes .b3v-body'); if(bd) bd.scrollTop=0; });
      b.dataset.say=Q?'Quirk slot '+(i+1)+': '+Q.name+'. '+Q.desc:'Quirk slot '+(i+1)+' is empty.'+(pool.length?' Tap to pick a Quirk.':'');
      qrow.appendChild(b); });
    qs.appendChild(qrow); body.appendChild(qs);
    // The row.
    const rs=el('div','b3v-sec'),cur=b3RowOf(L),def=B3_RULES.rowByLean[B3_VIBES[L.main].lean];
    rs.appendChild(el('div','b3v-h','ROW <small>'+B3_LEANS[B3_VIBES[L.main].lean].name+' Vibes start in '+(def==='back'?'Back':'Front')+'.</small>'));
    const rrow=el('div','b3v-slots');
    for(const r of ['front','back']) { const b=btn('b3v-slot'+(cur===r?' on':''),'rowpick-'+r,'<b>'+(r==='front'?'FRONT':'BACK')+'</b>',()=>cur===r?b3vSay(b3vName(id)+' already stands in '+(r==='front'?'Front.':'Back.')):b3vRow(id,r));
      b.dataset.say=r==='front'?'Front row: monsters aim here most.':'Back row: monsters aim here less often, and a Clobber hit aimed at one person lands 20% weaker. Someone has to stay in Front.';
      rrow.appendChild(b); }
    rs.appendChild(rrow); body.appendChild(rs);
  }
  box.querySelector('.b3v-say').textContent=B3V.say||(L?'Tap anything to read what it does.':'');
  body.scrollTop=top;
  if(keep) { const f=box.querySelector('[data-k="'+keep+'"]')||box.querySelector('.b3v-tab.active'); if(f) { f.focus({preventScroll:true}); f.scrollIntoView({block:'nearest'}); } }
}

// ---------- Keys and gamepad ----------
const b3vButtons=()=>[...document.querySelectorAll('#b3-vibes button')].filter(b=>!b.disabled&&b.offsetParent!==null);
function b3vFocusFirst() { const f=document.querySelector('#b3-vibes .b3v-tab.active')||b3vButtons()[0]; if(f) f.focus({preventScroll:true}); }
// The nearest button in the pressed direction (the pause menu's rule, engine/menu.js menuMove).
function b3vMove(dir) {
  B3V.keys=true;
  const all=b3vButtons(),cur=document.activeElement;
  if(!all.includes(cur)) { b3vFocusFirst(); if(typeof sfx!=='undefined') sfx.move(); return; }
  // Button boxes as the player sees them. When the stage is turned a quarter turn (landscape on an upright phone) the page's
  // boxes are turned back first: the player's right is the page's down, the player's down is the page's left.
  const rot=typeof layout!=='undefined'&&layout.rotated;
  const box=b=>{ const r=b.getBoundingClientRect(); return rot?{left:r.top,right:r.bottom,top:-r.right,bottom:-r.left}:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}; };
  const a=box(cur),cx=(a.left+a.right)/2,cy=(a.top+a.bottom)/2;
  let best=null,bd=Infinity;
  for(const b of all) {
    if(b===cur) continue;
    const r=box(b),x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;
    const gx=Math.max(0,r.left-a.right,a.left-r.right),gy=Math.max(0,r.top-a.bottom,a.top-r.bottom);
    let main,cross;
    if(dir==='up') { if(r.bottom>a.top+2) continue; main=gy; cross=gx; }
    else if(dir==='down') { if(r.top<a.bottom-2) continue; main=gy; cross=gx; }
    else if(dir==='left') { if(r.right>a.left+2||gy>0) continue; main=gx; cross=gy; }
    else { if(r.left<a.right-2||gy>0) continue; main=gx; cross=gy; }
    const d=main+cross*3+Math.abs(dir==='up'||dir==='down'?x-cx:y-cy)*.05;
    if(d<bd) { bd=d; best=b; }
  }
  if(!best) return;
  if(typeof sfx!=='undefined') sfx.move();
  best.focus({preventScroll:true}); best.scrollIntoView({block:'nearest'});
}
// Keys go to this screen first while it is open (capture), so the title screen, the pause menu and the map never see them.
window.addEventListener('keydown',e=>{
  if(!B3V.open||e.code==='KeyL') return;
  e.stopImmediatePropagation();
  const c=e.code,dirs={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  if(dirs[c]) { e.preventDefault(); b3vMove(dirs[c]); }
  else if(c==='KeyQ'||c==='BracketLeft') { e.preventDefault(); B3V.keys=true; if(!e.repeat) b3vCycle(-1); }
  else if(c==='KeyE'||c==='BracketRight') { e.preventDefault(); B3V.keys=true; if(!e.repeat) b3vCycle(1); }
  else if(c==='Escape'||c==='Backspace'||c==='KeyX') { e.preventDefault(); if(!e.repeat) b3vBack(); }
  else if(c==='Enter'||c==='Space') { B3V.keys=true; if(!b3vButtons().includes(document.activeElement)) { e.preventDefault(); b3vFocusFirst(); } }   // on a button the browser clicks it
  else if(c==='KeyM') { e.preventDefault(); }
},true);
// Called from pollGamepad (engine/main.js) while the screen is open.
function b3vPad(dir,dirEdge,A,B,prev,next) {
  if(dirEdge&&dir) b3vMove(dir);
  if(A) { B3V.keys=true; const f=document.activeElement; if(b3vButtons().includes(f)) f.click(); else b3vFocusFirst(); }
  else if(B) b3vBack();
  if(prev) { B3V.keys=true; b3vCycle(-1); }
  if(next) { B3V.keys=true; b3vCycle(1); }
}
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3V,b3vOpen,b3vClose,b3vPad,b3LabBook,b3LabSave,b3LabReset,b3LabAward,b3LabRank,b3MemberLoadout,b3VibesFromSave,b3Member}); });
