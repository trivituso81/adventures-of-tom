// tools/b3-check-s5b.js — Battle 3 rule tests for stage 5b: everything of Tom's Gamer Geek and Grace's Craft Artist that stage 5a
// left as a name: Winged Shell Lock-On, Konami Code, Bedazzle-Gun Glue Trap, Masterpiece Portrait Makeover, Gamer's Intuition,
// Creative Mess, Elixir Hoarder, New Game Plus, Permanent Marker, Double Coat, and Cartridge Blow's second half (a monster's
// next aim, shown and kept). The pieces they needed: the `srcBegin` duration, a status's answer that is its putter's, listener
// conditions (pepAtLeast, kinds, tgtFoe, attacks, actionTarget, limitKey), mods that read Pet Peeves, Primes and a Skill's Pep,
// a status that makes a Pet Peeve, a hazard that catches every act, and the one-off Double Coat.
// `node tools/b3-sim.js check` runs it after the file for stage 5a. Real loadouts (no cfg.plain): Tom and Grace play their
// second Sig Vibe as Main here.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,foeTurn,SK,ST,HZ,VIBES,TRAITS,QUIRKS,SOON,add,endSt,stat,mult,taken,newL,setQuirk,setMain,ladder,carried,roundStart,endTurn,beginTurn,fire,cost,peeves,critChance,intentRefresh,koCheck,sumOf]=
    ['b3NewFight','b3Next','b3Act','b3FoeTurn','B3_SKILLS','B3_STATUS','B3_HAZARDS','B3_VIBES','B3_TRAITS','B3_QUIRKS','B3_SOON','b3AddStatus','b3EndStatus','b3Stat','b3Mult','b3TakenMult',
     'b3NewLoadout','b3SetQuirk','b3SetMain','b3Ladder','b3Carried','b3RoundStart','b3EndTurn','b3BeginTurn','b3Fire','b3Cost','b3Peeves','b3CritChance','b3IntentRefresh','b3KoCheck','b3Sum'].map(G);
  const LAB=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x),RULES=G('B3_RULES'),PW=RULES.power;
  const bad0=J(G('b3CheckData')());
  // Loadouts at Rank 5, with Tom and Grace playing their second Sig Vibe as Main and the Quirks named per member.
  const book=(q,swap)=>{ const B={}; for(const id of LAB) { B[id]=newL(id,5); if((swap||['tom','grace']).includes(id)) setMain(id,B[id],B[id].pocket);
    ((q||{})[id]||[]).forEach((x,i)=>{ if(!setQuirk(id,B[id],i,x)) throw new Error('test could not equip '+x); }); } return B; };
  const fight=(q,formation,cfg)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5,formation:formation||'mudling',loadouts:book(q)},cfg||{}));
    const P={}; for(const p of F.party) P[p.id]=p; for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; }
    return {F,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,rose:P.rose,deedee:P.deedee}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; },G_go=go;
  const foeAct=(F,e,id)=>{ const ix=e.D.acts.findIndex(A=>A.id===id); e.actIx=ix; e.charge=null; e.turns=1; e.lastUse={}; F.acting=e; return foeTurn(F,e); };
  const hits=(beats,key)=>beats.filter(b=>b.t==='hit'&&(!key||b.tgt===key));
  const has=(beats,t,f)=>beats.some(b=>b.t===t&&(!f||f(b)));
  const def=u=>stat(u,'def');
  // Test rows, in the sandbox only; taken out again at the end of this file.
  SK.t_five={id:'t_five',vibe:'tom_gamer',slot:'s1',name:'Test five',pep:5,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_cm={id:'t_cm',vibe:'grace_craft',slot:'s1',name:'Test Mess',pep:0,flavor:['razzle'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'slow',to:'target'}]};
  SK.t_mix={id:'t_mix',vibe:'grace_craft',slot:'s1',name:'Test Mix',pep:0,flavor:['sizzle','razzle'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_slow={id:'t_slow',vibe:'grace_craft',slot:'s1',name:'Test Slow',pep:0,flavor:['support'],power:0,hits:0,target:'foe',tags:[],composure:0,effects:[{op:'status',id:'slow',to:'target'}]};
  SK.t_squish={id:'t_squish',vibe:'grace_craft',slot:'s1',name:'Test Squish',pep:0,flavor:['support'],power:0,hits:0,target:'foe',tags:[],composure:0,effects:[{op:'status',id:'squished',to:'target'}]};
  ST.t_aim={id:'t_aim',name:'Test Aim',kind:'buff',group:null,dur:{n:99,unit:'turn'},mods:[],flags:['taunt'],weight:1,short:'AIM',color:'#fff',desc:'test'};

  // 101. Both second Sig Vibes are complete: nothing is a name only any more
  for(const v of ['tom_gamer','grace_craft']) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un)); ok(!VIBES[v].skills.some(s=>SOON[s])&&!(VIBES[v].quirks||[]).some(q=>QUIRKS[q].soon)&&!TRAITS[VIBES[v].trait].soon,v+': no Skill, Trait or Quirk is still only a name'); }
  ok(!SOON.winged_shell_lock_on&&!SOON.konami_code&&!SOON.bedazzle_gun_glue_trap&&!SOON.masterpiece_portrait_makeover,'B3_SOON no longer names the four Skills');

  // 102. Gamer's Intuition: +20% to a Pet Peeve or a Prime (once, not both), and Detonations fill the Ruckus gauge 5 more
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); const calc=m=>Math.round(stat(tom,'atk')*m*100/(100+def(f0)));
    let h=hits(go(F,tom,'t_clobber','f0'),'f0')[0]; ok(h.dmg===calc(1),'no Peeve, no Prime: plain '+h.dmg+' want '+calc(1));
    f0.st={}; h=hits(go(F,tom,'t_racket','f0'),'f0')[0]; ok(h.peeve&&h.dmg===calc(1.5*1.2),'a Pet Peeve (Racket on a Mudling): +20% on top of the Peeve: '+h.dmg+' want '+calc(1.5*1.2));
    f0.st={}; add(F,f0,'dazzled',{src:grace}); h=hits(go(F,tom,'t_clobber','f0'),'f0')[0]; ok(h.dmg===calc(1.2),'a Prime on the monster: +20%: '+h.dmg+' want '+calc(1.2));
    f0.st={}; add(F,f0,'dazzled',{src:grace}); const b=go(F,tom,'t_racket','f0'); h=hits(b,'f0')[0];
    ok(has(b,'detonate',x=>x.id==='sensory_overload')&&h.dmg===calc(1.5*1.2),'a hit that sets the Prime off still counts it, and the Peeve and the Prime make one +20%, not two: '+h.dmg+' want '+calc(1.5*1.2));
    f0.st={}; add(F,f0,'dazzled',{src:tom}); h=hits(go(F,grace,'t_clobber','f0'),'f0')[0]; ok(h.dmg===Math.round(stat(grace,'atk')*100/(100+def(f0))),'Grace gets nothing from Tom’s Trait: '+h.dmg); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); ok(F.ruckus===0,'the gauge starts empty'); go(F,tom,'t_clobber','f0'); ok(F.ruckus===0,'a plain hit adds nothing');
    f0.st={}; add(F,f0,'dazzled',{src:grace}); const b=go(F,tom,'t_racket','f0'); ok(F.ruckus===13&&has(b,'ruckus',x=>x.why==='detonation'&&x.n===8)&&has(b,'ruckus',x=>x.why==='trait'&&x.n===5),'a Detonation fills 8 (stage 6) and Tom\u2019s Trait adds 5 on top: '+F.ruckus);
    f0.st={}; add(F,f0,'dazzled',{src:tom}); const g=go(F,grace,'t_racket','f0'); ok(F.ruckus===26&&has(g,'ruckus',x=>x.why==='detonation'&&x.n===8)&&!has(g,'ruckus',x=>x.why==='trait'),'one Grace sets off fills 8 and a Mix 5, with no Trait extra: '+F.ruckus); });

  // 103. Elixir Hoarder: 6 Pep or more as his turn starts gives 15% Speed and 15% crit until his next turn begins
  noCrit(()=>{ const {F,tom}=fight({tom:['elixir_hoarder']}); const s0=stat(tom,'spd'),c0=sumOf(tom,'crit'); tom.pep=5; let b=[]; beginTurn(F,tom,b);
    ok(!tom.st.elixir_buzz,'5 Pep: nothing'); tom.pep=6; b=[]; beginTurn(F,tom,b);
    ok(!!tom.st.elixir_buzz&&near(stat(tom,'spd'),s0*1.15,.6)&&near(sumOf(tom,'crit')-c0,.15)&&has(b,'passive',x=>x.id==='elixir_hoarder'),'6 Pep: 15% faster ('+stat(tom,'spd')+' from '+s0+') and +15% crit, and the screen says so');
    go(F,tom,'t_clobber','f0'); ok(!!tom.st.elixir_buzz,'it is still on after his turn is over (it covers the wait that turn sets)');
    tom.pep=5; b=[]; beginTurn(F,tom,b); ok(!tom.st.elixir_buzz&&has(b,'statusEnd',x=>x.id==='elixir_buzz'),'and gone as his next turn begins when he has spent it'); });
  noCrit(()=>{ const {F,tom}=fight(); tom.pep=9; beginTurn(F,tom,[]); ok(!tom.st.elixir_buzz,'without the Quirk equipped, nothing'); });

  // 104. New Game Plus: after a Detonation or a counter, the next Skill of 4 Pep or less costs 2 less (1 at the least); once a round
  noCrit(()=>{ const {F,tom,grace,f0}=fight({tom:['new_game_plus']}); const S=SK.winged_shell_lock_on,T=SK.controller_toss;
    ok(cost(F,tom,S)===4&&!tom.st.new_game_plus,'at first a 4 Pep Skill costs 4');
    add(F,f0,'dazzled',{src:grace}); const b=go(F,tom,'t_racket','f0'); ok(has(b,'detonate')&&!!tom.st.new_game_plus&&tom.st.new_game_plus.n===1,'a Detonation puts New Game Plus on Tom');
    ok(cost(F,tom,S)===2&&cost(F,tom,T)===1&&cost(F,tom,SK.t_five)===5&&cost(F,tom,SK.konami_code)===6,'a 4 Pep Skill costs 2, a 2 Pep Skill costs 1 (never 0), a 5 Pep Skill and a Capstone are unchanged: '+[cost(F,tom,S),cost(F,tom,T),cost(F,tom,SK.t_five),cost(F,tom,SK.konami_code)]);
    tom.pep=10; go(F,tom,'winged_shell_lock_on','f1'); ok(tom.pep===8,'the next Skill is paid at the lower cost: Pep '+tom.pep); ok(!tom.st.new_game_plus&&cost(F,tom,S)===4,'and the discount is gone once that turn is over'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight({tom:['new_game_plus']}); add(F,f0,'dazzled',{src:grace}); go(F,tom,'t_racket','f0'); endSt(F,tom,'new_game_plus');
    add(F,f0,'dazzled',{src:grace}); go(F,tom,'t_racket','f0'); ok(!tom.st.new_game_plus,'a second Detonation in the same round does not set it up again');
    fire(F,'counter',{src:tom,tgt:f0,g:'x',c:{}},[]); ok(!tom.st.new_game_plus,'nor does a counter: one trigger a round for both');
    roundStart(F,[]); fire(F,'counter',{src:tom,tgt:f0,g:'x',c:{}},[]); ok(!!tom.st.new_game_plus,'a new round: a counter sets it up'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight({tom:['new_game_plus']}); fire(F,'counter',{src:grace,tgt:f0,g:'x',c:{}},[]); ok(!tom.st.new_game_plus,'only Tom’s own counters count'); });

  // 105. Winged Shell Lock-On: a Clobber hit; the shell on the monster slams down for a free Razzle hit if it attacks before Tom's next turn
  noCrit(()=>{ const {F,tom,f0,f1}=fight(); tom.hp=tom.maxHp=9000; tom.pep=10; const b=go(F,tom,'winged_shell_lock_on','f0');
    const h=hits(b,'f0')[0]; ok(h&&h.flavor==='clobber'&&h.dmg===Math.round(stat(tom,'atk')*100/(100+def(f0))),'a standard Clobber hit: '+(h&&h.dmg)); ok(tom.pep===6,'4 Pep');
    const s=f0.st.winged_shell; ok(s&&s.src===tom.key&&s.unit==='srcBegin'&&!f1.st.winged_shell,'the shell is on that monster only, and it is Tom’s');
    ok(carried(F,f0).some(r=>r.short==='SHELL'&&/Tom/.test(r.left)),'the list says it goes at Tom’s next turn: '+J(carried(F,f0).filter(r=>r.short==='SHELL')));
    f0.turns=5; f0.lastUse={}; const w=foeTurn(F,f0); ok(has(w,'telegraph')&&!!f0.st.winged_shell&&!has(w,'react'),'a wind-up is not an attack: the shell waits');
    const a=foeTurn(F,f0),r=hits(a,'f0').filter(x=>x.src===tom.key);
    ok(has(a,'react',x=>x.src===tom.key&&x.tgt==='f0')&&r.length===1&&r[0].flavor==='razzle'&&r[0].dmg===Math.round(stat(tom,'atk')*100/(100+def(f0))),'when the wound-up attack goes off, Tom’s shell slams it: one standard Razzle hit '+J(r.map(x=>x.dmg)));
    ok(!f0.st.winged_shell&&has(a,'statusEnd',x=>x.id==='winged_shell'),'and the shell is used up');
    const c=foeAct(F,f0,'wobble'); ok(!hits(c,'f0').some(x=>x.src===tom.key),'the next attack meets no shell'); });
  noCrit(()=>{ const {F,tom,f0}=fight(); tom.hp=tom.maxHp=9000; tom.pep=10; go(F,tom,'winged_shell_lock_on','f0'); beginTurn(F,f0,[]); ok(!!f0.st.winged_shell,'another unit’s turn beginning does not end it');
    const b=[]; beginTurn(F,tom,b); ok(!f0.st.winged_shell&&has(b,'statusEnd',x=>x.id==='winged_shell'&&x.tgt==='f0'),'Tom’s next turn begins: it goes'); });
  noCrit(()=>{ const {F,tom,f0}=fight(); tom.hp=tom.maxHp=9000; tom.pep=10; go(F,tom,'winged_shell_lock_on','f0'); tom.hp=0; koCheck(F,{beats:[],g:0}); ok(!f0.st.winged_shell,'if Tom is knocked out first, the shell does not hang there for ever'); });

  // 106. Konami Code: heavy Razzle on every monster at 70%, 2 Composure pips each, 15% more crit chance per Prime
  noCrit(()=>{ const {F,tom,grace,f0,f1}=fight(); for(const f of [f0,f1]) { f.maxPips=f.pips=6; f.peeves=[]; } tom.pep=10;
    const b=go(F,tom,'konami_code','*'),per=stat(tom,'atk')*PW.heavy*.7;
    ok(hits(b,'f0')[0].dmg===Math.round(per*100/(100+def(f0)))&&hits(b,'f1')[0].dmg===Math.round(per*100/(100+def(f1))),'heavy Razzle on both at 70%: '+hits(b,'f0')[0].dmg+', '+hits(b,'f1')[0].dmg);
    ok(f0.pips===4&&f1.pips===4&&tom.pep===4,'2 Composure pips off each, 6 Pep: '+f0.pips+', '+f1.pips+', Pep '+tom.pep); ok(!!f0.st.dazzled&&!!f1.st.dazzled,'both are left Dazzled');
    const e={critPerPrime:.15},r0=critChance(tom,f0,{}),r2=(()=>{ const g={}; add(F,f1,'toasty',{src:grace}); return critChance(tom,f1,e)-critChance(tom,f1,{}); })();
    ok(near(critChance(tom,f0,e)-r0,.15)&&near(r2,.30),'each Prime on a monster adds 15% to its crit chance: '+(critChance(tom,f0,e)-r0)+', then '+r2); });

  // 107. Creative Mess: when Grace puts a Prime or a debuff on a monster, 25% of what that action dealt it splashes on the ones next to it as Razzle
  noCrit(()=>{ const {F,grace,tom,f0,f1}=fight({grace:['permanent_marker']}); f1.peeves=[]; f0.peeves=[]; const b=go(F,grace,'t_razzle','f0'),h=hits(b,'f0')[0],sp=hits(b,'f1');
    ok(sp.length===1&&sp[0].splash&&sp[0].flavor==='razzle'&&sp[0].dmg===Math.max(1,Math.round(h.dmg*.25*taken(f1))),'a Razzle hit that leaves Dazzled splashes 25% of its damage on the next monster: '+J(sp.map(x=>x.dmg))+' of '+h.dmg);
    ok(!hits(b,'f0').some(x=>x.splash),'and not back on the one that was hit');
    f0.st={}; f1.hp=f1.maxHp; const c=go(F,grace,'t_cm','f0'); ok(hits(c,'f1').filter(x=>x.splash).length===1,'a Prime and a debuff put on the same monster in one action splash once: '+hits(c,'f1').filter(x=>x.splash).length);
    const d=go(F,grace,'t_slow','f1'); ok(hits(d,'f0').filter(x=>x.splash).length===1&&hits(d,'f0')[0].dmg===Math.max(1,Math.round(stat(grace,'atk')*PW.standard*.25*taken(f0))),'a debuff from a move that deals no damage splashes a standard hit’s worth: '+J(hits(d,'f0').map(x=>x.dmg)));
    const e=go(F,grace,'t_squish','f0'); ok(!hits(e).length,'a mark (Squished) is not a debuff: no splash');
    const g=go(F,tom,'t_slow','f0'); ok(!hits(g).length,'Tom’s debuff does not splash: only Grace’s'); });
  noCrit(()=>{ const {F,grace,f0,f1}=fight({}); f0.peeves=[]; f1.peeves=['razzle']; f1.maxPips=f1.pips=6; const b=go(F,grace,'t_razzle','f0'),sp=hits(b,'f1').filter(x=>x.splash)[0];
    ok(sp&&sp.peeve&&f1.pips===5,'a splash onto a monster that has Razzle as a Pet Peeve is 50% bigger and takes a pip: '+J(sp&&sp.dmg)+', pips '+f1.pips); });

  // 108. Permanent Marker: a Prime Grace puts on lasts 1 more of its turns; nobody else's and no debuff
  noCrit(()=>{ const A=fight({grace:['permanent_marker']}),B=fight({});
    go(A.F,A.grace,'t_razzle','f0'); go(B.F,B.grace,'t_razzle','f0'); go(A.F,A.tom,'t_razzle','f1');
    ok(A.f0.st.dazzled.n===ST.dazzled.dur.n+1&&B.f0.st.dazzled.n===ST.dazzled.dur.n,'Grace’s Prime lasts 1 more turn with the Quirk: '+A.f0.st.dazzled.n+' against '+B.f0.st.dazzled.n);
    ok(A.f1.st.dazzled.n===ST.dazzled.dur.n,'Tom’s Prime does not: '+A.f1.st.dazzled.n);
    go(A.F,A.grace,'t_slow','f1'); ok(A.f1.st.slow.n===ST.slow.dur.n,'and a debuff does not: '+A.f1.st.slow.n); });

  // 109. Double Coat: Razzle then Racket (or the other way round) takes a free Composure pip off each monster the second move hit
  // A Razzle move leaves Dazzled and a Racket move sets it off for pips of its own, so the Primes are wiped before each move to count only the free pip.
  noCrit(()=>{ const {F,grace,f0,f1}=fight({grace:['double_coat']}); for(const f of [f0,f1]) { f.maxPips=f.pips=8; f.peeves=[]; } grace.pep=10;
    const go=(F,u,s,k)=>{ for(const f of F.foes) f.st={}; return G_go(F,u,s,k); };
    let b=go(F,grace,'t_razzle','f0'); ok(f0.pips===8&&!has(b,'passive'),'the first move: nothing');
    b=go(F,grace,'t_racket','f0'); ok(f0.pips===7&&has(b,'passive',x=>x.id==='double_coat'),'Razzle then Racket: 1 pip off, free, and the screen says so: '+f0.pips);
    b=go(F,grace,'t_racket','f0'); ok(f0.pips===7,'Racket then Racket: nothing: '+f0.pips);
    b=go(F,grace,'t_razzle','f0'); ok(f0.pips===6,'Racket then Razzle: 1 pip off: '+f0.pips);
    go(F,grace,'t_sizzle','f0'); b=go(F,grace,'t_razzle','f0'); ok(f0.pips===6,'a Sizzle move in between starts the count again: Razzle after Sizzle takes nothing: '+f0.pips);
    go(F,grace,'t_mix','f0'); b=go(F,grace,'t_razzle','f0'); ok(f0.pips===6,'a two-flavor move in between starts it again: '+f0.pips);
    b=go(F,grace,'t_racket','f0'); ok(f0.pips===5,'... and Razzle then Racket works again: '+f0.pips);
    go(F,grace,'t_razzle','f0'); f0.pips=8; f1.pips=8; b=go(F,grace,'t_all','*'); ok(f0.pips===7&&f1.pips===7,'a Racket move that hits every monster takes a pip off each: '+f0.pips+', '+f1.pips);
    go(F,grace,'t_razzle','f0'); f0.pips=8; f1.pips=8; go(F,grace,'t_racket','f1'); ok(f0.pips===8&&f1.pips===7,'only the monsters the second move hit lose it: '+f0.pips+', '+f1.pips); });
  noCrit(()=>{ const {F,grace,f0}=fight({}); f0.maxPips=f0.pips=8; f0.peeves=[]; grace.pep=10; go(F,grace,'t_razzle','f0'); f0.st={}; go(F,grace,'t_racket','f0'); ok(f0.pips===8,'without the Quirk equipped: nothing'); });
  noCrit(()=>{ const {F,grace,f0}=fight({grace:['double_coat']}); f0.maxPips=f0.pips=8; f0.peeves=['racket']; grace.pep=10; go(F,grace,'t_razzle','f0'); f0.st={}; go(F,grace,'t_racket','f0');
    ok(f0.pips===6,'it shares the 3-pip cap with a Pet Peeve pip: the Peeve and the free pip both count, '+f0.pips); });

  // 110. Cartridge Blow: the monster's next aim is shown, and it keeps to it
  noCrit(()=>{ let matched=0,shown=0; for(let s=1;s<=12;s++) { const {F,tom,f0}=fight({},'mudling',{seed:s}); tom.hp=tom.maxHp=9000; f0.actIx=0; f0.turns=0;
      const b=go(F,tom,'cartridge_blow','f0'),fs=b.find(x=>x.t==='foresee'); if(!fs||!fs.tgt) continue; shown++;
      const a=foeTurn(F,f0).find(x=>x.t==='act'); if(a&&a.tgts.length===1&&a.tgts[0]===fs.tgt) matched++; }
    ok(shown===12&&matched===12,'12 fights: Cartridge Blow named the aim every time and the monster went exactly there: '+shown+' shown, '+matched+' kept'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); tom.hp=tom.maxHp=9000; f0.actIx=0; f0.turns=0; const b=go(F,tom,'cartridge_blow','f0'),fs=b.find(x=>x.t==='foresee');
    ok(fs&&fs.foe==='f0'&&fs.kind==='strike'&&fs.name==='Wobble'&&f0.intent&&f0.intent.aim===fs.tgt&&f0.aimLock.key===fs.tgt,'the beat names the monster, its act ("Wobble") and the aim: '+J(fs));
    ok(has(b,'hit')&&b.findIndex(x=>x.t==='hit')<b.findIndex(x=>x.t==='foresee'),'the hit comes first, then the foresight');
    const aim=F.units.find(u=>u.key===fs.tgt),other=F.party.find(p=>p!==aim);
    add(F,other,'t_aim',{}); intentRefresh(F); ok(f0.intent===null&&f0.aimLock===null,'a taunt on someone else takes the aim away: what was shown is cleared');
    const c=foeAct(F,f0,'wobble').find(x=>x.t==='act'); ok(c.tgts[0]===other.key,'and the monster goes for the taunter');
    ok(f0.intent===null&&f0.aimLock===null,'a monster’s turn spends what it was shown'); });
  noCrit(()=>{ const {F,tom,f0}=fight(); tom.hp=tom.maxHp=9000; f0.actIx=0; f0.turns=0; const fs=go(F,tom,'cartridge_blow','f0').find(x=>x.t==='foresee'),aim=F.units.find(u=>u.key===fs.tgt);
    aim.hp=0; koCheck(F,{beats:[],g:0}); intentRefresh(F); ok(f0.intent===null,'if the one it was going for is knocked out, the shown aim is cleared');
    const {F:F2,tom:t2,f0:g0}=fight(); t2.hp=t2.maxHp=9000; g0.actIx=0; g0.turns=0; go(F2,t2,'cartridge_blow','f0'); g0.actIx=1; intentRefresh(F2); ok(g0.intent===null&&g0.aimLock===null,'if a different act is now due, it is cleared too'); });
  noCrit(()=>{ const {F,tom,f0}=fight(); tom.hp=tom.maxHp=9000; f0.turns=5; f0.lastUse={}; f0.actIx=0; const fs=go(F,tom,'cartridge_blow','f0').find(x=>x.t==='foresee');
    ok(fs&&fs.kind==='wind'&&fs.tgt===null&&fs.name==='Mud Pie'&&!f0.aimLock,'a monster that will wind up an attack has no aim yet: it says what it is doing ("Mud Pie") and nothing is held'); });
  noCrit(()=>{ const {F,tom,f0}=fight({},'skeeter'); tom.hp=tom.maxHp=9000; const sk=F.foes[1]; sk.st={}; sk.stripped={jitterflight:true}; sk.actIx=1; sk.turns=0;
    const fs=go(F,tom,'cartridge_blow',sk.key).find(x=>x.t==='foresee'); ok(fs&&fs.kind==='self'&&fs.tgt===null,'a monster that will not attack at all (Buzz Cloud) has no aim to show'); });

  // 111. Bedazzle-Gun Glue Trap: every monster that acts takes a light Sizzle and Razzle chip and waits 20% longer, for 2 rounds
  noCrit(()=>{ const {F,grace,f0,f1}=fight({}); f0.peeves=[]; f1.peeves=[]; grace.pep=10; const b=go(F,grace,'bedazzle_gun_glue_trap','*');
    ok(grace.pep===6&&F.hazards.some(h=>h.id==='glue_trap'&&h.side==='foe'&&h.rounds===2&&h.src===grace.key)&&has(b,'hazardOn'),'4 Pep; the Glue Trap is on the monsters’ floor for 2 rounds');
    ok(carried(F,f0).some(r=>r.kind==='hazard'&&r.short==='GLUE'&&!/slip/.test(r.left)&&/2 rounds/.test(r.left)),'the list shows it with its rounds and no slip count: '+J(carried(F,f0).filter(r=>r.kind==='hazard').map(r=>r.left)));
    const w=foeAct(F,f0,'wobble'),t=hits(w,'f0').filter(x=>x.src===grace.key);
    ok(has(w,'hazardTrip',x=>x.id==='glue_trap'&&x.tgt==='f0')&&t.length===2&&t[0].flavor==='sizzle'&&t[1].flavor==='razzle','the monster that acts is caught: a Sizzle then a Razzle chip: '+J(t.map(x=>x.flavor+x.dmg)));
    const per=stat(grace,'atk')*PW.light/2*100/(100+def(f0)); ok(t[0].dmg===Math.round(per)&&t[1].dmg===Math.round(per),'each is half of a light hit: '+t.map(x=>x.dmg)+' want '+Math.round(per));
    ok(!!f0.st.fatigue&&near(mult(f0,'recovery'),1.2),'and it is Fatigued: 20% longer to recover: '+mult(f0,'recovery'));
    ok(hits(w,'f1').filter(x=>x.splash).length===1,'Creative Mess splashes the neighbour once for the Prime and the Fatigue together: '+hits(w,'f1').filter(x=>x.splash).length);
    const v=foeAct(F,f1,'mud_flick'),u=foeAct(F,f0,'wobble'); ok(has(u,'hazardTrip')&&F.hazards.some(h=>h.id==='glue_trap'),'it has no limit on how many acts it catches (acts of any kind): the same monster again');
    const sp=foeAct(F,f1,'wobble'); ok(has(sp,'hazardTrip'),'the other monster too'); });
  noCrit(()=>{ const {F,grace,f0}=fight({}); grace.pep=10; go(F,grace,'bedazzle_gun_glue_trap','*'); f0.turns=5; f0.lastUse={}; f0.actIx=0; const w=foeTurn(F,f0); ok(has(w,'telegraph')&&!has(w,'hazardTrip'),'a wind-up turn is not an act: the trap waits');
    const a=foeTurn(F,f0); ok(has(a,'hazardTrip'),'the act it fires next turn is caught');
    const e=[]; roundStart(F,e); ok(F.hazards.some(h=>h.id==='glue_trap'),'one round later it is still there'); roundStart(F,e); ok(!F.hazards.some(h=>h.id==='glue_trap')&&has(e,'hazardEnd',x=>x.id==='glue_trap'),'after 2 rounds it is gone'); });
  noCrit(()=>{ const {F,grace,f0}=fight({}); grace.pep=10; go(F,grace,'bedazzle_gun_glue_trap','*'); const b=foeAct(F,f0,'mud_flick'); ok(has(b,'hazardTrip'),'a projectile act is caught too, not only melee'); });

  // 112. Masterpiece Portrait Makeover: heavy Razzle, then Razzle is one of its Pet Peeves for 2 of its turns
  noCrit(()=>{ const {F,grace,f0}=fight(); f0.peeves=[]; f0.maxPips=f0.pips=6; grace.pep=10; const b=go(F,grace,'masterpiece_portrait_makeover','f0'),h=hits(b,'f0')[0];
    ok(h.flavor==='razzle'&&!h.peeve&&h.dmg===Math.round(stat(grace,'atk')*PW.heavy*100/(100+def(f0))),'a heavy Razzle hit, and the blast itself is not made worse by the weakness it leaves: '+h.dmg); ok(grace.pep===5,'5 Pep');
    ok(!!f0.st.razzle_weak&&f0.st.razzle_weak.n===2&&peeves(f0).includes('razzle')&&!f0.peeves.includes('razzle'),'Razzle is now a Pet Peeve of that monster, for 2 turns, without changing what it is made of');
    const p0=f0.pips,r=hits(go(F,grace,'t_razzle','f0'),'f0')[0]; ok(r.peeve&&r.dmg===Math.round(stat(grace,'atk')*100/(100+def(f0))*1.5*(f0.st.dazzled?1:1))&&f0.pips===p0-1,'the next Razzle hit does 50% more and takes a pip: '+r.dmg+', pips '+p0+' to '+f0.pips);
    ok(carried(F,f0).some(x=>x.short==='RAZZLE WEAK'),'the list names it');
    endTurn(F,f0,100,[]); ok(!!f0.st.razzle_weak,'one of its turns later it is still on'); endTurn(F,f0,100,[]); ok(!f0.st.razzle_weak&&!peeves(f0).includes('razzle'),'two turns later it is gone'); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); f0.peeves=[]; add(F,f0,'razzle_weak',{src:grace}); const h=hits(go(F,tom,'t_razzle','f0'),'f0')[0]; ok(h.peeve,'it counts for Tom’s Razzle hits too: anyone’s'); });

  // 113. The simple player takes both second Sig Vibes through whole fights without breaking a rule
  { const used={},q={tom:['elixir_hoarder','new_game_plus'],grace:['permanent_marker','double_coat'],rose:['twin_lamb_relay','its_our_longboard_now'],deedee:['car_crumb_vacuum','spit_shine']};
    let err='',wins=0,shown=0; for(const f of ['toad','log','grump']) for(let s=1;s<=30;s++) { try { const r=play({party:LAB,level:2,formation:f,seed:s,loadouts:book(q),mods:{foeHp:3}},false,{support:3}); for(const k in r.moves) used[k]=(used[k]||0)+r.moves[k]; if(r.result==='win') wins++; shown++; } catch(e) { err=err||(f+' seed '+s+': '+e.message); } }
    ok(!err,'90 Rank 5 fights with Tom and Grace on their second Vibes run clean: '+err); ok(wins===90,'and are won: '+wins);
    for(const c of ['cartridge_blow','controller_toss','bedazzle_gun_glue_trap','open_string_violin_screech']) ok(used[c]>0,'the simple player used '+c+': '+(used[c]||0));
    ok((used.konami_code||0)+(used.masterpiece_portrait_makeover||0)+(used.winged_shell_lock_on||0)>0,'and at least one of Winged Shell, Konami Code and Makeover: '+[used.winged_shell_lock_on,used.konami_code,used.masterpiece_portrait_makeover]); }

  // The test rows come out again, and the data check says what it said before this file ran.
  delete SK.t_five; delete SK.t_mix; delete SK.t_cm; delete SK.t_slow; delete SK.t_squish; delete ST.t_aim;
  ok(J(G('b3CheckData')())===bad0,'data check after this file\'s test rows are gone: '+J(G('b3CheckData')()));
};
