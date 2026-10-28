'use strict';
// data/scenes-ch14.js — Part 2, Chapter 14 "The Rikers Wall of Rivituso Row". Loaded after data/scenes-ch13.js.
// Chapter 13 ended with Boppy at the Rivituso door in the Warden's gold plate. The girls come up the handcar from the Sub-Rail and rejoin the party
// (setGirlsAway(false) clears the cab-stand copies); TNB and Nara stay to hold the breach against Vance's Auditors. Deedee is on the porch, half in
// amber, looping a rhubarb crisp. Rose eats the crisp (amber is warmth that got stuck; it needs somewhere to go). Boppy cannot be hit: the fight is
// DEFEND, cheering him up, jokes, and Deedee's MOON & BACK (data/ch14-battle.js). After it: the plate melts, "I just didn't want to get too old to
// keep you all safe," the Tombo Nobody Gets Past Us (boppy2) unlocks, and Deedee and Boppy go back inside.
// Flags, in order: ch14-open (the scene played; the girls are back), ch14-deedee (Deedee freed from the loop), ch14-gate (the Warden fight has
// been started), battle:warden ('win'), ch14-after (the after scene played), ch14-done (CHAPTER 14 COMPLETE).
const CH14={mode:'full',chapter:14};
Object.assign(items,{
  wardenhelm:{name:'Warden’s Bucket',icon:'🪣',slot:null,keepsake:true,desc:'The gold helm, after the gold ran off it. It is a bucket. Rose has named it Sir Bucket. Boppy asked that it not be mentioned again.'}});
const CH14_DEEDEE_LINES=['Rhubarb crisp, nine minutes. Rhubarb crisp, nine minutes. Rhubarb crisp...','The amber is up to her waist. She is smiling. She is holding a tray, and she is not looking at it.'];
const CH14_DEEDEE_FREE_LINES=['I can’t walk yet, the glass has my feet. Go on, Tommy. Don’t hit him. Make him laugh. I’ll know when.','He laughs when he’s scared. He always has. Go on.'];
const CH14_BOPPY_LINES=['The armor hums. Boppy does not move. “Halt.”','“Go home, Tom. The glass stays up. That’s the deal.”','His eyes keep sliding to the porch. Every time they do, the hum gets louder.'];
const CH14_BOPPY_WAIT_LINES=['“Halt.” His voice shakes on it. “Your mother is fine. She’s baking. Don’t look at her.”','The armor hums. He is not looking at the porch. He is working very hard at not looking at the porch.'];
function ch14Place(x,y,dir) {
  currentMap=worlds.row; player.x=x; player.y=y; player.facing=dir||'up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
const ch14Boppy=()=>{ const row=worlds.row; return row&&row.npcs.find(n=>n.name==='Boppy'&&n.armor!==undefined&&n.scripted); };
const ch14Deedee=()=>{ const row=worlds.row; return row&&row.npcs.find(n=>n.porch); };

SCENES.ch14Open=[
  {flag:'ch14-open',value:'pending'},
  {fade:'out',time:.8},
  {card:14,time:3.2},
  {call:()=>{ setFlag('ch14-open','pending'); sfx.travel&&sfx.travel(); ch14Place(18,10,'up'); }},
  {fade:'in',time:.7},
  {talk:'Tom',lines:['Dad. It’s Tom. I’m right in front of you.']},
  {talk:'Boppy',lines:['Halt.']},
  {talk:'Amy',lines:['He said that before. He’s going to say it again. He’s going to say it until we do something about it.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'TNB',lines:['Tom. Behind us, down the stairs, something is coming up the tunnel. A lot of clipboards. I counted fourteen.']},
  {talk:'Nara',lines:['Nara growls, low. She has opinions about clipboards.']},
  {talk:'TNB',lines:['Sol’s handcar is right behind them with the girls. I’ll send them up. Nara and I will hold the breach. Somebody has to be at the bottom of the stairs to say no.']},
  {talk:'Tom',lines:['You’re staying in a tunnel full of Auditors.']},
  {talk:'TNB',lines:['I used to carry coffee through a film set at five in the morning. I can handle an Auditor.']},
  {talk:'Amy',lines:['Take the thermos. They hate a thermos.']},
  {talk:'TNB',lines:['I never leave without it. Go fix the door, Tom. I’ll fix the tunnel.']},
  {walk:'tnb',to:[[17,11],[16,11]],speed:.3},
  {face:'tom',dir:'left'},
  {hearts:'tom'},{hearts:'tnb'},
  {talk:'Tom',lines:['Be careful. Please. I mean that in a very specific, very annoying way.']},
  {talk:'TNB',lines:['I know. I’ll be careful in the exact way you’re being annoying about right now.']},
  {all:[
    {seq:[{walk:'tnb',to:[[15,11],[12,11],[9,11],[6,11],[3,11]],speed:.34}]},
    {seq:[{walk:'nara',to:[[15,11],[12,11],[9,11],[6,11],[3,11]],speed:.36}]}]},
  {leave:'tnb',quiet:true},{leave:'nara',quiet:true},{call:()=>{ setChapter(14); placeFollowers(); }},
  {face:'tom',dir:'up'},
  {call:()=>sfx.honk&&sfx.honk()},
  {join:'grace',quiet:true},{join:'rose',quiet:true},{call:()=>placeFollowers()},
  {place:'grace',at:[11,11],dir:'right'},{place:'rose',at:[10,11],dir:'right'},
  {all:[
    {seq:[{walk:'grace',to:[[12,11],[13,11],[14,11],[15,11],[16,11],[17,11]],speed:.4}]},
    {seq:[{walk:'rose',to:[[11,11],[12,11],[13,11],[14,11],[15,11],[16,11]],speed:.4}]}]},
  {talk:'Grace',lines:['MOMMY. We took a handcar. It has a HORN.']},
  {talk:'Rose',lines:['I honked it at the tunnel and the tunnel honked BACK. I said it was rude. It said honk.']},
  {talk:'Amy',lines:['Sol was supposed to keep you.']},
  {talk:'Grace',lines:['Sol said, and I quote, “I’m not stopping them. I’ve met them.”']},
  {talk:'Rose',lines:['Is Boppy a statue? Can I climb him?']},
  {talk:'Boppy',lines:['...Rose. Grace. Go back to the cab.']},
  {talk:'Rose',lines:['Boppy, you have a bucket on your head.']},
  {talk:'Boppy',lines:['It’s a helm.']},
  {talk:'Rose',lines:['It’s a bucket.']},
  {talk:'Grace',lines:['Why is Boppy a knight? Is this a quest? Is there a quest log? Do I get a badge?']},
  {talk:'Tom',lines:['Girls. Stay behind me. He’s not himself.']},
  {talk:'Amy',lines:['He’s completely himself. That’s the problem. He’s himself with a gate.']},
  {talk:'Grace',lines:['So. Where’s Deedee?']},
  {talk:'Boppy',lines:['Inside. She’s fine. She’s making a crisp. Don’t look at the porch.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Rose',lines:['Boppy. There’s a Deedee on the porch.']},
  {talk:'Boppy',lines:['That’s a decoration.']},
  {talk:'Rose',lines:['She waved.']},
  {talk:'Tom',lines:['Okay. First the porch. Then Dad. Nobody touches the armor. Not even a little. Rose, that includes you.']},
  {talk:'Rose',lines:['I wasn’t going to touch it. I was going to boop it.']},
  {talk:'Amy',lines:['Rose.']},
  {talk:'Rose',lines:['A very small boop.']},
  {trace:'ch14-open'},{hearts:'amy'},
  {toast:'Goal: Deedee is on the porch (left of the Rivituso door), frozen in amber. Talk to her first. Do not hit Boppy.',time:7},
  {flag:'ch14-open'},
  {save:true}
];

SCENES.ch14Deedee=[
  {flag:'ch14-deedee',value:'pending'},
  {talk:'Deedee',lines:['Rhubarb crisp, nine minutes. Rhubarb crisp, nine minutes. Hello, sweetie. Rhubarb crisp, nine minutes.']},
  {talk:'Amy',lines:['Mom. It’s Amy. Mom, look at me.']},
  {talk:'Deedee',lines:['Hello, Amy. Rhubarb crisp, nine minutes. Do you want a bite? Rhubarb crisp. Nine minutes.']},
  {talk:'Tom',lines:['She’s looping. Look at the tray. It’s the same crisp. Every time. It’s fresh, it’s perfect, and nobody ever eats it.']},
  {talk:'Tom',lines:['Amber is warmth that got stuck. She’s been giving it to nobody for hours. It needs somewhere to go.']},
  {talk:'Rose',lines:['Maybe nobody ate it.']},
  {talk:'Grace',lines:['Rose. That is the smartest thing you have said all week.']},
  {talk:'Rose',lines:['I say smart things every day. They just come out as noise.']},
  {walk:'rose',to:[[16,10]],speed:.3}, {face:'rose',dir:'up'},
  {talk:'Rose',lines:['Deedee. I’m going to eat the crisp now. Okay? Okay.']},
  {call:()=>sfx.pickup&&sfx.pickup()},
  {wait:1.4},
  {talk:'Rose',lines:['...It’s SO good. It’s the best one. Deedee, it’s the best one you ever made.']},
  {call:()=>{ sfx.charge&&sfx.charge(); const d=ch14Deedee(); if(d) d.lines=CH14_DEEDEE_FREE_LINES; }},
  {wait:1.6},
  {talk:'Deedee',lines:['Oh. Somebody ate it. Oh, Rosie.']},
  {talk:'Deedee',lines:['Oh. I was making that for a long time, wasn’t I.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Amy',lines:['Mom?']},
  {talk:'Deedee',lines:['Amy. Tommy. My girls. How long was I gone?']},
  {talk:'Tom',lines:['A while.']},
  {talk:'Deedee',lines:['Your father put on that armor. He said the glass would keep us all safe. He’s been standing out there for hours and he hasn’t sat down. Not once. Not for his back.']},
  {talk:'Deedee',lines:['He thinks the armor takes the ache away. It doesn’t. It just stops him from feeling it. There’s a difference. I was a nurse for forty years. There is a very big difference.']},
  {talk:'Grace',lines:['Can you walk?']},
  {talk:'Deedee',lines:['The glass has my feet. It’s up to my knees. I can’t go anywhere. But I can see him.']},
  {talk:'Deedee',lines:['Don’t hit him, Tommy. He can’t be hit. He hates being hit and it makes the gold stronger. Make him laugh. He laughs when he’s scared. He did at our wedding.']},
  {talk:'Rose',lines:['I have a whole bit.']},
  {talk:'Grace',lines:['I have a whole VIDEO.']},
  {talk:'Amy',lines:['Dad used to run cross country. If I can get him to walk a lap, I can get him to talk.']},
  {talk:'Deedee',lines:['When he’s ready, I’ll call out. You won’t miss it. I’ve been calling that man for fifty years.']},
  {talk:'Tom',lines:['We’ll be careful.']},
  {talk:'Deedee',lines:['You were always the careful one. Now be the kind one. Go.']},
  {trace:'ch14-deedee'},{hearts:'tom'},{hearts:'amy'},
  {toast:'Goal: face Warden Boppy at the Rivituso door. Do not hit him. DEFEND, cheer him up, make him laugh.',time:7},
  {flag:'ch14-deedee'},
  {save:true}
];

SCENES.ch14Gate=()=>[
  {flag:'ch14-gate',value:'pending'},
  ...(flag('ch14-gate')==='pending'||flag('ch14-gate')===true?[
    {talk:'Boppy',lines:['Halt. Again. Round two.']},
    {talk:'Amy',lines:['Slower. Nobody hit him. Guard, cheer him up, make him laugh.']}]:[
    {talk:'Tom',lines:['Dad. We’re not here to fight you.']},
    {talk:'Boppy',lines:['Then you’re here to leave.']},
    {talk:'Tom',lines:['Mom’s on the porch. She’s awake.']},
    {call:()=>sfx.charge&&sfx.charge()},
    {talk:'Boppy',lines:['She is NOT. She’s fine. She’s baking. That’s the deal. Nobody gets hurt, nobody gets old, nobody gets left.']},
    {talk:'Boppy',lines:['Stand down, Tommy. I don’t want to hurt you.']},
    {talk:'Tom',lines:['Then don’t. And I won’t hurt you either.']},
    {talk:'Boppy',lines:['The gold hums. It likes it when somebody swings. I can’t stop it from liking it.']},
    {talk:'Rose',lines:['So we just don’t swing!']},
    {talk:'Grace',lines:['We’re the opposite of swinging. We’re the family that shows up.']},
    {talk:'Boppy',lines:['...Last warning.']},
    {talk:'Tom',lines:['Noted.']},
    {trace:'ch14-gate'},
    {toast:'Tip: hitting him heals his armor. DEFEND (Tom), Amy’s PEP TALK, Grace’s DANCE, Rose’s SILLY and ▼ Bag, MAKE HIM LAUGH, are the way through.',time:7}]),
  {flag:'ch14-gate'},
  {battle:()=>{ const b=ch14Boppy(); if(b) Object.assign(b,{monster:'warden',tier:0}); return b; },tut:'ch14'},
  {call:()=>{ const b=ch14Boppy(); if(b) b.monster=null; }},
  {if:()=>flag('battle:warden')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Up. Walk it off. He hits like a dad who loves you and is very upset about it.']},
    {toast:'Face Warden Boppy (at the Rivituso door) and press A to try again. Everyone is healed.',time:5}],else:[]}
];

SCENES.ch14After=()=>[
  {flag:'ch14-after',value:'pending'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['The gold goes soft. Then it runs, slow, down the front of him, like warm wax, and soaks into the porch. The helmet is the last to go.']},
  {call:()=>{ const b=ch14Boppy(); if(b) b.armor=false; sfx.thud&&sfx.thud(); }},
  {wait:.8},
  {talk:'Rose',lines:['The bucket rolled down the steps. Can I have it? Is it mine?']},
  {give:'wardenhelm'},
  {talk:'Boppy',lines:['Ow.']},
  {talk:'Boppy',lines:['Ow. My back. My back is back.']},
  {talk:'Grace',lines:['The ache came back!']},
  {talk:'Boppy',lines:['It never left. I just had a bucket on it.']},
  {talk:'Tom',lines:['Dad.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Boppy',lines:['A man in a long coat came to the door. Very polite. He never took his hat off. He said he could stop the aches. Stop the slowing down.']},
  {talk:'Boppy',lines:['He said the girls would be safe. In the good part, forever. All I had to do was stand here.']},
  {talk:'Tom',lines:['And you said yes.']},
  {talk:'Boppy',lines:['I signed a thing. It said WARDEN on the top. I didn’t read the bottom.']},
  {talk:'Tom',lines:['Nobody reads the bottom.']},
  {talk:'Boppy',lines:['I’m seventy-some years old. Every year the girls get faster and I get slower. I’m not mad about it. I’m just... one day I won’t be able to catch you.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Boppy',lines:['I just didn’t want to get too old to keep you all safe.']},
  {hearts:'amy'},{hearts:'tom'},
  {wait:.8},
  {call:()=>{ const d=ch14Deedee(); if(d) { d.amber=false; d.lines=['Fifty years. You big nut.']; } sfx.whoosh&&sfx.whoosh(); }},
  {wait:.6},
  {talk:'Deedee',lines:['You big nut.']},
  {walk:'Deedee',to:[[17,9]],speed:.28}, {face:'Deedee',dir:'right'},
  {talk:'Deedee',lines:['We keep each other safe. That is the whole deal. That’s the only one. You don’t get to keep us safe alone.']},
  {talk:'Boppy',lines:['Deedee.']},
  {talk:'Deedee',lines:['Robert.']},
  {hearts:'tom'},
  {talk:'Rose',lines:['Is this the part where everybody cries?']},
  {talk:'Grace',lines:['Yes. Rose. Yes it is.']},
  {talk:'Grace',lines:['Boppy. You’re allowed to be slow. We’ll wait. I’ll film it. For the memories. I’ll pause and wait for you.']},
  {talk:'Rose',lines:['I’ll walk slow. I’ll walk like a snail. A snail wearing a hat.']},
  {talk:'Boppy',lines:['Rosie. That’s the best offer I’ve had in eleven years.']},
  {talk:'Amy',lines:['Dad. Come on. I’ll walk you in. Short laps. You can complain the whole time.']},
  {talk:'Boppy',lines:['My stomach is doing something.']},
  {talk:'Amy',lines:['There he is.']},
  {talk:'Tom',lines:['Vance said the girls would be safe in the good part, forever. We told him no once. He won’t take it well.']},
  {talk:'Tom',lines:['We always make our connection.']},
  {call:()=>{ setFlag('tombo:boppy2'); sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Boppy',lines:['Take the key, Tommy. It opens the gate. It also opens the door. It doesn’t matter which. Nobody gets past us.']},
  {talk:'Tom',lines:['Nobody gets past us.']},
  {toast:'New Tombo: Nobody Gets Past Us (Tom and Boppy). Boppy is back inside with Deedee.',time:8},
  {trace:'ch14-wrap'},{hearts:'tom'},{hearts:'amy'},
  {walk:'Boppy',to:[[18,8]],speed:.26},
  {walk:'Deedee',to:[[18,9]],speed:.26},{walk:'Deedee',to:[[18,8]],speed:.26},
  {call:()=>{ for(const nm of ['Boppy','Deedee']) { const n=currentMap.npcs.find(m=>m.scripted&&m.name===nm); if(n) n.hidden=true; } sfx.doorIn&&sfx.doorIn(); }},
  {despawn:'Boppy'},{despawn:'Deedee'},
  {flag:'ch14-after'},
  {fade:'out',time:.8},{card:14,done:true,time:3.4},{flag:'ch14-done'},{fade:'in',time:.8},
  {toast:'Goal: Chapter 15 is coming. The dinner table is set for eight.',time:7},
  {call:()=>showToast&&showToast('CHAPTER 14 COMPLETE! Chapter 15 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch14-open',map:'row',when:{mode:'full',chapter:13,flag:'ch13-done',test:S=>!S.flags['ch14-open']},scene:'ch14Open'},   // test, not notFlag: the chapter jump must not mark it done
  {id:'ch14-after',map:'row',when:{...CH14,flag:{'battle:warden':'win'},notFlag:'ch14-after'},scene:'ch14After'}
);

// World state. While chapter 14 is open: Boppy stands armored at the Rivituso door (the chapter 13 rule keeps him there too), Deedee is on the
// porch (amber to the waist) until the after scene, and the neighbors on the Row are in amber. Afterwards the Row thaws and both are back inside.
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const row=worlds.row; if(!row) return;
  const live=STORY.chapter===14&&flag('ch14-open')&&!flag('ch14-after');
  if(live&&!intro.active&&!row.npcs.some(n=>n.porch)) {
    const d=actor('Deedee',16,9,'pip',flag('ch14-deedee')?CH14_DEEDEE_FREE_LINES:CH14_DEEDEE_LINES);
    Object.assign(d,{sheet:'deedee',duration:.84,scripted:true,porch:true,amber:true,tier:0,maxHp:1,defeatedUntil:0,roam:0,facing:'down',monster:null});
    row.npcs.push(d);
  }
  if(!live) row.npcs=row.npcs.filter(n=>!n.porch);
  for(const n of row.npcs) if(n.name==='Gus'||n.name==='Bean') n.amber=!!(STORY.chapter===14&&flag('ch14-open')&&!flag('ch14-after'));
  const b=ch14Boppy();
  if(b&&STORY.chapter===14&&!flag('ch14-after')) b.lines=flag('ch14-deedee')?CH14_BOPPY_WAIT_LINES:CH14_BOPPY_LINES;
  if(b&&(flag('ch14-after')||(STORY.chapter>14))) row.npcs=row.npcs.filter(n=>n!==b);
});
HOLD_RULES.push(n=>n.monster==='warden'||!!n.porch);
{ const tut=TUTORIALS; tut.ch14={tips:[
  {id:'nohit',who:'*',text:'You cannot beat him by hitting. Every hit makes the armor hum brighter. Be kind: DEFEND, cheer him up, make him laugh.'},
  {id:'guard',who:['tom'],dir:'down',care:1,text:'▼ DEFEND somebody. He cannot stand watching someone guard someone, and it takes the sting out of GATE SLAM.'},
  {id:'laugh',who:'*',dir:'down',care:1,text:'▼ Bag, MAKE HIM LAUGH. Three jokes. He laughs when he is scared.'},
  {id:'fav',who:['amy','grace','rose'],dir:'left',text:'PEP TALK, DANCE and SILLY are favorites: warm moves warm him fastest.'}]}; }

// ---------- Talking to Deedee on the porch and to Warden Boppy ----------
const LE_pressAction_ch14=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===14&&flag('ch14-open')&&!flag('ch14-after')&&currentMap.id==='row') {
    const t=facingTarget(),n=t&&t.kind==='npc'?t.value:null;
    if(n&&n.porch&&!flag('ch14-deedee')) { playScene('ch14Deedee'); return; }
    if(n&&n.scripted&&n.name==='Boppy'&&n.armor&&flag('ch14-deedee')&&flag('battle:warden')!=='win') { playScene('ch14Gate'); return; }
  }
  return LE_pressAction_ch14();
};
