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
const CHSEL_LAST=10;   // the last chapter with content
// Party level at the start of each chapter (about two below that chapter's boss).
const CHSEL_LEVEL=[0,1,3,5,5,6,7,8,9,10,11,13];   // [11]: Part 2 test start, just past the chapter 10 boss
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
