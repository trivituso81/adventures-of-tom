'use strict';
// engine/battle.js — Battle flow: commands, attacks, specials, enemy turn, win/lose.
const CMD_LABEL={attack:'ATTACK',defend:'DEFEND',dance:'DANCE',silly:'SILLY',pep:'PEP TALK',hug:'MOON & BACK',grumble:'GRUMBLE',wardrobe:'WARDROBE',puppy:'PUPPY EYES',item:'ITEM',run:'RUN'};
const CMD_FN={attack:cmdAttack,defend:cmdDefend,dance:cmdDance,silly:cmdSilly,pep:cmdPep,hug:cmdHug,grumble:cmdGrumble,wardrobe:(...a)=>cmdWardrobe(...a),puppy:(...a)=>cmdPuppy(...a),run:cmdRun};

function renderCommands() {
  const box=$('battle-commands');
  box.innerHTML='';
  const m=party[battle.actor];
  const add=(text,fn,wide=false)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='battle-cmd'+(wide?' wide':'');
    b.textContent=text;
    b.addEventListener('click',()=>{ if(battle.state==='command') { sfx.select(); fn(); } });
    box.appendChild(b);
  };
  if(battle.mode==='main') {
    for(const c of m.commands) {
      if(c==='item') add('ITEM',()=>{ battle.mode='item'; battle.sel=0; renderCommands(); setMessage('Rummage through the shared pockets.'); });
      else if(c==='attack') add('ATTACK',()=>{ battle.mode='attack'; battle.sel=0; renderCommands(); setMessage(m.name+' has '+m.mp+' MP. Pick a move.'); });
      else add(CMD_LABEL[c],CMD_FN[c]);
    }
  } else if(battle.mode==='attack') {
    for(const a of knownAttacks(m)) {
      const b=document.createElement('button');
      b.type='button'; b.className='battle-cmd atk'+(m.mp<a.mp?' nomp':'');
      b.innerHTML='<span></span><em>'+(a.mp?a.mp+' MP':'free')+'</em>';
      b.querySelector('span').textContent=a.name.toUpperCase();
      b.addEventListener('click',()=>{ if(battle.state!=='command') return; if(m.mp<a.mp) { sfx.nope(); setMessage('Not enough MP for '+a.name+'. It costs '+a.mp+'.'); return; } sfx.select(); cmdAttack(a); });
      box.appendChild(b);
    }
    add('BACK',()=>{ battle.mode='main'; battle.sel=0; renderCommands(); setMessage('What will '+m.name+' do?'); },true);
  } else {
    const usable=[...new Set(bag.filter(id=>battleUsable(items[id])))];
    if(!usable.length) add('(nothing useful in the pockets)',()=>{},true);
    for(const id of usable) {
      const it=items[id],n=bag.filter(b=>b===id).length;
      const b=document.createElement('button');
      b.type='button'; b.className='battle-cmd atk';
      b.innerHTML='<span></span><em></em>';
      b.querySelector('span').textContent=it.icon+' '+it.name.toUpperCase();
      b.querySelector('em').textContent=effectText(it).replace('Battle: ','')+(n>1?' \u00b7 x'+n:'');
      b.addEventListener('click',()=>{ if(battle.state==='command') { sfx.select(); cmdItem(id); } });
      box.appendChild(b);
    }
    add('BACK',()=>{ battle.mode='main'; battle.sel=0; renderCommands(); setMessage('What will '+m.name+' do?'); },true);
  }
  highlightCommand();
}

function highlightCommand() {
  const cmds=[...document.querySelectorAll('.battle-cmd')];
  battle.sel=clamp(battle.sel,0,Math.max(0,cmds.length-1));
  cmds.forEach((c,i)=>{ c.classList.toggle('sel',i===battle.sel); c.disabled=battle.state!=='command'; });
}

function promptActor(i) {
  battle.actor=i;
  const m=party[i];
  m.guard=false;
  if(m.mp<m.maxMp) m.mp++;
  battle.state='command';
  battle.mode='main';
  battle.sel=0;
  renderCommands();
  refreshBattleStatus();
  setMessage('What will '+m.name+' do?');
}

function playerTurn() {
  const i=party.findIndex(alive);
  if(i<0) return lose();
  promptActor(i);
}

function afterAction() {
  for(let i=battle.actor+1;i<party.length;i++)
    if(alive(party[i])) { promptActor(i); return; }
  enemyTurn();
}

function startBattle(m) {
  while(battle.fx.length<party.length) battle.fx.push(Object.assign({},battle.fx[0]));
  BATTLE_POS.length=0; for(const q of ([null,BATTLE_POS1,BATTLE_POS2,BATTLE_POS3][party.length]||BATTLE_POS4)) BATTLE_POS.push(q);
  RFX.reset(); for(const f of battle.fx) { f.pose=0; f.poseK=''; }
  battle.props=[]; battle.hose=null; battle.lift=null; battle.enemyAtkDown=0;
  for(const p of party) p.pep=false;
  battle.active=true;
  battle.monster=m;
  const def=monsterDef(m);
  battle.enemy={name:def.name,def,level:def.level+m.tier,hp:m.maxHp,maxHp:m.maxHp,atk:def.atk+m.tier};
  battle.missing=false;
  battle.state='intro';
  battle.pops=[];
  battle.time=0;
  battle.shakeEnemy=battle.flashEnemy=battle.enemyLunge=battle.slash=battle.vapor=0;
  battle.enemyStunned=0;
  battle.block=null;
  battle.vaporParts=[];
  battle.enemyGone=false;
  for(const f of battle.fx) f.shake=f.flash=f.lunge=f.twirl=f.tongue=f.appr=f.controller=f.cartwheel=f.kick=f.poke=f.combo=f.handspring=f.dismount=f.pogo=f.flop=f.roundoff=f.rebound=f.flip=f.punch=f.cheer=f.levelUp=f.tickle=f.run=f.burpee=f.coach=f.hug=f.grumble=f.hop=f.toss=f.aim=f.cast=0; for(const f of battle.fx) f.path=null; battle.enemyKnock=0;
  battle.laser=null; battle.boop=null; battle.fireball=null; battle.tetris=null; battle.texts=[];
  for(const p of party) p.guard=false;
  clearBattleQueue();
  clearInput();
  $('battle').hidden=false;
  buildStatus();
  renderCommands();
  sfx.intro();
  enqueue(def.intro,()=>{ sfx.grumpTaunt(); },()=>playerTurn());
}

function endBattle() {
  clearBattleQueue();
  battle.active=false;
  battle.state='idle';
  $('battle').hidden=true;
  canvas.focus();
  renderMenu();
}

function memberDamage(m) {
  let dmg=m.power+Math.floor(statTotal(m,'Curiosity')/2)+rand(0,2);
  const crit=Math.random()<Math.min(.5,.05*statTotal(m,'Luck'));
  if(crit) dmg*=2;
  return {dmg,crit};
}

function busy() { battle.state='busy'; highlightCommand(); refreshBattleStatus(); }

function landHit(dmg,crit) {
  if(battle.missing) { sfx.whoosh(); battle.enemyKnock=.3; pop('MISS',56,52,'#cfd8d6'); return; }
  sfx.hitEnemy(); sfx.grumpHurt(); if(crit) sfx.levelUp();
  battle.enemy.hp-=dmg; battle.shakeEnemy=.35; battle.flashEnemy=.18;
  pop(String(dmg),56,52,crit?'#ffe08a':'#fff1cb');
  refreshBattleStatus();
}

function cmdAttack(spec) {
  busy();
  const i=battle.actor,m=party[i],fx=battle.fx[i];
  spec=spec||ATTACKS[m.id][0];
  m.mp=Math.max(0,m.mp-spec.mp);
  refreshBattleStatus();
  let {dmg,crit}=memberDamage(m);
  dmg=Math.round(dmg*spec.mult);
  let pepped=false;
  if(m.pep) { dmg=Math.round(dmg*1.5); m.pep=false; pepped=true; }
  // Separation anxiety: with Tom down, Nara goes all out.
  const frantic=m.id==='nara'&&!alive(hero);
  if(frantic) dmg=Math.round(dmg*1.5);
  // Monster traits: a dodgy enemy may make the whole move miss; an armored one soaks some of each hit.
  const ed=battle.enemy.def;
  battle.missing=!!(ed.dodge&&!battle.enemyStunned&&Math.random()<ed.dodge);
  let soaked='';
  if(ed.armor&&!battle.missing) { const before=dmg; dmg=Math.max(1,dmg-ed.armor); if(dmg<before) soaked=' '+ed.armorMsg; }
  if(battle.missing) { dmg=0; crit=false; }
  const result=battle.missing?ed.dodgeMsg:((frantic?'Nara is FRANTIC. Nobody hurts her Tom! ':'')+(pepped?'Pepped up! ':'')+(crit?'Critical hit! '+dmg+' damage.':dmg+' damage.')+soaked);
  const key=spec.key;
  const bigText=(txt,x,y,color,sc,dur=1.2)=>battle.texts.push({txt,x,y,color,sc,t:0,dur});
  const confuse=()=>{ if(battle.missing) return; battle.enemyStunned=2; sfx.stun(); };
  if(RECRUIT_MOVES[m.id]&&RECRUIT_MOVES[m.id][key]) { RECRUIT_MOVES[m.id][key]({i,m,fx,dmg,crit,result}); return; }
  if(key==='basic') {
    const lines={tom:['Tom gives it a firm nudge.','Tom delivers a strongly worded shove.'],grace:['Grace shoves it with both hands.','Grace bops it on the nose.'],amy:['Amy sprints in and shoulders it. She does not slow down.','Amy tackles it like the finish line owes her money.'],deedee:['Deedee licks her thumb and wipes its face. It hates that.','Deedee gives it a look, then a spit shine.'],boppy:['Boppy swats it with his cap. His stomach complains.','Boppy leans in and bonks it. Then sits down. Not feeling good.'],tnb:['TNB lobs a mug at it. A second. He has plenty.','TNB bonks it with a bowl. Handmade. Food safe.']}[m.id];
    enqueue(
      ()=>{ setMessage(pick(lines)); fx.lunge=.6; say(m.id,LINES[m.id].basic?'basic':'attack'); },
      330,()=>{ battle.slash=.22; sfx.slash(); landHit(dmg,crit); },500,result,()=>checkEnemy());
  } else {
    if(key==='boop') enqueue(
      ()=>{ setMessage('Rose walks right up to it.'); fx.appr=1.6; fx.apprDur=1.6; say('rose',key,.45); },
      520,()=>{ fx.poke=.7; battle.boop={t:0,dur:1.1}; sfx.boop(); },180,()=>{ landHit(dmg,crit); },750,'Boop. '+result,()=>checkEnemy());
    else enqueue(()=>{ setMessage(m.name+' is not sure what to do.'); fx.lunge=.6; },330,()=>{ battle.slash=.22; sfx.slash(); landHit(dmg,crit); },500,result,()=>checkEnemy());
  }
}

function cmdDefend() {
  busy();
  const m=party[battle.actor];
  m.guard=true;
  sfx.guard();
  say(m.id,'defend');
  const heal=Math.min(2,m.maxHp-m.hp);
  m.hp+=heal;
  refreshBattleStatus();
  enqueue(m.name+' plants his feet. "No touching, please."'+(heal?' +'+heal+' HP.':''),()=>afterAction());
}

// Amy: a coach's pep talk. Everyone else's next attack hits 50% harder.
function cmdPep() {
  busy();
  const i=battle.actor,m=party[i];
  battle.fx[i].coach=1.7;
  sfx.dance();
  say(m.id,'pep');
  enqueue(
    ()=>{ setMessage(m.name+' claps twice. "Thirty seconds! Give me everything!"'); },
    900,()=>{ for(const p of party) if(alive(p)&&p!==m) p.pep=true; party.forEach((p,j)=>{ if(alive(p)&&p!==m) pop('UP',BATTLE_POS[j].x,BATTLE_POS[j].base-36,'#ffe08a'); }); sfx.levelUp(); },
    'The team is fired up. Next attacks hit harder.',
    ()=>afterAction()
  );
}
// Deedee: a moon-and-back hug for the whole party. HP and MP for everyone.
function cmdHug() {
  busy();
  const i=battle.actor,m=party[i];
  battle.fx[i].hug=1.9;
  sfx.heal();
  say(m.id,'hug');
  enqueue(
    ()=>{ setMessage(m.name+' opens her arms. "To the moon and back. Everybody in."'); },
    1000,()=>{
      party.forEach((p,j)=>{ if(!alive(p)) return; const h=Math.min(5,p.maxHp-p.hp),q=Math.min(2,p.maxMp-p.mp); p.hp+=h; p.mp+=q; pop('+'+h,BATTLE_POS[j].x,BATTLE_POS[j].base-34,'#9be39a'); });
      sfx.fountain(); refreshBattleStatus();
    },
    'Everyone gets +5 HP and +2 MP. And a hug.',
    ()=>afterAction()
  );
}
// Boppy: complains about his stomach. The Grump feels terrible about it and hits softer for the rest of the fight.
function cmdGrumble() {
  busy();
  const i=battle.actor,m=party[i];
  battle.fx[i].grumble=1.9;
  m.guard=true;
  sfx.sulk();
  say(m.id,'grumble');
  const already=battle.enemyAtkDown>=2;
  enqueue(
    ()=>{ setMessage(m.name+' sits down. "I am not feeling good. It is the stomach. And everybody walks too FAST."'); },
    1200,()=>{ if(!already) battle.enemyAtkDown=(battle.enemyAtkDown||0)+1; sfx.stun(); battle.texts.push({txt:'...',x:52,y:34,color:'#fff1cb',sc:3,t:0,dur:1}); },
    already?'The Grump has heard all of these. It still feels bad.':'The Grump feels awful. Its attacks are weaker now.',
    ()=>afterAction()
  );
}

function cmdDance() {
  busy();
  const i=battle.actor,m=party[i];
  battle.fx[i].twirl=1.1;
  sfx.dance();
  say(m.id,'dance');
  enqueue(
    m.name+' does a twirl!',
    ()=>{
      for(const p of party) if(alive(p)) p.hp+=Math.min(3,p.maxHp-p.hp);
      party.forEach((p,j)=>{ if(alive(p)) pop('+3',BATTLE_POS[j].x,BATTLE_POS[j].base-34,'#9be39a'); });
      sfx.heal();
      refreshBattleStatus();
    },
    'Everyone standing gets +3 HP.',
    ()=>afterAction()
  );
}

function cmdSilly() {
  busy();
  const i=battle.actor,m=party[i];
  battle.fx[i].tongue=2.2;
  sfx.raspberry();
  sfx.slideWhistle();
  setTimeout(()=>sfx.boing(),500); setTimeout(()=>sfx.boing(),1000); setTimeout(()=>sfx.raspberry(),1300);
  say(m.id,'silly',.6);
  if(Math.random()<.65+(battle.enemy.def.confuseBonus||0)) {
    battle.enemyStunned=2;
    enqueue(m.name+' sticks out her tongue. Pbbbt!',()=>sfx.stun(),'The Grump is thrown off completely.',()=>afterAction());
  } else {
    enqueue(m.name+' sticks out her tongue. Pbbbt!','The Grump is unmoved.',()=>afterAction());
  }
}

function cmdItem(id) {
  const i=battle.actor,m=party[i],item=items[id];
  const idx=bag.indexOf(id);
  if(idx<0) return promptActor(i);
  const nope=msg=>{ sfx.nope(); setMessage(msg); };
  // Pick who it helps: the most hurt (or most drained) member still standing.
  // Nara is a picky eater: she only takes dogOk snacks, so food goes to the next most hurt member.
  const eats=p=>p.id!=='nara'||item.dogOk||!(item.heal||item.mp);
  const living=party.filter(alive),fed=living.filter(eats);
  const worst=key=>fed.slice().sort((a,b)=>a[key]/a['max'+key[0].toUpperCase()+key.slice(1)]-b[key]/b['max'+key[0].toUpperCase()+key.slice(1)])[0];
  if(item.revive&&!party.some(p=>!alive(p))) return nope('Nobody needs waking up. Save the whistle.');
  if(item.heal&&!living.some(p=>p.hp<p.maxHp)) return nope('Everyone is at full HP. Save the '+item.name+'.');
  if((item.heal||item.mp)&&!fed.some(p=>item.heal?p.hp<p.maxHp:p.mp<p.maxMp)) return nope('Nara sniffs the '+item.name+' and turns her head away. She only eats Chicken Jerky.');
  if(item.healAll&&!living.some(p=>p.hp<p.maxHp)) return nope('Everyone is at full HP. Save the picnic.');
  if(item.mp&&!living.some(p=>p.mp<p.maxMp)) return nope('Everyone has full MP. Save the '+item.name+'.');
  busy();
  bag.splice(idx,1);
  const at=p=>BATTLE_POS[party.indexOf(p)];
  const handed=t=>t===m?'':(' Hands it to '+t.name+'.');
  if(item.heal) {
    const t=worst('hp'),g=Math.min(item.heal,t.maxHp-t.hp); t.hp+=g;
    refreshBattleStatus(); pop('+'+g,at(t).x,at(t).base-34,'#9be39a'); sfx.heal();
    enqueue(m.name+' digs out the '+item.name+'.'+handed(t)+' '+t.name+' +'+g+' HP.',()=>afterAction());
  } else if(item.healAll) {
    for(const p of living) { const g=Math.min(item.healAll,p.maxHp-p.hp); p.hp+=g; if(g) pop('+'+g,at(p).x,at(p).base-34,'#9be39a'); }
    refreshBattleStatus(); sfx.heal(); battle.fx[i].cheer=1.2;
    enqueue(m.name+' opens the '+item.name+'. Sandwiches for everyone. +'+item.healAll+' HP each.',()=>afterAction());
  } else if(item.mp) {
    const t=worst('mp'),g=Math.min(item.mp,t.maxMp-t.mp); t.mp+=g;
    refreshBattleStatus(); pop('+'+g+' MP',at(t).x,at(t).base-34,'#8fb4ff'); sfx.heal();
    enqueue(m.name+' pours the '+item.name+'.'+handed(t)+' '+t.name+' +'+g+' MP.',()=>afterAction());
  } else if(item.revive) {
    const t=party.find(p=>!alive(p)); t.hp=Math.ceil(t.maxHp/2);
    refreshBattleStatus(); pop('UP',at(t).x,at(t).base-34,'#ffe08a'); sfx.levelChime();
    enqueue(m.name+' blows the '+item.name+'. TWEEEET!',t.name+' is back up with '+t.hp+' HP.',()=>afterAction());
  } else if(item.dmg) {
    const ed=battle.enemy.def;
    let dmg=item.dmg+rand(0,2),soaked='';
    if(ed.armor) { dmg=Math.max(1,dmg-ed.armor); soaked=' '+ed.armorMsg; }
    battle.missing=false;
    enqueue(()=>{ setMessage(m.name+' throws the '+item.name+'!'); battle.fx[i].lunge=.6; sfx.whoosh(); },420,
      ()=>{ battle.slash=.22; sfx.splat(); landHit(dmg,false); },600,dmg+' damage.'+soaked,()=>checkEnemy());
  } else if(item.confuse) {
    battle.enemyStunned=2;
    sfx.raspberry();
    enqueue(m.name+' sets down the '+item.name+'. PFFFFRT.',()=>sfx.stun(),cap(battle.enemy.def.the)+' cannot concentrate at all.',()=>afterAction());
  } else if(item.atkDown) {
    const already=battle.enemyAtkDown>=2;
    if(!already) battle.enemyAtkDown=(battle.enemyAtkDown||0)+1;
    sfx.slideWhistle();
    enqueue(m.name+' plays one long note on the '+item.name+'.',()=>sfx.stun(),already?cap(battle.enemy.def.the)+' is already as deflated as it gets.':cap(battle.enemy.def.the)+' looks deflated. Its attacks are weaker.',()=>afterAction());
  } else if(item.pep) {
    for(const p of living) p.pep=true;
    living.forEach(p=>pop('UP',at(p).x,at(p).base-36,'#ffe08a')); sfx.levelUp();
    enqueue(m.name+' hands out '+item.name+'s. Everyone stands up straighter.','Next attacks hit 50% harder.',()=>afterAction());
  }
}

function cmdRun() {
  busy();
  const m=party[battle.actor];
  if(Math.random()<.35+.1*statTotal(m,'Pace')) {
    sfx.run();
    enqueue('Everyone tiptoes away. '+cap(battle.enemy.def.the)+' pretends not to notice.',()=>endBattle());
  } else {
    sfx.blocked();
    enqueue(cap(battle.enemy.def.the)+' blocks the way out!',()=>enemyTurn());
  }
}

let enemyTurnCount=0;
function enemyTurn() {
  battle.state='busy';
  refreshBattleStatus();
  battle.missing=false;
  const e=battle.enemy,d=e.def,The=cap(d.the);
  if(battle.enemyStunned===2) {
    // Freshly confused: loses this turn and stays dizzy through the party's next round.
    battle.enemyStunned=1;
    sfx.stun();
    enqueue(The+' is too confused to attack.',()=>playerTurn());
    return;
  }
  const pre=[];
  if(battle.enemyStunned===1) {
    pre.push(The+' shakes it off.',()=>{ battle.enemyStunned=0; sfx.grumpTaunt(); },400);
  }
  if(d.regen&&e.hp<e.maxHp&&e.hp>0) {
    pre.push(()=>{ e.hp=Math.min(e.maxHp,e.hp+d.regen); pop('+'+d.regen,56,52,'#9be39a'); sfx.heal(); refreshBattleStatus(); },d.regenMsg,400);
  }
  const skip=d.skittish&&Math.random()<d.skittish?d.skittishMsg:(d.sulk&&Math.random()<d.sulk?d.sulkMsg:null);
  if(skip) {
    sfx.sulk();
    enqueue(...pre,skip,()=>playerTurn());
    return;
  }
  enemyTurnCount++;
  const m=battle.monster;
  const targets=party.map((p,i)=>i).filter(i=>alive(party[i]));
  const oi=pick(targets),orig=party[oi];
  const sp=d.special,special=sp&&enemyTurnCount%(sp.every||3)===0;
  const hitAmount=(t,heavy)=>{
    let dmg=heavy?3+m.tier+e.atk-2+rand(1,3):e.atk-1+m.tier+rand(0,2);
    dmg=Math.max(1,dmg-(battle.enemyAtkDown||0));
    if(t.guard) dmg=Math.max(1,Math.ceil(dmg/2));
    return Math.max(1,dmg-defTotal(t));
  };
  const fill=(txt,who)=>txt.split('{t}').join(who.name);
  if(special&&sp.kind==='all') {
    // Hits everyone standing. Tom cannot step in front of all of them; guarding still halves it.
    const steps=[...pre,()=>{ setMessage(fill(sp.msg,orig)); battle.enemyLunge=.6; battle.enemyTarget=oi; sfx.grumpAttack(); },450];
    let total=0,last=null;
    steps.push(()=>{
      for(const i of targets) { const t=party[i],fx=battle.fx[i]; const dmg=Math.max(1,Math.ceil(hitAmount(t,true)*.6)); t.hp-=dmg; total+=dmg; fx.shake=.35; fx.flash=.2; pop(String(dmg),BATTLE_POS[i].x,BATTLE_POS[i].base-34,'#f3a08c'); if(t.hp<=0) { t.hp=0; last=t; } }
      sfx.hitParty(); sfx.thud(); battle.shakeEnemy=.2; const v=party.find(p=>alive(p)); if(v) say(v.id,'hurt',.12); refreshBattleStatus();
    },600,()=>setMessage(sp.name+' hits everyone. '+total+' damage in all.'),1150);
    steps.push(()=>{ const q=[]; for(const i of targets) { const t=party[i]; if(t.hp<=0) q.push(t.name+' sits down very suddenly.'); else if(t.hp/t.maxHp<=.25) q.push(t.name+' is on one knee.'); } if(!party.some(alive)) q.push('Everything goes a bit puddle-shaped.',()=>lose()); else q.push(()=>playerTurn()); enqueue(...q); });
    enqueue(...steps);
    return;
  }
  if(special&&sp.kind==='drain') {
    const t=orig,fx=battle.fx[oi],loss=Math.min(sp.mp||2,t.mp);
    enqueue(...pre,
      ()=>{ setMessage(fill(sp.msg,orig)); battle.enemyLunge=.6; battle.enemyTarget=oi; sfx.grumpAttack(); },
      500,()=>{ t.mp-=loss; fx.shake=.25; sfx.stun(); pop('-'+loss+' MP',BATTLE_POS[oi].x,BATTLE_POS[oi].base-34,'#9fe8ff'); say(t.id,'hurt',.12); refreshBattleStatus(); },
      500,t.name+' loses '+loss+' MP. '+(loss?'Hard to focus with that noise.':'Nothing left to lose.'),
      ()=>playerTurn());
    return;
  }
  // Tom in his stance steps in front of whichever girl gets attacked.
  const intercept=orig!==hero&&hero.guard&&alive(hero);
  const ti=intercept?0:oi,t=party[ti],fx=battle.fx[ti];
  const dmg=hitAmount(t,special);
  const steps=[...pre,
    ()=>{ setMessage(special?fill(sp.msg,orig):fill(pick(d.attacks),orig)); battle.enemyLunge=.6; battle.enemyTarget=oi; sfx.grumpAttack(); }
  ];
  if(intercept) {
    steps.push(200,()=>{ battle.block={target:oi,t:0,dur:1.9}; sfx.guard(); say('tom','block'); setMessage('Tom steps in front of '+orig.name+'. "No touching, please."'); },700);
  } else steps.push(330);
  steps.push(
    ()=>{ t.hp-=dmg; fx.shake=.35; fx.flash=.2; sfx.hitParty(); if(!intercept) say(t.id,t.hp<=0?'ko':(t.hp/t.maxHp<=.25?'low':'hurt'),.12); const pp=intercept?{x:BATTLE_POS[oi].x-14,y:BATTLE_POS[oi].base-36}:{x:BATTLE_POS[ti].x,y:BATTLE_POS[ti].base-34}; pop(String(dmg),pp.x,pp.y,'#f3a08c'); refreshBattleStatus(); },
    500,
    (intercept?'Tom takes the hit for '+orig.name+'. ':(t.guard?'Guarded. ':''))+dmg+' damage.',
    ()=>checkParty(t)
  );
  enqueue(...steps);
}

function checkEnemy() {
  battle.missing=false;
  const d=battle.enemy.def;
  if(battle.enemy.hp<=0) enqueue(d.wobble,()=>{ startVapor(); sfx.vapor(); sfx.grumpDie(); },1500,()=>{ battle.enemyGone=true; },d.die,()=>win());
  else enqueue(()=>afterAction());
}

function checkParty(t) {
  const steps=[];
  if(t.hp<=0) { t.hp=0; steps.push(t.name+' sits down very suddenly.'); }
  else if(t.hp/t.maxHp<=.25) steps.push(t.name+' is on one knee. That eye looks sore.');
  if(!party.some(alive)) steps.push('Everything goes a bit puddle-shaped.',()=>lose());
  else steps.push(()=>playerTurn());
  enqueue(...steps);
}

function win() {
  const m=battle.monster,d=monsterDef(m);
  const gain=d.xp+m.tier*d.xpStep;
  m.tier++;
  m.maxHp+=d.hpStep;
  m.defeatedUntil=performance.now()+25000;
  sfx.win();
  const purse=(d.coins||5)+(m.tier-1)*(d.coinStep||2);
  coins+=purse;
  const steps=['You win! Everyone gets +'+gain+' XP.',()=>{ const w=pick(party.filter(alive)); say(w.id,'win',undefined,w.id==='tom'&&!party.includes(grace)?'Well! Good job, team!':undefined); },()=>{ sfx.coin(); pop('+'+purse,56,40,'#ffd24a'); },'Found '+purse+' coins. '+pick(regionOf(currentMap)==='la'?['Nickel will be thrilled.','They are a little dusty.','Tom pockets them. Parking is expensive here.']:(party.includes(rose)?['Penny will be thrilled.','They are a little damp.','Rose wants to keep one.','Grace is counting them twice.']:['Penny will be thrilled.','They are a little damp.']))];
  party.forEach((p,i)=>{
    p.xp+=gain;
    p.wins++;
    while(p.xp>=p.next) {
      p.xp-=p.next;
      p.next=Math.round(p.next*1.6);
      p.level++;
      p.maxHp+=4;
      p.hp=p.maxHp;
      p.maxMp+=2;
      p.mp=p.maxMp;
      p.base.Curiosity++;
      p.base.Charm++;
      if(p===hero) { if(p.level>=5) p.title='Local Busybody'; else if(p.level>=3) p.title='Regular'; }
      const lvl=p.level;
      // Each level-up gets its own chime and cheer, one quick beat per member; a new move shares the same message.
      const learned=ATTACKS[p.id].filter(a=>a.lvl===lvl).map(a=>a.name);
      const msg=p.name+' is now level '+lvl+'!'+(learned.length?' Learned '+learned.join(' and ')+'!':' HP and MP full.');
      steps.push(()=>{ sfx.levelChime(); battle.fx[i].cheer=1.8; battle.fx[i].levelUp=true; refreshBattleStatus(); setMessage(msg); },learned.length?1100:750);
    }
  });
  // Nara gets very excited about winning. Sometimes too excited.
  if(party.includes(nara)&&alive(nara)&&Math.random()<.4) steps.push(()=>{ const ni=party.indexOf(nara); battle.fx[ni].cheer=1.6; say('nara','win'); if(typeof RFX!=='undefined') RFX.scene('naraPuddle',3.2,{i:ni}); },pick(['Nara got so excited she peed. A little. Tom pretends not to see.','Nara does a victory wiggle. Then a victory puddle. Good girl. Mostly.','Nara is SO proud of everyone that she peed. Nobody mention it.']),900);
  const dr=d.drop;
  if(dr&&Math.random()<dr.chance) {
    const owned=dr.once&&(bag.includes(dr.id)||party.some(p=>Object.values(p.equipment).includes(dr.id)));
    if(!owned) steps.push(()=>{ bag.push(dr.id); sfx.pickup(); },dr.msg,900);
  }
  steps.push(()=>{ refreshBattleStatus(); },cap(d.the)+' slinks off to think about it.',()=>{ endBattle(); saveGame('auto',true); });
  enqueue(...steps);
}

function lose() {
  for(const p of party) p.hp=1;
  sfx.lose();
  enqueue(cap(battle.enemy.def.the)+' looks smug. You all wake up a moment later.',()=>{
    endBattle();
    showToast(regionOf(currentMap)==='la'?'Ouch. The taco truck downtown fixes everything.':'Ouch. Visit the wish fountain to recover.',3.2);
  });
}

function updateBattle(dt) {
  battle.time+=dt;
  battle.shakeEnemy=Math.max(0,battle.shakeEnemy-dt);
  battle.flashEnemy=Math.max(0,battle.flashEnemy-dt);
  battle.enemyLunge=Math.max(0,battle.enemyLunge-dt);
  battle.slash=Math.max(0,battle.slash-dt);
  for(const f of battle.fx) { for(const k of ['shake','flash','lunge','twirl','tongue','appr','controller','cartwheel','kick','poke','combo','handspring','dismount','pogo','flop','roundoff','rebound','flip','punch','cheer','tickle','run','burpee','coach','hug','grumble','hop','toss','aim','cast','pose']) f[k]=Math.max(0,f[k]-dt); }
  battle.enemyKnock=Math.max(0,(battle.enemyKnock||0)-dt);
  for(const f of battle.fx) if(f.path) { f.path.t+=dt; if(f.path.t>=f.path.dur) f.path=null; }
  RFX.update(dt);
  if(battle.fireball) { battle.fireball.t+=dt; if(battle.fireball.t>battle.fireball.dur) battle.fireball=null; }
  if(battle.tetris) { battle.tetris.t+=dt; if(battle.tetris.t>battle.tetris.dur) battle.tetris=null; }
  for(const x of battle.texts) x.t+=dt; battle.texts=battle.texts.filter(x=>x.t<x.dur);
  if(battle.laser) { battle.laser.t+=dt; if(battle.laser.t>battle.laser.dur) battle.laser=null; }
  if(battle.boop) { battle.boop.t+=dt; if(battle.boop.t>battle.boop.dur) battle.boop=null; }
  if(battle.hose) { battle.hose.t+=dt; if(battle.hose.t>battle.hose.dur) battle.hose=null; }
  if(battle.lift) { battle.lift.t+=dt; if(battle.lift.t>battle.lift.dur) battle.lift=null; }
  if(battle.props) { for(const q of battle.props) q.t+=dt; battle.props=battle.props.filter(q=>q.t<q.dur); }
  if(battle.vapor>0) {
    battle.vapor=Math.max(0,battle.vapor-dt);
    for(const p of battle.vaporParts) {
      if(p.delay>0) { p.delay-=dt; continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy-=18*dt;
    }
  }
  if(battle.block) { battle.block.t+=dt; if(battle.block.t>=battle.block.dur) battle.block=null; }
  for(const p of battle.pops) p.t+=dt;
  battle.pops=battle.pops.filter(p=>p.t<1);
}

// Thrown and dropped things for the recruits' moves. Drawn centered at the origin.
function drawProp(q,u) {
  const k=q.kind,R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
  if(PROP2[k]) { PROP2[k](q,u); return; }
  if(k==='cookie') { E(0,0,13,12,OUT); E(0,0,11,10,'#c98a4b'); R(-5,-4,3,3,'#4a2e1c'); R(3,-2,3,3,'#4a2e1c'); R(-2,4,3,3,'#4a2e1c'); }
  else if(k==='pie') { E(0,2,24,11,OUT); E(0,2,22,9,'#c98a4b'); E(0,-2,19,8,'#e8d5a0'); E(-4,-5,8,4,'#fff1cb'); for(let i=-2;i<=2;i++) R(i*7-1,-6,2,8,'#a86a38'); }
  else if(k==='cream') { const f=u>.7?(1-u)/.3:1; gfx.globalAlpha=f; const c=q.glaze?'#9fd0ea':(q.pink?'#ffd3e0':'#fff6e6'); E(0,0,34,22,c); E(-14,10,12,8,c); E(16,12,11,7,c); E(4,22,8,6,c); gfx.globalAlpha=1; }
  else if(k==='tomato') { E(0,0,11,10,OUT); E(0,0,9,8,'#e04a3a'); E(-3,-2,3,2,'#ff8a7a'); R(-1,-10,3,4,'#4f8a3a'); R(-5,-9,11,2,'#4f8a3a'); }
  else if(k==='pepper') { gfx.save(); gfx.rotate(.5); E(0,0,8,20,OUT); E(0,0,6,18,'#e0402e'); E(-2,-4,2,8,'#ff8a70'); R(-2,-24,4,7,'#4f8a3a'); gfx.restore(); }
  else if(k==='steam') { const f=1-u; gfx.globalAlpha=f*.8; for(let i=0;i<4;i++) label('~',-30+i*20,-20-Math.round(u*60)-(i%2)*10,'#ff8a70',3); gfx.globalAlpha=1; }
  else if(k==='stamp') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=Math.min(1,f+.2); gfx.save(); gfx.rotate(-.25); label('F',1,1,'#5a1a12',8); label('F',0,0,'#e0402e',8); gfx.restore(); gfx.globalAlpha=1; }
  else if(k==='paper') { gfx.save(); gfx.rotate(u*2-1); R(-12,-15,24,30,OUT); R(-11,-14,22,28,'#fff8e8'); for(let i=0;i<5;i++) R(-8,-10+i*5,16-(i%2)*6,2,'#9aa0b5'); label('?',0,0,'#e0402e',2); gfx.restore(); }
  else if(k==='tape') { const f=u<.5?1:Math.max(0,1-(u-.5)/.3); gfx.globalAlpha=f; R(-70,-40,140,8,'#fff1cb'); label('FINISH',0,-37,'#e0402e',1); if(u>=.5) { const g=(u-.5)/.5; R(-70-g*20,-40-g*30,50,8,'#fff1cb'); R(20+g*20,-40-g*30,50,8,'#fff1cb'); } gfx.globalAlpha=1; }
  else if(k==='moon') { E(0,0,30,30,OUT); E(0,0,28,28,'#ffe8a8'); E(-8,-6,6,6,'#e6cd88'); E(9,8,5,5,'#e6cd88'); E(6,-12,3,3,'#e6cd88'); }
  else if(k==='recliner') { R(-32,-30,64,60,OUT); R(-30,-28,60,56,'#7a4a2e'); R(-30,-28,60,14,'#9a6540'); R(-26,-12,52,26,'#8b5a38'); R(-30,14,60,14,'#5e361f'); R(-22,-6,44,10,'#a46d44'); if(u>.6) label('ZZZ',0,-40,'#fff1cb',2); }
  else if(k==='fish') { gfx.save(); gfx.scale(-1,1); E(0,0,70,30,OUT); E(0,0,68,28,'#7fa4b8'); E(10,-6,40,14,'#a8c8d8'); E(-40,-10,6,6,OUT); E(-40,-10,4,4,'#fff'); R(-44,-11,2,2,OUT); gfx.beginPath(); gfx.moveTo(64,0); gfx.lineTo(96,-30); gfx.lineTo(96,30); gfx.closePath(); gfx.fillStyle='#6a8ea2'; gfx.fill(); gfx.restore(); }
  else if(k==='wrench') { gfx.save(); gfx.rotate(-.6); R(-5,-22,10,44,OUT); R(-3,-20,6,40,'#aeb3ba'); R(-10,-26,20,12,OUT); R(-8,-24,16,8,'#aeb3ba'); R(-3,-24,6,5,'#1c3a32'); R(-10,16,20,12,OUT); R(-8,18,16,8,'#aeb3ba'); R(-3,20,6,5,'#1c3a32'); gfx.restore(); }
  else if(k==='wheel') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f; E(0,0,52,10,OUT); E(0,0,50,8,'#8a8f96'); E(0,-2,40,5,'#aeb3ba'); for(let i=0;i<4;i++) { const a=u*14+i*1.57; R(Math.round(Math.cos(a)*34)-2,-2-Math.round(Math.sin(a)*5),4,4,'#5e6670'); } gfx.globalAlpha=1; }
  else if(k==='duct') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f*Math.min(1,u/.15); gfx.save(); gfx.rotate(q.tilt||0); R(-46,-7,92,14,OUT); R(-44,-5,88,10,'#b8bcc2'); for(let i=0;i<6;i++) R(-40+i*15,-3,6,6,'#9a9ea4'); gfx.restore(); gfx.globalAlpha=1; }
  else if(k==='bowl') { E(0,-6,42,10,OUT); E(0,-6,40,8,'#8aa6a8'); E(0,-6,32,5,'#4e6f78'); gfx.beginPath(); gfx.moveTo(-40,-6); gfx.quadraticCurveTo(-36,30,0,34); gfx.quadraticCurveTo(36,30,40,-6); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); gfx.beginPath(); gfx.moveTo(-38,-6); gfx.quadraticCurveTo(-34,28,0,32); gfx.quadraticCurveTo(34,28,38,-6); gfx.closePath(); gfx.fillStyle='#7fa4b8'; gfx.fill(); R(-20,8,16,4,'#a8c8d8'); if(u>.7) label('CLONK',0,-30,'#fff1cb',2); }
  else if(k==='shelf') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f; const yy=-Math.round(u*20); R(-50,yy,100,6,OUT); R(-48,yy+1,96,4,'#7a4a2e'); for(let i=0;i<3;i++) { const x=-36+i*30; R(x-9,yy-20,18,20,OUT); R(x-7,yy-18,14,16,['#7fa4b8','#d86f48','#8aa6a8'][i]); R(x-4,yy-16,8,3,'#fff8e8'); } gfx.globalAlpha=1; }
  else if(k==='line') {
    // Fishing line from Boppy's rod tip to the Grump, with a hook on the end.
    const reach=u<.3?u/.3:1,f=u>.85?(1-u)/.15:1;
    const dx=(q.x1-q.x0),dy=(q.y1-q.y0);
    gfx.globalAlpha=f; gfx.strokeStyle='#fff6e0'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(0,0); gfx.quadraticCurveTo(dx*.5*reach,(dy*.5-60)*reach,dx*reach,dy*reach); gfx.stroke();
    R(-3,-34,4,36,'#5e361f'); E(dx*reach,dy*reach,5,5,'#dde'); gfx.globalAlpha=1;
  }
}

function drawMonsterShape(cx,base,t,hurt=false) {
  const bob=Math.round(Math.sin(t*3));
  const body=hurt?'#f6e6c8':'#6aa08a',shade=hurt?'#e4d2b0':'#4d8270',hi=hurt?'#ffffff':'#9dd0b8';
  ellipse(cx,base,8,2,'#2f493640');
  rect(cx-7,base-8+bob,14,8,body);
  rect(cx-6,base-10+bob,12,2,body);
  rect(cx-4,base-11+bob,8,1,body);
  rect(cx-5,base-9+bob,4,2,hi);
  rect(cx-7,base-2+bob,14,2,shade);
  rect(cx-4,base-7+bob,3,3,'#fff6dc');
  rect(cx+1,base-7+bob,3,3,'#fff6dc');
  rect(cx-3,base-6+bob,1,1,'#2b3b35');
  rect(cx+2,base-6+bob,1,1,'#2b3b35');
  rect(cx-5,base-8+bob,3,1,'#2b3b35');
  rect(cx+2,base-8+bob,3,1,'#2b3b35');
  rect(cx-2,base-3+bob,4,1,'#2b3b35');
  rect(cx-3,base-2+bob,1,1,'#2b3b35');
  rect(cx+2,base-2+bob,1,1,'#2b3b35');
  rect(cx-2,base-13+bob,1,2,'#5f8f4c');
  rect(cx+1,base-14+bob,1,3,'#6f9d55');
  rect(cx-5,base-12+bob,1,2,'#5f8f4c');
  rect(cx-7,base+1,1,1,'#83b4b2');
  rect(cx+6,base+1,1,1,'#83b4b2');
}


