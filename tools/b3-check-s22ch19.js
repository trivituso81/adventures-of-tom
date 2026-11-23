// tools/b3-check-s22ch19.js — Battle 3 checks for stage 22, chapter 19 (the lost-mail office: Dead Letter, Rubber Stamp, the Brass Mail-Chute Courier, The Dead-Letter Censor; bestiary entries 80 to 83).
// Data: data/b3-foes-ch19.js, data/b3-status.js (wax_ward, wax_seal, ink_pad, denied, whoosh_eva, black_marker), data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new94 to new97).
// Written from tools/b3-check-s22ch18.js and b3-check-s22ch17.js. The rules this chapter adds: REDACTED (`redact` on the Censor: engine/b3-timeline.js, b3-resolve.js), the Wax-Seal Ward's
// `bounceDebuff` flag (engine/b3-ops.js) and the Courier's Wall Perch (`perch`, the `when:{row}` act condition and `row:'swap'`). The page side (the real scenes on screen, tips shown, victory
// card, Vibe Points) is tools/ch19_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 18.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick'),carried=G('b3Carried'),effRow=G('b3EffRow'),roundStart=G('b3RoundStart'),actOk=G('b3ActOk');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['grace','rose','amy','tnb'],PT=['tom','grace','rose','amy'];   // the chapter's party; Tom's kit is used for the one-move sandboxes below

  // 1. The switch, the floor, the numbers (bestiary entries 80 to 83, printed as they are except the Censor's HP, which the simulator moved: see data/b3-foes-ch19.js and docs/BATTLE3.md)
  ok(S.chapters.includes(19)&&S.chapters.indexOf(19)>S.chapters.indexOf(18)&&S.chapters.indexOf(19)<S.chapters.indexOf(21),'chapter 19 is on Battle 3 after chapter 18 (found '+J(S.chapters)+')');
  ok(S.levelFloor[19]===47&&S.levelFloor.length===20,'chapter 19 floors the Character Level at the bestiary baseline, 47 (found '+S.levelFloor[19]+')');
  const DL=FOES.deadletter,RS=FOES.rubberstamp,CO=FOES.mailcourier,CE=FOES.censor;
  ok(DL&&DL.ch===19&&DL.role==='elite'&&DL.row==='front'&&DL.hp===2142&&DL.atk===193&&DL.def===96&&DL.spd===109&&DL.pips===5&&DL.drop==='pretzels'&&J(DL.peeves)==='["clobber","sizzle"]'&&J(DL.resists)==='[]'&&J(DL.start)==='["wax_ward","wax_seal"]','Dead Letter: Elite, Front, 2,142 HP, Atk 193, Def 96, Spd 109, 5 pips, Pet Peeves Clobber and Sizzle, starts under the Wax-Seal Ward');
  ok(RS&&RS.ch===19&&RS.role==='elite'&&RS.hp===2142&&RS.atk===193&&RS.def===96&&RS.spd===109&&RS.pips===5&&RS.drop==='coldbrew'&&J(RS.peeves)==='["clobber","razzle"]'&&J(RS.resists)==='["drench"]'&&J(RS.start)==='["ink_pad"]','Rubber Stamp: Elite, Front, 2,142 HP, 5 pips, Pet Peeves Clobber and Razzle, resists Drench, starts in the Ink-Pad Stance');
  ok(CO&&CO.ch===19&&CO.role==='elite'&&CO.row==='back'&&CO.noRun&&CO.perch&&CO.hp===2300&&CO.hp3===1720&&CO.atk===193&&CO.def===96&&CO.spd===109&&CO.pips===5&&J(CO.peeves)==='["razzle","drench"]'&&J(CO.resists)==='["clobber"]','Courier: a mini-boss with Elite stats, Back, no running, Wall Perch, 2,300 HP (1,720 for three), Pet Peeves Razzle and Drench, resists Clobber');
  ok(CE&&CE.ch===19&&CE.role==='boss'&&CE.row==='front'&&CE.noRun&&CE.drop===null&&CE.atk===210&&CE.def===89&&CE.spd===123&&CE.pips===8&&J(CE.peeves)==='["razzle","sizzle"]'&&J(CE.resists)==='["racket"]'&&CE.redact&&CE.redact.dmg===.5,'Censor: boss, Front, no running, Atk 210, Def 89, Spd 123, 8 pips, Pet Peeves Razzle and Sizzle, resists Racket, REDACTED at half damage');
  ok(CE.hp===2300&&CE.hp3===1725&&Math.round(CE.hp*.75)===CE.hp3,'its HP is 2,300 (1,725 for three; printed 3,400 and 2,550: the one number the simulator moved) and the three-party HP stays three quarters of it');
  ok(J(DL.acts.map(a=>a.id))==='["paper_edge_slash","flap_seal","return_to_sender"]'&&J(RS.acts.map(a=>a.id))==='["ink_stomp","postmark","denied"]','Dead Letter and Rubber Stamp have the three acts the bestiary prints');
  ok(J(CO.acts.map(a=>a.id))==='["sorting_claw_ricochet","hot_steam_vent","special_delivery_slam","pneumatic_whoosh"]'&&J(CE.acts.map(a=>a.id))==='["black_marker_strike","no_such_address","dead_letter_sort","strike_it_out","undeliverable"]','the Courier has four acts and the Censor five, in printed order');
  { const A=(D,id)=>D.acts.find(a=>a.id===id);
    ok(A(DL,'return_to_sender').power===1.5&&A(DL,'return_to_sender').recovery===120&&A(DL,'return_to_sender').tags.includes('charge_up')&&A(DL,'return_to_sender').flavor[0]==='racket','Return To Sender: Racket 1.5x, Recovery 120, charged first');
    ok(A(RS,'denied').power===1.5&&A(RS,'denied').tags.includes('charge_up')&&A(RS,'postmark').flavor[0]==='drench','DENIED! is Clobber 1.5x and charged first; Postmark is Drench');
    ok(A(CO,'special_delivery_slam').when.row==='back'&&A(CO,'pneumatic_whoosh').when.row==='front'&&A(CO,'hot_steam_vent').hits==='all'&&A(CO,'sorting_claw_ricochet').hits==='two_random','Courier: the Slam is wound up from the Back, the Whoosh used from the Front, Vent hits everyone, Ricochet two at random');
    ok(A(CE,'dead_letter_sort').when.once&&A(CE,'dead_letter_sort').when.hpBelow===.5&&A(CE,'undeliverable').when.hpBelow===.5&&A(CE,'strike_it_out').hits==='all'&&A(CE,'undeliverable').hits==='all','Dead-Letter Sort is a once act at half HP, UNDELIVERABLE joins below half HP, and no Censor act is a single-target spike'); }
  ok(FORMS.deadletter.vp===10&&FORMS.rubberstamp.vp===10&&J(FORMS.deadletter.foes)===J([{id:'deadletter',row:'front'}])&&J(FORMS.rubberstamp.foes)===J([{id:'rubberstamp',row:'front'}]),'a Dead Letter or a Rubber Stamp stands alone (one Elite, not two) and pays 10 Vibe Points');
  ok(FORMS.mailcourier.vp===20&&J(FORMS.mailcourier.foes)===J([{id:'deadletter',row:'front'},{id:'mailcourier',row:'back'}])&&FORMS.censor.vp===30&&J(FORMS.censor.foes)===J([{id:'censor',row:'front'}]),'the Courier fight is a Dead Letter in Front and the Courier in Back (20 VP); the Censor stands alone (30 VP)');
  ok(['new94:deadletter','new95:rubberstamp','new96:mailcourier','new97:censor'].every(s=>{ const [id,f]=s.split(':'); return LAB.some(l=>l.id===id&&l.level===47&&l.formation===f&&J(l.party)===J(P)); }),'the Lab has NEW 94 to 97 with Grace, Rose, Amy and TNB at level 47');
  ok(!/—/.test(read('data/b3-foes-ch19.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 2. The statuses
  { const w=ST.wax_ward,s=ST.wax_seal,i=ST.ink_pad,d=ST.denied,e=ST.whoosh_eva,m=ST.black_marker;
    ok(w&&w.kind==='buff'&&w.dur.n===2&&w.mods[0].stat==='def'&&w.mods[0].v===.2,'Wax-Seal Ward is +20% Defense for 2 turns, a buff');
    ok(s&&s.kind==='buff'&&s.dur.n===2&&s.flags.includes('bounceDebuff'),'Wax Seal is a 2-turn buff that sends a debuff back');
    ok(i&&i.kind==='stance'&&i.dur.n===2&&i.mods[0].stat==='reduce'&&i.mods[0].v===.25,'Ink-Pad Stance is a 2-turn Guard Stance at 25% less damage');
    ok(d&&d.kind==='debuff'&&d.dur.n===2&&d.mods[0].stat==='def'&&d.mods[0].v===-.2,'DENIED! is -20% Defense for 2 turns, a debuff');
    ok(e&&e.kind==='buff'&&e.dur.n===1&&e.mods[0].stat==='eva'&&e.mods[0].v===.2,'Pneumatic Whoosh is +20% Evasion for 1 turn, a buff');
    ok(m&&m.kind==='debuff'&&m.dur.n===2&&m.mods[0].stat==='atk'&&m.mods[0].v===-.2,'Black Marker is -20% Attack for 2 turns, a debuff'); }

  // 3. Scene: tips under ch19, Battle 3 wording
  const sc=read('data/scenes-ch19.js');
  ok(/tut:'ch19'/.test(sc),'chapter 19 scenes start the fight (tut ch19)');
  ok(Array.isArray(S.tips.ch19)&&S.tips.ch19.length>=4,'tips under the key ch19 (at least four)');
  for(const t of S.tips.ch19) ok(t.text.length<=320&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|Sparkle|amber|BENCH CALL|PULL UP A CHAIR|DEFEND/.test(t.text),'ch19 tip '+t.id+' is short, has no dash and no Battle 2 word');
  ok(/B3_CH_ON\(19\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(19\)[^\n]*/g).join('')),'chapter 19 has a Battle 3 wording variant in its scenes');
  ok(/flag\('battle:censor'\)==='win'/.test(sc),'on Battle 3 the after scene plays only after a win (a loss heals the family and lets them try again)');

  // 4. Fights: everyone healthy with plenty of Pep unless a check says otherwise
  const mk=o=>{ const F=NF(Object.assign({party:PT,level:47,formation:'censor',rows:{tom:'front',grace:'back',rose:'back',amy:'front'},seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,20000); p.pep=8; } return F; };
  const censor=F=>F.foes.find(f=>f.id==='censor'),tomOf=F=>F.party.find(p=>p.id==='tom');
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mkSkill=(id,flavor,extra)=>{ SK[id]=Object.assign({id,vibe:'tom_flier',slot:'s1',name:'Test '+id,pep:0,flavor,power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]},extra||{}); };
  mkSkill('t19_sz',['sizzle']); mkSkill('t19_rz',['razzle']); mkSkill('t19_dr',['drench']); mkSkill('t19_sr',['sizzle','razzle']);
  mkSkill('t19_sl',['clobber'],{effects:[{op:'damage'},{op:'status',id:'slow',n:2,to:'target'}]});
  { const F=mk(),w=censor(F),f3=NF({party:['tom','grace','rose'],level:47,formation:'censor',seed:3}).foes[0];
    ok(w.maxHp===Math.round(CE.hp*F.mods.foeHp)&&f3.maxHp===Math.round(CE.hp3*F.mods.foeHp)&&f3.maxHp<w.maxHp,'with four in the party the Censor has its HP, with three hp3 (found '+w.maxHp+' and '+f3.maxHp+')');
    ok(J(F.foes.map(f=>f.id))==='["censor"]'&&w.pips===8&&w.stamp===null,'it stands alone with 8 Composure pips and no stamp'); }

  // 5. REDACTED
  noCrit(()=>{
    // round 1 has no stamp; the divider into round 2 stamps the flavor that did the most damage, and a tie or no damage stamps nothing
    { const F=mk(),w=censor(F),t=tomOf(F); ok(F.round===1&&w.stamp===null,'in round 1 nothing is stamped');
      go(F,t,'t19_sz',w.key); ok(w.dmgLog.sizzle>0,'a Sizzle hit is logged against the Censor for the round');
      const b=[]; roundStart(F,b); ok(F.round===2&&w.stamp==='sizzle'&&b.some(x=>x.t==='stamp'&&x.flavor==='sizzle')&&J(w.dmgLog)==='{}','at the divider into round 2 it stamps Sizzle (the flavor that hurt it most) and the log starts again');
      const row=carried(F,w).find(r=>/REDACTED/.test(r.name)); ok(row&&row.kind==='lens'&&/Sizzle/.test(row.name),'the stamp shows on its carried list as REDACTED: Sizzle');
      const b2=[]; roundStart(F,b2); ok(w.stamp===null&&!b2.some(x=>x.t==='stamp'),'a round with no damage stamps nothing (the stamp lasts one round)'); }
    { const F=mk(),w=censor(F); w.dmgLog={sizzle:100,razzle:100}; roundStart(F,[]); ok(w.stamp===null,'two flavors that tie stamp nothing'); }
    { const F=mk(),w=censor(F); w.dmgLog={sizzle:100,razzle:101}; roundStart(F,[]); ok(w.stamp==='razzle','the larger of two flavors is the one stamped'); }
    // a stamped hit: half damage, no pips, the attacker loses 1 Pep; an unstamped flavor is full
    for(const [sk,hit] of [['t19_sz',true],['t19_rz',false]]) { const F=mk(),w=censor(F),t=tomOf(F),F2=mk(),w2=censor(F2),t2=tomOf(F2);
      w.stamp='sizzle'; const h0=w.hp,p0=w.pips; go(F,t,sk,w.key); go(F2,t2,sk,w2.key); const d1=h0-w.hp,d2=w2.maxHp-w2.hp;
      ok(hit?Math.abs(d1-d2*.5)<=1:d1===d2,(hit?'a stamped Sizzle hit does half damage':'a Razzle hit is untouched by a Sizzle stamp')+' ('+d1+' against '+d2+')');
      ok(hit?(w.pips===p0&&t.pep===7):(w.pips<p0&&t.pep===8),(hit?'the stamped hit takes no pips and costs the attacker 1 Pep':'the Razzle hit still shaves a pip and costs no Pep')+' (pips '+p0+' to '+w.pips+', Pep '+t.pep+')'); }
    { const F=mk(),w=censor(F),t=tomOf(F); w.stamp='sizzle'; t.pep=0; go(F,t,'t19_sz',w.key); ok(t.pep===0,'the Pep loss never goes below 0'); }
    // a move of two flavors loses only its matching half, and still takes its pips
    { const F=mk(),w=censor(F),t=tomOf(F),F2=mk(),w2=censor(F2),t2=tomOf(F2); w.stamp='sizzle'; go(F,t,'t19_sr',w.key); go(F2,t2,'t19_sr',w2.key);
      const d1=w.maxHp-w.hp,d2=w2.maxHp-w2.hp; ok(d1<d2&&d1>d2*.6,'a Sizzle and Razzle move loses only its Sizzle half under a Sizzle stamp ('+d1+' against '+d2+')');
      ok(t.pep===8,'a two-flavor move is not "only that flavor": no Pep is lost'); }
    // a Break tears the stamp down
    { const F=mk(),w=censor(F),t=tomOf(F); w.stamp='sizzle'; w.pips=1; go(F,t,'t19_rz',w.key); ok(w.broken&&w.stamp===null,'a Break tears the stamp down (pips '+w.pips+', stamp '+w.stamp+')'); }
    // the simple player stops using the stamped flavor when another one is nearly as good
    { const F=mk(),w=censor(F),t=tomOf(F); const sc=G('b3AutoScore'),O=G('b3Options')(F,t,SK.t19_sz)[0]; const a=sc(F,t,SK.t19_sz,O); w.stamp='sizzle'; const b=sc(F,t,SK.t19_sz,O); ok(b<a,'the simple player scores a stamped flavor lower ('+a.toFixed(1)+' to '+b.toFixed(1)+')'); }
  });

  // 6. Dead-Letter Sort: once, at half HP, a Dead Letter arrives in Front at half HP with 0 pips and its own ward
  { const F=mk(),w=censor(F); w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='dead_letter_sort'); const q=pick(F,w,true);
    ok(!q||q.act.id!=='dead_letter_sort','above half HP Dead-Letter Sort is not picked');
    w.hp=Math.round(w.maxHp*.45); const q2=pick(F,w,true); ok(q2&&q2.act.id==='dead_letter_sort','at half HP or less Dead-Letter Sort comes first (a once act)');
    F.acting=w; const b=foeTurn(F,w),s=b.filter(x=>x.t==='summon');
    ok(s.length===1&&s[0].id==='deadletter'&&s[0].row==='front','it calls one Dead Letter to the Front');
    const d=F.foes.find(f=>f.id==='deadletter'); ok(d&&d.pips===0&&d.add&&Math.abs(d.hp-Math.round(FOES.deadletter.hp*.5*F.mods.foeHp))<=1,'the Dead Letter is an add: half its HP, 0 pips');
    ok(d.st.wax_ward&&d.st.wax_seal,'it arrives under its Wax-Seal Ward (+20% Defense and the seal)');
    w.stripped={}; const q3=pick(F,w,true); ok(q3&&q3.act.id!=='dead_letter_sort'&&(w.uses.dead_letter_sort||0)===1,'it is used once'); }
  { const F=mk(),w=censor(F); w.hp=Math.round(w.maxHp*.45); w.uses.dead_letter_sort=1; const ids=new Set(); for(let i=0;i<14;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(ids.has('undeliverable')&&!ids.has('dead_letter_sort'),'below half HP UNDELIVERABLE joins the rotation'); }
  { const F=mk(),w=censor(F); w.hp=Math.round(w.maxHp*.9); const ids=new Set(); for(let i=0;i<14;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(!ids.has('undeliverable'),'above half HP UNDELIVERABLE is not used'); }
  noCrit(()=>{ const F=mk(),w=censor(F); w.actIx=w.D.acts.findIndex(a=>a.id==='strike_it_out'); const b1=turn(F,w,2); ok(w.charge&&w.charge.id==='strike_it_out'&&b1.some(x=>x.t==='telegraph'),'Strike It Out is charged first');
    const hp0=F.party.map(p=>p.hp),b2=turn(F,w,3); ok(F.party.every((p,i)=>p.hp<hp0[i])&&F.party.every(p=>p.st.slow),'it then hits all four and Slows each'); });

  // 7. The Wax-Seal Ward sends the first debuff back and is used up; the +20% Defense stays
  noCrit(()=>{ const F=mk({formation:'deadletter'}),d=F.foes.find(f=>f.id==='deadletter'),t=tomOf(F); const d0=G('b3Stat')(d,'def');
    go(F,t,'t19_sl',d.key); ok(!d.st.slow&&!d.st.wax_seal&&d.st.wax_ward,'the first debuff does not land, the seal is used up and the Defense buff stays');
    ok(t.st.slow&&t.st.slow.n>=1,'the same debuff went back on whoever sent it');
    ok(Math.abs(G('b3Stat')(d,'def')-d0)<1e-6,'its Defense is the same after the bounce'); t.pep=4; t.st={}; go(F,t,'t19_sl',d.key); ok(d.st.slow&&!t.st.slow,'the second debuff lands, and nothing bounces'); });
  noCrit(()=>{ const F=mk({formation:'rubberstamp'}),b=F.foes.find(f=>f.id==='rubberstamp'); ok(b.st.ink_pad,'the Rubber Stamp starts braced on the ink pad'); });

  // 8. The Courier: Wall Perch and the cadence
  noCrit(()=>{ const F=mk({formation:'mailcourier'}),c=F.foes.find(f=>f.id==='mailcourier'),d=F.foes.find(f=>f.id==='deadletter');
    ok(c.row==='back'&&d.row==='front'&&effRow(F,c)==='back','the Courier starts in Back behind the Dead Letter');
    d.hp=0; ok(effRow(F,c)==='back'&&effRow(F,F.party[0])==='front','with no monster left in Front the Courier still counts as Back (Wall Perch)');
    const F2=mk({formation:'mailcourier'}),c2=F2.foes.find(f=>f.id==='mailcourier'); F2.foes.find(f=>f.id==='deadletter').hp=0;
    const ids=[],rows=[],eva=[]; for(let i=0;i<7;i++) { F2.acting=c2; const q=pick(F2,c2,true); ids.push(q.act.id+(q.fire?'!':'')); foeTurn(F2,c2); rows.push(c2.row); eva.push(!!c2.st.whoosh_eva); }
    ok(J(ids)===J(['sorting_claw_ricochet','hot_steam_vent','special_delivery_slam','special_delivery_slam!','pneumatic_whoosh','sorting_claw_ricochet','hot_steam_vent']),'cadence: Ricochet, Vent, Slam (wound up), Slam (fired), Whoosh, then round again (found '+ids.join(', ')+')');
    ok(J(rows.slice(2,5))===J(['back','front','back']),'the Slam lands it in Front and the Whoosh swaps it back (rows after turns 3 to 5: '+rows.slice(2,5).join(', ')+')');
    ok(eva[4],'the Whoosh puts +20% Evasion on the Courier'); });
  { const F=mk({formation:'mailcourier'}),c=F.foes.find(f=>f.id==='mailcourier'),A=id=>c.D.acts.find(a=>a.id===id);
    ok(actOk(F,c,A('special_delivery_slam'))&&!actOk(F,c,A('pneumatic_whoosh')),'from the Back the Slam is allowed and the Whoosh is not');
    c.row='front'; ok(!actOk(F,c,A('special_delivery_slam'))&&actOk(F,c,A('pneumatic_whoosh')),'from the Front the Whoosh is allowed and the Slam is not'); }
  noCrit(()=>{ const F=mk({formation:'mailcourier'}),c=F.foes.find(f=>f.id==='mailcourier'),t=tomOf(F); c.pips=1; go(F,t,'t19_dr',c.key);
    ok(c.broken&&c.row==='front','a Break pins the Courier in Front (pips '+c.pips+', row '+c.row+')'); });

  // 9. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2.
  // Targets (bestiary 1.6): a boss with a helper lasts 5 to 7 rounds (aim 6); an Elite alone about 3; the Courier fight is the bestiary's own 6.8 (an Elite in front of a mini-boss).
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  delete SK.t19_sz; delete SK.t19_rz; delete SK.t19_dr; delete SK.t19_sr; delete SK.t19_sl;   // the sandbox rows come out again, so the simple player never picks them
  for(const [id,name,lo,hi] of [['new94','the Dead Letter',2,4],['new95','the Rubber Stamp',2,4],['new96','the Courier fight',5,8],['new97','the Censor',5,7]]) {
    const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab(id),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=lo&&avg<=hi,name+': won every time in '+avg.toFixed(2)+' rounds on average (target '+lo+' to '+hi+')'); }
};
