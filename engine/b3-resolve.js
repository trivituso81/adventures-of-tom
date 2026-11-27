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
//   hazardOn {id, side, uses, rounds}  hazardTrip {id, tgt, left}  hazardEnd {id, side, why}  (why: 'strip', 'burst' for a vessel, 'ko')
//   vesselSoak {id, src, tgts, left}  a vessel on the family's floor soaked the monster src's whole act (TNB's Grand Amphora)
//   vitrify {tgt}  a clay shield was fired into Fired Glaze;  rebalance {src, tgt, n, hpSrc, hp}  src gave n HP to tgt (Waymo Tailgate Rescue)
//   counter {tgt, id, v}  crack {tgt, v}
//   passive {src, id, name}           a Trait or Quirk went off (only the ones whose row says show:true)
//   grant {src, tgt}                  tgt may take one Skill at once, out of turn; grantEnd {who, bar} closes that free action
//   ruckus {n, v}                     the Family Ruckus gauge moved (the screen shows it from stage 6 on)
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
  // What lasts until the next turn of whoever put it on (a Winged Shell) ends when that turn begins.
  for(const v of F.units) for(const id of Object.keys(v.st)) if(v.st[id].unit==='srcBegin'&&v.st[id].src===u.key) { b3EndStatus(F,v,id,'time'); beats.push({t:'statusEnd',tgt:v.key,id,g:'pre'}); }
  // A foe that was Broken gets this turn whatever else is on it, with its pips full again; they stay locked until the turn ends (spec 2.7).
  if(u.broken) { u.broken=false; u.flusterTurn=true; u.pips=u.maxPips; beats.push({t:'pips',tgt:u.key,n:0,left:u.pips,max:u.maxPips,refill:true,g:'pre'}); }
  for(const id of Object.keys(u.st)) {
    const S=B3_STATUS[id],s=u.st[id]; if(!S.tick||!s) continue;
    b3TickHit(F,c,u,id,s);
  }
  b3KoCheck(F,c);
  for(const id of Object.keys(u.st)) {
    const S=B3_STATUS[id],s=u.st[id]; if(!s||!S.regen||!b3Alive(u)) continue;
    const got=b3Heal(F,u,u.maxHp*(s.v==null?S.regen:s.v)); if(got) beats.push({t:'heal',tgt:u.key,n:got,hp:u.hp,id,g:'pre'});
  }
  b3Fire(F,'turnStart',{src:u,tgt:u,g:'pre'},beats);
  // A monster that takes a turn for the second time before any family member has acted since its first (Amy's "I'm Counting to Three"). Its
  // answer runs now, before the monster picks its move.
  if(u.side==='foe') { let dbl=false;
    for(let i=F.turnLog.length-2;i>=0;i--) { const k=F.turnLog[i]; if(k===u.key) { dbl=true; break; } const w=b3Unit(F,k); if(w&&w.side==='party') break; }
    if(dbl) { b3Fire(F,'foeDoubleTurn',{src:u,tgt:u,g:'pre'},beats); b3RunReactions(F,beats); } }
  b3RunLater(F,u,beats);
  // Frozen: every turn is lost until the status runs out (it counts down in b3EndTurn like any turn-length status).
  if(b3Alive(u)&&b3HasFlag(u,'frozen')&&!b3HasFlag(u,'skipTurn')) { beats.push({t:'skip',who:u.key,g:'pre'}); b3EndTurn(F,u,B3_RULES.forecast,beats); return false; }
  if(b3Alive(u)&&b3HasFlag(u,'skipTurn')) {
    for(const id of Object.keys(u.st)) if(B3_STATUS[id].flags.includes('skipTurn')) { b3EndStatus(F,u,id,'used'); beats.push({t:'statusEnd',tgt:u.key,id,g:'pre'}); }
    if(u.flusterTurn) return true;   // "A foe always gets that turn": the Stun is spent and the turn is not lost
    beats.push({t:'skip',who:u.key,g:'pre'});
    b3EndTurn(F,u,B3_RULES.forecast,beats);
    return false;
  }
  return b3Alive(u);
}
// One tick of a damage-over-time status on u (Toasty's burn, Bleed). A tick takes the target's Defense and what it says about the flavor
// (a Pet Peeve, a Resist, "takes less Sizzle"), and rolls to crit when whoever put it on has `hoseFlinched` ("The Hose Flinched").
function b3TickHit(F,c,u,id,s) {
  const S=B3_STATUS[id],fl=S.tick.flavor,pv=b3Peeves(u).includes(fl),rs=u.resists.includes(fl);
  const src=s.src&&b3Unit(F,s.src),crit=!F.preview&&!!(src&&src.custom&&src.custom.hoseFlinched&&b3Rand(F)<b3CritChance(src,u));
  const dmg=Math.max(1,Math.round(s.atk*B3_RULES.power[S.tick.power]*100/(100+b3Stat(u,'def'))*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*b3TakenMult(u,0,{F,c,t:u,fl})*(crit?B3_RULES.crit.dmg:1)));
  b3Hurt(F,c,u,dmg,Object.assign({src:s.src,flavor:fl,peeve:pv,resist:rs,tick:id},crit?{crit:true}:null));
}
// What this unit left for its next turn (the `later` op) runs now, each as its own small action with its own group of beats and
// its own Composure ledger. The monsters it was aimed at may be gone: a random live one takes their place.
function b3RunLater(F,u,beats) {
  const mine=F.later.filter(L=>L.key===u.key); if(!mine.length) return;
  F.later=F.later.filter(L=>L.key!==u.key);
  for(const L of mine) {
    if(!b3Alive(u)) break;
    const foes=b3Live(F,b3Other(u.side));
    let tg=L.who==='foes'?foes:L.tgt.map(k=>b3Unit(F,k)).filter(b3Alive);
    if(!tg.length&&foes.length&&L.who!=='foes') tg=[foes[Math.floor(b3Rand(F)*foes.length)]];
    if(!tg.length) continue;
    const g='l'+(F.reactSeq++);
    beats.push({t:'react',src:u.key,tgt:tg[0].key,name:L.name,g});
    const c={F,actor:u,src:null,skill:L.skill,tgt:null,targets:tg,hit:[],beats,g,detonated:{},reacted:{},tags:['later'],ledger:{}};
    b3RunEffects(F,c,L.effects);
    b3SpendCounters(F,c); b3KoCheck(F,c); b3PayLedger(F,c); b3RunReactions(F,beats);
  }
}
// The next unit able to act, with the beats that led up to its turn. unit is null when the fight is over.
function b3Next(F) {
  const beats=F.opening||[]; F.opening=null;
  F.grant=null;   // a granted action nobody took is gone once the clock moves
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
    u.jumped=0;   // (stage 19) the count of icons leapt past restarts; the pull below counts toward the next turn
    // A pull this turn asked for after its wait was set ("Better Than Bobby!": the next turn comes sooner).
    if(u.nextPull) { const amt=b3Pull(F,u,u.nextPull); u.nextPull=0; if(amt) beats.push({t:'pull',tgt:u.key,n:amt,bar:b3BarSnap(F,null,0),g:'end'}); }
    if(u.side==='party') b3FrameCheck(F,u,beats);   // chapter 20: Still Frame is judged as a family member's turn ends
    for(const id of Object.keys(u.st)) { const s=u.st[id]; if(!s||s.unit!=='turn') continue;   /* a status an earlier one's end took away: Toasty ending ends Five-Alarm Burn with it (found in stage 11) */
      if(s.skip) { s.skip=false; continue; }
      if(--s.n<=0) { b3EndStatus(F,u,id,'time'); beats.push({t:'statusEnd',tgt:u.key,id,g:'end'}); b3Fire(F,'statusEnded',{src:u,tgt:u,id,g:'end'},beats); } }
    for(const sh of u.shields.slice()) {
      if(sh.skip) { sh.skip=false; continue; }
      if(--sh.n<=0) { u.shields.splice(u.shields.indexOf(sh),1); beats.push({t:'shieldEnd',tgt:u.key,sh:b3ShieldTotal(u),g:'end'}); b3Fire(F,'shieldEnded',{src:u,tgt:u,by:sh.src,g:'end'},beats); } }
    b3Fire(F,'turnEnd',{src:u,tgt:u,g:'end'},beats);
    u.hitSince=false;
  }
  F.acting=null;
  b3PhaseCheck(F,u,beats);   // chapter 20: a foe whose HP reached its phase line starts its next phase
  if(u.side==='foe') { u.aimLock=null; u.intent=null; }   // what Cartridge Blow showed was for this turn
  b3IntentRefresh(F);
  beats.push({t:'endTurn',who:u.key,bar:b3BarSnap(F,null,0),g:'end'});
  if(b3CheckOver(F)) b3OverBeats(F,beats,'end');
}

// ---------- Damage ----------
// Shields soak damage before HP, the oldest first (spec 2.4). The action keeps what each target lost and what its shields
// soaked, so a status riding on a fully soaked enemy hit can be stopped (engine/b3-ops.js b3Soaked).
function b3Hurt(F,c,t,dmg,info) {
  let left=dmg,soak=0; const broke=[];
  b3ClaySizzle(F,c,t,info);   // a Sizzle hit fires a stone clay shield first
  const glazed=[];
  for(const sh of (info&&info.pierce?[]:t.shields)) { if(left<=0) break; const pw=b3ShieldPower(sh,info),a=Math.min(sh.amt*pw,left); sh.amt-=a/pw; left-=a; soak+=a; if(sh.glaze) glazed.push([sh,a]); if(sh.amt<=1e-9) { sh.amt=0; broke.push(sh); } }
  if(broke.length) t.shields=t.shields.filter(sh=>sh.amt>0);
  // A status with the `survive` flag (the Ward's jacket) keeps its carrier at 1 HP the first time a hit would knock them out, then is spent.
  let held=null,gold=null;
  if(left>=t.hp&&t.hp>0) { held=Object.keys(t.st).find(i=>B3_STATUS[i].flags.includes('survive')&&!t.st[i].spent); if(held) { t.st[held].spent=true; left=t.hp-1; }
    // "Gold Like My Teeth" (Boppy, stage 9c, `custom:'goldTeeth'`): once a battle a lethal hit leaves him on 1 HP, and he gains Pep.
    else if(t.custom&&t.custom.goldTeeth&&!t.used.goldTeeth) { t.used.goldTeeth=true; gold=t.custom.goldTeeth; held='gold_teeth'; left=t.hp-1; } }
  if(t.hpFloor!=null&&left>t.hp-t.hpFloor) left=Math.max(0,t.hp-t.hpFloor);   // a scripted monster's HP never falls below its floor (cfg.setup.midpoint.hold)
  const pf=b3PhaseFloor(t); if(pf!=null&&left>t.hp-pf) left=Math.max(0,t.hp-pf);   // chapter 20: damage past a phase line is lost
  const hp0=t.hp;
  t.hp=Math.max(0,t.hp-left);
  if(pf!=null&&t.hp<=pf) t.phaseDue=true;
  if(soak) (c.soak=c.soak||{})[t.key]=(c.soak[t.key]||0)+soak;
  if(left) (c.lost=c.lost||{})[t.key]=(c.lost[t.key]||0)+left;
  if(!(info&&info.tick)) t.hitSince=true;
  c.beats.push(Object.assign({t:'hit',tgt:t.key,dmg,hp:t.hp,g:c.g},soak?{soak,sh:b3ShieldTotal(t)}:null,info));
  if(held) c.beats.push({t:'survive',tgt:t.key,id:held,hp:t.hp,g:c.g});
  if(gold) { const got=b3Pep(F,t,gold.pep,'effect'); if(got) c.beats.push({t:'pep',tgt:t.key,n:got,pep:t.pep,g:c.g}); }
  for(const [sh,a] of glazed) b3GlazeReflect(F,c,t,sh,a,info);   // Fired Glaze throws back what it soaked
  for(const sh of broke) { c.beats.push({t:'shieldBroken',tgt:t.key,g:c.g}); b3Fire(F,'shieldBroken',{src:c.actor,tgt:t,by:sh.src,g:c.g,c},c.beats); }
  // Stage 19. The last hit a monster dealt to the family (Jumbotron Instant Replay rewinds half of it), and the moment a family member
  // drops below B3_LOW_HP of their Max HP (Eyes in the Back of Her Head).
  if(t.side==='party'&&info&&!info.tick&&info.src&&left+soak>0) { const sU=b3Unit(F,info.src); if(sU&&sU.side!==t.side) F.lastAllyHit={tgt:t.key,src:info.src,dmg:left+soak,flavor:info.flavor||null}; }
  if(t.side==='party'&&t.hp>0&&hp0>=t.maxHp*B3_LOW_HP&&t.hp<t.maxHp*B3_LOW_HP) b3Fire(F,'allyBelowHp',{src:c.actor,tgt:t,g:c.g,c},c.beats);
}
function b3KoCheck(F,c) {
  for(const u of F.units) if(!u.ko&&u.hp<=0) {
    b3VesselOwnerKo(F,c,u);
    u.ko=true; u.st={}; u.shields=[]; u.charge=null; u.mark=null; u.aimLock=null; u.intent=null; u.broken=false; u.flusterMove=false; u.wait=0;
    // A status that waits for this unit's next turn will never see it end (a Winged Shell Tom put on a monster).
    for(const v of F.units) for(const id of Object.keys(v.st)) if(v.st[id].unit==='srcBegin'&&v.st[id].src===u.key) { delete v.st[id]; c.beats.push({t:'statusEnd',tgt:v.key,id,g:c.g}); }
    c.beats.push({t:'ko',tgt:u.key,g:c.g});
    b3Fire(F,'ko',{src:c.actor,tgt:u,g:c.g},c.beats);
    // Helper feedback (bestiary 1.1): a monster with an `onKo` row (the Acorn Cache) answers its own knock-out, unless it was eaten. The ops
    // run as the helper; the pips it takes off a boss go into this action's ledger, so they count inside the 3-pip cap.
    if(u.side==='foe'&&u.D&&u.D.endsFight) for(const o of F.foes) if(o!==u&&!o.ko) { o.ko=true; o.hp=0; o.st={}; o.charge=null; c.beats.push({t:'ko',tgt:o.key,g:c.g}); }   // chapter 20: the Collector falls and its lenses go dark
    if(u.side==='foe'&&u.D&&u.D.onKo&&!u.eaten) b3RunEffects(F,{F,actor:u,src:u,tgt:null,targets:[u],hit:[],beats:c.beats,g:c.g,detonated:{},reacted:{},tags:['helper'],outExtra:{},ledger:c.ledger||(c.ledger={})},u.D.onKo);
  }
}
// ---------- Composure and Break (spec 2.7) ----------
// Every action keeps a ledger per foe: {n: pips from Detonations and printed Composure numbers, peeve: a Pet Peeve hit landed}.
// A Pet Peeve is worth 1 pip per action however many hits landed. Only Elites and Bosses have pips.
function b3Pips(c,t,n,peeve) {
  if(!t||t.side!=='foe'||!t.maxPips) return;
  if(c.stampNoPip&&c.stampNoPip[t.key]) return;   // REDACTED (chapter 19): a move of only the stamped flavor takes no pips
  const LG=c.ledger||(c.ledger={}),L=LG[t.key]||(LG[t.key]={n:0,peeve:false});
  if(peeve) L.peeve=true; else L.n+=n;
}
// The ledger is paid when the action ends: 3 pips at most from one foe, from every source together (c.pipCap raises it to 4
// for a Full Family Ruckus). A foe whose pips are locked loses none. At 0 pips the foe Breaks.
function b3PayLedger(F,c) {
  const R=B3_RULES.composure,cap=c.pipCap||R.capPerAction,LG=c.ledger||{},paid=c.paid||(c.paid={});
  // A Trait that answers a shave with one more pip (Spotless Floor) writes into the same ledger while it is being paid, so it
  // is paid in a further pass, inside the same cap.
  for(let pass=0;pass<4&&Object.keys(LG).length;pass++) for(const key of Object.keys(LG)) {
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
  for(const key of Object.keys(LG)) delete LG[key];
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
  if(t.stamp) { t.stamp=null; c.beats.push({t:'statusEnd',tgt:t.key,id:'stamp',why:'break',g:c.g}); }   // chapter 19: a Break tears the REDACTED stamp down
  if(t.D&&t.D.perch&&t.row==='back') B3_OPS.row(F,Object.assign({},c,{actor:t}),{row:'front',to:'self'});   // chapter 19: a Break pins the Courier in Front until it next acts
  // During its own turn its wait is not set yet, so it falls back when that turn ends (b3EndTurn).
  if(F.acting===t) t.flusterMove=true; else b3FlusterMove(F,t,c.actor===F.acting?c.rec:0);
  c.beats.push({t:'break',src:c.actor.key,tgt:t.key,bar:b3BarSnap(F,F.acting,c.rec),g:c.g});
  if(c.actor&&c.actor.side==='party') b3RuckusAdd(F,c.beats,c.g,B3_RULES.ruckus.brk,c.actor.key,'break');
  b3Fire(F,'break',{src:c.actor,tgt:t,g:c.g,c},c.beats);
}

// The Detonation a hit of this flavor would set off on this unit: the row for its oldest matching Prime (spec 2.5).
// An attacker whose status has the `razzleDet` flag (TNB's Gold Seam) also sets off the Razzle Detonation with a hit of any flavor.
function b3FindDetonation(t,flavor,a) {
  const find=fl=>{ let best=null;
    for(const D of B3_DETONATIONS) if(D.flavor===fl&&t.st[D.prime]&&(!best||t.st[D.prime].at<t.st[best.prime].at)) best=D;
    return best; };
  return find(flavor)||(a&&flavor!=='razzle'&&b3HasFlag(a,'razzleDet')?find('razzle'):null);
}
// A move's own condition for a bonus (B3_CONDS is the list the data check knows).
//   targetHas  the target carries one of `ids`
//   tookHit    the attacker took or blocked a hit since its last turn ended (a burn tick is not a hit)
// A bonus with grow:true is counted once for every hit of the move so far (hit 3 of a move gets three times `add`).
const B3_CONDS=['targetHas','tookHit','targetDebuffs'];
function b3Cond(F,c,cond,t) {
  if(cond.if==='targetHas') return cond.ids.some(id=>t.st[id]);
  if(cond.if==='tookHit') return !!c.actor.hitSince;
  if(cond.if==='targetDebuffs') return Object.keys(t.st).filter(id=>['debuff','mark'].includes(B3_STATUS[id].kind)).length>=cond.min;   // stage 19: Act-Three Mask Reveal (2 or more)
  throw new Error('Battle 3 condition not built yet: '+cond.if);
}
// The chance a hit crits: the base rate, the attacker's own bonus, what the target gives away (Dazzled), and a Skill that crits more
// often for every Prime on the target (`critPerPrime` on its damage effect: Konami Code).
const b3CritChance=(a,t,e)=>B3_RULES.crit.rate+b3Sum(a,'crit')+b3Sum(t,'critTaken',{a,t})+(e&&e.critPerPrime?e.critPerPrime*b3PrimeCount(t):0);
// One hit on one target. `per` is the Skill Power of each flavor part of this hit.
function b3Hit(F,c,t,per,flavors,e,single) {
  const a=c.actor,B=c.beats;
  c.ledger=c.ledger||{};
  // Misses: Blind (the next single-target attack), an accuracy penalty, then the target's Evasion.
  if(single&&b3HasFlag(a,'blind')) {
    for(const id of Object.keys(a.st)) if(B3_STATUS[id].flags.includes('blind')) { b3EndStatus(F,a,id,'used'); B.push({t:'statusEnd',tgt:a.key,id,g:c.g}); }
    B.push({t:'miss',src:a.key,tgt:t.key,why:'blind',g:c.g}); return;
  }
  // Airborne (Five-Six-Seven-Eight!): an act with the `ground_sweep` tag misses a family member in the air.
  if(a.side==='foe'&&t.side==='party'&&c.tags&&c.tags.includes('ground_sweep')&&b3HasFlag(t,'airborne')) { B.push({t:'miss',src:a.key,tgt:t.key,why:'airborne',g:c.g}); return; }
  // Upside-Down Pilot Wings (a `pierce` mod) or a pierce effect: the hit ignores Evasion, shields and a Guard Stance.
  const pierce=!!(e&&e.pierce)||b3Sum(a,'pierce',{F,c,a,t,fl:flavors[0]})>0;
  // Gold-Star Sticker (`trueAim`): the carrier's hits ignore accuracy penalties and Evasion. A Blind still makes the next single-target hit miss.
  const ta=b3HasFlag(a,'trueAim');
  const mc=ta?0:b3MissChance(a); if(mc>0&&b3Rand(F)<mc) { B.push({t:'miss',src:a.key,tgt:t.key,why:'acc',g:c.g}); return; }
  // A pierce hit (Stunt-Double Squirrel Intercept) ignores Evasion and shields. A hit that is part of a party-wide act is `wide`.
  const ev=pierce||ta?0:b3Evasion(t,!single,{F,c,a,t,fl:flavors[0]}); if(ev>0&&b3Rand(F)<ev) { B.push({t:'miss',src:a.key,tgt:t.key,why:'dodge',g:c.g}); b3Fire(F,'dodge',{src:a,tgt:t,g:c.g},B); return; }
  c.landed=(c.landed||0)+1;   // hits this action has landed so far ("It's OUR Longboard Now")
  // Family Ruckus: each hit after the first of a multi-hit move that lands (engine/b3-ruckus.js).
  if(a.side==='party'&&t.side==='foe'&&e.power==null&&c.skill&&b3HitsOf(a,c.skill)>1&&(c.hitNo||0)>=1) b3RuckusAdd(F,B,c.g,B3_RULES.ruckus.extraHit,a.key,'hits');
  // One crit roll per hit: base rate, the attacker's own bonus, and what the target gives away (Dazzled).
  // Measure Twice, Cut Once (`guaranteeCrit`, with `critFlavors`): the next Clobber or Razzle hit is a sure crit, and that status is used up by it.
  let gcId=null; if(!F.preview) for(const id of Object.keys(a.st)) { const S=B3_STATUS[id]; if(S.flags.includes('guaranteeCrit')&&flavors.some(f=>S.critFlavors.includes(f))) { gcId=id; break; } }
  if(gcId) { b3EndStatus(F,a,gcId,'used'); B.push({t:'statusEnd',tgt:a.key,id:gcId,g:c.g}); }
  const crit=!!gcId||(!F.preview&&b3Rand(F)<b3CritChance(a,t,e));   // a preview (engine/b3-preview.js) never shows luck
  if(crit) b3Fire(F,'crit',{src:a,tgt:t,g:c.g},B);
  // An intercepted hit lands that much weaker on the one who stepped in.
  const red=c.inter&&c.inter[t.key]?c.inter[t.key].reduce:0;
  // REDACTED: a move whose every flavor is the stamped one takes no pips from this monster, and its user loses 1 Pep when the action ends.
  const whole=a.side==='party'&&t.side==='foe'&&!!t.stamp&&flavors.every(x=>x===t.stamp);
  if(whole) { (c.stampNoPip=c.stampNoPip||{})[t.key]=true; c.stampPep=true; }
  for(let fi=0;fi<flavors.length;fi++) {
    const fl=flavors[fi];
    if(t.hp<=0) break;
    // Detonation check, before this flavor part lands: once per target per action, on the oldest matching Prime. Enemies never Detonate.
    // A Skill with `detonatesAll` (Don't Leave Me! Meltdown) sets off every matching Prime in turn, not only the oldest one (spec 2.5).
    const every=!!(c.skill&&c.skill.detonatesAll);
    let det=a.side==='party'&&t.side==='foe'&&(every||!c.detonated[t.key])?b3FindDetonation(t,fl,a):null;
    // The move's own bonus: `per` counts something this action did (buffs stripped), `if` is a condition on the target.
    const bonus=Object.assign({},c.outExtra);
    // `counter` reads one of the attacker's Portable Counters (so much per point built up).
    if(e.bonus) { if(e.bonus.counter) { const n=a.counters[e.bonus.counter]||0; bonus.skill=e.bonus.add*n; if(e.bonus.spend&&n) (c.spend=c.spend||{})[a.key+':'+e.bonus.counter]=true; }
      else if(e.bonus.targetBuffs) bonus.skill=e.bonus.add*b3BuffCount(t);   // every buff on the monster (Is This Real? Fact-Check)
      else if(e.bonus.buffs) bonus.skill=e.bonus.add*b3BuffCount(a);   // every buff the attacker has (Regional Championship Freestyle)
      else if(e.bonus.per) bonus.skill=e.bonus.add*(c[e.bonus.per]||0);
      else if(b3Cond(F,c,e.bonus,t)) bonus.skill=e.bonus.add*(e.bonus.grow?(c.hitNo||0)+1:1); }
    const pv=b3Peeves(t).includes(fl),rs=t.resists.includes(fl)&&!b3HasFlag(t,'resistStep');   // stage 19: Breaking Exclusive lowers a resistance one step (it becomes neutral)
    // What this hit is, for the mods that only count on some hits (a Quirk's `when`, a rider like Spit Shine): b3Mods in engine/b3-core.js.
    const mx={F,c,a,t,fl,pierce};
    let dmg=b3Stat(a,'atk')*per*100/(100+b3Stat(t,'def'))*b3OutMult(a,bonus,mx)*(pv?B3_RULES.peeve:1)*(rs?B3_RULES.resist:1)*(crit?B3_RULES.crit.dmg*(1+b3Sum(a,'critDmg',mx)):1)*b3TakenMult(t,red,mx);
    if(single&&fl==='clobber'&&b3EffRow(F,t)==='back') dmg*=1-B3_RULES.backRowClobber;
    if(t.side==='party') dmg*=F.mods.taken;
    const stamped=a.side==='party'&&t.side==='foe'&&t.stamp===fl;
    if(stamped) dmg*=t.D.redact.dmg;   // REDACTED: the stamped flavor part does half damage
    dmg=Math.max(1,Math.round(dmg));
    while(det) {
      c.detonated[t.key]=true; (c.detPrime=c.detPrime||{})[t.key]=det.prime; b3FrameMove(a); { const ps=t.st[det.prime]; if(ps&&ps.src) b3FrameMove(b3Unit(F,ps.src)); } b3EndStatus(F,t,det.prime,'detonated');
      B.push({t:'detonate',src:a.key,tgt:t.key,id:det.id,name:det.name,prime:det.prime,g:c.g});
      b3RunEffects(F,Object.assign({},c,{tgt:t,partDmg:dmg}),det.effects);
      if(!stamped) b3Pips(c,t,det.pips);
      const got=b3Pep(F,a,B3_RULES.pep.detonation,'detonation'); if(got) B.push({t:'pep',tgt:a.key,n:got,pep:a.pep,g:c.g});
      b3RuckusAdd(F,B,c.g,B3_RULES.ruckus.detonation,a.key,'detonation');   // the gauge's own Detonation gain; a Trait's extra comes with the hook
      b3Fire(F,'detonation',{src:a,tgt:t,id:det.id,g:c.g,c},B);
      det=every?b3FindDetonation(t,fl,a):null;
    }
    b3Hurt(F,c,t,dmg,Object.assign({src:a.key,flavor:fl,crit,peeve:pv,resist:rs},pierce?{pierce:true}:null));
    b3RuckusMix(F,c,a,t,fl,pv||!!c.detonated[t.key]);
    if(!c.hit.includes(t)) c.hit.push(t);
    if(t.dmgLog&&a.side==='party'&&!F.preview) t.dmgLog[fl]=(t.dmgLog[fl]||0)+dmg;   // the Censor reads this at the next round divider
    if(a.side==='party'&&t.side==='foe') {
      if(pv&&!stamped) b3Pips(c,t,0,true);          // a Pet Peeve hit: 1 pip per action, not per hit (spec 2.7)
      b3QueueCounters(F,c,t,a);           // an enemy's counter act answers, once per action (engine/b3-foe.js)
    }
    // The Prime of the move's first flavor, unless this action detonated on this target (spec 2.5).
    const P=fi===0?B3_FLAVORS[fl].prime:null;
    if(P&&a.side==='party'&&t.side==='foe'&&!c.detonated[t.key]&&t.hp>0) {
      b3AddStatus(F,t,P,{src:a}); B.push({t:'status',tgt:t.key,id:P,g:c.g}); b3Fire(F,'primeApplied',{src:a,tgt:t,id:P,g:c.g,c},B);
    }
    b3Fire(F,'afterHit',{src:a,tgt:t,dmg,flavor:fl,crit,part:fi,g:c.g,tags:c.tags||[],c},B);
  }
  // A status with `hits:{n, tagsAny}` (Hang Fresh Drywall) wears down by one for each hit that lands on its carrier from the other side with one of those tags.
  if(a.side!==t.side) for(const id of Object.keys(t.st)) { const H=B3_STATUS[id].hits; if(!H||!(c.tags&&H.tagsAny.some(x=>c.tags.includes(x)))) continue;
    const s=t.st[id]; s.left=(s.left==null?H.n:s.left)-1; if(s.left<=0) { b3EndStatus(F,t,id,'used'); B.push({t:'statusEnd',tgt:t.key,id,why:'used',g:c.g}); } }
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
  const a=c.actor,hits0=b3HitsOf(a,S),hits=a.side==='foe'&&b3HasFlag(a,'fumble')?1:hits0,all=own?!!e.aoe:(S.target==='all_foes'||S.target==='foe_row');
  const tier=typeof S.power==='number'?S.power:B3_RULES.power[S.power];
  // A move with `hitsBy`: its power is for `base` hits, and every hit past that adds `grow` of it (Criss-Cross Double-Under).
  const grow=S.hitsBy?1+S.hitsBy.grow*(hits-S.hitsBy.base):1;
  const per=tier*grow*(all&&a.side==='party'?B3_RULES.aoeShare:1)/hits0/S.flavor.length*(c.scale||1);   // stage 19: a Fumbled monster (Mega Whoopee-Cushion Trap) lands only the first hit of a multi-hit act
  if(own) { for(let h=0;h<hits;h++) for(const t of b3Who(F,c,e.to).filter(b3Alive)) b3Hit(F,c,t,per,S.flavor,e,!all); return; }
  c.didDamage=true;
  if(a.side==='foe'&&b3VesselTake(F,c)) { c.g='post'; return; }   // a vessel on the family's floor soaked the whole act
  for(let h=0;h<hits;h++) {
    c.g=h+(c.gOff||0); c.hitNo=h;
    let tg;
    if(S.target==='random_foes') { const L=b3Live(F,b3Other(a.side)); tg=L.length?[L[Math.floor(b3Rand(F)*L.length)]]:[]; }
    else tg=c.targets.filter(b3Alive);
    if(!tg.length) break;
    // An enemy's single-target hit is redirected to whoever stepped in for its target (spec 2.8). Party-wide acts are not.
    if(!all&&a.side==='foe') tg=tg.map(t=>{ const I=b3Interceptor(F,t); if(!I) return t;
      (c.inter=c.inter||{})[I.u.key]={reduce:I.reduce,forKey:t.key}; c.beats.push({t:'intercept',src:I.u.key,tgt:t.key,g:h}); return I.u; });
    c.beats.push({t:'swing',src:a.key,tgts:tg.map(t=>t.key),g:c.g});
    for(const t of tg) b3Hit(F,c,t,per,S.flavor,e,!all);
    // Taking a hit for someone gives +1 Pep, once per enemy action (spec 2.3).
    if(c.inter) for(const t of tg) if(c.inter[t.key]&&!c.inter[t.key].paid) { c.inter[t.key].paid=true;
      const got=b3Pep(F,t,B3_RULES.pep.intercept,'intercept'); if(got) c.beats.push({t:'pep',tgt:t.key,n:got,pep:t.pep,g:h});
      b3Fire(F,'intercept',{src:a,tgt:t,for:b3Unit(F,c.inter[t.key].forKey),g:h,c},c.beats); }
  }
  c.g='post';
}

// ---------- A party member's action ----------
// Returns {ok, beats} or {ok:false, why}. The cost is paid, the whole result is worked out, the turn ends.
// A granted action (F.grant names this unit; the `grant` op in engine/b3-ops.js): the Skill must be one the grant allows, it is
// free when the grant says so, and it is resolved in place: no wait is set, no turn is counted, nothing on the unit counts down.
function b3Act(F,u,skillId,optKey) {
  const G=F.grant&&F.grant.key===u.key?F.grant:null;
  if(F.grant&&!G) F.grant=null;   // someone else is acting: the door is closed
  const S=B3_SKILLS[skillId];
  if(G&&!b3GrantSkills(F,u,G).includes(S)) return {ok:false,why:'That is not a Skill '+u.name+' can take for free right now.'};
  const can=b3CanUse(F,u,S);
  if(!can.ok) return {ok:false,why:can.why};
  const O=b3Options(F,u,S).find(o=>o.key===optKey);
  if(!O||O.no) return {ok:false,why:(O&&O.no)||'Nobody to use that on right now.'};
  const beats=[],rec=G?0:b3MoveRec(F,u,S),cost=b3Cost(F,u,S,O);
  // A Recovery mod that counts once a round (Active Recovery) is marked used now that this move has had it.
  if(!G) for(const m of u.mods) if(m.stat==='moveRec'&&m.when&&m.when.oncePerRound&&b3ModWhen(u,m,{skill:S,F},null)) u.used['pr:'+m.when.oncePerRound]=F.round;
  if(S.cooldown) u.cd[S.id]=F.round+S.cooldown;
  if(u.custom&&u.custom.mailbox&&['s1','s2','cap'].includes(S.slot)) u.lastSkill=S.id;   // "The Mailbox Moved": counters copy this Skill (engine/b3-custom.js)
  F.grant=null;
  const c={F,actor:u,src:u,skill:S,rec,targets:O.units.slice(),hit:[],beats,g:'pre',detonated:{},reacted:{},tags:S.tags||[],ledger:{}};
  beats.push({t:'act',src:u.key,id:S.id,name:S.name,flavor:S.flavor,shape:(S.target==='either'&&O.ally)?'give':msShapeOf(S.id)||'strike',hits:b3HitsOf(u,S),tgts:O.units.map(t=>t.key),free:!!G,g:'pre'});
  if(cost) { b3Pep(F,u,-cost,'cost'); beats.push({t:'pep',tgt:u.key,n:-cost,pep:u.pep,g:'pre'}); }
  if(S.slot==='basic') { const got=b3Pep(F,u,B3_RULES.pep.basic,'basic'); if(got) beats.push({t:'pep',tgt:u.key,n:got,pep:u.pep,g:'pre'}); }
  b3Fire(F,'actionDeclared',{src:u,g:'pre'},beats);
  b3RunEffects(F,c,S.target==='either'&&O.ally?S.allyEffects:S.effects);   // Baby-Wipe Swipe: a family member gets the ally branch
  c.g='post';
  b3RelayEnd(F,c);       // riders Twin-Lamb Relay held for the later hits come off now
  b3SpendCounters(F,c);  // counters a bonus cashed in (Upgrade Certificate) go back to 0
  // A Skill's own printed Composure number, on every monster it hit (or aimed at, when it deals no damage).
  if(S.composure) for(const t of (c.hit.length?c.hit:c.targets)) b3Pips(c,t,S.composure);
  b3DoubleCoat(F,c);     // Grace's Razzle-then-Racket chain (engine/b3-custom.js)
  b3Tupperware(F,c);     // Deedee's "Tupperware Send-Off": a single heal or buff bounces to a second ally (engine/b3-custom.js)
  b3Unmailed(F,c);       // Justin's "Unmailed Invitations": a Racket Skill repeated for free (engine/b3-custom.js)
  b3KoCheck(F,c);
  // Composure is paid before anything answers: a foe this action Broke has lost its counter (architecture 2.6, step 6).
  b3PayLedger(F,c);
  b3RunReactions(F,beats);
  b3Fire(F,'actionEnd',{src:u,g:'post',c},beats);
  b3PayLedger(F,c);   // pips a Trait or Quirk added as the action ended
  if(c.stampPep&&u.side==='party') { const lost=-b3Pep(F,u,-1,'stamp'); if(lost) beats.push({t:'pep',tgt:u.key,n:-lost,pep:u.pep,g:'post'}); }   // REDACTED: -1 Pep (never below 0)
  b3KoCheck(F,c);
  b3IntentRefresh(F); // a monster's shown aim is only kept while it still holds (engine/b3-foe.js)
  if(G) { beats.push({t:'grantEnd',who:u.key,bar:b3BarSnap(F,null,0),g:'end'}); if(b3CheckOver(F)) b3OverBeats(F,beats,'end'); }
  else b3EndTurn(F,u,rec,beats);
  return {ok:true,beats};
}
// Counters a damage bonus cashed in during this action (a mod with per:{counter, spend:true}) go back to 0.
function b3SpendCounters(F,c) {
  for(const k of Object.keys(c.spend||{})) { const i=k.indexOf(':'),u=b3Unit(F,k.slice(0,i)),id=k.slice(i+1);
    if(u&&u.counters[id]) { u.counters[id]=0; c.beats.push({t:'counter',tgt:u.key,id,v:0,g:c.g}); } }
  c.spend=null;
}
