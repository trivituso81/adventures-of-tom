'use strict';
// engine/b3-progress.js — Battle 3 progress: Vibe Mastery (spec section 1). Ranks and Vibe Points, overflow, the four loadout
// slots (Main Vibe, Pocket Vibe, two Quirks), the row a family member stands in, and what a loadout gives a unit in a fight.
// RULES FILE: no drawing, no page, no timers, no saves. tools/b3-sim.js loads it in node. Saving and the books are in
// engine/b3-menu.js.
//
// A LOADOUT is one family member's plain record:
//   {main, pocket, quirks:[a, b], vp:{<vibe id>: points}, row}
//   main, pocket  Vibe ids (pocket is null for someone with one Vibe)
//   quirks        two Quirk ids or null, from any of that member's own Vibes, each unlocked by its Vibe's Rank
//   vp            Vibe Points per Vibe. The Rank is worked out from them (B3_RULES.rankVp), never stored.
//   row           'front', 'back' or null (null: by the Main Vibe's Lean, B3_RULES.rowByLean)
//   pocket2, basic  Casual Mode only (main is 'freelancer', see "Casual Mode" below): the second Pocket Vibe and the Basic the player chose. null otherwise.
//   pool          (late joiners only, a cast row with `late:true`) {total, set}: the Vibe Points they arrived with, and whether the
//                 player has confirmed the split. See "The late joiners' pool" below.
// A BOOK is {<member id>: loadout}. The save holds one book, the Battle Lab holds its own.

// ---------- Ranks ----------
const b3MaxRank=()=>B3_RULES.rankVp.length;
const b3MasterVp=()=>B3_RULES.rankVp[B3_RULES.rankVp.length-1];
function b3RankOf(vp) { const T=B3_RULES.rankVp; let r=1; for(let i=1;i<T.length;i++) if(vp>=T[i]) r=i+1; return r; }
const b3HasKit=id=>!!(B3_CAST[id]&&B3_CAST[id].vibes.length);
const b3VibeRank=(L,vibeId)=>b3RankOf((L.vp&&L.vp[vibeId])||0);
const b3Mastered=(L,vibeId)=>((L.vp&&L.vp[vibeId])||0)>=b3MasterVp();
// ---------- Casual Mode (spec section 1: "Freelancer") ----------
// The endgame reward. A member unlocks it by mastering all of their Vibes. It is a fourth Vibe with no Skills of its own and no Vibe Points to
// earn. As the Main Vibe it gives TWO Pocket Vibe slots, the Basic of the player's choice from that member's Vibes, and ALL of that member's
// Traits, with no Stat Lean (the row defaults to Front). It is not in B3_VIBES (it has no rows to check, and the Vibe lists skip it): this
// file's one pseudo Vibe stands in wherever a Vibe name or Lean is read (b3VibeOf).
const B3_FREELANCER='freelancer';
const B3_FREELANCER_V={id:B3_FREELANCER,name:'Freelancer',lean:null,sig:0,casual:true,subtitles:['Casual Mode','Casual Mode','Casual Mode']};
const b3IsFree=v=>v===B3_FREELANCER;
const b3VibeOf=v=>b3IsFree(v)?B3_FREELANCER_V:B3_VIBES[v];
const b3CasualOpen=(id,L)=>b3HasKit(id)&&B3_CAST[id].vibes.length>0&&B3_CAST[id].vibes.every(v=>b3Mastered(L,v));
// The Basics a Freelancer may choose from: one per Vibe of that member, in the cast row's order.
const b3Basics=id=>B3_CAST[id].vibes.map(v=>B3_VIBES[v].basic);
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
// A late joiner (TNB, Nara, Boppy) starts from the pool instead (spec section 1): `pool` is its size, or, when left out, what every
// Vibe at `rank` would hold in all. The pool is split evenly to begin with; the player may split it once, their own way (b3PoolShift).
function b3NewLoadout(id,rank,pool) {
  const ids=B3_CAST[id].vibes,sig=n=>ids.find(v=>B3_VIBES[v].sig===n);
  const main=sig(1)||ids[0],pocket=sig(2)&&sig(2)!==main?sig(2):ids.find(v=>v!==main)||null,vp={};
  const each=B3_RULES.rankVp[Math.max(1,Math.min(b3MaxRank(),rank||1))-1];
  for(const v of ids) vp[v]=each;
  const L={main,pocket,pocket2:null,basic:null,quirks:Array.from({length:B3_RULES.quirkSlots},()=>null),vp,row:null};
  if(b3IsLate(id)) { const total=pool!=null?Math.max(0,Math.floor(pool)):each*ids.length;
    b3PoolEven(id,L,total); L.pool={total,set:false}; }
  return L;
}
// ---------- The late joiners' pool (spec section 1: "arrive ... with a VP pool equal to the most total VP any one character has earned so
// far. The player splits that pool once across the newcomer's Vibes") ----------
// The pool is the largest total of Vibe Points any one family member holds. A late joiner's Vibes start with it split evenly (so they are
// playable at once), and until the player confirms, VP can be moved between the Vibes in steps (b3PoolShift); confirming locks the split
// for good (b3PoolConfirm). My calls: only the Vibes that are built count (a third Vibe that arrives later starts at 0 and earns like any
// other); the pool counts every Vibe Point a member holds, a late joiner's pool included.
const b3IsLate=id=>!!(B3_CAST[id]&&B3_CAST[id].late);
const b3VibeTotal=(id,L)=>B3_CAST[id].vibes.reduce((s,v)=>s+((L&&L.vp&&L.vp[v])||0),0);
function b3PoolSize(book) { let best=0; for(const id in (book||{})) if(b3HasKit(id)&&book[id]) best=Math.max(best,b3VibeTotal(id,book[id])); return best; }
function b3PoolEven(id,L,total) {
  const ids=B3_CAST[id].vibes,M=b3MasterVp(),base=Math.floor(total/ids.length),rem=total-base*ids.length;
  ids.forEach((v,i)=>{ L.vp[v]=Math.min(M,base+(i<rem?1:0)); });
}
const b3PoolOpen=L=>!!(L&&L.pool&&!L.pool.set);
// Move n Vibe Points from one Vibe to another while the split is open. Returns true when it moved.
function b3PoolShift(id,L,from,to,n) {
  const ids=B3_CAST[id].vibes;
  if(!b3PoolOpen(L)||from===to||!ids.includes(from)||!ids.includes(to)||!(n>0)) return false;
  n=Math.min(n,L.vp[from]||0,b3MasterVp()-(L.vp[to]||0)); if(n<=0) return false;
  L.vp[from]-=n; L.vp[to]+=n;
  const pool=b3QuirkPool(id,L); L.quirks=L.quirks.map(q=>q&&pool.includes(q)?q:null);
  return true;
}
function b3PoolConfirm(L) { if(!b3PoolOpen(L)) return false; L.pool.set=true; return true; }
// The Quirks this member may equip right now: from all their own Vibes, each unlocked by its own Vibe's Rank.
function b3QuirkPool(id,L) {
  const out=[];
  for(const v of B3_CAST[id].vibes) for(const q of b3Ladder(B3_VIBES[v],b3VibeRank(L,v))) if(q.kind==='quirk'&&q.open) out.push(q.id);
  return out;
}
// ROSE MODE's automatic loadout (stage 7): the two Sig Vibes as Main and Pocket, and the two newest written Quirks the Ranks have opened
// (the last two of the pool, which runs Vibe by Vibe, rung by rung). Ranks, Vibe Points and the row are kept. A new object: the book it
// came from is never changed, so switching back to Grace Mode brings the player's own picks back.
function b3RoseLoadout(id,L) {
  const F=b3FixLoadout(id,L),ids=B3_CAST[id].vibes,sig=n=>ids.find(v=>B3_VIBES[v].sig===n);
  const main=sig(1)||F.main,pocket=sig(2)&&sig(2)!==main?sig(2):F.pocket,out={main,pocket,pocket2:null,basic:null,quirks:[],vp:Object.assign({},F.vp),row:F.row};
  const pool=b3QuirkPool(id,out).filter(q=>B3_QUIRKS[q]&&!B3_QUIRKS[q].soon);
  out.quirks=pool.slice(-B3_RULES.quirkSlots); while(out.quirks.length<B3_RULES.quirkSlots) out.quirks.push(null);
  return b3FixLoadout(id,out);
}
// A valid copy of a loadout: missing parts filled in, anything this build does not know put back to its default.
// A save from before the Vibe fields existed (or a member whose kit arrived later) gets b3NewLoadout through this.
function b3FixLoadout(id,L) {
  const D=b3NewLoadout(id,1); if(!L||typeof L!=='object') return D;
  const ids=B3_CAST[id].vibes,M=b3MasterVp(),out={main:D.main,pocket:D.pocket,pocket2:null,basic:null,quirks:D.quirks.slice(),vp:{},row:L.row==='front'||L.row==='back'?L.row:null};
  for(const v of ids) { const n=Math.floor(Number(L.vp&&L.vp[v])||0); out.vp[v]=Math.max(0,Math.min(M,n)); }
  // A late joiner's pool: kept as saved; a record from before the pool existed counts as already split.
  if(b3IsLate(id)) out.pool=L.pool&&typeof L.pool==='object'?{total:Math.max(0,Math.floor(Number(L.pool.total)||0)),set:!!L.pool.set}:{total:b3VibeTotal(id,out),set:true};
  if(b3IsFree(L.main)&&b3CasualOpen(id,out)) {   // Casual Mode stays only while every Vibe is mastered (a lower Rank in the Lab puts it away)
    out.main=B3_FREELANCER;
    out.pocket=ids.includes(L.pocket)?L.pocket:ids[0];
    out.pocket2=ids.includes(L.pocket2)&&L.pocket2!==out.pocket?L.pocket2:ids.find(v=>v!==out.pocket)||null;
    const bs=b3Basics(id); out.basic=bs.includes(L.basic)?L.basic:bs[0];
  } else {
    if(ids.includes(L.main)) out.main=L.main;
    out.pocket=ids.includes(L.pocket)&&L.pocket!==out.main?L.pocket:ids.find(v=>v!==out.main)||null;
  }
  const pool=b3QuirkPool(id,out),seen={};
  out.quirks=out.quirks.map((_,i)=>{ const q=Array.isArray(L.quirks)?L.quirks[i]:null; if(!q||!pool.includes(q)||seen[q]) return null; seen[q]=true; return q; });
  return out;
}
// The four slots. Each returns true when the loadout changed. Picking the Pocket Vibe as Main (or the Main as Pocket) trades them.
function b3SetMain(id,L,v) {
  const ids=B3_CAST[id].vibes;
  if(b3IsFree(v)) {   // into Casual Mode: the old Main and Pocket Vibes become the two Pocket slots, and the old Main's Basic is the chosen Basic
    if(L.main===v||!b3CasualOpen(id,L)) return false;
    const a=L.main,b=L.pocket;
    L.main=v; L.pocket=a; L.pocket2=b&&b!==a?b:ids.find(x=>x!==a)||null;
    const bs=b3Basics(id); L.basic=bs.includes(L.basic)?L.basic:B3_VIBES[a].basic; return true;
  }
  if(!ids.includes(v)||L.main===v) return false;
  if(b3IsFree(L.main)) {   // out of Casual Mode: the new Main keeps a Pocket Vibe that is not itself
    L.main=v; if(L.pocket===v||!L.pocket) L.pocket=L.pocket2&&L.pocket2!==v?L.pocket2:ids.find(x=>x!==v)||null;
    L.pocket2=null; L.basic=null; return true;
  }
  if(L.pocket===v) L.pocket=L.main;
  L.main=v; return true;
}
// slot 1 is the second Pocket slot, and only Casual Mode has one. Trading: picking a Vibe already in the other Pocket slot swaps the two.
function b3SetPocket(id,L,v,slot) {
  if(!B3_CAST[id].vibes.includes(v)) return false;
  if(b3IsFree(L.main)) {
    const key=slot===1?'pocket2':'pocket',other=slot===1?'pocket':'pocket2';
    if(L[key]===v) return false;
    if(L[other]===v) L[other]=L[key];
    L[key]=v; return true;
  }
  if(slot===1||L.pocket===v) return false;
  if(L.main===v) { if(!L.pocket) return false; L.main=L.pocket; }
  L.pocket=v; return true;
}
// The Basic a Casual Mode member uses: any one Vibe's Basic of their own.
function b3SetBasic(id,L,skill) {
  if(!b3IsFree(L.main)||!b3Basics(id).includes(skill)||L.basic===skill) return false;
  L.basic=skill; return true;
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
const b3RowOf=L=>L.row||(b3IsFree(L.main)?'front':B3_RULES.rowByLean[B3_VIBES[L.main].lean])||'front';
// The Battle Lab's Rank picker: every Vibe of this member at exactly `rank`. Quirks that Rank no longer unlocks come off.
function b3SetRank(id,L,rank) {
  const vp=B3_RULES.rankVp[Math.max(1,Math.min(b3MaxRank(),rank))-1];
  for(const v of B3_CAST[id].vibes) L.vp[v]=vp;
  if(L.pool) L.pool.total=vp*B3_CAST[id].vibes.length;   // a late joiner's pool follows the Rank picked
  if(b3IsFree(L.main)&&!b3CasualOpen(id,L)) Object.assign(L,b3FixLoadout(id,L));   // Casual Mode needs every Vibe mastered
  const pool=b3QuirkPool(id,L); L.quirks=L.quirks.map(q=>q&&pool.includes(q)?q:null);
}

// ---------- Vibe Points (spec section 1) ----------
// After a fight every family member earns `vp`: the equipped Main Vibe all of it, the equipped Pocket Vibe half.
// A mastered Vibe keeps nothing: its share, and whatever is left over when a Vibe reaches mastery, goes to that member's
// lowest unmastered Vibe. With every Vibe mastered the points are lost (Casual Mode has nothing to earn, and is never a place points go).
// Returns {gains:{<vibe id>: points}, ranks:[{vibe, from, to}], lost}.
function b3AwardVp(id,L,vp) {
  const ids=B3_CAST[id].vibes,M=b3MasterVp(),out={gains:{},ranks:[],lost:0};
  const lowest=()=>ids.filter(v=>(L.vp[v]||0)<M).sort((a,b)=>(L.vp[a]||0)-(L.vp[b]||0)||ids.indexOf(a)-ids.indexOf(b))[0];
  const give=(v,n)=>{
    while(n>0) {
      const to=v&&ids.includes(v)&&(L.vp[v]||0)<M?v:lowest(); if(!to) { out.lost+=n; return; }
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
  if(b3IsFree(L.main)) return b3KitFree(id,L);
  const V=B3_VIBES[L.main],P=L.pocket?B3_VIBES[L.pocket]:null;
  const open=X=>b3Ladder(X,b3VibeRank(L,X.id)).filter(r=>(r.kind==='skill'||r.kind==='cap')&&r.open&&r.built).map(r=>r.id);
  const mainSkills=open(V),pocketSkills=P?open(P).filter(s=>!mainSkills.includes(s)):[];
  const counters=[];
  if(V.counter) counters.push(V.counter);
  if(P&&P.counter&&pocketSkills.some(s=>B3_SKILLS[s].counter===P.counter.id)) counters.push(P.counter);
  return {main:V.id,pocket:P?P.id:null,pocket2:null,basic:V.basic,skills:[...mainSkills,...pocketSkills],pocketSkills,trait:V.trait,traits:[V.trait],quirks:L.quirks.filter(Boolean),
    lean:V.lean,row:b3RowOf(L),counters,rank:b3VibeRank(L,V.id)};
}
// Casual Mode's kit: no Skills of its own, so every Skill comes through the two Pocket Vibes (the Pocket rules apply to it: a Skill Lock covers
// them); the Basic is the chosen one; every Trait of the member's Vibes is on, and so is each Vibe's Portable Counter (the Trait states how it
// builds). No Lean. It counts as Rank 5, since it opens only when every Vibe is mastered.
function b3KitFree(id,L) {
  const ids=B3_CAST[id].vibes,open=X=>b3Ladder(X,b3VibeRank(L,X.id)).filter(r=>(r.kind==='skill'||r.kind==='cap')&&r.open&&r.built).map(r=>r.id);
  const skills=[]; for(const v of [L.pocket,L.pocket2]) if(v) for(const s of open(B3_VIBES[v])) if(!skills.includes(s)) skills.push(s);
  const traits=ids.map(v=>B3_VIBES[v].trait),counters=ids.map(v=>B3_VIBES[v].counter).filter(Boolean);
  return {main:B3_FREELANCER,pocket:L.pocket||null,pocket2:L.pocket2||null,basic:L.basic||b3Basics(id)[0],skills,pocketSkills:skills.slice(),trait:traits[0],traits,quirks:L.quirks.filter(Boolean),
    lean:null,row:b3RowOf(L),counters,rank:b3MaxRank()};
}
// What a kit's Trait and equipped Quirks (those whose rule is written) put on a unit:
//   listeners  flat rows for the hook bus (engine/b3-hooks.js). A row with `on` is one listener; a row with `listen:[...]` is
//              one per entry (ids '<row id>:0', '<row id>:1'...). Each Portable Counter adds one that builds it by its rule.
//   mods       the rows' own mods (engine/b3-core.js b3Mods: they may carry `when` and `per`)
//   counters   counters a Quirk keeps for itself ({id, name, max}: Upgrade Certificate)
//   custom     {<one-off rule name>: its numbers} (engine/b3-custom.js)
//   allyMods   mods the Quirk gives every family member as the fight begins (Coaster Policy: engine/b3-core.js b3NewFight)
function b3KitPassives(K) {
  const out={listeners:[],mods:[],counters:[],custom:{},immune:[],shieldMods:[],allyMods:[]};
  for(const P of [...(K.traits||[K.trait]).map(t=>B3_TRAITS[t]),...K.quirks.map(q=>B3_QUIRKS[q])]) {
    if(!P||P.soon) continue;
    if(P.on) out.listeners.push(P);
    (P.listen||[]).forEach((L,i)=>out.listeners.push(Object.assign({},L,{id:P.id+':'+i,pid:P.id,name:P.name})));
    for(const m of (P.mods||[])) out.mods.push(Object.assign({},m,{from:P.id}));
    if(P.counter) out.counters.push(P.counter);
    if(P.custom) out.custom[P.custom]=P.n||{};
    if(P.immune) out.immune.push(...P.immune);
    if(P.shieldMods) out.shieldMods.push(...P.shieldMods);
    if(P.allyMods) out.allyMods.push(...P.allyMods.map(m=>Object.assign({},m,{from:P.id})));
  }
  // `extra`: more listeners that travel with the counter (Olivia's Cadence resets on a Support turn), so they hold in the Pocket too.
  for(const C of K.counters) { out.listeners.push(Object.assign({},C,{id:'counter:'+C.id,name:C.name,effects:[{op:'counter',id:C.id,n:C.n||1,max:C.max,to:'self'}]}));
    (C.extra||[]).forEach((L,i)=>out.listeners.push(Object.assign({},L,{id:'counter:'+C.id+':x'+i,name:C.name}))); }
  return out;
}
