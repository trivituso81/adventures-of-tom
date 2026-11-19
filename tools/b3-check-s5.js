// tools/b3-check-s5.js — Battle 3 rule tests for stage 5a: the Traits, the Quirks and the Grand Capstones of the four first Sig
// Vibes (Frequent Flier, Squishy Collector, Sugar Rush, Neat Freak), and the general pieces they needed: listeners with
// conditions, mods with `when` and `per`, the ops taunt, grant and ruckus, a strip that clears a floor, a ledger that is paid in
// passes, the granted action, and the one-off Twin-Lamb Relay. `node tools/b3-sim.js check` runs it after stages 1 to 4.
// T is what tools/b3-sim.js hands over: G (reads a name out of the rules sandbox), ok(cond, what), near, play, noCrit.
// These groups use real loadouts (no cfg.plain).
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,foeTurn,U,RULES,SK,ST,HZ,VIBES,TRAITS,QUIRKS,SOON,add,endSt,opts,stat,mult,taken,outMult,newL,setQuirk,setMain,ladder,skillsOf,carried,moveRec,roundStart,endTurn]=
    ['b3NewFight','b3Next','b3Act','b3FoeTurn','b3Unit','B3_RULES','B3_SKILLS','B3_STATUS','B3_HAZARDS','B3_VIBES','B3_TRAITS','B3_QUIRKS','B3_SOON','b3AddStatus','b3EndStatus','b3Options','b3Stat','b3Mult','b3TakenMult','b3OutMult',
     'b3NewLoadout','b3SetQuirk','b3SetMain','b3Ladder','b3Skills','b3Carried','b3MoveRec','b3RoundStart','b3EndTurn'].map(G);
  const LAB=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x);
  const bad0=J(G('b3CheckData')());
  // A book of loadouts: every Vibe at `rank`, and the Quirks named per member ({tom:['upgrade_certificate', ...]}).
  const book=(rank,quirks)=>{ const B={}; for(const id of LAB) { B[id]=newL(id,rank); ((quirks||{})[id]||[]).forEach((q,i)=>{ if(!setQuirk(id,B[id],i,q)) throw new Error('test could not equip '+q); }); } return B; };
  // A fight with real loadouts, opened (the fight-start beats are in `open`), with everyone by name. Monsters get plenty of HP.
  const fight=(rank,quirks,formation,cfg)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5,formation:formation||'mudling',loadouts:book(rank,quirks)},cfg||{}));
    const open=F.opening.slice(),P={}; for(const p of F.party) P[p.id]=p; for(const f of F.foes) f.hp=f.maxHp=9999;
    return {F,open,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,rose:P.rose,deedee:P.deedee}; };
  // One family member acts as if it were their turn; one monster uses the named act.
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const foeAct=(F,e,id)=>{ const ix=e.D.acts.findIndex(A=>A.id===id); e.actIx=ix; e.charge=null; e.turns=1; e.lastUse={}; F.acting=e; return foeTurn(F,e); };
  const hits=(beats,key)=>beats.filter(b=>b.t==='hit'&&(!key||b.tgt===key));
  const has=(beats,t,f)=>beats.some(b=>b.t===t&&(!f||f(b)));
  // Test rows, in the sandbox only; taken out again at the end of this file.
  ST.t_aim={id:'t_aim',name:'Test Aim',kind:'buff',group:null,dur:{n:99,unit:'turn'},mods:[],flags:['taunt'],weight:1,short:'AIM',color:'#fff',desc:'test'};
  ST.t_buff={id:'t_buff',name:'Test Buff',kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[],flags:[],weight:1,short:'TB',color:'#fff',desc:'test'};
  SK.t_clob_basic={id:'t_clob_basic',vibe:'tom_flier',slot:'basic',name:'Test Clobber Basic',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}],desc:'test'};
  HZ.t_goo={id:'t_goo',name:'Test Goo',side:'foe',uses:2,rounds:3,tags:['melee'],out:0,effects:[],short:'GOO',color:'#fff',desc:'test'};

  // 82. All sixteen lines are written: nothing of the four first Sig Vibes is marked soon or is only a name
  for(const v of ['tom_flier','grace_squishy','rose_sugar','deedee_neat']) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un)); ok(!VIBES[v].skills.some(s=>SOON[s]),v+': no Skill is still only a name'); }
  ok(J(Object.keys(G('B3_CUSTOM')))==='["twinLambRelay","doubleCoat"]'&&QUIRKS.twin_lamb_relay.custom==='twinLambRelay','the lines that needed their own function are Twin-Lamb Relay (5a) and Double Coat (5b)');

  // 83. Priority Boarding: Guard Stance from the start until Tom's second turn ends; 20% more off a hit taken for someone at half HP or less
  noCrit(()=>{ const {F,open,tom,grace,f0}=fight(1);
    ok(tom.st.guard_stance&&tom.st.guard_stance.n===2&&has(open,'status',b=>b.tgt===tom.key&&b.id==='guard_stance'),'Tom starts in Guard Stance: '+J(tom.st.guard_stance));
    ok(!grace.st.guard_stance&&near(taken(tom),.75),'only Tom, and it cuts 25%: '+taken(tom));
    go(F,tom,'lounge_pass_flex','f0'); ok(!!tom.st.guard_stance,'still on after his first turn'); go(F,tom,'lounge_pass_flex','f0'); ok(!tom.st.guard_stance,'gone after his second turn'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(2); endSt(F,tom,'guard_stance'); go(F,tom,'suite_door_slide','*'); add(F,grace,'t_aim',{});
    const dmg=red=>Math.max(1,Math.round(19*.8*100/(100+stat(tom,'def'))*(1-red)));
    let h=hits(foeAct(F,f0,'wobble'),tom.key)[0]; ok(h&&h.dmg===dmg(.35),'stepping in for Grace at full HP: 35% off, got '+(h&&h.dmg)+' want '+dmg(.35));
    grace.hp=Math.floor(grace.maxHp*.5); h=hits(foeAct(F,f0,'wobble'),tom.key)[0]; ok(h&&h.dmg===dmg(.55),'for Grace at half HP: 35% + 20% off, got '+(h&&h.dmg)+' want '+dmg(.55));
    ok(dmg(.35)!==dmg(.55),'the two numbers differ: '+dmg(.35)+' and '+dmg(.55));
    add(F,tom,'guard_stance',{src:tom}); h=hits(foeAct(F,f0,'wobble'),tom.key)[0]; ok(h&&h.dmg===dmg(.6),'with Guard Stance on top the 60% cap holds: '+(h&&h.dmg)); });

  // 84. Upgrade Certificate: a stamp per enemy action he steps in for, 3 at most; the next Clobber hit that is not a Basic cashes them
  noCrit(()=>{ const {F,tom,grace,f0}=fight(5,{tom:['upgrade_certificate']}); endSt(F,tom,'guard_stance'); go(F,tom,'suite_door_slide','*'); add(F,grace,'t_aim',{});
    let b=foeAct(F,f0,'wobble'); ok(tom.counters.certificate===1&&has(b,'counter',x=>x.id==='certificate'&&x.v===1)&&has(b,'passive',x=>x.id==='upgrade_certificate'),'one Certificate for stepping in: '+tom.counters.certificate);
    ok(tom.counterInfo.certificate&&tom.counterInfo.certificate.max===3,'the counter has a name for the list and the portrait');
    go(F,tom,'lounge_pass_flex','f0'); ok(tom.counters.certificate===1,'a Racket Basic does not cash it');
    go(F,tom,'t_clob_basic','f0'); ok(tom.counters.certificate===1,'a Clobber Basic does not cash it either');
    const base=Math.round(stat(tom,'atk')*100/(100+12)),h=hits(go(F,tom,'t_clobber','f0'))[0];
    ok(h.dmg===Math.round(stat(tom,'atk')*100/112*1.2)&&h.dmg>base,'a Clobber Skill cashes 1 Certificate for +20%: '+h.dmg+' against '+base); ok(tom.counters.certificate===0,'and the Certificates are gone');
    for(let i=0;i<5;i++) { foeAct(F,f0,'wobble'); } ok(tom.counters.certificate===3,'3 at most: '+tom.counters.certificate);
    const b3=go(F,tom,'t_multi','f0'),hs=hits(b3); ok(hs.length===3&&hs.every(x=>x.dmg===Math.round(stat(tom,'atk')/3*100/112*1.6)),'3 Certificates: +60% on every hit of that Skill: '+hs.map(x=>x.dmg));
    ok(tom.counters.certificate===0&&has(b3,'counter',x=>x.v===0),'spent once the Skill is done'); });
  // ... and a Zone One Blockade hip-check cashes them too
  noCrit(()=>{ const {F,tom,grace,f0}=fight(5,{tom:['upgrade_certificate']}); endSt(F,tom,'guard_stance'); go(F,tom,'suite_door_slide','*'); add(F,grace,'t_aim',{});
    foeAct(F,f0,'mud_flick'); ok(tom.counters.certificate===1,'a stamp from a thrown attack he stepped in for');
    go(F,tom,'zone_one_blockade',tom.key); ok(tom.counters.certificate===1,'putting the Blockade up cashes nothing (it deals no hit)');
    endSt(F,grace,'t_aim'); add(F,tom,'t_aim',{}); const b=foeAct(F,f0,'wobble'),h=b.find(x=>x.t==='hit'&&x.tgt===f0.key);
    ok(h&&h.dmg===Math.round(stat(tom,'atk')*100/112*1.2),'the hip-check lands 20% harder: '+(h&&h.dmg)); ok(tom.counters.certificate===0,'and the Certificate is spent'); });

  // 85. Million-Miler Status: a counter takes 1 more pip, stepping in takes 1 pip, each pulls Tom 10 ticks (halving inside a round)
  noCrit(()=>{ const {F,tom,grace,f0}=fight(5,{tom:['million_miler_status']},'log'); endSt(F,tom,'guard_stance'); endSt(F,f0,'mossy_brace');
    go(F,tom,'zone_one_blockade',tom.key); add(F,tom,'t_aim',{}); tom.wait=50; tom.pulls=0;
    let b=foeAct(F,f0,'branch_jab'); ok(f0.pips===2,'the hip-check takes its 1 pip and 1 more: '+f0.pips+' of 4 left');
    ok(has(b,'passive',x=>x.id==='million_miler_status')&&near(tom.wait,40),'and Tom moves 10 ticks up the bar: '+tom.wait);
    ok(b.filter(x=>x.t==='react').length===1,'one answer, not two'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(5,{tom:['million_miler_status']},'log'); endSt(F,tom,'guard_stance'); endSt(F,f0,'mossy_brace');
    go(F,tom,'suite_door_slide','*'); add(F,grace,'t_aim',{}); tom.wait=50; tom.pulls=0;
    let b=foeAct(F,f0,'branch_jab'); ok(f0.pips===3&&has(b,'react',x=>x.name==='Million-Miler Status'),'stepping in takes 1 pip as Tom\'s own small answer: '+f0.pips);
    ok(near(tom.wait,40),'and pulls him 10 ticks: '+tom.wait); ok(has(b,'pips',x=>/^r\d+$/.test(x.g)),'the pip is paid in the answer, after the monster\'s own action');
    // Both at once: the Blockade is up and he steps in for a melee hit.
    go(F,tom,'zone_one_blockade',tom.key); f0.pips=4; tom.wait=50; tom.pulls=0; b=foeAct(F,f0,'branch_jab');
    ok(f0.pips===1,'hip-check 1 + 1 more, and 1 for stepping in: '+f0.pips+' of 4 left'); ok(near(tom.wait,50-10-5),'two pulls in one round: 10 then 5: '+tom.wait); });
  // An enemy's counter act is not Tom's counter
  noCrit(()=>{ const {F,tom,f0}=fight(5,{tom:['million_miler_status']},'log'); const w=tom.wait; go(F,tom,'t_clobber','f0'); ok(f0.pips===4,'an ordinary hit takes no extra pip'); });

  // 86. Tarmac Porsche Transfer: heavy Racket on every monster, 1 buff off each one it hits, a taunt on Tom for 2 turns
  noCrit(()=>{ const {F,tom,f0}=fight(4,null,'bigone'); tom.pep=10; f0.pips=6;
    const b=go(F,tom,'tarmac_porsche_transfer','*'),h=hits(b,f0.key)[0];
    ok(h&&h.dmg===Math.round(stat(tom,'atk')*1.6*.7*100/117*1.5)&&h.peeve,'heavy at the all-monsters share, Racket is its Pet Peeve: '+(h&&h.dmg));
    ok(!f0.st.muffin_crown&&f0.stripped.muffin_crown,'the Muffin-Tin Crown comes off'); ok(f0.pips===5,'1 pip for the Pet Peeve: '+f0.pips);
    ok(tom.pep===5&&near(tom.wait,120*100/stat(tom,'spd')),'5 Pep and a Capstone\'s Recovery: '+tom.pep+', '+tom.wait);
    ok(tom.st.high_beams&&G('b3HasFlag')(tom,'taunt'),'High Beams is on Tom');
    tom.hp=tom.maxHp=1e9; let all=true; for(let i=0;i<40;i++) { F.rng=i*7919; const x=foeAct(F,f0,'tail_slap').find(y=>y.t==='act'); if(x.tgts[0]!==tom.key) all=false; } ok(all,'every single-target attack aims at Tom');
    F.acting=tom; endTurn(F,tom,100,[]); ok(!!tom.st.high_beams,'still on after his next turn'); F.acting=tom; endTurn(F,tom,100,[]); ok(!tom.st.high_beams,'gone after the one after that'); });
  noCrit(()=>{ const {F,tom,f0,f1}=fight(4); tom.pep=10; for(const f of [f0,f1]) { add(F,f,'t_buff',{src:f}); add(F,f,'mend',{src:f}); }
    go(F,tom,'tarmac_porsche_transfer','*'); ok([f0,f1].every(f=>!f.st.mend&&!!f.st.t_buff),'each monster loses exactly 1 buff, the heaviest: '+J([f0,f1].map(f=>Object.keys(f.st)))); });

  // 87. Sensory Satisfying: whoever is next on the bar as Grace's turn ends, if they are family, hits 15% harder for their next turn
  noCrit(()=>{ const {F,grace,deedee,tom,f0}=fight(1); const N=next(F); ok(N.unit===grace,'Grace opens');
    const b=act(F,grace,'soup_dumpling_squeeze','f0').beats; ok(!!deedee.st.so_satisfying&&has(b,'status',x=>x.tgt===deedee.key&&x.id==='so_satisfying'&&x.g==='end'),'Deedee is next on the bar and gets it');
    ok(!tom.st.so_satisfying,'nobody else does'); ok(near(outMult(deedee),1.15)&&near(mult(deedee,'healGiven'),1.15),'15% more damage and healing: '+outMult(deedee));
    const N2=next(F); ok(N2.unit===deedee,'Deedee acts next'); const h=hits(act(F,deedee,'windex_spritz','f0').beats)[0];
    ok(h.dmg===Math.round(26*.5*100/112*1.15),'her hit is 15% bigger: '+h.dmg); ok(!deedee.st.so_satisfying,'and it is gone when her turn ends'); });
  noCrit(()=>{ const {F,grace,deedee,f0}=fight(1); next(F); for(const p of F.party) if(p!==grace) p.wait=Math.max(p.wait,5); f0.wait=.001; act(F,grace,'soup_dumpling_squeeze','f0');
    ok(!F.party.some(p=>p.st.so_satisfying),'a monster is next: nobody gets it'); });

  // 88. Slow-Rise Memory Foam: Grace moves someone on the bar and gets 15% Evasion until her next turn begins
  noCrit(()=>{ const {F,grace,rose,f0}=fight(3,{grace:['slow_rise_memory_foam']}); next(F);
    act(F,grace,'soup_dumpling_squeeze','f0'); ok(!grace.st.memory_foam,'a plain hit moves nobody');
    grace.pep=10; go(F,grace,'needoh_stretch_pass',rose.key); ok(!!grace.st.memory_foam&&near(G('b3Evasion')(grace),.15),'NeeDoh Stretch Pass moves Rose: Memory Foam, 15% Evasion');
    F.acting=grace; endTurn(F,grace,100,[]); ok(!!grace.st.memory_foam,'it does not count down with her turns');
    const beats=[]; G('b3BeginTurn')(F,grace,beats); ok(!grace.st.memory_foam&&has(beats,'statusEnd',x=>x.id==='memory_foam'),'it ends as her next turn begins'); });
  noCrit(()=>{ const {F,grace,deedee,f0}=fight(3,{grace:['slow_rise_memory_foam']}); add(F,f0,'drenched',{src:deedee});
    const b=go(F,grace,'soup_dumpling_squeeze','f0'); ok(has(b,'detonate',x=>x.id==='hydro_slip')&&!!grace.st.memory_foam,'a Hydro-Slip! she sets off is a push she caused');
    endSt(F,grace,'memory_foam'); grace.pep=10; go(F,grace,'crunchy_sugar_cube_pop','f1'); ok(!!grace.st.memory_foam,'so is Crunchy Sugar-Cube Pop\'s push'); });

  // 89. Ultra-Rare Limited Edition: 30% less Recovery after a Skill aimed at a family member
  { const {F,grace,rose,f0}=fight(5,{grace:['ultra_rare_limited_edition']}); grace.pep=10;
    ok(near(moveRec(F,grace,SK.needoh_stretch_pass),70)&&near(moveRec(F,grace,SK.colossal_diamond_gold_dumpling),84)&&near(moveRec(F,grace,SK.pick_me_up),70),'NeeDoh 70, the Dumpling 84, Pick-Me-Up 70');
    ok(near(moveRec(F,grace,SK.crunchy_sugar_cube_pop),100)&&near(moveRec(F,grace,SK.soup_dumpling_squeeze),80),'a Skill on a monster and the Basic keep theirs');
    go(F,grace,'needoh_stretch_pass',rose.key); ok(near(grace.wait,70*100/stat(grace,'spd')),'her wait after NeeDoh: '+grace.wait);
    const X=fight(5); ok(near(moveRec(X.F,X.grace,SK.needoh_stretch_pass),100),'without the Quirk it is 100'); }

  // 90. Colossal Diamond-Gold Dumpling: a free Skill of 4 Pep or less for one family member, at once, in place
  noCrit(()=>{ const {F,grace,rose,tom,f0}=fight(4); next(F); grace.pep=10; rose.pep=4; const w=rose.wait,turns=rose.turns;
    const b=act(F,grace,'colossal_diamond_gold_dumpling',rose.key).beats;
    ok(grace.pep===5&&rose.pep===5,'6 Pep, then 1 Pep each: Grace '+grace.pep+', Rose '+rose.pep); ok(has(b,'grant',x=>x.tgt===rose.key)&&F.grant&&F.grant.key===rose.key,'the door is open for Rose');
    ok(near(grace.wait,120*100/stat(grace,'spd')),'Grace waits a Capstone\'s Recovery');
    ok(J(skillsOf(F,rose).map(S=>S.id))===J(['the_floor_is_lava','giddyup_tata_launch'])&&G('b3Cost')(F,rose,SK.giddyup_tata_launch)===0,'Rose may pick a Skill of 4 Pep or less, free: '+J(skillsOf(F,rose).map(S=>S.id)));
    ok(!act(F,rose,rose.basic,'f0').ok,'not her Basic'); ok(!!F.grant,'a refused pick leaves the door open');
    const r=act(F,rose,'giddyup_tata_launch','f0'); ok(r.ok&&has(r.beats,'act',x=>x.free)&&hits(r.beats,f0.key).length===2,'she uses "Giddyup, Tata!" Launch at once');
    ok(rose.pep===5&&near(rose.wait,w)&&rose.turns===turns,'it costs nothing, and her place on the bar and her turn count do not move: Pep '+rose.pep+', wait '+rose.wait);
    ok(has(r.beats,'grantEnd')&&!has(r.beats,'endTurn')&&F.grant===null,'the free action closes without ending a turn');
    ok(rose.granted===1,'it was her one granted action this round');
    grace.pep=10; F.acting=grace; const o=opts(F,grace,SK.colossal_diamond_gold_dumpling).find(x=>x.key===rose.key); ok(o&&/already had a free action/.test(o.no),'so she cannot be chosen again this round: '+(o&&o.no));
    ok(!opts(F,grace,SK.colossal_diamond_gold_dumpling).find(x=>x.key===tom.key).no,'Tom still can');
    roundStart(F,[]); ok(!opts(F,grace,SK.colossal_diamond_gold_dumpling).find(x=>x.key===rose.key).no,'a new round: she can again'); });
  noCrit(()=>{ const {F,grace,rose,tom}=fight(4); next(F); grace.pep=10; tom.skills=[];
    const o=opts(F,grace,SK.colossal_diamond_gold_dumpling).find(x=>x.key===tom.key); ok(o&&/no Skill that costs 4 Pep or less/.test(o.no),'someone with no such Skill cannot be chosen: '+(o&&o.no));
    act(F,grace,'colossal_diamond_gold_dumpling',rose.key); ok(!!F.grant,'granted'); const N=next(F); ok(F.grant===null&&N.unit!==null,'a free action nobody took is gone when the clock moves'); });
  noCrit(()=>{ const {F,grace,rose,f0,f1}=fight(4); next(F); grace.pep=10; f0.hp=f0.maxHp=1; f1.hp=0; f1.ko=true;
    act(F,grace,'colossal_diamond_gold_dumpling',rose.key); const r=act(F,rose,'giddyup_tata_launch','f0'); ok(F.over==='win'&&has(r.beats,'over',x=>x.result==='win'),'a free Skill can win the fight'); });

  // 91. Bouncy Physics: +2% Family Ruckus for each hit of a move that hits more than once
  noCrit(()=>{ const {F,rose,tom,f0}=fight(1); ok(F.ruckus===0,'the gauge starts empty');
    let b=go(F,rose,'lamb_tuck_ankle_tackle','f0'); ok(F.ruckus===4&&b.filter(x=>x.t==='ruckus').length===2,'two hits: 4%: '+F.ruckus);
    rose.pep=10; go(F,rose,'the_floor_is_lava','*'); ok(F.ruckus===10,'three more hits: 10%: '+F.ruckus);
    go(F,rose,'t_clobber','f0'); ok(F.ruckus===10,'a move that hits once adds nothing'); go(F,tom,'t_multi','f0'); ok(F.ruckus===10,'and it is Rose\'s Trait, not Tom\'s');
    F.ruckus=99; go(F,rose,'lamb_tuck_ankle_tackle','f0'); ok(F.ruckus===100,'the gauge stops at 100'); });
  ok(NF({party:LAB,level:2,formation:'mudling',seed:5,ruckus:40}).ruckus===40,'a fight can start with the gauge the family walked in with');

  // 92. Spit Shine: a monster Deedee leaves Drenched takes 30% more from the next Clobber hit by someone else
  noCrit(()=>{ const {F,deedee,tom,grace,f0,f1}=fight(5,{deedee:['spit_shine']},'bigone'); const base=Math.round(stat(tom,'atk')*100/117);
    go(F,deedee,'windex_spritz','f0'); ok(!!f0.st.drenched&&!!f0.st.spit_shine,'Windex Spritz leaves it Drenched and shined');
    let h=hits(go(F,deedee,'t_clobber','f0'))[0]; ok(h.dmg===Math.round(stat(deedee,'atk')*100/117)&&!!f0.st.spit_shine,'Deedee\'s own Clobber hit gets nothing and leaves the shine: '+h.dmg);
    h=hits(go(F,tom,'t_racket','f0'))[0]; ok(!!f0.st.spit_shine,'a Racket hit leaves it too');
    h=hits(go(F,tom,'t_clobber','f0'))[0]; ok(h.dmg===Math.round(stat(tom,'atk')*100/117*1.3)&&h.dmg>base,'Tom\'s Clobber hit is 30% bigger: '+h.dmg+' against '+base); ok(!f0.st.spit_shine,'and the shine is used up');
    h=hits(go(F,tom,'t_clobber','f0'))[0]; ok(h.dmg===base,'the hit after that is back to normal: '+h.dmg);
    add(F,f0,'drenched',{src:tom}); ok(!f0.st.spit_shine,'Drenched from someone else is not shined'); });

  // 93. Twin-Lamb Relay: a rider is held for the later hits of Rose's multi-hit move, at 40%
  noCrit(()=>{ const run=q=>{ const {F,deedee,rose,f0}=fight(5,{deedee:['spit_shine'],rose:q},'bigone'); go(F,deedee,'windex_spritz','f0'); rose.pep=10; const b=go(F,rose,'the_floor_is_lava','*'); return {b,f0,rose,d:hits(b,f0.key).map(x=>x.dmg)}; };
    const A=run(['twin_lamb_relay']),B=run([]),per=stat(A.rose,'atk')/3*100/117,want=k=>Math.round(per*k);
    ok(J(B.d)===J([want(1.3),want(1),want(1)]),'without the Quirk only the first hop gets Spit Shine: '+J(B.d));
    ok(J(A.d)===J([want(1.3),want(1.12),want(1.12)]),'with it the later hops get 40% of it (+12%): '+J(A.d)+' want '+J([want(1.3),want(1.12),want(1.12)]));
    ok(J(A.d)!==J(B.d),'and the two differ'); ok(!A.f0.st.spit_shine&&A.b.filter(x=>x.t==='statusEnd'&&x.id==='spit_shine').length===1,'the shine comes off once, when the move ends'); });
  noCrit(()=>{ const {F,grace,rose,f0}=fight(5,{rose:['twin_lamb_relay']}); go(F,grace,'soup_dumpling_squeeze','f0'); const p=rose.pep;
    const b=go(F,rose,'lamb_tuck_ankle_tackle','f0'); ok(rose.pep===p+2+1,'Squished pays its 1 Pep once: a Pep cannot be split: '+(rose.pep-p-2)); ok(!f0.st.squished,'and is gone after the move'); });
  noCrit(()=>{ const {F,deedee,rose,f0}=fight(5,{deedee:['spit_shine'],rose:['twin_lamb_relay']},'bigone'); go(F,deedee,'windex_spritz','f0');
    const h=hits(go(F,rose,'t_clobber','f0'))[0]; ok(h.dmg===Math.round(stat(rose,'atk')*100/117*1.3)&&!f0.st.spit_shine,'a move that hits once uses the rider up as usual'); });

  // 94. Double-Lamby Return-Cart Blitz: six ricochets, capstone power shared; on a Flustered monster each hit is 10% more than the last
  noCrit(()=>{ const {F,rose,f0}=fight(4,null,'bigone'); rose.pep=10; const per=stat(rose,'atk')*2.2/6*100/117;
    const b=go(F,rose,'double_lamby_return_cart_blitz','*'),d=hits(b,f0.key).map(x=>x.dmg);
    ok(d.length===6&&d.every(x=>x===Math.round(per)),'six hits of capstone power shared: '+J(d)); ok(rose.pep===4&&near(rose.wait,120),'6 Pep, Recovery 120'); ok(F.ruckus===12,'Bouncy Physics counts all six: '+F.ruckus);
    add(F,f0,'flustered',{src:rose}); rose.pep=10; const d2=hits(go(F,rose,'double_lamby_return_cart_blitz','*'),f0.key).map(x=>x.dmg),want=[1,2,3,4,5,6].map(k=>Math.round(per*(1+.1*k)*1.35));
    ok(J(d2)===J(want),'on a Flustered monster: +10% for the 1st up to +60% for the 6th (and Flustered\'s own 35%): '+J(d2)+' want '+J(want)); });
  noCrit(()=>{ const {F,rose,f0,f1}=fight(4); rose.pep=10; const b=go(F,rose,'double_lamby_return_cart_blitz','*'); ok(hits(b).length===6&&hits(b,f0.key).length>0&&hits(b,f1.key).length>0,'the six ricochet between the monsters'); });

  // 95. "It's OUR Longboard Now": 3 hits landed in one turn give 25% Speed until her next turn begins
  noCrit(()=>{ const {F,rose,f0}=fight(5,{rose:['its_our_longboard_now']});
    go(F,rose,'lamb_tuck_ankle_tackle','f0'); ok(!rose.st.our_longboard&&near(rose.wait,80),'two hits are not enough: wait '+rose.wait);
    rose.pep=10; go(F,rose,'the_floor_is_lava','*'); ok(!!rose.st.our_longboard&&near(rose.wait,100*100/125),'three hits: she is back up the bar sooner: wait '+rose.wait);
    const beats=[]; G('b3BeginTurn')(F,rose,beats); ok(!rose.st.our_longboard,'it ends as her next turn begins'); });

  // 96. Spotless Floor: once a round, Deedee's shave on a Drenched monster takes 1 more pip
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(2,null,'log'); endSt(F,f0,'mossy_brace'); deedee.pep=10;
    go(F,deedee,'windex_spritz','f0'); ok(f0.pips===4,'Windex takes no pip from Log Lump (Drench is not its Pet Peeve)');
    let b=go(F,deedee,'hand_me_my_glasses_scrub','f0'); ok(has(b,'detonate',x=>x.id==='hydro_slip')&&f0.pips===2,'her Scrub sets off Hydro-Slip!: 1 pip and 1 more: '+f0.pips+' of 4 left');
    ok(has(b,'passive',x=>x.id==='spotless_floor')&&b.filter(x=>x.t==='pips').length===2,'the screen is told why');
    go(F,deedee,'windex_spritz','f0'); b=go(F,deedee,'hand_me_my_glasses_scrub','f0'); ok(f0.pips===1,'the second time in the same round: only the 1: '+f0.pips);
    roundStart(F,[]); f0.pips=4; go(F,deedee,'windex_spritz','f0'); go(F,deedee,'t_clobber','f0'); ok(f0.pips===2,'a new round: 1 more again: '+f0.pips);
    roundStart(F,[]); f0.pips=4; go(F,deedee,'windex_spritz','f0'); go(F,tom,'t_clobber','f0'); ok(f0.pips===3,'Tom\'s shave on a Drenched monster is not Deedee\'s: '+f0.pips);
    f0.pips=4; add(F,f0,'toasty',{src:tom}); go(F,deedee,'t_racket','f0'); ok(f0.pips===3,'a monster that is not Drenched: no extra pip: '+f0.pips); });
  noCrit(()=>{ const {F,deedee,f0}=fight(1,null,'log'); endSt(F,f0,'mossy_brace'); f0.peeves=['drench'];
    go(F,deedee,'windex_spritz','f0'); ok(f0.pips===2,'a Pet Peeve Drench hit leaves it Drenched as the pips come off: 1 and 1 more: '+f0.pips); f0.peeves=['sizzle']; });
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(1,null,'log'); endSt(F,f0,'mossy_brace'); f0.peeves=['clobber'];
    add(F,f0,'drenched',{src:deedee}); SK.t_pips2={id:'t_pips2',vibe:'deedee_neat',slot:'s1',name:'Test pips',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:2,effects:[{op:'damage'}],desc:'test'};
    go(F,deedee,'t_pips2','f0'); ok(f0.pips===1,'the extra pip is inside the 3-pip cap (Pet Peeve 1, Hydro-Slip! 1, printed 2, Spotless Floor 1): '+f0.pips+' of 4 left'); delete SK.t_pips2; f0.peeves=['sizzle']; });
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(2,null,'log'); endSt(F,f0,'mossy_brace'); deedee.pep=10; go(F,deedee,'wet_floor_hazard','*'); add(F,f0,'drenched',{src:deedee}); add(F,tom,'t_aim',{});
    const b=foeAct(F,f0,'branch_jab'); ok(has(b,'hazardTrip')&&f0.pips===2,'a slip on her wet floor is her shave: Hydro-Slip! 1 and 1 more: '+f0.pips); });

  // 97. Car-Crumb Vacuum: stripping a buff gives the whole family 15% Attack for 1 turn, once per action
  noCrit(()=>{ const {F,deedee,tom,grace,rose,f0}=fight(3,{deedee:['car_crumb_vacuum']}); deedee.pep=10; const a0=stat(tom,'atk');
    let b=go(F,deedee,'hand_me_my_glasses_scrub','f0'); ok(!F.party.some(p=>p.st.crumb_free),'nothing to strip: nothing happens');
    add(F,f0,'t_buff',{src:f0}); add(F,f0,'mend',{src:f0}); b=go(F,deedee,'hand_me_my_glasses_scrub','f0');
    ok(F.party.every(p=>p.st.crumb_free)&&b.filter(x=>x.t==='status'&&x.id==='crumb_free').length===4,'two buffs scrubbed: everyone gets it once: '+b.filter(x=>x.t==='status'&&x.id==='crumb_free').length);
    ok(near(stat(tom,'atk'),a0*1.15),'15% more Attack: '+stat(tom,'atk')); F.acting=tom; endTurn(F,tom,100,[]); ok(!tom.st.crumb_free,'for 1 turn');
    ok(!!deedee.st.crumb_free,'Deedee keeps hers through her next turn'); F.acting=deedee; endTurn(F,deedee,100,[]); ok(!deedee.st.crumb_free,'and then it ends'); });
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(3,{deedee:['car_crumb_vacuum']}); add(F,f0,'dazzled',{src:tom}); add(F,f0,'t_buff',{src:f0});
    const b=go(F,deedee,'t_clobber','f0'); ok(has(b,'detonate',x=>x.id==='shatter_glitz')&&F.party.every(p=>p.st.crumb_free),'a buff her Shatter Glitz! strips counts'); });

  // 98. Fifty-Year Dust Tsunami: every buff off every monster, the family's floor cleared, then a heavy Drench wave
  noCrit(()=>{ const {F,deedee,tom,f0,f1}=fight(4,{deedee:[]},'skeeter'); deedee.pep=10; const sk=F.foes.find(f=>f.id==='skeeter'),mud=F.foes.find(f=>f.id==='mudling');
    add(F,mud,'t_buff',{src:mud}); add(F,mud,'mend',{src:mud}); F.hazards.push({id:'t_goo',side:'party',uses:2,rounds:3,src:mud.key}); go(F,tom,'t_clobber',mud.key); deedee.pep=10; go(F,deedee,'wet_floor_hazard','*'); deedee.pep=10;
    const b=go(F,deedee,'fifty_year_dust_tsunami','*');
    ok(!sk.st.jitterflight&&!mud.st.t_buff&&!mud.st.mend,'every buff is off'); ok(!F.hazards.some(h=>h.side==='party')&&has(b,'hazardEnd',x=>x.id==='t_goo'),'the family\'s floor is clear');
    ok(F.hazards.some(h=>h.id==='wet_floor'&&h.side==='foe'),'her own Wet Floor under the monsters stays');
    const hm=hits(b,mud.key)[0],hs=hits(b,sk.key)[0]; ok(hm&&hm.dmg===Math.round(stat(deedee,'atk')*1.6*.7*100/112),'heavy at the all-monsters share on the Mudling: '+(hm&&hm.dmg));
    ok(hs&&hs.dmg===Math.round(stat(deedee,'atk')*1.6*.7*100/114*1.5)&&hs.peeve,'the Skeeter Swarm cannot dodge once Jitterflight is scrubbed off, and Drench is its Pet Peeve: '+(hs&&hs.dmg));
    ok(!!sk.st.drenched&&!!mud.st.drenched,'both are left Drenched'); ok(deedee.pep===5&&near(deedee.wait,120*100/stat(deedee,'spd')),'5 Pep, a Capstone\'s Recovery');
    ok(b.findIndex(x=>x.t==='statusEnd'&&x.why==='strip')<b.findIndex(x=>x.t==='hit'),'the scrub comes before the wave'); });
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(5,{deedee:['car_crumb_vacuum','spit_shine']}); deedee.pep=10; add(F,f0,'toasty',{src:tom}); add(F,f0,'t_buff',{src:f0});
    const b=go(F,deedee,'fifty_year_dust_tsunami','*'); ok(has(b,'detonate',x=>x.id==='steam_cloud')&&!f0.st.drenched,'a Toasty monster gets Steam Cloud! instead and is not left Drenched (spec 2.5)');
    ok(F.party.every(p=>p.st.crumb_free)&&b.filter(x=>x.t==='status'&&x.id==='crumb_free').length===4,'Car-Crumb Vacuum goes off once for the whole wave'); ok(!!F.foes[1].st.spit_shine&&!f0.st.spit_shine,'Spit Shine marks the one left Drenched'); });

  // 99. The list a tap opens names the Trait and the equipped Quirks
  { const {F,tom}=fight(5,{tom:['upgrade_certificate','million_miler_status']}),rows=carried(F,tom).filter(r=>r.kind==='trait'||r.kind==='quirk').map(r=>r.short+':'+r.name);
    ok(J(rows)===J(['TRAIT:Priority Boarding','QUIRK:Upgrade Certificate','QUIRK:Million-Miler Status']),'Tom\'s list: '+J(rows)); }

  // 100. The simple player can use all four Capstones and a free Skill without breaking a rule
  { const used={},q={tom:['upgrade_certificate','million_miler_status'],grace:['slow_rise_memory_foam','ultra_rare_limited_edition'],rose:['twin_lamb_relay','its_our_longboard_now'],deedee:['car_crumb_vacuum','spit_shine']};
    let err='',free=0,wins=0;
    for(const f of ['toad','log','grump']) for(let s=1;s<=30;s++) { try { const r=play({party:LAB,level:2,formation:f,seed:s,loadouts:book(5,q),mods:{foeHp:3}}); for(const k in r.moves) used[k]=(used[k]||0)+r.moves[k]; free+=r.free||0; if(r.result==='win') wins++; } catch(e) { err=err||(f+' seed '+s+': '+e.message); } }
    ok(!err,'90 Rank 5 fights with every Quirk on run clean: '+err); ok(wins===90,'and are won: '+wins);
    // Grace carries two Capstones from 5b on (the Craft Artist's Makeover as well); the simple player takes whichever scores higher.
    for(const c of ['tarmac_porsche_transfer','double_lamby_return_cart_blitz','fifty_year_dust_tsunami']) ok(used[c]>0,'the simple player used '+c+': '+(used[c]||0));
    ok((used.colossal_diamond_gold_dumpling||0)+(used.masterpiece_portrait_makeover||0)>0,'and one of Grace\u2019s Capstones: '+(used.colossal_diamond_gold_dumpling||0)+' Colossal, '+(used.masterpiece_portrait_makeover||0)+' Makeover');
    ok(!used.colossal_diamond_gold_dumpling||free>0,'and took free Skills when it granted them: '+free); }

  // The test rows come out again, and the data check says what it said before this file ran.
  delete ST.t_aim; delete ST.t_buff; delete SK.t_clob_basic; delete HZ.t_goo;
  ok(J(G('b3CheckData')())===bad0,'data check after this file\'s test rows are gone: '+J(G('b3CheckData')()));
};
