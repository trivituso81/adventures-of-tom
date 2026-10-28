'use strict';
// engine/benchcall.js — BENCH CALL (chapter 11, the FINAL CALL fight). Anyone on the party bench (engine/bench.js) comes along
// to a boss fight as a reserve. In battle, ▼ Bag, BENCH CALL is free of VP and costs the caller's turn: the fourth member (the
// one who is not Tom, Grace or Rose) steps out and a reserve steps in at the same slot, acting very soon. The member who steps
// out keeps their HP and VP and waits as a reserve, so they can be called back in. Only fights that list reserves have the row
// (b2Start gets cfg.reserve from the bench; today that is the FINAL CALL, Twin Lenses, Oblivion Censor, Chronos-Leviathan and Julian fights). Loaded after engine/bench.js and battle2-ui.js.
const B2_NEVER_SIT=['tom','grace','rose'];
// Fights that bring the bench along (data/ch20-battle.js adds the finale's two). B2.benchFree (set by a fight) makes BENCH CALL nearly free: the caller acts again almost at once.
const B2_BENCH_FIGHTS=['finalcall','twinlens','censor','leviathan','julian'];
const LE_b2Start_bench=b2Start;
b2Start=function(cfg) {
  const ids=(cfg.foes||[]).map(f=>Array.isArray(f)?f[0]:f.id);
  B2.reserve=[];
  if(cfg.npc&&ids.some(i=>B2_BENCH_FIGHTS.includes(i))&&typeof benchMembers==='function') cfg.reserveIds=benchMembers().map(m=>m.id);
  const r=LE_b2Start_bench(cfg);
  if(cfg.reserveIds) {
    const lv=(cfg.levels)||{};
    B2.reserve=cfg.reserveIds.map((id,i)=>b2PartyUnit(id,lv[id]||memberById(id).level||13,B2.party.length+i,true));
    b2BenchSync();
  }
  return r;
};
// The member who would step out: the one outside the Tom, Grace and Rose core (a knocked-out one first).
const b2BenchOut=()=>{ const ex=B2.party.filter(p=>!B2_NEVER_SIT.includes(p.id)); return ex.find(p=>p.hp<=0)||ex[0]||null; };
// Reserves point at the slot they would fill, so the green target arrow has somewhere to stand.
const b2BenchSync=()=>{ const o=b2BenchOut(); if(o) for(const r of B2.reserve||[]) r.idx=o.idx; };
const b2BenchReady=()=>!!(B2.reserve&&B2.reserve.length&&b2BenchOut()&&!B2.benchBlocked);

const LE_b2BagList_bench=b2BagList;
b2BagList=function(u) {
  const rows=LE_b2BagList_bench(u);
  if(b2BenchReady()) {
    const out=b2BenchOut();
    const i=Math.max(0,rows.findIndex(r=>r.run));
    rows.splice(i,0,{name:'BENCH CALL',role:'buff',sub:'Free · costs this turn · '+out.name+' steps out',benchcall:true});
  }
  return rows;
};
const LE_b2Info_bench=b2Info;
b2Info=function() {
  if(battle.state==='command'&&B2.actor&&B2.ui==='bag') {
    const r=b2BagList(B2.actor)[B2.sel];
    if(r&&r.benchcall) { b2Msg('BENCH CALL. Wave in '+B2.reserve.map(x=>x.name).join(' or ')+' from the bench. '+b2BenchOut().name+' steps out, and the new friend acts almost at once. Costs this turn.'); return; }
  }
  return LE_b2Info_bench();
};
const LE_b2Pick_bench=b2Pick;
b2Pick=function(i) {
  const u=B2.actor;
  if(B2.ui==='bag'&&u) {
    const r=b2BagList(u)[i];
    if(r&&r.benchcall) {
      B2.sel=i; sfx.select();
      const act={benchcall:true,name:'BENCH CALL',weight:'standard'};
      const opts=B2.reserve.map(x=>({label:x.name,targets:[x],primary:x,ally:true}));
      if(opts.length===1) { b2Do(act,opts[0]); return; }
      B2.pending=act; B2.opts=opts; B2.prevUi='bag'; B2.prevSel=i; b2Open('target',0);
      return;
    }
  }
  return LE_b2Pick_bench(i);
};
const LE_b2Do_bench=b2Do;
b2Do=function(act,opt) {
  if(!(act&&act.benchcall)) return LE_b2Do_bench(act,opt);
  const u=B2.actor; if(!u||battle.state!=='command') return;
  const inc=opt&&opt.primary,out=b2BenchOut();
  if(!inc||!out||!B2.reserve.includes(inc)) { sfx.nope&&sfx.nope(); return; }
  battle.state='busy'; B2.ui='busy'; B2.pending=null;
  u.ct=b2Delay(u,B2.benchFree?.25:'standard');
  const idx=out.idx;
  B2.reserve.splice(B2.reserve.indexOf(inc),1,out);   // the one stepping out takes the reserve's place
  inc.idx=idx; inc.st={}; inc.guard=false; inc.turns=0; inc.ct=Math.max(0,b2Delay(inc,.3));
  B2.party[idx]=inc;
  B2.units=[...B2.party,...B2.foes]; b2BenchSync();
  const f=battle.fx[idx]; if(f) { for(const k in f) if(typeof f[k]==='number') f[k]=0; f.poseK=''; f.path=null; f.koAt=null; f.hop=.5; }
  if(B2.lastTarget===out) B2.lastTarget=null;
  b2Render();
  enqueue(()=>{ sfx.ding&&sfx.ding(); b2Msg('BENCH CALL! '+u.name+' waves toward the bench. '+inc.name+' hops in. '+out.name+' takes a seat.'); b2PopParty&&b2PopParty(inc,'IN','#f2c75a',-18); b2Render(); },1700,
    ()=>{ if(inc.id==='nara'&&sfx.bark) sfx.bark(); },300,()=>b2AfterAction());
};
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{b2BenchOut,b2BenchReady,b2BagList:u=>b2BagList(u),b2Pick:i=>b2Pick(i),forceJoin:(m,q)=>forceJoin(m,q),bag}); });
