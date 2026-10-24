'use strict';
// engine/battle2-moves.js — Plays every move's animation in the battle (F4).
// The attack animations are the existing scripts in RECRUIT_MOVES (tom-moves.js, grace-moves.js, rose-moves.js,
// recruit-moves.js, deedee-moves.js, tnb-moves.js, nara.js). Each is called with E2 = {i, m, fx, dmg, crit, result,
// apply, targets} and queues its own steps. The adapter below turns what those scripts call into the new battle:
//   landHit(d)    applies d/100 of the move's planned damage to its targets (engine/battle2.js b2LandFrac)
//   checkEnemy()  ends the move: the rest of the damage, then the move's effects (b2FinishMove)
//   E2.apply()    applies the effects now (heals, buffs) for animations that want them to land on a beat
// While a move plays, the scene layer is warped toward the real targets (b2AimAt in engine/battle2-ui.js).
// This file also holds the signature specials that used to live in the old battle (DANCE, SILLY, PEP TALK,
// GRUMBLE), Rose's Boop, and support animations for path skills that help allies.

// ---------- Adapter: what the old scripts call ----------
function landHit(dmg) { if(battle.v2) b2LandFrac((dmg||0)/100); }
function checkEnemy() { if(battle.v2) b2FinishMove(); }
function refreshBattleStatus() { if(battle.v2) b2Render(); }

function b2Animate(u,act,opt) {
  const M=B2.move,fx=battle.fx[u.idx];
  const E2={i:u.idx,m:u,fx,dmg:100,crit:M.waves.flat().some(e=>e.crit),result:M.result,targets:M.targets,act,apply:()=>b2ApplyFx()};
  const fn=act.support?B2_SUPPORT[act.key]||b2SupportGeneric:(RECRUIT_MOVES[u.id]&&RECRUIT_MOVES[u.id][act.key]);
  try { if(fn) fn(E2); else b2PlainMove(E2); }
  catch(err) { console.error('move '+u.id+'.'+act.key,err); clearBattleQueue(); b2PlainMove(E2); }
}
// A plain fallback: lunge or toss, then hit.
function b2PlainMove(E2) {
  const {m,fx,act}=E2,M=B2.move,physical=act.stat==='pow'||act.stat==='hybrid';
  enqueue(()=>{ setMessage(m.name+': '+act.name+'!'); if(LINES[m.id]&&LINES[m.id][act.key]) say(m.id,act.key); if(physical) { fx.lunge=.6; sfx.slash(); } else { fx.hop=.35; for(const t of M.targets.filter(t=>t.side==='foe')) b2Proj(m,t,(act.elem||['kinetic'])[0]); } },
    420,()=>{ landHit(100); for(const t of M.targets.filter(t=>t.side==='foe')) b2Burst(t,(act.elem||['kinetic'])[0]); },600,E2.result||act.name+'!',()=>checkEnemy());
}

(function(){
const SC=RFX.SC,{scene}=RFX;
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
// Where a unit stands on the canvas. Kind moves can be aimed at a monster (Kindness), so foes work too.
const home=u=>{ if(u.side==='foe') { const p=b2FoeCanvasPos(u); return {x:p.x,base:p.y,h:p.h}; } const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const glowOn=(u,c)=>{ const h=home(u); scene('glow',.9,{x:h.x,y:h.base-h.h*.45,rx:38,ry:52,c,a:.35}); };
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const RM=RECRUIT_MOVES;

// ---------- Signature specials (D-pad Down) ----------
// Grace: DANCE. A twirl, then the whole party heals.
RM.grace.dance=E2=>{ const {m,fx}=E2;
  if(E2.act&&E2.act.o3&&RM.grace.danceShow) return RM.grace.danceShow(E2);   // Option 3 Primary animation (grace-moves.js)
  fx.twirl=1.4; sfx.dance(); say(m.id,'dance');
  enqueue(()=>{ setMessage(m.name+' counts it off. "Five, six, seven, eight!"'); scene('confetti',1.6,{x0:340,x1:560,n:26}); },
    900,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p,'#ffe27a'); bt('DANCE BREAK',96,24,'#ffe08a',3,1.2); },
    'Everyone standing feels better.',()=>checkEnemy());
};
// Rose: SILLY. Raspberry, boings, and the enemy is Goofed (bosses drop what they are holding).
RM.rose.silly=E2=>{ const {m,fx}=E2,t=E2.targets[0];
  if(E2.act&&E2.act.o3&&RM.rose.sillyShow) return RM.rose.sillyShow(E2);   // Option 3 Primary animation (rose-moves.js)
  fx.tongue=2.2; sfx.raspberry(); sfx.slideWhistle();
  b7Later(()=>sfx.boing(),500); b7Later(()=>sfx.boing(),1000); b7Later(()=>sfx.raspberry(),1300);
  say(m.id,'silly',.6);
  enqueue(m.name+' sticks out her tongue. Pbbbt!',
    300,()=>{ E2.apply(); },
    1100,()=>setMessage(t&&t.st.goofed?cap(t.def.the)+' is thrown off completely. Goofed!':(t?cap(t.def.the)+' is unmoved. Mostly.':'Pbbbt.')),
    1100,()=>checkEnemy());
};
// Amy: PEP TALK. Everyone else is Pumped Up.
RM.amy.pep=E2=>{ const {m,fx}=E2;
  fx.coach=1.7; sfx.dance(); say(m.id,'pep');
  enqueue(()=>{ setMessage(m.name+' claps twice. "Thirty seconds! Give me everything!"'); },
    900,()=>{ E2.apply(); sfx.levelUp(); },
    'The team is fired up. Next attack or heal +50%.',()=>checkEnemy());
};
// Boppy: GRUMBLE. Sits down and complains; a row of enemies feels terrible and goes after him.
RM.boppy.grumble=E2=>{ const {m,fx}=E2;
  fx.grumble=1.9; sfx.sulk(); say(m.id,'grumble');
  enqueue(()=>{ setMessage(m.name+' sits down. "I am not feeling good. It is the stomach. And everybody walks too FAST."'); },
    1200,()=>{ E2.apply(); sfx.stun(); bt('...',52,34,'#fff1cb',3,1); },
    'They feel awful about it. They hit softer, and they glare at Boppy.',()=>checkEnemy());
};
// Rose's basic: Boop. (The old battle did this one inline.)
RM.rose.boop=E2=>{ const {m,fx}=E2;
  enqueue(()=>{ setMessage('Rose walks right up to it.'); fx.appr=1.6; fx.apprDur=1.6; say('rose','boop',.45); },
    520,()=>{ fx.poke=.7; battle.boop={t:0,dur:1.1}; sfx.boop?sfx.boop():sfx.bonk(); },180,()=>landHit(100),750,'Boop. '+E2.result,()=>checkEnemy());
};

// ---------- Support animations for path skills that help allies ----------
// A recipe: the actor's pose, a word, a glow on everyone it helps, the numbers (E2.apply), a line.
function support(E2,o) {
  const {m,fx,act}=E2,who=()=>(E2.targets.length?E2.targets:[m]).filter(alive);
  enqueue(()=>{ setMessage(o.say||(m.name+': '+act.name+'!')); if(LINES[m.id]&&LINES[m.id][act.key]) say(m.id,act.key,.15); if(o.pose) o.pose(fx); if(o.start) o.start(E2); },
    o.wait||800,()=>{ if(o.land) o.land(E2); for(const p of who()) glowOn(p,o.color||'#9be39a'); if(o.word) bt(o.word,96,24,o.color||'#9be39a',o.sc||3,1.2); E2.apply(); },
    o.line||'Done.',()=>checkEnemy());
}
const B2_SUPPORT={};
window.B2_SUPPORT=B2_SUPPORT;
window.b2SupportGeneric=E2=>support(E2,{pose:fx=>{ fx.cheer=1.2; },word:E2.act.name.toUpperCase(),line:E2.act.desc});
// Tom: Unboxing. The box drops in the middle, a gadget rises out, and it powers up the whole party.
B2_SUPPORT.unbox=E2=>{ const {m,fx}=E2;
  enqueue(()=>{ setMessage('A package arrives. Tom did not need it. Tom needed it.'); say('tom','unbox'); scene('box',3.6,{}); sfx.slideWhistle(); },
    600,()=>{ sfx.thud(); },700,()=>{ fx.punch=1.2; sfx.whoosh(); },900,()=>{ sfx.charge(); },
    700,()=>{ sfx.ding(); scene('flash',.3,{a:.4}); E2.apply(); for(const p of b2LiveParty()) glowOn(p,'#9fe8ff'); bt('ONE MORE THING',96,24,'#9fe8ff',3,1.2); },
    'New gadget for everyone. It was on sale. It was not on sale.',()=>checkEnemy());
};
// Grace: Squishy Squeeze. Tosses the gold dumpling squishy to an ally.
B2_SUPPORT.squishy=E2=>support(E2,{color:'#ffe08a',word:'SQUEEZE',pose:fx=>{ fx.cheer=1; },
  start:E2=>{ const h=home(E2.m),t=home(E2.targets[0]||E2.m); toss('squishy',h.x-10,h.base-h.h*.6,t.x,t.base-t.h*.6,.2,.5,60); sfx.whoosh(); },
  line:'Squish, squish. Feeling better already.'});
// Grace: Glitter Nails. Sparkly nails for everyone.
B2_SUPPORT.polish=E2=>support(E2,{color:'#ffe27a',word:'GLITTER',pose:fx=>{ fx.twirl=1.1; },
  start:()=>{ scene('confetti',1.4,{x0:330,x1:560,n:22}); sfx.ding(); }, line:'Glitter coat on everyone. Do NOT smudge it.'});
// Grace: Like and Subscribe. Ring light and confetti; the party heals.
B2_SUPPORT.subscribe=E2=>support(E2,{color:'#ff9ac0',word:'SUBSCRIBED',pose:fx=>{ fx.cheer=1.4; },
  start:E2=>{ const h=home(E2.m); scene('ring',.8,{x:h.x,y:h.base-h.h*.5,r:120,c:'#fff6dc',sq:1}); toss('subbtn',h.x,h.base-h.h,h.x-60,h.base-h.h-60,0,.8,40,{spin:false}); },
  land:()=>scene('confetti',1.4,{x0:330,x1:560,n:30}), line:'Hey guys! Everyone is healed. Smash that like button.'});
// Rose: Dress-Up Day. A tiara and a tutu; she gets slippery and the slowest friend hurries up.
B2_SUPPORT.dressup=E2=>support(E2,{color:'#ff9ac0',word:'DRESS-UP DAY',pose:fx=>{ fx.twirl=1.4; },
  start:E2=>{ const h=home(E2.m); toss('tiara',h.x+40,h.base-h.h-80,h.x,h.base-h.h-6,0,.5,30,{spin:false}); sfx.whoosh(); },
  land:()=>scene('confetti',1.2,{x0:380,x1:540,n:18}), line:'Nobody can catch a princess. Rose dodges half of everything.'});
// Amy: Personal Best. Coach mode; everyone gets VP and hits harder.
B2_SUPPORT.pb=E2=>support(E2,{color:'#ffe08a',word:'PERSONAL BEST',sc:2,pose:fx=>{ fx.coach=1.8; }, start:()=>sfx.dance(),
  line:'Everyone gets +3 VP and a clear head, and hits 30% harder.'});
// Amy: Marathon. Sets the pace; the party speeds up.
B2_SUPPORT.marathon=E2=>support(E2,{color:'#9be39a',word:'PACE',pose:fx=>{ fx.coach=1.4; },
  start:E2=>{ scene('stopwatch',1.6,{x:home(E2.m).x-60,y:120}); }, line:'Left, right, breathe. Everyone speeds up.'});
// Deedee: Registered Nut. A nurse's check-up.
B2_SUPPORT.nurse=E2=>support(E2,{color:'#9be39a',word:'CHECK-UP',pose:fx=>{ fx.hug=1.2; },
  start:E2=>{ const h=home(E2.m),t=home(E2.targets[0]||E2.m); toss('dheart',h.x-10,h.base-90,t.x,t.base-70,0,.5,50,{spin:false,r:9}); },
  line:'Deep breath. Say ahh. All better.'});
// Deedee: Rhubarb Crisp. A steaming slice for one.
B2_SUPPORT.crisp=E2=>support(E2,{color:'#ff9a4a',word:'RHUBARB CRISP',sc:2,pose:fx=>{ fx.cheer=1; },
  start:E2=>{ const h=home(E2.m),t=home(E2.targets[0]||E2.m); toss('dcrisp',h.x-10,h.base-80,t.x,t.base-70,.1,.55,50,{spin:false}); sfx.whoosh(); },
  line:'Still warm. Seconds are available.'});
// Deedee: Sunday Dinner. Everyone gets a plate.
B2_SUPPORT.dinner=E2=>support(E2,{color:'#ff9a4a',word:'SUNDAY DINNER',sc:2,pose:fx=>{ fx.hug=1.6; },
  start:E2=>{ const h=home(E2.m); for(const p of b2LiveParty()) { const t=home(p); toss('ddish',h.x-10,h.base-80,t.x,t.base-70,p.idx*.08,.5,50,{spin:false,dish:['meatballs','lasagna','bread','chicken'][p.idx%4]}); } sfx.ding(); },
  line:'Everybody eats. Nobody leaves hungry.'});
// Deedee: Wine O'Clock. One glass, now and then.
B2_SUPPORT.wine=E2=>support(E2,{color:'#ff9ac0',word:'WINE O’CLOCK',sc:2,pose:fx=>{ fx.cheer=1; },
  line:'Just the one. Her WARMTH doubles.'});
// TNB: Quick Change. The rack rolls out and an outfit flies to an ally.
B2_SUPPORT.quickchange=E2=>support(E2,{color:'#c9b3e6',word:'QUICK CHANGE',sc:2,pose:fx=>{ pose(fx,'hip',1.4); },wait:1000,
  start:E2=>{ scene('rack',2.6,{back:true,x:470}); const t=home(E2.targets[0]||E2.m),C=b2NextCostume(); toss('shirt',400,200,t.x,t.base-t.h*.6,.6,.5,70,{c:C.c,c2:C.c2}); E2.costume=C; },
  line:'New outfit, new attitude. Straight off the rack.'});
// Boppy: Track Star Story. He sits down and tells it again. Everyone gets sleepy. He gets fired up.
B2_SUPPORT.trackstar=E2=>{ const {m,fx}=E2;
  fx.grumble=2.6; say(m.id,'trackstar',.2);
  enqueue(()=>{ setMessage('Boppy sits down. "Did I ever tell you I was a champion cross country runner? 1970. Sit down."'); bt('1970',96,24,'#ffe08a',4,1.6); },
    1500,()=>{ for(const f of b2LiveFoes()) b2Fx({kind:'zzz',x:f.px+20,y:f.py-b2FoeCanvasPos(f).h,t:0,dur:2}); sfx.sulk(); },
    900,()=>{ E2.apply(); glowOn(m,'#9be39a'); },
    'The enemies are getting drowsy. Boppy is just getting started.',()=>checkEnemy());
};
})();
