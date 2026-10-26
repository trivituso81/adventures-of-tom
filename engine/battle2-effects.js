'use strict';
// engine/battle2-effects.js: the Option 3 effect registry (option3-implementation-brief.md, phase 2).
// Loaded after engine/battle2-traits.js. Numbers: B8_FX and B8_ST_ALIAS in data/abilities.js.
// Option 3 kit moves carry o3:true. Their fx lists use the ops in engine/battle2.js b2Effect plus these:
//   ['warm',p,who]      fill p% of a regular monster's Warmth bar (liked move x1.5, High-Five x1.15, Polish x1.15)
//   ['ctq',q,who]       contract turn shift: remaining ticks x(1+q), at least 1 (+ later, - sooner)
//   ['mile',n]          Upgrade Miles to Tom (max 3 held, at most +1 per action, a Tombo's own Mile included)
//   ['trend',n]         Grace's Trending Meter +n steps;  ['trend','lock',N]: held at x1.5 for N of her turns
//   ['scent',N,who]     Tracked Scent: no dodging, no hiding in the back row, +30% Kinetic and combo damage
//   ['closeup',N,who]   Close-Up: the next damaging action on it is doubled, then it ends (unused: N turns)
//   ['tray',n]          up to n Warm Crusts on the tray become Hot Dishes (heal 30% and cure one debuff)
//   ['cont',pct,who]    at the end of the ally's next turn, if hurt: heal pct of max HP plus caster WARMTH x0.4
//   ['ifup',id,then,else] / ['ift',id,then,else]  run ops if member id is up / is the move's target
// Option 2 effects not in the registry are translated (B8_O2, b8Translate): pause, choreo, fort, grade, pace,
// continuity. kindFoe:K (a number) on an o3 move is the contract's kind branch: aimed at a monster it is one warm(K).
// Tuning caps (B8_FX.cap) apply to o3 moves: revive 50% (act.reviveCap can raise it, the Eight-Seat Dinner Table
// uses .75), party heal 60%, VP +3, Miles +1 per action.

// ---------- New statuses ----------
Object.assign(B2_STATUS,{
  closeup:   {name:'Close-Up',short:'CLOSE-UP',color:'#ffd27a',debuff:true},
  scent:     {name:'Tracked Scent',short:'SCENT',color:'#c9e39a',debuff:true},
  continuity:{name:'Continuity',short:'SNAPSHOT',color:'#c9b3e6',buff:true,perm:true},
  coolup:    {name:'COOL Up',short:'COOL+',color:'#9fd8ff',buff:true,mod:{cool:.25}},
  pepdown:   {name:'PEP Down',short:'PEP-',color:'#9fd0ff',debuff:true,mod:{pep:-.25}},
  warmdown:  {name:'WARMTH Down',short:'WARM-',color:'#f3a08c',debuff:true,mod:{warmth:-.25}},
  // Fearless (Cuddle, nara3): new debuffs bounce off, like Wardrobe Fresh but without its revive.
  fearless:  {name:'Fearless',short:'FEARLESS',color:'#ffe08a',buff:true,immune:true}
});
// A status name from either source doc: [engine id, default strength or undefined].
function b8StId(name) { return B8_ST_ALIAS[name]||[name]; }

// ---------- Option 2 translations ----------
// Each returns the ops that replace it. f is the Option 2 op: [name, N, who].
const B8_O2={
  pause:     f=>[['ctq',.5,f[2]||'t']],
  choreo:    f=>[['vp',1,f[2]||'t'],['ctq',-.2,f[2]||'t']],
  fort:      f=>[['st','guard',f[1]||2,f[2]||'party']],
  grade:     f=>[['st','spotted',f[1]||3,f[2]||'t']],
  pace:      f=>[['ctq',.35,'fasterFoes']],
  continuity:f=>[['cont',B8_FX.contHeal,f[2]||'t']]
};
function b8Translate(list) {
  const out=[];
  for(const f of (list||[])) { const T=B8_O2[f[0]]; if(T) out.push(...b8Translate(T(f))); else out.push(f); }
  return out;
}

// ---------- Who (extends b2Who) ----------
function b8Who(u,M,who) {
  switch(who) {
    case 'all': return b2LiveFoes();
    case 'ally': return b2Who(u,M,'t');
    case 'both': return [M.tom||u,M.pt].filter(p=>p&&b2Alive(p));   // a Tombo's pair (or just the actor)
    case 'fasterFoes': { const me=M.tom&&M.pt?M.pt:u,p=b2Pep(me); return b2LiveFoes().filter(f=>b2Pep(f)>p); }
  }
  // A member id (rose, deedee...): that member if present(X), living and active; never summoned from reserve.
  const m=B2.party.find(p=>p.id===who); if(m) return b2Alive(m)?[m]:[];
  return [];
}

// Revive looks at knocked-out allies too: party (every active ally), tom, both (a Tombo's pair).
function b8ReviveWho(u,M,who) {
  if(who==='party') return B2.party.slice();
  if(who==='tom') return B2.party.filter(p=>p.id==='tom');
  if(who==='both') return [M.tom||u,M.pt].filter(Boolean);
  return b2Who(u,M,who);
}

// ---------- Tuning caps ----------
function b8Cap(M,f) {
  const C=B8_FX.cap,op=f[0];
  if(op==='revive'&&f[1]>(M.act.reviveCap||C.revive)) return [op,M.act.reviveCap||C.revive,...f.slice(2)];
  if(op==='heal'&&f[3]==='party'&&f[1]>C.partyHeal) return [op,C.partyHeal,...f.slice(2)];
  if(op==='vp'&&f[1]>C.vp) return [op,C.vp,...f.slice(2)];
  return f;
}

// ---------- The ops ----------
// Self-state and trait events that still happen when a support move is aimed kindly at a monster.
const B8_SELF_OPS=['crust','mount','burn','mile','trend','tray'];
function b8Op(u,M,f,who) {
  const op=f[0];
  if(B8_O2[op]) { for(const g of b8Translate([f])) b2Effect(u,M,g); return true; }
  switch(op) {
    case 'warm': for(const t of b2Who(u,M,f[2]||'t')) b8Warm(M,t,f[1]); return true;
    case 'ctq': for(const t of who(f[2]||'t')) b8Ct(t,f[1]); return true;
    case 'mile': b8Mile(M,f[1]||1); return true;
    case 'trend': b8Trend(f[1],f[2]); return true;
    case 'scent': for(const t of who(f[2]||'t')) b2AddStatus(t,'scent',f[1]||3,{by:u}); return true;
    case 'closeup': for(const t of who(f[2]||'t')) b2AddStatus(t,'closeup',f[1]||2,{by:u}); return true;
    case 'tray': b8Tray(f[1]||3); return true;
    case 'cont': for(const t of who(f[2]||'t')) b8Snapshot(u,t,f[1]||B8_FX.contHeal); return true;
    // ['ifup',memberId,thenOps,elseOps]: the card's "if present(X): ...; else: ..." (Rose's Lookout Lamby).
    case 'ifup': { const m=B2.party.find(p=>p.id===f[1]),list=(m&&b2Alive(m))?f[2]:f[3]; for(const g of (list||[])) b2Effect(u,M,g); return true; }
    // ['ift',memberId,thenOps,elseOps]: the card's "if target(X): ..." (Nara's Not Leaving: Tom also loses his debuffs).
    case 'ift': { const t=M.primary||M.targets[0],list=(t&&t.id===f[1])?f[2]:f[3]; for(const g of (list||[])) b2Effect(u,M,g); return true; }
  }
  return false;
}
// warm(p,t): a share of the bar, not a WARMTH-scaled amount. Bosses without a Warmth rule (D.warmRule) ignore it.
function b8Warm(M,t,p) {
  if(!t||t.side!=='foe'||!b2Alive(t)) return 0;
  const pt=b2FoePoint(t);
  if(t.boss&&!t.D.warmRule) { battle.texts.push({txt:'UNMOVED',x:pt.x,y:pt.y-16,color:'#cfd8d6',sc:1,t:0,dur:1.1}); return 0; }
  const key=M.act.tombo?'tombo.'+M.act.id:M.u.id+'.'+M.act.key,liked=(t.likes||[]).includes(key);
  const amt=Math.max(1,Math.round(t.warmGoal*p/100*(liked?B8_FX.warmLiked:1)*(M.hf?B8_FX.warmHf:1)*(M.act.polish||1)));
  t.kindLog[key]=(t.kindLog[key]||0)+1;
  t.warm=Math.min(t.warmGoal,t.warm+amt); t.warmFlash=.6;
  const c=b2FoeCanvasPos(t);
  pop('+'+amt,pt.x+7,pt.y-3,'#ff9ac0');
  b2Fx({kind:'heart',x:c.x+18,y:c.y-c.h,small:true,t:0,dur:.9});
  if(liked) { M.kindWeak=true; battle.texts.push({txt:'SOOTHED',x:pt.x,y:pt.y-16,color:'#ff9ac0',sc:1,t:0,dur:1.1}); }
  if(sfx.ding) sfx.ding();
  if(t.warm>=t.warmGoal) b2Calm(t,M);
  return amt;
}
function b8Ct(t,q) {
  t.ct=Math.max(1,Math.floor(t.ct*(1+q)+.5));
  b2PopUnit(t,q>0?'DELAYED':'HURRY UP',q>0?'#9fd0ff':'#9be39a',-8);
}
function b8Mile(M,n) {
  const left=B8_FX.cap.miles-(M.miles||0),k=Math.min(n,left);
  if(k<=0) return;
  M.miles=(M.miles||0)+k; b2AddMile(k);
}
function b8Trend(n,turns) {
  const g=b2Partner('grace'); if(!g||!b2Alive(g)) return;
  const top=B2_TRAIT.trend.length-1;
  if(n==='lock') {
    g.trend=top; g.trendLock={n:turns||2,skip:B2.actor===g};
    b2PopParty(g,'TRENDING LOCKED x'+B2_TRAIT.trend[top],'#ff9ac0',-22);
    return;
  }
  const was=g.trend||0; g.trend=Math.min(top,was+(n||1));
  if(g.trend>was) b2PopParty(g,'TRENDING x'+B2_TRAIT.trend[g.trend],'#ff9ac0',-22);
}
function b8Tray(n) {
  const was=B2.hot||0; B2.hot=Math.min(B2.crust||0,was+n);
  if(B2.hot>was) { const d=b2Partner('deedee')||B2.actor; if(d&&d.side==='party') b2PopParty(d,(B2.hot-was)+' HOT DISH','#ff9a4a',-30); }
}
function b8Snapshot(u,t,pct) {
  if(!t||t.side!=='party'||t.hp<=0) return;
  t.st.continuity={turns:1,pct,w:b2Eff(u,'warmth'),by:u,skip:t===B2.actor};
  b2PopUnit(t,'SNAPSHOT','#c9b3e6',-16);
}

// ---------- Hooks called from engine/battle2.js and engine/battle2-traits.js ----------
// End of a party member's turn: Grace's trend lock counts down; a continuity snapshot heals if they got hurt.
function b8EndTurn(u) {
  if(!u||u.side!=='party') return [];
  const steps=[];
  if(u.trendLock) { if(u.trendLock.skip) u.trendLock.skip=false; else if(--u.trendLock.n<=0) delete u.trendLock; }
  const c=u.st.continuity;
  if(c) {
    if(c.skip) c.skip=false;
    else {
      delete u.st.continuity;
      if(u.hp>0&&u.hp<u.maxHp) steps.push(()=>{
        const h=Math.min(u.maxHp-u.hp,Math.max(1,Math.round(u.maxHp*c.pct+c.w*.4)));
        u.hp+=h; b2PopParty(u,'+'+h,'#9be39a'); sfx.heal(); b2Msg('Continuity! '+u.name+' is back the way the photo shows. +'+h+' HP.'); b2Render();
      },700);
    }
  }
  return steps;
}
// Damage on t: Close-Up doubles it, Tracked Scent adds 30% to Kinetic and combo hits.
function b8DamageMult(act,t) {
  let m=1;
  if(t.st&&t.st.closeup) m*=B8_FX.closeup;
  if(t.st&&t.st.scent&&(act.tombo||[].concat(act.elem||[]).includes('kinetic'))) m*=1+B8_FX.scentDmg;
  return m;
}
// The first hit of an action lands on t: Close-Up is used up.
function b8Landed(t) {
  if(!t.st||!t.st.closeup) return;
  delete t.st.closeup;
  const p=t.side==='foe'?b2FoePoint(t):null;
  if(p) battle.texts.push({txt:'CLOSE-UP!',x:p.x,y:p.y-30,color:'#ffd27a',sc:1,t:0,dur:1.1});
}
// Close-Up never stacks, is refused while See Me is on, and See Me wipes it. Returns false to refuse.
function b8StatusOk(t,id) {
  if(id==='closeup'&&(t.st.seeme||t.st.closeup)) { b2PopUnit(t,t.st.seeme?'SEE ME':'CLOSE-UP','#cfd8d6',-16); return false; }
  if(id==='seeme') delete t.st.closeup;
  return true;
}
// The kind branch of an o3 move (kindFoe: a number): warm(K) on the monsters it was aimed at.
function b8KindFoe(M) {
  const K=M.act.kindFoe;
  for(const t of M.targets) if(t.side==='foe'&&b2Alive(t)) b8Warm(M,t,K);
}
const b8KindNum=act=>!!(act&&act.o3&&typeof act.kindFoe==='number');

// ---------- Liked moves across versions (B8_LIKE_ALIAS) ----------
// A foe's likes plus the Option 3 stand-ins of any liked legacy move.
function b8Likes(list) {
  const out=(list||[]).slice();
  for(const k of (list||[])) for(const a of (B8_LIKE_ALIAS[k]||[])) if(!out.includes(a)) out.push(a);
  return out;
}
// For the Inspect hint: which key of a liked pair to name. The one in that member's kit; the original if neither is.
function b8LikeShown(k) {
  const id=k.split('.')[0],u=B2.party.find(p=>p.id===id),src=Object.keys(B8_LIKE_ALIAS).find(o=>B8_LIKE_ALIAS[o].includes(k));
  const has=key=>{ if(!u||!u.kit) return false; const m=key.split('.')[1]; return [u.kit.basic,u.kit.special,...u.kit.skills].some(s=>s&&s.key===m); };
  const group=src?[src,...B8_LIKE_ALIAS[src]]:(B8_LIKE_ALIAS[k]?[k,...B8_LIKE_ALIAS[k]]:[k]);
  if(group.length===1) return k;
  const inKit=group.find(has);
  return (inKit||group[0])===k?k:null;
}
