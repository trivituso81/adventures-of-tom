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
//   hit {src, tgt, dmg, hp, flavor, crit, peeve, resist, splash, tick, soak, sh}   soak: how much a shield took; sh: shield left
//   miss {src, tgt, why}              why: 'blind', 'acc' or 'dodge'
//   status {tgt, id}  statusEnd {tgt, id, why}
//   detonate {src, tgt, id, name, prime}
//   push {tgt, n, bar}  pull {tgt, n, bar, placed}
//   pep {tgt, n, pep}
//   telegraph {src, id, name, mark}   an enemy announces a charged act; mark: the key of the family member it is aimed at, if it Marked one
//   pips {tgt, n, left, max, refill}  Composure pips come off (refill: they are back to full as its next turn begins)
//   break {src, tgt, bar}             a foe's pips reached 0: it is Flustered and has fallen back on the turn bar
//   summon {src, tgt, id, name, row, hp, bar}   an add joins the fight
//   ko {tgt}
//   heal {tgt, n, hp, id}  shield {tgt, n, sh}  shieldBroken {tgt}  shieldEnd {tgt, sh}  soak {tgt, id}
//   revive {src, tgt, hp, bar}  standUp {tgt, hp}  skip {who}
//   intercept {src, tgt}              src takes the hit that was aimed at tgt
//   react {src, tgt, id, name}        a reaction begins (a ward's answer); its beats share its `g` ('r0', 'r1'...)
//   interrupt {src, tgt, name, why}   a wound-up act is cancelled (why 'break': a Break took it; src is null when no Skill did it)
//   hazardOn {id, side, uses, rounds}  hazardTrip {id, tgt, left}  hazardEnd {id, side}
//   counter {tgt, id, v}  crack {tgt, v}
//   endTurn {who, bar}                the actor's wait is set (`g` is 'end' for everything a turn's end writes)
//   over {result}

// ---------- A turn begins ----------
// Damage over time lands here (Toasty's burn, Bleed), then healing over time (Mend). A stunned unit loses the turn.
// Returns false if the unit does not act.
function b3BeginTurn(F,u,beats) {
  F.acting=u; u.turns++; F.turnLog.push(u.key);
  beats.push({t:'turn',who:u.key,round:F.round,clock:F.clock,bar:b3BarSnap(F,u,0)});
  const c={F,actor:u,src:null,targets:[u],hit:[],beats,g:'pre',detonated:{},ledger:{}};
  // What lasts "until its next turn begins" ends here, before anything else (Flustered: a burn this turn is back at normal damage).
  for(const id of Object.keys(u.st)) if(u.st[id].unit==='begin') { b3EndStatus(F,u,id,'time'); beats.push({t:'statusEnd',tgt:u.key,id,g:'pre'}); }
  // A foe that was Broken gets this turn whatever else is on it, with its pips full again; they stay locked until the turn ends (spec 2.7).
  if(u.broken) { u.broken=false; u.flusterTurn=true; u.pips=u.maxPips; beats.push({t:'pips',tgt:u.key,n:0,left:u.pips,max:u.maxPips,refill:true,g:'pre'}); }
  for(const id of Object.keys(u.st)) {
    const S=B3_STATUS[id],s=u.st[id]; if(!S.tick||!s) continue;
    const fl=S.tick.flavor,pv=u.peeves.includes(fl),rs=u.resists.includes(fl);
    const dmg=Math.max(1,Math.round(s.atk*B3_RULES.power[S.tick.power]*100/(100+b3Stat(u,'def'))*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(u)));
    b3Hurt(F,c,u,dmg,{src:s.src,flavor:fl,peeve:pv,resist:rs,tick:id});
  }
  b3KoCheck(F,c);
  for(const id of Object.keys(u.st)) {
    const S=B3_STATUS[id],s=u.st[id]; if(!s||!S.regen||!b3Alive(u)) continue;
    const got=b3Heal(F,u,u.maxHp*(s.v==null?S.regen:s.v)); if(got) beats.push({t:'heal',tgt:u.key,n:got,hp:u.hp,id,g:'pre'});
  }
  b3Fire(F,'turnStart',{src:u,tgt:u,g:'pre'},beats);
  if(b3Alive(u)&&b3HasFlag(u,'skipTurn')) {
    for(const id of Object.keys(u.st)) if(B3_STATUS[id].flags.includes('skipTurn')) { b3EndStatus(F,u,id,'used'); beats.push({t:'statusEnd',tgt:u.key,id,g:'pre'}); }
    if(u.flusterTurn) return true;   // "A foe always gets that turn": the Stun is spent and the turn is not lost
    beats.push({t:'skip',who:u.key,g:'pre'});
    b3EndTurn(F,u,B3_RULES.forecast,beats);
    return false;
  }
  return b3Alive(u);
}
// The next unit able to act, with the beats that led up to its turn. unit is null when the fight is over.
function b3Next(F) {
  const beats=F.opening||[]; F.opening=null;
  while(!F.over) {
    const u=b3Tick(F,beats); if(!u) break;
    const up=b3BeginTurn(F,u,beats);
    if(b3CheckOver(F)) { b3OverBeats(F,beats); break; }
    if(up) return {unit:u,beats};
    F.acting=null;
  }
  return {unit:null,beats};
}
// A turn ends: the wait is set first (so a 2-turn Slow slows two Recoveries), then turn-length statuses and shields count down.
function b3EndTurn(F,u,recovery,beats) {
  if(b3Alive(u)) {
    b3SetWait(F,u,recovery);
    // Broken during its own turn (a ward's answer, a slip): it falls back now that its wait is set.
    if(u.flusterMove) { u.flusterMove=false; b3FlusterMove(F,u,0); }
    // The turn a Broken foe was owed is over: its pips can be shaved again.
    if(u.flusterTurn) { u.flusterTurn=false; u.pipLock=false; }
    for(const id of Object.keys(u.st)) { const s=u.st[id]; if(s.unit!=='turn') continue;
      if(s.skip) { s.skip=false; continue; }
      if(--s.n<=0) { b3EndStatus(F,u,id,'time'); beats.push({t:'statusEnd',tgt:u.key,id,g:'end'}); b3Fire(F,'statusEnded',{src:u,tgt:u,id,g:'end'},beats); } }
    for(const sh of u.shields.slice()) {
      if(sh.skip) { sh.skip=false; continue; }
      if(--sh.n<=0) { u.shields.splice(u.shields.indexOf(sh),1); beats.push({t:'shieldEnd',tgt:u.key,sh:b3ShieldTotal(u),g:'end'}); b3Fire(F,'shieldEnded',{src:u,tgt:u,by:sh.src,g:'end'},beats); } }
    b3Fire(F,'turnEnd',{src:u,tgt:u,g:'end'},beats);
    u.hitSince=false;
  }
  F.acting=null;
  beats.push({t:'endTurn',who:u.key,bar:b3BarSnap(F,null,0),g:'end'});
  if(b3CheckOver(F)) b3OverBeats(F,beats,'end');
}

// ---------- Damage ----------
// Shields soak damage before HP, the oldest first (spec 2.4). The action keeps what each target lost and what its shields
// soaked, so a status riding on a fully soaked enemy hit can be stopped (engine/b3-ops.js b3Soaked).
function b3Hurt(F,c,t,dmg,info) {
  let left=dmg,soak=0; const broke=[];
  for(const sh of t.shields) { if(left<=0) break; const a=Math.min(sh.amt,left); sh.amt-=a; left-=a; soak+=a; if(sh.amt<=0) broke.push(sh); }
  if(broke.length) t.shields=t.shields.filter(sh=>sh.amt>0);
  t.hp=Math.max(0,t.hp-left);
  if(soak) (c.soak=c.soak||{})[t.key]=(c.soak[t.key]||0)+soak;
  if(left) (c.lost=c.lost||{})[t.key]=(c.lost[t.key]||0)+left;
  if(!(info&&info.tick)) t.hitSince=true;
  c.beats.push(Object.assign({t:'hit',tgt:t.key,dmg,hp:t.hp,g:c.g},soak?{soak,sh:b3ShieldTotal(t)}:null,info));
  for(const sh of broke) { c.beats.push({t:'shieldBroken',tgt:t.key,g:c.g}); b3Fire(F,'shieldBroken',{src:c.actor,tgt:t,by:sh.src,g:c.g},c.beats); }
}
function b3KoCheck(F,c) {
  for(const u of F.units) if(!u.ko&&u.hp<=0) {
    u.ko=true; u.st={}; u.shields=[]; u.charge=null; u.mark=null; u.broken=false; u.flusterMove=false; u.wait=0;
    c.beats.push({t:'ko',tgt:u.key,g:c.g});
    b3Fire(F,'ko',{src:c.actor,tgt:u,g:c.g},c.beats);
  }
}
// ---------- Composure and Break (spec 2.7) ----------
// Every action keeps a ledger per foe: {n: pips from Detonations and printed Composure numbers, peeve: a Pet Peeve hit landed}.
// A Pet Peeve is worth 1 pip per action however many hits landed. Only Elites and Bosses have pips.
function b3Pips(c,t,n,peeve) {
  if(!t||t.side!=='foe'||!t.maxPips) return;
  const LG=c.ledger||(c.ledger={}),L=LG[t.key]||(LG[t.key]={n:0,peeve:false});
  if(peeve) L.peeve=true; else L.n+=n;
}
// The ledger is paid when the action ends: 3 pips at most from one foe, from every source together (c.pipCap raises it to 4
// for a Full Family Ruckus). A foe whose pips are locked loses none. At 0 pips the foe Breaks.
function b3PayLedger(F,c) {
  const R=B3_RULES.composure,cap=c.pipCap||R.capPerAction,LG=c.ledger||{},paid=c.paid||(c.paid={});
  for(const key of Object.keys(LG)) {
    const t=b3Unit(F,key),L=LG[key]; delete LG[key];
    if(!b3Alive(t)||t.pipLock||t.pips<=0) continue;
    const n=Math.min(cap-(paid[key]||0),L.n+(L.peeve&&!paid[key+':pv']?R.peeve:0),t.pips);
    if(L.peeve) paid[key+':pv']=true;
    if(n<=0) continue;
    t.pips-=n; paid[key]=(paid[key]||0)+n;
    c.beats.push({t:'pips',tgt:key,n,left:t.pips,max:t.maxPips,g:c.g});
    b3Fire(F,'pipsShaved',{src:c.actor,tgt:t,n,g:c.g,c},c.beats);
    if(t.pips<=0) b3Break(F,c,t);
  }
}
// A foe stops winding up: the act is gone and its Mark with it. The lost act counts as used: its "every Nth turn" count starts
// again and a once-in-the-fight act does not come back. `A` names an act lost before it was wound up. Returns the act it lost.
function b3LoseCharge(F,t,A) {
  A=A||t.charge; t.charge=null; t.mark=null;
  if(A) { t.lastUse[A.id]=t.turns; t.uses[A.id]=(t.uses[A.id]||0)+1; }
  return A;
}
// Break: the foe is Flustered. It loses a wound-up act and any stance, goes behind every unit due inside the next 100 ticks,
// takes 35% more damage and cannot be pushed until its next turn begins. Its pips refill then, and stay locked until that turn ends.
function b3Break(F,c,t) {
  t.pipLock=true; t.broken=true;
  const lost=b3LoseCharge(F,t);
  if(lost) c.beats.push({t:'interrupt',src:null,tgt:t.key,id:lost.id,name:lost.name,why:'break',g:c.g});
  for(const id of Object.keys(t.st)) if(B3_STATUS[id].kind==='stance') { b3EndStatus(F,t,id,'break'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); }
  b3AddStatus(F,t,'flustered',{src:c.actor}); c.beats.push({t:'status',tgt:t.key,id:'flustered',g:c.g});
  // During its own turn its wait is not set yet, so it falls back when that turn ends (b3EndTurn).
  if(F.acting===t) t.flusterMove=true; else b3FlusterMove(F,t,c.actor===F.acting?c.rec:0);
  c.beats.push({t:'break',src:c.actor.key,tgt:t.key,bar:b3BarSnap(F,F.acting,c.rec),g:c.g});
  b3Fire(F,'break',{src:c.actor,tgt:t,g:c.g,c},c.beats);
}

// The Detonation a hit of this flavor would set off on this unit: the row for its oldest matching Prime (spec 2.5).
function b3FindDetonation(t,flavor) {
  let best=null;
  for(const D of B3_DETONATIONS) if(D.flavor===flavor&&t.st[D.prime]&&(!best||t.st[D.prime].at<t.st[best.prime].at)) best=D;
  return best;
}
// A move's own condition for a bonus (B3_CONDS is the list the data check knows).
//   targetHas  the target carries one of `ids`
//   tookHit    the attacker took or blocked a hit since its last turn ended (a burn tick is not a hit)
const B3_CONDS=['targetHas','tookHit'];
function b3Cond(F,c,cond,t) {
  if(cond.if==='targetHas') return cond.ids.some(id=>t.st[id]);
  if(cond.if==='tookHit') return !!c.actor.hitSince;
  throw new Error('Battle 3 condition not built yet: '+cond.if);
}
// One hit on one target. `per` is the Skill Power of each flavor part of this hit.
function b3Hit(F,c,t,per,flavors,e,single) {
  const a=c.actor,B=c.beats;
  c.ledger=c.ledger||{};
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
  // An intercepted hit lands that much weaker on the one who stepped in.
  const red=c.inter&&c.inter[t.key]?c.inter[t.key].reduce:0;
  for(let fi=0;fi<flavors.length;fi++) {
    const fl=flavors[fi];
    if(t.hp<=0) break;
    // Detonation check, before this flavor part lands: once per target per action, on the oldest matching Prime. Enemies never Detonate.
    const det=a.side==='party'&&t.side==='foe'&&!c.detonated[t.key]?b3FindDetonation(t,fl):null;
    // The move's own bonus: `per` counts something this action did (buffs stripped), `if` is a condition on the target.
    const bonus=Object.assign({},c.outExtra);
    // `counter` reads one of the attacker's Portable Counters (so much per point built up).
    if(e.bonus) { if(e.bonus.counter) bonus.skill=e.bonus.add*(a.counters[e.bonus.counter]||0); else if(e.bonus.per) bonus.skill=e.bonus.add*(c[e.bonus.per]||0); else if(b3Cond(F,c,e.bonus,t)) bonus.skill=e.bonus.add; }
    const pv=t.peeves.includes(fl),rs=t.resists.includes(fl);
    let dmg=b3Stat(a,'atk')*per*100/(100+b3Stat(t,'def'))*b3OutMult(a,bonus)*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*(crit?B3_RULES.crit.dmg:1)*b3TakenMult(t,red);
    if(single&&fl==='clobber'&&b3EffRow(F,t)==='back') dmg*=1-B3_RULES.backRowClobber;
    if(t.side==='party') dmg*=F.mods.taken;
    dmg=Math.max(1,Math.round(dmg));
    if(det) {
      c.detonated[t.key]=true; b3EndStatus(F,t,det.prime,'detonated');
      B.push({t:'detonate',src:a.key,tgt:t.key,id:det.id,name:det.name,prime:det.prime,g:c.g});
      b3RunEffects(F,Object.assign({},c,{tgt:t,partDmg:dmg}),det.effects);
      b3Pips(c,t,det.pips);
      const got=b3Pep(F,a,B3_RULES.pep.detonation,'detonation'); if(got) B.push({t:'pep',tgt:a.key,n:got,pep:a.pep,g:c.g});
      b3Fire(F,'detonation',{src:a,tgt:t,id:det.id,g:c.g},B);
    }
    b3Hurt(F,c,t,dmg,{src:a.key,flavor:fl,crit,peeve:pv,resist:rs});
    if(!c.hit.includes(t)) c.hit.push(t);
    if(a.side==='party'&&t.side==='foe') {
      if(pv) b3Pips(c,t,0,true);          // a Pet Peeve hit: 1 pip per action, not per hit (spec 2.7)
      b3QueueCounters(F,c,t,a);           // an enemy's counter act answers, once per action (engine/b3-foe.js)
    }
    // The Prime of the move's first flavor, unless this action detonated on this target (spec 2.5).
    const P=fi===0?B3_FLAVORS[fl].prime:null;
    if(P&&a.side==='party'&&t.side==='foe'&&!c.detonated[t.key]&&t.hp>0) {
      b3AddStatus(F,t,P,{src:a}); B.push({t:'status',tgt:t.key,id:P,g:c.g}); b3Fire(F,'primeApplied',{src:a,tgt:t,id:P,g:c.g},B);
    }
    b3Fire(F,'afterHit',{src:a,tgt:t,dmg,flavor:fl,crit,g:c.g,tags:c.tags||[],c},B);
  }
  b3KoCheck(F,c);
}
// The unit that takes a single-target hit aimed at t, if someone has stepped in for t (Suite Door Slide): {u, reduce} or null.
function b3Interceptor(F,t) {
  for(const id of Object.keys(t.st)) { const S=B3_STATUS[id]; if(!S.intercept) continue;
    const G=b3Unit(F,t.st[id].src); if(G&&G!==t&&b3Alive(G)&&!b3HasFlag(G,'untargetable')) return {u:G,reduce:S.intercept.reduce}; }
  return null;
}
// The damage op: every hit of a move. A multi-hit move's power is shared evenly by its hits; a two-flavor move's hit is
// two half-power parts in order. A party Skill that hits all foes uses 70% of its tier (an enemy's party-wide power is final).
// An effect that carries its own `power` and `flavor` (a ward's answer, a hazard's fall) is a hit of its own: it lands on
// whoever `to` names and its beats stay in the part of the action it was set off in.
function b3DamageOp(F,c,e) {
  const own=e.power!=null,S=own?{flavor:e.flavor,power:e.power,hits:e.hits||1,target:'foe'}:c.skill;
  const a=c.actor,hits=Math.max(1,S.hits||1),all=S.target==='all_foes';
  const tier=typeof S.power==='number'?S.power:B3_RULES.power[S.power];
  const per=tier*(all&&a.side==='party'?B3_RULES.aoeShare:1)/hits/S.flavor.length;
  if(own) { for(let h=0;h<hits;h++) for(const t of b3Who(F,c,e.to).filter(b3Alive)) b3Hit(F,c,t,per,S.flavor,e,true); return; }
  c.didDamage=true;
  for(let h=0;h<hits;h++) {
    c.g=h;
    let tg;
    if(S.target==='random_foes') { const L=b3Live(F,b3Other(a.side)); tg=L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
    else tg=c.targets.filter(b3Alive);
    if(!tg.length) break;
    // An enemy's single-target hit is redirected to whoever stepped in for its target (spec 2.8). Party-wide acts are not.
    if(!all&&a.side==='foe') tg=tg.map(t=>{ const I=b3Interceptor(F,t); if(!I) return t;
      (c.inter=c.inter||{})[I.u.key]={reduce:I.reduce,forKey:t.key}; c.beats.push({t:'intercept',src:I.u.key,tgt:t.key,g:h}); return I.u; });
    c.beats.push({t:'swing',src:a.key,tgts:tg.map(t=>t.key),g:h});
    for(const t of tg) b3Hit(F,c,t,per,S.flavor,e,!all);
    // Taking a hit for someone gives +1 Pep, once per enemy action (spec 2.3).
    if(c.inter) for(const t of tg) if(c.inter[t.key]&&!c.inter[t.key].paid) { c.inter[t.key].paid=true;
      const got=b3Pep(F,t,B3_RULES.pep.intercept,'intercept'); if(got) c.beats.push({t:'pep',tgt:t.key,n:got,pep:t.pep,g:h});
      b3Fire(F,'intercept',{src:t,tgt:b3Unit(F,c.inter[t.key].forKey),g:h,c},c.beats); }
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
  const c={F,actor:u,src:u,skill:S,rec,targets:O.units.slice(),hit:[],beats,g:'pre',detonated:{},reacted:{},tags:S.tags||[],ledger:{}};
  beats.push({t:'act',src:u.key,id:S.id,name:S.name,flavor:S.flavor,shape:(S.anim&&S.anim.shape)||'strike',hits:Math.max(1,S.hits||1),tgts:O.units.map(t=>t.key),g:'pre'});
  if(cost) { b3Pep(F,u,-cost,'cost'); beats.push({t:'pep',tgt:u.key,n:-cost,pep:u.pep,g:'pre'}); }
  if(S.slot==='basic') { const got=b3Pep(F,u,B3_RULES.pep.basic,'basic'); if(got) beats.push({t:'pep',tgt:u.key,n:got,pep:u.pep,g:'pre'}); }
  b3Fire(F,'actionDeclared',{src:u,g:'pre'},beats);
  b3RunEffects(F,c,S.effects);
  c.g='post';
  // A Skill's own printed Composure number, on every monster it hit (or aimed at, when it deals no damage).
  if(S.composure) for(const t of (c.hit.length?c.hit:c.targets)) b3Pips(c,t,S.composure);
  b3KoCheck(F,c);
  // Composure is paid before anything answers: a foe this action Broke has lost its counter (architecture 2.6, step 6).
  b3PayLedger(F,c);
  b3RunReactions(F,beats);
  b3Fire(F,'actionEnd',{src:u,g:'post',c},beats);
  b3PayLedger(F,c);   // pips a Trait or Quirk added as the action ended
  b3KoCheck(F,c);
  b3EndTurn(F,u,rec,beats);
  return {ok:true,beats};
}
