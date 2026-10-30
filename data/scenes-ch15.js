'use strict';
// data/scenes-ch15.js — Part 2, Chapter 15 "The Eight-Seat Dinner Table". Loaded after data/scenes-ch14.js.
// Chapter 14 ended with Boppy and Deedee back inside the Rivituso house. Tom walks in (trigger on the grands map) and the whole family is at
// one table for the first time: Tom, Grace, Rose, Amy out front, and Deedee, Boppy, TNB and Nara on the bench (engine/bench.js), seated around a
// long table (a table object added to the grands map while the chapter is live). Deedee feeds Nara crust and dotes on TNB; Boppy and TNB have a
// pepper contest that ends in a gruff nod. HUSH-9 Final Form folds itself through the door to make the laughing stop (data/ch15-battle.js).
// Kind route: PULL UP A CHAIR x3. After it: Vance's message (the Square, tomorrow, a family photograph), the Hush Chip keepsake, and the Family
// Finish Fifty-One Years & Counting (ff3, Deedee + Boppy + Tom) unlocks. Deedee and Boppy go back to their house spots; TNB and Nara stay along.
// Flags, in order: ch15-open (the scene played), ch15-fight (the fight has been started), battle:hush9final ('win'), kind:hush9final (kind route),
// ch15-after (the after scene played), ch15-done (CHAPTER 15 COMPLETE), tombo:ff3.
const CH15={mode:'full',chapter:15};
Object.assign(items,{
  hushchip:{name:'HUSH-9’s Chip',icon:'🔇',slot:null,keepsake:true,desc:'The hush chip, cracked down the middle. It does not hush anything now. It plays one small sound on a loop: this table, laughing. Rose keeps it in her pocket and says it is a tiny dinner.'}});

// Seats around the table (table object at x 4 to 8, y 5 to 6, dragged into the middle of the painted living room). Each is [x, y, facing].
// Top side sits in front of the painted sofa; Tom, Grace and Boppy sit on the door side, leaving (6,7) for HUSH-9.
const CH15_SEATS={deedee:[3,5,'right'],nara:[3,4,'right'],tnb:[5,4,'down'],amy:[6,4,'down'],rose:[7,4,'down'],grace:[5,7,'up'],tom:[7,7,'up'],boppy:[8,7,'up']};
const ch15Hush=()=>{ const g=worlds.grands; return g&&g.npcs.find(n=>n.name==='HUSH-9'); };
function ch15AddTable() {
  const g=worlds.grands; if(!g||g.objects.some(o=>o.ch15)) return;
  object(g,'table',4,5,5,2,'The dinner table','Eight places set. A rhubarb crisp, a jar of Boppy’s peppers, the good plates, and a candle that Deedee says is for atmosphere and Boppy says is a fire hazard.',{ch15:true});
}
function ch15RemoveTable() {
  const g=worlds.grands; if(!g) return;
  for(const o of g.objects.filter(o=>o.ch15)) {
    for(let yy=o.y;yy<o.y+o.h;yy++) for(let xx=o.x;xx<o.x+o.w;xx++) if(within(g,xx,yy)) { g.solid[yy*g.w+xx]=0; g.objectAt.delete(key(xx,yy)); }
    g.objects.splice(g.objects.indexOf(o),1);
  }
}
// Everyone sits: chapter 15 rules, the four extras on the bench, the table, and the eight seats.
function ch15Table() {
  setChapter(15);
  currentMap=worlds.grands; player.move=null; player.hidden=false;
  for(const m of extras()) if(!['amy'].includes(m.id)) recruitLeave(m,true);
  forceJoin(amy,true);
  for(const id of ['deedee','boppy','tnb','nara']) { const m=MEMBERS()[id]; if(m&&typeof benchAdd==='function') benchAdd(m); }
  ch15AddTable();
  const [tx,ty,td]=CH15_SEATS.tom; player.x=tx; player.y=ty; player.facing=td;
  placeFollowers();
  for(const id of Object.keys(CH15_SEATS)) { if(id==='tom') continue; const f=followers.find(f=>f.member&&f.member.id===id); if(f) { const [x,y,d]=CH15_SEATS[id]; Object.assign(f,{x,y,facing:d,move:null,path:[]}); } }
  refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}

SCENES.ch15Open=()=>[
  {flag:'ch15-open',value:'pending'},
  {fade:'out',time:.8},
  {card:15,time:3.2},
  {call:()=>{ setFlag('ch15-open','pending'); sfx.doorIn&&sfx.doorIn(); ch15Table(); }},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['Eight chairs. Deedee, there are seven of us and a dog.']},
  {talk:'Deedee',lines:['Nara counts. Nara is people. Sit, sit, sit. Everybody sit.']},
  {talk:'Nara',lines:['Nara takes the chair at Deedee’s elbow like she was born in it.']},
  {talk:'Grace',lines:['This is the first time all of us have been at one table. I’m going to film it. For the memories.']},
  {talk:'Amy',lines:['Phone down. Eat first. Film after.']},
  {talk:'Grace',lines:['Eating is also content.']},
  {talk:'Deedee',lines:['TNB, sweetheart. Look at you. You’re too thin. Is Tommy feeding you? Tommy, are you feeding him?']},
  {talk:'Tom',lines:['He makes the bowls I eat out of. We’re even.']},
  {talk:'TNB',lines:['It’s a very good bowl, Deedee. I’m biased.']},
  {talk:'Deedee',lines:['Polite, and he makes bowls. Tommy. Keep this one.']},
  {talk:'Tom',lines:['That’s the plan.']},
  {hearts:'tom'},{hearts:'tnb'},
  {talk:'Deedee',lines:['Nara, honey. Come here. Crust, from the very edge of the pie. That’s the best part. Don’t tell Tommy.']},
  {call:()=>sfx.pickup&&sfx.pickup()},
  {wait:1},
  {talk:'Nara',lines:['Nara takes the crust in one gulp. Then she looks up at Deedee as if Deedee personally hung the moon. She will now sit at this chair until the end of time.']},
  {talk:'Rose',lines:['Nara doesn’t eat from strangers. She ate from you.']},
  {talk:'Deedee',lines:['I’m not a stranger. I’m a woman with crust.']},
  {talk:'Boppy',lines:['Nobody touch the peppers. Those came off the plant by the window. They are not for the faint of heart.']},
  {talk:'Boppy',lines:['TNB. You work in a fancy restaurant. You eat anything?']},
  {talk:'TNB',lines:['Mostly I serve it.']},
  {talk:'Boppy',lines:['That’s a no.']},
  {talk:'TNB',lines:['That’s a “professionally, I’m very polite about it.”']},
  {talk:'Boppy',lines:['One pepper each. You and me. First one to reach for water loses.']},
  {talk:'Amy',lines:['I’ll time it. Nobody move. Nobody breathe. Ready? Go.']},
  {talk:'Rose',lines:['Is somebody going to die?']},
  {talk:'Grace',lines:['Rose. Not in front of the pepper.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {wait:1.4},
  {talk:'Boppy',lines:['It’s nothing. It’s fine. It’s... it’s fine.']},
  {talk:'TNB',lines:['It’s actually quite floral. There’s a bright citrus note at the front.']},
  {talk:'Boppy',lines:['...Citrus.']},
  {talk:'Tom',lines:['Dad, you’re sweating.']},
  {talk:'Boppy',lines:['It’s warm in here. It’s the oven. Deedee, what is the oven doing?']},
  {talk:'Deedee',lines:['Nothing. It’s off. Robert.']},
  {talk:'Amy',lines:['Forty seconds. Boppy’s hand is moving toward the water. It is hovering. It is hovering.']},
  {talk:'Boppy',lines:['My stomach is doing something.']},
  {talk:'Grace',lines:['That’s the pepper!']},
  {talk:'Boppy',lines:['It was doing something BEFORE.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'TNB',lines:['I’m calling it a draw. Neither of us reached. I’m going to breathe through my nose for a minute. I can’t feel my face. Nobody say anything.']},
  {wait:.8},
  {talk:'Boppy',lines:['...You’ll do.']},
  {call:()=>sfx.levelChime&&sfx.levelChime()},
  {talk:'Deedee',lines:['That’s the nod. Tommy. Your father gave him the nod.']},
  {talk:'Tom',lines:['I know what the nod is. I got it after the third visit.']},
  {hearts:'tnb'},{hearts:'tom'},
  {talk:'Amy',lines:['Okay. Toast. Everybody up. Glasses. Nara, paw.']},
  {talk:'Tom',lines:['To the table.']},
  {talk:'Grace',lines:['To the eight chairs!']},
  {talk:'Rose',lines:['To the CRUST!']},
  {talk:'Deedee',lines:['To the moon and back.']},
  {call:()=>{ sfx.bark&&sfx.bark(); sfx.levelChime&&sfx.levelChime(); }},
  {wait:.8},
  {trace:'ch15-open'},{hearts:'amy'},{hearts:'deedee'},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Tom',lines:['The laughing stops. Nobody stops it. The sound just goes. Rose’s mouth is open and nothing is coming out.']},
  {spawn:{name:'HUSH-9',look:'hush9',at:[8,11],dir:'up'}},
  {call:()=>{ const h=ch15Hush(); if(h) Object.assign(h,{hush:true,scripted:true,tier:0,maxHp:1,defeatedUntil:0,roam:0}); sfx.whoosh&&sfx.whoosh(); }},
  {walk:'HUSH-9',to:[[8,10]],speed:.3}, {face:'HUSH-9',dir:'up'},
  {talk:'HUSH-9',lines:['THIS IS A QUIET CAR.']},
  {talk:'Tom',lines:['It’s a dining room.']},
  {talk:'HUSH-9',lines:['It is the loudest dining room I have ever measured. Forty-one decibels of laughing. Mr. Vance does not want laughing. Laughing is how people leak.']},
  {talk:'Amy',lines:['It’s a family dinner. Everybody gets to be loud at a family dinner.']},
  {talk:'HUSH-9',lines:['That is the problem. You are happiest here. I have been upgraded. I am quiet in all directions. FINAL FORM.']},
  {talk:'Boppy',lines:['Nobody gets past us. Nobody comes to this table and shushes my wife’s cooking.']},
  {talk:'Deedee',lines:['Robert. Your back.']},
  {talk:'Boppy',lines:['I’ll do it with my back.']},
  {talk:'Tom',lines:['Dad, sit. We’re rotating. Amy’s up front with us. You’re on the bench. When somebody needs a break, wave, and tag in a friend.']},
  {talk:'Grace',lines:['A bench call. We have a bench. I have been waiting my whole life to say bench call.']},
  {talk:'Rose',lines:['Can I raspberry the train?']},
  {talk:'Tom',lines:['You may raspberry the train.']},
  {toast:'Tip: ▼ Bag, BENCH CALL swaps Amy for Deedee, Boppy, TNB or Nara. Or ▼ Bag, PULL UP A CHAIR (free, three times) and it just might sit down.',time:8},
  {flag:'ch15-open'},
  {save:true},
  ...SCENES.ch15Fight()   // the fight starts right away
];

SCENES.ch15Fight=()=>[
  {flag:'ch15-fight',value:'pending'},
  ...(flag('ch15-fight')==='pending'||flag('ch15-fight')===true?[
    {talk:'HUSH-9',lines:['Shh. Again. Round two.']},
    {talk:'Amy',lines:['Slower. Chair or chatter. Tag in a friend if you need one.']}]:[]),
  {flag:'ch15-fight'},
  {battle:()=>{ const n=ch15Hush(); if(n) Object.assign(n,{monster:'hush9final',tier:0}); return n; },tut:'ch15'},
  {call:()=>{ const n=ch15Hush(); if(n) n.monster=null; }},
  {if:()=>flag('battle:hush9final')!=='win',then:[
    {heal:true},
    {talk:'Deedee',lines:['Up, up. Eat something. Sit a minute. Then we try again.']},
    {toast:'Talk to HUSH-9 (by the door) and press A to try again. Everyone is healed.',time:5}],else:[]}
];

SCENES.ch15After=()=>[
  {flag:'ch15-after',value:'pending'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['The chip cracks right down the middle. HUSH-9 lowers its glove. For a moment the room is exactly as quiet as it wanted.']},
  {wait:.8},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Rose',lines:['Somebody’s laughing.']},
  {talk:'Grace',lines:['It’s the TRAIN.']},
  ...(flag('kind:hush9final')?[
    {talk:'HUSH-9',lines:['I measured forty-one decibels. It was forty-one decibels of nobody leaving.']},
    {talk:'Deedee',lines:['Scoot, Robert. The train needs a chair.']},
    {talk:'Boppy',lines:['Why am I scooting?']},
    {talk:'Deedee',lines:['Because you’re the widest.']},
    {talk:'Boppy',lines:['My BACK is the widest.']},
    {talk:'Deedee',lines:['Rhubarb crisp. Nine minutes. Eat.']},
    {talk:'HUSH-9',lines:['I do not eat.']},
    {talk:'Deedee',lines:['Everybody eats.']},
    {talk:'HUSH-9',lines:['...It is warm. It is loud. It is... acceptable.']}]:[
    {talk:'HUSH-9',lines:['The chip is broken. I cannot keep it quiet. I do not understand. It is very loud in here and nobody is sad.']},
    {talk:'Amy',lines:['That’s the point of the loud.']}]),
  {talk:'HUSH-9',lines:['Mr. Vance asked me to deliver a message. “Thank you for dinner. Tomorrow, the Square. Bring everyone. I would like a family photograph.”']},
  {talk:'Amy',lines:['That’s not a photograph. That’s a trap.']},
  {talk:'Tom',lines:['Of course it’s a trap. We’ll bring everyone anyway. And we’ll bring dessert.']},
  {talk:'Grace',lines:['I’m wearing the good scrunchie.']},
  {call:()=>sfx.pickup&&sfx.pickup()},
  {give:'hushchip'},
  {talk:'Rose',lines:['It left its chip! It plays a tiny dinner! Listen!']},
  {call:()=>{ const h=ch15Hush(); if(h) h.hidden=true; sfx.doorIn&&sfx.doorIn(); }},
  {despawn:'HUSH-9'},
  {talk:'Boppy',lines:['Deedee. Fifty-one years.']},
  {talk:'Deedee',lines:['And counting, Robert.']},
  {hearts:'tom'},{hearts:'amy'},
  {talk:'Boppy',lines:['Don’t make it weird.']},
  {call:()=>{ setFlag('tombo:ff3'); sfx.levelChime&&sfx.levelChime(); }},
  {toast:'New Family Finish: Fifty-One Years & Counting (Deedee, Boppy and Tom).',time:8},
  {trace:'ch15-wrap'},{hearts:'tom'},{hearts:'tnb'},
  {call:()=>{ ch15RemoveTable(); for(const id of ['deedee','boppy']) { const m=MEMBERS()[id]; if(m&&typeof onBench==='function'&&onBench(m)) benchRemove(m); } }},
  {flag:'ch15-after'},
  {fade:'out',time:.8},{card:15,done:true,time:3.4},{flag:'ch15-done'},{fade:'in',time:.8},
  {toast:'Goal: Chapter 16 is coming. Tomorrow, the Square.',time:7},
  {call:()=>showToast&&showToast('CHAPTER 15 COMPLETE! Chapter 16 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch15-open',map:'grands',when:{mode:'full',chapter:14,flag:'ch14-done',test:S=>!S.flags['ch15-open']},scene:'ch15Open'},   // test, not notFlag: the chapter jump must not mark it done
  {id:'ch15-after',map:'grands',when:{...CH15,flag:{'battle:hush9final':'win'},notFlag:'ch15-after'},scene:'ch15After'}
);

// World state. While chapter 15 is live (after the opening, before the after scene) the table stands in the grands house. Afterwards it goes.
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const live=STORY.chapter===15&&flag('ch15-open')&&!flag('ch15-after');
  if(live) ch15AddTable(); else ch15RemoveTable();
});
HOLD_RULES.push(n=>n.monster==='hush9final'||n.name==='HUSH-9');
{ const tut=TUTORIALS; tut.ch15={tips:[
  {id:'chip',who:'*',text:'Below half HP it braces behind its hush chip. Chatter and Kinetic hits break it, and so does any Tombo. Noise is what it cannot stand.'},
  {id:'bench',who:['amy'],dir:'down',care:1,text:'▼ Bag, BENCH CALL: Amy steps out and Deedee, Boppy, TNB or Nara hops in. The one who steps out waits at the table and can be called back.'},
  {id:'chair',who:'*',dir:'down',care:1,text:'▼ Bag, PULL UP A CHAIR. Free. Do it three times and it finally sits down.'}]}; }

// ---------- Talking to HUSH-9 starts the fight (and a retry after a loss) ----------
const LE_pressAction_ch15=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===15&&flag('ch15-open')&&!flag('ch15-after')&&currentMap.id==='grands') {
    const t=facingTarget(),n=t&&t.kind==='npc'?t.value:null;
    if(n&&n.name==='HUSH-9'&&flag('battle:hush9final')!=='win') { playScene('ch15Fight'); return; }
  }
  return LE_pressAction_ch15();
};
