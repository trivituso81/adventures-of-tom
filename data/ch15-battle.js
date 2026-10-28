'use strict';
// data/ch15-battle.js — Chapter 15 battle: HUSH-9 Final Form at the dinner table. Loaded after data/ch14-battle.js.
// It fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE), same as the Drill Worm in chapter 13: every third turn a telegraphed DEAD AIR
// on everyone; below half HP two Hushlings shush in and it braces behind its hush chip for TOTAL SILENCE (2 Chatter or Kinetic hits, or any Tombo,
// break the chip: noise is what it cannot stand). Un-Grump route: PULL UP A CHAIR x3 (nobody has ever saved it a seat).
// All four of the table who are not out front (Deedee, Boppy, TNB, Nara, whoever is on the bench) are reserves: ▼ Bag, BENCH CALL
// (engine/benchcall.js) swaps the fourth slot. Tom, Grace and Rose never sit out.
const B2_HUSH_LINES={
  tom:['There’s a chair at the end of the table. It’s folding. It’s yours. Please sit down.','You’ve been standing in the doorway of every room for years. Come in. We’ll shuffle over.'],
  grace:['Okay, so it’s a very small quiet car, and it’s my grandparents’ house, and you’re invited to dinner. Subscribe to dinner!','You can sit next to me. I’ll only tell you to be quiet during my videos. That’s a rule for everybody.'],
  rose:['You can sit by Nara! Nara loves everybody! Nara already loves you!','I made you a name tag. It says HUSH. I spelled the H very carefully.'],
  amy:['Dinner is at six. You’re not late. Late is when you don’t come. Sit.','I have taught a room of thirty kids with a recorder each. You are not the loudest thing I have handled. Sit.'],
  deedee:['Sit, sit, you’re too thin. Even a train. Who wants rhubarb crisp? Everyone. Even the train.','Oh, honey. Nobody ever saved you a seat? Here. Right here next to me.'],
  boppy:['Sit down. Take the weight off. My back understands better than anybody.','Pull up a chair. I’ll tell you about my stomach. It’s loud, but you’ll live.'],
  tnb:['I set you a place. Fork on the left. I’m a server. It’s how I say hello.','Hey. I have a thermos. It’s very quiet cocoa. Sit with us a minute.'],
  nara:['Nara trots to the end of the table and sits down in the ninth chair herself. Come on. Obviously.'],
  _:['Pull up a chair.']};
Object.assign(B2_FOES,{
  hush9final:{level:21,hp:2300,pow:36,grit:23,warmth:25,cool:21,pep:15,weak:['chatter','kinetic'],resist:[],step:4,boss:'hush9final',noRun:true,
    praise:{label:'PULL UP A CHAIR',sub:'Free · nobody has ever saved it a seat',need:3,tag:'WELCOME',
      react:['HUSH-9’s cooling fans slow down. “...A seat? Whose seat?”','Its grille crackles, very softly. “Nobody has ever pulled out a chair for the Quiet Car.”']},
    acts:[{name:'Shush',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} holds its glove up at {t}. Everything goes very soft.'},
          {name:'Quiet Roll',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} rolls into {t} without a sound.'},
          {name:'Mute',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['drowsy',2],msg:'{e} presses its grille to {t}. “Shh.” {t} is Drowsy.'}],
    flop:{name:'Dead Air',stat:'warmth',mult:.95,elem:'chatter',target:'all',status:['drowsy',1],msg:'DEAD AIR! {e} pulls the sound out of the whole room!'},
    rumble:{name:'Total Silence',stat:'pow',mult:1.5,elem:'chatter',target:'all',msg:'TOTAL SILENCE! {e} turns the hush chip all the way up!'},
    shield:{need:2,elems:['chatter','kinetic']},add:'hushling'}
});
Object.assign(B2_FORMATIONS,{hush9final:[['hush9final','front']]});
Object.assign(B2_GRUMP,{
  hush9final:{goal:640,grumpy:'It has never once been invited to anything. It thinks quiet is the same as safe, and it has never stood in a room this loud that was this warm.',
    likes:['rose.silly','grace.dance','amy.pep','tnb.coffee_run','deedee.hug','tom.starter','boppy2','ff2']}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{hush9final:140});
B2_SHAKE_STYLE.hush9final={word:'SHHH',add:'hushling',
  open:e=>'The dining room goes silent. '+cap(e.def.the)+' stands in the doorway with its glove raised, and the candles lean away from it.',
  open2:'Every third turn it calls DEAD AIR on everyone. It shows on the turn ribbon first. ▼ Bag, BENCH CALL swaps in someone from the table.',
  phase:N=>N+' turns the hush chip up. The silverware stops ringing.',
  adds:n=>n>1?'Two Hushlings shush in under the door!':'A Hushling shushes in under the door!',addSfx:'whoosh',
  idle:N=>N+' stands very still. It is not breathing audibly.',
  brace:(N,e)=>N+' braces behind its chip for TOTAL SILENCE next turn! Break the chip: '+e.shield.need+' Chatter or Kinetic hits, or a Tombo. Noise is what it cannot stand.',
  warn:'The room goes pale. DEAD AIR next turn hits everyone. Heal up after!'};

// ---------- Reserves: the whole table that is not out front ----------
const LE_b2Start_ch15=b2Start;
b2Start=function(cfg) {
  const ids=(cfg.foes||[]).map(f=>Array.isArray(f)?f[0]:f.id);
  if(ids.includes('hush9final')&&!cfg.reserveIds&&typeof benchMembers==='function') {
    cfg.reserveIds=benchMembers().map(m=>m.id);
    cfg.levels=Object.assign({},cfg.levels||{});
    for(const id of cfg.reserveIds) if(!cfg.levels[id]) cfg.levels[id]=cfg.levels.tom||memberById(id).level||13;
  }
  return LE_b2Start_ch15(cfg);
};

// ---------- The dining room picture (bgs/18-dinner-table.png) ----------
Object.assign(BG_FILES,{dinner:'18-dinner-table'});
{ const im=new Image(); im.src='bgs/'+BG_FILES.dinner+'.png'; BG_IMG.dinner=im; }
const LE_battleBgKey_ch15=battleBgKey;
battleBgKey=function() {
  if(B2.active&&B2.foes&&B2.foes.some(f=>f.boss==='hush9final')) return 'dinner';
  return LE_battleBgKey_ch15();
};
