'use strict';
// engine/b3-ui.js — Battle 3 screen: starting and ending a fight, the turn flow, the turn bar, party cards, the command
// cross, lists, targeting and input (architecture sections 2.6 and 2.8).
// It asks the rules what happened (b3Next, b3Act, b3FoeTurn), hands the beats to the play layer (engine/b3-play.js) and
// waits for it to finish. It never changes the fight itself.
// The battle screen's layout is shared with battle 2: Battle 3 has its own boxes (#b3-bar, #b3-ui in index.html) that carry
// the same layout classes (.b2-ribbon, .b2-ui, .b2-party, .b2-cmd...), so portrait, landscape and tablet sizes come for free.
//
// BASIC and SKILLS work. RUCKUS (stage 6) and BAG are greyed out with the reason.
// Tapping a family member's card or a monster while the cross or the Skill list is up opens that unit's full list (B3.ui 'info'):
// every status with how long it has left and what it does, shields, and what lies on its side's floor (spec 2.8, the screen rule).
// Keys: I opens it on whoever is up, up and down step through everyone, Esc goes back.

// ---------- Start and end ----------
// cfg: party (ids), level or levels, formation (a B3_FORMATIONS id) or foes, bg (a backdrop key), seed, lab (true in the
// Battle Lab: EXIT shows), auto (true: the simple player picks every move, for tests), hpPct and mods (tests), onEnd(result).
function b3Start(cfg) {
  B3.cfg=cfg; B3.result=null; B3.actor=null; B3.pending=null; B3.opts=[]; B3.ui='busy'; B3.sel=0; B3.view=null; B3.log=[]; B3.turnOf=null;
  const mods=Object.assign({foeHp:b7FoeHp(),taken:b7Taken(),foeSpeed:typeof b7FoeSpeed==='function'?b7FoeSpeed():1},cfg.mods||{});
  B3.F=b3NewFight({party:cfg.party,level:cfg.level,levels:cfg.levels,formation:cfg.formation,foes:cfg.foes,seed:cfg.seed,hpPct:cfg.hpPct,rows:cfg.rows,mods});
  b3PlayReset(); b3ViewSync(); b3LayoutFoes();
  B3.view.bar=b3BarSnap(B3.F,null,0);
  clearBattleQueue(); clearInput();
  Object.assign(battle,{active:true,v2:false,v3:true,state:'busy',time:0,enemy:null,monster:null});
  B3.active=true;
  b3ShowUI(true); b3Render();
  b3Sfx('intro');
  const fs=B3.F.foes,same=fs.every(f=>f.id===fs[0].id);
  b3Say(fs.length===1?fs[0].name+' shows up!':same?['','','Two','Three','Four','Five'][fs.length]+' '+fs[0].D.name+'s show up!':'Monsters show up!');
  // Enemy and battle sheets load on demand (engine/painted.js). Hold the opening on the backdrop until this fight's sheets are in, 5 seconds at most.
  B3.artWait=false;
  if(typeof paintedFightReady==='function') { paintedTick(); B3.artWait=!paintedFightReady(); }
  const t0=performance.now(),go=()=>{ if(!B3.active) return; if(B3.artWait&&!paintedFightReady()&&performance.now()-t0<5000) { b3After(.1,go); return; } B3.artWait=false; b3After(1.1,b3Flow); };
  go();
}
function b3ShowUI(on) {
  const B=$('battle');
  B.classList.toggle('v2',on); B.classList.toggle('v3',on);   // v2 is the shared layout class; v3 marks Battle 3's own rules
  $('b3-ui').hidden=!on; $('b3-bar').hidden=!on; $('b2-ui').hidden=true; $('b2-ribbon').hidden=true;
  if(on) B.hidden=false;
  b3SyncTools();
}
function b3End(result) {
  B3.active=false; B3.result=result; B3.ui='busy'; B3.actor=null; B3P.q.length=0;
  Object.assign(battle,{active:false,v3:false,state:'idle'});
  b3ShowUI(false);
  $('battle').hidden=true;
  if(typeof stopSpeech==='function') stopSpeech();
  if(typeof canvas!=='undefined'&&canvas.focus) canvas.focus();
  const cb=B3.cfg&&B3.cfg.onEnd; if(cb) cb(result);
}

// ---------- The turn flow ----------
const b3Over=()=>!!B3.F.over;
function b3Flow() {
  if(!B3.active) return;
  const N=b3Next(B3.F);
  b3Play(N.beats,()=>{
    if(!B3.active) return;
    if(b3Over()||!N.unit) { b3Finish(); return; }
    const u=N.unit;
    if(u.side==='foe') { b3Play(b3FoeTurn(B3.F,u),()=>{ if(!B3.active) return; if(b3Over()) b3Finish(); else b3Flow(); }); return; }
    B3.actor=u;
    if(B3.cfg.auto) { const p=b3Auto(B3.F,u); b3Commit(p.skill,p.target); return; }
    b3Open('cross');
  });
}
// The player's pick goes to the rules; the whole result comes back as beats and is played.
function b3Commit(skillId,optKey) {
  const u=B3.actor,r=b3Act(B3.F,u,skillId,optKey);
  if(!r.ok) { b3Sfx('nope'); b3Say(r.why); return false; }
  B3.ui='busy'; battle.state='busy'; B3.pending=null; B3.opts=[];
  b3Render();
  b3Play(r.beats,()=>{ if(!B3.active) return; B3.actor=null; if(b3Over()) b3Finish(); else b3Flow(); });
  return true;
}
function b3Finish() {
  b3ViewSync(); B3.actor=null;
  const win=B3.F.over==='win';
  if(win) { B3P.cheer=true; b3Sfx('win'); b3Word('YOU WIN!','#ffe27a'); b3Say('The family wins! Tap CONTINUE.'); }
  else { b3Sfx('lose'); b3Word('KNOCKED OUT','#ff9a8a'); b3Say('Everyone is knocked out. Tap CONTINUE.'); }
  B3.ui='done'; battle.state='command'; b3Render();
}

// ---------- Opening a menu ----------
function b3Open(mode,sel) {
  B3.ui=mode; battle.state='command'; B3.sel=sel||0;
  b3Render();
}
// The SKILLS list: the Vibe's Skills, then Pick-Me-Up while someone is knocked out.
const b3SkillRows=u=>b3Skills(B3.F,u).slice(1);
// The Base Recovery of what the cursor is on, for the ghost on the turn bar.
function b3PreviewRecovery() {
  const u=B3.actor; if(!u||battle.state!=='command') return null;
  if(B3.ui==='skills') { const S=b3SkillRows(u)[B3.sel]; return S?B3_RULES.recovery[S.slot]:B3_RULES.recovery.basic; }
  if(B3.ui==='target'&&B3.pending) return B3_RULES.recovery[B3.pending.slot];
  return B3_RULES.recovery.basic;
}

// ---------- The turn bar: the next 8 turns, a divider where a round ends, a ghost where the actor will land ----------
function b3RenderBar(moved) {
  const box=$('b3-bar'); if(!box||!B3.F) return;
  let list;
  if(B3.active&&battle.state==='command'&&B3.actor&&B3.ui!=='done') list=b3Forecast(B3.F,9,{actor:B3.actor,recovery:b3PreviewRecovery(),ghost:true}).map(e=>({k:e.u.key,now:e.now,div:e.div,ghost:e.ghost}));
  else list=B3.view.bar||[];
  // Remember where each face was, so a face that changes place slides there (a push visibly moves the monster back).
  const was={}; box.querySelectorAll('.b2-tk[data-k]').forEach(el=>{ was[el.dataset.k]=[el.offsetLeft,el.offsetTop]; });
  const seen={};
  box.innerHTML='<span class="b2-rib-lbl">TURN</span>'+list.map(e=>{
    const u=b3Unit(B3.F,e.k),n=seen[e.k]=(seen[e.k]||0)+1,key=e.k+'#'+n,foe=u.side==='foe';
    const cls='b2-tk '+(foe?'foe':'pty')+(e.now?' now':'')+(e.ghost?' ghost':'')+(moved===e.k&&n===1?' b3-moved':'');
    const img=foe?b2Thumb(u.id):b2Portrait(u.id);
    const badge=foe&&n===1&&B3.view.charge[e.k]?'<i class="b2-int all" title="Winding up '+b2Esc(B3.view.charge[e.k])+'">!!</i>':'';
    return (e.div?'<i class="b3-div" title="Round '+e.div+' starts here"><b>'+e.div+'</b></i>':'')+
      '<div class="'+cls+'" data-k="'+key+'" title="'+b2Esc(u.name)+'">'+(img?'<img alt="" src="'+img+'">':'<span>'+b2Esc(u.name.charAt(0))+'</span>')+(u.letter?'<b>'+u.letter+'</b>':'')+badge+'</div>';
  }).join('');
  box.querySelectorAll('.b2-tk[data-k]').forEach(el=>{
    const p=was[el.dataset.k]; if(!p) return;
    const dx=p[0]-el.offsetLeft,dy=p[1]-el.offsetTop; if(Math.abs(dx)<1&&Math.abs(dy)<1) return;
    el.style.transition='none'; el.style.transform='translate('+dx+'px,'+dy+'px)';
    void el.offsetWidth;
    el.style.transition='transform .45s cubic-bezier(.2,.8,.2,1)'; el.style.transform='';
  });
}

// ---------- Party cards: face, HP, 10 Pep dots, at most 3 status icons ----------
function b3RenderParty() {
  const box=$('b3-party'); if(!box||!B3.F||!B3.view) return;
  const tgt=B3.ui==='target'&&B3.opts[B3.sel]?B3.opts[B3.sel].units:[];
  box.innerHTML=B3.F.party.map((u,i)=>{
    const v=B3.view.u[u.key],r=Math.max(0,v.hp)/v.maxHp;
    const cls='b2-pc'+(u===B3.actor&&battle.state==='command'?' act':'')+(v.ko?' ko':'')+(tgt.includes(u)||(B3.ui==='info'&&B3.infoKey===u.key)?' tgt':'');
    const pips=Array.from({length:B3_RULES.pep.max},(_,k)=>'<i'+(k<v.pep?' class="on"':'')+'></i>').join('');
    const st=b3ViewIcons(u.key).map(id=>'<span class="b2-st" style="color:'+B3_STATUS[id].color+'" title="'+b2Esc(B3_STATUS[id].name)+'">'+B3_STATUS[id].short+'</span>').join('');
    const img=b2Portrait(u.id);
    return '<div class="'+cls+'" data-i="'+i+'"><span class="b2-pt">'+(img?'<img alt="" src="'+img+'">':'<span class="b2-ph">'+u.name.charAt(0)+'</span>')+'</span>'+
      '<div><div class="b2-nm">'+b2Esc(u.name)+'<em>Lv'+u.level+'</em></div>'+(st?'<div class="b3-chips">'+st+'</div>':'')+
      '<div class="b2-bar"><i class="'+(r<=.25?'crit':r<=.5?'low':'')+'" style="width:'+Math.round(r*100)+'%"></i></div>'+
      '<div class="b2-sub"><span>'+(v.ko?'KNOCKED OUT':'HP '+Math.max(0,v.hp)+'/'+v.maxHp+(v.sh?'<b class="b3-shn" title="Shield '+v.sh+'">+'+v.sh+'</b>':''))+'</span><span class="b2-vp b3-pep" aria-label="Pep '+v.pep+' of 10" title="Pep '+v.pep+' of 10">'+pips+'</span></div></div></div>';
  }).join('');
}

// ---------- The command box ----------
function b3FlavorChips(S) { return S.flavor.map(f=>'<span class="b2-el" style="color:'+B3_FLAVORS[f].color+'">'+B3_FLAVORS[f].name.toUpperCase()+'</span>').join(''); }
function b3RenderCmd() {
  const box=$('b3-cmd'),u=B3.actor; if(!box) return;
  if(B3.ui==='done') { box.innerHTML='<div class="b2-list"><button type="button" class="b2-btn sel b3-go" data-done="1"><span>CONTINUE</span><em>'+(B3.F.over==='win'?'You won this fight.':'You lost this fight.')+'</em></button></div>'; return; }
  const cmdOn=battle.state==='command'&&u;
  if(!cmdOn||B3.ui==='cross'||B3.ui==='busy') {
    const pu=u||B3.F.party.find(p=>p.key===B3.turnOf)||B3.F.party[0],off=cmdOn?'':' off',img=b2Portrait(pu.id),nS=b3SkillRows(pu).length;
    const X=(d,name,sub,grey)=>'<button type="button" class="b2-x '+d+(grey?' off':off)+'" data-d="'+d+'"><span class="ar"></span>'+name+'<small'+(sub.length>11?' class="long"':'')+'>'+b2Esc(sub)+'</small></button>';
    box.innerHTML='<div class="b2-cross">'+X('up','BASIC',B3_SKILLS[pu.basic].name)+X('left','RUCKUS','Not yet',true)+
      '<div class="b2-mid'+off+'">'+(img?'<img alt="" src="'+img+'">':'')+'<small class="b3-pepn">'+B3.view.u[pu.key].pep+' PEP</small></div>'+
      X('right','SKILLS',nS?nS+(nS===1?' skill':' skills'):'None yet',!nS)+X('down','BAG','Not yet',true)+'</div>';
    return;
  }
  const back='<button type="button" class="b2-btn b2-back" data-back="1"><span>Back</span><em>B / Esc</em></button>';
  if(B3.ui==='info') {
    const t=b3Unit(B3.F,B3.infoKey),v=B3.view.u[t.key],rows=b3Carried(B3.F,t);
    box.innerHTML='<div class="b2-list b3-info"><div class="b3-inf-h"><span>'+b2Esc(t.name.toUpperCase())+'</span><em>'+(v.ko?'Knocked out':'HP '+Math.max(0,v.hp)+'/'+v.maxHp+(v.sh?' +'+v.sh+' shield':''))+'</em></div>'+
      (rows.length?rows.map(r=>'<div class="b3-inf"><div class="b3-inf-t"><span class="b2-st" style="color:'+r.color+'">'+b2Esc(r.short)+'</span><b>'+b2Esc(r.name)+'</b>'+(r.left?'<i>'+b2Esc(r.left)+' left</i>':'')+'</div><p>'+b2Esc(r.desc)+'</p></div>').join('')
        :'<div class="b3-inf"><p>Nothing on '+b2Esc(t.name)+' right now.</p></div>')+back+'</div>';
    return;
  }
  if(B3.ui==='skills') {
    const rows=b3SkillRows(u);
    box.innerHTML='<div class="b2-list">'+rows.map((S,i)=>{ const can=b3CanUse(B3.F,u,S),c=b3Cost(B3.F,u,S);
      return '<button type="button" class="b2-btn'+(i===B3.sel?' sel':'')+(can.ok?'':' no')+'" data-i="'+i+'"><div class="b2-top"><span class="b2-sn">'+b2Esc(S.name)+'</span><i class="b2-cost">'+c+' PEP</i></div><em class="b2-els">'+b3FlavorChips(S)+'</em></button>'; }).join('')+back+'</div>';
  } else if(B3.ui==='target') {
    box.innerHTML='<div class="b2-list">'+B3.opts.map((o,i)=>{ const t1=o.units.length===1?o.units[0]:null,v=t1?B3.view.u[t1.key]:null;
      const sub=o.no?o.no:t1?(v.ko?'Knocked out':'HP '+v.hp+'/'+v.maxHp+b3ViewIcons(t1.key).map(id=>' · '+B3_STATUS[id].name).join('')):o.units.length+' targets';
      return '<button type="button" class="b2-btn'+(i===B3.sel?' sel':'')+(o.no?' no':'')+'" data-i="'+i+'"><span>'+b2Esc(o.label.toUpperCase())+'</span><em>'+b2Esc(sub)+'</em></button>'; }).join('')+back+'</div>';
  }
}
// What the cursor is on, in the message line.
function b3Info() {
  const u=B3.actor; if(battle.state!=='command'||!u||B3.ui==='done') return;
  if(B3.ui==='cross') b3Say(u.name+'’s turn. ▲ BASIC is free and gives 2 Pep. ▶ SKILLS cost Pep. Tap anyone to see what is on them.');
  else if(B3.ui==='info') b3Say('What is on '+b3Unit(B3.F,B3.infoKey).name+'. Tap another family member or monster to see theirs.');
  else if(B3.ui==='skills') { const S=b3SkillRows(u)[B3.sel]; if(S) { const can=b3CanUse(B3.F,u,S); b3Say(can.ok?S.desc:can.why); } }
  else if(B3.ui==='target'&&B3.pending) { const o=B3.opts[B3.sel]; b3Say(B3.pending.name+': '+(o&&o.no?o.no:B3.pending.desc)); }
}
function b3Render() {
  if(!B3.F||!B3.view) return;
  b3RenderBar(); b3RenderParty(); b3RenderCmd(); b3Info(); b3SyncTools();
  const sel=document.querySelector('#b3-cmd .b2-btn.sel'); if(sel&&sel.scrollIntoView) sel.scrollIntoView({block:'nearest'});
}

// ---------- The full list for one unit (statuses, shields, the floor) ----------
function b3OpenInfo(key) {
  if(!B3.active||battle.state!=='command'||!B3.actor||!['cross','skills','info'].includes(B3.ui)||!b3Unit(B3.F,key)) return false;
  if(B3.ui!=='info') { B3.infoFrom=B3.ui; B3.infoSel=B3.sel; }
  B3.infoKey=key; b3Sfx('move'); b3Open('info');
  return true;
}
// Everyone the list can step through: the family, then the monsters still standing.
const b3InfoKeys=()=>[...B3.F.party,...b3Live(B3.F,'foe')].map(u=>u.key);

// ---------- Choosing ----------
function b3Choose(S) {
  const u=B3.actor,can=b3CanUse(B3.F,u,S);
  if(!can.ok) { b3Sfx('nope'); b3Say(can.why); return; }
  const opts=b3Options(B3.F,u,S);
  b3Sfx('select');
  if(opts.length===1&&!opts[0].no) { b3Commit(S.id,opts[0].key); return; }
  B3.pending=S; B3.opts=opts; B3.prevUi=B3.ui; B3.prevSel=B3.sel;
  b3Open('target',Math.max(0,opts.findIndex(o=>!o.no)));
}
function b3Cross(d) {
  const u=B3.actor; if(!u) return;
  if(d==='up') b3Choose(B3_SKILLS[u.basic]);
  else if(d==='right') { if(!b3SkillRows(u).length) { b3Sfx('nope'); b3Say(u.name+' has no Skills in this build yet. They arrive in the next stages.'); return; } b3Sfx('select'); b3Open('skills',0); }
  else if(d==='left') { b3Sfx('nope'); b3Say('RUCKUS is not built yet. The Family Ruckus gauge arrives in a later stage.'); }
  else if(d==='down') { b3Sfx('nope'); b3Say('The BAG is not built yet in the new battle. It arrives in a later stage.'); }
}
function b3Pick(i) {
  const u=B3.actor;
  if(B3.ui==='done') { b3Sfx('select'); b3End(B3.F.over); return; }
  if(B3.ui==='skills') { const S=b3SkillRows(u)[i]; if(S) { B3.sel=i; b3Choose(S); } }
  else if(B3.ui==='target') { const o=B3.opts[i]; if(!o) return; if(o.no) { b3Sfx('nope'); b3Say(o.no); return; } b3Sfx('select'); b3Commit(B3.pending.id,o.key); }
}
function b3Back() {
  if(battle.state!=='command'||B3.ui==='done') return;
  if(B3.ui==='info') { b3Sfx('move'); b3Open(B3.infoFrom==='skills'?'skills':'cross',B3.infoSel||0); }
  else if(B3.ui==='skills') { b3Sfx('move'); b3Open('cross'); }
  else if(B3.ui==='target') { b3Sfx('move'); const p=B3.prevUi==='skills'?'skills':'cross'; B3.pending=null; B3.opts=[]; b3Open(p,B3.prevSel||0); }
}
function b3Move(d) {
  if(B3.ui==='info') { const K=b3InfoKeys(),i=Math.max(0,K.indexOf(B3.infoKey)); B3.infoKey=K[(i+(d==='up'||d==='left'?K.length-1:1))%K.length]; b3Sfx('move'); b3Render(); return; }
  const n=B3.ui==='skills'?b3SkillRows(B3.actor).length:B3.ui==='target'?B3.opts.length:0; if(!n) return;
  B3.sel=(B3.sel+(d==='up'||d==='left'?n-1:1))%n; b3Sfx('move'); b3Render();
}
// The cursor moves without rebuilding the buttons under the finger.
function b3Hover(i) {
  B3.sel=i;
  document.querySelectorAll('#b3-cmd .b2-btn[data-i]').forEach(b=>b.classList.toggle('sel',Number(b.dataset.i)===i));
  b3RenderBar(); b3RenderParty(); b3Info();
}

// ---------- Input: touch, keyboard, gamepad ----------
function b3Dir(d) {
  if(!B3.active||battle.state!=='command'||B3.ui==='done') return;
  if(B3.ui==='cross') b3Cross(d); else b3Move(d);
}
function b3A() {
  if(!B3.active||battle.state!=='command') return;
  if(B3.ui==='cross') b3Cross('up'); else if(B3.ui==='info') b3Back(); else b3Pick(B3.sel);
}
function b3Key(e) {
  const c=e.code,dirs={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
  if(c==='KeyL') { if(!e.repeat) toggleLayout(); return; }
  if(c==='KeyF') { if(!e.repeat) b3Speed(); return; }
  if(c==='KeyI') { if(!e.repeat) { if(B3.ui==='info') b3Back(); else if(B3.actor) b3OpenInfo(B3.actor.key); } return; }
  if(dirs[c]) { e.preventDefault(); if(!e.repeat||B3.ui!=='cross') b3Dir(dirs[c]); }
  else if((c==='Enter'||c==='Space')&&!e.repeat) { e.preventDefault(); b3A(); }
  else if((c==='Escape'||c==='Backspace'||c==='KeyX')&&!e.repeat) { e.preventDefault(); b3Back(); }
}
function b3Pad(dir,dirEdge,A,B) {
  if(dirEdge&&dir) b3Dir(dir);
  if(A) b3A(); else if(B) b3Back();
}
// The living enemy under a canvas point (its picture plus a little slack, and the HP bar under its feet).
function b3FoeAt(x,y) {
  let best=null,bd=1e9;
  for(const f of b3Live(B3.F,'foe')) {
    const p=b3FoeBox(f.key),pad=8;
    if(x<p.x-p.w/2-pad||x>p.x+p.w/2+pad||y<p.y-p.h-pad||y>p.y+22) continue;
    const d=Math.hypot(x-p.x,y-(p.y-p.h/2)); if(d<bd) { bd=d; best=f; }
  }
  return best;
}
function b3TargetAt(cx,cy) {
  if(!B3.active||battle.state!=='command'||B3.ui!=='target') return -1;
  const q=b2CanvasPt(cx,cy); if(!q||!q.inside) return -1;
  const f=b3FoeAt(q.x,q.y); if(!f) return -1;
  const k=B3.opts.findIndex(o=>o.units.length===1&&o.units[0]===f);
  return k>=0?k:B3.opts.findIndex(o=>o.units.includes(f));
}

// ---------- EXIT (Battle Lab) and speed, at the top right of the picture ----------
function b3SyncTools() {
  const T=$('b3-tools'),cv=$('battle-canvas'); if(!T||!cv) return;
  T.hidden=!B3.active; if(!B3.active) return;
  const st=T.parentElement;
  T.style.top=(cv.offsetTop+6)+'px'; T.style.right=Math.max(4,st.clientWidth-(cv.offsetLeft+cv.offsetWidth)+6)+'px';
  $('b3-exit').hidden=!(B3.cfg&&B3.cfg.lab);
  const s=$('b3-speed'); s.textContent=B7.speed+'x'; s.classList.toggle('on',B7.speed===2);
}
function b3Speed() { b7ToggleSpeed(); b3SyncTools(); b3Say('Battle speed '+B7.speed+'x.'); }
function b3Exit() { if(!B3.active) return; b3Sfx('select'); b3End('run'); }

(function b3Wire() {
  const ui=$('b3-ui'),cv=$('battle-canvas'),st=document.querySelector('#battle .battle-stage'); if(!ui||!cv||!st) return;
  const tools=document.createElement('div'); tools.id='b3-tools'; tools.className='b7-tools'; tools.hidden=true;
  tools.innerHTML='<button type="button" id="b3-exit" class="exit" aria-label="Exit to the Battle Lab list" hidden>EXIT</button><button type="button" id="b3-speed" aria-label="Battle speed">1x</button>';
  st.appendChild(tools);
  $('b3-exit').addEventListener('click',e=>{ e.stopPropagation(); b3Exit(); });
  $('b3-speed').addEventListener('click',e=>{ e.stopPropagation(); b3Speed(); });
  ui.addEventListener('pointerdown',e=>{ B3.ptr=e.pointerType||'touch'; },true);
  ui.addEventListener('click',e=>{
    if(!B3.active||battle.state!=='command') return;
    if(e.target.closest('[data-done]')) { b3Pick(0); return; }
    if(B3.ui==='done') return;
    const x=e.target.closest('.b2-x'); if(x) { if(B3.ui==='cross') b3Cross(x.dataset.d); return; }
    if(e.target.closest('[data-back]')) { b3Back(); return; }
    const b=e.target.closest('.b2-btn');
    if(b&&b.dataset.i!=null) {
      const i=Number(b.dataset.i);
      // On a phone the first tap on a Skill only highlights it and says what it does; a tap on the highlighted row uses it.
      if(B3.ptr&&B3.ptr!=='mouse'&&B3.ui==='skills'&&i!==B3.sel) { b3Sfx('move'); b3Hover(i); return; }
      b3Pick(i); return;
    }
    // Tap a party card to aim at that family member; with no target to pick, the tap opens their full list.
    const pc=e.target.closest('.b2-pc');
    if(pc&&B3.ui==='target') { const u=B3.F.party[Number(pc.dataset.i)],k=B3.opts.findIndex(o=>o.units.length===1&&o.units[0]===u); if(k>=0) b3Pick(k); }
    else if(pc) { const u=B3.F.party[Number(pc.dataset.i)]; if(u) b3OpenInfo(u.key); }
  });
  ui.addEventListener('pointerover',e=>{
    if(!B3.active||battle.state!=='command'||e.pointerType!=='mouse') return;
    const b=e.target.closest('.b2-btn'); if(b&&b.dataset.i!=null&&Number(b.dataset.i)!==B3.sel) b3Hover(Number(b.dataset.i));
  });
  // Tap an enemy on the picture to aim at it; with no target to pick, the tap opens its full list.
  cv.addEventListener('click',e=>{
    if(B3.active&&battle.state==='command'&&B3.ui!=='target'&&B3.ui!=='done') { const q=b2CanvasPt(e.clientX,e.clientY),f=q&&q.inside?b3FoeAt(q.x,q.y):null; if(f) b3OpenInfo(f.key); return; }
    const k=b3TargetAt(e.clientX,e.clientY); if(k<0) return;
    if(B3.opts[k].units.length>1&&k!==B3.sel) { b3Sfx('move'); b3Hover(k); return; }
    b3Pick(k);
  });
  cv.addEventListener('pointermove',e=>{
    if(!B3.active||e.pointerType!=='mouse') return;
    const k=b3TargetAt(e.clientX,e.clientY),q=B3.ui!=='target'&&battle.state==='command'?b2CanvasPt(e.clientX,e.clientY):null;
    cv.style.cursor=k>=0||(q&&q.inside&&b3FoeAt(q.x,q.y))?'pointer':'';
    if(k>=0&&k!==B3.sel) b3Hover(k);
  });
})();
