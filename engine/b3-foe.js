'use strict';
// engine/b3-foe.js — Battle 3 enemy turn: picks an act from the foe's fixed list and runs it through the same resolver
// the party uses (architecture section 2.6). RULES FILE: no drawing, no page, no timers.
// Built so far: printed-order cycle, "every Nth turn" acts, charge_up telegraphs, single-target aim by aggro weight and taunt,
// intercepts (in the damage op), hazards on the enemy's floor, the party's reactions. Stage 3 adds Marks, waits in rounds,
// counter acts, adds and phases.
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
// A taunt forces the aim onto the taunters; a hidden unit cannot be aimed at.
function b3AggroPick(F,e) {
  let L=b3Live(F,b3Other(e.side)).filter(u=>!b3HasFlag(u,'untargetable'));
  const T=L.filter(u=>b3HasFlag(u,'taunt')); if(T.length) L=T;
  if(!L.length) return null;
  const w=L.map(u=>B3_RULES.aggro[b3EffRow(F,u)]*b3Mult(u,'aggro')),sum=w.reduce((a,b)=>a+b,0);
  let r=b3Rand(F)*sum;
  for(let i=0;i<L.length;i++) { r-=w[i]; if(r<0) return L[i]; }
  return L[L.length-1];
}
// A hazard on this unit's floor catches it as it starts an act with one of the hazard's tags (Wet-Floor Hazard and melee):
// the hazard's effects land on it, and this act's damage takes the hazard's modifier.
function b3HazardTrip(F,e,A,c) {
  for(const hz of F.hazards.slice()) {
    const H=B3_HAZARDS[hz.id];
    if(hz.side!==e.side||!b3Alive(e)||!H.tags.some(t=>A.tags.includes(t))) continue;
    hz.uses--;
    c.beats.push({t:'hazardTrip',id:hz.id,tgt:e.key,left:hz.uses,g:'pre'});
    if(H.out) c.outExtra[hz.id]=H.out;
    const by=b3Unit(F,hz.src)||e;
    b3RunEffects(F,{F,actor:by,src:e,tgt:e,targets:[e],hit:[],beats:c.beats,g:'pre',detonated:{},reacted:{},tags:['hazard']},H.effects);
    if(hz.uses<=0) { F.hazards.splice(F.hazards.indexOf(hz),1); c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,g:'pre'}); }
    b3KoCheck(F,c);
  }
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
  const c={F,actor:e,src:e,skill:null,rec:A.recovery,targets:[],hit:[],beats,g:'pre',detonated:{},reacted:{},tags:A.tags,outExtra:{}};
  if(A.power>0) b3HazardTrip(F,e,A,c);
  if(!b3Alive(e)) { b3EndTurn(F,e,A.recovery,beats); return beats; }   // the fall knocked it out: no act
  const aim=A.hits==='one'?b3AggroPick(F,e):null;
  const targets=A.hits==='self'?[e]:A.hits==='all'?b3Live(F,b3Other(e.side)):(aim?[aim]:[]);
  const S={id:A.id,name:A.name,flavor:A.flavor,power:A.power,hits:1,target:A.hits==='all'?'all_foes':A.hits==='self'?'self':'foe',effects:A.effects};
  c.skill=S; c.targets=targets;
  beats.push({t:'act',src:e.key,id:A.id,name:A.name,flavor:A.flavor,shape:A.tags.includes('melee')?'strike':A.hits==='self'?'self':'throw',hits:1,tgts:targets.map(t=>t.key),foe:true,g:'pre'});
  b3Fire(F,'actionDeclared',{src:e,g:'pre'},beats);
  if(A.power>0&&targets.length) b3DamageOp(F,c,{});
  b3RunEffects(F,c,A.effects);
  c.g='post';
  b3KoCheck(F,c);
  b3RunReactions(F,beats);
  b3Fire(F,'actionEnd',{src:e,g:'post',c},beats);
  b3KoCheck(F,c);
  b3EndTurn(F,e,A.recovery,beats);
  return beats;
}
