'use strict';
// engine/chapter-select.js — Jump straight to the start of any chapter from the title screen (START NEW > PART 1 or
// PART 2 lists the chapters; the lists are built in engine/splash.js). Picking one fast-forwards the story as if every earlier chapter
// were finished, then plays that chapter's opening the normal way:
//   flags   every flag the earlier chapters' scenes and triggers set (scene {flag} steps, setFlag calls inside {call}
//           steps, trigger conditions, boss results as 'win')
//   items   every {give} from the earlier chapters' scenes goes in the bag (quietly)
//   levels  everyone set to CHSEL_LEVEL[n] with Auto-Stamp, full HP; coins scale with the chapter
//   place   LA chapters (2, 4, 6, 8) arrive at the Angel City cab stand; home chapters (3, 5, 7, 9) arrive at the
//           Long Island taxi depot with the girls running in; chapter 10 plays Sal's ride (SCENES.ch10Start)
// It is an approximation of a real playthrough (good for testing a chapter, not for balance).
// Remove by setting CHAPTER_SELECT=false (or dropping this file from index.html) when the full game ships.
// Loaded after engine/skip.js, before engine/main.js.
const CHAPTER_SELECT=true;
const CHSEL_LAST=20;   // the last chapter with content
// Party level at the start of each chapter (about two below that chapter's boss).
const CHSEL_LEVEL=[0,1,3,5,5,6,7,8,9,10,11,13,15,17,19,20,21,22,23,24,25];   // [11]: Part 2 test start, just past the chapter 10 boss
const chselRegion=n=>n%2===0&&n<10?'la':'le';

// Everything the chapters before n would have left behind: flags and items.
function chselStateBefore(n) {
  const flags={'opening-done':true},gives=[];
  if(n>=3) Object.assign(flags,{'met-tnb':true,'met-nara':true,'visited-la':true});   // chapter 2 met them in LA
  // The opening scene (SCENES.opening, not a ch-numbered scene) is where Rose's and Grace's first Tombos unlock.
  Object.assign(flags,{'saw-squishy':true,'tombo:rose1':true,'tombo:grace1':true});
  const take=(k,v)=>{ if(!k||k==='goal'||v==='pending'||v===false||v===null) return; flags[k]=v===undefined?true:v; };
  const fromSource=fn=>{ for(const m of String(fn).matchAll(/setFlag\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?/g)) take(m[1],m[2]); };
  const walk=x=>{
    if(!x) return;
    if(Array.isArray(x)) { x.forEach(walk); return; }
    if(typeof x==='function') { fromSource(x); return; }
    if(typeof x!=='object'||typeof x.start==='function') return;
    if(typeof x.flag==='string') take(x.flag,x.value);
    if(typeof x.give==='string') gives.push(x.give);
    if(typeof x.battle==='string') take('battle:'+x.battle,'win');
    if(typeof x.call==='function') fromSource(x.call);
    for(const k of ['then','else','all','seq']) if(x[k]) walk(x[k]);
  };
  for(const id of Object.keys(SCENES)) {
    const m=/^ch(\d+)/.exec(id); if(!m||Number(m[1])>=n) continue;
    let s=SCENES[id];
    if(typeof s==='function') { fromSource(s); try { s=s({}); } catch(e) { s=null; } }
    walk(s);
  }
  const cond=v=>{ if(typeof v==='string') take(v); else if(Array.isArray(v)) v.forEach(k=>take(k)); else if(v&&typeof v==='object') for(const k in v) take(k,v[k]); };
  for(const t of TRIGGERS) { const w=t.when||{}; if(w.mode!=='full'||!(w.chapter<n)) continue; cond(w.flag); cond(w.notFlag); }
  return {flags,gives};
}

// Set up the game as of the start of chapter n, then play its opening.
function chapterJump(n) {
  endIntro();
  if(n<=1) { b6Prep(1); beginOpening(); return; }
  resetStory('full',n);
  const st=chselStateBefore(n);
  Object.assign(STORY.flags,st.flags);
  for(const id of st.gives) if(items[id]&&!bag.includes(id)) bag.push(id);
  b6Prep(CHSEL_LEVEL[n]||1);
  coins=25+60*(n-1);
  if(n>=20) { chselTwenty(); return; }
  if(n>=19) { chselNineteen(); return; }
  if(n>=18) { chselEighteen(); return; }
  if(n>=17) { chselSeventeen(); return; }
  if(n>=16) { chselSixteen(); return; }
  if(n>=15) { chselFifteen(); return; }
  if(n>=14) { chselFourteen(); return; }
  if(n>=13) { chselThirteen(); return; }
  if(n>=12) { chselTwelve(); return; }
  if(n>=PARTS[2].from) { chselPart2(st); return; }
  if(n>=CHSEL_LAST) { chselTen(); return; }
  const la=chselRegion(n)==='la';
  // Nobody is along yet: the chapter's own scenes bring people in.
  for(const m of extras()) recruitLeave(m,true);
  if(la) setGirlsAway(true);
  const arrive=la?arriveLA():arriveHome();
  playScene(()=>[{card:n,time:3.2},...arrive],{fade:.7});   // the arrival ends the scene; the chapter's first trigger takes it from there
}
// Chapter 10 starts at the taxi depot with Sal's ride (chapter 9 is over, the girls are along).
function chselTen() {
  STORY.chapter=9; STORY.flags['ch9-done']=true;
  for(const m of extras()) recruitLeave(m,true);
  if(girlsAway()) setGirlsAway(false);
  const h=houseById.taxi;
  currentMap=town; player.x=h.door.x; player.y=h.door.y+1; player.facing='down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true;
  playScene('ch10Start',{fade:1});
}
// Chapter 12 test start: Amy is along, TNB and Nara wait on the bench, the party lands on Jefferson Park.
function chselTwelve() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done']) setFlag(f);
  setChapter(12); setFlag('ch12-open');
  if(girlsAway()) setGirlsAway(false);
  for(const m of extras()) recruitLeave(m,true);
  forceJoin(amy,true);
  for(const m of [tnb,nara]) if(typeof benchAdd==='function') benchAdd(m);
  ch12Place();
  playScene(()=>[{card:12,time:3.2},{call:()=>{}}],{fade:.7});
}
// Chapter 13 test start: chapter 12 is done, Amy is along, TNB and Nara wait on the bench, the party stands at the Angel City cab stand.
function chselThirteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done']) setFlag(f);
  setChapter(12);
  if(girlsAway()) setGirlsAway(false);
  for(const m of extras()) recruitLeave(m,true);
  forceJoin(amy,true);
  for(const m of [tnb,nara]) if(typeof benchAdd==='function') benchAdd(m);
  currentMap=worlds.lacab; player.x=7; player.y=6; player.facing='left'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Chapter 14 test start: chapter 13 is done. Tom, Amy, TNB and Nara stand on Rivituso Row in front of armored Boppy, the girls are at the cab stand,
// and the chapter 14 opening plays by itself (its trigger on the Row).
function chselFourteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done']) setFlag(f);
  setChapter(13);
  for(const m of extras()) recruitLeave(m,true);
  if(!girlsAway()) setGirlsAway(true);   // the girls are at the cab stand: room for Amy, TNB and Nara
  forceJoin(amy,true); forceJoin(tnb,true); forceJoin(nara,true);
  if(typeof ch13Girls==='function') ch13Girls();
  currentMap=worlds.row; player.x=18; player.y=9; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Chapter 15 test start: chapter 14 is done. Tom, Amy, Grace and Rose stand just inside the Rivituso house; Deedee and Boppy are home, TNB and Nara
// are in Los Angeles (they come to the table when the chapter 15 opening plays by itself, its trigger on the grands map).
function chselFifteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done']) setFlag(f);
  setChapter(14);
  if(girlsAway()) setGirlsAway(false);
  for(const m of extras()) recruitLeave(m,true);
  forceJoin(amy,true);
  currentMap=worlds.grands; player.x=6; player.y=7; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Chapter 16 test start: chapter 15 is done. Tom, Amy, Grace and Rose stand at the south end of the Square, TNB and Nara wait on the bench, Deedee and
// Boppy are home; the chapter 16 opening plays by itself (its trigger on the town map) and moves everyone into the photograph.
function chselSixteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done','ch15-done']) setFlag(f);
  setChapter(15);
  if(girlsAway()) setGirlsAway(false);
  for(const m of extras()) recruitLeave(m,true);
  forceJoin(amy,true);
  for(const m of [tnb,nara]) if(typeof benchAdd==='function') benchAdd(m);
  currentMap=worlds.town; player.x=14; player.y=22; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Chapter 20 test start: chapter 19 is done. All eight are together in the Vault facing the Pinnacle lift (Tom, Grace, Rose, Amy out front; the rest on the bench).
function chselTwenty() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done','ch15-done','ch16-open','ch16-stone','ch16-after','ch16-done',
    'ch17-open','ch17-lobby','ch17-landing','ch17-locks','ch17-race','ch17-vault','ch17-fight','ch17-after','ch17-done','tombo:amy3',
    'ch18-open','ch18-pinnacle','ch18-fight','ch18-after','ch18-done','ch19-open','ch19-hub','ch19-ready','ch19-claim','ch19-tomback','ch19-after','ch19-feast','ch19-thaw','ch19-done',
    'tombo:grace3','tombo:rose3','tombo:tnb3']) setFlag(f);
  setFlag('ch17-smashed',6); for(let i=0;i<6;i++) setFlag('shelf-'+i);
  setFlag('battle:twinlens','win'); setFlag('battle:censor','win');
  setChapter(19,{apply:false});
  STORY.override=null;
  for(const m of extras()) recruitLeave(m,true);
  ch20Assemble('amy');
  ch17Place('towervault',10,3,'up');
}
// Chapter 19 test start: chapter 18 is done. Tom is gone, TNB leads, and Grace, Rose, Amy and TNB are out front with Nara on the bench, on Second Avenue in the morning.
function chselNineteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done','ch15-done','ch16-open','ch16-stone','ch16-after','ch16-done',
    'ch17-open','ch17-lobby','ch17-landing','ch17-locks','ch17-race','ch17-vault','ch17-fight','ch17-after','ch17-done','tombo:amy3',
    'ch18-open','ch18-pinnacle','ch18-fight','ch18-after','ch18-done']) setFlag(f);
  setFlag('ch17-smashed',6); for(let i=0;i<6;i++) setFlag('shelf-'+i);
  setFlag('battle:twinlens','win'); setFlag('battle:vance','lose');
  setChapter(19,{apply:false});
  STORY.override=null;
  for(const m of extras()) recruitLeave(m,true);
  if(girlsAway()) setGirlsAway(false);
  forceJoin(amy,true);
  if(typeof benchAdd==='function') benchAdd(nara);
  setFlag('tom-gone'); tomGoneApply();
  if(typeof menuChar!=='undefined') menuChar=0;
  currentMap=worlds.jpark; player.x=4; player.y=19; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Chapter 18 test start: chapter 17 is done. Tom, Grace, Rose and Amy stand in the Vault facing the pinnacle lift; TNB and Nara are on the bench.
function chselEighteen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done','ch15-done','ch16-open','ch16-stone','ch16-after','ch16-done',
    'ch17-open','ch17-lobby','ch17-landing','ch17-locks','ch17-race','ch17-vault','ch17-fight','ch17-after','ch17-done','tombo:amy3']) setFlag(f);
  setFlag('ch17-smashed',6); for(let i=0;i<6;i++) setFlag('shelf-'+i);
  setFlag('battle:twinlens','win');
  setChapter(17,{apply:false});
  STORY.override=null;
  for(const m of extras()) recruitLeave(m,true);
  if(girlsAway()) setGirlsAway(false);
  forceJoin(amy,true);
  ch17Team('final');
  ch17Place('towervault',10,3,'up');
}
// Chapter 17 test start: chapter 16 is done. Tom, Amy, TNB and Nara stand at the Angel City cab stand, Grace and Rose wait there as NPCs
// (talking to Sol begins the chapter and brings them along), Deedee and Boppy are stone.
function chselSeventeen() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start');
  for(const f of ['ch11-met','ch11-vance','ch11-done','ch12-open','ch12-done','ch15-done','ch16-open','ch16-stone','ch16-after','ch16-done']) setFlag(f);
  setChapter(16,{apply:false});
  STORY.override=null;
  for(const m of extras()) recruitLeave(m,true);
  if(!girlsAway()) setGirlsAway(true);
  forceJoin(amy,true); forceJoin(tnb,true); forceJoin(nara,true);
  if(typeof ch16Girls==='function') ch16Girls();
  currentMap=worlds.lacab; player.x=7; player.y=6; player.facing='left'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// Part 2 without Part 1 clear data (test): Part 1 counts as cleared, then Part 2 opens the way beginPart2 does.
function chselPart2() {
  setFlag('part1-clear'); STORY.mode='full'; setFlag('part2-start'); setChapter(PARTS[2].from);
  if(girlsAway()) setGirlsAway(false);
  const st=chapterInfo(PARTS[2].from).start,h=houseById.taxi;
  if(st&&worlds[st.map]) { currentMap=worlds[st.map]; player.x=st.x; player.y=st.y; }
  else { currentMap=town; player.x=h.door.x; player.y=h.door.y+1; }
  player.facing='down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true;
  playScene(()=>[{partCard:2,time:3},{card:PARTS[2].from,time:3.2},...(SCENES.part2Open?SCENES.part2Open():[]),{save:true}],{fade:.7});
}
// Everyone to level L with Auto-Stamp and full HP.
function b6Prep(L) {
  for(const m of ALL_MEMBERS()) {
    if(L>1) { b6SetTotal(m,(L-1)*B6.xpPerLevel); b6AutoStamp(m); }
    b6Refresh(m,true);
  }
  if(typeof b6Badge==='function') b6Badge();
}
function confirmChapter(n) {
  if(!readSave('auto')) { chapterJump(n); return; }
  openChoice('Chapter '+n,'Test jump to chapter '+n+'. It replaces the autosave once it begins. Slots 1 to 3 are kept.',[
    {label:'START CHAPTER '+n,fn:()=>chapterJump(n)},
    {label:'BACK',fn:titleMenu}
  ]);
}

// The title screen's chapter lists (START NEW > PART 1 / PART 2) live in engine/splash.js and call confirmChapter.
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{chapterJump,chselStateBefore}); });
