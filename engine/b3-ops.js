'use strict';
// engine/b3-ops.js — Battle 3 ops: the fixed list of small effects the engine knows how to do (architecture section 2.3).
// A move's `effects` list in data is made of these, so most moves need no code. RULES FILE: no drawing, no page, no timers.
// B3_OP_LIST is the whole design; B3_OPS holds the ones built so far. An op in the list with no function throws
// "not built yet", so the simulator names any kit line that is ahead of the engine.
const B3_OP_LIST=['damage','heal','shield','status','prime','cleanse','strip','steal','invert','push','pull','swapBar','place','pep','ruckus',
  'composure','revive','counter','ward','intercept','mark','hazard','grant','aggro','taunt','pullForward','interrupt','detonateAll','splash',
  'crack','later','summon','row'];
// c is the action in progress: {F, actor, src, skill, rec, targets (chosen), hit (units a damage op landed on), beats, g (which
// part of the move the beats belong to), detonated, tgt (set while a Detonation's, a hook's or a hazard's effects run), partDmg,
// tags (the act's tags), outExtra ({kind: amount} damage modifiers for this action only), stripped and cleansed (counts so far),
// inter (who took a hit for whom), lost and soak (HP lost and shield soaked per target this action),
// ledger (Composure this action has shaved per foe, paid at its end: engine/b3-resolve.js b3PayLedger), pipCap (4 for a Full Family Ruckus)}.
// Who an effect lands on.
function b3Who(F,c,to) {
  if(to==='self') return [c.actor];
  if(to==='attacker') return c.src?[c.src]:[];
  if(to==='adjacent') return c.tgt?b3Adjacent(F,c.tgt):[];
  if(to==='allies') return b3Live(F,c.actor.side);
  // Whoever on the actor's side has the smallest share of their HP left, the actor included (the first in line on a tie).
  if(to==='lowestAlly') return b3Live(F,c.actor.side).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.slot-y.slot).slice(0,1);
  // The next unit of the actor's own side due on the turn bar, not counting the actor.
  if(to==='nextAlly') return b3TurnOrder(F).filter(o=>o.side===c.actor.side&&o!==c.actor).slice(0,1);
  if(to==='target'||to==null) return c.tgt?[c.tgt]:(c.didDamage?c.hit.slice():c.targets.slice());
  throw new Error('Battle 3 effect target not built yet: '+to);
}
// A hit is soaked when a shield took all of it and no HP was lost. The status that rides on an enemy's hit then does not land (bestiary 1.1).
const b3Soaked=(c,t)=>!!(c.soak&&c.soak[t.key]>0&&!(c.lost&&c.lost[t.key]>0));
function b3PutStatus(F,c,t,e) {
  const S=B3_STATUS[e.id];
  // A Stun on a Boss is a push instead of a lost turn (spec 2.8).
  if(S.flags.includes('skipTurn')&&t.D&&t.D.role==='boss') { B3_OPS.push(F,Object.assign({},c,{tgt:t}),{n:B3_RULES.stunBossTicks,to:'target'}); return; }
  b3AddStatus(F,t,e.id,{src:c.actor,n:e.n,v:e.v}); c.beats.push({t:'status',tgt:t.key,id:e.id,g:c.g});
  b3Fire(F,S.kind==='prime'?'primeApplied':'statusApplied',{src:c.actor,tgt:t,id:e.id,g:c.g},c.beats);
}
const B3_OPS={
  damage(F,c,e) { b3DamageOp(F,c,e); },
  status(F,c,e) {
    const rides=c.actor.side==='foe'&&c.didDamage&&!c.tgt&&(e.to==='target'||e.to==null);
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      if(rides&&b3Soaked(c,t)) { c.beats.push({t:'soak',tgt:t.key,id:e.id,g:c.g}); continue; }
      b3PutStatus(F,c,t,e); }
  },
  prime(F,c,e) { B3_OPS.status(F,c,e); },
  // intercept: the status goes on each chosen ally (never on the actor); its data row says how much weaker the actor takes the hit.
  intercept(F,c,e) { for(const t of b3Who(F,c,e.to)) if(b3Alive(t)&&t!==c.actor) b3PutStatus(F,c,t,e); },
  // strip: kind 'stance' drops every stance; kind 'buff' removes n buffs, the heaviest first, or all of them with all:true.
  // The number removed is kept in c.stripped for a damage bonus that counts it.
  strip(F,c,e) {
    for(const t of b3Who(F,c,e.to)) {
      let ids=Object.keys(t.st).filter(id=>B3_STATUS[id].kind===e.kind).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.kind!=='stance'&&!e.all) ids=ids.slice(0,e.n||1);
      c.stripped=(c.stripped||0)+ids.length;
      for(const id of ids) { b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:t,id,g:c.g},c.beats); }
    }
  },
  // cleanse: takes debuffs, Primes and marks off (or only `ids`, or only a `group` such as 'mental'); n = at most that many, heaviest first.
  cleanse(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      let ids=Object.keys(t.st).filter(id=>{ const S=B3_STATUS[id]; return e.ids?e.ids.includes(id):e.group?S.group===e.group:['debuff','prime','mark'].includes(S.kind); })
        .sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.n) ids=ids.slice(0,e.n);
      c.cleansed=(c.cleansed||0)+ids.length;
      for(const id of ids) { b3EndStatus(F,t,id,'cleanse'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'cleanse',g:c.g}); }
      if(ids.length) b3Fire(F,'cleansed',{src:c.actor,tgt:t,g:c.g},c.beats); }
  },
  // heal: pct is a share of the target's Max HP (a number, or a name from B3_RULES.heal). Heals and shields grow with the giver's healGiven.
  heal(F,c,e) {
    const pct=typeof e.pct==='number'?e.pct:B3_RULES.heal[e.pct];
    for(const t of b3Who(F,c,e.to)) { const got=b3Heal(F,t,t.maxHp*pct*b3Mult(c.actor,'healGiven')); if(!got) continue;
      c.beats.push({t:'heal',tgt:t.key,n:got,hp:t.hp,g:c.g}); b3Fire(F,'healed',{src:c.actor,tgt:t,n:got,g:c.g},c.beats); }
  },
  shield(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const got=b3AddShield(F,t,t.maxHp*e.pct*b3Mult(c.actor,'healGiven'),{src:c.actor,n:e.turns});
      c.beats.push({t:'shield',tgt:t.key,n:got,sh:b3ShieldTotal(t),g:c.g}); }
  },
  revive(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Revive(F,t,e.hp)) continue;
      c.beats.push({t:'revive',src:c.actor.key,tgt:t.key,hp:t.hp,pep:t.pep,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'revive',{src:c.actor,tgt:t,g:c.g},c.beats); }
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
  // interrupt: the act a foe is winding up is cancelled, and its Mark with it (bestiary 1.1). Its "every Nth turn" count starts again.
  interrupt(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)||!t.charge) continue;
      const A=b3LoseCharge(F,t);
      c.beats.push({t:'interrupt',src:c.actor.key,tgt:t.key,id:A.id,name:A.name,g:c.g}); }
  },
  // mark: an enemy act Marks the ally it aimed at for its follow-up (bestiary 1.1). Not a status: nothing cleanses it, and it stays
  // through a row change. It is on the ally the act AIMED at, even when someone stepped in and took the act's own hit.
  mark(F,c,e) { const t=c.targets[0]; if(t&&b3Alive(t)) c.actor.mark=t.key; },
  // summon: calls n adds of one kind into a row (bestiary 1.1 "Adds"). A full row takes no more.
  summon(F,c,e) {
    for(let i=0;i<(e.n||1);i++) { const u=b3Summon(F,e.id,e.row,e.hp); if(!u) break;
      c.beats.push({t:'summon',src:c.actor.key,tgt:u.key,id:u.id,name:u.name,row:u.row,hp:u.hp,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); }
  },
  // hazard: lays a B3_HAZARDS row on one side's floor. Laying the same one again replaces it.
  hazard(F,c,e) {
    const H=B3_HAZARDS[e.id],side=H.side==='foe'?b3Other(c.actor.side):c.actor.side;
    F.hazards=F.hazards.filter(h=>!(h.id===e.id&&h.side===side));
    F.hazards.push({id:e.id,side,uses:H.uses,rounds:H.rounds,src:c.actor.key});
    c.beats.push({t:'hazardOn',id:e.id,side,uses:H.uses,rounds:H.rounds,g:c.g});
  },
  // counter: adds to (or, with a negative n, spends from) a Portable Counter.
  counter(F,c,e) { for(const t of b3Who(F,c,e.to||'self')) { const v=b3Counter(t,e.id,e.n,e.max); c.beats.push({t:'counter',tgt:t.key,id:e.id,v,g:c.g}); } },
  // crack: a battle-long cut of base Defense, 25% in total at most. once:'<name>' lets each foe take that crack one time.
  crack(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)||(e.once&&t.cracked[e.once])) continue;
      if(e.once) t.cracked[e.once]=true;
      t.crack=Math.min(B3_RULES.caps.crack,t.crack+e.n); c.beats.push({t:'crack',tgt:t.key,v:t.crack,g:c.g}); }
  },
  // composure: a printed Composure number. It goes into the action's ledger, which is paid when the action ends (the 3-pip cap, the Break).
  composure(F,c,e) { for(const t of b3Who(F,c,e.to)) b3Pips(c,t,e.n); },
  // splash: a share of the hit that set it off, as plain damage of one flavor (Short Circuit!).
  splash(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      const pv=t.peeves.includes(e.flavor),rs=t.resists.includes(e.flavor);
      const dmg=Math.max(1,Math.round((c.partDmg||0)*e.share*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(t)));
      b3Hurt(F,c,t,dmg,{src:c.actor.key,flavor:e.flavor,peeve:pv,resist:rs,splash:true});
      if(pv&&c.actor.side==='party') b3Pips(c,t,0,true); }
  }
};
// An effect may carry `when`: it runs only if something earlier in the same action happened.
//   cleansed  a cleanse in this action took at least one thing off
//   stripped  a strip in this action took at least one buff or stance off
const B3_EFFECT_WHEN=['cleansed','stripped'];
function b3RunEffects(F,c,effects) {
  for(const e of (effects||[])) { const fn=B3_OPS[e.op]; if(!fn) throw new Error('Battle 3 op not built yet: '+e.op);
    if(e.when) { if(!B3_EFFECT_WHEN.includes(e.when)) throw new Error('Battle 3 effect condition not built yet: '+e.when); if(!(c[e.when]>0)) continue; }
    fn(F,c,e); }
}
