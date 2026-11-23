'use strict';
// engine/b3-repick.js — Battle 3, stage 22 chapter 20: the screen side of the last fight's "pick your four again" (rules: engine/b3-last.js b3Repick).
// When a phase ends and the fight has a bench (`reserve`), b3Flow stops here: a page lists all eight (who is in, who is on the bench, the HP and Pep each would
// come back with, FRESH for a newcomer), the player taps four, CONTINUE swaps them in, and the fight goes on. In an auto fight (the Lab's Rose Mode test, the chapter test) the
// rules pick for the player (b3RepickAuto). Nothing here touches a rule: the page only asks b3Repick for what the player chose.
const B3R={pick:null,box:null};

// Called by b3Flow when the rules say the player may pick again. Returns true when it took over the flow (the page, or an auto pick, carries on from here).
function b3RepickStart() {
  const F=B3.F; if(!F||!F.repick||F.over) return false;
  if(B3.cfg.auto||B3.cfg.autoRepick) { const r=b3RepickAuto(F); if(r.ok) b3RepickPlay(r.beats); else { F.repick=null; return false; } return true; }
  B3.ui='busy'; battle.state='busy'; B3.actor=null;
  B3R.pick=F.party.map(p=>p.id);
  b3RepickOpen();
  return true;
}
function b3RepickOpen() {
  const F=B3.F,app=$('b3-app'); if(!app) return;
  b3RepickClose();
  const box=document.createElement('div'); box.id='b3-repick'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Pick your four');
  const seats=F.party.length,ph=F.repick.phase;
  const sayPhase=ph===2?'PHASE 2: THE LENSES':ph===3?'PHASE 3: THE COUNTDOWN':'PHASE '+ph;
  box.innerHTML='<div class="rp-head"><b class="rp-ph">'+b2Esc(sayPhase)+'</b><span class="rp-sub">Pick your four. Someone new comes in at full HP and 4 Pep. Someone who was in before comes back with the HP and Pep they left with.</span></div>'
    +'<div class="rp-grid"></div><div class="rp-foot"><span class="rp-count"></span><button type="button" class="rp-go">CONTINUE</button></div>';
  app.appendChild(box); B3R.box=box;
  box.querySelector('.rp-go').addEventListener('click',b3RepickDone);
  b3RepickRender(seats);
}
function b3RepickRender(seats) {
  const F=B3.F,box=B3R.box; if(!box) return;
  seats=seats||F.party.length;
  const grid=box.querySelector('.rp-grid'),L=b3RepickList(F);
  grid.innerHTML=L.map(r=>{
    const on=B3R.pick.includes(r.id),hp=r.fresh?'FULL HP':r.ko?'KNOCKED OUT':r.hp+' / '+r.maxHp+' HP',tag=r.fresh?'FRESH':r.here?'IN NOW':'BENCH';
    return '<button type="button" class="rp-m'+(on?' on':'')+(r.ko?' ko':'')+'" data-id="'+b2Esc(r.id)+'" aria-pressed="'+on+'"><b class="rp-n">'+b2Esc(r.name)+'</b>'
      +'<span class="rp-t">'+tag+'</span><span class="rp-h">'+hp+'</span><span class="rp-p">'+r.pep+' Pep</span></button>'; }).join('');
  for(const el of grid.querySelectorAll('.rp-m')) el.addEventListener('click',()=>{ const id=el.dataset.id,i=B3R.pick.indexOf(id);
    if(i>=0) B3R.pick.splice(i,1); else if(B3R.pick.length<seats) B3R.pick.push(id); else { b3Sfx('nope'); return; }
    b3Sfx('select'); b3RepickRender(seats); });
  box.querySelector('.rp-count').textContent=B3R.pick.length+' of '+seats+' picked';
  box.querySelector('.rp-go').disabled=B3R.pick.length!==seats;
}
function b3RepickClose() { if(B3R.box&&B3R.box.parentNode) B3R.box.parentNode.removeChild(B3R.box); B3R.box=null; }
function b3RepickDone() {
  const F=B3.F; if(!F||!F.repick||B3R.pick.length!==F.party.length) return;
  const r=b3Repick(F,B3R.pick.slice());
  if(!r.ok) { b3Sfx('nope'); return; }
  b3RepickClose(); b3RepickPlay(r.beats);
}
// The swap is played (the new faces walk in), then the fight waits for the newcomers' pictures, 5 seconds at most, like the opening does.
function b3RepickPlay(beats) {
  b3Play(beats,()=>{
    if(!B3.active) return;
    b3ViewSync(); b3LayoutFoes(); b3RenderParty(); b3RenderBar();
    if(typeof paintedFightReady==='function') paintedTick();
    const t0=performance.now(),go=()=>{ if(!B3.active) return; if(typeof paintedFightReady==='function'&&!paintedFightReady()&&performance.now()-t0<5000) { b3After(.1,go); return; } b3Flow(); };
    go();
  });
}
