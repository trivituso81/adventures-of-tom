'use strict';
// data/ch19-battle.js — Chapter 19 battle numbers: the Dead-Letter Office's belts and its night clerk, the Oblivion Censor. Loaded after data/ch18-battle.js.
// The Censor fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE), same as the Twin Lenses: every third turn a telegraphed STRIKE IT OUT on everyone;
// below half HP two Dead Letters slide off the belts and he braces behind his stamp for TOTAL REDACTION (2 Sparkle or Cozy hits, or any Tombo, break the stamp).
// The fight starts WITHOUT Tom (he is gone, flag 'tom-gone'): Grace, Rose, Amy and TNB are out front, Nara on the bench (▼ Bag). The first turn he takes below
// half HP, Tom bursts back in at Amy's slot (b2TomReturns): full HP, and Amy takes a seat on the bench (BENCH CALL swaps her back for TNB). Unlike Vance,
// the Censor CAN be won over: he has never been given anything to deliver. (The scene afterwards, data/scenes-ch19.js, calls tomBack() either way.)
Object.assign(B2_FOES,{
  censor:{level:26,hp:3600,pow:41,grit:26,warmth:30,cool:22,pep:17,weak:['sparkle','cozy'],resist:['chatter'],step:4,boss:'censor',noRun:true,
    acts:[{name:'Black Out',stat:'pow',mult:1.05,elem:'kinetic',target:'one',status:['powdown',2],msg:'{e} blacks out {t}’s name with a marker. {t} feels a little less like themselves.'},
          {name:'Return to Sender',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} stamps RETURN TO SENDER on {t} and gives a small shove.'},
          {name:'No Such Person',stat:'warmth',mult:.9,elem:'chatter',target:'one',status:['cooldown',2],msg:'{e} reads out a form. NO SUCH PERSON. {t} flinches.'}],
    flop:{name:'Strike It Out',stat:'warmth',mult:.95,elem:'chatter',target:'all',status:['slow',1],msg:'STRIKE IT OUT! {e} draws a long black line through the whole family!'},
    rumble:{name:'Total Redaction',stat:'pow',mult:1.55,elem:'kinetic',target:'all',msg:'TOTAL REDACTION! {e} brings the stamp down on everyone at once!'},
    shield:{need:2,elems:['sparkle','cozy']},add:'deadletter'},
  deadletter:{level:24,hp:360,pow:27,grit:17,warmth:18,cool:15,pep:13,weak:['kinetic','chatter'],resist:[],step:2,
    acts:[{name:'Paper Cut',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} paper-cuts {t}.'},
          {name:'Flap Shut',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} flaps itself shut on {t}’s hand.'},
          {name:'Return',stat:'pow',mult:.75,elem:'chatter',target:'one',every:3,status:['slow',2],msg:'RETURN TO SENDER! {e} slaps a stamp on {t} and sends them to the back. {t} is Slowed.'}]},
  rubberstamp:{level:25,hp:400,pow:29,grit:21,warmth:16,cool:13,pep:12,weak:['kinetic','sparkle'],resist:['splash'],step:2,
    acts:[{name:'Stamp',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} stamps {t}.'},
          {name:'Stomp',stat:'pow',mult:.95,elem:'kinetic',target:'one',msg:'{e} stomps down on {t}’s foot.'},
          {name:'Denied',stat:'pow',mult:.9,elem:'kinetic',target:'one',every:3,status:['gritdown',2],msg:'DENIED! {e} comes down hard on {t}’s name. {t} feels squashed.'}]}
});
Object.assign(B2_FORMATIONS,{
  censor:[['censor','front']],
  deadletter:()=>Math.random()<.5?[['deadletter','front'],['deadletter','front']]:[['deadletter','front'],['rubberstamp','back']],
  rubberstamp:[['rubberstamp','front'],['deadletter','back']]});
const B2_CH19_LIKES=['amy.pep','rose.silly','grace.dance','tom.starter','tnb.coffee_run'];
Object.assign(B2_GRUMP,{
  censor:{goal:520,grumpy:'He is not angry. He has just never once been given anything to deliver, so he is very good at saying no.',likes:B2_CH19_LIKES},
  deadletter:{goal:200,grumpy:'It has been returned to sender nine hundred times. It would like, once, to be opened.',likes:B2_CH19_LIKES},
  rubberstamp:{goal:215,grumpy:'It only knows one word, and it is no. It has been very lonely with that word.',likes:B2_CH19_LIKES}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{censor:190,deadletter:42,rubberstamp:46});
B2_SHAKE_STYLE.censor={word:'REDACTED',add:'deadletter',
  open:e=>'The Claim Desk lamp clicks on. '+cap(e.def.the)+' looks up from his ledger. His face is a single black bar with two small white eyes in it, and he is already writing something down.',
  open2:'Every third turn he calls STRIKE IT OUT on everyone. It shows on the turn ribbon first. Tom is not here. Grace, Rose, Amy and TNB are out front, and Nara waits on the bench (▼ Bag). Do not let him write the name.',
  phase:N=>N+' lifts the stamp over the ledger. Every lamp in the Office flickers. Something is coming, very fast.',
  adds:n=>n>1?'Two Dead Letters slide off the belts!':'A Dead Letter slides off the belt!',addSfx:'whoosh',
  idle:N=>N+' blots the ledger. Slowly. Carefully. One letter at a time.',
  brace:(N,e)=>N+' raises the stamp for TOTAL REDACTION next turn! Break the stamp: '+e.shield.need+' Sparkle or Cozy hits, or a Tombo.',
  warn:'The marker squeaks across the ledger. STRIKE IT OUT next turn hits everyone. Heal up after!'};

// ---------- Tom bursts back in ----------
// Phase 2 begins the first time the Censor acts below half HP. Before it does anything, Tom comes through the floor of the Claim Desk.
function b2TomReturns(e,carryOn) {
  const ex=B2.party.filter(p=>!B2_NEVER_SIT.includes(p.id)&&p.id!=='nara');
  const out=B2.party.find(p=>p.id==='amy')||ex[0]||null;
  if(!out||B2.party.some(p=>p.id==='tom')) { carryOn(); return; }
  const idx=out.idx;
  hero.hp=hero.maxHp; if(hero.maxHp==null) hero.hp=1;
  const tom=b2PartyUnit('tom',out.lvl,idx,true);
  tom.ct=Math.max(0,b2Delay(tom,.2));
  const N=cap(e.def.the);
  enqueue(()=>{ b2Msg('Every page in the Office turns white at once. Something is coming up through the floor of the Claim Desk, very fast, and it sounds extremely annoyed.'); e.shake=.8; sfx.charge&&sfx.charge(); b2Render(); },2600,
    ()=>{ b2Msg('A column of warm light punches through the ceiling of the belt hall, and stays there.'); sfx.levelChime&&sfx.levelChime(); b2Render(); },1800,
    ()=>{
      B2.reserve=(B2.reserve||[]).concat([out]);
      B2.party[idx]=tom; B2.units=[...B2.party,...B2.foes]; b2BenchSync();
      const f=battle.fx[idx]; if(f) { for(const k in f) if(typeof f[k]==='number') f[k]=0; f.poseK=''; f.path=null; f.koAt=null; f.hop=.6; f.flash=.7; }
      if(B2.lastTarget===out) B2.lastTarget=null;
      setFlag('ch19-tomback',true);
      b2PopParty&&b2PopParty(tom,'TOM!','#fff6c8',-20); sfx.ding&&sfx.ding(); b2Render();
      b2Msg('TOM BURSTS IN! He lands in '+out.name+'’s spot with a thermos in one hand and his glasses on crooked.');
    },2400,
    ()=>b2Msg('Tom: “Sorry I am late. I was written out of the schedule. Did anybody eat?”'),2600,
    ()=>b2Msg(out.name+' takes a seat on the bench, quite pleased. (▼ Bag, BENCH CALL, swaps '+(out.id==='amy'?'her':'them')+' back in.)'),2200,
    ()=>b2Msg('Tom looks at '+N+', and at the black bar over his face. “No. You may not have my name. I have been using it for years.”'),2600,
    ()=>carryOn());
}
const LE_b2BossTurn_ch19=b2BossTurn;
b2BossTurn=function(e) {
  if(e.boss==='censor'&&e.phase===2&&!e.tomIn) { e.tomIn=true; return b2TomReturns(e,()=>LE_b2BossTurn_ch19(e)); }
  return LE_b2BossTurn_ch19(e);
};
TUTORIALS.ch19={tips:[
  {id:'strike',who:'*',text:'Every third turn he calls STRIKE IT OUT on everyone. It shows on the turn ribbon first. Heal up after! Nara is on the bench: ▼ Bag, BENCH CALL.'},
  {id:'stamp',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'TOTAL REDACTION next turn! Break the stamp: 2 Sparkle or Cozy hits, or any Tombo.'}]};
