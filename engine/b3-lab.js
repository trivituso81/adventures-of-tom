'use strict';
// engine/b3-lab.js — Battle 3 in the Battle Lab: ADMIN > BATTLE LAB > NEW BATTLE lists the fights in data/b3-lab.js.
// The old boss fights (battle 2) stay on the same Lab pages until battle 2 is removed.
// A Lab fight uses the Lab's own loadouts (engine/b3-menu.js b3LabBook: Main and Pocket Vibe, Quirks, Ranks, rows), set on
// NEW BATTLE > VIBES AND RANKS. The fight gets a copy, and a win pays its formation's Vibe Points into the Lab's book.
function b3Lab(i,opt) {
  const L=B3_LAB[i]; if(!L) return;
  const vp=(B3_FORMATIONS[L.formation]||{}).vp||0;
  b3Start(Object.assign({lab:true,party:L.party.slice(),level:L.level,formation:L.formation,bg:L.bg,rows:L.rows,
    loadouts:JSON.parse(JSON.stringify(b3LabBook())),award:()=>b3LabAward(vp),onEnd:b3LabBack,ruckus:b3LabRuckus(),onRuckus:b3LabRuckusSave},opt||{}));
}
// The Family Ruckus gauge keeps its value between Lab fights (spec 2.10), on this device. A saved game keeps its own (stage 15 joins them).
const B3_RUCKUS_KEY='aot-b3-ruckus';
function b3LabRuckus() { try { const v=Number(JSON.parse(localStorage.getItem(B3_RUCKUS_KEY)||'0')); return v>0?Math.min(B3_RULES.ruckus.full,Math.round(v)):0; } catch(e) { return 0; } }
function b3LabRuckusSave(v) { try { localStorage.setItem(B3_RUCKUS_KEY,JSON.stringify(Math.round(v||0))); } catch(e) {} }
// Leave the title screen and start Lab fight i.
function b3LabGo(i,opt) {
  sfx.select(); unlockAudio(); splash.active=false;
  const el=$('splash'); el.classList.add('out');
  setTimeout(()=>{ if(!splash.active) el.hidden=true; },450);
  b3Lab(i,opt);
}
// PAINTED STATES: CHAPTER 1 (clipposes, 2026-11-19): the four fighters against one Mudling. In turn each fighter shows every painted body state
// (B3_BODY_PAINT in data/b3-clips.js) with its name on screen: idle fidget, guard, a braced hit, hit, dodge, knocked out and get up, victory, a run across.
// Then the fight ends and the list comes back. The states are driven straight onto the screen; nobody takes a turn.
// fix-clipposes: the fighter walks out to a clear spot in front of the family (STAGE), shows every state there, drawn on top, and walks home.
// fix-clipposes-2 (Tom: "way too fast"): after each state the run holds on the review panel (engine/pose-review.js): WATCH AGAIN, an optional
// note, REJECT or APPROVE; nothing else plays until he answers. The run is played at 1x whatever the battle speed (2x also sped these poses up).
const B3_LAB_STAGE={cx:318,base:300};   // battle pixels: between the Mudling and the family, clear of both, inside the phone's view
function b3LabPaintedStates(opt) {
  b3LabGo(0,{formation:null,foes:[{id:'mudling',row:'front'}],seed:7}); const F=B3.F,t0=performance.now(),steps=[],expect=[];
  const alive=()=>B3.active&&B3.F===F,P=B3P,speed0=B7.speed; B7.speed=1;
  const later=(fn,sec)=>setTimeout(()=>{ if(alive()) fn(); },sec*1000);
  for(const id of ['tom','grace','rose','deedee']) {
    const nm=id.toUpperCase(),U=()=>F.party.find(u=>u.id===id),key=()=>U().key,word=x=>b3Word(nm+': '+x,'#fff1cb');
    const walk=(x0,x1,y0,y1)=>{ P.body[key()]={kind:'path',t0:P.t,dur:.7,keys:[{t:0,x:x0,y:y0,f:B3_BODY.dash},{t:.7,x:x1,y:y1,f:B3_BODY.dash}]}; };
    const guardOn=()=>{ if(!U().st.guard_stance) { b3AddStatus(F,U(),'guard_stance',{n:3}); b3ViewSync(); b3Render(); } };
    const guardOff=()=>{ if(U().st.guard_stance) { b3EndStatus(F,U(),'guard_stance'); b3ViewSync(); b3Render(); } };
    const koOn=(held)=>{ const k=key(); B3.view.u[k].ko=true; P.body[k]={kind:'ko',t0:held?P.t-30:P.t,dur:1e9}; };
    // A state: play() shows it, sec later end() puts the fighter back (KO stays down while he answers). WATCH AGAIN plays it once more.
    const S=[
      {k:'idle',label:'IDLE',sec:1.6,play:()=>{ P.fidAt[key()]=P.t+.4; }},
      {k:'guard',label:'GUARD',sec:1.5,guard:1,play:()=>{ guardOff(); later(guardOn,.15); }},
      {k:'braced',label:'BRACED HIT',sec:1.2,guard:1,play:()=>{ guardOn(); P.body[key()]={kind:'hit',guard:true,t0:P.t,dur:.4}; },end:guardOff},
      {k:'hit',label:'HIT',sec:1.0,play:()=>{ P.body[key()]={kind:'hit',t0:P.t,dur:B3_PAINT.hit.dur}; }},
      {k:'dodge',label:'DODGE',sec:.9,play:()=>{ P.body[key()]={kind:'dodge',t0:P.t,dur:B3_PAINT.dodge.dur}; }},
      {k:'ko',label:'KNOCKED OUT',sec:2.2,play:()=>{ delete P.body[key()]; B3.view.u[key()].ko=false; koOn(false); }},
      {k:'getup',label:'GET UP',sec:1.3,play:()=>{ const go=()=>{ const k=key(); B3.view.u[k].ko=false; delete P.body[k]; b3GetUp(k,P.t); };
        if(B3.view.u[key()].ko) go(); else { koOn(true); later(go,.5); } },again:1.8},
      {k:'victory',label:'VICTORY',sec:1.8,play:()=>{ P.cheerKey=key(); P.cheerAt=null; },end:()=>{ P.cheerKey=null; }},
      {k:'run',label:'RUN',sec:1.8,play:()=>{ const u=U(),h=b3PartyHome(u),f=B3_BODY.dash;
        P.body[u.key]={kind:'path',t0:P.t,dur:1.4,keys:[{t:0,x:h.cx,y:h.base,f},{t:.6,x:h.cx-80,y:h.base,f},{t:.75,x:h.cx-80,y:h.base,f},{t:1.4,x:h.cx,y:h.base,f}]}; }}];
    // Tom starts every fight in guard (his kit's battleStart), which would draw IDLE, HIT and DODGE from the guard pose: drop it first.
    steps.push({fn:()=>{ guardOff(); const h=b3PartyHome(U()); walk(h.cx,B3_LAB_STAGE.cx,h.base,B3_LAB_STAGE.base); },sec:.75},
      {fn:()=>{ delete P.body[key()]; P.stage={key:key(),cx:B3_LAB_STAGE.cx,base:B3_LAB_STAGE.base}; },sec:.05});
    for(const st of S) {
      if(st.guard&&!b3PaintState(U(),'guard')) continue;
      const rk=id+'.'+st.k; expect.push(rk);
      const show=()=>{ word(st.label); st.play(); };
      steps.push({fn:show,sec:st.sec,end:st.end,review:{key:rk,who:nm,label:st.label,again:cb=>{ show(); later(()=>{ if(st.end) st.end(); cb(); },st.again||st.sec); }}});
    }
    steps.push({fn:()=>{ delete P.body[key()]; P.stage=null; const h=b3PartyHome(U()); walk(B3_LAB_STAGE.cx,h.cx,B3_LAB_STAGE.base,h.base); },sec:.8},
      {fn:()=>{ delete P.body[key()]; },sec:.05});
  }
  prvStart('ch1',expect); if(opt&&opt.auto) PRV.auto=opt.auto; else PRV.auto=null;
  const counts={ok:0,no:0}; let i=0,n=0;
  let over=false; const quit=()=>{ if(over) return; over=true; clearInterval(watch); prvClose(); B7.speed=speed0; };
  const watch=setInterval(()=>{ if(!alive()) quit(); },250);   // EXIT or STOP while the panel waits: close it and put the speed back
  const go=()=>{ if(!alive()) { quit(); return; }
    if(battle.state!=='command'||performance.now()-t0<2200) { setTimeout(go,150); return; }
    if(i>=steps.length) { P.stage=null; prvEnd(counts,()=>{ quit(); if(alive()) b3Exit(); }); return; }
    const s=steps[i++]; s.fn();
    setTimeout(()=>{ if(!alive()) { quit(); return; } if(s.end) s.end();
      if(!s.review) { go(); return; }
      prvAsk(Object.assign({n:++n,of:expect.length},s.review),v=>{ counts[v==='approve'?'ok':'no']++; if(alive()) go(); else quit(); });
    },s.sec*1000); };
  setTimeout(go,150);
}
// PROOF: GRACE'S GUARD (VIDEO) (wanproof, claude/video-battle-plan.md 4.5): Grace alone against one Mudling. Her guard is the Wan video
// grace_guard (kind guard, engine/b3-clips.js b3cGuardFrame) and, in this row only, her standing picture is that video's first picture,
// so the eye never sees a switch between two drawings. The rise plays once, the held guard loops, a braced hit nudges her back, the
// lowering plays once. Three rounds, then the list comes back. Nobody takes a turn; only this one clip is loaded for her.
const B3_PROOF={rounds:3,stand:1.6,hold:3.2,hit:.4,after:1.4,down:2.2};
function b3LabGuardProof(opt) {   // opt.manual: set the fight up and play nothing (tools/wanproof_test.py drives it)
  b3LabGo(0,{party:['grace'],formation:null,foes:[{id:'mudling',row:'front'}],seed:7,onEnd:()=>{ B3C.over=null; B3C.gs={}; b3LabBack(); }});
  const F=B3.F,t0=performance.now(),P=B3P,speed0=B7.speed; B7.speed=1;
  B3C.over={F,map:{grace:{guard:'grace_guard'}}}; B3C.gs={}; b3cWant('grace_guard',60000);
  const alive=()=>B3.active&&B3.F===F,U=()=>F.party.find(u=>u.id==='grace'),word=x=>b3Word('GRACE: '+x,'#fff1cb');
  const guard=on=>{ const u=U(); if(!u) return; if(on&&!u.st.guard_stance) b3AddStatus(F,u,'guard_stance',{n:3}); else if(!on&&u.st.guard_stance) b3EndStatus(F,u,'guard_stance'); b3ViewSync(); b3Render(); };
  const K=B3_PROOF,steps=[{fn:()=>{ guard(false); word('STANDING'); },sec:K.stand}];
  for(let r=0;r<K.rounds;r++) steps.push({fn:()=>{ word('GUARD'); guard(true); },sec:K.hold},
    {fn:()=>{ word('BRACED HIT'); P.body[U().key]={kind:'hit',guard:true,t0:P.t,dur:K.hit}; },sec:K.after},
    {fn:()=>{ word('GUARD DOWN'); guard(false); },sec:K.down});
  if(opt&&opt.manual) { B7.speed=speed0; return; }
  let i=0;
  const go=()=>{ if(!alive()) { B7.speed=speed0; return; }
    if(battle.state!=='command'||performance.now()-t0<2200||!bclipReady('grace_guard')) { setTimeout(go,150); return; }
    if(i>=steps.length) { B7.speed=speed0; b3Exit(); return; }
    const s=steps[i++]; s.fn(); setTimeout(go,s.sec*1000); };
  setTimeout(go,150);
}
// Back on the NEW BATTLE list after a fight (win, lose or EXIT).
function b3LabBack() {
  const el=$('splash'); if(!el) return;
  el.hidden=false; el.classList.remove('out');
  splash.active=true; splashSetMode('lab3');
  splash.last=performance.now(); requestAnimationFrame(splashFrame);
}
SPLASH_MODES.lab3={tab:'Battle Lab: new battle',cue:'A / Enter to fight. B / Esc to go back',
  text:'The new battle system, one stage at a time. New: Vibes. Everyone has a Main and a Pocket Vibe. Change them under VIBES AND RANKS.',
  choices:()=>{ const r=b3LabRank();
    return [
      {name:"PROOF: GRACE'S GUARD (VIDEO)",sub:'Grace against one Mudling. Her guard is a video made by Wan 3.0: watch it go up, take a hit and come down, three times (about 30 seconds). Then the list comes back.',cast:['grace'],act:()=>b3LabGuardProof()},
      ...B3_LAB.map((L,i)=>({name:L.name,sub:L.sub,cast:L.party,act:()=>b3LabGo(i)})),
      {name:'PAINTED STATES: CHAPTER 1',sub:'The family against one Mudling. Each fighter in turn shows idle, guard, braced hit, hit, dodge, knocked out and get up, victory and a run. After each one it waits: watch again, add a note, then APPROVE or REJECT. Your answers go to Claude.',cast:['tom','grace','rose','deedee'],act:()=>b3LabPaintedStates()},
      {name:'VIBES AND RANKS',sub:'Main and Pocket Vibe, Quirks and rows for these fights. '+(r?'Every Vibe is Rank '+r+'.':'The Vibes are at different Ranks.'),cls:'nav',vibes:true,act:()=>b3vOpen('lab')},
      {name:'BACK',sub:'',cls:'back',act:splashBack}]; }};
SPLASH_PARENT.lab3='lab';
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3,B3P,B3_LAB,b3Start,b3Lab,b3LabGo,b3LabPaintedStates,b3LabGuardProof,b3End,b3Dir,b3A,b3Back,b3Pick,b3Commit,b3Auto,b3OpenInfo}); });
