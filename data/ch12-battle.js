'use strict';
// data/ch12-battle.js — Chapter 12 battle numbers: Gridlock Prime. Loaded after engine/battle2.js (it adds to B2_SHAKE_STYLE).
// Gridlock Prime fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE): every third turn a telegraphed Rush Hour on everyone.
// Below half HP two Gridlocks merge in and it flips every light red for TOTAL GRIDLOCK behind a shield (2 Kinetic or Splash hits,
// or any Tombo; Run With Us, Mommy! is the hinted answer). Un-Grump route: GIVE IT A GREEN LIGHT x3.
const B2_GREEN_LINES={
  tom:['You’ve been red a long time. Go. Green light. I’ll hold the door.','Nobody is late. Take the lane. I’ll signal for you.'],
  grace:['Green light! I’m the crossing guard! I’ll film it. Please like and subscribe.','Go! Go go go! Nobody is ever going to honk at you again!'],
  rose:['Green means GO! Red means stop! Purple means ice cream! You can go!','You’re the biggest car! You get to go first! I’ll wave!'],
  amy:['You’re clear. Signal, check your mirror, and go. I’ve got the crosswalk.','Go. I’ve always got the crosswalk. Nobody gets hit on my watch.'],
  tnb:['Hey. Buddy. Take the green. I’ll fix the light after. That’s what I do.','It’s okay to go first. I’ll hold the door. And the light.'],
  nara:['Nara sits at the curb and watches it very closely. Then she wags, once. Go.'],
  _:['You can go! Take the green!']};
Object.assign(B2_FOES,{
  gridlockprime:{level:16,hp:1380,pow:31,grit:20,warmth:21,cool:15,pep:13,weak:['splash','chatter'],resist:[],step:4,boss:'gridlockprime',noRun:true,
    praise:{label:'GIVE IT A GREEN LIGHT',sub:'Free · it has been red since the greying',need:3,tag:'GO',
      react:['Gridlock Prime’s headlights lift off the road. \"...Go? Go where?\"','The yellow lamp comes on, very softly. \"Nobody ever turned me green.\"']},
    acts:[{name:'Honk',stat:'warmth',mult:.9,elem:'chatter',target:'one',msg:'{e} honks at {t}. For a very long time.'},
          {name:'Merge',stat:'pow',mult:1.05,elem:'kinetic',target:'one',msg:'{e} merges into {t} without signaling.'},
          {name:'Rubbernecking',stat:'warmth',mult:.8,elem:'chatter',target:'one',status:['slow',2],msg:'{e} slows right down to stare at {t}. {t} is Slowed.'}],
    flop:{name:'Rush Hour',stat:'pow',mult:1,elem:'kinetic',target:'all',msg:'RUSH HOUR! {e} floors it into everyone!'},
    rumble:{name:'Total Gridlock',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'TOTAL GRIDLOCK! {e} locks all four lanes and leans on the horn!'},
    shield:{need:2,elems:['kinetic','splash']},add:'gridlock'}
});
Object.assign(B2_FORMATIONS,{gridlockprime:[['gridlockprime','front']]});
Object.assign(B2_GRUMP,{
  gridlockprime:{goal:540,grumpy:'Every light on the block has been red since Marlowe greyed it out. Nobody ever let it go.',likes:['amy.pep','rose.silly','tom.starter','grace.dance','ff2']}});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{gridlockprime:110});
B2_SHAKE_STYLE.gridlockprime={word:'GRIDLOCK',add:'gridlock',
  open:e=>'Every light on Jefferson turns red at once. '+cap(e.def.the)+' rolls into the intersection and parks across all four lanes.',
  open2:'Every third turn it floors Rush Hour on everyone. It shows on the turn ribbon before it happens.',
  phase:N=>N+' leans on the horn. Every car on the block answers.',
  adds:n=>n>1?'Two Gridlocks merge in without signaling!':'A Gridlock merges in without signaling!',addSfx:'whoosh',
  idle:N=>N+' idles. Loudly. Menacingly.',
  brace:(N,e)=>N+' flips every light to red for TOTAL GRIDLOCK next turn! Break the red light: '+e.shield.need+' Kinetic or Splash hits, or a Tombo.',
  warn:'All the lights go red. RUSH HOUR next turn hits everyone. Heal up after!'};
