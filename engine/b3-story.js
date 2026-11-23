'use strict';
// engine/b3-story.js — Battle 3 in the story (stage 15). Data and words: data/b3-story.js. The rules are not touched here.
//
// ONE DOOR. `startBattle(npc,opts)` (engine/battle2.js) is the one function the map monsters and the story's {battle} step both call.
// This file wraps it: when the switch says Battle 3 plays this chapter, the fight starts in Battle 3 and comes back to the story through
// the same two doors battle 2 uses, B2.result (the story step and the boss flag read it) and `battle.active` (the step waits on it).
// Otherwise the call goes to battle 2 untouched. The ADMIN switch has three settings, kept on the phone in localStorage 'aot-b3-story':
//   old        battle 2 everywhere.
//   chapter    chapters in B3_STORY.chapters use Battle 3 (the default).
//   new        every fight Battle 3 has a formation for.
// A story fight on Battle 3 pays what a battle 2 fight pays (XP, coins, a drop, the monster leaving the map, HP carried) plus Vibe
// Points, and ends on the same victory card (engine/feel.js b7ShowCard) with a Vibe Point line per person and the Ruckus gauge.
//
// SAVES (add fields, remove none): the save gains `b3` ({v:1, ruckus}). The Ruckus gauge (0 to 100) carries from fight to fight. A save from
// before it loads with the gauge at 0. Levels and Vibe Points are floors worked out from the chapter reached (b3sMigrate): the Character
// Level is raised to B3_STORY.levelFloor for the chapter, never lowered, and each member's Vibes hold at least a pool of 135 per chapter
// finished, two thirds to the first Sig Vibe and one third to the second. Running it again changes nothing that is already at the floor.
const B3S={key:'aot-b3-story',ruckus:0,tut:null,fight:null,card:null,levelled:null};

// ---------- The switch ----------
function b3sMode() { let v=null; try { v=localStorage.getItem(B3S.key); } catch(e) {} return v==='old'||v==='new'||v==='chapter'?v:'chapter'; }
function b3sSetMode(m) { if(m!=='old'&&m!=='new'&&m!=='chapter') return b3sMode(); try { localStorage.setItem(B3S.key,m); } catch(e) {} if(typeof b3sMigrate==='function') b3sMigrate(); return m; }
const b3sFull=()=>typeof STORY!=='undefined'&&STORY.mode==='full';
// Does the switch send this chapter's story fights to Battle 3?
function b3sChapterOn(n) { const m=b3sMode(); if(m==='old') return false; if(m==='new') return true; return B3_STORY.chapters.includes(n); }
const b3sOn=()=>b3sFull()&&b3sChapterOn(STORY.chapter);
// Who fights: the party members Battle 3 has a kit for, four at most, in party order.
const b3sFighters=()=>party.filter(p=>!p.noBattle&&b3HasKit(p.id)).slice(0,B3_STORY.maxParty);

// ---------- Which fight ----------
// A map monster is its formation (B3_FORMATIONS by the monster's id). A story fight that names a count is B3_STORY.fights['<id><count>'],
// or that many of the one monster. Returns {formation|foes, vp} or null (no Battle 3 fight for it: battle 2 plays).
function b3sPlan(npc,opts) {
  const id=npc&&npc.monster; if(!id||!B3_FOES[id]) return null;
  if(opts.count) {
    const F=B3_STORY.fights[id+opts.count]; if(F) return {foes:F.foes,vp:F.vp};
    if(opts.count>3) return null;
    const form=B3_FORMATIONS[id];
    return {foes:Array.from({length:opts.count},()=>({id,row:B3_FOES[id].row||'front'})),vp:(form?form.vp:10)*opts.count/2};
  }
  const form=B3_FORMATIONS[id]; return form?{formation:id,vp:form.vp}:null;
}
const LE_startBattle_b3s=startBattle;
startBattle=function(npc,opts={}) {
  const plan=b3sOn()&&b3sFighters().length?b3sPlan(npc,opts):null;
  if(!plan) return LE_startBattle_b3s(npc,opts);
  b3sBegin(npc,opts,plan);
};
function b3sBegin(npc,opts,plan) {
  const fighters=b3sFighters(),levels={},hpShare={},loadouts={},gear={};
  for(const p of fighters) { gear[p.id]=b3GearSum(wearSlots(p).map(s=>items[p.equipment[s]])); levels[p.id]=p.level; hpShare[p.id]=p.maxHp?Math.max(0,Math.min(1,p.hp/p.maxHp)):1; loadouts[p.id]=b3MemberLoadout(p); }
  B3S.tut=opts.tut&&B3_STORY.tips[opts.tut]?{key:opts.tut,done:{}}:null;
  // A scripted story fight (B3_STORY.setup, engine/b3-script.js) carries its extras in `setup`; `vp` is the story's own number and the rules never read it.
  const S0=opts.tut&&B3_STORY.setup&&B3_STORY.setup[opts.tut];
  let setup=S0?Object.assign({},S0):null;
  if(setup) { delete setup.vp; plan=Object.assign({},plan,S0.vp!=null?{vp:S0.vp}:null); }
  // The Birthday Sash (chapter 21): Grace wears it, so the first two turns of her fight are the Birthday Girl's. The story decides who qualifies; the rules apply what they are given.
  const sashed=fighters.some(p=>p.id==='grace')&&typeof grace!=='undefined'&&grace.equipment&&items[grace.equipment.Sash]&&items[grace.equipment.Sash].sash;
  if(sashed) { setup=setup||{}; setup.start=Object.assign({},setup.start,{grace:[{id:'birthday_girl',n:2}]}); }
  B3S.fight={npc,plan,ids:fighters.map(p=>p.id)}; B3S.card=null; B3S.levelled={};
  b3Start({party:fighters.map(p=>p.id),levels,hpShare,loadouts,gear,formation:plan.formation,foes:plan.foes,setup:setup&&Object.keys(setup).length?setup:undefined,bg:typeof battleBgKey==='function'?battleBgKey():'pond',
    ruckus:B3S.ruckus,onRuckus:v=>{ B3S.ruckus=Math.max(0,Math.min(100,Math.round(v||0))); },
    award:b3sAward,beforeEnd:b3sShowCard,onTurn:b3sTip,onEnd:b3sEnd});
}

// ---------- Tips ----------
// One tip per turn, each once, in the order of the list; shown in the message line. A tip names who it is for (a member id or '*') and may
// carry when(F,u). They replace battle 2's TUTORIALS for a Battle 3 fight (no Warmth, no HEART, no Tombo rows).
function b3sTip(u) {
  const T=B3S.tut; if(!T||!u||u.side!=='party') return;
  const list=B3_STORY.tips[T.key]||[];
  for(const t of list) {
    if(T.done[t.id]||(t.who!=='*'&&t.who!==u.id)) continue;
    let ok=true; try { ok=!t.when||t.when(B3.F,u); } catch(e) { ok=false; }
    if(!ok) continue;
    T.done[t.id]=1; b3Say(t.text); return;
  }
}

// ---------- A win: what it pays ----------
// Called once by b3Finish. Pays XP, coins, a drop, the Vibe Points, takes the monster off the map and builds the victory card
// (shown on CONTINUE). Returns the line the win screen adds.
function b3sAward(F) {
  const S=B3S.fight; if(!S) return '';
  const npc=S.npc,d=monsterDef(npc),plan=S.plan;
  const foes=F.foes.filter(f=>!f.add).map(f=>({id:f.id,boss:f.D.role==='boss',lvl:F.party[0]?F.party[0].level:1,calm:false}));
  const gain=b6BattleXp(foes,npc);
  const purse=b2Purse(foes,npc,0);
  npc.tier=(npc.tier||0)+1; npc.maxHp+=d.hpStep||0; npc.defeatedUntil=performance.now()+25000; monsterFall(npc);
  coins+=purse;
  const members=S.ids.map(id=>{ const r=b3sGainFor(memberById(id),gain); if(r.ups) B3S.levelled[id]=true; return r; });
  b6Sync();
  // Vibe Points: the Main Vibe earns the formation's number, the Pocket Vibe half; everyone with a loadout earns, on the bench too.
  const book={}; for(const m of ALL_MEMBERS()) { const L=b3MemberLoadout(m); if(L) book[m.id]=L; }
  const R=b3AwardAll(book,plan.vp||0);
  for(const m of members) {
    const r=R[m.id]; if(!r) continue;
    const ups=r.ranks.map(x=>B3_VIBES[x.vibe].name+' '+x.to);
    m.vp='+'+plan.vp+' VP'+(ups.length?'  RANK UP: '+ups.join(', '):'');
  }
  let drop=null;
  const dr=d.drop;
  if(dr&&Math.random()<dr.chance&&!(dr.once&&b6Owned(dr.id))) { bag.push(dr.id); const put=typeof autoGear==='function'?autoGear():[]; drop={id:dr.id,name:(items[dr.id]||{}).name||dr.id,msg:put.length?((dr.msg||'')+' '+put.join(' ')).trim():dr.msg}; if(typeof itemBanner==='function') itemBanner([dr.id],drop.msg); }
  const many=F.foes.length>1&&F.foes.every(f=>f.id===F.foes[0].id),def=MONSTERS[F.foes[0].id]||{};
  const line=many?'The '+(def.name||F.foes[0].D.name)+'s melt back into the mud. Politely.':(def.die||F.foes[0].D.name+' goes down.');
  B3S.card={title:'VICTORY',line,xp:gain,purse,calm:0,drop,members,heart:null,puddle:false,foot:B3_FORECAST.combos+' '+Math.round(F.ruckus||0)+'%'};
  // A boss whose fall is quiet (`quietEnd` on its row: chapter 16's Marlowe, the tragedy chapter, as Battle 2's win does in data/ch16-battle.js): the sound goes off before the win
  // sound plays (b3Finish calls this award first), and the card has no title. The story's aftermath scene switches the sound back on (ch16QuietOff).
  if(F.foes.some(f=>f.D&&f.D.quietEnd)&&typeof ch16QuietOn==='function') { ch16QuietOn(); B3S.card.title='...'; }
  return '+'+(plan.vp||0)+' Vibe Points.';
}
// What one family member gets from a win on Battle 3: shared XP and levels only. Vibe Points (b3AwardAll, engine/b3-progress.js) are the one
// progression, so a level-up pays no Stamp Point, Polish Point or Remix Ticket and the victory card carries no reward cards (stage 21).
function b3sGainFor(p,gain) {
  const lvl0=p.level,xp0=p.xp;
  p.wins=(p.wins||0)+1;
  const ups=b6GainXp(p,gain);
  if(p===hero) { const L=ups.length?ups[ups.length-1]:0; if(L>=5) p.title='Local Busybody'; else if(L>=3) p.title='Regular'; }
  return {id:p.id,name:p.name,lvl0,xp0,lvl1:p.level,xp1:p.xp,ups:ups.length};
}
function b3sShowCard(result,go) { const R=B3S.card; if(!R||typeof b7ShowCard!=='function') { go(); return; } b7ShowCard(R,go); }

// ---------- The fight is over ----------
function b3sEnd(result) {
  const S=B3S.fight; B3S.fight=null; B3S.tut=null; if(!S) return;
  const npc=S.npc,F=B3.F,win=result==='win';
  B2.result=win?'win':result==='lose'?'lose':result;   // the story's {battle} step and the boss flag below read it; a scripted end (engine/b3-script.js) is 'flee' or 'shell', as battle 2 wrote them
  // HP goes back to the real members as a share of their own Max HP (a level up refills it, as in battle 2).
  for(const id of S.ids) {
    const mem=memberById(id),u=F&&F.party.find(p=>p.id===id);
    if(result==='lose') mem.hp=1;   // battle 2's loss: everyone is left at 1 HP
    else if(u) mem.hp=win&&B3S.levelled&&B3S.levelled[id]?mem.maxHp:u.hp<=0?0:Math.max(1,Math.round(mem.maxHp*u.hp/u.maxHp));
  }
  if(result==='lose'&&typeof showToast==='function') showToast(regionOf(currentMap)==='la'?'Ouch. The taco truck downtown fixes everything.':'Ouch. Visit the wish fountain to recover.',3.2);
  if(npc&&npc.monster&&STORY.mode==='full'&&typeof b7IsBoss==='function'&&b7IsBoss(npc)) setFlag('battle:'+npc.monster,win?'win':'lose');   // (the story's battle op sets this too, from B2.result)
  // Battle 3 has no Warmth bar, so the kind ending is not earned in the fight: a boss that reaches 0 HP gets the kind ending in the scene after
  // (retired card c-gem-pillar-hp). Chapter 1 is left as Milestone B has it (its scene is kind already). Battle 2 sets this flag when the Warmth bar sends a boss home; the after-boss scenes of chapters 3 to 5
  // (data/scenes.js) and the boss finales (engine/boss-finale.js bossKind) read it, so a win here sets it and the plain ending stays for OLD.
  if(win&&npc&&npc.monster&&STORY.mode==='full'&&STORY.chapter>=2&&typeof b7IsBoss==='function'&&b7IsBoss(npc)) setFlag('kind:'+npc.monster,(flag('kind:'+npc.monster)||0)+1);
  if(typeof renderMenu==='function') renderMenu();
  // A short breather before map monsters can engage again (engine/feel.js b7AfterBattle, which reads battle 2's config, so done here).
  if(typeof B7!=='undefined') { B7.auto=false; clearTimeout(B7.autoTimer); if(typeof b7SetClose==='function') b7SetClose(); const T=$('b7-tools'); if(T) T.hidden=true; B7.noEngage=performance.now()+3500; }
  if(npc) { npc.chasing=false; if(!win) npc.chaseOff=performance.now()+9000; }
  if(npc&&typeof saveGame==='function') saveGame('auto',true);
}

// ---------- Saves, fresh games, jumps ----------
const LE_saveSnapshot_b3s=saveSnapshot;
saveSnapshot=function() { const s=LE_saveSnapshot_b3s(); s.b3={v:1,ruckus:Math.round(B3S.ruckus)}; return s; };
const LE_loadGame_b3s=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot),ok=LE_loadGame_b3s(slot);
  if(ok&&sv) { B3S.ruckus=sv.b3&&Number.isFinite(Number(sv.b3.ruckus))?Math.max(0,Math.min(100,Math.round(Number(sv.b3.ruckus)))):0; b3sMigrate(); }
  return ok;
};
// The Character Level and Vibe Point floors for the chapter reached. Idempotent: a member already at or above a floor is left alone.
function b3sMigrate(chapter) {
  if(!b3sFull()) return;
  const ch=chapter||STORY.chapter||1,B=B3_STORY.bonus&&B3_STORY.bonus[ch],finished=B?B.finished:Math.max(0,ch-1);   // a bonus chapter has its own floors (data/b3-story.js)
  if(b3sChapterOn(ch)) {
    const fl=B?B.level:B3_STORY.levelFloor[Math.min(ch,B3_STORY.levelFloor.length-1)]||1;
    for(const m of ALL_MEMBERS()) if(m.level<fl) { b6SetTotal(m,(fl-1)*B6.xpPerLevel); b6Refresh(m,true); }
    if(typeof b6Badge==='function') b6Badge();
  }
  const pool=B3_STORY.vpPerChapter*finished; if(pool<=0) return;
  const M=b3MasterVp();
  for(const m of ALL_MEMBERS()) {
    if(!b3HasKit(m.id)||b3IsLate(m.id)) continue;
    const L=b3MemberLoadout(m),ids=B3_CAST[m.id].vibes; if(!L) continue;
    let a=Math.round(pool*B3_STORY.split[0]),b=pool-a;
    if(a>M) { b+=a-M; a=M; } if(b>M) b=M;
    if(ids[0]) L.vp[ids[0]]=Math.max(L.vp[ids[0]]||0,a);
    if(ids[1]) L.vp[ids[1]]=Math.max(L.vp[ids[1]]||0,b);
  }
}
// A new game: everyone starts at Rank 1 with the gauge empty. (Chapter Select: below.)
function b3sFresh() { B3S.ruckus=0; for(const m of ALL_MEMBERS()) m.vibes=null; }
const LE_beginOpening_b3s=beginOpening;
beginOpening=function() { b3sFresh(); return LE_beginOpening_b3s(); };
// Chapter Select: everyone starts from fresh loadouts, then the floors for the chapter chosen. Chapter 1 is a brand new start.
const LE_chapterJump_b3s=chapterJump;
chapterJump=function(n) {
  b3sFresh();
  const r=LE_chapterJump_b3s(n);
  if(n>=2) b3sMigrate(n);
  return r;
};
// Entering a chapter brings the floors up to it (a player who skipped fights is never behind the chapter).
const LE_setChapter_b3s=setChapter;
setChapter=function(n,o) { const r=LE_setChapter_b3s(n,o); b3sMigrate(n); return r; };
// A late joiner's loadout is made when the story brings them in, from the pool of that moment (spec section 1).
const LE_recruitJoin_b3s=recruitJoin;
recruitJoin=function(m,...rest) { const r=LE_recruitJoin_b3s(m,...rest); if(m&&b3IsLate(m.id)&&inParty(m)) b3MemberLoadout(m); return r; };
const LE_benchAdd_b3s=benchAdd;
benchAdd=function(m) { const r=LE_benchAdd_b3s(m); if(r&&m&&b3IsLate(m.id)) b3MemberLoadout(m); return r; };

window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3S,b3sMode,b3sSetMode,b3sOn,b3sPlan,b3sMigrate,b3sChapterOn}); });
