'use strict';
// engine/b3-ops.js — Battle 3 ops: the fixed list of small effects the engine knows how to do (architecture section 2.3).
// A move's `effects` list in data is made of these, so most moves need no code. RULES FILE: no drawing, no page, no timers.
// B3_OP_LIST is the whole design; B3_OPS holds the ones built so far. An op in the list with no function throws
// "not built yet", so the simulator names any kit line that is ahead of the engine.
const B3_OP_LIST=['damage','heal','shield','status','prime','cleanse','strip','steal','invert','push','pull','swapBar','place','pep','ruckus',
  'composure','revive','counter','ward','intercept','mark','hazard','grant','aggro','taunt','pullForward','interrupt','detonateAll','splash',
  'crack','later','summon','row'];
// c is the action in progress: {F, actor, src, skill, rec, targets (chosen), hit (units a damage op landed on), beats, g (which
// hit the beats belong to), detonated, tgt (set while a Detonation's or a hook's effects run), partDmg}.
// Who an effect lands on.
function b3Who(F,c,to) {
  if(to==='self') return [c.actor];
  if(to==='attacker') return c.src?[c.src]:[];
  if(to==='adjacent') return c.tgt?b3Adjacent(F,c.tgt):[];
  if(to==='target'||to==null) return c.tgt?[c.tgt]:(c.didDamage?c.hit.slice():c.targets.slice());
  throw new Error('Battle 3 effect target not built yet: '+to);
}
const B3_OPS={
  damage(F,c,e) { b3DamageOp(F,c,e); },
  status(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      b3AddStatus(F,t,e.id,{src:c.actor,n:e.n}); c.beats.push({t:'status',tgt:t.key,id:e.id,g:c.g});
      b3Fire(F,B3_STATUS[e.id].kind==='prime'?'primeApplied':'statusApplied',{src:c.actor,tgt:t,id:e.id,g:c.g},c.beats); }
  },
  prime(F,c,e) { B3_OPS.status(F,c,e); },
  // strip: kind 'stance' drops every stance; kind 'buff' removes n buffs, the heaviest first.
  strip(F,c,e) {
    for(const t of b3Who(F,c,e.to)) {
      let ids=Object.keys(t.st).filter(id=>B3_STATUS[id].kind===e.kind).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.kind!=='stance') ids=ids.slice(0,e.n||1);
      for(const id of ids) { b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:t,id,g:c.g},c.beats); }
    }
  },
  push(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const amt=b3Push(F,t,e.n); if(!amt) continue;
      c.beats.push({t:'push',tgt:t.key,n:amt,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:amt,g:c.g},c.beats); }
  },
  pull(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const amt=b3Pull(F,t,e.n); if(!amt) continue;
      c.beats.push({t:'pull',tgt:t.key,n:amt,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:-amt,g:c.g},c.beats); }
  },
  place(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const amt=b3Place(F,t);
      c.beats.push({t:'pull',tgt:t.key,n:amt,placed:true,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:-amt,g:c.g},c.beats); }
  },
  pep(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(t.pep==null||!b3Alive(t)) continue;
      const got=b3Pep(F,t,e.n,'effect'); if(got) c.beats.push({t:'pep',tgt:t.key,n:got,pep:t.pep,g:c.g}); }
  },
  // splash: a share of the hit that set it off, as plain damage of one flavor (Short Circuit!).
  splash(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      const pv=t.peeves.includes(e.flavor),rs=t.resists.includes(e.flavor);
      const dmg=Math.max(1,Math.round((c.partDmg||0)*e.share*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(t)));
      b3Hurt(F,c,t,dmg,{src:c.actor.key,flavor:e.flavor,peeve:pv,resist:rs,splash:true}); }
  }
};
function b3RunEffects(F,c,effects) {
  for(const e of (effects||[])) { const fn=B3_OPS[e.op]; if(!fn) throw new Error('Battle 3 op not built yet: '+e.op); fn(F,c,e); }
}
