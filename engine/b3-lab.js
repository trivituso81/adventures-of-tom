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
function b3LabPaintedStates() {
  b3LabGo(0,{formation:null,foes:[{id:'mudling',row:'front'}],seed:7}); const F=B3.F,t0=performance.now(),steps=[];
  const alive=()=>B3.active&&B3.F===F,P=B3P,fighters=()=>F.party.filter(u=>BATTLE_SPRITES[u.id]);
  for(const id of ['tom','grace','rose','deedee']) {
    const nm=id.toUpperCase(),U=()=>F.party.find(u=>u.id===id),has=s=>!!b3PaintState(U(),s),word=x=>b3Word(nm+': '+x,'#fff1cb');
    const hit=()=>{ const k=U().key; P.body[k]={kind:'hit',t0:P.t,dur:B3_PAINT.hit.dur}; };
    steps.push(
      [()=>{ word('IDLE'); P.fidAt[U().key]=P.t+.4; },1.6],
      [()=>{ if(!has('guard')) return; word('GUARD'); b3AddStatus(F,U(),'guard_stance',{n:3}); b3ViewSync(); b3Render(); },1.5],
      [()=>{ if(!has('guard')) return; word('BRACED HIT'); P.body[U().key]={kind:'hit',guard:true,t0:P.t,dur:.4}; },1.1],
      [()=>{ if(!has('guard')) return; b3EndStatus(F,U(),'guard_stance'); b3ViewSync(); b3Render(); },.9],
      [()=>{ word('HIT'); hit(); },1.0],
      [()=>{ word('DODGE'); P.body[U().key]={kind:'dodge',t0:P.t,dur:B3_PAINT.dodge.dur}; },.9],
      [()=>{ word('KNOCKED OUT'); const k=U().key; B3.view.u[k].ko=true; P.body[k]={kind:'ko',t0:P.t,dur:1e9}; },2.2],
      [()=>{ word('GET UP'); const k=U().key; B3.view.u[k].ko=false; delete P.body[k]; b3GetUp(k,P.t); },1.3],
      [()=>{ word('VICTORY'); P.cheerKey=U().key; P.cheerAt=null; },1.8],
      [()=>{ P.cheerKey=null; word('RUN'); const u=U(),h=b3PartyHome(u),f=B3_BODY.dash,k=u.key;
        P.body[k]={kind:'path',t0:P.t,dur:1.4,keys:[{t:0,x:h.cx,y:h.base,f},{t:.6,x:h.cx-110,y:h.base,f},{t:.75,x:h.cx-110,y:h.base,f},{t:1.4,x:h.cx,y:h.base,f}]}; },1.8]);
  }
  let i=0;
  const go=()=>{ if(!alive()) return;
    if(battle.state!=='command'||performance.now()-t0<2200) { setTimeout(go,150); return; }
    if(i>=steps.length) { b3Exit(); return; }
    const [fn,sec]=steps[i++]; fn(); setTimeout(go,sec*1000); };
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
    return [...B3_LAB.map((L,i)=>({name:L.name,sub:L.sub,cast:L.party,act:()=>b3LabGo(i)})),
      {name:'PAINTED STATES: CHAPTER 1',sub:'The family against one Mudling. Each fighter in turn shows idle, guard, braced hit, hit, dodge, knocked out and get up, victory and a run. About 1 minute. Painted poses moved by the game, no video.',cast:['tom','grace','rose','deedee'],act:b3LabPaintedStates},
      {name:'VIBES AND RANKS',sub:'Main and Pocket Vibe, Quirks and rows for these fights. '+(r?'Every Vibe is Rank '+r+'.':'The Vibes are at different Ranks.'),cls:'nav',vibes:true,act:()=>b3vOpen('lab')},
      {name:'BACK',sub:'',cls:'back',act:splashBack}]; }};
SPLASH_PARENT.lab3='lab';
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3,B3P,B3_LAB,b3Start,b3Lab,b3LabGo,b3LabPaintedStates,b3End,b3Dir,b3A,b3Back,b3Pick,b3Commit,b3Auto,b3OpenInfo}); });
