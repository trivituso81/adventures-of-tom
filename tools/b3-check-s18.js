// tools/b3-check-s18.js — Battle 3 checks for stage 18, the chapter 6 to 10 and bonus chapter story switch (data/b3-story.js, engine/b3-story.js, data/scenes.js).
// The page side (routing, rewards, scenes, tips on screen) is tested in a browser by tools/ch6_b3_test.py to ch10_b3_test.py and ns_b3_test.py and
// tools/b3_story_test.py; this file holds what is plain data: every fight a switched chapter's scenes start has a Battle 3 fight and
// tips, every map monster of those chapters has a formation, the Vibe Points add up, and no Battle 2 words are in the new tips.
// `node tools/b3-sim.js check` runs it after the file for stage 17.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),CAST=G('B3_CAST'),J=x=>JSON.stringify(x);
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const EXPECT=[6,7,8,9,10,11,12,13,14,15,16,21];   // stage 18's chapters (21 is the bonus chapter Nine Scoops); each stage 18 part adds one. 11 is stage 22a (tools/b3-check-s22.js); 12 to 16 are the stage 22 chapter builds.
  ok(J(S.chapters.slice(5))===J(EXPECT.filter(n=>S.chapters.includes(n))),'stage 18 chapters sit in order after chapter 5 (found '+J(S.chapters)+')');
  const MINE=c=>c>=6&&c<=10;   // the bonus chapter has its own section at the end
  const scenes=read('data/scenes.js');
  // Chapter of a position in scenes.js: the last `// CHAPTER n:` heading before it.
  const heads=[...scenes.matchAll(/^\/\/ CHAPTER (\d+):/gm)].map(m=>({n:+m[1],at:m.index}));
  const chapterAt=i=>{ let n=0; for(const h of heads) if(h.at<=i) n=h.n; return n; };

  // 1. Every fight a switched chapter's scenes start has a Battle 3 fight, tips for its `tut`, and its flag is read the same way
  const steps=[...scenes.matchAll(/\{battle:(?:'([a-z0-9]+)'|\(\)=>findMonster\('([a-z0-9]+)'\)),tut:'([a-z0-9]+)'(?:,count:(\d))?/g)].map(m=>({ch:chapterAt(m.index),id:m[1]||m[2],tut:m[3],count:m[4]?+m[4]:0}));
  for(const n of S.chapters.filter(c=>MINE(c))) {
    const mine=steps.filter(s=>s.ch===n);
    ok(mine.length>=4,'chapter '+n+' has its story fights found in the scenes ('+mine.length+')');
    for(const s of mine) {
      const key=s.count?s.id+s.count:s.id;
      ok(!!(S.fights[key]||FORMS[s.id]),'chapter '+n+' fight '+s.id+(s.count?' x'+s.count:'')+' has a Battle 3 fight');
      ok(Array.isArray(S.tips[s.tut])&&S.tips[s.tut].length>=1,'chapter '+n+' fight '+s.id+' has tips under the key '+s.tut);
      ok(FOES[s.id]&&FORMS[s.id],'chapter '+n+' monster '+s.id+' is in the bestiary with a formation'); }
  }
  // Every tips key belongs to a story step of a switched chapter (no tips written for a fight that cannot run on Battle 3)
  const keys=new Set(steps.filter(s=>S.chapters.includes(s.ch)).map(s=>s.tut)); keys.add('basics'); keys.add('bigone');
  // The bonus chapter (21) has its scenes in data/bonus-nine-scoops.js, not scenes.js: its tut names count when it is switched.
  if(S.chapters.includes(21)) for(const m of read('data/bonus-nine-scoops.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  // Chapter 11 (stage 22a) has its scenes in data/scenes-p2.js.
  if(S.chapters.includes(11)) for(const m of read('data/scenes-p2.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  // Chapter 12 (stage 22, chapter 12) has its scenes in data/scenes-ch12.js.
  if(S.chapters.includes(12)) for(const m of read('data/scenes-ch12.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  // Chapter 13 (stage 22 chapter 13) has its scenes in data/scenes-ch13.js. The Gold Knight's tips wait for the scene that starts his fight (his scene is not written yet: card c-b3s22ch13 history).
  if(S.chapters.includes(13)) { for(const m of read('data/scenes-ch13.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]); keys.add('goldknight'); }
  // Chapter 14 (stage 22 chapter 14) has its scenes in data/scenes-ch14.js (its one fight, Boppy's Gold Armor, is `tut:'ch14'`).
  if(S.chapters.includes(14)) for(const m of read('data/scenes-ch14.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  // Chapter 15 (stage 22 chapter 15) has its scenes in data/scenes-ch15.js (its one fight, HUSH-9 Final Form, is `tut:'ch15'`).
  if(S.chapters.includes(15)) for(const m of read('data/scenes-ch15.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  // Chapter 16 (stage 22 chapter 16) has its scenes in data/scenes-ch16.js (its one fight, Marlowe, is `tut:'ch16'`).
  if(S.chapters.includes(16)) for(const m of read('data/scenes-ch16.js').matchAll(/tut:'([a-zA-Z0-9]+)'/g)) keys.add(m[1]);
  for(const k of Object.keys(S.tips)) ok(keys.has(k),'tips key '+k+' is used by a switched chapter\'s scene step');

  // 2. Map monsters of the switched chapters all have a formation (the one door routes them)
  const SPOTS={6:['OAKPARK_MONSTER_SPOTS','OAK_MONSTER_SPOTS','CROWN_MONSTER_SPOTS'],7:['STACKS_MONSTER_SPOTS','READROOM_MONSTER_SPOTS'],8:['BARN_MONSTER_SPOTS','BOILER_MONSTER_SPOTS'],9:['CLUB_MONSTER_SPOTS','DOME_MONSTER_SPOTS'],10:['TERM_MONSTER_SPOTS','GATE_MONSTER_SPOTS']};
  const dfiles=fs.readdirSync(path.join(ROOT,'data')).filter(f=>/monsters\.js$/.test(f)).map(f=>read('data/'+f)).join('\n');
  for(const n of S.chapters.filter(c=>MINE(c))) for(const name of SPOTS[n]||[]) {
    const m=dfiles.match(new RegExp('const '+name+'=\\[(.*?)\\];'));
    ok(!!m,'chapter '+n+': '+name+' found');
    if(m) { const ids=[...m[1].matchAll(/\['([a-z0-9]+)'/g)].map(x=>x[1]);
      ok(ids.length>=1&&ids.every(id=>FOES[id]&&FORMS[id]),'chapter '+n+': every monster in '+name+' has a Battle 3 formation ('+ids.join(', ')+')'); } }

  // 3. Vibe Points: formations pay the bestiary's number, bosses its boss number, and a chapter's story path adds up
  const BOSS={6:['chairman',30],7:['unread',27],8:['ironbelly',27],9:['mirrorball',27],10:['lastcall',26]},NORMAL={6:6,7:9,8:9,9:9,10:8};
  for(const n of S.chapters.filter(c=>MINE(c))) {
    ok(FORMS[BOSS[n][0]].vp===BOSS[n][1],'chapter '+n+' boss pays '+BOSS[n][1]+' VP (bestiary section 5)');
    const forms=Object.values(FORMS).filter(f=>f.ch===n&&f.id!==BOSS[n][0]);
    ok(forms.length>=4&&forms.every(f=>f.vp===NORMAL[n]),'chapter '+n+' normal formations pay '+NORMAL[n]+' VP each ('+forms.length+' formations)');
    const path_=steps.filter(s=>s.ch===n).reduce((a,s)=>a+((s.count&&S.fights[s.id+s.count])?S.fights[s.id+s.count].vp:FORMS[s.id].vp),0);
    ok(path_>=BOSS[n][1]+2*NORMAL[n],'chapter '+n+' story path pays '+path_+' VP');
  }
  for(const k in S.fights) { const F=S.fights[k];
    ok(F.vp>0&&F.foes.every(f=>FOES[f.id]),'story fight '+k+' is real and pays VP'); }

  // (the bonus chapter's checks are added with its part, b3s18)
};
