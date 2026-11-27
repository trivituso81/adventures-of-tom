'use strict';
// engine/b3-foe.js — Battle 3 enemy turn: picks an act from the foe's fixed list and runs it through the same resolver
// the party uses (architecture section 2.6). RULES FILE: no drawing, no page, no timers.
// Built: the act runner (conditions, waits in rounds, wind-ups, Marks and their follow-ups, counter acts, acts that hit 2 or 3
// allies, adds through the `summon` op), aim by aggro weight and taunt, intercepts (in the damage op), hazards on the enemy's
// floor, the party's reactions. Waiting for their bosses: phases and phase lines (chapter 20), helper links and feedback (13, 15, 20).
//
// The order a foe picks in (no randomness except who it aims at):
//   0. e.force (the Battle Lab's "See it in a fight" address only): that act, once
//   1. a forced act: the act it wound up last turn (a Marked follow-up is one of these), then a once-in-the-fight act whose
//      moment has come ("once at 50% HP")
//   2. an "every N turns" or "every N rounds" act that is due (the count starts again after the act fires)
//   3. the next act in printed order that passes its `when`
// Counter acts (hits:'attacker') and follow-ups (after:'...') are never picked from the list.
const B3_FOE_HITS=['one','all','self','marked','attacker','two_random','two_adjacent','front_back','fastest','foes','field'];
// Stage 13: allyHurt:true (another monster on its side is below full HP; Cone Head's Scoop Pass). Stage 12: allyId / noAllyId (a monster of that id stands on its side / none does), allyAge:N (with allyId: the one this monster called has stood for N of its turns).
const B3_FOE_WHEN=['everyTurn','everyRound','waitRounds','once','hpBelow','hpAbove','stripped','has','lacks','notSameAllyTurns','allyId','noAllyId','allyAge','allyHurt','stance','row','phase'];
function b3ActOk(F,e,A) {
  const W=A.when||{};
  // Classroom Lights-Out Reset (`noAoe`): for a while it cannot use an act that reaches every family member.
  if(b3HasFlag(e,'noAoe')&&(A.hits==='all'||A.tags.includes('aoe'))) return false;
  // Flag on the Play (`noBuff`): for a while it cannot use an act that puts a buff on its side.
  if(b3HasFlag(e,'noBuff')&&(A.effects||[]).some(x=>(x.op==='status'||x.op==='prime')&&x.id&&B3_STATUS[x.id]&&B3_STATUS[x.id].kind==='buff')) return false;
  if(W.stripped&&!e.stripped[W.stripped]) return false;
  if(W.has&&!e.st[W.has]) return false;
  if(W.lacks&&e.st[W.lacks]) return false;
  if(W.hpBelow!=null&&!(e.hp<=e.maxHp*W.hpBelow)) return false;
  if(W.hpAbove!=null&&!(e.hp>e.maxHp*W.hpAbove)) return false;
  if(W.once&&e.uses[A.id]) return false;
  if(W.stance&&e.stance!==W.stance) return false;   // stage 22 (chapter 17): the Twin Lenses' acts that belong to one lens
  if(W.phase&&(e.phase||1)!==W.phase) return false;   // stage 22 (chapter 20): the Collector's acts that belong to one phase
  if(W.row&&e.row!==W.row) return false;   // stage 22 (chapter 19): the Courier's cadence follows the row it sits in
  if(W.allyHurt&&!b3Live(F,e.side).some(o=>o!==e&&o.hp<o.maxHp)) return false;
  if(W.allyId&&!b3Live(F,e.side).some(o=>o.id===W.allyId&&o!==e)) return false;
  if(W.noAllyId&&b3Live(F,e.side).some(o=>o.id===W.noAllyId)) return false;
  if(W.allyAge&&!b3Live(F,e.side).some(o=>o.id===W.allyId&&o.addedBy===e.key&&e.turns-o.addedTurn>=W.allyAge)) return false;
  if(W.everyTurn&&e.turns-(e.lastUse[A.id]||0)<W.everyTurn) return false;
  // "Every 3 rounds": ready at every 3rd divider (rounds 4, 7, 10...). "X-round wait": X dividers since it was last used.
  if(W.everyRound&&Math.floor((F.round-1)/W.everyRound)<=(e.everyUsed[A.id]||0)) return false;
  if(W.waitRounds&&e.lastRound[A.id]!=null&&F.round-e.lastRound[A.id]<W.waitRounds) return false;
  return true;
}
const b3Listed=A=>!A.after&&A.hits!=='attacker';
function b3FoePick(F,e,peek) {
  if(e.charge) return {act:e.charge,fire:true};
  const acts=e.D.acts;
  // `e.force` (an act id, set only by the Battle Lab's "See it in a fight" address, engine/b3-ui.js b3FirstSet): the act it uses this turn, whatever its `when`.
  if(e.force) { const A=acts.find(x=>x.id===e.force); if(!peek) e.force=null; if(A) return {act:A,fire:false}; }
  for(const A of acts) if(b3Listed(A)&&A.when&&A.when.once&&b3ActOk(F,e,A)) return {act:A,fire:false};
  const every=A=>!!(A.when&&(A.when.everyTurn||A.when.everyRound||A.when.allyAge));
  for(const A of acts) if(b3Listed(A)&&every(A)&&!A.when.once&&b3ActOk(F,e,A)) return {act:A,fire:false};
  for(let i=0;i<acts.length;i++) {
    const k=(e.actIx+i)%acts.length,A=acts[k];
    if(!b3Listed(A)||every(A)||(A.when&&A.when.once)||!b3ActOk(F,e,A)) continue;
    if(!peek) e.actIx=(k+1)%acts.length;
    return {act:A,fire:false};
  }
  return null;
}
// Who a single-target attack aims at: by weight. Front 100, Back 60, times any aggro bonus (spec 2.8).
// A taunt forces the aim onto the taunters; a hidden unit cannot be aimed at. An act with aim:'back' looks at the Back row
// first (Big Glare); notSameAllyTurns keeps an act off the ally it hit last, for that many of the foe's turns.
function b3AggroPick(F,e,A) {
  let L=b3Live(F,b3Other(e.side)).filter(u=>!b3HasFlag(u,'untargetable'));
  const T=L.filter(u=>b3HasFlag(u,'taunt')),LK=b3AimLocker(F,e);
  if(LK&&L.includes(LK)) L=[LK];   // 1970 Cross-Country Story: this monster's single-target attacks aim at Boppy, taunt or no taunt
  else if(T.length) L=T;
  else if(A) {
    if(A.aim==='back') { const B=L.filter(u=>b3EffRow(F,u)==='back'); if(B.length) L=B; }
    const N=A.when&&A.when.notSameAllyTurns,last=e.lastAim[A.id];
    if(N&&last&&e.turns-last.turn<=N) { const O=L.filter(u=>u.key!==last.key); if(O.length) L=O; }
  }
  // Weaponized Puppy Eyes (`avoidSrc`): this monster refuses to aim at whoever put the status on it, unless nobody else is left (a taunt still wins).
  if(!T.length&&!LK) { const av=L.filter(u=>!Object.values(e.st).some(s=>B3_STATUS[s.id].flags.includes('avoidSrc')&&s.src===u.key)); if(av.length) L=av; }
  if(!L.length) return null;
  const w=L.map(u=>B3_RULES.aggro[b3EffRow(F,u)]*b3Mult(u,'aggro')),sum=w.reduce((a,b)=>a+b,0);
  let r=b3Rand(F)*sum;
  for(let i=0;i<L.length;i++) { r-=w[i]; if(r<0) return L[i]; }
  return L[L.length-1];
}
// Everyone an act lands on: {targets, single (one target: intercepts, Blind and the Back row apply), wide (it reached every
// ally standing, so it counts as `aoe`: bestiary 1.1), hidden (the Marked ally cannot be reached: the follow-up misses)}.
function b3FoeTargets(F,e,A,given) {
  const them=b3Live(F,b3Other(e.side)),open=them.filter(u=>!b3HasFlag(u,'untargetable')),one=t=>({targets:t?[t]:[],single:true});
  if(A.hits==='self') return {targets:[e]};
  if(A.hits==='foes') return {targets:b3Live(F,e.side)};
  if(A.hits==='field') return {targets:[]};
  if(A.hits==='all') return {targets:them,wide:true};
  if(A.hits==='attacker') return one(given&&b3Alive(given)?given:null);
  if(A.hits==='fastest') return one(open.slice().sort((a,b)=>b3Stat(b,'spd')-b3Stat(a,'spd')||a.slot-b.slot)[0]);
  if(A.hits==='marked') {
    // The follow-up goes where the Mark is. A Marked ally who is hidden makes it miss; one who is knocked out sends it to a new
    // target by aggro (bestiary 1.1). The Mark ends as the follow-up fires.
    const m=e.mark&&b3Unit(F,e.mark); e.mark=null;
    if(m&&b3Alive(m)) return b3HasFlag(m,'untargetable')?{targets:[m],single:true,hidden:true}:one(m);
    return one(b3AggroPick(F,e,A));
  }
  // front_back (stage 22, FINAL CALL's Gate Change): one Front ally and one Back ally, each picked by the fight's own dice. With nobody
  // in one of the rows it is two allies picked like two_random. The `tradeRows` op then swaps the two rows (bestiary 1.1, "Rows").
  if(A.hits==='front_back') {
    const fr=open.filter(u=>b3EffRow(F,u)!=='back'),bk=open.filter(u=>b3EffRow(F,u)==='back');
    if(fr.length&&bk.length) return {targets:[fr[Math.floor(b3Rand(F)*fr.length)],bk[Math.floor(b3Rand(F)*bk.length)]],wide:them.length<=2};
  }
  if(A.hits==='two_random'||A.hits==='front_back') {
    const pool=open.slice(),out=[];
    while(pool.length&&out.length<2) out.push(pool.splice(Math.floor(b3Rand(F)*pool.length),1)[0]);
    return {targets:out,wide:out.length>=them.length};
  }
  if(A.hits==='two_adjacent') {
    // 2 allies standing next to each other; with `grow` the number rises with each use ([2,3,'all']: Wide Arms).
    const row=open.slice().sort((a,b)=>a.slot-b.slot),G=A.grow||[2],want=G[Math.min(e.uses[A.id]||0,G.length-1)];
    if(want==='all'||want>=row.length) return {targets:row,wide:row.length>=them.length};
    const anchor=b3AggroPick(F,e,A),ix=row.indexOf(anchor);
    const start=Math.max(0,Math.min(row.length-want,ix-Math.floor(b3Rand(F)*want)));
    return {targets:row.slice(start,start+want)};
  }
  const lk=e.aimLock&&e.aimLock.act===A.id?b3Unit(F,e.aimLock.key):null;
  return one(lk&&b3LockOk(F,lk,e)?lk:b3AggroPick(F,e,A));
}
// ---------- Cartridge Blow: a monster's next aim, shown early and kept (Tom, Gamer Geek) ----------
// The foe picks its next act as it would right now (b3FoePick with peek: nothing is used up). If that act aims at one family
// member, the aim is picked now by the usual weights (the same roll the act would have made) and kept in `aimLock`, so the
// act goes where the screen said. The lock only holds while it is true: the same act is still due, the target still stands, and
// no taunt has taken the aim. Anything else voids it (b3IntentRefresh) and the foe aims by the usual weights.
const b3AimsOne=A=>!A.hits||A.hits==='one';
// The family member a status on this monster forces its single-target attacks onto (a status with the `lockAim` flag; its putter).
function b3AimLocker(F,e) {
  const id=Object.keys(e.st).find(i=>B3_STATUS[i].flags.includes('lockAim')),u=id&&b3Unit(F,e.st[id].src);
  return u&&b3Alive(u)&&!b3HasFlag(u,'untargetable')?u:null;
}
function b3LockOk(F,t,e) {
  if(!b3Alive(t)||b3HasFlag(t,'untargetable')) return false;
  const LK=e&&b3AimLocker(F,e); if(LK) return t===LK;
  const T=b3Live(F,t.side).filter(u=>b3HasFlag(u,'taunt'));
  return !T.length||T.includes(t);
}
function b3Foresee(F,e) {
  const P=b3FoePick(F,e,true); if(!P) { e.intent=null; e.aimLock=null; return null; }
  const A=P.act,wind=A.tags.includes('charge_up')&&!P.fire&&!A.then;
  const I={act:A.id,name:A.name,aim:null,kind:wind?'wind':A.power>0?'wide':'self'};
  if(!wind&&A.power>0&&A.hits==='marked') { const m=e.mark&&b3Unit(F,e.mark); I.kind='strike'; I.aim=m&&b3Alive(m)?m.key:null; }
  else if(!wind&&A.power>0&&A.hits==='fastest') {
    const f=b3Live(F,b3Other(e.side)).filter(u=>!b3HasFlag(u,'untargetable')).sort((x,y)=>b3Stat(y,'spd')-b3Stat(x,'spd')||x.slot-y.slot)[0];
    I.kind='strike'; I.aim=f?f.key:null; }
  else if(!wind&&A.power>0&&b3AimsOne(A)) {
    I.kind='strike';
    const keep=e.aimLock&&e.aimLock.act===A.id?b3Unit(F,e.aimLock.key):null;
    const t=keep&&b3LockOk(F,keep,e)?keep:b3AggroPick(F,e,A);
    if(t) { e.aimLock={key:t.key,act:A.id}; I.aim=t.key; }
  }
  e.intent=I; return I;
}
// After any action: a shown aim stays only while the act is still the one due and the family member is still a fair target.
function b3IntentRefresh(F) {
  for(const e of F.foes) { if(!e.intent) continue;
    const P=b3Alive(e)?b3FoePick(F,e,true):null,I=e.intent,t=I.aim&&b3Unit(F,I.aim);
    const ok=P&&P.act.id===I.act&&(!I.aim||(t&&b3Alive(t)&&(P.act.hits==='marked'||P.act.hits==='fastest'||(e.aimLock&&e.aimLock.key===I.aim&&b3LockOk(F,t,e)))));
    if(!ok) { e.intent=null; e.aimLock=null; } }
}
// A hazard on this unit's floor catches it as it starts an act with one of the hazard's tags (Wet-Floor Hazard and melee):
// the hazard's effects land on it, and this act's damage takes the hazard's modifier. The fall is the hazard layer's own small
// action: Composure it shaves is paid at once, with its own cap.
function b3HazardTrip(F,e,A,c) {
  for(const hz of F.hazards.slice()) {
    const H=B3_HAZARDS[hz.id];
    if(hz.side!==e.side||!b3Alive(e)||e.broken||!(H.any?!A.then:(A.power>0&&H.tags.some(t=>A.tags.includes(t))))) continue;
    hz.uses--;
    c.beats.push({t:'hazardTrip',id:hz.id,tgt:e.key,left:hz.uses,g:'pre'});
    if(H.out) c.outExtra[hz.id]=H.out;
    const by=b3Unit(F,hz.src)||e;
    const hc={F,actor:by,src:e,tgt:e,targets:[e],hit:[],beats:c.beats,g:'pre',detonated:{},reacted:{},tags:['hazard'],ledger:{}};
    b3RunEffects(F,hc,H.effects);
    if(hz.uses<=0) { F.hazards.splice(F.hazards.indexOf(hz),1); c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,g:'pre'}); }
    b3KoCheck(F,c);
    b3PayLedger(F,hc);
  }
}
// A family member's action hit this foe: each counter act it has ready answers, once per action however many hits landed
// (bestiary 1.1 "Counter acts"). The answer runs as a reaction after the action (engine/b3-hooks.js b3RunReactions).
function b3QueueCounters(F,c,t,a) {
  if(!t.D||!b3Alive(t)||b3HasFlag(t,'noPassives')) return;   // Main Breaker Flip (`noPassives`): a blackout, its counter acts do not answer
  const done=c.reacted||(c.reacted={});
  for(const A of t.D.acts) {
    if(A.hits!=='attacker'||done[t.key+'ca:'+A.id]||!b3ActOk(F,t,A)) continue;
    done[t.key+'ca:'+A.id]=true;
    const effects=(A.power>0?[{op:'damage',power:A.power,flavor:A.flavor,to:'attacker'}]:[]).concat(A.effects);
    F.reactions.push({u:t,L:{effects},src:a,status:null,name:A.name,act:A.id,tags:A.tags,root:done});
  }
}
function b3ActUsed(F,e,A) {
  e.lastUse[A.id]=e.turns; e.lastRound[A.id]=F.round; e.uses[A.id]=(e.uses[A.id]||0)+1;
  // `starts:'act id'` (Strict Grading's first use): this act also starts the other act's "every N turns" count, so the repeat comes N turns after it.
  if(A.starts) e.lastUse[A.starts]=e.turns;
  if(A.when&&A.when.everyRound) e.everyUsed[A.id]=Math.floor((F.round-1)/A.when.everyRound);
}
// One enemy turn. Returns its beats; the state is final when it returns.
function b3FoeTurn(F,e) {
  const beats=[];
  if(b3ScriptTurn(F,e,beats)) return beats;   // a story fight's scripted end (engine/b3-script.js)
  // A monster that dived (`surfaces`) and lost its wound-up Deep Dive to an interrupt or a Break comes back up as its turn begins.
  if(e.D.surfaces&&e.row==='back'&&!e.charge) { e.row='front'; b3Reslot(F); beats.push({t:'row',tgt:e.key,row:'front',g:'pre'}); }
  const P=b3FoePick(F,e);
  // Whatever Cartridge Blow showed is judged as this turn begins: it is spent whether it held or not (b3EndTurn clears it).
  if(!P) { b3EndTurn(F,e,B3_RULES.forecast,beats); return beats; }
  const A=P.act;
  // A charged act is announced this turn and fires on the foe's next turn. (An act with `then` is itself the wind-up: it runs now.)
  if(A.tags.includes('charge_up')&&!P.fire&&!A.then) {
    e.charge=A;
    beats.push({t:'telegraph',src:e.key,id:A.id,name:A.name,mark:null,g:'pre'});
    b3Fire(F,'foeTelegraph',{src:e,g:'pre'},beats);
    b3EndTurn(F,e,B3_RULES.telegraph,beats);
    return beats;
  }
  const c={F,actor:e,src:e,skill:null,rec:A.recovery,targets:[],hit:[],beats,g:'pre',detonated:{},reacted:{},tags:A.tags,outExtra:{},ledger:{}};
  b3HazardTrip(F,e,A,c);
  // The fall knocked it out, or took its last pip: no act this turn. (A Break has already said which wound-up act was lost.)
  if(!b3Alive(e)||e.broken) {
    if(b3Alive(e)&&!P.fire) { b3LoseCharge(F,e,A); beats.push({t:'interrupt',src:null,tgt:e.key,id:A.id,name:A.name,why:'break',g:'pre'}); }
    b3EndTurn(F,e,A.recovery,beats); return beats;
  }
  e.charge=null;
  const T=b3FoeTargets(F,e,A,null),targets=T.targets;
  b3ActUsed(F,e,A);
  if(T.single&&targets[0]) e.lastAim[A.id]={key:targets[0].key,turn:e.turns};
  if(T.wide&&!A.tags.includes('aoe')) c.tags=A.tags.concat('aoe');
  const S={id:A.id,name:A.name,flavor:A.flavor,power:A.power,hits:1,target:T.single?'foe':A.hits==='self'?'self':'all_foes',effects:A.effects};
  c.skill=S; c.targets=targets;
  beats.push({t:'act',src:e.key,id:A.id,name:A.name,flavor:A.flavor,shape:A.tags.includes('melee')?'strike':A.power>0?'throw':'self',hits:1,tgts:targets.map(t=>t.key),foe:true,g:'pre'});
  b3Fire(F,'actionDeclared',{src:e,g:'pre',c},beats);
  if(T.hidden) beats.push({t:'miss',src:e.key,tgt:targets[0].key,why:'hidden',g:'pre'});
  else {
    if(A.power>0&&targets.length) b3DamageOp(F,c,{});
    // `stopByIntercept` (CUT!): when someone stepped in, they take the blast and its riders do not land.
    if(A.stopByIntercept&&c.inter&&Object.keys(c.inter).length) { for(const k of Object.keys(c.inter)) for(const ef of A.effects) if(ef.op==='status') c.beats.push({t:'soak',tgt:k,id:ef.id,g:c.g}); }
    else b3RunEffects(F,c,A.effects);
  }
  c.g='post';
  b3KoCheck(F,c);
  b3PayLedger(F,c);
  // This act was the wind-up of another: that one fires on the foe's next turn, at whoever this one Marked.
  if(A.then&&b3Alive(e)&&!e.broken) {
    const N=e.D.acts.find(x=>x.id===A.then);
    e.charge=N;
    beats.push({t:'telegraph',src:e.key,id:N.id,name:N.name,mark:e.mark,g:'post'});
    b3Fire(F,'foeTelegraph',{src:e,g:'post'},beats);
  } else if(A.then) e.mark=null;
  b3RunReactions(F,beats);
  b3Fire(F,'actionEnd',{src:e,g:'post',c},beats);
  b3KoCheck(F,c);
  b3EndTurn(F,e,A.recovery,beats);
  return beats;
}
