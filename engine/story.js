'use strict';
// engine/story.js — The story engine (build plan session F1).
// 1. STORY: which mode and chapter we are in, story flags, and the hidden Heart-Traces counter (story bible section 5).
// 2. CHAPTERS: one entry per chapter with its party rules. Party rules replace the old hardcoded town rules:
//      lock   ids that can never be swapped out           force  ids pulled into the party when the chapter starts
//      bar    ids that cannot be in the party             allow  if set, the only recruits who may join
//      homes  member id -> 'le' | 'la' | 'any' (where they live; they say goodbye at the cab when Tom flies away)
//      decline  per recruit, what they say instead of the join offer when the rules keep them out
// 3. Cutscene scripts: a scene is a list of plain steps (see SCENE_OPS below), compiled to the intro step system and run
//    with playScene(script). Scripts live in data/scenes.js. Any object with start() and update() also works as a step.
// 4. Save v4: saves carry {story}. Older saves (v1, v2) are migrated when read; v3 Stampcards in engine/progress.js.
// Loaded after engine/nara.js, before data/scenes.js and engine/splash.js.

// ---------- 1. Story state ----------
const STORY={mode:'demo',chapter:0,flags:{},traces:0,traceLog:{},override:null};
function resetStory(mode='demo',chapter=0) {
  STORY.mode=mode; STORY.chapter=chapter; STORY.flags={}; STORY.traces=0; STORY.traceLog={}; STORY.override=null;
}
const flag=k=>STORY.flags[k];
function setFlag(k,v=true) { if(v===false||v==null) delete STORY.flags[k]; else STORY.flags[k]=v; }
// Heart-Traces: one count per warm interaction id per chapter (so it cannot be farmed by talking twice).
function heartTrace(id) {
  const k=STORY.chapter+':'+id;
  if(STORY.traceLog[k]) return false;
  STORY.traceLog[k]=1; STORY.traces++;
  return true;
}

// ---------- 2. Chapters and party rules ----------
const TOWN_HOMES={grace:'le',rose:'le',amy:'le',deedee:'le',boppy:'le',justin:'le',tnb:'la',nara:'la',olivia:'la'};
const DEFAULT_RULES={lock:['tom','grace','rose'],force:[],bar:[],allow:null,homes:TOWN_HOMES,decline:{}};
// Chapter 0 is the demo (Long Island and Los Angeles, free play). Chapters 1 to 20 follow the story bible;
// each chapter session (C1 to C20) fills in its rules and scenes.
const CHAPTERS=[
  {n:0,title:'Demo',party:{}},
  {n:1,title:'The Soup Dumpling Protocol',party:{allow:['deedee'],
    decline:{amy:'Twelve reading plans and a 5K in the morning. Take your mother. She has more energy than all of us.',
             boppy:'Not today. My stomach is doing something. Take Deedee. She already has her shoes on.'}},
    // No flights in chapter 1 (chapter 2 opens with the flight to LA).
    // After the chapter, the brakes are in: Sal's airport run starts chapter 2 (storyTripSteps).
    noFlight:()=>flag('ch1-done')?null
      :{lines:['Cab seven needs new brakes. She\'s parked until the part comes in.','Besides, you just got here. Go see your mother. She made crisp.']}},
  {n:2,title:'Smog on 2nd Avenue',party:{lock:['tom'],allow:['tnb','nara'],
    decline:{tnb:'Not right now, babe.',nara:'Nara wags, but stays put.'}},
    // Sol stays put until the smog is gone; after the chapter, his airport run starts chapter 3 (storyTripSteps).
    noFlight:()=>flag('ch2-done')?null
      :{lines:['Airport? You JUST landed. The smog has me grounded anyway. I can\'t see the freeway.','Go find your boyfriend. He called here twice asking if you landed.']}},
  {n:3,title:'Paces & Peppers',party:{allow:['boppy'],
    decline:{amy:'Science fair tomorrow and three of my kids are presenting. Take Dad fishing. He\'s been asking since you landed.',
             deedee:'Not this time, honey. I have three pies in and Boppy needs somebody to go fishing with. Take the girls.'}},
    // No flights once Tom is home for chapter 3 (the marsh comes first). After the chapter, Sal's airport run starts
    // chapter 4 (storyTripSteps).
    noFlight:()=>flag('ch3-done')?null
      :{lines:['Airport? You just got here. Your father has called the depot four times asking if you landed.','Something about a fish. He sounded very serious about the fish.']}},
  // Chapter 4: TNB's shoot at Sunset Gold Studios. TNB joins at the cab stand and is locked in by the scene (override);
  // Nara joins on Tom's porch in Jefferson Park. Sol stays put until the shoot wraps.
  {n:4,title:'Backlot Bedlam',party:{lock:['tom'],allow:['tnb','nara'],
    decline:{tnb:'Not right now, babe.',nara:'Nara wags, but stays put.'}},
    // After the wrap, Sol's airport run starts chapter 5 (storyTripSteps).
    noFlight:()=>flag('ch4-done')?null
      :{lines:['Airport? You JUST landed. Your young man is on a shoot. Go watch him be important.','The studio lot is at the east end of the boulevard. Big gate. Grumpy guard.']}},
  // Chapter 5: conference night at Long Island Elementary. Amy joins in the Square and is locked in by the scene (override).
  // Deedee bakes, Boppy rests. No flights until the conferences are over.
  {n:5,title:'Parent-Teacher Conference of Doom',party:{allow:['amy','justin'],
    decline:{deedee:'Not tonight, honey. I made a plate for the teachers. Somebody has to keep Boppy away from it.',
             boppy:'A school? At night? My stomach says no. My knees say absolutely not.'}},
    // After the parking lot, Sal's airport run starts chapter 6 (storyTripSteps).
    noFlight:()=>flag('ch5-done')?null
      :{lines:['Airport? On conference night? Your sister would find me. She\'d find me on foot. Fast.','Long Island Elementary is east of the Square. Follow the clipboard.']}},
  // Chapter 6: squirrels in Jefferson Park. TNB joins in Tom's kitchen and is locked in by the scene (override); Nara
  // joins on 2nd Ave. Sol stays put until Bready Mercury is home.
  {n:6,title:'The Great Squirrel Conspiracy',party:{lock:['tom'],allow:['tnb','nara'],
    decline:{tnb:'Not right now, babe.',nara:'Nara wags, but stays put.'}},
    // After Bready Mercury is home, Sol's airport run starts chapter 7 (storyTripSteps).
    noFlight:()=>flag('ch6-done')?null
      :{lines:['Airport? You JUST landed. Your young man called the depot. Something about your bread.','He said, and I quote, "tell him it\'s a bread emergency." I didn\'t know bread could have those.']}},
  // Chapter 7: the Hush Library is whispering. Tom, Grace and Rose go down into the Stacks; everybody else is busy.
  // No flights until the library is quiet again.
  {n:7,title:'The Whispering Stacks',party:{allow:[],
    decline:{amy:'Progress reports. Every one of them takes an hour, and every one deserves it. Take the girls. They both have library cards. I made sure.',
             deedee:'Not today, honey. Book club at four. We\'re reading the same book as last month. Nobody finished it.',
             boppy:'A library? I read a book once. 1974. It was about fish. It wasn\'t accurate.'}},
    noFlight:()=>flag('ch7-done')
      ?null
      :{lines:['Airport? You just got here. Your niece called the depot. From her mother’s phone.','She said, and I quote, "tell Tata the library is being WEIRD." She hung up before I could ask how.']}},
  // Chapter 8: the 2nd Ave potluck goes cold. TNB joins on 2nd Ave and is locked in by the scene (override); Olivia
  // hands over Nara. Sol stays put until the feast.
  {n:8,title:'Feast on Jefferson Park',party:{lock:['tom'],allow:['tnb','nara'],
    decline:{tnb:'Not right now, babe.',nara:'Nara wags, but stays put.'}},
    noFlight:()=>flag('ch8-done')
      ?null
      :{lines:['Airport? You JUST landed. Your young man said, and I quote, "forty loaves, babe."','I don\'t know what that means. It sounded serious.']}},
  // Chapter 9: the Moon Club. Deedee and Boppy join at the Rivituso house and are locked in by the scene (override);
  // Grace and Rose stay with Aunt Ellie; Amy is grading. No flights until the moon is back.
  {n:9,title:'The Moon Club Invitation',party:{allow:['deedee','boppy'],
    decline:{amy:'Report cards AND a 10K on Saturday. Go. Take Mom and Dad. Make Dad wear the tie.',
             deedee:'Not yet, honey. I\'m still deciding on earrings. Come back with the invitation.',
             boppy:'Not yet. I\'m still looking for the tie. I have one tie.'}},
    // After the moon is back, Sal's ride to Terminal Zero starts chapter 10 (data/scenes.js wraps talkToDriver).
    noFlight:()=>flag('ch9-done')
      ?null
      :{lines:['Airport? You just got here. Your mother called the depot. Three times. Something about a letter.','She said, and I quote, "tell him it has a SEAL."']}},
  // Chapter 10 (the Part 1 finale): every clock on Long Island stopped at midnight. Sal drives Tom, the girls and
  // Amy (she joins at the cab, locked in by the scene) to Terminal Zero at Long Island Regional. Sal only goes to Terminal
  // Zero until the clocks start again (data/scenes.js talkToDriver).
  {n:10,title:'Boarding Group Zero',party:{allow:['amy','justin'],
    decline:{deedee:'Not this time, honey. Somebody has to start Sunday dinner. Every clock in my kitchen says midnight and the roast doesn\'t care.',
             boppy:'An airport? At midnight? I\'m still recovering from the tie.'}},
    noFlight:()=>flag('ch10-done')?null
      :{lines:['Airport? Every clock in town says midnight. The planes aren\'t going anywhere.','Terminal Zero, though. Terminal Zero is open.']}},
  {n:11,title:'The Layover Between Worlds',start:{map:'grands',x:8,y:10},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','tnb','nara'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>({lines:['Airport? Tom. You’re on a layover. I don’t fly layovers. I just wave at them.']})},
  {n:12,title:'Welcome to Jefferson Park, Girls',start:{map:'jpark',x:8,y:19},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch12-done')?{lines:['Sal called from the East Coast. He is working on a way under the dome.','Chapter 13 is coming. Until then, the cab stand has coffee.']}
      :{lines:['Airport? Tom. You just got home. Show the girls the house first.']}},
  {n:13,title:'The Subway Beneath the Sea of Clouds',
    party:{lock:['tom','amy','tnb','nara'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch13-done')?{lines:['Chapter 14 is coming. Boppy is at the gate, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. The way in is under the world. Take the Metro stairs on the boulevard.']}},
  {n:14,title:'The Rikers Wall of Rivituso Row',start:{map:'row',x:17,y:13},
    party:{lock:['tom','amy','grace','rose'],allow:['amy','justin'],bar:['tnb','nara','deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch14-done')?{lines:['Chapter 15 is coming. The dinner table is set for eight, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Your father is standing in the gate in a bucket. Go and see him first.']}},
  {n:15,title:'The Eight-Seat Dinner Table',start:{map:'grands',x:8,y:10},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','deedee','boppy','tnb','nara'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch15-done')?{lines:['Chapter 16 is coming. Vance wants a family photograph in the Square, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Dinner is at six. Five means four thirty.']}},
  // Chapter 16 (tragedy): the photograph in the Square. The scene itself runs on a party override (Tom, Grace, Rose, Amy out front, TNB and Nara on
  // the bench); once Deedee and Boppy are stone and the girls run for Cab 7, these are the rules: Tom, Amy, TNB and Nara fight, nobody else.
  {n:16,title:'The Amber Eclipse',start:{map:'town',x:13,y:18},
    party:{lock:['tom','amy','tnb','nara'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy','grace','rose'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch16-done')?{lines:['Chapter 17 is coming. Long Island is under glass, and the cab stand has coffee nobody is drinking.']}
      :{lines:['Airport? Tom. Not today. Not this.']}},
  // Chapter 17: two strike teams of three (see data/scenes-ch17.js). Grace and Rose are never benched (a bench save would break loading), so they
  // are the stairs team; Amy, TNB and Nara are the shelves team. The service hatch on landing 30 swaps who is out front.
  {n:17,title:'Ascent of the Glass Tower',start:{map:'lacab',x:7,y:6},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch17-done')?{lines:['Chapter 18 is coming. The pinnacle lift is waiting, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Not now. The tower is right there. Go up.']}},
  // Chapter 18: the top of the Glass Tower. The same six as chapter 17's finish: Tom, Grace, Rose, Amy out front, TNB and Nara on the bench.
  // At the end Tom is gone (flag 'tom-gone', engine/tom-gone.js): he leaves `party`, TNB leads, and these rules keep working for the rest.
  {n:18,title:'No Touching, Please.',start:{map:'towervault',x:10,y:3},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch18-done')?{lines:['Chapter 19 is coming. Nobody is going to the airport. Nobody is going anywhere without Tom.']}
      :{lines:['Airport? Tom. Not now. Floor sixty.']}},
  // Chapter 19: Tom is gone (flag 'tom-gone') until he bursts back into the Censor fight (data/scenes-ch19.js). Grace, Rose, Amy and TNB fight, Nara is on the bench.
  // Deedee and Boppy are stone until the feast thaws them; the chapter ends with the eight of them in the Vault.
  {n:19,title:'The Unsent Dead-Letter Office',start:{map:'jpark',x:8,y:19},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch19-done')?{lines:['Chapter 20 is coming. The sky has a clock in it now, and the cab stand has coffee.']}
      :{lines:['Airport? Not today. Today you find Tom.']}},
  // Chapter 20 (the finale): all eight climb. Tom, Grace and Rose are always out front, the fourth slot swaps at the Core bench, the rest wait on the bench.
  // The Deedee/Boppy bar is lifted. Julian's fights call BENCH CALL for the signature specials (data/ch20-battle.js).
  {n:20,title:'The Forever Engine & The Open Sky',start:{map:'towervault',x:10,y:3},
    party:{lock:['tom','grace','rose'],allow:['amy','justin','deedee','boppy','tnb','nara'],homes:{amy:'any',justin:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch20-done')?{lines:['The train runs both coasts now. Sal is thrilled and very confused about his job.']}
      :{lines:['Airport? Tom. Not now. There is a man in a clock who needs dinner.']}}
];
const MEMBERS=()=>({tom:hero,grace,rose,amy,deedee,boppy,tnb,nara,justin,olivia});
function chapterInfo(n=STORY.chapter) { return CHAPTERS[n]||CHAPTERS[0]; }
function partyRules() {
  const c=chapterInfo(),o=STORY.override||{};
  const r=Object.assign({},DEFAULT_RULES,c.party||{},o);
  r.homes=Object.assign({},DEFAULT_RULES.homes,(c.party&&c.party.homes)||{},o.homes||{});
  r.decline=Object.assign({},(c.party&&c.party.decline)||{},o.decline||{});
  return r;
}
function memberHome(id) { return partyRules().homes[id]||'any'; }
// Justin (Tom, 31 Oct): can be recruited from the Gregori house on Long Island in ANY chapter, so the chapters' `allow` lists do not apply to him.
// Only a `bar`, the region (his home is 'le') and justinStays() keep him out. He swaps with Amy or anyone unlocked in the fourth slot, or joins freely when it is empty.
// justinStays: the chapters where a scene already stages Justin himself (he is at work in chapter 5 until the conferences end, and in chapter 10 until
// he walks in at the midnight dinner; the Nine Scoops bonus uses him as a scripted character), so he cannot be pulled into the party there.
function justinStays() {
  const c=chapterInfo();
  if(c.bonus) return true;
  if(STORY.chapter===5&&flag('ch5-done')!==true) return true;
  if(STORY.chapter===10&&flag('ch10-done')!==true) return true;
  return false;
}
// Can this member be in the party right here, right now?
function canBeHere(m) {
  const r=partyRules();
  if(r.bar.includes(m.id)) return false;
  if(m===justin) { if(justinStays()) return false; }
  else if(m===olivia) { if(STORY.chapter<6) return false; }
  else if(r.allow&&!r.allow.includes(m.id)&&m!==hero&&m!==grace&&m!==rose&&!r.force.includes(m.id)) return false;
  const h=(m===olivia&&STORY.chapter>=11)?'any':memberHome(m.id);
  return h==='any'||h===regionOf(currentMap);
}
function canLeave(m) { const r=partyRules(); return m!==hero&&!r.lock.includes(m.id)&&!r.force.includes(m.id); }
function declineLine(m) {
  const r=partyRules();
  return r.decline[m.id]||'Not this time, Tom. Come find me later.';
}
// Find a member's home NPC in any map (used to pull them into the party from a script or a save).
function homeNpcOf(m) {
  for(const [id,map] of Object.entries(worlds)) { const npc=map.npcs.find(n=>n.name===m.name&&!n.girlAtHome); if(npc) return {npc,map}; }
  return null;
}
function forceJoin(m,quiet=true) {
  if(inParty(m)) return true;
  if(m===grace||m===rose) { setGirlsAway(false); return true; }
  const h=homeNpcOf(m); if(!h) return false;
  if(party.length>=PARTY_MAX) { const out=extras().find(canLeave); if(!out) return false; recruitLeave(out,true); }
  recruitJoin(m,h.npc,true,h.map);
  if(!quiet) { sfx.levelChime(); showToast(m.name+' joins the party!',2.6); }
  return true;
}
function forceLeave(m,quiet=true) {
  if(!inParty(m)||m===hero) return;
  if(m===grace||m===rose) { setGirlsAway(true); return; }
  recruitLeave(m,quiet);
}
// Make the party obey the current rules: barred, disallowed or out-of-town members go home; forced ones join.
function applyPartyRules() {
  const r=partyRules(),M=MEMBERS();
  for(const m of extras()) if(!canBeHere(m)) recruitLeave(m,true);
  for(const id of r.bar) if(M[id]&&(M[id]===grace||M[id]===rose)) forceLeave(M[id]);
  for(const id of r.force) if(M[id]) forceJoin(M[id]);
  placeFollowers();
  if(typeof menuChar!=='undefined'&&menuChar>=party.length) menuChar=0;
}
function setChapter(n,{apply=true}={}) {
  STORY.chapter=n; STORY.override=null; delete STORY.flags.goal;
  if(apply) applyPartyRules();
}

// Recruiting asks the rules first. Members the chapter keeps out say nothing extra (Tom, 26 Oct: no decline lines;
// their normal talk already played). Only unlocked members are offered as swaps.
offerRecruit=function(m,npc) {
  const t=RECRUIT_TALK[m.id];
  if(!canBeHere(m)) return;
  const join=LINES[m.id]&&LINES[m.id].join?pick(LINES[m.id].join):null;
  if(join) say(m.id,'join',.15,join);
  openChoice(npc.name,join?[join,t.ask]:t.ask,[
    {label:'YES, COME ALONG',fn:()=>{
      if(party.length<PARTY_MAX) { recruitJoin(m,npc); return; }
      const out=extras().filter(canLeave);
      if(!out.length) { openDialog(npc.name,['The party is full, and nobody can sit this one out right now.'],npc); return; }
      openChoice(npc.name,t.swap,[
        ...out.map(e=>({label:'SWAP OUT '+e.name.toUpperCase(),fn:()=>recruitJoin(m,npc,false,currentMap,e)})),
        {label:'CANCEL',fn:()=>openDialog(npc.name,[t.no],npc)}
      ],npc);
    }},
    {label:'NOT RIGHT NOW',fn:()=>openDialog(npc.name,[t.no],npc)}
  ],npc);
};

// ---------- 3. Cutscene scripts ----------
// Steps (one op per object; extra keys are its options):
//   {wait:sec}                                 {call:fn}                           {step:<raw step>}
//   {talk:'Name',lines:[..]|'text',voice:[[id,kind],..]}
//   {walk:actor,to:[[x,y],..],speed:.3,onStep:fn}   {face:actor,dir:'left'}   {place:actor,at:[x,y],dir}
//   {hop:actor,from:[x,y],to:[x,y],time:.5,arc:20,lift:[0,28]}
//   {show:actor} {hide:actor}                  {fade:'out'|'in',time:.6}
//   {flag:'name',value:true}                   {chapter:n}                         {card:n}  (chapter title card)
//   {battle:'monsterId'}  waits for the fight to end; sets flag 'battle:<id>' to 'win' or 'lose' (also a map monster, or a function returning one)
//   {give:'itemId'}  {join:'deedee'}  {leave:'amy'}  {party:{lock,force,bar,allow,homes}} (chapter override, null clears)
//   {trace:'id'}  (Heart-Trace)  {toast:'text',time}  {sfx:'name'}  {say:[id,kind]}  {save:true}  (autosave)
//   {noGo:[x0,y0,x1,y1]}  keeps villagers out of that box until the scene ends
//   {all:[..]} run together  {seq:[..]} run in order  {if:'flag'|fn,then:[..],else:[..]}
// Actors: 'tom' (or 'player'), a member id ('grace', 'rose', ...: their follower), an NPC name on the current map, or the object.
// Positions: [x,y], or a function returning [x,y] when the step starts (so scripts can depend on where things are).
function sceneActor(a) {
  if(a&&typeof a==='object') return a;
  if(a==='tom'||a==='player') return player;
  const M=MEMBERS(); if(M[a]) { const f=followers.find(f=>f.member===M[a]); if(f) return f; }
  return currentMap.npcs.find(n=>n.name===a||n.name.toLowerCase()===String(a).toLowerCase())||null;
}
const scenePos=p=>typeof p==='function'?p():p;
let sceneCam=null;   // {cam:[x,y]} holds the camera on a tile while a scene flings people about; {cam:null} lets it follow Tom again (also cleared when a scene ends)
const lazy=fn=>({start(){ this.s=fn(); this.s.start(); },update(dt){ return this.s.update(dt); }});
const SCENE_OPS={
  wait:o=>S.wait(o.wait),
  call:o=>S.call(o.call),
  step:o=>o.step,
  talk:o=>S.talk(o.talk,Array.isArray(o.lines)?o.lines:[o.lines],o.voice),
  walk:o=>lazy(()=>{ const a=sceneActor(o.walk); storyHold(a); if(a) a.stagePlaced=true; return S.walk(a,scenePos(o.to),o.speed||.3,o.onStep); }),
  face:o=>S.call(()=>{ const a=sceneActor(o.face); if(a) { a.facing=o.dir; a.stageFaced=true; } }),
  place:o=>S.call(()=>{ const a=sceneActor(o.place),[x,y]=scenePos(o.at); if(!a) return; storyHold(a); a.stagePlaced=true; a.x=x; a.y=y; a.move=null; a.scr=null; if(o.dir) a.facing=o.dir; }),
  hop:o=>lazy(()=>{ const l=o.lift||[0,0]; return S.hop(sceneActor(o.hop),scenePos(o.from),scenePos(o.to),o.time||.5,o.arc||16,l[0],l[1]); }),
  // Battle poses in a cutscene (Tom, Grace, Rose). {pose:'rose',f:'kneel',dir:'left'} holds a battle frame (hurtPose, kneel, ko, ...) until {pose:'rose',f:null}.
  cam:o=>S.call(()=>{ sceneCam=o.cam||null; }),
  // {zoom:1.6,time:.8}: eases the outdoor camera in (above 1) or back out ({zoom:1}) while the scene plays; the camera stays on Tom or the {cam} tile.
  zoom:o=>({t:0,start(){ this.t=0; this.a=sceneZoom; sceneZoomManual=true; },
    update(dt){ this.t+=dt; const u=Math.min(1,this.t/(o.time||.8)); setSceneZoom(this.a+(o.zoom-this.a)*ease(u)); return u>=1; }}),
  pose:o=>S.call(()=>{ const a=sceneActor(o.pose); if(!a) return; if(o.f||o.foe) { a.scenePose={f:o.f,foe:o.foe,end:o.end,dir:o.dir||(o.end?(position(a).x>position(player).x?'left':'right'):'left'),fps:o.fps,mid:o.mid}; if(o.mid&&typeof storyPosesLoad==='function') storyPosesLoad(o.mid); } else { a.scenePose=null; a.lift=0; } }),   // mid: the story sheet owner for an NPC with no member (a painted em_ pose on Deedee)
  // {knock:'tom',to:[x,y],delay,fly,arc,dir}: thrown to a spot (hurt frame in the air), lands with a bounce, then lies there (KO frame) until a getup.
  knock:o=>lazy(()=>{ const a=sceneActor(o.knock),to=scenePos(o.to),fly=o.fly||.42,dl=o.delay||0,arc=o.arc||22; let t=0,from=null,dir='left';
    return {start(){ t=0; storyHold(a); const p=position(a); from=[p.x,p.y]; dir=o.dir||(to[0]<from[0]?'left':'right'); a.move=null; a.scr={x:from[0],y:from[1]}; },
      update(dt){ t+=dt; if(t<dl) return false;
        const u=Math.min(1,(t-dl)/fly),e=ease(u);
        if(u<1) { a.scr={x:lerp1(from[0],to[0],e),y:lerp1(from[1],to[1],e)}; a.lift=Math.sin(Math.PI*u)*arc; a.scenePose={f:'hurtPose',dir:dir==='left'?'right':'left'}; return false; }
        const b=(t-dl-fly)/.16; a.scr={x:to[0],y:to[1]}; a.scenePose={f:'ko',dir}; a.lift=b<1?Math.sin(Math.PI*b)*5:0; return b>=1; }}; }),
  // {getup:'tom',to:[x,y],delay,kneel,dir}: kneels (sliding to the tile it will stand on), then stands facing dir (default down).
  getup:o=>lazy(()=>{ const a=sceneActor(o.getup),to=scenePos(o.to),dl=o.delay||0,kn=o.kneel||.5; let t=0,from=null,dir='left';
    return {start(){ t=0; const p=position(a); from=[p.x,p.y]; dir=a.scenePose?a.scenePose.dir:'left'; },
      update(dt){ t+=dt; if(t<dl) return false; const r=(t-dl)/kn;
        if(r<1) { const e=ease(r); a.scr={x:lerp1(from[0],to[0],e),y:lerp1(from[1],to[1],e)}; a.lift=0; a.scenePose={f:'kneel',dir}; return false; }
        a.scenePose=null; a.lift=0; a.scr=null; a.move=null; a.x=to[0]; a.y=to[1]; a.facing=o.dir||'down'; return true; }}; }),
  show:o=>S.call(()=>{ const a=sceneActor(o.show); if(a) a.hidden=false; }),
  hide:o=>S.call(()=>{ const a=sceneActor(o.hide); if(a) a.hidden=true; }),
  // {fadeActor:'Long coat',to:1,time:.6}: a person fades in (to 1) or out (to 0) where they stand; 1 clears the fade
  fadeActor:o=>({t:0,start(){ this.t=0; this.a=sceneActor(o.fadeActor); this.f=this.a?(this.a.fade!=null?this.a.fade:(o.to?0:1)):0; },
    update(dt){ const a=this.a; if(!a) return true; this.t+=dt; const u=Math.min(1,this.t/(o.time||.6)); a.fade=this.f+((o.to||0)-this.f)*u; if(u>=1&&a.fade>=1) a.fade=null; return u>=1; }}),
  fade:o=>({t:0,start(){ this.t=0; intro.fadeLock=true; this.a=o.fade==='out'?intro.fade:Math.max(intro.fade,1); },
    update(dt){ this.t+=dt; const u=Math.min(1,this.t/(o.time||.6)); intro.fade=o.fade==='out'?this.a+(1-this.a)*u:this.a*(1-u);
      if(u>=1&&o.fade==='in') intro.fadeLock=false; return u>=1; }}),
  flag:o=>S.call(()=>setFlag(o.flag,o.value===undefined?true:o.value)),
  chapter:o=>S.call(()=>setChapter(o.chapter)),
  partCard:o=>({t:0,start(){ this.t=0; intro.card={part:o.partCard,title:o.title,t:0,done:!!o.done}; sfx.levelChime&&sfx.levelChime(); },
    update(dt){ this.t+=dt; intro.card.t=this.t; if(this.t>=(o.time||3)) { intro.card=null; return true; } return false; }}),
  partClear:o=>S.call(()=>savePartClear()),
  card:o=>({t:0,start(){ this.t=0; if(!o.done) cardBackdrop(o.card); intro.card={n:o.card,t:0,done:!!o.done}; sfx.levelChime&&sfx.levelChime(); },
    update(dt){ this.t+=dt; intro.card.t=this.t; if(this.t>=(o.time||3)) { intro.card=null; return true; } return false; }}),
  battle:o=>({start(){ this.m=typeof o.battle==='function'?o.battle():typeof o.battle==='object'?o.battle:findMonster(o.battle); this.go=false; if(this.m) { startBattle(this.m,{tut:o.tut,level:o.level}); this.go=true; } },
    update(){ if(!this.go) return true; if(battle.active) return false;
      setFlag('battle:'+(this.m.monster||o.battle),B2.result==='win'?'win':'lose'); return true; }}),
  give:o=>S.call(()=>grantItem(o.give)),
  join:o=>S.call(()=>{ const m=MEMBERS()[o.join]; if(m) forceJoin(m,!!o.quiet); }),
  leave:o=>S.call(()=>{ const m=MEMBERS()[o.leave]; if(m) forceLeave(m,o.quiet!==false); }),
  party:o=>S.call(()=>{ STORY.override=o.party; applyPartyRules(); }),
  trace:o=>S.call(()=>heartTrace(o.trace)),
  // A "Goal: ..." toast is a quest update: it is stored silently (no popup, nothing waits on it) and the location label
  // pulses until the player taps it (watchObjective below). Every other toast shows as before.
  toast:o=>S.call(()=>{ if(/^Goal: /.test(o.toast)) { const prev=flag('goal'),nt=o.toast.slice(6);
    if(prev&&prev!==nt) { const Lg=Array.isArray(flag('goalLog'))?flag('goalLog').slice():[]; Lg.push({c:flag('goalCh')||STORY.chapter,t:prev}); setFlag('goalLog',Lg.slice(-80)); }
    setFlag('goal',nt); setFlag('goalCh',STORY.chapter); refreshObjective(); return; } return; /* scene toasts are silent: objectives pulse the label, nothing pops up */ }),
  sfx:o=>S.call(()=>{ const f=sfx[o.sfx]; if(f) f(); }),
  say:o=>S.call(()=>say(o.say[0],o.say[1],o.say[2])),
  save:o=>S.call(()=>saveGame('auto',true)),
  noGo:o=>S.call(()=>{ const [x0,y0,x1,y1]=scenePos(o.noGo),map=currentMap;
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) { const k=key(x,y); if(!map.npcNoGo.has(k)) { map.npcNoGo.add(k); intro.noGo.push({map,k}); } } }),
  spawn:o=>S.call(()=>storySpawn(o.spawn)),
  despawn:o=>S.call(()=>storyDespawn(o.despawn)),
  hold:o=>S.call(()=>{ for(const a of [].concat(o.hold)) { const n=sceneActor(a); if(n) storyHold(n); } }),
  heal:o=>S.call(()=>{ for(const m of party) m.hp=m.maxHp; if(typeof b6Badge==='function') b6Badge(); }),
  hearts:o=>S.call(()=>{ const a=sceneActor(o.hearts)||player; for(let k=0;k<6;k++) setTimeout(()=>intro.hearts.push({x:a.x+.5+(Math.random()-.5),y:a.y-.6,t:0}),k*140); }),
  all:o=>S.all(...compileScene(o.all)),
  seq:o=>S.seq(...compileScene(o.seq)),
  if:o=>lazy(()=>{ const ok=typeof o.if==='function'?o.if():!!flag(o.if); return S.seq(...compileScene((ok?o.then:o.else)||[])); })
};
// A battle pose borrowed for a cutscene: a.scenePose={f:'hurtPose'|'kneel'|'ko'|...,dir:'left'|'right'}, or a painted story pose f:'st_reach' etc. (STORY_POSES) (set by the pose, knock and getup steps above).
// Called by drawSheetActor (engine/town-render.js) with the overworld set and its scale k. Returns {rows,k,pal}, or null to draw the normal overworld frame.
// Battle frames are about twice the overworld figure's height in rows, so they are drawn at k * (overworld rows / battle idle rows) to match Tom's size.
// Battle frames face left; the KO frame faces right. A frame facing the wrong way is mirrored (cached on the rows).
// facing1 (Tom 2026-11-14 08:39, chapter 1 grey grass: "only Grace should be facing right ... everyone else should be mirror image").
// Which screen side a person in a mood or talking pose should be turned to: 'l', 'r', or null (no clear side: draw as painted).
// 1. Gathered around an object ({around}, item1): toward the object, unless they stand over its middle.
// 2. Turned left or right on the map: that way (conversations stand people facing each other, cutstage1).
// 3. Turned up or down: toward the speaker (a listener), or toward the middle of everyone else in the scene (the speaker).
// POSE_FACING (data/pose-facing.js, from docs/pose-facing.tsv) says which way each painting leans; front paintings are never mirrored.
function poseFacingWant(a) {
  const p=position(a),ax=p.x+.5,side=dx=>dx<0?'l':'r';
  const st=typeof intro!=='undefined'&&intro.objStage;
  if(st&&st.walkers&&st.walkers.includes(a)) { const dx=(st.R.x0+st.R.x1)/2-ax; if(Math.abs(dx)>.3) return side(dx); }
  if(a.facing==='left') return 'l'; if(a.facing==='right') return 'r';
  const spk=typeof EMO!=='undefined'&&EMO.spk;
  if(spk&&spk!==a&&!spk.hidden) { const dx=position(spk).x-p.x; if(Math.abs(dx)>=.5) return side(dx); }
  const others=[player,...followers].filter(o=>o&&o!==a&&!o.hidden&&!o.seat);
  if(spk&&spk!==a&&!others.includes(spk)) others.push(spk);
  if(!others.length) return null;
  const dx=others.reduce((t,o)=>t+position(o).x,0)/others.length-p.x;
  return Math.abs(dx)>=.5?side(dx):null;
}
const SCENE_POSE_RATIO={};
function scenePoseDraw(a,set,k) {
  const m=a.isPlayer?(typeof playerMember==='function'?playerMember():hero):a.member,P=a.scenePose; if(!P) return null;
  if(P.end&&P.foe&&typeof endPoseDraw==='function') return endPoseDraw(a,set,k,P);   // a painted boss-ending frame on a person (engine/boss-finale.js)
  // A painted story pose (data/story-poses-use.js): already at the overworld row scale, facing the camera as painted, no outfit tint.
  // P.mid names the member whose set it is when the actor has none (a mood pose on an NPC, engine/emotions.js).
  const mid=P.mid||(m&&m.id),st=mid&&typeof STORY_POSES!=='undefined'&&STORY_POSES[mid];
  if(st&&st[P.f]) { let rows=st[P.f];
    const lean=P.emo&&typeof POSE_FACING!=='undefined'&&POSE_FACING[mid+'|'+P.f],want=lean&&poseFacingWant(a);   // facing1: a mood or talking painting leaning away from who they look at is mirrored
    if(want&&want!==lean) rows=rows._mir||(rows._mir=mirrorRows(rows));
    return {rows,k,pal:st.pals[P.f],story:true}; }
  if(!m) return null;
  const sp=BATTLE_SPRITES[m.id]; if(!sp) return null;
  let rows,native='left',pal=sp.pal,rel=1;
  if(P.f==='ko') { const ko=typeof KO_SPRITES!=='undefined'&&KO_SPRITES[m.id]; if(!ko) return null; rows=ko.rows; native='right'; pal=ko.pal||pal; rel=(ko.scale||sp.scale)/sp.scale; }
  else rows=sp[P.f];
  if(!rows) return null;
  const vis=r=>{ let t=0,b=r.length-1; while(t<b&&!/[^.]/.test(r[t])) t++; while(b>t&&!/[^.]/.test(r[b])) b--; return b-t+1; };
  const ratio=SCENE_POSE_RATIO[m.id]||(SCENE_POSE_RATIO[m.id]=vis(set.down[0])/vis(sp.idle));
  if(P.dir&&P.dir!==native) rows=rows._mir||(rows._mir=mirrorRows(rows));
  return {rows,k:k*ratio*rel,pal};
}
// ---------- Boss staging (Tom, 2026-11-08) ----------
// "In any scene before or after a boss, the characters in the party spread out so none are overlapping and they all face the
// right direction." {gather:focus} spreads Tom's party around him on free tiles and turns everyone (Tom too) to face the focus:
// a boss name, an NPC name, a monster id on this map, [x,y], or a function returning one of those.
// Figures are about 0.6 tile wide and 2.4 tiles tall, so two people overlap when they share a column within 2 rows; the
// slots never do that. Party members a scene placed or walked itself (a.stagePlaced) keep their marks and count as taken
// spots; members a scene turned ({face}) keep their facing. {gather:focus,check:true} only acts when someone overlaps
// (then it re-spreads) or faces the wrong way (then it turns them). BOSS_STAGE (below) adds these to every boss scene.
function stageFocus(f) {
  if(typeof f==='function') f=f();
  if(Array.isArray(f)&&typeof f[0]==='number') return {x:f[0],y:f[1],seen:true};
  if(Array.isArray(f)) {   // several candidates (the monster, then the villain who calls it): the first one standing in view, else the first that exists
    const found=f.map(n=>typeof n==='string'?(sceneActor(n)||currentMap.npcs.find(m=>m.monster===n)):n).filter(Boolean);
    const a=found.find(n=>!n.hidden)||found[0]; return a?stageFocus(a):null;
  }
  if(f&&typeof f==='object'&&'x' in f) { const p=position(f); return {x:Math.round(p.x),y:Math.round(p.y),seen:!f.hidden,actor:f}; }
  if(typeof f!=='string') return null;
  const a=sceneActor(f)||currentMap.npcs.find(n=>n.monster===f)||null;
  return a?stageFocus(a):null;
}
// Everyone who walks with Tom is staged: the fighting four and the people on the bench, who follow him too (engine/bench.js). Before near1 the
// benched walkers were left out, so in Part 2 they stayed in the walking line while the other four formed up (Tom 2026-11-12).
const stageWalks=f=>!f.hidden&&!f.seat&&(party.includes(f.member)||(typeof onBench==='function'&&onBench(f.member)));
const stageApart=(a,b,rows=3)=>Math.abs(a.x-b.x)>=1||Math.abs(a.y-b.y)>=rows;   // never the same column within two rows
const stagePos=a=>{ const p=position(a); return {x:Math.round(p.x),y:Math.round(p.y)}; };
// A monster's drawn footprint on the map, in tiles (bossbox1, Tom 2026-11-12: "never overlapping the boss"). A big boss is drawn several
// tiles wide and tall around one tile, so anyone standing near that tile stands on its picture. stageBoxes: every monster in view on this
// map (plus the scene's boss even while it is still hidden: it is about to rise there; not a boss that has finished its ending and settled). stageInBox: a person on tile (x,y) would overlap one.
function stageBox(a) { const d=typeof monsterDef==='function'?monsterDef(a):null; if(!d||!d.sprite) return null;
  const s=monScale(a),p=stagePos(a); return {x:p.x,y:p.y,hw:d.sprite[0].length*s/2/T,ht:d.sprite.length*s/T,a}; }
const stageBoxes=also=>currentMap.npcs.filter(n=>n.monster&&!n.bossSettle&&(!n.hidden||n===also)).map(stageBox).filter(Boolean);
const stageInBox=(B,x,y)=>B.some(b=>Math.abs(x-b.x)<b.hw+.6&&y>b.y-b.ht&&y<b.y+2.3);
// Where Tom stands for a boss: on its LEFT ("characters need to stand to the left"), a tile clear of the boss and of any monster beside it,
// level with it, reachable on foot. null when there is no such tile within reach.
function stageLeftSpot(boss,B) {
  const map=currentMap,bb=stageBox(boss); if(!bb) return null;
  let edge=bb.x-bb.hw; for(const c of B) if(c.a!==boss&&Math.abs(c.y-bb.y)<=2&&c.x<bb.x&&c.x+c.hw>edge-3) edge=Math.min(edge,c.x-c.hw);
  const ix=Math.floor(edge-1.1),iy=bb.y,tp=stagePos(player),busy=new Set();
  for(const n of map.npcs) if(!n.hidden&&!n.monster&&!stageExtra(n)) { const p=stagePos(n); busy.add(key(p.x,p.y)); }
  let best=null,bd=1e9; const memo=new Map();
  for(let y=iy-3;y<=iy+3;y++) for(let x=ix-6;x<=ix;x++) {
    if(huddleBadTile(map,x,y,memo)||map.portals.has(key(x,y))||busy.has(key(x,y))||stageInBox(B,x,y)) continue;
    const d=Math.hypot(x-ix,(y-iy)*1.5)+.04*Math.hypot(x-tp.x,y-tp.y)+(walkable(map,x-1,y)?0:.6);   // room behind him for the others
    if(d>=bd) continue;
    if(!(x===tp.x&&y===tp.y)&&!findPath(map,{x:tp.x,y:tp.y},{x,y}).length) continue;
    bd=d; best={x,y}; }
  return best;
}
function stageClearSpot(B,boss) {   // the nearest tile Tom can walk to that is off every monster's picture (when there is no room on the left); with a boss, the one nearest the boss's left edge, so the others fit to his right (a boss drawn at 2x Tom leaves a thin strip)
  const map=currentMap,tp=stagePos(player),memo=new Map(),bb=boss?stageBox(boss):null,lx=bb?bb.x-bb.hw:0; let best=null,bd=1e9;
  for(let y=tp.y-6;y<=tp.y+6;y++) for(let x=tp.x-6;x<=tp.x+6;x++) {
    if(huddleBadTile(map,x,y,memo)||map.portals.has(key(x,y))||stageInBox(B,x,y)||currentMap.npcs.some(n=>!n.hidden&&stagePos(n).x===x&&stagePos(n).y===y)) continue;
    const d=Math.hypot(x-tp.x,y-tp.y)+(x<tp.x?0:.3)+(bb?1.2*Math.abs(x-lx):0); if(d>=bd) continue;
    if(!(x===tp.x&&y===tp.y)&&!findPath(map,{x:tp.x,y:tp.y},{x,y}).length) continue;
    bd=d; best={x,y}; }
  return best;
}
function stageSpots(focus,movers,fixed,tpos,B=[]) {
  const map=currentMap,tx=tpos?tpos.x:player.x,ty=tpos?tpos.y:player.y;
  const dx=focus?focus.x-tx:0,dy=focus?focus.y-ty:1,side=Math.abs(dx)>=Math.abs(dy);
  const b=side?(dx>0?-1:1):0,v=side?0:(dy<0?1:-1);   // b: one column away from the focus (side bosses); v: one row away (bosses above or below)
  // Ideal offsets from Tom, best first. Side boss: a tight staggered block just behind him (close1: neighbours one column over, never the same column within two rows). Boss above or below: a row abreast, then a staggered second row.
  const ideal=side?[[b,1],[2*b,0],[b,-2],[2*b,3],[3*b,1],[3*b,-2]]:[[-1,0],[1,0],[-2,v],[2,v],[-3,0],[3,0]];
  const taken=[{x:tx,y:ty},...fixed];
  const busy=new Set(),memo=new Map();
  for(const n of map.npcs) if(!n.hidden&&!stageExtra(n)) { const p=stagePos(n); busy.add(key(p.x,p.y)); }
  // Level 0 is the rule; when a tight room has no such tile, level 1 allows a spot in front of Tom, level 2 a two-row column gap, level 3 any free tile.
  const ok=(x,y,lv)=>{
    if(!walkable(map,x,y)||map.portals.has(key(x,y))||busy.has(key(x,y))) return false;
    if(taken.some(t=>t.x===x&&t.y===y)||stageInBox(B,x,y)) return false;
    if(lv<3&&huddleBadTile(map,x,y,memo)) return false;   // not on the map edge, under the dialogue box or behind painted scenery
    if(focus&&lv<3&&Math.max(Math.abs(x-focus.x),Math.abs(y-focus.y))<2) return false;   // not on top of the boss
    if(focus&&lv<1&&(side?(x-tx)*Math.sign(dx):(y-ty)*Math.sign(dy))>0) return false;   // not in front of Tom
    return lv>=3||taken.every(t=>stageApart(t,{x,y},lv>=2?2:3));
  };
  const out=[];
  movers.forEach((m,k)=>{
    const [ox,oy]=ideal[k%ideal.length],ix=tx+ox,iy=ty+oy;
    let best=ok(ix,iy,0)?{x:ix,y:iy}:null;
    for(let lv=0;!best&&lv<4;lv++) { let bd=1e9; const R=lv<3?5:8;
      for(let y=ty-R;y<=ty+R;y++) for(let x=tx-R;x<=tx+R;x++) {
        if(!ok(x,y,lv)) continue;
        let d=Math.hypot(x-ix,y-iy)+.35*Math.hypot(x-tx,y-ty);
        if(focus&&(side?(x-focus.x)*(tx-focus.x)<0:(y-focus.y)*(ty-focus.y)<0)) d+=4;   // stay on Tom's side of the boss or monster, never split around it (bossbox1)
        if(d<bd) { bd=d; best={x,y}; } } }
    if(!best) best=stagePos(m);
    taken.push(best); out.push(best);
  });
  return out;
}
function faceToward(a,focus) { if(!a||!focus||!focus.seen) return;   // nobody turns toward a boss that is not in view yet
  const p=position(a),ddx=focus.x-p.x,ddy=focus.y-p.y; if(ddx||ddy) a.facing=directionTo(ddx,ddy); }
const faceWant=(a,focus)=>{ const p=position(a),ddx=focus.x-p.x,ddy=focus.y-p.y; return ddx||ddy?directionTo(ddx,ddy):a.facing; };
function gatherStep(o) {
  return {start(){
      this.focus=stageFocus(o.gather); this.movers=[]; this.tom=null;
      const all=followers.filter(stageWalks);
      const isFixed=f=>f.stagePlaced||f.scenePose||f.scr;
      const movers=all.filter(f=>!isFixed(f));
      // bossbox1: the boss's picture is off limits, and the party stands on its left. Tom walks there when he stands on the boss, or (first
      // gather of the scene, unless the scene put him on a mark) when he is not on its left yet.
      const boss=this.focus&&this.focus.actor&&this.focus.actor.monster?this.focus.actor:null,B=stageBoxes(boss),tp=stagePos(player);
      const onBoss=a=>{ const p=stagePos(a); return stageInBox(B,p.x,p.y); };
      let tpos=null;
      if(boss&&!player.scenePose&&!player.scr) { const bb=stageBox(boss),tomOn=onBoss(player);
        if(bb&&(tomOn||(!o.check&&o.left!==false&&!player.stagePlaced&&tp.x>bb.x-bb.hw-.6))) { const t=(o.left!==false&&stageLeftSpot(boss,B))||stageClearSpot(B,boss);
          if(t&&(t.x!==tp.x||t.y!==tp.y)) { tpos=t; player.x=tp.x; player.y=tp.y; player.move=null; this.tom={a:player,path:findPath(currentMap,{x:tp.x,y:tp.y},t),i:0}; } } }
      if(o.check&&!tpos) {
        const vis=[player,...all].filter(a=>!a.hidden),P=vis.map(stagePos);
        const crowded=movers.some(f=>{ const i=vis.indexOf(f); return onBoss(f)||P.some((q,j)=>j!==i&&!stageApart(P[i],q)); });
        if(!crowded) { if(this.focus&&this.focus.seen) { for(const f of movers) if(!f.stageFaced&&!f.move&&f.facing!==faceWant(f,this.focus)) faceToward(f,this.focus);
          if(!player.stageFaced&&!player.scenePose&&!player.move) faceToward(player,this.focus); } return; }
      }
      const fixed=all.filter(isFixed).map(stagePos);
      this.movers=movers;
      const spots=stageSpots(this.focus,movers,fixed,tpos,B);
      movers.forEach((f,k)=>{ const t=spots[k],p=stagePos(f); f._pf=f.facing; f.x=p.x; f.y=p.y; f.move=null; f.lag=0; f.stageFaced=false;
        const d=Math.hypot(t.x-f.x,t.y-f.y);
        if(d>0) { f.facing=directionTo(t.x-f.x,t.y-f.y); f.move={fx:f.x,fy:f.y,tx:t.x,ty:t.y,elapsed:0,duration:Math.max(.22,d*.15)}; } });
      if(!this.tom&&!player.scenePose&&!(o.check&&player.stageFaced)) faceToward(player,this.focus);
    },
    update(dt){ let done=true; for(const f of this.movers) if(f.move&&!advanceMove(f,dt)) done=false;
      const m=this.tom; if(m) { const a=m.a;
        if(a.move&&!advanceMove(a,dt)) done=false;
        else if(m.i<m.path.length) { const t=m.path[m.i++]; a.facing=directionTo(t.x-a.x,t.y-a.y); a.move={fx:a.x,fy:a.y,tx:t.x,ty:t.y,elapsed:0,duration:.15}; done=false; } }
      if(done) { for(const f of this.movers) { if(this.focus&&this.focus.seen) faceToward(f,this.focus); else if(f._pf) f.facing=f._pf; }   // no boss in view yet: keep the way they were facing
        if(m) { if(this.focus) { const p=stagePos(player),dx=this.focus.x-p.x,dy=this.focus.y-p.y; if(dx||dy) player.facing=directionTo(dx,dy); } this.tom=null; } }
      return done; }};
}
SCENE_OPS.gather=gatherStep;
// ---------- Conversation staging (Tom, 2026-11-09) ----------
// "Wherever a group is talking: nobody overlaps, they stand in the middle of open space, and they face each other naturally."
// {huddle:true,with:'Boppy'} (playScene adds one before every line of dialogue in every scene that has no {gather} or {huddle} of its
// own, except boss scenes, which keep {gather}). The group is Tom, the party, every NPC the scene holds near Tom, and the NPC named in
// `with` (it is held so it stops wandering). Party members more than 7 tiles from Tom are not in the conversation. NPCs never move, and neither
// does anyone mid-pose or mid-hop. If the group already passes, nothing moves and a hand-placed scene keeps its choreography. Otherwise everyone
// else (Tom too, though he is the least willing) walks to open floor and stands as close together as possible, one column each (never the same
// column within two rows; close1), and every person who is not posed turns toward the others. If only a facing is wrong, people just turn.
const HUD_DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function huddleClear(map) {   // distance (in tiles, Chebyshev) from every tile to the nearest blocked tile or map edge; 0 on blocked tiles
  const w=map.w,h=map.h,d=new Int32Array(w*h).fill(1e6),q=[];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) { const i=y*w+x;
    if(!walkable(map,x,y)) { d[i]=0; q.push(i); } else if(x===0||y===0||x===w-1||y===h-1) { d[i]=1; q.push(i); } }
  for(let k=0;k<q.length;k++) { const i=q[k],x=i%w,y=(i/w)|0;
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) { const nx=x+dx,ny=y+dy; if(nx<0||ny<0||nx>=w||ny>=h) continue;
      const j=ny*w+nx; if(d[j]>d[i]+1) { d[j]=d[i]+1; q.push(j); } } }
  return {at:(x,y)=>x>=0&&y>=0&&x<w&&y<h?d[y*w+x]:0};
}
// Painted foreground pieces (engine/plate.js PLATE_BEHIND: gate boards, trees, counters) are drawn over anyone standing behind them. A tile is
// "hidden" when a standing person's body there would sit under such a piece (same rule plateWalkBehind uses, tested on 15 points of the body).
function huddleHidden(map,x,y,memo) {
  const k=x+','+y; if(memo.has(k)) return memo.get(k);
  let hid=false; const zones=typeof PLATE_BEHIND!=='undefined'&&PLATE_BEHIND[map.id];
  if(zones&&zones.length) {
    const plate=typeof PLATES!=='undefined'?PLATES[map.id]:null;
    const fx=(x+.5)*64,fy=(y+1)*64,bh=plate&&plate.roomScale&&typeof roomPxPerFoot==='function'?roomPxPerFoot(plate.roomScale,fy)*6.6:130;
    const pip=(px,py,pts)=>{ let c=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++) { const a=pts[i],b=pts[j];
      if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; };
    let n=0;
    for(const z of zones) { if(fy>z.base||z.front) continue;
      const inside=(px,py)=>z.pts?pip(px,py,z.pts):z.cx!==undefined?(((px-z.cx)/z.rx)**2+((py-z.cy)/z.ry)**2<=1):(px>=z.x&&px<=z.x+z.w&&py>=z.y&&py<=z.y+z.h);
      for(const dx of [-20,0,20]) for(let q=0;q<=4;q++) if(inside(fx+dx,fy-4-q*(bh-4)/4)) n++;
      if(n>=3) break; }
    hid=n>=3;
  }
  memo.set(k,hid); return hid;
}
// A tile the party should not stand on for a conversation: the map edge, the bottom two rows (the dialogue box covers them), off the floor, or hidden.
const huddleBadTile=(map,x,y,memo)=>x<=0||y<=0||x>=map.w-1||y>=map.h-2||!walkable(map,x,y)||huddleHidden(map,x,y,memo)||(memo.boxes&&stageInBox(memo.boxes,x,y));   // memo.boxes: monsters' drawn footprints (bossbox1)
function huddleGroup(withName,focus) {
  const tp=stagePos(player);
  const roster=[player,...followers.filter(f=>stageWalks(f)&&Math.hypot(stagePos(f).x-tp.x,stagePos(f).y-tp.y)<=7)];
  const others=[];
  const add=n=>{ if(n&&!n.hidden&&!roster.includes(n)&&!others.includes(n)&&!followers.includes(n)) others.push(n); };
  // A posed NPC (`still`, data/scenes.js ch9Pose) near Tom is in the conversation too: held, so it turns toward the group for the scene and
  // updateNPCs (engine/battle-draw.js) turns it back to its pose when the scene lets go (facing1, Tom 2026-11-11).
  for(const n of currentMap.npcs) if(n.held||n.scripted||(n.still&&!n.hidden)) { const p=stagePos(n); if(Math.hypot(p.x-tp.x,p.y-tp.y)<=7) { if(n.still&&!n.held) storyHold(n); add(n); } }
  if(focus) { const fa=stageFocus(focus); if(fa&&fa.actor&&fa.seen&&currentMap.npcs.includes(fa.actor)) add(fa.actor); }   // a boss scene's boss, held or not
  const named=typeof withName==='string'?sceneActor(withName):null;
  if(named&&named!==player&&!followers.includes(named)&&currentMap.npcs.includes(named)) { const p=stagePos(named);
    if(Math.hypot(p.x-tp.x,p.y-tp.y)<=9) { storyHold(named); add(named); } }
  const fk=focus?stageFocus(focus):null;
  return {roster,others,key:named&&others.includes(named)?named:fk&&fk.actor&&others.includes(fk.actor)?fk.actor:null};
}
const huddleFixed=(g,a)=>g.others.includes(a)||a.scenePose||a.scr;
const huddleTurns=(g,a)=>!a.scenePose&&!a.scr&&(!a.still||a.held)&&!a.monster&&!a.move;
// Closeness (close1, Tom 2026-11-12: "as close as possible without significantly overlapping each other"). A figure is about one tile wide and
// 2.3 tiles tall, so rows count half: two people are "together" when hudNear <= 1.5 (next column, up to two rows off; or the same column three
// rows off). hudTight: the party members are all linked to each other through such neighbours (NPCs in the group can be links).
const hudNear=(dx,dy)=>Math.hypot(dx,dy/2);
function hudTight(P,isRoster) {
  const s0=P.findIndex((p,j)=>isRoster(j)); if(s0<0) return true;
  const seen=new Set([s0]),q=[s0];
  while(q.length) { const i=q.pop(); P.forEach((p,j)=>{ if(!seen.has(j)&&hudNear(p.x-P[i].x,p.y-P[i].y)<=1.5) { seen.add(j); q.push(j); } }); }
  return P.every((p,j)=>!isRoster(j)||seen.has(j));
}
const huddleKept=(g,a)=>huddleFixed(g,a)||a.stagePlaced;   // people a scene posed, placed or walked itself keep their marks when the only problem is spacing
// What is wrong with the group right now: a Set of 'overlap', 'place' (against a wall, the map edge or off the floor), 'spread' (standing apart) and 'face'.
function huddleFails(g,clr,memo) {
  const out=new Set(),all=[...g.roster,...g.others],map=currentMap; if(all.length<2) return out;
  const P=all.map(stagePos);
  for(let i=0;i<all.length;i++) for(let j=i+1;j<all.length;j++) if(!stageApart(P[i],P[j])) out.add('overlap');
  const cx=P.reduce((s,p)=>s+p.x,0)/P.length,cy=P.reduce((s,p)=>s+p.y,0)/P.length;
  const here=clr.at(Math.round(cx),Math.round(cy));
  let best=0; for(let y=Math.round(cy)-5;y<=Math.round(cy)+5;y++) for(let x=Math.round(cx)-5;x<=Math.round(cx)+5;x++) best=Math.max(best,clr.at(x,y));
  if(P.some((p,i)=>g.roster.includes(all[i])&&huddleBadTile(map,p.x,p.y,memo))) out.add('place');
  else if(best>=2&&here<=.5*best&&here<=1) out.add('place');
  if(g.roster.some(a=>!huddleKept(g,a))&&!hudTight(P,j=>j<g.roster.length&&(j===0||!huddleKept(g,all[j])))) out.add('spread');   // roster comes first in `all`, Tom is index 0
  all.forEach((a,i)=>{ if(!huddleTurns(g,a)) return; const v=HUD_DIRV[a.facing]; if(!v) return;
    const o=P.filter((_,j)=>j!==i),mx=o.reduce((s,p)=>s+p.x,0)/o.length-P[i].x,my=o.reduce((s,p)=>s+p.y,0)/o.length-P[i].y;
    if((mx||my)&&v[0]*mx+v[1]*my<=0) out.add('face'); });
  // Cutscene staging (Tom 2026-11-12): nobody in the party stands on, in front of or right behind the person the scene is about, and
  // the party stays together on Tom's side of them. People a scene posed, placed or walked itself keep their marks.
  const A=huddleAxis(g);
  { const np=g.others.map(stagePos),tp=stagePos(player);
    for(const a of g.roster) { if(huddleFixed(g,a)||a.stagePlaced) continue; const p=stagePos(a);
      if(np.some(n=>stageCovers(p,n))) out.add('cover');
      if(a!==player&&(Math.max(Math.abs(p.x-tp.x),Math.abs(p.y-tp.y))>4||(A&&(p.x-A.kp.x)*A.ax+(p.y-A.kp.y)*A.ay<1))) out.add('spread'); } }
  return out;
}
// The person a conversation is about (the NPC the line names, else the nearest one in the group) and the side of them the party takes:
// Tom's side, snapped to up, down, left or right. gap: clear tiles kept between them and the party's front row (figures are 2.4 tiles
// tall, so 3 rows when the party is above or below, 2 columns when it is beside them). On a short screen (`flat`: phone landscape shows
// about 6 rows above the dialogue box) huddleFormation also tries the party beside them and keeps whichever fits the picture better.
function huddleAxis(g) {
  if(!g.others.length) return null;
  const tp=stagePos(player),d=a=>{ const p=stagePos(a); return Math.hypot(p.x-tp.x,p.y-tp.y); };
  const k=g.key&&g.others.includes(g.key)?g.key:g.others.slice().sort((a,b)=>d(a)-d(b))[0],kp=stagePos(k);
  const dx=tp.x-kp.x,dy=tp.y-kp.y,flat=sceneRoomTiles().ah<7.5;
  const ax=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0;
  return {key:k,kp,ax,ay:ax?0:(dy<0?-1:1),gap:ax?STAGE.cols+1:STAGE.rows,flat};
}
// How tall a standing adult is drawn, in tiles: 2.4 on the streets, about 4 to 5 inside most painted rooms, 1.5 in Tom's house (engine/plate.js actorK).
function stageFig() { const p=typeof PLATES!=='undefined'&&PLATES[currentMap.id];
  if(p&&p.roomScale&&!currentMap.outside&&typeof roomPxPerFoot==='function') return Math.max(1.4,TOM_FEET*roomPxPerFoot(p.roomScale,0)/(ROOM_SCALE_REF/(currentMap.w*T))/T);
  return 2.4; }
// STAGE.rows and STAGE.cols: the room a figure is given when people line up (3 rows, 1 column everywhere, the same closeness as close1 and near1;
// rooms draw people bigger, but Tom asked for the party to stand close there, 2026-11-12 22:22). STAGE.fig and STAGE.wide are for the camera only.
const STAGE={get fig(){ return stageFig(); },rows:3,cols:1,get wide(){ return stageFig()>3.4?2:1; }};
// A party member at m hides (or is hidden by) the person at n: on their tile, in front of them within a figure's height and a column, or right behind them.
const stageCovers=(m,n,rows=STAGE.rows,cols=STAGE.cols)=>{ const dx=Math.abs(m.x-n.x),dy=m.y-n.y; return dy>=1&&dy<rows?dx<=cols:dy<=0&&dy>-rows&&dx<cols; };
const stageClearOf=(p,n,rows=STAGE.rows,cols=STAGE.cols)=>Math.abs(p.x-n.x)>=cols+1||Math.abs(p.y-n.y)>=rows;   // open floor all round the person the scene is about
// The party's formation for a conversation with someone: Tom faces them across the gap and the others line up beside and behind him (a row
// abreast when they are above or below; a short zig-zag trailing away when they are to the side), one column each. Tom keeps his tile when it
// already works. Tight spots relax the rules a level at a time (level 1: may stand ahead of Tom; 2: two-row column gap; 3: any free tile that
// does not cover them).
function huddleFormation(g,memo,clr) {
  const A=huddleAxis(g),tp=stagePos(player),room=sceneRoomTiles();
  if(!A) return huddleForm(g,memo,{kp:tp,ax:0,ay:1,gap:0,flat:room.ah<7.5},room,clr);   // the party on its own: a row around Tom
  let best=huddleForm(g,memo,A,room,clr);
  if(A.flat) for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]) { if(ax===A.ax&&ay===A.ay) continue;
    const L=huddleForm(g,memo,Object.assign({},A,{ax,ay,gap:ax?STAGE.cols+1:STAGE.rows}),room,clr); L.cost+=2; if(L.slots&&L.cost<best.cost) best=L; }
  return best;
}
function huddleForm(g,memo,A,room,clr) {
  const map=currentMap,tp=stagePos(player),solo=!g.others.length,ROWS=STAGE.rows,COLS=STAGE.cols,FIG=STAGE.fig;
  const wall=(x,y)=>clr.at(x,y)<1?2.5:clr.at(x,y)<2?.4:0;   // open floor is better than a spot against a wall
  const np=g.others.map(stagePos);
  const stays=a=>!!(huddleFixed(g,a)||(g.keep&&a.stagePlaced));   // keep: people the scene placed itself stay on their marks
  const fixed=g.roster.filter(a=>a!==player&&stays(a)),fp=[...np,...fixed.map(stagePos)];
  const mates=g.roster.filter(a=>a!==player&&!stays(a)),mp=mates.map(stagePos),N=mates.length;
  const tomFixed=stays(player);
  const busy=new Set(); for(const n of map.npcs) if(!n.hidden&&!followers.includes(n)&&!stageExtra(n)) { const p=stagePos(n); busy.add(key(p.x,p.y)); }
  const along=p=>(p.x-A.kp.x)*A.ax+(p.y-A.kp.y)*A.ay,perp=p=>(p.x-A.kp.x)*Math.abs(A.ay)+(p.y-A.kp.y)*Math.abs(A.ax);
  const free=(x,y)=>!huddleBadTile(map,x,y,memo)&&!map.portals.has(key(x,y))&&!busy.has(key(x,y));
  const leadOk=p=>free(p.x,p.y)&&np.every(n=>stageClearOf(p,n,ROWS,COLS))&&fp.every(t=>stageApart(t,p))&&along(p)>=A.gap;
  // [across, away] from Tom. Beside someone: a zig-zag trailing away (one row either side on a short screen). Above or below: a row abreast.
  const ideal=(A.ax?(A.flat?[[1,1],[-1,2],[1,3],[-1,4],[0,5],[1,6]]:[[1,1],[-1,2],[1,3],[2,2],[-1,4],[-2,3]]):[[-1,0],[1,0],[-2,0],[2,0],[-3,1],[3,1]])
    .map(o=>A.ax?[o[0],o[1]*COLS]:[o[0]*COLS,o[1]]);   // inside a room figures are about two tiles wide
  const at=(L,o)=>({x:L.x+o[0]*Math.abs(A.ay)+o[1]*A.ax,y:L.y+o[0]*Math.abs(A.ax)+o[1]*A.ay});
  const leads=[];
  if(tomFixed) leads.push({p:tp,c:0});
  else { const stay=free(tp.x,tp.y)&&np.every(n=>!stageCovers(tp,n,ROWS,COLS))&&fp.every(t=>stageApart(t,tp))&&(solo||(along(tp)>=1&&along(tp)<=A.gap+3&&Math.abs(perp(tp))<=(A.flat?1:3)));
    if(stay) leads.push({p:tp,c:0});
    const I={x:A.kp.x+A.ax*A.gap,y:A.kp.y+A.ay*A.gap};
    for(let y=I.y-4;y<=I.y+4;y++) for(let x=I.x-4;x<=I.x+4;x++) { const p={x,y}; if((x===tp.x&&y===tp.y)||!leadOk(p)) continue;
      leads.push({p,c:1.5+.8*Math.hypot(x-I.x,y-I.y)+.5*Math.hypot(x-tp.x,y-tp.y)+(along(p)>A.gap+2?2:0)+(A.flat&&perp(p)?3*Math.abs(perp(p)):0)+wall(x,y)}); } }
  let best=null;
  for(const Ld of leads) { const L=Ld.p,taken=[...fp,L],slots=[],left=ideal.map(o=>at(L,o)); let cost=Ld.c,ok=true;
    for(let k=0;k<N&&ok;k++) { let pick=null,pc=1e9,pi=-1;
      for(let lv=0;lv<4&&!pick;lv++) for(let y=L.y-5;y<=L.y+5;y++) for(let x=L.x-5;x<=L.x+5;x++) { const p={x,y};
        if(!free(x,y)||taken.some(t=>t.x===x&&t.y===y)) continue;
        if(lv<3?!np.every(n=>stageClearOf(p,n,ROWS,COLS)):np.some(n=>stageCovers(p,n,ROWS,COLS))) continue;
        if(lv<3&&!taken.every(t=>stageApart(t,p,lv>=2?2:3))) continue;
        if(!solo&&lv<1&&along(p)<along(L)) continue;
        if(!solo&&lv<3&&along(p)<1) continue;
        if(A.flat&&lv<2&&Math.abs(p.y-L.y)>1) continue;   // short screen: stay within a row of Tom so everyone is in the picture
        let wi=-1,wd=1e9; left.forEach((w,i)=>{ if(!w) return; const d=Math.hypot(x-w.x,y-w.y)+.3*i; if(d<wd) { wd=d; wi=i; } });   // the nearest formation mark still open (earlier marks first)
        const c=wd+.7*Math.hypot(x-L.x,y-L.y)+lv*4+wall(x,y);
        if(c<pc) { pc=c; pick=p; pi=wi; } }
      if(!pick) ok=false; else { slots.push(pick); taken.push(pick); cost+=pc; if(pi>=0) left[pi]=null; } }
    if(!ok) continue;
    let bestA=[],ba=N?1e9:0;   // cheapest assignment of slots to people by walking distance
    const perm=(used,cur)=>{ if(cur.length===N) { let t=0; cur.forEach((si,mi)=>{ t+=.1*Math.hypot(slots[si].x-mp[mi].x,slots[si].y-mp[mi].y); }); if(t<ba) { ba=t; bestA=cur.slice(); } return; }
      for(let i=0;i<N;i++) if(!used[i]) { used[i]=true; cur.push(i); perm(used,cur); cur.pop(); used[i]=false; } };
    if(N) perm([],[]);
    cost+=ba;
    { const B=[...np,L,...slots],xs=B.map(p=>p.x),ys=B.map(p=>p.y);   // everyone should fit the picture (the camera drops whoever does not)
      cost+=8*Math.max(0,Math.max(...xs)-Math.min(...xs)+2*COLS-room.aw)+8*Math.max(0,Math.max(...ys)-Math.min(...ys)+FIG+.8-room.ah); }
    if(!best||cost<best.cost) best={cost,L,slots:bestA.map(si=>slots[si])};
  }
  if(!best) return {movers:[],slots:null,cost:1e9};
  const movers=mates.slice(),slots=best.slots.slice();
  if(!tomFixed&&(best.L.x!==tp.x||best.L.y!==tp.y)) { movers.unshift(player); slots.unshift(best.L); }
  return {movers,slots,cost:best.cost};
}
function huddleTurn(g) {   // everyone who can turn faces the middle of the others (their dominant direction, so it is always toward them)
  const all=[...g.roster,...g.others],P=all.map(stagePos);
  all.forEach((a,i)=>{ if(!huddleTurns(g,a)) return; const o=P.filter((_,j)=>j!==i); if(!o.length) return;
    const mx=o.reduce((s,p)=>s+p.x,0)/o.length-P[i].x,my=o.reduce((s,p)=>s+p.y,0)/o.length-P[i].y;
    if(Math.abs(mx)<.25&&Math.abs(my)<.25) a.facing='down';   // standing in the middle of the others: face the camera, not one neighbour's back (close1)
    else a.facing=directionTo(mx,my); });
  // In a conversation with someone the party looks at them (each member at the nearest of them) and they look at the party.
  if(g.others.length) { const R=g.roster.map(stagePos),O=g.others.map(stagePos);
    g.roster.forEach((a,i)=>{ if(!huddleTurns(g,a)) return; const k=g.key&&g.others.includes(g.key)?stagePos(g.key):O.slice().sort((p,q)=>Math.hypot(p.x-R[i].x,p.y-R[i].y)-Math.hypot(q.x-R[i].x,q.y-R[i].y))[0];
      const dx=k.x-R[i].x,dy=k.y-R[i].y; if(dx||dy) a.facing=directionTo(dx,dy); });
    const cx=R.reduce((s,p)=>s+p.x,0)/R.length,cy=R.reduce((s,p)=>s+p.y,0)/R.length;
    g.others.forEach((a,i)=>{ if(!huddleTurns(g,a)) return; const dx=cx-O[i].x,dy=cy-O[i].y; if(dx||dy) a.facing=directionTo(dx,dy); }); }
  // lookAt (a talk step's `lookAt:'TNB'`): everyone who can turn, except that person, faces them instead of the middle of the group (Tom 2026-11-12: Grace faced Rose, not TNB)
  const la=g.lookAt; if(la) { const lp=stagePos(la);
    all.forEach((a,i)=>{ if(a===la||!huddleTurns(g,a)) return; const dx=lp.x-P[i].x,dy=lp.y-P[i].y; if(dx||dy) a.facing=directionTo(dx,dy); }); }
}
// Open-floor slots for the movers: try centres around the anchor, fill slots greedily, each as near the middle of the cluster as the no-overlap rule allows, keep the cheapest layout.
// Tom stays where he is when his tile is fine (the layout is built around him); only when no good layout exists with Tom in place does Tom walk too.
// With an NPC in the group the party takes the NPC's near side (Tom's side), so nobody ends up behind the person they are talking to.
function huddleLayout(g,clr,tomMoves,memo,keep) {
  const map=currentMap,all=[...g.roster,...g.others];
  const tpos0=stagePos(player);
  const isFixed=a=>keep?huddleKept(g,a):huddleFixed(g,a);
  const tomOk=!tomMoves&&!isFixed(player)&&!huddleBadTile(map,tpos0.x,tpos0.y,memo)&&all.every(a=>a===player||!isFixed(a)||stageApart(tpos0,stagePos(a)));
  const fixed=all.filter(a=>isFixed(a)||(tomOk&&a===player)),movers=all.filter(a=>!fixed.includes(a));
  if(!movers.length) return {movers,slots:[],cost:0};
  const fp=fixed.map(stagePos),mp=movers.map(stagePos),N=movers.length;
  const rosterAt=j=>j>=fp.length||(g.roster.includes(fixed[j])&&(fixed[j]===player||!(keep&&isFixed(fixed[j]))));   // index into [fixed..., slots...]: a party member who should be linked to the group
  const npcs=g.others.map(stagePos),tp=stagePos(player);
  const anchor=npcs.length?{x:npcs.reduce((s,p)=>s+p.x,0)/npcs.length,y:npcs.reduce((s,p)=>s+p.y,0)/npcs.length}
    :(fp.length?{x:fp.reduce((s,p)=>s+p.x,0)/fp.length,y:fp.reduce((s,p)=>s+p.y,0)/fp.length}:{x:mp[0].x,y:mp[0].y});
  const busy=new Set(); for(const n of map.npcs) if(!n.hidden&&!followers.includes(n)&&!stageExtra(n)) { const p=stagePos(n); busy.add(key(p.x,p.y)); }
  const span=4,Rc=npcs.length?2:5;
  const side={x:tp.x-anchor.x,y:tp.y-anchor.y},sl=Math.hypot(side.x,side.y);
  let bestL=null;
  const ax=Math.round(anchor.x),ay=Math.round(anchor.y);
  for(let cy=ay-Rc;cy<=ay+Rc;cy++) for(let cx=ax-Rc;cx<=ax+Rc;cx++) {
    if(!walkable(map,cx,cy)) continue;
    const taken=fp.slice(),slots=[]; let cost=.35*Math.hypot(cx-anchor.x,cy-anchor.y)+(clr.at(cx,cy)<2?.8:0),okAll=true;
    if(tomOk) cost+=hudNear(tp.x-cx,tp.y-cy);   // the group forms where Tom already stands
    const G=[{x:cx,y:cy},...fp.filter(t=>hudNear(t.x-cx,t.y-cy)<=2)];   // the cluster so far: each new person stands as near its middle as the no-overlap rule allows
    for(let k=0;k<N&&okAll;k++) { let pick=null,pc=1e9;
      for(let y=cy-span;y<=cy+span;y++) for(let x=cx-span;x<=cx+span;x++) {
        if(huddleBadTile(map,x,y,memo)||map.portals.has(key(x,y))||busy.has(key(x,y))) continue;
        if(!taken.every(t=>stageApart(t,{x,y}))) continue;
        const gx=G.reduce((a,t)=>a+t.x,0)/G.length,gy=G.reduce((a,t)=>a+t.y,0)/G.length,at=(ox,oy)=>taken.some(t=>t.x===x+ox&&t.y===y+oy);
        let c=hudNear(x-gx,y-gy)+(clr.at(x,y)<1?2.5:clr.at(x,y)<2?.4:0);
        if((at(-1,0)&&at(1,0))||(at(-1,0)&&at(-2,0))||(at(1,0)&&at(2,0))) c+=.5;   // three abreast in one row reads as a line-up, not a conversation
        if(taken.some(t=>t.x===x)) c+=.8;   // one behind the other (three rows off) is the last resort: it leaves a gap and turns a back to the camera
        if(npcs.length&&sl>0&&((x-anchor.x)*side.x+(y-anchor.y)*side.y)<0) c+=3;   // behind the NPC, away from Tom
        if(c<pc) { pc=c; pick={x,y}; } }
      if(!pick) okAll=false; else { slots.push(pick); taken.push(pick); G.push(pick); cost+=pc; } }
    if(!okAll) continue;
    { const fx=taken.reduce((a,t)=>a+t.x,0)/taken.length,fy=taken.reduce((a,t)=>a+t.y,0)/taken.length,hx=Math.round(fx),hy=Math.round(fy),here=clr.at(hx,hy);
      let bst=0; for(let y=hy-5;y<=hy+5;y++) for(let x=hx-5;x<=hx+5;x++) bst=Math.max(bst,clr.at(x,y));
      if(bst>=2&&here<=.5*bst&&here<=1) cost+=2;   // the group's middle would be against a wall: keep looking
      if(intro.nearBox&&g.others.includes(intro.nearBox.a)) cost+=.8*Math.abs(fx-intro.nearBox.x);   // walked up to someone: stand in front of them, not off to one side (near1)
      if(!hudTight([...taken,...npcs.filter(n=>!fp.some(t=>t.x===n.x&&t.y===n.y))],j=>j<taken.length&&rosterAt(j))) cost+=8; }   // standing together matters most (close1)
    // cheapest assignment of slots to movers by walking distance (Tom is the least willing to move)
    let bestA=null,ba=1e9;
    const perm=(used,cur)=>{ if(cur.length===N) { let t=0; cur.forEach((si,mi)=>{ t+=(movers[mi]===player?.3:.1)*Math.hypot(slots[si].x-mp[mi].x,slots[si].y-mp[mi].y); }); if(t<ba) { ba=t; bestA=cur.slice(); } return; }
      for(let i=0;i<N;i++) if(!used[i]) { used[i]=true; cur.push(i); perm(used,cur); cur.pop(); used[i]=false; } };
    perm([],[]);
    cost+=ba;
    if(!bestL||cost<bestL.cost) bestL={cost,slots:bestA.map(si=>slots[si])};
  }
  let tight=false;
  if(bestL) { const at=a=>{ const k=movers.indexOf(a); return k>=0?bestL.slots[k]:stagePos(a); }; tight=hudTight(all.map(at),j=>j<g.roster.length&&!(keep&&all[j]!==player&&isFixed(all[j]))); }
  return {movers,slots:bestL?bestL.slots:null,cost:bestL?bestL.cost:1e9,tight};
}
function huddleStep(o) {
  return {start(){
      if(intro.objStage) { this.moves=[]; this.sub=null; this.g={roster:[],others:[]}; aroundFace(intro.objStage); return; }   // gathered around an object ({around}): they stay and keep looking at it (item1)
      this.moves=[]; this.sub=null; this.g=huddleGroup(o.with,o.focus); this.g.lookAt=o.lookAt?sceneActor(o.lookAt):null;
      const g=this.g,all=[...g.roster,...g.others]; if(all.length<2) return;
      // A monster in the conversation (not a boss scene): the party does not stand around it or on its picture. It lines up together facing it,
      // the way a boss scene does, Tom staying put unless he stands on the monster (bossbox1).
      if(!o.focus) { const named=typeof o.with==='string'?sceneActor(o.with):null,mon=(named&&named.monster&&g.others.includes(named))?named:g.others.find(a=>a.monster);
        if(mon) { const seen=intro.monGather||(intro.monGather=new Set()); this.sub=gatherStep({gather:mon,check:seen.has(mon),left:false}); seen.add(mon); this.sub.start(); return; } }
      const clr=huddleClear(currentMap),memo=new Map(); memo.boxes=stageBoxes(null);
      if(intro.nearBox) for(const b of intro.nearBoxes) if(currentMap.npcs.includes(b.a)&&!b.a.hidden&&stagePos(b.a).x===b.x&&stagePos(b.a).y===b.y) memo.boxes.push(b);   // the person {approach} walked up to keeps their room (near1)
      if(!g.lookAt&&memo.boxes.includes(intro.nearBox)&&g.others.includes(intro.nearBox.a)) g.lookAt=intro.nearBox.a;   // they came over to this person: they look at them
      if(g.lookAt&&g.lookAt===(intro.nearBox&&intro.nearBox.a)) { huddleTurn(g); }
      const fails=huddleFails(g,clr,memo);
      if(!fails.size) return;
      if(o.focus) { const fa=stageFocus(o.focus); if(fa&&fa.actor&&fa.seen&&!g.lookAt) g.lookAt=fa.actor; }   // boss scenes: {gather} owns the places (left of the boss, off its picture); here people only turn, toward the boss (bossbox1)
      else if(fails.has('overlap')||fails.has('place')||fails.has('spread')||fails.has('cover')) {
        const keep=!fails.has('overlap')&&!fails.has('place');   // only standing apart or covering: people the scene placed itself stay on their marks
        g.keep=keep;
        let L=huddleFormation(g,memo,clr);   // cutstage1: the formation facing the person; only when a cramped spot has no room for it (none found, or people would stack), the ring
        if(L.slots) { const fx=[...g.roster,...g.others].filter(a=>!L.movers.includes(a)).map(stagePos),P=[...fx,...L.slots];
          if(P.some((p,i)=>P.some((q,j)=>j>i&&!stageApart(p,q)))) L={slots:null}; }
        if(!L.slots) { L=huddleLayout(g,clr,false,memo,keep);
          if(!L.slots||!L.tight||L.cost>=6) { const L2=huddleLayout(g,clr,true,memo,keep); if(L2.slots&&(!L.slots||(L2.tight&&!L.tight)||(L2.tight===L.tight&&L2.cost<L.cost))) L=L2; } }   // Tom stays unless that leaves the group cramped or apart
        if(L.slots) L.movers.forEach((a,k)=>{ const t=L.slots[k],p=stagePos(a); a.x=p.x; a.y=p.y; a.move=null; a.lag=0; if(a.stageFaced!==undefined) a.stageFaced=false;
          let path=(t.x===p.x&&t.y===p.y)?[]:findPath(currentMap,a,t);
          if(!path.length&&(t.x!==p.x||t.y!==p.y)) path=[{x:t.x,y:t.y}];   // no walkable route: slide straight there
          this.moves.push({a,path,i:0}); });
      }
    },
    update(dt){ if(this.sub) { const d=this.sub.update(dt); if(d&&!this.framed) { this.framed=true; stageFrame(this.g,[]); } return d; }
      let done=true; this.t=(this.t||0)+dt;
      if(!this.framed) { this.framed=true; stageFrame(this.g,this.moves); }
      if(this.t<2.2&&currentMap.npcs.some(n=>n.stageShoo&&(n.path.length||n.move)&&stageInZone(stagePos(n)))) done=false;   // give townsfolk a moment to walk out of the picture
      for(const m of this.moves) { const a=m.a;
        if(a.move&&!advanceMove(a,dt)) { done=false; continue; }
        if(m.i<m.path.length) { const t=m.path[m.i++]; a.facing=directionTo(t.x-a.x,t.y-a.y);
          a.move={fx:a.x,fy:a.y,tx:t.x,ty:t.y,elapsed:0,duration:.15}; done=false; } }
      if(done) huddleTurn(this.g);
      return done; }};
}
// ---------- Cutscene camera and bystanders (Tom, 2026-11-12) ----------
// "We need to be zooming in on the characters and the NPC during cut scenes" and nobody may cover the person the scene is about.
// After every {huddle} the camera frames the conversation (engine/overworld.js sceneAuto: it follows the group and zooms to fit it
// between the top bar and the dialogue box), and townsfolk who wandered into the picture walk out of it and stay out until the scene
// ends (stageZone, read by updateNPCs in engine/battle-draw.js). Posed, seated and scene-held people are left alone. Since clearout1 the
// clearing starts when the scene starts ({clearout}), before the party is placed, and extras never count as obstacles for the party.
let stageZone=null;
const stageInZone=p=>!!stageZone&&p.x>=stageZone.x0&&p.x<=stageZone.x1&&p.y>=stageZone.y0&&p.y<=stageZone.y1;
// A townsperson who has nothing to do with the scene being played (Tom 2026-11-12 23:44: "those NPCs that have nothing to do with it should
// just be totally cleared out of that area in a different part of the map, giving preference to the player characters"): someone who wanders
// (roam above 0), is not held, posed, seated or spawned by the scene, and whose name appears nowhere in the scene's script (intro.sceneCast).
// Extras never count when the party picks its spots (every `busy` list skips them), and stageClearOut walks them away.
const stageExtra=n=>!!(intro.active&&intro.sceneCast&&n&&!n.hidden&&!n.held&&!n.still&&!n.scripted&&!n.monster&&!n.seat&&n.roam>0&&!n.kid&&n!==player&&!followers.includes(n)&&n!==intro.sceneCast.npc&&!intro.sceneCast.text.includes(n.name));
function stageCast(list) { let text=''; try { text=JSON.stringify(list,(k,v)=>typeof v==='function'?String(v):v)||''; } catch(e) {}
  return {text,speakers:sceneSpeakers(list),npc:typeof dialog!=='undefined'&&dialog.npc?dialog.npc:null}; }
// Every extra standing in the picture (stageZone) walks, quickly, to the nearest free tile outside it. Returns the ones sent off.
function stageShooOut() {
  const map=currentMap,out=[]; if(!stageZone) return out;
  for(const n of map.npcs) { if(!stageExtra(n)) continue;
    const p=stagePos(n); if(!stageInZone(p)) continue;
    if(n.stageShoo&&n.path.length&&!stageInZone(n.path[n.path.length-1])) { out.push(n); continue; }   // already on the way out
    // Breadth-first to the nearest free tile outside the picture. When the picture covers everything they can reach (a one-screen street, a
    // room), they go to the reachable tile farthest from the people in the scene instead and wait there. First by a path they can really
    // walk; if the party is standing across their only way out, they are simply put on the far side (pass 2 ignores people in the way).
    const far=t=>Math.min(...(stageZone.pts||[stagePos(player)]).map(c=>Math.max(Math.abs(c.x-t.x),Math.abs(c.y-t.y))));
    const search=real=>{ const prev=new Map([[key(p.x,p.y),null]]),q=[p]; let goal=null,best=null,bd=far(p)+.5;
      for(let i=0;i<q.length&&i<3000&&!goal;i++) { const c=q[i];
        for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]]) { const x=c.x+dx,y=c.y+dy,k=key(x,y);
          if(prev.has(k)||!walkable(map,x,y)||map.npcNoGo.has(k)||(real&&!canOccupy(map,x,y,n))) continue; prev.set(k,c);
          if(!map.portals.has(k)&&canOccupy(map,x,y,n)) { if(!stageInZone({x,y})) { goal={x,y}; break; } const d=far({x,y}); if(d>bd) { bd=d; best={x,y}; } }
          q.push({x,y}); } }
      goal=goal||best; if(!goal) return null;
      const route=[]; for(let c=goal;c&&!(c.x===p.x&&c.y===p.y);c=prev.get(key(c.x,c.y))) route.unshift(c);
      return {goal,route,out:!stageInZone(goal),d:far(goal)}; };
    const A=search(true),B=A&&(A.out||A.d>=6)?null:search(false);
    if(B&&(!A||B.out||B.d>A.d+2)) { n.x=B.goal.x; n.y=B.goal.y; n.move=null; n.path=[]; n.idle=2; out.push(n); continue; }
    if(A&&A.route.length) { n.path=A.route; n.stageShoo=true; n.idle=2; out.push(n); } }
  return out;
}
// {clearout:true} (playScene puts it first in every staged scene): the area around Tom, and around anyone who speaks in the scene and stands
// within 14 tiles of him, is cleared of extras (8 tiles all round) before anybody is placed. The scene waits up to 1.6 s while an extra is still
// within 4 tiles of Tom.
function stageClearOut() {
  const tp=stagePos(player),pts=[tp];
  for(const n of currentMap.npcs) if(!n.hidden&&!n.monster&&!followers.includes(n)&&intro.sceneCast&&intro.sceneCast.speakers.includes(n.name)) { const p=stagePos(n); if(Math.hypot(p.x-tp.x,p.y-tp.y)<=14) pts.push(p); }
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),r=8;
  stageZone={x0:Math.min(...xs)-r,x1:Math.max(...xs)+r,y0:Math.min(...ys)-r,y1:Math.max(...ys)+r,pts};
  stageShooOut();
}
SCENE_OPS.clearout=o=>({t:0,start(){ this.t=0; stageClearOut(); },
  update(dt){ this.t+=dt; const tp=stagePos(player);
    return this.t>=1.6||!currentMap.npcs.some(n=>n.stageShoo&&(n.path.length||n.move)&&Math.hypot(stagePos(n).x-tp.x,stagePos(n).y-tp.y)<=4); }});
function stageFrame(g,moves) {
  const all=[...g.roster,...g.others].filter(a=>!a.hidden); if(!all.length) return;
  sceneAuto={actors:all,first:g.others.slice(),map:currentMap,fig:STAGE.fig,cols:STAGE.wide};
  const P=all.map(a=>{ const m=(moves||[]).find(m=>m.a===a&&m.path.length); return m?m.path[m.path.length-1]:stagePos(a); }),xs=P.map(p=>p.x),ys=P.map(p=>p.y);   // where they will stand
  stageZone={x0:Math.min(...xs)-8,x1:Math.max(...xs)+8,y0:Math.min(...ys)-8,y1:Math.max(...ys)+8,pts:P};   // the cleared area follows the conversation when a scene moves on
  stageShooOut();
}
SCENE_OPS.huddle=huddleStep;
// {approach:names} (near1, Tom 2026-11-12: "why does the party stay so far away? ... I just want them to be close in a normal way", the
// Dona Carmen thaw, which starts at the pupuseria door seven tiles from her). playScene puts one before the first line of every scene that
// has no staging of its own (no walk, place, cam or zoom step) and is not a boss scene. When the first person on this map who speaks in the
// scene stands more than three tiles from Tom, Tom walks to the nearest open tile next to them (never overlapping: stageApart) and the
// party forms up around him there; the {huddle} before each line then keeps them together. Monsters, hidden people and seated people are
// never approached, and nothing happens when there is no route. Nobody in the party stands on the picture of anyone in the room (the three
// columns around each person stay clear down to two rows in front of them), and the party faces the person they walked up to. A scene can also name its subject itself: {approach:'Dona Carmen'}.
const APPROACH_FAR=3,APPROACH_MAX=14;
function approachSubject(names) {
  const tp=stagePos(player);
  for(const nm of [].concat(names||[])) { const n=sceneActor(nm);
    if(!n||n===player||followers.includes(n)||!currentMap.npcs.includes(n)||n.hidden||n.monster||n.seat||n.scenePose||n.scr) continue;
    const p=stagePos(n),d=Math.max(Math.abs(p.x-tp.x),Math.abs(p.y-tp.y));
    return d>APPROACH_FAR&&d<=APPROACH_MAX?n:null; }   // the first speaker who is here decides: close already (or out of reach) means stay
  return null;
}
function approachSpot(n,clr,memo) {
  const map=currentMap,tp=stagePos(player),np=stagePos(n);
  const busy=currentMap.npcs.filter(m=>!m.hidden&&!followers.includes(m)&&!stageExtra(m)).map(stagePos);
  let best=null,bc=1e9;
  for(let y=np.y-3;y<=np.y+3;y++) for(let x=np.x-2;x<=np.x+2;x++) {
    if(huddleBadTile(map,x,y,memo)||map.portals.has(key(x,y))||hudNear(x-np.x,y-np.y)>1.6) continue;
    if(!busy.every(b=>stageApart(b,{x,y}))) continue;
    const path=(x===tp.x&&y===tp.y)?[]:findPath(map,player,{x,y}); if(!path.length&&(x!==tp.x||y!==tp.y)) continue;
    let c=path.length+(clr.at(x,y)<2?1.5:0);
    if((x-np.x)*(tp.x-np.x)+(y-np.y)*(tp.y-np.y)<0) c+=6;   // Tom stops on the side he came from, not behind the person
    if(c<bc) { bc=c; best={x,y,path}; } }
  return best;
}
function approachStep(o) {
  return {start(){
      this.moves=[]; this.g=null;
      if(player.stagePlaced||player.scenePose||player.scr||followers.some(f=>f.stagePlaced)) return;
      const n=approachSubject(o.approach); if(!n) return;
      const clr=huddleClear(currentMap),memo=new Map(); memo.boxes=stageBoxes(null);
      const mk=a=>({x:stagePos(a).x,y:stagePos(a).y,hw:.5,ht:2.3,a}),box=mk(n);
      const boxes=[box,...currentMap.npcs.filter(m=>m!==n&&!m.hidden&&!m.monster&&!followers.includes(m)).map(mk)]; memo.boxes.push(...boxes);   // nobody stands on the person's picture: the three columns around them stay clear down to two rows in front
      const spot=approachSpot(n,clr,memo); if(!spot) return;
      intro.nearBox=box; intro.nearBoxes=boxes;
      const was={x:player.x,y:player.y,move:player.move};
      player.move=null; player.x=spot.x; player.y=spot.y;   // lay the party out as if Tom already stood there
      const g=huddleGroup(n.name,null),L=huddleLayout(g,clr,false,memo,false);
      player.x=was.x; player.y=was.y; player.move=was.move;
      if(!L.slots||!L.tight) { intro.nearBox=null; intro.nearBoxes=null; return; }   // no room for everyone beside this person: stay, the {huddle} forms the group where Tom is
      this.g=g; this.moves.push({a:player,path:spot.path,i:0});
      L.movers.forEach((a,k)=>{ if(a===player) return; const t=L.slots[k],p=stagePos(a); a.x=p.x; a.y=p.y; a.move=null; a.lag=0; if(a.stageFaced!==undefined) a.stageFaced=false;
        let path=(t.x===p.x&&t.y===p.y)?[]:findPath(currentMap,a,t);
        if(!path.length&&(t.x!==p.x||t.y!==p.y)) path=[{x:t.x,y:t.y}];
        this.moves.push({a,path,i:0}); });
    },
    update(dt){ let done=true;
      for(const m of this.moves) { const a=m.a;
        if(a.move&&!advanceMove(a,dt)) { done=false; continue; }
        if(m.i<m.path.length) { const t=m.path[m.i++]; a.facing=directionTo(t.x-a.x,t.y-a.y);
          a.move={fx:a.x,fy:a.y,tx:t.x,ty:t.y,elapsed:0,duration:.15}; done=false; } }
      if(done&&this.g) { this.g.lookAt=intro.nearBox&&intro.nearBox.a; huddleTurn(this.g); }
      return done; }};
}
SCENE_OPS.approach=approachStep;
// {around:[px,py],tom:[x,y],size:[w,h]} (item1, Tom 2026-11-12: at the sourdough starter "they're just totally in the middle of the house, not
// around the starter ... check that for every single possible instance of when you interact with an item"). A scene about an OBJECT: Tom and
// everyone who walks with him stand around it. [px,py] is the bottom middle of the object's picture in tiles (art px / tile px); size is its
// picture in tiles (default .6 wide, .7 tall). {around:{x,y,w,h}} is an object's tile rectangle instead. Tom takes `tom` when given (and anyone named in at:{id:[x,y]} takes that tile), else the
// nearest good tile; the others take the nearest good tiles after him, on his side. A good tile: on the floor, reachable, not the map edge or
// under the dialogue box, not behind painted scenery (huddleHidden), not on anyone's picture or on the object's picture, never the same column
// as another walker within two rows (stageApart). Everyone ends facing the object. While it is active the {huddle} before each line leaves
// the group alone (they keep looking at the object); {around:null} or the end of the scene lets go.
// AUTOMATIC: playScene adds one before the first line of any scene that starts while Tom stands at an object he just pressed A on (objPress),
// unless the scene stages itself (walk, place, cam, zoom) or is a boss scene. Tom stays on his tile, facing the object.
const aroundRect=o=>Array.isArray(o.around)?(()=>{ const z=o.size||[.6,.7]; return {x0:o.around[0]-z[0]/2,x1:o.around[0]+z[0]/2,y0:o.around[1]-z[1],y1:o.around[1]}; })()
  :{x0:o.around.x,x1:o.around.x+(o.around.w||1),y0:o.around.y,y1:o.around.y+(o.around.h||1)};
const aroundGap=(R,x,y)=>Math.hypot(Math.max(R.x0-x,0,x-R.x1),Math.max(R.y0-y,0,y-R.y1)*.8);   // from a point to the object's picture (rows count a little less: figures are tall)
function aroundSpots(R,walkers,tomAt,at) {
  const map=currentMap,memo=new Map(); memo.boxes=stageBoxes(null);
  const busy=map.npcs.filter(m=>!m.hidden&&!followers.includes(m)&&!stageExtra(m)).map(stagePos);   // passers-by are sent off by {clearout} and never count (clearout1)
  const covers=(x,y)=>x+.1<R.x1&&x+.9>R.x0&&y-.7<R.y1&&y+1>R.y0;   // a person standing on (x,y) is drawn over the object
  const taken=[],out=[]; let reach=null;   // reach: steps on foot from Tom's spot, so nobody ends up across a wall, a fence or the object itself from him
  const flood=t=>{ reach=new Map([[key(t.x,t.y),0]]); let q=[[t.x,t.y]];
    for(let d=1;d<=7&&q.length;d++) { const nq=[]; for(const [x,y] of q) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k=key(x+dx,y+dy);
      if(!reach.has(k)&&walkable(map,x+dx,y+dy)) { reach.set(k,d); nq.push([x+dx,y+dy]); } } q=nq; } };
  walkers.forEach((a,k)=>{ const p=stagePos(a); let best=null,bc=1e9;
    if(k===1) flood(taken[0]);
    const tryTile=(x,y,forced)=>{
      if(reach&&!reach.has(key(x,y))) return;
      if(!walkable(map,x,y)||!taken.every(t=>stageApart(t,{x,y}))) return;
      if(!forced&&(map.portals.has(key(x,y))||!busy.every(b=>stageApart(b,{x,y}))||huddleBadTile(map,x,y,memo)||covers(x,y))) return;
      const path=(x===p.x&&y===p.y)?[]:findPath(map,a,{x,y}); if(!path.length&&(x!==p.x||y!==p.y)) return;
      const c=forced?-1:aroundGap(R,x+.5,y+.75)+.02*path.length+(reach?.15*reach.get(key(x,y)):0);
      if(c<bc) { bc=c; best={x,y,path}; } };
    if(k===0&&tomAt) tryTile(tomAt[0],tomAt[1],true);
    const mine=k>0&&at&&a.member&&at[a.member.id]; if(mine) tryTile(mine[0],mine[1],true);   // at:{tnb:[x,y]}: a mark the scene chose for one walker
    if(!best) for(let y=Math.floor(R.y0)-4;y<=Math.ceil(R.y1)+4;y++) for(let x=Math.floor(R.x0)-4;x<=Math.ceil(R.x1)+4;x++) tryTile(x,y,false);
    if(!best) best={x:p.x,y:p.y,path:[]};
    taken.push(best); out.push(best); });
  return out;
}
function aroundStep(o) {
  return {start(){
      this.moves=[]; this.on=false;
      if(!o.around) { intro.objStage=null; return; }
      if(o.auto&&objPressLive()!==o.auto) return;   // the scene has already moved Tom or changed the map: nothing to stand around
      const R=aroundRect(o); this.on=true;
      const walkers=[player,...followers.filter(f=>stageWalks(f)&&!f.scenePose&&!f.scr)];
      const spots=aroundSpots(R,walkers,o.tom,o.at);
      walkers.forEach((a,k)=>{ const p=stagePos(a); a.x=p.x; a.y=p.y; a.move=null; a.lag=0; storyHold(a); a.stagePlaced=true; a.stageFaced=true;
        this.moves.push({a,path:spots[k].path,i:0,wait:k*.22,dur:o.speed||.17}); });   // they set off one after another, so nobody walks inside anybody
      intro.objStage={R,walkers,keep:o.keepTom?player.facing:null};
      if(typeof stageFrame==='function') stageFrame({roster:walkers,others:[]},this.moves);   // the cutscene camera frames and zooms on the group at the object (cutstage1)
    },
    update(dt){ let done=true;
      for(const m of this.moves) { const a=m.a;
        if(m.wait>0) { m.wait-=dt; if(m.path.length) done=false; continue; }
        if(a.move&&!advanceMove(a,dt)) { done=false; continue; }
        if(m.i<m.path.length) { const t=m.path[m.i++]; a.facing=directionTo(t.x-a.x,t.y-a.y);
          a.move={fx:a.x,fy:a.y,tx:t.x,ty:t.y,elapsed:0,duration:m.dur}; done=false; } }
      if(done&&this.on) aroundFace(intro.objStage);
      return done; }};
}
function aroundFace(st) { if(!st) return;
  for(const a of st.walkers) { if(a.scenePose||a.scr||a.move) continue;
    if(a===player&&st.keep) { a.facing=st.keep; continue; }   // Tom pressed A on it: he is already looking at it
    const p=stagePos(a),px=p.x+.5,py=p.y+.2,R=st.R,dx=Math.max(R.x0-px,0)-Math.max(px-R.x1,0),dy=Math.max(R.y0-py,0)-Math.max(py-R.y1,0);
    if(dx||dy) a.facing=directionTo(dx,dy); } }
SCENE_OPS.around=aroundStep;
// The object Tom pressed A on (kept while he stays on that tile): a scene that starts from it gathers the party around it.
let objPress=null;
function objPressNote() {
  if(typeof dialog!=='undefined'&&dialog.active) return; if(intro.active||(typeof transition!=='undefined'&&transition)||player.move) return;
  const t=typeof facingTarget==='function'?facingTarget():null;
  objPress=t&&t.kind==='object'&&t.value?{o:t.value,map:currentMap,x:player.x,y:player.y}:null;
}
const objPressLive=()=>objPress&&objPress.map===currentMap&&player.x===objPress.x&&player.y===objPress.y&&!player.move?objPress.o:null;
window.addEventListener('load',()=>{ const prev=pressAction; pressAction=function() { objPressNote(); return prev.apply(this,arguments); }; });   // outermost: runs before every chapter's own A-button rule
// Who speaks in a scene, in order (also inside if / seq branches): the names {approach} tries.
function sceneSpeakers(list) {
  const out=[]; const walk=x=>{ if(!x||typeof x!=='object'||typeof x.start==='function') return; if(Array.isArray(x)) return x.forEach(walk);
    if(typeof x.talk==='string'&&!out.includes(x.talk)) out.push(x.talk); for(const k of ['then','else','seq','all']) if(x[k]) walk(x[k]); };
  walk(list); return out;
}
const sceneSelfStaged=list=>/"(walk|place|cam|zoom|approach|around)":/.test(JSON.stringify(list,(k,v)=>typeof v==='function'?undefined:v));
// Every boss lead-in, fight (and retry) and after scene, with whom the party faces. playScene inserts {gather} just before the
// scene's first line of dialogue (after any walk-in, spawn or placement steps), unless the scene has its own {gather}.
const BOSS_STAGE={
  ch1Pond:'The Big One',ch1AfterBoss:'The Big One',ch2Boss:'The Big Shake',ch2AfterBoss:'The Big Shake',
  ch3Pool:'Old Iron-Gill',ch3AfterBoss:'Old Iron-Gill',ch4Boss:'The Director’s Cut',ch4AfterBoss:'The Director’s Cut',
  ch5Boss:'The Red Pen',ch5AfterBoss:'The Red Pen',ch6Boss:'Chairman Cheeks',ch6AfterBoss:'Chairman Cheeks',
  ch7Boss:'The Unread',ch7AfterBoss:'The Unread',ch8Boss:'Old Ironbelly',ch8AfterBoss:'Old Ironbelly',
  ch9Boss:'The Mirrorball',ch9AfterBoss:'The Mirrorball',ch10Boss:'The Last Call',ch10AfterBoss:'The Last Call',
  ch11Vance:['finalcall','Long coat'],ch11After:['finalcall','Long coat'],ch12Prime:['gridlockprime','Marlowe'],ch12After:['gridlockprime','Marlowe'],
  ch13Worm:'drillworm',ch13After:'drillworm',
  ch14Gate:()=>typeof ch14Boppy==='function'?ch14Boppy():null,ch14After:()=>typeof ch14Boppy==='function'?ch14Boppy():'Boppy',
  ch15Open:'HUSH-9',ch15Fight:'HUSH-9',ch15After:'HUSH-9',ch16Open:'Marlowe',ch16Fight:'Marlowe',ch16After:'Marlowe',
  ch17Vault:'twinlens',ch17Fight:'twinlens',ch17After:'twinlens',ch18Pinnacle:'vance',ch18Fight:'vance',ch18After:'vance',
  ch19Claim:'censor',ch19Fight:'censor',ch19After:'censor',
  ch20Heart:'leviathan',ch20Fight1:'leviathan',ch20Shatter:'leviathan',ch20Fight2:'julian',ch20Calm:'julian',
  nsPond:'Brain Freeze',nsPond2:'Brain Freeze',nsAfterBoss:'Brain Freeze'
};
// A boss scene's steps with staging added: one {gather} just before the first line of dialogue (after any walk-in, spawn or
// placement steps) unless the scene has its own, and a {gather,check} before every later line (also inside if/seq branches,
// not inside {all}), so the party re-spreads if a walk or a jump crowds it and turns back toward the boss.
function stageScript(list,focus,mk) {   // mk(first,talkStep) builds the step to insert (huddle); default is {gather:focus}
  const has=x=>{ if(!x||typeof x!=='object') return false; if(Array.isArray(x)) return x.some(has); if(typeof x.start==='function') return false;
    if('talk' in x) return true; return ['then','else','seq'].some(k=>x[k]&&has(x[k])); };
  const own=JSON.stringify(list,(k,v)=>typeof v==='function'?undefined:v).includes('"gather"')||JSON.stringify(list,(k,v)=>typeof v==='function'?undefined:v).includes('"huddle"');
  let first=!own;
  const walk=steps=>{ const out=[];
    for(const st of steps) {
      if(st&&typeof st==='object'&&typeof st.start!=='function'&&!Array.isArray(st)) {
        if('talk' in st) { out.push(...[].concat(mk?mk(first,st):(first?{gather:focus}:{gather:focus,check:true}))); first=false; out.push(st); continue; }
        if(has(st)) { if(first) { out.push(...[].concat(mk?mk(true,null):{gather:focus})); first=false; }
          const c=Object.assign({},st); for(const k of ['then','else','seq']) if(Array.isArray(c[k])) c[k]=walk(c[k]); out.push(c); continue; }
      }
      out.push(st);
    }
    return out; };
  return walk(list);
}
function compileScene(list) {
  return list.filter(Boolean).map(st=>{
    if(typeof st.start==='function'&&typeof st.update==='function') return st;
    const op=Object.keys(SCENE_OPS).find(k=>k in st);
    if(!op) { console.warn('Unknown scene step',st); return S.wait(0); }
    return SCENE_OPS[op](st);
  });
}
// Play a script: an array of steps, a SCENES id, or a function that returns steps (it runs when the scene starts).
function playScene(script,opts={}) {
  const sid=typeof script==='string'?script:null;
  if(typeof script==='string') script=SCENES[script];
  let list=typeof script==='function'?script(opts.ctx||{}):script;
  for(const f of [...followers,player]) { f.stagePlaced=false; f.stageFaced=false; }
  intro.monGather=null; intro.nearBox=null; intro.nearBoxes=null; intro.objStage=null;
  if(sid&&BOSS_STAGE[sid]&&Array.isArray(list)) { const fc=BOSS_STAGE[sid]; list=stageScript(list,fc,(first,st)=>[first?{gather:fc}:{gather:fc,check:true},{huddle:true,focus:fc,with:st&&typeof st.talk==='string'?st.talk:null}]); }
  // opts.stage: a wrapper script (playScene(()=>[...])) that should be staged like a SCENES id (facing1: the Part 2 opening).
  else if((sid||opts.stage)&&Array.isArray(list)&&!JSON.stringify(list,(k,v)=>typeof v==='function'?undefined:v).includes('"gather"')) { const self=sceneSelfStaged(list),near=self?null:sceneSpeakers(list),ob=self?null:objPressLive();   // ob: the scene started at an object Tom pressed A on (item1)
    list=stageScript(list,null,(first,st)=>{ const h={huddle:true,with:st&&typeof st.talk==='string'?st.talk:null,lookAt:st&&typeof st.lookAt==='string'?st.lookAt:null};
      return first&&ob?[{around:{x:ob.x,y:ob.y,w:ob.w,h:ob.h},tom:[player.x,player.y],keepTom:true,auto:ob},h]:first&&near&&near.length?[{approach:near},h]:h; }); }
  stageZone=null; intro.sceneCast=null;
  if((sid||opts.stage)&&Array.isArray(list)) { intro.sceneCast=stageCast(list); list=[{clearout:true},...list]; }   // extras leave before anyone is placed (clearout1)
  intro.active=true; intro.phase='scene'; intro.cur=null; intro.fadeLock=false;
  intro.sid=sid;   // which SCENES id is playing (null for a wrapper script): REPORT records it (engine/report.js)
  intro.fade=opts.fade||0;
  intro.steps=compileScene(list);
  if(!opts.keep) intro.steps.push(S.call(()=>{ if(intro.active) endIntro(); }));   // scenes end themselves unless told not to
  if(typeof clearInput==='function') clearInput();
}

// Where a chapter begins, for the title card's backdrop: the chapter's own start {map,x,y} if it has one; otherwise the arrival
// spot the chapter plays from (LA chapters 2, 4, 6, 8: the Angel City cab stand; home chapters 3, 5, 7, 9: the Long Island taxi
// depot; chapter 13: the cab stand). Chapters 1 and 10 already play where they start.
function chapterCardSpot(n) {
  const st=CHAPTERS[n]&&CHAPTERS[n].start;
  if(st&&worlds[st.map]) return {map:worlds[st.map],x:st.x,y:st.y};
  if([2,4,6,8].includes(n)&&worlds.blvd&&houseById.lacab) { const h=houseById.lacab; return {map:worlds.blvd,x:h.door.x,y:h.door.y+1}; }
  if(n===13&&worlds.lacab) return {map:worlds.lacab,x:7,y:6};
  if([3,5,7,9].includes(n)&&houseById.taxi) { const h=houseById.taxi; return {map:town,x:h.door.x,y:h.door.y+1}; }
  return null;
}
// The card shows the chapter's starting area behind it, not whatever map was loaded. Only acts when the loaded map is a different one,
// so a chapter that already starts where it plays is not nudged.
function cardBackdrop(n) {
  const sp=chapterCardSpot(n);
  if(!sp||!sp.map||currentMap===sp.map) return;
  currentMap=sp.map; player.x=sp.x; player.y=sp.y; player.move=null;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true;
}

// Chapter title card, drawn over the scene: CHAPTER N and the chapter's name.
const LE_drawIntroScreen_story=drawIntroScreen;
drawIntroScreen=function(time) {
  LE_drawIntroScreen_story(time);
  const c=intro.card; if(!c) return;
  const info=c.part?{title:c.title||PARTS[c.part].sub}:chapterInfo(c.n),a=Math.min(1,c.t/.4,Math.max(0,(3-c.t)/.4));
  gfx.globalAlpha=a*.85; rect(0,0,W,H,'#14201c'); gfx.globalAlpha=a;
  const cy=Math.round(H*.42),big=Math.max(2,Math.min(4,Math.floor(W/90)));
  const words=info.title.toUpperCase().split(' '),lines=[];
  let cur=''; const maxCh=Math.floor((W-24)/(4*big));
  for(const w of words) { if((cur+' '+w).trim().length>maxCh) { lines.push(cur); cur=w; } else cur=(cur+' '+w).trim(); }
  if(cur) lines.push(cur);
  const head=c.part?'PART '+c.part+(c.done?' COMPLETE':''):info.bonus?'BONUS CHAPTER'+(c.done?' COMPLETE':''):c.done?'CHAPTER '+c.n+' COMPLETE':(c.n?'CHAPTER '+c.n:'DEMO');
  label(head,W/2+1,cy-12*big+1,'#1b2d27',big-1||1); label(head,W/2,cy-12*big,'#ffd968',big-1||1);
  rect(W/2-40,cy-4*big,80,1,'#ffd968');
  lines.forEach((l,i)=>{ const y=cy+i*8*big; label(l,W/2+1,y+1,'#1b2d27',big); label(l,W/2,y,'#fff1cb',big); });
  gfx.globalAlpha=1;
};

// ---------- 4. Save v3 ----------
// Older saves have no story block. They were all made in the demo, after the opening, so they migrate to chapter 0
// with flags rebuilt from what the save already knows (who Tom has met, whether he has been to LA).
function migrateSave(sv) {
  if(!sv||sv.story) return sv;
  const flags={'opening-done':true},met=n=>Object.values(sv.flags||{}).some(f=>f&&f[n]);
  if((sv.visited||[]).some(id=>worlds[id]&&regionOf(worlds[id])==='la')||(worlds[sv.map]&&regionOf(worlds[sv.map])==='la')) flags['visited-la']=true;
  if(met('Nara')||(sv.party||[]).some(p=>p.id==='nara')) flags['met-nara']=true;
  if(met('TNB')||(sv.party||[]).some(p=>p.id==='tnb')) flags['met-tnb']=true;
  sv.story={mode:'demo',chapter:0,flags,traces:0,traceLog:{}};
  sv.migratedFrom=sv.v||1;
  return sv;
}
const LE_readSave_story=readSave;
readSave=function(slot) { return migrateSave(LE_readSave_story(slot)); };
const LE_saveSnapshot_story=saveSnapshot;
saveSnapshot=function() {
  const s=LE_saveSnapshot_story(); s.v=4;   // v4: Option 3 Stampcards (engine/progress.js b6AfterLoad migrates older ones)
  s.story={mode:STORY.mode,chapter:STORY.chapter,flags:Object.assign({},STORY.flags),traces:STORY.traces,traceLog:Object.assign({},STORY.traceLog),override:STORY.override};
  return s;
};
const LE_loadGame_story=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot); if(!sv) return false;
  const st=sv.story;
  STORY.mode=st.mode||'demo'; STORY.chapter=st.chapter||0; STORY.flags=Object.assign({},st.flags);
  STORY.traces=st.traces||0; STORY.traceLog=Object.assign({},st.traceLog); STORY.override=st.override||null;
  const ok=LE_loadGame_story(slot);
  if(ok) applyPartyRules();
  return ok;
};
// A new game starts the story fresh.
// START NEW in the full game begins chapter 1: its title card, then the opening.
beginOpening=function() {
  resetStory('full',1);
  intro.phase='scene';
  playScene(()=>[{card:1,time:3.2},...SCENES.opening()],{fade:.7});
};

// ---------- 5. Running a chapter (C1): triggers, gates, cutscene actors, story fights ----------
// Content lives in data/scenes.js: TRIGGERS (when a scene starts), TUTORIALS (tips during a story fight), STORY_WORLD
// (rules that move things on the map for the story) and STORY_PROPS (small sprites an actor can carry or wear).
// A trigger: {id, map, at:[x0,y0,x1,y1] (optional; Tom must stand inside), when:{storyMatch conditions}, scene}.
// The scene must set a flag that stops its own trigger. Checked while Tom stands still and nothing else is going on.
function storyTriggers() {
  if(STORY.mode!=='full'||intro.active||transition||typeof TRIGGERS==='undefined') return false;
  storyWorld();
  for(const t of TRIGGERS) {
    if(t.map&&t.map!==currentMap.id) continue;
    if(t.at&&(player.x<t.at[0]||player.y<t.at[1]||player.x>t.at[2]||player.y>t.at[3])) continue;
    if(!storyMatch(t.when||{})) continue;
    player.move=null; queuedAction=false;
    playScene(t.scene);
    return true;
  }
  return false;
}
// Arrival facing (facing2, Tom 2026-11-12): when a map change lands Tom where a scene is about to start, the people who talk in that scene
// already face him as the room fades in (before, posed people faced their pose and wanderers looked anywhere until the first line).
// A posed NPC keeps `arriveFace` (read by updateNPCs in engine/battle-draw.js) until the scene ends; a wanderer just waits.
function storyArriveFace() {
  if(STORY.mode!=='full'||typeof TRIGGERS==='undefined'||typeof SCENES==='undefined') return;
  storyWorld();
  const t=TRIGGERS.find(t=>(!t.map||t.map===currentMap.id)&&!(t.at&&(player.x<t.at[0]||player.y<t.at[1]||player.x>t.at[2]||player.y>t.at[3]))&&storyMatch(t.when||{}));
  if(!t||typeof t.scene!=='string') return;
  let list=SCENES[t.scene]; if(typeof list==='function') { try { list=list(); } catch(e) { return; } }
  if(!Array.isArray(list)) return;
  const names=new Set(); for(const st of list) if(st&&typeof st.talk==='string') names.add(st.talk);
  for(const n of currentMap.npcs) {
    if(!names.has(n.name)||n.hidden||n.monster) continue;
    const dx=player.x-n.x, dy=player.y-n.y; if(!dx&&!dy) continue;
    const dir=Math.abs(dy)>=Math.abs(dx)?(dy>0?'down':'up'):(dx>0?'right':'left');
    n.facing=dir; n.path=[]; n.move=null;
    if(n.still) n.arriveFace=dir; else n.idle=Math.max(n.idle||0,4);
  }
}
const LE_switchMap_story=switchMap;
switchMap=function(portal) { LE_switchMap_story(portal); storyArriveFace(); };
// Map rules for the story (data/scenes.js STORY_WORLD): run every frame outside cutscenes and right after a map change.
function storyWorld() { if(STORY.mode==='full'&&typeof STORY_WORLD!=='undefined') for(const f of STORY_WORLD) f(); }

// Gates: an area spec can carry gates:[{at:[[x,y],...], cond, name, lines}] that close an exit while `cond` matches (storyMatch conditions).
// Tom steps back and gets the gate's lines; a fallen branch is drawn across the opening.
function storyGate(map,x,y) {
  if(STORY.mode!=='full') return null;
  for(const g of (map.spec&&map.spec.gates)||[]) if(g.at.some(([a,b])=>a===x&&b===y)&&storyMatch(g.cond||{})) return g;
  return null;
}
const LE_beginTransition_story=beginTransition;
beginTransition=function(portal) {
  if(portal.kind==='edge') {
    const g=storyGate(currentMap,player.x,player.y);
    if(g) {
      const d=DIR[player.facing]; player.x-=d.x; player.y-=d.y; player.move=null; placeFollowers();
      sfx.bump(); if(g.gatelock&&typeof ch10Gate==='function'&&ch10Gate(g)) return; openDialog(g.name,npcLines(g)); return;
    }
  }
  return LE_beginTransition_story(portal);
};

// Cutscene actors. Walking or placing an NPC holds it (it stops wandering) until the scene ends.
function storyHold(n) {
  if(!n||n===player||n.kid||followers.includes(n)||n.held) return;
  n.held=true; n.path=[]; n.move=null; n.heldFrom={x:n.x,y:n.y}; (intro.held=intro.held||[]).push(n);
}
// A temporary actor for a scene: {name, at:[x,y], monster (its sprite), mscale, carry, dir}. Removed by despawn.
function storySpawn(o) {
  const [x,y]=scenePos(o.at);
  const a=actor(o.name,x,y,o.look||'moss',[]);
  Object.assign(a,{monster:o.monster||null,mscale:o.mscale||1,carry:o.carry||null,scripted:true,tier:0,maxHp:1,defeatedUntil:0,roam:0,facing:o.dir||'down'});
  if(o.fade!=null) a.fade=o.fade;   // spawn invisible ({fade:0}) and bring them in with {fadeActor}
  currentMap.npcs.push(a); storyHold(a);
  return a;
}
function storyDespawn(name) { for(const m of Object.values(worlds)) m.npcs=m.npcs.filter(n=>!(n.scripted&&n.name===name)); }
const LE_endIntro_story=endIntro;
endIntro=function() {
  sceneCam=null; sceneAuto=null; if(!introKeepZoom) sceneZoomManual=false; stageZone=null; intro.sceneCast=null;   // the camera eases back out to Tom (engine/overworld.js sceneAutoTick)
  // Map monsters a scene walked out go back to their spots (so they never block a path afterwards).
  for(const n of intro.held||[]) { n.held=false; n.path=[]; n.move=null; n.idle=1+Math.random(); if(n.monster&&!n.scripted&&n.heldFrom&&!n.sunk) { n.x=n.heldFrom.x; n.y=n.heldFrom.y; } }
  intro.held=[];
  for(const n of currentMap.npcs) if(n.arriveFace) n.arriveFace=null;
  LE_endIntro_story();
  placeFollowers();
};
// Story monsters (scripted) never wander or engage; STORY_HOLD (data/scenes.js) can keep a whole map still.
const LE_b7MonsterTick_story=b7MonsterTick;
b7MonsterTick=function(n,dt) {
  if(n.scripted||(STORY.mode==='full'&&typeof STORY_HOLD==='function'&&STORY_HOLD(n))) { n.chasing=false; n.alert=0; return; }
  return LE_b7MonsterTick_story(n,dt);
};
// Drawing: props an actor carries or wears (STORY_PROPS), and gate branches.
// The Mudling's pie-heist frames (data/mudling-heist.js, painted, faces LEFT). a.scenePose={f:'mh_spot'|[frames],fps,dir} on a story monster;
// an array of frames cycles at fps. dir 'right' mirrors it. Returns true when it drew (the caller then skips the plain sprite).
// A painted enemy frame for a scene: {pose:'The Big One',foe:'attack3',dir:'left'} (foe: 'stance', 'hurt' or 'attackN'). The painted enemy sheets
// face RIGHT (data/foes/use.js), so dir 'left' mirrors the frame. Used by drawActor (engine/town-render.js); null when the frame is not there.
const FOE_POSE_ROWS={};
function foePoseRows(a,d) {
  const P=a.scenePose,nm=P&&P.foe; if(!nm) return null;
  if(P.end&&typeof endRows==='function') return endRows(P.end,nm,P.dir);
  if(!d.frames) return null;
  const r=nm==='stance'?d.sprite:nm==='hurt'?d.frames.hurt:d.frames.attack[(+nm.replace('attack',''))-1]; if(!r) return null;
  if(P.dir!=='left') return r;
  const key=a.monster+':'+nm; return FOE_POSE_ROWS[key]||(FOE_POSE_ROWS[key]=mirrorRows(r));
}
const MH_ROWS={};
function mudlingHeistDraw(a,cx,base) {
  const P=a.scenePose,H=typeof MUDLING_HEIST!=='undefined'?MUDLING_HEIST:null; if(!P||!H||!P.f) return false;
  const f=Array.isArray(P.f)?P.f[Math.floor(elapsedTime*(P.fps||6))%P.f.length]:P.f; if(!H.rows[f]) return false;
  if(!MH_ROWS.atlas) MH_ROWS.atlas=paintedAtlas('mudlingHeist',H.src,H.rects,H.k);
  const flip=P.dir==='right',key=f+(flip?'R':'L');
  if(!MH_ROWS[key]) { const r=paintRows(H.rows[f].slice(),MH_ROWS.atlas,f,false); MH_ROWS[key]=flip?mirrorRows(r):r; }
  const rows=MH_ROWS[key],m=H.meta[f],s=a.mscale||1,w=rows[0].length,h=rows.length,ax=flip?w-m.ax:m.ax;
  const lift=(m.lift+(a.lift||0))*s;
  ellipse(cx,base+1,Math.round(w*s*.42*(1-Math.min(.35,lift/60))),5*s,'#2f493640');
  drawSprite(rows,H.pal,cx-Math.round(ax*s),Math.round(base-h*s-lift),s);
  return true;
}
function drawActorExtra(a,cx,top,w,h) {
  if(typeof STORY_PROPS==='undefined') return;
  const P=a.carry&&STORY_PROPS[a.carry]; if(P) P(cx,top+Math.round(h*.62),a);   // held in front of its belly
  const c=typeof STORY_CROWN==='function'?STORY_CROWN(a):null; if(c&&STORY_PROPS[c]) STORY_PROPS[c](cx,top+3,a,true);
}
const LE_b7DrawMapFx_story=b7DrawMapFx;
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_story(time);
  for(const g of (currentMap.spec&&currentMap.spec.gates)||[]) {
    if(!storyMatch(g.cond||{})||STORY.mode!=='full') continue;
    const xs=g.at.map(p=>p[0]),ys=g.at.map(p=>p[1]),x0=Math.min(...xs)*T-6,x1=(Math.max(...xs)+1)*T+6,y=(Math.min(...ys)+.62+(g.dy||0))*T;   // dy: draw it lower (so a top-edge gate is not under the HUD)
    if(g.look==='schoolgate') {   // a chain-link school gate across an east or west edge opening
      const gx=Math.min(...xs)*T+T-8,y0=Math.min(...ys)*T-4,y1=(Math.max(...ys)+1)*T+2;
      rect(gx-2,y0-10,6,y1-y0+10,'#2b2a26'); rect(gx-1,y0-9,4,y1-y0+8,'#8a8f98');
      for(let yy=y0;yy<y1;yy+=6) { rect(gx-6,yy,12,1,'#a9adb5'); }
      rect(gx-9,y0+(y1-y0)/2-6,18,12,'#2b2a26'); rect(gx-8,y0+(y1-y0)/2-5,16,10,'#f4f0e6'); rect(gx-6,y0+(y1-y0)/2-2,12,2,'#d94a3a');
      continue;
    }
    if(g.look==='doors') continue;   // the gate's doors are drawn as their own object (gatedoors), so nothing goes across them
    if(g.look==='barrier') {   // a sawhorse road barrier with orange and white stripes (LA)
      rect(x0+2,y-2,3,10,'#2b2a26'); rect(x1-5,y-2,3,10,'#2b2a26');
      rect(x0,y-7,x1-x0,8,'#2b2a26');
      for(let x=x0+1;x<x1-1;x+=6) rect(x,y-6,Math.min(3,x1-1-x),6,'#f08a3a');
      for(let x=x0+4;x<x1-1;x+=6) rect(x,y-6,Math.min(3,x1-1-x),6,'#fff1cb');
      rect(x0+4,y-12,6,5,'#2b2a26'); rect(x0+5,y-11,4,3,Math.floor(time*2)%2?'#ffd166':'#c8553d');
      continue;
    }
    rect(x0,y-7,x1-x0,14,'#2b1d12'); rect(x0+2,y-5,x1-x0-4,10,'#7a5536'); rect(x0+2,y-5,x1-x0-4,3,'#9a7048');
    for(let k=0;k<3;k++) { const bx=x0+14+k*(x1-x0-28)/2; rect(bx,y-12,3,8,'#5a3b22'); ellipse(bx+2,y-14,7,5,'#4f7d45'); ellipse(bx+5,y-16,4,3,'#6fa04e'); }
    rect(x0-2,y-4,4,8,'#c9a27a'); rect(x1-2,y-4,4,8,'#c9a27a');
  }
  // Story map effects (data/scenes.js STORY_MAPFX): smog, trances, pipes. Drawn in map coordinates over everything.
  if(STORY.mode==='full'&&typeof STORY_MAPFX!=='undefined') for(const f of STORY_MAPFX) f(time);
};

// Sal does not drive to the airport while a chapter keeps Tom in town (CHAPTERS[n].noFlight: lines, or a function).
const LE_talkToDriver_story=talkToDriver;
talkToDriver=function(n) {
  const c=chapterInfo();
  if(STORY.mode==='full'&&c.noFlight) { const r=typeof c.noFlight==='function'?c.noFlight():c.noFlight; if(r) { openDialog(n.name,r.lines,n); if(r.toast) n.onClose=()=>showToast(r.toast,4.5); return; } }
  // Chapter 1 is over: the brakes came in, and Sal says so before the usual airport offer.
  if(STORY.mode==='full'&&STORY.chapter===1&&flag('ch1-done')&&!flag('ch2-sal')) {
    setFlag('ch2-sal'); n.visitedOnce=true;
    openDialog(n.name,['Good news! The brakes came in. From the next town, like I said. Long trip for a brake.','Cab seven is back. Which means... the AIRPORT is back.'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 2 is over: the freeways reopened, and Sol says so before the usual airport offer.
  if(STORY.mode==='full'&&STORY.chapter===2&&flag('ch2-done')&&!flag('ch3-sol')) {
    setFlag('ch3-sol'); n.visitedOnce=true;
    openDialog(n.name,['They finished the 105! Two years early. Nobody knows what to do with themselves.','Which means I can get you to LAX in twenty minutes. Or two hours. It\'s LA. But the AIRPORT is back.'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 3 is over: Sal says so before the usual airport offer (the flight starts chapter 4).
  if(STORY.mode==='full'&&STORY.chapter===3&&flag('ch3-done')&&!flag('ch4-sal')) {
    setFlag('ch4-sal'); n.visitedOnce=true;
    openDialog(n.name,['Cab seven had her oil changed. She feels like a new cab. She wants to go somewhere.','Your young man called the depot. He has a big shoot in Los Angeles. He said, and I quote, "tell him to come watch me be important."'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 4 is over: Sol says so before the usual airport offer (the flight starts chapter 5).
  if(STORY.mode==='full'&&STORY.chapter===4&&flag('ch4-done')&&!flag('ch5-sol')) {
    setFlag('ch5-sol'); n.visitedOnce=true;
    openDialog(n.name,['Your sister called the depot. Long distance. From Long Island. To a cab company.','She said, and I quote, "Conference night. Thursday. Tell him to bring snacks." She hung up before I could say goodbye.'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 5 is over: Sal says so before the usual airport offer (the flight starts chapter 6).
  if(STORY.mode==='full'&&STORY.chapter===5&&flag('ch5-done')&&!flag('ch6-sal')) {
    setFlag('ch6-sal'); n.visitedOnce=true;
    openDialog(n.name,['Cab seven slept for two days after conference night. She\'s herself again.','Your young man called the depot from Los Angeles. Something about squirrels. He sounded very serious about the squirrels.'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 6 is over: Sol says so before the usual airport offer (the flight starts chapter 7).
  if(STORY.mode==='full'&&STORY.chapter===6&&flag('ch6-done')&&!flag('ch7-sol')) {
    setFlag('ch7-sol'); n.visitedOnce=true;
    openDialog(n.name,['The 110 is open again. The squirrels let it go. I don\'t ask questions.','Your niece called the depot. Long distance. Something about a library. She sounded very serious about the library.'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 7 is over: Sal says so before the usual airport offer (the flight starts chapter 8).
  if(STORY.mode==='full'&&STORY.chapter===7&&flag('ch7-done')&&!flag('ch8-sal')) {
    setFlag('ch8-sal'); n.visitedOnce=true;
    openDialog(n.name,['Cab seven has four new tires. She\'s so proud. She keeps looking at them.','Your young man called the depot. Something about a potluck. He said, and I quote, "bring the starter."'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  // Chapter 8 is over: Sol says so before the usual airport offer (the flight starts chapter 9).
  if(STORY.mode==='full'&&STORY.chapter===8&&flag('ch8-done')&&!flag('ch9-sol')) {
    setFlag('ch9-sol'); n.visitedOnce=true;
    openDialog(n.name,['Cab 8 is detailed. She\'s gleaming. She wants to go somewhere fancy.','Your mother called the depot. Long distance. She said, and I quote, "tell Tommy the letter has a SEAL."'],n);
    n.onClose=()=>LE_talkToDriver_story(n); return;
  }
  return LE_talkToDriver_story(n);
};
// Steps added to the airport run right before the flight (engine/travel.js startTrip). Leaving Long Island after
// chapter 1 starts chapter 2: the chapter changes at takeoff, but its title card waits until Tom has landed and is
// standing in the new area (storyArrivalCard, played by engine/travel.js arriveLA and arriveHome). Tom, 1 Nov.
// The chapter this airport run starts, or 0 if it starts none. Chapters 2, 4, 6, 8 fly west; 3, 5, 7, 9 fly east.
function storyTripChapter(dir) {
  if(STORY.mode!=='full') return 0;
  const n=STORY.chapter+1;
  if(n<2||n>9||!flag('ch'+STORY.chapter+'-done')) return 0;
  return (dir==='west')===(n%2===0)?n:0;
}
function storyTripSteps(dir) {
  const n=storyTripChapter(dir);
  return n?compileScene([{chapter:n}]):[];
}
// The title card for the chapter this flight started, played after landing (empty if the flight starts no chapter).
function storyArrivalCard(dir) {
  const n=storyTripChapter(dir);
  return n?compileScene([{card:n,time:3.2}]):[];
}
// After any boss fight in the full game the story remembers the result (battle:<id> 'win' or 'lose'), so a retry
// started by pressing A on the boss counts the same as the scripted one.
const LE_b2End_story=b2End;
b2End=function(result) {
  const npc=B2.cfg&&B2.cfg.npc;
  LE_b2End_story(result);
  if(npc&&npc.monster&&STORY.mode==='full'&&b7IsBoss(npc)) setFlag('battle:'+npc.monster,result==='win'?'win':'lose');
};

// Story fights with tips (TUTORIALS in data/scenes.js). A tip: {id, who (member id, a list, or '*'), when(unit) optional, dir ('up',
// 'right','left','down': the command it points at; ▲ Attack, ▶ Heal, ◀ Warmth, ▼ Bag), keys (move keys to light inside that list),
// tombo (true or a Tombo id: point at the list and row of that ready Tombo instead of dir), care (1: light the Bag's
// COMPLIMENT-style row), text}. One tip per turn, each once;
// it shows in the message line with the same gold glow Rose Mode uses. A tutorial's setup() runs when the fight starts.
const LE_b2Start_story=b2Start;
b2Start=function(cfg) {
  B2.tut=cfg.tut&&typeof TUTORIALS!=='undefined'&&TUTORIALS[cfg.tut]?{key:cfg.tut,done:{},cur:null}:null;
  LE_b2Start_story(cfg);
  if(B2.tut&&TUTORIALS[B2.tut.key].setup) TUTORIALS[B2.tut.key].setup();
};
function b2TutTip() {
  const T0=B2.tut; if(!T0||!B2.active||battle.state!=='command'||!B2.actor||B2.actor.side!=='party') return null;
  if(T0.cur&&T0.cur.round===B2.round) return T0.cur.tip;
  if(T0.cur) { T0.done[T0.cur.tip.id]=1; T0.cur=null; }
  const u=B2.actor;
  const tip=TUTORIALS[T0.key].tips.find(t=>!T0.done[t.id]&&(t.who==='*'||[].concat(t.who).includes(u.id))&&(!t.when||t.when(u)));
  if(!tip) return null;
  T0.cur={tip,round:B2.round};
  return tip;
}
// Where a tip points: the button, and the row inside its list. A Tombo tip finds the list that holds the ready Tombo.
function b2TipAim(tip,u) {
  if(tip.tombo) {
    const r=b2TomboRows(u).find(x=>!x.why&&(tip.tombo===true||x.T.id===tip.tombo)); if(!r) return null;
    const tab=b2TomboCat(r.T);
    return {dir:B2_TAB_DIR[tab],i:Math.max(0,b2TabRows(u,tab).findIndex(x=>x.T&&x.T.id===r.T.id))};
  }
  if(!tip.dir) return null;
  const tab=B2_DIR_TAB[tip.dir];
  return {dir:tip.dir,i:tab&&tip.keys?Math.max(0,b2TabRows(u,tab).findIndex(s=>tip.keys.includes(s.key))):0};
}
const LE_b7AfterRender_story=b7AfterRender;
b7AfterRender=function() {
  LE_b7AfterRender_story();
  const tip=b2TutTip(); if(!tip) return;
  const box=$('b2-cmd'); if(!box) return;
  const glow=sel=>{ box.querySelectorAll('.rec').forEach(e=>e.classList.remove('rec')); const b=box.querySelector(sel); if(b) b.classList.add('rec'); };
  const aim=b2TipAim(tip,B2.actor);
  if(B2.ui==='cross') { b2Msg('★ '+tip.text); if(aim) glow('.b2-x[data-d="'+aim.dir+'"]'); }
  else if(B2.ui==='bag'&&tip.dir==='down'&&tip.care!=null) { const k=b2BagList(B2.actor).findIndex(r=>r.praise); if(k>=0) glow('.b2-btn[data-i="'+k+'"]'); }
  else if(B2.ui==='skills'&&aim&&aim.dir!=='down'&&B2_DIR_TAB[aim.dir]===B2.tab) glow('.b2-btn[data-i="'+aim.i+'"]');
};

// Debug handle for tests.
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{storyTriggers,storyTripSteps,TRIGGERS:typeof TRIGGERS!=='undefined'?TRIGGERS:null,TUTORIALS:typeof TUTORIALS!=='undefined'?TUTORIALS:null,STORY,CHAPTERS,SCENES:typeof SCENES!=='undefined'?SCENES:null,playScene,compileScene,setFlag,flag,setChapter,heartTrace,partyRules,canBeHere,canLeave,applyPartyRules,migrateSave,beginOpening}); });

// ---------- 6. Parts: one game in two halves ----------
// Part 1 is Act I (chapters 1 to 10). Part 2 is Acts II and III (chapters 11 to 20). Both are on the title screen.
// The last scene of chapter 10 ends with {partCard:1, done:true} and {partClear:true}: that saves Part 1 clear data
// (its own record, aot-save-clear-1 to 3, oldest replaced when all three are used; never shown in the save menu)
// plus the autosave. PART 2 unlocks once any clear data exists. Starting Part 2 loads the clear data (levels, XP,
// Stamp Points and stamps, gear, bag, coins, flags, Heart-Traces, Kindness scrapbook: everything a save keeps),
// moves to chapter 11, places Tom at CHAPTERS[11].start {map,x,y} if set, and plays SCENES.part2Open if it exists.
const PARTS=[null,{n:1,from:1,to:10,sub:'Chapters 1 to 10'},{n:2,from:11,to:20,sub:'Chapters 11 to 20'}];
const partOf=ch=>ch>=PARTS[2].from?2:1;
// Part 1 clear data: clear-1 to clear-3, plus clear-4 and up as needed (no limit, never replaced, slotless1).
const CLEAR_SLOTS=['clear-1','clear-2','clear-3'];
const clearSlotAdd=s=>{ if(/^clear-[1-9]\d{0,3}$/.test(s)&&!CLEAR_SLOTS.includes(s)) { CLEAR_SLOTS.push(s); CLEAR_SLOTS.sort((a,b)=>a.slice(6)-b.slice(6)); } };
const clearSlotFree=()=>{ const f=CLEAR_SLOTS.find(s=>!saveRaw(s)); if(f) return f; const s='clear-'+(Math.max(...CLEAR_SLOTS.map(c=>+c.slice(6)))+1); clearSlotAdd(s); return s; };
try { for(let i=0;i<localStorage.length;i++) { const k=localStorage.key(i)||''; if(k.indexOf(SAVE_PREFIX+'clear-')===0) clearSlotAdd(k.slice(SAVE_PREFIX.length)); } } catch(e) {}
const isPartClear=sv=>!!(sv&&sv.story&&sv.story.flags&&sv.story.flags['part1-clear']);
function partClearSlots() { return CLEAR_SLOTS.filter(s=>isPartClear(readSave(s))); }
function savePartClear() {
  setFlag('part1-clear');
  const slot=clearSlotFree();
  saveGame(slot,true); saveGame('auto',true);
  showToast('Part 1 clear data saved. Part 2 is open on the title screen.',4);
  return slot;
}
function partClearSummary(sv) {
  if(!sv) return 'Empty';
  const lead=(sv.party||[])[0]||{},d=new Date(sv.when),h=Math.floor((sv.time||0)/3600),m=Math.floor((sv.time||0)%3600/60);
  return 'Lv '+(lead.level||1)+' \u00b7 '+(sv.coins||0)+' coins \u00b7 '+h+'h '+String(m).padStart(2,'0')+'m \u00b7 '+d.toLocaleDateString();
}
function confirmPart2(slot) {
  if(!readSave('auto')) { beginPart2(slot); return; }
  titleAsk('Part 2','Part 2 starts from this clear data. It replaces the autosave once it begins. Your numbered slots and the clear data are kept.',[
    {label:'START PART 2',fn:()=>beginPart2(slot)},
    {label:'BACK',fn:titleMenu}
  ]);
}
function beginPart2(slot) {
  endIntro();
  if(!loadGame(slot)) { titleMenu(); return; }
  STORY.mode='full'; setFlag('part2-start'); setChapter(PARTS[2].from);
  const st=chapterInfo(PARTS[2].from).start;
  if(st&&worlds[st.map]) { currentMap=worlds[st.map]; player.x=st.x; player.y=st.y; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; }
  playScene(()=>[{partCard:2,time:3},{card:PARTS[2].from,time:3.2},...(SCENES.part2Open?SCENES.part2Open():[]),
    {toast:'Everything from Part 1 carried over: levels, Stamp Points, gear, items and coins.',time:3.5},{save:true}],{fade:.7,stage:true});
}
// Save lists say which Part and chapter a full-game save is in.
const LE_saveSummary_story=saveSummary;
saveSummary=function(sv) {
  const base=LE_saveSummary_story(sv);
  if(!sv||!sv.story||sv.story.mode!=='full'||!sv.story.chapter) return base;
  if(CHAPTERS[sv.story.chapter]&&CHAPTERS[sv.story.chapter].bonus) return 'Bonus \u00b7 '+CHAPTERS[sv.story.chapter].title+' \u00b7 '+base;
  return 'Part '+partOf(sv.story.chapter)+' \u00b7 Ch '+sv.story.chapter+' \u00b7 '+base;
};


// ---------- Quest tracker (top left HUD) ----------
// The HUD frame is a permanent quest tracker: chapter title, the next step, and progress pips for multi-part steps.
// Tap it to open the quest log: the current step with a checklist of its parts, then every finished step with a check mark.
// The current goal is the latest "Goal: ..." toast a scene showed, kept in STORY.flags.goal (so it saves with the game).
// Each goal it replaces moves into STORY.flags.goalLog ({c:chapter,t:text}), which is the "Completed" list.
const QUEST_SUBS=[
  {re:/^clear the three sets/,items:[['Western street','ch4-west'],['New York','ch4-ny'],['Main Street','ch4-main']]},
  {re:/^clear the Art room/,items:[['Art room','ch5-art'],['Music room','ch5-music'],['Gym','ch5-gym']]},
  {re:/^clear the playground/,items:[['Playground','ch6-play'],['Garden','ch6-garden'],['Picnic tables','ch6-picnic']]},
  {re:/^Fiction \(top left\)/,items:[['Fiction','ch7-fic'],['Nonfiction','ch7-non'],['Picture Books','ch7-pic']]},
  {re:/^the Paint Shop/,items:[['Paint Shop','ch8-paint'],['Machine Shop','ch8-shop'],['Lunchroom','ch8-lunch']]},
  {re:/^find the three mirrors/,items:[['Coat Check','ch9-coat'],['Card Room','ch9-cards'],['Ballroom','ch9-ball']]},
  {re:/^find the gate clock/,items:[['Security','ch10-sec'],['Baggage Claim','ch10-bag'],['The Lounge','ch10-lounge']]}
];
function questSubs(text) {
  for(const q of QUEST_SUBS) if(q.re.test(text||'')) return q.items.map(([label,f])=>({label,done:flag(f)===true}));
  return null;
}
// Every step shown to the player reads as an instruction. Scenes write goals as a bare place ("the Reading Room."), a direction
// ("up the stairs...") or a verb phrase; the tracker turns the first two into "Go to ..." / "Go up ..." so a step is never mistaken for a label.
// A goal already starting with a verb, or a plain statement ("Chapter 15 is coming."), is left alone. Saved games keep their old text and get the same treatment.
const QUEST_VERBS=/^(follow|find|take|clear|get|pull|walk|talk|ask|head|go|stand|check|visit|feed|face|press|wheel|turn|pick|bring|ring|search|meet|look|explore|knock|warm|chapter|part|the story is|put|use|open|help|wait|keep|flip|set|give|show|fix|bake|finish|start|try|play|enter|leave|return|climb|run|sit|say|pet|dig|let)\b/i;
const QUEST_DIRS={up:'Go up',out:'Go out',home:'Head home',back:'Head back',across:'Go across',through:'Go through',into:'Go into',inside:'Go inside',down:'Go down',over:'Go over',along:'Go along',past:'Go past'};
function questPhrase(text) {
  const t=String(text||'').trim(); if(!t) return t;
  const w=(/^[A-Za-z]+/.exec(t)||[''])[0].toLowerCase();
  if(QUEST_VERBS.test(t)) return t;
  if(QUEST_DIRS[w]) return QUEST_DIRS[w]+t.slice(w.length);
  const first=(/^(.*?[.!?])(\s|$)/.exec(t)||[0,t])[1];
  if(/\b(is|are|was|were|lead|leads|waiting)\b/.test(first)) return t;   // a plain statement
  if(/^Pip,/.test(t)) return 'Find '+t;
  if(/^(Miss Odette|Do\u00f1a Carmen next)/.test(t)) return 'Visit '+t;
  if(/^Fiction \(top left\)/.test(t)) return 'Search '+t;
  return 'Go to '+t.replace(/^(The|A) /,(m,x)=>x.toLowerCase()+' ');
}
function questShort(text) {
  const t=questPhrase(text),m=/^(.*?[.!?])(\s|$)/.exec(t||''),s=(m?m[1]:t||'').trim();
  return s?s.charAt(0).toUpperCase()+s.slice(1):s;
}
function currentObjective() {
  if(STORY.mode!=='full') {
    const dc=typeof doorCount==='function'&&currentMap?doorCount(regionOf(currentMap)):null;
    return {head:'Free play',eyebrow:'FREE PLAY',text:'Explore Long Island and Los Angeles, meet everyone, and take on the monsters.'+(dc?' Doors visited here: '+dc.seen+' of '+dc.total+'.':''),subs:null,done:[],complete:false};
  }
  const c=chapterInfo(),head='Chapter '+c.n+': '+c.title,eyebrow='CH '+c.n+' · '+String(c.title||'').toUpperCase();
  const log=(Array.isArray(flag('goalLog'))?flag('goalLog'):[]).filter(e=>e&&e.c===c.n).map(e=>e.t);
  const goal=flag('goal');
  if(flag('ch'+c.n+'-done')===true) {
    let text=(goal&&flag('goalCh')===c.n)?'Chapter complete. '+questPhrase(goal):'Chapter complete. Explore as much as you like, then follow the story into chapter '+(c.n+1)+'.';
    if(c.n>=20) text='Chapter complete. Explore as much as you like.';
    if(c.n===1&&!flag('ch2-sal')) text='Chapter complete. Talk to Sal at the taxi stand to keep going.';
    else if(c.n===2) text='Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home and keep going.';
    else if(c.n===3) text='Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) to fly to Los Angeles for chapter 4.';
    else if(c.n===4) text='Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home for chapter 5.';
    else if(c.n===7) text='Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) to fly to Los Angeles for chapter 8.';
    else if(c.n===8) text='Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home for chapter 9.';
    else if(c.n===9) text='Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) for chapter 10.';
    else if(c.n===10) text='Part 1 complete! Go to Deedee and Boppy\u2019s house (RIVITUSO) the next morning to start chapter 11.';
    const done=log.slice(); if(goal&&flag('goalCh')===c.n&&done[done.length-1]!==goal) done.push(goal);
    return {head,eyebrow,text,subs:null,done,complete:true};
  }
  // No goal yet (chapter just started): say what to do HERE instead of a generic line, so it never reads as a label for the area.
  const here=(currentMap&&currentMap.name)||'around';
  const text=goal?questPhrase(goal):'Explore '+here+' and talk to people. Your next step shows up here.';
  return {head,eyebrow,text,fallback:!goal,subs:goal?questSubs(goal):null,done:log,complete:false};
}
let objectiveOpen=false,objectiveTimer=0,qtFlash=0;
function qEl(tag,cls,txt) { const e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; }
function refreshObjective() {
  const box=document.getElementById('objective'); if(!box) return;
  const o=currentObjective();
  // collapsed tracker
  const eb=document.getElementById('qt-eyebrow'),tx=document.getElementById('qt-text'),pp=document.getElementById('qt-pips'),brand=document.querySelector('#hud .brand');
  if(eb) eb.textContent=o.eyebrow;
  if(tx&&!qtFlash) tx.textContent=o.complete?'Chapter complete':questShort(o.text);
  if(pp) {
    pp.textContent='';
    if(o.subs&&!qtFlash) { const n=o.subs.filter(s=>s.done).length; for(const s of o.subs) pp.appendChild(qEl('i',s.done?'on':'')); pp.appendChild(qEl('b','',n+'/'+o.subs.length)); }
  }
  if(brand) brand.classList.toggle('qt-complete',!!o.complete);
  // quest log (open view)
  box.textContent='';
  box.appendChild(qEl('div','obj-head',o.head));
  const now=qEl('div','q-now'); now.appendChild(qEl('span','q-mark',o.complete?'✓':'▶')); now.appendChild(qEl('span','',o.text.charAt(0).toUpperCase()+o.text.slice(1))); box.appendChild(now);
  if(o.subs) { const ul=qEl('ul','q-subs'); for(const s of o.subs) { const li=qEl('li',s.done?'done':''); li.appendChild(qEl('span','q-box',s.done?'✓':'')); li.appendChild(qEl('span','',s.label)); ul.appendChild(li); } box.appendChild(ul); }
  if(o.done.length) {
    box.appendChild(qEl('div','q-sep','Completed · '+o.done.length));
    const ul=qEl('ul','q-done'); for(const t of o.done.slice(-8).reverse()) { const li=qEl('li'); li.appendChild(qEl('span','q-box','✓')); li.appendChild(qEl('span','',questShort(t))); ul.appendChild(li); } box.appendChild(ul);
  }
}
function toggleObjective(open=!objectiveOpen) {
  objectiveOpen=open; clearTimeout(objectiveTimer);
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  if(open) { refreshObjective(); setObjectivePulse(false); }   // opening it counts as seeing the new objective
  brand.classList.toggle('open',open); brand.setAttribute('aria-expanded',open);
  document.getElementById('objective').hidden=!open;
  if(open) { if(typeof sfx!=='undefined'&&sfx.select) sfx.select(); objectiveTimer=setTimeout(()=>toggleObjective(false),15000); }
}
(function wireObjective() {
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  brand.setAttribute('role','button'); brand.setAttribute('tabindex','0'); brand.setAttribute('aria-expanded','false');
  brand.setAttribute('aria-label','Quest tracker. Tap for the quest log');
  // Same touch handling as the menu button (engine/draw.js): act on the finger lifting, then ignore the click the browser sends after it,
  // so one tap is one toggle on a phone (open, then a second tap closes).
  let qtTouchAt=-1e9;
  brand.addEventListener('touchend',e=>{ e.preventDefault(); e.stopPropagation(); qtTouchAt=performance.now(); toggleObjective(); },{passive:false});
  brand.addEventListener('click',e=>{ e.stopPropagation(); if(performance.now()-qtTouchAt>500) toggleObjective(); });
})();

// ---------- Quest updates ----------
// When the step changes, the tracker shows the finished step with a check for a moment, then swaps to the new step and
// pulses until the player taps it. When a part of a step is finished (a pip fills), the pips pop. It never pauses the
// game or opens anything by itself. The first look after a new game or a loaded save only records the state (STORY.flags is
// replaced by both, so a new object means a fresh baseline). The fallback text and Free play never pulse.
let objectiveSig=null,objectiveFlagsRef=null,objectiveSubN=-1,objectiveShort='';
function setObjectivePulse(on) {
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  brand.classList.toggle('obj-new',!!on);
  brand.setAttribute('aria-label',on?'Quest tracker. New step. Tap to see it':'Quest tracker. Tap for the quest log');
}
function questFlash(prevShort) {
  const brand=document.querySelector('#hud .brand'),tx=document.getElementById('qt-text'); if(!brand||!tx) return;
  qtFlash=1; brand.classList.add('qt-done'); tx.textContent='✓ '+prevShort;
  if(typeof sfx!=='undefined'&&sfx.levelChime) try { sfx.levelChime(); } catch(e) {}
  setTimeout(()=>{ qtFlash=0; brand.classList.remove('qt-done'); refreshObjective(); },1500);
}
function watchObjective() {
  const tx=document.getElementById('qt-text'); if(!tx) return;
  const o=currentObjective(),sub=o.subs?o.subs.filter(s=>s.done).length:-1,sig=o.head+'|'+(o.fallback?'':o.text)+'|'+o.done.length;
  if(STORY.mode!=='full') { if(objectiveSig!=='free') { objectiveSig='free'; refreshObjective(); } if(document.querySelector('#hud .brand.obj-new')) setObjectivePulse(false); return; }
  if(objectiveFlagsRef!==STORY.flags) { objectiveFlagsRef=STORY.flags; objectiveSig=sig; objectiveSubN=sub; objectiveShort=questShort(o.text); setObjectivePulse(false); refreshObjective(); return; }
  if(sig!==objectiveSig) {
    const prev=objectiveShort; objectiveSig=sig; objectiveSubN=sub; objectiveShort=questShort(o.text);
    refreshObjective();
    if(!objectiveOpen&&!o.fallback&&prev&&prev!==objectiveShort) { questFlash(prev); setObjectivePulse(true); }
    else if(!objectiveOpen&&!o.fallback) setObjectivePulse(true);
    return;
  }
  if(sub!==objectiveSubN) {
    const grew=sub>objectiveSubN&&objectiveSubN>=0; objectiveSubN=sub; refreshObjective();
    if(grew) { const brand=document.querySelector('#hud .brand'); brand.classList.add('qt-pop'); setTimeout(()=>brand.classList.remove('qt-pop'),600); if(typeof sfx!=='undefined'&&sfx.select) try { sfx.select(); } catch(e) {} }
  }
}
setInterval(watchObjective,250);
