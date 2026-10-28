'use strict';
// engine/bench.js — The party bench (Part 2, chapter 11 on). The fighting party is still capped at four (PARTY_MAX); anyone
// else who is along for the story waits on the bench. Benched members walk with Tom like everyone else (they are
// followers) but are not in `party`, so they sit out fights. A Boarding Gate bench (map object with swapbench:true) swaps
// who is out front. Tom, Grace and Rose never sit out in chapter 11 (canon: they always fight); a later chapter can widen
// that by giving its CHAPTERS entry bench:{never:[...]}.
// STORY.bench is the list of member ids on the bench; it rides along in every save (saveSnapshot / loadGame below).
// Scene steps added here: {bench:'tnb'} puts a member on the bench (pulled from their home NPC, as a follower),
// {unbench:'tnb'} sends them home. Loaded after engine/story.js, before data/scenes.js.
if(!STORY.bench) STORY.bench=[];
const benchIds=()=>STORY.bench||(STORY.bench=[]);
const onBench=m=>!!m&&benchIds().includes(m.id);
const benchMembers=()=>benchIds().map(id=>MEMBERS()[id]).filter(Boolean);
const benchNever=()=>{ const c=chapterInfo(); return (c.bench&&c.bench.never)||['tom','grace','rose']; };

function benchAdd(m) {
  if(!m||onBench(m)) return true;
  if(benchNever().includes(m.id)) return false;
  if(inParty(m)) {   // an extra steps out of the party: keeps the follower and the home NPC link
    party.splice(party.indexOf(m),1); benchIds().push(m.id);
    if(typeof menuChar!=='undefined'&&menuChar>=party.length) menuChar=0;
    return true;
  }
  const h=homeNpcOf(m); if(!h) return false;
  const npc=h.npc,map=h.map;
  m.homeNpc=npc; m.homeMap=map; npc.homeX=npc.homeX??npc.x; npc.homeY=npc.homeY??npc.y;
  const ni=map.npcs.indexOf(npc); if(ni>=0) map.npcs.splice(ni,1);
  const f=makeFollower(m,RECRUIT_TALK[m.id].lines); f.x=player.x; f.y=player.y; f.facing=player.facing;
  followers.push(f); benchIds().push(m.id);
  return true;
}
function benchRemove(m) {
  const i=benchIds().indexOf(m.id); if(i>=0) benchIds().splice(i,1);
  const fi=followers.findIndex(f=>f.member===m); if(fi>=0) followers.splice(fi,1);
  if(m.homeNpc&&m.homeMap) { m.homeNpc.x=m.homeNpc.homeX; m.homeNpc.y=m.homeNpc.homeY; m.homeNpc.move=null; m.homeNpc.path=[]; m.homeMap.npcs.push(m.homeNpc); }
  m.homeNpc=null; m.homeMap=null;
}
function benchClear() { for(const m of benchMembers()) benchRemove(m); STORY.bench=[]; }
// Swap a benched member in for a party extra. Returns false if either one cannot move.
function benchSwap(inM,outM) {
  const i=party.indexOf(outM),b=benchIds(),j=b.indexOf(inM.id);
  if(i<1||j<0||benchNever().includes(outM.id)) return false;
  party[i]=inM; b[j]=outM.id;
  if(typeof b6Badge==='function') b6Badge();
  return true;
}
function benchToParty(m) {   // a free slot: no swap needed
  const j=benchIds().indexOf(m.id); if(j<0||party.length>=PARTY_MAX) return false;
  benchIds().splice(j,1); party.push(m);
  if(typeof b6Badge==='function') b6Badge();
  return true;
}

SCENE_OPS.bench=o=>S.call(()=>{ const m=MEMBERS()[o.bench]; if(m) benchAdd(m); if(!o.quiet) { sfx.levelChime&&sfx.levelChime(); } });
SCENE_OPS.unbench=o=>S.call(()=>{ const m=MEMBERS()[o.unbench]; if(m&&onBench(m)) benchRemove(m); });

// Scripts that ask for a member who is on the bench get them into the party instead of failing.
const LE_forceJoin_bench=forceJoin;
forceJoin=function(m,quiet=true) {
  if(onBench(m)) {
    if(benchToParty(m)) return true;
    const out=extras().find(canLeave); if(!out) return false;
    return benchSwap(m,out);
  }
  return LE_forceJoin_bench(m,quiet);
};
const LE_forceLeave_bench=forceLeave;
forceLeave=function(m,quiet=true) { if(onBench(m)) { benchRemove(m); return; } return LE_forceLeave_bench(m,quiet); };
// A chapter's rules can send benched members home (barred, or not allowed in this town).
const LE_applyPartyRules_bench=applyPartyRules;
applyPartyRules=function() {
  LE_applyPartyRules_bench();
  const r=partyRules();
  for(const m of benchMembers()) if(r.bar.includes(m.id)||!canBeHere(m)) benchRemove(m);
};

// ---------- Saving and loading ----------
const LE_saveSnapshot_bench=saveSnapshot;
saveSnapshot=function() { const s=LE_saveSnapshot_bench(); if(s.story) s.story.bench=benchIds().slice(); return s; };
const LE_loadGame_bench=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot); if(!sv) return false;
  benchClear();   // the old session's bench goes home first, so every home NPC is back on its map
  const ok=LE_loadGame_bench(slot);
  if(ok) {
    STORY.bench=[];
    for(const id of (sv.story&&sv.story.bench)||[]) { const m=MEMBERS()[id]; if(m&&!inParty(m)&&canBeHere(m)) benchAdd(m); }
    placeFollowers();
  }
  return ok;
};
const LE_resetStory_bench=resetStory;
resetStory=function(mode,chapter) { benchClear(); return LE_resetStory_bench(mode,chapter); };

// ---------- The Boarding Gate bench ----------
function benchMenu(o) {
  const bench=benchMembers();
  if(!bench.length) { openDialog(o.name,[(o.benchName||'BOARDING GATE')+'. Nobody is waiting on the bench right now. Everybody who came is already out front.']); return; }
  const outs=extras().filter(canLeave);
  const ask=m=>{
    if(!outs.length) { openDialog(o.name,['Nobody out front can sit this one out right now.']); return; }
    openChoice(o.name,['Who sits out so '+m.name+' can come out front?'],[
      ...outs.map(e=>({label:'SIT OUT '+e.name.toUpperCase(),fn:()=>{ if(benchSwap(m,e)) { sfx.levelChime&&sfx.levelChime(); showToast(m.name+' is out front. '+e.name+' takes the bench.',3); } }})),
      {label:'NEVER MIND',fn:()=>{}}]);
  };
  const front=party.filter(p=>p!==hero).map(p=>p.name).join(', ');
  openChoice(o.name,[(o.benchName||'BOARDING GATE')+'. Out front: Tom, '+front+'. On the bench: '+bench.map(m=>m.name).join(', ')+'.','Tom always fights. Who comes out front?'],[
    ...bench.map(m=>({label:'BRING IN '+m.name.toUpperCase(),fn:()=>ask(m)})),
    {label:'NEVER MIND',fn:()=>{}}]);
}
const LE_pressAction_bench=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move) {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v.swapbench&&STORY.mode==='full') { benchMenu(v); return; }
  }
  return LE_pressAction_bench();
};
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{benchAdd,benchRemove,benchSwap,benchToParty,benchMembers,benchIds,onBench,benchMenu,MEMBERS}); });
