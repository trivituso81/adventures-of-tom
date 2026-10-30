'use strict';
// data/scenes-ch17.js — Part 2, Chapter 17 "Ascent of the Glass Tower". Loaded after data/scenes-ch16.js.
// Sol drives the party to Downtown LA; Vance's 60-story Glass Tower stands on the boulevard. Six heroes, two strike teams of three:
//   TEAM STAIRS  Tom, Grace, Rose   climb the stairwell (floors 2 to 30), fighting the Stillness guards.
//   TEAM SHELVES Amy, TNB, Nara     work the Shelf Hall on floor 30: six shelves, each a town paused on its happiest afternoon. Smash them.
// Tom is the one who can hear both radios, so he is the runner between the teams: the service hatch on landing 30 swaps who is out front
// (the other team waits: the girls as NPCs on the landing, Amy, TNB and Nara on the bench). Design call: Grace and Rose are never benched
// (a bench save would break loading), so they are the stairs team and wait on the landing while the adults work the shelves.
// All six shelves smashed -> the locks drop (ch17Locks) -> everyone regroups -> Amy and Tom race the stairs (ch17Race, floors 31 to 59,
// a photo finish) -> unlocks the Tombo "Sixty-Story Sibling Pace" (flag tombo:amy3) -> the Vault: the Archivist's Twin Lenses (boss).
// Flags: ch17-open, ch17-team ('stairs'|'shelves'|'final'), ch17-lobby, ch17-landing, shelf-0..5, ch17-smashed (count), ch17-locks, ch17-race,
// ch17-vault, battle:twinlens ('win'), ch17-after, ch17-done.
const CH17={mode:'full',chapter:17};
const CH17FX={race:null};

// ---------- Teams ----------
const CH17_GIRL_LINES={
  Grace:['Team Stairs is holding the landing. That is a very important job. I decided that.','I can hear the shelves smashing through the wall. Mommy sounds really happy.','If anything comes up the stairs, it has to get past me. And then past Rose. She is worse.'],
  Rose:['I’m guarding the hatch. Nobody comes in. Nobody goes out. Except Tata. And snacks.','Is the wall making that noise, or is it Nara?','I’m going to name every shelf. Shelf one is Gerald.']};
function ch17Girls() {
  const room=worlds.towerstairs; if(!room) return;
  for(const m of Object.values(worlds)) {
    if(m===room) continue;
    const gs=m.npcs.filter(n=>n.girlAtHome); if(!gs.length) continue;
    m.npcs=m.npcs.filter(n=>!n.girlAtHome);
    for(const g of gs) {
      if(room.npcs.some(n=>n.girlAtHome&&n.name===g.name)) continue;
      Object.assign(g,{x:g.name==='Grace'?4:6,y:3,move:null,path:[],lines:CH17_GIRL_LINES[g.name]||g.lines,visitedOnce:false});
      room.npcs.push(g);
    }
  }
}
// Put the active strike team out front. 'stairs' = Tom, Grace, Rose. 'shelves' = Tom, Amy, TNB, Nara. 'final' = Tom, Grace, Rose, Amy (TNB, Nara on the bench).
function ch17Team(which) {
  const M=MEMBERS(),adults=['amy','tnb','nara'];
  const want={stairs:['grace','rose'],shelves:['amy','tnb','nara'],final:['grace','rose','amy']}[which]||[];
  for(const id of adults) { const m=M[id]; if(m&&!want.includes(id)&&!onBench(m)) benchAdd(m); }
  const wantGirls=want.includes('grace');
  if(wantGirls&&girlsAway()) setGirlsAway(false);
  if(!wantGirls&&!girlsAway()) setGirlsAway(true);
  for(const id of adults) { const m=M[id]; if(m&&want.includes(id)&&!inParty(m)) { if(onBench(m)) benchToParty(m); else forceJoin(m,true); } }
  if(!wantGirls) ch17Girls();
  setFlag('ch17-team',which);
  if(typeof menuChar!=='undefined') menuChar=0;
  if(typeof b6Badge==='function') b6Badge();
  placeFollowers();
}
// Put the party on a Glass Tower map.
function ch17Place(map,x,y,dir) {
  currentMap=worlds[map]; player.x=x; player.y=y; player.facing=dir||'up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
function ch17Add(map,kind,x,y,w,h,name,text) {
  const m=worlds[map]; if(!m||m.objects.some(o=>o.ch17===kind)) return;
  object(m,kind,x,y,w,h,name,text,{ch17:kind});
}
function ch17Remove(map,kind) {
  const m=worlds[map]; if(!m) return;
  for(const o of m.objects.filter(o=>o.ch17===kind)) {
    for(let yy=o.y;yy<o.y+o.h;yy++) for(let xx=o.x;xx<o.x+o.w;xx++) if(within(m,xx,yy)) { m.solid[yy*m.w+xx]=0; m.objectAt.delete(key(xx,yy)); }
    m.objects.splice(m.objects.indexOf(o),1);
  }
}

// ---------- The race overlay ----------
function ch17DrawRace(time) {
  const r=CH17FX.race; if(!r) return;
  rect(0,0,W,H,'#0e1424');
  for(let i=0;i<16;i++) { const y=((i*41+r.t*260)%(H+40))-20; rect(0,y,W,2,'#1f2a46'); }
  gfx.globalAlpha=.25; rect(W/2-1,0,2,H,'#f2c75a'); gfx.globalAlpha=1;
  const lanes=[W*.28,W*.72],cols=[['#4a78c2','#f0c4a0','Tom'],['#e2793a','#efbc8e','Amy']];
  for(let k=0;k<2;k++) {
    const p=k?r.p1:r.p0,x=lanes[k],y=H*.8-p*H*.6,step=Math.floor(time*14+k)%2;
    ellipse(x,y+12,9,3,'#00000060');
    rect(x-4,y-14,8,3,'#2a1a14'); rect(x-4,y-11,8,7,cols[k][1]); rect(x-5,y-4,10,9,cols[k][0]);
    rect(x-5,y+5,4,5,'#2b2724'); rect(x+1,y+5-step*3,4,5,'#2b2724'); rect(x-5+step*3,y+5,4,5,'#2b2724');
    label(cols[k][2].toUpperCase(),x,y+16,'#f4f0e6',1);
    label('F'+Math.round(31+p*28),x,y-24,'#ffe27a',1);
  }
  label('FLOORS 31 TO 59',W/2,8,'#f4f0e6',2);
}
const LE_drawIntroScreen_ch17=drawIntroScreen;
drawIntroScreen=function(time) { LE_drawIntroScreen_ch17(time); ch17DrawRace(time); };
SCENE_OPS.ch17FxRace=()=>({start(){ this.t=0; CH17FX.race={t:0,p0:0,p1:0}; },update(dt){
  this.t+=dt; const sec=6.5,u=Math.min(1,this.t/sec),w=Math.sin(u*11)*.05*(1-u);
  Object.assign(CH17FX.race,{t:this.t,p0:Math.min(1,u+w),p1:Math.min(1,u-w)});
  if(u>=1) { CH17FX.race.p0=1; CH17FX.race.p1=1; return true; } return false; }});
SCENE_OPS.ch17FxEnd=()=>S.call(()=>{ CH17FX.race=null; });

// ---------- Chapter 17 begins: talk to Sol at the cab stand ----------
SCENES.ch17Open=()=>[
  {flag:'ch17-open',value:'pending'},
  {talk:'Sol',lines:['Downtown. The tallest thing on the boulevard that wasn’t there on Monday. Sixty floors of glass, and every clock in it says 4:59.']},
  {talk:'Amy',lines:['That’s the building. That’s where he is.']},
  {talk:'Grace',lines:['We’re coming. All of us. I already told Rose. She’s packing.']},
  {talk:'Rose',lines:['I packed a pretzel. And a second pretzel, for Deedee.']},
  {talk:'Amy',lines:['Girls. It is sixty floors. It is going to be hard and strange and not fair.']},
  {talk:'Grace',lines:['We know. That’s why we’re coming.']},
  {talk:'Tom',lines:['Okay. Here’s how we do it. Two teams of three. Grace, Rose and me take the stairs. Amy, TNB and Nara work the Archive on thirty.']},
  {talk:'TNB',lines:['Divide and conquer. I like it. I also like not being on the stairs.']},
  {talk:'Nara',lines:['Nara does not like stairs. Nara is, however, extremely good at breaking glass.']},
  {talk:'Amy',lines:['And I get to hit something. Good.']},
  {talk:'Sol',lines:['I’ll keep the meter off and the engine on. Go get your folks, Tommy.']},
  {fade:'out',time:.8},
  {card:17,time:3.2},
  {call:()=>{ setChapter(17,{apply:false}); setFlag('ch17-open','pending'); sfx.travel&&sfx.travel(); ch17Team('stairs'); ch17Place('blvd',14,9,'up'); }},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['The tower goes up past the top of the screen. The doors at the bottom are glass, and they are glowing like a lit window at dinnertime.']},
  {talk:'Rose',lines:['It’s so tall. Tata, it’s TALLER than the Starlite.']},
  {toast:'Chapter 17: walk up to the glass doors of THE TOWER (north, between Ramen Ramen and The Starlite) and press A.',time:9},
  {flag:'ch17-open'},
  {save:true}
];
SCENES.ch17Enter=()=>[
  {fade:'out',time:.5},
  {call:()=>{ sfx.doorIn&&sfx.doorIn(); ch17Place('towerlobby',10,11,'up'); }},
  {fade:'in',time:.5}
];

SCENES.ch17Lobby=()=>[
  {flag:'ch17-lobby',value:'pending'},
  {talk:'Tom',lines:['The lobby is all glass and no people. Every clock says 4:59. The second hands are shaking in place, like they are trying very hard.']},
  {talk:'Grace',lines:['It’s so clean. Nobody lives here. Nobody even touched the floor.']},
  {talk:'Rose',lines:['There’s a plant. It looks scared.']},
  {talk:'Tom',lines:['Floor directory says the stairs are on the east side. Twenty-eight flights.']},
  {talk:'Grace',lines:['Twenty-eight? That’s a leg day AND an arm day.']},
  {talk:'Tom',lines:['The lifts are locked. We take the stairs to thirty. Amy, TNB and Nara meet us up there.']},
  {toast:'Tip: Coffee machines are restore points. Go through the east door to the stairwell. Stillness guards patrol the landings.',time:8},
  {flag:'ch17-lobby'}
];

SCENES.ch17Landing=()=>[
  {flag:'ch17-landing',value:'pending'},
  {talk:'Tom',lines:['Landing thirty. A huge glass door with a gold lock the size of a dinner plate. The counter over it says LOCKS ENGAGED 6 OF 6.']},
  {talk:'Grace',lines:['Six locks. Six of something. I don’t like that.']},
  {talk:'Amy',lines:['Tom, this is Amy. We’re in the service ducts. I can hear glass. A lot of glass. There’s a little hatch on your landing, it should open on the Archive.']},
  {talk:'Tom',lines:['Found it. Staff only. Somebody wrote HE IS OBVIOUSLY STAFF under it.']},
  {talk:'Amy',lines:['That’s TNB’s handwriting. Go through. Girls hold the landing.']},
  {talk:'Rose',lines:['Holding the landing! Holding it! Holding!']},
  {toast:'Press A on the service hatch (top left of the landing) to crawl through and swap teams.',time:8},
  {flag:'ch17-landing'}
];

// ---------- The service hatch swaps the strike teams ----------
const ch17CrossOps=to=>()=>{
  const toShelves=to==='shelves';
  const first=toShelves&&!flag('ch17-hatch');
  const team=toShelves?'shelves':(flag('ch17-locks')?'final':'stairs');
  return [
    {fade:'out',time:.5},
    {call:()=>{ sfx.doorIn&&sfx.doorIn(); setFlag('ch17-hatch',true); ch17Team(team);
      if(toShelves) ch17Place('towershelves',1,5,'right'); else ch17Place('towerstairs',13,3,'down'); }},
    {fade:'in',time:.5},
    ...(first?[
      {talk:'Tom',lines:['The Archive. A long hall of glass shelves, and on every shelf a whole tiny town under a dome, each one paused on its happiest afternoon.']},
      {talk:'Amy',lines:['Tom. Look at the plaque. Look at the little man with the pierogi.']},
      {talk:'TNB',lines:['That’s a very good diorama. I hate it. It’s very well made.']},
      {talk:'Nara',lines:['Nara sniffs a shelf. It does not smell like anything. It does not smell like anything at all.']},
      {talk:'Amy',lines:['Six towns. Six shelves. The lock counter on the stairs says six. I do not think that is a coincidence.']},
      {talk:'Tom',lines:['Smash them. Gently, I mean. Free the towns.']},
      {talk:'Amy',lines:['Gently is not a word I use.']},
      {toast:'Face a shelf and press A to smash it. The girls hold the landing while Team Shelves works. The hatch is on the west wall.',time:9}
    ]:[])
  ];
};

// ---------- Smashing the shelves ----------
const CH17_SMASH=[
  ['Amy','Amy picks up the nearest chair like a javelin. “Eat the pierogi, little man.”','The tiny man finishes his bite. In 1993, in Dunmore, Pennsylvania, 2:15 PM comes at last.'],
  ['TNB','TNB taps the dome once, lightly, with a pottery tool. “Structurally, this was never going to hold.”','The firework goes off. Somewhere in Tallulah Falls a crowd on blankets says oooooh, nine years late.'],
  ['Nara','Nara headbutts the shelf. There is a long pause. Then the glass sings and comes down in a bright rain.','The ball comes down in left field. The tiny dad catches it. Cedar Hollow loses in the bottom of the ninth and has never been happier.'],
  ['Amy','“This is for the lady with the suitcase.” Amy swings. The dome goes.','The tiny woman reaches the ferry. The gangway comes up behind her, and the ferry leaves, and she waves, and she is crying, and it is fine.'],
  ['TNB','“I have never broken a pie case in my life.” TNB breaks it, apologetically, with his whole arm.','The judge puts down the fork. The baker in the front row screams. It is a very good pie.'],
  ['Nara','Nara and Amy hit the last dome together, from both sides. It comes apart like an ice shelf.','The two tiny people finish the kiss. The flower girl sticks her tongue out one more time, on principle.']];
const ch17SmashOps=i=>()=>{
  const [who,act,out]=CH17_SMASH[i],n=(Number(flag('ch17-smashed'))||0)+1;
  return [
    {talk:'Tom',lines:[act]},
    {call:()=>{ sfx.thud&&sfx.thud(); sfx.splat&&sfx.splat(); setFlag('shelf-'+i,true); setFlag('ch17-smashed',n); CH17_GLOW[i]={t0:elapsedTime}; }},
    {wait:1.6},
    {talk:'Tom',lines:[out]},
    {toast:'Shelf '+n+' of 6 smashed. '+CH17_TOWNS[i].town+' goes on with its afternoon.',time:4},
    ...(n<6?[]:[{wait:.4}])
  ];
};

SCENES.ch17Locks=()=>[
  {flag:'ch17-locks',value:'pending'},
  {wait:.8},
  {talk:'Archivist',lines:['Attention. A collection has been disturbed. Six exhibits are no longer on file.']},
  {talk:'Archivist',lines:['This is unfortunate. This is not a problem. The Archivist is not unkind. The Archivist is only thorough.']},
  {call:()=>{ sfx.charge&&sfx.charge(); sfx.chime&&sfx.chime(); }},
  {talk:'Archivist',lines:['Floors 2 to 30 are now unlocked for your convenience. The express lift has been withdrawn. Please use the stairs. All of them. The Archivist will be waiting at the top.']},
  {talk:'Amy',lines:['Withdrawn. The lift has been WITHDRAWN. Tom. Did he just challenge me to a stair race?']},
  {talk:'Tom',lines:['I don’t think he knows what he just did.']},
  {flag:'ch17-locks'},
  {toast:'LOCKS ENGAGED 0 OF 6. Back through the west hatch to the stairs, then the seal door on landing 30.',time:9},
  {save:true}
];

// ---------- The race: Amy and Tom, floors 31 to 59 ----------
SCENES.ch17Race=()=>[
  {flag:'ch17-race',value:'pending'},
  {talk:'Tom',lines:['The seal door swings open on its own. The stairwell goes on. Twenty-nine more floors, straight up, in a glass tube.']},
  {talk:'Amy',lines:['You and me. Landing to landing. Loser buys dinner.']},
  {talk:'Tom',lines:['Amy, we have a deadline. We have a tower. We have two grandparents made of stone.']},
  {talk:'Amy',lines:['Which is why I am going to win this.']},
  {talk:'Grace',lines:['I am calling it. On my mark. Mark!']},
  {talk:'Rose',lines:['I’m the finish line!']},
  {talk:'TNB',lines:['I am not running. I am carrying the thermos. Somebody has to.']},
  {fade:'out',time:.5},
  {ch17FxRace:true},
  {wait:.6},
  {call:()=>{ ch17Team('final'); ch17Place('towervault',10,11,'up'); }},
  {ch17FxEnd:true},
  {fade:'in',time:.7},
  {talk:'Tom',lines:['Floor fifty-nine. We hit the vault door at exactly the same time. Amy’s forehead and mine, a quarter inch apart.']},
  {talk:'Amy',lines:['That was MINE.']},
  {talk:'Tom',lines:['It was a tie.']},
  {talk:'Amy',lines:['Tie means nobody won. Tie means I lost. Rematch. Later. After.']},
  {talk:'Tom',lines:['After.']},
  {call:()=>{ setFlag('tombo:amy3',true); sfx.levelChime&&sfx.levelChime(); }},
  {toast:'NEW TOMBO! Tom + Amy: Sixty-Story Sibling Pace.',time:6},
  {flag:'ch17-race'},
  {save:true}
];

// ---------- The Vault and the Twin Lenses ----------
const ch17Lens=()=>findMonster('twinlens');
SCENES.ch17Vault=()=>[
  {flag:'ch17-vault',value:'pending'},
  {talk:'Tom',lines:['The Vault. One plinth, one snow globe, and a view of Los Angeles at 4:59 PM, golden and perfect and completely still.']},
  {talk:'Rose',lines:['Tata. It’s the Square. It’s in there. That’s Deedee. That’s BOPPY.']},
  {talk:'Grace',lines:['They’re so small. They’re okay. They’re holding hands.']},
  {talk:'Tom',lines:['Stay behind me. All of you.']},
  {call:()=>{ sfx.charge&&sfx.charge(); const m=ch17Lens(); if(m) { m.hidden=false; m.mscale=1.5; } }},
  {talk:'Archivist',lines:['Thank you for the six exhibits. The collection is, for the first time, incomplete. I find that I do not like it.']},
  {talk:'Tom',lines:['You’re the Archivist.']},
  {talk:'Archivist',lines:['I am what Mr. Vance keeps when he wants a thing never to change. I file. I label. I hold. It is all I was made to do. It is a very good job.']},
  {talk:'Amy',lines:['You froze the pierogi man for thirty years.']},
  {talk:'Archivist',lines:['Thirty-one. He was very happy. I made sure of it.']},
  {talk:'TNB',lines:['That is the single saddest thing I have ever heard a lens say.']},
  {talk:'Archivist',lines:['Please hold still. This will not hurt. Nothing will, ever again.']},
  {toast:'Tip: it calls LONG EXPOSURE every third turn. Under half HP it braces for TOTAL ARCHIVE: break the amber lens with 2 Kinetic or Sparkle hits, or a Tombo (try Tom + Amy).',time:10},
  {flag:'ch17-vault'},
  {save:true},
  ...SCENES.ch17Fight()
];
SCENES.ch17Fight=()=>[
  {flag:'ch17-fight',value:'pending'},
  {flag:'ch17-fight'},
  {battle:()=>{ const m=ch17Lens(); if(m) { m.hidden=false; m.mscale=1.5; m.tier=0; } return m; },tut:'ch17'},
  {if:()=>flag('battle:twinlens')==='win',then:[],else:[
    {heal:true},
    {talk:'Amy',lines:['Up. Everyone up. We have a lens to break. Breathe. Then we go again.']},
    {toast:'Talk to the Twin Lenses (north of the snow globe) and press A to try again. Everyone is healed.',time:5}]}
];

SCENES.ch17After=()=>[
  {flag:'ch17-after',value:'pending'},
  {wait:.6},
  {talk:'Tom',lines:['The amber lens cracks across the middle. The cold one goes dark. For one second, the whole building holds its breath.']},
  {talk:'Archivist',lines:['I was only... keeping them safe.']},
  {talk:'Tom',lines:['I know. They were never yours to keep.']},
  {talk:'Archivist',lines:['What does one do... with a day that is allowed to end?']},
  {talk:'Rose',lines:['You eat dinner. Then you go to sleep. Then it’s morning.']},
  {talk:'Archivist',lines:['That sounds... sufficient.']},
  {call:()=>{ const m=ch17Lens(); if(m) { m.hidden=true; m.sunk={x:m.x,y:m.y}; } sfx.chime&&sfx.chime(); }},
  {wait:.8},
  {talk:'Grace',lines:['Tata. The globe.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['The snow globe on the plinth lifts an inch off the glass. The gold cable above it goes tight. It is going up.']},
  {talk:'Vance',lines:['Thank you for the tour, Tom. Thank you for the Archive. It was very nearly complete.']},
  {talk:'Vance',lines:['Floor sixty is for family. Come up when you are ready. I have kept your parents very warm.']},
  {talk:'Amy',lines:['Mom. Dad. We are coming. We’re coming.']},
  {talk:'Tom',lines:['Everybody breathe. We rest. Then we go to the top.']},
  {flag:'ch17-after'},
  {fade:'out',time:.8},{card:17,done:true,time:3.4},{flag:'ch17-done'},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['A gold lift door stands open at the north wall. No call button. A brass plate: FLOOR 60. BY INVITATION.']},
  {toast:'Goal: Chapter 18 is coming. The pinnacle lift to Floor 60 is waiting.',time:8},
  {call:()=>showToast&&showToast('CHAPTER 17 COMPLETE! Chapter 18 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch17-lobby',map:'towerlobby',when:{...CH17,flag:'ch17-open',notFlag:'ch17-lobby'},scene:'ch17Lobby'},
  {id:'ch17-landing',map:'towerstairs',at:[2,3,14,3],when:{...CH17,flag:'ch17-lobby',notFlag:'ch17-landing'},scene:'ch17Landing'},
  {id:'ch17-locks',map:'towershelves',when:{...CH17,flag:{'ch17-smashed':6},notFlag:'ch17-locks'},scene:'ch17Locks'},
  {id:'ch17-vault',map:'towervault',when:{...CH17,flag:'ch17-race',notFlag:'ch17-vault'},scene:'ch17Vault'},
  {id:'ch17-after',map:'towervault',when:{...CH17,flag:{'battle:twinlens':'win'},notFlag:'ch17-after'},scene:'ch17After'}
);

// ---------- World state ----------
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  // The tower's front doors stand on the boulevard from chapter 17 on.
  if(STORY.chapter>=17) ch17Add('blvd','towerfront',13,8,4,1,'The Glass Tower','Sixty floors of glass. The doors are lit like a window at dinnertime. Every clock inside says 4:59.'); else ch17Remove('blvd','towerfront');
  // While Team Shelves works, the girls hold the landing.
  if(STORY.chapter===17&&flag('ch17-team')==='shelves'&&girlsAway()) ch17Girls();
  // The Twin Lenses stay out of sight until the Vault scene (and again once they are beaten).
  const m=ch17Lens();
  if(m) {
    const show=STORY.chapter===17&&flag('ch17-vault')&&flag('battle:twinlens')!=='win';
    if(!show&&!m.hidden) { m.hidden=true; }
    else if(show&&m.hidden&&!m.sunk) { m.hidden=false; }
    m.mscale=1.5;
  }
});
HOLD_RULES.push(n=>n.monster==='twinlens');
TUTORIALS.ch17={tips:[
  {id:'exposure',who:'*',text:'Every third turn it calls LONG EXPOSURE on everyone. It shows on the turn ribbon first. Heal up after!'},
  {id:'lens',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'TOTAL ARCHIVE next turn! Break the amber lens: 2 Kinetic or Sparkle hits, or any Tombo. Tom and Amy have a new one.'}]};

// ---------- Interaction ----------
const LE_talkToDriver_ch17=talkToDriver;
talkToDriver=function(n) {
  if(STORY.mode==='full'&&n.name==='Sol'&&STORY.chapter===16&&flag('ch16-done')&&!flag('ch17-open')) { playScene('ch17Open'); return; }
  return LE_talkToDriver_ch17(n);
};
const LE_pressAction_ch17=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===17&&flag('ch17-open')===true) {
    const t=facingTarget(),v=t&&t.kind==='object'?t.value:null,n=t&&t.kind==='npc'?t.value:null;
    if(v&&v.kind==='towerfront') {
      openChoice('The Glass Tower',['Sixty floors of glass. The door is not locked. That is somehow worse.'],[
        {label:'GO IN',fn:()=>playScene('ch17Enter')},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    if(v&&v.kind==='glhatch'&&(currentMap.id==='towerstairs'||currentMap.id==='towershelves')) {
      const up=currentMap.id==='towerstairs';
      if(up&&!flag('ch17-landing')) return LE_pressAction_ch17();
      const final=!up&&flag('ch17-locks');
      openChoice('Service hatch',[up?'Crawl through to the Archive? Amy, TNB and Nara take over out front. Grace and Rose hold the landing.'
        :final?'Back to the stairwell? Everyone regroups on landing 30.':'Back to the stairwell? Grace and Rose take over. Amy, TNB and Nara wait on the bench.'],[
        {label:'CRAWL THROUGH',fn:()=>playScene(ch17CrossOps(up?'shelves':'stairs'),{keep:false})},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    if(v&&v.kind==='towershelf'&&currentMap.id==='towershelves') {
      const i=v.shelf;
      if(flag('shelf-'+i)) { openDialog(v.name,[CH17_TOWNS[i].town+' is free. The little town is going on with its afternoon.']); return; }
      openChoice(v.name,[CH17_TOWNS[i].look,'It is '+CH17_TOWNS[i].moment+'. It has been that moment for a very long time.'],[
        {label:'SMASH IT',fn:()=>playScene(ch17SmashOps(i),{keep:false})},{label:'LEAVE IT',fn:()=>{}}]);
      return;
    }
    if(v&&v.kind==='glsealdoor'&&currentMap.id==='towerstairs') {
      if(!flag('ch17-locks')) { openDialog(v.name,['LOCKS ENGAGED '+Math.max(0,6-(Number(flag('ch17-smashed'))||0))+' OF 6. The gold lock does not budge. Somewhere nearby, glass is waiting to be broken.']); return; }
      if(!flag('ch17-race')&&flag('ch17-team')==='final') { playScene('ch17Race'); return; }
      if(!flag('ch17-race')) { openDialog(v.name,['The lock is open. Bring everyone back through the hatch first. This one is a family climb.']); return; }
    }
    if(n&&n.monster==='twinlens'&&flag('ch17-vault')&&flag('battle:twinlens')!=='win') { playScene('ch17Fight'); return; }
  }
  return LE_pressAction_ch17();
};
