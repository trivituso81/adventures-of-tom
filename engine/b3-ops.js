'use strict';
// engine/b3-ops.js — Battle 3 ops: the fixed list of small effects the engine knows how to do (architecture section 2.3).
// A move's `effects` list in data is made of these, so most moves need no code. RULES FILE: no drawing, no page, no timers.
// B3_OP_LIST is the whole design; B3_OPS holds the ones built so far. An op in the list with no function throws
// "not built yet", so the simulator names any kit line that is ahead of the engine.
const B3_OP_LIST=['damage','heal','shield','status','prime','cleanse','strip','steal','invert','push','pull','swapBar','place','pep','ruckus',
  'composure','revive','counter','ward','intercept','mark','hazard','grant','aggro','taunt','pullForward','interrupt','detonateAll','splash',
  'crack','later','summon','row','foresee','vitrify','double','rebalance','tick','upgrade','treasure','goldBall','refresh','prybar','eat','hpLoss'];
// c is the action in progress: {F, actor, src, skill, rec, targets (chosen), hit (units a damage op landed on), beats, g (which
// part of the move the beats belong to), detonated, tgt (set while a Detonation's, a hook's or a hazard's effects run), partDmg,
// tags (the act's tags), outExtra ({kind: amount} damage modifiers for this action only), stripped and cleansed (counts so far),
// inter (who took a hit for whom), lost and soak (HP lost and shield soaked per target this action),
// ledger (Composure this action has shaved per foe, paid at its end: engine/b3-resolve.js b3PayLedger), pipCap (4 for a Full Family Ruckus)}.
// Also kept on c: landed (hits landed so far), hitNo (which hit of the move is landing), detPrime (the Prime this action set off
// per target), reacted (what has already answered this action: "once per action"), spend (counters a bonus cashed in), relay and
// scale (engine/b3-custom.js). Every event an op fires carries c, so a listener can be limited to once per action.
// Who an effect lands on.
function b3Who(F,c,to) {
  if(to==='self') return [c.actor];
  if(to==='attacker') return c.src?[c.src]:[];
  if(to==='adjacent') return c.tgt?b3Adjacent(F,c.tgt):[];
  if(to==='allies') return b3Live(F,c.actor.side);
  if(to==='foes') return b3Live(F,b3Other(c.actor.side));
  // Whoever on the actor's side has the smallest share of their HP left, the actor included (the first in line on a tie).
  if(to==='lowestAlly') return b3Live(F,c.actor.side).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.slot-y.slot).slice(0,1);
  // The family member with the least Pep (the first in line on a tie): a Pep Bone from Sandbox Clue Digger.
  if(to==='lowestPepAlly') return b3Live(F,c.actor.side).filter(o=>o.pep!=null).sort((x,y)=>x.pep-y.pep||x.slot-y.slot).slice(0,1);
  // One monster picked by the fight's own dice (a Squeaky Toy).
  if(to==='randomFoe') { const L=b3Live(F,b3Other(c.actor.side)); return L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
  // The next unit of the actor's own side due on the turn bar, not counting the actor.
  if(to==='nextAlly') return b3TurnOrder(F).filter(o=>o.side===c.actor.side&&o!==c.actor).slice(0,1);
  // Whoever is due next on the turn bar, but only if that is someone else on the actor's side (Sensory Satisfying).
  if(to==='nextIfAlly') { const n=b3TurnOrder(F)[0]; return n&&n!==c.actor&&n.side===c.actor.side?[n]:[]; }
  // The slowest other family member (the lowest Speed, the first in line on a tie): TAP-Card Transfer.
  if(to==='slowestAlly') return b3Live(F,c.actor.side).filter(o=>o!==c.actor).sort((x,y)=>b3Stat(x,'spd')-b3Stat(y,'spd')||x.slot-y.slot).slice(0,1);
  // Stage 10. The monster a move or a listener is about: c.tgt (a hook), else the first one chosen.
  // otherFoes: every other monster.  otherFoesLive: the ones that are Wired or Drenched.  targetNeighbor: the one standing next to it (the lower slot when there are two).
  // linked: the other monster that wears the same Copper Banner.  randomAlly: one family member picked by the fight's own dice, the actor included.
  if(to==='otherFoes'||to==='otherFoesLive') { const p=c.tgt||c.targets[0]; return b3Live(F,b3Other(c.actor.side)).filter(o=>o!==p&&(to==='otherFoes'||o.st.wired||o.st.drenched)); }
  if(to==='targetNeighbor') { const p=c.tgt||c.targets[0]; return p?b3Adjacent(F,p).sort((x,y)=>x.slot-y.slot).slice(0,1):[]; }
  if(to==='linked') return b3Live(F,b3Other(c.actor.side)).filter(o=>o!==c.tgt&&o.st.copper_link);
  if(to==='randomAlly') { const L=b3Live(F,c.actor.side); return L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
  // Stage 11. otherAllies: every other monster on the actor's side.  randomOtherAlly: one of them picked by the fight's own dice
  // (Scene One, Marker! pulls one other monster forward).
  if(to==='otherAllies') return b3Live(F,c.actor.side).filter(o=>o!==c.actor);
  if(to==='randomOtherAlly') { const L=b3Live(F,c.actor.side).filter(o=>o!==c.actor); return L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
  // Stage 12. randomFrontAlly: one monster standing in Front, picked by the fight's own dice, the actor included (Code Red!).
  // unshielded: every family member with no shield on (THE END pushes only those).
  if(to==='randomFrontAlly') { const L=b3Live(F,c.actor.side).filter(o=>b3EffRow(F,o)==='front'); return L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
  if(to==='unshielded') return b3Live(F,b3Other(c.actor.side)).filter(o=>!b3ShieldTotal(o));
  // Stage 13. frontAllies: every monster standing in Front, the actor included (Members Only).
  // firstTarget: only the first ally the act reached (Fifty-Two Pickup puts its Pep drain and Fatigue on the first one it hits).
  if(to==='frontAllies') return b3Live(F,c.actor.side).filter(o=>b3EffRow(F,o)==='front');
  if(to==='firstTarget') { const t=c.targets[0]; return t&&b3Alive(t)?[t]:[]; }
  if(to==='target'||to==null) return c.tgt?[c.tgt]:(c.didDamage?c.hit.slice():c.targets.slice());
  throw new Error('Battle 3 effect target not built yet: '+to);
}
// A hit is soaked when a shield took all of it and no HP was lost. The status that rides on an enemy's hit then does not land (bestiary 1.1).
const b3Soaked=(c,t)=>!!(c.soak&&c.soak[t.key]>0&&!(c.lost&&c.lost[t.key]>0));
function b3PutStatus(F,c,t,e) {
  const S=B3_STATUS[e.id];
  // Warm Beats Cold: some units cannot be given some statuses at all.
  if(t.immune&&t.immune.includes(e.id)) { c.beats.push({t:'immune',tgt:t.key,id:e.id,g:c.g}); return; }
  // A Stun on a Boss is a push instead of a lost turn (spec 2.8).
  if(S.flags.includes('skipTurn')&&t.D&&t.D.role==='boss') { B3_OPS.push(F,Object.assign({},c,{tgt:t}),{n:B3_RULES.stunBossTicks,to:'target'}); return; }
  // Fresh Ride: a family member who wears it is not given the next debuff the other side aims at them; the lock is used up.
  if(S.kind==='debuff'&&c.actor.side!==t.side) { const fr=Object.keys(t.st).find(i=>B3_STATUS[i].flags.includes('blockDebuff'));
    if(fr) { b3EndStatus(F,t,fr,'used'); c.beats.push({t:'soak',tgt:t.key,id:e.id,g:c.g},{t:'statusEnd',tgt:t.key,id:fr,g:c.g}); return; } }
  // Pace-Partner Run: the status carries Amy's Speed as it is right now (b3Stat in engine/b3-core.js reads it).
  b3AddStatus(F,t,e.id,{src:c.actor,n:e.n,v:S.flags.includes('paceRun')?b3Stat(c.actor,'spd'):e.v}); c.beats.push({t:'status',tgt:t.key,id:e.id,g:c.g});
  // TAP-Card Transfer: a buff TNB puts on lasts longer.
  const tc=c.actor.custom&&c.actor.custom.tapCard; if(tc&&S.kind==='buff'&&t.side===c.actor.side&&S.dur.unit==='turn') t.st[e.id].n+=tc.extend;
  b3Fire(F,S.kind==='prime'?'primeApplied':'statusApplied',{src:c.actor,tgt:t,id:e.id,g:c.g,c},c.beats);
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
  // kind 'hazard' clears what the other side laid on the actor's own floor (it needs no target).
  // The number removed is kept in c.stripped for a damage bonus that counts it.
  strip(F,c,e) {
    if(e.kind==='hazard') {
      // (Only what the other side laid: a vessel of the family's own, TNB's Grand Amphora, stays.)
      for(const hz of F.hazards.filter(h=>{ const o=b3Unit(F,h.src); return h.side===c.actor.side&&(!o||o.side!==c.actor.side); })) { F.hazards.splice(F.hazards.indexOf(hz),1); c.stripped=(c.stripped||0)+1;
        c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:null,id:hz.id,hazard:true,g:c.g,c},c.beats); }
      return;
    }
    // kind 'shieldOrBuff' (The Draft's Pilot-Light Gust): takes the biggest shield the target has; with no shield, one buff.
    if(e.kind==='shieldOrBuff') {
      for(const t of b3Who(F,c,e.to)) {
        if(t.shields.length) { const sh=t.shields.slice().sort((a,b)=>b.amt-a.amt)[0]; t.shields.splice(t.shields.indexOf(sh),1); c.stripped=(c.stripped||0)+1;
          c.beats.push({t:'shieldEnd',tgt:t.key,sh:b3ShieldTotal(t),why:'strip',g:c.g}); b3Fire(F,'shieldEnded',{src:t,tgt:t,by:sh.src,g:c.g},c.beats); }
        else B3_OPS.strip(F,Object.assign({},c,{tgt:t}),{kind:'buff',to:'target'}); }
      return;
    }
    for(const t of b3Who(F,c,e.to)) {
      // `stat:[..]` takes only buffs that change one of those stats (Eyes On Me Clap: Speed or Evasion).
      let ids=Object.keys(t.st).filter(id=>B3_STATUS[id].kind===e.kind&&(!e.stat||B3_STATUS[id].mods.some(m=>e.stat.includes(m.stat)))).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.kind!=='stance'&&!e.all) ids=ids.slice(0,e.n||1);
      c.stripped=(c.stripped||0)+ids.length;
      for(const id of ids) { b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:t,id,g:c.g,c},c.beats); }
    }
  },
  // cleanse: takes debuffs, Primes and marks off (or only `ids`, or only a `group` such as 'mental'); n = at most that many, heaviest first.
  cleanse(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      // `minor:true` takes only a light debuff (a status weight of 4 or less: Slow, Fatigue, an accuracy drop), lightest first (Baby-Wipe Swipe).
      let ids=Object.keys(t.st).filter(id=>{ const S=B3_STATUS[id]; return e.ids?e.ids.includes(id):e.group?S.group===e.group:e.minor?S.kind==='debuff'&&S.weight<=4:['debuff','prime','mark'].includes(S.kind); })
        .sort((a,b)=>e.minor?B3_STATUS[a].weight-B3_STATUS[b].weight:B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.n) ids=ids.slice(0,e.n);
      c.cleansed=(c.cleansed||0)+ids.length;
      for(const id of ids) { b3EndStatus(F,t,id,'cleanse'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'cleanse',g:c.g}); }
      if(ids.length) b3Fire(F,'cleansed',{src:c.actor,tgt:t,g:c.g,c},c.beats); }
  },
  // heal: pct is a share of the target's Max HP (a number, or a name from B3_RULES.heal). Heals and shields grow with the giver's healGiven.
  heal(F,c,e) {
    let pct=typeof e.pct==='number'?e.pct:B3_RULES.heal[e.pct];
    // `perCounter` adds `add` for every point the actor has built of a Portable Counter; spend:true empties it when the action ends (Diaper-Bag Snack Drop).
    if(e.perCounter) { const n=c.actor.counters[e.perCounter.counter]||0; pct+=e.perCounter.add*n; if(e.perCounter.spend&&n) (c.spend=c.spend||{})[c.actor.key+':'+e.perCounter.counter]=true; }
    // Forty Years a Nurse (a one-off of the Trait row, `custom:'cleanBill'`): a share of the healing that goes past full HP becomes a shield.
    const cb=c.actor.custom&&c.actor.custom.cleanBill;
    for(const t of b3Who(F,c,e.to)) { const want=Math.round(t.maxHp*pct*b3Mult(c.actor,'healGiven')*(c.scale||1)),alive=b3Alive(t),got=b3Heal(F,t,want);
      if(got) { c.beats.push({t:'heal',tgt:t.key,n:got,hp:t.hp,g:c.g}); b3Fire(F,'healed',{src:c.actor,tgt:t,n:got,g:c.g,c},c.beats); }
      if(cb&&alive&&want>got) { const sh=b3AddShield(F,t,Math.min((want-got)*cb.share,t.maxHp*cb.cap),{src:c.actor});
        if(sh) c.beats.push({t:'shield',tgt:t.key,n:sh,sh:b3ShieldTotal(t),g:c.g}); } }
  },
  shield(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const got=b3AddShield(F,t,t.maxHp*e.pct*b3Mult(c.actor,'healGiven')*(c.scale||1),{src:c.actor,n:e.turns,clay:e.clay});
      c.beats.push({t:'shield',tgt:t.key,n:got,sh:b3ShieldTotal(t),g:c.g}); }
  },
  revive(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Revive(F,t,e.hp)) continue;
      c.revived=(c.revived||0)+1;
      c.beats.push({t:'revive',src:c.actor.key,tgt:t.key,hp:t.hp,pep:t.pep,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'revive',{src:c.actor,tgt:t,g:c.g,c},c.beats); }
  },
  push(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const amt=b3Push(F,t,e.n); if(!amt) continue;
      c.beats.push({t:'push',tgt:t.key,n:amt,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:amt,g:c.g,c},c.beats); }
  },
  pull(F,c,e) {
    for(const t of b3Who(F,c,e.to)) {
      // `next:true` on the unit whose turn this is: it takes `n` ticks off the wait this very turn sets (b3EndTurn), since it has no wait yet.
      if(e.next&&F.acting===t) { t.nextPull=(t.nextPull||0)+e.n; continue; }
      const amt=b3Pull(F,t,e.n); if(!amt) continue;
      c.beats.push({t:'pull',tgt:t.key,n:amt,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:-amt,g:c.g,c},c.beats); }
  },
  place(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const amt=b3Place(F,t);
      c.beats.push({t:'pull',tgt:t.key,n:amt,placed:true,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); b3Fire(F,'barMoved',{src:c.actor,tgt:t,n:-amt,g:c.g,c},c.beats); }
  },
  pep(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(t.pep==null||!b3Alive(t)) continue;
      const got=b3Pep(F,t,e.n,'effect'); if(got) c.beats.push({t:'pep',tgt:t.key,n:got,pep:t.pep,g:c.g}); }
  },
  // interrupt: the act a foe is winding up is cancelled, and its Mark with it (bestiary 1.1). Its "every Nth turn" count starts again.
  interrupt(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)||!t.charge) continue;
      if(e.aoeOnly&&!(t.charge.hits==='all'||t.charge.tags.includes('aoe'))) continue;   // Lights-Out Reset only cancels a wound-up act on the whole family
      const A=b3LoseCharge(F,t);
      c.beats.push({t:'interrupt',src:c.actor.key,tgt:t.key,id:A.id,name:A.name,g:c.g}); }
  },
  // mark: an enemy act Marks the ally it aimed at for its follow-up (bestiary 1.1). Not a status: nothing cleanses it, and it stays
  // through a row change. It is on the ally the act AIMED at, even when someone stepped in and took the act's own hit.
  mark(F,c,e) { const t=c.targets[0]; if(t&&b3Alive(t)) c.actor.mark=t.key; },
  // summon: calls n adds of one kind into a row (bestiary 1.1 "Adds"). A full row takes no more.
  // `ifNoFront`: only when no other monster stands in the Front row (Old Iron-Gill's Soggy Sock, called as it dives behind it).
  summon(F,c,e) {
    if(e.ifNoFront&&b3Live(F,c.actor.side).some(o=>o.row!=='back')) return;
    for(let i=0;i<(e.n||1);i++) { const u=b3Summon(F,e.id,e.row,e.hp); if(!u) break;
      u.addedBy=c.actor.key; u.addedTurn=c.actor.turns;   // who called it and on which of that monster's turns (a condition `allyAge` reads it)
      c.beats.push({t:'summon',src:c.actor.key,tgt:u.key,id:u.id,name:u.name,row:u.row,hp:u.hp,bar:b3BarSnap(F,F.acting,c.rec),g:c.g}); }
  },
  // row: a monster changes its own row (Old Iron-Gill's Inlet Submerge and Deep Dive). `row` is 'front' or 'back'. Moving family members
  // between rows is a different thing (the trade, spec 2.1) and is not done here.
  // eat (Chairman Cheeks, Stash for Winter): the named monster of the actor's own side is swallowed. It is knocked out for good with no
  // answer of its own (`eaten` skips its `onKo` row), so it pays no helper feedback.
  eat(F,c,e) {
    for(const o of b3Live(F,c.actor.side)) if(o.id===e.id&&o!==c.actor) { o.eaten=true; o.hp=0; }
    b3KoCheck(F,c);
  },
  // hpLoss (helper feedback, bestiary 1.1): the target loses this share of its Max HP as flat damage: no flavor, no modifiers, no shield,
  // never enough to knock it out (it stops at 1 HP, like bounced damage).
  hpLoss(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      const n=Math.min(t.hp-1,Math.round(t.maxHp*e.pct)); if(n<=0) continue;
      t.hp-=n; c.beats.push({t:'hit',tgt:t.key,dmg:n,hp:t.hp,g:c.g}); }
  },
  row(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(t.side!=='foe'||t.row===e.row) continue;
      t.row=e.row; b3Reslot(F);
      c.beats.push({t:'row',tgt:t.key,row:e.row,g:c.g}); }
  },
  // hazard: lays a B3_HAZARDS row on one side's floor. Laying the same one again replaces it.
  hazard(F,c,e) {
    const H=B3_HAZARDS[e.id],side=H.side==='foe'?b3Other(c.actor.side):c.actor.side;
    F.hazards=F.hazards.filter(h=>!(h.id===e.id&&h.side===side));
    F.hazards.push({id:e.id,side,uses:H.uses,rounds:H.rounds,src:c.actor.key});
    c.beats.push({t:'hazardOn',id:e.id,side,uses:H.uses,rounds:H.rounds,g:c.g});
  },
  // counter: adds to (or, with a negative n, spends from) a Portable Counter.
  // When it fills to its max the `counterFull` hook fires (Walk It Off, Hydrate).
  counter(F,c,e) { for(const t of b3Who(F,c,e.to||'self')) { const was=t.counters[e.id]||0,mx=e.max!=null?e.max:(t.counterInfo[e.id]||{}).max,v=b3Counter(t,e.id,e.n,e.max); c.beats.push({t:'counter',tgt:t.key,id:e.id,v,g:c.g});
    if(mx!=null&&v>=mx&&was<mx) b3Fire(F,'counterFull',{src:t,tgt:t,id:e.id,g:c.g,c},c.beats); } },
  // crack: a battle-long cut of base Defense, 25% in total at most. once:'<name>' lets each foe take that crack one time.
  crack(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)||(e.once&&t.cracked[e.once])) continue;
      if(e.once) t.cracked[e.once]=true;
      t.crack=Math.min(B3_RULES.caps.crack,t.crack+e.n); c.beats.push({t:'crack',tgt:t.key,v:t.crack,g:c.g}); }
  },
  // taunt: a status that carries the `taunt` flag: every single-target enemy attack must aim at its carrier (spec 2.8 "locks aggro").
  taunt(F,c,e) { for(const t of b3Who(F,c,e.to||'self')) if(b3Alive(t)) b3PutStatus(F,c,t,e); },
  // vitrify: every clay shield on the chosen units is fired into Fired Glaze (engine/b3-custom.js).
  vitrify(F,c,e) { for(const t of b3Who(F,c,e.to)) for(const sh of t.shields) b3Vitrify(F,t,sh,c); },
  // double: the chosen units' carried status e.id is doubled and lasts at least e.n turns (Baxter Hill Longboard Express).
  double(F,c,e) { b3DoubleBuff(F,c,e); },
  // rebalance: a family member shares HP with the one who has the most (Waymo Tailgate Rescue).
  rebalance(F,c,e) { b3Rebalance(F,c,e); },
  // steal (stage 9c, "No Take, Only Throw!"): the actor rips n buffs off each chosen unit (the heaviest first) and wears them for the
  // turns they had left. A buff whose row says `noSteal` stays where it is. c.stolen counts what was taken (effects may carry
  // `when:'stolen'` or `when:'notStolen'`).
  steal(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      const ids=Object.keys(t.st).filter(id=>B3_STATUS[id].kind==='buff'&&!B3_STATUS[id].noSteal).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight).slice(0,e.n||1);
      for(const id of ids) { const s=t.st[id]; b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g});
        b3AddStatus(F,c.actor,id,{src:c.actor,n:s.n}); c.beats.push({t:'status',tgt:c.actor.key,id,g:c.g});
        c.stolen=(c.stolen||0)+1; b3Fire(F,'buffStripped',{src:c.actor,tgt:t,id,g:c.g,c},c.beats); } }
  },
  // tick (stage 9c, The Ghost One That Looks Back): every damage-over-time status of the chosen flavor on the chosen units ticks n times
  // at once and stays on (engine/b3-resolve.js b3TickHit).
  tick(F,c,e) {
    for(const t of b3Who(F,c,e.to)) for(let i=0;i<(e.n||1);i++) { if(!b3Alive(t)) break;
      for(const id of Object.keys(t.st)) { const S=B3_STATUS[id],s=t.st[id]; if(!S.tick||!s||(e.flavor&&S.tick.flavor!==e.flavor)) continue; b3TickHit(F,c,t,id,s); } }
  },
  // upgrade (stage 9c, 1989 Pickle-Jar Bomb): each chosen unit that carries status `from` is also given status `id` (Five-Alarm Burn on a
  // Toasty monster). The new status ends with the old one (engine/b3-core.js b3EndStatus).
  upgrade(F,c,e) { for(const t of b3Who(F,c,e.to)) if(b3Alive(t)&&t.st[e.from]) b3PutStatus(F,c,t,{id:e.id}); },
  // treasure and goldBall: Nara's Sandbox Clue Digger and Locked On the Gold Ball (engine/b3-custom.js).
  treasure(F,c,e) { b3Treasure(F,c); },
  goldBall(F,c,e) { b3GoldBall(F,c); },
  // ruckus: adds to the Family Ruckus gauge (0 to 100, shared by the party). The gauge's own gains and the two spends are in
  // engine/b3-ruckus.js; this is how a Trait, Quirk or Skill that prints its own gain adds to them.
  ruckus(F,c,e) { b3RuckusAdd(F,c.beats,c.g,e.n,c.actor&&c.actor.key,'trait'); },
  // grant: the chosen family member takes one Skill at once, out of turn (spec 2.2 "Granted actions": one per unit per round).
  //   maxPep  only Skills that cost this much or less (never a Grand Capstone; a Basic only with basic:true);  free  it costs them nothing.
  // The rules only open the door (F.grant). Whoever drives the fight (the screen, the simulator) asks that member for their
  // pick and calls b3Act for them before the clock moves on; b3Act then leaves their wait and their statuses' turn counts alone.
  // A door nobody used is closed by b3Next.
  grant(F,c,e) {
    const t=b3Who(F,c,e.to)[0]; if(!t||!b3Alive(t)||t.granted>=B3_RULES.grantedPerRound||!b3GrantSkills(F,t,e).length) return;
    t.granted++; F.grant={key:t.key,by:c.actor.key,maxPep:e.maxPep,free:!!e.free,basic:!!e.basic};
    c.beats.push({t:'grant',src:c.actor.key,tgt:t.key,g:c.g});
  },
  // foresee: each monster this move hit says who it will aim its next attack at, and keeps to that (engine/b3-foe.js b3Foresee).
  foresee(F,c,e) { for(const t of b3Who(F,c,e.to)) if(b3Alive(t)&&t.side==='foe') { const I=b3Foresee(F,t); c.beats.push({t:'foresee',foe:t.key,tgt:I?I.aim:null,kind:I?I.kind:null,name:I?I.name:null,g:c.g}); } },
  // later: effects that wait for the actor's next turn and run when it begins, before the actor picks a move (Tattered Lamby Boomerang's
  // tackle, Kingdom of Ten-Thousand Blankets' wave). The monsters it was aimed at are remembered; if they are gone, a random live one
  // takes their place. `who:'foes'` leaves the effects to aim at every monster alive at that time. engine/b3-resolve.js b3RunLater.
  later(F,c,e) { F.later.push({key:c.actor.key,name:e.name,effects:e.effects,tgt:c.targets.map(t=>t.key),who:e.who||'target',skill:c.skill}); },
  // composure: a printed Composure number. It goes into the action's ledger, which is paid when the action ends (the 3-pip cap, the Break).
  composure(F,c,e) { for(const t of b3Who(F,c,e.to)) b3Pips(c,t,e.n); },
  // refresh (Classroom Lights-Out Reset): every buff and stance the chosen units carry that lasts a number of turns or rounds goes back to its full length.
  refresh(F,c,e) { for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
    for(const id of Object.keys(t.st)) { const S=B3_STATUS[id],s=t.st[id]; if(!['buff','stance'].includes(S.kind)||!['turn','round'].includes(s.unit)) continue;
      const full=S.dur.n; if(s.n<full) { s.n=full; c.beats.push({t:'status',tgt:t.key,id,g:c.g}); } } } },
  // prybar (Demo-Day Prybar, engine/b3-custom.js): rips the barrier off, hits, and blasts the barrier's value into the monsters next to it.
  prybar(F,c,e) { b3Prybar(F,c,e); },
  // splash: a share of the hit that set it off, as plain damage of one flavor (Short Circuit!). With `of:'dealt'` the share is of
  // what the whole action has taken off the monster it is about (Creative Mess); when that is nothing (a debuff from a move that
  // deals no damage), it is a standard hit's worth of the actor's Attack.
  splash(F,c,e) {
    // In a Skill's own list `of:'dealt'` is what this action took off the first monster it was aimed at (Flashlight Block Rewire); a miss arcs nothing.
    let dealt=c.dealt; if(dealt==null) { const p=c.tgt||c.targets[0]; dealt=p?((c.lost&&c.lost[p.key])||0)+((c.soak&&c.soak[p.key])||0):0;
      if(e.of==='dealt'&&c.didDamage&&dealt<=0) return; }
    const base=e.of==='dealt'?(dealt>0?dealt:b3Stat(c.actor,'atk')*B3_RULES.power.standard):(c.partDmg||0);
    for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)) continue;
      const pv=b3Peeves(t).includes(e.flavor),rs=t.resists.includes(e.flavor);
      const dmg=Math.max(1,Math.round(base*e.share*(c.scale||1)*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(t)));
      b3Hurt(F,c,t,dmg,{src:c.actor.key,flavor:e.flavor,peeve:pv,resist:rs,splash:true});
      if(pv&&c.actor.side==='party') b3Pips(c,t,0,true); }
  }
};
// An effect may carry `when`: it runs only if something earlier in the same action happened.
//   cleansed  a cleanse in this action took at least one thing off
//   stripped  a strip in this action took at least one buff or stance off
//   revived   a revive in this action brought someone back;  notRevived  none did (To the Moon & Back heals the living instead)
//   stolen    a steal in this action took a buff;  notStolen  none did (No Take, Only Throw! then gives Nara the Attack bonus instead)
//   targetDebuffed  a monster this action hit carries a debuff (Grip-Chicken Snap)
const B3_EFFECT_WHEN=['cleansed','stripped','revived','notRevived','stolen','notStolen','targetDebuffed','mixHot'];
// c.scale below 1 (a rider held for the later hits of a multi-hit move, engine/b3-custom.js): only the ops whose size can be
// cut run, at that share; an effect that cannot be split (1 Pep, a status) does not repeat.
const B3_SCALABLE=['damage','splash','heal','shield'];
// An effect may also carry `needCounter:{id,min}`: it runs only if the actor has built at least `min` of that Portable Counter (read before the counter is spent).
function b3RunEffects(F,c,effects) {
  for(const e of (effects||[])) { const fn=B3_OPS[e.op]; if(!fn) throw new Error('Battle 3 op not built yet: '+e.op);
    if(e.needCounter&&!((c.actor.counters[e.needCounter.id]||0)>=e.needCounter.min)) continue;
    if(c.scale!=null&&c.scale<1&&!B3_SCALABLE.includes(e.op)) continue;
    if(e.when) { if(!B3_EFFECT_WHEN.includes(e.when)) throw new Error('Battle 3 effect condition not built yet: '+e.when);
      const hold=e.when==='notRevived'?!(c.revived>0):e.when==='notStolen'?!(c.stolen>0):e.when==='targetDebuffed'?(c.hit||[]).some(t=>Object.keys(t.st).some(id=>B3_STATUS[id].kind==='debuff')):(c[e.when]>0);
      if(!hold) continue; }
    fn(F,c,e); }
}
