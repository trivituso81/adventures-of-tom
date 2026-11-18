// tools/b3-check-s3.js — Battle 3 rule tests for stage 3: Composure pips and their cap, Break and Flustered, wind-ups that are
// also acts, Marks and their follow-ups, the act runner's conditions and target kinds, counter acts, adds, Guard Stance and Mend
// on enemies, Log Lump and The Big One. `node tools/b3-sim.js check` runs it after the stage 1 and stage 2 groups.
// T is what tools/b3-sim.js hands over: G (reads a name out of the rules sandbox), ok(cond, what), near, play, noCrit.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,foeTurn,U,RULES,SK,ST,FOES,add,endS,endTurn,beginTurn,opts,stat]=['b3NewFight','b3Next','b3Act','b3FoeTurn','b3Unit','B3_RULES','B3_SKILLS','B3_STATUS','B3_FOES','b3AddStatus','b3EndStatus','b3EndTurn','b3BeginTurn','b3Options','b3Stat'].map(G);
  const LAB=['grace','tom','rose','deedee'];
  // A fight with nothing played yet. P is the family by id, f is the first monster. Everyone is too tough to fall unless a test says so.
  const fight=(cfg,keepHp)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5},cfg)),P={}; for(const p of F.party) P[p.id]=p;
    if(!keepHp) for(const u of F.units) if(u.side==='foe') u.hp=u.maxHp=100000;
    return {F,P,f:F.foes[0],tough() { for(const p of F.party) p.hp=p.maxHp=1e6; return this; }}; };
  const mine=(F,u)=>{ F.acting=u; return u; };
  // One party move as that member's turn (free of Pep worries).
  const use=(F,u,skill,target)=>{ mine(F,u); u.pep=10; const r=act(F,u,skill,target); if(!r.ok) throw new Error(skill+': '+r.why); return r.beats; };
  // One enemy turn. `id` forces which listed act the cycle is at.
  const turn=(F,e,id)=>{ if(id) { e.actIx=e.D.acts.findIndex(A=>A.id===id); e.charge=null; e.mark=null; } const b=[]; if(!beginTurn(F,e,b)) return b; return b.concat(foeTurn(F,e)); };
  const name=b=>{ const a=b.find(x=>x.t==='act'),tg=b.find(x=>x.t==='telegraph'); return (a?a.id:'')+(tg?'!'+tg.id:'')||'-'; };
  const of=(b,t)=>b.filter(x=>x.t===t);
  const tskill=(id,o)=>{ SK[id]=Object.assign({id,vibe:'tom_flier',slot:'s1',name:id,pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}],desc:id},o); };
  const tstat=(id,o)=>{ ST[id]=Object.assign({id,name:id,kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[],flags:[],short:id,color:'#fff',weight:1,desc:id},o); };
  const tfoe=(id,o)=>{ FOES[id]=Object.assign({id,name:id,ch:1,role:'elite',row:'front',hp:1000,atk:20,def:20,spd:90,pips:6,peeves:[],resists:[],start:[],mechanics:[],drop:null,
    acts:[{id:'poke',name:'Poke',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]}]},o); };
  for(const fl of ['clobber','sizzle','drench','razzle','racket']) tskill('s3_'+fl,{flavor:[fl]});
  tskill('s3_racket3',{flavor:['racket'],hits:3});
  tskill('s3_printed',{flavor:['drench'],composure:2});
  tskill('s3_quiet',{flavor:['support'],power:0,hits:0,composure:1,effects:[]});
  tstat('s3_hidden',{flags:['untargetable']}); tstat('s3_taunt',{flags:['taunt']}); tstat('s3_fast',{mods:[{stat:'spd',kind:'t',v:.5}]});
  tstat('s3_mode',{kind:'stance'});

  // 46. The bestiary's printed numbers for the Elite and the boss, and the boss's HP for a party of 3
  { const L=FOES.log,B=FOES.bigone;
    ok([L.hp,L.atk,L.def,L.spd,L.pips].join()==='166,25,19,85,4'&&L.peeves.join()==='sizzle'&&L.role==='elite','Log Lump stat line');
    ok([B.hp,B.hp3,B.atk,B.def,B.spd,B.pips].join()==='420,320,28,17,96,6'&&B.peeves.join()==='razzle,racket'&&B.role==='boss','The Big One stat line');
    ok(L.acts.map(a=>[a.id,a.power,a.recovery].join(':')).join()==='low_roll:0.8:80,branch_jab:1:100,timber:1.5:120','Log Lump acts');
    ok(B.acts.map(a=>[a.id,a.power,a.recovery].join(':')).join()==='big_glare:0.8:80,tail_slap:1:100,swamp_chomp:1.5:120,muddy_belly_flop:1.2:120,crown_polish:0:80','The Big One acts');
    const a=NF({party:LAB,level:2,formation:'bigone',seed:1}),b=NF({party:['tom','grace','rose'],level:2,formation:'bigone',seed:1});
    ok(a.foes[0].maxHp===420&&b.foes[0].maxHp===320,'boss HP by party size: '+a.foes[0].maxHp+' and '+b.foes[0].maxHp);
    ok(a.foes[0].pips===6&&a.foes[0].maxPips===6&&NF({party:LAB,level:2,formation:'mudling',seed:1}).foes[0].maxPips===0,'pips: the boss has 6, a Mudling none'); }

  // 47. Pet Peeve: 1 pip per action, not per hit. A flavor that is not a Pet Peeve shaves none. A normal monster has no pips.
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'});
    let b=use(F,P.tom,'s3_racket3','f0'); ok(of(b,'hit').length===3&&f.pips===5&&of(b,'pips').length===1&&of(b,'pips')[0].n===1,'three Racket hits take 1 pip: '+f.pips);
    b=use(F,P.tom,'s3_clobber','f0'); ok(f.pips===5&&!of(b,'pips').length,'a Clobber hit takes none from The Big One');
    b=use(F,P.tom,'s3_razzle','f0'); ok(f.pips===4,'Razzle is its other Pet Peeve: '+f.pips);
    const M=fight({formation:'mudling'}); b=use(M.F,M.P.tom,'s3_racket','f0'); ok(!of(b,'pips').length&&M.f.pips===0&&!M.f.st.flustered,'a Mudling has no Composure to lose'); });

  // 48. A Detonation takes the pips its row prints, on top of the Pet Peeve pip
  noCrit(()=>{ for(const [f1,f2,want,why] of [['sizzle','racket',2,'Panic Boil! 1 + Racket Pet Peeve 1'],['sizzle','drench',2,'Steam Cloud! 2'],['drench','clobber',1,'Hydro-Slip! 1'],['drench','razzle',3,'Short Circuit! 2 + Razzle Pet Peeve 1'],['razzle','racket',2,'Sensory Overload! 1 + Racket 1']]) {
      const {F,P,f}=fight({formation:'bigone'}); use(F,P.grace,'s3_'+f1,'f0'); const before=f.pips; use(F,P.tom,'s3_'+f2,'f0');
      ok(before-f.pips===want,why+': took '+(before-f.pips)); } });

  // 49. The cap: 3 pips from one foe in one action, from every source together; 4 when the action says so (Full Family Ruckus)
  noCrit(()=>{ tfoe('s3_wet',{peeves:['drench'],pips:8});
    const {F,P,f}=fight({foes:[{id:'s3_wet'}]}); use(F,P.grace,'s3_sizzle','f0');
    const b=use(F,P.tom,'s3_printed','f0');   // Steam Cloud! 2 + Drench Pet Peeve 1 + printed 2 = 5
    ok(f.pips===5&&of(b,'pips')[0].n===3,'one action stops at 3 pips: '+f.pips);
    const pay=G('b3PayLedger'),c={F,actor:P.tom,beats:[],g:'post',ledger:{f0:{n:9,peeve:true}},pipCap:RULES.composure.capFullRuckus};
    pay(F,c); ok(f.pips===1,'a 4-pip cap takes 4: '+f.pips);
    ok(use(F,P.tom,'s3_quiet','f0').some(x=>x.t==='pips'&&x.n===1)&&f.pips===0,'a printed Composure number lands with no damage dealt'); });

  // 50. Break: Flustered. +35% damage taken, stance gone, wound-up act and Mark lost, no pushes, pips locked; then its next turn
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'}); endS(F,f,'muffin_crown');
    const h0=of(use(F,P.tom,'s3_clobber','f0'),'hit')[0].dmg;
    add(F,f,'mossy_brace',{src:f}); f.charge=f.D.acts[2]; f.mark='p2'; f.pips=1;
    const b=use(F,P.tom,'s3_racket','f0');
    ok(of(b,'break').length===1&&f.broken&&f.pipLock&&f.pips===0,'the last pip Breaks it');
    ok(!!f.st.flustered&&!f.st.mossy_brace,'Flustered is on and the stance is gone');
    ok(!f.charge&&!f.mark&&b.some(x=>x.t==='interrupt'&&x.why==='break'&&x.id==='swamp_chomp'),'the wound-up act and its Mark are lost');
    const order=b.map(x=>x.t); ok(order.indexOf('pips')<order.indexOf('break')&&order.indexOf('hit')<order.indexOf('pips'),'beats: hit, pips, then break');
    const h1=of(use(F,P.tom,'s3_clobber','f0'),'hit')[0].dmg; ok(h1===Math.round(h0*1.35)||Math.abs(h1-h0*1.35)<=1,'Flustered takes 35% more: '+h0+' then '+h1);
    ok(G('b3Push')(F,f,30)===0,'a Flustered foe cannot be pushed');
    use(F,P.tom,'s3_racket','f0'); ok(f.pips===0&&!use(F,P.tom,'s3_razzle','f0').some(x=>x.t==='pips'),'locked: no more pips come off');
    // its next turn begins: Flustered ends, the pips are back, and they stay locked until that turn ends
    const tb=turn(F,f); ok(!f.st.flustered&&f.pips===6&&tb.some(x=>x.t==='pips'&&x.refill),'next turn: Flustered ends and the pips refill');
    ok(name(tb)==='big_glare!swamp_chomp'||name(tb)==='tail_slap','it takes that turn: '+name(tb));
    ok(!f.pipLock&&!f.flusterTurn,'the lock ends with that turn');
    endS(F,f,'dazzled'); use(F,P.tom,'s3_racket','f0'); ok(f.pips===5,'pips can be shaved again: '+f.pips); });
  // locked DURING the turn it is owed: a ward's answer in that turn takes nothing
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'}); f.pips=1; use(F,P.tom,'s3_racket','f0'); ok(f.broken,'Broken');
    add(F,P.tom,'zone_one',{src:P.tom}); add(F,P.tom,'s3_taunt',{});
    const b=turn(F,f,'tail_slap'); ok(b.some(x=>x.t==='react')&&f.pips===6,'a ward answers in the owed turn and takes no pip: '+f.pips); });

  // 51. Where a Flustered foe goes: behind every unit due inside the next 100 ticks, the breaker's own coming wait included
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'}); f.pips=1;
    P.grace.wait=20; P.rose.wait=40; P.deedee.wait=150; f.wait=10; mine(F,P.tom); P.tom.wait=0;
    use(F,P.tom,'s3_racket','f0');   // a Skill: Tom waits 100
    ok(near(f.wait,100)&&near(P.tom.wait,100),'it goes back to the furthest of them: '+f.wait);
    const seq=G('b3TurnOrder')(F).map(u=>u.key).join(); ok(seq==='p0,p2,p1,f0,p3','and acts after everyone at that tick: '+seq);
    const X=fight({formation:'bigone'}); X.f.pips=1; X.P.grace.wait=20; X.P.rose.wait=40; X.P.deedee.wait=60; X.f.wait=130; mine(X.F,X.P.tom);
    use(X.F,X.P.tom,'s3_racket','f0'); ok(near(X.f.wait,130),'a foe already further back stays put: '+X.f.wait);
    const Y=fight({formation:'bigone'}); Y.f.pips=1; G('b3Push')(Y.F,Y.f,10); G('b3Push')(Y.F,Y.f,10); Y.f.wait=5; Y.P.grace.wait=90; Y.P.rose.wait=30; Y.P.deedee.wait=30;
    use(Y.F,Y.P.tom,'lounge_pass_flex','f0'); ok(near(Y.f.wait,90),'the fall-back ignores the halving of repeat pushes: '+Y.f.wait); });

  // 52. Broken during its own turn by a ward's answer: the act still happened, it falls back when the turn ends
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'}); f.pips=1; add(F,P.tom,'zone_one',{src:P.tom}); add(F,P.tom,'s3_taunt',{});
    P.grace.wait=150; P.rose.wait=170; P.deedee.wait=190; P.tom.wait=160;
    const b=turn(F,f,'tail_slap');
    ok(b.some(x=>x.t==='act'&&x.id==='tail_slap')&&b.some(x=>x.t==='react')&&b.some(x=>x.t==='break'),'Tail Slap, the answer, then the Break');
    ok(f.broken&&!!f.st.flustered&&f.pips===0,'it is Flustered');
    ok(near(f.wait,100*100/96),'nobody is due inside 100 ticks, so it keeps its own wait: '+f.wait);
    const Z=fight({formation:'bigone'}); Z.f.pips=1; add(Z.F,Z.P.tom,'zone_one',{src:Z.P.tom}); add(Z.F,Z.P.tom,'s3_taunt',{});
    Z.P.grace.wait=100; Z.P.rose.wait=40; Z.P.deedee.wait=30; Z.P.tom.wait=20; Z.f.spd=200;
    turn(Z.F,Z.f,'tail_slap'); ok(near(Z.f.wait,100),'a fast one is put behind the family due inside 100 ticks: '+Z.f.wait);
    const tb=turn(Z.F,Z.f); ok(Z.f.pips===6&&!Z.f.pipLock,'its next turn is the owed one'); });

  // 53. A slip that takes the last pip: the fall Breaks it and the act is lost
  noCrit(()=>{ tfoe('s3_soft',{peeves:['clobber'],pips:1});
    const {F,P,f}=fight({foes:[{id:'s3_soft'}]}); use(F,P.deedee,'wet_floor_hazard','*');
    const b=turn(F,f); ok(b.some(x=>x.t==='hazardTrip')&&b.some(x=>x.t==='break'),'the fall Breaks it');
    ok(!b.some(x=>x.t==='act')&&b.some(x=>x.t==='interrupt'&&x.id==='poke'),'it loses the act it was starting');
    ok(f.broken&&near(f.wait,80*100/90)||f.wait>0,'its turn is spent'); });

  // 54. "A foe always gets that turn": a Stun on a Flustered Elite is spent without costing the owed turn
  noCrit(()=>{ const {F,P,f}=fight({formation:'log'}); f.pips=1; use(F,P.rose,'s3_sizzle','f0'); ok(f.broken,'Log Lump Broken by its Pet Peeve');
    add(F,f,'stun',{src:P.tom});
    const b=turn(F,f); ok(!b.some(x=>x.t==='skip')&&b.some(x=>x.t==='act')&&!f.st.stun,'the owed turn is taken and the Stun is gone');
    add(F,f,'stun',{src:P.tom}); const b2=turn(F,f); ok(b2.some(x=>x.t==='skip'),'a later Stun costs a turn as usual'); });

  // 55. The Big One's order: Big Glare is the wind-up of Swamp Chomp; below half HP the crown comes back once and Belly-Flop every 3rd turn
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'}),seq=[];
    for(let i=0;i<7;i++) seq.push(name(turn(F,f)));
    ok(seq.join()==='big_glare!swamp_chomp,swamp_chomp,tail_slap,big_glare!swamp_chomp,swamp_chomp,tail_slap,big_glare!swamp_chomp','above half: '+seq);
    f.hp=f.maxHp*.4; const low=[]; for(let i=0;i<9;i++) low.push(name(turn(F,f)));   // 40%: the crown's Mend (3% a turn) must not lift it back over half
    ok(low.join()==='swamp_chomp,crown_polish,!muddy_belly_flop,muddy_belly_flop,tail_slap,big_glare!swamp_chomp,swamp_chomp,!muddy_belly_flop,muddy_belly_flop','below half: '+low);
    ok(f.uses.crown_polish===1,'Crown Polish once'); });
  noCrit(()=>{ const {F,P,f}=fight({formation:'bigone'},true);
    ok(!!f.st.muffin_crown&&near(stat(f,'atk'),28*1.15),'it starts in the Muffin-Tin Crown: Attack '+stat(f,'atk'));
    f.hp=300; const b=[]; beginTurn(F,f,b); ok(f.hp===313&&b.some(x=>x.t==='heal'&&x.id==='muffin_crown'),'the crown mends 3% of 420 each turn: '+f.hp);
    foeTurn(F,f); turn(F,f); ok(!f.st.muffin_crown,'the crown lasts 2 of its turns');
    add(F,f,'muffin_crown',{src:f}); const s=use(F,P.deedee,'hand_me_my_glasses_scrub','f0');
    ok(!f.st.muffin_crown&&near(stat(f,'atk'),28),'any buff strip knocks the crown off');
    add(F,f,'muffin_crown',{src:f}); add(F,f,'dazzled',{src:P.tom}); use(F,P.tom,'s3_clobber','f0'); ok(!f.st.muffin_crown,'Shatter Glitz! knocks it off too'); });

  // 56. The Mark: who it is on, who can take the bite, what cancels it, and what it survives
  noCrit(()=>{ const setup=()=>{ const X=fight({formation:'bigone'}); add(X.F,X.P.rose,'s3_taunt',{}); const b=turn(X.F,X.f,'big_glare'); endS(X.F,X.P.rose,'s3_taunt'); return Object.assign(X,{b}); };
    let X=setup(); const tg=X.b.find(x=>x.t==='telegraph');
    ok(X.f.mark==='p2'&&tg&&tg.mark==='p2'&&tg.id==='swamp_chomp'&&X.f.charge.id==='swamp_chomp','Big Glare Marks the one it glared at');
    ok(of(X.b,'hit').some(h=>h.tgt==='p2'&&h.flavor==='racket')&&near(X.f.wait,80*100/96),'the glare itself lands, at Recovery 80');
    add(X.F,X.P.tom,'s3_taunt',{});   // even a taunt does not move the follow-up off the Marked ally
    let b=turn(X.F,X.f); const hp=115-X.P.rose.hp;
    ok(b.some(x=>x.t==='act'&&x.id==='swamp_chomp'&&x.tgts.join()==='p2')&&of(b,'hit').some(h=>h.tgt==='p2'&&h.flavor==='clobber'),'Swamp Chomp bites the Marked ally');
    ok(!X.f.mark&&!X.f.charge,'the Mark ends as the follow-up fires');
    // Tom takes it
    X=setup(); use(X.F,X.P.tom,'suite_door_slide','*'); const pep=X.P.tom.pep,rose=X.P.rose.hp,tom=X.P.tom.hp;
    b=turn(X.F,X.f); const want=Math.round(28*1.15*1.5*100/116*(1-.35));
    ok(b.some(x=>x.t==='intercept'&&x.src==='p1'&&x.tgt==='p2')&&X.P.rose.hp===rose&&tom-X.P.tom.hp===want,'Suite Door Slide: Tom takes the bite 35% weaker: '+(tom-X.P.tom.hp)+' (want '+want+')');
    ok(X.P.tom.pep===pep+1,'and gains 1 Pep');
    // Grace cancels it
    X=setup(); const w=X.f.wait; b=use(X.F,X.P.grace,'crunchy_sugar_cube_pop','f0');
    ok(b.some(x=>x.t==='interrupt'&&x.id==='swamp_chomp')&&!X.f.charge&&!X.f.mark,'Crunchy Sugar-Cube Pop cancels the bite and the Mark');
    ok(name(turn(X.F,X.f))==='tail_slap','its next turn is Tail Slap, not the bite');
    // a Break cancels it
    X=setup(); X.f.pips=1; use(X.F,X.P.tom,'lounge_pass_flex','f0'); ok(!X.f.charge&&!X.f.mark&&X.f.broken,'a Break cancels the bite and the Mark');
    // the Marked ally is knocked out: a new target by aggro
    X=setup(); X.P.rose.hp=0; G('b3KoCheck')(X.F,{actor:X.f,beats:[],g:'pre'}); b=turn(X.F,X.f);
    ok(b.some(x=>x.t==='act'&&x.id==='swamp_chomp'&&x.tgts.length===1&&x.tgts[0]!=='p2')&&of(b,'hit').length===1,'Marked ally knocked out: the bite picks someone else');
    // the Marked ally is hidden: it misses
    X=setup(); add(X.F,X.P.rose,'s3_hidden',{}); b=turn(X.F,X.f);
    ok(b.some(x=>x.t==='miss'&&x.why==='hidden'&&x.tgt==='p2')&&!of(b,'hit').length&&!X.f.mark,'Marked ally hidden: the bite misses');
    // not a status: a cleanse does nothing to it, and it stays through a row change
    X=setup(); G('b3RunEffects')(X.F,{F:X.F,actor:X.P.deedee,tgt:X.P.rose,targets:[X.P.rose],hit:[],beats:[],g:'pre',detonated:{}},[{op:'cleanse',to:'target'}]); X.P.rose.row='back';
    ok(X.f.mark==='p2'&&!Object.keys(X.P.rose.st).some(id=>ST[id].kind==='mark'),'a cleanse and a row change leave the Mark');
    ok(turn(X.F,X.f).some(x=>x.t==='act'&&x.tgts.join()==='p2'),'and the bite still comes');
    // the glare is taken by Tom, the Mark stays on the one it was aimed at
    X=fight({formation:'bigone'}); use(X.F,X.P.tom,'suite_door_slide','*'); add(X.F,X.P.rose,'s3_taunt',{}); b=turn(X.F,X.f,'big_glare');
    ok(b.some(x=>x.t==='intercept')&&X.f.mark==='p2','Tom steps in front of the glare, and the Mark is still on Rose'); });

  // 57. Big Glare looks at the Back row first; with nobody in Back it picks like any attack
  { const X=fight({formation:'bigone',rows:{rose:'back'}}).tough(); let all=true; for(let i=0;i<40;i++) { turn(X.F,X.f,'big_glare'); if(X.f.mark!=='p2') all=false; }
    ok(all,'with Rose in Back, Big Glare always Marks Rose');
    const Y=fight({formation:'bigone'}).tough(),seen={}; for(let i=0;i<200;i++) { turn(Y.F,Y.f,'big_glare'); seen[Y.f.mark]=1; }
    ok(Object.keys(seen).length===4,'with nobody in Back, it can Mark anyone: '+Object.keys(seen)); }

  // 58. Log Lump: braced for 2 of its turns, its cycle, Timber! slows, Panic Boil! ends the brace
  noCrit(()=>{ const {F,P,f}=fight({formation:'log'});
    ok(!!f.st.mossy_brace&&near(G('b3TakenMult')(f),.75),'it starts braced: 25% less damage');
    const h=of(use(F,P.tom,'s3_clobber','f0'),'hit')[0].dmg; ok(h===Math.round(26*100/119*.75),'a Clobber hit on the brace: '+h);
    use(F,P.rose,'s3_sizzle','f0'); const b=use(F,P.tom,'s3_racket','f0');
    ok(b.some(x=>x.t==='detonate'&&x.id==='panic_boil')&&!f.st.mossy_brace,'Panic Boil! ends the brace');
    const Y=fight({formation:'log'}).tough(),seq=[]; add(Y.F,Y.P.tom,'s3_taunt',{}); let slow=false;
    for(let i=0;i<8;i++) { const tb=turn(Y.F,Y.f); seq.push(name(tb)); if(i===1) ok(!Y.f.st.mossy_brace,'the brace runs out after 2 of its turns'); if(name(tb)==='timber') slow=!!Y.P.tom.st.slow; }
    ok(seq.join()==='low_roll,branch_jab,!timber,timber,low_roll,branch_jab,!timber,timber','Log Lump cycle: '+seq); ok(slow,'Timber! slows the one it lands on'); });

  // 59. The act runner's conditions
  { const A=(id,o)=>Object.assign({id,name:id,flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},o);
    tfoe('s3_when',{acts:[A('a'),A('wait2',{when:{waitRounds:2}}),A('r3',{when:{everyRound:3}}),A('high',{when:{hpAbove:.9}}),A('mode',{when:{has:'s3_mode'}}),A('calm',{when:{lacks:'s3_mode'}})]});
    const {F,f}=fight({foes:[{id:'s3_when'}]}),seq=[],at=r=>{ F.round=r; const b=foeTurn(mine(F,f)&&F,f); f.turns++; return name(b); };
    f.turns=1; seq.push(at(1),at(1),at(1),at(1),at(1));   // a, wait2, high, calm, a (r3 not ready, mode off, wait2 waits)
    ok(seq.join()==='a,wait2,high,calm,a','round 1: '+seq);
    ok(at(4)==='r3','every 3 rounds: ready at the 3rd divider');
    ok(at(4)==='wait2','a 2-round wait is over two dividers later');
    ok(at(4)==='high'&&at(4)==='calm'&&at(4)==='a'&&at(4)==='high','wait2 waits again, r3 is used up until the next 3rd divider');
    f.hp=f.maxHp*.5; add(F,f,'s3_mode',{}); const late=[at(7),at(7),at(7),at(7),at(7),at(7)].join(); ok(late==='r3,mode,a,wait2,mode,a','below 90% HP and in its stance, high and calm are skipped: '+late); }
  { const A=(id,o)=>Object.assign({id,name:id,flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},o);
    tfoe('s3_shush',{acts:[A('shush',{when:{notSameAllyTurns:2}})]});
    const {F,f}=fight({foes:[{id:'s3_shush'}]}).tough(); let last=null,same=0;
    for(let i=0;i<200;i++) { const b=turn(F,f),k=b.find(x=>x.t==='act').tgts[0]; if(k===last) same++; last=k; }
    ok(same===0,'"not on the same ally again": repeated '+same+' times in 200'); }

  // 60. Acts that hit 2 or 3 allies, the fastest ally, and every monster
  noCrit(()=>{ const A=(id,o)=>Object.assign({id,name:id,flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},o);
    tfoe('s3_multi',{acts:[A('volley',{hits:'two_random',tags:['projectile']})]});
    let X=fight({foes:[{id:'s3_multi'}]}).tough(),okAll=true; for(let i=0;i<60;i++) { const b=turn(X.F,X.f),a=b.find(x=>x.t==='act'); if(a.tgts.length!==2||a.tgts[0]===a.tgts[1]||of(b,'hit').length!==2) okAll=false; }
    ok(okAll,'two_random: 2 different allies, each takes the full hit');
    ok(of(turn(X.F,X.f),'hit')[0].dmg===Math.round(20*100/116),'each target takes the full printed power');
    tfoe('s3_arms',{acts:[A('arms',{hits:'two_adjacent',grow:[2,3,'all']})]});
    X=fight({foes:[{id:'s3_arms'}]}); add(X.F,X.P.tom,'zone_one',{src:X.P.tom});
    const t1=turn(X.F,X.f).find(x=>x.t==='act').tgts.map(k=>Number(k[1])),t2=turn(X.F,X.f).find(x=>x.t==='act').tgts.map(k=>Number(k[1])),t3=turn(X.F,X.f).find(x=>x.t==='act').tgts;
    ok(t1.length===2&&Math.abs(t1[0]-t1[1])===1,'Wide Arms, 1st use: 2 allies next to each other: '+t1);
    ok(t2.length===3&&t2[2]-t2[0]===2,'2nd use: 3 in a row: '+t2); ok(t3.length===4,'later uses: everyone');
    tstat('s3_aoe_ward',{on:{afterHit:{carrier:'target',from:'foe',tags:['aoe'],limit:'action',effects:[{op:'counter',id:'s3_seen',n:1,to:'target'}]}}});
    X=fight({foes:[{id:'s3_arms'}]}); add(X.F,X.P.grace,'s3_aoe_ward',{}); add(X.F,X.P.grace,'s3_taunt',{}); turn(X.F,X.f); turn(X.F,X.f);
    ok(!X.P.grace.counters.s3_seen,'a 2 or 3 ally act does not count as aoe'); turn(X.F,X.f);
    ok(X.f.uses.arms===3,'three uses');
    tfoe('s3_fast',{acts:[A('walk',{hits:'fastest'})]});
    X=fight({foes:[{id:'s3_fast'}]}); add(X.F,X.P.deedee,'s3_fast',{}); ok(turn(X.F,X.f).find(x=>x.t==='act').tgts.join()==='p3','the fastest ally is the target');
    tfoe('s3_howl',{role:'bruiser',pips:0,acts:[A('howl',{hits:'foes',power:0,flavor:['support'],tags:['buff'],effects:[{op:'status',id:'giddyup',to:'target'}]})]});
    X=fight({foes:[{id:'s3_howl'},{id:'mudling'}]}); turn(X.F,X.f); ok(!!X.F.foes[0].st.giddyup&&!!X.F.foes[1].st.giddyup&&!X.P.tom.st.giddyup,'a buff act lands on every monster'); });
  // a use of Wide Arms that reaches everyone counts as aoe
  noCrit(()=>{ const X=fight({foes:[{id:'s3_arms'}]}); add(X.F,X.P.grace,'s3_aoe_ward',{}); X.f.uses.arms=2; mine(X.F,X.f); const b=foeTurn(X.F,X.f);
    ok(b.find(x=>x.t==='act').tgts.length===4&&X.P.grace.counters.s3_seen===1,'a use that reaches every ally counts as aoe'); });

  // 61. Counter acts: once per ally action, Recovery 0, not while Flustered, and a ward against one ends
  noCrit(()=>{ const A=(id,o)=>Object.assign({id,name:id,flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[]},o);
    tfoe('s3_pen',{acts:[A('note'),A('points_off',{name:'Points Off',recovery:0,hits:'attacker',when:{has:'s3_mode'},effects:[{op:'status',id:'slow',to:'target'}]})]});
    const {F,P,f}=fight({foes:[{id:'s3_pen'}]}); const w=f.wait;
    let b=use(F,P.rose,'s3_racket3','f0'); ok(!b.some(x=>x.t==='react'),'no counter outside its stance');
    add(F,f,'s3_mode',{}); const hp=P.rose.hp; b=use(F,P.rose,'s3_racket3','f0');
    ok(of(b,'react').length===1&&of(b,'react')[0].name==='Points Off'&&of(b,'react')[0].src==='f0','three hits, one Points Off');
    ok(P.rose.hp===hp-Math.round(20*.8*100/116)&&!!P.rose.st.slow,'it hits the attacker and its rider lands: '+(hp-P.rose.hp));
    ok(near(f.wait,w),'Recovery 0: the foe does not move on the bar');
    ok(name(turn(F,f))==='note'&&name(turn(F,f))==='note','a counter act is never picked from the list');
    add(F,P.tom,'zone_one',{src:P.tom}); b=use(F,P.tom,'s3_clobber','f0');
    ok(of(b,'react').length===2&&of(b,'react')[1].src==='p1','Tom hits, Points Off answers, his ward answers that, and it ends there: '+of(b,'react').map(x=>x.src));
    f.pips=1; tskill('s3_brk',{flavor:['clobber'],composure:1}); b=use(F,P.rose,'s3_brk','f0');
    ok(f.broken&&!b.some(x=>x.t==='react'),'the action that Breaks it gets no counter');
    add(F,f,'s3_mode',{}); b=use(F,P.rose,'s3_clobber','f0'); ok(!b.some(x=>x.t==='react'),'no counter while Flustered'); });

  // 62. Adds: half HP, 0 pips, the arriving wait, a full row takes no more, letters and slots
  { tfoe('s3_caller',{role:'boss',acts:[{id:'call',name:'Call',flavor:['support'],power:0,recovery:80,hits:'field',tags:['buff'],effects:[{op:'summon',id:'mudling',row:'front',n:2},{op:'summon',id:'skeeter',row:'back'}]}]});
    const {F,P,f}=fight({foes:[{id:'s3_caller'}]},true); const b=turn(F,f),S=of(b,'summon');
    ok(S.length===3&&F.foes.length===4&&F.units.length===8,'three adds join: '+S.map(x=>x.name));
    const m=F.foes[1],s=F.foes[3];
    ok(m.maxHp===30&&m.hp===30&&m.maxPips===0&&m.add&&s.maxHp===39,'an add has half its HP and no pips: '+m.maxHp+', '+s.maxHp);
    ok(near(m.wait,100*100/99),'it waits like anyone arriving: '+m.wait);
    ok(F.foes.map(x=>x.name).join()==='s3_caller,Mudling A,Mudling B,Skeeter Swarm','two of a kind get letters: '+F.foes.map(x=>x.name));
    ok(F.foes.map(x=>x.slot).join()==='0,1,2,3'&&!!s.st.jitterflight,'slots run Front then Back, and an add starts with its own buff');
    ok(G('b3Adjacent')(F,m).map(x=>x.key).sort().join()==='f0,f2','the add stands next to the caller and the other add');
    turn(F,f); ok(F.foes.length===5&&F.foes[4].id==='skeeter','a full Front row takes no more; the Back row takes its second: '+F.foes.length);
    turn(F,f); ok(F.foes.length===5,'both rows full: nobody joins');
    m.hp=0; G('b3KoCheck')(F,{actor:P.tom,beats:[],g:'pre'}); turn(F,f); ok(F.foes.length===6&&F.foes[5].row==='front','a fallen add frees its place');
    let acted=false; for(let i=0;i<12&&!acted;i++) { const N=next(F); if(!N.unit) break; if(N.unit.add) { acted=foeTurn(F,N.unit).some(x=>x.t==='act'); } else if(N.unit.side==='party') endTurn(F,N.unit,100,[]); else endTurn(F,N.unit,100,[]); }
    ok(acted,'an add takes its turns'); }

  // 63. The list a tap opens: Composure, the wound-up act and who it is aimed at, and the Mark on the family member
  { const {F,P,f}=fight({formation:'bigone'}); add(F,P.rose,'s3_taunt',{}); turn(F,f,'big_glare');
    const rf=G('b3Carried')(F,f),rr=G('b3Carried')(F,P.rose);
    ok(rf[0].kind==='pips'&&rf[0].short==='6 OF 6'&&rf[1].kind==='charge'&&/Swamp Chomp/.test(rf[1].name)&&/aimed at Rose/.test(rf[1].desc),'the boss\'s list starts with Composure and the wind-up: '+rf.slice(0,2).map(r=>r.name));
    ok(rr[0].kind==='marked'&&/The Big One will use Swamp Chomp on Rose/.test(rr[0].desc),'Rose\'s list says who Marked her');
    f.pips=1; use(F,P.tom,'lounge_pass_flex','f0'); const rb=G('b3Carried')(F,f);
    ok(rb[0].short==='0 OF 6'&&rb[0].left==='locked'&&rb.some(r=>r.short==='FLUSTERED'&&r.left==='until its next turn'),'Flustered shows in the list with how long it lasts');
    ok(G('b3Icons')(f).includes('flustered'),'and is the debuff icon it wears'); }

  // 64. A reaction has its own 3-pip cap; a status effect inside an action shares that action's cap
  noCrit(()=>{ const {F,P,f}=fight({foes:[{id:'s3_wet'}]});
    tstat('s3_ward',{on:{afterHit:{carrier:'target',from:'foe',limit:'action',react:true,effects:[{op:'damage',flavor:['drench'],power:'light',to:'attacker'},{op:'composure',n:5,to:'attacker'}]}}});
    add(F,P.tom,'s3_ward',{src:P.tom}); add(F,P.tom,'s3_taunt',{}); const b=turn(F,f);
    ok(f.pips===5&&of(b,'pips').length===1&&of(b,'pips')[0].n===3,'a ward\'s answer stops at 3 pips too: '+f.pips);
    tstat('s3_sore',{kind:'debuff',on:{afterHit:{carrier:'target',from:'foe',limit:'action',effects:[{op:'composure',n:5,to:'target'}]}}});
    add(F,f,'s3_sore',{src:P.tom}); f.pips=8; use(F,P.grace,'s3_drench','f0'); ok(f.pips===5,'pips from a status inside the action count toward its cap: '+f.pips); });

  // 65. The two new fights with the simple player. The architecture's target for The Big One is 5 to 7 rounds; the bestiary's
  // model assumes about one action in four is support. The simple player attacks nearly every turn, so both ways are checked:
  // attacking only (4.5 to 7 allowed) and with every 4th action a support move (5 to 7).
  for(const [form,sup,lo,hi] of [['log',0,2.5,4.5],['bigone',0,4.5,7],['bigone',4,5,7]]) { let sum=0,won=0,err='',kos=0,brk=0;
    for(let i=0;i<100;i++) { try { const r=play({party:LAB,level:2,formation:form,seed:3000+i},false,{support:sup}); sum+=r.rounds; kos+=r.kos; brk+=r.breaks; if(r.result==='win') won++; } catch(e) { err=e.message; } }
    const w=form+(sup?' (support every '+sup+'th action)':'');
    ok(!err,w+': a fight threw: '+err); ok(won===100,w+': won '+won+' of 100'); ok(sum/100>=lo&&sum/100<=hi,w+': '+(sum/100).toFixed(2)+' rounds on average'); ok(brk>=50,w+': '+brk+' Breaks in 100 fights'); }
  // 66. Same seed, same fight, with Composure, Marks and Breaks in play; and the party of 3 against the boss's smaller HP
  { const a=play({party:LAB,level:2,formation:'bigone',seed:77}),b=play({party:LAB,level:2,formation:'bigone',seed:77}); ok(a.order.join()===b.order.join()&&a.rounds===b.rounds&&a.hpLeft.join()===b.hpLeft.join()&&a.breaks===b.breaks,'a seed replays exactly');
    const c=play({party:['tom','grace','rose'],level:2,formation:'bigone',seed:5}); ok(c.result==='win','three of them can beat The Big One at 320 HP'); }
};
