'use strict';
// engine/b3-timeline.js — Battle 3 timeline: the tick clock, waits, round dividers, push, pull, place and the forecast
// that the turn bar shows (architecture section 2.4). RULES FILE: no drawing, no page, no timers.
//
// Every unit holds `wait`, the ticks until its turn. The next turn belongs to the smallest wait. After acting a unit
// waits Base Recovery x 100 / Speed. A divider sits at every multiple of 100 ticks; crossing one starts a new round.

// Who goes first of two units. Ties: a unit just placed at the front, then the party before enemies, then slot order.
function b3Before(a,b) {
  const d=a.wait-b.wait;
  if(Math.abs(d)>1e-9) return d;
  return (b.pri-a.pri)||(a.side===b.side?0:(a.side==='party'?-1:1))||(a.slot-b.slot);
}
const b3TurnOrder=F=>b3LiveAll(F).sort(b3Before);
// The wait a Base Recovery gives this unit right now. A Speed change while a unit is already waiting does not move it;
// it changes the next Recovery (architecture section 6).
function b3WaitFor(F,u,recovery) {
  return recovery*100/Math.max(1,b3Stat(u,'spd'))*b3Mult(u,'recovery')/(u.side==='foe'?F.mods.foeSpeed:1);
}
function b3SetWait(F,u,recovery) { if(!recovery) return; u.wait=b3WaitFor(F,u,recovery); u.pri=0; }   // Recovery 0: the act does not move the unit on the bar

// A new round: "1/round" counts reset, pushes and pulls stop halving, round-length statuses count down.
function b3RoundStart(F,beats) {
  F.round++;
  beats.push({t:'round',n:F.round});
  for(const u of F.units) {
    u.pushes=0; u.pulls=0; u.placed=false; u.granted=0; u.pepRound=0;
    for(const id of Object.keys(u.st)) { const s=u.st[id]; if(s.unit==='round'&&--s.n<=0) { b3EndStatus(F,u,id,'time'); beats.push({t:'statusEnd',tgt:u.key,id}); } }
  }
  b3Fire(F,'roundStart',{},beats);
}
// Move the clock to the next turn and say whose it is. Round dividers crossed on the way are started first.
function b3Tick(F,beats) {
  const u=b3TurnOrder(F)[0]; if(!u) return null;
  const dt=Math.max(0,u.wait),to=F.clock+dt;
  while(F.round*B3_RULES.round<=to+1e-9) b3RoundStart(F,beats);
  F.clock=to;
  for(const o of F.units) if(b3Alive(o)) o.wait=Math.max(0,o.wait-dt);
  u.wait=0;
  return u;
}

// ---------- Push, pull, place (spec 2.2) ----------
// Each further push on the same unit inside one round is halved (35, then 17.5, then 8.75). Pulls halve the same way.
function b3Push(F,u,n) {
  if(!b3Alive(u)||b3HasFlag(u,'pushImmune')) return 0;
  const amt=n*Math.pow(B3_RULES.halving,u.pushes); u.pushes++; u.wait+=amt; return amt;
}
function b3Pull(F,u,n) {
  if(!b3Alive(u)) return 0;
  const amt=Math.min(u.wait,n*Math.pow(B3_RULES.halving,u.pulls)); u.pulls++; u.wait-=amt; return amt;
}
// Place a unit to act next (NeeDoh Stretch Pass). It is a pull of the whole gap, so it halves like one, and each unit can be
// moved this way once a round. A unit that reaches the front goes ahead of anyone else already waiting there.
function b3Place(F,u) {
  if(!b3Alive(u)||u.placed) return 0;
  const amt=b3Pull(F,u,u.wait); u.placed=true;
  if(u.wait<1e-9) { u.wait=0; u.pri=++F.priSeq; }
  return amt;
}

// ---------- Forecast: the next n turns ----------
// Runs the same clock forward on a copy of the waits, counting every future action as Recovery 100.
// opt.actor: the unit whose turn it is now (listed first, `now`). opt.recovery: the Base Recovery of the move it is using or
// has highlighted, so its next turn lands where that move would put it; that entry is marked `ghost` when opt.ghost is set.
// An entry with `div` is the first turn of that round: the bar draws the divider before it.
function b3Forecast(F,n,opt) {
  opt=opt||{};
  const R=B3_RULES.round,L=b3LiveAll(F).map(u=>({u,w:u.wait,pri:u.pri,side:u.side,slot:u.slot})),out=[];
  const cmp=(a,b)=>b3Before({wait:a.w,pri:a.pri,side:a.side,slot:a.slot},{wait:b.w,pri:b.pri,side:b.side,slot:b.slot});
  const rnd=t=>Math.floor((t+1e-9)/R);
  let t=F.clock,ghost=false;
  const A=opt.actor&&L.find(e=>e.u===opt.actor);
  if(A) { out.push({u:A.u,now:true,at:t,div:0,ghost:false}); A.w=b3WaitFor(F,A.u,opt.recovery||B3_RULES.forecast); A.pri=0; ghost=!!opt.ghost; }
  while(out.length<n&&L.length) {
    L.sort(cmp);
    const e=L[0],dt=Math.max(0,e.w),t2=t+dt;
    out.push({u:e.u,now:false,at:t2,div:rnd(t2)>rnd(t)?rnd(t2)+1:0,ghost:ghost&&e===A});
    if(e===A) ghost=false;
    for(const o of L) o.w-=dt;
    e.w=b3WaitFor(F,e.u,B3_RULES.forecast); e.pri=0; t=t2;
  }
  return out;
}
// The forecast as plain rows for a beat, so the screen can show the bar as it stood at that moment.
function b3BarSnap(F,actor,recovery) { return b3Forecast(F,9,{actor,recovery}).map(e=>({k:e.u.key,now:e.now,div:e.div})); }
