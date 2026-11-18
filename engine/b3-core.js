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
  return {key,side,slot,st:{},wait:0,pri:0,pushes:0,pulls:0,placed:false,granted:0,pepRound:0,turns:0,ko:false,stripped:{},peeves:[],resists:[],
    shields:[],counters:{},crack:0,cracked:{},passives:[],used:{}};
}
function b3PartyUnit(F,id,level,slot) {
  const C=B3_CAST[id]; if(!C) throw new Error('Battle 3 has no kit yet for '+id);
  const V=B3_VIBES[C.vibes[0]],S=b3LevelStats(level),u=b3BlankUnit('p'+slot,'party',slot);
  Object.assign(u,{id,name:C.name,level,row:(F.cfg.rows&&F.cfg.rows[id])||B3_RULES.rowByLean[V.lean]||'front',vibe:V.id,basic:V.basic,
    skills:V.skills.filter(s=>B3_SKILLS[s]),pep:B3_RULES.pep.start});
  // Traits and Quirks listen on the hook bus (engine/b3-hooks.js). A row exists once its kit stage has written it (stage 5 on).
  u.passives=[V.trait,...V.quirks].map(k=>B3_TRAITS[k]||B3_QUIRKS[k]).filter(Boolean);
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
//      rows ({id:'front' or 'back'}: where a family member stands; left out = by their Vibe's Lean),
//      hpPct (tests: the party starts at this share of its HP).
function b3NewFight(cfg) {
  const seed=cfg.seed==null?Math.floor(Math.random()*2147483647):cfg.seed;
  const F={cfg,seed,rng:seed|0,clock:0,round:1,over:null,acting:null,priSeq:0,stamp:1,turnLog:[],hazards:[],reactions:[],reactSeq:0,opening:[],
    mods:Object.assign({foeHp:1,taken:1,foeSpeed:1},cfg.mods||{})};
  F.party=cfg.party.slice(0,4).map((id,i)=>b3PartyUnit(F,id,(cfg.levels&&cfg.levels[id])||cfg.level||1,i));
  if(F.party.length&&!F.party.some(p=>p.row!=='back')) F.party[0].row='front';   // at least 1 stands in Front (spec 2.1)
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
function b3Mods(u,stat) {
  const out={};
  for(const id in u.st) for(const m of B3_STATUS[id].mods) if(m.stat===stat) out[m.kind]=(out[m.kind]||0)+m.v;
  return out;
}
const b3Sum=(u,stat)=>{ const M=b3Mods(u,stat); let s=0; for(const k in M) s+=M[k]; return s; };
const b3Mult=(u,stat)=>{ const M=b3Mods(u,stat); let m=1; for(const k in M) m*=Math.max(0,1+M[k]); return m; };
// Attack, Defense or Speed with every mod applied. A crack is a battle-long cut of base Defense, 25% at most in total (spec 2.4).
const b3Stat=(u,stat)=>u[stat]*(stat==='def'?1-u.crack:1)*b3Mult(u,stat);
// Damage dealt. `extra` is {kind: amount} from the move itself. Bonuses are capped at +100% in total (spec 2.4); penalties are not.
function b3OutMult(u,extra) {
  const M=b3Mods(u,'out'); for(const k in (extra||{})) M[k]=(M[k]||0)+extra[k];
  let up=1,down=1; for(const k in M) { if(M[k]>=0) up*=1+M[k]; else down*=Math.max(0,1+M[k]); }
  return Math.min(1+B3_RULES.caps.outBonus,up)*down;
}
// Damage taken: penalties of the "takes +X%" kind add together; reductions add together up to the 60% cap.
// `extra` is a reduction that belongs to this one hit (an intercept's "-35% damage").
const b3TakenMult=(u,extra)=>(1+Math.max(0,b3Sum(u,'taken')))*(1-Math.min(B3_RULES.caps.reduction,Math.max(0,b3Sum(u,'reduce')+(extra||0))));
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
  u.st[id]={id,n:(o&&o.n)||S.dur.n,unit:S.dur.unit,src:src?src.key:null,atk:src?b3Stat(src,'atk'):0,at:had?had.at:F.stamp++,skip:F.acting===u,v:o&&o.v!=null?o.v:null};
  delete u.stripped[id];
  return !had;
}
function b3EndStatus(F,u,id,why) { if(!u.st[id]) return false; delete u.st[id]; if(why==='strip') u.stripped[id]=true; return true; }
// The 3 icons a unit shows (spec 2.8): its Prime, its strongest debuff, its strongest buff.
function b3Icons(u) {
  const ids=Object.keys(u.st),pick=kinds=>ids.filter(id=>kinds.includes(B3_STATUS[id].kind)).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight||u.st[a].at-u.st[b].at)[0];
  return [pick(['prime']),pick(['debuff','mark']),pick(['buff','stance'])].filter(Boolean);
}

// Everything a unit carries, for the full list the player opens by tapping it: statuses, shields, counters and the hazards
// on its side's floor. Rows: {name, short, color, kind, left (text), desc}.
function b3Carried(F,u) {
  const turns=n=>n+(n===1?' turn':' turns'),rows=[];
  const ids=Object.keys(u.st).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight||u.st[a].at-u.st[b].at);
  for(const id of ids) { const S=B3_STATUS[id],s=u.st[id];
    rows.push({name:S.name,short:S.short,color:S.color,kind:S.kind,left:s.unit==='round'?s.n+(s.n===1?' round':' rounds'):turns(s.n),desc:S.desc}); }
  for(const sh of u.shields) rows.push({name:'Shield',short:'SHIELD',color:'#9fd0ff',kind:'buff',left:turns(sh.n),desc:'Soaks the next '+sh.amt+' damage before HP.'});
  for(const k in u.counters) if(u.counters[k]) rows.push({name:k,short:String(u.counters[k]),color:'#fff1cb',kind:'counter',left:'',desc:'Built up: '+u.counters[k]+'.'});
  if(u.crack) rows.push({name:'Cracked',short:'CRACKED',color:'#e6b08a',kind:'debuff',left:'this fight',desc:'Defense is cut by '+Math.round(u.crack*100)+'% for the rest of the fight.'});
  for(const hz of F.hazards) if(hz.side===u.side) { const H=B3_HAZARDS[hz.id];
    rows.push({name:H.name,short:H.short,color:H.color,kind:'hazard',left:hz.uses+(hz.uses===1?' slip':' slips')+', '+hz.rounds+(hz.rounds===1?' round':' rounds'),desc:H.desc}); }
  return rows;
}

// ---------- Shields, healing, knock-outs (spec 2.4 and 2.9) ----------
// A shield soaks damage before HP. All the shields on one unit hold 40% of its Max HP at most; a shield lasts 3 of its turns.
const b3ShieldTotal=u=>u.shields.reduce((s,x)=>s+x.amt,0);
function b3AddShield(F,u,amt,o) {
  if(!b3Alive(u)) return 0;
  const room=Math.max(0,Math.round(u.maxHp*B3_RULES.caps.shield)-b3ShieldTotal(u)),got=Math.min(room,Math.max(0,Math.round(amt)));
  if(got>0) u.shields.push({amt:got,n:(o&&o.n)||B3_RULES.shieldTurns,src:o&&o.src?o.src.key:null,skip:F.acting===u});
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
function b3Cost(F,u,S) { return S.pep>0?Math.max(B3_RULES.pep.costFloor,S.pep):0; }

// ---------- What a unit can do ----------
// The Basic, the Skills, and Pick-Me-Up while a family member is knocked out (spec 2.9).
const b3Skills=(F,u)=>[u.basic,...u.skills,...(u.side==='party'&&F.party.some(p=>p.ko)?['pick_me_up']:[])].map(id=>B3_SKILLS[id]);
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
  if(S.target==='ko_ally') return (u.side==='party'?F.party:F.foes).filter(m=>m.ko).map(m=>({key:m.key,label:m.name,units:[m],ally:true}));
  if(S.target==='adjacent_allies') { const adj=b3Adjacent(F,u); return adj.length?[{key:'*',label:adj.map(m=>m.name).join(' and '),units:adj,ally:true}]:[]; }
  if(S.target==='field') return foes.length?[{key:'*',label:'The monsters\u2019 floor',units:foes}]:[];
  if(S.target==='random_foes'||S.target==='all_foes') return foes.length?[{key:'*',label:S.target==='all_foes'?'All monsters':'Random monsters',units:foes}]:[];
  throw new Error('Battle 3 target kind not built yet: '+S.target);
}

// ---------- The simple player ----------
// Picks one move and one target for a party member. No randomness. The simulator plays whole fights with it, and Rose Mode's
// recommended move (stage 7) will ask it too, so there is one piece of code to keep right.
function b3Auto(F,u) {
  let best=null;
  for(const S of b3Skills(F,u)) {
    if(!b3CanUse(F,u,S).ok) continue;
    for(const O of b3Options(F,u,S)) { if(O.no) continue; const sc=b3AutoScore(F,u,S,O); if(!best||sc>best.sc+1e-9) best={skill:S.id,target:O.key,sc}; }
  }
  return best;
}
// Scores are in "damage worth": a move that deals no damage is scored by the damage it should cause or save.
function b3AutoScore(F,u,S,O) {
  const R=B3_RULES,tier=typeof S.power==='number'?S.power:R.power[S.power]||0,cost=b3Cost(F,u,S),foes=b3Live(F,b3Other(u.side));
  const std=t=>b3Stat(u,'atk')*100/(100+b3Stat(t,'def')),has=op=>S.effects.find(e=>e.op===op);
  let sc=-1.5*cost+(S.slot==='basic'?3:0);
  if(tier>0) {
    const per=t=>{ let d=std(t)*tier/S.flavor.length,sum=0;
      for(const fl of S.flavor) sum+=d*(t.peeves.includes(fl)?R.peeve:1)*(t.resists.includes(fl)?R.resist:1);
      return sum; };
    if(O.units.length===1) {
      const t=O.units[0],strip=has('strip'),nb=strip&&strip.all?Object.keys(t.st).filter(id=>B3_STATUS[id].kind===strip.kind).length:0;
      const bonus=has('damage')&&has('damage').bonus,d=per(t)*(1+(bonus&&bonus.per==='stripped'?nb*bonus.add:0));
      sc+=d+(d>=t.hp?20:0)+(1-t.hp/t.maxHp)*2+(S.flavor.some(fl=>b3FindDetonation(t,fl))?8:0)+nb*6;
      if(has('interrupt')&&t.charge) sc+=25;
    } else sc+=O.units.reduce((s,t)=>s+per(t),0)/O.units.length*(S.target==='all_foes'?O.units.length*R.aoeShare:1);
  } else if(has('place')) sc+=4+O.units[0].wait/6;
  else if(has('revive')) sc+=60;
  else if(has('hazard')) {
    // Worth laying when nothing is on the floor and a monster has an act it would trip on.
    const H=B3_HAZARDS[has('hazard').id],n=foes.filter(f=>f.D&&f.D.acts.some(A=>A.power>0&&A.tags.some(t=>H.tags.includes(t)))).length;
    sc+=F.hazards.some(h=>h.id===H.id)||!n?-99:std(foes[0])*R.power.light*Math.min(H.uses,n+1)+8;
  } else if(has('intercept')) {
    // Worth it by how hurt the family next to him is.
    const id=has('intercept').id; sc+=O.units.reduce((s,m)=>s+(m.st[id]?0:(1-m.hp/m.maxHp)*30),0);
  } else {
    // A ward: worth the hits it should answer before it runs out.
    const st=has('status'),L=st&&B3_STATUS[st.id].on&&B3_STATUS[st.id].on.afterHit,dm=L&&L.react&&L.effects.find(e=>e.op==='damage');
    if(dm&&foes.length) sc+=u.st[st.id]?-99:std(foes[0])*(typeof dm.power==='number'?dm.power:R.power[dm.power])*Math.min(2,foes.length)*.6;
  }
  return sc;
}

// ---------- Data check: every row points at things that exist (the simulator runs this first) ----------
function b3CheckData() {
  const bad=[],flav=f=>(f||[]).every(x=>B3_FLAVORS[x]);
  const effects=(where,list)=>{ for(const e of (list||[])) {
    if(!B3_OP_LIST.includes(e.op)) bad.push(where+': unknown op '+e.op); else if(!B3_OPS[e.op]) bad.push(where+': op not built yet: '+e.op);
    if((e.op==='status'||e.op==='prime'||e.op==='intercept')&&!B3_STATUS[e.id]) bad.push(where+': unknown status '+e.id);
    if(e.op==='intercept'&&B3_STATUS[e.id]&&!B3_STATUS[e.id].intercept) bad.push(where+': status '+e.id+' has no intercept field');
    if(e.op==='hazard'&&!B3_HAZARDS[e.id]) bad.push(where+': unknown hazard '+e.id);
    if(e.op==='damage'&&e.power!=null&&(!flav(e.flavor)||(typeof e.power!=='number'&&B3_RULES.power[e.power]==null))) bad.push(where+': a damage effect with its own power needs a flavor and a known tier'); } };
  for(const id in B3_STATUS) { const S=B3_STATUS[id];
    if(S.id!==id) bad.push('status '+id+': id does not match its key');
    if(!S.desc||!S.short||!S.color) bad.push('status '+id+': needs desc, short and color (the player reads them in the status list)');
    if(!['buff','debuff','prime','stance','mark'].includes(S.kind)) bad.push('status '+id+': unknown kind '+S.kind);
    for(const h in (S.on||{})) { if(!B3_HOOKS.includes(h)) bad.push('status '+id+': unknown hook '+h); effects('status '+id,S.on[h].effects); }
    if(S.tick&&!B3_FLAVORS[S.tick.flavor]) bad.push('status '+id+': unknown tick flavor'); }
  for(const id in B3_HAZARDS) { const H=B3_HAZARDS[id];
    if(H.id!==id||!H.desc||!H.short||!(H.uses>0)||!(H.rounds>0)) bad.push('hazard '+id+': needs id, desc, short, uses and rounds'); effects('hazard '+id,H.effects); }
  for(const D of B3_DETONATIONS) { if(!B3_STATUS[D.prime]||B3_STATUS[D.prime].kind!=='prime') bad.push('detonation '+D.id+': '+D.prime+' is not a Prime'); if(!B3_FLAVORS[D.flavor]) bad.push('detonation '+D.id+': unknown flavor'); effects('detonation '+D.id,D.effects); }
  for(const k in B3_FLAVORS) { const p=B3_FLAVORS[k].prime; if(p&&!B3_STATUS[p]) bad.push('flavor '+k+': unknown Prime '+p); }
  for(const id in B3_VIBES) { const V=B3_VIBES[id];
    if(!B3_CAST[V.owner]) bad.push('vibe '+id+': unknown owner'); if(!B3_SKILLS[V.basic]) bad.push('vibe '+id+': its Basic '+V.basic+' has no row'); if(!B3_RULES.leans[V.lean]) bad.push('vibe '+id+': unknown Lean'); }
  for(const id in B3_CAST) for(const v of B3_CAST[id].vibes) if(!B3_VIBES[v]) bad.push('cast '+id+': unknown vibe '+v);
  for(const id in B3_SKILLS) { const S=B3_SKILLS[id],w='skill '+id;
    if(S.id!==id) bad.push(w+': id does not match its key'); if(!S.common&&!B3_VIBES[S.vibe]) bad.push(w+': unknown vibe');
    if(!['foe','ally','self','random_foes','all_foes','ko_ally','adjacent_allies','field'].includes(S.target)) bad.push(w+': target kind "'+S.target+'" not built yet');
    if(!S.desc) bad.push(w+': needs desc');
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
