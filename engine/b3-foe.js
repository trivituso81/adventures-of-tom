'use strict';
// engine/b3-foe.js — Battle 3 enemy turn: picks an act from the foe's fixed list and runs it through the same resolver
// the party uses (architecture section 2.6). RULES FILE: no drawing, no page, no timers.
// Stage 1: printed-order cycle, "every Nth turn" acts, charge_up telegraphs, single-target aim by aggro weight.
// Stage 3 adds Marks, waits in rounds, counters, adds, phases and interrupts.
//
// The order a foe picks in (no randomness except who it aims at):
//   1. a forced act: the charged act it announced last turn
//   2. an "every N turns" act that is due (the count starts again after the act fires)
//   3. the next act in printed order that passes its `when`
function b3ActOk(F,e,A) {
  const W=A.when||{};
  if(W.stripped&&!e.stripped[W.stripped]) return false;
  return true;
}
function b3FoePick(F,e) {
  if(e.charge) return {act:e.charge,fire:true};
  const acts=e.D.acts;
  for(const A of acts) if(A.when&&A.when.everyTurn&&e.turns-(e.lastUse[A.id]||0)>=A.when.everyTurn&&b3ActOk(F,e,A)) return {act:A,fire:false};
  for(let i=0;i<acts.length;i++) {
    const k=(e.actIx+i)%acts.length,A=acts[k];
    if((A.when&&A.when.everyTurn)||!b3ActOk(F,e,A)) continue;
    e.actIx=(k+1)%acts.length; return {act:A,fire:false};
  }
  return null;
}
// Who a single-target attack aims at: by weight. Front 100, Back 60, times any aggro bonus (spec 2.8).
function b3AggroPick(F,e) {
  const L=b3Live(F,b3Other(e.side)); if(!L.length) return null;
  const w=L.map(u=>B3_RULES.aggro[b3EffRow(F,u)]*b3Mult(u,'aggro')),sum=w.reduce((a,b)=>a+b,0);
  let r=b3Rand(F)*sum;
  for(let i=0;i<L.length;i++) { r-=w[i]; if(r<0) return L[i]; }
  return L[L.length-1];
}
// One enemy turn. Returns its beats; the state is final when it returns.
function b3FoeTurn(F,e) {
  const beats=[],P=b3FoePick(F,e);
  if(!P) { b3EndTurn(F,e,B3_RULES.forecast,beats); return beats; }
  const A=P.act;
  // A charged act is announced this turn and fires on the foe's next turn.
  if(A.tags.includes('charge_up')&&!P.fire) {
    e.charge=A;
    beats.push({t:'telegraph',src:e.key,id:A.id,name:A.name,g:'pre'});
    b3Fire(F,'foeTelegraph',{src:e,g:'pre'},beats);
    b3EndTurn(F,e,B3_RULES.telegraph,beats);
    return beats;
  }
  e.charge=null; e.lastUse[A.id]=e.turns;
  const aim=A.hits==='one'?b3AggroPick(F,e):null;
  const targets=A.hits==='self'?[e]:A.hits==='all'?b3Live(F,b3Other(e.side)):(aim?[aim]:[]);
  const S={id:A.id,name:A.name,flavor:A.flavor,power:A.power,hits:1,target:A.hits==='all'?'all_foes':A.hits==='self'?'self':'foe',effects:A.effects};
  const c={F,actor:e,src:e,skill:S,rec:A.recovery,targets,hit:[],beats,g:'pre',detonated:{}};
  beats.push({t:'act',src:e.key,id:A.id,name:A.name,flavor:A.flavor,shape:A.tags.includes('melee')?'strike':A.hits==='self'?'self':'throw',hits:1,tgts:targets.map(t=>t.key),foe:true,g:'pre'});
  b3Fire(F,'actionDeclared',{src:e,g:'pre'},beats);
  if(A.power>0&&targets.length) b3DamageOp(F,c,{});
  b3RunEffects(F,c,A.effects);
  c.g='post';
  b3Fire(F,'actionEnd',{src:e,g:'post'},beats);
  b3KoCheck(F,c);
  b3EndTurn(F,e,A.recovery,beats);
  return beats;
}
