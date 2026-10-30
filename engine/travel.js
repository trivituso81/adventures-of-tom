'use strict';
// engine/travel.js — Flying between Long Island and Los Angeles.
// Talk to Sal (Long Island Taxi Co.) or Sol (Angel City Cab Co.) and pick the airport. Each town keeps its own recruits: Grace, Rose, Amy, Deedee
// and Boppy stay on Long Island (the girls wait in the Gregori house and run to meet Tom when he lands back home. TNB and Nara stay in Los Angeles.
// The flight is a cutscene on the intro step system: takeoff, a plane crossing a map of the US, landing.

// ---------- LA villagers ----------
Object.assign(VILLAGERS,{
  skye:{base:'woman',scale:.82,hair:'#e8c25a',skin:'#e9b48e',top:'#f08aa8',shoes:'#f4f0e6'},
  chet:{base:'man',scale:1.18,hair:'#3b2f2a',skin:'#d7a07a',top:'#2f3a4a',bottom:'#5a6474',shoes:'#2b2724'},
  bev:{base:'woman',scale:.8,hair:'#b7b3ad',skin:'#f0caaa',top:'#e2793a',shoes:'#e8e4dc'},
  larry:{base:'man',scale:1.14,hair:'#6b6058',skin:'#c69878',top:'#8aa46a',bottom:'#6a5a48',shoes:'#3b3330'},
  marisol:{base:'woman',scale:.82,hair:'#2a2220',skin:'#b8805c',top:'#e85a6a',shoes:'#3a3646'},
  juniper:{base:'woman',scale:.82,hair:'#a8452f',skin:'#f0c4a0',top:'#d9c6a0',shoes:'#5a4a3a'},
  kenji:{base:'man',scale:1.16,hair:'#2a2422',skin:'#e3b48e',top:'#f4ecd2',bottom:'#2c2c33',shoes:'#2b2724'},
  sage:{base:'woman',scale:.8,hair:'#d9c27a',skin:'#e9c09a',top:'#8ac46a',shoes:'#e8e2d0'},
  nickel:{base:'woman',scale:.84,hair:'#2f6f73',skin:'#e7b48f',top:'#3a9ca0',shoes:'#4a3a32'},
  marguerite:{base:'woman',scale:.84,hair:'#d9d5c4',skin:'#9e7056',top:'#6a4f7a',shoes:'#2c2c33'},
  dolores:{base:'woman',scale:.8,hair:'#5a3a5a',skin:'#e9b896',top:'#a8453a',shoes:'#2c2c33'},
  dash:{base:'man',scale:1.12,hair:'#3a2a22',skin:'#c99372',top:'#e2793a',bottom:'#4a5868',shoes:'#f4f0e6'},
  rudy:{base:'man',scale:1.12,hair:'#c98a4a',skin:'#efbc8e',top:'#5f8a8f',bottom:'#4a4a52',shoes:'#2b2724'},
  alvarez:{base:'woman',scale:.78,hair:'#cfc8bc',skin:'#c08a64',top:'#c0613f',shoes:'#3a3646'},
  wes:{base:'man',scale:1.16,hair:'#6b4a33',skin:'#efbc8e',top:'#9ea3ab',bottom:'#3b4057',shoes:'#2b2724'},
  priya:{base:'woman',scale:.82,hair:'#2a2220',skin:'#b98262',top:'#3f5a74',shoes:'#2c2c33'},
  odette:{base:'woman',scale:.8,hair:'#d9d5c4',skin:'#8a5a3c',top:'#7a3a5a',shoes:'#2c2c33'},
  carmen:{base:'woman',scale:.78,hair:'#2a2220',skin:'#c08a64',top:'#2f6fb3',shoes:'#3a3646'},
  pearl:{base:'woman',scale:.78,hair:'#cfc8bc',skin:'#7a4a32',top:'#c0392b',shoes:'#3a3646'},
  lupe:{base:'woman',scale:.82,hair:'#3a2a22',skin:'#b8805c',top:'#e8c060',shoes:'#3f4a6a'},
  washington:{base:'man',scale:1.12,hair:'#d9d5c4',skin:'#6a4030',top:'#8a7a5a',bottom:'#3f4650',shoes:'#2b2724'},
  dakota:{base:'woman',scale:.84,hair:'#c9a24a',skin:'#f0c4a0',top:'#9ccfd8',shoes:'#f4f0e6'},
  beto:{base:'man',scale:1.1,hair:'#d9d5c4',skin:'#b8805c',top:'#6a7a8a',bottom:'#3f4650',shoes:'#2b2724'},
  tony:{base:'man',scale:1.18,hair:'#2a2220',skin:'#c08a64',top:'#3f6a3f',bottom:'#3f4a6a',shoes:'#2b2724'},
  yesenia:{base:'woman',scale:.82,hair:'#3a2a22',skin:'#c99372',top:'#d65aa0',shoes:'#2c2c33'},
  claudia:{base:'woman',scale:.82,hair:'#2a2220',skin:'#b8805c',top:'#7fb7c9',shoes:'#f4f0e6'},
  kevin:{base:'man',scale:.95,hair:'#2a2220',skin:'#c08a64',top:'#c94a3a',bottom:'#4a5868',shoes:'#f4f0e6'},
  daisy:{base:'woman',scale:.66,hair:'#3a2a22',skin:'#c99372',top:'#9a7ad0',shoes:'#f4f0e6'},
  mateo:{base:'man',scale:.55,hair:'#2a2220',skin:'#c08a64',top:'#e8c84a',bottom:'#4a78c2',shoes:'#c94a3a'},
  sofi:{base:'woman',scale:.46,hair:'#3a2a22',skin:'#c99372',top:'#6fb35a',shoes:'#d65aa0'},
  jordan:{base:'man',scale:1.16,hair:'#2c2c2e',skin:'#e9c09a',top:'#2c2c2e',bottom:'#c9b89a',shoes:'#f4f4f0'},
  sam:{base:'woman',scale:.84,hair:'#b98a5a',skin:'#efbc8e',top:'#f4f4f0',shoes:'#c9b89a'},
  ryan:{base:'man',scale:1.16,hair:'#8a6a4a',skin:'#f0c4a0',top:'#9ea3ab',bottom:'#3b4057',shoes:'#f4f4f0'},
  sol:{base:'man',scale:1.16,hair:'#2a2422',skin:'#b98262',top:'#f2c75a',bottom:'#3c3f4c',shoes:'#2b2724'}
});

// ---------- Grace and Rose stay home ----------
const GIRL_FOLLOWERS=followers.filter(f=>f.member===grace||f.member===rose);
function girlsAway() { return !party.includes(grace); }
function makeGirlAtHome(m,x,y,lines) {
  const n=actor(m.name,x,y,'dot',lines);
  Object.assign(n,{sheet:m.id,member:m,girlAtHome:true,roam:3,duration:.6});
  return n;
}
function setGirlsAway(away) {
  const home=worlds.amyhouse;
  if(away) {
    for(const m of [grace,rose]) {
      const i=party.indexOf(m); if(i>=0) party.splice(i,1);
      const fi=followers.findIndex(f=>f.member===m); if(fi>=0) followers.splice(fi,1);
    }
    if(!home.npcs.some(n=>n.girlAtHome)) home.npcs.push(
      makeGirlAtHome(grace,11,8,['Tata is in Los Angeles. I\'m in charge now.','Mom says we can call him after dinner. I have a list of questions. It\'s two pages.','When he gets back I\'m doing my whole floor routine for him. Twice.']),
      makeGirlAtHome(rose,6,8,['I\'m drawing Tata a palm tree. It has a face.','Is Tata back yet? Is it now? Is it NOW?','When Tata comes home I\'m going to jump on him SO hard.'])
    );
  } else {
    for(let i=home.npcs.length-1;i>=0;i--) if(home.npcs[i].girlAtHome) home.npcs.splice(i,1);
    if(!party.includes(grace)) party.splice(1,0,grace,rose);
    for(const f of GIRL_FOLLOWERS.slice().reverse()) if(!followers.includes(f)) followers.unshift(f);
  }
  if(typeof menuChar!=='undefined') menuChar=0;
}

// ---------- The drivers ----------
// Recruits never leave their own town: whoever is along says goodbye at the cab and heads home.
const TRAVEL_TALK={
  amy:{stay:['Los Angeles? On a school night? I have thirty second-graders at eight.','Go. I\'ll race you when you get back. And I\'ll win.'],toast:'Amy jogs home. She has papers to grade.'},
  deedee:{stay:['Oh, Tommy. Somebody has to stay with my angels. And the pies.','Here. Cookies for the flight. To the moon and back, honey.'],toast:'Deedee heads home to the Rivituso house. The pies need her.'},
  boppy:{stay:['Six hours in a seat? My stomach says no. I say no. We agree for once.','Go on. The recliner and I\'ll hold down the fort.'],toast:'Boppy shuffles home to the recliner.'},
  nara:{stay:['Nara stops at the curb. She looks at the cab. She looks at Tom.','Tom kneels down. "I\'ll be back. I promise. You keep 2nd Ave safe."','Nara licks his whole face. Then she trots back to 2nd Ave to wait at the corner.'],toast:'Nara heads back to 2nd Ave. She\'ll be waiting.',narrate:true}
};
// Story departures: each chapter's airport run has its own goodbyes (Tom, 26 Oct: no repeats). Keyed by the chapter the
// flight starts. Any part left out (or demo mode) uses the lines above and in startTrip. Chapters 2 and 3 use the defaults.
// driver, grace, rose, tom: the girls' goodbye on a westbound run (Sal speaks first). sol: Sol's one line eastbound.
// tnb + tnbToast, and stay[id] {stay,toast,narrate}: recruits heading home. flight: Tom's two pages in the air.
const DEPARTURES={
  4:{driver:['Los Angeles again? Cab seven loves this run. She hums the whole way.',"The girls stay home. Amy's rule. I don't argue with Amy."],
     grace:['Tata, you HAVE to be back for my meet. I already told everybody you\'re coming.'],
     rose:['My tooth is loose. Look. LOOK. Tata, you\'re not looking.'],
     tom:['I\'ll be at the meet. Front row. I\'ll make a sign.','Rose, that\'s a very good tooth. Guard it with your life.'],
     stay:{boppy:{stay:['Los Angeles again? My back just got home from the marsh.','Go. If you see a pepper out there, bring it back. I\'ll judge it.'],toast:'Boppy heads home. The recliner missed him.'}},
     flight:['Lie flat, warm nuts, and absolutely no fish.','...Boppy would hate it up here.']},
  5:{sol:'Airport. Your young man fixed my visor. He made me promise to drive careful. So I\'m going the speed limit. Everybody hates it.',
     tnb:['That\'s a wrap, babe. I have a five a.m. call and forty capes to steam.','Go survive conference night. Bring snacks. I packed you snacks. Check your bag.'],
     tnbToast:'TNB heads back to the lot. Forty capes won\'t steam themselves.',
     stay:{nara:{stay:['Nara sits down on Tom’s feet. If he can\'t move, he can\'t leave.','Tom wiggles free. "A week. Maybe two. You guard the porch."','Nara lets out the biggest sigh a dog has ever sighed. Then she trots home.'],toast:'Nara heads back to 2nd Ave. Dramatically.',narrate:true}},
     flight:['Six hours. Then conference night. My sister has a clipboard.','I\'m not scared. I\'m PREPARED. Those are different.']},
  6:{driver:['Back to Los Angeles. Your sister gave me a gold star for using my blinker.','The girls stay home. School night. It\'s always a school night.'],
     grace:['Tata, Mom says I\'m in charge while you\'re gone. Of Rose.'],
     rose:['She\'s NOT in charge of me. Tata, tell her. TELL her.'],
     tom:['Nobody is in charge of anybody. Your mom is in charge of everybody.','That\'s how it\'s always worked. Trust me. I was there.'],
     stay:{amy:{stay:['I survived conference night. I can survive you leaving.','Text me when you land. I\'m timing the flight. Don\'t lose.'],toast:'Amy runs home. She\'s timing that too.'}},
     flight:['Delta One. Nobody is grading me up here.','The flight attendant asked what I wanted. I said a nap. She laughed. I was SERIOUS.']},
  7:{sol:'LAX. I\'m taking the long way. There are squirrels on the short way.',
     tnb:['Bready Mercury is safe, the squirrels signed a treaty, and I owe the landlord a fence.','Go. I\'ll feed the starter. Twice a day, room temperature, no squirrels. I wrote it down.'],
     tnbToast:'TNB stays in LA. Bready Mercury is in good hands.',
     stay:{nara:{stay:['Nara spots a squirrel across the street. She looks at the squirrel. She looks at Tom.','She picks Tom. She leans on his legs for one long minute.','Then she picks the squirrel. Fair enough.'],toast:'Nara heads back to 2nd Ave. The squirrel situation is ongoing.',narrate:true}},
     flight:['Somewhere down there, a squirrel is plotting.','Not my problem. For six whole hours.']},
  8:{driver:['Los Angeles again? I\'m starting to think you live there.','The girls stay home. School tomorrow. Library books are due.'],
     grace:['Tata, I checked out a book about Los Angeles. Now I\'ll know where you are. Every minute.'],
     rose:['I checked out a book about a pig. It\'s not about Los Angeles. It\'s better.'],
     tom:['Both excellent choices. Return them on time.','That library has had enough excitement for one year.'],
     flight:['Six hours of quiet. The library would be proud.','...I already miss Rose shushing everybody at full volume.']},
  9:{sol:'Airport. No eating in my cab. I can smell the potluck on you. It smells amazing. Still no.',
     tnb:['Forty loaves, zero leftovers. Not bad for two guys and one oven.','Go open your fancy letter. Wear the blue shirt. I fixed the button. You\'re welcome.'],
     tnbToast:'TNB stays in LA. Somebody has to wash forty bread pans.',
     stay:{nara:{stay:['Nara is still full from the potluck. She lifts one paw. That\'s all she can manage.','Tom shakes it. "Deal. Back soon."','Nara lets out one very satisfied burp. Then she waddles home.'],toast:'Nara heads back to 2nd Ave. Slowly. Very full.',narrate:true}},
     flight:['A letter with a seal. Nobody sends a seal for good news.','Or do they? Six hours to think about it. Great.']}
};
// The departure for this airport run: the chapter it starts, if the current one is done (full story only).
function departureNow() {
  if(typeof STORY==='undefined'||STORY.mode!=='full'||!flag('ch'+STORY.chapter+'-done')) return {};
  return DEPARTURES[STORY.chapter+1]||{};
}

// Story arrivals: what Tom and the girls say when this chapter's flight lands (Tom, 26 Oct: no repeats). Keyed by the chapter the
// flight starts, like DEPARTURES. Westbound (even chapters) lands in LA: tom = Tom's pages at the cab. Eastbound (odd chapters)
// lands on Long Island: tom = Tom's landing page, then talk = [speaker, pages] in order after the hug. Chapters 2 and 3 (and any
// flight not starting a chapter, and the demo) keep the voiced default lines. New lines stay silent until baked.
const ARRIVALS={
  4:{tom:["Downtown LA. Seventy-two and sunny. I didn't have to check.","Six hours, no fish, and a pepper to find for Boppy. In that order."]},
  5:{tom:["Long Island. Quiet. Thursday is conference night. It won't stay quiet."],
     talk:[['Grace',["Tata! You're BACK! That's TWO times!","Mom made you a binder. It has TABS."]],
           ['Rose',["Did you bring the snacks? Tata. The SNACKS."]],
           ['Tom',["TNB packed them. Check my bag. Carefully. He also packed a note."]],
           ['Rose',["I'm checking NOW."]]]},
  6:{tom:["Downtown LA. Five hours and fifty-one minutes. Amy will want the number.","...Is that a squirrel on the cab? That's a squirrel on the cab."]},
  7:{tom:["Long Island. Quiet. Library quiet. That's a different kind."],
     talk:[['Grace',["Tata! THREE times! The library's still whispering. I SAID so. In a text."]],
           ['Rose',["It said my name. It said ROSE. Then it said shhh."]],
           ['Tom',["Then we go find out what it wants. After a sandwich."]],
           ['Grace',["I'm bringing a flashlight. And a pencil. For notes."]]]},
  8:{tom:["Downtown LA. It smells like somebody's grill. Everybody's grill.","TNB says bring an empty stomach and forty bread pans. I've got the stomach."]},
  9:{tom:["Long Island. No moon tonight. Somebody's going to make that my problem."],
     talk:[['Grace',["Tata! FOUR! I have a chart now. You're on it."]],
           ['Rose',["Deedee has your letter. She hasn't opened it. She's LOOKED at it. A lot."]],
           ['Tom',["A wax seal with a clock on it. I'd look at it a lot too."]],
           ['Rose',["I named the seal Flippers."]]]}
};
// The arrival for this airport run: the chapter it starts (full story only), if it lands where that chapter's lines expect.
function arrivalNow(dir) {
  if(typeof STORY==='undefined'||STORY.mode!=='full'||!flag('ch'+STORY.chapter+'-done')) return null;
  const n=STORY.chapter+1;
  return (dir==='west')===(n%2===0)?(ARRIVALS[n]||null):null;
}

function talkToDriver(n) {
  const inLA=regionOf(currentMap)==='la';
  const pages=n.visitedOnce?[]:npcLines(n);
  n.visitedOnce=true;
  pages.push(inLA?'Where to? The airport? It\'s always the airport.'
    :'Where to? Around town, or... the airport? I\'ve waited years for somebody to say airport.');
  openChoice(n.name,pages,[
    {label:inLA?'AIRPORT, PLEASE':'TO THE AIRPORT',fn:()=>startTrip(n,inLA?'east':'west')},
    {label:'JUST VISITING',fn:()=>openDialog(n.name,[inLA?'Okay. I\'ll be here. In traffic.':'Okay. Cab seven is ready when you are. Cab seven is always ready.'],n)}
  ],n);
}

function runScene(steps) {
  intro.active=true; intro.phase='scene'; intro.cur=null; intro.fade=0; intro.steps=steps;
  clearInput();
}

function startTrip(n,dir) {
  const steps=[],d=departureNow(),arr=arrivalNow(dir);
  if(dir==='west') {
    if(!girlsAway()&&memberHome('grace')!=='any') steps.push(
      S.talk('Sal',d.driver||['Los Angeles? You got it. Flights leave whenever I get there.',"One thing. The girls stay home. Amy's rule. No flying on a school night."]),
      S.talk('Grace',d.grace||['Tata, you\'re leaving AGAIN? You JUST got here!']),
      S.talk('Rose',d.rose||['Bring me back a palm tree. A small one. For my room.']),
      S.talk('Tom',d.tom||['I\'ll be back before you know it. Go home and listen to your mom.','Rose, I\'ll see what I can do about the palm tree.']),
      S.call(()=>{ setGirlsAway(true); sfx.doorOut(); showToast('Grace and Rose head home to the Gregori house.',3); }),
      S.wait(.9)
    );
    else steps.push(S.talk('Sal',['Los Angeles? You got it. Buckle up.']));
  } else {
    steps.push(S.talk('Sol',[d.sol||'Airport. Love it. We\'ll be there in twenty minutes. Or two hours. Nobody knows.']));
  }
  const dest=dir==='west'?'la':'le';
  for(const f of extras()) {
    const home=memberHome(f.id); if(home==='any'||home===dest) continue;   // party rules (engine/story.js) say who lives where
    if(f===tnb) steps.push(
      S.talk('TNB',d.tnb||['Well, well... this is where I get off. Glaze firing tomorrow, call time at five, and somebody has to water your plants.','Go. Hug the girls for me. I\'ll be right here, pot-sitive.']),
      S.call(()=>{ const tf=followers.find(x=>x.member===tnb); if(tf) { kiss={npc:tf,start:elapsedTime}; sfx.kiss(); } recruitLeave(tnb,true); showToast(d.tnbToast||'TNB stays in LA. Pottery, a shoot, and Tom\u2019s plants.',3.2); }),
      S.wait(.8));
    else if(TRAVEL_TALK[f.id]) { const tt=(d.stay&&d.stay[f.id])||TRAVEL_TALK[f.id]; steps.push(
      S.call(()=>{ if(f===nara) { sfx.whine&&sfx.whine(); } }),
      S.talk(tt.narrate?'Nara':f.name,tt.stay),
      S.call(()=>{ recruitLeave(f,true); sfx.doorOut(); showToast(tt.toast,3); }),
      S.wait(.6)); }
  }
  if(typeof storyTripSteps==='function') steps.push(...storyTripSteps(dir));   // engine/story.js: a new chapter can start here
  steps.push(...flightSteps(dir,d.flight,arr));
  runScene(steps);
}

// ---------- Flight cutscene ----------
function flightPhase(mode,dur) {
  return {t:0,start(){ this.t=0; intro.flight.mode=mode; intro.flight.t=0; flightSound(mode,intro.flight.dir); },
    update(dt){ this.t+=dt; intro.flight.t=this.t; return this.t>=dur; }};
}
function flightSound(mode,dir) {
  if(mode==='takeoff') {
    noise({dur:3.4,vol:.05,f0:250,f1:1400,type:'lowpass'});
    tone({type:'sawtooth',f0:70,f1:160,dur:3.2,vol:.03,sweep:'linear'});
  } else if(mode==='map') {
    tone({type:'sine',f0:880,dur:.35,vol:.08}); tone({type:'sine',f0:660,dur:.5,vol:.08,delay:.32});
    noise({dur:6.5,vol:.015,f0:400,f1:500,type:'lowpass',delay:.3});
  } else if(mode==='landing') {
    noise({dur:2.4,vol:.035,f0:900,f1:300,type:'lowpass'});
    noise({dur:.35,vol:.12,f0:3000,f1:800,delay:2.3});
    tone({type:'sine',f0:1200,f1:500,dur:.25,vol:.06,delay:2.3});
  }
}
function flightSteps(dir,talk,arr) {
  const west=dir==='west';
  return [
    S.call(()=>{ intro.flight={dir,mode:'board',t:0}; $('area-name').textContent='In flight'; $('eyebrow').textContent='DELTA ONE / SEAT 1A'; }),
    flightPhase('takeoff',4),
    S.all(flightPhase('map',8),
      S.seq(S.wait(1.6),S.talk('Tom',talk||(west
        ?['Delta One. Lie flat. Six whole hours where nobody asks me for a piggyback.','...I already miss the piggybacks.']
        :['Six hours. Then two small people will jump on me at full speed.','Worth it.'])))),
    flightPhase('landing',4.2),
    S.call(()=>{ intro.flight=null; }),
    ...(west?arriveLA(arr):arriveHome(arr))
  ];
}

function arriveAt(map,houseId) {
  currentMap=map;
  const h=houseById[houseId];
  player.x=h.door.x; player.y=h.door.y; player.facing='down'; player.move=null; player.hidden=false;
  placeFollowers();
  for(const f of followers) f.hidden=true;
  refreshAreaUI(); resize(); camera.snap=true;
  intro.fade=1;
  return h;
}
function arriveLA(arr) {
  let h=null;
  return [
    S.call(()=>{ h=arriveAt(worlds.blvd,'lacab'); }),
    S.wait(.6),
    S.call(()=>sfx.doorOut()),
    {start(){ this.s=S.walk(player,[[h.door.x,h.door.y+1]],.3); this.s.start(); },update(dt){ return this.s.update(dt); }},
    S.call(()=>{ for(const f of followers) { f.hidden=false; f.x=h.door.x; f.y=h.door.y; f.facing='down'; } }),
    S.talk('Tom',(arr&&arr.tom)||['Downtown LA. Seventy-two and sunny. It\'s always seventy-two and sunny.']),
    S.call(()=>{
      endIntro(); placeFollowers();
      sfx.levelChime();
      showToast(arr?'Welcome back to Los Angeles.':'Los Angeles! Downtown is here, Jefferson Park is south, monsters are up in Griffith Park.',arr?3:4.5);
      saveGame('auto',true);
    })
  ];
}
// Back on Long Island: Tom steps out of the taxi depot and the girls come running.
function arriveHome(arr) {
  const h=houseById.taxi,dx=h.door.x,dy=h.door.y,row=dy+2,gStart=10,rStart=9;
  const welcome=[];
  let g=null,r=null;
  welcome.push(
    S.call(()=>{
      arriveAt(town,'taxi');
      for(let y=dy+1;y<=dy+3;y++) for(let x=9;x<=27;x++) { const k=key(x,y); if(!town.npcNoGo.has(k)) { town.npcNoGo.add(k); intro.noGo.push(k); } }
      if(girlsAway()) setGirlsAway(false);
      for(const f of followers) { f.hidden=true; f.scr=null; f.lift=0; }
      ({g,r}=IA());
    }),
    S.wait(.6),
    S.call(()=>sfx.doorOut()),
    {start(){ this.s=S.walk(player,[[dx,dy+1],[dx,row]],.3); this.s.start(); },update(dt){ return this.s.update(dt); }},
    S.talk('Tom',(arr&&arr.tom)||['Long Island. Nice and quiet. For about four more seconds.']),
    S.call(()=>{ intro.bubble={text:'TATA!!!',t:0}; say('grace','introshout'); say('rose','introshout',.5); snd.gasp(); }),
    S.wait(.6),
    S.call(()=>{ player.facing='left';
      g.x=gStart; g.y=row; g.facing='right'; g.hidden=false;
      r.x=rStart; r.y=row+1; r.facing='right'; r.hidden=false; }),
    {start(){
        const gT=[],rT=[]; for(let x=gStart+1;x<=dx-1;x++) gT.push([x,row]); for(let x=rStart+1;x<=dx-1;x++) rT.push([x,row+1]);
        this.s=S.all(S.walk(g,gT,.11,i=>{ if(i%2) snd.patter(0); }),S.seq(S.wait(.25),S.walk(r,rT,.11,i=>{ if(i%2===0) snd.patter(1); })));
        this.s.start(); },
      update(dt){ return this.s.update(dt); }},
    S.call(()=>{ intro.bubble=null; g.facing='right'; r.facing='up'; }),
    hugStep(),
    ...(arr&&arr.talk?arr.talk.map(([who,pages])=>S.talk(who,pages)):[
    S.talk('Grace',['Tata! You\'re BACK! AGAIN!','Did you miss us? Say a big number.']),
    S.talk('Tom',['A very big number. The biggest one.']),
    S.talk('Rose',['Did you bring me a palm tree?']),
    S.talk('Tom',['I brought you a picture of a palm tree.']),
    S.talk('Rose',['...That\'s ALMOST a palm tree.'])]),
    S.call(()=>{
      endIntro();
      g.x=dx-1; g.y=row; g.facing='right'; g.move=null;
      r.x=dx-1; r.y=row+1; r.facing='up'; r.move=null;
      const f=followers.find(m=>m!==g&&m!==r); if(f) { f.x=r.x; f.y=r.y; f.move=null; }
      player.facing='down';
      trail.length=0; trail.push({x:r.x,y:r.y},{x:g.x,y:g.y},{x:player.x,y:player.y});
      sfx.levelChime();
      showToast('Grace and Rose rejoin the party!',3);
      saveGame('auto',true);
    })
  );
  return welcome;
}

// ---------- Drawing the flight ----------
// Small pixel grids built from shapes, outlined automatically.
function pixGrid(w,h,paint) {
  const g=Array.from({length:h},()=>Array(w).fill('.'));
  const api={
    put(x,y,c){ x=Math.round(x); y=Math.round(y); if(x>=0&&y>=0&&x<w&&y<h) g[y][x]=c; },
    rect(x0,y0,x1,y1,c){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) api.put(x,y,c); },
    poly(pts,c){ for(let y=0;y<h;y++) for(let x=0;x<w;x++) { const px=x+.5,py=y+.5; let ins=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++) { const [xi,yi]=pts[i],[xj,yj]=pts[j]; if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi) ins=!ins; } if(ins) g[y][x]=c; } }
  };
  paint(api);
  const src=g.map(r=>r.slice());
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(src[y][x]==='.') for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx=x+dx,ny=y+dy; if(nx>=0&&ny>=0&&nx<w&&ny<h&&src[ny][nx]!=='.') { g[y][x]='o'; break; } }
  return g.map(r=>r.join(''));
}
const PLANE_PAL={o:'#1d2430',w:'#f4f6f8',h:'#c9d1da',s:'#8e9aa8',t:'#2a5c8a',r:'#c94a3a',k:'#2b3440',q:'#9cd0e0',g:'#5a6270',y:'#ffe08a'};
// Side view, nose to the right.
const PLANE_SIDE=pixGrid(38,15,p=>{
  p.poly([[2,1],[5,1],[11,7],[2,7]],'t');
  p.rect(2,6,32,10,'w'); p.rect(33,7,34,10,'w'); p.rect(35,8,35,10,'w'); p.put(36,9,'w');
  p.rect(3,10,33,10,'h'); p.rect(4,9,31,9,'t'); p.rect(4,8,31,8,'r');
  for(let x=9;x<=28;x+=2) p.put(x,7,'k');
  p.rect(32,7,33,7,'q'); p.put(34,8,'q');
  p.rect(0,8,5,9,'s');
  p.poly([[13,10],[23,10],[18,14],[11,14]],'s');
  p.rect(18,11,22,12,'g'); p.put(23,11,'k'); p.put(23,12,'k');
});
const PLANE_SIDE_L=mirrorRows(PLANE_SIDE);
// Top view, nose to the right.
const PLANE_TOP=pixGrid(17,17,p=>{
  p.rect(2,7,13,9,'w'); p.rect(14,8,15,8,'w');
  p.poly([[9,8],[5,0.5],[3.5,0.5],[6,8],[3.5,15.5],[5,15.5]],'w');
  p.poly([[3,8],[1,4],[0,4],[1,8],[0,12],[1,12]],'w');
  p.rect(3,8,12,8,'h'); p.put(14,8,'q');
});
const flightCache={};
function spriteCanvas(rows,pal) {
  const k=rows.join('|'); if(flightCache[k]) return flightCache[k];
  const c=document.createElement('canvas'); c.width=rows[0].length; c.height=rows.length;
  const x=c.getContext('2d');
  rows.forEach((r,yy)=>{ for(let xx=0;xx<r.length;xx++) if(r[xx]!=='.') { x.fillStyle=pal[r[xx]]; x.fillRect(xx,yy,1,1); } });
  return flightCache[k]=c;
}
function drawRotated(img,cx,cy,sc,ang) {
  gfx.save(); gfx.translate(Math.round(cx),Math.round(cy)); gfx.rotate(ang); gfx.imageSmoothingEnabled=false;
  gfx.drawImage(img,-img.width*sc/2,-img.height*sc/2,img.width*sc,img.height*sc);
  gfx.restore();
}

// Continental US outline (lon, lat), simplified.
const US_OUTLINE=[[-124.7,48.4],[-123,49],[-95.2,49],[-95.2,49.4],[-89.6,48],[-84.8,46.6],[-83.5,46],[-82.4,43],[-79,43.3],[-76.5,44.2],[-74.7,45],[-71.5,45],[-69.2,47.4],[-67.8,47.1],[-67,44.8],[-70,43.7],[-70.6,42.6],[-70,41.8],[-71.9,41.3],[-74,40.6],[-74,39.7],[-75,38.9],[-75.9,37.3],[-76,36.9],[-75.5,35.3],[-77,34.6],[-79,33.3],[-81,31.5],[-81.4,30.3],[-80,26.8],[-80.4,25.2],[-81.1,25.1],[-81.8,26.5],[-82.8,28.2],[-83.6,29.9],[-85,29.7],[-86.5,30.4],[-88.5,30.4],[-89.6,30.2],[-89.4,29.1],[-90.5,29.1],[-91.5,29.5],[-93.8,29.7],[-95,29.2],[-97.2,27.6],[-97.4,26],[-99.1,26.4],[-99.5,27.5],[-101.4,29.8],[-103,29],[-104.5,29.6],[-106.5,31.8],[-108.2,31.8],[-111,31.3],[-114.8,32.5],[-117.1,32.5],[-118.5,34],[-120.6,34.6],[-121.9,36.6],[-122.5,37.8],[-123.8,39.6],[-124.2,40.4],[-124.2,42],[-124.5,43.4],[-124,46.2]];
const LAKES=[[-87.5,47.6,2.9,.55],[-87,43.9,.45,1.9],[-82.4,44.9,.8,1.1],[-81.2,42.2,1.7,.35],[-77.8,43.6,1.2,.3]];
const MAP_W=160,MAP_H=100;
const proj=(lon,lat)=>[8+(lon+125.5)/60.5*144,14+(49.8-lat)/26*80];
const SPOT={le:proj(-74.3,41.7),la:proj(-118.25,34.05)};
let usMap=null;
function buildUSMap() {
  const c=document.createElement('canvas'); c.width=MAP_W; c.height=MAP_H;
  const x=c.getContext('2d');
  const shape=(fill)=>{ x.fillStyle=fill; x.beginPath(); US_OUTLINE.forEach(([lo,la],i)=>{ const [px,py]=proj(lo,la); if(i) x.lineTo(px,py); else x.moveTo(px,py); }); x.closePath(); x.fill(); };
  shape('#8fb874');
  x.globalCompositeOperation='source-atop';
  // Desert southwest, plains in the middle, a greener east.
  x.fillStyle='#d8c08a'; x.beginPath(); x.moveTo(...proj(-125,36)); x.lineTo(...proj(-103,37.5)); x.lineTo(...proj(-102,28)); x.lineTo(...proj(-125,28)); x.fill();
  x.fillStyle='#a8c07a'; x.beginPath(); x.moveTo(...proj(-104,50)); x.lineTo(...proj(-96,50)); x.lineTo(...proj(-97,26)); x.lineTo(...proj(-103,29)); x.fill();
  x.globalCompositeOperation='source-over';
  x.fillStyle='#4f8fb8'; for(const [lo,la,rx,ry] of LAKES) { const [px,py]=proj(lo,la); x.beginPath(); x.ellipse(px,py,rx/60.5*144,ry/26*80,0,0,7); x.fill(); }
  // Crisp pixels: snap alpha and colors, then outline the coast.
  const img=x.getImageData(0,0,MAP_W,MAP_H),d=img.data;
  for(let i=0;i<d.length;i+=4) d[i+3]=d[i+3]>110?255:0;
  const land=(px,py)=>px>=0&&py>=0&&px<MAP_W&&py<MAP_H&&d[(py*MAP_W+px)*4+3]===255;
  const edge=[];
  for(let py=0;py<MAP_H;py++) for(let px=0;px<MAP_W;px++) if(!land(px,py)&&(land(px+1,py)||land(px-1,py)||land(px,py+1)||land(px,py-1))) edge.push(px,py);
  x.putImageData(img,0,0);
  x.fillStyle='#2f4a36'; for(let i=0;i<edge.length;i+=2) x.fillRect(edge[i],edge[i+1],1,1);
  // Mountains.
  for(const [lo,la] of [[-113,45],[-110,44],[-107,40],[-106,38],[-111,41],[-114,47],[-108,46],[-120,40],[-119,37.5],[-121,44],[-82,36],[-80,37.5]]) {
    const [px,py]=proj(lo,la).map(Math.round);
    x.fillStyle='#6a5a48'; x.fillRect(px-2,py+1,5,1); x.fillRect(px-1,py,3,1); x.fillRect(px,py-1,1,1);
    x.fillStyle='#f4f0e6'; x.fillRect(px,py-1,1,1);
  }
  return c;
}
function curvePoint(a,b,u) {
  const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2-26;
  const x=(1-u)*(1-u)*a[0]+2*(1-u)*u*mx+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*(1-u)*u*my+u*u*b[1];
  const dx=2*(1-u)*(mx-a[0])+2*u*(b[0]-mx),dy=2*(1-u)*(my-a[1])+2*u*(b[1]-my);
  return {x,y,ang:Math.atan2(dy,dx)};
}

function flightBox(vw,vh,talk=true) {
  const reserve=talk?(layout.landscape?162:300)/scale:safeBottom+10;
  const top=safeTop+4,availH=Math.max(60,H-top-reserve);
  let S=Math.min(W/vw,availH/vh); S=S>=2?Math.floor(S):Math.max(1,Math.floor(S*2)/2);
  return {S,ox:Math.round((W-vw*S)/2),oy:Math.round(top+(availH-vh*S)/2),top,availH};
}

function drawFlight(time) {
  const F=intro.flight; if(!F) return;
  if(F.mode==='board') { rect(0,0,W,H,'#141c1a'); return; }
  if(F.mode==='map') drawFlightMap(F,time);
  else drawFlightSide(F,time);
  // Fade in and out of each phase.
  const dur=F.mode==='map'?8:(F.mode==='takeoff'?4:4.2);
  const a=Math.max(0,1-F.t/.45,(F.t-(dur-.45))/.45);
  if(a>0) { gfx.globalAlpha=Math.min(1,a); rect(0,0,W,H,'#141c1a'); gfx.globalAlpha=1; }
}

// Takeoff and landing, seen from the side. Long Island is green and leafy; LA is palms and a sunset.
function drawFlightSide(F,time) {
  const land=F.mode==='landing',west=F.dir==='west';
  const inLA=(F.mode==='takeoff')!==west; // taking off from LA when flying east, landing in LA when flying west
  const facing=west?-1:1; // plane heads left when flying west
  const t=F.t,dur=land?4.2:4;
  const B=flightBox(128,84,false),S=B.S;
  const gy=B.oy+64*S; // ground line
  // Sky.
  const sky=inLA?['#3a2e5a','#6a3a6a','#a8486a','#d8605a','#f08a4a','#f6b45a','#f8d27a']
               :['#5f9fd8','#78b2e0','#90c4e8','#a8d4ec','#c4e2ee','#e2ecdc','#f4e6c4'];
  const bandH=Math.ceil(gy/sky.length);
  for(let i=0;i<sky.length;i++) rect(0,i*bandH,W,bandH+1,sky[i]);
  // Sun.
  const sunX=B.ox+(inLA?92:30)*S,sunY=gy-(inLA?6:44)*S;
  ellipse(sunX,sunY,13*S,13*S,inLA?'#f6c46a':'#fff0b8'); ellipse(sunX,sunY,10*S,10*S,inLA?'#fbe0a0':'#fffbe6');
  // Speed: the ground scrolls under the plane while it rolls, then slows as it climbs away.
  const speed=land?(t<2.6?60:Math.max(0,60*(1-(t-2.6)/1.4))):Math.min(70,t*40);
  const scroll=(F.scroll=(F.scroll||0)+speed*.016*(F.last!=null?Math.min(3,(time-F.last)*60):1)); F.last=time;
  const drift=-facing*scroll*S;
  // Far hills.
  const hill=inLA?'#5a3a5a':'#7fa8a0',hill2=inLA?'#7a4a62':'#8fb88a';
  for(let i=-1;i<W/(40*S)+2;i++) {
    const hx=((i*40*S+drift*.2)%(W+80*S)+W+80*S)%(W+80*S)-40*S;
    polygon([[hx,gy],[hx+20*S,gy-18*S],[hx+44*S,gy]],hill);
    polygon([[hx+24*S,gy],[hx+40*S,gy-11*S],[hx+60*S,gy]],hill2);
  }
  // Skyline (LA) or rooftops and trees (Long Island), moving at mid speed.
  for(let i=-1;i<W/(16*S)+2;i++) {
    const n=hash(i,inLA?3:5),bx=((i*16*S+drift*.45)%(W+32*S)+W+32*S)%(W+32*S)-16*S;
    if(inLA) {
      const bh=(8+n%22)*S; rect(bx,gy-bh,10*S,bh,'#3a2a4a');
      for(let k=0;k<3;k++) if((n>>>k)%3===0) rect(bx+2*S+k*3*S,gy-bh+3*S,S,S,'#f6d27a');
      if(n%4===0) { rect(bx+12*S,gy-24*S,S,24*S,'#2a1e36'); for(const [dx,dy] of [[-4,0],[4,0],[-3,-2],[3,-2],[0,-3]]) rect(bx+12*S+dx*S-S,gy-24*S+dy*S,3*S,S,'#2a1e36'); }
    } else {
      if(n%3===0) { rect(bx,gy-9*S,10*S,9*S,'#efe0c4'); polygon([[bx-S,gy-9*S],[bx+5*S,gy-14*S],[bx+11*S,gy-9*S]],['#be7051','#5f8a8f','#c0707e'][n%3]); }
      else { ellipse(bx+5*S,gy-8*S,6*S,7*S,['#d9763a','#c94a3a','#e8b04a','#6f9a52'][n%4]); rect(bx+4*S,gy-3*S,2*S,3*S,'#6a5040'); }
    }
  }
  // Ground and runway, with fields (home) or dry scrub (LA) rolling past below.
  rect(0,gy,W,H-gy,inLA?'#b49a6a':'#7fa868');
  for(let r=0;r*6*S+gy+16*S<H;r++) {
    const ry=gy+16*S+r*6*S,sp=drift*(1+r*.25);
    for(let i=-1;i<W/(30*S)+2;i++) {
      const n=hash(i,r+40),fx=((i*30*S+sp)%(W+60*S)+W+60*S)%(W+60*S)-30*S;
      if(inLA) { if(n%3===0) { ellipse(fx,ry,4*S,2*S,'#8a8a5a'); rect(fx-S,ry-2*S,S,S,'#a8a06a'); } else if(n%5===0) rect(fx,ry,3*S,S,'#9a8256'); }
      else rect(fx,ry,22*S,2*S,['#76a060','#88b06a','#6f9858','#94b874'][n%4]);
    }
  }
  rect(0,gy+3*S,W,10*S,'#4e4e56'); rect(0,gy+3*S,W,S,'#6a6a72');
  for(let i=-1;i<W/(16*S)+2;i++) { const rx=((i*16*S+drift)%(W+32*S)+W+32*S)%(W+32*S)-16*S; rect(rx,gy+8*S,8*S,S,'#f4f0e6'); }
  for(let i=-1;i<W/(24*S)+2;i++) { const lx=((i*24*S+drift)%(W+48*S)+W+48*S)%(W+48*S)-24*S; rect(lx,gy+2*S,S,S,Math.floor(time*4+i)%2?'#ffe08a':'#e8584a'); }
  // Foreground bushes, fastest layer.
  for(let i=-1;i<W/(56*S)+2;i++) {
    const px=((i*56*S+drift*1.6)%(W+112*S)+W+112*S)%(W+112*S)-56*S,py=gy+22*S;
    if(inLA) { ellipse(px,py-3*S,7*S,4*S,'#7d7a4a'); ellipse(px-2*S,py-5*S,4*S,3*S,'#9a9660'); }
    else { ellipse(px,py-4*S,8*S,6*S,'#4f7a4a'); ellipse(px-3*S,py-6*S,4*S,3*S,'#6a9a5a'); }
  }
  // The plane.
  let px,py,ang;
  const cx=B.ox+64*S,ground=gy+1*S;
  if(!land) {
    const lift=t<1.7?0:Math.pow((t-1.7)/2.3,1.4);
    px=cx+facing*lift*20*S; py=ground-5*S-lift*52*S; ang=-facing*Math.min(.22,(t<1.6?0:(t-1.6)*.4));
  } else {
    const k=Math.min(1,t/2.6),e=1-Math.pow(1-k,2);
    px=cx-facing*(1-e)*46*S; py=ground-5*S-(1-e)*46*S; ang=t<2.6?-facing*.06:0;
  }
  const img=spriteCanvas(facing<0?PLANE_SIDE_L:PLANE_SIDE,PLANE_PAL);
  ellipse(px,ground+2*S,13*S,2*S,'#00000030');
  drawRotated(img,px,py,S,ang);
  if((!land&&t<1.8)||(land&&t>2.4)) for(const dx of [-8,6]) { rect(px+facing*dx*S-S,py+6*S,2*S,2*S,'#1d2430'); }
  if(land&&t>2.5&&t<3.3) { const q=(t-2.5)/.8; gfx.globalAlpha=1-q; ellipse(px-facing*10*S-facing*q*14*S,ground-2*S,(4+q*6)*S,(2+q*2)*S,'#e8e2d6'); gfx.globalAlpha=1; }
  // Caption.
  const cap=land?(inLA?'LOS ANGELES':'LONG ISLAND'):(inLA?'LEAVING LOS ANGELES':'LEAVING LONG ISLAND');
  const ls=Math.max(2,Math.round(S*.7));
  label(cap,W/2+1,B.oy+6*S+1,'#1b2d27',ls); label(cap,W/2,B.oy+6*S,'#fff1cb',ls);
}

// Across the country: a plane on a dotted arc over a pixel map, clouds drifting under it.
function drawFlightMap(F,time) {
  if(!usMap) usMap=buildUSMap();
  const B=flightBox(MAP_W,MAP_H),S=B.S;
  rect(0,0,W,H,'#3f7fa8');
  for(let i=0;i<60;i++) { const n=hash(i,31),wx=n%W,wy=(n>>>9)%H,ph=Math.floor(time*1.5+i)%3; if(ph) rect(wx,wy,6,1,'#5a98bf'); }
  gfx.imageSmoothingEnabled=false;
  gfx.drawImage(usMap,B.ox,B.oy,MAP_W*S,MAP_H*S);
  const west=F.dir==='west',a=west?SPOT.le:SPOT.la,b=west?SPOT.la:SPOT.le;
  const u=Math.min(1,Math.max(0,(F.t-.6)/6.6)),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const V=(p)=>[B.ox+p[0]*S,B.oy+p[1]*S];
  // Trail.
  for(let k=0;k<=60;k++) { const q=k/60*e; if(k%3===2) continue; const c=curvePoint(a,b,q),[sx,sy]=V([c.x,c.y]); rect(sx-Math.max(1,S/2),sy-Math.max(1,S/2),Math.max(1,S),Math.max(1,S),'#fff6dc'); }
  // Markers.
  const star=(p,col)=>{ const [sx,sy]=V(p),r=Math.max(2,S*1.5); rect(sx-r,sy-r,r*2,r*2,'#1d2430'); rect(sx-r+1,sy-r+1,r*2-2,r*2-2,col); };
  star(SPOT.le,'#ffd968'); star(SPOT.la,'#f28a6a');
  const ls=Math.max(1,Math.round(S/2)),[lx,ly]=V(SPOT.le),[ax,ay]=V(SPOT.la);
  const tag=(txt,x,y)=>{ const w=(txt.length*4-1)*ls,cx=clamp(x,w/2+4,W-w/2-4); rect(cx-w/2-3,y-2,w+6,5*ls+4,'#1d2430cc'); label(txt,cx,y,'#fff1cb',ls); };
  tag('LONG ISLAND',lx-6*S,ly+4*S); tag('LOS ANGELES',ax+4*S,ay+4*S);
  // Clouds (with shadows) drifting east.
  for(let i=0;i<5;i++) {
    const n=hash(i,77),cx=((n%MAP_W)+time*(3+i))%(MAP_W+40)-20,cy=18+(n>>>8)%64;
    const [sx,sy]=V([cx,cy]);
    gfx.globalAlpha=.25; rect(sx+3*S,sy+5*S,14*S,3*S,'#1d2430');
    gfx.globalAlpha=.9; rect(sx,sy,14*S,3*S,'#ffffff'); rect(sx+3*S,sy-2*S,7*S,2*S,'#ffffff'); rect(sx+2*S,sy+3*S,10*S,S,'#e4ecf2');
    gfx.globalAlpha=1;
  }
  // The plane, with its shadow a little below.
  const c=curvePoint(a,b,e),[px,py]=V([c.x,c.y]),img=spriteCanvas(PLANE_TOP,PLANE_PAL),ps=Math.max(1,S);
  gfx.globalAlpha=.3; drawRotated(spriteCanvas(PLANE_TOP.map(r=>r.replace(/[^.]/g,'o')),PLANE_PAL),px+3*S,py+4*S,ps,c.ang); gfx.globalAlpha=1;
  drawRotated(img,px,py,ps,c.ang);
  // Header and time left.
  const hs=Math.max(1,Math.round(S*.75));
  const route=west?'LONG ISLAND > LOS ANGELES':'LOS ANGELES > LONG ISLAND';
  label(route,W/2+1,B.oy-2*hs+1,'#1d2430',hs); label(route,W/2,B.oy-2*hs,'#fff1cb',hs);
  const left=Math.max(0,Math.round((1-e)*360)),hh=Math.floor(left/60),mm=left%60;
  const tl=left?hh+'H '+String(mm).padStart(2,'0')+'M TO GO':'ARRIVING';
  label(tl,W/2+1,B.oy+MAP_H*S+4*hs+1,'#1d2430',hs); label(tl,W/2,B.oy+MAP_H*S+4*hs,'#ffd968',hs);
}

// Recruits stay in their own town (older saves could have them on the wrong coast).
// That rule now lives in the chapter's party rules (homes) in engine/story.js, applied after every load.

const LE_drawIntroScreen=drawIntroScreen;
drawIntroScreen=function(time) { LE_drawIntroScreen(time); if(intro.flight) drawFlight(time); };
// No menu in the middle of a cutscene.
const LE_openMenu=openMenu;
openMenu=function() { if(intro.active&&intro.phase==='scene') return; return LE_openMenu.apply(this,arguments); };
