'use strict';
// engine/b3-last.js — Battle 3, stage 22 chapter 20: the rules only the last fight uses. Rules only: no drawing, no timers (the screen side is engine/b3-repick.js).
// Bestiary entry 85 (The Collector) and spec v11 section 2.1. Four things live here, each small:
//   PHASE LINES      A foe row with `phases:{lines:[.66,.31]}` has three phases. Damage past a line is lost: its HP stops on the line (b3Hurt reads b3PhaseFloor) and
//                    `phaseDue` is set. When the action that did it ends (b3EndTurn calls b3PhaseCheck) the next phase starts at once: a wound-up act is lost, the foe goes
//                    to the front of the turn bar so its phase act (`when:{phase:2,once:true}`) is the next thing that happens, and, in a fight with a bench, the player picks the four again.
//   STILL FRAME      The `stillFrame` op snapshots every family member. Before or on their next turn each must have been moved (a pull, a push, a row trade, a granted action) or
//                    have taken part in a Mix or a Detonation; waiting for the turn to come up does not count. One who did none of it loses 2 Pep and is Slowed (1t).
//   THE COUNTDOWN    `refillPips` puts all of a foe's pips back (the Countdown act). The wind-up that follows is an ordinary `then` act whose `noInterrupt` flag makes the
//                    `interrupt` op skip it, so only a Break (b3Break) stops the count.
//   PICKING THE FOUR AGAIN (spec 2.1, the one exception to "swaps happen outside battle")
//                    `b3Repick(F,ids)` swaps the party at a phase change. A newcomer arrives at full HP with the starting Pep; one who was in the fight earlier comes back with the HP and
//                    Pep they left with. Either way they join the turn bar waiting Recovery 100 x 100 / Speed ticks (B3_RULES.arrive). The leaver's seat (key, slot, row) is the newcomer's.
// Everything is data on the foe row and the fight config (`reserve`: the ids of the family members on the bench). A fight with no `reserve` never asks.

// ---------- Phase lines ----------
function b3PhaseFloor(t) {
  const P=t&&t.D&&t.D.phases; if(!P||!(t.phase<=P.lines.length)) return null;
  return Math.ceil(t.maxHp*P.lines[t.phase-1]);
}
// Called at the end of every turn (b3EndTurn): a foe whose HP reached its line starts its next phase now.
function b3PhaseCheck(F,u,beats) {
  for(const f of F.foes) {
    if(!f.phaseDue||!(f.hp>0)||f.ko) continue;
    f.phaseDue=false; f.phase++;
    for(const p of F.party) p.frame=null;   // a Still Frame of the last phase is over
    if(f.charge) { const A=b3LoseCharge(F,f); beats.push({t:'interrupt',src:null,tgt:f.key,id:A.id,name:A.name,why:'phase',g:'end'}); }
    if(f!==u) { f.wait=0; f.pri=++F.priSeq; }   // the new phase starts at once: it is the next to act
    beats.push({t:'phase',tgt:f.key,phase:f.phase,hp:f.hp,max:f.maxHp,g:'end'});
    if(F.cfg.reserve&&F.cfg.reserve.length&&!F.repick) F.repick={phase:f.phase,by:f.key};
  }
}

// ---------- Still Frame ----------
const b3FrameMove=u=>{ if(u&&u.side==='party'&&u.frame) u.frame.moved=true; };
// The end of a family member's turn: a Still Frame they did not answer costs 2 Pep and a 1-turn Slow.
function b3FrameCheck(F,u,beats) {
  if(!u.frame) return;
  const R=u.frame; u.frame=null;
  if(R.moved||!b3Alive(u)) return;
  const src=b3Unit(F,R.by),lost=Math.min(u.pep,R.pep); u.pep-=lost;
  b3AddStatus(F,u,'slow',{src,n:R.slow});
  beats.push({t:'frameMiss',tgt:u.key,pep:u.pep,lost,g:'end'});
}
B3_OPS.stillFrame=function(F,c,e) {
  const keys=[];
  for(const t of F.party) { if(!b3Alive(t)) continue; t.frame={moved:false,by:c.actor.key,pep:e.pep!=null?e.pep:2,slow:e.slow!=null?e.slow:1}; keys.push(t.key); }
  c.beats.push({t:'frame',src:c.actor.key,tgts:keys,g:c.g});
};
B3_OPS.refillPips=function(F,c,e) {
  for(const t of b3Who(F,c,e.to||'self')) { if(!b3Alive(t)||!t.maxPips) continue;
    t.pips=t.maxPips; t.pipLock=false;
    c.beats.push({t:'pips',tgt:t.key,n:0,left:t.pips,max:t.maxPips,refill:true,g:c.g}); }
};
B3_OP_LIST.push('stillFrame','refillPips');

// ---------- Picking the four again ----------
// Everyone who can come in: the four fighting and the bench.
const b3RepickPool=F=>F.cfg.party.concat(F.cfg.reserve||[]).filter((id,i,a)=>a.indexOf(id)===i);
function b3RepickSeats(F) { return F.party.length; }
// What the picker shows for each of the eight: who they are, whether they are in now, the HP and Pep they would come back with.
function b3RepickList(F) {
  return b3RepickPool(F).map(id=>{
    const u=F.party.find(p=>p.id===id)||(F.bench&&F.bench[id])||null,here=!!F.party.find(p=>p.id===id);
    return {id,name:(B3_CAST[id]||{}).name||id,here,fresh:!u,hp:u?u.hp:null,maxHp:u?u.maxHp:null,pep:u?u.pep:B3_RULES.pep.start,ko:!!(u&&u.ko)};
  });
}
function b3Repick(F,ids) {
  const pool=b3RepickPool(F),seats=b3RepickSeats(F);
  ids=(ids||[]).filter((id,i,a)=>a.indexOf(id)===i&&pool.includes(id));
  if(!F.repick) return {ok:false,why:'nothing to pick'};
  if(ids.length!==seats) return {ok:false,why:'pick '+seats};
  const cur=F.party.map(p=>p.id),out=F.party.filter(p=>!ids.includes(p.id)),inn=ids.filter(id=>!cur.includes(id)),beats=[];
  F.bench=F.bench||{};
  F.everIn=F.everIn||F.cfg.party.slice();   // everyone who has fought, so the story pays XP and writes HP back for all of them
  for(const p of out) F.bench[p.id]=p;
  const inKeys=[],outKeys=out.map(p=>p.key);
  const joined=[];
  for(const id of inn) {
    const leaver=out.shift(),slot=leaver.slot,row=leaver.row,key=leaver.key,i=F.party.indexOf(leaver);
    let u=F.bench[id]; delete F.bench[id];
    if(u) { u.st={}; u.shields=[]; u.charge=null; u.frame=null; u.broken=false; u.flusterMove=false; u.pushes=0; u.pulls=0; u.placed=false; u.granted=0; u.jumped=0; }
    else { u=b3PartyUnit(F,id,(F.cfg.levels&&F.cfg.levels[id])||F.cfg.level||1,slot); u.hp=u.maxHp; u.pep=B3_RULES.pep.start; joined.push(u); }   // a newcomer is fresh (a story fight's HP carry is for those who walked in)
    if(!F.everIn.includes(id)) F.everIn.push(id);
    u.key=key; u.slot=slot; u.row=row; u.side='party';
    u.wait=b3WaitFor(F,u,B3_RULES.arrive); u.pri=0;
    F.party[i]=u; F.units[F.units.indexOf(leaver)]=u; inKeys.push(key);
  }
  if(F.party.length&&!F.party.some(p=>p.row!=='back')) F.party[0].row='front';   // at least 1 stands in Front (spec 2.1)
  b3AllyModsRefresh(F);
  // The family's own Traits and Quirks start for a newcomer the way they do for everyone at the start of a fight.
  if(joined.length) { const keep=F.units; F.units=joined; b3Fire(F,'battleStart',{g:'pre'},beats); F.units=keep; }
  for(const f of F.foes) { f.mark=null; f.aimLock=null; f.intent=null; }
  F.reactions.length=0; F.grant=null; F.repick=null; F.repicked=(F.repicked||0)+1;
  beats.unshift({t:'repick',inn:inKeys,out:outKeys,g:'end'});
  b3IntentRefresh(F);
  beats.push({t:'endTurn',who:null,bar:b3BarSnap(F,null,0),g:'end'});
  return {ok:true,beats};
}
// The simple player's pick, and the Lab's when nobody is there to choose: the four alive members who have been in the fight least, then the healthiest.
function b3RepickAuto(F) {
  const fought=F.fought||(F.fought={}); for(const p of F.party) fought[p.id]=(fought[p.id]||0)+1;
  const all=b3RepickPool(F).map(id=>{ const u=F.party.find(p=>p.id===id)||(F.bench&&F.bench[id]); return {id,n:fought[id]||0,share:u?u.hp/u.maxHp:1,ko:!!(u&&u.ko)}; });
  all.sort((a,b)=>(a.ko-b.ko)||(a.n-b.n)||(b.share-a.share));
  return b3Repick(F,all.slice(0,b3RepickSeats(F)).map(x=>x.id));
}
