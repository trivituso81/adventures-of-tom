'use strict';
// engine/followers.js — Followers trailing Tom, recruiting, save/load.
// ---------- Followers: Grace and Rose trail behind Tom in town ----------
function makeFollower(m,lines) {
  return {name:m.name,member:m,kid:true,x:player.x,y:player.y,facing:'down',move:null,walkClock:0,path:[],idle:1,duration:.14,lines,isPlayer:false,follower:true};
}
const followers=[
  makeFollower(grace,["Tata, can we go to the bakery again?","I named the Grump. His name is Kevin.","Are we there yet? Where's there?"]),
  makeFollower(rose,["I found a rock. It's a pet now.","Tata, the slime looked at me funny.","Tata, piggyback?"])
];

// Followers walk the trail of tiles Tom has just left, so he can turn around and walk back through them.
const trail=[];
function movePlayer(dir) {
  if(!startMove(player,dir)) return false;
  const dest={x:player.move.tx,y:player.move.ty};
  if(!trail.length) trail.push({x:player.x,y:player.y});
  trail.push(dest);
  while(trail.length>followers.length+2) trail.shift();
  followers.forEach((f,k)=>{
    const t=trail[trail.length-2-k];
    if(!t) return;
    if(f.move) { f.x=f.move.tx; f.y=f.move.ty; f.move=null; }
    if(f.x===t.x&&f.y===t.y) return;
    f.facing=directionTo(t.x-f.x,t.y-f.y);
    f.move={fx:f.x,fy:f.y,tx:t.x,ty:t.y,elapsed:0,duration:player.duration,fresh:true};
  });
  return true;
}

// ---------- Recruiting ----------
// Party cap is 4. Long Island: Tom, Grace, Rose plus one of Amy, Deedee or Boppy.
// Los Angeles: Tom plus TNB and Nara (both at once). Recruits never leave their own town.
const extras=()=>party.filter(x=>x!==hero&&x!==grace&&x!==rose);
const RECRUIT_TALK={
  amy:{ask:'Also. I\'ve been standing still for four minutes and it\'s killing me. Want a running partner out there?',
       yes:'Finally. Try to keep up. I mean that with love.',no:'Fine. I\'ll do burpees until you change your mind.',
       swap:'Somebody has to tag out. I can wait, but I\'ll be stretching the whole time.',
       bye:'Amy jogs home. Backwards. To make it harder.',
       lines:['Pick up the pace, Tom. The girls are faster than you.','Is that the Grump? I could take him. I\'ve taken a second-grade class on a field trip.','Rose, shoes. Grace, water. Tom, posture.']},
  deedee:{ask:'Now hold on, Tommy. You\'re not taking my angels anywhere without me and a bag of cookies. Can Deedee come along?',
       yes:'Wonderful! Everybody hold hands. Tommy, you too. To the moon and back, here we come.',no:'All right, all right. The pies need me anyway. Come back for a cookie.',
       swap:'Oh, honey. Somebody has to stay and mind the house. Who\'s it going to be?',
       bye:'Deedee heads home to check on the pies. All four of them.',
       lines:['Are you warm enough? Nobody is warm enough.','Grace, Rose, to the moon and back. Say it. LOUDER.','I packed cookies. They\'re in my purse. The purse is at home. We go back.','Pick up those feet. A brisk walk never hurt anybody.','Tommy, you look pale. When did you last drink water? Nurse is asking.','When we get home I\'m making a big dinner. Nobody argue.']},
  boppy:{ask:'My stomach isn\'t right and the fish aren\'t biting. Want an old man along? Just don\'t walk too fast.',
       yes:'Good. Somebody grab my cap. And slow down. I was a champion, you know.',no:'Suit yourself. The recliner and I have an understanding.',
       swap:'Somebody has to sit this one out. My stomach volunteers, but the rest of me is coming.',
       bye:'Boppy shuffles home to the recliner. He\'s not feeling good. Deedee will hear all about it.',
       lines:['Slow down! Who taught you to walk? I was a champion runner and I never went this fast.','At Rikers I did the headcount. One, two, three, Tom. Everybody here.','My stomach is talking. It says no more peppers. My stomach is wrong.','That Grump owes me a fish. Tell him.']},
  tnb:{ask:'Heading out? I can come. I have my longboard, a bus pass and a garment bag. I\'m ready for anything. Mostly costume emergencies.',
       yes:'Great. Let me grab my jacket. Oh. You have it. Let me grab my other jacket.',no:'Okay. I\'ll be here, throwing bowls. Come back if anything cracks.',
       swap:'Somebody has to hold down the house. I vote the couch, but it has to be a person.',
       bye:'TNB heads back to Spring Street to check the kiln. It\'s fine. He checks anyway.',
       lines:['Tom, your shoelace. No, the other one. Got it.','Well, well... a foggy canyon at dusk. This is how every horror movie starts.','If a coyote jumps out at us, I\'ve seen this movie. Stay together. Nobody go in the basement.','After this, clay. Any two colors. I\'ll make them get along.']}
,
  nara:{ask:'Nara leans her whole body against Tom\u2019s legs. She\'s not letting him out of her sight. Take her along?',
       yes:'Nara spins in three happy circles. Then a fourth, for luck. Then she checks Tom is still there.',no:'Nara lies down on Tom\u2019s foot. She\'ll wait. She\'ll wait RIGHT here.',
       swap:'Nara won\'t go anywhere without Tom. Somebody else has to sit this one out.',
       bye:'Nara trots back to 2nd Ave, looking over her shoulder the whole way. She\'ll be waiting at the corner.',
       lines:['Nara checks that Tom is still there. He is. She checks again.','Nara found a stick. It\'s the best stick. Everyone must see the stick.','Nara sniffs one jacaranda for a full minute. Important news.','Nara turned down a perfectly good biscuit this morning. She has standards.']}
};
function recruitLeave(m,quiet) {
  const i=party.indexOf(m); if(i<0) return;
  party.splice(i,1);
  const fi=followers.findIndex(f=>f.member===m); if(fi>=0) followers.splice(fi,1);
  if(m.homeNpc&&m.homeMap) { m.homeNpc.x=m.homeNpc.homeX; m.homeNpc.y=m.homeNpc.homeY; m.homeNpc.move=null; m.homeNpc.path=[]; m.homeMap.npcs.push(m.homeNpc); }
  m.homeNpc=null; m.homeMap=null;
  if(!quiet) showToast(RECRUIT_TALK[m.id].bye,3.2);
  if(menuChar>=party.length) menuChar=0;
}
function recruitJoin(m,npc,silent=false,map=currentMap,replace=null) {
  if(replace) recruitLeave(replace,silent);
  if(party.length>=PARTY_MAX) return;
  party.push(m);
  if(!silent) { m.hp=m.maxHp; m.mp=m.maxMp; }
  m.homeNpc=npc; m.homeMap=map;
  npc.homeX=npc.homeX??npc.x; npc.homeY=npc.homeY??npc.y;
  const ni=map.npcs.indexOf(npc); if(ni>=0) map.npcs.splice(ni,1);
  const f=makeFollower(m,RECRUIT_TALK[m.id].lines);
  f.x=silent?player.x:npc.x; f.y=silent?player.y:npc.y; f.facing=npc.facing;
  followers.push(f);
  if(silent) return;
  sfx.levelChime();
  // Shared story XP (engine/progress.js b6Sync): say so when they caught up with Tom while at home.
  const sp=b6SpLeft(m),caught=m.caughtUp; m.caughtUp=0;
  b6Badge();
  showToast(m.name+' joins the party!'+(caught?' Caught up to Lv '+m.level+'.':'')+(sp&&b6Stampable(m)?' '+sp+' Stamp Point'+(sp>1?'s':'')+' to spend.':''),caught||sp?3.4:2.6);
  openDialog(m.name,[RECRUIT_TALK[m.id].yes]);
}

// ---------- Saving: three named slots plus an autosave, in this browser's storage ----------
const SAVE_SLOTS=['auto','1','2','3'];
// Full game saves. The demo (demo/) keeps the original le-save-* keys, so the two never mix.
const SAVE_PREFIX='aot-save-';
function saveSnapshot() {
  const flags={};
  for(const [id,map] of Object.entries(worlds)) { flags[id]={}; for(const n of map.npcs) if(n.visitedOnce) flags[id][n.name]=true; }
  const grump=findGrump();
  const monsters={}; for(const n of allMonsters()) monsters[n.monster]={tier:n.tier,maxHp:n.maxHp};
  return {v:2,when:Date.now(),map:currentMap.id,x:player.x,y:player.y,facing:player.facing,visited:[...visited],allVisited,bag:bag.slice(),coins,time:Math.floor(playTime),
    grump:grump?{tier:grump.tier,maxHp:grump.maxHp}:null,monsters,flags,
    // party: who is in it (with levels for the save list); members: all eight, in the party or not (F6).
    party:party.map(m=>({id:m.id,level:m.level,xp:m.xp,hp:m.hp,maxHp:m.maxHp})),
    members:ALL_MEMBERS().map(b6SaveMember),
    opts:typeof b7Opts==='function'?b7Opts():null};   // difficulty, battle speed, High-Five (engine/feel.js)
}
// SAVE_CACHE holds the latest copy of every slot. Browser storage alone is not enough: Safari can throw it away when
// the app closes, so engine/cloud-save.js also keeps each slot with the player's Claude account and fills this cache.
const SAVE_CACHE={};
function saveRaw(slot) {
  if(typeof SAVE_CACHE[slot]==='string') return SAVE_CACHE[slot];
  try { return localStorage.getItem(SAVE_PREFIX+slot); } catch(e) { return null; }
}
function saveGame(slot,quiet=false) {
  let raw;
  try { raw=JSON.stringify(saveSnapshot()); } catch(e) { if(!quiet) showToast('Couldn\'t save here.',2.5); return false; }
  SAVE_CACHE[slot]=raw;
  let local=true; try { localStorage.setItem(SAVE_PREFIX+slot,raw); } catch(e) { local=false; }
  const cloud=typeof cloudPut==='function'&&cloudPut(slot,raw);
  if(!local&&!cloud) { if(!quiet) showToast('Couldn\'t save here.',2.5); return false; }
  if(!quiet) { sfx.pickup(); showToast(slot==='auto'?'Autosaved.':'Saved to slot '+slot+'.',2); }
  return true;
}
function readSave(slot) { try { const raw=saveRaw(slot); return raw?JSON.parse(raw):null; } catch(e) { return null; } }
function loadGame(slot) {
  const sv=readSave(slot); if(!sv) return false;
  const allMembers={tom:hero,grace,rose,amy,deedee,boppy,tnb,nara};
  // Send any recruit home first, then rebuild the party in saved order.
  for(const m of party.slice()) if(m!==hero&&m!==grace&&m!==rose) recruitLeave(m,true);
  // Grace and Rose stay home while Tom is in Los Angeles; the save says whether they were in the party.
  setGirlsAway(!sv.party.some(p=>p.id==='grace'));
  // Since F6 every member is saved (sv.members); older saves only had the party.
  if(sv.members) for(const sm of sv.members) b6LoadMember(allMembers[sm.id],sm);
  for(const pm of sv.party) {
    const m=allMembers[pm.id]; if(!m) continue;
    if(!sv.members) { Object.assign(m,{level:pm.level,xp:pm.xp,wins:pm.wins||0,hp:pm.hp,maxHp:pm.maxHp}); if(pm.equipment) m.equipment=Object.assign({},pm.equipment); }
    if(m!==hero&&m!==grace&&m!==rose&&!inParty(m)) {
      for(const [id,map] of Object.entries(worlds)) { const npc=map.npcs.find(n=>n.name===m.name); if(npc) { recruitJoin(m,npc,true,map); break; } }
    }
  }
  if(sv.opts&&typeof b7ApplyOpts==='function') b7ApplyOpts(sv.opts);
  bag.length=0; bag.push(...sv.bag);
  b6AfterLoad(sv);   // old gear to three slots, starter tools, shared XP, stamps (engine/progress.js)
  if(typeof syncHeroHat==='function') syncHeroHat();
  coins=typeof sv.coins==='number'?sv.coins:25;
  playTime=sv.time||0;
  visited.clear(); for(const id of sv.visited) visited.add(id);
  allVisited=!!sv.allVisited;
  for(const [id,map] of Object.entries(worlds)) for(const n of map.npcs) n.visitedOnce=!!(sv.flags&&sv.flags[id]&&sv.flags[id][n.name]);
  const grump=findGrump(); if(grump&&sv.grump) { grump.tier=sv.grump.tier; grump.maxHp=sv.grump.maxHp; }
  if(sv.monsters) for(const n of allMonsters()) { const r=sv.monsters[n.monster]; if(r) { n.tier=r.tier; n.maxHp=r.maxHp; } }
  currentMap=worlds[sv.map]||town;
  player.x=sv.x; player.y=sv.y; player.facing=sv.facing||'down'; player.move=null;
  // Older saves (before the town split) can point at a spot that is now a tree or a wall.
  if((sv.v||1)<2||!walkable(currentMap,player.x,player.y)) { player.x=currentMap.spawn.x; player.y=currentMap.spawn.y; }
  placeFollowers();
  refreshAreaUI();
  menuChar=0;
  resize(); camera.snap=true;
  sfx.fountain();
  showToast('Loaded. Welcome back.',2.2);
  return true;
}
function saveSummary(sv) {
  if(!sv) return 'Empty';
  const d=new Date(sv.when);
  const lead=sv.party[0]||{};
  return (worlds[sv.map]?worlds[sv.map].name:'Town')+' \u00b7 Lv '+lead.level+' \u00b7 '+sv.party.length+' in party \u00b7 '+(sv.coins!=null?sv.coins+' coins \u00b7 ':'')+d.toLocaleDateString()+' '+d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
}
function renderSaves(body) {
  $('menu-foot').textContent=(typeof cloudOn==='function'&&cloudOn()?'Saves are kept with your Claude account, so closing Safari keeps them.':'Saves live in this browser on this device.')+' Autosave happens at every door and after each battle.';
  const list=document.createElement('div'); list.className='item-list';
  for(const slot of SAVE_SLOTS) {
    const sv=readSave(slot);
    const row=document.createElement('div'); row.className='save-row';
    row.innerHTML='<div class="item-icon">'+(slot==='auto'?'\u23F1':'\u{1F4BE}')+'</div><div class="save-copy"><span class="save-name"></span><span class="save-meta"></span></div>';
    row.querySelector('.save-name').textContent=slot==='auto'?'Autosave':'Slot '+slot;
    row.querySelector('.save-meta').textContent=saveSummary(sv);
    if(slot!=='auto') { const b=document.createElement('button'); b.type='button'; b.className='save-btn'; b.textContent='SAVE'; b.addEventListener('click',()=>{ saveGame(slot); renderMenu(); }); row.appendChild(b); }
    const l=document.createElement('button'); l.type='button'; l.className='save-btn'; l.textContent='LOAD'; l.disabled=!sv; l.addEventListener('click',()=>{ closeMenu(); loadGame(slot); }); row.appendChild(l);
    list.appendChild(row);
  }
  body.appendChild(list);
}
function offerRecruit(m,npc) {
  const t=RECRUIT_TALK[m.id];
  // Their join line is spoken aloud and shown first; the question and YES / NO follow on the next page.
  const join=LINES[m.id]&&LINES[m.id].join?pick(LINES[m.id].join):null;
  if(join) say(m.id,'join',.15,join);
  openChoice(npc.name,join?[join,t.ask]:t.ask,[
    {label:'YES, COME ALONG',fn:()=>{
      if(party.length<PARTY_MAX) { recruitJoin(m,npc); return; }
      openChoice(npc.name,t.swap,[
        ...extras().map(e=>({label:'SWAP OUT '+e.name.toUpperCase(),fn:()=>recruitJoin(m,npc,false,currentMap,e)})),
        {label:'CANCEL',fn:()=>openDialog(npc.name,[t.no],npc)}
      ],npc);
    }},
    {label:'NOT RIGHT NOW',fn:()=>openDialog(npc.name,[t.no],npc)}
  ],npc);
}
function placeFollowers() {
  trail.length=0;
  trail.push({x:player.x,y:player.y});
  for(const f of followers) { f.x=player.x; f.y=player.y; f.move=null; f.facing=player.facing; }
}

