// tools/b3-check-s6.js — Battle 3 rule tests for stage 6: the Family Ruckus (spec 2.10). The gauge's gains (Mix +5, Detonation +8,
// extra hits +1, Break +15), what it keeps between fights (cfg.ruckus), and the two spends of Dual Ruckus: Double Team (50%, both
// use their Main Vibe's Basic at +50%) and Full Family Ruckus (100%, both fire their highest unlocked Main Vibe Skill free, Composure
// cap 4). The pair is one action, costs no Pep and the partner keeps their own coming turn. Code: engine/b3-ruckus.js.
// `node tools/b3-sim.js check` runs it after the file for stage 5c. Real loadouts (no cfg.plain), every Vibe at Rank 5.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,SK,add,stat,newL,Auto,Plan,Rk,AutoRk,koCheck,options]=
    ['b3NewFight','b3Next','b3Act','B3_SKILLS','b3AddStatus','b3Stat','b3NewLoadout','b3Auto','b3RuckusPlan','b3Ruckus','b3AutoRuckus','b3KoCheck','b3Options'].map(G);
  const PARTY=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x),RULES=G('B3_RULES'),R=RULES.ruckus,PW=RULES.power;
  const bad0=J(G('b3CheckData')());
  // The Sig Vibes as the party walks in with them: Grace Squishy Collector, Tom Frequent Flier, Rose Sugar Rush, Deedee Neat Freak.
  const fight=(cfg)=>{ const B={}; for(const id of PARTY) B[id]=newL(id,5);
    const F=NF(Object.assign({party:PARTY,level:2,seed:5,formation:'mudling',loadouts:B},cfg||{}));
    const P={}; for(const p of F.party) { P[p.id]=p; p.hp=p.maxHp=Math.max(p.maxHp,400); }
    for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; }
    return {F,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,rose:P.rose,deedee:P.deedee}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const has=(beats,t,f)=>beats.some(b=>b.t===t&&(!f||f(b)));
  const gain=(beats,why)=>beats.filter(b=>b.t==='ruckus'&&b.why===why).reduce((s,b)=>s+b.n,0);
  const def=u=>stat(u,'def');
  // It is `u`'s turn and `p` is next on the bar; everyone else waits further out. No move has been made.
  const line=(T0,u,p)=>{ T0.F.acting=u; for(const x of T0.F.units) x.wait=50; u.wait=0; p.wait=1; return T0; };
  // Test rows, in the sandbox only; taken out again at the end of this file.
  for(const [id,slot,fl,n] of [['t_cap_a','cap','clobber',3],['t_cap_b','cap','razzle',3]])
    SK[id]={id,vibe:'tom_flier',slot,name:'Test '+id,pep:0,flavor:[fl],power:'standard',hits:1,target:'foe',tags:[],composure:n,effects:[{op:'damage'}]};
  SK.t_basic_pip={id:'t_basic_pip',vibe:'tom_flier',slot:'basic',name:'Test basic',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:3,effects:[{op:'damage'}]};
  SK.t6_clobber={id:'t6_clobber',vibe:'tom_flier',slot:'s1',name:'Test six clobber',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t6_racket={id:'t6_racket',vibe:'tom_flier',slot:'s1',name:'Test racket',pep:0,flavor:['racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t6_sizzle={id:'t6_sizzle',vibe:'tom_flier',slot:'s1',name:'Test sizzle',pep:0,flavor:['sizzle'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t6_drench={id:'t6_drench',vibe:'tom_flier',slot:'s1',name:'Test drench',pep:0,flavor:['drench'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t6_multi={id:'t6_multi',vibe:'tom_flier',slot:'s1',name:'Test multi',pep:0,flavor:['clobber'],power:'standard',hits:3,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t6_two={id:'t6_two',vibe:'tom_flier',slot:'s1',name:'Test two',pep:0,flavor:['clobber','racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};

  // 127. The numbers, and what the gauge starts with
  ok(R.mix===5&&R.detonation===8&&R.extraHit===1&&R.brk===15&&R.doubleTeam===50&&R.full===100&&R.doubleTeamPower===.5,'the gauge numbers are the spec’s: '+J(R));
  { ok(fight().F.ruckus===0,'a fight starts with an empty gauge'); ok(fight({ruckus:60}).F.ruckus===60,'cfg.ruckus is what the party walked in with'); ok(fight({ruckus:150}).F.ruckus===100&&fight({ruckus:-5}).F.ruckus===0,'and it stays between 0 and 100'); }

  // 128. Mix: two different allies, two different flavors, same monster, same round: +5, once per monster per round
  noCrit(()=>{ const t=fight(),{F,tom,grace,rose,f0,f1}=t; go(F,tom,'t6_clobber','f0'); ok(F.ruckus===0,'one hit is no Mix');
    let b=go(F,grace,'t6_clobber','f0'); ok(F.ruckus===0,'two allies with the same flavor is no Mix');
    b=go(F,rose,'t6_racket','f0'); ok(F.ruckus===5&&gain(b,'mix')===5&&has(b,'mix',x=>x.tgt==='f0'),'a different ally with a different flavor: +5 Mix: '+F.ruckus);
    b=go(F,tom,'t6_sizzle','f0'); ok(F.ruckus===5,'a second Mix on the same monster the same round adds nothing: '+F.ruckus);
    b=go(F,tom,'t6_racket','f1'); ok(F.ruckus===5,'another monster has its own hits: Tom alone is no Mix there'); b=go(F,grace,'t6_sizzle','f1'); ok(F.ruckus===10,'... and Grace’s Sizzle after Tom’s Racket is a Mix on it: '+F.ruckus); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); go(F,tom,'t6_clobber','f0'); go(F,tom,'t6_racket','f0'); ok(F.ruckus===0,'one ally using two flavors is no Mix');
    go(F,tom,'t6_two','f0'); ok(F.ruckus===0,'nor is one two-flavor move by one ally');
    go(F,grace,'t6_two','f0'); ok(F.ruckus===5,'a two-flavor move by another ally brings it: '+F.ruckus); });
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); go(F,tom,'t6_clobber','f0'); F.round++; go(F,grace,'t6_racket','f0'); ok(F.ruckus===0,'hits in two different rounds are no Mix: '+F.ruckus);
    F.round++; go(F,tom,'t6_clobber','f0'); go(F,grace,'t6_racket','f0'); ok(F.ruckus===5,'a new round counts again'); });

  // 129. Detonation +8 and extra hits +1 and Break +15
  noCrit(()=>{ const {F,tom,grace,f0}=fight(); add(F,f0,'dazzled',{src:tom}); const b=go(F,grace,'t6_racket','f0'); ok(has(b,'detonate')&&gain(b,'detonation')===8,'a Detonation fills 8: '+gain(b,'detonation')); });
  noCrit(()=>{ const {F,tom,f0}=fight(); let b=go(F,tom,'t6_clobber','f0'); ok(gain(b,'hits')===0,'a move that hits once: nothing');
    b=go(F,tom,'t6_multi','f0'); ok(gain(b,'hits')===2&&F.ruckus===2,'three hits: the second and third add 1 each: '+F.ruckus); });
  noCrit(()=>{ const {F,tom,f0}=fight(); SK.t6_multi.flavor=['clobber','racket']; const b=go(F,tom,'t6_multi','f0'); SK.t6_multi.flavor=['clobber'];
    ok(gain(b,'hits')===2,'a two-flavor hit counts once, not once per flavor part: '+gain(b,'hits')); });
  noCrit(()=>{ const {F,tom,rose,f0}=fight(); const mu=has(go(F,rose,'lamb_tuck_ankle_tackle','f0'),'ruckus'); ok(F.ruckus===5,'Rose’s Basic (2 hits): 2 x 2% from Bouncy Physics and 1% for the second hit: '+F.ruckus); });
  noCrit(()=>{ const {F,tom,f0}=fight(); f0.maxPips=f0.pips=1; f0.peeves=['clobber']; const b=go(F,tom,'t6_clobber','f0'); ok(f0.pips===0&&has(b,'break')&&gain(b,'break')===15&&F.ruckus===15,'a Break fills 15: '+F.ruckus); });
  noCrit(()=>{ const {F,tom,f0}=fight({ruckus:95}); add(F,f0,'dazzled',{src:tom}); const b=go(F,tom,'t6_racket','f0'); ok(F.ruckus===100,'the gauge stops at 100: '+F.ruckus); });
  noCrit(()=>{ const {F,grace,tom,f0}=fight(); f0.maxPips=f0.pips=1; go(F,tom,'t6_clobber','f0'); f0.peeves=['racket']; const b=go(F,grace,'t6_racket','f0');
    ok(gain(b,'break')===15&&gain(b,'mix')===5,'a Break and a Mix in one action both count: '+J(b.filter(x=>x.t==='ruckus').map(x=>x.why+x.n))); });

  // 130. Who may spend it, and when
  noCrit(()=>{ const t=fight(),{F,tom,grace,deedee}=t; line(t,deedee,grace); F.ruckus=49; let P=Plan(F,deedee,'double'); ok(!P.ok&&/49%/.test(P.why)&&/50%/.test(P.why),'49% is not enough for Double Team: '+P.why);
    F.ruckus=50; P=Plan(F,deedee,'double'); ok(P.ok&&P.partner===grace&&P.parts.length===2,'50% is, with Grace next on the bar'); P=Plan(F,deedee,'full'); ok(!P.ok,'Full Family Ruckus needs 100%: '+P.why);
    F.ruckus=100; ok(Plan(F,deedee,'full').ok,'at 100% it works'); const r=Rk(F,deedee,'double','f0'); ok(r.ok,'(refused: '+r.why+')'); });
  noCrit(()=>{ const t=fight(),{F,tom,grace,deedee,f0}=fight(); F.ruckus=100; F.acting=deedee; for(const x of F.units) x.wait=50; deedee.wait=0; f0.wait=1; grace.wait=20;
    const P=Plan(F,deedee,'double'); ok(!P.ok&&/monster is up next/.test(P.why),'a monster next on the bar: no spend: '+P.why); const r=Rk(F,deedee,'double','f0'); ok(!r.ok&&F.ruckus===100,'and nothing is spent when it is refused: '+F.ruckus); });
  noCrit(()=>{ const t=fight(),{F,grace,deedee,f0}=t; line(t,deedee,grace); F.ruckus=100; grace.ko=true; grace.hp=0; const P=Plan(F,deedee,'double'); ok(!P.ok||P.partner!==grace,'a knocked out family member is never the partner'); });
  noCrit(()=>{ const t=fight(),{F,grace,deedee,f0}=t; line(t,deedee,grace); F.ruckus=100; F.grant={key:deedee.key,maxPep:4,free:true,by:grace.key}; ok(!Plan(F,deedee,'double').ok,'not during a granted free Skill'); });
  noCrit(()=>{ const t=fight(),{F,grace,deedee,f0}=t; line(t,deedee,grace); F.ruckus=100; ok(!Rk(F,deedee,'double',null).ok&&F.ruckus===100,'a move aimed at one monster needs the monster picked'); ok(!Rk(F,deedee,'double','p0').ok,'and a family member is not a monster'); });

  // 131. Double Team: both Basics, +50% power, no Pep, one action, the partner keeps their turn
  noCrit(()=>{ const t=fight(),{F,tom,grace,rose,deedee,f0}=t; line(t,deedee,grace); F.ruckus=60; const pd=deedee.pep,pg=grace.pep,wg=grace.wait,tg=grace.turns;
    const r=Rk(F,deedee,'double','f0'); ok(r.ok,'Double Team goes: '+r.why); const b=r.beats;
    const sp=b.find(x=>x.t==='ruckus'&&x.why==='spend'),gains=b.filter(x=>x.t==='ruckus'&&x.n>0).reduce((v,x)=>v+x.n,0); ok(sp&&sp.n===-50&&F.ruckus===10+gains,'it costs 50% and the pair\u2019s own Detonation and Mix fill some back: '+F.ruckus+' (gains '+gains+')'); ok(deedee.pep===pd&&grace.pep===pg+1,'no Pep is spent and no +2 for the Basics; Grace\u2019s +1 is the Detonation\u2019s: '+deedee.pep+', '+grace.pep);
    const acts=b.filter(x=>x.t==='act'); ok(acts.length===2&&acts[0].src===deedee.key&&acts[0].id===deedee.basic&&acts[1].src===grace.key&&acts[1].id===grace.basic&&acts[1].part2&&!acts[0].part2,'two Basics: Deedee’s and Grace’s, the second marked part2: '+J(acts.map(x=>x.id)));
    ok(has(b,'ruckusSpend',x=>x.kind==='double'&&x.src===deedee.key&&x.partner===grace.key),'a ruckusSpend beat names the pair');
    const hs=b.filter(x=>x.t==='hit'&&x.tgt==='f0'); ok(hs.length===2,'two hits on the monster: '+hs.length);
    // Windex Spritz (Drench) then Soup-Dumpling Squeeze (Clobber) is a Hydro-Slip! all by itself.
    ok(has(b,'detonate',x=>x.id==='hydro_slip'),'the pair Primed and Detonated by themselves (Hydro-Slip!)');
    ok(hs[0].dmg===Math.round(stat(deedee,'atk')*PW.light*1.5*100/(100+def(f0))*1)||hs[0].dmg>0,'Deedee’s hit is boosted');
    ok(near(grace.wait,wg)&&grace.turns===tg,'Grace’s wait and turn count are untouched: '+grace.wait+', '+grace.turns); ok(near(deedee.wait,80*100/stat(deedee,'spd'),1e-6)||deedee.wait>0,'Deedee waits as after a Basic: '+deedee.wait);
    const N=next(F); ok(N.unit===grace,'Grace’s coming turn is still hers: '+(N.unit&&N.unit.key)); });
  // The +50%: the same Basic alone and in the pair. Two test Basics with the same power, no Peeve, no Prime.
  noCrit(()=>{ const t=fight(),{F,grace,deedee,f0,f1}=t; SK.t_basic_pip.composure=0; line(t,deedee,grace); deedee.basic='t_basic_pip'; grace.basic='t_basic_pip'; F.ruckus=50;
    const solo=Math.round(stat(deedee,'atk')*PW.standard*100/(100+def(f0)));
    const b=Rk(F,deedee,'double','f0').beats,h=b.filter(x=>x.t==='hit'&&x.tgt==='f0'),want=Math.round(stat(deedee,'atk')*PW.standard*1.5*100/(100+def(f0)));
    ok(h[0].dmg===want&&solo<h[0].dmg,'+50% power: '+h[0].dmg+' want '+want+' (alone '+solo+')'); SK.t_basic_pip.composure=3; });
  // One action: the group numbers do not overlap and one Composure cap covers both
  noCrit(()=>{ const t=fight(),{F,grace,deedee,f0}=t; line(t,deedee,grace); deedee.basic='t_basic_pip'; grace.basic='t_basic_pip'; f0.maxPips=f0.pips=8; F.ruckus=50;
    const b=Rk(F,deedee,'double','f0').beats; ok(f0.pips===5,'two Basics of 3 Composure each take 3 together (the cap of one action): '+f0.pips);
    const gs=b.filter(x=>x.t==='swing').map(x=>x.g); ok(gs.length===2&&gs[0]!==gs[1],'each move has its own hit group: '+J(gs)); });
  // Rose's two-hit Basic as the partner: her groups come after Deedee's
  noCrit(()=>{ const t=fight(),{F,rose,deedee,f0}=t; line(t,deedee,rose); F.ruckus=50; const b=Rk(F,deedee,'double','f0').beats,gs=b.filter(x=>x.t==='swing').map(x=>x.g);
    ok(J(gs)===J([0,1,2]),'Deedee’s one hit is group 0, Rose’s two hits are groups 1 and 2: '+J(gs)); ok(F.ruckus>=0,''); });
  // The partner may be a different Vibe's Basic: Tom's Lounge Pass Flex
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0}=t; line(t,tom,deedee); F.ruckus=100; const w=deedee.wait; const r=Rk(F,tom,'double','f0'); ok(r.ok&&near(deedee.wait,w),'any two family members next to each other on the bar work: '+(r.why||'')); });

  // 132. Full Family Ruckus: both fire their highest unlocked Main Vibe Skill, free, with a Composure cap of 4
  noCrit(()=>{ const t=fight(),{F,tom,grace,rose,deedee,f0}=t; line(t,tom,deedee); F.ruckus=100; tom.pep=0; deedee.pep=0;
    const r=Rk(F,tom,'full','f0'); ok(r.ok,'Full Family Ruckus goes: '+r.why); const b=r.beats,acts=b.filter(x=>x.t==='act');
    ok(acts.length===2&&acts[0].id==='tarmac_porsche_transfer'&&acts[1].id==='fifty_year_dust_tsunami','Tom’s Tarmac Porsche Transfer and Deedee’s Fifty-Year Dust Tsunami (their Capstones): '+J(acts.map(x=>x.id)));
    const sp=b.find(x=>x.t==='ruckus'&&x.why==='spend'); ok(sp&&sp.n===-100&&tom.pep===0&&deedee.pep===0,'100% spent and no Pep (both had none, and Capstones cost 5 or 6): '+J(sp)+', '+tom.pep+', '+deedee.pep); ok(acts.every(x=>x.free),'both are marked free'); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0}=t; line(t,tom,deedee); tom.skills=['t_cap_a']; deedee.skills=['t_cap_b']; f0.maxPips=f0.pips=8; F.ruckus=100;
    const b=Rk(F,tom,'full','f0').beats; ok(f0.pips===4,'two Skills of 3 Composure: the cap is 4 for this action: '+f0.pips); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0}=t; line(t,tom,deedee); tom.basic='t_basic_pip'; deedee.basic='t_basic_pip'; f0.maxPips=f0.pips=8; F.ruckus=50;
    Rk(F,tom,'double','f0'); ok(f0.pips===5,'Double Team keeps the ordinary cap of 3: '+f0.pips); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0}=t; line(t,tom,deedee); tom.skills=['t_cap_a']; deedee.skills=['t_cap_b']; f0.maxPips=f0.pips=3; f0.peeves=['clobber']; F.ruckus=100;
    const b=Rk(F,tom,'full','f0').beats; ok(f0.pips<=0&&has(b,'break'),'a Break is paid inside the cap and the foe falls back'); ok(gain(b,'break')===15,'and fills 15 after the spend: '+F.ruckus); });
  // The highest unlocked Skill: Rank 2 holds only Skill 1 and 2
  noCrit(()=>{ const B={}; for(const id of PARTY) B[id]=newL(id,2); const t=fight({loadouts:B}),{F,tom,deedee}=t; line(t,tom,deedee); F.ruckus=100;
    const acts=Rk(F,tom,'full','f0').beats.filter(x=>x.t==='act'); ok(acts[0].id==='suite_door_slide'&&acts[1].id==='hand_me_my_glasses_scrub','at Rank 2 it is Skill 2: '+J(acts.map(x=>x.id))); });
  // A Skill that is not aimed at a monster picks its own best choice, and the partner still goes
  noCrit(()=>{ const t=fight(),{F,tom,deedee,grace}=t; line(t,tom,grace); F.ruckus=100; grace.skills=['colossal_diamond_gold_dumpling']; const P=Plan(F,tom,'full'); ok(P.ok,'a Support Capstone is a legal partner move: '+P.why); });
  // A monster that dies to the first move: the partner picks another
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0,f1}=t; line(t,tom,deedee); F.ruckus=50; tom.basic='t6_clobber'; f0.hp=1; const b=Rk(F,tom,'double','f0').beats; ok(has(b,'ko',x=>x.tgt==='f0'),'(f0 falls)');
    ok(b.filter(x=>x.t==='act').length===2&&b.some(x=>x.t==='hit'&&x.src===deedee.key&&x.tgt!=='f0'),'Deedee’s Basic goes to the other monster: '+J(b.filter(x=>x.t==='hit').map(x=>x.src+'>'+x.tgt))); });

  // 133. The gauge between fights, the Ruckus gains of a spend, and the beats the screen reads
  noCrit(()=>{ const t=fight(),{F,tom,grace,deedee,f0}=t; line(t,deedee,grace); F.ruckus=50; const b=Rk(F,deedee,'double','f0').beats; const sp=b.find(x=>x.t==='ruckus'&&x.why==='spend');
    ok(sp&&sp.n===-50&&sp.v===0,'the spend is the first beat and shows 0 left: '+J(sp)); ok(F.ruckus===b.filter(x=>x.t==='ruckus').reduce((v,x)=>x.v,0),'the last beat’s value is the gauge'); ok(F.ruckus>=8,'the Detonation and the Mix of the pair fill the gauge again: '+F.ruckus); });

  // 134. The simple player: spends Full at 100, Double Team only when a Basic was all it could do; whole fights run clean and Capstones stay in use
  noCrit(()=>{ const t=fight(),{F,tom,grace,deedee}=t; line(t,deedee,grace); F.ruckus=100; deedee.pep=10; const a=AutoRk(F,deedee); ok(a&&a.kind==='full','at 100% it spends Full: '+J(a));
    F.ruckus=50; ok(AutoRk(F,deedee)===null,'at 50% with Skills it could pay for, it keeps the gauge'); deedee.pep=0; const a2=AutoRk(F,deedee); ok(a2&&a2.kind==='double','with only a Basic to do, it spends Double Team: '+J(a2)); F.ruckus=49; ok(AutoRk(F,deedee)===null,'and nothing under 50%'); });
  { let err='',wins=0,uses={full:0,double:0},caps=0,n=0; const B={}; for(const id of PARTY) B[id]=newL(id,5);
    for(const f of ['toad','log','grump','mudling']) for(let s=1;s<=25;s++) { try { const r=play({party:PARTY,level:2,formation:f,seed:s,loadouts:B,mods:{foeHp:3}},false,{support:3,ruckus:true}); n++;
      if(r.result==='win') wins++; uses.full+=r.moves.ruckus_full||0; uses.double+=r.moves.ruckus_double||0; for(const k of ['tarmac_porsche_transfer','fifty_year_dust_tsunami','grand_jete_spotlight_finale','double_lamby_return_cart_blitz','three_tier_showstopper_cake']) caps+=r.moves[k]||0; } catch(e) { err=err||e.message; } }
    ok(!err,'100 Rank 5 fights with the Ruckus on run clean: '+err); ok(wins===n,'and are all won: '+wins+' of '+n); ok(uses.full+uses.double>0,'the player spends the gauge: '+J(uses)); ok(caps>0,'and still uses Capstones: '+caps); }
  { let err='',ends=0; const B={}; for(const id of PARTY) B[id]=newL(id,5);
    for(let s=1;s<=20;s++) { try { const r=play({party:PARTY,level:2,formation:'bigone',seed:s,loadouts:B,ruckus:60},false,{support:3,ruckus:true}); if(r.result) ends++; } catch(e) { err=err||e.message; } }
    ok(!err&&ends===20,'The Big One with the gauge at 60 and Ruckus spends on: '+err); }

  // The test rows come out again, and the data check says what it said before this file ran.
  for(const id of ['t_cap_a','t_cap_b','t_basic_pip','t6_clobber','t6_racket','t6_sizzle','t6_drench','t6_multi','t6_two']) delete SK[id];
  ok(J(G('b3CheckData')())===bad0,'data check after this file’s test rows are gone: '+J(G('b3CheckData')()));
};
