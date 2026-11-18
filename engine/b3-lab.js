'use strict';
// engine/b3-lab.js — Battle 3 in the Battle Lab: ADMIN > BATTLE LAB > NEW BATTLE lists the fights in data/b3-lab.js.
// The old boss fights (battle 2) stay on the same Lab pages until battle 2 is removed.
function b3Lab(i,opt) {
  const L=B3_LAB[i]; if(!L) return;
  b3Start(Object.assign({lab:true,party:L.party.slice(),level:L.level,formation:L.formation,bg:L.bg,onEnd:b3LabBack},opt||{}));
}
// Leave the title screen and start Lab fight i.
function b3LabGo(i) {
  sfx.select(); unlockAudio(); splash.active=false;
  const el=$('splash'); el.classList.add('out');
  setTimeout(()=>{ if(!splash.active) el.hidden=true; },450);
  b3Lab(i);
}
// Back on the NEW BATTLE list after a fight (win, lose or EXIT).
function b3LabBack() {
  const el=$('splash'); if(!el) return;
  el.hidden=false; el.classList.remove('out');
  splash.active=true; splashSetMode('lab3');
  splash.last=performance.now(); requestAnimationFrame(splashFrame);
}
SPLASH_MODES.lab3={tab:'Battle Lab: new battle',cue:'A / Enter to fight. B / Esc to go back',
  text:'The new battle system, one stage at a time. These fights use the new rules: the turn bar, Pep, flavors, Primes and Detonations.',
  choices:()=>[...B3_LAB.map((L,i)=>({name:L.name,sub:L.sub,cast:L.party,act:()=>b3LabGo(i)})),{name:'BACK',sub:'',cls:'back',act:splashBack}]};
SPLASH_PARENT.lab3='lab';
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3,B3P,B3_LAB,b3Start,b3Lab,b3End,b3Dir,b3A,b3Back,b3Pick,b3Commit,b3Auto}); });
