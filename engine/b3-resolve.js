'use strict';
// engine/b3-resolve.js — Battle 3 resolver: one action from cost to beats (architecture sections 2.5 and 2.6).
// It works out the WHOLE result of an action at once and writes it down as beats. Nothing here waits for an animation:
// when b3Act returns, the fight state is final and the play layer only has to show what the beats say.
// RULES FILE: no drawing, no page, no timers.
//
// Beats (each a plain row; `g` says which part of the move it belongs to: 'pre', a hit number, or 'post'):
//   round {n}                         a round divider was crossed
//   turn {who, bar}                   whose turn starts, and the turn bar at that moment
//   act {src, id, name, flavor, shape, hits, foe}   a move begins
//   swing {src, tgts}                 one hit of the move goes out at these targets
//   hit {src, tgt, dmg, hp, flavor, crit, peeve, resist, splash, tick}
//   miss {src, tgt, why}              why: 'blind', 'acc' or 'dodge'
//   status {tgt, id}  statusEnd {tgt, id, why}
//   detonate {src, tgt, id, name, prime}
//   push {tgt, n, bar}  pull {tgt, n, bar, placed}
//   pep {tgt, n, pep}
//   telegraph {src, id, name}         an enemy announces a charged act
//   ko {tgt}
//   endTurn {who, bar}                the actor's wait is set
//   over {result}

// ---------- A turn begins ----------
// Damage over time lands here (Toasty's burn). Returns false if the unit did not live to act.
function b3BeginTurn(F,u,beats) {
  F.acting=u; u.turns++; F.turnLog.push(u.key);
  beats.push({t:'turn',who:u.key,round:F.round,clock:F.clock,bar:b3BarSnap(F,u,0)});
  const c={F,actor:u,src:null,targets:[u],hit:[],beats,g:'pre',detonated:{}};
  for(const id of Object.keys(u.st)) {
    const S=B3_STATUS[id],s=u.st[id]; if(!S.tick||!s) continue;
    const fl=S.tick.flavor,pv=u.peeves.includes(fl),rs=u.resists.includes(fl);
    const dmg=Math.max(1,Math.round(s.atk*B3_RULES.power[S.tick.power]*100/(100+b3Stat(u,'def'))*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(u)));
    b3Hurt(F,c,u,dmg,{src:s.src,flavor:fl,peeve:pv,resist:rs,tick:id});
  }
  b3KoCheck(F,c);
  b3Fire(F,'turnStart',{src:u,tgt:u,g:'pre'},beats);
  return b3Alive(u);
}
// The next unit able to act, with the beats that led up to its turn. unit is null when the fight is over.
function b3Next(F) {
  const beats=[];
  while(!F.over) {
    const u=b3Tick(F,beats); if(!u) break;
    const up=b3BeginTurn(F,u,beats);
    if(b3CheckOver(F)) { beats.push({t:'over',result:F.over}); break; }
    if(up) return {unit:u,beats};
    F.acting=null;
  }
  return {unit:null,beats};
}
// A turn ends: the wait is set first (so a 2-turn Slow slows two Recoveries), then turn-length statuses count down.
function b3EndTurn(F,u,recovery,beats) {
  if(b3Alive(u)) {
    b3SetWait(F,u,recovery);
    for(const id of Object.keys(u.st)) { const s=u.st[id]; if(s.unit!=='turn') continue;
      if(s.skip) { s.skip=false; continue; }
      if(--s.n<=0) { b3EndStatus(F,u,id,'time'); beats.push({t:'statusEnd',tgt:u.key,id,g:'post'}); b3Fire(F,'statusEnded',{src:u,tgt:u,id,g:'post'},beats); } }
    b3Fire(F,'turnEnd',{src:u,tgt:u,g:'post'},beats);
  }
  F.acting=null;
  beats.push({t:'endTurn',who:u.key,bar:b3BarSnap(F,null,0),g:'post'});
  if(b3CheckOver(F)) beats.push({t:'over',result:F.over,g:'post'});
}

// ---------- Damage ----------
function b3Hurt(F,c,t,dmg,info) {
  t.hp=Math.max(0,t.hp-dmg);
  c.beats.push(Object.assign({t:'hit',tgt:t.key,dmg,hp:t.hp,g:c.g},info));
}
function b3KoCheck(F,c) {
  for(const u of F.units) if(!u.ko&&u.hp<=0) {
    u.ko=true; u.st={}; u.charge=null; u.wait=0;
    c.beats.push({t:'ko',tgt:u.key,g:c.g});
    b3Fire(F,'ko',{src:c.actor,tgt:u,g:c.g},c.beats);
  }
}
// The Detonation a hit of this flavor would set off on this unit: the row for its oldest matching Prime (spec 2.5).
function b3FindDetonation(t,flavor) {
  let best=null;
  for(const D of B3_DETONATIONS) if(D.flavor===flavor&&t.st[D.prime]&&(!best||t.st[D.prime].at<t.st[best.prime].at)) best=D;
  return best;
}
// A move's own condition for a bonus.
function b3Cond(F,c,cond,t) {
  if(cond.if==='targetHas') return cond.ids.some(id=>t.st[id]);
  throw new Error('Battle 3 condition not built yet: '+cond.if);
}
// One hit on one target. `per` is the Skill Power of each flavor part of this hit.
function b3Hit(F,c,t,per,flavors,e,single) {
  const a=c.actor,B=c.beats;
  // Misses: Blind (the next single-target attack), an accuracy penalty, then the target's Evasion.
  if(single&&b3HasFlag(a,'blind')) {
    for(const id of Object.keys(a.st)) if(B3_STATUS[id].flags.includes('blind')) { b3EndStatus(F,a,id,'used'); B.push({t:'statusEnd',tgt:a.key,id,g:c.g}); }
    B.push({t:'miss',src:a.key,tgt:t.key,why:'blind',g:c.g}); return;
  }
  const mc=b3MissChance(a); if(mc>0&&b3Rand(F)<mc) { B.push({t:'miss',src:a.key,tgt:t.key,why:'acc',g:c.g}); return; }
  const ev=b3Evasion(t); if(ev>0&&b3Rand(F)<ev) { B.push({t:'miss',src:a.key,tgt:t.key,why:'dodge',g:c.g}); b3Fire(F,'dodge',{src:a,tgt:t,g:c.g},B); return; }
  // One crit roll per hit: base rate, the attacker's own bonus, and what the target gives away (Dazzled).
  const crit=b3Rand(F)<B3_RULES.crit.rate+b3Sum(a,'crit')+b3Sum(t,'critTaken');
  if(crit) b3Fire(F,'crit',{src:a,tgt:t,g:c.g},B);
  for(const fl of flavors) {
    if(t.hp<=0) break;
    // Detonation check, before this flavor part lands: once per target per action, on the oldest matching Prime. Enemies never Detonate.
    const det=a.side==='party'&&t.side==='foe'&&!c.detonated[t.key]?b3FindDetonation(t,fl):null;
    const bonus={}; if(e.bonus&&b3Cond(F,c,e.bonus,t)) bonus.skill=e.bonus.add;
    const pv=t.peeves.includes(fl),rs=t.resists.includes(fl);
    let dmg=b3Stat(a,'atk')*per*100/(100+b3Stat(t,'def'))*b3OutMult(a,bonus)*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*(crit?B3_RULES.crit.dmg:1)*b3TakenMult(t);
    if(single&&fl==='clobber'&&b3EffRow(F,t)==='back') dmg*=1-B3_RULES.backRowClobber;
    if(t.side==='party') dmg*=F.mods.taken;
    dmg=Math.max(1,Math.round(dmg));
    if(det) {
      c.detonated[t.key]=true; b3EndStatus(F,t,det.prime,'detonated');
      B.push({t:'detonate',src:a.key,tgt:t.key,id:det.id,name:det.name,prime:det.prime,g:c.g});
      b3RunEffects(F,Object.assign({},c,{tgt:t,partDmg:dmg}),det.effects);
      const got=b3Pep(F,a,B3_RULES.pep.detonation,'detonation'); if(got) B.push({t:'pep',tgt:a.key,n:got,pep:a.pep,g:c.g});
      b3Fire(F,'detonation',{src:a,tgt:t,id:det.id,g:c.g},B);
    }
    b3Hurt(F,c,t,dmg,{src:a.key,flavor:fl,crit,peeve:pv,resist:rs});
    if(!c.hit.includes(t)) c.hit.push(t);
    // The flavor's own Prime, unless this action detonated on this target (spec 2.5).
    const P=B3_FLAVORS[fl].prime;
    if(P&&a.side==='party'&&t.side==='foe'&&!c.detonated[t.key]&&t.hp>0) {
      b3AddStatus(F,t,P,{src:a}); B.push({t:'status',tgt:t.key,id:P,g:c.g}); b3Fire(F,'primeApplied',{src:a,tgt:t,id:P,g:c.g},B);
    }
    b3Fire(F,'afterHit',{src:a,tgt:t,dmg,flavor:fl,crit,g:c.g},B);
  }
  b3KoCheck(F,c);
}
// The damage op: every hit of a move. A multi-hit move's power is shared evenly by its hits; a two-flavor move's hit is
// two half-power parts in order. A party Skill that hits all foes uses 70% of its tier (an enemy's party-wide power is final).
function b3DamageOp(F,c,e) {
  const S=c.skill,a=c.actor,hits=Math.max(1,S.hits||1),all=S.target==='all_foes';
  const tier=typeof S.power==='number'?S.power:B3_RULES.power[S.power];
  const per=tier*(all&&a.side==='party'?B3_RULES.aoeShare:1)/hits/S.flavor.length;
  c.didDamage=true;
  for(let h=0;h<hits;h++) {
    c.g=h;
    let tg;
    if(S.target==='random_foes') { const L=b3Live(F,b3Other(a.side)); tg=L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
    else tg=c.targets.filter(b3Alive);
    if(!tg.length) break;
    c.beats.push({t:'swing',src:a.key,tgts:tg.map(t=>t.key),g:h});
    for(const t of tg) b3Hit(F,c,t,per,S.flavor,e,!all);
  }
  c.g='post';
}

// ---------- A party member's action ----------
// Returns {ok, beats} or {ok:false, why}. The cost is paid, the whole result is worked out, the turn ends.
function b3Act(F,u,skillId,optKey) {
  const S=B3_SKILLS[skillId],can=b3CanUse(F,u,S);
  if(!can.ok) return {ok:false,why:can.why};
  const O=b3Options(F,u,S).find(o=>o.key===optKey);
  if(!O||O.no) return {ok:false,why:(O&&O.no)||'Nobody to use that on right now.'};
  const beats=[],rec=B3_RULES.recovery[S.slot],cost=b3Cost(F,u,S);
  const c={F,actor:u,src:u,skill:S,rec,targets:O.units.slice(),hit:[],beats,g:'pre',detonated:{}};
  beats.push({t:'act',src:u.key,id:S.id,name:S.name,flavor:S.flavor,shape:(S.anim&&S.anim.shape)||'strike',hits:Math.max(1,S.hits||1),tgts:O.units.map(t=>t.key),g:'pre'});
  if(cost) { b3Pep(F,u,-cost,'cost'); beats.push({t:'pep',tgt:u.key,n:-cost,pep:u.pep,g:'pre'}); }
  if(S.slot==='basic') { const got=b3Pep(F,u,B3_RULES.pep.basic,'basic'); if(got) beats.push({t:'pep',tgt:u.key,n:got,pep:u.pep,g:'pre'}); }
  b3Fire(F,'actionDeclared',{src:u,g:'pre'},beats);
  b3RunEffects(F,c,S.effects);
  c.g='post';
  b3Fire(F,'actionEnd',{src:u,g:'post'},beats);
  b3KoCheck(F,c);
  b3EndTurn(F,u,rec,beats);
  return {ok:true,beats};
}
