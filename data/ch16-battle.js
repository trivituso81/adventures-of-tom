'use strict';
// data/ch16-battle.js — Chapter 16 battle: Marlowe Transformed on the Square. Loaded after data/ch15-battle.js.
// He fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE), same as HUSH-9 and the Drill Worm: every third turn a telegraphed OVEREXPOSURE on
// everyone; below half HP two Grey Notes drift in and he braces behind the eclipse for TOTAL ECLIPSE (2 Chatter, Splash or Kinetic hits, or any
// Tombo, break it). There is NO kind route: this is the tragedy chapter, and he is not listening. The fight is Tom, Amy, TNB and Nara (Grace and Rose are
// on their way to Cab 7). When he falls there is no victory jingle, no cheering, no level-up chime: the sound is switched off until the
// aftermath scene ends (ch16QuietOn / ch16QuietOff, scenes-ch16.js calls the off switch), and the only sound after that is wind.
Object.assign(B2_FOES,{
  marlowe16:{level:23,hp:2600,pow:38,grit:24,warmth:27,cool:22,pep:15,weak:['chatter','splash'],resist:[],step:4,boss:'marlowe16',noRun:true,
    acts:[{name:'Strike Through',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} draws a neat line through {t}.'},
          {name:'Desaturate',stat:'warmth',mult:.9,elem:'chatter',target:'one',msg:'{e} takes the color out of {t}’s next five minutes.'},
          {name:'Marginal Note',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['drowsy',2],msg:'{e} writes something small and final about {t}. {t} is Drowsy.'}],
    flop:{name:'Overexposure',stat:'warmth',mult:.95,elem:'chatter',target:'all',status:['drowsy',1],msg:'OVEREXPOSURE! {e} pulls the color out of everyone at once!'},
    rumble:{name:'Total Eclipse',stat:'pow',mult:1.55,elem:'kinetic',target:'all',msg:'TOTAL ECLIPSE! {e} lets the black disc swallow the ring!'},
    shield:{need:2,elems:['chatter','splash','kinetic']},add:'greynote'},
  greynote:{level:21,hp:250,pow:24,grit:15,warmth:16,cool:15,pep:12,weak:['chatter','splash','kinetic'],resist:[],step:2,
    acts:[{name:'Stick',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} sticks itself to {t}’s back.'},
          {name:'Flutter',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} flutters into {t}.'},
          {name:'Fade',stat:'warmth',mult:.8,elem:'chatter',target:'one',every:3,status:['drowsy',2],msg:'FADE! {e} drains the color out of {t}. {t} is Drowsy.'}]}
});
Object.assign(B2_FORMATIONS,{marlowe16:[['marlowe16','front']],greynote:[['greynote','front'],['greynote','back']]});
Object.assign(B2_GRUMP,{
  marlowe16:{goal:999999,grumpy:'He is not grumpy. He is not anything. The amber got there first.',likes:[]},
  greynote:{goal:190,grumpy:'Somebody wrote LESS on it and left. It has been waiting for somebody to cross it out.',likes:['amy.pep','tnb.coffee_run','tom.starter','rose.silly','grace.dance']}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{marlowe16:160});
B2_SHAKE_STYLE.marlowe16={word:'LESS',add:'greynote',
  open:e=>'The wind drops. '+cap(e.def.the)+' stands in front of the two stone figures with the eclipse burning behind his head, and the grass goes grey around his feet.',
  open2:'Every third turn he calls OVEREXPOSURE on everyone. It shows on the turn ribbon first. There is no one to bench. This is the four of you.',
  phase:N=>N+' turns the eclipse up. The sky goes the color of an old photograph.',
  adds:n=>n>1?'Two Grey Notes peel off the air!':'A Grey Note peels off the air!',addSfx:'whoosh',
  idle:N=>N+' straightens his tie. Over and over.',
  brace:(N,e)=>N+' braces behind the eclipse for TOTAL ECLIPSE next turn! Break it: '+e.shield.need+' Chatter, Splash or Kinetic hits, or a Tombo.',
  warn:'The ring goes thin and bright. OVEREXPOSURE next turn hits everyone. Heal up after!'};

// ---------- The quiet: sound off from the moment he falls until the aftermath scene ends ----------
let CH16_QUIET=null;
function ch16QuietOn() { if(CH16_QUIET===null) { CH16_QUIET=sound.enabled; sound.enabled=false; } }
function ch16QuietOff() { if(CH16_QUIET!==null) { sound.enabled=CH16_QUIET; CH16_QUIET=null; } }
// A little wind: filtered noise, ignores the quiet switch (it is the only thing allowed to be heard).
function ch16Wind(sec=4,vol=.05) {
  const c=sound.ctx; if(!c||document.hidden||CH16_QUIET===false) return;
  try {
    const n=Math.floor(c.sampleRate*sec),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(); src.buffer=buf; f.type='lowpass'; f.frequency.value=380;
    const t=c.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+sec*.4); g.gain.linearRampToValueAtTime(0,t+sec);
    f.frequency.setValueAtTime(260,t); f.frequency.linearRampToValueAtTime(520,t+sec*.5); f.frequency.linearRampToValueAtTime(240,t+sec);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(t); src.onended=()=>{ try { g.disconnect(); } catch(e) {} };
  } catch(e) {}
}
const LE_b2Win_ch16=b2Win;
b2Win=function() {
  if(!B2.foes.some(f=>f.boss==='marlowe16')) return LE_b2Win_ch16.apply(this,arguments);
  ch16QuietOn();
  battle.state='busy'; B2.ui='busy'; b2Render();
  const line=MONSTERS.marlowe16.die;
  const steps=[()=>{ b2Msg(line); },2600];
  if(B2.cfg.npc) steps.push(()=>{ const R=b2RewardsData(); R.title='...'; R.line=line; R.puddle=false; b7ShowCard(R,()=>{ b2WriteBack(); b2End('win'); }); });
  else steps.push(()=>{ b2WriteBack(); b2End('win'); });
  enqueue(...steps);
};
const LE_b2End_ch16=b2End;
b2End=function(res) { if(res!=='win') ch16QuietOff(); return LE_b2End_ch16.apply(this,arguments); };
