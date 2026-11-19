'use strict';
// engine/b3-progress.js — Battle 3 progress: Vibe Mastery (spec section 1). Ranks and Vibe Points, overflow, the four loadout
// slots (Main Vibe, Pocket Vibe, two Quirks), the row a family member stands in, and what a loadout gives a unit in a fight.
// RULES FILE: no drawing, no page, no timers, no saves. tools/b3-sim.js loads it in node. Saving and the Vibes screen are in
// engine/b3-menu.js.
//
// A LOADOUT is one family member's plain record:
//   {main, pocket, quirks:[a, b], vp:{<vibe id>: points}, row}
//   main, pocket  Vibe ids (pocket is null for someone with one Vibe)
//   quirks        two Quirk ids or null, from any of that member's own Vibes, each unlocked by its Vibe's Rank
//   vp            Vibe Points per Vibe. The Rank is worked out from them (B3_RULES.rankVp), never stored.
//   row           'front', 'back' or null (null: by the Main Vibe's Lean, B3_RULES.rowByLean)
// A BOOK is {<member id>: loadout}. The save holds one book, the Battle Lab holds its own.

// ---------- Ranks ----------
const b3MaxRank=()=>B3_RULES.rankVp.length;
const b3MasterVp=()=>B3_RULES.rankVp[B3_RULES.rankVp.length-1];
function b3RankOf(vp) { const T=B3_RULES.rankVp; let r=1; for(let i=1;i<T.length;i++) if(vp>=T[i]) r=i+1; return r; }
const b3HasKit=id=>!!(B3_CAST[id]&&B3_CAST[id].vibes.length);
const b3VibeRank=(L,vibeId)=>b3RankOf((L.vp&&L.vp[vibeId])||0);
const b3Mastered=(L,vibeId)=>((L.vp&&L.vp[vibeId])||0)>=b3MasterVp();
// What a Vibe holds, Rank by Rank. `open` is true once `rank` reaches the Rank that unlocks it; `built` is false for a Skill
// whose own row is not written yet (its name comes from B3_SOON) and for a Trait or Quirk whose rule is not written yet.
function b3Ladder(V,rank) {
  const U=B3_RULES.rankUnlock,slots=['s1','s2','cap'],T=B3_TRAITS[V.trait];
  const skill=(id,slot)=>{ const S=B3_SKILLS[id]; return {kind:slot==='basic'?'basic':slot==='cap'?'cap':'skill',id,slot,rank:U[slot],open:rank>=U[slot],built:!!S,name:S?S.name:B3_SOON[id]||id}; };
  const quirk=(id,k)=>{ const Q=B3_QUIRKS[id],need=U[k?'quirkB':'quirkA']; return {kind:'quirk',id,slot:k?'b':'a',rank:need,open:rank>=need,built:!!(Q&&!Q.soon),name:Q?Q.name:id}; };
  return [{kind:'trait',id:V.trait,slot:'trait',rank:U.trait,open:rank>=U.trait,built:!!(T&&!T.soon),name:T?T.name:V.trait},
    skill(V.basic,'basic'),...V.skills.map((id,i)=>skill(id,slots[i])),...V.quirks.map(quirk)].sort((a,b)=>a.rank-b.rank);
}
// The Subtitle a Vibe shows at this Rank (three tiers, at Ranks 1, 3 and 5).
function b3Subtitle(V,rank) { let t=0; B3_RULES.subtitleRank.forEach((r,i)=>{ if(rank>=r) t=i; }); return V.subtitles[t]; }

// ---------- Loadouts ----------
// A fresh loadout: the two Sig Vibes as Main and Pocket, no Quirks, every Vibe at `rank` (1 when left out).
function b3NewLoadout(id,rank) {
  const ids=B3_CAST[id].vibes,sig=n=>ids.find(v=>B3_VIBES[v].sig===n);
  const main=sig(1)||ids[0],pocket=sig(2)&&sig(2)!==main?sig(2):ids.find(v=>v!==main)||null,vp={};
  for(const v of ids) vp[v]=B3_RULES.rankVp[Math.max(1,Math.min(b3MaxRank(),rank||1))-1];
  return {main,pocket,quirks:Array.from({length:B3_RULES.quirkSlots},()=>null),vp,row:null};
}
// The Quirks this member may equip right now: from all their own Vibes, each unlocked by its own Vibe's Rank.
function b3QuirkPool(id,L) {
  const out=[];
  for(const v of B3_CAST[id].vibes) for(const q of b3Ladder(B3_VIBES[v],b3VibeRank(L,v))) if(q.kind==='quirk'&&q.open) out.push(q.id);
  return out;
}
// A valid copy of a loadout: missing parts filled in, anything this build does not know put back to its default.
// A save from before the Vibe fields existed (or a member whose kit arrived later) gets b3NewLoadout through this.
function b3FixLoadout(id,L) {
  const D=b3NewLoadout(id,1); if(!L||typeof L!=='object') return D;
  const ids=B3_CAST[id].vibes,M=b3MasterVp(),out={main:D.main,pocket:D.pocket,quirks:D.quirks.slice(),vp:{},row:L.row==='front'||L.row==='back'?L.row:null};
  for(const v of ids) { const n=Math.floor(Number(L.vp&&L.vp[v])||0); out.vp[v]=Math.max(0,Math.min(M,n)); }
  if(ids.includes(L.main)) out.main=L.main;
  out.pocket=ids.includes(L.pocket)&&L.pocket!==out.main?L.pocket:ids.find(v=>v!==out.main)||null;
  const pool=b3QuirkPool(id,out),seen={};
  out.quirks=out.quirks.map((_,i)=>{ const q=Array.isArray(L.quirks)?L.quirks[i]:null; if(!q||!pool.includes(q)||seen[q]) return null; seen[q]=true; return q; });
  return out;
}
// The four slots. Each returns true when the loadout changed. Picking the Pocket Vibe as Main (or the Main as Pocket) trades them.
function b3SetMain(id,L,v) {
  if(!B3_CAST[id].vibes.includes(v)||L.main===v) return false;
  if(L.pocket===v) L.pocket=L.main;
  L.main=v; return true;
}
function b3SetPocket(id,L,v) {
  if(!B3_CAST[id].vibes.includes(v)||L.pocket===v) return false;
  if(L.main===v) { if(!L.pocket) return false; L.main=L.pocket; }
  L.pocket=v; return true;
}
// q null empties the slot. A Quirk already in the other slot moves here and the two trade places.
function b3SetQuirk(id,L,slot,q) {
  if(slot<0||slot>=L.quirks.length||L.quirks[slot]===q) return false;
  if(q==null) { L.quirks[slot]=null; return true; }
  if(!b3QuirkPool(id,L).includes(q)) return false;
  const at=L.quirks.indexOf(q); if(at>=0) L.quirks[at]=L.quirks[slot];
  L.quirks[slot]=q; return true;
}
function b3SetRow(L,row) { const r=row==='front'||row==='back'?row:null; if(L.row===r) return false; L.row=r; return true; }
// The row a loadout stands in: the chosen one, else by the Main Vibe's Lean.
const b3RowOf=L=>L.row||B3_RULES.rowByLean[B3_VIBES[L.main].lean]||'front';
// The Battle Lab's Rank picker: every Vibe of this member at exactly `rank`. Quirks that Rank no longer unlocks come off.
function b3SetRank(id,L,rank) {
  const vp=B3_RULES.rankVp[Math.max(1,Math.min(b3MaxRank(),rank))-1];
  for(const v of B3_CAST[id].vibes) L.vp[v]=vp;
  const pool=b3QuirkPool(id,L); L.quirks=L.quirks.map(q=>q&&pool.includes(q)?q:null);
}

// ---------- Vibe Points (spec section 1) ----------
// After a fight every family member earns `vp`: the equipped Main Vibe all of it, the equipped Pocket Vibe half.
// A mastered Vibe keeps nothing: its share, and whatever is left over when a Vibe reaches mastery, goes to that member's
// lowest unmastered Vibe. With every Vibe mastered the points are lost (Casual Mode has nothing to earn).
// Returns {gains:{<vibe id>: points}, ranks:[{vibe, from, to}], lost}.
function b3AwardVp(id,L,vp) {
  const ids=B3_CAST[id].vibes,M=b3MasterVp(),out={gains:{},ranks:[],lost:0};
  const lowest=()=>ids.filter(v=>(L.vp[v]||0)<M).sort((a,b)=>(L.vp[a]||0)-(L.vp[b]||0)||ids.indexOf(a)-ids.indexOf(b))[0];
  const give=(v,n)=>{
    while(n>0) {
      const to=v&&(L.vp[v]||0)<M?v:lowest(); if(!to) { out.lost+=n; return; }
      const got=Math.min(n,M-(L.vp[to]||0)),from=b3VibeRank(L,to);
      L.vp[to]=(L.vp[to]||0)+got; n-=got; out.gains[to]=(out.gains[to]||0)+got;
      const now=b3VibeRank(L,to); if(now>from) { const r=out.ranks.find(x=>x.vibe===to); if(r) r.to=now; else out.ranks.push({vibe:to,from,to:now}); }
    }
  };
  give(L.main,Math.max(0,Math.round(vp)));
  if(L.pocket) give(L.pocket,Math.max(0,Math.round(vp*B3_RULES.pocketVp)));
  return out;
}
// Everyone in a book earns, in the party or on the bench. Returns {<member id>: what b3AwardVp returned}.
function b3AwardAll(book,vp) { const out={}; for(const id in book) if(b3HasKit(id)&&book[id]) out[id]=b3AwardVp(id,book[id],vp); return out; }

// ---------- What a loadout gives a unit in a fight ----------
// Main Vibe: its Trait, its Basic, its unlocked Skills and its Lean. Pocket Vibe: its unlocked Skills only (spec section 1).
// A Skill counts once its own row is written. Quirks: the two slots, whatever Vibe they come from.
// Portable Counters: a Vibe row may carry `counter` ({id, name, max, on, n, and the listener fields of engine/b3-hooks.js}):
// the rule its Trait states for building a counter. It builds while that Vibe is the Main Vibe, and also while it is the
// Pocket Vibe if one of the Skills it brings reads the counter (the Skill row names it in `counter`). The Trait's other
// bonuses stay with the Main Vibe, because the Trait itself does.
function b3Kit(id,L) {
  const V=B3_VIBES[L.main],P=L.pocket?B3_VIBES[L.pocket]:null;
  const open=X=>b3Ladder(X,b3VibeRank(L,X.id)).filter(r=>(r.kind==='skill'||r.kind==='cap')&&r.open&&r.built).map(r=>r.id);
  const mainSkills=open(V),pocketSkills=P?open(P).filter(s=>!mainSkills.includes(s)):[];
  const counters=[];
  if(V.counter) counters.push(V.counter);
  if(P&&P.counter&&pocketSkills.some(s=>B3_SKILLS[s].counter===P.counter.id)) counters.push(P.counter);
  return {main:V.id,pocket:P?P.id:null,basic:V.basic,skills:[...mainSkills,...pocketSkills],pocketSkills,trait:V.trait,quirks:L.quirks.filter(Boolean),
    lean:V.lean,row:b3RowOf(L),counters,rank:b3VibeRank(L,V.id)};
}
// The passive rows a kit puts on a unit: the Trait, the equipped Quirks (those whose rule is written), and one listener per
// Portable Counter that adds to it by its rule.
function b3KitPassives(K) {
  const rows=[B3_TRAITS[K.trait],...K.quirks.map(q=>B3_QUIRKS[q])].filter(P=>P&&!P.soon);
  for(const C of K.counters) rows.push(Object.assign({},C,{id:'counter:'+C.id,name:C.name,effects:[{op:'counter',id:C.id,n:C.n||1,max:C.max,to:'self'}]}));
  return rows;
}
