'use strict';
// engine/b3-ui.js: Battle 3's fight flow: starting and ending a fight, the turn flow, the turn bar, the tools at its right end.
// It asks the rules what happened (b3Next, b3Act, b3FoeTurn), hands the beats to the play layer (engine/b3-play.js) and waits for it to finish.
// It never changes the fight itself. The screen the player picks moves on (the deck, the aim, the tray, the party cards, the input) is
// engine/b3-deck.js; its look is b3-deck.css, scoped to #battle.v3; the words it adds are data/b3-ux-words.js.
// A granted free Skill (Grace's Colossal Diamond-Gold Dumpling; the rules keep it in F.grant): when the move that granted it has played, the
// deck opens for the family member who got it, holding only the Skills they may take, each marked FREE, with no way out, as before.
// Difficulties with `recommend` (Rose Mode): one move glows (b3Recommend) and the highlight starts on it.

// ---------- Start and end ----------
// cfg: party (ids), level or levels, formation (a B3_FORMATIONS id) or foes, bg (a backdrop key), seed, lab (true in the
// Battle Lab: EXIT shows), auto (true: the simple player picks every move, for tests), hpPct and mods (tests), onEnd(result),
// loadouts ({id: loadout}: each member's Vibes, Quirks, VP and row, engine/b3-progress.js) or rank (every Vibe at that Rank),
// award(F) (called once on a win; returns the line the win screen adds, for example the Vibe Points earned).
// first (the Battle Guide's "See it in a fight": a move or a monster act to open with, see b3FirstSet), keepLoadout (member ids whose loadout Rose Mode leaves as given).
// Story fights add onTurn(unit) (a tip when a family member's turn opens) and beforeEnd(result, go) (called on CONTINUE after a win; the
// story shows its victory card and calls go() to close the fight).
function b3Start(cfg) {
  B3.cfg=cfg; B3.skipNow=false; B3.recC=null; B3.pvC=null; B3.awarded=false; B3.leaving=false; B3.won=''; B3.result=null; B3.actor=null; B3.ui='busy'; B3.sel=0; B3.view=null; B3.log=[]; B3.turnOf=null;
  B3.deck=[]; B3.aimK=null; B3.look=null; B3.lookNo=''; B3.sheet=null; B3.note=''; B3.say=''; B3.last={}; B3.pvNow=null;
  const mods=Object.assign({foeHp:b7FoeHp(),taken:b7Taken(),foeSpeed:typeof b7FoeSpeed==='function'?b7FoeSpeed():1},cfg.mods||{});
  // Rose Mode (pictures on) picks the Vibes and Quirks itself: the Sig Vibes and the newest written Quirks, from the same Ranks.
  let loadouts=cfg.loadouts;
  if(!cfg.plain&&typeof b7Diff==='function'&&b7Diff().pictures&&(loadouts||cfg.rank)) {
    const src=loadouts||{}; loadouts={};
    for(const id of cfg.party) if(typeof b3HasKit==='function'&&b3HasKit(id)) loadouts[id]=(cfg.keepLoadout||[]).includes(id)&&src[id]?src[id]:b3RoseLoadout(id,src[id]||b3NewLoadout(id,cfg.rank));   // keepLoadout: the Battle Guide's "See it in a fight" needs this member's Vibe as set
  }
  B3.F=b3NewFight({party:cfg.party,level:cfg.level,levels:cfg.levels,formation:cfg.formation,foes:cfg.foes,seed:cfg.seed,hpPct:cfg.hpPct,hpShare:cfg.hpShare,gear:cfg.gear,rows:cfg.rows,setup:cfg.setup,
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
  B.classList.toggle('v3',on); B.classList.remove('v2');   // v3 marks Battle 3's own screen (b3-deck.css); battle 2 keeps v2
  $('b2-ui').hidden=true; $('b2-ribbon').hidden=true; $('b3-bar').hidden=!on;
  if(on) B.hidden=false;
  b3SyncTools();
}
function b3End(result) {
  if(B3.F&&B3.cfg&&B3.cfg.onRuckus) B3.cfg.onRuckus(B3.F.ruckus);   // the gauge goes on to the next fight
  B3.active=false; B3.result=result; B3.ui='busy'; B3.actor=null; B3.deck=[]; B3P.q.length=0;
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
    b3OpenDeck();
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
    else { b3Sfx('select'); b3OpenDeck(); return; }
  }
  b3Flow();
}
// The player's pick goes to the rules; the whole result comes back as beats and is played.
function b3Commit(skillId,optKey) {
  const u=B3.actor,r=/^ruckus:/.test(skillId)?b3Ruckus(B3.F,u,skillId.slice(7),optKey):b3Act(B3.F,u,skillId,optKey);
  if(!r.ok) { b3Nope(r.why); return false; }
  B3.ui='busy'; battle.state='busy'; B3.look=null; B3.sheet=null; B3.note='';
  b3Render();
  b3Play(r.beats,b3AfterAct);
  return true;
}
function b3Finish() {
  b3ViewSync(); B3.actor=null;
  const win=B3.F.over==='win';
  // A win may pay something (Vibe Points in the Battle Lab): the line it returns is said on the win screen.
  if(win) { if(B3.cfg.award&&!B3.awarded) { B3.awarded=true; B3.won=B3.cfg.award(B3.F)||''; }
    B3P.cheer=true; B3P.cheerAt=null; for(const m of B3.F.party) b3cWant(b3cOf(m.id,'victory'),9000); b3Sfx('win'); b3Word('YOU WIN!','#ffe27a'); b3Say('The family wins! '+(B3.won?B3.won:'')); }
  else if(B3.F.over!=='lose') { b3Sfx('thud'); b3Word(B3.F.endWord||'THE END','#aee6ff'); b3Say(B3.F.endLine||'The fight ends here.'); }   // a scripted end (engine/b3-script.js): flee, shell
  else { b3Sfx('lose'); b3Word('KNOCKED OUT','#ff9a8a'); b3Say('Everyone is knocked out.'); }
  B3.ui='done'; battle.state='command'; b3Render();
}

// ---------- The deck opens: the player picks (engine/b3-deck.js) ----------
function b3OpenDeck() {
  B3.ui='deck'; battle.state='command'; B3.deck=b3DeckBuild(); B3.sel=b3DeckStart(); B3.look=null; B3.lookNo=''; B3.sheet=null; B3.note='';
  b3AimDefault(B3.deck[B3.sel]);
  if(b3Granted()===B3.actor&&B3.F.grant.by) { const t=bxW(B3_FORECAST.freeFrom,{who:b3Name(B3.F.grant.by)}); B3.note=t; const el=$('b3-msg'); if(el) el.textContent=t; }   // a free Skill says whose it is
  b3Render();
}

// ---------- The turn bar: the next 8 turns, a divider where a round ends, a ghost where the actor will land ----------
function b3RenderBar(moved) {
  const box=$('b3-ticks'); if(!box||!B3.F) return;
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

function b3Render() {
  if(!B3.F||!B3.view) return;
  b3DeckRefresh(); b3PvCompute(); b3RenderBar(); b3RenderParty(); b3RenderDeck(); b3RenderTray(); b3RenderSheet(); b3SyncTools(); b3DeckScroll();
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
  B3.actor=null; B3.ui='busy'; battle.state='busy'; b3Render();
  b3Play(c.beats,()=>{ if(B3.active) b3Finish(); });
}

// ---------- EXIT (Battle Lab), WIN NOW, speed and DETAILS, at the right end of the turn bar ----------
function b3SyncTools() {
  const T=$('b3-tools'); if(!T) return;
  T.hidden=!B3.active; if(!B3.active) return;
  $('b3-exit').hidden=!(B3.cfg&&B3.cfg.lab);
  $('b3-skip').hidden=!(B7.skipBtn&&B3.cfg&&!B3.cfg.lab);   // WIN NOW: real fights only
  const s=$('b3-speed'); s.textContent=B7.speed+'x'; s.classList.toggle('on',B7.speed===2);
  const d=$('b3-sw'); if(d) { const on=b3Details(); d.classList.toggle('on',on); d.setAttribute('aria-pressed',on); }
}
function b3Speed() { b7ToggleSpeed(); b3SyncTools(); b3Say('Battle speed '+B7.speed+'x.'); }
function b3Exit() { if(!B3.active) return; b3Sfx('select'); b3End('run'); }
