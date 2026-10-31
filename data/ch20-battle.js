'use strict';
// data/ch20-battle.js — Chapter 20 battles (the finale). Loaded after data/ch19-battle.js; wraps a few engine/battle2.js functions. Two fights, one after the other.
//
// FIGHT 1, the Chronos-Leviathan (boss 'leviathan'): a serpent of stopped clocks guarding the Forever Engine. Four Resentment Barriers hold its HP up in turn:
//   DISTANCE, AGING, EXHAUSTION, FEAR (CH20_BARS). When its HP falls to a barrier's floor it will not go lower: the barrier LOCKS (a coloured ring, f.barUp), every hit
//   after that does nothing, and ▼ Bag shows the FAMILY RELAY for that one barrier. A relay costs the actor's turn (no VP, no HEART), pulls the members it needs in off the
//   bench for a moment (it is staged, so nobody has to be out front), shatters the barrier and heals the party a little. After the fourth, the Leviathan can finally fall.
//   Every third turn it calls TIME WARP on everyone (it shows on the turn ribbon first). Tombos and Family Finishes (the Extra Place, ff4) work normally.
//   The party is Tom, Grace, Rose and one more out front; the other four are on the bench (▼ Bag, BENCH CALL, swaps the fourth member).
// FIGHT 2, Julian Vance (boss 'julian'): the Leviathan shatters and he is in a glass living room, grieving. His Eternal Silence turns ATTACK to stone: every hit does
//   nothing. This is the Warden Boppy shape (data/ch14-battle.js): care is the only way in. Seven signature acts each warm him ONCE (CH20_ACTS): Grace DANCE, Rose RASPBERRY,
//   Amy PEP TALK, Deedee MOON & BACK, Boppy GRUMBLE, TNB WARDROBE, Nara PUPPY DOG EYES. Only four of the family can be out front, so BENCH CALL is almost free here (they act again
//   at once). When all seven have, on his next turn Tom steps forward and DEFENDs Julian himself, and the fight ends kind (b2JulianTom).
const CH20_BARS=[
  {key:'distance',name:'DISTANCE',floor:.76,lines:['A DISTANCE BARRIER locks round the Leviathan, three thousand miles of it, coast to coast.'],
    relay:{name:'FIRST-CLASS EXPRESS',who:['Tom','TNB'],steps:[
      'RELAY! Tom: “TNB. The long way round. Now.” The DISTANCE BARRIER hums like a runway.',
      'TNB rolls in off the bench on his longboard with a glowing kiln-pot over one shoulder. “I made it to fit exactly this.” He kicks it off the deck.',
      'Tom snaps open a business-class tray table and returns the pot like a serve. It crosses the whole room in one long line of fire.',
      'The pot goes through the DISTANCE BARRIER as if it were not there. Three thousand miles, and it lands exactly on the mark. TNB: “Structurally sound.”']}},
  {key:'aging',name:'AGING',floor:.52,lines:['An AGING BARRIER locks round the Leviathan. Every second, one more year.'],
    relay:{name:'FIFTY-ONE YEARS & COUNTING',who:['Deedee','Boppy','Tom'],steps:[
      'RELAY! Boppy plants his recliner in the middle of the floor and sits in it. “Nobody ages on my shift.” The AGING BARRIER ticks, a year at a time.',
      'Deedee slides a pepper-rhubarb pie out of her apron. It is steaming. It is, somehow, exactly the pie it was in 1974.',
      'Boppy holds the recliner up like a shield. Tom steps in beside him. Deedee holds the pie to the barrier. “Fifty-one years, and still hot.”',
      'The AGING BARRIER melts like butter. Boppy: “Fifty-one years and counting. Don’t tell your mother I said it was good.” Deedee: “I heard that.”']}},
  {key:'exhaustion',name:'EXHAUSTION',floor:.28,lines:['An EXHAUSTION BARRIER locks round the Leviathan and settles over the whole family like a wet blanket.'],
    relay:{name:'MOM’S LITTLE TORNADOES',who:['Amy','Grace','Rose'],steps:[
      'RELAY! The EXHAUSTION BARRIER lands on everyone like a heavy coat. Amy: “No. Get up. All of you. Elbows down.”',
      'Amy calls a PEP TALK so loud the glass rings. Grace takes it and goes up into a full aerial, with Rose riding on top, blowing raspberries.',
      'They come round like a tornado: two girls, one mother holding the whole thing together by the ankles.',
      'The EXHAUSTION BARRIER bursts into a thousand tired little pieces. Rose: “Again! Again!” Amy: “One more. Then dinner.”']}},
  {key:'fear',name:'FEAR',floor:.08,lines:['A FEAR BARRIER locks round the Leviathan. It shows each of them their worst minute.'],
    relay:{name:'UNCONDITIONAL PACK',who:['Tom','Nara'],steps:[
      'RELAY! The FEAR BARRIER shows everybody the worst minute they ever had. Nara growls. Nara has never once been afraid of the dark.',
      'Tom pulls a golden sourdough boule out of his coat and throws it the whole length of the room. “Nara. Fetch.”',
      'Nara comes in off the bench at the speed of sound. She meets the boule in mid-air and the barrier a half-second later.',
      'The FEAR BARRIER breaks. Nara trots back with the bread, extremely proud. Tom: “Good dog. Best dog. Do not eat it.”']}}];
Object.assign(B2_FOES,{
  leviathan:{level:28,hp:6200,pow:44,grit:28,warmth:32,cool:24,pep:18,weak:['sparkle','cozy'],resist:[],step:4,boss:'leviathan',noRun:true,
    acts:[{name:'Tail Sweep',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} sweeps its brass tail at {t}.'},
          {name:'Gear Bite',stat:'pow',mult:1.05,elem:'kinetic',target:'one',status:['gritdown',2],msg:'{e} snaps its gear teeth at {t}. {t} feels squashed.'},
          {name:'Wind Up',stat:'warmth',mult:.9,elem:'chatter',target:'one',status:['slow',2],msg:'{e} winds {t} up very tightly. {t} slows right down.'}],
    flop:{name:'Time Warp',stat:'warmth',mult:.95,elem:'chatter',target:'all',status:['slow',1],msg:'TIME WARP! {e} folds the afternoon in half, and everybody is in the fold!'}},
  julian:{level:28,hp:99999,pow:30,grit:999,warmth:30,cool:999,pep:15,weak:[],resist:[],step:4,boss:'julian',noRun:true,
    acts:[{name:'Reread the Calendar',stat:'warmth',mult:.55,elem:'chatter',target:'one',msg:'{e} rereads his old calendar out loud. {t} flinches.'},
          {name:'Amber Glass',stat:'pow',mult:.5,elem:'kinetic',target:'one',msg:'The amber glass leans in on {t}.'},
          {name:'Look Away',stat:'warmth',mult:.5,elem:'chatter',target:'one',status:['cooldown',1],msg:'{e} looks away from {t}. It is worse than a hit.'}],
    flop:{name:'One More Flight',stat:'warmth',mult:.55,elem:'chatter',target:'all',msg:'ONE MORE FLIGHT! {e} says it quietly, and it lands on everyone.'}}
});
Object.assign(B2_FORMATIONS,{leviathan:[['leviathan','front']],julian:[['julian','front']]});
Object.assign(B2_GRUMP,{
  leviathan:{goal:999999,grumpy:'It is only holding the minute. It has been holding it for twenty years and it does not know how to put it down.',likes:[]},
  julian:{goal:800,grumpy:'He missed a birthday, a hospital room and a goodbye, and he thought the answer was to stop all the clocks. Nobody has ever sat down next to him.',
    likes:['grace.dance','rose.silly','amy.pep','deedee.hug','boppy.grumble','tnb.wardrobe','nara.puppy','tom.starter']}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{leviathan:400,julian:300});

// ---------- Fight 1: barriers ----------
const CH20_BAR_KEYS=CH20_BARS.map(b=>b.key);
// Keep the Leviathan's HP at the floor of its current barrier; when it gets there, the barrier locks.
function ch20Floor(t) {
  const k=t.barrier||0; if(k>=CH20_BARS.length) return;
  const B=CH20_BARS[k],floor=Math.round(t.maxHp*B.floor);
  if(t.hp>floor) return;
  t.hp=floor;
  if(!t.barUp) {
    t.barUp=true; t.barKey=B.key; t.intent=t.intent;
    battle.texts.push({txt:B.name+' BARRIER',x:b2FoePoint(t).x,y:b2FoePoint(t).y-28,color:'#ffe08a',sc:1,t:0,dur:1.4}); sfx.charge&&sfx.charge();
    b7Later(()=>{ if(B2.active) b2Msg(B.lines[0]+' Hits do nothing now. ▼ Bag, FAMILY RELAY: '+B.relay.name+'.'); },300);
  }
}
const LE_b2ApplyEntry_ch20=b2ApplyEntry;
b2ApplyEntry=function(e,amt) {
  const t=e&&e.t,r=LE_b2ApplyEntry_ch20(e,amt);
  if(t&&t.boss==='leviathan'&&!t.dead) ch20Floor(t);
  if(t&&t.boss==='julian') {
    t.hp=t.maxHp; t.calm=t.calm||false;
    if(e.first&&!e.miss&&e.dmg>0) { const p=b2FoePoint(t); battle.texts.push({txt:'STONE',x:p.x,y:p.y-20,color:'#cfd8d6',sc:1,t:0,dur:1}); if(!B2.stoneNote) { B2.stoneNote=true;
      b7Later(()=>{ if(B2.active) b2Msg('Eternal Silence. The attack turns to stone and falls on the glass floor. He does not need you to fight him. He needs somebody to sit down.'); },250); } }
  }
  return r;
};
// A killing blow that would pass a barrier is caught at the floor.
const LE_b2FoeDown_ch20=b2FoeDown;
b2FoeDown=function(t) {
  if(t&&t.boss==='leviathan'&&(t.barrier||0)<CH20_BARS.length) { t.hp=Math.max(1,t.hp); ch20Floor(t); return; }
  return LE_b2FoeDown_ch20(t);
};
const LE_b2BossOpen_ch20=b2BossOpen;
b2BossOpen=function(e) {
  if(e.boss==='leviathan') {
    e.count=0; e.barrier=0; e.barUp=false; B2.benchFree=false;
    return [()=>{ b2Msg('The chest clock says 4:59. Nothing else in the Moon is allowed to. The Chronos-Leviathan uncoils round the Forever Engine.'); e.shake=.8; sfx.thud&&sfx.thud(); },2600,
      ()=>b2Msg('Four Resentment Barriers will hold it up in turn: DISTANCE, AGING, EXHAUSTION and FEAR. Hit it until one locks, then use ▼ Bag, FAMILY RELAY.'),2800,
      ()=>b2Msg('Every third turn it calls TIME WARP on everyone. It shows on the turn ribbon first. The rest of the family waits on the bench (▼ Bag, BENCH CALL).'),2400];
  }
  if(e.boss==='julian') {
    e.count=0; e.acts7=[]; e.tomDone=false; e.tomDue=false; B2.benchFree=true; B2.stoneNote=false;
    return [()=>{ b2Msg('The Leviathan is gone. Inside it, in a glass replica of a living room, is a man in a long coat, sitting very small in an armchair.'); e.shake=.4; sfx.thud&&sfx.thud(); },2800,
      ()=>b2Msg('Julian: “Eternal Silence. Please. Please just let it be quiet.” Every ATTACK you have turns to grey stone.'),2800,
      ()=>b2Msg('Nobody can hurt him, and nobody needs to. Care for him: DANCE, SILLY, PEP TALK, MOON & BACK, GRUMBLE, WARDROBE, PUPPY DOG EYES. BENCH CALL is almost free now.'),3000];
  }
  return LE_b2BossOpen_ch20(e);
};
const LE_b2BossTurn_ch20=b2BossTurn;
b2BossTurn=function(e) {
  if(e.boss==='leviathan') return b2LeviTurn(e);
  if(e.boss==='julian') return b2JulianTurn(e);
  return LE_b2BossTurn_ch20(e);
};
function b2LeviTurn(e) {
  e.count=(e.count||0)+1;
  if(e.intent) { const I=e.intent; e.intent=null; return b2FoeAct(e,I.act,null,()=>[]); }
  return b2FoeAct(e,pick(e.acts),null,()=>{
    if(e.count%3===2) { b2SetAll(e,e.D.flop,false); return [()=>{ b2Msg('Every clock in the room leans in. TIME WARP next turn hits everyone. Heal up after!'); e.shake=.4; b2Render(); },1500]; }
    return [];
  });
}

// ---------- The Family Relays: ▼ Bag, FAMILY RELAY (only while a barrier is locked) ----------
const ch20Barrier=()=>B2.foes.find(f=>f.boss==='leviathan'&&f.barUp&&b2Alive(f))||null;
const LE_b2BagList_ch20=b2BagList;
b2BagList=function(u) {
  const rows=LE_b2BagList_ch20(u),e=ch20Barrier();
  if(e) { const B=CH20_BARS[e.barrier||0]; const i=Math.max(0,rows.findIndex(r=>r.run||r.benchcall));
    rows.splice(i,0,{name:'FAMILY RELAY',role:'buff',sub:'Free · costs this turn · '+B.relay.name,relay:true}); }
  return rows;
};
const LE_b2Info_ch20=b2Info;
b2Info=function() {
  if(battle.state==='command'&&B2.actor&&B2.ui==='bag') {
    const r=b2BagList(B2.actor)[B2.sel],e=ch20Barrier();
    if(r&&r.relay&&e) { const B=CH20_BARS[e.barrier||0]; b2Msg('FAMILY RELAY: '+B.relay.name+' ('+B.relay.who.join(', ')+'). It breaks the '+B.name+' BARRIER. Members come in off the bench for it. Costs this turn, no VP.'); return; }
  }
  return LE_b2Info_ch20();
};
const LE_b2Pick_ch20=b2Pick;
b2Pick=function(i) {
  const u=B2.actor;
  if(B2.ui==='bag'&&u) { const r=b2BagList(u)[i];
    if(r&&r.relay) { B2.sel=i; sfx.select&&sfx.select(); b2Do({relay:true,name:'FAMILY RELAY',weight:'standard'},{label:'RELAY',targets:[],primary:u,ally:true}); return; } }
  return LE_b2Pick_ch20(i);
};
const LE_b2Do_ch20=b2Do;
b2Do=function(act,opt) {
  if(!(act&&act.relay)) return LE_b2Do_ch20(act,opt);
  const u=B2.actor,e=ch20Barrier(); if(!u||!e||battle.state!=='command') { sfx.nope&&sfx.nope(); return; }
  battle.state='busy'; B2.ui='busy'; B2.pending=null;
  u.ct=b2Delay(u,'standard');
  const k=e.barrier||0,B=CH20_BARS[k],R=B.relay,P=b2FoePoint(e);
  setFlag('relay:'+B.key,true);
  enqueue(
    ()=>{ b2Msg(R.steps[0]); sfx.charge&&sfx.charge(); b2Render(); },2600,
    ()=>{ b2Msg(R.steps[1]); B2.relayFx={kind:B.key,t0:performance.now()/1000}; sfx.whoosh&&sfx.whoosh(); if(B.key==='fear'&&sfx.bark) sfx.bark(); b2Render(); },2600,
    ()=>{ b2Msg(R.steps[2]); sfx.whoosh&&sfx.whoosh(); b2Render(); },2200,
    ()=>{
      b2Msg(R.steps[3]); e.barUp=false; e.barrier=k+1; e.shake=.9; e.flash=.6; e.intent=null;
      battle.texts.push({txt:'BARRIER BROKEN',x:P.x,y:P.y-26,color:'#ffe08a',sc:1,t:0,dur:1.5});
      b2Fx({kind:'shatter',x:b2FoeCanvasPos(e).x,y:b2FoeCanvasPos(e).y-b2FoeCanvasPos(e).h/2,r:b2FoeCanvasPos(e).w*.62,t:0,dur:.9});
      sfx.lineClear&&sfx.lineClear(); sfx.stun&&sfx.stun();
      for(const p of b2LiveParty()) { const h=Math.round(p.maxHp*.18); p.hp=Math.min(p.maxHp,p.hp+h); b2PopParty(p,'+'+h,'#9be8a0',-10); }
      b2Heart&&b2Heart(B2_HEART.care); b2Render(); },2800,
    ()=>{ B2.relayFx=null; if(k+1>=CH20_BARS.length) b2Msg('All four barriers are down. The Leviathan has nothing left to hold the minute with.'); else b2Msg('Hit it again. The next barrier is '+CH20_BARS[k+1].name+'.'); },1800,
    ()=>b2AfterAction());
};

// ---------- Fight 2: Julian ----------
const CH20_ACTS=['grace.dance','rose.silly','amy.pep','deedee.hug','boppy.grumble','tnb.wardrobe','nara.puppy'];
const CH20_ACT_NAME={'grace.dance':'DANCE','rose.silly':'RASPBERRY','amy.pep':'PEP TALK','deedee.hug':'MOON & BACK','boppy.grumble':'GRUMBLE','tnb.wardrobe':'WARDROBE','nara.puppy':'PUPPY DOG EYES'};
const CH20_ACT_LINE={
  'grace.dance':'Julian watches Grace dance. He does not look away. One corner of his mouth moves, very slightly.',
  'rose.silly':'Rose blows a raspberry at him. He flinches. Then he makes a very small noise, a kind of cough, and covers his mouth.',
  'amy.pep':'Amy: “It is never too late to start the second half of the race.” He looks up at her as if nobody has said that to him in years.',
  'deedee.hug':'Deedee hugs him, whole, with the warmth of a sixty-year-old grandmother who feeds everyone. He stiffens. Then he does not. She hands him a slice of rhubarb crisp.',
  'boppy.grumble':'Boppy: “Stop feeling sorry for yourself and eat a pepper, pal. My stomach hurts worse than yours.” Julian actually laughs. It comes out rusty.',
  'tnb.wardrobe':'TNB drapes a warm hand-knit cardigan over Julian’s shaking shoulders. “It’s a little big. It fits better when you keep it on.”',
  'nara.puppy':'Nara trots over and drops a soggy tennis ball in his lap. She looks up at him with very human eyes. A single excited drop lands on the glass floor.'};
const LE_b2Kindness_ch20=b2Kindness;
b2Kindness=function(M) {
  const J=B2.foes.find(f=>f.boss==='julian'&&b2Alive(f));
  const before=J?J.warm:0;
  LE_b2Kindness_ch20(M);
  if(!J||M.act.tombo) return;
  const key0=M.u.id+'.'+M.act.key,key=B8_SIG_LEGACY[key0]||key0;
  J.warm=before;   // the generic meter is not used here: seven acts, one eighth each, then Tom
  if(!CH20_ACTS.includes(key)) { b7Later(()=>{ if(B2.active) b2Msg('Julian does not look up. That was kind, but it was not the one. Try what each of them is best at.'); },250); return; }
  if(J.acts7.includes(key)) { b7Later(()=>{ if(B2.active) b2Msg('He has already felt that one. It still counts. Try somebody else.'); },250); return; }
  J.acts7.push(key);
  J.warm=Math.round(J.warmGoal*J.acts7.length/8); J.warmFlash=.8;
  const p=b2FoePoint(J);
  battle.texts.push({txt:CH20_ACT_NAME[key],x:p.x,y:p.y-22,color:'#ff9ac0',sc:1,t:0,dur:1.2});
  b7Later(()=>{ if(!B2.active) return; b2Msg(CH20_ACT_LINE[key]+' ('+J.acts7.length+'/7)'); if(J.acts7.length>=7) J.tomDue=true; },300);
  b2Render();
};
// Nothing ends him until Tom has stepped forward.
const LE_b2Calm_ch20=b2Calm;
b2Calm=function(t,M) {
  if(t&&t.boss==='julian'&&!t.tomDone&&!t.calm) { t.warm=Math.min(t.warm,Math.round(t.warmGoal*.9)); return; }
  return LE_b2Calm_ch20(t,M);
};
const LE_b2CalmText_ch20=b2CalmText;
b2CalmText=function(list) {
  const j=list.find(f=>f.boss==='julian');
  if(j) return 'The glass of the living room cracks, and the whole Stillness Engine begins, slowly, to come apart. Julian is still in the chair. He is not alone in it.';
  return LE_b2CalmText_ch20(list);
};
function b2JulianTurn(e) {
  e.count=(e.count||0)+1;
  if(e.tomDue&&!e.tomDone) return b2JulianTom(e);
  if(e.intent) { const I=e.intent; e.intent=null; return b2FoeAct(e,I.act,null,()=>[]); }
  return b2FoeAct(e,pick(e.acts),null,()=>{
    if(e.count%3===2) { b2SetAll(e,e.D.flop,false); return [()=>{ b2Msg('The lamp goes very low. ONE MORE FLIGHT next turn hits everyone. Heal up after!'); e.shake=.3; b2Render(); },1500]; }
    return [];
  });
}
function b2JulianTom(e) {
  e.tomDone=true; e.tomDue=false; e.intent=null;
  const tom=b2Tom();
  if(tom&&tom.hp<=0) tom.hp=Math.max(1,Math.round(tom.maxHp*.3));
  enqueue(
    ()=>{ b2Msg('Tom steps forward. He does not raise anything. He is the only one who has not done a thing to Julian yet, and he has been counting.'); b2Render(); },2800,
    ()=>{ b2Msg('Tom: “Julian. Nobody can make Thursday last. I tried.”'); e.lunge=-.2; b2Render(); },2400,
    ()=>{ sfx.guard&&sfx.guard(); if(typeof say==='function') say('tom','block'); b2Msg('Tom uses DEFEND on Julian himself. He stands between this man and everything he is afraid of, and the whole Stillness Engine shudders.'); b2Render(); },3000,
    ()=>{ b2Msg('Tom: “Come on. Nobody gets left behind on my flight.”'); sfx.levelChime&&sfx.levelChime(); b2Render(); },2800,
    ()=>{ e.warm=e.warmGoal; b2Calm(e,null); const list=B2.calmLate||[e]; B2.calmLate=null; b7Later(()=>{ if(B2.active) b2Msg(b2CalmText(list)); },300); },2000,
    ()=>b2AfterAction());
}

TUTORIALS.ch20={tips:[
  {id:'barrier',who:'*',when:()=>B2.foes.some(f=>f.boss==='leviathan'),text:'Hit the Leviathan until a barrier locks. Then ▼ Bag, FAMILY RELAY breaks it. There are four. Every third turn it calls TIME WARP on everyone: heal after.'},
  {id:'stone',who:'*',when:()=>B2.foes.some(f=>f.boss==='julian'),text:'Your attacks are stone. Use the care moves: DANCE, RASPBERRY, PEP TALK, MOON & BACK, GRUMBLE, WARDROBE, PUPPY DOG EYES. ▼ Bag, BENCH CALL, brings the rest in almost free.'}]};

// benchFree lasts one battle.
const LE_b2Start_ch20=b2Start;
b2Start=function(cfg){ B2.benchFree=false; return LE_b2Start_ch20(cfg); };
