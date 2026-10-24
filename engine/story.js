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
// 4. Save v3: saves carry {story}. Older saves (v1, v2) are migrated when read.
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
// Chapter 0 is the demo (Little Elsewhere and Los Angeles, free play). Chapters 1 to 20 follow the story bible;
// each chapter session (C1 to C20) fills in its rules and scenes.
const CHAPTERS=[
  {n:0,title:'Demo',party:{}},
  {n:1,title:'The Soup Dumpling Protocol',party:{allow:['deedee'],
    decline:{amy:'Thirty spelling tests and a 5K in the morning. Take your mother. She has more energy than all of us.',
             boppy:'Not today. My stomach is doing something. Take Deedee. She already has her shoes on.'}}},
  {n:2,title:'Smog on 2nd Avenue',party:{lock:['tom'],allow:['tnb','nara']}},
  {n:3,title:'Paces & Peppers',party:{allow:['boppy']}},
  {n:4,title:'Backlot Bedlam',party:{lock:['tom'],allow:['tnb','nara']}},
  {n:5,title:'Parent-Teacher Conference of Doom',party:{allow:['amy']}},
  {n:6,title:'The Great Squirrel Conspiracy',party:{lock:['tom'],allow:['tnb','nara']}},
  {n:7,title:'The Whispering Stacks'},
  {n:8,title:'Feast on Jefferson Park',party:{lock:['tom'],allow:['tnb','nara']}},
  {n:9,title:'The Moon Club Invitation'},
  {n:10,title:'Boarding Group Zero'},
  {n:11,title:'The Layover Between Worlds'},
  {n:12,title:'Welcome to Jefferson Park, Girls'},
  {n:13,title:'The Subway Beneath the Sea of Clouds'},
  {n:14,title:'The Rikers Wall of Rivituso Row'},
  {n:15,title:'The Eight-Seat Dinner Table'},
  {n:16,title:'The Amber Eclipse'},
  {n:17,title:'Ascent of the Glass Tower'},
  {n:18,title:'No Touching, Please.'},
  {n:19,title:'The Unsent Dead-Letter Office'},
  {n:20,title:'The Forever Engine & The Open Sky'}
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
  STORY.chapter=n; STORY.override=null;
  if(apply) applyPartyRules();
}

// Recruiting asks the rules first. Members the chapter keeps out decline; only unlocked members are offered as swaps.
offerRecruit=function(m,npc) {
  const t=RECRUIT_TALK[m.id];
  if(!canBeHere(m)) { openDialog(npc.name,[declineLine(m)],npc); return; }
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
//   {battle:'monsterId'}  waits for the fight to end; sets flag 'battle:<id>' to 'win' or 'lose'
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
const lazy=fn=>({start(){ this.s=fn(); this.s.start(); },update(dt){ return this.s.update(dt); }});
const SCENE_OPS={
  wait:o=>S.wait(o.wait),
  call:o=>S.call(o.call),
  step:o=>o.step,
  talk:o=>S.talk(o.talk,Array.isArray(o.lines)?o.lines:[o.lines],o.voice),
  walk:o=>lazy(()=>S.walk(sceneActor(o.walk),scenePos(o.to),o.speed||.3,o.onStep)),
  face:o=>S.call(()=>{ const a=sceneActor(o.face); if(a) a.facing=o.dir; }),
  place:o=>S.call(()=>{ const a=sceneActor(o.place),[x,y]=scenePos(o.at); if(!a) return; a.x=x; a.y=y; a.move=null; a.scr=null; if(o.dir) a.facing=o.dir; }),
  hop:o=>lazy(()=>{ const l=o.lift||[0,0]; return S.hop(sceneActor(o.hop),scenePos(o.from),scenePos(o.to),o.time||.5,o.arc||16,l[0],l[1]); }),
  show:o=>S.call(()=>{ const a=sceneActor(o.show); if(a) a.hidden=false; }),
  hide:o=>S.call(()=>{ const a=sceneActor(o.hide); if(a) a.hidden=true; }),
  fade:o=>({t:0,start(){ this.t=0; intro.fadeLock=true; this.a=o.fade==='out'?intro.fade:Math.max(intro.fade,1); },
    update(dt){ this.t+=dt; const u=Math.min(1,this.t/(o.time||.6)); intro.fade=o.fade==='out'?this.a+(1-this.a)*u:this.a*(1-u);
      if(u>=1&&o.fade==='in') intro.fadeLock=false; return u>=1; }}),
  flag:o=>S.call(()=>setFlag(o.flag,o.value===undefined?true:o.value)),
  chapter:o=>S.call(()=>setChapter(o.chapter)),
  card:o=>({t:0,start(){ this.t=0; intro.card={n:o.card,t:0}; sfx.levelChime&&sfx.levelChime(); },
    update(dt){ this.t+=dt; intro.card.t=this.t; if(this.t>=(o.time||3)) { intro.card=null; return true; } return false; }}),
  battle:o=>({start(){ this.m=typeof o.battle==='object'?o.battle:findMonster(o.battle); this.go=false; if(this.m) { startBattle(this.m); this.go=true; } },
    update(){ if(!this.go) return true; if(battle.active) return false;
      setFlag('battle:'+(this.m.monster||o.battle),battle.enemy&&battle.enemy.hp<=0?'win':'lose'); return true; }}),
  give:o=>S.call(()=>grantItem(o.give)),
  join:o=>S.call(()=>{ const m=MEMBERS()[o.join]; if(m) forceJoin(m,!!o.quiet); }),
  leave:o=>S.call(()=>{ const m=MEMBERS()[o.leave]; if(m) forceLeave(m,o.quiet!==false); }),
  party:o=>S.call(()=>{ STORY.override=o.party; applyPartyRules(); }),
  trace:o=>S.call(()=>heartTrace(o.trace)),
  toast:o=>S.call(()=>showToast(o.toast,o.time||3)),
  sfx:o=>S.call(()=>{ const f=sfx[o.sfx]; if(f) f(); }),
  say:o=>S.call(()=>say(o.say[0],o.say[1],o.say[2])),
  save:o=>S.call(()=>saveGame('auto',true)),
  noGo:o=>S.call(()=>{ const [x0,y0,x1,y1]=scenePos(o.noGo),map=currentMap;
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) { const k=key(x,y); if(!map.npcNoGo.has(k)) { map.npcNoGo.add(k); intro.noGo.push({map,k}); } } }),
  all:o=>S.all(...compileScene(o.all)),
  seq:o=>S.seq(...compileScene(o.seq)),
  if:o=>lazy(()=>{ const ok=typeof o.if==='function'?o.if():!!flag(o.if); return S.seq(...compileScene((ok?o.then:o.else)||[])); })
};
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
  const info=chapterInfo(c.n),a=Math.min(1,c.t/.4,Math.max(0,(3-c.t)/.4));
  gfx.globalAlpha=a*.85; rect(0,0,W,H,'#14201c'); gfx.globalAlpha=a;
  const cy=Math.round(H*.42),big=Math.max(2,Math.min(4,Math.floor(W/90)));
  const words=info.title.toUpperCase().split(' '),lines=[];
  let cur=''; const maxCh=Math.floor((W-24)/(4*big));
  for(const w of words) { if((cur+' '+w).trim().length>maxCh) { lines.push(cur); cur=w; } else cur=(cur+' '+w).trim(); }
  if(cur) lines.push(cur);
  const head=c.n?'CHAPTER '+c.n:'DEMO';
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
  const s=LE_saveSnapshot_story(); s.v=3;
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
const LE_beginOpening_story=beginOpening;
beginOpening=function() { resetStory('demo',0); return LE_beginOpening_story.apply(this,arguments); };

// Debug handle for tests.
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{STORY,CHAPTERS,SCENES:typeof SCENES!=='undefined'?SCENES:null,playScene,compileScene,setFlag,flag,setChapter,heartTrace,partyRules,canBeHere,canLeave,applyPartyRules,migrateSave,beginOpening}); });
