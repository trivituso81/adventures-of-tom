// tools/b3-check-s10.js — Battle 3 rule tests for stage 10: Amy (Fitness Queen, Classroom Boss), Justin (Basement Boss, Live Wire),
// Olivia (Rope Champ, Working Mom). 42 kit lines. New pieces it covers: the `either` target (Baby-Wipe Swipe), a Skill's `hitsBy` (Cadence),
// the `refresh` and `prybar` ops, a grant that allows a Basic, `needCounter`, `perCounter`, the `counterFull`, `mix` and `foeDoubleTurn` hooks,
// the listener conditions added for them, the `trueAim`, `guaranteeCrit`, `noAoe`, `noPassives` and `paceRun` status flags, `hits` wear-down,
// mod conditions (skillFlavor, oncePerRound, supportSkill, tagsAny), `per:{buffs}` and the `critDmg` stat, and `next` pulls.
// `node tools/b3-sim.js check` runs it after the file for stage 9c.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),act=G('b3Act'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),VIBES=G('B3_VIBES'),TRAITS=G('B3_TRAITS'),QUIRKS=G('B3_QUIRKS'),SOON=G('B3_SOON'),
    add=G('b3AddStatus'),stat=G('b3Stat'),newL=G('b3NewLoadout'),setMain=G('b3SetMain'),setQuirk=G('b3SetQuirk'),ladder=G('b3Ladder'),blank=G('b3CheckData'),
    options=G('b3Options'),CAST=G('B3_CAST'),CUSTOM=G('B3_CUSTOM'),OPS=G('B3_OPS'),RULES=G('B3_RULES'),mods=G('b3Mods'),moveRec=G('b3MoveRec'),waitFor=G('b3WaitFor'),
    fire=G('b3Fire'),beginTurn=G('b3BeginTurn'),hit=G('b3Hit'),addShield=G('b3AddShield'),hasFlag=G('b3HasFlag'),grantSkills=G('b3GrantSkills'),
    actOk=G('b3ActOk'),queueCounters=G('b3QueueCounters'),roundStart=G('b3RoundStart'),endSt=G('b3EndStatus'),hitsOf=G('b3HitsOf'),sumOf=G('b3Sum'),
    carried=G('b3Carried'),J=x=>JSON.stringify(x);
  const SIX=['amy_fitness','amy_classroom','justin_basement','justin_wire','olivia_rope','olivia_mom'];
  const PARTY=['tom','amy','justin','olivia'];
  const bad0=J(blank().filter(x=>!/\bt_/.test(x)));
  // spec: {<member>: {main:'<vibe id>', quirks:[...]}}. Everything at Rank 5. Monsters are neutral punch bags unless a test says otherwise.
  const mk=(spec,formation,party)=>{
    const P=party||PARTY,loadouts={};
    for(const id of P) { const L=newL(id,5),s=(spec||{})[id]||{}; if(s.main) setMain(id,L,s.main);
      (s.quirks||[]).forEach((q,i)=>{ if(!setQuirk(id,L,i,q)) throw new Error('quirk not set: '+q); }); loadouts[id]=L; }
    const F=NF(Object.assign({party:P,level:2,seed:5,rank:5,loadouts},Array.isArray(formation)?{foes:formation}:{formation:formation||'mudling'}));
    for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; f.def=1; }
    for(const p of F.party) p.hp=p.maxHp=Math.max(p.maxHp,400);
    const U={}; for(const p of F.party) U[p.id]=p;
    return {F,U,f0:F.foes[0],f1:F.foes[1],tom:U.tom,amy:U.amy,justin:U.justin,olivia:U.olivia}; };
  const G0=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const go=G0;
  const lost=(u,fn)=>{ const h=u.hp; fn(); return h-u.hp; };

  // ---------- 1. All six Vibes are complete, plain and clean ----------
  for(const v of SIX) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un));
    ok(!VIBES[v].skills.some(s=>SOON[s])&&!VIBES[v].quirks.some(q=>QUIRKS[q].soon)&&!TRAITS[VIBES[v].trait].soon,v+': nothing is still a name only');
    for(const s of [VIBES[v].basic,...VIBES[v].skills]) ok(SK[s].desc&&SK[s].desc.length>40&&!/—/.test(SK[s].desc),s+' has a full plain description');
    for(const q of [TRAITS[VIBES[v].trait],...VIBES[v].quirks.map(x=>QUIRKS[x])]) ok(q.desc&&q.desc.length>30&&!/—/.test(q.desc+q.name),q.id+' has a full plain description'); }
  ok(bad0==='[]','the data check is clean with Amy, Justin and Olivia in: '+bad0);
  ok(J(CAST.amy.vibes.slice(0,2))==='["amy_fitness","amy_classroom"]'&&J(CAST.justin.vibes.slice(0,2))==='["justin_basement","justin_wire"]'&&J(CAST.olivia.vibes.slice(0,2))==='["olivia_rope","olivia_mom"]','the three are in the cast with their two Sig Vibes');
  ok(!CAST.amy.late&&!CAST.justin.late&&!CAST.olivia.late,'none of the three is a late joiner');
  ok(['refresh','prybar'].every(k=>typeof OPS[k]==='function'),'the two new ops are built');
  ok(typeof CUSTOM.muscleMemory==='string','Muscle Memory is a one-off switch');
  ok(Object.keys(SK).filter(k=>SIX.includes(SK[k].vibe)).length===SIX.length*4,'24 Skill rows (4 per Vibe) exist for the six Vibes');

  // ---------- 2. Amy: Fitness Queen ----------
  const FQ={amy:{main:'amy_fitness',quirks:['walk_it_off_hydrate','active_recovery']}};
  noCrit(()=>{ const {F,amy,f0}=mk(FQ);
    ok(moveRec(F,amy,SK.kettlebell_swing)===60,'Kettlebell Swing leaves Amy waiting a Base Recovery of 60, not 80: '+moveRec(F,amy,SK.kettlebell_swing));
    go(F,amy,'kettlebell_swing','f0'); ok(amy.counters.reps===1,'Kettlebell Swing builds exactly 1 Rep (its own +1 is the same Rep the Trait would give): '+amy.counters.reps);
    amy.pep=6; go(F,amy,'burpee_blitz','f0'); ok(amy.counters.reps===2,'a Skill builds 1 Rep when the action ends: '+amy.counters.reps);
    ok(!F.grant,'Burpee Blitz with fewer than 3 Reps gives no mini-turn'); });
  noCrit(()=>{ const {F,amy}=mk(FQ),M=G('b3Mods');
    amy.counters.reps=4; const sp=M(amy,'spd'),out=M(amy,'out',{fl:'clobber'}),outR=M(amy,'out',{fl:'razzle'});
    near(sp.reps,.20,.0001,'4 Reps are +20% Speed (5% each): '+sp.reps); near(out.reps,.20,.0001,'and +20% Clobber damage: '+out.reps); ok(!outR.reps,'but not on a Razzle hit');
    amy.counters.reps=9; amy.counters.reps=Math.min(4,amy.counters.reps);
    const L=CAST.amy&&VIBES.amy_fitness.counter; ok(L.max===4,'Reps are capped at 4'); });
  noCrit(()=>{ const {F,amy,tom,f0}=mk(FQ); amy.counters.reps=3; amy.pep=6; amy.hp=amy.maxHp*.5; const hp0=amy.hp,pep0=amy.pep;
    go(F,amy,'burpee_blitz','f0');
    ok(F.grant&&F.grant.key===amy.key&&F.grant.basic&&F.grant.maxPep===2&&!F.grant.free,'Burpee Blitz at 3 Reps opens a paid mini-turn for Amy: a Basic or a Skill of 2 Pep or less: '+J(F.grant));
    const gs=grantSkills(F,amy,F.grant).map(s=>s.id); ok(gs.includes('kettlebell_swing')&&gs.includes('burpee_blitz')&&!gs.includes('follow_along_finale_burnout')&&!gs.includes('pace_partner_run'),'the mini-turn offers the Basic and 2-Pep Skills, no Capstone, nothing dearer: '+J(gs));
    ok(amy.counters.reps===4,'the action also built the 4th Rep');
    ok(amy.hp>hp0&&amy.pep>=pep0-2+1,'reaching 4 Reps healed Amy and gave 1 Pep (Walk It Off, Hydrate): hp '+hp0+' to '+amy.hp+', pep '+pep0+' to '+amy.pep);
    const wait0=amy.wait; go(F,amy,'kettlebell_swing','f0'); ok(amy.wait===wait0,'the mini-turn does not change Amy’s wait'); ok(!F.grant,'the door is closed after it');
    amy.pep=6; roundStart(F,[]); amy.counters.reps=3; go(F,amy,'burpee_blitz','f0'); ok(F.grant,'a new round gives a new mini-turn');
    F.grant=null; amy.counters.reps=3; amy.pep=6; go(F,amy,'burpee_blitz','f0'); ok(!F.grant,'only one mini-turn a round: '+J(F.grant)); });
  noCrit(()=>{ const {F,amy,tom}=mk(FQ); amy.pep=6; amy.hp=amy.maxHp*.5; const hp0=amy.hp;
    amy.turns=3; const hh=[]; fire(F,'turnStart',{src:amy,tgt:amy,g:'pre'},hh); ok(amy.hp>hp0,'at the start of every 3rd turn Amy heals (Walk It Off, Hydrate): '+hp0+' to '+amy.hp);
    const h1=amy.hp; amy.turns=4; fire(F,'turnStart',{src:amy,tgt:amy,g:'pre'},[]); ok(amy.hp===h1,'but not on the 4th'); });
  noCrit(()=>{ const {F,amy,tom}=mk(FQ),sp0=stat(tom,'spd'); tom.spd=50; const amySpd=stat(amy,'spd'); amy.pep=6;
    go(F,amy,'pace_partner_run',tom.key); near(stat(tom,'spd'),amySpd,.0001,'Pace-Partner Run raises Tom’s Speed to Amy’s as it was when she called it: '+stat(tom,'spd')+' vs '+amySpd);
    tom.spd=500; ok(stat(tom,'spd')===500,'it never lowers a faster family member');
    ok(tom.st.pace_run&&tom.st.pace_run.n===2,'it lasts 2 turns'); });
  noCrit(()=>{ const {F,amy,tom,justin,f0}=mk(FQ); amy.counters.reps=3; amy.pep=8; addShield(F,f0,200,{src:tom});
    const sh0=f0.shields.reduce((x,y)=>x+y.amt,0); go(F,amy,'follow_along_finale_burnout','*');
    ok(f0.shields.reduce((x,y)=>x+y.amt,0)===sh0,'Follow-Along Finale Burnout goes through shields: '+sh0);
    ok(amy.counters.reps===1,'the 3 Reps were spent (the action then built 1 more): '+amy.counters.reps);
    ok(F.party.every(p=>p.st.finale_pace&&p.st.finale_pace.n===2),'the whole family has Finale Pace for 2 turns');
    near(moveRec(F,tom,SK.lounge_pass_flex),RULES.recovery.basic*.8,.0001,'and waits 20% less after each move: '+moveRec(F,tom,SK.lounge_pass_flex)); });
  noCrit(()=>{ const a=mk(FQ),b=mk(FQ); a.amy.pep=8; b.amy.pep=8; a.amy.counters.reps=0; b.amy.counters.reps=3;
    const da=lost(a.f0,()=>go(a.F,a.amy,'follow_along_finale_burnout','*')),db=lost(b.f0,()=>go(b.F,b.amy,'follow_along_finale_burnout','*'));
    ok(db>da*1.5,'each Rep adds damage to the Capstone: 0 Reps '+da+', 3 Reps '+db); });
  noCrit(()=>{ const {F,amy}=mk(FQ),base=RULES.recovery.s1,r1=moveRec(F,amy,SK.burpee_blitz);
    near(r1,base*.6,.0001,'Active Recovery: a Skill of 2 Pep or less waits 40% less: '+r1+' vs '+base);
    near(moveRec(F,amy,SK.pace_partner_run),RULES.recovery.s2,.0001,'a 3-Pep Skill is not touched');
    amy.pep=6; go(F,amy,'burpee_blitz','f0'); near(moveRec(F,amy,SK.burpee_blitz),base,.0001,'it counts once a round: the second 2-Pep Skill that round waits the full time');
    roundStart(F,[]); near(moveRec(F,amy,SK.burpee_blitz),base*.6,.0001,'and again in the next round'); });

  // ---------- 3. Amy: Classroom Boss ----------
  const CB={amy:{main:'amy_classroom',quirks:['good_try_margin_note','never_late_once']}};
  noCrit(()=>{ const {F,amy,f0}=mk(CB,'bigone'); F.turnLog=['f0']; beginTurn(F,f0,[]);
    ok(f0.st.detention&&f0.st.detention.n===2,'a monster that acts twice before the family acts gets Detention for 2 turns');
    near(stat(f0,'atk')/f0.atk,.8,.0001,'Detention is 20% less Attack: '+stat(f0,'atk')/f0.atk);
    const m=mk(CB,'bigone'); m.F.turnLog=['f0','p1']; beginTurn(m.F,m.f0,[]); ok(!m.f0.st.detention,'no Detention when a family member acted in between');
    const k=mk(CB,'mudling'); k.F.turnLog=['f0','f1']; beginTurn(k.F,k.f0,[]); ok(!!k.f0.st.detention,'another monster in between does not break it: the family still has not acted');
    const q=mk(CB,'bigone'); beginTurn(q.F,q.f0,[]); ok(!q.f0.st.detention,'a monster’s first turn gets none'); });
  noCrit(()=>{ const {F,amy,f0}=mk(CB); add(F,f0,'jitterflight',{src:f0}); add(F,f0,'giddyup',{src:f0}); amy.pep=6;
    go(F,amy,'eyes_on_me_clap','f0'); ok(!f0.st.jitterflight&&f0.st.giddyup,'Eyes On Me Clap rips off 1 Speed or Evasion buff and leaves an Attack buff: '+J(Object.keys(f0.st))); });
  noCrit(()=>{ const {F,amy,justin,f0,tom}=mk(CB,'bigone'); f0.pips=f0.maxPips=6; amy.pep=6; for(const p of F.party) p.pep=3;
    go(F,amy,'four_tab_binder','f0'); ok(f0.st.binder&&f0.st.binder.n===2,'Four-Tab Binder marks the monster for 2 of its turns');
    const pips0=f0.pips; const b=go(F,justin,'stud_finder_beep_and_knock','f0');
    ok(f0.pips===pips0-1&&!f0.st.binder,'two family members, two flavors in one round: it loses 1 pip and the Binder is used up: '+pips0+' to '+f0.pips);
    ok(F.party.filter(p=>p!==amy&&p!==justin).every(p=>p.pep>=4),'and the family gains 1 Pep: '+F.party.map(p=>p.pep).join()); });
  noCrit(()=>{ const {F,amy,justin,f0}=mk(CB,'bigone'); f0.pips=f0.maxPips=6; amy.pep=6; f0.peeves=['clobber'];
    go(F,amy,'four_tab_binder','f0'); const b=go(F,justin,'stud_finder_beep_and_knock','f0'); const pp=b.filter(x=>x.t==='pips'&&x.tgt==='f0');
    ok(pp.length&&pp.reduce((s,x)=>s+x.n,0)===3,'a Pet Peeve hit in the Mix makes the Binder worth 2 (plus the Peeve pip, 3 in all): '+J(pp.map(x=>x.n))); });
  noCrit(()=>{ const {F,tom,amy,f0}=mk(CB); amy.pep=6; go(F,amy,'gold_star_sticker',tom.key);
    ok(tom.st.gold_star&&tom.st.gold_star.n===2,'Gold-Star Sticker lasts 2 turns');
    near(mods(tom,'out',{fl:'clobber'}).goldStar,.35,.0001,'+35% damage'); near(mods(tom,'healGiven').goldStar,.35,.0001,'+35% healing and shields given');
    ok(hasFlag(tom,'trueAim'),'and its hits cannot miss');
    const miss=(star)=>{ const m=mk(CB); m.f0.mods.push({stat:'eva',kind:'t',v:.6}); if(star) add(m.F,m.tom,'gold_star',{src:m.amy}); let n=0;
      for(let i=0;i<40;i++) { m.tom.pep=6; if(star) add(m.F,m.tom,'gold_star',{src:m.amy}); const b=go(m.F,m.tom,'lounge_pass_flex','f0'); n+=b.filter(x=>x.t==='miss').length; m.tom.wait=0; } return n; };
    const m0=miss(false),m1=miss(true); ok(m0>5&&m1===0,'against 60% Evasion: '+m0+' misses without the star, '+m1+' with it');
    const m=mk(CB); add(m.F,m.tom,'gold_star',{src:m.amy}); add(m.F,m.tom,'blind',{src:m.f0}); const b=go(m.F,m.tom,'lounge_pass_flex','f0'); ok(b.some(x=>x.t==='miss'&&x.why==='blind'),'a Blind still makes the next hit miss'); });
  noCrit(()=>{ const {F,amy,justin,f0}=mk(CB,'bigone'); f0.pips=f0.maxPips=1; add(F,f0,'detention',{src:amy}); f0.peeves=['clobber']; justin.hp=justin.maxHp*.5; justin.pep=2; const h0=justin.hp;
    go(F,justin,'stud_finder_beep_and_knock','f0'); const heal=justin.hp-h0;
    near(heal,Math.round(justin.maxHp*.15*G('b3Mult')(amy,'healGiven')),2,'breaking a monster that has one of Amy’s debuffs heals the breaker 15% (Amy’s Support Lean makes it bigger): +'+heal);
    ok(justin.pep>=3,'and gives them 1 Pep: '+justin.pep);
    const o=mk(CB,'bigone'); o.f0.pips=o.f0.maxPips=1; o.f0.peeves=['clobber']; o.justin.hp=o.justin.maxHp*.5; const h1=o.justin.hp; go(o.F,o.justin,'stud_finder_beep_and_knock','f0');
    ok(o.justin.hp===h1,'no heal when the monster had no debuff of Amy’s (Flustered is not one)'); });
  noCrit(()=>{ const {F,amy,tom}=mk(CB); amy.pep=6; tom.wait=100; go(F,amy,'gold_star_sticker',tom.key);
    ok(tom.wait===85,'Never Late Once: a buff Amy gives pulls the family member 15 ticks up the bar: '+tom.wait); });
  noCrit(()=>{ const {F,amy,tom}=mk(CB,'toad'); const toad=F.foes[0],A=toad.D.acts.find(x=>x.hits==='all'||x.tags.includes('aoe'));
    amy.pep=8; add(F,tom,'kiln_glow',{src:amy}); tom.st.kiln_glow.n=1;
    if(A) { toad.charge=A.tags.includes('charge_up')?A:null; ok(actOk(F,toad,A),'the Bog Toad can use its sweep before the Lights-Out Reset'); }
    go(F,amy,'classroom_lights_out_reset','*');
    ok(F.foes.every(f=>f.st.lights_out&&f.st.lights_out.n===1),'every monster gets Lights Out for 1 turn');
    if(A) ok(!actOk(F,toad,A),'and cannot use an attack on the whole family: '+A.id);
    ok(!toad.charge,'a wound-up whole-family act is lost');
    ok(tom.st.kiln_glow.n===2,'every buff on the family is set back to its full length: '+tom.st.kiln_glow.n); });

  // ---------- 4. Justin: Basement Boss ----------
  const JB={justin:{main:'justin_basement',quirks:['measure_twice_cut_once','store_bought_bread_peace_offering']}};
  // A monster's hit on one family member (tags say what kind of act it was): returns the damage taken.
  const foeHit=(F,f,t,tags,flavor)=>{ const c={F,actor:f,src:f,skill:{flavor:[flavor||'clobber'],power:'standard',hits:1,target:'foe',effects:[],slot:'s1'},targets:[t],hit:[],beats:[],g:'pre',detonated:{},reacted:{},tags,ledger:{}};
    const h=t.hp; hit(F,c,t,1,[flavor||'clobber'],{},true); return h-t.hp; };
  noCrit(()=>{ const {F,justin}=mk(JB),base=RULES.recovery.basic;
    near(moveRec(F,justin,SK.stud_finder_beep_and_knock),base*1.15,.0001,'Load-Bearing Swing: a Clobber move waits 15% longer: '+moveRec(F,justin,SK.stud_finder_beep_and_knock));
    near(moveRec(F,justin,SK.voltage_tester_poke),base,.0001,'a Razzle move does not'); });
  noCrit(()=>{ const {F,justin,f0}=mk(JB,'bigone'); f0.pips=f0.maxPips=6; addShield(F,f0,100,{src:justin});
    go(F,justin,'stud_finder_beep_and_knock','f0'); ok(f0.pips===5,'a Clobber hit on a shielded monster knocks 1 extra pip off: '+f0.pips);
    go(F,justin,'stud_finder_beep_and_knock','f0'); ok(f0.pips===5,'a monster with no shield and a low Defense takes no extra pip: '+f0.pips);
    addShield(F,f0,100,{src:justin}); go(F,justin,'stud_finder_beep_and_knock','f0'); ok(f0.pips===5,'once a round: the second shielded hit in the same round adds none: '+f0.pips);
    roundStart(F,[]); addShield(F,f0,100,{src:justin}); go(F,justin,'stud_finder_beep_and_knock','f0'); ok(f0.pips===4,'but the next round it does again: '+f0.pips);
    const g=mk(JB,'bigone'); g.f0.pips=g.f0.maxPips=6; g.f0.def=999; go(g.F,g.justin,'stud_finder_beep_and_knock','f0'); ok(g.f0.pips===5,'a monster with at least Justin\u2019s Defense counts too: '+g.f0.pips); });
  noCrit(()=>{ const a=mk(JB),b=mk(JB); go(a.F,a.justin,'stud_finder_beep_and_knock','f0'); ok(a.f0.st.knocked_loose&&a.f0.st.knocked_loose.n===1,'Stud-Finder Beep & Knock leaves the monster Knocked Loose for 1 turn');
    add(b.F,b.f0,'knocked_loose',{src:b.justin}); const d0=lost(a.f1,()=>go(a.F,a.justin,'stud_finder_beep_and_knock','f1')),d1=lost(b.f0,()=>go(b.F,b.justin,'stud_finder_beep_and_knock','f0'));
    near(d1/d0,1.15,.04,'it takes 15% more Clobber damage: '+d0+' vs '+d1); });
  noCrit(()=>{ const {F,justin,f0,f1}=mk(JB); justin.pep=8; addShield(F,f0,100,{src:justin}); const p0=justin.pep;
    const d=lost(f1,()=>go(F,justin,'demo_day_prybar','f0'));
    ok(f0.shields.length===0,'Demo-Day Prybar rips the shield off'); near(d,100,1.5,'and its 100 blasts into the monster next to it as splash: '+d);
    ok(justin.st.bread_peace&&justin.pep===p0-3+1,'the broken shield gives Justin Peace Offering and 1 Pep (Store-Bought Bread): pep '+p0+' to '+justin.pep);
    addShield(F,f0,100,{src:justin}); const p1=justin.pep; go(F,justin,'demo_day_prybar','f0'); ok(justin.pep===p1-3,'once a round: a second broken shield that round gives no Pep: '+justin.pep); });
  noCrit(()=>{ const a=mk(JB),b=mk(JB),c=mk(JB); a.justin.pep=8; b.justin.pep=8; c.justin.pep=8; add(a.F,a.f0,'guard_stance',{src:a.f0});
    const da=lost(a.f0,()=>go(a.F,a.justin,'demo_day_prybar','f0')),db=lost(b.f0,()=>go(b.F,b.justin,'demo_day_prybar','f0')),sp=lost(a.f1,()=>0);
    ok(!a.f0.st.guard_stance,'it rips a Guard Stance off too'); near(da,db,1,'so the hit is a plain standard hit, not softened: '+da+' vs '+db);
    near(a.f1.maxHp-a.f1.hp,Math.round(da*.25),1.5,'and a stance blasts 25% of the hit into its neighbour: '+(a.f1.maxHp-a.f1.hp)+' vs '+Math.round(da*.25));
    ok(b.f1.hp===b.f1.maxHp,'with no barrier there is no blast'); });
  noCrit(()=>{ const a=mk(JB),b=mk(JB); a.justin.pep=8; b.justin.pep=8; go(a.F,a.justin,'hang_fresh_drywall','*'); go(b.F,b.justin,'hang_fresh_drywall','*');
    ok(a.amy.st.drywall&&a.olivia.st.drywall&&!a.tom.st.drywall&&!a.justin.st.drywall,'Hang Fresh Drywall goes on the 2 family members next to Justin only');
    const fresh=mk(JB),base=foeHit(fresh.F,fresh.f0,fresh.amy,['melee']);
    const h1=foeHit(a.F,a.f0,a.amy,['melee']),h2=foeHit(a.F,a.f0,a.amy,['projectile']),h3=foeHit(a.F,a.f0,a.amy,['melee']);
    near(h1,base/2,1,'the wall halves the next melee hit: '+base+' to '+h1); near(h2,base/2,1,'and the next thrown hit: '+h2); ok(!a.amy.st.drywall&&h3>=base-1,'then it is gone: '+h3);
    const w=foeHit(b.F,b.f0,b.amy,['aoe']); ok(w>=base-1&&b.amy.st.drywall,'a hit on the whole family does not count: '+w); });
  noCrit(()=>{ const {F,justin,f0}=mk(JB); justin.pep=8; ok(!justin.st.squared_up,'no sure crit to begin with');
    go(F,justin,'stud_finder_beep_and_knock','f0'); ok(!justin.st.squared_up,'a Basic is not a Support turn');
    go(F,justin,'hang_fresh_drywall','*'); ok(justin.st.squared_up,'a turn on a Support Skill squares up Justin\u2019s aim (Measure Twice, Cut Once)');
    const b=go(F,justin,'stud_finder_beep_and_knock','f0'); ok(b.some(x=>x.t==='hit'&&x.crit),'his next Clobber hit is a sure crit'); ok(!justin.st.squared_up,'and that uses it up');
    const b2=go(F,justin,'stud_finder_beep_and_knock','f0'); ok(!b2.some(x=>x.t==='hit'&&x.crit),'the one after is not'); });
  noCrit(()=>{ const a=mk(JB),b=mk(JB); a.justin.pep=8; b.justin.pep=8; add(b.F,b.f0,'flustered',{src:b.justin});
    const da=lost(a.f0,()=>go(a.F,a.justin,'dropped_screw_toolbox_punt','f0')),db=lost(b.f0,()=>go(b.F,b.justin,'dropped_screw_toolbox_punt','f0'));
    near(db/da,2.7,.12,'Toolbox Punt does double damage to a Flustered monster (on top of its own 35%): '+da+' vs '+db);
    near(a.f0.crack,.15,.0001,'it cracks 15% of the monster\u2019s Defense'); a.justin.pep=8; go(a.F,a.justin,'dropped_screw_toolbox_punt','f0'); near(a.f0.crack,.15,.0001,'only once per monster: '+a.f0.crack); });

  // ---------- 5. Justin: Live Wire ----------
  const LW={justin:{main:'justin_wire',quirks:['rubber_soled_workboots','rare_heart_emoji_text']}};
  noCrit(()=>{ const {F,justin,f0,f1}=mk(LW);
    go(F,justin,'voltage_tester_poke','f0'); ok(f0.st.dazzled,'Voltage-Tester Poke leaves the monster Dazzled'); ok(f0.st.wired&&f0.st.wired.n===2,'and a Dazzled monster Justin hits becomes Wired for 2 turns (the Dazzle this hit set counts)');
    ok(f1.hp===f1.maxHp,'no arc on the hit that made it Wired');
    const d0=lost(f0,()=>0); const h=f0.hp,k=f1.hp; go(F,justin,'voltage_tester_poke','f0'); const dealt=h-f0.hp,arc=k-f1.hp;
    near(arc,dealt*.3,1.5,'hitting a Wired monster arcs 30% of the damage to the other monster: '+dealt+' dealt, '+arc+' arced');
    const g=mk(LW); add(g.F,g.f0,'drenched',{src:g.tom}); go(g.F,g.justin,'voltage_tester_poke','f0'); ok(g.f0.st.wired,'a Drenched monster becomes Wired too (a Razzle hit also sets off Short Circuit!)'); });
  noCrit(()=>{ const {F,justin,tom,f0,f1}=mk(LW); for(const f of [f0,f1]) { f.maxPips=4; f.pips=4; } justin.pep=8;
    go(F,justin,'dont_touch_the_copper_banner','f0'); ok(f0.st.copper_link&&f1.st.copper_link&&f0.st.copper_link.n===2,'the Copper Banner is strung between the monster and the one next to it for 2 turns');
    f0.peeves=['racket']; const shave=()=>{ tom.pep=10; const a=f0.pips,b=f1.pips; go(F,tom,'lounge_pass_flex','f0'); return [a-f0.pips,b-f1.pips]; };
    const r1=shave(); ok(r1[0]>=1&&r1[1]===1,'a pip lost on one is lost on the other: lost '+r1[0]+' and '+r1[1]);
    const r2=shave(); ok(r2[0]>=1&&r2[1]===0,'once a round: the second shave that round does not link: lost '+r2[0]+' and '+r2[1]);
    roundStart(F,[]); const r3=shave(); ok(r3[0]>=1&&r3[1]===1,'and it links again the next round: lost '+r3[0]+' and '+r3[1]); });
  noCrit(()=>{ const {F,justin,f0}=mk(LW,'bigone'); f0.pips=f0.maxPips=6; justin.pep=8; const A=f0.D.acts.find(a=>a.tags.includes('charge_up')); if(A) f0.charge=A;
    go(F,justin,'main_breaker_flip','f0'); if(A) ok(!f0.charge,'Main Breaker Flip cancels a wound-up act');
    ok(f0.st.blackout&&f0.st.blackout.n===1,'and blacks the monster out for 1 turn'); ok(f0.pips<=5,'it knocks off a Composure pip: '+f0.pips);
    const t=mk(LW,'bigone'); t.f0.D=Object.assign({},t.f0.D,{acts:[{id:'zz',name:'ZZ',hits:'attacker',power:1,flavor:['clobber'],tags:[],effects:[],recovery:0}]});
    queueCounters(t.F,{reacted:{}},t.f0,t.tom); const n0=t.F.reactions.length; t.F.reactions.length=0; add(t.F,t.f0,'blackout',{src:t.justin}); queueCounters(t.F,{reacted:{}},t.f0,t.tom);
    ok(n0===1&&t.F.reactions.length===0,'a blacked-out monster\u2019s counter attacks do not answer: '+n0+' then '+t.F.reactions.length); });
  noCrit(()=>{ const {F,justin,f0}=mk(LW);
    near(mods(justin,'reduce',{fl:'razzle'}).boots,.30,.0001,'Rubber-Soled Workboots: 30% less Razzle damage'); near(mods(justin,'reduce',{fl:'sizzle'}).boots,.30,.0001,'and 30% less Sizzle'); ok(!mods(justin,'reduce',{fl:'clobber'}).boots,'but not Clobber');
    justin.pep=2; fire(F,'detonation',{src:justin,tgt:f0,id:'short_circuit',g:'pre'},[]); ok(justin.pep===3,'a Short Circuit! he sets off gives 1 Pep: '+justin.pep);
    fire(F,'detonation',{src:justin,tgt:f0,id:'panic_boil',g:'pre'},[]); ok(justin.pep===3,'no other Detonation does'); });
  noCrit(()=>{ const {F,justin,f0,f1,f2}=mk(LW,[{id:'mudling',row:'front'},{id:'mudling',row:'front'},{id:'mudling',row:'front'}]),f=F.foes; justin.pep=8;
    add(F,f[1],'wired',{src:justin}); const h0=f[0].hp; go(F,justin,'flashlight_block_rewire','f0'); const dealt=h0-f[0].hp,a1=f[1].maxHp-f[1].hp,a2=f[2].maxHp-f[2].hp;
    near(a1,dealt*.75,1.5,'Flashlight Block Rewire chains 75% to another monster that is Wired: '+dealt+' dealt, '+a1+' chained'); ok(a2===0,'and none to one that is neither Wired nor Drenched'); 
    const g=mk(LW,[{id:'mudling',row:'front'},{id:'mudling',row:'front'},{id:'mudling',row:'front'}]); add(g.F,g.F.foes[2],'drenched',{src:g.tom}); g.justin.pep=8;
    const x0=g.F.foes[0].hp; go(g.F,g.justin,'flashlight_block_rewire','f0'); ok(g.F.foes[2].maxHp-g.F.foes[2].hp>0,'a Drenched monster is chained too'); });
  noCrit(()=>{ const {F,justin,f0,f1}=mk(LW); f0.maxPips=3; f0.pips=1; f0.peeves=['razzle']; justin.pep=8;
    go(F,justin,'voltage_tester_poke','f0'); ok(justin.st.static_charge&&justin.st.static_charge.n===1,'Breaking a monster stores a Static Charge (Rare Heart-Emoji Text)');
    near(mods(justin,'out',{fl:'razzle'}).static,.40,.0001,'+40% Razzle damage'); ok(!mods(justin,'out',{fl:'clobber'}).static,'and only Razzle');
    const k=mk(LW); k.f1.hp=1; go(k.F,k.justin,'voltage_tester_poke','f1'); ok(k.f1.ko&&k.justin.st.static_charge,'knocking a monster out stores one too'); });

  // ---------- 6. Olivia: Rope Champ ----------
  const RC={olivia:{main:'olivia_rope',quirks:['muscle_memory','trophy_shelf_ego']}},RC0={olivia:{main:'olivia_rope',quirks:['trophy_shelf_ego']}};
  noCrit(()=>{ const {F,olivia,f0}=mk(RC0); const go=(F,u,sk,k)=>{ u.pep=10; return G0(F,u,sk,k); };
    go(F,olivia,'rusty_speed_rope_snap','f0'); ok(olivia.counters.cadence===1,'Rusty Speed-Rope Snap builds exactly 1 Cadence: '+olivia.counters.cadence);
    go(F,olivia,'criss_cross_double_under','f0'); ok(olivia.counters.cadence===2,'an attacking Skill builds 1: '+olivia.counters.cadence);
    go(F,olivia,'criss_cross_double_under','f0'); go(F,olivia,'criss_cross_double_under','f0'); ok(olivia.counters.cadence===3,'Cadence stops at 3: '+olivia.counters.cadence);
    go(F,olivia,'better_than_bobby_hype',olivia.key); ok(olivia.counters.cadence===3,'Hype builds Cadence and does not reset it');
    olivia.counters.cadence=1; go(F,olivia,'better_than_bobby_hype',olivia.key); ok(olivia.counters.cadence===2,'Hype builds 1: '+olivia.counters.cadence);
    go(F,olivia,'diaper_bag_snack_drop',olivia.key); ok(olivia.counters.cadence===0,'a turn on a Support Skill takes Cadence away (the reset travels with it, so it holds with Working Mom in the Pocket): '+olivia.counters.cadence); });
  noCrit(()=>{ const {F,olivia}=mk(RC); olivia.pep=10; olivia.counters.cadence=2; go(F,olivia,'diaper_bag_snack_drop',olivia.key); ok(olivia.counters.cadence===2,'Muscle Memory: a Support turn leaves Cadence where it is: '+olivia.counters.cadence); });
  noCrit(()=>{ const {F,olivia}=mk(RC0); olivia.counters.cadence=3; near(sumOf(olivia,'critDmg'),.30,.0001,'each Cadence rank is 10% more Crit Damage: '+sumOf(olivia,'critDmg')); });
  noCrit(()=>{ const sw=(c)=>{ const m=mk(RC0); m.olivia.pep=10; m.olivia.counters.cadence=c; const b=go(m.F,m.olivia,'criss_cross_double_under','f0'); return {n:b.filter(x=>x.t==='swing').length,dmg:b.filter(x=>x.t==='hit').reduce((s,x)=>s+x.dmg,0),act:b.find(x=>x.t==='act').hits}; };
    const a=sw(0),b=sw(1),c=sw(3); ok(a.n===2&&b.n===3&&c.n===5&&c.act===5,'Criss-Cross Double-Under is 2 hits plus 1 per Cadence rank, up to 5: '+a.n+', '+b.n+', '+c.n);
    near(c.dmg/a.dmg,1.45,.04,'each hit past the second adds 15% to the move\u2019s power: '+a.dmg+' vs '+c.dmg);
    const m=mk(RC0); m.olivia.pep=10; go(m.F,m.olivia,'criss_cross_double_under','f0'); ok(m.olivia.st.criss_cross&&near(sumOf(m.olivia,'eva'),.20,.0001,'+20% Evasion')!==false,'it leaves Criss-Cross on her (20% Evasion, 15% Attack)'); });
  noCrit(()=>{ const {F,olivia}=mk(RC0); olivia.pep=10; const rec=moveRec(F,olivia,SK.better_than_bobby_hype),exp=Math.max(0,waitFor(F,olivia,rec)-25);
    go(F,olivia,'better_than_bobby_hype',olivia.key); near(sumOf(olivia,'crit'),.30,.0001,'Hype gives 30% more Crit Rate'); near(olivia.wait,exp,.01,'and her next turn comes 25 ticks sooner: '+olivia.wait+' vs '+exp); });
  noCrit(()=>{ const sw=(c,buffs,f)=>{ const m=mk(RC0,'bigone'); m.olivia.pep=10; m.olivia.counters.cadence=c; m.f0.pips=m.f0.maxPips=6; for(const id of (buffs||[])) add(m.F,m.olivia,id,{src:m.olivia});
      const b=go(m.F,m.olivia,'regional_championship_freestyle','f0'); return {n:b.filter(x=>x.t==='swing').length,dmg:b.filter(x=>x.t==='hit').reduce((s,x)=>s+x.dmg,0),pips:m.f0.pips,cad:m.olivia.counters.cadence}; };
    const a=sw(0),c=sw(3),d=sw(0,['finale_pace','childproofed']);
    ok(a.n===4&&c.n===7,'Regional Championship Freestyle is 4 hits plus 1 per Cadence rank, up to 7: '+a.n+', '+c.n);
    ok(a.pips<=4,'the slam knocks 2 Composure pips off: '+a.pips); ok(c.cad===4-1+0||c.cad>=3,'Cadence is not spent');
    near(d.dmg/a.dmg,1.2,.04,'each buff Olivia has adds 10% damage: '+a.dmg+' vs '+d.dmg+' with 2 buffs'); });
  noCrit(()=>{ const {F,olivia}=mk(RC0); for(const id of ['giddyup','stress_melted']) add(F,olivia,id,{src:olivia}); near(mods(olivia,'out',{fl:'clobber'}).trophy,.16,.0001,'Trophy-Shelf Ego: 8% damage for each different buff: '+mods(olivia,'out',{fl:'clobber'}).trophy);
    for(const id of ['kiln_glow','criss_cross','gold_star','bread_peace']) add(F,olivia,id,{src:olivia}); near(mods(olivia,'out',{fl:'clobber'}).trophy,.32,.0001,'up to 4 buffs (+32%)'); });

  // ---------- 7. Olivia: Working Mom ----------
  const WM={olivia:{main:'olivia_mom',quirks:['nap_window_efficiency','childproofed_locks']}};
  noCrit(()=>{ const {F,olivia,tom}=mk(WM); olivia.pep=10; for(let i=0;i<4;i++) { go(F,olivia,'baby_wipe_swipe','f0'); }
    ok(olivia.counters.momprep===3,'Mom Prep builds 1 each turn Olivia takes, up to 3: '+olivia.counters.momprep); });
  noCrit(()=>{ const {F,olivia,tom,f0}=mk(WM); add(F,tom,'slow',{src:f0}); add(F,tom,'stun',{src:f0}); tom.hp=tom.maxHp*.5; const h0=tom.hp,b=go(F,olivia,'baby_wipe_swipe',tom.key);
    ok(!tom.st.slow&&tom.st.stun,'Baby-Wipe Swipe on a family member clears 1 minor debuff (Slow), not a heavy one (Stun): '+J(Object.keys(tom.st)));
    near(tom.hp-h0,Math.round(tom.maxHp*.10*G('b3Mult')(olivia,'healGiven')),1.5,'and heals 10% (bigger with her Support Lean): +'+(tom.hp-h0));
    ok(b.find(x=>x.t==='act').shape==='give','it plays as a give');
    const m=mk(WM),d=lost(m.f0,()=>go(m.F,m.olivia,'baby_wipe_swipe','f0')); ok(d>0&&m.f0.st.drenched,'on a monster it is a light Drench swat'); 
    const o=options(m.F,m.olivia,SK.baby_wipe_swipe); ok(o.length===m.F.foes.length+m.F.party.length&&o.filter(x=>x.ally).length===4,'it offers every monster and every family member, Olivia too: '+o.length); });
  noCrit(()=>{ const a=mk(WM),b=mk(WM); for(const m of [a,b]) { m.olivia.pep=10; for(const p of m.F.party) p.hp=p.maxHp*.4; } b.olivia.counters.momprep=3; b.tom.pep=0;
    const h0=a.tom.hp; go(a.F,a.olivia,'diaper_bag_snack_drop',a.olivia.key); const mult=G('b3Mult')(a.olivia,'healGiven'); near(a.tom.hp-h0,Math.round(400*.10*mult),1.5,'Diaper-Bag Snack Drop heals the family 10% with no Mom Prep: +'+(a.tom.hp-h0));
    const h1=b.tom.hp; go(b.F,b.olivia,'diaper_bag_snack_drop',b.olivia.key); near(b.tom.hp-h1,Math.round(400*.22*mult),1.5,'and 22% with 3 Mom Prep: +'+(b.tom.hp-h1));
    ok(b.olivia.counters.momprep===1,'the Mom Prep is spent (the turn that follows builds 1): '+b.olivia.counters.momprep); ok(b.tom.pep===1,'at 3 Mom Prep the family member with the least Pep gets 1: '+b.tom.pep);
    ok(a.tom.pep>=a.tom.pep&&!(a.F.party.some(p=>p!==a.olivia&&p.pep!==RULES.pep.start&&p.pep!==a.tom.pep)),'without it nobody gets the Pep'); });
  noCrit(()=>{ const {F,olivia,tom,f0}=mk(WM); olivia.pep=10; go(F,olivia,'cool_mist_humidifier',olivia.key);
    ok(F.party.every(p=>p.st.cool_mist&&p.st.cool_mist.n===2)&&F.foes.every(f=>f.st.drenched),'Cool-Mist Humidifier: the family is misted for 2 turns and every monster is Drenched');
    const M=r=>mods(tom,'reduce',r).coolMist||0; near(M({c:{tags:['projectile']}}),.25,.0001,'25% less from a thrown act'); near(M({c:{tags:['aoe']}}),.25,.0001,'and from an act on everyone'); ok(M({c:{tags:['melee']}})===0&&M({})===0,'but not from a melee hit'); });
  noCrit(()=>{ const a=mk(WM),b=mk({olivia:{main:'olivia_mom',quirks:['childproofed_locks']}}); const w=(m,S)=>moveRec(m.F,m.olivia,SK[S]);
    near(w(a,'diaper_bag_snack_drop')/w(b,'diaper_bag_snack_drop'),.8,.0001,'Nap-Window Efficiency: a Support Skill waits 20% less: '+w(a,'diaper_bag_snack_drop')+' vs '+w(b,'diaper_bag_snack_drop'));
    near(w(a,'michael_grab_the_kids')/w(b,'michael_grab_the_kids'),.8,.0001,'a Support Capstone too'); near(w(a,'baby_wipe_swipe')/w(b,'baby_wipe_swipe'),1,.0001,'but not a Basic'); near(w(a,'criss_cross_double_under')/w(b,'criss_cross_double_under'),1,.0001,'or a Skill that hits'); });
  noCrit(()=>{ const {F,olivia,tom,f0,f1}=mk(WM); olivia.pep=10; add(F,tom,'slow',{src:f0}); add(F,tom,'stun',{src:f0}); for(const p of F.party) p.hp=p.maxHp*.5; const w0=f0.wait,h0=tom.hp;
    go(F,olivia,'michael_grab_the_kids',olivia.key); ok(f0.wait>w0&&f1.wait>=0,'Michael, Grab the Kids! startles every monster back on the turn bar: '+w0+' to '+f0.wait);
    near(tom.hp-h0,Math.round(400*.15*G('b3Mult')(olivia,'healGiven')),1.5,'it heals the family 15%: +'+(tom.hp-h0)); ok(!tom.st.stun&&tom.st.slow,'and clears Stun, a Mental status, but not Slow'); });
  noCrit(()=>{ const {F,olivia,tom,f0}=mk(WM); olivia.pep=10; for(const p of F.party) p.hp=p.maxHp*.5; go(F,olivia,'diaper_bag_snack_drop',olivia.key);
    const L=F.party.filter(p=>p.st.childproofed); ok(L.length===1,'Childproofed Locks: a party-wide heal gives exactly 1 random family member Childproofed: '+L.length);
    const t=L[0],c={F,actor:f0,src:f0,targets:[t],hit:[],beats:[],g:'pre',tgt:t}; OPS.status(F,c,{id:'slow',to:'target'}); ok(!t.st.slow&&!t.st.childproofed,'it bounces the next debuff aimed at them and is used up');
    const m=mk(WM); m.olivia.pep=10; go(m.F,m.olivia,'cool_mist_humidifier',m.olivia.key); ok(m.F.party.filter(p=>p.st.childproofed).length===1,'a party-wide buff does it too, once'); });
  noCrit(()=>{ const {F,olivia,tom,f0}=mk(WM); F.ruckus=60; for(const u of F.units) u.wait=99; olivia.wait=0; tom.wait=1; F.acting=olivia;
    const P=G('b3RuckusPlan')(F,olivia,'double'); ok(P.ok&&P.foeOpts.length===F.foes.length,'Double Team with Baby-Wipe Swipe only offers monsters: '+P.why);
    const r=G('b3Ruckus')(F,olivia,'double','f0'); ok(r.ok&&r.beats.some(x=>x.t==='hit'),'and it hits a monster: '+(r.why||'')); });
};
