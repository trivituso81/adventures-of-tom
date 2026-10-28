'use strict';
// data/ch14-battle.js — Chapter 14 battle: Warden Boppy (non-violent). Loaded after data/ch13-battle.js; wraps a few engine/battle2.js functions.
// How the fight works (everything here is a thin layer over the Un-Grump / Warmth system in engine/battle2-kind.js):
//   - Hitting him is pointless: his GRIT and COOL are sky high (every hit does 1) and every damaging hit makes the armor hum brighter: it heals
//     him and takes some Warmth away (ARMOR UP).
//   - Warmth is the whole fight: DEFEND (Tom), PEP TALK (Amy), DANCE (Grace), SILLY (Rose) and the Tombo ff2 are favorites; ▼ Bag, MAKE HIM LAUGH,
//     is the Un-Grump route (3 jokes). DEFEND also warms him on its own (he cannot stand watching somebody guard somebody).
//   - Deedee is on the porch (chapter 14 scenes free her first). On his next turn after Warmth reaches half, or after the third joke lands, or on his
//     fourth turn at the latest, she calls out: MOON & BACK heals the whole party and the last of the armor falls (b2WardenTurn).
//   - Every third turn he telegraphs GATE SLAM on everyone; he is otherwise very gentle (low numbers on purpose).
const B2_WARDEN_LINES={
  tom:['Dad. You have been standing here so long the pigeons named you. Gary. They call you Gary.','Dad, I said I would never hit you and then I stood next to you and now I realize that’s the same thing as a very large lawn ornament.'],
  grace:['Knock knock! Who’s there? Boppy! Boppy who? Boppy, take off the bucket, it’s not Halloween!','Why did Boppy cross the road? To complain about the other side! I did a whole video on it and it has seven likes. They’re all mine.'],
  rose:['Boppy, is your hat a BUCKET? Can I wear it? Can I wear the bucket? Knock knock! Bucket!','Is it a bath? Are you in a metal bath? Boppy, I want to be in a metal bath!'],
  amy:['Dad. Elbows down. Stride out. You haven’t walked at a proper clip in eleven years. Come on. Pick up your feet.','You’ve been standing for hours. I’ll walk with you. Short laps. You can complain the entire time.'],
  _:['Take off the bucket. We’ll tell you a joke.']};
Object.assign(B2_FOES,{
  warden:{level:20,hp:2400,pow:30,grit:320,warmth:22,cool:320,pep:15,weak:[],resist:[],step:4,boss:'warden',noRun:true,
    praise:{label:'MAKE HIM LAUGH',sub:'Free · he laughs when he is scared',need:3,tag:'LAUGH',
      react:['The helmet rattles. A snort escapes the visor. “...That was not funny.”','The armor shakes. Behind the visor, something is definitely laughing. “Stop. Stop it. My BACK.”']},
    acts:[{name:'Halt',stat:'pow',mult:.55,elem:'kinetic',target:'one',msg:'{e} lowers the gate bar at {t}. “Halt.”'},
          {name:'Shoulder Check',stat:'pow',mult:.6,elem:'kinetic',target:'one',msg:'{e} bumps {t} back with a gold shoulder.'},
          {name:'Stand Firm',stat:'pow',mult:.5,elem:'kinetic',target:'one',status:['gritdown',2],msg:'{e} plants the bar and leans on it. {t} feels squashed.'}],
    flop:{name:'Gate Slam',stat:'pow',mult:.7,elem:'kinetic',target:'all',msg:'GATE SLAM! {e} brings the bar down across the whole yard!'}}
});
Object.assign(B2_FORMATIONS,{warden:[['warden','front']]});
Object.assign(B2_GRUMP,{
  warden:{goal:420,grumpy:'He thinks the armor takes the ache away. It only stops him feeling it. He hit eleven years of being tired and called it a deal.',
    likes:['tom.starter','amy.pep','grace.dance','rose.silly','ff2']}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{warden:130});

// Warmth for the Warden (no more than 90% until Deedee has called out).
function b2WardenWarm(t,share,tag,msg) {
  if(!b2Alive(t)) return;
  const k='ward:'+tag,n=t.kindLog[k]||0; t.kindLog[k]=n+1;
  const amt=Math.max(1,Math.round(t.warmGoal*share*Math.pow(.6,n))),p=b2FoePoint(t);
  t.warm=Math.min(t.deedee?t.warmGoal:Math.round(t.warmGoal*.9),t.warm+amt); t.warmFlash=.6;
  pop('+'+amt,p.x+7,p.y-3,'#ff9ac0');
  if(n===0) battle.texts.push({txt:tag,x:p.x,y:p.y-16,color:'#ff9ac0',sc:1,t:0,dur:1.1});
  if(msg) b2Msg(msg);
  b2Render();
}
// Hitting the armor: it hums brighter, heals, and he cools off a little.
const LE_b2ApplyEntry_ch14=b2ApplyEntry;
b2ApplyEntry=function(e,amt) {
  const t=e&&e.t,first=!!(e&&e.first);
  const r=LE_b2ApplyEntry_ch14(e,amt);
  if(t&&t.boss==='warden'&&first&&!e.miss&&e.dmg>0&&b2Alive(t)) {
    t.hp=t.maxHp; t.armorUp=(t.armorUp||0)+1;
    const p=b2FoePoint(t); t.warm=Math.max(0,t.warm-Math.round(t.warmGoal*.06));
    battle.texts.push({txt:'ARMOR UP',x:p.x,y:p.y-20,color:'#ffd24a',sc:1,t:0,dur:1.1}); sfx.charge&&sfx.charge();
    if(t.armorUp===1||t.armorUp%4===0) b7Later(()=>{ if(B2.active) b2Msg('The gold hums brighter. Hitting it only makes it stronger. This is not that kind of fight.'); },250);
  }
  return r;
};
// Tom guarding somebody is the other half of the fight.
const LE_b2DefendSteps_ch14=b2DefendSteps;
b2DefendSteps=function(u,opt,act) {
  const steps=LE_b2DefendSteps_ch14(u,opt,act),w=B2.foes.find(f=>f.boss==='warden'&&b2Alive(f));
  if(!w||!Array.isArray(steps)) return steps;
  return [...steps,()=>b2WardenWarm(w,.11,'GUARDED','Warden Boppy watches Tom stand in front of somebody. The hum goes a little quieter.'),1100];
};
// Warmth cannot finish him until Deedee has called from the porch: the calm waits, and her beat runs on his next turn.
const LE_b2Calm_ch14=b2Calm;
b2Calm=function(t,M) {
  if(t&&t.boss==='warden'&&!t.deedee&&!t.calm) { t.deedeeDue=true; t.warm=Math.round(t.warmGoal*.9); return; }
  return LE_b2Calm_ch14(t,M);
};
const LE_b2CalmText_ch14=b2CalmText;
b2CalmText=function(list) {
  const w=list.find(f=>f.boss==='warden');
  if(!w) return LE_b2CalmText_ch14(list);
  return w.calm?'The armor goes quiet. Boppy lets out a long, shaky breath, and the bar slides out of his hand.'
    :'The visor cracks. The gold holds. He is almost there, and the porch is very still. Somebody is about to say something.';
};
const LE_b2BossOpen_ch14=b2BossOpen;
b2BossOpen=function(e) {
  if(e.boss!=='warden') return LE_b2BossOpen_ch14(e);
  e.count=0; e.deedee=false; e.deedeeDue=false;
  return [()=>{ b2Msg('The gold plate hums. '+e.def.the+' does not move. Nobody in this yard will get past him.'); e.shake=.6; sfx.thud&&sfx.thud(); },1800,
    ()=>b2Msg('Do not hit him: every hit makes the armor stronger. DEFEND, cheer him up, make him laugh.'),2100,
    ()=>b2Msg('Every third turn he calls GATE SLAM on everyone. It shows on the turn ribbon first.'),1900];
};
const LE_b2BossTurn_ch14=b2BossTurn;
b2BossTurn=function(e) { return e.boss==='warden'?b2WardenTurn(e):LE_b2BossTurn_ch14(e); };
function b2WardenTurn(e) {
  e.count=(e.count||0)+1;
  if(!e.deedee&&(e.deedeeDue||e.warm>=e.warmGoal*.5||e.count>=4)) return b2WardenDeedee(e);
  if(e.intent) { const I=e.intent; e.intent=null; return b2FoeAct(e,I.act,null,()=>[]); }
  return b2FoeAct(e,pick(e.acts),null,()=>{
    if(e.count%3===2&&!e.deedee) { b2SetAll(e,e.D.flop,false); return [()=>{ b2Msg('The yard goes still. GATE SLAM next turn hits everyone. Heal up after!'); e.shake=.4; b2Render(); },1500]; }
    return [];
  });
}
// Deedee on the porch: MOON & BACK heals the party and gives him the warmth he needs; if the fight was waiting on her, it ends here.
function b2WardenDeedee(e) {
  e.deedee=true; e.intent=null; e.shield=null;
  const finish=e.deedeeDue; e.deedeeDue=false;
  const steps=[
    ()=>{ b2Msg('From the porch, small and clear above the hum: “ROBERT.”'); sfx.ding&&sfx.ding(); e.shake=.5; e.lunge=-.3; b2Render(); },2000,
    ()=>b2Msg('Warden Boppy’s helmet turns. Nobody has called him Robert since 1998.'),2000,
    ()=>{ b2Msg('Deedee, one hand free of the amber: “You big nut. I am right here. MOON AND BACK!”'); sfx.levelChime&&sfx.levelChime();
      for(const p of b2LiveParty()) { const h=Math.round(p.maxHp*.6); p.hp=Math.min(p.maxHp,p.hp+h); b2PopParty(p,'+'+h,'#9be8a0',-10); }
      b2Heart&&b2Heart(B2_HEART.care); b2Render(); },2400];
  if(finish) steps.push(()=>{ e.warm=e.warmGoal; b2Calm(e,null); const list=B2.calmLate||[e]; B2.calmLate=null; b7Later(()=>{ if(B2.active) b2Msg(b2CalmText(list)); },300); },1700);
  else steps.push(()=>{ const p=b2FoePoint(e); e.warm=Math.min(e.warmGoal,e.warm+Math.round(e.warmGoal*.3)); e.warmFlash=.6; pop('+'+Math.round(e.warmGoal*.3),p.x+7,p.y-3,'#ff9ac0');
      b2Msg('The gold cracks along the shoulders. He is listening now. Keep him warm.'); b2Render(); },1800);
  enqueue(...steps,()=>b2AfterAction());
}
