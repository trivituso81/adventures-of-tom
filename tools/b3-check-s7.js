// tools/b3-check-s7.js — Battle 3 rule tests for stage 7: the preview (a move played on a copy of the fight) and the recommended move
// (Rose Mode). Code: engine/b3-preview.js. `node tools/b3-sim.js check` runs it after the file for stage 6. Real loadouts, every Vibe at Rank 5.
// The screen half of stage 7 (tap to preview, the picture menus) is tested in the browser: `python3 tools/b3_test.py s7`.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,SK,newL,Auto,Plan,Rk,Clone,Prev,Match,Rec,Unit,Forecast,Foe,Options,CanUse,koCheck,add]=
    ['b3NewFight','b3Next','b3Act','B3_SKILLS','b3NewLoadout','b3Auto','b3RuckusPlan','b3Ruckus','b3Clone','b3Preview','b3Matchups','b3Recommend','b3Unit','b3Forecast','b3FoeTurn','b3Options','b3CanUse','b3KoCheck','b3AddStatus'].map(G);
  const PARTY=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x),RULES=G('B3_RULES');
  const bad0=J(G('b3CheckData')());
  // The whole state of a fight as text, leaving out the shared data rows (so a change anywhere else shows).
  const digest=F=>J(F,(k,v)=>k==='D'||k==='cfg'?undefined:v);
  const fight=cfg=>{ const B={}; for(const id of PARTY) B[id]=newL(id,5);
    const F=NF(Object.assign({party:PARTY,level:2,seed:5,formation:'mudling',loadouts:B},cfg||{}));
    const P={}; for(const p of F.party) { P[p.id]=p; p.hp=p.maxHp=Math.max(p.maxHp,400); }
    for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; }
    return {F,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,rose:P.rose,deedee:P.deedee}; };
  const turnOf=(T0,u)=>{ T0.F.acting=u; for(const x of T0.F.units) x.wait=50; u.wait=0; return T0; };
  for(const [id,fl] of [['t7_clobber','clobber'],['t7_drench','drench'],['t7_sizzle','sizzle'],['t7_racket','racket']])
    SK[id]={id,vibe:'tom_flier',slot:'s1',name:'Test seven '+fl,pep:0,flavor:[fl],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};

  // 135. A copy of a fight plays exactly like the fight (so a preview is the truth), and a preview leaves the fight alone
  { let n=0,bad=0,moved=0,err='';
    for(let seed=1;seed<=10;seed++) { try { const t=fight({formation:seed%2?'bigone':'toad',seed});
      for(const p of t.F.party) { p.hp=p.maxHp; } for(const f of t.F.foes) { f.hp=f.maxHp=300; }
      for(let i=0;i<30&&!t.F.over;i++) { const N=next(t.F); if(!N.unit||t.F.over) break; const u=N.unit;
        if(u.side==='foe') { Foe(t.F,u); continue; }
        const p=Auto(t.F,u),C=Clone(t.F),d0=digest(t.F);
        const a=act(t.F,u,p.skill,p.target),b=act(C,Unit(C,u.key),p.skill,p.target); n++;
        if(J(a.beats)!==J(b.beats)||digest(t.F)!==digest(C)) bad++;
        // and a preview of the very same move, taken before it is made, does not change the fight
        const t2=fight({formation:'toad',seed:seed+50}); const e0=digest(t2.F); Prev(t2.F,t2.F.party[0],'lounge_pass_flex','f0'); if(digest(t2.F)!==e0) moved++; } } catch(e) { err=err||e.message; } }
    ok(!err,'copy test ran: '+err); ok(n>=150&&bad===0,'a copy of the fight plays '+n+' moves exactly like the fight: '+bad+' differ'); ok(moved===0,'a preview leaves the fight as it was'); }

  // 136. What a preview says: cost, flavor, Pet Peeve and Resist per monster, Detonation, pips, the bar after
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0,f1}=t; turnOf(t,tom); tom.basic='t7_clobber';
    // Pet Peeve and Resist
    f0.peeves=['clobber']; f1.resists=['clobber'];
    const m=Match(F,tom,SK.t7_clobber); ok(m.length===2&&m[0].peeve&&!m[0].resist&&m[1].resist&&!m[1].peeve,'matchups: Pet Peeve on the first, Resist on the second: '+J(m.map(x=>[x.peeve,x.resist])));
    const P0=Prev(F,tom,'t7_clobber','f0'),P1=Prev(F,tom,'t7_clobber','f1');
    ok(P0.ok&&P0.tgts.f0.peeve&&P1.tgts.f1.resist,'the preview shows the same Pet Peeve and Resist on the hit: '+J([P0.tgts.f0.peeve,P1.tgts.f1.resist]));
    ok(P0.tgts.f0.dmg>P1.tgts.f1.dmg,'a Pet Peeve hit is bigger than a Resist hit: '+P0.tgts.f0.dmg+' > '+P1.tgts.f1.dmg);
    ok(P0.cost===0&&P0.flavor.join()==='clobber','cost and flavor are the move\'s: '+P0.cost+' '+P0.flavor);
    f0.peeves=[]; f1.resists=[];
    // A Detonation: Drenched then a Clobber hit is Hydro-Slip!, and the monster falls back on the bar
    add(F,f0,'drenched',{src:deedee}); const before=Forecast(F,9,{actor:tom,recovery:80}).map(e=>e.u.key).join();
    const mm=Match(F,tom,SK.t7_clobber)[0]; ok(mm.det&&mm.det.id==='hydro_slip','before it is aimed the box already says Hydro-Slip!: '+J(mm.det));
    const P=Prev(F,tom,'t7_clobber','f0'); ok(P.dets.length===1&&P.dets[0].id==='hydro_slip'&&P.dets[0].tgt==='f0','the preview names the Detonation: '+J(P.dets));
    ok(P.moves.some(x=>x.tgt==='f0'&&x.kind==='push'&&x.n>0),'and the push: '+J(P.moves)); ok(!!F.foes[0].st.drenched&&F.foes[0].hp===9999,'(the real monster is still Drenched and untouched)');
    const after=P.bar.map(e=>e.k).join(); ok(before!==after,'the bar after is not the bar before: '+before+' / '+after);
    const posB=Forecast(F,9,{actor:tom,recovery:80}).findIndex(e=>e.u.key==='f0'),posA=P.bar.findIndex(e=>e.k==='f0'); ok(posA>=posB||posA<0,'the pushed monster stands later on the bar: '+posB+' to '+posA);
    // The preview never rolls: a crit chance of 100% changes nothing in it
    const d1=Prev(F,tom,'t7_clobber','f1').tgts.f1.dmg; RULES.crit.rate=9; const d2=Prev(F,tom,'t7_clobber','f1').tgts.f1.dmg; RULES.crit.rate=-9; ok(d1===d2,'a preview never shows a crit: '+d1+' '+d2);
    ok(Clone(F).preview===undefined&&Prev(F,tom,'t7_clobber','f1').ok&&G('b3Rand')({preview:true})>.99,'only the copy is marked as a preview'); });
  // Pips and a Break
  noCrit(()=>{ const t=fight({formation:'bigone'}),{F,tom}=t; turnOf(t,tom); tom.basic='t7_racket'; const boss=F.foes[0]; boss.peeves=['racket']; boss.hp=boss.maxHp=9999;
    boss.pips=boss.maxPips; const P=Prev(F,tom,'t7_racket',boss.key); ok(P.pips.length&&P.pips[0].n>=1&&P.pips[0].max===boss.maxPips,'a Pet Peeve hit on a boss takes pips: '+J(P.pips));
    boss.pips=1; const Q=Prev(F,tom,'t7_racket',boss.key); ok(Q.breaks.includes(boss.key),'and with 1 pip left the preview says Break: '+J(Q.breaks)); ok(boss.pips===1&&!boss.broken,'(the real boss has not been touched)'); });
  // Heals, shields, a revive, a spend
  noCrit(()=>{ const t=fight(),{F,tom,deedee,grace}=t; turnOf(t,deedee); tom.hp=40; deedee.pep=10;
    const heal=deedee.skills.map(id=>SK[id]).find(S=>S.effects.some(e=>e.op==='heal')&&S.target!=='all_foes'&&Options(F,deedee,S).some(o=>!o.no&&o.key===tom.key));
    if(heal) { const P=Prev(F,deedee,heal.id,tom.key); ok(P.heals.some(h=>h.tgt===tom.key&&h.n>0),'a heal preview says who is healed and how much: '+J(P.heals)); ok(tom.hp===40,'(Tom is still at 40)'); }
    else ok(false,'no heal found for Deedee to test'); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee}=t; turnOf(t,deedee); tom.hp=0; tom.ko=true; deedee.pep=10; const P=Prev(F,deedee,'pick_me_up',tom.key); ok(P.ok&&P.revives.includes(tom.key),'Pick-Me-Up previews a revive: '+J(P.revives)); ok(tom.ko,'(Tom is still down)'); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,grace}=t; turnOf(t,tom); grace.wait=1; F.ruckus=100; const P=Prev(F,tom,'ruckus:full',F.foes[0].key); ok(P.ok&&P.dealt>0&&P.ruckus<=0,'a Full Family Ruckus can be previewed: '+P.ok+' dealt '+P.dealt+' gauge '+P.ruckus); ok(F.ruckus===100,'(the real gauge is still 100)');
    F.ruckus=10; const Q=Prev(F,tom,'ruckus:double',F.foes[0].key); ok(!Q.ok&&/needs 50/.test(Q.why),'and the refusal is the rule\'s own words: '+Q.why); });
  // A move that cannot be used says why, and costs the preview nothing
  { const t=fight(),{F,tom}=t; turnOf(t,tom); tom.pep=0; const S=tom.skills.map(id=>SK[id]).find(S=>S.pep>0); const P=Prev(F,tom,S.id,F.foes[0].key); ok(!P.ok&&/Pep/i.test(P.why),'not enough Pep is refused in words: '+P.why); }

  // 137. The recommended move
  noCrit(()=>{ // never an illegal move, never changes the fight, the same answer twice
    let n=0,bad=0,moved=0,flick=0,err='';
    for(let seed=1;seed<=8;seed++) { try { const t=fight({formation:['mudling','toad','log','bigone'][seed%4],seed}); const F=t.F;
      for(const f of F.foes) { f.hp=f.maxHp=250; }
      for(let i=0;i<24&&!F.over;i++) { const N=next(F); if(!N.unit||F.over) break; const u=N.unit;
        if(u.side==='foe') { Foe(F,u); continue; }
        const d0=digest(F),r=Rec(F,u),r2=Rec(F,u); n++;
        if(digest(F)!==d0) moved++; if(J(r)!==J(r2)) flick++;
        if(!r) { bad++; continue; }
        const refused=r.kind==='ruckus'?!Plan(F,u,r.skill.slice(7)).ok:!CanUse(F,u,SK[r.skill]).ok||!Options(F,u,SK[r.skill]).some(o=>o.key===r.target&&!o.no);
        if(refused) bad++;
        const x=r.kind==='ruckus'?Rk(F,u,r.skill.slice(7),r.target):act(F,u,r.skill,r.target); if(!x.ok) bad++; } } catch(e) { err=err||e.message; } }
    ok(!err,'recommendation test ran: '+err); ok(n>=100&&bad===0,'the recommended move is always one the rules accept ('+n+' turns, '+bad+' refused)'); ok(moved===0,'asking for it never changes the fight'); ok(flick===0,'asking twice gives the same answer'); });
  // It sees what matters: a knocked-out family member, a family member about to fall, a free Detonation
  noCrit(()=>{ const t=fight(),{F,tom,deedee,grace,rose}=t; turnOf(t,deedee); tom.hp=0; tom.ko=true; deedee.pep=10; const r=Rec(F,deedee);
    const up=r&&r.target===tom.key&&Prev(F,deedee,r.skill,r.target).revives.includes(tom.key);   // Pick-Me-Up, or a bigger move that also brings them back (To the Moon & Back)
    ok(up,'someone is down, so the recommended move brings them back: '+J(r&&[r.skill,r.target,r.why])); ok(r&&/back on their feet/.test(r.why),'and says so: '+(r&&r.why)); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,grace,rose}=t; turnOf(t,deedee); tom.hp=30; deedee.pep=10; const r=Rec(F,deedee),S=r&&SK[r.skill];
    ok(r&&S&&S.effects.some(e=>e.op==='heal')&&r.target===tom.key,'Tom is at 30 of 400: Deedee heals him: '+J(r&&[r.skill,r.target])); ok(r&&/hurting/.test(r.why),'and says why in words a helper can read: '+(r&&r.why)); });
  noCrit(()=>{ const t=fight(),{F,tom,deedee,f0}=t; turnOf(t,tom); tom.pep=0; add(F,f0,'drenched',{src:deedee}); tom.basic='t7_clobber'; tom.skills=tom.skills.slice(); const r=Rec(F,tom);
    ok(r&&r.skill==='t7_clobber'&&r.target==='f0','with no Pep to spend, the free hit that sets off Hydro-Slip! on the Drenched monster: '+J(r&&[r.skill,r.target])); ok(r&&/Hydro-Slip/.test(r.why),'and it says so: '+(r&&r.why)); });
  // When the gauge is full and a partner is next, the Ruckus is on the table; with nothing else the Basic is free and builds Pep
  noCrit(()=>{ const t=fight(),{F,tom,grace}=t; turnOf(t,tom); grace.wait=1; F.ruckus=100; const r=Rec(F,tom); ok(r&&r.kind==='ruckus','a full gauge and a partner next: the Ruckus is recommended: '+J(r&&[r.skill,r.kind])); });
  noCrit(()=>{ const t=fight(),{F,tom}=t; turnOf(t,tom); tom.pep=0; tom.skills=[]; tom.pocketSkills=[]; const r=Rec(F,tom); ok(r&&r.kind==='basic'&&/Free/.test(r.why),'with no Skill to pay for it is the Basic, "free and builds Pep": '+J(r&&[r.skill,r.kind,r.why])); });
  // A monster is winding up a big attack: when Tom has a move that stops it (or takes it for the family), that is the move he is recommended
  noCrit(()=>{ let tries=0,stops=0,miss=[]; for(let seed=1;seed<=8;seed++) { const t=fight({formation:'bigone',seed}),{F}=t; const boss=F.foes[0]; boss.peeves=[]; boss.hp=boss.maxHp=9999;
    const ST=G('B3_STATUS'),stopsIt=on=>on&&(on.interrupts.length||on.breaks.length||on.adds.some(a=>ST[a.id]&&(ST[a.id].intercept||(ST[a.id].flags||[]).includes('taunt'))));
    for(let i=0;i<120&&!F.over;i++) { const N=next(F); if(!N.unit||F.over) break; const u=N.unit;
      if(u.side==='foe') { Foe(F,u); continue; }
      if(boss.charge&&u.id==='tom') {
        let can=false; for(const S of G('b3Skills')(F,u)) { if(!CanUse(F,u,S).ok) continue; for(const o of Options(F,u,S)) if(!o.no&&stopsIt(Prev(F,u,S.id,o.key))) can=true; }
        if(can) { tries++; const r=Rec(F,u),on=r&&r.kind!=='ruckus'?Prev(F,u,r.skill,r.target):null; if(r&&(r.kind==='ruckus'||stopsIt(on))) stops++; else miss.push(J(r&&[r.skill,r.target,r.why])); } }
      const p=Auto(F,u); act(F,u,p.skill,p.target); } }
    ok(tries>0,'The Big One winds up while Tom has a move that stops it ('+tries+' times)'); ok(stops===tries,'then the recommended move is one that stops it: '+stops+' of '+tries+' '+miss.join(' ')); });
  // A whole fight played by the recommended move: won, clean, every Capstone gets used, and it is not the simple player in disguise
  { let err='',n=0,wins=0,caps={},kinds={},sup=0; const B={}; for(const id of PARTY) B[id]=newL(id,5);
    const capIds=Object.values(SK).filter(S=>S.slot==='cap'&&['grace','tom','rose','deedee'].some(id=>G('B3_VIBES')[S.vibe]&&G('B3_VIBES')[S.vibe].owner===id)).map(S=>S.id);
    for(const f of ['mudling','toad','log','bigone']) for(let s=1;s<=15;s++) { try { const r=play({party:PARTY,level:2,formation:f,seed:s,loadouts:B,mods:{foeHp:3}},false,{rec:true}); n++; if(r.result==='win') wins++;
      for(const k of Object.keys(r.moves)) { kinds[k]=(kinds[k]||0)+r.moves[k]; if(capIds.includes(k)) caps[k]=(caps[k]||0)+r.moves[k]; } } catch(e) { err=err||e.message; } }
    ok(!err,'60 fights with the recommended move run clean: '+err); ok(wins===n,'and are all won: '+wins+' of '+n); ok(Object.keys(caps).length>=3,'at least three of the four first Capstones get used: '+J(caps)); ok(Object.keys(kinds).length>=12,'it uses many different moves: '+Object.keys(kinds).length); }

  // 138. Rose Mode's automatic loadout: Sig Vibes as Main and Pocket, the newest written Quirks, the player's own book untouched
  { const RL=G('b3RoseLoadout'),Fix=G('b3FixLoadout'),Pool=G('b3QuirkPool'),Q=G('B3_QUIRKS'),V=G('B3_VIBES'),C=G('B3_CAST'),Has=G('b3HasKit'); let n=0,bad=[];
    for(const id of Object.keys(C).filter(Has)) for(const rank of [1,3,5]) { const L=newL(id,rank),mine=J(L); n++;
      const R=RL(id,L),ids=C[id].vibes,s1=ids.find(v=>V[v].sig===1),s2=ids.find(v=>V[v].sig===2);
      if(R.main!==(s1||R.main)||(s2&&s2!==R.main&&R.pocket!==s2)) bad.push(id+' sig '+rank);
      if(J(Fix(id,R))!==J(R)) bad.push(id+' invalid '+rank);
      if(J(R.vp)!==J(L.vp)) bad.push(id+' vp '+rank);
      const pool=Pool(id,R).filter(q=>Q[q]&&!Q[q].soon),want=pool.slice(-2);
      if(R.quirks.filter(Boolean).join()!==want.join()) bad.push(id+' quirks '+rank+' '+R.quirks+' vs '+want);
      if(J(L)!==mine) bad.push(id+' book changed '+rank); }
    ok(n>=12&&bad.length===0,'Rose Mode loadouts for '+n+' members and Ranks: '+bad.slice(0,4).join(' ; '));
    const g=RL('grace',newL('grace',5)); ok(g.quirks.filter(Boolean).length===2,'at Rank 5 Grace gets two Quirks: '+g.quirks); ok(RL('grace',newL('grace',1)).quirks.filter(Boolean).length===0,'at Rank 1 none are open, so none are equipped'); }

  for(const id of ['t7_clobber','t7_drench','t7_sizzle','t7_racket']) delete SK[id];
  ok(J(G('b3CheckData')())===bad0,'data check after this file\'s test rows are gone: '+J(G('b3CheckData')()));
};
