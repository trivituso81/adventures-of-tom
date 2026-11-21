// tools/b3-check-s17.js — Battle 3 checks for stage 17, the chapter 2 to 5 story switch (data/b3-story.js, engine/b3-story.js, data/scenes.js).
// The page side (routing, rewards, scenes, tips on screen) is tested in a browser by tools/ch2_b3_test.py to ch5_b3_test.py and
// tools/b3_story_test.py; this file holds what is plain data: every fight a switched chapter's scenes start has a Battle 3 fight and
// tips, every map monster of those chapters has a formation, the Vibe Points add up, and no Battle 2 words are in the new tips.
// `node tools/b3-sim.js check` runs it after the file for stage 15.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),CAST=G('B3_CAST'),J=x=>JSON.stringify(x);
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const EXPECT=[1,2,3];   // the chapters on the Battle 3 list at this build; each stage 17 part adds one
  ok(J(S.chapters)===J(EXPECT),'the Battle 3 story list is '+J(EXPECT)+' (found '+J(S.chapters)+')');
  const scenes=read('data/scenes.js');
  // Chapter of a position in scenes.js: the last `// CHAPTER n:` heading before it.
  const heads=[...scenes.matchAll(/^\/\/ CHAPTER (\d+):/gm)].map(m=>({n:+m[1],at:m.index}));
  const chapterAt=i=>{ let n=0; for(const h of heads) if(h.at<=i) n=h.n; return n; };

  // 1. Every fight a switched chapter's scenes start has a Battle 3 fight, tips for its `tut`, and its flag is read the same way
  const steps=[...scenes.matchAll(/\{battle:(?:'([a-z0-9]+)'|\(\)=>findMonster\('([a-z0-9]+)'\)),tut:'([a-z0-9]+)'(?:,count:(\d))?/g)].map(m=>({ch:chapterAt(m.index),id:m[1]||m[2],tut:m[3],count:m[4]?+m[4]:0}));
  for(const n of S.chapters.filter(c=>c>=2)) {
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
  for(const k of Object.keys(S.tips)) ok(keys.has(k),'tips key '+k+' is used by a switched chapter\'s scene step');

  // 2. Map monsters of the switched chapters all have a formation (the one door routes them)
  const SPOTS={2:['LA_MONSTER_SPOTS'],3:['MARSH_MONSTER_SPOTS','SUNDIAL_MONSTER_SPOTS'],4:['BACKLOT_MONSTER_SPOTS','STAGE7_MONSTER_SPOTS','STAGESET_MONSTER_SPOTS'],5:['SCHOOL_MONSTER_SPOTS','CAFE_MONSTER_SPOTS']};
  const dfiles=fs.readdirSync(path.join(ROOT,'data')).filter(f=>/monsters\.js$/.test(f)).map(f=>read('data/'+f)).join('\n');
  for(const n of S.chapters.filter(c=>c>=2)) for(const name of SPOTS[n]||[]) {
    const m=dfiles.match(new RegExp('const '+name+'=\\[(.*?)\\];'));
    ok(!!m,'chapter '+n+': '+name+' found');
    if(m) { const ids=[...m[1].matchAll(/\['([a-z0-9]+)'/g)].map(x=>x[1]);
      ok(ids.length>=1&&ids.every(id=>FOES[id]&&FORMS[id]),'chapter '+n+': every monster in '+name+' has a Battle 3 formation ('+ids.join(', ')+')'); } }

  // 3. Vibe Points: formations pay the bestiary's number, bosses its boss number, and a chapter's story path adds up
  const BOSS={2:['bigshake',30],3:['irongill',27],4:['directorscut',26],5:['redpen',30]},NORMAL={2:10,3:9,4:8,5:12};
  for(const n of S.chapters.filter(c=>c>=2)) {
    ok(FORMS[BOSS[n][0]].vp===BOSS[n][1],'chapter '+n+' boss pays '+BOSS[n][1]+' VP (bestiary section 5)');
    const forms=Object.values(FORMS).filter(f=>f.ch===n&&f.id!==BOSS[n][0]);
    ok(forms.length>=4&&forms.every(f=>f.vp===NORMAL[n]),'chapter '+n+' normal formations pay '+NORMAL[n]+' VP each ('+forms.length+' formations)');
    const path_=steps.filter(s=>s.ch===n).reduce((a,s)=>a+((s.count&&S.fights[s.id+s.count])?S.fights[s.id+s.count].vp:FORMS[s.id].vp),0);
    ok(path_>=BOSS[n][1]+2*NORMAL[n],'chapter '+n+' story path pays '+path_+' VP');
  }
  for(const k in S.fights) { const F=S.fights[k];
    ok(F.vp>0&&F.foes.every(f=>FOES[f.id]),'story fight '+k+' is real and pays VP'); }

  // 4. New tips: Battle 3 words only, complete, named members exist, no em dash, never longer than a message line can hold
  const bad=/warmth|heart meter|tombo|b2|raspberry|goofed|compliment|puppy dog|stamp/i;
  for(const key of Object.keys(S.tips)) { if(key==='basics'||key==='bigone') continue; const ids=new Set();
    ok(S.tips[key].length>=2,key+' has at least two tips');
    for(const t of S.tips[key]) {
      ok(t.id&&!ids.has(t.id)&&t.text&&(t.who==='*'||CAST[t.who]),key+' tip '+t.id+' is complete with a real member'); ids.add(t.id);
      ok(!bad.test(t.text)&&!/—/.test(t.text),key+' tip '+t.id+' has no battle 2 word and no em dash');
      ok(t.text.length<=240,key+' tip '+t.id+' fits a message line ('+t.text.length+' characters)');
      ok(t.when==null||typeof t.when==='function',key+' tip '+t.id+' has a usable when'); } }

  // 5. Scenes: every Tombo toast of a switched chapter is behind B3_CH_ON, and a boss win sets the kind flag Battle 3 never earns by Warmth
  const lines=scenes.split('\n'); let off=0;
  lines.forEach(l=>{ const at=off; off+=l.length+1; if(!/\{toast:'New Tombo/.test(l)) return; const n=chapterAt(at);
    if(S.chapters.includes(n)) ok(new RegExp('B3_CH_ON\\('+n+'\\)').test(l),'the Tombo toast in chapter '+n+' is skipped under Battle 3: '+l.trim().slice(0,60)); });
  const eng=read('engine/b3-story.js');
  ok(/setFlag\('kind:'\+npc\.monster/.test(eng),'b3sEnd sets kind:<boss> on a boss win (chapter 2 and later)');
};
