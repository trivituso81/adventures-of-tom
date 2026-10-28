'use strict';
// data/ch18-battle.js — Chapter 18 battle: Julian Vance, the survival fight. Loaded after data/ch17-battle.js; wraps a few engine/battle2.js functions.
// How the fight works:
//   - It cannot be won. Nothing the party does hurts him (b2ApplyEntry puts him back to full), and there is no kind route. He cannot be run from.
//   - Vance alternates two turns: he AIMS the Unwriting Ray (it shows on the turn ribbon first, with a line about who it is for), then FIRES it.
//     Four rays in all: Grace, Rose, Amy and TNB, then everyone. Every ray is aimed at the family and Tom steps in front of every one,
//     so Tom takes the whole ray: a share of his max HP (CH18_PCT), 40% softer while he is guarding (DEFEND, on himself or an ally).
//   - Tom cannot fall during the first three rays (his HP stops at 1). The players' job is to DEFEND and heal him and watch the ribbon.
//   - The fourth ray is all of it, at once. Tom does not move. His HP bar turns to light (unit.light, drawn by b2RenderParty), the fight ends with the
//     result 'erased', and the chapter's scene (data/scenes-ch18.js) takes over. Nobody else is ever hit, so nobody else can be knocked out.
//   - HP goes back to the real members through b2WriteBack (Tom stays at 1), no rewards, no victory card.
const CH18_RAY={name:'Unwriting Ray',stat:'warmth',mult:1,elem:'sparkle',target:'all',msg:'UNWRITING RAY! {e} fires the Loom’s beam at the family!'};
const CH18_PCT=[.30,.36,.44];   // the share of Tom's max HP each of the first three rays takes (before DEFEND softens it)
Object.assign(B2_FOES,{
  vance:{level:26,hp:99999,pow:48,grit:999,warmth:40,cool:999,pep:22,weak:[],resist:[],step:4,boss:'vance',noRun:true,
    acts:[CH18_RAY],flop:CH18_RAY}
});
Object.assign(B2_FORMATIONS,{vance:[['vance','front']]});
Object.assign(B2_GRUMP,{vance:{goal:999999,grumpy:'He is not grumpy. He is afraid, and he has been afraid so long it looks like patience.',likes:[]}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{vance:0});

// What he says before each ray, and what Tom and the others say after it lands.
const CH18_AIM=[
  'Vance: “Grace first, please. Hold your sister’s hand. It is very quick.”',
  'Vance: “Rose. You will not even miss the pretzel. I promise you will not miss anything.”',
  'Vance: “Mrs. Gregori. Mr. TNB. You carry so much, both of you. Put it down. I will hold it.”',
  'Vance: “Everyone. Together. That is how a photograph works. Tom, stand aside. Please. Stand aside.”'];
const CH18_WHO=['Grace','Rose','Amy and TNB','everyone'];
const CH18_AFTER=[
  'Grace: “TATA!”   Tom: “I am a little less okay than I was a moment ago. Carry on.”',
  'Rose: “Tata, you’re doing a glow!”   Tom: “It is a very small glow. Please do not stare.”',
  'Amy: “Tom. Move. I mean it.”   Tom: “Elbows down, Ames. I have this.”'];

function b2VanceTurn(e) {
  e.count=(e.count||0)+1; e.hp=e.maxHp;
  if(e.count%2===1) {   // AIM
    const k=(e.count-1)/2;
    b2SetAll(e,CH18_RAY,false);
    enqueue(()=>{ b2Msg(CH18_AIM[k]); e.lunge=.3; sfx.charge&&sfx.charge(); b2Render(); },2400,
      ()=>{ b2Msg('The Loom leans toward '+CH18_WHO[k]+'. UNWRITING RAY next turn. Tom will step in front. DEFEND, and heal him.'); b2Render(); },2100,
      ()=>b2AfterAction());
    return;
  }
  e.intent=null;
  b2VanceFire(e,e.count/2);
}
function b2VanceFire(e,n) {
  const t=b2Tom(); if(!t) { enqueue(()=>b2End('erased')); return; }
  const last=n>=4;
  const steps=[()=>{ B2.hurtNow=false; b2Msg(CH18_RAY.msg.split('{e}').join('Julian Vance')); e.lunge=.6; sfx.grumpAttack&&sfx.grumpAttack(); b2AimFoe(e,t); },1500];
  const covered=['Grace','Rose','Amy and TNB','Grace, Rose, Amy and TNB'][n-1];
  steps.push(()=>{ battle.block={target:t.idx,t:0,dur:1.8}; sfx.guard(); say('tom','block'); b2Msg('Tom steps in front of '+covered+'. “No touching, please.”'); b2Render(); },1400);
  if(!last) {
    steps.push(()=>{
      let dmg=Math.round(t.maxHp*CH18_PCT[n-1]);
      if(t.st.guard) dmg=Math.round(dmg*.6);
      dmg=Math.max(1,Math.round(dmg*b7Taken()));
      t.hp=Math.max(1,t.hp-dmg); B2.hurtNow=true;
      const fx=battle.fx[t.idx]; fx.shake=.4; fx.flash=.25; const q=BATTLE_POS[t.idx];
      pop(String(dmg),q.x,q.base-34,'#ffe08a'); sfx.hitParty(); say('tom','hurt',.12);
      b2Render();
    },1000,()=>{ b2Aim0(); b2Msg(CH18_AFTER[n-1]); },2600,()=>b2AfterAction());
    enqueue(...steps);
    return;
  }
  // The last ray: all of it, at once. Tom does not move.
  steps.push(()=>{ b2Msg('Tom does not step aside. The ray goes into him, every thread of it, and keeps going.'); battle.fx[t.idx].shake=.8; battle.fx[t.idx].flash=.6; sfx.charge&&sfx.charge(); b2Render(); },2400,
    ()=>{ t.hp=1; t.light=true; b2PopParty(t,'LIGHT','#fff6c8',-18); sfx.levelChime&&sfx.levelChime(); b2Aim0(); b2Render(); },1500,
    ()=>b2Msg('Tom’s HP bar goes white. Then gold. Then it is not a bar anymore. It is light.'),3000,
    ()=>{ b2Msg('Tom, very quietly: “We always make our connection.”'); b2Render(); },2800,
    ()=>b2Msg('Behind him, nobody was touched. Not one of them.'),2600,
    ()=>{ b2WriteBack(); b2End('erased'); });
  enqueue(...steps);
}
const LE_b2BossOpen_ch18=b2BossOpen;
b2BossOpen=function(e) {
  if(e.boss!=='vance') return LE_b2BossOpen_ch18(e);
  e.count=0;
  return [()=>{ b2Msg('The Chronos Loom hums behind Julian Vance. Every thread in it is somebody’s afternoon, and the Unwriting Ray is aimed at your family.'); e.shake=.6; sfx.thud&&sfx.thud(); },2600,
    ()=>b2Msg('He cannot be hurt. Tom steps in front of every ray. DEFEND softens it, and healing Tom keeps him standing.'),2600,
    ()=>b2Msg('Each ray shows on the turn ribbon before it fires. Hold on.'),2000];
};
const LE_b2BossTurn_ch18=b2BossTurn;
b2BossTurn=function(e) { return e.boss==='vance'?b2VanceTurn(e):LE_b2BossTurn_ch18(e); };
// Nothing the party does hurts him.
const LE_b2ApplyEntry_ch18=b2ApplyEntry;
b2ApplyEntry=function(e,amt) {
  const t=e&&e.t,r=LE_b2ApplyEntry_ch18(e,amt);
  if(t&&t.boss==='vance') {
    t.hp=t.maxHp; t.calm=false;
    if(e.first&&!e.miss&&e.dmg>0&&!B2.vanceNote) { B2.vanceNote=true;
      b7Later(()=>{ if(B2.active) b2Msg('The hit passes through him like light through a photograph. He is not really fighting. Protect Tom.'); },250); }
  }
  return r;
};
TUTORIALS.ch18={tips:[
  {id:'ray',who:'*',text:'Every ray is aimed at the family, and Tom steps in front of it. DEFEND softens his hits by 40%. Heal Tom between rays. Hitting Vance does nothing.'}]};
