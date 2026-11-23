// tools/b3-check-s15.js — Battle 3 checks for stage 15, the chapter 1 story switch (data/b3-story.js, engine/b3-story.js).
// The page code (router, rewards, saves) is tested in a browser by `python3 tools/b3_test.py s15`; this file holds what is plain rules or data:
// the story data names real fights, kits and foes, the tips are written for Battle 3 only, and a story fight can start each member at their
// own share of HP (cfg.hpShare). `node tools/b3-sim.js check` runs it after the file for stage 13.
'use strict';
module.exports=function(T) {
  const {G,ok}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),CAST=G('B3_CAST'),NF=G('b3NewFight'),J=x=>JSON.stringify(x);

  // 1. The data: chapter 1 is on the list, and every story fight is a real fight
  ok(S.chapters.includes(1),'chapter 1 is on the Battle 3 list (stage 17 holds the rest: tools/b3-check-s17.js)');
  ok(S.maxParty===4,'a story fight takes four at most');
  for(const k in S.fights) { const F=S.fights[k];
    ok(F.foes.length>=1&&F.foes.length<=3&&F.foes.every(f=>FOES[f.id]&&(f.row==='front'||f.row==='back')),'story fight '+k+' names real monsters, three at most (the Front row holds three)');
    ok(F.vp>0&&Number.isFinite(F.vp),'story fight '+k+' pays Vibe Points'); }
  ok(S.fights.mudling3&&S.fights.mudling3.foes.length===3&&S.fights.mudling3.foes.every(f=>f.id==='mudling'),'the chapter 1 scene fight is three Mudlings');
  ok(FORMS.mudling.vp===10&&FORMS.bigone.vp===30,'a formation pays 10 and the Big One 30 (spec section 1)');
  const per=Object.values(FORMS).filter(f=>f.ch===1).reduce((s,f)=>s+f.vp,0);
  ok(per>=60,'chapter 1 formations together pay '+per+' Main VP, enough to open Rank 2 (60)');

  // 2. Migration numbers: the pool per chapter and its split, and the level floors
  ok(S.vpPerChapter===135&&Math.abs(S.split[0]+S.split[1]-1)<1e-9,'135 VP a chapter, split in two thirds and one third');
  ok(S.levelFloor.length===16&&S.levelFloor.every((v,i,a)=>i===0||v>=a[i-1]),'one level floor per chapter 1 to 15, never going down');   // 11: stage 22a, 12 to 15: stage 22 chapters 12 to 15
  ok(S.levelFloor[1]===1,'chapter 1 raises nobody (a new game starts at Level 1)');

  // 3. The tips: Battle 3 words only
  const bad=/warmth|heart meter|tombo|b2|raspberry|goofed|inspect:|stamp(?!ede)/i;
  for(const key in S.tips) { const ids=new Set();
    for(const t of S.tips[key]) { ok(t.id&&!ids.has(t.id)&&t.text&&(t.who==='*'||CAST[t.who]),key+' tip '+t.id+' is complete with a real member'); ids.add(t.id);
      ok(!bad.test(t.text),key+' tip '+t.id+' has no battle 2 words'); ok(!/—/.test(t.text),key+' tip '+t.id+' has no em dash');
      ok(t.when==null||typeof t.when==='function',key+' tip '+t.id+' has a usable when'); } }
  ok(S.tips.basics.length>=4&&S.tips.bigone.length>=3,'both story fights have tips');

  // 4. HP carries as a share of each member's own Max HP (cfg.hpShare); a share of 0 still starts a fight at 1 HP
  const F=NF({party:['tom','grace','rose'],level:2,seed:3,formation:'mudling',rank:1,hpShare:{tom:.5,grace:1,rose:0}});
  const by={}; for(const p of F.party) by[p.id]=p;
  ok(Math.abs(by.tom.hp/by.tom.maxHp-.5)<.02,'Tom starts at half HP: '+by.tom.hp+'/'+by.tom.maxHp);
  ok(by.grace.hp===by.grace.maxHp,'Grace starts at full HP');
  ok(by.rose.hp===1,'a share of 0 starts at 1 HP, never KO\'d');
  const F2=NF({party:['tom','grace'],level:2,seed:3,formation:'mudling',rank:1});
  ok(F2.party.every(p=>p.hp===p.maxHp),'without hpShare everyone starts at full HP');
};
