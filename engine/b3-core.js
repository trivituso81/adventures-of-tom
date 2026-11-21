'use strict';
// engine/b3-core.js — Battle 3 core: the fight state, its units, start and end, the stat maths (stacking and caps),
// who a move can aim at, and the simple player that the simulator uses.
// RULES FILE: no drawing, no page, no timers. tools/b3-sim.js loads it in node, so it must not touch the canvas,
// the document, the old battle (B2) or the game's party and monster objects. Everything it knows comes from data/b3-*.js.
//
// A fight is one plain object F (b3NewFight). Every rules function takes F, so many fights can run side by side.
//   F.units   every unit; F.party and F.foes are the two sides. A unit's `key` (p0..p3, f0..f4) names it in beats.
//   F.clock   ticks since the fight began; F.round is the 100-tick window the clock is in (1 first).
//   F.over    null, 'win' or 'lose'.
// The rules never show anything. They return BEATS: plain rows saying what happened (hit, prime, detonate, push, pep,
// status, ko...). engine/b3-play.js plays them; the simulator ignores them.

// ---------- Random numbers: seeded, so the same fight can be replayed (simulator against screen) ----------
function b3Rand(F) { if(F.preview) return .999; let t=F.rng=(F.rng+0x6D2B79F5)|0; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }

// ---------- Character Level stats (B3_LEVELS: straight lines between the bestiary's chapter rows) ----------
function b3LevelStats(level) {
  const T=B3_LEVELS,L=Math.max(1,Math.min(50,level));
  let i=0; while(i<T.length-2&&L>T[i+1][0]) i++;
  const a=T[i],b=T[i+1],q=(L-a[0])/(b[0]-a[0]),at=k=>Math.round(a[k]+(b[k]-a[k])*q);
  return {hp:at(1),atk:at(2),def:at(3),spd:at(4)};
}

// ---------- Units ----------
function b3BlankUnit(key,side,slot) {
  return {key,side,slot,st:{},wait:0,pri:0,pushes:0,pulls:0,placed:false,granted:0,pepRound:0,turns:0,ko:false,stripped:{},peeves:[],resists:[],
    shields:[],counters:{},counterInfo:{},crack:0,cracked:{},passives:[],used:{},
    cd:{},            // Skill cooldowns: {skill id: the round it can be used again} (Sofa-Cushion Citadel)
    immune:[],        // status ids this unit cannot be given (Warm Beats Cold)
    shieldMods:[],    // mods every shield this unit puts on carries (Mint-Condition Backup)
    mods:[],          // mods the unit carries for the whole fight (its Main Vibe's Lean, its Trait's and Quirks'), same shape as a status's mods
    custom:{},        // the one-off rules its Quirks switch on, by name, with their numbers (engine/b3-custom.js)
    hitSince:false,   // took or blocked a hit since its last turn ended (Controller Toss)
    // Composure (spec 2.7): pips left and at the start; pipLock = cannot lose pips (from a Break until its next turn ends);
    // broken = Flustered and waiting for its next turn; flusterTurn = that turn is running; flusterMove = fall back when this turn ends.
    pips:0,maxPips:0,pipLock:false,broken:false,flusterTurn:false,flusterMove:false,
    mark:null,    // the key of the family member this foe has Marked for its follow-up act (bestiary 1.1)
    aimLock:null, // {key, act}: the family member this foe must aim `act` at (Cartridge Blow showed it: engine/b3-custom.js)
    intent:null,  // {act, name, kind}: what Cartridge Blow told the player about this foe's next act; void if the foe would now pick another
    lastFlavor:null};   // the flavor of this unit's last move, when it had exactly one (Double Coat)
}
// A family member in a fight. What they bring comes from their loadout (engine/b3-progress.js): cfg.loadouts[id], or a fresh
// one with every Vibe at cfg.rank (1 when left out). The Main Vibe's Lean is applied here: Max HP is raised at once, the rest
// are mods of kind 'lean', so they multiply with every other kind of bonus (spec 2.4).
// cfg.plain (rule tests of stages 1 to 3): the bare unit those tests were written against. First Vibe only, its Skill 1 and
// Skill 2, no Pocket Vibe, no Lean, no Trait, no Quirks.
function b3PartyUnit(F,id,level,slot) {
  const C=B3_CAST[id]; if(!C) throw new Error('Battle 3 has no kit yet for '+id);
  const cfg=F.cfg,S=b3LevelStats(level),u=b3BlankUnit('p'+slot,'party',slot);
  let K;
  if(cfg.plain) { const V=B3_VIBES[C.vibes[0]]; K={main:V.id,pocket:null,basic:V.basic,skills:V.skills.slice(0,2).filter(s=>B3_SKILLS[s]),pocketSkills:[],trait:null,quirks:[],lean:null,row:B3_RULES.rowByLean[V.lean]||'front',counters:[],rank:2}; }
  else K=b3Kit(id,b3FixLoadout(id,(cfg.loadouts&&cfg.loadouts[id])||b3NewLoadout(id,cfg.rank)));
  Object.assign(u,{id,name:C.name,level,row:(cfg.rows&&cfg.rows[id])||K.row,vibe:K.main,pocket:K.pocket,lean:K.lean,rank:K.rank,basic:K.basic,
    skills:K.skills.slice(),pocketSkills:K.pocketSkills.slice(),trait:K.trait,quirks:K.quirks.slice(),pep:B3_RULES.pep.start});
  // Traits and Quirks listen on the hook bus (engine/b3-hooks.js), and so does the rule that builds a Portable Counter.
  // A Trait or Quirk may also carry mods (some with a `when`), a counter of its own, and the name of a one-off rule.
  if(!cfg.plain) { const KP=b3KitPassives(K); u.passives=KP.listeners; u.mods.push(...KP.mods); Object.assign(u.custom,KP.custom); u.immune.push(...KP.immune); u.shieldMods.push(...KP.shieldMods); u.allyMods=KP.allyMods;
    for(const Ct of KP.counters) u.counterInfo[Ct.id]={name:Ct.name,max:Ct.max}; }
  for(const Ct of K.counters) u.counterInfo[Ct.id]={name:Ct.name,max:Ct.max};
  const lean=(K.lean&&B3_RULES.leans[K.lean])||{};
  for(const k in lean) if(k!=='hp') u.mods.push({stat:k,kind:'lean',v:lean[k]});
  for(const k of ['hp','atk','def','spd']) u[k]=Math.round(S[k]*(C.stat[k]||1)*(k==='hp'?1+(lean.hp||0):1));
  u.maxHp=u.hp;
  if(cfg.hpPct!=null) u.hp=Math.max(1,Math.round(u.maxHp*cfg.hpPct));
  if(cfg.hpShare&&cfg.hpShare[id]!=null) u.hp=Math.max(1,Math.round(u.maxHp*Math.min(1,cfg.hpShare[id])));   // story fights: HP carries between fights as a share of each member's own Max HP
  return u;
}
// o.add: a foe called in mid-fight (bestiary 1.1): half its entry's HP unless o.hp prints a number, and 0 pips.
function b3FoeUnit(F,id,row,slot,o) {
  const D=B3_FOES[id]; if(!D) throw new Error('Battle 3 has no enemy row yet for '+id);
  const u=b3BlankUnit('f'+slot,'foe',slot),add=!!(o&&o.add),pips=add?0:D.pips||0;
  Object.assign(u,{id,name:D.name,D,row:row||D.row,atk:D.atk,def:D.def,spd:D.spd,pips,maxPips:pips,peeves:D.peeves,resists:D.resists,add,
    actIx:0,lastUse:{},lastRound:{},everyUsed:{},uses:{},lastAim:{},charge:null,letter:''});
  // A boss prints its HP for the party size its chapter expects, and a second number for the other size (bestiary 1.1 "Party of 3").
  const n=F.party.length,base=add?(o.hp||D.hp*B3_RULES.add.hp):(n===3&&D.hp3)||(n===4&&D.hp4)||D.hp;
  u.hp=u.maxHp=Math.max(1,Math.round(base*F.mods.foeHp));
  return u;
}
// Slot numbers run left to right along one line, Front row first, then Back (spec 2.1 "Adjacent"). A newcomer stands last in its row.
function b3Reslot(F) {
  const rank=f=>f.row==='back'?1:0;
  F.foes.slice().sort((a,b)=>rank(a)-rank(b)||a.slot-b.slot).forEach((f,i)=>{ f.slot=i; });
}
// Two or more of the same monster get a letter each (Mudling A, Mudling B), in the order they joined.
function b3NameFoes(F) {
  const count={},seen={}; for(const f of F.foes) count[f.id]=(count[f.id]||0)+1;
  for(const f of F.foes) if(count[f.id]>1) { f.letter='ABCDEFGH'[seen[f.id]=(seen[f.id]||0)]; seen[f.id]++; f.name=f.D.name+' '+f.letter; }
}
// An add joins the fight. Returns the new unit, or null when its row is full. It waits like anyone arriving (100 x 100 / Speed).
function b3Summon(F,id,row,hp) {
  const D=B3_FOES[id]; if(!D) throw new Error('Battle 3 has no enemy row yet for '+id);
  const r=(row||D.row)==='back'?'back':'front';
  if(b3Live(F,'foe').filter(f=>(f.row==='back'?'back':'front')===r).length>=B3_RULES.add.room[r]) return null;
  const u=b3FoeUnit(F,id,r,999,{add:true,hp});
  u.key='f'+F.foes.length;
  F.foes.push(u); F.units.push(u);
  b3Reslot(F); b3NameFoes(F);
  u.wait=b3WaitFor(F,u,B3_RULES.arrive);
  for(const s of D.start) b3AddStatus(F,u,s,{src:u});
  return u;
}
const b3Alive=u=>!!u&&!u.ko&&u.hp>0;
const b3Live=(F,side)=>(side==='party'?F.party:F.foes).filter(b3Alive);
const b3LiveAll=F=>F.units.filter(b3Alive);
const b3Unit=(F,key)=>F.units.find(u=>u.key===key)||null;
const b3Other=side=>side==='party'?'foe':'party';

// ---------- Start ----------
// cfg: party (ids, 4 at most), level (number) or levels ({id:level}), formation (a B3_FORMATIONS id) or foes ([{id,row}]),
//      seed (number; left out = a random one), mods ({foeHp, taken, foeSpeed}: the difficulty modes' multipliers),
//      loadouts ({id: loadout}: Main and Pocket Vibe, Quirks, VP and row per member, engine/b3-progress.js; a member left out
//      gets a fresh loadout with every Vibe at `rank`, 1 when that is left out too),
//      rows ({id:'front' or 'back'}: overrides where a family member stands; left out = their loadout's row, else by Lean),
//      hpPct (tests: the party starts at this share of its HP), hpShare ({id: share}: story fights, one share per member), plain (tests: see b3PartyUnit).
function b3NewFight(cfg) {
  const seed=cfg.seed==null?Math.floor(Math.random()*2147483647):cfg.seed;
  const F={cfg,seed,rng:seed|0,clock:0,round:1,over:null,acting:null,priSeq:0,stamp:1,turnLog:[],hazards:[],reactions:[],reactSeq:0,later:[],opening:[],
    ruckus:Math.max(0,Math.min(B3_RULES.ruckus.full,cfg.ruckus||0)),   // the Family Ruckus gauge (spec 2.10); cfg.ruckus is what the party walked in with
    grant:null,                                                       // a granted action waiting to be taken (the `grant` op)
    mods:Object.assign({foeHp:1,taken:1,foeSpeed:1},cfg.mods||{})};
  F.party=cfg.party.slice(0,4).map((id,i)=>b3PartyUnit(F,id,(cfg.levels&&cfg.levels[id])||cfg.level||1,i));
  if(F.party.length&&!F.party.some(p=>p.row!=='back')) F.party[0].row='front';   // at least 1 stands in Front (spec 2.1)
  const form=cfg.formation?B3_FORMATIONS[cfg.formation]:null;
  if(cfg.formation&&!form) throw new Error('Battle 3 has no formation called '+cfg.formation);
  const list=(form?form.foes:cfg.foes).map(f=>({id:f.id,row:f.row}));
  // Front row first, then Back: slot numbers run left to right along one line (spec 2.1 "Adjacent").
  const ordered=[...list.filter(f=>(f.row||B3_FOES[f.id].row)!=='back'),...list.filter(f=>(f.row||B3_FOES[f.id].row)==='back')];
  F.foes=ordered.map((f,i)=>b3FoeUnit(F,f.id,f.row,i));
  b3NameFoes(F);
  F.units=[...F.party,...F.foes];
  // A Quirk that gives the whole family a mod (TNB's Coaster Policy) puts it on every family member as the fight begins.
  for(const h of F.party) for(const m of (h.allyMods||[])) for(const o of F.party) o.mods.push(Object.assign({},m));
  for(const u of F.units) u.wait=b3WaitFor(F,u,B3_RULES.startWait[u.side],true);
  for(const f of F.foes) for(const id of f.D.start) b3AddStatus(F,f,id,{src:f});
  b3Fire(F,'battleStart',{g:'pre'},F.opening);
  return F;
}
function b3CheckOver(F) {
  if(F.over) return F.over;
  if(!b3Live(F,'foe').length) F.over='win'; else if(!b3Live(F,'party').length) F.over='lose';
  return F.over;
}
// The beats that close a fight, written once. After a win, knocked-out family members stand back up at 1 HP (spec 2.9).
function b3OverBeats(F,beats,g) {
  if(!F.over||F.overSaid) return;
  F.overSaid=true;
  if(F.over==='win') for(const p of F.party) if(p.ko) { p.ko=false; p.hp=1; p.wait=0; beats.push({t:'standUp',tgt:p.key,hp:1,g}); }
  beats.push({t:'over',result:F.over,g});
}

// ---------- Stat maths: same kind adds, different kinds multiply (spec 2.4) ----------
// Every mod a unit carries for one stat, added up per kind: {kind: sum}.
// A mod may carry two more fields (a status's mods and a Trait's or Quirk's alike):
//   when  conditions that must all hold for it to count (B3_MOD_WHEN). They are judged against `ctx`, which says what the
//         number is being worked out for; with no ctx a mod that has a `when` does not count.
//           ctx for a hit: {F, c (the action), a (attacker), t (target), fl (the flavor part landing)}
//           ctx for the Recovery of the move a unit is using (stat 'moveRec'): {skill}
//         flavor: the hit's flavor is this one.  notBasic: the hit does not come from the attacker's Basic (an answer counts).
//         by:'otherAlly': the attacker is a family member other than the one who put the status on.
//         steppingIn:X: the holder is taking this hit for someone at X of their Max HP or less.
//         allySkill: the move is a Skill aimed at a family member.
//   per   {counter, spend}: `v` is counted once for each point of that counter the holder has built. spend:true empties the
//         counter when the action it counted in ends (engine/b3-resolve.js b3SpendCounters).
//         peeveOrPrime: the target has this hit's flavor as a Pet Peeve, or carries any Prime (Gamer's Intuition).
//         skillPep:X: (ctx.skill) the move is a Skill, not a Basic or a Grand Capstone, and costs X Pep or less (New Game Plus).
//         tgtBelow:X: (ctx.tgt) the move's one target is a family member still up at less than X of their Max HP (First-Ring Pickup).
//         basic: (ctx.skill) the move is a Basic (Carving Momentum).  shielded: the holder has a shield up right now (Coaster Policy).
//         aoe: the act in progress reaches every family member at once (a monster's party-wide act: its tags carry `aoe`), 9c.
//         skillFlavor:X: (ctx.skill) the move has flavor X (Load-Bearing Swing).  supportSkill: (ctx.skill) the move is a Support Skill: not a Basic,
//         deals no damage and builds no counter of its own (b3IsSupport).  oncePerRound:key: counts the first time each round (b3Act marks it).
//         tagsAny:[..]: the act in progress carries one of these tags (Drywall: melee or projectile; Cool-Mist: projectile or aoe), stage 10.
const B3_TARGETS=['foe','ally','family','self','random_foes','all_foes','ko_ally','adjacent_allies','field','ally_pair','family_or_ko','foe_row','either'];
const B3_MOD_WHEN=['flavor','notBasic','by','steppingIn','allySkill','peeveOrPrime','skillPep','tgtBelow','basic','shielded','aoe','skillFlavor','oncePerRound','supportSkill','tagsAny'];
// A foe's Pet Peeves right now: its own, plus any a status forces on it for a while (Masterpiece Portrait Makeover).
function b3Peeves(u) {
  let out=u.peeves;
  for(const id in u.st) { const p=B3_STATUS[id].peeve; if(p) out=out.concat(p.filter(f=>!out.includes(f))); }
  return out;
}
const b3PrimeCount=u=>Object.keys(u.st).filter(id=>B3_STATUS[id].kind==='prime').length;
function b3ModWhen(u,m,ctx,putBy) {
  const W=m.when,c=ctx.c;
  for(const k in W) {
    if(k==='flavor') { if(ctx.fl!==W.flavor) return false; }
    else if(k==='notBasic') { if(!ctx.a||(c&&c.skill&&c.skill.slot==='basic')) return false; }
    else if(k==='by') { if(!(W.by==='otherAlly'&&ctx.a&&ctx.a.side==='party'&&ctx.a.key!==putBy)) return false; }
    else if(k==='steppingIn') { const I=c&&c.inter&&c.inter[u.key],p=I&&b3Unit(c.F,I.forKey); if(!p||!(p.hp<=p.maxHp*W.steppingIn)) return false; }
    else if(k==='allySkill') { const S=ctx.skill; if(!S||S.slot==='basic'||!['ally','family','ko_ally','adjacent_allies','ally_pair','family_or_ko'].includes(S.target)) return false; }
    else if(k==='peeveOrPrime') { const t=ctx.t; if(!t||!(b3Peeves(t).includes(ctx.fl)||b3PrimeCount(t)>0)) return false; }
    else if(k==='skillPep') { const S=ctx.skill; if(!S||S.slot==='basic'||S.slot==='cap'||!(S.pep<=W.skillPep)) return false; }
    else if(k==='basic') { const S=ctx.skill; if(!S||S.slot!=='basic') return false; }
    else if(k==='shielded') { if(!(b3ShieldTotal(u)>0)) return false; }
    else if(k==='aoe') { if(!(c&&c.tags&&c.tags.includes('aoe'))) return false; }
    else if(k==='skillFlavor') { const S=ctx.skill; if(!S||!S.flavor.includes(W.skillFlavor)) return false; }
    else if(k==='supportSkill') { if(!b3IsSupport(ctx.skill)) return false; }
    else if(k==='oncePerRound') { const F=ctx.F; if(!F||u.used['pr:'+W.oncePerRound]===F.round) return false; }
    else if(k==='tagsAny') { if(!(c&&c.tags&&W.tagsAny.some(t=>c.tags.includes(t)))) return false; }
    else if(k==='tgtBelow') { const t=ctx.tgt; if(!t||t.side!==u.side||t.ko||!(t.hp<t.maxHp*W.tgtBelow)) return false; }
    else throw new Error('Battle 3 mod condition not built yet: '+k);
  }
  return true;
}
// A Support Skill: a Skill (not a Basic) that deals no damage and builds no Portable Counter of its own (stage 10: Nap-Window Efficiency,
// Measure Twice Cut Once, Olivia's Cadence reset).
const b3IsSupport=S=>!!S&&S.slot!=='basic'&&!S.power&&!(S.effects||[]).some(e=>e.op==='counter');
// How many hits a move lands: its `hits`, or for a move with `hitsBy` (Olivia's Rope Skills) `base` plus `per` for each point of its Cadence, up to `max`.
const b3HitsOf=(u,S)=>S.hitsBy?Math.min(S.hitsBy.max,S.hitsBy.base+S.hitsBy.per*(u.counters[S.hitsBy.counter]||0)):Math.max(1,S.hits||1);
const b3BuffCount=u=>Object.keys(u.st).filter(id=>B3_STATUS[id].kind==='buff').length;
function b3Mods(u,stat,ctx) {
  const out={};
  const add=(m,stId)=>{ if(m.stat!==stat) return; let v=m.v;
    if(m.when) { if(!ctx||!b3ModWhen(u,m,ctx,stId?u.st[stId].src:null)) return; if(stId) v*=b3RelayMod(ctx.c,u,stId); }
    if(m.per&&m.per.buffs) v*=Math.min(m.per.max==null?99:m.per.max,b3BuffCount(u));   // Trophy-Shelf Ego: once for each different buff
    else if(m.per) { v*=Math.min(m.per.max==null?99:m.per.max,u.counters[m.per.counter]||0); if(m.per.spend&&v&&ctx&&ctx.c) (ctx.c.spend=ctx.c.spend||{})[u.key+':'+m.per.counter]=true; }
    if(stId&&u.st[stId].mult) v*=u.st[stId].mult;   // a doubled buff (Baxter Hill Longboard Express)
    out[m.kind]=(out[m.kind]||0)+v; };
  for(const id in u.st) for(const m of B3_STATUS[id].mods) add(m,id);
  for(const m of u.mods) add(m,null);
  // A shield may carry mods from whoever put it on (Mint-Condition Backup): they count once each while any such shield is up.
  if(u.shields.length) { const seen={}; for(const sh of u.shields) for(const m of (sh.mods||[])) if(m.stat===stat&&!seen[m.kind]) { seen[m.kind]=true; out[m.kind]=(out[m.kind]||0)+m.v; } }
  return out;
}
const b3Sum=(u,stat,ctx)=>{ const M=b3Mods(u,stat,ctx); let s=0; for(const k in M) s+=M[k]; return s; };
const b3Mult=(u,stat,ctx)=>{ const M=b3Mods(u,stat,ctx); let m=1; for(const k in M) m*=Math.max(0,1+M[k]); return m; };
// The Base Recovery of a move for the unit using it: the slot's number, times what its Quirks say about that kind of move
// (stat 'moveRec': Ultra-Rare Limited Edition). Fatigue and the like change every Recovery and are applied in b3WaitFor.
const b3MoveRec=(F,u,S)=>(S.rec!=null?S.rec:B3_RULES.recovery[S.slot])*b3Mult(u,'moveRec',{skill:S,F});   // a Skill may print its own Base Recovery in `rec` (Longboard Push & Carve)
// Attack, Defense or Speed with every mod applied. A crack is a battle-long cut of base Defense, 25% at most in total (spec 2.4).
// Pressed Against Your Shins (Nara, stage 9c, `custom:'shins'`): her Attack also grows by `share` of the Speed bonuses she wears (the
// positive Speed mods of her statuses and Quirks, not her Lean).
const b3SpdBuff=u=>{ const M=b3Mods(u,'spd'); let s=0; for(const k in M) if(M[k]>0) s+=M[k]; return s; };
const b3StatPlain=(u,stat)=>u[stat]*(stat==='def'?1-u.crack:1)*b3Mult(u,stat)*(stat==='atk'&&u.custom&&u.custom.shins?1+u.custom.shins.share*b3SpdBuff(u):1);
// Pace-Partner Run (Amy, stage 10): a status with the `paceRun` flag carries a Speed VALUE (`v`, Amy's Speed when she called them). Their Speed is
// raised to it and never lowered by it.
function b3Stat(u,stat) { const v=b3StatPlain(u,stat); if(stat!=='spd') return v;
  let best=v; for(const id in u.st) if(u.st[id].v!=null&&B3_STATUS[id].flags.includes('paceRun')) best=Math.max(best,u.st[id].v); return best; }
// Damage dealt. `extra` is {kind: amount} from the move itself. Bonuses are capped at +100% in total (spec 2.4); penalties are not.
function b3OutMult(u,extra,ctx) {
  const M=b3Mods(u,'out',ctx); for(const k in (extra||{})) M[k]=(M[k]||0)+extra[k];
  let up=1,down=1; for(const k in M) { if(M[k]>=0) up*=1+M[k]; else down*=Math.max(0,1+M[k]); }
  return Math.min(1+B3_RULES.caps.outBonus,up)*down;
}
// Damage taken: penalties of the "takes +X%" kind add together; reductions add together up to the 60% cap.
// `extra` is a reduction that belongs to this one hit (an intercept's "-35% damage").
const b3TakenMult=(u,extra,ctx)=>(1+Math.max(0,b3Sum(u,'taken',ctx)))*(1-Math.min(B3_RULES.caps.reduction,Math.max(0,b3Sum(u,'reduce',ctx)+(extra||0))));
// Evasion. Nervous Vibrations (Nara, stage 9c, `custom:'nervous'`) adds `per` for every Pep she is holding, up to `max`, and only `wide`
// of that against an attack that reaches the whole family (wide: the hit is part of a party-wide act).
const b3Evasion=(u,wide)=>{ let e=b3Sum(u,'eva'); const n=u.custom&&u.custom.nervous;
  if(n&&u.pep!=null) e+=Math.min(n.max,n.per*u.pep)*(wide?n.wide:1);
  return Math.min(B3_RULES.caps.evasion,Math.max(0,e)); };
const b3MissChance=u=>Math.min(1,Math.max(0,-b3Sum(u,'acc')));
const b3HasFlag=(u,flag)=>Object.keys(u.st).some(id=>B3_STATUS[id].flags.includes(flag));
// Front or Back as the rules see it: a Back-row unit with nobody standing in Front counts as Front (bestiary 1.1).
function b3EffRow(F,u) { return u.row==='back'&&b3Live(F,u.side).some(o=>o.row!=='back')?'back':'front'; }
// Neighbouring slots on the same side.
const b3Adjacent=(F,u)=>b3Live(F,u.side).filter(o=>Math.abs(o.slot-u.slot)===1);

// ---------- Statuses ----------
// A fresh one applied during the carrier's own turn does not count that turn (so "1t" on yourself lasts until your next turn ends).
function b3AddStatus(F,u,id,o) {
  const S=B3_STATUS[id]; if(!S) throw new Error('Battle 3 has no status called '+id);
  const had=u.st[id],src=o&&o.src;
  // A Prime lasts longer when whoever puts it on carries a `primeTurns` mod (Permanent Marker).
  const more=S.kind==='prime'&&src&&!(o&&o.n)?Math.max(0,Math.round(b3Sum(src,'primeTurns'))):0;
  u.st[id]={id,n:((o&&o.n)||S.dur.n)+more,unit:S.dur.unit,src:src?src.key:null,atk:src?b3Stat(src,'atk'):0,at:had?had.at:F.stamp++,skip:F.acting===u,v:o&&o.v!=null?o.v:null};
  delete u.stripped[id];
  return !had;
}
function b3EndStatus(F,u,id,why) {
  if(!u.st[id]) return false; delete u.st[id]; if(why==='strip') u.stripped[id]=true;
  if(id==='toasty'&&u.st.five_alarm) delete u.st.five_alarm;   // Five-Alarm Burn is Toasty turned up: it ends with it (1989 Pickle-Jar Bomb)
  return true;
}
// The 3 icons a unit shows (spec 2.8): its Prime, its strongest debuff, its strongest buff.
function b3Icons(u) {
  const ids=Object.keys(u.st),pick=kinds=>ids.filter(id=>kinds.includes(B3_STATUS[id].kind)).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight||u.st[a].at-u.st[b].at)[0];
  return [pick(['prime']),pick(['debuff','mark']),pick(['buff','stance'])].filter(Boolean);
}

// Everything a unit carries, for the full list the player opens by tapping it: statuses, shields, counters and the hazards
// on its side's floor. Rows: {name, short, color, kind, left (text), desc}.
// `left` is the whole phrase the screen prints ("2 turns left", "until its next turn").
function b3Carried(F,u) {
  const turns=n=>n+(n===1?' turn':' turns')+' left',rows=[];
  // Composure, a wound-up act and a Mark come first: they are what the player plans around.
  if(u.maxPips) rows.push({name:'Composure',short:u.pips+' OF '+u.maxPips,color:'#ffd27a',kind:'pips',left:u.pipLock?'locked':'',
    desc:'Pet Peeve hits and Detonations knock pips off, 3 at most in one action. At 0 it is Flustered: it loses a wound-up attack and any stance, falls back on the turn bar and takes 35% more damage until its next turn.'});
  if(u.charge) { const m=u.mark&&b3Unit(F,u.mark);
    rows.push({name:'Winding up '+u.charge.name,short:'!!',color:'#ff8f80',kind:'charge',left:'next turn',
      desc:'It lands on its next turn'+(m?', aimed at '+m.name:'')+'. A Break cancels it, and so does a Skill that interrupts.'}); }
  for(const f of F.foes) if(f.mark===u.key&&b3Alive(f)) rows.push({name:'Marked',short:'MARKED',color:'#ff8f80',kind:'marked',left:'next turn',
    desc:f.name+(f.charge?' will use '+f.charge.name+' on '+u.name:' is aiming at '+u.name)+' on its next turn. A Mark cannot be cleansed.'});
  // A family member's Vibes come next: the Main Vibe with its Rank and Lean, and the Pocket Vibe.
  if(u.side==='party'&&u.lean&&B3_VIBES[u.vibe]) { const V=B3_VIBES[u.vibe],P=u.pocket&&B3_VIBES[u.pocket],Ln=B3_LEANS[u.lean];
    rows.push({name:V.name,short:'RANK '+u.rank,color:'#c9e6a8',kind:'vibe',left:Ln.name+' Lean',
      desc:'Main Vibe: '+Ln.desc+'.'+(P?' Pocket Vibe: '+P.name+(u.pocketSkills.length?' ('+u.pocketSkills.map(s=>B3_SKILLS[s].name).join(', ')+').':', which adds no Skill yet.'):'')});
    // The Trait and the equipped Quirks whose rules are written, so the player can read what is working for this family member.
    const T=B3_TRAITS[u.trait]; if(T&&!T.soon) rows.push({name:T.name,short:'TRAIT',color:'#c9e6a8',kind:'trait',left:'',desc:T.desc});
    for(const q of u.quirks) { const Q=B3_QUIRKS[q]; if(Q&&!Q.soon) rows.push({name:Q.name,short:'QUIRK',color:'#c9e6a8',kind:'quirk',left:'',desc:Q.desc}); } }
  const ids=Object.keys(u.st).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight||u.st[a].at-u.st[b].at);
  for(const id of ids) { const S=B3_STATUS[id],s=u.st[id];
    rows.push({name:S.name,short:S.short,color:S.color,kind:S.kind,left:s.unit==='round'?s.n+(s.n===1?' round':' rounds')+' left':s.unit==='begin'?'until its next turn':s.unit==='srcBegin'?'until '+((b3Unit(F,s.src)||{}).name||'their')+'\u2019s next turn':turns(s.n),desc:S.desc}); }
  for(const sh of u.shields) rows.push(b3ShieldRow(sh,turns(sh.n)));
  for(const k in u.counters) if(u.counters[k]) { const I=u.counterInfo[k];
    rows.push({name:I?I.name:k,short:String(u.counters[k]),color:'#fff1cb',kind:'counter',left:'',desc:'Built up: '+u.counters[k]+(I&&I.max?' of '+I.max:'')+'.'}); }
  if(u.crack) rows.push({name:'Cracked',short:'CRACKED',color:'#e6b08a',kind:'debuff',left:'this fight',desc:'Defense is cut by '+Math.round(u.crack*100)+'% for the rest of the fight.'});
  for(const hz of F.hazards) if(hz.side===u.side) { const H=B3_HAZARDS[hz.id];
    const unit=H.vessel?(hz.uses===1?' hit':' hits'):(hz.uses===1?' slip':' slips');
    rows.push({name:H.name,short:H.short,color:H.color,kind:'hazard',left:(hz.uses<90?hz.uses+unit+', ':'')+hz.rounds+(hz.rounds===1?' round':' rounds')+' left',desc:H.desc}); }
  return rows;
}

// ---------- Shields, healing, knock-outs (spec 2.4 and 2.9) ----------
// A shield soaks damage before HP. All the shields on one unit hold 40% of its Max HP at most; a shield lasts 3 of its turns.
const b3ShieldTotal=u=>u.shields.reduce((s,x)=>s+x.amt,0);
function b3AddShield(F,u,amt,o) {
  if(!b3Alive(u)) return 0;
  const room=Math.max(0,Math.round(u.maxHp*B3_RULES.caps.shield)-b3ShieldTotal(u)),got=Math.min(room,Math.max(0,Math.round(amt)));
  if(got>0) { const sh={amt:got,n:(o&&o.n)||B3_RULES.shieldTurns,src:o&&o.src?o.src.key:null,skip:F.acting===u,mods:o&&o.src&&o.src.shieldMods&&o.src.shieldMods.length?o.src.shieldMods:null};
    if(o&&o.clay) b3ClayBorn(sh,o.src);   // a clay shield of TNB's (engine/b3-custom.js)
    u.shields.push(sh); }
  return got;
}
function b3Heal(F,u,amt) { if(!b3Alive(u)) return 0; const before=u.hp; u.hp=Math.min(u.maxHp,u.hp+Math.max(0,Math.round(amt))); return u.hp-before; }
// Back on their feet at a share of Max HP. They rejoin the turn bar the way a newcomer arrives (spec 2.1): 100 x 100 / Speed ticks.
function b3Revive(F,u,pct) {
  if(!u.ko) return false;
  u.ko=false; u.hp=Math.max(1,Math.round(u.maxHp*pct)); u.wait=b3WaitFor(F,u,B3_RULES.arrive); u.pri=0;
  return true;
}
// Portable Counters (Oven Temp, Reps, Tally...): a number per unit, 0 up to its max.
function b3Counter(u,id,n,max) { const v=Math.max(0,Math.min(max==null?99:max,(u.counters[id]||0)+n)); u.counters[id]=v; return v; }

// ---------- Pep (spec 2.3): the only way Pep changes ----------
// source 'basic' (the unit's own Basic Action) and 'cost' are free of the refund cap; every other gain counts toward +3 a round.
function b3Pep(F,u,n,source) {
  if(u.pep==null||!n) return 0;
  const P=B3_RULES.pep,before=u.pep;
  if(n>0&&source!=='basic') { n=Math.min(n,Math.max(0,P.refundCap-u.pepRound)); u.pepRound+=n; }
  u.pep=Math.max(P.min,Math.min(P.max,u.pep+n));
  return u.pep-before;
}
// A Skill never costs less than the floor (1). Mods of stat 'cost' (New Game Plus) change the number first; a Basic costs 0.
// O (a choice from b3Options) lets a cost that depends on the target count (First-Ring Pickup). With no O the answer is the
// cheapest the move can be for any choice, so the menu and b3CanUse show the best case.
function b3Cost(F,u,S,O) {
  if(F.grant&&F.grant.key===u.key&&F.grant.free) return 0;
  if(!(S.pep>0)) return 0;
  const at=t=>Math.max(B3_RULES.pep.costFloor,S.pep+b3Sum(u,'cost',{skill:S,tgt:t})),one=o=>o.units.length===1?o.units[0]:null;
  if(O) return at(one(O));
  if(u.mods.some(m=>m.stat==='cost'&&m.when&&m.when.tgtBelow!=null)) { const os=b3Options(F,u,S).filter(o=>!o.no); if(os.length) return Math.min(...os.map(o=>at(one(o)))); }
  return at(null);
}

// ---------- What a unit can do ----------
// The Basic, the Skills, and Pick-Me-Up while a family member is knocked out (spec 2.9).
// While a granted action waits for this unit (F.grant), the list is only what the grant allows.
const b3Skills=(F,u)=>F.grant&&F.grant.key===u.key?b3GrantSkills(F,u,F.grant):[u.basic,...u.skills,...(u.side==='party'&&F.party.some(p=>p.ko)?['pick_me_up']:[])].map(id=>B3_SKILLS[id]);
// The Skills a grant lets this unit take: its own Skills (and Pick-Me-Up) that cost G.maxPep or less and have someone to be
// used on. Never a Grand Capstone; the Basic only when the grant says `basic:true` (Burpee Blitz, stage 10).
function b3GrantSkills(F,u,G) {
  return [...(G.basic?[u.basic]:[]),...u.skills,...(u.side==='party'&&F.party.some(p=>p.ko)?['pick_me_up']:[])].map(id=>B3_SKILLS[id])
    .filter(S=>S.slot!=='cap'&&(G.basic||S.slot!=='basic')&&S.pep<=G.maxPep&&b3Options(F,u,S).some(o=>!o.no));
}
function b3CanUse(F,u,S) {
  if(!S) return {ok:false,why:'That move is not built yet.'};
  // Skill Lock (a Mental status from a monster): the Skills that come from the Pocket Vibe cannot be used. The Basic and the Main Vibe's Skills can.
  if(u.pocketSkills&&u.pocketSkills.includes(S.id)&&b3HasFlag(u,'skillLock')) return {ok:false,why:u.name+' is Skill Locked: the Pocket Vibe Skills cannot be used.'};
  const c=b3Cost(F,u,S);
  if(S.cooldown&&u.cd[S.id]>F.round) return {ok:false,why:S.name+' needs a rest. '+u.name+' can use it again in round '+u.cd[S.id]+'.'};
  if(c>u.pep) return {ok:false,why:'Not enough Pep. '+S.name+' costs '+c+'. '+u.name+' has '+u.pep+'.'};
  if(!b3Options(F,u,S).some(o=>!o.no)) return {ok:false,why:'Nobody to use that on right now.'};
  return {ok:true,why:''};
}
// The choices a move offers: [{key, label, units, no}]. `no` is the reason a choice is greyed out.
function b3Options(F,u,S) {
  const foes=b3Live(F,b3Other(u.side)),mates=b3Live(F,u.side);
  // SEE ME (`foeTaunt`): while it lasts, a single-target attack can only aim at the monster that put it on (if that monster still stands).
  if(S.target==='foe') { const tid=Object.keys(u.st).find(i=>B3_STATUS[i].flags.includes('foeTaunt')),tu=tid&&b3Unit(F,u.st[tid].src),only=tu&&tu.side==='foe'&&foes.includes(tu)?[tu]:foes;
    return only.map(f=>({key:f.key,label:f.name,units:[f]})); }
  if(S.target==='ally') {
    const moves=S.effects.some(e=>e.op==='place'),gr=S.effects.find(e=>e.op==='grant');
    return mates.filter(m=>m!==u).map(m=>({key:m.key,label:m.name,units:[m],ally:true,no:moves&&m.placed?m.name+' was already moved this round.':
      gr&&m.granted>=B3_RULES.grantedPerRound?m.name+' already had a free action this round.':
      gr&&!b3GrantSkills(F,m,gr).length?m.name+' has no Skill that costs '+gr.maxPep+' Pep or less to use right now.':''}));
  }
  if(S.target==='family') return mates.map(m=>({key:m.key,label:m.name,units:[m],ally:true}));   // anyone in the family, the user included
  if(S.target==='self') return [{key:u.key,label:u.name,units:[u],ally:true}];
  // Either a monster or a family member (the user included): Baby-Wipe Swipe. A monster picked gets the Skill's `effects`, a family member its `allyEffects`.
  if(S.target==='either') return [...foes.map(f=>({key:f.key,label:f.name,units:[f]})),...mates.map(m=>({key:m.key,label:m.name,units:[m],ally:true}))];
  // Two family members: the one picked and whoever else in the family has the smallest share of HP left ("Bring a Jacket!" Ward).
  if(S.target==='ally_pair') return mates.map(m=>{ const o=mates.filter(x=>x!==m).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.slot-y.slot)[0],units=o?[m,o]:[m];
    return {key:m.key,label:units.map(x=>x.name).join(' and '),units,ally:true}; });
  // Anyone in the family, knocked out or not (To the Moon & Back revives one and heals the rest).
  if(S.target==='family_or_ko') return (u.side==='party'?F.party:F.foes).map(m=>({key:m.key,label:m.name+(m.ko?' (knocked out)':''),units:[m],ally:true}));
  if(S.target==='ko_ally') return (u.side==='party'?F.party:F.foes).filter(m=>m.ko).map(m=>({key:m.key,label:m.name,units:[m],ally:true}));
  if(S.target==='adjacent_allies') { const adj=b3Adjacent(F,u); return adj.length?[{key:'*',label:adj.map(m=>m.name).join(' and '),units:adj,ally:true}]:[]; }
  if(S.target==='field') return foes.length?[{key:'*',label:'The monsters\u2019 floor',units:foes}]:[];
  // One row of monsters (Vacuum-Cleaner Bolt!): a choice for each row that has someone standing in it. It hits like an AoE (spec 2.4: "all foes or a row").
  if(S.target==='foe_row') { const out=[];
    for(const row of ['front','back']) { const L=foes.filter(f=>b3EffRow(F,f)===row); if(L.length) out.push({key:'row:'+row,label:(row==='front'?'Front row: ':'Back row: ')+L.map(f=>f.name).join(', '),units:L}); }
    return out; }
  if(S.target==='random_foes'||S.target==='all_foes') return foes.length?[{key:'*',label:S.target==='all_foes'?'All monsters':'Random monsters',units:foes}]:[];
  throw new Error('Battle 3 target kind not built yet: '+S.target);
}

// ---------- The simple player ----------
// Picks one move and one target for a party member. No randomness. The simulator plays whole fights with it, and Rose Mode's
// recommended move (stage 7) will ask it too, so there is one piece of code to keep right.
// `only` (optional) narrows the moves it may pick from: only(S) is true for a move it may use.
function b3Auto(F,u,only) {
  let best=null;
  for(const S of b3Skills(F,u)) {
    if((only&&!only(S))||!b3CanUse(F,u,S).ok) continue;
    for(const O of b3Options(F,u,S)) { if(O.no) continue; const sc=b3AutoScore(F,u,S,O); if(!best||sc>best.sc+1e-9) best={skill:S.id,target:O.key,sc}; }
  }
  return best;
}
// Scores are in "damage worth": a move that deals no damage is scored by the damage it should cause or save.
function b3AutoScore(F,u,S,O) {
  const R=B3_RULES,tier=typeof S.power==='number'?S.power:R.power[S.power]||0,cost=b3Cost(F,u,S,O),foes=b3Live(F,b3Other(u.side));
  const std=t=>b3Stat(u,'atk')*100/(100+b3Stat(t,'def')),has=op=>S.effects.find(e=>e.op===op);
  let sc=-1.5*cost+(S.slot==='basic'?3:0);
  // Baby-Wipe Swipe picked on a family member: worth the HP it gives back and the minor debuff it clears, and nothing on someone who needs neither.
  if(S.target==='either'&&O.ally) { const t=O.units[0],got=Math.min(t.maxHp-t.hp,t.maxHp*R.heal.small),
      bad=Object.keys(t.st).filter(id=>B3_STATUS[id].kind==='debuff'&&B3_STATUS[id].weight<=4).length;
    return sc+(t.hp/t.maxHp<.7||bad?got*.5+bad*4+(t.hp/t.maxHp<.35?10:0):-99); }
  // Damage that rides on a move's own effects aimed at every monster, now or later (a wave that follows a heal).
  const wave=(list)=>{ let w=0; for(const e of list||[]) { if(e.op==='damage'&&e.power!=null&&e.to==='foes') w+=foes.reduce((x,t)=>x+std(t)*(typeof e.power==='number'?e.power:R.power[e.power])*(e.aoe?R.aoeShare:1)*(b3Peeves(t).includes(e.flavor[0])?R.peeve:1),0);
    if(e.op==='later') w+=wave(e.effects)*.8; } return w; };
  const wv=wave(S.effects);
  const gr=S.target==='ally'?has('grant'):null;   // a free Skill for someone else; Burpee Blitz's grant is Amy's own (scored below)
  if(gr) {
    // A free Skill for someone else: worth the best thing they could do with it (at no cost to them), plus the Pep it hands out.
    const t=O.units[0]; let best=-99;
    for(const S2 of b3GrantSkills(F,t,gr)) for(const O2 of b3Options(F,t,S2)) if(!O2.no) best=Math.max(best,b3AutoScore(F,t,S2,O2)+(gr.free?1.5*b3Cost(F,t,S2):0));
    sc+=best+3;
  } else if(tier>0) {
    const per=t=>{ let d=std(t)*tier/S.flavor.length,sum=0;
      for(const fl of S.flavor) sum+=d*(b3Peeves(t).includes(fl)?R.peeve:1)*(t.resists.includes(fl)?R.resist:1);
      return sum; };
    if(O.units.length===1) {
      const t=O.units[0],strip=has('strip'),nb=strip&&strip.all?Object.keys(t.st).filter(id=>B3_STATUS[id].kind===strip.kind).length:0;
      const bonus=has('damage')&&has('damage').bonus,d=per(t)*(1+(bonus&&bonus.per==='stripped'?nb*bonus.add:0));
      sc+=d+(d>=t.hp?20:0)+(1-t.hp/t.maxHp)*2+(S.flavor.some(fl=>b3FindDetonation(t,fl,u))?8:0)+nb*6;
      if(has('interrupt')&&t.charge) sc+=25;
      // A shell that answers the monster's next attack with a hit of its own (Winged Shell Lock-On): worth most of that hit while it is not already on.
      const sh=S.effects.find(e=>e.op==='status'&&B3_STATUS[e.id]&&B3_STATUS[e.id].on&&B3_STATUS[e.id].on.actionDeclared);
      if(sh&&!t.st[sh.id]) sc+=std(t)*R.power.standard*.4;
      // Composure: each pip this move should knock off is worth a little, and the pip that Breaks is worth a lot.
      if(t.maxPips&&!t.pipLock&&t.pips>0) { const det=S.flavor.map(fl=>b3FindDetonation(t,fl,u)).find(Boolean);
        const p=Math.min(R.composure.capPerAction,(S.flavor.some(fl=>b3Peeves(t).includes(fl))?R.composure.peeve:0)+(det?det.pips:0)+(S.composure||0));
        sc+=p*3+(p>=t.pips?14:0); }
    } else {
      sc+=O.units.reduce((s,t)=>s+per(t),0)/O.units.length*(S.target==='all_foes'||S.target==='foe_row'?O.units.length*R.aoeShare:1);
      // A move on every monster: buffs it strips, a floor it clears, the pips it should take, and a taunt while the family is hurt.
      for(const e of S.effects) if(e.op==='strip') {
        if(e.kind==='hazard') sc+=F.hazards.filter(h=>h.side===u.side).length*8;
        else for(const t of O.units) { const nb=Object.keys(t.st).filter(id=>B3_STATUS[id].kind===e.kind).length; sc+=(e.all?nb:Math.min(nb,e.n||1))*6; } }
      if(S.target==='all_foes') for(const t of O.units) if(t.maxPips&&!t.pipLock&&t.pips>0) { const det=S.flavor.map(fl=>b3FindDetonation(t,fl,u)).find(Boolean);
        const p=Math.min(R.composure.capPerAction,(S.flavor.some(fl=>b3Peeves(t).includes(fl))?R.composure.peeve:0)+(det?det.pips:0)+(S.composure||0));
        sc+=p*3+(p>=t.pips?14:0); }
      if(has('taunt')&&!b3HasFlag(u,'taunt')) sc+=b3Live(F,u.side).reduce((s,m)=>s+(m===u?0:(1-m.hp/m.maxHp)*14+(foes.some(f=>f.mark===m.key)?10:0)),0);
    }
  } else if(has('place')) sc+=4+O.units[0].wait/6;
  else if(has('revive')&&O.units[0].ko) sc+=60;
  else if(has('heal')) {
    // A heal is worth the HP it really gives back, and more on someone close to falling; clearing debuffs is worth a little.
    const t=O.units[0],h=has('heal'),pct=typeof h.pct==='number'?h.pct:R.heal[h.pct],got=Math.min(t.maxHp-t.hp,t.maxHp*pct);
    const bad=has('cleanse')?Object.keys(t.st).filter(id=>['debuff','prime','mark'].includes(B3_STATUS[id].kind)).length:0;
    sc+=got*.5+(t.hp/t.maxHp<.35?20:0)+bad*4-(got<=0&&!bad&&!wv?99:0);
  }
  else if(has('shield')) {
    // A shield on the family: a modest share of what it would soak, nothing for a family that is already wearing it.
    const sh=has('shield'),st=S.effects.find(e=>e.op==='status'),team=sh.to==='allies'?b3Live(F,u.side):O.units;
    const worth=team.reduce((s,m)=>s+Math.min(m.maxHp*sh.pct,Math.max(0,m.maxHp*R.caps.shield-b3ShieldTotal(m)))*.12,0);
    sc+=st&&team.every(m=>m.st[st.id])?-99:worth;
  }
  else if(has('status')&&O.units.every(t=>t.side===u.side)&&S.target!=='self') {
    // A buff on family members (the Ward): worth a little, more on someone who is hurt, nothing if they already wear it.
    const st=has('status'),fresh=O.units.filter(t=>!t.st[st.id]);
    sc+=fresh.length?10+fresh.reduce((s,t)=>s+(1-t.hp/t.maxHp)*16,0):-99;
  }
  else if(has('hazard')) {
    // Worth laying when nothing is on the floor and a monster has an act it would trip on.
    const H=B3_HAZARDS[has('hazard').id];
    if(H.vessel) { sc+=F.hazards.some(h=>h.id===H.id)?-99:std(foes[0])*R.power.heavy*R.aoeShare*foes.length*.5+10; return sc; }
    const n=foes.filter(f=>f.D&&f.D.acts.some(A=>H.any?b3Listed(A)&&!A.then:A.power>0&&A.tags.some(t=>H.tags.includes(t)))).length;
    sc+=F.hazards.some(h=>h.id===H.id)||!n?-99:std(foes[0])*R.power.light*Math.min(H.uses,H.any?n:n+1)+8;
  } else if(has('intercept')) {
    // Worth it by how hurt the family next to him is.
    // A Marked neighbour is about to take a wound-up hit: stepping in is worth that hit.
    const id=has('intercept').id; sc+=O.units.reduce((s,m)=>s+(m.st[id]?0:(1-m.hp/m.maxHp)*30+(foes.some(f=>f.mark===m.key)?24:0)),0);
  } else {
    // A ward: worth the hits it should answer before it runs out.
    const st=has('status'),L=st&&B3_STATUS[st.id].on&&B3_STATUS[st.id].on.afterHit,dm=L&&L.react&&L.effects.find(e=>e.op==='damage');
    if(dm&&foes.length) sc+=u.st[st.id]?-99:std(foes[0])*(typeof dm.power==='number'?dm.power:R.power[dm.power])*Math.min(2,foes.length)*.6;
  }
  if(tier<=0) sc+=wv;
  // A mini-turn Amy gives herself (Burpee Blitz at 3 or more Reps): worth about a Basic's worth of damage and its Pep.
  const sg=S.effects.find(e=>e.op==='grant'&&e.to==='self'); if(sg&&(!sg.needCounter||(u.counters[sg.needCounter.id]||0)>=sg.needCounter.min)) sc+=5;
  return sc;
}

// ---------- Data check: every row points at things that exist (the simulator runs this first) ----------
function b3CheckData() {
  const bad=[],flav=f=>(f||[]).every(x=>B3_FLAVORS[x]);
  const mods=(where,list)=>{ for(const m of (list||[])) { for(const k in (m.when||{})) if(!B3_MOD_WHEN.includes(k)) bad.push(where+': mod condition "'+k+'" not built yet');
    if(!m.stat||!m.kind||typeof m.v!=='number') bad.push(where+': a mod needs stat, kind and v'); } };
  const effects=(where,list)=>{ for(const e of (list||[])) {
    if(!B3_OP_LIST.includes(e.op)) bad.push(where+': unknown op '+e.op); else if(!B3_OPS[e.op]) bad.push(where+': op not built yet: '+e.op);
    if((e.op==='status'||e.op==='prime'||e.op==='intercept'||e.op==='taunt')&&!B3_STATUS[e.id]) bad.push(where+': unknown status '+e.id);
    if(e.op==='taunt'&&B3_STATUS[e.id]&&!B3_STATUS[e.id].flags.includes('taunt')) bad.push(where+': status '+e.id+' has no taunt flag');
    if(e.op==='grant'&&!(e.maxPep>0)) bad.push(where+': a grant needs maxPep');
    if(e.op==='ruckus'&&typeof e.n!=='number') bad.push(where+': a ruckus effect needs n');
    if(e.op==='intercept'&&B3_STATUS[e.id]&&!B3_STATUS[e.id].intercept) bad.push(where+': status '+e.id+' has no intercept field');
    if(e.op==='hazard'&&!B3_HAZARDS[e.id]) bad.push(where+': unknown hazard '+e.id);
    if(e.op==='splash'&&e.of&&e.of!=='dealt') bad.push(where+': splash "of" must be "dealt" (or left out), not '+e.of);
    if(e.op==='damage'&&e.critPerPrime!=null&&typeof e.critPerPrime!=='number') bad.push(where+': critPerPrime must be a number');
    if(e.op==='later') { if(!Array.isArray(e.effects)||!e.name) bad.push(where+': a later effect needs a name and effects'); else effects(where+' later',e.effects); }
    if(e.op==='summon'&&!B3_FOES[e.id]) bad.push(where+': unknown foe to call '+e.id);
    if(e.op==='damage'&&e.power!=null&&(!flav(e.flavor)||(typeof e.power!=='number'&&B3_RULES.power[e.power]==null))) bad.push(where+': a damage effect with its own power needs a flavor and a known tier'); } };
  for(const id in B3_STATUS) { const S=B3_STATUS[id];
    if(S.id!==id) bad.push('status '+id+': id does not match its key');
    if(!S.desc||!S.short||!S.color) bad.push('status '+id+': needs desc, short and color (the player reads them in the status list)');
    if(!['buff','debuff','prime','stance','mark'].includes(S.kind)) bad.push('status '+id+': unknown kind '+S.kind);
    for(const h in (S.on||{})) { if(!B3_HOOKS.includes(h)) bad.push('status '+id+': unknown hook '+h); effects('status '+id,S.on[h].effects); }
    mods('status '+id,S.mods);
    if(S.tick&&!B3_FLAVORS[S.tick.flavor]) bad.push('status '+id+': unknown tick flavor');
    if(!['turn','round','begin','srcBegin'].includes(S.dur.unit)) bad.push('status '+id+': unknown duration unit '+S.dur.unit);
    if(S.peeve&&!flav(S.peeve)) bad.push('status '+id+': unknown peeve flavor'); }
  for(const id in B3_HAZARDS) { const H=B3_HAZARDS[id];
    if(H.id!==id||!H.desc||!H.short||!(H.uses>0)||!(H.rounds>0)) bad.push('hazard '+id+': needs id, desc, short, uses and rounds');
    if(!H.any&&!(H.tags||[]).length) bad.push('hazard '+id+': needs tags, or any:true'); effects('hazard '+id,H.effects); }
  for(const D of B3_DETONATIONS) { if(!B3_STATUS[D.prime]||B3_STATUS[D.prime].kind!=='prime') bad.push('detonation '+D.id+': '+D.prime+' is not a Prime'); if(!B3_FLAVORS[D.flavor]) bad.push('detonation '+D.id+': unknown flavor'); effects('detonation '+D.id,D.effects); }
  for(const k in B3_FLAVORS) { const p=B3_FLAVORS[k].prime; if(p&&!B3_STATUS[p]) bad.push('flavor '+k+': unknown Prime '+p); }
  for(const id in B3_VIBES) { const V=B3_VIBES[id],w='vibe '+id,slots=['s1','s2','cap'];
    if(V.id!==id) bad.push(w+': id does not match its key');
    if(!B3_CAST[V.owner]) bad.push(w+': unknown owner'); else if(!B3_CAST[V.owner].vibes.includes(id)) bad.push(w+': its owner\'s cast row does not list it');
    if(!B3_SKILLS[V.basic]||B3_SKILLS[V.basic].slot!=='basic') bad.push(w+': its Basic '+V.basic+' has no Basic row');
    if(!B3_RULES.leans[V.lean]||!B3_LEANS[V.lean]) bad.push(w+': unknown Lean');
    if(!Array.isArray(V.subtitles)||V.subtitles.length!==B3_RULES.subtitleRank.length) bad.push(w+': needs '+B3_RULES.subtitleRank.length+' Subtitles');
    if(!Array.isArray(V.skills)||V.skills.length!==3) bad.push(w+': needs Skill 1, Skill 2 and a Grand Capstone');
    else V.skills.forEach((s,i)=>{ const S=B3_SKILLS[s];
      if(!S&&!B3_SOON[s]) bad.push(w+': Skill '+s+' has neither a row nor a name in B3_SOON');
      if(S&&(S.slot!==slots[i]||S.vibe!==id)) bad.push(w+': Skill '+s+' should be slot '+slots[i]+' of this Vibe'); });
    const T=B3_TRAITS[V.trait]; if(!T||T.vibe!==id) bad.push(w+': its Trait '+V.trait+' has no row for this Vibe');
    if(!Array.isArray(V.quirks)||V.quirks.length!==2) bad.push(w+': needs Quirk A and Quirk B');
    else for(const q of V.quirks) if(!B3_QUIRKS[q]||B3_QUIRKS[q].vibe!==id) bad.push(w+': its Quirk '+q+' has no row for this Vibe');
    if(V.counter) { const Ct=V.counter;
      if(!Ct.id||!Ct.name||!(Ct.max>0)||!B3_HOOKS.includes(Ct.on)) bad.push(w+': a Portable Counter needs id, name, max and a known hook in `on`'); } }
  for(const id in B3_SOON) if(B3_SKILLS[id]) bad.push('B3_SOON still names '+id+', which now has its own Skill row');
  for(const [what,T] of [['trait',B3_TRAITS],['quirk',B3_QUIRKS]]) for(const id in T) { const P=T[id],w=what+' '+id;
    if(P.id!==id) bad.push(w+': id does not match its key'); if(!P.name||!P.desc) bad.push(w+': needs name and desc (the Vibes screen shows them)');
    if(!B3_VIBES[P.vibe]) bad.push(w+': unknown vibe');
    if(P.soon) continue;
    // A working row is one listener (`on`), several (`listen`), mods, a one-off rule (`custom`), or any mix of them.
    const Ls=[...(P.on?[P]:[]),...(P.listen||[])];
    for(const L of Ls) { if(!B3_HOOKS.includes(L.on)) bad.push(w+': unknown hook '+L.on); effects(w,L.effects); }
    mods(w,P.mods);
    for(const m of (P.mods||[])) if(m.per&&m.per.counter&&!(P.counter&&P.counter.id===m.per.counter)&&!(B3_VIBES[P.vibe]&&B3_VIBES[P.vibe].counter&&B3_VIBES[P.vibe].counter.id===m.per.counter)) bad.push(w+': a mod counts the counter '+m.per.counter+', which neither this row nor its Vibe builds');
    if(P.counter&&!(P.counter.id&&P.counter.name&&P.counter.max>0)) bad.push(w+': its counter needs id, name and max');
    if(P.viaVibe&&!(B3_VIBES[P.vibe]&&B3_VIBES[P.vibe].counter)) bad.push(w+': says its rule is its Vibe\'s counter, but the Vibe has none');
    if(P.custom&&!B3_CUSTOM[P.custom]) bad.push(w+': one-off rule "'+P.custom+'" is not in engine/b3-custom.js');
    mods(w,P.allyMods);
    if(!Ls.length&&!(P.mods||[]).length&&!P.custom&&!P.immune&&!P.shieldMods&&!P.allyMods&&!P.viaVibe) bad.push(w+': not marked soon, but it has no listener, no mods and no one-off rule'); }
  for(const id in B3_CAST) { const C=B3_CAST[id];
    for(const v of C.vibes) if(!B3_VIBES[v]) bad.push('cast '+id+': unknown vibe '+v);
    for(const n of [1,2]) if(C.vibes.filter(v=>B3_VIBES[v]&&B3_VIBES[v].sig===n).length>1) bad.push('cast '+id+': two Vibes are marked sig '+n);
    if(C.vibes.length&&!C.vibes.some(v=>B3_VIBES[v]&&B3_VIBES[v].sig===1)) bad.push('cast '+id+': no Vibe is marked sig 1 (the Main Vibe on joining)'); }
  for(const id in B3_SKILLS) { const S=B3_SKILLS[id],w='skill '+id;
    if(S.id!==id) bad.push(w+': id does not match its key'); if(!S.common&&!B3_VIBES[S.vibe]) bad.push(w+': unknown vibe');
    if(!B3_TARGETS.includes(S.target)) bad.push(w+': target kind "'+S.target+'" not built yet');
    if(S.counter&&!(B3_VIBES[S.vibe]&&B3_VIBES[S.vibe].counter&&B3_VIBES[S.vibe].counter.id===S.counter)) bad.push(w+': reads the counter '+S.counter+', which its Vibe does not build');
    for(const e of S.effects) { const b=e.bonus; if(b&&b.if&&!B3_CONDS.includes(b.if)) bad.push(w+': condition "'+b.if+'" not built yet'); if(e.when&&!B3_EFFECT_WHEN.includes(e.when)) bad.push(w+': effect condition "'+e.when+'" not built yet'); }
    if(S.target==='either'&&!(S.allyEffects&&S.allyEffects.length)) bad.push(w+': a target kind "either" needs allyEffects (what it does on a family member)');
    if(S.allyEffects) effects(w+' allyEffects',S.allyEffects);
    if(S.hitsBy) { const H=S.hitsBy; if(!H.counter||!(H.base>=1)||!(H.per>=0)||!(H.max>=H.base)||S.counter!==H.counter) bad.push(w+': hitsBy needs counter (the Skill\'s own), base, per and max'); }
    if(!S.desc) bad.push(w+': needs desc');
    if(B3_RULES.recovery[S.slot]==null) bad.push(w+': unknown slot '+S.slot); if(!flav(S.flavor)) bad.push(w+': unknown flavor');
    if(typeof S.power!=='number'&&B3_RULES.power[S.power]==null) bad.push(w+': unknown power '+S.power);
    if(S.rec!=null&&!(S.rec>0)) bad.push(w+': rec must be a Base Recovery number');
    if(S.slot==='basic'&&S.pep!==0) bad.push(w+': a Basic costs 0 Pep'); effects(w,S.effects); }
  for(const id in B3_FOES) { const D=B3_FOES[id],w='foe '+id;
    if(D.id!==id) bad.push(w+': id does not match its key'); if(!flav(D.peeves)||!flav(D.resists)) bad.push(w+': unknown Pet Peeve or Resist flavor');
    for(const s of D.start) if(!B3_STATUS[s]) bad.push(w+': unknown starting status '+s);
    if(D.pips&&!['elite','boss'].includes(D.role)) bad.push(w+': only an Elite or a Boss has Composure pips');
    for(const A of D.acts) { const wa=w+' '+A.id;
      if(!flav(A.flavor)) bad.push(wa+': unknown flavor'); if(!B3_FOE_HITS.includes(A.hits)) bad.push(wa+': hits "'+A.hits+'" not built yet');
      for(const k in (A.when||{})) if(!B3_FOE_WHEN.includes(k)) bad.push(wa+': condition "'+k+'" not built yet');
      for(const k of ['then','after']) if(A[k]&&!D.acts.some(x=>x.id===A[k])) bad.push(wa+': '+k+' names an act this foe does not have: '+A[k]);
      if(A.starts&&!D.acts.some(x=>x.id===A.starts&&x.when&&x.when.everyTurn)) bad.push(wa+': starts names an act this foe does not have with an everyTurn count: '+A.starts);
      if(A.then&&!D.acts.some(x=>x.id===A.then&&x.after===A.id)) bad.push(wa+': its follow-up must say after:\''+A.id+'\'');
      if(A.hits==='marked'&&!D.acts.some(x=>x.then===A.id&&x.effects.some(e=>e.op==='mark'))) bad.push(wa+': hits the Marked ally, but no act Marks for it');
      if(A.hits==='attacker'&&A.recovery!==0) bad.push(wa+': a counter act has Recovery 0');
      effects(wa,A.effects); }
    if(D.onKo) effects(w+' onKo',D.onKo); }
  for(const id in B3_FORMATIONS) for(const f of B3_FORMATIONS[id].foes) if(!B3_FOES[f.id]) bad.push('formation '+id+': unknown foe '+f.id);
  return bad;
}
