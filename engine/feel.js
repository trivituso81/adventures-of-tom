'use strict';
// engine/feel.js — F7, feel and accessibility (battle-design sections 10 and 11):
//   difficulty modes (Rose / Grace / Director), 1x / 2x battle speed, Smart Repeat auto-battle, the optional High-Five
//   timing, Rose Mode's recommended move and Deedee's emergency pie, the victory card, wandering map monsters that
//   chase Tom, the overlevel instant win, and the OPTIONS page of the pause menu.
// Settings live in this browser (aot-diff, aot-speed, aot-hf, aot-autospend), shared by every save. Loaded after engine/progress.js.

const B7_DIFF={
  rose:{id:'rose',name:'ROSE MODE',sub:'Story and kid assist',
    text:'Monsters hit half as hard and have 25% less HP. High-Fives always land. A gold glow shows a good move each turn. If everyone gets knocked out, Deedee tosses in a Rhubarb Pie and everyone gets back up (once a fight).',
    taken:.5,foeHp:.75,autoHf:true,recommend:true,pie:true,pictures:true},
  grace:{id:'grace',name:'GRACE MODE',sub:'Classic, the standard game',
    text:'The game as designed: monsters at full strength, boss shields as written, snacks whenever you like.'},
  director:{id:'director',name:'DIRECTOR MODE',sub:'Tactical challenge',
    text:'Monsters hit twice as hard, have 30% more HP and take turns 40% more often. Regular monsters level up to stay within 2 levels of Tom, so grinding never makes them easy. Boss shields need one more hit, and a Tombo counts as one hit instead of breaking them. One snack per round.',
    taken:2,foeHp:1.3,foeSpeed:1.4,catchUp:2,shieldPlus:1,tomboHit:true,snackRound:true}
};
// Every mode multiplies the finished numbers (damage taken, monster HP, monster turn speed), so the gap between modes is
// the same size in every chapter. (It used to scale monster POW, which the damage formula mostly cancelled out.)
const B7_HF={mult:1.15,heart:5,open:.5,len:.6};               // the High-Five window, in battle seconds after a move starts
const B7_MON={radius:2,leash:5,sight:4,chaseStep:.3,wanderStep:.62,over:5,popXp:.5};   // popXp: a tap-kill (overlevel instant win) pays this share of a real win's XP
const B7={diff:'grace',speed:1,hf:true,auto:false,last:{},rec:null,hfWin:null,autoTimer:0,card:null,cardTimers:[],mapFx:[],noEngage:0,lastMap:null};

// ---------- Settings ----------
(function b7Load() {
  try {
    const d=localStorage.getItem('aot-diff'); if(B7_DIFF[d]) B7.diff=d;
    B7.speed=localStorage.getItem('aot-speed')==='2'?2:1;
    B7.hf=localStorage.getItem('aot-hf')!=='off';
    B7.autoSpend=localStorage.getItem('aot-autospend')!=='off';
  } catch(e) {}
})();
function b7Save() {
  try { localStorage.setItem('aot-diff',B7.diff); localStorage.setItem('aot-speed',String(B7.speed)); localStorage.setItem('aot-hf',B7.hf?'on':'off'); localStorage.setItem('aot-autospend',B7.autoSpend===false?'off':'on'); } catch(e) {}
}
const b7Diff=()=>B7_DIFF[B7.diff]||B7_DIFF.grace;
const b7Speed=()=>battle.active?B7.speed:1;
const b7Taken=()=>b7Diff().taken||1;
const b7FoeHp=()=>b7Diff().foeHp||1;
const b7FoeSpeed=()=>b7Diff().foeSpeed||1;
// Timers inside move animations follow the battle speed.
function b7Later(fn,ms) { return setTimeout(fn,(ms||0)/b7Speed()); }
function b7SetDiff(id) {
  if(!B7_DIFF[id]) return; B7.diff=id; b7Save();
  if(id==='rose') { roseSpendAll(); if(typeof autoGear==='function') autoGear(ALL_MEMBERS()); if(typeof b6Badge==='function') b6Badge(); }   // switching to Rose Mode spends anything waiting
}
// Options also ride along in every save (engine/followers.js): Safari can wipe this frame's browser storage when the
// app closes, which used to put the game back on Grace Mode at every launch. Loading a save brings them back.
const b7Opts=()=>({diff:B7.diff,speed:B7.speed,hf:B7.hf,autoSpend:B7.autoSpend!==false,volMusic:sound.vol.music,volFx:sound.vol.fx});
function b7ApplyOpts(o) {
  if(!o) return;
  if(B7_DIFF[o.diff]) B7.diff=o.diff;
  if(o.speed===1||o.speed===2) B7.speed=o.speed;
  if(typeof o.hf==='boolean') B7.hf=o.hf;
  if(typeof o.autoSpend==='boolean') B7.autoSpend=o.autoSpend;
  if(o.volMusic>=1&&o.volMusic<=10) setVolume('music',o.volMusic);
  if(o.volFx>=1&&o.volFx<=10) setVolume('fx',o.volFx);
  b7Save();
}
function b7ToggleSpeed() { B7.speed=B7.speed===2?1:2; b7Save(); sfx.select(); b7SyncTools(); if(B2.active) b2Msg('Battle speed '+B7.speed+'x.'); }
function b7ToggleAuto() {
  if(!B2.active) return;
  B7.auto=!B7.auto; sfx.select(); b7SyncTools();
  if(B7.auto) { b2Msg('Smart Repeat on. Everyone repeats their last move. Tap AUTO to take over.'); b7AutoTurn(); }
  else { clearTimeout(B7.autoTimer); b2Msg('Smart Repeat off. Your call.'); }
}

// ---------- Battle start and end ----------
function b7BattleStart() {
  B7.auto=false; B7.rec=null; B7.hfWin=null; clearTimeout(B7.autoTimer); b7CloseCard(true);
  b7SyncTools();
}
function b7AfterBattle(result) {
  const now=performance.now();
  B7.auto=false; B7.hfWin=null; clearTimeout(B7.autoTimer); b7CloseCard(true);
  const T=$('b7-tools'); if(T) T.hidden=true;
  // A breather before map monsters can engage again; a monster that won or was run from leaves Tom alone a while.
  B7.noEngage=now+3500;
  const npc=B2.cfg&&B2.cfg.npc;
  if(npc) { npc.chasing=false; if(result!=='win') npc.chaseOff=now+9000; }
}

// ---------- Smart Repeat (AUTO) ----------
function b7Note(u,act,opt) {
  if(u.side!=='party') return;
  if(act.item&&b7Diff().snackRound) { const w=b2LiveParty().filter(p=>p!==u); B2.snackWait=w.length?new Set(w):null; }
  if(act.run||act.item||act.tombo||!act.key) return;
  B7.last[u.id]={key:act.key,t:opt&&opt.primary||null};
}
function b7FindAct(u,key) { const k=u.kit; return [k.basic,k.special,...k.skills].find(a=>a&&a.key===key); }
const b7HealOnly=a=>!!a&&!a.stat&&(a.fx||[]).some(f=>f[0]==='heal'||f[0]==='revive');
function b7AutoPick(u) {
  const live=b2LiveParty();
  const hurt=B2.party.some(p=>p.hp<=0)||live.some(p=>p.hp<p.maxHp*.75);
  const L=B7.last[u.id];
  let act=L&&b7FindAct(u,L.key);
  // Smart: no heals when nobody is hurt, nothing it cannot pay for.
  if(act&&(b2Cost(u,act)>u.vp||b2Shushed(u,act)||(b7HealOnly(act)&&!hurt))) act=null;
  let opts=act?b2TargetOptions(act,u):[];
  if(!opts.length) { act=u.kit.basic; opts=b2TargetOptions(act,u); }
  if(!opts.length) return null;
  let o=L&&L.t?opts.find(x=>x.primary===L.t):null;
  if(!o) {
    const single=opts.filter(x=>x.primary);
    if(single.length) o=single.slice().sort((a,b)=>a.primary.ally||a.ally?(a.primary.hp/a.primary.maxHp-b.primary.hp/b.primary.maxHp):(a.primary.hp-b.primary.hp))[0];
    else o=opts[0];
    if(opts[0].ally&&!act.kindFoe) { const al=opts.filter(x=>x.primary&&x.primary.side==='party'); if(al.length) o=al.sort((a,b)=>a.primary.hp/a.primary.maxHp-b.primary.hp/b.primary.maxHp)[0]; }
  }
  return {act,opt:o};
}
function b7AutoTurn() {
  clearTimeout(B7.autoTimer);
  if(!B7.auto||!B2.active||B2.ui!=='cross'||battle.state!=='command') return;
  const u=B2.actor; if(!u||u.side!=='party') return;
  B7.autoTimer=setTimeout(()=>{
    if(!B7.auto||!B2.active||B2.actor!==u||B2.ui!=='cross'||battle.state!=='command') return;
    const c=b7AutoPick(u); if(!c) return;
    sfx.select(); b2Do(c.act,c.opt);
  },650/b7Speed());
}

// ---------- High-Five (optional timing) ----------
// A sparkle pops over the attacker about when the move lands; tap the screen or press A while it shows: +15% and +5 HEART.
// Rose Mode always lands it. Pressing too early uses it up.
function b7HfOpen(M) {
  B7.hfWin=null;
  if(!M||!M.u||M.u.side!=='party') return;
  if(!B7.hf&&!b7Diff().autoHf) return;
  const helps=M.waves.length||(M.act.fx||[]).some(f=>f[0]==='heal')||(b8KindNum(M.act)&&M.targets.some(t=>t.side==='foe'));   // an Option 3 Warmth packet scales too
  if(!helps) return;
  B7.hfWin={M,t:0,open:B7_HF.open,close:B7_HF.open+B7_HF.len*B7.speed,done:false,ok:false};
}
function b7HighFive() {
  const W=B7.hfWin; if(!W||W.done) return false;
  if(B2.move!==W.M) { B7.hfWin=null; return false; }
  W.done=true;
  if(W.t<W.open) return false;   // too early: that one is gone
  W.ok=true; const M=W.M; M.hf=true;
  for(const w of M.waves) for(const e of w) if(e.done<e.dmg) e.dmg=Math.round(e.dmg*B7_HF.mult);
  b2Heart(B7_HF.heart);
  const q=BATTLE_POS[M.u.idx]||{x:150,base:80};
  battle.texts.push({txt:'HIGH FIVE!',x:Math.min(170,Math.max(22,q.x)),y:Math.max(12,q.base-50),color:'#ffe08a',sc:2,t:0,dur:1});
  W.flashT=0;
  if(sfx.levelUp) sfx.levelUp();
  b2Render();
  return true;
}
function b7Update(dt) {
  const W=B7.hfWin; if(!W) return;
  if(B2.move!==W.M) { B7.hfWin=null; return; }
  W.t+=dt; if(W.flashT!=null) W.flashT+=dt;
  if(!W.done&&W.t>=W.open&&b7Diff().autoHf) b7HighFive();
  if(W.t>W.close+.5) B7.hfWin=null;
}
function b7DrawOverlay(t) {
  const W=B7.hfWin; if(!W) return;
  const u=W.M.u,q=BATTLE_POS[u.idx]; if(!q) return;
  const sp=BATTLE_SPRITES[(W.M.tom&&W.M.tom.id)||u.id]||BATTLE_SPRITES.tom;
  const x=q.x*3,y=q.base*3-sp.idle.length*sp.scale-34;
  const star=(cx,cy,r,c)=>{ gfx.fillStyle=c; gfx.beginPath(); for(let k=0;k<8;k++) { const a=k*Math.PI/4+t*3,rr=k%2?r*.38:r; gfx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); } gfx.closePath(); gfx.fill(); };
  if(W.ok&&W.flashT!=null&&W.flashT<.5) { const k=W.flashT/.5; gfx.globalAlpha=1-k; star(x,y,16+k*30,'#fff6c8'); gfx.globalAlpha=1; return; }
  if(W.done||W.t<W.open||W.t>W.close) return;
  const pulse=1+.18*Math.sin(t*18);
  star(x+2,y+2,15*pulse,'#1b2d27'); star(x,y,15*pulse,'#ffe08a'); star(x,y,6*pulse,'#fff');
  label('TAP!',x+2,y+16,'#1b2d27',2); label('TAP!',x,y+14,'#fff1cb',2);
}
// A tap or A during a busy moment: close the victory card, or try a High-Five.
function b7Tap(back) {
  if(B7.card) { b7CloseCard(); return; }
  if(!back) b7HighFive();
}

// ---------- Rose Mode: the recommended move ----------
function b7Recommend(u) {
  const k=u.kit,foes=b2LiveFoes(),live=b2LiveParty();
  const ok=a=>!!a&&b2Cost(u,a)<=u.vp&&!b2Shushed(u,a)&&b2TargetOptions(a,u).length>0;
  const sp=k.special;
  const heals=a=>!!a&&!a.stat&&(a.fx||[]).some(f=>f[0]==='heal');
  const lock=foes.find(f=>f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target));
  if(sp&&sp.kind==='defend'&&ok(sp)&&lock&&lock.intent.target!==u&&!lock.intent.target.st.guarded)
    return {dir:'down',i:0,name:sp.name,why:'Step in front of '+lock.intent.target.name+'. '+cap(lock.def.the)+' has locked on.'};
  const tin=foes.find(f=>f.st.pietin);
  if(sp&&sp.key==='silly'&&ok(sp)&&tin) return {dir:'down',i:0,name:sp.name,why:'Make '+tin.def.the+' laugh and the pie tin falls off.'};
  const down=B2.party.find(p=>p.hp<=0);
  if(sp&&sp.key==='wardrobe'&&ok(sp)&&down) return {dir:'down',i:0,name:sp.name,why:'Get '+down.name+' back on their feet.'};
  const low=live.filter(p=>p.hp/p.maxHp<.45);
  if(low.length) {
    const why=low.length>1?'A few of you are hurting. Heal up.':low[0].name+' is hurting. Heal up.';
    if(heals(sp)&&ok(sp)) return {dir:'down',i:0,name:sp.name,why};
    const hs=k.skills.findIndex(s=>heals(s)&&ok(s)); if(hs>=0) return {dir:'right',i:hs,name:k.skills[hs].name,why};
  }
  const wide=foes.find(f=>f.intent&&f.intent.kind==='all'&&f.shield);
  if(wide) {
    const fits=a=>a&&a.stat&&(a.elem||[]).some(e=>wide.shield.elems.includes(e));
    const si=k.skills.findIndex(s=>ok(s)&&fits(s)); if(si>=0) return {dir:'right',i:si,name:k.skills[si].name,why:'Crack the shield before the big hit.'};
    if(fits(k.basic)) return {dir:'up',i:0,name:k.basic.name,why:'Crack the shield before the big hit.'};
    if(sp&&sp.key==='silly'&&ok(sp)) return {dir:'down',i:0,name:sp.name,why:'Chatter cracks the shield.'};
  }
  const rows=b2TomboRows(u),tr=rows.findIndex(r=>!r.why);
  if(tr>=0&&foes.length) return {dir:'left',i:tr,name:rows[tr].T.name,why:'The HEART meter is full enough for a Tombo!'};
  const score=a=>{ let s=(a.mult||1)*(a.hits||1)*(a.target==='multi'?1:1); if(['all','row','front'].includes(a.target)&&foes.length>1) s*=1.3; if(a.target==='splash'&&foes.length>1) s*=1.15; if(foes.some(f=>f.revealed&&(f.weak||[]).some(e=>(a.elem||[]).includes(e)))) s*=1.5; return s; };
  let best=-1,bs=score(k.basic)*1.15;
  k.skills.forEach((s,i)=>{ if(ok(s)&&s.stat&&score(s)>bs) { bs=score(s); best=i; } });
  if(best>=0) return {dir:'right',i:best,name:k.skills[best].name,why:'Your strongest hit right now.'};
  return {dir:'up',i:0,name:k.basic.name,why:'Free, and it builds VP for later.'};
}
function b7RecFor(u) {
  if(!b7Diff().recommend||!u||u.side!=='party') return null;
  // b7Recommend speaks the old layout (up basic, right skill i, down signature); map it onto the cross: find the move itself,
  // then point at ▲ Attack or ▶ Heal (whichever list holds it) and its row in that list.
  if(!B7.rec||B7.rec.u!==u||B7.rec.round!==B2.round) { const r=b7Recommend(u); B7.rec={u,round:B2.round,r:b7RecMap(u,r)}; }
  return B7.rec.r;
}
function b7RecMap(u,r) {
  if(!r||r.dir==='left') return r;
  const k=u.kit,act=r.dir==='down'?k.special:r.dir==='right'?k.skills[r.i]:k.basic;
  if(!act) return r;
  const tab=b2IsHeal(u,act)?'heal':'attack';
  return {...r,dir:tab==='heal'?'right':'up',i:Math.max(0,b2TabRows(u,tab).indexOf(act))};
}
const b7TabDir=()=>B2.tab==='heal'?'right':'up';
function b7RecSkill(u,def) { const r=b7RecFor(u); return r&&r.dir===b7TabDir()?r.i:def; }
function b7AfterRender() {
  b7SyncTools();
  const box=$('b2-cmd'); if(!box) return;
  box.querySelectorAll('.rec').forEach(e=>e.classList.remove('rec'));
  const u=B2.actor;
  if(!b7Diff().recommend||battle.state!=='command'||!u||u.side!=='party') return;
  const r=b7RecFor(u); if(!r) return;
  if(B2.ui==='cross') {
    const b=box.querySelector('.b2-x[data-d="'+r.dir+'"]'); if(b) b.classList.add('rec');
    const boss=b2LiveFoes().find(f=>f.intent||f.st.staggered);
    if(!boss||/lock|shield|pie/.test(r.why)) b2Msg('★ Try '+r.name+'. '+r.why);
    else { const el=$('b2-msg'); if(el&&el.textContent.indexOf('★')<0) el.textContent+=' ★ Try '+r.name+'.'; }
  } else if((B2.ui==='skills'&&r.dir===b7TabDir())||(B2.ui==='tombo'&&r.dir==='left')) {
    const b=box.querySelector('.b2-btn[data-i="'+r.i+'"]'); if(b) b.classList.add('rec');
  }
}

// ---------- Rose Mode: Deedee's emergency Rhubarb Pie ----------
function b7Pie() {
  if(!b7Diff().pie||!B2.active||B2.pieUsed) return false;
  B2.pieUsed=true; battle.state='busy'; B2.ui='busy'; b2Render();
  enqueue(()=>{ b2Msg('Everyone is down... Then a Rhubarb Pie comes sailing in from Deedee’s kitchen!'); sfx.whoosh(); },1300,
    ()=>{ b2Fx({kind:'flash',color:'#ffe8b0',t:0,dur:.6});
      for(const p of B2.party) { p.hp=Math.max(1,Math.round(p.maxHp*.5)); p.st={}; p.guard=false; if(battle.fx[p.idx]) { battle.fx[p.idx].hop=.35; battle.fx[p.idx].koAt=null; } b2PopParty(p,'UP','#ffe08a'); }
      sfx.levelChime(); b2Msg('Everybody takes a bite and gets back up! (Rose Mode: once a fight.)'); b2Render(); },1500,
    ()=>b2Advance());
  return true;
}
// Director Mode: one snack per round, a round being until everyone else has had a turn.
function b7SnackLock(u) {
  if(!b7Diff().snackRound||!B2.snackWait||!B2.snackWait.size) return '';
  return 'One snack per round. Waiting on '+[...B2.snackWait].filter(b2Alive).map(p=>p.name).join(', ')+'.';
}

// ---------- Speed and AUTO buttons (top right of the battle picture) ----------
function b7SyncTools() {
  const T=$('b7-tools'),cv=$('battle-canvas'); if(!T||!cv) return;
  T.hidden=!B2.active;
  if(!B2.active) return;
  const st=T.parentElement;
  T.style.top=(cv.offsetTop+6)+'px';
  T.style.right=Math.max(4,st.clientWidth-(cv.offsetLeft+cv.offsetWidth)+6)+'px';
  const s=$('b7-speed'),a=$('b7-auto');
  s.textContent=B7.speed+'x'; s.classList.toggle('on',B7.speed===2);
  a.textContent=B7.auto?'AUTO ON':'AUTO'; a.classList.toggle('on',B7.auto);
}

// ---------- The victory card ----------
// Level-up rewards, one small card each (engine/battle2.js b2GainFor, data/abilities.js b8LevelRewards).
// The same reward from several levels at once is one card with a count.
function b7RewardCards(rw) {
  const seen={},out=[];
  for(const r of rw) { if(seen[r.k]) { seen[r.k].n++; continue; } seen[r.k]={r,n:1}; out.push(seen[r.k]); }
  return out.map(o=>'<span class="b7-rcard '+o.r.k+'">'+b2Esc(o.n>1?o.r.txt.replace('+1','+'+o.n).replace(/Point$/,'Points').replace(/Ticket$/,'Tickets'):o.r.txt)+'</span>').join('');
}
// R from b2RewardsData (engine/battle2.js): title, line, xp, purse, calm, drop, members, stamp, heart, puddle.
function b7ShowCard(R,done) {
  const c=$('b7-card'); if(!c) { done(); return; }
  battle.state='busy'; B2.ui='busy';
  const pct=(lvl,xp)=>lvl>=B6.maxLevel?100:Math.round(xp/B6.xpPerLevel*100);
  const rows=R.members.map((m,i)=>{
    const img=b2Portrait(m.id);
    return '<div class="b7-row" data-i="'+i+'">'+(img?'<img alt="" src="'+img+'">':'<span class="b7-ph">'+b2Esc(m.name.charAt(0))+'</span>')+
      '<div class="b7-who"><div class="b7-top"><b>'+b2Esc(m.name.toUpperCase())+'</b><span class="b7-lv">Lv '+m.lvl0+'</span><span class="b7-up" hidden>LEVEL UP!</span>'+''+'<em>+'+R.xp+' XP</em></div>'+
      '<div class="b7-xp"><i style="width:'+pct(m.lvl0,m.xp0)+'%"></i></div>'+
      ((m.rw&&m.rw.length)?'<div class="b7-rw" hidden>'+b7RewardCards(m.rw)+'</div>':'')+'</div></div>';
  }).join('');
  const loot=['<div class="b7-coins"><span class="b7-coin"></span>+'+R.purse+' Pocket Coins'+(R.calm?' <small>Kindness bonus</small>':'')+'</div>'];
  if(R.drop) loot.push('<div class="b7-drop">'+b2Esc(((items[R.drop.id]||{}).icon||'')+' Found: '+R.drop.name)+'</div>');
  if(R.puddle) loot.push('<div class="b7-note">Nara left a happy puddle. Good girl. Mostly.</div>');
  if(R.stamp) loot.push('<div class="b7-note gold">★ New rewards to spend! Menu, then STAMPS.</div>');
  c.innerHTML='<div class="b7-cbox" role="dialog" aria-label="Victory"><div class="b7-ttl'+(R.calm&&/KIND/.test(R.title)?' kind':'')+'">'+b2Esc(R.title)+'</div>'+
    '<div class="b7-line">'+b2Esc(R.line||'')+'</div><div class="b7-rows">'+rows+'</div><div class="b7-loot">'+loot.join('')+'</div>'+
    '<div class="b7-foot"><span>HEART '+R.heart+'%</span><span class="b7-tap">Tap to continue</span></div></div>';
  c.hidden=false;
  B7.card={done,t0:performance.now()};
  // XP bars tick up; a level up fills the bar, chimes, then carries on from empty.
  const T=B7.cardTimers;
  R.members.forEach((m,i)=>{
    const row=c.querySelector('.b7-row[data-i="'+i+'"]'),bar=row.querySelector('.b7-xp i');
    T.push(setTimeout(()=>{ bar.style.transition='width .55s ease-out'; bar.style.width=(m.ups?100:pct(m.lvl1,m.xp1))+'%'; },250+i*120));
    if(m.ups) T.push(setTimeout(()=>{
      sfx.levelChime(); row.classList.add('lvup'); row.querySelector('.b7-lv').textContent='Lv '+m.lvl1; row.querySelector('.b7-up').hidden=false;
      const s=row.querySelector('.b7-rw'); if(s) s.hidden=false;
      bar.style.transition='none'; bar.style.width='0%'; void bar.offsetWidth;
      bar.style.transition='width .45s ease-out'; bar.style.width=pct(m.lvl1,m.xp1)+'%';
    },900+i*220));
  });
  T.push(setTimeout(()=>b7CloseCard(true),B7.auto?3000:6500));
}
function b7CloseCard(force) {
  if(!B7.card) return;
  if(!force&&performance.now()-B7.card.t0<400) return;
  const f=B7.card.done; B7.card=null;
  for(const t of B7.cardTimers) clearTimeout(t); B7.cardTimers=[];
  const c=$('b7-card'); if(c) c.hidden=true;
  sfx.select();
  if(f) f();
}

// ---------- Map monsters: wandering, chasing, engaging ----------
// Normal monsters drift around their spot and come after Tom when he is within 4 tiles (a "!" pops first). Touching
// one starts the fight (its lines, then the battle). Bosses hold their ground and wait for Tom to press A.
function b7IsBoss(n) { const D=b2FoeDef(n.monster); return !!(D&&D.boss)||monsterDef(n).rank==='BOSS'; }
// Director mode (catchUp): a regular monster is never more than catchUp levels below Tom, so over-levelling does not make
// the map monsters easy. Bosses and story fights keep their set levels. Used by startBattle and the overlevel check.
function b7MonLevel(n) {
  const d=monsterDef(n),D=b2FoeDef(n.monster),base=Math.max((D&&D.level)||1,(d.level||1)+(n.tier||0)),c=b7Diff().catchUp;
  return (c!=null&&!b7IsBoss(n))?Math.max(base,hero.level-c):base;
}
function b7Overlevel(n) {
  if(b7IsBoss(n)||performance.now()<n.defeatedUntil) return false;
  return hero.level>=b7MonLevel(n)+B7_MON.over;
}
const b7Dist=(a,x,y)=>Math.abs(a.x-x)+Math.abs(a.y-y);
// Monsters never step onto a doorway or a map exit.
const b7Exit=(x,y)=>!!(currentMap.portals&&currentMap.portals.has(key(x,y)));
function b7MonsterTick(n,dt) {
  const now=performance.now();
  if(!n.home) n.home={x:n.x,y:n.y};
  if(B7.lastMap!==currentMap) { B7.lastMap=currentMap; B7.noEngage=Math.max(B7.noEngage,now+1500); }
  if(n.alert>0) n.alert-=dt;
  n.mt=(n.mt||0)-dt; if(n.mt>0) return;
  if(b7IsBoss(n)) { n.mt=1; return; }
  const resting=now<n.defeatedUntil;
  const px=player.move?player.move.tx:player.x,py=player.move?player.move.ty:player.y;
  const dist=b7Dist(n,px,py);
  const free=!resting&&now>=B7.noEngage&&now>=(n.chaseOff||0)&&!transition&&!dialog.active&&!intro.active&&!menuOpen&&!shopOpen&&!battle.active;
  if(free&&dist===1) { b7Engage(n); return; }
  if(free&&dist<=B7_MON.sight) {
    if(!n.chasing) { n.chasing=true; n.alert=.9; n.facing=directionTo(px-n.x,py-n.y); if(sfx.look) sfx.look(); n.mt=.5; return; }
    n.duration=B7_MON.chaseStep;
    const steps=Object.keys(DIR).map(d=>({d,x:n.x+DIR[d].x,y:n.y+DIR[d].y}))
      .filter(c=>Math.abs(c.x-n.home.x)+Math.abs(c.y-n.home.y)<=B7_MON.leash&&!b7Exit(c.x,c.y))
      .sort((a,b)=>b7Dist(a,px,py)-b7Dist(b,px,py));
    for(const c of steps) { if(b7Dist(c,px,py)>=dist) break; if(startMove(n,c.d)) break; }
    n.mt=.05; return;
  }
  if(n.chasing) { n.chasing=false; n.mt=.8; return; }
  n.duration=B7_MON.wanderStep;
  const away=b7Dist(n,n.home.x,n.home.y);
  if(away>B7_MON.radius) {
    const steps=Object.keys(DIR).map(d=>({d,x:n.x+DIR[d].x,y:n.y+DIR[d].y})).sort((a,b)=>b7Dist(a,n.home.x,n.home.y)-b7Dist(b,n.home.x,n.home.y));
    for(const c of steps) if(startMove(n,c.d)) break;
    n.mt=.2; return;
  }
  if(!resting&&Math.random()<.55) {
    const opts=Object.keys(DIR).filter(d=>b7Dist({x:n.x+DIR[d].x,y:n.y+DIR[d].y},n.home.x,n.home.y)<=B7_MON.radius&&!b7Exit(n.x+DIR[d].x,n.y+DIR[d].y));
    if(opts.length) startMove(n,pick(opts));
  }
  n.mt=resting?2:1+Math.random()*1.6;
}
function b7Engage(n) {
  n.chasing=false; n.chaseOff=performance.now()+4000;
  if(player.move) { player.x=player.move.tx; player.y=player.move.ty; player.move=null; }
  player.facing=directionTo(n.x-player.x,n.y-player.y); n.facing=directionTo(player.x-n.x,player.y-n.y);
  if(b7Overlevel(n)) { b7InstantWin(n); return; }
  sfx.grumpTaunt&&sfx.grumpTaunt();
  openDialog(n.name,n.lines=monsterLines(n),n);   // closing the lines starts the fight (engine/overworld.js advanceDialog)
}
// The overlevel rule (EarthBound style): Tom 5+ levels above a monster gets full XP and coins without a fight.
function b7InstantWin(n) {
  const id=n.monster,d=monsterDef(n),lvl=(d.level||1)+(n.tier||0);
  const F=B2_FORMATIONS[id],foes=((typeof F==='function'?F():F)||[[id,'front']]).map(f=>({id:f[0],lvl,boss:false}));   // a function: crowds of a random size
  const xp=Math.max(1,Math.round(b6BattleXp(foes,n)*B7_MON.popXp));   // reduced: no fight, so less reward
  const coinPerk=party.reduce((a,m)=>a+((b6Perks(m).coins)||0),0);
  const purse=b2Purse(foes,n,coinPerk);
  n.tier++; n.maxHp+=d.hpStep; n.defeatedUntil=performance.now()+25000; n.chasing=false; monsterFall(n);
  coins+=purse;
  const ups=[];
  for(const m of party) { const r=b2GainFor(m,xp); if(r.ups) ups.push(m.name+' is now Lv '+r.lvl1); }
  b6Sync();
  let got='';
  const dr=d.drop;
  if(dr&&Math.random()<dr.chance&&!(dr.once&&b6Owned(dr.id))) { bag.push(dr.id); const put=typeof autoGear==='function'?autoGear():[]; got=' Found: '+((items[dr.id]||{}).name||dr.id)+'.'+(put.length?' '+put.join(' '):''); }
  const x=(n.x+.5)*T,y=(n.y+1)*T-18,cols=d.vapor||['#ffe08a','#ff9ac0','#9fe8ff','#9be39a'];
  const parts=[]; for(let k=0;k<26;k++) { const a=Math.random()*Math.PI*2,s=40+Math.random()*90; parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-70,c:k%3?cols[k%cols.length]:['#ffe08a','#ff9ac0','#9fe8ff'][k%3],s:3+Math.floor(Math.random()*3)}); }
  B7.mapFx.push({x,y,t:0,t0:performance.now(),dur:1.5,parts,txt:'+'+xp+' XP'});
  sfx.boing&&sfx.boing(); setTimeout(()=>sfx.coin&&sfx.coin(),180); if(ups.length) setTimeout(()=>sfx.levelChime(),420);
  const many=foes.length>1;
  showToast('POP! '+(many?'The '+d.name+'s scatter':cap(d.the)+' scatters')+'. Too easy now. +'+xp+' XP, +'+purse+' coins.'+got+(ups.length?' '+ups.join('. ')+'!':''),3.6);
  B7.noEngage=performance.now()+1500;
  if(typeof saveGame==='function') saveGame('auto',true);
}
function b7DrawMapFx(time) {
  const now=performance.now();
  for(const n of currentMap.npcs) {
    if(!n.monster||n.hidden) continue;
    const p=position(n),d=monsterDef(n),cx=Math.round((p.x+.5)*T),top=Math.round((p.y+1)*T-2-d.sprite.length);
    if(n.alert>0) { const yy=top-14-Math.round(Math.min(1,(.9-n.alert)*6)*4); rect(cx-5,yy-2,10,14,OUT); rect(cx-4,yy-1,8,12,'#fff1cb'); label('!',cx,yy+1,'#c8553d',2); }
    else if(now<n.defeatedUntil) { const k=(time*.8)%1; gfx.globalAlpha=1-k; label('Z',cx+8+Math.round(k*8),top-4-Math.round(k*14),'#cfe0ff',1+(k<.5?1:0)); gfx.globalAlpha=1; }
  }
  for(const f of B7.mapFx) {
    f.t=(now-f.t0)/1000; const u=f.t/f.dur,tt=f.t;
    gfx.globalAlpha=Math.max(0,1-u);
    for(const q of f.parts) rect(Math.round(q.x+q.vx*tt),Math.round(q.y+q.vy*tt+80*tt*tt),q.s,q.s,q.c);
    gfx.globalAlpha=Math.max(0,1-u*.8); label(f.txt,Math.round(f.x)+1,Math.round(f.y-26-u*20)+1,'#1b2d27',2); label(f.txt,Math.round(f.x),Math.round(f.y-26-u*20),'#ffe08a',2); gfx.globalAlpha=1;
  }
  B7.mapFx=B7.mapFx.filter(f=>f.t<f.dur);
}

// ---------- Pause menu: OPTIONS ----------
function b7RenderOptions(body) {
  $('menu-foot').textContent='Options are saved with your game, so they come back after Safari closes. Change them any time.';
  const opt=(key,label,on,fn)=>{ const b=btn('save-btn b7-opt'+(on?' on':''),key,label,()=>{ fn(); sfx.select(); if(typeof saveGame==='function') saveGame('auto',true); menuFocusNext=key; renderMenu(); }); b.setAttribute('aria-pressed',on); return b; };
  const card=(title,note)=>{ const c=el('div','mcard b7-ocard'); c.appendChild(el('div','slot-label',title)); const r=el('div','b7-orow'); c.appendChild(r); if(note!=null) { const n=el('div','stat-note'); n.textContent=note; c.appendChild(n); } body.appendChild(c); return r; };
  // SOUND: two 1 to 10 levels. Minus and plus are buttons (D-pad and A reach them); tapping a pip jumps to that level.
  const vol=(kind,title,note)=>{
    const r=card(title,note); r.classList.add('b7-vrow');
    const step=d=>{ setVolume(kind,sound.vol[kind]+d); };
    const after=key=>{ sfx.select(); if(typeof saveGame==='function') saveGame('auto',true); menuFocusNext=key; renderMenu(); };
    const minus=btn('save-btn b7-opt b7-vbtn','vol-'+kind+'-dn','&minus;',()=>{ step(-1); after('vol-'+kind+'-dn'); });
    const plus=btn('save-btn b7-opt b7-vbtn','vol-'+kind+'-up','+',()=>{ step(1); after('vol-'+kind+'-up'); });
    minus.setAttribute('aria-label',title+' down'); plus.setAttribute('aria-label',title+' up');
    if(sound.vol[kind]<=1) minus.classList.add('dim'); if(sound.vol[kind]>=10) plus.classList.add('dim');
    const bar=el('div','b7-vbar'); bar.setAttribute('role','img'); bar.setAttribute('aria-label',title+' level '+sound.vol[kind]+' of 10');
    for(let i=1;i<=10;i++) { const p=el('span','b7-vpip'+(i<=sound.vol[kind]?' on':'')); p.addEventListener('click',e=>{ e.stopPropagation(); setVolume(kind,i); after(null); }); bar.appendChild(p); }
    const num=el('div','b7-vnum',String(sound.vol[kind]));
    r.appendChild(minus); r.appendChild(bar); r.appendChild(num); r.appendChild(plus);
  };
  vol('music','MUSIC VOLUME','1 is a whisper, 10 is full.'+(music.on?'':' Music is switched off; the music button below turns it back on.'));
  vol('fx','EFFECTS AND VOICES VOLUME','Sound effects, battle shouts and story voices.'+(sound.enabled?'':' Sound is muted; the sound button below turns it back on.'));
  const D=b7Diff();
  const r1=card('DIFFICULTY',D.sub+'. '+D.text);
  for(const id of ['rose','grace','director']) r1.appendChild(opt('opt-'+id,B7_DIFF[id].name.replace(' MODE',''),B7.diff===id,()=>b7SetDiff(id)));
  const r2=card('BATTLE SPEED','2x plays every animation twice as fast. Also the 2x button in a fight (F on a keyboard, R1 on a controller).');
  for(const s of [1,2]) r2.appendChild(opt('opt-speed'+s,s+'x',B7.speed===s,()=>{ B7.speed=s; b7Save(); }));
  const r3=card('HIGH-FIVE TIMING','When a gold sparkle pops over whoever is attacking, tap the picture (or press A) for +15% and a little HEART. Rose Mode lands it for you.');
  r3.appendChild(opt('opt-hf-on','ON',B7.hf,()=>{ B7.hf=true; b7Save(); }));
  r3.appendChild(opt('opt-hf-off','OFF',!B7.hf,()=>{ B7.hf=false; b7Save(); }));
  const r5=card('AUTO-STAMP SPENDS POLISH AND TICKETS','ON: Auto-Stamp also ranks moves up with Polish Points and unlocks Remixes with Remix Tickets. OFF: it only stamps, and you spend those yourself.');
  r5.appendChild(opt('opt-as-on','ON',B7.autoSpend!==false,()=>{ B7.autoSpend=true; b7Save(); }));
  r5.appendChild(opt('opt-as-off','OFF',B7.autoSpend===false,()=>{ B7.autoSpend=false; b7Save(); }));
  const c4=el('div','mcard b7-ocard'); c4.appendChild(el('div','slot-label','SMART REPEAT'));
  const n4=el('div','stat-note'); n4.textContent='In a fight, AUTO (top right) has everyone repeat their last move, skipping heals nobody needs. Tap it again to take over (R on a keyboard, Y on a controller).'; c4.appendChild(n4);
  body.appendChild(c4);
}

// ---------- Wiring: battle buttons, taps on the picture, the card ----------
(function b7Wire() {
  const st=document.querySelector('#battle .battle-stage'),cv=$('battle-canvas'),B=$('battle');
  if(!st||!cv||!B) return;
  const tools=document.createElement('div'); tools.id='b7-tools'; tools.className='b7-tools'; tools.hidden=true;
  tools.innerHTML='<button type="button" id="b7-speed" aria-label="Battle speed">1x</button><button type="button" id="b7-auto" aria-label="Smart Repeat">AUTO</button>';
  st.appendChild(tools);
  $('b7-speed').addEventListener('click',e=>{ e.stopPropagation(); b7ToggleSpeed(); });
  $('b7-auto').addEventListener('click',e=>{ e.stopPropagation(); b7ToggleAuto(); });
  cv.addEventListener('pointerdown',()=>{ if(B2.active&&battle.state!=='command') b7Tap(); });
  const card=document.createElement('div'); card.id='b7-card'; card.className='b7-card'; card.hidden=true;
  card.addEventListener('click',()=>b7CloseCard());
  B.appendChild(card);
  addEventListener('resize',()=>{ if(B2.active) b7SyncTools(); });
})();
