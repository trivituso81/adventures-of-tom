'use strict';
// engine/b3-ruckus.js — Battle 3 Family Ruckus (spec 2.10): the gauge's gains and the two spends. RULES FILE: no drawing, no page, no timers.
//
// The gauge is F.ruckus (0 to 100, shared by the party; cfg.ruckus is what the party walks in with, and the screen keeps it between fights).
// Gains (numbers in B3_RULES.ruckus):
//   Mix        +5   two different allies hit the same monster with two different flavors inside one round. Counted once per monster per round.
//   Detonation +8   any Detonation a family member sets off. Gamer's Intuition's +5 is extra on top, as the spec prints it.
//   Extra hits +1   each hit after the first of a multi-hit move that lands (Bouncy Physics' +2 per hit is extra on top).
//   Break      +15  a family member's action Breaks a monster.
// Spends (Dual Ruckus): on an ally's turn, when the next unit on the turn bar is also a family member, the two may spend the gauge in
// place of the first ally's action. It costs no Pep and the partner keeps their own coming turn (their wait is not touched).
//   Double Team          50   both use their Main Vibe's Basic, each at +50% power (B3_RULES.ruckus.doubleTeamPower). No Pep is gained.
//   Full Family Ruckus  100   both fire their highest unlocked Main Vibe Skill free. The action's Composure cap is 4 pips.
// The pair is ONE action: one Composure ledger and one cap, one Detonation per monster at most, the Ruckus gains of every hit, and one
// turn end for the first ally (their recovery is their own move's). The partner's move is a second `act` beat marked `part2`, with its
// hit groups numbered after the first move's (c.gOff in engine/b3-resolve.js b3DamageOp), so the screen plays them one after the other.
// Beats: ruckus {n, v, why, src}  (why: mix, detonation, hits, break, trait or spend)   ruckusSpend {kind, src, partner, name}

// Adds to the gauge and writes the beat. Returns what was really added.
function b3RuckusAdd(F,beats,g,n,src,why) {
  // Stage 19, LivNews Breaking Exclusive (`ruckusBoost`): this action's Ruckus gains are 25% bigger.
  if(n>0&&src) { const su=b3Unit(F,src); if(su&&b3HasFlag(su,'ruckusBoost')) n=Math.round(n*1.25); }
  const was=F.ruckus; F.ruckus=Math.max(0,Math.min(B3_RULES.ruckus.full,was+n));
  const d=F.ruckus-was; if(d) beats.push({t:'ruckus',n:d,v:F.ruckus,why:why||'',src:src||null,g});
  return d;
}
// A landed hit by a family member on a monster: the Mix check (once per monster per round, two allies, two flavors).
// `hot`: this hit struck a Pet Peeve or set off a Detonation. When the Mix is made, the `mix` hook fires with `hot` true if this hit or any earlier
// hit of the round on this monster was hot (Amy's Four-Tab Binder).
function b3RuckusMix(F,c,a,t,fl,hot) {
  if(a.side!=='party'||t.side!=='foe') return;
  const M=F.mix&&F.mix.round===F.round?F.mix:(F.mix={round:F.round,hits:{},done:{}}),L=M.hits[t.key]||(M.hits[t.key]=[]);
  if(!M.done[t.key]&&L.some(h=>h.a!==a.key&&h.fl!==fl)) { M.done[t.key]=true; b3FrameMove(a); for(const h of L) if(h.a!==a.key&&h.fl!==fl) b3FrameMove(b3Unit(F,h.a)); b3RuckusAdd(F,c.beats,c.g,B3_RULES.ruckus.mix,a.key,'mix'); c.beats.push({t:'mix',src:a.key,tgt:t.key,g:c.g});
    b3Fire(F,'mix',{src:a,tgt:t,hot:!!hot||L.some(h=>h.hot),g:c.g,c},c.beats); }
  L.push({a:a.key,fl,hot:!!hot});
}

// ---------- The spends ----------
const B3_RK_SLOT={s1:1,s2:2,cap:3};
const b3RuckusName=kind=>kind==='full'?'Family Ruckus':'Double Team';   // the names the player sees (b3look: Tom's words of 11-22, the menu's)
const b3RuckusCost=kind=>kind==='full'?B3_RULES.ruckus.full:B3_RULES.ruckus.doubleTeam;
// The choices a Ruckus move may take: a move aimed at a monster or a family member (Baby-Wipe Swipe) is only ever used on a monster here.
const b3RkOpts=(F,x,S)=>b3Options(F,x,S).filter(o=>!o.no&&!(S.target==='either'&&o.ally));
// What one member uses: their Main Vibe's Basic, or their highest unlocked Main Vibe Skill (never the Pocket Vibe's, never Pick-Me-Up).
function b3RuckusSkill(F,x,kind) {
  if(kind==='double') return B3_SKILLS[x.basic]||null;
  let best=null;
  for(const id of x.skills) { if(x.pocketSkills.includes(id)) continue; const S=B3_SKILLS[id]; if(S&&S.id!=='pick_me_up'&&B3_RK_SLOT[S.slot]&&(!best||B3_RK_SLOT[S.slot]>=B3_RK_SLOT[best.slot])) best=S; }
  return best;
}
// Can this member spend the gauge now, and on what? {ok, why, kind, cost, partner, parts:[{unit, S, opts}], foeOpts}.
// foeOpts: the monsters the player picks from, when either move is aimed at one (empty: nobody to pick).
function b3RuckusPlan(F,u,kind) {
  const cost=b3RuckusCost(kind),no=why=>({ok:false,why,kind,cost,parts:[],foeOpts:[]});
  if(F.over||!b3Alive(u)||u.side!=='party') return no('Only the family can use the Family Ruckus.');
  if(F.grant) return no('A free Skill is waiting. Take it first.');
  if(F.ruckus<cost) return no('The Combos gauge is at '+F.ruckus+'%. '+b3RuckusName(kind)+' needs '+cost+'%.');
  const partner=b3TurnOrder(F).find(x=>x!==u);
  if(!partner||partner.side!=='party') return no('A monster is up next. '+b3RuckusName(kind)+' needs a family member next on the turn bar.');
  const parts=[];
  for(const x of [u,partner]) {
    const S=b3RuckusSkill(F,x,kind); if(!S) return no(x.name+' has no Skill unlocked for a Family Ruckus yet.');
    const opts=b3RkOpts(F,x,S); if(!opts.length) return no('Nobody to use '+S.name+' on right now.');
    parts.push({unit:x,S,opts});
  }
  const foeOpts=parts.some(p=>p.S.target==='foe'||p.S.target==='either')?b3Live(F,'foe').map(f=>({key:f.key,label:f.name,units:[f]})):[];
  return {ok:true,why:'',kind,cost,partner,parts,foeOpts};
}
// Spends the gauge. optKey: the monster the player picked (used by every move aimed at one monster; any other move picks its own best choice).
function b3Ruckus(F,u,kind,optKey) {
  const P=b3RuckusPlan(F,u,kind); if(!P.ok) return {ok:false,why:P.why};
  if(P.foeOpts.length&&!P.foeOpts.some(o=>o.key===optKey)) return {ok:false,why:'Pick a monster.'};
  const R=B3_RULES.ruckus,beats=[],rec=b3MoveRec(F,u,P.parts[0].S);
  F.grant=null;
  const c={F,actor:u,src:u,skill:P.parts[0].S,rec,targets:[],hit:[],beats,g:'pre',detonated:{},reacted:{},tags:[],ledger:{},
    scale:kind==='double'?1+R.doubleTeamPower:1,pipCap:kind==='full'?B3_RULES.composure.capFullRuckus:undefined,gOff:0};
  F.ruckus-=P.cost;
  beats.push({t:'ruckus',n:-P.cost,v:F.ruckus,why:'spend',src:u.key,g:'pre'});
  beats.push({t:'ruckusSpend',kind,src:u.key,partner:P.partner.key,name:b3RuckusName(kind),g:'pre'});
  const allHit=[],ran=[];
  P.parts.forEach((pt,i)=>{
    const x=pt.unit,S=pt.S;
    if(!b3Alive(x)) return;
    // The first move's choice was made before anything happened. The partner's is made now: the monster may be gone.
    const opts=i===0?pt.opts:b3RkOpts(F,x,S); if(!opts.length) return;
    const O=opts.find(o=>o.key===optKey)||opts.slice().sort((a,b)=>b3AutoScore(F,x,S,b)-b3AutoScore(F,x,S,a))[0];
    Object.assign(c,{actor:x,src:x,skill:S,targets:O.units.slice(),hit:[],landed:0,didDamage:false,tags:S.tags||[],g:'pre'});
    const act={t:'act',src:x.key,id:S.id,name:S.name,flavor:S.flavor,shape:msShapeOf(S.id)||'strike',hits:b3HitsOf(x,S),tgts:O.units.map(t=>t.key),free:true,via:'ruckus',g:'pre'};
    if(ran.length) act.part2=true;
    beats.push(act);
    b3Fire(F,'actionDeclared',{src:x,g:'pre'},beats);
    b3RunEffects(F,c,S.effects);
    c.g='post';
    b3RelayEnd(F,c);
    if(S.composure) for(const t of (c.hit.length?c.hit:c.targets)) b3Pips(c,t,S.composure);
    b3DoubleCoat(F,c);
    b3KoCheck(F,c);
    for(const t of c.hit) if(!allHit.includes(t)) allHit.push(t);
    c.gOff+=b3HitsOf(x,S);
    ran.push(x);
  });
  Object.assign(c,{actor:u,src:u,skill:P.parts[0].S,hit:allHit,g:'post'});
  b3SpendCounters(F,c);
  b3PayLedger(F,c);
  b3RunReactions(F,beats);
  for(const x of ran) { c.actor=x; c.src=x; b3Fire(F,'actionEnd',{src:x,g:'post',c},beats); }
  Object.assign(c,{actor:u,src:u});
  b3PayLedger(F,c);
  b3KoCheck(F,c);
  b3IntentRefresh(F);
  b3EndTurn(F,u,rec,beats);
  return {ok:true,beats,partner:P.partner.key};
}

// ---------- The simple player ----------
// Full Family Ruckus whenever it is there. Double Team when the gauge allows and the member could only Basic this turn (no Skill they
// can pay for), so the gauge is spent where a turn would be spent on a Basic. Returns {kind, target} or null.
function b3AutoRuckus(F,u) {
  for(const kind of ['full','double']) {
    const P=b3RuckusPlan(F,u,kind); if(!P.ok) continue;
    if(kind==='double'&&b3Auto(F,u,S=>S.slot!=='basic')) continue;
    // Aim at the monster the first move aimed at one monster would pick, or the first monster.
    let target=null;
    if(P.foeOpts.length) { const pt=P.parts.find(p=>p.S.target==='foe'||p.S.target==='either'),sc=o=>b3AutoScore(F,pt.unit,pt.S,pt.opts.find(q=>q.key===o.key)||o);
      target=P.foeOpts.slice().sort((a,b)=>sc(b)-sc(a))[0].key; }
    return {kind,target};
  }
  return null;
}
