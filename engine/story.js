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
const TOWN_HOMES={grace:'le',rose:'le',amy:'le',deedee:'le',boppy:'le',tnb:'la',nara:'la'};
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
  {n:5,title:'Parent-Teacher Conference of Doom',party:{allow:['amy'],
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
  {n:10,title:'Boarding Group Zero',party:{allow:['amy'],
    decline:{deedee:'Not this time, honey. Somebody has to start Sunday dinner. Every clock in my kitchen says midnight and the roast doesn\'t care.',
             boppy:'An airport? At midnight? I\'m still recovering from the tie.'}},
    noFlight:()=>flag('ch10-done')?null
      :{lines:['Airport? Every clock in town says midnight. The planes aren\'t going anywhere.','Terminal Zero, though. Terminal Zero is open.']}},
  {n:11,title:'The Layover Between Worlds',start:{map:'grands',x:8,y:10},
    party:{lock:['tom','grace','rose'],allow:['amy','tnb','nara'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>({lines:['Airport? Tom. You’re on a layover. I don’t fly layovers. I just wave at them.']})},
  {n:12,title:'Welcome to Jefferson Park, Girls',start:{map:'jpark',x:4,y:19},
    party:{lock:['tom','grace','rose'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch12-done')?{lines:['Sal called from the East Coast. He is working on a way under the dome.','Chapter 13 is coming. Until then, the cab stand has coffee.']}
      :{lines:['Airport? Tom. You just got home. Show the girls the house first.']}},
  {n:13,title:'The Subway Beneath the Sea of Clouds',
    party:{lock:['tom','amy','tnb','nara'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch13-done')?{lines:['Chapter 14 is coming. Boppy is at the gate, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. The way in is under the world. Take the Metro stairs on the boulevard.']}},
  {n:14,title:'The Rikers Wall of Rivituso Row',start:{map:'row',x:18,y:9},
    party:{lock:['tom','amy','grace','rose'],allow:['amy'],bar:['tnb','nara','deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch14-done')?{lines:['Chapter 15 is coming. The dinner table is set for eight, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Your father is standing in the gate in a bucket. Go and see him first.']}},
  {n:15,title:'The Eight-Seat Dinner Table',start:{map:'grands',x:8,y:10},
    party:{lock:['tom','grace','rose'],allow:['amy','deedee','boppy','tnb','nara'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch15-done')?{lines:['Chapter 16 is coming. Vance wants a family photograph in the Square, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Dinner is at six. Five means four thirty.']}},
  // Chapter 16 (tragedy): the photograph in the Square. The scene itself runs on a party override (Tom, Grace, Rose, Amy out front, TNB and Nara on
  // the bench); once Deedee and Boppy are stone and the girls run for Cab 7, these are the rules: Tom, Amy, TNB and Nara fight, nobody else.
  {n:16,title:'The Amber Eclipse',start:{map:'town',x:11,y:13},
    party:{lock:['tom','amy','tnb','nara'],allow:['amy','tnb','nara'],bar:['deedee','boppy','grace','rose'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch16-done')?{lines:['Chapter 17 is coming. Long Island is under glass, and the cab stand has coffee nobody is drinking.']}
      :{lines:['Airport? Tom. Not today. Not this.']}},
  // Chapter 17: two strike teams of three (see data/scenes-ch17.js). Grace and Rose are never benched (a bench save would break loading), so they
  // are the stairs team; Amy, TNB and Nara are the shelves team. The service hatch on landing 30 swaps who is out front.
  {n:17,title:'Ascent of the Glass Tower',start:{map:'lacab',x:7,y:6},
    party:{lock:['tom','grace','rose'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch17-done')?{lines:['Chapter 18 is coming. The pinnacle lift is waiting, and the cab stand has coffee.']}
      :{lines:['Airport? Tom. Not now. The tower is right there. Go up.']}},
  // Chapter 18: the top of the Glass Tower. The same six as chapter 17's finish: Tom, Grace, Rose, Amy out front, TNB and Nara on the bench.
  // At the end Tom is gone (flag 'tom-gone', engine/tom-gone.js): he leaves `party`, TNB leads, and these rules keep working for the rest.
  {n:18,title:'No Touching, Please.',start:{map:'towervault',x:10,y:3},
    party:{lock:['tom','grace','rose'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch18-done')?{lines:['Chapter 19 is coming. Nobody is going to the airport. Nobody is going anywhere without Tom.']}
      :{lines:['Airport? Tom. Not now. Floor sixty.']}},
  // Chapter 19: Tom is gone (flag 'tom-gone') until he bursts back into the Censor fight (data/scenes-ch19.js). Grace, Rose, Amy and TNB fight, Nara is on the bench.
  // Deedee and Boppy are stone until the feast thaws them; the chapter ends with the eight of them in the Vault.
  {n:19,title:'The Unsent Dead-Letter Office',start:{map:'jpark',x:4,y:19},
    party:{lock:['tom','grace','rose'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch19-done')?{lines:['Chapter 20 is coming. The sky has a clock in it now, and the cab stand has coffee.']}
      :{lines:['Airport? Not today. Today you find Tom.']}},
  // Chapter 20 (the finale): all eight climb. Tom, Grace and Rose are always out front, the fourth slot swaps at the Core bench, the rest wait on the bench.
  // The Deedee/Boppy bar is lifted. Julian's fights call BENCH CALL for the signature specials (data/ch20-battle.js).
  {n:20,title:'The Forever Engine & The Open Sky',start:{map:'towervault',x:10,y:3},
    party:{lock:['tom','grace','rose'],allow:['amy','deedee','boppy','tnb','nara'],homes:{amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'}},
    noFlight:()=>flag('ch20-done')?{lines:['The train runs both coasts now. Sal is thrilled and very confused about his job.']}
      :{lines:['Airport? Tom. Not now. There is a man in a clock who needs dinner.']}}
];
const MEMBERS=()=>({tom:hero,grace,rose,amy,deedee,boppy,tnb,nara});
function chapterInfo(n=STORY.chapter) { return CHAPTERS[n]||CHAPTERS[0]; }
function partyRules() {
  const c=chapterInfo(),o=STORY.override||{};
  const r=Object.assign({},DEFAULT_RULES,c.party||{},o);
  r.homes=Object.assign({},DEFAULT_RULES.homes,(c.party&&c.party.homes)||{},o.homes||{});
  r.decline=Object.assign({},(c.party&&c.party.decline)||{},o.decline||{});
  return r;
}
function memberHome(id) { return partyRules().homes[id]||'any'; }
// Can this member be in the party right here, right now?
function canBeHere(m) {
  const r=partyRules();
  if(r.bar.includes(m.id)) return false;
  if(r.allow&&!r.allow.includes(m.id)&&m!==hero&&m!==grace&&m!==rose&&!r.force.includes(m.id)) return false;
  const h=memberHome(m.id);
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
  walk:o=>lazy(()=>{ const a=sceneActor(o.walk); storyHold(a); return S.walk(a,scenePos(o.to),o.speed||.3,o.onStep); }),
  face:o=>S.call(()=>{ const a=sceneActor(o.face); if(a) a.facing=o.dir; }),
  place:o=>S.call(()=>{ const a=sceneActor(o.place),[x,y]=scenePos(o.at); if(!a) return; storyHold(a); a.x=x; a.y=y; a.move=null; a.scr=null; if(o.dir) a.facing=o.dir; }),
  hop:o=>lazy(()=>{ const l=o.lift||[0,0]; return S.hop(sceneActor(o.hop),scenePos(o.from),scenePos(o.to),o.time||.5,o.arc||16,l[0],l[1]); }),
  // Battle poses in a cutscene (Tom, Grace, Rose). {pose:'rose',f:'kneel',dir:'left'} holds a battle frame (hurtPose, kneel, ko, ...) until {pose:'rose',f:null}.
  cam:o=>S.call(()=>{ sceneCam=o.cam||null; }),
  pose:o=>S.call(()=>{ const a=sceneActor(o.pose); if(!a) return; if(o.f) a.scenePose={f:o.f,dir:o.dir||'left',fps:o.fps}; else { a.scenePose=null; a.lift=0; } }),
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
  fade:o=>({t:0,start(){ this.t=0; intro.fadeLock=true; this.a=o.fade==='out'?intro.fade:Math.max(intro.fade,1); },
    update(dt){ this.t+=dt; const u=Math.min(1,this.t/(o.time||.6)); intro.fade=o.fade==='out'?this.a+(1-this.a)*u:this.a*(1-u);
      if(u>=1&&o.fade==='in') intro.fadeLock=false; return u>=1; }}),
  flag:o=>S.call(()=>setFlag(o.flag,o.value===undefined?true:o.value)),
  chapter:o=>S.call(()=>setChapter(o.chapter)),
  partCard:o=>({t:0,start(){ this.t=0; intro.card={part:o.partCard,title:o.title,t:0,done:!!o.done}; sfx.levelChime&&sfx.levelChime(); },
    update(dt){ this.t+=dt; intro.card.t=this.t; if(this.t>=(o.time||3)) { intro.card=null; return true; } return false; }}),
  partClear:o=>S.call(()=>savePartClear()),
  card:o=>({t:0,start(){ this.t=0; intro.card={n:o.card,t:0,done:!!o.done}; sfx.levelChime&&sfx.levelChime(); },
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
  toast:o=>S.call(()=>{ if(/^Goal: /.test(o.toast)) { setFlag('goal',o.toast.slice(6)); refreshObjective(); return; } return; /* scene toasts are silent: objectives pulse the label, nothing pops up */ }),
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
// A battle pose borrowed for a cutscene: a.scenePose={f:'hurtPose'|'kneel'|'ko'|...,dir:'left'|'right'} (set by the pose, knock and getup steps above).
// Called by drawSheetActor (engine/town-render.js) with the overworld set and its scale k. Returns {rows,k,pal}, or null to draw the normal overworld frame.
// Battle frames are about twice the overworld figure's height in rows, so they are drawn at k * (overworld rows / battle idle rows) to match Tom's size.
// Battle frames face left; the KO frame faces right. A frame facing the wrong way is mirrored (cached on the rows).
const SCENE_POSE_RATIO={};
function scenePoseDraw(a,set,k) {
  const m=a.isPlayer?(typeof playerMember==='function'?playerMember():hero):a.member,P=a.scenePose; if(!m||!P) return null;
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
  if(typeof script==='string') script=SCENES[script];
  const list=typeof script==='function'?script(opts.ctx||{}):script;
  intro.active=true; intro.phase='scene'; intro.cur=null; intro.fadeLock=false;
  intro.fade=opts.fade||0;
  intro.steps=compileScene(list);
  if(!opts.keep) intro.steps.push(S.call(()=>{ if(intro.active) endIntro(); }));   // scenes end themselves unless told not to
  if(typeof clearInput==='function') clearInput();
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
      sfx.bump(); openDialog(g.name,npcLines(g)); return;
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
  currentMap.npcs.push(a); storyHold(a);
  return a;
}
function storyDespawn(name) { for(const m of Object.values(worlds)) m.npcs=m.npcs.filter(n=>!(n.scripted&&n.name===name)); }
const LE_endIntro_story=endIntro;
endIntro=function() {
  sceneCam=null;
  // Map monsters a scene walked out go back to their spots (so they never block a path afterwards).
  for(const n of intro.held||[]) { n.held=false; n.path=[]; n.move=null; n.idle=1+Math.random(); if(n.monster&&!n.scripted&&n.heldFrom&&!n.sunk) { n.x=n.heldFrom.x; n.y=n.heldFrom.y; } }
  intro.held=[];
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
// chapter 1 starts chapter 2: the chapter card plays before takeoff.
function storyTripSteps(dir) {
  if(STORY.mode!=='full') return [];
  if(STORY.chapter===1&&flag('ch1-done')&&dir==='west') return compileScene([{chapter:2},{card:2,time:3.2}]);
  if(STORY.chapter===2&&flag('ch2-done')&&dir==='east') return compileScene([{chapter:3},{card:3,time:3.2}]);
  if(STORY.chapter===3&&flag('ch3-done')&&dir==='west') return compileScene([{chapter:4},{card:4,time:3.2}]);
  if(STORY.chapter===4&&flag('ch4-done')&&dir==='east') return compileScene([{chapter:5},{card:5,time:3.2}]);
  if(STORY.chapter===5&&flag('ch5-done')&&dir==='west') return compileScene([{chapter:6},{card:6,time:3.2}]);
  if(STORY.chapter===6&&flag('ch6-done')&&dir==='east') return compileScene([{chapter:7},{card:7,time:3.2}]);
  if(STORY.chapter===7&&flag('ch7-done')&&dir==='west') return compileScene([{chapter:8},{card:8,time:3.2}]);
  if(STORY.chapter===8&&flag('ch8-done')&&dir==='east') return compileScene([{chapter:9},{card:9,time:3.2}]);
  return [];
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
// 'right','down','left': the command it points at; ▲ Skills, ▶ signature, ◀ Tombo, ▼ Bag), care (1: light the Bag's
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
const LE_b7AfterRender_story=b7AfterRender;
b7AfterRender=function() {
  LE_b7AfterRender_story();
  const tip=b2TutTip(); if(!tip) return;
  const box=$('b2-cmd'); if(!box) return;
  const glow=sel=>{ box.querySelectorAll('.rec').forEach(e=>e.classList.remove('rec')); const b=box.querySelector(sel); if(b) b.classList.add('rec'); };
  if(B2.ui==='cross') { b2Msg('★ '+tip.text); if(tip.dir) glow('.b2-x[data-d="'+tip.dir+'"]'); }
  else if(B2.ui==='bag'&&tip.dir==='down'&&tip.care!=null) { const k=b2BagList(B2.actor).findIndex(r=>r.praise); if(k>=0) glow('.b2-btn[data-i="'+k+'"]'); }
  else if(B2.ui==='tombo'&&tip.dir==='left') glow('.b2-btn[data-i="0"]');
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
const CLEAR_SLOTS=['clear-1','clear-2','clear-3'];
const isPartClear=sv=>!!(sv&&sv.story&&sv.story.flags&&sv.story.flags['part1-clear']);
function partClearSlots() { return CLEAR_SLOTS.filter(s=>isPartClear(readSave(s))); }
function savePartClear() {
  setFlag('part1-clear');
  const used=CLEAR_SLOTS.filter(s=>readSave(s));
  const slot=CLEAR_SLOTS.find(s=>!readSave(s))||used.sort((a,b)=>(readSave(a).when||0)-(readSave(b).when||0))[0];
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
  titleAsk('Part 2','Part 2 starts from this clear data. It replaces the autosave once it begins. Slots 1 to 3 and the clear data are kept.',[
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
    {toast:'Everything from Part 1 carried over: levels, Stamp Points, gear, items and coins.',time:3.5},{save:true}],{fade:.7});
}
// Save lists say which Part and chapter a full-game save is in.
const LE_saveSummary_story=saveSummary;
saveSummary=function(sv) {
  const base=LE_saveSummary_story(sv);
  if(!sv||!sv.story||sv.story.mode!=='full'||!sv.story.chapter) return base;
  if(CHAPTERS[sv.story.chapter]&&CHAPTERS[sv.story.chapter].bonus) return 'Bonus \u00b7 '+CHAPTERS[sv.story.chapter].title+' \u00b7 '+base;
  return 'Part '+partOf(sv.story.chapter)+' \u00b7 Ch '+sv.story.chapter+' \u00b7 '+base;
};


// ---------- Objective: tap the location label on the HUD to see what to do next ----------
// The current goal is the latest "Goal: ..." toast a scene showed, kept in STORY.flags.goal (so it saves with the game).
function currentObjective() {
  if(STORY.mode!=='full') {
    const dc=typeof doorCount==='function'&&currentMap?doorCount(regionOf(currentMap)):null;
    return {head:'Demo',text:'Free play. Explore Long Island and Los Angeles, meet everyone, and take on the monsters.'+(dc?' Doors visited here: '+dc.seen+' of '+dc.total+'.':'')};
  }
  const c=chapterInfo(),head='Chapter '+c.n+': '+c.title;
  if(flag('ch'+c.n+'-done')===true) {
    if(c.n===1&&!flag('ch2-sal')) return {head,text:'Chapter complete. Talk to Sal at the taxi stand to keep going.'};
    if(c.n===2) return {head,text:'Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home and keep going.'};
    if(c.n===3) return {head,text:'Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) to fly to Los Angeles for chapter 4.'};
    if(c.n===4) return {head,text:'Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home for chapter 5.'};
    if(c.n===7) return {head,text:'Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) to fly to Los Angeles for chapter 8.'};
    if(c.n===8) return {head,text:'Chapter complete. Talk to Sol at Angel City Cab Co. (downtown) to fly home for chapter 9.'};
    if(c.n===9) return {head,text:'Chapter complete. Talk to Sal at Long Island Taxi Co. (the Square) for chapter 10.'};
    if(c.n===10) return {head,text:'Part 1 complete! PART 2 is open on the title screen. Its chapters are still being built. Explore as much as you like.'};
    return {head,text:'Chapter complete. The next chapter is still being built. Explore as much as you like.'};
  }
  return {head,text:flag('goal')||'Look around. The story will find you.'};
}
let objectiveOpen=false,objectiveTimer=0;
function refreshObjective() {
  const box=document.getElementById('objective'); if(!box) return;
  const o=currentObjective();
  box.querySelector('.obj-head').textContent=o.head;
  box.querySelector('.obj-text').textContent=o.text;
}
function toggleObjective(open=!objectiveOpen) {
  objectiveOpen=open; clearTimeout(objectiveTimer);
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  if(open) { refreshObjective(); setObjectivePulse(false); }   // opening it counts as seeing the new objective
  brand.classList.toggle('open',open); brand.setAttribute('aria-expanded',open);
  document.getElementById('objective').hidden=!open;
  if(open) { if(typeof sfx!=='undefined'&&sfx.select) sfx.select(); objectiveTimer=setTimeout(()=>toggleObjective(false),12000); }
}
(function wireObjective() {
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  brand.setAttribute('role','button'); brand.setAttribute('tabindex','0'); brand.setAttribute('aria-expanded','false');
  brand.setAttribute('aria-label','Location. Tap to see your next objective');
  brand.addEventListener('click',e=>{ e.stopPropagation(); toggleObjective(); });
})();

// ---------- New-objective pulse ----------
// When the objective changes to something new (a "Goal:" step in a scene, or a chapter-complete message), the location
// label frame pulses until the player taps it. It never pauses the game or opens anything by itself.
// The first look after a new game or a loaded save only records the objective (STORY.flags is replaced by both, so a
// new object means a fresh baseline). The fallback text and Demo mode never pulse.
const OBJ_DEFAULT_TEXT='Look around. The story will find you.';
let objectiveSig=null,objectiveFlagsRef=null;
function setObjectivePulse(on) {
  const brand=document.querySelector('#hud .brand'); if(!brand) return;
  brand.classList.toggle('obj-new',!!on);
  brand.setAttribute('aria-label',on?'Location. New objective. Tap to see it':'Location. Tap to see your next objective');
}
function watchObjective() {
  if(STORY.mode!=='full') { objectiveSig=null; if(document.querySelector('#hud .brand.obj-new')) setObjectivePulse(false); return; }
  const o=currentObjective(),sig=o.head+'|'+o.text;
  if(objectiveFlagsRef!==STORY.flags) { objectiveFlagsRef=STORY.flags; objectiveSig=sig; setObjectivePulse(false); return; }
  if(sig===objectiveSig) return;
  objectiveSig=sig;
  if(!objectiveOpen&&o.text!==OBJ_DEFAULT_TEXT) setObjectivePulse(true);
}
setInterval(watchObjective,250);
