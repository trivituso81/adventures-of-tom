'use strict';
// engine/b3-ui.js — Battle 3 screen: starting and ending a fight, the turn flow, the turn bar, party cards, the command
// cross, lists, targeting and input (architecture sections 2.6 and 2.8).
// It asks the rules what happened (b3Next, b3Act, b3FoeTurn), hands the beats to the play layer (engine/b3-play.js) and
// waits for it to finish. It never changes the fight itself.
// The battle screen's layout is shared with battle 2: Battle 3 has its own boxes (#b3-bar, #b3-ui in index.html) that carry
// the same layout classes (.b2-ribbon, .b2-ui, .b2-party, .b2-cmd...), so portrait, landscape and tablet sizes come for free.
//
// BASIC, SKILLS and RUCKUS work. RUCKUS opens DOUBLE TEAM and FULL FAMILY RUCKUS (engine/b3-ruckus.js; the gauge fills the button). BAG is greyed out with the reason.
// A granted action (Grace's Colossal Diamond-Gold Dumpling; the rules keep it in F.grant): when the move that granted it has
// played, the SKILLS list opens for the family member who got it, holding only the Skills they may take, each marked FREE.
// There is no cross and no way back out of that list: they pick one, it plays, and the turn order carries on where it was.
// Tapping a family member's card or a monster while the cross or the Skill list is up opens that unit's full list (B3.ui 'info'):
// every status with how long it has left and what it does, shields, and what lies on its side's floor (spec 2.8, the screen rule).
// For an Elite or a Boss the list starts with its Composure pips and the act it is winding up; a Marked family member's list says who Marked them.
// Keys: I opens it on whoever is up, up and down step through everyone, Esc goes back. On a gamepad Y does what I does.
// SKILL CARD (b3s9, Tom's note 2026-11-19): the SKILLS list shows each Skill's name, its flavor as a picture and its Pep cost
// in a big blue pill, nothing else. Tapping a Skill (or A on it) hides the other Skills and opens its card (B3.ui 'skill'): the
// name, the Pep cost, the flavor pictures with their names, the whole description, the preview below, then BACK and USE.
// USE goes on to the target list when the Skill needs a target. The message line no longer shows the description.
// TAP TO PREVIEW (stage 7): the skill card, the RUCKUS and target lists carry a preview box (#b3-pv): the Pep cost, the flavor,
// PET PEEVE or RESIST on each monster, the Detonation it would set off, the pips it would take, who it heals or shields, and the
// turn bar as it would be after (a ghost face for the actor, an arrow on whoever is pushed or pulled). It is worked out by
// engine/b3-preview.js on a copy of the fight. On a phone the first tap on a row only arms it and shows this; a second tap on the
// same row uses it. With a mouse, hovering previews and a click uses. With keys or a gamepad the cursor previews and A uses.
// RECOMMENDED MOVE: in a difficulty with `recommend` (Rose Mode) one move glows (b3Recommend) and the cursor starts on it.

// ---------- Start and end ----------
// cfg: party (ids), level or levels, formation (a B3_FORMATIONS id) or foes, bg (a backdrop key), seed, lab (true in the
// Battle Lab: EXIT shows), auto (true: the simple player picks every move, for tests), hpPct and mods (tests), onEnd(result),
// loadouts ({id: loadout}: each member's Vibes, Quirks, VP and row, engine/b3-progress.js) or rank (every Vibe at that Rank),
// award(F) (called once on a win; returns the line the win screen adds, for example the Vibe Points earned).
// first (the Battle Guide's "See it in a fight": a move or a monster act to open with, see b3FirstSet), keepLoadout (member ids whose loadout Rose Mode leaves as given).
// Story fights add onTurn(unit) (a tip when a family member's turn opens) and beforeEnd(result, go) (called on CONTINUE after a win; the
// story shows its victory card and calls go() to close the fight).
function b3Start(cfg) {
  B3.cfg=cfg; B3.skipNow=false; B3.recC=null; B3.pvC=null; B3.armed=-1; B3.awarded=false; B3.leaving=false; B3.won=''; B3.result=null; B3.actor=null; B3.pending=null; B3.opts=[]; B3.ui='busy'; B3.sel=0; B3.view=null; B3.log=[]; B3.turnOf=null;
  const mods=Object.assign({foeHp:b7FoeHp(),taken:b7Taken(),foeSpeed:typeof b7FoeSpeed==='function'?b7FoeSpeed():1},cfg.mods||{});
  // Rose Mode (pictures on) picks the Vibes and Quirks itself: the Sig Vibes and the newest written Quirks, from the same Ranks.
  let loadouts=cfg.loadouts;
  if(!cfg.plain&&typeof b7Diff==='function'&&b7Diff().pictures&&(loadouts||cfg.rank)) {
    const src=loadouts||{}; loadouts={};
    for(const id of cfg.party) if(typeof b3HasKit==='function'&&b3HasKit(id)) loadouts[id]=(cfg.keepLoadout||[]).includes(id)&&src[id]?src[id]:b3RoseLoadout(id,src[id]||b3NewLoadout(id,cfg.rank));   // keepLoadout: the Battle Guide's "See it in a fight" needs this member's Vibe as set
  }
  B3.F=b3NewFight({party:cfg.party,level:cfg.level,levels:cfg.levels,formation:cfg.formation,foes:cfg.foes,seed:cfg.seed,hpPct:cfg.hpPct,hpShare:cfg.hpShare,rows:cfg.rows,setup:cfg.setup,
    loadouts,rank:cfg.rank,plain:cfg.plain,mods,ruckus:cfg.ruckus});
  b3FirstSet();
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
  if(B3.F&&B3.cfg&&B3.cfg.onRuckus) B3.cfg.onRuckus(B3.F.ruckus);   // the gauge goes on to the next fight
  B3.active=false; B3.result=result; B3.ui='busy'; B3.actor=null; B3P.q.length=0;
  Object.assign(battle,{active:false,v3:false,state:'idle'});
  b3ShowUI(false);
  $('battle').hidden=true;
  if(typeof stopSpeech==='function') stopSpeech();
  if(typeof canvas!=='undefined'&&canvas.focus) canvas.focus();
  const cb=B3.cfg&&B3.cfg.onEnd; if(cb) cb(result);
}

// ---------- "See it in a fight" (cfg.first, set by engine/b3-lab.js from index.html?go=new&i=<fight>&move=<skill id> or &act=<monster id>:<act id>) ----------
// {kind:'move', owner, move}: that family member uses that Skill on their first turn (their Pep is raised to its cost if it is short).
// {kind:'act', foe, act}: the first monster with that id uses that act on its first turn, or the wind-up that leads to it (a follow-up that
// hits whoever the wind-up Marked cannot start by itself). Either way it only starts the fight: the rules, the numbers and every animation are the fight's own.
// The one who opens stands first on the turn bar (wait 0), so the fight begins with the move and nobody has to take other turns first.
function b3FirstSet() {
  const f=B3.cfg.first; if(!f) return;
  if(f.kind==='move') { const u=B3.F.party.find(x=>x.id===f.owner); if(u) u.wait=0; else B3.cfg.first=null; return; }
  const e=B3.F.foes.find(x=>x.id===f.foe),A=e&&e.D.acts.find(a=>a.id===f.act);
  B3.cfg.first=null;
  if(!A||A.hits==='attacker') return;   // a counter act answers a hit: it cannot open a fight
  const w=e.D.acts.find(a=>a.then===A.id);
  e.force=w?w.id:A.id; e.wait=0;
}
function b3FirstTurn(u) {
  const f=B3.cfg.first; if(!f||f.kind!=='move'||u.id!==f.owner) return false;
  B3.cfg.first=null;
  const F=B3.F,S=B3_SKILLS[f.move]; if(!S||!(u.basic===S.id||u.skills.includes(S.id))) return false;
  const O=b3Options(F,u,S).find(o=>!o.no); if(!O) return false;
  const c=b3Cost(F,u,S,O); if(u.pep<c) u.pep=Math.min(B3_RULES.pep.max,c);
  if(!b3CanUse(F,u,S).ok) return false;
  b3Say(u.name+' opens with '+S.name+'.');
  return b3Commit(S.id,O.key);
}

// ---------- The turn flow ----------
const b3Over=()=>!!B3.F.over;
function b3Flow() {
  if(!B3.active) return;
  if(B3.skipNow) { b3DoSkip(); return; }
  const N=b3Next(B3.F);
  b3Play(N.beats,()=>{
    if(!B3.active) return;
    if(b3Over()||!N.unit) { b3Finish(); return; }
    const u=N.unit;
    if(u.side==='foe') { b3Play(b3FoeTurn(B3.F,u),()=>{ if(!B3.active) return; if(b3Over()) b3Finish(); else b3Flow(); }); return; }
    B3.actor=u;
    if(B3.cfg.first&&b3FirstTurn(u)) return;   // the Battle Guide's "See it in a fight": this member opens with the move asked for, then the fight is the player's
    if(B3.cfg.auto) { const rk=B3.cfg.autoRuckus?b3AutoRuckus(B3.F,u):null; if(rk) { b3Commit('ruckus:'+rk.kind,rk.target); return; } const p=b3Auto(B3.F,u); b3Commit(p.skill,p.target); return; }
    b3Open('cross');
    if(B3.cfg.onTurn) B3.cfg.onTurn(u);   // story fights: the tip for this turn (engine/b3-story.js)
  });
}
// The family member a granted action is waiting for, or null.
const b3Granted=()=>B3.F&&B3.F.grant?b3Unit(B3.F,B3.F.grant.key):null;
// A move has finished playing. If it granted someone a free Skill, they pick it now; otherwise the clock moves on.
function b3AfterAct() {
  if(!B3.active) return;
  B3.actor=null;
  if(b3Over()) { b3Finish(); return; }
  const g=b3Granted();
  if(g) {
    B3.actor=g;
    if(B3.cfg.auto) { const p=b3Auto(B3.F,g); if(p&&b3Commit(p.skill,p.target)) return; B3.F.grant=null; B3.actor=null; }
    else { b3Sfx('select'); b3Open('skills',b3RecRow()); return; }
  }
  b3Flow();
}
// The player's pick goes to the rules; the whole result comes back as beats and is played.
function b3Commit(skillId,optKey) {
  const u=B3.actor,r=/^ruckus:/.test(skillId)?b3Ruckus(B3.F,u,skillId.slice(7),optKey):b3Act(B3.F,u,skillId,optKey);
  if(!r.ok) { b3Sfx('nope'); b3Say(r.why); return false; }
  B3.ui='busy'; battle.state='busy'; B3.pending=null; B3.opts=[];
  b3Render();
  b3Play(r.beats,b3AfterAct);
  return true;
}
function b3Finish() {
  b3ViewSync(); B3.actor=null;
  const win=B3.F.over==='win';
  // A win may pay something (Vibe Points in the Battle Lab): the line it returns is said on the win screen.
  if(win) { if(B3.cfg.award&&!B3.awarded) { B3.awarded=true; B3.won=B3.cfg.award(B3.F)||''; }
    B3P.cheer=true; B3P.cheerAt=null; for(const m of B3.F.party) b3cWant(b3cOf(m.id,'victory'),9000); b3Sfx('win'); b3Word('YOU WIN!','#ffe27a'); b3Say('The family wins! '+(B3.won?B3.won+' ':'')+'Tap CONTINUE.'); }
  else if(B3.F.over!=='lose') { b3Sfx('thud'); b3Word(B3.F.endWord||'THE END','#aee6ff'); b3Say((B3.F.endLine||'The fight ends here.')+' Tap CONTINUE.'); }   // a scripted end (engine/b3-script.js): flee, shell
  else { b3Sfx('lose'); b3Word('KNOCKED OUT','#ff9a8a'); b3Say('Everyone is knocked out. Tap CONTINUE.'); }
  B3.ui='done'; battle.state='command'; b3Render();
}

// ---------- Opening a menu ----------
function b3Open(mode,sel) {
  B3.ui=mode; battle.state='command'; B3.sel=sel||0; B3.armed=-1;
  b3Render();
}
// ---------- The recommended move (difficulties with `recommend`: Rose Mode) ----------
const b3RecOn=()=>{ try { return !!b7Diff().recommend; } catch(e) { return false; } };
function b3Rec() {
  if(!B3.actor||!B3.F||battle.state!=='command'||!b3RecOn()) return null;
  const k=B3.actor.key+'|'+B3.F.clock+'|'+B3.F.turnLog.length+'|'+(B3.F.grant?1:0)+'|'+B3.F.ruckus;
  if(!B3.recC||B3.recC.k!==k) B3.recC={k,r:b3Recommend(B3.F,B3.actor)};
  return B3.recC.r;
}
// Where the cursor starts: on the recommended row when there is one.
function b3RecRow() { const r=b3Rec(); if(!r||r.kind==='ruckus') return 0; return Math.max(0,b3SkillRows(B3.actor).findIndex(S=>S.id===r.skill)); }
function b3RecTarget(opts,id) { const r=b3Rec(),i=r&&r.skill===id?opts.findIndex(o=>o.key===r.target&&!o.no):-1; return i>=0?i:Math.max(0,opts.findIndex(o=>!o.no)); }
// The SKILLS list: the Main Vibe's Skills, then the Pocket Vibe's (tagged POCKET), then Pick-Me-Up while someone is knocked out.
// While a granted action waits for this member the list is only what the grant allows (b3Skills leaves the Basic out then).
const b3SkillRows=u=>b3Granted()===u?b3Skills(B3.F,u):b3Skills(B3.F,u).slice(1);
// The Base Recovery of what the cursor is on, for the ghost on the turn bar (b3MoveRec: a Quirk can shorten some moves).
function b3PreviewRecovery() {
  const u=B3.actor; if(!u||battle.state!=='command') return null;
  if(B3.ui==='skills'||B3.ui==='skill') { const S=b3SkillRows(u)[B3.sel]; return S?b3MoveRec(B3.F,u,S):B3_RULES.recovery.basic; }
  if(B3.ui==='ruckus'||(B3.ui==='target'&&B3.pending&&B3.pending.ruckus)) { const P=b3RuckusPlan(B3.F,u,B3.ui==='ruckus'?['double','full'][B3.sel]||'double':B3.pending.ruckus); return P.ok?b3MoveRec(B3.F,u,P.parts[0].S):B3_RULES.recovery.basic; }
  if(B3.ui==='target'&&B3.pending) return b3MoveRec(B3.F,u,B3.pending);
  return b3MoveRec(B3.F,u,B3_SKILLS[u.basic]);
}

// ---------- The turn bar: the next 8 turns, a divider where a round ends, a ghost where the actor will land ----------
function b3RenderBar(moved) {
  const box=$('b3-bar'); if(!box||!B3.F) return;
  let list;
  // A free Skill does not move anyone: the bar is the plain forecast, with the family member who is picking shown first.
  if(B3.active&&battle.state==='command'&&B3.actor&&B3.ui!=='done'&&b3Granted()===B3.actor) list=[{k:B3.actor.key,now:true,div:0,ghost:false},...b3Forecast(B3.F,8,{}).map(e=>({k:e.u.key,now:false,div:e.div,ghost:false}))];
  else if(B3.active&&battle.state==='command'&&B3.actor&&B3.ui!=='done'&&B3.pvNow&&B3.pvNow.P&&B3.pvNow.P.bar.length) {
    // What the highlighted move would really do to the bar: the actor now, then the bar as it stands after the move (the actor's next turn is the ghost).
    let g=false; list=[{k:B3.actor.key,now:true,div:0,ghost:false},...B3.pvNow.P.bar.slice(0,8).map(e=>{ const gh=!g&&e.k===B3.actor.key; if(gh) g=true; return {k:e.k,now:false,div:e.div,ghost:gh}; })];
  }
  else if(B3.active&&battle.state==='command'&&B3.actor&&B3.ui!=='done') list=b3Forecast(B3.F,9,{actor:B3.actor,recovery:b3PreviewRecovery(),ghost:true}).map(e=>({k:e.u.key,now:e.now,div:e.div,ghost:e.ghost}));
  else list=B3.view.bar||[];
  // Remember where each face was, so a face that changes place slides there (a push visibly moves the monster back).
  const was={}; box.querySelectorAll('.b2-tk[data-k]').forEach(el=>{ was[el.dataset.k]=[el.offsetLeft,el.offsetTop]; });
  const seen={};
  box.innerHTML='<span class="b2-rib-lbl">TURN</span>'+list.map(e=>{
    const u=b3Unit(B3.F,e.k),n=seen[e.k]=(seen[e.k]||0)+1,key=e.k+'#'+n,foe=u.side==='foe';
    const flus=foe&&n===1&&((B3.view.u[e.k]||{}).st||[]).includes('flustered');
    const pm=n===1&&B3.pvNow&&B3.pvNow.P&&battle.state==='command'?B3.pvNow.moved[e.k]:null;
    const cls='b2-tk '+(foe?'foe':'pty')+(e.now?' now':'')+(e.ghost?' ghost':'')+(moved===e.k&&n===1?' b3-moved':'')+(pm?' b3-pvm':'')+(flus?' b3-flus':'');
    const img=foe?b2Thumb(u.id):b2Portrait(u.id);
    const badge=pm?'<i class="b2-int b3-pvb" title="'+(pm.kind==='push'?'Pushed back ':'Pulled forward ')+pm.n+' ticks">'+(pm.kind==='push'?'\u25B6':'\u25C0')+'</i>':flus?'<i class="b2-int b3-brk" title="Flustered">BREAK</i>':foe&&n===1&&B3.view.charge[e.k]?'<i class="b2-int all" title="Winding up '+b2Esc(B3.view.charge[e.k])+'">!!</i>':'';
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

// ---------- Party cards: face, HP, 10 Pep dots, at most 3 status icons, BACK for the Back row, a Portable Counter's number ----------
function b3RenderParty() {
  const box=$('b3-party'); if(!box||!B3.F||!B3.view) return;
  const tgt=B3.ui==='target'&&B3.opts[B3.sel]?B3.opts[B3.sel].units:[];
  box.innerHTML=B3.F.party.map((u,i)=>{
    const v=B3.view.u[u.key],r=Math.max(0,v.hp)/v.maxHp;
    const cls='b2-pc'+(u===B3.actor&&battle.state==='command'?' act':'')+(v.ko?' ko':'')+(tgt.includes(u)||(B3.ui==='info'&&B3.infoKey===u.key)?' tgt':'');
    const pips=Array.from({length:B3_RULES.pep.max},(_,k)=>'<i'+(k<v.pep?' class="on"':'')+'></i>').join('');
    // A Mark is not a status, but the card says so first; it takes the third icon's place so a card never shows more than 3.
    const mk=b3ViewMarked(u.key)&&!v.ko,nx=!mk&&b3ViewAimed(u.key)&&!v.ko;
    const st=(mk?'<span class="b2-st b3-mk" title="A monster\u2019s wound-up attack is aimed here">MARKED</span>':nx?'<span class="b2-st b3-nx" title="A monster\u2019s next attack is aimed here (Cartridge Blow)">NEXT TARGET</span>':'')+
      b3ViewIcons(u.key).slice(0,mk||nx?2:3).map(id=>'<span class="b2-st" style="color:'+B3_STATUS[id].color+'" title="'+b2Esc(B3_STATUS[id].name)+'">'+B3_STATUS[id].short+'</span>').join('');
    const img=b2Portrait(u.id);
    const ctr=v.ctr?'<b class="b3-ctr" title="'+b2Esc(Object.values(u.counterInfo)[0].name)+' '+v.ctr+'">'+v.ctr+'</b>':'';
    return '<div class="'+cls+'" data-i="'+i+'"><span class="b2-pt">'+(img?'<img alt="" src="'+img+'">':'<span class="b2-ph">'+u.name.charAt(0)+'</span>')+ctr+'</span>'+
      '<div><div class="b2-nm">'+b2Esc(u.name)+(u.row==='back'?'<i class="b3-rowtag" title="Back row">BACK</i>':'')+'<em>Lv'+u.level+'</em></div>'+(st?'<div class="b3-chips">'+st+'</div>':'')+
      '<div class="b2-bar"><i class="'+(r<=.25?'crit':r<=.5?'low':'')+'" style="width:'+Math.round(r*100)+'%"></i></div>'+
      '<div class="b2-sub"><span>'+(v.ko?'KNOCKED OUT':'HP '+Math.max(0,v.hp)+'/'+v.maxHp+(v.sh?'<b class="b3-shn" title="Shield '+v.sh+'">+'+v.sh+'</b>':''))+'</span><span class="b2-vp b3-pep" aria-label="Pep '+v.pep+' of 10" title="Pep '+v.pep+' of 10">'+pips+'</span></div></div></div>';
  }).join('');
}

// ---------- The command box ----------
// The flavor of a move as pictures (the same pictures Rose Mode uses), with the names in the title for a mouse.
const B3_FLAV_IC={clobber:'b3f_clobber',sizzle:'b3f_sizzle',drench:'b3f_drench',razzle:'b3f_razzle',racket:'b3f_racket',support:'b3f_support'};
function b3FlavorIcons(S) { return '<span class="b3-ico" title="'+b2Esc(S.flavor.map(f=>B3_FLAVORS[f].name).join(' and '))+'">'+S.flavor.map(f=>bpIcon(B3_FLAV_IC[f]||'b3f_support',24)).join('')+'</span>'; }
// skillinfo1: the i at the left of a Skill row opens that Skill's card (BACK and USE); a tap on the rest of the row uses the Skill.
// A span, not a button, because it sits inside the row's button; engine/b3-ui.js b3Wire reads [data-info] before the row.
function b3InfoI(S) { return '<span class="b3-ii" data-info="1" role="button" aria-label="Details: '+b2Esc(S.name)+'" title="What '+b2Esc(S.name)+' does"><i>i</i></span>'; }
function b3CostPill(c,free) { return '<span class="b3-cost'+(c?'':' free')+'"><b>'+(c?c:'FREE')+'</b>'+(c?'<small>PEP</small>':'')+'</span>'; }
function b3FlavorChips(S) { return S.flavor.map(f=>'<span class="b2-el" style="color:'+B3_FLAVORS[f].color+'">'+B3_FLAVORS[f].name.toUpperCase()+'</span>').join(''); }
function b3RenderCmd() {
  const box=$('b3-cmd'),u=B3.actor; if(!box) return;
  if(B3.ui==='done') { box.innerHTML='<div class="b2-list"><button type="button" class="b2-btn sel b3-go" data-done="1"><span>CONTINUE</span><em>'+(B3.F.over==='win'?b2Esc(B3.won||'You won this fight.'):B3.F.over==='lose'?'You lost this fight.':b2Esc(B3.F.endLine||'The fight is over.'))+'</em></button></div>'; return; }
  const cmdOn=battle.state==='command'&&u;
  if(!cmdOn||B3.ui==='cross'||B3.ui==='busy') {
    const rk=Math.round(B3.view.ruckus||0),pu=u||B3.F.party.find(p=>p.key===B3.turnOf)||B3.F.party[0],off=cmdOn?'':' off',img=b2Portrait(pu.id),nS=b3SkillRows(pu).length;
    const rc=b3Rec(),rk0=rc?(rc.kind==='basic'?'up':rc.kind==='ruckus'?'left':'right'):'';
    const X=(d,name,sub,grey)=>'<button type="button" class="b2-x '+d+(grey?' off':off)+(d===rk0?' rec':'')+'" data-d="'+d+'"><span class="ar"></span>'+name+'<small'+(sub.length>11?' class="long"':'')+'>'+b2Esc(sub)+'</small></button>';
    box.innerHTML='<div class="b2-cross">'+X('up','BASIC',B3_SKILLS[pu.basic].name)+X('left','RUCKUS',rk+'%',rk<B3_RULES.ruckus.doubleTeam).replace('class="b2-x left','style="--rk:'+rk+'%" class="b3-rk b2-x left')+
      '<div class="b2-mid'+off+'">'+(img?'<img alt="" src="'+img+'">':'')+'<small class="b3-pepn">'+B3.view.u[pu.key].pep+' PEP</small></div>'+
      X('right','SKILLS',nS?nS+(nS===1?' skill':' skills'):'None yet',!nS)+X('down','BAG','Not yet',true)+'</div>';
    return;
  }
  const back='<button type="button" class="b2-btn b2-back" data-back="1"><span>Back</span><em>B / Esc</em></button>';
  if(B3.ui==='info') {
    const t=b3Unit(B3.F,B3.infoKey),v=B3.view.u[t.key],rows=b3Carried(B3.F,t);
    box.innerHTML='<div class="b2-list b3-info"><div class="b3-inf-h"><span>'+b2Esc(t.name.toUpperCase())+'</span><em>'+(v.ko?'Knocked out':'HP '+Math.max(0,v.hp)+'/'+v.maxHp+(v.sh?' +'+v.sh+' shield':''))+'</em></div>'+
      (rows.length?rows.map(r=>'<div class="b3-inf"><div class="b3-inf-t"><span class="b2-st" style="color:'+r.color+'">'+b2Esc(r.short)+'</span><b>'+b2Esc(r.name)+'</b>'+(r.left?'<i>'+b2Esc(r.left)+'</i>':'')+'</div><p>'+b2Esc(r.desc)+'</p></div>').join('')
        :'<div class="b3-inf"><p>Nothing on '+b2Esc(t.name)+' right now.</p></div>')+back+'</div>';
    return;
  }
  if(B3.ui==='skills') {
    const rows=b3SkillRows(u),free=b3Granted()===u;
    const rc=b3Rec();
    box.innerHTML='<div class="b2-list">'+(free?'<div class="b3-free">FREE SKILL FOR '+b2Esc(u.name.toUpperCase())+'</div>':'')+rows.map((S,i)=>{ const can=b3CanUse(B3.F,u,S),c=b3Cost(B3.F,u,S);
      return '<button type="button" class="b2-btn b3-sk'+(i===B3.sel?' sel':'')+(can.ok?'':' no')+(rc&&rc.skill===S.id?' rec':'')+'" data-i="'+i+'">'+b3InfoI(S)+'<span class="b2-sn"><b class="b3-snt">'+b2Esc(S.name)+'</b></span>'+b3FlavorIcons(S)+
        (u.pocketSkills.includes(S.id)?'<span class="b3-ico b3-pki" title="From the Pocket Vibe">'+bpIcon('b3_pocket',24)+'</span>':'')+b3CostPill(free&&!c?0:c,free&&!c)+'</button>'; }).join('')+(free?'':back)+'</div>';
  } else if(B3.ui==='skill') {
    const S=b3SkillRows(u)[B3.sel]; if(!S) return;
    const can=b3CanUse(B3.F,u,S),c=b3Cost(B3.F,u,S),free=b3Granted()===u,rc=b3Rec(),pk=u.pocketSkills.includes(S.id);
    const kind=S.slot==='cap'?'Capstone':pk?'Pocket Vibe Skill':S.id==='pick_me_up'?'Revive':'Skill';
    box.innerHTML='<div class="b2-list b3-det"><div class="b3-det-h"><span class="b2-sn">'+b2Esc(S.name)+'</span>'+b3CostPill(free&&!c?0:c)+'</div>'+
      '<div class="b3-det-f">'+b3FlavorIcons(S)+'<em>'+b2Esc(S.flavor.map(f=>B3_FLAVORS[f].name).join(' + '))+' · '+kind+'</em></div>'+
      '<p class="b3-det-d">'+b2Esc(S.desc||'')+'</p>'+(can.ok?'':'<p class="b3-det-no">'+b2Esc(can.why)+'</p>')+
      '<div class="b3-pv" id="b3-pv"></div>'+
      '<div class="b3-det-b">'+back.replace('<em>B / Esc</em>','')+'<button type="button" class="b2-btn b3-use'+(can.ok?'':' no')+(rc&&rc.skill===S.id?' rec':'')+'" data-use="1"><span>USE</span></button></div></div>';
  } else if(B3.ui==='ruckus') {
    const rc=b3Rec();
    box.innerHTML='<div class="b2-list"><div class="b3-free b3-rkh">FAMILY RUCKUS '+Math.round(B3.view.ruckus||0)+'%</div><div class="b3-pv" id="b3-pv"></div>'+['double','full'].map((k,i)=>{ const P=b3RuckusPlan(B3.F,u,k);
      return '<button type="button" class="b2-btn'+(i===B3.sel?' sel':'')+(P.ok?'':' no')+(rc&&rc.skill==='ruckus:'+k?' rec':'')+'" data-i="'+i+'"><div class="b2-top"><span class="b2-sn">'+b2Esc(b3RuckusName(k).toUpperCase())+'</span><i class="b2-cost">'+P.cost+'%</i></div><em>'+b2Esc(P.ok?'With '+P.partner.name+': '+(k==='full'?'their best Skills, free':'both Basics, +50% power'):P.why)+'</em></button>'; }).join('')+back+'</div>';
  } else if(B3.ui==='target') {
    const rc=b3Rec();
    box.innerHTML='<div class="b2-list"><div class="b3-pv" id="b3-pv"></div>'+B3.opts.map((o,i)=>{ const t1=o.units.length===1?o.units[0]:null,v=t1?B3.view.u[t1.key]:null;
      const sub=o.no?o.no:t1?(v.ko?'Knocked out':'HP '+v.hp+'/'+v.maxHp+(v.maxPips?' · '+v.pips+' of '+v.maxPips+' pips':'')+b3ViewIcons(t1.key).map(id=>' · '+B3_STATUS[id].name).join('')):o.units.length+' targets';
      return '<button type="button" class="b2-btn'+(i===B3.sel?' sel':'')+(o.no?' no':'')+(rc&&B3.pending&&rc.skill===B3.pending.id&&rc.target===o.key?' rec':'')+'" data-i="'+i+'"><span>'+b2Esc(o.label.toUpperCase())+'</span><em>'+b2Esc(sub)+'</em></button>'; }).join('')+back+'</div>';
  }
}
// What the cursor is on, in the message line.
function b3Info() {
  const u=B3.actor; if(battle.state!=='command'||!u||B3.ui==='done') return;
  if(B3.ui==='cross') { const rc=b3Rec(); b3Say(u.name+'’s turn. ▲ BASIC is free and gives 2 Pep. ▶ SKILLS cost Pep. Tap anyone to see what is on them.'+(rc?' Suggested: '+(rc.kind==='ruckus'?b3RuckusName(rc.skill.slice(7)):B3_SKILLS[rc.skill].name)+(rc.why?'. '+rc.why:'.'):'')); }
  else if(B3.ui==='info') b3Say('What is on '+b3Unit(B3.F,B3.infoKey).name+'. Tap another family member or monster to see theirs.');
  else if(B3.ui==='ruckus') { const k=['double','full'][B3.sel]||'double',P=b3RuckusPlan(B3.F,u,k); b3Say(P.ok?b3RuckusName(k)+' with '+P.partner.name+', who is next on the turn bar: '+(k==='full'?'both fire their best Main Vibe Skill free, one action, up to 4 Composure pips. ':'both use their Basic on one monster at +50% power. ')+'No Pep, and '+P.partner.name+' still gets their own turn.':P.why); }
  else if(B3.ui==='skills') { const g=b3Granted()===u&&B3.F.grant.by!==u.key?b3Unit(B3.F,B3.F.grant.by):null; b3Say((g?'Free from '+g.name+'. ':'')+'Tap a Skill to use it. Tap the i to see what it does.'); }
  else if(B3.ui==='skill') { const S=b3SkillRows(u)[B3.sel]; if(S) { const can=b3CanUse(B3.F,u,S); b3Say(can.ok?u.name+': USE it, or BACK to the list.':can.why); } }
  else if(B3.ui==='target'&&B3.pending) { const o=B3.opts[B3.sel]; b3Say(o&&o.no?o.no:B3.pending.ruckus?B3.pending.desc:'Pick who gets '+B3.pending.name+'.'); }   // b3s9: no description up here
}
function b3Render() {
  if(!B3.F||!B3.view) return;
  b3PvCompute(); b3RenderBar(); b3RenderParty(); b3RenderCmd(); b3RenderPv(); b3Info(); b3SyncTools();
  const sel=document.querySelector('#b3-cmd .b2-btn.sel'); if(sel&&sel.scrollIntoView) sel.scrollIntoView({block:'nearest'});
}

// ---------- Tap to preview ----------
// B3.pvNow is what the cursor is on, worked out by engine/b3-preview.js: {ok, why, name, cost, flavor, pepGain, rows, gives, bar, moved, P}.
// rows: one per monster the move meets, {key, name, peeve, resist, det, pips:{n,left,max,brk}, hp, hpAfter, dmg, ko}. moved: {key:{kind,n}}.
function b3PvCompute() {
  B3.pvNow=null;
  const u=B3.actor,F=B3.F; if(!u||!F||battle.state!=='command'||!['skills','skill','ruckus','target'].includes(B3.ui)) return;
  let id=null,key=null,S=null,why='';
  if(B3.ui==='skills'||B3.ui==='skill') { S=b3SkillRows(u)[B3.sel]; if(!S) return; id=S.id; const can=b3CanUse(F,u,S); if(!can.ok) { B3.pvNow={ok:false,why:can.why,name:S.name,rows:[],gives:[],moved:{},P:null}; return; }
    const os=b3Options(F,u,S).filter(o=>!o.no); if(os.length===1) key=os[0].key; else key=undefined; }
  else if(B3.ui==='ruckus') { const k=['double','full'][B3.sel]||'double',P=b3RuckusPlan(F,u,k); if(!P.ok) { B3.pvNow={ok:false,why:P.why,name:b3RuckusName(k),rows:[],gives:[],moved:{},P:null}; return; }
    id='ruckus:'+k; key=P.foeOpts.length===0?null:P.foeOpts.length===1?P.foeOpts[0].key:undefined; }
  else { const o=B3.opts[B3.sel]; if(!B3.pending||!o) return; if(o.no) { B3.pvNow={ok:false,why:o.no,name:B3.pending.name,rows:[],gives:[],moved:{},P:null}; return; } id=B3.pending.id; key=o.key; if(B3.pending.ruckus) { /* a spend */ } else S=B3_SKILLS[id]; }
  const ck=[B3.ui,id,key,u.key,F.clock,F.turnLog.length,F.ruckus,F.round].join('|');
  if(B3.pvC&&B3.pvC.k===ck) { B3.pvNow=B3.pvC.v; return; }
  let v;
  if(key===undefined) {
    // Not aimed yet: what the move would meet on each monster, and nothing more.
    const ms=S?b3Matchups(F,u,S):[];   // b3s9: only monsters with something to say are listed
    v={ok:true,name:S?S.name:'',cost:S?b3Cost(F,u,S):0,flavor:S?S.flavor.slice():[],pepGain:S&&S.slot==='basic'?2:0,rows:ms.filter(m=>m.peeve||m.resist||m.det).map(m=>({key:m.key,name:m.name,peeve:m.peeve,resist:m.resist,det:m.det,pips:m.maxPips?{n:0,left:m.pips,max:m.maxPips}:null})),gives:[],moved:{},P:null,unaimed:true};
  } else {
    const P=b3Preview(F,u,id,key);
    if(!P.ok) v={ok:false,why:P.why,name:'',rows:[],gives:[],moved:{},P:null};
    else {
      const nm=k=>b3Unit(F,k).name,rows=[];
      for(const k of Object.keys(P.tgts)) { const t=b3Unit(F,k); if(!t||t.side!=='foe') continue; const T=P.tgts[k],pp=P.pips.filter(x=>x.tgt===k),dt=P.dets.filter(x=>x.tgt===k)[0];
        rows.push({key:k,name:t.name,peeve:T.peeve,resist:T.resist,det:dt?{name:dt.name,prime:dt.prime}:null,pips:pp.length?{n:pp.reduce((a,x)=>a+x.n,0),left:pp[pp.length-1].left,max:pp[0].max,brk:P.breaks.includes(k)}:null,hp:t.hp,hpAfter:T.hpAfter,dmg:T.dmg,ko:T.ko}); }
      const gives=[...P.heals.map(h=>({k:'heal',who:nm(h.tgt),n:h.n})),...P.shields.map(h=>({k:'shield',who:nm(h.tgt),n:h.n})),...P.revives.map(k=>({k:'revive',who:nm(k),n:0}))];
      const moved={}; for(const m of P.moves) if(!moved[m.tgt]) moved[m.tgt]={kind:m.kind,n:m.n}; else moved[m.tgt].n+=m.n;
      v={ok:true,name:P.name,cost:P.cost,flavor:P.flavor,pepGain:P.pep,rows,gives,moved,P,ruckus:P.ruckus};
    }
  }
  B3.pvC={k:ck,v}; B3.pvNow=v;
}
// The words version of the preview box (Rose Mode's pictures replace this: engine/b3-pictures.js).
function b3PvHtml(v) {
  if(!v) return '';
  if(!v.ok) return '<div class="b3-pv-n">'+b2Esc(v.why||'')+'</div>';
  const chip=(t,c)=>'<span class="b3-pv-c" style="color:'+c+'">'+b2Esc(t)+'</span>';
  const fl=v.flavor.map(f=>chip(B3_FLAVORS[f].name.toUpperCase(),B3_FLAVORS[f].color)).join('');
  const head='<div class="b3-pv-h"><b>'+(v.cost?v.cost+' PEP':'FREE')+'</b>'+fl+(v.pepGain>0?'<i>+'+v.pepGain+' Pep</i>':'')+'</div>';
  const rows=v.rows.map(r=>'<div class="b3-pv-r"><span>'+b2Esc(r.name)+'</span>'+(r.peeve?chip('PET PEEVE','#8fe3a6'):'')+(r.resist?chip('RESISTS','#ff9a8a'):'')+(r.det?chip(r.det.name.toUpperCase(),'#ffe27a'):'')+
    (r.pips&&r.pips.n?chip('PIPS -'+r.pips.n+' ('+r.pips.left+' of '+r.pips.max+')','#ffd36b'):'')+(r.pips&&r.pips.brk?chip('BREAK!','#ff9a8a'):'')+(r.ko?chip('KNOCKED OUT','#ff9a8a'):'')+'</div>').join('');
  const gv=v.gives.map(g=>'<div class="b3-pv-r"><span>'+b2Esc(g.who)+'</span>'+chip(g.k==='heal'?'+'+g.n+' HP':g.k==='shield'?'+'+g.n+' SHIELD':'BACK UP','#8fe3a6')+'</div>').join('');
  const mv=Object.keys(v.moved).map(k=>{ const m=v.moved[k]; return '<div class="b3-pv-r"><span>'+b2Esc(b3Unit(B3.F,k).name)+'</span>'+chip((m.kind==='push'?'FALLS BACK ':'COMES SOONER ')+Math.round(m.n),'#ffb070')+'</div>'; }).join('');
  const nxt=v.P&&B3.actor?(()=>{ const i=v.P.bar.findIndex(e=>e.k===B3.actor.key); return i<0?'':'<div class="b3-pv-b">'+b2Esc(B3.actor.name)+'\u2019s next turn: '+(i===0?'right after this':'after '+i+(i===1?' other turn':' other turns'))+'.</div>'; })():'';
  return head+rows+gv+mv+nxt;
}
function b3RenderPv() {
  const el=document.getElementById('b3-pv'); if(!el) return;
  el.innerHTML=b3PvHtml(B3.pvNow);
}

// ---------- The full list for one unit (statuses, shields, the floor) ----------
function b3OpenInfo(key) {
  if(!B3.active||battle.state!=='command'||!B3.actor||!['cross','skills','skill','info'].includes(B3.ui)||!b3Unit(B3.F,key)) return false;
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
  if(S.anim&&S.anim.kind==='clip') { b3cWant(S.anim.clip,12000); b3cWant(b3cOf(u.id,'run'),12000); }   // start loading the move's clip while the player picks the target
  if(opts.length===1&&!opts[0].no) { b3Commit(S.id,opts[0].key); return; }
  B3.pending=S; B3.opts=opts; B3.prevUi=B3.ui; B3.prevSel=B3.sel;
  b3Open('target',b3RecTarget(opts,S.id));
}
// RUCKUS > DOUBLE TEAM or FULL FAMILY RUCKUS: a move aimed at one monster asks which; otherwise it goes at once.
function b3ChooseRuckus(kind) {
  const u=B3.actor,P=b3RuckusPlan(B3.F,u,kind);
  if(!P.ok) { b3Sfx('nope'); b3Say(P.why); return; }
  b3Sfx('select');
  if(!P.foeOpts.length) { b3Commit('ruckus:'+kind,null); return; }
  if(P.foeOpts.length===1) { b3Commit('ruckus:'+kind,P.foeOpts[0].key); return; }
  B3.pending={id:'ruckus:'+kind,ruckus:kind,name:b3RuckusName(kind),desc:'Pick the monster. '+P.partner.name+' joins in.'}; B3.opts=P.foeOpts; B3.prevUi='ruckus'; B3.prevSel=B3.sel;
  b3Open('target',b3RecTarget(B3.opts,B3.pending.id));
}
function b3Cross(d) {
  const u=B3.actor; if(!u) return;
  if(d==='up') b3Choose(B3_SKILLS[u.basic]);
  else if(d==='right') { if(!b3SkillRows(u).length) { b3Sfx('nope'); b3Say(u.name+' has no Skills in this build yet. They arrive in the next stages.'); return; } b3Sfx('select'); b3Open('skills',b3RecRow()); }
  else if(d==='left') { if((B3.F.ruckus||0)<B3_RULES.ruckus.doubleTeam) { b3Sfx('nope'); b3Say('The Family Ruckus is at '+Math.round(B3.F.ruckus)+'%. A Mix, a Detonation, extra hits and a Break fill it. Double Team costs 50%, Full Family Ruckus 100%.'); return; } b3Sfx('select'); b3Open('ruckus',(()=>{ const r=b3Rec(); return r&&r.kind==='ruckus'&&r.skill==='ruckus:full'?1:0; })()); }
  else if(d==='down') { b3Sfx('nope'); b3Say('The BAG is not built yet in the new battle. It arrives in a later stage.'); }
}
function b3Pick(i) {
  const u=B3.actor;
  if(B3.ui==='done') { b3Sfx('select'); const over=B3.F.over; if(B3.cfg.beforeEnd&&over==='win'&&!B3.leaving) { B3.leaving=true; B3.cfg.beforeEnd(over,()=>{ B3.leaving=false; b3End(over); }); } else b3End(over); return; }   // beforeEnd: the story's victory card, shown over the fight before it closes
  if(B3.ui==='skills') { const S=b3SkillRows(u)[i]; if(S) { B3.sel=i; b3Choose(S); } }   // skillinfo1: the row uses the Skill (the i opens the card)
  else if(B3.ui==='skill') { const S=b3SkillRows(u)[B3.sel]; if(S) b3Choose(S); }
  else if(B3.ui==='ruckus') { const k=['double','full'][i]; if(!k) return; B3.sel=i; b3ChooseRuckus(k); }
  else if(B3.ui==='target') { const o=B3.opts[i]; if(!o) return; if(o.no) { b3Sfx('nope'); b3Say(o.no); return; } b3Sfx('select'); b3Commit(B3.pending.id,o.key); }
}
// The i on a Skill row, or the I key / pad Y with the cursor on a row: the card with everything about that Skill.
function b3OpenCard(i) { if(B3.ui!=='skills'||!b3SkillRows(B3.actor)[i]) return false; b3Sfx('move'); b3Open('skill',i); return true; }
function b3IKey() { if(B3.ui==='info') b3Back(); else if(B3.ui==='skills'&&b3OpenCard(B3.sel)) return; else if(B3.actor) b3OpenInfo(B3.actor.key); }
function b3Back() {
  if(battle.state!=='command'||B3.ui==='done') return;
  if(B3.ui==='info') { b3Sfx('move'); b3Open(B3.infoFrom==='skills'||B3.infoFrom==='skill'?B3.infoFrom:'cross',B3.infoSel||0); }
  else if(B3.ui==='skill') { b3Sfx('move'); b3Open('skills',B3.sel); }
  else if(B3.ui==='skills') { if(b3Granted()===B3.actor) { b3Sfx('nope'); b3Say('Pick a free Skill for '+B3.actor.name+'.'); return; } b3Sfx('move'); b3Open('cross'); }
  else if(B3.ui==='ruckus') { b3Sfx('move'); b3Open('cross'); }
  else if(B3.ui==='target') { b3Sfx('move'); const p=['skills','skill','ruckus'].includes(B3.prevUi)?B3.prevUi:'cross'; B3.pending=null; B3.opts=[]; b3Open(p,B3.prevSel||0); }
}
function b3Move(d) {
  if(B3.ui==='info') { const K=b3InfoKeys(),i=Math.max(0,K.indexOf(B3.infoKey)); B3.infoKey=K[(i+(d==='up'||d==='left'?K.length-1:1))%K.length]; b3Sfx('move'); b3Render(); return; }
  if(B3.ui==='skill') return;
  const n=B3.ui==='ruckus'?2:B3.ui==='skills'?b3SkillRows(B3.actor).length:B3.ui==='target'?B3.opts.length:0; if(!n) return;
  B3.sel=(B3.sel+(d==='up'||d==='left'?n-1:1))%n; B3.armed=B3.sel; b3Sfx('move'); b3Render();
}
// The cursor moves without rebuilding the buttons under the finger.
function b3Hover(i) {
  B3.sel=i; B3.armed=i;
  document.querySelectorAll('#b3-cmd .b2-btn[data-i]').forEach(b=>b.classList.toggle('sel',Number(b.dataset.i)===i));
  b3PvCompute(); b3RenderBar(); b3RenderParty(); b3RenderPv(); b3Info();
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
  if(c==='KeyI') { if(!e.repeat) b3IKey(); return; }
  if(dirs[c]) { e.preventDefault(); if(!e.repeat||B3.ui!=='cross') b3Dir(dirs[c]); }
  else if((c==='Enter'||c==='Space')&&!e.repeat) { e.preventDefault(); b3A(); }
  else if((c==='Escape'||c==='Backspace'||c==='KeyX')&&!e.repeat) { e.preventDefault(); b3Back(); }
}
function b3Pad(dir,dirEdge,A,B,Y) {
  if(Y) { b3IKey(); return; }   // the same as the I key
  if(dirEdge&&dir) b3Dir(dir);
  if(A) b3A(); else if(B) b3Back();
}
// The living enemy under a canvas point (its picture plus a little slack, and the HP bar under its feet).
function b3FoeAt(x,y) {
  let best=null,bd=1e9;
  for(const f of b3Live(B3.F,'foe')) {
    if(!B3P.foe[f.key]) continue;   // an add that has not walked in yet
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

// WIN NOW (admin option, OPTIONS page, B7.skipBtn): every foe goes down at the next safe moment (between actions) and the fight ends on the
// normal win screen, so rewards are paid as usual. Real fights only, never the Battle Lab.
function b3SkipFight() {
  if(!B7.skipBtn||!B3.active||(B3.cfg&&B3.cfg.lab)||B3.F.over||B3.ui==='done') return;
  B3.skipNow=true;
  if(battle.state==='command') b3DoSkip();
}
function b3DoSkip() {
  B3.skipNow=false; const F=B3.F; if(!B3.active||F.over) return;
  for(const f of F.foes) if(!f.ko) f.hp=0;
  const c={beats:[],g:'end',actor:null,ledger:{}};
  b3KoCheck(F,c); b3CheckOver(F); b3OverBeats(F,c.beats,'end');
  B3.actor=null; B3.pending=null; B3.opts=[]; B3.ui='busy'; battle.state='busy'; b3Render();
  b3Play(c.beats,()=>{ if(B3.active) b3Finish(); });
}

// ---------- EXIT (Battle Lab) and speed, at the top right of the picture ----------
function b3SyncTools() {
  const T=$('b3-tools'),cv=$('battle-canvas'); if(!T||!cv) return;
  T.hidden=!B3.active; if(!B3.active) return;
  const st=T.parentElement;
  T.style.top=(cv.offsetTop+6)+'px'; T.style.right=Math.max(4,st.clientWidth-(cv.offsetLeft+cv.offsetWidth)+6)+'px';
  $('b3-exit').hidden=!(B3.cfg&&B3.cfg.lab);
  $('b3-skip').hidden=!(B7.skipBtn&&B3.cfg&&!B3.cfg.lab);   // WIN NOW: real fights only
  const s=$('b3-speed'); s.textContent=B7.speed+'x'; s.classList.toggle('on',B7.speed===2);
}
function b3Speed() { b7ToggleSpeed(); b3SyncTools(); b3Say('Battle speed '+B7.speed+'x.'); }
function b3Exit() { if(!B3.active) return; b3Sfx('select'); b3End('run'); }

(function b3Wire() {
  const ui=$('b3-ui'),cv=$('battle-canvas'),st=document.querySelector('#battle .battle-stage'); if(!ui||!cv||!st) return;
  const tools=document.createElement('div'); tools.id='b3-tools'; tools.className='b7-tools'; tools.hidden=true;
  tools.innerHTML='<button type="button" id="b3-exit" class="exit" aria-label="Exit to the Battle Lab list" hidden>EXIT</button><button type="button" id="b3-skip" aria-label="Win this fight now" hidden>WIN NOW</button><button type="button" id="b3-speed" aria-label="Battle speed">1x</button>';
  st.appendChild(tools);
  $('b3-exit').addEventListener('click',e=>{ e.stopPropagation(); b3Exit(); });
  $('b3-speed').addEventListener('click',e=>{ e.stopPropagation(); b3Speed(); });
  $('b3-skip').addEventListener('click',e=>{ e.stopPropagation(); b3SkipFight(); });
  ui.addEventListener('pointerdown',e=>{ B3.ptr=e.pointerType||'touch'; },true);
  cv.addEventListener('pointerdown',e=>{ B3.ptr=e.pointerType||'touch'; },true);
  ui.addEventListener('click',e=>{
    if(!B3.active||battle.state!=='command') return;
    if(e.target.closest('[data-done]')) { b3Pick(0); return; }
    if(B3.ui==='done') return;
    const x=e.target.closest('.b2-x'); if(x) { if(B3.ui==='cross') b3Cross(x.dataset.d); return; }
    if(e.target.closest('[data-back]')) { b3Back(); return; }
    if(e.target.closest('[data-use]')) { if(B3.ui==='skill') b3Pick(0); return; }
    const ii=e.target.closest('[data-info]'); if(ii) { const r=ii.closest('.b2-btn[data-i]'); if(r) b3OpenCard(Number(r.dataset.i)); return; }
    const b=e.target.closest('.b2-btn');
    if(b&&b.dataset.i!=null) {
      const i=Number(b.dataset.i);
      // A tap on a Skill row uses it (or asks who, when it needs a target); the i opens the card (skillinfo1). In RUCKUS and the target list, on a phone the first tap only
      // highlights a row and previews it; a tap on the highlighted row uses it.
      if(B3.ptr&&B3.ptr!=='mouse'&&(B3.ui==='ruckus'||B3.ui==='target')&&i!==B3.armed) { b3Sfx('move'); b3Hover(i); return; }
      b3Pick(i); return;
    }
    // Tap a party card to aim at that family member; with no target to pick, the tap opens their full list.
    const pc=e.target.closest('.b2-pc');
    if(pc&&B3.ui==='target') { const u=B3.F.party[Number(pc.dataset.i)],k=B3.opts.findIndex(o=>o.units.length===1&&o.units[0]===u);
      if(k>=0) { if(B3.ptr&&B3.ptr!=='mouse'&&k!==B3.armed) { b3Sfx('move'); b3Hover(k); } else b3Pick(k); } }
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
    if(k!==B3.armed&&((B3.ptr&&B3.ptr!=='mouse')||(B3.opts[k].units.length>1&&k!==B3.sel))) { b3Sfx('move'); b3Hover(k); return; }
    b3Pick(k);
  });
  cv.addEventListener('pointermove',e=>{
    if(!B3.active||e.pointerType!=='mouse') return;
    const k=b3TargetAt(e.clientX,e.clientY),q=B3.ui!=='target'&&battle.state==='command'?b2CanvasPt(e.clientX,e.clientY):null;
    cv.style.cursor=k>=0||(q&&q.inside&&b3FoeAt(q.x,q.y))?'pointer':'';
    if(k>=0&&k!==B3.sel) b3Hover(k);
  });
})();
