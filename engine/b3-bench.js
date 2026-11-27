'use strict';
// engine/b3-bench.js: the preview stage of the Move Workbench (movebench1 and movebench2, plan claude/movebench-plan.md sections c and g).
// Loaded only by bench.html (never by index.html). It starts a stub Battle 3 fight, plays ONE animation in it with the game's own engine
// and owns the clock. There is no second implementation of anything: a family move goes through b3Act and b3Play (the way
// engine/b3-movelab.js b3mlPlay does), a monster attack through b3FoeTurn with e.force (the way b3FirstSet does), a body state through the
// beats the rules would send (b3Show) and the guard proof's own calls, the pictures, stage, effects, hit stop and sounds are the game's.
// Nothing is saved and nothing is asked of any server.
// The clock: while a preview is up B7.speed is 0, so the game's own frame calls updateBattle(0) and nothing moves by itself. This file calls
// updateBattle(dt) (the game's per-frame update, which runs b3Update(dt) and the effect timers) for Play, Pause, 1x, half, quarter and Loop.
// movebench2: any moment can be drawn again. The fight is built again from the same start (the clock at 0, Math.random answering from one seeded
// run, the draw of each picture seeded by its own moment) and stepped silently, 1/60 s at a time, without drawing, to the moment asked for; that
// is the same picture every time (bnSeek, bnStep). The first time an animation plays it is also run once to the end, silently, to read the bar
// from the run itself: the body video the engine started (B3P.body, the monster's cl and windId), the stage row's steps (B3G.run, the steps'
// _T), the effects the engine armed (B3V.cues, B3V.holds), every sound the engine asked for (sfx) and the moment the first hit showed.
// The page that holds the controls (battle-guide.html) talks to this one with postMessage: {bench:'play'|'pause'|'resume'|'speed'|'loop'|'mute'|
// 'answer'|'seek'|'step'|'stop'|'ask', ...} and hears back {bench:'ready'|'status'|'timeline', ...}.
const BN={on:false,id:null,P:null,state:'idle',speed:1,loop:true,mute:false,answer:false,turbo:1,msg:'',playing:false,t0:0,len:null,ended:false,cfg:null,fight:null,kind:null,tick:0,
  ready:false,gen:0,timer:0,last:0,why:'',hold:false,fin:false,doneAt:0,n:0,det:false,phase:'move',rec:null,tl:null,tlKey:'',silent:false,sub:null,ansKey:null,warmAt:0,seeks:0};
const BN_FILL=['tom','grace','rose','deedee','tnb','amy'];   // who stands beside the mover in the stub fight
const BN_PARTY=4;
const BN_STEP=1/60, BN_SEED=0x5eed11, BN_PICTURE=1/24;   // a replay steps 1/60 s; "one picture" is 1/24 s, the rate the clips were made at
// The preview fight waits for a video as long as it takes (the game gives up after 2.5 s and plays the default motion; that would show a move that is not the move).
if(typeof B3C!=='undefined') B3C.waitMax=12;
const BN_STATES={family:['idle','guard','hit','dodge','ko','victory','run','cast','give'],foe:['idle','hit','die']};   // the body states the preview plays

// movebench3: the golden record (tools/movebench/golden.py). BNG.rec is set only while bngRun records one animation; the game never reads any of it.
const BNG={rec:null};
const bngT=()=>Math.round((B3P.t-BN.t0)*1000)/1000;
// ---------- the same dice every time ----------
function bnRng(seed) { let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
// Everything the game draws that is random (a hit's shake, a stage shake, a held picture's jitter) draws from a run seeded by the picture's own moment, so a moment is one picture;
// the numbers the fight's steps use (where a rain falls, the one shake a hold keeps) come from BN.upd, which every start re-seeds. A draw puts back what it found.
(function bnInstall() {
  if(typeof b3Draw==='function') { const d=window.b3Draw; window.b3Draw=function() {
    if(!BN.on) return d.apply(this,arguments);
    const keep=Math.random; Math.random=bnRng((Math.imul(Math.round(B3P.t*1000)+1,2654435761)^0x9e3779b9)>>>0);
    try { return d.apply(this,arguments); } finally { Math.random=keep; } }; }
  // every sound the engine asks for is written down (for the bar) and, in a silent replay, not played
  if(typeof sfx!=='undefined') for(const k of Object.keys(sfx)) if(typeof sfx[k]==='function') { const o=sfx[k];
    sfx[k]=function() { if(BN.rec&&BN.on) BN.rec.snd.push({t:B3P.t-BN.t0,name:k}); if(BN.silent) return undefined; return o.apply(this,arguments); }; }
  // the first beat that touches someone, in the move's own part of the run, is where the bar's HIT line stands (a staged move gives its own, B3G.run.hitAt)
  if(typeof b3Show==='function') { const s=window.b3Show; window.b3Show=function(b) {
    if(BN.rec&&BN.on&&BN.phase==='move'&&BN.rec.hit==null&&b&&(b.t==='hit'||b.t==='miss'||b.t==='heal'||b.t==='shield')) BN.rec.hit=B3P.t-BN.t0;
    if(BN.rec&&BN.on&&BN.phase==='move'&&b&&b.t==='hit'&&BN.rec.rep) BN.rec.rep.hits.push(Math.round((B3P.t-BN.t0)*1000)/1000);   // movebench5: when each hit lands, for the run report
    if(BNG.rec&&BN.on&&b&&(b.t==='hit'||b.t==='miss'||b.t==='heal'||b.t==='shield'||b.t==='ko')) BNG.rec.beats.push({t:bngT(),b:b.t,tgt:b.tgt||null,phase:BN.phase});
    return s.apply(this,arguments); }; }
  // movebench3: every stage step the engine fires is written down for the golden record (what it was, and when)
  if(typeof b3gDo==='function') { const d=window.b3gDo; window.b3gDo=function(a) {
    if(BNG.rec&&BN.on&&a) BNG.rec.stage.push({t:bngT(),do:a.do,id:a.id||null,amp:a.do==='shake'?(a.amp||3):undefined,dur:a.do==='shake'?(a.dur||.3):undefined,text:a.text||undefined,sfx:a.sfx||undefined});
    return d.apply(this,arguments); }; }
})();

// ---------- what an animation id means ----------
// 'move:<skill id>' a family move; 'act:<monster id>:<act id>' a monster attack (its wind-up plays first); 'wind:<monster id>:<act id>' the wind-up alone;
// 'body:<owner>:<state>' a body state (one of BN_STATES).
function bnParse(id) {
  const p=String(id||'').split(':');
  if(p[0]==='move'&&B3_SKILLS[p[1]]) { const S=B3_SKILLS[p[1]],V=B3_VIBES[S.vibe]; if(V) return {kind:'move',S,V,owner:V.owner,skill:S.id};
    return S.common&&!S.vibe?{kind:'move',S,V:null,owner:BN_FILL[0],skill:S.id}:null; }   // movebench6: Pick-Me-Up, the move every family member has, is shown on the first of them
  if(p[0]==='act'&&B3_FOES[p[1]]) { const A=B3_FOES[p[1]].acts.find(a=>a.id===p[2]); return A&&A.hits!=='attacker'?{kind:'act',foe:B3_FOES[p[1]],A,foeId:p[1],act:A.id}:null; }
  if(p[0]==='wind'&&B3_FOES[p[1]]) { const f=B3_FOES[p[1]],A=f.acts.find(a=>a.id===p[2]);
    return A&&A.hits!=='attacker'&&(msWindClip(p[1],A.id)||f.acts.some(a=>a.then===A.id))?{kind:'wind',foe:f,A,foeId:p[1],act:A.id}:null; }
  if(p[0]==='body') { const o=p[1],st=p[2];
    if(B3_FOES[o]&&BN_STATES.foe.includes(st)) return {kind:'state',owner:o,state:st,isFoe:true,foe:B3_FOES[o],foeId:o};
    if(B3_CAST[o]&&typeof b3HasKit==='function'&&b3HasKit(o)&&BN_STATES.family.includes(st)) return {kind:'state',owner:o,state:st,isFoe:false}; }
  return null;
}
// Can the preview play this one? (A counter act answers a hit and cannot open a fight.)
const bnCan=id=>!!bnParse(id);

// ---------- the stub fight ----------
function bnConfig(P) {
  const cfg={lab:true,seed:11,plain:true,mods:{foeHp:1,taken:1,foeSpeed:1},bench:true,pink:!BN.golden,loadouts:{}};   // movebench10: pink boxes for an object with no picture; the golden recorder leaves them off so it records what the game plays
  if(P.kind==='move'||(P.kind==='state'&&!P.isFoe)) {
    const party=[P.owner].concat(BN_FILL.filter(x=>x!==P.owner&&B3_CAST[x]&&b3HasKit(x))).slice(0,BN_PARTY);
    cfg.party=party; cfg.formation=P.kind==='move'&&P.S.slot==='cap'?'bigone':'mudling';
    for(const id of party) { const L=b3NewLoadout(id,B3_RULES.rankVp.length); if(P.kind==='move'&&P.V&&id===P.owner) b3SetMain(id,L,P.V.id); cfg.loadouts[id]=L; }
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
// The unit this animation is about (a family member's or a monster's key).
function bnSubject(P) {
  const F=B3.F; if(!F) return null;
  const u=P.kind==='move'||(P.kind==='state'&&!P.isFoe)?F.party.find(x=>x.id===P.owner):F.foes.find(f=>f.id===P.foeId);
  return u?u.key:null;
}
// Start (or restart) the stub fight for this animation, in the same page. No turn flow: the queue the opening put on the clock is dropped and
// the fight stands waiting, the way the Move Lab's does between moves. The clock starts at 0 every time.
function bnFight(P) {
  const cfg=bnConfig(P); BN.cfg=cfg;
  if(B3.active) { B3P.q.length=0; }
  if(typeof B3G!=='undefined') B3G.pink=false;
  b3Start(cfg);
  B3P.q.length=0; B7.speed=0; B3.artWait=false;   /* b3Start held the opening on the backdrop until its sheets came; bnGo waits for them itself */
  B3P.t=0; battle.time=0;
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
  if(P.kind==='move') { SR=typeof msStageRow==='function'&&msStageRow('move:'+P.skill)&&typeof b3gDefined==='function'&&b3gDefined(msStageRow('move:'+P.skill))?msStageRow('move:'+P.skill):null;
    if(SR) b3gWarm(SR); const mid='move:'+P.skill,mc=msClipOf(mid),mp=msPairOf(mid); if(mc) ids.push(mc); if(mp) ids.push(mp.clip); }
  else if(P.kind==='act') { const ac=msClipOf('act:'+P.foeId+':'+P.act),wc=msWindClip(P.foeId,P.act); if(ac) ids.push(ac); if(wc) ids.push(wc); }
  else if(P.kind==='wind') { const w=P.foe.acts.find(a=>a.then===P.act),wc=w&&msWindClip(P.foeId,w.id),wa=msWindClip(P.foeId,P.act); if(wc) ids.push(wc); if(wa) ids.push(wa); }
  else if(P.kind==='state') { const st=P.state;
    for(const k of st==='run'?['run','idle']:st==='guard'?['guard','idle']:[st,'idle']) { const c=typeof b3cOf==='function'?b3cOf(P.owner,k):null; if(c) ids.push(c); } }
  if(P.kind==='move'){ const an=typeof msAnswer==='function'?msAnswer('move:'+P.skill):null; if(an&&an.clip) ids.push(an.clip); }   // movebench11: the counter video is loaded before the run starts
  if(BN.answer&&P.kind==='move'&&B3.F) { const X=bnAnswerAct(B3.F); if(X&&X.A) { const ac=msClipOf('act:'+X.e.id+':'+X.A.id),wc=msWindClip(X.e.id,X.A.id); if(ac) ids.push(ac); if(wc) ids.push(wc); } }   // the answer's own videos are loaded before the run starts
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
// will. Returns '' when it can, else the reason. tools/movebench/preview_test.py runs it for every family move, monster attack, wind-up and body state.
function bnPreflight(id) {
  const P=bnParse(id); if(!P) return 'no preview for this kind';
  let F; try { F=b3NewFight(bnConfig(P)); } catch(err) { return 'the stub fight would not build: '+err.message; }
  if(P.kind==='act'||P.kind==='wind') { const e=F.foes.find(f=>f.id===P.foeId); return e?'':'the monster is not in its formation'; }
  if(P.kind==='state') { if(P.isFoe) return F.foes.find(f=>f.id===P.owner)?'':'the monster is not in its formation'; return F.party.find(x=>x.id===P.owner)?'':'the member is not in the stub fight'; }
  const u=F.party.find(x=>x.id===P.owner); if(!u) return 'the mover is not in the stub fight';
  for(const x of F.units) { x.hp=x.maxHp; if(x.side==='party') x.pep=Math.max(x.pep,9); }
  const S=P.S; bnSetup(F,u,S);
  const O=b3Options(F,u,S).find(o=>!o.no); if(!O) return 'nobody to use it on';
  const r=b3Act(F,u,P.skill,O.key); return r.ok?'':(r.why||'the rules would not let it be used');
}

// ---------- playing ----------
function bnWhy(m) { BN.why=m||''; BN.msg=m||''; }
function bnMark(st) { BN.state=st; bnSend(); }
const bnBusy=()=>{ B3.actor=null; B3.ui='busy'; battle.state='busy'; B3.look=null; B3.sheet=null; B3.note=''; B3.deck=[]; };
// One monster attack after the move, as the Move Lab's MONSTER ACTS plays one: the first monster standing, the first act that is a plain attack.
function bnAnswerAct(F) { const e=F&&F.foes.find(f=>!f.ko); return e?{e,A:e.D.acts.find(a=>a.hits!=='attacker'&&!a.then&&!msWindClip(e.id,a.id))||e.D.acts.find(a=>a.hits!=='attacker'&&!a.then)}:null; }
function bnAnswer(done) {
  const F=B3.F,X=bnAnswerAct(F); if(!X) { done(); return; }
  const e=X.e,A=X.A;
  BN.phase='answer'; BN.ansKey=e.key;
  if(A) { e.force=A.id; e.wait=0; }
  // movebench11: the monster aims at the one who made the move, so a ward on that member (a lasting thing that answers a hit) is the one that is hit
  const mv=BN.P&&BN.P.kind==='move'?F.party.find(x=>x.id===BN.P.owner):null;
  if(A&&mv&&typeof b3Alive==='function'&&b3Alive(mv)) e.aimLock={act:A.id,key:mv.key};
  bnBusy(); b3Render();
  b3After(.4,()=>b3Play(b3FoeTurn(F,e),done));
}
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
  bnBusy(); b3Render();
  b3Play(r.beats,BN.answer?()=>bnAnswer(done):done); return true;
}
// Plays the monster attack: an attack that is wound up (a charge_up act with a `wind` video, or a wind-up act that `then` leads to) takes two monster turns, so the
// wind-up plays first and the attack on the monster's next turn (b3FirstSet's way: e.force on the first turn, then the charge the rules left on the monster).
function bnPlayAct(P,done) {
  const F=B3.F,e=F.foes.find(f=>f.id===P.foeId&&!f.ko); if(!e) { bnWhy('The monster is not in the stub fight.'); return false; }
  bnRefill();
  const w=e.D.acts.find(a=>a.then===P.act);
  e.force=w?w.id:P.act; e.wait=0;
  bnBusy(); b3Render();
  const gen=BN.gen; let n=0;
  const turn=()=>{ n++; b3Play(b3FoeTurn(F,e),()=>{ if(!BN.on||BN.gen!==gen) return; if(e.charge&&!F.over&&n<3) b3After(.35,turn); else done(); }); };
  turn(); return true;
}
// The wind-up alone: the monster's first turn (the telegraph), then its wound-up picture held for a moment. The attack never lands.
function bnPlayWind(P,done) {
  const F=B3.F,e=F.foes.find(f=>f.id===P.foeId&&!f.ko); if(!e) { bnWhy('The monster is not in the stub fight.'); return false; }
  bnRefill();
  const w=e.D.acts.find(a=>a.then===P.act);
  e.force=w?w.id:P.act; e.wait=0;
  bnBusy(); b3Render();
  b3Play(b3FoeTurn(F,e),()=>b3After(1.6,done)); return true;
}
// A body state, held for a few seconds the way the game shows it: the beats the rules would send for a hit, a miss and a knock-out go through b3Show, the guard goes up and
// down the guard proof's way (engine/b3-lab.js b3LabGuardProof), victory is the cheer a won fight sets, running is the path a strike takes across the field.
function bnPlayState(P,done) {
  const F=B3.F,u=P.isFoe?F.foes.find(f=>f.id===P.owner):F.party.find(x=>x.id===P.owner); if(!u) { bnWhy('That one is not in the stub fight.'); return false; }
  bnRefill(); if(typeof B3G!=='undefined') B3G.run=null;
  const key=u.key,st=P.state,V=B3.view,after=(s,fn)=>b3After(s,fn);
  const guard=on=>{ if(on&&!u.st.guard_stance) b3AddStatus(F,u,'guard_stance',{n:3}); else if(!on&&u.st.guard_stance) b3EndStatus(F,u,'guard_stance'); b3ViewSync(); b3Render(); };
  const hit=(dmg)=>b3Show({t:'hit',tgt:key,dmg,hp:Math.max(1,u.maxHp-dmg),flavor:'clobber'});
  bnBusy(); b3Render();
  let len=3;
  if(st==='guard') { after(.5,()=>{ b3Word('GUARD UP','#fff1cb'); guard(true); }); after(2.6,()=>{ b3Word('BRACED HIT','#fff1cb'); hit(9); }); after(3.8,()=>{ b3Word('GUARD DOWN','#fff1cb'); guard(false); }); len=5.4; }
  else if(st==='hit') { after(.5,()=>hit(14)); len=2.6; }
  else if(st==='dodge') { after(.5,()=>b3Show({t:'miss',tgt:key,why:'dodge'})); len=2.4; }
  else if(st==='ko'||st==='die') { after(.5,()=>b3Show({t:'ko',tgt:key})); len=3.6; }
  else if(st==='victory') { after(.5,()=>{ B3P.cheerKey=key; B3P.cheerAt=null; }); len=4.6; }
  else if(st==='run') {
    const f=F.foes.find(x=>!x.ko),home=b3PartyHome(u),z=f?b3Spot(f.key):{sx:140,sb:home.base},D=B3_BODY;
    const keys=[{t:0,x:home.cx,y:home.base,f:D.idle},{t:.05,x:home.cx,y:home.base,f:D.dash},{t:.9,x:z.sx-8,y:z.sb,f:D.dash},{t:1.3,x:z.sx-8,y:z.sb,f:D.dash},{t:1.35,x:z.sx-8,y:z.sb,f:D.dash},{t:2.3,x:home.cx,y:home.base,f:D.dash},{t:2.35,x:home.cx,y:home.base,f:D.idle}];
    after(.3,()=>{ B3P.body[key]={kind:'path',keys,t0:B3P.t,dur:2.35}; }); len=3.2; }
  else if(st==='cast'||st==='give') {
    after(.4,()=>{ if(!b3cBodyClip(key,st)) B3P.body[key]={kind:'pose',f:st==='give'?B3_BODY.give:B3_BODY.cast,t0:B3P.t,dur:.75*B3_TEMPO}; }); len=3; }
  b3After(len+.6,done); return true;
}
// The run's play, by kind, from the clock's start. done() is called .6 s after the last thing it shows.
function bnPlayKind(P,done) { return P.kind==='move'?bnPlayMove(P,done):P.kind==='act'?bnPlayAct(P,done):P.kind==='wind'?bnPlayWind(P,done):bnPlayState(P,done); }

// Build the fight from the start and begin the animation at moment 0, now. Everything it shows has to be loaded already (bnGo waits for that). The same call starts a survey,
// a replay and a live play, so they are the same run.
function bnBegin(P) {
  const gen=BN.gen; BN.fin=false; BN.phase='move'; BN.n=0; BN.doneAt=0; BN.ansKey=null; BN.det=false;
  Math.random=BN.upd=bnRng(BN_SEED);
  bnFight(P); BN.sub=bnSubject(P);
  bnWarm(P);
  BN.t0=B3P.t;
  const ok=bnPlayKind(P,()=>{ if(BN.gen!==gen) return; BN.doneAt=B3P.t-BN.t0; BN.fin=true; });
  if(ok) { BN.playing=true; BN.det=true; }
  return ok;
}
// Step the run silently, 1/60 s at a time and without drawing, up to step n (or until it has finished). What a draw would have set going (a hit stop starts at the first picture drawn
// after its moment) is set going here by the engine's own call, b3vTimeOf, once a step.
function bnStepTo(n) {
  const was=sound.enabled; BN.silent=true; sound.enabled=false;
  try {
    while(BN.n<n&&!BN.fin) {
      try { updateBattle(BN_STEP); } catch(err) { gameFault('bench update',err); }
      BN.n++;
      if(typeof B3V!=='undefined'&&B3V.holds.length) { try { for(const h of B3V.holds.slice()) for(const k of h.keys) b3vTimeOf(k,B3P.t); } catch(e) {} }
      if(BN.rec) bnSample();
      if(BNG.rec) bngSample();
    }
  } finally { BN.silent=false; sound.enabled=was&&!BN.mute; }
}
const bnRound=sec=>Math.round(sec/BN_STEP);

// ---------- the bar, read from the run ----------
const bnFxName=id=>String(id).replace(/^(vfx_core_|vfx_|proj_|setpiece_)/,'').replace(/_/g,' ');
const bnClipName=id=>String(id||'').replace(/_/g,' ');
const bnStageName=s=>({words:'Words: '+(s.text||''),shake:'Shake',flash:'Flash',dim:'Dim',glow:'Glow',fly:'Thing flies',drop:'Thing drops',cross:'Thing crosses',rain:'Things rain',pop:'Thing pops',place:'Thing put in front',hover:'Thing floats',surround:'Things close around',foe:'Monster pushed',sfx:'Sound: '+(s.sfx||'')}[s.do]||s.do);
function bnRecNew() { return {lanes:{video:[],wind:[],stage:[],fx:[],snd:[]},cur:{},cues:new Set(),holds:new Set(),snd:[],hit:null,run:null,stageDone:false,rep:{hold:null,shake:null,runIn:null,back:false,hits:[]}}; }
function bnSeg(lane,key,label,k,t) {
  const R=BN.rec,L=R.cur[lane+'|'+key];
  if(L&&t-L.b<=BN_STEP*2.5) { L.b=t; return; }
  const s={a:t,b:t,label,k:k||''}; R.lanes[lane].push(s); R.cur[lane+'|'+key]=s;
}
function bnSampleFoe(key,lane,pre) {
  const A=B3P.fa[key]; if(!A) return;
  const t=B3P.t-BN.t0;
  if(A.die!=null) bnSeg('video','die'+key,pre+'Knocked out','video',t);
  if(A.cl&&B3P.t<A.cl.t0+A.cl.dur+.05) bnSeg(lane,'cl'+A.cl.id,pre+bnClipName(A.cl.id),'video',t);
  else if(A.hold&&B3P.t<A.hold) bnSeg(lane,'hold'+key,pre+'Default motion','default',t);
  if(A.windId) bnSeg('wind','w'+A.windId,bnClipName(A.windId)+', held','video',t);
}
function bnSample() {
  const R=BN.rec,t=B3P.t-BN.t0,F=B3.F; if(!R||!F) return;
  const u=BN.sub&&b3Unit(F,BN.sub);
  if(u&&u.side!=='foe') {
    const B=B3P.body[BN.sub],cheer=B3P.cheer||B3P.cheerKey===BN.sub;
    if(B) {
      if(B.kind==='cmove') { const e=B3P.t-B.t0,cd=B.C.dur/1000;
        if(e<B.T0) { R.rep.runIn=B.T0; R.rep.back=!!B.back; bnSeg('video','run','Runs in','default',t); } else if(e<B.T0+cd+.12) bnSeg('video','cm'+B.C.id,bnClipName(B.C.id),'video',t); else if(B.back) bnSeg('video','home','Runs home','default',t); }
      else if(B.kind==='cs') bnSeg('video','cs'+B.id,bnClipName(B.id),'video',t);
      else if(B.kind==='ko') bnSeg('video','ko','Knocked out','video',t);
      else if(B.kind==='path') bnSeg('video','path','Runs across','default',t);
      else if(B.kind==='away') bnSeg('video','away','Partner video','video',t);
      else bnSeg('video','pose'+B.kind,B.kind==='hit'&&B.guard?'Braced hit':B.kind==='dodge'?'Dodge':'Default motion','default',t);
    }
    if(cheer&&BN.on&&BN.P&&BN.P.state==='victory') bnSeg('video','cheer','Victory','video',t);
    if(BN.P&&BN.P.state==='guard'&&B3P.body[BN.sub]==null&&b3cGuarding&&b3cGuarding(u)) bnSeg('video','guard','Guard up','video',t);
    if(typeof B3G!=='undefined'&&B3G.run&&B3G.run.noVideo&&B3P.t<B3G.run.t0+(B3G.run.len||0)) bnSeg('video','novideo','No video yet: standing video','need',t);
  } else if(u) bnSampleFoe(BN.sub,'video','');
  if(BN.ansKey&&BN.phase==='answer') bnSampleFoe(BN.ansKey,'video','Answer: ');
  if(typeof B3G!=='undefined'&&B3G.run&&BN.P&&BN.P.kind==='move'&&B3G.run.id===BN.P.skill&&!R.stageDone) {
    R.stageDone=true; const run=B3G.run,row=msStageRow('move:'+BN.P.skill),off=run.t0-BN.t0;
    R.run={hitAt:run.hitAt+off,off,marks:run.marks,ids:run.ids,noVideo:!!run.noVideo,budget:run.budget,clipSec:run.clipSec,times:(row&&row.steps||[]).map(s=>s._T)};   // movebench9: times is each step's moment, seconds from the start of the move, in the order of the spec's steps
    if(row) for(const s of [].concat(row.steps||[],row.setpiece&&row.setpiece.steps||[])) if(s._T!=null) R.lanes.stage.push({a:s._T+off,b:s._T+off+(s.dur||s.hold||.3),label:bnStageName(s),k:'stage',pink:typeof B3G!=='undefined'&&[].concat(s.assets||s.asset||[]).some(k=>!B3G.A[k])});
  }
  if(typeof B3V!=='undefined') {
    for(const c of B3V.cues) if(!R.cues.has(c)) { R.cues.add(c);
      for(const e of c.fx) { let ms=500; try { const L=P1_VFX_MS[e.fx]; ms=typeof L==='function'?L(e.params||null):(L||500); } catch(x) {}
        const off=b3vAtSec(c,e); R.lanes.fx.push({a:c.t0-BN.t0+off,b:c.t0-BN.t0+off+ms/1000,label:bnFxName(e.fx),k:'fx'}); } }
    for(const h of B3V.holds) if(!R.holds.has(h)) { R.holds.add(h); R.rep.hold={at:h.t0-BN.t0,dur:h.dur}; R.lanes.fx.push({a:h.t0-BN.t0,b:h.t0-BN.t0+h.dur,label:'Freeze on the hit',k:'hold'}); }
    if(B3V.shake&&R.rep.shake==null) R.rep.shake={at:B3V.shake.t0-BN.t0,px:B3V.shake.px};
  }
}
// The bar of what was just surveyed, for the page: lanes of {a,b,label,k} in seconds from the start, the HIT moment, the ticks of a staged move's marks.
function bnTimeline(len) {
  const R=BN.rec,P=BN.P,cl=x=>({a:Math.max(0,Math.min(len,x.a)),b:Math.max(0,Math.min(len,Math.max(x.b,x.a+.05))),label:x.label,k:x.k});
  const snd=R.snd.map(s=>({a:s.t,b:s.t+.3,label:s.name,k:'snd'}));
  const lanes=[],add=(id,name,segs)=>lanes.push({id,name,segs:segs.map(cl).sort((x,y)=>x.a-y.a)});
  if(P.kind==='act') { add('wind','Wind-up',R.lanes.wind); add('video','Attack',R.lanes.video); }
  else if(P.kind==='wind') add('wind','Wind-up',R.lanes.wind.concat(R.lanes.video));
  else add('video','Video',R.lanes.video);
  if(P.kind==='move') add('stage','Stage',R.lanes.stage);
  if(P.kind!=='state'&&P.kind!=='wind') add('fx','Effects',R.lanes.fx);
  add('snd','Sound',snd);
  const ticks=[]; if(R.run) for(const n in R.run.marks) ticks.push({name:n,t:R.run.marks[n]+R.run.off});
  const hit=R.run?R.run.hitAt:R.hit;
  // movebench5: what the engine really did in this run (the page's Timing controls are checked against it): the hit, each hit's moment, the freeze, the shake, the run in and home
  const r3=x=>x==null?null:Math.round(x*1000)/1000,rp=R.rep||{},hits=(rp.hits||[]).slice(),hold=rp.hold,sk=rp.shake;
  const run={hit:r3(hit),hits:hits,holdSec:hold?r3(hold.dur):0,holdAt:hold?r3(hold.at):null,shakePx:sk?sk.px:0,shakeAt:sk?r3(sk.at):null,runInSec:rp.runIn==null?null:r3(rp.runIn),
    gap:hits.length>1?r3(hits[1]-hits[0]):null,len:r3(len),
    staged:!!R.run,off:R.run?r3(R.run.off):null,marks:R.run?Object.fromEntries(Object.entries(R.run.marks||{}).map(([k,v])=>[k,r3(v)])):null,steps:R.run?(R.run.times||[]).map(r3):null,noVideoRun:!!(R.run&&R.run.noVideo),clipSec:R.run?r3(R.run.clipSec):null};
  return {bench:'timeline',id:BN.id,len,hit:hit==null?null:Math.max(0,Math.min(len,hit)),lanes,ticks,noVideo:!!(R.run&&R.run.noVideo),answer:BN.answer&&P.kind==='move',run};
}
// Run the animation once to its end, silently, and read the bar from what the engine did.
function bnSurvey(P,key) {
  BN.rec=bnRecNew(); BN.on=true;
  try {
    if(!bnBegin(P)) return false;
    bnStepTo(bnRound(90));
    const len=Math.max(.3,(BN.fin?BN.doneAt:B3P.t-BN.t0)-.6);
    BN.tl=bnTimeline(len); BN.tl.key=key; BN.tlKey=key; BN.len=len;
  } finally { BN.rec=null; }
  bnSendTl(); return true;
}
function bnEnd() {
  BN.playing=false; BN.ended=true; BN.len=BN.tl&&BN.tlKey===BN.id+'|'+(BN.answer?1:0)?BN.tl.len:Math.max(0,B3P.t-BN.t0-.6); B3.ui='lab'; battle.state='command'; B3.actor=null; B3.deck=[];
  b3ViewSync(); b3Render(); bnMark('ended');
  if(BN.loop&&BN.on) { const g=BN.gen; BN.timer=setTimeout(()=>{ if(BN.on&&BN.gen===g&&BN.loop) bnGo(BN.id,true); },700); }
}
// Start the animation `id` from the beginning: a fresh stub fight (same seed, so the same dice), then the move.
function bnGo(id,again) {
  const P=bnParse(id); clearTimeout(BN.timer);
  if(!P) { bnWhy('This animation has no preview yet.'); bnMark('none'); return; }
  const gen=++BN.gen; BN.on=true; BN.id=id; BN.P=P; BN.kind=P.kind; BN.ended=false; BN.playing=false; BN.len=null; BN.det=false; BN.hold=false; bnWhy('');
  if(BN.tl&&BN.tl.id!==id) { BN.tl=null; BN.tlKey=''; }
  bnMark('loading');
  if(BN.lastId!==id&&typeof B3C!=='undefined') { B3C.need.clear(); BN.lastId=id; }   // another animation: the last one's clips are let go now, not after their keep time. The same one asked again keeps its clips (a restart must not unload them)
  try { Math.random=BN.upd=bnRng(BN_SEED); bnFight(P); } catch(err) { bnWhy('The stub fight would not start: '+err.message); bnMark('none'); return; }
  const t0=performance.now(),warm=bnWarm(P),wait=()=>{
    if(!BN.on||BN.gen!==gen) return;
    bnWarm(P);   // asks again every 100 ms, so nothing it needs is let go while it loads
    if((!bnFightReady()||!warm())&&performance.now()-t0<10000) { BN.timer=setTimeout(wait,100); return; }
    BN.timer=setTimeout(()=>{ if(!BN.on||BN.gen!==gen) return;
      const key=id+'|'+(BN.answer?1:0);
      if(BN.tlKey!==key) { let sv=false; try { sv=bnSurvey(P,key); } catch(err) { gameFault('bench survey',err); } if(!sv) { bnWhy(BN.why||'The preview could not run this one.'); bnMark('none'); return; } }
      BN.gen++;   // the survey's callbacks belong to the old count; the live run is a new one
      // The survey ended the move, so the move let its video go; ask for it again and wait for it before the live run (same as the first wait).
      const t1=performance.now(),go=()=>{ if(!BN.on||BN.gen!==gen+1) return;
        const w2=bnWarm(P); if(!w2()&&performance.now()-t1<10000) { BN.timer=setTimeout(go,100); return; }
        const ok=bnBegin(P);
        if(ok) { BN.hold=false; bnMark('playing'); } else bnMark('none'); };
      go(); },again?50:350);
  };
  wait();
}
// ---------- the golden record (movebench3) ----------
// What one animation does in the stub fight, written down so later phases can prove nothing changed: the moment of each beat that touches someone, every hit stop (start, length, how many
// units it holds), every effect cue the engine armed (its moment, the contact moment inside the effects' own timeline, how many targets, and for each effect its id, layer and params), every
// stage step fired (moment, action, and the shake's size), every sound asked for, the videos the bar shows, the stage run's hit and marks, and the move's end. Times are seconds from the
// clock's start, rounded to a thousandth. The run is the survey's own (fixed seed, 1/60 s steps, nothing drawn), so the same engine gives the same record every time.
function bngSample() {
  const R=BNG.rec; if(typeof B3V==='undefined') return;
  for(const c of B3V.cues) if(!R.cues.has(c)) { R.cues.add(c);
    R.effects.push({t:Math.round((c.t0-BN.t0)*1000)/1000,impactMs:c.M.impact_ms,tgts:c.tgts.length,src:c.src,
      fx:c.M.vfx.map(id=>({id,layer:typeof p1Layer==='function'?p1Layer(id):null,params:(c.M.fxp&&c.M.fxp[id])||null,known:!!(typeof P1_VFX!=='undefined'&&P1_VFX[id])}))}); }
  for(const h of B3V.holds) if(!R.holds.has(h)) { R.holds.add(h); R.hold.push({t:Math.round((h.t0-BN.t0)*1000)/1000,dur:Math.round(h.dur*1000)/1000,units:h.keys.length}); }
}
function bngWait(P,ms) {
  return new Promise(res=>{ const t0=performance.now(),tick=()=>{ const warm=bnWarm(P); if((!bnFightReady()||!warm())&&performance.now()-t0<ms) { setTimeout(tick,100); return; } res(bnFightReady()&&warm()); }; tick(); });
}
async function bngRun(id) {
  const P=bnParse(id); if(!P) return {id,error:'no preview for this kind'};
  BN.golden=true;
  clearTimeout(BN.timer); BN.gen++; BN.on=true; BN.id=id; BN.P=P; BN.kind=P.kind; BN.answer=false; BN.loop=false; BN.ended=false; BN.playing=false; BN.hold=false;
  if(typeof B3C!=='undefined') B3C.need.clear();
  Math.random=BN.upd=bnRng(BN_SEED); bnFight(P);
  const loaded=await bngWait(P,20000);
  const faults0=(window.__faults||[]).length;
  BN.rec=bnRecNew();
  BNG.rec={cues:new Set(),holds:new Set(),beats:[],stage:[],effects:[],hold:[]};
  let out;
  try {
    if(!bnBegin(P)) return {id,error:BN.why||'the stub fight would not play it'};
    bnStepTo(bnRound(90));
    const len=Math.max(.3,(BN.fin?BN.doneAt:B3P.t-BN.t0)-.6),tl=bnTimeline(len),R=BN.rec,G=BNG.rec;
    const r3=x=>Math.round(x*1000)/1000;
    const lane=n=>{ const l=tl.lanes.find(q=>q.id===n); return l?l.segs.map(s=>({a:r3(s.a),b:r3(s.b),label:s.label,k:s.k})):[]; };
    out={id,kind:P.kind,loaded,finished:BN.fin,end:BN.fin?r3(BN.doneAt):null,len:r3(len),hit:tl.hit==null?null:r3(tl.hit),
      run:R.run?{hitAt:r3(R.run.hitAt-R.run.off),marks:Object.fromEntries(Object.entries(R.run.marks||{}).map(([k,v])=>[k,r3(v)])),budget:R.run.budget==null?null:R.run.budget,noVideo:!!R.run.noVideo}:null,
      beats:G.beats,hold:G.hold,effects:G.effects,stage:G.stage,sound:R.snd.map(s=>({t:r3(s.t),name:s.name})),
      video:lane('video'),wind:lane('wind'),ticks:tl.ticks.map(t=>({name:t.name,t:r3(t.t)})),faults:(window.__faults||[]).slice(faults0)};
  } finally { BN.golden=false; BN.rec=null; BNG.rec=null; BN.gen++; BN.playing=false; try { bnStop(); } catch(e) {} }
  return out;
}
// The animations the golden record covers: every family move, every monster attack with a video or a wind-up, every wind-up alone, every body state that has a video.
function bngIds() {
  const ids=[];
  for(const S of Object.values(B3_SKILLS)) if(S.vibe&&B3_VIBES[S.vibe]) ids.push('move:'+S.id);
  for(const f of Object.values(B3_FOES)) for(const a of f.acts) { if(a.hits==='attacker') continue;
    if(msClipOf('act:'+f.id+':'+a.id)||msWindClip(f.id,a.id)) ids.push('act:'+f.id+':'+a.id);
    if(msWindClip(f.id,a.id)&&bnParse('wind:'+f.id+':'+a.id)) ids.push('wind:'+f.id+':'+a.id); }
  for(const id of msStateIds()) if(bnParse(id)) ids.push(id);
  return ids;
}
// ---------- the clock ----------
function bnLoop(now) {
  requestAnimationFrame(bnLoop);
  const real=Math.min(.1,Math.max(0,(now-(BN.last||now))/1000)); BN.last=now;
  if(BN.on&&BN.P&&now-BN.warmAt>3000) { BN.warmAt=now; try { bnWarm(BN.P); } catch(e) {} }   // a paused or ended preview keeps what it shows loaded
  if(!BN.on||!B3.active||!BN.playing||BN.hold) return;
  let acc=real*BN.speed*BN.turbo; if(acc>0) BN.det=false;
  while(acc>1e-6&&BN.playing&&!BN.fin) { const d=Math.min(acc,.05); try { updateBattle(d); } catch(err) { gameFault('bench update',err); } acc-=d; }
  if(BN.fin&&BN.playing) { BN.fin=false; bnEnd(); return; }
  if(++BN.tick%6===0) bnSend();
}
// ---------- the controls the page calls ----------
function bnPause() { if(!BN.playing) return; BN.hold=true; bnMark('paused'); }
function bnResume() { if(BN.ended) { bnGo(BN.id,true); return; } if(BN.playing) { BN.hold=false; bnMark('playing'); } }
function bnSpeed(v) { BN.speed=v===.25||v===.5?v:1; bnSend(); }
function bnLoopSet(on) { BN.loop=!!on; if(on&&BN.ended&&BN.on) { const g=BN.gen; BN.timer=setTimeout(()=>{ if(BN.on&&BN.gen===g&&BN.loop&&BN.ended) bnGo(BN.id,true); },700); } bnSend(); }
function bnMute(on) { BN.mute=!!on; sound.enabled=!on; if(on&&'speechSynthesis'in window) { try { speechSynthesis.cancel(); } catch(e) {} } bnSend(); }
function bnAnswerSet(on) { on=!!on; if(BN.answer===on) return; BN.answer=on; if(BN.on&&BN.P&&BN.P.kind==='move') bnGo(BN.id,true); else bnSend(); }
// Draw the moment `sec` seconds into the animation, and stop there. The run is built again from the start and stepped to the moment, so the picture is the same one however the moment was reached.
function bnSeek(sec) {
  const P=BN.P; if(!P||!BN.on||!BN.tl||!BN.playing&&!BN.ended&&BN.state==='loading') return false;
  const len=BN.len!=null?BN.len:BN.tl.len,n=Math.max(0,Math.min(bnRound(len),bnRound(+sec||0)));
  clearTimeout(BN.timer); BN.hold=true; BN.seeks++;
  // Always built again from the start: a run that went on from an earlier moment would carry what the pictures drawn on the way spawned (a burst starts at its first drawn picture),
  // and the same moment must be the same picture however it was reached.
  BN.gen++; BN.ended=false; BN.playing=false;
  if(!bnBegin(P)) { bnMark('none'); return false; }
  bnStepTo(n); BN.det=true; BN.hold=true; BN.playing=true; BN.ended=false; BN.fin=false;
  bnMark('paused'); return true;
}
// One picture on from where the clock is, or one back: the next (or the last) twenty-fourth of a second.
function bnStep(dir) {
  if(!BN.on||!BN.tl) return false;
  const cur=BN.det&&BN.playing?BN.n*BN_STEP:Math.max(0,B3P.t-BN.t0);
  const pic=Math.floor(cur/BN_PICTURE+1e-6),to=(dir<0?(cur/BN_PICTURE-pic>1e-6?pic:pic-1):pic+1)*BN_PICTURE;
  return bnSeek(Math.max(0,to));
}
function bnStop() {
  BN.on=false; BN.playing=false; clearTimeout(BN.timer); BN.gen++; bnMark('idle');
  if(B3.active) { B3P.q.length=0; b3End(null); }
}
// ---------- the page talking ----------
function bnStatus() {
  const cur=BN.det&&BN.playing&&BN.hold?BN.n*BN_STEP:Math.max(0,B3P.t-BN.t0);
  return {bench:'status',id:BN.id,state:BN.state,speed:BN.speed,loop:BN.loop,mute:BN.mute,answer:BN.answer,t:cur,len:BN.len,msg:BN.msg,kind:BN.kind,
    noVideo:BN.kind==='move'&&typeof B3G!=='undefined'&&!!B3G.run&&!!B3G.run.noVideo,clips:typeof b3cLoaded==='function'?b3cLoaded():0,seeks:BN.seeks};
}
function bnSend() { const st=bnStatus(); try { const el=document.getElementById('bench-tag'); if(el) el.hidden=!st.noVideo||BN.state==='idle'; const pk=document.getElementById('bench-pink'); if(pk) pk.hidden=!(typeof B3G!=='undefined'&&B3G.pink)||BN.state==='idle'; } catch(e) {}
  try { if(parent&&parent!==window) parent.postMessage(st,location.origin); } catch(e) {} }
function bnSendTl() { try { if(BN.tl&&parent&&parent!==window) parent.postMessage(BN.tl,location.origin); } catch(e) {} }
// movebench5: the page sends a draft of a spec; it goes into the same table the game's data/move-specs.js fills (msSet) and the move plays again from the start. null puts the file's own back.
function bnSpecSet(id,live) {
  if(!id||typeof msSet!=='function') return;
  msSet(id,live==null?null:live);
  BN.tlKey='';   // the survey belongs to the old spec
  if(BN.on&&BN.id===id&&BN.P) bnGo(id,true); else bnSend();
}
window.addEventListener('message',ev=>{
  if(ev.origin!==location.origin) return;
  const m=ev.data; if(!m||typeof m.bench!=='string') return;
  if(m.bench==='play') { if(m.speed!=null) bnSpeed(m.speed); if(m.loop!=null) BN.loop=!!m.loop; if(m.mute!=null) bnMute(m.mute); if(m.answer!=null) BN.answer=!!m.answer; bnGo(m.id); }
  else if(m.bench==='pause') bnPause(); else if(m.bench==='resume') bnResume();
  else if(m.bench==='speed') bnSpeed(m.v); else if(m.bench==='loop') bnLoopSet(m.on); else if(m.bench==='mute') bnMute(m.on);
  else if(m.bench==='answer') bnAnswerSet(m.on);
  else if(m.bench==='seek') bnSeek(m.t); else if(m.bench==='step') bnStep(m.d);
  else if(m.bench==='spec') bnSpecSet(m.id,m.live);
  else if(m.bench==='sfx') { BN.sfxLog=(BN.sfxLog||[]).concat([String(m.name)]); if(!BN.mute) b3Sfx(String(m.name)); }   // movebench9: the page's Play button for a sound
  else if(m.bench==='stop') bnStop(); else if(m.bench==='ask') { bnSend(); bnSendTl(); }
});
requestAnimationFrame(bnLoop);
window.B3BENCH={specSet:bnSpecSet,BN,golden:bngRun,goldenIds:bngIds,preflight:bnPreflight,go:bnGo,pause:bnPause,resume:bnResume,speed:bnSpeed,loop:bnLoopSet,mute:bnMute,stop:bnStop,can:bnCan,parse:bnParse,status:bnStatus,seek:bnSeek,step:bnStep,timeline:()=>BN.tl,answerSet:bnAnswerSet};
