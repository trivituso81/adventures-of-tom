'use strict';
// engine/b3-menu.js — Battle 3: where loadouts are kept (spec section 1). The Vibes page is in engine/m2-vibes.js (card c-menu4 removed this file's own Vibes screen).
// The rules for ranks, Vibe Points and the four slots are in engine/b3-progress.js (no page, no saves). This file keeps the books and the save.
//
// Two books of loadouts (a loadout is {main, pocket, quirks, vp, row}; a book is one per family member):
//   THE SAVE'S: on each family member object as `m.vibes`. It rides along in every save as two fields per member, `vibes`
//               ({main, pocket, quirks, vp}) and `row`. A save from before these fields existed loads with fresh loadouts.
//               Story fights on Battle 3 (engine/b3-story.js, the ADMIN switch) pay Vibe Points into it. A late joiner (TNB, Nara, Boppy) has
//               no loadout until the story recruits them.
//   THE LAB'S:  kept on this device (localStorage 'aot-b3-lab'), because the Battle Lab runs from the title screen with no save
//               loaded. NEW BATTLE fights use it, a Lab win pays Vibe Points into it, and its page (the Battle Lab's VIBES AND RANKS, M2.lab) has a Rank picker.
//               A change made on the menu's Vibes page is copied to it (Main, Pocket, row), so what Tom picks in the
//               pause menu is what a Lab fight uses.
// Two doors to the one Vibes page (engine/m2-vibes.js): the menu's Vibes tab (the save's book) and NEW BATTLE > VIBES AND RANKS (m2OpenLab, the Lab's book).

// ---------- The save's book ----------
const b3Member=id=>ALL_MEMBERS().find(m=>m.id===id)||null;
// Whether the story has brought this member in (in the party or on the bench). A late joiner has no loadout before that.
const b3Recruited=m=>!!m&&((typeof party!=='undefined'&&party.includes(m))||(typeof onBench==='function'&&onBench(m)));
// A family member's loadout, made valid for this build. null for someone whose kit is not built yet, and for a late joiner the
// story has not recruited yet (stage 15: the loadout is made when they arrive, from the pool of that moment; `force` makes it now).
function b3MemberLoadout(m,force) {
  if(!m||!b3HasKit(m.id)) return null;
  if(!m.vibes&&b3IsLate(m.id)) {   // a late joiner arriving: the pool is the most VP any one member holds (spec section 1)
    if(!force&&!b3Recruited(m)) return null;
    const book={}; for(const o of ALL_MEMBERS()) if(o.id!==m.id&&b3HasKit(o.id)&&o.vibes) book[o.id]=o.vibes;
    m.vibes=b3NewLoadout(m.id,1,b3PoolSize(book));
  }
  m.vibes=b3FixLoadout(m.id,m.vibes);
  return m.vibes;
}
const LE_saveSnapshot_b3=saveSnapshot;
saveSnapshot=function() {
  const s=LE_saveSnapshot_b3();
  for(const sm of (s.members||[])) {
    const m=b3Member(sm.id),L=b3MemberLoadout(m)||(m&&m.vibes)||null;   // someone with no kit yet keeps whatever their save held
    if(L) { sm.vibes={main:L.main,pocket:L.pocket,quirks:(L.quirks||[]).slice(),vp:Object.assign({},L.vp)}; if(L.pool) sm.vibes.pool={total:L.pool.total,set:!!L.pool.set}; sm.row=L.row||null; }
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
  const from=m=>{ const sm=(sv.members||[]).find(x=>x.id===m.id); return sm&&sm.vibes&&typeof sm.vibes==='object'?Object.assign({},sm.vibes,{row:sm.row||null}):null; };
  const all=ALL_MEMBERS();
  for(const m of all) m.vibes=b3IsLate(m.id)?null:from(m);
  for(const m of all) if(!b3IsLate(m.id)) b3MemberLoadout(m);
  // Late joiners come second, so a newcomer's pool sees everyone else's Vibe Points. A save from before stage 15 holds a record for
  // someone the story never recruited (made at save time, pool and Vibe Points all empty): it is dropped, and made when they arrive.
  for(const m of all) if(b3IsLate(m.id)) { const v=from(m); m.vibes=v&&(b3Recruited(m)||b3VibeTotal(m.id,v)>0)?v:null; b3MemberLoadout(m); }
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

window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{b3LabBook,b3LabSave,b3LabReset,b3LabAward,b3LabRank,b3MemberLoadout,b3VibesFromSave,b3Member}); });
