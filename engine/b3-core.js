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
function b3Rand(F) { let t=F.rng=(F.rng+0x6D2B79F5)|0; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }

// ---------- Character Level stats (B3_LEVELS: straight lines between the bestiary's chapter rows) ----------
function b3LevelStats(level) {
  const T=B3_LEVELS,L=Math.max(1,Math.min(50,level));
  let i=0; while(i<T.length-2&&L>T[i+1][0]) i++;
  const a=T[i],b=T[i+1],q=(L-a[0])/(b[0]-a[0]),at=k=>Math.round(a[k]+(b[k]-a[k])*q);
  return {hp:at(1),atk:at(2),def:at(3),spd:at(4)};
}

// ---------- Units ----------
function b3BlankUnit(key,side,slot) {
  return {key,side,slot,st:{},wait:0,pri:0,pushes:0,pulls:0,placed:false,granted:0,pepRound:0,turns:0,ko:false,stripped:{},peeves:[],resists:[]};
}
function b3PartyUnit(F,id,level,slot) {
  const C=B3_CAST[id]; if(!C) throw new Error('Battle 3 has no kit yet for '+id);
  const V=B3_VIBES[C.vibes[0]],S=b3LevelStats(level),u=b3BlankUnit('p'+slot,'party',slot);
  Object.assign(u,{id,name:C.name,level,row:'front',vibe:V.id,basic:V.basic,skills:V.skills.filter(s=>B3_SKILLS[s]),pep:B3_RULES.pep.start});
  for(const k of ['hp','atk','def','spd']) u[k]=Math.round(S[k]*(C.stat[k]||1));
  u.maxHp=u.hp;
  if(F.cfg.hpPct!=null) u.hp=Math.max(1,Math.round(u.maxHp*F.cfg.hpPct));
  return u;
}
function b3FoeUnit(F,id,row,slot) {
  const D=B3_FOES[id]; if(!D) throw new Error('Battle 3 has no enemy row yet for '+id);
  const u=b3BlankUnit('f'+slot,'foe',slot);
  Object.assign(u,{id,name:D.name,D,row:row||D.row,atk:D.atk,def:D.def,spd:D.spd,pips:D.pips,peeves:D.peeves,resists:D.resists,
    actIx:0,lastUse:{},charge:null,letter:''});
  u.hp=u.maxHp=Math.max(1,Math.round(D.hp*F.mods.foeHp));
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
//      hpPct (tests: the party starts at this share of its HP).
function b3NewFight(cfg) {
  const seed=cfg.seed==null?Math.floor(Math.random()*2147483647):cfg.seed;
  const F={cfg,seed,rng:seed|0,clock:0,round:1,over:null,acting:null,priSeq:0,stamp:1,turnLog:[],
    mods:Object.assign({foeHp:1,taken:1,foeSpeed:1},cfg.mods||{})};
  F.party=cfg.party.slice(0,4).map((id,i)=>b3PartyUnit(F,id,(cfg.levels&&cfg.levels[id])||cfg.level||1,i));
  const form=cfg.formation?B3_FORMATIONS[cfg.formation]:null;
  if(cfg.formation&&!form) throw new Error('Battle 3 has no formation called '+cfg.formation);
  const list=(form?form.foes:cfg.foes).map(f=>({id:f.id,row:f.row}));
  // Front row first, then Back: slot numbers run left to right along one line (spec 2.1 "Adjacent").
  const ordered=[...list.filter(f=>(f.row||B3_FOES[f.id].row)!=='back'),...list.filter(f=>(f.row||B3_FOES[f.id].row)==='back')];
  F.foes=ordered.map((f,i)=>b3FoeUnit(F,f.id,f.row,i));
  const count={}; for(const f of F.foes) count[f.id]=(count[f.id]||0)+1;
  const seen={}; for(const f of F.foes) if(count[f.id]>1) { f.letter='ABCDE'[seen[f.id]=(seen[f.id]||0)]; seen[f.id]++; f.name=f.D.name+' '+f.letter; }
  F.units=[...F.party,...F.foes];
  for(const u of F.units) u.wait=b3WaitFor(F,u,B3_RULES.startWait[u.side],true);
  for(const f of F.foes) for(const id of f.D.start) b3AddStatus(F,f,id,{src:f});
  return F;
}
function b3CheckOver(F) {
  if(F.over) return F.over;
  if(!b3Live(F,'foe').length) F.over='win'; else if(!b3Live(F,'party').length) F.over='lose';
  return F.over;
}

// ---------- Stat maths: same kind adds, different kinds multiply (spec 2.4) ----------
// Every mod a unit carries for one stat, added up per kind: {kind: sum}.
function b3Mods(u,stat) {
  const out={};
  for(const id in u.st) for(const m of B3_STATUS[id].mods) if(m.stat===stat) out[m.kind]=(out[m.kind]||0)+m.v;
  return out;
}
const b3Sum=(u,stat)=>{ const M=b3Mods(u,stat); let s=0; for(const k in M) s+=M[k]; return s; };
const b3Mult=(u,stat)=>{ const M=b3Mods(u,stat); let m=1; for(const k in M) m*=Math.max(0,1+M[k]); return m; };
// Attack, Defense or Speed with every mod applied.
const b3Stat=(u,stat)=>u[stat]*b3Mult(u,stat);
// Damage dealt. `extra` is {kind: amount} from the move itself. Bonuses are capped at +100% in total (spec 2.4); penalties are not.
function b3OutMult(u,extra) {
  const M=b3Mods(u,'out'); for(const k in (extra||{})) M[k]=(M[k]||0)+extra[k];
  let up=1,down=1; for(const k in M) { if(M[k]>=0) up*=1+M[k]; else down*=Math.max(0,1+M[k]); }
  return Math.min(1+B3_RULES.caps.outBonus,up)*down;
}
// Damage taken: penalties of the "takes +X%" kind add together; reductions add together up to the 60% cap.
const b3TakenMult=u=>(1+Math.max(0,b3Sum(u,'taken')))*(1-Math.min(B3_RULES.caps.reduction,Math.max(0,b3Sum(u,'reduce'))));
const b3Evasion=u=>Math.min(B3_RULES.caps.evasion,Math.max(0,b3Sum(u,'eva')));
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
  u.st[id]={id,n:(o&&o.n)||S.dur.n,unit:S.dur.unit,src:src?src.key:null,atk:src?b3Stat(src,'atk'):0,at:had?had.at:F.stamp++,skip:F.acting===u};
  delete u.stripped[id];
  return !had;
}
function b3EndStatus(F,u,id,why) { if(!u.st[id]) return false; delete u.st[id]; if(why==='strip') u.stripped[id]=true; return true; }
// The 3 icons a unit shows (spec 2.8): its Prime, its strongest debuff, its strongest buff.
function b3Icons(u) {
  const ids=Object.keys(u.st),pick=kinds=>ids.filter(id=>kinds.includes(B3_STATUS[id].kind)).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight||u.st[a].at-u.st[b].at)[0];
  return [pick(['prime']),pick(['debuff','mark']),pick(['buff','stance'])].filter(Boolean);
}

// ---------- Pep (spec 2.3): the only way Pep changes ----------
// source 'basic' (the unit's own Basic Action) and 'cost' are free of the refund cap; every other gain counts toward +3 a round.
function b3Pep(F,u,n,source) {
  if(u.pep==null||!n) return 0;
  const P=B3_RULES.pep,before=u.pep;
  if(n>0&&source!=='basic') { n=Math.min(n,Math.max(0,P.refundCap-u.pepRound)); u.pepRound+=n; }
  u.pep=Math.max(P.min,Math.min(P.max,u.pep+n));
  return u.pep-before;
}
function b3Cost(F,u,S) { return S.pep>0?Math.max(B3_RULES.pep.costFloor,S.pep):0; }

// ---------- What a unit can do ----------
const b3Skills=u=>[u.basic,...u.skills].map(id=>B3_SKILLS[id]);
function b3CanUse(F,u,S) {
  if(!S) return {ok:false,why:'That move is not built yet.'};
  const c=b3Cost(F,u,S);
  if(c>u.pep) return {ok:false,why:'Not enough Pep. '+S.name+' costs '+c+'. '+u.name+' has '+u.pep+'.'};
  if(!b3Options(F,u,S).some(o=>!o.no)) return {ok:false,why:'Nobody to use that on right now.'};
  return {ok:true,why:''};
}
// The choices a move offers: [{key, label, units, no}]. `no` is the reason a choice is greyed out.
function b3Options(F,u,S) {
  const foes=b3Live(F,b3Other(u.side)),mates=b3Live(F,u.side);
  if(S.target==='foe') return foes.map(f=>({key:f.key,label:f.name,units:[f]}));
  if(S.target==='ally') {
    const moves=S.effects.some(e=>e.op==='place');
    return mates.filter(m=>m!==u).map(m=>({key:m.key,label:m.name,units:[m],ally:true,no:moves&&m.placed?m.name+' was already moved this round.':''}));
  }
  if(S.target==='self') return [{key:u.key,label:u.name,units:[u],ally:true}];
  if(S.target==='random_foes'||S.target==='all_foes') return foes.length?[{key:'*',label:S.target==='all_foes'?'All monsters':'Random monsters',units:foes}]:[];
  throw new Error('Battle 3 target kind not built yet: '+S.target);
}

// ---------- The simple player ----------
// Picks one move and one target for a party member. No randomness. The simulator plays whole fights with it, and Rose Mode's
// recommended move (stage 7) will ask it too, so there is one piece of code to keep right.
function b3Auto(F,u) {
  let best=null;
  for(const S of b3Skills(u)) {
    if(!b3CanUse(F,u,S).ok) continue;
    for(const O of b3Options(F,u,S)) { if(O.no) continue; const sc=b3AutoScore(F,u,S,O); if(!best||sc>best.sc+1e-9) best={skill:S.id,target:O.key,sc}; }
  }
  return best;
}
function b3AutoScore(F,u,S,O) {
  const tier=typeof S.power==='number'?S.power:B3_RULES.power[S.power]||0,cost=b3Cost(F,u,S);
  let sc=-1.5*cost+(S.slot==='basic'?3:0);
  if(tier>0) {
    const per=t=>{ let d=b3Stat(u,'atk')*tier*100/(100+b3Stat(t,'def'))/S.flavor.length,sum=0;
      for(const fl of S.flavor) sum+=d*(t.peeves.includes(fl)?B3_RULES.peeve:1)*(t.resists.includes(fl)?B3_RULES.resist:1);
      return sum; };
    if(O.units.length===1) {
      const t=O.units[0],d=per(t);
      sc+=d+(d>=t.hp?20:0)+(1-t.hp/t.maxHp)*2+(S.flavor.some(fl=>b3FindDetonation(t,fl))?8:0);
    } else sc+=O.units.reduce((s,t)=>s+per(t),0)/O.units.length*(S.target==='all_foes'?O.units.length*B3_RULES.aoeShare:1);
  } else if(S.effects.some(e=>e.op==='place')) sc+=4+O.units[0].wait/6;
  return sc;
}

// ---------- Data check: every row points at things that exist (the simulator runs this first) ----------
function b3CheckData() {
  const bad=[],flav=f=>(f||[]).every(x=>B3_FLAVORS[x]);
  const effects=(where,list)=>{ for(const e of (list||[])) {
    if(!B3_OP_LIST.includes(e.op)) bad.push(where+': unknown op '+e.op); else if(!B3_OPS[e.op]) bad.push(where+': op not built yet: '+e.op);
    if((e.op==='status'||e.op==='prime')&&!B3_STATUS[e.id]) bad.push(where+': unknown status '+e.id); } };
  for(const id in B3_STATUS) { const S=B3_STATUS[id];
    if(S.id!==id) bad.push('status '+id+': id does not match its key');
    for(const h in (S.on||{})) { if(!B3_HOOKS.includes(h)) bad.push('status '+id+': unknown hook '+h); effects('status '+id,S.on[h].effects); }
    if(S.tick&&!B3_FLAVORS[S.tick.flavor]) bad.push('status '+id+': unknown tick flavor'); }
  for(const D of B3_DETONATIONS) { if(!B3_STATUS[D.prime]||B3_STATUS[D.prime].kind!=='prime') bad.push('detonation '+D.id+': '+D.prime+' is not a Prime'); if(!B3_FLAVORS[D.flavor]) bad.push('detonation '+D.id+': unknown flavor'); effects('detonation '+D.id,D.effects); }
  for(const k in B3_FLAVORS) { const p=B3_FLAVORS[k].prime; if(p&&!B3_STATUS[p]) bad.push('flavor '+k+': unknown Prime '+p); }
  for(const id in B3_VIBES) { const V=B3_VIBES[id];
    if(!B3_CAST[V.owner]) bad.push('vibe '+id+': unknown owner'); if(!B3_SKILLS[V.basic]) bad.push('vibe '+id+': its Basic '+V.basic+' has no row'); if(!B3_RULES.leans[V.lean]) bad.push('vibe '+id+': unknown Lean'); }
  for(const id in B3_CAST) for(const v of B3_CAST[id].vibes) if(!B3_VIBES[v]) bad.push('cast '+id+': unknown vibe '+v);
  for(const id in B3_SKILLS) { const S=B3_SKILLS[id],w='skill '+id;
    if(S.id!==id) bad.push(w+': id does not match its key'); if(!B3_VIBES[S.vibe]) bad.push(w+': unknown vibe');
    if(B3_RULES.recovery[S.slot]==null) bad.push(w+': unknown slot '+S.slot); if(!flav(S.flavor)) bad.push(w+': unknown flavor');
    if(typeof S.power!=='number'&&B3_RULES.power[S.power]==null) bad.push(w+': unknown power '+S.power);
    if(S.slot==='basic'&&S.pep!==0) bad.push(w+': a Basic costs 0 Pep'); effects(w,S.effects); }
  for(const id in B3_FOES) { const D=B3_FOES[id],w='foe '+id;
    if(D.id!==id) bad.push(w+': id does not match its key'); if(!flav(D.peeves)||!flav(D.resists)) bad.push(w+': unknown Pet Peeve or Resist flavor');
    for(const s of D.start) if(!B3_STATUS[s]) bad.push(w+': unknown starting status '+s);
    for(const A of D.acts) { if(!flav(A.flavor)) bad.push(w+' '+A.id+': unknown flavor'); if(!['one','all','self'].includes(A.hits)) bad.push(w+' '+A.id+': hits "'+A.hits+'" not built yet'); effects(w+' '+A.id,A.effects); } }
  for(const id in B3_FORMATIONS) for(const f of B3_FORMATIONS[id].foes) if(!B3_FOES[f.id]) bad.push('formation '+id+': unknown foe '+f.id);
  return bad;
}
