'use strict';
// data/scenes-ch18.js — Part 2, Chapter 18 "No Touching, Please." Loaded after data/scenes-ch17.js.
// Flow: press A on the pinnacle lift in the Vault (ch18Open: card 18, the ride up) > the Chronos Loom Chamber, floor 60 (ch18Pinnacle: Vance, the Loom,
// the Unwriting Ray) > the survival fight (ch18Fight: data/ch18-battle.js, Tom steps in front of every ray, his HP bar turns to light) > ch18After:
// Tom is gone, the Loom's recoil throws everyone out of the tower > Jefferson Park at first light, TNB leading, Tom's portrait gone from the menu
// (engine/tom-gone.js) > ch18-done.
// The party all chapter: Tom, Grace, Rose, Amy out front, TNB and Nara on the bench (they walk with the party and stand in every scene; the fight is
// Tom, Grace, Rose and Amy). Nobody but Tom is ever hit.
// Flags: ch18-open, ch18-pinnacle, ch18-fight, battle:vance ('lose', set by the engine: the fight ends with the result 'erased'), ch18-after, tom-gone, ch18-done.
const CH18={mode:'full',chapter:18};
const CH18FX={light:null};   // the column of light where Tom stood (engine/ch18-render.js)
const ch18Vance=()=>findMonster('vance');
// Tom leaves: the switch, then TNB takes the lead (engine/tom-gone.js does the party and sprite work).
function ch18TomGone() {
  setFlag('tom-gone');
  tomGoneApply();
  if(typeof menuChar!=='undefined') menuChar=0;
  if(typeof b6Badge==='function') b6Badge();
}

SCENES.ch18Open=()=>[
  {flag:'ch18-open',value:'pending'},
  {talk:'Tom',lines:['The pinnacle lift opens without a sound. There is no button inside, no floor number. The walls are mirrors, and every one of us is in them.']},
  {talk:'Amy',lines:['Everybody in. Nobody lags behind. Nobody gets left on this floor.']},
  {talk:'Grace',lines:['Tata. I’m scared. I’m also coming. Both of those are true at the same time.']},
  {talk:'Tom',lines:['That is exactly the right amount of both.']},
  {talk:'Rose',lines:['I brought a pretzel for Deedee. It’s a little bit squished.']},
  {talk:'TNB',lines:['Squished is fine. I fix squished things for a living.']},
  {talk:'Tom',lines:['Stay behind me. All of you.']},
  {fade:'out',time:.8},
  {card:18,time:3.4},
  {call:()=>{ setChapter(18,{apply:false}); sfx.travel&&sfx.travel(); ch17Team('final'); ch17Place('towerpinnacle',10,12,'up'); }},
  {fade:'in',time:.8},
  {flag:'ch18-open'},
  {save:true}
];

SCENES.ch18Pinnacle=()=>[
  {flag:'ch18-pinnacle',value:'pending'},
  {call:()=>{ const v=ch18Vance(); if(v) { v.hidden=false; v.mscale=1.4; } }},
  {talk:'Tom',lines:['The lift opens on a round room made of clock. Gold thread runs floor to ceiling, thousands of strands, humming. In the middle stands a loom the size of a house. In front of it, a man in a long coat has his back to us. His hat is on.']},
  {talk:'Vance',lines:['Tom. Thank you for coming. Everyone, please, come in. Mind the threads. They are all somebody’s afternoon.']},
  {talk:'Amy',lines:['Where are my parents.']},
  {talk:'Vance',lines:['Warm. Downstairs, on a plinth, under glass. Exactly as you left them. I want you to understand I have taken very good care of them.']},
  {talk:'Grace',lines:['They’re STONE.']},
  {talk:'Vance',lines:['They are safe. There is a difference. I had to have it explained to me, too.']},
  {talk:'Rose',lines:['Are you the man who took all the coins?']},
  {talk:'Vance',lines:['I am the man who kept them. Gold remembers being warm. I only wanted it to keep remembering.']},
  {talk:'TNB',lines:['Okay. I fix things for a living. Whatever this is, it is structurally unsound.']},
  {talk:'Vance',lines:['Nothing is the same twice, Mr. TNB. You mend a cup, and it is a mended cup. I would like every cup to stay unbroken.']},
  {talk:'Tom',lines:['That is not how cups work.']},
  {talk:'Vance',lines:['Tom. You know why I wanted you. Two places that kept moving, and one man flying between them. You are not a traveler. You are the thread. If you stop, they stop. If you stay, they stay.']},
  {talk:'Vance',lines:['I will not hurt you. I will not hurt anyone. I will only finish the afternoon.']},
  {talk:'Tom',lines:['No, thank you. We have a connection to make.']},
  {talk:'Vance',lines:['I know. That is why this is so hard.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['The threads of the Loom lean. All of them, all at once, like a field in the wind. They gather into the brass lens at the end of his arm.']},
  {talk:'Vance',lines:['The Ray unwrites whatever it touches. It is very gentle. They will not remember being sad. Mrs. Gregori. Mr. TNB. Grace. Rose. Hold hands, please.']},
  {talk:'Amy',lines:['Over my dead body.']},
  {talk:'Vance',lines:['That will not be necessary. That is not even on the table.']},
  {talk:'Grace',lines:['Tata.']},
  {talk:'Tom',lines:['Girls. Amy. TNB. Nara. Behind me.']},
  {talk:'Nara',lines:['Nara presses herself against the back of Tom’s legs and does not make a sound. She is very good at this.']},
  {talk:'Tom',lines:['He adjusts his glasses. He has done it before every hard thing, his whole life. Then he raises one hand, palm out, and takes one step forward.']},
  {talk:'Tom',lines:['No touching, please.']},
  {flag:'ch18-pinnacle'},
  {save:true},
  ...SCENES.ch18Fight()
];

SCENES.ch18Fight=()=>[
  {flag:'ch18-fight',value:'pending'},
  {heal:true},
  {call:()=>{ const v=ch18Vance(); if(v) { v.hidden=false; v.mscale=1.4; } }},
  {flag:'ch18-fight'},
  {battle:()=>{ const m=ch18Vance(); if(m) { m.hidden=false; m.mscale=1.4; m.tier=0; } return m; },tut:'ch18'},
  ...SCENES.ch18After()
];

SCENES.ch18After=()=>[
  {flag:'ch18-after',value:'pending'},
  {call:()=>{ for(const m of party) m.hp=Math.max(1,m.hp); if(typeof b6Badge==='function') b6Badge(); CH18FX.light={x:player.x,y:player.y,t0:null}; sfx.levelChime&&sfx.levelChime(); }},
  {hide:'tom'},
  {wait:2.8},
  {talk:'Floor 60',lines:['Where Tom was standing, there is a small warm light, hanging in the air at about the height of his glasses. Then there is not.']},
  {wait:.8},
  {talk:'Rose',lines:['Tata?']},
  {talk:'Grace',lines:['Tata. TATA.']},
  {talk:'Rose',lines:['He was right there. He was RIGHT there.']},
  {talk:'Nara',lines:['Nara walks to the exact spot where Tom was standing, lies down on it, and does not move.']},
  {talk:'Amy',lines:['Tom. Tom, answer me. I am not doing this. I am not doing this.']},
  {talk:'TNB',lines:['Tom.']},
  {wait:1},
  {talk:'Vance',lines:['That was not in the model.']},
  {talk:'Vance',lines:['The Ray was written for five. He took all of it. I did not think anyone would step into it. I have never once seen anyone step into it.']},
  {talk:'Amy',lines:['Give him back.']},
  {talk:'Vance',lines:['I cannot. The Loom does not hand back. I only know how it keeps.']},
  {talk:'Vance',lines:['He is not destroyed. The Ray unwrites the story of a thing. Somewhere he is still a man with a thermos. The Loom simply does not have a place to put him.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Floor 60',lines:['The Loom shudders. Every thread in it goes white. The Ray has nowhere left to go, and a wave of light rolls out from the place Tom stood.']},
  {talk:'Vance',lines:['It will take you home. It goes where he is from. Hold on to something.']},
  {talk:'Amy',lines:['We are not leaving without him!']},
  {talk:'Vance',lines:['You are not leaving. You are being sent. That is a different thing.']},
  {call:()=>{ intro.whiteout=true; }},
  {fade:'out',time:1.6},
  {call:()=>{ ch18TomGone(); ch17Place('jpark',4,19,'up'); CH18FX.light=null; }},
  {wait:.8},
  {fade:'in',time:2.2},
  {call:()=>{ intro.whiteout=false; }},
  {talk:'TNB',lines:['Okay. We are on Second Avenue. It is morning. It is somehow morning.']},
  {talk:'Rose',lines:['Is Tata coming?']},
  {talk:'Grace',lines:['He said we always make our connection. So he will.']},
  {talk:'Amy',lines:['I know my brother. He is going to turn up late, a little annoyed, with a full explanation, and ask if anybody ate.']},
  {talk:'TNB',lines:['His thermos is on the porch rail. He left it out for the cat.']},
  {talk:'Rose',lines:['Is the cat going to be okay?']},
  {talk:'TNB',lines:['The cat is fine. The cat is always fine. The cat is not even his.']},
  {talk:'Nara',lines:['Nara sits down on Tom’s porch step, facing the street, and waits.']},
  {talk:'Amy',lines:['Okay. Okay. Plan. Mom and Dad are stone. Tom is somewhere. And there is exactly one thing in this city that does not forget where things go.']},
  {talk:'Grace',lines:['The post office.']},
  {talk:'TNB',lines:['I’ll make coffee first. Tom would want me to make coffee first.']},
  {call:()=>showToast&&showToast('Tom has left the party. His portrait is gone from the menu.',6)},
  {flag:'ch18-after'},
  {fade:'out',time:.8},{card:18,done:true,time:3.4},{flag:'ch18-done'},
  {fade:'in',time:.8},
  {toast:'Goal: Chapter 19 is coming. Tom is gone, and Nara will not stop sniffing at the post box.',time:8},
  {call:()=>showToast&&showToast('CHAPTER 18 COMPLETE! Chapter 19 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch18-pinnacle',map:'towerpinnacle',when:{...CH18,flag:'ch18-open',notFlag:'ch18-pinnacle'},scene:'ch18Pinnacle'},
  {id:'ch18-after',map:'towerpinnacle',when:{...CH18,flag:'battle:vance',notFlag:'ch18-after'},scene:'ch18After'}
);

// ---------- World state ----------
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  // Vance stays out of the Loom Chamber until the scene starts, and is gone once the chapter's fight is over.
  const m=ch18Vance();
  if(m) {
    const show=STORY.chapter===18&&!!flag('ch18-pinnacle')&&!flag('ch18-after');
    if(!show&&!m.hidden) m.hidden=true; else if(show&&m.hidden) m.hidden=false;
    m.mscale=1.4;
  }
});
HOLD_RULES.push(n=>n.monster==='vance');

// ---------- Interaction ----------
const LE_pressAction_ch18=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.kind==='object'?t.value:null,n=t&&t.kind==='npc'?t.value:null;
    // The pinnacle lift in the Vault: chapter 18 begins once the Twin Lenses are down.
    if(v&&v.kind==='glelev'&&currentMap.id==='towervault'&&STORY.chapter===17&&flag('ch17-done')&&!flag('ch18-open')) {
      openChoice('Pinnacle lift',['A gold lift door with no call button. A brass plate: FLOOR 60. BY INVITATION. The door is already open.'],[
        {label:'GO UP',fn:()=>playScene('ch18Open')},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    // A reload in the middle of the chapter: the lift goes back up to the Loom Chamber.
    if(v&&v.kind==='glelev'&&currentMap.id==='towervault'&&STORY.chapter===18&&flag('ch18-open')&&!flag('ch18-after')) {
      openChoice('Pinnacle lift',['The gold lift is waiting. It has been waiting a long time.'],[
        {label:'GO UP',fn:()=>ch17Place('towerpinnacle',10,12,'up')},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    if(n&&n.monster==='vance'&&STORY.chapter===18&&flag('ch18-pinnacle')&&!flag('ch18-after')) {
      playScene(flag('battle:vance')?'ch18After':'ch18Fight'); return;
    }
  }
  return LE_pressAction_ch18();
};
