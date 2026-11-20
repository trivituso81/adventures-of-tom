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
// clipreset proof (2026-11-19): NEW 1 with Grace alone (nobody stands in front of her), put in Guard Stance once the first command menu is up,
// so the move into her painted guard shows. She holds it until her third turn ends, sinks back into it after her own moves, and takes hits braced.
// Tom judges this one row before any other body state is changed (board card t-clipreset).
function b3LabGuardProof() {
  b3LabGo(0,{party:['grace']}); const F=B3.F,t0=performance.now();
  const go=()=>{ if(!B3.active||B3.F!==F) return;
    if(battle.state!=='command'||performance.now()-t0<2200) { setTimeout(go,150); return; }
    const g=F.party.find(u=>u.id==='grace'); if(!g) return;
    b3AddStatus(F,g,'guard_stance',{n:3}); b3ViewSync(); b3Render(); b3Say('Grace takes Guard Stance: her painted guard pose, moved by the game. No video.'); };
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
      {name:"PROOF: GRACE'S GUARD",sub:'Clip reset proof. Grace alone against two Mudlings. She guards with her painted guard pose, moved by the game, not a video.',cast:['grace'],act:b3LabGuardProof},
      {name:'VIBES AND RANKS',sub:'Main and Pocket Vibe, Quirks and rows for these fights. '+(r?'Every Vibe is Rank '+r+'.':'The Vibes are at different Ranks.'),cls:'nav',vibes:true,act:()=>b3vOpen('lab')},
      {name:'BACK',sub:'',cls:'back',act:splashBack}]; }};
SPLASH_PARENT.lab3='lab';
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3,B3P,B3_LAB,b3Start,b3Lab,b3LabGo,b3LabGuardProof,b3End,b3Dir,b3A,b3Back,b3Pick,b3Commit,b3Auto,b3OpenInfo}); });
