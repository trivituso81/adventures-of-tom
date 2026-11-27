'use strict';
// engine/b3-bench.js: the preview stage of the Move Workbench (movebench1, plan claude/movebench-plan.md section c).
// Loaded only by bench.html (never by index.html). It starts a stub Battle 3 fight, plays ONE animation in it with the game's own engine
// and owns the clock. There is no second implementation of anything: a family move goes through b3Act and b3Play (the way
// engine/b3-movelab.js b3mlPlay does), a monster attack through b3FoeTurn with e.force (the way b3FirstSet does), the pictures, stage,
// effects, hit stop and sounds are the game's. Nothing is saved and nothing is asked of any server.
// The clock: while a preview is up B7.speed is 0, so the game's own frame calls updateBattle(0) and nothing moves by itself. This file calls
// updateBattle(dt) (the game's per-frame update, which runs b3Update(dt) and the effect timers) for Play, Pause, 1x, half, quarter and Loop.
// The page that holds the controls (battle-guide.html) talks to this one with postMessage: {bench:'play'|'pause'|'resume'|'speed'|'loop'|'mute'|'stop', ...}
// and hears back {bench:'ready'|'status', ...}.
const BN={on:false,id:null,state:'idle',speed:1,loop:true,mute:false,turbo:1,msg:'',playing:false,t0:0,len:null,ended:false,cfg:null,fight:null,kind:null,tick:0,
  ready:false,gen:0,timer:0,last:0,why:'',hold:false};
const BN_FILL=['tom','grace','rose','deedee','tnb','amy'];   // who stands beside the mover in the stub fight
const BN_PARTY=4;

// ---------- what an animation id means ----------
// 'move:<skill id>'  a family move;   'act:<monster id>:<act id>'  a monster attack (its wind-up plays first).
function bnParse(id) {
  const p=String(id||'').split(':');
  if(p[0]==='move'&&B3_SKILLS[p[1]]) { const S=B3_SKILLS[p[1]],V=B3_VIBES[S.vibe]; return V?{kind:'move',S,V,owner:V.owner,skill:S.id}:null; }
  if(p[0]==='act'&&B3_FOES[p[1]]) { const A=B3_FOES[p[1]].acts.find(a=>a.id===p[2]); return A&&A.hits!=='attacker'?{kind:'act',foe:B3_FOES[p[1]],A,foeId:p[1],act:A.id}:null; }
  return null;
}
// Can the preview play this one? (A counter act answers a hit and cannot open a fight.)
const bnCan=id=>!!bnParse(id);

// ---------- the stub fight ----------
function bnConfig(P) {
  const cfg={lab:true,seed:11,plain:true,mods:{foeHp:1,taken:1,foeSpeed:1},bench:true,loadouts:{}};
  if(P.kind==='move') {
    const party=[P.owner].concat(BN_FILL.filter(x=>x!==P.owner&&B3_CAST[x]&&b3HasKit(x))).slice(0,BN_PARTY);
    cfg.party=party; cfg.formation=P.S.slot==='cap'?'bigone':'mudling';
    for(const id of party) { const L=b3NewLoadout(id,B3_RULES.rankVp.length); if(id===P.owner) b3SetMain(id,L,P.V.id); cfg.loadouts[id]=L; }
    cfg.keepLoadout=party.slice();
  } else {
    const party=BN_FILL.filter(x=>B3_CAST[x]&&b3HasKit(x)).slice(0,BN_PARTY); cfg.party=party;
    const fm=Object.keys(B3_FORMATIONS).find(k=>(B3_FORMATIONS[k].foes||[]).some(f=>f.id===P.foeId));
    if(fm) cfg.formation=fm; else cfg.foes=[{id:P.foeId,row:'front'}];
    for(const id of party) cfg.loadouts[id]=b3NewLoadout(id,B3_RULES.rankVp.length);
    cfg.keepLoadout=party.slice();
  }
  return cfg;
}
// Start (or restart) the stub fight for this animation, in the same page. No turn flow: the queue the opening put on the clock is dropped and
// the fight stands waiting, the way the Move Lab's does between moves.
function bnFight(P) {
  const cfg=bnConfig(P); BN.cfg=cfg;
  if(B3.active) { B3P.q.length=0; }
  if(typeof B3C!=='undefined') B3C.need.clear();   // the last animation's clips are let go now, not after their keep time
  b3Start(cfg);
  B3P.q.length=0; B7.speed=0; B3.artWait=false;   /* b3Start held the opening on the backdrop until its sheets came; bnGo waits for them itself */
  B3.actor=null; B3.ui='lab'; battle.state='command'; B3.deck=[]; B3.look=null; B3.sheet=null; B3.note=''; B3.say='';
  b3ViewSync(); b3Render();
}
function bnRefill() {
  const F=B3.F;
  for(const u of F.units) { u.ko=false; u.hp=u.maxHp; if(u.side==='party') u.pep=Math.max(u.pep,9); }
  b3ViewSync();
}
// Everything the fight needs is on screen: the painted sheets of the units. And everything the animation shows is loaded: the game waits only 2.5 s of battle
// time for a clip and then plays its default motion, which would show Tom a move that is not the move; the preview asks first and waits (10 s at most).
function bnWarm(P) {
  const ids=[]; let SR=null;
  if(P.kind==='move') { SR=typeof B3_STAGE!=='undefined'&&B3_STAGE[P.skill]&&typeof b3gDefined==='function'&&b3gDefined(B3_STAGE[P.skill])?B3_STAGE[P.skill]:null;
    if(SR) b3gWarm(SR); const a=P.S.anim; if(a&&a.kind==='clip') ids.push(a.clip); if(a&&a.pair&&a.pair.clip) ids.push(a.pair.clip); }
  else { const a=P.A.anim; if(a&&a.kind==='clip') ids.push(a.clip); if(P.A.wind) ids.push(P.A.wind); }
  for(const id of ids) if(typeof b3cWant==='function') b3cWant(id,30000);
  return ()=>ids.every(id=>!BCLIPS[id]||b3cReady(id))&&(!SR||b3gReady(SR));
}
const bnFightReady=()=>!(typeof paintedFightReady==='function'&&!paintedFightReady());

// What the stub fight sets up so the move is allowed: a knocked-out ally for a revive, the tally a move needs (the way a player would have built it).
function bnSetup(F,u,S) {
  if(S.target==='ko_ally'||S.target==='family_or_ko') { const m=F.party.find(x=>x!==u); if(m) { m.ko=true; m.hp=0; } }
  if(S.needs&&S.needs.counter) u.counters[S.needs.counter]=Math.max(u.counters[S.needs.counter]||0,S.needs.min);
}
// Can this animation be set up in the stub fight? Builds the fight on its own (nothing is shown or played) and asks the rules for the move, the way bnPlayMove
// will. Returns '' when it can, else the reason. tools/movebench/preview_test.py runs it for every family move and monster attack.
function bnPreflight(id) {
  const P=bnParse(id); if(!P) return 'no preview for this kind';
  let F; try { F=b3NewFight(bnConfig(P)); } catch(err) { return 'the stub fight would not build: '+err.message; }
  if(P.kind==='act') { const e=F.foes.find(f=>f.id===P.foeId); return e?'':'the monster is not in its formation'; }
  const u=F.party.find(x=>x.id===P.owner); if(!u) return 'the mover is not in the stub fight';
  for(const x of F.units) { x.hp=x.maxHp; if(x.side==='party') x.pep=Math.max(x.pep,9); }
  const S=P.S; bnSetup(F,u,S);
  const O=b3Options(F,u,S).find(o=>!o.no); if(!O) return 'nobody to use it on';
  const r=b3Act(F,u,P.skill,O.key); return r.ok?'':(r.why||'the rules would not let it be used');
}

// ---------- playing ----------
function bnWhy(m) { BN.why=m||''; BN.msg=m||''; }
function bnMark(st) { BN.state=st; bnSend(); }
// Plays the family move NOW (b3mlPlay's own way).
function bnPlayMove(P,done) {
  const F=B3.F,u=F.party.find(x=>x.id===P.owner); if(!u) { bnWhy('The mover is not in the stub fight.'); return false; }
  bnRefill(); if(typeof B3G!=='undefined') B3G.run=null;
  const S=P.S;
  bnSetup(F,u,S); b3ViewSync();
  const O=b3Options(F,u,S).find(o=>!o.no);
  if(!O) { bnWhy('Nobody to use that on in the stub fight.'); return false; }
  const r=b3Act(F,u,P.skill,O.key);
  if(!r.ok) { bnWhy(r.why||'The rules would not let it be used.'); return false; }
  B3.actor=null; B3.ui='busy'; battle.state='busy'; B3.look=null; B3.sheet=null; B3.note=''; B3.deck=[];
  b3Render(); b3Play(r.beats,done); return true;
}
// Plays the monster attack: an attack that is wound up (a charge_up act with a `wind` video, or a wind-up act that `then` leads to) takes two monster turns, so the
// wind-up plays first and the attack on the monster's next turn (b3FirstSet's way: e.force on the first turn, then the charge the rules left on the monster).
function bnPlayAct(P,done) {
  const F=B3.F,e=F.foes.find(f=>f.id===P.foeId&&!f.ko); if(!e) { bnWhy('The monster is not in the stub fight.'); return false; }
  bnRefill();
  const w=e.D.acts.find(a=>a.then===P.act);
  e.force=w?w.id:P.act; e.wait=0;
  B3.actor=null; B3.ui='busy'; battle.state='busy'; B3.deck=[]; b3Render();
  const gen=BN.curGen; let n=0;
  const turn=()=>{ n++; b3Play(b3FoeTurn(F,e),()=>{ if(!BN.on||BN.gen!==gen) return; if(e.charge&&!F.over&&n<3) b3After(.35,turn); else done(); }); };
  turn(); return true;
}
function bnEnd() {
  BN.playing=false; BN.ended=true; BN.len=Math.max(0,B3P.t-BN.t0-.6); B3.ui='lab'; battle.state='command'; B3.actor=null; B3.deck=[];
  b3ViewSync(); b3Render(); bnMark('ended');
  if(BN.loop&&BN.on) { const g=BN.gen; BN.timer=setTimeout(()=>{ if(BN.on&&BN.gen===g&&BN.loop) bnGo(BN.id,true); },700); }
}
// Start the animation `id` from the beginning: a fresh stub fight (same seed, so the same dice), then the move.
function bnGo(id,again) {
  const P=bnParse(id); clearTimeout(BN.timer);
  if(!P) { bnWhy('This animation has no preview yet.'); bnMark('none'); return; }
  const gen=++BN.gen; BN.curGen=gen; BN.on=true; BN.id=id; BN.kind=P.kind; BN.ended=false; BN.playing=false; BN.len=null; bnWhy('');
  bnMark('loading');
  try { bnFight(P); } catch(err) { bnWhy('The stub fight would not start: '+err.message); bnMark('none'); return; }
  const t0=performance.now(),warm=bnWarm(P),wait=()=>{
    if(!BN.on||BN.gen!==gen) return;
    bnWarm(P);   // asks again every 100 ms, so nothing it needs is let go while it loads
    if((!bnFightReady()||!warm())&&performance.now()-t0<10000) { BN.timer=setTimeout(wait,100); return; }
    BN.timer=setTimeout(()=>{ if(!BN.on||BN.gen!==gen) return;
      BN.t0=B3P.t; const ok=P.kind==='move'?bnPlayMove(P,()=>{ if(BN.gen===gen) bnEnd(); }):bnPlayAct(P,()=>{ if(BN.gen===gen) bnEnd(); });
      if(ok) { BN.playing=true; BN.hold=false; bnMark('playing'); } else bnMark('none'); },again?50:350);
  };
  wait();
}
// ---------- the clock ----------
function bnLoop(now) {
  requestAnimationFrame(bnLoop);
  const real=Math.min(.1,Math.max(0,(now-(BN.last||now))/1000)); BN.last=now;
  if(!BN.on||!B3.active||!BN.playing||BN.hold) return;
  let acc=real*BN.speed*BN.turbo;
  while(acc>1e-6&&BN.playing) { const d=Math.min(acc,.05); try { updateBattle(d); } catch(err) { gameFault('bench update',err); } acc-=d; }
  if(++BN.tick%6===0) bnSend();
}
// ---------- the controls the page calls ----------
function bnPause() { if(!BN.playing) return; BN.hold=true; bnMark('paused'); }
function bnResume() { if(BN.ended) { bnGo(BN.id,true); return; } if(BN.playing) { BN.hold=false; bnMark('playing'); } }
function bnSpeed(v) { BN.speed=v===.25||v===.5?v:1; bnSend(); }
function bnLoopSet(on) { BN.loop=!!on; if(on&&BN.ended&&BN.on) { const g=BN.gen; BN.timer=setTimeout(()=>{ if(BN.on&&BN.gen===g&&BN.loop&&BN.ended) bnGo(BN.id,true); },700); } bnSend(); }
function bnMute(on) { BN.mute=!!on; sound.enabled=!on; if(on&&'speechSynthesis'in window) { try { speechSynthesis.cancel(); } catch(e) {} } bnSend(); }
function bnStop() {
  BN.on=false; BN.playing=false; clearTimeout(BN.timer); BN.gen++; bnMark('idle');
  if(B3.active) { B3P.q.length=0; b3End(null); }
}
// ---------- the page talking ----------
function bnStatus() {
  return {bench:'status',id:BN.id,state:BN.state,speed:BN.speed,loop:BN.loop,mute:BN.mute,t:Math.max(0,B3P.t-BN.t0),len:BN.len,msg:BN.msg,kind:BN.kind,
    clips:typeof b3cLoaded==='function'?b3cLoaded():0};
}
function bnSend() { try { if(parent&&parent!==window) parent.postMessage(bnStatus(),location.origin); } catch(e) {} }
window.addEventListener('message',ev=>{
  if(ev.origin!==location.origin) return;
  const m=ev.data; if(!m||typeof m.bench!=='string') return;
  if(m.bench==='play') { if(m.speed!=null) bnSpeed(m.speed); if(m.loop!=null) BN.loop=!!m.loop; if(m.mute!=null) bnMute(m.mute); bnGo(m.id); }
  else if(m.bench==='pause') bnPause(); else if(m.bench==='resume') bnResume();
  else if(m.bench==='speed') bnSpeed(m.v); else if(m.bench==='loop') bnLoopSet(m.on); else if(m.bench==='mute') bnMute(m.on);
  else if(m.bench==='stop') bnStop(); else if(m.bench==='ask') bnSend();
});
requestAnimationFrame(bnLoop);
window.B3BENCH={BN,preflight:bnPreflight,go:bnGo,pause:bnPause,resume:bnResume,speed:bnSpeed,loop:bnLoopSet,mute:bnMute,stop:bnStop,can:bnCan,parse:bnParse,status:bnStatus};
