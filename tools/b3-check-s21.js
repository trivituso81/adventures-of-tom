// tools/b3-check-s21.js — Battle 3 rule tests for stage 21: Vibe Mastery is the only progression, and Casual Mode ("Freelancer", spec section 1).
// What it covers: (1) Casual Mode is locked until every Vibe of a member is mastered, opens for all ten, and the Rank picker puts it away again;
// (2) its kit: no Skills of its own (every Skill comes through two Pocket Vibes), the chosen Basic, every Trait of the member's Vibes, each Vibe's
// Portable Counter, no Lean, Front row, Rank 5; (3) switching in and out and trading the two Pocket slots; (4) it earns no Vibe Points; (5) a
// whole fight with every member in Casual Mode in a four-member party; (6) old saves load (no pocket2, no basic) and a saved Casual Mode whose Vibes
// are no longer mastered is put away; (7) no Stampcard, Polish Point or Remix Ticket path is left in the files Battle 3 runs on.
// `node tools/b3-sim.js check` runs it after the file for stage 19.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,play}=T;
  const NF=G('b3NewFight'),CAST=G('B3_CAST'),VIBES=G('B3_VIBES'),TRAITS=G('B3_TRAITS'),SK=G('B3_SKILLS'),FREE=G('B3_FREELANCER'),
    newL=G('b3NewLoadout'),fix=G('b3FixLoadout'),setMain=G('b3SetMain'),setPocket=G('b3SetPocket'),setBasic=G('b3SetBasic'),setRank=G('b3SetRank'),
    open=G('b3CasualOpen'),kit=G('b3Kit'),passives=G('b3KitPassives'),award=G('b3AwardVp'),rowOf=G('b3RowOf'),basics=G('b3Basics'),vibeOf=G('b3VibeOf'),
    options=G('b3Options'),J=x=>JSON.stringify(x);
  const IDS=Object.keys(CAST).filter(id=>G('b3HasKit')(id)),RANK5=G('B3_RULES').rankVp.length;
  ok(IDS.length===10&&FREE==='freelancer','all ten members have a kit and Casual Mode is the id "freelancer"');
  ok(!VIBES[FREE]&&vibeOf(FREE).name==='Freelancer'&&vibeOf(FREE).lean===null,'Freelancer is not in B3_VIBES (the Vibe lists skip it) and has no Lean');

  // ---------- 1. Locked until every Vibe is mastered ----------
  for(const id of IDS) {
    const L=newL(id,4);
    ok(!open(id,L)&&!setMain(id,L,FREE)&&L.main!==FREE,id+': Casual Mode is locked at Rank 4');
    const ids=CAST[id].vibes; for(const v of ids.slice(0,-1)) L.vp[v]=G('b3MasterVp')();
    ok(!open(id,L),id+': two mastered Vibes of three do not open it');
    L.vp[ids[ids.length-1]]=G('b3MasterVp')();
    ok(open(id,L),id+': every Vibe mastered opens it');
  }

  // ---------- 2. The kit ----------
  for(const id of IDS) {
    const L=newL(id,RANK5),ids=CAST[id].vibes,a=L.main,b=L.pocket,basicA=VIBES[a].basic;
    ok(setMain(id,L,FREE)&&L.main===FREE,id+': switches into Casual Mode');
    ok(L.pocket===a&&L.pocket2===b&&L.pocket!==L.pocket2,id+': the old Main and Pocket Vibes become the two Pocket slots: '+J([L.pocket,L.pocket2]));
    ok(L.basic===basicA,id+': the chosen Basic starts as the old Main Vibe\'s Basic');
    const K=kit(id,L);
    ok(K.main===FREE&&K.lean===null&&K.rank===RANK5&&K.row==='front'&&rowOf(L)==='front',id+': no Lean, Rank '+RANK5+', Front row');
    ok(J(K.traits)===J(ids.map(v=>VIBES[v].trait)),id+': all of the member\'s Traits are on: '+J(K.traits));
    ok(K.basic===basicA,id+': the kit\'s Basic is the chosen one');
    const own=ids.flatMap(v=>VIBES[v].skills),fromPockets=[L.pocket,L.pocket2].flatMap(v=>VIBES[v].skills.filter(s=>SK[s]));
    ok(K.skills.every(s=>fromPockets.includes(s))&&K.skills.length===fromPockets.length&&J(K.pocketSkills)===J(K.skills),id+': every Skill comes through a Pocket Vibe, none of Freelancer\'s own: '+K.skills.length+' of '+fromPockets.length);
    const third=ids.find(v=>v!==L.pocket&&v!==L.pocket2);
    ok(!K.skills.some(s=>VIBES[third].skills.includes(s)),id+': the Vibe left out brings no Skill');
    const wantCounters=ids.map(v=>VIBES[v].counter).filter(Boolean).map(c=>c.id).sort();
    ok(J(K.counters.map(c=>c.id).sort())===J(wantCounters),id+': each Vibe\'s Portable Counter builds: '+J(wantCounters));
    const P=passives(K);
    for(const t of ids.map(v=>VIBES[v].trait)) { const T=TRAITS[t]; if(!T||T.soon) continue;
      ok(P.listeners.some(x=>x.id===T.id||x.pid===T.id)||P.mods.some(m=>m.from===T.id)||P.counters.some(c=>T.counter&&c.id===T.counter.id)||T.viaVibe||T.custom||T.immune||T.shieldMods||T.allyMods||P.custom[T.custom],id+': the Trait '+t+' puts a rule on the unit'); }
    // basic choice: all three can be picked, and a pick of something else is refused
    for(const bs of basics(id)) ok(setBasic(id,L,bs)||L.basic===bs,id+': Basic '+bs+' can be chosen');
    ok(!setBasic(id,L,'pick_me_up')&&!setBasic(id,L,'nope'),id+': a Basic that is not one of theirs is refused');
    ok(!setBasic(id,newL(id,RANK5),basicA),id+': only Casual Mode has a chosen Basic');
  }

  // ---------- 3. In, out and trading ----------
  for(const id of IDS) {
    const L=newL(id,RANK5),ids=CAST[id].vibes;
    setMain(id,L,FREE);
    const p0=L.pocket,p1=L.pocket2,third=ids.find(v=>v!==p0&&v!==p1);
    ok(!setPocket(id,L,p0,0)&&!setPocket(id,L,p1,1),id+': picking what is already in the slot changes nothing');
    ok(setPocket(id,L,p1,0)&&L.pocket===p1&&L.pocket2===p0,id+': picking the other slot\'s Vibe trades the two');
    ok(setPocket(id,L,third,1)&&L.pocket2===third&&L.pocket!==L.pocket2,id+': the second slot takes the third Vibe');
    const L2=fix(id,L); ok(L2.main===FREE&&L2.pocket===L.pocket&&L2.pocket2===L.pocket2&&L2.basic===L.basic,id+': a loadout in Casual Mode survives b3FixLoadout unchanged');
    // out again
    const back=ids[0]; ok(setMain(id,L,back)&&L.main===back&&L.pocket!==back&&!!L.pocket&&L.pocket2===null&&L.basic===null,id+': back to a real Primary Vibe: Pocket Vibe valid, second slot and chosen Basic cleared');
    ok(!setPocket(id,L,ids[1],1),id+': the second Pocket slot belongs to Casual Mode only');
    // the Rank picker puts it away
    setMain(id,L,FREE); setRank(id,L,4);
    ok(L.main!==FREE&&L.pocket2===null&&!!VIBES[L.main],id+': the Rank picker at 4 puts Casual Mode away: main '+L.main);
  }

  // ---------- 4. It earns no Vibe Points ----------
  for(const id of IDS) {
    const L=newL(id,RANK5); setMain(id,L,FREE); const before=J(L.vp),r=award(id,L,90);
    ok(J(L.vp)===before&&!Object.keys(r.gains).length&&r.lost>0&&!r.ranks.length,id+': 90 VP into Casual Mode go nowhere (all lost), no Vibe moves');
  }
  { const un=newL('tom',3); ok(!open('tom',un)&&J(award('tom',un,30).gains)!=='{}','a member who is not done still earns normally'); }

  // ---------- 5. Whole fights with everyone in Casual Mode, four to a party ----------
  { const parties=[['tom','grace','rose','deedee'],['amy','justin','olivia','nara'],['tnb','boppy','tom','amy']];
    for(const party of parties) {
      const loadouts={}; for(const id of party) { const L=newL(id,RANK5); setMain(id,L,FREE); loadouts[id]=L; }
      const F=NF({party,loadouts,level:5,formation:'mudling',seed:3});
      ok(F.party.every(u=>u.vibe===FREE&&u.lean===null&&u.traits.length===3&&u.pocket&&u.pocket2),party.join()+': the units carry Casual Mode, three Traits, two Pocket Vibes, no Lean');
      ok(F.party.every(u=>!u.mods.some(m=>m.kind==='lean')),party.join()+': no Lean mod is put on a Freelancer');
      const u0=F.party[0],O=options(F,u0,SK[u0.basic]).filter(o=>!o.no); ok(O.length>0,party[0]+': the chosen Basic can be aimed');
      let msg='ok'; try { const r=play({party,loadouts,formation:'mudling',level:5,seed:4},false,{}); if(!['win','lose'].includes(r.result)) msg='no end: '+r.result; } catch(e) { msg=e.message; }
      ok(msg==='ok',party.join()+': a whole fight plays through in Casual Mode: '+msg); }
    // the Basic really is the one picked
    const L=newL('grace',RANK5); setMain('grace',L,FREE); const other=basics('grace').find(b=>b!==L.basic); setBasic('grace',L,other);
    const F=NF({party:['grace','tom','rose','deedee'],loadouts:{grace:L},level:5,formation:'mudling',seed:2}); ok(F.party[0].basic===other&&F.party[0].skills.every(s=>s!==other||true),'Grace fights with the Basic that was picked: '+other);
  }

  // ---------- 6. Saves ----------
  for(const id of IDS) {
    const old={main:CAST[id].vibes[0],pocket:CAST[id].vibes[1],quirks:[null,null],vp:{}}; for(const v of CAST[id].vibes) old.vp[v]=60;   // a save from before stage 21: no pocket2, no basic
    const L=fix(id,old); ok(L.pocket2===null&&L.basic===null&&L.main===old.main,id+': a save with no pocket2 or basic loads as it was');
    const lie={main:FREE,pocket:CAST[id].vibes[0],pocket2:CAST[id].vibes[1],basic:basics(id)[0],quirks:[null,null],vp:Object.assign({},old.vp)};
    const L2=fix(id,lie); ok(L2.main!==FREE&&L2.pocket2===null&&L2.basic===null&&!!VIBES[L2.main],id+': a saved Casual Mode whose Vibes are not mastered is put away on load');
    const done=Object.assign({},lie,{vp:Object.fromEntries(CAST[id].vibes.map(v=>[v,G('b3MasterVp')()]))});
    const L3=fix(id,done); ok(L3.main===FREE&&L3.pocket===lie.pocket&&L3.pocket2===lie.pocket2&&L3.basic===lie.basic,id+': a saved Casual Mode with every Vibe mastered loads as saved');
    const bad=Object.assign({},done,{pocket2:done.pocket,basic:'nope'}); const L4=fix(id,bad);
    ok(L4.main===FREE&&L4.pocket2!==L4.pocket&&basics(id).includes(L4.basic),id+': two equal Pocket slots and an unknown Basic are repaired');
  }

  // ---------- 7. The Stampcard, Polish Points and Remix Tickets are gone from what Battle 3 runs on ----------
  { const ROOT=path.dirname(__dirname),files=fs.readdirSync(path.join(ROOT,'engine')).filter(f=>/^b3-.*\.js$/.test(f)).map(f=>'engine/'+f)
      .concat(fs.readdirSync(path.join(ROOT,'data')).filter(f=>/^b3-.*\.js$/.test(f)).map(f=>'data/'+f));
    const BAD=/b6Stampable|b6SpLeft|b8PpLeft|b8TkLeft|b8Polish|b8UnlockRemix|b8LevelRewards|b2GainFor|b6AutoStamp|b8Equip|\.remix\b|\.stamps\b|B8_SLOTS/;
    const hits=[]; for(const f of files) { const t=fs.readFileSync(path.join(ROOT,f),'utf8').split('\n'); t.forEach((ln,i)=>{ if(BAD.test(ln)&&!/^\s*\/\//.test(ln)) hits.push(f+':'+(i+1)+' '+ln.trim().slice(0,90)); }); }
    ok(!hits.length,'no Stampcard, Polish Point or Remix Ticket code in the Battle 3 files: '+J(hits));
    const prog=fs.readFileSync(path.join(ROOT,'engine/progress.js'),'utf8');
    ok(/const b6CardOn=\(\)=>/.test(prog)&&/roseAuto\(\)&&b6CardOn\(\)/.test(prog),'Rose Mode\'s automatic Stamp Points and the menu\'s Stamp dot stand down while a chapter runs on Battle 3'); }
};
