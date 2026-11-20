'use strict';
// engine/b3-preview.js — Battle 3 preview and the recommended move (architecture 2.8 "Tap to preview", 2.9 "Recommended move").
// RULES FILE: no drawing, no page, no timers. tools/b3-sim.js loads it.
//
// PREVIEW. The screen shows, before the player commits: the Pep cost, the flavor, PET PEEVE or RESIST on each monster, the
// Detonation the move would set off, the pips it would take, and where everyone lands on the turn bar. The only way to get
// those numbers exactly right is to ask the rules, so a preview plays the move on a COPY of the fight (b3Clone) and reads the
// beats. The real fight is never touched. The copy has `preview:true`: b3Rand then returns .999, so a preview never shows a
// miss or a crit (both are luck) and a "random monster" is the last one standing.
//   b3Clone(F)                       a deep copy. Shares the data rows (`D`) and the cfg, copies everything else.
//   b3Matchups(F,u,S)                cheap, no copy: per living monster, PET PEEVE / RESIST and the Detonation this move's flavors would set off.
//   b3Preview(F,u,id,optKey)         the whole result of using move `id` ('ruckus:double' / 'ruckus:full' for a spend) on `optKey`.
//
// RECOMMENDED MOVE (Rose Mode). b3Recommend(F,u) asks b3Preview about every move and every target the unit can use and keeps the
// best by what the preview says really happens: damage, a Detonation, pips, a Break, a knock-out, healing, shields, a revive, a
// stopped wind-up, a monster pushed back. It does NOT read b3AutoScore (the simple player's guesses): that one scores a single-target
// `later` effect at its face value and steals Rose's Capstone (stage 5c), and a recommendation should not depend on guesses.
// The numbers are `B3_REC` below; tuning is one edit there.

// What a recommendation is worth, per thing the preview says happens. One row; no engine edit to tune.
const B3_REC={dmg:1,kill:15,det:10,pip:7,brk:25,heal:1,healLow:15,lowShare:.35,shield:.6,revive:60,interrupt:25,buff:2,buffCap:6,debuff:2,push:.1,pull:.1,grant:8,
  guard:20,cost:2,basic:3,double:8,full:12};

function b3Clone(F) {
  const seen=new Map();
  const cp=v=>{
    if(v===null||typeof v!=='object') return v;
    if(seen.has(v)) return seen.get(v);
    const o=Array.isArray(v)?[]:{}; seen.set(v,o);
    for(const k of Object.keys(v)) o[k]=(k==='D'||k==='cfg')?v[k]:cp(v[k]);
    return o;
  };
  return cp(F);
}

// Per living monster: does this move meet its Pet Peeve or Resist, and which Detonation would go off?
// (Judged on the monster as it stands. A two-flavor move whose first part sets off a Detonation may change the second part's; the
// full b3Preview shows that.)
function b3Matchups(F,u,S) {
  return b3Live(F,b3Other(u.side)).map(t=>{
    const peeve=S.flavor.some(f=>b3Peeves(t).includes(f)),resist=S.flavor.some(f=>t.resists.includes(f));
    let det=null; for(const f of S.flavor) { det=b3FindDetonation(t,f,u); if(det) break; }
    return {key:t.key,name:t.name,peeve,resist,det:det?{id:det.id,name:det.name,prime:det.prime}:null,pips:t.maxPips?t.pips:0,maxPips:t.maxPips||0};
  });
}

// What using a move would do, read from the beats of a played copy.
function b3Preview(F,u,id,optKey) {
  const C=b3Clone(F); C.preview=true;
  const cu=b3Unit(C,u.key),isR=/^ruckus:/.test(id),S=isR?null:B3_SKILLS[id];
  const r=isR?b3Ruckus(C,cu,id.slice(7),optKey):b3Act(C,cu,id,optKey);
  if(!r.ok) return {ok:false,why:r.why};
  const P={ok:true,id,key:optKey,actor:u.key,name:isR?b3RuckusName(id.slice(7)):S.name,flavor:isR?[]:S.flavor.slice(),
    cost:isR?0:b3Cost(F,u,S,optKey&&optKey!=='*'?b3Options(F,u,S).find(o=>o.key===optKey):null),
    tgts:{},dets:[],pips:[],breaks:[],moves:[],heals:[],shields:[],adds:[],kos:[],revives:[],interrupts:[],grants:0,pep:0,ruckus:0,bar:[],dealt:0};
  const T=k=>P.tgts[k]||(P.tgts[k]={key:k,dmg:0,hits:0,peeve:false,resist:false,ko:false});
  const side=k=>{ const x=b3Unit(C,k); return x?x.side:''; };
  for(const b of r.beats) {
    if(b.t==='hit'&&!b.tick) { const t=T(b.tgt); t.dmg+=b.dmg||0; t.hits++; t.peeve=t.peeve||!!b.peeve; t.resist=t.resist||!!b.resist; if(side(b.tgt)==='foe'&&!b.splash) P.dealt+=b.dmg||0; else if(side(b.tgt)==='foe') P.dealt+=b.dmg||0; }
    else if(b.t==='detonate') P.dets.push({tgt:b.tgt,id:b.id,name:b.name,prime:b.prime});
    else if(b.t==='pips') P.pips.push({tgt:b.tgt,n:b.n,left:b.left,max:b.max});
    else if(b.t==='break') P.breaks.push(b.tgt);
    else if(b.t==='push') P.moves.push({tgt:b.tgt,n:b.n,kind:'push'});
    else if(b.t==='pull') P.moves.push({tgt:b.tgt,n:b.n,kind:'pull'});
    else if(b.t==='heal') P.heals.push({tgt:b.tgt,n:b.n});
    else if(b.t==='shield') P.shields.push({tgt:b.tgt,n:b.n});
    else if(b.t==='status') P.adds.push({tgt:b.tgt,id:b.id});
    else if(b.t==='ko') { P.kos.push(b.tgt); T(b.tgt).ko=true; }
    else if(b.t==='revive') P.revives.push(b.tgt);
    else if(b.t==='interrupt') P.interrupts.push(b.tgt);
    else if(b.t==='grant') P.grants++;
    else if(b.t==='pep'&&b.tgt===u.key) P.pep+=b.n;
    else if(b.t==='ruckus') P.ruckus+=b.n;
    else if(b.t==='endTurn') P.bar=b.bar.slice();
  }
  // HP left on each hit target, from the copy.
  for(const k of Object.keys(P.tgts)) { const x=b3Unit(C,k); if(x) { P.tgts[k].hpAfter=Math.max(0,x.hp); P.tgts[k].maxHp=x.maxHp; } }
  P.over=C.over||null;
  return P;
}

// ---------- The recommended move ----------
// What a preview is worth to the family (see B3_REC). `F` is the real fight (for who is hurt and who is winding up).
function b3PreviewValue(F,u,P) {
  const R=B3_REC; let v=0,why='';
  const foe=k=>{ const x=b3Unit(F,k); return x&&x.side==='foe'; };
  let dealt=0; for(const k of Object.keys(P.tgts)) { const t=b3Unit(F,k); if(t&&t.side==='foe') dealt+=Math.min(P.tgts[k].dmg,t.hp); }
  v+=dealt*R.dmg; const kills=P.kos.filter(foe).length; v+=kills*R.kill;
  v+=P.dets.filter(d=>foe(d.tgt)).length*R.det;
  v+=P.pips.filter(p=>foe(p.tgt)).reduce((s,p)=>s+Math.max(0,p.n),0)*R.pip;
  v+=P.breaks.filter(foe).length*R.brk;
  let heal=0; for(const h of P.heals) { const t=b3Unit(F,h.tgt); if(!t||t.side!==u.side) continue; heal+=h.n; if(t.hp/t.maxHp<R.lowShare) v+=R.healLow; }
  v+=heal*R.heal;
  v+=P.shields.filter(s=>!foe(s.tgt)).reduce((s,x)=>s+x.n,0)*R.shield;
  v+=P.revives.length*R.revive;
  v+=P.interrupts.length*R.interrupt;
  v+=P.grants*R.grant;
  const winding=b3Live(F,'foe').some(f=>f.charge);
  let buffs=0,guard=0,deb=0;
  for(const a of P.adds) { const S=B3_STATUS[a.id]; if(!S) continue; const mine=!foe(a.tgt);
    if(mine&&(S.kind==='buff'||S.kind==='stance')) { if(S.intercept||(S.flags||[]).includes('taunt')) guard++; else buffs++; }
    else if(!mine&&S.kind==='debuff') deb++; }
  v+=Math.min(R.buffCap,buffs*R.buff)+(winding?guard*R.guard:guard*R.buff)+deb*R.debuff;
  for(const m of P.moves) { if(foe(m.tgt)&&m.kind==='push') v+=m.n*R.push; else if(!foe(m.tgt)&&m.kind==='pull') v+=m.n*R.pull; }
  // The sentence a helper could say: the first thing that made the move worth it. A plain strong hit has no sentence of its own here:
  // b3Recommend says "Free, and it builds Pep." for a Basic and "A strong hit right now." for a Skill.
  if(P.revives.length) why='Get '+b3Unit(F,P.revives[0]).name+' back on their feet.';
  else if(P.interrupts.length) why='Stop the big attack before it lands.';
  else if(P.heals.some(h=>{ const t=b3Unit(F,h.tgt); return t&&t.side===u.side&&t.hp/t.maxHp<R.lowShare; })) why=b3Unit(F,P.heals.find(h=>{ const t=b3Unit(F,h.tgt); return t&&t.side===u.side&&t.hp/t.maxHp<R.lowShare; }).tgt).name+' is hurting. Heal up.';
  else if(P.breaks.length) why='This breaks '+b3Unit(F,P.breaks[0]).name+'!';
  else if(kills) why='This finishes one off.';
  else if(P.dets.length) why='This sets off '+P.dets[0].name;
  else if(guard&&winding) why='Step in before the big attack.';
  return {v,why,dealt,helps:!!(P.shields.length||buffs)};
}
// The best move for this member: {skill, target, sc, why, kind:'basic'|'skill'|'ruckus'} or null if nothing can be used.
// Moves are tried in the SKILLS list's order and the first of equal scores wins, so the answer never flickers.
function b3Recommend(F,u) {
  if(!u||u.side!=='party'||F.over) return null;
  const R=B3_REC; let best=null;
  const consider=(id,key,cost,bonus,kind)=>{
    const P=b3Preview(F,u,id,key); if(!P.ok) return;
    const val=b3PreviewValue(F,u,P),sc=val.v-R.cost*cost+bonus;
    const why=val.why||(kind==='basic'?'Free, and it builds Pep.':val.dealt>0?'A strong hit right now.':val.helps?'This helps the family.':'');
    if(!best||sc>best.sc+1e-9) best={skill:id,target:key,sc,why,kind};
  };
  for(const S of b3Skills(F,u)) {
    if(!b3CanUse(F,u,S).ok) continue;
    for(const O of b3Options(F,u,S)) { if(O.no) continue; consider(S.id,O.key,b3Cost(F,u,S,O),S.slot==='basic'?R.basic:0,S.slot==='basic'?'basic':'skill'); }
  }
  if(!F.grant) for(const kind of ['full','double']) {
    const P=b3RuckusPlan(F,u,kind); if(!P.ok) continue;
    const keys=P.foeOpts.length?P.foeOpts.map(o=>o.key):[null];
    for(const k of keys) consider('ruckus:'+kind,k,0,-(kind==='full'?R.full:R.double),'ruckus');
  }
  if(best&&best.kind==='ruckus'&&!best.why) best.why='The Family Ruckus is ready!';
  return best;
}
