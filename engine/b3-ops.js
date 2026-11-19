'use strict';
// engine/b3-ops.js — Battle 3 ops: the fixed list of small effects the engine knows how to do (architecture section 2.3).
// A move's `effects` list in data is made of these, so most moves need no code. RULES FILE: no drawing, no page, no timers.
// B3_OP_LIST is the whole design; B3_OPS holds the ones built so far. An op in the list with no function throws
// "not built yet", so the simulator names any kit line that is ahead of the engine.
const B3_OP_LIST=['damage','heal','shield','status','prime','cleanse','strip','steal','invert','push','pull','swapBar','place','pep','ruckus',
  'composure','revive','counter','ward','intercept','mark','hazard','grant','aggro','taunt','pullForward','interrupt','detonateAll','splash',
  'crack','later','summon','row','foresee'];
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
  // The next unit of the actor's own side due on the turn bar, not counting the actor.
  if(to==='nextAlly') return b3TurnOrder(F).filter(o=>o.side===c.actor.side&&o!==c.actor).slice(0,1);
  // Whoever is due next on the turn bar, but only if that is someone else on the actor's side (Sensory Satisfying).
  if(to==='nextIfAlly') { const n=b3TurnOrder(F)[0]; return n&&n!==c.actor&&n.side===c.actor.side?[n]:[]; }
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
  b3AddStatus(F,t,e.id,{src:c.actor,n:e.n,v:e.v}); c.beats.push({t:'status',tgt:t.key,id:e.id,g:c.g});
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
      for(const hz of F.hazards.filter(h=>h.side===c.actor.side)) { F.hazards.splice(F.hazards.indexOf(hz),1); c.stripped=(c.stripped||0)+1;
        c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:null,id:hz.id,hazard:true,g:c.g,c},c.beats); }
      return;
    }
    for(const t of b3Who(F,c,e.to)) {
      let ids=Object.keys(t.st).filter(id=>B3_STATUS[id].kind===e.kind).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight);
      if(e.kind!=='stance'&&!e.all) ids=ids.slice(0,e.n||1);
      c.stripped=(c.stripped||0)+ids.length;
      for(const id of ids) { b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); b3Fire(F,'buffStripped',{src:c.actor,tgt:t,id,g:c.g,c},c.beats); }
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
      if(ids.length) b3Fire(F,'cleansed',{src:c.actor,tgt:t,g:c.g,c},c.beats); }
  },
  // heal: pct is a share of the target's Max HP (a number, or a name from B3_RULES.heal). Heals and shields grow with the giver's healGiven.
  heal(F,c,e) {
    const pct=typeof e.pct==='number'?e.pct:B3_RULES.heal[e.pct];
    // Forty Years a Nurse (a one-off of the Trait row, `custom:'cleanBill'`): a share of the healing that goes past full HP becomes a shield.
    const cb=c.actor.custom&&c.actor.custom.cleanBill;
    for(const t of b3Who(F,c,e.to)) { const want=Math.round(t.maxHp*pct*b3Mult(c.actor,'healGiven')*(c.scale||1)),alive=b3Alive(t),got=b3Heal(F,t,want);
      if(got) { c.beats.push({t:'heal',tgt:t.key,n:got,hp:t.hp,g:c.g}); b3Fire(F,'healed',{src:c.actor,tgt:t,n:got,g:c.g,c},c.beats); }
      if(cb&&alive&&want>got) { const sh=b3AddShield(F,t,Math.min((want-got)*cb.share,t.maxHp*cb.cap),{src:c.actor});
        if(sh) c.beats.push({t:'shield',tgt:t.key,n:sh,sh:b3ShieldTotal(t),g:c.g}); } }
  },
  shield(F,c,e) {
    for(const t of b3Who(F,c,e.to)) { const got=b3AddShield(F,t,t.maxHp*e.pct*b3Mult(c.actor,'healGiven')*(c.scale||1),{src:c.actor,n:e.turns});
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
    for(const t of b3Who(F,c,e.to)) { const amt=b3Pull(F,t,e.n); if(!amt) continue;
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
  // taunt: a status that carries the `taunt` flag: every single-target enemy attack must aim at its carrier (spec 2.8 "locks aggro").
  taunt(F,c,e) { for(const t of b3Who(F,c,e.to||'self')) if(b3Alive(t)) b3PutStatus(F,c,t,e); },
  // ruckus: adds to the Family Ruckus gauge (0 to 100, shared by the party). The gauge's own gains and the two spends are in
  // engine/b3-ruckus.js; this is how a Trait, Quirk or Skill that prints its own gain adds to them.
  ruckus(F,c,e) { b3RuckusAdd(F,c.beats,c.g,e.n,c.actor&&c.actor.key,'trait'); },
  // grant: the chosen family member takes one Skill at once, out of turn (spec 2.2 "Granted actions": one per unit per round).
  //   maxPep  only Skills that cost this much or less (never a Basic, never a Grand Capstone);  free  it costs them nothing.
  // The rules only open the door (F.grant). Whoever drives the fight (the screen, the simulator) asks that member for their
  // pick and calls b3Act for them before the clock moves on; b3Act then leaves their wait and their statuses' turn counts alone.
  // A door nobody used is closed by b3Next.
  grant(F,c,e) {
    const t=b3Who(F,c,e.to)[0]; if(!t||!b3Alive(t)||t.granted>=B3_RULES.grantedPerRound||!b3GrantSkills(F,t,e).length) return;
    t.granted++; F.grant={key:t.key,by:c.actor.key,maxPep:e.maxPep,free:!!e.free};
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
  // splash: a share of the hit that set it off, as plain damage of one flavor (Short Circuit!). With `of:'dealt'` the share is of
  // what the whole action has taken off the monster it is about (Creative Mess); when that is nothing (a debuff from a move that
  // deals no damage), it is a standard hit's worth of the actor's Attack.
  splash(F,c,e) {
    const base=e.of==='dealt'?(c.dealt>0?c.dealt:b3Stat(c.actor,'atk')*B3_RULES.power.standard):(c.partDmg||0);
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
const B3_EFFECT_WHEN=['cleansed','stripped','revived','notRevived'];
// c.scale below 1 (a rider held for the later hits of a multi-hit move, engine/b3-custom.js): only the ops whose size can be
// cut run, at that share; an effect that cannot be split (1 Pep, a status) does not repeat.
const B3_SCALABLE=['damage','splash','heal','shield'];
function b3RunEffects(F,c,effects) {
  for(const e of (effects||[])) { const fn=B3_OPS[e.op]; if(!fn) throw new Error('Battle 3 op not built yet: '+e.op);
    if(c.scale!=null&&c.scale<1&&!B3_SCALABLE.includes(e.op)) continue;
    if(e.when) { if(!B3_EFFECT_WHEN.includes(e.when)) throw new Error('Battle 3 effect condition not built yet: '+e.when); if(e.when==='notRevived'?c.revived>0:!(c[e.when]>0)) continue; }
    fn(F,c,e); }
}
