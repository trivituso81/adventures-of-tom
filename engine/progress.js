'use strict';
// engine/progress.js — Progression (F6; claude/battle-design.md sections 5 and 7). Numbers live in data/progress.js.
//   Levels 1 to 50, 100 XP each (member.level, member.xp toward the next level). Battle XP: b6BattleXp.
//   Option 3 (data/abilities.js): Stamp Points (2, +1 every even level, plus member.spBonus from side quests) stamp
//     the 12 path slots; Polish Points (every odd level from 3) rank slots up; Remix Tickets (every even level from 28,
//     plus member.ticketBonus) unlock each slot's other version; Loadouts at 27; Mastery at 50. Free respec.
//   Kits: b6Kit(id) is the basic move, the signature special and the stamped path skills (Battle Lab: everything).
//   Perks: gear perks (Keepsake Charms), merged by b6Perks and read by the battle. Passive stamps were retired.
//   The Family Group Chat: b6Sync raises every member to Tom's total XP after each fight (shared story XP).
//   The Stampcard screen (renderStampsTab) and the Status page (renderStatusTab) are menu views drawn here.
// Loaded after engine/battle2-traits.js.

// ---------- Levels and XP ----------
const b6Total=m=>(m.level-1)*B6.xpPerLevel+(m.xp||0);
function b6SetTotal(m,total) {
  const cap=(B6.maxLevel-1)*B6.xpPerLevel;
  total=Math.max(0,Math.min(cap,Math.round(total)));
  m.level=1+Math.floor(total/B6.xpPerLevel); m.xp=m.level>=B6.maxLevel?0:total%B6.xpPerLevel; m.next=B6.xpPerLevel;
}
// Max HP: the level line plus Outfit HP. HP keeps its share when max HP changes (full: heal to full).
const b6MaxHp=m=>b2Stat(m.id,'hp',m.level)+statBonus(m,'hp');
function b6Refresh(m,full) {
  const old=m.maxHp||1,frac=Math.max(0,Math.min(1,(m.hp==null?old:m.hp)/old));
  m.maxHp=b6MaxHp(m);
  m.hp=full?m.maxHp:(m.hp<=0?0:Math.max(1,Math.min(m.maxHp,Math.round(m.maxHp*frac))));
}
function b6RefreshAll(full) { for(const m of ALL_MEMBERS()) b6Refresh(m,full); }
// Add XP. Returns the levels reached (each level up refills HP).
function b6GainXp(m,n) {
  const before=m.level,ups=[];
  b6SetTotal(m,b6Total(m)+n);
  for(let L=before+1;L<=m.level;L++) ups.push(L);
  if(ups.length) b6Refresh(m,true);
  return ups;
}
// Shared story XP: everyone matches Tom (never lowered). Members who catch up while away keep a note for when they rejoin.
function b6Sync() {
  const t=b6Total(hero);
  for(const m of ALL_MEMBERS()) {
    if(m===hero||b6Total(m)>=t) continue;
    const was=m.level; b6SetTotal(m,t);
    if(m.level>was) { b6Refresh(m,true); if(!inParty(m)) m.caughtUp=(m.caughtUp||0)+(m.level-was); }
  }
}
// XP for the fight just won: each monster's B6_XP (+5% per time it has been beaten, up to +50%), or a flat level for a boss.
// foes and npc default to the fight in progress; the overlevel instant win (engine/feel.js) passes its own.
function b6BattleXp(foes,npc) {
  if(!foes) { foes=B2.foes; npc=B2.cfg&&B2.cfg.npc; }
  const tier=Math.min(B6.tierXpMax,(npc&&npc.tier)||0);
  if(foes.some(f=>f.boss)) return B6.bossXp;
  // Base XP never grows with tier: the fallback uses the monster's starting level (f.lvl climbs by 1 every win, which
  // used to compound). Outlevelling a foe tapers its XP (B6.overTaper per level above it, down to B6.overFloor).
  let xp=0;
  for(const f of foes) {
    const D=typeof b2FoeDef==='function'&&b2FoeDef(f.id),base=(D&&D.level)||(MONSTERS[f.id]&&MONSTERS[f.id].level)||1;
    const gap=Math.max(0,(hero.level||1)-Math.max(base,f.lvl||1)),taper=Math.max(B6.overFloor,1-B6.overTaper*gap);
    xp+=(B6_XP[f.id]||Math.round(10+base*3))*(1+B6.tierXp*tier)*taper;
  }
  return Math.max(1,Math.round(xp));
}

// ---------- Stampcards (Option 3: data/abilities.js) ----------
// member.stamps: the stamped path slots, e.g. ['A1','B1','A2']. Any order; each slot needs its level gate and SP.
//   Node 6 (A6, B6) is an Ultimate: the first one opens at level 26, the second at 40.
// member.ver: equipped version per slot ('basic', 'sig', 'A1'...): 'r' for Remix, Primary otherwise.
// member.remix: slots whose Remix is unlocked (one Remix Ticket each). Permanent, even after a respec.
// member.ranks: Polish rank per slot (2 "+", 3 "Polished"). Ranks belong to the slot, shared by both versions.
// member.loadouts: two saved {stamps, ver} setups from level 27 (member.loadout is the one in use).
// Old saves stored stamps as [a, b] (nodes stamped on each old 4-node path): b8St converts them (B8_LEGACY).
const b6Paths=id=>B6_PATHS[id]||[];          // path names (data/progress.js)
const b8Kit=id=>B8_KITS[id]||B8_KITS.tom;
const b8Node=(id,slot)=>b8Kit(id)[slot];
const b8Pos=slot=>+slot.charAt(1)-1;                    // A3 -> 2
const b8Cost=slot=>B8.cost[b8Pos(slot)];
// The move a slot version actually plays: its own Option 3 move once built (B2_SKILLS[id].o3, matched by key), else the
// slot's stand-in (play: the legacy basic, special or path skill). A Remix not built yet falls back to the built Primary.
function b8Move(id,slot,v) {
  const node=b8Node(id,slot),K=B2_SKILLS[id]||B2_SKILLS.tom; if(!node) return null;
  const sig=slot==='sig',own=w=>(K.o3||[]).find(s=>s.key===node[w].key&&!!s.sig===sig);
  const m=own(v||'p'); if(m) return m;
  if(slot==='basic') return K.basic;
  if(sig) return K.special;
  return K.skills.find(s=>s.key===node.play)||(v==='r'?own('p'):null)||null;
}
const b8Built=(id,slot,v)=>{ const n=b8Node(id,slot),m=b8Move(id,slot,v); return !!(n&&m&&m.key===n[v].key&&m.o3); };
const b8Playable=(id,slot)=>!!b8Move(id,slot,'p');
function b8St(m) {
  let s=m.stamps;
  if(Array.isArray(s)&&s.length&&typeof s[0]==='number') {   // old save: convert, refund passives
    const L=B8_LEGACY[m.id]||[[],[]],out=[];
    [0,1].forEach(p=>{ for(let n=0;n<(s[p]||0);n++) { const key=(L[p]||[])[n]; if(!key) continue;
      const slot=B8_SLOTS.find(sl=>b8Node(m.id,sl).play===key); if(slot&&!out.includes(slot)) out.push(slot); } });
    s=out;
  }
  if(!Array.isArray(s)) s=[];
  const clean=s.filter((x,i)=>B8_SLOTS.includes(x)&&s.indexOf(x)===i);
  if(clean.length!==s.length||s!==m.stamps) m.stamps=clean;   // same array otherwise (callers splice it)
  return m.stamps;
}
const b8Has=(m,slot)=>slot==='basic'||slot==='sig'||b8St(m).includes(slot);
// Level gate for a slot: node 6 is 26, or 40 if the other path's Ultimate is already stamped.
function b8Gate(m,slot) {
  const n=b8Pos(slot);
  if(n<5) return B8.gates[n];
  return b8St(m).includes((slot[0]==='A'?'B':'A')+'6')?B8.ult2:B8.gates[5];
}
// ---- Points ----
const b6SpEarned=m=>B8.spStart+Math.floor(m.level/2)+(m.spBonus||0);
const b6SpSpent=m=>b8St(m).reduce((a,sl)=>a+b8Cost(sl),0);
const b6SpLeft=m=>b6SpEarned(m)-b6SpSpent(m);
const b8PpEarned=m=>m.level>=B8.polishFrom?Math.floor((m.level-1)/2):0;
const b8PpSpent=m=>Object.values(m.ranks||{}).reduce((a,r)=>a+Math.max(0,(r||1)-1),0);
const b8PpLeft=m=>b8PpEarned(m)-b8PpSpent(m);
const b8TkEarned=m=>(m.level>=B8.ticketFrom?Math.floor((m.level-B8.ticketFrom)/2)+1:0)+(m.ticketBonus||0);
const b8TkLeft=m=>b8TkEarned(m)-(m.remix||[]).length;
const b8Rank=(m,slot)=>(m.ranks&&m.ranks[slot])||1;
const b8Ver=(m,slot)=>(m.ver&&m.ver[slot]==='r'&&(m.remix||[]).includes(slot))?'r':'p';
// What reaching a level gives (one card each on the victory screen). Every level from 2 to 50 gives something.
function b8LevelRewards(L) {
  const r=[];
  if(L%2===0) r.push({k:'sp',txt:'+1 Stamp Point'});
  if(L>=B8.polishFrom&&L%2===1) r.push({k:'pp',txt:'+1 Polish Point'});
  if(L===B8.loadoutLvl) r.push({k:'lo',txt:'Loadouts unlocked'});
  if(L>=B8.ticketFrom&&L%2===0) r.push({k:'tk',txt:'+1 Remix Ticket'});
  if(L===B8.polish3Lvl) r.push({k:'p3',txt:'Polished rank open'});
  if(L===B8.masteryLvl) r.push({k:'ma',txt:'Mastery'});
  return r;
}
// ---- Stamping ----
// stamped | next (can stamp now) | level (level too low) | sp (not enough SP) | soon (no move built yet)
function b6NodeState(m,slot) {
  if(b8St(m).includes(slot)) return 'stamped';
  if(!b8Playable(m.id,slot)) return 'soon';
  if(m.level<b8Gate(m,slot)) return 'level';
  if(b6SpLeft(m)<b8Cost(slot)) return 'sp';
  return 'next';
}
const b6Stampable=m=>B8_SLOTS.some(sl=>b6NodeState(m,sl)==='next');
function b6Stamp(m,slot) { if(b6NodeState(m,slot)!=='next') return false; b8St(m).push(slot); return true; }
function b6Unstamp(m,slot) {
  const s=b8St(m),i=s.indexOf(slot); if(i<0) return false;
  s.splice(i,1);
  // The other Ultimate may now be over its gate (two Ultimates need level 40): drop it too.
  b6Trim(m); return true;
}
// RESPEC: Stamp Points and Polish Points come back. Remix Tickets stay spent (the Remix stays unlocked).
function b6ClearStamps(m) { const had=b6SpSpent(m)+b8PpSpent(m); m.stamps=[]; m.ranks={}; return had>0; }
// ---- Polish ----
// polish: can rank up now | max | lvl (rank 3 needs level 20) | pp (no Polish Points) | own (stamp it first)
function b8PolishState(m,slot) {
  const r=b8Rank(m,slot);
  if(r>=3) return 'max';
  if(!b8Has(m,slot)) return 'own';
  if(r===2&&m.level<B8.polish3Lvl) return 'lvl';
  if(b8PpLeft(m)<1) return 'pp';
  return 'polish';
}
function b8Polish(m,slot) { if(b8PolishState(m,slot)!=='polish') return false; m.ranks=m.ranks||{}; m.ranks[slot]=b8Rank(m,slot)+1; return true; }
// ---- Remix ----
function b8CanRemix(m,slot) { return b8Has(m,slot)&&!(m.remix||[]).includes(slot)&&b8TkLeft(m)>0; }
function b8UnlockRemix(m,slot) { if(!b8CanRemix(m,slot)) return false; m.remix=(m.remix||[]).concat(slot); return true; }
function b8Equip(m,slot,v) {
  if(v==='r'&&!(m.remix||[]).includes(slot)) return false;
  m.ver=m.ver||{}; if(v==='r') m.ver[slot]='r'; else delete m.ver[slot]; return true;
}
// ---- Loadouts (level 27): two saved setups of stamps and versions. ----
const b8LoadoutsOpen=m=>m.level>=B8.loadoutLvl;
function b8Loadouts(m) {
  if(!b8LoadoutsOpen(m)) return null;
  if(!Array.isArray(m.loadouts)||m.loadouts.length!==2) { const cur={stamps:b8St(m).slice(),ver:Object.assign({},m.ver||{})}; m.loadouts=[cur,{stamps:cur.stamps.slice(),ver:Object.assign({},cur.ver)}]; m.loadout=0; }
  return m.loadouts;
}
function b8SwapLoadout(m) {
  const L=b8Loadouts(m); if(!L) return false;
  const i=m.loadout?1:0;
  L[i]={stamps:b8St(m).slice(),ver:Object.assign({},m.ver||{})};
  const j=1-i; m.loadout=j; m.stamps=L[j].stamps.slice(); m.ver=Object.assign({},L[j].ver);
  b6Trim(m); return true;
}
// ---- Director's Cut and Mastery ----
const b8DcOpen=c=>!!(c&&typeof flag==='function'&&flag(c.flag)&&c.who.every(id=>{ const m=memberById(id); return m&&m.level>=B8.dcLvl; }));
const b8Mastery=m=>m.level>=B8.masteryLvl;
// Auto-Stamp (Recommended): follow the character's route (Option 1), skip slots that are gated or not built yet, and
// stop when the next one needs more SP than are left (saving up for it). Unless OPTIONS turns it off, it then spends
// Polish Points (signature, basic, then stamped slots in route order; all to "+" before any "Polished") and Remix
// Tickets (unlocks only; the equipped version does not change).
const b8AutoSpend=()=>!(typeof B7==='object'&&B7.autoSpend===false);
function b6AutoStamp(m) {
  let made=0;
  for(const slot of (b8Kit(m.id).auto||B8_SLOTS)) {
    const st=b6NodeState(m,slot);
    if(st==='stamped'||st==='level'||st==='soon') continue;
    if(st==='sp') break;
    b6Stamp(m,slot); made++;
  }
  if(b8AutoSpend()) {
    const order=['sig','basic'].concat((b8Kit(m.id).auto||B8_SLOTS).filter(sl=>b8Has(m,sl)));
    for(const want of [2,3]) for(const sl of order) if(b8Rank(m,sl)<want&&b8Polish(m,sl)) made++;
    for(const sl of order) if(b8UnlockRemix(m,sl)) made++;
  }
  return made;
}
const b8AutoHas=m=>b6Stampable(m)||(b8AutoSpend()&&(b8PpLeft(m)>0&&['sig','basic'].concat(B8_SLOTS).some(sl=>b8PolishState(m,sl)==='polish')||b8TkLeft(m)>0&&['sig','basic'].concat(B8_SLOTS).some(sl=>b8CanRemix(m,sl))));
// Choices that no longer add up (a slot over its gate, fewer SP or Polish Points than spent) are trimmed, newest first.
function b6Trim(m) {
  const s=b8St(m);
  for(let g=0;g<30;g++) { let bad=-1; for(let i=s.length-1;i>=0;i--) if(!b8Playable(m.id,s[i])||m.level<b8Gate(m,s[i])) { bad=i; break; } if(bad<0) break; s.splice(bad,1); }
  while(s.length&&b6SpLeft(m)<0) s.pop();
  m.ranks=m.ranks||{};
  for(const k in m.ranks) if(m.ranks[k]>=3&&m.level<B8.polish3Lvl) m.ranks[k]=2;
  const keys=Object.keys(m.ranks); while(b8PpLeft(m)<0&&keys.length) { const k=keys.pop(); delete m.ranks[k]; }
  m.remix=(m.remix||[]).filter((x,i,a)=>a.indexOf(x)===i); while(b8TkLeft(m)<0&&m.remix.length) m.remix.pop();
  for(const k in (m.ver||{})) if(!m.remix.includes(k)) delete m.ver[k];
}

// ---------- The battle kit and perks ----------
// The basic move, the signature special and the stamped path skills (A1 to A6, then B1 to B6). Each is the move its
// slot plays (data/abilities.js play) with its Polish rank: rank 2+ sets polish (x1.15, read by engine/battle2.js),
// rank 3 takes 1 VP off (minimum 1). all: every move at rank 1 (Battle Lab).
function b8Polished(s,rank) {
  if(!s||rank<2) return s;
  return Object.assign({},s,{polish:B8.polishMult,rank,vp:rank>=3&&s.vp>1?s.vp-1:s.vp});
}
function b6Kit(id,all) {
  const k=b2Kit(id),m=memberById(id);
  // Battle Lab: everything at rank 1. A character with Option 3 moves built shows its slots in order, Primary versions.
  if(all||!m) {
    if(!k.o3) return k;
    const skills=[]; for(const sl of B8_SLOTS) { const s=b8Move(id,sl,'p'); if(s&&!skills.includes(s)) skills.push(s); }
    return {basic:b8Move(id,'basic','p'),special:b8Move(id,'sig','p'),skills};
  }
  const skills=[],seen=new Set();
  for(const sl of B8_SLOTS) if(b8St(m).includes(sl)) { const s=b8Move(id,sl,b8Ver(m,sl)); if(s&&!seen.has(s)) { seen.add(s); skills.push(b8Polished(s,b8Rank(m,sl))); } }
  return {basic:b8Polished(b8Move(id,'basic',b8Ver(m,'basic')),b8Rank(m,'basic')),special:b8Polished(b8Move(id,'sig',b8Ver(m,'sig')),b8Rank(m,'sig')),skills};
}
// Everything a member's gear perks add up to (Option 3 retired the passive stamps).
function b6Perks(m,all) {
  const P={startVp:0,regen:0,heart:0,crit:0,coins:0,evade:0,kind:0,stat:{},immune:[],boost:[]};
  const add=pk=>{ if(!pk) return;
    for(const k of ['startVp','regen','heart','crit','coins','evade','kind']) if(pk[k]) P[k]+=pk[k];
    if(pk.stat) for(const k in pk.stat) P.stat[k]=(P.stat[k]||0)+pk.stat[k];
    if(pk.immune) for(const s of pk.immune) if(!P.immune.includes(s)) P.immune.push(s);
    if(pk.boost) P.boost.push(pk.boost); };
  for(const slot of (typeof wearSlots==='function'?wearSlots(m):SLOTS)) { const id=m.equipment&&m.equipment[slot]; if(id&&items[id]) add(items[id].perk); }
  P.evade=Math.min(.5,P.evade);
  return P;
}
const B6_PCT=v=>Math.round(v*100)+'%';
const b6SkillName=k=>{ for(const id in B2_SKILLS) { const s=B2_SKILLS[id].skills.find(x=>x.key===k); if(s) return s.name; } return k; };
// A perk in plain words.
function b6PerkText(pk) {
  if(!pk) return '';
  const out=[];
  if(pk.startVp) out.push('Starts fights with +'+pk.startVp+' VP');
  if(pk.regen) out.push('Heals '+B6_PCT(pk.regen)+' HP each turn');
  if(pk.heart) out.push('HEART +'+pk.heart+' at the start of a fight');
  if(pk.crit) out.push('Critical hits +'+B6_PCT(pk.crit));
  if(pk.stat) for(const k in pk.stat) out.push(STAT_LABEL[k]+' +'+B6_PCT(pk.stat[k]));
  if(pk.coins) out.push('Coins from fights +'+B6_PCT(pk.coins));
  if(pk.evade) out.push('Dodges '+B6_PCT(pk.evade)+' of single hits');
  if(pk.kind) out.push('Kindness +'+B6_PCT(pk.kind));
  if(pk.immune&&pk.immune.length) out.push('Immune to '+pk.immune.map(s=>(B2_STATUS[s]||{}).name||s).join(' and '));
  for(const bo of [].concat(pk.boost||[])) out.push(bo.keys.map(k=>b6SkillName(k)).join(', ')+' +'+B6_PCT(bo.p));
  return out.join(', ');
}
// How good a perk is, for BEST GEAR (charms are compared by this).
function b6PerkScore(pk) {
  if(!pk) return 0;
  let s=(pk.startVp||0)*5+(pk.regen||0)*90+(pk.heart||0)*.4+(pk.crit||0)*60+(pk.coins||0)*8+(pk.evade||0)*60+(pk.kind||0)*15+(pk.immune?pk.immune.length*2:0);
  if(pk.stat) for(const k in pk.stat) s+=pk.stat[k]*50;
  return s;
}
// HEART from charms (Rose's Drawing, Chalk Drawing), once at the start of a fight.
function b6StartPerks() {
  const h=B2.party.reduce((a,u)=>a+((u.perk&&u.perk.heart)||0),0);
  if(h) B2.heart=Math.min(B2_HEART.cap,B2.heart+h);
}

// ---------- New game, saves and old saves ----------
// Members start holding their Signature Tool; a save from before F6 is converted to the three slots.
const B6_OLD_SLOTS={Body:['Outfit'],Held:['Tool','Charm'],Head:['Charm'],Feet:['Charm','Outfit'],Legs:['Outfit','Charm']};
function b6ConvertGear(m) {
  const eq=m.equipment||{},old=Object.keys(eq).some(k=>B6_OLD_SLOTS[k]);
  if(!old) { for(const s of SLOTS) if(!(s in eq)) eq[s]=null; m.equipment=eq; return; }
  const ne={Tool:null,Outfit:null,Charm:null};
  for(const k of ['Body','Held','Head','Feet','Legs']) {
    const id=eq[k]; if(!id) continue;
    const it=items[id];
    if(it&&it.slot&&!ne[it.slot]&&canWear(m,it)) ne[it.slot]=id; else bag.push(id);
  }
  m.equipment=ne;
}
const b6Owned=id=>bag.includes(id)||ALL_MEMBERS().some(m=>m.equipment&&Object.values(m.equipment).includes(id));
function b6Starters() {
  for(const m of ALL_MEMBERS()) {
    const id=B6_STARTER[m.id]; if(!id||b6Owned(id)) continue;
    if(!m.equipment.Tool) m.equipment.Tool=id; else bag.push(id);
  }
}
// After a save loads: old gear converted, starter tools handed out, everyone caught up to Tom, stamps checked.
// Save v4 (Option 3): saves before v4 have the old Stampcard. Each old move goes to the slot that plays it now; old
// passives are refunded; anything over its new level gate is refunded too (Stamp Points are worked out, not stored).
function b6AfterLoad(sv) {
  const old=!sv||!sv.members,pre4=!!sv&&(sv.v||1)<4;
  for(const m of ALL_MEMBERS()) {
    b6ConvertGear(m);
    if(old) { m.xp=0; m.next=B6.xpPerLevel; m.level=Math.max(1,Math.min(B6.maxLevel,m.level||1)); }
  }
  b6Starters();
  b6Sync();
  setTimeout(b6Badge,0);
  for(const m of ALL_MEMBERS()) {
    if(old) { m.stamps=[]; b6AutoStamp(m); }   // saves from before F6 get recommended stamps
    else { b8St(m); b6Trim(m); }
    b6Refresh(m);
  }
  if(pre4&&!old&&sv.members&&typeof showToast==='function') setTimeout(()=>showToast('New Stampcards! Moves kept, passives refunded. Menu, then STAMPS.',3.6),600);
}
// What a save keeps for every member, in the party or not.
const b6SaveMember=m=>({id:m.id,level:m.level,xp:m.xp,wins:m.wins||0,hp:m.hp,maxHp:m.maxHp,spBonus:m.spBonus||0,equipment:Object.assign({},m.equipment),
  stamps:b8St(m).slice(),ver:Object.assign({},m.ver||{}),remix:(m.remix||[]).slice(),ranks:Object.assign({},m.ranks||{}),ticketBonus:m.ticketBonus||0,
  loadouts:m.loadouts?JSON.parse(JSON.stringify(m.loadouts)):null,loadout:m.loadout||0});
function b6LoadMember(m,s) {
  if(!s) return;
  Object.assign(m,{level:s.level||1,xp:s.xp||0,next:B6.xpPerLevel,wins:s.wins||0,hp:s.hp,maxHp:s.maxHp,spBonus:s.spBonus||0});
  m.stamps=Array.isArray(s.stamps)?s.stamps.slice():[];   // the old [a, b] form is converted by b8St
  m.ver=Object.assign({},s.ver||{}); m.remix=Array.isArray(s.remix)?s.remix.slice():[]; m.ranks=Object.assign({},s.ranks||{});
  m.ticketBonus=s.ticketBonus||0; m.loadouts=Array.isArray(s.loadouts)?JSON.parse(JSON.stringify(s.loadouts)):null; m.loadout=s.loadout||0;
  if(s.equipment) m.equipment=Object.assign({},s.equipment);
}
b6RefreshAll(true);
// A gold dot on the MENU button while someone in the party has a Stamp Point they can spend right now.
function b6Badge() { const b=typeof $==='function'&&$('menu-button'); if(b) b.classList.toggle('sp-dot',party.some(b6Stampable)); }

// ---------- Menu: the Stampcard screen ----------
// Header: Stamp Points, Polish Points, Remix Tickets, Auto-Stamp, Respec, and the loadout switch (level 27).
// A CORE card (basic and signature) and the two path cards. Each row shows the equipped version, the other version,
// and its buttons: STAMP or UNDO, POLISH (rank up), REMIX (spend a ticket) or SWAP (change the equipped version).
let b6Sure=null,b6SureTimer=0;
function b6AskSure(key) { b6Sure=key; clearTimeout(b6SureTimer); b6SureTimer=setTimeout(()=>{ if(b6Sure===key) { b6Sure=null; if(menuOpen) renderMenu(); } },3500); sfx.select(); renderMenu(); }
const B8_RANK_TAG=['','','+','POLISHED'];
function b8Row(m,slot,core) {
  const node=b8Node(m.id,slot),v=b8Ver(m,slot),cur=node[v],other=node[v==='p'?'r':'p'];
  const st=core?'stamped':b6NodeState(m,slot),rank=b8Rank(m,slot),ult=!core&&b8Pos(slot)===5;
  const row=el('div','sc-node '+st+(ult?' cap':'')+(core?' core':''));
  const K='sc-'+slot,unlocked=(m.remix||[]).includes(slot),ps=b8PolishState(m,slot);
  // The circle on the left is the row's main button: STAMP while the move is next in line, POLISH once stamped.
  const face=core?'<b>'+(slot==='basic'?'B':'S')+'</b><small>'+(slot==='basic'?'BASIC':'SIG')+'</small>':st==='stamped'?'<b>✓</b>':'<b>'+b8Cost(slot)+'</b><small>SP</small>';
  let stamp;
  if(!core&&st==='next') stamp=btn('sc-stamp act go',K,face,()=>{ if(b6Stamp(m,slot)) { sfx.equip(); showToast(m.name+' learns '+cur.name+'!',2); menuFocusNext=K; renderMenu(); } });
  else if(ps==='polish') stamp=btn('sc-stamp act pol',K,face+'<i class="sc-plus">+</i>',()=>{ if(b8Polish(m,slot)) { sfx.levelChime(); showToast(cur.name+(b8Rank(m,slot)>=3?' is Polished: 1 VP cheaper.':'+ hits and heals 15% harder.'),2.4); menuFocusNext=K; renderMenu(); } });
  else stamp=el('span','sc-stamp',face);
  row.appendChild(stamp);
  const copy=el('span','sc-copy');
  const hd=el('span','sc-hd'); const t=el('span','sc-title'); t.textContent=cur.name+(rank>=2?' +':'')+(ult?' ★':''); hd.appendChild(t); copy.appendChild(hd);
  const tags=el('span','sc-tags');
  const tag=(txt,cls)=>{ const g=el('span','sc-tag'+(cls?' '+cls:'')); g.textContent=txt; tags.appendChild(g); };
  if(!core) tag('LV '+b8Gate(m,slot),m.level<b8Gate(m,slot)?'warn':'');
  // Until a version's own move is built, the numbers shown are the move that actually plays (what battle charges).
  const live=b8Move(m.id,slot,v)||cur;
  if(live.vp) tag(Math.max(1,live.vp-(rank>=3&&live.vp>1?1:0))+' VP');
  for(const e of [].concat(live.elem||[])) if(B2_ELEMS[e]) { const c=el('span','sc-tag elem'); c.textContent=B2_ELEMS[e].name; c.style.color=B2_ELEMS[e].color; tags.appendChild(c); }
  if(rank>=2) tag(B8_RANK_TAG[rank],'rank');
  // Small side actions: UNDO a stamp, REMIX (spend a ticket) or SWAP versions.
  const mini=el('span','sc-mini-wrap');
  if(!core&&st==='stamped') mini.appendChild(btn('sc-mini',K+'-u','UNDO',()=>{ b6Unstamp(m,slot); sfx.unequip(); menuFocusNext=K; renderMenu(); }));
  if(unlocked) mini.appendChild(btn('sc-mini rx',K+'-v','SWAP',()=>{ b8Equip(m,slot,v==='p'?'r':'p'); sfx.equip(); showToast(m.name+' equips '+other.name+'.',2); menuFocusNext=K+'-v'; renderMenu(); }));
  else if(b8CanRemix(m,slot)) { const sure=b6Sure==='rx-'+m.id+'-'+slot;
    mini.appendChild(btn('sc-mini rx'+(sure?' sure':''),K+'-r',sure?'USE TICKET?':'REMIX',()=>{
      if(!sure) { b6AskSure('rx-'+m.id+'-'+slot); return; }
      b6Sure=null; b8UnlockRemix(m,slot); sfx.levelChime(); showToast('Remix unlocked: '+other.name+'. SWAP to equip it.',2.6); menuFocusNext=K+'-v'; renderMenu(); })); }
  if(mini.children.length) hd.appendChild(mini);
  copy.appendChild(tags);
  const d=el('span','sc-desc'); d.textContent=cur.desc; copy.appendChild(d);
  const plays=b8Move(m.id,slot,v);
  if(!plays) { const s=el('span','sc-soon'); s.textContent='Arrives in a later update.'; copy.appendChild(s); }
  else if(!b8Built(m.id,slot,v)&&plays.name.toLowerCase()!==cur.name.toLowerCase()) { const s=el('span','sc-soon'); s.textContent='Plays as '+plays.name+' for now.'; copy.appendChild(s); }
  row.appendChild(copy);
  return row;
}
const b2MoveNameFor=(id,key)=>{ const k=B2_SKILLS[id]; if(!k) return null; const s=[k.basic,k.special,...k.skills,...(k.o3||[])].find(x=>x&&x.key===key); return s?s.name:null; };
function renderStampsTab(body,m) {
  b8St(m);
  $('menu-foot').textContent='Stamp Points every even level, Polish Points every odd level from 3, Remix Tickets from level 28. Undo and Respec are free.';
  const left=b6SpLeft(m),pp=b8PpLeft(m),tk=b8TkLeft(m);
  const head=el('div','mcard sc-head');
  const cnt=el('div','sc-counts');
  const counter=(lbl,n,sub,cls)=>{ const c=el('div','sc-points '+cls); c.appendChild(el('span','slot-label',lbl)); const v=el('span','sc-left'+(n>0?' has':'')); v.textContent=n; c.appendChild(v); const s=el('span','sc-sub'); s.textContent=sub; c.appendChild(s); cnt.appendChild(c); };
  counter('STAMP',left,b6SpEarned(m)+' earned','sp');
  counter('POLISH',pp,m.level<B8.polishFrom?'from Lv '+B8.polishFrom:b8PpEarned(m)+' earned','pp');
  counter('TICKETS',tk,m.level<B8.ticketFrom?'from Lv '+B8.ticketFrom:b8TkEarned(m)+' earned','tk');
  head.appendChild(cnt);
  const acts=el('div','sc-acts');
  const can=b8AutoHas(m);
  acts.appendChild(btn('menu-act primary'+(can?'':' dim'),'sc-auto','★ AUTO-STAMP',()=>{
    const n=b6AutoStamp(m);
    if(!n) { sfx.nope(); showToast(left?'Nothing to stamp yet. Saving up for the next one.':'Nothing to spend yet.',2.2); return; }
    sfx.levelChime(); showToast(m.name+': '+n+(n===1?' choice made.':' choices made.'),2); menuFocusNext='sc-auto'; renderMenu(); }));
  const sure=b6Sure==='clear-'+m.id,spent=b6SpSpent(m)+b8PpSpent(m);
  acts.appendChild(btn('menu-act'+(sure?' sure':'')+(spent?'':' dim'),'sc-clear',sure?'CLEAR ALL?':'RESPEC',()=>{
    if(!spent) { sfx.nope(); return; }
    if(!sure) { b6AskSure('clear-'+m.id); return; }
    b6Sure=null; b6ClearStamps(m); sfx.unequip(); showToast('Stamps and Polish back in the pocket. Remixes stay unlocked.',2.6); menuFocusNext='sc-clear'; renderMenu(); }));
  head.appendChild(acts);
  if(b8Loadouts(m)) {
    const lo=el('div','sc-acts sc-lo');
    for(const i of [0,1]) lo.appendChild(btn('menu-act'+((m.loadout||0)===i?' on':''),'sc-lo'+i,'LOADOUT '+(i+1),()=>{ if((m.loadout||0)===i) return; b8SwapLoadout(m); sfx.equip(); showToast(m.name+' switches to Loadout '+(i+1)+'.',2); menuFocusNext='sc-lo'+i; renderMenu(); }));
    head.appendChild(lo);
  } else { const n=el('div','sc-sub'); n.textContent='Lv '+m.level+' · Two Loadouts at Lv '+B8.loadoutLvl+'.'; head.appendChild(n); }
  body.appendChild(head);
  const core=el('div','mcard sc-card sc-core');
  const ct=el('div','sc-top'); ct.appendChild(el('span','sc-path','CORE')); const cn=el('span','sc-name'); cn.textContent='Basic and Signature'; ct.appendChild(cn);
  const cs=el('span','sc-psub'); cs.textContent=b8Mastery(m)?'Mastery: swap versions once per battle.':'Always known. Polish and Remix them like any node.'; ct.appendChild(cs);
  core.appendChild(ct); core.appendChild(b8Row(m,'basic',true)); core.appendChild(b8Row(m,'sig',true));
  body.appendChild(core);
  b6Paths(m.id).forEach((P,p)=>{
    const card=el('div','mcard sc-card sc-p'+p);
    const top=el('div','sc-top');
    top.appendChild(el('span','sc-path',p?'PATH B':'PATH A'));
    const nm=el('span','sc-name'); nm.textContent=P.name; top.appendChild(nm);
    const ps=el('span','sc-psub'); ps.textContent=P.sub; top.appendChild(ps);
    card.appendChild(top);
    for(const slot of B8_SLOTS.filter(s=>s[0]===(p?'B':'A'))) card.appendChild(b8Row(m,slot,false));
    body.appendChild(card);
  });
}

// ---------- Menu: the Status page ----------
const B6_STAT_NOTES={hp:'Health before a knockout.',pow:'Strikes, throws and jumps.',grit:'Shrugs off physical hits.',warmth:'Heals, baking, pep talks and Kindness.',cool:'Keeps calm under Warmth hits and statuses.',pep:'Turn speed on the ribbon.'};
function renderStatusTab(body,m) {
  $('menu-foot').textContent='Green numbers come from gear (GEAR). Skills come from the Stampcard (STAMPS).';
  const card=el('div','mcard who-card');
  const land=document.documentElement.classList.contains('landscape');
  card.appendChild(charPic(m,land?72:88));
  const vit=el('div','vitals');
  const hd=el('div','who-head');
  const tn=el('span','who-title'); tn.textContent=m.title||''; hd.appendChild(tn);
  const lv=el('span','who-lv'); lv.textContent='LV '+m.level; hd.appendChild(lv);
  vit.appendChild(hd);
  card.appendChild(vit);
  const line=(lbl,cur,max,color,txt)=>{
    const r=el('div','vrow');
    r.appendChild(el('span','vlbl',lbl));
    r.appendChild(bar(cur/max,color));
    const n=el('span','vnum'); n.textContent=txt||(cur+' / '+max); r.appendChild(n);
    vit.appendChild(r);
  };
  line('HP',m.hp,m.maxHp,m.hp/m.maxHp<=.25?'#c8553d':null);
  const top=m.level>=B6.maxLevel;
  line('XP',top?1:m.xp,top?1:B6.xpPerLevel,'#c9a24d',top?'MAX':m.xp+' / '+B6.xpPerLevel);
  const left=b6SpLeft(m);
  const note=el('div','stat-note');
  note.textContent=m.hp<=0?m.name+' is knocked out. A Wake-Up Whistle (ITEMS) or the fountain will help.':
    (m.hp/m.maxHp<=.25?'Below a quarter. '+m.name+' is kneeling in battle. ':'')+(top?'Top level. ':(B6.xpPerLevel-m.xp)+' XP to level '+(m.level+1)+'. ')+(left>0?left+' Stamp Point'+(left>1?'s':'')+' to spend.':'');
  vit.appendChild(note);
  body.appendChild(card);

  const grid=el('div','stat-grid six');
  for(const k of STAT_NAMES) {
    const base=b2Stat(m.id,k,m.level),bonus=statBonus(m,k);
    const c=el('div','stat-cell');
    c.innerHTML='<div class="slot-label">'+STAT_LABEL[k]+'</div><div class="stat-value">'+(base+bonus)+(bonus?'<span class="stat-bonus">+'+bonus+'</span>':'')+'</div><div class="stat-note"></div>';
    c.querySelector('.stat-note').textContent=B6_STAT_NOTES[k];
    grid.appendChild(c);
  }
  body.appendChild(grid);

  const T=B6_TRAITS[m.id];
  if(T) { const tc=el('div','mcard trait-card'); tc.appendChild(el('div','slot-label','TRAIT')); const tt=el('div','trait-name'); tt.textContent=T.name; tc.appendChild(tt); const tx=el('div','stat-note'); tx.textContent=T.text; tc.appendChild(tx); body.appendChild(tc); }
  const pk=b6Perks(m),pt=b6PerkText(pk);
  if(pt) { const pc=el('div','mcard trait-card'); pc.appendChild(el('div','slot-label','PERKS')); const tx=el('div','stat-note'); tx.textContent=pt+'.'; pc.appendChild(tx); body.appendChild(pc); }

  const mv=el('div','mcard');
  mv.appendChild(el('div','slot-label','MOVES'));
  const list=el('div','move-list');
  const kit=b6Kit(m.id);
  const row=(name,cost,cls)=>{ const r=el('div','move-row'+(cls?' '+cls:'')); const n=el('span','move-name'); n.textContent=name; r.appendChild(n); const c=el('span','move-cost'); c.textContent=cost; r.appendChild(c); list.appendChild(r); };
  row(kit.basic.name,'FREE');
  if(kit.special) row(kit.special.name,kit.special.vp+' VP');
  for(const s of kit.skills) row(s.name,s.vp+' VP');
  const total=B8_SLOTS.filter(sl=>b8Playable(m.id,sl)).length;
  if(kit.skills.length<total) row((total-kit.skills.length)+' more on the Stampcard','',' locked');
  mv.appendChild(list);
  mv.appendChild(btn('menu-act'+(left>0?' primary':''),'to-stamps','STAMPCARD'+(left>0?' · '+left+' SP':''),()=>setMenuTab('stamps')));
  body.appendChild(mv);
}

addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{b8Move,b8Built,B6,B6_PATHS,B8,B8_KITS,B8_COMBOS,b8St,b8Polish,b8UnlockRemix,b8Equip,b8SwapLoadout,b8LevelRewards,b8PpLeft,b8TkLeft,b8DcOpen,b6NodeState,b6Trim,b6SaveMember,b6LoadMember,b6AfterLoad,b6Kit,b6Perks,b6Stamp,b6Unstamp,b6AutoStamp,b6ClearStamps,b6SpLeft,b6SpEarned,b6GainXp,b6SetTotal,b6Total,b6Sync,b6BattleXp,b6Refresh,hero,ALL_MEMBERS}); });
