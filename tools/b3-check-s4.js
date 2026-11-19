// tools/b3-check-s4.js — Battle 3 rule tests for stage 4: Ranks and Vibe Points, overflow, the loadout slots (Main Vibe, Pocket
// Vibe, two Quirks, the row), what a loadout gives a unit (Skills by Rank, the Basic and the Trait from the Main Vibe only),
// Stat Leans, Portable Counters, and the second Sig Vibes' first moves. `node tools/b3-sim.js check` runs it after stages 1 to 3.
// T is what tools/b3-sim.js hands over: G (reads a name out of the rules sandbox), ok(cond, what), near, play, noCrit.
// These groups use real loadouts (no cfg.plain).
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,foeTurn,U,RULES,SK,ST,CAST,VIBES,TRAITS,QUIRKS,SOON,add,opts,stat,mult,sum,
    rankOf,ladder,subtitle,newL,fixL,pool,setMain,setPocket,setQuirk,setRow,rowOf,setRank,award,awardAll,kit,skillsOf,auto]=
    ['b3NewFight','b3Next','b3Act','b3FoeTurn','b3Unit','B3_RULES','B3_SKILLS','B3_STATUS','B3_CAST','B3_VIBES','B3_TRAITS','B3_QUIRKS','B3_SOON','b3AddStatus','b3Options','b3Stat','b3Mult','b3Sum',
     'b3RankOf','b3Ladder','b3Subtitle','b3NewLoadout','b3FixLoadout','b3QuirkPool','b3SetMain','b3SetPocket','b3SetQuirk','b3SetRow','b3RowOf','b3SetRank','b3AwardVp','b3AwardAll','b3Kit','b3Skills','b3Auto'].map(G);
  const LAB=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x);
  const bad0=J(G('b3CheckData')());   // what the data check says about the test rows the earlier files left in the sandbox
  const book=(rank,swap)=>{ const B={}; for(const id of LAB) { B[id]=newL(id,rank); if(swap&&swap.includes(id)) setMain(id,B[id],B[id].pocket); } return B; };
  // A fight with real loadouts where it is `who`'s turn. Everyone before them uses their Basic on the first monster.
  const upTo=(cfg,who)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5,formation:'mudling'},cfg)); let N;
    for(;;) { N=next(F); if(!N.unit||N.unit.id===who) break; if(N.unit.side==='party') act(F,N.unit,N.unit.basic,opts(F,N.unit,SK[N.unit.basic])[0].key); else foeTurn(F,N.unit); }
    const P={}; for(const p of F.party) P[p.id]=p; return {F,u:N.unit,P,f0:F.foes[0],f1:F.foes[1]}; };
  const tough=F=>{ for(const u of F.units) u.hp=u.maxHp=u.side==='foe'?9999:u.maxHp; };
  const hits=(beats,key)=>beats.filter(b=>b.t==='hit'&&b.tgt===key);
  const foeAct=(F,e,id)=>{ const ix=e.D.acts.findIndex(A=>A.id===id); e.actIx=ix; e.charge=null; e.turns=1; e.lastUse={}; F.acting=e; return foeTurn(F,e); };

  // 67. Ranks from Vibe Points (spec section 1: 0, 60, 220, 450, 800)
  ok(J([0,59,60,219,220,449,450,799,800,5000].map(rankOf))===J([1,1,2,2,3,3,4,4,5,5]),'Ranks from VP: '+J([0,59,60,219,220,449,450,799,800,5000].map(rankOf)));

  // 68. What each Rank unlocks, and the three Subtitles
  { const V=VIBES.tom_flier,open=r=>ladder(V,r).filter(x=>x.open).map(x=>x.kind+(x.kind==='skill'?':'+x.slot:x.kind==='quirk'?':'+x.slot:'')).join();
    ok(open(1)==='trait,basic,skill:s1','Rank 1 opens the Trait, the Basic and Skill 1: '+open(1));
    ok(open(2)==='trait,basic,skill:s1,skill:s2','Rank 2 adds Skill 2: '+open(2));
    ok(open(3)==='trait,basic,skill:s1,skill:s2,quirk:a','Rank 3 adds Quirk A: '+open(3));
    ok(open(4)==='trait,basic,skill:s1,skill:s2,quirk:a,cap','Rank 4 adds the Grand Capstone: '+open(4));
    ok(open(5)==='trait,basic,skill:s1,skill:s2,quirk:a,cap,quirk:b','Rank 5 adds Quirk B: '+open(5));
    ok(J([1,2,3,4,5].map(r=>subtitle(V,r)))===J(['Sky Club Applicant','Sky Club Applicant','Diamond Medallion','Diamond Medallion','Delta 360 VIP']),'Subtitles change at Ranks 3 and 5');
    const cap=ladder(V,5).find(x=>x.kind==='cap'); ok(cap&&!cap.built&&cap.name==='Tarmac Porsche Transfer','a Skill with no row yet shows its name from B3_SOON and is not built: '+J(cap)); }

  // 69. A fresh loadout: the two Sig Vibes, no Quirks, 0 VP, the row by Lean
  for(const [id,m,p,row] of [['tom','tom_flier','tom_gamer','front'],['grace','grace_squishy','grace_craft','front'],['rose','rose_sugar','rose_cozy','front'],['deedee','deedee_neat','deedee_nurse','front']]) {
    const L=newL(id); ok(L.main===m&&L.pocket===p&&J(L.quirks)==='[null,null]'&&L.vp[m]===0&&L.vp[p]===0&&L.row===null&&rowOf(L)===row,'fresh loadout for '+id+': '+J(L)); }
  { const L=newL('rose'); setMain('rose',L,'rose_cozy'); ok(rowOf(L)==='back','a Support Main Vibe stands in Back by default'); setRow(L,'front'); ok(rowOf(L)==='front','a chosen row beats the Lean'); setRow(L,null); ok(rowOf(L)==='back','and choosing nothing goes back to the Lean'); }
  ok(newL('tom',3).vp.tom_flier===220&&newL('tom',3).vp.tom_gamer===220,'a fresh loadout at Rank 3 holds 220 VP in every Vibe');

  // 70. Repairing a loadout (an old save, a save from another build)
  ok(J(fixL('tom',null))===J(newL('tom')),'no loadout at all becomes the default');
  ok(J(fixL('tom',undefined))===J(newL('tom'))&&J(fixL('tom','junk'))===J(newL('tom')),'junk becomes the default');
  { const L=fixL('tom',{main:'nope',pocket:'tom_flier',quirks:['upgrade_certificate','upgrade_certificate'],vp:{tom_flier:-5,tom_gamer:99999,gone_vibe:50},row:'sideways'});
    ok(L.main==='tom_flier'&&L.pocket==='tom_gamer','an unknown Main falls back, and the Pocket is never the Main: '+L.main+' / '+L.pocket);
    ok(L.vp.tom_flier===0&&L.vp.tom_gamer===800&&!('gone_vibe' in L.vp),'VP is kept between 0 and 800, and a Vibe this build does not have is dropped: '+J(L.vp));
    ok(J(L.quirks)==='[null,null]','a Quirk its Vibe has not unlocked comes off: '+J(L.quirks)); ok(L.row===null,'an unknown row becomes "by Lean"'); }
  { const L=fixL('tom',{main:'tom_gamer',pocket:'tom_gamer',quirks:['elixir_hoarder','elixir_hoarder'],vp:{tom_flier:'220',tom_gamer:230.9},row:'back'});
    ok(L.main==='tom_gamer'&&L.pocket==='tom_flier','Main and Pocket the same: the Pocket becomes the other Vibe');
    ok(L.vp.tom_flier===220&&L.vp.tom_gamer===230,'VP is whole numbers: '+J(L.vp)); ok(J(L.quirks)==='["elixir_hoarder",null]','the same Quirk cannot sit in both slots: '+J(L.quirks)); ok(L.row==='back','a chosen row is kept'); }
  { const L=fixL('tom',{main:'tom_gamer'}); ok(L.main==='tom_gamer'&&L.pocket==='tom_flier'&&L.vp.tom_flier===0&&J(L.quirks)==='[null,null]','a loadout with parts missing is filled in: '+J(L)); }
  { const L=newL('tom',5); setQuirk('tom',L,0,'million_miler_status'); const a=J(L),b=J(fixL('tom',JSON.parse(a))); ok(a===b,'a valid loadout comes back unchanged: '+b); }

  // 71. Main and Pocket
  { const L=newL('tom'); ok(setMain('tom',L,'tom_gamer')&&L.main==='tom_gamer'&&L.pocket==='tom_flier','choosing the Pocket Vibe as Main trades them');
    ok(!setMain('tom',L,'tom_gamer')&&!setMain('tom',L,'grace_craft'),'the same Vibe, or someone else\'s Vibe, changes nothing');
    ok(setPocket('tom',L,'tom_gamer')&&L.main==='tom_flier'&&L.pocket==='tom_gamer','choosing the Main Vibe as Pocket trades them back'); }

  // A third Vibe for Tom, in the sandbox only: it lets the tests reach "a Quirk from a Vibe that is not equipped", overflow
  // to a third Vibe, and a Portable Counter. It is taken out again at the end of this file.
  VIBES.t_v3={id:'t_v3',owner:'tom',name:'Test Vibe',sig:0,lean:'support',subtitles:['T1','T2','T3'],trait:'t_v3_trait',basic:'t_v3_basic',skills:['t_v3_s1','t_v3_s2','t_v3_cap'],quirks:['t_v3_qa','t_v3_qb'],
    counter:{id:'t_heat',name:'Test Heat',max:3,on:'turnEnd',carrier:'source',n:1}};
  CAST.tom.vibes.push('t_v3');
  TRAITS.t_v3_trait={id:'t_v3_trait',vibe:'t_v3',name:'Test Trait',desc:'test',on:'battleStart',effects:[{op:'status',id:'guard_stance',to:'self'}]};
  QUIRKS.t_v3_qa={id:'t_v3_qa',vibe:'t_v3',name:'Test Quirk A',desc:'test',on:'afterHit',carrier:'source',limit:'action',effects:[{op:'pep',n:1,to:'self'}]};
  QUIRKS.t_v3_qb={id:'t_v3_qb',vibe:'t_v3',name:'Test Quirk B',desc:'test',soon:true};
  SK.t_v3_basic={id:'t_v3_basic',vibe:'t_v3',slot:'basic',name:'Test Basic',pep:0,flavor:['clobber'],power:'light',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}],desc:'test'};
  SK.t_v3_s1={id:'t_v3_s1',vibe:'t_v3',slot:'s1',name:'Test Skill 1',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}],desc:'test'};
  SK.t_v3_s2={id:'t_v3_s2',vibe:'t_v3',slot:'s2',name:'Test Skill 2',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,counter:'t_heat',effects:[{op:'damage',bonus:{counter:'t_heat',add:.10}}],desc:'test'};
  SOON.t_v3_cap='Test Capstone';
  ok(J(G('b3CheckData')())===bad0,'the data check accepts a third Vibe with a Portable Counter: '+G('b3CheckData')().join('; '));
  { SOON.t_v3_s1='Twice'; const bad=G('b3CheckData')(); delete SOON.t_v3_s1; ok(bad.some(x=>/B3_SOON still names t_v3_s1/.test(x)),'the data check catches a Skill that has a row and is still in B3_SOON'); }
  { const k=VIBES.tom_gamer.trait; VIBES.tom_gamer.trait='nope'; const bad=G('b3CheckData')(); VIBES.tom_gamer.trait=k; ok(bad.some(x=>/vibe tom_gamer: its Trait nope/.test(x)),'the data check catches a Vibe whose Trait has no row'); }

  // 72. Quirk slots: any two unlocked Quirks from any of that member's own Vibes
  { const L=newL('tom',2); ok(pool('tom',L).length===0&&!setQuirk('tom',L,0,'upgrade_certificate'),'no Quirk can be equipped before Rank 3');
    L.vp.t_v3=220; ok(J(pool('tom',L))==='["t_v3_qa"]','a Quirk unlocks by its own Vibe\'s Rank: '+J(pool('tom',L)));
    ok(L.main!=='t_v3'&&L.pocket!=='t_v3'&&setQuirk('tom',L,0,'t_v3_qa')&&L.quirks[0]==='t_v3_qa','a Quirk from a Vibe that is neither Main nor Pocket can be equipped');
    L.vp.tom_flier=800; ok(pool('tom',L).includes('upgrade_certificate')&&pool('tom',L).includes('million_miler_status'),'Rank 5 opens both of a Vibe\'s Quirks');
    ok(setQuirk('tom',L,1,'t_v3_qa')&&J(L.quirks)==='[null,"t_v3_qa"]','a Quirk moved to the other slot leaves its old slot: '+J(L.quirks));
    setQuirk('tom',L,0,'upgrade_certificate'); ok(setQuirk('tom',L,0,'t_v3_qa')&&J(L.quirks)==='["t_v3_qa","upgrade_certificate"]','picking the other slot\'s Quirk trades the two: '+J(L.quirks));
    ok(setQuirk('tom',L,0,null)&&L.quirks[0]===null&&!setQuirk('tom',L,0,null),'a slot can be emptied');
    ok(!setQuirk('tom',L,0,'permanent_marker')&&!setQuirk('tom',L,2,'upgrade_certificate'),'someone else\'s Quirk, or a third slot, is refused'); }
  // 73. The Lab's Rank picker
  { const L=newL('tom',5); setQuirk('tom',L,0,'upgrade_certificate'); setQuirk('tom',L,1,'million_miler_status'); setRank('tom',L,3);
    ok(L.vp.tom_flier===220&&L.vp.tom_gamer===220&&L.vp.t_v3===220,'the Rank picker sets every Vibe: '+J(L.vp)); ok(J(L.quirks)==='["upgrade_certificate",null]','a Quirk the new Rank does not unlock comes off: '+J(L.quirks));
    setRank('tom',L,1); ok(J(L.quirks)==='[null,null]'&&L.vp.tom_flier===0,'Rank 1 takes both off'); }

  // 74. Vibe Points: the Main Vibe earns all of it, the Pocket Vibe half
  { const L=newL('tom'),r=award('tom',L,10); ok(L.vp.tom_flier===10&&L.vp.tom_gamer===5&&L.vp.t_v3===0,'10 VP: Main 10, Pocket 5, the third Vibe nothing: '+J(L.vp)); ok(J(r.gains)===J({tom_flier:10,tom_gamer:5})&&!r.ranks.length&&!r.lost,'what was earned is reported: '+J(r));
    const r2=award('tom',L,50); ok(L.vp.tom_flier===60&&J(r2.ranks)===J([{vibe:'tom_flier',from:1,to:2}]),'reaching 60 VP is Rank 2, and it is reported: '+J(r2.ranks));
    const L3=newL('tom'); award('tom',L3,15); ok(L3.vp.tom_gamer===8,'half of an odd number rounds up: '+L3.vp.tom_gamer);
    const L4=newL('tom'); const r4=award('tom',L4,500); ok(J(r4.ranks)===J([{vibe:'tom_flier',from:1,to:4},{vibe:'tom_gamer',from:1,to:3}]),'one big award can climb several Ranks: '+J(r4.ranks)); }
  // 75. Overflow: a mastered Vibe keeps nothing; its share goes to that member's lowest unmastered Vibe
  { const L=newL('tom'); L.vp={tom_flier:800,tom_gamer:100,t_v3:40}; const r=award('tom',L,10);
    ok(L.vp.tom_flier===800&&L.vp.t_v3===50&&L.vp.tom_gamer===105,'Main mastered: its 10 go to the lowest unmastered Vibe, the Pocket still earns its 5: '+J(L.vp)); ok(!r.lost&&!('tom_flier' in r.gains),'nothing is lost and the mastered Vibe gains nothing');
    const L2=newL('tom'); L2.vp={tom_flier:795,tom_gamer:100,t_v3:40}; const r2=award('tom',L2,10);
    ok(L2.vp.tom_flier===800&&L2.vp.t_v3===45&&L2.vp.tom_gamer===105,'what is left over when a Vibe reaches mastery spills too: '+J(L2.vp)); ok(J(r2.ranks)===J([{vibe:'tom_flier',from:4,to:5}]),'mastery is a Rank-up: '+J(r2.ranks));
    const L3=newL('tom'); L3.vp={tom_flier:300,tom_gamer:800,t_v3:40}; award('tom',L3,10); ok(L3.vp.tom_flier===310&&L3.vp.t_v3===45&&L3.vp.tom_gamer===800,'Pocket mastered: its half goes to the lowest unmastered Vibe: '+J(L3.vp));
    const L4=newL('tom'); L4.vp={tom_flier:800,tom_gamer:800,t_v3:790}; const r4=award('tom',L4,10); ok(L4.vp.t_v3===800&&r4.lost===5,'with everything mastered the rest is lost: '+J(L4.vp)+' lost '+r4.lost);
    const L5=newL('tom'); L5.vp={tom_flier:800,tom_gamer:800,t_v3:800}; const r5=award('tom',L5,10); ok(r5.lost===15&&!Object.keys(r5.gains).length,'all three mastered: nothing to earn'); }
  // 76. The spec's pacing: 90 Main VP a chapter masters the first Vibe around chapter 9 and all three around chapter 18
  { const L=newL('tom'); let first=0,all=0; for(let ch=1;ch<=20;ch++) { award('tom',L,90); if(!first&&L.vp.tom_flier>=800) first=ch; if(!all&&CAST.tom.vibes.every(v=>L.vp[v]>=800)) all=ch; }
    ok(first===9&&all===18,'first Vibe mastered in chapter '+first+' (9), all three in chapter '+all+' (18)'); }
  { const B=book(1); B.amy={main:'x'}; const r=awardAll(B,10); ok(Object.keys(r).sort().join()==='deedee,grace,rose,tom'&&B.grace.vp.grace_squishy===10&&B.rose.vp.rose_cozy===5,'everyone with a kit earns after a fight; someone with no kit yet is skipped'); }

  // 77. What a loadout gives: Skills by Rank, Main first then Pocket; the Basic and the Trait from the Main Vibe only
  { const L=newL('tom',1); ok(J(kit('tom',L).skills)===J(['zone_one_blockade','controller_toss'])&&kit('tom',L).basic==='lounge_pass_flex','Rank 1: Skill 1 of the Main Vibe, then Skill 1 of the Pocket Vibe: '+J(kit('tom',L).skills));
    setRank('tom',L,2); ok(J(kit('tom',L).skills)===J(['zone_one_blockade','suite_door_slide','controller_toss']),'Rank 2 adds Skill 2 (a Skill with no row yet is left out): '+J(kit('tom',L).skills));
    setMain('tom',L,'tom_gamer'); const K=kit('tom',L); ok(K.basic==='cartridge_blow'&&J(K.skills)===J(['controller_toss','zone_one_blockade','suite_door_slide'])&&K.lean==='striker'&&K.trait==='gamers_intuition','trading Main and Pocket changes the Basic, the order of the Skills, the Lean and the Trait: '+J(K));
    L.vp.tom_flier=0; ok(J(kit('tom',L).skills)===J(['controller_toss','zone_one_blockade']),'each Vibe unlocks by its own Rank: '+J(kit('tom',L).skills));
    setPocket('tom',L,'t_v3'); ok(J(kit('tom',L).skills)===J(['controller_toss','t_v3_s1','t_v3_s2']),'a third Vibe in the Pocket brings its own Skills: '+J(kit('tom',L).skills)); }
  { const B=book(2),F=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B}),t=F.party[1];
    ok(J(skillsOf(F,t).map(S=>S.id))===J(['lounge_pass_flex','zone_one_blockade','suite_door_slide','controller_toss']),'in a fight the SKILLS list is the loadout\'s: '+J(skillsOf(F,t).map(S=>S.id)));
    ok(t.vibe==='tom_flier'&&t.pocket==='tom_gamer'&&t.rank===2&&J(t.pocketSkills)==='["controller_toss"]','the unit knows its Main, Pocket and Rank');
    const F1=NF({party:LAB,level:2,formation:'mudling',seed:5}); ok(J(F1.party[1].skills)===J(['zone_one_blockade','controller_toss']),'a fight given no loadouts uses fresh ones at Rank 1: '+J(F1.party[1].skills));
    const F3=NF({party:LAB,level:2,formation:'mudling',seed:5,rank:2}); ok(F3.party[1].skills.includes('suite_door_slide'),'cfg.rank sets the Rank of a fight given no loadouts'); }
  // The Trait comes with the Main Vibe only; a Quirk comes with its slot whatever Vibe it is from; one whose rule is not written is left off.
  { const L=newL('tom',5); setPocket('tom',L,'t_v3'); setQuirk('tom',L,0,'t_v3_qa'); setQuirk('tom',L,1,'t_v3_qb');
    const F=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:{tom:L}}),t=F.party[1];
    ok(!t.st.guard_stance&&!t.passives.some(P=>P.id==='t_v3_trait'),'a Pocket Vibe does not bring its Trait');
    ok(t.passives.some(P=>P.id==='t_v3_qa')&&!t.passives.some(P=>P.id==='t_v3_qb'),'an equipped Quirk listens; one marked soon does not: '+J(t.passives.map(P=>P.id)));
    setMain('tom',L,'t_v3'); const F2=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:{tom:L}}); next(F2);
    ok(!!F2.party[1].st.guard_stance,'as Main Vibe its Trait runs (here: Guard Stance as the fight begins)');
    ok(!NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:book(5)}).party.some(p=>p.passives.length),'the real Traits and Quirks are not written yet (stage 5), so nobody carries a passive'); }

  // 78. Stat Leans: the Main Vibe's only, and a kind of their own (they multiply with other bonuses)
  noCrit(()=>{ const F=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:book(2)}),[g,t,r,d]=F.party;
    ok(t.maxHp===Math.round(115*1.15)&&t.hp===t.maxHp&&near(stat(t,'def'),16*1.15)&&near(stat(t,'atk'),26),'Guard: +15% Max HP and Defense, nothing else: HP '+t.maxHp+', Def '+stat(t,'def'));
    ok(near(stat(r,'atk'),26*1.15)&&r.maxHp===115&&near(stat(r,'spd'),100),'Striker: +15% Attack: '+stat(r,'atk'));
    ok(near(stat(g,'spd'),115)&&near(stat(d,'spd'),115)&&near(g.wait,50*100/115)&&near(t.wait,50),'Tempo: +15% Speed, so Grace and Deedee open the fight ahead of Tom and Rose: '+g.wait+' / '+t.wait);
    add(F,r,'giddyup',{src:r}); ok(near(stat(r,'atk'),26*1.15*1.2),'a Lean multiplies with a buff of another kind: '+stat(r,'atk'));
    const seq=[]; for(let i=0;i<4;i++) { const N=next(F); seq.push(N.unit.id); act(F,N.unit,N.unit.basic,opts(F,N.unit,SK[N.unit.basic])[0].key); } ok(seq.join()==='grace,deedee,tom,rose','opening order with Leans: '+seq); });
  noCrit(()=>{ const B=book(2,['tom','deedee','rose']),F=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B}),[g,t,r,d]=F.party;
    ok(t.maxHp===115&&near(stat(t,'def'),16)&&near(stat(t,'atk'),26*1.15),'with Gamer Geek as Main, Tom has the Striker Lean and not the Guard one: HP '+t.maxHp+', Atk '+stat(t,'atk'));
    ok(near(mult(d,'healGiven'),1.15)&&near(stat(d,'spd'),100),'Support: heals and shields given are 15% bigger: '+mult(d,'healGiven'));
    ok(d.row==='back'&&r.row==='back'&&t.row==='front'&&g.row==='front','Support Vibes stand in Back by default: '+F.party.map(p=>p.id+' '+p.row).join(', ')); });
  { const B=book(2); setRow(B.grace,'back'); const F=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B}); ok(F.party[0].row==='back','a row chosen in the loadout is used');
    const F2=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B,rows:{grace:'front'}}); ok(F2.party[0].row==='front','cfg.rows still overrides it');
    for(const id of LAB) setRow(B[id],'back'); const F3=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B}); ok(F3.party[0].row==='front'&&F3.party.slice(1).every(p=>p.row==='back'),'everyone sent to the Back: the first in line stands in Front'); }
  // A plain fight (the stages 1 to 3 tests) has none of this.
  { const F=NF({party:LAB,level:2,formation:'mudling',seed:5,plain:true}),t=F.party[1]; ok(t.maxHp===115&&!t.mods.length&&J(t.skills)===J(['zone_one_blockade','suite_door_slide'])&&!t.pocket,'cfg.plain: no Lean, no Pocket Vibe, Skill 1 and Skill 2'); }

  // 79. Portable Counters: the counter builds with its Vibe as Main, and as Pocket only while a Skill that reads it is equipped
  { const mk=(main,pocket,vp)=>{ const L=newL('tom'); L.main=main; L.pocket=pocket; Object.assign(L.vp,vp); return L; };
    const run=L=>{ const {F,u,f0}=upTo({loadouts:{tom:L}},'tom'); tough(F); const seen=[]; for(let i=0;i<4;i++) { F.acting=u; act(F,u,u.basic,'f0'); seen.push(u.counters.t_heat||0); } return {F,u,f0,seen}; };
    const A=run(mk('t_v3','tom_flier',{}));
    ok(A.seen.join()==='1,2,3,3','as Main Vibe the counter goes up by 1 after each of his turns, 3 at most: '+A.seen);
    ok(G('b3Carried')(A.F,A.u).some(r=>r.kind==='counter'&&r.name==='Test Heat'&&r.short==='3'),'the counter is in the list a tap opens, by its name');
    const Bq=run(mk('tom_flier','t_v3',{t_v3:60}));   // Rank 2 in the Pocket: Skill 2 (which reads the counter) is equipped
    ok(Bq.seen.join()==='1,2,3,3','as Pocket Vibe with the Skill that reads it equipped, the counter comes along: '+Bq.seen);
    ok(!Bq.u.st.guard_stance&&!Bq.u.passives.some(P=>P.id==='t_v3_trait'),'and the Trait\'s other bonus stays behind');
    const C=run(mk('tom_flier','t_v3',{t_v3:0}));     // Rank 1 in the Pocket: the Skill that reads it is locked
    ok(C.seen.join()==='0,0,0,0','as Pocket Vibe without that Skill, no counter: '+C.seen);
    const D=run(mk('tom_flier','tom_gamer',{t_v3:800}));
    ok(D.seen.join()==='0,0,0,0','not equipped at all: no counter: '+D.seen);
    noCrit(()=>{ const {F,u,f0}=upTo({loadouts:{tom:mk('t_v3','tom_flier',{t_v3:60})}},'tom'); tough(F);
      const h0=hits(act(F,u,'t_v3_s2','f0').beats,'f0')[0].dmg; F.acting=u; u.counters.t_heat=2; const h2=hits(act(F,u,'t_v3_s2','f0').beats,'f0')[0].dmg;
      ok(h0===Math.round(26*100/112)&&h2===Math.round(26*100/112*1.2),'a Skill reads the counter: +10% per point: '+h0+' then '+h2); }); }

  // 80. The second Sig Vibes' first moves
  // Cartridge Blow and Controller Toss (Tom, Gamer Geek)
  noCrit(()=>{ const {F,u,f0}=upTo({loadouts:book(2,['tom'])},'tom'); tough(F); for(const f of F.foes) f.st={};   // whatever the others' Basics left on the monsters
    const b=act(F,u,'cartridge_blow','f0').beats,h=hits(b,'f0')[0]; ok(h&&h.flavor==='racket'&&h.dmg===Math.round(26*1.15*.5*100/112*1.5)&&u.pep===6,'Cartridge Blow: a light Racket hit and 2 Pep: '+(h&&h.dmg)+', Pep '+u.pep);
    F.acting=u; const d0=hits(act(F,u,'controller_toss','f0').beats,'f0')[0].dmg; ok(d0===Math.round(26*1.15*100/112)&&u.pep===4,'Controller Toss: a standard Clobber hit for 2 Pep: '+d0);
    ok(!u.hitSince,'nothing has hit Tom yet'); });
  noCrit(()=>{ const {F,u,f0}=upTo({loadouts:book(2,['tom'])},'tom'); tough(F); u.hp=u.maxHp=5000;
    const base=Math.round(26*1.15*100/112); add(F,u,'t_taunt',{});
    foeAct(F,f0,'wobble'); ok(u.hitSince,'a monster\'s hit on Tom is remembered');
    F.acting=u; const d1=hits(act(F,u,'controller_toss','f0').beats,'f0')[0].dmg; ok(d1===Math.round(26*1.15*100/112*1.4),'Controller Toss is 40% stronger after Tom took a hit: '+d1+' against '+base);
    ok(!u.hitSince,'and the memory ends with his turn');
    F.acting=u; u.pep=10; const d2=hits(act(F,u,'controller_toss','f0').beats,'f0')[0].dmg; ok(d2===base,'no bonus on the turn after: '+d2);
    G('b3AddShield')(F,u,9999,{src:u}); const hp=u.hp; foeAct(F,f0,'wobble');
    ok(u.hp===hp&&u.hitSince,'a hit his shield soaked whole still counts as blocked');
    u.hitSince=false; add(F,u,'bleed',{src:f0}); G('b3BeginTurn')(F,u,[]); ok(!u.hitSince,'a Bleed tick is not a hit'); });
  // Glitter-Brush Flick and Open-String Violin Screech (Grace, Craft Artist)
  noCrit(()=>{ const {F,u,f0,f1}=upTo({loadouts:book(2,['grace'])},'grace'); tough(F);
    for(const f of F.foes) f.st={};   // whatever the others' Basics left on the monsters
    const b=act(F,u,'glitter_brush_flick','f0').beats,h=hits(b,'f0')[0]; ok(h&&h.flavor==='razzle'&&!!f0.st.dazzled,'Glitter-Brush Flick: a Razzle hit that leaves Dazzled');
    F.acting=u; u.pep=10; const b2=act(F,u,'open_string_violin_screech','*').beats,per=26*1.15*.7*100/112*1.5;
    ok(hits(b2,'f0').length===1&&hits(b2,'f1').length===1&&hits(b2,'f1')[0].dmg===Math.round(per),'Violin Screech hits every monster at 70% of standard: '+hits(b2,'f1')[0].dmg+' against '+Math.round(per));
    ok(b2.some(x=>x.t==='detonate'&&x.id==='sensory_overload'&&x.tgt==='f0')&&!b2.some(x=>x.t==='detonate'&&x.tgt==='f1'),'it sets off Dazzled on the one that was Dazzled, and only there');
    ok(!!f0.st.off_key&&!!f1.st.off_key&&near(stat(f1,'atk'),f1.atk*.8)&&u.pep===7+1,'each monster hit has 20% less Attack; 3 Pep spent, 1 back for the Detonation: Pep '+u.pep); });
  // Pocket Pretzel & Pat (Rose, Cozy Rosie)
  noCrit(()=>{ const {F,u,P,f0}=upTo({loadouts:book(2,['rose'])},'rose'); tough(F);
    for(const p of F.party) p.hp=p.maxHp; const b0=act(F,u,'pocket_pretzel_and_pat','f0').beats; ok(hits(b0,'f0').length===1&&!b0.some(x=>x.t==='heal'),'Pocket Pretzel & Pat with nobody hurt: the bonk, no heal');
    P.tom.hp=Math.round(P.tom.maxHp*.5); P.grace.hp=Math.round(P.grace.maxHp*.8); F.acting=u; const hp=P.tom.hp,b=act(F,u,'pocket_pretzel_and_pat','f0').beats,he=b.find(x=>x.t==='heal');
    const want=Math.round(P.tom.maxHp*.05*1.15); ok(he&&he.tgt===P.tom.key&&P.tom.hp===hp+want,'the pretzel goes to whoever is hurt the most: a tiny heal (5%), 15% bigger for her Support Lean: '+(he&&he.n)+' against '+want);
    for(const p of F.party) p.hp=p.maxHp; u.hp=1; F.acting=u; const b3=act(F,u,'pocket_pretzel_and_pat','f0').beats.find(x=>x.t==='heal'); ok(b3&&b3.tgt===u.key,'when Rose is the one hurt, she eats it herself'); });
  // "Little Pinch!" Syringe Poke and Deedee Makes It Better (Deedee, Registered Nut)
  noCrit(()=>{ const {F,u,P,f0}=upTo({loadouts:book(2,['deedee'])},'deedee'); tough(F);
    const h=hits(act(F,u,'little_pinch_syringe_poke','f0').beats,'f0')[0]; ok(h&&h.flavor==='clobber'&&!!f0.st.pinched&&near(sum(f0,'critTaken'),.15),'Syringe Poke: a Clobber jab, and attacks against that monster crit 15% more often');
    F.acting=f0; G('b3EndTurn')(F,f0,100,[]); ok(!f0.st.pinched,'for 1 of its turns');
    const O=opts(F,u,SK.deedee_makes_it_better); ok(O.length===4&&O.some(o=>o.units[0]===u),'Deedee Makes It Better can be used on anyone in the family, herself included');
    P.tom.hp=10; add(F,P.tom,'slow',{src:f0}); add(F,P.tom,'bleed',{src:f0}); F.acting=u; u.pep=10;
    const b=act(F,u,'deedee_makes_it_better',P.tom.key).beats,want=Math.round(P.tom.maxHp*.2*1.15);
    ok(P.tom.hp===10+want&&u.pep===8,'it heals 20% of Max HP (15% bigger for her Support Lean) for 2 Pep: '+(P.tom.hp-10)+' against '+want);
    ok(!P.tom.st.slow&&!P.tom.st.bleed&&!!P.tom.st.all_better&&near(stat(P.tom,'atk'),26*1.2),'it clears every debuff, and because something was cleared Tom gets 20% more Attack');
    P.grace.hp=10; F.acting=u; act(F,u,'deedee_makes_it_better',P.grace.key); ok(P.grace.hp>10&&!P.grace.st.all_better,'with nothing to clear there is no Attack bonus');
    const B2=book(2),F2=NF({party:LAB,level:2,formation:'mudling',seed:5,loadouts:B2}),d2=F2.party[3]; F2.party[1].hp=10; F2.acting=d2; d2.pep=10; act(F2,d2,'deedee_makes_it_better','p1');
    ok(F2.party[1].hp===10+Math.round(F2.party[1].maxHp*.2),'from the Pocket (Neat Freak as Main) the heal has no Support bonus: '+(F2.party[1].hp-10)); });
  // The simple player heals someone who is about to fall, and does not waste the heal on someone at full HP.
  { const {F,u,P}=upTo({loadouts:book(2)},'deedee'); tough(F); P.rose.hp=Math.round(P.rose.maxHp*.15); const p=auto(F,u);
    ok(p.skill==='deedee_makes_it_better'&&p.target===P.rose.key,'the simple player heals a family member at 15% HP: '+J(p));
    P.rose.hp=P.rose.maxHp; const q=auto(F,u); ok(q.skill!=='deedee_makes_it_better','and not when everyone is fine: '+J(q)); }

  // 81. Whole fights with real loadouts: every Lab fight, at Rank 1, 2 and 5, and with everyone's second Sig Vibe as Main
  { const LABF=G('B3_LAB'); let lines=[];
    for(const [tag,rank,swap] of [['rank 1',1,null],['rank 2',2,null],['rank 5',5,null],['rank 2, second Sig Vibes as Main',2,LAB]]) for(const L of LABF) {
      let won=0,sumR=0,err='',kos=0; const n=60;
      for(let i=0;i<n;i++) { try { const r=play({party:L.party.slice(),level:L.level,formation:L.formation,seed:4000+i,loadouts:book(rank,swap)}); if(r.result==='win') won++; sumR+=r.rounds; kos+=r.kos; } catch(e) { err=e.message; } }
      ok(!err&&won===n,L.id+' at '+tag+': '+won+' of '+n+' won'+(err?', error: '+err:'')); lines.push(L.id+' '+tag+': '+(sumR/n).toFixed(2)+' rounds, '+(kos/n).toFixed(2)+' knock-outs'); }
    if(T.lines) T.lines.push(...lines); }
  { const cfg={party:LAB,level:2,formation:'bigone',seed:77,loadouts:book(2)},a=play(cfg),b=play(Object.assign({},cfg,{loadouts:book(2)}));
    ok(a.order.join()===b.order.join()&&a.rounds===b.rounds&&a.hpLeft.join()===b.hpLeft.join(),'a seed replays exactly with loadouts');
    ok(a.moves.controller_toss>0||a.moves.zone_one_blockade>0||a.moves.suite_door_slide>0,'Tom uses a Skill in the boss fight: '+J(a.moves)); }
  { const before=J(book(2)),B=book(2); play({party:LAB,level:2,formation:'mudling',seed:3,loadouts:B}); ok(J(B)===before,'a fight never changes the loadouts it was given'); }

  // Take the test Vibe out again.
  CAST.tom.vibes.pop(); delete VIBES.t_v3; delete TRAITS.t_v3_trait; delete QUIRKS.t_v3_qa; delete QUIRKS.t_v3_qb; delete SOON.t_v3_cap;
  for(const k of ['t_v3_basic','t_v3_s1','t_v3_s2']) delete SK[k];
  ok(J(G('b3CheckData')())===bad0,'the data check says the same as before the test Vibe went in');
};
