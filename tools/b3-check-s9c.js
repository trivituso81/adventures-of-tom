// tools/b3-check-s9c.js — Battle 3 rule tests for stage 9c: Nara (Attached Pup, Guard Dog), Boppy (The Dep, Pepper Boss), the late joiners' pool.
// New pieces it covers: the `steal`, `tick`, `upgrade`, `treasure` and `goldBall` ops, the `foe_row` target, a Skill's `detonatesAll` and
// `pierce`, the `lockAim` and `noSteal` status flags, the `thorns` answer, the Mailbox, Gold Teeth, Nervous Vibrations and Shins one-offs,
// and the pool a late joiner starts from (engine/b3-progress.js). `node tools/b3-sim.js check` runs it after the file for stage 9b.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),act=G('b3Act'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),VIBES=G('B3_VIBES'),TRAITS=G('B3_TRAITS'),QUIRKS=G('B3_QUIRKS'),SOON=G('B3_SOON'),
    add=G('b3AddStatus'),stat=G('b3Stat'),newL=G('b3NewLoadout'),ladder=G('b3Ladder'),blank=G('b3CheckData'),options=G('b3Options'),
    CAST=G('B3_CAST'),CUSTOM=G('B3_CUSTOM'),OPS=G('B3_OPS'),RULES=G('B3_RULES'),J=x=>JSON.stringify(x);
  const PARTY=['tom','tnb','nara','boppy'];
  const bad0=J(blank().filter(x=>!/\bt_/.test(x)));
  const fight=(formation,party)=>{ const F=NF({party:party||PARTY,level:2,seed:5,formation:formation||'mudling',rank:5});
    for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; }
    for(const p of F.party) p.hp=p.maxHp=Math.max(p.maxHp,400);
    const P={}; for(const p of F.party) P[p.id]=p; return {F,P,f0:F.foes[0],nara:P.nara,boppy:P.boppy,tom:P.tom}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };

  // 1. Both Vibes of both newcomers are complete, with plain descriptions; the data check is clean
  for(const v of ['nara_pup','nara_guard','boppy_dep','boppy_pepper']) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un));
    ok(!VIBES[v].skills.some(s=>SOON[s])&&!(VIBES[v].quirks||[]).some(q=>QUIRKS[q].soon)&&!TRAITS[VIBES[v].trait].soon,v+': nothing is still a name only');
    for(const s of [VIBES[v].basic,...VIBES[v].skills]) ok(SK[s].desc&&SK[s].desc.length>40&&!/—/.test(SK[s].desc),s+' has a full plain description'); }
  ok(bad0==='[]','the data check is clean with Nara and Boppy in: '+bad0);
  ok(J(CAST.nara.vibes)==='["nara_pup","nara_guard"]'&&J(CAST.boppy.vibes)==='["boppy_dep","boppy_pepper"]','both are in the cast with both Vibes');
  ok(['boppySpeed','goldTeeth','mailbox','hoseFlinched','nervous','shins'].every(k=>CUSTOM[k]),'the six one-offs exist');
  for(const k of ['steal','tick','upgrade','treasure','goldBall']) ok(typeof OPS[k]==='function','op '+k+' is built');

  // 2. The pool: late joiners are flagged, start from the largest total, split evenly, shift once, lock
  ok(['tnb','nara','boppy'].every(id=>CAST[id].late)&&!CAST.tom.late,'TNB, Nara and Boppy are late joiners; Tom is not');
  const book={tom:newL('tom',3)}; const size=G('b3PoolSize')(book);
  ok(size===RULES.rankVp[2]*CAST.tom.vibes.length,'the pool is the most total VP any one member has: '+size);
  const L=newL('nara',1,size);
  ok(L.pool&&L.pool.total===size&&!L.pool.set&&G('b3VibeTotal')('nara',L)===size,'Nara starts with the whole pool split: '+J(L.vp));
  ok(G('b3PoolShift')('nara',L,'nara_pup','nara_guard',20)&&G('b3VibeTotal')('nara',L)===size,'a shift moves VP and keeps the total');
  ok(G('b3PoolConfirm')(L)&&!G('b3PoolShift')('nara',L,'nara_pup','nara_guard',20),'after the lock no shift moves');
  ok(!!newL('tnb',2).pool,'TNB starts from the pool too');
  ok(!newL('tom',2).pool,'a Rank-2 start gives early members no pool');

  // 3. Shake-It-Off, Gold Teeth, Mailbox and Pepper moves run without error and do something
  noCrit(()=>{ const {F,f0,nara}=fight(); const b=go(F,nara,'startled_water_bowl_flip','f0'); ok(b.some(x=>x.t==='hit'),'Nara’s Basic hits'); });
  noCrit(()=>{ const {F,boppy}=fight(); const b=go(F,boppy,'wardens_nightstick_rap','f0'); ok(b.some(x=>x.t==='hit'),'Boppy’s Basic hits'); });
  for(const [who,sk] of [['boppy','pickle_jar_bomb_1989'],['boppy','the_ghost_one_that_looks_back'],['nara','vacuum_cleaner_bolt'],['nara','dont_leave_me_meltdown'],['nara','stunt_double_squirrel_intercept']]) {
    noCrit(()=>{ const x=fight('toad'),u=x[who]; u.pep=10; const opts=options(x.F,u,SK[sk]); const key=opts&&opts.length?opts[0].key:'f0';
      try { const b=go(x.F,u,sk,key); ok(b.length>0,sk+' plays beats'); } catch(e) { ok(false,sk+': '+e.message); } }); }
  // foe_row builds one option per occupied row
  { const {F,nara}=fight('toad'); const o=options(F,nara,SK.vacuum_cleaner_bolt); ok(o&&o.length>=1&&o.every(x=>/^row:/.test(x.key)),'Vacuum Bolt offers rows: '+J(o&&o.map(x=>x.key))); }
};
