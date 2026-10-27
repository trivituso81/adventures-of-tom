'use strict';
// engine/battle2.js — The battle core (F3, F4): CTB turn order, VP, six stats, damage formulas, elements, statuses,
// enemy formations of 1 to 4 in a front and back row, targeting, signatures and effects, KO and revive, boss intents
// and Stagger shields, rewards. It reuses the battle screen, its canvas, the party drawing in drawBattle (party units
// are thin copies of the real members) and the queue (enqueue: strings, delays, functions).
// UI, input and enemy drawing live in engine/battle2-ui.js; move animations in engine/battle2-moves.js.

const B2={active:false,units:[],party:[],foes:[],actor:null,ui:'busy',sel:0,opts:[],pending:null,
  lastSkill:{},lastTarget:null,bag:[],fx:[],onEnd:null,cfg:null,result:null,round:0,move:null,aim:null,prev:null,coinsWon:0};

// ---------- Units ----------
function b2PartyUnit(id,lvl,i,carry) {
  const mem=memberById(id),u=Object.create(mem),all=!!(B2.cfg&&B2.cfg.allSkills);
  // F6: the kit is what the Stampcard holds (the Battle Lab knows everything); gear adds flat stats; perks from
  // Keepsake Charms (engine/progress.js b6Perks).
  Object.assign(u,{side:'party',id,name:mem.name,lvl,idx:i,guard:false,st:{},turns:0,kit:b6Kit(id,all),perk:b6Perks(mem,all)});
  for(const k of B2_STAT_KEYS) u[k]=b2Stat(id,k,lvl)+statBonus(mem,k);
  u.maxHp=u.hp; u.vp=Math.min(B2_VP.cap,B2_VP.start+(u.perk.startVp||0));
  // In the full game HP carries over between fights as a share of the member's own HP.
  if(carry&&mem.maxHp) u.hp=mem.hp<=0?0:Math.max(1,Math.round(u.maxHp*mem.hp/mem.maxHp));
  return u;
}
function b2FoeUnit(id,row,i,lvl) {
  const D=b2FoeDef(id),def=MONSTERS[id]||MONSTERS.mudling,L=Math.max(D.level,lvl||D.level),up=L-D.level;
  const u={side:'foe',id,def,D,name:def.name,lvl:L,idx:i,row,st:{},turns:0,acts:D.acts,weak:D.weak,resist:D.resist,
    shake:0,flash:0,lunge:0,dying:-1,dead:false,parts:[],boss:D.boss||null,phase:1,intent:null,shield:null,step:0};
  for(const k of B2_STAT_KEYS) u[k]=D[k]+up*(k==='hp'?D.step*6:D.step);
  // Difficulty (engine/feel.js): Rose Mode monsters have less HP, Director Mode more.
  u.hp=Math.max(1,Math.round(u.hp*b7FoeHp())); u.maxHp=u.hp;
  // Kindness (engine/battle2-kind.js): the pink Warmth bar.
  const G=b2Grump(id); u.warm=0; u.warmGoal=Math.round(G.goal*(1+Math.max(0,L-D.level)*B2_KIND_GOAL_STEP)); u.likes=b8Likes(G.likes); u.grumpy=G.grumpy; u.kindLog={};
  for(const s of (D.start||[])) u.st[s[0]]={turns:s[1]};
  return u;
}
const b2Alive=u=>u&&u.hp>0&&!u.dead&&!u.calm;   // calm: Un-Grumped (Kindness)
const b2LiveFoes=()=>B2.foes.filter(b2Alive);
const b2LiveParty=()=>B2.party.filter(b2Alive);
const b2Tom=()=>B2.party.find(p=>p.id==='tom');
// A stat with statuses (and Nara's frantic trait) applied.
function b2Eff(u,k) {
  let m=1;
  for(const id in u.st) { const d=B2_STATUS[id]; if(d&&d.mod&&d.mod[k]) { const a=u.st[id].amt; m+=a!=null?Math.sign(d.mod[k])*a:d.mod[k]; } }
  if(u.id==='nara'&&u.side==='party') { const t=b2Tom(); if(t&&!b2Alive(t)) { if(k==='pow') m+=.5; if(k==='pep') m+=.3; } }
  if(k==='pep'&&u.side==='party') m+=b2Cadence();   // Amy's Pace Setter (engine/battle2-traits.js)
  if(u.perk&&u.perk.stat[k]) m+=u.perk.stat[k];       // Charm perks and passive stamps (engine/progress.js)
  return Math.max(1,u[k]*Math.max(.2,m));
}
function b2Pep(u) { return b2Eff(u,'pep'); }
function b2Delay(u,weight) { return Math.floor(1200/(b2Pep(u)+30)*(B2_WEIGHT[weight]||weight||1)/(u.side==='foe'?b7FoeSpeed():1)); }   // Director: monsters act more often
const b2HasDebuff=u=>Object.keys(u.st).some(k=>B2_STATUS[k]&&B2_STATUS[k].debuff);
const b2Sum=(u,key)=>{ let s=0; for(const id in u.st) { const d=B2_STATUS[id]; if(d&&d[key]) s+=d[key]; } return s; };
// drawBattle draws whatever this returns as the party.
function battlePartyList() { return battle.v2?B2.party:party; }

// ---------- Start and end ----------
// cfg: party (ids), level (number) or levels ({id:level}), foes ([id,row,level] or {id,row,level}), bag (array; the real
// bag in the full game), npc (the overworld monster, for rewards), carry (HP carries over), onEnd(result).
function b2Start(cfg) {
  B2.cfg=cfg; B2.onEnd=cfg.onEnd||null; B2.result=null; B2.stolen=[]; B2.round=0; B2.coinsWon=0; B2.prev=null; B2.move=null; B2.aim=null;
  B2.pieUsed=false; B2.snackWait=null; b7BattleStart();   // engine/feel.js
  B2.party=cfg.party.map((id,i)=>b2PartyUnit(id,(cfg.levels&&cfg.levels[id])||cfg.level||1,i,cfg.carry));
  // Front row first (up to 3), then back row (up to 2); 4 at most in all.
  const list=cfg.foes.slice(0,4).map(f=>Array.isArray(f)?{id:f[0],row:f[1]||'front',level:f[2]}:f);
  let front=list.filter(f=>f.row!=='back'),back=list.filter(f=>f.row==='back');
  while(front.length>3) back.push(front.pop()); while(back.length>2) front.push(back.pop());
  B2.foes=[...front.map(f=>b2FoeUnit(f.id,'front',0,f.level)),...back.map(f=>b2FoeUnit(f.id,'back',0,f.level))];
  b2Letters();
  B2.units=[...B2.party,...B2.foes];
  B2.bag=cfg.bag||B2_LAB_BAG.slice();
  B2.fx=[]; B2.lastSkill={}; B2.lastTarget=null; B2.actor=null; B2.pending=null;
  b2HeartStart(cfg); b6StartPerks();
  b2TraitsStart();   // engine/battle2-traits.js
  // Opening turn order: everyone starts partway down their first wait; the party gets a small head start.
  for(const u of B2.units) u.ct=Math.floor(b2Delay(u,1)*(u.side==='party'?.55:.75+Math.random()*.25));
  // Monsters that always go first (the Clapper Snapper): ahead of everyone on the opening ribbon.
  for(const f of B2.foes) if(f.D.first) f.ct=-1-f.idx;
  b2ResetStage();
  battle.active=true; battle.v2=true; battle.enemy=null; battle.monster=cfg.npc||null; battle.state='busy';
  B2.active=true;
  b2ShowUI(true); b2Render();
  sfx.intro();
  const first=B2.foes[0].def,n=B2.foes.length;
  const intro=n===1?first.intro:(B2.foes.every(f=>f.id===first.id)?(['','','Two','Three','Four'][n]+' '+first.name+'s show up!'):'Monsters show up!');
  const steps=[()=>b2Msg(intro),()=>sfx.grumpTaunt(),1300];
  for(const f of B2.foes) if(f.boss) steps.push(...b2BossOpen(f));
  enqueue(...steps,()=>b2Advance());
}
function b2Letters() {
  const live=B2.foes.filter(f=>!f.dead),count={};
  for(const f of live) count[f.id]=(count[f.id]||0)+1;
  for(const f of live) {
    if(count[f.id]>1&&!f.letter) { const used=new Set(live.filter(g=>g.id===f.id&&g.letter).map(g=>g.letter)); f.letter=[...'ABCD'].find(c=>!used.has(c)); }
    f.name=f.def.name+(f.letter?' '+f.letter:'');
  }
  B2.foes.forEach((f,i)=>f.idx=i);
}
// The same reset the old battle did, so drawBattle starts clean.
function b2ResetStage() {
  while(battle.fx.length<B2.party.length) battle.fx.push(Object.assign({},battle.fx[0]));
  BATTLE_POS.length=0; for(const q of ([null,BATTLE_POS1,BATTLE_POS2,BATTLE_POS3][B2.party.length]||BATTLE_POS4)) BATTLE_POS.push(q);
  if(typeof RFX!=='undefined') RFX.reset();
  for(const f of battle.fx) { for(const k in f) if(typeof f[k]==='number') f[k]=0; f.poseK=''; f.path=null; f.koAt=null; f.levelUp=false; }
  Object.assign(battle,{props:[],hose:null,lift:null,enemyAtkDown:0,missing:false,pops:[],time:0,shakeEnemy:0,flashEnemy:0,enemyLunge:0,slash:0,vapor:0,
    enemyStunned:0,block:null,vaporParts:[],enemyGone:true,enemyKnock:0,laser:null,boop:null,fireball:null,tetris:null,texts:[],actor:0,actorPos:null});
  clearBattleQueue(); clearInput();
}
function b2End(result) {
  clearBattleQueue();
  b2HeartSave();   // engine/battle2-kind.js
  B2.active=false; B2.result=result; B2.aim=null; B2.move=null;
  battle.active=false; battle.v2=false; battle.state='idle'; battle.enemy=null;
  b2ShowUI(false);
  $('battle').hidden=true;
  if(typeof canvas!=='undefined'&&canvas.focus) canvas.focus();
  if(typeof renderMenu==='function') renderMenu();
  b7AfterBattle(result);   // engine/feel.js: a short breather before map monsters can engage again
  if(B2.onEnd) B2.onEnd(result);
  if(B2.cfg&&B2.cfg.npc&&typeof saveGame==='function') saveGame('auto',true);   // quiet autosave after every real fight: win, lose or run (Battle Lab fights have no npc)
}

// ---------- Turn order ----------
function b2Advance() {
  if(!B2.active) return;
  if(B2.foes.some(f=>f.boss&&!b2Alive(f))) for(const c of b2LiveFoes()) if(c.D.inert) { c.hp=0; b2FoeDown(c); }   // buried acorns go with their boss
  if(!b2LiveFoes().length) return b2Win();
  if(!b2LiveParty().length) return b2Lose();
  const live=B2.units.filter(b2Alive);
  const m=Math.min(...live.map(u=>u.ct));
  for(const u of live) u.ct-=m;
  const u=live.find(x=>x.ct<=0);   // party first on ties, then enemies, in slot order
  B2.actor=u; u.turns++; B2.round++;
  if(u.side==='party') {
    // CUT! (the Director's Cut): this turn is lost. Back to one.
    if(u.st.cut||u.st.grounded) {
      const gr=!u.st.cut; delete u.st.cut; delete u.st.grounded; u.ct=b2Delay(u,'standard'); battle.actor=u.idx; battle.state='busy'; B2.ui='busy'; b2Render();
      enqueue(()=>{ b2Msg(gr?'The gate closed on '+u.name+'. '+u.name+' is stuck at the gate and loses this turn.':u.name+' was CUT. Back to one. '+u.name+' loses this turn.'); sfx.stun(); b2PopParty(u,gr?'GROUNDED':'CUT!','#ff8f80'); },1300,()=>{ b2TickStatus(u); B2.skipTurn=true; b2AfterAction(); });
      return;
    }
    b2TickStatus(u); b2TraitTurn(u);
    if(B2.snackWait) { B2.snackWait.delete(u); if(!B2.snackWait.size) B2.snackWait=null; }   // Director: one snack per round
    u.vp=Math.min(B2_VP.cap,u.vp+B2_VP.regen);
    battle.actor=u.idx;
    const steps=[];
    const rg=u.perk&&u.perk.regen;
    if(rg&&u.hp<u.maxHp&&!u.st.tucked) steps.push(()=>{ const h=Math.min(u.maxHp-u.hp,Math.max(1,Math.round(u.maxHp*rg))); u.hp+=h; b2PopParty(u,'+'+h,'#9be39a'); b2Render(); },350);
    if(u.st.tucked&&u.hp<u.maxHp) steps.push(()=>{ const h=Math.min(u.maxHp-u.hp,Math.round(u.maxHp*B2_STATUS.tucked.regen)); u.hp+=h; b2PopParty(u,'+'+h,'#9be39a'); sfx.heal(); b2Msg(u.name+' is Tucked In. +'+h+' HP.'); b2Render(); },650);
    enqueue(...steps,()=>b2Open('cross'));
  } else {
    battle.state='busy'; B2.ui='busy'; b2Render();
    enqueue(250,()=>b2FoeTurn(u));
  }
}
function b2TickStatus(u) {
  for(const k of Object.keys(u.st)) {
    const d=B2_STATUS[k];
    if(k==='guarded'||(d&&d.perm)||(d&&d.skip)) continue;   // guarded ends with Tom's guard; skips are used up on the turn they take
    const s=u.st[k]; if(s.wait) { s.wait=false; continue; }   // an Option 3 status on a monster (b2Effect 'st')
    s.turns--;
    if(s.turns<=0) {
      delete u.st[k];
      if(k==='guard') { u.guard=false; const f=s.for; if(f&&f.st.guarded) delete f.st.guarded; }
    }
  }
}
// Who acts next: the next 8 turns. With `weight`, the current actor's next turn uses that move weight (preview).
function b2Forecast(weight,n=8) {
  const live=B2.units.filter(b2Alive);
  const ct=new Map(live.map(u=>[u,u.ct]));
  const out=[];
  if(B2.actor&&b2Alive(B2.actor)) { out.push({u:B2.actor,now:true}); ct.set(B2.actor,b2Delay(B2.actor,weight||'standard')); }
  let guard=0,ghosted=false;
  const seenIntent=new Set();
  while(out.length<n&&guard++<50) {
    const m=Math.min(...live.map(u=>ct.get(u)));
    for(const u of live) ct.set(u,ct.get(u)-m);
    const u=live.find(x=>ct.get(x)<=0);
    const ghost=!!weight&&!ghosted&&u===B2.actor; if(ghost) ghosted=true;
    const intent=u.side==='foe'&&(u.intent||u.st.staggered)&&!seenIntent.has(u)&&u!==B2.actor; if(intent) seenIntent.add(u);
    out.push({u,ghost,intent});
    ct.set(u,b2Delay(u,'standard'));
  }
  return out;
}

// ---------- Formulas (section 3) ----------
function b2ElemMult(act,t) {
  const els=[].concat(act.elem||[]);
  if(els.some(e=>(t.weak||[]).includes(e))) return {m:B2_WEAK,weak:true};
  if(els.length&&els.every(e=>(t.resist||[]).includes(e))) return {m:B2_RESIST,resist:true};
  return {m:1};
}
function b2Damage(a,act,t,mult) {
  const st=act.stat||'pow';
  const atk=st==='hybrid'?(b2Eff(a,'pow')+b2Eff(a,'warmth'))/2:b2Eff(a,st);
  const def=st==='pow'?b2Eff(t,'grit'):st==='warmth'?b2Eff(t,'cool'):(b2Eff(t,'grit')+b2Eff(t,'cool'))/2;
  const E=b2ElemMult(act,t);
  let dmg=Math.max(1,(atk*2.5-def*1.2)*(mult==null?act.mult:mult))*E.m;
  const crit=(act.crit||0)>=1||Math.random()<.05+(act.crit||0)+b2Sum(a,'crit')+((a.perk&&a.perk.crit)||0);
  if(a.perk) for(const b of a.perk.boost) if(b.keys.includes(act.key)) dmg*=1+b.p;   // gear boost perks
  if(act.polish) dmg*=act.polish;   // Polish rank 2+ (engine/progress.js b8Polished)
  if(crit) dmg*=1.5*b2TrendMult(a);   // Grace's Trending Meter
  if(act.debuffBonus&&b2HasDebuff(t)) dmg*=1+act.debuffBonus;
  if(a.st&&a.st.pumped) dmg*=1+B2_STATUS.pumped.next;
  if(t.st.guard&&t.st.guard.self) dmg*=.6;
  if(t.D&&t.D.inert&&a.id==='nara') dmg*=2;   // Nara digs up Acorn Caches
  dmg*=b8DamageMult(act,t);   // Close-Up, Tracked Scent (engine/battle2-effects.js)
  dmg*=Math.max(.1,1+b2Sum(t,'taken'));
  dmg*=.92+Math.random()*.16;
  return {dmg:Math.max(1,Math.round(dmg)),weak:E.weak,resist:E.resist,crit};
}
// Heals: a share of the target's max HP plus the healer's WARMTH.
function b2HealValue(a,t,pct,wm) {
  let h=t.maxHp*(pct||0)+b2Eff(a,'warmth')*(wm||0);
  if(a.st&&a.st.pumped) h*=1+B2_STATUS.pumped.next;
  h*=b2TrendMult(a);
  return Math.max(1,Math.round(h));
}

// ---------- Targeting ----------
// Returns the choices a player can pick between for an action: each {label, targets[], primary}.
function b2TargetOptions(act,user) {
  const foes=b2LiveFoes(),allies=b2LiveParty();
  switch(act.target) {
    case 'enemy': case 'splash': return foes.map(f=>({label:f.name,targets:[f],primary:f}));
    case 'row': {
      const o=[];
      for(const r of ['front','back']) { const t=foes.filter(f=>f.row===r); if(t.length) o.push({label:(r==='front'?'FRONT ROW':'BACK ROW'),targets:t}); }
      return o;
    }
    case 'front': { const t=foes.filter(f=>f.row==='front'||f.st.scent);   // Tracked Scent: no hiding in the back row
       return [{label:t.length?'FRONT ROW':'ALL ENEMIES',targets:t.length?t:foes}]; }
    case 'all': case 'multi': return [{label:'ALL ENEMIES',targets:foes}];
    case 'ally': return [...allies.map(p=>({label:p===user?p.name+' (self)':p.name,targets:[p],primary:p,ally:true})),
      ...(act.kindFoe?foes.map(f=>({label:f.name+' (kindness)',targets:[f],primary:f,kind:true})):[])];
    case 'allyko': { const down=B2.party.filter(p=>!b2Alive(p)); return [...down,...allies].map(p=>({label:p.name+(b2Alive(p)?'':' (knocked out)'),targets:[p],primary:p,ally:true})); }
    case 'party': return [{label:'WHOLE PARTY',targets:allies,ally:true},...(b8KindNum(act)?foes.map(f=>({label:f.name+' (kindness)',targets:[f],primary:f,kind:true})):[])];
    case 'self': return [{label:user.name,targets:[user],ally:true},...(b8KindNum(act)?foes.map(f=>({label:f.name+' (kindness)',targets:[f],primary:f,kind:true})):[])];
  }
  return [];
}
// Splash: the primary takes 100%, its neighbors in the same row 60%.
function b2Splash(primary) {
  const row=b2LiveFoes().filter(f=>f.row===primary.row),k=row.indexOf(primary);
  return [row[k-1],row[k+1]].filter(Boolean);
}

// ---------- Player actions ----------
// act is a skill, the basic move, the special, {item:id} or {run:true}.
function b2Do(act,opt) {
  const u=B2.actor; if(!u||battle.state!=='command') return;
  battle.state='busy'; B2.ui='busy'; B2.pending=null;
  // Tom's Diamond Medallion pays for a skill: free and instant (engine/battle2-traits.js).
  const diamond=b2Diamond(u,act);
  u.vp=Math.max(0,u.vp-b2Cost(u,act));
  u.ct=b2Delay(u,diamond?'instant':(act.weight||'standard'));
  if(diamond) { u.miles=0; battle.texts.push({txt:'DIAMOND MEDALLION',x:96,y:30,color:'#9fe8ff',sc:2,t:0,dur:1.4}); }
  if(opt&&opt.primary&&!opt.ally) B2.lastTarget=opt.primary;
  b7Note(u,act,opt);   // engine/feel.js: Smart Repeat remembers it; Director starts the one-snack round
  b2Render();
  if(act.run) { enqueue(...b2RunSteps(u),()=>b2AfterAction()); return; }
  if(act.item) { enqueue(...b2ItemSteps(u,act.item,opt),()=>b2AfterAction()); return; }
  if(act.kind==='defend') { enqueue(...b2DefendSteps(u,opt,act),()=>b2AfterAction()); return; }
  if(act.praise) { enqueue(...b2PraiseSteps(u,opt),()=>b2AfterAction()); return; }
  if(act.tombo) { b2RunTombo(u,act,opt); return; }   // engine/battle2-kind.js
  b2BeginMove(u,act,opt);
  b2Animate(u,act,opt);   // engine/battle2-moves.js; its last step calls checkEnemy(), which ends the move
}
function b2AfterAction() {
  let end=[];
  if(B2.actor&&B2.actor.side==='party') { B2.prev=B2.actor; b2PaceTick(B2.actor); if(!B2.skipTurn) b2CallBoarded(B2.actor); end=b8EndTurn(B2.actor); }
  B2.skipTurn=false;
  b2Render();
  if(!B2.active) return;
  enqueue(...end,b2LiveFoes().length?250:400,()=>b2Advance());
}

// ---------- A move in progress ----------
// The plan is worked out up front (so the old move scripts can print a result line), then applied as the animation's
// hits land: landHit(d) from a move script applies d/100 of it. checkEnemy() (b2FinishMove) applies whatever is left,
// then the move's effects.
function b2BeginMove(u,act,opt) {
  const ally=['ally','allyko','party','self'].includes(act.target);
  const targets=(opt.targets||[]).filter(t=>act.target==='allyko'?true:b2Alive(t));
  const M={u,act,opt,targets,primary:opt.primary||targets[0],waves:[],prog:0,next:0,fxDone:false,revived:new Set(),hitAny:false,pumped:!!u.st.pumped,
    kindOnFoe:ally&&targets.some(t=>t.side==='foe'),calmed:[]};
  b2TraitBegin(M);   // engine/battle2-traits.js: trends, Ghost Pepper, Counter-Roar, Shoulder Ride
  if(act.stat&&!ally) {
    const entry=(t,mult)=>{
      // Fogged In (a Fog Wisp): the attacker's own swings can miss. Otherwise only the target's evasion counts.
      const fog=!!(u.st&&u.st.fogged&&!act.tombo&&Math.random()<B2_STATUS.fogged.miss);
      const miss=fog||!!(t.D&&t.D.evade&&!t.st.pinned&&!t.st.scent&&!t.st.goofed&&!t.st.smitten&&!t.st.staggered&&Math.random()<t.D.evade);
      const r=miss?{dmg:0}:b2Damage(u,act,t,(mult==null?act.mult:mult)*M.boost);
      if(!miss&&t.boss==='mirrorball') b2BallReflect(act,t,r);   // her mirror side bounces hits back
      if(act.critAfterTom&&B2.prev&&B2.prev.id==='tom'&&!miss) { if(!r.crit) { r.dmg=Math.round(r.dmg*1.5); r.crit=true; } }
      return {t,dmg:r.dmg,weak:r.weak,resist:r.resist,crit:r.crit,miss,done:0,first:true,reflect:r.reflect||0};
    };
    const n=act.hits||1;
    if(act.target==='multi') { for(let k=0;k<n;k++) { const live=targets.length?targets:b2LiveFoes(); M.waves.push([entry(pick(live))]); } }
    else if(n>1) { for(let k=0;k<n;k++) M.waves.push(targets.map(t=>entry(t))); }
    else {
      const w=targets.map(t=>entry(t));
      if(act.target==='splash'&&M.primary) for(const nb of b2Splash(M.primary)) w.push(entry(nb,act.mult*.6));
      M.waves.push(w);
    }
    b2RideWave(M,entry);
  }
  B2.move=M;
  // Old move scripts read the target off battle.enemy and battle.missing (no surprise confusions in the new battle).
  const p=M.primary&&M.primary.side==='foe'?M.primary:b2LiveFoes()[0];
  battle.enemy=p?{name:p.name,def:p.def,hp:p.hp,maxHp:p.maxHp,level:p.lvl}:null;
  battle.missing=!(act.fx||[]).some(f=>f[0]==='goof');
  battle.enemyStunned=0;
  if(!ally) b2AimAt(M.waves.length?[...new Set(M.waves.flat().map(e=>e.t))]:targets,u); else B2.aim=null;
  M.result=b2ResultText(M);
  b7HfOpen(M);   // engine/feel.js: the optional High-Five window
  return M;
}
function b2ResultText(M) {
  const all=M.waves.flat(); if(!all.length) return '';
  const by=new Map(); for(const e of all) { const r=by.get(e.t)||{dmg:0,miss:true,weak:false}; r.dmg+=e.dmg; r.miss=r.miss&&e.miss; r.weak=r.weak||e.weak; r.crit=r.crit||e.crit; by.set(e.t,r); }
  const parts=[...by].map(([t,r])=>r.miss?t.name+' dodges':t.name+' takes '+r.dmg);
  const tail=([...by.values()].some(r=>r.crit)?' Critical hit!':'')+([...by.values()].some(r=>r.weak)?' Weak spot!':'');
  if(parts.length>3) return 'Everyone takes '+[...by.values()].reduce((s,r)=>s+r.dmg,0)+' in all.'+tail;
  return parts.join(', ')+'.'+tail;
}
// Apply part of the planned damage. frac: share of the whole move (0 to 1).
function b2LandFrac(frac) {
  const M=B2.move; if(!M) return;
  M.prog+=frac;
  if(!M.waves.length) { if(!M.fxDone) { b2ApplyFx(); } return; }
  if(M.waves.length===1) { for(const e of M.waves[0]) b2ApplyEntry(e,Math.round(e.dmg*Math.min(1,M.prog))-e.done); }
  else while(M.next<M.waves.length&&M.prog>=(M.next+1)/M.waves.length-1e-6) { for(const e of M.waves[M.next]) b2ApplyEntry(e,e.dmg-e.done); M.next++; }
  b2Render();
}
function b2ApplyEntry(e,amt) {
  const t=e.t,M=B2.move;
  if(!b2Alive(t)) { e.done=e.dmg; return; }
  const p=b2FoePoint(t);
  if(e.first) {
    e.first=false;
    if(e.miss) { pop('MISS',p.x,p.y,'#cfd8d6'); sfx.whoosh(); return; }
    if(e.weak) { battle.texts.push({txt:'WEAK!',x:p.x,y:p.y-9,color:'#ffe08a',sc:1,t:0,dur:.9}); t.revealed=true; if(M) M.weakHit=true; }
    else if(e.resist) battle.texts.push({txt:'RESIST',x:p.x,y:p.y-9,color:'#cfd8d6',sc:1,t:0,dur:.9});
    if(e.crit) battle.texts.push({txt:'CRITICAL',x:p.x,y:p.y-16,color:'#ffb070',sc:1,t:0,dur:.9});
    if(e.weak||e.crit) sfx.levelUp();
    if(M) M.hitAny=true;
    b8Landed(t);   // Close-Up is used up
    // A heavy physical strike snaps a Goofed enemy out of it.
    if(M&&t.st.goofed&&M.act.weight==='heavy'&&(M.act.stat==='pow'||M.act.stat==='hybrid')) { delete t.st.goofed; battle.texts.push({txt:'SNAPPED OUT',x:p.x,y:p.y-23,color:'#cfd8d6',sc:1,t:0,dur:1}); }
    if(M) b2ShieldHit(t,M.act);
    if(M&&e.reflect) b2BallBounce(M.u,e.reflect,t);
  }
  if(e.miss) { e.done=e.dmg; return; }
  amt=Math.max(0,Math.min(amt,e.dmg-e.done)); if(!amt) return;
  e.done+=amt;
  t.hp=Math.max(0,t.hp-amt); t.shake=.35; t.flash=.16;
  pop(String(amt),p.x+rand(-3,3),p.y,e.crit?'#ffe08a':'#fff1cb');
  sfx.hitEnemy();
  if(t.hp<=0) b2FoeDown(t); else b2CheckPhase(t);
}
function b2FinishMove() {
  const M=B2.move; if(!M) return b2AfterAction();
  for(const w of M.waves) for(const e of w) if(e.done<e.dmg||e.first) b2ApplyEntry(e,e.dmg-e.done);
  const steps=[];
  if(!M.fxDone) { b2ApplyFx(); steps.push(450); }
  if(M.pumped&&(M.waves.length||(M.act.fx||[]).some(f=>f[0]==='heal'))) { delete M.u.st.pumped; }
  if(M.act===M.u.kit.basic) { M.u.vp=Math.min(B2_VP.cap,M.u.vp+B2_VP.basic); }
  b2MoveHeart(M);   // engine/battle2-kind.js
  steps.push(...b2TraitFinish(M));
  if(M.calmed.length) steps.push(()=>b2Msg(b2CalmText(M.calmed)),1300);
  B2.move=null; B2.aim=null; battle.enemy=null; battle.enemyStunned=0;
  b2Render();
  enqueue(...steps,()=>b2AfterAction());
}
// The move's effects, once. Signature and support animations call this (E2.apply) at the moment they land.
function b2ApplyFx() {
  const M=B2.move; if(!M||M.fxDone) return; M.fxDone=true;
  // A kind move aimed at a monster only warms it up (no heals or buffs on enemies).
  // Option 3 moves (o3, engine/battle2-effects.js): self and trait events still happen, then one warm(kindFoe) packet.
  const K=b8KindNum(M.act);
  for(const f of (M.act.fx||[])) if(!M.kindOnFoe||f[0]==='crust'||(K&&B8_SELF_OPS.includes(f[0]))) b2Effect(M.u,M,f);
  if(K) b8KindFoe(M); else b2Kindness(M);   // engine/battle2-kind.js
  if(M.act.tombo) for(const t of b2LiveFoes()) if(t.shield) {
    if(b7Diff().tomboHit) b2ShieldBump(t,'The Tombo cracks the guard!');   // Director: a Tombo is one hit
    else b2BreakShield(t,'The Tombo smashes through the guard! STAGGER BREAK!');
  }
  b2Render();
}

// ---------- Effects: [op, ...args]. who: t (the targets), self, party, others, lowest, slowest, allFoes, tom ----------
function b2Who(u,M,who) {
  const live=b2LiveParty();
  switch(who) {
    case 't': return M.targets.filter(t=>t.side==='party'?(t.hp>0||M.act.target==='allyko'):b2Alive(t));
    case 'self': return b2Alive(u)?[u]:[];
    case 'party': return live;
    case 'others': return live.filter(p=>p!==u);
    case 'lowest': return live.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,1);
    case 'slowest': return live.filter(p=>p!==u).sort((a,b)=>b.ct-a.ct).slice(0,1);
    case 'allFoes': return b2LiveFoes();
    case 'partner': return M.pt&&b2Alive(M.pt)?[M.pt]:[];   // a Tombo's partner
    case 'tom': { const t=B2.party.find(p=>p.id==='tom'&&b2Alive(p))||B2.party.find(p=>p.id==='tnb'&&b2Alive(p)); return t?[t]:[]; }
  }
  return b8Who(u,M,who);   // all, ally, both, fasterFoes (engine/battle2-effects.js)
}
const B8_OWN_ACTION=id=>{ const d=B2_STATUS[id]; return !!(d&&(d.miss||id==='shushed'||id==='silenced')); };
function b2Effect(u,M,f) {
  if(M.act&&M.act.o3) f=b8Cap(M,f);   // Option 3 tuning caps
  const op=f[0];
  const who=w=>b2Who(u,M,w).filter(t=>!(M.revived.has(t)&&op!=='revive'));
  switch(op) {
    case 'st': { const o3=M.act&&M.act.o3,a=o3?b8StId(f[1]):[f[1]];
      // Option 3 rules contract: N of the recipient's own turns, counted at the END of its turn. Monsters tick at the
      // start of their turn, so an o3 status that changes the monster's OWN action (Dizzy, Shushed) skips its first
      // tick (wait) and lasts through N of its actions. Statuses about hits it takes (Hooked, Close-Up) are unchanged.
      const own=o3&&B8_OWN_ACTION(a[0]);
      for(const t of who(f[3])) { b2AddStatus(t,a[0],f[2],{by:u,amt:f[4]!=null?f[4]:a[1]}); if(own&&t.side==='foe'&&t.st[a[0]]) t.st[a[0]].wait=true; } } break;
    case 'heal': for(const t of who(f[3])) { if(t.hp<=0) continue; const h=Math.min(t.maxHp-t.hp,Math.round(b2HealValue(u,t,f[1],f[2])*(M.hf?B7_HF.mult:1)*(M.act.polish||1))); t.hp+=h; b2PopUnit(t,'+'+h,'#9be39a'); } sfx.heal(); break;
    case 'revive': for(const t of b8ReviveWho(u,M,f[2])) if(t.hp<=0) { t.hp=Math.round(t.maxHp*f[1]); t.st={}; t.guard=false; M.revived.add(t); b2PopUnit(t,'UP','#ffe08a'); battle.fx[t.idx].hop=.35; sfx.levelChime(); } break;
    case 'vp': for(const t of who(f[2])) { t.vp=Math.min(B2_VP.cap,t.vp+f[1]); b2PopUnit(t,'+'+f[1]+' VP','#86a9ff',-8); } break;
    case 'refill': for(const t of who(f[1])) { t.vp=B2_VP.cap; b2PopUnit(t,'VP MAX','#86a9ff',-8); } break;
    case 'cure': for(const t of who(f[2])) {
      const keys=Object.keys(t.st).filter(k=>{ const d=B2_STATUS[k]; return d&&d.debuff&&(f[1]==='debuff'||f[1]==='one'||(f[1]==='mental'&&d.mental)||(f[1]==='amber'&&k==='amber')); });
      for(const k of (f[1]==='one'?keys.slice(0,1):keys)) delete t.st[k];
      if(keys.length) b2PopUnit(t,'CURED','#9be39a',-8);
    } break;
    case 'ct': for(const t of who(f[2])) { const d=b2Delay(t,'standard'); t.ct=Math.max(0,t.ct+Math.round(d*f[1])); b2PopUnit(t,f[1]>0?'DELAYED':'HURRY UP',f[1]>0?'#9fd0ff':'#9be39a',-8); } break;
    case 'goof': case 'smit': for(const t of who(f[2])) b2TrySkip(u,t,op==='goof'?'goofed':'smitten',f[1]); break;
    case 'coins': { const n=rand(f[1],f[2]); B2.coinsWon+=n; const t=M.primary; if(t&&t.side==='foe') { const p=b2FoePoint(t); pop('+'+n,p.x+8,p.y-6,'#ffd24a'); } sfx.coin&&sfx.coin(); } break;
    case 'reveal': for(const t of who(f[1])) if(!t.revealed) { t.revealed=true; const p=b2FoePoint(t); battle.texts.push({txt:t.weak.length?'WEAK: '+t.weak.map(e=>B2_ELEMS[e].name).join(' '):'NO WEAKNESS',x:p.x,y:p.y-20,color:'#ffe08a',sc:1,t:0,dur:1.6}); } break;
    case 'row': for(const t of who(f[2])) b2MoveRow(t,f[1]); break;
    case 'shieldBreak': for(const t of who(f[1])) if(t.shield) b2BreakShield(t,f[2]||'The kiln melts the shield!'); break;   // f[2]: the move's own message
    case 'interrupt': for(const t of who(f[1])) if(t.intent&&t.intent.kind!=='lock') { t.intent=null; t.shield=null; const p=b2FoePoint(t); battle.texts.push({txt:'INTERRUPTED',x:p.x,y:p.y-20,color:'#9be39a',sc:1,t:0,dur:1.2}); sfx.stun(); } break;
    case 'steal': for(const t of who(f[1])) { const k=Object.keys(t.st).find(k=>B2_STATUS[k]&&B2_STATUS[k].buff&&k!=='pietin'); if(k) { const s=t.st[k]; delete t.st[k]; if(B2_STATUS[k].mod) u.st[k]={turns:3,amt:s.amt}; const p=b2FoePoint(t); battle.texts.push({txt:'STOLE '+B2_STATUS[k].short,x:p.x,y:p.y-20,color:'#ffe08a',sc:1,t:0,dur:1.2}); } } break;
    case 'randbuff': { const k=pick(['powup','gritup','pepup']); for(const t of who(f[2])) b2AddStatus(t,k,f[1],{by:u}); } break;
    // Traits (engine/battle2-traits.js)
    case 'crust': if(!f[2]||(b2Partner(f[2])&&b2Alive(b2Partner(f[2])))) b2AddCrust(f[1]); break;   // f[2]: only if that member is up
    case 'burn': b2Burn(f[2]?b2Partner(f[2]):u,f[1]); break;   // f[2]: whose Heartburn (a Tombo's actor is the pair)
    case 'rack': for(const t of who(f[1])) b2Rack(u,t); break;
    case 'take': for(const t of who(f[1])) b2Take(u,t); break;
    case 'mount': b2Mount(); break;
    default: b8Op(u,M,f,who);   // the Option 3 registry and translations (engine/battle2-effects.js)
  }
}
// Bosses get one turn of recovery after any lost turn (stunned, Goofed, Smitten, Staggered): no stun-locking a boss.
const B2_SKIPS=['stunned','goofed','smitten'];
const b2BossSteady=t=>!!(t&&t.side==='foe'&&t.boss&&t.steady);
function b2AddStatus(t,id,turns,o) {
  const d=B2_STATUS[id]; if(!d) return;
  if(B2_SKIPS.includes(id)&&b2BossSteady(t)) { b2PopUnit(t,'STEADY','#cfd8d6',-16); return; }
  if(d.debuff&&t.st.fresh) { b2PopUnit(t,'FRESH','#9fd8ff',-16); return; }
  if(d.debuff&&t.st.fearless) { b2PopUnit(t,'FEARLESS','#ffe08a',-16); return; }
  if(t.perk&&t.perk.immune.includes(id)) { b2PopUnit(t,'IMMUNE','#9fd8ff',-16); return; }
  if(!b8StatusOk(t,id)) return;   // Close-Up and See Me
  const cur=t.st[id];
  t.st[id]=Object.assign(cur||{},{turns:Math.max(turns,cur?cur.turns:0),amt:o&&o.amt!=null?o.amt:(cur&&cur.amt),by:o&&o.by});
  b2PopUnit(t,d.short,d.color,-16);
}
// Goofed and Smitten: the enemy loses its next turn. Bosses resist half the time, but SILLY always knocks off what they hold.
function b2TrySkip(u,t,id,chance) {
  if(t.side!=='foe') return;
  const p=b2FoePoint(t);
  if(id==='goofed'&&t.st.pietin) {
    delete t.st.pietin;
    battle.texts.push({txt:'PIE TIN!',x:p.x,y:p.y-28,color:'#ffe08a',sc:2,t:0,dur:1.4});
    b2Fx({kind:'tin',x:b2FoeCanvasPos(t).x,y:b2FoeCanvasPos(t).y-b2FoeCanvasPos(t).h,t:0,dur:1.1});
    b2Msg(cap(t.def.the)+' tips its head. Deedee’s pie tin clatters off! Its GRIT is back to normal.');
    sfx.bonk&&sfx.bonk();
  }
  let c=chance;
  if(t.D.goofEasy) c=1;
  else if(t.boss) c=Math.min(c,.45);
  if(b2BossSteady(t)) c=0;
  if(Math.random()<c) { t.st[id]={turns:1,by:u}; battle.texts.push({txt:B2_STATUS[id].short,x:p.x,y:p.y-16,color:B2_STATUS[id].color,sc:1,t:0,dur:1.2}); sfx.stun(); }
  else battle.texts.push({txt:b2BossSteady(t)?'STEADY':'UNMOVED',x:p.x,y:p.y-16,color:'#cfd8d6',sc:1,t:0,dur:1.2});
}
function b2MoveRow(t,row) {
  if(t.side!=='foe'||t.row===row||t.boss||(row==='back'&&t.st.scent)) return;
  const n=b2LiveFoes().filter(f=>f.row===row).length;
  if(n>=(row==='front'?3:2)) return;
  t.row=row; b2LayoutFoes();
  const p=b2FoePoint(t); battle.texts.push({txt:row==='front'?'PULLED IN':'KNOCKED BACK',x:p.x,y:p.y-20,color:'#fff1cb',sc:1,t:0,dur:1.1});
}
// Popups over party members (stage units) and enemies.
function b2PopParty(u,txt,c,dy=0) {
  const d=b2Riding(u)&&battle.drawnAt&&battle.drawnAt[u.idx];   // Rose up on Tom's shoulders
  if(d) { pop(txt,Math.round(d.cx/3),Math.round(d.base/3)-30+dy,c); return; }
  const q=BATTLE_POS[u.idx]; if(q) pop(txt,q.x,q.base-36+dy,c);
}
function b2PopUnit(u,txt,c,dy=0) { if(u.side==='party') b2PopParty(u,txt,c,dy); else { const p=b2FoePoint(u); pop(txt,p.x,p.y+dy,c); } }

// ---------- Hits and knockouts ----------
function b2FoeDown(t) {
  t.dying=0; sfx.grumpHurt(); t.intent=null; t.shield=null;
  t.parts=[]; const p=b2FoeCanvasPos(t),cols=t.def.vapor||['#bfe8d4','#9dd0b8','#ffffff'];
  for(let k=0;k<26;k++) t.parts.push({x:p.x+(Math.random()-.5)*p.w,y:p.y-Math.random()*p.h,vx:(Math.random()-.5)*50,vy:-30-Math.random()*60,s:3+Math.floor(Math.random()*4),c:cols[k%cols.length],d:Math.random()*.3});
  b7Later(()=>sfx.vapor(),120);
}
// Item and old-style instant damage on one enemy (no plan).
function b2Hit(a,act,t,mult) {
  const r=b2Damage(a,act,t,mult); b8Landed(t);
  t.hp=Math.max(0,t.hp-r.dmg); t.shake=.35; t.flash=.16;
  const p=b2FoePoint(t);
  pop(String(r.dmg),p.x,p.y,r.crit?'#ffe08a':'#fff1cb');
  b2Burst(t,act.elem&&act.elem[0]||'kinetic');
  sfx.hitEnemy();
  if(t.hp<=0) b2FoeDown(t); else b2CheckPhase(t);
  b2Render();
  return r;
}
function b2PartyDown(t) {
  if(t.st.fresh) {
    // Wardrobe Fresh: back up at once.
    delete t.st.fresh;
    t.hp=Math.round(t.maxHp*B2_STATUS.fresh.autoRevive);
    battle.fx[t.idx].hop=.35; b2PopParty(t,'UP','#ffe08a',-10); sfx.levelChime();
    enqueue(()=>b2Msg(t.name+' was Wardrobe Fresh. Right back up!'),700);
    return;
  }
  if(t.st.finalgirl) {
    // TNB's Final Girl costume: she always gets back up.
    delete t.st.finalgirl;
    t.hp=Math.round(t.maxHp*B2_STATUS.finalgirl.autoRevive);
    battle.fx[t.idx].hop=.35; b2PopParty(t,'UP','#ff9ac0',-10); sfx.levelChime();
    enqueue(()=>b2Msg(t.name+' is the Final Girl. Right back up!'),700);
    return;
  }
  if(t.id==='amy') t.cadence=0;
  t.guard=false;
  if(t.st.guard) { const f=t.st.guard.for; if(f) delete f.st.guarded; }
  t.st={};
}

// The resolver is the same for every version; an Option 3 version (act.o3) only swaps in its animation
// (RECRUIT_MOVES.tom.defendShow in engine/tom-moves.js: beats around the resolver).
function b2DefendSteps(u,opt,act) {
  const t=opt.targets[0],self=t===u,fx=battle.fx[u.idx];
  const show=act&&act.o3&&RECRUIT_MOVES.tom&&RECRUIT_MOVES.tom.defendShow;
  const res=()=>{
    for(const p of B2.party) if(p.st.guarded&&p.st.guarded.by===u) delete p.st.guarded;
    u.st.guard={turns:2,self,for:self?null:t}; u.guard=true;
    if(!self) t.st.guarded={by:u};
    sfx.guard(); say('tom','defend'); fx.hop=.3; b2Heart(B2_HEART.care);
    if(!self) b2AddMile(1);   // Diamond Medallion
    b2Msg(self?'Tom plants his feet. "No touching, please." Hits on him are 40% softer.':'Tom steps in front of '+t.name+'. "No touching, please."');
    b2Render();
  };
  return show?show(u,t,res):[res,900];
}

// ---------- Items (the shared pockets; numbers are on the battle HP scale since F6) ----------
function b2ItemSteps(u,id,opt) {
  const it=items[id];
  const k=B2.bag.indexOf(id); if(k>=0) B2.bag.splice(k,1);
  const steps=[()=>{ b2Msg(u.name+' uses the '+it.name+'.'); sfx.select(); battle.fx[u.idx].hop=.3; }];
  const t=opt.targets[0];
  if(it.dmg) {
    steps.push(()=>b2Proj(u,t,'splash'),420,()=>{ const p=b2FoePoint(t),d=it.dmg; t.hp=Math.max(0,t.hp-d); t.shake=.35; t.flash=.16; pop(String(d),p.x,p.y,'#fff1cb'); sfx.splat(); if(t.hp<=0) b2FoeDown(t); else b2CheckPhase(t); b2Render(); },500);
  } else if(it.confuse) {
    steps.push(500,()=>{ sfx.raspberry&&sfx.raspberry(); b2TrySkip(u,t,'goofed',1); b2Render(); },700);
  } else if(it.atkDown) {
    steps.push(500,()=>{ sfx.slideWhistle&&sfx.slideWhistle(); b2AddStatus(t,'powdown',3,{by:u}); b2Render(); },700);
  } else if(it.pep) {
    steps.push(400,()=>{ for(const p of b2LiveParty()) b2AddStatus(p,'pumped',3,{by:u}); sfx.levelUp(); b2Render(); },700);
  } else if(it.vp) {
    steps.push(()=>{ const n=it.vp; t.vp=Math.min(B2_VP.cap,t.vp+n); sfx.heal(); b2PopParty(t,'+'+n+' VP','#86a9ff'); b2Render(); },600);
  } else {
    for(const tt of opt.targets) steps.push(()=>{
      let h=0;
      if(it.revive&&tt.hp<=0) { h=Math.round(tt.maxHp/2); tt.hp=h; battle.fx[tt.idx].hop=.35; sfx.levelChime(); b2PopParty(tt,'UP','#ffe08a'); b2Render(); return; }
      if(tt.hp>0) h=Math.min(tt.maxHp-tt.hp,(it.heal||it.healAll||0));
      tt.hp+=h; sfx.heal(); b2PopParty(tt,'+'+h,'#9be39a'); b2Render();
    });
    steps.push(600);
  }
  return steps;
}
// Nara is a picky eater: store-bought food is not for her (Chicken Jerky is).
const b2Eats=(p,it)=>p.id!=='nara'||!!it.dogOk||!(it.heal||it.healAll||it.vp);
function b2RunSteps(u) {
  const boss=b2LiveFoes().find(f=>f.D.noRun);
  if(boss) return [()=>{ b2Msg(cap(boss.def.the)+' blocks the way out!'); sfx.blocked&&sfx.blocked(); },1000];
  return [()=>{ b2Msg('Everyone backs away slowly.'); sfx.run(); },900,()=>b2End('run')];
}

// ---------- Enemy turn ----------
function b2FoeTurn(e) {
  if(!B2.active||!b2Alive(e)) return b2Advance();
  e.ct=b2Delay(e,'standard');
  const N=e.name.charAt(0).toUpperCase()+e.name.slice(1);
  // Lost turns first: Staggered, Smitten, Goofed. A boss that loses a turn is steady for its next one.
  const lost=!!(e.st.staggered||e.st.stunned||e.st.smitten||e.st.goofed);
  if(e.boss) e.steady=lost;
  if(e.st.staggered) { delete e.st.staggered; e.intent=null; e.shield=null; if(e.boss) e.step='C'; enqueue(()=>{ b2Msg(N+' is still STAGGERED. It can\'t move!'); sfx.stun(); },1100,()=>b2AfterAction()); return; }
  if(e.st.stunned) { delete e.st.stunned; enqueue(()=>{ b2Msg(N+' is still seeing stars. It loses its turn.'); sfx.stun(); },1100,()=>b2AfterAction()); return; }
  if(e.st.smitten) { const by=e.st.smitten.by; delete e.st.smitten; enqueue(()=>{ b2Msg(by&&by.id&&by.id!=='nara'?N+' is still thinking about '+by.name+'. It can\'t bring itself to fight.':N+' looks at Nara. Nara looks back. It can\'t do it.'); sfx.stun(); },1100,()=>b2AfterAction()); return; }
  if(e.st.goofed) {
    delete e.st.goofed;
    const coins=Math.random()<.5;
    enqueue(()=>{ b2Msg(coins?N+' is Goofed. It dances around and drops some coins.':N+' is Goofed. It does a little dance instead of attacking.'); sfx.boing&&sfx.boing(); e.shake=.5;
      if(coins) { const n=rand(2,6); B2.coinsWon+=n; const p=b2FoePoint(e); pop('+'+n,p.x,p.y,'#ffd24a'); sfx.coin&&sfx.coin(); } },1200,()=>b2AfterAction());
    return;
  }
  b2TickStatus(e);
  if(e.D.inert) { enqueue(()=>b2Msg(N+' sits there. It\'s an acorn.'),900,()=>b2AfterAction()); return; }   // Acorn Cache
  if(e.boss) return b2BossTurn(e);
  // A telegraphed move on a normal monster (a story fight can set one): it does exactly what it announced.
  if(e.intent) { const I=e.intent; e.intent=null; e.shield=null; return b2FoeAct(e,I.act,I.kind==='all'?null:(b2Alive(I.target)?I.target:null)); }
  let pool=e.acts.filter(a=>!a.every),every=e.acts.find(a=>a.every&&e.turns%a.every===0);
  // Shushed (Grace's Comment Moderation): no Chatter moves. A monster with nothing else to say loses the turn.
  if(e.st.shushed) { const quiet=a=>a.elem!=='chatter'; if(every&&!quiet(every)) every=null; pool=pool.filter(quiet);
    if(!every&&!pool.length) { enqueue(()=>{ b2Msg(N+' opens its mouth. Comments are paused.'); b2PopUnit(e,'SHUSHED','#9aa3c8',-16); },1100,()=>b2AfterAction()); return; } }
  b2FoeAct(e,every||pick(pool));
}
// Pick who a single attack goes for: Grumbled goes for Boppy; Grace's Spotlight draws hits off hurt allies.
function b2PickTarget(e,forced) {
  const live=b2LiveParty();
  if(forced&&b2Alive(forced)) return forced;
  const g=e.st.grumbled&&e.st.grumbled.by; if(g&&b2Alive(g)) return g;
  let t=pick(live);
  const decoy=live.find(p=>p.st.decoy);
  if(decoy&&t!==decoy&&t.hp/t.maxHp<.5) t=decoy;
  return t;
}
// One enemy action. next() returns more steps (a boss announcing its next move) to run before the turn ends.
function b2FoeAct(e,act,forced,next) {
  const live=b2LiveParty(); if(!live.length) return b2Lose();
  const orig=act.target==='all'?null:b2PickTarget(e,forced);
  const N=e.name.charAt(0).toUpperCase()+e.name.slice(1);
  const fill=s=>s.split('{e}').join(N).split('{t}').join(orig?orig.name:'everyone');
  const steps=[()=>{ B2.hurtNow=false; b2Msg(fill(act.msg)); e.lunge=.55; sfx.grumpAttack(); b2AimFoe(e,orig); }];
  if(act.target==='all') steps.push(420,()=>{ for(const t of b2LiveParty()) b2HitParty(e,act,t); },900);
  else {
    // DEFEND: Tom steps in front of whoever he is guarding.
    const tom=b2Tom();
    const ride=b2Riding(orig)&&orig!==tom;   // Rose up on Tom's shoulders: Tom takes it
    const cover=(orig.st.guarded&&tom&&b2Alive(tom)&&orig.st.guarded.by===tom&&orig!==tom)||ride;
    const dodge=!cover&&((orig.st.evade&&Math.random()<B2_STATUS.evade.evade)||(orig.perk&&orig.perk.evade&&Math.random()<orig.perk.evade));
    const dizzy=!!(e.st.dizzy&&Math.random()<B2_STATUS.dizzy.miss),miss=dizzy||dodge;
    if(miss) steps.push(340,()=>{ b2PopParty(orig,'MISS','#cfd8d6'); sfx.whoosh(); b2Msg(dizzy?N+' is too dizzy. It misses!':orig.name+' dodges it!'); },900);
    else if(cover&&ride) steps.push(200,()=>{ battle.fx[tom.idx].punch=.3; sfx.guard(); say('tom','block'); b2Msg(orig.name+' is up on Tom’s shoulders. Tom takes it. "No touching, please."'); },600,()=>b2HitParty(e,act,tom,.6,orig),750);
    else if(cover) steps.push(200,()=>{ battle.block={target:orig.idx,t:0,dur:1.5}; sfx.guard(); say('tom','block'); b2Msg('Tom steps in front of '+orig.name+'. "No touching, please."'); },600,()=>b2HitParty(e,act,tom,.6,orig),750);
    else steps.push(340,()=>b2HitParty(e,act,orig),800);
  }
  steps.push(()=>{ b2Aim0(); if(B2.hurtNow) b2Heart(B2_HEART.hurt); B2.hurtNow=false; b2Render(); if(!b2LiveParty().length) { enqueue(300,()=>b2Lose()); return; } enqueue(...(next?next():[]),()=>b2AfterAction()); });
  enqueue(...steps);
}
function b2HitParty(e,act,t,extra,coveredFor) {
  if(!b2Alive(t)) return;
  const r=b2Damage(e,act,t); b8Landed(t);
  const dmg=Math.max(1,Math.round(r.dmg*(extra||1)*b7Taken()));   // Rose Mode x0.5, Director Mode x1.6
  t.hp=Math.max(0,t.hp-dmg); B2.hurtNow=true;
  const fx=battle.fx[t.idx]; fx.shake=.35; fx.flash=.2;
  const q=coveredFor?BATTLE_POS[coveredFor.idx]:BATTLE_POS[t.idx];
  pop(String(dmg),q.x-(coveredFor?14:0),q.base-34,'#f3a08c');
  sfx.hitParty();
  if(act.vpDrain&&t.hp>0) { const n=Math.min(t.vp,act.vpDrain); t.vp-=n; if(n) b2PopParty(t,'-'+n+' VP','#9fe8ff',-10); }
  if(act.delay&&t.hp>0) { t.ct+=Math.round(b2Delay(t,'standard')*act.delay); b2PopParty(t,'DELAYED','#f2c75a',-18); }   // the Last Call
  b2TraitHit(e,t); b2Reflect(e,act,t,dmg);   // Heartburn, Glitter Nails
  if(act.status&&t.hp>0) b2AddStatus(t,act.status[0],act.status[1],{by:e});   // e.g. the Big Shake's Smog Puff (Drowsy)
  if(!coveredFor) say(t.id,t.hp<=0?'ko':(t.hp/t.maxHp<=.25?'low':'hurt'),.12);
  if(t.hp<=0) b2PartyDown(t);
  b2Render();
}

// ---------- Bosses: intents (telegraphs on the turn ribbon), phases, Stagger shields ----------
// intent: {kind:'lock', target, act} (single heavy hit: DEFEND them), {kind:'all', act} (party-wide: heal or GRUMBLE),
// shield: {need, elems, hits} up until the boss's turn; enough hits of those elements break it (Stagger Break).
// Bosses built like the Big Shake: every third turn a telegraphed hit on everyone (no shield); below half HP they call
// two adds, then brace for a bigger party-wide hit behind a shield. Each one's words live here.
const B2_SHAKE_STYLE={
  bigshake:{word:'RUMBLING',add:'smoglet',
    open:e=>'The ground shakes. Purple smog pours out of the Observatory pipes behind '+e.def.the+'.',
    open2:'Every third turn it shakes everyone with an Aftershock. It shows on the turn ribbon before it happens.',
    phase:N=>N+' is RUMBLING. The pipes rattle.',
    adds:n=>n>1?'Two Smoglets puff out of the Observatory pipes!':'A Smoglet puffs out of the pipes!',addSfx:'whoosh',
    idle:N=>N+' grinds its rocks together.',
    brace:(N,e)=>N+' clogs its pipes for a BIG RUMBLE next turn! Break the clog: '+e.shield.need+' Splash or Sparkle hits, or a Tombo.',
    warn:'The ground starts to tremble. AFTERSHOCK next turn hits everyone. Heal up after!'},
  irongill:{word:'BLORP!',add:'bobber',
    open:e=>cap(e.def.the)+' rises, whiskers first. It smells strongly of pickled peppers.',
    open2:'Every third turn it lets out a Pepper Belch on everyone. It shows on the turn ribbon before it happens.',
    phase:N=>N+' is getting cross. It thrashes its tail and the whole pool sloshes.',
    adds:n=>n>1?'Two Bobbers pop up out of the Deep Pool!':'A Bobber pops up out of the Deep Pool!',addSfx:'splat',
    idle:N=>N+' blows bubbles. Slowly. Menacingly.',
    brace:(N,e)=>N+' sinks to the bottom for a DEEP DIVE next turn! Break its guard: '+e.shield.need+' Splash or Kinetic hits, or a Tombo.',
    warn:'Iron-Gill’s belly rumbles. PEPPER BELCH next turn hits everyone. Heal up after!'}
};
function b2BossOpen(e) {
  if(e.boss==='bigone') {
    const g=B2.party.find(p=>p.id==='grace'&&b2Alive(p))||pick(b2LiveParty());
    e.lastLock=true;
    return [()=>{ b2SetLock(e,g); b2Msg(cap(e.def.the)+' is wearing Deedee’s pie tin like a helmet (GRIT +50%). It stares right at '+g.name+'.'); b2Render(); },1800,
      ()=>b2Msg('Lock-on: Swamp Chomp is coming for '+g.name+'.'+(b2Tom()?' Tom can DEFEND '+(g.id==='grace'?'her':'them')+'.':'')),1600];
  }
  if(e.boss==='redpen') {
    e.count=0;
    return [()=>{ b2Msg(B2_REDPEN.open); e.shake=.6; sfx.thud&&sfx.thud(); },1800,()=>b2Msg(B2_REDPEN.open2),1900];
  }
  if(e.boss==='chairman') {
    e.count=0;
    return [()=>{ b2Msg(B2_CHEEKS.open); e.shake=.6; sfx.thud&&sfx.thud(); },1800,()=>b2Msg(B2_CHEEKS.open2),2100];
  }
  if(e.boss==='unread') {
    e.count=0; e.genre=0; b2UnreadGenre(e);
    return [()=>{ b2Msg(B2_UNREAD.open); e.shake=.6; sfx.thud&&sfx.thud(); },1800,()=>b2Msg(B2_UNREAD.open2),2100,
      ()=>{ b2Msg(B2_UNREAD.chapter(e)); b2Render(); },1900];
  }
  if(e.boss==='ironbelly') {
    e.count=0; b2IronSet(e,1);
    return [()=>{ b2Msg(B2_IRON.open); e.shake=.6; sfx.thud&&sfx.thud(); },1800,()=>b2Msg(B2_IRON.open2),2300];
  }
  if(e.boss==='mirrorball') {
    e.count=0; b2BallSide(e,0);
    return [()=>{ b2Msg(B2_BALL.open); e.shake=.6; sfx.whoosh&&sfx.whoosh(); },1800,()=>b2Msg(B2_BALL.open2),2300,
      ()=>{ b2Msg(B2_BALL.side(e)); b2Render(); },1900];
  }
  if(e.boss==='lastcall') {
    e.count=0; e.group=0; e.call=null;
    return [()=>{ b2Msg(B2_CALL.open); e.shake=.6; sfx.ding&&sfx.ding(); },1800,()=>b2Msg(B2_CALL.open2),2400,...b2CallPick(e)];
  }
  if(e.boss==='directorscut') {
    e.count=0; e.tel=0;
    return [()=>{ b2Msg(B2_DIRECTOR.open); e.shake=.6; sfx.thud&&sfx.thud(); },1800,()=>b2Msg(B2_DIRECTOR.open2),1900];
  }
  const SS=B2_SHAKE_STYLE[e.boss];
  if(SS) {
    e.count=0;
    return [()=>{ b2Msg(SS.open(e)); e.shake=.6; sfx.thud&&sfx.thud(); },1800,
      ()=>b2Msg(SS.open2),1700];
  }
  return [];
}
function b2SetLock(e,t) { e.intent={kind:'lock',target:t,act:e.D.chomp||e.acts[0]}; }
function b2SetAll(e,act,shield=true) { e.intent={kind:'all',act:act||e.D.flop||e.acts[0]}; if(e.D.shield&&shield) e.shield={need:e.D.shield.need+(b7Diff().shieldPlus||0),elems:e.D.shield.elems.slice(),hits:0}; }
function b2CheckPhase(t) {
  if((t.boss==='bigone'||B2_SHAKE_STYLE[t.boss]||t.boss==='directorscut'||t.boss==='redpen'||t.boss==='chairman'||t.boss==='unread'||t.boss==='ironbelly'||t.boss==='mirrorball'||t.boss==='lastcall')&&t.phase===1&&t.hp<=t.maxHp*.5) { t.phase=2; t.step='A'; t.phaseNew=true; const p=b2FoePoint(t); battle.texts.push({txt:B2_SHAKE_STYLE[t.boss]?B2_SHAKE_STYLE[t.boss].word:t.boss==='directorscut'?'FROM THE TOP':t.boss==='redpen'?'POINTS OFF':t.boss==='chairman'?'ORDER!':t.boss==='unread'?'PLOT TWIST':t.boss==='ironbelly'?'ROARING':t.boss==='mirrorball'?'ENCORE!':t.boss==='lastcall'?'FINAL CALL':'FURIOUS',x:p.x,y:p.y-30,color:'#ff8f80',sc:2,t:0,dur:1.4}); }
}
function b2ShieldHit(t,act) {
  if(t.boss==='ironbelly') b2IronElem(t,act);
  const S=t.shield; if(!S) return;
  if(![].concat(act.elem||[]).some(e=>S.elems.includes(e))) return;
  b2ShieldBump(t);
}
// One hit on a shield; enough of them break it.
function b2ShieldBump(t,msg) {
  const S=t.shield; if(!S) return;
  S.hits++;
  const p=b2FoePoint(t);
  if(S.hits>=S.need) b2BreakShield(t,'STAGGER BREAK! '+cap(t.def.the)+' loses its turn and takes 50% more damage.');
  else { battle.texts.push({txt:'CRACK '+S.hits+'/'+S.need,x:p.x,y:p.y-24,color:'#ffe08a',sc:1,t:0,dur:1}); sfx.bonk&&sfx.bonk(); if(msg) b7Later(()=>{ if(B2.active) b2Msg(msg+' '+(S.need-S.hits)+' more to break it.'); },200); }
}
function b2BreakShield(t,msg) {
  t.shield=null; t.intent=null; t.st.staggered={turns:1};
  const p=b2FoePoint(t);
  battle.texts.push({txt:'BREAK!',x:p.x,y:p.y-26,color:'#ffe08a',sc:3,t:0,dur:1.4});
  b2Fx({kind:'shatter',x:b2FoeCanvasPos(t).x,y:b2FoeCanvasPos(t).y-b2FoeCanvasPos(t).h/2,r:b2FoeCanvasPos(t).w*.62,t:0,dur:.9});
  sfx.lineClear&&sfx.lineClear(); sfx.stun();
  b7Later(()=>{ if(B2.active) b2Msg(msg); },200);
}
function b2BossTurn(e) {
  const N=cap(e.def.the);
  if(e.boss==='directorscut') return b2DirectorTurn(e,N);
  if(e.boss==='redpen') return b2RedPenTurn(e,N);
  if(e.boss==='chairman') return b2CheeksTurn(e,N);
  if(e.boss==='unread') return b2UnreadTurn(e,N);
  if(e.boss==='ironbelly') return b2IronTurn(e,N);
  if(e.boss==='mirrorball') return b2BallTurn(e,N);
  if(e.boss==='lastcall') return b2CallTurn(e,N);
  const pre=[];
  if(e.boss==='bigone') {
    // Phase 2 starts on its next turn: two Mudlings, then the belly-flop wind-up.
    if(e.phase===2&&e.step==='A') {
      e.step='B'; e.intent=null;
      const adds=b2LiveFoes().filter(f=>f!==e).length;
      const steps=[];
      if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(N+' is FURIOUS. It slaps the water with its tail.'); e.shake=.6; sfx.thud&&sfx.thud(); },1300); }
      if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
        steps.push(()=>{ const n=b2Summon('mudling',2-adds,Math.max(1,e.lvl-2)); b2Msg(n>1?'Two Mudlings climb out of the pond!':'A Mudling climbs out of the pond!'); sfx.splat&&sfx.splat(); b2Render(); },1300); }
      else steps.push(()=>{ b2Msg(N+' swishes its tail and glares at everyone.'); e.lunge=.4; },1000);
      steps.push(()=>{ b2SetAll(e); b2Msg(N+' puffs up for a Muddy Belly-Flop next turn! Break its guard: '+e.shield.need+' Sparkle or Chatter hits.'); sfx.charge&&sfx.charge(); b2Render(); },2000);
      enqueue(...steps,()=>b2AfterAction());
      return;
    }
    if(e.intent) {
      const I=e.intent; e.intent=null; e.shield=null;
      if(e.phase===2) { e.step=I.kind==='all'?'C':'A'; }
      const after=()=>b2BossNext(e);
      if(I.kind==='all') return b2FoeAct(e,I.act,null,after);
      return b2FoeAct(e,I.act,b2Alive(I.target)?I.target:null,after);
    }
    if(e.phase===2&&e.step==='B') e.step='C';
    return b2FoeAct(e,pick(e.acts),null,()=>b2BossNext(e));
  }
  const SS=B2_SHAKE_STYLE[e.boss];
  if(SS) {
    // Phase 2 (below half HP) on its next turn: call two adds, then brace for the big party-wide hit behind a shield.
    if(e.phase===2&&e.step==='A') {
      e.step='B'; e.intent=null;
      const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
      if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(SS.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
      if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
        steps.push(()=>{ const n=b2Summon(SS.add,2-adds,Math.max(1,e.lvl-2)); b2Msg(SS.adds(n)); sfx[SS.addSfx]&&sfx[SS.addSfx](); b2Render(); },1300); }
      else steps.push(()=>{ b2Msg(SS.idle(N)); e.lunge=.4; },1000);
      steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(SS.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
      enqueue(...steps,()=>b2AfterAction());
      return;
    }
    if(e.intent) {
      const I=e.intent; e.intent=null; e.shield=null;
      if(e.phase===2) e.step=I.act===e.D.rumble?'C':'A';
      return b2FoeAct(e,I.act,I.kind==='all'?null:(b2Alive(I.target)?I.target:null),()=>b2BossNext(e));
    }
    if(e.phase===2&&e.step==='C') e.step='A';
    return b2FoeAct(e,pick(e.acts),null,()=>b2BossNext(e));
  }
  b2FoeAct(e,pick(e.acts));
}
// After the boss acts: decide and announce what comes next.
function b2BossNext(e) {
  if(!b2Alive(e)) return [];
  if(e.boss==='bigone') {
    if(e.phase===1) {
      if(e.lastLock) { e.lastLock=false; return []; }
      const g=B2.party.find(p=>p.id==='grace'&&b2Alive(p))||b2LiveParty().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
      if(!g) return [];
      e.lastLock=true; b2SetLock(e,g);
      return [()=>{ b2Msg(cap(e.def.the)+' licks its lips and stares at '+g.name+'. Swamp Chomp next!'); b2Render(); },1500];
    }
    if(e.step==='C') {
      const g=b2LiveParty().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(!g) return [];
      b2SetLock(e,g);
      return [()=>{ b2Msg(cap(e.def.the)+' turns to '+g.name+'. Swamp Chomp next!'); b2Render(); },1500];
    }
  }
  if(e.boss==='directorscut') return b2DirectorNext(e);
  if(e.boss==='redpen') return b2RedPenNext(e);
  if(e.boss==='chairman') return b2CheeksNext(e);
  if(e.boss==='unread') return b2UnreadNext(e);
  if(e.boss==='ironbelly') return b2IronNext(e);
  if(e.boss==='mirrorball') return b2BallNext(e);
  if(e.boss==='lastcall') return [];   // her call comes at the start of her turn (b2CallTurn)
  if(B2_SHAKE_STYLE[e.boss]&&e.phase===1) {
    e.count=(e.count||0)+1;
    if(e.count%3===2) { b2SetAll(e,e.D.flop,false);
      return [()=>{ b2Msg(B2_SHAKE_STYLE[e.boss].warn); e.shake=.4; b2Render(); },1500]; }
  }
  return [];
}
// ---------- The Director's Cut (chapter 4 boss) ----------
// Every third turn it telegraphs CUT! or Take Two, taking turns: CUT! makes whoever is next on the turn ribbon lose that
// turn (Wardrobe Fresh blocks it); Take Two heals it. Below half HP two Extra Extras walk on and it braces behind a
// shield for That's a Wrap on everyone; after each Take Two in phase 2 it braces again.
const B2_DIRECTOR={
  open:'The work lights snap on. The Director’s Cut swivels on TNB’s rack and points itself right at everyone.',
  open2:'Every third turn it calls CUT! (the next person on the turn ribbon loses their turn) or Take Two (it heals). It shows on the ribbon first.',
  phase:N=>N+' screams FROM THE TOP! The whole set shakes.',
  adds:n=>n>1?'Two Extra Extras shuffle onto the set!':'An Extra Extra shuffles onto the set!',
  brace:(N,e)=>N+' takes a deep breath for THAT’S A WRAP next turn! Break its guard: Popcorn Jump (or any Tombo), or '+e.shield.need+' Cozy hits.',
  cutWarn:'"Quiet on set!" CUT! is coming next turn. Whoever is next on the ribbon loses their turn. WARDROBE makes them Fresh.',
  healWarn:'"Again! Take two!" It\'ll heal itself next turn. Hit it hard now.'
};
const b2NextUp=()=>b2LiveParty().slice().sort((a,b)=>a.ct-b.ct||a.idx-b.idx)[0];
function b2DirectorTurn(e,N) {
  // A CUT! or Take Two already on the ribbon still happens first, even if it just dropped below half.
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind!=='all')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_DIRECTOR.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('extra',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_DIRECTOR.adds(n)); sfx.doorOut&&sfx.doorOut(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' taps its beret and waits for silence.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_DIRECTOR.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2DirectorNext(e)); }
    if(I.kind==='cut') {
      const t=b2NextUp(); if(!t) return b2Lose();
      enqueue(()=>{ b2Msg('CUT! '+N+' points itself at '+t.name+'. "You. Back to one."'); e.lunge=.6; sfx.grumpAttack(); b2AimFoe(e,t); },900,
        ()=>{ b2AddStatus(t,'cut',1,{by:e}); b2Aim0(); b2Render(); },900,...b2DirectorNext(e),()=>b2AfterAction());
      return;
    }
    if(I.kind==='heal') {
      enqueue(()=>{ b2Msg('TAKE TWO! '+N+' rewinds itself.'); e.lunge=.3; sfx.heal(); },700,
        ()=>{ const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*(e.D.take2||.15))); e.hp+=h; const p=b2FoePoint(e); pop('+'+h,p.x,p.y,'#9be39a'); if(e.phase===2) e.step='A'; b2Render(); },1100,
        ...b2DirectorNext(e),()=>b2AfterAction());
      return;
    }
  }
  return b2FoeAct(e,pick(e.acts),null,()=>b2DirectorNext(e));
}
function b2DirectorNext(e) {
  if(!b2Alive(e)||(e.phase===2&&e.step==='A')) return [];
  e.count=(e.count||0)+1;
  if(e.count%3!==1) return [];   // on its 1st, 4th, 7th... turn it announces the next one
  e.tel=(e.tel||0)+1;
  const cut=e.tel%2===1;
  e.intent={kind:cut?'cut':'heal',act:{name:cut?'CUT!':'Take Two'}};
  return [()=>{ b2Msg(cut?B2_DIRECTOR.cutWarn:B2_DIRECTOR.healWarn); e.shake=.3; b2Render(); },1600];
}
// ---------- The Red Pen (chapter 5 boss) ----------
// On its 2nd, 5th, 8th... turn it locks onto someone for SEE ME next turn (on the ribbon): a hit that marks them, and
// marked people take double damage for 2 turns. Its normal attacks go for whoever is marked. DEFEND covers the mark;
// Grace's Squishy Squeeze clears it. Below half HP two Pop Quizzes flutter in and it braces behind a shield for Final
// Grade on everyone; after each SEE ME in phase 2 it braces again. Amy's Pop Quiz breaks the wind-up.
const B2_REDPEN={
  open:'The stage lights snap on. The Red Pen clicks itself open and peers at everyone over its reading glasses.',
  open2:'Every third turn it circles someone: SEE ME (double damage for a while). It shows on the turn ribbon first. Tom can DEFEND them.',
  phase:N=>N+' scribbles POINTS OFF across the whole stage. Ink everywhere.',
  adds:n=>n>1?'Two Pop Quizzes flutter down from the rafters!':'A Pop Quiz flutters down from the rafters!',
  brace:(N,e)=>N+' uncaps itself for a FINAL GRADE on everyone next turn! Break its guard: '+e.shield.need+' Splash or Sparkle hits, any Tombo, or Amy’s Pop Quiz.',
  lockWarn:(N,t)=>N+' peers at '+t.name+'. "You. SEE ME." Next turn it circles '+t.name+'.'+(b2Tom()&&t.id!=='tom'?' Tom can DEFEND.':'')
};
function b2RedPenTurn(e,N) {
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind==='lock')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_REDPEN.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('popquiz',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_REDPEN.adds(n)); sfx.whoosh&&sfx.whoosh(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' taps the podium. Tap. Tap. Tap.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_REDPEN.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2RedPenNext(e)); }
    if(e.phase===2) e.step='A';
    return b2FoeAct(e,I.act,b2Alive(I.target)?I.target:null,()=>b2RedPenNext(e));
  }
  const marked=b2LiveParty().find(p=>p.st.seeme);
  return b2FoeAct(e,pick(e.acts),marked||null,()=>b2RedPenNext(e));
}
function b2RedPenNext(e) {
  if(!b2Alive(e)||(e.phase===2&&e.step==='A')) return [];
  e.count=(e.count||0)+1;
  if(e.count%3!==2) return [];
  const pool=b2LiveParty().filter(p=>!p.st.seeme),t=pick(pool.filter(p=>p.id!=='tom'))||pick(pool);
  if(!t) return [];
  b2SetLock(e,t);
  return [()=>{ b2Msg(B2_REDPEN.lockWarn(cap(e.def.the),t)); e.shake=.3; b2Render(); },1600];
}
// ---------- Chairman Cheeks (chapter 6 boss) ----------
// On its 2nd, 5th, 8th... turn it buries an Acorn Cache (an inert foe in the back row) and announces DIG UP on the
// ribbon: on its next turn it digs up and eats every cache still there (12% heal each, POW +30% for 2 turns). Nara
// digs caches up for double damage. Below half HP two Acorn Agents drop in and it braces behind a shield for The Big
// Stash on everyone; after each DIG UP in phase 2 it braces again. Un-Grump route: SHARE A SNACK x3.
const B2_CHEEKS={
  open:'Chairman Cheeks bangs a walnut on the hoard. ORDER! The meeting of the Old Oak is now in session.',
  open2:'Every third turn it buries an acorn. On its next turn it digs it up and eats it to heal. Break the acorn first: Nara digs them up for double.',
  phase:N=>N+' stuffs both cheeks and calls an EMERGENCY MEETING.',
  adds:n=>n>1?'Two Acorn Agents drop out of the branches!':'An Acorn Agent drops out of the branches!',
  brace:(N,e)=>N+' climbs the hoard for THE BIG STASH on everyone next turn! Break its guard: '+e.shield.need+' Kinetic or Splash hits, or any Tombo.',
  bury:N=>'BURY IT! '+N+' buries an acorn in the hoard. Next turn it digs it up and eats it. Break the acorn first!'
};
function b2CheeksTurn(e,N) {
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind==='dig')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e&&!f.D.inert).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_CHEEKS.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('acornagent',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_CHEEKS.adds(n)); sfx.whoosh&&sfx.whoosh(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' straightens its tiny tie and glares.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_CHEEKS.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2CheeksNext(e)); }
    if(I.kind==='dig') {
      if(e.phase===2) e.step='A';
      const caches=b2LiveFoes().filter(f=>f.D.inert);
      if(!caches.length) {
        enqueue(()=>{ b2Msg(N+' digs where it buried the acorn. Nothing there. It looks very, very betrayed.'); e.shake=.4; sfx.nope&&sfx.nope(); },1600,...b2CheeksNext(e),()=>b2AfterAction());
        return;
      }
      enqueue(()=>{ b2Msg('DIG UP! '+N+' digs up the acorn and eats it. CRUNCH.'); e.lunge=.4; sfx.pickup&&sfx.pickup(); for(const c of caches) { c.hp=0; b2FoeDown(c); } },1100,
        ()=>{ const h=Math.min(e.maxHp-e.hp,Math.round(e.maxHp*.12*caches.length)); e.hp+=h; const p=b2FoePoint(e); pop('+'+h,p.x,p.y,'#9be39a'); b2AddStatus(e,'powup',2,{by:e}); sfx.heal(); b2Render(); },1300,
        ...b2CheeksNext(e),()=>b2AfterAction());
      return;
    }
  }
  return b2FoeAct(e,pick(e.acts),null,()=>b2CheeksNext(e));
}
function b2CheeksNext(e) {
  if(!b2Alive(e)||e.intent||(e.phase===2&&e.step==='A')) return [];
  e.count=(e.count||0)+1;
  if(e.count%3!==2) return [];
  return [()=>{
    const n=b2Summon('acorncache',1,e.lvl);
    if(n) { const c=B2.foes.filter(f=>f.D.inert&&b2Alive(f)).pop(); if(c&&c.row==='front'&&b2LiveFoes().filter(f=>f.row==='back').length<2) { c.row='back'; b2LayoutFoes(); }
      e.intent={kind:'dig',act:{name:'Dig Up'}}; b2Msg(B2_CHEEKS.bury(cap(e.def.the))); sfx.thud&&sfx.thud(); }
    b2Render(); },1800];
}
// ---------- The Unread (chapter 7 boss) ----------
// It reads one chapter at a time, and each genre has its own weak spot. On its 2nd, 5th, 8th... turn it announces a PAGE
// TURN (on the ribbon); on its next turn it turns to the next chapter: new weakness, new resistance, shown right away.
// Below half HP two Shushers slip out of its pages and it braces behind a shield for THE END on everyone; after each
// page turn in phase 2 it braces again. Un-Grump route: READ ALOUD x3.
const B2_UNREAD={
  genres:[{name:'MYSTERY',weak:['chatter'],resist:['kinetic'],line:'Who did it? Nobody knows. Ask it questions: Chatter works.'},
    {name:'ADVENTURE',weak:['kinetic'],resist:['chatter'],line:'Swords, ships, a map with an X. Hit it hard: Kinetic works.'},
    {name:'FAIRY TALE',weak:['sparkle'],resist:['cozy'],line:'Once upon a time, with sparkles. Sparkle works.'},
    {name:'COOKBOOK',weak:['cozy'],resist:['sparkle'],line:'Why\'s there a cookbook in the middle of a novel? Cozy works.'}],
  open:'The green lamps flicker. The Unread creaks open to page one. Dust everywhere. Seventy years of it.',
  open2:'Every third turn it turns to a new chapter, and its weak spot changes. It shows on the turn ribbon first.',
  chapter:e=>{ const G=B2_UNREAD.genres[e.genre]; return 'CHAPTER '+(e.chap||1)+': '+G.name+'. '+G.line; },
  phase:N=>N+' skips to the last chapter. PLOT TWIST.',
  adds:n=>n>1?'Two Shushers slip out from between its pages!':'A Shusher slips out from between its pages!',
  brace:(N,e)=>N+' gets ready to slam shut: THE END on everyone next turn! Break its guard: '+e.shield.need+' Sparkle or Cozy hits, or any Tombo.',
  warn:N=>N+' licks its finger and reaches for the corner of the page. PAGE TURN next turn: its weak spot will change.'
};
function b2UnreadGenre(e) {
  const G=B2_UNREAD.genres[e.genre%B2_UNREAD.genres.length];
  e.weak=G.weak.slice(); e.resist=G.resist.slice(); e.revealed=true;
}
function b2UnreadTurn(e,N) {
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind==='page')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_UNREAD.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('shusher',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_UNREAD.adds(n)); sfx.whoosh&&sfx.whoosh(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' rustles its pages. Ominously.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_UNREAD.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2UnreadNext(e)); }
    if(I.kind==='page') {
      if(e.phase===2) e.step='A';
      e.genre=(e.genre+1)%B2_UNREAD.genres.length; e.chap=(e.chap||1)+1; b2UnreadGenre(e);
      const p=b2FoePoint(e);
      enqueue(()=>{ sfx.whoosh&&sfx.whoosh(); e.lunge=.4; battle.texts.push({txt:'PAGE TURN',x:p.x,y:p.y-30,color:'#ffe08a',sc:2,t:0,dur:1.4}); b2Msg('PAGE TURN! '+B2_UNREAD.chapter(e)); b2Render(); },2200,
        ...b2UnreadNext(e),()=>b2AfterAction());
      return;
    }
  }
  return b2FoeAct(e,pick(e.acts),null,()=>b2UnreadNext(e));
}
function b2UnreadNext(e) {
  if(!b2Alive(e)||e.intent||(e.phase===2&&e.step==='A')) return [];
  e.count=(e.count||0)+1;
  if(e.count%3!==2) return [];
  e.intent={kind:'page',act:{name:'Page Turn'}};
  return [()=>{ b2Msg(B2_UNREAD.warn(cap(e.def.the))); e.shake=.3; b2Render(); },1600];
}
// ---------- Old Ironbelly (chapter 8 boss) ----------
// Her oven heat (status heat1 to heat4, drawn over her) goes up one step after each of her turns: WARM, HOT, HOTTER,
// BROIL. Reaching BROIL announces a BROIL on everyone (on the ribbon); she does it on her next turn and cools back to
// WARM. A Splash hit cools her one step (and calls off a waiting BROIL); a Cozy hit stokes her one step. Below half HP
// two Lukewarms drip out of the ash pan and she braces behind a shield for FULL FURNACE on everyone; after each BROIL in
// phase 2 she braces again. Un-Grump route: BAKE SOMETHING x3 (each one also takes a step of heat into the bread).
const B2_IRON={
  open:'The firebox door swings open. Every stolen pilot light on 2nd Avenue is roaring around inside Old Ironbelly.',
  open2:'She gets hotter every turn. At BROIL she hits everyone. Splash cools her down a step. Cozy stokes her up.',
  phase:N=>N+' rattles her grate. Every damper is open. She\'s ROARING.',
  adds:n=>n>1?'Two Lukewarms drip out of the ash pan!':'A Lukewarm drips out of the ash pan!',
  brace:(N,e)=>N+' opens every damper for FULL FURNACE on everyone next turn! Break her guard: '+e.shield.need+' Splash or Kinetic hits, or any Tombo.',
  warn:N=>N+' glows white hot. BROIL next turn, on everyone! One Splash hit cools her and calls it off.',
  heat:N=>N+' heats up.'
};
function b2IronSet(e,h) {
  for(let k=1;k<=4;k++) delete e.st['heat'+k];
  e.heat=Math.max(1,Math.min(4,h)); e.st['heat'+e.heat]={turns:99};
}
function b2IronBroil(e) { e.intent={kind:'broil',act:e.D.flop}; }
// A hit lands on her: Splash cools, Cozy stokes.
function b2IronElem(t,act) {
  if(!t.heat||!b2Alive(t)) return;
  const els=[].concat(act.elem||[]),p=b2FoePoint(t);
  if(els.includes('splash')) {
    if(t.heat<=1) return;
    b2IronSet(t,t.heat-1); sfx.splat&&sfx.splat();
    battle.texts.push({txt:'HISS! '+B2_STATUS['heat'+t.heat].short,x:p.x,y:p.y-34,color:'#9fd8ff',sc:1,t:0,dur:1.3});
    if(t.intent&&t.intent.kind==='broil') { t.intent=null; b7Later(()=>{ if(B2.active) b2Msg('HISSSS! Steam everywhere. '+cap(t.def.the)+' cools down to '+B2_STATUS['heat'+t.heat].name+'. The BROIL is off!'); b2Render(); },250); }
  } else if(els.includes('cozy')) {
    if(t.heat>=4) return;
    b2IronSet(t,t.heat+1);
    battle.texts.push({txt:'STOKED! '+B2_STATUS['heat'+t.heat].short,x:p.x,y:p.y-34,color:'#ffb04a',sc:1,t:0,dur:1.3});
    if(t.heat>=4&&!t.intent) { b2IronBroil(t); b7Later(()=>{ if(B2.active) b2Msg('Cozy stokes her right up. '+B2_IRON.warn(cap(t.def.the))); b2Render(); },250); }
  }
}
function b2IronTurn(e,N) {
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind==='broil')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_IRON.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('lukewarm',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_IRON.adds(n)); sfx.splat&&sfx.splat(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' ticks and creaks. Ominously.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_IRON.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2IronNext(e)); }
    if(I.kind==='broil') {
      if(e.phase===2) e.step='A';
      return b2FoeAct(e,e.D.flop,null,()=>{ if(!b2Alive(e)) return []; b2IronSet(e,1); return [()=>{ b2Msg(N+' sighs out a cloud of steam and cools back down to WARM.'); b2Render(); },1300]; });
    }
  }
  return b2FoeAct(e,pick(e.acts),null,()=>b2IronNext(e));
}
function b2IronNext(e) {
  if(!b2Alive(e)||e.intent||(e.phase===2&&e.step==='A')) return [];
  b2IronSet(e,(e.heat||1)+1);
  const p=b2FoePoint(e),N=cap(e.def.the),short=B2_STATUS['heat'+e.heat].short;
  if(e.heat>=4) { b2IronBroil(e);
    return [()=>{ battle.texts.push({txt:short,x:p.x,y:p.y-30,color:'#ff5a3a',sc:2,t:0,dur:1.4}); b2Msg(B2_IRON.warn(N)); e.shake=.4; sfx.charge&&sfx.charge(); b2Render(); },1700]; }
  return [()=>{ battle.texts.push({txt:short,x:p.x,y:p.y-30,color:'#ffb04a',sc:2,t:0,dur:1.2}); b2Msg(B2_IRON.heat(N)+' '+B2_STATUS['heat'+e.heat].name.toUpperCase()+' now.'); b2Render(); },1200];
}
// ---------- The Mirrorball (chapter 9 boss) ----------
// Her mirror side (status mirsparkle, mirkinetic, mirsplash or mircozy, drawn over her) shows one element; it turns to
// the next one after each of her turns. A hit with that element bounces: she takes a quarter of it and the attacker
// takes a third (never down below 1 HP). Tombos and items never bounce. On her 2nd, 5th, 8th... turn she puts a
// SPOTLIGHT on someone (a lock-on, on the ribbon) and does a SOLO on them next turn; Tom can DEFEND them. Below half HP
// two Stuffed Shirts stroll in and she braces behind a shield for LAST DANCE on everyone; after each SOLO in phase 2 she
// braces again. Un-Grump route: ASK HER TO DANCE x3.
const B2_BALL={
  sides:['sparkle','kinetic','splash','cozy'],
  open:'A thousand little mirrors catch the moonlight. The Mirrorball starts to turn.',
  open2:'Her MIRROR side bounces that element right back at whoever used it. She turns a new side out every turn. B Inspects her.',
  side:e=>{ const n=B2_ELEMS[e.mirror].name; return 'MIRROR SIDE: '+n.toUpperCase()+'. '+n+' hits bounce back. Everything else gets through.'; },
  phase:N=>N+' spins faster and faster. ENCORE!',
  adds:n=>n>1?'Two Stuffed Shirts stroll in. Fashionably late.':'A Stuffed Shirt strolls in. Fashionably late.',
  brace:(N,e)=>N+' slows down for the LAST DANCE on everyone next turn! Break her guard: '+e.shield.need+' Chatter or Kinetic hits, or any Tombo.',
  spot:(N,t)=>N+' swings her spotlight onto '+t.name+'. SOLO next turn!'+(b2Tom()&&t.id!=='tom'?' Tom can DEFEND them.':'')
};
function b2BallSide(e,i) {
  for(const k of B2_BALL.sides) delete e.st['mir'+k];
  e.mside=i%B2_BALL.sides.length; e.mirror=B2_BALL.sides[e.mside]; e.st['mir'+e.mirror]={turns:99};
}
function b2BallReflect(act,t,r) {
  if(act.tombo||!t.mirror||!b2Alive(t)) return;
  if(![].concat(act.elem||[]).includes(t.mirror)) return;
  r.reflect=Math.max(1,Math.round(r.dmg/3)); r.dmg=Math.max(1,Math.round(r.dmg/4));
}
function b2BallBounce(u,amt,t) {
  if(!u||!b2Alive(u)) return;
  const p=b2FoePoint(t),hit=Math.min(amt,u.hp-1);
  battle.texts.push({txt:'MIRRORED!',x:p.x,y:p.y-30,color:'#dfe6f2',sc:1,t:0,dur:1.2});
  sfx.ding&&sfx.ding();
  if(hit>0) { u.hp-=hit; b2PopParty(u,'-'+hit,'#dfe6f2'); }
  b7Later(()=>{ if(B2.active) b2Msg('It bounced off her '+B2_ELEMS[t.mirror].name+' side! '+u.name+' takes some of it back.'); },300);
}
function b2BallTurn(e,N) {
  if(e.phase===2&&e.step==='A'&&!(e.intent&&e.intent.kind==='lock')) {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_BALL.phase(N)); e.shake=.7; sfx.whoosh&&sfx.whoosh(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('stuffedshirt',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_BALL.adds(n)); sfx.doorOut&&sfx.doorOut(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' hums along to music only she can hear.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_BALL.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    enqueue(...steps,()=>b2AfterAction());
    return;
  }
  if(e.intent) {
    const I=e.intent; e.intent=null; e.shield=null;
    if(I.kind==='all') { e.step='C'; return b2FoeAct(e,I.act,null,()=>b2BallNext(e)); }
    if(I.kind==='lock') { if(e.phase===2) e.step='A'; return b2FoeAct(e,I.act,b2Alive(I.target)?I.target:null,()=>b2BallNext(e)); }
  }
  return b2FoeAct(e,pick(e.acts),null,()=>b2BallNext(e));
}
function b2BallNext(e) {
  if(!b2Alive(e)) return [];
  b2BallSide(e,(e.mside||0)+1);
  const p=b2FoePoint(e),N=cap(e.def.the),steps=[()=>{ battle.texts.push({txt:'TURN',x:p.x,y:p.y-30,color:'#dfe6f2',sc:2,t:0,dur:1}); b2Msg(N+' turns. '+B2_BALL.side(e)); b2Render(); },1500];
  if(e.intent||(e.phase===2&&e.step==='A')) return steps;
  e.count=(e.count||0)+1;
  if(e.count%3===2) {
    const live=b2LiveParty(),others=live.filter(u=>u.id!=='tom'),t=pick(others.length?others:live);
    if(t) { e.intent={kind:'lock',target:t,act:e.D.solo};
      steps.push(()=>{ b2Msg(B2_BALL.spot(N,t)); e.shake=.3; sfx.charge&&sfx.charge(); b2Render(); },1700); }
  }
  return steps;
}
// ---------- The Last Call (chapter 10 boss) ----------
// Gate Zero's departure board. At the start of each of her turns she calls one person (status boarding, a NOW BOARDING tag on
// their card): whoever is furthest down the turn ribbon, Tom last. Her DELAYED always goes for that person. If they act before her next turn they board (+2 VP,
// a little HEART). If not, her next turn opens with GATE CLOSED on them: a hit, and they lose their next turn
// (Grounded), unless Tom is DEFENDing them (he walks them onto the plane). Her DELAYED pushes someone down the ribbon.
// Below half HP two Carry-Ons roll in and she braces behind a shield for FINAL BOARDING on everyone; she makes no call
// while she braces. Un-Grump route: ANSWER THE CALL x3.
const B2_CALL={
  open:'DING. Every flap on the board spins. \"This is the LAST CALL for Flight Zero. Boarding Group Zero, please proceed to the gate.\"',
  open2:'Each turn she calls someone NOW BOARDING. They must act before her next turn, or the gate closes on them. Her DELAYED pushes them back. Tom can DEFEND them to walk them on.',
  phase:N=>N+' flips every flap to FINAL CALL. The whole board rattles.',
  adds:n=>n>1?'Two Carry-Ons roll in. They\'ll not fit.':'A Carry-On rolls in. It\'ll not fit.',
  brace:(N,e)=>N+' clears the board for FINAL BOARDING on everyone next turn! Break her guard: '+e.shield.need+' Kinetic or Sparkle hits, or any Tombo.',
  call:(n,t)=>'NOW BOARDING: GROUP '+n+'. '+t.name+', please proceed to Gate Zero.'+(b2Tom()&&t.id!=='tom'?' ('+t.name+' must act before her next turn, or Tom can DEFEND them.)':' (Act before her next turn.)')
};
function b2CallPick(e) {
  if(!b2Alive(e)||(e.intent&&e.intent.kind==='all')||(e.phase===2&&e.step==='A')) return [];
  const live=b2LiveParty().filter(u=>!u.st.grounded),others=live.filter(u=>u.id!=='tom'),pool=others.length?others:live;
  if(!pool.length) return [];
  const t=pool.slice().sort((a,b)=>b.ct-a.ct||Math.random()-.5)[0];
  for(const u of B2.party) delete u.st.boarding;
  e.call=t; e.group=(e.group||0)+1; t.st.boarding={turns:99};
  const p=b2FoePoint(e),n=e.group;
  return [()=>{ battle.texts.push({txt:'NOW BOARDING',x:p.x,y:p.y-30,color:'#f2c75a',sc:2,t:0,dur:1.2}); sfx.ding&&sfx.ding(); b2PopParty(t,'BOARDING','#f2c75a',-18); b2Msg(B2_CALL.call(n,t)); b2Render(); },1900];
}
// The called person took a turn in time: they board.
function b2CallBoarded(u) {
  if(!u.st.boarding) return;
  delete u.st.boarding;
  const e=B2.foes.find(f=>f.boss==='lastcall'); if(e&&e.call===u) e.call=null;
  if(!b2Alive(u)) return;
  u.vp=Math.min(B2_VP.cap,u.vp+2); b2PopParty(u,'BOARDED +2 VP','#f2c75a',-18); b2Heart(B2_HEART.weak); sfx.coin&&sfx.coin();
  b7Later(()=>{ if(B2.active) b2Msg(u.name+' made it to the gate. Boarded! +2 VP.'); },350);
}
// At the start of her turn: anyone she called who has not boarded gets the gate closed on them (Tom can walk them on).
function b2CallGate(e,N) {
  const t=e.call; e.call=null;
  if(!t||!t.st.boarding) return [];
  delete t.st.boarding;
  if(!b2Alive(t)) return [];
  const tom=b2Tom();
  if(t.st.guarded&&tom&&b2Alive(tom)&&t.st.guarded.by===tom) return [()=>{ battle.block={target:t.idx,t:0,dur:1.5}; sfx.guard(); say('tom','block');
    b2Msg('Tom walks '+t.name+' right up to the gate. \"No touching, please.\" '+t.name+' is boarded!'); t.vp=Math.min(B2_VP.cap,t.vp+2); b2PopParty(t,'BOARDED','#f2c75a',-18); b2Render(); },1700];
  return [()=>{ b2Msg('GATE CLOSED! '+N+' slams the gate shut on '+t.name+'.'); e.lunge=.55; sfx.grumpAttack(); b2AimFoe(e,t); },420,
    ()=>{ b2HitParty(e,e.D.gate,t); if(b2Alive(t)) b2AddStatus(t,'grounded',1,{by:e}); b2Aim0(); b2Render(); },1200];
}
function b2CallTurn(e,N) {
  const pre=b2CallGate(e,N);
  const go=f=>{ if(pre.length) enqueue(...pre,()=>{ if(!b2LiveParty().length) { enqueue(300,()=>b2Lose()); return; } f(); }); else f(); };
  if(e.phase===2&&e.step==='A') {
    e.step='B'; e.intent=null;
    const adds=b2LiveFoes().filter(f=>f!==e).length,steps=[];
    if(e.phaseNew) { e.phaseNew=false; steps.push(()=>{ b2Msg(B2_CALL.phase(N)); e.shake=.7; sfx.thud&&sfx.thud(); },1300); }
    if(adds<2&&(e.summons||0)<2) { e.summons=(e.summons||0)+1;
      steps.push(()=>{ const n=b2Summon('carryon',2-adds,Math.max(1,e.lvl-2)); b2Msg(B2_CALL.adds(n)); sfx.thud&&sfx.thud(); b2Render(); },1300); }
    else steps.push(()=>{ b2Msg(N+' flips through every city she knows. Very fast.'); e.lunge=.4; },1000);
    steps.push(()=>{ b2SetAll(e,e.D.rumble); b2Msg(B2_CALL.brace(N,e)); sfx.charge&&sfx.charge(); b2Render(); },2000);
    return go(()=>enqueue(...steps,()=>b2AfterAction()));
  }
  // A normal turn: the gate, a new call, then her move. DELAYED goes for whoever she just called.
  if(e.intent&&e.intent.kind==='all') { const I=e.intent; e.intent=null; e.shield=null; e.step='C'; return go(()=>enqueue(...b2CallPick(e),()=>b2FoeAct(e,I.act,null))); }
  const act=pick(e.acts);
  return go(()=>enqueue(...b2CallPick(e),()=>b2FoeAct(e,act,act.delay&&e.call?e.call:null)));
}
// ANSWER THE CALL for the Last Call (chapter 10). The spoken lines are in data/lines.js (praise).
const B2_ANSWER_LINES={tom:['Here. Group zero. Pass out, liquids in a bag, shoes back on.','Present. Window seat, please. I\'ll not be reclining.'],
  grace:['HERE! Grace! Group zero! I\'ve been waiting my WHOLE LIFE for this!','Present! Can I sit by the window? I want to film the takeoff for my channel.'],
  rose:['HERE! I\'m HERE! Me! Rose! I have Lamby!','Me me me! Can I push the button? The ding button?'],
  amy:['Here! Gregori, party of four. We\'re always first in line.','Present. I\'ve never missed a connection in my life.'],
  _:['Here! Group zero!']};
// ASK HER TO DANCE for the Mirrorball (chapter 9). The spoken lines are in data/lines.js (praise).
const B2_DANCE_LINES={tom:['May I have this dance? I should warn you. I mostly sway.','One song. I lead. You spin. You\'re very good at spinning.'],
  deedee:['Come on, honey. Deedee hasn\'t missed a dance floor in fifty years. One, two, three.','Shoes off, everybody! Floors just mopped! Let\'s DANCE!'],
  boppy:['My knees say no. My heart says one song. Just one. Slow.','Did I ever tell you I won a dance contest? 1970. Sit down. I mean, stand up.'],
  _:['Shall we dance?']};
// BAKE SOMETHING for Old Ironbelly (chapter 8). The spoken lines are in data/lines.js (praise).
const B2_BAKE_LINES={tom:['One sourdough boule. Score it, slide it in. Twenty minutes. Don\'t open the door.','Here. Bready Mercury’s best. You\'re the only oven on the block hot enough for him.'],
  tnb:['I made you a little pot, buddy. Bisque fire. Five minutes in you and it\'s perfect.','Mug in the kiln! Okay, in the stove. Same thing. You\'re basically a kiln with feelings.'],
  nara:['Nara drops her chicken jerky in the warming tray, very carefully. She wants it warm. She\'s very picky.','Nara pushes her cold dinner bowl right up to the firebox door with her nose. Please. Warm it.'],
  _:['Here. Bake this.']};
// READ ALOUD for the Unread (chapter 7). The spoken lines are in data/lines.js (praise).
const B2_READ_LINES={tom:['Chapter one. It was a dark and stormy night. Good start. Classic.','And then the detective said... ooh. I didn\'t see that coming.'],
  grace:['Hey guys! Today we\'re reading a REAL book. Out loud. Smash that like button!','Chapter two! I\'m doing all the voices. This one is the duchess. She\'s bossy.'],
  rose:['Once upon a time there was a LAMB. The end! Again! AGAIN!','I\'m reading the pictures! There\'s a dragon. The dragon is ME. RAWR!'],
  _:['Once upon a time...']};
// SHARE A SNACK for Chairman Cheeks (chapter 6). The spoken lines are in data/lines.js (praise).
const B2_CHEEKS_LINES={tom:['Here. Sourdough. I made it. You can have the heel. The heel is the best part.','Have a slice. Seriously. Bread is for sharing.'],
  tnb:['Want half my granola bar? It\'s the good kind. With the chocolate.','Here, buddy. I always pack two. One for me, one for whoever is having a bad day.'],
  nara:['Nara looks at her chicken jerky. Looks at the squirrel. Nara drops the jerky at its feet. This is the biggest thing she\'s ever done.','Nara nudges her own treat across the branch with her nose. Very slowly. Very brave.'],
  _:['Here. Have some.']};
// COMPLIMENT and GREAT TAKE! (▼ Bag, only against monsters that want one: B2_FOES praise). Free, standard speed.
// praise.share: Warmth as a share of the goal (halved each time the same person says it again). praise.need: that many
// kind words Un-Grump it outright (the Director's Cut: three GREAT TAKEs).
const B2_PRAISE_LINES={
  tom:['Honestly? Great take. Really. Chef’s kiss.','That was a GREAT take. I\'d watch that twice.','Great take. I got chills. Real ones.'],
  tnb:['Babe... I mean, buddy. That take? Iconic.','That was a great take. And I\'ve seen forty-seven horror movies.','Great take. I\'d not change a single stitch.'],
  nara:['Nara gives it the biggest tail wag she has. Ten out of ten.','Nara sits, looks it in the eye, and boops it. That\'s a five-star review.'],
  _:['Great take! Really!','That was wonderful. Really wonderful.']
};
const B2_CRAB_LINES={tom:['Nice handwriting. Honestly. Very readable.','Those are the neatest cue cards I\'ve ever seen.'],
  tnb:['Your lettering is so clean. Are those fonts? Tell me those aren\'t fonts.','Love the cards. Very crisp. Very wardrobe.'],
  nara:['Nara sniffs the cards and wags. She approves of the handwriting.'],_:['Nice handwriting!']};
// NICE HANDWRITING for the Red Pen (chapter 5). The spoken lines are in data/lines.js (praise).
const B2_PEN_LINES={tom:['Honestly? Lovely handwriting. Very legible.','That\'s beautiful penmanship. I mean it.'],
  grace:['Your cursive is SO pretty. Can you teach me the capital G?','Your loops are perfect. I\'m going to practice mine.'],
  rose:['Your writing is so pretty! Can you write ROSE? Big?','I like your red! Red is my second favorite!'],
  amy:['Neatest handwriting in the building. And I check.','Your margins are immaculate. Gold star.'],
  _:['Nice handwriting!']};
function b2PraiseSteps(u,opt) {
  const t=opt&&opt.primary,P=t&&t.D.praise;
  if(!t||!P||!b2Alive(t)) return [()=>b2Msg('Nobody to say it to.'),700];
  const pool=(t.id==='cuecrab'?B2_CRAB_LINES:t.id==='redpen'?B2_PEN_LINES:t.id==='chairman'?B2_CHEEKS_LINES:t.id==='unread'?B2_READ_LINES:t.id==='ironbelly'?B2_BAKE_LINES:t.id==='mirrorball'?B2_DANCE_LINES:t.id==='lastcall'?B2_ANSWER_LINES:B2_PRAISE_LINES),lines=pool[u.id]||pool._,line=pick(lines);
  const said=u.id==='nara'?line:u.name+': "'+line+'"';
  return [()=>{ b2Msg(said); battle.fx[u.idx].hop=.4; if(u.id!=='nara') say(u.id,'praise',0,line); else { sfx.bark&&sfx.bark(); } },1500,()=>{
    const p=b2FoePoint(t),c=b2FoeCanvasPos(t);
    b2Fx({kind:'heart',x:c.x+18,y:c.y-c.h,small:true,t:0,dur:.9}); sfx.ding&&sfx.ding();
    b2Heart(B2_HEART.weak);
    // Old Ironbelly: the heat goes into the bread, not into the party.
    if(t.boss==='ironbelly'&&t.heat>1) { b2IronSet(t,t.heat-1); if(t.intent&&t.intent.kind==='broil') t.intent=null; }
    if(P.need) {
      t.takes=(t.takes||0)+1;
      t.warm=Math.min(t.warmGoal,Math.max(t.warm,Math.round(t.warmGoal*t.takes/P.need))); t.warmFlash=.6;
      battle.texts.push({txt:(P.tag||'GREAT TAKE')+' '+Math.min(t.takes,P.need)+'/'+P.need,x:p.x,y:p.y-22,color:'#ff9ac0',sc:1,t:0,dur:1.4});
      if(t.takes>=P.need) { b2Calm(t,null); const list=B2.calmLate||[t]; B2.calmLate=null; b7Later(()=>{ if(B2.active) b2Msg(b2CalmText(list)); },300); }
      else b7Later(()=>{ if(B2.active) b2Msg(P.react[Math.min(t.takes-1,P.react.length-1)]+' ('+t.takes+' of '+P.need+')'); },300);
    } else {
      const k='praise:'+u.id,n=t.kindLog[k]||0; t.kindLog[k]=n+1;
      const amt=Math.max(1,Math.round(t.warmGoal*P.share*Math.pow(B2_KIND_REPEAT,n)));
      t.warm=Math.min(t.warmGoal,t.warm+amt); t.warmFlash=.6; pop('+'+amt,p.x+7,p.y-3,'#ff9ac0');
      if(n===0) battle.texts.push({txt:'SOOTHED',x:p.x,y:p.y-16,color:'#ff9ac0',sc:1,t:0,dur:1.1});
      if(t.warm>=t.warmGoal) { b2Calm(t,null); const list=B2.calmLate||[t]; B2.calmLate=null; b7Later(()=>{ if(B2.active) b2Msg(b2CalmText(list)); },300); }
      else b7Later(()=>{ if(B2.active) b2Msg(pick(P.react)); },300);
    }
    b2Render();
  },1500];
}

// New enemies join mid-fight (bosses calling for help). Fallen ones make room first.
function b2Summon(id,n,lvl) {
  B2.foes=B2.foes.filter(f=>f.boss||(!f.dead&&f.dying<0)); B2.units=[...B2.party,...B2.foes];
  let made=0;
  for(let k=0;k<n;k++) {
    const front=b2LiveFoes().filter(f=>f.row==='front').length,back=b2LiveFoes().filter(f=>f.row==='back').length;
    const row=front<3?'front':back<2?'back':null; if(!row) break;
    const u=b2FoeUnit(id,row,0,lvl); u.letter=null; u.spawnT=0; u.ct=Math.floor(b2Delay(u,1)*(.6+Math.random()*.3));
    // Keep the boss in the middle of the front row.
    const bi=B2.foes.findIndex(f=>f.boss);
    if(row==='front'&&bi>=0) B2.foes.splice(made===0?bi:bi+1,0,u); else B2.foes.push(u);
    B2.units.push(u); made++;
  }
  b2Letters(); b2LayoutFoes();
  return made;
}

// ---------- Win and lose ----------
// Full-game wins end on the victory card (engine/feel.js): XP bars, level ups, Stamp Points, coins and the drop on one
// card, dismissed with a tap. Battle Lab wins keep the plain message line.
function b2Win() {
  battle.state='busy'; B2.ui='busy'; b2Render();
  sfx.win();
  const live=b2LiveParty(),w=pick(live);
  for(const p of live) battle.fx[p.idx].cheer=1.6;
  battle.texts.push({txt:'VICTORY',x:96,y:24,color:'#ffe08a',sc:4,t:0,dur:2});
  const d=B2.foes.find(f=>f.boss)?B2.foes.find(f=>f.boss).def:B2.foes[0].def;
  const many=B2.foes.length>1&&B2.foes.every(f=>f.id===d.id);
  const kind=B2.foes.every(f=>f.calm);
  const line=kind?'Kindness victory! '+(many?'The '+d.name+'s':cap(d.the))+' went home happy.':many?'The '+d.name+'s melt back into the mud. Politely.':d.die;
  const steps=[()=>{ b2Msg(line); if(w) say(w.id,'win',.2,w.id==='tom'&&!B2.party.some(p=>p.id==='grace')?'Well! Good job, team!':undefined); },1900];
  // Nara's victory puddle: every win she is standing for.
  const nara=B2.party.find(p=>p.id==='nara'&&b2Alive(p));
  if(nara) steps.push(()=>{ battle.fx[nara.idx].cheer=1.6; if(w!==nara) say('nara','win'); if(typeof RFX!=='undefined') RFX.scene('naraPuddle',3.2,{i:nara.idx}); sfx.splat&&sfx.splat(); },900);
  if(B2.cfg.npc) {
    steps.push(()=>{ const R=b2RewardsData(); R.title=kind?'KINDNESS VICTORY':'VICTORY'; R.line=line; R.puddle=!!nara;
      b7ShowCard(R,()=>{ b2WriteBack(); b2End('win'); }); });
    enqueue(...steps);
    return;
  }
  if(B2.coinsWon) steps.push(()=>b2Msg('Found '+B2.coinsWon+' coins. (Battle Lab coins are pretend.)'),1100);
  steps.push(()=>{ b2WriteBack(); b2End('win'); });
  enqueue(...steps);
}
function b2Lose() {
  if(b7Pie()) return;   // Rose Mode: Deedee's emergency Rhubarb Pie, once a fight (engine/feel.js)
  battle.state='busy'; B2.ui='busy'; b2Render();
  sfx.lose();
  enqueue(()=>b2Msg('Everything goes a bit puddle-shaped.'),1800,()=>{
    if(B2.cfg.npc) { for(const p of B2.party) { const mem=memberById(p.id); mem.hp=1; } }
    b2End('lose');
    if(B2.cfg.npc) showToast(regionOf(currentMap)==='la'?'Ouch. The taco truck downtown fixes everything.':'Ouch. Visit the wish fountain to recover.',3.2);
  });
}
// HP goes back to the real members as a share of their own max (full game only).
function b2WriteBack() {
  if(!B2.cfg.carry) return;
  for(const p of B2.party) { const mem=memberById(p.id); mem.hp=p.hp<=0?0:Math.max(1,Math.round(mem.maxHp*p.hp/p.maxHp)); }
}
// A fight's purse: each monster's coins (the one Tom walked into, or the boss, in full; the rest of its formation and
// summoned adds half), +50% for each one Un-Grumped, then charm coin perks. foes: [{id, boss, calm}].
function b2Purse(foes,npc,coinPerk) {
  const d=monsterDef(npc),tier=npc.tier||0;
  let purse=0,lead=false;
  for(const f of foes) { const md=MONSTERS[f.id]||d,main=!!f.boss||(!lead&&f.id===npc.monster); if(main) lead=true;
    purse+=((md.coins||5)+tier*(md.coinStep||2))*(main?1:.5)*(f.calm?1.5:1); }
  return Math.round(purse*(1+(coinPerk||0)));
}
// XP for one member, applied now; returns what the victory card shows.
function b2GainFor(p,gain) {
  const sp0=b6SpEarned(p),lvl0=p.level,xp0=p.xp;
  p.wins=(p.wins||0)+1;
  const ups=b6GainXp(p,gain);
  for(const L of ups) if(p===hero) { if(L>=5) p.title='Local Busybody'; else if(L>=3) p.title='Regular'; }
  const rw=[]; for(const L of ups) rw.push(...b8LevelRewards(L));   // one card per reward (data/abilities.js)
  return {id:p.id,name:p.name,lvl0,xp0,lvl1:p.level,xp1:p.xp,ups:ups.length,sp:b6SpEarned(p)-sp0,rw};
}
// XP, coins and drops in the full game (F6: engine/progress.js). Everyone in the party gets the same XP, knocked out or
// not; then every member, home or away, catches up to Tom (the Family Group Chat). Coins: the purse plus what Nara stole
// or Goofed enemies dropped. Applied at once; the victory card (engine/feel.js) shows the result.
function b2RewardsData() {
  const npc=B2.cfg.npc,d=monsterDef(npc);
  const gain=b6BattleXp();
  const calm=B2.foes.filter(f=>f.calm);
  for(const f of calm) setFlag('kind:'+f.id,(flag('kind:'+f.id)||0)+1);   // Grace's Kindness Scrapbook
  const coinPerk=B2.party.reduce((a,u)=>a+((u.perk&&u.perk.coins)||0),0);
  const purse=b2Purse(B2.foes,npc,coinPerk)+B2.coinsWon;
  npc.tier++; npc.maxHp+=d.hpStep; npc.defeatedUntil=performance.now()+25000;
  coins+=purse;
  b2WriteBack();
  const members=B2.party.map((u,i)=>{
    const r=b2GainFor(memberById(u.id),gain);
    if(r.ups) { battle.fx[i].cheer=1.8; battle.fx[i].levelUp=true; const p=memberById(u.id); u.lvl=p.level; u.maxHp=p.maxHp; u.hp=u.maxHp; }
    return r;
  });
  b6Sync();
  let drop=null;
  const dr=d.drop;
  if(dr&&!(B2.stolen||[]).includes(npc.monster)&&Math.random()<dr.chance&&!(dr.once&&b6Owned(dr.id))) { bag.push(dr.id); drop={id:dr.id,name:(items[dr.id]||{}).name||dr.id,msg:dr.msg}; }
  const stamp=members.some(m=>m.rw&&m.rw.length)&&party.some(m=>b6Stampable(m)||b8PpLeft(m)>0||b8TkLeft(m)>0);
  return {xp:gain,purse,calm:calm.length,drop,members,stamp,heart:Math.floor(B2.heart||0)};
}

// ---------- The full game: walking into a monster on the map ----------
// opts (story fights, engine/story.js): tut (a TUTORIALS key: tips and a setup for the fight), level (the monster's level).
function startBattle(npc,opts={}) {
  const id=npc.monster,d=monsterDef(npc),lvl=opts.level||((d.level||1)+(npc.tier||0));
  const F=B2_FORMATIONS[id],form=((typeof F==='function'?F():F)||[[id,'front']]).map(f=>[f[0],f[1],lvl]);   // a function: crowds of a random size
  const levels={}; for(const p of party) levels[p.id]=p.level;
  b2Start({party:party.map(p=>p.id),levels,foes:form,bag,npc,carry:true,onEnd:null,tut:opts.tut||null});
}

// ---------- Battle Lab (title screen) ----------
function b2Lab(i) {
  const L=B2_LAB[i]; if(!L) return;
  B2.labLA=!!L.la; B2.labStudio=!!L.studio; B2.labSchool=!!L.school; B2.labCafe=!!L.cafe; B2.labOak=!!L.oak; B2.labCrown=!!L.crown; B2.labStacks=!!L.stacks; B2.labRead=!!L.readroom; B2.labBarn=!!L.barn; B2.labBoiler=!!L.boiler; B2.labClub=!!L.club; B2.labDome=!!L.dome; B2.labTerm=!!L.term; B2.labGate=!!L.gate;
  b2Start({party:L.party,level:L.level,foes:L.foes,bag:B2_LAB_BAG.slice(),heart:75,tombos:'all',allSkills:true,onEnd:()=>{ B2.labLA=false; B2.labStudio=false; B2.labSchool=false; B2.labCafe=false; B2.labOak=false; B2.labCrown=false; B2.labStacks=false; B2.labRead=false; B2.labBarn=false; B2.labBoiler=false; B2.labClub=false; B2.labDome=false; B2.labTerm=false; B2.labGate=false; if(typeof splashToLab==='function') splashToLab(); }});
}
